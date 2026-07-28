import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const run = (...args: string[]) => spawnSync("npx", ["tsx", "src/index.ts", ...args], { encoding: "utf8" });

test("describe misc ping returns schema and example", () => {
  const r = run("describe", "misc", "ping");
  assert.equal(r.status, 0);
  const d = JSON.parse(r.stdout);
  assert.equal(d.command, "acculynx misc ping");
  assert.equal(d.mutates, false);
  assert.ok(d.schema);
  assert.match(d.example, /acculynx misc ping/);
});

test("search finds ping; miss returns suggestion", () => {
  const hit = JSON.parse(run("search", "ping").stdout);
  assert.ok(hit.matches.some((m: any) => m.command === "acculynx misc ping"));
  const miss = JSON.parse(run("search", "zzzznope").stdout);
  assert.deepEqual(miss.matches, []);
  assert.ok(miss.suggestion);
});

test("guide prints the operational primer", () => {
  const r = run("guide");
  assert.equal(r.status, 0);
  for (const s of ["Contact", "milestone", "pageSize", "describe", "search"]) {
    assert.match(r.stdout, new RegExp(s, "i"));
  }
});
