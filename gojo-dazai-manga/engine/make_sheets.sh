#!/bin/bash
# Model sheets (PNG): action3d model + forms/signature sheet + a hand2d model sheet per form -> $1 (default ../docs/sheets)
# usage: ./make_sheets.sh [OUT] [char ...]      (no chars = every character in CAST, forms read from the design)
#   also writes <char>_poses.png for the death-battle characters (signature poses grid).
set -e; cd "$(dirname "$0")"; node modules.cjs >/dev/null; OUT=${1:-../docs/sheets}; shift || true; mkdir -p "$OUT"; TMP=$(mktemp -d)
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
echo "console.log('CHARS', Object.keys(CAST).map(c => c + ':' + Object.keys(CAST[c].forms || { base: 1 }).join(',')).join(' '))" > $TMP/q.js
LIST=$(node lab.js $TMP/q.png @$TMP/q.js 10 10 | grep '^LOG CHARS' | sed 's/^LOG CHARS //')
for item in $LIST; do c=${item%%:*}; forms=${item#*:}
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $c " ]]; then continue; fi
  echo "modelSheet(ctx,'$c','base');" > $TMP/m.js; node lab.js "$OUT/${c}_model.png" @$TMP/m.js 2400 1720 >/dev/null
  echo "formsSheet(ctx,'$c');" > $TMP/f.js; node lab.js "$OUT/${c}_forms.png" @$TMP/f.js 2400 1340 >/dev/null
  echo "posesSheet(ctx,'$c',SIGNATURE['$c']||['guard'],(window.SIGNATURE_FORM&&SIGNATURE_FORM['$c'])||'$(echo $forms | cut -d, -f2)',8);" > $TMP/p.js; node lab.js "$OUT/${c}_poses.png" @$TMP/p.js 2400 700 >/dev/null
  for fm in ${forms//,/ }; do echo "modelSheet(ctx,'$c','$fm','hand2d');" > $TMP/h.js; node lab.js "$OUT/${c}_${fm}_hand2d.png" @$TMP/h.js 2400 1720 >/dev/null; done
  echo "$c: $forms"
done
rm -rf $TMP; ls "$OUT" | wc -l
