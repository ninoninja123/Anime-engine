/* Bleach Showdown engine - toon.js : the view-dependent cel renderer.
   Every body part, garment, hair mass and prop is a PARAMETRIC SURFACE P(u,v) in 3D.  Each frame the surface is sampled
   on a grid, projected through the camera, and drawn as flat anime cel regions:
     region   = facing(N, toCamera) > 0  AND  every mask field(u,v) > 0      (front side; back side for cloth linings)
     shadow   = region AND  N.L < threshold         (hard cel terminator, 1 or 2 tones)
     rim      = region AND  near silhouette AND facing the rim light
     fxlight  = region AND  facing a coloured effect light (e.g. blue Hyorinmaru glow on a face)
   Regions are built by clipping every grid quad against the scalar fields (linear interpolation along edges ->
   crisp, smooth boundaries), unioned into one Path2D per tone (no seams).  Contours come from the same clipping:
   facing==0 edges are the silhouette, mask==0 edges are the costume / hairline borders, grid borders of open surfaces
   are hems.  They are stroked with depth-scaled ink.  Because the drawing is derived from the real 3D orientation,
   a character looks right from the front, back, side, 3/4, above and below with correct foreshortening.     */
'use strict';
const LIGHT = {
  key: vNorm([-.45, .75, .5]),  // direction TOWARD the key light (world)
  rim: vNorm([.6, .25, -.75]),  // direction toward rim/back light
  rimCol: '#fff4e0', rimAmt: .55, // rim colour and strength (0 = off)
  shadeTint: '#8a78b8',         // multiply tint for shadow tones (anime shadows lean cool/purple)
  shadeK: .55,                  // how dark shadows are (mix factor toward multiplied tint)
  fx: [],                       // coloured point lights: {p:[x,y,z], col, r: radius, a: strength}
  ambient: null,                // optional colour wash multiplied onto every tone (scene colour script)
  ambientK: 0,
  ink: '#1b1420',
  lineK: 1,                     // global line weight multiplier
  override: null,               // {fill, ink}: lineart / silhouette rendering used by impact frames
  style: 'action3d',            // 'action3d' (normal-based cel) | 'hand2d' (hand-placed shadows, hatching, weighted ink)
  boil: 0, drawIdx: 0,          // line boil (px) and drawing number for hand2d
  hatch: false,                 // hatching inside hand2d shadows (dramatic / manga moments)
};
function lightReset() { Object.assign(LIGHT, { key: vNorm([-.45, .75, .5]), rim: vNorm([.6, .25, -.75]), rimCol: '#fff4e0', rimAmt: .55, shadeTint: '#8a78b8', shadeK: .55, fx: [], ambient: null, ambientK: 0, ink: '#1b1420', lineK: 1, override: null, style: 'action3d', boil: 0, drawIdx: 0, hatch: false }); }
// tone helpers: base colour -> shadow / deep shadow / rim with the scene light script applied
const TONE_CACHE = new Map();
function tones(base) {
  if (LIGHT.override) { const f = LIGHT.override.fill; return { base: f, shade: f, deep: f, hi: f }; }
  const key = base + LIGHT.shadeTint + LIGHT.shadeK + (LIGHT.ambient || '') + LIGHT.ambientK;
  let t = TONE_CACHE.get(key); if (t) return t;
  let b = base; if (LIGHT.ambient && LIGHT.ambientK) b = mixHex(b, multHex(b, LIGHT.ambient), LIGHT.ambientK);
  const sh = mixHex(b, multHex(b, LIGHT.shadeTint), LIGHT.shadeK);
  t = { base: b, shade: sh, deep: mixHex(sh, multHex(sh, LIGHT.shadeTint), .5), hi: mixHex(b, '#ffffff', .35) };
  if (TONE_CACHE.size > 4000) TONE_CACHE.clear(); TONE_CACHE.set(key, t); return t;
}
// ink width in px for a scale s (px per world unit)
const lineW = (s, k = 1) => clamp(1.25 * Math.pow(Math.max(1, s) / 100, .55) * k * LIGHT.lineK, .85, 9);   // min .85 (1080 units) keeps far ink visible at 720p

/* ------------------------------------------------------------------------------------------------- sampling
   surf = { fn(u,v) -> world point, nu, nv, u0=0,u1=1, v0=0,v1=1, wrapU, flip (normal orientation),
            masks: [ (u,v,P)->number ... ] (region = all > 0), maskTags: names for contour styles }          */
function sampleSurf(surf) {
  const nu = surf.nu, nv = surf.nv, u0 = surf.u0 || 0, u1 = surf.u1 == null ? 1 : surf.u1, v0 = surf.v0 || 0, v1 = surf.v1 == null ? 1 : surf.v1;
  const cam = CAM.cur, NU = nu + 1, NV = nv + 1, N = NU * NV;
  const P = new Array(N), S = new Float32Array(N * 2), Z = new Float32Array(N), U = new Float32Array(N), V = new Float32Array(N);
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const k = j * NU + i, u = u0 + (u1 - u0) * i / nu, v = v0 + (v1 - v0) * j / nv; U[k] = u; V[k] = v;
    const p = surf.fn(u, v); P[k] = p; const c = camSpace(p, cam); Z[k] = c[2];
    const s = screenOf([c[0], c[1], Math.max(CAM.near, c[2])], cam); S[2 * k] = s[0]; S[2 * k + 1] = s[1];
  }
  // normals by central differences on the grid (wrap in u if closed)
  const Nn = new Array(N), F = new Float32Array(N), sgn = surf.flip ? -1 : 1;
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const k = j * NU + i;
    let ia = i - 1, ib = i + 1; if (surf.wrapU) { if (ia < 0) ia = nu - 1; if (ib > nu) ib = 1; } else { ia = Math.max(0, ia); ib = Math.min(nu, ib); }
    const ja = Math.max(0, j - 1), jb = Math.min(nv, j + 1);
    let du = vSub(P[j * NU + ib], P[j * NU + ia]), dv = vSub(P[jb * NU + i], P[ja * NU + i]);
    if (vLen(du) < 1e-7) { // pole: use neighbouring row
      const jj = j === 0 ? 1 : j - 1; du = vSub(P[jj * NU + ib], P[jj * NU + ia]);
    }
    let n = vCross(du, dv); const l = vLen(n);
    n = l < 1e-9 ? [0, 1, 0] : vMul(n, sgn / l); Nn[k] = n;
    F[k] = vDot(n, vNorm(vSub(cam.pos, P[k])));
  }
  let zs = 0; for (let k = 0; k < N; k++) zs += Z[k];
  return { surf, nu, nv, NU, P, S, Z, N: Nn, F, U, V, zMean: zs / N };
}
// average pixel scale of a sampled surface
function gridScale(G) { const k = (G.NV >> 1) * G.NU + (G.NU >> 1); return CAM.cur.f / Math.max(CAM.near, G.Z[k]); }

/* ---------------------------------------------------------------------------------------------- clipping core
   Build regions.  fields: array of Float32Array(N) per-vertex values; region keeps all >= 0.
   Returns { path: Path2D, edges: { tag: [x0,y0,x1,y1,...] } }  tags: field index or 'B' (grid border).     */
function clipRegion(G, fields, wantEdges = true, borderTags = null) {
  const { nu, nv, NU, S } = G, path = new Path2D(), edges = {}, nf = fields.length;
  const wrap = G.surf.wrapU, bt = borderTags || { u0: !wrap, u1: !wrap, v0: true, v1: true };
  const quadIdx = [0, 0, 0, 0];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k00 = j * NU + i, k10 = k00 + 1, k11 = k00 + NU + 1, k01 = k00 + NU;
    quadIdx[0] = k00; quadIdx[1] = k10; quadIdx[2] = k11; quadIdx[3] = k01;
    // quick reject / accept
    let allIn = true, anyIn = true;
    for (let f = 0; f < nf; f++) { const A = fields[f]; const a = A[k00], b = A[k10], c = A[k11], d = A[k01];
      if (a < 0 && b < 0 && c < 0 && d < 0) { anyIn = false; break; } if (a < 0 || b < 0 || c < 0 || d < 0) allIn = false; }
    if (!anyIn) continue;
    // border tags for the 4 quad edges: e0 bottom(v=j) 00->10, e1 right(u=i+1) 10->11, e2 top 11->01, e3 left 01->00
    const tg = [j === 0 && bt.v0 ? 'B' : null, i === nu - 1 && bt.u1 ? 'B' : null, j === nv - 1 && bt.v1 ? 'B' : null, i === 0 && bt.u0 ? 'B' : null];
    if (allIn) {
      path.moveTo(S[2 * k00], S[2 * k00 + 1]); path.lineTo(S[2 * k10], S[2 * k10 + 1]); path.lineTo(S[2 * k11], S[2 * k11 + 1]); path.lineTo(S[2 * k01], S[2 * k01 + 1]); path.closePath();
      if (wantEdges) for (let e = 0; e < 4; e++) if (tg[e]) { const a = quadIdx[e], b = quadIdx[(e + 1) & 3]; (edges.B || (edges.B = [])).push(S[2 * a], S[2 * a + 1], S[2 * b], S[2 * b + 1]); }
      continue;
    }
    let poly = [];
    for (let e = 0; e < 4; e++) { const k = quadIdx[e]; const fv = new Array(nf); for (let f = 0; f < nf; f++) fv[f] = fields[f][k]; poly.push({ x: S[2 * k], y: S[2 * k + 1], f: fv, tag: tg[e] }); }
    for (let f = 0; f < nf && poly.length; f++) {
      const out = [], n = poly.length;
      for (let q = 0; q < n; q++) {
        const A = poly[q], B = poly[(q + 1) % n], ia = A.f[f] >= 0, ib = B.f[f] >= 0;
        if (ia) {
          out.push(A);
          if (!ib) { const t = A.f[f] / (A.f[f] - B.f[f]); out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, f: A.f.map((v, z) => v + (B.f[z] - v) * t), tag: f }); }
        } else if (ib) { const t = A.f[f] / (A.f[f] - B.f[f]); out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, f: A.f.map((v, z) => v + (B.f[z] - v) * t), tag: A.tag }); }
      }
      poly = out;
    }
    if (poly.length < 3) continue;
    path.moveTo(poly[0].x, poly[0].y); for (let q = 1; q < poly.length; q++) path.lineTo(poly[q].x, poly[q].y); path.closePath();
    if (wantEdges) for (let q = 0; q < poly.length; q++) { const A = poly[q]; if (A.tag == null) continue; const B = poly[(q + 1) % poly.length]; (edges[A.tag] || (edges[A.tag] = [])).push(A.x, A.y, B.x, B.y); }
  }
  return { path, edges };
}
function strokeEdges(ctx, segs, w, col, cap = 'round') {
  if (!segs || !segs.length) return;
  ctx.beginPath(); for (let i = 0; i < segs.length; i += 4) { ctx.moveTo(segs[i], segs[i + 1]); ctx.lineTo(segs[i + 2], segs[i + 3]); }
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke();
}
// per-vertex field arrays
function fieldFacing(G, sign = 1, bias = 0) { const a = new Float32Array(G.F.length); for (let k = 0; k < a.length; k++) a[k] = G.F[k] * sign + bias; return a; }
function fieldFn(G, fn) { const a = new Float32Array(G.F.length); for (let k = 0; k < a.length; k++) a[k] = fn(G.U[k], G.V[k], G.P[k], G.N[k], k); return a; }
function fieldLight(G, dir, th, sign = -1) { const a = new Float32Array(G.F.length); for (let k = 0; k < a.length; k++) a[k] = sign * (vDot(G.N[k], dir) - th); return a; }

/* ----------------------------------------------------------------------------------------------- draw a surface
   opt: { col (base hex), side: 'front'|'back'|'both', backCol, shade: threshold for N.L (default .12), shade2,
          masks:[fn(u,v,P,N)], maskInk:[bool per mask] (stroke mask borders), maskW, ink:true, inkW multiplier,
          hem:true (stroke grid borders), rim:true, gloss:{fn mask, col}, pattern: fn(ctx, G, regionPath),
          flat:true (no shading), extraTones:[{mask:fn, col}] regions painted with other colours (e.g. a stripe) } */
function drawSurf(ctx, G, opt) {
  const side = opt.side || 'front', s = gridScale(G), lw = lineW(s, opt.inkW || 1);
  const maskF = (opt.masks || []).map(fn => fieldFn(G, fn));
  const sides = side === 'both' ? ['back', 'front'] : [side];
  for (const sd of sides) {
    const sg = sd === 'front' ? 1 : -1, col = sd === 'front' ? opt.col : (opt.backCol || shadeHex(opt.col, -.35));
    const fac = fieldFacing(G, sg, opt.facingBias || 0), base = [fac, ...maskF];
    const reg = clipRegion(G, base, true, opt.borders);
    const T = Object.assign({}, tones(col)); if (opt.shadeCol) { T.shade = tones(opt.shadeCol).base; T.deep = shadeHex(T.shade, -.25); }
    ctx.fillStyle = T.base; ctx.fill(reg.path);
    // HAND2D shading: hand-placed cel shadow = the shape minus itself shifted toward the light (screen space).
    // No normal-based terminator -> no stray shadow lines across faces; hatching inside the shadow; weighted ink.
    if (!opt.flat && !LIGHT.override && (LIGHT.style === 'hand2d' || opt.handShade)) { drawSurfHand(ctx, G, opt, reg, T, sg, fac, s, lw); if (opt.onRegion) opt.onRegion(ctx, reg, sd, s); continue; }
    // shading (for the back side the 'normal' is flipped)
    if (!opt.flat && !LIGHT.override) {
      ctx.save(); ctx.clip(reg.path);
      const L = sg > 0 ? LIGHT.key : vMul(LIGHT.key, -1);
      const sh = clipRegion(G, [fac, fieldLight(G, L, opt.shade == null ? .12 : opt.shade)], false);
      ctx.fillStyle = T.shade; ctx.fill(sh.path);
      if (opt.shade2 != null) { const sh2 = clipRegion(G, [fac, fieldLight(G, L, opt.shade2)], false); ctx.fillStyle = T.deep; ctx.fill(sh2.path); }
      if (opt.extraTones) for (const et of opt.extraTones) { const em = fieldFn(G, et.mask); const r = clipRegion(G, [fac, em], false); ctx.fillStyle = tones(et.col).base; ctx.fill(r.path); const rs = clipRegion(G, [fac, em, fieldLight(G, L, opt.shade == null ? .12 : opt.shade)], false); ctx.fillStyle = tones(et.col).shade; ctx.fill(rs.path); }
      if (opt.gloss && sd === 'front') { const gm = clipRegion(G, [fac, fieldFn(G, opt.gloss.mask)], false); ctx.fillStyle = opt.gloss.col || T.hi; ctx.fill(gm.path); }
      // coloured effect lights
      for (const fl of LIGHT.fx) {
        const fa = fieldFn(G, (u, v, P, N) => { const d = vSub(fl.p, P), l = vLen(d); return vDot(N, vMul(d, sg / l)) * clamp(1 - l / fl.r, 0, 1) - .12; });
        const r = clipRegion(G, [fac, fa], false); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = fl.a == null ? .55 : fl.a; ctx.fillStyle = fl.col; ctx.fill(r.path); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      // rim light: thin band near silhouette on the rim-light side
      if (opt.rim !== false && LIGHT.rimAmt > 0 && sd === 'front') {
        const rw = opt.rimW || .09;
        const rf = fieldFn(G, (u, v, P, N, k) => Math.min(rw - G.F[k], vDot(N, LIGHT.rim) - .45));
        const r = clipRegion(G, [fac, rf], false); ctx.fillStyle = mixHex(T.base, LIGHT.rimCol, LIGHT.rimAmt); ctx.fill(r.path);
      }
      if (opt.pattern) opt.pattern(ctx, G, sg);
      ctx.restore();
    } else if (opt.pattern && !LIGHT.override) { ctx.save(); ctx.clip(reg.path); opt.pattern(ctx, G, sg); ctx.restore(); }
    if (opt.ink !== false) {
      const ic = LIGHT.override ? LIGHT.ink : (opt.inkCol || LIGHT.ink);
      strokeEdges(ctx, reg.edges[0], lw, ic);                                    // silhouette
      if (opt.hem !== false) strokeEdges(ctx, reg.edges.B, lw * .9, ic);         // open borders / hems
      if (opt.maskInk) opt.maskInk.forEach((on, i) => { if (on) strokeEdges(ctx, reg.edges[i + 1], lw * (opt.maskW || .75), ic); });
    }
    if (opt.onRegion) opt.onRegion(ctx, reg, sd, s);
  }
}

function surfBBox(G) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const S = G.S; for (let i = 0; i < S.length; i += 2) { const x = S[i], y = S[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
// screen direction of the key light at a point (unit 2D)
function lightDir2D(p, L = LIGHT.key) { const a = proj2(p), b = proj2(vAdd(p, vMul(L, .25))); let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); if (l < 1e-3) return [-.6, -.8]; return [dx / l, dy / l]; }
function drawSurfHand(ctx, G, opt, reg, T, sg, fac, s, lw) {
  const bb = surfBBox(G), bw = bb[2] - bb[0], bh = bb[3] - bb[1], size = Math.max(2, Math.min(bw, bh) * .55 + Math.max(bw, bh) * .08);
  const ctr = G.P[(G.NV >> 1) * G.NU + (G.NU >> 1)], L = sg > 0 ? LIGHT.key : vMul(LIGHT.key, -1), ld = lightDir2D(ctr, L);
  const d = size * (opt.h2d == null ? .22 : opt.h2d), dx = ld[0] * d, dy = ld[1] * d;
  const tonesX = (opt.extraTones || []).map(et => ({ path: clipRegion(G, [fac, fieldFn(G, et.mask)], false).path, T: tones(et.col) }));
  const paint = lit => { ctx.fillStyle = lit ? T.base : T.shade; ctx.fill(reg.path); for (const x of tonesX) { ctx.fillStyle = lit ? x.T.base : x.T.shade; ctx.fill(x.path); } };
  ctx.save(); ctx.clip(reg.path);
  paint(false);
  // hatching in the shadow (only survives where the lit overlay does not cover)
  if ((opt.hatch === true || (LIGHT.hatch && opt.hatch !== false)) && size > 14) { const step = clamp(size * .09, 3, 9); ctx.strokeStyle = rgba(T.deep || shadeHex(T.shade, -.3), .55); ctx.lineWidth = Math.max(.6, lw * .45); ctx.beginPath(); const L2 = bw + bh; for (let k = -L2; k < L2; k += step) { ctx.moveTo(bb[0] + k, bb[1]); ctx.lineTo(bb[0] + k + bh * .8, bb[3]); } ctx.stroke(); }
  ctx.save(); ctx.translate(dx, dy); ctx.clip(reg.path); ctx.translate(-dx, -dy); paint(true);
  if (opt.gloss && sg > 0) { const gm = clipRegion(G, [fac, fieldFn(G, opt.gloss.mask)], false); ctx.fillStyle = opt.gloss.col || T.hi; ctx.fill(gm.path); }
  ctx.restore();
  if (opt.hiCrescent) {
    ctx.save(); ctx.clip(reg.path); const m = new DOMMatrix().translate(-dx * .4, -dy * .4); const outside = new Path2D(); outside.rect(bb[0] - 50, bb[1] - 50, bw + 100, bh + 100); outside.addPath(reg.path, m); ctx.fillStyle = rgba(T.hi, opt.hiCrescent); ctx.fill(outside, 'evenodd'); ctx.restore(); }
  for (const fl of LIGHT.fx) { const fa = fieldFn(G, (u, v, P, N) => { const dd = vSub(fl.p, P), l = vLen(dd); return vDot(N, vMul(dd, sg / l)) * clamp(1 - l / fl.r, 0, 1) - .12; }); const r = clipRegion(G, [fac, fa], false); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = fl.a == null ? .55 : fl.a; ctx.fillStyle = fl.col; ctx.fill(r.path); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (opt.pattern) opt.pattern(ctx, G, sg);
  ctx.restore();
  if (opt.ink === false) return;
  const ic = opt.inkCol || LIGHT.ink, jit = LIGHT.boil ? LIGHT.boil : 0;
  ctx.save(); if (jit) ctx.translate((hash(LIGHT.drawIdx * 7 + bb[0]) - .5) * jit, (hash(LIGHT.drawIdx * 13 + bb[1]) - .5) * jit);
  strokeEdges(ctx, reg.edges[0], lw * .85, ic); if (opt.hem !== false) strokeEdges(ctx, reg.edges.B, lw * .8, ic);
  if (opt.maskInk) opt.maskInk.forEach((on, i) => { if (on) strokeEdges(ctx, reg.edges[i + 1], lw * (opt.maskW || .75) * .85, ic); });
  // heavier line on the shadow side (half plane away from the light)
  const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, R = bw + bh + 10; ctx.beginPath(); const px = -ld[1], py = ld[0];
  ctx.moveTo(cx + px * R, cy + py * R); ctx.lineTo(cx + px * R - ld[0] * R, cy + py * R - ld[1] * R); ctx.lineTo(cx - px * R - ld[0] * R, cy - py * R - ld[1] * R); ctx.lineTo(cx - px * R, cy - py * R); ctx.closePath(); ctx.clip();
  strokeEdges(ctx, reg.edges[0], lw * 1.7, ic); if (opt.hem !== false) strokeEdges(ctx, reg.edges.B, lw * 1.3, ic);
  ctx.restore();
}

/* ------------------------------------------------------------------------------------- surface-space helpers
   uvAffine(G, u, v): screen-space affine frame at surface point (for drawing decals / facial features / motifs)
   returns {x, y, ux, uy, vx, vy, facing} where (ux,uy) = screen delta per unit of du, (vx,vy) per unit dv.  */
function surfPoint(surf, u, v) { return surf.fn(u, v); }
function surfFrame(surf, u, v, e = .002) {
  const p = surf.fn(u, v), pu = surf.fn(u + e, v), pv = surf.fn(u, v + e);
  const du = vMul(vSub(pu, p), 1 / e), dv = vMul(vSub(pv, p), 1 / e);
  let n = vNorm(vCross(du, dv)); if (surf.flip) n = vMul(n, -1);
  return { p, du, dv, n };
}
// draw a decal in the tangent plane: draw(ctx) uses local coords in world units (x along tangent tu, y along -tv)
function decal(ctx, p, tu, tv, draw, minFacing = 0.02, n = null) {
  const cam = CAM.cur; const nn = n || vNorm(vCross(tu, tv));
  const fc = vDot(nn, vNorm(vSub(cam.pos, p))); if (fc < minFacing) return fc;
  const a = proj2(p), b = proj2(vAdd(p, tu)), c = proj2(vAdd(p, tv));
  ctx.save(); ctx.transform(b[0] - a[0], b[1] - a[1], c[0] - a[0], c[1] - a[1], a[0], a[1]); draw(ctx, fc); ctx.restore(); return fc;
}
// polyline on surface in (u,v) -> projected visible runs (split where facing < 0)
function surfLine(surf, uv, minF = 0) {
  const cam = CAM.cur, runs = []; let cur = null;
  for (const [u, v] of uv) {
    const fr = surfFrame(surf, u, v); const f = vDot(fr.n, vNorm(vSub(cam.pos, fr.p)));
    if (f > minF) { const s = proj2(fr.p); if (!cur) { cur = []; runs.push(cur); } cur.push(s); } else cur = null;
  }
  return runs;
}
function strokeRuns(ctx, runs, w, col, taper = null) {
  for (const r of runs) { if (r.length < 2) continue; if (taper) inkPts(ctx, r, w, col, taper); else { polyPath(ctx, r, false); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); } }
}

/* --------------------------------------------------------------------------------------------- primitive surfaces */
// ellipsoid / superellipsoid around frame M at centre c with radii r=[rx,ry,rz]; u = longitude (0 = +z front), v = 0 bottom..1 top
function sEllipsoid(c, M, r, ex = 1, nu = 20, nv = 14, deform) {
  return { nu, nv, wrapU: true, fn: (u, v) => {
    const th = u * TAU, ph = (v - .5) * Math.PI, cp = Math.cos(ph), sp = Math.sin(ph);
    const sx = Math.sin(th), cz = Math.cos(th);
    const pw = (x, e) => Math.sign(x) * Math.pow(Math.abs(x), e);
    let l = [r[0] * pw(cp, ex) * pw(sx, ex), r[1] * pw(sp, ex), r[2] * pw(cp, ex) * pw(cz, ex)];
    if (deform) l = deform(l, u, v);
    return vAdd(c, mApply(M, l));
  } };
}
/* generalized tube along a polyline of joints with radius profile and per-section frame.
   pts: [p0..pn] world; rad(v, ang) -> radius (v 0..1 along, ang around); hint: side vector for frames
   sag: optional fn(v, dirAroundWorld) -> offset vector added (sleeve drape)                               */
function sTube(pts, rad, hint, nu = 14, nv = 10, opts = {}) {
  // cumulative lengths
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + vDist(pts[i], pts[i - 1]));
  const tot = L[L.length - 1] || 1e-6;
  const at = v => { // smooth position + tangent along polyline (quadratic blend at interior joints)
    const d = v * tot; let i = 1; while (i < pts.length - 1 && L[i] < d) i++;
    const a = pts[i - 1], b = pts[i], t = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    let p = vLerp(a, b, t), tan = vNorm(vSub(b, a));
    // round the joint: blend toward next segment near the end
    const bl = opts.round == null ? .22 : opts.round;
    if (i < pts.length - 1 && t > 1 - bl) { const c = pts[i + 1], w = (t - (1 - bl)) / bl * .5; const t2 = vNorm(vSub(c, b)); tan = vNorm(vLerp(tan, t2, w)); const q = vLerp(b, vLerp(b, c, bl * vDist(a, b) / Math.max(1e-6, vDist(b, c))), w); p = vLerp(p, q, w * .9); }
    if (i > 1 && t < bl) { const z = pts[i - 2], w = (bl - t) / bl * .5; const t0 = vNorm(vSub(a, z)); tan = vNorm(vLerp(tan, t0, w)); }
    return [p, tan];
  };
  return { nu, nv, wrapU: true, flip: !!opts.flip, fn: (u, v) => {
    const [p, tan] = at(v), M = mFromY(tan, typeof hint === 'function' ? hint(v) : hint);
    const th = u * TAU, r = rad(v, th);
    let q = vAdd(p, vAdd(vMul(M[0], Math.sin(th) * r * (opts.sx || 1)), vMul(M[2], Math.cos(th) * r * (opts.sz || 1))));
    if (opts.sag) q = vAdd(q, opts.sag(v, th, M));
    return q;
  } };
}
// flat ribbon (scarf, sash, blade): spine points with width vectors
function sRibbon(spine, widthVec, nu = 2, nv = 12) {
  const n = spine.length;
  const at = (arr, v) => { const f = v * (n - 1), i = Math.min(n - 2, Math.floor(f)), t = f - i; return vLerp(arr[i], arr[i + 1], t); };
  return { nu, nv, fn: (u, v) => { const p = at(spine, v), w = at(widthVec, v); return vAdd(p, vMul(w, u - .5)); } };
}
// projected filled polygon from 3D points with ink (for blades, crisp hard props)
function fill3D(ctx, pts, col, inkW = 0, inkCol = LIGHT.ink) {
  const sp = projPoly(pts); if (sp.length < 3) return null; polyPath(ctx, sp); ctx.fillStyle = col; ctx.fill();
  if (inkW) { ctx.lineWidth = inkW; ctx.strokeStyle = inkCol; ctx.lineJoin = 'round'; ctx.stroke(); } return sp;
}
