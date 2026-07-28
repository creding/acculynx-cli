import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("reports coc renders a real PDF to -o path using default signer (no live lookup)", () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "alx-pdf-")), "coc.pdf");
  const args = [
    "reports", "coc",
    "--job-id", "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "--customer-name", "Test Customer",
    "--address", "123 Maple St, Homewood, AL 35209",
    "--claim-number", "CLM-0042",
    "--scope-original-amount", "18500",
    "--completion-date", "2026-07-01",
    "--json", JSON.stringify({ supplements: [] }),
  ];
  const r = spawnSync("npx", ["tsx", "src/index.ts", ...args, "-o", out], {
    encoding: "utf8",
    env: { ...process.env, ACCULYNX_API_KEY: "test-key", ACCULYNX_SIGNER_EMAIL: "" },
  });
  assert.equal(r.status, 0, r.stderr);
  const meta = JSON.parse(r.stdout);
  assert.equal(meta.success, true);
  assert.equal(meta.filePath, out);
  assert.equal(meta.documentType, "Certificate of Completion");
  const bytes = fs.readFileSync(out);
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  assert.ok(bytes.length > 5000, `pdf too small: ${bytes.length}`);
});
