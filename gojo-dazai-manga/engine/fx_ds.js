/* engine/fx_ds.js (E1) - Demon Slayer effects: Flame Breathing (Rengoku) and Destructive Death (Akaza).
   Ufotable-style fire = layered flat flame shapes (deep red ink edge -> orange -> yellow -> white core) with
   tongues that peel off, curl and flicker on twos.  All positions are world points (projected) unless noted.
   FIRE PRIMITIVES
     fireRibbon(g, pts, w, t, o)        flame band along a 3D centreline (w = half width in metres, number or fn(u))
     flameTongue(g, x, y, w, h, ang, cols, seed)  one screen-space flame tongue (base at x,y, pointing ang)
     arcPts(c, ax1, ax2, r, a0, a1, n)  points on a circular arc in the plane (ax1, ax2)
   FLAME BREATHING (炎の呼吸)
     fxFlameTrail(g, F, t, {span, w, sword2})     fire trail behind the figure's real sword motion
     fxFlameBurst(g, p, t, {size, dur})           flame explosion / impact
     fxUnknowingFire(g, a, b, t, {dur, w})        壱ノ型 不知火 Unknowing Fire: dash slash leaving a flame wake a -> b
     fxRisingSun(g, c, t, {r, yaw, dur})          弐ノ型 昇り炎天 Rising Scorching Sun: rising vertical flame crescent
     fxBlazingUniverse(g, c, t, {r, yaw, dur})    参ノ型 気炎万象 Blazing Universe: overhead downward flame wheel
     fxFlameUndulation(g, c, t, {r, dur})         肆ノ型 盛炎のうねり Blooming Flame Undulation: protective swirling flame wall
     fxFlameTiger(g, p, dir, t, {scale, dur})     伍ノ型 炎虎 Flame Tiger: a roaring tiger of fire lunging along dir
     fxRengokuNinth(g, a, b, t, {r, dur})         玖ノ型 煉獄 Rengoku: the all-consuming flame charge a -> b
     fxEmbers(g, t, {n, c, r, h, col})            drifting embers
   DESTRUCTIVE DEATH (破壊殺)
     fxCompass(g, c, t, {r, rot, alpha, col})     破壊殺・羅針 Compass Needle: snowflake compass on the ground
     fxAirType(g, p, dir, t, {n, len, r})         破壊殺・空式 Air Type: punches that fly as air-pressure shock cones
     fxRanshiki(g, p, dir, t, {n, r})             破壊殺・乱式 Disordered: a storm of fist impacts
     fxAnnihilation(g, p, dir, t, {size})         破壊殺・滅式 Annihilation Type: one point-blank killing blow (blue-white burst)
     fxBlueSilver(g, c, t, {r})                   終式 青銀乱残光 Blue Silver Chaotic Afterglow: 360° burst of countless strikes
     fxAshDrift(g, c, t, {n, r, h})               demon ash dissolving into the dawn                                     */
'use strict';
const FIRE_COLS = ['#b8160e', '#f0601c', '#ffb22a', '#fff2b8'];
function arcPts(c, ax1, ax2, r, a0, a1, n = 24) { const out = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); out.push(vAdd(c, vAdd(vMul(ax1, Math.cos(a) * r), vMul(ax2, Math.sin(a) * r)))); } return out; }
function flameTongue(g, x, y, w, h, ang, cols = FIRE_COLS, seed = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); const sw = (hash(seed) - .5) * .5;
  for (let j = 0; j < cols.length; j++) { const k = 1 - j * .24, ww = w * k, hh = h * (1 - j * .2);
    g.beginPath(); g.moveTo(-ww, 0); g.bezierCurveTo(-ww * 1.1, -hh * .45, sw * ww * 2 - ww * .2, -hh * .7, sw * ww * 3, -hh); g.bezierCurveTo(ww * .35 + sw * ww, -hh * .6, ww * 1.15, -hh * .4, ww, 0); g.closePath(); g.fillStyle = cols[j]; g.fill(); }
  g.restore();
}
// flame band along a projected 3D path; edges broken into tongues that flicker on twos
function fireRibbon(g, pts, w, t, o = {}) {
  const sp = pts.map(p => project(p)).filter(Boolean); if (sp.length < 2) return; const n = sp.length, fi = Math.floor(t * 24 / (o.timing || 2)), cols = o.cols || FIRE_COLS, seed = o.seed || 1;
  const wAt = i => (typeof w === 'function' ? w(i / (n - 1)) : w) * sp[i].s;
  const L = [], R = [];
  for (let i = 0; i < n; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)]; let dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; L.push([sp[i].x, sp[i].y, -dy, dx]); R.push([sp[i].x, sp[i].y, dy, -dx]); }
  g.save(); g.lineJoin = 'round';
  for (let j = 0; j < cols.length; j++) { const k = 1 - j * .26; const poly = [];
    for (let i = 0; i < n; i++) { const ww = wAt(i) * k * (1 + (o.up ? .6 : .25) * Math.sin(i * 2.1 + fi * 1.7 + seed) * (j ? .6 : 1)); const tongue = (i % 2 === 0 && j < 2) ? 1 + .9 * hash(seed + i * 7 + fi * 13) : 1; poly.push([L[i][0] + L[i][2] * ww * tongue, L[i][1] + L[i][3] * ww * tongue]); }
    for (let i = n - 1; i >= 0; i--) { const ww = wAt(i) * k * (o.thin ? .35 : .8); poly.push([R[i][0] + R[i][2] * ww, R[i][1] + R[i][3] * ww]); }
    polyPath(g, catmull(poly, true, 2)); g.fillStyle = cols[j]; g.globalAlpha = o.alpha == null ? 1 : o.alpha; g.fill();
    if (j === 0 && o.ink !== false) { g.lineWidth = Math.max(1.5, wAt(Math.floor(n / 2)) * .06); g.strokeStyle = o.inkCol || '#5a0806'; g.stroke(); } }
  // tongues peeling off the top edge
  const nt = o.tongues == null ? Math.floor(n * .8) : o.tongues;
  for (let i = 0; i < nt; i++) { const idx = Math.floor(hash(seed * 3 + i * 5) * n), life = ((t * 2.2 + hash(i * 11 + seed)) % 1); const ww = wAt(idx); if (ww < 2) continue; const ox = L[idx][2], oy = L[idx][3];
    const x = L[idx][0] + ox * ww * (1 + life * 1.6), y = L[idx][1] + oy * ww * (1 + life * 1.6) - life * ww * 1.2; g.globalAlpha = (o.alpha == null ? 1 : o.alpha) * (1 - life);
    flameTongue(g, x, y, ww * .35 * (1 - life * .6), ww * (.9 + hash(i) * .6), Math.atan2(ox, -oy) * .5, cols.slice(0, 3), i + fi); }
  g.restore();
}
function fxFlameTrail(g, F, t, o = {}) {
  const span = o.span || .14, n = 10, tips = [], mids = [];
  for (let i = 0; i <= n; i++) { const s = swordAt(F, t - span * i / n, o.sword2); if (!s) return; tips.push(vLerp(s.base, s.tip, 1.05)); mids.push(vLerp(s.base, s.tip, .55)); }
  if (vDist(tips[0], tips[n]) < .15) return;
  const path = tips.map((p, i) => vLerp(p, mids[i], .35));
  fireRibbon(g, path, u => (o.w || .32) * (1 - u * .75), t, { seed: 7, up: true });
}
function fxFlameBurst(g, p, t, o = {}) {
  const dur = o.dur || .8, u = t / dur; if (u < 0 || u > 1) return; const q = P2(p); if (!q) return; const R = (o.size || 2) * q.s * easeOut(u * 1.6), fi = Math.floor(t * 12);
  g.save(); if (u < .15) { g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 2, '#ffb040', .8 * (1 - u / .15)); g.globalCompositeOperation = 'source-over'; }
  const nT = o.n || 18; g.globalAlpha = 1 - smooth((u - .55) / .45);
  for (let i = 0; i < nT; i++) { const a = i / nT * TAU + hash(i) * .4, d = R * (.3 + .4 * hash(i * 3)); flameTongue(g, q.x + Math.cos(a) * d * .5, q.y + Math.sin(a) * d * .5, R * .22, R * (.5 + .5 * hash(i * 7 + fi)), a + HP, FIRE_COLS, i + fi); }
  blobPath(g, q.x, q.y - R * .1, R * .45 * (1 - u * .4), 3 + fi, 10, .25); g.fillStyle = '#fff4c0'; g.fill();
  g.restore();
}
function fxUnknowingFire(g, a, b, t, o = {}) {
  const dur = o.dur || 1.1, u = t / dur; if (t < 0 || u > 1) return; const head = easeSnap(clamp(t / .14, 0, 1)), tail = smooth((u - .35) / .65);
  const pts = []; for (let i = 0; i <= 20; i++) { const s = lerp(tail, head, i / 20); pts.push(vAdd(vLerp(a, b, s), [0, Math.sin(s * 9) * .08, 0])); }
  fireRibbon(g, pts, uu => (o.w || .55) * Math.sin(Math.PI * clamp(uu * 1.1, 0, 1)) * (1 - tail * .6), t, { seed: 3, up: true, alpha: 1 - smooth((u - .7) / .3) });
  if (t < .2) { const qa = P2(a), qb = P2(vLerp(a, b, head)); if (qa && qb) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,240,190,.9)'; g.lineWidth = 6; g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(qb.x, qb.y); g.stroke(); g.restore(); } }
}
function fxRisingSun(g, c, t, o = {}) {
  const dur = o.dur || 1.0, u = t / dur; if (t < 0 || u > 1) return; const yaw = o.yaw || 0, ax1 = [Math.cos(yaw), 0, -Math.sin(yaw)], R = o.r || 1.6; const sw = easeSnap(clamp(t / .18, 0, 1));
  const pts = arcPts(vAdd(c, [0, R * .2, 0]), vMul(ax1, 1), [0, 1, 0], R, -2.4 + 0, lerp(-2.4, .9, sw), 24).map(p => vAdd(p, vMul([Math.sin(yaw), 0, Math.cos(yaw)], .15)));
  fireRibbon(g, pts, uu => (o.w || .35) * Math.pow(Math.sin(Math.PI * uu), .7), t, { seed: 5, up: true, alpha: 1 - smooth((u - .6) / .4) });
}
function fxBlazingUniverse(g, c, t, o = {}) {
  const dur = o.dur || 1.1, u = t / dur; if (t < 0 || u > 1) return; const yaw = o.yaw || 0, f = [Math.sin(yaw), 0, Math.cos(yaw)], R = o.r || 2.2; const sw = easeSnap(clamp(t / .2, 0, 1));
  const pts = arcPts(vAdd(c, [0, .4, 0]), [0, 1, 0], f, R, -.3, lerp(-.3, 3.3, sw), 30);
  fireRibbon(g, pts, uu => (o.w || .55) * Math.pow(Math.sin(Math.PI * uu), .6), t, { seed: 9, up: true, alpha: 1 - smooth((u - .6) / .4) });
}
function fxFlameUndulation(g, c, t, o = {}) {
  const dur = o.dur || 1.4, u = t / dur; if (t < 0 || u > 1) return; const R = o.r || 1.5;
  for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU * 1.1 + t * 5 + k * 2; pts.push(vAdd(c, [Math.cos(a) * R * (1 + k * .15), .3 + k * .6 + Math.sin(a * 2 + t * 6) * .25, Math.sin(a) * R * (1 + k * .15)])); }
    fireRibbon(g, pts, .28, t, { seed: 11 + k, up: true, alpha: (1 - smooth((u - .7) / .3)) * smooth(u / .1), tongues: 8 }); }
}
// Flame Tiger: drawn 2D on the projected anchor, facing the screen direction of dir; roaring jaw, flame mane, stripes
function fxFlameTiger(g, p, dir, t, o = {}) {
  const dur = o.dur || 1.3, u = t / dur; if (t < 0 || u > 1) return; const travel = easeOut(clamp(t / .5, 0, 1)) * (o.travel || 3);
  const pc = vMad(p, vNorm(dir), travel), q = P2(pc), q2 = P2(vMad(pc, vNorm(dir), 1)); if (!q || !q2) return;
  const S = (o.scale || 1.8) * q.s * (1 + .2 * easeOut(u)), face = q2.x >= q.x ? 1 : -1, fi = Math.floor(t * 12), jaw = .35 + .35 * Math.sin(Math.min(1, t * 3) * Math.PI * .5);
  const fade = 1 - smooth((u - .7) / .3); g.save(); g.translate(q.x, q.y); g.scale(face * S / 100, S / 100); g.globalAlpha = fade;
  // flame mane behind (tongues sweeping back)
  for (let i = 0; i < 14; i++) { const a = -1.2 + i / 13 * 2.6; flameTongue(g, -10 + Math.cos(a) * 30, Math.sin(a) * 34, 16, 70 + 40 * hash(i * 3 + fi), a + Math.PI * .5 + .9, FIRE_COLS, i + fi); }
  // head in profile (facing +x): broad muzzle, rounded ears, cheek ruff; built from flame colours
  const head = [[64, -2], [60, -14], [46, -22], [30, -30], [14, -38], [6, -44], [2, -58], [-10, -60], [-16, -46], [-30, -42], [-44, -30], [-52, -12], [-60, 4], [-50, 14], [-58, 24], [-44, 30], [-48, 40], [-30, 38], [-18, 44], [-6, 34], [10, 26], [22, 14], [40, 10], [58, 8]];
  polyPath(g, catmull(head, true, 3)); g.fillStyle = '#e8501c'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = '#4a0604'; g.stroke();
  g.save(); polyPath(g, catmull(head, true, 3)); g.clip();
  g.fillStyle = '#ffa82a'; g.beginPath(); g.ellipse(12, -10, 46, 30, -.15, 0, TAU); g.fill();
  g.fillStyle = '#fff0b0'; g.beginPath(); g.ellipse(34, 2, 26, 12, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-30, 22, 18, 12, .4, 0, TAU); g.fill();
  // stripes: dark crimson wedges over brow, crown and cheek
  g.fillStyle = '#7a0a06'; for (const [x, y, r, l] of [[22, -32, 1.9, 16], [8, -40, 1.75, 18], [-8, -40, 1.6, 16], [-26, -34, 1.3, 18], [-40, -20, 1.0, 16], [-44, 2, .6, 18], [-36, 18, .2, 16], [-20, 28, -.2, 12], [38, -20, 2.1, 10]]) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.moveTo(0, -3.5); g.quadraticCurveTo(l * .5, -2, l, 0); g.quadraticCurveTo(l * .5, 2, 0, 3.5); g.closePath(); g.fill(); g.restore(); }
  g.restore();
  // ear inner + nose
  g.fillStyle = '#7a0a06'; g.beginPath(); g.moveTo(-1, -46); g.quadraticCurveTo(-4, -56, -10, -54); g.quadraticCurveTo(-12, -48, -9, -44); g.fill();
  g.fillStyle = '#2a0402'; g.beginPath(); g.moveTo(64, -6); g.lineTo(57, -12); g.lineTo(55, -3); g.closePath(); g.fill();
  // open jaw: dark maw, upper fangs, lower jaw dropping with jaw
  g.beginPath(); g.moveTo(22, 12); g.quadraticCurveTo(44, 10, 60, 8); g.lineTo(56, 12 + jaw * 34); g.quadraticCurveTo(36, 22 + jaw * 34, 20, 18); g.closePath(); g.fillStyle = '#3a0402'; g.fill();
  g.save(); g.translate(20, 16); g.rotate(jaw * .55); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, 4, 38, 2); g.lineTo(34, 10); g.quadraticCurveTo(14, 16, -6, 10); g.closePath(); g.fillStyle = '#e8501c'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#4a0604'; g.stroke(); g.fillStyle = '#fff6d8'; for (const x of [16, 30]) { g.beginPath(); g.moveTo(x - 3, 2); g.lineTo(x, -7); g.lineTo(x + 3, 2); g.fill(); } g.restore();
  g.fillStyle = '#fff6d8'; for (const x of [48, 34]) { g.beginPath(); g.moveTo(x - 3.5, 9); g.lineTo(x, 22); g.lineTo(x + 3.5, 9); g.fill(); }
  // angry eye: white-hot almond, slit pupil, heavy brow
  g.beginPath(); g.moveTo(18, -22); g.quadraticCurveTo(28, -30, 40, -24); g.quadraticCurveTo(29, -18, 18, -22); g.fillStyle = '#fffbe0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#4a0604'; g.stroke();
  g.fillStyle = '#c81a08'; g.beginPath(); g.ellipse(30, -23.5, 2.2, 4, 0, 0, TAU); g.fill(); g.lineWidth = 4; g.strokeStyle = '#2a0402'; g.beginPath(); g.moveTo(14, -27); g.lineTo(42, -31); g.stroke();
  // flames streaming off the ruff and crown
  for (let i = 0; i < 10; i++) { const a = -1.9 + i / 9 * 2.6; g.globalAlpha = fade * .9; flameTongue(g, -38 + Math.cos(a) * 18, Math.sin(a) * 30 + 4, 9, 34 + 26 * hash(i * 7 + fi), a + Math.PI * .5 + 1.2, FIRE_COLS, i * 3 + fi); }
  g.restore();
  if (u < .25) fxFlameBurst(g, pc, t, { size: (o.scale || 1.8) * .6, dur: .35 });
}
function fxRengokuNinth(g, a, b, t, o = {}) {
  const dur = o.dur || 1.4, u = t / dur; if (t < 0 || u > 1) return; const head = easeIn(clamp(t / .35, 0, 1)), R = o.r || 1.2, d = vNorm(vSub(b, a)); let side = vNorm(vCross(d, [0, 1, 0])); const up = vCross(side, d);
  const pts = []; for (let i = 0; i <= 26; i++) { const s = i / 26 * head; const sp = s * 9 + t * 8; pts.push(vAdd(vLerp(a, b, s), vAdd(vMul(side, Math.sin(sp) * R * .35 * (1 - s * .5)), vMul(up, Math.cos(sp) * R * .25)))); }
  const fade = 1 - smooth((u - .65) / .35);
  fireRibbon(g, pts, uu => R * (.35 + .65 * uu), t, { seed: 13, up: true, alpha: fade, tongues: 30 });
  fireRibbon(g, pts.map(p => vAdd(p, vMul(up, R * .2))), uu => R * .45 * uu, t + .3, { seed: 17, cols: ['#f0601c', '#ffd24a', '#ffffff'], alpha: fade * .9, ink: false, tongues: 10 });
  const hp = pts[pts.length - 1], q = P2(hp); if (q) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 2.4 * q.s, '#ff9a30', .7 * fade); g.restore(); fxFlameBurst(g, hp, (t % .25), { size: R * 1.2, dur: .25, n: 12 }); }
}
function fxEmbers(g, t, o = {}) {
  const n = o.n || 60, c = o.c || [0, 0, 0], R = o.r || 6, Hh = o.h || 5; g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const life = (t * (.25 + hash(i) * .3) + hash(i * 3)) % 1; const p = vAdd(c, [(hash(i * 5) - .5) * 2 * R + Math.sin(t * 2 + i) * .3, life * Hh, (hash(i * 7) - .5) * 2 * R]); const q = project(p); if (!q) continue; const r = Math.max(1, .03 * q.s * (1 - life)); g.fillStyle = rgba(o.col || '#ffb040', .9 * (1 - life)); g.beginPath(); g.ellipse(q.x, q.y, r, r * 1.8, .3, 0, TAU); g.fill(); }
  g.restore();
}

// ------------------------------------------------------------------------------------------ Akaza: Destructive Death
function fxCompass(g, c, t, o = {}) {
  const R = o.r || 2.2, grow = easeOut(clamp(t / .35, 0, 1)), rot = (o.rot || 0) + t * .15, col = o.col || '#7fdcff', a0 = o.alpha == null ? 1 : o.alpha; if (t < 0) return;
  const P = (r, a) => project([c[0] + Math.cos(a + rot) * r * grow, c[1] + .005, c[2] + Math.sin(a + rot) * r * grow]);
  const line = (pts, w, cl, al) => { const q = pts.map(p => p).filter(Boolean); if (q.length < 2) return; g.beginPath(); g.moveTo(q[0].x, q[0].y); for (const p of q.slice(1)) g.lineTo(p.x, p.y); g.lineWidth = w; g.strokeStyle = rgba(cl, al * a0); g.stroke(); };
  const s0 = project(c); if (!s0) return; const lw = Math.max(1.2, .02 * s0.s);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter';
  for (const pass of [[lw * 4, .18], [lw * 1.6, .55], [lw * .6, 1]]) { const [w, al] = pass, cl = pass[1] === 1 ? '#ffffff' : col;
    for (const rr of [1, .93, .55, .2]) { const pts = []; for (let i = 0; i <= 64; i++) pts.push(P(R * rr, i / 64 * TAU)); line(pts, w * (rr === 1 ? 1 : .7), cl, al); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, long = k % 3 === 0 ? 1.12 : .93; line([P(R * .2, a), P(R * long, a)], w * (k % 3 === 0 ? 1 : .6), cl, al);
      // snowflake branches on each spoke
      for (const f of [.45, .7]) { const b0 = R * f, bl = R * (k % 3 === 0 ? .16 : .1); for (const sg of [-1, 1]) line([P(b0, a), P(Math.hypot(b0 + bl * .7, bl * .7), a + sg * Math.atan2(bl * .7, b0 + bl * .7))], w * .55, cl, al); } }
    // diamond needles at the cardinal points
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; line([P(R * 1.0, a - .06), P(R * 1.28, a), P(R * 1.0, a + .06)], w * .8, cl, al); }
    const hex = []; for (let i = 0; i <= 6; i++) hex.push(P(R * .12, i / 6 * TAU)); line(hex, w * .7, cl, al); }
  g.restore();
  // twelve numerals around the rim (kanji 一..十二), red first then cooling to light blue
  const red = 1 - clamp(t / .5, 0, 1), numCol = red > 0 ? mixHex(col, '#ff3a5a', red) : col; g.save(); g.globalAlpha = a0; g.fillStyle = numCol; g.textAlign = 'center'; g.textBaseline = 'middle';
  const NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  for (let k = 0; k < 12; k++) { const q = P(R * 1.08, k / 12 * TAU + TAU / 24); if (!q) continue; g.font = `900 ${Math.max(8, .16 * R * q.s / (NUM[k].length > 1 ? 1.4 : 1))}px "IPAGothic", sans-serif`; g.save(); g.translate(q.x, q.y); g.scale(1, .55); g.fillText(NUM[k], 0, 0); g.restore(); }
  g.restore();
  if (t < .3) fxShockRing(g, c, t, { r: R * 1.4, dur: .3, w: .06, col: '#bff0ff' });
}
function fxAirType(g, p, dir, t, o = {}) {
  const n = o.n || 3, d = vNorm(dir), len = o.len || 8;
  for (let i = 0; i < n; i++) { const tt = t - i * .07; if (tt < 0 || tt > .6) continue; const u = tt / .6, c = vMad(p, d, easeOut(u) * len); const q = P2(c); if (!q) continue;
    fxAirRings(g, c, d, tt, { len: .8, r: (o.r || .35) * (1 + u), n: 3 });
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, .5 * q.s, '#a8e4ff', .6 * (1 - u)); g.restore();
    fxImpactStar(g, q.x, q.y, .35 * q.s * (1 - u * .5), hash(i) * 3, rgba('#e8fbff', 1 - u), 6); }
}
function fxRanshiki(g, p, dir, t, o = {}) {
  const n = o.n || 16, d = vNorm(dir), R = o.r || .7; let side = vNorm(vCross(d, [0, 1, 0])); const up = vCross(side, d);
  for (let i = 0; i < n; i++) { const t0 = i * .035, tt = t - t0; if (tt < 0 || tt > .18) continue; const off = vAdd(vMul(side, (hash(i * 3) - .5) * 2 * R), vMul(up, (hash(i * 7) - .5) * 2 * R)), c = vAdd(p, off); const q = P2(c), qb = P2(vMad(c, d, -1.2)); if (!q || !qb) continue; const u = tt / .18;
    g.save(); g.strokeStyle = rgba('#ffffff', .8 * (1 - u)); g.lineWidth = .08 * q.s; g.lineCap = 'round'; g.beginPath(); g.moveTo(qb.x, qb.y); g.lineTo(q.x, q.y); g.stroke(); g.restore();
    fxImpactStar(g, q.x, q.y, (.25 + .2 * hash(i)) * q.s * (1 - u * .3), hash(i) * 6, rgba(i % 3 ? '#ffffff' : '#9ae4ff', 1 - u), 5); }
}
function fxAnnihilation(g, p, dir, t, o = {}) {
  const u = t / .7; if (t < 0 || u > 1) return; const q = P2(p); if (!q) return; const S = (o.size || 1) * q.s, d = vNorm(dir);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 3 * S * easeOut(u), '#8ad8ff', .9 * (1 - u)); g.restore();
  fxCompass(g, vAdd(p, [0, -p[1] + .01, 0]), t + .3, { r: 2.5 * (o.size || 1), alpha: 1 - u });
  fxShockRing(g, p, t, { r: 4 * (o.size || 1), dur: .5, w: .12, up: d, col: '#e0f6ff' }); fxShockRing(g, p, t - .06, { r: 6 * (o.size || 1), dur: .6, w: .08, up: d, col: '#8ad8ff' });
  fxAirRings(g, p, d, t, { len: 3 * (o.size || 1), r: .9 * (o.size || 1), n: 5 });
  if (u < .3) fxImpactStar(g, q.x, q.y, 1.6 * S * (1 - u), .3, '#ffffff', 8);
}
function fxBlueSilver(g, c, t, o = {}) { const R = o.r || 3; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; fxRanshiki(g, vAdd(c, [Math.cos(a) * R * .4, 1.2, Math.sin(a) * R * .4]), [Math.cos(a), 0, Math.sin(a)], t - k * .02, { n: 8, r: .6 }); } fxCompass(g, [c[0], .01, c[2]], t, { r: R }); fxShockRing(g, [c[0], .05, c[2]], t, { r: R * 2.5, dur: .6, w: .1, col: '#bff0ff' }); }
function fxAshDrift(g, c, t, o = {}) {
  const n = o.n || 120, R = o.r || .6, Hh = o.h || 2.2;
  for (let i = 0; i < n; i++) { const life = clamp((t - hash(i * 13) * .6) / 1.6, 0, 1); if (life <= 0 || life >= 1) continue; const p = vAdd(c, [(hash(i) - .5) * R * 2 + life * (o.wind || 1.2), hash(i * 3) * Hh + life * 1.2, (hash(i * 5) - .5) * R * 2]); const q = project(p); if (!q) continue;
    const r = Math.min((.015 + .03 * hash(i * 7)) * q.s, 4 + 5 * hash(i * 9)) * (1 - life * .5); g.save(); g.translate(q.x, q.y); g.rotate(i + t * 4); g.globalAlpha = (1 - life) * .85; g.fillStyle = i % 4 ? '#4a3a3e' : (i % 8 ? '#ff7a3a' : '#9a7a70'); g.fillRect(-r, -r * .6, r * 2, r * 1.2); g.restore(); }
}
