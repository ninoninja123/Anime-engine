#!/bin/bash
# disk_cleanup.sh PROJECT_DIR [--yes] [--keep N]
# Lists (default = dry run) what is safe to delete: frames/ tmp/ seg dirs, *.jpg/png frame dumps, ffmpeg2pass logs,
# __pycache__, review sheets, and all but the newest N (default 1) mp4 in out/. Never touches code, json, wav lines, docs.
# Refuses to delete if a process (ffmpeg/node/chrome/python) has its cwd or an open file inside PROJECT_DIR (= render running).
set -uo pipefail
[[ $# -lt 1 || "$1" == -h || "$1" == --help ]] && { sed -n 2,5p "$0"; exit 0; }
P=$(realpath "$1"); shift; YES=0; KEEP=1
while [[ $# -gt 0 ]]; do case $1 in --yes) YES=1;; --keep) KEEP=$2; shift;; esac; shift; done
BUSY=""
for pid in $(pgrep -f 'ffmpeg|node|chrom|python' 2>/dev/null); do
  [[ $pid == $$ ]] && continue
  c=$(readlink /proc/$pid/cwd 2>/dev/null || true)
  if [[ "$c" == "$P"* ]] || ls -l /proc/$pid/fd 2>/dev/null | grep -q " $P/"; then BUSY+="$pid($(cat /proc/$pid/comm 2>/dev/null)) "; fi
done
L=$(mktemp)
for d in frames tmp frames/seg seg segs review/tmp; do [[ -d "$P/$d" ]] && echo "$P/$d" >>"$L"; done
find "$P" -path '*/node_modules' -prune -o \( -name '__pycache__' -o -name 'ffmpeg2pass*' -o -name '*.log.mbtree' -o -name 'p2-*.log*' \) -print 2>/dev/null >>"$L"
ls -t "$P"/out/*.mp4 2>/dev/null | tail -n +$((KEEP+1)) >>"$L"
sort -u "$L" | awk '{for(i=1;i<=n;i++) if(index($0, k[i] "/")==1) next; k[++n]=$0; print}' >"$L.2"; mv "$L.2" "$L"   # drop paths inside an already listed dir
[[ -s "$L" ]] || { echo "nothing to clean"; rm -f "$L"; exit 0; }
TOT=0; while read -r f; do k=$(du -sk "$f" 2>/dev/null | cut -f1); TOT=$((TOT+k)); printf '%8s MB  %s\n' $((k/1024)) "${f#$P/}"; done <"$L"
echo "total: $((TOT/1024)) MB   (df: $(df -h "$P" | awk 'NR==2{print $4" free"}'))"
if [[ -n "$BUSY" ]]; then echo "BUSY: $BUSY-> nothing deleted (render running?)"; rm -f "$L"; exit 2; fi
if [[ $YES == 1 ]]; then xargs -d '\n' rm -rf <"$L"; echo "deleted. $(df -h "$P" | awk 'NR==2{print $4" free"}')"; else echo "dry run: add --yes to delete"; fi
rm -f "$L"
