// Effects for the 2D "Four Arrows" cutscene: speed lines, impact frames, flashes, shockwave rings, dust, sparks,
// fur tufts, spirit lights. Everything is deterministic (seeded) and drawn with plain Canvas 2D (no filters).
import { ART, rng, hash, ink, ell, sp, dogSil, line } from './art.js';

/** Speed lines. mode 'h' (parallel, horizontal travel) | 'radial' (towards cx, cy). Re-rolled every boil frame. */
export function speedLines(g, W, H, o = {}) {
  const r = rng(1000 + ART.boil * 17 + (o.seed || 0)), n = o.n || 46, col = o.col || 'rgba(255,255,255,0.85)';
  g.save(); g.fillStyle = col;
  if (o.mode === 'radial') {
    const cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, R = Math.hypot(W, H), inner = o.inner ?? 0.32;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, w = (0.004 + r() * 0.012), r0 = R * (inner + r() * 0.25);
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      g.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
      g.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
    }
    g.fill();
  } else {
    const dir = o.dir || -1;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const y = r() * H, len = W * (0.2 + r() * 0.5), x = r() * W * 1.2 - W * 0.1, th = 1 + r() * (H * 0.006);
      if (o.clearY && Math.abs(y - o.clearY) < (o.clearH || 0)) continue;
      g.moveTo(x, y); g.lineTo(x + len * dir, y - th * 0.5); g.lineTo(x + len * dir, y + th * 0.5);
    }
    g.fill();
  }
  g.restore();
}

/** Black/white impact frame with a radial burst. invert: white bg / black spikes. */
export function impactFrame(g, W, H, cx, cy, o = {}) {
  const inv = !!o.invert, r = rng(2000 + (o.seed || 0) + ART.boil);
  g.fillStyle = inv ? '#f4f1ea' : '#08070a'; g.fillRect(0, 0, W, H);
  g.fillStyle = inv ? '#08070a' : '#f4f1ea';
  const R = Math.hypot(W, H);
  g.beginPath();
  for (let i = 0; i < 26; i++) {
    const a = (i + r() * 0.6) / 26 * Math.PI * 2, w = 0.03 + r() * 0.07, r0 = R * (0.04 + r() * 0.08);
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
    g.lineTo(cx + Math.cos(a + w * 0.3) * R, cy + Math.sin(a + w * 0.3) * R);
  }
  g.fill();
  g.beginPath(); g.arc(cx, cy, H * 0.07, 0, 7); g.fill();
}

/** Expanding shockwave ring (ground ellipse). k 0..1 */
export function shockRing(g, x, y, R, k, o = {}) {
  if (k <= 0 || k >= 1) return;
  const rr = R * (0.15 + 0.85 * Math.pow(k, 0.6)), a = 1 - k;
  g.save(); g.globalAlpha = a;
  g.lineWidth = sp(g, 7 * a + 1.5); g.strokeStyle = o.col || '#f6eedc';
  g.beginPath(); g.ellipse(x, y, rr, rr * (o.flat ?? 0.22), 0, 0, 7); g.stroke();
  g.lineWidth = sp(g, 2); g.strokeStyle = ART.ink;
  g.beginPath(); g.ellipse(x, y, rr * 1.04, rr * (o.flat ?? 0.22) * 1.04, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.restore();
}

// ------------------------------------------------------------------------------------------ particles
// kinds: dust (cel puff), spark (streak), tuft (fur), leaf, spirit (glow + dog silhouette rising), debris (pebble)
export class Parts {
  constructor(seed = 1) { this.r = rng(seed); this.list = []; }
  clear() { this.list.length = 0; }
  add(kind, x, y, n = 1, o = {}) {
    const R = this.r;
    for (let i = 0; i < n; i++) {
      const a = (o.a0 ?? 0) + (o.spread ?? Math.PI * 2) * R() - (o.spread ?? Math.PI * 2) / 2 + (o.dir ?? 0);
      const v = (o.speed ?? 200) * (0.4 + R() * 0.8);
      this.list.push({ kind, x: x + (R() - 0.5) * (o.jx || 0), y: y + (R() - 0.5) * (o.jy || 0), vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        t: 0, life: (o.life ?? 1) * (0.7 + R() * 0.6), s: (o.size ?? 20) * (0.6 + R() * 0.8), g: o.grav ?? (kind === 'dust' ? -20 : kind === 'spirit' ? -40 : 600),
        rot: R() * 6.28, vr: (R() - 0.5) * 8, col: o.col, drag: o.drag ?? (kind === 'dust' ? 2.2 : 0.4), id: o.id, seed: Math.floor(R() * 1000) });
    }
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i]; p.t += dt;
      if (p.t > p.life) { this.list.splice(i, 1); continue; }
      const dr = Math.exp(-p.drag * dt); p.vx *= dr; p.vy *= dr; p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
  }
  draw(g) {
    for (const p of this.list) {
      const k = p.t / p.life;
      if (p.kind === 'dust') {
        const s = p.s * (0.5 + k * 1.3);
        g.save(); g.globalAlpha = Math.min(0.85, (1 - k) * 1.3);
        ink(g, ell(p.x, p.y, s, s * 0.7, 9, p.rot), { fill: p.col || '#d8c8a6', shade: '#a8967a', light: [-s * 0.2, -s * 0.3], lw: 1.4, line: 'rgba(70,55,40,0.7)', seed: p.seed });
        g.restore();
      } else if (p.kind === 'spark') {
        g.save(); g.globalAlpha = 1 - k; g.strokeStyle = p.col || '#ffe9a8'; g.lineWidth = sp(g, 2.4 * (1 - k) + 0.6); g.lineCap = 'round';
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); g.stroke(); g.restore();
      } else if (p.kind === 'tuft') {
        g.save(); g.globalAlpha = Math.min(1, (1 - k) * 2); g.translate(p.x, p.y); g.rotate(p.rot);
        const s = p.s;
        ink(g, [[-s, 0], [-s * 0.2, -s * 0.25], [s, -s * 0.15, 1], [s * 0.1, s * 0.1], [s * 0.9, s * 0.3, 1], [-s * 0.2, s * 0.25]], { fill: p.col || '#b47c40', lw: 1.2, seed: p.seed, k: 0.1 });
        g.restore();
      } else if (p.kind === 'leaf') {
        g.save(); g.translate(p.x + Math.sin(p.t * 3 + p.seed) * 20, p.y); g.rotate(p.rot); g.scale(1, 0.4 + 0.5 * Math.abs(Math.sin(p.t * 4 + p.seed)));
        ink(g, ell(0, 0, p.s, p.s * 0.45, 8), { fill: p.col || '#c8a040', lw: 1, seed: p.seed }); g.restore();
      } else if (p.kind === 'debris') {
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); ink(g, ell(0, 0, p.s, p.s * 0.7, 6), { fill: p.col || '#7a6a56', lw: 1.2, seed: p.seed }); g.restore();
      } else if (p.kind === 'mote') {
        const a = Math.sin(Math.min(1, k) * Math.PI);
        glow(g, p.x, p.y, p.s, p.col || '#dfeeff', a * 0.9);
      }
    }
  }
}

/** Soft glow ball (radial gradient). */
export function glow(g, x, y, r, col = '#dfeeff', a = 1) {
  if (a <= 0.01) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.25, rgba(col, a * 0.55)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
export function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`; }

/** Spirit light: soft glow with a faint dog silhouette, rising. k 0..1 over its life; id = dog. */
export function spirit(g, x, y, s, k, id, o = {}) {
  const a = Math.min(1, k * 3) * (1 - Math.max(0, k - 0.75) * 4) * (o.alpha ?? 1);
  if (a <= 0) return;
  const yy = y - k * (o.rise ?? 120) * s;
  glow(g, x, yy, 90 * s, '#cfe4ff', a * 0.7);
  glow(g, x, yy, 30 * s, '#ffffff', a * 0.8);
  if (id) { g.save(); g.globalAlpha = a * 0.55; g.translate(x - 10 * s, yy + 40 * s); g.scale(0.55 * s, 0.55 * s); dogSil(g, '#eef6ff', id, 'stand'); g.restore(); }
}

/** Ground dust burst helper. */
export function dustBurst(P, x, y, n = 14, o = {}) {
  P.add('dust', x, y, n, { dir: -Math.PI / 2, spread: Math.PI * 0.9, speed: o.speed ?? 320, size: (o.size ?? 34) * 0.7, life: o.life ?? 1.2, jx: o.jx ?? 80, jy: 10, col: o.col });
  if (o.debris !== false) P.add('debris', x, y, Math.ceil(n / 2), { dir: -Math.PI / 2, spread: Math.PI * 0.8, speed: 520, size: 6, life: 1, grav: 1400, jx: 40 });
}

/** Paper grain tiles (3 boil states), drawn into a small overlay canvas that CSS scales up. */
export function makeGrain(w = 200, h = 100) {
  const tiles = [];
  for (let b = 0; b < 3; b++) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), d = g.createImageData(w, h), r = rng(77 + b);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = r(); const fib = hash(i * 0.0007 + b) > 0.997 ? 1 : 0;   // rare paper fibres
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v > 0.5 ? 255 : 30; d.data[i + 3] = fib ? 40 : Math.floor(Math.abs(v - 0.5) * 34);
    }
    g.putImageData(d, 0, 0); tiles.push(c);
  }
  return tiles;
}
export { line };
