#!/bin/bash
# contact_sheet.sh VIDEO [EVERY_S=10] [COLS=4] [WIDTH=320] [OUT=sheet.jpg] [START=0] [END=]
# One ffmpeg call: one frame every EVERY_S seconds -> a COLS-wide grid, small JPEG, timestamp burned in.
# Prints one line: out path, tiles, size. Keep WIDTH <= 320 and <= 16 tiles per sheet (images are expensive).
set -euo pipefail
[[ $# -lt 1 || "$1" == -h || "$1" == --help ]] && { sed -n 2,4p "$0"; exit 0; }
V=$1; N=${2:-10}; C=${3:-4}; W=${4:-320}; O=${5:-sheet.jpg}; S=${6:-0}; E=${7:-}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V"); [[ -n "$E" ]] || E=$D
T=$(python3 -c "import math;print(max(1,math.ceil(($E-$S)/$N)))"); R=$(( (T + C - 1) / C ))
F=$(fc-match -f '%{file}' 'DejaVu Sans' 2>/dev/null || true)
TXT=""; [[ -f "$F" ]] && TXT=",drawtext=fontfile=$F:text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6"
VF="fps=1/$N,scale=$W:-2$TXT,tile=${C}x${R}:padding=2"
ffmpeg -nostdin -v error -y -ss "$S" -to "$E" -i "$V" -vf "setpts=PTS+$S/TB,$VF" -frames:v 1 -q:v 4 "$O" 2>/dev/null \
 || ffmpeg -nostdin -v error -y -ss "$S" -to "$E" -i "$V" -vf "fps=1/$N,scale=$W:-2,tile=${C}x${R}:padding=2" -frames:v 1 -q:v 4 "$O"
echo "$O tiles=$T grid=${C}x${R} $(du -k "$O" | cut -f1)KB"
