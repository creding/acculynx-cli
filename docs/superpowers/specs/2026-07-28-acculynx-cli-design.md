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

## Discovery (progressive disclosure)

- `acculynx --help` — groups, one line each
- `acculynx jobs --help` — commands in group, one line each
- `acculynx describe jobs create` — description, full JSON schema (via zod-to-json-schema), flag/positional mapping, and a worked example

## Output & errors

- Default: JSON to stdout (`--format md` renders the ported `formatToolResponse` markdown).
- Truncation: on by default at `CHARACTER_LIMIT` (20k chars) with a truncation notice; `--limit-chars N` and `--no-limit` to override.
- Errors: mapped AccuLynx error message to stderr; exit codes — 0 ok, 1 API/runtime error, 2 usage/validation error.
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

- **Unit:** command factory (flag generation from zod, JSON/flag merging, positional promotion, validation errors), `describe` output, config resolution, error mapping, truncation.
- **Smoke (live, gated on `ACCULYNX_API_KEY`):** `misc ping`, `users list`, `jobs list --page-size 1`, `settings milestones`, one `describe`. Read-only only.
- **Typecheck:** `tsc` against the freshly generated SDK is the port-correctness gate.

## Non-goals (v1)

- No MCP server in the plugin.
- No npm publish (install via git URL or bundled copy).
- No mutation `--dry-run`/`--yes` gates — Claude Code's Bash permission prompt is the gate; revisit if usage warrants.
- No changes to patriot-agent or acculynx-mcp-server.
