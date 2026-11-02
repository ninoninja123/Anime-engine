/* GDU TEST REEL (~25 s, no story, no finale): Gowther / Dazai / Urahara in motion from several angles (sakuga on ones), hand2d close-ups,
   Invasion + Herritt + Bankai effects, the new sets, impact sequences.   node render.js preview reel/gdureel out.mp4 0.5 2              */
PROGRAM.reset(24.6, 'gdureel');
// ---------------------------------------------------------------------------------------------------------- R01 library walk
const R1G = fig('gowther', 'base', t => at([-.4 + t * .05, 0, 2 - t * .7], Math.PI + .08, walkCycle(t * .85, { face: faceAnim('blank', t, { seed: 1 }), aL: [.08, .3, .1], eL: .15, hL: 'relax', aR: [.08, .3, -.1], eR: .15, hR: 'relax' })), { timing: 2 });
shot('R01_library', 0, 2.5, (f, lt) => {
  std(f, { pal: 'mindlib' }); f.light({ ambientK: .16, shadeK: .4, rimAmt: .85, rimCol: '#ffc8f0' }); f.grade({ bright: 1.1 });
  f.cam(camPath([{ t: 0, pos: [2.2, .5, 5.2], target: [0, 1.4, 0], fov: 36 }, { t: 2.5, pos: [1.3, 2.4, 3.2], target: [-.3, 1.6, -1.2], fov: 34, ease: 'inOut' }])(lt));
  f.bg({ set: 'mindlib' }); f.fig(R1G); f.fx(g => fxEmotionFlakes(g, lt + 2, { n: 26, alpha: .5 }), { layer: 'top' }); gowPinkFilm(f, lt, {});
});
// ---------------------------------------------------------------------------------------------------------- R02 Gowther close-up
const R2G = fig('gowther', 'base', t => breathe(at([0, 0, 0], .3, P('gow_tilt', { hr: .42 * Math.min(1, t / .7), glint: t > 1.0 && t < 1.25 ? 1 : 0, face: faceAnim(t < .7 ? 'curious' : 'blank', t, { seed: 3, gaze: [[0, [.2, .05]], [.8, [-.05, 0]]] }) })), t), { timing: 2, wind: t => [.4, 0, .6] });
shot('R02_face', 2.5, 4.0, (f, lt) => {
  std(f, { pal: 'mindlib', post: 'soft' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .2 }); f.light({ ambientK: .2, rimAmt: .9, rimCol: '#ffc8f0', fx: [{ p: [.6, 1.9, 1], col: '#ff7ad8', r: 3, a: .35 }] });
  f.cam(camHandheld(camSlowPush(R2G, lt, 0, 1.5, { part: 'face', az: .45, el: .05, from: 1.25, to: .95 }), lt, .003, 2)); f.bg({ set: 'mindlib' }); f.fig(R2G);
  f.fx(g => fxGlassesGlint(g, R2G, lt, lt - 1.0, { dur: .25 }), { layer: 'glow' });
});
// ---------------------------------------------------------------------------------------------------------- R03 Twin Bow Herritt (ones)
const R3G = fig('gowther', 'base', K([[0, at([0, 0, 0], .2, P('gow_stand', { bows: 0 }))], [.3, at([0, 0, 0], .2, P('gow_bowAim', { bows: .3 })), 'inOut'], [.55, at([0, 0, 0], .2, P('gow_cross', { bows: 1 })), 'snap'], [1.2, at([0, 0, 0], .2, P('gow_cross', { bows: 1 })), 'hold'], [1.4, at([0, 0, 0], .2, P('gow_rewrite', { bows: 1 })), 'back'], [2.2, at([0, 0, 0], .2, P('gow_rewrite', { bows: 1 }))]]), { timing: 1, wind: t => [.2, 0, .8] });
shot('R03_herritt', 4.0, 6.2, (f, lt) => {
  std(f, { pal: 'chess', postOver: { bloom: .35 } }); f.light({ ambientK: .15, rimAmt: .9, rimCol: '#e0c8ff', fx: [{ p: [0, 1.3, .6], col: '#c86bff', r: 2.2, a: lt > .3 ? .3 : 0 }] });
  const c = camPath([{ t: 0, orbit: { c: [0, 1.2, 0], r: 4.2, az: -.9, el: -.05 }, fov: 36 }, { t: 1.2, orbit: { c: [0, 1.3, 0], r: 3.2, az: .1, el: -.12 }, fov: 32, ease: 'inOut' }, { t: 2.2, orbit: { c: [0, 1.4, 0], r: 4.6, az: .5, el: .02 }, fov: 38, ease: 'out' }])(lt);
  f.cam(camImpactKick(c, lt, 1.4, { fov: -7, dur: .3 })); f.bg({ set: 'chess' }); f.fig(R3G);
  f.fx(g => { if (lt > 1.4) fxArrowVolley(g, [0, 2.3, .3], lt - 1.4, { n: 22, dir: [.15, -.05, 1], len: 12, spread: 2 }); }, { layer: 'glow' });
  f.shake([[1.4, 10, .3, 18]]); f.impact('gow_herritt', { t0: 1.38 });
  f.text(g => attackTitle(g, lt, { t0: .6, dur: 1.2, text: 'Twin Bow Herritt', sub: '双弓ハーリット', col2: '#f0d8ff', glow: '#c86bff' }));
});
// ---------------------------------------------------------------------------------------------------------- R04 Searchlight -> Invasion on Urahara
const R4U = fig('urahara', 'base', K([[0, at([0, 0, 0], .3, P('urahara_lean'))], [.5, at([0, 0, 0], .3, P('urahara_lean', { hp: .2, face: expr('surprised', { eye: .9 }) })), 'snap'], [1.6, at([0, 0, 0], .3, P('t_hitHead', { face: expr('pain') }))]]), { timing: 2 });
shot('R04_invasion', 6.2, 7.8, (f, lt) => {
  std(f, { pal: 'shop_morning' }); f.light({ ambientK: .2, rimAmt: .8, rimCol: '#ffe7b8' });
  f.cam(camHandheld(camPath([{ t: 0, pos: [1.6, 1.5, 3.6], target: [0, 1.4, 0], fov: 34 }, { t: 1.6, pos: [.9, 1.6, 2.4], target: [0, 1.6, 0], fov: 30, ease: 'inOut' }])(lt), lt, .006, 4)); f.bg({ set: 'shopin' }); f.fig(R4U);
  f.fx(g => { fxSearchlight(g, [-3, 1.6, 3], figPos(R4U, lt, 'head'), lt - .3, { read: 1.2 }); }, { layer: 'glow' });
  if (lt > .55) gowInvasion(f, lt - .55, { glitch: clamp((lt - .55) * 1.2, 0, .8), pixel: .18, pixelMask: true, scan: .5, tint: '#ff7ad8', tintK: .3 }); f.impact('MEMORY_REWRITE', { t0: .5 });
});
// ---------------------------------------------------------------------------------------------------------- R05 the fan (hand2d close-up)
const R5U = fig('urahara', 'base', K([[0, at([0, 0, 0], .3, P('urahara_fanFace', { fan: .03, face: faceAnim('smile', 0, {}) }))], [.45, at([0, 0, 0], .3, P('urahara_fanFace', { fan: 1, face: expr('smile', { eye: .45 }) })), 'snap'], [1.2, at([0, 0, 0], .3, P('urahara_fanFace', { fan: 1, hp: .05, face: expr('calm', { eye: .7, eyeFlash: 1, shadow: .4 }) })), 'inOut'], [1.8, at([0, 0, 0], .3, P('urahara_fanFace', { fan: 1, face: expr('calm', { eye: .7, eyeFlash: 0, shadow: .4 }) }))]]), { timing: 1 });
shot('R05_fan', 7.8, 9.6, (f, lt) => {
  std(f, { pal: 'shop_morning', post: 'soft' }); f.style('hand2d'); f.trans({ type: 'whiteFlash', dur: .1 }); f.light({ ambientK: .22, rimAmt: .9, rimCol: '#fff0d0' });
  f.cam(camHandheld(closeCam(R5U, lt, { part: 'bust', az: .3, el: .02, dist: .95 }), lt, .003, 5)); f.bg({ set: 'shopin' }); f.fig(R5U);
});
// ---------------------------------------------------------------------------------------------------------- R06 Okiro -> Nake, Benihime (ones)
const R6U = fig('urahara', 'base', K([[0, at([0, 0, 0], .5, P('urahara_okiro'))], [.4, at([0, 0, 0], .5, P('urahara_draw')), 'inOut'], [.62, at([0, 0, 0], .5, P('urahara_sing')), 'snap'], [1.4, at([0, 0, 0], .5, P('urahara_sing')), 'hold'], [2, at([.2, 0, .1], .5, P('urahara_ready')), 'out']]), { timing: 1, formAt: t => t < .4 ? 'base' : 'shikai', wind: t => [-.6, 0, .8] });
shot('R06_benihime', 9.6, 11.6, (f, lt) => {
  std(f, { pal: 'study', post: 'hot' }); f.light({ rimAmt: .9, rimCol: '#ffb0b8', fx: [{ p: [.6, 1.3, .6], col: '#ff3b4e', r: 3, a: lt > .6 ? .5 : 0 }] });
  const c = camPath([{ t: 0, pos: [-1.2, 1.0, 3.4], target: [0, 1.4, 0], fov: 32 }, { t: .62, pos: [-2.4, .6, 3.0], target: [.3, 1.3, 0], fov: 36, ease: 'in' }, { t: 2, pos: [-3.6, 1.4, 5.2], target: [1.4, 1.2, -1], fov: 40, ease: 'out' }])(lt);
  f.cam(camImpactKick(c, lt, .62, { fov: -8, roll: .07 })); f.bg({ set: 'undergrounds', dmg: 1 }); f.fx(g => fxRedReiatsu(g, R6U, lt, { amt: .35, size: .38 }), { layer: 'under' }); f.fig(R6U);
  f.fx(g => { fxSlashArc(g, R6U, lt, { span: .1, col: '#ff6a7a', edgeCol: '#ffd0d8' }); fxNakeBenihime(g, [.6, 1.1, .4], [Math.sin(.5), 0, Math.cos(.5)], lt - .62, { dur: .9, len: 10 }); }, { layer: 'over' });
  f.shake([[.62, 14, .35, 20]]); f.impact('urahara_sing', { t0: .64 });
  f.text(g => attackTitle(g, lt, { t0: .05, dur: .55, text: 'Awaken, Benihime', sub: '起きろ 紅姫', col2: '#ffd0d8', glow: '#d8243a', size: 70 }));
});
// ---------------------------------------------------------------------------------------------------------- R07 Dazai in the rain
const R7D = fig('dazai', 'wet', t => breathe(at([0, 0, 0], .25, P('dazai_think', { face: faceAnim(expr('thinking'), t, { seed: 7, gaze: [[0, [.25, .1]], [.9, [-.2, 0]]] }) })), t), { timing: 2, wind: t => [.6, -.2, .3] });
shot('R07_dazai_rain', 11.6, 13.2, (f, lt) => {
  std(f, { pal: 'alley_rain' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .2 }); f.light({ ambientK: .18, shadeK: .4, rimAmt: .95, rimCol: '#7ae0d8', fx: [{ p: [-1, 2.2, .5], col: '#ff4aa8', r: 3, a: .35 }] }); f.grade({ bright: 1.1 });
  f.cam(camHandheld(closeCam(R7D, lt, { part: 'bust', az: .5, el: .03, dist: 1.05 - lt * .04 }), lt, .004, 7)); f.bg({ set: 'yokoalley', crack: .4 }); f.fig(R7D); f.fx(g => fxRain(g, lt, { alpha: .45 }), { layer: 'top' });
});
// ---------------------------------------------------------------------------------------------------------- R08 No Longer Human on a doll (rule demo)
const R8D = fig('dazai', 'base', K([[0, at([-1.1, 0, .2], HP - .1, P('dazai_pockets'))], [.4, at([-.75, 0, .15], HP - .1, P('dazai_reach')), 'inOut'], [1.0, at([-.6, 0, .15], HP - .1, P('dazai_reach', { face: expr('smile', { eye: .5 }) }))]]), { timing: 2 });
const R8G = fig('gowther', 'base', K([[0, at([.3, 0, 0], -HP + .2, P('gow_stand'))], [.62, at([.3, 0, 0], -HP + .2, P('gow_stand')), 'hold'], [.7, at([.3, 0, 0], -HP + .2, P('gow_lifeless')), 'snap'], [2, at([.3, 0, 0], -HP + .2, P('gow_lifeless'))]]), { timing: 1 });
shot('R08_touch', 13.2, 15.2, (f, lt) => {
  std(f, { pal: 'theater' }); f.light({ ambientK: .16, shadeK: .4, rimAmt: .85, rimCol: '#ffc890' }); f.grade({ bright: 1.08 });
  f.cam(camHandheld(camTwoShot(R8D, R8G, lt, { az: .2, pad: 1.1, fov: 30 }), lt, .004, 8)); f.bg({ set: 'theater', puppets: 5, spot: [-.2, 0] }); f.fig(R8D); f.fig(R8G);
  f.fx(g => { fxNoLongerHuman(g, figPos(R8D, lt, 'handR'), lt - .62, { r: 1.2 }); if (lt < .66) fxMarionetteStrings(g, R8G, lt, [.3, 4.2, 0], 1, { col: '#ff7ad8' }); }, { layer: 'over' });
  sadNullify(f, lt - .62, { at: figPos(R8D, lt, 'handR'), r1: 700 }); if (lt < .62) gowPinkFilm(f, lt + 1, {}); f.impact('daz_nlh_doll', { t0: .64 });
});
// ---------------------------------------------------------------------------------------------------------- R09 Jack: puppet army + strings
const R9U = fig('urahara', 'shikai', t => at([0, Math.sin(t * 6) * .02, 0], .2, P('gow_jack', { hp: .3, sword: { hand: 'R', dir: [.1, -1, .1] }, hR: 'grip', face: expr('pain', { eye: .7 }) })), { timing: 2 });
shot('R09_jack', 15.2, 17.2, (f, lt) => {
  std(f, { pal: 'theater', post: 'dark' }); f.light({ ambientK: .14, rimAmt: .9, rimCol: '#ff9ce0' });
  f.cam(camPath([{ t: 0, pos: [0, .8, 6.5], target: [0, 2.2, -1], fov: 44 }, { t: 2, pos: [1.4, 1.2, 4.6], target: [0, 2.0, -1], fov: 40, ease: 'inOut' }])(lt)); f.bg({ set: 'theater', puppets: 0 });
  f.fx(g => fxPuppetArmy(g, [0, 0, -3.5], lt + 1, { n: 14, rows: 2, drop: clamp(lt / .8, 0, 1), dance: .7, spacing: 1.5 }), { layer: 'under' }); f.fig(R9U);
  f.fx(g => fxMarionetteStrings(g, R9U, lt, [0, 4.6, .3], lt), { layer: 'over' }); f.impact('PUPPET_STRINGS', { t0: 1.1 });
  f.text(g => attackTitle(g, lt, { t0: .2, dur: .9, text: 'Jack', sub: '傀儡縛り', col2: '#ffd8f4', glow: '#ff7ad8' }));
});
// ---------------------------------------------------------------------------------------------------------- R10 Bankai: curtain + doll + stitches
const R10U = fig('urahara', 'bankai', K([[0, at([0, 0, 1.2], 0, P('urahara_ready'))], [.5, at([0, 0, 1.2], 0, P('urahara_bankai')), 'snap'], [2.2, at([0, 0, 1.2], 0, P('urahara_bankai'))]]), { timing: 1 });
shot('R10_bankai', 17.2, 19.4, (f, lt) => {
  std(f, { pal: 'stitch' }); f.light({ ambientK: .15, rimAmt: .9, rimCol: '#ff5a6a' }); f.grade({ bright: 1.1 });
  f.cam(camPath([{ t: 0, pos: [0, 1.0, 7], target: [0, 1.8, 0], fov: 40 }, { t: 2.2, pos: [-1.2, .6, 9.5], target: [0, 3.4, -1], fov: 46, ease: 'inOut' }])(lt)); f.bg({ set: 'stitch', sew: clamp(lt / 2, 0, 1) });
  f.fx(g => { fxBlackCurtain(g, [0, 0, -2.6], 0, lt, { w: 9, h: 10, openAt: .8 }); fxBenihimeDoll(g, [0, 0, -1.8], 0, lt - .9, { scale: 4.4 }); }, { layer: 'under' }); f.fig(R10U);
  f.fx(g => fxStitchPath(g, [0, 0, 1.2], [0, 0, 6], lt - 1.2), { layer: 'over' }); f.impact('ura_bankai_stitch', { t0: .5 });
  f.text(g => attackTitle(g, lt, { t0: .55, dur: 1.3, text: 'Bankai: Kannonbiraki Benihime Aratame', sub: '観音開紅姫改メ', col2: '#ffd0d8', glow: '#d8243a', size: 58 }));
});
// ---------------------------------------------------------------------------------------------------------- R11 clock tower: time stop -> memory collapse
const R11G = fig('gowther', 'base', t => breathe(at([0, 0, 0], .2, P('gow_point', { face: faceAnim('cold', t, { seed: 4 }) })), t), { timing: 2 });
shot('R11_clock', 19.4, 21.0, (f, lt) => {
  std(f, { pal: 'clock' }); f.light({ ambientK: .15, rimAmt: .9, rimCol: '#ffd090' });
  f.cam(camPath([{ t: 0, pos: [2.6, 1.2, 5], target: [0, 2.6, -3], fov: 44 }, { t: 1.6, pos: [1.6, 1.6, 4], target: [0, 2.2, -2], fov: 40, ease: 'inOut' }])(lt)); f.bg({ set: 'clocktower', stop: clamp(lt / .5, 0, 1) }); f.fig(R11G);
  gowTimeStop(f, lt, { at: [0, 6.2, -9.9], dur: .4, keep: { at: figPos(R11G, lt, 'head'), r: 150 } }); gowMemoryCollapse(f, lt - .7, { at: figPos(R11G, lt, 'handR'), dur: .8 });
});
// ---------------------------------------------------------------------------------------------------------- R12 three geniuses on the board (walls change)
const R12G = fig('gowther', 'herritt', t => breathe(at([0, 0, -.6], 0, P('gow_temple', { bows: 0, face: faceAnim('blank', t, { seed: 2 }) })), t), { timing: 2 });
const R12D = fig('dazai', 'base', t => breathe(at([-2.4, 0, .4], .45, P('dazai_pockets', { face: faceAnim('smile', t, { seed: 5 }) })), t), { timing: 2 });
const R12U = fig('urahara', 'base', t => breathe(at([2.4, 0, .4], -.45, P('urahara_fanOpen', { face: faceAnim('smile', t, { seed: 6 }) })), t), { timing: 2 });
shot('R12_board', 21.0, 23.0, (f, lt) => {
  std(f, { pal: 'shift' }); f.light({ ambientK: .16, shadeK: .4, rimAmt: .85, rimCol: '#e0d8ff' }); f.grade({ bright: 1.06 });
  f.cam(camHandheld(camWideGroup([R12G, R12D, R12U], lt, { az: -.25 + lt * .12, el: .1 }), lt, .004, 9)); f.bg({ set: 'shiftarena', floor: 'chess', queens: true, from: 'books', wall: 'alley', phase: clamp(lt / 1.4, 0, 1) });
  f.fig(R12G); f.fig(R12D); f.fig(R12U); f.fx(g => { fxMindThreads(g, figPos(R12G, lt, 'handR'), vAdd(figPos(R12D, lt, 'head'), [0, .35, 0]), lt, { sag: .2 }); fxMindThreads(g, figPos(R12G, lt, 'handR'), vAdd(figPos(R12U, lt, 'head'), [0, .45, 0]), lt, { sag: .2 }); }, { layer: 'glow' });
  gowTear(f, lt - 1.5, { at: [0, 1.4, 0], hold: .15, dur: .4 });
});
// ---------------------------------------------------------------------------------------------------------- R13 inner self + rewind
const R13G = fig('gowther', 'mind', t => at([0, 1.2 + Math.sin(t * 1.5) * .06, 0], .3, P('gow_float', { mindGlow: 1 })), { timing: 2, wind: t => [0, 1.2, .2] });
shot('R13_mind', 23.0, 24.6, (f, lt) => {
  std(f, { pal: 'mind' }); f.light({ ambientK: .25, rimAmt: .9, rimCol: '#ff9ce0' });
  f.cam(camOrbitAround([0, 1.9, 0], lt, { r: 4.2, az0: .2, speed: .35, el: .05, fov: 36 })); f.bg({ set: 'mindscape', glitch: .2, crumble: clamp(lt - .4, 0, 1) * .6 }); f.fig(R13G);
  f.fx(g => fxMemoryShards(g, [0, 1.9, 0], lt + .6, { n: 12, r: 1.8, pull: clamp(lt - .6, 0, 1) }), { layer: 'over' }); gowRewind(f, lt - 1.0, { a: clamp((lt - 1) * 2, 0, 1) });
});
