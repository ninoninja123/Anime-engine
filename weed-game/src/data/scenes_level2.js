// Level 2 scene scripts (data). Step format: see src/scenes.js. Lines: src/data/lines.js.
// Each export is a function (ctx) -> steps, so positions can depend on the current fight state.
import * as THREE from 'three';
import { tween, wait, shake } from '../engine.js';
import { rotBoneWorld } from '../contact.js';
import { A, Nod, Shiver, act, resetActing } from '../shared/acting.js';
import { Mark, From, Drift, Mood, GradeNow, Grade, drift, grade } from '../shared/cine.js';
import * as GZ from '../shared/gorge.js';
import * as SETS from '../shared/sets.js';
import { makeHeli } from '../shared/heli.js';

// post-battle memorial: five graves and who lies there (canon order of the memorial line)
const GRAVES = [[-3.2, -1.6], [-1.6, -1.8], [0.0, -1.9], [1.6, -1.8], [3.2, -1.6]];
const FALLEN = ['smith', 'north', 'robert', 'rocker', 'heuler'];
/** A fallen dog's spirit: the model itself, translucent and glowing, rises above its grave and fades. */
function ghostRise(d, x, z) {
  d.root.visible = true; d.root.position.set(x, 0.25, z); d.face(1, true); d.play('Idle', { timeScale: 0.5 });
  d.setTint(0xffe2b0, 1.2); d.fade(0.01);
  const o = { k: 0 };
  tween(o, { k: 1 }, 7, { real: true, ease: 'linear', onUpdate: () => {
    const k = o.k; d.root.position.y = 0.25 + k * 1.6;
    d.fade(Math.max(0.01, Math.min(0.65, k * 3) * (k > 0.7 ? (1 - k) / 0.3 : 1)));
  } }).then(() => { d.root.visible = false; d.setTint(0x000000, 0); d.fade(1); });
}

/** Collect line ids used by a scene (for preloading voice files). */
export function linesOf(steps, out = []) {
  for (const s of steps) { if (s.say) out.push(s.say); if (s.bark) out.push(s.bark); if (s.par) linesOf(s.par, out); }
  return out;
}

const MEN = ['robert', 'rocker', 'heuler'];
const GAME_CAM = { cam: [0, 2.4, 9], look: [0, 1.4, 0] };

// ------------------------------------------------------------------------------------------------
// PRE-BATTLE: arrival at Gajō, the pack gathers, Weed's vow, Jerome's squad, Kaibutsu appears.
export const intro = ({ cast }) => [
  From(['intro_gorge', 'intro_gajo']),
  Drift({ push: 0.03, truck: 0.02 }),
  { music: 'intro' },                                                   // the intro song: main menu + the level intro scene
  { fn: () => { for (const d of Object.values(cast)) d.root.visible = false; } },
  { place: 'weed', x: -13, z: 0.3, face: 1, anim: 'Walk' },
  { place: 'smith', x: -14.6, z: -0.9, face: 1, anim: 'Walk' },
  { place: 'ken', x: -15.6, z: 0.9, face: 1, anim: 'Walk' },
  { place: 'kagetora', x: -16.4, z: -0.1, face: 1, anim: 'Walk' },
  { cam: [-6, 9, 22], look: [-18, 22, -100] },
  { sfx: 'levelStart' }, { caption: '<b>LEVEL 2</b>Gajō – Kaibutsu', t: 3.4, wait: false },
  { cam: [0, 3.2, 13], look: [2, 2.5, 0], t: 4.2 },
  { say: 'intro_1' },
  // the pack walks in along the ridge – low tracking shot
  { cam: [-11, 0.6, 4.4], look: [-9, 1.0, 0] },
  { par: [
    { move: 'weed', x: -3.6, t: 4.2, anim: 'Walk', after: 'Idle' },
    { move: 'smith', x: -5.4, z: -0.9, t: 4.4, anim: 'Walk', after: 'Idle_2' },
    { move: 'ken', x: -6.6, z: 0.9, t: 4.5, anim: 'Walk', after: 'Idle' },
    { move: 'kagetora', x: -7.6, z: -0.1, t: 4.6, anim: 'Walk', after: 'Idle' },
    { cam: [-4.2, 1.0, 5.6], look: [-5.6, 0.9, 0], t: 4.4 },
  ] },
  // Ken & Kagetora bicker – two-shot
  { cam: [-5.4, 1.5, 5.4], look: [-7.2, 0.9, 0.3] },
  { expr: 'ken', name: 'determined' },
  A('ken', { head: -0.1, look: new THREE.Vector3(12, 6, -6), t: 0.6 }),
  { say: 'intro_smell' },
  A('kagetora', { head: -0.15, look: 'ken', t: 0.4 }),
  { anim: 'kagetora', name: 'Bark', loop: false },
  { say: 'intro_tease' },
  A('ken', { look: 'kagetora', ears: 0.4, t: 0.25 }),
  { anim: 'ken', name: 'Bark', loop: false },
  { expr: 'ken', name: 'angry' },
  { say: 'intro_shut' },
  { expr: 'ken', name: null },
  A('ken', { look: null, ears: 0, t: 0.6 }), A('kagetora', { look: null, t: 0.6 }),
  // Weed's vow – slow push-in to a close-up, the fortress behind him
  { move: 'weed', x: -2.8, t: 1.0, anim: 'Walk', after: 'Idle' },
  { cam: [-0.2, 0.9, 3.4], look: [-2.4, 0.7, 0] },
  { cam: [-1.4, 0.75, 1.9], look: [-2.5, 0.65, 0], t: 3.2, ease: 'out' },
  A('weed', { head: -0.2, look: new THREE.Vector3(12, 7, -6), t: 0.8 }),
  { expr: 'weed', name: 'determined' },
  { say: 'intro_vow' },
  { expr: 'weed', name: null },
  A('smith', { look: 'weed', t: 0.5 }),
  { music: 'smith', fade: 1.8 },                                       // Smith's theme: his first moment in the spotlight
  { dolly: 'smith', dist: 1.5, side: 0.8, t: 0.6 },
  { say: 'intro_proud' },
  Nod('smith', 0.25), A('weed', { head: 0, look: 'smith', t: 0.4 }),
  // Jerome and his men arrive at a gallop
  { place: 'jerome', x: -16, z: -1.7, face: 1, anim: 'Gallop' },
  { place: 'robert', x: -17.5, z: -2.7, face: 1, anim: 'Gallop' },
  { place: 'rocker', x: -18.3, z: -1.2, face: 1, anim: 'Gallop' },
  { place: 'heuler', x: -19.1, z: -2.2, face: 1, anim: 'Gallop' },
  { place: 'north', x: -19.9, z: -1.0, face: 1, anim: 'Gallop' },
  { cam: [-8.4, 1.4, 6.2], look: [-11, 0.9, -1.5] },
  { par: [
    { move: 'jerome', x: -8.8, z: -1.8, t: 1.9, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'robert', x: -10.2, z: -2.7, t: 2.0, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'rocker', x: -11.0, z: -1.3, t: 2.1, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'heuler', x: -11.8, z: -2.3, t: 2.2, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'north', x: -12.6, z: -1.1, t: 2.3, anim: 'Gallop', after: 'Idle', ease: 'out' },
  ] },
  { sfx: 'bark' },
  { dolly: 'jerome', dist: 1.5, side: 0.7, t: 0.5 },
  A('jerome', { head: -0.1, look: 'weed', t: 0.5 }), A('weed', { look: 'jerome', t: 0.5 }),
  { expr: 'jerome', name: 'determined' },
  { say: 'intro_arrive' },
  { dolly: 'heuler', dist: 1.7, side: -0.6, t: 0.4 },
  { expr: 'heuler', name: 'happy' },
  { say: 'intro_follow' },
  { expr: 'heuler', name: null }, { expr: 'jerome', name: null },
  // canon: the gorge before Gajō is crossed at night – Weed first, Smith with Ken and Kagetora at his sides
  Mark('intro_gorge'),
  Mood('autumn_night', 2.5),
  { amb: 'gorge' },
  { fn: (c) => { c._chasm = GZ.chasm({ x: -0.95, w: 1.7, len: 16 }); c.E.scene.add(c._chasm); c.FX.mistPlume(new THREE.Vector3(-0.95, -0.2, -1), 8, 3); } },
  { caption: '<b>The gorge before Gajō</b>Night', t: 2.6, wait: false },
  // 1. LOW at the lip, looking across the black gap at the moonlit far side
  { cam: [-2.7, 0.22, 1.9], look: [0.4, 1.0, -1.8] },
  A('weed', { head: 0.3, ears: 0.3, look: new THREE.Vector3(-0.95, -2, -0.5), t: 0.4 }),
  { wait: 1.2 },
  A('weed', { head: -0.2, ears: 0, look: null, t: 0.3 }),
  // 2. the run-up and the leap: slow motion at the top of the arc, silhouette against the sky
  { move: 'weed', x: -2.2, t: 0.45, anim: 'Gallop', ts: 1.3, ease: 'in' },
  { anim: 'weed', name: 'Gallop_Jump', loop: false }, { sfx: 'jump' },
  { par: [
    { move: 'weed', x: -0.9, y: 1.0, t: 0.32, ease: 'out', real: true },
    { cam: [-1.3, 0.1, 1.5], look: [-0.9, 1.1, -0.4], t: 0.32, ease: 'out' },
  ] },
  { slow: 0.18 }, { sfx: 'slowmo' },
  { move: 'weed', x: -0.5, y: 1.12, t: 0.6, ease: 'linear', real: false },
  { slow: 1 },
  { move: 'weed', x: 0.6, y: 0, t: 0.32, ease: 'in', after: 'Idle' }, { fx: 'dust', at: [0.6, 0.1, 0] }, { sfx: 'land' },
  // 3. WIDE side view: Smith, Ken and Kagetora follow together (Smith's three-legged leap)
  { cam: [-1.0, 1.0, 6.4], look: [-1.2, 0.7, -0.5] },
  { par: [
    { move: 'smith', x: -2.6, z: 0, t: 1.0, anim: 'Gallop', ts: 1.1 },
    { move: 'ken', x: -2.6, z: 0.7, t: 1.0, anim: 'Gallop', ts: 1.1 },
    { move: 'kagetora', x: -2.6, z: -0.7, t: 1.0, anim: 'Gallop', ts: 1.1 },
  ] },
  { anim: 'smith', name: 'Gallop_Jump', loop: false }, { anim: 'ken', name: 'Gallop_Jump', loop: false }, { anim: 'kagetora', name: 'Gallop_Jump', loop: false },
  { sfx: 'jump' },
  { par: [
    { move: 'smith', x: -0.9, y: 1.0, t: 0.42, ease: 'out' },
    { move: 'ken', x: -0.8, y: 1.1, z: 0.7, t: 0.42, ease: 'out' },
    { move: 'kagetora', x: -0.8, y: 1.1, z: -0.7, t: 0.42, ease: 'out' },
  ] },
  { par: [
    { move: 'smith', x: 1.0, y: 0, t: 0.36, ease: 'in', after: 'Idle' },
    { move: 'ken', x: 1.3, y: 0, z: 0.7, t: 0.36, ease: 'in', after: 'Idle' },
    { move: 'kagetora', x: 1.3, y: 0, z: -0.7, t: 0.36, ease: 'in', after: 'Idle' },
  ] },
  { fx: 'dust', at: [1.0, 0.1, 0] }, { sfx: 'land' },
  // Jerome's squad clears it in one line, like soldiers
  { par: [
    { move: 'jerome', x: -2.4, z: -1.6, t: 0.8, anim: 'Gallop', ts: 1.2 },
    { move: 'robert', x: -3.2, z: -2.4, t: 0.85, anim: 'Gallop', ts: 1.2 },
    { move: 'rocker', x: -3.6, z: -1.2, t: 0.9, anim: 'Gallop', ts: 1.2 },
    { move: 'heuler', x: -4.0, z: -2.0, t: 0.95, anim: 'Gallop', ts: 1.2 },
    { move: 'north', x: -4.4, z: -1.0, t: 1.0, anim: 'Gallop', ts: 1.2 },
  ] },
  { par: [
    { move: 'jerome', x: 2.4, y: 0, z: -1.6, t: 0.7, anim: 'Gallop_Jump', loop: false, ease: 'inOut', after: 'Idle' },
    { move: 'robert', x: 1.8, y: 0, z: -2.4, t: 0.75, anim: 'Gallop_Jump', ease: 'inOut', after: 'Idle' },
    { move: 'rocker', x: 2.9, y: 0, z: -1.2, t: 0.8, anim: 'Gallop_Jump', ease: 'inOut', after: 'Idle' },
    { move: 'heuler', x: 3.4, y: 0, z: -2.0, t: 0.85, anim: 'Gallop_Jump', ease: 'inOut', after: 'Idle' },
    { move: 'north', x: 3.9, y: 0, z: -1.0, t: 0.9, anim: 'Gallop_Jump', ease: 'inOut', after: 'Idle' },
    { cam: [0.4, 1.1, 6.2], look: [1.4, 0.7, -0.8], t: 0.9 },
  ] },
  { sfx: 'land' },
  Mark('intro_gajo'),
  // 4. GAJŌ: the fortress rock above them under the moon (low, slow push); the pack looks up
  ...['weed', 'smith', 'ken', 'kagetora', 'jerome'].map(id => A(id, { head: -0.3, look: new THREE.Vector3(14, 9, -6), t: 0.8 })),
  { cam: [-0.8, 0.35, 3.4], look: [12, 7, -6] },
  { caption: '<b>Gajō</b>', t: 2.4, wait: false },
  { cam: [-0.4, 0.4, 2.9], look: [12, 7.5, -6], t: 3.2, ease: 'inOut' },
  { sfx: 'crow' },
  ...['weed', 'smith', 'ken', 'kagetora', 'jerome'].map(id => A(id, { head: 0, look: null, t: 0.6 })),
  // 5. Jerome briefs them: MCU, the others turn to him
  { dolly: 'jerome', dist: 1.5, side: 0.7, t: 0.6 },
  A('weed', { look: 'jerome', t: 0.4 }), A('ken', { look: 'jerome', t: 0.4 }),
  { say: 'intro_weak' },
  { dolly: 'weed', dist: 1.5, side: -0.7, t: 0.4 },
  A('weed', { head: -0.15, look: null, t: 0.3 }),
  { anim: 'weed', name: 'Bark', loop: false },
  { say: 'intro_go' },
  { fn: (c) => { if (c._chasm) { c.E.scene.remove(c._chasm); c._chasm = null; } } },
  { fn: () => { drift(null); } },
];

// ------------------------------------------------------------------------------------------------
// Smith's right foreleg is missing (canon): keep it tucked and add a hitch to his gait while he runs.
function limp(d) {
  if (!d.bones || d._limp) return;
  const up = d.bones.front_upper_R, lo = d.bones.front_lower_R;
  const Z = new THREE.Vector3(0, 0, 1);
  d._limp = d.overlay((dd) => {
    if (dd.currentName !== 'Gallop' && dd.currentName !== 'Walk') return;
    if (up) rotBoneWorld(up, Z, 0.5 * dd.facing);
    if (lo) rotBoneWorld(lo, Z, -1.9 * dd.facing);
    const sp = d.bones.spine_03; if (sp) rotBoneWorld(sp, Z, Math.sin(dd.t * 15) * 0.06 * dd.facing);
  });
}

// SMITH'S SACRIFICE (long, emotional; skippable)
export const smith = (ctx) => {
  const { cast, S, E, FX, sfx, makeRock } = ctx;
  cast.smith.root.position.y = 0;
  const boss = cast.kaibutsu, B = S.B, H = boss.height;
  ctx.fallingRocks = [];
  return [
    { music: 'smith', fade: 2 },                                      // Smith's theme carries the whole sacrifice
    { fn: () => {
      S.W.x = -2.5; B.x = 4.4;
      cast.ken.root.position.set(-8.4, 0, -3.4); cast.kagetora.root.position.set(-7.0, 0, -3.0);
    } },
    { place: 'weed', x: -2.5, z: 0, face: 1, anim: 'Idle' },
    { place: 'kaibutsu', x: 4.4, z: 0, face: -1, anim: 'Idle_2_HeadLow' },
    { place: 'smith', x: -5.6, z: -0.4, face: 1, anim: 'Idle' },
    { place: 'jerome', x: -7.8, z: -2.6, face: 1, anim: 'Idle' },
    { hide: 'north' }, { hide: 'kaibutsu' },
    ...['robert', 'rocker', 'heuler'].map(id => ({ hide: id })),
    { mood: 'autumn_night', t: 0.1 },                                       // night, inside Gajō
    { caption: '<b>Inside Gajō</b>Night', t: 2.6, wait: false },
    { cam: [-1.0, 1.6, 6.5], look: [-3.0, 0.8, 0] },
    { say: 'north_fell' },
    // the monster comes out of the dark passage: first only its eyes in the black, then the heavy steps, then the shape
    { place: 'kaibutsu', x: 10.5, z: -0.4, face: -1, anim: 'Idle_2_HeadLow', ts: 0.6 },
    { fn: () => { boss.eyes.scale.setScalar(1.3); boss.fade(0.15); } },
    { amb: 'boss' }, { sfx: 'boss_drone' },
    { cam: [3.6, 1.2, 4.2], look: [9.0, 2.2, -0.3] },
    { cam: [4.4, 1.25, 3.8], look: [9.0, 2.2, -0.3], t: 1.6 },                       // slow push into the dark: two eyes
    { par: [
      { fn: async () => { for (let i = 0; i < 5; i++) { sfx.bossStep({}, { x: boss.root.position.x }); shake(0.12); await wait(0.5, true); } } },
      { fn: () => tween({ v: 0.15 }, { v: 1 }, 2.4, { real: true, onUpdate: e => boss.fade(0.15 + 0.85 * e) }) },
      { move: 'kaibutsu', x: 4.4, z: 0, t: 2.6, anim: 'Walk', ts: 0.7, ease: 'out', faceMove: false, after: 'Idle_2_HeadLow' },
      { cam: [1.6, 0.35, 5.0], look: [5.6, 2.2, 0], t: 2.6 },                          // low angle: it towers over them
    ] },
    { fn: () => boss.eyes.scale.setScalar(0.75) },
    { sfx: 'bossAppear' },
    // extreme close-up: the jaws open, the roar
    { fn: () => { const n = ctx.contact.mouthWorld('kaibutsu'); E.camPos.set(n.x - 0.9, n.y + 0.1, n.z + 1.2); E.camLook.copy(n); tween(E.camPos, { z: n.z + 0.9 }, 1.2, { real: true }); } },
    { anim: 'kaibutsu', name: 'Howl' }, { bark: 'roar_intro' }, { sfx: 'roar' }, { shake: 0.7 },
    { fx: 'flash', color: '#ff9060', peak: 0.2 },
    { wait: 0.8 },
    // reaction shots: Weed, Smith
    { dolly: 'weed', dist: 1.2, side: 0.6, t: 0.3 },
    { anim: 'kaibutsu', name: 'Idle_2_HeadLow' },
    // Smith steps forward; quiet close-up
    { cam: [-3.4, 0.8, 2.4], look: [-4.9, 0.7, -0.4] },
    { move: 'smith', x: -4.6, t: 1.2, anim: 'Walk', after: 'Idle' },
    { say: 'sac_cliff' },
    { dolly: 'weed', dist: 1.4, side: 0.7, t: 0.35 },
    { anim: 'weed', name: 'Bark', loop: false },
    { say: 'sac_wait' },
    // the charge – the camera runs beside him, three-legged gallop (right foreleg tucked: canon, lost saving GB)
    { fn: () => limp(cast.smith) },
    { par: [
      { move: 'smith', x: B.x - ctx.bossHalf() - 1.6, z: 0.35, t: 1.7, anim: 'Gallop', ts: 1.1, ease: 'in' },
      { track: 'smith', from: [-1.6, 0.0, 2.6], to: [-0.6, 0.15, 2.9], look: [1.2, 0.2, 0], t: 1.7, ease: 'in' },
      { fn: async () => { for (let i = 0; i < 5; i++) { sfx.gallopIn({}, { x: cast.smith.root.position.x }); await wait(0.34, true); } } },
    ] },
    { sfx: 'bark' },
    { slow: 0.4 }, { fx: 'speed', v: 0.6 },
    // the leap: anticipation (he gathers on his three legs), launch, and the jaws close on P4's shoulder
    { par: [
      { strike: 'smith', target: 'kaibutsu', point: { bone: 'spine_03', dir: [-0.15, 0.6, 0.8] }, side: 'near', wind: 0.3, t: 0.46, arc: 0.7, anim: 'Gallop_Jump', hitAt: 0.5, yaw: 0.8, roll: -0.4, maxPitch: 1.0,
        pin: true, react: 'roar', fx: 'bite', strong: true, sfx: ['bite', 'hitHeavy'], hitstop: 0.14, shake: 0.7, tug: 0.22 },
      { track: 'smith', from: [-1.4, 0.2, 3.2], to: [-0.4, 0.9, 3.6], look: [0.8, 0.5, 0], t: 1.9, ease: 'out' },
    ] },
    { slow: 1 }, { fx: 'speed', v: 0 },
    { freeze: 0.6 },
    // follow-through: a slow push onto his jaws in P4's shoulder; dust trickles from the roof of the passage
    { par: [
      { track: 'mouth:smith', from: [-1.9, 0.0, 2.8], to: [-1.3, -0.05, 2.0], look: [0.1, -0.45, 0], t: 1.6 },
      { sfx: 'growl' },
      { fn: () => { FX.dust(new THREE.Vector3(B.x - 1, 3.4, 0.5)); sfx.debris({}, { x: B.x }); } },
    ] },
    // P4 rears and thrashes its head; Smith hangs on, his body swinging; small stones rain down (foreshadowing)
    { cam: [1.2, 1.6, 6.8], look: [3.6, 1.8, 0], t: 0.35, ease: 'out' },
    { par: [
      { thrash: 'kaibutsu', t: 2.6, amp: 0.42, freq: 1.7, wait: true },
      { fn: () => tween(B, { x: 6.6 }, 2.4, { real: true, ease: 'inOut', onUpdate: () => { boss.root.position.x = B.x; } }) },
      { anim: 'kaibutsu', name: 'Walk', ts: -0.5 },
      { fn: async () => { for (let i = 0; i < 3; i++) { await wait(0.75, true); sfx.roar(); sfx.bossStep({}, { x: B.x }); FX.dust(new THREE.Vector3(B.x - 0.6, 0.1, 0.4), true); FX.debrisBurst && FX.debrisBurst(new THREE.Vector3(B.x - 1 + i, 4.5, 0.2), 4); } } },
      { cam: [3.0, 2.0, 9.4], look: [6.0, 2.0, -0.4], t: 2.4 },
    ] },
    { anim: 'kaibutsu', name: 'Idle_HitReact1', loop: false },
    { react: 'kaibutsu', kind: 'flinch', dir: 1 },
    // silence: the music drops away, time slows – Smith looks at Weed one last time
    { music: null, fade: 1.2 }, { slow: 0.5 }, { sfx: 'heartbeat' },
    { track: 'mouth:smith', from: [-1.0, 0.2, 1.7], to: [-0.75, 0.12, 1.25], look: [-0.1, -0.3, 0], t: 1.8 },
    { par: [
      { dolly: 'weed', dist: 1.5, side: 0.7, t: 1.4, ease: 'inOut' },
      { anim: 'weed', name: 'Bark', loop: false },
    ] },
    { music: 'smith', fade: 0.8 },
    { par: [
      { say: 'sac_live' },
      { track: 'mouth:smith', from: [-1.3, 0.25, 2.0], to: [-1.0, 0.2, 1.6], look: [-0.2, -0.4, 0], t: 3.0 },
    ] },
    { slow: 1 },
    // rockslide: the roof of the passage comes down on both of them
    { cam: [3.0, 3.0, 11.5], look: [6.2, 3.4, -1] },
    { thrash: 'kaibutsu', t: 2.2, amp: 0.3, freq: 2.2 },
    { fn: () => { for (let i = 0; i < 4; i++) FX.lightPillar(new THREE.Vector3(B.x - 2 + i * 1.4, 0, -0.5 + (i % 2) * 0.8), 0xd8d2c0, 3.2, 10, 0.7); } },   // moonlight through the cracking roof
    { sfx: 'rumble', arg: 3 }, { shake: 0.7 },
    { fn: async () => {
      const falling = [];
      for (let i = 0; i < 18; i++) {
        const r = makeRock(0.5 + Math.random() * 0.9);
        r.position.set(B.x - 2.6 + Math.random() * 5, 9 + Math.random() * 8, -1 + Math.random() * 2.4);
        falling.push({ r, v: -Math.random() * 3, s: (Math.random() - 0.5) * 6 }); ctx.fallingRocks.push(r);
      }
      E.cliff.children.slice(3).forEach(b => tween(b.position, { y: b.position.y - 3.5 }, 1.2, { real: true, ease: 'in' }));
      const t0 = E.realTime; E.timeScale = 0.55;
      while (E.realTime - t0 < 2.2 && !E.skipping) {
        for (const f of falling) {
          f.v -= 22 * 0.016; f.r.position.y = Math.max(0.3, f.r.position.y + f.v * 0.016);
          f.r.rotation.x += f.s * 0.016;
          if (f.r.position.y <= 0.31 && !f.landed) { f.landed = true; FX.dust(f.r.position.clone(), true); sfx.rock(); }
        }
        await wait(0.016, true);
      }
      // the pile settles over both of them
      boss.play('Death', { loop: false, timeScale: 0.6 });
      for (const f of falling) f.r.position.y = 0.3 + Math.random() * 1.6;
      E.timeScale = 1;
      const pile = [];
      for (let i = 0; i < 14; i++) {
        const r = makeRock(0.6 + Math.random() * 0.8); ctx.fallingRocks.push(r);
        r.position.set(B.x - 2.2 + Math.random() * 4.2, 6 + Math.random() * 3, -0.6 + Math.random() * 1.8); pile.push(r);
        tween(r.position, { y: 0.4 + Math.random() * 2.2 }, 0.45 + Math.random() * 0.3, { ease: 'in', real: true }).then(() => { FX.dust(r.position.clone(), true); sfx.rock(); });
      }
      await wait(0.8, true);
    } },
    { fx: 'flash', color: '#e8eeff', t: 1.2, peak: 1 },
    { fn: () => ctx.contact.releaseAll() },
    { hide: 'smith' }, { hide: 'kaibutsu' }, { shake: 0.8 },
    { wait: 1.4 },
    // silence – Weed screams
    { amb: 'sad' }, { sfx: 'heartbeat' },
    { anim: 'weed', name: 'Howl' },
    { dolly: 'weed', dist: 1.9, side: 0.5, h: 0.15, lookH: 0.6, t: 0 },
    { say: 'sac_scream' },
    { music: 'smith', fade: 2.5 },                                    // keep the theme through the aftermath
    { light: { rim: 0.6, fog: 0x2a2840, t: 2 } },
    { anim: 'weed', name: 'Idle_2_HeadLow' },
    { fx: 'spirit', at: [6.6, 1.6, 0.6], t: 6 },
    { cam: [4.2, 1.6, 7.5], look: [6.5, 2.8, 0], t: 3.2 },
    { sfx: 'memory' }, { caption: 'Smith', t: 2.6 },
    // the next morning they mourn him – and the monster rises from the rubble
    { caption: '<b>The next morning</b>', t: 2.4, wait: false },
    { mood: 'storm', t: 3 },                                                  // cold gold morning, red threat
    // the mourning: a quiet wide on the rock pile in the cold morning light, then the ground trembles
    { cam: [2.0, 1.0, 8.5], look: [6.5, 1.0, 0] },
    { cam: [2.6, 0.9, 7.6], look: [6.5, 1.0, 0], t: 2.2 },
    { sfx: 'rumble', arg: 1.5 }, { shake: 0.5 }, { sfx: 'strain' },
    { fn: () => { FX.dust(new THREE.Vector3(6.5, 0.4, 0), true); FX.debrisBurst && FX.debrisBurst(new THREE.Vector3(6.5, 0.6, 0.2), 6); } },
    { wait: 0.9 },
    // it rises from under the rocks – low camera, rocks thrown aside
    { cam: [3.6, 0.25, 4.4], look: [6.4, 1.8, 0] },
    { fn: () => {
      boss.root.visible = true; boss.fade(1); B.x = 6.5; boss.root.position.set(6.5, -2, 0); boss.face(-1, true);
      boss.play('Howl'); boss.eyes.material.color.set(0xff3010); boss.eyes.scale.setScalar(0.75);
      tween(boss.root.position, { y: 0 }, 0.6, { ease: 'out', real: true });
      for (const r of ctx.fallingRocks) {
        const dx = r.position.x - 6.5;
        tween(r.position, { x: r.position.x + dx * 3, y: r.position.y + 2 + Math.random() * 3, z: r.position.z + 2 }, 0.6, { real: true, ease: 'out' })
          .then(() => tween(r.scale, { x: 0.01, y: 0.01, z: 0.01 }, 0.6, { real: true }));
      }
    } },
    { bark: 'roar_rise' }, { sfx: 'roar' }, { sfx: 'debris' }, { shake: 0.9 }, { fx: 'flash', color: '#ff8050', t: 0.3, peak: 0.25 },
    { fx: 'dust', at: [6.5, 0.5, 0], big: true },
    { cam: [3.0, 0.3, 4.8], look: [6.2, 2.2, 0], t: 1.3 },
    // its eye opens in close-up – then it speaks
    { anim: 'kaibutsu', name: 'Idle' },
    { fn: () => { const h = boss.bones.head.getWorldPosition(new THREE.Vector3()), n = ctx.contact.mouthWorld('kaibutsu'); const eye = h.lerp(n, 0.45).add(new THREE.Vector3(0, 0.12, 0.2)); E.camPos.set(eye.x + 0.15, eye.y + 0.05, eye.z + 1.1); E.camLook.copy(eye); tween(E.camPos, { z: eye.z + 0.9 }, 1.0, { real: true }); } },
    { wait: 0.7 },
    { par: [{ say: 'speak' }, { cam: [3.2, 1.2, 4.6], look: [6.0, 2.4, 0], t: 3.0 }] },
    { expr: 'jerome', name: 'sad' },
    { par: [{ say: 'p4_answer' }, { track: 'jerome', from: [1.3, 0.3, 1.4], to: [0.95, 0.28, 1.05], look: [0.3, 0.25, 0], t: 3.0 }] },
    { expr: 'jerome', name: null },
    { par: [{ say: 'sac_rises' }, { cam: [1.0, 1.0, 6.0], look: [4.0, 1.4, 0], t: 3.0 }] },
    { dolly: 'weed', dist: 1.2, side: -0.5, t: 0.6 },
    { say: 'sac_nod' },
    { fn: () => ctx.restoreLight && ctx.restoreLight() },
    { music: 'battle' }, { amb: 'boss' },
    { cam: GAME_CAM.cam, look: GAME_CAM.look, t: 1.0 },
  ];
};

// ------------------------------------------------------------------------------------------------
// FOUR ARROWS: Robert, Rocker, Heuler strike the wound one after another; Jerome is the fourth.
export const arrows = (ctx) => {
  const { cast, S, E, FX, sfx } = ctx;
  const boss = cast.kaibutsu, B = S.B, half = ctx.bossHalf();
  const fallen = [];
  const steps = [
    { fn: () => { B.x = 3.4; S.W.x = -1.5; } },
    { place: 'kaibutsu', x: 3.4, z: 0, face: -1, anim: 'Idle_2_HeadLow' },
    { place: 'weed', x: -1.2, z: -1.5, face: 1, anim: 'Idle' },
    { place: 'jerome', x: -3.8, z: 0, face: 1, anim: 'Idle' },
    ...MEN.map((id, i) => ({ place: id, x: -12 - i * 1.5, z: -0.8 + i * 0.8, face: 1, anim: 'Gallop', ts: 1.2 })),
    { music: 'sad', fade: 2 }, { amb: 'sad' },
    { light: { rim: 1.2, fog: 0x30304a, t: 1.5 } },
    { cam: [-5.2, 1.3, 5.6], look: [-5.6, 0.8, 0] },
    { par: MEN.map((id, i) => ({ move: id, x: -6.4 + i * 0.95, t: 1.4 + i * 0.15, anim: 'Gallop', ts: 1.2, after: 'Idle', ease: 'out' })) },
    { caption: '<b>FOUR ARROWS</b>', t: 2.4, wait: false },
    { wait: 1.6 },
    { expr: 'jerome', name: 'sad' },
    // the order: the camera keeps moving – Jerome's face, a low wide of the three, back to his eyes
    { par: [
      { say: 'arrows_order' },
      { fn: async () => {
        await ctx.runSteps([{ track: 'jerome', from: [1.2, 0.35, 1.3], to: [0.9, 0.3, 1.0], look: [0.3, 0.3, 0], t: 1.2 }]);
        await ctx.runSteps([{ cam: [-5.4, 0.35, 3.2], look: [-5.0, 0.8, -0.4] }, { cam: [-4.6, 0.4, 3.0], look: [-5.0, 0.8, -0.4], t: 1.0 }]);
        await ctx.runSteps([{ track: 'jerome', from: [0.75, 0.32, 0.8], to: [0.6, 0.3, 0.65], look: [0.35, 0.3, 0], t: 1.2 }]);
      } },
    ] },
    { expr: 'jerome', name: 'determined' }, { expr: 'robert', name: 'determined' }, { expr: 'rocker', name: 'determined' },
    { par: [{ say: 'arrows_ack' }, { track: 'robert', from: [1.3, 0.3, 1.5], to: [1.0, 0.25, 1.2], look: [0.2, 0.25, 0], t: 1.6 }] },
    { expr: 'heuler', name: 'happy' },
    { par: [{ say: 'arrows_together' }, { track: 'heuler', from: [-1.4, 0.25, 1.4], to: [-1.1, 0.25, 1.1], look: [0.2, 0.25, 0], t: 1.6 }] },
    { expr: 'heuler', name: 'determined' },
    { fn: () => { boss.weakReveal = 1; } },
  ];
  // Each arrow: gallop in the near lane, leap, jaws close on the bare skin of the LEFT CHEST (real contact),
  // P4 roars and flinches, then rears and flings the dog away; he crashes down and falls.
  const ARROW = [
    { pin: 0.55, land: [B.x - half + 0.3, 0.6], arc: 1.5, t: 0.75, cam: 'side', depth: 0.3, cry: 0.95, counter: 'headbite' },    // Robert opens the wound (surface)
    { pin: 0.8, land: [B.x - half - 0.9, 2.3], arc: 0.6, t: 0.45, cam: 'low', depth: 0.6, cry: 1.1, counter: 'rearup' },   // Rocker drives deeper – slammed down
    { pin: 1.2, land: [-2.4, 2.6], arc: 1.8, t: 0.85, cam: 'side', depth: 0.9, cry: 0.85, counter: 'fallback' },     // Heuler pushes his muzzle deep into the wound
  ];
  const dmg = (n) => () => { B.hp = Math.max(9, B.hp - n); };
  MEN.forEach((id, i) => {
    const m = cast[id], A = ARROW[i];   // i: 0..2 -> arrow_bite_1..3 (shallow -> deep)
    steps.push(
      { fn: () => { m.root.position.z = 0.9; m.root.position.y = 0; m.face(1, true); } },
      // a breath before he goes: slow push onto his face
      { track: id, from: [1.3, 0.25, 1.4], to: [1.0, 0.2, 1.1], look: [0.2, 0.25, 0], t: 1.1 },
      // the run: the camera runs with him
      { fx: 'speed', v: 1 },
      { bark: 'arrows_cry_' + id }, { sfx: 'rushWhoosh' },               // battle cry as he breaks into the charge
      { par: [
        { move: id, x: B.x - half - 2.0, z: 1.0, t: 0.75, anim: 'Gallop', ts: 1.4, ease: 'in' },
        { track: id, from: [-1.2, 0.1, 2.8], to: [-0.4, 0.3, 3.2], look: [1.0, 0.3, 0], t: 0.75, ease: 'in' },
        { sfx: 'gallopIn' },
      ] },
      { slow: 0.3 }, { fx: 'speed', v: 1 },
      // anticipation -> leap (battle cry) -> jaws in the bare skin of the LEFT CHEST, each one deeper than the last
      { par: [
        { strike: id, target: 'kaibutsu', point: 'chest_weak', side: 'near', wind: 0.25, t: 0.34, arc: 0.45, anim: 'Gallop_Jump', hitAt: 0.5,
          depth: A.depth, grunt: ['breath'], tug: 0.12 + 0.25 * A.depth, fleshSfx: false,
          pin: true, react: 'roar', fx: 'crit', strong: true, sfx: ['arrow_bite_' + (i + 1)], hitstop: 0.1 + 0.08 * A.depth, shake: 0.4 + 0.5 * A.depth, onHit: dmg(4) },
        A.cam === 'low' ? { cam: [B.x - half - 3.2, 0.5, 4.2], look: [B.x - half * 0.6, 1.5, 0.6], t: 1.6, ease: 'out' }
          : { cam: [B.x - half - 1.2, 1.2, 4.6], look: [B.x - half * 0.7, 1.3, 0.6], t: 1.6, ease: 'out' },
      ] },
      ...(A.counter !== 'fallback' ? [{ bark: 'arrows_pain_' + id }] : []),   // cry of pain as P4 bucks under his teeth
      { freeze: 0.4 },
      { slow: 1 }, { fx: 'speed', v: 0 },
      // extreme close-up: the teeth sunk in the wound, then P4's eye
      { track: 'mouth:' + id, from: [-0.75, 0.12, 0.95], to: [-0.6, 0.08, 0.8], look: [0.05, -0.05, 0], t: 0.7 },
      { fn: () => { const h = boss.bones.head.getWorldPosition(new THREE.Vector3()), n = ctx.contact.mouthWorld('kaibutsu'); const eye = h.lerp(n, 0.45).add(new THREE.Vector3(0, 0.12, 0.2)); E.camPos.set(eye.x + 0.15, eye.y + 0.05, eye.z + 1.05); E.camLook.copy(eye); tween(E.camPos, { z: eye.z + 0.85 }, 0.6, { real: true }); } },   // P4's eye
      { sfx: 'roar' }, { shake: 0.3 + 0.4 * A.depth },
      { wait: 0.5 },
      // follow-through: his jaws stay in the wound while P4 roars
      { par: [
        { track: 'mouth:' + id, from: [-2.1, 0.3, 2.9], to: [-1.6, 0.2, 2.3], look: [0.1, -0.3, 0], t: 0.6 + A.pin },
        { sfx: 'bite_growl' },
      ] },
      // P4's counter (canon: Robert's head is bitten; Rocker – the force throws P4 up on its hind legs;
      // Heuler – torn off by force as P4 crashes onto its back). Each one falls and does not get up.
      ...(A.counter === 'headbite' ? [
        { thrash: 'kaibutsu', t: 0.5, amp: 0.35, freq: 2.4 },
        { release: id, mode: 'throw', to: A.land, arc: 0.5, t: 0.4, land: 'Idle_HitReact2' },
        { cam: [A.land[0] - 1.4, 1.2, A.land[1] + 3.6], look: [A.land[0] + 0.6, 0.9, A.land[1] - 0.4], t: 0.3, ease: 'out' },
        { reach: 'kaibutsu', target: id, point: 'head', side: 'near', t: 0.3, hold: 0.7, back: 0.45, fx: 'bite', strong: true, sfx: ['bite', 'hitHeavy'], react: 'hurt', shake: 0.6 },
        { sfx: 'yelp' },
        { thrash: 'kaibutsu', t: 0.45, amp: 0.4, freq: 2.4 },
        { release: id, mode: 'throw', to: [-0.9, 1.9], arc: 1.3, t: 0.7, land: 'Death', spin: 1 },   // flung aside, he does not get up
      ] : A.counter === 'rearup' ? [
        { cam: [B.x - half - 2.4, 0.4, 5.2], look: [B.x - half * 0.5, 2.0, 0.5], t: 0.25, ease: 'out' },
        { motion: 'kaibutsu', kind: 'rearup', angle: 1.05, releaseAt: 'apex', release: { who: id, mode: 'throw', to: A.land, arc: A.arc, t: A.t, land: 'Death', spin: 1 } },
      ] : [
        { bark: 'arrows_pain_' + id },                                  // Heuler's long cry while P4 tears him loose
        { thrash: 'kaibutsu', t: 0.8, amp: 0.45, freq: 2.6 },
        { cam: [B.x - half - 1.0, 0.35, 5.6], look: [B.x - half * 0.3, 1.0, 0.4], t: 0.3, ease: 'out' },
        { motion: 'kaibutsu', kind: 'fallback', side: -1, releaseAt: 'start', wait: false, release: { who: id, mode: 'throw', to: A.land, arc: A.arc, t: A.t, land: 'Death', spin: 1 } },
        { wait: 3.3 },
      ]),
      { cam: [A.land[0] - 1.6, 1.4, A.land[1] + 4.2], look: [(A.land[0] + B.x - half) / 2, 0.9, 1.2], t: 0.5, ease: 'out' },
      { fn: () => { fallen.push(m.root.position.clone()); FX.dust(m.root.position.clone().setY(0.1), true); } },
      { sfx: 'whimper' },
      { anim: 'kaibutsu', name: 'Idle_2_HeadLow', ts: 0.8 },
      // the death is shown: time slows, silence, his eye, a faint spirit light beside him
      { slow: 0.5 }, { sfx: 'strain' },
      { track: id, from: [0.7, 0.3, 0.75], to: [0.55, 0.26, 0.6], look: [0.3, 0.25, 0], t: 1.0 },
      { fn: () => { FX.spiritGhost(m, 0xcfe4ff, 3); FX.burst(m.root.position.clone().add(new THREE.Vector3(0, 0.5, 0.3)), { color: 0xcfe4ff, count: 10, speed: 1.2, size: 0.18, gravity: 1.5 }); } },   // soft spirit, no white-out
      { slow: 1 },
      // the camera comes to rest on him; his last words
      { par: [
        { track: id, from: [1.5, 0.35, 2.2], to: [1.0, 0.25, 1.5], look: [0, -0.25, 0], t: 3.0 },
        { say: 'arrows_fall_' + id },
      ] },
      { dolly: 'jerome', dist: 1.5, side: 0.6, t: 0.8 },
      { wait: 0.4 },
    );
  });
  steps.push(
    // Jerome – the fourth arrow. P4 sees it coming and leaps aside: his jaws snap shut on empty air.
    { cam: [-1.2, 0.9, 3.0], look: [-3.6, 0.9, 0] },
    { anim: 'jerome', name: 'Howl' },
    { say: 'arrows_fourth' },
    { fn: () => { cast.jerome.root.position.z = 0.9; } },
    { music: 'battle', fade: 0.5 },
    { par: [
      { move: 'jerome', x: B.x - half - 2.0, z: 1.0, t: 0.6, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { track: 'jerome', from: [-1.2, 0.1, 2.8], to: [-0.4, 0.3, 3.2], look: [1.0, 0.3, 0], t: 0.6, ease: 'in' },
      { sfx: 'gallopIn' },
    ] },
    { cam: [B.x - half - 2.6, 0.5, 4.4], look: [B.x - half * 0.5, 1.4, 0.4] },
    { slow: 0.25 }, { fx: 'speed', v: 1 },
    { par: [
      { strike: 'jerome', target: 'kaibutsu', point: 'chest_weak', side: 'near', wind: 0.2, t: 0.34, arc: 0.5, anim: 'Gallop_Jump', hitAt: 0.5, whiff: true, wait: 'end' },
      { fn: async () => {
        await wait(0.28);
        boss.play('Gallop_Jump', { loop: false, timeScale: 1.3 }); sfx.whoosh();
        const x0 = B.x, z0 = boss.root.position.z;
        await tween({ k: 0 }, { k: 1 }, 0.3, { ease: 'out', onUpdate: k => { B.x = x0 + 2.0 * k; boss.root.position.set(B.x, Math.sin(k * Math.PI) * 0.9, z0 - 0.9 * k); } });
        boss.root.position.y = 0; FX.dust(new THREE.Vector3(B.x, 0.1, boss.root.position.z), true); sfx.bossLand({}, { x: B.x });
      } },
    ] },
    { slow: 1 }, { fx: 'speed', v: 0 },
    { shake: 0.4 },
    { anim: 'kaibutsu', name: 'Idle', ts: 0.8 },
    { anim: 'jerome', name: 'Idle_HitReact1', loop: false },
    { wait: 0.4 },
    { anim: 'jerome', name: 'Gallop_Jump', loop: false },
    { move: 'jerome', x: B.x - half - 3.4, y: 0, z: 0.6, t: 0.5, ease: 'out', faceMove: false, after: 'Idle' },
    { fn: () => { boss.root.position.z = 0; } },
    { wait: 0.6 },
    // quiet moment – the spirits of the three rise
    { face: 'jerome', dir: -1 },
    { cam: [-1.0, 0.75, 3.2], look: [-0.9, 0.45, -1.4] },
    { anim: 'jerome', name: 'Idle_2_HeadLow' },
    { expr: 'jerome', name: 'sad' },
    { say: 'arrows_thanks' },
    { fn: async () => {
      MEN.forEach((id, k) => setTimeout(() => { FX.spiritGhost(cast[id], 0xcfe4ff, 4); FX.burst(fallen[k] ? fallen[k].clone().add(new THREE.Vector3(0, 0.6, 0)) : cast[id].root.position.clone(), { color: 0xdfeeff, count: 12, speed: 1.4, size: 0.2, gravity: 1.8 }); }, k * 350));   // the three rise as soft silhouettes (the deaths stay visible)
      sfx.spirit();
      await Promise.all(MEN.map(id => tween({ v: 1 }, { v: 0 }, 2.6, { real: true, onUpdate: e => cast[id].fade(1 - e) })));
      MEN.forEach(id => { cast[id].root.visible = false; });
    } },
    { face: 'jerome', dir: 1 }, { anim: 'jerome', name: 'Idle' },
    { cam: [-2.2, 1.1, 4.4], look: [-1.0, 0.9, 0] },
    { expr: 'jerome', name: 'angry' },
    { say: 'arrows_now' },
    ...['jerome', 'robert', 'rocker', 'heuler'].map(id => ({ expr: id, name: null })),
    { fn: () => ctx.restoreLight && ctx.restoreLight() },
    { music: 'battle' }, { amb: 'boss' },
    { cam: GAME_CAM.cam, look: GAME_CAM.look, t: 0.8 },
  );
  return steps;
};

// ------------------------------------------------------------------------------------------------
// THE LOCK (canon): Weed, Ken and Kagetora pin P4 down, Jerome bites the artery and digs toward the heart;
// P4 bites Kagetora and tears Jerome loose. The monster is left staggering -> Battōga.
export const lock = (ctx) => {
  const { cast, S, FX, sfx, E } = ctx;
  const boss = cast.kaibutsu, B = S.B, half = ctx.bossHalf(), H = boss.height;
  let strain = null;
  return [
    { fn: () => { B.x = 3.4; for (const id of ['weed', 'ken', 'kagetora', 'jerome']) cast[id].root.position.y = 0; } },
    { place: 'kaibutsu', x: 3.4, z: 0, face: -1, anim: 'Idle_HitReact1', loop: false },
    { place: 'weed', x: -1.8, z: 1.7, face: 1, anim: 'Gallop', ts: 1.4 },
    { place: 'ken', x: -2.8, z: 2.3, face: 1, anim: 'Gallop', ts: 1.4 },
    { place: 'kagetora', x: -2.4, z: -0.6, face: 1, anim: 'Gallop', ts: 1.4 },
    { place: 'jerome', x: -5.0, z: 1.0, face: 1, anim: 'Idle' },
    { music: 'battle' },
    { cam: [-0.6, 0.9, 6.2], look: [2.4, 1.2, 0.4] },
    { bark: 'lock_call' },
    { wait: 0.6 },
    { bark: 'lock_shout_weed' }, { fx: 'speed', v: 1 }, { sfx: 'rushWhoosh' },
    // three of them lock the monster down: Kagetora hangs from its throat (far side), Weed hangs off its flank,
    // Ken clamps its haunch from behind-side. Each bite is a real contact; P4's legs stop.
    { par: [
      { depth: 0.45, cry: ['battleCry', 'bark'], cryRate: 1, grunt: ['breath'], strike: 'kagetora', target: 'kaibutsu', point: 'throat', side: 'far', wind: 0.2, t: 0.75, arc: 0.5, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], tug: 0.25, maxPitch: 1.1 },
      { depth: 0.45, cry: ['battleCry', 'bark'], cryRate: 1, grunt: ['breath'], strike: 'weed', target: 'kaibutsu', point: { bone: 'spine_02', dir: [-0.4, 0.2, 1], name: 'flank' }, side: 'near', wind: 0.25, t: 0.85, arc: 0.6, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], yaw: 0.7, maxPitch: 1.0, tug: 0.2 },
      { depth: 0.45, cry: ['battleCry', 'bark'], cryRate: 1, grunt: ['breath'], strike: 'ken', target: 'kaibutsu', point: 'hip', side: 'near', wind: 0.3, t: 1.0, arc: 0.3, anim: 'Gallop', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite', 'hit'], tug: 0.25, yaw: 1.0 },
      { cam: [0.6, 1.4, 7.4], look: [3.0, 1.2, 0.3], t: 1.0, ease: 'out' },
    ] },
    { fx: 'speed', v: 0 },
    { sfx: 'roar' }, { shake: 0.6 },
    // extreme close-ups: Weed's fangs in the flank, Ken's in the haunch
    { track: 'mouth:weed', from: [-0.6, 0.1, 0.8], to: [-0.5, 0.08, 0.65], look: [0.05, -0.05, 0], t: 0.6 },
    { track: 'mouth:ken', from: [-0.8, 0.15, 1.0], to: [-0.65, 0.1, 0.85], look: [0.05, -0.05, 0], t: 0.6 },
    // P4 strains against them: legs locked, body shudders
    { fn: () => {
      boss.play('Idle', { timeScale: 0.4 });   // head stays up (the three hang from it)
      let t = 0;
      strain = boss.overlay((d, dt) => { t += dt; const sp = d.bones.spine_02; if (sp) ctx.contact.rotBoneWorld(sp, new THREE.Vector3(1, 0, 0), Math.sin(t * 31) * 0.025); });
    } },
    { thrash: 'kaibutsu', t: 1.2, amp: 0.18, freq: 3.2 },
    { freeze: 0.45 },
    // Jerome goes for the artery in the bare left chest
    { par: [
      { move: 'jerome', x: B.x - half - 2.1, z: 1.1, t: 0.7, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { track: 'jerome', from: [-1.3, 0.1, 2.8], to: [-0.5, 0.35, 3.3], look: [1.1, 0.3, 0], t: 0.7, ease: 'in' },
      { sfx: 'gallopIn' },
    ] },
    { cam: [B.x - half - 2.6, 0.7, 4.2], look: [B.x - half * 0.55, H * 0.42, 0.5], t: 0.6, ease: 'out' },
    { slow: 0.4 },
    { fx: 'speed', v: 1 }, { sfx: 'rushWhoosh' },
    { strike: 'jerome', target: 'kaibutsu', point: 'chest_weak', side: 'near', depth: 0.9, grunt: ['breath'], fleshSfx: false, wind: 0.25, t: 0.34, arc: 0.4, anim: 'Gallop_Jump', hitAt: 0.5,
      pin: true, react: 'roar', fx: 'crit', strong: true, sfx: ['arrow_bite_3'], hitstop: 0.14, shake: 0.7, tug: 0.3,
      onHit: () => { boss.weakReveal = 1; } },
    { slow: 1 }, { fx: 'speed', v: 0 },
    { freeze: 0.35 },
    { fn: () => { const h = boss.bones.head.getWorldPosition(new THREE.Vector3()), n = ctx.contact.mouthWorld('kaibutsu'); const eye = h.lerp(n, 0.45).add(new THREE.Vector3(0, 0.12, 0.2)); E.camPos.set(eye.x + 0.15, eye.y + 0.05, eye.z + 1.05); E.camLook.copy(eye); tween(E.camPos, { z: eye.z + 0.85 }, 0.6, { real: true }); } },   // P4's eye
    { sfx: 'roarPain' }, { wait: 0.5 },
    { fn: () => { const n = ctx.contact.mouthWorld('jerome'); E.camPos.set(n.x - 1.4, n.y + 0.1, n.z + 1.9); E.camLook.set(n.x, n.y - 0.2, n.z); } },
    { expr: 'jerome', name: 'angry' },
    { thrash: 'kaibutsu', t: 1.2, amp: 0.12, freq: 3.6 },
    { say: 'lock_artery' },
    // P4 bends its head down and bites Kagetora's neck, flings him, then tears Jerome loose
    { cam: [0.2, 1.3, 6.4], look: [2.4, 1.1, 0.2], t: 0.3, ease: 'out' },
    { fn: () => { if (strain) strain(); strain = null; } },
    { fn: () => setTimeout(() => ctx.say && ctx.say('lock_pain_kage', { noWait: true }), 380) },
    { reach: 'kaibutsu', target: 'kagetora', point: 'neck', side: 'near', t: 0.35, hold: 0.55, back: 0.4, fx: 'impact', strong: true, sfx: ['bite', 'hitHeavy'], react: 'hurt', shake: 0.6 },
    { sfx: 'hurt' },
    { release: 'kagetora', mode: 'throw', to: [B.x - half - 1.6, -1.6], arc: 0.9, t: 0.6, land: 'Idle_HitReact2', after: 'Idle_2_HeadLow' },
    { dolly: 'kagetora', dist: 1.6, side: 0.6, t: 0.3 },
    { say: 'lock_hurt' },
    { cam: [0.5, 1.6, 8.5], look: [2.0, 1.2, 0], t: 0.3 },
    { sfx: 'roar' }, { shake: 0.8 },
    { thrash: 'kaibutsu', t: 0.9, amp: 0.5, freq: 2.0 },
    { par: [
      { release: 'jerome', mode: 'throw', to: [-3.0, 0.6], arc: 1.3, t: 0.75, land: 'Idle_HitReact2', after: 'Idle' },
      { release: 'weed', mode: 'throw', to: [-0.6, 1.9], arc: 1.0, t: 0.6, land: 'Jump_ToIdle', after: 'Idle' },
      { release: 'ken', mode: 'throw', to: [6.4, 1.6], arc: 0.8, t: 0.6, land: 'Jump_ToIdle', after: 'Idle' },
    ] },
    { fx: 'dust', at: [2, 0.1, 0], big: true }, { expr: 'jerome', name: null },
    { fn: () => { B.hp = 8; } },
    { anim: 'kaibutsu', name: 'Idle_2_HeadLow', ts: 0.6 },
    { say: 'arrows_now' },
    { cam: GAME_CAM.cam, look: GAME_CAM.look, t: 0.8 },
  ];
};

// ------------------------------------------------------------------------------------------------
// FINALE: Battōga in slow motion, orbiting camera.
export const finale = (ctx) => {
  const { cast, S, E, FX, sfx } = ctx;
  const boss = cast.kaibutsu, w = cast.weed, B = S.B, W = S.W;
  return [
    { fn: () => { B.x = 3.4; W.x = -1.6; W.y = 0; } },
    { place: 'kaibutsu', x: 3.4, z: 0, face: -1, anim: 'Idle_2_HeadLow', ts: 0.5 },
    { place: 'weed', x: -1.6, z: 0, face: 1, anim: 'Jump_ToIdle', loop: false },
    { music: null, fade: 0.4 },
    { dolly: 'weed', dist: 1.3, side: 0.5, h: 0.05, t: 0.3 },
    { say: 'finale_cry' },

    { sfx: 'battoga' }, { fx: 'speed', v: 1 },
    { caption: '<b>BATTŌGA</b>', t: 2.0, wait: false },
    { slow: 0.18 },
    // the spinning fang: Weed corkscrews in and his jaws close on the bare skin of the left chest (real contact, held)
    { par: [
      { strike: 'weed', target: 'kaibutsu', point: 'chest_weak', side: 'near', depth: 1.0, grunt: ['breath'], wind: 0.12, t: 0.46, arc: 0.9, anim: 'Battoga', ts: 2.2, hitAt: 0.45,
        pin: true, react: 'stagger', reactOpts: { push: 0.25, onMove: x => { B.x = x; } }, fx: 'crit', strong: true, sfx: ['boom', 'bite'], hitstop: 0, shake: 1.0, tug: 0.3, maxPitch: 1.0,
        onHit: (hp) => {
          FX.flash('#ffffff', 1.4, 1);
          FX.burst(hp, { color: 0xffffff, count: 60, speed: 10, life: 1 }); FX.ring(hp, 0xbfe4ff, 8, 0.8);
          boss.weakReveal = 1;
        } },
      { fn: async () => {
        const arcs = setInterval(() => FX.slashArc(w.root.position.clone().add(new THREE.Vector3(0, w.height * 0.5, 0.2)), 0x9fd0ff, 0.9, 0.4, Math.random() * 6), E.lowFx ? 360 : 180);
        FX.vortex(w.root, 1, w.height * 1.1, 2.2, false);
        const orbit = { a: -1.1 }; const p0 = new THREE.Vector3();
        await tween(orbit, { a: -0.25 }, 2.4, { real: true, ease: 'inOut', onUpdate: () => {
          p0.copy(w.root.position).lerp(boss.weak.getWorldPosition(new THREE.Vector3()), 0.5);
          E.camPos.set(p0.x + Math.sin(orbit.a) * 4.3, p0.y + 0.5, p0.z + Math.cos(orbit.a) * 4.3);
          E.camLook.set(p0.x, p0.y + 0.2, p0.z);
        } });
        clearInterval(arcs);
      } },
    ] },
    { shake: 1.0 }, { freeze: 0.9 },
    { slow: 1 }, { fx: 'speed', v: 0 },
    { fn: () => { const n = ctx.contact.mouthWorld('weed'); E.camPos.set(n.x - 1.6, n.y + 0.2, n.z + 2.4); E.camLook.set(n.x + 0.3, n.y - 0.1, n.z); } },
    { sfx: 'roarPain' }, { thrash: 'kaibutsu', t: 0.9, amp: 0.3, freq: 2.4 },
    { wait: 0.4 },
    { fn: () => { const h = boss.bones.head.getWorldPosition(new THREE.Vector3()), n = ctx.contact.mouthWorld('kaibutsu'); const eye = h.lerp(n, 0.45).add(new THREE.Vector3(0, 0.12, 0.2)); E.camPos.set(eye.x + 0.15, eye.y + 0.05, eye.z + 1.05); E.camLook.copy(eye); tween(E.camPos, { z: eye.z + 0.85 }, 0.8, { real: true }); } },   // P4's eye dims
    { wait: 0.8 },
  ];
};

// ------------------------------------------------------------------------------------------------
// POST-BATTLE (canon-based): the fall, the rising wind, Jerome saved from the river, the helicopter, graves at dusk, hope.
export const post = (ctx) => {
  const { cast, S, E, FX, sfx } = ctx;
  const boss = cast.kaibutsu, w = cast.weed, B = S.B, W = S.W;
  const set = {};                        // scene-local props (gorge, river, helicopter, graves) – removed by the scene itself
  return [
    From(['post_fall', 'post_river', 'post_jerome', 'post_heli', 'post_graves', 'post_spirits']),
    // the monster staggers to the edge with Weed's fangs in its flank; Ken & Kagetora grab on
    { anim: 'kaibutsu', name: 'Idle_HitReact2', loop: false },
    // (Weed's fangs are still in its chest from the Battōga – the pin carries over from the finale)
    { fn: () => { if (!ctx.contact.pins.weed) ctx.contact.strike({ who: 'weed', target: 'kaibutsu', point: 'chest_weak', t: 0.05, pin: true, fx: 'none', sfx: [], react: 'none', maxPitch: 1.0 }); } },
    { place: 'ken', x: -2, z: 0.8, face: 1, anim: 'Gallop', ts: 1.4 },
    { place: 'kagetora', x: -2.8, z: -0.6, face: 1, anim: 'Gallop', ts: 1.4 },
    { cam: [2.0, 1.6, 7.5], look: [5.5, 1.6, 0] },
    { par: [
      { fn: () => tween(B, { x: 8.8 }, 2.0, { real: true, ease: 'inOut', onUpdate: () => { boss.root.position.x = B.x; } }) },
      { anim: 'kaibutsu', name: 'Walk', ts: 0.5 },
      { move: 'ken', x: 6.0, z: 2.5, t: 1.6, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { move: 'kagetora', x: 5.2, z: 1.3, t: 1.7, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { cam: [5.0, 1.8, 7.0], look: [8.6, 1.6, 0], t: 2.0 },
    ] },
    { bark: 'fall_hold' },
    { par: [
      { strike: 'ken', target: 'kaibutsu', point: 'hip', side: 'near', t: 0.35, arc: 0.3, hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], yaw: 1.0 },
      { strike: 'kagetora', target: 'kaibutsu', point: 'flank', side: 'near', t: 0.4, arc: 0.5, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'none', fx: 'impact', sfx: ['bite'], maxPitch: 1.0 },
    ] },
    { say: 'fall_with' },
    Drift({ push: 0.03, truck: 0.02 }),
    // ---- THE FALL (procedural gorge under the arena edge; src/shared/gorge.js) ----
    // 1. at the lip: the monster tips over with the three still biting; low angle against the sky
    { cam: [6.2, 0.5, 4.6], look: [10.5, 1.8, -0.4], t: 0.3 },
    Mood('finale', 1.2),                                                 // the rising wind: leaves fly UP out of the gorge
    { fn: async () => {
      boss.play('Death', { loop: false, timeScale: 0.5 });
      const all = [boss, w, cast.ken, cast.kagetora];
      const p0 = boss.root.position.clone();
      await tween({ k: 0 }, { k: 1 }, 1.0, { real: true, ease: 'in', onUpdate: k => { boss.root.position.set(p0.x + k * 2.2, p0.y + Math.sin(k * Math.PI) * 0.5 - k * k * 1.2, p0.z); } });
      ctx.contact.releaseAll(false);   // fangs let go mid-air (no snapping back onto the ground)
      all.forEach(d => { d.fade(1); });
    } },
    { music: null, fade: 0.6 }, { amb: 'gorge' }, { sfx: 'whoosh' },
    { fn: () => { set.gorge = GZ.fallSet({ x: 12, y0: -2, depth: 46 }); E.scene.add(set.gorge); } },
    Mark('post_fall'),
    // 2. INSIDE THE GORGE: falling past the waterfall; the camera falls with them (speed lines, slow motion)
    { fn: () => {
      boss.root.position.set(12, -4, 0.4); boss.face(-1, true); boss.play('Death', { loop: false, timeScale: 0.3 });
      cast.ken.root.position.set(11.0, -3.2, 1.3); cast.ken.play('Gallop_Jump', { loop: false });
      cast.kagetora.root.position.set(12.8, -3.0, 1.2); cast.kagetora.play('Gallop_Jump', { loop: false });
      w.root.position.set(11.6, -2.6, 1.6); w.play('Gallop_Jump', { loop: false });
      for (const d of [boss, cast.ken, cast.kagetora, w]) d.root.visible = true;
    } },
    { cam: [3.6, -1.2, 4.4], look: [12.0, -3.4, 0.3] },
    { slow: 0.45 }, { fx: 'speed', v: 0.7 },
    { par: [
      { fn: () => tween({ k: 0 }, { k: 1 }, 2.6, { ease: 'in', onUpdate: k => {
        boss.root.position.y = -4 - k * 26; cast.ken.root.position.y = -3.2 - k * 24.5; cast.kagetora.root.position.y = -3.0 - k * 25;
        boss.spin.rotation.z = k * 0.9; cast.ken.spin.rotation.z = -k * 1.4; cast.kagetora.spin.rotation.z = k * 1.8;
        // the wind tears Weed loose: he is lifted while they drop
        w.root.position.y = -2.6 - Math.sin(Math.min(1, k * 2.2) * Math.PI * 0.5) * 2.2 + Math.max(0, k - 0.45) * 9; w.spin.rotation.z = k * 6;
        // the camera falls with them (a little slower: they pull away into the mist), waterfall behind
        const by = boss.root.position.y;
        E.camPos.set(3.6 - k * 0.6, by + 2.8 + k * 1.6, 4.4); E.camLook.set(12.0, by + 0.6 + k * 0.6, 0.3);
      } }) },
      { say: 'fall_wind' },
    ] },
    { fx: 'speed', v: 0 }, { slow: 1 },
    // 3. back at the lip: the wind throws Weed onto the edge; he scrambles and looks down
    { fn: () => { for (const d of [boss, cast.ken, cast.kagetora]) { d.root.visible = false; d.spin.rotation.z = 0; } w.spin.rotation.set(0, 0, 0); w.root.position.set(9.6, 1.4, 0.3); w.face(-1, true); w.play('Gallop_Jump', { loop: false }); } },
    { cam: [6.0, 0.7, 3.4], look: [8.6, 0.6, 0.2] },
    { move: 'weed', x: 8.4, y: 0, z: 0.3, t: 0.35, ease: 'in', faceMove: false },
    { sfx: 'land' }, { sfx: 'claw' }, { fx: 'dust', at: [8.4, 0.1, 0.3] },
    { fn: () => { w.play('Idle'); w.face(1); } },
    A('weed', { head: 0.7, ears: 1, look: new THREE.Vector3(12, -20, 0.4), t: 0.4 }),
    { wait: 0.6 },
    // 4. POV over the edge: they shrink into the mist; the splash comes late, from far below
    { cam: [9.3, 1.3, 0.9], look: [12, -30, 0.3] },
    { fn: () => {
      boss.root.visible = true; cast.ken.root.visible = true; cast.kagetora.root.visible = true;
      boss.root.position.set(12, -22, 0.4); cast.ken.root.position.set(11.1, -20, 1.2); cast.kagetora.root.position.set(12.7, -21, 1.1);
      tween({ k: 0 }, { k: 1 }, 1.6, { real: true, ease: 'in', onUpdate: k => { boss.root.position.y = -22 - k * 24; cast.ken.root.position.y = -20 - k * 26; cast.kagetora.root.position.y = -21 - k * 25; } });
    } },
    { say: 'fall_mist' },
    { fn: () => { const p = new THREE.Vector3(12, -47.5, 0.4); FX.burst(p, { color: 0xeef6ff, count: 40, speed: 7 }); FX.mistPlume(p, 10, 4); } },
    { sfx: 'splash' },
    { fn: () => { for (const d of [boss, cast.ken, cast.kagetora]) d.root.visible = false; } },
    { cam: [9.0, 1.6, 1.6], look: [12, -10, 0.3], t: 2.4, ease: 'inOut' },
    { fx: 'flash', color: '#ffffff', t: 2.6, peak: 1 },
    { wait: 1.0 },
    { fn: () => { if (set.gorge) { E.scene.remove(set.gorge); set.gorge = null; } for (const d of Object.values(cast)) { d.root.visible = false; d.spin.rotation.set(0, 0, 0); } } },
    Mark('post_river'),
    // ---- BELOW THE FALLS: the river (morning) ----
    Mood('autumn_morning_gold', 0.1), GradeNow({ exposure: 1.0, sat: 0.95, vig: 0.1, t: 0 }),
    { fn: () => { set.river = GZ.river({ x0: -22, x1: 22, z: 0.75, w: 2.6 }); E.scene.add(set.river); } },
    { amb: 'river' }, { surface: 'wade' },
    { place: 'kaibutsu', x: 6.6, z: -1.3, face: -1, anim: 'Death', loop: false },
    { fn: () => { const t = boss.cur; if (t) { t.t = 99; if (t.action) t.action.time = t.action.getClip().duration - 0.01; } } },   // already lying
    { place: 'ken', x: -6.2, z: 0.9, face: 1, anim: 'Walk', ts: 0.6 },
    { fn: () => { cast.kagetora._carried = true; } },                  // carried on Ken's back (intended, not a collision)
    { place: 'kagetora', x: -6.2, y: cast.ken.height * 0.62, z: 0.9, face: 1, anim: 'LieDown' },
    { caption: 'Below the falls', t: 2.4, wait: false },
    // 1. WIDE: mist over the water, Ken wading out with Kagetora on his back
    { cam: [-4.8, 2.4, 8.6], look: [0.4, 0.6, 0] },
    { par: [
      { move: 'ken', x: -2.4, z: 0.2, t: 3.4, anim: 'Walk', ts: 0.55, after: 'Idle_2_HeadLow' },
      { move: 'kagetora', x: -2.4, z: 0.2, t: 3.4, faceMove: false },
      { cam: [-1.0, 0.8, 3.5], look: [-2.5, 0.75, 0.3], t: 3.4 },
    ] },
    { surface: 'step' },
    A('ken', { head: 0.3, ears: 0.4, breath: 1.2, t: 0.5 }),
    { sfx: 'tired' },
    { expr: 'ken', name: 'determined' },
    { say: 'post_alive_ken' },
    { cam: [-2.0, 1.15, 1.6], look: [-2.5, 1.0, 0.2], t: 0.8, ease: 'out' },
    { say: 'post_alive_kage' },
    { expr: 'ken', name: null },
    { fn: () => { cast.kagetora.root.position.set(-1.6, 0, -0.2); cast.kagetora._carried = false; } },
    A('kagetora', { lie: 1, head: 0.4, t: 0.05 }),
    Mark('post_jerome'),
    // 2. IN THE CURRENT: Weed has Jerome by the scruff on a rock, the water pulling at them
    { place: 'jerome', x: 2.5, z: 0.8, face: -1, anim: 'LieDown' },
    { place: 'weed', x: 1.75, z: 1.0, face: 1, anim: 'Attack', loop: true, ts: 0.2 },
    { surface: 'wade' },
    A('weed', { head: 0.35, ears: 0.6, breath: 1.2, look: 'jerome', t: 0.05 }),
    { cam: [3.6, 0.55, 3.0], look: [2.1, 0.4, 0.85] },
    { sfx: 'wade' },
    { expr: 'jerome', name: 'sad' },
    A('jerome', { head: 0.3, ears: 0.8, look: 'weed', t: 0.6 }),
    { say: 'post_guilt' },
    { cam: [0.7, 0.42, 2.4], look: [1.8, 0.4, 0.95], t: 0.6, ease: 'out' },
    { fn: () => w.play('Idle') },
    A('weed', { head: -0.1, ears: 0, look: 'jerome', t: 0.3 }),
    { expr: 'weed', name: 'angry' },
    { say: 'post_carry' },
    { expr: 'weed', name: null },
    { dolly: 'jerome', dist: 1.4, side: -0.6, t: 0.8 },
    { expr: 'jerome', name: 'closed' },
    A('jerome', { head: 0.5, look: null, t: 1.2 }),
    { say: 'post_follow' },
    { expr: 'jerome', name: null },
    // 3. Mel comes running along the bank, GB behind
    { place: 'mel', x: -4.0, z: -0.8, face: 1, anim: 'Gallop', ts: 1.2 },
    { place: 'gb', x: -5.2, z: -1.3, face: 1, anim: 'Walk' },
    { surface: 'step' },
    { cam: [0.0, 1.0, 4.4], look: [0.6, 0.6, -0.2] },
    { par: [
      { move: 'mel', x: 1.0, z: -0.15, t: 1.8, anim: 'Gallop', ts: 1.2, after: 'Bark', ease: 'out' },
      { move: 'gb', x: -1.4, z: -1.0, t: 2.2, anim: 'Walk', after: 'Idle' },
    ] },
    A('mel', { look: 'weed', t: 0.3 }),
    { say: 'help' },
    { anim: 'mel', name: 'Idle' },
    { fn: () => { cast.jerome.root.position.set(1.7, 0, -0.1); cast.jerome.play('Idle'); w.root.position.set(1.0, 0, 0.35); } },
    A('jerome', { lie: 0, head: 0.4, ears: 0.6, look: null, t: 0.05 }),
    A('weed', { head: 0, ears: 0, breath: 1.0, look: null, t: 0.4 }),
    // 4. the fallen monster in the shallows: a faint whimper (our interpretation), Weed's pity
    { move: 'weed', x: 4.7, z: -0.5, t: 2.4, anim: 'Walk', ts: 0.55, after: 'Idle' },
    A('weed', { head: 0.45, ears: 0.6, look: 'kaibutsu', t: 0.8 }),
    { cam: [3.6, 0.9, 2.8], look: [5.9, 0.7, -1.1], t: 1.6 },
    { say: 'whimper' },
    { fn: () => { const p = boss.root.position.clone(); FX.spiritLight(p.add(new THREE.Vector3(0, 1.4, 0.4)), 0xffd8a8, 6); sfx.spirit(); } },
    { cam: [4.1, 0.55, 0.8], look: [4.8, 0.55, -0.5], t: 1.2 },
    { say: 'post_human' },
    Mark('post_heli'),
    // ---- THE HELICOPTER (the laboratory comes for its creature; Jerome will not go back) ----
    { fn: () => { set.heli = makeHeli(); E.scene.add(set.heli.group); set.heli.group.position.set(-26, 16, -22); set.heli.group.rotation.y = -0.6; set.heli.light(true); set.heli.sweep(true); } },
    { cam: [0.5, 0.6, 4.4], look: [-6, 6, -14] },
    { fn: () => { set.heli.flyTo([2.0, 6.5, -4.5], 6.0, 'out'); } },
    A('jerome', { head: -0.3, ears: 0.9, look: new THREE.Vector3(-6, 7, -12), t: 0.6 }),
    A('mel', { head: -0.3, ears: 0.8, look: new THREE.Vector3(-6, 7, -12), t: 0.6 }),
    A('weed', { head: -0.35, ears: 0.6, look: new THREE.Vector3(-6, 7, -12), t: 0.6 }),
    { wait: 2.4 },
    // LOW ANGLE: the machine comes over the water, the searchlight on the dogs; rotor wash flattens the grass
    { cam: [-0.8, 0.35, 3.0], look: [1.6, 3.6, -3.2] },
    { fn: () => { set.heli.sweep(false); set.heli.aim(0.25, 0.15); } },
    { par: [
      { cam: [-0.3, 0.45, 2.6], look: [1.8, 4.6, -3.6], t: 3.6, ease: 'inOut' },
      { fn: async () => { for (let i = 0; i < 6 && !E.skipping; i++) { FX.dust(new THREE.Vector3(1.4 + Math.sin(i) * 1.5, 0.1, -1.2 + Math.cos(i) * 1.2), true); await wait(0.5, true); } } },
    ] },
    A('jerome', { look: new THREE.Vector3(2, 5, -4.5), ears: 1, t: 0.3 }),
    Shiver('mel', 2), Shiver('gb', 2),
    // Jerome steps out in front of the pack and refuses
    { move: 'jerome', x: 2.3, z: 0.2, t: 1.2, anim: 'Walk', ts: 0.8, after: 'Idle' },
    { cam: [3.6, 0.35, 1.9], look: [2.3, 0.75, 0.0] },
    { anim: 'jerome', name: 'Bark', loop: false }, { sfx: 'bark' },
    { expr: 'jerome', name: 'determined' },
    A('jerome', { head: -0.35, ears: 0, t: 0.3 }),
    { say: 'post_stay' },
    { expr: 'jerome', name: null },
    // the helicopter turns away, light off, and climbs out over the ridge
    { fn: () => { set.heli.light(false); tween(set.heli.group.rotation, { y: 2.2 }, 2.0, { real: true }); set.heli.flyTo([22, 18, -26], 7, 'in'); } },
    { cam: [-0.6, 0.5, 3.6], look: [4, 6, -10], t: 3.0, ease: 'inOut' },
    A('jerome', { head: 0, look: null, t: 1 }), A('mel', null), A('weed', null),
    { wait: 1.0 },
    Mark('post_graves'),
    // ---- GRAVES AT DUSK ----
    { fn: () => { if (set.heli) { set.heli.dispose(); set.heli = null; } if (set.river) { E.scene.remove(set.river); set.river = null; } } },
    { fx: 'flash', color: '#000000', t: 1.6, peak: 1 },
    { wait: 0.8 },
    Mood('memorial', 0.1), GradeNow({ exposure: 0.95, sat: 0.9, vig: 0.22, bloom: 0.2, t: 0 }),
    { amb: 'dusk' },
    { music: 'smith2', fade: 2.5 },
    { fn: () => { for (const d of Object.values(cast)) d.root.visible = false; set.graves = new THREE.Group(); GRAVES.forEach(([x, z], i) => { const gr = SETS.grave(i + 1); gr.position.set(x, 0, z); gr.rotation.y = (i - 2) * 0.05; set.graves.add(gr); }); E.scene.add(set.graves); } },
    { place: 'weed', x: -0.2, z: 1.3, face: 1, anim: 'Idle' },
    { place: 'jerome', x: 1.6, z: 1.5, face: -1, anim: 'Idle' },
    { place: 'ken', x: -1.9, z: 1.6, face: 1, anim: 'Idle' },
    { place: 'kagetora', x: -3.1, z: 1.3, face: 1, anim: 'Idle' },
    { place: 'mel', x: 3.0, z: 1.7, face: -1, anim: 'Idle' },
    { place: 'gb', x: 4.1, z: 1.4, face: -1, anim: 'Idle' },
    ...['weed', 'jerome', 'ken', 'kagetora', 'mel', 'gb'].map(id => A(id, { lie: 0, head: 0.45, ears: 0.8, tail: 0.6, look: new THREE.Vector3(0, 0.2, -1.8), t: 0.05 })),
    // 1. WIDE from behind the graves: the pack in a row, the sun going down behind the camera
    { cam: [0.4, 1.1, -5.2], look: [0.2, 0.6, 1.4] },
    { cam: [0.4, 1.3, -4.4], look: [0.2, 0.7, 1.4], t: 4, ease: 'inOut' },
    // 2. one light per grave; a translucent silhouette of each fallen dog rises above it
    Mark('post_spirits'),
    { cam: [0.2, 2.7, 7.0], look: [0.2, 1.3, -2.2] },
    { fn: async () => {
      for (let i = 0; i < GRAVES.length && !E.skipping; i++) {
        const [x, z] = GRAVES[i], d = cast[FALLEN[i]];
        FX.lightPillar(new THREE.Vector3(x, 0, z), 0xffe6b0, 9, 13, 0.7); sfx.spirit();
        if (d) ghostRise(d, x, z - 0.3);
        await wait(0.9, true);
      }
    } },
    { sfx: 'memory' },
    { caption: '<b>IN MEMORY</b>Smith · North · Robert · Rocker · Heuler', t: 5, wait: false },
    { cam: [0.2, 2.6, 8.4], look: [0.2, 2.4, -2.2], t: 4, ease: 'inOut' },
    { say: 'memorial' },
    // 3. Weed lifts his head; the others follow – a howl for the fallen
    { cam: [1.3, 0.55, 3.0], look: [-0.2, 0.7, 1.3] },
    A('weed', { head: -0.5, ears: 0.2, look: null, t: 0.8 }),
    { anim: 'weed', name: 'Howl' }, { sfx: 'howl' },
    { wait: 1.2 },
    ...['jerome', 'ken', 'kagetora', 'mel', 'gb'].map(id => A(id, { head: -0.4, ears: 0.3, t: 1.2 })),
    { sfx: 'howl' },
    { cam: [0.2, 0.9, 5.8], look: [0.2, 1.2, 0], t: 3, ease: 'inOut' },
    // ---- HOPE: the last light; his father ----
    { music: 'dawn', fade: 3 },
    { anim: 'weed', name: 'Idle' },
    A('weed', { head: -0.2, ears: 0, look: new THREE.Vector3(2.6, 2.6, -2), t: 0.8 }),
    { cam: [-1.0, 0.5, 2.9], look: [1.4, 1.3, -1.6], t: 1.6 },
    { say: 'post_father' },
    { fx: 'spirit', at: [2.6, 1.6, -0.8], color: 0xdff0ff, t: 5 },
    { say: 'spirit_echo' },
    { expr: 'weed', name: 'determined' },
    { cam: [-4, 3.2, 12], look: [2, 2.4, -4], t: 3.4 },
    { caption: '<b>To be continued</b>The Hōgen saga', t: 3.2 },
    { expr: 'weed', name: null },
    { fn: () => { resetActing(cast); drift(null); grade({ t: 0 }); if (set.graves) { E.scene.remove(set.graves); set.graves = null; } } },
  ];
};
