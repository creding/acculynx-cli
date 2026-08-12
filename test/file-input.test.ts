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

test("nonexistent path throws a clear error naming the accepted forms", async () => {
  // Silent null passthrough made the SDK drop the file param, surfacing as
  // AccuLynx's misleading "Filename is required" — see docs/superpowers/specs.
  await assert.rejects(
    () => resolveSandboxFile("no-such-file-anywhere.xyz", undefined),
    (err: Error) => {
      assert.match(err.message, /no-such-file-anywhere\.xyz/);
      assert.match(err.message, /https URL/i);
      assert.match(err.message, /base64/i);
      assert.match(err.message, /cannot read (local )?paths/i);
      return true;
    },
  );
});

test("undefined and empty file inputs still resolve to null", async () => {
  assert.equal(await resolveSandboxFile(undefined, undefined), null);
  assert.equal(await resolveSandboxFile("", undefined), null);
});

// ---- explicit fileName override ----

test("fileName overrides the name for base64 input", async () => {
  const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(300, 7)]);
  const res = await resolveSandboxFile(big.toString("base64"), undefined, {
    fileName: "McPherson Supplement 1 2026-08-12.pdf",
  });
  assert.ok(res);
  assert.equal(path.basename(res.path), "McPherson Supplement 1 2026-08-12.pdf");
  await res.cleanup();
});

test("fileName beats a data URI's ;name= parameter", async () => {
  const uri = `data:application/pdf;name=other.pdf;base64,${Buffer.alloc(300, 7).toString("base64")}`;
  const res = await resolveSandboxFile(uri, undefined, { fileName: "wanted.pdf" });
  assert.ok(res);
  assert.equal(path.basename(res.path), "wanted.pdf");
  await res.cleanup();
});

test("fileName is sanitized to a basename", async () => {
  const big = Buffer.alloc(300, 7).toString("base64");
  const res = await resolveSandboxFile(big, undefined, { fileName: "../../etc/passwd" });
  assert.ok(res);
  assert.equal(path.basename(res.path), "passwd");
  assert.ok(!res.path.includes(".."));
  await res.cleanup();
});

test("fileName renames a local file via a temp copy, leaving the original", async () => {
  const tmp = path.join(os.tmpdir(), `alx-rename-${process.pid}.txt`);
  await fs.writeFile(tmp, "content");
  const res = await resolveSandboxFile(tmp, undefined, { fileName: "renamed.txt" });
  assert.ok(res);
  assert.equal(path.basename(res.path), "renamed.txt");
  assert.equal(await fs.readFile(res.path, "utf8"), "content");
  await res.cleanup();
  await fs.access(tmp); // original untouched
  await fs.rm(tmp);
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

// ---- raw base64 inputs (no data: prefix) ----
// Padded past the 256-char detection floor; sniffing only reads the header,
// so trailing filler bytes don't matter.
const BIG_PNG = Buffer.concat([PNG_BYTES, Buffer.alloc(300, 7)]);
const BIG_PDF = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(300, 7)]);
const BIG_UNKNOWN = Buffer.alloc(320, 0x42);

test("raw base64 PNG decodes to a temp file with a sniffed .png extension", async () => {
  const res = await resolveSandboxFile(BIG_PNG.toString("base64"), undefined);
  assert.ok(res, "raw base64 should resolve, not fall through as a path");
  assert.deepEqual(await fs.readFile(res.path), BIG_PNG);
  assert.equal(path.extname(res.path), ".png");
  await res.cleanup();
  await assert.rejects(fs.access(res.path));
});

test("raw base64 PDF gets a sniffed .pdf extension", async () => {
  const res = await resolveSandboxFile(BIG_PDF.toString("base64"), undefined);
  assert.ok(res);
  assert.equal(path.extname(res.path), ".pdf");
  assert.deepEqual(await fs.readFile(res.path), BIG_PDF);
  await res.cleanup();
});

test("raw base64 with unrecognizable content still resolves, as .bin", async () => {
  const res = await resolveSandboxFile(BIG_UNKNOWN.toString("base64"), undefined);
  assert.ok(res);
  assert.equal(path.extname(res.path), ".bin");
  await res.cleanup();
});

test("raw base64 tolerates whitespace/newlines in the payload", async () => {
  const wrapped = BIG_PNG.toString("base64").replace(/(.{76})/g, "$1\n");
  const res = await resolveSandboxFile(wrapped, undefined);
  assert.ok(res);
  assert.deepEqual(await fs.readFile(res.path), BIG_PNG);
  await res.cleanup();
});

test("short base64-charset strings are treated as paths and get the clear error", async () => {
  // Below the 256-char base64 floor these read as filenames; when no such
  // file exists the caller gets the accepted-forms error, not a silent drop.
  await assert.rejects(() => resolveSandboxFile("hello", undefined), /could not be resolved/i);
  await assert.rejects(() => resolveSandboxFile("aGVsbG8=", undefined), /could not be resolved/i);
});

test("oversized raw base64 is rejected", async () => {
  // 26 MB of zeros — over the 25 MB cap once decoded.
  const huge = Buffer.alloc(26 * 1024 * 1024).toString("base64");
  await assert.rejects(() => resolveSandboxFile(huge, undefined), /too large/i);
});

// ---- data: URI name= parameter (RFC 2397 parameters) ----

test("data URI with ;name= keeps that filename", async () => {
  const uri = `data:application/pdf;name=contract.pdf;base64,${BIG_PDF.toString("base64")}`;
  const res = await resolveSandboxFile(uri, undefined);
  assert.ok(res);
  assert.equal(path.basename(res.path), "contract.pdf");
  assert.deepEqual(await fs.readFile(res.path), BIG_PDF);
  await res.cleanup();
});

test("data URI ;name= is URI-decoded and sanitized to a basename", async () => {
  const uri = `data:image/png;name=..%2F..%2Froof%20photo.png;base64,${PNG_BYTES.toString("base64")}`;
  const res = await resolveSandboxFile(uri, undefined);
  assert.ok(res);
  assert.equal(path.basename(res.path), "roof photo.png");
  assert.ok(!res.path.includes(".."));
  await res.cleanup();
});

test("non-base64 data URI with a name parameter still decodes", async () => {
  const res = await resolveSandboxFile("data:text/plain;name=note.txt,hello%20world", undefined);
  assert.ok(res);
  assert.equal(path.basename(res.path), "note.txt");
  assert.equal(await fs.readFile(res.path, "utf8"), "hello world");
  await res.cleanup();
});

test("unnamed data URI with unknown mime falls back to magic-byte sniffing", async () => {
  const uri = `data:application/octet-stream;base64,${BIG_PNG.toString("base64")}`;
  const res = await resolveSandboxFile(uri, undefined);
  assert.ok(res);
  assert.equal(path.extname(res.path), ".png");
  await res.cleanup();
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

test("fileName overrides the URL-derived name for downloads", async () => {
  const res = await resolveSandboxFile(`${base}/photo.png`, undefined, { fileName: "front-elevation.png" });
  assert.ok(res);
  assert.equal(path.basename(res.path), "front-elevation.png");
  assert.deepEqual(await fs.readFile(res.path), PNG_BYTES);
  await res.cleanup();
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

// ---- URL→fileUri mapping for photo/video uploads ----
// AccuLynx's multipart ingest 500s server-side (reproducible with plain curl),
// but its fileUri mode — where AccuLynx fetches the URL itself — works. For
// URL inputs to media upload, skip the download and hand the URL to AccuLynx.

import { preferFileUriForUrls } from "../src/lib/acculynx.ts";

test("https file input moves to fileUri untouched", () => {
  const body = preferFileUriForUrls({ file: "https://example.com/roof.jpg", description: "d" });
  assert.equal(body.fileUri, "https://example.com/roof.jpg");
  assert.equal(body.file, undefined);
  assert.equal(body.description, "d");
});

test("local path and data URI inputs stay on file", () => {
  const local = preferFileUriForUrls({ file: "photo.jpg" });
  assert.equal(local.file, "photo.jpg");
  assert.equal(local.fileUri, undefined);
  const data = preferFileUriForUrls({ file: "data:image/png;base64,AAAA" });
  assert.equal(data.file, "data:image/png;base64,AAAA");
});

test("an explicit fileUri is left alone", () => {
  const body = preferFileUriForUrls({ fileUri: "https://a.example/x.jpg" });
  assert.equal(body.fileUri, "https://a.example/x.jpg");
});
