/* Bleach Showdown engine - fx.js : animated, ink-outlined, hand-drawn-feeling effects (anime language).
   All effects are deterministic functions of (local) time and a seed; they are drawn ON ONES unless noted (pass
   t = onTwos(t) for a limited look).  Positions may be WORLD points [x,y,z] (projected through the shot camera ->
   real depth/scale) or SCREEN points {x,y}.  Colours are hex.  Most take an options object; defaults look good.

   GENERIC: fxSpeedLines (focus lines), fxSpeedBG (parallel), fxShockRing (ground ring), fxAirRings (pressure cones),
     fxExplosion, fxSmoke, fxDust, fxDebris (rock|glass|ice shards), fxSparks, fxLightning, fxRisingRocks, fxCracks,
     fxAura (reiatsu flames around a figure), fxPressure, fxPillar (reiatsu column), fxSlashArc (blade smear from a
     figure's real sword motion), fxSlashMark (screen cut line), fxClash, fxShunpo, fxKido (magic circle),
     fxSealWave, fxGlowAt, fxFlashBurst, fxImpactStar
   BLEACH: fxPetals / fxPetalStream (Senbonzakura), fxKageyoshi (blade rows), fxIceDragon, fxIceGrowth, fxFrost,
     fxSnow, fxFlowerSwirl (Katen Kyokotsu), fxShadowPool (Kageoni), fxDrapes (Karamatsu Shinju), fxSoundRings
     (Suzumushi), fxBenihiko (blade volley), fxEnmaRings + fxEnmaDome (Enma Korogi), fxPoison (Ashisogi Jizo),
     fxKonjiki (Konjiki Ashisogi Jizo creature), fxSkullAura (Kenpachi), fxCrescent (massive slash wave),
     fxGroundSplit (crevasse)                                                                                    */
'use strict';
const P2 = p => { if (!p) return null; if (Array.isArray(p)) { const q = project(p); return q ? { x: q.x, y: q.y, s: q.s, z: q.z } : null; } return { x: p.x, y: p.y, s: p.s || 100, z: p.z || 5 }; };
const INK = () => LIGHT.ink;
function inkFill(ctx, col, lw, inkCol) { ctx.fillStyle = col; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = inkCol || INK(); ctx.lineJoin = 'round'; ctx.stroke(); } }
function blobPath(ctx, x, y, r, seed, n = 9, jag = .22, phase = 0) { ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, k = 1 + (hash(seed + i % n) - .5) * 2 * jag + Math.sin(a * 3 + phase) * jag * .3; const px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k; if (!i) ctx.moveTo(px, py); else { const am = (i - .5) / n * TAU, km = 1 + jag * .9; ctx.quadraticCurveTo(x + Math.cos(am) * r * km * 1.08, y + Math.sin(am) * r * km * 1.08, px, py); } } ctx.closePath(); }

// --------------------------------------------------------------------------------------------- lines
function fxSpeedLines(ctx, t, o = {}) {
  const cx = o.x == null ? W / 2 : o.x, cy = o.y == null ? H / 2 : o.y, n = o.n || 90, inner = o.inner == null ? 260 : o.inner, seed = (o.seed || 1) + Math.floor(t * FPS / (o.hold || 1)) * 977;
  ctx.save(); ctx.fillStyle = o.col || '#ffffff'; ctx.globalAlpha = o.alpha == null ? .9 : o.alpha;
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, w = (o.w || 10) * (.3 + hash(seed + i * 3)), r0 = inner * (.8 + hash(seed + i * 5) * .9), r1 = Math.max(W, H) * 1.2;
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; ctx.beginPath(); ctx.moveTo(cx + ca * r0, cy + sa * r0); ctx.lineTo(cx + ca * r1 + px * w, cy + sa * r1 + py * w); ctx.lineTo(cx + ca * r1 - px * w, cy + sa * r1 - py * w); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function fxSpeedBG(ctx, t, o = {}) { // parallel speed lines background (flight / dash)
  const ang = o.ang || 0, ca = Math.cos(ang), sa = Math.sin(ang), seed = (o.seed || 3) + Math.floor(t * FPS) * 131;
  if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(0, 0, W, H); }
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ang);
  for (let i = 0; i < (o.n || 70); i++) { const y = (hash(seed + i) - .5) * H * 1.6, x = (hash(seed + i * 7) - .5) * W * 1.6, l = 200 + hash(seed + i * 3) * 900, w = 1 + hash(seed + i * 5) * (o.w || 7); ctx.fillStyle = hash(i * 13 + seed) < .5 ? (o.col || '#ffffff') : (o.col2 || o.col || '#ffffff'); ctx.globalAlpha = o.alpha == null ? .7 : o.alpha; ctx.beginPath(); ctx.moveTo(x, y - w / 2); ctx.lineTo(x + l, y); ctx.lineTo(x, y + w / 2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// --------------------------------------------------------------------------------------------- rings / waves
function ringPts(c, r, up = [0, 1, 0], n = 48) { const M = mFromY(up, Math.abs(up[1]) > .9 ? [1, 0, 0] : [0, 1, 0]); const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push(vAdd(c, vAdd(vMul(M[0], Math.cos(a) * r), vMul(M[2], Math.sin(a) * r)))); } return pts; }
function fxShockRing(ctx, c, t, o = {}) { // expanding ground/air ring with thick ink
  const dur = o.dur || .6, u = t / dur; if (u < 0 || u > 1) return;
  const r = (o.r || 6) * easeOut(u), w = (o.w || .9) * (1 - u) + .05, up = o.up || [0, 1, 0];
  const outer = projPoly(ringPts(c, r + w, up)), inner = projPoly(ringPts(c, Math.max(.01, r - w * .2), up));
  if (outer.length < 3) return;
  ctx.save(); ctx.beginPath(); polyAdd(ctx, outer); polyAdd(ctx, inner.slice().reverse()); ctx.fillStyle = rgba(o.col || '#ffffff', (o.alpha || .95) * (1 - u * .6)); ctx.fill('evenodd');
  ctx.lineWidth = (o.ink || 3) * (1 - u * .5); ctx.strokeStyle = o.inkCol || rgba(INK(), .9); ctx.beginPath(); polyAdd(ctx, outer); ctx.stroke(); ctx.restore();
}
function polyAdd(ctx, pts) { if (!pts.length) return; ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
function fxAirRings(ctx, p, dir, t, o = {}) { // pressure cones along a punch/slash direction
  const n = o.n || 3, dur = o.dur || .35;
  for (let i = 0; i < n; i++) { const u = (t - i * .05) / dur; if (u < 0 || u > 1) continue; const c = vMad(p, dir, (o.len || 1.2) * easeOut(u) + i * .25); const r = (o.r || .35) * (1 + u * 1.5) * (1 + i * .3);
    const pts = projPoly(ringPts(c, r, dir, 32)); if (pts.length < 3) continue; ctx.beginPath(); polyAdd(ctx, pts); ctx.lineWidth = (o.w || 5) * (1 - u); ctx.strokeStyle = rgba(o.col || '#ffffff', .95 * (1 - u)); ctx.stroke(); }
}
// --------------------------------------------------------------------------------------------- explosion / smoke / dust
const EXPL_COLS = { fire: ['#ffffff', '#fff2a8', '#ffb347', '#e0502a', '#5a3040'], ice: ['#ffffff', '#e8fbff', '#9fe0ff', '#4a90d0', '#2a3a6a'], pink: ['#ffffff', '#ffe6f0', '#ff9ec4', '#d0507a', '#4a2038'], dark: ['#ffffff', '#d8c8ff', '#7a5ad0', '#2a1a4a', '#0a0814'], gold: ['#ffffff', '#fff6c8', '#ffd84a', '#c08a20', '#4a3010'], poison: ['#f6ffe8', '#d8ff9a', '#9adf4a', '#5a8a2a', '#2a3a20'], red: ['#ffffff', '#ffd0b0', '#ff5a3a', '#a01818', '#300808'], dust: ['#fffaf0', '#f0e2c8', '#cdb48e', '#9a805e', '#5a4a3a'] };
function fxExplosion(ctx, p, t, o = {}) {
  const q = P2(p); if (!q) return; const dur = o.dur || 1.4, u = t / dur; if (u < 0 || u > 1) return;
  const size = (o.size || 3) * q.s, cols = EXPL_COLS[o.pal || 'fire'], seed = o.seed || 5, lw = clamp(size * .012, 1.5, 6);
  ctx.save();
  // flash core (first frames)
  if (u < .08) { glow(ctx, q.x, q.y, size * 1.6, cols[0], 1); }
  // smoke puffs (dark, outer, rising)
  const n = o.n || 14;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < n; i++) {
      const a = hash(seed + i * 7) * TAU, d = easeOut(u) * size * (.25 + hash(seed + i) * .75) * (pass === 0 ? 1.15 : pass === 1 ? .85 : .5);
      const x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .7 - u * size * .5 * (pass === 0 ? 1 : .5);
      const rr = size * (.2 + hash(seed + i * 3) * .18) * (pass === 0 ? 1.15 : pass === 1 ? .9 : .7) * (pass === 2 ? (1 - u) : (.5 + u * .7));
      if (rr < 1) continue;
      const col = pass === 0 ? mixHex(cols[3], cols[4], clamp(u * 1.6, 0, 1)) : pass === 1 ? mixHex(cols[2], cols[3], clamp(u * 1.3, 0, 1)) : mixHex(cols[1], cols[2], u);
      blobPath(ctx, x, y, rr, seed + i * 11 + pass, 8, .18, u * 3); inkFill(ctx, col, lw, mixHex(cols[4], '#000000', .4));
      // cel highlight on puffs
      if (pass < 2) { blobPath(ctx, x - rr * .18, y - rr * .2, rr * .62, seed + i * 13, 7, .15); ctx.fillStyle = rgba(pass === 0 ? cols[2] : cols[1], .55); ctx.fill(); }
    }
  }
  if (u < .35) { const k = 1 - u / .35; glow(ctx, q.x, q.y, size * (.6 + u), cols[1], .8 * k); }
  ctx.restore();
  if (o.ring !== false && Array.isArray(p)) fxShockRing(ctx, [p[0], o.groundY || 0, p[2]], t, { r: (o.size || 3) * 2.6, dur: dur * .5, w: (o.size || 3) * .25 });
  if (o.debris !== false) fxDebris(ctx, p, t, { n: o.debrisN || 18, seed: seed + 3, speed: (o.size || 3) * 3.2, size: (o.size || 3) * .08, kind: o.kind || 'rock', dur });
}
function fxSmoke(ctx, p, t, o = {}) { // outlined cartoon smoke puffs rising/expanding
  const q = P2(p); if (!q) return; const dur = o.dur || 2, u = clamp(t / dur, 0, 1); if (t < 0) return;
  const n = o.n || 10, size = (o.size || 1.5) * q.s, seed = o.seed || 7, col = o.col || '#d8d2c8', sh = o.shade || mixHex(col, '#5a5068', .45);
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = size * (.2 + easeOut(u) * hash(seed + i * 3) * 1.1);
    const x = q.x + Math.cos(a) * d * (o.spread || 1.3), y = q.y + Math.sin(a) * d * .4 - u * size * (o.rise == null ? .8 : o.rise) * (.5 + hash(seed + i * 5));
    const rr = size * (.25 + hash(seed + i * 9) * .25) * (.6 + u * .8) * (1 - Math.pow(u, 3) * .7);
    ctx.globalAlpha = (o.alpha || 1) * (1 - Math.pow(u, 2.5));
    blobPath(ctx, x, y, rr, seed + i * 17, 8, .2, u * 2); inkFill(ctx, sh, clamp(rr * .05, 1, 4), rgba(INK(), .8));
    blobPath(ctx, x - rr * .15, y - rr * .18, rr * .78, seed + i * 19, 8, .16); ctx.fillStyle = col; ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function fxDust(ctx, p, t, o = {}) { // ground kick-up: low, wide, flat clumps + pebbles
  fxSmoke(ctx, p, t, Object.assign({ n: 9, size: .9, rise: .35, spread: 2.2, col: o.col || '#e6d6b8', dur: o.dur || 1.1, seed: o.seed || 13 }, o));
  fxDebris(ctx, p, t, { n: 10, seed: (o.seed || 13) + 1, speed: 3, size: .05, kind: 'rock', dur: o.dur || 1.1, col: o.pebble });
}
function fxDebris(ctx, p, t, o = {}) { // ballistic shards with spin, outlined
  if (!Array.isArray(p)) { const q = P2(p); if (!q) return; }
  const dur = o.dur || 1.2; if (t < 0 || t > dur * 1.3) return; const n = o.n || 14, seed = o.seed || 9, g = 9.8;
  for (let i = 0; i < n; i++) {
    const a = hash(seed + i) * TAU, el = .3 + hash(seed + i * 3) * 1.1, sp = (o.speed || 6) * (.4 + hash(seed + i * 5) * .8);
    const v = [Math.cos(a) * Math.cos(el) * sp, Math.sin(el) * sp, Math.sin(a) * Math.cos(el) * sp];
    let pos, q;
    if (Array.isArray(p)) { pos = [p[0] + v[0] * t, Math.max(0, p[1] + v[1] * t - .5 * g * t * t), p[2] + v[2] * t]; q = project(pos); if (!q) continue; }
    else { const s0 = P2(p); q = { x: s0.x + v[0] * t * 60, y: s0.y - (v[1] * t - .5 * g * t * t) * 60, s: s0.s }; }
    const sz = (o.size || .12) * (.5 + hash(seed + i * 7)) * q.s; if (sz < .7) continue;
    const rot = t * (4 + hash(seed + i * 11) * 10) + i;
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(rot); ctx.beginPath();
    const k = o.kind || 'rock';
    if (k === 'glass' || k === 'ice') { ctx.moveTo(0, -sz * 1.4); ctx.lineTo(sz * .7, sz * .3); ctx.lineTo(-sz * .2, sz); ctx.closePath(); inkFill(ctx, k === 'ice' ? '#d8f4ff' : 'rgba(220,240,255,.8)', clamp(sz * .12, .8, 2.5), k === 'ice' ? '#3a6a9a' : '#4a5a6a'); ctx.fillStyle = '#ffffff'; ctx.fillRect(-sz * .1, -sz * .8, sz * .15, sz * .9); }
    else if (k === 'petal') { ctx.moveTo(0, -sz); ctx.quadraticCurveTo(sz * .8, 0, 0, sz); ctx.quadraticCurveTo(-sz * .8, 0, 0, -sz); inkFill(ctx, o.col || '#ffb0cc', 0); }
    else { for (let j = 0; j < 6; j++) { const aa = j / 6 * TAU, rr = sz * (.6 + hash(seed + i * 13 + j) * .6); if (!j) ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); inkFill(ctx, o.col || '#9a8a78', clamp(sz * .15, .8, 3)); ctx.fillStyle = rgba('#ffffff', .25); ctx.fillRect(-sz * .5, -sz * .5, sz * .5, sz * .4); }
    ctx.restore();
  }
}
function fxSparks(ctx, p, t, o = {}) {
  const q = P2(p); if (!q) return; const dur = o.dur || .35, u = t / dur; if (u < 0 || u > 1) return; const n = o.n || 22, seed = o.seed || 21;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = (o.dir == null ? hash(seed + i) * TAU : o.dir + (hash(seed + i) - .5) * (o.spread || 1.6)), sp = (o.speed || 900) * (.4 + hash(seed + i * 3) * .8) * (q.s / 200);
    const d0 = sp * u * .6, d1 = d0 + sp * .12 * (1 - u); const x0 = q.x + Math.cos(a) * d0, y0 = q.y + Math.sin(a) * d0 + u * u * 120, x1 = q.x + Math.cos(a) * d1, y1 = q.y + Math.sin(a) * d1 + u * u * 120;
    ctx.strokeStyle = o.col || '#fff6c8'; ctx.lineWidth = (o.w || 4) * (1 - u); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  if (u < .25) { const k = 1 - u / .25; ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, (o.flare || 120) * q.s / 200 * 2, o.col || '#fff6c8', .9 * k); fxImpactStar(ctx, q.x, q.y, (o.flare || 120) * q.s / 100 * k, 0, o.col || '#ffffff'); }
  ctx.restore();
}
function fxImpactStar(ctx, x, y, r, rot = 0, col = '#ffffff', n = 4) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? r * .08 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
function fxLightning(ctx, a, b, t, o = {}) {
  const A = P2(a), B = P2(b); if (!A || !B) return; const seed = (o.seed || 31) + Math.floor(t * FPS / (o.hold || 1)) * 53;
  const bolt = (x0, y0, x1, y1, w, depth, sd) => { const pts = [[x0, y0]]; const n = 10; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; for (let i = 1; i < n; i++) { const u = i / n, off = (hash(sd + i) - .5) * L * .18; pts.push([x0 + dx * u + nx * off, y0 + dy * u + ny * off]); } pts.push([x1, y1]);
    ctx.lineJoin = 'miter'; ctx.lineCap = 'round'; polyPath(ctx, pts, false); ctx.lineWidth = w * 2.6; ctx.strokeStyle = rgba(o.col || '#a8d8ff', .5); ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = o.core || '#ffffff'; ctx.stroke();
    if (depth > 0) for (let k = 0; k < 2; k++) { const i = 2 + Math.floor(hash(sd * 3 + k) * 6), p = pts[i], a2 = Math.atan2(dy, dx) + (hash(sd + k * 9) - .5) * 1.6, l2 = L * (.2 + hash(sd + k) * .25); bolt(p[0], p[1], p[0] + Math.cos(a2) * l2, p[1] + Math.sin(a2) * l2, w * .55, depth - 1, sd * 7 + k); } };
  ctx.save(); bolt(A.x, A.y, B.x, B.y, o.w || 4, o.branches == null ? 2 : o.branches, seed); ctx.restore();
}
function fxRisingRocks(ctx, c, t, o = {}) { // pebbles/rocks floating up from the ground around c (power-up)
  const n = o.n || 26, seed = o.seed || 41, R = o.r || 3;
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = R * (.3 + hash(seed + i * 3)), st = hash(seed + i * 5) * 1.5, u = clamp((t - st) / 2.5, 0, 1); if (u <= 0) continue;
    const p = [c[0] + Math.cos(a) * d, (o.h || 2.5) * easeOut(u) * (.4 + hash(seed + i * 7)) + Math.sin(t * 3 + i) * .05, c[2] + Math.sin(a) * d]; const q = project(p); if (!q) continue;
    const sz = (o.size || .12) * (.5 + hash(seed + i * 9)) * q.s; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(t * .8 + i); ctx.beginPath(); for (let j = 0; j < 6; j++) { const aa = j / 6 * TAU, rr = sz * (.7 + hash(seed + i * 13 + j) * .5); ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); inkFill(ctx, o.col || '#8a7e70', clamp(sz * .12, .8, 3)); ctx.restore(); }
}
function fxCracks(ctx, c, t, o = {}) { // ground cracks spreading from c (world)
  const seed = o.seed || 51, n = o.n || 10, R = (o.r || 4) * easeOut(clamp(t / (o.dur || .4), 0, 1));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) { let a = hash(seed + i) * TAU, p = [c[0], .01, c[2]]; const L = [p]; const len = R * (.5 + hash(seed + i * 3) * .7); for (let k = 0; k < 6; k++) { a += (hash(seed + i * 17 + k) - .5) * .9; p = [p[0] + Math.cos(a) * len / 6, .01, p[2] + Math.sin(a) * len / 6]; L.push(p); }
    for (const r of projLine(L)) { polyPath(ctx, r, false); ctx.lineWidth = (o.w || 5); ctx.strokeStyle = rgba(o.col || '#1a1018', .9); ctx.stroke(); if (o.glow) { ctx.lineWidth = (o.w || 5) * .4; ctx.strokeStyle = o.glow; ctx.stroke(); } } }
  ctx.restore();
}
// --------------------------------------------------------------------------------------------- aura / reiatsu
/* fxAura(ctx, F, t, o): flame-tongue reiatsu around a figure (draw in 'under' for back flames + 'glow' for core).
   o: { col, col2 (core), size, amt 0..1, seed, ink }                                                             */
function fxAura(ctx, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, amt = o.amt == null ? 1 : o.amt; if (amt <= 0) return;
  const joints = ['head', 'neck', 'shL', 'shR', 'elL', 'elR', 'handL', 'handR', 'pelvis', 'knL', 'knR', 'anL', 'anR', 'abd'];
  const tf = onN(t, o.hold || 2), seed = o.seed || 61, col = o.col || '#9fd8ff', col2 = o.col2 || '#ffffff';
  const pts = joints.map(j => project(S.J[j])).filter(Boolean); if (!pts.length) return;
  const sz = (o.size || .55) * k * pts[0].s * amt;
  const layers = [[col, 1.0, true], [mixHex(col, col2, .55), .62, false], [col2, .32, false]];
  ctx.save();
  for (const [c, sc, ink] of layers) {
    ctx.beginPath();
    pts.forEach((p, i) => { const n = 3; for (let j = 0; j < n; j++) { const ph = tf * 7 + i * 1.7 + j * 2.1, h = sz * sc * (1.2 + .6 * Math.sin(ph) + hash(seed + i * 9 + j + Math.floor(tf * FPS)) * .5), w = sz * sc * .55;
      const x = p.x + (j - 1) * w * .8 + Math.sin(ph * .7) * w * .3, y = p.y + w * .3;
      ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * .9, y - h * .5, x + Math.sin(ph) * w * .4, y - h); ctx.quadraticCurveTo(x + w * .9, y - h * .45, x + w, y); ctx.quadraticCurveTo(x, y + w * .7, x - w, y); } });
    ctx.fillStyle = c; ctx.globalAlpha = (o.alpha || .9) * (ink ? 1 : .95); ctx.fill('nonzero');
    if (ink && o.ink !== false) { ctx.lineWidth = clamp(sz * .03, 1.2, 4); ctx.strokeStyle = rgba(o.inkCol || mixHex(col, '#000000', .6), .8); ctx.stroke(); }
  }
  ctx.restore();
}
function fxPressure(ctx, c, t, o = {}) { // reiatsu pressure: ground cracks + rising rocks + distortion rings + focus lines
  fxCracks(ctx, c, t, { r: o.r || 5, n: 12, seed: o.seed || 71, glow: o.glow });
  fxRisingRocks(ctx, c, t, { r: (o.r || 5) * .8, seed: (o.seed || 71) + 1 });
  for (let i = 0; i < 3; i++) { const u = ((t * .8 + i / 3) % 1); fxShockRing(ctx, [c[0], .02, c[2]], u * .6, { r: (o.r || 5) * 1.4, dur: .6, w: .15, col: o.col || '#ffffff', alpha: .5 }); }
}
function fxPillar(ctx, c, t, o = {}) { // column of reiatsu shooting into the sky
  const q0 = project(c); if (!q0) return; const p1 = proj2(vAdd(c, [0, o.h || 30, 0])), q1 = { x: p1[0], y: p1[1] };
  const u = clamp(t / (o.rise || .35), 0, 1), w = (o.r || 1.6) * q0.s, col = o.col || '#9fd8ff', tf = onN(t, 2);
  const top = lerp(q0.y, q1.y, easeOut(u));
  ctx.save();
  for (const [k, cc, a] of [[1.4, col, .55], [1, mixHex(col, '#ffffff', .4), .85], [.45, '#ffffff', 1]]) {
    ctx.beginPath(); const n = 16; for (let i = 0; i <= n; i++) { const v = i / n, y = lerp(q0.y, top, v), ww = w * k * (1 - v * .35) * (1 + .12 * Math.sin(v * 20 - tf * 30)); ctx.lineTo(q0.x + lerp(0, q1.x - q0.x, v) - ww, y); } for (let i = n; i >= 0; i--) { const v = i / n, y = lerp(q0.y, top, v), ww = w * k * (1 - v * .35) * (1 + .12 * Math.cos(v * 17 - tf * 27)); ctx.lineTo(q0.x + lerp(0, q1.x - q0.x, v) + ww, y); } ctx.closePath(); ctx.fillStyle = rgba(cc, a); ctx.fill(); }
  ctx.restore();
}
// --------------------------------------------------------------------------------------------- slashes
/* blade smear from the figure's real sword motion: samples sword tip/mid at t-dt..t, draws a crescent.
   o: { span: seconds of trail (default .1), col, core, ink, hand: 'R', spec override (len) }                   */
function swordAt(F, t, sw2) {
  const S = figSkel(F, t), D = designAt(F, t), sw = sw2 || S.pose.sword; if (!sw || !D.sword) return null;
  const fr = swordFrame(S, D, sw), k = S.B.h / 1.8, L = (D.sword.len || .95) * k, hl = (D.sword.handle || .26) * k;
  return { base: vMad(fr.grip, fr.dir, hl * .35 + L * .2), tip: vMad(fr.grip, fr.dir, hl * .35 + L * 1.02), fr };
}
function fxSlashArc(ctx, F, t, o = {}) {
  const span = o.span || .1, n = 10, tips = [], bases = [];
  for (let i = 0; i <= n; i++) { const s = swordAt(F, t - span * i / n, o.sword2); if (!s) return; const a = proj2(s.tip), b = proj2(vLerp(s.base, s.tip, .25)); tips.push(a); bases.push(b); }
  // only draw if moving fast enough
  const L = Math.hypot(tips[0][0] - tips[n][0], tips[0][1] - tips[n][1]); if (L < (o.minPx || 40)) return;
  const poly = tips.concat(bases.slice().reverse());
  ctx.save(); polyPath(ctx, catmull(poly, true, 2)); ctx.fillStyle = o.col || 'rgba(255,255,255,.92)'; ctx.fill();
  if (o.edge !== false) { polyPath(ctx, catmull(tips, false, 3), false); ctx.lineWidth = o.edgeW || 5; ctx.strokeStyle = o.edgeCol || '#bfe8ff'; ctx.lineCap = 'round'; ctx.stroke(); }
  if (o.ink) { polyPath(ctx, catmull(poly, true, 2)); ctx.lineWidth = 2; ctx.strokeStyle = INK(); ctx.stroke(); }
  // trailing speed streaks
  for (let i = 1; i < n; i += 2) { const a = tips[i], b = bases[i]; ctx.strokeStyle = rgba(o.edgeCol || '#bfe8ff', .5); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], .4), lerp(a[1], b[1], .4)); ctx.stroke(); }
  ctx.restore();
}
function fxSlashMark(ctx, a, b, t, o = {}) { // screen-space giant cut line: draws in, flashes, then splits
  const A = P2(a), B = P2(b); if (!A || !B) return; const dur = o.dur || .5, u = t / dur; if (u < 0 || u > 1) return;
  const d = clamp(u / .25, 0, 1), x1 = lerp(A.x, B.x, easeOut(d)), y1 = lerp(A.y, B.y, easeOut(d)), w = (o.w || 26) * (u < .25 ? 1 : 1 - (u - .25) / .75);
  const dx = x1 - A.x, dy = y1 - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  ctx.save(); ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo((A.x + x1) / 2 + nx * w, (A.y + y1) / 2 + ny * w); ctx.lineTo(x1, y1); ctx.lineTo((A.x + x1) / 2 - nx * w * .35, (A.y + y1) / 2 - ny * w * .35); ctx.closePath();
  ctx.fillStyle = o.col || '#ffffff'; ctx.fill(); ctx.lineWidth = o.ink || 3; ctx.strokeStyle = o.inkCol || INK(); ctx.stroke(); if (o.glowCol) { ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = w * .6; ctx.strokeStyle = rgba(o.glowCol, .4); ctx.stroke(); } ctx.restore();
}
function fxClash(ctx, p, t, o = {}) { // two blades meeting: spark burst + cross flare + ring
  fxSparks(ctx, p, t, Object.assign({ n: 30, flare: 200 }, o));
  const q = P2(p); if (!q) return; const u = t / (o.dur || .4); if (u < 0 || u > 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = (o.r || 500) * (q.s / 200) * (1 - u);
  ctx.fillStyle = rgba(o.col || '#ffffff', .9 * (1 - u)); ctx.fillRect(q.x - r, q.y - 2, r * 2, 4); ctx.fillRect(q.x - 2, q.y - r * .6, 4, r * 1.2); ctx.restore();
  if (Array.isArray(p)) { const pts = projPoly(ringPts(p, .3 + u * 2.4, toCam(p), 32)); if (pts.length > 2) { ctx.beginPath(); polyAdd(ctx, pts); ctx.lineWidth = 6 * (1 - u); ctx.strokeStyle = rgba('#ffffff', 1 - u); ctx.stroke(); } }
}
function fxShunpo(ctx, p, t, o = {}) { // flash-step: vertical flicker lines + dust ring + afterimage streak
  const q = P2(p); if (!q) return; const u = t / (o.dur || .25); if (u < 0 || u > 1) return; const s = q.s, h = 1.9 * s;
  ctx.save(); ctx.strokeStyle = rgba(o.col || '#ffffff', 1 - u); ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x = q.x + (hash(i + 3) - .5) * s * .9, y0 = q.y - h * hash(i * 5), l = h * (.2 + hash(i * 7) * .5) * (1 - u); ctx.lineWidth = 2 + hash(i) * 4; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 - l); ctx.stroke(); }
  ctx.restore(); if (Array.isArray(p)) fxShockRing(ctx, [p[0], .02, p[2]], t, { r: 1.4, dur: o.dur || .25, w: .12, alpha: .6 });
}
// --------------------------------------------------------------------------------------------- kido / seals
const KIDO_GLYPHS = '縛道破道封鎖光天地火水風雷氷桜斬月鬼神';
function fxKido(ctx, c, up, t, o = {}) { // rotating magic circle in a 3D plane: rings, glyph band, star polygon
  const R = (o.r || 1.5) * easeOut(clamp(t / (o.grow || .3), 0, 1)); if (R <= .01) return; const col = o.col || '#ffd86a', rot = t * (o.spin || .8);
  const M = mFromY(up, Math.abs(up[1]) > .9 ? [1, 0, 0] : [0, 1, 0]);
  const P = (r, a) => vAdd(c, vAdd(vMul(M[0], Math.cos(a) * r), vMul(M[2], Math.sin(a) * r)));
  const ring = (r, w) => { const pts = []; for (let i = 0; i <= 64; i++) pts.push(P(r, i / 64 * TAU + rot)); for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); } };
  ctx.save(); ctx.globalAlpha = o.alpha || 1;
  ring(R, 4); ring(R * .86, 2); ring(R * .55, 3);
  const st = []; const nS = o.points || 6; for (let i = 0; i <= nS; i++) st.push(P(R * .86, (i * 2 % nS) / nS * TAU * (nS % 2 ? 1 : 1) + rot * -1.3)); for (const rn of projLine(st)) { polyPath(ctx, rn, false); ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.stroke(); }
  // glyphs on the band, drawn as decals in the circle plane
  const ng = 12; for (let i = 0; i < ng; i++) { const a = i / ng * TAU - rot * .6, p = P(R * .7, a); const tu = vMul(vAdd(vMul(M[0], -Math.sin(a)), vMul(M[2], Math.cos(a))), R * .1), tv = vMul(vAdd(vMul(M[0], Math.cos(a)), vMul(M[2], Math.sin(a))), -R * .1);
    decal(ctx, p, tu, tv, cc => { cc.fillStyle = col; cc.font = '900 1.2px "IPAGothic", sans-serif'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText(KIDO_GLYPHS[(i + (o.seed || 0)) % KIDO_GLYPHS.length], 0, 0); }, -2, M[1]); }
  ctx.restore();
}
function fxSealWave(ctx, c, t, o = {}) { for (let i = 0; i < 4; i++) fxShockRing(ctx, c, t - i * .08, { r: o.r || 5, dur: o.dur || .7, w: .1, col: o.col || '#ffd86a', alpha: .8, ink: 0 }); }
function fxGlowAt(ctx, p, r, col, a = 1) { const q = P2(p); if (!q) return; glow(ctx, q.x, q.y, r * (Array.isArray(p) ? q.s : 1), col, a); }
function fxFlashBurst(ctx, p, t, o = {}) { const q = P2(p); if (!q) return; const u = t / (o.dur || .3); if (u < 0 || u > 1) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, (o.r || 600) * (1 + u), o.col || '#ffffff', 1 - u); fxImpactStar(ctx, q.x, q.y, (o.r || 600) * 1.4 * (1 - u), o.rot || .3, rgba(o.col || '#ffffff', 1 - u), o.n || 4); ctx.restore(); }

// ============================================================================================= BLEACH SPECIFIC
/* SENBONZAKURA petals: thousands of tiny pink blade-petals in 3D. flow(i, u, t) -> world position for petal i
   (u = 0..1 its param).  Presets: vortex around a centre, stream between points, wall, sphere (Gokei).          */
function fxPetals(ctx, t, o = {}) {
  const n = o.n || 1800, seed = o.seed || 81, col = o.col || '#ff9ec4', col2 = o.col2 || '#ffe6f0', flow = o.flow || petalVortex(o);
  const tf = onN(t, o.hold || 1), list = [];
  for (let i = 0; i < n; i++) { const p = flow(i, hash(seed + i), tf); if (!p) continue; const q = project(p); if (!q || q.z < .3) continue; list.push([q, i]); }
  list.sort((a, b) => b[0].z - a[0].z);
  const sz0 = (o.size || .045);
  for (const [q, i] of list) {
    const s = sz0 * q.s * (.6 + hash(seed + i * 3) * .8); if (s < .4) { ctx.fillStyle = col; ctx.fillRect(q.x, q.y, 1.2, 1.2); continue; }
    const rot = tf * (3 + hash(i) * 8) + i, flip = Math.cos(tf * (5 + hash(i * 7) * 9) + i);
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(rot); ctx.scale(1, .35 + .65 * Math.abs(flip));
    ctx.beginPath(); ctx.moveTo(0, -s * 1.3); ctx.quadraticCurveTo(s * .75, -s * .2, 0, s); ctx.quadraticCurveTo(-s * .75, -s * .2, 0, -s * 1.3);
    ctx.fillStyle = flip > 0 ? col : mixHex(col, '#c04a7a', .35); ctx.fill();
    if (s > 3) { ctx.lineWidth = Math.min(1.5, s * .12); ctx.strokeStyle = rgba('#7a1a40', .7); ctx.stroke(); ctx.fillStyle = col2; ctx.fillRect(-s * .12, -s * .9, s * .24, s * .9); }
    ctx.restore();
  }
}
function petalVortex(o) { const c = o.c || [0, 1, 0], R = o.r || 3, Hh = o.h || 4, sp = o.spin || 1.6; return (i, u, t) => { const a = u * TAU * 7 + t * sp * (1 + hash(i * 3) * .5), y = (hash(i * 5) * Hh + t * .4 * (hash(i * 9) - .3)) % Hh, r = R * (.4 + .6 * hash(i * 11)) * (1 + .2 * Math.sin(t * 2 + i)); return [c[0] + Math.cos(a) * r, c[1] + y - Hh * .2, c[2] + Math.sin(a) * r]; }; }
function petalStream(o) { // river from a to b with width, travelling along u; arrive: 0..1 how far the head has reached
  const a = o.a, b = o.b, mid = o.mid || vAdd(vLerp(a, b, .5), [0, o.arc || 2, 0]), w = o.w || 1.2, sp = o.speed || .8;
  return (i, u, t) => { const head = o.arrive == null ? 1 : o.arrive; const v = ((u + t * sp * (1 + hash(i) * .3)) % 1) * head; const p = vLerp(vLerp(a, mid, v), vLerp(mid, b, v), v); const ang = hash(i * 7) * TAU + t * 4; const rr = w * Math.sqrt(hash(i * 13)) * (1 - v * .3); return [p[0] + Math.cos(ang) * rr, p[1] + Math.sin(ang) * rr * .8, p[2] + Math.sin(ang * 1.3) * rr]; };
}
function petalSphere(o) { const c = o.c, R = o.r || 4; return (i, u, t) => { const th = u * TAU + t * (1.2 + hash(i) * .6), ph = Math.acos(2 * hash(i * 3) - 1); const r = R * (o.close == null ? 1 : lerp(1, .15, o.close)) * (.9 + .1 * Math.sin(t * 3 + i)); return [c[0] + Math.sin(ph) * Math.cos(th) * r, c[1] + Math.cos(ph) * r, c[2] + Math.sin(ph) * Math.sin(th) * r]; }; }
function fxPetalStream(ctx, t, o) { fxPetals(ctx, t, Object.assign({}, o, { flow: petalStream(o) })); }
// Bankai Kageyoshi / Senkei: giant blades rising from the ground in rows. Tinted by the scene light (tones()), lit/shaded
// faces, ridge line, glowing edge (o.glow or the first LIGHT.fx colour), depth fade.  o: { c, r, rows, per, h, rise, rot, seed, col, glow, w }
function fxKageyoshi(ctx, t, o = {}) {
  const c = o.c || [0, 0, 0], rows = o.rows || 2, per = o.per || 14, R = o.r || 6, hMax = o.h || 6, seed = o.seed || 91, rise = o.rise || 1.2;
  const T = tones(o.col || '#aeb6c8'), glowC = o.glow || (LIGHT.fx[0] && LIGHT.fx[0].col) || '#ffd6e6', blades = [];
  for (let rI = 0; rI < rows; rI++) for (let i = 0; i < per; i++) { const a = (i + rI * .5 + (hash(seed + i * 7 + rI) - .5) * .3) / per * TAU + (o.rot || 0), rr = R + rI * 1.2 + (hash(seed + i + rI * 9) - .5) * .5; const st = hash(seed + i + rI * 50) * .4 + rI * .15; const u = easeBack(clamp((t - st) / rise, 0, 1)); if (u <= 0) continue;
    blades.push({ p: [c[0] + Math.cos(a) * rr, c[1], c[2] + Math.sin(a) * rr], a, h: hMax * (.75 + hash(seed + i * 3 + rI) * .5) * u, lean: (hash(seed + i * 11 + rI) - .5) * .25, z: 0 }); }
  for (const b of blades) b.z = camDepth(b.p); blades.sort((x, y) => y.z - x.z);
  const zMax = blades.length ? blades[0].z : 1;
  for (const b of blades) { const tan = [-Math.sin(b.a), 0, Math.cos(b.a)], nrm = [Math.cos(b.a), 0, Math.sin(b.a)], w = (o.w || .32), base = b.p, up = vNorm([nrm[0] * b.lean, 1, nrm[2] * b.lean]), tip = vMad(base, up, b.h), sh = vMad(base, up, b.h * .82);
    const L = vMad(base, tan, -w), Rr = vMad(base, tan, w * .9), Ls = vMad(sh, tan, -w), Rs = vMad(sh, tan, w * .85), ridgeB = vMad(base, nrm, .06), ridgeT = vMad(sh, nrm, .06);
    const lit = vDot(nrm, toCam(base)) > 0 ? vDot(nrm, LIGHT.key) : -vDot(nrm, LIGHT.key), fade = clamp(1 - (b.z - 6) / Math.max(20, zMax) * .5, .45, 1);
    const half1 = projPoly([L, Ls, tip, ridgeT, ridgeB]), half2 = projPoly([ridgeB, ridgeT, tip, Rs, Rr]); if (half1.length < 3) continue;
    ctx.globalAlpha = fade;
    polyPath(ctx, half1); ctx.fillStyle = lit > 0 ? T.base : T.shade; ctx.fill(); polyPath(ctx, half2); ctx.fillStyle = lit > 0 ? T.shade : T.deep; ctx.fill();
    const lw = clamp(250 / b.z, .8, 3.2); polyPath(ctx, projPoly([L, Ls, tip, Rs, Rr])); ctx.lineWidth = lw; ctx.strokeStyle = LIGHT.ink; ctx.lineJoin = 'round'; ctx.stroke();
    const e = projLine([Rr, Rs, tip]); for (const r of e) { polyPath(ctx, r, false); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = lw * 2.4; ctx.strokeStyle = rgba(glowC, .35 * fade); ctx.stroke(); ctx.lineWidth = lw * .9; ctx.strokeStyle = rgba('#ffffff', .8 * fade); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
    ctx.globalAlpha = 1; }
}
// Hyorinmaru ice dragon: crystalline tube along a 3D path, head at the front.  path: [p0..pn] (head = pn) or fn(t)
function fxIceDragon(ctx, t, o = {}) {
  const pts = typeof o.path === 'function' ? o.path(t) : o.path; if (!pts || pts.length < 3) return; const R = o.r || .7, n = pts.length;
  if (o.debugHead) {}
  const prof = v => R * (v < .12 ? .25 + v / .12 * .6 : v > .86 ? .9 - (v - .86) / .14 * .25 : .85 + .15 * Math.sin(v * Math.PI)) * (1 + .1 * Math.sin(v * 46 + t * 9));
  const surf = sTube(pts, prof, [0, 1, 0], 16, Math.max(14, n * 3));
  const G = sampleSurf(surf);
  drawSurf(ctx, G, { col: '#a9dcfa', shade: .1, shadeCol: '#4f8fd0', shade2: -.35, inkCol: '#1e4a7a', inkW: 1.5, rimW: .14,
    extraTones: [{ col: '#d8f2ff', mask: (u, v) => -Math.sin(u * TAU) - .45 }, { col: '#7cb8e8', mask: (u, v) => .05 - Math.min(Math.abs(((u * 8 + v * 26) % 1) - .5), Math.abs(((u * 8 - v * 26 + 50) % 1) - .5)) }],
    gloss: { mask: (u, v, P, N) => Math.min(.08 - Math.abs(Math.sin(u * TAU) - .75), vDot(N, LIGHT.key) - .2), col: '#ffffff' } });
  // dorsal fin shards + side fins
  for (let i = 2; i < n - 1; i++) { const p = pts[i], d = vNorm(vSub(pts[i + 1], pts[i - 1])), up = vNorm(vSub([0, 1, 0], vMul(d, d[1]))), side = vCross(d, up), r = prof(i / (n - 1));
    iceShard(ctx, [vMad(vMad(p, up, r * .8), d, -r * .5), vMad(vMad(p, up, r * (2.0 + .4 * Math.sin(i))), d, -r * 1.1), vMad(vMad(p, up, r * .8), d, r * .3)], { mode: 'normal' }, '#e6f8ff');
    if (i % 3 === 0) for (const sg of [1, -1]) iceShard(ctx, [vMad(p, side, sg * r * .8), vMad(vMad(vMad(p, side, sg * r * 2.2), d, -r * 1.3), up, -r * .5), vMad(vMad(p, side, sg * r * .8), d, -r * .6)], { mode: 'normal' }, '#cdeeff'); }
  // head: drawn in 2D (profile or front design chosen from the view), placed and scaled by the 3D head point
  const h = pts[n - 1], d = vNorm(vSub(pts[n - 1], pts[n - 3])), snout = vMad(h, d, R * 2.2);
  iceDragonHead(ctx, h, d, R, t, o.jaw == null ? .45 + .3 * Math.sin(t * 6) : o.jaw);
  if (o.mist !== false) for (let i = 0; i < n; i += 2) fxSmoke(ctx, pts[i], ((t * .7 + i * .13) % 1) * 1.2, { n: 3, size: R * .7, col: '#eefaff', shade: '#a8d4ee', dur: 1.2, rise: .2, seed: i * 7, alpha: .28 });
  if (o.breath) fxSmoke(ctx, snout, o.breath, { n: 10, size: R * 2, col: '#ffffff', shade: '#bfe4fa', dur: 1, rise: -.2, spread: 2 });
}
function iceDragonHead(ctx, h, d, R, t, jaw) {
  const hp = proj2(h), sp = proj2(vMad(h, d, R)), s = pxScale(h) * R; let dx = sp[0] - hp[0], dy = sp[1] - hp[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const facing = vDot(d, toCam(h)), INKC = '#0e2a4a', B = '#c4e8ff', SH = '#74b2e2', DP = '#2e6aa8';
  const shape = (pts, col, lw = 2.6) => { polyPath(ctx, catmull(pts, true, 3)); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INKC; ctx.lineJoin = 'round'; ctx.stroke(); };
  ctx.save(); ctx.translate(hp[0], hp[1]);
  if (facing < .55) { // PROFILE design, oriented along the screen direction of the snout (y up = away from screen-down)
    const flip = dx < 0 ? -1 : 1; ctx.rotate(Math.atan2(dy, dx * flip) * flip); ctx.scale(s * flip, s); ctx.scale(1, -1); if (flip < 0) ctx.scale(-1, 1);
    // mane shards
    for (let k = 0; k < 7; k++) { const a = Math.PI * .55 + k * .2, L = 1.6 + hash(k) * .9; shape([[-.3, .2], [-.3 + Math.cos(a) * L, .2 + Math.sin(a) * L * .8], [-.1 + Math.cos(a + .12) * L * .5, .1 + Math.sin(a + .12) * L * .4]], k % 2 ? '#e2f6ff' : B, .04); }
    // horns
    for (const off of [0, .18]) { ctx.beginPath(); ctx.moveTo(-.2, .75 + off); ctx.bezierCurveTo(-.9, 1.3 + off, -1.6, 1.2 + off, -2.3, 1.75 + off); ctx.lineWidth = .16; ctx.lineCap = 'round'; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = .1; ctx.strokeStyle = off ? '#ffffff' : '#e2f6ff'; ctx.stroke(); }
    // lower jaw (rotates)
    ctx.save(); ctx.translate(-.3, -.12); ctx.rotate(-jaw * .6); shape([[0, 0], [1.2, -.05], [2.1, .02], [2.2, -.15], [1.4, -.38], [.3, -.42], [-.3, -.2]], SH, .05);
    for (let k = 0; k < 6; k++) { const x = .4 + k * .3; shape([[x, .0], [x + .08, .2], [x + .16, .0]], '#ffffff', .03); } ctx.restore();
    // mouth interior
    shape([[-.2, -.08], [2.0, .05], [1.9, -.25 - jaw * .9], [.2, -.3 - jaw * .3]], '#123a6a', .03);
    // skull + snout
    const top = [[-.9, .35], [-.5, .85], [.3, .82], [1.0, .55], [1.8, .4], [2.35, .32], [2.45, .12], [2.2, -.02], [1.2, -.06], [.2, -.1], [-.6, -.15]];
    shape(top, B, .05);
    ctx.save(); polyPath(ctx, catmull(top, true, 3)); ctx.clip(); ctx.fillStyle = SH; ctx.beginPath(); ctx.moveTo(-1, -.2); ctx.lineTo(2.5, -.1); ctx.lineTo(2.5, .12); ctx.lineTo(1.2, .2); ctx.lineTo(-.2, .2); ctx.lineTo(-1, .1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(-.3, .7); ctx.lineTo(.9, .52); ctx.lineTo(1.7, .4); ctx.lineTo(1.6, .47); ctx.lineTo(.6, .65); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(46,106,168,.8)'; ctx.lineWidth = .025; for (const [a2, b2] of [[[.0, .7], [.4, .1]], [[.8, .55], [1.1, .05]], [[1.5, .43], [1.7, .0]]]) { ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); } ctx.restore();
    // brow ridge, eye, nostril, teeth upper, whiskers
    shape([[-.15, .62], [.75, .66], [.55, .78], [-.05, .78]], '#ffffff', .03);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, .35, .46, .5, '#7ff0ff', .8); ctx.restore();
    shape([[.05, .45], [.35, .55], [.62, .46], [.35, .39]], '#e8ffff', .035); ctx.fillStyle = INKC; ctx.beginPath(); ctx.ellipse(.36, .47, .03, .07, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(2.15, .22, .06, 0, TAU); ctx.fillStyle = DP; ctx.fill();
    for (let k = 0; k < 6; k++) { const x = .3 + k * .3; shape([[x, -.06], [x + .08, -.26], [x + .16, -.06]], '#ffffff', .03); }
    for (const [wy, ph] of [[.12, 0], [.02, 1]]) { const wp = []; for (let k = 0; k <= 12; k++) { const u = k / 12; wp.push([2.2 - u * 2.6, wy - u * .5 + Math.sin(u * 6 + t * 4 + ph) * .18]); } inkPts(ctx, wp, .07, INKC, [.05, .9]); inkPts(ctx, wp, .035, '#e8f8ff', [.05, .9]); }
  } else { // FRONT design (head rushing at the camera)
    ctx.scale(s * 1.1, s * 1.1);
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .33, L = 2.1 + hash(k) * .6; shape([[Math.cos(a) * .5, Math.sin(a) * .5], [Math.cos(a - .1) * L, Math.sin(a - .1) * L], [Math.cos(a + .1) * L * .7, Math.sin(a + .1) * L * .7]], k % 2 ? '#e2f6ff' : B, .04); }
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sg * .5, -.7); ctx.bezierCurveTo(sg * 1.1, -1.3, sg * 1.5, -1.5, sg * 2.0, -2.2); ctx.lineWidth = .17; ctx.lineCap = 'round'; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = .1; ctx.strokeStyle = '#e8f8ff'; ctx.stroke(); }
    shape([[-.62, .25], [.62, .25], [.48, .62 + jaw], [0, .8 + jaw], [-.48, .62 + jaw]], '#123a6a', .04);
    for (let k = -2; k <= 2; k++) shape([[k * .18 - .06, .6 + jaw], [k * .18, .42 + jaw * .8], [k * .18 + .06, .6 + jaw]], '#ffffff', .025);
    for (const sg of [-1, 1]) shape([[sg * .42, .25], [sg * .36, .58], [sg * .3, .25]], '#ffffff', .025);
    const skull = [[-1.1, -.6], [-.6, -1.0], [0, -1.12], [.6, -1.0], [1.1, -.6], [.7, 0], [.36, .36], [0, .46], [-.36, .36], [-.7, 0]];
    shape(skull, B, .05);
    ctx.save(); polyPath(ctx, catmull(skull, true, 3)); ctx.clip(); ctx.fillStyle = SH; ctx.beginPath(); ctx.moveTo(1.2, -1.2); ctx.lineTo(.25, -.2); ctx.lineTo(.3, .5); ctx.lineTo(1.2, .5); ctx.closePath(); ctx.fill(); ctx.restore();
    shape([[-.3, -.25], [.3, -.25], [.24, .36], [0, .46], [-.24, .36]], '#e2f6ff', .035);
    for (const sg of [-1, 1]) { ctx.fillStyle = DP; ctx.beginPath(); ctx.arc(sg * .11, .37, .05, 0, TAU); ctx.fill();
      shape([[sg * .08, -.6], [sg * .88, -.88], [sg * .95, -.72], [sg * .14, -.48]], '#ffffff', .03);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sg * .5, -.5, .4, '#7ff0ff', .8); ctx.restore();
      shape([[sg * .2, -.44], [sg * .68, -.64], [sg * .76, -.5], [sg * .32, -.37]], '#e8ffff', .035); ctx.fillStyle = INKC; ctx.beginPath(); ctx.ellipse(sg * .5, -.49, .025, .065, sg * .4, 0, TAU); ctx.fill();
      const wp = []; for (let k = 0; k <= 12; k++) { const u = k / 12; wp.push([sg * (.3 + u * 1.6), .3 + u * .6 + Math.sin(u * 6 + t * 4) * .12]); } inkPts(ctx, wp, .06, INKC, [.05, .9]); inkPts(ctx, wp, .03, '#e8f8ff', [.05, .9]); }
  }
  ctx.restore();
}
function iceDragonPath(c, t, o = {}) { // helper: serpentine path rushing toward +dir
  const n = o.n || 14, dir = vNorm(o.dir || [0, 0, 1]), up = [0, 1, 0], side = vCross(dir, up), len = o.len || 14, head = o.head == null ? 1 : o.head; const pts = [];
  for (let i = 0; i < n; i++) { const v = i / (n - 1), s = (v - 1) * len + head * len; pts.push(vAdd(c, vAdd(vMul(dir, s), vAdd(vMul(side, Math.sin(v * 5 - t * 5) * (o.wave || 1.2) * (1 - v * .5)), vMul(up, Math.cos(v * 4 - t * 4) * (o.wave || 1.2) * .6 + (o.rise || 0) * v))))); }
  return pts;
}
function fxIceGrowth(ctx, c, t, o = {}) { // crystals erupting from the ground in a cluster / line
  const n = o.n || 14, seed = o.seed || 101; const items = [];
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = (o.r || 2.5) * Math.sqrt(hash(seed + i * 3)); const st = (o.line ? hash(seed + i * 3) : d / (o.r || 2.5)) * (o.spread || .4); const u = easeBack(clamp((t - st) / .25, 0, 1)); if (u <= 0) continue;
    const p = o.line ? vLerp(o.line[0], o.line[1], hash(seed + i * 3)) : [c[0] + Math.cos(a) * d, 0, c[2] + Math.sin(a) * d]; items.push({ p, h: (o.h || 3) * (.4 + hash(seed + i * 5) * .8) * u, r: (o.w || .5) * (.5 + hash(seed + i * 7)), tilt: [(hash(seed + i * 9) - .5) * .7, (hash(seed + i * 11) - .5) * .7], z: camDepth(p) }); }
  items.sort((a, b) => b.z - a.z); const pal = PALETTES.ice;
  for (const it of items) drawIceSpike(ctx, it.p, it.h, it.r, pal, seed + Math.round(it.p[0] * 13), it.tilt);
}
function fxFrost(ctx, c, t, o = {}) { // frost spreading on the ground: crystalline star cracks + white sheet
  const R = (o.r || 6) * easeOut(clamp(t / (o.dur || .6), 0, 1)); const pts = ringPts([c[0], .005, c[2]], R, [0, 1, 0], 40).map((p, i) => vLerp([c[0], .005, c[2]], p, .85 + .15 * hash(i + (o.seed || 0))));
  const sp = projPoly(pts); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = 'rgba(225,246,255,.7)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(70,130,190,.8)'; ctx.stroke(); }
  fxCracks(ctx, c, t, { r: R, n: 16, col: '#4a8ac0', w: 2.2, seed: (o.seed || 0) + 111, dur: o.dur || .6 });
}
function fxSnow(ctx, t, o = {}) { const n = o.n || 160, seed = o.seed || 121; ctx.fillStyle = o.col || '#ffffff'; for (let i = 0; i < n; i++) { const x = ((hash(seed + i) * W + t * (o.wind || 40) + Math.sin(t + i) * 20) % W + W) % W, y = ((hash(seed + i * 3) * H + t * (60 + hash(i) * 80)) % H), r = 1 + hash(i * 7) * (o.size || 3); ctx.globalAlpha = .5 + hash(i * 9) * .5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
// Katen Kyokotsu: swirling flowers/petals around Kyoraku (game-themed), pink + white blossoms
function fxFlowerSwirl(ctx, t, o = {}) { fxPetals(ctx, t, Object.assign({ n: 500, col: '#ff8fb6', col2: '#ffffff', size: .07, flow: petalVortex({ c: o.c || [0, 1, 0], r: o.r || 2.4, h: o.h || 3, spin: o.spin || 1 }) }, o)); }
// Kageoni: a pool of shadow on the ground with a blade emerging from it
function fxShadowPool(ctx, c, t, o = {}) {
  const R = (o.r || 1.5) * easeOut(clamp(t / .3, 0, 1)); const pts = ringPts([c[0], .006, c[2]], R, [0, 1, 0], 36).map((p, i) => vLerp([c[0], .006, c[2]], p, .8 + .2 * Math.sin(i * 1.7 + t * 4)));
  const sp = projPoly(pts); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = 'rgba(8,4,14,.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,60,140,.7)'; ctx.stroke(); }
  if (o.blade) { const u = easeSnap(clamp((t - (o.bladeAt || .2)) / .12, 0, 1)); if (u > 0) { const base = [c[0], 0, c[2]], tip = vAdd(base, vMul(vNorm(o.blade), 1.6 * u)); const side = vMul(vNorm(vCross(o.blade, toCam(base))), .09); const p2 = projPoly([vAdd(base, side), tip, vSub(base, side)]); if (p2.length > 2) { polyPath(ctx, p2); ctx.fillStyle = '#2a2630'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#c8ccd8'; ctx.stroke(); } } }
}
// Karamatsu Shinju: tattered drapes falling over the scene (screen space) + gloom
function fxDrapes(ctx, t, o = {}) {
  const n = o.n || 9, seed = o.seed || 131, drop = easeOut(clamp(t / (o.dur || 1.2), 0, 1));
  for (let i = 0; i < n; i++) { const x0 = (i + .5) / n * W + (hash(seed + i) - .5) * 120, w = W / n * (.7 + hash(seed + i * 3) * .6), len = H * (.35 + hash(seed + i * 5) * .7) * drop;
    ctx.beginPath(); ctx.moveTo(x0 - w / 2, -10); const N = 10; for (let k = 0; k <= N; k++) { const v = k / N; ctx.lineTo(x0 - w / 2 + Math.sin(v * 4 + t * 1.2 + i) * 12 * v, len * v); }
    for (let k = 0; k <= 8; k++) { const xx = x0 + w / 2 - k / 8 * w, yy = len + (hash(seed + i * 7 + k) - .2) * 60 * drop; ctx.lineTo(xx + Math.sin(t + k) * 6, yy); }
    ctx.lineTo(x0 + w / 2, -10); ctx.closePath(); ctx.fillStyle = mixHex(o.col || '#3a1a2a', '#000000', hash(i) * .4); ctx.globalAlpha = o.alpha || .92; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = '#120810'; ctx.stroke();
    ctx.strokeStyle = rgba('#7a3a5a', .5); ctx.lineWidth = 1.5; for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x0 - w / 2 + k * w / 3, 0); ctx.lineTo(x0 - w / 2 + k * w / 3 + Math.sin(t + k) * 8, len * .9); ctx.stroke(); } }
}
// Suzumushi: concentric sound rings expanding from the blade ring
function fxSoundRings(ctx, p, t, o = {}) {
  const q = P2(p); if (!q) return; const n = o.n || 6, per = o.per || .45, maxR = (o.r || 6) * q.s;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const u = ((t / per + i / n) % 1); const r = maxR * u; ctx.lineWidth = (o.w || 5) * (1 - u); ctx.strokeStyle = rgba(o.col || '#e8e2ff', .9 * (1 - u));
    ctx.setLineDash([r * .18, r * .06]); ctx.beginPath(); ctx.ellipse(q.x, q.y, r, r * (o.flat || .85), 0, 0, TAU); ctx.stroke(); }
  ctx.setLineDash([]); ctx.restore();
}
// Benihiko: a volley of blades appearing in the air and firing at a target
function fxBenihiko(ctx, t, o = {}) {
  const n = o.n || 30, seed = o.seed || 141, from = o.c || [0, 2, 0], to = o.target || [0, 1, -6], fire = o.fire || .5;
  const items = [];
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, r = (o.r || 2.4) * (.5 + hash(seed + i * 3) * .6); const home = vAdd(from, [Math.cos(a) * r, Math.sin(a) * r * .7 + 1, (hash(seed + i * 5) - .5) * 1.2]);
    const app = clamp((t - hash(seed + i * 7) * .3) / .15, 0, 1); if (app <= 0) continue; const fu = clamp((t - fire - hash(seed + i * 9) * .25) / .2, 0, 1);
    const pos = vLerp(home, vAdd(to, [(hash(i) - .5) * 1.5, (hash(i * 3) - .5), 0]), easeIn(fu)); const dir = vNorm(vSub(to, home)); items.push({ pos, dir, app, z: camDepth(pos) }); }
  items.sort((a, b) => b.z - a.z);
  for (const it of items) { const side = vMul(vNorm(vCross(it.dir, toCam(it.pos))), .045), L = .9 * it.app; const sp = projPoly([vAdd(it.pos, side), vMad(it.pos, it.dir, L), vSub(it.pos, side), vMad(it.pos, it.dir, -L * .35)]); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = '#eef0ff'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); }
}
// Enma Korogi: the hilt ring splits into 10 kanji rings that spread, then the black dome
function fxEnmaRings(ctx, c, t, o = {}) {
  const R = (o.r || 5) * easeOut(clamp(t / (o.dur || .8), 0, 1)), rise = Math.sin(clamp(t / (o.dur || .8), 0, 1) * Math.PI) * 1.5;
  const K = '閻魔蟋蟀鈴虫終式無明盲';
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .5, p = [c[0] + Math.cos(a) * R, c[1] + rise + .5, c[2] + Math.sin(a) * R]; const q = project(p); if (!q) continue; const rr = .32 * q.s;
    ctx.lineWidth = Math.max(2, .06 * q.s); ctx.strokeStyle = LIGHT.ink; ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, TAU); ctx.stroke(); ctx.lineWidth = Math.max(1, .035 * q.s); ctx.strokeStyle = '#d8d8e8'; ctx.stroke();
    ctx.fillStyle = '#d8d8e8'; ctx.font = `900 ${Math.max(8, rr * .9)}px "IPAGothic", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(K[i], q.x, q.y); }
}
function fxEnmaDome(ctx, c, t, o = {}) { // black hemisphere expanding from c (seen from outside)
  const R = (o.r || 18) * easeInOut(clamp(t / (o.dur || 1.2), 0, 1)); if (R < .05) return;
  const surf = { nu: 32, nv: 10, wrapU: true, v0: .5, fn: (u, v) => { const th = u * TAU, ph = (v - .5) * Math.PI; return [c[0] + Math.cos(ph) * Math.sin(th) * R, c[1] + Math.sin(ph) * R, c[2] + Math.cos(ph) * Math.cos(th) * R]; } };
  const G = sampleSurf(surf); drawSurf(ctx, G, { col: '#07060c', flat: true, ink: true, inkCol: '#4a4060', inkW: 2, borders: { v0: false, v1: false } });
  // faint ring bands on the dome
  for (const vv of [.6, .75, .9]) { const uv = []; for (let i = 0; i <= 40; i++) uv.push([i / 40, vv]); strokeRuns(ctx, surfLine(surf, uv), 1.5, 'rgba(110,100,150,.5)'); }
}
// Ashisogi Jizo poison: purple-green gas puffs, drips
function fxPoison(ctx, p, t, o = {}) { fxSmoke(ctx, p, t, Object.assign({ n: 12, size: 1.6, col: '#a46ad0', shade: '#5a2a7a', rise: .5, spread: 1.6, dur: 2.2, seed: 151 }, o)); fxSmoke(ctx, p, t - .2, Object.assign({ n: 7, size: 1.1, col: '#9adf6a', shade: '#4a7a3a', rise: .7, spread: 1.2, dur: 2, seed: 157, alpha: .8 }, o)); }
// Konjiki Ashisogi Jizo (drawn hand2d on 3D anchors): giant segmented caterpillar rearing up like a cobra, red cloak,
// grotesque golden infant head with chubby arms, silver halo with four bells, blades from the chest, poison breath.
// o: { c: base (world), yaw, scale (1 ~ 9 m tall), rise 0..1, gas (time since the breath started), mouth 0..1, t }
function ribbon2D(pts, ws) { const L = [], R = []; const n = pts.length; for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; L.push([pts[i][0] - dy * ws[i], pts[i][1] + dx * ws[i]]); R.push([pts[i][0] + dy * ws[i], pts[i][1] - dx * ws[i]]); } return { L, R, poly: L.concat(R.slice().reverse()) }; }
function fxKonjiki(ctx, t, o = {}) {
  const c = o.c || [0, 0, -6], s = o.scale || 1, rise = o.rise == null ? 1 : o.rise, M = mRotY(o.yaw || 0), INKC = '#1a0e0a';
  const W3 = (x, y, z) => vAdd(c, mApply(M, [x * s, y * s, z * s]));
  // body spline: tail far back on the ground -> rearing torso -> neck under the head
  const n = 16, spine = [], rad = [];
  for (let i = 0; i < n; i++) { const v = i / (n - 1), up = smooth(clamp((v - .35) / .65, 0, 1)) * rise;
    spine.push(W3(Math.sin(v * 4.2 + t * 1.2) * .7 * (1 - up), .9 + up * 6.2 + Math.sin(t * 2 + v * 3) * .1, -9 + v * 9 - up * 1.2)); rad.push((1.25 + .35 * Math.sin(v * Math.PI)) * (1 - v * .25)); }
  const sp = spine.map(p => proj2(p)), ws = spine.map((p, i) => rad[i] * s * pxScale(p));
  const head3 = vAdd(spine[n - 1], mApply(M, [0, 1.6 * s * rise + .3 * s, .5 * s])), hp = proj2(head3), hs = pxScale(head3) * s * 1.4;
  const ld = [-.6, -.8];
  // halo + bells (behind)
  const hc = vAdd(head3, mApply(M, [0, .4 * s, -1.0 * s])); const hcp = proj2(hc), hr = 3.3 * pxScale(hc) * s, rot = t * .3;
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(hcp[0], hcp[1], hr, hr * .96, 0, 0, TAU); ctx.lineWidth = hr * .13 + 6; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = hr * .13; ctx.strokeStyle = '#d8dde8'; ctx.stroke(); ctx.lineWidth = hr * .04; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(hcp[0], hcp[1], hr * .98, hr * .94, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  for (let i = 0; i < 4; i++) { const a = rot + i * HP + .4, bx = hcp[0] + Math.cos(a) * hr, by = hcp[1] + Math.sin(a) * hr * .96, br = hr * .14; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + br * .9); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); ctx.beginPath(); ctx.moveTo(bx - br, by + br * 2.2); ctx.quadraticCurveTo(bx - br, by + br * .7, bx, by + br * .7); ctx.quadraticCurveTo(bx + br, by + br * .7, bx + br, by + br * 2.2); ctx.closePath(); ctx.fillStyle = '#c8ccd8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(bx - br * .6, by + br * 1.1, br * .3, br * .8); }
  ctx.restore();
  // cloak back panel (behind the body)
  const shoulder = vAdd(spine[n - 1], mApply(M, [0, .4 * s, -.3 * s])), shp = proj2(shoulder), cw = 3.4 * pxScale(shoulder) * s, ch = 5.5 * pxScale(shoulder) * s;
  const sway = Math.sin(t * 1.4) * cw * .05;
  ctx.beginPath(); ctx.moveTo(shp[0] - cw * .35, shp[1] - ch * .12); ctx.quadraticCurveTo(shp[0] - cw * 1.1, shp[1] + ch * .4, shp[0] - cw * .9 + sway, shp[1] + ch); for (let k = 0; k <= 8; k++) ctx.lineTo(shp[0] - cw * .9 + k / 8 * cw * 1.8 + sway, shp[1] + ch + (k % 2 ? -ch * .06 : ch * .03)); ctx.quadraticCurveTo(shp[0] + cw * 1.1, shp[1] + ch * .4, shp[0] + cw * .35, shp[1] - ch * .12); ctx.closePath();
  ctx.fillStyle = '#6a0c1c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INKC; ctx.stroke();
  // body ribbon with segments, cel shadow on the far side, legs (little hands) along the underside
  const rb = ribbon2D(sp, ws);
  for (let i = 1; i < n - 2; i++) { if (i % 2) continue; for (const sg of [1, -1]) { const e = sg > 0 ? rb.L[i] : rb.R[i], dx = e[0] - sp[i][0], dy = e[1] - sp[i][1], ex = e[0] + dx * .35, ey = e[1] + dy * .35 + ws[i] * .4; ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.quadraticCurveTo(ex, ey - ws[i] * .2, ex, ey); ctx.lineWidth = ws[i] * .28 + 4; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = ws[i] * .28; ctx.strokeStyle = '#d8a848'; ctx.stroke(); ctx.beginPath(); ctx.arc(ex, ey, ws[i] * .16, 0, TAU); ctx.fillStyle = '#e8bc58'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INKC; ctx.stroke(); } }
  polyPath(ctx, catmull(rb.poly, true, 2)); ctx.fillStyle = '#e2b24a'; ctx.fill();
  ctx.save(); ctx.clip();
  polyPath(ctx, sp.concat(rb.R.slice().reverse())); ctx.fillStyle = '#b07a28'; ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,10,.55)'; ctx.lineWidth = 2.2; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(rb.L[i][0], rb.L[i][1]); ctx.quadraticCurveTo(sp[i][0] + (rb.L[i][1] - rb.R[i][1]) * .1, sp[i][1] + ws[i] * .25, rb.R[i][0], rb.R[i][1]); ctx.stroke(); }
  polyPath(ctx, rb.L.map((p, i) => [lerp(p[0], sp[i][0], .4), lerp(p[1], sp[i][1], .4)]).concat(rb.L.slice().reverse())); ctx.fillStyle = 'rgba(255,240,180,.45)'; ctx.fill();
  ctx.restore();
  inkPts(ctx, catmull(rb.L, false, 3), 5, INKC, [.05, .05]); inkPts(ctx, catmull(rb.R, false, 3), 7, INKC, [.05, .05]);
  // blades from the chest
  const chest = spine[n - 3], cp = proj2(chest), cs = pxScale(chest) * s;
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45, L = (1.8 + hash(k) * .8) * cs, x0 = cp[0] + Math.cos(a) * ws[n - 3] * .4, y0 = cp[1] + ws[n - 3] * .2; ctx.beginPath(); ctx.moveTo(x0 - 6, y0); ctx.quadraticCurveTo(x0 + Math.cos(a + .5) * L * .6, y0 + Math.sin(a + .5) * L * .6 + L * .5, x0 + Math.cos(a) * L * .2, y0 + L); ctx.lineTo(x0 + 6, y0); ctx.closePath(); ctx.fillStyle = '#dfe4ec'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); }
  // cloak front flaps over the shoulders
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(shp[0] + sg * cw * .1, shp[1] - ch * .16); ctx.quadraticCurveTo(shp[0] + sg * cw * .75, shp[1] - ch * .08, shp[0] + sg * cw * .95 + sway, shp[1] + ch * .55); ctx.lineTo(shp[0] + sg * cw * .55 + sway, shp[1] + ch * .62); ctx.quadraticCurveTo(shp[0] + sg * cw * .5, shp[1] + ch * .1, shp[0] + sg * cw * .05, shp[1]); ctx.closePath(); ctx.fillStyle = '#c4243c'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#8a1428'; ctx.fillRect(shp[0] + (sg > 0 ? cw * .5 : -cw * 1.2), shp[1] - ch, cw * .7, ch * 2); ctx.restore(); ctx.lineWidth = 4; ctx.strokeStyle = INKC; ctx.stroke(); }
  // chubby infant arms reaching forward
  for (const sg of [-1, 1]) { const a0 = [hp[0] + sg * hs * .9, hp[1] + hs * 1.5], a1 = [hp[0] + sg * hs * 1.9, hp[1] + hs * 2.1 + Math.sin(t * 3 + sg) * hs * .1], a2 = [hp[0] + sg * hs * 2.3, hp[1] + hs * 1.3];
    ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.quadraticCurveTo(a1[0], a1[1], a2[0], a2[1]); ctx.lineCap = 'round'; ctx.lineWidth = hs * .62 + 6; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = hs * .62; ctx.strokeStyle = '#e8bc58'; ctx.stroke();
    for (let f2 = 0; f2 < 4; f2++) { const fa = -Math.PI / 2 + sg * (.2 + f2 * .35); ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(a2[0] + Math.cos(fa) * hs * .5 * sg, a2[1] + Math.sin(fa) * hs * .5); ctx.lineWidth = hs * .2 + 5; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = hs * .2; ctx.strokeStyle = '#f0c868'; ctx.stroke(); } }
  // infant head
  const R = hs * 1.35; ctx.save(); ctx.beginPath(); ctx.ellipse(hp[0], hp[1], R, R * 1.05, 0, 0, TAU); ctx.fillStyle = '#f0c45a'; ctx.fill(); ctx.clip();
  ctx.beginPath(); ctx.ellipse(hp[0] - ld[0] * R * .25, hp[1] - ld[1] * R * .25, R, R * 1.05, 0, 0, TAU); ctx.rect(hp[0] - R * 3, hp[1] - R * 3, R * 6, R * 6); ctx.fillStyle = '#c08a2a'; ctx.fill('evenodd');
  ctx.fillStyle = 'rgba(255,250,210,.5)'; ctx.beginPath(); ctx.ellipse(hp[0] - R * .35, hp[1] - R * .45, R * .35, R * .22, -.5, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(hp[0], hp[1], R, R * 1.05, 0, 0, TAU); ctx.lineWidth = Math.max(3, R * .04); ctx.strokeStyle = INKC; ctx.stroke();
  // face: drooping lidded eyes with purple shadow, tiny pupils, open wailing mouth
  const mo = o.mouth == null ? .5 + .3 * Math.sin(t * 2.3) : o.mouth;
  for (const sg of [-1, 1]) { const ex = hp[0] + sg * R * .38, ey = hp[1] - R * .08; ctx.fillStyle = 'rgba(140,70,170,.55)'; ctx.beginPath(); ctx.ellipse(ex, ey - R * .02, R * .3, R * .2, sg * .2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.ellipse(ex, ey + R * .02, R * .22, R * .1, sg * .25, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#2a0a10'; ctx.beginPath(); ctx.arc(ex + sg * R * .03, ey + R * .06, R * .035, 0, TAU); ctx.fill();
    inkPts(ctx, [[ex - R * .26, ey - R * .02 + sg * R * .03], [ex, ey - R * .06], [ex + R * .26, ey + R * .02 - sg * R * .03]], R * .06, INKC, [.2, .3]); }
  ctx.beginPath(); ctx.ellipse(hp[0], hp[1] + R * .45, R * (.22 + mo * .12), R * (.1 + mo * .22), 0, 0, TAU); ctx.fillStyle = '#4a0a18'; ctx.fill(); ctx.lineWidth = R * .04; ctx.strokeStyle = INKC; ctx.stroke(); ctx.fillStyle = '#c0405a'; ctx.beginPath(); ctx.ellipse(hp[0], hp[1] + R * (.5 + mo * .12), R * .14, R * .06 * (1 + mo), 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(230,110,120,.45)'; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hp[0] + sg * R * .62, hp[1] + R * .25, R * .16, R * .1, 0, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(hp[0] - R * .05, hp[1] + R * .18); ctx.quadraticCurveTo(hp[0], hp[1] + R * .24, hp[0] + R * .05, hp[1] + R * .18); ctx.lineWidth = R * .03; ctx.strokeStyle = INKC; ctx.stroke();
  // hood edge of the cloak over the top of the head
  ctx.beginPath(); ctx.moveTo(hp[0] - R * 1.15, hp[1] + R * .2); ctx.quadraticCurveTo(hp[0] - R * 1.2, hp[1] - R * 1.45, hp[0], hp[1] - R * 1.35); ctx.quadraticCurveTo(hp[0] + R * 1.2, hp[1] - R * 1.45, hp[0] + R * 1.15, hp[1] + R * .2); ctx.quadraticCurveTo(hp[0] + R * .9, hp[1] - R * .9, hp[0], hp[1] - R * .98); ctx.quadraticCurveTo(hp[0] - R * .9, hp[1] - R * .9, hp[0] - R * 1.15, hp[1] + R * .2); ctx.closePath(); ctx.fillStyle = '#c4243c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INKC; ctx.stroke();
  if (o.gas) fxPoison(ctx, vAdd(head3, mApply(M, [0, -1.6 * s, 3.2 * s])), o.gas, { size: 1.7 * s, alpha: .85 });
}
// Kenpachi: skull-shaped yellow reiatsu above/behind him
function fxSkullAura(ctx, p, t, o = {}) {
  const q = P2(p); if (!q) return; const s = (o.size || 3) * q.s, tf = onN(t, 2), col = o.col || '#ffd84a', a = o.alpha == null ? .9 : o.alpha;
  ctx.save(); ctx.translate(q.x, q.y); ctx.globalAlpha = a;
  // flame silhouette
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU, r = s * (.9 + .25 * Math.sin(an * 7 + tf * 12) + .15 * hash(i + Math.floor(tf * FPS))); const x = Math.cos(an) * r * .8, y = Math.sin(an) * r * (an > Math.PI ? 1.25 : .9); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath();
  ctx.fillStyle = rgba(col, .75); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba('#7a4a00', .8); ctx.stroke();
  // skull: eye sockets, nose, teeth (negative space)
  ctx.fillStyle = rgba('#2a1400', .85); for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sg * s * .3, -s * .1, s * .2, s * .16, sg * .3, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(0, s * .1); ctx.lineTo(s * .08, s * .28); ctx.lineTo(-s * .08, s * .28); ctx.closePath(); ctx.fill();
  for (let i = -3; i <= 3; i++) ctx.fillRect(i * s * .1 - s * .035, s * .42, s * .07, s * .16);
  ctx.restore();
}
// massive crescent slash wave travelling along dir (Kenpachi Kendo / big swings)
function fxCrescent(ctx, c, dir, t, o = {}) {
  const u = t / (o.dur || .5); if (u < 0 || u > 1.2) return; const d = vNorm(dir), up = o.up || [0, 1, 0], side0 = vNorm(vCross(d, up));
  const side = mApply(mAxis(d, o.tilt || 0), side0);
  const pos = vMad(c, d, (o.dist || 12) * easeOut(clamp(u, 0, 1))), R = (o.r || 3) * (1 + u * .5), fade = 1 - clamp((u - .8) / .4, 0, 1);
  const arc = (rs, rd, off) => { const a = []; for (let i = 0; i <= 24; i++) { const an = (i / 24 - .5) * Math.PI * .95; a.push(vAdd(pos, vAdd(vMul(side, Math.sin(an) * R * rs), vMul(d, Math.cos(an) * R * rd + off)))); } return a; };
  const outer = arc(1, .5, 0), inner = arc(.9, .18, -R * .02), core = arc(.86, .36, 0);
  const sp = projPoly(outer.concat(inner.reverse())); if (sp.length < 3) return;
  ctx.save(); ctx.globalAlpha = fade; polyPath(ctx, sp); ctx.fillStyle = o.col || '#ffe36a'; ctx.fill(); ctx.lineWidth = o.ink || 4; ctx.strokeStyle = o.inkCol || '#5a3a00'; ctx.stroke();
  const cp = projPoly(outer.slice(3, 22).concat(core.slice(3, 22).reverse())); if (cp.length > 2) { polyPath(ctx, cp); ctx.fillStyle = o.core || '#fffbe0'; ctx.fill(); }
  ctx.restore();
}
function fxGroundSplit(ctx, a, b, t, o = {}) { // crevasse torn along the ground from a to b (world points)
  const u = easeOut(clamp(t / (o.dur || .35), 0, 1)); const end = vLerp(a, b, u), n = 24, w = o.w || 1.2;
  const d = vNorm(vSub(b, a)), side = vNorm(vCross(d, [0, 1, 0])); const L = [], R2 = [];
  for (let i = 0; i <= n; i++) { const v = i / n, p = vLerp(a, end, v), ww = w * Math.sin(v * Math.PI * .9 + .1) * (.6 + hash(i + (o.seed || 0)) * .6); L.push(vAdd(vMad(p, side, ww), [0, .01, 0])); R2.push(vAdd(vMad(p, side, -ww), [0, .01, 0])); }
  const sp = projPoly(L.concat(R2.reverse())); if (sp.length < 3) return; polyPath(ctx, sp); ctx.fillStyle = '#120a10'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = o.glow || '#3a2a30'; ctx.stroke();
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 8; ctx.strokeStyle = rgba(o.glow, .5); ctx.stroke(); ctx.restore(); }
  fxDebris(ctx, end, (t * 3) % 1, { n: 6, seed: Math.floor(t * 8), speed: 4, size: .15 });
}
