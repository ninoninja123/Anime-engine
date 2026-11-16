ROLE: cover/thumbnail (captain may do it alone). TOKEN CAP: 60k.
GOAL: {{OUT}} 1280x720 jpg, title "{{TITLE}}" (English), no spoiler (no winner, no twist).
STEPS: 1) contact_sheet.sh {{VIDEO}} 10 4 320 /tmp/s.jpg → look ONCE, pick 2 frames with clear faces (signature features visible);
 2) python3 /home/user/anime-engine/tools/lean/thumbnail_compose.py {{OUT}} {{VIDEO}}@T1 {{VIDEO}}@T2 --title '{{TITLE}}';
 3) if no good frame: render a still from the engine (2D: showdown/r.sh stills PROG dir t 1.0; 3D: node run.js still shot:frame) and compose.
CHECK: open the result once at 320 px. Report 3 lines.
