/* HY impact lab: every Hulk/Yujiro impact sequence on the same arena shot (frame 2 of each).  node render.js sheet reel/hyimpact OUT.png list:1.05,3.05,... 0.4 6 */
PROGRAM.reset(84, 'hyimpact');
const IH = fig('hulk', 'base', t => at([-2.2, 0, .2], 1.3, P('hlk_punch')), { timing: 2 });
const IY = fig('yujiro', 'bare', t => at([1.6, 0, -.1], -1.7, P('yuj_block')), { timing: 2 });
const HYIMPL = ['GAMMA_BURST', 'ROAR_RINGS', 'COMIC_POW', 'COMIC_HALFTONE', 'SHOCKWAVE_RING', 'CONCRETE_SHATTER', 'MANGA_PANELS', 'IMPACT_CRATER', 'RAGE_VEINS', 'INK_STARE', 'OGRE_AURA', 'INK_SPLASH_HIT', 'ONI_FACE', 'DUAL_CLASH', 'BONE_CRACK', 'MUSCLE_BULGE',
  'hlk_smash', 'hlk_clap', 'hlk_roar', 'hlk_land', 'hlk_haymaker', 'yuj_fist', 'yuj_oni', 'yuj_stare', 'yuj_kick', 'clash_hy', 'WORLD_BREAKER', 'BONE_XRAY', 'STILL_RIPPLE', 'OGRE_EYE', 'SPIRAL_REDIRECT', 'GIANT_ONI_VISION', 'SHRINK_SILHOUETTE', 'ONI_FIST', 'WHITE_NEG', 'TOXIC'];
HYIMPL.forEach((nm, i) => shot('I_' + nm, i * 2, i * 2 + 2, (f, lt) => {
  std(f, { pal: 'arena_hy' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .8, rimCol: '#ffd0a0' });
  f.cam(camGroup([IH, IY], lt, { az: .2, el: .02, fill: .7 })); f.bg({ set: 'hyarena', dmg: 1 }); f.fig(IH); f.fig(IY);
  f.impact(nm, { t0: 1.0, fig: nm === 'INK_STARE' || nm === 'yuj_stare' ? 1 : 0, part: nm.includes('BULGE') ? 'hand' : undefined });
  f.text(g => (g.save(), g.font = '800 50px Inter', g.fillStyle = '#fff', g.strokeStyle = '#000', g.lineWidth = 6, g.strokeText(nm, 40, 70), g.fillText(nm, 40, 70), g.restore()));
}));
