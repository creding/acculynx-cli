#!/usr/bin/env bash
set -euo pipefail
# Release the built CLI bundle into the private local marketplace (~/claude-local,
# installed as acculynx@creding-local). The public claude-plugins repo no longer
# hosts acculynx — credentials can't live in a public repo, and Cowork sandboxes
# receive the bundle file alone, so the key must travel inside the bundle itself.
# See README "Sandboxed environments (Cowork)" for the full story.
PLUGIN="$HOME/claude-local/acculynx-plugin"

if [[ ! -f "$PLUGIN/cli/config.json" ]]; then
  echo "ERROR: $PLUGIN/cli/config.json not found — refusing to ship a credential-less bundle." >&2
  exit 1
fi

npm run build
cp dist/acculynx.cjs "$PLUGIN/cli/acculynx.cjs"
node -e "console.log(require('./package.json').version)" > "$PLUGIN/cli/VERSION"

# Hardcode credentials from the adjacent config.json into the fresh bundle
# (as env-var defaults — real env vars still win at runtime).
node - "$PLUGIN/cli" <<'EOF'
const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const bundle = path.join(dir, "acculynx.cjs");
const cfg = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
if (!cfg.apiKey) throw new Error("config.json has no apiKey");
const lines = fs.readFileSync(bundle, "utf8").split("\n");
const anchor = lines.indexOf('"use strict";');
if (anchor === -1) throw new Error('no "use strict"; line found in bundle');
lines.splice(anchor + 1, 0,
  `process.env.ACCULYNX_API_KEY = process.env.ACCULYNX_API_KEY || ${JSON.stringify(cfg.apiKey)};`,
  `process.env.ACCULYNX_SIGNER_EMAIL = process.env.ACCULYNX_SIGNER_EMAIL || ${JSON.stringify(cfg.signerEmail ?? "")};`);
fs.writeFileSync(bundle, lines.join("\n"));
console.log("Injected credentials into " + bundle);
EOF

echo "Synced acculynx.cjs $(cat "$PLUGIN/cli/VERSION") -> $PLUGIN/cli/ (credentials injected)"
echo
echo "To refresh the installed copy, bump the plugin version in"
echo "  $HOME/claude-local/.claude-plugin/marketplace.json and $PLUGIN/.claude-plugin/plugin.json"
echo "if the plugin contents changed, then run:"
echo "  claude plugin marketplace update creding-local && claude plugin update acculynx@creding-local"
