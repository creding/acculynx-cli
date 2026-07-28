# AccuLynx CLI + Claude Plugin — Design

**Date:** 2026-07-28
**Status:** Approved (pending final spec review)

## Goal

Build `acculynx`, a robust standalone CLI covering the full AccuLynx v2 API surface, as the single reusable integration core. Thin skills sit on top per surface: a Claude Code plugin (in the `claude-plugins` marketplace repo) now, and later an Eve skill in patriot-agent — replacing both the 21-tool acculynx-mcp-server and, eventually, the 120 tools embedded in the Eve agent.

Rationale for CLI over MCP: 120 MCP tool schemas cost 40–70k context tokens at rest and pollute the tool list even when deferred. A CLI with progressive disclosure (`--help`, `describe`) costs near-zero context, composes with `jq`/pipes/files, and is reusable from any agent that has a shell.

## Source material

- **patriot-agent** (`~/github/patriot/patriot-agent/agent`): 120 tools in `agent/tools/`, each `{description, inputSchema (zod), call(client, input)}` on a shared `defineAcculynxTool` shell; `agent/lib/acculynx.ts` (singleton SDK client, retry/backoff on 408/429/5xx/network with Retry-After support, error mapping, `formatToolResponse` markdown/JSON + truncation); `agent/lib/pdf.ts` (LetterheadDocument), `define-report-tool.ts`, `signer.ts`, `company.ts`; `agent/instructions.md` (204 lines of domain guidance); skills `draft-coc`, `generate-roof-report`.
- **acculynx-mcp-server** (`~/github/mcp/acculynx-mcp-server`): predecessor, 21 MCP tools. Left untouched; retire after the CLI proves out.
- **claude-plugins** (`~/github/claude-plugins`): personal marketplace (`creding-plugins`), one existing plugin (nanobanana) whose bundled-scripts pattern the new plugin follows.

## Repo: `~/github/mcp/acculynx-cli`

Own git repo, npm package `acculynx-cli`, bin `acculynx`. Node 22+, TypeScript, ESM.

```
acculynx-cli/
├── .api/apis/acculynxapi/     # freshly generated SDK (see SDK section)
├── src/
│   ├── index.ts               # entrypoint: arg parsing, dispatch, exit codes
│   ├── registry.ts            # imports all commands; group/verb manifest
│   ├── define-command.ts      # CLI command factory (same config shape as defineAcculynxTool)
│   ├── lib/
│   │   ├── acculynx.ts        # ported: client singleton, retry, errors, formatting
│   │   ├── constants.ts       # ResponseFormat, CHARACTER_LIMIT
│   │   ├── config.ts          # env + ~/.config/acculynx/config.json resolution
│   │   ├── schema-to-flags.ts # zod → flags; zod → JSON schema (describe)
│   │   ├── pdf.ts             # ported LetterheadDocument
│   │   ├── signer.ts          # env/config-based signer resolution
│   │   └── company.ts         # company identity + fallbacks
│   └── commands/              # ~120 command files ported from agent/tools/
├── test/                      # factory unit tests + live smoke script
├── docs/superpowers/specs/    # this spec
└── package.json               # bin, build (tsc), committed dist for bundling
```

## SDK refresh

Generate the SDK fresh in this repo rather than copying patriot-agent's copy:

```bash
npx api install "@acculynxapi/v2.2614.0#2yp7tr813mrlab3aq"
```

Then depend on it as `"@api/acculynxapi": "file:.api/apis/acculynxapi"`. Because ported `call` bodies reference SDK method names that may have changed between versions, the port is validated by `tsc` typecheck against the new SDK plus the smoke tests; any renamed/added endpoints are reconciled during the port (new endpoints noted in the plan, not silently skipped).

## Command model

Grouped noun/verb commands, mapped from the 120 tools via an explicit manifest in `registry.ts`:

| Group | Contents (examples) |
|---|---|
| `jobs` | list, get, create, search-by-user, messages, milestones, history, custom-fields, representatives (get/set/remove sales-owner, company-rep, ar-owner), insurance, adjuster, location, priority, category, work-type, trade-types, lead-source, external-references, accounting-status, production-schedule, initial-appointment (get/set/delete), measurements |
| `contacts` | list, get, create, types, logs, phone-numbers, email-addresses, custom-fields |
| `estimates` | list, get, sections, section-items |
| `financials` | get, worksheet, worksheet-items (add), amendments, supplements |
| `invoices` | get, list-for-job |
| `payments` | list, overview, received (create), paid (create), expense (create) |
| `appointments` | calendars, list, get |
| `documents` | folders, add |
| `media` | upload (photos/videos), tags |
| `users` | list, get |
| `settings` | company, milestones, statuses, lead-sources, job-categories, work-types, trade-types, insurance-companies, account-types, custom-fields, countries/states, units-of-measure |
| `reports` | coc, roof-report (PDF generation); scheduled report runs/recipients |
| `misc` | ping |

Exact tool→command mapping is finalized in the implementation plan; every one of the 120 tools gets a home (nothing dropped).

Command shape:

```bash
acculynx jobs list --search "Maple St" --milestones lead,prospect --page-size 10
acculynx jobs get <jobId>
acculynx jobs create --json '{"contact":{"id":"..."}}'
acculynx jobs create --input payload.json
acculynx reports coc --job <jobId> -o coc.pdf
```

- **Command factory:** `define-command.ts` accepts the exact `defineAcculynxTool` config shape (`description`, `inputSchema`, `call`, plus `approval` accepted-and-mapped to a `mutating` flag used only for help-text labeling). Tool files port with only the import line and export changed.
- **Positional args:** manifest can promote one required id field (e.g. `jobId`) to a positional.
- **Flags:** scalar zod fields (string/number/boolean/enum) auto-become `--kebab-case` flags. Nested objects/arrays come via `--json` (inline) or `--input <file>` (or `-` for stdin); flags and JSON merge, flags win.
- **Validation:** zod parses the merged input; failures print the zod issues and exit 2.

## LLM-first ergonomics

The primary user is an LLM agent driving the CLI through a shell. Every design choice optimizes for: an agent that has never seen the CLI can discover what it needs in 1–2 cheap calls, act, and recover from mistakes without human help.

1. **Never interactive.** No TTY prompts, no confirmations, no pagers. All input comes from flags/JSON/stdin; anything else is an immediate usage error. No ANSI colors or spinners when stdout is not a TTY (and plain output even when it is).
2. **Errors teach the fix.** Every failure prints machine-readable JSON to stderr: `{"error": {"message", "status?", "suggestion"}}`. Validation failures include the offending fields **and** the command's schema-with-example so the retry needs no extra lookup. Unknown commands get did-you-mean suggestions. Missing-prerequisite errors name the exact discovery command (e.g. `documentFolderId` invalid → "run `acculynx documents folders`").
3. **Bootstrap and search built in.**
   - `acculynx guide` — a compact operational primer (the condensed `instructions.md`: entity model, contact-first job creation, key workflows) so an agent with no skill loaded can self-orient.
   - `acculynx search <keyword>` — greps command names + descriptions ("insurance" → the 4 insurance-related commands). Cheaper than reading full help trees.
4. **Context-frugal output.** List commands default to a **concise projection** (id + the few fields needed to pick a record: name/number, status/milestone, dates) with `_meta: {count, totalCount, nextStartIndex}` for pagination; `--full` returns complete records. `--fields a,b,c` selects arbitrary fields. Null/empty fields are stripped everywhere. Default page size 25.
5. **Workflow hints in results.** Multi-step operations return a `_hints` array pointing to the natural next command (e.g. `jobs create` result: "assign reps with `acculynx jobs set-company-rep <jobId> --user <userId>`"). Hints are data, not prose mixed into the payload.
6. **Ruthless consistency.** Same verbs everywhere (`list`/`get`/`create`/`update`/`delete`/`set-*`); same flag names for the same concepts across all commands (`--job`, `--contact`, `--user`, `--page-size`, `--start-index`, `--search`); dates always `YYYY-MM-DD`; UUIDs always plain strings. An agent that learned one group has learned them all.
7. **Mutations are visible.** `--help` and `describe` label each command `[read]` or `[mutates]`, so the agent (and the human approving the Bash call) can tell at a glance.

## Discovery (progressive disclosure)

- `acculynx --help` — groups, one line each
- `acculynx jobs --help` — commands in group, one line each, with `[read]`/`[mutates]` labels
- `acculynx describe jobs create` — description, full JSON schema (via zod-to-json-schema), flag/positional mapping, and a **copy-pasteable example invocation**
- `acculynx search <keyword>` and `acculynx guide` — see LLM-first ergonomics

## Output & errors

- Default: JSON to stdout (`--format md` renders the ported `formatToolResponse` markdown). Concise projections, `--full`, `--fields`, `_meta` pagination, and `_hints` per the LLM-first ergonomics section.
- Truncation: on by default at `CHARACTER_LIMIT` (20k chars) with a truncation notice that tells the agent how to narrow the query (`--fields`, `--page-size`, filters); `--limit-chars N` and `--no-limit` to override.
- Errors: structured JSON on stderr (`error.message`, `error.status`, `error.suggestion`); exit codes — 0 ok, 1 API/runtime error, 2 usage/validation error.
- Retry/backoff exactly as ported (3 attempts, exponential + jitter, Retry-After honored; `ACCULYNX_RETRY_ATTEMPTS`, `ACCULYNX_TIMEOUT_MS` respected).

## Auth & config

Resolution order: env var → `~/.config/acculynx/config.json` → error with setup hint.

```json
{ "apiKey": "...", "signerEmail": "...", "timeoutMs": 30000, "retryAttempts": 3 }
```

`ACCULYNX_API_KEY` and `ACCULYNX_SIGNER_EMAIL` are the env equivalents. No key is ever committed or printed.

## PDF reports

`acculynx reports coc --job <id> -o <path>` and `acculynx reports roof-report ...` port `define-report-tool.ts` + `pdf.ts`. Output: PDF written to path (default: cwd with a derived filename), JSON metadata (path, job, signer) to stdout. Signer: `ACCULYNX_SIGNER_EMAIL`/config matched against AccuLynx users, falling back to `company.ts` defaults. The Eve two-turn review flow becomes natural CLI steps: generate → user previews file → `acculynx documents add --job <id> --file <path> --folder <folderId>`.

## Claude plugin (`claude-plugins/plugins/acculynx`)

Follows the nanobanana bundled-scripts pattern; no MCP server.

```
plugins/acculynx/
├── .claude-plugin/plugin.json
├── cli/                      # built CLI bundle, synced from acculynx-cli by scripts/sync-cli.sh
└── skills/
    ├── use-acculynx/SKILL.md
    ├── draft-coc/            # SKILL.md + assets
    └── generate-roof-report/ # SKILL.md + assets
```

- **use-acculynx** skill: rewritten from `agent/instructions.md` — ubiquitous language (Job/Lead/Contact), contact-first job creation with ask-before-assign and `companyRepresentativeIds`-for-new-leads rules, production-schedule event-stream note, financial sub-resources guidance, discovery pattern (`--help`/`describe`), and how to run the bundled CLI (node path relative to the skill, `ACCULYNX_API_KEY` required).
- **draft-coc** / **generate-roof-report**: ported skills adapted to generate → preview → upload.
- Marketplace entry added to `.claude-plugin/marketplace.json`.
- Sync script copies the built CLI (dist + SDK runtime deps) into the plugin and is run manually per release; the plugin commit records the CLI version.

## Eve port (out of scope, enabled by this design)

Patriot-agent later adds `acculynx-cli` as an npm dependency (git URL or npm) and an Eve skill teaching the same discovery pattern, replacing the embedded tools. Nothing in this build depends on it.

## Testing

- **Unit:** command factory (flag generation from zod, JSON/flag merging, positional promotion, validation errors with schema+example replay), `describe` output, `search` matching, concise projections + `--fields`/`--full`, `_meta` pagination, `_hints`, config resolution, structured error JSON with suggestions, truncation notice content.
- **Smoke (live, gated on `ACCULYNX_API_KEY`):** `misc ping`, `users list`, `jobs list --page-size 1`, `settings milestones`, one `describe`, `guide`, `search insurance`. Read-only only.
- **Agent usability check:** after the build, a fresh Claude session with only the skill (no prior context) must complete "find job X and record a received payment" using discovery alone — the acceptance test for LLM ergonomics.
- **Typecheck:** `tsc` against the freshly generated SDK is the port-correctness gate.

## Non-goals (v1)

- No MCP server in the plugin.
- No npm publish (install via git URL or bundled copy).
- No mutation `--dry-run`/`--yes` gates — Claude Code's Bash permission prompt is the gate; revisit if usage warrants.
- No changes to patriot-agent or acculynx-mcp-server.
