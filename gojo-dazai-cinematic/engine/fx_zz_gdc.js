/* fx_zz_gdc.js - GOJO vs DAZAI "CINEMATIC / UFOTABLE LIGHT" project module (only in gojo-dazai-cinematic/).
   Palettes: gdc_dusk (magic-hour harbour: violet sky, hot magenta/orange horizon, teal water), gdc_purple (Hollow Purple lit world).
   Overlays (screen-space, hard-edged shapes - no soft blur blobs):
     gdcBokeh(g, t, {n, cols, seed, a, rMin, rMax, drift, side})  foreground hexagonal bokeh discs (flat fill + bright rim), additive ('glow')
     gdcEmbers(g, t, {n, cols, seed, rise, a, size, x0,x1})       glowing particle shards (diamond + white core), rising, flicker ('glow')
     gdcFlare(g, p, t, {col, a, len, ghosts})                     anamorphic streak + star spikes + hexagon ghosts through centre ('glow'); p world|{x,y}
     gdcShafts(g, p, t, {col, n, a, spread, len, ang})            hard light shafts from a source ('glow')
     gdcLetterbox(g, k)                                           2.39:1 bars (k 0..1), drawn in f.text (sharp, ungraded)
     gdcSub(g, text, {who, col, t, t0, t1})                       subtitle with fade
     gdcCelBurst(g, c, t, {dur, r, cols, seed, ring})             hard-edged anime explosion: bright core, cel bands, dark rim, shock ring, debris shards
*/
'use strict';
Object.assign(PALETTES, {
  gdc_dusk: { skyTop: '#1a0a3a', skyMid: '#5a1a6a', skyLow: '#ff6a5a', fog: '#7a3a7a', sun: [.35, .45, .5], ground: '#5a4a62', ground2: '#2e2440', wall: '#b24a3a', wallShade: '#4a1a32',
    roof: '#3a2a48', roofShade: '#1c1430', wood: '#4a2a2a', cloud: '#c85a8a', cloudShade: '#4a1e5a', haze: .5, line: '#120818', amb: '#ff9ac0', stars: true },
  gdc_purple: { skyTop: '#12052e', skyMid: '#3a106a', skyLow: '#b04aff', fog: '#5a2a9a', sun: [.35, .45, .5], ground: '#4a3a6a', ground2: '#241a44', wall: '#7a3a8a', wallShade: '#2a1040',
    roof: '#2a1a48', roofShade: '#140a28', wood: '#3a1a3a', cloud: '#8a4ad8', cloudShade: '#2a0e5a', haze: .5, line: '#0c0418', amb: '#c89aff', stars: true },
});
Object.assign(GRADES, {
  gdc_dusk: { sat: 1.22, contrast: 1.12, tint: ['#ffc8e0', .1], lift: ['#2a0a4a', .08], soft: ['#ff8a5a', .12] },
  gdc_purple: { sat: 1.25, contrast: 1.15, tint: ['#e0c8ff', .14], lift: ['#1a0838', .1], soft: ['#b04aff', .16] },
});
function gdcP(p) { if (!p) return null; if (Array.isArray(p)) { const q = project(p); return q ? { x: q.x, y: q.y } : null; } return p; }
function gdcHex(g, x, y, r, rot) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i / 6 * TAU; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (!i) g.moveTo(px, py); else g.lineTo(px, py); } g.closePath(); }
function gdcBokeh(g, t, o = {}) {
  const n = o.n || 16, cols = o.cols || ['#ff9ad0', '#ffd27a', '#7fe8ff', '#c08aff'], seed = o.seed || 7, A = o.a == null ? 1 : o.a;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i * 13), h2 = hash(seed + i * 29), h3 = hash(seed + i * 41), h4 = hash(seed + i * 53);
    const r = (o.rMin || 26) + h3 * ((o.rMax || 120) - (o.rMin || 26));
    let x = (o.x0 == null ? -100 : o.x0) + h1 * ((o.x1 == null ? W + 100 : o.x1) - (o.x0 == null ? -100 : o.x0)) + t * (o.drift == null ? 30 : o.drift) * (.4 + h4) * (r / 80);
    let y = h2 * H + Math.sin(t * .7 + i) * 12 - t * 8 * h4;
    if (o.side === 'edges' && x > W * .3 && x < W * .7) x = x < W / 2 ? x - W * .32 : x + W * .32;
    const col = cols[i % cols.length], a = A * (.1 + h4 * .14) * (.85 + .15 * Math.sin(t * 3 + i * 2));
    gdcHex(g, x, y, r, .3 + h1); g.fillStyle = rgba(col, a); g.fill();
    g.lineWidth = Math.max(1.5, r * .06); g.strokeStyle = rgba(col, Math.min(1, a * 2.4)); g.stroke();
    gdcHex(g, x - r * .18, y - r * .18, r * .45, .3 + h1); g.fillStyle = rgba('#ffffff', a * .35); g.fill();
  }
  g.restore();
}
function gdcEmbers(g, t, o = {}) {
  const n = o.n || 40, cols = o.cols || ['#ff8a3a', '#ffd27a', '#ff5ab0'], seed = o.seed || 3, A = o.a == null ? 1 : o.a, sz = o.size || 7, rise = o.rise == null ? 120 : o.rise;
  const x0 = o.x0 == null ? 0 : o.x0, x1 = o.x1 == null ? W : o.x1, y0 = o.y0 == null ? 0 : o.y0, y1 = o.y1 == null ? H : o.y1;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i * 7), h2 = hash(seed + i * 17), h3 = hash(seed + i * 31), sp = .5 + h3;
    const yy = y0 + ((h2 * (y1 - y0) - t * rise * sp) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
    const x = x0 + h1 * (x1 - x0) + Math.sin(t * (1.3 + h3) + i) * 28 + (o.wind || 0) * t * sp;
    const s = sz * (.5 + h3 * 1.1), fl = .55 + .45 * Math.sin(t * 11 * (0.6 + h2) + i * 3), col = cols[i % cols.length], ang = Math.sin(t * 2 + i) * .6;
    g.save(); g.translate(x, yy); g.rotate(ang);
    g.fillStyle = rgba(col, .85 * A * fl); g.beginPath(); g.moveTo(0, -s * 2.2); g.lineTo(s * .7, 0); g.lineTo(0, s * 2.2); g.lineTo(-s * .7, 0); g.closePath(); g.fill();
    g.fillStyle = rgba('#ffffff', .95 * A * fl); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * .3, 0); g.lineTo(0, s); g.lineTo(-s * .3, 0); g.closePath(); g.fill();
    g.restore();
  }
  g.restore();
}
function gdcFlare(g, p, t, o = {}) {
  const q = gdcP(p); if (!q) return; const col = o.col || '#9fd8ff', A = o.a == null ? 1 : o.a, len = o.len || 1.0, fl = .9 + .1 * Math.sin(t * 9);
  g.save(); g.globalCompositeOperation = 'lighter';
  // anamorphic streak: stacked hard bars, tapered
  const bars = [[W * .9 * len, 10, .28], [W * .6 * len, 5, .5], [W * .35 * len, 2.4, .9]];
  for (const [L, h, a] of bars) { g.fillStyle = rgba(col, a * A * fl); g.beginPath(); g.moveTo(q.x - L, q.y); g.lineTo(q.x, q.y - h); g.lineTo(q.x + L, q.y); g.lineTo(q.x, q.y + h); g.closePath(); g.fill(); }
  // star spikes
  const sp = o.spikes || 6; for (let i = 0; i < sp; i++) { const a = i / sp * Math.PI + .2 + t * .15, L = (i % 2 ? 90 : 170) * (o.size || 1); g.fillStyle = rgba('#ffffff', .55 * A * fl);
    g.beginPath(); g.moveTo(q.x + Math.cos(a) * L, q.y + Math.sin(a) * L); g.lineTo(q.x + Math.cos(a + HP) * 5, q.y + Math.sin(a + HP) * 5); g.lineTo(q.x - Math.cos(a) * L, q.y - Math.sin(a) * L); g.lineTo(q.x - Math.cos(a + HP) * 5, q.y - Math.sin(a + HP) * 5); g.closePath(); g.fill(); }
  // hot core: hard discs
  g.fillStyle = rgba(col, .45 * A); g.beginPath(); g.arc(q.x, q.y, 46 * (o.size || 1), 0, TAU); g.fill();
  g.fillStyle = rgba('#ffffff', .95 * A); g.beginPath(); g.arc(q.x, q.y, 20 * (o.size || 1), 0, TAU); g.fill();
  // hexagon ghosts on the axis through the frame centre
  if (o.ghosts !== false) { const cx = W / 2, cy = H / 2, gh = [[.35, 34, '#ff9ad0'], [.6, 18, '#ffd27a'], [1.25, 64, '#7fe8ff'], [1.55, 26, '#c08aff'], [1.9, 90, '#9affc8']];
    for (const [k, r, c] of gh) { const x = q.x + (cx - q.x) * k * 2 * .5 * 2 * .5 * 2, y = q.y + (cy - q.y) * k * 2 * .5 * 2 * .5 * 2; gdcHex(g, x, y, r, .2); g.fillStyle = rgba(c, .1 * A); g.fill(); g.lineWidth = 2; g.strokeStyle = rgba(c, .28 * A); g.stroke(); } }
  g.restore();
}
function gdcShafts(g, p, t, o = {}) {
  const q = gdcP(p); if (!q) return; const n = o.n || 7, col = o.col || '#ffd2a0', A = o.a == null ? .12 : o.a, L = o.len || 1800, base = o.ang == null ? HP : o.ang, spread = o.spread || .9;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const h = hash(i * 19 + (o.seed || 1)), a = base + (h - .5) * spread + Math.sin(t * .4 + i) * .02, w = .012 + hash(i * 7 + 3) * .05;
    g.fillStyle = rgba(col, A * (.5 + h)); g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(a - w) * L, q.y + Math.sin(a - w) * L); g.lineTo(q.x + Math.cos(a + w) * L, q.y + Math.sin(a + w) * L); g.closePath(); g.fill(); }
  g.restore();
}
function gdcLetterbox(g, k = 1) { const h = 70 * k; if (h <= 0) return; g.save(); g.fillStyle = '#05030a'; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h); g.restore(); }
function gdcSub(g, text, o = {}) {
  const t = o.t, t0 = o.t0, t1 = o.t1; if (t < t0 || t > t1) return; const a = clamp(Math.min((t - t0) / .12, (t1 - t) / .15), 0, 1);
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; const y = o.y || 985, size = o.size || 54;
  g.font = `700 ${size}px Inter, "Inter Display", Arial, sans-serif`; g.lineJoin = 'round';
  if (o.who) { g.font = `800 ${Math.round(size * .55)}px Inter, Arial, sans-serif`; g.lineWidth = 6; g.strokeStyle = '#000'; g.strokeText(o.who, W / 2, y - size - 6); g.fillStyle = o.col || '#fff'; g.fillText(o.who, W / 2, y - size - 6); g.font = `700 ${size}px Inter, "Inter Display", Arial, sans-serif`; }
  g.lineWidth = 9; g.strokeStyle = '#000'; g.strokeText(text, W / 2, y); g.fillStyle = '#ffffff'; g.fillText(text, W / 2, y);
  g.restore();
}
// hard-edged anime explosion (cel bands, bright core, dark rim, shock ring, shards) - screen or world centre
function gdcCelBurst(g, c, t, o = {}) {
  const q = gdcP(c); if (!q) return; const dur = o.dur || 1.0, u = t / dur; if (u < 0 || u > 1.25) return;
  const R = (o.r || 300) * (1 - Math.pow(1 - Math.min(1, u * 1.6), 3)), seed = o.seed || 11, cols = o.cols || ['#3a0a6a', '#9a3aff', '#e0a0ff', '#ffffff'];
  const fade = 1 - clamp((u - .75) / .5, 0, 1);
  g.save(); g.globalAlpha = fade;
  const band = (r, col, jag, s2) => { blobPath(g, q.x, q.y, r, seed + s2, 14, jag, t * 2); g.fillStyle = col; g.fill(); };
  band(R * 1.08, cols[0], .22, 1); band(R * .86, cols[1], .2, 2); band(R * .6, cols[2], .16, 3); band(R * .34 * (1 - u * .4), cols[3], .1, 4);
  // shock ring (hard)
  const rr = (o.r || 300) * (.4 + u * 1.9); g.lineWidth = Math.max(2, 26 * (1 - u)); g.strokeStyle = rgba(o.ring || '#ffffff', .9 * (1 - u)); g.beginPath(); g.ellipse(q.x, q.y, rr, rr * (o.flat || .45), 0, 0, TAU); g.stroke();
  // shards
  g.fillStyle = o.shard || '#1a0828'; for (let i = 0; i < 26; i++) { const a = hash(seed + i * 3) * TAU, d = R * (.9 + u * 1.8 * (.5 + hash(seed + i))), s = 6 + hash(seed + i * 5) * 16;
    const x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .8 + u * u * 120; g.beginPath(); g.moveTo(x + Math.cos(a) * s * 2, y + Math.sin(a) * s * 2); g.lineTo(x + Math.cos(a + 2) * s, y + Math.sin(a + 2) * s); g.lineTo(x + Math.cos(a - 2) * s, y + Math.sin(a - 2) * s); g.closePath(); g.fill(); }
  g.restore();
}
