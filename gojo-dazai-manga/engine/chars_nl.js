/* engine/chars_nl.js (agent E, project naruto-vs-luffy) - NARUTO UZUMAKI (Naruto Shippuden / Boruto) and MONKEY D. LUFFY (One Piece).
   NARUTO: ~1.78 m here, spiky golden-blond hair (spikes in every direction, long side bangs), bright BLUE eyes, three WHISKER marks per cheek,
     Konoha forehead protector (dark navy cloth + steel plate with the leaf spiral), orange jacket with BLACK shoulders + high collar + zip,
     orange trousers, black shinobi sandals.
   LUFFY: ~1.74 m, messy black hair, STRAW HAT (yellow straw, red band), scar under his LEFT eye (2 stitches), X scar on the chest,
     open RED vest (sleeveless), yellow sash, blue knee shorts with white cuffs, straw sandals, big grin.
   FORMS
     naruto: base | sage (Sage Mode: red-orange cloak with black flame hem, orange pigment around the eyes, toad eyes = yellow iris + horizontal bar)
             | kcm (Kurama Chakra Mode: golden chakra body, black seal marks, flame-hem coat, horn spikes, glow) | baryon (Baryon Mode: orange-red
             chakra flames, fox-ear horns, red-orange eyes, bold whiskers) | wounded (torn jacket, wounds 2) | sage_wounded | kcm_wounded
     luffy : base | gear2 (pink skin, steam) | gear3 (= base; giant limb via pose.stretch.giant) | gear4 (Boundman: bulky, black haki limbs,
             red flame marks, hair up, steam) | gear5 ('Nika': white hair flames, white clothes, cloud boa, big red eyes, thick cartoon line,
             rubber-hose limbs) | wounded | gear5_wounded
   POSE FIELDS (interpolate where numeric)
     both   : wounds 0..3, aura 0..1 (form glow strength override)
     naruto : ras {hand:'R'|'L'|'both', k 0..1, kind:'rasengan'|'odama'|'shuriken'|'baryon'|'planet', size} (orb in the palm),
              headband:false, eyesSage 0..1 (pigment fade-in on any form)
     luffy  : hat 1 (on head) | 'back' (hanging on the back) | 0 (none), hatTilt (rad, + = brim down over the eyes),
              stretch {side:'R'|'L', to:[x,y,z] world, k 0..1 (0 = normal arm, 1 = reaches 'to'), fist (scale), giant 0..1 (Gear 3 balloon),
                       wave (rubber-hose wobble), haki 0..1} -> normal arm hidden, long rubber arm drawn;  stretch2 = second arm,
              haki 'L'|'R'|'both' (armament: black glossy forearms + fists), steam 0..1, eyePop 0..1 (Gear 5 bulging eyes)       */
'use strict';
var NL = window.NL || {};
window.NL = NL;
NL.col = {
  nSkin: '#f6d2ae', nSkinShade: '#d69a78', nHair: '#ffd23a', nHairShade: '#d8901a', nHairGloss: '#fff4b0', nEye: '#2f8ef0', nEyeLight: '#bfe8ff', nEyeDark: '#0e3e9a',
  orange: '#f2741a', orangeShade: '#b84a0e', black: '#1b1a22', band: '#1c2440', plate: '#c8ccd6', plateDark: '#7a8090',
  sage: '#c8381e', sageLin: '#7a1a10', kcm: '#ffc72a', kcmShade: '#e88a14', kcmGlow: '#fff2a0', baryon: '#ff6a2a', baryonDeep: '#c81e1e',
  lSkin: '#f4caa4', lSkinShade: '#d2906c', lHair: '#141218', lHairShade: '#040306', lHairGloss: '#4a4a62', lEye: '#2a1e1a',
  vest: '#d4202c', vestLin: '#8a0e18', sash: '#f2c832', shorts: '#2c58b0', cuff: '#f4f0e6', straw: '#f2cf6a', strawShade: '#c79a3a', hatBand: '#d01e26',
  g2: '#f08a86', g2Shade: '#c24e5a', haki: '#16121c', hakiGloss: '#6a5a8a', g4red: '#e0242a', g5: '#fbfaf4', g5Shade: '#c9cbe0', g5Eye: '#e8303a', cloud: '#ffffff',
};
// ------------------------------------------------------------------------------------------------------------- expressions (everyone)
Object.assign(EXPR, {
  foxGrin: { eye: .55, lid: .05, brow: .1, browA: .2, pupil: .9, mouth: 'grin', mouthOpen: .5, mouthW: 1.45 },
  nindo: { eye: 1.0, lid: .3, brow: -.3, browA: .6, pupil: .85, mouth: 'teeth', mouthOpen: .3, mouthW: 1.0 },
  yell: { eye: 1.05, lid: .35, brow: -.45, browA: .75, pupil: .7, mouth: 'shout', mouthOpen: 1, mouthW: 1.2, vein: 1 },
  bigGrin: { eye: .2, lid: 0, brow: .3, browA: -.2, pupil: 1, mouth: 'grin', mouthOpen: .75, mouthW: 1.75, closed: 1, closedUp: 1 },
  shishi: { eye: .7, lid: 0, brow: .2, browA: -.1, pupil: .95, mouth: 'grin', mouthOpen: .6, mouthW: 1.7 },
  nikaLaugh: { eye: 1.38, lid: -.2, brow: .6, browA: -.2, pupil: .5, mouth: 'laugh', mouthOpen: 1, mouthW: 1.9 },
  nikaGrin: { eye: 1.25, lid: -.1, brow: .45, browA: -.1, pupil: .55, mouth: 'grin', mouthOpen: .85, mouthW: 1.95 },
  googly: { eye: 1.45, lid: -.3, brow: .7, browA: -.3, pupil: .35, mouth: 'o', mouthOpen: .9, mouthW: 1.2, shock: 1 },
  focusedCalm: { eye: .7, lid: .25, brow: -.1, browA: .2, pupil: .8, mouth: 'line', mouthW: .8 },
});
// ------------------------------------------------------------------------------------------------------------- hair
NL.narutoHair = (o = {}) => () => { const r = i => hash(i * 4.77 + 13), up = o.up || 0, hornK = o.horns || 0; return [
  // crown spikes: big pointed spikes radiating out + back (golden), slightly upward
  ...lockFan(15, .95, 5.33, .42, (th, u, i) => ({ th: th + (r(i + 7) - .5) * .2, ph: .3 + .2 * r(i + 8), len: .95 + .35 * r(i), w: .7 + .15 * r(i + 9), rootR: .95,
    dir: dirOut(th + (r(i + 5) - .5) * .35, .35 + .35 * r(i + 3) + up * .5, -.05, -.25), curl: [(r(i + 4) - .5) * .5, .25 + up * .3, -.35], grav: -.1 - up * .2, tw: .36, tip: 1.75, seg: 6, back: Math.cos(th) < -.3, sway: .4, gloss: i % 4 === 0 })),
  ...lockFan(8, .7, 5.58, 1.05, (th, u, i) => ({ th, len: .85 + .3 * r(i + 20) + up * .3, w: .78, rootR: .97, dir: dirOut(th, .95 + .25 * r(i + 23) + up * .4, -.05, -.3), curl: [(r(i + 21) - .5) * .7, .2, -.5], grav: -.12, tw: .36, tip: 1.75, seg: 6, sway: .4, gloss: i % 3 === 0 })),
  // fringe spikes falling over the forehead protector (pointed down-forward)
  ...lockFan(6, -.75, .75, .66, (th, u, i) => ({ th, len: .52 + .14 * r(i + 30), w: .5, rootR: .965, dir: [Math.sin(th) * .6, .25 + up * .6, 1], curl: [Math.sin(th) * .4 + (r(i + 31) - .5) * .4, -1.1 + up * 1.2, -.3], grav: .55 - up * .6, tw: .34, tip: 1.6, seg: 6, front: true, gloss: i % 3 === 1 })),
  // long side bangs framing the face to the jaw (Shippuden)
  { th: 1.18, ph: .3, len: .85, w: .36, rootR: .97, dir: [.35, -.85, .25], curl: [-.25, .1, .1], grav: 1.0, tw: .3, tip: 1.5, seg: 7, front: true },
  { th: -1.18, ph: .3, len: .85, w: .36, rootR: .97, dir: [-.35, -.85, .25], curl: [.25, .1, .1], grav: 1.0, tw: .3, tip: 1.5, seg: 7, front: true },
  ...(hornK ? [{ th: .5, ph: .95, len: 1.4 * hornK, w: .75, rootR: .97, dir: [.35, 1, .25], curl: [.2, .3, -.2], grav: -.3, tw: .38, tip: 1.9, seg: 6, gloss: true },
    { th: -.5, ph: .95, len: 1.4 * hornK, w: .75, rootR: .97, dir: [-.35, 1, .25], curl: [-.2, .3, -.2], grav: -.3, tw: .38, tip: 1.9, seg: 6, gloss: true }] : []),
]; };
NL.luffyHair = (o = {}) => () => { const r = i => hash(i * 3.31 + 29), up = o.up || 0; return [
  ...lockFan(17, .95, 5.33, .4, (th, u, i) => ({ th, ph: .36 + .1 * r(i), len: (.62 + .2 * r(i)) * (1 + up * .6), w: .48, rootR: .95,
    dir: dirOut(th + (r(i + 9) - .5) * .5, .2 + .25 * r(i + 4) + up * .9, .7 - up * .7, -.05), curl: [(r(i + 2) - .5) * .9, .2, -.3], grav: .55 - up * .7, tw: .32, tip: 1.45, seg: 6, back: Math.cos(th) < .1, gloss: i % 4 === 1 })),
  ...lockFan(7, 0, TAU * .86, 1.1, (th, u, i) => ({ th, len: .45 + .2 * r(i + 30) + up * .5, w: .5, rootR: .97, dir: dirOut(th, .9 + up, 0, -.2), curl: [(r(i + 41) - .5) * 1.3, -.4 + up, 0], grav: .25 - up * .5, tw: .32, tip: 1.4, seg: 5 })),
  // fringe: short spiky bangs over the brow (one longer centre lock)
  ...lockFan(7, -.8, .8, .9, (th, u, i) => ({ th, len: (.64 + .18 * r(i + 60)) * (up ? .8 : 1), w: .42, rootR: .965, dir: [Math.sin(th) * .5 + (r(i + 61) - .5) * .4, -.1 + up * 1.4, 1], curl: [(r(i + 62) - .5) * 1.2, -1.5 + up * 2, -.5], grav: 1.1 - up * 1.4, tw: .3, tip: 1.5, seg: 6, front: true, gloss: i % 3 === 1 })),
  ...lockFan(2, 1.15, 1.45, .3, (th, u, i) => ({ th, len: .65, w: .36, rootR: .97, dir: [.3, -.85 + up, .25], curl: [-.3, .1, .1], grav: 1.0 - up, tw: .3, tip: 1.4, front: true })),
  ...lockFan(2, -1.45, -1.15, .3, (th, u, i) => ({ th, len: .65, w: .36, rootR: .97, dir: [-.3, -.85 + up, .25], curl: [.3, .1, .1], grav: 1.0 - up, tw: .3, tip: 1.4, front: true })),
]; };
// Gear 5: white hair rising like flames / clouds (wavy locks that curl up and back)
NL.nikaHair = () => () => { const r = i => hash(i * 5.13 + 3); return [
  ...lockFan(13, .5, 5.78, .3, (th, u, i) => ({ th, ph: .25 + .2 * r(i), len: 1.0 + .45 * r(i + 1), w: 1.05, rootR: .95, dir: dirOut(th + (r(i + 2) - .5) * .3, .85 + .3 * r(i + 3), -.1, -.45),
    curl: [Math.sin(th * 2 + i) * 1.4, 1.1, -1.0], grav: -.35, wave: [.32, 1.2, i], tw: .5, tip: .9, seg: 9, back: Math.cos(th) < -.3, sway: 1.2, gloss: i % 3 === 0 })),
  ...lockFan(8, .3, 5.98, .85, (th, u, i) => ({ th, len: .8 + .3 * r(i + 20), w: 1.1, rootR: .97, dir: dirOut(th, 1.1, -.1, -.3), curl: [(r(i + 21) - .5) * 1.6, 1.2, -.8], grav: -.3, wave: [.3, 1.3, i + 7], tw: .5, tip: .9, seg: 8, sway: 1.2 })),
  ...lockFan(5, -.7, .7, .7, (th, u, i) => ({ th, len: .62 + .2 * r(i + 10), w: .9, rootR: .965, dir: [Math.sin(th) * .4, .9, .5], curl: [(r(i + 11) - .5) * 1.4, 1.0, -.6], grav: -.25, wave: [.25, 1.4, i + 3], tw: .5, tip: .9, seg: 7, front: true, sway: 1.2 })),
]; };
// ------------------------------------------------------------------------------------------------------------- shared head decals
function nlWhiskers(c, HM, D, k = 1) {   // three whisker lines per cheek
  for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .6, -.5, .55, .42); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => {
    cc.strokeStyle = D.whiskerCol || '#5a3428'; cc.lineCap = 'round'; cc.lineWidth = .075 * k * (D.whiskerW || 1);
    for (let i = 0; i < 3; i++) { const y = .3 - i * .3; cc.beginPath(); cc.moveTo(-.38, y + .05); cc.quadraticCurveTo(.05, y - .01, .5, y - .04 - i * .05); cc.stroke(); } }, .02, fr.n); }
}
function nlSagePigment(c, HM, k, col) {   // orange-red pigmentation around the eyes (Sage Mode)
  if (k <= .01) return; for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .45, -.08, .55, .62); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => {
    cc.globalAlpha = clamp(k, 0, 1); cc.fillStyle = col || '#e2501e'; cc.beginPath(); cc.moveTo(-.85, -.05); cc.quadraticCurveTo(-.4, .55, .3, .48); cc.quadraticCurveTo(.85, .38, .95, -.1);
    cc.quadraticCurveTo(.7, .22, .2, .26); cc.quadraticCurveTo(-.4, .3, -.85, -.05); cc.fill(); cc.globalAlpha = 1; }, .02, fr.n); }
}
function nlLeaf(cc, x, y, r, col, w) {   // Konoha leaf symbol (spiral + tail + point)
  cc.strokeStyle = col; cc.lineWidth = w; cc.lineCap = 'round'; cc.beginPath();
  for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * TAU * 1.15, rr = r * (.15 + .55 * i / 24); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? cc.lineTo(px, py) : cc.moveTo(px, py); }
  cc.stroke(); cc.beginPath(); cc.moveTo(x - r * .55, y + r * .2); cc.quadraticCurveTo(x - r * .7, y - r * .7, x + r * .05, y - r * .95); cc.lineTo(x + r * .75, y - r * .2); cc.quadraticCurveTo(x + r * .6, y + r * .55, x - r * .1, y + r * .7); cc.stroke();
  cc.beginPath(); cc.moveTo(x + r * .55, y + r * .4); cc.lineTo(x + r * 1.05, y + r * .85); cc.stroke();
}
// forehead protector: navy band around the head + steel plate with the leaf
function nlHeadband(c, HM, opt, D) {
  const band = { nu: 26, nv: 3, wrapU: false, fn: (u, v) => HM.toW(vMul(headShape(lerp(-2.25, 2.25, u), lerp(.12, .36, v), HM.hs), 1.03 + .006 * Math.sin(v * Math.PI))) };
  drawSurf(c, sampleSurf(band), Object.assign({ col: D.bandCol || NL.col.band, shade: .2, side: 'front', borders: { v0: true, v1: true, u0: false, u1: false }, rimW: .1 }, opt.surf || {}));
  const plate = { nu: 12, nv: 3, wrapU: false, fn: (u, v) => HM.toW(vMul(headShape(lerp(-.62, .62, u), lerp(.1, .4, v), HM.hs), 1.065)) };
  const G = sampleSurf(plate); drawSurf(c, G, Object.assign({ col: D.plateCol || NL.col.plate, shade: .3, side: 'front', borders: { v0: true, v1: true, u0: true, u1: true }, rimW: .2 }, opt.surf || {}));
  if (opt.mode === 'flat' || LIGHT.override) return;
  const fr = faceFrame(HM, 0, .25, .3, .4); const fw = vDot(HM.M[2], toCam(HM.c)); if (fw < .15) return;
  decal(c, vMad(fr.p, HM.M[2], HM.r * .07), fr.tu, fr.tv, cc => { nlLeaf(cc, 0, -.05, .55, '#2a2e3a', .11); if (D.bandScratch) { cc.strokeStyle = '#2a2e3a'; cc.lineWidth = .08; cc.beginPath(); cc.moveTo(-1.1, .1); cc.lineTo(1.1, -.05); cc.stroke(); } }, .05, fr.n);
  for (const sg of [-1, 1]) { const q = proj2(HM.toW(vMul(headShape(sg * .5, .25, HM.hs), 1.07))); c.fillStyle = '#5a5e6a'; c.beginPath(); c.arc(q[0], q[1], Math.max(1, HM.r * pxScale(HM.c) * .025), 0, TAU); c.fill(); }   // rivets
}
// straw hat on a frame {c (brim centre), up (crown direction), fwd}; size = head radius
function nlStrawHat(c, fr, R, opt, o = {}) {
  const up = fr.up, f0 = fr.fwd, rt = vNorm(vCross(up, f0)), fw = vCross(rt, up), at = (rad, th, h) => vAdd(fr.c, vAdd(vMul(up, h), vAdd(vMul(fw, Math.cos(th) * rad), vMul(rt, Math.sin(th) * rad))));
  const straw = o.col || NL.col.straw, flat = opt.mode === 'flat';
  // brim (both sides) with a slight droop at the edge
  const brim = { nu: 30, nv: 3, wrapU: true, fn: (u, v) => at(lerp(R * .98, R * 1.95, v), u * TAU, -v * v * R * .12) };
  const Gb = sampleSurf(brim); drawSurf(c, Gb, Object.assign({ col: straw, side: 'both', backCol: NL.col.strawShade, shade: .2, borders: { v0: false, v1: true } }, opt.surf || {}));
  if (!flat && !LIGHT.override) { const s = gridScale(Gb); for (const v of [.35, .7]) { const pts = []; for (let i = 0; i <= 30; i++) pts.push([i / 30, v]); strokeRuns(c, surfLine(brim, pts, .02), lineW(s, .35), rgba('#8a6a2a', .55)); } }
  // crown: rounded cylinder, red band at the bottom
  const crown = { nu: 22, nv: 8, wrapU: true, fn: (u, v) => { const vv = Math.min(v, .7) / .7, top = Math.max(0, v - .7) / .3, h = vv * R * .62 + Math.sin(top * Math.PI / 2) * R * .28, rr = R * (1.0 - .06 * vv) * Math.cos(top * Math.PI / 2 * .98); return at(rr, u * TAU, h); } };
  drawSurf(c, sampleSurf(crown), Object.assign({ col: straw, shade: .25, extraTones: [{ col: o.band || NL.col.hatBand, mask: (u, v) => .36 - v }], borders: { v0: false, v1: false } }, opt.surf || {}));
}
NL.hatFrame = (S, D, p, HM) => {
  const k = S.B.h / 1.8;
  if (p.hat === 'back') { const M = S.M.chest, back = vMul(M[2], -1); return { c: vAdd(vMad(S.J.neck, back, .14 * k), mApply(M, [0, -.2 * k, 0])), up: back, fwd: vMul(M[1], -1), R: HM.r * 1.08 }; }
  const tilt = p.hatTilt || 0, up = vNorm(vAdd(HM.M[1], vMul(HM.M[2], .18 + tilt))), fwd = vNorm(vSub(HM.M[2], vMul(HM.M[1], .18 + tilt)));
  return { c: vAdd(HM.c, vAdd(vMul(HM.M[1], HM.r * .5), vMul(HM.M[2], -HM.r * .05))), up, fwd, R: HM.r * 1.02 };
};
// ------------------------------------------------------------------------------------------------------------- NARUTO
NL.narJacketDetail = (c, S, D, T, G) => {
  if (LIGHT.override) return; const s = gridScale(G);
  strokeRuns(c, surfLine(T.surf, [[0, .97], [0, .8], [0, .6], [0, .4], [0, .2], [0, .05]], .02), lineW(s, .6), D.zipCol || '#1b1a22');   // zip
  const fr = surfFrame(T.surf, 0, .9); if (vDot(fr.n, toCam(fr.p)) > .1) { const q = proj2(fr.p), r = Math.max(1.5, .012 * s); c.fillStyle = '#e8e8ee'; c.beginPath(); c.arc(q[0], q[1] + r, r, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(.8, r * .4); c.stroke(); }
  if (D.kcmMarks) NL.kcmMarks(c, S, D, T, G);
  if (D.torn) torsoLines(c, S, D, [[[.12, .7], [.18, .55], [.1, .42]], [[-.2, .5], [-.12, .35], [-.22, .22]]], LIGHT.ink, 1.0, .006);
};
NL.kcmMarks = (c, S, D, T, G) => {   // KCM seal: black ring of magatama round the collar + lines down the chest/abdomen
  torsoLines(c, S, D, [[[.12, .96], [.1, .7], [.07, .5], [.1, .3]], [[-.12, .96], [-.1, .7], [-.07, .5], [-.1, .3]], [[.2, .55], [.3, .55]], [[-.2, .55], [-.3, .55]], [[.5, .95], [.5, .3]]], '#1a120a', 1.6, .006);
  const s = gridScale(G); for (let i = 0; i < 6; i++) { const u = (i / 6 + 1 / 12) % 1, fr = surfFrame(T.surf, u, .86); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const q = proj2(fr.p), r = Math.max(1.5, .018 * s); c.fillStyle = '#1a120a'; c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fill(); c.beginPath(); c.moveTo(q[0] + r, q[1]); c.quadraticCurveTo(q[0] + r * 1.4, q[1] + r * 2, q[0] - r * .4, q[1] + r * 2.6); c.lineTo(q[0] - r * .6, q[1]); c.fill(); }
};
CAST.naruto = design(SHINIGAMI, {
  name: 'Naruto Uzumaki', h: 1.78, body: { width: .98, limbs: 1.0, shoulders: 1.04, depth: .98, legs: 1.0, neck: 1.0 }, skin: NL.col.nSkin, skinShade: NL.col.nSkinShade,
  kosode: NL.col.orange, collar: { none: true }, obi: null,
  torsoTones: [{ col: NL.col.black, mask: (u, v) => v - .79 }],
  torsoDetail: (c, S, D, T, G) => NL.narJacketDetail(c, S, D, T, G),
  sleeve: { none: true }, armSkin: NL.col.orange, neckSkin: NL.col.nSkin, arm: { delt: 1.1, bicep: .15, elbow: 1.0, fore: .15, wrist: 1.0, flex: .1 },
  hakama: { col: NL.col.orange, r0: .105, r1: .09, r2: .078, pleats: false, ties: false },
  haori: { none: true },
  feet: { col: '#1d1d2a', sandal: false, w: 1.05, shaft: .1, shaftCol: '#2a2a3a', shaftR: 1.05, soleCol: '#101016', soleH: .015 },
  face: {
    eye: { w: 1.12, h: .44, irisR: .38, irisCol: NL.col.nEye, irisLight: NL.col.nEyeLight, irisDark: NL.col.nEyeDark, irisRing: '#d8f2ff', tilt: .05, thick: 1.3, flick: .05, lashes: true, crease: true, pupilR: .3, lidShade: '#8a6a50' },
    eyeSize: .41, eyeY: -.2, defaultExpr: 'determined', brow: { browW: .07, browY: .02, browCol: '#c8901a' }, headShape: { jaw: .9, chin: .96, width: .95 }, noseK: .85,
    mouth: { mouthW: 1.0 }, mouthSize: .27, mouthY: -.76,
    hair: { col: NL.col.nHair, shadeCol: NL.col.nHairShade, gloss: true, glossCol: NL.col.nHairGloss, springK: 40, springC: 6, cap: { front: .32, side: .02, back: -.85 }, locks: NL.narutoHair() },
    markings: (c, HM, e, lod, D) => { nlWhiskers(c, HM, D, D.whiskerK || 1); nlSagePigment(c, HM, D._sageK || 0, D.pigCol); },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => NL.narHeadParts(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['determined', 'foxGrin', 'nindo', 'yell', 'calm', 'smile', 'shock', 'pain', 'angry', 'focusedCalm', 'sorrow', 'laugh', 'exhausted', 'eyesClosed'],
  extras: (S, D, F, t, parts, opt) => NL.narExtras(S, D, F, t, parts, opt),
  forms: {
    base: {},
    wounded: { wounds: 2, torn: true },
    sage: { sageK: 1, toadEyes: true, haori: { col: NL.col.sage, lining: NL.col.sageLin, len: .88, sleeves: true, hem: 'none', kanji: null, open: .32, flare: .55, collarLen: .4, capLen: .55,
      flames: { col: '#16121a', col2: '#16121a', col3: '#000000', h: .3, n: 12 } } },
    kcm: { kcm: true, glowCol: NL.col.kcmGlow, skin: '#ffd98a', skinShade: '#e89a3a', kosode: NL.col.kcm, kcmMarks: true, zipCol: '#1a120a', torsoTones: [{ col: '#1a120a', mask: (u, v) => .025 - Math.abs(angOf(u) - .0) - (v < .3 ? 1 : 0) }],
      armSkin: NL.col.kcm, handSkin: '#ffd98a', neckSkin: '#ffd98a',
      hakama: { col: NL.col.kcm, r0: .105, r1: .09, r2: .078, pleats: false, ties: false, lowerCol: '#1a120a', lowerV: .9 },
      haori: { col: NL.col.kcm, lining: NL.col.kcmShade, len: .9, sleeves: false, hem: 'none', kanji: null, open: .28, flare: .7, collarLen: .4, flames: { col: '#1a120a', col2: '#1a120a', col3: '#000', h: .32, n: 9 } },
      feet: { col: '#1a120a', sandal: false, w: 1.05 }, whiskerCol: '#1a120a', whiskerW: 1.4, eyeCol: '#ff8a1a', pupilBar: 'v', bandCol: '#1a120a' },
    baryon: { baryon: true, glowCol: '#ff7a2a', whiskerCol: '#3a0a06', whiskerW: 1.8, eyeCol: '#ff6a1a', pupilBar: 'h', earHorns: true },
  },
});
(function () {
  const N = CAST.naruto, f0 = N.face;
  N.forms.sage_wounded = Object.assign({}, N.forms.sage, { wounds: 2, torn: true });
  N.forms.kcm_wounded = Object.assign({}, N.forms.kcm, { wounds: 2 });
  N.forms.baryon_wounded = Object.assign({}, N.forms.baryon, { wounds: 3, torn: true });
  const eyeY = { irisCol: '#f2c230', irisLight: '#fff2a8', irisDark: '#a86a0a', irisRing: '#fff8d0' };
  N.forms.sage.face = Object.assign({}, f0, { eye: Object.assign({}, f0.eye, eyeY) }); N.forms.sage_wounded.face = N.forms.sage.face;
  N.forms.kcm.face = Object.assign({}, f0, { eye: Object.assign({}, f0.eye, { irisCol: '#ff8a1a', irisLight: '#ffe08a', irisDark: '#a83a0a', irisRing: '#fff0c0' }), brow: Object.assign({}, f0.brow, { browCol: '#e88a14' }),
    hair: Object.assign({}, f0.hair, { col: '#ffd84a', shadeCol: '#e8901a', glossCol: '#fffbe0', locks: NL.narutoHair({ up: .45, horns: .8 }) }) }); N.forms.kcm_wounded.face = N.forms.kcm.face;
  N.forms.baryon.face = Object.assign({}, f0, { eye: Object.assign({}, f0.eye, { irisCol: '#ff4a1a', irisLight: '#ffc08a', irisDark: '#8a0a0a', irisRing: '#ffe0b0' }),
    hair: Object.assign({}, f0.hair, { locks: NL.narutoHair({ up: .35 }) }) }); N.forms.baryon_wounded.face = N.forms.baryon.face;
})();
CAST.naruto.drawHead = stdHead(CAST.naruto);
NL.narHeadParts = (S, D, F, t, parts, opt, HM, e, zc) => {
  const p = S.pose; D._sageK = p.eyesSage != null ? p.eyesSage : (D.sageK || 0);
  if (p.headband !== false && !D.noHeadband) parts.push({ z: zc - .0003, fn: c => nlHeadband(c, HM, opt, D) });
  if ((D.toadEyes || D.pupilBar) && opt.mode !== 'flat' && !LIGHT.override) parts.push({ z: zc - HM.r * 1.12, fn: c => {   // toad / fox pupils (bar) over the normal pupil
    if (vDot(HM.M[2], toCam(HM.c)) < .1) return; if ((e.closed || 0) > .5 || (e.eye != null && e.eye < .25)) return; const bar = D.pupilBar || 'h';
    for (const sg of [-1, 1]) { const fr = faceFrame(HM, sg * .45, -.21 + .0, .55, .2); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = '#100808'; cc.beginPath(); if (bar === 'v') cc.ellipse(0, 0, .18, .7, 0, 0, TAU); else cc.rect(-.62, -.17, 1.24, .34); cc.fill(); }, .05, fr.n); } } });
  if (D.earHorns && opt.mode !== 'flat') parts.push({ z: zc + HM.r * .2, fn: c => { if (LIGHT.override) return; for (const sg of [-1, 1]) { const a = HM.toW([sg * .55, .75, -.1]), b = HM.toW([sg * 1.0, 1.75, -.3]); const qa = project(a), qb = project(b); if (!qa || !qb) continue;
    c.save(); c.globalCompositeOperation = 'lighter'; const w = HM.r * qa.s * .45; c.fillStyle = rgba('#ff6a1a', .55); c.beginPath(); c.moveTo(qa.x - w, qa.y); c.quadraticCurveTo(qb.x - w * .3, (qa.y + qb.y) / 2, qb.x, qb.y); c.quadraticCurveTo(qb.x + w * .2, (qa.y + qb.y) / 2, qa.x + w, qa.y); c.fill(); c.restore(); } } });
};
NL.narExtras = (S, D, F, t, parts, opt) => {
  const p = S.pose, k = S.B.h / 1.8;
  NL.collar(S, D, parts, opt, D.kcm ? NL.col.kcm : NL.col.black, D.kcm ? '#1a120a' : NL.col.orange);
  const ras = p.ras; if (ras && (ras.k || 0) > .01) { const hands = ras.hand === 'both' ? ['L', 'R'] : [ras.hand || 'R'];
    let c0; if (hands.length === 2) { const a = handGeom(S, 'L', p.hL || 'open'), b = handGeom(S, 'R', p.hR || 'open'); c0 = a && b ? vLerp(a.palmC, b.palmC, .5) : vLerp(S.J.handL, S.J.handR, .5); }
    else { const hg = handGeom(S, hands[0], p['h' + hands[0]] || 'open'); const sd0 = hands[0], fwd = vNorm(vSub(S.J['hand' + sd0], S.J['wr' + sd0])), R0 = (ras.size || 1) * k * ({ odama: .42, shuriken: .2, planet: .14 }[ras.kind] || .16) * 1.05, dir = vNorm(vAdd(vMul(fwd, ras.fwd == null ? .55 : ras.fwd), [0, ras.up == null ? .85 : ras.up, 0]));
      c0 = vMad(hg ? hg.palmC : S.J['hand' + sd0], dir, R0 + .03 * k); if (ras.kind === 'shuriken' && hg) c0 = vAdd(hg.palmC, [0, .35 * k, 0]); }
    if (ras.at) c0 = ras.at;
    parts.push({ z: camDepth(c0) - .08, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; if (typeof fxRasengan === 'function') fxRasengan(c, c0, t, { k: ras.k, kind: ras.kind || 'rasengan', size: (ras.size || 1) * k }); } }); }
  const aura = p.aura != null ? p.aura : (D.kcm || D.baryon ? 1 : 0);
  if (aura > .01 && opt.mode !== 'flat') parts.push({ z: camDepth(S.J.abd) + .25, fn: c => { if (LIGHT.override || typeof fxChakraCloak !== 'function') return; fxChakraCloak(c, F, t, { k: aura, kind: D.baryon ? 'baryon' : D.kcm ? 'kcm' : 'chakra', S }); } });
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0));
};
// high zip-up collar (Naruto jacket), outer colour + inner lining
NL.collar = (S, D, parts, opt, col, lin) => { const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.headBase) + .012, fn: c => { const T = torsoModel(S, D, .03 * k), ctr = vLerp(S.J.neck, S.J.headBase, .1);
  const surf = { nu: 24, nv: 3, wrapU: false, fn: (u, v) => { const th = lerp(.16, TAU - .16, u), b = T.ringAt(.965, th, .015 * k); const rad = vNorm(vSub(b, ctr)); return vAdd(vMad(b, rad, v * .02 * k), [0, v * .075 * k, 0]); } };
  drawSurf(c, sampleSurf(surf), Object.assign({ col, side: 'both', backCol: lin, shade: .12, borders: { v1: true, u0: true, u1: true } }, opt.surf || {})); } }); };
// ------------------------------------------------------------------------------------------------------------- LUFFY
NL.lufTorso = (c, S, D, T, G) => {
  if (LIGHT.override) return; const s = gridScale(G);
  if (D.g4) { if (window.hyMuscles) hyMuscles(c, S, D, { def: 1.0 }); torsoLines(c, S, D, [[[.0, .95], [.1, .82], [.18, .9]], [[.0, .95], [-.1, .82], [-.18, .9]]], NL.col.g4red, 1.4, .006); }
  else torsoLines(c, S, D, [[[-.02, .92], [0, .78], [-.02, .55]]], rgba(shadeHex(D.skinShade, -.35), .6), .5, .005);   // sternum
  if (D.noScar) return;
  const sc = D.scarCol || '#a8564a';   // X scar across the chest
  torsoLines(c, S, D, [[[-.17, .9], [-.05, .78], [.08, .64], [.16, .56]], [[.17, .9], [.05, .78], [-.08, .64], [-.16, .56]]], sc, 2.2, .006);
  torsoLines(c, S, D, [[[-.17, .9], [-.05, .78], [.08, .64], [.16, .56]], [[.17, .9], [.05, .78], [-.08, .64], [-.16, .56]]], rgba('#f8c8b8', .6), .7, .007);
};
function nlLuffyScar(c, HM, D) {   // under his LEFT eye: a short curved cut with two stitches
  const fr = faceFrame(HM, .44, -.36, .55, .22); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = D.faceScarCol || '#8a4438'; cc.lineCap = 'round'; cc.lineWidth = .12;
    cc.beginPath(); cc.moveTo(-.65, .05); cc.quadraticCurveTo(0, -.15, .65, .02); cc.stroke(); cc.lineWidth = .09; for (const x of [-.22, .22]) { cc.beginPath(); cc.moveTo(x, .26); cc.lineTo(x + .03, -.3); cc.stroke(); } }, .02, fr.n);
}
CAST.luffy = design(SHINIGAMI, {
  name: 'Monkey D. Luffy', h: 1.74, body: { width: .92, limbs: .94, shoulders: .98, depth: .92, legs: 1.02, neck: 1.0 }, skin: NL.col.lSkin, skinShade: NL.col.lSkinShade,
  kosode: NL.col.lSkin, collar: { none: true }, armSkin: NL.col.lSkin, handSkin: NL.col.lSkin, neckSkin: NL.col.lSkin, legSkin: NL.col.lSkin, sleeve: { none: true },
  arm: { delt: 1.15, bicep: .22, elbow: .9, fore: .2, wrist: .85, flex: .2 },
  torsoDetail: (c, S, D, T, G) => NL.lufTorso(c, S, D, T, G),
  haori: { col: NL.col.vest, lining: NL.col.vestLin, len: .14, sleeves: false, hem: 'none', kanji: null, open: .9, flare: .1, collarLen: .3 },
  obi: { col: NL.col.sash, v0: -.02, v1: .06 },
  hakama: { col: NL.col.shorts, r0: .108, r1: .11, r2: .1, len: .04, pleats: false, ties: false, lowerCol: NL.col.cuff, lowerV: .86, shinCol: NL.col.lSkin },
  feet: { col: NL.col.lSkin, sandal: true, sole: '#a07a46', w: 1.0 },
  face: {
    eye: { w: 1.12, h: .44, irisR: .36, irisCol: NL.col.lEye, irisLight: '#7a5a4a', irisDark: '#080606', tilt: -.02, thick: 1.3, flick: .03, lashes: true, crease: false, pupilR: .45, lidShade: '#8a5a48' },
    eyeSize: .42, eyeY: -.2, defaultExpr: 'shishi', brow: { browW: .08, browY: .04, browCol: '#141218' }, headShape: { jaw: .9, chin: .95, width: .96 }, noseK: .8,
    mouth: { mouthW: 1.1, teethN: 8 }, mouthSize: .3, mouthY: -.75,
    hair: { col: NL.col.lHair, shadeCol: NL.col.lHairShade, gloss: true, glossCol: NL.col.lHairGloss, springK: 38, springC: 5, cap: { front: .62, side: .05, back: -.85 }, locks: NL.luffyHair() },
    markings: (c, HM, e, lod, D) => { nlLuffyScar(c, HM, D); if (e.blood && window.hyBloodMouth) hyBloodMouth(c, HM, e); },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => NL.lufHeadParts(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['shishi', 'bigGrin', 'determined', 'yell', 'calm', 'angry', 'shock', 'pain', 'laugh', 'serious', 'sorrow', 'surprised', 'exhausted', 'eyesClosed'],
  extras: (S, D, F, t, parts, opt) => NL.lufExtras(S, D, F, t, parts, opt),
  forms: {
    base: {},
    gear3: {},
    wounded: { wounds: 2, haori: { col: NL.col.vest, lining: NL.col.vestLin, len: .12, sleeves: false, hem: 'none', kanji: null, open: .95, flare: .15, collarLen: .3, torn: .7 } },
    gear2: { g2: true, skin: NL.col.g2, skinShade: NL.col.g2Shade, kosode: NL.col.g2, armSkin: NL.col.g2, handSkin: NL.col.g2, neckSkin: NL.col.g2, legSkin: NL.col.g2, steamDefault: 1,
      hakama: { col: NL.col.shorts, r0: .108, r1: .11, r2: .1, len: .04, pleats: false, ties: false, lowerCol: NL.col.cuff, lowerV: .86, shinCol: NL.col.g2 }, feet: { col: NL.col.g2, sandal: true, sole: '#a07a46', w: 1.0 } },
    gear4: { g4: true, h: 1.95, body: { width: 1.3, shoulders: 1.45, depth: 1.25, limbs: 1.45, legs: .95, neck: .8 }, arm: { delt: 1.5, bicep: .5, elbow: .8, fore: .5, wrist: .75, flex: .3 },
      armSkin: NL.col.haki, handSkin: NL.col.haki, legSkin: NL.col.haki, steamDefault: .8, hakiArms: true,
      hakama: { col: NL.col.shorts, r0: .13, r1: .13, r2: .12, len: .04, pleats: false, ties: false, lowerCol: NL.col.cuff, lowerV: .86, shinCol: NL.col.haki }, feet: { col: NL.col.haki, sandal: true, sole: '#a07a46', w: 1.15 } },
    gear5: { g5: true, lineK: 1.55, skin: '#ffd6b4', skinShade: '#e8a080', kosode: '#ffd6b4', armSkin: '#ffd6b4', handSkin: '#ffd6b4', neckSkin: '#ffd6b4', legSkin: '#ffd6b4', cloudBoa: 1,
      haori: { col: NL.col.g5, lining: NL.col.g5Shade, len: .16, sleeves: false, hem: 'none', kanji: null, open: .92, flare: .18, collarLen: .3 }, obi: { col: '#a46ad8', v0: -.02, v1: .06 },
      hakama: { col: NL.col.g5, r0: .11, r1: .115, r2: .105, len: .04, pleats: false, ties: false, lowerCol: '#ffffff', lowerV: .86, shinCol: '#ffd6b4' }, feet: { col: '#ffd6b4', sandal: true, sole: '#c8a070', w: 1.0 } },
  },
});
(function () {
  const L = CAST.luffy, f0 = L.face;
  L.forms.gear4.face = Object.assign({}, f0, { brow: Object.assign({}, f0.brow, { browW: .1 }), hair: Object.assign({}, f0.hair, { locks: NL.luffyHair({ up: 1 }) }), defaultExpr: 'yell' });
  L.forms.gear5.face = Object.assign({}, f0, { eyeSize: .5, defaultExpr: 'nikaGrin', eye: Object.assign({}, f0.eye, { irisCol: NL.col.g5Eye, irisLight: '#ffb0a0', irisDark: '#7a0a10', irisRing: '#ffe0c0', thick: 1.7, pupilR: .38, crease: false }),
    brow: Object.assign({}, f0.brow, { browCol: '#e8e8f4', browW: .1 }), mouth: { mouthW: 1.25, teethN: 10 }, mouthSize: .36,
    hair: { col: NL.col.g5, shadeCol: '#c4c8e0', gloss: true, glossCol: '#ffffff', springK: 26, springC: 4, cap: { front: .5, side: .02, back: -.85 }, locks: NL.nikaHair() } });
  L.forms.gear5_wounded = Object.assign({}, L.forms.gear5, { wounds: 2 }); L.forms.gear5_wounded.face = L.forms.gear5.face;
  L.forms.gear4_wounded = Object.assign({}, L.forms.gear4, { wounds: 2 }); L.forms.gear4_wounded.face = L.forms.gear4.face;
  L.forms.gear2_wounded = Object.assign({}, L.forms.gear2, { wounds: 2 });
})();
CAST.luffy.drawHead = stdHead(CAST.luffy);
NL.lufHeadParts = (S, D, F, t, parts, opt, HM, e, zc) => {
  const p = S.pose, hat = p.hatOff ? 0 : p.hat == null ? (D.hatDefault != null ? D.hatDefault : (D.g4 || D.g5 ? 0 : 1)) : p.hat;
  if (hat && hat !== 'back') parts.push({ z: zc - HM.r * 1.15, fn: c => { const fr = NL.hatFrame(S, D, p, HM); nlStrawHat(c, fr, fr.R, opt); } });
  const pop = p.eyePop != null ? p.eyePop : (D.g5 ? .0 : 0);
  if (pop > .02 && opt.mode !== 'flat' && !LIGHT.override) parts.push({ z: zc - HM.r * 1.2, fn: c => {   // Gear 5 cartoon eyes bulging out of the head
    if (vDot(HM.M[2], toCam(HM.c)) < .1) return; for (const sg of [-1, 1]) { const q = project(vMad(HM.at(sg * .45, -.15), HM.M[2], HM.r * (.2 + .9 * pop))), s = q ? q.s : 0; if (!q) continue; const R = HM.r * s * (.42 + .35 * pop);
      c.fillStyle = '#ffffff'; c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(2, R * .12); c.beginPath(); c.ellipse(q.x, q.y, R * .9, R, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = NL.col.g5Eye; c.beginPath(); c.arc(q.x, q.y + R * .1, R * .45, 0, TAU); c.fill(); c.fillStyle = '#100808'; c.beginPath(); c.arc(q.x, q.y + R * .1, R * .22, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(q.x - R * .18, q.y - R * .1, R * .12, 0, TAU); c.fill(); } } });
};
NL.lufExtras = (S, D, F, t, parts, opt) => {
  const p = S.pose, k = S.B.h / 1.8;
  const hat = p.hat == null ? (D.hatDefault != null ? D.hatDefault : (D.g4 || D.g5 ? 0 : 1)) : p.hat;
  if (hat === 'back') { const HM = headModel(S, D), fr = NL.hatFrame(S, D, p, HM); parts.push({ z: camDepth(fr.c) + .03, fn: c => nlStrawHat(c, fr, fr.R, opt) }); }
  for (const key of ['stretch', 'stretch2']) { const st = p[key]; if (st && st.side) NL.rubberArm(S, D, F, t, parts, opt, st); }
  const steam = p.steam != null ? p.steam : (D.steamDefault || 0);
  if (steam > .01 && opt.mode !== 'flat') parts.push({ z: camDepth(S.J.abd) - .35, fn: c => { if (!LIGHT.override && typeof fxGearSteam === 'function') fxGearSteam(c, F, t, { k: steam, S, g4: !!D.g4 }); } });
  if ((D.cloudBoa || p.boa) && opt.mode !== 'flat') parts.push({ z: camDepth(S.J.neck) - .06, fn: c => { if (!LIGHT.override && typeof fxCloudBoa === 'function') fxCloudBoa(c, S, t, { k: p.boa != null ? p.boa : D.cloudBoa }); } });
  if (D.g4 || p.hakiMarks) parts.push({ z: camDepth(S.J.abd) - .2, fn: c => { if (opt.mode !== 'flat' && !LIGHT.override) NL.g4Marks(c, S, D); } });
  for (const sd of ['L', 'R']) if (D.g4) { const zA = camDepth(vLerp(S.J['el' + sd], S.J['wr' + sd], .3)), zT = camDepth(vLerp(S.J.pelvis, S.J.neck, .5));
    parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode !== 'flat' && window.hyArmLines && !LIGHT.override) hyArmLines(c, S, D, sd, { ink: rgba('#6a5a8a', .8) }); } }); }
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0));
};
// Gear 4: red flame marks on the black haki forearms and shins
NL.g4Marks = (c, S, D) => { const J = S.J, k = S.B.h / 1.8;
  for (const [a, b, r] of [[J.elL, J.wrL, S.B.limbR.fa], [J.elR, J.wrR, S.B.limbR.fa], [J.knL, J.anL, S.B.limbR.sh], [J.knR, J.anR, S.B.limbR.sh]]) {
    if (!a || !b) continue; const pa = project(a), pb = project(b); if (!pa || !pb) continue; const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = r * pa.s * 1.05;
    c.strokeStyle = NL.col.g4red; c.lineWidth = Math.max(1.5, w * .22); c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const u = .2 + i * .25; c.beginPath(); c.moveTo(pa.x + dx * u - nx * w * .7, pa.y + dy * u - ny * w * .7); c.quadraticCurveTo(pa.x + dx * (u + .08), pa.y + dy * (u + .08), pa.x + dx * (u + .02) + nx * w * .7, pa.y + dy * (u + .02) + ny * w * .7); c.stroke(); } } };
// dynamic design: armament haki on chosen arms (pose.haki 'L'|'R'|'both')
CAST.luffy.dynDesign = (D, p) => { if (!p.haki) return D; const key = '_haki_' + p.haki; if (D[key]) return D[key];
  return (D[key] = Object.assign({}, D, { handSkin: NL.col.haki, armSkin: p.haki === 'both' || D.hakiArms ? NL.col.haki : D.armSkin, hakiSide: p.haki })); };
// rubber arm: normal arm hidden (armOff), long tube from the shoulder to 'to' with a fist on the end
NL.rubberArm = (S, D, F, t, parts, opt, st) => {
  const sd = st.side, k = S.B.h / 1.8, sh = S.J['sh' + sd]; (S._armOff = S._armOff || {})[sd] = 1;
  const kk = clamp(st.k == null ? 1 : st.k, 0, 1.2), natural = vAdd(sh, vMul(vNorm(vSub(st.to || vAdd(sh, [0, 0, 1]), sh)), .6 * k)), end = vLerp(natural, st.to || natural, kk);
  const gi = st.giant || 0, wave = st.wave || 0, mid = vLerp(sh, end, .5), dist = vDist(sh, end), ax = vNorm(vSub(end, sh)); let side = vNorm(vCross(ax, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0];
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; let q = vLerp(sh, end, u); const wob = Math.sin(u * Math.PI) * (wave * dist * .18 * Math.sin(t * 9 + u * 7) + (st.sag || 0) * dist); q = vAdd(q, vAdd(vMul(side, wob), [0, -Math.sin(u * Math.PI) * (st.droop || 0) * dist, 0])); pts.push(q); }
  const r0 = S.B.limbR.ua * (1 + gi * 2.2), r1 = S.B.limbR.fa * (1 + gi * 3.5) * (1 - .25 * Math.min(1, dist / 3) * (1 - gi)), fistR = .07 * k * (st.fist || 1) * (1 + gi * 5.5) * (D.g4 ? 2.2 : 1);
  const haki = st.haki != null ? st.haki : (D.hakiSide === sd || D.hakiSide === 'both' || D.hakiArms ? 1 : 0), col = haki > .5 ? NL.col.haki : (D.armSkin || D.skin);
  const fc = vMad(pts[pts.length - 1], ax, fistR * .6);
  parts.push({ z: Math.min(camDepth(mid), camDepth(sh)) - .005, fn: c => {
    const surf = sTube(pts, v => lerp(r0, r1, v) * (1 + .12 * Math.sin(v * Math.PI)), side, 14, 16, { round: .3 });
    drawSurf(c, sampleSurf(surf), Object.assign({ col, shade: .1, borders: { v0: false, v1: false } }, opt.surf || {}));
  } });
  parts.push({ z: camDepth(fc) - .01, fn: c => NL.drawFist(c, fc, ax, fistR, col, opt, haki, gi, D) });
};
// stylised fist: knuckle ball + finger rolls + thumb (reads at any size)
NL.drawFist = (c, p, ax, R, col, opt, haki, gi, D) => {
  const up0 = Math.abs(ax[1]) > .9 ? [1, 0, 0] : [0, 1, 0], rt = vNorm(vCross(ax, up0)), up = vCross(rt, ax);
  const sph = { nu: 16, nv: 10, wrapU: true, fn: (u, v) => { const a = u * TAU, b = (v - .5) * Math.PI; return vAdd(p, vAdd(vMul(ax, Math.sin(b) * R * .9), vAdd(vMul(rt, Math.cos(b) * Math.cos(a) * R), vMul(up, Math.cos(b) * Math.sin(a) * R * 1.1)))); } };
  const G = sampleSurf(sph); drawSurf(c, G, Object.assign({ col, shade: .15, borders: {} }, opt.surf || {}));
  if (opt.mode === 'flat' || LIGHT.override) return; const s = gridScale(G), ink = haki ? rgba('#8a7ab0', .9) : LIGHT.ink;
  for (let i = 0; i < 4; i++) { const yy = (i - 1.5) * .48; const pts = []; for (let j = 0; j <= 6; j++) { const a = lerp(-.9, .9, j / 6); pts.push(proj2(vAdd(p, vAdd(vMul(ax, R * (.55 + .35 * Math.cos(a))), vAdd(vMul(up, R * yy), vMul(rt, R * Math.sin(a) * .95)))))); }
    if (vDot(ax, toCam(p)) < .4 || true) inkPts(c, pts, lineW(s, .55), ink, [.3, .3]); }
  if (haki) { const q = project(vAdd(p, vMul(up, R * .5))); if (q) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, R * q.s * .6, '#b8a0ff', .25); c.restore(); } }
};
// ------------------------------------------------------------------------------------------------------------- body tweaks
CAST.naruto._body = (function () { const B = makeBody(CAST.naruto); B.hand *= 1.05; return B; })();
CAST.luffy._body = (function () { const B = makeBody(CAST.luffy); B.hand *= 1.08; return B; })();
CAST.luffy.forms.gear4._body = (function () { const D = Object.assign({}, CAST.luffy, CAST.luffy.forms.gear4); const B = makeBody(D); const k = B.h / 1.8; B.ring.waist[0] *= .85; B.ring.shoulder[1] *= 1.15; B.trapR = [.12 * k * 1.4, .08 * k * 1.3]; B.trapUp = .05 * k; B.hand *= 1.8; B.limbR.neck *= 1.2; B.neck *= .6; return B; })();
// ------------------------------------------------------------------------------------------------------------- poses
Object.assign(POSES, {
  // ---- NARUTO
  nar_stand: { sp: .02, hp: -.02, aL: [.15, .45, -.2], eL: .3, aR: [.15, .45, .2], eR: .3, hL: 'relax', hR: 'relax', lL: [.04, .12, .2], kL: .06, lR: [-.02, .12, -.2], kR: .04, face: expr('determined') },
  nar_ready: { sp: .2, st: .3, hp: -.1, aL: [1.1, .2, 0], eL: 1.5, hL: 'fist', aR: [.9, .5, 0], eR: 1.8, hR: 'fist', lL: [.45, .3, .3], kL: .7, lR: [-.2, .3, -.3], kR: .5, face: expr('nindo') },
  nar_kunai: { sp: .3, st: .2, hp: -.1, aL: [1.2, .1, 0], eL: 1.0, hL: 'fist', aR: [.6, .9, 0], eR: 1.3, hR: 'grip', lL: [.6, .3, .3], kL: .9, lR: [-.2, .35, -.3], kR: .7, face: expr('nindo') },
  nar_sign: { sp: .05, hp: .05, aL: [1.0, -.35, 0], eL: 1.75, hL: 'sign', aR: [1.0, -.35, 0], eR: 1.75, hR: 'sign', wL: [.2, 0], wR: [.2, 0], lL: [.15, .25, .2], kL: .2, lR: [.1, .25, -.2], kR: .15, face: expr('nindo') },
  nar_signCross: { sp: .05, hp: .05, aL: [1.05, -.55, .3], eL: 1.6, hL: 'sign', aR: [1.05, -.45, -.3], eR: 1.7, hR: 'sign', lL: [.2, .3, .2], kL: .25, lR: [.1, .3, -.2], kR: .2, face: expr('yell') },
  nar_rasHold: { sp: .25, st: .35, hp: .1, aR: [1.2, .25, 0], eR: .9, hR: 'open', wR: [-.6, 0], aL: [1.1, -.25, 0], eL: 1.2, hL: 'claw', lL: [.55, .3, .3], kL: .8, lR: [-.25, .3, -.3], kR: .55, face: expr('nindo') },
  nar_rasThrust: { sp: .5, st: -.5, hp: .0, aR: [1.55, .0, 0], eR: .05, hR: 'open', wR: [-.3, 0], aL: [.8, 1.8, 0], eL: 1.0, hL: 'fist', lL: [1.0, .25, .2], kL: 1.0, lR: [-.75, .25, -.2], kR: .15, fR: .4, face: expr('yell') },
  nar_rasRaise: { sp: -.15, hp: -.25, aR: [2.95, .2, 0], eR: .15, hR: 'open', wR: [-.9, 0], aL: [.9, .6, 0], eL: 1.1, hL: 'fist', lL: [.3, .3, .3], kL: .45, lR: [-.1, .3, -.3], kR: .3, face: expr('yell') },
  nar_rasThrow: { sp: .45, st: -.7, hp: -.05, aR: [1.9, -.1, 0], eR: .1, hR: 'open', aL: [.6, 1.6, 0], eL: .9, hL: 'fist', lL: [1.0, .25, .2], kL: 1.0, lR: [-.7, .25, -.2], kR: .2, fR: .4, face: expr('yell') },
  nar_rasBoth: { sp: .3, hp: .05, aL: [1.35, -.15, 0], eL: .5, hL: 'claw', aR: [1.35, -.15, 0], eR: .5, hR: 'claw', lL: [.55, .35, .3], kL: .85, lR: [-.3, .35, -.3], kR: .6, face: expr('yell') },
  nar_punchWind: { sp: .15, st: .8, hp: -.1, aR: [1.0, 2.3, 0], eR: 2.0, hR: 'fist', aL: [1.3, .2, 0], eL: .8, hL: 'fist', lL: [.55, .25, .2], kL: .7, lR: [-.35, .25, -.2], kR: .4, face: expr('yell') },
  nar_punch: { sp: .4, st: -.75, hp: .05, aR: [1.55, -.02, 0], eR: 0, hR: 'fist', aL: [.7, 2.4, 0], eL: 1.5, hL: 'fist', lL: [1.0, .25, .2], kL: 1.0, lR: [-.8, .25, -.2], kR: .15, fR: .5, face: expr('yell') },
  nar_uppercut: { sp: -.15, st: -.5, hp: -.3, aR: [2.6, -.2, 0], eR: 1.0, hR: 'fist', aL: [.7, 1.5, 0], eL: 1.6, hL: 'fist', lL: [.6, .18, .2], kL: .5, lR: [-.5, .18, -.2], kR: .1, fR: .6, face: expr('yell') },
  nar_kickWind: { sp: -.05, st: .4, aL: [.9, 1.0, 0], eL: 1.1, aR: [.8, .9, 0], eR: 1.2, hL: 'fist', hR: 'fist', lR: [1.4, .3, 0], kR: 2.1, lL: [.05, .12, 0], kL: .25, face: expr('nindo') },
  nar_kick: { sp: -.4, ss: -.3, st: -.6, hp: .15, aL: [1.1, 1.3, 0], eL: .7, aR: [1.0, 1.5, 0], eR: .5, hL: 'fist', hR: 'fist', lR: [1.55, 1.05, -.4], kR: .05, fR: .55, lL: [-.1, .15, .4], kL: .2, face: expr('yell') },
  nar_run1: { sp: .75, hp: -.4, aL: [1.1, 2.75, 0], eL: .25, aR: [1.15, 2.7, 0], eR: .25, hL: 'flat', hR: 'flat', lL: [1.15, .1, 0], kL: 1.3, lR: [-.6, .1, 0], kR: 1.5, fR: .6, face: expr('nindo') },
  nar_run2: { sp: .75, hp: -.4, aL: [1.15, 2.7, 0], eL: .25, aR: [1.1, 2.75, 0], eR: .25, hL: 'flat', hR: 'flat', lR: [1.15, .1, 0], kR: 1.3, lL: [-.6, .1, 0], kL: 1.5, fL: .6, face: expr('nindo') },
  nar_leap: { sp: .3, hp: -.3, aL: [2.2, .8, 0], eL: .5, aR: [1.6, .3, 0], eR: 1.2, hL: 'open', hR: 'fist', lL: [1.4, .2, 0], kL: 2.0, lR: [.4, .2, 0], kR: 1.2, ground: false, face: expr('yell') },
  nar_land: { sp: .8, hp: -.4, aL: [.7, .9, 0], eL: .4, hL: 'flat', aR: [1.0, 1.2, 0], eR: .3, hR: 'open', lL: [1.4, .45, .2], kL: 2.2, lR: [.3, .45, -.2], kR: 2.1, fR: 1.0, face: expr('nindo') },
  nar_thumbsUp: { sp: -.04, hp: -.05, aR: [1.4, .3, 0], eR: 1.2, hR: 'fist', wR: [-.2, -1.2], aL: [.2, .5, 0], eL: .5, hL: 'fist', lL: [.05, .15, .2], kL: .06, lR: [-.03, .15, -.2], kR: .04, face: expr('foxGrin') },
  nar_point: { sp: .0, st: -.25, hp: -.08, aR: [1.55, .15, 0], eR: .05, hR: 'point', aL: [.2, .6, 0], eL: .9, hL: 'fist', lL: [.15, .2, .2], kL: .15, lR: [-.1, .2, -.2], kR: .1, face: expr('nindo') },
  nar_block: { sp: .1, st: .2, hp: .2, aL: [1.4, -.25, 0], eL: 1.9, hL: 'fist', aR: [1.3, -.3, 0], eR: 2.0, hR: 'fist', lL: [.4, .3, .2], kL: .6, lR: [-.3, .3, -.2], kR: .45, face: expr('pain') },
  nar_hurt: { sp: .45, ss: .15, hp: .3, hr: .12, aL: [.7, -.5, 0], eL: 1.6, hL: 'claw', aR: [.5, .7, 0], eR: .6, hR: 'open', lL: [.5, .25, .2], kL: .8, lR: [-.2, .25, -.2], kR: .55, face: expr('pain') },
  nar_knockback: { sp: -.5, hp: -.5, aL: [1.9, 1.3, 0], eL: .4, hL: 'open', aR: [1.7, 1.4, 0], eR: .6, hR: 'open', lL: [.9, .25, 0], kL: .9, lR: [.5, .25, 0], kR: 1.2, ground: false, face: expr('pain') },
  nar_kneel: { sp: .5, hp: .25, aL: [.6, .2, 0], eL: .3, hL: 'flat', aR: [.9, .5, 0], eR: 1.3, hR: 'fist', lL: [1.5, .25, .1], kL: 1.7, lR: [.25, .25, 0], kR: 2.5, fR: 1.1, face: expr('exhausted') },
  nar_rise: { sp: .4, hp: -.1, aL: [.5, .4, 0], eL: .5, hL: 'fist', aR: [.6, .5, 0], eR: .9, hR: 'fist', lL: [1.0, .25, .1], kL: 1.3, lR: [.1, .25, 0], kR: .6, face: expr('nindo') },
  nar_meditate: { sp: .05, hp: .05, aL: [.65, -.1, 0], eL: 1.8, hL: 'fist', aR: [.65, -.1, 0], eR: 1.8, hR: 'flat', lL: [1.5, .9, -1.0], kL: 2.6, lR: [1.5, .9, 1.0], kR: 2.6, ground: false, face: expr('eyesClosed') },
  nar_grin: { sp: -.05, hp: -.1, aL: [.3, .9, 0], eL: 2.4, hL: 'fist', aR: [.3, .9, 0], eR: 2.4, hR: 'fist', lL: [.05, .2, .2], kL: .06, lR: [-.03, .2, -.2], kR: .04, face: expr('foxGrin') },
  nar_headScratch: { sp: 0, hp: .05, hr: .1, aR: [2.5, .9, 0], eR: 2.2, hR: 'claw', aL: [.2, .5, 0], eL: .4, hL: 'relax', lL: [.05, .15, .2], kL: .06, lR: [-.03, .15, -.2], kR: .04, face: expr('foxGrin') },
  nar_shout: { sp: -.25, hp: -.45, aL: [.6, 1.4, 0], eL: 1.0, hL: 'fist', aR: [.6, 1.4, 0], eR: 1.0, hR: 'fist', lL: [.3, .35, .2], kL: .45, lR: [.3, .35, -.2], kR: .45, face: expr('yell') },
  nar_reach: { sp: .3, hp: .0, aR: [1.55, .05, 0], eR: .15, hR: 'open', aL: [.4, .5, 0], eL: .6, hL: 'relax', lL: [.5, .2, .2], kL: .4, lR: [-.3, .2, -.2], kR: .2, face: expr('determined') },
  nar_fall: { sp: -.55, hp: -.5, aL: [2.2, 1.0, 0], eL: .4, aR: [1.9, 1.1, 0], eR: .6, hL: 'open', hR: 'open', lL: [.8, .2, 0], kL: .6, lR: [.4, .2, 0], kR: 1.0, ground: false, face: expr('pain') },
  // ---- LUFFY
  luf_stand: { sp: -.02, hp: -.05, aL: [.2, .55, -.2], eL: .3, aR: [.2, .55, .2], eR: .3, hL: 'relax', hR: 'relax', lL: [.05, .2, .3], kL: .08, lR: [-.02, .2, -.3], kR: .05, face: expr('shishi') },
  luf_ready: { sp: .25, st: .3, hp: -.15, aL: [1.0, .3, 0], eL: 1.6, hL: 'fist', aR: [.8, .6, 0], eR: 1.9, hR: 'fist', lL: [.6, .4, .4], kL: .95, lR: [-.2, .4, -.4], kR: .7, face: expr('determined') },
  luf_hips: { sp: -.12, hp: -.2, aL: [.55, 1.35, 0], eL: 1.9, hL: 'fist', aR: [.55, 1.35, 0], eR: 1.9, hR: 'fist', lL: [.06, .25, .3], kL: .06, lR: [-.02, .25, -.3], kR: .04, face: expr('bigGrin') },
  luf_laugh: { sp: -.3, hp: -.6, aL: [.55, 1.35, 0], eL: 1.9, hL: 'fist', aR: [.55, 1.35, 0], eR: 1.9, hR: 'fist', lL: [.1, .25, .3], kL: .1, lR: [-.02, .25, -.3], kR: .05, face: expr('laugh') },
  luf_hatHold: { sp: .05, hp: .15, aR: [2.2, .2, 0], eR: 2.1, hR: 'claw', aL: [.25, .5, 0], eL: .4, hL: 'fist', lL: [.1, .2, .3], kL: .1, lR: [-.05, .2, -.3], kR: .06, hatTilt: .25, face: expr('serious') },
  luf_pistolWind: { sp: .1, st: .9, hp: -.1, aR: [1.4, 2.6, 0], eR: .2, hR: 'fist', aL: [1.2, .1, 0], eL: .7, hL: 'open', lL: [.6, .3, .3], kL: .8, lR: [-.35, .3, -.3], kR: .45, face: expr('yell') },
  luf_pistol: { sp: .35, st: -.7, hp: .0, aR: [1.55, -.02, 0], eR: 0, hR: 'fist', aL: [.8, 2.3, 0], eL: 1.4, hL: 'fist', lL: [1.0, .3, .3], kL: 1.0, lR: [-.8, .3, -.3], kR: .15, fR: .5, face: expr('yell') },
  luf_gatling: { sp: .35, hp: -.05, aL: [1.5, .1, 0], eL: .4, hL: 'fist', aR: [1.5, .1, 0], eR: .4, hR: 'fist', lL: [.7, .45, .4], kL: .95, lR: [-.3, .45, -.4], kR: .7, face: expr('yell') },
  luf_bazookaWind: { sp: -.05, st: 0, hp: -.1, aL: [1.3, 2.4, 0], eL: .3, hL: 'flat', aR: [1.3, 2.4, 0], eR: .3, hR: 'flat', wL: [-.9, 0], wR: [-.9, 0], lL: [.55, .4, .3], kL: .8, lR: [-.2, .4, -.3], kR: .6, face: expr('yell') },
  luf_bazooka: { sp: .35, hp: .0, aL: [1.5, -.1, 0], eL: .0, hL: 'flat', aR: [1.5, -.1, 0], eR: .0, hR: 'flat', wL: [-1.2, 0], wR: [-1.2, 0], lL: [.95, .35, .3], kL: .9, lR: [-.7, .35, -.3], kR: .2, fR: .5, face: expr('yell') },
  luf_gear2: { sp: .55, hp: -.25, aL: [.55, .1, 0], eL: .5, hL: 'flat', aR: [.6, .9, 0], eR: 1.4, hR: 'fist', lL: [1.25, .35, .2], kL: 1.9, lR: [.2, .35, -.2], kR: 1.6, fR: .8, face: expr('serious') },
  luf_thumbBite: { sp: .1, hp: .2, aR: [1.2, -.4, 0], eR: 2.6, hR: 'fist', wR: [.3, -1.0], aL: [.4, .6, 0], eL: .6, hL: 'fist', lL: [.3, .3, .3], kL: .4, lR: [-.1, .3, -.3], kR: .25, face: expr('serious', { mouth: 'o', mouthOpen: .5 }) },
  luf_kickWind: { sp: -.1, st: .5, aL: [.9, 1.1, 0], eL: 1.0, aR: [.8, 1.0, 0], eR: 1.1, hL: 'fist', hR: 'fist', lR: [1.5, .35, 0], kR: 2.2, lL: [.05, .15, 0], kL: .25, face: expr('yell') },
  luf_kick: { sp: -.45, ss: -.3, st: -.6, hp: .15, aL: [1.1, 1.3, 0], eL: .7, aR: [1.0, 1.5, 0], eR: .5, hL: 'fist', hR: 'fist', lR: [1.6, 1.0, -.4], kR: .02, fR: .55, lL: [-.1, .15, .4], kL: .2, face: expr('yell') },
  luf_stampWind: { sp: -.1, hp: -.05, aL: [1.0, 1.4, 0], eL: .6, aR: [1.0, 1.4, 0], eR: .6, hL: 'fist', hR: 'fist', lR: [1.7, .1, 0], kR: 2.4, lL: [.05, .15, 0], kL: .2, face: expr('yell') },
  luf_stamp: { sp: .25, hp: .05, aL: [1.1, 1.6, 0], eL: .4, aR: [1.1, 1.6, 0], eR: .4, hL: 'fist', hR: 'fist', lR: [1.55, .05, 0], kR: .02, fR: -.4, lL: [-.15, .15, 0], kL: .3, face: expr('yell') },
  luf_leap: { sp: .25, hp: -.35, aL: [2.6, .7, 0], eL: .4, aR: [2.4, .9, 0], eR: .6, hL: 'open', hR: 'fist', lL: [1.5, .3, 0], kL: 2.1, lR: [.6, .3, 0], kR: 1.5, ground: false, face: expr('yell') },
  luf_land: { sp: .8, hp: -.4, aL: [.8, 1.1, 0], eL: .4, hL: 'flat', aR: [.9, 1.2, 0], eR: .4, hR: 'flat', lL: [1.45, .55, .3], kL: 2.2, lR: [.35, .55, -.3], kR: 2.1, fR: 1.0, face: expr('determined') },
  luf_hurt: { sp: .5, ss: -.15, hp: .3, hr: -.12, aL: [.6, -.4, 0], eL: 1.5, hL: 'claw', aR: [.45, .7, 0], eR: .6, hR: 'open', lL: [.5, .25, .2], kL: .7, lR: [-.2, .25, -.2], kR: .5, face: expr('pain') },
  luf_knockback: { sp: -.5, hp: -.55, aL: [2.0, 1.3, 0], eL: .4, hL: 'open', aR: [1.8, 1.4, 0], eR: .6, hR: 'open', lL: [.9, .3, 0], kL: 1.0, lR: [.5, .3, 0], kR: 1.3, ground: false, face: expr('pain') },
  luf_kneel: { sp: .5, hp: .3, aL: [.6, .2, 0], eL: .3, hL: 'flat', aR: [.9, .5, 0], eR: 1.3, hR: 'fist', lL: [1.5, .3, .1], kL: 1.7, lR: [.25, .3, 0], kR: 2.5, fR: 1.1, face: expr('exhausted') },
  luf_rise: { sp: .4, hp: -.15, aL: [.5, .4, 0], eL: .5, hL: 'fist', aR: [.6, .5, 0], eR: .9, hR: 'fist', lL: [1.0, .3, .1], kL: 1.3, lR: [.1, .3, 0], kR: .6, face: expr('determined') },
  luf_point: { sp: .0, st: -.25, hp: -.1, aR: [1.55, .15, 0], eR: .05, hR: 'point', aL: [.55, 1.35, 0], eL: 1.9, hL: 'fist', lL: [.15, .25, .3], kL: .15, lR: [-.1, .25, -.3], kR: .1, face: expr('determined') },
  luf_shout: { sp: -.3, hp: -.55, aL: [.55, 1.45, 0], eL: 1.0, hL: 'fist', aR: [.55, 1.45, 0], eR: 1.0, hR: 'fist', lL: [.35, .4, .3], kL: .5, lR: [.35, .4, -.3], kR: .5, face: expr('yell') },
  luf_bounce: { sp: .45, hp: -.3, aL: [.9, .9, 0], eL: 1.6, hL: 'fist', aR: [.9, .9, 0], eR: 1.6, hR: 'fist', lL: [1.0, .5, .3], kL: 1.6, lR: [.9, .5, -.3], kR: 1.6, face: expr('yell') },
  luf_kongWind: { sp: .1, st: .9, hp: -.15, aR: [1.0, 2.6, 0], eR: 1.8, hR: 'fist', aL: [1.3, .1, 0], eL: .9, hL: 'fist', lL: [.8, .45, .3], kL: 1.2, lR: [.2, .45, -.3], kR: 1.0, face: expr('yell') },
  luf_nikaDance: { sp: -.1, ss: .15, hp: -.25, hr: .2, aL: [2.5, 1.2, .5], eL: 1.4, hL: 'open', aR: [2.2, 1.4, -.5], eR: 1.8, hR: 'open', lL: [.6, .4, .6], kL: 1.1, lR: [-.2, .3, -.5], kR: .4, face: expr('nikaLaugh') },
  luf_nikaDance2: { sp: -.1, ss: -.15, hp: -.25, hr: -.2, aL: [2.2, 1.4, .5], eL: 1.8, hL: 'open', aR: [2.5, 1.2, -.5], eR: 1.4, hR: 'open', lR: [.6, .4, -.6], kR: 1.1, lL: [-.2, .3, .5], kL: .4, face: expr('nikaLaugh') },
  luf_nikaGrab: { sp: .2, hp: -.1, aL: [1.6, .6, 0], eL: .4, hL: 'claw', aR: [1.6, .6, 0], eR: .4, hR: 'claw', lL: [.5, .4, .3], kL: .7, lR: [-.2, .4, -.3], kR: .4, face: expr('nikaGrin') },
  luf_nikaHammerWind: { sp: -.35, hp: -.4, aL: [2.95, .2, 0], eL: .2, hL: 'fist', aR: [2.95, .2, 0], eR: .2, hR: 'fist', lL: [.4, .4, .3], kL: .5, lR: [.2, .4, -.3], kR: .4, face: expr('nikaGrin') },
  luf_nikaHammer: { sp: .9, hp: -.35, aL: [1.2, -.05, 0], eL: .1, hL: 'fist', aR: [1.2, -.05, 0], eR: .1, hR: 'fist', lL: [1.2, .4, .3], kL: 1.5, lR: [1.0, .4, -.3], kR: 1.4, face: expr('nikaLaugh') },
  luf_fall: { sp: -.55, hp: -.5, aL: [2.2, 1.0, 0], eL: .4, aR: [1.9, 1.1, 0], eR: .6, hL: 'open', hR: 'open', lL: [.8, .2, 0], kL: .6, lR: [.4, .2, 0], kR: 1.0, ground: false, face: expr('shock') },
  luf_run1: { sp: .55, hp: -.3, aL: [1.2, -.3, 0], eL: 1.6, aR: [.8, 2.2, 0], eR: 1.2, hL: 'fist', hR: 'fist', lL: [1.15, .1, 0], kL: 1.3, lR: [-.6, .1, 0], kR: 1.5, fR: .6, face: expr('determined') },
  luf_run2: { sp: .55, hp: -.3, aR: [1.2, -.3, 0], eR: 1.6, aL: [.8, 2.2, 0], eL: 1.2, hL: 'fist', hR: 'fist', lR: [1.15, .1, 0], kR: 1.3, lL: [-.6, .1, 0], kL: 1.5, fL: .6, face: expr('determined') },
  luf_armsCross: { sp: -.06, hp: -.12, aL: [.62, -.6, -.5], eL: 2.1, aR: [.58, -.5, .5], eR: 2.15, hL: 'relax', hR: 'relax', lL: [.04, .2, .3], kL: .06, lR: [0, .2, -.3], kR: .05, face: expr('serious') },
});
SIGNATURE.naruto = ['nar_stand', 'nar_ready', 'nar_kunai', 'nar_sign', 'nar_signCross', 'nar_rasHold', 'nar_rasThrust', 'nar_rasRaise', 'nar_rasThrow', 'nar_rasBoth', 'nar_punchWind', 'nar_punch', 'nar_uppercut', 'nar_kickWind', 'nar_kick',
  'nar_run1', 'nar_leap', 'nar_land', 'nar_thumbsUp', 'nar_point', 'nar_block', 'nar_hurt', 'nar_knockback', 'nar_kneel', 'nar_rise', 'nar_meditate', 'nar_grin', 'nar_headScratch', 'nar_shout', 'nar_reach', 'nar_fall'];
SIGNATURE.luffy = ['luf_stand', 'luf_ready', 'luf_hips', 'luf_laugh', 'luf_hatHold', 'luf_pistolWind', 'luf_pistol', 'luf_gatling', 'luf_bazookaWind', 'luf_bazooka', 'luf_gear2', 'luf_thumbBite', 'luf_kickWind', 'luf_kick',
  'luf_stampWind', 'luf_stamp', 'luf_leap', 'luf_land', 'luf_hurt', 'luf_knockback', 'luf_kneel', 'luf_rise', 'luf_point', 'luf_shout', 'luf_bounce', 'luf_kongWind', 'luf_nikaDance', 'luf_nikaGrab', 'luf_nikaHammerWind', 'luf_nikaHammer', 'luf_fall', 'luf_run1', 'luf_armsCross'];
(window.SIGNATURE_FORM = window.SIGNATURE_FORM || {}).naruto = 'base'; SIGNATURE_FORM.luffy = 'base';
NL.narRun = (ph, over) => mixPose(P('nar_run1', over), P('nar_run2', over), .5 - .5 * Math.cos(ph * TAU));
NL.lufRun = (ph, over) => mixPose(P('luf_run1', over), P('luf_run2', over), .5 - .5 * Math.cos(ph * TAU));
NL.nikaDance = (ph, over) => mixPose(P('luf_nikaDance', over), P('luf_nikaDance2', over), .5 - .5 * Math.cos(ph * TAU));
// Gear 4 / Gear 5 bounce: vertical offset + squash for a pose (ph 0..1 per bounce); use: at([x, NL.bounceY(ph, h), z], yaw, P(..., NL.bounceSq(ph)))
NL.bounceY = (ph, h = .6) => { const u = ph % 1; return h * 4 * u * (1 - u); };
NL.bounceSq = (ph, k = .25) => { const u = ph % 1, c = Math.max(0, 1 - Math.min(u, 1 - u) * 8); return { sq: 1 - k * c + k * .6 * (1 - c) * Math.sin(u * Math.PI), ground: false, float: 0 }; };
