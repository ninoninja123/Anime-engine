/* HVG TEST REEL (~27.5 s, no story, no finale): Harry / Gojo / Urahara in motion (sakuga on ones), Valhalla arena + crowd, power cards, hand2d
   close-ups, Expelliarmus / Infinity / Six Eyes / Blue / Protego / Red / Patronus / Hollow Purple / Domain, new lettering.
   node render.js preview reel/hvgreel out.mp4 0.5 2                                                                                        */
PROGRAM.reset(27.5, 'hvgreel');
const HX = -2.3, GX = 2.5, YH = HP, YG = -HP;
const atH = (p, o) => at([HX, 0, 0], YH, P(p, o)), atG = (p, o) => at([GX, 0, 0], YG, P(p, o));
// ---------------------------------------------------------------------------------------------------- R01 arena: crane down, torches ignite
const R1H = fig('harry', 'base', t => breathe(atH('har_idle'), t), { timing: 2 }), R1G = fig('gojo', 'base', t => breathe(atG('goj_pockets'), t), { timing: 2 });
shot('R01_arena', 0, 2.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .8, rimCol: '#ffc890' }); f.grade({ bright: 1.06 });
  f.cam(camPath([{ t: 0, pos: [3, 26, 30], target: [0, 10, -20], fov: 46 }, { t: 2.6, pos: [1.5, 3.2, 11], target: [0, 2.2, -4], fov: 40, ease: 'inOut' }])(lt));
  f.bg({ set: 'valhalla', torchT: .1, torchSpan: 1.6, react: 'roar', cheer: 1 }); f.fig(R1H); f.fig(R1G);
  f.fx(g => fxCrowdFG(g, lt, { n: 9, size: 320, rim: '#ff9a40', react: 'roar' }), { layer: 'over' });
});
// ---------------------------------------------------------------------------------------------------- R02 Urahara announcer (hand2d)
const R2U = fig('urahara', 'base', t => breathe(at(HVG.BOOTH.pos, 0, P('urahara_announceFan', { ground: false, fanText: '開幕', face: faceAnim(t < .9 ? expr('grin', { mouthOpen: .4 }) : 'shout', t, { talk: 1.2, seed: 2 }) })), t), { timing: 2, wind: t => [.6, 0, .3] });
shot('R02_booth', 2.6, 4.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.style('hand2d'); f.trans({ type: 'whiteFlash', dur: .12 }); f.light({ ambientK: .2, shadeK: .4, rimAmt: .9, rimCol: '#ffc880', fx: [{ p: vAdd(HVG.BOOTH.pos, [-2, 4, 1]), col: '#ffb060', r: 5, a: .35 }] });
  f.cam(camHandheld(camSlowPush(R2U, lt, 0, 2, { part: 'bust', az: .35, el: -.08, from: 1.25, to: 1.0 }), lt, .004, 3)); f.bg({ set: 'valhalla', react: 'cheer' }); f.fig(R2U);
  f.fx(g => { const S = figSkel(R2U, lt); fxMicWaves(g, vAdd(S.J.handR, [0, .15, .1]), lt, { col: '#ffe08a', dir: -.4 }); }, { layer: 'over' });
  f.text(g => attackTitle(g, lt, { style: 'arena', text: 'TWO WORLDS. ONE ARENA.', t0: .25, dur: 1.3 }));
});
// ---------------------------------------------------------------------------------------------------- R03 / R04 power cards (portrait hand2d on the free side)
const R3H = fig('harry', 'base', t => breathe(atH('har_wandReady', { wandGlow: .6, wandCol: '#ffd36a', face: faceAnim('determined', t, { seed: 4 }) }), t), { timing: 2, wind: t => [.8, .2, .3] });
shot('R03_cardH', 4.6, 6.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .4, rimAmt: 1, rimCol: '#ffd36a' });
  f.cam(camTruck(camSlowPush(R3H, lt, 0, 2, { part: 'bust', az: -.55, el: .02, from: 1.35, to: 1.1 }), -.42)); f.bg({ set: 'cardbg', who: 'harry' }); f.fig(R3H);
  f.impact('POWER_CARD_H', { t0: .05 }); f.text(g => fighterCard(g, lt, { who: 'harry', t0: .1, dur: 1.9, round: 'ROUND 1' }));
});
const R4G = fig('gojo', 'base', t => breathe(atG('goj_peace', { face: faceAnim('playful', t, { seed: 5 }) }), t), { timing: 2, wind: t => [-.6, .2, .3] });
shot('R04_cardG', 6.6, 8.8, (f, lt) => {
  std(f, { pal: 'void_inf' }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .4, rimAmt: 1, rimCol: '#7fd8ff' });
  f.cam(camTruck(camSlowPush(R4G, lt, 0, 2.2, { part: 'bust', az: .55, el: .04, from: 1.4, to: 1.12 }), .45)); f.bg({ set: 'cardbg', who: 'gojo' }); f.fig(R4G);
  f.impact('POWER_CARD_G', { t0: .05 }); f.text(g => { fighterCard(g, lt, { who: 'gojo', side: 'right', t0: .1, dur: 1.35 }); vsCard(g, lt, { t0: 1.45, dur: .75 }); });
});
// ---------------------------------------------------------------------------------------------------- R05 Expelliarmus (ones, low orbit)
const R5H = fig('harry', 'base', K([[0, atH('har_wandReady')], [.25, atH('har_castWind'), 'out'], [.42, atH('har_cast', { wandGlow: 1, wandCol: '#ff4a3a' }), 'snap'], [1.2, atH('har_cast', { wandGlow: .4, wandCol: '#ff4a3a' }), 'hold'], [1.6, atH('har_aim'), 'smooth']]), { timing: 1, wind: t => [.4, 0, .6] });
const R5G = fig('gojo', 'base', t => atG('goj_pockets'), { timing: 2 });
shot('R05_expelliarmus', 8.8, 10.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .9, rimCol: '#ffb060', rim: vNorm([-.7, .3, -.5]), fx: lt > .42 ? [{ p: hvWandTip(R5H, lt), col: '#ff3a36', r: 1.2, a: .3 }] : [] });
  const c = camImpactKick(camOrbitShot(vAdd(figPos(R5H, lt, 'abd'), [1.2, .2, 0]), lt, { r: 4.4, az0: .5, az1: .95, el0: -.04, el1: .03, dur: 1.8, fov: 38 }), lt, .42, { fov: -6 });
  f.cam(camHandheld(c, lt, .006, 5)); f.bg({ set: 'valhalla', side: 'H' }); f.fig(R5H, { afterimages: [.04, .08] }); f.fig(R5G);
  f.fx(g => fxWandTrail(g, R5H, lt, { span: .3, col: '#ff8a6a' }), { layer: 'glow' });
  f.fx(g => fxExpelliarmus(g, hvWandTip(R5H, .42), vAdd(figPos(R5G, lt, 'abd'), [-1.2, .2, 0]), lt - .42), { layer: 'glow' });
  f.shake([[.42, 10, .3]]); f.text(g => attackTitle(g, lt, moveTitle(lt, 'EXPELLIARMUS!', { t0: .45, dur: 1.0 })));
});
// ---------------------------------------------------------------------------------------------------- R06 Infinity: the spell freezes on the shell (hand2d)
const R6G = fig('gojo', 'base', t => breathe(atG('goj_infinity', { infinity: .9, face: faceAnim('smug', t, { seed: 6 }) }), t), { timing: 2 });
shot('R06_infinity', 10.6, 12.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.style('hand2d'); f.light({ ambient: '#c8d4ff', ambientK: .3, shadeK: .4, rimAmt: .9, rimCol: '#8fc8ff', rim: vNorm([.7, .3, -.5]), fx: [{ p: vAdd(figPos(R6G, lt, 'handR'), [-.6, 0, 0]), col: '#ff6a5a', r: 2, a: .15 }] });
  f.cam(camHandheld(camSlowPush(R6G, lt, 0, 2, { part: 'bust', az: -.75, el: .04, from: 1.6, to: 1.3 }), lt, .004, 6)); f.bg({ set: 'valhalla', react: 'gasp' }); f.fig(R6G);
  const c = vAdd(figPos(R6G, lt, 'abd'), [0, .15, 0]);
  f.fx(g => fxInfinityStop(g, c, [{ from: vAdd(c, [-6, .3, 0]), kind: 'bolt', col: '#ff3a36', size: .12 }, { from: vAdd(c, [-5, 1.2, .5]), kind: 'spark', col: '#ffd36a', t0: .05 }, { from: vAdd(c, [-5, -.6, -.4]), kind: 'spark', col: '#ffd36a', t0: .1 }], lt, { r: 1.25, k: 5 }), { layer: 'glow' });
  f.fx(g => fxInfinity(g, c, lt, { r: 1.25, ripples: [{ t0: .5, p: vAdd(c, [-1.2, .3, 0]) }] }), { layer: 'glow' });
  f.impact('INFINITY_FREEZE', { t0: .55, at: vAdd(c, [-1.2, .3, 0]), r: 300 }); f.text(g => attackTitle(g, lt, moveTitle(lt, 'INFINITY', { t0: .7, dur: 1.0 })));
});
// ---------------------------------------------------------------------------------------------------- R07 Six Eyes: the blindfold comes down (ECU)
const R7G = fig('gojo', 'base', K([[0, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') })], [.55, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') })], [1.0, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) }), 'inOut'], [2, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) })]]), { timing: 2, wind: t => [-.5, .3, .2] });
shot('R07_sixeyes', 12.6, 14.6, (f, lt) => {
  std(f, { pal: 'valhalla', postOver: { bloom: .45 } }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .15 }); f.light({ ambient: '#c8d4ff', ambientK: .3, shadeK: .4, rimAmt: 1, rimCol: '#8fd8ff', fx: lt > .9 ? [{ p: vAdd(figPos(R7G, lt, 'head'), [0, -.3, .6]), col: '#5fd3ff', r: .8, a: .18 }] : [] });
  f.cam(camSlowPush(R7G, lt, .2, 2, { part: 'face', az: .12, el: .02, from: 1.05, to: .78 })); f.bg({ set: 'valhalla', react: 'hush' }); f.fig(R7G);
  f.fx(g => fxSixEyes(g, R7G, lt, { k: clamp((lt - 1.0) / .3, 0, 1) * (1 - clamp((lt - 1.5) / .4, 0, 1) * .5), streak: .8 }), { layer: 'glow' });
  f.impact('SIX_EYES', { t0: 1.05 }); f.text(g => attackTitle(g, lt, moveTitle(lt, 'SIX EYES', { t0: 1.2, dur: .7, align: 'right', x: W - 120, y: 300 })));
});
// ---------------------------------------------------------------------------------------------------- R08 Blue (warp)
const R8G = fig('gojo', 'eyes', K([[0, atG('goj_stand')], [.3, atG('goj_blueL', { orbL: 1, face: expr('smug') }), 'snap'], [2, atG('goj_blueL', { orbL: 1, face: expr('smug') })]]), { timing: 1 });
const R8H = fig('harry', 'base', t => atH('har_skid', { pos: [HX + Math.min(.9, Math.max(0, t - .6) * .9), 0, 0] }), { timing: 2, wind: t => [1.5, 0, 0] });
shot('R08_blue', 14.6, 16.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .9, rimCol: '#7fb8ff', fx: [{ p: [0, 1.4, 0], col: '#3a7bff', r: 4, a: lt > .4 ? .45 : 0 }] });
  f.cam(camHandheld(camGroup([R8H, R8G], lt, { az: .55 - lt * .08, el: .05, fill: .66 }), lt, .007, 8)); f.bg({ set: 'valhalla' }); f.fig(R8G); f.fig(R8H);
  f.fx(g => fxBlue(g, [0, 1.3, .2], lt - .4, { r: .38, dur: 1.8 }), { layer: 'over' }); gojoWarp(f, lt - .4, { at: [0, 1.3, .2], r: 520, k: .9 });
  f.impact('BLUE_SINGULARITY', { t0: .55, at: [0, 1.3, .2] }); f.text(g => attackTitle(g, lt, moveTitle(lt, 'CURSED TECHNIQUE LAPSE: BLUE', { t0: .7, dur: 1.0 })));
});
// ---------------------------------------------------------------------------------------------------- R09 Protego
const R9H = fig('harry', 'base', K([[0, atH('har_wandReady')], [.2, atH('har_protego', { wandGlow: 1, wandCol: '#9fd2ff' }), 'snap'], [2, atH('har_protego', { wandGlow: .8, wandCol: '#9fd2ff' })]]), { timing: 1, wind: t => [-1, .2, 0] });
shot('R09_protego', 16.6, 18.6, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .4, rimAmt: .9, rimCol: '#ffd36a', fx: [{ p: vAdd(figPos(R9H, lt, 'abd'), [1, .5, 0]), col: '#9fd2ff', r: 1.6, a: .25 }] });
  f.cam(camHandheld(camImpactKick(camOrbitShot(vAdd(figPos(R9H, lt, 'abd'), [.4, .3, 0]), lt, { r: 3.6, az0: .5, az1: .85, el0: .05, el1: .1, dur: 2, fov: 40 }), lt, .9, { fov: -4 }), lt, .005, 9)); f.bg({ set: 'valhalla', side: 'H' }); f.fig(R9H);
  const sc = vAdd(figPos(R9H, lt, 'abd'), [1.0, .25, 0]);
  f.fx(g => fxProtego(g, sc, [1, 0, 0], lt - .2, { r: 1.35, hits: [{ t0: .9, p: vAdd(sc, [.3, .4, .2]) }, { t0: 1.3, p: vAdd(sc, [.3, -.3, -.3]) }] }), { layer: 'over' });
  f.fx(g => { fxSparks(g, vAdd(sc, [.3, .4, .2]), lt - .9, { n: 24, col: '#ffd36a' }); fxDebris(g, vAdd(sc, [.4, -.3, -.3]), lt - 1.3, { n: 10 }); }, { layer: 'over' });
  f.impact('PROTEGO_DOME', { t0: .9, at: sc }); f.shake([[.9, 12, .3], [1.3, 8, .25]]); f.text(g => attackTitle(g, lt, moveTitle(lt, 'PROTEGO!', { t0: .25, dur: 1.2 })));
});
// ---------------------------------------------------------------------------------------------------- R10 Red (ones)
const R10G = fig('gojo', 'eyes', K([[0, atG('goj_stand')], [.3, atG('goj_red', { orbR: 1, face: expr('serious') }), 'snap'], [.75, atG('goj_red', { orbR: 1, face: expr('serious') }), 'hold'], [.8, atG('goj_red', { orbR: 0, face: expr('serious') }), 'step'], [2, atG('goj_red', { face: expr('serious') })]]), { timing: 1 });
shot('R10_red', 18.6, 20.6, (f, lt) => {
  std(f, { pal: 'valhalla_red', post: 'hot' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: 1, rimCol: '#ff6a5a', fx: [{ p: figPos(R10G, lt, 'handR'), col: '#ff2d3a', r: 1.4, a: .3 }] });
  f.cam(camHandheld(camImpactKick(camLowHero(R10G, lt, { dist: 3.2, az: .55, fov: 44 }), lt, .8, { fov: -8, roll: .08 }), lt, .006, 10)); f.bg({ set: 'valhalla', pal: 'valhalla_red', dmg: 1 }); f.fig(R10G);
  f.fx(g => fxRed(g, vAdd(figPos(R10G, .8, 'handR'), [-.1, 0, 0]), [-1, .02, 0], lt - .35, { charge: .45, travel: 7, r: .24 }), { layer: 'over' });
  f.impact('RED_REPULSE', { t0: .82 }); f.shake([[.8, 22, .45]]); f.text(g => attackTitle(g, lt, moveTitle(lt, 'REVERSAL: RED', { t0: .85, dur: 1.0 })));
});
// ---------------------------------------------------------------------------------------------------- R11 Expecto Patronum
const R11H = fig('harry', 'battle', K([[0, atH('har_wandReady')], [.25, atH('har_castBig', { wandGlow: 1, wandCol: '#e8f4ff' }), 'snap'], [2.5, atH('har_castBig', { wandGlow: 1, wandCol: '#e8f4ff' })]]), { timing: 1, wind: t => [1, .3, 0] });
shot('R11_patronus', 20.6, 23.0, (f, lt) => {
  std(f, { pal: 'valhalla', postOver: { bloom: .9 } }); f.light({ ambientK: .2, shadeK: .4, rimAmt: 1, rimCol: '#e8f4ff', fx: [{ p: hvWandTip(R11H, lt), col: '#cfe4ff', r: 1.6, a: .35 }] }); f.grade({ tint: ['#b8c8f0', .25] });
  f.cam(camHandheld(camPath([{ t: 0, pos: [HX - 2.4, 1.0, 3.6], target: [HX + 1, 1.6, 0], fov: 40 }, { t: 2.4, pos: [HX + .5, 1.4, 4.6], target: [HX + 4, 1.4, -.5], fov: 36, ease: 'inOut' }])(lt), lt, .005, 11));
  f.bg({ set: 'valhalla', react: 'roar' }); f.fig(R11H);
  f.fx(g => { const tip = hvWandTip(R11H, lt); fxSpellBeam(g, tip, vAdd(tip, [1.2, .3, 0]), lt - .25, { col: '#cfe4ff', core: '#ffffff', w: 1.4, life: 2, hit: false }); fxPatronus(g, patronusPath([HX + 1.2, .9, 0], [GX + 3, .9, -.5], lt - .4, { speed: 3.2, hop: .2 }), [1, 0, 0], lt - .4, { scale: 1.9 }); }, { layer: 'glow' });
  f.text(g => attackTitle(g, lt, moveTitle(lt, 'EXPECTO PATRONUM!', { t0: .3, dur: 1.5 })));
});
// ---------------------------------------------------------------------------------------------------- R12 Hollow Purple (wide)
const R12G = fig('gojo', 'serious', K([[0, atG('goj_purpleWind', { orbL: 1, orbR: 1 })], [.9, atG('goj_purpleWind', { orbL: 1, orbR: 1 }), 'hold'], [1.05, atG('goj_purpleFire', { orbL: 0, orbR: 0, face: expr('serious') }), 'snap'], [2.5, atG('goj_purpleFire', { face: expr('serious') })]]), { timing: 1, wind: t => [-.8, .2, 0] });
shot('R12_purple', 23.0, 25.4, (f, lt) => {
  std(f, { pal: 'valhalla', post: 'hot' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: 1, rimCol: '#c08aff', fx: [{ p: vAdd(figPos(R12G, lt, 'abd'), [-1, .3, 0]), col: '#9b4dff', r: 2, a: .3 }] });
  f.cam(camHandheld(camPath([{ t: 0, pos: [GX + 3.2, 1.3, 3.4], target: [GX - .5, 1.5, 0], fov: 38 }, { t: 1.0, pos: [GX + 2.6, 1.1, 2.8], target: [GX - .8, 1.5, 0], fov: 34, ease: 'inOut' }, { t: 1.1, pos: [GX + 6, 4, 9], target: [-4, 1.2, -1], fov: 48, ease: 'snap' }, { t: 2.4, pos: [GX + 5, 3.4, 8], target: [-6, 1.4, -1], fov: 46 }])(lt), lt, .007, 12));
  f.bg({ set: 'valhalla', react: 'gasp', crater: clamp((lt - 1.6) * 2, 0, 1), craterAt: [-10, 0, -2], craterR: 8 }); f.fig(R12G);
  f.fx(g => fxHollowPurple(g, vAdd(figPos(R12G, 0, 'abd'), [-.9, .3, 0]), [-1, -.02, -.05], lt, { charge: 1.05, len: 30, speed: 34, r: 1.4 }), { layer: 'over' });
  f.impact('HOLLOW_PURPLE', { t0: 1.08 }); f.shake([[1.1, 26, .7]]); f.text(g => attackTitle(g, lt, moveTitle(lt, 'HOLLOW PURPLE', { t0: 1.2, dur: 1.0 })));
});
// ---------------------------------------------------------------------------------------------------- R13 Domain Expansion: Unlimited Void
const R13G = fig('gojo', 'eyes', K([[0, atG('goj_stand', { face: expr('serious') })], [.3, atG('goj_domain', { face: expr('honored') }), 'snap'], [2.2, atG('goj_domain', { face: expr('honored') })]]), { timing: 1 });
shot('R13_domain', 25.4, 27.5, (f, lt) => {
  std(f, { pal: lt < .7 ? 'valhalla' : 'void_inf' }); f.style('hand2d'); f.light({ ambientK: .22, shadeK: .4, rimAmt: 1, rimCol: '#bfe8ff', fx: [{ p: figPos(R13G, lt, 'handR'), col: '#7fd8ff', r: 1.5, a: .5 }] });
  f.cam(camSlowPush(R13G, lt, 0, 2.1, { part: 'bust', az: .25, el: .02, from: 1.3, to: 1.05 })); f.bg({ set: lt < .7 ? 'valhalla' : 'voidspace', react: 'hush' }); f.fig(R13G);
  f.fx(g => fxDomainHand(g, R13G, lt, { k: clamp((lt - .3) / .3, 0, 1) }), { layer: 'glow' });
  gojoDomainWipe(f, lt - .4, { at: figPos(R13G, lt, 'handR'), dur: .35 }); if (lt > 1.3) gojoInfoOverload(f, lt - 1.3, { k: .5, white: 0, double: false });
  f.impact('UNLIMITED_VOID', { t0: .75 }); f.text(g => attackTitle(g, lt, moveTitle(lt, 'DOMAIN EXPANSION: UNLIMITED VOID', { t0: .85, dur: 1.0 })));
});
