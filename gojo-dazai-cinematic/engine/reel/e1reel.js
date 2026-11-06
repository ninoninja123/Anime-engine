/* E1 TEST REEL (~24 s, no story/spoilers): Rengoku, Akaza, Deku, Shigaraki (+ Urahara) in motion from several angles,
   hand2d close-ups, signature effects + impact sequences, the new sets_a stages.
   node render.js stills reel/e1reel <dir> 1,2,3 0.5   |   node render.js preview reel/e1reel out.mp4 0.5            */
PROGRAM.reset(24, 'e1reel');
const WIND = t => [3, 0, 1];
// ------------------------------------------------------------------------------------------------ Rengoku
const RG1 = fig('rengoku', 'base', t => breathe(at([0, 0, 0], .3, P('rengoku_arms', { face: faceAnim('smile', t, { talk: t > .8 && t < 1.9 ? 1 : 0, seed: 2 }) })), t), { timing: 2, wind: WIND });
shot('R01_mugen', 0, 2.4, (f, lt) => {
  std(f, { pal: 'predawn', post: 'soft' }); f.trans({ type: 'whiteFlash', dur: .15 });
  f.cam(camPath([{ t: 0, orbit: { c: [0, 1.0, 0], r: 6.5, az: -.9, el: -.05 }, fov: 32 }, { t: 2.4, orbit: { c: [0, 1.15, 0], r: 4.4, az: .1, el: .02 }, fov: 30, ease: 'inOut' }])(lt));
  f.light({ rim: vNorm([.5, .3, -.8]), rimCol: '#ffd8a0', rimAmt: .7 });
  f.bg({ set: 'mugen' }); f.fig(RG1);
  f.fx(g => fxEmbers(g, lt, { n: 70, c: [0, 0, 0], r: 6, h: 4 }), { layer: 'glow' });
});
shot('R02_rengoku_face', 2.4, 3.6, (f, lt) => {
  std(f, { pal: 'predawn', post: 'hot' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .25 });
  f.cam(camHandheld(closeCam(RG1, 1.6 + lt, { part: 'face', az: .45, el: .04, dist: 1.0 - lt * .06 }), lt, .004, 3));
  f.light({ rimAmt: .8, rimCol: '#ffb060', fx: [{ p: vAdd(figPos(RG1, 1.6, 'head'), [.6, -.3, .4]), col: '#ff8a3a', r: 2.5, a: .45 }] });
  f.bg({ set: 'mugen' }); f.fig(RG1, { t: 1.6 + lt });
  f.fx(g => fxEmbers(g, lt, { n: 40, c: figPos(RG1, 1.6, 'head'), r: 1.2, h: 1.5 }), { layer: 'glow' });
});
const RG2 = fig('rengoku', 'flame', [
  [0, at([-4, 0, 0], HP, P('rengoku_stance'))], [.32, at([-4.2, 0, 0], HP, P('rengoku_unknowingWind')), 'inOut'], [.46, at([4, 0, 0], HP, P('rengoku_unknowing')), 'snap'], [1.6, at([4.3, 0, 0], HP, P('rengoku_unknowing', { sp: .5 })), 'out']], { timing: 1, wind: WIND });
shot('R03_unknowing', 3.6, 5.2, (f, lt) => {
  std(f, { pal: 'predawn', post: 'hot' });
  f.cam(camPath([{ t: 0, pos: [-5.5, 1.0, 5.5], target: [-4, 1.2, 0], fov: 36 }, { t: .32, pos: [-5.2, .9, 5.2], target: [-3.8, 1.2, 0], fov: 36 }, { t: .5, pos: [2.5, .8, 4.8], target: [4, 1.3, 0], fov: 38, ease: 'snap' }, { t: 1.6, pos: [3.0, .9, 4.4], target: [3.8, 1.3, 0], fov: 36 }])(lt));
  if (lt > .32 && lt < .5) f.motionBlur(60, 0);
  f.bg({ set: 'mugen' }); f.fig(RG2, { afterimages: lt > .32 && lt < .7 ? [.03, .06, .09] : [], afterCol: '#ff8a3a', afterA: .45 });
  f.fx(g => fxUnknowingFire(g, [-4, 1.15, 0], [4.6, 1.15, 0], lt - .33, { w: .6 }), { layer: 'over' });
  f.fx(g => fxFlameTrail(g, RG2, lt), { layer: 'over' });
  f.impact('rengoku_unknowing', { t0: .47, at: [4, 1.2, 0] }); f.shake([[.47, 26, .45]]);
  f.text(g => attackTitle(g, lt, { t0: .6, dur: .8, text: 'Flame Breathing · First Form: Unknowing Fire', sub: '炎の呼吸 壱ノ型 不知火', size: 64, col: '#fff2c8', col2: '#ffb22a', edge: '#5a0806' }));
  sfx(3.6 + .47, 'big_slash', { shot: 'R03' });
});
const RG3 = fig('rengoku', 'ninth', [
  [0, at([0, 0, -1], 0, P('rengoku_stance'))], [.55, at([0, 0, -1], 0, P('rengoku_tigerWind')), 'inOut'], [.75, at([0, 0, -.2], 0, P('rengoku_tiger')), 'snap'], [1.8, at([0, 0, -.1], 0, P('rengoku_tiger', { sp: .65 })), 'out']], { timing: 1, wind: WIND });
shot('R04_tiger', 5.2, 7.0, (f, lt) => {
  std(f, { pal: 'eternal', post: 'hot' }); f.trans({ type: 'smear', dur: .15 });
  f.cam(camPath([{ t: 0, pos: [2.2, .5, 4.2], target: [0, 1.5, -.5], fov: 38, roll: -.08 }, { t: .75, pos: [1.2, .6, 3.4], target: [0, 1.4, -.5], fov: 44, roll: .05, ease: 'snap' }, { t: 1.8, pos: [.6, .7, 3.0], target: [0, 1.4, 0], fov: 46, roll: .06 }])(lt));
  f.light({ fx: [{ p: [0, 1.5, .8], col: '#ff7a1a', r: 5, a: .7 }], rimCol: '#ffb040', rimAmt: .8 });
  f.bg({ set: 'nexus', dmg: 1 }); f.fig(RG3);
  f.fx(g => fxFlameTrail(g, RG3, lt, { span: .12, w: .26 }), { layer: 'over' });
  f.fx(g => fxFlameTiger(g, [0, 1.5, -.6], [.15, -.05, 1], lt - .72, { scale: 1.6, travel: 1.1 }), { layer: 'over' });
  f.fx(g => fxEmbers(g, lt, { n: 80, c: [0, 0, 0], r: 4, h: 4 }), { layer: 'glow' });
  f.impact('rengoku_tiger', { t0: .78, at: [0, 1.5, 1.5] }); f.shake([[.78, 30, .6]]);
  f.text(g => attackTitle(g, lt, { t0: 1.05, dur: .6, text: 'Fifth Form: Flame Tiger', sub: '伍ノ型 炎虎', size: 72, col: '#fff2c8', col2: '#ffb22a', edge: '#5a0806' }));
  sfx(5.2 + .78, 'flame_roar', { shot: 'R04' });
});
// ------------------------------------------------------------------------------------------------ Akaza
const AK1 = fig('akaza', 'compass', t => breathe(at([0, 0, 0], -.2, P('akaza_compass', { face: faceAnim('grin', t, { seed: 4 }) })), t, 1.3), { timing: 2, wind: WIND });
shot('R05_compass', 7.0, 8.4, (f, lt) => {
  std(f, { pal: 'eternal', post: 'normal' }); f.trans({ type: 'whiteFlash', dur: .12 });
  f.cam(camPath([{ t: 0, pos: [0, 7.5, 4.5], target: [0, .6, 0], fov: 40 }, { t: 1.4, pos: [-1.8, 1.0, 4.2], target: [0, 1.0, 0], fov: 34, ease: 'inOut' }])(lt));
  f.light({ fx: [{ p: [0, .1, 0], col: '#7fdcff', r: 3, a: .6 }] });
  f.bg({ set: 'nexus' }); f.fig(AK1);
  f.fx(g => fxCompass(g, [0, .01, 0], lt, { r: 2.4 }), { layer: 'glow' });
  f.impact('akaza_compass', { t0: .05, at: [0, 1, 0] });
  f.text(g => attackTitle(g, lt, { t0: .5, dur: .8, text: 'Destructive Death: Compass Needle', sub: '破壊殺・羅針', size: 64, col: '#e8fbff', col2: '#7fdcff', edge: '#06203a' }));
});
const AK2 = fig('akaza', 'battle', t => at([0, 0, 0], 0, P('akaza_grin', { face: faceAnim(expr('grin', { look: [.2, .05] }), t, { talk: t > .3 && t < 1 ? 1 : 0, seed: 7 }) })), { timing: 2, wind: WIND });
shot('R06_akaza_eye', 8.4, 9.6, (f, lt) => {
  std(f, { pal: 'eternal', post: 'hot' }); f.style('hand2d');
  f.cam(lt < .6 ? closeCam(AK2, lt, { part: 'face', az: -.35, dist: .95 }) : closeCam(AK2, lt, { part: 'eye', side: 'R', az: -.1, dist: 1.1 - (lt - .6) * .3 }));
  f.light({ rimAmt: .7, rimCol: '#8ad8ff' }); f.bg({ set: 'nexus' }); f.fig(AK2);
  f.impact('akaza_grin', { t0: .6 });
});
const AK3 = fig('akaza', 'battle', [
  [0, at([0, 0, 0], HP, P('akaza_stance'))], [.25, at([0, 0, 0], HP, P('akaza_punchWind')), 'inOut'], [.33, at([.3, 0, 0], HP, P('akaza_punch')), 'snap'],
  [.5, at([.3, 0, 0], HP, P('akaza_punchWind')), 'snap'], [.58, at([.6, 0, 0], HP, P('akaza_punch')), 'snap'],
  [.95, at([.5, 0, 0], HP, P('akaza_annihWind')), 'inOut'], [1.08, at([1.4, 0, 0], HP, P('akaza_annih')), 'snap'], [1.8, at([1.5, 0, 0], HP, P('akaza_annih')), 'hold']], { timing: 1, wind: WIND });
shot('R07_air', 9.6, 11.4, (f, lt) => {
  std(f, { pal: 'eternal', post: 'hot' });
  f.cam(camHandheld(camPath([{ t: 0, pos: [-1.5, 1.2, 5.5], target: [.8, 1.2, 0], fov: 36 }, { t: 1.08, pos: [2.0, .9, 4.0], target: [2.2, 1.3, 0], fov: 30, ease: 'inOut' }, { t: 1.8, pos: [3.5, 1.0, 3.6], target: [3, 1.3, 0], fov: 32 }])(lt), lt, .02, 5));
  f.bg({ set: 'nexus', dmg: 1 }); f.fig(AK3, { afterimages: lt > 1 && lt < 1.2 ? [.03, .06] : [], afterCol: '#8ad8ff', afterA: .4 });
  f.fx(g => { fxAirType(g, [.9, 1.35, 0], [1, 0, 0], lt - .33, { n: 2 }); fxAirType(g, [1.2, 1.35, 0], [1, .02, 0], lt - .58, { n: 2 }); fxLimbSmear(g, AK3, lt, { joint: 'handR', col: '#bff0ff', alpha: .6 }); }, { layer: 'over' });
  f.fx(g => fxAnnihilation(g, [2.4, 1.3, 0], [1, 0, 0], lt - 1.08, { size: 1 }), { layer: 'glow' });
  f.impact('akaza_annihilation', { t0: 1.09, at: [2.4, 1.3, 0] }); f.shake([[.33, 10, .2], [.58, 10, .2], [1.09, 34, .6]]);
  f.text(g => attackTitle(g, lt, { t0: 1.3, dur: .45, text: 'Annihilation Type', sub: '破壊殺・滅式', size: 72, col: '#e8fbff', col2: '#7fdcff', edge: '#06203a' }));
});
// ------------------------------------------------------------------------------------------------ Deku
const DK1 = fig('deku', 'fullcowl', [
  [0, at([-3, 0, 0], HP, runCycle(0))], [.15, at([-2.2, 0, 0], HP, runCycle(.5))], [.3, at([-1.4, 0, 0], HP, runCycle(1))], [.55, at([-.9, 0, 0], HP, P('deku_detroitWind')), 'inOut'],
  [.68, at([-.4, 0, 0], HP, P('deku_detroit')), 'snap'], [1.8, at([-.3, 0, 0], HP, P('deku_detroit', { sp: .45 })), 'out']], { timing: 1, wind: WIND });
shot('R08_detroit', 11.4, 13.2, (f, lt) => {
  std(f, { pal: 'dust', post: 'hot' }); f.trans({ type: 'smear', dur: .15 });
  f.cam(camPath([{ t: 0, pos: [-2, .9, 5], target: [-1.5, 1.1, 0], fov: 36 }, { t: .68, pos: [-2.6, .6, 3.0], target: [.5, 1.3, 0], fov: 42, roll: -.1, ease: 'snap' }, { t: 1.8, pos: [-3.4, .7, 2.4], target: [3, 1.6, 0], fov: 44, roll: -.12 }])(lt));
  f.light({ fx: [{ p: [0, 1.3, 0], col: '#4dff7c', r: 3, a: .5 }] });
  f.bg({ set: 'jaku' }); f.fig(DK1);
  f.fx(g => fxDetroitSmash(g, [.35, 1.35, 0], [1, .05, 0], lt - .68, { pct: 45 }), { layer: 'over' });
  f.fx(g => fxLimbSmear(g, DK1, lt, { joint: 'handR', col: '#bfffd0', alpha: .7 }), { layer: 'over' });
  f.impact('deku_detroit', { t0: .69, at: [.6, 1.35, 0] }); f.shake([[.69, 32, .7]]);
  f.text(g => attackTitle(g, lt, { t0: .9, dur: .7, text: 'Detroit Smash!!', size: 96, col: '#f4fff6', col2: '#4dff7c', edge: '#02140a' }));
  sfx(11.4 + .69, 'smash', { shot: 'R08' });
});
const DK2 = fig('deku', 'max', t => breathe(at([0, 0, 0], 0, P('deku_max', { face: faceAnim(expr('rage', { vein: 0 }), t, { seed: 9 }) })), t, 2), { timing: 2, wind: t => [0, 6, 0] });
shot('R09_deku_face', 13.2, 14.4, (f, lt) => {
  std(f, { pal: 'dust', post: 'hot' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .2 });
  f.cam(camShake(closeCam(DK2, lt, { part: 'face', az: .3, el: -.15, dist: .95 - lt * .1 }), [[0, 6, 1.2, 20]], lt));
  f.light({ fx: [{ p: vAdd(figPos(DK2, 0, 'head'), [0, -.4, .5]), col: '#4dff7c', r: 2, a: .6 }], rimCol: '#9dffb8', rimAmt: .8 });
  f.bg({ set: 'jaku' }); f.fig(DK2);
  f.fx(g => fxGreenArcs(g, figPos(DK2, lt, 'head'), lt, { r: .5, n: 5 }), { layer: 'glow' });
  f.impact('deku_eye', { t0: .75 });
});
const DK3 = fig('deku', 'fullcowl', [
  [0, at([0, 4.5, 0], 0, P('a_flip', { pitch: -1.2 }))], [.35, at([0, 3.5, 0], 0, P('deku_manchesterWind', { pitch: -2.6 })), 'inOut'], [.6, at([0, 2.4, 0], 0, P('deku_manchesterWind')), 'in'], [.78, at([0, 1.2, .3], 0, P('deku_manchester')), 'snap'], [1.6, at([0, .05, .4], 0, P('land')), 'out']], { timing: 1, wind: WIND });
shot('R10_manchester', 14.4, 16.0, (f, lt) => {
  std(f, { pal: 'dawn', post: 'hot' });
  f.cam(camPath([{ t: 0, pos: [3.5, 2.5, 6], target: [0, 3.5, 0], fov: 38 }, { t: .78, pos: [3.2, .7, 5.2], target: [0, 1.4, 0], fov: 40, ease: 'inOut' }, { t: 1.6, pos: [4.5, .9, 6.5], target: [0, 1.0, 0], fov: 38 }])(lt));
  f.bg({ set: 'cliff' }); f.fig(DK3, { shadow: true });
  f.fx(g => fxLimbSmear(g, DK3, lt, { joint: 'toeR', col: '#bfffd0', w: .16 }), { layer: 'over' });
  f.fx(g => fxManchester(g, [0, 0, .5], lt - .85, { size: 1 }), { layer: 'over' });
  f.impact('deku_manchester', { t0: .86, at: [0, .3, .5] }); f.shake([[.86, 30, .6]]);
  f.text(g => attackTitle(g, lt, { t0: 1.0, dur: .5, text: 'Manchester Smash!', size: 80, col: '#f4fff6', col2: '#4dff7c', edge: '#02140a', x: 1810, align: 'right' }));
});
// ------------------------------------------------------------------------------------------------ Shigaraki
const SH1 = fig('shigaraki', 'base', [
  [0, at([0, 0, 0], 0, P('shig_slouch', { face: expr('menace') }))], [.8, at([0, 0, 0], 0, P('shig_slouch', { face: expr('grin') }))], [1.0, at([0, 0, .2], 0, P('shig_touchGround')), 'inOut'], [1.8, at([0, 0, .2], 0, P('shig_touchGround'))]], { timing: 2, wind: WIND });
shot('R11_decay', 16.0, 17.8, (f, lt) => {
  std(f, { pal: 'dust', post: 'dark' }); f.trans({ type: 'whiteFlash', dur: .1 });
  f.cam(camPath([{ t: 0, pos: [1.2, 1.5, 4], target: [0, 1.4, 0], fov: 34 }, { t: 1.0, pos: [2.2, .6, 3.6], target: [0, .5, .8], fov: 38, ease: 'inOut' }, { t: 1.8, pos: [4, 2.8, 5.5], target: [0, 0, 1], fov: 44 }])(lt));
  f.bg({ set: 'jaku', dmg: 1 }); f.fig(SH1);
  f.fx(g => fxDecay(g, [.05, 0, .9], lt - 1.0, { r: 6, dur: 1.2 }), { layer: 'under' });
  f.impact('shigaraki_decay', { t0: 1.02, at: [0, .1, .9] }); f.shake([[1.02, 12, .8, 10]]);
  f.text(g => attackTitle(g, lt, { t0: 1.2, dur: .5, text: 'Decay', sub: '崩壊', size: 96, col: '#e8e0d8', col2: '#8a7a6e', edge: '#1a0406' }));
});
const SH2 = fig('shigaraki', 'unmasked', t => breathe(at([0, 0, 0], 0, P('shig_scratch', { face: faceAnim(expr('menace', { mouth: 'grin', mouthOpen: .4 }), t, { seed: 5 }) })), t), { timing: 2, wind: WIND });
shot('R12_shig_face', 17.8, 19.0, (f, lt) => {
  std(f, { pal: 'dust', post: 'dark', grade: { sat: .7 } }); f.style('hand2d');
  f.cam(camHandheld(closeCam(SH2, lt, { part: 'face', az: -.4, el: .05, dist: .9 }), lt, .006, 8));
  f.light({ rimAmt: .5, rimCol: '#ff8a7a' }); f.bg({ set: 'jaku' }); f.fig(SH2);
  f.impact('shigaraki_grin', { t0: .8 });
});
const SH3 = fig('shigaraki', 'afo', t => breathe(at([0, 1.2 + .1 * Math.sin(t * 2), 0], 0, P('shig_afo', { ground: false, face: faceAnim('menace', t) })), t), { timing: 2, wind: t => [0, 4, -2] });
shot('R13_afo', 19.0, 20.8, (f, lt) => {
  std(f, { pal: 'eternal', post: 'dark', grade: { tint: ['#c08080', .2] } });
  f.cam(camPath([{ t: 0, orbit: { c: [0, 2.2, 0], r: 7, az: .6, el: -.25 }, fov: 36 }, { t: 1.8, orbit: { c: [0, 2.2, 0], r: 5.6, az: -.3, el: -.15 }, fov: 34, ease: 'inOut' }])(lt));
  f.bg({ set: 'nexus', dmg: 2 }); f.fig(SH3);
  f.fx(g => fxDecayWave(g, [0, 0, 0], lt - .3, { R: 40, speed: 18 }), { layer: 'under' });
  f.fx(g => fxAFOTendrils(g, vAdd(figPos(SH3, lt, 'abd'), [0, .2, -.2]), lt - .6, { n: 6, len: 4, dir: [.2, .3, 1] }), { layer: 'over' });
  f.impact('shigaraki_afo', { t0: .62 }); f.shake([[.62, 14, .9, 9]]);
});
// ------------------------------------------------------------------------------------------------ blood fx + Urahara + sets montage
const RG4 = fig('rengoku', 'flame', [[0, at([-1.2, 0, 0], HP, P('rengoku_unknowingWind'))], [.18, at([1.0, 0, 0], HP, P('rengoku_unknowing')), 'snap'], [1.6, at([1.1, 0, 0], HP, P('rengoku_unknowing'))]], { timing: 1 });
const AK4 = fig('akaza', 'regen', [[0, at([.4, 0, -.3], -HP, P('akaza_stance'))], [.2, at([.4, 0, -.3], -HP, P('t_hitBody'))], [.6, at([.6, 0, -.3], -HP, P('akaza_regen')), 'out'], [1.6, at([.6, 0, -.3], -HP, P('akaza_regen'))]], { timing: 1 });
shot('R14_blood', 20.8, 22.2, (f, lt) => {
  std(f, { pal: 'mist', post: 'hot' });
  f.cam(camPath([{ t: 0, pos: [0, 1.3, 4.2], target: [0, 1.2, 0], fov: 36 }, { t: 1.4, pos: [.6, 1.1, 3.4], target: [.3, 1.2, 0], fov: 34 }])(lt));
  f.bg({ set: 'forest' }); f.fig(AK4); f.fig(RG4);
  f.fx(g => fxFlameTrail(g, RG4, lt), { layer: 'over' });
  f.fx(g => { fxCutFlash(g, [-.1, 1.65, -.2], [1.0, 1.0, -.4], lt - .18, { gap: 8 }); fxBloodSpray(g, [.5, 1.35, -.3], [-.4, .6, .5], lt - .2, { n: 50, speed: 5 }); fxBloodSplat(g, [.2, 0, .2], lt - .5, { r: .6 }); }, { layer: 'over' });
  f.impact('death_blood', { t0: .19, at: [.5, 1.3, -.3] }); f.shake([[.19, 18, .4]]);
});
const UR1 = fig('urahara', 'shikai', t => breathe(at([0, 0, 0], .2, P('urahara_sing', { face: faceAnim('focused', t) })), t), { timing: 2, wind: WIND });
shot('R15_urahara', 22.2, 23.0, (f, lt) => {
  std(f, { pal: 'stage', post: 'normal' });
  f.cam(camPath([{ t: 0, orbit: { c: [0, 1.2, 0], r: 5, az: .9, el: .05 }, fov: 32 }, { t: .8, orbit: { c: [0, 1.2, 0], r: 4.6, az: .6, el: .05 }, fov: 32 }])(lt));
  f.bg({ set: 'stage' }); f.fig(UR1);
  f.fx(g => fxNakeBenihime(g, [.6, 1.0, .4], [1, 0, .3], lt - .2, { size: 1.1 }), { layer: 'over' });
});
const MONT = [['underwater', 'deep', [0, 2, 9], [0, 3, -10]], ['skyhigh', 'highsky', [0, 2, 10], [0, 4, -20]], ['nightstreet', 'lantern', [0, 1.7, 16], [0, 2.4, -10]], ['forest', 'mist', [2, 1.6, 9], [0, 3, -10]]];
shot('R16_sets', 23.0, 24.0, (f, lt) => {
  const i = Math.min(3, Math.floor(lt / .25)), m = MONT[i], u = (lt - i * .25) / .25; std(f, { pal: m[1], post: 'soft' });
  f.cam({ pos: vAdd(m[2], [lerp(-.8, .8, u), 0, 0]), target: m[3], fov: 38 }); f.bg({ set: m[0] });
});
