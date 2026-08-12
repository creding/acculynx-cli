/**
 * Local smoke test for the MCP HTTP endpoint.
 *
 * Boots the bundled handler behind a plain node server (mimicking Vercel's
 * body-parsing) and drives a real MCP session over Streamable HTTP.
 * Run: node test/mcp-local.mjs
 */
import http from "node:http";
import handler from "../api/mcp.js";

const TOKEN = "test-token-abc123";
process.env.MCP_AUTH_TOKEN = TOKEN;
process.env.SIGNING_SECRET = process.env.SIGNING_SECRET || "local-test-signing-secret";
process.env.ACCULYNX_API_KEY = process.env.ACCULYNX_API_KEY || "dummy-key-for-local-test";

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    // Vercel's Node runtime pre-parses JSON bodies; mirror that.
    if (raw) {
      try {
        req.body = JSON.parse(raw);
      } catch {
        req.body = raw;
      }
    }
    handler(req, res).catch((e) => {
      console.error("handler threw:", e);
      if (!res.headersSent) res.statusCode = 500;
      res.end();
    });
  });
});

await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

let id = 0;
async function rpc(method, params, { token = TOKEN } = {}) {
  const res = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const text = await res.text();
  if (!res.ok) return { status: res.status, body: text.slice(0, 200) };
  // Streamable HTTP replies as SSE; pull the data frame out.
  const line = text.split("\n").find((l) => l.startsWith("data:"));
  const payload = line ? JSON.parse(line.slice(5).trim()) : JSON.parse(text);
  return { status: res.status, payload };
}

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

// 1. unauthenticated is rejected
{
  const r = await rpc("initialize", {}, { token: null });
  check("rejects missing token", r.status === 401, `status ${r.status}`);
}
// 2. wrong token is rejected
{
  const r = await rpc("initialize", {}, { token: "wrong-token-abc123" });
  check("rejects wrong token", r.status === 401, `status ${r.status}`);
}
// 3. initialize handshake
{
  const r = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "smoke", version: "0" },
  });
  const info = r.payload?.result?.serverInfo;
  const instr = r.payload?.result?.instructions || "";
  check("initialize handshake", info?.name === "acculynx", `serverInfo=${JSON.stringify(info)}`);
  check("ships instructions", instr.length > 500, `${instr.length} chars`);
}
// 4. tools/list
{
  const r = await rpc("tools/list", {});
  const names = (r.payload?.result?.tools ?? []).map((t) => t.name).sort();
  check(
    "exposes the 3 meta-tools plus request_upload",
    names.length === 4 &&
      names.join(",") === "acculynx_describe,acculynx_request_upload,acculynx_run,acculynx_search",
    names.join(","),
  );
}
// 5. search
{
  const r = await rpc("tools/call", { name: "acculynx_search", arguments: { query: "payment" } });
  const text = r.payload?.result?.content?.[0]?.text ?? "";
  const parsed = JSON.parse(text);
  check("search finds payment commands", parsed.matches?.length > 0, `${parsed.matches?.length} matches`);
}
// 6. search with no query lists everything
{
  const r = await rpc("tools/call", { name: "acculynx_search", arguments: {} });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check("empty search lists all commands", parsed.commands?.length >= 120, `${parsed.commands?.length} commands`);
}
// 7. describe
{
  const r = await rpc("tools/call", { name: "acculynx_describe", arguments: { command: "jobs get" } });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check(
    "describe returns schema + example",
    parsed.schema?.properties?.jobId && parsed.example?.includes("jobs get"),
    parsed.example,
  );
}
// 8. describe tolerates "acculynx jobs get" and "jobs.get"
{
  const a = await rpc("tools/call", { name: "acculynx_describe", arguments: { command: "acculynx jobs get" } });
  const b = await rpc("tools/call", { name: "acculynx_describe", arguments: { command: "jobs.get" } });
  const ta = JSON.parse(a.payload?.result?.content?.[0]?.text ?? "{}");
  const tb = JSON.parse(b.payload?.result?.content?.[0]?.text ?? "{}");
  check("accepts command name variants", ta.command === "acculynx jobs get" && tb.command === "acculynx jobs get");
}
// 9. unknown command gives a useful error
{
  const r = await rpc("tools/call", { name: "acculynx_describe", arguments: { command: "jobs frobnicate" } });
  const isErr = r.payload?.result?.isError === true;
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check("unknown command errors with suggestion", isErr && !!parsed.error?.suggestion, parsed.error?.suggestion);
}
// 10. validation failure replays the schema
{
  const r = await rpc("tools/call", { name: "acculynx_run", arguments: { command: "jobs get", input: {} } });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check(
    "missing required input returns schema replay",
    r.payload?.result?.isError === true && Array.isArray(parsed.error?.issues) && !!parsed.error?.schema,
    JSON.stringify(parsed.error?.issues),
  );
}
// 11. bad UUID is caught before any network call
{
  const r = await rpc("tools/call", {
    name: "acculynx_run",
    arguments: { command: "jobs get", input: { jobId: "not-a-uuid" } },
  });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check("invalid uuid rejected locally", r.payload?.result?.isError === true, JSON.stringify(parsed.error?.issues));
}
// 12. PDF report commands are refused with a pointer
{
  const r = await rpc("tools/call", {
    name: "acculynx_run",
    arguments: { command: "reports coc", input: { jobId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" } },
  });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check(
    "PDF report commands refused cleanly",
    r.payload?.result?.isError === true && /not available over MCP/.test(parsed.error?.message ?? ""),
    parsed.error?.message,
  );
}
// 13. a real read attempt reaches the network boundary. Environment-agnostic:
// with real egress the ping simply succeeds; in an egress-blocked sandbox it
// surfaces a network/auth-shaped error. Both prove the request left local
// validation and reached the AccuLynx call — only a local validation error
// (issues) or routing error (suggestion) means the plumbing is broken.
{
  const r = await rpc("tools/call", {
    name: "acculynx_run",
    arguments: { command: "misc ping", input: {} },
  });
  const isError = r.payload?.result?.isError === true;
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  const msg = parsed.error?.message ?? "";
  const networkShaped =
    /Forbidden|fetch failed|host_not_allowed|401|403|ECONN|ETIMEDOUT|EAI_AGAIN|network|timeout|socket|abort/i.test(msg) &&
    !parsed.error?.issues &&
    !parsed.error?.suggestion;
  const reachedNetwork = isError ? networkShaped : true;
  check(
    "run reaches the AccuLynx call (succeeds, or network-blocked)",
    reachedNetwork,
    isError ? msg.slice(0, 120) : `ping ok — ${JSON.stringify(parsed).slice(0, 80)}`,
  );
}

// 14. the registry command form mints the same ticket through acculynx_run
{
  const r = await rpc("tools/call", {
    name: "acculynx_run",
    arguments: {
      command: "documents request-upload",
      input: {
        jobId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        documentFolderId: "b1a85f64-5717-4562-b3fc-2c963f66afa6",
        fileName: "smoke-probe.pdf",
      },
    },
  });
  const parsed = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  check(
    "documents request-upload runs as a registry command",
    typeof parsed.uploadUrl === "string" && parsed.uploadUrl.includes("/api/uploads/"),
    parsed.uploadUrl?.slice(0, 60) ?? JSON.stringify(parsed).slice(0, 120),
  );
}
// 15. direct upload: mint a ticket, PUT raw bytes, verify ticket semantics.
// With a dummy API key the forward is rejected by AccuLynx (502); with a real
// key it lands (200 receipt). Both prove the route end to end.
{
  const r = await rpc("tools/call", {
    name: "acculynx_request_upload",
    arguments: {
      jobId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      documentFolderId: "b1a85f64-5717-4562-b3fc-2c963f66afa6",
      fileName: "smoke-probe.pdf",
    },
  });
  const minted = JSON.parse(r.payload?.result?.content?.[0]?.text ?? "{}");
  const urlOk = typeof minted.uploadUrl === "string" && minted.uploadUrl.includes("/api/uploads/");
  check("request_upload mints a PUT url", urlOk, minted.uploadUrl?.slice(0, 60));

  if (urlOk) {
    const bytes = Buffer.from("%PDF-1.4\nsmoke probe not a real document\n");
    const putRes = await fetch(minted.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });
    const receipt = await putRes.json().catch(() => ({}));
    check(
      "PUT reaches the forwarder (receipt or AccuLynx rejection)",
      putRes.status === 200 || putRes.status === 502,
      `status ${putRes.status} ${JSON.stringify(receipt).slice(0, 80)}`,
    );

    const forgedRes = await fetch(minted.uploadUrl.slice(0, -6) + "tamper", {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });
    check("tampered ticket rejected with 403", forgedRes.status === 403, `status ${forgedRes.status}`);
  }
}

server.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
