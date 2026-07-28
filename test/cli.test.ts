import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const run = (...args: string[]) =>
  spawnSync("npx", ["tsx", "src/index.ts", ...args], { encoding: "utf8", env: { ...process.env, ACCULYNX_API_KEY: "test-key" } });

test("--help lists groups and top-level commands", () => {
  const r = run("--help");
  assert.equal(r.status, 0);
  for (const s of ["jobs", "settings", "misc", "describe", "search", "guide"]) assert.match(r.stdout, new RegExp(s));
});

test("group help lists verbs with read/mutates labels", () => {
  const r = run("misc", "--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /ping/);
  assert.match(r.stdout, /\[read\]/);
});

test("unknown command yields structured error with suggestion, exit 2", () => {
  const r = run("jbos", "list");
  assert.equal(r.status, 2);
  const err = JSON.parse(r.stderr);
  assert.match(err.error.message, /Unknown command/);
  assert.match(err.error.suggestion, /jobs|search/);
});

test("missing API key yields setup hint, exit 2", () => {
  const r = spawnSync("npx", ["tsx", "src/index.ts", "misc", "ping"], {
    encoding: "utf8",
    env: { ...process.env, ACCULYNX_API_KEY: "", ACCULYNX_CONFIG_HOME: "/nonexistent" },
  });
  assert.equal(r.status, 2);
  assert.match(JSON.parse(r.stderr).error.suggestion, /config.json/);
});
