# acculynx-cli

An LLM-first command-line interface covering the full AccuLynx v2 API — 120 commands across jobs, leads, contacts, estimates, financials, invoices, payments, appointments, documents, media, users, company settings, and PDF report generation. Ported from the patriot-agent tool suite so the same battle-tested request layer (retry/backoff, error mapping, truncation) drives every surface: Claude Code (via the `acculynx` plugin), Eve agents, or a human in a terminal.

## Install

**Run without installing (npx):** the repo ships the committed self-contained bundle, so this works straight from GitHub:

```bash
ACCULYNX_API_KEY=... npx -y github:creding/acculynx-cli jobs list --page-size 5
```

Env vars pass through like any command (`ACCULYNX_API_KEY`, `ACCULYNX_SIGNER_EMAIL`, ...), and exported vars or `~/.config/acculynx/config.json` are picked up as usual. The first run clones and caches; later runs are instant. Caveat: if your `~/.npmrc` sets `min-release-age`, npm currently refuses git installs ("cannot be provided when using --before") — prefix with `npm_config_userconfig=/dev/null` for that one command, or drop the setting.

**From a checkout:**

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

Full resolution order: env vars > `~/.config/acculynx/config.json` > a `config.json` sitting next to the running bundle. The bundle-adjacent file exists so a deployment (e.g. a Claude plugin's `cli/` dir) can ship credentials with the CLI when neither env nor home config reach it. It is never committed — gitignored wherever the bundle lives in a repo.

### Sandboxed environments (Cowork) — hardcoded-key escape hatch

Cowork sandboxes forward none of the normal credential channels: user-settings env vars, `pluginConfigs`, and home-directory config files all fail to reach the CLI (anthropics/claude-code#39125), and in practice the bundle-adjacent `config.json` is not picked up there either — the sandbox invokes the bundle such that `process.argv[1]` does not resolve to the plugin's `cli/` directory, so the CLI never finds the adjacent file.

The working fallback is to inject the credentials directly into the private local-marketplace copy of the bundle (`~/claude-local/acculynx-plugin/cli/acculynx.cjs`, installed as `acculynx@creding-local` — a directory-source marketplace that is not on git). Two lines are inserted immediately after `"use strict";`:

```js
process.env.ACCULYNX_API_KEY = process.env.ACCULYNX_API_KEY || "<key>";
process.env.ACCULYNX_SIGNER_EMAIL = process.env.ACCULYNX_SIGNER_EMAIL || "<email>";
```

The `||` keeps real env vars winning when they do get through. Caveats:

- **Re-inject after every bundle update.** Copying a fresh `dist/acculynx.cjs` into `~/claude-local` (and the installed cache under `~/.claude/plugins/cache/creding-local/acculynx/<version>/cli/`) wipes the injection.
- **Never do this to a bundle that lands in a git repo** — the committed `dist/acculynx.cjs` here and the public `creding-plugins` copy must stay key-free. This is strictly for the private local marketplace.

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
