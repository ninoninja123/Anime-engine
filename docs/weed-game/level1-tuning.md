# Prologue (level 1): playability tuning and test notes

All gameplay numbers live in `weed-game/src/data/level1_config.js` (`PLAYER`, `RUNS`, `FIGHTS`). This file says what was
changed in the 2026-11-19 test pass and why. Target: a phone player in landscape, **first attempt winnable**, no
frustration; the chapter is a story prologue, the hard fights come in level 2.

## How it was measured

`weed-game/tools/level1-playthrough.cjs` (Playwright, 844x390 landscape, touch): virtual clock (performance.now, Date.now,
rAF, setTimeout/setInterval replaced) and the 3D render switched off except for screenshots, so the whole chapter runs in
~40 s instead of tens of minutes under swiftshader. Input is real: synthetic pointer events on `#touch` go through
`input.js` (a swipe fires on release, ~0.1 s after touch-down). A scripted player reacts only to what is on screen (warning
icon / "!" / Mel's flash) after a human reaction time:

- `--bot=good`: 0.30 s reaction, ±0.06 s timing jitter, never misses a read.
- `--bot=sloppy`: 0.42 s reaction, ±0.14 s jitter, ignores 12 % of the warnings (a distracted first-time player).
- `--notut` turns the first-time tutorials off (worst case: a player who already saw them).

```
cd weed-game && npx vite --port 4192 &
URL=http://localhost:4192/ node tools/level1-playthrough.cjs all                 # every section + scenarios (19 checks)
URL=http://localhost:4192/ node tools/level1-playthrough.cjs 1,2,4,5 --bot=sloppy --repeat=6 --notut   # difficulty
URL=http://localhost:4192/ node tools/level1-playthrough.cjs 1,2,4,5 --perf      # draw calls in runs/fights (q=med)
... --shots                                                                       # PNGs -> screenshots/level1_playthrough/
```

Scenarios in `all`: each of the 8 sections cleared with Skip pressed in every cutscene (also the fight cut-ins), checkpoint
saved, result screen → "Continue: Level 2" starts level 2, `weed.p1done` saved; idle player loses a run and a fight →
defeat screen → Retry → cleared; pause freezes the run, resume continues, Main menu returns to the menu; menu → Prologue
offers the checkpoint and resumes there; portrait viewport shows the rotate prompt and pauses the run.

## Results

First-try wins of the scripted player (8 tries per section after tuning; "before" = 6 tries with the original values):

| Section | before: sloppy, no tutorial | after: sloppy, tutorial on 1st try | after: sloppy, no tutorial | after: good |
|---|---|---|---|---|
| Farm run | 3/6 (chains of hits) | 7/8 | 7/8 | all, 0–1 hearts lost |
| Tosa fight | 6/6 | 8/8 | 8/8 | all, 0 hearts lost |
| Jōshū run | 4/6 (at 3 hearts, 6.6 speed) | 7/8 | 8/8 | all, 0 hearts lost |
| Blue fight | 3/6 — even the good bot lost 2 of 4 | 7/8 | 6/8 | all, 1–2 hearts lost |

The sloppy player ignores one warning in eight; a real first-timer also gets the slow-motion tutorial on the first
obstacle/attack of each kind. Every loss is one "Retry from checkpoint" (the run or fight only, not its cutscene).

## Changes and reasons

### Runner (farm, Jōshū)
| Value | Before | After | Why |
|---|---|---|---|
| course | seeded random list (the hand-made `obstacles` in the config were ignored) | the config list | the same course every attempt: it can be learned, and obstacles of the config are spaced 1.0–1.7 s apart with the easy ones first |
| hit stumble | speed × 0.55 for 0.5 s | none | after a hit the next obstacle arrived later than it looked, so the next jump was early → chains of 2–3 hits (most farm defeats) |
| hearts | 3 | 4 | a first-time player misses ~1 in 8 reads; 15 obstacles × 12 % ≈ 2 hits; 4 hearts leave room for one more |
| speed farm / town | 6.0 / 6.6 | 5.8 / 6.2 | ~5 % more time per obstacle; the town run has the most duck/jump switches |
| `clearFrac` | 0.75 | 0.65 | jump counts if Weed is above 65 % of the obstacle height when it passes: hitbox closer to what is seen (the pup clears a log visually earlier than the check said) |
| `duckT` | 0.7 s | 0.8 s | duck window = 0.8 s; jump window ≈ 0.5 s; the two now feel equally forgiving |
| `invT` | 1.3 s | 1.5 s | no double hit from the next obstacle right after a hit |
| beam + high jump | always a hit unless ducking | a jump higher than the beam's top also clears it (nets still need a duck) | the pup visibly sailed over the beam and still lost a heart |
| bark range | ahead < 7.5 | ahead < `iconAt` + 0.5 (10.5) | the TAP icon appears at 10: a bark at first sight did nothing (bug); now "icon visible = bark works" |
| swipe latency | on release | fires as soon as the finger has moved 34 px vertically (runner only) | ~0.1 s earlier jump/duck, the release is ignored |
| tutorial | text hint only | first log / beam / birds: slow motion 0.2× + callout ("Swipe ↑ to jump") until the player does it (3.5 s max) | first attempt winnable without reading the hint bar |

Unchanged: jump 7.6 / gravity 25 (airtime 0.61 s, peak 1.16), warning icon at 10 units (1.6–1.7 s ahead).

### Fights (Tosa, Blue)
| Value | Before | After | Why |
|---|---|---|---|
| charge start | from the boss's keeping distance (2.3 units ≈ 0.18 s to impact) | the dog first backs off to 4.2 units (`chargeRunUp`), and the run to Weed takes ≥ 0.45 s (`chargeMinT`; shorter run-up near a wall = slower charge) | the charge could not be seen coming; even the good bot (0.3 s) jumped too late |
| jump clears charge at | y > 0.5 | y > 0.42 (`jumpClear`) | the pup's whole body is above the charging dog's back earlier than 0.5 |
| Mel | could lunge in the same moment as Blue | waits until Blue's attack is over (and Blue waits for Mel) | two threats at once was the main cause of hits; one threat at a time is readable on a small screen |
| Mel wind-up `teleMel` | 0.6 s | 0.8 s + yellow "!" over Mel | dodge (0.2 s) + reaction (0.3 s) + gesture (0.1 s) did not fit in 0.6 s |
| Mel dash `melDash` | 2.6 | 2.2 | Mel stops ~0.3 past Weed's spot, a 1.7 dodge always gets out |
| Blue hearts | 4 | 5 (`FIGHTS.blue.hearts`) | the chapter's boss with two attackers; Tosa keeps 4 |
| movement | per frame (`/60`) | per elapsed game time | at 30 fps (common on phones) the boss walked and charged at half speed |
| tutorial | hint text | first charge / lunge / feint / Mel: slow motion 0.3× + callout until the right move | |

Telegraph times (`teleCharge 0.95`, `teleLunge 0.75`, `teleFake 0.35`, `teleFeint 0.45`, divided by the boss speed) were
kept: with the run-up and the coordination the sloppy bot wins 6/6.

## UI / UX added
- Checkpoints: each section is a checkpoint (`weed.p1.section`); it was saved but never used. Now the menu's Prologue
  button offers "▶ Continue (n/8)" + the section name, or "Start from the beginning".
- Defeat screen: "Retry from checkpoint" + a tip for the run/fight that was lost.
- Result screen: time, falls, perfect dodges ("No falls!" for a clean full run).
- Portrait phone: the existing rotate prompt + a run/fight in progress pauses behind it.
- Fight cut-ins (Tosa throws Weed, Mel is set on Weed) now have the letterbox and the Skip button (they could not be
  skipped).

## Performance

`PR.flatten(group, keep)` (src/shared/props.js) merges every static mesh of a prop that shares a material (outline hulls
included) into one mesh. Used for the town backdrop, road (≈60 lane marks, each with its own material), net fence posts,
pond stones, the kennel (planks stay separate, they fly apart), and every runner obstacle (each goose separately so they
can still scatter). Obstacles are pooled per type (retry / second run reuse meshes) and the warning icons share one
texture per kind. Fight movement is frame-rate independent (30 fps phones).

Draw calls per frame during play (`--perf`, quality `med`, 844x390; average / max):

| | before | after |
|---|---|---|
| Farm run | 51 / 73 | 42 / 53 |
| Tosa fight | 119 / 146 | 68 / 96 |
| Jōshū run | 119 / 166 | 64 / 70 |
| Blue fight | 84 / 87 | 47 / 48 |

Triangles are unchanged (120–200 k, mostly the dogs and the world); headless fps is not meaningful (swiftshader).

## Not done / open
- Real-phone check of the swipe threshold (34 px early swipe) and of the callout size on small phones.
- The Story So Far still plays before the checkpoint offer when its "seen" flag is cleared (main.js order, out of scope).
- `tools/smoke-level1.cjs` (debug-hook smoke test, slow) is kept; `level1-playthrough.cjs` replaces it for normal use.
