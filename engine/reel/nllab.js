/* NL LAB: one short shot per character form / effect (no story).  node render.js sheet reel/nllab OUT.png 0 N N 0.3 6 */
PROGRAM.reset(40, 'nllab');
const NX = -2.4, LX = 2.4;
const atN = (p, o, x = NX, z = 0) => at([x, 0, z], HP, P(p, o)), atL = (p, o, x = LX, z = 0) => at([x, 0, z], -HP, P(p, o));
let T0 = 0; const lab = (name, dur, fn) => { shot(name, T0, T0 + dur, fn); T0 += dur; };
const base = (f, pal = 'arena_nl', bg = {}) => { std(f, { pal }); f.light({ ambientK: .18, shadeK: .42, rimAmt: .8, rimCol: '#ffb070' }); f.bg(Object.assign({ set: 'nlarena', pal }, bg)); };
// 1 two-shot base forms
const A1 = fig('naruto', 'base', t => breathe(atN('nar_ready'), t)), B1 = fig('luffy', 'base', t => breathe(atL('luf_ready'), t));
lab('L01_two', 1, (f, lt) => { base(f); f.cam(camGroup([A1, B1], lt, { az: .3, fill: .75 })); f.fig(A1); f.fig(B1); });
// 2 rasengan hold close (hand2d)
const A2 = fig('naruto', 'base', t => atN('nar_rasHold', { ras: { hand: 'R', k: 1 } }));
lab('L02_ras', 1, (f, lt) => { base(f); f.style('hand2d'); f.cam(closeCam(A2, lt, { part: 'bust', az: .5, el: .05 })); f.fig(A2); });
// 3 sage mode bust
const A3 = fig('naruto', 'sage', t => atN('nar_stand', { face: expr('focusedCalm') }));
lab('L03_sage', 1, (f, lt) => { base(f, 'arena_nl_dusk'); f.style('hand2d'); f.cam(closeCam(A3, lt, { part: 'face', az: .35 })); f.fig(A3); });
// 4 kcm full + cloak
const A4 = fig('naruto', 'kcm', t => atN('nar_ready', {}, 0));
lab('L04_kcm', 1, (f, lt) => { base(f); f.cam(camGroup([A4], lt, { az: .4, fill: .8 })); f.fig(A4); });
// 5 baryon face
const A5 = fig('naruto', 'baryon', t => atN('nar_stand', { face: expr('nindo') }, 0));
lab('L05_baryon', 1, (f, lt) => { base(f, 'arena_nl_red'); f.style('hand2d'); f.cam(closeCam(A5, lt, { part: 'bust', az: .3 })); f.fig(A5); });
// 6 rasenshuriken raise
const A6 = fig('naruto', 'sage', t => atN('nar_rasRaise', { ras: { hand: 'R', k: 1, kind: 'shuriken' } }, 0));
lab('L06_shuriken', 1, (f, lt) => { base(f); f.cam(camGroup([A6], lt, { az: .4, fill: .6, el: -.05 })); f.fig(A6); });
// 7 clones + poofs
const CL = NL.clones(12, { c: [0, 0, -2], yaw: .3 });
lab('L07_clones', 1, (f, lt) => { base(f); f.cam(camWideGroup(CL.slice(0, 6), lt, { az: .35 })); CL.forEach(F => f.fig(F)); f.fx(g => fxClonePuffs(g, [[-3, 1, 0], [-1, 1, -1], [1, 1, 0], [3, 1, -2]], lt * .6, {}), { layer: 'over' }); });
// 8 luffy face close
const B8 = fig('luffy', 'base', t => atL('luf_stand', { face: expr('shishi') }, 0));
lab('L08_lufface', 1, (f, lt) => { base(f, 'arena_nl_day'); f.style('hand2d'); f.cam(closeCam(B8, lt, { part: 'face', az: -.3 })); f.fig(B8); });
// 9 gomu gomu no pistol (rubber arm)
const B9 = fig('luffy', 'base', t => atL('luf_pistol', { stretch: { side: 'R', to: [-5, 1.4, 0], k: 1, wave: .3 } }));
lab('L09_pistol', 1, (f, lt) => { base(f); f.cam(camGroup([B9], lt, { az: .2, fill: .7 })); f.fig(B9); f.fx(g => fxStretchLines(g, [LX, 1.4, 0], [-5, 1.4, 0], lt), { layer: 'over' }); });
// 10 gear 2
const B10 = fig('luffy', 'gear2', t => atL('luf_gear2', {}, 0));
lab('L10_gear2', 1, (f, lt) => { base(f); f.cam(camGroup([B10], lt, { az: -.4, fill: .75 })); f.fig(B10); });
// 11 gear 3 giant fist
const B11 = fig('luffy', 'gear3', t => atL('luf_pistolWind', { stretch: { side: 'R', to: [5, 3, -3], k: .6, giant: 1 } }, 0));
lab('L11_gear3', 1, (f, lt) => { base(f); f.cam(camGroup([B11], lt, { az: -.6, fill: .55 })); f.fig(B11); });
// 12 gear 4
const B12 = fig('luffy', 'gear4', t => atL('luf_bounce', {}, 0));
lab('L12_gear4', 1, (f, lt) => { base(f, 'arena_nl_dusk'); f.cam(camGroup([B12], lt, { az: -.4, fill: .78 })); f.fig(B12); });
// 13 gear 5 dance + boing
const B13 = fig('luffy', 'gear5', t => at([0, NL.bounceY(t * 1.5, .3), 0], -HP + .6, NL.nikaDance(t * 2, NL.bounceSq(t * 1.5))));
lab('L13_gear5', 1, (f, lt) => { base(f, 'arena_nl_toon', { toon: 1 }); f.cam(camGroup([B13], lt, { az: .2, fill: .75 })); f.fig(B13); f.fx(g => fxRubberGround(g, [0, 0, 0], lt + .3, { r: 7 }), { layer: 'under' }); f.text(g => fxBoing(g, lt, { text: 'BOING!', x: 1400, y: 300 })); });
// 14 gear 5 face close
const B14 = fig('luffy', 'gear5', t => atL('luf_hips', { face: expr('nikaLaugh'), eyePop: .6 }, 0));
lab('L14_g5face', 1, (f, lt) => { base(f, 'arena_nl_toon'); f.style('hand2d'); f.cam(closeCam(B14, lt, { part: 'bust', az: -.2 })); f.fig(B14); });
// 15 haki lightning clash
lab('L15_haki', 1, (f, lt) => { base(f, 'arena_nl_dark'); f.cam(camGroup([A1, B1], lt, { az: .3, fill: .75 })); f.fig(A1); f.fig(B1); f.fx(g => { fxHakiLightning(g, [0, 1.3, 0], lt + .2, { r: 6 }); fxClashSpiral(g, [0, 1.3, 0], lt); }, { layer: 'over' }); });
// 16 kurama
const A16 = fig('naruto', 'kcm', t => atN('nar_shout', {}, 0, 3));
lab('L16_kurama', 1, (f, lt) => { base(f); f.cam({ pos: [0, 4, 26], target: [0, 8, 0], fov: 50 }); f.fx(g => fxKurama(g, [0, 0, -2], lt, { scale: 14, roar: .6 }), { layer: 'under' }); f.fig(A16); });
// 17 rasengan hit
lab('L17_rashit', 1, (f, lt) => { base(f); f.cam(camGroup([A1, B1], lt, { az: .3, fill: .75 })); f.fig(A1); f.fig(B1); f.fx(g => fxRasenganHit(g, [0, 1.3, 0], lt * .6, {}), { layer: 'over' }); });
// 18 gatling (haki)
const B18 = fig('luffy', 'base', t => atL('luf_gatling', { haki: 'both' }, 0));
lab('L18_gatling', 1, (f, lt) => { base(f); f.cam(camGroup([B18], lt, { az: -.8, fill: .6 })); f.fig(B18); f.fx(g => fxGatling(g, B18, null, [-1, 0, 0], lt, { haki: 1 }), { layer: 'over' }); });
// 19 hat back + wounded
const B19 = fig('luffy', 'wounded', t => atL('luf_rise', { hat: 'back' }, 0)), A19 = fig('naruto', 'wounded', t => atN('nar_kneel', {}, -1.5));
lab('L19_wounded', 1, (f, lt) => { base(f, 'arena_nl', { dmg: 2, spiral: 1, crater: 1, craterAt: [0, 0, -3] }); f.cam(camGroup([A19, B19], lt, { az: 2.6, fill: .75 })); f.fig(A19); f.fig(B19); });
// 20 shunsui reaction
lab('L20_star', 1, (f, lt) => { NL.starShot(f, 'hatDown', lt, {}); });
// 21 arena wide
lab('L21_arena', 1, (f, lt) => { base(f, 'arena_nl_dusk', { leaves: 1 }); f.cam({ pos: [2, 22, 30], target: [0, 4, -10], fov: 50 }); f.fig(A1); f.fig(B1); });
lab('L22_kurAv', 1, (f, lt) => { base(f); f.cam({ pos: [0, 5, 30], target: [0, 8, 0], fov: 50 }); f.fx(g => fxKurama(g, [0, 0, -2], lt, { scale: 15, pose: 'catch', expr: 'angry' }), { layer: 'under' }); f.fig(A16); });
lab('L23_kurSeal', 1, (f, lt) => { std(f, { pal: 'nl_seal' }); f.bg({ set: 'nlseal', pal: 'nl_seal' }); f.cam({ pos: [0, 2, 8], target: [0, 6, -14], fov: 50 }); f.fx(g => fxKurama(g, [0, 0, -20], lt, { scale: 16, mode: 'real', pose: 'crouch', expr: 'grin' }), { layer: 'under' }); f.fg({ set: 'nlseal', bars: true }); });
lab('L24_kurHead', 1, (f, lt) => { base(f); f.cam({ pos: [0, 2, 10], target: [0, 2, 0], fov: 40 }); f.fx(g => fxKurama(g, [0, 2, 0], lt, { part: 'head', scale: 6, pose: 'bomb', orb: 1, expr: 'angry' }), { layer: 'over' }); });
lab('L25_kurEye', 1, (f, lt) => { std(f, { pal: 'nl_seal' }); f.bg({ set: 'nlseal', pal: 'nl_seal' }); f.cam({ pos: [0, 6, -4], target: [0, 6, -14], fov: 40 }); f.fx(g => fxKurama(g, [0, 6, -14.5], lt, { part: 'eye', scale: 5, mode: 'real' }), { layer: 'under' }); f.fg({ set: 'nlseal', bars: true }); });
const B26 = fig('luffy', 'gear5', t => atL('luf_g5Laugh', { hoseArms: 1, toonLines: 1 }, 0)), B27 = fig('luffy', 'gear5', t => atL('luf_g5Squash', {}, 0)), B28 = fig('luffy', 'battle', t => atL('luf_hatDown', {}, 0));
const B29 = fig('luffy', 'gear5', t => atL('luf_kick', { stretchLeg: { side: 'R', to: [-4, 1.2, 0], k: 1, wave: .4 } }, 0)), A30 = fig('naruto', 'hokage', t => at([0, 0, 0], Math.PI - .4, P('nar_stand')));
lab('L26_g5laugh', 1, (f, lt) => { base(f, 'arena_nl_toon'); f.cam(camGroup([B26], lt, { az: .2, fill: .75 })); f.fig(B26); });
lab('L27_g5squash', 1, (f, lt) => { base(f, 'arena_nl_toon'); f.cam(camGroup([B27], lt, { az: .2, fill: .5 })); f.fig(B27); });
lab('L28_battle', 1, (f, lt) => { base(f); f.style('hand2d'); f.cam(closeCam(B28, lt, { part: 'face', az: -.2 })); f.fig(B28); });
lab('L29_whip', 1, (f, lt) => { base(f, 'arena_nl_toon'); f.cam(camGroup([B29], lt, { az: .2, fill: .6 })); f.fig(B29); });
lab('L30_hokage', 1, (f, lt) => { base(f); f.cam(camGroup([A30], lt, { az: Math.PI - .4, fill: .8 })); f.fig(A30); });
lab('L31_toast', 1, (f, lt) => { NL.starShot(f, 'toast', lt, { cam: { part: 'bust', az: .4 } }); });
lab('L32_faint', 1, (f, lt) => { base(f, 'arena_nl', { faint: lt * .8, react: 'gasp', dmg: 2 }); f.cam({ pos: [4, 6, 14], target: [-6, 6, -20], fov: 50 }); f.fx(g => fxCrowdFG(g, lt, { n: 6, size: 340, faint: lt, rim: '#ff5a3a' }), { layer: 'over' }); });
lab('L33_toonrun', 1, (f, lt) => { base(f, 'arena_nl_toon', { react: 'toonRun', rubber: 1 }); f.cam({ pos: [4, 6, 14], target: [-6, 6, -20], fov: 50 }); });
