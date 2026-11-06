/* showdown/part1.js - GOJO SATORU vs OSAMU DAZAI, 10 s, style "SAKUGA / MAPPA-FLUID".
   Figures are GLOBAL-TIME (one continuous performance across cuts): always f.fig(F, { t: T }) and pass T to figure-based cameras.
   Staging: Dazai at z = -2.1 facing +z (yaw 0), Gojo at z = +2.1 facing -z (yaw PI).  Water edge z = -14 (surface y = -1.2).
   Sakuga rules used here: anticipation (slow-out into an extreme + hold), snap on ONES for hits, overshoot ('back'), hit-stop,
   limb smears + afterimages, follow-through on hair/coat springs, holds after big beats, camera always moving (kicks, whips, arcs). */
'use strict';
SUB_WHO.GOJ = '#8fdcff'; SUB_NAME.GOJ = 'GOJO';
const DZ0 = [0, 0, -2.1], GZ0 = [0, 0, 2.1];
const PAL = 'harbor_dusk', MOONDIR = [.15, .32, -1];
const T_RED = 2.47, T_HIT_RED = 3.54, T_SNUFF = 3.66, T_STEP0 = 4.55, T_ARRIVE = 4.66, T_GRAB = 4.79, T_PUNCH = 7.51, T_FLY = 7.89, T_SPLASH = 8.86;
const CGRAB = [0.06, 1.34, -1.48];          // Dazai's grip on Gojo's left wrist (world)
const SPLASH = [0.4, -1.2, -19];
const ss = (a, b, x) => clamp((x - a) / (b - a), 0, 1);
// --------------------------------------------------------------------------------------------- shared look
function LOOK(f, o = {}) {
  std(f, { pal: PAL, post: o.post || 'normal', postOver: o.postOver || {} });
  f.bg(Object.assign({ set: 'yokohama', pal: PAL, moonDir: MOONDIR, moonR: 90 }, o.bg || {}));
  f.light(Object.assign({ ambientK: .22, shadeK: .4, rimAmt: .95, rimCol: '#ffb07a', rim: vNorm([.2, .35, -1]) }, o.light || {}));
  f.grade(Object.assign({ bright: 1.06 }, o.grade || {}));
  if (o.style) f.style(o.style);
}
// --------------------------------------------------------------------------------------------- GOJO (global time)
const gP = (name, o = {}, pos = GZ0) => at(pos, PI, P(name, o));
const GOJ_K = K([
  [0.0, gP('goj_pockets', { face: expr('smug') })],
  [1.1, gP('goj_pockets', { face: expr('smug') }), 'smooth'],
  [1.3, gP('goj_blindfoldDown', { blindfold: 1, face: expr('smug') }), 'out'],
  [1.42, gP('goj_blindfoldDown', { blindfold: 1, face: expr('smug') }), 'hold'],
  [1.6, gP('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) }), 'snap'],
  [1.85, gP('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) })],
  // RED: anticipation - arm drawn back across the body (slow-out), hold, SNAP forward with overshoot
  [2.2, gP('goj_red', { st: .5, aR: [1.0, 1.4, 0], eR: 1.3, hR: 'sign', face: expr('serious', { eye: 1.1 }) }), 'out'],
  [2.36, gP('goj_red', { st: .6, sp: -.05, aR: [1.05, 1.7, 0], eR: 1.5, hR: 'sign', face: expr('serious', { eye: 1.1, lid: .3 }) }), 'out'],
  [2.43, gP('goj_red', { st: .6, sp: -.05, aR: [1.05, 1.7, 0], eR: 1.5, hR: 'sign', face: expr('serious', { eye: 1.1, lid: .3 }) }), 'hold'],
  [T_RED, gP('goj_red', { st: -.65, sp: .14, orbR: 0, face: expr('angry', { eye: 1.1 }) }), 'snap'],
  [2.62, gP('goj_red', { st: -.45, sp: .08, face: expr('serious') }), 'back'],
  [3.3, gP('goj_red', { st: -.4, sp: .06, face: expr('smug') }), 'smooth'],
  [4.45, gP('goj_stand', { face: expr('smug') }), 'smooth'],
  // FLASH STEP: crouch (anticipation) -> streak -> arrival with Blue in the LEFT hand, overshoot
  [T_STEP0, gP('goj_flash', { face: expr('serious', { eye: 1.1 }) }, [0, 0, 2.0]), 'out'],
  [T_ARRIVE, gP('goj_blueL', { orbL: 1, sp: .25, face: expr('cocky') }, [0, 0, -.84]), 'snap'],
  [4.74, gP('goj_blueL', { orbL: 1, sp: .15, face: expr('cocky') }, [0, 0, -.75]), 'back'],
  [T_GRAB, gP('goj_blueL', { orbL: 1, sp: .15, face: expr('cocky') }, [0, 0, -.75])],
  [T_GRAB + .05, gP('goj_blueL', { orbL: 0, sp: .05, hp: -.1, face: expr('surprised', { eye: 1.2 }) }, [0, 0, -.7]), 'snap'],
  [5.75, gP('goj_blueL', { orbL: 0, sp: .08, face: expr('surprised', { eye: 1.15 }) }, [0, 0, -.72]), 'smooth'],
  [5.98, gP('goj_blueL', { orbL: 0, sp: .1, face: expr('surprised', { eye: 1.15 }) }, [0, 0, -.72]), 'hold'],
  [6.12, gP('goj_blueL', { orbL: 0, sp: .1, hp: .06, face: expr('cocky', { eye: .95 }) }, [0, 0, -.72]), 'snap'],
  [6.85, gP('goj_blueL', { orbL: 0, sp: .1, hp: .06, face: expr('cocky', { eye: .95 }) }, [0, 0, -.72])],
  // PUNCH: wind-up (slow-out) -> trembling hold -> SNAP on ones (lunge) -> follow-through hold -> settle
  [7.2, gP('goj_punchWind', { st: .65, face: expr('grin', { eye: 1.05 }) }, [0, 0, -.62]), 'out'],
  [7.42, gP('goj_punchWind', { st: .8, sp: .02, face: expr('grin', { eye: 1.1, lid: .25 }) }, [0, 0, -.6]), 'out'],
  [7.47, gP('goj_punchWind', { st: .8, sp: .02, face: expr('grin', { eye: 1.1, lid: .25 }) }, [0, 0, -.6]), 'hold'],
  [T_PUNCH, gP('goj_punch', { st: -.75, sp: .3, face: expr('shout', { eye: 1.1 }) }, [0, 0, -1.05]), 'snap'],
  [T_FLY, gP('goj_punch', { st: -.7, sp: .28, face: expr('shout', { eye: 1.1 }) }, [0, 0, -1.1]), 'hold'],
  [8.05, gP('goj_punch', { st: -.85, sp: .34, face: expr('grin') }, [0, 0, -1.2]), 'back'],
  [8.9, gP('goj_punch', { st: -.5, sp: .15, aR: [1.2, .1, 0], face: expr('smug') }, [0, 0, -1.2]), 'smooth'],
  [9.3, gP('goj_stand', { face: expr('smug') }, [0, 0, -1.2]), 'smooth'],
  // ending: blindfold back up
  [9.45, gP('goj_blindfoldDown', { blindfold: 0, face: expr('smug') }, [0, 0, -1.2]), 'out'],
  [9.72, gP('goj_blindfoldDown', { blindfold: 1, face: expr('smug') }, [0, 0, -1.2]), 'inOut'],
  [10.0, gP('goj_stand', { blindfold: 1, face: expr('smug') }, [0, 0, -1.2]), 'smooth'],
]);
function gojoPose(T) {
  let p = Object.assign({}, GOJ_K(T));
  if (T >= T_GRAB && T < T_PUNCH) { p.ikHL = vAdd(CGRAB, [0, .02, .16]); p.ikWorld = true; }     // wrist held: hand sits past Dazai's grip
  if (T >= T_PUNCH && T < T_FLY) { p.ikHR = vAdd(dazaiHead(T_PUNCH), [0, -.05, .22]); p.ikWorld = true; }   // fist buried in the cheek during the hit-stop
  if (T > 6.02 && T < 6.85 && p.face) p.face = Object.assign({}, p.face, { mouthOpen: talk(T, 1.1) });  // the line
  if (T < 1.1) p = breathe(p, T);
  return p;
}
const GOJ = fig('gojo', 'eyes', gojoPose, { timing: 1, formAt: T => (T < 1.85 || T >= 9.3) ? 'base' : 'eyes', wind: T => T > T_PUNCH && T < 8.3 ? [0, .3, 3.5] : T > T_HIT_RED && T < 3.9 ? [0, 0, 2] : [.5, .1, -.6] });
// --------------------------------------------------------------------------------------------- DAZAI (global time)
const dP = (name, o = {}, pos = DZ0) => at(pos, 0, P(name, o));
const DSMILE = expr('smile', { eye: .55 });
const DAZ_K = K([
  [1.1, dP('dazai_pockets', { face: DSMILE })],
  [3.36, dP('dazai_pockets', { face: DSMILE }), 'smooth'],
  [3.52, dP('dazai_touch', { face: expr('smile', { eye: .45 }) }), 'out'],          // lazy palm (slow), meets RED
  [T_SNUFF, dP('dazai_touch', { sp: -.05, face: expr('smile', { eye: .4 }) }), 'hold'],
  [3.95, dP('dazai_touch', { face: expr('smile', { eye: .5 }) }), 'back'],
  [4.45, dP('dazai_pockets', { face: DSMILE }), 'smooth'],
  [4.74, dP('dazai_pockets', { face: expr('smile', { eye: .6 }) }), 'hold'],
  [T_GRAB, dP('dazai_grabWrist', { face: expr('smile', { eye: .5 }) }), 'snap'],
  [4.9, dP('dazai_grabWrist', { sp: .2, face: expr('smile', { eye: .5 }) }), 'back'],
  [6.9, dP('dazai_grabWrist', { sp: .18, face: expr('smirk', { eye: .5 }) }), 'smooth'],
  [7.42, dP('dazai_grabWrist', { sp: .12, face: expr('shock', { eye: 1.1 }) }), 'out'],
  [T_PUNCH, dP('t_hitHead', { face: expr('pain') }), 'snap'],
  [T_FLY, dP('t_hitHead', { face: expr('pain') }), 'hold'],
]);
function dazaiFly(T) { // ballistic flight to the water: z -2.1 -> SPLASH, apex ~2.6 m, tumbling
  const u = clamp((T - T_FLY) / (T_SPLASH - T_FLY), 0, 1), z = lerp(-2.1, SPLASH[2], 1 - Math.pow(1 - u, 1.5)), y = lerp(0, SPLASH[1], u) + 10.5 * u * (1 - u);
  return at([lerp(0, SPLASH[0], u), Math.max(SPLASH[1] - .2, y), z], 0, P('t_knockback', { ground: false, pitch: -.4 - u * 2.2, roll: u * .6, face: expr('pain') }));
}
function dazaiPose(T) {
  if (T < 1.1) { const u = T / 1.1, z = lerp(-3.05, -2.1, u); return at([0, 0, z], 0, walkCycle(T * .95, { face: faceAnim(DSMILE, T, { seed: 2 }), aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid' })); }
  if (T >= T_FLY) return dazaiFly(T);
  let p = Object.assign({}, DAZ_K(T));
  if (T >= T_GRAB && T < T_PUNCH) { p.ikHR = CGRAB; p.ikWorld = true; }
  if (T < 4.7) p = breathe(p, T);
  return p;
}
const DAZ = fig('dazai', 'base', dazaiPose, { timing: 1, wind: T => T > T_HIT_RED && T < T_SNUFF + .1 ? [0, .6, -9] : T > T_PUNCH ? [0, .5, -6] : [.6, .1, -.4] });
function dazaiHead(T) { return figPos(DAZ, T, 'head'); }
const camKick = (c, T, t0, o = {}) => camImpactKick(c, T, t0, Object.assign({ fov: -7 }, o));
const hand = (F, T, s = 'R') => figPos(F, T, 'hand' + s);

// ============================================================================================= A  0.00-1.10  standoff (low arc)
shot('A', 0.0, 1.1, (f, lt, u, T) => {
  LOOK(f);
  const e = easeInOut(clamp(lt / 1.1, 0, 1));
  f.cam(camHandheld(camLowTwo([DAZ, GOJ], T, { az: lerp(1.4, .85, e), el: lerp(-.06, .02, e), fill: .86, fov: 34 }), lt, .005, 2));
  f.fig(DAZ, { t: T }); f.fig(GOJ, { t: T });
});
// ============================================================================================= B  1.10-1.85  blindfold down, Six Eyes (hand2d ECU)
shot('B', 1.1, 1.85, (f, lt, u, T) => {
  LOOK(f, { style: 'hand2d', postOver: { bloom: .5 }, light: { rimCol: '#9fe0ff', fx: T > 1.5 ? [{ p: vAdd(figPos(GOJ, T, 'head'), [0, -.2, -.6]), col: '#5fd3ff', r: .8, a: .25 }] : [] } });
  f.trans({ type: 'inkWipe', dur: .12 });
  f.cam(camHandheld(camSlowPush(GOJ, T, 1.1, 1.85, { part: 'face', az: -.18, el: .03, from: 1.05, to: .8 }), lt, .003, 4));
  f.fig(GOJ, { t: T });
  f.fx(g => fxSixEyes(g, GOJ, T, { k: ss(1.52, 1.62, T) * (1 - .4 * ss(1.7, 1.85, T)), streak: 1 }), { layer: 'glow' });
  f.impact('SIX_EYES', { t0: 1.6 - 1.1 });
});
// ============================================================================================= C  1.85-3.35  REVERSAL: RED
shot('C', 1.85, 3.35, (f, lt, u, T) => {
  LOOK(f, { post: 'hot', light: { rimCol: '#ff6a5a', fx: [{ p: hand(GOJ, T), col: '#ff2d3a', r: 1.6, a: T > 2.2 && T < 2.7 ? .45 : .1 }] } });
  let c = closeCam(GOJ, T, { part: 'bust', dist: lerp(2.6, 2.1, ss(1.85, 2.45, T)), az: lerp(.75, .5, ss(1.85, 3.3, T)), el: -.14 }); c.fov = 44;
  c = camKick(c, T, T_RED, { fov: -9, roll: .1 });
  f.cam(camHandheld(c, lt, T > T_RED ? .009 : .004, 7));
  f.fig(DAZ, { t: T }); f.fig(GOJ, { t: T, afterimages: T > T_RED - .02 && T < T_RED + .1 ? [.03, .06] : null, afterCol: '#ff5060', afterA: .35 });
  f.fx(g => fxLimbSmear(g, GOJ, T, { joint: 'handR', span: .07, col: '#ffd0c8', alpha: .7, minPx: 60 }), { layer: 'over' });
  const a = vAdd(figPos(GOJ, Math.min(T, T_RED), 'handR'), [0, 0, -.1]);
  f.fx(g => fxRed(g, a, vNorm(vSub(vAdd(DZ0, [0, 1.3, .5]), a)), T - (T_RED - .45), { charge: .45, travel: 3.0, speed: 9, r: .17, dur: .45 + 3.0 / 9 }), { layer: 'over' });
  f.fx(g => { fxAirRings(g, a, [0, 0, -1], T - T_RED, { len: 2.5, r: .5, n: 3 }); fxShockRing(g, [0, .03, 1.9], T - T_RED, { r: 2.4, dur: .45, w: .3, col: '#ffb0a0' }); fxDebris(g, [0, .1, 1.6], T - T_RED, { n: 14 }); }, { layer: 'over' });
  f.shake([[T_RED - 1.85, 20, .45, 24]]);
  f.impact('RED_REPULSE', { t0: T_RED - 1.85 + .02 });
  f.text(g => attackTitle(g, lt, moveTitle(lt, 'REVERSAL: RED', { t0: .7, dur: .75 })));
});
// ============================================================================================= D  3.35-4.45  Red dies on Dazai's palm: NO LONGER HUMAN
shot('D', 3.35, 4.45, (f, lt, u, T) => {
  LOOK(f, { light: { rimCol: T < T_SNUFF ? '#ff5a4a' : '#cfe8ff', fx: T < T_SNUFF + .05 ? [{ p: hand(DAZ, T), col: '#ff2d3a', r: 2, a: .5 }] : [] } });
  const pc = vAdd(DZ0, [0, 1.35, .3]);
  let c = camOrbitShot(pc, lt, { r: lerp(3.0, 2.3, ss(0, .4, lt)), r1: 2.3, az0: .55, az1: .95, el0: .02, el1: .07, dur: 1.1, fov: 38 });
  c = camKick(c, T, T_HIT_RED, { fov: -5 }); c = camKick(c, T, T_SNUFF, { fov: -8, roll: -.06 });
  f.cam(camHandheld(c, lt, .005, 9));
  f.fig(DAZ, { t: hitStop(T, [[T_HIT_RED, .08]]) }); f.fig(GOJ, { t: T });
  const palm = vAdd(hand(DAZ, Math.min(T, T_SNUFF)), [0, .02, .14]);
  f.fx(g => { // RED arrives, presses on the palm for a few frames (crackle), then goes out like a candle
    if (T < T_HIT_RED) { const k = ss(3.35, T_HIT_RED, T), p = vLerp(vAdd(palm, [0, .1, 3.2]), palm, easeIn(k)), q = project(p); if (q) { g.save(); g.globalCompositeOperation = 'lighter'; hvOrb(g, q, .26 * q.s, [HVFX.red, HVFX.red2], T, { halo: 3.4, haloA: .6, spin: 9, edge: '#5a0010' }); g.restore(); fxSpeedLines(g, lt, { x: q.x, y: q.y, n: 40, inner: 220, col: '#ffd0c8', alpha: .5 }); } }
    else if (T < T_SNUFF) { const q = project(palm); if (q) { const j = (hash(Math.floor(T * 24)) - .5) * .06; g.save(); g.globalCompositeOperation = 'lighter'; hvOrb(g, q, (.3 + j) * q.s, [HVFX.red, HVFX.red2], T, { halo: 4.2, haloA: .7, spin: 14, edge: '#5a0010' }); g.restore(); fxLightning(g, palm, vAdd(palm, [.5, .6, .2]), T * 24 % 1); fxLightning(g, palm, vAdd(palm, [-.5, -.3, .3]), (T * 24 + .5) % 1); fxSparks(g, palm, T - T_HIT_RED, { n: 22, col: '#ffb0a0' }); } }
    fxSnuff(g, palm, T - T_SNUFF, { col: '#ff4a3a', size: 1.2, dur: .8 });
  }, { layer: 'over' });
  f.fx(g => fxNoLongerHuman(g, palm, T - T_SNUFF, { r: 2.6, dur: 1.0 }), { layer: 'glow' });
  f.shake([[T_HIT_RED - 3.35, 12, .14, 30], [T_SNUFF - 3.35, 6, .2, 24]]);
  f.impact('dazai_nullify', { t0: T_SNUFF - 3.35, at: palm });
  f.text(g => attackTitle(g, lt, { style: 'shonen', kind: 'silver', text: 'NO LONGER HUMAN', sub: '人間失格', t0: T_SNUFF - 3.35 + .25, dur: .65, size: 150 }));
});
// ============================================================================================= E  4.45-5.75  flash step -> Dazai catches the wrist, Infinity shatters
shot('E', 4.45, 5.75, (f, lt, u, T) => {
  LOOK(f, { light: { rimCol: T < T_GRAB ? '#7fc8ff' : '#e8f4ff', fx: T < T_GRAB + .05 && T > T_ARRIVE ? [{ p: hand(GOJ, T, 'L'), col: '#3a7bff', r: 2.2, a: .5 }] : [] } });
  const e = ss(4.45, 5.75, T);
  let c = camLowTwo([DAZ, GOJ], T, { az: lerp(-1.25, -1.45, e), el: lerp(-.04, .03, e), fill: lerp(.82, .9, ss(T_GRAB, 5.4, T)), fov: 33 });
  c = camKick(c, T, T_ARRIVE, { fov: -5 }); c = camKick(c, T, T_GRAB, { fov: -10, roll: .07 });
  f.cam(camHandheld(c, lt, .005, 11));
  const flying = T > T_STEP0 - .02 && T < T_ARRIVE + .06;
  f.fig(DAZ, { t: T }); f.fig(GOJ, { t: hitStop(T, [[T_GRAB, .1]]), afterimages: flying ? [.03, .06, .09] : null, afterCol: '#9fe0ff', afterA: .45 });
  f.fx(g => fxFlashStep(g, [0, 1.2, 2.0], [0, 1.2, -.8], T - T_STEP0, { dur: .11 }), { layer: 'glow' });
  f.fx(g => fxLimbSmear(g, DAZ, T, { joint: 'handR', span: .06, col: '#ffffff', alpha: .8, minPx: 40 }), { layer: 'over' });
  const ic = vAdd(figPos(GOJ, Math.min(T, T_GRAB), 'abd'), [0, .15, 0]);
  if (T < T_GRAB) f.fx(g => fxInfinity(g, ic, T - T_ARRIVE + .3, { r: 1.2, alpha: .8 }), { layer: 'glow' });
  f.fx(g => { const hl = hand(GOJ, Math.min(T, T_GRAB), 'L'); if (T < T_GRAB + .05 && T > T_ARRIVE - .02) fxBlue(g, vAdd(hl, [0, 0, -.12]), T - T_ARRIVE + .4, { r: .16, dur: 1.2 }); fxSnuff(g, hl, T - T_GRAB, { col: '#5fa8ff', size: .9, dur: .7 }); }, { layer: 'over' });
  f.fx(g => { fxDebris(g, ic, T - T_GRAB, { n: 26, kind: 'glass' }); fxNoLongerHuman(g, CGRAB, T - T_GRAB, { r: 3.2, dur: 1.1 }); }, { layer: 'over' });
  f.shake([[T_ARRIVE - 4.45, 8, .2, 24], [T_GRAB - 4.45, 16, .3, 30]]);
  f.impact('NLH_SHATTER', { t0: T_GRAB - 4.45 + .01, at: CGRAB });
});
// ============================================================================================= F  5.75-6.85  Gojo close-up: shock -> grin (hold, then the line)
shot('F', 5.75, 6.85, (f, lt, u, T) => {
  LOOK(f, { style: 'hand2d', light: { rimCol: '#ffb07a', fx: [{ p: vAdd(figPos(GOJ, T, 'head'), [0, -.2, -.6]), col: '#5fd3ff', r: .7, a: .2 }] } });
  f.trans({ type: 'whiteFlash', dur: .08 });
  const c = camSlowPush(GOJ, T, 5.75, 6.85, { part: 'face', az: .42, el: -.06, from: 1.25, to: .95 });
  f.cam(camHandheld(camKick(c, T, 6.12, { fov: -3 }), lt, .003, 13));
  f.fig(DAZ, { t: T }); f.fig(GOJ, { t: T });
  f.fx(g => fxSixEyes(g, GOJ, T, { k: .35 + .5 * ss(6.1, 6.2, T), streak: .6 }), { layer: 'glow' });
});
// ============================================================================================= G1 6.85-7.45  wind-up (over Dazai's shoulder, low)
shot('G1', 6.85, 7.45, (f, lt, u, T) => {
  LOOK(f, { post: 'hot', light: { rimCol: '#ff3a4a', fx: [{ p: hand(GOJ, T), col: '#ff1030', r: 1.4, a: .2 + .4 * ss(7.2, 7.42, T) }] }, grade: { bright: 1.02 } });
  const e = easeOut(ss(6.85, 7.42, T));
  const c = camPath([{ t: 0, pos: [-2.9, .8, -2.6], target: [.2, 1.5, -1.0], fov: 42, roll: .05 }, { t: .6, pos: [-2.4, .7, -2.25], target: [.2, 1.55, -.9], fov: 36, roll: .13 }])(e * .6);
  f.cam(camHandheld(c, lt, T > 7.38 ? .01 : .004, 15));
  f.fig(DAZ, { t: T }); f.fig(GOJ, { t: T });
  f.fx(g => { const fist = hand(GOJ, T), k = ss(7.15, 7.42, T); if (k > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const q = project(fist); if (q) glow(g, q.x, q.y, .5 * q.s * k, '#ff1030', .6 * k); g.restore(); for (let i = 0; i < 3; i++) fxLightning(g, fist, vAdd(fist, [(hash(i + Math.floor(T * 24)) - .5) * .9, (hash(i * 3 + Math.floor(T * 24)) - .5) * .9, (hash(i * 7) - .5) * .5]), (T * 24 + i * .3) % 1); } }, { layer: 'over' });
  f.shake([[.45, 4, .15, 40]]);
});
// ============================================================================================= G2 7.45-8.55  THE PUNCH (contact, impact frames on ones, launch)
const PUNCH_SEQ = [{ s: 'black', n: 1 }, { s: 'blackflash', n: 2 }, { s: 'speedburst', n: 1 }, { s: 'hatch', n: 2, p: { accent: '#ff1030' } }, { s: 'redblack', n: 1, p: { col: '#d0101e' } }, { s: 'invert', n: 1 }, { s: 'flash', n: 1 }];
shot('G2', 7.45, 8.55, (f, lt, u, T) => {
  LOOK(f, { post: 'hot', light: { rimCol: '#ff4a4a' }, bg: { dmg: T > T_PUNCH ? 1 : 0 } });
  const cp = vAdd(dazaiHead(T_PUNCH), [0, -.05, .2]);
  let c = camLowTwo([GOJ], T, { az: lerp(-1.05, -.8, ss(7.45, 8.55, T)), el: -.05, fill: .74, fov: 40, lead: [0, 0, -1.4] });
  c = camKick(c, T, T_PUNCH, { fov: -12, roll: -.12, dur: .45 });
  if (T > T_FLY) { const k = easeOut(ss(T_FLY, 8.4, T)); c = Object.assign({}, c, { target: vLerp(c.target, figPos(DAZ, T, 'abd'), .3 * k), fov: c.fov + 8 * k }); if (T < T_FLY + .12) f.motionBlur(18, 0); }
  f.cam(camHandheld(c, lt, T > T_PUNCH ? .012 : .005, 17));
  f.fig(DAZ, { t: T, afterimages: T > T_FLY ? [.03, .06] : null, afterCol: '#ffd0b0', afterA: .3 });
  f.fig(GOJ, { t: T, afterimages: T > T_PUNCH - .06 && T < T_PUNCH + .02 ? [.02, .04] : null, afterCol: '#ff3040', afterA: .4 });
  f.fx(g => fxLimbSmear(g, GOJ, T, { joint: 'handR', span: .06, col: '#fff0e8', alpha: .85, w: .18, minPx: 40, edge: '#ff2040' }), { layer: 'over' });
  f.fx(g => { fxBlackFlash(g, cp, T - T_PUNCH, { size: 2.2, dur: .7 }); fxAirRings(g, cp, [0, .05, -1], T - T_FLY, { len: 6, r: .9, n: 4 }); fxShockRing(g, [0, .03, -1.4], T - T_PUNCH, { r: 4, dur: .6, w: .4, col: '#ffd0c8' });
    fxCracks(g, [0, .01, -1.4], T - T_PUNCH, { r: 2.4 }); fxDebris(g, [0, .2, -1.6], T - T_FLY, { n: 30 }); fxDust(g, [0, .1, -1.4], T - T_FLY, { n: 14, col: '#e0b0a0' }); }, { layer: 'over' });
  f.fx(g => { if (T > T_FLY) fxSpeedLines(g, lt, { n: 70, inner: 300, col: '#ffffff', alpha: .55 }); }, { layer: 'top' });
  f.shake([[T_PUNCH - 7.45, 34, .7, 24]]);
  f.impact(PUNCH_SEQ, { t0: T_PUNCH - 7.45, at: cp });
  f.text(g => attackTitle(g, lt, moveTitle(lt, 'BLACK FLASH', { t0: T_FLY - 7.45 + .02, dur: .6, size: 190 })));
});
// ============================================================================================= H1 8.55-9.30  wide: the splash in the sunset (crane up)
shot('H1', 8.55, 9.3, (f, lt, u, T) => {
  LOOK(f, { bg: { dmg: 1 } });
  const e = easeOut(ss(8.55, 9.3, T));
  f.cam(camHandheld(camKick({ pos: [lerp(2.2, 2.6, e), lerp(1.4, 2.2, e), lerp(4.0, 5.0, e)], target: [lerp(-.3, -.2, e), lerp(.8, .5, e), -15], fov: lerp(36, 40, e), roll: lerp(.04, -.02, e) }, T, T_SPLASH, { fov: -5 }), lt, .006, 19));
  f.fig(GOJ, { t: T }); f.fig(DAZ, { t: T, hidden: T > T_SPLASH + .02 });
  f.fx(g => { fxWaterSplash(g, SPLASH, T - T_SPLASH, { h: 11, r: 2.6, dur: 1.3 }); fxWaterSplash(g, vAdd(SPLASH, [1.2, 0, -.8]), T - T_SPLASH - .08, { h: 6, r: 1.6, dur: 1.1 }); fxDust(g, [0, .1, -1.6], T - 8.0, { n: 10, col: '#e0b0a0' }); }, { layer: 'over' });
  f.shake([[T_SPLASH - 8.55, 8, .35, 20]]);
});
// ============================================================================================= H2 9.30-10.0  Gojo: blindfold back up (hold)
shot('H2', 9.3, 10.0, (f, lt, u, T) => {
  LOOK(f, { style: 'hand2d', light: { rimCol: '#ffb07a', rimAmt: 1 } });
  f.trans({ type: 'smear', dur: .1 });
  f.cam(camHandheld(camSlowPush(GOJ, T, 9.3, 10.0, { part: 'bust', az: .3, el: .0, from: 1.35, to: 1.1 }), lt, .003, 21));
  f.fig(GOJ, { t: T });
  f.fx(g => { for (let i = 0; i < 26; i++) { const ph = (T * .6 + hash(i)) % 1, p = vAdd(figPos(GOJ, T, 'head'), [(hash(i * 3) - .5) * 4, 1.6 - ph * 3.4, -1.5 - hash(i * 5) * 3]), q = project(p); if (!q) continue; g.fillStyle = rgba('#e8f4ff', .55 * (1 - ph)); g.beginPath(); g.ellipse(q.x, q.y, 1.5 + .01 * q.s, 6 + .04 * q.s, 0, 0, TAU); g.fill(); } }, { layer: 'over' });
});
