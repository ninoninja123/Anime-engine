/* IJ TITLES: lettering + cards.  node render.js sheet reel/ijtitles OUT.png list:... 0.3 4 */
PROGRAM.reset(20, 'ijtitles');
const A = fig('itachi', 'mangekyo', t => at([-2.2, 0, 0], HP, P('ita_stand'))), B = fig('julius', 'base', t => at([2.2, 0, 0], -HP, P('jul_hips')));
const bgs = (f) => { std(f, { pal: 'arena_ij' }); f.bg({ set: 'ijarena', pal: 'arena_ij' }); f.cam(camGroup([A, B], 0, { az: .25, fill: .8 })); f.fig(A); f.fig(B); };
const T = [['AMATERASU', 'itachi'], ['KATON: GŌKAKYŪ NO JUTSU', 'itachi'], ['GENJUTSU: SHARINGAN', 'itachi'], ['TIME MAGIC: CHRONO STASIS', 'julius'], ['MANA ZONE', 'julius'], ['CHRONO ANASTASIS', 'julius']];
T.forEach(([txt, who], i) => shot('T' + i, i * 2, i * 2 + 2, (f, lt) => { bgs(f); f.text(g => attackTitle(g, lt, Object.assign({ t0: 0, dur: 1.2 }, ijMoveTitle(lt, txt, { who })))); }));
shot('C0', 12, 15, (f, lt) => { f.cam({ pos: [0, 1.5, 5], target: [0, 1.2, 0], fov: 35 }); f.bg({ set: 'ijcard', who: 'itachi' }); f.text(g => fighterCard(g, lt, { who: 'itachi', side: 'left', t0: 0, dur: 2.6 })); });
shot('C1', 15, 18, (f, lt) => { f.cam({ pos: [0, 1.5, 5], target: [0, 1.2, 0], fov: 35 }); f.bg({ set: 'ijcard', who: 'julius' }); f.text(g => fighterCard(g, lt, { who: 'julius', side: 'right', t0: 0, dur: 2.2 })); vsCard; });
