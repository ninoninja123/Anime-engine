// hand2d close-up lab: each character, three angles (front / 3-4 / side), style hand2d vs action3d
const NAMES = ['byakuya', 'hitsugaya', 'kenpachi', 'kyoraku', 'tosen', 'mayuri'], ANG = [0, .65, 1.45];
PROGRAM.reset(NAMES.length * 4 * .5, 'h2dlab');
NAMES.forEach((n, i) => [0, 1, 2, 3].forEach(j => {
  const F = fig(n, 'base', t => P('stand', { face: expr(j === 3 ? 'angry' : 'calm'), sword: { sheathed: true } }), { springWin: 0 });
  shot(`H_${n}_${j}`, (i * 4 + j) * .5, (i * 4 + j + 1) * .5, (f, lt) => {
    std(f, { pal: 'day', post: 'soft' }); f.style(j === 3 ? 'action3d' : 'hand2d');
    const hc = figPos(F, 0, 'head'), az = j === 3 ? .65 : ANG[j], h = CAST[n].h;
    f.cam({ pos: vAdd(hc, orbitPos({ c: [0, -.03, 0], r: .62 * Math.max(1, h / 1.8), az, el: .04 })), target: vAdd(hc, [0, -.05, 0]), fov: 30 });
    f.bg({ set: 'courtyard', pal: 'day' }); f.fig(F);
  });
}));
