import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

const STATIC_TOKEN = "static-test-token";
const SIGNING_SECRET = "entry-test-signing-secret";
process.env.MCP_AUTH_TOKEN = STATIC_TOKEN;
process.env.SIGNING_SECRET = SIGNING_SECRET;
process.env.OAUTH_LOGIN_SECRET = "entry-test-login";

const { default: handler } = await import("../src/mcp/http-entry.ts");
const { issueAccessToken } = await import("../src/mcp/oauth.ts");

let base = "";
let server: http.Server;

before(async () => {
  server = http.createServer((req, res) => void handler(req, res));
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => server.close());

const INITIALIZE = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } },
});

function post(token?: string): Promise<Response> {
  return fetch(base + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: INITIALIZE,
  });
}

test("401 advertises the protected-resource metadata for OAuth discovery", async () => {
  const res = await post();
  assert.equal(res.status, 401);
  const header = res.headers.get("www-authenticate") ?? "";
  assert.match(header, /resource_metadata="[^"]*\/\.well-known\/oauth-protected-resource"/);
});

test("oauth discovery routes are served through the main handler", async () => {
  const res = await fetch(base + "/.well-known/oauth-protected-resource");
  assert.equal(res.status, 200);
  const body = (await res.json()) as { authorization_servers: string[] };
  assert.equal(body.authorization_servers.length, 1);
});

test("static bearer token still authorizes MCP requests", async () => {
  const res = await post(STATIC_TOKEN);
  assert.equal(res.status, 200);
});

test("a signed OAuth access token authorizes MCP requests", async () => {
  const res = await post(issueAccessToken(SIGNING_SECRET));
  assert.equal(res.status, 200);
});

test("an expired OAuth access token is rejected", async () => {
  const res = await post(issueAccessToken(SIGNING_SECRET, -5));
  assert.equal(res.status, 401);
});

test("garbage bearer tokens are rejected", async () => {
  const res = await post("garbage.token");
  assert.equal(res.status, 401);
});

test("health stays unauthenticated", async () => {
  const res = await fetch(base + "/health");
  assert.equal(res.status, 200);
});
