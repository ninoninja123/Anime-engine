/* IJ IMPACT LAB: every impact sequence from the same moment.  node render.js sheet reel/ijimpact OUT.png 0 N N 0.3 6 */
PROGRAM.reset(60, 'ijimpact');
const A = fig('itachi', 'mangekyo', t => at([-2.2, 0, 0], HP, P('ita_kunaiSlash'))), B = fig('julius', 'base', t => at([2.2, 0, 0], -HP, P('jul_cast')));
const SEQS = ['MANGEKYO_FLASH', 'AMATERASU_BURN', 'TSUKUYOMI_RED', 'CROW_SCATTER', 'SUSANOO_FLARE', 'IZANAMI_LOOP', 'UCHIHA_FAN', 'CLOCK_FREEZE', 'TIME_GOLD', 'MANA_BURST', 'CHRONO_REWIND', 'WIZARD_CREST', 'BURST_ITA', 'BURST_JUL', 'BURST_CLASH', 'BURST'];
let T0 = 0; SEQS.forEach(name => { const n = impactLen(name); const dur = Math.max(1, (n + 2) / 24); shot('I_' + name, T0, T0 + dur, (f, lt) => { std(f, { pal: 'arena_ij' }); f.bg({ set: 'ijarena', pal: 'arena_ij' }); f.cam(camGroup([A, B], 0, { az: .25, fill: .8 })); f.fig(A); f.fig(B); f.impact(name, { t0: 1 / 24 }); }); T0 += dur; });
