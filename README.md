# acculynx-cli

An LLM-first command-line interface covering the full AccuLynx v2 API — 120 commands across jobs, leads, contacts, estimates, financials, invoices, payments, appointments, documents, media, users, company settings, and PDF report generation. Ported from the patriot-agent tool suite so the same battle-tested request layer (retry/backoff, error mapping, truncation) drives every surface: Claude Code (via the `acculynx` plugin), Eve agents, or a human in a terminal.

## Install

```bash
npm install
npm run build          # single-file bundle at dist/acculynx.cjs
npm link               # optional: global `acculynx` command
```

## Auth

```bash
export ACCULYNX_API_KEY=...          # or:
echo '{"apiKey": "..."}' > ~/.config/acculynx/config.json
```

Optional: `ACCULYNX_SIGNER_EMAIL` (PDF signature identity), `ACCULYNX_TIMEOUT_MS`, `ACCULYNX_RETRY_ATTEMPTS` — all also settable in the config file (`signerEmail`, `timeoutMs`, `retryAttempts`). Env wins over file.

## Discovery workflow

```bash
acculynx guide                     # operational primer — domain rules, workflows, API limits
acculynx --help                    # groups
acculynx jobs --help               # commands in a group, labeled [read]/[mutates]
acculynx describe jobs create      # full JSON schema + runnable example
acculynx search insurance          # find commands by keyword
```

## Global flags

| Flag | Meaning |
|---|---|
| `--format json\|md` | Output style (default json) |
| `--full` | Disable the concise list projection |
| `--fields a,b,c` | Project arbitrary fields (dot paths ok) |
| `--json '<obj>'` / `--input file.json` (or `-`) | Nested payload; scalar flags override it |
| `--limit-chars N` / `--no-limit` | Truncation control (default 25000) |
| `-o, --output <path>` | Output path for report PDFs |

Errors are structured JSON on stderr with a `suggestion` field. Exit codes: 0 ok, 1 API error, 2 usage/validation.

## Examples

```bash
# Read: newest 5 jobs (API sorts Ascending by default — flip it)
acculynx jobs list --sort-by CreatedDate --sort-order Descending --page-size 5

# Mutation: record a customer payment on a job
acculynx payments add-received <jobId> --amount 2500 --payment-date 2026-07-28 --check-number 1042

# Report: render a Certificate of Completion, then upload after review
acculynx reports coc --job-id <jobId> --customer-name "Jane Doe" \
  --address "123 Maple St, Homewood, AL" --claim-number CLM-1 \
  --scope-original-amount 18500 --completion-date 2026-07-01 \
  --json '{"supplements": []}' -o coc.pdf
acculynx documents folders          # find the "Certificate of Completion" folder UUID
acculynx documents add --job-id <jobId> --document-folder-id <folderId> --file coc.pdf \
  --description "Certificate of Completion - Approved"
```

## Development

```bash
npm run typecheck    # tsc --noEmit (the port-correctness gate)
npm test             # unit suite (node:test + tsx)
npm run smoke        # live read-only checks; skips without ACCULYNX_API_KEY
npm run build        # esbuild bundle
```

Regenerate the SDK with `npx api install "@acculynxapi/v2.2614.0#2yp7tr813mrlab3aq"`. After an SDK bump, re-run the method-name drift check — every `client.<method>` used in `src/commands/` must exist in `.api/apis/acculynxapi/src/sdk.ts`:

```bash
for m in $(grep -oh "client\.\w*" src/commands/*.ts | sed 's/client\.//' | sort -u); do
  grep -q "  $m(" .api/apis/acculynxapi/src/sdk.ts || echo "MISSING: $m"
done
```

Commands were generated into `src/registry.ts` by `scripts/gen-registry.ts`; projections/hints are edited in place there. Letterhead logos live in `assets/` and are embedded via `src/lib/logo-assets.ts`; if you swap a PNG, regenerate that module:

```bash
node -e "
const fs = require('fs');
const coc = fs.readFileSync('assets/draft-coc/logo.png').toString('base64');
const roof = fs.readFileSync('assets/generate-roof-report/logo.png').toString('base64');
fs.writeFileSync('src/lib/logo-assets.ts',
  '// GENERATED from assets/*/logo.png — regenerate with the command in README (Development).\n' +
  'function b64(s: string): Uint8Array { return Uint8Array.from(Buffer.from(s, \"base64\")); }\n' +
  'export const LOGO_DRAFT_COC = b64(\n  \"' + coc + '\",\n);\n' +
  'export const LOGO_ROOF_REPORT = b64(\n  \"' + roof + '\",\n);\n');
"
```

Release to the Claude plugin: `bash scripts/sync-plugin.sh` copies the built bundle into `claude-plugins/plugins/acculynx/cli/`; commit that repo to publish.

## Provenance

The command bodies originate in `patriot-agent` (`agent/tools/`). This repo is now the canonical home for AccuLynx tool behavior — change here first, then port back if the Eve agent still embeds tools.
