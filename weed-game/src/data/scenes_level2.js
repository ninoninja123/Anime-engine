// Level 2 scene scripts (data). Step format: see src/scenes.js. Lines: src/data/lines.js.
// Each export is a function (ctx) -> steps, so positions can depend on the current fight state.
import * as THREE from 'three';
import { tween, wait } from '../engine.js';
import { rotBoneWorld } from '../contact.js';

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
  { say: 'intro_smell' },
  { anim: 'kagetora', name: 'Bark', loop: false },
  { say: 'intro_tease' },
  { anim: 'ken', name: 'Bark', loop: false },
  { expr: 'ken', name: 'angry' },
  { say: 'intro_shut' },
  { expr: 'ken', name: null },
  // Weed's vow – slow push-in to a close-up, the fortress behind him
  { move: 'weed', x: -2.8, t: 1.0, anim: 'Walk', after: 'Idle' },
  { cam: [-0.2, 0.9, 3.4], look: [-2.4, 0.7, 0] },
  { cam: [-1.4, 0.75, 1.9], look: [-2.5, 0.65, 0], t: 3.2, ease: 'out' },
  { say: 'intro_vow' },
  { music: 'smith', fade: 1.8 },                                       // Smith's theme: his first moment in the spotlight
  { dolly: 'smith', dist: 1.5, side: 0.8, t: 0.6 },
  { say: 'intro_proud' },
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
  { expr: 'jerome', name: 'determined' },
  { say: 'intro_arrive' },
  { dolly: 'heuler', dist: 1.7, side: -0.6, t: 0.4 },
  { expr: 'heuler', name: 'happy' },
  { say: 'intro_follow' },
  { expr: 'heuler', name: null }, { expr: 'jerome', name: null },
  // canon: the gorge before Gajō is crossed at night – Weed first, Smith with Ken and Kagetora at his sides
  { mood: 'autumn_night', t: 2.5 },
  { caption: '<b>The gorge before Gajō</b>Night', t: 2.6, wait: false },
  { cam: [-1.0, 1.4, 6.8], look: [-2.0, 0.6, 0] },
  { move: 'weed', x: -3.6, t: 0.5, anim: 'Gallop', ts: 1.3, ease: 'in' },
  { anim: 'weed', name: 'Gallop_Jump', loop: false }, { sfx: 'whoosh' },
  { move: 'weed', x: 0.6, y: 1.1, t: 0.4, ease: 'out', real: true },
  { move: 'weed', x: 1.8, y: 0, t: 0.35, ease: 'in', after: 'Idle' }, { fx: 'dust', at: [1.8, 0.1, 0] },
  { par: [
    { move: 'smith', x: -3.4, z: 0, t: 1.0, anim: 'Gallop', ts: 1.1 },
    { move: 'ken', x: -3.4, z: 0.7, t: 1.0, anim: 'Gallop', ts: 1.1 },
    { move: 'kagetora', x: -3.4, z: -0.7, t: 1.0, anim: 'Gallop', ts: 1.1 },
  ] },
  { anim: 'smith', name: 'Gallop_Jump', loop: false }, { anim: 'ken', name: 'Gallop_Jump', loop: false }, { anim: 'kagetora', name: 'Gallop_Jump', loop: false },
  { par: [
    { move: 'smith', x: 0.4, y: 1.0, t: 0.45, ease: 'out' },
    { move: 'ken', x: 0.6, y: 1.1, z: 0.7, t: 0.45, ease: 'out' },
    { move: 'kagetora', x: 0.6, y: 1.1, z: -0.7, t: 0.45, ease: 'out' },
  ] },
  { par: [
    { move: 'smith', x: 1.0, y: 0, t: 0.35, ease: 'in', after: 'Idle' },
    { move: 'ken', x: 1.3, y: 0, z: 0.7, t: 0.35, ease: 'in', after: 'Idle' },
    { move: 'kagetora', x: 1.3, y: 0, z: -0.7, t: 0.35, ease: 'in', after: 'Idle' },
  ] },
  { fx: 'dust', at: [1.0, 0.1, 0] },
  { cam: [-6.9, 1.3, 3.8], look: [-8.6, 0.9, -1.6] },
  { say: 'intro_weak' },
  { dolly: 'weed', dist: 1.5, side: -0.7, t: 0.4 },
  { anim: 'weed', name: 'Bark', loop: false },
  { say: 'intro_go' },
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
    // the monster comes out of the dark passage
    { place: 'kaibutsu', x: 10, z: 0, face: -1, anim: 'Walk', ts: 0.7 },
    { cam: [2.8, 0.4, 5.2], look: [7, 2.4, 0] },
    { amb: 'boss' },
    { move: 'kaibutsu', x: 4.4, t: 2.6, anim: 'Walk', ts: 0.7, ease: 'out', faceMove: false, after: 'Idle_2_HeadLow' },
    { sfx: 'bossAppear' },
    { anim: 'kaibutsu', name: 'Howl' }, { bark: 'roar_intro' }, { sfx: 'roar' }, { shake: 0.7 },
    { fx: 'flash', color: '#ff9060', peak: 0.3 },
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
    // it rises from under the rocks
    { sfx: 'rumble', arg: 1.5 }, { shake: 0.5 }, { wait: 0.9 },
    { fn: () => {
      boss.root.visible = true; B.x = 6.5; boss.root.position.set(6.5, -2, 0); boss.face(-1, true);
      boss.play('Howl'); boss.eyes.material.color.set(0xff3010); boss.eyes.scale.setScalar(0.75);
      tween(boss.root.position, { y: 0 }, 0.6, { ease: 'out', real: true });
      for (const r of ctx.fallingRocks) {
        const dx = r.position.x - 6.5;
        tween(r.position, { x: r.position.x + dx * 3, y: r.position.y + 2 + Math.random() * 3, z: r.position.z + 2 }, 0.6, { real: true, ease: 'out' })
          .then(() => tween(r.scale, { x: 0.01, y: 0.01, z: 0.01 }, 0.6, { real: true }));
      }
    } },
    { bark: 'roar_rise' }, { sfx: 'roar' }, { shake: 0.9 }, { fx: 'flash', color: '#ff8050', t: 0.4, peak: 0.4 },
    { fx: 'dust', at: [6.5, 0.5, 0], big: true },
    { wait: 1.3 },
    { anim: 'kaibutsu', name: 'Idle' },
    { cam: [3.2, 1.2, 4.6], look: [6.0, 2.4, 0], t: 0.6 },
    { say: 'speak' },
    { dolly: 'jerome', dist: 1.5, side: 0.7, t: 0.4 },
    { expr: 'jerome', name: 'sad' },
    { say: 'p4_answer' },
    { expr: 'jerome', name: null },
    { say: 'sac_rises' },
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
    { dolly: 'jerome', dist: 1.4, side: 0.6, t: 0.5 },
    { expr: 'jerome', name: 'sad' },
    { say: 'arrows_order' },
    { expr: 'jerome', name: 'determined' }, { expr: 'robert', name: 'determined' }, { expr: 'rocker', name: 'determined' },
    { dolly: 'robert', dist: 1.5, side: 0.6, t: 0.4 },
    { say: 'arrows_ack' },
    { dolly: 'heuler', dist: 1.5, side: -0.6, t: 0.4 },
    { expr: 'heuler', name: 'happy' },
    { say: 'arrows_together' },
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
    const m = cast[id], A = ARROW[i];
    steps.push(
      { fn: () => { m.root.position.z = 0.9; m.root.position.y = 0; m.face(1, true); } },
      // a breath before he goes: slow push onto his face
      { track: id, from: [1.3, 0.25, 1.4], to: [1.0, 0.2, 1.1], look: [0.2, 0.25, 0], t: 1.1 },
      { sfx: 'bark' },
      // the run: the camera runs with him
      { fx: 'speed', v: 1 },
      { par: [
        { move: id, x: B.x - half - 2.0, z: 1.0, t: 0.75, anim: 'Gallop', ts: 1.4, ease: 'in' },
        { track: id, from: [-1.2, 0.1, 2.8], to: [-0.4, 0.3, 3.2], look: [1.0, 0.3, 0], t: 0.75, ease: 'in' },
        { sfx: 'gallopIn' },
      ] },
      { slow: 0.3 }, { fx: 'speed', v: 1 },
      // anticipation -> leap (battle cry) -> jaws in the bare skin of the LEFT CHEST, each one deeper than the last
      { par: [
        { strike: id, target: 'kaibutsu', point: 'chest_weak', side: 'near', wind: 0.25, t: 0.34, arc: 0.45, anim: 'Gallop_Jump', hitAt: 0.5,
          depth: A.depth, cry: ['bark'], cryRate: A.cry, grunt: ['breath'], tug: 0.12 + 0.25 * A.depth,
          pin: true, react: 'roar', fx: 'crit', strong: true, sfx: ['bite', 'crit'], hitstop: 0.1 + 0.08 * A.depth, shake: 0.4 + 0.5 * A.depth, onHit: dmg(4) },
        A.cam === 'low' ? { cam: [B.x - half - 3.2, 0.5, 4.2], look: [B.x - half * 0.6, 1.5, 0.6], t: 1.6, ease: 'out' }
          : { cam: [B.x - half - 1.2, 1.2, 4.6], look: [B.x - half * 0.7, 1.3, 0.6], t: 1.6, ease: 'out' },
      ] },
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
        { anim: id, name: 'Death', loop: false, ts: 0.8 },
      ] : A.counter === 'rearup' ? [
        { cam: [B.x - half - 2.4, 0.4, 5.2], look: [B.x - half * 0.5, 2.0, 0.5], t: 0.25, ease: 'out' },
        { motion: 'kaibutsu', kind: 'rearup', angle: 1.05, releaseAt: 'apex', release: { who: id, mode: 'throw', to: A.land, arc: A.arc, t: A.t, land: 'Death', spin: 1 } },
      ] : [
        { thrash: 'kaibutsu', t: 0.8, amp: 0.45, freq: 2.6 },
        { cam: [B.x - half - 1.0, 0.35, 5.6], look: [B.x - half * 0.3, 1.0, 0.4], t: 0.3, ease: 'out' },
        { motion: 'kaibutsu', kind: 'fallback', side: -1, releaseAt: 'impact', wait: false, release: { who: id, mode: 'throw', to: A.land, arc: A.arc, t: A.t, land: 'Death', spin: 1 } },
        { wait: 3.3 },
      ]),
      { cam: [A.land[0] - 1.6, 1.4, A.land[1] + 4.2], look: [(A.land[0] + B.x - half) / 2, 0.9, 1.2], t: 0.5, ease: 'out' },
      { fn: () => { fallen.push(m.root.position.clone()); FX.dust(m.root.position.clone().setY(0.1), true); } },
      { sfx: 'whimper' },
      { anim: 'kaibutsu', name: 'Idle_2_HeadLow', ts: 0.8 },
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
      for (const p of fallen) { FX.spiritLight(p.clone().add(new THREE.Vector3(0, 0.5, 0)), 0xcfe4ff, 5); }
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
    // three of them lock the monster down: Kagetora hangs from its throat (far side), Weed hangs off its flank,
    // Ken clamps its haunch from behind-side. Each bite is a real contact; P4's legs stop.
    { par: [
      { depth: 0.45, cry: ['bark'], grunt: ['breath'], strike: 'kagetora', target: 'kaibutsu', point: 'throat', side: 'far', wind: 0.2, t: 0.75, arc: 0.5, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], tug: 0.25, maxPitch: 1.1 },
      { depth: 0.45, cry: ['bark'], grunt: ['breath'], strike: 'weed', target: 'kaibutsu', point: 'flank', side: 'near', wind: 0.25, t: 0.85, arc: 0.6, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], yaw: 0.7, maxPitch: 1.0, tug: 0.2 },
      { depth: 0.45, cry: ['bark'], grunt: ['breath'], strike: 'ken', target: 'kaibutsu', point: 'hip', side: 'near', wind: 0.3, t: 1.0, arc: 0.3, anim: 'Gallop', hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite', 'hit'], tug: 0.25, yaw: 1.0 },
      { cam: [0.6, 1.4, 7.4], look: [3.0, 1.2, 0.3], t: 1.0, ease: 'out' },
    ] },
    { sfx: 'roar' }, { shake: 0.6 },
    // P4 strains against them: legs locked, body shudders
    { fn: () => {
      boss.play('Idle_HitReact2', { loop: false, timeScale: 0.4 });
      let t = 0;
      strain = boss.overlay((d, dt) => { t += dt; if (d.cur && d.cur.action) d.cur.action.timeScale = 0.05; const sp = d.bones.spine_02; if (sp) ctx.contact.rotBoneWorld(sp, new THREE.Vector3(1, 0, 0), Math.sin(t * 31) * 0.025); });
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
    { fx: 'speed', v: 1 },
    { strike: 'jerome', target: 'kaibutsu', point: 'chest_weak', side: 'near', depth: 0.9, cry: ['bark'], cryRate: 0.85, grunt: ['breath'], wind: 0.25, t: 0.34, arc: 0.4, anim: 'Gallop_Jump', hitAt: 0.5,
      pin: true, react: 'roar', fx: 'crit', strong: true, sfx: ['bite', 'crit'], hitstop: 0.14, shake: 0.7, tug: 0.3,
      onHit: () => { boss.weakReveal = 1; } },
    { slow: 1 },
    { freeze: 0.35 },
    { fn: () => { const n = ctx.contact.mouthWorld('jerome'); E.camPos.set(n.x - 1.4, n.y + 0.1, n.z + 1.9); E.camLook.set(n.x, n.y - 0.2, n.z); } },
    { expr: 'jerome', name: 'angry' },
    { thrash: 'kaibutsu', t: 1.2, amp: 0.12, freq: 3.6 },
    { say: 'lock_artery' },
    // P4 bends its head down and bites Kagetora's neck, flings him, then tears Jerome loose
    { cam: [0.2, 1.3, 6.4], look: [2.4, 1.1, 0.2], t: 0.3, ease: 'out' },
    { fn: () => { if (strain) strain(); strain = null; } },
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
    { sfx: 'roar' }, { thrash: 'kaibutsu', t: 0.9, amp: 0.3, freq: 2.4 },
    { wait: 0.6 },
  ];
};

// ------------------------------------------------------------------------------------------------
// POST-BATTLE (canon-based): the fall, the rising wind, Jerome saved from the river, the helicopter, graves at dusk, hope.
export const post = (ctx) => {
  const { cast, S, E, FX, sfx } = ctx;
  const boss = cast.kaibutsu, w = cast.weed, B = S.B, W = S.W;
  return [
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
      { move: 'ken', x: 6.0, z: 1.9, t: 1.6, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { move: 'kagetora', x: 5.2, z: 1.3, t: 1.7, anim: 'Gallop', ts: 1.5, ease: 'in' },
      { cam: [5.0, 1.8, 7.0], look: [8.6, 1.6, 0], t: 2.0 },
    ] },
    { bark: 'fall_hold' },
    { par: [
      { strike: 'ken', target: 'kaibutsu', point: 'hip', side: 'near', t: 0.35, arc: 0.3, hitAt: 0.5, pin: true, react: 'flinch', fx: 'impact', sfx: ['bite'], yaw: 1.0 },
      { strike: 'kagetora', target: 'kaibutsu', point: 'flank', side: 'near', t: 0.4, arc: 0.5, anim: 'Gallop_Jump', hitAt: 0.5, pin: true, react: 'none', fx: 'impact', sfx: ['bite'], maxPitch: 1.0 },
    ] },
    { say: 'fall_with' },
    // over the edge: everyone plunges into the gorge (no gorge mesh yet -> white-out while falling)
    { cam: [5.5, 3.2, 8.5], look: [10, 0.5, 0], t: 0.3 },
    { fn: async () => {
      boss.play('Death', { loop: false, timeScale: 0.5 });
      // the three are still biting: their pins carry them over the edge with the monster
      const all = [boss, w, cast.ken, cast.kagetora];
      const p0 = boss.root.position.clone();
      setTimeout(() => FX.flash('#ffffff', 3.2, 1), 650);
      await tween({ k: 0 }, { k: 1 }, 1.1, { real: true, ease: 'in', onUpdate: k => { boss.root.position.set(p0.x + k * 2.5, p0.y + Math.sin(k * Math.PI) * 0.6 - k * k * 1.5, p0.z); all.forEach(d => d.fade(1 - Math.max(0, k - 0.6) * 2.5)); } });
      ctx.contact.releaseAll();
    } },
    { sfx: 'rock' }, { amb: 'gorge' },
    { music: null, fade: 1.5 },
    { sfx: 'splash' },                                                  // into the river below the falls
    { say: 'fall_wind' },
    { say: 'fall_mist' },
    { fn: () => { for (const d of Object.values(cast)) d.root.visible = false; } },
    { wait: 0.6 },
    // below the falls (canon: Ken carries Kagetora ashore, Weed has pulled Jerome from the river)
    { light: { rim: 1.5, fog: 0x4a3a46, exposure: 1.0, t: 0.1 } },
    { place: 'kaibutsu', x: 6.2, z: -1.2, face: -1, anim: 'Death', loop: false },
    { fn: () => { const t = boss.cur; if (t) { t.t = 99; if (t.action) t.action.time = t.action.getClip().duration - 0.01; } } },   // already lying
    { place: 'ken', x: -5.5, z: 0.4, face: 1, anim: 'Walk', ts: 0.6 },
    { fn: () => { cast.kagetora._carried = true; } },                  // carried on Ken's back (intended, not a collision)
    { place: 'kagetora', x: -5.5, y: cast.ken.height * 0.62, z: 0.4, face: 1, anim: 'LieDown' },
    { cam: [-4.5, 2.6, 9], look: [0.5, 0.6, 0] },
    { amb: 'river' }, { caption: 'Below the falls', t: 2.4, wait: false },
    { par: [
      { move: 'ken', x: -2.2, t: 3.0, anim: 'Walk', ts: 0.6, after: 'Idle_2_HeadLow' },
      { move: 'kagetora', x: -2.2, t: 3.0, faceMove: false },
      { cam: [-1.0, 1.0, 3.6], look: [-2.4, 0.7, 0.4], t: 3.0 },
    ] },
    { expr: 'ken', name: 'determined' },
    { say: 'post_alive_ken' },
    { say: 'post_alive_kage' },
    { expr: 'ken', name: null },
    { fn: () => { cast.kagetora.root.position.set(-1.5, 0, 0.9); cast.kagetora._carried = false; } },
    // Weed holds Jerome on a rock in the current
    { place: 'jerome', x: 2.4, z: -0.3, face: -1, anim: 'LieDown' },
    { place: 'weed', x: 1.5, z: 0.1, face: 1, anim: 'Attack', loop: true, ts: 0.25 },
    { cam: [2.6, 0.9, 3.0], look: [2.0, 0.45, -0.2], t: 0 },
    { expr: 'jerome', name: 'sad' },
    { say: 'post_guilt' },
    { dolly: 'weed', dist: 1.3, side: 0.6, t: 0.6 },
    { say: 'post_carry' },
    { dolly: 'jerome', dist: 1.4, side: -0.6, t: 0.6 },
    { expr: 'jerome', name: 'closed' },
    { say: 'post_follow' },
    { expr: 'jerome', name: null },
    // canon: Mel comes to help them out of the river, GB is with him
    { place: 'mel', x: -3.5, z: -0.6, face: 1, anim: 'Gallop', ts: 1.2 },
    { place: 'gb', x: -4.6, z: -1.2, face: 1, anim: 'Walk' },
    { cam: [0.4, 1.0, 4.2], look: [0.2, 0.7, -0.4] },
    { par: [
      { move: 'mel', x: 0.8, z: -0.3, t: 1.6, anim: 'Gallop', ts: 1.2, after: 'Bark', ease: 'out' },
      { move: 'gb', x: -1.6, z: -1.0, t: 2.0, anim: 'Walk', after: 'Idle' },
    ] },
    { say: 'help' },
    { anim: 'mel', name: 'Idle' },
    // the quiet moment with the fallen monster (the whimper is our own interpretation)
    { anim: 'weed', name: 'Walk', ts: 0.6 },
    { move: 'weed', x: 4.6, z: -0.6, t: 2.0, anim: 'Walk', ts: 0.6, after: 'Idle_2_HeadLow' },
    { cam: [4.4, 1.0, 3.0], look: [5.6, 0.6, -1.0], t: 1.5 },
    { say: 'whimper' },
    { fn: () => { const p = boss.root.position.clone(); FX.spiritLight(p.add(new THREE.Vector3(0, 1.4, 0.4)), 0xffd8a8, 6); } },
    { dolly: 'weed', dist: 1.2, side: -0.5, t: 1.2 },
    { say: 'post_human' },
    // the laboratory helicopter lands; Jerome refuses to go back
    { sfx: 'heli' },                                                    // rotor approaching (was: rumble)
    { caption: 'A laboratory helicopter sets down by the river.', t: 3.0, wait: false },
    { place: 'jerome', x: 1.2, z: 0.2, face: 1, anim: 'Idle' },
    { cam: [-0.4, 1.0, 3.6], look: [1.6, 1.0, -1], t: 1.2 },
    { anim: 'jerome', name: 'Bark', loop: false }, { sfx: 'bark' },
    { expr: 'jerome', name: 'determined' },
    { say: 'post_stay' },
    { expr: 'jerome', name: null },
    { amb: 'dusk' },
    { light: { rim: 1.1, fog: 0x3a2e40, exposure: 0.95, t: 2 } },          // dusk: the graves
    // memorial at dusk: five lights rise over the graves
    { music: 'smith2', fade: 2.5 },                                  // Smith's second theme for the memorial
    { place: 'ken', x: -1.8, z: -1.2, face: 1, anim: 'Idle' },
    { place: 'kagetora', x: -2.8, z: -0.2, face: 1, anim: 'Idle' },
    { face: 'weed', dir: 1 },
    { cam: [0, 2.2, 10], look: [0, 2.8, -3], t: 2.2 },
    { fn: () => ['Smith', 'North', 'Robert', 'Rocker', 'Heuler'].forEach((n, i) => setTimeout(() => FX.spiritLight(new THREE.Vector3(-4 + i * 2, 1.4, -1), 0xffe6b0, 7), i * 500)) },
    { sfx: 'spirit' }, { sfx: 'memory' },
    { caption: '<b>IN MEMORY</b>Smith · North · Robert · Rocker · Heuler', t: 5, wait: false },
    { say: 'memorial' },
    // hope: Weed faces the last light, thinks of his father
    { music: 'dawn', fade: 3 }, { amb: 'dawn' },
    { anim: 'weed', name: 'Howl' },
    { cam: [-1.0, 0.6, 2.6], look: [1.6, 1.4, -2] , t: 1.6 },
    { say: 'post_father' },
    { fx: 'spirit', at: [2.6, 1.6, -0.8], color: 0xdff0ff, t: 5 },
    { say: 'spirit_echo' },
    { anim: 'weed', name: 'Idle' },
    { cam: [-4, 3.2, 12], look: [2, 2.4, -4], t: 3 },
    { caption: '<b>To be continued</b>The Hōgen saga', t: 3.2 },
  ];
};
