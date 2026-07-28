# AccuLynx CLI + Claude Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `acculynx`, an LLM-first CLI covering the full AccuLynx v2 API (ported from patriot-agent's 120 tools), plus a Claude Code plugin in the `claude-plugins` marketplace bundling the CLI and skills.

**Architecture:** The CLI keeps patriot-agent's tool files byte-compatible by re-implementing `defineAcculynxTool` (and a `defineTool` shim) as identity/normalizing factories; a registry maps each ported tool to a `group verb` command; a shared pipeline handles flag generation from zod schemas, JSON input merging, validation with schema replay, concise projections, hints, truncation, and structured errors. Build is a single-file esbuild CJS bundle so the plugin ships one file.

**Tech Stack:** Node 22+, TypeScript (strict, `tsc --noEmit` typecheck only), esbuild (bundle), zod 4.4.3, pdf-lib ^1.17.1, `node:util` parseArgs, `node --test` + tsx for tests. SDK: freshly generated `@api/acculynxapi`.

## Global Constraints

- Repo: `/Users/ccreding/github/mcp/acculynx-cli` (exists; contains only `docs/`). Plugin work happens in `/Users/ccreding/github/claude-plugins`.
- Source of ported code: `/Users/ccreding/github/patriot/patriot-agent/agent/agent/` (tools/, lib/, skills/, instructions.md). Never modify patriot-agent.
- SDK generation command, verbatim: `npx api install "@acculynxapi/v2.2614.0#2yp7tr813mrlab3aq"`
- CLI is **never interactive**: no prompts, no colors, no pagers. JSON to stdout; structured error JSON to stderr; exit 0 ok / 1 API-runtime / 2 usage-validation.
- `pageSize` max is 25 (AccuLynx API hard limit). Truncation default `CHARACTER_LIMIT = 25000` chars.
- Auth resolution: env `ACCULYNX_API_KEY` → `~/.config/acculynx/config.json` `apiKey` → structured error with setup hint. Never print or commit a key.
- Ported tool files keep their original import specifiers wherever possible (`../lib/define-acculynx-tool.ts`, `../lib/acculynx.ts`, `../lib/constants.ts`); only `eve/*` imports are rewritten.
- Commit after every task (messages given per task) ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- tsconfig uses `allowImportingTsExtensions` + `noEmit`; the runnable artifact comes from esbuild only.

## File Structure

```
acculynx-cli/
├── .api/apis/acculynxapi/          # generated SDK (Task 1)
├── assets/draft-coc/logo.png       # copied from patriot skills (Task 9)
├── assets/generate-roof-report/logo.png
├── src/
│   ├── index.ts                    # entry: dispatch, help, error rendering (Task 5)
│   ├── registry.ts                 # 120 static imports + CommandEntry manifest (Tasks 5,7)
│   ├── guide.ts                    # `acculynx guide` text (Task 6)
│   ├── describe.ts                 # describe + search (Task 6)
│   ├── commands/                   # ported tool files, original filenames (Tasks 5,7,9)
│   └── lib/
│       ├── constants.ts            # verbatim port (Task 2)
│       ├── approval.ts             # eve approval shim (Task 2)
│       ├── define-acculynx-tool.ts # identity factory (Task 2)
│       ├── define-tool.ts          # raw defineTool shim (Task 2)
│       ├── acculynx.ts             # client/retry/errors/format + local file resolution (Task 2)
│       ├── errors.ts               # UsageError, ValidationError (Task 2)
│       ├── config.ts               # env + config-file resolution (Task 2)
│       ├── schema-to-flags.ts      # zod→flags via z.toJSONSchema (Task 3)
│       ├── run-command.ts          # input build, validate, postprocess, render (Task 4)
│       ├── company.ts              # verbatim port (Task 9)
│       ├── signer.ts               # port; sessionEmail ← ACCULYNX_SIGNER_EMAIL (Task 9)
│       ├── pdf.ts                  # verbatim port (Task 9)
│       └── define-report-tool.ts   # CLI port: file output instead of sandbox/base64 (Task 9)
├── scripts/
│   ├── port-tools.sh               # copy+sed the 118 mechanical ports (Task 7)
│   └── sync-plugin.sh              # build + copy bundle into claude-plugins (Task 12)
├── test/                           # *.test.ts unit tests + smoke.ts
├── package.json, tsconfig.json, .gitignore, README.md

claude-plugins/plugins/acculynx/
├── .claude-plugin/plugin.json
├── cli/acculynx.cjs                # synced bundle (committed here)
└── skills/
    ├── use-acculynx/SKILL.md
    ├── draft-coc/{SKILL.md,assets/logo.png}
    └── generate-roof-report/{SKILL.md,assets/logo.png}
```

---

### Task 1: Repo scaffold, SDK generation, toolchain

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `src/index.ts` (stub)
- Create (generated): `.api/apis/acculynxapi/`

**Interfaces:**
- Produces: `npm run typecheck` (tsc --noEmit), `npm run build` (esbuild → `dist/acculynx.cjs`), `npm test`, dependency `@api/acculynxapi` with SDK client methods (e.g. `getJobs`, `postjob`, `getUsers`).

- [ ] **Step 1: Write package.json**

```json
{
  "name": "acculynx-cli",
  "version": "0.1.0",
  "description": "LLM-first CLI for the full AccuLynx v2 API",
  "type": "module",
  "bin": { "acculynx": "./dist/acculynx.cjs" },
  "engines": { "node": ">=22" },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "esbuild src/index.ts --bundle --platform=node --format=cjs --loader:.png=binary --banner:js='#!/usr/bin/env node' --outfile=dist/acculynx.cjs && chmod +x dist/acculynx.cjs",
    "dev": "tsx src/index.ts",
    "test": "node --import tsx --test test/*.test.ts",
    "smoke": "tsx test/smoke.ts"
  },
  "dependencies": {
    "@api/acculynxapi": "file:.api/apis/acculynxapi",
    "pdf-lib": "^1.17.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "esbuild": "^0.24.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Write .gitignore**

```
node_modules/
dist/
.env
```

- [ ] **Step 4: Write stub src/index.ts**

```ts
const VERSION = "0.1.0";
const argv = process.argv.slice(2);
if (argv[0] === "--version" || argv[0] === "-V") {
  console.log(VERSION);
  process.exit(0);
}
console.error(JSON.stringify({ error: { message: "not implemented yet" } }));
process.exit(1);
```

- [ ] **Step 5: Generate the SDK**

Run in the repo root:

```bash
npx api install "@acculynxapi/v2.2614.0#2yp7tr813mrlab3aq"
```

If it prompts for language/target, choose **TypeScript / Node**. Expected: creates `.api/apis/acculynxapi/` containing `package.json`, `index.ts`, `types.ts`, `schemas.ts`, `openapi.json`. If the installer asks where to install, accept the default `.api` directory.

- [ ] **Step 6: Install deps, verify toolchain**

```bash
npm install
npm run typecheck   # expected: exit 0
npm run build       # expected: dist/acculynx.cjs created
./dist/acculynx.cjs --version   # expected: 0.1.0
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold acculynx-cli with generated AccuLynx SDK"
```

---

### Task 2: Core lib port (constants, shims, client, errors, config)

**Files:**
- Create: `src/lib/constants.ts`, `src/lib/approval.ts`, `src/lib/define-acculynx-tool.ts`, `src/lib/define-tool.ts`, `src/lib/acculynx.ts`, `src/lib/errors.ts`, `src/lib/config.ts`
- Test: `test/config.test.ts`, `test/errors.test.ts`

**Interfaces:**
- Consumes: `@api/acculynxapi` default export (Task 1).
- Produces: `getAccuLynxClient(): any`, `handleApiError(e): string`, `formatToolResponse(data, format): {text, data}`, `resolveSandboxFile(file, ctx)`, `resolveSandboxFiles(input, ctx)`, `defineAcculynxTool(config): CommandConfig`, `defineTool(config): CommandConfig`, `always(): "always"`, `CommandConfig {description, inputSchema, approval?, call(client, input, ctx)}`, `CommandContext {outputPath?}`, `UsageError`, `ValidationError`, `applyConfig()`, `requireApiKey()`, `CHARACTER_LIMIT`, `ResponseFormat`.

- [ ] **Step 1: Copy constants verbatim**

```bash
cp /Users/ccreding/github/patriot/patriot-agent/agent/agent/lib/constants.ts src/lib/constants.ts
```

- [ ] **Step 2: Write src/lib/approval.ts**

```ts
/** CLI stand-in for eve/tools/approval: marks a command as mutating. */
export type Approval = "always";
export const always = (): Approval => "always";
```

- [ ] **Step 3: Write src/lib/define-acculynx-tool.ts**

```ts
import type { z } from "zod";
import type { Approval } from "./approval.ts";

export interface CommandContext {
  /** Output path for report commands (-o/--output). */
  outputPath?: string;
}

export interface CommandConfig<
  TSchema extends z.ZodType<Record<string, unknown>> = z.ZodType<Record<string, unknown>>,
> {
  description: string;
  inputSchema: TSchema;
  approval?: Approval;
  call: (client: any, input: z.output<TSchema>, ctx: CommandContext) => Promise<unknown>;
}

/** Identity factory: ported tool files stay source-compatible with patriot-agent. */
export function defineAcculynxTool<TSchema extends z.ZodType<Record<string, unknown>>>(
  config: CommandConfig<TSchema>,
): CommandConfig {
  return config as unknown as CommandConfig;
}
```

- [ ] **Step 4: Write src/lib/define-tool.ts** (shim for the 10 raw `defineTool` files)

```ts
import type { z } from "zod";
import type { Approval } from "./approval.ts";
import type { CommandConfig, CommandContext } from "./define-acculynx-tool.ts";

interface RawToolConfig<TSchema extends z.ZodType<Record<string, unknown>>> {
  description: string;
  inputSchema: TSchema;
  approval?: Approval;
  execute: (
    input: z.output<TSchema>,
    ctx: CommandContext,
  ) => Promise<{ text: string; data: Record<string, unknown> }>;
  toModelOutput?: (output: { text: string }) => unknown;
}

/**
 * Compat shim for eve's raw defineTool. Raw tools ran formatToolResponse
 * themselves; we unwrap `.data` (the structured record) and let the CLI's
 * output pipeline re-format. Arrays come back as { payload: [...] } per
 * formatToolResponse's structuredRecord rule — acceptable and documented.
 */
export function defineTool<TSchema extends z.ZodType<Record<string, unknown>>>(
  config: RawToolConfig<TSchema>,
): CommandConfig {
  return {
    description: config.description,
    inputSchema: config.inputSchema as unknown as z.ZodType<Record<string, unknown>>,
    ...(config.approval !== undefined && { approval: config.approval }),
    call: async (_client, input, ctx) => {
      const result = await config.execute(input as z.output<TSchema>, ctx);
      return result.data;
    },
  };
}
```

- [ ] **Step 5: Port src/lib/acculynx.ts**

Copy `/Users/ccreding/github/patriot/patriot-agent/agent/agent/lib/acculynx.ts` to `src/lib/acculynx.ts`, then make exactly these changes:

1. Make retry attempts lazy (config file may set the env var after module load). Replace the module-level `const RETRY_MAX_ATTEMPTS = ...` with a function and update its two uses inside `withRetry`:

```ts
const maxAttempts = () => Number(process.env.ACCULYNX_RETRY_ATTEMPTS) || 3;
// in withRetry: `attempt >= maxAttempts()` and the log string `${attempt}/${maxAttempts() - 1}`
```

2. Delete everything from the comment block above `resolveSandboxFile` to the end of the file (the sandbox implementations of `resolveSandboxFile`, `resolveSandboxFiles`, `ResolvedFilesResult`, `DEBUG`, `debugLog`) and replace with local-filesystem versions preserving the signatures:

```ts
/**
 * CLI replacement for the eve sandbox file resolver: the "sandbox" is the
 * local filesystem. Returns the resolved absolute path when the file exists,
 * else null (callers then pass the raw string through to the SDK).
 */
export async function resolveSandboxFile(
  fileInput: string | undefined,
  _ctx: unknown,
): Promise<{ path: string; cleanup: () => Promise<void> } | null> {
  if (!fileInput || typeof fileInput !== "string") return null;
  const resolved = path.resolve(process.cwd(), fileInput);
  try {
    await fs.access(resolved);
    return { path: resolved, cleanup: async () => {} };
  } catch {
    return null;
  }
}

export interface ResolvedFilesResult<T> {
  resolved: T;
  cleanup: () => Promise<void>;
}

/** Recursively resolves file-bearing fields (file, measurementsFile, reportPdf, miscPdfs) to absolute local paths. */
export async function resolveSandboxFiles<T>(
  input: T,
  ctx: unknown,
  isFileField = false,
): Promise<ResolvedFilesResult<T>> {
  async function traverse(val: unknown, isField: boolean): Promise<unknown> {
    if (typeof val === "string" && isField) {
      const fileRes = await resolveSandboxFile(val, ctx);
      return fileRes ? fileRes.path : val;
    }
    if (Array.isArray(val)) return Promise.all(val.map((item) => traverse(item, isField)));
    if (typeof val === "object" && val !== null) {
      const output: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        const checkField =
          isField || k === "file" || k === "measurementsFile" || k === "reportPdf" || k === "miscPdfs";
        output[k] = await traverse(v, checkField);
      }
      return output;
    }
    return val;
  }
  const resolved = (await traverse(input, isFileField)) as T;
  return { resolved, cleanup: async () => {} };
}
```

Keep `import path from "path"; import fs from "fs/promises";` (still used). Everything else (Proxy client, `withRetry`, `handleApiError`, `formatToolResponse`, `NON_API_METHODS`) stays verbatim.

- [ ] **Step 6: Write src/lib/errors.ts**

```ts
/** Bad invocation (unknown command, bad flags, malformed JSON). Exit 2. */
export class UsageError extends Error {
  suggestion?: string;
  constructor(message: string, suggestion?: string) {
    super(message);
    this.suggestion = suggestion;
  }
}

/** Schema validation failure: carries the issues plus a schema replay so the retry needs no extra lookup. Exit 2. */
export class ValidationError extends Error {
  constructor(
    public command: string,
    public issues: Array<{ path: string; message: string }>,
    public schemaReplay: unknown,
    public example: string,
  ) {
    super(`Invalid input for ${command}`);
  }
}
```

- [ ] **Step 7: Write the failing tests** — `test/config.test.ts`:

```ts
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
```

And `test/errors.test.ts`:

```ts
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
```

- [ ] **Step 8: Run tests, verify failure**

Run: `npm test`
Expected: FAIL — `config.ts` does not exist yet (errors.test may already pass; that's fine).

- [ ] **Step 9: Write src/lib/config.ts**

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { UsageError } from "./errors.ts";

export interface CliConfig {
  apiKey?: string;
  signerEmail?: string;
  timeoutMs?: number;
  retryAttempts?: number;
}

function configPath(): string {
  const home = process.env.ACCULYNX_CONFIG_HOME || os.homedir();
  return path.join(home, ".config", "acculynx", "config.json");
}

export function loadConfig(): CliConfig {
  try {
    return JSON.parse(fs.readFileSync(configPath(), "utf8")) as CliConfig;
  } catch {
    return {};
  }
}

/** Env wins; config file fills gaps. Applied to process.env so lib/acculynx.ts works unchanged. */
export function applyConfig(): void {
  const cfg = loadConfig();
  if (!process.env.ACCULYNX_API_KEY && cfg.apiKey) process.env.ACCULYNX_API_KEY = cfg.apiKey;
  if (!process.env.ACCULYNX_SIGNER_EMAIL && cfg.signerEmail) process.env.ACCULYNX_SIGNER_EMAIL = cfg.signerEmail;
  if (!process.env.ACCULYNX_TIMEOUT_MS && cfg.timeoutMs) process.env.ACCULYNX_TIMEOUT_MS = String(cfg.timeoutMs);
  if (!process.env.ACCULYNX_RETRY_ATTEMPTS && cfg.retryAttempts)
    process.env.ACCULYNX_RETRY_ATTEMPTS = String(cfg.retryAttempts);
}

export function requireApiKey(): void {
  if (!process.env.ACCULYNX_API_KEY) {
    throw new UsageError(
      "ACCULYNX_API_KEY is not set.",
      'Export it (export ACCULYNX_API_KEY=...) or add {"apiKey": "..."} to ~/.config/acculynx/config.json.',
    );
  }
}
```

- [ ] **Step 10: Run tests and typecheck, verify pass**

Run: `npm test && npm run typecheck`
Expected: all PASS, typecheck exit 0.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: port core lib — client, retry, errors, formatting, config, eve shims"
```

---

### Task 3: schema-to-flags introspection

**Files:**
- Create: `src/lib/schema-to-flags.ts`
- Test: `test/schema-to-flags.test.ts`

**Interfaces:**
- Produces: `introspect(schema: z.ZodType): CommandShape`, `kebab(key: string): string`, types `FlagSpec {key, flag, type, enumValues?, required, description}`, `JsonFieldSpec {key, required, description}`, `CommandShape {flags, jsonFields, jsonSchema}`.

- [ ] **Step 1: Write the failing test** — `test/schema-to-flags.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test`
Expected: FAIL — cannot find `schema-to-flags.ts`.

- [ ] **Step 3: Write src/lib/schema-to-flags.ts**

```ts
import { z } from "zod";

export interface FlagSpec {
  key: string;
  flag: string;
  type: "string" | "number" | "boolean";
  enumValues?: string[];
  required: boolean;
  description: string;
}

export interface JsonFieldSpec {
  key: string;
  required: boolean;
  description: string;
}

export interface CommandShape {
  flags: FlagSpec[];
  jsonFields: JsonFieldSpec[];
  jsonSchema: Record<string, any>;
}

export function kebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Unwraps anyOf/oneOf nullable wrappers to the first concrete variant. */
function unwrap(p: any): any {
  if (p?.anyOf) return p.anyOf.find((v: any) => v.type !== "null") ?? p.anyOf[0];
  if (p?.oneOf) return p.oneOf.find((v: any) => v.type !== "null") ?? p.oneOf[0];
  return p ?? {};
}

export function introspect(schema: z.ZodType): CommandShape {
  const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Record<string, any>;
  const props: Record<string, any> = jsonSchema.properties ?? {};
  const required = new Set<string>((jsonSchema.required as string[]) ?? []);
  const flags: FlagSpec[] = [];
  const jsonFields: JsonFieldSpec[] = [];
  for (const [key, raw] of Object.entries(props)) {
    if (key === "response_format") continue; // global --format supplies this
    const p = unwrap(raw);
    const description: string = raw?.description ?? p.description ?? "";
    const isScalar = p.enum !== undefined || ["string", "number", "integer", "boolean"].includes(p.type);
    if (isScalar) {
      flags.push({
        key,
        flag: kebab(key),
        type: p.type === "boolean" ? "boolean" : p.type === "number" || p.type === "integer" ? "number" : "string",
        ...(p.enum !== undefined && { enumValues: (p.enum as unknown[]).map(String) }),
        required: required.has(key),
        description,
      });
    } else {
      jsonFields.push({ key, required: required.has(key), description });
    }
  }
  return { flags, jsonFields, jsonSchema };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test && npm run typecheck` — expected: PASS. If `z.toJSONSchema` rejects an option name, check zod 4.4.3's signature (`z.toJSONSchema(schema, {io: "input"})`) and drop unsupported options; the `unrepresentable: "any"` option prevents throws on transforms.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: zod schema introspection — scalar flags vs JSON fields"
```

---

### Task 4: Input building, validation, output pipeline

**Files:**
- Create: `src/lib/run-command.ts`
- Test: `test/run-command.test.ts`

**Interfaces:**
- Consumes: `CommandShape`/`introspect` (Task 3), `ValidationError`/`UsageError` (Task 2), `CHARACTER_LIMIT` (Task 2).
- Produces:
  - `GlobalOptions {format: "json"|"md", full: boolean, fields?: string[], json?: string, input?: string, limitChars: number, output?: string}`
  - `buildInput(entry, shape, positionals, flagValues, opts): Record<string, unknown>`
  - `validateInput(entry, shape, input): Record<string, unknown>`
  - `postprocess(entry, result, opts): unknown`
  - `renderOutput(payload, opts): string`
  - `stripEmpty(value): unknown`, `makeExample(shape): string` (also used by describe)
  - `CommandEntry` type import comes from Task 5's registry; to avoid a cycle, define it HERE and have registry import it:
  - `CommandEntry {group, verb, tool, config: CommandConfig, positional?: string, project?: string[], hints?: string[]}`

- [ ] **Step 1: Write the failing tests** — `test/run-command.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { introspect } from "../src/lib/schema-to-flags.ts";
import {
  buildInput, validateInput, postprocess, renderOutput, stripEmpty, type CommandEntry,
} from "../src/lib/run-command.ts";
import { ValidationError, UsageError } from "../src/lib/errors.ts";

const schema = z.object({
  jobId: z.string().describe("Job UUID"),
  pageSize: z.number().optional(),
  contact: z.object({ id: z.string() }).optional(),
});
const entry: CommandEntry = {
  group: "jobs", verb: "get", tool: "t", positional: "jobId",
  config: { description: "d", inputSchema: schema, call: async () => ({}) },
};
const shape = introspect(schema);
const opts = { format: "json" as const, full: false, limitChars: 25000 };

test("buildInput: positional + flags override JSON payload", () => {
  const input = buildInput(entry, shape, ["abc-123"], { "page-size": "5" }, { ...opts, json: '{"pageSize": 9, "contact": {"id": "c1"}}' });
  assert.deepEqual(input, { jobId: "abc-123", pageSize: 5, contact: { id: "c1" } });
});

test("buildInput: malformed JSON throws UsageError", () => {
  assert.throws(() => buildInput(entry, shape, [], {}, { ...opts, json: "{nope" }), UsageError);
});

test("validateInput: failure carries issues, schema replay, and example", () => {
  try {
    validateInput(entry, shape, { pageSize: "x" });
    assert.fail("should throw");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.ok(e.issues.some((i) => i.path.includes("jobId")));
    assert.ok(e.schemaReplay);
    assert.match(e.example, /jobs get/);
  }
});

test("stripEmpty removes null/undefined/empty objects deeply", () => {
  assert.deepEqual(stripEmpty({ a: 1, b: null, c: { d: null }, e: [null, 2] }), { a: 1, e: [null, 2] });
});

test("postprocess: projection produces items + _meta; --full disables; hints attach", () => {
  const listEntry: CommandEntry = { ...entry, project: ["id", "name"], hints: ["next: acculynx jobs get <id>"] };
  const result = { items: [{ id: "1", name: "A", junk: "x" }], totalCount: 40, recordStartIndex: 0 };
  const concise = postprocess(listEntry, result, opts) as any;
  assert.deepEqual(concise.items, [{ id: "1", name: "A" }]);
  assert.equal(concise._meta.totalCount, 40);
  assert.deepEqual(concise._hints, ["next: acculynx jobs get <id>"]);
  const full = postprocess(listEntry, result, { ...opts, full: true }) as any;
  assert.equal(full.items[0].junk, "x");
});

test("renderOutput truncates with guidance", () => {
  const out = renderOutput({ big: "y".repeat(200) }, { ...opts, limitChars: 50 });
  assert.ok(out.length < 260);
  assert.match(out, /truncated at 50 chars/);
  assert.match(out, /--fields/);
});
```

- [ ] **Step 2: Run tests, verify fail**

Run: `npm test` — expected: FAIL, `run-command.ts` missing.

- [ ] **Step 3: Write src/lib/run-command.ts**

```ts
import fs from "node:fs";
import type { z } from "zod";
import type { CommandConfig } from "./define-acculynx-tool.ts";
import type { CommandShape, FlagSpec } from "./schema-to-flags.ts";
import { UsageError, ValidationError } from "./errors.ts";

export interface CommandEntry {
  group: string;
  verb: string;
  tool: string;
  config: CommandConfig;
  /** Input key promoted to the first positional argument. */
  positional?: string;
  /** Concise-projection fields for list output (dot paths allowed). */
  project?: string[];
  /** Next-step hints attached to successful results. */
  hints?: string[];
}

export interface GlobalOptions {
  format: "json" | "md";
  full: boolean;
  fields?: string[];
  json?: string;
  input?: string;
  limitChars: number; // 0 = no limit
  output?: string;
}

export function buildInput(
  entry: CommandEntry,
  shape: CommandShape,
  positionals: string[],
  flagValues: Record<string, string | boolean | undefined>,
  opts: GlobalOptions,
): Record<string, unknown> {
  let base: Record<string, unknown> = {};
  const rawJson =
    opts.json ?? (opts.input ? (opts.input === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(opts.input, "utf8")) : undefined);
  if (rawJson !== undefined) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      throw new UsageError(`--json/--input is not valid JSON: ${(e as Error).message}`);
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new UsageError("--json/--input must be a JSON object");
    }
    base = parsed as Record<string, unknown>;
  }
  if (positionals.length > 0) {
    if (!entry.positional) {
      throw new UsageError(
        `Unexpected positional argument "${positionals[0]}".`,
        `Run: acculynx describe ${entry.group} ${entry.verb}`,
      );
    }
    base[entry.positional] = positionals[0];
    if (positionals.length > 1) throw new UsageError(`Too many positional arguments (expected 1: <${entry.positional}>).`);
  }
  for (const spec of shape.flags) {
    const v = flagValues[spec.flag];
    if (v === undefined) continue;
    base[spec.key] = coerce(spec, v);
  }
  return base;
}

function coerce(spec: FlagSpec, v: string | boolean): unknown {
  if (spec.type === "boolean") return v === true || v === "true";
  if (spec.type === "number") {
    const n = Number(v);
    if (Number.isNaN(n)) throw new UsageError(`--${spec.flag} expects a number, got "${v}"`);
    return n;
  }
  return v;
}

export function makeExample(entry: CommandEntry, shape: CommandShape): string {
  const parts = [`acculynx ${entry.group} ${entry.verb}`];
  if (entry.positional) parts.push(`<${entry.positional}>`);
  const jsonExample: Record<string, unknown> = {};
  for (const f of shape.flags) {
    if (!f.required || f.key === entry.positional) continue;
    parts.push(`--${f.flag} ${sampleFor(f.type, f.enumValues, f.key)}`);
  }
  for (const jf of shape.jsonFields) {
    if (jf.required) jsonExample[jf.key] = sampleFromSchema(shape.jsonSchema.properties?.[jf.key]);
  }
  if (Object.keys(jsonExample).length > 0) parts.push(`--json '${JSON.stringify(jsonExample)}'`);
  return parts.join(" ");
}

function sampleFor(type: string, enumValues: string[] | undefined, key: string): string {
  if (enumValues?.length) return enumValues[0];
  if (type === "number") return "1";
  if (type === "boolean") return "true";
  if (/date/i.test(key)) return "2026-07-28";
  if (/id$/i.test(key)) return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  return '"text"';
}

function sampleFromSchema(prop: any): unknown {
  const p = prop?.anyOf?.[0] ?? prop ?? {};
  if (p.type === "array") return [sampleFromSchema(p.items)];
  if (p.type === "object") {
    const out: Record<string, unknown> = {};
    for (const key of (p.required as string[]) ?? Object.keys(p.properties ?? {}).slice(0, 3)) {
      out[key] = sampleFromSchema(p.properties?.[key]);
    }
    return out;
  }
  if (p.enum?.length) return p.enum[0];
  if (p.type === "number" || p.type === "integer") return 1;
  if (p.type === "boolean") return true;
  return "text";
}

export function validateInput(
  entry: CommandEntry,
  shape: CommandShape,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = (entry.config.inputSchema as z.ZodType).safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new ValidationError(`${entry.group} ${entry.verb}`, issues, shape.jsonSchema, makeExample(entry, shape));
  }
  return parsed.data as Record<string, unknown>;
}

export function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined) continue;
      const s = stripEmpty(v);
      if (s && typeof s === "object" && !Array.isArray(s) && Object.keys(s).length === 0) continue;
      out[k] = s;
    }
    return out;
  }
  return value;
}

function dig(obj: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

function pick(obj: unknown, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = dig(obj, f);
    if (v !== undefined && v !== null) out[f] = v;
  }
  return out;
}

const PAGINATION_KEYS = ["totalCount", "totalRecordCount", "recordStartIndex", "pageStartIndex", "pageSize", "count"];

export function postprocess(entry: CommandEntry, result: unknown, opts: GlobalOptions): unknown {
  let out = stripEmpty(result);
  const fields = opts.fields ?? (!opts.full ? entry.project : undefined);
  if (fields && out && typeof out === "object" && !Array.isArray(out)) {
    const payload = out as Record<string, unknown>;
    if (Array.isArray(payload.items)) {
      const meta: Record<string, unknown> = { count: payload.items.length };
      for (const key of PAGINATION_KEYS) if (payload[key] !== undefined) meta[key] = payload[key];
      out = {
        items: payload.items.map((item) => pick(item, fields)),
        _meta: meta,
        _note: "Concise view — use --full for complete records or --fields a,b,c to choose fields.",
      };
    } else {
      out = pick(payload, fields);
    }
  }
  if (entry.hints?.length && out && typeof out === "object" && !Array.isArray(out)) {
    (out as Record<string, unknown>)._hints = entry.hints;
  }
  return out;
}

export function renderOutput(payload: unknown, opts: GlobalOptions): string {
  const jsonString = JSON.stringify(payload, null, 1);
  let text = opts.format === "md" ? "```json\n" + jsonString + "\n```" : jsonString;
  if (opts.limitChars > 0 && text.length > opts.limitChars) {
    text =
      text.slice(0, opts.limitChars) +
      `\n...[truncated at ${opts.limitChars} chars — narrow with --fields, --page-size, or filters; raise with --limit-chars N or --no-limit]`;
  }
  return text;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test && npm run typecheck` — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: command pipeline — input building, validation replay, projections, truncation"
```

---

### Task 5: Dispatch, help, error rendering, first command (ping)

**Files:**
- Create: `src/registry.ts`, `src/commands/acculynx_get_ping.ts` (ported), rewrite `src/index.ts`
- Test: `test/cli.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–4.
- Produces: `REGISTRY: CommandEntry[]`, `findEntry(group, verb)`, working binary with `--help`, group help, `[read]`/`[mutates]` labels, structured errors with did-you-mean, exit codes. Registry group order fixed as: jobs, contacts, estimates, financials, invoices, payments, appointments, documents, media, users, settings, reports, misc.

- [ ] **Step 1: Port the ping tool**

```bash
mkdir -p src/commands
sed -e 's#from "eve/tools/approval"#from "../lib/approval.ts"#' \
    -e 's#from "eve/tools"#from "../lib/define-tool.ts"#' \
    /Users/ccreding/github/patriot/patriot-agent/agent/agent/tools/acculynx_get_ping.ts > src/commands/acculynx_get_ping.ts
```

- [ ] **Step 2: Write src/registry.ts**

```ts
import type { CommandEntry } from "./lib/run-command.ts";
import getPing from "./commands/acculynx_get_ping.ts";

export const GROUP_ORDER = [
  "jobs", "contacts", "estimates", "financials", "invoices", "payments",
  "appointments", "documents", "media", "users", "settings", "reports", "misc",
] as const;

export const REGISTRY: CommandEntry[] = [
  { group: "misc", verb: "ping", tool: "acculynx_get_ping", config: getPing },
];

export function findEntry(group: string | undefined, verb: string | undefined): CommandEntry | undefined {
  return REGISTRY.find((e) => e.group === group && e.verb === verb);
}
```

- [ ] **Step 3: Write the failing tests** — `test/cli.test.ts` (spawns the CLI via tsx):

```ts
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
  assert.match(err.error.suggestion, /jobs/);
});

test("missing API key yields setup hint, exit 2", () => {
  const r = spawnSync("npx", ["tsx", "src/index.ts", "misc", "ping"], {
    encoding: "utf8",
    env: { ...process.env, ACCULYNX_API_KEY: "", ACCULYNX_CONFIG_HOME: "/nonexistent" },
  });
  assert.equal(r.status, 2);
  assert.match(JSON.parse(r.stderr).error.suggestion, /config.json/);
});
```

- [ ] **Step 4: Run tests, verify fail**

Run: `npm test` — expected: cli.test FAILs (index.ts is still the stub).

- [ ] **Step 5: Rewrite src/index.ts**

```ts
import { parseArgs } from "node:util";
import { REGISTRY, GROUP_ORDER, findEntry } from "./registry.ts";
import { applyConfig, requireApiKey } from "./lib/config.ts";
import { UsageError, ValidationError } from "./lib/errors.ts";
import { introspect } from "./lib/schema-to-flags.ts";
import {
  buildInput, validateInput, postprocess, renderOutput, type GlobalOptions, type CommandEntry,
} from "./lib/run-command.ts";
import { getAccuLynxClient, handleApiError } from "./lib/acculynx.ts";
import { CHARACTER_LIMIT } from "./lib/constants.ts";
import { runDescribe, runSearch } from "./describe.ts";
import { GUIDE } from "./guide.ts";

const VERSION = "0.1.0";

const GLOBAL_FLAG_NAMES = new Set([
  "format", "full", "fields", "json", "input", "limit-chars", "no-limit", "output", "help",
]);

function label(e: CommandEntry): string {
  return e.config.approval ? "[mutates]" : "[read]";
}

function firstSentence(s: string): string {
  return s.split(/(?<=\.)\s/)[0];
}

function printRootHelp(): void {
  const lines = [
    "acculynx — LLM-first CLI for the AccuLynx v2 API",
    "",
    "Usage: acculynx <group> <command> [args]   |   acculynx <group> --help",
    "",
    "Groups:",
    ...GROUP_ORDER.map((g) => {
      const n = REGISTRY.filter((e) => e.group === g).length;
      return `  ${g.padEnd(14)} ${n} commands`;
    }),
    "",
    "Top-level commands:",
    "  guide                       Operational primer (read this first)",
    "  search <keyword>            Find commands by keyword",
    "  describe <group> <command>  Full input schema + example for one command",
    "",
    "Global flags: --format json|md, --full, --fields a,b,c, --json '<obj>', --input file.json|-,",
    "              --limit-chars N, --no-limit, -o/--output <path> (reports), --help, --version",
    "",
    "Auth: export ACCULYNX_API_KEY=... (or ~/.config/acculynx/config.json)",
  ];
  console.log(lines.join("\n"));
}

function printGroupHelp(group: string): void {
  const entries = REGISTRY.filter((e) => e.group === group);
  if (entries.length === 0) throw unknownCommand(group, undefined);
  console.log(`acculynx ${group} — commands:\n`);
  for (const e of entries) {
    console.log(`  ${e.verb.padEnd(28)} ${label(e).padEnd(10)} ${firstSentence(e.config.description)}`);
  }
  console.log(`\nDetails: acculynx describe ${group} <command>`);
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function unknownCommand(group: string, verb: string | undefined): UsageError {
  const candidates = verb
    ? REGISTRY.filter((e) => e.group === group).map((e) => `${e.group} ${e.verb}`)
    : [...new Set(REGISTRY.map((e) => e.group))];
  const target = verb ? `${group} ${verb}` : group;
  const best = candidates.sort((x, y) => editDistance(target, x) - editDistance(target, y))[0];
  return new UsageError(
    `Unknown command: "${target}".`,
    best
      ? `Did you mean "acculynx ${best}"? Run: acculynx search ${verb ?? group}`
      : `Run: acculynx --help`,
  );
}

async function runCommand(entry: CommandEntry, rest: string[]): Promise<void> {
  const shape = introspect(entry.config.inputSchema);
  const options: Record<string, { type: "string" | "boolean"; short?: string }> = {
    format: { type: "string" }, full: { type: "boolean" }, fields: { type: "string" },
    json: { type: "string" }, input: { type: "string" },
    "limit-chars": { type: "string" }, "no-limit": { type: "boolean" },
    output: { type: "string", short: "o" }, help: { type: "boolean", short: "h" },
  };
  for (const f of shape.flags) {
    if (!GLOBAL_FLAG_NAMES.has(f.flag)) options[f.flag] = { type: f.type === "boolean" ? "boolean" : "string" };
  }
  let values: Record<string, string | boolean | undefined>;
  let positionals: string[];
  try {
    ({ values, positionals } = parseArgs({ args: rest, options, allowPositionals: true, strict: true }) as any);
  } catch (e) {
    throw new UsageError((e as Error).message, `Run: acculynx describe ${entry.group} ${entry.verb}`);
  }
  if (values.help) {
    runDescribe(entry.group, entry.verb);
    return;
  }
  const opts: GlobalOptions = {
    format: values.format === "md" ? "md" : "json",
    full: values.full === true,
    fields: typeof values.fields === "string" ? values.fields.split(",").map((s) => s.trim()) : undefined,
    json: values.json as string | undefined,
    input: values.input as string | undefined,
    limitChars: values["no-limit"] === true ? 0 : Number(values["limit-chars"] ?? CHARACTER_LIMIT),
    output: values.output as string | undefined,
  };
  const input = buildInput(entry, shape, positionals, values, opts);
  const parsed = validateInput(entry, shape, input);
  requireApiKey();
  const client = getAccuLynxClient();
  const result = await entry.config.call(client, parsed, { outputPath: opts.output });
  console.log(renderOutput(postprocess(entry, result, opts), opts));
}

function fail(error: unknown): never {
  if (error instanceof ValidationError) {
    console.error(
      JSON.stringify(
        { error: { message: error.message, issues: error.issues, schema: error.schemaReplay, example: error.example } },
        null, 1,
      ),
    );
    process.exit(2);
  }
  if (error instanceof UsageError) {
    console.error(JSON.stringify({ error: { message: error.message, suggestion: error.suggestion } }, null, 1));
    process.exit(2);
  }
  console.error(JSON.stringify({ error: { message: handleApiError(error) } }, null, 1));
  process.exit(1);
}

async function main(): Promise<void> {
  applyConfig();
  const argv = process.argv.slice(2);
  const [first, second, ...rest] = argv;
  if (!first || first === "--help" || first === "-h") return printRootHelp();
  if (first === "--version" || first === "-V") return void console.log(VERSION);
  if (first === "guide") return void console.log(GUIDE);
  if (first === "search") {
    if (!second) throw new UsageError("search requires a keyword.", "Example: acculynx search insurance");
    return runSearch(second);
  }
  if (first === "describe") {
    if (!second || !rest[0]) throw new UsageError("describe requires: acculynx describe <group> <command>");
    return runDescribe(second, rest[0]);
  }
  if (!second || second === "--help" || second === "-h") return printGroupHelp(first);
  const entry = findEntry(first, second);
  if (!entry) throw unknownCommand(first, second);
  await runCommand(entry, rest);
}

main().catch(fail);
```

- [ ] **Step 6: Stub describe.ts and guide.ts** (fully implemented in Task 6)

`src/describe.ts`:

```ts
import { REGISTRY, findEntry } from "./registry.ts";
import { UsageError } from "./lib/errors.ts";
import { introspect } from "./lib/schema-to-flags.ts";
import { makeExample } from "./lib/run-command.ts";

export function runDescribe(group: string, verb: string): void {
  const entry = findEntry(group, verb);
  if (!entry) throw new UsageError(`Unknown command: "${group} ${verb}".`, `Run: acculynx search ${verb}`);
  const shape = introspect(entry.config.inputSchema);
  console.log(JSON.stringify({
    command: `acculynx ${group} ${verb}`,
    description: entry.config.description,
    mutates: Boolean(entry.config.approval),
    positional: entry.positional ?? null,
    flags: shape.flags.map((f) => ({
      flag: `--${f.flag}`, type: f.type, required: f.required,
      ...(f.enumValues && { values: f.enumValues }), description: f.description,
    })),
    jsonFields: shape.jsonFields,
    schema: shape.jsonSchema,
    example: makeExample(entry, shape),
  }, null, 1));
}

export function runSearch(keyword: string): void {
  const q = keyword.toLowerCase();
  const matches = REGISTRY.filter(
    (e) =>
      e.group.includes(q) || e.verb.includes(q) || e.tool.includes(q) ||
      e.config.description.toLowerCase().includes(q),
  );
  if (matches.length === 0) {
    console.log(JSON.stringify({ matches: [], suggestion: "Try a broader keyword, or run: acculynx --help" }, null, 1));
    return;
  }
  console.log(JSON.stringify({
    matches: matches.map((e) => ({
      command: `acculynx ${e.group} ${e.verb}`,
      mutates: Boolean(e.config.approval),
      description: e.config.description,
    })),
  }, null, 1));
}
```

`src/guide.ts` (placeholder single line for now; full text in Task 6):

```ts
export const GUIDE = "Guide is written in Task 6.";
```

- [ ] **Step 7: Run tests, verify pass**

Run: `npm test && npm run typecheck` — expected: PASS. Also verify manually: `npx tsx src/index.ts misc --help` shows ping with `[read]`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: dispatch, help trees, structured errors, first ported command (ping)"
```

---

### Task 6: guide, describe/search polish

**Files:**
- Modify: `src/guide.ts`
- Test: `test/describe.test.ts`

**Interfaces:**
- Consumes: `REGISTRY` (grows in Task 7; tests here only rely on `misc ping`).
- Produces: final `GUIDE` string.

- [ ] **Step 1: Write the failing tests** — `test/describe.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests** — describe/search should already pass from Task 5 stubs; guide FAILs.

- [ ] **Step 3: Write the full guide in src/guide.ts**

The content below is the condensed, CLI-ified version of patriot-agent's `instructions.md`. Use it verbatim:

````ts
export const GUIDE = `# AccuLynx CLI — operational primer

Discovery-first workflow: \`acculynx --help\` (groups) → \`acculynx <group> --help\` (commands)
→ \`acculynx describe <group> <command>\` (schema + example) → run it.
\`acculynx search <keyword>\` finds commands by intent. Output is JSON; errors are JSON on stderr.

## Domain model
- **Job**: the primary entity for any project or prospective work order. (Not "project"/"deal".)
- **Lead**: a Job in the "Lead (Unassigned)" milestone — not a separate record type.
- **Contact**: the customer/owner. Every Job references exactly one Contact at creation.

## Creating a job (multi-step, always in this order)
1. Find the contact: \`acculynx contacts list --search "<name>"\`. If a match exists, ASK THE USER
   whether to reuse it before creating a duplicate. Else \`acculynx contacts create\`
   (contactTypeIds are UUIDs from \`acculynx contacts types\`; jobCategory/workType ids are numeric).
2. Discover reference ids as needed: \`acculynx settings lead-sources|job-categories|work-types|trade-types\`,
   \`acculynx users list\`.
3. \`acculynx jobs create --json '{"contact":{"id":"..."}, ...}'\`. If the user hasn't named an assignee,
   ASK before assigning. New leads may only get companyRepresentativeIds — salesOwnerIds/arOwnerIds
   require the Approved milestone. Inspect assignmentErrors in the result before claiming success.

## Searching jobs — two mutually exclusive modes
- \`--search "<term>"\`: global search by street/customer/job-number. ALL other filters are ignored.
- No \`--search\`: filtered listing. sortOrder defaults to Ascending, so "latest N" needs
  \`--sort-by CreatedDate --sort-order Descending --page-size N\`. Milestone names must come from
  \`acculynx settings milestones\` (never guess). Date windows: --start-date/--end-date + --date-filter-type.
- Jobs assigned to a user: \`acculynx jobs list-by-user\` (bounded scan; report truncatedScan: true honestly).

## Hard API limits (do not fight these)
- pageSize max is 25 everywhere; paginate with recordStartIndex/pageStartIndex.
- No endpoint changes a job's milestone/status; no delete for jobs/contacts; no reading message threads
  (posting/replying only). Say "not supported" instead of inventing commands.
- Production schedules/work orders have no REST resource: \`acculynx jobs production-schedule <jobId>\`
  parses the job's recent history events (latest 50 only — say so if incomplete).
- Initial appointments live on the job (\`acculynx jobs initial-appointment\`), NOT on company calendars.
  Calendars: appointments calendars → appointments list (calendarId + date window) → appointments get.

## Financials
Use the job-scoped commands: \`acculynx financials for-job <jobId>\` (contract totals/worksheets),
\`acculynx estimates list-for-job <jobId>\`, \`acculynx invoices list-for-job <jobId>\`,
\`acculynx payments for-job <jobId>\`. Never guess external ledger ids.

## Documents & reports
Upload: resolve folder UUID via \`acculynx documents folders\`, then \`acculynx documents add\`.
PDF generation: \`acculynx reports coc\` / \`acculynx reports roof-report\` write a PDF locally
(-o path) for user review; upload AFTER the user confirms, to the "Certificate of Completion" /
"Roof Report" folder (fallback "Other").

## Conduct
- Mutating commands are labeled [mutates] — confirm details (amounts, dates, recipients) with the
  user before running them, and report the real result including errors.
- Never present a raw UUID to a user — resolve it (contacts get, users get, jobs get) first.
- Truncated output ends with a truncation marker: narrow the query; don't assume the data ended.
- Transient failures already retried (429/5xx); a surfaced error is persistent — don't blind-retry.
`;
````

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test` — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: guide, describe, and search — discovery surface complete"
```

---

### Task 7: Port all remaining tools and build the full registry

**Files:**
- Create: `scripts/port-tools.sh`, `src/commands/*.ts` (117 more files)
- Modify: `src/registry.ts`
- Test: `test/registry.test.ts`

**Interfaces:**
- Consumes: shims and factory from Task 2.
- Produces: full `REGISTRY` (118 entries this task; reports coc/roof-report land in Task 9 for 120 total).

- [ ] **Step 1: Write scripts/port-tools.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
SRC=/Users/ccreding/github/patriot/patriot-agent/agent/agent/tools
DEST=src/commands
mkdir -p "$DEST"
for f in "$SRC"/*.ts; do
  base=$(basename "$f")
  case "$base" in
    # Report generators are ported by hand in Task 9 (they use define-report-tool)
    acculynx_generate_coc_pdf.ts|acculynx_generate_roof_report_pdf.ts) continue ;;
  esac
  sed -e 's#from "eve/tools/approval"#from "../lib/approval.ts"#' \
      -e 's#from "eve/tools"#from "../lib/define-tool.ts"#' \
      "$f" > "$DEST/$base"
done
echo "Ported $(ls "$DEST" | wc -l | tr -d ' ') command files."
```

Run: `bash scripts/port-tools.sh` — expected: `Ported 118 command files.`

- [ ] **Step 2: Typecheck and fix SDK drift**

Run: `npm run typecheck`

The SDK was regenerated at v2.2614.0, so some client method names or payload types may differ from what the ported `call` bodies expect. For each error: open `.api/apis/acculynxapi/index.ts`, find the current method name for the same endpoint (match by path/verb in the JSDoc), and update the ported file's `client.<method>` call — change nothing else. If an endpoint was **removed** from the SDK, stop and report it (do not delete the command silently). Note: `client` is `any` at the Proxy boundary, so most drift will NOT typecheck-fail — after fixing compile errors, also run `grep -oh "client\.\w*" src/commands/*.ts | sort -u` and verify every method name appears in `.api/apis/acculynxapi/index.ts` (write a quick shell check; investigate any miss).

- [ ] **Step 3: Register all commands in src/registry.ts**

Add one static import and one `REGISTRY` entry per file. The complete tool → command mapping (M = mutating — must match the file's `approval` presence; the registry does not set mutation, the config's `approval` field does):

| Tool file | group | verb |
|---|---|---|
| acculynx_get_ping | misc | ping (already present) |
| acculynx_get_jobs | jobs | list |
| acculynx_get_job | jobs | get |
| acculynx_create_job | jobs | create M |
| acculynx_get_jobs_by_assigned_user | jobs | list-by-user |
| acculynx_get_job_contacts | jobs | contacts |
| acculynx_get_job_contact | jobs | contact |
| acculynx_get_job_current_milestone | jobs | current-milestone |
| acculynx_get_job_milestone_by_id | jobs | milestone |
| acculynx_get_job_milestone_history | jobs | milestone-history |
| acculynx_get_job_status_by_id | jobs | status |
| acculynx_get_lead_history | jobs | lead-history |
| acculynx_get_job_production_schedule | jobs | production-schedule |
| acculynx_get_job_external_references | jobs | external-references |
| acculynx_post_create_job_external_reference | jobs | add-external-reference M |
| acculynx_get_job_custom_fields | jobs | custom-fields |
| acculynx_get_job_custom_field_by_id | jobs | custom-field |
| acculynx_put_job_custom_fields | jobs | set-custom-fields M |
| acculynx_put_job_custom_field_by_id | jobs | set-custom-field M |
| acculynx_get_job_accounting_status | jobs | accounting-status |
| acculynx_get_job_adjuster | jobs | adjuster |
| acculynx_put_adjuster_for_job | jobs | set-adjuster M |
| acculynx_get_job_insurance | jobs | insurance |
| acculynx_put_insurance_information_for_job | jobs | set-insurance M |
| acculynx_put_insurance_company_for_job | jobs | set-insurance-company M |
| acculynx_get_job_representatives | jobs | representatives |
| acculynx_get_company_representative_for_job | jobs | company-rep |
| acculynx_get_sales_owner_for_job | jobs | sales-owner |
| acculynx_get_ar_owner_for_job | jobs | ar-owner |
| acculynx_post_company_representative_for_job | jobs | set-company-rep M |
| acculynx_post_sales_owner_for_job | jobs | set-sales-owner M |
| acculynx_post_ar_owner_for_job | jobs | set-ar-owner M |
| acculynx_delete_sales_owner_from_job | jobs | remove-sales-owner M |
| acculynx_delete_ar_owner_from_job | jobs | remove-ar-owner M |
| acculynx_put_job_location_address | jobs | set-location M |
| acculynx_put_priority_for_job | jobs | set-priority M |
| acculynx_update_job_category | jobs | set-category M |
| acculynx_update_job_work_type | jobs | set-work-type M |
| acculynx_update_job_trade_types | jobs | set-trade-types M |
| acculynx_update_job_lead_source | jobs | set-lead-source M |
| acculynx_create_job_message | jobs | add-message M |
| acculynx_post_reply_job_message | jobs | reply-message M |
| acculynx_get_job_initial_appointment | jobs | initial-appointment |
| acculynx_set_initial_appointment | jobs | set-initial-appointment M |
| acculynx_delete_job_initial_appointment | jobs | delete-initial-appointment M |
| acculynx_post_job_measurements_upload | jobs | upload-measurements M |
| acculynx_post_job_measurements_upload_files | jobs | upload-measurement-files M |
| acculynx_get_contacts | contacts | list |
| acculynx_get_contact | contacts | get |
| acculynx_create_contact | contacts | create M |
| acculynx_get_contact_types | contacts | types |
| acculynx_add_contact_log | contacts | add-log M |
| acculynx_get_contact_phone_numbers | contacts | phone-numbers |
| acculynx_get_contact_phone_number_by_id | contacts | phone-number |
| acculynx_get_contact_email_addresses | contacts | email-addresses |
| acculynx_get_contact_email_address_by_id | contacts | email-address |
| acculynx_get_contact_custom_fields | contacts | custom-fields |
| acculynx_get_contact_custom_field_by_id | contacts | custom-field |
| acculynx_put_contact_custom_fields | contacts | set-custom-fields M |
| acculynx_put_contact_custom_field_by_id | contacts | set-custom-field M |
| acculynx_get_estimates | estimates | list |
| acculynx_get_estimate_by_id | estimates | get |
| acculynx_get_job_estimates | estimates | list-for-job |
| acculynx_get_estimate_sections | estimates | sections |
| acculynx_get_estimate_section_by_id | estimates | section |
| acculynx_get_estimate_section_items | estimates | section-items |
| acculynx_get_estimate_section_item | estimates | section-item |
| acculynx_get_job_financials | financials | for-job |
| acculynx_get_financials_by_financial_id | financials | get |
| acculynx_get_worksheet_by_id | financials | worksheet |
| acculynx_get_worksheet_amendments_by_id | financials | amendments |
| acculynx_get_worksheet_amendment_by_id | financials | amendment |
| acculynx_post_worksheet_section_item | financials | add-worksheet-item M |
| acculynx_get_financials_supplements_for_company | financials | supplements |
| acculynx_get_supplement_by_id | financials | supplement |
| acculynx_get_financials_supplement_item_collection | financials | supplement-items |
| acculynx_get_financials_supplement_notation_collection | financials | supplement-notations |
| acculynx_get_invoice | invoices | get |
| acculynx_get_job_invoices | invoices | list-for-job |
| acculynx_get_payments | payments | list |
| acculynx_get_job_payments | payments | for-job |
| acculynx_create_payment_received | payments | add-received M |
| acculynx_post_create_payment_paid | payments | add-paid M |
| acculynx_post_create_payment_additional_expense | payments | add-expense M |
| acculynx_get_calendars | appointments | calendars |
| acculynx_get_appointments | appointments | list |
| acculynx_get_appointment | appointments | get |
| acculynx_get_company_document_folders | documents | folders |
| acculynx_add_job_document | documents | add M |
| acculynx_post_upload_photo_or_video | media | upload M |
| acculynx_get_photo_video_tags | media | tags |
| acculynx_get_users | users | list |
| acculynx_get_user | users | get |
| acculynx_get_company_settings | settings | company |
| acculynx_get_milestones | settings | milestones |
| acculynx_get_statuses_for_milestone | settings | milestone-statuses |
| acculynx_get_lead_sources | settings | lead-sources |
| acculynx_get_lead_source_by_id | settings | lead-source |
| acculynx_get_lead_source_child_by_id | settings | lead-source-child |
| acculynx_get_job_categories | settings | job-categories |
| acculynx_get_work_types | settings | work-types |
| acculynx_get_trade_types | settings | trade-types |
| acculynx_get_insurance_companies | settings | insurance-companies |
| acculynx_get_custom_fields | settings | custom-fields |
| acculynx_get_active_account_types | settings | account-types |
| acculynx_get_account_type_by_id | settings | account-type |
| acculynx_get_company_settings_location_settings_countries | settings | countries |
| acculynx_get_location_settings_country_states | settings | country-states |
| acculynx_get_accu_lynx_countries | settings | al-countries |
| acculynx_get_accu_lynx_country | settings | al-country |
| acculynx_get_accu_lynx_states | settings | al-states |
| acculynx_get_accu_lynx_state | settings | al-state |
| acculynx_get_units_of_measure | settings | units-of-measure |
| acculynx_get_reports_by_instance_instance_runs_by_schedule_id | reports | runs |
| acculynx_get_report_latest_instance | reports | latest-run |
| acculynx_get_report_by_instance_id | reports | run |
| acculynx_get_reports_recipients_by_instance_id | reports | run-recipients |
| acculynx_get_report_instace_recipient_by_id | reports | run-recipient |

**Positional promotion rule (apply per entry while registering):** run `acculynx describe`-style introspection mentally or via the schema file — if the command's input schema has **exactly one required field whose name ends in `Id`** (e.g. `jobId`, `contactId`, `estimateId`, `financialsId`, `supplementId`, `userId`, `calendarId`, `milestoneId`), set `positional: "<thatField>"`. If zero or multiple required `*Id` fields, no positional. (Import naming: camelCase the file basename, e.g. `getJobCustomFields`.)

- [ ] **Step 4: Write test/registry.test.ts**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { REGISTRY } from "../src/registry.ts";
import { introspect, kebab } from "../src/lib/schema-to-flags.ts";

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
```

- [ ] **Step 5: Run tests and typecheck, fix registration mistakes until green**

Run: `npm test && npm run typecheck` — expected: PASS. If a flag collides with a global (e.g. a schema field literally named `format`), remove that field from flag generation by leaving it to `--json` — add a `jsonOnly?: string[]` field to `CommandEntry` and filter those keys from `shape.flags` inside `runCommand`; record which command needed it in the commit message.

- [ ] **Step 6: Verify help + describe breadth manually**

```bash
npx tsx src/index.ts jobs --help          # ~47 commands with labels
npx tsx src/index.ts describe jobs create # schema + example with contact.id
npx tsx src/index.ts search insurance     # finds jobs insurance / set-insurance / set-insurance-company / settings insurance-companies
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port all 118 API tools and register full command surface"
```

---

### Task 8: Projections and hints

**Files:**
- Modify: `src/registry.ts` (add `project`/`hints` to specific entries)
- Test: extend `test/registry.test.ts`

**Interfaces:** consumes `postprocess` (Task 4) — mechanism already tested; this task wires real field lists.

- [ ] **Step 1: Discover real list-item field names (read-only, live)**

Requires `ACCULYNX_API_KEY` exported. For each of: `jobs list`, `contacts list`, `users list`, `estimates list`, `payments list`, `appointments list` (needs a calendarId from `appointments calendars` and a date window) run with `--full --limit-chars 4000` and note each item's identifying fields (id + name/number + status/milestone + a date). Example:

```bash
npx tsx src/index.ts jobs list --page-size 2 --full --limit-chars 4000
```

- [ ] **Step 2: Set projections on those six entries**

Using the observed field names (dot paths allowed), e.g. for jobs (adjust to reality):

```ts
{ group: "jobs", verb: "list", tool: "acculynx_get_jobs", config: getJobs,
  project: ["id", "jobNumber", "jobName", "milestoneName", "createdDate"] },
```

- [ ] **Step 3: Add hints to key mutations and generators**

```ts
// jobs create:
hints: [
  "Inspect assignmentErrors above before reporting success.",
  "Assign reps later: acculynx jobs set-company-rep --json '{...}' (new leads: company reps only; sales/AR owners require Approved milestone).",
],
// contacts create:
hints: ["Create a job for this contact: acculynx jobs create --json '{\"contact\":{\"id\":\"<id>\"}}'"],
// payments add-received / add-paid / add-expense:
hints: ["Verify: acculynx payments for-job <jobId>"],
// documents add:
hints: ["Folder UUIDs come from: acculynx documents folders"],
```

- [ ] **Step 4: Add a regression test** (append to `test/registry.test.ts`)

```ts
test("core list commands have concise projections; jobs create has hints", () => {
  for (const key of ["jobs list", "contacts list", "users list"]) {
    const [g, v] = key.split(" ");
    const e = REGISTRY.find((x) => x.group === g && x.verb === v)!;
    assert.ok(e.project && e.project.length >= 3, `${key} missing projection`);
    assert.ok(e.project.includes("id"));
  }
  const create = REGISTRY.find((x) => x.group === "jobs" && x.verb === "create")!;
  assert.ok(create.hints && create.hints.length > 0);
});
```

- [ ] **Step 5: Run tests, verify pass; spot-check live output is concise**

```bash
npm test
npx tsx src/index.ts jobs list --page-size 3   # concise items + _meta + _note
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: concise projections for list commands and next-step hints for mutations"
```

---

### Task 9: PDF reports (coc, roof-report)

**Files:**
- Create: `src/lib/company.ts`, `src/lib/signer.ts`, `src/lib/pdf.ts`, `src/lib/define-report-tool.ts`, `src/commands/acculynx_generate_coc_pdf.ts`, `src/commands/acculynx_generate_roof_report_pdf.ts`, `assets/draft-coc/logo.png`, `assets/generate-roof-report/logo.png`
- Modify: `src/registry.ts`
- Test: `test/reports.test.ts`

**Interfaces:**
- Consumes: `resolveSigner` signature `(ctx, defaults, overrides) => Promise<SignerInfo>` preserved from patriot; `CommandContext.outputPath` (Task 2); `-o/--output` global flag (Task 5).
- Produces: `reports coc` and `reports roof-report` commands returning `{success, documentType, fileName, filePath, signer}` JSON.

- [ ] **Step 1: Copy source files and assets**

```bash
P=/Users/ccreding/github/patriot/patriot-agent/agent/agent
cp "$P/lib/company.ts" "$P/lib/pdf.ts" "$P/lib/signer.ts" src/lib/
mkdir -p assets/draft-coc assets/generate-roof-report
cp "$P/skills/draft-coc/assets/logo.png" assets/draft-coc/logo.png
cp "$P/skills/generate-roof-report/assets/logo.png" assets/generate-roof-report/logo.png
```

`company.ts` and `pdf.ts` need no changes (env-overridable defaults; pdf-lib only).

- [ ] **Step 2: Adapt signer.ts** — replace only the `sessionEmail` function:

```ts
/** CLI: the "session" identity is the configured signer email. */
function sessionEmail(_ctx: unknown): string | null {
  const email = process.env.ACCULYNX_SIGNER_EMAIL;
  return typeof email === "string" && email.includes("@") ? email : null;
}
```

Everything else in signer.ts stays verbatim (user lookup, phone formatting, fallback chain).

- [ ] **Step 3: Port define-report-tool.ts**

Read `$P/lib/define-report-tool.ts` fully first. Keep its config contract (`documentType`, `description`, `skillName`, `uploadFolder`, `fileSuffix`, `inputSchema`, `signerDefaults`, `slugSource`, `render`) and its letterhead/pagination/file-naming logic. Change exactly three things:

1. **Logo loading:** load from the CLI's bundled assets instead of the skill folder. With esbuild's `--loader:.png=binary` a static import yields a `Uint8Array`:

```ts
import cocLogo from "../../assets/draft-coc/logo.png";
import roofLogo from "../../assets/generate-roof-report/logo.png";
const LOGOS: Record<string, Uint8Array> = { "draft-coc": cocLogo, "generate-roof-report": roofLogo };
// where the original read the file: const logoBytes = LOGOS[config.skillName];
```

Add `src/png.d.ts` so tsc accepts it: `declare module "*.png" { const bytes: Uint8Array; export default bytes; }` (and add `"src/**/*.d.ts"` is already covered by include).

2. **Output:** instead of writing to the eve sandbox and returning base64, write to disk and return metadata. Where the original persisted the PDF:

```ts
import { writeFile } from "node:fs/promises";
import path from "node:path";
// inside execute/call, after `const pdfBytes = await doc.save()` (match the original's variable names):
const fileName = `${slug}-${config.fileSuffix}.pdf`;          // slug logic unchanged from original
const filePath = path.resolve(ctx.outputPath ?? fileName);     // -o wins; default: cwd
await writeFile(filePath, pdfBytes);
return {
  success: true,
  documentType: config.documentType,
  fileName,
  filePath,
  signer: { name: signer.name, email: signer.email },
  uploadFolder: config.uploadFolder,
};
```

3. **Factory shape:** export the result as a `CommandConfig` (`call(client, input, ctx)`) using `defineAcculynxTool`; drop eve's `defineTool`/`toModelOutput`/base64/approval plumbing. `resolveSigner(ctx, config.signerDefaults, overrides)` call stays; overrides still come from `signerName`/`signerTitle`/`signerEmail`/`signerPhone` input fields if the original schema includes them.

- [ ] **Step 4: Port the two report tool files**

Copy `$P/tools/acculynx_generate_coc_pdf.ts` and `$P/tools/acculynx_generate_roof_report_pdf.ts` into `src/commands/`, changing only the import to `from "../lib/define-report-tool.ts"`. Their `inputSchema` and `render` bodies stay untouched. Register:

```ts
{ group: "reports", verb: "coc", tool: "acculynx_generate_coc_pdf", config: generateCocPdf,
  hints: ["Show the PDF to the user for review; after confirmation upload with: acculynx documents add --job <jobId> --file <filePath> --document-folder-id <id> (folders: acculynx documents folders — target 'Certificate of Completion', fallback 'Other')"] },
{ group: "reports", verb: "roof-report", tool: "acculynx_generate_roof_report_pdf", config: generateRoofReportPdf,
  hints: ["Show the PDF to the user for review; after confirmation upload with: acculynx documents add --job <jobId> --file <filePath> --document-folder-id <id> (folders: acculynx documents folders — target 'Roof Report', fallback 'Other')"] },
```

(Adjust the `documents add` flag names in the hints to whatever `describe documents add` actually reports.)

- [ ] **Step 5: Write test/reports.test.ts**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("reports coc renders a real PDF to -o path with no API key needed for defaults", () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "alx-pdf-")), "coc.pdf");
  // Build the minimal valid input from: npx tsx src/index.ts describe reports coc
  // Use the example it prints; supply the mandatory completion date and customer name.
  const describe = spawnSync("npx", ["tsx", "src/index.ts", "describe", "reports", "coc"], { encoding: "utf8" });
  const example: string = JSON.parse(describe.stdout).example;
  const args = example.replace(/^acculynx\s+/, "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)!.map((a) => a.replace(/^['"]|['"]$/g, ""));
  const r = spawnSync("npx", ["tsx", "src/index.ts", ...args, "-o", out], {
    encoding: "utf8",
    env: { ...process.env, ACCULYNX_API_KEY: "test-key", ACCULYNX_SIGNER_EMAIL: "" },
  });
  assert.equal(r.status, 0, r.stderr);
  const meta = JSON.parse(r.stdout);
  assert.equal(meta.success, true);
  assert.equal(meta.filePath, out);
  const bytes = fs.readFileSync(out);
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  assert.ok(bytes.length > 5000);
});
```

If the generated example lacks a field the render requires (schema-optional but render-mandatory), extend the args in the test with that field explicitly and note it in the test comment.

- [ ] **Step 6: Run tests, typecheck, build**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS; bundle succeeds with the binary png loader; `./dist/acculynx.cjs describe reports coc` works.

- [ ] **Step 7: Update registry.test.ts expectations**

The "every command file is registered" test now covers 120 files and should pass unchanged (it derives from the directory). Run `npm test` to confirm.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: COC and roof-report PDF generation with env-based signer"
```

---

### Task 10: Smoke script and live verification

**Files:**
- Create: `test/smoke.ts`

- [ ] **Step 1: Write test/smoke.ts**

```ts
/** Live read-only smoke test. Skips (exit 0, with notice) when ACCULYNX_API_KEY is unset. */
import { spawnSync } from "node:child_process";

if (!process.env.ACCULYNX_API_KEY) {
  console.log("SKIP: ACCULYNX_API_KEY not set — smoke test requires live credentials.");
  process.exit(0);
}

const CASES: { args: string[]; expectJson: boolean }[] = [
  { args: ["misc", "ping"], expectJson: true },
  { args: ["users", "list", "--page-size", "5"], expectJson: true },
  { args: ["jobs", "list", "--page-size", "1"], expectJson: true },
  { args: ["settings", "milestones"], expectJson: true },
  { args: ["describe", "jobs", "create"], expectJson: true },
  { args: ["search", "insurance"], expectJson: true },
  { args: ["guide"], expectJson: false },
];

let failed = 0;
for (const c of CASES) {
  const r = spawnSync("node", ["dist/acculynx.cjs", ...c.args], { encoding: "utf8" });
  const ok = r.status === 0 && (!c.expectJson || safeJson(r.stdout));
  console.log(`${ok ? "PASS" : "FAIL"}  acculynx ${c.args.join(" ")}`);
  if (!ok) {
    failed++;
    console.log(`  status=${r.status}\n  stderr=${r.stderr.slice(0, 500)}`);
  }
}
process.exit(failed === 0 ? 0 : 1);

function safeJson(s: string): boolean {
  try { JSON.parse(s.replace(/\n\.\.\.\[truncated[^\]]*\]$/, "")); return true; } catch { return false; }
}
```

Note: truncated JSON won't parse — the regex strips the marker, but a mid-string truncation still fails; for smoke cases the payloads are small enough that this shouldn't trigger. If `jobs list` output truncates, add `--fields id` to the case.

- [ ] **Step 2: Build and run live**

```bash
npm run build && npm run smoke
```

Expected: 7 PASS lines. Investigate any FAIL (likely SDK method drift not caught by Task 7's grep — fix in the command file).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: live read-only smoke suite"
```

---

### Task 11: README and v0.1.0 tag

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md** — cover, in this order: what it is (one paragraph, LLM-first CLI for AccuLynx v2, ported from patriot-agent's tool suite); install (`npm install && npm run build`, or `npm link` for a global `acculynx`); auth (env var + config file, exact names); the discovery workflow (`--help` → group help → `describe` → run, plus `guide`/`search`); global flags table; one worked example per: read (`jobs list`), mutation (`payments add-received`), report (`reports coc` → `documents add`); development (typecheck/test/smoke/build commands); the port provenance note (patriot-agent is the origin; changes to tool behavior should land here first going forward). Keep it under 120 lines; no marketing prose.

- [ ] **Step 2: Final full check**

```bash
npm test && npm run typecheck && npm run build && npm run smoke
```

Expected: everything green.

- [ ] **Step 3: Commit and tag**

```bash
git add -A
git commit -m "docs: README"
git tag v0.1.0
```

---

### Task 12: Plugin scaffold and CLI bundle sync

**Files (in `/Users/ccreding/github/claude-plugins`):**
- Create: `plugins/acculynx/.claude-plugin/plugin.json`, `plugins/acculynx/cli/acculynx.cjs` (synced), `plugins/acculynx/cli/VERSION`
- Modify: `.claude-plugin/marketplace.json`
- Create (in acculynx-cli): `scripts/sync-plugin.sh`

- [ ] **Step 1: Write scripts/sync-plugin.sh in acculynx-cli**

```bash
#!/usr/bin/env bash
set -euo pipefail
PLUGIN=/Users/ccreding/github/claude-plugins/plugins/acculynx
npm run build
mkdir -p "$PLUGIN/cli"
cp dist/acculynx.cjs "$PLUGIN/cli/acculynx.cjs"
node -e "console.log(require('./package.json').version)" > "$PLUGIN/cli/VERSION"
echo "Synced acculynx.cjs $(cat "$PLUGIN/cli/VERSION") -> $PLUGIN/cli/"
```

Run: `bash scripts/sync-plugin.sh` — expected: bundle copied.

- [ ] **Step 2: Write plugins/acculynx/.claude-plugin/plugin.json**

```json
{
  "name": "acculynx",
  "description": "Full-featured AccuLynx connector: a bundled LLM-first CLI covering the complete AccuLynx v2 API (jobs, leads, contacts, financials, payments, documents, reports) plus skills for guided workflows and PDF document generation.",
  "version": "0.1.0",
  "author": { "name": "Christopher Reding" }
}
```

- [ ] **Step 3: Add the marketplace entry** — in `.claude-plugin/marketplace.json`, append to `plugins`:

```json
{
  "name": "acculynx",
  "description": "Full-featured AccuLynx connector: bundled CLI for the complete AccuLynx v2 API plus workflow and PDF-report skills.",
  "version": "0.1.0",
  "source": "./plugins/acculynx",
  "author": { "name": "Christopher Reding" }
}
```

- [ ] **Step 4: Verify the bundled CLI runs standalone**

```bash
node /Users/ccreding/github/claude-plugins/plugins/acculynx/cli/acculynx.cjs --version   # 0.1.0
node /Users/ccreding/github/claude-plugins/plugins/acculynx/cli/acculynx.cjs guide | head -5
```

- [ ] **Step 5: Commit both repos**

```bash
cd /Users/ccreding/github/mcp/acculynx-cli && git add -A && git commit -m "build: plugin sync script"
cd /Users/ccreding/github/claude-plugins && git add -A && git commit -m "feat: acculynx plugin — bundled CLI and marketplace entry"
```

---

### Task 13: use-acculynx skill

**Files:**
- Create: `claude-plugins/plugins/acculynx/skills/use-acculynx/SKILL.md`

- [ ] **Step 1: Write SKILL.md** — use this content verbatim:

````markdown
---
name: use-acculynx
description: Work with AccuLynx (roofing CRM) — jobs, leads, contacts, estimates, invoices, payments, financial worksheets, insurance, appointments, document uploads, and PDF report generation — via the bundled acculynx CLI. Use whenever the user asks about AccuLynx data or wants to create/update anything in AccuLynx: look up or create jobs and leads, find contacts, check financials or payments, schedule appointments, upload documents or photos, or draft Certificates of Completion / roof reports.
---

# AccuLynx via the bundled CLI

All AccuLynx operations run through one bundled CLI (no MCP server, no other setup):

```bash
node "${CLAUDE_PLUGIN_ROOT}/cli/acculynx.cjs" <group> <command> [args]
```

Define a shorthand once per session: `ALX='node ${CLAUDE_PLUGIN_ROOT}/cli/acculynx.cjs'` and invoke as `$ALX ...` — every example below uses `acculynx` to mean this.

Requires `ACCULYNX_API_KEY` in the environment (or `~/.config/acculynx/config.json` with `{"apiKey": "..."}`). If it's missing, ask the user to set it — never ask them to paste the key into chat.

## Discovery-first — do not guess flags

1. `acculynx guide` — operational primer (worth running once per session; it is authoritative on domain rules).
2. `acculynx --help` / `acculynx <group> --help` — enumerate commands, labeled `[read]` / `[mutates]`.
3. `acculynx describe <group> <command>` — exact input schema + a runnable example. Run this before any command you haven't used this session.
4. `acculynx search <keyword>` — find commands by intent.

Output is JSON (concise projections for lists — add `--full` or `--fields a,b,c` for more; `_meta` carries pagination; `_hints` suggests the next command). Errors are JSON on stderr with a `suggestion` field — follow it.

## Non-negotiable workflow rules

- **Contact-first job creation**: search contacts before creating one; if a plausible match exists, ask the user reuse-vs-new. Ask before assigning people to a job; new leads accept only `companyRepresentativeIds` (sales/AR owners need Approved milestone). After `jobs create`, check `assignmentErrors` before reporting success.
- **Mutations** (`[mutates]` label): confirm amounts, dates, recipients, and message text with the user before running; report the real result including errors.
- **Never show raw UUIDs** to the user — resolve them (`contacts get`, `users get`, `jobs get`) first.
- **Milestone names are company-specific**: discover with `acculynx settings milestones`; never guess.
- **"Latest N jobs"** requires `--sort-order Descending` (API default is Ascending). `--search` mode ignores every other filter.
- **pageSize max is 25.** Truncated output means narrow the query, not end of data.
- **Not supported by the API** (say so; don't improvise): changing job milestones/statuses, deleting jobs/contacts, reading message threads (posting/replying only).

## PDF documents (COC / roof report)

`acculynx reports coc ...` / `acculynx reports roof-report ...` render a real PDF locally (`-o <path>`; the JSON result includes `filePath`). Flow: gather user-owned facts (COC: supplements + mandatory Project Completion Date — never guess it), generate, show the PDF to the user for review, iterate freely (regeneration is free), and only after confirmation upload with `acculynx documents add` into the folder named in `_hints` (folder UUIDs from `acculynx documents folders`). Signing is automatic from `ACCULYNX_SIGNER_EMAIL`/company defaults — only pass signer overrides if the user explicitly asks to sign as someone else. Detailed field-by-field workflows: the `draft-coc` and `generate-roof-report` skills.
````

- [ ] **Step 2: Verify the skill file loads** — confirm frontmatter parses (name + description present, no tabs) and paths match the plugin layout from Task 12.

- [ ] **Step 3: Commit**

```bash
cd /Users/ccreding/github/claude-plugins && git add -A && git commit -m "feat: use-acculynx skill — CLI discovery workflow and domain rules"
```

---

### Task 14: Report skills port + acceptance check

**Files:**
- Create: `claude-plugins/plugins/acculynx/skills/draft-coc/SKILL.md` (+ `assets/logo.png`), `claude-plugins/plugins/acculynx/skills/generate-roof-report/SKILL.md` (+ `assets/logo.png`)

- [ ] **Step 1: Copy the source skills**

```bash
P=/Users/ccreding/github/patriot/patriot-agent/agent/agent/skills
D=/Users/ccreding/github/claude-plugins/plugins/acculynx/skills
cp -R "$P/draft-coc" "$D/draft-coc"
cp -R "$P/generate-roof-report" "$D/generate-roof-report"
```

- [ ] **Step 2: Adapt both SKILL.md files** — apply these exact substitutions throughout, keeping all domain content (field lists, data-gathering rules, folder targets) unchanged:

| Original (eve) | Replacement (CLI) |
|---|---|
| `acculynx_generate_coc_pdf` tool call | `acculynx reports coc ... -o <path>` (schema: `acculynx describe reports coc`) |
| `acculynx_generate_roof_report_pdf` tool call | `acculynx reports roof-report ... -o <path>` (schema: `acculynx describe reports roof-report`) |
| `acculynx_add_job_document` tool call | `acculynx documents add ...` (schema: `acculynx describe documents add`) |
| `acculynx_get_company_document_folders` | `acculynx documents folders` |
| "the chat embeds the PDF for review" / base64/sandbox language | "the PDF is written to disk at `filePath`; open/show it to the user for review" |
| approval-gate language ("parks for approval") | "confirm with the user in chat before running the upload command" |
| any `load_skill` reference | remove (Claude Code loads skills automatically) |

Also ensure each file's frontmatter has `name` (`draft-coc` / `generate-roof-report`) and a `description` that triggers on: drafting a Certificate of Completion / requesting funds release (COC), or generating a roof inspection report (roof-report). If the originals' frontmatter differs, rewrite to that standard.

- [ ] **Step 3: Commit**

```bash
cd /Users/ccreding/github/claude-plugins && git add -A && git commit -m "feat: draft-coc and generate-roof-report skills adapted to the CLI flow"
```

- [ ] **Step 4: Acceptance check (spec's agent-usability gate)**

Install the plugin locally (marketplace `creding-plugins` is already configured for this machine; otherwise `claude plugin marketplace add /Users/ccreding/github/claude-plugins` then `claude plugin install acculynx@creding-plugins`). Then in a **fresh** Claude Code session with `ACCULYNX_API_KEY` set, give exactly this prompt:

> Using AccuLynx, find the most recently created job and tell me its name, milestone, and outstanding balance.

Pass criteria: the agent completes it using only the skill + CLI discovery (`describe`/`--help`), with no invented flags and no human correction. If it stumbles, fix the friction at the source — usually the skill text, a `describe` example, or an error `suggestion` — and repeat until it passes. Record what was changed in the commit message.

- [ ] **Step 5: Final commit of any acceptance fixes**

```bash
cd /Users/ccreding/github/mcp/acculynx-cli && git add -A && git commit -m "fix: agent-usability polish from acceptance run" || true
cd /Users/ccreding/github/claude-plugins && git add -A && git commit -m "fix: agent-usability polish from acceptance run" || true
```
