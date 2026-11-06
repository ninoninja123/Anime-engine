/* TEST REEL 2 - hybrid style (no story, no finale) ~26 s.
   hand2d close-ups for all six captains (blink, gaze, talk, breathing, hair, tense hands), hybrid cuts between
   action3d wide shots and hand2d close-ups, painted backgrounds, Konjiki + ice dragon redesigns, and the
   pre-production impact sequences (SAKURA_PINK, RED_BLACK, ICE_CRYSTAL, DUAL_TONE, SUMI_INK, CHROMA_SPLIT,
   VOID_LINEART, TOXIC, SENKEI_LIGHTS, PAPER_TEAR, CRIMSON_WHITE, KABUKI_BOARD).                                */
PROGRAM.reset(26, 'testreel2');
const W_DUSK = t => [4, 0, -3];
// ------------------------------------------------------------------------------------------------ Byakuya
const B1 = fig('byakuya', 'base', t => breathe(at([0, 0, 0], .2, P('byakuya_point', { face: faceAnim(expr('calm', { eye: t < .9 ? 0 : .7 }), t, { gaze: [[0, [0, 0]], [1.4, [-.4, 0]], [1.8, [.2, .05]]] }) })), t), { timing: 2, wind: W_DUSK });
shot('N01_court', 0, 2.4, (f, lt) => {
  std(f, { pal: 'dusk', grade: { soft: ['#ffd0b0', .15] } });
  f.cam(camPath([{ t: 0, pos: [-4, 1.4, 12], target: [0, 2.6, 0], fov: 38 }, { t: 2.4, pos: [-2.2, 1.3, 7.5], target: [0, 1.9, 0], fov: 34, ease: 'inOut' }])(lt));
  f.bg({ set: 'courtyard', pal: 'dusk' }); f.fig(B1);
  f.fg(g => drawForegroundBranch(g, PALETTES.dusk, 'tr', lt, '#f4a8c4', 7));
  f.fx(g => fxPetals(g, lt, { n: 300, size: .06, flow: (i, u, t) => [((u * 24 + t * 3 + hash(i) * 3) % 24) - 12, .4 + hash(i * 3) * 5, (hash(i * 7) - .5) * 12] }), { layer: 'over' });
});
shot('N02_byakuya_face', 2.4, 4.4, (f, lt) => {
  std(f, { pal: 'dusk', post: 'soft' }); f.style('hand2d'); f.trans({ type: 'inkWipe', dur: .3 });
  f.cam(camHandheld(closeCam(B1, 2.4 + lt, { part: 'face', az: .55, el: .02, dist: 1.05 + lt * .03 }), lt, .004, 2));
  f.light({ rimAmt: .7, rimCol: '#ffd8b0' });
  f.bg({ set: 'courtyard', pal: 'dusk' }); f.fig(B1, { t: 2.4 + lt });
  f.fx(g => fxPetals(g, lt, { n: 90, size: .02, flow: (i, u, t) => vAdd(figPos(B1, 2.4, 'head'), [((u * 3 + t * .8) % 3) - 1.5, (hash(i) - .5) * .8, (hash(i * 3) - .2) * .9]) }), { layer: 'over' });
});
shot('N03_byakuya_eye', 4.4, 6.0, (f, lt) => {
  std(f, { pal: 'dusk', post: 'hot' }); f.style('hand2d');
  f.cam(closeCam(B1, 4.4, { part: 'eye', az: .3, dist: 1.1 - lt * .1 }));
  f.bg({ set: 'courtyard', pal: 'dusk' }); f.fig(B1, { t: 2.4 + 1.6 });
  f.fx(g => fxSpeedLines(g, lt, { col: '#ffd6e6', n: 50, inner: 420, alpha: clamp((lt - .9) * 3, 0, .8) }), { layer: 'top' });
  f.impact('SAKURA_PINK', { t0: 1.2 });
});
// ------------------------------------------------------------------------------------------------ Kenpachi
const K1 = fig('kenpachi', 'base', t => breathe(at([0, 0, 0], 0, P('kenpachi_shoulder', { face: faceAnim('grin', t, { talk: t > .5 && t < 1.6 ? 1 : 0, seed: 3 }) })), t, 1.6), { timing: 2, wind: t => [2, 0, 0] });
const K2 = fig('kenpachi', 'base', K([[0, at([0, 0, 0], 0, P('guard', { face: expr('menace'), hR: 'grip', hL: 'grip', sword: { hand: 'R', dir: [0, .78, .62], two: true } }))], [1.2, at([0, 0, 0], 0, P('guard', { face: expr('rage'), sp: .2, sword: { hand: 'R', dir: [0, .7, .7], two: true } }))]]), { timing: 1 });
shot('N04_kenpachi_bust', 6.0, 8.4, (f, lt) => {
  std(f, { pal: 'storm', post: 'dark' }); f.style('hand2d'); f.trans({ type: 'whiteFlash', dur: .12 });
  f.cam(camHandheld(closeCam(K1, lt, { part: 'bust', az: .55, el: -.28, dist: .95 }), lt, .01, 7));
  f.bg({ set: 'seireitei', pal: 'storm', seed: 2, dmg: 1 }); f.fig(K1);
  f.fx(g => fxAura(g, K1, lt, { col: '#ffd84a', col2: '#fff6c8', amt: clamp(lt - 1.2, 0, 1) * .8 }), { layer: 'under' });
  f.shake([[1.6, 6, .8, 18]]);
});
shot('N05_kenpachi_hands', 8.4, 9.6, (f, lt) => {
  std(f, { pal: 'storm', post: 'hot' }); f.style('hand2d');
  f.cam(closeCam(K2, lt, { part: 'hands', az: .5, el: .15, dist: .9 }));
  f.bg({ set: 'seireitei', pal: 'storm', seed: 2, dmg: 1 }); f.fig(K2, { boil: 1.2 });
  f.shake([[.2, 3, 1, 30]]);
  f.impact('RED_BLACK', { t0: .8, fig: 0 });
});
// ------------------------------------------------------------------------------------------------ Hitsugaya
const T1 = fig('hitsugaya', 'shikai', K([[0, at([0, 0, 0], .2, P('toshiro_cast', { face: expr('determined') }))], [.4, at([0, 0, 0], .2, P('toshiro_thrust', { face: expr('shout') })), 'snap'], [2.4, at([0, 0, 0], .2, P('toshiro_thrust', { face: faceAnim('shout', 1, { talk: 1.5 }) }))]]), { timing: 1 });
shot('N06_dragon', 9.6, 12.0, (f, lt) => {
  std(f, { pal: 'ice', postOver: { bloom: .5 } }); f.trans({ type: 'smear', dur: .2, ang: .2 });
  f.cam(camHandheld(camPath([{ t: 0, pos: [-5.5, 1.2, 5], target: [.5, 1.6, -2], fov: 40 }, { t: 2.4, pos: [-7, 2.0, 2], target: [2, 2.2, -4], fov: 46, ease: 'out' }])(lt), lt, .03, 9));
  f.light({ fx: [{ p: [2, 2, -3], col: '#7fe8ff', r: 9, a: .55 }] });
  f.bg({ set: 'ice', pal: 'ice' }); f.fig(T1);
  f.fx(g => { fxIceDragon(g, lt, { path: iceDragonPath([.4, 1.6, -1], lt, { dir: [.2, .1, -1], len: 12, head: clamp(lt / 1.4, .05, 1.2), wave: 1.1 }), r: .8 }); fxSnow(g, lt, { n: 80 }); }, { layer: 'over' });
  f.fx(g => fxIceGrowth(g, [2, 0, -6], lt - 1.0, { r: 3, h: 3.2, n: 16 }), { layer: 'under' });
  f.impact('ICE_CRYSTAL', { t0: 1.3, at: [2, 2, -6] });
  f.text(g => attackTitle(g, lt, { t0: 1.6, dur: .7, text: 'Hyorinmaru', sub: '氷輪丸', col2: '#9fe8ff', glow: '#7fe8ff', align: 'right', x: W - 120 }));
});
shot('N07_toshiro_face', 12.0, 13.6, (f, lt) => {
  std(f, { pal: 'ice' }); f.style('hand2d');
  f.cam(camHandheld(closeCam(T1, 1.2 + lt, { part: 'face', az: .35, el: -.42, dist: 1.1 }), lt, .006, 4));
  f.light({ fx: [{ p: vAdd(figPos(T1, 1.2, 'head'), [.4, -.2, .6]), col: '#7fe8ff', r: 2.5, a: .55 }], rimCol: '#bff4ff', rimAmt: .8 });
  f.bg({ set: 'ice', pal: 'ice' }); f.fig(T1, { t: 1.2 + lt });
  f.fx(g => fxSnow(g, lt, { n: 120, size: 4 }), { layer: 'over' });
  f.impact('DUAL_TONE', { t0: 1.3 });
});
// ------------------------------------------------------------------------------------------------ Kyoraku
const Y1 = fig('kyoraku', 'base', t => breathe(at([0, 0, 0], -.3, P('kyoraku_hat', { face: faceAnim(expr('smirk', { eye: .65 }), t, { seed: 5, gaze: [[0, [0, -.1]], [1.2, [.3, 0]]] }) })), t), { timing: 2, wind: t => [3, 0, 2] });
shot('N08_kyoraku', 13.6, 15.6, (f, lt) => {
  std(f, { pal: 'day', post: 'soft' }); f.style('hand2d'); f.trans({ type: 'petals', dur: .35 });
  f.cam(closeCam(Y1, lt, { part: 'face', az: .25, el: -.2, dist: 1.05, aperture: 18 }));
  f.bg({ set: 'courtyard', pal: 'day' }); f.fig(Y1);
  f.fx(g => fxFlowerSwirl(g, lt, { c: vAdd(figPos(Y1, 0, 'head'), [0, -.4, 0]), r: .9, h: 1.2, n: 140, size: .025 }), { layer: 'over' });
  f.impact('SUMI_INK', { t0: 1.75 });
});
// ------------------------------------------------------------------------------------------------ Tosen
const U1 = fig('tosen', 'shikai', t => breathe(at([0, 0, 0], 0, P('tosen_ring', { face: faceAnim('calm', t, { talk: t > .3 && t < 1.1 ? .8 : 0 }) })), t), { timing: 2, wind: t => [-2, 0, 1] });
shot('N09_tosen', 15.6, 17.4, (f, lt) => {
  std(f, { pal: 'night', post: 'dark' }); f.style('hand2d');
  f.cam(closeCam(U1, lt, { part: 'face', az: .75, el: .02, dist: 1.2 + lt * .08 }));
  f.light({ rimCol: '#c8c0ff', rimAmt: .9 });
  f.bg({ set: 'seireitei', pal: 'night', seed: 4 }); f.fig(U1);
  f.fx(g => fxSoundRings(g, vAdd(figPos(U1, lt, 'handR'), [0, .2, .2]), lt, { r: 2, col: '#e0d8ff' }), { layer: 'glow' });
  f.impact([{ s: 'chroma', n: 2 }, { s: 'flash', n: 1 }, { s: 'ink', n: 2 }, { s: 'whiteout', n: 1 }, { s: 'ink', n: 1 }], { t0: 1.1 });   // CHROMA_SPLIT -> VOID_LINEART
});
// ------------------------------------------------------------------------------------------------ Mayuri
const M1 = fig('mayuri', 'shikai', t => breathe(at([0, 0, 0], 0, P('mayuri_hunch', { face: faceAnim(expr('grin', { eye: 1.25, pupil: .4 }), t, { talk: 1.2, amp: .5, seed: 9 }) })), t), { timing: 2 });
shot('N10_mayuri', 17.4, 18.6, (f, lt) => {
  std(f, { pal: 'gloom', post: 'dark' }); f.style('hand2d');
  f.cam(camHandheld(closeCam(M1, lt, { part: 'face', az: -.25, el: -.12, dist: .95, roll: .18 }), lt, .008, 11));
  f.bg({ set: 'seireitei', pal: 'gloom', seed: 3 }); f.fig(M1);
});
shot('N11_konjiki', 18.6, 20.4, (f, lt) => {
  std(f, { pal: 'gloom', post: 'hot', grade: { tint: ['#ffd890', .2] } }); f.trans({ type: 'whiteFlash', dur: .1 });
  f.cam(camPath([{ t: 0, pos: [3, .5, 9], target: [0, 4, -6], fov: 48, roll: .08 }, { t: 1.8, pos: [5, .4, 11], target: [0, 6.2, -6], fov: 52, roll: .12, ease: 'out' }])(lt));
  f.shake([[0, 7, 1.8, 14]]);
  f.bg({ set: 'seireitei', pal: 'gloom', seed: 3, dmg: 2 });
  f.fx(g => { fxKonjiki(g, lt, { c: [0, 0, -6], rise: easeOut(clamp(lt / 1.0, 0, 1)), gas: lt > 1.0 ? lt - 1.0 : 0, t: lt }); fxDebris(g, [0, 0, -3], lt, { n: 24, speed: 7, size: .3, seed: 9 }); }, { layer: 'over' });
  f.impact('TOXIC', { t0: 1.05 });
  f.text(g => attackTitle(g, lt, { t0: 1.2, dur: .6, text: 'Konjiki Ashisogi Jizo', sub: '金色疋殺地蔵', col2: '#ffd84a', size: 76 }));
});
// ------------------------------------------------------------------------------------------------ Byakuya bankai (hybrid cuts)
const B2 = fig('byakuya', 'bankai', K([[0, at([0, 0, 0], 0, P('byakuya_release', { face: expr('calm', { eye: .55 }) }))], [.5, at([0, 0, 0], 0, P('byakuya_release', { face: expr('eyesClosed') }))], [1.3, at([0, 0, 0], 0, P('byakuya_command', { face: expr('focused') })), 'out'], [3, at([0, 0, 0], 0, P('byakuya_command', { face: expr('focused') }))]]), { timing: 2, wind: t => [0, 3, -5] });
shot('N12_release_close', 20.4, 21.4, (f, lt) => {
  std(f, { pal: 'dusk', post: 'soft' }); f.style('hand2d');
  f.cam(closeCam(B2, lt, { part: 'hand', side: 'R', az: 1.2, el: .1, dist: 1.3 }));
  f.bg({ set: 'courtyard', pal: 'dusk' }); f.fig(B2);
  f.fx(g => fxShockRing(g, [0, .01, .4], lt - .6, { r: 1.6, dur: .5, w: .08 }), { layer: 'over' });
});
shot('N13_kageyoshi', 21.4, 23.4, (f, lt) => {
  std(f, { pal: 'dusk', post: 'hot', grade: { tint: ['#ffc8dc', .2] } }); f.trans({ type: 'smear', dur: .15 });
  f.cam(camPath([{ t: 0, pos: [1.5, .6, 4], target: [0, 1.4, 0], fov: 36 }, { t: 2, pos: [8, 6, 10], target: [0, 2.5, -1], fov: 46, ease: 'inOut' }])(lt));
  f.bg({ set: 'courtyard', pal: 'dusk' }); f.fig(B2, { t: 1 + lt });
  f.fx(g => fxKageyoshi(g, lt, { c: [0, 0, 0], r: 5.5, rows: 2, per: 18, h: 6.5 }), { layer: 'under' });
  f.fx(g => { const dsp = clamp((lt - .9) / 1.0, 0, 1); fxPetals(g, lt, { n: 2200, size: .06, flow: (i, u, t) => { const a = u * TAU * 3 + t * .9, r = 5.5 + 1.2 * hash(i * 3) + dsp * 4 * hash(i * 9); return [Math.cos(a) * r, 6.5 * hash(i * 5) * (1 - dsp * .4) + dsp * hash(i * 11) * 6, Math.sin(a) * r]; } }); }, { layer: 'over' });
  f.impact('SENKEI_LIGHTS', { t0: .9 });
});
// ------------------------------------------------------------------------------------------------ standoff (no outcome)
{
  const names = ['kyoraku', 'tosen', 'byakuya', 'mayuri', 'hitsugaya', 'kenpachi'];
  const sig = { kyoraku: 'kyoraku_lean', tosen: 'tosen_justice', byakuya: 'byakuya_point', mayuri: 'mayuri_hunch', hitsugaya: 'guard', kenpachi: 'kenpachi_shoulder' };
  const ring = names.map((n, i) => { const a = i / 6 * TAU, pos = [Math.sin(a) * 4.2, 0, Math.cos(a) * 4.2]; return fig(n, 'base', t => breathe(at(pos, a + Math.PI, P(sig[n])), t, 1, i), { timing: 2, wind: t => [6, 0, 2] }); });
  shot('N14_standoff', 23.4, 26.0, (f, lt) => {
    std(f, { pal: 'dusk' }); f.trans({ type: 'inkWipe', dur: .3, dir: -1 });
    f.cam(camPath([{ t: 0, orbit: { c: [0, 1.1, 0], r: 10.5, az: .2, el: .2 }, fov: 40 }, { t: 2.6, orbit: { c: [0, 1.1, 0], r: 9, az: 1.3, el: .07 }, fov: 40, ease: 'inOut' }])(lt));
    f.bg({ set: 'wasteland', pal: 'dusk', dmg: 1 }); ring.forEach(F => f.fig(F));
    f.fg(g => drawForegroundBranch(g, PALETTES.dusk, 'bl', lt, '#e89ab8', 8));
    f.fx(g => fxSmoke(g, [0, 0, 0], lt % 2, { n: 6, size: 2.5, col: '#e8d0b0', rise: .1, spread: 4, alpha: .45 }), { layer: 'over' });
    f.impact([{ s: 'tear', n: 2 }, { s: 'flash', n: 1 }, { s: 'kabuki', n: 2 }, { s: 'crimsonline', n: 2 }], { t0: 1.4 });   // PAPER_TEAR -> KABUKI -> CRIMSON
  });
}
