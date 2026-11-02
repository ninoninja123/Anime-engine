/* Bleach Showdown engine - core: math, seeded random, 3D vectors/matrices, SVG-path parsing to polylines,
   tapered anime ink, cel fills, on-twos timing.  Everything is deterministic: a frame depends only on t.
   (2D helpers originally from ../showdown-5/core.js, extended.)                                               */
'use strict';
const QS = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const W = 1920, H = 1080, FPS = 24, TAU = Math.PI * 2;
let DUR = 180.0;  // programs may override (setDuration)
function setDuration(d) { DUR = d; }
const SCALE = parseFloat(QS.get('scale') || '1');

function hash(n) {
  n = (n | 0) ^ 0x9e3779b9; n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35); n ^= n >>> 16; return (n >>> 0) / 4294967296;
}
function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const smoother = t => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = t => { t = clamp(t, 0, 1); return 1 - (1 - t) ** 3; };
const easeIn = t => { t = clamp(t, 0, 1); return t * t * t; };
const easeInOut = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const expOut = t => { t = clamp(t, 0, 1); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); };
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const pulse = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));
function noise1(x) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  const a = hash(i) * 2 - 1, b = hash(i + 1) * 2 - 1; return a + (b - a) * u;
}
function fbm(x, o = 3) { let s = 0, a = 1, n = 0; for (let i = 0; i < o; i++) { s += noise1(x * (1 << i) + i * 17.3) * a; n += a; a *= .5; } return s / n; }

// --- anime timing: drawings change on twos (12/s) or threes (8/s); camera & fx stay at 24 fps
const onN = (t, n) => Math.floor(t * FPS / n + 1e-6) * n / FPS;
const twos = t => onN(t, 2), threes = t => onN(t, 3);
const drawIdx = (t, n) => Math.floor(t * FPS / n + 1e-6);   // drawing number -> boil seed

// --- colour
function hexRGB(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgba(hex, a) { const c = hexRGB(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function mixHex(a, b, t) { const A = hexRGB(a), B = hexRGB(b); const h = v => (v | 0).toString(16).padStart(2, '0'); return '#' + h(lerp(A[0], B[0], t)) + h(lerp(A[1], B[1], t)) + h(lerp(A[2], B[2], t)); }

// --- SVG path -> polylines (absolute & relative M L H V C S Q T Z).  Cached by string.
const PCACHE = new Map();
function parsePath(d, res = 1) {
  const key = d + '|' + res; if (PCACHE.has(key)) return PCACHE.get(key);
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const subs = []; let cur = null, i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, lcx = 0, lcy = 0, lq = null;
  const num = () => parseFloat(tok[i++]);
  const push = (px, py) => cur.push([px, py]);
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    const L = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    const n = Math.max(4, Math.ceil(L / 7 * res));
    for (let k = 1; k <= n; k++) { const u = k / n, v = 1 - u; push(v * v * v * x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3, v * v * v * y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3); }
    lcx = x2; lcy = y2; x = x3; y = y3;
  };
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'M') { x = num() + ox; y = num() + oy; sx = x; sy = y; cur = [[x, y]]; subs.push(cur); cmd = rel ? 'l' : 'L'; lq = null; }
    else if (C === 'L') { x = num() + ox; y = num() + oy; push(x, y); lq = null; }
    else if (C === 'H') { x = num() + ox; push(x, y); }
    else if (C === 'V') { y = num() + oy; push(x, y); }
    else if (C === 'C') { const a = num() + ox, b = num() + oy, c = num() + ox, e = num() + oy, f = num() + ox, g = num() + oy; cubic(a, b, c, e, f, g); lq = null; }
    else if (C === 'S') { const a = 2 * x - lcx, b = 2 * y - lcy, c = num() + ox, e = num() + oy, f = num() + ox, g = num() + oy; cubic(a, b, c, e, f, g); }
    else if (C === 'Q' || C === 'T') {
      let qx, qy; if (C === 'Q') { qx = num() + ox; qy = num() + oy; } else { qx = lq ? 2 * x - lq[0] : x; qy = lq ? 2 * y - lq[1] : y; }
      const ex = num() + ox, ey = num() + oy; lq = [qx, qy];
      cubic(x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), ex + 2 / 3 * (qx - ex), ey + 2 / 3 * (qy - ey), ex, ey); lq = [qx, qy];
    }
    else if (C === 'Z') { push(sx, sy); cur.closed = true; x = sx; y = sy; }
    else i++;
  }
  PCACHE.set(key, subs); return subs;
}
// optional deformation (hair sway, breathing, boil)
function warpSubs(subs, fn) { if (!fn) return subs; return subs.map(s => { const o = s.map(p => fn(p[0], p[1])); o.closed = s.closed; return o; }); }
function boilFn(seed, amp) {
  if (!amp) return null;
  return (x, y) => [x + noise1(x * .013 + y * .007 + seed * 7.1) * amp, y + noise1(y * .013 - x * .005 + seed * 3.7 + 50) * amp];
}
function compose(f, g) { if (!f) return g; if (!g) return f; return (x, y) => { const p = f(x, y); return g(p[0], p[1]); }; }

function tracePolys(ctx, subs) { ctx.beginPath(); for (const s of subs) { ctx.moveTo(s[0][0], s[0][1]); for (let k = 1; k < s.length; k++) ctx.lineTo(s[k][0], s[k][1]); ctx.closePath(); } }
function fillD(ctx, d, color, warp) { tracePolys(ctx, warpSubs(parsePath(d), warp)); ctx.fillStyle = color; ctx.fill(); }
function clipD(ctx, d, warp) { tracePolys(ctx, warpSubs(parsePath(d), warp)); ctx.clip(); }

// tapered ink stroke along each open subpath. w = max width; taper = [startFrac, endFrac]
function inkPts(ctx, pts, w, color, taper = [.25, .25], press = 0) {
  const n = pts.length; if (n < 2) return;
  const L = [0]; for (let k = 1; k < n; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const tot = L[n - 1] || 1; const left = [], right = [];
  for (let k = 0; k < n; k++) {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const u = L[k] / tot;
    let p = 1; if (taper[0] > 0) p = Math.min(p, u / taper[0]); if (taper[1] > 0) p = Math.min(p, (1 - u) / taper[1]);
    p = Math.pow(clamp(p, 0, 1), .7) * (1 + press * noise1(L[k] * .05 + k));
    const hw = Math.max(Math.min(.15, w * .06), w * .5 * p);
    left.push([pts[k][0] - dy * hw, pts[k][1] + dx * hw]); right.push([pts[k][0] + dy * hw, pts[k][1] - dx * hw]);
  }
  ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]);
  for (let k = 1; k < n; k++) ctx.lineTo(left[k][0], left[k][1]);
  for (let k = n - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function ink(ctx, d, w, color, taper, warp, press) { for (const s of warpSubs(parsePath(d), warp)) inkPts(ctx, s, w, color, taper, press); }

// --- anime hair lock: pointed, curved clump from a root (width w) to a tip. bend: sideways bow (px). Returns SVG d.
function lockD(rx, ry, tx, ty, w, bend = 0, skew = .5) {
  const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const ax = rx + nx * w / 2, ay = ry + ny * w / 2, bx = rx - nx * w / 2, by = ry - ny * w / 2;
  const mx = rx + dx * skew + nx * bend, my = ry + dy * skew + ny * bend;
  const c1x = mx + nx * w * .32, c1y = my + ny * w * .32, c2x = mx - nx * w * .22, c2y = my - ny * w * .22;
  return `M ${ax} ${ay} Q ${c1x} ${c1y} ${tx} ${ty} Q ${c2x} ${c2y} ${bx} ${by} Z`;
}
// the shadow half of a lock (one side), for cel shading
function lockShadeD(rx, ry, tx, ty, w, bend = 0, skew = .5) {
  const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const bx = rx - nx * w / 2, by = ry - ny * w / 2, cx = rx - nx * w * .18, cy = ry - ny * w * .18;
  const mx = rx + dx * skew + nx * bend, my = ry + dy * skew + ny * bend;
  return `M ${cx} ${cy} Q ${mx - nx * w * .12} ${my - ny * w * .12} ${tx} ${ty} Q ${mx - nx * w * .22} ${my - ny * w * .22} ${bx} ${by} Z`;
}

// --- small drawing helpers
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); }
function radial(ctx, x, y, r, stops) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); for (const [o, c] of stops) g.addColorStop(o, c); return g; }
function linear(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of stops) g.addColorStop(o, c); return g; }
function glow(ctx, x, y, r, col, a) { ctx.fillStyle = radial(ctx, x, y, r, [[0, rgba(col, a)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

// keyframed scalar: [[t, v, ease?], ...]
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return lerp(a[1], b[1], (b[2] || smooth)((t - a[0]) / Math.max(1e-6, b[0] - a[0]))); }
  return keys[keys.length - 1][1];
}
// handheld camera sway (continuous, 24 fps)
function handheld(t, amp, seed = 1) { return [fbm(t * .7 + seed) * amp, fbm(t * .6 + seed + 9) * amp, fbm(t * .4 + seed + 21) * amp * .0012]; }

// ============================================================================================ 3D math
// vectors are plain arrays [x,y,z]. World: x right/east, y up, z north. Character local: x = character's LEFT,
// y up, z forward (facing) -> right-handed with x = cross(y,z).
const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vMul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const vMad = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const vDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vLen = a => Math.hypot(a[0], a[1], a[2]);
const vNorm = a => { const l = vLen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const vLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const vDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// 3x3 matrices as arrays of 3 column vectors [X, Y, Z] (the local axes expressed in parent space)
const M_ID = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const mApply = (m, v) => [m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2], m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2], m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2]];
const mMul = (a, b) => [mApply(a, b[0]), mApply(a, b[1]), mApply(a, b[2])];
const mT = m => [[m[0][0], m[1][0], m[2][0]], [m[0][1], m[1][1], m[2][1]], [m[0][2], m[1][2], m[2][2]]];
function mRotX(a) { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, s], [0, -s, c]]; }
function mRotY(a) { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; }
function mRotZ(a) { const c = Math.cos(a), s = Math.sin(a); return [[c, s, 0], [-s, c, 0], [0, 0, 1]]; }
// rotation about arbitrary unit axis
function mAxis(ax, a) {
  const [x, y, z] = vNorm(ax), c = Math.cos(a), s = Math.sin(a), C = 1 - c;
  return [[c + x * x * C, y * x * C + z * s, z * x * C - y * s], [x * y * C - z * s, c + y * y * C, z * y * C + x * s], [x * z * C + y * s, y * z * C - x * s, c + z * z * C]];
}
// frame whose Y axis points along dir, X as close as possible to hint
function mFromY(dir, hint) {
  const Y = vNorm(dir); let X = vSub(hint, vMul(Y, vDot(hint, Y))); if (vLen(X) < 1e-5) X = Math.abs(Y[0]) < .9 ? [1, 0, 0] : [0, 0, 1];
  X = vNorm(vSub(X, vMul(Y, vDot(X, Y)))); return [X, Y, vCross(X, Y)];
}
// yaw (about Y), pitch (about local X, + = nose down / lean forward), roll (about local Z) -> matrix
function mYPR(yaw, pitch = 0, roll = 0) { return mMul(mRotY(yaw), mMul(mRotX(pitch), mRotZ(roll))); }
// angle helpers
const wrapA = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
const lerpA = (a, b, t) => a + wrapA(b - a) * t;
// back-ease / snap easings used by animation
const easeBack = t => { t = clamp(t, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const easeSnap = t => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 5); };
const easeLin = t => clamp(t, 0, 1);
const EASE = { lin: easeLin, smooth, smoother, out: easeOut, in: easeIn, inOut: easeInOut, exp: expOut, back: easeBack, snap: easeSnap, hold: () => 0, step: t => t >= 1 ? 1 : 0 };
const easeOf = e => typeof e === 'function' ? e : (EASE[e] || smooth);
// keyed vector track [[t, [x,y,z], ease], ...]
function keyedV(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return vLerp(a[1], b[1], easeOf(b[2])((t - a[0]) / Math.max(1e-6, b[0] - a[0]))); }
  return keys[keys.length - 1][1];
}
// catmull-rom through 2D points (closed or open) -> dense points
function catmull(pts, closed = false, n = 6) {
  const out = [], L = pts.length; if (L < 3) return pts.slice();
  const g = i => closed ? pts[(i + L) % L] : pts[clamp(i, 0, L - 1)];
  const segs = closed ? L : L - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
  }
  if (!closed) out.push(pts[L - 1]);
  return out;
}
function polyPath(ctx, pts, closed = true) { ctx.beginPath(); if (!pts.length) return; ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (closed) ctx.closePath(); }
// HSL tweak of hex colors
function shadeHex(hex, k) { return k >= 0 ? mixHex(hex, '#ffffff', k) : mixHex(hex, '#000000', -k); }
function multHex(a, b) { const A = hexRGB(a), B = hexRGB(b); const h = v => (v | 0).toString(16).padStart(2, '0'); return '#' + h(A[0] * B[0] / 255) + h(A[1] * B[1] / 255) + h(A[2] * B[2] / 255); }
