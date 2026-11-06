/* engine/chars_00_common.js (E1) - shared helpers for the death-battle characters (loaded before chars_ds / chars_mha).
   torsoLines(S, D, T, uvPaths, col, w)   ink polylines in torso (u = angle/TAU from front toward the char's left, v 0 hip..1 neck)
   limbRing(c, a, b, f, r, col, w)        ring around a limb segment (a->b at fraction f, radius r): tattoos, straps, cuffs
   limbLine(c, a, b, side, r, col, w)     line along a limb on the side 'side' (unit vector)
   hipSheath(S, D, parts, opt, spec)      scabbard on the left hip when the sword is sheathed (+ hilt)
   stuckHand(c, S, anchor, frame, opt)    a disembodied hand pinned to the body (Shigaraki), frame = [X (finger dir), Y, N (palm normal)]
   woundParts(S, D, parts, opt, k)        battle damage overlay: blood streaks / cuts on face and body (D.wounds = 0..3)
   cowlArcs(S, D, F, t, parts, opt, o)    crackling lightning arcs that hug the limbs (One For All Full Cowl / any aura)  */
'use strict';
Object.assign(HAND_SHAPES, { spread: { curl: [.22, .18, .22, .28], spread: .42, thumb: .05 }, hook: { curl: [.5, .45, .5, .55], spread: .35, thumb: .2, tip: .4 }, chop: { curl: [0, 0, 0, .05], spread: .02, thumb: .35 } });
function torsoLines(c, S, D, uvPaths, col, w = 1, off = .004) {
  const T = torsoModel(S, D, off * S.B.h / 1.8); const s = pxScale(S.J.abd), lw = lineW(s, w);
  for (const path of uvPaths) { const uv = []; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1]; for (let k = 0; k < 5; k++) { const t = k / 5; uv.push([((lerp(a[0], b[0], t)) % 1 + 1) % 1, lerp(a[1], b[1], t)]); } } uv.push([((path[path.length - 1][0]) % 1 + 1) % 1, path[path.length - 1][1]]);
    strokeRuns(c, surfLine(T.surf, uv, .02), lw, col, [.2, .2]); }
}
function limbRing(c, a, b, f, r, col, w = 1) {
  const ctr = vLerp(a, b, f), ax = vNorm(vSub(b, a)); let u = vNorm(vCross(ax, [0, 1, 0])); if (vLen(vCross(ax, [0, 1, 0])) < .1) u = vNorm(vCross(ax, [1, 0, 0])); const v = vCross(ax, u);
  const runs = []; let cur = null;
  for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU, d = vAdd(vMul(u, Math.cos(an)), vMul(v, Math.sin(an))), p = vMad(ctr, d, r); if (vDot(d, toCam(p)) > 0) { if (!cur) { cur = []; runs.push(cur); } cur.push(proj2(p)); } else cur = null; }
  strokeRuns(c, runs, lineW(pxScale(ctr), w), col);
}
function limbLine(c, a, b, side, r, col, w = 1, f0 = 0, f1 = 1) {
  const pts = []; for (let i = 0; i <= 8; i++) { const p = vMad(vLerp(a, b, lerp(f0, f1, i / 8)), side, r); if (vDot(side, toCam(p)) > -.05) pts.push(proj2(p)); }
  if (pts.length > 1) inkPts(c, pts, lineW(pxScale(a), w), col, [.2, .2]);
}
function hipSheath(S, D, parts, opt, spec = {}) {
  const p = S.pose; if (p.sword && !p.sword.sheathed) { if (spec.always) {} else { /* drawn sword: empty scabbard stays */ } }
  const k = S.B.h / 1.8, M = S.M.pelvis, drawn = p.sword && !p.sword.sheathed;
  const a = vAdd(S.J.pelvis, mApply(M, [.19 * k, .05 * k, .12 * k])), b = vAdd(S.J.pelvis, mApply(M, [.25 * k, -.5 * k, -.42 * k]));
  parts.push({ z: camDepth(vLerp(a, b, .4)) - .04, fn: c => {
    const surf = sTube([a, b], v => (spec.r || .022) * k, M[1], 8, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: spec.col || '#1e1a22', shade: .1 }, opt.surf || {}));
    if (!drawn) { const dir = vNorm(vSub(a, b)), g0 = vMad(a, dir, .01 * k), h1 = vMad(a, dir, (spec.handle || .26) * k), s = pxScale(a);
      const gp = []; for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, rr = (spec.tsubaR || .045) * k * (spec.flameGuard ? (1 + .35 * Math.max(0, Math.sin(an * 5))) : 1); const u = vNorm(vCross(dir, [0, 1, 0])), w2 = vCross(dir, u); gp.push(vAdd(g0, vAdd(vMul(u, Math.cos(an) * rr), vMul(w2, Math.sin(an) * rr)))); }
      fill3D(c, gp, opt.mode === 'flat' ? opt.col : tones(spec.tsubaCol || '#c8a24a').base, opt.mode === 'flat' ? 0 : lineW(s, .6));
      ctx2line(c, proj2(g0), proj2(h1), .03 * k * s, opt.mode === 'flat' ? opt.col : tones(spec.hiltCol || '#e8e0d0').base, lineW(s, .6)); }
  } });
}
// a disembodied hand pinned to the body. frame: X = finger direction, N = palm normal (pointing INTO the body)
function stuckHand(c, S, anchor, X, N, opt, o = {}) {
  const Xn = vNorm(X), Nn = vNorm(N), Z = vNorm(vCross(Xn, Nn)); const side = o.side || 'R', sg = side === 'L' ? 1 : -1;
  // handGeom: palm normal np = M[0] * -sg; fingers along -Y; Z = M[2]
  const M = [vMul(Nn, -sg * -1 * -1), vMul(Xn, -1), Z]; // M[0]*(-sg) = np -> M[0] = np * -sg
  M[0] = vMul(Nn, -sg);
  const fakeS = { J: { ['wr' + side]: anchor }, M: { ['hand' + side]: M }, B: { hand: (o.size || 1) * S.B.hand, h: S.B.h }, pose: {} };
  drawHand(c, fakeS, { skin: o.col || '#a9b5c6', skinShade: o.shade || '#6a7690', nailCol: o.nail || '#d8dce4' }, side, o.shape || 'claw', opt);
  if (o.box && opt.mode !== 'flat') { const p = project(anchor); if (p) { const r = .018 * S.B.h / 1.8 * p.s; c.fillStyle = '#c8a040'; c.fillRect(p.x - r, p.y - r * .6, r * 2, r * 1.2); c.lineWidth = lineW(p.s, .5); c.strokeStyle = LIGHT.ink; c.strokeRect(p.x - r, p.y - r * .6, r * 2, r * 1.2); } }
}
// battle damage: D.wounds 0..3 (or pose.wounds) -> blood on face, torn cuts on torso/limbs, anime style (dark red with ink edge)
function woundParts(S, D, parts, opt, k) {
  if (!k || opt.mode === 'flat' || LIGHT.override) return;
  const HM = headModel(S, D), zc = camDepth(HM.c), sc = S.B.h / 1.8;
  const faceK = S.pose.woundsFace != null ? S.pose.woundsFace : (D.woundsFace != null ? D.woundsFace : 1);
  if (faceK) parts.push({ z: zc - .0035, fn: c => { // temple blood trickle (narrow, beside the eye - never across the nose) + mouth corner
    const fr = faceFrame(HM, .78, .32, .35, .42); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = '#9a0e18'; cc.beginPath(); cc.moveTo(-.25, .45); cc.quadraticCurveTo(-.05, .2, -.1, -.6 - .3 * k); cc.quadraticCurveTo(-.02, -.75 - .3 * k, .05, -.6 - .3 * k); cc.quadraticCurveTo(.12, .1, .2, .45); cc.closePath(); cc.fill(); cc.lineWidth = .03; cc.strokeStyle = '#3a0408'; cc.stroke(); }, .05, fr.n);
    if (k > 1) { const f2 = faceFrame(HM, -.18, -.82, .5, .5); decal(c, f2.p, f2.tu, f2.tv, cc => { cc.fillStyle = '#9a0e18'; cc.beginPath(); cc.moveTo(-.1, .1); cc.quadraticCurveTo(-.2, -.4, -.12, -.9); cc.quadraticCurveTo(-.05, -.4, .02, .1); cc.fill(); }, .05, f2.n); }
    if (k > 2) { const f3 = faceFrame(HM, -.55, -.1, .4, .45); decal(c, f3.p, vMul(f3.tu, -1), f3.tv, cc => { cc.strokeStyle = '#7a0a12'; cc.lineWidth = .1; cc.beginPath(); cc.moveTo(-.4, .5); cc.lineTo(.3, -.4); cc.stroke(); }, .05, f3.n); }
  } });
  parts.push({ z: camDepth(vLerp(S.J.pelvis, S.J.neck, .5)) - .085, fn: c => { // diagonal cuts across the torso
    const cuts = [[[.08, .78], [.3, .5]], [[-.15, .65], [.05, .35]], [[.45, .7], [.2, .25]]].slice(0, k);
    for (const [a, b] of cuts) { torsoLines(c, S, D, [[a, b]], '#6a0810', 3.2, .03); torsoLines(c, S, D, [[a, b]], '#c8202a', 1.4, .032); }
  } });
}
/* jagged lightning arcs hugging the limbs: o = {col, core, n, amp, len, seed, glow} */
function cowlArcs(S, D, F, t, parts, opt, o = {}) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8, J = S.J, fr = Math.floor(t * 24 / (o.timing || 2));
  const segs = [['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'], ['hipL', 'knL'], ['knL', 'anL'], ['hipR', 'knR'], ['knR', 'anR'], ['pelvis', 'neck'], ['neck', 'head']];
  const n = o.n || 14, col = o.col || '#5dff8a', core = o.core || '#f4fff0';
  for (let i = 0; i < n; i++) {
    const h = hash(fr * 31 + i * 7 + (o.seed || 0)); if (h < (o.skip == null ? .25 : o.skip)) continue;
    const sg = segs[Math.floor(hash(fr * 13 + i * 3) * segs.length)], a = J[sg[0]], b = J[sg[1]], f0 = hash(i * 5 + fr), f1 = clamp(f0 + .3 + hash(i + fr * 2) * .5, 0, 1.15);
    const pts = []; const m = 6; const rad = (sg[0] === 'pelvis' ? .2 : sg[0] === 'neck' ? .12 : .08) * k * (o.spread || 1);
    for (let j = 0; j <= m; j++) { const u = lerp(f0, f1, j / m), base = vLerp(a, b, u); const an = hash(i * 11 + j * 3 + fr * 7) * TAU; pts.push(vAdd(base, [Math.cos(an) * rad, (hash(j * 9 + i + fr) - .5) * rad, Math.sin(an) * rad])); }
    parts.push({ z: camDepth(pts[3]) + (hash(i + fr * 5) < .5 ? -.25 : .25), fn: c => { const sp = pts.map(p => proj2(p)), s = pxScale(pts[3]); c.save(); c.lineJoin = 'miter'; c.lineCap = 'round'; polyPath(c, sp, false); c.globalCompositeOperation = 'source-over';
      c.lineWidth = clamp(.016 * s * (o.w || 1), 2, 7); c.strokeStyle = col; c.stroke(); c.lineWidth = clamp(.006 * s * (o.w || 1), 1, 2.6); c.strokeStyle = core; c.stroke();
      if (j3(i, fr)) { const q = sp[Math.floor(sp.length / 2)]; c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + (hash(i + fr) - .5) * .12 * s, q[1] + (hash(i * 2 + fr) - .5) * .12 * s); c.lineWidth = clamp(.006 * s, 1, 2.6); c.strokeStyle = col; c.stroke(); }
      c.restore(); } });
  }
}
function j3(i, fr) { return hash(i * 17 + fr * 3) < .5; }
