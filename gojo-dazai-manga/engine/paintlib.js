/* Painting helpers borrowed from ../ace-tribute (paint.js: noise / paint texture / smoke masses / cel clouds; fx.js: fxDust). */
const BG = {};
function noiseTex(size, seed, alpha = 30) {
  const c = mkCanvas(size, size), g = c.getContext('2d'), im = g.createImageData(size, size), r = rng(seed);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = alpha; }
  g.putImageData(im, 0, 0); return c;
}
function paintTexture(g, w, h, seed, strength = .18) {
  const r = rng(seed);
  g.save(); g.globalCompositeOperation = 'overlay';
  for (let k = 0; k < 150; k++) { const x = r() * w, y = r() * h, rad = 40 + r() * 280; g.globalAlpha = strength * (.3 + r() * .7); g.fillStyle = radial(g, x, y, rad, [[0, r() > .5 ? '#ffffff' : '#000000'], [1, 'rgba(0,0,0,0)']]); g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  g.globalAlpha = strength * .9; const n = noiseTex(256, seed + 1, 60); for (let y = 0; y < h; y += 256) for (let x = 0; x < w; x += 256) g.drawImage(n, x, y);
  g.globalAlpha = strength * .5; for (let k = 0; k < 240; k++) { const x = r() * w, y = r() * h, l = 60 + r() * 300; g.strokeStyle = r() > .5 ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)'; g.lineWidth = 1 + r() * 4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (r() - .5) * 20, x + l, y + (r() - .5) * 10); g.stroke(); }
  g.restore();
}
function smokeMass(g, x, y, w, h, col, a, seed, n = 40, dark = null) {
  const r = rng(seed);
  for (let k = 0; k < n; k++) {
    const px = x + (r() - .5) * w, py = y + (r() - .5) * h * (1 - Math.abs(r() - .5)), rad = (.15 + r() * .35) * Math.min(w, h * 2);
    g.globalAlpha = a * (.4 + r() * .6); g.fillStyle = radial(g, px, py, rad, [[0, col], [.6, rgba(col, .5)], [1, rgba(col, 0)]]); g.fillRect(px - rad, py - rad, 2 * rad, 2 * rad);
    if (dark && r() < .5) { g.fillStyle = radial(g, px + rad * .2, py + rad * .3, rad * .7, [[0, rgba(dark, .5)], [1, rgba(dark, 0)]]); g.fillRect(px - rad, py - rad, 2 * rad, 2 * rad); }
  }
  g.globalAlpha = 1;
}
// cel-style cumulus: union of circles with a flat base; shade = same circles shifted down-right (lit crescent stays)
function celCloud(g, x, y, w, h, base, lit, shade, seed) {
  const r = rng(seed), C = [], n = 7 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, rr = w / n * (1.1 + r() * .9) * (.7 + Math.sin(u * Math.PI) * .6); C.push([x - w / 2 + u * w, y - Math.sin(u * Math.PI) * h * (.35 + r() * .4), rr]); }
  const path = (dx, dy, k = 1, rect = false) => { g.beginPath(); for (const [cx, cy, rr] of C) { g.moveTo(cx + dx + rr * k, cy + dy); g.arc(cx + dx, cy + dy, rr * k, 0, TAU); } if (rect) g.rect(x - w / 2 + dx, y - h * .1 + dy, w, h * .25); };
  g.save(); path(0, 0, 1, true); g.fillStyle = lit; g.fill(); g.clip();
  path(w * .025, h * .12, 1); g.fillStyle = base; g.fill();
  path(w * .05, h * .35, 1); g.fillStyle = shade; g.fill();
  g.restore();
}
// ================================================================= MARINEFORD (war) — sky, HQ fortress, platform, bay
function fxFloatDust(ctx, t, o = {}) { // floating ash/embers/dust (renamed from fxDust: fx.js owns fxDust(ctx, p, t, o))
  const r = rng(o.seed || 8), n = o.n || 60; ctx.save();
  if (o.add) ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < n; k++) {
    const vx = (r() - .3) * (o.vx || 30), vy = -(10 + r() * (o.vy || 40)), x = ((r() * W + t * vx) % W + W) % W, y = ((r() * H + t * vy) % H + H) % H, s = (o.size || 3) * (.5 + r());
    const fl = .5 + .5 * Math.sin(t * 3 + k);
    ctx.fillStyle = rgba(o.col || '#ff9a5a', (o.alpha || .7) * (.4 + .6 * fl)); ctx.beginPath(); ctx.ellipse(x, y, s, s * (o.stretch || 1), 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function fxFlare(ctx, x, y, a = 1, col = '#ffe2b0') {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  glow(ctx, x, y, 260, col, .7); glow(ctx, x, y, 60, '#ffffff', .9);
  ctx.fillStyle = rgba(col, .5); ctx.fillRect(x - 700, y - 2, 1400, 4);
  const cx = W / 2, cy = H / 2; for (const [k, rr, c] of [[.5, 40, '#9fd0ff'], [1.3, 90, '#ffb0e0'], [1.8, 30, '#b0ffd0']]) { const px = x + (cx - x) * k * 2, py = y + (cy - y) * k * 2; glow(ctx, px, py, rr, c, .35); }
  ctx.restore();
}
