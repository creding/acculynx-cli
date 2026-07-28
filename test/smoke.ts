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
  try {
    JSON.parse(s.replace(/\n\.\.\.\[truncated[^\]]*\]$/, ""));
    return true;
  } catch {
    return false;
  }
}
