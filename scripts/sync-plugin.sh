#!/usr/bin/env bash
set -euo pipefail
PLUGIN=/Users/ccreding/github/claude-plugins/plugins/acculynx
npm run build
mkdir -p "$PLUGIN/cli"
cp dist/acculynx.cjs "$PLUGIN/cli/acculynx.cjs"
node -e "console.log(require('./package.json').version)" > "$PLUGIN/cli/VERSION"
echo "Synced acculynx.cjs $(cat "$PLUGIN/cli/VERSION") -> $PLUGIN/cli/"
