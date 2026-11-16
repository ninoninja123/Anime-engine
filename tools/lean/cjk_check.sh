#!/bin/bash
# cjk_check.sh [--allow REGEX] PATH...   -> finds Japanese/Chinese characters in code/data files (js, json, py, ass, md, html).
# Lines that DRAW text into frames (fillText/strokeText/drawtext/label/title/name/text:) are flagged [ON-FRAME]:
# those are what ends up in the rendered frames (no OCR needed: the code is the source of every pixel of text).
# --allow REGEX skips files whose path matches (e.g. 'subs|lines\.json' when JA text there is intended). Exit 1 if on-frame hits.
set -uo pipefail
ALLOW='^$'; [[ "${1:-}" == --allow ]] && { ALLOW=$2; shift 2; }
[[ $# -lt 1 || "$1" == -h || "$1" == --help ]] && { sed -n 2,5p "$0"; exit 0; }
export LC_ALL=C.UTF-8
PAT='[\x{3040}-\x{30FF}\x{3400}-\x{4DBF}\x{4E00}-\x{9FFF}\x{F900}-\x{FAFF}\x{FF66}-\x{FF9F}]'
HITS=$(grep -rnP --include='*.js' --include='*.mjs' --include='*.json' --include='*.py' --include='*.ass' --include='*.html' --include='*.md' \
  --exclude-dir=node_modules --exclude-dir=frames --exclude-dir=.git "$PAT" "$@" 2>/dev/null | grep -vE "^[^:]*($ALLOW)[^:]*:" || true)
[[ -z "$HITS" ]] && { echo "cjk: 0 hits"; exit 0; }
ON=$(grep -E 'fillText|strokeText|drawtext|(label|title|name|text|caption|tech)["'"'"']?\s*[:=]' <<<"$HITS" || true)
echo "cjk: $(wc -l <<<"$HITS") lines in $(cut -d: -f1 <<<"$HITS" | sort -u | wc -l) files; on-frame: $(grep -c . <<<"$ON")"
cut -d: -f1 <<<"$HITS" | sort | uniq -c | sort -rn | head -10
[[ -n "$ON" ]] && { echo "--- ON-FRAME (first 15) ---"; cut -c1-160 <<<"$ON" | head -15; exit 1; }
exit 0
