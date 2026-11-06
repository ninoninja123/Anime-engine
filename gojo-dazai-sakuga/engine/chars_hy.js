/* engine/chars_hy.js (agent E, project hulk-vs-yujiro) - HULK (Marvel) and YUJIRO HANMA (Baki the Grappler) + Bruce Banner.
   Sources (checked 2026-11-01): en.wikipedia.org "Hulk", "List of Baki the Grappler characters"; search summaries (figure reviews,
   sportskeeda "demon back" anatomy articles).  P's pre/powers.md completes the list.
   HULK: green-skinned giant (here 3.0 m: clearly larger than Yujiro in every two-shot), extreme bulk, small head on a trapezius mound,
     short messy black hair, heavy brow, square jaw, green eyes; torn purple trousers (ragged hem mid-shin), barefoot.
   BANNER: Bruce Banner, ~1.76 m, slim, glasses, untidy dark brown hair, torn lilac shirt + torn grey-brown trousers.
   YUJIRO: 'the strongest creature on Earth', ~1.92-2.0 m (here 2.0 m), extremely muscular; crimson-red hair flaring up and back
     (canon anime colour), thick red brows, narrow sharp eyes with small irises, wide predatory grin; black trousers, black open shirt
     (base) or bare-chested (oni / bruised / bloodied).  'Oni no Se' (Demon Back): the back muscles form a demon's face (pose.oni 0..1).
   FORMS
     hulk  : base | rage (darker green, veins, white glowing eyes, steam; pose.rage 0..1 scales it) | wounded (bruises, cuts, wounds 2) |
             bruised (= wounded, lighter) | banner (Bruce Banner body/height: same figure object can switch form at a transformation cut)
     banner: base | torn (shirt ripped open) ;   CAST.banner also exists as its own character
     yujiro: base (open black shirt) | bare (shirtless, black trousers) | oni (bare + demon back) | calm (= base, relaxed default face) |
             bruised (bare, bruises) | bloodied (bare, blood + cuts, wounds 3)
   POSE FIELDS (interpolate): rage 0..1 (Hulk veins/eye glow/steam), pump 0..1 (all: muscles tense = veins + biceps swell + striations),
     oni 0..1 (Yujiro: demon face on the back, needs the back toward the camera to read), regen 0..1 (Hulk: wounds close), wounds 0..3,
     glasses:false (Banner), shirt:false (Yujiro base form without shirt).                                                          */
'use strict';
var HY = window.HY || {};
window.HY = HY;
HY.col = {
  hulk: '#5ba542', hulkShade: '#2f6526', hulkDeep: '#1e4418', hulkLight: '#8fd16a', hulkRage: '#4a9236', hulkRageShade: '#24521c', hulkHair: '#121a10', hulkHairShade: '#050805', hulkEye: '#b6ff6a', gamma: '#7dff4a',
  pants: '#5b2a86', pantsShade: '#321450', vein: '#2b5a23', veinRage: '#1d4a18',
  yuj: '#d69c72', yujShade: '#8a5638', yujHair: '#7a141a', yujHairShade: '#2a070a', yujHairGloss: '#c42a30', yujEye: '#7a1a14', yujPants: '#141318', yujShirt: '#16151a',
  ban: '#d9b49a', banShade: '#a8826c', banHair: '#5a3d28', banShirt: '#9c8fb4', banPants: '#5b2a86',
};
// ------------------------------------------------------------------------------------------------------------- expressions (usable by everyone)
Object.assign(EXPR, {
  growl: { eye: .7, lid: .5, brow: -.45, browA: .8, pupil: .7, mouth: 'teeth', mouthOpen: .32, mouthW: 1.15, shadow: .15 },
  roar: { eye: 1.05, lid: .55, brow: -.5, browA: .85, pupil: .55, mouth: 'shout', mouthOpen: 1, mouthW: 1.2, shadow: .2, hyVein: 1 },
  awe: { eye: 1.15, lid: -.15, brow: .45, browA: -.3, pupil: 1.05, mouth: 'o', mouthOpen: .25, mouthW: .8 },
  horror: { eye: 1.3, lid: -.2, brow: .6, browA: -.5, pupil: .4, mouth: 'pain', mouthOpen: .55, shock: 1, sweat: 1 },
  disappointed: { eye: .55, lid: -.25, brow: .3, browA: -.45, pupil: 1, mouth: 'frown', mouthW: .9, look: [0, -.2] },
  relish: { eye: .62, lid: .3, brow: -.05, browA: .35, pupil: .6, mouth: 'grin', mouthOpen: .45, mouthW: 1.55, shadow: .25 },
  ecstasy: { eye: 1.05, lid: .1, brow: .25, browA: .1, pupil: .38, mouth: 'laugh', mouthOpen: 1, mouthW: 1.5, shock: .5, shadow: .2 },
  oniGrin: { eye: .55, lid: .45, brow: -.3, browA: .6, pupil: .45, mouth: 'grin', mouthOpen: .3, mouthW: 1.65, shadow: .55, glint: 1 },
});
// ------------------------------------------------------------------------------------------------------------- muscle drawing helpers
// uv patch on the torso (u: 0 front centre, +.25 = character's left side, .5 = back; v: 0 hip .. 1 neck). Filled with alpha by facing.
function hyTorsoPatch(c, T, uvs, col, a = .8, minF = .02) {
  const ring = (u, v) => T.ringAt(v, u * TAU); let mu = 0, mv = 0; for (const q of uvs) { mu += q[0]; mv += q[1]; } mu /= uvs.length; mv /= uvs.length;
  const p = ring(mu, mv), pu = ring(mu + .01, mv), pv = ring(mu, Math.min(1, mv + .01)), n = vNorm(vCross(vSub(pu, p), vSub(pv, p)));
  const f = vDot(n, toCam(p)); if (f < minF) return;
  const sp = projPoly(uvs.map(q => ring(q[0], q[1]))); if (sp.length < 3) return;
  c.save(); c.globalAlpha *= a * clamp((f - minF) * 4, 0, 1); polyPath(c, catmull(sp, true, 3)); c.fillStyle = col; c.fill(); c.restore();
}
// wiggly vein along a limb surface (a->b) on the side facing the camera
function hyVein(c, a, b, r, seed, col, w, o = {}) {
  const ax = vNorm(vSub(b, a)); let u = vNorm(vCross(ax, [0, 1, 0])); if (vLen(vCross(ax, [0, 1, 0])) < .1) u = vNorm(vCross(ax, [1, 0, 0])); const v = vCross(ax, u);
  const camD = toCam(vLerp(a, b, .5)); const base = Math.atan2(vDot(camD, v), vDot(camD, u)) + (hash(seed) - .5) * 1.4;
  const pts = []; for (let i = 0; i <= 10; i++) { const f = lerp(o.f0 || .1, o.f1 || .9, i / 10), an = base + Math.sin(f * 9 + seed) * .35, d = vAdd(vMul(u, Math.cos(an)), vMul(v, Math.sin(an))); const p = vMad(vLerp(a, b, f), d, r * 1.01); if (vDot(d, toCam(p)) > .05) pts.push(proj2(p)); }
  if (pts.length > 2) inkPts(c, pts, w, col, [.3, .4]);
  if (pts.length > 5 && o.branch !== false) { const q = pts[Math.floor(pts.length * .5)], q2 = pts[Math.min(pts.length - 1, Math.floor(pts.length * .8))]; inkPts(c, [q, [lerp(q[0], q2[0], .5) + (hash(seed + 3) - .5) * w * 6, lerp(q[1], q2[1], .5) + w * 2]], w * .7, col, [.1, .6]); }
}
// muscle map on the torso: pecs, abs, serratus, obliques, V-lines (front) + traps, lats, spine (back). o = {k (bulk), shade, ink, line}
function hyMuscles(c, S, D, o = {}) {
  if (LIGHT.override) return;
  const k = S.B.h / 1.8, T = torsoModel(S, D, .004 * k), sh = o.shade || D.skinShade, deep = o.deep || shadeHex(sh, -.25), ink = o.ink || rgba(shadeHex(sh, -.45), .9), s = pxScale(S.J.abd);
  const pump = (S.pose.pump || 0), def = (o.def == null ? 1 : o.def) * (1 + pump * .3), lw = lineW(s, .55) * def;
  const L = (uvs, w = 1, col = ink) => torsoLines(c, S, D, [uvs], col, .55 * w * def, .005);
  for (const sg of [1, -1]) {
    const m = uvs => uvs.map(([u, v]) => [u * sg, v]);
    // pectoral underside shadow (crescent) + outline
    hyTorsoPatch(c, T, m([[.015, .655], [.08, .63], [.15, .645], [.205, .7], [.19, .72], [.13, .675], [.07, .668], [.02, .685]]), sh, .9);
    L(m([[.012, .84], [.01, .66], [.06, .635], [.13, .645], [.19, .69], [.215, .75]]), 1.25);
    L(m([[.03, .85], [.09, .87], [.16, .86]]), .6);                                                // clavicle
    // abs: 3 rows of blocks (shadow under each block) + serratus fingers + obliques
    for (const [v0, v1] of [[.54, .6], [.45, .515], [.36, .425]]) { hyTorsoPatch(c, T, m([[.012, v0 - .01], [.07, v0 - .02], [.085, v0], [.075, v0 + .012], [.02, v0 + .008]]), sh, .85); L(m([[.015, v0], [.05, v0 - .012], [.082, v0 + .005]]), .7); }
    L(m([[.085, .62], [.09, .5], [.085, .36], [.07, .26]]), .8);
    for (let i = 0; i < 3; i++) L(m([[.135 + i * .012, .6 - i * .055], [.17 + i * .01, .585 - i * .055]]), .6);
    hyTorsoPatch(c, T, m([[.1, .3], [.15, .42], [.2, .5], [.205, .38], [.17, .27], [.12, .2]]), sh, .55);          // oblique shade
    L(m([[.15, .33], [.1, .2], [.05, .08], [.03, .02]]), 1.0);                                      // iliac V-line
    // back: traps, rear delts, lats, spine
    hyTorsoPatch(c, T, m([[.5, .55], [.43, .62], [.36, .72], [.32, .8], [.36, .82], [.42, .74], [.48, .64]]), sh, .7);    // scapula shade
    L(m([[.47, .95], [.4, .9], [.33, .86]]), .8);
    L(m([[.33, .76], [.37, .6], [.42, .45], [.47, .3]]), .9);                                        // lat edge
    hyTorsoPatch(c, T, m([[.29, .72], [.3, .55], [.35, .4], [.4, .3], [.36, .45], [.32, .6]]), sh, .55);
  }
  L([[0, .62], [0, .3], [0, .16]], .9); L([[.5, .92], [.5, .6], [.5, .2]], 1.1);
  hyTorsoPatch(c, T, [[.49, .9], [.51, .9], [.515, .25], [.485, .25]], deep, .45);
}
// muscles on a bare upper arm / forearm (deltoid cap line, bicep-tricep split, forearm line, veins when pumped)
function hyArmLines(c, S, D, side, o = {}) {
  if (LIGHT.override) return;
  const J = S.J, B = S.B, sh = J['sh' + side], el = J['el' + side], wr = J['wr' + side], s = pxScale(el), ink = o.ink || rgba(shadeHex(D.skinShade, -.45), .85);
  const pump = clamp((S.pose.pump || 0) + (S.pose.rage || 0) * (D.rageVeins ? .7 : 0) + (D.veinsAlways || 0), 0, 1.5), out = vNorm(vSub(sh, J.neck)), fwd = S.M.chest[2];
  const ua = B.limbR.ua * (D.arm ? (1 + (D.arm.bicep || .3)) : 1);
  limbLine(c, sh, el, vNorm(vAdd(fwd, vMul(out, .3))), ua * 1.02, ink, .5, .22, .85);                // bicep edge
  limbLine(c, sh, el, vNorm(vAdd(out, vMul(fwd, -.2))), ua * 1.05, ink, .55, .05, .34);              // deltoid insertion
  limbLine(c, el, wr, vNorm(vAdd(out, fwd)), B.limbR.fa * 1.2, ink, .45, .08, .5);                    // brachioradialis
  if (pump > .05) { const vc = o.vein || D.veinCol || shadeHex(D.skinShade, -.2), w = lineW(s, .55) * (.6 + pump * .6);
    c.save(); c.globalAlpha *= clamp(pump * 1.4, 0, 1); hyVein(c, el, wr, B.limbR.fa * 1.15, side === 'L' ? 3 : 7, vc, w); hyVein(c, sh, el, ua, side === 'L' ? 11 : 13, vc, w * .9, { f0: .35, f1: .95 }); c.restore(); }
}
// generic bruise / welt decals on the torso (wounds 1..3) for bare-chested fighters
function hyBruises(c, S, D, k, col = '#5a3a6a') {
  if (!k || LIGHT.override) return; const T = torsoModel(S, D, .006 * S.B.h / 1.8);
  const spots = [[.12, .7, .05], [-.08, .45, .045], [.3, .55, .05], [-.2, .62, .04], [.05, .3, .04], [.55, .7, .06]].slice(0, 2 + k * 2);
  for (const [u, v, r] of spots) { const uvs = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; uvs.push([u + Math.cos(a) * r * (1 + .3 * hash(i + u * 9)), v + Math.sin(a) * r * 1.3]); } hyTorsoPatch(c, T, uvs, col, .32 + .08 * k); }
}
// ------------------------------------------------------------------------------------------------------------- hair
HY.hulkHair = () => { const r = i => hash(i * 4.13 + 7); return [
  ...lockFan(15, .9, 5.38, .35, (th, u, i) => ({ th, ph: .3 + .2 * r(i + 3), len: .42 + .2 * r(i), w: .5, rootR: .95, dir: dirOut(th + (r(i + 5) - .5) * .6, .15 + .35 * r(i + 2), .2, -.05), curl: [(r(i + 4) - .5) * 1.2, -.3, -.2], grav: .5, tw: .32, tip: 1.3, seg: 5, back: Math.cos(th) < .1, gloss: i % 4 === 1 })),
  ...lockFan(9, 0, TAU * .9, 1.05, (th, u, i) => ({ th, len: .4 + .2 * r(i + 20), w: .55, rootR: .97, dir: dirOut(th + (r(i + 21) - .5) * .9, .9, 0, -.1), curl: [(r(i + 22) - .5) * 1.6, -.6, (r(i + 23) - .5)], grav: .3, tw: .32, tip: 1.3, seg: 5 })),
  // messy fringe: short tufts falling over the forehead down to the brow
  ...lockFan(7, -.85, .85, .92, (th, u, i) => ({ th, len: .5 + .16 * r(i + 30), w: .4, rootR: .965, dir: [Math.sin(th) * .6 + (r(i + 31) - .5) * .5, -.05, 1], curl: [(r(i + 32) - .5) * 1.4, -1.6, -.5], grav: 1.1, tw: .3, tip: 1.25, seg: 6, front: true, gloss: i % 3 === 1 })),
]; };
HY.yujHair = () => { const r = i => hash(i * 6.71 + 2); return [
  // flaring crimson mane: big spikes sweeping UP and BACK from the hairline like flames
  ...lockFan(9, -1.0, 1.0, .75, (th, u, i) => ({ th, len: 1.05 + .35 * Math.sin(u * Math.PI) + .2 * r(i), w: .62, rootR: .95, dir: [Math.sin(th) * .35, .92, -.35 + .1 * r(i + 2)], curl: [Math.sin(th) * .5, -.15, -.9], grav: -.15, tw: .34, tip: 1.6, seg: 7, front: true, sway: .4, gloss: i % 3 === 0 })),
  ...lockFan(12, .7, 5.58, .55, (th, u, i) => ({ th, ph: .45 + .25 * r(i + 4), len: 1.0 + .45 * r(i + 5), w: .6, rootR: .95, dir: dirOut(th, .65 + .3 * r(i + 6), -.05, -.55), curl: [(r(i + 7) - .5) * .8, -.2, -.8], grav: -.08, tw: .34, tip: 1.55, seg: 7, back: Math.cos(th) < .2, sway: .5, gloss: i % 4 === 1 })),
  ...lockFan(9, 1.4, 4.9, .05, (th, u, i) => ({ th, len: .75 + .3 * r(i + 8), w: .55, rootR: .96, dir: dirOut(th, .35, -.1, -.4), curl: [(r(i + 9) - .5) * .6, -.1, -.6], grav: .1, tw: .32, tip: 1.5, seg: 6, back: true })),
  // sideburns (long, down past the ear toward the jaw)
  { th: 1.5, ph: -.05, len: .6, w: .3, rootR: .97, dir: [.15, -1, .1], curl: [-.1, .1, .1], grav: .9, tw: .26, tip: 1.6, seg: 5 },
  { th: -1.5, ph: -.05, len: .6, w: .3, rootR: .97, dir: [-.15, -1, .1], curl: [.1, .1, .1], grav: .9, tw: .26, tip: 1.6, seg: 5 },
]; };
HY.banHair = () => { const r = i => hash(i * 2.91 + 5); return [
  ...lockFan(16, .95, 5.33, .38, (th, u, i) => ({ th, ph: .35 + .1 * r(i), len: .7 + .2 * r(i + 1), w: .44, rootR: .95, dir: dirOut(th + (r(i + 2) - .5) * .4, .15, .9, -.05), curl: [(r(i + 3) - .5) * .8, .2, -.4], grav: .8, wave: [.12, 1.1, i], tw: .27, tip: 1.25, seg: 7, back: Math.cos(th) < .1, gloss: i % 4 === 1 })),
  ...lockFan(7, 0, TAU * .86, 1.1, (th, u, i) => ({ th, len: .5 + .2 * r(i + 10), w: .45, rootR: .97, dir: dirOut(th, .9, 0, -.2), curl: [(r(i + 11) - .5) * 1.4, -.5, 0], grav: .3, tw: .3, tip: 1.2, seg: 6 })),
  ...lockFan(6, -.8, .8, .9, (th, u, i) => ({ th, len: .72 + .15 * r(i + 20), w: .38, rootR: .965, dir: [Math.sin(th) * .4 + (r(i + 21) - .5) * .3, -.1, 1], curl: [(r(i + 22) - .5) * .9, -1.5, -.55], grav: 1.4, tw: .27, tip: 1.2, seg: 7, front: true, gloss: i % 3 === 1 })),
]; };
// ------------------------------------------------------------------------------------------------------------- face markings
function hyHeavyBrow(c, HM, e, sh, ink, o = {}) {   // brow ridge shade + furrow + nasolabial + cheekbones + jaw (rugged adult male)
  const ang = clamp(e.browA || 0, -1, 1), a = o.a == null ? 1 : o.a;
  const f0 = faceFrame(HM, 0, .02, .75, 1); decal(c, f0.p, f0.tu, f0.tv, cc => {
    cc.fillStyle = rgba(sh, .55 * a); cc.beginPath(); cc.moveTo(-.78, .05); cc.quadraticCurveTo(-.4, -.08 - ang * .05, -.12, .04 - ang * .1); cc.lineTo(.12, .04 - ang * .1); cc.quadraticCurveTo(.4, -.08 - ang * .05, .78, .05); cc.lineTo(.7, -.06); cc.quadraticCurveTo(.4, -.16, .12, -.05); cc.lineTo(-.12, -.05); cc.quadraticCurveTo(-.4, -.16, -.7, -.06); cc.closePath(); cc.fill();
    if (ang > .35) { const k = (ang - .35) / .65; cc.globalAlpha = clamp(k * 1.2, 0, .8); inkPts(cc, [[-.06, .22], [-.045, .06]], .035, ink, [.4, .4]); inkPts(cc, [[.06, .22], [.045, .06]], .035, ink, [.4, .4]); cc.globalAlpha = 1; }
  }, -.1, f0.n);
  if (o.brow) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .4, (o.eyeY || -.2) + .2 + (e.brow || 0) * .07, .55, .42); const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1);   // heavy brute brows (angle = browA)
    decal(c, fr.p, tu, fr.tv, cc => { const a = clamp(e.browA || 0, -1, 1), th = o.browTh || .3, inY = -a * .32, outY = a * .1 + .05; cc.beginPath(); cc.moveTo(-.62, inY + th * .55); cc.quadraticCurveTo(0, inY * .4 + outY * .6 + th * .9, .78, outY + th * .2); cc.lineTo(.92, outY - th * .15);
      cc.quadraticCurveTo(.1, inY * .4 + outY * .6 - th * .15, -.6, inY - th * .3); cc.closePath(); cc.fillStyle = o.brow; cc.fill(); cc.lineWidth = .05; cc.strokeStyle = LIGHT.ink; cc.stroke(); }, -.2, fr.n); }
  for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .32, -.55, .5, .55); const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1);
    decal(c, fr.p, tu, fr.tv, cc => { const open = (e.mouthOpen || 0); { const gk = clamp(open + Math.max(0, (e.mouthW || 1) - 1.1), 0, 1); cc.globalAlpha = .45 + .55 * gk; inkPts(cc, [[.05, .45], [.3 + open * .1, .05], [.38 + open * .15, -.3 - open * .3]], .045 * (o.fold || 1), ink, [.4, .5]); cc.globalAlpha = 1; }   // nasolabial fold
      if (o.cheek) inkPts(cc, [[.75, .55], [.95, .2], [.98, -.1]], .05, ink, [.4, .4]); }, .02, fr.n); }
}
// ------------------------------------------------------------------------------------------------------------- bodies
function hyBody(D, f) { const B = makeBody(D); f(B); return B; }
// ============================================================================================================= HULK
CAST.hulk = design(SHINIGAMI, {
  name: 'Hulk', h: 2.5, headShape: { jaw: .6, chin: .9, square: 1, width: 1.12, wide: true, tall: .95 }, body: { width: 1.5, shoulders: 1.62, depth: 1.45, limbs: 2.0, head: .84, legs: .92, arms: 1.06, neck: .55 },
  skin: HY.col.hulk, skinShade: HY.col.hulkShade, kosode: HY.col.hulk, collar: { none: true }, sleeve: { none: true }, armSkin: HY.col.hulk, handSkin: HY.col.hulk, neckSkin: HY.col.hulk, legSkin: HY.col.hulk,
  arm: { delt: 1.5, bicep: .55, elbow: .8, fore: .55, wrist: .75, flex: .3 }, fingerW: 1.35, veinCol: HY.col.vein, rageVeins: true,
  haori: { none: true }, obi: null,
  hakama: { col: HY.col.pants, r0: .17, r1: .135, r2: .15, len: .5, ties: false, pleats: false, torn: 1.4, shinCol: HY.col.hulk },
  feet: { col: HY.col.hulk, sandal: false, w: 1.9 },
  torsoDetail: (c, S, D, T, G) => hulkTorso(c, S, D, T, G),
  face: {
    eye: { w: 1.05, h: .34, irisR: .3, irisCol: HY.col.hulkEye, irisLight: '#e8ffc8', irisDark: '#2e7a1e', tilt: -.08, thick: 1.6, flick: .0, lashes: false, crease: false, pupilR: .38, lidShade: '#2a5a24' },
    eyeSize: .42, eyeY: -.22, defaultExpr: 'growl', brows: false, brow: { browW: .2, browY: -.02, browCol: '#121610' }, noseK: 1.35,
    mouth: { mouthW: 1.3, teethN: 8 }, mouthSize: .5, mouthY: -.72,
    hair: { col: HY.col.hulkHair, shadeCol: HY.col.hulkHairShade, gloss: true, glossCol: '#3a4a3a', springK: 60, springC: 8, cap: { front: .6, side: .02, back: -.75, jag: .06, jagN: 18 }, locks: HY.hulkHair() },
    markings: (c, HM, e, lod, D) => { hyHeavyBrow(c, HM, e, D.skinShade, rgba(shadeHex(D.skinShade, -.5), .9), { fold: 1.2, brow: '#141810', eyeY: D.face.eyeY, browTh: .34 });
      if (D.rageK || e.hyVein) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .62, .38, .3, .35); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.strokeStyle = D.veinCol; cc.lineWidth = .09; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(-.1, -.7); cc.quadraticCurveTo(.25, -.1, .05, .3); cc.quadraticCurveTo(-.1, .55, .2, .85); cc.moveTo(.1, .05); cc.lineTo(.5, .25); cc.stroke(); }, -1, fr.n); } },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => hulkHeadExtras(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['growl', 'roar', 'rage', 'angry', 'awe', 'surprised', 'pain', 'horror', 'disappointed', 'calm', 'determined', 'smirk', 'tired', 'eyesClosed'],
  forms: {
    base: {},
    rage: { skin: HY.col.hulkRage, skinShade: HY.col.hulkRageShade, kosode: HY.col.hulkRage, armSkin: HY.col.hulkRage, handSkin: HY.col.hulkRage, neckSkin: HY.col.hulkRage, legSkin: HY.col.hulkRage, rageK: 1, veinsAlways: .6, veinCol: HY.col.veinRage,
      feet: { col: HY.col.hulkRage, sandal: false, w: 1.9 }, hakama: { col: HY.col.pants, r0: .17, r1: .135, r2: .15, len: .5, ties: false, pleats: false, torn: 1.4, shinCol: HY.col.hulkRage } },
    wounded: { wounds: 2, bruise: 2 },
    bruised: { wounds: 1, bruise: 1 },
  },
});
CAST.hulk._body = hyBody(CAST.hulk, B => { const k = B.h / 1.8; B.ring.waist[0] *= .8; B.ring.hip[0] *= .84; B.ring.chest[0] *= 1.0; B.ring.chest[1] *= 1.1; B.ring.shoulder[0] *= .86; B.ring.shoulder[1] *= 1.2; B.shW *= .8; B.shDrop = .14 * k; B.shRingDrop = .03 * k; B.trapR = [.15 * k * 1.5, .1 * k * 1.3]; B.trapUp = .055 * k; B.hand *= 2.1; B.limbR.neck *= 1.15; B.neck *= .7; B.headFwd += .06; B.foot *= 1.35; });
function hulkTorso(c, S, D, T, G) {
  if (LIGHT.override) return; hyMuscles(c, S, D, { def: 1.15 });
  const k = S.pose.wounds != null ? S.pose.wounds : (D.bruise || 0); hyBruises(c, S, D, Math.round(k * (1 - (S.pose.regen || 0))), '#3c3456');
  const rk = clamp((S.pose.rage || 0) + (D.rageK || 0) * .6 + (S.pose.pump || 0) * .5, 0, 1.4); if (rk > .1) { // chest/neck veins
    c.save(); c.globalAlpha *= clamp(rk, 0, 1); torsoLines(c, S, D, [[[.1, .9], [.13, .8], [.11, .72]], [[-.1, .9], [-.14, .79], [-.11, .7]], [[.06, .3], [.1, .2], [.08, .1]], [[-.06, .3], [-.1, .2], [-.07, .1]]], D.veinCol, 1.1 * rk, .006); c.restore(); }
}
function hulkHeadExtras(S, D, F, t, parts, opt, HM, e, zc) {
  if (opt.mode === 'flat' || LIGHT.override) return; const rk = clamp((S.pose.rage || 0) + (D.rageK ? .8 : 0), 0, 1);
  if (rk > .3) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .33, (D.face.eyeY || -.2) + .01, .55, .33); parts.push({ z: zc - HM.r * 1.02, fn: c => { // white-hot eye glow (rage)
    decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { const g = cc.createRadialGradient(.05, 0, 0, .05, 0, .9); g.addColorStop(0, rgba('#f4ffe8', rk)); g.addColorStop(.35, rgba('#b8ff7a', .75 * rk)); g.addColorStop(1, 'rgba(120,255,80,0)'); cc.fillStyle = g; cc.beginPath(); cc.ellipse(.05, 0, .9, .45, 0, 0, TAU); cc.fill(); }, -1, fr.n); } }); }
}
CAST.hulk.drawHead = stdHead(CAST.hulk);
CAST.hulk.extras = (S, D, F, t, parts, opt) => {
  for (const sd of ['L', 'R']) { const zA = camDepth(vLerp(S.J['el' + sd], S.J['wr' + sd], .3)), zT = camDepth(vLerp(S.J.pelvis, S.J.neck, .5));
    parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode !== 'flat') hyArmLines(c, S, D, sd); } }); }
  const wk = S.pose.wounds != null ? S.pose.wounds : (D.wounds || 0); woundParts(S, D, parts, opt, Math.round(wk * (1 - (S.pose.regen || 0))));
  if ((D.rageK || (S.pose.rage || 0) > .05) && opt.mode !== 'flat' && !LIGHT.override && window.fxRageSteam) parts.push({ z: camDepth(S.J.head) - .3, fn: c => fxRageSteam(c, F, t, { k: clamp((S.pose.rage || 0) + (D.rageK ? .5 : 0), 0, 1.2), body: false }) });
};
// Banner form on the Hulk figure (same object can cut Hulk <-> Banner): own body via form._body
// ============================================================================================================= BANNER
CAST.banner = design(SHINIGAMI, {
  name: 'Bruce Banner', h: 1.78, headShape: { jaw: .9, chin: 1.0, square: .3, width: .95 }, body: { width: .9, limbs: .92, shoulders: .95, depth: .92 }, skin: HY.col.ban, skinShade: HY.col.banShade,
  kosode: HY.col.banShirt, collar: { under: '#f4f0ea', skinCol: HY.col.ban, v0: .72, w: .45, shift: 0 },
  sleeve: { col: HY.col.banShirt, r0: .075, r1: .085, r2: .09, sag: .06, len: .96, torn: .4 },
  hakama: { col: HY.col.banPants, r0: .088, r1: .078, r2: .072, pleats: false, ties: false, torn: .5 },
  haori: { none: true }, obi: { col: '#3a3028', v0: .02, v1: .055 }, feet: { col: '#4a3a2c', sandal: false, w: 1.0 },
  torsoDetail: (c, S, D, T, G) => { if (LIGHT.override) return; torsoLines(c, S, D, [[[0, .72], [0, .4], [0, .08]]], rgba(LIGHT.ink, .7), .5, .005); if (D.torn) { torsoLines(c, S, D, [[[.05, .95], [.12, .7], [.06, .5], [.15, .3]], [[-.08, .6], [-.16, .4], [-.1, .2]]], LIGHT.ink, .9, .006); } },
  face: {
    eye: { w: 1.02, h: .38, irisR: .32, irisCol: '#5a3e2a', irisLight: '#b08a62', irisDark: '#24160e', tilt: -.02, thick: 1.1, flick: .03, lashes: true, crease: true, pupilR: .36, lidShade: '#6a5a50' },
    eyeSize: .37, eyeY: -.2, defaultExpr: 'tired', brow: { browW: .07, browY: .06, browCol: '#2a1e18' }, noseK: 1.0,
    mouth: { mouthW: .9 }, mouthSize: .25, mouthY: -.76,
    hair: { col: HY.col.banHair, shadeCol: '#1a120c', gloss: true, glossCol: '#7a6050', springK: 36, springC: 5, cap: { front: .64, side: .05, back: -.85 }, locks: HY.banHair() },
    markings: (c, HM, e, lod, D) => { for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .32, -.32, .5, .3); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => inkPts(cc, [[-.5, .1], [0, -.08], [.5, .05]], .05, rgba('#8a6a5a', .7), [.4, .4]), .02, fr.n); } },   // tired under-eye lines
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (S.pose.glasses !== false && !D.noGlasses) parts.push({ z: zc - HM.r * 1.08, fn: c => hvgRoundGlasses(c, HM, opt, S.pose, { frame: '#2a2a30', r: .34, lens: null, thick: 1.3, crack: S.pose.glassesCrack || 0 }) }); },
  },
  sheetExprs: ['tired', 'calm', 'worried', 'pain', 'horror', 'shock', 'rage', 'growl', 'sorrow', 'determined', 'surprised', 'disappointed', 'exhausted', 'eyesClosed'],
  forms: { base: {}, torn: { torn: true, wounds: 1, sleeve: { col: HY.col.banShirt, r0: .075, r1: .085, r2: .09, sag: .06, len: .7, torn: .9 } } },
});
EXPR.worried = EXPR.worried || { eye: .9, lid: -.3, brow: .35, browA: -.5, pupil: .9, mouth: 'frown', mouthW: .8, sweat: 1 };
CAST.banner.drawHead = stdHead(CAST.banner);
CAST.banner.extras = (S, D, F, t, parts, opt) => woundParts(S, D, parts, opt, S.pose.wounds != null ? S.pose.wounds : (D.wounds || 0));
CAST.hulk.forms.banner = Object.assign({}, CAST.banner, { forms: undefined, rageK: 0, veinsAlways: 0, arm: null, fingerW: 1, bruise: 0 });
CAST.hulk.forms.banner._body = makeBody(CAST.banner);
CAST.hulk.forms.banner.drawHead = CAST.banner.drawHead; CAST.hulk.forms.banner.extras = CAST.banner.extras;
// ============================================================================================================= YUJIRO
CAST.yujiro = design(SHINIGAMI, {
  name: 'Yujiro Hanma', h: 1.92, headShape: { jaw: .7, chin: .95, square: .85, width: 1.04, tall: .97 }, body: { width: 1.3, shoulders: 1.42, depth: 1.3, limbs: 1.62, head: .9, legs: 1.0, neck: .8 },
  skin: HY.col.yuj, skinShade: HY.col.yujShade, kosode: HY.col.yuj, collar: { none: true }, armSkin: HY.col.yuj, handSkin: HY.col.yuj, neckSkin: HY.col.yuj,
  sleeve: { col: HY.col.yujShirt, lining: '#121116', r0: .1, r1: .1, r2: .1, sag: .05, len: .95 },
  arm: { delt: 1.4, bicep: .45, elbow: .78, fore: .45, wrist: .7, flex: .3 }, fingerW: 1.15, veinCol: '#8a4a3a',
  haori: { col: HY.col.yujShirt, lining: '#2a1418', len: .1, sleeves: true, hem: 'none', kanji: null, open: .95, flare: .05, collarLen: .4 },
  obi: { col: '#121116', v0: .0, v1: .04 },
  hakama: { col: HY.col.yujPants, r0: .118, r1: .1, r2: .092, pleats: false, ties: false },
  feet: { col: '#18161a', sandal: false, w: 1.15, soleCol: '#0e0d10', soleH: .016 },
  torsoDetail: (c, S, D, T, G) => yujTorso(c, S, D, T, G),
  face: {
    eye: { w: 1.15, h: .33, irisR: .22, irisCol: HY.col.yujEye, irisLight: '#e06a50', irisDark: '#2a0806', tilt: .16, thick: 1.5, flick: .03, lashes: false, crease: true, pupilR: .5, lidShade: '#7a3a2a', white: '#fbf4ec' },
    eyeSize: .4, eyeY: -.2, defaultExpr: 'relish', brows: false, brow: { browW: .16, browY: 0, browCol: '#9a1620' }, noseK: 1.2,
    mouth: { mouthW: 1.35, teethN: 8, fangs: true }, mouthSize: .44, mouthY: -.73,
    hair: { col: HY.col.yujHair, shadeCol: HY.col.yujHairShade, gloss: true, glossCol: HY.col.yujHairGloss, springK: 70, springC: 9, cap: { front: .7, side: .06, back: -.7, jag: .06, jagN: 18 }, locks: HY.yujHair() },
    markings: (c, HM, e, lod, D) => { hyHeavyBrow(c, HM, e, D.skinShade, rgba(shadeHex(D.skinShade, -.5), .9), { fold: 1.3, brow: '#141016', eyeY: D.face.eyeY, browTh: .32 }); if (window.hyBloodMouth) hyBloodMouth(c, HM, e); },
  },
  sheetExprs: ['relish', 'calm', 'serious', 'surprised', 'oniGrin', 'defiant', 'pain', 'ecstasy', 'menace', 'smirk', 'angry', 'laugh', 'focused', 'eyesClosed'],
  forms: {
    base: {},
    calm: { face: { defaultExpr: 'calm' } },
    bare: { shirtless: true },
    oni: { shirtless: true, oniK: 1 },
    bruised: { shirtless: true, bruise: 1, wounds: 1 },
    bloodied: { shirtless: true, bruise: 2, wounds: 3 },
  },
});
CAST.yujiro._body = hyBody(CAST.yujiro, B => { const k = B.h / 1.8; B.ring.waist[0] *= .82; B.ring.hip[0] *= .88; B.ring.shoulder[0] *= .88; B.ring.shoulder[1] *= 1.15; B.shW *= .84; B.shDrop = .1 * k; B.shRingDrop = .025 * k; B.trapR = [.1 * k * 1.3, .07 * k * 1.25]; B.trapUp = .04 * k; B.hand *= 1.55; B.limbR.neck *= 1.25; B.neck *= .6; B.headFwd += .02; });
// shirtless forms: remove sleeves/coat (design-level) -> resolved per form
for (const fm of ['bare', 'oni', 'bruised', 'bloodied']) Object.assign(CAST.yujiro.forms[fm], { haori: { none: true }, sleeve: { none: true } });
CAST.yujiro.forms.calm.face = Object.assign({}, CAST.yujiro.face, { defaultExpr: 'calm' });
function yujTorso(c, S, D, T, G) {
  if (LIGHT.override) return; hyMuscles(c, S, D, { def: 1.05 });
  const bk = S.pose.wounds != null ? S.pose.wounds : (D.bruise || 0); hyBruises(c, S, D, bk, '#6a3a52');
  const oni = clamp((S.pose.oni != null ? S.pose.oni : (D.oniK || 0)), 0, 1); if (oni > .02 && window.yujOniBack) yujOniBack(c, S, D, oni);
}
CAST.yujiro.drawHead = stdHead(CAST.yujiro);
CAST.yujiro.extras = (S, D, F, t, parts, opt) => {
  const bare = !!D.shirtless || S.pose.shirt === false;
  for (const sd of ['L', 'R']) { const zA = camDepth(vLerp(S.J['el' + sd], S.J['wr' + sd], .3)), zT = camDepth(vLerp(S.J.pelvis, S.J.neck, .5));
    if (bare) parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode !== 'flat') hyArmLines(c, S, D, sd); } }); }
  woundParts(S, D, parts, opt, S.pose.wounds != null ? S.pose.wounds : (D.wounds || 0));
};
// pose.shirt:false on the base form -> resolve at draw time through a tiny form switch
HY.yujForm = (F, t) => F;
// ------------------------------------------------------------------------------------------------------------- poses
const HY_ATK = (o) => o;
Object.assign(POSES, {
  // ---- HULK (hunched giant: chest forward, lats push the arms out, knees bent)
  hlk_stand: { sp: .22, hp: -.18, shL: [.08, .1], shR: [.08, .1], aL: [.22, 1.25, -.3], eL: .55, aR: [.22, 1.25, .3], eR: .55, hL: 'relax', hR: 'relax', lL: [.15, .2, .25], kL: .3, lR: [.1, .2, -.25], kR: .28, face: expr('growl') },
  hlk_fistsUp: { sp: -.12, hp: -.35, aL: [2.75, .55, 0], eL: .55, aR: [2.75, .55, 0], eR: .55, hL: 'fist', hR: 'fist', lL: [.2, .32, .2], kL: .35, lR: [.2, .32, -.2], kR: .35, pump: 1, face: expr('roar') },
  hlk_smashWind: { sp: -.32, hp: -.3, aL: [2.95, .1, 0], eL: .7, aR: [2.95, .1, 0], eR: .7, hL: 'fist', hR: 'fist', lL: [.35, .3, .2], kL: .45, lR: [.25, .3, -.2], kR: .4, pump: 1, face: expr('roar') },
  hlk_smash: { sp: 1.0, hp: -.55, aL: [1.1, -.05, 0], eL: .15, aR: [1.1, -.05, 0], eR: .15, hL: 'fist', hR: 'fist', lL: [1.35, .35, .2], kL: 1.8, lR: [1.2, .35, -.2], kR: 1.7, fR: .4, fL: .4, pump: 1, face: expr('roar') },
  hlk_clapWind: { sp: .05, st: 0, hp: -.2, aL: [1.5, 1.75, 0], eL: .25, aR: [1.5, 1.75, 0], eR: .25, hL: 'flat', hR: 'flat', wL: [-.4, 0], wR: [-.4, 0], lL: [.35, .3, .2], kL: .5, lR: [.2, .3, -.2], kR: .4, pump: .8, face: expr('roar') },
  hlk_clap: { sp: .3, hp: -.1, aL: [1.45, -.12, 0], eL: .08, aR: [1.45, -.12, 0], eR: .08, hL: 'flat', hR: 'flat', wL: [0, 0], wR: [0, 0], lL: [.55, .3, .2], kL: .7, lR: [-.2, .3, -.2], kR: .45, pump: 1, face: expr('roar') },
  hlk_jumpCrouch: { sp: .85, hp: -.6, aL: [.65, 2.6, 0], eL: .4, aR: [.65, 2.6, 0], eR: .4, hL: 'fist', hR: 'fist', lL: [1.4, .3, .2], kL: 2.2, lR: [1.4, .3, -.2], kR: 2.2, fL: .7, fR: .7, face: expr('growl') },
  hlk_leap: { sp: .35, hp: -.5, pitch: -.25, aL: [2.6, .45, 0], eL: .45, aR: [2.3, .7, 0], eR: .6, hL: 'fist', hR: 'fist', lL: [.7, .2, 0], kL: 1.2, lR: [-.25, .2, 0], kR: .9, fR: .8, fL: .4, ground: false, face: expr('roar') },
  hlk_land: { sp: .95, hp: -.35, aL: [.55, .85, 0], eL: .5, aR: [.95, -.05, 0], eR: .05, hL: 'fist', hR: 'fist', lL: [1.5, .45, .2], kL: 2.3, lR: [.15, .4, -.2], kR: 2.0, fR: 1.0, face: expr('growl') },
  hlk_throwWind: { sp: -.2, st: .75, hp: -.15, aR: [2.6, -.6, 0], eR: 1.2, hR: 'claw', aL: [2.4, .4, 0], eL: 1.0, hL: 'claw', lL: [.4, .25, 0], kL: .45, lR: [-.3, .25, 0], kR: .35, pump: 1, face: expr('roar') },
  hlk_throw: { sp: .55, st: -.6, hp: .05, aR: [1.65, .15, 0], eR: .05, hR: 'open', aL: [1.6, .35, 0], eL: .1, hL: 'open', lL: [.85, .25, 0], kL: .9, lR: [-.6, .25, 0], kR: .3, fR: .5, face: expr('roar') },
  hlk_roar: { sp: -.3, hp: -.7, aL: [.5, 1.65, 0], eL: 1.3, aR: [.5, 1.65, 0], eR: 1.3, hL: 'fist', hR: 'fist', wL: [.4, 0], wR: [.4, 0], lL: [.35, .38, .2], kL: .55, lR: [.35, .38, -.2], kR: .55, pump: 1, face: expr('roar') },
  hlk_chestPound: { sp: -.1, hp: -.35, aL: [1.1, -.55, 0], eL: 2.2, aR: [1.25, -.45, 0], eR: 2.0, hL: 'fist', hR: 'fist', lL: [.3, .3, .2], kL: .45, lR: [.25, .3, -.2], kR: .4, pump: .8, face: expr('roar') },
  hlk_pain: { sp: .55, ss: .2, hp: .25, hr: .15, aL: [.75, -.55, 0], eL: 1.6, hL: 'claw', aR: [.6, -.25, 0], eR: 1.9, hR: 'claw', lL: [.6, .25, .2], kL: 1.0, lR: [.2, .25, -.2], kR: .7, face: expr('pain') },
  hlk_punchWind: { sp: .15, st: .8, hp: -.15, aR: [1.0, 2.3, 0], eR: 2.0, hR: 'fist', aL: [1.3, .2, 0], eL: .8, hL: 'fist', lL: [.55, .25, .2], kL: .7, lR: [-.35, .25, -.2], kR: .4, pump: 1, face: expr('roar') },
  hlk_punch: { sp: .45, st: -.75, hp: .05, aR: [1.55, -.02, 0], eR: 0, hR: 'fist', aL: [.7, 2.4, 0], eL: 1.5, hL: 'fist', lL: [1.0, .25, .2], kL: 1.0, lR: [-.8, .25, -.2], kR: .15, fR: .5, pump: 1, face: expr('roar') },
  hlk_grab: { sp: .45, hp: -.1, aL: [1.4, .35, 0], eL: .7, aR: [1.5, .2, 0], eR: .5, hL: 'claw', hR: 'claw', lL: [.6, .3, .2], kL: .8, lR: [-.2, .3, -.2], kR: .5, face: expr('growl') },
  hlk_kneel: { sp: .55, hp: .35, aL: [.45, .6, 0], eL: .6, hL: 'fist', aR: [.7, .3, 0], eR: .2, hR: 'flat', lL: [1.5, .3, .1], kL: 1.7, lR: [.25, .25, 0], kR: 2.5, fR: 1.1, face: expr('pain') },
  hlk_charge: { sp: .75, hp: -.55, aL: [.7, -.1, 0], eL: 1.4, aR: [.5, 2.9, 0], eR: 1.0, hL: 'fist', hR: 'fist', lL: [1.25, .2, 0], kL: 1.2, lR: [-.55, .2, 0], kR: 1.4, fR: .7, face: expr('roar') },
  hlk_awe: { sp: .1, hp: .1, aL: [.3, 1.0, 0], eL: .9, aR: [.35, .9, 0], eR: 1.0, hL: 'open', hR: 'open', lL: [.1, .2, .2], kL: .2, lR: [.05, .2, -.2], kR: .18, face: expr('awe') },
  // ---- BANNER
  ban_stand: { sp: .08, hp: .12, aL: [.08, .4, 0], eL: .25, aR: [.1, .45, 0], eR: .3, hL: 'relax', hR: 'relax', lL: [.03, .06, 0], kL: .05, lR: [0, .06, 0], kR: .04, face: expr('tired') },
  ban_clutch: { sp: .65, hp: .5, aL: [.8, -.4, 0], eL: 2.2, aR: [1.4, -.2, 0], eR: 2.4, hL: 'claw', hR: 'claw', lL: [.6, .12, 0], kL: .9, lR: [.2, .12, 0], kR: .7, face: expr('pain') },
  ban_glasses: { sp: .05, hp: .15, aR: [1.2, -.35, 0], eR: 2.55, hR: 'pinch', aL: [.1, .4, 0], eL: .3, face: expr('tired') },
  ban_kneel: { sp: .5, hp: .55, aL: [.6, .1, 0], eL: .3, hL: 'flat', aR: [.6, .1, 0], eR: .3, hR: 'flat', lL: [1.4, .12, .1], kL: 2.0, lR: [1.4, .12, 0], kR: 2.0, fR: .9, face: expr('pain') },
  // ---- YUJIRO (relaxed predator: upright, chin slightly up, loose hands)
  yuj_stand: { sp: -.04, hp: -.1, aL: [.2, .7, -.2], eL: .3, aR: [.2, .7, .2], eR: .3, hL: 'relax', hR: 'relax', lL: [.05, .14, .2], kL: .1, lR: [-.02, .12, -.2], kR: .05, face: expr('relish') },
  yuj_pockets: { sp: -.06, hp: -.12, aL: [.18, .32, 0], eL: .4, aR: [.18, .32, 0], eR: .4, hL: 'hid', hR: 'hid', lL: [.04, .12, .15], kL: .08, lR: [-.02, .12, -.15], kR: .05, face: expr('calm') },
  yuj_walk1: { sp: 0, hp: -.1, aL: [.18, .32, 0], eL: .4, aR: [.18, .32, 0], eR: .4, hL: 'hid', hR: 'hid', lL: [.42, .06, 0], kL: .12, lR: [-.28, .06, 0], kR: .35, fR: .3, face: expr('calm') },
  yuj_walk2: { sp: 0, hp: -.1, aL: [.18, .32, 0], eL: .4, aR: [.18, .32, 0], eR: .4, hL: 'hid', hR: 'hid', lR: [.42, .06, 0], kR: .12, lL: [-.28, .06, 0], kL: .35, fL: .3, face: expr('calm') },
  yuj_fingertip: { sp: .12, st: -.35, hp: -.05, aR: [1.5, .05, 0], eR: .05, hR: 'point', aL: [.15, .5, 0], eL: .3, hL: 'relax', lL: [.25, .14, .2], kL: .3, lR: [-.25, .14, -.2], kR: .15, face: expr('relish') },
  yuj_chinUp: { sp: -.12, hp: -.42, aL: [.2, .6, 0], eL: .25, aR: [.2, .6, 0], eR: .25, hL: 'relax', hR: 'relax', lL: [.05, .16, .2], kL: .08, lR: [0, .16, -.2], kR: .06, face: expr('oniGrin') },
  yuj_bite: { sp: .45, hp: .2, aL: [1.4, -.1, 0], eL: 1.0, hL: 'claw', aR: [1.3, -.3, 0], eR: 1.2, hR: 'claw', lL: [.5, .2, .2], kL: .6, lR: [-.3, .2, -.2], kR: .4, face: expr('roar', { mouth: 'teeth', mouthOpen: .7 }) },
  yuj_punchWind: { sp: .1, st: .7, hp: -.05, aR: [.7, 2.2, 0], eR: 2.1, hR: 'fist', aL: [1.2, .1, 0], eL: .9, hL: 'open', lL: [.5, .18, .2], kL: .6, lR: [-.4, .18, -.2], kR: .4, pump: .6, face: expr('relish') },
  yuj_punch: { sp: .32, st: -.7, hp: .05, aR: [1.57, .0, 0], eR: 0, hR: 'fist', aL: [.6, 2.5, 0], eL: 1.6, hL: 'fist', lL: [.9, .18, .2], kL: .9, lR: [-.75, .18, -.2], kR: .12, fR: .4, pump: 1, face: expr('oniGrin') },
  yuj_block: { sp: .05, st: .2, hp: .15, aL: [1.35, -.25, 0], eL: 1.9, hL: 'fist', aR: [.9, .2, 0], eR: 1.4, hR: 'fist', lL: [.4, .16, .2], kL: .55, lR: [-.35, .16, -.2], kR: .4, pump: .8, face: expr('relish') },
  yuj_throwWind: { sp: .3, st: .6, aL: [1.3, .2, 0], eL: .8, hL: 'claw', aR: [1.6, .5, 0], eR: .7, hR: 'claw', lL: [.6, .2, 0], kL: .8, lR: [-.3, .2, 0], kR: .5, face: expr('relish') },
  yuj_throw: { sp: .6, st: -.9, hp: .1, aL: [.8, -.6, 0], eL: .9, hL: 'fist', aR: [2.2, -.4, 0], eR: .5, hR: 'claw', lL: [.9, .2, 0], kL: 1.0, lR: [-.6, .2, 0], kR: .3, fR: .5, pump: 1, face: expr('oniGrin') },
  yuj_kickWind: { sp: -.05, st: .4, aL: [.9, 1.0, 0], eL: 1.1, aR: [.8, .9, 0], eR: 1.2, hL: 'fist', hR: 'fist', lR: [1.4, .3, 0], kR: 2.1, lL: [.05, .12, 0], kL: .25, face: expr('relish') },
  yuj_kick: { sp: -.45, ss: -.3, st: -.6, hp: .15, aL: [1.1, 1.3, 0], eL: .7, aR: [1.0, 1.5, 0], eR: .5, hL: 'fist', hR: 'fist', lR: [1.55, 1.05, -.4], kR: .05, fR: .55, lL: [-.1, .15, .4], kL: .2, pump: 1, face: expr('oniGrin') },
  yuj_crouch: { sp: .5, hp: -.35, aL: [.55, .5, 0], eL: .8, hL: 'claw', aR: [.6, .4, 0], eR: .9, hR: 'claw', lL: [1.15, .3, .2], kL: 1.9, lR: [.6, .3, -.2], kR: 1.8, fR: .5, face: expr('relish') },
  yuj_fall: { sp: -.55, hp: -.5, aL: [2.2, 1.0, 0], eL: .4, aR: [1.9, 1.1, 0], eR: .6, hL: 'open', hR: 'open', lL: [.8, .2, 0], kL: .6, lR: [.4, .2, 0], kR: 1.0, ground: false, face: expr('surprised') },
  yuj_getUp: { sp: .65, hp: -.25, aL: [.5, .25, 0], eL: .3, hL: 'flat', aR: [.85, .6, 0], eR: .7, hR: 'fist', lL: [1.45, .25, .2], kL: 2.1, lR: [.3, .2, -.2], kR: 2.35, fR: 1.0, face: expr('relish') },
  yuj_flex: { sp: -.05, hp: -.25, aL: [1.65, 1.62, 0], eL: 2.2, aR: [1.65, 1.62, 0], eR: 2.2, hL: 'fist', hR: 'fist', wL: [.3, 0], wR: [.3, 0], lL: [.12, .22, .25], kL: .15, lR: [.1, .22, -.25], kR: .12, pump: 1, oni: 1, face: expr('oniGrin') },
  yuj_armsCross: { sp: -.06, hp: -.15, aL: [.62, -.6, -.5], eL: 2.1, aR: [.58, -.5, .5], eR: 2.15, hL: 'relax', hR: 'relax', lL: [.04, .14, .2], kL: .06, lR: [0, .14, -.2], kR: .05, face: expr('calm') },
  yuj_laugh: { sp: -.3, hp: -.75, aL: [.4, 1.2, 0], eL: .9, hL: 'claw', aR: [.45, 1.25, 0], eR: .8, hR: 'claw', lL: [.12, .2, .2], kL: .15, lR: [.08, .2, -.2], kR: .12, pump: .7, face: expr('ecstasy') },
  yuj_tense: { sp: .08, hp: -.05, aL: [.45, 1.0, 0], eL: 1.2, hL: 'fist', aR: [.45, 1.0, 0], eR: 1.2, hR: 'fist', shL: [.15, 0], shR: [.15, 0], lL: [.2, .22, .2], kL: .25, lR: [.15, .22, -.2], kR: .2, pump: 1, face: expr('oniGrin') },
  yuj_hurt: { sp: .35, ss: -.15, hp: .3, hr: -.12, aL: [.6, -.4, 0], eL: 1.5, hL: 'claw', aR: [.4, .5, 0], eR: .8, hR: 'fist', lL: [.45, .2, .2], kL: .6, lR: [-.2, .2, -.2], kR: .5, face: expr('pain') },
  yuj_elbow: { sp: .3, st: -.9, aR: [1.55, -.4, 0], eR: 2.4, hR: 'fist', aL: [.8, 2.2, 0], eL: 1.4, hL: 'fist', lL: [.8, .18, .2], kL: .85, lR: [-.6, .18, -.2], kR: .2, pump: 1, face: expr('oniGrin') },
  yuj_uppercut: { sp: -.15, st: -.5, hp: -.3, aR: [2.6, -.2, 0], eR: 1.0, hR: 'fist', aL: [.7, 1.5, 0], eL: 1.6, hL: 'fist', lL: [.6, .18, .2], kL: .5, lR: [-.5, .18, -.2], kR: .1, fR: .6, pump: 1, face: expr('oniGrin') },
});
SIGNATURE.hulk = ['hlk_stand', 'hlk_fistsUp', 'hlk_smashWind', 'hlk_smash', 'hlk_clapWind', 'hlk_clap', 'hlk_jumpCrouch', 'hlk_leap', 'hlk_land', 'hlk_throwWind', 'hlk_throw', 'hlk_roar', 'hlk_chestPound', 'hlk_pain', 'hlk_punchWind', 'hlk_punch', 'hlk_grab', 'hlk_kneel', 'hlk_charge', 'hlk_awe'];
SIGNATURE.banner = ['ban_stand', 'ban_clutch', 'ban_glasses', 'ban_kneel'];
SIGNATURE.yujiro = ['yuj_stand', 'yuj_pockets', 'yuj_walk1', 'yuj_fingertip', 'yuj_chinUp', 'yuj_bite', 'yuj_punchWind', 'yuj_punch', 'yuj_block', 'yuj_throwWind', 'yuj_throw', 'yuj_kickWind', 'yuj_kick', 'yuj_crouch', 'yuj_fall', 'yuj_getUp', 'yuj_flex', 'yuj_armsCross', 'yuj_laugh', 'yuj_tense', 'yuj_hurt', 'yuj_elbow', 'yuj_uppercut'];
(window.SIGNATURE_FORM = window.SIGNATURE_FORM || {}).hulk = 'base'; SIGNATURE_FORM.yujiro = 'bare'; SIGNATURE_FORM.banner = 'base';
// walk cycle helpers: Yujiro hands-in-pockets stroll, Hulk heavy stomp
HY.yujWalk = (ph, over) => mixPose(P('yuj_walk1', over), P('yuj_walk2', over), .5 - .5 * Math.cos(ph * TAU));
HY.hulkStomp = (ph, over) => { const s = Math.sin(ph * TAU); return P('hlk_stand', Object.assign({ lL: [.15 + .45 * Math.max(0, s), .22, .25], kL: .3 + .7 * Math.max(0, s), lR: [.1 + .45 * Math.max(0, -s), .22, -.25], kR: .28 + .7 * Math.max(0, -s), st: s * .12, ss: s * .05, aL: [.25 - s * .12, 1.2, -.3], aR: [.25 + s * .12, 1.2, .3] }, over || {})); };
// ============================================================================================================= P (cast.md) names, extra forms
// Hulk: hurt (= wounded, bruises that regenerate with pose.regen), shrink (pose.shrink 0..1 morphs Hulk -> Banner: body, colours, face)
CAST.hulk.forms.hurt = { wounds: 2, bruise: 2 };
// Hulk 'banner' form = Banner after the shrink (shirtless, the purple trousers now far too big)
Object.assign(CAST.hulk.forms.banner, { kosode: HY.col.ban, collar: { none: true }, sleeve: { none: true }, armSkin: HY.col.ban, handSkin: HY.col.ban, neckSkin: HY.col.ban, legSkin: HY.col.ban,
  hakama: { col: HY.col.pants, r0: .105, r1: .095, r2: .1, len: .92, pleats: false, ties: false, torn: .8, shinCol: HY.col.ban }, feet: { col: HY.col.ban, sandal: false, w: 1.0 }, obi: null,
  torsoDetail: (c, S, D) => { if (!LIGHT.override) { hyMuscles(c, S, D, { def: .35 }); } } });
// Yujiro (cast.md): base (open shirt) | torn (shirt ripped, cuts) | oni (shirtless, demon back) | bleeding (blood from the mouth corner, grin stays)
CAST.yujiro.forms.torn = { shirtTorn: true, wounds: 1, bruise: 1, haori: { col: HY.col.yujShirt, lining: '#121116', len: .55, sleeves: true, hem: 'none', kanji: null, open: .8, flare: .1, collarLen: .45, torn: 1 },
  sleeve: { col: HY.col.yujShirt, lining: '#121116', r0: .1, r1: .1, r2: .1, sag: .05, len: .6, torn: .9 } };
CAST.yujiro.forms.bleeding = { shirtless: true, bruise: 2, wounds: 2, haori: { none: true }, sleeve: { none: true } };
CAST.yujiro.forms.base.face = Object.assign({}, CAST.yujiro.face, { defaultExpr: 'stoic' });
CAST.banner.forms.wounded = { torn: true, wounds: 2, sleeve: { col: HY.col.banShirt, r0: .075, r1: .085, r2: .09, sag: .06, len: .7, torn: .9 } };
// expressions named in cast.md
Object.assign(EXPR, {
  confused: { eye: 1.0, lid: -.1, brow: .5, browA: -.35, pupil: .9, mouth: 'frown', mouthW: .8, look: [.15, .05] },
  fear: { eye: 1.3, lid: -.25, brow: .7, browA: -.6, pupil: .35, mouth: 'pain', mouthOpen: .45, shock: 1, sweat: 1 },
  stoic: { eye: .62, lid: .3, brow: -.12, browA: .25, pupil: .55, mouth: 'line', mouthW: 1.05 },
  sniff: { eye: 0, closed: 1, brow: .05, browA: .1, mouth: 'smirk', mouthW: 1.1 },
  chew: { eye: .55, lid: .2, brow: -.05, browA: .15, pupil: .6, mouth: 'teeth', mouthOpen: .15, mouthW: 1.0 },
  bleeding: { eye: .6, lid: .35, brow: -.15, browA: .4, pupil: .5, mouth: 'grin', mouthOpen: .3, mouthW: 1.5, shadow: .3, blood: 1 },
  afraid: { eye: 1.2, lid: -.25, brow: .6, browA: -.55, pupil: .5, mouth: 'pain', mouthOpen: .35, sweat: 1 },
});
// ---------------------------------------------------------------------------------------------------- Hulk -> Banner shrink (pose.shrink 0..1)
HY.lerpBody = (A, B, k) => { const o = JSON.parse(JSON.stringify(A)); for (const key in A) { if (typeof A[key] === 'number' && typeof B[key] === 'number') o[key] = lerp(A[key], B[key], k); }
  for (const r in A.ring) o.ring[r] = A.ring[r].map((v, i) => lerp(v, B.ring[r][i], k)); for (const r in A.limbR) o.limbR[r] = lerp(A.limbR[r], B.limbR[r], k);
  const tb = B.trapR || [B.limbR.neck * 1.25, B.limbR.neck * 1.15]; if (A.trapR) o.trapR = A.trapR.map((v, i) => lerp(v, tb[i], k));
  o.shRingDrop = lerp(A.shRingDrop != null ? A.shRingDrop : A.shDrop, B.shRingDrop != null ? B.shRingDrop : B.shDrop, k); o.trapUp = lerp(A.trapUp != null ? A.trapUp : .03, B.trapUp != null ? B.trapUp : .03, k); return o; };
HY.qk = k => Math.round(clamp(k, 0, 1) * 24) / 24;
CAST.hulk.dynBody = (p, d) => { const k = HY.qk(p.shrink || 0); if (!k) return d._body; const key = '_shrB' + k; if (!CAST.hulk[key]) CAST.hulk[key] = HY.lerpBody(CAST.hulk._body, CAST.hulk.forms.banner._body, k); return CAST.hulk[key]; };
CAST.hulk.dynDesign = (D, p) => { const k = HY.qk(p.shrink || 0); if (!k) return D; const key = '_shrD' + k + (D.rageK ? 'r' : ''); if (CAST.hulk[key]) return CAST.hulk[key];
  const Bn = CAST.hulk.forms.banner, mix = (a, b) => lerpHex(a, b, smooth(clamp((k - .1) / .8, 0, 1))), skin = mix(D.skin, Bn.skin), shade = mix(D.skinShade, Bn.skinShade);
  const o = Object.assign({}, D, { skin, skinShade: shade, kosode: skin, armSkin: skin, handSkin: skin, neckSkin: skin, legSkin: skin, rageK: 0, veinsAlways: 0, fingerW: lerp(D.fingerW || 1, 1, k),
    arm: k > .85 ? null : { delt: lerp(1.5, 1.1, k), bicep: lerp(.55, .1, k), elbow: lerp(.8, .95, k), fore: lerp(.55, .1, k), wrist: lerp(.75, .85, k), flex: .3 },
    hakama: Object.assign({}, D.hakama, { len: lerp(.5, .92, k), shinCol: skin }), feet: Object.assign({}, D.feet, { col: skin, w: lerp(1.9, 1.0, k) }),
    torsoDetail: (c, S, D2) => { if (!LIGHT.override) hyMuscles(c, S, D2, { def: lerp(1.15, .35, k) }); } });
  if (k > .55) Object.assign(o, { face: Bn.face, drawHead: Bn.drawHead, headShape: Bn.headShape });
  o.extras = (S, D2, F, t, parts, opt) => { if (k < .85) for (const sd of ['L', 'R']) { const zA = camDepth(vLerp(S.J['el' + sd], S.J['wr' + sd], .3)), zT = camDepth(vLerp(S.J.pelvis, S.J.neck, .5)); parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode !== 'flat') hyArmLines(c, S, D2, sd); } }); }
    if (k < .7 && window.fxRageSteam && opt.mode !== 'flat' && !LIGHT.override) parts.push({ z: camDepth(S.J.head) - .3, fn: c => fxRageSteam(c, F, t, { k: .5 * (1 - k), body: true }) }); };
  return (CAST.hulk[key] = o); };
if (!window.lerpHex) window.lerpHex = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = [16, 8, 0].map(sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, t))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); };
// ---------------------------------------------------------------------------------------------------- poses named in cast.md (+ aliases)
Object.assign(POSES, {
  hlk_haymakerWind: POSES.hlk_punchWind, hlk_haymaker: { sp: .5, st: -.95, hp: .0, aR: [1.45, -.35, 0], eR: .25, hR: 'fist', aL: [.8, 2.2, 0], eL: 1.4, hL: 'fist', lL: [1.0, .28, .2], kL: 1.05, lR: [-.85, .28, -.2], kR: .15, fR: .55, pump: 1, face: expr('roar') },
  hlk_groundPoundWind: POSES.hlk_smashWind, hlk_groundPound: POSES.hlk_smash,
  hlk_grabSwing: { sp: -.25, st: .4, hp: -.3, aR: [2.85, -.2, 0], eR: .35, hR: 'grip', aL: [1.2, 1.4, 0], eL: .9, hL: 'fist', lL: [.45, .32, .2], kL: .55, lR: [-.2, .32, -.2], kR: .4, pump: 1, face: expr('roar') },
  hlk_meteor: { pitch: .9, sp: .5, hp: -.6, aR: [2.9, .05, 0], eR: .1, hR: 'fist', aL: [2.7, .3, 0], eL: .35, hL: 'fist', lL: [.5, .25, 0], kL: 1.2, lR: [.1, .25, 0], kR: .9, ground: false, pump: 1, face: expr('roar') },
  hlk_stagger: { sp: -.2, ss: .25, st: .35, hp: -.35, hr: .2, aL: [1.1, 1.5, 0], eL: .5, hL: 'open', aR: [.8, 1.2, 0], eR: .8, hR: 'claw', lL: [.3, .35, .3], kL: .4, lR: [-.35, .3, -.2], kR: .6, face: expr('pain') },
  hlk_shrink: { sp: .9, hp: .6, aL: [.9, -.6, 0], eL: 2.2, hL: 'claw', aR: [1.0, -.5, 0], eR: 2.1, hR: 'claw', lL: [1.5, .3, .1], kL: 2.1, lR: [1.3, .3, 0], kR: 2.2, fR: .8, face: expr('pain') },
  hlk_confused: { sp: .15, hp: .05, hr: .25, aL: [.3, 1.1, 0], eL: 1.1, hL: 'open', aR: [.25, 1.2, 0], eR: .7, hR: 'relax', lL: [.12, .2, .2], kL: .25, lR: [.08, .2, -.2], kR: .22, face: expr('confused') },
  yuj_eat: { sp: .15, hp: .15, aR: [1.0, -.3, 0], eR: 2.3, hR: 'grip', aL: [.5, .6, 0], eL: 1.4, hL: 'relax', lL: [1.45, .25, .1], kL: 1.5, lR: [1.4, .3, -.1], kR: 1.45, ground: false, face: expr('chew') },
  yuj_sit: { sp: .1, hp: .0, aR: [.5, .5, 0], eR: 1.3, hR: 'relax', aL: [.5, .6, 0], eL: 1.3, hL: 'relax', lL: [1.45, .3, .1], kL: 1.5, lR: [1.4, .3, -.1], kR: 1.45, ground: false, face: expr('stoic') },
  yuj_sniff: { sp: -.12, hp: -.5, aL: [.2, .6, 0], eL: .3, aR: [.2, .6, 0], eR: .3, hL: 'relax', hR: 'relax', lL: [.05, .16, .2], kL: .08, lR: [0, .16, -.2], kR: .06, face: expr('sniff') },
  yuj_walk: POSES.yuj_stand, yuj_axeKickWind: { sp: -.3, hp: .1, aL: [1.0, 1.3, 0], eL: .6, hL: 'fist', aR: [.9, 1.3, 0], eR: .6, hR: 'fist', lR: [2.9, .05, 0], kR: .02, fR: .5, lL: [-.05, .12, 0], kL: .1, face: expr('relish') },
  yuj_axeKick: { sp: .35, hp: .2, aL: [.8, 1.2, 0], eL: .7, hL: 'fist', aR: [.7, 1.2, 0], eR: .7, hR: 'fist', lR: [1.2, .05, 0], kR: .05, fR: .4, lL: [-.25, .12, 0], kL: .35, pump: 1, face: expr('oniGrin') },
  yuj_backhandWind: { sp: .05, st: -.8, aR: [1.2, -.9, 0], eR: 1.8, hR: 'fist', aL: [.4, .5, 0], eL: .5, lL: [.3, .15, .2], kL: .35, lR: [-.3, .15, -.2], kR: .25, face: expr('stoic') },
  yuj_backhand: { sp: .1, st: .7, aR: [1.5, 1.3, 0], eR: .15, hR: 'fist', wR: [-.5, 0], aL: [.4, .5, 0], eL: .5, lL: [.3, .15, .2], kL: .35, lR: [-.3, .15, -.2], kR: .25, face: expr('stoic') },
  yuj_guardless: { sp: -.1, hp: -.2, aL: [.75, 1.35, 0], eL: .35, hL: 'open', aR: [.75, 1.35, 0], eR: .35, hR: 'open', lL: [.05, .2, .2], kL: .1, lR: [0, .2, -.2], kR: .08, face: expr('relish') },
  yuj_catch: { sp: .05, st: -.3, hp: .0, aR: [1.55, .05, 0], eR: .3, hR: 'open', wR: [-.9, 0], aL: [.2, .6, 0], eL: .3, lL: [.2, .14, .2], kL: .25, lR: [-.3, .14, -.2], kR: .2, face: expr('stoic') },
  yuj_flick: { sp: .05, hp: -.1, aR: [1.5, .0, 0], eR: .25, hR: 'pinch', aL: [.18, .32, 0], eL: .4, hL: 'hid', lL: [.1, .14, .2], kL: .12, lR: [-.08, .14, -.2], kR: .1, face: expr('stoic') },
  yuj_oniFlex: POSES.yuj_flex, yuj_walkPocket: POSES.yuj_walk1,
  yuj_crouchPunchGround: { sp: .9, hp: -.4, aR: [1.0, -.05, 0], eR: .1, hR: 'fist', aL: [.6, .9, 0], eL: .9, hL: 'open', lL: [1.4, .3, .2], kL: 2.1, lR: [.2, .3, -.2], kR: 2.4, fR: 1.0, pump: 1, face: expr('oniGrin') },
  ban_crawl: { pitch: .9, sp: .3, hp: -.7, aL: [1.3, .1, 0], eL: .5, hL: 'flat', aR: [1.0, .2, 0], eR: .9, hR: 'flat', lL: [1.4, .1, 0], kL: 1.6, lR: [.8, .1, 0], kR: 1.9, ground: false, face: expr('exhausted') },
  ban_lookUp: { sp: -.15, hp: -.5, aL: [.5, .3, 0], eL: .3, hL: 'flat', aR: [.55, .3, 0], eR: .3, hR: 'flat', lL: [1.5, .15, .1], kL: 2.1, lR: [1.3, .15, 0], kR: 2.2, fR: .9, face: expr('afraid') },
  ban_lie: { ground: 'all', rest: .1, pitch: -1.5, sp: 0, hp: .1, aL: [.3, 1.2, 0], eL: .4, aR: [.4, 1.0, 0], eR: .6, lL: [.1, .1, 0], kL: .3, lR: [.2, .15, 0], kR: .5, face: expr('exhausted') },
});
SIGNATURE.hulk.push('hlk_haymaker', 'hlk_groundPound', 'hlk_grabSwing', 'hlk_meteor', 'hlk_stagger', 'hlk_shrink', 'hlk_confused');
SIGNATURE.yujiro.push('yuj_eat', 'yuj_sniff', 'yuj_axeKickWind', 'yuj_axeKick', 'yuj_backhand', 'yuj_guardless', 'yuj_catch', 'yuj_flick', 'yuj_crouchPunchGround');
SIGNATURE.banner.push('ban_crawl', 'ban_lookUp', 'ban_lie');
// ---------------------------------------------------------------------------------------------------- scale cameras (Hulk 2.5 m vs Yujiro 1.92 m)
// camLowTwo: both in frame from a low camera (Hulk towers); o = camGroup options + {h (camera height floor, m), el (default -.12)}
function camLowTwo(figs, t, o = {}) { const c = camGroup(figs, t, Object.assign({ fill: .7, fov: 34, el: -.1 }, o)); if (c.pos[1] < (o.h || .35)) { const dy = (o.h || .35) - c.pos[1]; c.pos = vAdd(c.pos, [0, dy, 0]); c.target = vAdd(c.target, [0, dy * .5, 0]); } return c; }
// camLookUp: over the small fighter's shoulder, low, looking UP at the big one (o.side 'L'|'R', dist, fov); swap args for the reverse (big looking down)
function camLookUp(small, big, t, o = {}) { const A = figSkel(small, small.timing > 1 ? onN(t, small.timing) : t), B = figSkel(big, big.timing > 1 ? onN(t, big.timing) : t), sg = o.side === 'L' ? 1 : -1;
  const d = vNorm(vSub([B.J.head[0], 0, B.J.head[2]], [A.J.head[0], 0, A.J.head[2]])), side = vCross([0, 1, 0], d), k = A.B.h / 1.8;
  const pos = vAdd(vAdd(A.J.neck, vMul(d, -(o.dist || .9) * k)), vAdd(vMul(side, sg * .45 * k), [0, (o.dy == null ? -.35 : o.dy) * k, 0])); return { pos, target: vLerp(B.J.head, B.J.neck, o.tgt == null ? .5 : o.tgt), fov: o.fov || 40, roll: o.roll || 0 }; }
// camGiant: near-ground worm's-eye camera close to a figure (Hulk looks colossal); o = {az (rel. to facing), dist (m), h, fov, look (0 feet..1 head)}
function camGiant(F, t, o = {}) { const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, yaw = (S.pose.yaw || 0) + (o.az == null ? .35 : o.az), base = [S.J.pelvis[0], 0, S.J.pelvis[2]];
  const pos = vAdd(base, [Math.sin(yaw) * (o.dist || 3.2) * k, o.h || .3, Math.cos(yaw) * (o.dist || 3.2) * k]); return { pos, target: vLerp(S.J.pelvis, S.J.head, o.look == null ? .75 : o.look), fov: o.fov || 44, roll: o.roll || 0 }; }
