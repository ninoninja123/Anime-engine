/* engine/chars_nl2.js (agent E, naruto-vs-luffy) - pre/cast.md pass: colours, form names, pose fields and signature poses requested by P.
   FORMS  naruto: base | battle (= wounded) | sage | kurama (= kcm) | baryon | hokage (white Hokage cloak, red flame hem, 七代目火影 on the back) | memory (young Naruto, 1.5 m)
                  (+ sage_wounded kcm_wounded kurama_wounded baryon_wounded)
          luffy : base | battle (torn vest, blood at the mouth) | gear2 | haki (arms black: pose hakiArms / hakiLegs 0..1) | boundman (= gear4) | gear3 | gear5 | giant (gear5 x6)
                  (+ gear2_wounded gear4_wounded boundman_wounded gear5_wounded)
   POSE FIELDS (new, any of the two):  squash -1 (pancake) .. +1 (tall)  [whole-figure cartoon scale, body.js] ; eyePop 0..1 ; mouthW 0..2 (overrides the face) ;
          hoseArms 0..1 (rubber-hose arms: no elbows, smooth curved tubes, bigger hands) ; cloudScarf / boa 0..1 ; toonLines 0..1 (cartoon motion + emotion lines) ;
          hatOff true (no hat; draw a flying hat with NL.drawHat(g, p, {tilt, spin, size})) ; eyes:'toad' (Sage eyes on any form) ; hakiArms / hakiLegs 0..1 ;
          stretchLeg {side:'L'|'R', to:[x,y,z], k, wave, haki} (rubber leg whip: Dawn Whip) ; steam 0..1 ; bounce (use NL.bounceY / NL.bounceSq helpers)
   KURAMA fxKurama option aliases: mode 'seal' = 'real'; pose 'kur_eye' (part eye), 'kur_roar', 'kur_paw' (catch), 'kur_bomb'; expr 'snarl', 'soft', 'smirk'.             */
'use strict';
// ------------------------------------------------------------------------------------------------ cast.md colours
Object.assign(NL.col, { nSkin: '#f2c9a0', nSkinShade: '#d2966e', nHair: '#ffd23a', nHairShade: '#d99a1a', nEye: '#2f7fe0', black: '#1b1b22', orange: '#ff7a1a', pants: '#ff8a1f', plate: '#b9c3cf', band: '#1a1a1a',
  lSkin: '#e9b98f', lSkinShade: '#c48862', straw: '#e8c66a', hatBand: '#c8202a', vest: '#d4232b', shorts: '#2f5fb3', sash: '#f2c43a', g2: '#ff9fb0', g2Shade: '#d86a80', haki: '#0c0c0e', hakiGloss: '#6a6a80' });
(function () {
  const N = CAST.naruto, L = CAST.luffy, C = NL.col;
  Object.assign(N, { skin: C.nSkin, skinShade: C.nSkinShade, neckSkin: C.nSkin, kosode: C.orange, armSkin: C.orange, bandCol: C.band, plateCol: C.plate, whiskerW: 1.35 });
  N.hakama = Object.assign({}, N.hakama, { col: C.pants }); N.face.eye.irisCol = C.nEye;
  // adult hair: fewer, bolder spikes (7-9 big ones) + short fringe
  NL.narutoHair2 = (o = {}) => () => { const r = i => hash(i * 4.77 + 13), up = o.up || 0, hornK = o.horns || 0; return [
    ...lockFan(9, 1.0, 5.28, .45, (th, u, i) => ({ th, ph: .32 + .15 * r(i + 8), len: 1.05 + .3 * r(i), w: .95, rootR: .95, dir: dirOut(th + (r(i + 5) - .5) * .25, .35 + .3 * r(i + 3) + up * .5, -.05, -.25), curl: [(r(i + 4) - .5) * .4, .2 + up * .3, -.3], grav: -.1 - up * .2, tw: .42, tip: 1.9, seg: 6, back: Math.cos(th) < -.3, sway: .35, gloss: i % 3 === 0 })),
    ...lockFan(6, .7, 5.58, 1.05, (th, u, i) => ({ th, len: .9 + .25 * r(i + 20) + up * .3, w: 1.0, rootR: .97, dir: dirOut(th, 1.0 + .2 * r(i + 23) + up * .4, -.05, -.3), curl: [(r(i + 21) - .5) * .5, .2, -.45], grav: -.12, tw: .42, tip: 1.9, seg: 6, sway: .35, gloss: i % 2 === 0 })),
    ...lockFan(5, -.7, .7, .66, (th, u, i) => ({ th, len: .5 + .12 * r(i + 30), w: .62, rootR: .965, dir: [Math.sin(th) * .6, .25 + up * .6, 1], curl: [Math.sin(th) * .4, -1.1 + up * 1.2, -.3], grav: .55 - up * .6, tw: .38, tip: 1.7, seg: 6, front: true, gloss: i === 2 })),
    { th: 1.2, ph: .3, len: .8, w: .42, rootR: .97, dir: [.35, -.85, .25], curl: [-.25, .1, .1], grav: 1.0, tw: .32, tip: 1.6, seg: 6, front: true },
    { th: -1.2, ph: .3, len: .8, w: .42, rootR: .97, dir: [-.35, -.85, .25], curl: [.25, .1, .1], grav: 1.0, tw: .32, tip: 1.6, seg: 6, front: true },
    ...(hornK ? [{ th: .45, ph: .95, len: 1.5 * hornK, w: .95, rootR: .97, dir: [.3, 1, .25], curl: [.15, .3, -.2], grav: -.3, tw: .42, tip: 2.0, seg: 6, gloss: true }, { th: -.45, ph: .95, len: 1.5 * hornK, w: .95, rootR: .97, dir: [-.3, 1, .25], curl: [-.15, .3, -.2], grav: -.3, tw: .42, tip: 2.0, seg: 6, gloss: true }] : []),
  ]; };
  N.face.hair = Object.assign({}, N.face.hair, { col: C.nHair, shadeCol: C.nHairShade, locks: NL.narutoHair2() });
  for (const fm of ['sage', 'sage_wounded', 'baryon', 'baryon_wounded']) if (N.forms[fm] && N.forms[fm].face) N.forms[fm].face = Object.assign({}, N.forms[fm].face, { hair: Object.assign({}, N.forms[fm].face.hair, { locks: NL.narutoHair2({ up: fm.startsWith('baryon') ? .35 : 0 }) }) });
  for (const fm of ['kcm', 'kcm_wounded']) N.forms[fm].face = Object.assign({}, N.forms[fm].face, { hair: Object.assign({}, N.forms[fm].face.hair, { locks: NL.narutoHair2({ up: .45, horns: .85 }) }) });
  N.forms.battle = N.forms.wounded; N.forms.kurama = N.forms.kcm; N.forms.kurama_wounded = N.forms.kcm_wounded;
  N.forms.hokage = { haori: { col: '#f4f2ec', lining: '#d8d4c8', len: .92, sleeves: false, hem: 'none', kanji: '七代目火影', open: .3, flare: .5, collarLen: .4, flames: { col: '#e8301e', col2: '#ff7a1a', col3: '#a81a10', h: .26, n: 12 } } };
  N.forms.memory = { h: 1.5, body: { width: .88, limbs: .9, shoulders: .9, depth: .9, legs: .95, head: 1.15 }, kosode: C.orange, torsoTones: [{ col: '#2a3a7a', mask: (u, v) => v - .82 }], whiskerW: 1.1 };
  N.forms.memory.face = Object.assign({}, N.face, { eyeSize: .46, hair: Object.assign({}, N.face.hair, { locks: NL.narutoHair() }) });
  // Luffy colours
  Object.assign(L, { skin: C.lSkin, skinShade: C.lSkinShade, kosode: C.lSkin, armSkin: C.lSkin, handSkin: C.lSkin, neckSkin: C.lSkin, legSkin: C.lSkin });
  L.haori = Object.assign({}, L.haori, { col: C.vest }); L.obi = Object.assign({}, L.obi, { col: C.sash }); L.hakama = Object.assign({}, L.hakama, { col: C.shorts, shinCol: C.lSkin }); L.feet = Object.assign({}, L.feet, { col: C.lSkin });
  for (const fm of ['base', 'gear3']) Object.assign(L.forms[fm], {});
  L.forms.gear2 = Object.assign(L.forms.gear2, { skin: C.g2, skinShade: C.g2Shade, kosode: C.g2, armSkin: C.g2, handSkin: C.g2, neckSkin: C.g2, legSkin: C.g2, hakama: Object.assign({}, L.hakama, { shinCol: C.g2 }), feet: Object.assign({}, L.feet, { col: C.g2 }) });
  L.forms.battle = { wounds: 2, bloodMouth: true, haori: { col: C.vest, lining: '#8a0e18', len: .12, sleeves: false, hem: 'none', kanji: null, open: .95, flare: .15, collarLen: .3, torn: .9 } };
  L.forms.haki = { hakiArmsDefault: 1 };
  L.forms.boundman = L.forms.gear4; L.forms.boundman_wounded = L.forms.gear4_wounded;
  L.forms.giant = Object.assign({}, L.forms.gear5, { h: 1.74 * 6, giant: true }); L.forms.giant.face = L.forms.gear5.face;
  // Gear 5 palette (cast.md): lavender shadows, hands 1.3x
  for (const fm of ['gear5', 'gear5_wounded', 'giant']) Object.assign(L.forms[fm], { skinShade: '#c8b0e8', hoseDefault: 1 });
  L.forms.gear5._body = (function () { const D = Object.assign({}, L, L.forms.gear5); const B = makeBody(D); B.hand *= 1.3; return B; })();
  L.forms.giant._body = (function () { const D = Object.assign({}, L, L.forms.giant); const B = makeBody(D); B.hand *= 1.3; return B; })();
})();
// ------------------------------------------------------------------------------------------------ head wrapper: mouthW, eyes:'toad', blood at the mouth
for (const nm of ['naruto', 'luffy']) { const D0 = CAST[nm], h0 = D0.drawHead; D0.drawHead = function (S, D, F, t, parts, opt) { const p = S.pose;
  if (p.mouthW != null) p.face = Object.assign({}, p.face || {}, { mouthW: p.mouthW });
  if (D.bloodMouth && !(p.face && p.face.blood)) p.face = Object.assign({}, p.face || {}, { blood: 1 });
  if (p.eyes === 'toad' && !D.toadEyes) D = Object.assign({}, D, { toadEyes: true, _sageK: 1, sageK: 1 });
  return h0.call(this, S, D, F, t, parts, opt); };
  for (const fm in D0.forms) if (D0.forms[fm].drawHead) D0.forms[fm].drawHead = D0.drawHead; }
// ------------------------------------------------------------------------------------------------ Luffy dynamic design: hakiArms / hakiLegs 0..1 (quantised colour blend), hose default
CAST.luffy.dynDesign = (D, p) => { const ha = p.hakiArms != null ? p.hakiArms : (p.haki === 'both' ? 1 : (D.hakiArmsDefault || 0)), hl = p.hakiLegs != null ? p.hakiLegs : 0, side = p.haki && p.haki !== 'both' ? p.haki : null;
  if (!ha && !hl && !side) return D; const qa = Math.round(clamp(ha, 0, 1) * 6) / 6, ql = Math.round(clamp(hl, 0, 1) * 6) / 6, key = '_hk' + qa + '_' + ql + (side || ''); if (D[key]) return D[key];
  const mix = (a, k) => k >= 1 ? NL.col.haki : lerpHex(a, NL.col.haki, k), o = Object.assign({}, D);
  if (qa) Object.assign(o, { armSkin: D.hakiArms ? NL.col.haki : mix(D.armSkin || D.skin, qa), handSkin: mix(D.handSkin || D.skin, qa), hakiSide: qa >= .99 ? 'both' : null });
  if (side) Object.assign(o, { handSkin: NL.col.haki, hakiSide: side });
  if (ql) { o.legSkin = mix(D.legSkin || D.skin, ql); o.hakama = Object.assign({}, D.hakama, { shinCol: mix(D.hakama.shinCol || D.skin, ql) }); o.feet = Object.assign({}, D.feet, { col: mix(D.feet.col || D.skin, ql) }); }
  return (D[key] = o); };
// ------------------------------------------------------------------------------------------------ Luffy extras: hose arms, rubber leg, toon lines, hatOff, cloudScarf alias
(function () { const ex0 = NL.lufExtras; NL.lufExtras = (S, D, F, t, parts, opt) => { const p = S.pose;
  if (p.hatOff) p.hat = 0; if (p.cloudScarf != null && p.boa == null) p.boa = p.cloudScarf;
  ex0(S, D, F, t, parts, opt);
  const hose = p.hoseArms != null ? p.hoseArms : (D.hoseDefault || 0); if (hose > .5) for (const sd of ['L', 'R']) { if (S._armOff && S._armOff[sd]) continue; NL.hoseArm(S, D, parts, opt, sd, t); }
  if (p.stretchLeg && p.stretchLeg.side) NL.rubberLeg(S, D, F, t, parts, opt, p.stretchLeg);
  const tl = p.toonLines != null ? p.toonLines : 0; if (tl > .01 && opt.mode !== 'flat') parts.push({ z: camDepth(S.J.head) - .5, fn: c => { if (!LIGHT.override) NL.toonLines(c, S, t, tl); } }); };
  CAST.luffy.extras = (S, D, F, t, parts, opt) => NL.lufExtras(S, D, F, t, parts, opt); for (const fm in CAST.luffy.forms) if (CAST.luffy.forms[fm].extras) CAST.luffy.forms[fm].extras = CAST.luffy.extras; })();
NL.hoseArm = (S, D, parts, opt, sd, t) => {   // smooth rubber hose: quadratic curve shoulder -> (elbow pushed out) -> wrist, constant radius, no elbow joint
  (S._hose = S._hose || {})[sd] = 1; const a = S.J['sh' + sd], e = S.J['el' + sd], b = S.J['wr' + sd]; if (!a || !e || !b) return; const mid = vLerp(a, b, .5), ctrl = vAdd(e, vMul(vSub(e, mid), .6)), pts = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10, q0 = vLerp(a, ctrl, u), q1 = vLerp(ctrl, b, u); pts.push(vLerp(q0, q1, u)); }
  const r = S.B.limbR.ua * .95, col = D.armSkin || D.skin, side = vNorm(vCross(vNorm(vSub(b, a)), [0, 1, 0]));
  parts.push({ z: Math.min(camDepth(e), camDepth(a)) - .004, fn: c => { const surf = sTube(pts, v => r * (1 - .1 * v), vLen(side) > .1 ? side : [1, 0, 0], 12, 14, { round: .4 }); drawSurf(c, sampleSurf(surf), Object.assign({ col, shade: .08, borders: { v0: false, v1: false } }, opt.surf || {})); } });
};
NL.rubberLeg = (S, D, F, t, parts, opt, st) => {   // rubber leg whip (normal leg hidden): tube from the hip to 'to' with a foot on the end
  const sd = st.side, k = S.B.h / 1.8, hip = S.J['hip' + sd]; (S._legOff = S._legOff || {})[sd] = 1; const kk = clamp(st.k == null ? 1 : st.k, 0, 1.2), natural = vAdd(hip, [0, -.85 * k, 0]), end = vLerp(natural, st.to || natural, kk), dist = vDist(hip, end), ax = vNorm(vSub(end, hip));
  let side = vNorm(vCross(ax, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push(vAdd(vLerp(hip, end, u), vMul(side, Math.sin(u * Math.PI) * (st.wave || 0) * dist * .2 * Math.sin(t * 9 + u * 6)))); }
  const shorts = Math.min(3, pts.length - 1), col = st.haki ? NL.col.haki : (D.legSkin || D.skin), hk = D.hakama || {};
  parts.push({ z: camDepth(vLerp(hip, end, .3)) - .004, fn: c => { const surf = sTube(pts.slice(shorts), v => S.B.limbR.sh * 1.05 * (1 - .15 * v), side, 12, 16, { round: .3 }); drawSurf(c, sampleSurf(surf), Object.assign({ col, shade: .08, borders: { v0: false, v1: false } }, opt.surf || {}));
    const sh = sTube(pts.slice(0, shorts + 1), v => (hk.r1 || .11) * k, side, 12, 6, { round: .3 }); drawSurf(c, sampleSurf(sh), Object.assign({ col: hk.col || '#2f5fb3', shade: .08, borders: { v0: false, v1: true } }, opt.surf || {})); } });
  const foot = vMad(end, ax, .06 * k); parts.push({ z: camDepth(foot) - .01, fn: c => { const q = project(foot); if (!q) return; const r = .09 * k * q.s; c.save(); c.translate(q.x, q.y); c.fillStyle = col; c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(1.5, r * .12); c.beginPath(); c.ellipse(0, 0, r * 1.2, r * .7, Math.atan2(0, 1), 0, TAU); c.fill(); c.stroke(); if (!st.haki) { c.fillStyle = '#a07a46'; c.beginPath(); c.ellipse(0, r * .55, r * 1.1, r * .2, 0, 0, TAU); c.fill(); } c.restore(); } });
};
NL.toonLines = (c, S, t, k) => {   // cartoon emotion / motion lines: three curved strokes by the head + little sweat drops
  const q = project(S.J.head); if (!q) return; const r = .2 * q.s * S.B.h / 1.8; c.save(); c.globalAlpha *= clamp(k, 0, 1); c.strokeStyle = '#2a1a4a'; c.lineCap = 'round'; c.lineWidth = Math.max(2.5, r * .06);
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + sg * (.7 + i * .3), r0 = r * 1.5, r1 = r * (2.1 + .2 * Math.sin(t * 12 + i)); c.beginPath(); c.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); c.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); c.stroke(); }
  c.fillStyle = '#9adcff'; for (const sg of [-1, 1]) { const x = q.x + sg * r * 1.25, y = q.y - r * .2 + ((t * 3) % 1) * r * .5; c.beginPath(); c.moveTo(x, y - r * .25); c.quadraticCurveTo(x + r * .14, y, x, y + r * .1); c.quadraticCurveTo(x - r * .14, y, x, y - r * .25); c.fill(); c.stroke(); } c.restore();
};
NL.drawHat = (g, p, o = {}) => {   // a loose straw hat in the world (flying / lying): p = brim centre, o.tilt (rad), o.spin (rad), o.size (head radii, default .13 m)
  const R = o.size || .13, sp = o.spin || 0, tl = o.tilt || 0, up = vNorm([Math.sin(tl) * Math.cos(sp), Math.cos(tl), Math.sin(tl) * Math.sin(sp)]), fwd = vNorm(vCross(up, [Math.cos(sp + HP), 0, Math.sin(sp + HP)]));
  nlStrawHat(g, { c: p, up, fwd: vLen(fwd) > .1 ? fwd : [0, 0, 1] }, R, { mode: 'normal' });
};
// ------------------------------------------------------------------------------------------------ signature poses named in cast.md
Object.assign(POSES, {
  nar_ready: { sp: .7, st: .2, hp: -.45, aL: [.75, .25, 0], eL: .25, hL: 'flat', aR: [1.0, 1.4, 0], eR: 1.3, hR: 'fist', lL: [1.4, .45, .2], kL: 2.1, lR: [.3, .5, -.2], kR: 2.2, fR: 1.0, face: expr('nindo') },
  nar_cloneSign: POSES.nar_signCross, nar_rasengan: POSES.nar_rasThrust, nar_rasenThrow: POSES.nar_rasThrow, nar_sage: POSES.nar_meditate,
  nar_frogKumite: { sp: .35, st: -.6, hp: .0, aR: [1.55, .05, 0], eR: .05, hR: 'open', wR: [-1.2, 0], aL: [.9, 1.6, 0], eL: 1.2, hL: 'fist', lL: [.95, .3, .2], kL: 1.0, lR: [-.7, .3, -.2], kR: .2, fR: .4, face: expr('focusedCalm') },
  nar_thumb: POSES.nar_thumbsUp,
  nar_fallFace: { ground: 'all', rest: .12, pitch: 1.5, sp: .1, hp: -.3, aL: [2.6, .6, 0], eL: .4, aR: [2.5, .7, 0], eR: .5, hL: 'open', hR: 'open', lL: [.1, .1, 0], kL: .3, lR: [.15, .15, 0], kR: .5, face: expr('pain') },
  nar_risePush: { sp: 1.0, hp: -.5, aL: [1.0, .05, 0], eL: .15, hL: 'flat', aR: [1.0, .05, 0], eR: .15, hR: 'flat', lL: [1.5, .2, 0], kL: 2.2, lR: [.9, .2, 0], kR: 1.9, fR: .8, face: expr('nindo') },
  nar_fistBump: { sp: .1, st: -.3, hp: -.05, aR: [1.5, .0, 0], eR: .3, hR: 'fist', aL: [.25, .5, 0], eL: .5, hL: 'relax', lL: [.2, .2, .2], kL: .2, lR: [-.15, .2, -.2], kR: .15, face: expr('foxGrin') },
  nar_sit: { sp: .25, hp: .15, aL: [.5, .7, 0], eL: .4, hL: 'flat', aR: [.6, .1, 0], eR: 1.6, hR: 'relax', lL: [1.4, .35, .3], kL: 1.0, lR: [1.5, .3, -.1], kR: 2.2, ground: false, face: expr('exhausted') },
  luf_pump: POSES.luf_gear2, luf_hakiArms: { sp: .15, hp: .1, aL: [1.2, -.15, 0], eL: 1.9, hL: 'fist', aR: [1.25, -.2, 0], eR: 1.8, hR: 'fist', lL: [.4, .35, .3], kL: .55, lR: [-.2, .35, -.3], kR: .4, haki: 'both', face: expr('serious') },
  luf_bite: { sp: .2, hp: .35, aR: [1.3, -.55, 0], eR: 1.7, hR: 'fist', aL: [.5, .6, 0], eL: .6, hL: 'fist', lL: [.4, .35, .3], kL: .5, lR: [-.2, .35, -.3], kR: .35, face: expr('angry', { mouth: 'teeth', mouthOpen: .5 }) },
  luf_kongGun: { sp: .4, st: -.7, hp: .0, aR: [1.55, -.05, 0], eR: .1, hR: 'fist', aL: [.8, 2.2, 0], eL: 1.4, hL: 'fist', lL: [1.0, .4, .3], kL: 1.1, lR: [-.6, .4, -.3], kR: .3, fR: .5, face: expr('yell') },
  luf_hatDown: POSES.luf_hatHold, luf_g5Laugh: { sp: -.45, ss: .1, hp: -.8, aL: [.9, 1.5, .3], eL: 2.0, hL: 'fist', aR: [.9, 1.5, -.3], eR: 2.0, hR: 'fist', lL: [.2, .35, .4], kL: .2, lR: [.1, .35, -.4], kR: .15, squash: .6, eyePop: .5, face: expr('nikaLaugh') },
  luf_g5Squash: { sp: .3, hp: .2, aL: [1.4, 1.6, 0], eL: .3, hL: 'open', aR: [1.4, 1.6, 0], eR: .3, hR: 'open', lL: [1.2, .7, .3], kL: 1.6, lR: [1.2, .7, -.3], kR: 1.6, squash: -1, face: expr('googly') },
  luf_g5Grab: POSES.luf_nikaGrab,
  luf_lieBack: { ground: 'all', rest: .1, pitch: -1.5, sp: 0, hp: .05, aL: [1.5, 1.6, 0], eL: .2, aR: [1.5, 1.6, 0], eR: .2, hL: 'open', hR: 'open', lL: [.15, .25, 0], kL: .2, lR: [.15, .25, 0], kR: .2, face: expr('bigGrin') },
  luf_sit: { sp: .2, hp: .0, aL: [.55, .9, 0], eL: .3, hL: 'flat', aR: [.55, .9, 0], eR: .3, hR: 'flat', lL: [1.4, .7, .5], kL: 1.9, lR: [1.4, .7, -.5], kR: 1.9, ground: false, face: expr('shishi') },
});
SIGNATURE.naruto.push('nar_ready', 'nar_frogKumite', 'nar_fallFace', 'nar_risePush', 'nar_fistBump', 'nar_sit');
SIGNATURE.luffy.push('luf_hakiArms', 'luf_bite', 'luf_kongGun', 'luf_g5Laugh', 'luf_g5Squash', 'luf_lieBack', 'luf_sit');
// cast.md uses nar_fall = fall on the face, nar_rise = push up on the hands (the airborne fall stays as nar_fallAir)
POSES.nar_fallAir = POSES.nar_fall; POSES.nar_fall = POSES.nar_fallFace; POSES.nar_riseStand = POSES.nar_rise; POSES.nar_rise = POSES.nar_risePush; POSES.nar_kick = POSES.nar_kick;
// ------------------------------------------------------------------------------------------------ impact_requests.md: field aliases + extra forms (technical, no story)
(function () { const N = CAST.naruto, L = CAST.luffy, C = NL.col;
  // NAR X1 (baryon): red-orange cloak with black stripes, two fox horns from the hair, blue iris with ring pattern
  const bar = { baryon: true, glowCol: '#ff6a2a', whiskerCol: '#2a0604', whiskerW: 1.9, earHorns: false, pupilBar: null,
    haori: { col: '#e8401e', lining: '#7a1408', len: .9, sleeves: false, hem: 'none', kanji: null, open: .3, flare: .6, collarLen: .45, flames: { col: '#120806', col2: '#120806', col3: '#000', h: .55, n: 7 } } };
  for (const fm of ['baryon', 'baryon_wounded']) { Object.assign(N.forms[fm], bar); N.forms[fm].face = Object.assign({}, N.face, { eye: Object.assign({}, N.face.eye, { irisCol: '#2f7fe0', irisLight: '#cfeaff', irisDark: '#0a2a7a', irisRing: '#e8f6ff' }),
    hair: Object.assign({}, N.face.hair, { locks: NL.narutoHair2({ up: .3, horns: 1.0 }) }) }); }
  N.forms.young = N.forms.memory; N.forms.memory.kosode = '#ff7a1a';
  // LUF X1 'withered': wrinkled, thin, grey hair, clothes hanging loose (no hat by default)
  L.forms.withered = { h: 1.62, body: { width: .8, limbs: .82, shoulders: .86, depth: .82, legs: .98, neck: .95 }, skin: '#d4b098', skinShade: '#a88068', kosode: '#d4b098', armSkin: '#d4b098', handSkin: '#d4b098', neckSkin: '#d4b098', legSkin: '#d4b098', hatDefault: 0, withered: true, noScar: false,
    haori: { col: '#f2f0ea', lining: '#c8c4bc', len: .3, sleeves: false, hem: 'none', kanji: null, open: .95, flare: .35, collarLen: .3 }, obi: { col: '#8a6ab0', v0: -.02, v1: .06 },
    hakama: { col: '#e8e6e0', r0: .13, r1: .13, r2: .12, len: .1, pleats: false, ties: false, shinCol: '#d4b098' }, feet: { col: '#d4b098', sandal: true, sole: '#a07a46', w: .95 } };
  L.forms.withered.face = Object.assign({}, L.face, { eyeSize: .36, defaultExpr: 'exhausted', hair: Object.assign({}, L.face.hair, { col: '#b8b8c0', shadeCol: '#7a7a84', glossCol: '#f0f0f4', locks: NL.luffyHair({ up: .2 }) }),
    markings: (c, HM, e, lod, D) => { nlLuffyScar(c, HM, D); for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .4, -.38, .55, .5); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.strokeStyle = 'rgba(90,60,50,.75)'; cc.lineWidth = .06; for (let i = 0; i < 3; i++) { cc.beginPath(); cc.moveTo(-.5, -.2 + i * .25); cc.quadraticCurveTo(0, -.1 + i * .25, .5, -.25 + i * .25); cc.stroke(); } }, .02, fr.n); } } });
})();
// pose-field aliases (impact_requests.md names): rasen/rasenR -> ras, cloak -> aura, stretchArm/stretchTarget -> stretch, tears -> face.tears, hatOff numeric
(function () { for (const nm of ['naruto', 'luffy']) { const D0 = CAST[nm], h0 = D0.drawHead; D0.drawHead = function (S, D, F, t, parts, opt) { const p = S.pose;
    if (p.rasen != null && !p.ras) p.ras = { hand: p.rasenHand || 'R', k: p.rasen, size: p.rasenR ? p.rasenR / .16 : 1, kind: p.rasenKind || 'rasengan' };
    if (p.cloak != null && p.aura == null) p.aura = p.cloak; if (p.tears) p.face = Object.assign({}, p.face || {}, { tears: p.tears });
    if (p.stretchArm != null && !p.stretch) { const sd = p.stretchSide || 'R', sh = S.J['sh' + sd], tgt = p.stretchTarget || vAdd(sh, vMul([Math.sin(p.yaw || 0), 0, Math.cos(p.yaw || 0)], p.stretchArm + .6)); p.stretch = { side: sd, to: tgt, k: p.stretchTarget ? clamp(p.stretchArm / Math.max(.1, vDist(sh, tgt)), 0, 1) : 1, wave: .2 }; }
    if (typeof p.hatOff === 'number') { if (p.hatOff > .5) p.hatOff = true; else delete p.hatOff; }
    return h0.call(this, S, D, F, t, parts, opt); }; for (const fm in D0.forms) if (D0.forms[fm].drawHead) D0.forms[fm].drawHead = D0.drawHead; } })();
// headband tails: two black cloth streamers behind the knot (spring-swayed by the head's motion); pose.headbandCut = no band
(function () { const hp0 = NL.narHeadParts; NL.narHeadParts = (S, D, F, t, parts, opt, HM, e, zc) => { if (S.pose.headbandCut) S.pose.headband = false; hp0(S, D, F, t, parts, opt, HM, e, zc);
  if (S.pose.headband === false || D.noHeadband) return; const knot = HM.toW(vMul(headShape(Math.PI, .25, HM.hs), 1.03)), back = vNorm(vSub(knot, HM.c)), sw = Math.sin(t * 5) * .3, k = HM.r;
  for (const sg of [-1, 1]) { const pts = [knot]; for (let i = 1; i <= 5; i++) { const u = i / 5; pts.push(vAdd(knot, vAdd(vMul(back, u * k * 1.1), [Math.sin(t * 6 + i + sg) * k * .08 * u + sg * k * .25 * u, -u * k * 2.4 + sw * k * .2 * u, Math.cos(t * 5 + i) * k * .1 * u]))); }
    parts.push({ z: camDepth(pts[3]) + .001, fn: c => { if (opt.mode === 'flat') return; const sp = pts.map(p => proj2(p)), s = pxScale(knot), w = k * .26 * s; c.save(); c.fillStyle = D.bandCol || NL.col.band; c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(1, lineW(s, .5)); const L = [], Rr = [];
      for (let i = 0; i < sp.length; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(sp.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ww = w * (1 - i / sp.length * .4) * .5; L.push([sp[i][0] - dy / d * ww, sp[i][1] + dx / d * ww]); Rr.push([sp[i][0] + dy / d * ww, sp[i][1] - dx / d * ww]); }
      c.beginPath(); L.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); for (let i = Rr.length - 1; i >= 0; i--) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath(); c.fill(); c.stroke(); c.restore(); } }); } }; })();
NL.sitY = (cast = 'naruto', seat = .2) => seat - (CAST[cast]._body || makeBody(CAST[cast])).pelvisH;   // pos y for ground:false sitting poses (nar_meditate, nar_sit, luf_sit) on a seat of height 'seat'
