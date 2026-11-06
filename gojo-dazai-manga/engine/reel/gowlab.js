/* GOW LAB: one 1.5 s shot per new set (sets_gow.js) and per Gowther effect (fx_gow.js).  Contact sheet:
   node render.js sheet reel/gowlab OUT.png list:0.75,2.25,... 0.25 6        (shot k is at k*1.5 .. k*1.5+1.5)            */
PROGRAM.reset(36, 'gowlab');
const GL_G = fig('gowther', 'base', t => breathe(at([0, 0, 0], .25, P('gow_stand', { face: faceAnim('blank', t, { seed: 1 }) })), t), { timing: 2 });
const GL_GB = fig('gowther', 'herritt', t => at([0, 0, 0], .3, P('gow_bowAim')), { timing: 2 });
const GL_U = fig('urahara', 'base', t => at([1.6, 0, 0], -.5, P('urahara_cane')), { timing: 2 });
const GL_D = fig('dazai', 'base', t => at([-1.6, 0, .3], .5, P('dazai_pockets')), { timing: 2 });
const GLS = [
  ['theater', {}, { pos: [3, 2.2, 11], target: [0, 2.6, -2], fov: 40 }],
  ['memlib', {}, { pos: [1.5, 1.7, 8], target: [0, 3.2, -10], fov: 42 }],
  ['chess', {}, { pos: [4, 2.6, 9], target: [0, 1.2, -2], fov: 40 }],
  ['mindscape', { glitch: .3 }, { pos: [3, 1.8, 8], target: [0, 1.8, -2], fov: 40 }],
  ['urashop', {}, { pos: [2.5, 1.7, 7], target: [0, 2.6, -6], fov: 42 }],
  ['undergrounds', { dmg: 1 }, { pos: [3, 2, 9], target: [0, 2.5, -6], fov: 42 }],
  ['clocktower', {}, { pos: [2, 2, 8], target: [0, 4.5, -6], fov: 44 }],
  ['shiftarena', { from: 'stone', wall: 'books', phaseT: 1 }, { pos: [3, 2.4, 10], target: [0, 2.4, -6], fov: 44 }],
];
GLS.forEach(([set, o, cam], k) => shot('GL_' + set, k * 1.5, k * 1.5 + 1.5, (f, lt) => {
  std(f, { pal: SETS[set].pal }); const oo = Object.assign({}, o); if (o.phaseT) oo.phase = clamp(lt / 1.2, 0, 1);
  f.cam(camPath([{ t: 0, pos: cam.pos, target: cam.target, fov: cam.fov }, { t: 1.5, pos: vAdd(cam.pos, [-1, 0, -.6]), target: cam.target, fov: cam.fov, ease: 'inOut' }])(lt));
  f.bg(Object.assign({ set }, oo)); f.fig(GL_G); if (set === 'urashop' || set === 'undergrounds') f.fig(GL_U); if (set === 'theater' || set === 'chess') f.fig(GL_D);
}));
const T0 = 12, FX = [
  ['army', (f, lt) => { std(f, { pal: 'theater' }); f.cam({ pos: [2, 2.4, 10], target: [0, 3, -2], fov: 42 }); f.bg({ set: 'theater', puppets: 0 }); f.fig(GL_G); f.fx(g => fxPuppetArmy(g, [0, 0, -3], lt + 1, { n: 12, rows: 2, drop: clamp(lt / 1, 0, 1), dance: .6 }), { layer: 'under' }); }],
  ['shards', (f, lt) => { std(f, { pal: 'mind' }); f.cam({ pos: [1.5, 1.6, 5], target: [0, 1.5, 0], fov: 36 }); f.bg({ set: 'mindscape' }); f.fig(GL_G); f.fx(g => fxMemoryShards(g, [0, 1.6, 0], lt + .5, { n: 14, r: 1.8 }), { layer: 'over' }); }],
  ['volley', (f, lt) => { std(f, { pal: 'chess' }); f.cam({ pos: [3.5, 1.6, 4.5], target: [0, 1.5, 2], fov: 40 }); f.bg({ set: 'chess' }); f.fig(GL_GB); f.fx(g => fxArrowVolley(g, [0, 2.4, .5], lt, { n: 16, dir: [.1, -.1, 1], len: 10 }), { layer: 'glow' }); }],
  ['invasion', (f, lt) => { std(f, { pal: 'memlib' }); f.cam({ pos: [1.2, 1.6, 4], target: [0, 1.5, 0], fov: 36 }); f.bg({ set: 'memlib' }); f.fig(GL_G); gowInvasion(f, lt, { glitch: .7, pixel: .25, pixelMask: true, scan: .6, tint: '#ff7ad8' }); }],
  ['collapse', (f, lt) => { std(f, { pal: 'harbor_teal' }); f.cam({ pos: [1.5, 1.4, 4], target: [0, 1.4, 0], fov: 36 }); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(GL_D); gowMemoryCollapse(f, lt + .3, { at: [-1.6, 1.6, .3], dur: 1.2 }); }],
  ['timestop', (f, lt) => { std(f, { pal: 'clock' }); f.cam({ pos: [2, 1.8, 6], target: [0, 2, -2], fov: 40 }); f.bg({ set: 'clocktower', stop: 1 }); f.fig(GL_G); gowTimeStop(f, lt + .5, { at: [0, 1.6, 0], keep: { at: [0, 1.7, 0], r: 160 } }); }],
  ['tvnoise', (f, lt) => { std(f, { pal: 'shop_dusk' }); f.cam({ pos: [2.5, 1.7, 7], target: [0, 2.2, -4], fov: 42 }); f.bg({ set: 'urashop' }); f.fig(GL_U); gowTVNoise(f, lt, { a: .55, sat: .3 }); }],
  ['nightmare', (f, lt) => { std(f, { pal: 'harbor_teal' }); f.cam({ pos: [1.5, 1.4, 4], target: [0, 1.4, 0], fov: 36 }); f.bg({ set: 'yokohama', pal: 'harbor_teal' }); f.fig(GL_D); gowNightmare(f, lt + .4, {}); }],
  ['strings', (f, lt) => { std(f, { pal: 'theater' }); f.cam({ pos: [2, 2, 7], target: [0, 1.8, 0], fov: 38 }); f.bg({ set: 'theater', puppets: 3 }); f.fig(GL_D); f.fx(g => fxMarionetteStrings(g, GL_D, lt, [-1.6, 4.4, .3], lt + .4), { layer: 'over' }); }],
  ['blackout', (f, lt) => { std(f, { pal: 'chess' }); f.cam({ pos: [6, 3, 14], target: [0, 2, 0], fov: 44 }); f.bg({ set: 'chess' }); f.fig(GL_G); f.fx(g => fxBlackout(g, [0, 1, 0], lt, { r: 12 }), { layer: 'over' }); }],
  ['flakes', (f, lt) => { std(f, { pal: 'mind' }); f.style('hand2d'); f.cam(closeCam(GL_G, lt, { part: 'face', az: .4, el: .04 })); f.bg({ set: 'mindscape' }); f.fig(GL_G); f.fx(g => fxEmotionFlakes(g, lt + 1, { n: 50 }), { layer: 'top' }); }],
  ['broadcast', (f, lt) => { std(f, { pal: 'memlib' }); f.cam({ pos: [2, 2, 8], target: [0, 1.5, 0], fov: 42 }); f.bg({ set: 'memlib' }); f.fig(GL_G); f.fig(GL_U); f.fig(GL_D); f.fx(g => { fxBroadcast(g, [0, 1.65, 0], [[1.6, 1.6, 0], [-1.6, 1.6, .3]], lt, { dur: .8 }); fxInvasionPulse(g, [-1.6, 1.65, .3], lt, {}); }, { layer: 'glow' }); }],
  ['playback', (f, lt) => { std(f, { pal: 'memlib' }); f.cam({ pos: [2, 1.8, 6], target: [0, 2, 0], fov: 40 }); f.bg({ set: 'memlib' }); f.fig(GL_G); f.fx(g => { fxPlayback(g, [0, 2.6, -2], lt, { seed: 3 }); fxMemoryStream(g, lt, { x: W / 2, y: H * .4, n: 10, alpha: .5 }); }, { layer: 'over' }); }],
  ['kaleido', (f, lt) => { std(f, { pal: 'chess' }); f.cam({ pos: [3, 1.8, 7], target: [0, 1.4, 0], fov: 40 }); f.bg({ set: 'chess' }); f.fx(g => fxKaleidoscope(g, GL_G, lt, lt + .5, { n: 6, r: 360 }), { layer: 'under' }); f.fig(GL_G); }],
  ['threads', (f, lt) => { std(f, { pal: 'mind' }); f.cam({ pos: [0, 1.8, 7], target: [0, 1.5, 0], fov: 38 }); f.bg({ set: 'mindscape', crumble: .5 }); f.fig(GL_G); f.fig(GL_D); f.fig(GL_U); f.fx(g => { fxMindThreads(g, [0, 1.65, 0], [1.6, 1.65, 0], lt + .5, {}); fxMindThreads(g, [0, 1.65, 0], [-1.6, 1.65, .3], lt + .5, {}); }, { layer: 'glow' }); }],
  ['pixelate', (f, lt) => { std(f, { pal: 'shift' }); f.cam({ pos: [3, 2.4, 10], target: [0, 2.4, -6], fov: 44 }); f.bg({ set: 'shiftarena', from: 'curtain', wall: 'mirror', phase: .6 }); f.fig(GL_G); gowPixelate(f, lt * .6, { k: .5, at: [0, 1.6, 0], r: 220 }); }],
];
FX.forEach(([n, fn], k) => shot('GLF_' + n, T0 + k * 1.5, T0 + k * 1.5 + 1.5, fn));
