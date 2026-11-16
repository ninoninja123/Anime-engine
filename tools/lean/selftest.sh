#!/bin/bash
# selftest.sh — runs every lean tool on tiny synthetic input in a temp dir (~15 s, no network, no model download). Prints PASS/FAIL per tool.
H=$(cd "$(dirname "$0")" && pwd); T=$(mktemp -d); cd "$T" || exit 1; F=0
ok(){ if [[ $1 == 0 ]]; then echo "PASS $2"; else echo "FAIL $2"; F=1; fi; }
ff(){ ffmpeg -nostdin -v error -y "$@"; }
ff -f lavfi -i "testsrc2=s=1280x720:r=24:d=12" -f lavfi -i "sine=f=220:d=12" -c:v libx264 -preset ultrafast -c:a aac -shortest v.mp4
mkdir -p lines music sfx raw
ff -f lavfi -i "sine=f=220:d=1.5" lines/L1.wav; ff -f lavfi -i "sine=f=330:d=1.2" lines/L2.wav
ff -f lavfi -i "sine=f=110:d=10" music/m.wav; ff -f lavfi -i "anoisesrc=d=0.8:c=pink,afade=t=out:st=0.1:d=0.7" sfx/boom.wav
ff -f lavfi -i "sine=f=200:d=1" -f lavfi -i "anullsrc=r=48000:cl=mono:d=0.5" -f lavfi -i "sine=f=300:d=1" -filter_complex "[0][1][2]concat=n=3:v=0:a=1" raw/S1_A_t1.wav
cat > tl.json <<'J'
{"duration": 8, "fps": 24, "lines":[{"id":"L1","start":1.0,"who":"A","text":"First line of the test, long enough to be wrapped onto two rows nicely."},{"id":"L2","start":4.0,"who":"B","text":"二行目。"}],
 "music":[{"cue":"M1","t":0.5},{"cue":"M1_STOP","t":6.5}], "sfx":[{"id":"hit","t":3.0}], "twists":[{"id":"T1","t":3.0}],
 "shots":[{"id":"a","t0":0,"t1":1.2,"tag":"T1"},{"id":"b","t0":1.2,"t1":4,"shake":[{"f":2}]},{"id":"c","t0":4,"t1":8,"fx":"impact"}]}
J
echo '{"tracks":[{"file":"m.wav","start_cue":"M1","stop_cue":"M1_STOP","level_lufs":-24,"fade_in":0.5}]}' > mp.json
echo '{"sources":{"boom":{"win":[0,0.8]}},"cues":{"hit":["boom",0,1,0]}}' > sm.json
echo '[{"key":"S1_A","lines":[["L1","one"],["L2","two"]]}]' > groups.json
echo 'ctx.fillText("螺旋丸", 10, 10);' > fx.js
bash "$H/contact_sheet.sh" v.mp4 2 4 160 cs.jpg >/dev/null; ok $? contact_sheet.sh
python3 "$H/shot_stats.py" tl.json | grep -q '"n": 3'; ok $? shot_stats.py
python3 "$H/mix_from_timeline.py" --timeline tl.json --lines-dir lines --music-plan mp.json --music-dir music --sfx-map sm.json --sfx-dir sfx --out mix.wav >/dev/null; ok $? mix_from_timeline.py
bash "$H/loudness.sh" mix.wav --aac | grep -q '"ok": true'; ok $? loudness.sh
python3 "$H/subs_from_timing.py" tl.json --names --out s.ass >/dev/null && ff -i v.mp4 -t 2 -vf "ass=s.ass" -c:v libx264 -preset ultrafast sub.mp4; ok $? subs_from_timing.py+burn
bash "$H/cjk_check.sh" fx.js >/dev/null; [[ $? == 1 ]]; ok $? cjk_check.sh
python3 "$H/twist_coverage.py" v.mp4 tl.json --offsets -0.5,0 --out tw.jpg >/dev/null; ok $? twist_coverage.py
python3 "$H/thumbnail_compose.py" th.jpg v.mp4@2 v.mp4@6 --title 'A VS 太宰' >/dev/null; ok $? thumbnail_compose.py
python3 "$H/voice_cut.py" --dir . --lang en --no-stt | grep -q 'lines 2'; ok $? voice_cut.py
mkdir -p proj/frames proj/out && touch proj/out/a.mp4 && sleep 0.01 && touch proj/out/b.mp4 && bash "$H/disk_cleanup.sh" proj | grep -q 'a.mp4'; ok $? disk_cleanup.sh
cd /; rm -rf "$T"; exit $F
