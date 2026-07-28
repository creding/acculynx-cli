#!/usr/bin/env bash
set -euo pipefail
SRC=/Users/ccreding/github/patriot/patriot-agent/agent/agent/tools
DEST=src/commands
mkdir -p "$DEST"
for f in "$SRC"/*.ts; do
  base=$(basename "$f")
  case "$base" in
    # Report generators are ported by hand in Task 9 (they use define-report-tool)
    acculynx_generate_coc_pdf.ts|acculynx_generate_roof_report_pdf.ts) continue ;;
  esac
  sed -e 's#from "eve/tools/approval"#from "../lib/approval.ts"#' \
      -e 's#from "eve/tools"#from "../lib/define-tool.ts"#' \
      "$f" > "$DEST/$base"
done
echo "Ported $(ls "$DEST" | wc -l | tr -d ' ') command files."
