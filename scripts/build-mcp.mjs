/**
 * Builds the MCP server into Vercel's Build Output API v3 layout.
 *
 * Why not a plain `api/mcp.ts` function: every module in src/ imports with
 * explicit `.ts` specifiers (tsconfig sets allowImportingTsExtensions), which
 * only resolves under a bundler. Vercel's per-file TS compile would emit
 * imports Node cannot resolve at runtime. So we bundle with esbuild — the same
 * way the CLI is built — and emit the result as a prebuilt function. Using the
 * Build Output API rather than framework detection means the deploy shape is
 * explicit and does not depend on Vercel inferring anything.
 *
 * Run: npm run build:mcp
 */
import { build } from "esbuild";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, ".vercel", "output");
const FUNC = path.join(OUT, "functions", "mcp.func");

await rm(OUT, { recursive: true, force: true });
await mkdir(FUNC, { recursive: true });

const result = await build({
  entryPoints: [path.join(ROOT, "src", "mcp", "http-entry.ts")],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: path.join(FUNC, "index.js"),
  // Several transitive deps (qs, object-inspect) call require() at runtime.
  // ESM output has no require, so hand them the real one.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  logLevel: "warning",
  metafile: true,
});

// The bundle is ESM; mark the function package accordingly.
await writeFile(path.join(FUNC, "package.json"), JSON.stringify({ type: "module" }, null, 2));

await writeFile(
  path.join(FUNC, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.js",
      launcherType: "Nodejs",
      // Gives the handler req.body pre-parsed, matching what http-entry expects.
      shouldAddHelpers: true,
      maxDuration: 60,
    },
    null,
    2,
  ),
);

// Every path routes to the single MCP function.
await writeFile(
  path.join(OUT, "config.json"),
  JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/mcp" }] }, null, 2),
);

const bytes = Object.values(result.metafile.outputs)[0]?.bytes ?? 0;
console.log(`Built .vercel/output → mcp.func (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
