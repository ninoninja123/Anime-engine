/* GOW LAB 2: cast.md sets + Urahara / Dazai additions + POV language.  1.5 s per shot.
   node render.js sheet reel/gowlab2 OUT.png list:1,2.5,4,... 0.25 6                                         */
PROGRAM.reset(36, 'gowlab2');
const G2_G = fig('gowther', 'base', t => breathe(at([0, 0, 0], .25, P('gow_read', { book: 1, bookGlow: .6 })), t), { timing: 2 });
const G2_U = fig('urahara', 'base', t => at([1.6, 0, 0], -.5, P('urahara_fanFace')), { timing: 2 });
const G2_D = fig('dazai', 'base', t => at([-1.6, 0, .3], .5, P('dazai_think')), { timing: 2 });
const G2_DW = fig('dazai', 'wet', t => at([0, 0, 0], .3, P('dazai_pockets')), { timing: 2 });
const SETS2 = [
  ['shopin', {}, { pos: [2.2, 1.6, 4.5], target: [0, 1.3, -2], fov: 42 }, 'shop_morning'],
  ['yokoalley', { crack: .6 }, { pos: [1, 1.6, 7], target: [0, 2.2, -8], fov: 42 }, 'alley_rain'],
  ['mindlib', {}, { pos: [1.5, 1.8, 7], target: [0, 3, -10], fov: 42 }, 'mindlib'],
  ['paperwhite', {}, { pos: [2, 1.7, 7], target: [0, 2, -4], fov: 42 }, 'paper'],
  ['stitch', { sew: .7 }, { pos: [2, 2, 8], target: [0, 1.8, -4], fov: 42 }, 'stitch'],
  ['voidboard', { crumble: .5 }, { pos: [4, 3.4, 9], target: [0, 1.4, -1], fov: 42 }, 'voidpink'],
  ['shiftarena', { floor: 'chess', from: 'books', wall: 'alley', phaseT: 1, queens: true }, { pos: [3, 2.4, 10], target: [0, 2.4, -6], fov: 44 }, 'shift'],
  ['undergrounds', { keikaigi: true, garganta: .8 }, { pos: [3, 2, 9], target: [0, 3, -8], fov: 42 }, 'study'],
];
SETS2.forEach(([set, o, cam, pal], k) => shot('G2_' + set, k * 1.5, k * 1.5 + 1.5, (f, lt) => {
  std(f, { pal }); const oo = Object.assign({}, o); if (o.phaseT) oo.phase = clamp(lt / 1.2, 0, 1);
  f.cam(camPath([{ t: 0, pos: cam.pos, target: cam.target, fov: cam.fov }, { t: 1.5, pos: vAdd(cam.pos, [-.8, 0, -.5]), target: cam.target, fov: cam.fov, ease: 'inOut' }])(lt));
  f.bg(Object.assign({ set }, oo)); if (set === 'yokoalley') { f.fig(G2_DW); f.fx(g => fxRain(g, lt, { ground: true }), { layer: 'over' }); } else { f.fig(G2_G); f.fig(G2_U); f.fig(G2_D); }
}));
const UF = fig('urahara', 'base', K([[0, at([0, 0, 0], .3, P('urahara_fanFace', { fanText: '浦原' }))], [.6, at([0, 0, 0], .3, P('urahara_fanOpen', { fanText: '浦原' })), 'snap'], [1.5, at([0, 0, 0], .3, P('urahara_fanOpen', { fanText: '浦原' }))]]), { timing: 1 });
const UB = fig('urahara', 'bankai', t => at([0, 0, 1], 0, P('urahara_bankai')), { timing: 2 });
const UGG = fig('urahara', 'gigai', t => at([0, 0, 0], .4, P('urahara_ready')), { timing: 2 });
const DD = fig('dazai', 'base', t => at([0, .55, 0], 0, P('dazai_drum', { lL: [.35 + .2 * Math.sin(t * 9), .2, .2], lR: [-.1 - .2 * Math.sin(t * 9), .2, -.2] })), { timing: 2 });
const FX2 = [
  ['fan', (f, lt) => { std(f, { pal: 'shop_morning' }); f.style('hand2d'); f.cam(closeCam(UF, lt, { part: 'bust', az: .35, el: .05, dist: 1.1 })); f.bg({ set: 'shopin' }); f.fig(UF); }],
  ['bankai', (f, lt) => { std(f, { pal: 'stitch' }); f.cam({ pos: [0, 2.5, 9], target: [0, 3.5, -2], fov: 46 }); f.bg({ set: 'stitch' }); f.fx(g => { fxBlackCurtain(g, [0, 0, -3.5], 0, lt + .9, { w: 9, h: 10 }); fxBenihimeDoll(g, [0, 0, -2.5], 0, lt + 1, { scale: 4.5 }); }, { layer: 'under' }); f.fig(UB); }],
  ['gigai', (f, lt) => { std(f, { pal: 'study' }); f.cam({ pos: [1.5, 1.5, 5], target: [0, 1.2, 0], fov: 38 }); f.bg({ set: 'undergrounds' }); f.fx(g => fxGigaiPop(g, UGG, lt, lt - .4, {}), { layer: 'over' }); }],
  ['drum', (f, lt) => { std(f, { pal: 'alley_rain' }); f.cam({ pos: [1.6, 1.3, 4], target: [0, .9, 0], fov: 38 }); f.bg({ set: 'yokoalley' }); f.fig(DD); f.prop([0, .4, .05], g => drawDrumCan(g, [0, 0, 0], { open: true })); f.fx(g => fxRain(g, lt, {}), { layer: 'over' }); }],
  ['pinkfilm', (f, lt) => { std(f, { pal: 'mindlib' }); f.cam({ pos: [1.2, 1.6, 4], target: [0, 1.5, 0], fov: 36 }); f.bg({ set: 'mindlib' }); f.fig(G2_G); gowPinkFilm(f, lt, { pulse: true }); }],
  ['tear', (f, lt) => { std(f, { pal: 'mindlib' }); f.cam({ pos: [1.2, 1.6, 4], target: [0, 1.5, 0], fov: 36 }); f.bg({ set: 'mindlib' }); f.fig(G2_G); gowPinkFilm(f, 1, {}); gowTear(f, lt * .8, { at: [0, 1.5, 0] }); }],
  ['rewind', (f, lt) => { std(f, { pal: 'shop_morning' }); f.cam({ pos: [2.2, 1.6, 4.5], target: [0, 1.3, -2], fov: 42 }); f.bg({ set: 'shopin' }); f.fig(G2_U); gowRewind(f, lt, {}); }],
  ['page', (f, lt) => { std(f, { pal: 'voidpink' }); f.cam({ pos: [0, 1.6, 3], target: [0, 1.6, 0], fov: 36 }); f.bg({ set: 'voidboard' }); f.fx(g => drawBookPage(g, [0, 1.6, 0], { size: 1.2, t: lt, glow: 1, tear: clamp(lt - .7, 0, 1) }), { layer: 'over' }); }],
  ['covers', (f, lt) => { std(f, { pal: 'mindlib' }); f.cam({ pos: [0, 1.6, 3], target: [0, 1.6, 0], fov: 36 }); f.bg({ set: 'mindlib' }); f.fx(g => { ['pig', 'fairy', 'giant', 'princess', 'nlh'].forEach((a, i) => drawBookCover(g, [(i - 2) * .55, 1.6, 0], { art: a, size: .5, cover: ['#7a3a2a', '#3a6a3a', '#3a4a7a', '#6a3a6a', '#e8e4dc'][i], titleCol: a === 'nlh' ? '#1a1a22' : '#f2e8d0', title: a === 'nlh' ? 'NO LONGER HUMAN' : ['Boar Hat', 'Fairy King', 'Giants', 'Liones', ''][i], sub: a === 'nlh' ? 'Osamu Dazai' : '' })); drawChuyaHat(g, [1.4, 2.2, -.5], { rot: lt }); }, { layer: 'over' }); }],
  ['speech', (f, lt) => { std(f, { pal: 'mind' }); f.style('hand2d'); f.cam(closeCam(G2_G, lt, { part: 'face', az: .4 })); f.bg({ set: 'mindscape' }); f.fig(G2_G); f.text(g => gowSpeech(g, 'Memories are merely information.', { who: 'Gowther' })); }],
];
FX2.forEach(([n, fn], k) => shot('G2F_' + n, 12 + k * 1.5, 12 + k * 1.5 + 1.5, fn));
