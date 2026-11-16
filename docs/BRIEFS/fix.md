ROLE: fix agent, {{VIDEO}} — ONLY because the user explicitly asked: "{{USER_REQUEST}}". TOKEN CAP: 150k.
READ ONLY: {{PROJECT}}/STATE.md (+ status.md); the files named in the request (Grep first). Do not re-read the script unless the fix needs it.
SCOPE: exactly the requested changes: {{FIX_LIST}}. Nothing else (no "while I'm here" improvements).
STEPS: locate (Grep) → change → render ONLY affected segments (2D: ./r.sh redo PROG BUILD k1,k2; 3D: node run.js render F0 F1) → rebuild (audio-only fixes: mux new mix onto existing picture with -c:v copy) → loudness.sh --aac → 1 sheet of the changed spots.
AUDIO FIXES: rerun the event vs sound audit + SFX counts (QUALITY_GATE checklist) on the new mix.
DELIVER: same filename + _v2 (one version); STATE.md "Palaute" line updated; report ≤ 8 lines.
(append _COMMON.md)
