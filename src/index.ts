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
  const pool = candidates.length > 0 ? candidates : REGISTRY.map((e) => `${e.group} ${e.verb}`);
  const target = verb ? `${group} ${verb}` : group;
  const best = [...pool].sort((x, y) => editDistance(target, x) - editDistance(target, y))[0];
  return new UsageError(
    `Unknown command: "${target}".`,
    best ? `Did you mean "acculynx ${best}"? Run: acculynx search ${verb ?? group}` : `Run: acculynx --help`,
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
