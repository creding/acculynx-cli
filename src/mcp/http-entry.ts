import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildServer, MCP_SERVER_VERSION } from "./server.ts";
import { applyConfig } from "../lib/config.ts";

applyConfig();

/** Constant-time compare that never leaks length through early return. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still burn a comparison so timing does not distinguish "wrong length".
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

function authorized(req: IncomingMessage): boolean {
  const expected = process.env.MCP_AUTH_TOKEN;
  if (!expected) return false; // fail closed: no token configured means no access
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return false;
  return secretMatches(header.slice(7).trim(), expected);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * Stateless Streamable HTTP MCP endpoint.
 *
 * A fresh server + transport per request: serverless instances are recycled
 * without warning, so session state could not survive anyway, and statelessness
 * keeps concurrent invocations from sharing a transport.
 */
export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse): Promise<void> {
  if (req.method === "GET" && req.url && req.url.includes("/health")) {
    return sendJson(res, 200, { ok: true, server: "acculynx", version: MCP_SERVER_VERSION });
  }

  if (!authorized(req)) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="acculynx-mcp"');
    return sendJson(res, 401, {
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized: missing or invalid bearer token." },
      id: null,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      jsonrpc: "2.0",
      error: { code: -32000, message: "This endpoint is stateless; only POST is supported." },
      id: null,
    });
  }

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = buildServer();

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[acculynx-mcp] request failed:", error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error." },
        id: null,
      });
    }
  }
}
