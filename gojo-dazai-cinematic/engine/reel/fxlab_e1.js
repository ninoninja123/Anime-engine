/* E1 effects lab: one short shot per effect (render a contact sheet: node render.js sheet reel/fxlab_e1 out.png 0 23.5 24 .3 6) */
PROGRAM.reset(24, 'fxlab_e1');
const DUMMY = fig('akaza', 'base', t => at([0, 0, 0], 0, P('death_impaled')), { timing: 1 });
const DK = fig('deku', 'blackwhip', t => at([-1.2, 0, 0], HP, P('deku_whip')), { timing: 2 });
const SH = fig('shigaraki', 'final', t => at([0, 0, 0], .3, P('shig_reach')), { timing: 2 });
const UR = fig('urahara', 'bankai', t => at([0, 0, 0], 0, P('urahara_bankai')), { timing: 2 });
const L = [
  ['RisingSun', 'eternal', 'nexus', (g, lt) => fxRisingSun(g, [0, 0, 0], lt * .9, { r: 1.8 })],
  ['BlazingUniverse', 'eternal', 'nexus', (g, lt) => fxBlazingUniverse(g, [0, 0, 0], lt * .8, { r: 2.2 })],
  ['FlameUndulation', 'eternal', 'nexus', (g, lt) => fxFlameUndulation(g, [0, 0, 0], lt + .3, { r: 1.6 })],
  ['RengokuNinth', 'predawn', 'mugen', (g, lt) => fxRengokuNinth(g, [-5, 1, -2], [4, 1, 1], lt + .2, { r: 1.2 })],
  ['FlameBurst', 'predawn', 'mugen', (g, lt) => fxFlameBurst(g, [0, 1.2, 0], lt * .5, { size: 2 })],
  ['BlueSilver', 'eternal', 'nexus', (g, lt) => fxBlueSilver(g, [0, 0, 0], lt * .4, { r: 3 })],
  ['AshDrift', 'dawn', 'cliff', (g, lt) => fxAshDrift(g, [0, 1, 0], lt + .4, { n: 160 })],
  ['Blackwhip', 'dust', 'jaku', (g, lt) => fxBlackwhip(g, [-.6, 1.3, 0], [3, 1.2, -1], lt, { grab: true }), DK],
  ['Delaware+StLouis', 'dust', 'jaku', (g, lt) => { fxDelaware(g, [-2, 1.3, 0], [1, 0, 0], lt * .4); fxStLouis(g, [-1, 1, 1], [1, 0, -.3], lt * .45); }],
  ['DetroitSmash100', 'highsky', 'skyhigh', (g, lt) => fxDetroitSmash(g, [-2, 1.3, 0], [1, .05, -.2], lt * .5 + .1, { pct: 100 })],
  ['DecayWave', 'dust', 'jaku', (g, lt) => fxDecayWave(g, [0, 0, -4], lt + .5, { R: 30, speed: 12 })],
  ['AFOTendrils', 'eternal', 'nexus', (g, lt) => fxAFOTendrils(g, [0, 1.4, -1], lt + .2, { n: 8, len: 4 })],
  ['AirCannon', 'eternal', 'nexus', (g, lt) => fxAirCannon(g, [-2, 1.3, 0], [1, 0, 0], lt * .5)],
  ['BloodSpray+Splat', 'mist', 'forest', (g, lt) => { fxBloodSpray(g, [0, 1.4, 0], [.5, .5, .5], lt * .7, { n: 60 }); fxBloodSplat(g, [.5, 0, .5], lt, { r: .7 }); fxBloodArc(g, [-1, 1.8, 0], [1.4, 1.0, .2], lt * .5); }, DUMMY],
  ['CutFlash', 'mist', 'forest', (g, lt) => fxCutFlash(g, [-1, 1.8, .2], [1, .9, .2], lt * .4), DUMMY],
  ['SplitFig', 'mist', 'forest', (g, lt) => fxSplitFig(g, DUMMY, 0, lt, { ang: -.4 }), DUMMY, true],
  ['Disintegrate', 'dawn', 'cliff', (g, lt) => fxDisintegrate(g, DUMMY, 0, lt * 1.6, { from: 'neck' }), DUMMY, true],
  ['DecayBody', 'dust', 'jaku', (g, lt) => fxDecayBody(g, DUMMY, 0, lt * 1.6, { from: 'abd' }), DUMMY, true],
  ['SilhouetteDeath', 'dust', 'jaku', (g, lt) => fxSilhouetteDeath(g, DUMMY, 0, lt), DUMMY],
  ['NakeBenihime', 'stage', 'stage', (g, lt) => fxNakeBenihime(g, [0, 1, 0], [1, 0, .2], lt * .6)],
  ['BloodMistShield', 'stage', 'stage', (g, lt) => fxBloodMistShield(g, [0, 1.3, 1], [0, 0, 1], lt, { crack: lt > .6 ? .4 : 0 })],
  ['BenihimeDoll', 'stage', 'stage', (g, lt) => fxBenihimeDoll(g, [0, 0, -3], 0, lt + .6, { scale: 4 }), UR],
  ['Shibari+Rikujokoro', 'stage', 'stage', (g, lt) => { fxShibari(g, [-3, 1.5, 0], [0, 1.2, 0], lt); fxRikujokoro(g, [0, .5, 0], lt); }, DUMMY],
  ['GreenArcs+Embers', 'predawn', 'mugen', (g, lt) => { fxGreenArcs(g, [-1, 1.3, 0], lt, { r: .9, n: 8 }); fxEmbers(g, lt, { c: [1, 0, 0], r: 2, h: 3 }); }],
];
L.forEach(([name, pal, set, fn, F, replace], i) => shot('FX_' + name, i, i + 1, (f, lt) => {
  std(f, { pal }); f.cam({ pos: [0, 1.6, 7.5], target: [0, 1.2, 0], fov: 38 }); f.bg({ set });
  if (F && !replace) f.fig(F);
  f.fx(g => fn(g, lt + .25), { layer: 'over' });
  f.text(g => { g.fillStyle = '#fff'; g.font = '800 54px "Inter", sans-serif'; g.fillText(name, 40, 80); });
}));
