import acculynxApiModule from "@api/acculynxapi";
import { ResponseFormat, CHARACTER_LIMIT } from "./constants.ts";

import path from "path";
import fs from "fs/promises";

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
export async function resolveSandboxFile(
  fileInput: string | undefined,
  _ctx: unknown,
): Promise<{ path: string; cleanup: () => Promise<void> } | null> {
  if (!fileInput || typeof fileInput !== "string") return null;
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
