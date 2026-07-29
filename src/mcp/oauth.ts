import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Self-issued OAuth 2.1 for the hosted MCP endpoint — authorization server and
 * resource server in one stateless function.
 *
 * Every artifact (client_id, authorization code, access/refresh token) is an
 * HMAC-signed blob: base64url(payload JSON) + "." + base64url(HMAC-SHA256).
 * Nothing is stored server-side; the signature is the record. Revocation is
 * rotating SIGNING_SECRET, which invalidates everything at once — acceptable
 * for a single-user connector, wrong for a multi-tenant one.
 *
 * The consent page authenticates the user with OAUTH_LOGIN_SECRET. There is no
 * rate limiting (serverless has no shared state), so that secret must be
 * high-entropy randomness, never a memorable password.
 */

const ACCESS_TTL_S = 60 * 60; // 1 hour; claude.ai refreshes automatically
const REFRESH_TTL_S = 30 * 24 * 60 * 60; // 30 days
const CODE_TTL_S = 5 * 60;
const AUDIENCE = "acculynx-mcp";
const MAX_BODY_BYTES = 100_000;

// ---------- signed-blob primitives ----------

function mac(data: string, key: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

export function signBlob(payload: Record<string, unknown>, key: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + mac(body, key).toString("base64url");
}

export function verifyBlob(blob: string, key: string): Record<string, unknown> | null {
  const parts = blob.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expected = mac(body, key);
  if (given.length !== expected.length) {
    timingSafeEqual(expected, expected); // burn a comparison anyway
    return null;
  }
  if (!timingSafeEqual(given, expected)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function textMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function pkceMatches(verifier: string, challenge: string): boolean {
  const computed = createHash("sha256").update(verifier).digest("base64url");
  return textMatches(computed, challenge);
}

function nowS(): number {
  return Math.floor(Date.now() / 1000);
}

// ---------- artifact issuance ----------

export function issueClientId(key: string, redirectUris: string[]): string {
  return signBlob({ t: "client", ru: redirectUris, iat: nowS() }, key);
}

export function issueCode(key: string, data: { cid: string; ru: string; cc: string }, ttlS = CODE_TTL_S): string {
  // The client_id is itself a signed blob; hash it so the code stays small.
  const cidHash = createHash("sha256").update(data.cid).digest("base64url");
  return signBlob({ t: "code", cid: cidHash, ru: data.ru, cc: data.cc, exp: nowS() + ttlS }, key);
}

export function issueAccessToken(key: string, ttlS = ACCESS_TTL_S): string {
  return signBlob({ t: "access", aud: AUDIENCE, exp: nowS() + ttlS }, key);
}

export function issueRefreshToken(key: string, clientId: string, ttlS = REFRESH_TTL_S): string {
  const cidHash = createHash("sha256").update(clientId).digest("base64url");
  return signBlob({ t: "refresh", cid: cidHash, exp: nowS() + ttlS }, key);
}

export function verifyAccessToken(token: string, key: string): boolean {
  const p = verifyBlob(token, key);
  if (!p) return false;
  return p.t === "access" && p.aud === AUDIENCE && typeof p.exp === "number" && p.exp > nowS();
}

// ---------- HTTP plumbing ----------

function requestOrigin(req: IncomingMessage): string {
  const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim() || "http";
  const host = (req.headers["x-forwarded-host"] as string | undefined) || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<string> {
  // Vercel's shouldAddHelpers consumes the stream and parses the body onto
  // req.body (object for JSON and form content-types). Re-serialize to the
  // wire format the individual handlers expect.
  const pre = req.body;
  if (pre !== undefined && pre !== null) {
    if (typeof pre === "string") return pre;
    if (Buffer.isBuffer(pre)) return pre.toString("utf8");
    const contentType = String(req.headers["content-type"] ?? "");
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(pre as Record<string, unknown>)) params.set(k, String(v));
      return params.toString();
    }
    return JSON.stringify(pre);
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error("body too large");
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function sendHtml(res: ServerResponse, status: number, html: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isAllowedRedirect(uri: string): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return true;
}

// ---------- consent page ----------

function consentPage(params: Record<string, string>, error?: string): string {
  const hidden = ["response_type", "client_id", "redirect_uri", "code_challenge", "code_challenge_method", "state", "scope", "resource"]
    .filter((k) => params[k])
    .map((k) => `<input type="hidden" name="${k}" value="${escapeHtml(params[k])}">`)
    .join("\n      ");
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>AccuLynx MCP — authorize</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #191917; color: #eee; }
  form { background: #22221f; padding: 2rem 2.5rem; border-radius: 12px; max-width: 22rem; }
  h1 { font-size: 1.1rem; margin: 0 0 .5rem; }
  p { color: #aaa; font-size: .85rem; margin: 0 0 1.25rem; }
  input[type=password] { width: 100%; box-sizing: border-box; padding: .6rem .7rem; border-radius: 8px; border: 1px solid #444; background: #191917; color: #eee; font-size: 1rem; }
  button { margin-top: 1rem; width: 100%; padding: .6rem; border-radius: 8px; border: 0; background: #c96442; color: #fff; font-size: 1rem; cursor: pointer; }
  .err { color: #e66; font-size: .85rem; margin-top: .75rem; }
</style></head>
<body>
  <form method="POST" action="/authorize">
      ${hidden}
      <h1>Authorize access to AccuLynx</h1>
      <p>This grants the connecting Claude client full access to the AccuLynx MCP server. Enter the connector passphrase to approve.</p>
      <input type="password" name="passphrase" placeholder="Connector passphrase" autofocus autocomplete="off">
      <button type="submit">Approve</button>
      ${error ? `<div class="err">${escapeHtml(error)}</div>` : ""}
  </form>
</body></html>`;
}

// ---------- route handlers ----------

function handleProtectedResourceMetadata(req: IncomingMessage, res: ServerResponse): void {
  const origin = requestOrigin(req);
  sendJson(res, 200, {
    resource: origin,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
  });
}

function handleAuthServerMetadata(req: IncomingMessage, res: ServerResponse): void {
  const origin = requestOrigin(req);
  sendJson(res, 200, {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  });
}

async function handleRegister(req: IncomingMessage, res: ServerResponse, key: string): Promise<void> {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await readBody(req)) as Record<string, unknown>;
  } catch {
    return sendJson(res, 400, { error: "invalid_client_metadata" });
  }
  const uris = body.redirect_uris;
  if (!Array.isArray(uris) || uris.length === 0 || !uris.every((u) => typeof u === "string" && isAllowedRedirect(u))) {
    return sendJson(res, 400, { error: "invalid_redirect_uri", error_description: "redirect_uris must be non-empty https URLs." });
  }
  sendJson(res, 201, {
    client_id: issueClientId(key, uris as string[]),
    redirect_uris: uris,
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    ...(typeof body.client_name === "string" ? { client_name: body.client_name } : {}),
  });
}

function handleAuthorizeGet(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? "/", "http://placeholder");
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (params[k] = v));
  sendHtml(res, 200, consentPage(params));
}

async function handleAuthorizePost(req: IncomingMessage, res: ServerResponse, key: string, loginSecret: string): Promise<void> {
  const form = new URLSearchParams(await readBody(req));
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = v));

  const clientPayload = params.client_id ? verifyBlob(params.client_id, key) : null;
  const registered = clientPayload?.t === "client" && Array.isArray(clientPayload.ru) ? (clientPayload.ru as string[]) : null;
  const redirectOk =
    !!registered && !!params.redirect_uri && registered.includes(params.redirect_uri) && isAllowedRedirect(params.redirect_uri);
  const challengeOk = !!params.code_challenge && (params.code_challenge_method ?? "S256") === "S256";

  if (!redirectOk || !challengeOk) {
    // Never redirect on an invalid client/redirect pair — that is how codes get exfiltrated.
    return sendHtml(res, 400, consentPage(params, "Invalid authorization request."));
  }
  if (!params.passphrase || !textMatches(params.passphrase, loginSecret)) {
    return sendHtml(res, 401, consentPage(params, "Wrong passphrase."));
  }

  const code = issueCode(key, { cid: params.client_id, ru: params.redirect_uri, cc: params.code_challenge });
  const target = new URL(params.redirect_uri);
  target.searchParams.set("code", code);
  if (params.state) target.searchParams.set("state", params.state);
  res.statusCode = 302;
  res.setHeader("Location", target.toString());
  res.end();
}

async function handleToken(req: IncomingMessage, res: ServerResponse, key: string): Promise<void> {
  const form = new URLSearchParams(await readBody(req));
  const grant = form.get("grant_type");

  if (grant === "authorization_code") {
    const code = form.get("code") ?? "";
    const verifier = form.get("code_verifier") ?? "";
    const redirectUri = form.get("redirect_uri") ?? "";
    const clientId = form.get("client_id") ?? "";
    const payload = verifyBlob(code, key);
    const cidHash = createHash("sha256").update(clientId).digest("base64url");
    const valid =
      payload !== null &&
      payload.t === "code" &&
      typeof payload.exp === "number" &&
      payload.exp > nowS() &&
      payload.cid === cidHash &&
      payload.ru === redirectUri &&
      typeof payload.cc === "string" &&
      pkceMatches(verifier, payload.cc);
    if (!valid) return sendJson(res, 400, { error: "invalid_grant" });
    return sendJson(res, 200, {
      access_token: issueAccessToken(key),
      token_type: "Bearer",
      expires_in: ACCESS_TTL_S,
      refresh_token: issueRefreshToken(key, clientId),
    });
  }

  if (grant === "refresh_token") {
    const payload = verifyBlob(form.get("refresh_token") ?? "", key);
    const valid = payload !== null && payload.t === "refresh" && typeof payload.exp === "number" && payload.exp > nowS();
    if (!valid) return sendJson(res, 400, { error: "invalid_grant" });
    return sendJson(res, 200, {
      access_token: issueAccessToken(key),
      token_type: "Bearer",
      expires_in: ACCESS_TTL_S,
    });
  }

  sendJson(res, 400, { error: "unsupported_grant_type" });
}

/**
 * Handle OAuth-related routes. Returns true if the request was handled.
 * Fails closed with 503 when the required secrets are not configured.
 */
export async function oauthHandler(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const path = new URL(req.url ?? "/", "http://placeholder").pathname;
  const oauthPaths = new Set([
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-authorization-server",
    "/register",
    "/authorize",
    "/token",
  ]);
  if (!oauthPaths.has(path)) return false;

  const key = process.env.SIGNING_SECRET;
  const loginSecret = process.env.OAUTH_LOGIN_SECRET;
  if (!key || !loginSecret) {
    sendJson(res, 503, { error: "oauth_not_configured", error_description: "SIGNING_SECRET and OAUTH_LOGIN_SECRET must be set." });
    return true;
  }

  try {
    if (path === "/.well-known/oauth-protected-resource" && req.method === "GET") handleProtectedResourceMetadata(req, res);
    else if (path === "/.well-known/oauth-authorization-server" && req.method === "GET") handleAuthServerMetadata(req, res);
    else if (path === "/register" && req.method === "POST") await handleRegister(req, res, key);
    else if (path === "/authorize" && req.method === "GET") handleAuthorizeGet(req, res);
    else if (path === "/authorize" && req.method === "POST") await handleAuthorizePost(req, res, key, loginSecret);
    else if (path === "/token" && req.method === "POST") await handleToken(req, res, key);
    else {
      res.statusCode = 405;
      res.end();
    }
  } catch (error) {
    console.error("[acculynx-mcp] oauth route failed:", error);
    if (!res.headersSent) sendJson(res, 500, { error: "server_error" });
  }
  return true;
}
