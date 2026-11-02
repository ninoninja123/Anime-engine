/* all impact sequences of impact_gow.js, one 1 s shot each (impact starts at lt .25).  sheet: list:k+0.25+1.5/24 ...  */
const GI_SEQ = ['PUPPET_STRINGS', 'STRING_SNAP', 'MEMORY_REWRITE', 'MEMORY_CRACK', 'DOLL_JOINTS', 'NIGHTMARE_INK', 'STITCH_REBUILD', 'HIJACK_RINGS', 'MEMORY_REWIND', 'gow_invasion', 'gow_rewrite', 'gow_jack', 'gow_blackout', 'gow_herritt', 'gow_lostworld', 'daz_nlh_doll', 'daz_reality', 'ura_okiro', 'ura_fan', 'ura_bankai_stitch', 'ura_shitone', 'clash_gdu', 'gow_doll', 'gow_broken'];
PROGRAM.reset(GI_SEQ.length, 'gowimpact');
const GI_G = fig('gowther', 'herritt', t => at([0, 0, 0], .2, P('gow_bowAim')), { timing: 2 });
const GI_D = fig('dazai', 'base', t => at([-1.7, 0, .4], .6, P('dazai_reach')), { timing: 2 });
const GI_U = fig('urahara', 'shikai', t => at([1.7, 0, .2], -.6, P('urahara_ready')), { timing: 2 });
GI_SEQ.forEach((s, k) => shot('GI_' + s, k, k + 1, (f, lt) => { std(f, { pal: 'mindlib' }); f.cam(camGroup([GI_G, GI_D, GI_U], lt, { az: .15, fill: .7 })); f.bg({ set: 'mindlib' }); f.fig(GI_G); f.fig(GI_D); f.fig(GI_U); f.impact(s, { t0: .25, text: s === 'ura_fan' ? '浦原' : undefined }); }));
