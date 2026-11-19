# Prologue (level 1): placeholder characters and how to swap in your own models

Seven side characters of the Prologue chapter are **temporary placeholder dogs** built from models and looks that already
exist in the game. They are not character designs: they only have to read as *different dogs* (colour + size) until the
user's own models arrive. Weed (pup), GB and Smith use real models and are not placeholders.

## Where they are defined (one line each)

`weed-game/src/characters.js`, table `PROLOGUE_MODELS`:

| id | character | placeholder model | look / tint | height | how it reads on screen |
|---|---|---|---|---|---|
| `sakura` | Sakura (Weed's mother) | `gin_auto` | tint `#e6e2da` | 1.10 | big pale-white akita type |
| `sasuke` | Sasuke (shiba, GB's partner) | `gin_auto` | look `spitz_red_cream` | 0.66 | small red-and-cream spitz |
| `nero` | Nero (gang boss, Alps) | `generic_auto` | look `mutt_black_white` | 1.20 | black mutt with white |
| `tosa` | the farm Tosa (watchdog) | `tobei_rigged` | tint `#b8805a` | 1.30 | heavy red-brown mastiff, biggest |
| `mel_pup` | Mel (golden retriever pup) | `smith_rigged` | look `spaniel_liver` + tint `#f0c068` | 0.62 | small golden dog |
| `hook` | Hook (labrador, chained) | `generic_auto` | look `mutt_cream` | 1.08 | medium cream dog |
| `blue` | Blue (beauceron, thieves' boss) | `john_auto` | look `pinscher_black_tan` | 1.22 | black and tan shepherd type |

Changed in the Prologue test pass (2026-11-19): **Blue** was `shepherd_black` and looked almost the same as Nero
(both black, same size) → now black-and-tan (a beauceron is a black-and-tan breed; the exact anime colouring of Blue is
[UNCERTAIN], see canon-deep-dive.md §00). **Mel** was the Smith model tinted gold, which kept Smith's black head and read
as a small black-and-tan dog → now a liver/white look tinted gold = a golden pup. No new looks or textures were made.

Check: `URL=http://localhost:4192/ node weed-game/tools/level1-lineup.cjs` renders all Prologue actors in a row
(`weed-game/screenshots/level1_playthrough/lineup.png`).

## How to swap a placeholder for your model

1. Put the GLB in `weed-game/assets/models-src/` and run `npm run optimize-models` (→ `public/models/<name>.glb`).
   Rigged models with the usual clips (idle, walk, run, jump, bite, hurt, die) work directly; see README "Animaatiot".
2. Add the model to `MODELS` in `characters.js`, e.g. `blue_rigged: { file: 'blue_rigged.glb', rotY: 0, rigged: true },`
   (`rotY` turns the model so that it faces +X; compare with `smith_rigged`).
3. In `PROLOGUE_MODELS` change only that character's line: `model: '<your model>'`, `look: null`, `tint: null`, and set
   `height` in game units (Weed pup 0.5, Smith 0.98; relative sizes: canon-deep-dive.md §00).
4. Nothing else changes: `level1_config.js` builds the character entry from that line (`side()`), scenes refer to the role
   (`'blue'`, `'mel'`…), and `ACTORS` maps roles to ids. Remove the `PLACEHOLDER` comment on the line.
5. Test: `node weed-game/tools/level1-lineup.cjs` (looks), then `node weed-game/tools/level1-playthrough.cjs all`
   (the chapter still runs; fights use the model's length for reach, so a much longer/shorter model changes Blue's and the
   Tosa's reach slightly — re-run with `--bot=sloppy --repeat=6` if you want to check the difficulty).

Per-character gameplay values (gait, tail wag, rig amounts, role text) stay in `level1_config.js` `PROLOGUE_CHARS`.
