/* SAD IMPACT LAB - every Shinji/Aizen/Dazai impact sequence on the same moment (0.5 s per sequence, impact starts at 0.1 s). */
const SEQS = ['MIRROR_SHATTER', 'INVERT_FLIP', 'NLH_PAGE', 'NLH_RING', 'NLH_SHATTER', 'HOLLOW_EYE', 'CERO_LINE', 'VIOLET_PRESSURE', 'KUROHITSUGI_BOX', 'GOLD_FLOWER', 'GUN_FLASH', 'BANDAGE_WRAP', 'FRIEND_FOE', 'RIMSIL', 'CLOSEUP_PANELS', 'shinji_taore', 'shinji_inverted', 'shinji_mask', 'shinji_cero', 'shinji_bankai', 'shinji_senju', 'aizen_kyoka', 'aizen_shatter', 'aizen_kurohitsugi', 'aizen_hogyoku', 'aizen_pressure', 'aizen_chrysalis', 'dazai_touch', 'dazai_nullify', 'dazai_gun', 'dazai_page', 'clash_sad', 'death_sad'];
PROGRAM.reset(SEQS.length * .5, 'sadimpact');
const I_SHI = fig('shinji', 'shikai', t => at([-1.4, 0, 0], .9, P('shinji_slash')), { timing: 2 });
const I_AIZ = fig('aizen', 'base', t => at([1.3, 0, -.3], -.9, P('aizen_block')), { timing: 2 });
const I_DAZ = fig('dazai', 'base', t => at([0, 0, 1.0], 0, P('dazai_touch')), { timing: 2 });
SEQS.forEach((sq, i) => shot('I_' + sq, i * .5, i * .5 + .5, (f, lt) => { std(f, { pal: 'harbor' }); f.cam({ pos: [0, 1.4, 6.2], target: [0, 1.2, 0], fov: 36 }); f.bg({ set: 'yokohama' }); f.fig(I_SHI); f.fig(I_AIZ); f.fig(I_DAZ); f.impact(sq, { t0: .1, at: [0, 1.3, 0] }); }));
