/* SAD TEST REEL (~27 s, no story, no finale): Shinji / Aizen / Dazai from several angles in motion (sakuga on ones), hand2d close-ups,
   signature effects + impact sequences, the new sets.  node render.js preview reel/sadreel out.mp4 0.5 2                            */
PROGRAM.reset(27, 'sadreel');
const DZ_WALK = fig('dazai', 'base', t => { const ph = t * .9; return at([-1.2 + t * .55, 0, 1.5 - t * .1], HP - .25, walkCycle(ph, { face: faceAnim(expr('smile', { eye: .55 }), t, { seed: 2 }), aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid' })); }, { timing: 2, wind: t => [1.5, 0, 0] });
const DZ_FACE = fig('dazai', 'base', t => breathe(at([0, 0, 0], .3, P('dazai_pockets', { face: faceAnim(expr('smile', { eye: .55 }), t, { seed: 4, gaze: [[0, [.2, -.05]], [.9, [-.25, 0]]], talk: t > .6 && t < 1.3 ? .9 : 0 }) })), t), { timing: 2, wind: t => [1.2, 0, .4] });
shot('R01_canal', 0, 2.0, (f, lt) => {
  std(f, { pal: 'canal' }); f.light({ ambientK: .14, shadeK: .42, rimAmt: .85, rimCol: '#c8d8ff' }); f.grade({ bright: 1.1 });
  f.cam(camPath([{ t: 0, pos: [3.5, .5, 6.5], target: [-.4, 1.3, 1], fov: 34 }, { t: 2, pos: [2.2, .45, 5.2], target: [.4, 1.25, 1.2], fov: 32, ease: 'inOut' }])(lt));
  f.bg({ set: 'canal', moonDir: [-.25, .32, -1] }); f.fig(DZ_WALK);
});
shot('R02_dazai_face', 2.0, 3.6, (f, lt) => {
  std(f, { pal: 'canal', post: 'soft' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .25 }); f.light({ ambientK: .16, rimAmt: .9, rimCol: '#c8d8ff', fx: [{ p: [-1, 2.4, -3], col: '#ffb35a', r: 5, a: .35 }] });
  f.cam(camHandheld(closeCam(DZ_FACE, lt, { part: 'face', az: .5, el: .05, dist: 1.0 + lt * .04 }), lt, .004, 3)); f.bg({ set: 'canal' }); f.fig(DZ_FACE);
});
// ------------------------------------------------------------------------------------------------ Shinji: Taore, Sakanade (on ones)
const SH_REL = fig('shinji', 'base', K([
  [0, at([0, 0, 0], .4, P('shinji_slouch', { face: faceAnim(expr('grin', { mouthOpen: .3, eye: .6 }), 0, {}) }))],
  [.45, at([0, 0, 0], .4, P('shinji_draw', { face: expr('grin', { mouthOpen: .5, lid: .35 }) })), 'inOut'],
  [.7, at([0, 0, 0], .4, P('shinji_taore', { face: expr('grin', { mouthOpen: .7, lid: .3 }) })), 'snap'],
  [1.1, at([0, 0, 0], .4, P('shinji_spin', { sword: { hand: 'R', dir: [1, -.2, .2], ringSpin: true } })), 'back'],
  [1.35, at([0, 0, 0], .4, P('shinji_spin', { sword: { hand: 'R', dir: [0, -.2, 1], ringSpin: true } })), 'lin'],
  [1.6, at([0, 0, 0], .4, P('shinji_spin', { sword: { hand: 'R', dir: [-1, -.2, .1], ringSpin: true } })), 'lin'],
  [1.85, at([0, 0, 0], .4, P('shinji_spin', { sword: { hand: 'R', dir: [0, -.2, -1], ringSpin: true } })), 'lin'],
  [2.0, at([0, 0, 0], .4, P('shinji_spin', { sword: { hand: 'R', dir: [1, -.2, .2], ringSpin: true } })), 'lin']]), { timing: 1, formAt: t => t < .62 ? 'base' : 'shikai', wind: t => [-1, 0, 1] });
shot('R03_taore', 3.6, 5.6, (f, lt) => {
  std(f, { pal: 'harbor_teal' }); f.light({ ambientK: .14, shadeK: .42, rimAmt: .9, rimCol: '#ffc870' }); f.grade({ bright: 1.1 });
  const c = camPath([{ t: 0, orbit: { c: [0, 1.2, 0], r: 4.2, az: .9, el: .05 }, fov: 34 }, { t: 2, orbit: { c: [0, 1.3, 0], r: 3.4, az: -.2, el: .12 }, fov: 32, ease: 'inOut' }])(lt);
  f.cam(camImpactKick(c, lt, .7, { fov: 4, dur: .2 })); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(SH_REL);
  f.fx(g => { if (lt > .7) { fxRingSpin(g, SH_REL, lt); fxSakanadeMist(g, SH_REL, lt - .7, { r: 2.2, n: 18 }); } fxSlashArc(g, SH_REL, lt, { span: .08, edgeCol: '#ffd8ee' }); }, { layer: 'over' });
  f.shake([[.7, 10, .25, 20]]); f.impact('INVERT_FLIP', { t0: 1.75, at: [0, 1.4, 0] });
  f.text(g => attackTitle(g, lt, { t0: .75, dur: .9, text: 'Collapse, Sakanade', sub: '倒れろ 逆撫', col2: '#ffc8e4', glow: '#ff9ccf' }));
});
const SH_GRIN = fig('shinji', 'shikai', t => breathe(at([0, 0, 0], .2, P('shinji_shoulder', { face: faceAnim(expr('grin', { mouthOpen: .45, lid: .35, eye: .7 }), t, { talk: t > .2 && t < 1.0 ? 1 : 0, seed: 6 }) })), t), { timing: 2, wind: t => [-.8, 0, 1] });
shot('R04_inverted', 5.6, 7.0, (f, lt) => {
  std(f, { pal: 'inverted' }); f.style('hand2d'); f.light({ rimAmt: .9, rimCol: '#ffd0e8' });
  f.cam(closeCam(SH_GRIN, lt, { part: 'bust', az: .45, el: .08, dist: 1.25 })); f.bg({ set: 'sakasama', base: 'yokohama', basePal: 'harbor_teal' }); f.fig(SH_GRIN);
  f.fx(g => fxSakanadeMist(g, figPos(SH_GRIN, lt, 'handR'), lt + 1, { r: 1.2, n: 14, size: .6 }), { layer: 'over' });
  fxSakanadeWorld(f, 1, { flip: lt < .5 ? 1 - lt * 2 : 0, mirror: .5, mist: .35 });
});
// ------------------------------------------------------------------------------------------------ Aizen: Kyoka Suigetsu
const AZ_DRAW = fig('aizen', 'base', K([[0, at([0, 0, 0], -.4, P('aizen_stand'))], [.5, at([0, 0, 0], -.4, P('aizen_draw')), 'inOut'], [.9, at([0, 0, 0], -.4, P('aizen_shatter')), 'snap'], [2, at([0, 0, 0], -.4, P('aizen_shatter'))]]), { timing: 1, wind: t => [.5, 0, 1] });
shot('R05_kyoka', 7.0, 8.6, (f, lt) => {
  std(f, { pal: 'harbor_teal', post: 'soft' }); f.light({ ambientK: .14, rimAmt: .9, rimCol: '#e0d0ff' }); f.grade({ bright: 1.1 });
  f.cam(camPath([{ t: 0, pos: [-1.6, .8, 3.6], target: [0, 1.4, 0], fov: 30 }, { t: 1.6, pos: [-1.0, .7, 2.6], target: [0, 1.65, 0], fov: 28, ease: 'inOut' }])(lt));
  f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(AZ_DRAW); f.fx(g => { fxKyokaRelease(g, AZ_DRAW, lt - .9, { dur: .7 }); fxShimmer(g, [0, 1.6, 0], lt, { r: 1.2, n: 10 }); }, { layer: 'glow' });
  f.text(g => attackTitle(g, lt, { t0: .95, dur: .6, text: 'Shatter, Kyoka Suigetsu', sub: '砕けろ 鏡花水月', col2: '#e0d0ff', glow: '#b06cff', align: 'right', x: W - 120 }));
});
const AZ_FACE = fig('aizen', 'base', t => breathe(at([0, 0, 0], 0, P('aizen_stand', { face: faceAnim(expr('menace', { shadow: .45, eye: .6 }), t, { seed: 8, gaze: [[0, [0, 0]], [.8, [.15, -.05]]] }) })), t), { timing: 2, wind: t => [.4, 0, 1] });
shot('R06_mirror', 8.6, 10.6, (f, lt) => {
  std(f, { pal: 'mirror' }); f.style('hand2d'); f.trans({ type: 'whiteFlash', dur: .12 }); f.light({ rimAmt: .9, rimCol: '#f0e8ff' });
  f.cam(closeCam(AZ_FACE, lt, { part: 'face', az: -.35, el: .02, dist: 1.05 - lt * .05 })); f.bg({ set: 'mirror' }); f.fig(AZ_FACE);
  fxKyokaMirror(f, lt - 1.0, { at: figPos(AZ_FACE, lt, 'head'), reveal: 'void', hold: .2, breakDur: .7 }); f.impact('MIRROR_SHATTER', { t0: 1.0 });
});
// ------------------------------------------------------------------------------------------------ clash: Shinji slash (ones) vs Aizen's finger
const CL_SHI = fig('shinji', 'shikai', K([[0, at([-2.6, 0, 0], HP, P('shinji_slouch'))], [.3, at([-2.4, 0, 0], HP, P('slashWind', { face: expr('grin', { mouthOpen: .6 }) })), 'inOut'], [.42, at([-.35, 0, 0], HP, P('shinji_slash', { face: expr('grin', { mouthOpen: .8, lid: .4 }) })), 'snap'], [1.0, at([-.3, 0, 0], HP, P('shinji_slash')), 'hold'], [1.4, at([-1.1, 0, 0], HP, P('guard', { face: expr('surprised') })), 'out'], [2, at([-1.2, 0, 0], HP, P('guard'))]]), { timing: 1, wind: t => [0, 0, 1] });
const CL_AIZ = fig('aizen', 'base', K([[0, at([.6, 0, 0], -HP, P('aizen_stand'))], [.38, at([.6, 0, 0], -HP, P('aizen_block')), 'snap'], [2, at([.6, 0, 0], -HP, P('aizen_block', { face: expr('smirk', { eye: .55 }) }))]]), { timing: 1 });
shot('R07_clash', 10.6, 12.6, (f, lt) => {
  std(f, { pal: 'harbor_teal', post: 'hot' }); f.light({ ambientK: .14, rimAmt: .9, rimCol: '#ffc870' }); f.grade({ bright: 1.08 });
  const T = hitStop(lt, [[.42, .12]]); const c = camPath([{ t: 0, pos: [-1.5, .7, 4.2], target: [-.8, 1.3, 0], fov: 36 }, { t: .42, pos: [-.2, .9, 3.2], target: [0, 1.45, 0], fov: 30, ease: 'in' }, { t: 2, pos: [.8, 1.2, 3.6], target: [-.2, 1.35, 0], fov: 34, ease: 'out' }])(lt);
  f.cam(camImpactKick(c, lt, .42, { fov: 6, roll: .06, dur: .25 })); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(CL_SHI, { t: T, afterimages: lt < .45 ? [.03, .06, .09] : null, afterCol: '#ffe0f0' }); f.fig(CL_AIZ, { t: T });
  f.fx(g => { fxSlashArc(g, CL_SHI, T, { span: .1, edgeCol: '#ffd8ee' }); fxClash(g, vAdd(figPos(CL_AIZ, T, 'handL'), [-.05, 0, 0]), lt - .42, { col: '#e0d0ff' }); fxShockRing(g, [0, .02, 0], lt - .42, { r: 4, dur: .5 }); }, { layer: 'glow' });
  f.shake([[.42, 26, .45, 22]]); f.impact('clash_sad', { t0: .44, at: figPos(CL_AIZ, .5, 'handL') });
});
// ------------------------------------------------------------------------------------------------ Hollow mask + Cero
const SH_MASK = fig('shinji', 'shikai', K([[0, at([0, 0, 0], .3, P('shinji_slouch', { face: expr('grin', { mouthOpen: .5 }), maskK: 0 }))], [.35, at([0, 0, 0], .3, P('shinji_swipe', { maskK: 0 })), 'inOut'], [.6, at([0, 0, 0], .3, P('shinji_swipe', { maskK: .5 })), 'lin'], [.85, at([0, 0, 0], .3, P('shinji_mask', { maskK: 1 })), 'out'], [1.6, at([0, 0, 0], .3, P('shinji_mask', { maskK: 1 }))]]), { timing: 1, wind: t => [-1, .3, 1] });
shot('R08_mask', 12.6, 14.2, (f, lt) => {
  std(f, { pal: 'harbor_teal', post: 'dark' }); f.style('hand2d'); f.light({ rimAmt: 1, rimCol: '#ffd84a', fx: [{ p: vAdd(figPos(SH_MASK, lt, 'head'), [.3, .2, .6]), col: '#ffd84a', r: 2, a: .35 }] });
  f.cam(camHandheld(closeCam(SH_MASK, lt, { part: 'face', az: -.55, el: .04, dist: 1.25 }), lt, .006, 5)); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(SH_MASK);
  f.fx(g => fxShinjiHollow(g, SH_MASK, lt - .3, { size: .7 }), { layer: 'under' }); f.fx(g => fxLimbSmear(g, SH_MASK, lt, { joint: 'handL', span: .08, col: '#f1ece0' }), { layer: 'over' }); f.impact('HOLLOW_EYE', { t0: 1.3 });
});
const SH_CERO = fig('shinji', 'mask', K([[0, at([-1.5, 0, 0], HP - .2, P('shinji_cero', { aR: [1.4, .2, 0] }))], [.3, at([-1.5, 0, 0], HP - .2, P('shinji_cero')), 'snap'], [1.8, at([-1.6, 0, 0], HP - .2, P('shinji_cero'))]]), { timing: 1 });
shot('R09_cero', 14.2, 16.0, (f, lt) => {
  std(f, { pal: 'harbor_teal', post: 'hot' }); f.light({ ambientK: .12, rimAmt: 1, rimCol: '#ffd84a', fx: [{ p: [0, 1.4, 0], col: '#ffd84a', r: 6, a: lt > .4 ? .6 : .2 }] });
  f.cam(camGroup([SH_CERO], lt, { az: -.9, el: .02, fill: .55, lead: [1.2, 0, 0], fov: 34 })); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(SH_CERO);
  f.fx(g => fxShinjiCero(g, vAdd(figPos(SH_CERO, lt, 'handR'), [.3, 0, 0]), [1, 0, -.1], lt, { charge: .4, len: 50, spread: 3.5 }), { layer: 'glow' });
  f.shake([[.42, 18, .9, 26]]); f.impact('CERO_LINE', { t0: .38, at: vAdd(figPos(SH_CERO, .4, 'handR'), [.3, 0, 0]) });
  f.text(g => attackTitle(g, lt, { t0: .45, dur: 1.0, text: 'Cero', sub: '虚閃', col2: '#fff4b0', glow: '#ffd84a' }));
});
// ------------------------------------------------------------------------------------------------ Kurohitsugi on Dazai, broken from inside by No Longer Human
const DZ_KURO = fig('dazai', 'base', K([[0, at([0, 0, 0], .2, P('dazai_pockets'))], [1.25, at([0, 0, 0], .2, P('dazai_pockets')), 'hold'], [1.45, at([0, 0, 0], .2, P('dazai_touch', { face: expr('smile', { eye: .5 }) })), 'snap'], [2.2, at([0, 0, 0], .2, P('dazai_touch'))]]), { timing: 2 });
shot('R10_kurohitsugi', 16.0, 18.2, (f, lt) => {
  std(f, { pal: 'hueco', post: 'dark' }); f.cam(camPath([{ t: 0, pos: [3.6, .6, 5.4], target: [0, 1.4, 0], fov: 34 }, { t: 2.2, pos: [2.8, 1.2, 4.6], target: [0, 1.3, 0], fov: 32, ease: 'inOut' }])(lt));
  f.bg({ set: 'lasnoches' }); f.fig(DZ_KURO, { hidden: lt > .5 && lt < 1.45 });
  f.fx(g => fxKurohitsugi(g, [0, 0, 0], lt, { shatter: 1.45, scriptShatter: 1.45 }), { layer: 'over' }); f.fx(g => fxNoLongerHuman(g, figPos(DZ_KURO, lt, 'handR'), lt - 1.45), { layer: 'glow' });
  f.shake([[.45, 8, .8, 30]]); f.impact('KUROHITSUGI_BOX', { t0: .55, at: [0, 1.3, 0] });
  f.text(g => attackTitle(g, lt, { t0: .6, dur: .75, text: 'Hado #90  Kurohitsugi', sub: '黒棺', col2: '#e0c8ff', glow: '#9a4ae0', align: 'right', x: W - 120 }));
});
const DZ_TOUCH = fig('dazai', 'base', K([[0, at([0, 0, .55], Math.PI, P('dazai_pockets'))], [.5, at([0, 0, .55], Math.PI, P('dazai_grabWrist')), 'snap'], [1.8, at([0, 0, .55], Math.PI, P('dazai_grabWrist'))]]), { timing: 1 });
const AZ_TOUCHED = fig('aizen', 'base', t => breathe(at([0, 0, -.25], 0, P('aizen_handshake', { face: expr('smirk', { eye: .6 }) })), t), { timing: 2 });
shot('R11_touch', 18.2, 20.0, (f, lt) => {
  std(f, { pal: 'harbor_teal' }); f.style('hand2d'); f.light({ rimAmt: .9, rimCol: '#cfe8ff' });
  f.cam(closeCam(DZ_TOUCH, Math.max(lt, .5), { part: 'hand', az: -1.2, el: .15, dist: 1.0 })); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(AZ_TOUCHED); f.fig(DZ_TOUCH);
  const hand = figPos(DZ_TOUCH, Math.max(lt, .5), 'handR'); f.fx(g => { fxAizenAura(g, AZ_TOUCHED, lt, { amt: lt < .55 ? .6 : .6 * clamp(1 - (lt - .55) * 3, 0, 1) }); }, { layer: 'under' });
  f.fx(g => fxNoLongerHuman(g, hand, lt - .5, { r: 1.2 }), { layer: 'glow' }); f.impact('NLH_RING', { t0: .52, at: hand });
});
// ------------------------------------------------------------------------------------------------ Bankai flower, Dazai's gun, Hogyoku
shot('R12_bankai', 20.0, 21.8, (f, lt) => {
  std(f, { pal: 'harbor_teal', post: 'hot' }); f.cam(camPath([{ t: 0, pos: [0, 1.2, 14], target: [0, 3, 0], fov: 38 }, { t: 1.8, pos: [2, .6, 10], target: [0, 3.4, 0], fov: 40, ease: 'out' }])(lt));
  f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(fig('shinji', 'bankai', t => at([0, 0, 0], 0, P('shinji_bankai')), { timing: 2 }), { hidden: lt > 1.1 });
  f.fx(g => fxSakanadeFlower(g, [0, 0, 0], lt, { open: clamp(1 - (lt - .3) / .8, 0, 1), scale: 1.25 }), { layer: 'over' }); f.impact('GOLD_FLOWER', { t0: 1.1 });
  f.text(g => attackTitle(g, lt, { t0: .35, dur: .8, text: 'Bankai  Sakashima Yokoshima Happofusagari', sub: '逆様邪八方塞', col2: '#fff0b8', glow: '#e8b83a', size: 54 }));
});
const DZ_GUN = fig('dazai', 'gun', K([[0, at([-1.5, 0, .4], HP - .15, P('dazai_pockets'))], [.3, at([-1.5, 0, .4], HP - .15, P('dazai_aim')), 'snap'], [.62, at([-1.5, 0, .4], HP - .15, P('dazai_aim', { aR: [1.75, .15, 0], eR: .1 })), 'snap'], [1.0, at([-1.5, 0, .4], HP - .15, P('dazai_aim')), 'out'], [1.6, at([-1.5, 0, .4], HP - .15, P('dazai_aim'))]]), { timing: 1 });
const SH_DEF = fig('shinji', 'shikai', K([[0, at([1.2, 0, -.2], -HP, P('guard'))], [.55, at([1.2, 0, -.2], -HP, P('s_parry')), 'snap'], [1.6, at([1.2, 0, -.2], -HP, P('s_parry'))]]), { timing: 1 });
shot('R13_gun', 21.8, 23.4, (f, lt) => {
  std(f, { pal: 'canal', post: 'hot' }); f.light({ ambientK: .14, rimAmt: .9 }); f.cam(camGroup([DZ_GUN, SH_DEF], lt, { az: -.7, el: .04, fill: .8, fov: 30 }));
  f.bg({ set: 'canal' }); f.fig(DZ_GUN); f.fig(SH_DEF); const tip = swordAt(SH_DEF, lt);
  f.fx(g => { fxDazaiGun(g, DZ_GUN, lt - .58, { to: tip ? tip.base : [1.8, 1.3, 0] }); if (tip) { fxRicochet(g, tip.base, lt - .6); fxSparks(g, tip.base, lt - .6, { n: 20 }); } }, { layer: 'glow' });
  f.shake([[.58, 6, .2, 30]]); f.impact('GUN_FLASH', { t0: .58, at: sadGunMuzzle(DZ_GUN, .58) ? sadGunMuzzle(DZ_GUN, .58).p : [0, 1.4, 0] });
});
const AZ_HOG = fig('aizen', 'hogyoku', t => breathe(at([0, 0, 0], 0, P('aizen_stand', { creep: clamp(t / 1.4, 0, 1) * .9, face: faceAnim(expr('menace', { eye: .55 }), t, { seed: 9 }) })), t), { timing: 2 });
shot('R14_hogyoku', 23.4, 25.4, (f, lt) => {
  std(f, { pal: 'hueco', post: 'hot' }); f.style('hand2d'); f.light({ rimAmt: 1, rimCol: '#d8b0ff', fx: [{ p: vAdd(figPos(AZ_HOG, lt, 'abd'), [0, .1, .4]), col: '#b06cff', r: 1.6, a: .5 }] });
  f.cam(camHandheld(closeCam(AZ_HOG, lt, { part: 'bust', az: -.2, el: -.15, dist: 1.4 - lt * .1 }), lt, .005, 7)); f.bg({ set: 'lasnoches' }); f.fig(AZ_HOG);
  f.fx(g => { fxAizenAura(g, AZ_HOG, lt, { amt: .5 }); }, { layer: 'under' }); f.fx(g => fxHogyoku(g, vAdd(figPos(AZ_HOG, lt, 'abd'), [0, .12, .16]), lt, { mode: 'orb', r: .03 }), { layer: 'glow' });
  f.shake([[1.5, 5, .5, 20]]); f.impact('VIOLET_PRESSURE', { t0: 1.6 });
});
// ------------------------------------------------------------------------------------------------ standoff (camGroup keeps all three large)
const ST_SHI = fig('shinji', 'shikai', t => breathe(at([-1.3, 0, .3], .8, P('shinji_shoulder')), t), { timing: 2, wind: t => [1, 0, 0] });
const ST_AIZ = fig('aizen', 'base', t => breathe(at([1.3, 0, .1], -.8, P('aizen_stand')), t), { timing: 2, wind: t => [1, 0, 0] });
const ST_DAZ = fig('dazai', 'base', t => breathe(at([0, 0, -.9], 0, P('dazai_pockets')), t), { timing: 2, wind: t => [1, 0, 0] });
shot('R15_standoff', 25.4, 27, (f, lt) => {
  std(f, { pal: 'harbor_teal' }); f.light({ ambientK: .14, shadeK: .42, rimAmt: .9, rimCol: '#ffc870' }); f.grade({ bright: 1.1 });
  f.cam(camGroup([ST_SHI, ST_AIZ, ST_DAZ], lt, { az: .05 + lt * .05, el: .08, fill: .78, fov: 30 })); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(ST_SHI); f.fig(ST_AIZ); f.fig(ST_DAZ);
  f.trans({ type: 'smear', dur: .2 });
});
