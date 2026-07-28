import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { introspect, kebab } from "../src/lib/schema-to-flags.ts";
import { ResponseFormat } from "../src/lib/constants.ts";

test("kebab converts camelCase", () => {
  assert.equal(kebab("recordStartIndex"), "record-start-index");
  assert.equal(kebab("jobId"), "job-id");
});

test("introspect splits scalars into flags and nested into jsonFields", () => {
  const schema = z.object({
    jobId: z.string().guid().describe("Target Job UUID"),
    pageSize: z.number().optional().describe("Page size"),
    sortOrder: z.enum(["Ascending", "Descending"]).optional(),
    deep: z.object({ id: z.string() }).optional().describe("Nested payload"),
    tags: z.array(z.string()).optional(),
    response_format: z.nativeEnum(ResponseFormat).optional(),
  });
  const shape = introspect(schema);
  const flagKeys = shape.flags.map((f) => f.key).sort();
  assert.deepEqual(flagKeys, ["jobId", "pageSize", "sortOrder"]);
  assert.deepEqual(shape.jsonFields.map((f) => f.key).sort(), ["deep", "tags"]);
  const jobId = shape.flags.find((f) => f.key === "jobId")!;
  assert.equal(jobId.flag, "job-id");
  assert.equal(jobId.required, true);
  const sort = shape.flags.find((f) => f.key === "sortOrder")!;
  assert.deepEqual(sort.enumValues, ["Ascending", "Descending"]);
  const page = shape.flags.find((f) => f.key === "pageSize")!;
  assert.equal(page.type, "number");
  assert.equal(page.required, false);
  // response_format is excluded (global --format supplies it)
  assert.ok(!shape.flags.some((f) => f.key === "response_format"));
});
