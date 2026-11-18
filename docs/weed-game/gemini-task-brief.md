# Gemini task: Animation Library v2 for the Weed fan game (Three.js, mobile)

You are an expert technical animator (Blender 4.x / bpy and/or Python + NumPy, Three.js). Work independently; do not ask questions.
Your output is FILES for another developer (Claude) to drop into a Three.js game. Do NOT edit any game code.

## 1. Context
- Game: a 2.5D side-view fan game of *Ginga Densetsu Weed* (anime story). Dogs are 3D models, Three.js, phones, landscape.
- Repo (public, read-only for you): https://github.com/ninoninja123/Anime-engine , branch `claude/eloquent-brown-u0vcoi`, folder `weed-game/`.
  - Source models: `weed-game/assets/models-src/*.glb` (static originals + rigged versions).
  - Your earlier work is already used: `weed_rigged.glb`, `kagetora_rigged.glb`, `tools/rig_dog_standalone.py`, `src/ext/dog_combat.js`.
  - Currently game-ready rigged models (all 24-bone skeleton, 9 clips): `weed_rigged`, `kaibutsu_rigged`, `smith_rigged`, `kagetora_rigged`, `striped_b_rigged`, `rocket_rigged`, `tobei_rigged`, `tesshin_auto`, `gin_auto`, `john_auto`, `hogen_rigged` (see `weed-game/public/models/` and `src/characters.js`).
- Existing skeleton (24 bones): root, spine_01..03, neck, head, jaw, ear_L/R, tail_01..03, front_upper/lower/paw_L/R, back_upper/lower/paw_L/R.
- Existing clips (9): idle, walk, run, jump, bite, hurt, die, battoga (360° body-axis spin), zetsu_tenrou_battouga (1080°).
- Conventions: dog faces +X, up +Y, paws at y=0 in rest pose, 30 fps, one-shot clips end in a stable pose.

## 2. Goal
Create ONE shared **animation library**: a GLB containing the standard 24-bone skeleton plus a large set of high-quality clips, built so that the clips can be applied to ANY of the rigged dogs above by bone name (Three.js `AnimationMixer` binds tracks by node name). The clips must work across dog sizes/proportions: therefore animate with **rotations only** (quaternion tracks) on all bones, and use position tracks ONLY on `root` as small body offsets relative to rest (height bob, lunge offset), expressed in **units relative to body length = 1.0** (document the unit, so the game can scale by model length).

## 3. Clips to deliver (exact names, lowercase, underscores)
Looping (seamless): `idle` (breathing, tail, ear twitches), `idle_alert` (ears up, head scanning), `idle_tired` (head low, slow breathing), `walk`, `run`, `limp_walk` and `limp_run` (favoring one front leg), `sniff` (head down, nose moves).
One-shot (end in stable pose; give duration in seconds):
- Combat: `bite`, `claw`, `lunge` (fast forward dash-bite, 0.45 s), `dodge_left`/`dodge_right`-style `sidestep` (0.3 s, side-to-side body lean, forward is +X), `block_brace` (crouch, ears back), `taunt_bark`, `howl` (long head-up howl, 2.5 s, hold at end), `roar` (jaw wide, chest expands, 1.6 s; for large bosses), `rear_up` (stand on hind legs and slam down, 1.4 s), `charge_start` (0.5 s windup) + `charge_loop` (looping gallop with head low).
- Reactions: `hurt_light`, `hurt_heavy` (knocked back, stagger), `stagger_recover`, `get_up` (from lying), `die` (collapse sideways, stays down), `die_standing` (stays on four legs, head drops, then very slowly sinks; for a veteran fighter who dies standing; 4.0 s, final pose held), `die_fall_back` (thrown back, lands on back/side).
- Emotion: `sit`, `lie_down`, `whimper` (head low, ears flat, small shakes), `look_up` (slow head raise toward the sky), `nod`, `shake_head`, `proud_stand` (chest out, head up, tail high, 1.5 s hold).
- Specials (keep existing quality or better): `battoga` (0.9 s, 360° body-axis spin + bite at peak), `zetsu_tenrou_battouga` (1.0 s, 1080° corkscrew), `jump`, `leap_attack` (long arc jump attack).
- For each one-shot also document in a table: duration, recommended hit window (start/end seconds, if an attack), loop flag, and whether it can be played at 1.5x speed without breaking.

## 4. Special model notes
- `smith_rigged`: this dog is three-legged (one leg missing). Provide `limp_walk`/`limp_run`/`idle`/`walk`/`run` variants that look natural on three legs: name them `smith_idle`, `smith_walk`, `smith_run`, `smith_jump`, `smith_leap_attack` (leap used in his sacrifice). Check which leg is missing in the model and rig/animate accordingly. If the shared skeleton cannot support this, deliver these as a separate small GLB `smith_anims.glb` and explain.
- `kaibutsu_rigged`: huge lion-like boss. Provide big-body versions of `idle`, `walk`, `roar`, `charge_start`/`charge_loop`, `rear_up`, `stagger`, `die` that feel heavy (slower, wider weight shifts), as `boss_*` clips in the same library (e.g. `boss_idle`, `boss_walk`, `boss_roar`, `boss_charge_loop`, `boss_rear_up`, `boss_stagger`, `boss_die`).
- `hogen_rigged` (big Great-Dane-like villain): `boss_*` clips also work for him; add `boss_menace_walk` (slow predatory walk) and `boss_final_form_idle` (aura-like heavy breathing, shoulders raised).

## 5. Quality checks (do them, and report results)
1. Build a test page `test_anim_library.html` (Three.js, no build step, importmap, run with `npx serve .`) that loads the library plus at least 3 different rigged dogs (`weed_rigged`, `kaibutsu_rigged`, `smith_rigged` from the repo) and lets me pick any clip per dog, including speed control and a bone-axis gizmo. Show clip name, duration, and loop flag.
2. Verify that clips retarget cleanly by bone name onto all 11 rigged dogs without mesh stretching, ears/tail flipping, or feet sliding through the ground (feet may leave the ground only in jumps/rears). Fix or flag any dog that fails.
3. Provide a contact sheet PNG (6 frames per clip) for the most important clips: `run`, `lunge`, `howl`, `roar`, `rear_up`, `die`, `die_standing`, `battoga`, `zetsu_tenrou_battouga`, `limp_walk`.
4. Keep file size small: library GLB <= 1.5 MB (no textures, no mesh required except an optional tiny proxy), clips sparse (keyframes every 2-4 frames), quaternion tracks only.

## 6. Deliverables (put in one folder, then tar it as `anim-library-v2.tgz`)
- `anim_library.glb` (skeleton + all clips)
- `smith_anims.glb` only if needed
- `ANIM_LIBRARY.md`: table of all clips (name, duration, loop, hit window, notes), the relative-unit rules, and a 15-line Three.js snippet showing how to apply a clip from the library to any rigged dog:
  ```js
  // example: apply by bone name
  const lib = await loader.loadAsync('anim_library.glb');
  const mixer = new THREE.AnimationMixer(dogGltf.scene);
  const action = mixer.clipAction(THREE.AnimationClip.findByName(lib.animations, 'howl'), dogGltf.scene);
  ```
- `test_anim_library.html` and `contact_sheet.png`
- Any Python/Blender scripts you used (`build_anim_library.py`).

## 7. Constraints / do not
- Do not modify or rename bones. Do not change the models' meshes or textures. Do not output gore/blood (game is PEGI 12).
- No external paid tools. Blender 4.x or pure Python+NumPy+pygltflib/trimesh are fine.
- Do not guess about the game; if something is ambiguous, choose the more natural-looking option and note it in `ANIM_LIBRARY.md`.
- Final answer: a short summary (<200 words) listing what is done and any clips that were skipped or are weak.
