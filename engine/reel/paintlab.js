// painted backgrounds + hand2d figures on all sets
const CFG = [['seireitei', 'day', { pos: [3, 1.6, 9], target: [-1, 2.2, -10], fov: 45 }, 'byakuya', 0], ['seireitei', 'dusk', { pos: [-5, 6, 16], target: [1, 1, -4], fov: 40 }, 'kenpachi', 2],
  ['rooftops', 'noon', { pos: [0, 12, 8], target: [4, 9.5, -6], fov: 45 }, 'hitsugaya', 0], ['courtyard', 'day', { pos: [0, 1.6, 9], target: [0, 1.8, 0], fov: 45 }, 'kyoraku', 1],
  ['wasteland', 'dusk', { pos: [0, 1.4, 8], target: [0, 2, -6], fov: 45 }, 'tosen', 1], ['ice', 'ice', { pos: [0, 2.4, 9], target: [0, 1.8, 0], fov: 45, roll: .1 }, 'mayuri', 0]];
PROGRAM.reset(CFG.length * 2, 'paintlab');
CFG.forEach(([set, pal, cam, who, dmg], i) => [0, 1].forEach(j => {
  const F = fig(who, 'base', t => at(set === 'rooftops' ? [3, 9.3, -3] : [0, 0, 2], 0, P('guard', { face: expr('determined') })));
  shot(`P_${set}_${j}`, i * 2 + j, i * 2 + j + 1, (f, lt) => { std(f, { pal }); if (j) f.style('hand2d'); f.cam(cam); f.bg({ set, pal, dmg }); f.fig(F); });
}));
