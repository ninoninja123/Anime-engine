/* GOJO SATORU vs OSAMU DAZAI - "MANGA INK" (10 s).  engine: ../showdown/gdm   (style pass + lettering: engine/fx_gdm.js)
   Every shot: gdmManga(f) (black/white manga + one blue accent + thick ink lineart), page border overlay, camera always moving. */
PROGRAM.reset(10, 'gdm');
const GP = [2.2, 0, 0], DP = [-2.2, 0, 0], YG = -HP, YD = HP;
const atG = (p, o, pos) => at(pos || GP, YG, P(p, o)), atD = (p, o, pos) => at(pos || DP, YD, P(p, o));
const CITY = (f, o = {}) => f.bg((g, T, ff) => gdmBG(g, T, ff, Object.assign({ kind: 'tone', top: '#262626', low: '#d0d0d0', floor: '#8a8a8a' }, o)));
const BASE = (f, o = {}) => { std(f, { pal: 'night', postOver: { grain: 0, vignette: 0, bloom: .2 } }); f.light({ ambientK: .22, shadeK: .45, rimAmt: .9, rimCol: '#ffffff' }); gdmManga(f, o); };
const PAGE = (f, o = {}) => f.text(g => gdmPage(g, f.lt, o));
const SUB = (f, t0, t1, who, text) => f.text(g => gdmSub(g, f.lt, { t0, t1, who, text }));
const sfxAt = (T, name) => sfx(T, name);

// ---------------------------------------------------------------------------------------------- S01 0.0-1.5  split VS panels: two faces
const S1G = fig('gojo', 'base', t => breathe(atG('goj_pockets', { face: faceAnim(expr('smug'), t, { seed: 3 }) }), t), { timing: 2, wind: t => [-.5, .2, .2] });
const S1D = fig('dazai', 'base', t => breathe(atD('dazai_pockets', { face: faceAnim(expr('smile', { eye: .55 }), t, { seed: 5 }) }), t), { timing: 2, wind: t => [.6, .1, .2] });
shot('S01', 0, 1.5, (f, lt) => {
  BASE(f); f.style('hand2d'); f.split({ ang: .16, x: .5, gap: 22, col: '#000000' });
  if (f.panel === 0) { f.cam(camHandheld(camSlowPush(S1D, lt, 0, 1.5, { part: 'face', az: .5, el: .03, from: 1.9, to: 1.55 }), lt, .004, 2)); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: 'speed', ang: .1, seed: 2 })); f.fig(S1D); }
  else { f.cam(camHandheld(camSlowPush(S1G, lt, 0, 1.5, { part: 'face', az: -.5, el: .03, from: 1.9, to: 1.55 }), lt, .004, 4)); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: 'focus', seed: 4 })); f.fig(S1G); }
  f.trans({ type: 'inkWipe', dur: .25 });
  f.text(g => { gdmTitle(g, lt, { t0: .2, dur: 1.05, text: 'Dazai Osamu', sub: '太宰治', size: 70, x: 420, y: 980, rot: -.03, acc: '#000' });
    gdmTitle(g, lt, { t0: .35, dur: .95, text: 'Gojo Satoru', sub: '五条悟', size: 70, x: 1500, y: 180, rot: -.03 });
    gdmOno(g, lt, { text: 'ゴゴゴ', x: 1180, y: 960, size: 110, rot: .1, t0: .5, dur: .9 }); });
  PAGE(f, { num: '1' });
  if (lt < .02) sfxAt(0, 'ink_wipe');
});
// ---------------------------------------------------------------------------------------------- S02 1.5-3.0  Dazai shoots, bullets stop in Infinity
const S2D = fig('dazai', 'gun', K([[0, atD('dazai_pockets')], [.22, atD('dazai_aim'), 'snap'], [.4, atD('dazai_aim', { aR: [1.75, .15, 0], eR: .1 }), 'snap'], [.5, atD('dazai_aim'), 'out'], [.6, atD('dazai_aim', { aR: [1.75, .15, 0], eR: .1 }), 'snap'], [.7, atD('dazai_aim'), 'out'], [1.5, atD('dazai_aim')]]), { timing: 1, wind: t => [.6, 0, .2] });
const S2G = fig('gojo', 'base', t => breathe(atG('goj_pockets', { infinity: .6, face: expr('smug') }), t), { timing: 2 });
const SHOTS2 = [.4, .6, .78];
shot('S02', 1.5, 3.0, (f, lt) => {
  BASE(f); CITY(f, { seed: 3 });
  const c = camImpactKick(camLowTwo([S2D, S2G], lt, { az: .45 - lt * .25, fill: .86, fov: 34 }), lt, .4, { fov: -5 }); f.cam(camHandheld(c, lt, .006, 5));
  f.fig(S2D); f.fig(S2G);
  const ctr = vAdd(GP, [0, 1.3, 0]);
  for (const s of SHOTS2) f.fx(g => fxDazaiGun(g, S2D, lt - s, { ft: lt, to: vAdd(ctr, [-1.2, 0, 0]) }), { layer: 'glow' });
  f.fx(g => fxInfinityStop(g, ctr, SHOTS2.map((s, i) => ({ from: vAdd(DP, [1, 1.45 + i * .04, .05 * i]), kind: 'shard', col: '#ffffff', t0: s, size: .06 })), lt, { r: 1.2, k: 7 }), { layer: 'over' });
  f.fx(g => fxInfinity(g, ctr, lt, { r: 1.2, ripples: SHOTS2.map(s => ({ t0: s + .06, p: vAdd(ctr, [-1.2, .1, 0]) })) }), { layer: 'glow' });
  f.shake([[.4, 8, .15], [.6, 8, .15], [.78, 8, .15]]);
  f.text(g => { gdmTitle(g, lt, { t0: .85, dur: .6, text: 'Infinity', sub: '無下限', size: 150, x: 1180, y: 900 }); gdmOno(g, lt, { text: 'パン', x: 420, y: 330, size: 110, t0: .4, dur: .5, rot: -.15 }); });
  PAGE(f, { num: '2', tilt: 8 });
  SHOTS2.forEach(s => sfxAt(1.5 + s, 'gunshot')); sfxAt(1.5 + .9, 'infinity_freeze');
});
// ---------------------------------------------------------------------------------------------- S03 3.0-3.8  blindfold down: Six Eyes (ECU)
const S3G = fig('gojo', 'base', K([[0, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') })], [.15, atG('goj_blindfoldDown', { blindfold: 1, face: expr('smug') })], [.42, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('eyes', { eye: 1.1 }) }), 'inOut'], [.8, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('eyes', { eye: 1.1 }) })]]), { timing: 2, wind: t => [-.5, .3, .2] });
shot('S03', 3.0, 3.8, (f, lt) => {
  BASE(f); f.style('hand2d'); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: 'focus', seed: 9, n: 170 }));
  f.cam(camHandheld(camSlowPush(S3G, lt, 0, .8, { part: 'eyes', az: -.12, el: .02, from: 1.5, to: 1.05 }), lt, .003, 7)); f.fig(S3G);
  if (lt > .42) f.fx(g => fxSixEyes(g, S3G, lt - .42, { k: 1 }), { layer: 'glow' });
  f.impact([{ s: 'blackaccent', n: 2, p: { accent: GDM.acc, lines: 90 } }], { t0: .42 });
  f.text(g => gdmOno(g, lt, { text: 'カッ', x: 1600, y: 300, size: 150, t0: .45, dur: .35, rot: .2, col: GDM.acc }));
  PAGE(f, { num: '3' }); sfxAt(3.0 + .1, 'cloth'); sfxAt(3.0 + .42, 'eye_flash');
});
// ---------------------------------------------------------------------------------------------- S04 3.8-5.0  Hollow Purple: charge + fire (impact #1)
const S4G = fig('gojo', 'base', K([[0, atG('goj_purpleWind', { orbL: 1, orbR: 1, blindfold: 0, eyeGlow: 1 })], [.62, atG('goj_purpleWind', { orbL: 1, orbR: 1, blindfold: 0, eyeGlow: 1, face: expr('eyes') }), 'hold'], [.72, atG('goj_purpleFire', { orbL: 0, orbR: 0, blindfold: 0, eyeGlow: 1, face: expr('shout') }), 'snap'], [1.2, atG('goj_purpleFire', { blindfold: 0, eyeGlow: 1, face: expr('eyes') })]]), { timing: 1, wind: t => [.8, .2, 0] });
const S4D = fig('dazai', 'base', t => atD('dazai_pockets', { face: expr('smile', { eye: .55 }) }), { timing: 2 });
shot('S04', 3.8, 5.0, (f, lt) => {
  BASE(f); CITY(f, { seed: 5, city: 220 });
  const base = camLowTwo([S4G], lt, { az: -.55 + lt * .25, fill: .78, fov: 40 }); const c = camImpactKick(base, lt, .72, { fov: -8 });
  f.cam(camHandheld(c, lt, lt > .72 ? .02 : .005, 8)); f.fig(S4G); f.fig(S4D);
  f.fx(g => fxHollowPurple(g, vAdd(GP, [-.9, 1.35, 0]), [-1, -.02, 0], lt, { charge: .72, len: 18, speed: 26, r: 1.1 }), { layer: 'over' });
  f.impact([{ s: 'flash', n: 1 }, { s: 'gdmblue', n: 2 }, { s: 'invert', n: 1 }, { s: 'gdmblack', n: 2 }], { t0: .72 });
  f.shake([[.72, 30, .4]]);
  f.text(g => { gdmTitle(g, lt, { t0: .05, dur: .62, text: 'Hollow', sub: '虚式', size: 140, x: 700, y: 260, rot: -.06 }); gdmTitle(g, lt, { t0: .78, dur: .4, text: 'Purple', sub: '茈', size: 210, x: 960, y: 900, rot: -.04 }); });
  PAGE(f, { num: '4', tilt: -10 }); sfxAt(3.8, 'charge'); sfxAt(3.8 + .72, 'purple_fire');
});
// ---------------------------------------------------------------------------------------------- S05 5.0-6.5  the purple reaches Dazai: No Longer Human
const S5D = fig('dazai', 'base', K([[0, atD('dazai_pockets', { face: expr('smile', { eye: .55 }) })], [.18, atD('dazai_reach', { face: expr('calm', { eye: .6 }) }), 'snap'], [1.5, atD('dazai_reach', { face: faceAnim(expr('smile', { eye: .5 }), 1, { talk: 1 }) })]]), { timing: 2, wind: t => [1.4, .1, .2] });
const S5Dt = fig('dazai', 'base', t => atD('dazai_reach', { face: faceAnim(expr('smile', { eye: .5 }), t, { talk: t > .5 && t < 1.4 ? 1 : 0, seed: 7 }) }), { timing: 2, wind: t => [1.4, .1, .2] });
shot('S05', 5.0, 6.5, (f, lt) => {
  BASE(f); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: lt < .5 ? 'speed' : 'tone', ang: 0, top: '#262626', low: '#d0d0d0', seed: 6 }));
  const palm = vAdd(figPos(S5D, Math.min(lt, .3), 'handR'), [.35, 0, 0]);
  const c = camOrbitShot(vAdd(DP, [.4, 1.3, 0]), lt, { r: 2.9, r1: 2.4, az0: 1.0, az1: .65, el0: .02, el1: .05, dur: 1.5, fov: 40 });
  f.cam(camHandheld(c, lt, .006, 9)); f.fig(lt < .3 ? S5D : S5Dt, lt < .3 ? {} : { t: lt });
  // purple wave arrives (from +x) and is erased at the palm
  f.fx(g => { const u = clamp(lt / .35, 0, 1), k = 1 - clamp((lt - .35) / .5, 0, 1); if (k <= 0) return; const q = project(palm); if (!q) return; const s = q.s || 100;
    g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#6a4aff'; g.globalAlpha = k; const R = .55 * s * k, x0 = lerp(W + 200, q.x + R * .3, easeOut(u));
    g.fillRect(x0, q.y - R, W - x0 + 50, R * 2); g.beginPath(); g.arc(x0, q.y, R, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x0, q.y - R * .4, W - x0 + 50, R * .8); g.beginPath(); g.arc(x0, q.y, R * .4, 0, TAU); g.fill(); g.restore(); }, { layer: 'over' });
  f.fx(g => fxNoLongerHuman(g, palm, lt - .35, { r: 3, dur: 1.1 }), { layer: 'glow' });
  f.fx(g => fxSnuff(g, palm, lt - .7), { layer: 'over' });
  f.impact([{ s: 'whiteout', n: 2, p: { lines: 80 } }, { s: 'invert', n: 1 }], { t0: .35 });
  f.shake([[.35, 14, .25]]);
  f.text(g => { gdmTitle(g, lt, { t0: .4, dur: .55, text: 'No Longer Human', sub: '人間失格', size: 120, x: 960, y: 250, rot: -.03, acc: '#000' }); });
  SUB(f, .55, 1.48, 'DAZAI', "Sorry. Abilities don't work on me.");
  PAGE(f, { num: '5' }); sfxAt(5.0 + .3, 'purple_hit'); sfxAt(5.0 + .35, 'nullify');
});
// ---------------------------------------------------------------------------------------------- S06 6.5-7.4  Dazai's hand on Gojo's chest: Infinity tears (screen rip)
const NEAR = [1.35, 0, 0];
const S6G = fig('gojo', 'base', K([[0, atG('goj_stand', { blindfold: 0, eyeGlow: 1, infinity: .8, face: expr('eyes') })], [.3, atG('goj_stand', { blindfold: 0, eyeGlow: 1, infinity: 0, face: expr('shock', { eye: 1.2 }) }), 'snap'], [.9, atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: expr('shock', { eye: 1.2 }) })]]), { timing: 1 });
const S6D = fig('dazai', 'base', K([[0, atD('dazai_pockets', {}, NEAR)], [.22, atD('dazai_touch', { face: expr('smile', { eye: .5 }) }, NEAR), 'snap'], [.9, atD('dazai_touch', { face: expr('smile', { eye: .5 }) }, NEAR)]]), { timing: 1 });
shot('S06', 6.5, 7.4, (f, lt) => {
  BASE(f); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: 'focus', seed: 12, n: 120 }));
  const c = camGroup([S6G, S6D], lt, { az: -.35 - lt * .3, el: .06, fill: .9, fov: 32, joints: ['head', 'chest', 'handR'] }); f.cam(camHandheld(camImpactKick(c, lt, .25, { fov: -6 }), lt, .006, 11));
  f.fig(S6G); f.fig(S6D);
  const touch = vAdd(GP, [-.25, 1.35, 0]);
  f.fx(g => fxInfinity(g, vAdd(GP, [0, 1.3, 0]), lt, { r: 1.1, alpha: 1 - clamp((lt - .22) / .1, 0, 1) }), { layer: 'glow' });
  f.fx(g => fxNoLongerHuman(g, touch, lt - .22, { r: 2.2, dur: .7 }), { layer: 'glow' });
  f.impact([{ s: 'tear', n: 3, p: { strips: 9 } }, { s: 'shatter', n: 3 }], { t0: .24, at: touch });
  f.shake([[.24, 18, .3]]);
  f.text(g => gdmOno(g, lt, { text: 'パキィン', x: 1350, y: 250, size: 120, t0: .3, dur: .55, rot: .12 }));
  PAGE(f, { num: '6', tilt: 6 }); sfxAt(6.5 + .22, 'touch'); sfxAt(6.5 + .24, 'glass_break');
});
// ---------------------------------------------------------------------------------------------- S07 7.4-8.4  Gojo: shock -> grin (line)
const S7G = fig('gojo', 'base', t => breathe(atG('goj_stand', { blindfold: 0, eyeGlow: 1, face: faceAnim(t < .3 ? expr('shock', { eye: 1.15 }) : expr('grin', { eye: 1.0 }), t, { talk: t > .25 && t < .95 ? 1 : 0, seed: 8 }) }), t), { timing: 2, wind: t => [-.6, .3, .2] });
shot('S07', 7.4, 8.4, (f, lt) => {
  BASE(f); f.style('hand2d'); f.bg((g, T, ff) => gdmBG(g, T, ff, { kind: 'black', seed: 3 }));
  f.cam(camHandheld(camSlowPush(S7G, lt, 0, 1, { part: 'face', az: -.35, el: -.04, from: 1.05, to: .85 }), lt, .004, 12)); f.fig(S7G);
  f.light({ rimCol: '#ffffff', rimAmt: 1.2 });
  SUB(f, .2, 1.0, 'GOJO', "Then I'll just punch you.");
  PAGE(f, { num: '7' }); sfxAt(7.4 + .05, 'heartbeat');
});
// ---------------------------------------------------------------------------------------------- S08 8.4-10.0  the punch (impact #2) -> ink freeze panel
const S8G = fig('gojo', 'base', K([[0, atG('goj_punchWind', { blindfold: 0, eyeGlow: 1, face: expr('grin') })], [.2, atG('goj_punchWind', { blindfold: 0, eyeGlow: 1, face: expr('shout') }), 'out'], [.28, atG('goj_punch', { blindfold: 0, eyeGlow: 1, face: expr('shout') }), 'snap'], [1.6, atG('goj_punch', { blindfold: 0, eyeGlow: 1, face: expr('grin') })]]), { timing: 1, wind: t => [.8, .2, 0] });
const S8D = fig('dazai', 'base', K([[0, atD('dazai_touch', { face: expr('surprised') }, NEAR)], [.28, atD('dazai_touch', { face: expr('surprised') }, NEAR), 'hold'], [.36, atD('hurt', { face: expr('pain'), ground: false }, vAdd(NEAR, [-.6, .25, 0])), 'snap'], [1.6, atD('dazai_thrown', { face: expr('pain'), ground: false }, vAdd(NEAR, [-4.2, .8, 0])), 'out']]), { timing: 1, wind: t => [1.5, .2, 0] });
shot('S08', 8.4, 10.0, (f, lt) => {
  BASE(f); f.bg((g, T, ff) => lt < .28 ? gdmBG(g, T, ff, { kind: 'speed', ang: .05, seed: 14 }) : gdmBG(g, T, ff, { kind: 'tone', top: '#262626', low: '#d0d0d0', seed: 8, city: 200 }));
  const fist = vAdd(GP, [-.75, 1.4, 0]);
  const c0 = camLowTwo([S8G, S8D], lt, { az: -.15 + lt * .12, fill: lt < .3 ? .9 : .8, fov: 36 + lt * 3 });
  f.cam(camHandheld(camImpactKick(c0, lt, .28, { fov: -10 }), lt, lt > .28 ? .015 : .006, 13));
  f.fig(S8G, { afterimages: lt < .3 ? [.03, .06] : [] }); f.fig(S8D);
  f.fx(g => fxShockRing(g, fist, lt - .28, { r: 2.2, dur: .45, col: '#ffffff' }), { layer: 'over' });
  f.fx(g => fxAirRings(g, fist, [-1, 0, 0], lt - .28, { len: 3, r: .5, n: 4 }), { layer: 'over' });
  f.impact([{ s: 'flash', n: 1 }, { s: 'gdmblack', n: 2 }, { s: 'gdmwhite', n: 2 }, { s: 'invert', n: 1 }, { s: 'gdmblue', n: 1 }, { s: 'panels', n: 3, p: { modes: ['zoom', 'neg', 'orig'] } }], { t0: .28, at: fist });
  f.shake([[.28, 40, .5]]);
  f.text(g => { gdmOno(g, lt, { text: 'ドゴォッ', x: 980, y: 520, size: 230, t0: .7, dur: .9, rot: -.1 }); gdmSplat(g, 960, 540, 600, 31, lt > .7 ? 16 : 0); });
  PAGE(f, { num: '8', tilt: -6 }); sfxAt(8.4 + .05, 'whoosh'); sfxAt(8.4 + .28, 'punch_impact');
});
