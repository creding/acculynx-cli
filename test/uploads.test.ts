import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  mintUploadTicket,
  verifyUploadTicket,
  handleUploadRequest,
  UPLOAD_MAX_BYTES,
  __resetConsumedForTests,
} from "../src/mcp/uploads.ts";

const KEY = "test-signing-secret";
const FIELDS = {
  jobId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  documentFolderId: "b1a85f64-5717-4562-b3fc-2c963f66afa6",
  fileName: "McPherson Supplement 1.pdf",
  description: "supplement",
};

// ---- ticket mint/verify ----

test("minted ticket verifies and carries all bound fields", () => {
  const ticket = mintUploadTicket(FIELDS, KEY);
  const v = verifyUploadTicket(ticket, KEY);
  assert.equal(v.ok, true);
  if (v.ok) {
    assert.equal(v.fields.jobId, FIELDS.jobId);
    assert.equal(v.fields.documentFolderId, FIELDS.documentFolderId);
    assert.equal(v.fields.fileName, FIELDS.fileName);
    assert.equal(v.fields.description, FIELDS.description);
  }
});

test("tampered ticket is rejected as invalid", () => {
  const ticket = mintUploadTicket(FIELDS, KEY);
  const [body, sig] = ticket.split(".");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  payload.jobId = "00000000-0000-0000-0000-000000000000"; // retarget attempt
  const forged = Buffer.from(JSON.stringify(payload)).toString("base64url") + "." + sig;
  const v = verifyUploadTicket(forged, KEY);
  assert.deepEqual(v, { ok: false, reason: "invalid" });
});

test("wrong key is rejected as invalid", () => {
  const ticket = mintUploadTicket(FIELDS, KEY);
  assert.deepEqual(verifyUploadTicket(ticket, "other-key"), { ok: false, reason: "invalid" });
});

test("expired ticket is rejected as expired", () => {
  const ticket = mintUploadTicket(FIELDS, KEY, { ttlS: -1 });
  const v = verifyUploadTicket(ticket, KEY);
  assert.deepEqual(v, { ok: false, reason: "expired" });
});

test("two mints produce distinct nonces", () => {
  const a = mintUploadTicket(FIELDS, KEY);
  const b = mintUploadTicket(FIELDS, KEY);
  assert.notEqual(a, b);
});

// ---- "documents request-upload" registry command ----

test("documents request-upload mints a URL bound to its inputs", async (t) => {
  process.env.SIGNING_SECRET = KEY;
  t.after(() => delete process.env.SIGNING_SECRET);
  const { default: requestUpload } = await import("../src/commands/acculynx_request_document_upload.ts");
  const payload = (await requestUpload.call(null, { ...FIELDS }, { baseUrl: "https://example.test" })) as Record<
    string,
    unknown
  >;
  assert.match(String(payload.uploadUrl), /^https:\/\/example\.test\/api\/uploads\//);
  assert.equal(payload.method, "PUT");
  assert.equal(payload.maxBytes, UPLOAD_MAX_BYTES);
  assert.match(String(payload.curlExample), /--data-binary/);
  const ticket = decodeURIComponent(String(payload.uploadUrl).split("/api/uploads/")[1]);
  const v = verifyUploadTicket(ticket, KEY);
  assert.equal(v.ok && v.fields.fileName, FIELDS.fileName);
  assert.equal(v.ok && v.fields.jobId, FIELDS.jobId);
});

test("documents request-upload without SIGNING_SECRET explains itself", async () => {
  delete process.env.SIGNING_SECRET;
  const { default: requestUpload } = await import("../src/commands/acculynx_request_document_upload.ts");
  await assert.rejects(() => requestUpload.call(null, { ...FIELDS }, {}), /hosted MCP server|SIGNING_SECRET/i);
});

// ---- PUT handler (fake forwarder; no AccuLynx network) ----

const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(200, 7)]);

function startServer(forward: (args: unknown) => Promise<{ status: number }>) {
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      (req as http.IncomingMessage & { body?: unknown }).body = Buffer.concat(chunks);
      void handleUploadRequest(req, res, { signingSecret: KEY, forward });
    });
  });
  return new Promise<{ base: string; server: http.Server }>((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({ base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, server }),
    ),
  );
}

async function put(base: string, ticket: string, body: Buffer | null, headers: Record<string, string> = {}) {
  const res = await fetch(`${base}/api/uploads/${ticket}`, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream", ...headers },
    ...(body ? { body: new Uint8Array(body) } : {}),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

test("valid PUT forwards to AccuLynx and returns a sha256 receipt", async () => {
  __resetConsumedForTests();
  let forwarded: any = null;
  const { base, server } = await startServer(async (args) => {
    forwarded = args;
    return { status: 202 };
  });
  try {
    const ticket = mintUploadTicket(FIELDS, KEY);
    const r = await put(base, ticket, PDF);
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    assert.equal(r.json.bytes, PDF.length);
    assert.equal(r.json.sha256, createHash("sha256").update(PDF).digest("hex"));
    assert.equal(r.json.fileName, FIELDS.fileName);
    assert.equal(r.json.jobId, FIELDS.jobId);
    assert.equal(r.json.acculynxStatus, 202);
    assert.equal(forwarded.fileName, FIELDS.fileName);
    assert.equal(forwarded.jobId, FIELDS.jobId);
    assert.deepEqual(forwarded.data, PDF);
  } finally {
    server.close();
  }
});

test("consumed ticket returns 409 and does not forward again", async () => {
  __resetConsumedForTests();
  let calls = 0;
  const { base, server } = await startServer(async () => {
    calls++;
    return { status: 202 };
  });
  try {
    const ticket = mintUploadTicket(FIELDS, KEY);
    assert.equal((await put(base, ticket, PDF)).status, 200);
    const second = await put(base, ticket, PDF);
    assert.equal(second.status, 409);
    assert.match(String(second.json.error), /do not retry/i);
    assert.equal(calls, 1);
  } finally {
    server.close();
  }
});

test("tampered ticket returns 403, expired returns 410", async () => {
  __resetConsumedForTests();
  const { base, server } = await startServer(async () => ({ status: 202 }));
  try {
    assert.equal((await put(base, "not-a-ticket", PDF)).status, 403);
    const expired = mintUploadTicket(FIELDS, KEY, { ttlS: -1 });
    assert.equal((await put(base, expired, PDF)).status, 410);
  } finally {
    server.close();
  }
});

test("oversize body returns 413 without forwarding", async () => {
  __resetConsumedForTests();
  let calls = 0;
  const { base, server } = await startServer(async () => {
    calls++;
    return { status: 202 };
  });
  try {
    const ticket = mintUploadTicket(FIELDS, KEY);
    const big = Buffer.alloc(UPLOAD_MAX_BYTES + 1);
    const r = await put(base, ticket, big);
    assert.equal(r.status, 413);
    assert.equal(calls, 0);
  } finally {
    server.close();
  }
});

test("empty body returns 400", async () => {
  __resetConsumedForTests();
  const { base, server } = await startServer(async () => ({ status: 202 }));
  try {
    const ticket = mintUploadTicket(FIELDS, KEY);
    const r = await put(base, ticket, Buffer.alloc(0));
    assert.equal(r.status, 400);
  } finally {
    server.close();
  }
});

test("AccuLynx failure returns 502 and leaves the ticket unconsumed for one retry", async () => {
  __resetConsumedForTests();
  let calls = 0;
  const { base, server } = await startServer(async () => {
    calls++;
    if (calls === 1) throw new Error("AccuLynx API Error (500): communications issue");
    return { status: 202 };
  });
  try {
    const ticket = mintUploadTicket(FIELDS, KEY);
    const first = await put(base, ticket, PDF);
    assert.equal(first.status, 502);
    // Forward failed before AccuLynx accepted, so retrying the same ticket is safe.
    const second = await put(base, ticket, PDF);
    assert.equal(second.status, 200);
  } finally {
    server.close();
  }
});
