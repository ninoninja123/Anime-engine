// quick engine smoke test
PROGRAM.reset(4, 'smoke');
const BY = makeFig(CAST.byakuya, { at: poseKeys([[0, pose('guard', { pos: [-1.6, 0, 0], yaw: HP })], [1.0, pose('slashWind', { pos: [-1.2, 0, 0], yaw: HP })], [1.25, pose('slashDown', { pos: [-.6, 0, 0], yaw: HP }), 'snap'], [2, pose('slashDown', { pos: [-.6, 0, 0], yaw: HP })]]) });
const KP = makeFig(CAST.kenpachi, { at: poseKeys([[0, pose('ready', { pos: [1.8, 0, 0], yaw: -HP })], [1.2, pose('block', { pos: [1.5, 0, 0], yaw: -HP })], [2, pose('block', { pos: [1.5, 0, 0], yaw: -HP })]]) });
shot('S1', 0, 4, (f, lt) => {
  f.cam(camPath([{ t: 0, orbit: { c: [0, 1.2, 0], r: 7, az: .5, el: .12 }, fov: 32 }, { t: 4, orbit: { c: [0, 1.2, 0], r: 5.5, az: -.4, el: .02 }, fov: 32, ease: 'inOut' }])(lt));
  f.bg({ set: 'seireitei', pal: 'day' });
  f.fig(BY); f.fig(KP);
  f.fx(g => fxSlashArc(g, BY, lt, { span: .12 }), { layer: 'over' });
  f.fx(g => fxClash(g, [0.4, 1.45, 0], lt - 1.25), { layer: 'glow' });
  f.shake([[1.25, 18, .4]]);
  f.impact('hit_heavy', { t0: 1.25, at: [.4, 1.4, 0] });
  f.text(g => attackTitle(g, lt, { t0: 1.6, text: 'Senbonzakura', sub: '千本桜' }));
});
