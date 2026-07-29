import acculynxApiModule from "@api/acculynxapi";
import { ResponseFormat, CHARACTER_LIMIT } from "./constants.ts";

import path from "path";
import fs from "fs/promises";
import os from "os";

// Ensure compatibility with Node16 module resolution mapping default exports
const sdk = (acculynxApiModule as any).default || acculynxApiModule;

// ---------------------------------------------------------------------------
// Resilience: every SDK call is retried on transient failures (429/5xx/network)
// with exponential backoff. Applied once at the client boundary so all tools
// inherit it without per-tool changes.
// ---------------------------------------------------------------------------

// Read lazily: the config file may set the env var after module load.
const maxAttempts = () => Number(process.env.ACCULYNX_RETRY_ATTEMPTS) || 3;
const RETRY_BASE_DELAY_MS = 500;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function extractStatus(error: unknown): number | undefined {
  const anyErr = error as any;
  const status = anyErr?.status ?? anyErr?.data?.status ?? anyErr?.response?.status;
  return typeof status === "number" ? status : undefined;
}

function isNetworkError(error: unknown): boolean {
  const message = String((error as any)?.message ?? error);
  return /fetch failed|network|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|socket|timeout/i.test(message);
}

function retryDelayMs(error: unknown, attempt: number): number {
  // Honor Retry-After (seconds) when AccuLynx sends one on 429s.
  const retryAfter = Number((error as any)?.headers?.["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 15_000);
  // Exponential backoff with jitter: ~500ms, ~1s, ~2s.
  return RETRY_BASE_DELAY_MS * 2 ** (attempt - 1) * (0.75 + Math.random() * 0.5);
}

async function withRetry<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = extractStatus(error);
      const retryable = status !== undefined ? RETRYABLE_STATUS.has(status) : isNetworkError(error);
      if (!retryable || attempt >= maxAttempts()) throw error;
      const delay = retryDelayMs(error, attempt);
      console.warn(
        `[acculynx] ${operation} failed (${status ?? "network error"}), retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxAttempts() - 1})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// SDK methods that configure the client rather than call the API.
const NON_API_METHODS = new Set(["auth", "config", "server"]);

let client: any;

/**
 * Singleton getter for the fully authorized AccuLynx API SDK client.
 * Authenticates once, then wraps every API method with transient-failure
 * retry via a Proxy.
 */
export function getAccuLynxClient(): any {
  if (client) return client;

  const apiKey = process.env.ACCULYNX_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: ACCULYNX_API_KEY");
  }
  sdk.auth(apiKey);
  const timeoutMs = Number(process.env.ACCULYNX_TIMEOUT_MS);
  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    sdk.config({ timeout: timeoutMs });
  }

  client = new Proxy(sdk, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      if (typeof prop !== "string" || NON_API_METHODS.has(prop)) return value.bind(target);
      return (...args: unknown[]) => withRetry(prop, () => value.apply(target, args));
    },
  });
  return client;
}

/**
 * Standardized error formatter extracting canonical AccuLynx JSON API error schema details.
 */
export function handleApiError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const anyErr = error as any;
    const data = anyErr.data || anyErr.response?.data || anyErr;

    if (data && data.status && data.title) {
      const parts = [
        `AccuLynx API Error (${data.status}): ${data.title}`,
        data.detail ? `Detail: ${data.detail}` : "",
        data.traceId ? `Trace ID: ${data.traceId}` : ""
      ].filter(Boolean);
      return parts.join("\n");
    }

    if (anyErr.message) {
      return `Error: ${anyErr.message}`;
    }
  }
  return `Unexpected error: ${String(error)}`;
}

/**
 * Formats structured response payloads supporting Markdown blocks or raw JSON serialization
 * while ensuring string buffers remain within character limit bounds.
 */
export function formatToolResponse(data: unknown, format: ResponseFormat | undefined) {
  const jsonString = JSON.stringify(data, null, 2);
  let textContent = "";

  if (format === ResponseFormat.JSON) {
    textContent = jsonString.length > CHARACTER_LIMIT
      ? jsonString.slice(0, CHARACTER_LIMIT) + "\n...[Truncated to character limit]"
      : jsonString;
  } else {
    textContent = "```json\n" + jsonString + "\n```";
    if (textContent.length > CHARACTER_LIMIT) {
      textContent = textContent.slice(0, CHARACTER_LIMIT) + "\n```\n...[Truncated to character limit]";
    }
  }

  // Return the formatted text and structured record
  const structuredRecord: Record<string, unknown> =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { payload: data };

  return {
    text: textContent,
    data: structuredRecord,
  };
}

/**
 * CLI replacement for the eve sandbox file resolver: the "sandbox" is the
 * local filesystem. Returns the resolved absolute path when the file exists,
 * else null (callers then pass the raw string through to the SDK).
 */
const MAX_REMOTE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — Vercel /tmp and function memory both accommodate this
const REMOTE_FETCH_TIMEOUT_MS = 30_000;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
};

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  const octets = h.split(".").map(Number);
  if (octets.length === 4 && octets.every((o) => Number.isInteger(o) && o >= 0 && o <= 255)) {
    const [a, b] = octets;
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata endpoints
  }
  return false;
}

async function writeTempFile(data: Buffer, filename: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "acculynx-upload-"));
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, data);
  return { path: filePath, cleanup: () => fs.rm(dir, { recursive: true, force: true }) };
}

async function downloadRemoteFile(url: URL): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const insecureAllowed = !!process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS;
  if (url.protocol !== "https:" && !insecureAllowed) {
    throw new Error(`Only https file URLs are supported (got ${url.protocol}//).`);
  }
  if (isPrivateHost(url.hostname) && !insecureAllowed) {
    throw new Error(`URL host "${url.hostname}" is private/internal and not allowed.`);
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(REMOTE_FETCH_TIMEOUT_MS), redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to download ${url.href}: HTTP ${res.status}.`);
  const declared = Number(res.headers.get("content-length"));
  if (declared && declared > MAX_REMOTE_FILE_BYTES) {
    throw new Error(`Remote file is too large (${declared} bytes; limit ${MAX_REMOTE_FILE_BYTES}).`);
  }
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length > MAX_REMOTE_FILE_BYTES) {
    throw new Error(`Remote file is too large (${data.length} bytes; limit ${MAX_REMOTE_FILE_BYTES}).`);
  }
  const urlName = path.basename(url.pathname) || "";
  const mimeExt = MIME_EXTENSIONS[(res.headers.get("content-type") ?? "").split(";")[0].trim()] ?? "";
  const filename = urlName.includes(".") ? urlName : `download${mimeExt || ".bin"}`;
  return writeTempFile(data, filename);
}

function decodeDataUri(uri: string): { data: Buffer; filename: string } {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(uri);
  if (!match) throw new Error("Malformed data URI.");
  const [, mime, isBase64, payload] = match;
  let data: Buffer;
  if (isBase64) {
    if (!/^[A-Za-z0-9+/=\s]*$/.test(payload) || payload.trim().length === 0) {
      throw new Error("Malformed data URI: payload is not valid base64.");
    }
    data = Buffer.from(payload, "base64");
    if (data.length === 0) throw new Error("Malformed data URI: empty base64 payload.");
  } else {
    data = Buffer.from(decodeURIComponent(payload), "utf8");
  }
  if (data.length > MAX_REMOTE_FILE_BYTES) {
    throw new Error(`Inline file is too large (${data.length} bytes; limit ${MAX_REMOTE_FILE_BYTES}).`);
  }
  return { data, filename: `upload${MIME_EXTENSIONS[mime] ?? ".bin"}` };
}

/**
 * Resolve a file input to a local path the SDK can upload.
 * Accepts: an existing local path (never deleted by cleanup), an https URL
 * (downloaded to a temp dir; cleanup removes it), or a data: URI (decoded to
 * a temp dir). URL and data inputs are what make file uploads work through
 * the hosted MCP server, which has no access to the caller's filesystem.
 */
export async function resolveSandboxFile(
  fileInput: string | undefined,
  _ctx: unknown,
): Promise<{ path: string; cleanup: () => Promise<void> } | null> {
  if (!fileInput || typeof fileInput !== "string") return null;

  if (/^https?:\/\//i.test(fileInput)) {
    return downloadRemoteFile(new URL(fileInput));
  }
  if (fileInput.startsWith("data:")) {
    const { data, filename } = decodeDataUri(fileInput);
    return writeTempFile(data, filename);
  }

  const resolved = path.resolve(process.cwd(), fileInput);
  try {
    await fs.access(resolved);
    return { path: resolved, cleanup: async () => {} };
  } catch {
    return null;
  }
}

export interface ResolvedFilesResult<T> {
  resolved: T;
  cleanup: () => Promise<void>;
}

/** Recursively resolves file-bearing fields (file, measurementsFile, reportPdf, miscPdfs) to absolute local paths. */
export async function resolveSandboxFiles<T>(
  input: T,
  ctx: unknown,
  isFileField = false,
): Promise<ResolvedFilesResult<T>> {
  async function traverse(val: unknown, isField: boolean): Promise<unknown> {
    if (typeof val === "string" && isField) {
      const fileRes = await resolveSandboxFile(val, ctx);
      return fileRes ? fileRes.path : val;
    }
    if (Array.isArray(val)) return Promise.all(val.map((item) => traverse(item, isField)));
    if (typeof val === "object" && val !== null) {
      const output: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        const checkField =
          isField || k === "file" || k === "measurementsFile" || k === "reportPdf" || k === "miscPdfs";
        output[k] = await traverse(v, checkField);
      }
      return output;
    }
    return val;
  }
  const resolved = (await traverse(input, isFileField)) as T;
  return { resolved, cleanup: async () => {} };
}
