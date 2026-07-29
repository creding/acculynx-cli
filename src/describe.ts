import { REGISTRY, findEntry } from "./registry.ts";
import { UsageError } from "./lib/errors.ts";
import { introspect } from "./lib/schema-to-flags.ts";
import { makeExample } from "./lib/run-command.ts";

export interface DescribeResult {
  command: string;
  description: string;
  mutates: boolean;
  positional: string | null;
  flags: Array<{ flag: string; type: string; required: boolean; values?: string[]; description: string }>;
  jsonFields: unknown;
  schema: Record<string, any>;
  example: string;
}

export interface SearchResult {
  matches: Array<{ command: string; mutates: boolean; description: string }>;
  suggestion?: string;
}

/**
 * Transport-agnostic describe. Returns the structured payload so the CLI (which
 * prints it) and the MCP server (which returns it as tool output) share one
 * implementation and can never drift.
 */
export function describeCommand(group: string, verb: string): DescribeResult {
  const entry = findEntry(group, verb);
  if (!entry) throw new UsageError(`Unknown command: "${group} ${verb}".`, `Run: acculynx search ${verb}`);
  const shape = introspect(entry.config.inputSchema);
  return {
    command: `acculynx ${group} ${verb}`,
    description: entry.config.description,
    mutates: Boolean(entry.config.approval),
    positional: entry.positional ?? null,
    flags: shape.flags.filter((f) => f.key !== entry.positional).map((f) => ({
      flag: `--${f.flag}`, type: f.type, required: f.required,
      ...(f.enumValues && { values: f.enumValues }), description: f.description,
    })),
    jsonFields: shape.jsonFields,
    schema: shape.jsonSchema,
    example: makeExample(entry, shape),
  };
}

/** Transport-agnostic keyword search over the command registry. */
export function searchCommands(keyword: string): SearchResult {
  const q = keyword.toLowerCase();
  const matches = REGISTRY.filter(
    (e) =>
      e.group.includes(q) || e.verb.includes(q) || e.tool.includes(q) ||
      e.config.description.toLowerCase().includes(q),
  );
  if (matches.length === 0) {
    return { matches: [], suggestion: "Try a broader keyword, or run: acculynx --help" };
  }
  return {
    matches: matches.map((e) => ({
      command: `acculynx ${e.group} ${e.verb}`,
      mutates: Boolean(e.config.approval),
      description: e.config.description,
    })),
  };
}

export function runDescribe(group: string, verb: string): void {
  console.log(JSON.stringify(describeCommand(group, verb), null, 1));
}

export function runSearch(keyword: string): void {
  console.log(JSON.stringify(searchCommands(keyword), null, 1));
}
