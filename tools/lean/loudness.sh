#!/bin/bash
# loudness.sh FILE [--aac]   -> one JSON line {I_lufs, TP_dbtp, LRA}
# Measures integrated loudness + true peak (EBU R128). With --aac a WAV/any input is first encoded to AAC 96k
# (what the viewer actually hears; AAC can raise true peak by 0.5-1.5 dB), then measured. Target: I -14 +-0.5, TP < -1.
set -euo pipefail
[[ $# -lt 1 || "$1" == -h || "$1" == --help ]] && { sed -n 2,4p "$0"; exit 0; }
F=$1; TMP=""
if [[ "${2:-}" == --aac ]]; then TMP=$(mktemp --suffix=.m4a); ffmpeg -nostdin -v error -y -i "$F" -vn -c:a aac -b:a 96k -ar 48000 "$TMP"; F=$TMP; fi
R=$(ffmpeg -nostdin -hide_banner -i "$F" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 | tail -14)
[[ -n "$TMP" ]] && rm -f "$TMP"
I=$(grep -oP 'I:\s+\K-?[\d.]+' <<<"$R" | tail -1); L=$(grep -oP 'LRA:\s+\K-?[\d.]+' <<<"$R" | tail -1); P=$(grep -oP 'Peak:\s+\K-?[\d.inf]+' <<<"$R" | tail -1)
OK=$(python3 -c "print(str(abs($I+14)<=0.5 and $P<-1).lower())" 2>/dev/null || echo false)
echo "{\"I_lufs\": $I, \"TP_dbtp\": $P, \"LRA\": $L, \"aac\": $([[ -n "$TMP" ]] && echo true || echo false), \"ok\": $OK}"
