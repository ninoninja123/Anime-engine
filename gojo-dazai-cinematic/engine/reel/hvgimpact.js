/* HVG impact lab: every impact_requests.md sequence on the same arena shot.  node render.js sheet reel/hvgimpact OUT.png list:... 0.4 6 */
PROGRAM.reset(60, 'hvgimpact');
const IH = fig('harry', 'base', t => at([-1.4, 0, .2], 1.3, P('har_cast')), { timing: 2 });
const IG = fig('gojo', 'base', t => at([1.5, 0, -.1], -1.7, P('goj_infinity')), { timing: 2 });
const IMPL = ['FAN_SNAP', 'POWER_CARD_H', 'POWER_CARD_G', 'SIX_EYES', 'GONG_WAVE', 'SPELL_RED', 'INFINITY_FREEZE', 'BLUE_SINGULARITY', 'PROTEGO_DOME', 'APPARATE_TWIST', 'RED_REPULSE', 'BLACK_FLASH', 'UNLIMITED_VOID', 'HOLLOW_PURPLE',
  'SIX_EYES_POV', 'MEMORY_SEPIA', 'CLOAK_FADE', 'VOID_PASS', 'DOMAIN_SHATTER', 'HALLOWS_SIGIL', 'PATRONUS_SILVER', 'SNITCH_TOUCH', 'PORTKEY_SPIN', 'RING_OUT', 'WINNER_CARD', 'HANDSHAKE_GLOW'];
IMPL.forEach((nm, i) => shot('I_' + nm, i * 2, i * 2 + 2, (f, lt) => {
  std(f, { pal: 'valhalla' }); f.light({ ambientK: .16, shadeK: .42, rimAmt: .8, rimCol: '#ffd0a0' });
  f.cam(camGroup([IH, IG], lt, { az: .2, el: .06, fill: .62 })); f.bg({ set: 'valhalla' }); f.fig(IH); f.fig(IG);
  f.fx(g => fxRed(g, figPos(IG, lt, 'handR'), [-1, 0, 0], lt, { charge: 9 }), { layer: 'glow' });
  f.impact(nm, { t0: 1.0 });
  f.text(g => g.font && (g.save(), g.font = '800 50px Inter', g.fillStyle = '#fff', g.strokeStyle = '#000', g.lineWidth = 6, g.strokeText(nm, 40, 70), g.fillText(nm, 40, 70), g.restore()));
}));
