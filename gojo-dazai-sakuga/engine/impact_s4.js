/* engine/impact_s4.js (S4) - SPOILER WARNING: finale impact frames (part 4). Do not show this file to the viewer.
   STYLES (IMPACT.*):
     s4thread   red threads stitch the frame shut on white paper, stitch ticks, figures as pale lineart; k>=p.eyesAt -> stitched doll eyes in negative
     s4gold     gold overexposure; figures turn to white-hot silhouettes with a gold rim (sun burn)
     s4compass  snowflake compass (numerals 1..12) over a negative; p.burn: numerals catch fire one per frame
     s4blue     destructive shock rings: concentric blue rings on black, white core, optional red ring (p.red)
     s4hex      blood-mist: crimson hexagon shards crack outward from the focus
     s4dragon   orange flame-dragon silhouette (serpentine body + head) as a speed burst, figures black
   SEQUENCES (IMPACT_SEQ): S4_F1 S4_F2 S4_F3 S4_F4 S4_F5 S4_M1..S4_M14 S4_FZ (+ shot-list aliases X-F1.. X-FZ)                    */
'use strict';
function s4Stitch(g, x0, y0, x1, y1, w, col, tick, seed) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  g.save(); g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath();
  const n = 14; for (let i = 0; i <= n; i++) { const u = i / n, sag = Math.sin(u * Math.PI) * (hash(seed) - .5) * 80; const x = x0 + dx * u + nx * sag, y = y0 + dy * u + ny * sag; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  if (tick) { g.lineWidth = w * .8; const m = Math.floor(L / tick); for (let i = 1; i < m; i++) { const u = i / m, sag = Math.sin(u * Math.PI) * (hash(seed) - .5) * 80, x = x0 + dx * u + nx * sag, y = y0 + dy * u + ny * sag; g.beginPath(); g.moveTo(x - nx * w * 3 - dx / L * w * 1.5, y - ny * w * 3 - dy / L * w * 1.5); g.lineTo(x + nx * w * 3 + dx / L * w * 1.5, y + ny * w * 3 + dy / L * w * 1.5); g.stroke(); } }
  g.restore();
}
IMPACT.s4thread = (c, g, f, p, k) => {
  const F = impFocus(f, p); fillAll(g, p.bg || '#fbf4ee');
  rawDraw(g, impFigs(f, p.bg || '#fbf4ee', '#c8a8b0', 1.2));
  const n = (p.n || 9) + k * 4;
  for (let i = 0; i < n; i++) { const a = hash(i * 7 + 3) * Math.PI, R = 1400; const ox = (hash(i * 11) - .5) * 900, oy = (hash(i * 13) - .5) * 500;
    const x0 = F.x + ox - Math.cos(a) * R, y0 = F.y + oy - Math.sin(a) * R, x1 = F.x + ox + Math.cos(a) * R, y1 = F.y + oy + Math.sin(a) * R; s4Stitch(g, x0, y0, x1, y1, i % 3 ? 3 : 6, i % 4 ? (p.col || '#c8142a') : '#5a0410', i % 2 ? 26 : 0, i); }
  if (p.eyes || (p.eyesAt != null && k >= p.eyesAt)) { // stitched doll eyes in negative (black field, white stitches)
    g.save(); g.globalCompositeOperation = 'difference'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineWidth = 14;
    for (const sg of [-1, 1]) { const ex = W / 2 + sg * 330, ey = H * .44; g.beginPath(); g.moveTo(ex - 190, ey); g.lineTo(ex + 190, ey); g.stroke(); for (let j = 0; j < 4; j++) { const x = ex - 140 + j * 93; g.beginPath(); g.moveTo(x, ey - 60); g.lineTo(x, ey + 60); g.stroke(); } }
    g.fillStyle = '#ff2a3a'; g.beginPath(); g.ellipse(W / 2, H * .7, 60, 26, 0, 0, TAU); g.fill(); g.restore(); }
};
IMPACT.s4gold = (c, g, f, p, k) => {
  rawDraw(g, filtered(c, 'brightness(2.2) contrast(1.5) saturate(1.6) sepia(.5)'));
  g.save(); g.globalCompositeOperation = 'screen'; const F = impFocus(f, p); const gr = g.createRadialGradient(F.x, F.y, 40, F.x, F.y, 1300); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, p.col || '#ffd27a'); gr.addColorStop(1, '#a8501a'); g.fillStyle = gr; g.globalAlpha = .85; g.fillRect(0, 0, W, H); g.restore();
  const sil = impSil('chars', p.rim || '#ffb030'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6]]) g.drawImage(sil, dx * OUT.scale, dy * OUT.scale); g.restore();
  rawDraw(g, impSil('chars', p.fill || '#fffaf0'));
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU + k * .05; g.save(); g.globalCompositeOperation = 'screen'; g.strokeStyle = rgba('#fff2c8', .35); g.lineWidth = 10 + 18 * hash(i); g.beginPath(); g.moveTo(F.x + Math.cos(a) * 200, F.y + Math.sin(a) * 200); g.lineTo(F.x + Math.cos(a) * 1800, F.y + Math.sin(a) * 1800); g.stroke(); g.restore(); }
};
const S4_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
IMPACT.s4compass = (c, g, f, p, k) => {
  rawDraw(g, filtered(c, `invert(1) hue-rotate(${p.hue == null ? 170 : p.hue}deg) saturate(1.5) contrast(1.4) brightness(${p.dark ? .5 : .9})`)); const F = impFocus(f, p), R = p.r || 430;
  g.save(); g.translate(F.x, F.y); g.rotate(k * .06 + (p.rot || 0)); const col = p.col || '#bff0ff'; g.strokeStyle = col; g.lineCap = 'round';
  g.globalCompositeOperation = 'lighter'; for (const rr of [1, .9, .45, .16]) { g.lineWidth = rr === 1 ? 8 : 4; g.beginPath(); g.arc(0, 0, R * rr, 0, TAU); g.stroke(); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - HP, l = i % 3 ? R * .9 : R * 1.12; g.lineWidth = i % 3 ? 3 : 7; g.beginPath(); g.moveTo(Math.cos(a) * R * .16, Math.sin(a) * R * .16); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.stroke();
    for (const fr of [.4, .66]) for (const sg of [-1, 1]) { const b0 = R * fr; g.beginPath(); g.moveTo(Math.cos(a) * b0, Math.sin(a) * b0); g.lineTo(Math.cos(a + sg * .2) * (b0 + R * .12), Math.sin(a + sg * .2) * (b0 + R * .12)); g.stroke(); } }
  g.globalCompositeOperation = 'source-over'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lit = p.burn ? Math.min(12, Math.floor((k + 1) * 12 / (p.nFrames || 3))) : 0;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - HP, x = Math.cos(a) * R * 1.24, y = Math.sin(a) * R * 1.24; const burning = i < lit;
    if (burning) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, 90, '#ff7a1a', .9); g.restore(); flameTongue(g, x, y + 20, 46, 120, 0, ['#7a0c04', '#ff5a1a', '#ffe08a'], i + k * 13); }
    g.font = `900 ${i >= 9 ? 46 : 62}px "IPAGothic", serif`; g.lineWidth = 8; g.strokeStyle = burning ? '#3a0602' : '#03203a'; g.strokeText(S4_NUM[i], x, y); g.fillStyle = burning ? '#ffe9a0' : col; g.fillText(S4_NUM[i], x, y); }
  if (p.needle !== false) { const na = (p.needleAng == null ? -HP : p.needleAng); g.fillStyle = p.needleCol || '#ff3a5a'; g.beginPath(); g.moveTo(Math.cos(na) * R * 1.05, Math.sin(na) * R * 1.05); g.lineTo(Math.cos(na + HP) * 18, Math.sin(na + HP) * 18); g.lineTo(Math.cos(na + Math.PI) * R * .3, Math.sin(na + Math.PI) * R * .3); g.lineTo(Math.cos(na - HP) * 18, Math.sin(na - HP) * 18); g.closePath(); g.fill(); }
  g.restore();
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: 60, col: '#e8fbff', inner: R * 1.1, w: 4, alpha: .7 }, F));
};
IMPACT.s4blue = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#01040c'); const F = impFocus(f, p);
  g.save(); g.globalCompositeOperation = 'lighter'; rawDraw(g, impSil('glow', '#4ab8ff'), 0, 0, .8); g.restore();
  for (let i = 0; i < 8; i++) { const r = 70 + i * 130 + k * 90; g.lineWidth = 22 - i * 2.2; g.strokeStyle = (p.red && i === 2) ? '#ff3a5a' : i % 2 ? '#4ab8ff' : '#e8fbff'; g.beginPath(); g.ellipse(F.x, F.y, r, r * .78, .1, 0, TAU); g.stroke(); }
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, F.x, F.y, 260, '#ffffff', .95); g.restore();
  rawDraw(g, impFigs(f, '#01040c', '#bfeaff', 1.8));
  fxSpeedLines(g, f.T + k, Object.assign({ n: 90, col: '#9fdcff', inner: 420, w: 3, alpha: .7 }, F));
};
IMPACT.s4hex = (c, g, f, p, k) => {
  rawDraw(g, filtered(c, 'brightness(.6) saturate(1.6) sepia(.4) hue-rotate(-20deg)')); const F = impFocus(f, p), sz = 70;
  g.save(); g.lineJoin = 'miter';
  for (let q = -12; q <= 12; q++) for (let r = -8; r <= 8; r++) { const x = F.x + sz * 1.5 * q, y = F.y + sz * Math.sqrt(3) * (r + q / 2); const d = Math.hypot(x - F.x, y - F.y); if (d > 260 + k * 420) continue;
    const push = (1 - d / 1400) * (20 + k * 40), a = Math.atan2(y - F.y, x - F.x), cx = x + Math.cos(a) * push, cy = y + Math.sin(a) * push; g.beginPath(); for (let i = 0; i < 6; i++) { const aa = i / 6 * TAU; const px = cx + Math.cos(aa) * sz * .92, py = cy + Math.sin(aa) * sz * .92; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath();
    g.fillStyle = rgba(hash(q * 31 + r * 7) > .5 ? '#d2203a' : '#7a0618', .55 + .35 * hash(q + r * 3)); g.fill(); g.lineWidth = 3; g.strokeStyle = '#ffd0d6'; g.stroke(); }
  g.restore(); rawDraw(g, impSil('chars', '#14020a'));
};
function s4DragonPath(F, k, scale = 1) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([F.x - 1100 * scale + u * 1500 * scale, F.y + Math.sin(u * 7 + k * .8) * 170 * scale * (1 - u * .4) + (1 - u) * 160 * scale]); } return pts; }
function s4DragonHead2D(g, x, y, s, dir, cols, ink) { // dragon head in profile facing 'dir' (+1 right)
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  const C = cols || ['#ff6a1a', '#ffd24a', '#fff6d8'];
  g.fillStyle = C[0]; g.beginPath(); g.moveTo(-60, -40); g.quadraticCurveTo(10, -95, 90, -60); g.lineTo(190, -40); g.quadraticCurveTo(215, -25, 200, -8); g.lineTo(120, 0); g.lineTo(205, 22); g.quadraticCurveTo(195, 55, 150, 48); g.lineTo(60, 40); g.quadraticCurveTo(0, 70, -70, 40); g.closePath(); g.fill();
  if (ink) { g.lineWidth = 6; g.strokeStyle = ink; g.stroke(); }
  // horns + mane flames
  g.fillStyle = C[1]; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-40 + i * 18, -50 + i * 2); g.quadraticCurveTo(-120 - i * 10, -150 + i * 15, -170 - i * 6, -110 + i * 26); g.quadraticCurveTo(-110, -70 + i * 10, -30 + i * 18, -30); g.closePath(); g.fill(); }
  g.fillStyle = C[2]; g.beginPath(); g.moveTo(20, -70); g.quadraticCurveTo(-40, -170, -110, -175); g.quadraticCurveTo(-30, -130, 0, -55); g.closePath(); g.fill();
  // eye + teeth + whisker
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(70, -42, 22, 10, -.2, 0, TAU); g.fill(); g.fillStyle = ink || '#2a0400'; g.beginPath(); g.ellipse(76, -42, 6, 9, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff6d8'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(110 + i * 18, -2); g.lineTo(118 + i * 18, 14); g.lineTo(126 + i * 18, -2); g.fill(); }
  g.strokeStyle = C[1]; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(180, 0); g.bezierCurveTo(260, 20, 250, 90, 320, 100); g.stroke();
  g.restore();
}
IMPACT.s4dragon = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#0a0200'); const F = impFocus(f, p); const dir = p.dir || 1;
  fxSpeedLines(g, f.T + k, Object.assign({ n: 150, col: p.lineCol || '#ffb04a', inner: 300, w: 9, alpha: .9 }, F));
  const pts = s4DragonPath(F, k).map(([x, y]) => [F.x + (x - F.x) * dir, y]);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [w, col] of [[230, '#7a1004'], [170, '#ff5a14'], [90, '#ffc23a'], [30, '#fff6d8']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => { const ww = .3 + .7 * i / pts.length; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
  for (let i = 2; i < pts.length - 2; i += 2) { const [x, y] = pts[i]; flameTongue(g, x, y - 60, 60, 180 + 80 * hash(i + k), (hash(i) - .5) * .8, ['#7a0c04', '#ff5a14', '#ffd24a'], i + k * 7); }
  g.restore();
  const hd = pts[pts.length - 1]; s4DragonHead2D(g, hd[0], hd[1], 1.5, dir, null, '#2a0400');
  rawDraw(g, impSil('chars', '#000000'));
};
for (const s of ['s4thread', 's4dragon', 's4blue']) PAPER_STYLES.add(s);

Object.assign(IMPACT_SEQ, {
  S4_F1: [{ s: 'invert', n: 1, p: { hue: 150 } }, { s: 'blackaccent', n: 1, p: { accent: '#ff8fb8' } }, { s: 'rimsil', n: 2, p: { col: '#ffb04a', col2: '#e8501a' } }],
  S4_F2: [{ s: 's4blue', n: 1 }, { s: 's4thread', n: 2 }],
  S4_F3: [{ s: 's4thread', n: 2, p: { n: 12 } }, { s: 'whiteout', n: 1, p: { ink: '#7a0414' } }, { s: 's4thread', n: 1, p: { eyes: true } }],
  S4_F4: [{ s: 'overexpose', n: 1, p: { col: '#ffd27a' } }, { s: 's4gold', n: 1 }, { s: 's4compass', n: 1, p: { burn: true, nFrames: 1, hue: 200 } }, { s: 'flash', n: 1, p: { col: '#fff8e8' } }, { s: 'invert', n: 1, p: { hue: 20 } }],
  S4_F5: [{ s: 's4compass', n: 3, p: { burn: true, nFrames: 3, hue: 190 } }],
  S4_M1: [{ s: 's4blue', n: 2 }, { s: 'black', n: 1 }, { s: 's4blue', n: 1, p: { red: true } }],
  S4_M2: [{ s: 's4compass', n: 2, p: { dark: true } }],
  S4_M3: [{ s: 's4thread', n: 1 }, { s: 's4thread', n: 1, p: { n: 16 } }],
  S4_M4: [{ s: 'shatter', n: 1, p: { gap: '#9fe8ff' } }, { s: 'shatter', n: 1, p: { gap: '#ffb0cc', push: 140 } }],
  S4_M5: [{ s: 's4hex', n: 2 }],
  S4_M6: [{ s: 'flash', n: 1 }, { s: 'crimsonline', n: 1, p: { ang: -.6, w: 9 } }],
  S4_M7: [{ s: 'overexpose', n: 1, p: { col: '#ffd27a' } }, { s: 's4gold', n: 2 }, { s: 'flash', n: 1, p: { col: '#fff8e8' } }],
  S4_M8: [{ s: 'invert', n: 1, p: { hue: 150 } }, { s: 'blackaccent', n: 1, p: { accent: '#ff8fb8' } }],
  S4_M9: [{ s: 'redblack', n: 2 }],
  S4_M10: [{ s: 's4dragon', n: 2 }],
  S4_M11: [{ s: 'sumi', n: 1 }, { s: 'rimsil', n: 1, p: { col: '#ffd6e6', col2: '#ff7aa8' } }],
  S4_M12: [{ s: 'speedburst', n: 1 }, { s: 'flash', n: 1 }],
  S4_M13: [{ s: 'dualsplit', n: 1, p: { col: '#ff6a1a', col2: '#2a8ad8' } }, { s: 'flash', n: 1 }],
  S4_M14: [{ s: 'flash', n: 1 }, { s: 'invert', n: 2, p: { lines: 0 } }, { s: 'flash', n: 1 }],
  S4_FZ: [{ s: 's4dragon', n: 1, p: { dir: -1 } }, { s: 'flash', n: 1 }, { s: 'invert', n: 1, p: { hue: 150 } }, { s: 'redblack', n: 1 }, { s: 'crimsonline', n: 1, p: { ang: -.25, w: 12 } }, { s: 'flash', n: 1 }],
});
// shot-list aliases (pre/shots.json impact.style)
for (const [a, b] of [['X-F1', 'S4_F1'], ['X-F2', 'S4_F2'], ['X-F3', 'S4_F3'], ['X-F4', 'S4_F4'], ['X-F5', 'S4_F5'], ['X-FZ', 'S4_FZ']]) IMPACT_SEQ[a] = IMPACT_SEQ[b];
for (let i = 1; i <= 14; i++) IMPACT_SEQ['X-M' + i] = IMPACT_SEQ['S4_M' + i];
