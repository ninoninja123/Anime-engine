// 2D motion-comic drawing library for the "Four Arrows" cutscene (src/cine2d/arrows2d.js).
// Immediate-mode Canvas 2D: every frame the drawings are traced from point lists. Hand-drawn feel:
//  - LINE BOIL "on twos": every outline point is jittered by a hash of (shape seed, point index, boil frame);
//    the boil frame changes ~12 times a second (3 states), so the ink lines shimmer like redrawn cels.
//  - cel shading: flat colour + ONE shade shape (the same outline offset toward the light, clipped) + hatching
//    in the shade, thick dark ink outline with round joins.
// No bitmaps, no filters. Coordinates: local units (a dog head is ~100 units long), facing right.

// ------------------------------------------------------------------------------------------ noise / boil
export const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export function rng(seed) {
  let a = (seed * 9301 + 49297) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const ART = { boil: 0, px: 1, ink: '#1a1214', flat: null };   // flat = silhouette colour (no shading, no eyes)   // px = canvas pixels per "screen point" (set per frame)
let SEED = 1;

/** Screen-constant size: n screen points → local units under the current transform. */
export function sp(g, n) { const m = g.getTransform(); return n * ART.px / (Math.hypot(m.a, m.b) || 1); }

function jit(pts, seed, amp) {
  const b = ART.boil * 101.3, out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    out[i] = [p[0] + (hash(seed * 13.1 + i * 7.7 + b) - 0.5) * 2 * amp, p[1] + (hash(seed * 5.3 + i * 3.1 + b + 9.1) - 0.5) * 2 * amp, p[2]];
  }
  return out;
}
/** Catmull-Rom → Bézier into a Path2D. pt[2] = 1 makes a sharp corner. */
function bez(P, pts, closed, k, ox = 0, oy = 0) {
  const n = pts.length; if (n < 2) return P;
  const at = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  P.moveTo(pts[0][0] + ox, pts[0][1] + oy);
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const k1 = p1[2] ? 0 : k, k2 = p2[2] ? 0 : k;
    P.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k1 + ox, p1[1] + (p2[1] - p0[1]) * k1 + oy, p2[0] - (p3[0] - p1[0]) * k2 + ox, p2[1] - (p3[1] - p1[1]) * k2 + oy, p2[0] + ox, p2[1] + oy);
  }
  if (closed) P.closePath();
  return P;
}
/** Boiled smooth path. o: { closed, k, seed, amp (screen pts), ox, oy } */
export function path(g, pts, o = {}) {
  const amp = sp(g, o.amp ?? 0.9);
  const q = amp > 0 ? jit(pts, o.seed ?? SEED++, amp) : pts;
  return bez(new Path2D(), q, o.closed !== false, o.k ?? 0.18, o.ox || 0, o.oy || 0);
}

/**
 * Inked cel shape.
 *  fill: colour/gradient · shade: shade colour (one offset shade shape) · light: [dx, dy] local offset of the lit copy
 *  hatch: hatch lines in the shade · lw: ink width (screen pts, 0 = none) · line: ink colour · seed: boil seed
 *  marks: fn(g) drawn clipped inside the shape (markings) after the fill, before the shade
 */
export function ink(g, pts, o = {}) {
  const seed = o.seed ?? SEED++;
  const amp = sp(g, o.amp ?? 0.9);
  const q = amp > 0 ? jit(pts, seed, amp) : pts, k = o.k ?? 0.18;
  const P = bez(new Path2D(), q, true, k);
  if (ART.flat) { g.fillStyle = ART.flat; g.fill(P); if (o.lw !== 0) { g.lineWidth = sp(g, o.lw ?? 2.2); g.strokeStyle = ART.flat; g.lineJoin = 'round'; g.stroke(P); } return P; }
  if (o.fill) { g.fillStyle = o.fill; g.fill(P); }
  if (o.marks || o.shade) {
    g.save(); g.clip(P);
    if (o.marks) o.marks(g);
    if (o.shade) {
      const [lx, ly] = o.light || [6, -6];
      const L = bez(new Path2D(), q, true, k, lx, ly);
      const C = new Path2D(); C.rect(-1e4, -1e4, 2e4, 2e4); C.addPath(L);
      g.save(); g.clip(C, 'evenodd');
      g.fillStyle = o.shade; g.fill(P);
      if (o.hatch) hatchFill(g, q, seed, o.hatchCol || 'rgba(20,10,16,0.35)', o.hatch === true ? 1 : o.hatch);
      g.restore();
    }
    g.restore();
  }
  if (o.lw !== 0) { g.lineWidth = sp(g, o.lw ?? 2.2); g.strokeStyle = o.line || ART.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(P); }
  return P;
}
function bbox(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return [x0, y0, x1, y1];
}
/** Diagonal hatch over the bounding box of pts (call inside a clip). */
export function hatchFill(g, pts, seed, col, dens = 1) {
  const [x0, y0, x1, y1] = bbox(pts), step = sp(g, 4.2) / dens, j = sp(g, 0.8);
  g.beginPath();
  let i = 0;
  for (let s = x0 - (y1 - y0); s < x1; s += step, i++) {
    const a = (hash(seed + i * 1.7 + ART.boil * 3.3) - 0.5) * j;
    g.moveTo(s + a, y1 + a); g.lineTo(s + (y1 - y0) + a, y0 - a);
  }
  g.strokeStyle = col; g.lineWidth = sp(g, 0.9); g.stroke();
}
/** Open ink stroke (fur strand, crease, brow). */
export function line(g, pts, o = {}) {
  if (ART.flat) return null;
  const P = path(g, pts, { ...o, closed: false });
  g.lineWidth = sp(g, o.lw ?? 2); g.strokeStyle = o.col || ART.ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(P);
  return P;
}
/** Tapered brush stroke (thick in the middle, pointed ends): a filled closed shape around a polyline. */
export function brush(g, pts, o = {}) {
  const w = o.w ?? 3, n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const t = i / (n - 1), ww = w * Math.sin(Math.PI * (0.08 + 0.84 * t)) * (o.taper ? o.taper(t) : 1);
    L.push([pts[i][0] - dy / d * ww, pts[i][1] + dx / d * ww]); R.push([pts[i][0] + dy / d * ww, pts[i][1] - dx / d * ww]);
  }
  const shape = [[...pts[0], 1], ...L.slice(1, -1), [...pts[n - 1], 1], ...R.slice(1, -1).reverse()];
  const P = path(g, shape, { seed: o.seed, amp: o.amp ?? 0.5, k: 0.15 });
  g.fillStyle = ART.flat || o.col || ART.ink; g.fill(P);
}
/** Outline polygon of a limb along a polyline with per-joint half-widths; round foot end. */
export function limb(chain, widths) {
  const n = chain.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = chain[Math.max(0, i - 1)], b = chain[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = widths[i];
    L.push([chain[i][0] - dy / d * w, chain[i][1] + dx / d * w]); R.push([chain[i][0] + dy / d * w, chain[i][1] - dx / d * w]);
  }
  const e = chain[n - 1], p = chain[n - 2], dx = e[0] - p[0], dy = e[1] - p[1], d = Math.hypot(dx, dy) || 1;
  const tip = [e[0] + dx / d * widths[n - 1] * 0.9, e[1] + dy / d * widths[n - 1] * 0.9];
  return [...L, tip, ...R.reverse()];
}
export const RECT = (x0, y0, x1, y1) => [[x0, y0, 1], [x1, y0, 1], [x1, y1, 1], [x0, y1, 1]];
export const rot = (p, a, c = [0, 0]) => { const s = Math.sin(a), co = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co, p[2]]; };
export const xf = (pts, { x = 0, y = 0, s = 1, sx = s, sy = s, r = 0, c = [0, 0] } = {}) => pts.map(p => { const q = r ? rot(p, r, c) : p; return [q[0] * sx + x, q[1] * sy + y, p[2]]; });
export const D2R = Math.PI / 180;
export function withT(g, x, y, s, r, fn, flip = false) { g.save(); g.translate(x, y); if (r) g.rotate(r); g.scale(flip ? -s : s, s); fn(g); g.restore(); }
/** ellipse as point list */
export function ell(cx, cy, rx, ry, n = 14, a0 = 0) { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; }
/** jagged fur outline: base polyline pts, tufts pointing along the outward normal. */
export function furry(pts, amp = 8, every = 1, seed = 3) {
  const r = rng(seed), out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], p = pts[i];
    out.push([p[0], p[1]]);
    if (i % every === 0) {
      const q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
      const k = amp * (0.6 + r() * 0.8);
      out.push([mx + dy / d * k * 0.2 + dx * 0.25, my - dx / d * k * 0.2 + dy * 0.25, 0]);
      out.push([mx - dy / d * -k + dx * 0.15, my + dx / d * -k + dy * 0.15, 1]);
    }
  }
  return out;
}

// ------------------------------------------------------------------------------------------ palettes
export const DOGS = {
  jerome: { base: '#e2d9c8', shade: '#a99e8f', dark: '#1d1a1a', darkSh: '#0a0909', muzzle: '#ede5d6', eye: '#cfe0ee', ear: 'prick', tail: 'sabre', nose: '#141213', eyeLine: '#1a1416' },
  robert: { base: '#a26a36', shade: '#6e4420', dark: '#2a1d14', darkSh: '#160f0a', muzzle: '#e0c49a', eye: '#7a4a1e', ear: 'drop', earCol: '#5a3a1e', tail: 'sabre', nose: '#1a1210' },
  rocker: { base: '#3a3534', shade: '#151213', dark: '#3a3534', darkSh: '#151213', muzzle: '#b07a40', tan: '#b07a40', tanSh: '#7a4f24', eye: '#a8682c', ear: 'prick', tail: 'docked', nose: '#0e0b0b' },
  heuler: { base: '#efebe2', shade: '#b8b2a6', dark: '#1c1a1a', darkSh: '#0a0909', muzzle: '#f5f1e8', eye: '#6a4420', ear: 'drop', earCol: '#1c1a1a', tail: 'sabre', nose: '#151212' },
  weed: { base: '#dfe4ec', shade: '#9aa6bc', dark: '#c3ccda', darkSh: '#8590a8', muzzle: '#f2f4f8', eye: '#5a8ad0', ear: 'prick', tail: 'curl', nose: '#1a1a22' },
};
export const P4C = { fur: '#b47c40', furSh: '#7c5024', mane: '#8c5a2a', maneSh: '#5a3616', maneHi: '#d29e58', belly: '#d2a868', skin: '#c99c8c', skinSh: '#9a6e64', wound: '#3a1418', mouth: '#3a1216', tongue: '#9a4248', tooth: '#f4ecd8', eye: '#f0c838', scar: '#4a2a18', nose: '#1e1412' };

// ------------------------------------------------------------------------------------------ eyes
/**
 * Big anime eye. (x, y) centre, r = half width. o: { iris, pupil: 'round'|'slit', expr, lid 0..1 (closed), look [dx,dy],
 * tear 0..1, side (1 = inner corner on the right/nose side), tilt (rad), size (iris scale), lineCol, white }
 * expr: 'calm' | 'determined' | 'pain' | 'wide' | 'sad' | 'fury' | 'beast'
 */
export function eye(g, x, y, r, o = {}) {
  if (ART.flat) return;
  const side = o.side ?? 1, ex = o.expr || 'calm';
  const E = { calm: [0.62, 0.42, 0.0, 0.52], determined: [0.44, 0.38, -0.22, 0.5], pain: [0.22, 0.3, 0.2, 0.46], wide: [0.86, 0.6, 0.06, 0.36],
    sad: [0.52, 0.36, 0.24, 0.52], fury: [0.5, 0.34, -0.34, 0.42], beast: [0.56, 0.46, -0.18, 0.5] }[ex] || [0.62, 0.42, 0, 0.52];
  let [up, lo, slant, irisK] = E;
  const lid = o.lid || 0;
  up *= (1 - lid); lo *= (1 - lid * 0.85);
  irisK *= (o.size || 1);
  g.save(); g.translate(x, y); if (o.tilt) g.rotate(o.tilt); g.scale(side, 1);
  // almond: inner corner at +r (nose side), outer corner at -r
  const ic = [r, r * 0.12], oc = [-r, -r * 0.08 - slant * r * 0.6];
  const upper = [oc, [-r * 0.45, -r * up - slant * r * 0.55], [r * 0.35, -r * up * 0.9 + slant * r * 0.5], ic];
  const lower = [[r * 0.4, r * lo * 0.8], [-r * 0.4, r * lo]];
  const pts = [[...oc, 1], upper[1], upper[2], [...ic, 1], ...lower];
  const P = path(g, pts, { seed: 901, amp: 0.4, k: 0.2 });
  g.fillStyle = o.white || '#fbf8f0'; g.fill(P);
  g.save(); g.clip(P);
  const lx = (o.look ? o.look[0] : 0) * r * 0.35 * side, ly = (o.look ? o.look[1] : 0) * r * 0.3;
  const ir = r * irisK, cx = lx - r * 0.05, cy = ly + r * 0.02;
  if (lid < 0.92) {
    g.fillStyle = o.iris || '#6a4420'; g.beginPath(); g.arc(cx, cy, ir, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.beginPath(); g.arc(cx, cy - ir * 0.35, ir * 0.95, Math.PI, 0); g.fill();   // lid shadow on the iris
    g.fillStyle = '#0a0708';
    if (o.pupil === 'slit') { g.beginPath(); g.ellipse(cx, cy, ir * (ex === 'wide' ? 0.12 : 0.22), ir * 0.85, 0, 0, 7); g.fill(); }
    else { g.beginPath(); g.arc(cx, cy, ir * (ex === 'wide' ? 0.28 : ex === 'fury' ? 0.36 : 0.5), 0, 7); g.fill(); }
    g.fillStyle = '#fff';                                                   // highlights
    g.beginPath(); g.ellipse(cx - ir * 0.35, cy - ir * 0.4, ir * 0.26, ir * 0.18, -0.5, 0, 7); g.fill();
    g.beginPath(); g.arc(cx + ir * 0.35, cy + ir * 0.35, ir * 0.09, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(70,60,80,0.22)'; g.fillRect(-r * 1.2, -r * 1.5, r * 2.4, r * (0.6 - up * 0.3)); // upper lid shade on the white
  g.restore();
  // ink: thick upper lid with an outer flick, thin lower lid
  const flick = [[-r * 1.18, -r * 0.02 - slant * r * 0.7 + r * 0.1, 1], [...oc], upper[1], upper[2], ic];
  brush(g, flick, { w: r * 0.13, seed: 902 });
  line(g, [[-r * 0.85, r * lo * 0.55], lower[1], lower[0], [r * 0.85, r * 0.2]], { lw: 1.6, seed: 903, amp: 0.4 });
  if (ex === 'wide') line(g, [[-r * 0.5, -r * 0.98], [r * 0.3, -r * 0.92]], { lw: 1.2, seed: 904 });
  // brow
  const bs = { calm: [-0.15, 0], determined: [0.45, -0.1], pain: [-0.55, 0.05], wide: [-0.2, -0.25], sad: [-0.5, 0], fury: [0.7, -0.05], beast: [0.5, -0.05] }[ex] || [0, 0];
  if (o.brow !== false) {
    const by = -r * (up + 0.42) + bs[1] * r;
    brush(g, [[-r * 0.9, by - bs[0] * r * -0.2], [-r * 0.1, by - r * 0.12 + bs[0] * r * 0.15], [r * 0.85, by + bs[0] * r * 0.5]], { w: r * 0.1, seed: 905, col: o.browCol || ART.ink });
  }
  if (o.tear) {
    const ty = r * 0.35 + o.tear * r * 1.4;
    g.fillStyle = 'rgba(210,235,255,0.92)'; g.strokeStyle = 'rgba(40,60,90,0.8)'; g.lineWidth = sp(g, 1.2);
    const T = path(g, [[r * 0.7, ty - r * 0.35, 1], [r * 0.82, ty], [r * 0.7, ty + r * 0.14], [r * 0.58, ty]], { seed: 906, amp: 0.3 });
    g.fill(T); g.stroke(T);
    g.strokeStyle = 'rgba(220,240,255,0.8)'; g.lineWidth = sp(g, 1.5); g.beginPath(); g.moveTo(r * 0.85, r * 0.2); g.lineTo(r * 0.72, ty - r * 0.3); g.stroke();
  }
  g.restore();
}

// ------------------------------------------------------------------------------------------ dog heads
/**
 * Dog head in profile, facing right. Origin = back of the skull; muzzle tip ≈ (104, 14). o: { jaw (rad, 0 closed),
 * expr, lid, look, ear: 0..1 (1 = flattened back), teeth (show), snarl, tear, eyeScale }
 */
export function headSide(g, id, o = {}) {
  const C = DOGS[id], jaw = o.jaw || 0, earF = o.ear || 0;
  const sd = (id.charCodeAt(0) + id.length) * 31;
  // far ear (prick) behind the skull
  if (C.ear === 'prick') {
    const tip = [10 - earF * 34, -56 + earF * 40];
    ink(g, [[0, -14], [tip[0] + 4, tip[1], 1], [24, -20]], { fill: id === 'jerome' ? C.dark : C.base, lw: 2, seed: sd + 1, k: 0.12 });
  }
  // lower jaw (rotates at the hinge)
  const hinge = [44, 20];
  const jawPts = [[40, 22], [70, 24], [96, 23], [98, 28, 1], [84, 33], [60, 36], [42, 34]].map(p => rot(p, jaw, hinge));
  if (jaw > 0.05) {   // mouth interior
    const top = [[44, 22], [96, 22]], bot = [rot([96, 26], jaw, hinge), rot([46, 28], jaw, hinge)];
    ink(g, [...top, ...bot], { fill: '#3c1418', lw: 1.6, seed: sd + 2, amp: 0.4 });
    ink(g, [rot([60, 28], jaw * 0.8, hinge), rot([86, 27], jaw * 0.8, hinge), rot([80, 31], jaw * 0.9, hinge), rot([62, 32], jaw * 0.9, hinge)], { fill: '#a85a5c', lw: 0, seed: sd + 3 });
  }
  ink(g, jawPts, { fill: C.muzzle || C.base, shade: C.shade, light: [0, -4], lw: 2, seed: sd + 4 });
  if (o.teeth || jaw > 0.05) {
    const T = (x, y, dir, a) => { const p = a ? [rot([x, y], a, hinge), rot([x + 3, y + dir * 7], a, hinge), rot([x + 6, y], a, hinge)] : [[x, y], [x + 3, y + dir * 7], [x + 6, y]]; ink(g, [[...p[0], 1], [...p[1], 1], [...p[2], 1]], { fill: '#f6f0e2', lw: 1, seed: sd + x }); };
    T(88, 21, 1, 0); T(74, 22, 1, 0); T(64, 22.5, 0.6, 0); T(86, 24, -1, jaw); T(72, 25, -0.7, jaw);
  }
  // skull + muzzle
  const head = [[-6, 12], [-8, -4], [4, -18], [24, -24], [42, -18], [52, -9], [66, -6], [86, -2], [99, 3], [105, 9, 1], [104, 16], [97, 21], [76, 22], [56, 22], [44, 26], [30, 36], [12, 40], [-2, 30]];
  ink(g, head, {
    fill: id === 'rocker' ? C.base : C.base, shade: C.shade, light: [5, -6], hatch: true, seed: sd + 5,
    marks: g2 => {
      if (id === 'jerome') {   // black cap over the skull + stripe from the eye back to the ear
        g2.fillStyle = C.dark;
        g2.fill(path(g2, [[-20, -40], [40, -40], [50, -14], [40, -8], [22, -10], [8, -4], [-20, 30]], { seed: sd + 6, amp: 0.5 }));
        g2.fill(path(g2, [[58, -6], [44, 0], [30, 6], [14, 14], [12, 6], [30, -4], [46, -10]], { seed: sd + 7, amp: 0.4 }));
      } else if (id === 'robert') {
        g2.fillStyle = C.muzzle; g2.fill(path(g2, [[60, -2], [104, 4], [104, 26], [56, 26], [50, 12]], { seed: sd + 6, amp: 0.5 }));
      } else if (id === 'rocker') {
        g2.fillStyle = C.tan; g2.fill(path(g2, [[62, 4], [104, 8], [104, 26], [48, 30], [40, 20], [52, 10]], { seed: sd + 6, amp: 0.5 }));
        g2.beginPath(); g2.ellipse(50, -12, 5, 3.4, -0.2, 0, 7); g2.fill();   // tan brow dot
      } else if (id === 'heuler') {
        g2.fillStyle = C.dark; g2.fill(path(g2, [[-20, -30], [36, -30], [48, -10], [60, 0], [44, 8], [30, 4], [10, 20], [-20, 30]], { seed: sd + 6, amp: 0.5 }));
        g2.fillStyle = '#3a3634'; for (let i = 0; i < 7; i++) { g2.beginPath(); g2.arc(70 + (i * 37) % 26, 2 + (i * 13) % 14, 1.4, 0, 7); g2.fill(); }   // ticking on the muzzle
      } else if (id === 'weed') {
        g2.fillStyle = C.muzzle; g2.fill(path(g2, [[50, 2], [104, 6], [104, 26], [30, 40], [26, 20]], { seed: sd + 6, amp: 0.5 }));
      }
    },
  });
  // nose
  ink(g, [[96, 2], [104, 5], [106, 11, 1], [101, 14], [95, 10]], { fill: C.nose, lw: 1.4, seed: sd + 8 });
  line(g, [[84, 20], [96, 21], [101, 15]], { lw: 1.4, seed: sd + 9 });
  if (o.snarl) line(g, [[70, 2], [74, 8]], { lw: 1.2, seed: sd + 10 }), line(g, [[76, 0], [80, 6]], { lw: 1.2, seed: sd + 11 });
  // eye
  const er = 9 * (o.eyeScale || 1);
  if (id === 'jerome' && !ART.flat) g.fillStyle = C.dark, g.fill(path(g, ell(51, -4, er * 1.5, er * 1.05, 10), { seed: sd + 12, amp: 0.4 }));
  eye(g, 51, -4, er, { iris: C.eye, expr: o.expr || 'calm', lid: o.lid, look: o.look || [1, 0], tear: o.tear, side: 1, browCol: id === 'heuler' || id === 'jerome' || id === 'rocker' ? '#3a3330' : ART.ink, size: 1.15 });
  // near ear
  if (C.ear === 'prick') {
    const tip = [16 - earF * 40, -60 + earF * 46];
    ink(g, [[2, -12], [tip[0], tip[1], 1], [30, -18]], { fill: id === 'jerome' ? C.dark : C.base, shade: id === 'jerome' ? C.darkSh : C.shade, light: [4, 2], lw: 2.2, seed: sd + 13, k: 0.14,
      marks: g2 => { g2.fillStyle = id === 'jerome' ? '#3a3230' : 'rgba(0,0,0,0.25)'; g2.fill(path(g2, [[10, -16], [tip[0] + 4, tip[1] + 12], [22, -18]], { seed: sd + 14, amp: 0.3 })); } });
  } else {
    const sw = earF * 0.5;
    const ear = [[4, -16], [24, -16], [30, 4], [26, 34], [16, 48], [4, 46], [-2, 26], [-4, 4]].map(p => rot(p, sw, [10, -14]));
    ink(g, ear, { fill: C.earCol, shade: C.darkSh, light: [5, -3], hatch: true, lw: 2.2, seed: sd + 15 });
    line(g, [rot([14, -6], sw, [10, -14]), rot([16, 20], sw, [10, -14]), rot([12, 38], sw, [10, -14])], { lw: 1.1, seed: sd + 16, col: 'rgba(0,0,0,0.5)' });
  }
}

/**
 * Dog head from the front (slightly 3/4 by `turn`). Origin = between the eyes; head width ≈ 110.
 * o: { expr, lid, look, mouth 0..1, teeth, ear (0..1 flatten), tear, turn (-1..1), eyesOnly }
 */
export function headFront(g, id, o = {}) {
  const C = DOGS[id], tn = o.turn || 0, earF = o.ear || 0, sd = (id.charCodeAt(1) + id.length) * 17;
  const S = x => x + tn * 10 * (1 - Math.abs(x) / 80);   // fake 3/4: shift the face centre
  // ears behind
  for (const sgn of [-1, 1]) {
    if (C.ear === 'prick') {
      const bx = sgn * 30, tip = [sgn * (46 + earF * 26), -70 + earF * 46];
      ink(g, [[bx - sgn * 18, -30], [tip[0], tip[1], 1], [bx + sgn * 24, -12]], { fill: id === 'jerome' ? C.dark : C.base, shade: id === 'jerome' ? C.darkSh : C.shade, light: [sgn * -4, 3], lw: 2.2, seed: sd + sgn,
        marks: g2 => { g2.fillStyle = id === 'jerome' ? '#3e3532' : 'rgba(255,220,200,0.25)'; g2.fill(path(g2, [[bx - sgn * 8, -28], [tip[0] - sgn * 3, tip[1] + 14], [bx + sgn * 14, -16]], { seed: sd + 3 + sgn, amp: 0.3 })); } });
    }
  }
  // head shape
  const head = [[S(-50), -6], [S(-44), -30], [S(-22), -42], [S(0), -44], [S(22), -42], [S(44), -30], [S(50), -6], [S(42), 18], [S(26), 34], [S(18), 52], [S(0), 58], [S(-18), 52], [S(-26), 34], [S(-42), 18]];
  ink(g, head, {
    fill: C.base, shade: C.shade, light: [-6 + tn * 4, -5], hatch: true, seed: sd + 5,
    marks: g2 => {
      if (id === 'jerome') {
        g2.fillStyle = C.dark;
        g2.fill(path(g2, [[S(-60), -60], [S(60), -60], [S(52), -18], [S(20), -24], [S(0), -18], [S(-20), -24], [S(-52), -18]], { seed: sd + 6, amp: 0.5 }));
        for (const sg of [-1, 1]) g2.fill(path(g2, [[S(sg * 12), -4], [S(sg * 34), -10], [S(sg * 40), 2], [S(sg * 30), 22], [S(sg * 24), 30], [S(sg * 22), 10]], { seed: sd + 7 + sg, amp: 0.4 }));
      } else if (id === 'robert') {
        g2.fillStyle = C.muzzle; g2.fill(path(g2, [[S(-24), 14], [S(-10), -8], [S(10), -8], [S(24), 14], [S(22), 60], [S(-22), 60]], { seed: sd + 6, amp: 0.5 }));
      } else if (id === 'rocker') {
        g2.fillStyle = C.tan; g2.fill(path(g2, [[S(-28), 18], [S(-12), 8], [S(12), 8], [S(28), 18], [S(24), 60], [S(-24), 60]], { seed: sd + 6, amp: 0.5 }));
        for (const sg of [-1, 1]) { g2.beginPath(); g2.ellipse(S(sg * 22), -20, 7, 5, sg * 0.2, 0, 7); g2.fill(); }
      } else if (id === 'heuler') {
        g2.fillStyle = C.dark; g2.fill(path(g2, [[S(-60), -50], [S(-6), -50], [S(-8), -24], [S(-14), -6], [S(-30), 8], [S(-60), 10]], { seed: sd + 6, amp: 0.5 }));
        g2.fill(path(g2, [[S(60), -50], [S(14), -50], [S(16), -30], [S(38), -18], [S(60), -20]], { seed: sd + 7, amp: 0.5 }));
      } else if (id === 'weed') {
        g2.fillStyle = C.muzzle; g2.fill(path(g2, [[S(-34), 10], [S(-14), -4], [S(14), -4], [S(34), 10], [S(26), 60], [S(-26), 60]], { seed: sd + 6, amp: 0.5 }));
      }
    },
  });
  // muzzle bridge lines + nose + mouth
  line(g, [[S(-8), 0], [S(-9), 20], [S(-12), 32]], { lw: 1.1, col: 'rgba(30,20,20,0.45)', seed: sd + 8 });
  line(g, [[S(8), 0], [S(9), 20], [S(12), 32]], { lw: 1.1, col: 'rgba(30,20,20,0.45)', seed: sd + 9 });
  const m = o.mouth || 0;
  if (m > 0.04) {
    ink(g, [[S(-16), 44], [S(0), 46], [S(16), 44], [S(10), 46 + m * 18], [S(0), 48 + m * 20], [S(-10), 46 + m * 18]], { fill: '#3c1418', lw: 1.8, seed: sd + 10 });
    if (o.teeth || m > 0.3) for (const sg of [-1, 1]) {
      ink(g, [[S(sg * 13), 45, 1], [S(sg * 11), 45 + 7 + m * 3, 1], [S(sg * 8), 46, 1]], { fill: '#f6f0e2', lw: 1, seed: sd + 11 + sg });
      ink(g, [[S(sg * 11), 46 + m * 18, 1], [S(sg * 10), 40 + m * 16, 1], [S(sg * 7), 46 + m * 19, 1]], { fill: '#f6f0e2', lw: 1, seed: sd + 13 + sg });
    }
  } else line(g, [[S(-16), 46], [S(-6), 48], [S(0), 45], [S(6), 48], [S(16), 46]], { lw: 1.6, seed: sd + 10 });
  ink(g, [[S(-11), 33], [S(0), 30], [S(11), 33], [S(8), 40], [S(0), 44, 1], [S(-8), 40]], { fill: C.nose, lw: 1.4, seed: sd + 14 });
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(S(-3), 33.5, 3.5, 1.6, 0, 0, 7); g.fill();
  // eyes
  for (const sg of [-1, 1]) {
    eye(g, S(sg * 22), -6 + (sg * tn * 1.5), 11 * (1 - sg * tn * 0.12), { iris: C.eye, expr: o.expr || 'calm', lid: o.lid, look: o.look, tear: sg === 1 ? 0 : o.tear, side: -sg, browCol: id === 'heuler' || id === 'jerome' || id === 'rocker' ? '#4a423e' : ART.ink, size: 1.1 });
  }
  // drop ears in front
  if (C.ear === 'drop') for (const sg of [-1, 1]) {
    const sw = sg * earF * 0.3;
    const ear = [[sg * 34, -34], [sg * 54, -30], [sg * 64, 0], [sg * 62, 36], [sg * 52, 52], [sg * 44, 40], [sg * 42, 6], [sg * 38, -16]].map(p => rot([S(p[0]), p[1]], sw, [S(sg * 40), -30]));
    ink(g, ear, { fill: C.earCol, shade: C.darkSh, light: [sg * -5, -2], hatch: true, lw: 2.2, seed: sd + 20 + sg });
  }
}

// ------------------------------------------------------------------------------------------ dog body (side)
// Poses: joint angles in degrees (0 = straight down); fl/fr = near/far front leg [shoulder, elbow], hl/hr = hind [hip, knee, hock].
export const POSES = {
  stand: { body: 0, fl: [4, -4], fr: [-6, 2], hl: [10, 40, -36], hr: [-2, 40, -30], neck: -38, head: 8, tail: 30 },
  alert: { body: -3, fl: [0, -2], fr: [-8, 4], hl: [14, 42, -40], hr: [4, 40, -34], neck: -50, head: 14, tail: 10 },
  run1: { body: 2, fl: [-70, 10], fr: [-50, 30], hl: [60, 30, 10], hr: [40, 40, -10], neck: -22, head: 6, tail: 70, stretch: 1.06 },
  run2: { body: -4, fl: [40, -60], fr: [20, -40], hl: [-40, 70, -50], hr: [-20, 60, -40], neck: -30, head: 10, tail: 50, stretch: 0.94 },
  crouch: { body: 6, fl: [-30, 80], fr: [-20, 70], hl: [-50, 110, -80], hr: [-40, 100, -70], neck: -12, head: 0, tail: 40, drop: 18 },
  leap: { body: -14, fl: [-80, -20], fr: [-70, -10], hl: [60, 10, 20], hr: [50, 20, 10], neck: -20, head: 4, tail: 80, stretch: 1.1 },
  hang: { body: -55, fl: [-50, -30], fr: [-30, -10], hl: [10, 30, -10], hr: [30, 20, 0], neck: -20, head: 30, tail: 20 },
  fly: { body: 30, fl: [-40, 30], fr: [10, 60], hl: [70, 50, -30], hr: [90, 60, 0], neck: 10, head: 20, tail: 120 },
  lie: { body: 90, fl: [-80, 10], fr: [-70, 20], hl: [80, -10, 0], hr: [60, 10, 0], neck: -6, head: -4, tail: 100, lie: 1 },
};
/** Dog body side view. Origin = ground under the chest centre, facing right. Body length ≈ 120 (head extra). */
export function dogSide(g, id, pose = 'stand', o = {}) {
  const C = DOGS[id], P = typeof pose === 'string' ? POSES[pose] : pose, sd = id.charCodeAt(0) * 7 + 400;
  const st = P.stretch || 1, drop = P.drop || 0;
  g.save();
  if (P.lie) { g.translate(0, -16); g.rotate(0); }
  else g.translate(0, -62 + drop);
  g.rotate(P.body * D2R * (P.lie ? 0 : 1));
  const sh = [34 * st, -6], hip = [-36 * st, -8];
  const legCol = id === 'jerome' ? C.base : C.base, legSh = C.shade;
  const leg = (root, a, lens, ws, col, shc, seed, far) => {
    const ch = [root]; let ang = 0, p = root;
    for (let i = 0; i < lens.length; i++) { ang += (a[i] || 0) * D2R; p = [p[0] - Math.sin(ang) * lens[i], p[1] + Math.cos(ang) * lens[i]]; ch.push(p); }
    const L = limb(ch, ws);
    ink(g, L, { fill: far ? shc : col, shade: far ? null : shc, light: [5, -3], lw: 2, seed, k: 0.14 });
    return ch;
  };
  if (P.lie) {   // lying on the side: legs out flat
    const lp = (r, a) => leg(r, a, [30, 28], [9, 6, 5], legCol, legSh, sd + 1, true);
    lp([30, 6], [-80, 0]); lp([-30, 6], [-70, 0]);
  } else {
    leg([sh[0] - 6, sh[1]], P.fr, [34, 30], [10, 7, 5.5], legCol, legSh, sd + 2, true);
    leg([hip[0] + 4, hip[1]], P.hr, [30, 26, 16], [14, 7, 5, 5], legCol, legSh, sd + 3, true);
  }
  // tail
  const ta = (P.tail ?? 30) * D2R;
  if (C.tail === 'docked') ink(g, [[-44 * st, -16], [-44 * st - Math.sin(ta) * 12, -16 - Math.cos(ta) * 12 + 2], [-40 * st, -6]], { fill: C.base, lw: 2, seed: sd + 4 });
  else {
    const t0 = [-46 * st, -14], t1 = [t0[0] - Math.cos(ta - 1.2) * 26, t0[1] + Math.sin(ta - 0.6) * 22], t2 = [t1[0] - 16, t1[1] + 14];
    ink(g, limb([t0, t1, t2], [7, 6, 2]), { fill: id === 'jerome' || id === 'robert' ? C.dark : id === 'heuler' ? C.base : C.base, lw: 2, seed: sd + 5 });
  }
  // torso
  const torso = [[46 * st, -18], [52 * st, 2], [42 * st, 22], [20, 26], [-6, 18], [-30 * st, 16], [-50 * st, 10], [-54 * st, -8], [-44 * st, -22], [-10, -24], [24 * st, -26]];
  ink(g, torso, {
    fill: C.base, shade: C.shade, light: [4, -7], hatch: true, seed: sd + 6,
    marks: g2 => {
      if (id === 'jerome' || id === 'robert') { g2.fillStyle = C.dark; g2.fill(path(g2, [[40 * st, -40], [36 * st, -14], [10, -6], [-20, -4], [-46 * st, -2], [-70, -40]], { seed: sd + 7, amp: 0.6 })); }
      if (id === 'rocker') { g2.fillStyle = C.tan; g2.fill(path(g2, [[54, 4], [44, 30], [20, 30], [30, 10]], { seed: sd + 7 })); }
      if (id === 'heuler') { g2.fillStyle = C.dark; g2.fill(path(g2, ell(-10, -14, 22, 12, 9), { seed: sd + 7 })); g2.fill(path(g2, ell(-40, -4, 10, 8, 7), { seed: sd + 8 })); }
      if (id === 'robert' || id === 'heuler' || id === 'weed') { g2.fillStyle = id === 'robert' ? C.muzzle : '#fbf8f2'; g2.fill(path(g2, [[50, 0], [40, 30], [0, 30], [10, 18]], { seed: sd + 9 })); }
    },
  });
  if (P.lie) {
    const lp = (r, a) => leg(r, a, [30, 28], [10, 7, 5.5], legCol, legSh, sd + 10, false);
    lp([36, 10], [-84, 6]); lp([-34, 10], [-76, 10]);
  } else {
    leg(sh, P.fl, [34, 30], [11, 7, 6], legCol, legSh, sd + 11, false);
    leg(hip, P.hl, [30, 26, 16], [16, 8, 5.5, 5.5], legCol, legSh, sd + 12, false);
    if (id === 'rocker') { g.fillStyle = C.tan; }
  }
  // neck + head
  const na = (P.neck ?? -38) * D2R;
  const nb = [40 * st, -14], nt = [nb[0] + Math.cos(na) * 34, nb[1] + Math.sin(na) * 34];
  ink(g, limb([[nb[0] - 8, nb[1] + 8], nt], [20, 14]), { fill: id === 'jerome' ? C.base : C.base, shade: C.shade, light: [4, -6], lw: 2, seed: sd + 13,
    marks: id === 'jerome' || id === 'robert' ? g2 => { g2.fillStyle = C.dark; g2.fill(path(g2, [[nb[0] - 30, nb[1] - 30], [nt[0] + 4, nt[1] - 20], [nt[0] - 2, nt[1] - 4], [nb[0] - 6, nb[1] - 6]], { seed: sd + 14 })); } : null });
  g.save(); g.translate(nt[0] - 6, nt[1] - 4); g.rotate((P.head ?? 8) * D2R); g.scale(0.52, 0.52);
  headSide(g, id, { jaw: o.jaw || 0, expr: o.expr, lid: o.lid, ear: o.ear, eyeScale: 1.25, teeth: o.teeth, look: o.look });
  g.restore();
  g.restore();
}

/** Dog silhouette (backlit wides / impact frames / spirit lights): one flat colour, no shading, no eyes. */
export function dogSil(g, col, id, pose = 'stand', o = {}) { const f = ART.flat; ART.flat = col; dogSide(g, id, pose, o); ART.flat = f; }

// ------------------------------------------------------------------------------------------ P4 (Kaibutsu)
/** P4 head in profile (facing right). Origin = jaw hinge region; muzzle tip ≈ (120, 10). o: { jaw, expr, look, eyeWide } */
export function p4HeadSide(g, o = {}) {
  const C = P4C, jaw = o.jaw || 0, hinge = [30, 18];
  // mane behind the head (big jagged ruff)
  const maneBase = [[40, -40], [10, -56], [-30, -60], [-70, -44], [-96, -10], [-92, 30], [-60, 60], [-20, 70], [20, 56], [36, 30]];
  ink(g, furry(maneBase, 26, 1, 41), { fill: C.mane, shade: C.maneSh, light: [10, -10], hatch: true, lw: 2.4, seed: 4001, k: 0.12 });
  for (let i = 0; i < 7; i++) brush(g, [[-20 - i * 8, -40 + i * 14], [-50 - i * 6, -30 + i * 14], [-86 - i * 2, -16 + i * 14]], { w: 2.4, seed: 4040 + i, col: i % 2 ? C.maneHi : C.maneSh });
  // lower jaw
  const jp = [[26, 24], [70, 30], [112, 26], [116, 32, 1], [96, 40], [60, 44], [30, 40]].map(p => rot(p, jaw, hinge));
  if (jaw > 0.05) {
    ink(g, [[30, 20], [116, 16], rot([116, 28], jaw, hinge), rot([40, 30], jaw, hinge)], { fill: C.mouth, lw: 2, seed: 4002, amp: 0.5 });
    ink(g, [rot([50, 32], jaw * 0.85, hinge), rot([96, 30], jaw * 0.85, hinge), rot([90, 37], jaw * 0.9, hinge), rot([54, 38], jaw * 0.9, hinge)], { fill: C.tongue, lw: 0, seed: 4003 });
  }
  ink(g, jp, { fill: C.fur, shade: C.furSh, light: [0, -5], lw: 2.2, seed: 4004 });
  const tooth = (x, y, len, a, dir) => { const p = [[x - 3, y], [x, y + dir * len], [x + 3.5, y]].map(q => a ? rot(q, a, hinge) : q); ink(g, [[...p[0], 1], [...p[1], 1], [...p[2], 1]], { fill: C.tooth, lw: 1.2, seed: 4005 + x }); };
  for (const [x, l] of [[108, 14], [96, 7], [84, 7], [72, 6], [60, 6]]) tooth(x, 19, l, 0, 1);
  for (const [x, l] of [[104, 12], [90, 6], [78, 6], [66, 5]]) tooth(x, 28, l, jaw, -1);
  // skull + broad muzzle
  const head = [[-14, 10], [-10, -18], [10, -34], [40, -38], [62, -28], [80, -20], [104, -14], [118, -6], [124, 4, 1], [120, 14], [110, 19], [80, 20], [50, 20], [34, 26], [10, 34], [-8, 28]];
  ink(g, head, { fill: C.fur, shade: C.furSh, light: [5, -7], hatch: true, seed: 4006, lw: 2.6,
    marks: g2 => { g2.fillStyle = C.belly; g2.fill(path(g2, [[70, 0], [124, 6], [120, 22], [60, 22]], { seed: 4007, amp: 0.5 })); } });
  // brow ridge with scar studs
  brush(g, [[34, -20], [52, -24], [70, -18]], { w: 4, seed: 4008 });
  for (let i = 0; i < 5; i++) { const x = 24 + i * 9, y = -30 + i * 1.6; line(g, [[x - 2, y - 5], [x + 2, y + 5]], { lw: 2, seed: 4010 + i, col: C.scar }); if (!ART.flat) { g.fillStyle = '#d8d0c0'; g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); } }
  line(g, [[18, -30], [62, -20]], { lw: 1.4, seed: 4016, col: C.scar });
  // wrinkles on the muzzle (snarl)
  for (let i = 0; i < 3; i++) line(g, [[78 + i * 9, -16 + i], [82 + i * 9, -6 + i]], { lw: 1.4, seed: 4020 + i });
  // nose
  ink(g, [[112, -10], [124, -6], [127, 4, 1], [120, 8], [110, 2]], { fill: C.nose, lw: 1.6, seed: 4024 });
  // eye
  eye(g, 56, -12, 10, { iris: C.eye, pupil: 'slit', expr: o.expr || 'beast', look: o.look || [1, 0], side: 1, size: o.eyeWide ? 0.9 : 1.15, brow: false, white: '#f2e4b8' });
  // ear (small, torn) poking out of the mane
  ink(g, [[-4, -30], [6, -60, 1], [20, -40], [14, -34]], { fill: C.maneSh, lw: 2, seed: 4025 });
  // mane strands over the forehead / cheek
  for (let i = 0; i < 6; i++) brush(g, [[-10 + i * 4, -40 + i * 10], [6 + i * 3, -30 + i * 10], [20 + i * 2, -26 + i * 11]], { w: 2.4, seed: 4030 + i, col: C.maneSh });
}

/** P4 full body side view. Origin = ground under the body centre. Length ≈ 330. pose: stand|rear|back|leap|crouch|roar */
export function p4Side(g, pose = 'stand', o = {}) {
  const C = P4C;
  const POS = {
    stand: { body: 0, fl: [2, -2], fr: [-8, 4], hl: [8, 36, -32], hr: [-4, 36, -28], neck: -20, head: 10, y: -150 },
    roar: { body: -6, fl: [6, -4], fr: [-6, 4], hl: [12, 40, -36], hr: [0, 40, -32], neck: -40, head: -24, y: -150 },
    rear: { body: -52, fl: [-50, 80], fr: [-30, 60], hl: [-40, 60, -30], hr: [-30, 50, -24], neck: -8, head: -6, y: -170 },
    back: { body: 168, fl: [-40, -30], fr: [-10, -40], hl: [30, 40, -30], hr: [10, 30, -50], neck: 40, head: 10, y: -70 },
    leap: { body: -10, fl: [-70, -10], fr: [-60, 0], hl: [60, 20, 20], hr: [50, 30, 10], neck: -18, head: 6, y: -170 },
    crouch: { body: 4, fl: [-24, 60], fr: [-16, 50], hl: [-40, 90, -64], hr: [-30, 84, -60], neck: -14, head: 4, y: -112 },
  };
  const P = typeof pose === 'string' ? POS[pose] : pose;
  g.save();
  g.translate(0, P.y);
  if (pose === 'rear') g.translate(-90, 40);
  g.rotate(P.body * D2R);
  const sh = [92, 10], hip = [-100, 0];
  const leg = (root, a, lens, ws, far, seed) => {
    const ch = [root]; let ang = 0, p = root;
    for (let i = 0; i < lens.length; i++) { ang += (a[i] || 0) * D2R; p = [p[0] - Math.sin(ang) * lens[i], p[1] + Math.cos(ang) * lens[i]]; ch.push(p); }
    ink(g, limb(ch, ws), { fill: far ? C.furSh : C.fur, shade: far ? null : C.furSh, light: [6, -4], hatch: !far, lw: 2.4, seed, k: 0.14 });
    // claws
    const e = ch[ch.length - 1];
    for (let i = 0; i < 3; i++) ink(g, [[e[0] + 8 + i * 6, e[1] + 4], [e[0] + 18 + i * 6, e[1] + 14, 1], [e[0] + 12 + i * 6, e[1] + 4]], { fill: '#2a201a', lw: 1, seed: seed + 50 + i });
    return ch;
  };
  leg([sh[0] - 14, sh[1]], P.fr, [80, 70], [28, 20, 16], true, 4101);
  leg([hip[0] + 10, hip[1]], P.hr, [70, 62, 34], [34, 20, 14, 14], true, 4102);
  // tail: long with a dark tuft
  const t0 = [-140, -14], t1 = [-190, 20], t2 = [-214, 70];
  ink(g, limb([t0, t1, t2], [12, 9, 5]), { fill: C.fur, lw: 2.2, seed: 4103 });
  ink(g, furry(ell(-216, 80, 16, 22, 8), 8, 1, 7), { fill: C.maneSh, lw: 2, seed: 4104 });
  // torso
  const torso = [[120, -40], [140, 0], [120, 50], [60, 60], [0, 46], [-60, 46], [-120, 40], [-150, 10], [-140, -32], [-80, -46], [0, -52], [70, -58]];
  ink(g, torso, { fill: C.fur, shade: C.furSh, light: [6, -10], hatch: true, seed: 4105, lw: 2.6,
    marks: g2 => {
      g2.fillStyle = C.belly; g2.fill(path(g2, [[110, 30], [60, 70], [-60, 60], [-100, 46], [0, 34]], { seed: 4106, amp: 0.6 }));
      g2.strokeStyle = 'rgba(60,30,10,0.35)'; g2.lineWidth = sp(g2, 1.2);
      for (let i = 0; i < 10; i++) { g2.beginPath(); g2.moveTo(-120 + i * 24, -30 + (i % 3) * 12); g2.lineTo(-108 + i * 24, -14 + (i % 3) * 12); g2.stroke(); }   // fur strokes
    } });
  // weak spot on the LEFT chest (we see the left side when it faces right) + wound
  if (o.patch !== false) {
    ink(g, ell(116, 18, 18, 22, 9), { fill: C.skin, shade: C.skinSh, light: [3, -3], lw: 1.6, seed: 4107 });
    if (o.wound) ink(g, ell(116, 20, 4 + o.wound * 5, 5 + o.wound * 6, 7), { fill: C.wound, lw: 1.2, seed: 4108 });
  }
  leg(sh, P.fl, [80, 70], [30, 21, 17], false, 4109);
  leg(hip, P.hl, [70, 62, 34], [38, 22, 15, 15], false, 4110);
  // mane over the shoulders/neck + head
  const na = P.neck * D2R, nt = [120 + Math.cos(na) * 50, -50 + Math.sin(na) * 50];
  ink(g, furry([[40, -60], [80, -96], [130, -110], [nt[0] + 30, nt[1] - 50], [nt[0] + 50, nt[1] + 20], [150, 40], [110, 30], [60, 0]], 20, 1, 77), { fill: C.mane, shade: C.maneSh, light: [8, -8], hatch: true, lw: 2.6, seed: 4111, k: 0.1 });
  g.save(); g.translate(nt[0] + 10, nt[1]); g.rotate(P.head * D2R); g.scale(0.85, 0.85);
  p4HeadSide(g, { jaw: o.jaw || 0, expr: o.expr, look: o.look, eyeWide: o.eyeWide });
  g.restore();
  if (o.onChest) { g.save(); g.translate(116, 18); o.onChest(g); g.restore(); }   // a dog clamped on the weak spot (drawn in front)
  g.restore();
}

/** P4 silhouette (one colour) – backlit against the sky / impact frames. */
export function p4Sil(g, col, pose = 'stand', o = {}) { const f = ART.flat; ART.flat = col; p4Side(g, pose, { ...o, patch: false }); ART.flat = f; }

/** P4 roaring, seen from below (low angle into the open jaws). Origin = centre of the mouth. Size ≈ 400. */
export function p4RoarBelow(g, o = {}) {
  const C = P4C, open = o.open ?? 1;
  // mane fan
  ink(g, furry(ell(0, -40, 260, 220, 26), 34, 1, 91), { fill: C.mane, shade: C.maneSh, light: [14, 16], hatch: true, lw: 2.8, seed: 4201, k: 0.08 });
  // throat / chin (we look up at it)
  ink(g, [[-150, 80], [-120, 160], [0, 210], [120, 160], [150, 80], [80, 120], [0, 130], [-80, 120]], { fill: C.belly, shade: C.furSh, light: [0, -14], hatch: true, seed: 4202 });
  // lower jaw
  const ly = 60 + open * 40;
  ink(g, [[-120, 20], [-90, ly + 40], [0, ly + 70], [90, ly + 40], [120, 20], [60, ly], [0, ly + 10], [-60, ly]], { fill: C.fur, shade: C.furSh, light: [0, -8], seed: 4203 });
  // mouth interior
  ink(g, [[-110, 10], [-60, -60 - open * 20], [0, -80 - open * 30], [60, -60 - open * 20], [110, 10], [60, ly - 4], [0, ly + 6], [-60, ly - 4]], { fill: C.mouth, seed: 4204, lw: 2.6 });
  ink(g, [[-60, ly - 20], [0, ly - 50], [60, ly - 20], [40, ly - 2], [0, ly + 2], [-40, ly - 2]], { fill: C.tongue, shade: '#6e2a30', light: [0, -6], lw: 1.6, seed: 4205 });
  g.fillStyle = '#1a0608'; g.fill(path(g, ell(0, -20 - open * 10, 30, 18 + open * 6, 9), { seed: 4206 }));   // throat
  // upper jaw / palate rim with teeth
  for (let i = -5; i <= 5; i++) {
    const x = i * 19, top = -60 - open * 20 + Math.abs(i) * Math.abs(i) * 2.2 + (Math.abs(i) > 3 ? 20 : 0);
    const big = Math.abs(i) === 4, len = big ? 46 : 18;
    ink(g, [[x - 7, top - 4], [x, top + len, 1], [x + 7, top - 4]], { fill: C.tooth, shade: '#c8bea6', light: [2, -2], lw: 1.4, seed: 4210 + i });
  }
  for (let i = -4; i <= 4; i++) {
    const x = i * 22, bot = ly - 2 - Math.abs(i) * Math.abs(i) * 1.6;
    const big = Math.abs(i) === 3, len = big ? 38 : 14;
    ink(g, [[x - 7, bot + 4], [x, bot - len, 1], [x + 7, bot + 4]], { fill: C.tooth, lw: 1.4, seed: 4230 + i });
  }
  // upper muzzle and nose seen from below, eyes peeking above
  ink(g, [[-140, 0], [-110, -90], [-40, -130], [40, -130], [110, -90], [140, 0], [100, -40], [0, -84 - open * 30], [-100, -40]], { fill: C.fur, shade: C.furSh, light: [0, 10], hatch: true, seed: 4240 });
  ink(g, ell(0, -116, 40, 16, 10), { fill: C.nose, lw: 2, seed: 4241 });
  for (const sg of [-1, 1]) eye(g, sg * 96, -150, 16, { iris: C.eye, pupil: 'slit', expr: 'fury', side: -sg, brow: false, white: '#f2e4b8', look: [0, 1] });
  for (let i = 0; i < 4; i++) line(g, [[-30 + i * 20, -150], [-26 + i * 20, -170]], { lw: 2, seed: 4250 + i, col: C.scar });
}

/** ECU of P4's eye (3/4 from the side): brow with scar studs, slit pupil. Origin = eye centre. size ≈ 300 wide. */
export function p4EyeECU(g, o = {}) {
  const C = P4C, sd = 4300;
  ink(g, RECT(-900, -500, 900, 500), { fill: C.fur, lw: 0, amp: 0, seed: sd });
  // fur strokes field
  const r = rng(13);
  for (let i = 0; i < 46; i++) { const x = -380 + r() * 760, y = -240 + r() * 480; if (Math.hypot(x, y * 1.4) < 120) continue; brush(g, [[x, y], [x + 18 + r() * 14, y + 8], [x + 40 + r() * 20, y + 20 + r() * 10]], { w: 2.6, seed: sd + i, col: i % 3 ? C.furSh : '#d4a060' }); }
  // mane edge top-left
  ink(g, furry([[-420, -280], [-60, -280], [-120, -180], [-260, -120], [-420, -60]], 30, 1, 5), { fill: C.mane, shade: C.maneSh, light: [10, 10], hatch: true, lw: 2.6, seed: sd + 1 });
  // eye socket shade
  ink(g, ell(0, 6, 130, 70, 14), { fill: C.furSh, lw: 0, seed: sd + 2 });
  eye(g, 0, 0, 100, { iris: C.eye, pupil: 'slit', expr: o.expr || 'beast', look: o.look || [0, 0], side: o.side ?? 1, size: o.wide ? 0.78 : 1.0, brow: false, white: '#efe0b0', tilt: -0.06 });
  // heavy brow + scar studs
  brush(g, [[-150, -96], [-40, -122], [90, -112], [170, -76]], { w: 16, seed: sd + 3 });
  for (let i = 0; i < 6; i++) {
    const x = -130 + i * 52, y = -170 + Math.abs(i - 2.5) * 6;
    line(g, [[x - 10, y - 20], [x + 10, y + 20]], { lw: 5, seed: sd + 10 + i, col: C.scar });
    g.fillStyle = '#ddd4c2'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.lineWidth = sp(g, 1.6); g.strokeStyle = ART.ink; g.stroke();
  }
  line(g, [[-170, -176], [180, -160]], { lw: 3.6, seed: sd + 20, col: C.scar });
  // wrinkles under the eye
  for (let i = 0; i < 3; i++) line(g, [[-60 + i * 50, 90 + i * 6], [-20 + i * 50, 104 + i * 8]], { lw: 2.2, seed: sd + 30 + i });
}

/**
 * ECU of the bare patch on P4's left chest with a dog's jaws biting in. stage 1..3 (wound depth), bite 0..1 (teeth closing),
 * id = biting dog. Origin = wound centre. Frame ≈ 1000 wide.
 */
export function chestECU(g, stage, bite, id, o = {}) {
  const C = P4C, sd = 4400 + stage * 10;
  // fur field with strands sweeping down-right
  ink(g, RECT(-1000, -600, 1000, 600), { fill: C.fur, lw: 0, amp: 0, seed: sd });
  const r = rng(29);
  for (let i = 0; i < 70; i++) { const x = -880 + r() * 1760, y = -480 + r() * 960; if (Math.hypot(x / 1.2, y) < 280) continue; brush(g, [[x, y], [x + 30, y + 30 + r() * 20], [x + 50 + r() * 30, y + 80 + r() * 30]], { w: 5, seed: sd + i, col: i % 3 ? C.furSh : C.belly }); }
  // bare patch (skin) – dents in around the bite
  const dent = bite * 0.2 + stage * 0.05;
  const patch = ell(0, 0, 300, 250, 18).map((p, i) => [p[0] * (1 - dent * (i % 2)), p[1] * (1 - dent * 0.6 * (i % 2))]);
  ink(g, furry(patch, 14, 2, 31), { fill: C.skin, shade: C.skinSh, light: [16, -16], hatch: true, lw: 3, seed: sd + 1 });
  // skin creases pulled toward the bite
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3; line(g, [[Math.cos(a) * 230, Math.sin(a) * 190], [Math.cos(a) * (150 - bite * 30), Math.sin(a) * (120 - bite * 20)], [Math.cos(a + 0.15) * 90, Math.sin(a + 0.15) * 80]], { lw: 2.4, seed: sd + 2 + i, col: C.skinSh }); }
  // wound: dark shadow shape, deeper per stage (no blood)
  if (stage > 0) {
    const w = [0, 60, 110, 170][stage], h = [0, 34, 70, 120][stage];
    ink(g, furry(ell(30, 10, w, h, 12), 10 + stage * 6, 1, 3 + stage), { fill: C.wound, lw: 2.6, seed: sd + 3 });
    if (stage >= 2) ink(g, ell(30, 14, w * 0.5, h * 0.45, 10), { fill: '#1a0608', lw: 0, seed: sd + 4 });
  }
  // the dog's head biting in from the left: its muzzle tip pushes into the wound
  if (id) {
    const sc = 5.4, push = (1 - bite) * 170, jaw = lerpN(0.42, 0.1 + stage * 0.02, bite);
    g.save(); g.translate(70 - 100 * sc - push, 26 - 18 * sc + push * 0.15); g.rotate(-0.05 - stage * 0.03); g.scale(sc, sc);
    headSide(g, id, { jaw, teeth: true, expr: o.expr || (stage === 3 ? 'pain' : 'fury'), snarl: true, look: [1, 0.3], ear: id === 'rocker' ? 0.7 : 0.3 });
    g.restore();
    // skin folds over the teeth (they are IN the patch)
    if (bite > 0.6) for (let i = 0; i < 3; i++) brush(g, [[40 + i * 10, -70 + i * 50], [70 + i * 8, -40 + i * 40], [80 + i * 6, -10 + i * 30]], { w: 6, seed: sd + 40 + i, col: C.skinSh });
  }
}
const lerpN = (a, b, k) => a + (b - a) * k;

/** Paw ECU digging in (3/4 front, low). Origin = ground contact. ~600 wide. */
export function pawECU(g, id, dig = 0) {
  const D = DOGS[id];
  const leg = [[-110, -700, 1], [110, -700, 1], [120, -260], [150, -120], [-150, -120], [-120, -260]];
  ink(g, leg, { fill: D.base, shade: D.shade, light: [-30, -10], hatch: true, lw: 3, seed: 4501,
    marks: g2 => { for (let i = 0; i < 8; i++) brush(g2, [[-90 + i * 26, -560 + (i % 3) * 60], [-80 + i * 26, -420], [-70 + i * 27, -300]], { w: 4, seed: 4560 + i, col: D.shade }); } });
  const toes = [[-150, -50, 70], [-55, -70, 78], [50, -70, 78], [145, -50, 70]];
  ink(g, furry([[-200, -150], [200, -150], [210, -40], [-210, -40]], 18, 1, 9), { fill: D.base, shade: D.shade, light: [-10, -14], lw: 2.6, seed: 4502 });
  for (const [i, [x, y, r]] of toes.entries()) {
    ink(g, ell(x, y + dig * 18, r * 0.62, r * 0.55, 10), { fill: D.base, shade: D.shade, light: [-8, -10], lw: 2.6, seed: 4503 + i });
    ink(g, [[x - 14, y + r * 0.35 + dig * 18], [x - 2, y + r * 0.35 + 40 + dig * 50, 1], [x + 14, y + r * 0.35 + dig * 18]], { fill: '#2a221e', lw: 1.8, seed: 4510 + i });
  }
  ink(g, [[-260, 30], [-120, 10 - dig * 40], [0, 20 - dig * 30], [140, 6 - dig * 40], [270, 30], [270, 80, 1], [-260, 80, 1]], { fill: '#6e5434', shade: '#4a3620', light: [0, -8], hatch: true, lw: 2.4, seed: 4520 });
}

// ------------------------------------------------------------------------------------------ landscape
export function skyGrad(g, x, y, w, h, stops) {
  const gr = g.createLinearGradient(0, y, 0, y + h);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(x, y, w, h);
}
/** Big dramatic cumulus: a towering heap of boiled puffs (rows narrowing upward), lit top-left, shaded under-side. */
export function bigCloud(g, x, y, w, h, o = {}) {
  const r = rng(o.seed || 1), blobs = [];
  const rows = 3 + Math.floor(h / 160);
  for (let row = 0; row < rows; row++) {
    const rw = w * (1 - row / rows * 0.75), n = Math.max(2, Math.round(rw / 150)), yy = y - row * h / rows * 0.95;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, rr = rw / n * (0.75 + r() * 0.5) * (row === 0 ? 0.9 : 1.1);
      blobs.push([x - rw / 2 + t * rw + (r() - 0.5) * rw * 0.12 + row * w * 0.04, yy - r() * h * 0.12, rr, row]);
    }
  }
  const base = o.base || '#f2eee6', sh = o.shade || '#8a8eb4', lineC = o.line || 'rgba(50,50,96,0.75)';
  const sd = (o.seed || 1) * 50;
  const P = blobs.map(([bx, by, br, row], i) => path(g, ell(bx, by, br, br * (row === 0 ? 0.55 : 0.85), 12), { seed: sd + i, amp: 1.2 }));
  // union outline: stroke every puff thick, then fill them all on top → only the outer silhouette keeps its ink
  g.lineWidth = sp(g, 2.6); g.strokeStyle = lineC; g.lineJoin = 'round';
  for (const q of P) g.stroke(q);
  // puffs back (top rows) to front (bottom row): each puff = flat fill + one soft shade crescent, the next covers it
  const order = blobs.map((b, i) => i).sort((a, b) => blobs[b][3] - blobs[a][3]);
  for (const i of order) {
    const [bx, by, br, row] = blobs[i];
    g.fillStyle = base; g.fill(P[i]);
    ink(g, ell(bx, by, br, br * (row === 0 ? 0.55 : 0.85), 12), { fill: null, shade: sh, light: o.light || [-br * 0.14, -br * 0.24], hatch: row === 0 ? 0.6 : false, hatchCol: 'rgba(60,50,110,0.2)', lw: 0, seed: sd + i, amp: 1.2 });
  }
}
/** Mountain ridge path points (closed to the bottom). */
export function ridgePts(seed, { y = 500, amp = 150, peaks = 4, x0 = -200, x1 = 1800, step = 40, bottom = 1000 } = {}) {
  const r = rng(seed), ph = r() * 6.28, ph2 = r() * 6.28, pts = [[x0, bottom, 1]];
  for (let x = x0; x <= x1; x += step) { const t = (x - x0) / (x1 - x0); pts.push([x, y - amp * (0.55 + 0.45 * Math.sin(t * Math.PI * peaks + ph)) * (0.75 + 0.25 * Math.sin(t * 23 + ph2)) - r() * amp * 0.08]); }
  pts.push([x1, bottom, 1]);
  return pts;
}
/** Mossy round boulder (reference: green moss caps on grey rocks). */
export function boulder(g, x, y, r, seed = 1, o = {}) {
  const R = rng(seed), pts = [];
  for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; pts.push([x + Math.cos(a) * r * (0.85 + R() * 0.25), y + Math.sin(a) * r * 0.75 * (0.85 + R() * 0.25)]); }
  ink(g, pts, { fill: o.rock || '#6d7486', shade: o.rockSh || '#3e4458', light: [-r * 0.15, -r * 0.2], hatch: true, lw: o.lw ?? 2, seed: seed * 3,
    marks: o.moss === false ? null : g2 => { g2.fillStyle = o.mossC || '#9fb04a'; g2.fill(path(g2, [[x - r * 1.1, y - r * 0.2], [x - r * 0.4, y - r * 0.55], [x + r * 0.3, y - r * 0.5], [x + r * 1.1, y - r * 0.1], [x + r, y - r * 1.2], [x - r, y - r * 1.2]], { seed: seed * 3 + 1, amp: 1 })); } });
}
/** Grass tufts along y (a row of pointed blades). */
export function grass(g, x0, x1, y, h, col, seed = 1, o = {}) {
  const r = rng(seed), pts = [[x0, y + h * 2, 1]];
  for (let x = x0; x < x1; x += h * 0.35) { const bh = h * (0.5 + r() * 0.8), lean = (r() - 0.3) * h * 0.4 + (o.wind || 0) * h * 0.4; pts.push([x, y]); pts.push([x + lean, y - bh, 1]); pts.push([x + h * 0.18, y]); }
  pts.push([x1, y + h * 2, 1]);
  ink(g, pts, { fill: col, lw: o.lw ?? 1.6, line: o.line || 'rgba(20,40,20,0.6)', seed: seed * 7, k: 0, amp: 0.6 });
}
