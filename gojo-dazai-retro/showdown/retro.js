/* showdown/retro.js - SATORU GOJO vs OSAMU DAZAI, 10 s, "RETRO 90s CEL ANIME".  index.html?prog=../showdown/retro
   Engine modules (chars_hvg = gojo, chars_sad = dazai, fx_hvg, fx_sad, sets_sad, impact_*) load automatically; fx_zz_retro.js = film pass.
   Style rules here: figures on twos / threes (limited animation), long holds, camera pans over the painted dusk harbour,
   thick ink (lineK), 2-tone cel shading (hard shadeK), faded film stock + grain + wide vignette + gate weave (RETRO).
   Gojo = east (x > 0, faces -x), Dazai = west (x < 0, faces +x).                                                               */
'use strict';
PROGRAM.reset(10.0, 'gojo_dazai_retro');
RETRO = { k: 1, weave: 1.6, grain: .2, dust: 1, vignette: .62, fade: 1, warm: 1, soft: .3 };
// ------------------------------------------------------------------------------------------------ palette: 90s dusk harbour (painted magenta/amber sky)
PALETTES.retro_dusk = Object.assign({}, PALETTES.harbor, { skyTop: '#2a1e4a', skyMid: '#a8466a', skyLow: '#ffb070', fog: '#d88a78', sun: [-.45, .35, -.55], ground: '#5a4a5a', ground2: '#2e2434',
  wall: '#b0583e', wallShade: '#4a2230', roof: '#3a2a3a', roofShade: '#1e1420', cloud: '#e88a7a', cloudShade: '#6a3a5a', haze: .5, line: '#120810', amb: '#ffb890', stars: false });
GRADES.retro_dusk = { sat: 1.02, contrast: 1.06, tint: ['#ffd0b0', .12], lift: ['#2a1028', .05] };
const DX = -2.4, GX = 2.4;
const atD = (p, o = {}, x = DX, z = 0) => at([x, 0, z], HP, P(p, o)), atG = (p, o = {}, x = GX, z = 0) => at([x, 0, z], -HP, P(p, o));
const FA = (e, t, o = {}) => faceAnim(typeof e === 'string' ? expr(e) : e, t, Object.assign({ seed: 3 }, o));
const WIND = t => [-.7, .1, .25];
// look of every shot: thick ink, hard 2-tone cel, warm key from the low sun, magenta rim
function LOOK(f, o = {}) {
  std(f, { pal: 'retro_dusk', postOver: Object.assign({ bloom: .35, halation: .3, ca: .6, vignette: 0, grain: 0 }, o.post || {}) });
  f.light(Object.assign({ ambientK: .2, shadeK: .62, rimAmt: .85, rimCol: '#ffc890', lineK: 1.45, shadeTint: '#5a2a5a' }, o.light || {}));
  f.paintBG({ soft: .3, alpha: .2, dab: 11, paper: .45 });
}
function BGR(f, o = {}) { f.bg(Object.assign({ set: 'yokohama', pal: 'retro_dusk' }, o)); }
// 90s subtitle (yellow, thick black edge, lower third) - drawn as overlay; film pass runs after it
const SUBS90 = [{ t0: 1.9, t1: 3.0, who: 'GOJO', col: '#9fdcff', line: "Don't blink." }, { t0: 7.6, t1: 9.95, who: 'DAZAI', col: '#e8c890', line: 'Your infinity ends at my fingertips.' }];
PROGRAM.overlays = PROGRAM.overlays || [];
PROGRAM.overlays.push((g, t) => { for (const s of SUBS90) if (t >= s.t0 && t < s.t1) { const a = Math.min(1, (t - s.t0) / .1, (s.t1 - t) / .1);
  subtitle(g, s.line, { who: s.who, whoCol: s.col, a, size: 54, y: 975 }); } });
// big lettering helper (title card style; engine attackTitle shonen)
const TITLE = (f, lt, o) => f.text(g => attackTitle(g, lt, Object.assign({ style: 'shonen', size: 170 }, o)));
// ================================================================================================ S1 0-1.7  establishing pan over the dusk harbour
const S1D = CH0('dazai', 'base', t => breathe(atD('dazai_pockets', { face: FA(expr('smile', { eye: .55 }), t, { seed: 2 }) }), t), { timing: 3, wind: WIND });
const S1G = CH0('gojo', 'base', t => breathe(atG('goj_pockets', { face: FA('smug', t, { seed: 5 }) }), t), { timing: 3, wind: WIND });
function CH0(name, form, keys, o) { return fig(name, form, keys, Object.assign({ timing: 2, springWin: .6 }, o)); }
shot('S1_pan', 0, 1.7, (f, lt) => {
  LOOK(f); BGR(f);
  const u = easeInOut(clamp(lt / 1.7, 0, 1));
  f.cam(camPath([{ t: 0, pos: [-9, 3.2, 13], target: [-4, 3.4, -8], fov: 42 }, { t: 1.7, pos: [2.2, 1.5, 7.2], target: [0, 1.45, 0], fov: 34, ease: 'inOut' }])(lt));
  f.fig(S1D); f.fig(S1G); void u;
});
// ================================================================================================ S2 1.7-3.0  Gojo pulls the blindfold down (hand2d close-up, long hold)
const S2G = CH0('gojo', 'base', K([[0, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') })], [.3, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') }), 'hold'],
  [.62, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) }), 'snap'], [1.3, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) })]]), { timing: 2, wind: WIND });
shot('S2_eyes', 1.7, 3.0, (f, lt) => {
  LOOK(f, { light: { ambient: '#c8d4ff', ambientK: .28, rimCol: '#8fd8ff', rimAmt: 1 } }); f.style('hand2d');
  f.cam(camSlowPush(S2G, lt, 0, 1.3, { part: 'face', az: -.3, el: .02, from: 1.05, to: .86 })); BGR(f); f.fig(S2G);
  f.fx(g => fxSixEyes(g, S2G, lt, { k: clamp((lt - .62) / .2, 0, 1), streak: .9 }), { layer: 'glow' });
  f.impact([{ s: 'flash', n: 1, p: { col: '#dff4ff' } }, { s: 'blackaccent', n: 2, p: { accent: '#5fd3ff' } }], { t0: .62 });
  sfx(1.7 + .3, 'cloth_pull'); sfx(1.7 + .62, 'six_eyes');
});
// ================================================================================================ S3 3.0-4.9  HOLLOW PURPLE (dramatic hold on threes, then the snap)
const S3G = CH0('gojo', 'serious', K([[0, atG('goj_purpleWind', { orbL: 1, orbR: 1, eyeGlow: 1, face: expr('serious') })], [.95, atG('goj_purpleWind', { orbL: 1, orbR: 1, eyeGlow: 1, face: expr('serious') }), 'hold'],
  [1.05, atG('goj_purpleFire', { orbL: 0, orbR: 0, eyeGlow: 1, face: expr('serious') }), 'snap'], [1.9, atG('goj_purpleFire', { eyeGlow: 1, face: expr('serious') })]]), { timing: 3, wind: t => [-1.2, .2, 0] });
const PURPLE_A = () => vAdd(figPos(S3G, .2, 'abd'), [-.9, .3, 0]);
shot('S3_purple', 3.0, 4.9, (f, lt) => {
  LOOK(f, { post: { bloom: .55 }, light: { rimCol: '#c08aff', rimAmt: 1, fx: [{ p: vAdd(figPos(S3G, lt, 'abd'), [-1, .3, 0]), col: '#9b4dff', r: 2.2, a: .35 }] } });
  const cam = camPath([{ t: 0, pos: [GX + 3.0, 1.2, 3.3], target: [GX - .4, 1.55, 0], fov: 36 }, { t: 1.0, pos: [GX + 2.5, 1.05, 2.7], target: [GX - .6, 1.55, 0], fov: 32, ease: 'inOut' },
    { t: 1.06, pos: [GX + 5.5, 2.4, 6.5], target: [DX, 1.3, 0], fov: 44, ease: 'snap' }, { t: 1.9, pos: [GX + 5.0, 2.1, 6.0], target: [DX - 1, 1.3, 0], fov: 42 }])(lt);
  f.cam(camImpactKick(cam, lt, 1.06, { fov: -6 })); BGR(f); f.fig(S3G); if (lt > 1.06) f.fig(S1D, { t: 1 });
  f.fx(g => fxHollowPurple(g, PURPLE_A(), [-1, -.02, 0], lt, { charge: 1.05, len: 4.0, speed: 9, r: 1.2 }), { layer: 'over' });
  f.impact([{ s: 'flash', n: 1, p: { col: '#f0e0ff' } }, { s: 'blackaccent', n: 2, p: { accent: '#b06aff' } }, { s: 'purplevoid', n: 2 }], { t0: 1.06 });
  f.shake([[1.08, 22, .5, 18]]);
  TITLE(f, lt, { text: 'HOLLOW PURPLE', kind: 'purple', sub: '虚式「茈」', t0: 1.12, dur: .75, y: 300 });
  sfx(3.0, 'orbs_hum'); sfx(3.0 + 1.06, 'purple_fire');
});
// ================================================================================================ S4 4.9-6.3  the sphere reaches Dazai: one bare hand
const S4D = CH0('dazai', 'base', K([[0, atD('dazai_pockets', { face: expr('smile', { eye: .55 }) })], [.32, atD('dazai_pockets', { face: expr('smile', { eye: .55 }) }), 'hold'],
  [.42, atD('dazai_touch', { face: expr('smile', { eye: .5 }) }), 'snap'], [1.4, atD('dazai_touch', { face: expr('smile', { eye: .5 }) })]]), { timing: 2, wind: t => [-1.4, .1, .2] });
const HIT = .5;   // contact time (local)
shot('S4_nullify', 4.9, 6.3, (f, lt) => {
  LOOK(f, { light: { rimCol: '#d8a0ff', rimAmt: 1.1, fx: lt < HIT + .05 ? [{ p: vAdd(figPos(S4D, lt, 'abd'), [1.2, .3, 0]), col: '#9b4dff', r: 2.5, a: .55 * clamp(lt / HIT, 0, 1) }] : [] } });
  const cam = camPath([{ t: 0, pos: [DX + 3.6, 1.3, 3.6], target: [DX + .2, 1.45, 0], fov: 36 }, { t: 1.4, pos: [DX + 2.9, 1.15, 2.6], target: [DX + .2, 1.5, 0], fov: 33, ease: 'out' }])(lt);
  f.cam(camImpactKick(cam, lt, HIT, { fov: -8, roll: .06 })); BGR(f); f.fig(S4D);
  const hand = figPos(S4D, Math.max(lt, .42), 'handR');
  // the purple sphere: approaches from the right along the erased path, stops dead at the palm, then goes out like a candle
  f.fx(g => { const u = clamp(lt / HIT, 0, 1), head = vAdd(hand, [lerp(2.2, .18, easeIn(u)), lerp(.1, 0, u), 0]), q = project(head), qe = project(vAdd(hand, [6, .1, 0])); if (!q) return;
    const die = clamp((lt - HIT) / .35, 0, 1), R = .42 * q.s * (1 - easeIn(die)) * (1 + .05 * Math.sin(lt * 50));
    if (R < 1) return; g.save();
    if (qe) { g.globalAlpha = .85 * (1 - die); const ang = Math.atan2(q.y - qe.y, q.x - qe.x), nx = -Math.sin(ang), ny = Math.cos(ang); g.fillStyle = '#1a0a2a'; g.beginPath(); g.moveTo(qe.x + nx * R * .8, qe.y + ny * R * .8); g.lineTo(q.x + nx * R * .8, q.y + ny * R * .8); g.lineTo(q.x - nx * R * .8, q.y - ny * R * .8); g.lineTo(qe.x - nx * R * .8, qe.y - ny * R * .8); g.closePath(); g.fill();
      g.strokeStyle = '#d8a8ff'; g.lineWidth = 4; g.stroke(); }
    g.globalAlpha = 1; hvOrb(g, q, R, [HVFX.purple, HVFX.purple2], lt, { halo: 3, haloA: .7 * (1 - die) }); g.restore(); }, { layer: 'over' });
  f.fx(g => fxNoLongerHuman(g, hand, lt - HIT, { r: 2.2, dur: .9 }), { layer: 'glow' });
  f.fx(g => fxSnuff(g, vAdd(hand, [.15, .05, 0]), lt - HIT - .15, { col: '#c08aff', size: 1.1, dur: .9 }), { layer: 'over' });
  // THE impact frame: flash -> full-screen ink freeze (paper white, black lineart) -> 人間失格 kanji slam -> negative shatter
  f.impact([{ s: 'flash', n: 1, p: { col: '#ffffff' } }, { s: 'whiteout', n: 3, p: { ink: '#14080e', fxCol: '#7a4ab8', lines: true } }, { s: 'speedburst', n: 2 },
    { s: 'kanji', n: 3, p: { char: '人間失格', col: '#fff4e2', col2: '#e8d4ff', outline: '#1a0c18', size: 330, tint: '#7a4ab8' } }, { s: 'nlhShatter', n: 2 }], { t0: HIT, at: hand });
  f.shake([[HIT, 28, .45, 20]]);
  TITLE(f, lt, { text: 'NO LONGER HUMAN', kind: 'silver', sub: '人間失格', t0: HIT + .45, dur: .85, y: 300, col2: '#e8c890' });
  sfx(4.9, 'purple_rush'); sfx(4.9 + .42, 'hand_raise'); sfx(4.9 + HIT, 'nullify_hit');
});
// ================================================================================================ S5 6.3-7.5  Gojo: disbelief (long hold, hand2d, on threes)
const S5G = CH0('gojo', 'serious', t => breathe(atG('goj_stand', { eyeGlow: .8, face: FA(expr('shock', { eye: 1.15, sweat: 1 }), t, { seed: 7, blink: 0 }) }), t), { timing: 3, wind: t => [-1, .3, .2] });
shot('S5_gojo', 6.3, 7.5, (f, lt) => {
  LOOK(f, { light: { ambient: '#c8c0ff', ambientK: .26, rimCol: '#c08aff', rimAmt: 1 } }); f.style('hand2d');
  f.cam(camSlowPush(S5G, lt, 0, 1.2, { part: 'face', az: .35, el: .03, from: .95, to: .82 })); BGR(f); f.fig(S5G);
  f.fx(g => fxSpeedLines(g, lt, { n: 34, inner: 470, alpha: .35 }), { layer: 'over' });
  f.fx(g => { for (let i = 0; i < 6; i++) { const u = clamp((lt - i * .12) / 1.1, 0, 1); if (u <= 0 || u >= 1) continue; const x = 560 + hash(i * 3) * 800, y = 900 - u * 520; g.globalAlpha = .4 * (1 - u); inkPts(g, [[x, y], [x + Math.sin(u * 6 + i) * 30, y - 60], [x + 10, y - 120]], 6, '#c8b0e8', [.2, .9]); } g.globalAlpha = 1; }, { layer: 'over' });
});
// ================================================================================================ S6 7.5-8.9  Dazai is suddenly there: grabs the wrist, Infinity breaks
const S6G = CH0('gojo', 'serious', t => atG('goj_stand', { infinity: .9 * (1 - clamp((t - .3) / .25, 0, 1)), eyeGlow: .8, aL: [.55, .2, .2], eL: .3, hL: 'open', face: expr('shock', { eye: 1.1, sweat: 1 }) }, 1.1), { timing: 2 });
const S6D = CH0('dazai', 'base', K([[0, atD('dazai_dodge', {}, -.6, .4)], [.22, atD('dazai_grabWrist', { face: expr('smile', { eye: .5 }) }, .3, .45), 'snap'], [1.4, atD('dazai_grabWrist', { face: expr('smirk', { eye: .5, lid: .3 }) }, .3, .45)]]), { timing: 2, wind: t => [1.6, 0, .3] });
shot('S6_grab', 7.5, 8.9, (f, lt) => {
  LOOK(f, { light: { rimCol: '#9fdcff', rimAmt: 1 } });
  const c0 = camGroup([S6D, S6G], lt, { az: .55 + lt * .1, el: .06, fill: .86, fov: 32 }); f.cam(camHandheld(camImpactKick(c0, lt, .3, { fov: -5 }), lt, .004, 6)); BGR(f);
  f.fig(S6G); f.fig(S6D, { afterimages: lt < .3 ? [.04, .08, .12] : [], afterCol: '#e8c890', afterA: .4 });
  const shellC = vAdd(figPos(S6G, lt, 'abd'), [0, .25, 0]);
  f.fx(g => fxInfinity(g, shellC, lt, { r: 1.35, alpha: 1 - clamp((lt - .3) / .25, 0, 1), ripples: [{ t0: .25, p: vAdd(shellC, [-1.2, .2, 0]) }] }), { layer: 'glow' });
  f.fx(g => fxNoLongerHuman(g, figPos(S6D, Math.max(lt, .22), 'handR'), lt - .3, { r: 2.6, dur: 1.0 }), { layer: 'glow' });
  f.impact([{ s: 'flash', n: 1, p: { col: '#eef6ff' } }, { s: 'nlhRing', n: 2 }, { s: 'hatch', n: 2, p: { paper: '#f2e6d4', ink: '#1a0e14', accent: '#7fd8ff' } }], { t0: .3, at: figPos(S6D, .3, 'handR') });
  f.shake([[.3, 16, .35]]);
  sfx(7.5, 'flash_step'); sfx(7.5 + .3, 'infinity_break');
});
// ================================================================================================ S7 8.9-10.0 final hold: slow pan off the two of them into the sunset
const S7D = CH0('dazai', 'base', t => atD('dazai_grabWrist', { face: FA(expr('smirk', { eye: .5, lid: .3 }), t, { seed: 9 }) }, .3, .45), { timing: 3, wind: t => [1.2, 0, .3] });
shot('S7_end', 8.9, 10.0, (f, lt) => {
  LOOK(f, { light: { rimCol: '#ffb070', rimAmt: 1 } });
  f.style('hand2d'); f.cam(camHandheld(camSlowPush(S7D, lt, 0, 1.1, { part: 'bust', az: -.6, el: .03, from: 1.45, to: 1.2 }), lt, .003, 8)); BGR(f);
  f.fig(S6G, { t: 1.4 }); f.fig(S7D);
  const k = clamp((lt - .75) / .35, 0, 1); if (k > 0) f.flash('#0a0408', k * .9);
});
