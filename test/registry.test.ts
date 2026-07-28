import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { REGISTRY } from "../src/registry.ts";
import { introspect } from "../src/lib/schema-to-flags.ts";

const GLOBAL_FLAGS = new Set(["format", "full", "fields", "json", "input", "limit-chars", "no-limit", "output", "help"]);

test("every command file is registered exactly once", () => {
  const files = fs.readdirSync("src/commands").filter((f) => f.endsWith(".ts")).map((f) => f.replace(".ts", ""));
  const tools = REGISTRY.map((e) => e.tool);
  assert.deepEqual([...tools].sort(), files.sort());
  assert.equal(new Set(tools).size, tools.length);
});

test("no duplicate group+verb", () => {
  const keys = REGISTRY.map((e) => `${e.group} ${e.verb}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("every schema introspects; no scalar flag collides with a global flag", () => {
  for (const e of REGISTRY) {
    const shape = introspect(e.config.inputSchema);
    for (const f of shape.flags) {
      assert.ok(!GLOBAL_FLAGS.has(f.flag), `${e.group} ${e.verb}: flag --${f.flag} collides with a global flag`);
    }
    if (e.positional) {
      assert.ok(shape.flags.some((f) => f.key === e.positional), `${e.group} ${e.verb}: positional ${e.positional} not in schema`);
    }
  }
});
