/* Bleach Showdown engine - body.js : figure renderer (part builders + depth sort).
   drawFig(ctx, F, t, opt) solves the skeleton at t (quantised to the figure's timing: ones / twos / threes), builds
   view-dependent parts (toon surfaces) from the design, sorts them far -> near and draws them.
   Standard shinigami parts: torso (kosode with crossed collar), hakama (waist + two flared legs + crotch panels),
   tabi + waraji feet, sleeves (two-sided, open, gravity sag + spring swing), forearms, hands (palm + fingers),
   neck, head (faces.js), haori (two-sided cloth: lining drawn behind the body, outside in front), scarf ribbons,
   weapons.  Designs add their own parts through design.extras(S, D, F, t, parts, opt).
   opt.mode: 'normal' | 'flat' (single colour silhouette, e.g. afterimages / impact silhouettes) | 'ink' (line only)
   opt.col: colour for flat mode; opt.alpha.                                                                        */
'use strict';
const PARTS_BIAS = { torso: 0, head: -.06, hair: -.05, haoriF: -.02, haoriB: .2, arm: 0, leg: 0 };
// ---------------------------------------------------------------------------- frame interpolation helpers
function mLerp(a, b, t) { const X = vNorm(vLerp(a[0], b[0], t)), Y0 = vLerp(a[1], b[1], t); const Z = vNorm(vCross(X, Y0)); const Y = vCross(Z, X); return [X, Y, Z]; }
function partZ(p) { return camDepth(p); }

/* torso loft: rings (bottom -> top): hip, waist, chest, shoulder, neck.  Returns {surf, ringAt(v, th, off)} */
function torsoModel(S, D, off = 0) {
  const B = S.B, J = S.J, M = S.M, rg = B.ring;
  const lerpRing = (a, b, t) => a.map((x, i) => lerp(x, b[i], t));
  const R = [
    { c: vAdd(J.pelvis, mApply(M.pelvis, [0, -.06 * B.h / 1.8, -.005])), m: M.pelvis, r: rg.hip, zf: 0 },
    { c: vLerp(J.pelvis, J.abd, .55), m: mLerp(M.pelvis, M.abd, .6), r: rg.waist, zf: .0 },
    { c: vAdd(vLerp(J.abd, J.neck, .45), mApply(M.chest, [0, 0, .012])), m: mLerp(M.abd, M.chest, .7), r: rg.chest, zf: .03 },
    { c: vAdd(J.neck, mApply(M.chest, [0, -(B.shRingDrop != null ? B.shRingDrop : B.shDrop) * 1.2, -.008])), m: M.chest, r: rg.shoulder, zf: 0 },
    { c: vAdd(J.neck, mApply(M.neck, [0, B.trapUp != null ? B.trapUp : .03, -.01])), m: M.neck, r: B.trapR || [B.limbR.neck * 1.25, B.limbR.neck * 1.15], zf: 0 },   // trapR/trapUp: trapezius mound (muscular builds)
  ];
  const vs = [0, .3, .62, .86, 1];
  const ringAt = (v, th, o = off) => {
    v = clamp(v, 0, 1); let i = 1; while (i < 4 && vs[i] < v) i++;
    const t0 = (v - vs[i - 1]) / (vs[i] - vs[i - 1]), t = smooth(t0) * .65 + t0 * .35;
    const A = R[i - 1], Bq = R[i];
    // catmull for centres
    const P0 = R[Math.max(0, i - 2)].c, P1 = A.c, P2 = Bq.c, P3 = R[Math.min(4, i + 1)].c;
    const t2 = t0 * t0, t3 = t2 * t0;
    const c = [0, 1, 2].map(k => .5 * (2 * P1[k] + (-P0[k] + P2[k]) * t0 + (2 * P0[k] - 5 * P1[k] + 4 * P2[k] - P3[k]) * t2 + (-P0[k] + 3 * P1[k] - 3 * P2[k] + P3[k]) * t3));
    const m = mLerp(A.m, Bq.m, t), r = lerpRing(A.r, Bq.r, t);
    // top: shoulders round over into the neck (trapezius)
    let rx = r[0] + o, rz = r[1] + o;
    const sx = Math.sin(th), cz = Math.cos(th);
    // front of chest a bit fuller, back flatter; superellipse for boxier shoulders
    const e = v > .7 && v < .95 ? .82 : .95;
    const px = Math.sign(sx) * Math.pow(Math.abs(sx), e) * rx, pz = Math.sign(cz) * Math.pow(Math.abs(cz), e) * rz * (cz > 0 ? 1.04 : .96);
    return vAdd(c, mApply(m, [px, 0, pz]));
  };
  return { ringAt, R, surf: { nu: 22, nv: 14, wrapU: true, fn: (u, v) => ringAt(v, u * TAU) } };
}

/* -------------------------------------------------------------------------------- kosode collar masks (on torso)
   th measured from front (0) toward the character's left (+).  The V opens from v0 to the neck.                   */
function collarHalf(v, D) { const c = D.collar || {}; const v0 = c.v0 == null ? .58 : c.v0; return v < v0 ? -1 : (c.w == null ? .62 : c.w) * Math.pow((v - v0) / (1 - v0), .8); }
function angOf(u) { let a = u * TAU; if (a > Math.PI) a -= TAU; return a; }

function drawTorso(ctx, S, D, F, opt) {
  const T = torsoModel(S, D), G = sampleSurf(T.surf), c = D.collar || {};
  const skin = D.skin, under = c.under || '#f2f0ea', shift = c.shift == null ? .06 : c.shift;
  const tonesX = [];
  if (!c.none) {
    tonesX.push({ col: under, mask: (u, v) => collarHalf(v, D) - Math.abs(angOf(u) - shift) });
    tonesX.push({ col: c.skinCol || skin, mask: (u, v) => collarHalf(v, D) - .14 - Math.abs(angOf(u) - shift) });
  }
  if (D.torsoTones) tonesX.push(...D.torsoTones);
  if (opt.mode !== 'flat') { const lid = []; for (let i = 0; i < 16; i++) lid.push(T.ringAt(.985, i / 16 * TAU)); const lp = projPoly(lid); if (lp.length > 2) { polyPath(ctx, lp); ctx.fillStyle = tones(D.neckSkin || D.skinShade || D.skin || '#888').shade; ctx.fill(); } }   // lid: never see through the open torso top
  drawSurf(ctx, G, Object.assign({ col: D.kosode || '#1e1c24', extraTones: tonesX, shade: .05, borders: { v0: false, v1: false } }, opt.surf || {}));
  if (opt.mode === 'flat') return;
  // collar edge lines (left over right)
  if (!c.none) {
    const s = gridScale(G), lw = lineW(s, .75);
    for (const sg of [1, -1]) for (const dw of [0, .14]) {
      const uv = []; for (let i = 0; i <= 12; i++) { const v = lerp((c.v0 == null ? .58 : c.v0) + .01, .99, i / 12); let a = shift + sg * (collarHalf(v, D) - dw); if (a < 0) a += TAU; uv.push([a / TAU, v]); }
      strokeRuns(ctx, surfLine(T.surf, uv), lw, LIGHT.ink);
    }
  }
  if (D.torsoDetail) D.torsoDetail(ctx, S, D, T, G);
}

/* -------------------------------------------------------------------------------- hakama */
function hakamaLegPts(S, side) {
  const J = S.J, M = S.M, B = S.B;
  const top = vAdd(J['hip' + side], mApply(M.pelvis, [0, B.hipDrop * .8, 0]));
  return [top, J['kn' + side], vAdd(J['an' + side], mApply(M['shin' + side], [0, -B.ankleH * .35, 0]))];
}
function drawHakamaLeg(ctx, S, D, side, opt) {
  const B = S.B, k = B.h / 1.8, hk = D.hakama || {};
  const r0 = (hk.r0 || .1) * k, r1 = (hk.r1 || .115) * k, r2 = (hk.r2 || .13) * k;
  let pts = hakamaLegPts(S, side); const sg = side === 'L' ? 1 : -1;
  if (hk.len != null && hk.len < 1) { // rolled-up / short pants: cover only part of the shin, bare (or legging) shin below
    const kn = pts[1], an = pts[2], cut = vLerp(kn, an, hk.len);
    pts = [pts[0], kn, cut];
    const rS = S.B.limbR.sh, sh = sTube([vLerp(kn, an, Math.max(0, hk.len - .1)), S.J['an' + side]], v => rS * lerp(1.05, .78, v), mApply(S.M.pelvis, [1, 0, 0]), 10, 4);
    drawSurf(ctx, sampleSurf(sh), Object.assign({ col: hk.shinCol || D.legSkin || D.skin, shade: .1, borders: { v0: false, v1: false } }, opt.surf || {}));
  }
  const surf = sTube(pts, (v, th) => { const b = v < .5 ? lerp(r0, r1, v * 2) : lerp(r1, r2, (v - .5) * 2); return b * (1 + .06 * Math.sin(th * 5 + v * 3)); },
    mApply(S.M.pelvis, [1, 0, 0]), 18, 12, { round: .35 });
  const G = sampleSurf(surf);
  const lowT = hk.lowerCol ? [{ col: hk.lowerCol, mask: (u, v) => v - (hk.lowerV == null ? .62 : hk.lowerV) }] : null;
  drawSurf(ctx, G, Object.assign({ col: hk.col || D.kosode || '#1e1c24', side: 'both', backCol: shadeHex(hk.col || '#1e1c24', -.4), shade: .05, extraTones: lowT || undefined, borders: { v0: false, v1: true, u0: false, u1: false },
    pattern: hk.lowerPattern ? (c, G2, sgn) => { if (sgn > 0) hk.lowerPattern(c, surf, G2, S, side); } : null }, opt.surf || {}));
  if (hk.torn && pts.length > 2) drawTornHem(ctx, S, D, surf, pts, hk, side, opt);
  if (opt.mode === 'flat' || hk.pleats === false) return;
  // pleat lines on the front
  const s = gridScale(G), lw = lineW(s, .55);
  for (const a of [-.35, .05, .45]) { const uv = []; for (let i = 0; i <= 8; i++) uv.push([((a * sg) / TAU + 1) % 1, .12 + i / 8 * .85]); strokeRuns(ctx, surfLine(surf, uv, .1), lw, LIGHT.ink); }
}
// ragged trouser hem (hk.torn = tooth length in units of the leg radius): triangles hanging from the hem ring
function drawTornHem(ctx, S, D, surf, pts, hk, side, opt) {
  const n = 16, sgn = side === 'L' ? 1 : -1, ax = vNorm(vSub(pts[2], pts[1])), k = S.B.h / 1.8;
  const col = opt.mode === 'flat' ? opt.col : tones(hk.col || '#333').base, lw = lineW(pxScale(pts[2]), .7);
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, um = (u0 + u1) / 2;
    const a = surf.fn(u0, .995), b = surf.fn(u1, .995), m = surf.fn(um, .995), c = vLerp(pts[2], m, 1.04);
    const nrm = vNorm(vSub(m, pts[2])); if (vDot(nrm, toCam(m)) < -.25) continue;
    const L = (hk.r2 || .13) * k * hk.torn * (.35 + .9 * hash(i * 3.7 + (sgn > 0 ? 1 : 9)));
    const tip = vMad(vMad(c, ax, L), nrm, -L * .15);
    const sp = projPoly([a, b, tip]); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = col; ctx.fill();
    if (opt.mode !== 'flat') { ctx.lineWidth = lw; ctx.strokeStyle = LIGHT.ink; ctx.beginPath(); ctx.moveTo(sp[0][0], sp[0][1]); ctx.lineTo(sp[2][0], sp[2][1]); ctx.lineTo(sp[1][0], sp[1][1]); ctx.stroke(); } }
}
function drawHakamaTop(ctx, S, D, opt) {
  const J = S.J, M = S.M, B = S.B, k = B.h / 1.8, hk = D.hakama || {};
  const L = hakamaLegPts(S, 'L'), R = hakamaLegPts(S, 'R');
  const lvl = .32; // fraction down the thigh where the waist piece ends
  const pL = vLerp(L[0], L[1], lvl), pR = vLerp(R[0], R[1], lvl);
  const top = vAdd(J.pelvis, mApply(M.pelvis, [0, .02 * k, 0]));
  const rHip = B.ring.hip, rLeg = (hk.r0 || .1) * k * 1.05;
  const surf = { nu: 18, nv: 6, wrapU: true, flip: true, fn: (u, v) => {
    const th = u * TAU, sx = Math.sin(th), cz = Math.cos(th);
    const c0 = top, m0 = M.pelvis, c1 = vLerp(pL, pR, .5);
    const half = vDist(pL, pR) / 2 + rLeg, ax = vNorm(vSub(pL, pR));
    const vv = smooth(v);
    const p0 = vAdd(c0, mApply(m0, [sx * (rHip[0] + .012 * k), 0, cz * (rHip[1] + .012 * k)]));
    const zax = mApply(m0, [0, 0, 1]);
    const p1 = vAdd(c1, vAdd(vMul(ax, sx * half), vMul(zax, cz * rLeg * 1.05)));
    return vLerp(p0, p1, vv);
  } };
  const G = sampleSurf(surf);
  drawSurf(ctx, G, Object.assign({ col: hk.col || D.kosode || '#1e1c24', shade: .05, borders: { v0: false, v1: false } }, opt.surf || {}));
  if (opt.mode === 'flat') return;
  // waist ties (himo) line at the top + front knot
  if (hk.ties !== false) {
    const s = gridScale(G), lw = lineW(s, .6); const uv = []; for (let i = 0; i <= 24; i++) uv.push([i / 24, .12]);
    strokeRuns(ctx, surfLine(surf, uv, .05), lw, LIGHT.ink);
  }
}
// sash / obi band drawn as a ring surface over the waist (optional, design.obi = {col, w})
function drawObi(ctx, S, D, opt) {
  const ob = D.obi; if (!ob) return;
  const T = torsoModel(S, D, .012 * S.B.h / 1.8), v0 = ob.v0 == null ? .02 : ob.v0, v1 = ob.v1 == null ? .14 : ob.v1;
  const surf = { nu: 22, nv: 2, wrapU: true, fn: (u, v) => T.ringAt(lerp(v0, v1, v), u * TAU) };
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: ob.col, shade: .05 }, opt.surf || {}));
}

/* -------------------------------------------------------------------------------- feet (tabi + waraji) */
function drawFoot(ctx, S, D, side, opt) {
  const J = S.J, M = S.M[`foot${side}`], B = S.B, k = B.h / 1.8;
  const c = vAdd(J['an' + side], mApply(M, [0, -B.ankleH * .55, B.foot * .3]));
  const ft = D.feet || {};
  const surf = sEllipsoid(c, M, [.045 * k * (ft.w || 1), .04 * k, B.foot * .55], .8, 12, 8, (l, u, v) => [l[0] * (l[2] > 0 ? 1 : .85), l[1] < -.02 * k ? -.04 * k + (l[1] + .04 * k) * .3 : l[1], l[2]]);
  if (ft.shaft) { // boot shaft up the shin
    const top = vLerp(J['an' + side], J['kn' + side], ft.shaft), sh = sTube([vAdd(J['an' + side], mApply(M, [0, -B.ankleH * .3, 0])), top], v => S.B.limbR.sh * (ft.shaftR || 1.25) * lerp(1, 1.08, v), mApply(M, [1, 0, 0]), 12, 3);
    drawSurf(ctx, sampleSurf(sh), Object.assign({ col: ft.shaftCol || ft.col || '#c8281e', shade: .1, borders: { v0: false, v1: true } }, opt.surf || {}));
  }
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: ft.col || '#f1efe8', shade: .1 }, opt.surf || {}));
  if (ft.soleCol && opt.mode !== 'flat') { // thick sneaker / boot sole slab
    const sole = [], sole2 = [], sw = ft.w || 1; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; sole.push(vAdd(c, mApply(M, [Math.sin(a) * .047 * k * sw, -.036 * k, Math.cos(a) * B.foot * .56]))); sole2.push(vAdd(c, mApply(M, [Math.sin(a) * .047 * k * sw, -.036 * k - (ft.soleH || .022) * k, Math.cos(a) * B.foot * .56]))); }
    const s2 = project(c) ? pxScale(c) : 100, lw2 = lineW(s2, .6);
    for (let i = 0; i < 14; i++) { const q = [sole[i], sole[(i + 1) % 14], sole2[(i + 1) % 14], sole2[i]]; const sp = projPoly(q); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = tones(ft.soleCol).base; ctx.fill(); ctx.strokeStyle = tones(ft.soleCol).base; ctx.lineWidth = 1; ctx.stroke(); } }
    const outline = hull2(sole.concat(sole2).map(p => proj2(p).slice(0, 2))); polyPath(ctx, outline); ctx.lineWidth = lw2; ctx.strokeStyle = LIGHT.ink; ctx.stroke();
    if (ft.soleLine) { const sp = projPoly(sole); if (sp.length > 2) { polyPath(ctx, sp); ctx.lineWidth = lw2 * .7; ctx.strokeStyle = ft.soleLine; ctx.stroke(); } }
  }
  if (ft.sandal !== false && opt.mode !== 'flat') {
    const sole = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; sole.push(vAdd(c, mApply(M, [Math.sin(a) * .042 * k, -.041 * k, Math.cos(a) * B.foot * .52]))); }
    const sp = projPoly(sole); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = tones(ft.sole || '#b89a6a').shade; ctx.fill(); ctx.lineWidth = lineW(project(c) ? pxScale(c) : 100, .6); ctx.strokeStyle = LIGHT.ink; ctx.stroke(); }
  }
}

/* -------------------------------------------------------------------------------- arms: sleeve + forearm + hand */
function sleeveSpec(D) { return Object.assign({ col: D.kosode || '#1e1c24', lining: null, r0: .085, r1: .1, r2: .13, sag: .16, len: 1.02, torn: 0 }, D.sleeve || {}); }
function sleeveSurf(S, D, F, t, side) {
  const J = S.J, B = S.B, k = B.h / 1.8, sl = sleeveSpec(D), sg = side === 'L' ? 1 : -1;
  const sh = vAdd(J['sh' + side], mApply(S.M.chest, [-sg * .03 * k, .01 * k, 0]));
  // raised forearm: the wide sleeve slides down toward the elbow (bares the forearm) and drapes less -> no black 'bag' blobs
  const upK = clamp((vNorm(vSub(J['wr' + side], J['el' + side]))[1] - .15) / .6, 0, 1), upArm = clamp((vNorm(vSub(J['el' + side], J['sh' + side]))[1] + .1) / .7, 0, 1), lift = Math.max(upK, upArm);
  const end = vLerp(J['el' + side], J['wr' + side], sl.len * (1 - .6 * lift));
  const lag = F && F.springWin ? springLag(F, t, s2 => s2.J['wr' + side], 70, 10, .25, 'sl' + side) : [0, 0, 0];
  const g = vNorm(vAdd([0, -1, 0], vMul(lag, 3)));
  const r0 = sl.r0 * k, r1 = sl.r1 * k * (1 - .15 * lift), r2 = sl.r2 * k * (1 - .4 * lift), sagK = 1 - .8 * lift;
  return sTube([sh, J['el' + side], end], (v, th) => (v < .5 ? lerp(r0, r1, v * 2) : lerp(r1, r2, (v - .5) * 2)) * (1 + .05 * Math.sin(th * 3 + v * 4)), mApply(S.M.chest, [0, 0, 1]), 20, 12, {
    round: .3,
    sag: (v, th, Mf) => { const rd = vAdd(vMul(Mf[0], Math.sin(th)), vMul(Mf[2], Math.cos(th))); const w = Math.max(0, vDot(rd, g)); const hang = Math.pow(w, 1.3) * sl.sag * k * sagK * smooth((v - .25) / .75); return vMul(g, hang); },
  });
}
function drawSleeve(ctx, S, D, F, t, side, pass, opt) {
  const sl = sleeveSpec(D); if (sl.none) return;
  const surf = sleeveSurf(S, D, F, t, side); const G = sampleSurf(surf);
  const torn = sl.torn ? [(u, v) => (1 - v) * 40 - (fbm(u * 9 + side.length) * .5 + .5) * sl.torn * 40 + 1] : null;
  drawSurf(ctx, G, Object.assign({ col: sl.col, side: pass, backCol: sl.lining || shadeHex(sl.col, -.45), shade: .08, borders: { v0: false, v1: true, u0: false, u1: false }, masks: torn || undefined, maskInk: torn ? [true] : undefined, maskW: .9,
    pattern: (sl.flowers || sl.patternFn) ? (c, G2, sg) => { if (sl.patternFn) sl.patternFn(c, surf, G2, sg, side, S, D); if (sg > 0 && sl.flowers) surfFlowers(c, surf, side === 'L' ? 41 : 43, 10, (D.haori && D.haori.patCol) || '#fff', .05 * S.B.h / 1.8, .2, 1); } : null }, opt.surf || {}));
}
// short haori sleeve over the upper arm (captains with short-sleeved haori)
function drawCapSleeve(ctx, S, D, side, opt) {
  const J = S.J, k = S.B.h / 1.8, H = haoriSpec(D), sg = side === 'L' ? 1 : -1;
  const cl = H.capLen || .55, a = vAdd(J['sh' + side], mApply(S.M.chest, [-sg * .03 * k, .015 * k, 0])), b = cl <= 1 ? vLerp(J['sh' + side], J['el' + side], cl) : vLerp(J['el' + side], J['wr' + side], cl - 1);
  const pathPts = cl <= 1 ? [a, b] : [a, J['el' + side], b], cr = H.capR || [.1, .125];
  const surf = sTube(pathPts, (v, th) => lerp(cr[0], cr[1], v) * k, mApply(S.M.chest, [0, 0, 1]), 14, 4, { sag: (v, th, Mf) => { const rd = vAdd(vMul(Mf[0], Math.sin(th)), vMul(Mf[2], Math.cos(th))); return vMul([0, -1, 0], Math.max(0, -rd[1]) * .05 * k * v); } });
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: H.col, side: 'both', backCol: H.lining, shade: .06, borders: { v0: false, v1: true, u0: false, u1: false },
    pattern: H.flames ? (c, G2, sgn) => { if (sgn > 0) flamePattern(c, surf, H.flames, 1, side === 'L' ? 3 : 7, 6); } : null }, opt.surf || {}));
}
/* flame hem pattern on a cloth surface (Rengoku's haori): flame tongues rising from the v=1 hem.
   fl = {col, col2, h (height in v), n (tongues around u), u0, u1}                                                  */
function flamePattern(ctx, surf, fl, dir = 1, seed = 1, nT) {
  const n = nT || fl.n || 18, h = fl.h || .3, u0 = fl.u0 || 0, u1 = fl.u1 == null ? 1 : fl.u1;
  const layer = (col, hk, sh) => {
    const uv = []; const N = n * 6;
    for (let i = 0; i <= N; i++) { const u = lerp(u0, u1, i / N), ph = (i / 6) % 1, k = Math.floor(i / 6); const tongue = Math.pow(Math.sin(ph * Math.PI), 1.6) * (.55 + .45 * hash(seed + k * 3)); const curl = Math.sin(ph * TAU) * .25 / n;
      uv.push([u + curl * hk, 1 - h * hk * (.18 + tongue * (.82 + sh))]); }
    uv.push([u1, 1.02]); uv.push([u0, 1.02]);
    const pts = uv.map(([u, v]) => surf.fn(clamp(u, 0, 1), clamp(v, 0, 1))); const sp = projPoly(pts); if (sp.length < 3) return;
    polyPath(ctx, catmull(sp, true, 2)); ctx.fillStyle = tones(col).base; ctx.fill();
  };
  layer(fl.col || '#e8501e', 1, 0); layer(fl.col2 || '#c41e16', .62, .1); if (fl.col3) layer(fl.col3, .3, .2);
}
function drawForearm(ctx, S, D, side, opt) {
  const J = S.J, B = S.B, r = B.limbR.fa;
  const surf = sTube([vLerp(J['el' + side], J['wr' + side], .3), J['wr' + side]], v => r * lerp(1, .8, v), [1, 0, 0], 8, 4);
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: D.armSkin || D.skin, shade: .1, borders: { v0: false, v1: false } }, opt.surf || {}));
}
// bare upper arm (sleeveless characters / torn sleeves)
function drawUpperArm(ctx, S, D, side, opt) {
  const J = S.J, B = S.B; const r0 = B.limbR.ua * 1.15, r1 = B.limbR.fa;
  const A = D.arm, flex = A ? clamp(((S.pose['e' + side] || 0) - .3) / 1.6, 0, 1) * (A.flex == null ? .25 : A.flex) + (S.pose.pump || 0) * .12 : 0;
  // A = muscle profile {delt, bicep, elbow, fore, wrist}: radius multipliers along shoulder -> elbow (ve) -> wrist (bicep swells with elbow bend)
  let path = [J['sh' + side], J['el' + side], J['wr' + side]], rr = v => lerp(r0, r1, v) * (1 + .18 * Math.sin(clamp(v * 2, 0, 1) * Math.PI));
  if (A) { // muscle profile {delt, bicep, elbow, fore, wrist}: radius multipliers; the tube starts above the joint so the deltoid caps the shoulder
    const out = vNorm(vSub(J['sh' + side], J.neck)), up = S.M.chest[1], ua = B.limbR.ua, fa = B.limbR.fa, rD = ua * (A.delt || 1.3);
    const top = vMad(vMad(J['sh' + side], out, -rD * .3), up, rD * .5); path = [top, vLerp(J['sh' + side], J['el' + side], .45), J['el' + side], J['wr' + side]];
    const d0 = vDist(top, J['sh' + side]) + vDist(J['sh' + side], J['el' + side]), ve = d0 / (d0 + vDist(J['el' + side], J['wr' + side])), bic = ua * (1 + (A.bicep || .3) * (1 + flex * 2.2));
    const b = [[0, rD * .55], [.07, rD], [ve * .45, rD * .92], [ve * .68, bic], [ve * .97, fa * (A.elbow || .95)], [ve + (1 - ve) * .28, fa * (1 + (A.fore || .35))], [1, fa * (A.wrist || .72)]];
    rr = v => { let i = 1; while (i < b.length - 1 && b[i][0] < v) i++; const t = clamp((v - b[i - 1][0]) / (b[i][0] - b[i - 1][0]), 0, 1); return lerp(b[i - 1][1], b[i][1], smooth(t)); };
  }
  const surf = sTube(path, rr, mApply(S.M.chest, [0, 0, 1]), A ? 18 : 12, A ? 20 : 10, { round: A ? .5 : .25 });
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: D.armSkin || D.skin, shade: .1, borders: { v0: false, v1: false } }, opt.surf || {}));
}

/* hands: palm (superellipsoid) + fingers (outlined capsules), shapes: relax fist grip open claw point flat hid */
const HAND_SHAPES = {
  relax: { curl: [.45, .5, .55, .6], spread: .08, thumb: .3 }, fist: { curl: [1, 1, 1, 1], spread: 0, thumb: .9 },
  grip: { curl: [.92, .95, .97, 1], spread: 0, thumb: .8 }, open: { curl: [.08, .06, .1, .14], spread: .22, thumb: .05 },
  claw: { curl: [.62, .66, .7, .74], spread: .3, thumb: .4, tip: .7 }, point: { curl: [0, 1, 1, 1], spread: 0, thumb: .8 },
  flat: { curl: [0, 0, 0, 0], spread: 0, thumb: 0 }, sign: { curl: [0, 0, 1, 1], spread: 0, thumb: .8 }, hid: null,
};
function handGeom(S, side, shapeName) {
  const sh = HAND_SHAPES[shapeName] || HAND_SHAPES.relax; if (!sh) return null;
  const M = S.M['hand' + side], wr = S.J['wr' + side], B = S.B, L = B.hand / .09 * .09, sg = side === 'L' ? 1 : -1;
  const X = M[0], Y = M[1], Z = M[2], np = vMul(X, -sg); // palm normal faces the body midline at rest
  const P = (x, y, z) => vAdd(wr, vAdd(vMul(np, x), vAdd(vMul(Y, y), vMul(Z, z))));
  const fingers = [];
  const baseZ = [.036, .013, -.01, -.03], lens = [.46, .5, .47, .38];
  for (let i = 0; i < 4; i++) {
    const c = sh.curl[i], spr = (i - 1.5) * sh.spread * .5;
    const base = P(0, -.56 * L, baseZ[i] * L / .09);
    const a1 = c * 1.45, a2 = c * 1.5 + (sh.tip || 0) * .3;
    // direction in (np, -Y, Z) plane: start along -Y, rotate toward np by curl
    const d0 = vNorm(vAdd(vMul(Y, -Math.cos(a1)), vAdd(vMul(np, Math.sin(a1)), vMul(Z, spr))));
    const j1 = vMad(base, d0, lens[i] * L * .55);
    const d1 = vNorm(vAdd(vMul(Y, -Math.cos(a1 + a2)), vAdd(vMul(np, Math.sin(a1 + a2)), vMul(Z, spr))));
    const tip = vMad(j1, d1, lens[i] * L * .45);
    fingers.push([base, j1, tip]);
  }
  const tc = sh.thumb;
  const tb = P(.012, -.14 * L, .04 * L / .09);
  const td = vNorm(vAdd(vMul(Z, lerp(.75, .05, tc)), vAdd(vMul(Y, -lerp(.55, .4, tc)), vMul(np, lerp(.15, .9, tc)))));
  const tj = vMad(tb, td, .26 * L);
  const td2 = vNorm(vAdd(td, vAdd(vMul(Z, -tc * .9), vMul(np, tc * .2))));
  fingers.push([tb, tj, vMad(tj, td2, .2 * L)]);
  const palmC = P(0, -.33 * L, .003);
  return { fingers, palmC, M: [vMul(Z, 1), Y, vMul(np, 1)], X, Y, Z, np, L, shape: shapeName };
}
function drawHand(ctx, S, D, side, shape, opt) {
  const hg = handGeom(S, side, shape); if (!hg) return;
  const pc = project(hg.palmC); if (!pc) return;
  const s = pc.s, skin = D.handSkin || D.skin, T = tones(D.fingerCol || skin), lw = lineW(s, .8), fw = .021 * hg.L / .09 * s * (D.fingerW || 1);
  const flat = opt.mode === 'flat';
  // palm surface
  const palm = sEllipsoid(hg.palmC, [hg.Z, hg.Y, hg.np], [.04 * hg.L / .09, .03 * hg.L / .09 * 1.1, .016 * hg.L / .09], .7, 10, 6);
  const G = sampleSurf(palm);
  // fingers sorted by depth; those behind the palm drawn first
  const fz = hg.fingers.map((f, i) => ({ i, f, z: camDepth(f[1]) }));
  const pz = camDepth(hg.palmC);
  const ld = lightDir2D(hg.palmC), backFacing = vDot(vMul(hg.np, -1), toCam(hg.palmC)) > 0;
  const drawF = (f, isThumb) => {
    const pts = f.map(p => proj2(p)); const ws = [fw * (isThumb ? 1.12 : 1), fw * .92, fw * .74];
    if (flat) { polyPath(ctx, pts, false); ctx.lineWidth = fw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = opt.col; ctx.stroke(); return; }
    // outline polygon of the finger (two phalanges, rounded tip)
    const L = [], R = []; for (let i = 0; i < 3; i++) { const a = pts[Math.max(0, i - 1)], c2 = pts[Math.min(2, i + 1)]; let dx = c2[0] - a[0], dy = c2[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = ws[i] / 2; L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); }
    const tip = pts[2], a2 = pts[1]; let tx = tip[0] - a2[0], ty = tip[1] - a2[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl; const capR = ws[2] / 2;
    const cap = []; for (let k = 1; k < 6; k++) { const an = Math.atan2(ty, tx) + Math.PI / 2 - k / 6 * Math.PI; cap.push([tip[0] + Math.cos(an) * capR, tip[1] + Math.sin(an) * capR]); }
    const poly = L.concat(cap, R.slice().reverse()); polyPath(ctx, poly); ctx.fillStyle = T.base; ctx.fill();
    ctx.save(); ctx.clip(); const sideL = (-(ty) * ld[0] + tx * ld[1]) < 0; polyPath(ctx, pts.concat((sideL ? L : R).slice().reverse())); ctx.fillStyle = T.shade; ctx.fill(); ctx.restore();
    polyPath(ctx, poly); ctx.lineWidth = lw * .9; ctx.strokeStyle = LIGHT.ink; ctx.lineJoin = 'round'; ctx.stroke();
    if (fw > 6) { // knuckle crease + nail
      const j = pts[1]; ctx.beginPath(); ctx.moveTo(j[0] - ty * ws[1] * .25 - tx * 1, j[1] + tx * ws[1] * .25 - ty * 1); ctx.lineTo(j[0] + ty * ws[1] * .25, j[1] - tx * ws[1] * .25); ctx.lineWidth = lw * .5; ctx.stroke();
      if (backFacing && D.nailCol !== false) { ctx.beginPath(); ctx.ellipse(tip[0] - tx * capR * .35, tip[1] - ty * capR * .35, capR * .55, capR * .75, Math.atan2(ty, tx) + Math.PI / 2, 0, TAU); ctx.fillStyle = D.nailCol || mixHex(T.base, '#ffffff', .35); ctx.fill(); ctx.lineWidth = lw * .4; ctx.stroke(); }
    }
  };
  fz.filter(o => o.z > pz).sort((a, b) => b.z - a.z).forEach(o => drawF(o.f, o.i === 4));
  drawSurf(ctx, G, Object.assign({ col: skin, shade: .1, handShade: true, h2d: .25, hatch: false }, opt.surf || {}));
  fz.filter(o => o.z <= pz).sort((a, b) => b.z - a.z).forEach(o => drawF(o.f, o.i === 4));
}

/* -------------------------------------------------------------------------------- neck */
function drawNeck(ctx, S, D, opt) {
  const J = S.J, r = S.B.limbR.neck;
  const surf = sTube([vAdd(J.neck, mApply(S.M.chest, [0, -.02, -.005])), J.headBase, vAdd(J.head, mApply(S.M.head, [0, -.02, -.03]))], v => r * lerp(1.05, .92, v), mApply(S.M.neck, [1, 0, 0]), 10, 5);
  let neckPath = null;
  drawSurf(ctx, sampleSurf(surf), Object.assign({ col: D.neckSkin || D.skin, shade: .15, shadeCol: D.skinShade, handShade: true, h2d: .3, borders: { v0: false, v1: false }, onRegion: (c, reg) => { neckPath = reg.path; } }, opt.surf || {}));
  // chin cast shadow on the neck (hand placed: the jaw line dropped onto the neck)
  if (neckPath && opt.mode !== 'flat' && !LIGHT.override && D.drawHead) { const HM = headModel(S, D), pts = []; for (let i = 0; i <= 12; i++) { const th = (i / 12 - .5) * 2.4; pts.push(proj2(HM.at(th, -.62 - .35 * Math.cos((i / 12 - .5) * Math.PI)))); }
    const drop = HM.r * pxScale(HM.c) * .32; ctx.save(); ctx.clip(neckPath); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1] - drop * 3); for (const p of pts) ctx.lineTo(p[0], p[1] + drop); ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1] - drop * 3); ctx.closePath(); ctx.fillStyle = tones(D.skinShade || shadeHex(D.skin, -.2)).base; ctx.fill(); ctx.restore(); }
}

/* -------------------------------------------------------------------------------- haori (captain coat) */
function haoriSpec(D) { return Object.assign({ col: '#f4f2ec', lining: '#d8d6cf', len: .8, open: .2, flare: .32, sleeves: true, hem: 'hishi', kanji: null, torn: 0 }, D.haori || {}); }
function haoriSurf(S, D, F, t) {
  const H = haoriSpec(D), B = S.B, k = B.h / 1.8, T = torsoModel(S, D, .026 * k);
  const J = S.J, M = S.M, pelvisW = J.pelvis;
  const gY = Math.min(J.anL[1], J.anR[1]) - B.ankleH * .9, hipY = T.ringAt(0, 0)[1];
  const hemFull = H.len * B.h * .5, hemDrop = Math.min(hemFull, Math.max(.12 * k, hipY - gY));   // length below the hip ring (kneeling: the coat pools on the ground)
  const pool = hemFull - hemDrop;                 // extra length that spreads out on the floor
  const vHip = .42;                               // param where the body part ends and the hanging skirt starts
  // spring lag of the hem (3 anchors: left, back, right)
  const lagAt = th => springLag(F, t, s2 => { const T2 = torsoModel(s2, D, .026 * k); return vAdd(T2.ringAt(0, th), [0, -hemDrop, 0]); }, 34, 5.5, .9, 'ha' + th.toFixed(2), 1);
  const lags = F ? [lagAt(Math.PI * .5), lagAt(Math.PI), lagAt(Math.PI * 1.5)] : [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const legs = ['L', 'R'].map(sd => hakamaLegPts(S, sd));
  const legR = ((D.hakama && D.hakama.r1) || .115) * k * 1.15;
  const sp = vLen(lags[1]);
  return { nu: 40, nv: 16, flip: true, fn: (u, v) => {
    const open = H.open * (v < vHip ? lerp(.55, 1, v / vHip) : 1);
    const th = open + u * (TAU - 2 * open);
    if (v <= vHip) {
      // body part: from collar (neck ring) down over shoulders/chest to hip ring
      const tv = 1 - v / vHip;                 // 1 = neck .. 0 = hip
      return T.ringAt(tv, th);
    }
    const w = (v - vHip) / (1 - vHip);
    const base = T.ringAt(0, th);
    const rad = vSub(base, vAdd(pelvisW, [0, base[1] - pelvisW[1], 0])); rad[1] = 0;
    const rn = vNorm(rad);
    let p = vAdd(base, [0, -hemDrop * w, 0]);
    p = vMad(p, rn, H.flare * k * w * w * .4 + pool * .6 * w * w);
    // spring trailing, interpolated around
    const a = ((th / TAU) * 4) % 4; // 0 front,1 left,2 back,3 right
    let lag;
    if (a < 1) lag = vLerp(vMul(vAdd(lags[0], lags[2]), .5), lags[0], a);
    else if (a < 2) lag = vLerp(lags[0], lags[1], a - 1);
    else if (a < 3) lag = vLerp(lags[1], lags[2], a - 2);
    else lag = vLerp(lags[2], vMul(vAdd(lags[0], lags[2]), .5), a - 3);
    p = vMad(p, lag, Math.pow(w, 1.3));
    // flutter on the hem when moving
    const fl = Math.min(1, sp * 3 + (F && F.wind ? vLen(F.wind(t)) * .02 : 0));
    p = vMad(p, rn, Math.sin(th * 3 + t * 9) * .03 * k * fl * w * w);
    p[1] += Math.sin(th * 2 - t * 7) * .02 * k * fl * w * w;
    // push out of the legs (drapes over a raised knee)
    for (const L of legs) for (let s = 0; s < 2; s++) {
      const a0 = L[s], b0 = L[s + 1], ab = vSub(b0, a0), tt = clamp(vDot(vSub(p, a0), ab) / vDot(ab, ab), 0, 1);
      const q = vMad(a0, ab, tt), d = vSub(p, q), dl = vLen(d);
      if (dl < legR) p = vMad(q, dl > 1e-5 ? vMul(d, 1 / dl) : rn, legR);
    }
    return p;
  } };
}
function drawHaori(ctx, S, D, F, t, pass, opt) {
  const H = haoriSpec(D); if (H.none) return;
  const surf = haoriSurf(S, D, F, t), G = sampleSurf(surf);
  const masks = [], maskInk = [];
  if (H.torn) { masks.push((u, v) => (1 - v) * 30 - (fbm(u * 14 + 3) * .5 + .55) * H.torn * 30 + .3); maskInk.push(true); }
  if (H.slits) { const n = H.slits; masks.push((u, v) => { if (v < .5) return 1; const f = u * n, d = Math.abs(f - Math.round(f)); return d * 4.2 - (v - .5) * 2.6 + .02; }); maskInk.push(true); }
  const patt = (H.hem === 'hishi' || H.kanji || H.flowers || H.flames || H.squares || H.patternFn) ? (c, G2, sg) => { haoriPattern(c, surf, G2, sg, H); if (H.patternFn) H.patternFn(c, surf, G2, sg, S, D); if (H.flames && sg > 0) flamePattern(c, surf, H.flames, 1, 11); if (H.flowers && sg > 0) surfFlowers(c, surf, 17, 34, H.patCol || '#fff', .055 * S.B.h / 1.8, .08, .98); } : null;
  drawSurf(ctx, G, Object.assign({ col: H.col, backCol: H.lining, side: pass, shade: .06, borders: { v0: true, v1: true, u0: true, u1: true }, masks, maskInk, pattern: patt }, opt.surf || {}));
  if (opt.mode === 'flat') return;
  // collar band (eri) along both front edges and around the neck + a few vertical drape folds
  const s = gridScale(G), lw = lineW(s, .55);
  for (const u0 of [.022, .978]) { const uv = []; for (let i = 0; i <= 14; i++) uv.push([u0, i / 14 * (H.collarLen || .7)]); strokeRuns(ctx, surfLine(surf, uv, pass === 'front' ? 0 : -2), lw, LIGHT.ink); }
  if (pass === 'front') for (const u0 of [.2, .33, .5, .67, .8]) { const uv = []; for (let i = 0; i <= 6; i++) uv.push([u0 + .01 * Math.sin(i), .55 + i / 6 * .4]); strokeRuns(ctx, surfLine(surf, uv, .15), lw * .8, LIGHT.ink, [.6, .2]); }
}
// hishi (diamond) band along the hem + division kanji on the back
function haoriPattern(ctx, surf, G, sg, H) {
  if (sg < 0) return;
  if (H.squares) { const q = H.squares; ctx.fillStyle = tones(q.col || '#2a1a2a').base; for (let i = 0; i < (q.n || 6); i++) for (let j = 0; j < 3; j++) { const u = lerp(.32, .68, (i + .5) / (q.n || 6)), v = lerp(.12, .4, (j + .5) / 3), fr = surfFrame(surf, u, v); if (vDot(fr.n, toCam(fr.p)) <= 0 || (i + j) % 2) continue; const du = vMul(fr.du, .36 / (q.n || 6) * .5), dv = vMul(fr.dv, .28 / 3 * .5); const sp = projPoly([vAdd(vAdd(fr.p, du), dv), vSub(vAdd(fr.p, du), dv), vSub(vSub(fr.p, du), dv), vAdd(vSub(fr.p, du), dv)]); if (sp.length > 2) { polyPath(ctx, sp); ctx.fill(); } } }
  const s = gridScale(G); ctx.fillStyle = tones(H.patCol || '#1c1a22').base;
  if (H.hem === 'hishi') {
    const n = 26, v0 = .9;
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, fr = surfFrame(surf, u, v0), f = vDot(fr.n, toCam(fr.p)); if (f <= 0) continue;
      const a = proj2(fr.p), du = vMul(fr.du, .5 / n), dv = vMul(fr.dv, .055);
      const b = proj2(vAdd(fr.p, du)), c = proj2(vAdd(fr.p, dv)), d = proj2(vSub(fr.p, du)), e = proj2(vSub(fr.p, dv));
      ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill();
    }
  }
  if (H.kanji) {
    const fr = surfFrame(surf, .5, .3), f = vDot(fr.n, toCam(fr.p));
    if (f > .05) {
      const tu = vMul(vNorm(fr.du), .11 * (H.kanjiScale || 1)), tv = vMul(vNorm(fr.dv), .11 * (H.kanjiScale || 1));
      decal(ctx, fr.p, tu, tv, c2 => {
        c2.fillStyle = tones(H.patCol || '#1c1a22').base;
        c2.save(); c2.rotate(Math.PI / 4); c2.lineWidth = .06; c2.strokeStyle = c2.fillStyle; c2.strokeRect(-.85, -.85, 1.7, 1.7); c2.restore();
        c2.font = `900 1px "IPAGothic", "WenQuanYi Zen Hei", sans-serif`; c2.textAlign = 'center'; c2.textBaseline = 'middle';
        c2.save(); c2.scale(1.05, 1.05); c2.fillText(H.kanji, 0, .04); c2.restore();
      }, .02, fr.n);
    }
  }
}

/* -------------------------------------------------------------------------------- scarf (ribbon around the neck + tails) */
function drawScarf(ctx, S, D, F, t, opt, which = 'all') {
  const sc = D.scarf; if (!sc) return;
  const B = S.B, k = B.h / 1.8, T = torsoModel(S, D, .03 * k);
  // collar wrap
  const wrapSurf = { nu: 20, nv: 3, wrapU: true, fn: (u, v) => T.ringAt(lerp(sc.v0 || .94, sc.v1 || 1, v), u * TAU, (.025 + .012 * Math.sin(v * Math.PI)) * k) };
  if (which !== 'tails') drawSurf(ctx, sampleSurf(wrapSurf), Object.assign({ col: sc.col, shade: .05, extraTones: sc.stripes ? [{ col: sc.stripes.col, mask: (u, v) => Math.sin(u * TAU * sc.stripes.n * 2) - .3 }] : null }, opt.surf || {}));
  if (which === 'wrap' || !sc.tails) return;
  // tails: chain from a point on the wrap with spring lag; two springs (mid, tip) for a travelling wave
  for (const tl of sc.tails) {
    const root = T.ringAt(.93, tl.th, .05 * k);
    const len = tl.len * k;
    const lagM = springLag(F, t, s2 => vAdd(torsoModel(s2, D, .05 * k).ringAt(.93, tl.th), [0, -len * .5, 0]), 40, 6, len * .8, 'scm' + tl.th, 1.2);
    const lagT = springLag(F, t, s2 => vAdd(torsoModel(s2, D, .05 * k).ringAt(.93, tl.th), [0, -len, 0]), 18, 3.2, len * 1.2, 'sct' + tl.th, 1.5);
    const out = vNorm(vSub(root, S.J.neck)); out[1] = 0;
    const spine = [], wv = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const v = i / n; let p = vAdd(root, [0, -len * v, 0]); p = vMad(p, out, (tl.out || .08) * k * Math.sin(v * Math.PI * .5));
      p = vAdd(p, vAdd(vMul(lagM, Math.sin(v * Math.PI * .5) * .9), vMul(lagT, Math.pow(v, 2))));
      p[1] += Math.sin(v * 7 - t * 6) * .015 * k * v;
      spine.push(p);
    }
    for (let i = 0; i <= n; i++) { const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n, i + 1)]; const tg = vNorm(vSub(b, a)); let side = vNorm(vCross(tg, out)); side = vNorm(vAdd(side, [0, 0, 0])); wv.push(vMul(side, tl.w * k * (1 - .25 * i / n) * (1 + .15 * Math.sin(i * 1.3 + t * 5)))); }
    const surf = sRibbon(spine, wv, 3, n * 2);
    drawSurf(ctx, sampleSurf(surf), Object.assign({ col: sc.col, side: 'both', backCol: shadeHex(sc.col, -.18), shade: .05, extraTones: sc.stripes ? [{ col: sc.stripes.col, mask: (u, v) => Math.sin(v * TAU * sc.stripes.n + .6) - .25 }] : null }, opt.surf || {}));
  }
}

/* -------------------------------------------------------------------------------- weapons */
// sword frame from hand: returns {grip: point, dir: blade dir, flat: blade flat normal, edge}
function swordFrame(S, D, sw) {
  const side = sw.hand || 'R', M = S.M['hand' + side], sg = side === 'L' ? 1 : -1;
  const hg = handGeom(S, side, 'grip');
  const grip = hg ? vLerp(hg.palmC, hg.fingers[1][1], .55) : S.J['hand' + side];
  let dir;
  if (sw.dir) dir = vNorm(mApply(S.R, sw.dir));
  else { const R = mMul(M, mMul(mRotX(-HP - (sw.p || 0)), mRotY(sg * (sw.y || 0)))); dir = vNorm(mApply(R, [0, -1, 0])); dir = vMul(dir, -1); dir = vNorm(mApply(M, mApply(mMul(mRotX(-(sw.p || 0)), mRotY(sg * (sw.y || 0))), [0, 0, 1]))); }
  // blade flat normal: perpendicular to dir, roughly the palm normal rotated by roll
  let side0 = vNorm(vCross(dir, mApply(M, [1, 0, 0]))); if (vLen(side0) < .1) side0 = [0, 1, 0];
  const flat = vNorm(mApply(mAxis(dir, sw.r || 0), side0));
  const edge = vNorm(vCross(flat, dir));
  return { grip, dir, flat, edge, side };
}
/* draw a katana-type blade. spec: {len, w, curve, handle, tsuba:'round'|'star'|'square'|'none', col, edgeCol, hiltCol,
   wrapCol, shape:'katana'|'cleaver'|'trident'|'broken'|'jagged'}                                                   */
function drawSword(ctx, S, D, sw, spec, opt) {
  if (!sw || sw.hidden) return; const k = S.B.h / 1.8;
  const fr = swordFrame(S, D, sw); const { grip, dir, flat, edge } = fr;
  const L = (spec.len || .95) * k, hl = (spec.handle || .26) * k, w = (spec.w || .035) * k;
  const flatMode = opt.mode === 'flat';
  const pts = (u, e) => { // u along blade 0..1, e across (0 spine .. 1 edge)
    const curve = (spec.curve == null ? .04 : spec.curve) * L * Math.sin(u * Math.PI * .8);
    return vAdd(grip, vAdd(vMul(dir, hl * .35 + u * L), vMul(edge, -curve + (e - .3) * w * (spec.widthFn ? spec.widthFn(u) : 1))));
  };
  // handle
  const hA = vMad(grip, dir, -hl * .65), hB = vMad(grip, dir, hl * .35);
  const pz = project(grip); if (!pz) return; const s = pz.s, lw = lineW(s, .7);
  const hs = proj2(hA), he = proj2(hB);
  ctx.lineCap = 'round';
  if (spec.drawHandle !== false) {
    ctx.strokeStyle = flatMode ? opt.col : LIGHT.ink; ctx.lineWidth = .032 * k * s + lw * 2; ctx.beginPath(); ctx.moveTo(hs[0], hs[1]); ctx.lineTo(he[0], he[1]); ctx.stroke();
    if (!flatMode) { ctx.strokeStyle = tones(spec.hiltCol || '#2a2433').base; ctx.lineWidth = .032 * k * s; ctx.stroke();
      // wrap diamonds
      ctx.fillStyle = tones(spec.wrapCol || '#d9d2c0').base;
      for (let i = 1; i < 7; i++) { const p = proj2(vLerp(hA, hB, i / 7)); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(.6, .007 * k * s), 0, TAU); ctx.fill(); } }
  }
  if (spec.pommel) spec.pommel(ctx, hA, dir, flat, edge, s, flatMode, opt);
  // blade polygon
  if (spec.shape !== 'none' && !sw.noBlade) {
    const n = 14, top = [], bot = [];
    const bl = sw.bladeLen == null ? 1 : sw.bladeLen;
    for (let i = 0; i <= n; i++) { const u = i / n * bl; top.push(pts(u, 0)); bot.push(pts(Math.min(u, bl * .985), 1)); }
    const tip = pts(bl * 1.0, .1);
    let poly = top.concat([tip]).concat(bot.reverse());
    if (spec.bladePoly) poly = spec.bladePoly(pts, bl);
    const sp = projPoly(poly);
    if (sp.length > 2) {
      polyPath(ctx, sp);
      const facing = Math.abs(vDot(flat, toCam(grip)));
      if (flatMode) { ctx.fillStyle = opt.col; ctx.fill(); }
      else {
        const bc = spec.col || '#c9d3dc';
        ctx.fillStyle = tones(bc).base; ctx.fill();
        // edge band (hamon) and shadow half
        const eb = []; for (let i = 0; i <= n; i++) eb.push(pts(i / n * bl * .985, .55 + .1 * Math.sin(i * 1.7)));
        const ep = projPoly(bot.slice().reverse().concat(eb.reverse()));
        if (ep.length > 2 && !LIGHT.override) { polyPath(ctx, ep); ctx.fillStyle = spec.edgeCol || '#f4f8ff'; ctx.fill(); }
        if (facing < .35) { polyPath(ctx, sp); ctx.fillStyle = rgba('#000000', .25); ctx.fill(); }
        polyPath(ctx, sp); ctx.lineWidth = lw; ctx.strokeStyle = LIGHT.ink; ctx.lineJoin = 'round'; ctx.stroke();
      }
    }
  }
  // guard
  if (spec.tsuba !== 'none') {
    const r = (spec.tsubaR || .05) * k, g0 = vMad(grip, dir, hl * .35);
    const gp = []; const nn = spec.tsuba === 'star' ? 8 : 16;
    for (let i = 0; i < nn; i++) { const a = i / nn * TAU, rr = spec.tsuba === 'star' ? (i % 2 ? r * .45 : r * 1.25) : spec.tsuba === 'square' ? r / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))) * .8 : r; gp.push(vAdd(g0, vAdd(vMul(flat, Math.cos(a) * rr), vMul(edge, Math.sin(a) * rr)))); }
    fill3D(ctx, gp, flatMode ? opt.col : tones(spec.tsubaCol || '#c8a24a').base, flatMode ? 0 : lw);
  }
  if (spec.extra) spec.extra(ctx, fr, pts, s, flatMode, opt, S);
  return fr;
}

/* -------------------------------------------------------------------------------- main figure draw */
function designAt(F, t) {
  const D = F.design, fname = F.formAt ? F.formAt(t) : F.form;
  if (!D.forms || !D.forms[fname]) return D;
  const key = '_m_' + fname; if (!D[key]) { D[key] = Object.assign({}, D, D.forms[fname]); D[key]._body = D.forms[fname]._body || D._body || makeBody(D); }
  return D[key];
}
function drawFig(ctx, F, t, opt = {}) {
  const td = F.timing > 1 ? onN(t, F.timing) : t;
  const S = figSkel(F, td); let D = designAt(F, td); if (D.dynDesign) D = D.dynDesign(D, S.pose, S);
  const parts = [];
  buildFigParts(S, D, F, td, parts, opt);
  if (D.extras) D.extras(S, D, F, td, parts, opt);
  parts.sort((a, b) => b.z - a.z);
  if (opt.clipNear != null) { for (let i = parts.length - 1; i >= 0; i--) if (parts[i].z < opt.clipNear) parts.splice(i, 1); }
  // cartoon squash & stretch (pose.squash -1 flat .. +1 tall): scale the whole drawn figure about its foot point on screen
  const sqz = S.pose.squash || 0; let sqzOn = false; if (Math.abs(sqz) > .01) { const gy = Math.min(S.J.anL ? S.J.anL[1] : 0, S.J.anR ? S.J.anR[1] : 0), qa = project([S.J.pelvis[0], gy, S.J.pelvis[2]]);
    if (qa) { const sy = 1 + .45 * sqz, sx = sqz > 0 ? 1 - .3 * sqz : 1 - .45 * sqz; ctx.save(); ctx.translate(qa.x, qa.y); ctx.scale(sx, sy); ctx.translate(-qa.x, -qa.y); sqzOn = true; } }
  if (opt.mode === 'flat') {
    // render into an offscreen silhouette: draw normally then colour-key with source-in
    const lay = getLayer('figflat', ctx.canvas.width, ctx.canvas.height), g = lay.getContext('2d');
    g.setTransform(ctx.getTransform()); g.clearRect(-1e4, -1e4, 3e4, 3e4);
    for (const p of parts) p.fn(g);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = opt.col || '#000'; g.fillRect(0, 0, lay.width, lay.height); g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha; ctx.drawImage(lay, 0, 0); ctx.restore();
  } else {
    const fa = D.figAlpha ? D.figAlpha(S.pose, D) : S.pose.figAlpha;   // whole-figure transparency (Invisibility Cloak, ghosts): render offscreen, composite once
    if (fa != null && fa < .995) { const lay = getLayer('figalpha', ctx.canvas.width, ctx.canvas.height), g = lay.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, lay.width, lay.height); g.setTransform(ctx.getTransform());
      for (const p of parts) if (!p.noAlpha) p.fn(g); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.max(0, fa) * (opt.alpha == null ? 1 : opt.alpha); ctx.drawImage(lay, 0, 0); ctx.restore(); for (const p of parts) if (p.noAlpha) p.fn(ctx); }   // noAlpha parts (crows of a dissolving figure) stay opaque
    else { const lk0 = LIGHT.lineK; if (D.lineK) LIGHT.lineK = lk0 * D.lineK; try { for (const p of parts) p.fn(ctx); } finally { LIGHT.lineK = lk0; } }
    if (D.postFig && !opt._noPost) D.postFig(ctx, F, t, S, D, opt);
  }
  if (sqzOn) ctx.restore();
  return S;
}
const LAYERS = {};
function getLayer(name, w, h) { let c = LAYERS[name]; if (!c || c.width !== w || c.height !== h) { c = LAYERS[name] = mkCanvas(w, h); } return c; }

function buildFigParts(S, D, F, t, parts, opt) {
  const J = S.J, p = S.pose, add = (z, fn) => parts.push({ z, fn });
  const zT = partZ(vLerp(J.pelvis, J.neck, .5));
  const H = haoriSpec(D);
  // haori: lining behind everything near the torso, outside in front
  if (!H.none) { add(zT + .25, c => drawHaori(c, S, D, F, t, 'back', opt)); add(zT - .06, c => drawHaori(c, S, D, F, t, 'front', opt)); }
  add(zT + .04, c => { drawTorso(c, S, D, F, opt); drawObi(c, S, D, opt); });
  // hakama
  const zHk = partZ(vLerp(J.pelvis, vLerp(J.knL, J.knR, .5), .4));
  add(zHk + .001, c => drawHakamaTop(c, S, D, opt));
  for (const sd of ['L', 'R']) {
    const zl = partZ(vLerp(J['hip' + sd], J['kn' + sd], .6));
    add(Math.max(zl, zHk + .002) + (zl > zHk ? .01 : -.0), c => drawHakamaLeg(c, S, D, sd, opt));
    if (zl < zHk - .05) parts[parts.length - 1].z = zl;
    add(partZ(J['toe' + sd]) - .01, c => drawFoot(c, S, D, sd, opt));
  }
  // arms
  for (const sd of ['L', 'R']) {
    const ze = partZ(vLerp(J['el' + sd], J['wr' + sd], .3)), sh = sleeveSpec(D);
    const zA = ze < zT ? ze - .02 : ze + .02;
    if (sh.none || sh.bare) add(zA, c => drawUpperArm(c, S, D, sd, opt));
    else add(zA, c => { drawSleeve(c, S, D, F, t, sd, 'back', opt); drawForearm(c, S, D, sd, opt); drawSleeve(c, S, D, F, t, sd, 'front', opt); });
    if (H.capSleeve && !H.none) add(zA - .004, c => drawCapSleeve(c, S, D, sd, opt));
    const hs = p['h' + sd] || 'relax';
    add(partZ(J['hand' + sd]) - .01, c => drawHand(c, S, D, sd, hs, opt));
  }
  // neck + head
  add(partZ(J.head) + .002, c => drawNeck(c, S, D, opt));
  if (D.drawHead) D.drawHead(S, D, F, t, parts, opt);
  // scarf
  if (D.scarf) { add(partZ(J.neck) - .07, c => drawScarf(c, S, D, F, t, opt, 'wrap')); if (D.scarf.tails) add(partZ(J.neck) + (vDot(S.M.chest[2], CAM.cur.F) > 0 ? -.2 : .3), c => drawScarf(c, S, D, F, t, opt, 'tails')); }
  // weapons
  if (p.sword && D.sword && !p.sword.sheathed) {
    const sw = p.sword, side = sw.hand || 'R';
    const fr = swordFrame(S, D, sw);
    const zs = partZ(vMad(fr.grip, fr.dir, .3));
    add(Math.min(zs, partZ(J['hand' + side]) + .005), c => drawSword(c, S, D, sw, D.sword, opt));
    if (sw.two) { // other hand grips the handle (IK done visually: draw a gripping hand at the handle)
      const o = side === 'R' ? 'L' : 'R';
      parts.forEach(q => { if (q.hand === o) q.skip = true; });
    }
  }
  if (D.sheath && D.sheath(S, D, F, t, parts, opt)) { /* custom */ }
}
