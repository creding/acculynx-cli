import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  signBlob,
  verifyBlob,
  pkceMatches,
  issueClientId,
  issueCode,
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  oauthHandler,
} from "../src/mcp/oauth.ts";

const SIGNING_SECRET = "test-signing-secret-with-plenty-of-entropy";
const LOGIN_SECRET = "test-login-passphrase";
const CALLBACK = "https://claude.ai/api/mcp/auth_callback";

process.env.SIGNING_SECRET = SIGNING_SECRET;
process.env.OAUTH_LOGIN_SECRET = LOGIN_SECRET;

// ---------- primitives ----------

test("signBlob/verifyBlob round-trips a payload", () => {
  const blob = signBlob({ t: "x", hello: "world" }, SIGNING_SECRET);
  const payload = verifyBlob(blob, SIGNING_SECRET);
  assert.deepEqual(payload, { t: "x", hello: "world" });
});

test("verifyBlob rejects a tampered payload", () => {
  const blob = signBlob({ t: "x", n: 1 }, SIGNING_SECRET);
  const [, mac] = blob.split(".");
  const forged = Buffer.from(JSON.stringify({ t: "x", n: 2 })).toString("base64url") + "." + mac;
  assert.equal(verifyBlob(forged, SIGNING_SECRET), null);
});

test("verifyBlob rejects a blob signed with a different key", () => {
  const blob = signBlob({ t: "x" }, "other-key");
  assert.equal(verifyBlob(blob, SIGNING_SECRET), null);
});

test("verifyBlob rejects garbage without throwing", () => {
  assert.equal(verifyBlob("not-a-blob", SIGNING_SECRET), null);
  assert.equal(verifyBlob("", SIGNING_SECRET), null);
  assert.equal(verifyBlob("a.b.c", SIGNING_SECRET), null);
});

test("pkceMatches accepts a correct S256 verifier and rejects a wrong one", () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  assert.equal(pkceMatches(verifier, challenge), true);
  assert.equal(pkceMatches(verifier + "x", challenge), false);
});

// ---------- token issuance ----------

test("access token verifies and carries the audience", () => {
  const token = issueAccessToken(SIGNING_SECRET);
  assert.equal(verifyAccessToken(token, SIGNING_SECRET), true);
});

test("expired access token is rejected", () => {
  const token = issueAccessToken(SIGNING_SECRET, -10); // expired 10s ago
  assert.equal(verifyAccessToken(token, SIGNING_SECRET), false);
});

test("refresh token is not accepted as an access token", () => {
  const refresh = issueRefreshToken(SIGNING_SECRET, "cid");
  assert.equal(verifyAccessToken(refresh, SIGNING_SECRET), false);
});

// ---------- HTTP flow (real server around the real handler) ----------

let base = "";
let server: http.Server;

before(async () => {
  server = http.createServer((req, res) => {
    void oauthHandler(req, res).then((handled) => {
      if (!handled) {
        res.statusCode = 404;
        res.end("unhandled");
      }
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => server.close());

test("protected-resource metadata points at the authorization server", async () => {
  const res = await fetch(`${base}/.well-known/oauth-protected-resource`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as { resource: string; authorization_servers: string[] };
  assert.equal(body.authorization_servers.length, 1);
  assert.ok(body.resource.length > 0);
});

test("authorization-server metadata advertises PKCE and the endpoints", async () => {
  const res = await fetch(`${base}/.well-known/oauth-authorization-server`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as Record<string, unknown>;
  assert.deepEqual(body.code_challenge_methods_supported, ["S256"]);
  assert.ok(String(body.authorization_endpoint).endsWith("/authorize"));
  assert.ok(String(body.token_endpoint).endsWith("/token"));
  assert.ok(String(body.registration_endpoint).endsWith("/register"));
});

test("dynamic client registration returns a verifiable client_id", async () => {
  const res = await fetch(`${base}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: [CALLBACK], client_name: "claude" }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { client_id: string; token_endpoint_auth_method: string };
  assert.equal(body.token_endpoint_auth_method, "none");
  const payload = verifyBlob(body.client_id, SIGNING_SECRET) as { t: string; ru: string[] };
  assert.equal(payload.t, "client");
  assert.deepEqual(payload.ru, [CALLBACK]);
});

test("registration rejects non-https redirect uris", async () => {
  const res = await fetch(`${base}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: ["http://evil.example/cb"] }),
  });
  assert.equal(res.status, 400);
});

test("authorize GET renders a consent form carrying the request params", async () => {
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const url = new URL(`${base}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", cid);
  url.searchParams.set("redirect_uri", CALLBACK);
  url.searchParams.set("code_challenge", "abc");
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", "xyz");
  const res = await fetch(url);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /passphrase/i);
  assert.match(html, /xyz/); // state survives into the form
});

test("authorize POST with wrong passphrase does not redirect with a code", async () => {
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const form = new URLSearchParams({
    client_id: cid,
    redirect_uri: CALLBACK,
    code_challenge: "abc",
    code_challenge_method: "S256",
    state: "xyz",
    passphrase: "wrong",
  });
  const res = await fetch(`${base}/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    redirect: "manual",
  });
  assert.notEqual(res.status, 302);
});

test("authorize POST rejects a redirect_uri the client did not register", async () => {
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const form = new URLSearchParams({
    client_id: cid,
    redirect_uri: "https://attacker.example/cb",
    code_challenge: "abc",
    code_challenge_method: "S256",
    passphrase: LOGIN_SECRET,
  });
  const res = await fetch(`${base}/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    redirect: "manual",
  });
  assert.notEqual(res.status, 302);
});

test("full code + PKCE exchange yields a working access token", async () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);

  const form = new URLSearchParams({
    client_id: cid,
    redirect_uri: CALLBACK,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: "st8",
    passphrase: LOGIN_SECRET,
  });
  const authz = await fetch(`${base}/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    redirect: "manual",
  });
  assert.equal(authz.status, 302);
  const location = new URL(authz.headers.get("location")!);
  assert.equal(location.origin + location.pathname, CALLBACK);
  assert.equal(location.searchParams.get("state"), "st8");
  const code = location.searchParams.get("code")!;
  assert.ok(code);

  const tokenRes = await fetch(`${base}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: CALLBACK,
      client_id: cid,
    }),
  });
  assert.equal(tokenRes.status, 200);
  const tok = (await tokenRes.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
  assert.equal(tok.token_type, "Bearer");
  assert.equal(verifyAccessToken(tok.access_token, SIGNING_SECRET), true);
  assert.ok(tok.refresh_token);

  // refresh grant works too
  const refreshRes = await fetch(`${base}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tok.refresh_token,
      client_id: cid,
    }),
  });
  assert.equal(refreshRes.status, 200);
  const refreshed = (await refreshRes.json()) as { access_token: string };
  assert.equal(verifyAccessToken(refreshed.access_token, SIGNING_SECRET), true);
});

test("token exchange rejects a wrong PKCE verifier", async () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const code = issueCode(SIGNING_SECRET, { cid, ru: CALLBACK, cc: challenge });

  const res = await fetch(`${base}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: "not-the-verifier",
      redirect_uri: CALLBACK,
      client_id: cid,
    }),
  });
  assert.equal(res.status, 400);
});

test("token exchange rejects an expired code", async () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const code = issueCode(SIGNING_SECRET, { cid, ru: CALLBACK, cc: challenge }, -10);

  const res = await fetch(`${base}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: CALLBACK,
      client_id: cid,
    }),
  });
  assert.equal(res.status, 400);
});

test("oauthHandler leaves unrelated routes untouched", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 404); // our test server 404s anything oauthHandler declines
});

// ---------- Vercel helper compatibility ----------
// With shouldAddHelpers, Vercel consumes the request stream and provides the
// parsed body on req.body. The handlers must use it instead of re-reading.

import { Readable } from "node:stream";

function fakeReqRes(opts: { method: string; url: string; contentType: string; body: unknown }) {
  const req = Readable.from([]) as unknown as http.IncomingMessage & { body?: unknown };
  req.method = opts.method;
  req.url = opts.url;
  req.headers = { "content-type": opts.contentType, host: "example.test" };
  req.body = opts.body;
  const out: { status?: number; chunks: string[]; headers: Record<string, string> } = { chunks: [], headers: {} };
  const res = {
    statusCode: 200,
    headersSent: false,
    setHeader(k: string, v: string) {
      out.headers[k.toLowerCase()] = v;
    },
    end(chunk?: string) {
      out.status = this.statusCode;
      if (chunk) out.chunks.push(chunk);
    },
  } as unknown as http.ServerResponse;
  return { req, res, out };
}

test("register accepts a Vercel-pre-parsed JSON body", async () => {
  const { req, res, out } = fakeReqRes({
    method: "POST",
    url: "/register",
    contentType: "application/json",
    body: { redirect_uris: [CALLBACK] },
  });
  await oauthHandler(req, res);
  assert.equal(out.status, 201);
  const parsed = JSON.parse(out.chunks.join("")) as { client_id: string };
  assert.ok(verifyBlob(parsed.client_id, SIGNING_SECRET));
});

test("token accepts a Vercel-pre-parsed form body", async () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const cid = issueClientId(SIGNING_SECRET, [CALLBACK]);
  const code = issueCode(SIGNING_SECRET, { cid, ru: CALLBACK, cc: challenge });
  const { req, res, out } = fakeReqRes({
    method: "POST",
    url: "/token",
    contentType: "application/x-www-form-urlencoded",
    body: { grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: CALLBACK, client_id: cid },
  });
  await oauthHandler(req, res);
  assert.equal(out.status, 200);
  const tok = JSON.parse(out.chunks.join("")) as { access_token: string };
  assert.equal(verifyAccessToken(tok.access_token, SIGNING_SECRET), true);
});
