/* engine/chars_ij.js (agent E, project itachi-vs-julius) - ITACHI UCHIHA (Naruto Shippuden) and JULIUS NOVACHRONO (Black Clover).
   ITACHI: ~1.78 m, slim, long black hair: centre-parted bangs to the chin + low ponytail at the nape, two long TEAR-TROUGH lines under the eyes,
     Konoha forehead protector with the scratch through the leaf, AKATSUKI cloak (black, red clouds with white outline, red lining, tall standing collar),
     dark trousers + shinobi sandals.  Eyes: onyx black | Sharingan (red, 3 tomoe) | Mangekyo (Itachi's three curved blades).
   FORMS  itachi: base | sharingan (shar 1) | mangekyo (mang 1) | sick (pale, deeper eye lines, worn) | sick_mangekyo | nocloak (grey flak vest + mesh, no cloak)
          julius: see the JULIUS block below (base | magic | manazone | chrono | casual | wounded)
   POSE FIELDS (numeric fields interpolate)
     itachi : shar 0..1 (Sharingan), mang 0..1 (Mangekyo morph), spin (tomoe rotation, rad), bleed 0..1 (blood tear from the right eye: Amaterasu / Tsukuyomi),
              blood 0..1 (cough blood at the mouth), collarUp 0..1 (standing collar closed up to the nose), kunai 'R'|'L' (+ kunaiRev true = reverse grip),
              shuriken 'R'|'L' (held between the fingers), eyeGlow 0..1 (red glow from the eyes in the dark)
     julius : see the JULIUS block
   Helpers: IJ.sharIris(c, x, y, r, o) (screen-space eye for inserts), IJ.itaRun(ph, over), IJ.julRun(ph, over)                                       */
'use strict';
var IJ = window.IJ || {};
window.IJ = IJ;
IJ.col = {
  iSkin: '#e8cfb4', iSkinShade: '#c09480', iHair: '#101014', iHairShade: '#050408', iHairGloss: '#4a4a66', iEye: '#1c1618',
  cloak: '#0f0f14', cloakLin: '#7a0e1c', cloud: '#c8202a', cloudEdge: '#f4f0ea', pants: '#262836', sandal: '#22242e', band: '#22283c',
  shar: '#d4101e', sharDark: '#5a0006', sharLight: '#ff6a5a', tomoe: '#0c0204', susanoo: '#ff4a3a',
  jSkin: '#eec9a6', jSkinShade: '#c8957a', jHair: '#f1dfa0', jHairShade: '#c9a95a', jHairGloss: '#fff8dc', jEye: '#8fb4d8',
  robe: '#f4efe4', robeShade: '#c8c0b0', gold: '#e8b84a', goldDark: '#9a6a10', jNavy: '#3a3f6a', jNavyLin: '#2a2e52', jPants: '#e2dccc', clock: '#8ad8ff', time: '#f6d36a',
};
// ------------------------------------------------------------------------------------------------------------- expressions (everyone)
Object.assign(EXPR, {
  itaCalm: { eye: .62, lid: .3, brow: -.05, browA: .12, pupil: .9, mouth: 'line', mouthW: .65 },
  itaStare: { eye: .8, lid: .32, brow: -.22, browA: .4, pupil: .75, mouth: 'line', mouthW: .6 },
  itaSoft: { eye: .5, lid: .22, brow: .18, browA: -.25, pupil: 1, mouth: 'smile', mouthW: .55 },
  itaSad: { eye: .55, lid: .3, brow: .25, browA: -.45, pupil: .95, mouth: 'line', mouthW: .55 },
  itaPain: { eye: .4, lid: .55, brow: .2, browA: -.55, pupil: .9, mouth: 'pain', mouthOpen: .3, mouthW: .8, sweat: 1 },
  itaCough: { eye: .15, lid: .4, brow: .35, browA: -.6, mouth: 'o', mouthOpen: .55, mouthW: .7, closed: 1 },
  itaCold: { eye: .7, lid: .45, brow: -.3, browA: .5, pupil: .7, mouth: 'line', mouthW: .5, shadow: .3 },
  julGrin: { eye: .95, lid: -.05, brow: .35, browA: -.15, pupil: 1, mouth: 'grin', mouthOpen: .55, mouthW: 1.45 },
  julWonder: { eye: 1.18, lid: -.15, brow: .55, browA: -.25, pupil: .9, mouth: 'open', mouthOpen: .45, mouthW: 1.0, glint: 1 },
  julSmile: { eye: .78, lid: .05, brow: .2, browA: -.1, pupil: 1, mouth: 'smile', mouthW: .9 },
  julSerious: { eye: .88, lid: .3, brow: -.25, browA: .45, pupil: .8, mouth: 'line', mouthW: .7 },
  julFierce: { eye: 1.0, lid: .35, brow: -.4, browA: .65, pupil: .7, mouth: 'teeth', mouthOpen: .3, mouthW: 1.1 },
  julShout: { eye: 1.05, lid: .3, brow: -.4, browA: .7, pupil: .7, mouth: 'shout', mouthOpen: 1, mouthW: 1.2 },
  julSense: { eye: 0, closed: 1, lid: .1, brow: .05, browA: .1, mouth: 'smile', mouthW: .85 },
  sad: { eye: .55, lid: .3, brow: .25, browA: -.45, pupil: .95, mouth: 'line', mouthW: .6 }, smile_soft: { eye: .5, lid: .22, brow: .18, browA: -.25, mouth: 'smile', mouthW: .55 },
  cough: { eye: .15, lid: .4, brow: .35, browA: -.6, mouth: 'o', mouthOpen: .55, mouthW: .7, closed: 1 }, delight: { eye: 1.1, lid: -.1, brow: .5, browA: -.2, pupil: .95, mouth: 'laugh', mouthOpen: .8, mouthW: 1.5, glint: 1 },
  eyes_closed: { eye: 0, closed: 1, lid: .1, brow: .05, browA: .1, mouth: 'smile', mouthW: .85 },
  julThrilled: { eye: 1.1, lid: -.1, brow: .5, browA: -.2, pupil: .95, mouth: 'laugh', mouthOpen: .8, mouthW: 1.5, glint: 1 },
});
// ------------------------------------------------------------------------------------------------------------- SHARINGAN / MANGEKYO (eye-local, y up)
IJ.drawShar = (c, x, y, ir, k, mk, spin, opt = {}) => {   // k = sharingan amount, mk = mangekyo amount (0..1), ir = iris radius (local units)
  const ry = opt.ry || 1.18;
  c.save(); c.beginPath(); c.ellipse(x, y, ir, ir * ry, 0, 0, TAU); c.clip();
  c.globalAlpha = clamp(k, 0, 1); const gr = c.createRadialGradient(x, y + ir * .1, ir * .1, x, y, ir * 1.1); gr.addColorStop(0, IJ.col.sharLight); gr.addColorStop(.55, IJ.col.shar); gr.addColorStop(1, IJ.col.sharDark);
  c.fillStyle = gr; c.fillRect(x - ir * 1.3, y - ir * 1.5, ir * 2.6, ir * 3);
  c.strokeStyle = IJ.col.tomoe; c.lineWidth = ir * .1; c.beginPath(); c.ellipse(x, y, ir * .97, ir * ry * .97, 0, 0, TAU); c.stroke();
  const tk = clamp(1 - mk * 1.6, 0, 1), mm = clamp(mk * 1.6 - .6, 0, 1);
  c.fillStyle = IJ.col.tomoe;
  if (tk > 0) {   // ring + pupil + 3 tomoe
    c.globalAlpha = clamp(k, 0, 1) * tk; c.lineWidth = ir * .05; c.strokeStyle = rgba('#2a0004', .8); c.beginPath(); c.ellipse(x, y, ir * .58, ir * .58 * ry, 0, 0, TAU); c.stroke();
    c.beginPath(); c.ellipse(x, y, ir * .22, ir * .22 * ry, 0, 0, TAU); c.fill();
    for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3, tx = x + Math.cos(a) * ir * .58, ty = y + Math.sin(a) * ir * .58 * ry, r = ir * .15;
      c.beginPath(); c.arc(tx, ty, r, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(tx + Math.cos(a + HP) * r, ty + Math.sin(a + HP) * r); c.quadraticCurveTo(tx + Math.cos(a + .9) * r * 3, ty + Math.sin(a + .9) * r * 3, tx + Math.cos(a + .25) * r * 2.9, ty + Math.sin(a + .25) * r * 2.9);
      c.lineTo(tx + Math.cos(a - HP) * r * .7, ty + Math.sin(a - HP) * r * .7); c.fill(); } }
  if (mm > 0) {   // Itachi's Mangekyo: black centre disc + three curved blades sweeping out to the rim (pinwheel)
    c.globalAlpha = clamp(k, 0, 1) * mm; c.save(); c.translate(x, y); c.scale(1, ry); c.rotate(spin * .3 + (1 - mm) * 1.5);
    for (let i = 0; i < 3; i++) { c.rotate(TAU / 3); c.beginPath(); c.moveTo(-ir * .18, -ir * .12); c.quadraticCurveTo(ir * .2, -ir * .62, ir * .98, -ir * .2); c.lineTo(ir * 1.02, ir * .16);
      c.quadraticCurveTo(ir * .62, -ir * .05, ir * .3, ir * .14); c.quadraticCurveTo(ir * .1, ir * .2, -ir * .05, ir * .22); c.closePath(); c.fill(); }
    c.beginPath(); c.arc(0, 0, ir * .33, 0, TAU); c.fill(); c.globalAlpha *= .9; c.fillStyle = IJ.col.shar; c.beginPath(); c.arc(0, 0, ir * .09, 0, TAU); c.fill(); c.restore(); }
  c.restore();
};
IJ.sharIris = (c, x, y, r, o = {}) => { c.save(); c.translate(x, y); c.scale(1, -1); IJ.drawShar(c, 0, 0, r, o.k == null ? 1 : o.k, o.mk || 0, o.spin || 0, { ry: 1 }); c.restore(); };
IJ.itaEyeHook = (st, S, D, e) => {
  const p = S.pose; if (p.eyes === 'blind' || D.blind) { st.irisCol = '#a8aab4'; st.irisDark = '#7a7c88'; st.irisLight = '#d0d2da'; st.pupilCol = '#8a8c96'; st.pupilR = .35; return; }
  if (p.eyes === 'black') return; const k = p.shar != null ? p.shar : (D.sharDefault || 0), mk = p.mang != null ? p.mang : (D.mangDefault || 0), sp = p.spin || 0, sk = Math.max(k, mk);
  if (sk <= .01) return; st.irisFn = (c, icx, icy, ir) => IJ.drawShar(c, icx, icy, ir * 1.04, sk, mk, sp); st.lidShade = '#4a0a14';
};
// tear-trough lines (two long creases from the inner corner down the cheek) + blood tear + cough blood
IJ.itaMarkings = (c, HM, e, lod, D) => {
  const k = D.troughK || 1, col = D.troughCol || '#7a4a44';
  for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .25, -.36, .55, .5); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => {
    cc.strokeStyle = col; cc.lineCap = 'round'; cc.lineWidth = .045 * k; cc.beginPath(); cc.moveTo(.1, .3); cc.quadraticCurveTo(.04, .02, -.1, -.22); cc.stroke(); }, .02, fr.n); }
  const bl = D._bleed || 0; if (bl > .01) { const fr = faceFrame(HM, -.42, -.31, .55, .55); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = rgba('#a8000e', .92);
    cc.beginPath(); cc.moveTo(-.05, .1); cc.quadraticCurveTo(-.03, -.5 * bl, -.06, -1.1 * bl); cc.arc(-.03, -1.12 * bl, .035, Math.PI, 0, true); cc.quadraticCurveTo(.01, -.5 * bl, .05, .1); cc.closePath(); cc.fill(); }, .02, fr.n); }
  if (e.blood) { const fr = faceFrame(HM, .14, -.84, .45, .3); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = rgba('#9a000c', .9); const L = .9 * clamp(e.blood, 0, 1.5); cc.beginPath(); cc.moveTo(-.08, .1); cc.quadraticCurveTo(-.02, -L * .5, -.05, -L); cc.arc(0, -L, .05, Math.PI, 0, true); cc.quadraticCurveTo(.06, -L * .5, .1, .1); cc.closePath(); cc.fill(); }, .02, fr.n); }
};
// ------------------------------------------------------------------------------------------------------------- hair
IJ.itachiHair = (o = {}) => () => { const r = i => hash(i * 6.13 + 7), loose = o.loose || 0; return [
  // crown + back swept to the low ponytail (slightly spiky tips at the back of the crown)
  ...lockFan(11, 1.3, 4.98, .5, (th, u, i) => ({ len: .8 + .3 * r(i), w: .55, rootR: .95, dir: dirOut(th + (r(i + 2) - .5) * .3, -.3 + .2 * r(i + 3), .85, -.6), curl: [(r(i + 4) - .5) * .5, -.2, -.3], grav: .45, tw: .34, tip: 1.55, back: true, seg: 6, gloss: i % 4 === 0 })),
  ...lockFan(6, 1.7, 4.58, 1.0, (th, u, i) => ({ len: .75 + .2 * r(i + 10), w: .62, rootR: .97, dir: dirOut(th, .1, .9, -.9), curl: [(r(i + 11) - .5) * .4, -.4, -.2], grav: .5, tw: .36, tip: 1.5, back: true, seg: 6 })),
  // ponytail at the nape (long, falls down the back)
  { th: Math.PI, ph: -.15, len: 2.7 + loose, w: .34, rootR: 1.0, dir: [0, -.6, -.75], grav: 1.6, tw: .42, tip: 1.3, back: true, seg: 11, wave: [.2, 1.5], waveAxis: [1, 0, 0], sway: .5 },
  { th: Math.PI + .14, ph: -.12, len: 2.4 + loose, w: .26, rootR: 1.0, dir: [.06, -.6, -.75], grav: 1.6, tw: .4, tip: 1.3, back: true, seg: 10, sway: .5 },
  // centre-parted long bangs framing the face down to the chin
  { th: .3, ph: .74, len: 1.8, w: .44, rootR: .97, dir: [.55, -.15, .8], curl: [.25, -1.05, -.1], grav: 1.25, tw: .3, tip: 1.5, seg: 8, front: true, gloss: true },
  { th: -.3, ph: .74, len: 1.8, w: .44, rootR: .97, dir: [-.55, -.15, .8], curl: [-.25, -1.05, -.1], grav: 1.25, tw: .3, tip: 1.5, seg: 8, front: true, gloss: true },
  { th: .58, ph: .62, len: 1.45, w: .4, rootR: .97, dir: [.8, -.25, .5], curl: [.1, -1, 0], grav: 1.1, tw: .3, tip: 1.5, seg: 7, front: true },
  { th: -.58, ph: .62, len: 1.45, w: .4, rootR: .97, dir: [-.8, -.25, .5], curl: [-.1, -1, 0], grav: 1.1, tw: .3, tip: 1.5, seg: 7, front: true },
  { th: .12, ph: .86, len: .6, w: .34, rootR: .965, dir: [.9, .1, .6], curl: [.2, -.9, 0], grav: .6, tw: .3, tip: 1.5, seg: 5, front: true },
  { th: -.12, ph: .86, len: .6, w: .34, rootR: .965, dir: [-.9, .1, .6], curl: [-.2, -.9, 0], grav: .6, tw: .3, tip: 1.5, seg: 5, front: true },
  // locks hanging beside the ears
  { th: 1.1, ph: .35, len: 1.35, w: .42, rootR: .97, dir: [.4, -.9, .15], grav: 1.0, tw: .3, tip: 1.4, seg: 7 },
  { th: -1.1, ph: .35, len: 1.35, w: .42, rootR: .97, dir: [-.4, -.9, .15], grav: 1.0, tw: .3, tip: 1.4, seg: 7 },
]; };
// ------------------------------------------------------------------------------------------------------------- Akatsuki cloud motif (local units: width 2, y down)
IJ.cloudPath = (cc) => { cc.beginPath(); cc.moveTo(-1, .38); cc.bezierCurveTo(-1.15, .1, -.95, -.18, -.68, -.12); cc.bezierCurveTo(-.66, -.48, -.25, -.6, -.08, -.32);
  cc.bezierCurveTo(.05, -.66, .58, -.62, .6, -.22); cc.bezierCurveTo(.92, -.3, 1.12, .02, .98, .3); cc.bezierCurveTo(.9, .48, .6, .42, .55, .36); cc.bezierCurveTo(.3, .5, -.2, .5, -.42, .38);
  cc.bezierCurveTo(-.62, .52, -.92, .52, -1, .38); cc.closePath(); };
IJ.cloud = (cc, col, edge) => { IJ.cloudPath(cc); cc.lineJoin = 'round'; cc.lineWidth = .3; cc.strokeStyle = edge || IJ.col.cloudEdge; cc.stroke(); cc.fillStyle = col || IJ.col.cloud; cc.fill();
  cc.lineWidth = .07; cc.strokeStyle = rgba('#1a0408', .9); cc.stroke(); cc.strokeStyle = rgba('#5a0008', .6); cc.lineWidth = .05; cc.beginPath(); cc.moveTo(-.55, .25); cc.quadraticCurveTo(-.35, .02, -.08, .14); cc.moveTo(.1, .12); cc.quadraticCurveTo(.35, -.05, .58, .14); cc.stroke(); };
IJ.CLOUDS = [[.5, .3, 1.1], [.36, .55, .95], [.64, .6, .95], [.5, .84, 1], [.2, .34, .9], [.8, .36, .9], [.1, .66, .85], [.9, .7, .85], [.28, .86, .9], [.72, .88, .9], [.6, .12, .7], [.4, .14, .7]];
IJ.cloakClouds = (c, surf, G, sg, S, D) => { if (sg < 0 || LIGHT.override) return; const k = S.B.h / 1.8;
  for (const [u, v, s] of IJ.CLOUDS) { const fr = surfFrame(surf, u, v); if (vDot(fr.n, toCam(fr.p)) <= .04) continue; const tu = vMul(vNorm(fr.du), .085 * k * s), tv = vMul(vNorm(fr.dv), .085 * k * s);
    decal(c, fr.p, tu, tv, cc => IJ.cloud(cc), .04, fr.n); } };
IJ.sleeveClouds = (c, surf, G, sg, side, S, D) => { if (sg < 0 || LIGHT.override) return; const k = S.B.h / 1.8;
  for (const u of [.25, .75]) { const fr = surfFrame(surf, u, .62); if (vDot(fr.n, toCam(fr.p)) <= .05) continue; decal(c, fr.p, vMul(vNorm(fr.du), .07 * k), vMul(vNorm(fr.dv), .07 * k), cc => IJ.cloud(cc), .05, fr.n); } };
// tall standing collar of the cloak (black outside, red lining), front gap opens/closes with pose.collarUp
IJ.cloakCollar = (S, D, parts, opt, up) => { const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.headBase) + .02, fn: c => { const T = torsoModel(S, D, .04 * k), ctr = vLerp(S.J.neck, S.J.headBase, .1), gap = lerp(.7, .22, up), hgt = lerp(.17, .24, up) * k;
  const surf = { nu: 26, nv: 4, wrapU: false, fn: (u, v) => { const th = lerp(gap, TAU - gap, u), b = T.ringAt(.965, th, .02 * k); const rad = vNorm(vSub(b, ctr)); return vAdd(vMad(b, rad, v * v * .05 * k + v * .012 * k), [0, v * hgt, 0]); } };
  drawSurf(c, sampleSurf(surf), Object.assign({ col: D.collarCol || IJ.col.cloak, side: 'both', backCol: D.collarLin || IJ.col.cloakLin, shade: .12, borders: { v1: true, u0: true, u1: true } }, opt.surf || {})); } }); };
// kunai / shuriken held in a hand (screen-space drawing at projected 3D points)
IJ.kunaiPart = (S, D, parts, opt, side, rev, t) => { const hg = handGeom(S, side, S.pose['h' + side] || 'grip'), k = S.B.h / 1.8; if (!hg) return;
  const fwd = vNorm(vSub(S.J['hand' + side], S.J['wr' + side])), up = vNorm(vCross(fwd, vCross([0, 1, 0], fwd))), dir = rev ? vMul(up, -1) : up, base = hg.palmC;
  const butt = vMad(base, dir, -.07 * k), tip = vMad(base, dir, .2 * k), mid = vMad(base, dir, .05 * k);
  parts.push({ z: camDepth(base) - .03, fn: c => { if (opt.mode === 'flat') return; const a = project(butt), m = project(mid), b = project(tip); if (!a || !b || !m) return;
    const s = Math.max(1.2, a.s * .012 * k), dx = b.x - m.x, dy = b.y - m.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#1a1820'; c.lineWidth = s * 1.3; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(m.x, m.y); c.stroke();
    c.strokeStyle = '#0a0a0e'; c.lineWidth = Math.max(1, s * .5); c.beginPath(); c.arc(a.x - dx / L * s * 1.4, a.y - dy / L * s * 1.4, s * 1.4, 0, TAU); c.stroke();
    c.fillStyle = '#8a90a0'; c.strokeStyle = '#141418'; c.lineWidth = Math.max(1, s * .45); c.beginPath(); c.moveTo(m.x + nx * s * 1.6, m.y + ny * s * 1.6); c.lineTo(b.x, b.y); c.lineTo(m.x - nx * s * 1.6, m.y - ny * s * 1.6); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(.8, s * .3); c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(b.x, b.y); c.stroke(); c.restore(); } }); };
IJ.shurikenPart = (S, D, parts, opt, side, t) => { const hg = handGeom(S, side, S.pose['h' + side] || 'sign'), k = S.B.h / 1.8; if (!hg) return; const p = vAdd(hg.palmC, [0, .06 * k, 0]);
  parts.push({ z: camDepth(p) - .03, fn: c => { if (opt.mode === 'flat') return; const q = project(p); if (!q) return; IJ.drawShuriken(c, q.x, q.y, .07 * k * q.s, t * 2); } }); };
IJ.drawShuriken = (c, x, y, r, rot) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#7a8090'; c.strokeStyle = '#121216'; c.lineWidth = Math.max(1, r * .1); c.beginPath();
  for (let i = 0; i < 4; i++) { const a = i * HP; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(Math.cos(a + HP / 2) * r * .28, Math.sin(a + HP / 2) * r * .28); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#121216'; c.beginPath(); c.arc(0, 0, r * .12, 0, TAU); c.fill(); c.restore(); };
// long closed coat: keep the trouser top / thighs behind the coat's front panel (low cameras) unless that leg is kicked up through the opening
IJ.coatOrder = (S, D, parts) => { const H = haoriSpec(D); if (H.none || (H.len || 0) < .6 || parts.length < 8) return; const zf = parts[1].z, p = S.pose;
  const up = sd => { const l = p['l' + sd]; return l && l[0] > .95; };
  parts[3].z = Math.max(parts[3].z, zf + .002); if (!up('L')) parts[4].z = Math.max(parts[4].z, zf + .003); if (!up('R')) parts[6].z = Math.max(parts[6].z, zf + .003); };
// ------------------------------------------------------------------------------------------------------------- ITACHI
CAST.itachi = design(SHINIGAMI, {
  name: 'Itachi Uchiha', h: 1.78, body: { width: .9, limbs: .95, shoulders: 1.0, depth: .9, legs: 1.04, neck: 1.02 }, skin: IJ.col.iSkin, skinShade: IJ.col.iSkinShade,
  kosode: IJ.col.cloak, collar: { none: true }, obi: null, neckSkin: IJ.col.iSkin, handSkin: IJ.col.iSkin,
  sleeve: { col: IJ.col.cloak, lining: IJ.col.cloakLin, r0: .085, r1: .1, r2: .125, sag: .1, len: 1.0, patternFn: IJ.sleeveClouds },
  hakama: { col: IJ.col.pants, r0: .1, r1: .085, r2: .074, pleats: false, ties: false },
  haori: { col: IJ.col.cloak, lining: IJ.col.cloakLin, len: .86, sleeves: true, hem: 'none', kanji: null, open: .025, flare: .3, collarLen: .3, patternFn: IJ.cloakClouds },
  feet: { col: IJ.col.sandal, sandal: false, w: 1.0, shaft: .1, shaftCol: '#2c2e3a', shaftR: 1.05, soleCol: '#101016', soleH: .015 },
  bandScratch: true, bandCol: IJ.col.band,
  face: {
    eye: { w: 1.12, h: .4, irisR: .38, irisCol: IJ.col.iEye, irisLight: '#4a3a40', irisDark: '#060406', tilt: .07, thick: 1.3, flick: .07, lashes: true, crease: true, pupilR: .45, lidShade: '#5a4a5a', ink: '#120c12' },
    eyeSize: .41, eyeY: -.2, defaultExpr: 'itaCalm', brow: { browW: .055, browY: .06, browCol: '#141218' }, headShape: { jaw: .86, chin: .97, width: .92 }, noseK: .9,
    mouth: { mouthW: .85 }, mouthSize: .24, mouthY: -.78,
    hair: { col: IJ.col.iHair, shadeCol: IJ.col.iHairShade, gloss: true, glossCol: IJ.col.iHairGloss, springK: 34, springC: 5, cap: { front: .5, side: .05, back: -.9 }, locks: IJ.itachiHair() },
    markings: (c, HM, e, lod, D) => IJ.itaMarkings(c, HM, e, lod, D),
    eyeHook: (st, S, D, e) => IJ.itaEyeHook(st, S, D, e),
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => IJ.itaHeadParts(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['itaCalm', 'itaStare', 'itaCold', 'itaSoft', 'itaSad', 'itaPain', 'itaCough', 'calm', 'shock', 'determined', 'angry', 'eyesClosed', 'surprised', 'exhausted'],
  extras: (S, D, F, t, parts, opt) => IJ.itaExtras(S, D, F, t, parts, opt),
  forms: {
    base: {},
    sharingan: { sharDefault: 1 },
    mangekyo: { sharDefault: 1, mangDefault: 1 },
    sick: { sharDefault: 1, skin: '#f0ddd2', skinShade: '#b49aa0', neckSkin: '#f0ddd2', handSkin: '#f0ddd2', troughK: 1.35, troughCol: '#5a3238', wounds: 1 },
    sick_mangekyo: { sharDefault: 1, mangDefault: 1, skin: '#f0ddd2', skinShade: '#b49aa0', neckSkin: '#f0ddd2', handSkin: '#f0ddd2', troughK: 1.35, troughCol: '#5a3238', wounds: 2 },
    nocloak: { haori: { none: true }, sleeve: { col: '#2a2c36', lining: '#1a1a22', r0: .07, r1: .068, r2: .064, sag: .02, len: 1.0 }, kosode: '#4a5048', noCollar: true,
      torsoTones: [{ col: '#2a2c36', mask: (u, v) => .62 - v }] },
  },
});
(function () { const D = CAST.itachi, f0 = D.face;
  for (const fm of ['sick', 'sick_mangekyo']) D.forms[fm].face = Object.assign({}, f0, { eye: Object.assign({}, f0.eye, { lidShade: '#4a2a3a' }), defaultExpr: 'itaCalm' });
})();
CAST.itachi.drawHead = stdHead(CAST.itachi);
CAST.itachi.figAlpha = (P) => P.dissolve != null && P.dissolve > .005 ? clamp(1 - P.dissolve * 1.6, 0, 1) : P.figAlpha;
CAST.itachi.forms.blind = { blind: true, wounds: 2, skin: '#f0ddd2', skinShade: '#b49aa0', neckSkin: '#f0ddd2', handSkin: '#f0ddd2', troughK: 1.35, troughCol: '#5a3238' };
IJ.itaHeadParts = (S, D, F, t, parts, opt, HM, e, zc) => {
  const p = S.pose; D._bleed = p.bleed || 0; if (p.blood) e.blood = p.blood; if (D.blood && p.blood == null) e.blood = D.blood;
  if (p.headband !== false && typeof nlHeadband === 'function') parts.push({ z: zc - .0003, fn: c => nlHeadband(c, HM, opt, D) });
  const g = p.eyeGlow || 0; if (g > .01) parts.push({ z: zc - HM.r * 1.15, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; if (vDot(HM.M[2], toCam(HM.c)) < .05) return; const sc = project(HM.c), pxR = HM.r * (sc ? sc.s : 100);
    c.save(); c.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) { const q = project(vMad(HM.at(sg * .46, -.21), HM.M[2], HM.r * .05)); if (!q) continue; glow(c, q.x, q.y, pxR * .26 * g, '#ff2a1a', .25 * g); glow(c, q.x, q.y, pxR * .07, '#ffb0a0', .3 * g); } c.restore(); } });
};
IJ.itaExtras = (S, D, F, t, parts, opt) => {
  const p = S.pose; IJ.coatOrder(S, D, parts); if (!D.noCollar && !(D.haori && D.haori.none)) IJ.cloakCollar(S, D, parts, opt, p.collarUp != null ? p.collarUp : (D.collarUp || .7));
  if (p.kunai) IJ.kunaiPart(S, D, parts, opt, p.kunai, !!p.kunaiRev, t);
  if (p.shuriken) IJ.shurikenPart(S, D, parts, opt, p.shuriken, t);
  const dz = p.dissolve || 0; if (dz > .005 && opt.mode !== 'flat') parts.push({ z: camDepth(S.J.abd) - .6, noAlpha: true, fn: c => { if (LIGHT.override) return; fxCrows(c, dz * .9, { c: S.J.abd, n: 44, r: 3.4, mode: 'burst', dur: .9, seed: 11, size: .4 }); if (typeof fxFeathers === 'function') fxFeathers(c, S.J.abd, dz * 1.6, { n: 14, r: 1.4 }); } });
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0));
};
// ------------------------------------------------------------------------------------------------------------- ITACHI POSES
Object.assign(POSES, {
  ita_stand: { sp: 0, hp: .05, aL: [.16, .32, 0], eL: .3, hL: 'relax', aR: [.16, .32, 0], eR: .3, hR: 'relax', lL: [.02, .06, .1], lR: [-.02, .06, -.1], face: expr('itaCalm') },
  ita_cloakHand: { sp: 0, hp: .06, aL: [.14, .3, 0], eL: .25, hL: 'relax', aR: [.5, -.95, 0], eR: 1.75, hR: 'flat', wR: [.3, 0], lL: [.03, .06, .1], lR: [-.03, .06, -.1], face: expr('itaCalm') },
  ita_sign: { sp: .05, hp: .08, aL: [.72, -.6, .3], eL: 1.95, hL: 'sign', aR: [.72, -.5, -.3], eR: 2.0, hR: 'sign', lL: [.12, .22, .15], kL: .15, lR: [-.05, .22, -.15], kR: .1, face: expr('itaStare') },
  ita_fireball: { sp: -.12, hp: -.1, aL: [.95, -.35, .3], eL: 1.6, hL: 'sign', aR: [1.3, -.5, 0], eR: 2.4, hR: 'sign', lL: [.35, .3, .25], kL: .45, lR: [-.2, .3, -.25], kR: .2, face: expr('itaStare', { mouth: 'o', mouthOpen: .6 }) },
  ita_throwWind: { sp: .1, st: .55, hp: .05, hy: -.3, aL: [1.2, .1, 0], eL: .6, hL: 'open', aR: [1.9, 1.3, 0], eR: 1.7, hR: 'sign', lL: [.45, .2, .3], kL: .6, lR: [-.25, .2, -.2], kR: .3, face: expr('itaStare') },
  ita_throw: { sp: .28, st: -.5, hp: .0, hy: .2, aL: [.7, .9, 0], eL: .9, hL: 'relax', aR: [1.45, -.35, 0], eR: .12, hR: 'flat', lL: [.55, .2, .2], kL: .5, lR: [-.4, .2, -.2], kR: .35, face: expr('itaStare') },
  ita_kunai: { sp: .18, st: .2, hp: -.05, aL: [1.0, .3, 0], eL: 1.4, hL: 'open', aR: [1.15, .25, 0], eR: 1.55, hR: 'grip', kunai: 'R', kunaiRev: true, lL: [.4, .32, .3], kL: .7, lR: [-.2, .3, -.3], kR: .45, face: expr('itaStare') },
  ita_kunaiSlash: { sp: .3, st: -.6, hp: .05, hy: .25, aL: [.8, .9, 0], eL: .8, hL: 'open', aR: [1.4, -.7, 0], eR: .35, hR: 'grip', kunai: 'R', kunaiRev: true, lL: [.6, .2, .2], kL: .6, lR: [-.45, .2, -.2], kR: .3, face: expr('itaCold') },
  ita_block: { sp: .1, hp: .05, aL: [.6, .4, 0], eL: .9, hL: 'relax', aR: [1.55, -.55, 0], eR: 1.85, hR: 'grip', kunai: 'R', lL: [.3, .25, .2], kL: .45, lR: [-.2, .25, -.2], kR: .3, face: expr('itaStare') },
  ita_point: { sp: .08, hp: .04, aL: [.15, .3, 0], eL: .3, hL: 'relax', aR: [1.42, -.12, 0], eR: .3, hR: 'point', lL: [.1, .06, .1], lR: [-.08, .06, -.1], face: expr('itaSoft') },
  ita_reach: { sp: .12, hp: .02, aL: [1.42, .02, 0], eL: .15, hL: 'open', aR: [.2, .3, 0], eR: .35, hR: 'relax', lL: [.25, .1, .1], kL: .2, lR: [-.15, .1, -.1], kR: .1, face: expr('itaStare') },
  ita_susanoo: { sp: -.04, hp: -.1, aL: [.55, .95, 0], eL: .35, hL: 'open', aR: [.55, .95, 0], eR: .35, hR: 'open', lL: [.08, .2, .12], lR: [-.08, .2, -.12], face: expr('itaCold') },
  ita_crows: { sp: 0, hp: .06, aL: [1.05, 1.3, 0], eL: .3, hL: 'open', aR: [1.05, 1.3, 0], eR: .3, hR: 'open', lL: [.04, .12, .1], lR: [-.04, .12, -.1], face: expr('itaCalm') },
  ita_eyeHold: { sp: .2, hp: .2, aL: [.4, .4, 0], eL: .7, hL: 'relax', aR: [1.25, -.35, 0], eR: 2.5, hR: 'open', lL: [.2, .12, .1], kL: .25, lR: [-.1, .12, -.1], kR: .15, face: expr('itaPain') },
  ita_cough: { sp: .45, hp: .35, aL: [.55, -.25, 0], eL: 1.55, hL: 'relax', aR: [1.2, -.5, 0], eR: 2.45, hR: 'relax', lL: [.25, .14, .1], kL: .35, lR: [-.05, .14, -.1], kR: .3, face: expr('itaCough') },
  ita_tilt: { sp: 0, hp: .12, hr: .22, aL: [.16, .32, 0], eL: .3, hL: 'relax', aR: [.16, .32, 0], eR: .3, hR: 'relax', face: expr('itaCalm') },
  ita_lookBack: { sp: 0, st: .35, hy: .95, hp: .05, aL: [.16, .32, 0], eL: .3, hL: 'relax', aR: [.16, .32, 0], eR: .3, hR: 'relax', face: expr('itaStare') },
  ita_punchWind: { sp: .15, st: .55, hp: -.05, aL: [1.2, .2, 0], eL: 1.5, hL: 'fist', aR: [.9, 1.2, 0], eR: 2.0, hR: 'fist', lL: [.45, .25, .3], kL: .7, lR: [-.25, .25, -.3], kR: .5, face: expr('itaCold') },
  ita_punch: { sp: .22, st: -.45, hp: -.05, aL: [1.0, .4, 0], eL: 1.9, hL: 'fist', aR: [1.55, -.05, 0], eR: .06, hR: 'fist', lL: [.55, .2, .2], kL: .5, lR: [-.35, .15, -.2], kR: .25, face: expr('itaCold') },
  ita_kick: { sp: -.25, st: .2, hp: .1, aL: [.95, .7, 0], eL: .8, hL: 'fist', aR: [.95, .7, 0], eR: .8, hR: 'fist', lL: [-.1, .1, .1], kL: .15, lR: [1.65, .1, 0], kR: .08, face: expr('itaCold') },
  ita_dash: { sp: .65, hp: -.4, aL: [1.05, 2.75, 0], eL: .25, hL: 'flat', aR: [1.05, 2.75, 0], eR: .25, hR: 'flat', lL: [1.1, .1, 0], kL: 1.3, lR: [-.55, .1, 0], kR: 1.4, fR: .6, face: expr('itaStare') },
  ita_run1: { sp: .6, hp: -.35, aL: [1.05, 2.7, 0], eL: .25, hL: 'flat', aR: [1.05, 2.7, 0], eR: .25, hR: 'flat', lL: [1.1, .1, 0], kL: 1.3, lR: [-.55, .1, 0], kR: 1.5, fR: .6, face: expr('itaStare') },
  ita_run2: { sp: .6, hp: -.35, aL: [1.05, 2.7, 0], eL: .25, hL: 'flat', aR: [1.05, 2.7, 0], eR: .25, hR: 'flat', lL: [-.55, .1, 0], kL: 1.5, lR: [1.1, .1, 0], kR: 1.3, fL: .6, face: expr('itaStare') },
  ita_land: { sp: .5, hp: -.3, aL: [.9, .9, 0], eL: .5, hL: 'open', aR: [.5, .6, 0], eR: .4, hR: 'relax', lL: [1.1, .3, .3], kL: 1.9, lR: [.2, .35, -.3], kR: 2.0, fR: .9, face: expr('itaStare') },
  ita_hurt: { sp: -.3, hp: -.3, aL: [.7, .9, 0], eL: .5, hL: 'open', aR: [.7, .9, 0], eR: .5, hR: 'open', lL: [.3, .15, .1], kL: .4, lR: [-.2, .15, -.1], kR: .2, face: expr('itaPain') },
  ita_kneel: { sp: .35, hp: .3, aL: [.5, .2, 0], eL: .9, hL: 'open', aR: [.9, .1, 0], eR: .3, hR: 'flat', lL: [1.5, .15, 0], kL: 1.6, lR: [.05, .15, 0], kR: 2.5, face: expr('itaPain') },
  ita_walk1: { sp: .04, hp: .05, aL: [.25, -.3, 0], eL: .35, hL: 'relax', aR: [.25, 2.6, 0], eR: .3, hR: 'relax', lL: [.4, .05, 0], kL: .15, lR: [-.3, .05, 0], kR: .35, face: expr('itaCalm') },
  ita_walk2: { sp: .04, hp: .05, aL: [.25, 2.6, 0], eL: .3, hL: 'relax', aR: [.25, -.3, 0], eR: .35, hR: 'relax', lL: [-.3, .05, 0], kL: .35, lR: [.4, .05, 0], kR: .15, face: expr('itaCalm') },
  ita_float: { sp: -.05, hp: .05, aL: [.4, .7, 0], eL: .4, hL: 'open', aR: [.4, .7, 0], eR: .4, hR: 'open', lL: [.15, .08, .1], kL: .3, lR: [.05, .08, -.1], kR: .45, ground: false, face: expr('itaCalm') },
  ita_ready: { sp: 0, hp: .06, aL: [.3, -.25, 0], eL: 1.5, hL: 'hid', aR: [.3, -.25, 0], eR: 1.5, hR: 'hid', lL: [.03, .07, .1], lR: [-.03, .07, -.1], collarUp: .8, face: expr('itaCalm') },
  ita_kickSpin: { sp: -.2, st: -.8, hp: .1, hy: .4, aL: [1.2, 1.4, 0], eL: .5, hL: 'open', aR: [.7, 1.1, 0], eR: .8, hR: 'fist', lL: [-.05, .2, .3], kL: .2, lR: [1.55, .9, .2], kR: .1, face: expr('itaCold') },
  ita_crowsDissolve: { sp: 0, hp: .05, aL: [.9, 1.0, 0], eL: .3, hL: 'open', aR: [.9, 1.0, 0], eR: .3, hR: 'open', lL: [.03, .1, .1], lR: [-.03, .1, -.1], dissolve: .5, face: expr('itaCalm') },
  ita_eyeCover: { sp: .18, hp: .18, aL: [1.25, -.35, 0], eL: 2.5, hL: 'open', aR: [.35, .4, 0], eR: .7, hR: 'relax', lL: [.18, .12, .1], kL: .22, lR: [-.08, .12, -.1], kR: .15, face: expr('itaPain') },
  ita_twoFingers: { sp: 0, hp: .02, aL: [.15, .3, 0], eL: .3, hL: 'relax', aR: [1.0, -.25, 0], eR: 1.75, hR: 'point', wR: [-.3, 0], lL: [.03, .06, .1], lR: [-.03, .06, -.1], face: expr('itaCalm') },
  ita_lieBack: { pitch: -HP, sp: 0, hp: -.1, hy: .3, aL: [.6, 1.2, 0], eL: .3, hL: 'open', aR: [.4, .9, 0], eR: .5, hR: 'relax', lL: [.1, .1, .1], kL: .3, lR: [.3, .1, -.1], kR: .6, ground: false, face: expr('itaSoft', { eye: .2 }) },
  ita_standPillar: { sp: -.04, hp: -.12, aL: [.08, .2, 0], eL: .1, hL: 'relax', aR: [.08, .2, 0], eR: .1, hR: 'relax', lL: [0, .05, .05], lR: [0, .05, -.05], face: expr('itaStare') },
  ita_shield: { sp: .05, hp: -.05, aL: [1.4, .25, 0], eL: .6, hL: 'open', aR: [.5, .7, 0], eR: .5, hR: 'grip', lL: [.3, .25, .2], kL: .35, lR: [-.2, .25, -.2], kR: .2, face: expr('itaCold') },
});
SIGNATURE.itachi = ['ita_stand', 'ita_cloakHand', 'ita_sign', 'ita_fireball', 'ita_throwWind', 'ita_throw', 'ita_kunai', 'ita_kunaiSlash', 'ita_block', 'ita_point', 'ita_reach', 'ita_susanoo', 'ita_crows',
  'ita_eyeHold', 'ita_cough', 'ita_tilt', 'ita_lookBack', 'ita_punchWind', 'ita_punch', 'ita_kick', 'ita_dash', 'ita_run1', 'ita_land', 'ita_hurt', 'ita_kneel', 'ita_walk1', 'ita_float', 'ita_shield'];
if (window.SIGNATURE_FORM) SIGNATURE_FORM.itachi = 'sharingan'; else window.SIGNATURE_FORM = { itachi: 'sharingan' };
IJ.itaRun = (ph, over) => mixPose(P('ita_run1', over), P('ita_run2', over), .5 - .5 * Math.cos(ph * TAU));
IJ.itaWalk = (ph, over) => mixPose(P('ita_walk1', over), P('ita_walk2', over), .5 - .5 * Math.cos(ph * TAU));
// ============================================================================================================== JULIUS NOVACHRONO
/* JULIUS: ~1.80 m, the 28th Wizard King.  Big, chunky, blocky-cut WHITE hair (thick slab bangs, side locks to the jaw, back to the nape) with two GOLD hair rings,
   warm amber eyes, easy grin.  Dark navy high-collared coat with gold trim + buttons, long WHITE Wizard King mantle (gold edging, three-leaf clover on the back),
   navy trousers, dark boots.
   FORMS: base | magic (mana glow default .6) | manazone (mana 1) | chrono (time-magic eyes: gold clock iris, timeGlow 1) | casual (no mantle) | wounded
   POSE FIELDS: timeGlow 0..1 (clock-face iris + gold glow), mana 0..1 (aura, drawn by fxManaAura in shots), grim 0..1 (three-leaf grimoire floating at the left hand,
                grimOpen 0..1), wounds 0..3, mantle false (hide mantle)                                                                                      */
IJ.juliusHair = () => () => { const r = i => hash(i * 4.41 + 17); return [
  // crown + back: thick blocky slabs falling to the nape (wide w, low taper -> boxy)
  ...lockFan(10, 1.25, 5.03, .45, (th, u, i) => ({ len: .9 + .15 * r(i), w: .68, rootR: .95, dir: dirOut(th, -.45, 1.0, -.2), curl: [(r(i + 2) - .5) * .4, -.3, .1], grav: .7, tw: .7, tip: .55, back: true, seg: 7, wave: [.18, 1.6, i], waveAxis: [1, 0, 0], gloss: i % 3 === 0 })),
  ...lockFan(7, 1.5, 4.78, 1.0, (th, u, i) => ({ len: .6 + .12 * r(i + 9), w: .72, rootR: .97, dir: dirOut(th, .25, .6, -.3), curl: [(r(i + 3) - .5) * .5, -.8, -.2], grav: .6, tw: .8, tip: .55, back: true, seg: 6 })),
  // big slab bangs over the forehead (square tips)
  ...lockFan(5, -.62, .62, .78, (th, u, i) => ({ len: .7 + .12 * r(i + 20), w: .6, rootR: .965, dir: [Math.sin(th) * .55, .35, 1], curl: [Math.sin(th) * .3, -1.2, -.25], grav: .7, tw: .78, tip: .6, seg: 6, front: true, gloss: i === 2 })),
  // side locks to the jaw (gold rings near the tips)
  { th: 1.12, ph: .42, len: 1.35, w: .55, wave: [.15, 1.8], waveAxis: [0, 0, 1], rootR: .97, dir: [.35, -.95, .25], curl: [-.1, .1, .1], grav: 1.0, tw: .75, tip: .65, seg: 7, front: true, ring: .78 },
  { th: -1.12, ph: .42, len: 1.35, w: .55, wave: [.15, 1.8, 1], waveAxis: [0, 0, 1], rootR: .97, dir: [-.35, -.95, .25], curl: [.1, .1, .1], grav: 1.0, tw: .75, tip: .65, seg: 7, front: true, ring: .78 },
  { th: .82, ph: .58, len: .95, w: .55, rootR: .97, dir: [.6, -.6, .45], curl: [0, -.6, 0], grav: .9, tw: .76, tip: .6, seg: 6, front: true },
  { th: -.82, ph: .58, len: .95, w: .55, rootR: .97, dir: [-.6, -.6, .45], curl: [0, -.6, 0], grav: .9, tw: .76, tip: .6, seg: 6, front: true },
]; };
// gold hair rings on the two side locks (drawn at 78 % of the lock)
IJ.julRings = (S, D, F, t, parts, opt, HM) => { if (opt.mode === 'flat') return; const hair = D.face.hair, locks = hair.locks(S, D, t).filter(L => L.ring);
  for (const L of locks) { const pts = lockCurve(HM, L, [0, 0, 0], t), i = Math.round((pts.length - 1) * L.ring), p = pts[i], d = vNorm(vSub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));
    parts.push({ z: camDepth(p) - HM.r * .12, fn: c => { if (LIGHT.override) return; const q = project(p), q2 = project(vMad(p, d, HM.r * .2)); if (!q || !q2) return; const ang = Math.atan2(q2.y - q.y, q2.x - q.x), w = HM.r * q.s * .2, h = HM.r * q.s * .1;
      c.save(); c.translate(q.x, q.y); c.rotate(ang); c.fillStyle = IJ.col.gold; c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(1, w * .12); c.beginPath(); c.rect(-h, -w * .55, h * 2, w * 1.1); c.fill(); c.stroke();
      c.fillStyle = '#fff4c0'; c.fillRect(-h * .6, -w * .45, h * .35, w * .9); c.strokeStyle = IJ.col.goldDark; c.beginPath(); c.moveTo(0, -w * .55); c.lineTo(0, w * .55); c.stroke(); c.restore(); } }); } };
// middle-aged face: soft smile lines + faint under-eye creases
IJ.julMarkings = (c, HM, e, lod, D) => { const cut = D._cut || 0; if (cut > .01) { const fr = faceFrame(HM, .55, -.45, .45, .4); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = '#b0101a'; cc.lineCap = 'round'; cc.lineWidth = .09; cc.beginPath(); cc.moveTo(-.5, .15); cc.lineTo(-.5 + cut, -.05); cc.stroke(); if (cut > .6) { cc.fillStyle = '#b0101a'; cc.beginPath(); cc.ellipse(.1, -.35, .05, .25 * cut, 0, 0, TAU); cc.fill(); } }, .02, fr.n); }
  if (lod < 1) return; for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .32, -.62, .5, .35); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.strokeStyle = rgba('#9a6a58', .6); cc.lineCap = 'round'; cc.lineWidth = .06;
  cc.beginPath(); cc.moveTo(-.05, .45); cc.quadraticCurveTo(.25, .05, .2, -.45); cc.stroke(); }, .02, fr.n);
  const f2 = faceFrame(HM, sg * .46, -.36, .55, .3); decal(c, f2.p, sg > 0 ? f2.tu : vMul(f2.tu, -1), f2.tv, cc => { cc.strokeStyle = rgba('#a87a68', .45); cc.lineWidth = .05; cc.beginPath(); cc.moveTo(-.4, .1); cc.quadraticCurveTo(0, -.12, .4, .05); cc.stroke(); }, .02, f2.n); } };
// clock iris (time magic): gold ring of ticks + two hands over the amber iris
IJ.julEyeHook = (st, S, D, e) => { const p = S.pose, k = p.timeGlow != null ? p.timeGlow : (D.timeDefault || 0); if (k <= .02) return; const tt = S.t || 0;
  st.irisFn = (c, icx, icy, ir) => { c.save(); c.globalAlpha = clamp(k, 0, 1); c.beginPath(); c.ellipse(icx, icy, ir, ir * 1.18, 0, 0, TAU); c.clip();
    c.fillStyle = radial(c, icx, icy, ir * 1.2, [[0, '#fff6c8'], [.5, IJ.col.time], [1, '#a8700a']]); c.fillRect(icx - ir * 1.3, icy - ir * 1.5, ir * 2.6, ir * 3);
    c.strokeStyle = '#4a2c04'; c.lineWidth = ir * .07; c.beginPath(); c.ellipse(icx, icy, ir * .8, ir * .95, 0, 0, TAU); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.lineWidth = ir * (i % 3 ? .04 : .09); c.beginPath(); c.moveTo(icx + Math.cos(a) * ir * .62, icy + Math.sin(a) * ir * .74); c.lineTo(icx + Math.cos(a) * ir * .78, icy + Math.sin(a) * ir * .93); c.stroke(); }
    c.lineCap = 'round'; c.lineWidth = ir * .1; c.beginPath(); c.moveTo(icx, icy); c.lineTo(icx + ir * .35, icy + ir * .2); c.stroke(); c.lineWidth = ir * .06; c.beginPath(); c.moveTo(icx, icy); c.lineTo(icx - ir * .1, icy + ir * .6); c.stroke();
    c.fillStyle = '#2a1802'; c.beginPath(); c.arc(icx, icy, ir * .12, 0, TAU); c.fill(); c.restore(); }; void tt; };
// mantle trim (gold edge band along the front edges + hem) and the three-leaf clover crest on the back
IJ.mantleTrim = (c, surf, G, sg, S, D) => { if (LIGHT.override) return; const s = gridScale(G);
  if (sg > 0) { for (const u0 of [.015, .985]) { const uv = []; for (let i = 0; i <= 16; i++) uv.push([u0, i / 16]); strokeRuns(c, surfLine(surf, uv, .02), lineW(s, 2.4), IJ.col.gold); }
    { const uv = []; for (let i = 0; i <= 40; i++) uv.push([i / 40, .97]); strokeRuns(c, surfLine(surf, uv, .02), lineW(s, 2.8), IJ.col.gold); }
    { const uv = []; for (let i = 0; i <= 40; i++) uv.push([i / 40, .93]); strokeRuns(c, surfLine(surf, uv, .02), lineW(s, .8), IJ.col.goldDark); }
    const fr = surfFrame(surf, .5, .45); if (vDot(fr.n, toCam(fr.p)) > .05) { const k = S.B.h / 1.8; decal(c, fr.p, vMul(vNorm(fr.du), .13 * k), vMul(vNorm(fr.dv), .13 * k), cc => { cc.save(); cc.scale(1, 1); fxWizardCrest(cc, 0, 0, 1, { col: IJ.col.gold }); cc.restore(); }, .05, fr.n); } } };
IJ.julTorso = (c, S, D, T, G) => { if (LIGHT.override) return; const s = gridScale(G);
  strokeRuns(c, surfLine(T.surf, [[0, .97], [0, .8], [0, .6], [0, .4], [0, .2], [0, .04]], .02), lineW(s, 1.8), IJ.col.gold);   // gold placket
  for (const v of [.85, .7, .55, .4, .25]) { const fr = surfFrame(T.surf, .03, v); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const q = proj2(fr.p), r = Math.max(1.4, .011 * s); c.fillStyle = IJ.col.gold; c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fill(); c.strokeStyle = IJ.col.goldDark; c.lineWidth = Math.max(.7, r * .35); c.stroke(); }
  if (D.wounds) torsoLines(c, S, D, [[[.15, .7], [.2, .55]], [[-.2, .45], [-.1, .32]]], '#8a0a10', 1.2, .006); };
CAST.julius = design(SHINIGAMI, {
  name: 'Julius Novachrono', h: 1.9, body: { width: 1.06, limbs: 1.06, shoulders: 1.12, depth: 1.02, legs: 1.02, neck: 1.06 }, skin: IJ.col.jSkin, skinShade: IJ.col.jSkinShade,
  kosode: IJ.col.robe, collar: { none: true }, obi: null, neckSkin: IJ.col.jSkin, handSkin: IJ.col.jSkin,
  torsoDetail: (c, S, D, T, G) => IJ.julTorso(c, S, D, T, G),
  sleeve: { col: IJ.col.robe, lining: '#c8c0b0', r0: .074, r1: .072, r2: .07, sag: .03, len: 1.0 },
  hakama: { col: IJ.col.jPants, r0: .1, r1: .084, r2: .072, pleats: false, ties: false },
  haori: { col: IJ.col.jNavy, lining: IJ.col.jNavyLin, len: .92, sleeves: false, hem: 'none', kanji: null, open: .42, flare: .55, collarLen: .4, patternFn: IJ.mantleTrim },
  feet: { col: '#3a2a20', sandal: false, w: 1.08, shaft: .24, shaftCol: '#4a3426', shaftR: 1.12 },
  face: {
    eye: { w: 1.1, h: .46, irisR: .37, irisCol: '#8fb4d8', irisLight: '#d8ecff', irisDark: '#3a5a8a', irisRing: '#e8f4ff', tilt: .0, thick: 1.25, flick: .04, lashes: true, crease: true, pupilR: .32, lidShade: '#8a6a60' },
    eyeSize: .41, eyeY: -.2, defaultExpr: 'julSmile', brow: { browW: .075, browY: .05, browCol: '#b8964a' }, headShape: { jaw: .97, chin: .95, width: .97 }, noseK: 1.0,
    mouth: { mouthW: 1.1 }, mouthSize: .27, mouthY: -.76,
    hair: { col: IJ.col.jHair, shadeCol: IJ.col.jHairShade, gloss: true, glossCol: IJ.col.jHairGloss, springK: 30, springC: 5, cap: { front: .62, side: .1, back: -.9 }, locks: IJ.juliusHair() },
    eyeHook: (st, S, D, e) => IJ.julEyeHook(st, S, D, e),
    markings: (c, HM, e, lod, D) => IJ.julMarkings(c, HM, e, lod, D),
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => IJ.julHeadParts(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['julSmile', 'julGrin', 'julWonder', 'julThrilled', 'julSerious', 'julFierce', 'julShout', 'calm', 'shock', 'pain', 'determined', 'exhausted', 'laugh', 'eyesClosed'],
  extras: (S, D, F, t, parts, opt) => IJ.julExtras(S, D, F, t, parts, opt),
  forms: {
    base: {}, magic: { manaDefault: .6 }, manazone: { manaDefault: 1, timeDefault: .4 }, chrono: { timeDefault: 1, manaDefault: .5 },
    casual: { haori: { none: true } }, wounded: { wounds: 2, haori: { col: IJ.col.jNavy, lining: IJ.col.jNavyLin, len: .86, sleeves: false, hem: 'none', kanji: null, open: .46, flare: .5, collarLen: .4, torn: .55, patternFn: IJ.mantleTrim } },
  },
});
CAST.julius.drawHead = stdHead(CAST.julius);
IJ.julHeadParts = (S, D, F, t, parts, opt, HM, e, zc) => { IJ.julRings(S, D, F, t, parts, opt, HM); D._cut = S.pose.cut || 0; const p = S.pose, k = p.timeGlow != null ? p.timeGlow : (D.timeDefault || 0);
  if (k > .05) parts.push({ z: zc - HM.r * 1.15, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; if (vDot(HM.M[2], toCam(HM.c)) < .05) return; const sc = project(HM.c), pxR = HM.r * (sc ? sc.s : 100);
    c.save(); c.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) { const q = project(vMad(HM.at(sg * .46, -.21), HM.M[2], HM.r * .05)); if (q) glow(c, q.x, q.y, pxR * .22 * k, IJ.col.time, .22 * k); } c.restore(); } }); };
IJ.julExtras = (S, D, F, t, parts, opt) => { const p = S.pose; IJ.coatOrder(S, D, parts);
  if (!(D.haori && D.haori.none)) IJ.cloakCollar(S, Object.assign({}, D, { collarCol: IJ.col.jNavy, collarLin: IJ.col.gold }), parts, opt, .35);
  const gk = p.grim || 0; if (gk > .02) { const k = S.B.h / 1.8, hp = vAdd(S.J.handL, [0, .22 * k, 0]), fw = S.M.chest[2], pp = vMad(hp, fw, .12 * k);
    parts.push({ z: camDepth(pp) - .05, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; fxGrimoire(c, pp, t, { size: .3 * k, k: gk, open: p.grimOpen == null ? 1 : p.grimOpen, flip: p.grimFlip }); } }); }
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0)); };
Object.assign(POSES, {
  jul_stand: { sp: 0, hp: .0, aL: [.2, .35, 0], eL: .35, hL: 'relax', aR: [.2, .35, 0], eR: .35, hR: 'relax', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile') },
  jul_hips: { sp: -.03, hp: -.04, aL: [.6, 1.25, 0], eL: 1.9, hL: 'fist', aR: [.6, 1.25, 0], eR: 1.9, hR: 'fist', lL: [.05, .16, .15], lR: [-.05, .16, -.15], face: expr('julGrin') },
  jul_handsBack: { sp: -.02, hp: .02, aL: [.35, 2.6, 0], eL: 1.1, hL: 'relax', aR: [.35, 2.6, 0], eR: 1.1, hR: 'relax', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile') },
  jul_grimoire: { sp: .02, hp: .1, aL: [.8, .1, 0], eL: 1.4, hL: 'open', wL: [-.4, 0], aR: [.2, .35, 0], eR: .35, hR: 'relax', grim: 1, lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSerious') },
  jul_cast: { sp: .08, st: -.2, hp: -.02, aL: [.5, .7, 0], eL: .7, hL: 'open', aR: [1.5, -.05, 0], eR: .08, hR: 'open', wR: [-.5, 0], grim: 1, lL: [.35, .25, .25], kL: .4, lR: [-.2, .25, -.2], kR: .2, face: expr('julFierce') },
  jul_castBoth: { sp: .05, hp: -.05, aL: [1.45, .25, 0], eL: .15, hL: 'open', wL: [-.5, 0], aR: [1.45, .25, 0], eR: .15, hR: 'open', wR: [-.5, 0], lL: [.25, .3, .2], kL: .3, lR: [-.15, .3, -.2], kR: .2, face: expr('julShout') },
  jul_raise: { sp: -.08, hp: -.25, aL: [.4, .6, 0], eL: .5, hL: 'open', aR: [2.85, .3, 0], eR: .15, hR: 'open', grim: 1, lL: [.1, .18, .15], lR: [-.08, .18, -.15], face: expr('julThrilled') },
  jul_point: { sp: 0, hp: -.02, aL: [.2, .35, 0], eL: .35, hL: 'relax', aR: [1.0, .35, 0], eR: 1.9, hR: 'point', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julGrin') },
  jul_snap: { sp: .02, hp: .03, aL: [.2, .35, 0], eL: .35, hL: 'relax', aR: [1.25, .1, 0], eR: 1.45, hR: 'pinch', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile', { eye: .55 }) },
  jul_wonder: { sp: -.12, hp: -.15, aL: [1.2, .5, 0], eL: 1.2, hL: 'open', aR: [1.2, .5, 0], eR: 1.2, hR: 'open', lL: [.05, .12, .15], lR: [-.05, .12, -.15], face: expr('julWonder') },
  jul_sweep: { sp: .1, st: .5, hp: .0, hy: -.3, aL: [.4, .5, 0], eL: .6, hL: 'open', aR: [1.6, 1.4, 0], eR: .2, hR: 'open', lL: [.3, .3, .3], kL: .4, lR: [-.2, .3, -.3], kR: .25, face: expr('julFierce') },
  jul_guard: { sp: .15, hp: -.08, aL: [1.2, .2, 0], eL: 1.3, hL: 'open', aR: [1.0, .5, 0], eR: 1.7, hR: 'open', lL: [.4, .3, .3], kL: .6, lR: [-.2, .3, -.3], kR: .4, face: expr('julSerious') },
  jul_punchWind: { sp: .15, st: .5, hp: -.05, aL: [1.2, .2, 0], eL: 1.5, hL: 'fist', aR: [.9, 1.2, 0], eR: 2.0, hR: 'fist', lL: [.45, .25, .3], kL: .7, lR: [-.25, .25, -.3], kR: .5, face: expr('julFierce') },
  jul_punch: { sp: .22, st: -.45, hp: -.05, aL: [1.0, .4, 0], eL: 1.9, hL: 'fist', aR: [1.55, -.05, 0], eR: .06, hR: 'fist', lL: [.55, .2, .2], kL: .5, lR: [-.35, .15, -.2], kR: .25, face: expr('julShout') },
  jul_kick: { sp: -.25, st: .2, hp: .1, aL: [.95, .7, 0], eL: .8, hL: 'fist', aR: [.95, .7, 0], eR: .8, hR: 'fist', lL: [-.1, .1, .1], kL: .15, lR: [1.65, .1, 0], kR: .08, face: expr('julFierce') },
  jul_dash: { sp: .55, hp: -.35, aL: [.9, 2.6, 0], eL: .3, hL: 'open', aR: [.9, 2.6, 0], eR: .3, hR: 'open', lL: [1.0, .1, 0], kL: 1.2, lR: [-.5, .1, 0], kR: 1.3, fR: .6, face: expr('julFierce') },
  jul_run1: { sp: .35, hp: -.15, aL: [.7, -.4, 0], eL: 1.6, hL: 'fist', aR: [.6, 2.6, 0], eR: 1.2, hR: 'fist', lL: [1.0, .1, 0], kL: 1.1, lR: [-.5, .1, 0], kR: 1.4, fR: .5, face: expr('julGrin') },
  jul_run2: { sp: .35, hp: -.15, aL: [.6, 2.6, 0], eL: 1.2, hL: 'fist', aR: [.7, -.4, 0], eR: 1.6, hR: 'fist', lL: [-.5, .1, 0], kL: 1.4, lR: [1.0, .1, 0], kR: 1.1, fL: .5, face: expr('julGrin') },
  jul_land: { sp: .45, hp: -.25, aL: [.9, .9, 0], eL: .5, hL: 'open', aR: [.6, .7, 0], eR: .4, hR: 'open', lL: [1.1, .3, .3], kL: 1.9, lR: [.2, .35, -.3], kR: 2.0, fR: .9, face: expr('julSerious') },
  jul_float: { sp: -.05, hp: -.05, aL: [.7, .9, 0], eL: .3, hL: 'open', aR: [.7, .9, 0], eR: .3, hR: 'open', lL: [.2, .08, .1], kL: .4, lR: [.05, .08, -.1], kR: .6, ground: false, face: expr('julSmile') },
  jul_hurt: { sp: -.3, hp: -.3, aL: [.7, .9, 0], eL: .5, hL: 'open', aR: [.7, .9, 0], eR: .5, hR: 'open', lL: [.3, .15, .1], kL: .4, lR: [-.2, .15, -.1], kR: .2, face: expr('pain') },
  jul_kneel: { sp: .35, hp: .2, aL: [.5, .2, 0], eL: .9, hL: 'open', aR: [.9, .1, 0], eR: .3, hR: 'flat', lL: [1.5, .15, 0], kL: 1.6, lR: [.05, .15, 0], kR: 2.5, face: expr('exhausted') },
  jul_laugh: { sp: -.1, hp: -.3, aL: [.4, .5, 0], eL: 1.6, hL: 'fist', aR: [.6, -.2, 0], eR: 1.9, hR: 'open', lL: [.03, .1, .12], lR: [-.03, .1, -.12], face: expr('julThrilled') },
  jul_walk1: { sp: .02, hp: 0, aL: [.25, -.3, 0], eL: .35, hL: 'relax', aR: [.25, 2.6, 0], eR: .3, hR: 'relax', lL: [.4, .05, 0], kL: .15, lR: [-.3, .05, 0], kR: .35, face: expr('julSmile') },
  jul_walk2: { sp: .02, hp: 0, aL: [.25, 2.6, 0], eL: .3, hL: 'relax', aR: [.25, -.3, 0], eR: .35, hR: 'relax', lL: [-.3, .05, 0], kL: .35, lR: [.4, .05, 0], kR: .15, face: expr('julSmile') },
  jul_walkA: { sp: -.02, hp: .02, aL: [.35, 2.6, 0], eL: 1.1, hL: 'relax', aR: [.35, 2.6, 0], eR: 1.1, hR: 'relax', lL: [.4, .05, 0], kL: .15, lR: [-.3, .05, 0], kR: .35, face: expr('julSmile') },
  jul_walkB: { sp: -.02, hp: .02, aL: [.35, 2.6, 0], eL: 1.1, hL: 'relax', aR: [.35, 2.6, 0], eR: 1.1, hR: 'relax', lL: [-.3, .05, 0], kL: .35, lR: [.4, .05, 0], kR: .15, face: expr('julSmile') },
  jul_tap: { sp: .02, hp: 0, aL: [.3, 2.4, 0], eL: 1.0, hL: 'relax', aR: [1.45, .05, 0], eR: .25, hR: 'point', wR: [.35, 0], lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile') },
  jul_palmOut: { sp: .06, hp: -.02, aL: [.4, .5, 0], eL: .6, hL: 'open', aR: [1.5, .0, 0], eR: .1, hR: 'open', wR: [-.6, 0], lL: [.3, .22, .2], kL: .35, lR: [-.18, .22, -.2], kR: .2, face: expr('julSerious') },
  jul_punchTime: { sp: .25, st: -.5, hp: -.05, aL: [1.0, .45, 0], eL: 1.9, hL: 'fist', aR: [1.55, -.08, 0], eR: .05, hR: 'fist', lL: [.6, .2, .2], kL: .55, lR: [-.4, .15, -.2], kR: .25, face: expr('julThrilled') },
  jul_eyesClosed: { sp: -.02, hp: .04, aL: [.22, .35, 0], eL: .4, hL: 'open', aR: [.22, .35, 0], eR: .4, hR: 'open', lL: [.06, .14, .15], lR: [-.06, .14, -.15], face: expr('julSense') },
  jul_lookUp: { sp: -.1, hp: -.5, aL: [.25, .4, 0], eL: .4, hL: 'relax', aR: [.25, .4, 0], eR: .4, hR: 'relax', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julWonder') },
  jul_touchCheek: { sp: .02, hp: .08, aL: [.2, .35, 0], eL: .35, hL: 'relax', aR: [1.05, -.3, 0], eR: 2.45, hR: 'open', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile', { eye: .5 }) },
  jul_bow: { sp: .45, hp: .2, aL: [.3, -.5, 0], eL: 1.6, hL: 'flat', aR: [.2, 2.4, 0], eR: .6, hR: 'relax', lL: [.03, .08, .12], lR: [-.03, .08, -.12], face: expr('julSmile', { eye: .3 }) },
});
SIGNATURE.julius = ['jul_stand', 'jul_hips', 'jul_handsBack', 'jul_grimoire', 'jul_cast', 'jul_castBoth', 'jul_raise', 'jul_point', 'jul_snap', 'jul_wonder', 'jul_sweep', 'jul_guard', 'jul_punchWind', 'jul_punch',
  'jul_kick', 'jul_dash', 'jul_run1', 'jul_land', 'jul_float', 'jul_hurt', 'jul_kneel', 'jul_laugh', 'jul_walk1', 'jul_bow'];
SIGNATURE_FORM.julius = 'base';
IJ.julRun = (ph, over) => mixPose(P('jul_run1', over), P('jul_run2', over), .5 - .5 * Math.cos(ph * TAU));
IJ.julWalk = (ph, over) => mixPose(P('jul_walk1', over), P('jul_walk2', over), .5 - .5 * Math.cos(ph * TAU));
IJ.julWalkBack = (ph, over) => mixPose(P('jul_walkA', over), P('jul_walkB', over), .5 - .5 * Math.cos(ph * TAU));   // cast.md jul_walk: hands behind the back
Object.assign(POSES, { ita_handseal: POSES.ita_sign, ita_fireBreath: POSES.ita_fireball, jul_walk: POSES.jul_walkA });
SIGNATURE.itachi.push('ita_ready', 'ita_kickSpin', 'ita_crowsDissolve', 'ita_eyeCover', 'ita_twoFingers', 'ita_lieBack', 'ita_standPillar');
SIGNATURE.julius.push('jul_walkA', 'jul_tap', 'jul_palmOut', 'jul_punchTime', 'jul_eyesClosed', 'jul_lookUp', 'jul_touchCheek');
