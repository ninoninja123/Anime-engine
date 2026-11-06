/* engine/fx_hy_s2.js (shot writer S2, hulk-vs-yujiro part 2): extra effects.  t = the effect's own time.
   fxInkSwirl(g, p, t, {r, dur, n})        ink spiral lines winding round point p (Xiaoli / palm redirect)
   fxRags(g, p, t, {n, dur})               torn black cloth flying off a point
   fxShirt(g, a, b, t, {dur})              a torn black shirt flying from a to b and settling over the target
   fxDress(g, c, t, {r, h, dur, k})        the 'dress': flared wind rings round a spinning fighter
   fxHangDust(g, c, t, {r, n})             frozen dust motes hanging in the air (stopped quake)
   fxFistFlash(g, p, t)                    quick white flash star at a fist                                                      */
'use strict';
function fxInkSwirl(g, p, t, o = {}) {
  const dur = o.dur || .9, u = t / dur; if (u < 0 || u > 1) return; const R = o.r || 1.4, n = o.n || 3, a = easeOut(Math.min(1, u * 1.6)), fade = 1 - U_(u, .55, 1);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let k = 0; k < n; k++) {
    const pts = [], off = k / n * TAU, cnt = 40;
    for (let i = 0; i <= cnt * a; i++) { const v = i / cnt, ang = off + v * TAU * 1.7 + t * 5, rr = R * (.25 + .9 * v), y = (v - .5) * R * .9; const q = project([p[0] + Math.cos(ang) * rr, p[1] + y, p[2] + Math.sin(ang) * rr]); if (q) pts.push([q.x, q.y, q.s]); }
    if (pts.length < 3) continue;
    for (let i = 1; i < pts.length; i++) { const w = (6 + 22 * (i / pts.length)) * (pts[i][2] / 200) * (1 - (i / pts.length) * .3); g.globalAlpha = .9 * fade; g.strokeStyle = k % 2 ? '#0b0b0b' : '#1c1c1c'; g.lineWidth = Math.max(2, w); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
  }
  g.restore();
}
function U_(x, a, b) { return Math.max(0, Math.min(1, (x - a) / (b - a))); }
function fxRags(g, p, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0 || t > dur) return; const n = o.n || 14, seed = o.seed || 21;
  g.save(); g.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const a = hash(seed + i) * TAU, sp = 1.2 + 3.5 * hash(seed + i * 3), vy = 1.5 + 3 * hash(seed + i * 5), tt = t, x = p[0] + Math.cos(a) * sp * tt * .8, z = p[2] + Math.sin(a) * sp * tt * .8, y = p[1] + vy * tt - 4.9 * tt * tt * .5;
    if (y < .02) continue; const q = project([x, y, z]); if (!q) continue; const s = (.07 + .11 * hash(seed + i * 7)) * q.s, rot = tt * (3 + 6 * hash(seed + i * 9)) + i;
    g.save(); g.translate(q.x, q.y); g.rotate(rot); g.globalAlpha = 1 - U_(t, dur * .7, dur); g.fillStyle = hash(seed + i * 11) > .4 ? '#14131a' : '#2a1a22'; g.strokeStyle = '#000'; g.lineWidth = Math.max(1, s * .12);
    g.beginPath(); g.moveTo(-s, -s * .3); g.lineTo(s * .2, -s * .8); g.lineTo(s, 0); g.lineTo(s * .3, s * .7); g.lineTo(-s * .6, s * .5); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  g.restore();
}
function fxShirt(g, a, b, t, o = {}) {
  const dur = o.dur || .8, u = t / dur; if (u < 0) return; const k = Math.min(1, u), arcH = o.arc || 1.3;
  const pos = [lerp(a[0], b[0], easeInOut(k)), lerp(a[1], b[1], k) + Math.sin(k * Math.PI) * arcH, lerp(a[2], b[2], easeInOut(k))], q = project(pos); if (!q) return;
  const s = (o.size || .55) * q.s, spread = .45 + .55 * easeOut(k), rot = (1 - k) * 4.5 + .2;
  g.save(); g.translate(q.x, q.y); g.rotate(rot); g.lineJoin = 'round'; g.lineWidth = Math.max(2, s * .05); g.strokeStyle = '#000'; g.fillStyle = '#16151a';
  g.beginPath(); g.moveTo(-s * .5 * spread, -s * .4); g.quadraticCurveTo(-s * .25, -s * .55, 0, -s * .4); g.quadraticCurveTo(s * .25, -s * .55, s * .5 * spread, -s * .4);
  g.lineTo(s * (.5 + .5 * spread), -s * .15); g.lineTo(s * .55 * spread, s * .02); g.lineTo(s * .38 * spread, s * .0); g.lineTo(s * .4 * spread, s * .5); g.quadraticCurveTo(0, s * .62, -s * .4 * spread, s * .5);
  g.lineTo(-s * .38 * spread, s * .0); g.lineTo(-s * .55 * spread, s * .02); g.lineTo(-s * (.5 + .5 * spread), -s * .15); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(120,120,140,.5)'; g.lineWidth = Math.max(1, s * .02); g.beginPath(); g.moveTo(-s * .2, -s * .3); g.quadraticCurveTo(-s * .1, 0, -s * .25, s * .35); g.moveTo(s * .2, -s * .3); g.quadraticCurveTo(s * .12, .1 * s, s * .26, s * .38); g.stroke();
  g.restore();
}
function fxDress(g, c, t, o = {}) {
  const dur = o.dur || 1.0, k = (o.k == null ? 1 : o.k) * (1 - U_(t, dur * .75, dur)), R = o.r || 2.4, h = o.h || 2.2; if (t < 0 || k <= 0) return;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const v = i / 8, y = h * (1 - v) * .95 + .05, r = R * (.35 + .75 * v) * (1 + .05 * Math.sin(t * 7 + i)), n = 28, ph = t * (7 + i * .6) + i;
    const pts = []; for (let j = 0; j <= n; j++) { const a = ph + j / n * TAU * .85, q = project([c[0] + Math.cos(a) * r, c[1] + y + Math.sin(a * 2 + i) * .06, c[2] + Math.sin(a) * r]); if (q) pts.push([q.x, q.y, q.s]); }
    if (pts.length < 4) continue; g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.lineWidth = Math.max(2, (9 - v * 5) * pts[0][2] / 200); g.strokeStyle = rgba(i % 2 ? '#ffffff' : '#bcd4e8', .5 * k); g.stroke();
  }
  g.restore();
}
function fxHangDust(g, c, t, o = {}) {
  const n = o.n || 40, R = o.r || 9, seed = o.seed || 5; g.save();
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = R * Math.sqrt(hash(seed + i * 3)), y = .3 + (o.h || 5) * hash(seed + i * 7), q = project([c[0] + Math.cos(a) * d + Math.sin(t * .4 + i) * .04, y + Math.sin(t * .5 + i * 2) * .03, c[2] + Math.sin(a) * d]); if (!q) continue;
    const s = (.03 + .08 * hash(seed + i * 9)) * q.s; g.globalAlpha = .3 + .4 * hash(seed + i * 11); g.fillStyle = hash(i) > .5 ? '#d8c6a8' : '#8a7a68'; g.beginPath(); g.ellipse(q.x, q.y, s * 1.4, s, 0, 0, TAU); g.fill(); }
  g.restore();
}
function fxFistFlash(g, p, t, o = {}) { const u = t / (o.dur || .18); if (u < 0 || u > 1) return; const q = project(p); if (!q) return; g.save(); g.globalCompositeOperation = 'lighter'; const r = (o.r || .9) * q.s * (.4 + .8 * easeOut(u)); glow(g, q.x, q.y, r, o.col || '#ffffff', 1 - u); g.restore(); }
