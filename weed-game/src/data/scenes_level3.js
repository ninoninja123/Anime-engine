// LEVEL 3 "The Alps Trap – John's Last Stand": scene scripts (data). Step format: src/scenes.js. Lines: lines.js (l3_*).
// Canon + sources: docs/weed-game/level3-research.md (anime ep. 6–10). Storyboard: docs/weed-game/level3-design.md §4.
// Editing style (arrows-reference-shotlist.md): hard cuts, the framing changes on almost every beat (wide ↔ extreme
// close-up, low angle for threat, high angle for loss, dutch tilt), flash cuts inside impacts, then a held close-up.
// PEGI 12: no blood. Blows that would wound are cut away (flash cuts, reaction shots, silhouettes); the branch is a dark
// silhouette only. Dialogue is original. Each export: (ctx) -> steps; ctx from src/level3.js.
import * as THREE from 'three';
import { A, Nod, Shiver } from '../shared/acting.js';
import { Hush, Grade, GradeNow, Mood, Drift } from '../shared/cine.js';

export function linesOf(steps, out = []) {
  for (const s of steps) { if (s.say) out.push(s.say); if (s.bark) out.push(s.bark); if (s.par) linesOf(s.par, out); }
  return out;
}
// ---- small helpers
const cut = (pos, look) => ({ cam: pos, look, t: 0 });
const pan = (pos, look, t, ease = 'inOut') => ({ cam: pos, look, t, ease });
const flashCut = (pos, look, secs = 0.14) => [{ cam: pos, look, t: 0 }, { wait: secs }];
const roll = (r) => ({ fn: ({ E }) => { E.camRoll = r; } });
const black = (t = 1.2) => ({ fn: ({ FX }) => FX.flash('#000000', t, 1) });
const soldiers = (list) => list.map(([id, x, z, face = -1, anim = 'Idle']) => ({ place: id, x, z, face, anim }));
const hideAll = (ids) => ids.map(id => ({ hide: id }));
const S8 = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

// ================================================================================================
// 0. TRAP (ep. 6): blizzard, Reika's cabin, Hōgen's army closes in, Gin sends Akame to Ōu
export const trap = ({ cast, P, E }) => [
  { music: null, fade: 1 }, { amb: 'gorge' }, Mood('night', 0.1), Drift({ push: 0.03, truck: 0.015 }),
  { fn: () => { P.show('cabin', 4.4, -3.8); } },
  { place: 'reika', x: -1.2, z: -1.3, face: 1, anim: 'Walk' },
  { place: 'gin', x: -3.0, z: -0.5, face: 1, anim: 'Walk' },
  { place: 'john', x: -4.4, z: 0.4, face: 1, anim: 'Walk' },
  { place: 'akame', x: -5.6, z: -1.0, face: 1, anim: 'Walk' },
  // 1. wide high: the blizzard over the mountains
  cut([-12, 7.5, 17], [3, 1.5, -6]),
  { sfx: 'levelStart' }, { caption: '<b>LEVEL 3</b>The Alps Trap', t: 4, wait: false },
  { par: [
    { move: 'reika', x: 1.6, t: 6, anim: 'Walk', ease: 'linear' },
    { move: 'gin', x: 0.2, t: 6, anim: 'Walk', ease: 'linear' },
    { move: 'john', x: -1.2, t: 6, anim: 'Walk', ease: 'linear', ts: 0.85 },
    { move: 'akame', x: -2.4, t: 6, anim: 'Walk', ease: 'linear' },
    pan([-6, 3.2, 10], [0.5, 0.8, -1.5], 6),
    { say: 'l3_nar_1' },
  ] },
  // 2. low tracking beside the three old friends
  cut([2.6, 0.45, 3.4], [-1.2, 0.75, -0.4]),
  { par: [pan([1.6, 0.6, 3.0], [-1.6, 0.8, -0.4], 3.5), { say: 'l3_nar_2' }] },
  { fn: () => { for (const k of ['reika', 'gin', 'john', 'akame']) cast[k].play('Idle'); } },
  // 3. over Gin's shoulder: the warm window
  cut([-1.0, 1.15, 1.6], [3.8, 1.0, -3.2]),
  { say: 'l3_reika_shelter' },
  cut([1.9, 0.9, 1.9], [0.2, 0.85, -0.5]), { anim: 'gin', name: 'Idle_2_HeadLow' },
  { say: 'l3_gin_thanks' },
  // 4. Akame's ears: a sound in the storm
  { music: null }, Hush(0.1, 4),
  cut([-1.6, 1.05, 0.2], [-2.4, 0.95, -1.0]), A('akame', { head: -0.15, ears: -0.4, look: new THREE.Vector3(8, 1, 0) }),
  { sfx: 'growl' }, { wait: 0.6 },
  { fn: () => cast.akame.face(1) },
  // 5. the army: red collars in an arc
  ...soldiers([['s1', 6.2, -2.6], ['s2', 6.6, -1.4], ['s3', 6.4, 1.7], ['s4', 8.0, -3.0], ['s5', 8.6, -1.6], ['s6', 8.6, 2.3], ['s7', 9.8, -2.6], ['s8', 9.8, 1.9]]),
  cut([0.8, 0.9, 4.6], [7.4, 0.9, -0.4]),
  { sfx: 'braam' }, { shake: 0.15 },
  { say: 'l3_akame_eyes' },
  { fn: () => { for (const k of ['gin', 'john', 'reika']) cast[k].face(1); } },
  { mood: 'storm', t: 3 }, GradeNow({ exposure: 1.15, t: 2 }), { music: 'battle', fade: 2 },
  // 6. Hōgen walks through the line (low, ground level)
  { place: 'hogen', x: 12.5, z: 0.2, face: -1, anim: 'Walk' },
  cut([4.0, 0.35, 3.8], [9.5, 1.2, 0.2]),
  { sfx: 'bossAppear' },
  { par: [{ move: 'hogen', x: 6.4, t: 3.4, anim: 'Walk', ts: 0.7, after: 'Idle', ease: 'linear' }, pan([3.4, 0.4, 3.4], [6.4, 1.4, 0.2], 3.4)] },
  // 7. ECU Hōgen's eye → John → Hōgen
  cut([3.9, 1.55, 1.1], [5.2, 1.55, 0.2]),
  { say: 'l3_hogen_intro' },
  { place: 'john', x: 1.6, z: 0.3, face: 1, anim: 'Bark', loop: false },
  cut([2.9, 0.75, 1.3], [1.7, 0.85, 0.3]), roll(0.06),
  { sfx: 'bark' }, { say: 'l3_john_name' }, roll(0),
  cut([3.6, 0.5, 3.2], [6.4, 1.5, 0.2]),
  { say: 'l3_hogen_name' },
  { sfx: 'growl' },
  // 8. Gin decides (dutch close-up), the order to Akame
  cut([1.0, 1.0, 1.2], [0.2, 1.0, -0.5]), roll(-0.1),
  { say: 'l3_gin_akame' }, roll(0),
  cut([-1.4, 0.75, 0.9], [-2.4, 0.85, -1.0]), A('akame', { head: 0.35, ears: 0.8, look: 'gin' }),
  { say: 'l3_akame_but' },
  { wait: 0.4 }, Nod('akame', 0.3), { wait: 0.5 },
  A('akame', null),
  // 9. John steps up beside him
  { move: 'john', x: 0.6, z: -0.4, t: 0.5, anim: 'Gallop', after: 'Idle' },
  cut([-0.6, 0.45, 2.4], [1.0, 0.8, -0.4]),
  { say: 'l3_john_cover' },
];

// ================================================================================================
// 1b. after "Cover Akame!": the hostage – Missile brings Reika, Gin and John surrender (ep. 6 end)
export const hostage = ({ cast, P }) => [
  Mood('storm', 0.1), { amb: 'gorge' }, GradeNow({ exposure: 1.15, t: 0 }),
  { fn: () => { P.show('cabin', 4.4, -3.8); } },
  { place: 'john', x: -0.5, z: 0.2, face: 1, anim: 'Idle_2_HeadLow' },
  { place: 'gin', x: -1.6, z: 0.0, face: -1, anim: 'Idle' },
  ...soldiers([['s1', 2.2, -1.6], ['s2', 2.6, 1.4], ['s3', -4.4, -1.2, 1], ['s4', -4.0, 1.4, 1], ['s5', 3.6, 0.0], ['s6', 0.0, -3.4], ['s7', -1.8, -3.4, 1]]),
  { place: 's8', x: 1.2, z: 0.6, face: -1, anim: 'Death', loop: false },
  // 1. wide: Akame gone into the storm, John panting
  cut([-7.5, 2.4, 7.5], [-1, 0.6, 0]),
  { sfx: 'tired' }, A('john', { breath: 1, head: 0.2 }),
  // 2. back to back (low orbit)
  { orbit: [-1.05, 0.2, 0.1], from: -0.9, to: 0.4, r: 2.8, h: 0.0, lookY: 0.35, t: 2.6 },
  { music: null, fade: 0.6 },
  // 3. a voice from the right: Missile with Reika
  { place: 'missile', x: 7.0, z: -0.6, face: -1, anim: 'Walk' },
  { place: 'reika', x: 6.2, z: -0.4, face: -1, anim: 'Walk' },
  { place: 'hogen', x: 8.8, z: -2.2, face: -1, anim: 'Idle' },
  cut([3.0, 0.6, 2.8], [6.2, 0.8, -0.4]),
  { par: [{ move: 'missile', x: 4.2, t: 1.8, anim: 'Walk', after: 'Idle' }, { move: 'reika', x: 3.4, t: 1.8, anim: 'Walk', after: 'Idle_2_HeadLow' }] },
  { say: 'l3_missile_hostage' },
  // 4. Reika → Hōgen (low)
  cut([2.6, 0.75, 1.1], [3.5, 0.7, -0.4]),
  { say: 'l3_reika_no' },
  cut([5.6, 0.35, 0.6], [8.4, 1.5, -2.2]),
  { say: 'l3_hogen_surrender' },
  // 5. Gin closes his eyes; John's teeth
  cut([-2.6, 1.1, 1.4], [-1.6, 1.0, 0.0]), A('gin', { head: 0.45, ears: 0.6 }),
  { say: 'l3_gin_stop' },
  cut([0.3, 0.75, 0.75], [-0.3, 0.75, 0.2]), A('john', { head: 0.1, ears: 0.9, tremble: 0.6 }),
  { say: 'l3_john_damn' },
  { music: 'sad', fade: 1.5 },
  // 6. the ring closes (high), white-out: the blows are not shown
  cut([0.0, 7.5, 5.5], [-1.0, 0, 0]),
  { par: [
    { move: 's1', x: 0.6, z: -0.8, t: 1.6, anim: 'Walk' }, { move: 's2', x: 0.6, z: 1.2, t: 1.6, anim: 'Walk' },
    { move: 's3', x: -2.6, z: -0.8, t: 1.6, anim: 'Walk' }, { move: 's4', x: -2.6, z: 1.2, t: 1.6, anim: 'Walk' },
    pan([0.0, 6.0, 3.6], [-1.0, 0, 0], 1.6),
  ] },
  { sfx: 'hitHeavy' }, { fx: 'flash', color: '#ffffff', t: 0.5, peak: 0.9 }, { sfx: 'yelpPain' },
  black(2.2), { wait: 1.6 },
];

// ================================================================================================
// 2. CAPTIVE (ep. 7–8): Akame reaches Futago Pass; Hōgen's camp; Hook's snow; Hiro surrenders; Gin sends John off
export const captive = ({ cast, P }) => [
  Mood('grief', 0.1), { amb: 'night' }, { music: null },
  // 1. Futago Pass at night: Akame staggers in
  { place: 'weed', x: 1.4, z: -0.2, face: -1, anim: 'Idle' },
  { place: 'jerome', x: 2.8, z: -1.1, face: -1, anim: 'Idle' },
  { place: 'akame', x: -6.0, z: 0.0, face: 1, anim: 'Walk' },
  cut([-3.0, 2.6, 7.0], [0, 0.8, -0.6]),
  { caption: '<b>Futago Pass</b>That night', t: 3, wait: false },
  { par: [{ move: 'akame', x: -0.4, t: 3.2, anim: 'Walk', ts: 0.6 }, { say: 'l3_nar_3' }] },
  { anim: 'akame', name: 'Idle_HitReact2', loop: false }, { sfx: 'bodyfall' },
  { move: 'weed', x: 0.5, t: 0.4, anim: 'Gallop', after: 'Idle' },
  cut([0.0, 0.55, 1.5], [-0.4, 0.6, 0.0]), A('akame', { head: 0.5, breath: 1 }),
  { say: 'l3_akame_report' },
  cut([0.0, 0.6, 1.3], [0.55, 0.62, -0.2]),
  { say: 'l3_weed_go' },
  cut([5.0, 1.2, 3.2], [1.6, 0.7, -0.6]), A('jerome', { look: 'weed' }), Nod('jerome', 0.2), { wait: 0.8 },
  A('akame', null), A('jerome', null),
  { hide: 'weed' }, { hide: 'jerome' }, black(1.2), { wait: 0.6 },
  // 2. Hōgen's camp in the southern Alps
  { fn: () => { P.show('shed', -3.6, -3.4); } },
  { place: 'gin', x: -2.6, z: -1.5, face: 1, anim: 'LieDown' },
  { place: 'john', x: -0.8, z: -1.3, face: -1, anim: 'LieDown' },
  { place: 'akame', x: -30, z: 0 }, { hide: 'akame' },
  ...soldiers([['s1', 3.0, -2.4], ['s2', 4.6, -0.4], ['s3', 2.2, 1.8, 1], ['s4', 6.0, 1.2]]),
  { place: 'hook', x: -6.5, z: 0.6, face: 1, anim: 'Walk' },
  cut([-9.0, 4.0, 9.0], [-1, 0.6, -1.5]),
  { say: 'l3_nar_4' },
  { par: [{ move: 'hook', x: -1.8, z: -0.3, t: 3.0, anim: 'Walk', ts: 0.7, after: 'Idle_2_HeadLow' }, pan([-5.0, 1.4, 4.0], [-1.6, 0.6, -0.8], 3.0)] },
  cut([-1.2, 0.5, 0.6], [-1.6, 0.45, -0.6]),
  { say: 'l3_hook_snow' },
  cut([-0.3, 0.32, 0.0], [-0.9, 0.3, -1.2]), { sfx: 'fur' }, { wait: 1.0 },
  { move: 'hook', x: -7, t: 1.4, anim: 'Walk' }, { hide: 'hook' },
  // 3. Hiro charges in for Reika – Hōgen takes her by the throat
  { place: 'reika', x: 5.2, z: 0.4, face: -1, anim: 'Idle_2_HeadLow' },
  { place: 'hogen', x: 3.7, z: 0.4, face: 1, anim: 'Idle' },
  { place: 'hiro', x: 12, z: 0.8, face: -1, anim: 'Gallop' },
  cut([7.0, 0.35, 3.6], [10.5, 0.8, 0.6]),
  { par: [{ move: 'hiro', x: 8.0, t: 0.8, anim: 'Gallop', ts: 1.2, ease: 'linear' }, { sfx: 'gallopIn' }] },
  { move: 's4', x: 7.0, z: 0.9, t: 0.25, anim: 'Gallop' },
  ...flashCut([7.6, 0.9, 1.6], [7.2, 0.6, 0.9], 0.12),
  { sfx: 'hitHeavy' }, { fx: 'impact', at: 's4', strong: true }, { anim: 's4', name: 'Death', loop: false }, { shake: 0.3 },
  cut([9.6, 0.7, 3.0], [8.0, 1.0, 0.8]),
  { say: 'l3_hiro_coward' },
  { move: 'hogen', x: 4.2, t: 0.3, anim: 'Gallop', after: 'Idle' }, { sfx: 'growl' },
  cut([4.6, 0.25, 2.4], [4.6, 1.2, 0.4]), roll(0.08),
  { say: 'l3_hogen_throat' }, roll(0),
  cut([8.9, 1.0, 1.8], [8.0, 1.1, 0.8]), A('hiro', { head: 0.4, ears: 0.6 }),
  { wait: 0.8 },
  { par: [{ move: 's1', x: 7.2, z: -0.2, t: 0.8, anim: 'Gallop', after: 'Idle' }, { move: 's2', x: 8.8, z: -0.4, t: 0.8, anim: 'Gallop', after: 'Idle' }] },
  black(1.4), { wait: 0.8 }, A('hiro', null),
  // 4. night: uproar in the camp; Gin lying, John beside him
  { hide: 'hogen' }, { hide: 'reika' }, { hide: 's4' },
  { place: 'hiro', x: 1.4, z: -1.0, face: -1, anim: 'LieDown' },
  { place: 'reika', x: 2.6, z: -0.2, face: -1, anim: 'Idle_2_HeadLow' },
  cut([0.5, 2.6, 5.5], [-1.0, 0.4, -1.2]),
  { say: 'l3_nar_hogen_camp' },
  cut([-1.5, 0.55, 0.3], [-2.6, 0.4, -1.5]), A('gin', { head: 0.2, look: 'john' }),
  { say: 'l3_gin_john' },
  { place: 'john', x: -0.8, z: -1.3, face: -1, anim: 'Idle_2_HeadLow' },
  cut([-1.5, 0.75, -0.4], [-0.8, 0.75, -1.3]), A('john', { head: 0.35, ears: 0.8, tremble: 0.5 }),
  { say: 'l3_john_harder' },
  { place: 'hiro', x: 1.4, z: -1.0, face: -1, anim: 'Idle' },
  cut([3.2, 1.0, 1.4], [1.4, 1.0, -1.0]),
  { say: 'l3_hiro_join' },
  A('john', null), A('gin', null),
  // 5. six silhouettes run into the storm; the camera stays with Gin, alone (high)
  { mood: 'storm', t: 1.5 },
  { place: 'lefty', x: 0.0, z: 0.6, face: -1, anim: 'Gallop' },
  { place: 'tommy', x: 1.0, z: 1.2, face: -1, anim: 'Gallop' },
  { place: 'rossi', x: 2.0, z: 0.4, face: -1, anim: 'Gallop' },
  cut([3.0, 1.2, 6.0], [-2, 0.6, 0]),
  { par: [
    { move: 'lefty', x: -14, t: 3.0, anim: 'Gallop', ease: 'linear' }, { move: 'tommy', x: -13, t: 3.1, anim: 'Gallop', ease: 'linear' },
    { move: 'rossi', x: -13.5, t: 3.2, anim: 'Gallop', ease: 'linear' }, { move: 'john', x: -12, z: 0.0, t: 3.4, anim: 'Gallop', ease: 'linear' },
    { move: 'reika', x: -12.5, z: 0.8, t: 3.3, anim: 'Gallop', ease: 'linear' }, { move: 'hiro', x: -11, z: 1.0, t: 3.6, anim: 'Gallop', ease: 'linear' },
  ] },
  { place: 'gin', x: -2.6, z: -1.5, face: -1, anim: 'LieDown' },
  cut([-2.6, 6.5, 2.8], [-2.6, 0.2, -1.5]), A('gin', { head: 0.3 }),
  pan([-2.6, 4.5, 1.6], [-2.6, 0.2, -1.5], 3.0),
  A('gin', null),
];

// ================================================================================================
// 3. OATH (ep. 9): Hōgen guesses the path; the storm dies down; John splits the group, three promises
export const oath = ({ cast, P }) => [
  Mood('storm', 0.1), { amb: 'gorge' }, { music: null },
  { fn: () => { P.show('shed', -3.6, -3.4); } },
  { place: 'hogen', x: -0.6, z: -0.4, face: 1, anim: 'Idle' },
  { place: 'matsu', x: 1.6, z: 0.3, face: -1, anim: 'Idle' },
  ...soldiers([['s1', 3.2, -1.4], ['s2', 3.8, 1.0], ['s3', 5.0, -0.2]]),
  // 1. Hōgen and Matsu (low)
  cut([0.6, 0.3, 2.6], [-0.4, 1.3, -0.4]),
  { say: 'l3_hogen_path' },
  cut([2.6, 0.8, 1.4], [1.6, 0.8, 0.3]), { anim: 'matsu', name: 'Howl', loop: false }, { sfx: 'battleCry' },
  { say: 'l3_matsu_go' },
  { fn: () => { P.hide('shed'); } }, { hide: 'hogen' }, { hide: 'matsu' }, ...hideAll(['s1', 's2', 's3']),
  // 2. the ridge path at first light: the storm dies down
  { mood: 'night', t: 4 }, { amb: 'sad' },
  { place: 'john', x: -0.2, z: 0.2, face: -1, anim: 'Walk' },
  { place: 'hiro', x: -1.6, z: -0.6, face: -1, anim: 'Walk' },
  { place: 'reika', x: -2.8, z: 0.4, face: -1, anim: 'Walk' },
  { place: 'lefty', x: 1.2, z: -1.0, face: -1, anim: 'Walk' },
  { place: 'tommy', x: 2.4, z: 0.6, face: -1, anim: 'Walk' },
  { place: 'rossi', x: 3.4, z: -0.6, face: -1, anim: 'Walk' },
  cut([6, 4.5, 9], [-1, 0.6, -0.4]),
  { fn: ({ E }) => { if (E.snow) E.snow.uniforms.uWind.value = 0.4; } },
  pan([4, 3.2, 7.2], [-1, 0.6, -0.4], 2.6),
  { fn: () => { for (const k of ['john', 'hiro', 'reika', 'lefty', 'tommy', 'rossi']) cast[k].play('Idle'); } },
  // 3. John sniffs the air
  cut([-1.2, 0.85, 0.9], [-0.2, 0.9, 0.2]), A('john', { head: -0.25, ears: -0.3 }), { sfx: 'breath' }, { wait: 0.8 },
  { fn: () => cast.john.face(1) },
  { say: 'l3_john_west' },
  // 4. Hiro (low) ↔ John (over the shoulder)
  { fn: () => cast.hiro.face(1) },
  cut([-0.6, 0.35, 1.8], [-1.6, 1.3, -0.6]),
  { say: 'l3_hiro_die' },
  cut([-2.6, 1.3, 1.8], [-0.2, 0.9, 0.2]), A('john', { head: 0, look: 'hiro' }),
  { say: 'l3_john_promise' },
  cut([0.2, 1.2, 1.4], [-1.6, 1.2, -0.6]), A('hiro', { head: 0.25 }),
  { say: 'l3_hiro_swear' }, Nod('hiro', 0.3), { wait: 0.6 },
  A('hiro', null),
  // 5. Hiro and Reika leave; Reika looks back (high)
  { music: 'sad', fade: 2 },
  cut([-1.0, 5.0, 4.5], [-3.0, 0.4, 0]),
  { par: [
    { move: 'hiro', x: -11, z: -0.4, t: 3.6, anim: 'Walk', ease: 'linear' },
    { move: 'reika', x: -10, z: 0.4, t: 3.6, anim: 'Walk', ease: 'linear' },
    { fn: async ({ wait }) => { await wait(1.4, true); cast.reika.face(1); cast.reika.play('Idle'); await wait(0.9, true); cast.reika.face(-1); cast.reika.play('Walk'); } },
  ] },
  { hide: 'hiro' }, { hide: 'reika' },
  // 6. the three step up beside John
  { fn: () => { for (const k of ['lefty', 'tommy', 'rossi']) cast[k].face(-1); } },
  cut([2.4, 0.6, 2.6], [1.8, 0.8, -0.3]),
  { say: 'l3_lefty_stay' },
  cut([-0.8, 0.6, 1.2], [0.0, 0.85, 0.2]), A('john', { head: 0 }),
  { say: 'l3_john_giveup' },
  A('john', null),
  // 7. red collars on the ridge (low)
  ...soldiers([['s1', 9.0, -1.6], ['s2', 9.6, 0.4], ['s3', 10.4, -0.6], ['s4', 11.0, 1.2]]),
  { fn: () => { for (const k of ['john', 'lefty', 'tommy', 'rossi']) cast[k].face(1); } },
  cut([1.0, 0.25, 2.2], [9.8, 1.0, 0]),
  { sfx: 'braam' }, { music: 'battle', fade: 1 },
  { bark: 'l3_matsu_order' }, { wait: 1.0 },
];

// ================================================================================================
// between waves: a comrade falls (ep. 9 order: Lefty, Tommy, Rossi). No blood: a pile-on cut, then he lies still.
function fall(who, lineFall, lineJohn) {
  return ({ cast }) => {
    const p = cast[who].root.position, x = p.x, z = p.z;
    return [
      { music: null, fade: 0.4 }, { slow: 0.4 },
      { place: 'john', x: -0.4, z: 0, face: 1, anim: 'Idle_2_HeadLow' },
      { place: who, x, z, face: 1, anim: 'Attack', loop: false },
      { place: 's1', x: x + 1.3, z: z + 0.2, face: -1, anim: 'Attack', loop: false },
      { place: 's2', x: x + 0.9, z: z - 1.1, face: -1, anim: 'Gallop' },
      { place: 's3', x: x - 1.2, z: z + 0.7, face: 1, anim: 'Gallop' },
      ...flashCut([x + 2.6, 0.5, z + 2.2], [x, 0.6, z], 0.18),
      { sfx: 'hitHeavy' }, { fx: 'impact', at: who, strong: true },
      ...flashCut([x - 0.4, 0.3, z + 1.0], [x + 0.6, 0.6, z - 0.4], 0.14),
      { sfx: 'yelpPain' }, { anim: who, name: 'Idle_HitReact2', loop: false },
      ...flashCut([x + 1.0, 2.6, z + 2.8], [x, 0.3, z], 0.16),
      { slow: 1 },
      { anim: who, name: 'Death', loop: false }, { sfx: 'bodyfall' },
      cut([x + 0.6, 0.35, z + 0.9], [x, 0.3, z]),
      { sfx: 'heartbeat' }, { say: lineFall },
      { par: [{ move: 's1', x: x + 4.5, t: 1.2, anim: 'Walk' }, { move: 's2', x: x + 4.0, t: 1.2, anim: 'Walk' }, { move: 's3', x: x + 3.8, z: z + 1.8, t: 1.2, anim: 'Walk' }] },
      cut([x + 0.6, 3.6, z + 3.0], [x, 0.2, z]),
      { fn: ({ FX, E }) => FX.spiritLight(p.clone().add(new E.V3(0, 0.3, 0)), 0xcfe4ff, 2.5) },
      { wait: 1.0 },
      cut([0.5, 0.85, 1.0], [-0.4, 0.85, 0.0]), A('john', { head: -0.1, ears: 0.5, look: who }),
      { say: lineJohn },
      A('john', null),
      { music: 'battle', fade: 0.8 },
    ];
  };
}
export const leftyFall = fall('lefty', 'l3_lefty_fall', 'l3_john_lefty');
export const tommyFall = fall('tommy', 'l3_tommy_fall', 'l3_john_tommy');
export const rossiFall = fall('rossi', 'l3_rossi_fall', 'l3_john_rossi');

// ================================================================================================
// 4. HŌGEN (ep. 9): he arrives; cross-cut to Weed meeting Hiro and Reika; Hook; the tree and the branch; John rises;
//    Matsu stops Hōgen; the army withdraws. Wounding blows are never shown (PEGI 12).
const WX = -34;           // the other place on the mountain path (Weed's group)
export const hogenScene = ({ cast, P }) => [
  { music: null, fade: 1.2 }, Mood('grief', 0.1), { amb: 'sad' }, GradeNow({ exposure: 1.18, t: 0 }),
  { fn: () => { P.show('tree', -3.9, -1.5); } },
  { place: 'john', x: 0.0, z: 0.0, face: 1, anim: 'Idle_2_HeadLow' },
  { place: 'tommy', x: 2.2, z: -1.3, face: 1, anim: 'Death', loop: false },
  { place: 'lefty', x: 3.4, z: 1.2, face: -1, anim: 'Death', loop: false },
  { place: 'rossi', x: -1.6, z: 1.4, face: 1, anim: 'Death', loop: false },
  ...soldiers([['s1', 5.0, -2.8], ['s2', 6.2, -2.6], ['s3', 7.4, -2.8], ['s4', 5.0, 2.4], ['s5', 6.2, 2.6], ['s6', 7.4, 2.4]]),
  { place: 'matsu', x: 8.6, z: -2.2, face: -1, anim: 'Idle' },
  { place: 'hogen', x: 13, z: 0.0, face: -1, anim: 'Walk' },
  // 1. Hōgen walks through the opened ranks (low tracking); John panting
  cut([0.6, 0.85, 1.2], [0.0, 0.8, 0.0]), A('john', { breath: 1, head: 0.25, tremble: 0.4 }), { sfx: 'tired' }, { wait: 0.8 },
  cut([7.0, 0.3, 4.4], [11, 1.2, 0]), { sfx: 'bossAppear' },
  { par: [{ move: 'hogen', x: 3.0, z: -0.5, t: 4.0, anim: 'Walk', ts: 0.6, after: 'Idle', ease: 'linear' }, pan([3.4, 0.35, 3.6], [3.0, 1.3, -0.5], 4.0)] },
  // 2. beside fallen Tommy, the taunt
  cut([3.0, 1.9, 2.4], [2.4, 0.6, -1.0]), A('hogen', { head: 0.3, look: 'tommy' }),
  { say: 'l3_hogen_arrive' },
  cut([-0.9, 0.7, 0.9], [0.2, 0.85, 0.0]), roll(0.07), A('john', { head: -0.1, breath: 1 }),
  { say: 'l3_john_spit' }, roll(0),
  cut([4.2, 0.35, 0.9], [3.0, 1.5, -0.5]), A('hogen', { head: 0, look: 'john' }),
  { say: 'l3_hogen_slow' },
  // 3. flash cuts: the blows land off-frame (snow, an eye, a falling shape)
  { par: [{ move: 's1', x: 1.2, z: -0.8, t: 0.5, anim: 'Gallop' }, { move: 's4', x: 1.3, z: 0.9, t: 0.5, anim: 'Gallop' }] },
  ...flashCut([2.4, 0.2, 2.0], [0.4, 0.5, 0.0], 0.14), { sfx: 'hit' }, { fx: 'dust', at: 'john', big: true },
  ...flashCut([0.35, 0.82, 0.55], [0.1, 0.82, 0.0], 0.12), { sfx: 'hitHeavy' },
  ...flashCut([-2.0, 2.8, 2.6], [0.0, 0.3, 0.0], 0.16), { anim: 'john', name: 'Idle_HitReact2', loop: false }, { sfx: 'yelpPain' },
  { par: [{ move: 's1', x: 3.6, z: -1.8, t: 0.8, anim: 'Walk' }, { move: 's4', x: 3.6, z: 1.8, t: 0.8, anim: 'Walk' }] },
  // 4. "this soul…" → somewhere else on the mountain, Weed hears it
  Hush(0.1, 5),
  cut([0.25, 0.6, 0.6], [-0.1, 0.55, 0.0]), A('john', { head: 0.6, ears: 0.7, breath: 1 }), { anim: 'john', name: 'Idle_2_HeadLow' },
  { say: 'l3_john_entrust' },
  { place: 'weed', x: WX, z: 0, face: -1, anim: 'Walk' },
  { place: 'gb', x: WX + 1.6, z: -0.8, face: -1, anim: 'Walk' },
  { place: 'jerome', x: WX + 2.8, z: 0.4, face: -1, anim: 'Walk' },
  cut([WX - 1.6, 0.55, 1.4], [WX + 0.2, 0.55, 0]), { fn: () => { for (const k of ['weed', 'gb', 'jerome']) cast[k].play('Idle'); } },
  A('weed', { head: -0.2, ears: -0.4, yaw: 0.4 }),
  { say: 'l3_weed_voice' },
  // 5. Weed meets Hiro and Reika
  { place: 'hiro', x: WX - 5.5, z: 0.3, face: 1, anim: 'Walk' },
  { place: 'reika', x: WX - 6.6, z: -0.5, face: 1, anim: 'Walk' },
  cut([WX - 1.0, 1.4, 4.4], [WX - 3.4, 0.7, 0]),
  { par: [{ move: 'hiro', x: WX - 2.2, t: 1.6, anim: 'Walk', ts: 0.6, after: 'Idle_2_HeadLow' }, { move: 'reika', x: WX - 3.2, t: 1.6, anim: 'Walk', after: 'Idle' }] },
  cut([WX - 4.6, 0.8, 1.4], [WX - 3.2, 0.7, -0.5]),
  { say: 'l3_reika_gin' },
  { anim: 'hiro', name: 'LieDown', loop: false }, { sfx: 'bodyfall' },
  cut([WX - 1.6, 0.45, 1.5], [WX - 2.2, 0.6, 0.2]),
  { say: 'l3_hiro_john' },
  A('weed', null),
  cut([WX + 1.0, 0.3, 2.0], [WX - 2, 0.5, 0]),
  { par: [{ move: 'weed', x: WX - 14, t: 1.6, anim: 'Gallop', ts: 1.3, ease: 'in' }, { sfx: 'gallopIn' }] },
  ...hideAll(['weed', 'gb', 'jerome', 'hiro', 'reika']),
  // 6. back at the slope: Hook arrives, John stops him
  { place: 'hook', x: -7.0, z: -2.4, face: 1, anim: 'Gallop' },
  cut([-2.2, 1.8, 4.2], [-5.0, 0.6, -2.0]),
  { move: 'hook', x: -5.2, t: 0.9, anim: 'Gallop', after: 'Idle' },
  { bark: 'l3_hook_john' }, { wait: 0.8 },
  { fn: () => cast.john.face(-1) },
  cut([1.2, 0.7, 1.0], [0.0, 0.85, 0.0]), A('john', { head: 0, breath: 1 }),
  { say: 'l3_john_back' },
  cut([-4.4, 0.75, -1.2], [-5.2, 0.75, -2.4]), A('hook', { head: 0.35, ears: 0.8, tremble: 0.5 }),
  { wait: 1.2 },
  // 7. "beg" – "no"
  { fn: () => cast.john.face(1) },
  { move: 'hogen', x: 1.9, z: 0.0, t: 0.8, anim: 'Walk', after: 'Idle' },
  cut([1.6, 1.2, 1.6], [2.0, 1.4, 0.0]),
  { say: 'l3_hogen_beg' },
  cut([0.55, 0.78, 0.7], [0.0, 0.8, 0.0]),
  { say: 'l3_john_never' },
  // 8. sakuga: anticipation → the rush → the tree (cut on impact, no wound shown)
  { place: 'john', x: -2.4, z: -1.1, face: 1, anim: 'Idle' },
  { place: 'hogen', x: 1.4, z: -0.6, face: -1, anim: 'Idle' },
  cut([0.8, 0.25, 2.2], [1.6, 1.2, -0.6]), { anim: 'hogen', name: 'Idle_2_HeadLow' }, { sfx: 'growl' }, { wait: 0.5 },
  { fx: 'speed', v: 1 },
  { par: [{ move: 'hogen', x: -1.6, t: 0.32, anim: 'Gallop', ts: 1.4, ease: 'in' }, pan([-0.6, 0.9, 2.6], [-2.4, 0.9, -1.1], 0.32, 'in')] },
  { fx: 'speed', v: 0 }, { sfx: 'thudDeep' }, { sfx: 'rock' }, { shake: 0.8 }, { fx: 'flash', color: '#ffffff', t: 0.25, peak: 1 },
  { freeze: 0.14 },
  { place: 'john', x: -3.35, z: -1.35, face: 1, anim: 'Idle_HitReact2', loop: false },
  { place: 'hogen', x: -0.3, z: 0.9, face: -1, anim: 'Idle_2_HeadLow' },
  { fn: ({ P }) => P.treeShake() },
  ...flashCut([-2.0, 4.5, 2.6], [-3.6, 0.4, -1.4], 0.4),
  { anim: 'john', name: 'Death', loop: false }, { fn: ({ P }) => P.showBranch(true) },
  // 9. silence. John's eye opens; he pulls free, rises and throws the broken branch
  { music: null }, Hush(0.05, 6), { amb: null },
  cut([-2.8, 0.35, -0.4], [-3.35, 0.35, -1.35]), { sfx: 'heartbeat' }, { wait: 1.4 },
  { slow: 0.5 },
  cut([-1.4, 0.2, 1.4], [-3.3, 0.7, -1.3]),
  { anim: 'john', name: 'Jump_ToIdle', loop: false }, { sfx: 'strain' },
  { fn: ({ P }) => P.showBranch(false) },
  { anim: 'john', name: 'Idle_2_HeadLow' }, A('john', { head: -0.1, breath: 1, tremble: 0.6 }),
  { wait: 0.6 },
  { slow: 1 },
  { fn: ({ P, cast }) => P.throwStick(cast.john, cast.hogen) }, { sfx: 'whoosh' },
  cut([-0.6, 1.0, 0.8], [-1.6, 1.3, -0.6]), { anim: 'hogen', name: 'Idle_HitReact1', loop: false },
  { wait: 0.5 },
  // fear: reaction shots of the soldiers backing away
  { place: 's2', x: 2.8, z: -2.2, face: -1, anim: 'Walk' }, { place: 's5', x: 2.8, z: 2.0, face: -1, anim: 'Walk' },
  ...flashCut([1.6, 0.6, -0.6], [2.8, 0.8, -2.2], 0.5), { move: 's2', x: 4.4, t: 0.6, anim: 'Walk', faceMove: false },
  ...flashCut([1.6, 0.6, 3.2], [2.8, 0.8, 2.0], 0.5),
  cut([-1.0, 0.75, -0.2], [-1.6, 1.4, -0.6]), A('hogen', { head: -0.2, ears: -0.2 }), { wait: 1.0 },
  // 10. far and high: Hōgen falls on him (silhouette in the dust); Matsu stops him
  cut([4.0, 6.5, 8.5], [-2.8, 0.3, -1.3]), { music: 'sad', fade: 3 },
  { move: 'hogen', x: -2.4, t: 0.3, anim: 'Gallop' }, { fx: 'dust', at: 'john', big: true }, { sfx: 'dust' }, { wait: 0.4 }, { fx: 'dust', at: 'hogen', big: true }, { wait: 0.6 },
  { move: 'matsu', x: 0.4, z: -1.6, t: 0.7, anim: 'Gallop', after: 'Idle' },
  cut([1.6, 0.9, -0.4], [0.4, 1.0, -1.6]),
  { say: 'l3_matsu_stop' },
  { place: 'hogen', x: -1.4, z: -0.8, face: 1, anim: 'Idle' },
  cut([0.2, 1.1, 0.8], [-1.4, 1.3, -0.8]), A('hogen', { breath: 1, head: 0.15 }),
  { say: 'l3_hogen_leave' },
  A('hogen', null),
  cut([-6.0, 1.6, 6.0], [2, 0.6, 0]),
  { par: [
    { move: 'hogen', x: 14, t: 4, anim: 'Walk' }, { move: 'matsu', x: 13, t: 4, anim: 'Walk' },
    ...['s1', 's2', 's3', 's4', 's5', 's6'].map((s, i) => ({ move: s, x: 15 + i, t: 4, anim: 'Walk' })),
    pan([-5.2, 0.4, 3.0], [-2.0, 0.2, -1.0], 4),
  ] },
  GradeNow(null),
  ...hideAll(['hogen', 'matsu', 's1', 's2', 's3', 's4', 's5', 's6']),
];

// ================================================================================================
// 5. FAREWELL (ep. 9 end + ep. 10 start): Weed finds John; GB pretends to be Akame; John dies. Night: four graves, the howl.
export const farewell = ({ cast, P }) => [
  Mood('dawn', 0.1), { amb: 'sad' }, { music: null }, GradeNow({ exposure: 0.86, bloom: -0.25, sat: 0.85, t: 0 }),
  { fn: () => { P.show('tree', -3.9, -1.5); } },
  { place: 'john', x: -3.0, z: -1.0, face: 1, anim: 'Death', loop: false },
  { place: 'hook', x: -1.9, z: -0.6, face: -1, anim: 'Idle_2_HeadLow' },
  { place: 'tommy', x: 2.2, z: -1.3, face: 1, anim: 'Death', loop: false },
  { place: 'lefty', x: 3.4, z: 1.2, face: -1, anim: 'Death', loop: false },
  { place: 'rossi', x: -1.0, z: 1.6, face: 1, anim: 'Death', loop: false },
  // 1. wide: the empty slope; Hook beside John; Weed comes running
  cut([4.0, 3.2, 8.0], [-1.0, 0.3, -0.5]),
  { bark: 'l3_hook_call' }, { wait: 1.2 },
  { place: 'weed', x: -11, z: 0.6, face: 1, anim: 'Gallop' },
  cut([-5.2, 0.25, 2.4], [-8.0, 0.5, 0.4]),
  { move: 'weed', x: -3.9, z: -0.4, t: 1.3, anim: 'Gallop', ts: 1.2, after: 'Idle' },
  // 2. Weed / John
  cut([-3.2, 0.5, 0.4], [-3.9, 0.5, -0.4]), A('weed', { head: 0.4, ears: 0.5, look: 'john' }),
  { say: 'l3_weed_john' },
  cut([-1.9, 0.6, 0.7], [-3.0, 0.35, -1.0]), { sfx: 'breath' },
  { say: 'l3_john_weed' },
  // 3. the others arrive; Hiro whispers to GB (over the shoulder)
  { place: 'hiro', x: -9.5, z: 1.0, face: 1, anim: 'Walk' },
  { place: 'gb', x: -10.5, z: 0.2, face: 1, anim: 'Walk' },
  { place: 'jerome', x: -11.5, z: 1.4, face: 1, anim: 'Walk' },
  cut([-6.0, 1.5, 4.5], [-3.6, 0.6, 0]),
  { par: [
    { move: 'hiro', x: -5.2, z: 0.9, t: 2.0, anim: 'Walk', ts: 0.7, after: 'Idle_2_HeadLow' },
    { move: 'gb', x: -4.6, z: 0.2, t: 2.0, anim: 'Walk', after: 'Idle' },
    { move: 'jerome', x: -6.4, z: 1.4, t: 2.0, anim: 'Walk', after: 'Idle' },
  ] },
  cut([-6.6, 1.5, 2.0], [-4.6, 0.8, 0.2]), A('hiro', { look: 'gb', head: 0.2 }), Nod('gb', 0.3), { wait: 1.0 },
  { move: 'gb', x: -3.0, z: 0.0, t: 0.8, anim: 'Walk', after: 'Idle_2_HeadLow' },
  // 4. GB as "Akame": the kind lie
  cut([-2.2, 0.6, 1.0], [-3.0, 0.65, 0.0]), A('gb', { head: 0.35, ears: 0.6, look: 'john' }),
  { say: 'l3_gb_lie' },
  cut([-2.0, 0.45, 0.2], [-3.1, 0.35, -1.0]),
  { say: 'l3_john_good' },
  // 5. the last words; silence; the spirit rises
  cut([-1.7, 0.75, 0.9], [-3.0, 0.4, -1.0]),
  { say: 'l3_john_last' },
  { sfx: 'heartbeat' }, { wait: 1.2 }, Hush(0.05, 5),
  GradeNow({ exposure: 0.8, sat: 0.6, vig: 0.2, bloom: -0.1, t: 3 }),
  cut([-3.0, 5.5, 2.5], [-3.0, 0.2, -1.0]),
  { fn: ({ FX, E, sfx }) => { FX.spiritLight(cast.john.root.position.clone().add(new E.V3(0, 0.3, 0)), 0xdfe8ff, 6); FX.spiritGhost(cast.john, 0xcfe0ff, 4); sfx.spirit(); } },
  pan([-3.0, 7.5, 3.5], [-3.0, 0.6, -1.0], 3.5),
  // 6. Weed's cry; the group in the snow (high)
  { music: 'sad', fade: 1.5 },
  cut([-4.6, 0.55, 0.6], [-3.9, 0.6, -0.4]), A('weed', { head: -0.35, ears: 0.6 }), { anim: 'weed', name: 'Howl', loop: false },
  { say: 'l3_weed_cry' },
  cut([-5.6, 1.1, 2.2], [-5.2, 1.1, 0.9]), A('hiro', { head: 0.5, ears: 0.8 }),
  { say: 'l3_hiro_liar' },
  cut([0.0, 9.0, 7.0], [-3.2, 0, -0.4]), pan([0.0, 10.5, 8.5], [-3.2, 0, -0.4], 3),
  GradeNow(null), A('weed', null), A('hiro', null), A('gb', null),
  black(1.6), { wait: 1.2 },
  // 7. night: four graves by the cabin
  Mood('finale', 0.1), { amb: 'night' },
  ...hideAll(['john', 'tommy', 'lefty', 'rossi']),
  { fn: () => { P.hide('tree'); P.show('cabin', 4.4, -3.8); P.showGraves(true); } },
  { place: 'reika', x: 0.2, z: 0.4, face: -1, anim: 'Idle_2_HeadLow' },
  { place: 'hiro', x: -1.2, z: 0.2, face: 1, anim: 'Idle' },
  { place: 'weed', x: 1.4, z: 0.9, face: -1, anim: 'Idle' },
  { place: 'gb', x: 2.4, z: 0.3, face: -1, anim: 'Idle' },
  { place: 'jerome', x: 3.3, z: 1.0, face: -1, anim: 'Idle' },
  { place: 'hook', x: -2.4, z: 0.8, face: 1, anim: 'Idle_2_HeadLow' },
  cut([0, 3.4, 9.0], [0, 1.6, -2.0]), { caption: 'That night', t: 2.5, wait: false },
  { say: 'l3_nar_5' },
  cut([1.0, 0.6, 1.8], [0.2, 0.6, 0.4]), A('reika', { head: 0.5, ears: 0.6, tremble: 0.4 }),
  { say: 'l3_reika_blame' },
  cut([-2.4, 1.0, 1.6], [-1.2, 1.0, 0.2]), A('hiro', { look: 'reika' }),
  { say: 'l3_hiro_dig' },
  cut([-3.4, 0.7, 2.2], [-2.4, 0.7, 0.8]),
  { say: 'l3_hook_fang' },
  A('reika', null), A('hiro', null),
  // 8. the howl to the stars (orbit), Weed's vow, the legend
  { fn: () => { for (const k of ['weed', 'gb', 'jerome', 'hiro', 'reika', 'hook']) { cast[k].face(-1); cast[k].play('Howl', { loop: true }); } } },
  { sfx: 'howl' },
  { orbit: [0.5, 0.0, 0.5], from: -0.6, to: 0.7, r: 6.5, h: 0.6, lookY: 1.6, t: 6 },
  { fn: () => { for (const k of ['weed', 'gb', 'jerome', 'hiro', 'reika', 'hook']) cast[k].play('Idle'); } },
  { music: 'dawn', fade: 3 },
  cut([2.0, 0.85, 2.0], [1.4, 1.1, 0.9]), A('weed', { head: -0.45, look: new THREE.Vector3(0, 30, -60) }),
  { say: 'l3_weed_vow' },
  cut([0, 2.0, 12], [0, 4.0, -20]), pan([0, 3.5, 14], [0, 8, -40], 6),
  { say: 'l3_nar_6' },
  { caption: '<b>John</b>Warrior of Ōu', t: 4 },
  A('weed', null),
];
