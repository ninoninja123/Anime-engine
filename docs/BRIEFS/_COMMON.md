# Yhteinen loppuosa jokaiseen briefiin (liitä sellaisenaan)
TOKEN HYGIENE: fewer, bigger tool calls; never Read files > 300 lines whole (Grep / offset+limit); pipe outputs through tail -5; max 3 images per agent at 320 px, never reopen one; no polling in tiny steps; logs to files.
STOP RULE: if you will exceed the TOKEN CAP, stop, write {{PROJECT}}/status.md (< 40 lines: done / next / paths) and report.
QUALITY: obey /home/user/anime-engine/docs/QUALITY_GATE.md (English on screen, no spoilers, effects only for named techniques, characters match references).
DELIVER: commit + push only {{PROJECT}} (no mp4/wav/mp3/frames, no story_secret, no keys); report ≤ 12 lines in Finnish: paths, duration, size, LUFS/TP, weaknesses, tokens used.
