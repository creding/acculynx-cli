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
