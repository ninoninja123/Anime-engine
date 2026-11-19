// PROLOGUE (level 1) "Weed and GB": scene scripts (data). Step format: src/scenes.js. Lines: src/data/lines.js (p_*).
// Canon (docs/weed-game/canon-deep-dive.md, anime ep. 1–2): northern Alps in autumn (evening → night → morning); GB and the pup
// quarrel over food, the pup's mother is sick; Nero orders GB to steal a duck from a farm guarded by a Tosa; Sasuke is the bait;
// the pup attacks, is thrown through the kennel wall and makes his first, unconscious spinning leap (cuts the Tosa's ear);
// Smith's fighting spirit makes the Tosa back off; Sakura entrusts her son to Smith and dies; in the morning GB comforts the pup
// and names him Weed. Jōshū: Weed saves Mel from a human; Hook (chained) tells about Blue; Blue sets Mel on Weed; Hook breaks his
// chain and comes with Smith; Blue flees onto the road and is hit by a truck while Weed's group is behind the net fence; when the
// next truck comes Weed leaps the fence to save him, and Blue throws Weed clear and dies. Hook stays; Mel follows Weed.
// Not in the anime (left out): Mel's mother Lenny. Dialogue is original. PEGI 12: no blood, impacts are cut / implied.
// Each export: (ctx) -> steps. ctx = { cast, P (props), E, FX, sfx, setMood, ... } from src/level1.js.

import * as THREE from 'three';
import { tween } from '../engine.js';
import { A, Nod, Shiver } from '../shared/acting.js';
import { Mark, From, Hush, Grade, GradeNow, Mood, glare } from '../shared/cine.js';

export function linesOf(steps, out = []) {
  for (const s of steps) { if (s.say) out.push(s.say); if (s.bark) out.push(s.bark); if (s.par) linesOf(s.par, out); }
  return out;
}

// ------------------------------------------------------------------------------------------------
// 1. OPENING: title card, autumn Alps at evening, GB and the pup over a scrap, Nero's order
export const opening = ({ cast, P }) => [
  { music: 'dawn', fade: 2.5 },
  { amb: 'dusk' },
  { mood: 'autumn_dusk', t: 0.1 },
  { place: 'weed', x: -0.4, z: 0.2, face: -1, anim: 'Idle' },
  { place: 'gb', x: -2.1, z: 0.1, face: 1, anim: 'Idle' },
  { fn: () => { P.show('scrap', -1.25, 0.15); } },
  // wide establishing: drifting over the red-gold mountains
  { cam: [-14, 7.5, 22], look: [-8, 9, -60] },
  { sfx: 'levelStart' }, { caption: '<b>PROLOGUE</b>Weed and GB', t: 4.2, wait: false },
  { cam: [-4, 5.5, 18], look: [2, 7, -60], t: 6, ease: 'inOut' },
  { say: 'p_open_1' },
  { say: 'p_open_2' },
  // crane down to the two of them, tug-of-war over the scrap
  { cam: [-0.6, 1.4, 5.2], look: [-1.2, 0.4, 0], t: 3.2, ease: 'inOut' },
  { anim: 'gb', name: 'Bark', loop: false }, { sfx: 'bark' },
  { cam: [-1.0, 0.75, 3.3], look: [-1.3, 0.45, 0], t: 0.4, ease: 'out' },     // two-shot: both tugging at the scrap
  { say: 'p_gb_mine' },
  { cam: [-0.7, 0.42, 1.9], look: [-0.9, 0.3, 0], t: 0.5, ease: 'out' },
  { expr: 'weed', name: 'sad' },
  { say: 'p_weed_mother' },
  { cam: [-1.4, 0.9, 3.2], look: [-1.4, 0.45, 0], t: 1.2 },
  { anim: 'gb', name: 'Idle_2_HeadLow' },
  { say: 'p_gb_give' },
  { fn: () => P.attach('scrap', cast.weed) },
  { anim: 'weed', name: 'Bark', loop: false },
  { expr: 'weed', name: 'happy' },
  { say: 'p_weed_thanks' },
  { anim: 'gb', name: 'Bark', loop: false },
  { say: 'p_gb_mister' },
  { expr: 'weed', name: null },
  // Nero and Sasuke come down the slope
  { place: 'nero', x: -9.5, z: -1.6, face: 1, anim: 'Walk' },
  { place: 'sasuke', x: -10.6, z: -0.6, face: 1, anim: 'Walk' },
  { cam: [-3.4, 0.8, 4.6], look: [-6.5, 0.9, -1], t: 0 },
  { par: [
    { move: 'nero', x: -4.4, t: 3.2, anim: 'Walk', ts: 0.8, after: 'Idle' },
    { move: 'sasuke', x: -5.4, t: 3.2, anim: 'Walk', after: 'Idle' },
    { cam: [-2.2, 0.75, 3.6], look: [-4.4, 0.85, -1.2], t: 3.2 },
  ] },
  { fn: () => cast.gb.face(-1) },
  { dolly: 'nero', dist: 1.5, side: 0.7, t: 0.6, h: -0.1 },
  { amb: 'night' },
  { say: 'p_nero_order' },
  { dolly: 'gb', dist: 1.5, side: -0.6, t: 0.4 },
  { expr: 'gb', name: 'surprised' },
  { say: 'p_gb_tosa' },
  { dolly: 'nero', dist: 1.2, side: 0.4, t: 0.5, h: -0.15 },
  { say: 'p_nero_threat' },
  { expr: 'gb', name: null },
  { move: 'gb', x: -4.6, z: -0.2, t: 1.2, anim: 'Walk', after: 'Idle' },
  { cam: [-4.2, 0.8, 2.8], look: [-5.2, 0.6, -0.4], t: 0.8 },
  { say: 'p_gb_sasuke' },
  { anim: 'sasuke', name: 'Idle_HitReact1', loop: false },
  { say: 'p_sasuke_me' },
  // the pup watches them go
  { par: [
    { move: 'nero', x: -14, t: 3.5, anim: 'Walk', ts: 0.8 },
    { move: 'gb', x: 9, z: -1, t: 4.5, anim: 'Walk' },
    { move: 'sasuke', x: 8, z: -0.4, t: 4.2, anim: 'Walk' },
    { fn: async () => { cast.weed.face(1); } },
    { cam: [-1.9, 0.5, 1.5], look: [2.6, 0.4, -0.7], t: 2.5, ease: 'inOut' },     // over the pup's shoulder
  ] },
  { hide: 'nero' },
  { say: 'p_weed_worry' },
  { fn: () => P.hide('scrap') },
];

// ------------------------------------------------------------------------------------------------
// 2. NIGHT, THE FARM: the pup runs after them (leads into the run)
export const farmIntro = () => [
  { mood: 'autumn_night', t: 2.5 },
  { music: null, fade: 2 },
  { amb: 'night' },
  { caption: '<b>The farm under the ridge</b>Night', t: 3, wait: false },
  { place: 'weed', x: -3, z: 0, face: 1, anim: 'Idle' },
  { cam: [-6, 2.6, 8], look: [-1, 0.6, -1] },
  { cam: [-4.2, 0.8, 3.2], look: [-2.6, 0.4, 0], t: 3 },
  { sfx: 'heartbeat' },
  { anim: 'weed', name: 'Gallop' },
];

// ------------------------------------------------------------------------------------------------
// 3. THE TOSA: Sasuke caught at the kennel; the pup charges in (leads into the fight)
export const tosaIntro = ({ cast, P }) => [
  { music: null },
  { fn: () => { P.show('kennel', 3.6, -1.6); P.show('pond', -2.5, -3.4); } },
  { place: 'tosa', x: 2.4, z: 0, face: -1, anim: 'Idle_2_HeadLow' },
  { place: 'sasuke', x: 1.45, z: 0.2, face: 1, anim: 'Idle_HitReact2' },
  { place: 'weed', x: -6, z: 0, face: 1, anim: 'Gallop' },
  { place: 'gb', x: -7.5, z: -1.3, face: 1, anim: 'Idle' },
  { cam: [0.4, 0.5, 4.2], look: [2.2, 0.9, 0] },
  { anim: 'tosa', name: 'Bark', loop: false }, { bark: 'p_tosa_growl' }, { sfx: 'growl' }, { shake: 0.25 },
  { move: 'weed', x: -2.2, t: 0.9, anim: 'Gallop', ts: 1.2, after: 'Idle' },
  { dolly: 'weed', dist: 1.8, side: 0.6, t: 0.35, h: 0.2 },
  { expr: 'weed', name: 'angry' },
  { say: 'p_weed_letgo' },
  { cam: [0.8, 0.35, 3.2], look: [2.2, 1.0, 0], t: 0.5, ease: 'out' },
  { say: 'p_tosa_scoff' },
  { music: 'battle', fade: 0.8 },
  // Sasuke wriggles free while the giant turns to the pup
  { par: [
    { move: 'sasuke', x: -8, z: 1.5, t: 1.6, anim: 'Gallop', ts: 1.4 }, { sfx: 'fur' },
    { fn: () => cast.tosa.face(-1) },
  ] },
  { hide: 'sasuke' },
  { expr: 'weed', name: null },
];

// mid-fight: thrown through the kennel wall, the pup "changes" (leads into phase 2)
export const tosaThrow = ({ cast, P, E, FX, sfx }) => [
  { music: null, fade: 0.3 },
  { place: 'weed', x: 1.2, z: 0, face: 1, anim: 'Attack', loop: false },
  { place: 'tosa', x: 2.6, z: 0, face: -1, anim: 'Attack', loop: false },
  { cam: [1.6, 0.5, 2.8], look: [2.0, 0.6, 0] },
  { slow: 0.25 }, { sfx: 'whoosh' },
  { anim: 'weed', name: 'Idle_HitReact2', loop: false },
  { par: [
    { move: 'weed', x: 3.5, y: 0.9, z: -1.0, t: 0.35, ease: 'out', real: false },
    { cam: [2.6, 0.9, 3.6], look: [3.4, 0.7, -1.2], t: 0.45 },
  ] },
  { slow: 1 },
  { fn: () => { P.breakKennel(); sfx.hitHeavy(); sfx.bodyfall(); } }, { shake: 0.7 }, { fx: 'flash', color: '#ffffff', peak: 0.6 },
  { move: 'weed', x: 3.6, y: 0, z: -1.5, t: 0.2, ease: 'in', real: true },
  { anim: 'weed', name: 'LieDown' },
  { fx: 'dust', at: [3.6, 0.2, -1.5], big: true }, { sfx: 'dust' },
  { wait: 0.8 },
  { anim: 'gb', name: 'Bark', loop: false },
  { say: 'p_gb_run' },
  // silence. heartbeat. the pup's eyes
  { light: { exposure: 0.55, t: 0.8 } },
  { sfx: 'heartbeat' },
  { cam: [3.9, 0.3, -0.6], look: [3.6, 0.25, -1.5], t: 1.6, ease: 'inOut' },
  { wait: 0.6 },
  { sfx: 'heartbeat' },
  { anim: 'weed', name: 'Idle_2_HeadLow' },
  { say: 'p_weed_rise' },
  { light: { exposure: 1.0, t: 0.4 } },
  { fn: () => { FX.spiritLight(cast.weed.root.position.clone().add(new E.V3(0, 0.3, 0)), 0x9fd0ff, 1.6); sfx.riser(); } },
  { anim: 'weed', name: 'Idle' },
  { dolly: 'weed', dist: 1.3, side: -0.5, t: 0.3, h: 0.1 },
  { freeze: 0.5 },
  { music: 'battle', fade: 0.4 },
];

// Battōga hits: the Tosa's ear is cut (shown as a flash and a yelp; no blood), Smith steps in
export const tosaEnd = ({ cast, E, FX, sfx }) => [
  { music: null, fade: 0.4 },
  { place: 'tosa', x: 2.6, z: 0, face: -1, anim: 'Idle_HitReact2', loop: false },
  { cam: [0.8, 0.6, 3.6], look: [2.4, 1.1, 0] },
  { sfx: 'whimper' }, { shake: 0.4 },
  { fn: () => cast.tosa.setTint(0xffffff, 0.5) }, { wait: 0.12 }, { fn: () => cast.tosa.setTint(0x000000, 0) },
  { dolly: 'gb', dist: 1.4, side: 0.6, t: 0.4 },
  { expr: 'gb', name: 'surprised' },
  { say: 'p_gb_what' },
  { expr: 'gb', name: null },
  { anim: 'tosa', name: 'Bark', loop: false }, { sfx: 'roar' },
  { dolly: 'tosa', dist: 1.3, side: 0.5, t: 0.3 },
  { say: 'p_tosa_rage' },
  { move: 'tosa', x: 1.2, t: 0.5, anim: 'Gallop', ease: 'in', faceMove: false },
  // a three-legged shadow on the fence: Smith
  { place: 'smith', x: -1.6, z: -1.2, face: 1, anim: 'Idle' },
  { slow: 0.2 },
  { cam: [-3.4, 0.4, 2.2], look: [-1.4, 0.9, -1.2], t: 0.35 },
  { fn: () => FX.spiritLight(cast.smith.root.position.clone().add(new E.V3(0, 0.5, 0)), 0xffd8a0, 1.5) },
  { slow: 1 },
  { anim: 'tosa', name: 'Idle' },
  { say: 'p_smith_enough' },
  { cam: [0.4, 0.7, 3.4], look: [1.4, 0.8, 0], t: 0.6 },
  { anim: 'tosa', name: 'Idle_HitReact1', loop: false }, { sfx: 'whimper' },
  { move: 'tosa', x: 6.5, z: -1.8, t: 2.0, anim: 'Walk', ts: 0.8 },
  { hide: 'tosa' },
  { music: 'smith', fade: 2 },
  { move: 'gb', x: -0.6, z: 0.4, t: 1.2, anim: 'Walk', after: 'Idle' },
  { place: 'weed', x: 0.6, z: 0.2, face: -1, anim: 'Idle' },
  { cam: [-0.4, 0.8, 3.6], look: [-0.6, 0.6, -0.4], t: 1.0 },
  { say: 'p_gb_who' },
  { dolly: 'smith', dist: 1.4, side: 0.6, t: 0.5 },
  { say: 'p_smith_name' },
  { dolly: 'weed', dist: 1.6, side: -0.5, t: 0.4 },
  { say: 'p_weed_home' },
  { move: 'weed', x: 8, z: -0.5, t: 1.8, anim: 'Gallop' },
];

// ------------------------------------------------------------------------------------------------
// 4. SAKURA: the den under the roots; she entrusts her son to Smith and dies. Morning: GB names him Weed.
export const sakura = ({ cast, P, E, FX, sfx }) => {
  const SK = [0.45, -1.95];                         // Sakura lies in the mouth of the den (den at 0.4, -2.2)
  const beam = () => P.objs.moonbeam && P.objs.moonbeam.userData.beam;
  return [
  From(['sk_find', 'sk_entrust', 'sk_nose', 'sk_live', 'sk_spirit', 'sk_morning', 'sk_name', 'sk_leave']),
  { music: null, fade: 1.5 },
  Mood('grief', 0.1), GradeNow({ exposure: 0.92, sat: 0.85, vig: 0.12, t: 0 }),
  { amb: 'night' },
  { surface: 'step' },
  { fn: () => { P.hideAll(); P.show('rootDen', 0.4, -2.2); P.show('weedPlant', 1.05, -0.5); P.show('moonbeam', 0.75, -2.0); const b = beam(); if (b) b.userData.setI(1); } },
  { place: 'sakura', x: SK[0], z: SK[1], face: -1, anim: 'Idle', ts: 0.35 },
  A('sakura', { lie: 1, head: 0.55, ears: 0.6, tail: 0.6, breath: 0.9, t: 0.05 }),
  { place: 'weed', x: -4.8, z: -0.7, face: 1, anim: 'Walk', ts: 0.8 },
  { place: 'smith', x: -6.4, z: -1.1, face: 1, anim: 'Walk', ts: 0.7 },
  { place: 'gb', x: -7.2, z: -0.2, face: 1, anim: 'Walk', ts: 0.7 },
  // 1. ESTABLISHING – moonlit wood, the old tree; crane down through falling leaves
  { cam: [-3.6, 4.4, 6.8], look: [0.3, 1.6, -2.2] },
  { caption: '<b>That night</b>', t: 3.2, wait: false },
  { par: [
    { cam: [-2.4, 1.3, 3.6], look: [0.1, 0.55, -1.9], t: 6.0, ease: 'inOut' },
    { move: 'weed', x: -3.4, z: -0.95, t: 6.0, anim: 'Walk', ts: 0.8, ease: 'linear' },
    { move: 'smith', x: -5.1, z: -1.2, t: 6.0, anim: 'Walk', ts: 0.7, ease: 'linear' },
    { move: 'gb', x: -5.9, z: -0.3, t: 6.0, anim: 'Walk', ts: 0.7, ease: 'linear' },
  ] },
  Mark('sk_find'),
  // 2. LOW TRACKING at the pup's height: he has caught a scent
  { cam: [-4.3, 0.34, 0.6], look: [-2.6, 0.32, -1.3] },
  A('weed', { head: 0.35, ears: 0, t: 0.4 }),
  { par: [
    { move: 'weed', x: -1.75, z: -1.45, t: 3.0, anim: 'Walk', ts: 0.75, after: 'Idle' },
    { cam: [-2.8, 0.3, 0.2], look: [-0.6, 0.34, -1.75], t: 3.0, ease: 'inOut' },
    { move: 'smith', x: -3.6, z: -1.3, t: 3.0, anim: 'Walk', ts: 0.6, after: 'Idle' },
    { move: 'gb', x: -4.3, z: -0.45, t: 3.0, anim: 'Walk', ts: 0.6, after: 'Idle' },
  ] },
  A('weed', { head: -0.1, ears: 0, look: 'sakura', t: 0.5 }),
  // 3. INSERT – inside the hollow: her eye opens, a thin breath (moonlight on her face)
  { cam: [-0.75, 0.42, -0.85], look: [0.05, 0.32, -1.95] },
  { sfx: 'breath' },
  A('sakura', { head: 0.2, look: 'weed', t: 1.6 }),
  { wait: 1.6 },
  // 4. SMITH – he knows her before he can believe it
  { dolly: 'smith', dist: 1.25, side: 0.55, t: 1.4, ease: 'inOut', h: -0.05 },
  A('smith', { head: 0.1, ears: 0.0, look: 'sakura', t: 0.6 }),
  { say: 'p_smith_sakura' },
  { music: 'sad', fade: 5 },
  // 5. over Smith's shoulder: Sakura answers, too weak to rise
  { cam: [-4.6, 0.85, -0.4], look: [0.2, 0.36, -1.9] },
  A('sakura', { look: 'smith', t: 1 }),
  { say: 'p_sakura_smith' },
  // 6. he limps to her (three legs), head low – guilt
  A('smith', { head: 0.45, ears: 0.8, tail: 0.8, t: 1.2 }),
  { par: [
    { move: 'smith', x: -1.55, z: -0.95, t: 2.6, anim: 'Walk', ts: 0.45, after: 'Idle' },
    { cam: [-0.6, 0.55, 0.9], look: [-1.7, 0.6, -1.0], t: 2.6, ease: 'inOut' },
  ] },
  { say: 'p_smith_sorry' },
  { cam: [-0.35, 0.38, -1.05], look: [0.05, 0.3, -1.95], t: 0.9, ease: 'out' },
  { say: 'p_sakura_hush' },
  Mark('sk_entrust'),
  // 7. ENTRUST – low two-shot: mother, pup, the old soldier
  { cam: [-0.4, 0.22, 1.25], look: [-0.7, 0.42, -1.55] },
  A('sakura', { look: 'weed', t: 1.2 }),
  A('weed', { head: 0.05, look: 'sakura', t: 0.8 }),
  { say: 'p_sakura_entrust' },
  { dolly: 'smith', dist: 1.05, side: -0.5, t: 1.6, ease: 'inOut', h: -0.1 },
  A('smith', { head: 0.15, ears: 0.3, look: 'sakura', t: 0.8 }),
  { say: 'p_smith_promise' },
  Nod('smith', 0.3),
  { wait: 0.8 },
  Mark('sk_nose'),
  // 8. NOSE TO NOSE – the pup creeps in under the roots; macro profile
  { par: [
    { move: 'weed', x: -0.72, z: -1.72, t: 2.2, anim: 'Walk', ts: 0.45, after: 'Idle' },
    { cam: [-0.45, 0.33, -0.7], look: [-0.25, 0.3, -1.85], t: 2.2, ease: 'inOut' },
  ] },
  { sfx: 'fur' },
  A('weed', { head: 0.12, ears: 0.4, look: 'sakura', t: 0.6 }),
  Hush(0.45, 9),
  { say: 'p_sakura_pup', hold: 0.6 },
  Mark('sk_live'),
  // 9. "…Live." – extreme close; then her head sinks and the breath stops. Silence.
  { cam: [-0.62, 0.66, -1.2], look: [-0.02, 0.6, -1.95], t: 1.4, ease: 'inOut' },
  { say: 'p_sakura_last' },
  { music: null, fade: 3 },
  A('sakura', { head: 0.95, ears: 0.9, breath: 0, look: null, t: 3.2 }),
  { par: [
    { cam: [-0.66, 0.5, -1.15], look: [0.0, 0.36, -1.95], t: 3.2, ease: 'inOut' },
    Grade({ exposure: 0.7, sat: 0.6, vig: 0.3, t: 3 }),
    { fn: () => { const b = beam(); if (b) { const o = { v: 1 }; return tween(o, { v: 0.45 }, 3, { real: true, onUpdate: () => b.userData.setI(o.v) }); } } },
  ] },
  { sfx: 'heartbeat' },
  { wait: 1.6 },
  // 10. WEED – does not understand yet; nudges her
  { cam: [-1.55, 0.32, -0.95], look: [-0.7, 0.32, -1.75] },
  A('weed', { head: 0.0, ears: 0.0, look: 'sakura', t: 0.4 }),
  { move: 'weed', x: -0.6, z: -1.78, t: 0.35, faceMove: false, ease: 'out' },
  { sfx: 'fur' },
  { move: 'weed', x: -0.72, z: -1.72, t: 0.5, faceMove: false },
  { say: 'p_weed_mama' },
  A('weed', { head: 0.6, ears: 1, tail: 1, breath: 1.1, look: null, t: 0.9 }),
  Shiver('weed', 2.5),
  { sfx: 'whimper' },
  // 11. REACTIONS – GB turns his head away; Smith lowers his head
  { cam: [-2.2, 0.75, 0.9], look: [-3.4, 0.6, -0.8] },
  { expr: 'gb', name: 'sad' },
  A('gb', { head: 0.5, ears: 0.8, tail: 0.8, yaw: 0.5, t: 1.2 }),
  A('smith', { head: 0.7, ears: 1, look: null, t: 1.6 }),
  { wait: 2.0 },
  Mark('sk_spirit'),
  // 12. HIGH ANGLE (loss): her light rises through the moonbeam; the camera lifts with it
  { cam: [0.3, 2.4, 1.6], look: [0.1, 0.4, -1.9] },
  { music: 'smith2', fade: 3 },
  { fn: () => { FX.spiritLight(cast.sakura.root.position.clone().add(new E.V3(0, 0.35, 0)), 0xffd6e8, 7); sfx.spirit(); } },
  { fn: () => { const b = beam(); if (b) b.userData.setI(1.6); } }, GradeNow({ exposure: 0.9, sat: 0.85, vig: 0.2, bloom: 0.25, t: 3 }),
  { cam: [0.6, 4.6, 3.4], look: [0.4, 3.0, -2.0], t: 6.5, ease: 'inOut' },
  { wait: 0.6 },
  { fx: 'flash', color: '#000000', t: 2.4, peak: 1 },
  { wait: 1.6 },
  Mark('sk_morning'),
  // MORNING: gold light through the trees; the pup has slept against her
  Mood('night', 0.1),                // autumn base = cold golden morning
  { amb: 'dawn' },
  GradeNow({ exposure: 1.0, sat: 1.0, vig: 0.08, bloom: 0.15, t: 0 }),
  { fn: () => { P.hide('moonbeam'); P.show('sunbeam', -0.2, -1.6); } },
  A('sakura', { lie: 1, head: 0.95, ears: 0.9, breath: 0, look: null, t: 0.05 }),
  A('smith', { head: 0.4, ears: 0.6, look: null, t: 0.05 }),
  A('gb', null),
  { expr: 'gb', name: null },
  { place: 'weed', x: -0.55, z: -1.45, face: 1, anim: 'Idle', ts: 0.4 },
  A('weed', { lie: 1, head: 0.55, ears: 0.8, tail: 1, breath: 0.6, look: null, t: 0.05 }),
  { place: 'smith', x: -2.5, z: -2.1, face: 1, anim: 'Idle' },
  { place: 'gb', x: -3.6, z: 0.4, face: 1, anim: 'Idle' },
  { caption: '<b>Morning</b>', t: 2.6, wait: false },
  { cam: [3.0, 1.25, 2.2], look: [-0.3, 0.4, -1.6] },
  { cam: [2.1, 0.8, 1.2], look: [-0.4, 0.35, -1.6], t: 4.5, ease: 'inOut' },
  { sfx: 'whimper' },
  Shiver('weed', 1.2),
  // GB comes over, sits by him
  { par: [
    { move: 'gb', x: -1.45, z: -0.85, t: 2.6, anim: 'Walk', ts: 0.6, after: 'Idle_2_HeadLow' },
    { cam: [-0.2, 0.55, 0.9], look: [-1.0, 0.45, -1.2], t: 2.6, ease: 'inOut' },
  ] },
  { expr: 'gb', name: 'sad' },
  A('gb', { head: 0.3, look: 'weed', t: 0.8 }),
  { say: 'p_gb_comfort' },
  { say: 'p_gb_noname' },
  // the pup lifts his head, shakes it: no name
  A('weed', { head: 0.0, ears: 0.5, look: 'gb', t: 0.6 }),
  { wait: 0.5 },
  A('weed', { yaw: 0.35, t: 0.2 }), { wait: 0.25 }, A('weed', { yaw: -0.35, t: 0.2 }), { wait: 0.25 }, A('weed', { yaw: 0, t: 0.3 }),
  Mark('sk_name'),
  // INSERT – the little weed in the crack of the stone, the sunbeam on it
  { expr: 'gb', name: null },
  A('gb', { head: 0.15, look: null, yaw: 0.4, t: 0.6 }),
  { cam: [1.75, 0.24, 0.35], look: [1.05, 0.2, -0.5] },
  { cam: [1.5, 0.18, 0.05], look: [1.05, 0.24, -0.5], t: 3.0, ease: 'inOut' },
  { say: 'p_gb_weed' },
  { music: 'dawn', fade: 3 },
  { cam: [-0.35, 0.72, 0.15], look: [-1.1, 0.72, -0.85], t: 0.9, ease: 'out' },
  A('gb', { head: 0, look: 'weed', yaw: 0, t: 0.6 }),
  { expr: 'gb', name: 'happy' },
  { say: 'p_gb_name' },
  // the pup stands up: chin up, ears up
  { fn: () => cast.weed.play('Idle', { fade: 0.9 }) },
  A('weed', { lie: 0, head: -0.25, ears: 0, tail: 0, breath: 0.4, look: 'gb', t: 1.0 }),
  { cam: [-0.05, 0.3, -0.55], look: [-0.6, 0.38, -1.45], t: 1.2, ease: 'out' },
  { say: 'p_weed_name' },
  { caption: '<b>WEED</b>Small, but never uprooted.', t: 3.4, wait: false },
  { cam: [0.6, 1.3, 3.4], look: [-0.9, 0.5, -1.2], t: 2.6 },
  { expr: 'gb', name: null },
  Mark('sk_leave'),
  A('smith', { head: 0.0, ears: 0, look: 'weed', t: 0.8 }),
  { move: 'smith', x: -1.6, z: -1.6, t: 1.6, anim: 'Walk', ts: 0.6, after: 'Idle' },
  { say: 'p_smith_go' },
  // they set off; at the edge of the wood the pup stops and looks back at her one last time
  A('weed', { head: 0, look: null, t: 0.5 }),
  { par: [
    { move: 'weed', x: 2.6, z: -0.6, t: 3.0, anim: 'Walk', ts: 0.8, after: 'Idle' },
    { move: 'smith', x: 1.8, z: -1.2, t: 3.4, anim: 'Walk', ts: 0.7, after: 'Idle' },
    { cam: [4.6, 0.55, 0.6], look: [1.8, 0.4, -1.0], t: 3.0, ease: 'inOut' },
  ] },
  { face: 'weed', dir: -1 },
  A('weed', { head: 0.15, ears: 0.6, look: 'sakura', t: 0.6 }),
  { cam: [3.5, 0.38, -0.3], look: [0.4, 0.35, -1.9] },
  { wait: 2.0 },
  A('weed', { head: -0.1, ears: 0, look: null, t: 0.5 }),
  { face: 'weed', dir: 1 },
  { move: 'weed', x: 6.5, z: -0.3, t: 2.2, anim: 'Gallop', ts: 0.9 },
  { anim: 'gb', name: 'Bark', loop: false },
  { say: 'p_gb_coming' },
  { place: 'sasuke', x: -6, z: -2, face: 1, anim: 'Idle' },
  { cam: [-2.4, 0.9, 3.4], look: [-4.6, 0.5, -1.6], t: 0.8 },
  { say: 'p_sasuke_bye' },
  { move: 'sasuke', x: -12, t: 1.6, anim: 'Gallop' },
  { hide: 'sasuke' },
  ];
};

// ------------------------------------------------------------------------------------------------
// 5. THE ROAD → JŌSHŪ: a human chases a golden pup (leads into the second run)
export const journey = ({ cast, P }) => [
  { fn: () => P.hideAll() },
  { mood: 'night', t: 0.1 },
  { amb: 'battle' },
  { place: 'weed', x: -8, z: 0.2, face: 1, anim: 'Walk' },
  { place: 'smith', x: -9.6, z: -0.6, face: 1, anim: 'Walk', ts: 0.8 },
  { place: 'gb', x: -10.8, z: 0.4, face: 1, anim: 'Walk' },
  { cam: [-2, 6.5, 16], look: [4, 6, -60] },
  { par: [
    { cam: [-4, 1.2, 6.5], look: [-6, 0.6, 0], t: 5, ease: 'inOut' },
    { move: 'weed', x: -3.5, t: 5, anim: 'Walk' },
    { move: 'smith', x: -5.2, t: 5, anim: 'Walk', ts: 0.8 },
    { move: 'gb', x: -6.4, t: 5, anim: 'Walk' },
    { say: 'p_road_1' },
  ] },
  { fn: () => { P.show('town', 0, -8); } },
  { caption: '<b>Jōshū</b>Weeks later', t: 3, wait: false },
  { say: 'p_road_2' },
  { place: 'mel', x: 6, z: -1.5, face: -1, anim: 'Gallop', ts: 1.3 },
  { cam: [-1.0, 0.7, 4.0], look: [2.6, 0.5, -1], t: 0 },
  { move: 'mel', x: 0.2, z: -0.4, t: 1.4, anim: 'Gallop', ts: 1.3, after: 'Idle' },
  { sfx: 'bark' }, { shake: 0.2 },
  { fn: () => P.show('netThrow', 3.2, -0.4) }, { sfx: 'whoosh' },
  { expr: 'weed', name: 'determined' },
  { dolly: 'weed', dist: 1.7, side: 0.5, t: 0.3 },
  { say: 'p_weed_follow_me' },
  { expr: 'weed', name: null },
];

// after the town run: Mel won't say thanks; Hook tells about Blue
export const hook = ({ cast, P }) => [
  { fn: () => { P.hideAll(); P.show('town', 0, -8); P.show('hookKennel', -3.0, -1.6); } },
  { music: null, fade: 1.2 },
  { place: 'weed', x: -0.4, z: 0.3, face: 1, anim: 'Idle' },
  { place: 'mel', x: 1.4, z: 0.1, face: -1, anim: 'Idle' },
  { place: 'gb', x: -2.0, z: 0.8, face: 1, anim: 'Idle' },
  { place: 'smith', x: -1.6, z: -0.4, face: 1, anim: 'Idle_2' },
  { place: 'hook', x: -3.0, z: -0.6, face: 1, anim: 'Idle' },
  { cam: [0.6, 0.55, 2.6], look: [0.6, 0.4, 0] },
  { anim: 'mel', name: 'Idle_2_HeadLow' },
  { say: 'p_mel_nothanks' },
  { move: 'mel', x: 9, z: -2.5, t: 2, anim: 'Gallop' },
  { hide: 'mel' },
  { dolly: 'gb', dist: 1.5, side: 0.6, t: 0.4 },
  { say: 'p_gb_rude' },
  { music: 'sad', fade: 2 },
  { cam: [-2.0, 0.8, 1.6], look: [-3.0, 0.7, -0.6], t: 1.2 },
  { anim: 'hook', name: 'Idle_2_HeadLow' },
  { say: 'p_hook_warn' },
  { dolly: 'weed', dist: 1.6, side: -0.5, t: 0.4 },
  { expr: 'weed', name: 'determined' },
  { say: 'p_weed_save' },
  { move: 'weed', x: 7, z: -1, t: 1.4, anim: 'Gallop', ts: 1.2 },
  { expr: 'weed', name: null },
  { dolly: 'smith', dist: 1.4, side: 0.6, t: 0.3 },
  { say: 'p_smith_wait' },
];

// ------------------------------------------------------------------------------------------------
// 6. BLUE: the mountain forest above the truck road
export const blueIntro = ({ cast, P }) => [
  { fn: () => { P.hideAll(); P.show('road', 0, -4.2); P.show('netFence', 0, -2.6); } },
  { mood: 'night', t: 0.1 },
  { amb: 'battle' },
  { place: 'blue', x: 3.2, z: 0, face: -1, anim: 'Idle' },
  { place: 'mel', x: 4.6, z: -1.0, face: -1, anim: 'Idle' },
  { place: 'weed', x: -5, z: 0, face: 1, anim: 'Gallop' },
  { caption: '<b>The forest above the truck road</b>Jōshū', t: 3, wait: false },
  { cam: [-1.0, 1.1, 6.0], look: [2.0, 0.8, -1.5] },
  { move: 'weed', x: -2.6, t: 1.0, anim: 'Gallop', after: 'Idle' },
  { dolly: 'blue', dist: 1.4, side: 0.5, t: 0.6, h: -0.1 },
  { say: 'p_blue_taunt' },
  { music: 'battle', fade: 0.8 },
];
export const blueMel = ({ cast }) => [
  { place: 'mel', x: 4.6, z: -0.6, face: -1, anim: 'Idle' },
  { dolly: 'blue', dist: 1.5, side: 0.6, t: 0.3 },
  { anim: 'blue', name: 'Bark', loop: false }, { sfx: 'bark' },
  { say: 'p_blue_mel' },
  { cam: [2.4, 0.5, 2.6], look: [4.2, 0.4, -0.5], t: 0.4 },
  { anim: 'mel', name: 'Idle_2_HeadLow' }, { wait: 0.6 },
];
export const blueHook = ({ cast }) => [
  { music: null, fade: 0.4 },
  { place: 'hook', x: -9, z: -0.8, face: 1, anim: 'Gallop', ts: 1.3 },
  { place: 'smith', x: -10.5, z: 0.4, face: 1, anim: 'Gallop' },
  { cam: [-3.5, 0.8, 4.4], look: [-6.4, 0.8, -0.4] },
  { par: [
    { move: 'hook', x: -3.2, t: 1.2, anim: 'Gallop', ts: 1.3, after: 'Idle' },
    { move: 'smith', x: -4.6, t: 1.3, anim: 'Gallop', after: 'Idle' },
  ] },
  { anim: 'hook', name: 'Bark', loop: false }, { sfx: 'bark' }, { shake: 0.3 },
  { say: 'p_hook_arrive' },
  { dolly: 'blue', dist: 1.4, side: 0.6, t: 0.3 },
  { say: 'p_blue_flee' },
  // Blue bolts, over the net fence onto the road
  { move: 'blue', x: 6.5, z: -1.2, t: 0.8, anim: 'Gallop', ts: 1.4 },
  { anim: 'blue', name: 'Gallop_Jump', loop: false }, { sfx: 'whoosh' },
  { move: 'blue', x: 7.5, z: -3.0, y: 1.2, t: 0.35, ease: 'out' },
  { move: 'blue', x: 8.0, z: -4.2, y: 0, t: 0.3, ease: 'in' }, { sfx: 'land' },
  { anim: 'blue', name: 'Gallop', ts: 1.4 },
];

// ------------------------------------------------------------------------------------------------
// 7. THE TRUCK (fn-steps drive the trucks; the leap over the fence is a player action in level1.js)
// headlights wash a dog in warm white as the truck comes (emissive ramp; cleared after the cut)
function headlightWash(d, secs, peak) {
  const o = { k: 0 }, tok = d._wash = {};
  tween(o, { k: 1 }, secs, { ease: 'in', onUpdate: () => { if (d._wash === tok) d.setTint(0xfff0c8, o.k * peak); } });
}
const clearWash = (...ds) => { for (const d of ds) { d._wash = null; d.setTint(0x000000, 0); } };
export const truckHit = ({ cast, P, E, FX, sfx, truckRun, horn }) => [
  From(['tr_lights', 'tr_hit']),
  Mood('autumn_dusk', 2.5), GradeNow({ exposure: 0.95, sat: 0.95, vig: 0.12, t: 0 }),
  { amb: 'dusk' },
  { surface: 'step' },
  { place: 'weed', x: -3.6, z: -1.4, face: 1, anim: 'Gallop' },
  { place: 'hook', x: -5.4, z: -1.15, face: 1, anim: 'Gallop' },
  { place: 'smith', x: -6.6, z: -0.8, face: 1, anim: 'Gallop' },
  { place: 'gb', x: -7.6, z: -1.0, face: 1, anim: 'Gallop' },
  { place: 'mel', x: -4.6, z: -0.6, face: 1, anim: 'Idle' },
  { place: 'blue', x: -1.4, z: -4.2, face: 1, anim: 'Walk', ts: 0.7 },
  // 1. LOW, BEHIND THE NET FENCE: the pack skids to a halt; Blue is already out on the asphalt
  { cam: [-2.4, 0.42, 0.6], look: [-0.6, 0.6, -4.0] },
  { par: [
    { move: 'weed', x: 0.6, t: 1.6, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'hook', x: -0.8, t: 1.7, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'smith', x: -1.9, t: 1.8, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'gb', x: -2.9, t: 1.9, anim: 'Gallop', after: 'Idle', ease: 'out' },
    { move: 'blue', x: 0.6, t: 2.4, anim: 'Walk', ts: 0.7 },
    { cam: [-0.9, 0.5, 0.9], look: [0.4, 0.6, -4.0], t: 2.0, ease: 'out' },
  ] },
  { sfx: 'tired' }, { sfx: 'claw' },
  A('weed', { head: -0.05, ears: 0, look: 'blue', t: 0.4 }),
  // 2. Blue stops in the middle of the road and looks back at them – a sneer
  { anim: 'blue', name: 'Idle' },
  { cam: [2.2, 0.55, -2.9], look: [0.6, 0.8, -4.2], t: 0.01 },
  A('blue', { head: -0.15, look: 'weed', t: 0.5 }),
  { wait: 1.0 },
  Mark('tr_lights'),
  // 3. DOWN THE ROAD: two headlights round the bend. The horn.
  { fn: () => { truckRun(0, { from: -24, to: -8.5, t: 2.6, honk: 1.1, keep: true }); headlightWash(cast.blue, 2.6, 0.65); } },
  { cam: [2.9, 0.7, -3.0], look: [0.0, 0.85, -4.4] },
  { fn: () => { glare(2.4, 0.85); } },
  { wait: 1.1 },
  // 4. BLUE turns into the light – ears flat, frozen
  A('blue', { head: 0, ears: 1, look: new E.V3(-30, 1, -4.6), t: 0.3 }),
  { cam: [1.6, 0.85, -3.4], look: [0.55, 0.85, -4.2], t: 0.01 },
  { sfx: 'heartbeat' },
  { slow: 0.35 },
  { wait: 0.6 },
  // 5. Weed behind the wire: the pup sees it coming
  { cam: [0.95, 0.4, -2.3], look: [0.6, 0.4, -1.4] },
  A('weed', { head: -0.1, ears: 0.3, look: 'blue', t: 0.2 }),
  { wait: 0.6 },
  Mark('tr_hit'),
  // 6. IMPACT – a white cut, no blood: the truck passes, Blue is gone from the road's centre
  { slow: 1 },
  { fn: () => { truckRun(0, { from: -8.5, to: 40, t: 0.7 }); } },
  { cam: [3.8, 0.9, -1.6], look: [0.6, 0.6, -4.2] },
  { wait: 0.16 },
  { fx: 'flash', color: '#ffffff', t: 0.7, peak: 1 }, { shake: 0.9 }, { sfx: 'cineBoom' }, { sfx: 'bodyfall' },
  { music: null, fade: 0.2 },
  { place: 'blue', x: 1.9, z: -4.0, face: -1, anim: 'LieDown' },
  { fn: () => clearWash(cast.blue) },
  A('blue', { head: 0.2, ears: 0.8, tail: 1, look: null, breath: 1.1, t: 0.05 }),
  { wait: 1.0 },
  // 7. SILENCE – high angle: the empty road, the tail lights going away, Blue in the dust
  { cam: [3.4, 3.4, 0.4], look: [1.6, 0.2, -4.0] },
  GradeNow({ exposure: 0.85, sat: 0.7, vig: 0.25, t: 1.5 }),
  { cam: [3.0, 2.9, 0.0], look: [1.7, 0.2, -4.0], t: 2.2, ease: 'inOut' },
  // 8. the pup's face
  { cam: [1.15, 0.38, -0.85], look: [0.62, 0.38, -1.4] },
  A('weed', { head: 0, ears: 0.6, look: 'blue', t: 0.3 }),
  Shiver('weed', 0.8),
  { sfx: 'heartbeat' },
  { wait: 0.8 },
];
export const truckSave = ({ cast, P, E, FX, sfx, truckRun }) => [
  From(['ts_pull', 'ts_throw']),
  Mood('autumn_dusk', 0.1), GradeNow({ exposure: 0.88, sat: 0.75, vig: 0.22, t: 0 }),
  { surface: 'stepRock' },
  { place: 'blue', x: 1.9, z: -4.0, face: -1, anim: 'LieDown' },
  A('blue', { head: 0.3, ears: 0.8, tail: 1, look: null, breath: 1.1, t: 0.05 }),
  // 1. Weed runs to him across the asphalt
  { par: [
    { move: 'weed', x: 1.35, z: -3.75, t: 0.7, anim: 'Gallop', ts: 1.2, ease: 'inOut', after: 'Idle' },
    { cam: [3.4, 0.45, -2.0], look: [1.6, 0.35, -4.0], t: 0.7 },
  ] },
  Mark('ts_pull'),
  // 2. he bites the scruff and pulls – the big dog barely moves
  { fn: () => { cast.weed.face(1); } },
  A('weed', { head: 0.35, look: 'blue', t: 0.2 }),
  { anim: 'weed', name: 'Attack', loop: false }, { sfx: 'claw' },
  { move: 'weed', x: 1.15, z: -3.7, t: 0.45, faceMove: false, ease: 'inOut' }, { sfx: 'fur' },
  { move: 'weed', x: 1.3, z: -3.75, t: 0.3, faceMove: false },
  { anim: 'weed', name: 'Attack', loop: false }, { sfx: 'claw' },
  { move: 'weed', x: 1.1, z: -3.7, t: 0.45, faceMove: false, ease: 'inOut' },
  // 3. the second truck – headlights growing behind them
  { fn: () => { truckRun(1, { from: -24, to: -8, t: 2.6, honk: 1.4, keep: true }); headlightWash(cast.blue, 2.6, 0.5); headlightWash(cast.weed, 2.6, 0.5); glare(2.8, 0.9); } },
  { cam: [3.4, 0.45, -3.0], look: [1.2, 0.4, -4.0] },
  { wait: 0.7 },
  { cam: [-1.6, 0.85, 0.3], look: [-1.9, 0.75, -1.0] },
  A('smith', { head: -0.1, ears: 0, look: 'weed', t: 0.2 }),
  { say: 'p_smith_no' },
  Mark('ts_throw'),
  // 4. BLUE opens his eyes: the last of his strength. Slow motion.
  { cam: [2.5, 0.45, -3.3], look: [1.6, 0.4, -4.05] },
  A('blue', { head: -0.1, ears: 0, look: 'weed', t: 0.25 }),
  { slow: 0.25 }, { sfx: 'slowmo' },
  { say: 'p_blue_go' },
  // he heaves the pup off the road: head under the pup's chest, a toss toward the fence (camera follows the pup)
  { anim: 'blue', name: 'Attack', loop: false }, { sfx: 'whoosh' },
  { fn: () => { cast.weed.play('Idle_HitReact2', { loop: false }); } },
  { par: [
    { move: 'weed', x: 2.3, z: -2.95, y: 0.75, t: 0.42, ease: 'out', real: false, faceMove: false },
    { cam: [4.6, 0.9, -6.2], look: [2.2, 0.6, -3.2], t: 0.55 },
  ] },
  // 5. WHITE – the truck goes by between them
  { fn: () => { truckRun(1, { from: -8, to: 40, t: 0.6 }); } },
  { wait: 0.08 },
  { fx: 'flash', color: '#ffffff', t: 1.0, peak: 1 }, { sfx: 'cineBoom' },
  { slow: 1 },
  { shake: 0.7 }, { sfx: 'whoosh' },
  { music: null },
  { fn: () => { cast.blue.root.position.set(4.9, 0, -4.6); cast.blue.play('LieDown'); clearWash(cast.blue, cast.weed); } },
  A('blue', { head: 0.5, ears: 0.8, tail: 1, breath: 0.7, look: null, t: 0.05 }),
  // 6. the pup lands by the fence and rolls
  { move: 'weed', x: 2.5, y: 0, z: -2.85, t: 0.22, ease: 'in', faceMove: false },
  { sfx: 'land' }, { sfx: 'bodyfall' }, { fx: 'dust', at: [2.5, 0.15, -2.85] },
  { fn: () => { cast.weed.play('LieDown'); } },
  { cam: [3.5, 0.35, -4.1], look: [2.5, 0.25, -2.85] },
  { wait: 1.6 },
];
export const blueDeath = ({ cast, P, E, FX, sfx }) => [
  From(['bd_last', 'bd_spirit', 'bd_others']),
  Mood('autumn_dusk', 0.1), GradeNow({ exposure: 0.85, sat: 0.65, vig: 0.28, t: 0 }),
  { amb: 'sad' },
  { surface: 'stepRock' },
  { place: 'blue', x: 4.9, z: -4.6, face: -1, anim: 'LieDown' },
  { fn: () => clearWash(cast.blue, cast.weed) },
  A('blue', { head: 0.5, ears: 0.8, tail: 1, breath: 0.7, look: null, t: 0.05 }),
  // 1. HIGH WIDE: the empty road at sunset; the pup gets up and walks to him
  { cam: [7.4, 2.6, 0.4], look: [3.8, 0.3, -3.8] },
  { fn: () => { cast.weed.play('Idle', { fade: 0.6 }); } },
  A('weed', { head: 0.3, ears: 0.7, tail: 0.8, t: 0.6 }),
  { wait: 0.8 },
  { music: 'smith2', fade: 4 },
  { par: [
    { move: 'weed', x: 3.85, z: -4.3, t: 3.2, anim: 'Walk', ts: 0.5, after: 'Idle' },
    { cam: [6.4, 1.5, -1.4], look: [4.4, 0.3, -4.3], t: 3.2, ease: 'inOut' },
  ] },
  Mark('bd_last'),
  // 2. LOW CLOSE: Blue's face on the asphalt; the pup's paws come into frame. He opens his eyes.
  { cam: [4.05, 0.4, -5.4], look: [4.35, 0.32, -4.55] },
  A('weed', { head: 0.45, ears: 0.6, look: 'blue', t: 0.6 }),
  A('blue', { head: 0.25, look: 'weed', t: 1.2 }),
  { sfx: 'breath' },
  { wait: 0.6 },
  { say: 'p_blue_last' },
  // his head sinks; the breathing stops. Silence.
  { music: null, fade: 2 },
  A('blue', { head: 0.9, breath: 0, look: null, t: 2.6 }),
  { wait: 2.2 },
  { sfx: 'heartbeat' },
  // 3. WEED – he does not understand why
  { cam: [4.55, 0.4, -3.7], look: [3.85, 0.38, -4.3] },
  A('weed', { head: 0.2, ears: 1, tail: 1, breath: 1.1, look: 'blue', t: 0.6 }),
  Shiver('weed', 2.5),
  { say: 'p_weed_why' },
  { sfx: 'whimper' },
  Mark('bd_spirit'),
  // 4. his light rises into the dusk sky; tilt up
  { music: 'smith2', fade: 2.5 },
  { cam: [6.3, 0.9, -1.5], look: [4.7, 0.9, -4.5] },
  { fn: () => { FX.spiritLight(cast.blue.root.position.clone().add(new E.V3(0, 0.4, 0)), 0xcfe4ff, 7); sfx.spirit(); } },
  GradeNow({ exposure: 0.95, sat: 0.85, vig: 0.2, bloom: 0.25, t: 3 }),
  { cam: [6.6, 1.4, -0.9], look: [4.8, 3.2, -4.8], t: 5.5, ease: 'inOut' },
  Mark('bd_others'),
  // 5. the others have come round the fence: heads low
  { place: 'smith', x: 2.8, z: -3.6, face: 1, anim: 'Idle' },
  { place: 'hook', x: 6.2, z: -3.7, face: -1, anim: 'Idle' },
  { place: 'gb', x: 2.2, z: -2.9, face: 1, anim: 'Idle' },
  { place: 'mel', x: 3.4, z: -2.7, face: 1, anim: 'Idle' },
  A('smith', { head: 0.6, ears: 0.8, tail: 0.6, t: 0.05 }),
  A('hook', { head: 0.7, ears: 1, tail: 1, t: 0.05 }),
  A('gb', { head: 0.5, ears: 0.8, tail: 0.8, t: 0.05 }), { expr: 'gb', name: 'sad' },
  A('mel', { head: 0.4, ears: 0.6, tail: 0.8, look: 'weed', t: 0.05 }),
  A('weed', { head: 0.6, ears: 1, tail: 1, look: null, t: 0.05 }),
  { cam: [4.3, 2.2, 1.6], look: [4.1, 0.5, -4.0] },
  { cam: [4.2, 1.9, 1.0], look: [4.1, 0.5, -4.0], t: 3, ease: 'inOut' },
  { cam: [2.0, 0.75, -2.3], look: [2.9, 0.65, -3.65] },
  A('smith', { head: 0.2, look: 'weed', t: 0.8 }),
  { say: 'p_smith_blue' },
  // 6. Hook stays: he lies down beside his old enemy
  { cam: [7.2, 0.6, -3.0], look: [6.0, 0.6, -3.8] },
  A('hook', { head: 0.3, look: 'blue', t: 0.6 }),
  { say: 'p_hook_stay' },
  A('hook', { lie: 1, head: 0.6, look: null, t: 1.6 }),
  // 7. WIDE: silhouettes at the roadside, the sun going down behind them
  { cam: [4.4, 0.7, 3.6], look: [4.2, 1.2, -6] },
  { cam: [4.4, 0.9, 2.6], look: [4.2, 1.4, -6], t: 4, ease: 'inOut' },
  { expr: 'gb', name: null },
];
// ------------------------------------------------------------------------------------------------
// 8. ENDING: Mel follows; the long walk toward Ōu at dusk
export const ending = ({ cast, P }) => [
  From(['end_walk']),
  { fn: () => P.hideAll() },
  Mood('memorial', 2), GradeNow({ exposure: 1.0, sat: 1.0, vig: 0.15, bloom: 0.15, t: 0 }),
  { amb: 'dusk' },
  { surface: 'step' },
  { place: 'weed', x: -1, z: 0.3, face: 1, anim: 'Walk', ts: 0.8 },
  { place: 'smith', x: -2.6, z: -0.4, face: 1, anim: 'Walk', ts: 0.7 },
  { place: 'gb', x: -3.6, z: 0.6, face: 1, anim: 'Walk', ts: 0.8 },
  { place: 'mel', x: -9, z: 0.4, face: 1, anim: 'Gallop' },
  A('weed', { head: 0.35, ears: 0.6, tail: 0.6, t: 0.05 }), A('smith', { head: 0.3, t: 0.05 }), A('gb', { head: 0.25, t: 0.05 }),
  // 1. LOW, sunset behind: three small shapes walking away from the road, heads low – no music yet
  { cam: [-3.4, 0.35, 3.6], look: [-1.6, 0.7, -0.6] },
  { par: [
    { move: 'weed', x: 0.4, t: 2.6, anim: 'Walk', ts: 0.7, after: 'Idle' },
    { move: 'smith', x: -1.2, t: 2.6, anim: 'Walk', ts: 0.6, after: 'Idle' },
    { move: 'gb', x: -2.2, t: 2.6, anim: 'Walk', ts: 0.7, after: 'Idle' },
    { cam: [-2.4, 0.4, 3.2], look: [-0.6, 0.6, -0.4], t: 2.6, ease: 'inOut' },
  ] },
  // 2. footsteps behind them: Mel has followed (CU Weed's ear turns first)
  { move: 'mel', x: -4.2, t: 1.8, anim: 'Gallop', ts: 0.9, after: 'Idle' },
  { cam: [1.3, 0.42, 1.5], look: [0.3, 0.42, 0.2] },
  A('weed', { head: 0.0, ears: 0, look: 'mel', t: 0.3 }),
  { fn: () => cast.weed.face(-1) },
  { wait: 0.4 },
  { cam: [-2.6, 0.45, 2.0], look: [-4.1, 0.4, 0.3] },
  A('mel', { head: 0.4, ears: 0.6, tail: 0.5, look: 'weed', t: 0.4 }),
  { say: 'p_mel_follow' },
  { dolly: 'weed', dist: 1.6, side: -0.6, t: 0.4 },
  A('weed', { head: -0.1, ears: 0, tail: 0, look: 'mel', t: 0.4 }), A('mel', { head: 0, tail: 0, t: 0.6 }),
  { say: 'p_weed_yes' },
  Nod('weed', 0.25),
  { music: 'dawn', fade: 3 },
  A('smith', { head: 0, look: 'weed', t: 0.6 }), A('gb', { head: 0, look: 'mel', t: 0.6 }),
  Mark('end_walk'),
  // 3. one look back at the road where Blue lies (OTS), then north
  { cam: [1.4, 1.5, 1.9], look: [-8, 0.3, -3] },
  A('weed', { head: 0.2, look: new THREE.Vector3(-12, 0.4, -4), t: 0.6 }),
  { wait: 1.4 },
  A('weed', { head: -0.15, look: null, t: 0.5 }), A('smith', { look: null, t: 0.5 }), A('gb', { look: null, t: 0.5 }), A('mel', { look: null, t: 0.5 }),
  { fn: () => cast.weed.face(1) },
  { cam: [-1.5, 0.9, 6.2], look: [1, 0.8, 0] },
  // 4. the long walk toward Ōu: crane up and away, the four of them small against the mountains
  { par: [
    { move: 'weed', x: 14, t: 10, anim: 'Walk', ts: 0.8, ease: 'linear' },
    { move: 'mel', x: 13, z: 0.9, t: 10, anim: 'Walk', ts: 0.8, ease: 'linear' },
    { move: 'smith', x: 12.2, t: 10, anim: 'Walk', ts: 0.7, ease: 'linear' },
    { move: 'gb', x: 11.4, t: 10, anim: 'Walk', ts: 0.8, ease: 'linear' },
    { cam: [2, 2.4, 9.5], look: [10, 3.5, -40], t: 10, ease: 'inOut' },
    { fn: async ({ say }) => { await say('p_end_1'); } },
  ] },
  { say: 'p_end_2' },
  { caption: '<b>Ōu</b>is waiting', t: 3, wait: false },
  { wait: 1.5 },
  { fx: 'flash', color: '#000000', t: 2.4, peak: 1 },
  { wait: 1.2 },
];
