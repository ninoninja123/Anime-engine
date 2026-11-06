/* HY LAB: arena states + characters + star crowd.  node render.js stills reel/hylab DIR 1,3,5,7,9,11 0.5 */
PROGRAM.reset(12, 'hylab');
const LH = fig('hulk', 'base', t => breathe(at([-3, 0, 0], HP, P('hlk_stand')), t), { timing: 2 });
const LY = fig('yujiro', 'base', t => breathe(at([3, 0, 0], -HP, P('yuj_stand')), t), { timing: 2 });
[['arena_hy', 0], ['arena_hy_dust', 1], ['arena_hy_red', 2], ['arena_hy_dark', 3]].forEach(([pal, dmg], i) =>
  shot('L' + i, i * 2, i * 2 + 2, (f, lt) => { std(f, { pal }); f.cam(camLowTwo([LH, LY], lt, { az: .35 + i * .7 })); f.bg({ set: 'hyarena', pal, dmg, gamma: i === 3 ? 1 : 0 }); f.fig(LH); f.fig(LY); ['shunsui', 'dazai', 'urahara', 'gojo', 'harry', 'gowther', 'shinji', 'aizen'].forEach(k => crowdStar(f, k, i % 2 ? 'cheer' : 'gasp')); }));
shot('S1', 8, 10, (f, lt) => starShot(f, 'shunsui', 'hush', lt));
shot('S2', 10, 12, (f, lt) => { std(f, { pal: 'arena_hy' }); f.cam(camStands(lt, { tier: 1, ang: -1.3, fov: 42 })); f.bg({ set: 'hyarena', pal: 'arena_hy', dmg: 2 }); f.fig(LH); f.fig(LY); ['shunsui', 'dazai', 'aizen', 'urahara'].forEach(k => crowdStar(f, k, 'gasp')); f.fx(g => fxCrowdFG(g, lt, { n: 7, size: 340 }), { layer: 'over' }); });
