/* NL TEST REEL (~16 s, no story): Naruto + Luffy in motion on ones/twos, the arena, titles, impacts, Gear 5 cartoon, Kurama.
   node render.js preview reel/nlreel out.mp4 0.5 2                                                                       */
PROGRAM.reset(16, 'nlreel');
const RN = (p, o, x = -2.6, z = 0) => at([x, 0, z], HP, P(p, o)), RL = (p, o, x = 2.6, z = 0) => at([x, 0, z], -HP, P(p, o));
const BG0 = (f, pal = 'arena_nl', o = {}) => { std(f, { pal }); f.light({ ambientK: .18, shadeK: .42, rimAmt: .85, rimCol: '#ffb070' }); f.grade({ bright: 1.06 }); f.bg(Object.assign({ set: 'nlarena', pal }, o)); };
// R1 face-off (two-shot, slow push)
const R1N = fig('naruto', 'base', K([[0, RN('nar_stand')], [.6, RN('nar_thumbsUp'), 'back'], [1.6, RN('nar_thumbsUp')]]), { timing: 2 }), R1L = fig('luffy', 'base', K([[0, RL('luf_stand')], [.4, RL('luf_hips'), 'back'], [1.6, RL('luf_hips')]]), { timing: 2 });
shot('R1', 0, 1.6, (f, lt) => { BG0(f, 'arena_nl_dusk', { react: 'cheer' }); f.cam(camHandheld(camGroup([R1N, R1L], lt, { az: .25 + lt * .05, fill: .72 }), lt, .005)); f.fig(R1N); f.fig(R1L); f.fx(g => fxCrowdFG(g, lt, { n: 7, size: 300, rim: '#ffa060' }), { layer: 'over' }); });
// R2 Gomu Gomu no Pistol (arm stretches across, Naruto blocks)
const R2L = fig('luffy', 'base', t => { const k = clamp((t - .25) / .18, 0, 1), back = clamp((t - .75) / .2, 0, 1); return RL(t < .25 ? 'luf_pistolWind' : 'luf_pistol', { stretch: { side: 'R', to: [-2.3, 1.35, 0], k: k * (1 - back), wave: .25 } }); }, { timing: 1 });
const R2N = fig('naruto', 'base', K([[0, RN('nar_ready')], [.42, RN('nar_block'), 'snap'], [.6, RN('nar_block', {}, -3.0)], [1.2, RN('nar_block', {}, -3.0)]]), { timing: 1 });
shot('R2', 1.6, 2.8, (f, lt) => { BG0(f); f.cam(camShake(camGroup([R2N, R2L], lt, { az: -.35, fill: .7 }), [[.43, 20, .3, 22]], lt)); f.fig(R2N); f.fig(R2L);
  f.fx(g => { if (lt > .25 && lt < .8) fxStretchLines(g, [2.6, 1.4, 0], [-2.3, 1.4, 0], lt); fxShockSphere(g, [-2.3, 1.35, 0], lt - .43, { r: 1.2 }); }, { layer: 'over' });
  f.impact('COMIC_POW', { t0: .43, at: [-2.3, 1.35, 0] }); f.text(g => attackTitle(g, lt, { style: 'pirate', pre: 'GOMU GOMU NO', jp: 'ゴムゴムの', text: 'PISTOL!', t0: .05, dur: .7 })); });
// R3 shadow clones poof in
const R3N = fig('naruto', 'base', t => RN('nar_signCross', { face: faceAnim('yell', t, { talk: 1 }) }, 0, 1)), R3C = NL.clones(10, { c: [0, 0, -1], yaw: 0, key: (i, ph, t, pos) => at(pos, (hash(i) - .5) * .8, P(i % 2 ? 'nar_ready' : 'nar_kunai')) });
shot('R3', 2.8, 4.2, (f, lt) => { BG0(f); f.cam(camHandheld({ pos: [0, 2.2, 9], target: [0, 1.1, -1], fov: 46 }, lt, .006)); f.fig(R3N); if (lt > .35) R3C.forEach(F => f.fig(F));
  f.fx(g => fxClonePuffs(g, R3C.map(F => vAdd(figPos(F, lt, 'abd'), [0, .1, 0])), lt - .35, { stagger: .02, size: 1.1 }), { layer: 'over' }); f.impact('SMOKE_BURST', { t0: .35 });
  f.text(g => attackTitle(g, lt, { style: 'ninja', text: 'KAGE BUNSHIN NO JUTSU!', sub: '影分身の術', t0: .05, dur: 1.0 })); });
// R4 Rasengan close (hand2d) -> hit
const R4N = fig('naruto', 'sage', t => RN('nar_rasHold', { ras: { hand: 'R', k: clamp(t / .5, 0, 1) }, face: faceAnim('nindo', t, {}) }, 0));
shot('R4', 4.2, 5.4, (f, lt) => { BG0(f); f.style('hand2d'); f.cam(closeCam(R4N, lt, { part: 'bust', az: -.6, el: .05, dist: 1.6 })); f.fig(R4N); f.light({ fx: [{ p: figPos(R4N, lt, 'handR'), col: '#4fb6ff', r: 3, a: .6 }] });
  f.text(g => attackTitle(g, lt, { style: 'ninja', kind: 'rasengan', text: 'RASENGAN!', sub: '螺旋丸', t0: .1, dur: .8 })); });
const R5N = fig('naruto', 'sage', K([[0, RN('nar_rasHold', { ras: { hand: 'R', k: 1 } }, -1.6)], [.25, RN('nar_rasThrust', { ras: { hand: 'R', k: 1 } }, .6), 'snap'], [1.0, RN('nar_rasThrust', { ras: { hand: 'R', k: 0 } }, .6)]]), { timing: 1 });
const R5L = fig('luffy', 'base', K([[0, RL('luf_ready', {}, 1.6)], [.28, RL('luf_hurt', {}, 1.7), 'snap'], [1.0, RL('luf_knockback', {}, 4.5), 'out']]), { timing: 1 });
shot('R5', 5.4, 6.6, (f, lt) => { BG0(f, 'arena_nl', { dmg: 1, spiral: clamp((lt - .3) * 3, 0, 1), spiralAt: [1.4, 0, 0], spiralR: 2.5 }); f.cam(camShake(camGroup([R5N, R5L], lt, { az: .3, fill: .7 }), [[.28, 26, .5, 22]], lt)); f.fig(R5N); f.fig(R5L);
  f.fx(g => fxRasenganHit(g, [1.3, 1.2, 0], lt - .28, { size: 1.3 }), { layer: 'over' }); f.impact('RASEN_SPIRAL', { t0: .28, at: [1.3, 1.2, 0] }); });
// R6 Gear 5 cartoon: bounce, squash, BOYOOON
const R6L = fig('luffy', 'gear5', t => { const ph = t * 1.6; return at([0, NL.bounceY(ph, .9), 0], -HP + .5, NL.nikaDance(t * 2.2, Object.assign(NL.bounceSq(ph, .4), { squash: Math.max(-.8, Math.min(.6, Math.cos(ph * TAU) * .5 + (ph % 1 < .08 || ph % 1 > .92 ? -.9 : 0))), eyePop: .3 + .3 * Math.sin(t * 6), toonLines: .8 }))); }, { timing: 1 });
shot('R6', 6.6, 8.4, (f, lt) => { BG0(f, 'arena_nl_toon', { toon: 1, react: 'toonRun' }); f.light({ shadeTint: '#b9a6ff', ambientK: .3, shadeK: .3, rimCol: '#ffffff' }); f.cam(camHandheld(camGroup([R6L], lt, { az: .25, fill: .62, el: .05 }), lt, .004));
  f.fig(R6L); f.fx(g => fxRubberGround(g, [0, 0, 0], (lt * 1.6 % 1) * 1.2, { r: 6, amp: .3 }), { layer: 'under' }); f.text(g => { fxBoing(g, (lt - .55) * 1.2, { text: 'BOYOOON!', x: 1420, y: 330, size: 190 }); attackTitle(g, lt, { style: 'cartoon', text: 'GEAR FIFTH', jp: 'ギア5', t0: .9, dur: .6 }); });
  f.impact('TOON_POP', { t0: .62 }); });
// R7 Kurama avatar rises behind Naruto (KCM)
const R7N = fig('naruto', 'kurama', t => RN('nar_shout', { face: faceAnim('yell', t, { talk: .5 }) }, 0, 4));
shot('R7', 8.4, 10.2, (f, lt) => { BG0(f, 'arena_nl', { dmg: 2, react: 'gasp' }); f.cam(camPath([{ t: 0, pos: [0, 2, 20], target: [0, 4, 0], fov: 50 }, { t: 1.8, pos: [0, 3, 30], target: [0, 8, 0], fov: 52, ease: 'inOut' }])(lt));
  f.fx(g => fxKurama(g, [0, 0, 0], lt, { scale: 15, rise: clamp(lt / 1.0, 0, 1), pose: lt > 1.1 ? 'roar' : 'stand', expr: lt > 1.1 ? 'roar' : 'grin' }), { layer: 'under' }); f.fig(R7N); f.impact('KCM_GOLD', { t0: .05 });
  f.text(g => attackTitle(g, lt, { style: 'ninja', kind: 'kurama', text: 'KURAMA MODE', sub: '九喇嘛モード', t0: .15, dur: 1.2 })); });
// R8 Haki clash: Gear 4 Boundman vs Kurama Naruto, black-red lightning
const R8N = fig('naruto', 'kurama', K([[0, RN('nar_punchWind', {}, -2.4)], [.2, RN('nar_punch', {}, -1.0), 'snap'], [1.4, RN('nar_punch', {}, -1.0)]]), { timing: 1 });
const R8L = fig('luffy', 'boundman', K([[0, RL('luf_kongWind', {}, 2.6)], [.2, RL('luf_kongGun', {}, 1.2), 'snap'], [1.4, RL('luf_kongGun', {}, 1.2)]]), { timing: 1 });
shot('R8', 10.2, 11.8, (f, lt) => { BG0(f, 'arena_nl_dark', { dmg: 2 }); f.cam(camShake(camGroup([R8N, R8L], lt, { az: .2, fill: .72 }), [[.2, 30, 1.0, 26]], lt)); f.fig(R8N); f.fig(R8L);
  f.fx(g => { fxHakiLightning(g, [0, 1.5, 0], lt - .2, { r: 7, dur: 1.2 }); fxClashSpiral(g, [0, 1.5, 0], lt, { colA: '#ffc43a', colB: '#ff2a3a' }); }, { layer: 'over' }); f.impact('CONQUEROR_CLASH', { t0: .2, at: [0, 1.5, 0] }); });
// R9 Shunsui reaction
shot('R9', 11.8, 13.2, (f, lt) => { NL.starShot(f, 'hatUp', lt, { cam: { part: 'face', az: .35 } }); });
// R10 sage rasenshuriken raise + throw (wide, dusk)
const R10N = fig('naruto', 'sage', K([[0, RN('nar_rasRaise', { ras: { hand: 'R', k: 1, kind: 'shuriken' } }, -1)], [.9, RN('nar_rasRaise', { ras: { hand: 'R', k: 1, kind: 'shuriken' } }, -1)], [1.1, RN('nar_rasThrow', {}, -1), 'snap'], [2.8, RN('nar_rasThrow', {}, -1)]]), { timing: 1 });
shot('R10', 13.2, 16, (f, lt) => { BG0(f, 'arena_nl_dusk', { dmg: 2, cuts: clamp((lt - 1.6) * 2, 0, 1), cutsAt: [5, 0, -2], cutsR: 5 }); f.cam(camHandheld(camGroup([R10N], lt, { az: .5, fill: .55, el: -.05 }), lt, .005)); f.fig(R10N);
  f.fx(g => { if (lt > 1.1) { const k = clamp((lt - 1.1) / .4, 0, 1), p = vLerp([-1, 2.6, 0], [5, 1, -2], k); fxRasengan(g, p, lt, { kind: 'shuriken', k: 1 }); if (k >= 1) fxRasenganHit(g, [5, 1, -2], lt - 1.5, { kind: 'shuriken', size: 1.4 }); } }, { layer: 'over' });
  f.impact('RASENSHURIKEN', { t0: 1.5, at: [5, 1, -2] }); f.text(g => attackTitle(g, lt, { style: 'ninja', kind: 'shuriken', pre: 'SAGE ART:', text: 'RASENSHURIKEN!', sub: '仙法・螺旋手裏剣', t0: .1, dur: 1.2 })); });
