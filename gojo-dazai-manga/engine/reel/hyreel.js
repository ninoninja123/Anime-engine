/* HY TEST REEL (~26 s, no story, no finale): Hulk + Yujiro in motion (sakuga on ones), the one arena (dmg 0 -> 3, palettes), star crowd, hand2d close-ups,
   Hulk landing / roar / haymaker / ground pound / thunderclap, Yujiro sniff + heartbeat / walk / Ogre Fist / Oni no Se, COMIC + BAKI lettering.
   node render.js preview reel/hyreel out.mp4 0.5 2                                                                                                   */
PROGRAM.reset(26, 'hyreel');
const HXR = -3.2, YXR = 3.0;
const atHk = (p, o, x = HXR, z = 0) => at([x, 0, z], HP, P(p, o)), atYj = (p, o, x = YXR, z = 0) => at([x, 0, z], -HP, P(p, o));
const LEDGE_SIT = () => HY.ledgeSit('yuj_eat', { face: faceAnim('chew', 0, { talk: 1.4 }) });
// ---------------------------------------------------------------------------------------------------- R01 arena, Yujiro eats on the ledge (crane down)
const R1Y = fig('yujiro', 'base', t => { const p = LEDGE_SIT(); p.face = faceAnim('chew', t, { talk: 1.3, seed: 3 }); return breathe(p, t); }, { timing: 2 });
shot('R01_arena', 0, 2.6, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.light({ ambientK: .18, shadeK: .42, rimAmt: .8, rimCol: '#ffb070' });
  const L = HY.LEDGE.pos; f.cam(camPath([{ t: 0, pos: [2, 24, 26], target: [0, 8, -16], fov: 48 }, { t: 2.6, pos: [L[0] - 5.2, 1.3, L[2] + 2.2], target: [L[0] - .3, .9, L[2] + .4], fov: 34, ease: 'inOut' }])(lt));
  f.bg({ set: 'hyarena', pal: 'arena_hy', react: 'hush', ripple: .6, spots: .7 }); f.fig(R1Y); ['shunsui', 'dazai', 'aizen', 'urahara', 'gojo'].forEach(k => crowdStar(f, k, 'hush'));
});
// ---------------------------------------------------------------------------------------------------- R02 Hulk lands (meteor -> crater)
const R2H = fig('hulk', 'base', K([[0, at([-14, 26, 6], HP, P('hlk_meteor')), 'lin'], [.62, at([-3.2, 1.2, 0], HP, P('hlk_meteor')), 'in'], [.7, atHk('hlk_land'), 'snap'], [1.6, atHk('hlk_land'), 'hold'], [1.8, atHk('hlk_stand', { face: expr('growl') }), 'out']]), { timing: 1 });
shot('R02_land', 2.6, 4.4, (f, lt) => {
  std(f, { pal: 'arena_hy', post: 'hot' }); f.light({ ambientK: .18, shadeK: .42, rimAmt: 1, rimCol: '#b8ff8a', fx: lt > .7 && lt < 1.4 ? [{ p: [-3, .4, 0], col: '#7dff4a', r: 6, a: .5 }] : [] });
  f.cam(camShake(camPath([{ t: 0, pos: [6, 1.2, 14], target: [-6, 9, 2], fov: 42 }, { t: .7, pos: [5, .8, 11], target: [-3, 1.8, 0], fov: 40, ease: 'out' }, { t: 1.8, pos: [3.5, .9, 9.5], target: [-3, 2.2, 0], fov: 38 }])(lt), [[.7, 40, .6, 24]], lt));
  f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: lt < .7 ? 0 : 1, react: lt < .7 ? 'hush' : 'gasp' }); f.fig(R2H);
  f.fx(g => { if (lt < .7) fxMeteorTrail(g, [-14, 28, 6], figPos(R2H, lt, 'pelvis'), lt, { w: 1.6 }); }, { layer: 'glow' });
  f.fx(g => { fxSmashWave(g, [-3.2, 0, 0], lt - .7, { r: 10, glow: true }); fxGammaBurst(g, [-3.2, .5, 0], lt - .7, { size: 3 }); }, { layer: 'over' });
  f.impact('GAMMA_BURST', { t0: .7, at: [-3.2, .5, 0] });
});
// ---------------------------------------------------------------------------------------------------- R03 roar (hand2d, worm's-eye)
const R3H = fig('hulk', 'base', K([[0, atHk('hlk_stand', { face: expr('growl') })], [.35, atHk('hlk_roar', { face: expr('roar'), rage: .6 }), 'snap'], [1.6, atHk('hlk_roar', { face: expr('roar'), rage: 1 }), 'hold']]), { timing: 1 });
shot('R03_roar', 4.4, 6.0, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.style('hand2d'); f.trans({ type: 'whiteFlash', dur: .08 }); f.light({ ambientK: .2, shadeK: .42, rimAmt: 1, rimCol: '#9cff6a' });
  f.cam(camShake(camGiant(R3H, lt, { az: .5, dist: 3.4, fov: 48, look: .9 }), [[.35, 18, 1.2, 20]], lt)); f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: 1, react: 'gasp' }); f.fig(R3H);
  f.fx(g => fxRoarRings(g, R3H, lt - .35, { dur: .6 }), { layer: 'over' }); f.fx(g => fxRageSteam(g, R3H, lt, { k: lt > .35 ? 1 : .2 }), { layer: 'over' });
  f.impact('ROAR_RINGS', { t0: .38 }); f.text(g => attackTitle(g, lt, { text: 'RAAAGH!', style: 'comic', kind: 'gamma', t0: .45, dur: .8, y: H * .3, x: W * .66 }));
});
// ---------------------------------------------------------------------------------------------------- R04 Yujiro sniff -> grin (hand2d, heartbeat)
const R4Y = fig('yujiro', 'base', t => breathe(atYj('yuj_sniff', { face: t < .7 ? faceAnim('sniff', t) : faceAnim('relish', t, { seed: 4 }), hp: lerp(-.5, -.15, clamp((t - .6) / .3, 0, 1)) }), t), { timing: 2, wind: t => [-.3, 0, .2] });
shot('R04_sniff', 6.0, 7.4, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.style('hand2d'); f.light({ ambientK: .22, shadeK: .4, rimAmt: 1, rimCol: '#ff5a3a', rim: vNorm([.6, .3, -.6]) });
  f.cam(camHandheld(camSlowPush(R4Y, lt, 0, 1.4, { part: 'face', az: -.35, el: -.05, from: 1.25, to: .95 }), lt, .003, 2)); f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: 1, react: 'hush' }); f.fig(R4Y);
  hyHeartbeat(f, lt, { beats: [.75, .97], k: 1, at: figPos(R4Y, lt, 'head') }); f.impact('INK_STARE', { t0: .8 });
});
// ---------------------------------------------------------------------------------------------------- R05 star reactions (Shunsui, Dazai)
shot('R05a_shunsui', 7.4, 8.15, (f, lt) => starShot(f, 'shunsui', 'hush', lt, { dmg: 1, cam: { az: .25, el: -.06, dist: 1.1 } }));
shot('R05b_dazai', 8.15, 8.8, (f, lt) => starShot(f, 'dazai', 'smile', lt, { dmg: 1, cam: { az: -.3, dist: 1.05 } }));
// ---------------------------------------------------------------------------------------------------- R06 haymaker (ones, orbit) -> Yujiro slips
const R6H = fig('hulk', 'base', K([[0, atHk('hlk_stand', {}, -2.2)], [.35, atHk('hlk_haymakerWind', {}, -2.2), 'out'], [.55, atHk('hlk_haymaker', {}, -1.4), 'snap'], [1.4, atHk('hlk_haymaker', {}, -1.4), 'hold'], [2.2, atHk('hlk_stand', { face: expr('confused') }, -1.6), 'smooth']]), { timing: 1 });
const R6Y = fig('yujiro', 'base', K([[0, atYj('yuj_pockets', {}, 1.2)], [.5, atYj('yuj_pockets', {}, 1.2), 'hold'], [.58, at([1.4, 0, -.9], -HP - .4, P('yuj_pockets', { sp: .2, ss: .3, face: expr('relish') })), 'snap'], [2.2, at([1.4, 0, -.9], -HP - .4, P('yuj_pockets', { face: expr('relish') })), 'hold']]), { timing: 1 });
shot('R06_haymaker', 8.8, 11.0, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.light({ ambientK: .18, shadeK: .42, rimAmt: .9, rimCol: '#ffb070' });
  f.cam(camImpactKick(camHandheld(camLowTwo([R6H, R6Y], lt, { az: .6 - lt * .25, fill: .78 }), lt, .006), lt, .55, { fov: 6, roll: .06 }));
  f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: 1, react: 'roar' }); f.fig(R6H, { afterimages: lt > .45 && lt < .7 ? [.03, .06] : undefined, afterCol: '#9cff6a' }); f.fig(R6Y, { afterimages: lt > .5 && lt < .7 ? [.03] : undefined, afterCol: '#ff4a3a' });
  f.fx(g => { fxAirPressure(g, figPos(R6H, lt, 'handR'), [1, 0, 0], lt - .55); fxLimbSmear && fxLimbSmear(g, R6H, lt, { joint: 'handR', span: .12 }); }, { layer: 'over' });
  f.impact('COMIC_POW', { t0: .58, text: 'WHOOSH!', kind: 'purple' }); f.text(g => attackTitle(g, lt, { text: 'SMASH!', style: 'comic', t0: .62, dur: .9, x: W * .3, y: H * .3 }));
});
// ---------------------------------------------------------------------------------------------------- R07 ground pound -> shockwave + slabs (dmg 2)
const R7H = fig('hulk', 'rage', K([[0, atHk('hlk_stand', { rage: .5 }, -2.5)], [.45, atHk('hlk_groundPoundWind', { rage: 1 }, -2.5), 'out'], [.62, atHk('hlk_groundPound', { rage: 1 }, -2.5), 'snap'], [2, atHk('hlk_groundPound', { rage: 1 }, -2.5), 'hold']]), { timing: 1 });
shot('R07_pound', 11.0, 13.0, (f, lt) => {
  std(f, { pal: 'arena_hy_dust' }); f.light({ ambientK: .2, shadeK: .42, rimAmt: 1, rimCol: '#9cff6a' });
  f.cam(camShake(camPath([{ t: 0, pos: [4, 2.2, 10], target: [-2.5, 2.2, 0], fov: 38 }, { t: .62, pos: [5, 3.4, 12], target: [-2.5, 1.8, 0], fov: 40, ease: 'out' }, { t: 2, pos: [7, 6, 16], target: [-2, 1, 0], fov: 44, ease: 'out' }])(lt), [[.62, 46, .9, 22]], lt));
  f.bg({ set: 'hyarena', pal: 'arena_hy_dust', dmg: lt < .62 ? 1 : 2, react: 'gasp' }); f.fig(R7H);
  f.fx(g => { fxSmashWave(g, [-1.6, 0, 0], lt - .62, { r: 13, glow: true }); fxConcreteSpray(g, [-1.6, .2, 0], lt - .62, { size: 2 }); }, { layer: 'over' }); f.fx(g => fxRageSteam(g, R7H, lt, { k: 1 }), { layer: 'over' });
  f.impact('CONCRETE_SHATTER', { t0: .64, at: [-1.6, .3, 0] }); f.text(g => attackTitle(g, lt, { text: 'HULK SMASH!', style: 'comic', t0: .72, dur: 1.0 }));
});
// ---------------------------------------------------------------------------------------------------- R08 thunderclap (dome, torches gutter)
const R8H = fig('hulk', 'rage', K([[0, atHk('hlk_clapWind', { rage: 1 }, -2.5)], [.4, atHk('hlk_clapWind', { rage: 1 }, -2.5), 'hold'], [.5, atHk('hlk_clap', { rage: 1 }, -2.5), 'snap'], [1.6, atHk('hlk_clap', { rage: 1 }, -2.5), 'hold']]), { timing: 1 });
shot('R08_clap', 13.0, 14.6, (f, lt) => {
  const dk = clamp((lt - .5) / .4, 0, 1); std(f, { pal: dk > .5 ? 'arena_hy_dark' : 'arena_hy_dust' }); f.light({ ambientK: .2, shadeK: .42, rimAmt: 1, rimCol: '#cfe8ff' });
  f.cam(camShake(camHandheld({ pos: [6.5, 1.4, 6.5], target: [-2, 2.4, 0], fov: 42 }, lt, .006), [[.5, 36, .8, 26]], lt));
  f.bg({ set: 'hyarena', pal: dk > .5 ? 'arena_hy_dark' : 'arena_hy_dust', dmg: 2, torch: 1 - dk * .85, react: 'gasp' }); f.fig(R8H);
  f.fx(g => fxThunderclap(g, figPos(R8H, lt, 'handR'), lt - .5, { r: 16 }), { layer: 'over' });
  f.impact('SHOCKWAVE_RING', { t0: .5, at: figPos(R8H, .5, 'handR') }); f.text(g => attackTitle(g, lt, { text: 'THUNDERCLAP!', style: 'comic', kind: 'purple', t0: .58, dur: .8, y: H * .32 }));
});
// ---------------------------------------------------------------------------------------------------- R09 Yujiro strolls through the dust (floor-level tracking)
const R9Y = fig('yujiro', 'base', t => breathe(at([6 - t * 1.1, 0, .5], -HP, HY.yujWalk(t * .9, { face: faceAnim('stoic', t, { seed: 9 }) })), t), { timing: 2, wind: t => [.6, 0, .3] });
shot('R09_walk', 14.6, 16.6, (f, lt) => {
  std(f, { pal: 'arena_hy_dust' }); f.light({ ambientK: .2, shadeK: .42, rimAmt: 1, rimCol: '#ff5a3a', rim: vNorm([-.4, .3, -.8]) });
  const p = figPos(R9Y, lt, 'pelvis'); f.cam(camFloor(lt, { target: [p[0], 1.3, p[2]], az: -.5, dist: 6.5, h: .3, fov: 34 }));
  f.bg({ set: 'hyarena', pal: 'arena_hy_dust', dmg: 2, dust: .9, react: 'hush' }); f.fig(R9Y); f.fx(g => fxOgreAura(g, R9Y, lt, { k: .5 }), { layer: 'under' });
  hyHeatHaze(f, lt, { at: figPos(R9Y, lt, 'abd'), r: 330, k: .8 });
});
// ---------------------------------------------------------------------------------------------------- R10 Ogre Fist (ones) -> Hulk staggers
const R10Y = fig('yujiro', 'base', K([[0, atYj('yuj_punchWind', {}, 1.2)], [.3, atYj('yuj_punchWind', {}, 1.2), 'hold'], [.38, atYj('yuj_punch', {}, .9), 'snap'], [2, atYj('yuj_punch', {}, .9), 'hold']]), { timing: 1 });
const R10H = fig('hulk', 'base', K([[0, atHk('hlk_stand', {}, -1.4)], [.4, atHk('hlk_stand', {}, -1.4), 'hold'], [.5, atHk('hlk_stagger', {}, -2.6), 'snap'], [2, atHk('hlk_stagger', {}, -3.0), 'out']]), { timing: 1 });
shot('R10_ogrefist', 16.6, 18.6, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.light({ ambientK: .18, shadeK: .42, rimAmt: 1, rimCol: '#ff5a3a' });
  f.cam(camShake(camImpactKick(camLowTwo([R10H, R10Y], lt, { az: -.25, fill: .8 }), lt, .38, { fov: 8 }), [[.38, 30, .5, 24]], lt));
  f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: 2, react: 'roar' }); f.fig(R10H, { t: hitStop(lt, [[.38, .1]]) }); f.fig(R10Y, { t: hitStop(lt, [[.38, .1]]) });
  f.fx(g => { fxAirPressure(g, figPos(R10Y, .38, 'handR'), [-1, 0, 0], lt - .38); fxInkSplash(g, figPos(R10Y, .38, 'handR'), lt - .38, { size: 1.2 }); fxBoneCrack(g, figPos(R10H, .45, 'abd'), lt - .42); }, { layer: 'over' });
  f.impact('INK_SPLASH_HIT', { t0: .38, at: figPos(R10Y, .38, 'handR') }); f.text(g => attackTitle(g, lt, { text: 'OGRE FIST', sub: '鬼拳', style: 'baki', t0: .5, dur: 1.1 }));
});
// ---------------------------------------------------------------------------------------------------- R11 Oni no Se (back to camera, hand2d)
const R11Y = fig('yujiro', 'oni', K([[0, at([1, 0, 0], Math.PI, P('yuj_tense', { oni: 0 }))], [.5, at([1, 0, 0], Math.PI, P('yuj_tense', { oni: .3 })), 'smooth'], [1.3, at([1, 0, 0], Math.PI, P('yuj_flex', { oni: 1 })), 'snap'], [3, at([1, 0, 0], Math.PI, P('yuj_flex', { oni: 1 })), 'hold']]), { timing: 2 });
shot('R11_oni', 18.6, 21.6, (f, lt) => {
  std(f, { pal: 'arena_hy_red' }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .45, rimAmt: 1, rimCol: '#ff3a2a', rim: vNorm([0, .4, -1]) });
  const S = figSkel(R11Y, lt), c = vLerp(S.J.abd, S.J.neck, .45); f.cam(camShake(camHandheld({ pos: vAdd(c, [.3, -.2, 2.7 - lt * .25]), target: vAdd(c, [0, .05, 0]), fov: 40 }, lt, .004), [[1.3, 16, .8, 18]], lt));
  f.bg({ set: 'hyarena', pal: 'arena_hy_red', dmg: 2, react: 'hush' }); f.fig(R11Y); f.fx(g => { fxOgreAura(g, R11Y, lt, { k: clamp(lt - .3, 0, 1) }); }, { layer: 'under' }); f.fx(g => { fxOniSmoke(g, R11Y, lt, { k: clamp(lt - .8, 0, 1) }); fxMusclePump(g, R11Y, lt, { k: lt > 1.3 && lt < 2 ? 1 : 0 }); }, { layer: 'over' });
  f.impact('ONI_FACE', { t0: 1.3 }); f.text(g => { attackTitle(g, lt, { text: 'DEMON BACK', sub: '鬼の貌', style: 'baki', t0: 1.55, dur: 1.2, align: 'right' }); fxMenaceKana(g, lt - .2, { x: 220, y: 200, size: 110 }); });
});
// ---------------------------------------------------------------------------------------------------- R12 the arena breaks (dmg 3, collapse, fires, gamma), from the stands
const R12H = fig('hulk', 'rage', t => breathe(atHk('hlk_roar', { rage: 1 }, -3), t), { timing: 2 }), R12Y = fig('yujiro', 'oni', t => breathe(atYj('yuj_guardless', {}, 3), t), { timing: 2 });
shot('R12_collapse', 21.6, 24.0, (f, lt) => {
  std(f, { pal: 'arena_hy_red' }); f.light({ ambientK: .2, shadeK: .42, rimAmt: 1, rimCol: '#ff7a3a' });
  f.cam(camHandheld(camPath([{ t: 0, ...camStands(0, { tier: 2, ang: 1.15, fov: 46 }) }, { t: 2.4, ...camStands(0, { tier: 1, ang: .95, fov: 36 }), ease: 'inOut' }])(lt), lt, .006, 5));
  f.bg({ set: 'hyarena', pal: 'arena_hy_red', dmg: 3, gamma: 1, react: 'gasp', collapse: { a: 2.0, t0: .3 } }); f.fig(R12H); f.fig(R12Y);
  ['gowther', 'shinji', 'harry'].forEach(k => crowdStar(f, k, 'gasp')); f.fx(g => fxCrowdFG(g, lt, { n: 7, size: 360, react: 'gasp', rim: '#ff6a3a' }), { layer: 'over' }); f.fx(g => fxRageSteam(g, R12H, lt, { k: 1 }), { layer: 'over' });
});
// ---------------------------------------------------------------------------------------------------- R13 face-off: looking up at Hulk (bright end frame)
const R13H = fig('hulk', 'rage', t => breathe(atHk('hlk_stand', { rage: 1, face: faceAnim('roar', t, { talk: .6 }) }, -1.3), t), { timing: 2 }), R13Y = fig('yujiro', 'oni', t => breathe(atYj('yuj_chinUp', { face: faceAnim('oniGrin', t) }, 1.0), t), { timing: 2 });
shot('R13_faceoff', 24.0, 26.0, (f, lt) => {
  std(f, { pal: 'arena_hy_dawn' }); f.light({ ambientK: .24, shadeK: .4, rimAmt: 1, rimCol: '#fff0d0' });
  f.cam(camHandheld(camPath([{ t: 0, ...camLookUp(R13Y, R13H, 0, { side: 'R', dist: 1.0, fov: 46 }) }, { t: 2, ...camLowTwo([R13H, R13Y], 2, { az: 1.35, fill: .8 }), ease: 'inOut' }])(lt), lt, .004, 7));
  f.bg({ set: 'hyarena', pal: 'arena_hy_dawn', dmg: 3, react: 'hush' }); f.fig(R13H); f.fig(R13Y); f.fx(g => fxRageSteam(g, R13H, lt, { k: .7 }), { layer: 'over' });
});
