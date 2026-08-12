import { createHash, randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { signBlob, verifyBlob } from "./oauth.ts";
import { getAccuLynxClient, handleApiError } from "../lib/acculynx.ts";

/**
 * Ticketed direct uploads: `acculynx_request_upload` mints an HMAC-signed,
 * short-lived, single-use URL bound to jobId + folder + fileName, and
 * `PUT /api/uploads/<ticket>` verifies it and forwards the raw body to
 * AccuLynx as the existing documents-add multipart call. This lets a caller
 * in a sandbox move file bytes without routing them through model context —
 * the PUT itself is unauthenticated, so every destination field is fixed at
 * mint time and only the bytes are attacker-controllable.
 *
 * Single-use is enforced per warm instance (serverless keeps no storage): an
 * accidental double-PUT gets a 409, but a replay against a cold instance
 * inside the TTL cannot be blocked. The 10-minute TTL bounds that window.
 */

export const UPLOAD_TICKET_TTL_S = 600;
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // under Vercel's ~4.5 MB request-body cap

export interface UploadFields {
  jobId: string;
  documentFolderId: string;
  fileName: string;
  contentType?: string;
  description?: string;
}

export function mintUploadTicket(fields: UploadFields, key: string, opts: { ttlS?: number } = {}): string {
  return signBlob(
    {
      v: 1,
      typ: "upl",
      exp: Math.floor(Date.now() / 1000) + (opts.ttlS ?? UPLOAD_TICKET_TTL_S),
      n: randomBytes(16).toString("base64url"),
      ...fields,
    },
    key,
  );
}

export type TicketVerdict =
  | { ok: true; fields: UploadFields; nonce: string; exp: number }
  | { ok: false; reason: "invalid" | "expired" };

export function verifyUploadTicket(ticket: string, key: string): TicketVerdict {
  const payload = verifyBlob(ticket, key);
  if (
    !payload ||
    payload.typ !== "upl" ||
    typeof payload.exp !== "number" ||
    typeof payload.n !== "string" ||
    typeof payload.jobId !== "string" ||
    typeof payload.documentFolderId !== "string" ||
    typeof payload.fileName !== "string"
  ) {
    return { ok: false, reason: "invalid" };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };
  return {
    ok: true,
    nonce: payload.n,
    exp: payload.exp,
    fields: {
      jobId: payload.jobId,
      documentFolderId: payload.documentFolderId,
      fileName: payload.fileName,
      contentType: typeof payload.contentType === "string" ? payload.contentType : undefined,
      description: typeof payload.description === "string" ? payload.description : undefined,
    },
  };
}

// Best-effort single-use registry (per warm instance; see module comment).
const consumed = new Map<string, number>();

function pruneConsumed(): void {
  const now = Math.floor(Date.now() / 1000);
  for (const [nonce, exp] of consumed) if (exp < now) consumed.delete(nonce);
}

export function __resetConsumedForTests(): void {
  consumed.clear();
}

export interface ForwardArgs extends UploadFields {
  data: Buffer;
}

/** Default forwarder: temp file named per the ticket, then the same SDK multipart call as `documents add`. */
async function forwardToAccuLynx(args: ForwardArgs): Promise<{ status: number }> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "acculynx-direct-"));
  try {
    const filePath = path.join(dir, path.basename(args.fileName));
    await fs.writeFile(filePath, args.data);
    const client = getAccuLynxClient();
    const res = await client.postAddJobDocument(
      { file: filePath, documentFolderId: args.documentFolderId, description: args.description },
      { jobId: args.jobId },
    );
    return { status: typeof res?.status === "number" ? res.status : 202 };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readRawBody(req: IncomingMessage & { body?: unknown }): Promise<Buffer | null> {
  // Vercel's helpers (and the test harness) pre-read the stream into req.body.
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
    return null; // pre-parsed JSON object etc. — not a valid binary upload
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > UPLOAD_MAX_BYTES) return Buffer.alloc(UPLOAD_MAX_BYTES + 1); // sentinel: oversize
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

export interface UploadHandlerOptions {
  signingSecret: string;
  forward?: (args: ForwardArgs) => Promise<{ status: number }>;
}

/**
 * Handles `PUT /api/uploads/<ticket>`. Returns true when the request was an
 * uploads-route request (regardless of outcome), false to let other routing run.
 */
export async function handleUploadRequest(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
  opts: UploadHandlerOptions,
): Promise<boolean> {
  const match = /^\/api\/uploads\/([^/?#]+)/.exec(req.url ?? "");
  if (!match) return false;

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    sendJson(res, 405, { error: "Use PUT with the raw file bytes as the request body." });
    return true;
  }

  const verdict = verifyUploadTicket(decodeURIComponent(match[1]), opts.signingSecret);
  if (!verdict.ok) {
    if (verdict.reason === "expired") {
      sendJson(res, 410, { error: "Upload ticket expired. Request a new one with acculynx_request_upload." });
    } else {
      sendJson(res, 403, { error: "Invalid upload ticket." });
    }
    return true;
  }

  const declared = Number(req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > UPLOAD_MAX_BYTES) {
    sendJson(res, 413, { error: `File is too large (${declared} bytes; limit ${UPLOAD_MAX_BYTES}).` });
    return true;
  }

  pruneConsumed();
  if (consumed.has(verdict.nonce)) {
    sendJson(res, 409, {
      error:
        "Upload ticket already used — do not retry: the first upload likely landed, and AccuLynx has no " +
        "delete API to undo a duplicate. Verify in the AccuLynx UI, and request a new ticket only if the " +
        "file is genuinely missing.",
    });
    return true;
  }

  const data = await readRawBody(req);
  if (data === null) {
    sendJson(res, 400, { error: "Request body must be the raw file bytes (e.g. curl --data-binary @file)." });
    return true;
  }
  if (data.length > UPLOAD_MAX_BYTES) {
    sendJson(res, 413, { error: `File is too large (limit ${UPLOAD_MAX_BYTES} bytes).` });
    return true;
  }
  if (data.length === 0) {
    sendJson(res, 400, { error: "Empty request body — send the raw file bytes." });
    return true;
  }

  // Claim the nonce before forwarding so a concurrent duplicate PUT can't
  // double-file; release it if AccuLynx never accepted, so one retry is safe.
  consumed.set(verdict.nonce, verdict.exp);
  const forward = opts.forward ?? forwardToAccuLynx;
  try {
    const { status } = await forward({ ...verdict.fields, data });
    const receipt = {
      ok: true,
      fileName: verdict.fields.fileName,
      jobId: verdict.fields.jobId,
      documentFolderId: verdict.fields.documentFolderId,
      bytes: data.length,
      sha256: createHash("sha256").update(data).digest("hex"),
      acculynxStatus: status,
      uploadedAt: new Date().toISOString(),
    };
    console.log("[acculynx-upload]", JSON.stringify(receipt));
    sendJson(res, 200, receipt);
  } catch (error) {
    consumed.delete(verdict.nonce);
    sendJson(res, 502, {
      error: `AccuLynx rejected the upload: ${handleApiError(error)}`,
      retriable: true,
    });
  }
  return true;
}
