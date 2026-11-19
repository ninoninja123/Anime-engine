# Cutscene quality rules (Weed fan game)

Applies to EVERY cutscene: Story So Far, Prologue (level 1) scenes, level 2 intro, Smith's sacrifice, Four Arrows,
lock scene, finale, post-battle (fall, river, dawn, memorial), special-move cut-ins. Derived from docs/QUALITY_GATE.md
and the user's feedback ("cutscenes were really bad, no real hits, Smith stood on top of P4").

## Camera
- The camera is ALWAYS moving: slow dolly, orbit, handheld sway, push-in, rack focus. No frozen frames except deliberate holds (hit-stop, grief beat).
- Shot variety inside one scene: establishing wide -> medium -> close-up (eyes/face) -> reaction shot -> insert (paw, rock, light) -> wide again. Never the same angle twice in a row.
- Compose with intent: eye line, foreground element, depth layers, low angle for threat, high angle for loss. Letterbox bars during cutscenes.

## Action (sakuga)
- A strike is shown in full for 1.5-3 s: ANTICIPATION (clear wind-up/crouch/pull back, 0.3-0.5 s) -> FAST MOTION (smear/stretch, speed lines, camera follows the attacker) -> CONTACT (hit-stop 2-4 frames, impact flash/star at the contact point, camera kick) -> FOLLOW-THROUGH (target reacts: recoil, stagger, roar, fall; dust; weight shift; breath).
- Real contact: attacker's jaw/paw reaches the target point exactly at the hit frame (use src/contact.js). Nobody stands on, floats on, or clips through anyone except in a jump arc. Characters keep a plausible spacing (blocking).
- No 0.1 s flashes. No default effect on every hit: each technique has its own effect that matches what happens.

## Emotion
- Hold silence. Slow motion for the key beat. Close-ups of eyes (face.js: sad / determined / closed / hurt / angry), ears and tail posture, breathing, tiny head turns, a last look at a friend.
- Deaths and loss: no blood (PEGI 12) but heavy: time slows, sound drops out, spirit light rises, others react (reaction shots), then music.
- Pacing: breathing room (1-3 s) after every big beat. Let subtitles and voice carry the line; do not stack effects over dialogue.

## Sound (every visible event has a sound)
- Make an event-vs-sound table per scene (docs/weed-game/cutscene-sound-coverage.md): event, time, sound key in src/data/sfx_map.js. No silent events.
- Pick by what happens (material, size): strike = whoosh before + transient + low thud + material tail (rock / flesh / water / earth). Footsteps match surface and gait. Ambience layers change with mood (night, morning, dusk, river).
- No single default layer on all hits. Signature sounds only where they mean something. Music ducks under hits and speech; speech stays clear.
- Music cues: smith / smith2 / sad for grief, battle for fights, dawn for hope; the user's intro song only in menu and the level intro scene.

## Light, color, FX
- Mood changes carry emotion (gfx/mood.js: autumn_night, storm, autumn_dusk, dawn): fog, rim light, color grade, vignette. Use light pillars, dust, leaves, embers sparingly and meaningfully.
- Characters must look like themselves in close-ups (eyes, scars, markings); never break a trademark feature while fixing a pose.

## Text
- Only English on screen (no kana/kanji). Subtitles only while a line is spoken, two lines max. Impact names in big English letters.

## Verification before claiming "done"
1. Capture frame strips of each big beat (anticipation -> contact -> follow-through, 6 frames) into screenshots/contact/ and LOOK at them (Read tool). Iterate.
2. Run tools/contact-check.cjs (distance at hit time, no stacking) where relevant.
3. Check skip works (no stack overflow), no console errors, subtitles timing, sound coverage table complete.
