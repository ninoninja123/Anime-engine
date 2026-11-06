/* engine/fx_blood.js (E1) - stylised anime blood and death effects (graphic but not realistic gore: flat crimson shapes with
   dark ink edges, white highlights, red-black silhouettes).  World points unless noted.
   fxBloodSpray(g, p, dir, t, {n, speed, size, spread, col})  ballistic droplets + a ribbon arc, falling with gravity
   fxBloodArc(g, a, b, t, {w})                                 a single sweeping ribbon of blood following a cut (a -> b)
   fxBloodSplat(g, c, t, {r, n, seed})                         splatter decal growing on the ground
   fxBloodMist(g, p, t, {r})                                   fine red mist burst (impact)
   fxBloodDrip(g, p, t, {n, len})                              drops falling from a wound / blade
   fxCutFlash(g, a, b, t, {col})                               bright cut line that splits open into a red gash (screen/world)
   fxSplitFig(g, F, ft, t, {ang, gap, spin, dur})              a figure TORN in two along a cut line (halves slide apart, blood)
   fxDisintegrate(g, F, ft, t, {dur, col, from})               a figure crumbling to ash/dust from a joint (demon death / decay)
   fxSilhouetteDeath(g, F, ft, t, {col, bg})                   flat black silhouette of the figure on a red field (death frame)
   Death poses: POSES.death_* (poses_core.js).                                                                            */
'use strict';
const BLOOD = { col: '#b0101e', dark: '#4a0208', hi: '#ff6a6a' };
function bloodDrop(g, x, y, vx, vy, r, col = BLOOD.col, ink = BLOOD.dark) {
  const sp = Math.hypot(vx, vy) || 1, ang = Math.atan2(vy, vx), str = clamp(sp / 400, 1, 3.2);
  g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(r * 1.1, 0); g.quadraticCurveTo(r * .9, r, -r * str, 0); g.quadraticCurveTo(r * .9, -r, r * 1.1, 0); g.closePath();
  g.fillStyle = col; g.fill(); g.lineWidth = Math.max(.8, r * .22); g.strokeStyle = ink; g.stroke(); if (r > 3) { g.fillStyle = BLOOD.hi; g.beginPath(); g.ellipse(r * .35, -r * .25, r * .28, r * .16, 0, 0, TAU); g.fill(); } g.restore();
}
function fxBloodSpray(g, p, dir, t, o = {}) {
  const n = o.n || 40, dur = o.dur || 1.2; if (t < 0 || t > dur) return; const d = vNorm(dir), sp0 = o.speed || 6, seed = o.seed || 3, gr = 9.8; let side = vNorm(vCross(d, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, d);
  for (let i = 0; i < n; i++) { const t0 = hash(seed + i * 3) * .12, tt = t - t0; if (tt < 0) continue; const sp = sp0 * (.35 + hash(seed + i * 5) * .9), spr = o.spread || .55;
    const v = vAdd(vMul(d, sp), vAdd(vMul(side, (hash(seed + i * 7) - .5) * 2 * spr * sp), vMul(up, (hash(seed + i * 11) - .5) * 2 * spr * sp)));
    const pos = [p[0] + v[0] * tt, p[1] + v[1] * tt - .5 * gr * tt * tt, p[2] + v[2] * tt]; if (pos[1] < 0) continue;
    const q = project(pos), q2 = project([pos[0] + v[0] * .02, pos[1] + (v[1] - gr * tt) * .02, pos[2] + v[2] * .02]); if (!q || !q2) continue;
    const r = (o.size || .045) * (.4 + hash(seed + i * 13)) * q.s * (1 - tt / dur * .4); if (r < .6) continue; bloodDrop(g, q.x, q.y, (q2.x - q.x) * 50, (q2.y - q.y) * 50, r, o.col); }
  if (t < .35 && o.ribbon !== false) { // initial gush ribbon
    const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10 * Math.min(1, t / .2), tt = s * .25; pts.push([p[0] + d[0] * sp0 * tt, p[1] + d[1] * sp0 * tt - .5 * gr * tt * tt, p[2] + d[2] * sp0 * tt]); }
    const sp2 = pts.map(q => proj2(q)), s0 = pxScale(p), ws = sp2.map((_, i) => (o.size || .045) * 2.2 * s0 * Math.sin(Math.PI * (i / 10 * .9 + .05)) * (1 - t / .35));
    const rb = ribbon2D(sp2, ws); polyPath(g, catmull(rb, true, 2)); g.fillStyle = o.col || BLOOD.col; g.fill(); g.lineWidth = 1.5; g.strokeStyle = BLOOD.dark; g.stroke(); }
}
function fxBloodArc(g, a, b, t, o = {}) {
  const dur = o.dur || .6, u = t / dur; if (t < 0 || u > 1) return; const head = easeSnap(clamp(u * 2.2, 0, 1)), tail = smooth((u - .3) / .7);
  const pts = []; for (let i = 0; i <= 14; i++) { const s = lerp(tail, head, i / 14); pts.push(vAdd(vLerp(a, b, s), [0, -Math.pow(s, 2) * .4 * u, 0])); }
  const sp = pts.map(p => proj2(p)), s0 = pxScale(vLerp(a, b, .5)), ws = sp.map((_, i) => (o.w || .08) * s0 * Math.sin(Math.PI * i / 14) * (1 + .3 * Math.sin(i * 2.3)));
  polyPath(g, catmull(ribbon2D(sp, ws), true, 2)); g.fillStyle = o.col || BLOOD.col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = BLOOD.dark; g.stroke();
  for (let i = 0; i < 10; i++) { const k = Math.floor(hash(i * 3) * 14), q = sp[k]; if (!q) continue; const dt = u * (.5 + hash(i)); bloodDrop(g, q[0] + (hash(i * 5) - .5) * 40 * dt, q[1] + dt * 120 * hash(i * 7), 0, 300, Math.max(1, (o.w || .08) * s0 * .3 * hash(i * 9))); }
}
function fxBloodSplat(g, c, t, o = {}) {
  const R = o.r || .8, seed = o.seed || 7, grow = easeOut(clamp(t / .35, 0, 1)); if (t < 0) return;
  const main = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, rr = R * grow * (.55 + .45 * hash(seed + i)) * (i % 3 === 0 ? 1.35 : 1); main.push([c[0] + Math.cos(a) * rr, .006, c[2] + Math.sin(a) * rr * .9]); }
  const sp = projPoly(main); if (sp.length > 2) { polyPath(g, catmull(sp, true, 2)); g.fillStyle = o.col || '#8a0a16'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = BLOOD.dark; g.stroke(); }
  for (let i = 0; i < (o.n || 14); i++) { const a = hash(seed + i * 3) * TAU, d = R * (1.1 + hash(seed + i * 5) * 1.3) * grow, q = project([c[0] + Math.cos(a) * d, .006, c[2] + Math.sin(a) * d]); if (!q) continue; const r = R * (.05 + .1 * hash(seed + i * 7)) * q.s; g.beginPath(); g.ellipse(q.x, q.y, r, r * .55, 0, 0, TAU); g.fillStyle = o.col || '#8a0a16'; g.fill(); }
}
function fxBloodMist(g, p, t, o = {}) { const u = t / (o.dur || .5); if (t < 0 || u > 1) return; const q = P2(p); if (!q) return; const R = (o.r || .6) * q.s * easeOut(u);
  for (let i = 0; i < 30; i++) { const a = hash(i) * TAU, d = R * hash(i * 3); g.globalAlpha = .7 * (1 - u); g.fillStyle = i % 2 ? BLOOD.col : '#d02030'; g.beginPath(); g.arc(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, Math.max(1, R * .06 * hash(i * 5)), 0, TAU); g.fill(); } g.globalAlpha = 1; }
function fxBloodDrip(g, p, t, o = {}) { const n = o.n || 6; for (let i = 0; i < n; i++) { const t0 = i * (o.every || .35) + hash(i) * .1, tt = t - t0; if (tt < 0 || tt > .8) continue; const pos = [p[0] + (hash(i * 3) - .5) * .04, p[1] - .5 * 9.8 * tt * tt, p[2]]; if (pos[1] < 0) continue; const q = project(pos); if (!q) continue; bloodDrop(g, q.x, q.y, 0, 400 * tt + 10, Math.max(1, .018 * q.s)); } }
function fxCutFlash(g, a, b, t, o = {}) {
  const u = t / (o.dur || .45); if (t < 0 || u > 1) return; const qa = P2(a), qb = P2(b); if (!qa || !qb) return; const dx = qb.x - qa.x, dy = qb.y - qa.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const draw = easeSnap(clamp(u * 4, 0, 1)), open = smooth((u - .25) / .75) * (o.gap || 12);
  g.save(); g.beginPath(); g.moveTo(qa.x, qa.y); g.quadraticCurveTo(qa.x + dx * .5 + nx * open, qa.y + dy * .5 + ny * open, qa.x + dx * draw, qa.y + dy * draw); g.quadraticCurveTo(qa.x + dx * .5 - nx * open, qa.y + dy * .5 - ny * open, qa.x, qa.y);
  g.fillStyle = u < .25 ? '#ffffff' : (o.col || BLOOD.col); g.fill(); g.lineWidth = u < .25 ? 6 : 2; g.strokeStyle = u < .25 ? '#ffffff' : BLOOD.dark; g.stroke(); g.restore();
}
// offscreen copy of a figure in screen space (respecting the current transform)
function figLayer(g, F, ft, name = 'figL') { const lay = getLayer(name, g.canvas.width, g.canvas.height), c2 = lay.getContext('2d'); c2.setTransform(g.getTransform()); c2.clearRect(-1e4, -1e4, 3e4, 3e4); const S = drawFig(c2, F, ft); return { lay, c2, S }; }
function fxSplitFig(g, F, ft, t, o = {}) {
  const { lay, S } = figLayer(g, F, ft, 'splitFig'), sc = g.getTransform().a; const ctr = project(S.J[o.at || 'abd']); if (!ctr) return;
  const ang = o.ang == null ? -.35 : o.ang, u = clamp(t / (o.dur || 1.2), 0, 1), gap = easeIn(u) * (o.gap || .6) * ctr.s * sc, spin = easeIn(u) * (o.spin || .25);
  const cx = ctr.x * sc, cy = ctr.y * sc, nx = -Math.sin(ang), ny = Math.cos(ang), BIG = 5000;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const sg of [-1, 1]) { g.save(); g.translate(nx * gap * sg * .5, ny * gap * sg * .5 + (sg > 0 ? gap * .3 : 0)); g.translate(cx, cy); g.rotate(spin * sg * .4); g.translate(-cx, -cy);
    g.beginPath(); g.moveTo(cx - Math.cos(ang) * BIG, cy - Math.sin(ang) * BIG); g.lineTo(cx + Math.cos(ang) * BIG, cy + Math.sin(ang) * BIG); g.lineTo(cx + Math.cos(ang) * BIG + nx * BIG * sg, cy + Math.sin(ang) * BIG + ny * BIG * sg); g.lineTo(cx - Math.cos(ang) * BIG + nx * BIG * sg, cy - Math.sin(ang) * BIG + ny * BIG * sg); g.closePath(); g.clip();
    g.drawImage(lay, 0, 0);
    // raw red edge along the cut
    g.lineWidth = Math.max(3, .05 * ctr.s * sc); g.strokeStyle = BLOOD.col; g.beginPath(); g.moveTo(cx - Math.cos(ang) * BIG, cy - Math.sin(ang) * BIG); g.lineTo(cx + Math.cos(ang) * BIG, cy + Math.sin(ang) * BIG); g.save(); g.globalCompositeOperation = 'source-atop'; g.stroke(); g.restore();
    g.restore(); }
  g.restore();
  if (u < .9) for (const sg of [-1, 1]) fxBloodSpray(g, S.J[o.at || 'abd'], [Math.cos(ang) * sg * .3 + nx * .3, .6, .4], t, { n: 30, speed: 4, seed: 11 + sg, ribbon: true, size: .05 });
}
function fxDisintegrate(g, F, ft, t, o = {}) { // ash / dust death: holes eat the silhouette from 'from' upward + flakes
  const { lay, c2, S } = figLayer(g, F, ft, 'disFig'), sc = g.getTransform().a, src = project(S.J[o.from || 'neck']); if (!src) return; const u = clamp(t / (o.dur || 2), 0, 1), k = S.B.h / 1.8;
  c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalCompositeOperation = 'source-atop'; c2.fillStyle = rgba(o.col || '#2a1a1e', .35 + .5 * u); c2.fillRect(0, 0, lay.width, lay.height);
  c2.globalCompositeOperation = 'destination-out'; const R = 1.4 * k * src.s * sc * easeIn(u) * 1.4;
  for (let i = 0; i < 120; i++) { const a = hash(i * 3) * TAU, d = Math.sqrt(hash(i * 5)) * R, r = Math.min((.03 + .06 * hash(i * 7)) * k * src.s, 10) * sc * (1 + u); c2.beginPath(); c2.rect(src.x * sc + Math.cos(a) * d - r, src.y * sc + Math.sin(a) * d * 1.6 - r, r * 2, r * 1.5); c2.fill(); }
  c2.beginPath(); c2.ellipse(src.x * sc, src.y * sc, R * .6, R * .95, 0, 0, TAU); c2.fill(); c2.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lay, 0, 0); g.restore();
  fxAshDrift(g, S.J[o.from || 'neck'], t, { n: 160, r: .5 * k, h: 1.6 * k, wind: o.wind || 1.4 });
}
function fxSilhouetteDeath(g, F, ft, t, o = {}) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg || '#c8101a'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); drawFig(g, F, ft, { mode: 'flat', col: o.col || '#0a0406' }); }
