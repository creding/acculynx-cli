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
    flags: shape.flags.filter((f) => f.key !== entry.positional).map((f) => ({
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
