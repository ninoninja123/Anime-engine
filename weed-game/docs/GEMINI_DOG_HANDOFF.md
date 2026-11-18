# Claude Handoff: Rigatut Koirat (`weed_rigged.glb`, `wolf_rigged.glb`) + Yleinen Hyökkäys- & Battouga-järjestelmä (`dog_combat.js`)

Tässä on valmis paketti Three.js-mobiilipeliin. Mukana on sekä **valmiiksi 24-luiseksi rigatut ja animoidut koira/susi-GLB:t** ETTÄ **yleinen `dog_combat.js`-moduuli**, jolla mikä tahansa koira-GLB (myös täysin rigaamaton staattinen GLB!) osaa liikkua ja tehdä hyökkäykset mukaan lukien **Battouga** (360°) ja **Zetsu Tenrou Battouga** (1080° kolmoiskierrepusku + kevyt hopeansininen tuulipyörre-efekti!).

---

## 1. Valmiit tiedostot kansiossa `/Users/ninoarling/.gemini/antigravity/scratch/dog-rig/`

- **`weed_rigged.glb`** (3.49 MB, 24 850 kolmiota, PBR-tekstuurit tallella, 24 luuta, 9 animaatiota) — tehty husky-mallista.
- **`wolf_rigged.glb`** (3.61 MB, 19 774 kolmiota, PBR-tekstuurit tallella, 24 luuta, 9 animaatiota) — tehty raidallisesta susi/koira-mallista (`striped_wolf_3d_model.glb`, esim. Gin).
- **`dog_combat.js`** — Yleinen Three.js-koirakontrolleri ja hyökkäysjärjestelmä (toimii rigatuilla JA rigaamattomilla GLB-koirilla!).
- **`rig_dog_standalone.py`** — Ilman Blenderiä toimiva Python+NumPy auto-riggaaja:
  ```bash
  python3 rig_dog_standalone.py oma_koira.glb oma_koira_rigged.glb
  ```
- **`rig_dog_blender.py`** — Täydellinen Blender 4.x (`bpy`) auto-riggaus- ja animaatio-skripti, jos haluat säätää painoja tai luita Blenderissä.
- **`test_dog.html`** — Esikatselusivu molemmille koirille ja kaikille iskuille (`npx serve .` kansiossa).
- **`dog-pack-v1.tgz`** — Kaikki yllä olevat yhdessä paketissa.

---

## 2. GLB-mallien speksit ja animaatioklipit (30 FPS, Y-up)

- **Suunta**: Koira katsoo oletuksena **`+X`**, ylös on **`+Y`**, tassut maassa **`Y = 0`**.
  - Jos pelisi hahmot katsovat `+Z`-suuntaan, anna `createDogActor(THREE, gltf, { facingAxis: '+Z' })`, niin moduuli kääntää koiran automaattisesti!
- **Luusto (24 luuta < 30 raja)**:
  `root`, `spine_01..03`, `neck`, `head`, `jaw`, `ear_L/R`, `tail_01..03`, `front_upper/lower/paw_L/R`, `back_upper/lower/paw_L/R` (max 4 painoa/verteksti, vasen/oikea jalka -vuoto estetty).
- **Sisäänleivotut animaatioklipit (9 kpl)**:
  1. `idle` (2.0 s, saumaton looppi) — hengitys, pään/hännän liike, korvien nykiminen
  2. `walk` (1.0 s, saumaton looppi) — diagonaalinen kävely
  3. `run` (0.6 s, saumaton looppi) — laukka selkärangan joustolla
  4. `jump` (0.8 s, one-shot) — kyyristys, ponnistus, ilmalento, alastulo
  5. `bite` (0.5 s, one-shot) — syöksy eteen ja leukojen napautus
  6. `hurt` (0.4 s, one-shot) — osumarekyyli taaksepäin
  7. `die` (1.2 s, one-shot, jää maahan) — kaatuminen kyljelleen
  8. `battoga` (0.9 s, one-shot) — 360° pituusakselin kierrehyppy + pureaisu huipulla
  9. `zetsu_tenrou_battouga` (1.0 s, one-shot) — Ginga-erikoisisku: räjähtävä ponnistus + **1080° (3 täyttä kierrosta)** poramainen ilmakierre pituusakselin ympäri!

---

## 3. Käyttöohje Claudelle (Three.js-integraatio)

Kopioi `weed_rigged.glb`, `wolf_rigged.glb` ja `dog_combat.js` pelin asset/koodikansioon ja käytä näin:

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createDogActor } from './dog_combat.js';

const loader = new GLTFLoader();
let weedActor = null;

loader.load('/assets/weed_rigged.glb', (gltf) => {
  // Toimii sekä rigatuilla (weed_rigged.glb, wolf_rigged.glb) ETTÄ millä tahansa staattisella koira-GLB:llä!
  weedActor = createDogActor(THREE, gltf, {
    facingAxis: '+Z',     // '+Z' jos pelin forward on +Z, tai '+X' (oletus)
    targetHeight: 0.75,   // skaalaa koiran säkä-/korkeuden (0 = pidä alkuperäinen koko)
    enableVfx: true,      // lisää kevyen Battouga-tuulipyörteen (0 tekstuuria, mobiiliystävällinen)
    onHitStart: (attackName, spec, actor) => {
      // Kutsutaan kun iskun osumaikkuna aukeaa!
      const hit = actor.getAttackSphere(); // { center: Vector3, radius: number, active: boolean }
      console.log('Osumaikkuna auki:', attackName, 'vahinkokerroin:', spec.damageMult, hit);
    },
  });

  scene.add(weedActor.root);
});

// Liiketilan vaihto ('idle' | 'walk' | 'run'):
// weedActor.setLocomotion('run');

// Iskut ja toiminnat ('bite' | 'claw' | 'battoga' | 'zetsu_tenrou_battouga' | 'jump' | 'hurt' | 'die'):
// weedActor.attack('zetsu_tenrou_battouga');

// Pelisilmukassa joka framella:
function animate(dt) {
  if (weedActor) {
    weedActor.update(dt);
    if (weedActor.isInHitWindow()) {
      const { center, radius } = weedActor.getAttackSphere();
      // Tarkista etäisyys viholliseen: enemyPos.distanceTo(center) < radius + enemyRadius
    }
  }
}
```

---

## 4. Täydellinen `dog_combat.js` lähdekoodi (valmis kopioitavaksi suoraan peliin)

```javascript
/**
 * dog_combat.js — Universal Three.js Dog Animator & Attack System (Ginga / Battouga Ready)
 * ========================================================================================
 * Works seamlessly with BOTH:
 *   1) Rigged 24-bone dog GLBs (weed_rigged.glb, wolf_rigged.glb, or any output of rig_dog_*.py)
 *   2) ANY raw, unrigged static dog/wolf GLB (auto-normalizes orientation & runs full procedural
 *      locomotion + attacks including Battouga & Zetsu Tenrou Battouga!).
 *
 * Coordinate convention inside actor.root:
 *   - Forward : +X (set options.facingAxis = '+Z' if your game moves characters along +Z!)
 *   - Up      : +Y (paws rest at Y = 0)
 *
 * Supported states / clips:
 *   Looping    : 'idle', 'walk', 'run'
 *   One-shots  : 'jump', 'bite', 'claw', 'hurt', 'die', 'battoga', 'zetsu_tenrou_battouga'
 */

export const DOG_ATTACK_SPECS = {
  bite: {
    clip: 'bite',
    duration: 0.50,
    hitWindow: [0.18, 0.34],
    lungeDist: 0.35,
    damageMult: 1.0,
    vfxMode: 'fang',
  },
  claw: {
    clip: 'bite',
    duration: 0.45,
    hitWindow: [0.15, 0.32],
    lungeDist: 0.28,
    damageMult: 0.9,
    vfxMode: 'slash',
  },
  battoga: {
    clip: 'battoga',
    duration: 0.90,
    hitWindow: [0.22, 0.75],
    lungeDist: 1.15,
    spins: 1, // 360 deg
    damageMult: 1.8,
    vfxMode: 'battoga',
  },
  zetsu_tenrou_battouga: {
    clip: 'zetsu_tenrou_battouga',
    duration: 1.00,
    hitWindow: [0.16, 0.82],
    lungeDist: 1.85,
    spins: 3, // 1080 deg high-RPM corkscrew drill!
    damageMult: 3.0,
    vfxMode: 'zetsu',
  },
};

/**
 * Wraps a loaded GLTF (`gltf` or `gltf.scene`) into a game-ready DogActor.
 * @param {typeof import('three')} THREE
 * @param {object} gltfOrScene - Result from GLTFLoader (`{ scene, animations }`) or a `THREE.Object3D`
 * @param {object} [options]
 * @param {'+X'|'+Z'} [options.facingAxis='+X'] - Set to '+Z' if your game's lookAt/forward uses +Z
 * @param {number} [options.targetHeight=0] - Optional height normalization (e.g. 0.75 meters); 0 keeps original scale
 * @param {boolean} [options.enableVfx=true] - Spawns lightweight spiral wind-slash VFX on Battouga attacks
 * @param {(attackName: string, spec: object, actor: object) => void} [options.onHitStart] - Fires when hit window opens
 */
export function createDogActor(THREE, gltfOrScene, options = {}) {
  const opts = {
    facingAxis: '+X',
    targetHeight: 0,
    enableVfx: true,
    onHitStart: null,
    ...options,
  };

  const sourceScene = gltfOrScene.scene || gltfOrScene;
  const animations = gltfOrScene.animations || [];
  const isRigged = animations.length > 0;

  // Outer root moved by game physics/AI
  const root = new THREE.Group();
  root.name = 'DogActorRoot';

  // Facing adapter (+X native -> +Z if game uses +Z forward)
  const facingPivot = new THREE.Group();
  if (opts.facingAxis === '+Z') {
    facingPivot.rotation.y = -Math.PI * 0.5; // maps local +X forward to +Z forward!
  }
  root.add(facingPivot);

  // Ground motion pivot (handles procedural lunge/jump/bob) & longitudinal spin pivot (+X body axis)
  const motionPivot = new THREE.Group();
  const bodyCenterPivot = new THREE.Group();
  facingPivot.add(motionPivot);
  motionPivot.add(bodyCenterPivot);

  // Measure bounding box & normalize static models automatically
  sourceScene.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(sourceScene);
  const rawSize = new THREE.Vector3();
  const rawCenter = new THREE.Vector3();
  rawBox.getSize(rawSize);
  rawBox.getCenter(rawCenter);

  if (opts.targetHeight > 0 && rawSize.y > 1e-5) {
    const s = opts.targetHeight / rawSize.y;
    sourceScene.scale.multiplyScalar(s);
    sourceScene.updateMatrixWorld(true);
    rawBox.setFromObject(sourceScene);
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);
  }

  // If static unrigged model has Z longer than X, auto-rotate +90 deg so longest axis is +X!
  if (!isRigged && rawSize.z > rawSize.x * 1.15) {
    sourceScene.rotation.y += Math.PI * 0.5;
    sourceScene.updateMatrixWorld(true);
    rawBox.setFromObject(sourceScene);
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);
  }

  const H = Math.max(rawSize.y, 0.2);
  const L = Math.max(rawSize.x, 0.25);
  const spineCenterY = H * 0.52;

  if (!isRigged) {
    // Center static mesh around spineCenterPivot so 360/1080 corkscrew spins around exact body core!
    sourceScene.position.x -= rawCenter.x;
    sourceScene.position.z -= rawCenter.z;
    sourceScene.position.y -= rawBox.min.y + spineCenterY;
    bodyCenterPivot.position.y = spineCenterY;
    bodyCenterPivot.add(sourceScene);
  } else {
    // Rigged GLBs already spin around their `root` bone at spine height with paws on Y=0
    motionPivot.add(sourceScene);
  }

  // Prevent frustum-culling flicker during high-speed leaps
  sourceScene.traverse((obj) => {
    if (obj.isMesh) {
      obj.frustumCulled = false;
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  // ---- Lightweight Battouga / Zetsu Tenrou Battouga Wind-Slash Vortex VFX (2 meshes, 0 textures!) ----
  let vfxGroup = null;
  let vfxHelixA = null;
  let vfxHelixB = null;
  let vfxCone = null;
  if (opts.enableVfx) {
    vfxGroup = new THREE.Group();
    vfxGroup.position.set(0.05 * L, spineCenterY, 0);
    vfxGroup.visible = false;

    const matCyan = new THREE.MeshBasicMaterial({
      color: 0x7ef4ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const matSilver = new THREE.MeshBasicMaterial({
      color: 0xdffbff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // Open-ended aerodynamic drill cone around the spinning dog (+X forward)
    const coneGeo = new THREE.ConeGeometry(H * 0.48, L * 1.45, 16, 1, true);
    coneGeo.rotateZ(-Math.PI * 0.5); // tip points +X!
    vfxCone = new THREE.Mesh(coneGeo, matCyan);

    // Dual tilted razor-wind slash rings
    const ringGeo = new THREE.TorusGeometry(H * 0.52, H * 0.032, 6, 24);
    ringGeo.rotateY(Math.PI * 0.5);
    vfxHelixA = new THREE.Mesh(ringGeo, matSilver);
    vfxHelixA.rotation.z = 0.32;
    vfxHelixA.position.x = 0.12 * L;

    vfxHelixB = new THREE.Mesh(ringGeo, matCyan);
    vfxHelixB.rotation.z = -0.32;
    vfxHelixB.scale.setScalar(0.82);
    vfxHelixB.position.x = -0.14 * L;

    vfxGroup.add(vfxCone, vfxHelixA, vfxHelixB);
    motionPivot.add(vfxGroup);
  }

  // ---- AnimationMixer Setup (for Rigged GLBs) ----
  const mixer = isRigged ? new THREE.AnimationMixer(sourceScene) : null;
  const actions = {};
  if (mixer) {
    for (const clip of animations) {
      const act = mixer.clipAction(clip);
      const isLoop = clip.name === 'idle' || clip.name === 'walk' || clip.name === 'run';
      act.setLoop(isLoop ? THREE.LoopRepeat : THREE.LoopOnce, isLoop ? Infinity : 1);
      act.clampWhenFinished = !isLoop;
      actions[clip.name] = act;
    }
  }

  // ---- Runtime State ----
  let locoState = 'idle';
  let activeClipName = null;
  let oneShot = null; // { name, spec, elapsed, duration, hitFired }
  let locoTime = 0;
  let isDead = false;

  function crossfadeTo(clipName, fadeSec = 0.14) {
    if (!mixer || !actions[clipName]) return;
    if (activeClipName === clipName && actions[clipName].isRunning()) return;
    const next = actions[clipName];
    const prev = activeClipName ? actions[activeClipName] : null;
    next.reset();
    next.enabled = true;
    next.setEffectiveTimeScale(1);
    next.setEffectiveWeight(1);
    if (prev && prev !== next) {
      next.crossFadeFrom(prev, fadeSec, false);
    }
    next.play();
    activeClipName = clipName;
  }

  if (isRigged && actions.idle) {
    crossfadeTo('idle', 0.01);
  }

  const actor = {
    root,
    isRigged,
    dimensions: { length: L, height: H },
    clips: Object.keys(actions),

    /** Set continuous locomotion ('idle' | 'walk' | 'run') */
    setLocomotion(nextState) {
      if (isDead) return;
      if (nextState !== 'idle' && nextState !== 'walk' && nextState !== 'run') return;
      locoState = nextState;
      if (!oneShot && isRigged) {
        crossfadeTo(locoState, 0.16);
      }
    },

    /** Trigger an attack or action ('bite' | 'claw' | 'battoga' | 'zetsu_tenrou_battouga' | 'jump' | 'hurt' | 'die') */
    playAction(name) {
      if (isDead && name !== 'idle') return false;
      if (name === 'idle' || name === 'walk' || name === 'run') {
        isDead = false;
        oneShot = null;
        this.setLocomotion(name);
        return true;
      }

      const spec = DOG_ATTACK_SPECS[name] || {
        clip: name,
        duration: name === 'die' ? 1.2 : name === 'jump' ? 0.8 : 0.4,
        hitWindow: null,
        lungeDist: 0,
        spins: 0,
        vfxMode: 'none',
      };

      if (name === 'die') isDead = true;

      oneShot = {
        name,
        spec,
        elapsed: 0,
        duration: spec.duration,
        hitFired: false,
      };

      if (isRigged) {
        const targetClip = actions[spec.clip] ? spec.clip : (actions.bite ? 'bite' : null);
        if (targetClip) {
          activeClipName = null; // allow re-triggering same attack cleanly
          crossfadeTo(targetClip, 0.08);
        }
      }
      return true;
    },

    /** Convenience alias for combat attacks */
    attack(attackName = 'zetsu_tenrou_battouga') {
      return this.playAction(attackName);
    },

    /** Returns true while inside the active damage frames of an attack */
    isInHitWindow() {
      if (!oneShot || !oneShot.spec.hitWindow) return false;
      const [t0, t1] = oneShot.spec.hitWindow;
      return oneShot.elapsed >= t0 && oneShot.elapsed <= t1;
    },

    /** World-space attack sphere center & radius for fast Three.js collision checks */
    getAttackSphere(outCenter = new THREE.Vector3()) {
      const localOffset = new THREE.Vector3(L * 0.55, H * 0.52, 0);
      motionPivot.localToWorld(outCenter.copy(localOffset));
      const radius = oneShot && (oneShot.name === 'zetsu_tenrou_battouga' || oneShot.name === 'battoga')
        ? H * 0.72
        : H * 0.42;
      return { center: outCenter, radius, active: this.isInHitWindow() };
    },

    /** Call every frame with delta seconds (`dt`) */
    update(dt) {
      const clampedDt = Math.min(dt, 0.1);
      locoTime += clampedDt;

      if (mixer) {
        mixer.update(clampedDt);
      }

      // Reset additive procedural pivots before applying current state
      motionPivot.position.set(0, 0, 0);
      motionPivot.rotation.set(0, 0, 0);
      if (!isRigged) {
        bodyCenterPivot.position.set(0, spineCenterY, 0);
        bodyCenterPivot.rotation.set(0, 0, 0);
        bodyCenterPivot.scale.set(1, 1, 1);
      }

      // ---- Handle One-Shot Actions & Attacks ----
      if (oneShot) {
        oneShot.elapsed += clampedDt;
        const u = Math.min(1, oneShot.elapsed / oneShot.duration);
        const { name, spec } = oneShot;

        if (!oneShot.hitFired && spec.hitWindow && oneShot.elapsed >= spec.hitWindow[0]) {
          oneShot.hitFired = true;
          if (typeof opts.onHitStart === 'function') {
            opts.onHitStart(name, spec, this);
          }
        }

        // Spiral Wind-Slash VFX update for Battouga & Zetsu Tenrou Battouga
        if (vfxGroup) {
          const showVfx = (spec.vfxMode === 'battoga' || spec.vfxMode === 'zetsu') && u > 0.14 && u < 0.86;
          vfxGroup.visible = showVfx;
          if (showVfx) {
            const su = (u - 0.14) / 0.72;
            const env = Math.sin(su * Math.PI);
            const isZetsu = spec.vfxMode === 'zetsu';
            vfxGroup.rotation.x = su * Math.PI * 2 * (isZetsu ? 5 : 2.5);
            vfxGroup.scale.setScalar(isZetsu ? 1.18 : 0.92);
            // Match airborne root height on rigged models
            if (isRigged) {
              vfxGroup.position.x = (0.05 + (isZetsu ? 0.45 : 0.30) * su) * L;
              vfxGroup.position.y = spineCenterY + (isZetsu ? 0.48 : 0.38) * env * H;
            } else {
              vfxGroup.position.set(0.08 * L, spineCenterY, 0);
            }
            vfxCone.material.opacity = env * (isZetsu ? 0.48 : 0.30);
            vfxHelixA.material.opacity = env * (isZetsu ? 0.78 : 0.50);
            vfxHelixB.material.opacity = env * (isZetsu ? 0.65 : 0.40);
          }
        }

        // Procedural fallback motion for UNRIGGED static dog GLBs (and extra forward impulse!)
        if (!isRigged) {
          if (name === 'battoga' || name === 'zetsu_tenrou_battouga') {
            const spins = name === 'zetsu_tenrou_battouga' ? 3 : 1;
            if (u < 0.15) {
              const cu = u / 0.15;
              motionPivot.position.set(-0.08 * L * cu, -0.14 * H * cu, 0);
              bodyCenterPivot.scale.set(1 - 0.08 * cu, 1 - 0.12 * cu, 1 + 0.06 * cu);
            } else if (u < 0.84) {
              const su = (u - 0.15) / 0.69;
              const arc = Math.sin(su * Math.PI);
              motionPivot.position.set((-0.05 + 0.55 * su) * L, (0.18 + 0.46 * arc) * H, 0);
              bodyCenterPivot.rotation.x = su * Math.PI * 2 * spins; // Longitudinal +X drill spin!
              bodyCenterPivot.scale.set(1.16, 0.88, 0.88); // Aerodynamic torpedo stretch!
            } else {
              const lu = (u - 0.84) / 0.16;
              motionPivot.position.set(0.15 * (1 - lu) * L, -0.06 * Math.sin(lu * Math.PI) * H, 0);
            }
          } else if (name === 'bite' || name === 'claw') {
            const lunge = Math.sin(u * Math.PI);
            motionPivot.position.x = (u < 0.25 ? -0.08 : 0.28 * lunge) * L;
            motionPivot.position.y = 0.06 * lunge * H;
            bodyCenterPivot.rotation.z = name === 'claw' ? 0.18 * lunge : -0.14 * Math.sin(u * Math.PI * 2);
            if (name === 'claw') bodyCenterPivot.rotation.x = 0.25 * Math.sin(u * Math.PI * 2);
          } else if (name === 'jump') {
            const arc = Math.sin(u * Math.PI);
            motionPivot.position.y = 0.45 * arc * H;
            bodyCenterPivot.rotation.z = 0.28 * Math.cos(u * Math.PI);
          } else if (name === 'hurt') {
            const flinch = Math.sin(u * Math.PI);
            motionPivot.position.x = -0.18 * flinch * L;
            bodyCenterPivot.rotation.z = 0.22 * flinch;
          } else if (name === 'die') {
            const du = Math.min(1, u / 0.55);
            motionPivot.position.y = -0.34 * du * H;
            bodyCenterPivot.rotation.x = (Math.PI * 0.5) * du;
          }
        } else if (name === 'claw') {
          // Additive body roll on rigged 'bite' clip to turn it into a fierce claw swipe!
          motionPivot.rotation.x = 0.35 * Math.sin(u * Math.PI);
          motionPivot.rotation.y = 0.22 * Math.sin(u * Math.PI * 2);
        }

        if (oneShot.elapsed >= oneShot.duration) {
          if (vfxGroup) vfxGroup.visible = false;
          if (!isDead) {
            oneShot = null;
            if (isRigged) crossfadeTo(locoState, 0.14);
          }
        }
        return;
      }

      if (vfxGroup) vfxGroup.visible = false;

      // ---- Continuous Procedural Locomotion for UNRIGGED Static Dog GLBs ----
      if (!isRigged && !isDead) {
        if (locoState === 'idle') {
          const br = Math.sin(locoTime * Math.PI * 2.0);
          bodyCenterPivot.scale.set(1.0, 1.0 + 0.018 * br, 1.0 + 0.015 * br);
          bodyCenterPivot.rotation.y = 0.03 * Math.sin(locoTime * 1.6);
        } else if (locoState === 'walk') {
          const ph = locoTime * Math.PI * 2.0 * 1.4;
          motionPivot.position.y = Math.abs(Math.sin(ph)) * 0.05 * H;
          bodyCenterPivot.rotation.z = 0.06 * Math.cos(ph);
          bodyCenterPivot.rotation.x = 0.04 * Math.sin(ph);
        } else if (locoState === 'run') {
          const ph = locoTime * Math.PI * 2.0 * 2.6;
          motionPivot.position.y = Math.max(0, Math.sin(ph)) * 0.14 * H;
          bodyCenterPivot.rotation.z = 0.18 * Math.cos(ph);
          bodyCenterPivot.scale.set(1.0 + 0.06 * Math.sin(ph), 1.0 - 0.04 * Math.sin(ph), 1.0);
        }
      }
    },
  };

  return actor;
}

```
