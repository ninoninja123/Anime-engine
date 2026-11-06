/* HVG LAB: one shot per set + figures (stills check).  node render.js stills reel/hvglab DIR 0.5,2.5,... 0.5 */
PROGRAM.reset(24, 'hvglab');
const LH = fig('harry', 'base', t => at([-1.6, 0, .3], 1.2, P('har_ready')), { timing: 2 });
const LG = fig('gojo', 'base', t => at([1.7, 0, -.2], -1.6, P('goj_pockets')), { timing: 2 });
const LU = fig('urahara', 'base', t => at(HVG.BOOTH.pos, 0, P('urahara_announceFan', { ground: false })), { timing: 2 });
const SETL = [['valhalla', 'valhalla'], ['valhalla', 'valhalla_day'], ['valgate', 'valgate'], ['voidspace', 'void_inf'], ['hogwarts', 'hog_dusk'], ['darkforest', 'forest_night'], ['heavens', 'heavens'], ['valhalla', 'valhalla_red'], ['jjhigh', 'jj_summer'], ['hogwarts', 'hog_night'], ['heavens', 'valgate'], ['cardbg', 'valhalla']];
SETL.forEach(([s, p], i) => shot('L' + i, i * 2, i * 2 + 2, (f, lt) => {
  std(f, { pal: p }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .8, rimCol: '#ffd0a0' }); f.grade({ bright: 1.08 });
  f.cam(i === 10 ? { pos: [0, 10, 30], target: [0, -60, -60], fov: 55 } : i % 2 ? camGroup([LH, LG], lt, { az: .25 + lt * .05, el: .08, fill: .62 }) : { pos: [12, 6, 14], target: [-6, 4, -6], fov: 55 }); if (i === 0) f.fig(LU);
  f.bg({ set: s, pal: p, dmg: i === 7 ? 2 : 0, crater: i === 7 ? 1 : 0, react: i === 2 ? 'gasp' : 'cheer', arena: i === 10, lightning: i === 10, who: 'gojo', eyes: i === 5 }); f.fig(LH); f.fig(LG);
}));

