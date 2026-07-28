import { test } from "node:test";
import assert from "node:assert/strict";
import { handleApiError } from "../src/lib/acculynx.ts";

test("handleApiError extracts AccuLynx error schema", () => {
  const msg = handleApiError({ data: { status: 400, title: "Bad Request", detail: "pageSize max is 25" } });
  assert.match(msg, /AccuLynx API Error \(400\): Bad Request/);
  assert.match(msg, /pageSize max is 25/);
});

test("handleApiError falls back to message", () => {
  assert.match(handleApiError(new Error("boom")), /Error: boom/);
});
