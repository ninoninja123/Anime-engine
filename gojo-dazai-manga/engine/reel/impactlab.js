// impact style lab: one shot per style, same clash moment
const STY = ['invert','hatch','whiteout','blackaccent','redblack','chroma','kanji','shatter','panels','flash','overexpose','radial','lens','closeup','desat','rimsil','duotone','ink','posterize','black','sumi','tear','kabuki','waterink','crimsonline','dualsplit','crystal','toxic','rings','speedburst'];
PROGRAM.reset(STY.length * .5, 'impactlab');
const IBY = makeFig(CAST.byakuya, { at: t => pose('slashDown', { pos: [-.7, 0, 0], yaw: HP, face: expr('angry') }) });
const IKP = makeFig(CAST.kenpachi, { at: t => pose('block', { pos: [1.4, 0, 0], yaw: -HP, face: expr('grin') }) });
STY.forEach((s, i) => shot('I_' + s, i * .5, i * .5 + .5, (f, lt) => {
  f.cam({ pos: [1.2, 1.4, 5.2], target: [.2, 1.25, 0], fov: 38 });
  f.bg({ set: 'seireitei', pal: 'dusk' }); f.fig(IBY); f.fig(IKP);
  f.fx(g => { fxPetals(g, 1, { c: [-.7, 0, 0], r: 2.2, h: 3, n: 600 }); }, { layer: 'over' });
  f.fx(g => fxClash(g, [.45, 1.45, 0], .06), { layer: 'glow' });
  f.impact(s, { t0: 0, n: 12, at: [.45, 1.45, 0], part: 'eye', strip: true, fig: 1 });
}));
