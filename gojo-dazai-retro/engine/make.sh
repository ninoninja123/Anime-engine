#!/bin/bash
# Bleach Showdown full build (resumable): render program segments (12 s, N workers, CPU raster, unique-frame cache)
# -> concat -> mux audio (if given) -> final mp4 + small version.
# usage: ./make.sh PROG [AUDIO_WAV|-] [OUT=showdown.mp4] [WORKERS=auto] [SCALE=1]
#   PROG    comma list of program files relative to engine/ without .js (e.g. shots/main or reel/testreel)
#   BUILD_DIR (default: /tmp/bleach_build_<progname>) keeps segments; re-run renders only missing ones.
#   Re-render specific segments after editing shots:  node render.js redo PROG $BUILD_DIR 3,4
set -euo pipefail
cd "$(dirname "$0")"
PROG=${1:?program, e.g. reel/testreel}; AUDIO=${2:--}; OUT=${3:-showdown.mp4}; WORKERS=${4:-$(nproc)}; SCALE=${5:-1}
NAME=$(echo "$PROG" | tr '/,' '__'); BUILD=${BUILD_DIR:-/tmp/bleach_build_$NAME}; mkdir -p "$BUILD"
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
export PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}
node render.js events "$PROG" "$BUILD/events.json"
node render.js all "$PROG" "$BUILD" "$WORKERS" "$SCALE" 12
node render.js concat "$PROG" "$BUILD" "$BUILD/video.mp4" 12
DUR=$(python3 -c "import json;print(json.load(open('$BUILD/events.json'))['dur'])")
if [ "$AUDIO" != "-" ] && [ -f "$AUDIO" ]; then
  ffmpeg -y -v error -i "$BUILD/video.mp4" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -t "$DUR" -movflags +faststart "$OUT"
else
  ffmpeg -y -v error -i "$BUILD/video.mp4" -c:v copy -t "$DUR" -movflags +faststart "$OUT"
fi
# small version (1280x720, <= ~25 MB)
SMALL="${OUT%.mp4}_small.mp4"; VB=$(python3 -c "print(max(400,int(25.5*8*1024*1024/$DUR/1000 - 128)))")
ffmpeg -y -v error -i "$OUT" -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v ${VB}k -pass 1 -passlogfile "$BUILD/x264" -an -f mp4 /dev/null
ffmpeg -y -v error -i "$OUT" -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -passlogfile "$BUILD/x264" -pix_fmt yuv420p $( [ "$AUDIO" != "-" ] && echo "-c:a aac -b:a 128k" || echo "-an" ) -movflags +faststart "$SMALL"
for f in "$OUT" "$SMALL"; do ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$f"; done
