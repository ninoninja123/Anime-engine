ROLE: production agent (picture + build), {{VIDEO}}. TOKEN CAP: 450k (1-agent fight pipeline incl. audio: 550k).
GOAL: final MP4 {{PROJECT}}/out/{{NAME}}.mp4, 720p 24 fps ≤ 28 MB.
ENGINE: {{PROJECT}} (created by tools/saasto/new_project.sh {{TYPE}}); commands in /home/user/anime-engine/docs/ENGINES.md row "{{TYPE}}" only. Do not rewrite engine/mixer/subtitles/build; add small features to existing files.
READ ONLY: {{PROJECT}}/STATE.md; story_secret.md (shot outline + twist table); timing.json (durations); CHARACTERS_BUILT.md rows for {{CHARACTERS}}.
CHARACTERS: COPY built ones ({{CHAR_SOURCES}}); build only missing ones (appearance table first, 3 signature features each).
STEPS: 1) shots from the outline, shot length from measured line durations; 2) ONE preview sheet at 320 px of 3–5 key moments + ONE close-up sheet of every character's signature features (eyes!); fix; 3) ONE final render; 4) build: subs_from_timing.py (or engine build_subs.py) + mix + 2-pass x264; loudness.sh --aac.
SELF-CHECK: shot_stats.py, twist_coverage.py (1 sheet), cjk_check.sh = 0 on-screen CJK, first 15 s hook visible on the sheet.
MUST NOT: re-render whole film, > 3 sheets, reopen an image, effects on contacts without a named technique.
(append _COMMON.md)
