import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("applyConfig maps config file values into env without overriding existing env", async () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "alx-cfg-"));
  fs.mkdirSync(path.join(tmpHome, ".config", "acculynx"), { recursive: true });
  fs.writeFileSync(
    path.join(tmpHome, ".config", "acculynx", "config.json"),
    JSON.stringify({ apiKey: "from-file", signerEmail: "s@x.com", timeoutMs: 9000 }),
  );
  process.env.ACCULYNX_CONFIG_HOME = tmpHome; // test hook, see config.ts
  delete process.env.ACCULYNX_API_KEY;
  process.env.ACCULYNX_SIGNER_EMAIL = "env-wins@x.com";
  delete process.env.ACCULYNX_TIMEOUT_MS;

  const { applyConfig } = await import("../src/lib/config.ts");
  applyConfig();
  assert.equal(process.env.ACCULYNX_API_KEY, "from-file");
  assert.equal(process.env.ACCULYNX_SIGNER_EMAIL, "env-wins@x.com");
  assert.equal(process.env.ACCULYNX_TIMEOUT_MS, "9000");
});

test("requireApiKey throws UsageError with setup hint when unset", async () => {
  delete process.env.ACCULYNX_API_KEY;
  const { requireApiKey } = await import("../src/lib/config.ts");
  const { UsageError } = await import("../src/lib/errors.ts");
  assert.throws(() => requireApiKey(), UsageError);
  assert.throws(() => requireApiKey(), /ACCULYNX_API_KEY/);
});

test("loadConfig falls back to config.json next to the running script (home config wins)", async () => {
  const fs = (await import("node:fs")).default;
  const os = (await import("node:os")).default;
  const path = (await import("node:path")).default;
  const { loadConfig } = await import("../src/lib/config.ts");

  const scriptDir = path.dirname(fs.realpathSync(process.argv[1]!));
  const bundleCfgPath = path.join(scriptDir, "config.json");
  fs.writeFileSync(bundleCfgPath, JSON.stringify({ apiKey: "bundle-key", timeoutMs: 1234 }));
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "alx-bundle-"));
  process.env.ACCULYNX_CONFIG_HOME = tmpHome;
  try {
    // no home config: bundle-adjacent values apply
    assert.equal(loadConfig().apiKey, "bundle-key");
    // home config wins over bundle-adjacent
    fs.mkdirSync(path.join(tmpHome, ".config", "acculynx"), { recursive: true });
    fs.writeFileSync(path.join(tmpHome, ".config", "acculynx", "config.json"), JSON.stringify({ apiKey: "home-key" }));
    const merged = loadConfig();
    assert.equal(merged.apiKey, "home-key");
    assert.equal(merged.timeoutMs, 1234); // non-conflicting bundle values survive
  } finally {
    fs.unlinkSync(bundleCfgPath);
    delete process.env.ACCULYNX_CONFIG_HOME;
  }
});
