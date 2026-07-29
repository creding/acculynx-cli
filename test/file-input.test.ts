import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { resolveSandboxFile } from "../src/lib/acculynx.ts";

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("local path still resolves as before", async () => {
  const tmp = path.join(os.tmpdir(), `alx-local-${process.pid}.txt`);
  await fs.writeFile(tmp, "hello");
  const res = await resolveSandboxFile(tmp, undefined);
  assert.ok(res);
  assert.equal(res.path, tmp);
  await res.cleanup();
  await fs.access(tmp); // local files are never deleted by cleanup
  await fs.rm(tmp);
});

test("nonexistent plain path resolves to null, as before", async () => {
  assert.equal(await resolveSandboxFile("no-such-file-anywhere.xyz", undefined), null);
});

test("data URI decodes to a temp file and cleanup removes it", async () => {
  const uri = `data:image/png;base64,${PNG_BYTES.toString("base64")}`;
  const res = await resolveSandboxFile(uri, undefined);
  assert.ok(res);
  assert.deepEqual(await fs.readFile(res.path), PNG_BYTES);
  assert.match(path.extname(res.path), /\.png$/);
  await res.cleanup();
  await assert.rejects(fs.access(res.path)); // downloaded temp is removed
});

test("malformed data URI throws a usable error", async () => {
  await assert.rejects(() => resolveSandboxFile("data:image/png;base64,!!!not-base64!!!", undefined), /base64|data URI/i);
});

// ---- URL downloads (local http server; insecure allowed only via env override) ----

let base = "";
let server: http.Server;

before(async () => {
  process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS = "1";
  server = http.createServer((req, res) => {
    if (req.url === "/photo.png") {
      res.setHeader("Content-Type", "image/png");
      res.end(PNG_BYTES);
    } else if (req.url === "/huge") {
      res.setHeader("Content-Length", String(500 * 1024 * 1024));
      res.write(Buffer.alloc(1024));
      res.end();
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
  delete process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS;
});

test("URL input downloads to a temp file named after the URL, and cleanup removes it", async () => {
  const res = await resolveSandboxFile(`${base}/photo.png`, undefined);
  assert.ok(res);
  assert.deepEqual(await fs.readFile(res.path), PNG_BYTES);
  assert.equal(path.basename(res.path).endsWith("photo.png"), true);
  await res.cleanup();
  await assert.rejects(fs.access(res.path));
});

test("URL that 404s throws instead of silently passing the URL through", async () => {
  await assert.rejects(() => resolveSandboxFile(`${base}/missing.pdf`, undefined), /404|failed/i);
});

test("oversized download is rejected", async () => {
  await assert.rejects(() => resolveSandboxFile(`${base}/huge`, undefined), /too large|size/i);
});

test("plain http URLs are rejected without the insecure override", async () => {
  delete process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS;
  try {
    await assert.rejects(() => resolveSandboxFile("http://example.com/file.pdf", undefined), /https/i);
  } finally {
    process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS = "1";
  }
});

test("URLs pointing at private or loopback hosts are rejected", async () => {
  delete process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS;
  try {
    for (const target of [
      "https://localhost/secret",
      "https://127.0.0.1/secret",
      "https://10.0.0.5/secret",
      "https://192.168.1.10/x",
      "https://172.16.0.1/x",
      "https://169.254.169.254/latest/meta-data",
    ]) {
      await assert.rejects(() => resolveSandboxFile(target, undefined), /private|internal|not allowed/i, target);
    }
  } finally {
    process.env.ACCULYNX_ALLOW_INSECURE_FILE_URLS = "1";
  }
});
