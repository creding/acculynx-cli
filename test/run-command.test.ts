import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { introspect } from "../src/lib/schema-to-flags.ts";
import {
  buildInput, validateInput, postprocess, renderOutput, stripEmpty, type CommandEntry,
} from "../src/lib/run-command.ts";
import { ValidationError, UsageError } from "../src/lib/errors.ts";

const schema = z.object({
  jobId: z.string().describe("Job UUID"),
  pageSize: z.number().optional(),
  contact: z.object({ id: z.string() }).optional(),
});
const entry: CommandEntry = {
  group: "jobs", verb: "get", tool: "t", positional: "jobId",
  config: { description: "d", inputSchema: schema as any, call: async () => ({}) },
};
const shape = introspect(schema);
const opts = { format: "json" as const, full: false, limitChars: 25000 };

test("buildInput: positional + flags override JSON payload", () => {
  const input = buildInput(entry, shape, ["abc-123"], { "page-size": "5" }, { ...opts, json: '{"pageSize": 9, "contact": {"id": "c1"}}' });
  assert.deepEqual(input, { jobId: "abc-123", pageSize: 5, contact: { id: "c1" } });
});

test("buildInput: malformed JSON throws UsageError", () => {
  assert.throws(() => buildInput(entry, shape, [], {}, { ...opts, json: "{nope" }), UsageError);
});

test("validateInput: failure carries issues, schema replay, and example", () => {
  try {
    validateInput(entry, shape, { pageSize: "x" });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.ok(e.issues.some((i) => i.path.includes("jobId")));
    assert.ok(e.schemaReplay);
    assert.match(e.example, /jobs get/);
  }
});

test("validateInput: unknown top-level key is rejected, not silently dropped", () => {
  try {
    validateInput(entry, shape, { jobId: "abc", bogusKey: 1 });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.ok(e.issues.some((i) => i.path === "bogusKey"), JSON.stringify(e.issues));
    assert.match(e.issues.find((i) => i.path === "bogusKey")!.message, /unknown/i);
  }
});

test("validateInput: unknown key nested in an object field is rejected with its path", () => {
  try {
    validateInput(entry, shape, { jobId: "abc", contact: { id: "c1", paymentDat: "typo" } });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.ok(e.issues.some((i) => i.path === "contact.paymentDat"), JSON.stringify(e.issues));
  }
});

test("validateInput: unknown key inside array elements is rejected with an indexed path", () => {
  const arraySchema = z.object({ items: z.array(z.object({ id: z.string() })) });
  const arrayEntry: CommandEntry = {
    group: "x", verb: "y", tool: "t2",
    config: { description: "d", inputSchema: arraySchema as any, call: async () => ({}) },
  };
  try {
    validateInput(arrayEntry, introspect(arraySchema), { items: [{ id: "1", junk: true }] });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.ok(e.issues.some((i) => i.path === "items[0].junk"), JSON.stringify(e.issues));
  }
});

test("validateInput: undefined-valued stray keys and valid input still pass", () => {
  const parsed = validateInput(entry, shape, { jobId: "abc", stray: undefined });
  assert.deepEqual(parsed, { jobId: "abc" });
  const full = validateInput(entry, shape, { jobId: "abc", contact: { id: "c1" }, pageSize: 3 });
  assert.deepEqual(full, { jobId: "abc", contact: { id: "c1" }, pageSize: 3 });
});

test("stripEmpty removes null/undefined/empty objects deeply", () => {
  assert.deepEqual(stripEmpty({ a: 1, b: null, c: { d: null }, e: [null, 2] }), { a: 1, e: [null, 2] });
});

test("postprocess: projection produces items + _meta; --full disables; hints attach", () => {
  const listEntry: CommandEntry = { ...entry, project: ["id", "name"], hints: ["next: acculynx jobs get <id>"] };
  const result = { items: [{ id: "1", name: "A", junk: "x" }], totalCount: 40, recordStartIndex: 0 };
  const concise = postprocess(listEntry, result, opts) as any;
  assert.deepEqual(concise.items, [{ id: "1", name: "A" }]);
  assert.equal(concise._meta.totalCount, 40);
  assert.deepEqual(concise._hints, ["next: acculynx jobs get <id>"]);
  const full = postprocess(listEntry, result, { ...opts, full: true }) as any;
  assert.equal(full.items[0].junk, "x");
});

test("postprocess: --fields applies to bare top-level array payloads", () => {
  const result = [
    { id: 1, milestone: "Lead", junk: "x" },
    { id: 2, milestone: "Prospect", junk: "y" },
  ];
  const projected = postprocess(entry, result, { ...opts, fields: ["milestone"] }) as any[];
  assert.deepEqual(projected, [{ milestone: "Lead" }, { milestone: "Prospect" }]);
  // no fields -> array passes through untouched (minus empties)
  const passthrough = postprocess(entry, result, opts) as any[];
  assert.equal(passthrough[0].junk, "x");
});

test("renderOutput truncates with guidance", () => {
  const out = renderOutput({ big: "y".repeat(200) }, { ...opts, limitChars: 50 });
  assert.ok(out.length < 260);
  assert.match(out, /truncated at 50 chars/);
  assert.match(out, /--fields/);
});
