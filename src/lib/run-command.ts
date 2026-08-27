import fs from "node:fs";
import type { z } from "zod";
import type { CommandConfig } from "./define-acculynx-tool.ts";
import type { CommandShape, FlagSpec } from "./schema-to-flags.ts";
import { UsageError, ValidationError } from "./errors.ts";

export interface CommandEntry {
  group: string;
  verb: string;
  tool: string;
  config: CommandConfig;
  /** Input key promoted to the first positional argument. */
  positional?: string;
  /** Concise-projection fields for list output (dot paths allowed). */
  project?: string[];
  /** Next-step hints attached to successful results. */
  hints?: string[];
}

export interface GlobalOptions {
  format: "json" | "md";
  full: boolean;
  fields?: string[];
  json?: string;
  input?: string;
  limitChars: number; // 0 = no limit
  output?: string;
}

export function buildInput(
  entry: CommandEntry,
  shape: CommandShape,
  positionals: string[],
  flagValues: Record<string, string | boolean | undefined>,
  opts: GlobalOptions,
): Record<string, unknown> {
  let base: Record<string, unknown> = {};
  const rawJson =
    opts.json ?? (opts.input ? (opts.input === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(opts.input, "utf8")) : undefined);
  if (rawJson !== undefined) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      throw new UsageError(`--json/--input is not valid JSON: ${(e as Error).message}`);
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new UsageError("--json/--input must be a JSON object");
    }
    base = parsed as Record<string, unknown>;
  }
  if (positionals.length > 0) {
    if (!entry.positional) {
      throw new UsageError(
        `Unexpected positional argument "${positionals[0]}".`,
        `Run: acculynx describe ${entry.group} ${entry.verb}`,
      );
    }
    base[entry.positional] = positionals[0];
    if (positionals.length > 1) throw new UsageError(`Too many positional arguments (expected 1: <${entry.positional}>).`);
  }
  for (const spec of shape.flags) {
    const v = flagValues[spec.flag];
    if (v === undefined) continue;
    base[spec.key] = coerce(spec, v);
  }
  return base;
}

function coerce(spec: FlagSpec, v: string | boolean): unknown {
  if (spec.type === "boolean") return v === true || v === "true";
  if (spec.type === "number") {
    const n = Number(v);
    if (Number.isNaN(n)) throw new UsageError(`--${spec.flag} expects a number, got "${v}"`);
    return n;
  }
  return v;
}

export function makeExample(entry: CommandEntry, shape: CommandShape): string {
  const parts = [`acculynx ${entry.group} ${entry.verb}`];
  if (entry.positional) parts.push(`<${entry.positional}>`);
  const jsonExample: Record<string, unknown> = {};
  for (const f of shape.flags) {
    if (!f.required || f.key === entry.positional) continue;
    parts.push(`--${f.flag} ${sampleFor(f.type, f.enumValues, f.key)}`);
  }
  for (const jf of shape.jsonFields) {
    if (jf.required) jsonExample[jf.key] = sampleFromSchema(shape.jsonSchema.properties?.[jf.key]);
  }
  if (Object.keys(jsonExample).length > 0) parts.push(`--json '${JSON.stringify(jsonExample)}'`);
  return parts.join(" ");
}

function sampleFor(type: string, enumValues: string[] | undefined, key: string): string {
  if (enumValues?.length) return enumValues[0];
  if (type === "number") return "1";
  if (type === "boolean") return "true";
  if (/date/i.test(key)) return "2026-07-28";
  if (/id$/i.test(key)) return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  return '"text"';
}

function sampleFromSchema(prop: any, key = ""): unknown {
  const p = prop?.anyOf?.[0] ?? prop ?? {};
  if (p.type === "array") return [sampleFromSchema(p.items)];
  if (p.type === "object") {
    // Required keys first (an example must be runnable), padded with leading
    // optional keys so it also shows the command's typical arguments.
    const required = (p.required as string[]) ?? [];
    const keys = [...required];
    for (const k of Object.keys(p.properties ?? {})) {
      if (keys.length >= Math.max(3, required.length)) break;
      if (!keys.includes(k)) keys.push(k);
    }
    const out: Record<string, unknown> = {};
    for (const k of keys) out[k] = sampleFromSchema(p.properties?.[k], k);
    return out;
  }
  if (p.enum?.length) return p.enum[0];
  if (p.type === "number" || p.type === "integer") return 1;
  if (p.type === "boolean") return true;
  if (p.format === "date-time" || /date$/i.test(key)) return "2026-07-28T00:00:00Z";
  if (/id$/i.test(key)) return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  return "text";
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Keys present in the caller's input but absent from the parsed output. Zod
 * object schemas strip unknown keys silently, which once turned "you sent
 * paymentDate" into a 400 claiming it was never sent (the add-expense bug).
 * Rejecting instead of stripping makes the mistake diagnosable in one call.
 */
function collectDroppedKeys(input: unknown, parsed: unknown, prefix = ""): string[] {
  if (Array.isArray(input) && Array.isArray(parsed)) {
    return input.flatMap((item, i) =>
      i < parsed.length ? collectDroppedKeys(item, parsed[i], `${prefix}[${i}]`) : [],
    );
  }
  if (isPlainObject(input) && isPlainObject(parsed)) {
    return Object.keys(input).flatMap((key) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!(key in parsed)) return input[key] === undefined ? [] : [path];
      return collectDroppedKeys(input[key], parsed[key], path);
    });
  }
  return [];
}

export function validateInput(
  entry: CommandEntry,
  shape: CommandShape,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = (entry.config.inputSchema as z.ZodType).safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new ValidationError(`${entry.group} ${entry.verb}`, issues, shape.jsonSchema, makeExample(entry, shape));
  }
  const dropped = collectDroppedKeys(input, parsed.data);
  if (dropped.length > 0) {
    const issues = dropped.map((path) => ({
      path,
      message: "Unknown key: not accepted by this command's schema (it would have been silently ignored).",
    }));
    throw new ValidationError(`${entry.group} ${entry.verb}`, issues, shape.jsonSchema, makeExample(entry, shape));
  }
  return parsed.data as Record<string, unknown>;
}

export function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined) continue;
      const s = stripEmpty(v);
      if (s && typeof s === "object" && !Array.isArray(s) && Object.keys(s).length === 0) continue;
      out[k] = s;
    }
    return out;
  }
  return value;
}

function dig(obj: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

function pick(obj: unknown, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = dig(obj, f);
    if (v !== undefined && v !== null) out[f] = v;
  }
  return out;
}

const PAGINATION_KEYS = ["totalCount", "totalRecordCount", "recordStartIndex", "pageStartIndex", "pageSize", "count"];

export function postprocess(entry: CommandEntry, result: unknown, opts: GlobalOptions): unknown {
  let out = stripEmpty(result);
  const fields = opts.fields ?? (!opts.full ? entry.project : undefined);
  if (fields && Array.isArray(out)) {
    // Bare top-level array payload (no pagination envelope): project each element.
    out = out.map((item) => pick(item, fields));
  } else if (fields && out && typeof out === "object" && !Array.isArray(out)) {
    const payload = out as Record<string, unknown>;
    if (Array.isArray(payload.items)) {
      const meta: Record<string, unknown> = { count: payload.items.length };
      for (const key of PAGINATION_KEYS) if (payload[key] !== undefined) meta[key] = payload[key];
      out = {
        items: payload.items.map((item) => pick(item, fields)),
        _meta: meta,
        _note: "Concise view — use --full for complete records or --fields a,b,c to choose fields.",
      };
    } else {
      out = pick(payload, fields);
    }
  }
  if (entry.hints?.length && out && typeof out === "object" && !Array.isArray(out)) {
    (out as Record<string, unknown>)._hints = entry.hints;
  }
  return out;
}

export function renderOutput(payload: unknown, opts: GlobalOptions): string {
  const jsonString = JSON.stringify(payload, null, 1);
  let text = opts.format === "md" ? "```json\n" + jsonString + "\n```" : jsonString;
  if (opts.limitChars > 0 && text.length > opts.limitChars) {
    text =
      text.slice(0, opts.limitChars) +
      `\n...[truncated at ${opts.limitChars} chars — narrow with --fields, --page-size, or filters; raise with --limit-chars N or --no-limit]`;
  }
  return text;
}
