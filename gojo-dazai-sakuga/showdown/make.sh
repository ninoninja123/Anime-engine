#!/bin/bash
# Itachi vs Julius build: 12 s segments (ceil(SHOW_DUR/12)), resumable (.done markers), unique-frame cache, mux with audio.
# usage: ./make.sh RANGE BUILD_DIR [scale=1] [workers=nproc]
#   RANGE: segment list "0-5" | "3,4" | "all" | part1 (segments before PART_SPLIT) | part2 (the rest)
#   ./make.sh part1 /scratch/nl/prev 0.5 1      # 960x540 preview of part 1 with ONE worker (shared CPU!)
#   ./make.sh all /scratch/nl/final 0.6667 2    # FINAL: 1280x720 segments (crf 15), then ./make.sh final /scratch/hy/final
#   ./make.sh split                              # print SHOW_DUR, segment count and PART_SPLIT (check part1/part2 boundary)
#   ./make.sh final /path/all_segs               # concat all seg_XX.mp4 (+ .done) in that folder + audio -> showdown.mp4
#   REDO=1 ./make.sh 3,4 DIR 0.5 1               # delete and re-render those segments
# Segment k covers k*12 .. k*12+12 s; the program always loads both parts, so shots crossing a boundary render correctly.
set -euo pipefail
cd "$(dirname "$0")/../engine"
# fonts used by the UCHIHA / CHRONO lettering + older styles (vendored in engine/fonts): install for Chromium if missing
if ! fc-list | grep -q Cinzel || ! fc-list | grep -q Bangers || ! fc-list | grep -q 'Shippori'; then mkdir -p ~/.local/share/fonts && cp fonts/*.ttf ~/.local/share/fonts/ && fc-cache -f >/dev/null; fi
RANGE=${1:?range}; if [ "$RANGE" = "split" ]; then BUILD=${2:-/tmp}; else BUILD=${2:?build dir}; fi; SCALE=${3:-1}; WORKERS=${4:-$(nproc)}
PROG=../showdown/program; SEG=${SEG:-5}
export NODE_PATH=${NODE_PATH:-$(npm root -g)}; export PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}
mkdir -p "$BUILD"; python3 ../showdown/gen_data.py >/dev/null
DUR=$(python3 -c "import re;s=open('../showdown/shots_data.js').read();print(re.search(r'SHOW_DUR = ([0-9.]+)',s).group(1))")
NSEG=$(python3 -c "import math;print(math.ceil($DUR/$SEG))"); SPLIT=$(python3 -c "import math;print(int(math.floor($DUR/2/$SEG+.5)))")   # = PART_SPLIT/12 (program.js: Math.round(SHOW_DUR/2/12)*12)
segs() { case "$1" in all) seq -s, 0 $((NSEG-1));; part1) seq -s, 0 $((SPLIT-1));; part2) seq -s, $SPLIT $((NSEG-1));; *-*) seq -s, ${1%-*} ${1#*-};; *) echo "$1";; esac; }
if [ "$RANGE" = "split" ]; then echo "SHOW_DUR=$DUR segments=$NSEG PART_SPLIT=$((SPLIT*12)) part1=0-$((SPLIT-1)) part2=$SPLIT-$((NSEG-1))"; exit 0; fi
if [ "$RANGE" != "final" ]; then
  LIST=$(segs "$RANGE")
  if [ "${REDO:-0}" = "1" ]; then for k in ${LIST//,/ }; do rm -f "$BUILD/seg_$(printf %02d $k).mp4" "$BUILD/seg_$(printf %02d $k).mp4.done"; done; fi
  node -e "
    const {spawn}=require('child_process');const fs=require('fs');const path=require('path');
    const ks='$LIST'.split(',').map(Number).filter(k=>!fs.existsSync(path.join('$BUILD','seg_'+String(k).padStart(2,'0')+'.mp4.done')));
    console.log('to render:',ks.join(',')||'(none)');let i=0;const run=()=>{if(i>=ks.length)return Promise.resolve();const k=ks[i++];
    return new Promise(r=>{spawn('node',['render.js','seg','$PROG','$BUILD',String(k),'$SCALE','$SEG'],{stdio:'inherit'}).on('close',r)}).then(run)};
    Promise.all(Array.from({length:$WORKERS},run)).then(()=>console.log('range done'));"
  [ "$SCALE" != "1" ] && ls "$BUILD"/seg_*.mp4 >/dev/null 2>&1 && { for f in $(ls "$BUILD"/seg_*.mp4 | sort); do echo "file '$f'"; done > "$BUILD/list.txt"; ffmpeg -y -v error -f concat -safe 0 -i "$BUILD/list.txt" -c copy "$BUILD/range.mp4" && echo "joined -> $BUILD/range.mp4"; }
  exit 0
fi
# FINAL (1280x720 delivery): render segments with scale 0.6667 first:  ./make.sh all DIR 0.6667 2
# then ./make.sh final DIR  -> one two-pass x264 encode (audio: true-peak safety limiter, AAC overshoot -> <= -2 dBTP) straight from the segments (no Full HD copies): 1280x720, 24 fps, H.264 + AAC, <= 28 MB
for f in $(ls "$BUILD"/seg_*.mp4 | sort); do echo "file '$f'"; done > "$BUILD/list.txt"
AUDIO=${AUDIO:-../audio/out/mix.wav}; OUT=${OUT:-../gojo-dazai-sakuga.mp4}; MB=${MAXMB:-26.2}
AB=160; VB=$(python3 -c "print(int($MB*8*1024*1024/$DUR/1000 - $AB))")
VF="scale=1280:720:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -v error -f concat -safe 0 -i "$BUILD/list.txt" -vf "$VF" -t $DUR -c:v libx264 -preset slow -b:v ${VB}k -pass 1 -passlogfile "$BUILD/x264" -an -f mp4 /dev/null
if [ -f "$AUDIO" ]; then ffmpeg -y -v error -f concat -safe 0 -i "$BUILD/list.txt" -i "$AUDIO" -map 0:v -map 1:a -vf "$VF" -t $DUR -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -passlogfile "$BUILD/x264" -af "aresample=192000,alimiter=limit=0.63:level=false:attack=1:release=50,aresample=48000" -c:a aac -b:a ${AB}k -movflags +faststart "$OUT"
else echo "no audio at $AUDIO - video only"; ffmpeg -y -v error -f concat -safe 0 -i "$BUILD/list.txt" -vf "$VF" -t $DUR -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -passlogfile "$BUILD/x264" -an -movflags +faststart "$OUT"; fi
rm -f "$BUILD"/x264*.log*
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
