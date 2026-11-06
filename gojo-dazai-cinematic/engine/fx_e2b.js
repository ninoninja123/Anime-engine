/* engine/fx_e2b.js (E2) - helpers for showdown/part3.js (showdown part 3: volcano showpiece + Fire Force arc).
   fxLavaWall(g, c, t, {r, h, dur})        ring of molten lava walls rising around c (Crushing Type shock waves)
   fxSnowPin2D(g, x, y, r, a)               Koyuki's snowflake hairpin (6 points, pink/white) - screen space insert
   fxLongShadow(g, F, ft, light, {len, a})  long cast shadow of a figure on the ground away from a light point
   fxDevilGrin(g, x, y, s, a)               shadow figure with a wide white grin (cameo silhouette, 2-3 frames)
   fxPalmRings(g, F, ft, t, {col})          two blue rings spinning on the palms (Annihilation Type stance)
   splitView(g, cam2, drawFn, {side, bg})   render a second camera into one half of the frame (split screen)
   fxRollingHat(g, c, t, {roll})            Shunsui's straw hat rolling on the ground
   fxCharring(g, F, ft, {amt, from})        charred half body (dark burn mask + embers) for a dying figure
   fxJokerCardHand(g, F, ft, t, {lit})      the black 53rd card spinning between the fingers of the right hand
   fxThreads(g, a, list, t, {col})          red threads sewing from a point to targets (Kannonbiraki Benihime Aratame)     */
'use strict';
function fxLavaWall(g, c, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0) return; const R = o.r || 5, Hh = (o.h || 4) * easeOut(clamp(t / .35, 0, 1)) * (1 - clamp((t - dur) / .6, 0, 1)); if (Hh <= .05) return;
  const n = 30, segs = []; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, h0 = Hh * (.7 + .5 * hash(i * 3 + 1)), h1 = Hh * (.7 + .5 * hash(((i + 1) % n) * 3 + 1));
    const q = [[c[0] + Math.cos(a0) * R, 0, c[2] + Math.sin(a0) * R], [c[0] + Math.cos(a1) * R, 0, c[2] + Math.sin(a1) * R], [c[0] + Math.cos(a1) * R * .96, h1, c[2] + Math.sin(a1) * R * .96], [c[0] + Math.cos(a0) * R * .96, h0, c[2] + Math.sin(a0) * R * .96]]; segs.push({ q, z: camDepth(vLerp(q[0], q[2], .5)), i }); }
  segs.sort((a, b) => b.z - a.z);
  for (const s of segs) { const sp = projPoly(s.q); if (sp.length < 3) continue; const ys = sp.map(p => p[1]); polyPath(g, sp); const gr = g.createLinearGradient(0, Math.max(...ys), 0, Math.min(...ys)); gr.addColorStop(0, '#2a0a08'); gr.addColorStop(.35, '#e0401a'); gr.addColorStop(.8, '#ffb040'); gr.addColorStop(1, '#fff0b0'); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = '#1a0606'; g.stroke(); }
  fxE2Flames(g, segs.filter(s => s.i % 2 === 0).map(s => ({ p: vLerp(s.q[3], s.q[2], .5), r: .45 })), t, { pal: { ink: '#3a0806', outer: '#e0401a', mid: '#ffb040', core: '#fff0b0' }, n: 1, seed: 601 });
}
function fxSnowPin2D(g, x, y, r, a = 1, rot = 0) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.lineCap = 'round';
  for (const [w, col] of [[r * .32, '#5a1a3a'], [r * .2, '#ffd0e4'], [r * .08, '#ffffff']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU; g.moveTo(0, 0); g.lineTo(Math.cos(an) * r, Math.sin(an) * r); const bx = Math.cos(an) * r * .6, by = Math.sin(an) * r * .6; for (const s of [-1, 1]) { g.moveTo(bx, by); g.lineTo(bx + Math.cos(an + s * .7) * r * .3, by + Math.sin(an + s * .7) * r * .3); } } g.stroke(); }
  g.fillStyle = '#ff8ab8'; g.beginPath(); g.arc(0, 0, r * .18, 0, TAU); g.fill(); g.restore();
}
function fxLongShadow(g, F, ft, light, o = {}) {
  const S = figSkel(F, ft), base = vLerp(S.J.anL, S.J.anR, .5), d = vSub([base[0], 0, base[2]], [light[0], 0, light[2]]), dl = vLen(d) || 1, dir = vMul(d, 1 / dl), side = vNorm(vCross(dir, [0, 1, 0]));
  const L = o.len || 12, w = (o.w || .35) * S.B.h / 1.8, pts = [];
  const prof = [[0, 1], [.12, 1.2], [.6, .9], [.8, 1.15], [.88, .7], [.95, .55], [1, .0]];
  for (const [u, k] of prof) pts.push(vAdd(vMad(base, dir, L * u), vMul(side, w * k)));
  for (let i = prof.length - 1; i >= 0; i--) { const [u, k] = prof[i]; pts.push(vAdd(vMad(base, dir, L * u), vMul(side, -w * k))); }
  const sp = projPoly(pts.map(p => [p[0], .006, p[2]])); if (sp.length < 3) return; g.save(); g.globalAlpha = o.a == null ? .85 : o.a; polyPath(g, catmull(sp, true, 2)); g.fillStyle = o.col || '#0a0608'; g.fill(); g.restore();
}
function fxDevilGrin(g, x, y, s, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(x, y - s * .55, s * .32, s * .38, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - s * .6, y + s); g.quadraticCurveTo(x - s * .55, y - s * .15, x, y - s * .2); g.quadraticCurveTo(x + s * .55, y - s * .15, x + s * .6, y + s); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - s * .24, y - s * .55); g.quadraticCurveTo(x, y - s * .28, x + s * .24, y - s * .55); g.quadraticCurveTo(x, y - s * .38, x - s * .24, y - s * .55); g.fill();
  g.strokeStyle = '#000'; g.lineWidth = Math.max(1, s * .012); for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(x + i * s * .045, y - s * .52 + Math.abs(i) * s * .004); g.lineTo(x + i * s * .045, y - s * .43 - (4 - Math.abs(i)) * s * .012); g.stroke(); }
  g.fillStyle = '#fff'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(x + sx * s * .12, y - s * .7, s * .05, s * .025, sx * .4, 0, TAU); g.fill(); } g.restore();
}
function fxPalmRings(g, F, ft, t, o = {}) {
  const S = figSkel(F, ft); for (const sd of ['L', 'R']) { const hg = handGeom(S, sd, S.pose['h' + sd] || 'open'); if (!hg) continue; const c = vMad(hg.palmC, hg.np, .03), n = hg.np, a = vNorm(vCross(n, [0, 1, 0])), b = vCross(n, a);
    const pts = []; for (let i = 0; i <= 32; i++) { const an = i / 32 * TAU + t * 6; pts.push(vAdd(c, vAdd(vMul(a, Math.cos(an) * .09), vMul(b, Math.sin(an) * .09)))); }
    g.save(); g.globalCompositeOperation = 'lighter'; for (const run of projLine(pts)) { polyPath(g, run, false); g.strokeStyle = rgba(o.col || '#4ab8ff', .5); g.lineWidth = 9; g.stroke(); g.strokeStyle = '#e8f8ff'; g.lineWidth = 2.5; g.stroke(); } g.restore(); }
}
// render a second camera into a half of the frame. drawFn(g) draws with CAM = cam2. side 'R' | 'L'; slant = diagonal split
function splitView(g, cam2, drawFn, o = {}) {
  const prev = CAM.cur; g.save(); g.beginPath(); const s = o.slant == null ? 120 : o.slant;
  if ((o.side || 'R') === 'R') { g.moveTo(W / 2 + s, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(W / 2 - s, H); } else { g.moveTo(0, 0); g.lineTo(W / 2 + s, 0); g.lineTo(W / 2 - s, H); g.lineTo(0, H); }
  g.closePath(); g.clip(); if (o.bg) { if (typeof o.bg === 'function') o.bg(g); else { g.fillStyle = o.bg; g.fillRect(0, 0, W, H); } }
  CAM.set(cam2); try { drawFn(g); } finally { CAM.cur = prev; g.restore(); }
  g.save(); g.strokeStyle = o.line || '#000'; g.lineWidth = o.lineW || 10; g.beginPath(); g.moveTo(W / 2 + s, 0); g.lineTo(W / 2 - s, H); g.stroke(); g.restore();
}
function fxRollingHat(g, c, t, o = {}) {
  const roll = o.roll == null ? t * 6 : o.roll, r = .124, M = mMul(mRotY(o.yaw || 0), mRotZ(roll)), HM = { r, M, c, toW: l => vAdd(c, mApply(M, vMul(l, r))) };
  drawSugegasa(g, HM, {});
}
function fxCharring(g, F, ft, o = {}) {
  const S = figSkel(F, ft), amt = o.amt == null ? 1 : o.amt; const js = (o.joints || ['shL', 'elL', 'handL', 'abd', 'pelvis', 'knL', 'anL']);
  g.save(); g.globalCompositeOperation = 'multiply'; for (const j of js) { const q = P2(S.J[j]); if (!q) continue; const r = .2 * q.s * amt; g.fillStyle = radial(g, q.x, q.y, r, [[0, 'rgba(40,20,30,.95)'], [.6, 'rgba(60,30,40,.7)'], [1, 'rgba(90,60,70,0)']]); g.fillRect(q.x - r, q.y - r, 2 * r, 2 * r); } g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; for (const j of js) { const q = P2(S.J[j]); if (!q) continue; for (let i = 0; i < 6; i++) { const a = hash(i + j.length * 7) * TAU, d = q.s * .12 * hash(i * 3 + 1); g.fillStyle = rgba(i % 2 ? '#ff6a2a' : '#c84aff', .7); g.fillRect(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, 2, 2); } } g.restore();
}
function fxJokerCardHand(g, F, ft, t, o = {}) {
  const S = figSkel(F, ft), hg = handGeom(S, o.side || 'R', S.pose['h' + (o.side || 'R')] || 'sign'); if (!hg) return; const p = vMad(vLerp(hg.fingers[1][2], hg.fingers[4][2], .5), hg.np, .01);
  const k = S.B.h / 1.8, spin = t * (o.spin || 3), d = vNorm(vAdd(vMul(hg.Y, -Math.cos(spin * .2)), vMul(hg.Z, Math.sin(spin * .2)))), side = vNorm(mApply(mAxis(d, spin), hg.np));
  const sz = .06 * k, A = vMad(vMad(p, d, sz * .7), side, -sz * .5), B = vMad(vMad(p, d, sz * .7), side, sz * .5), C = vMad(vMad(p, d, -sz * .7), side, sz * .5), D2 = vMad(vMad(p, d, -sz * .7), side, -sz * .5);
  const sp = projPoly([A, B, C, D2]); if (sp.length < 3) return; if (o.lit) e2GlowAt(g, p, .12, '#b04aff', .5 * o.lit);
  polyPath(g, sp); g.fillStyle = '#0e0a14'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#c84aff'; g.stroke(); const q = P2(p); if (q && sz * q.s > 8) { g.fillStyle = '#e0c8ff'; g.font = `900 ${sz * q.s * .9}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('J', q.x, q.y); }
}
function fxThreads(g, a, list, t, o = {}) {
  const u = easeOut(clamp(t / (o.dur || .4), 0, 1)), pa = P2(a); if (!pa) return; g.save(); g.lineCap = 'round';
  list.forEach((b, i) => { const pb = P2(b); if (!pb) return; const k = clamp(u * 1.2 - i * .04, 0, 1); const x = lerp(pa.x, pb.x, k), y = lerp(pa.y, pb.y, k) + Math.sin(k * Math.PI) * 30 * (hash(i) - .5);
    g.strokeStyle = o.col || '#ff2a3a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(pa.x, pa.y); g.quadraticCurveTo((pa.x + x) / 2 + (hash(i * 3) - .5) * 60, (pa.y + y) / 2 - 40, x, y); g.stroke(); g.fillStyle = '#ffd0d8'; g.fillRect(x - 2, y - 2, 4, 4); }); g.restore();
}
