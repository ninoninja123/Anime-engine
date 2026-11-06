// every registered impact SEQUENCE, one shot each (1 s), on a clash between two captains
const SEQS = Object.keys(IMPACT_SEQ);
PROGRAM.reset(SEQS.length, 'seqlab');
const SBY = makeFig(CAST.byakuya, { form: 'shikai', at: t => pose('slashDown', { pos: [-.7, 0, 0], yaw: HP, face: expr('angry') }) });
const SKP = makeFig(CAST.kenpachi, { at: t => pose('block', { pos: [1.4, 0, 0], yaw: -HP, face: expr('grin') }) });
SEQS.forEach((s, i) => shot('Q_' + s, i, i + 1, (f, lt) => {
  f.cam({ pos: [1.0, 1.35, 5.0], target: [.2, 1.25, 0], fov: 38 });
  f.bg({ set: 'seireitei', pal: 'day' }); f.fig(SBY); f.fig(SKP);
  f.fx(g => fxPetals(g, 1, { c: [-.7, 0, 0], r: 2.2, h: 3, n: 500 }), { layer: 'over' });
  f.fx(g => fxClash(g, [.45, 1.45, 0], .06), { layer: 'glow' });
  f.impact(s, { t0: 0, at: [.45, 1.45, 0], fig: 1 });
  f.text(g => { g.fillStyle = '#000'; g.fillRect(0, 0, 900, 70); g.fillStyle = '#fff'; g.font = '700 44px Inter'; g.fillText(s, 20, 50); });
}));
