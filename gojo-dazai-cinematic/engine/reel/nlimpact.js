/* NL IMPACT LAB: every impact_nl sequence on the same two-shot.  node render.js sheet reel/nlimpact OUT.png list:... */
PROGRAM.reset(50, 'nlimpact');
const IA = fig('naruto', 'base', t => at([-2.2, 0, 0], HP, P('nar_rasThrust', { ras: { hand: 'R', k: 1 } })), { timing: 1 });
const IB = fig('luffy', 'base', t => at([2.2, 0, 0], -HP, P('luf_pistol', { stretch: { side: 'R', to: [-1.2, 1.4, 0], k: 1 } })), { timing: 1 });
const NLSEQ = ['CLONE_SLIP', 'FLARE_RING', 'LIFE_DRAIN', 'BAJRANG_COLLIDE', 'GEAR5_TIMEOUT', 'EMBER_FADE', 'MEMORY_GOLD', 'CLONE_POOF_SAGE', 'FINAL_RASENGAN', 'BACK_DOWN', 'SMOKE_BURST', 'POWER_CARD_N', 'POWER_CARD_L', 'RASEN_SPIRAL', 'SAGE_EYES', 'GEAR2_STEAM', 'HAKI_BLACK', 'BOUNDMAN_INFLATE', 'KCM_GOLD', 'BIJUDAMA_BLAST', 'CONQUEROR_WAVE', 'CONQUEROR_CLASH', 'RASENSHURIKEN', 'NIKA_BURST', 'CARTOON_POP', 'RUBBER_WORLD', 'SQUASH_STRETCH', 'CARTOON_XRAY', 'TOON_DUNK', 'COMIC_POW', 'EYE_ORANGE', 'WORLD_BREAKER', 'DUAL_CLASH', 'RASENGAN_SPIRAL', 'RASENSHURIKEN_CUTS', 'CLONE_WALL', 'SAGE_EYES', 'KURAMA_GOLD', 'BARYON_RED', 'HAKI_CRACK', 'GOMU_STRETCH', 'GIANT_FIST', 'GEAR_FOURTH', 'TOON_POP', 'DRUMS_DON', 'NL_CLASH'];
NLSEQ.forEach((sq, i) => shot('I_' + sq, i, i + 1, (f, lt) => {
  std(f, { pal: 'arena_nl' }); f.bg({ set: 'nlarena', pal: 'arena_nl' }); f.cam(camGroup([IA, IB], lt, { az: .3, fill: .75 })); f.fig(IA); f.fig(IB);
  f.impact(sq, { t0: 0, at: [0, 1.4, 0], fig: 0 });
}));
