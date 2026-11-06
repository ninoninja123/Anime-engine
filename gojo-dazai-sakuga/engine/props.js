/* Bleach Showdown engine - props.js : extra set pieces, props and creatures used by the showdown program.
   PALETTES.moon (moonlit night), drawMoon, drawLanterns, drawGate, drawSakeCup, drawPuddle, drawPlasterPeel,
   drawEyepatchProp, fxGrillo (Resurreccion: Grillar Grillo creature), fxIceThreadWall (Ryojin Hyoheki),
   fxPetalWall, fxIcePetal (single falling violet ice-flower petal), fxStretchArm (Mayuri Jabarakaina),
   fxNueveRings (Los Nueve Aspectos), drawSubtitleTrack.  Sets: 'gate', 'crater' (+ options on seireitei).      */
'use strict';
PALETTES.moon = { skyTop: '#0a1430', skyMid: '#1e3468', skyLow: '#4a6aa8', fog: '#34487a', sun: [-.35, .7, -.6], ground: '#6a7290', ground2: '#4e5674', wall: '#c4cce2', wallShade: '#5a6290', roof: '#2a3250', roofShade: '#161c32', wood: '#3a3044', cloud: '#a8b8e0', cloudShade: '#3a4878', haze: .55, line: '#141a30', amb: '#a8b8ff', stars: true };
PALETTES.moonwarm = Object.assign({}, PALETTES.moon, { skyLow: '#6a6aa8', fog: '#5a5a8a', amb: '#c8b8ff' });
GRADES.moon = { sat: 1.0, contrast: 1.08, tint: ['#b8c4ff', .18], lift: ['#101830', .1] };
GRADES.moonwarm = GRADES.moon;
// ---------------------------------------------------------------------------------------- moon
const MOON = { az: -2.6, el: .5 };   // world direction of the moon (az 0 = +z)
function moonDir() { const ce = Math.cos(MOON.el); return [Math.sin(MOON.az) * ce, Math.sin(MOON.el), Math.cos(MOON.az) * ce]; }
function drawMoon(ctx, pal, t, o = {}) {
  const cam = CAM.cur, d = moonDir(), p = project(vAdd(cam.pos, vMul(d, 4000))); if (!p) return null;
  const r = (o.size || 120) * (35 / (cam.fov || 35)) * (o.k || 1);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p.x, p.y, r * 6, '#8aa0e0', .45); glow(ctx, p.x, p.y, r * 2.4, '#dfe8ff', .55); ctx.restore();
  ctx.fillStyle = '#f4f2e6'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.clip(); const rr = rng(7);
  ctx.fillStyle = 'rgba(160,170,200,.35)'; for (let i = 0; i < 9; i++) { const a = rr() * TAU, dd = rr() * r * .7; ctx.beginPath(); ctx.ellipse(p.x + Math.cos(a) * dd, p.y + Math.sin(a) * dd, r * (.08 + rr() * .2), r * (.06 + rr() * .15), rr() * 3, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(120,130,190,.25)'; ctx.beginPath(); ctx.arc(p.x + r * .35, p.y + r * .25, r * 1.05, 0, TAU); ctx.arc(p.x, p.y, r * 1.2, 0, TAU, true); ctx.fill('evenodd');
  ctx.restore(); return { x: p.x, y: p.y, r };
}
// ---------------------------------------------------------------------------------------- lanterns along the street walls
function drawLanterns(ctx, pal, t, o = {}) {
  const st = o.street || 7, n = o.n || 14;
  const items = []; for (let i = 0; i < n; i++) for (const sd of [-1, 1]) { const z = 6 - i * 9 + (sd > 0 ? 4 : 0); items.push([sd * (st - .1), 2.65, z, i * 2 + (sd > 0)]); }
  items.sort((a, b) => camDepth(b) - camDepth(a));
  for (const [x, y, z, k] of items) {
    if (o.broken && hash(k * 7) < o.broken) continue;
    const sway = Math.sin(t * 1.3 + k) * .05; const top = [x, y + .35, z], c = [x + sway, y, z]; const p = project(c), q = project(top); if (!p || !q || p.z > 160) continue;
    const s = p.s, w = .24 * s, h = .36 * s;
    ctx.strokeStyle = rgba('#20182a', .8); ctx.lineWidth = Math.max(1, .02 * s); ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y - h * .5); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p.x, p.y, w * 5, '#ffb060', .35 * (o.glow == null ? 1 : o.glow)); ctx.restore();
    ctx.fillStyle = fogMix('#ffcf8a', p.z, pal, .6); ctx.beginPath(); ctx.ellipse(p.x, p.y, w * .5, h * .5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba('#e0602a', .55); ctx.beginPath(); ctx.ellipse(p.x + w * .15, p.y, w * .32, h * .45, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a1a1a'; ctx.fillRect(p.x - w * .3, p.y - h * .55, w * .6, h * .1); ctx.fillRect(p.x - w * .3, p.y + h * .45, w * .6, h * .1);
    if (s > 30) { ctx.strokeStyle = rgba('#8a4a2a', .6); ctx.lineWidth = 1; for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.ellipse(p.x, p.y + j * h * .2, w * .5, h * .06, 0, 0, Math.PI); ctx.stroke(); } }
  }
}
// ---------------------------------------------------------------------------------------- the great gate (two-tier roof, huge doors)
function drawGate(ctx, pal, t, o = {}) {
  const z = o.z == null ? -34 : o.z, Wd = o.w || 16, Hh = o.h || 9;
  const b1 = { c: [0, 0, z], w: Wd, d: 6, h: Hh, roof: 'hip', rh: 2.4, ov: 1.4, base: 1.2, wall: '#d8d0c0', seed: 501 };
  drawBuilding(ctx, b1, pal);
  const b2 = { c: [0, Hh + 1.6, z], w: Wd * .62, d: 4.2, h: 2.6, roof: 'hip', rh: 2.2, ov: 1.2, base: 0, wall: '#d8d0c0', seed: 502 }; b2.c[1] = Hh + 1.0; drawBuilding(ctx, b2, pal);
  // doors (dark wood with iron studs) on the front face
  const fz = z + 3.02, dp = projPoly([[-3.2, 0, fz], [3.2, 0, fz], [3.2, Hh * .82, fz], [-3.2, Hh * .82, fz]]);
  if (dp.length > 2) { polyPath(ctx, dp); ctx.fillStyle = fogMix('#3a2a26', camDepth([0, 3, fz]), pal); ctx.fill(); ctx.strokeStyle = rgba('#120a0a', .8); ctx.lineWidth = 2; ctx.stroke(); const mid = projLine([[0, 0, fz], [0, Hh * .82, fz]]); for (const r of mid) { polyPath(ctx, r, false); ctx.stroke(); }
    ctx.fillStyle = rgba('#c8a868', .7); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) for (const sx of [-1, 1]) { const q = project([sx * (.6 + i * .7), .8 + j * 1.3, fz + .01]); if (q) { ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1, .07 * q.s), 0, TAU); ctx.fill(); } } }
  return { ridgeY: Hh + 1.0 + 2.6 + 2.2, z };
}
// ---------------------------------------------------------------------------------------- macro props (hand-drawn)
function drawSakeCup(ctx, c, t, o = {}) { // shallow red lacquer sakazuki on a roof tile, moon reflected in the sake
  const p = project(c); if (!p) return; const s = p.s * (o.r || .06), lift = o.lift || 0;
  const y = p.y - lift * p.s; ctx.save();
  ctx.fillStyle = 'rgba(10,8,20,.35)'; ctx.beginPath(); ctx.ellipse(p.x + s * .2, p.y + s * .35, s * 1.15, s * .35, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a1018'; ctx.beginPath(); ctx.ellipse(p.x, y + s * .25, s * .55, s * .18, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c8202c'; ctx.beginPath(); ctx.ellipse(p.x, y, s * 1.05, s * .42, 0, 0, Math.PI); ctx.lineTo(p.x - s * 1.05, y); ctx.fill();
  ctx.fillStyle = '#a0141e'; ctx.beginPath(); ctx.ellipse(p.x, y, s * 1.05, s * .4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a3460'; ctx.beginPath(); ctx.ellipse(p.x, y, s * .92, s * .32, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(p.x, y, s * .92, s * .32, 0, 0, TAU); ctx.clip();
  const mx = p.x - s * .25 + Math.sin(t * 2) * s * .03; ctx.fillStyle = '#f2eedc'; ctx.beginPath(); ctx.ellipse(mx, y - s * .04, s * .22, s * .09, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(220,230,255,.6)'; ctx.lineWidth = Math.max(1, s * .02); for (let i = 1; i < 4; i++) { const rr = ((t * .5 + i / 3) % 1); ctx.beginPath(); ctx.ellipse(mx, y - s * .04, s * .9 * rr, s * .32 * rr, 0, 0, TAU); ctx.globalAlpha = 1 - rr; ctx.stroke(); } ctx.globalAlpha = 1; ctx.restore();
  ctx.strokeStyle = '#1a0a10'; ctx.lineWidth = Math.max(1.5, s * .045); ctx.beginPath(); ctx.ellipse(p.x, y, s * 1.05, s * .4, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(p.x, y, s * 1.05, s * .42, 0, 0, Math.PI); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(p.x - s * .7, y + s * .15, s * .12, s * .05, -.4, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawPuddle(ctx, c, t, o = {}) { // puddle reflecting the moon, frost creeping across like a fingerprint
  const R = o.r || .9, n = 36, pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = .8 + .25 * Math.sin(a * 3 + 1) + .1 * Math.sin(a * 7); pts.push([c[0] + Math.cos(a) * R * k * 1.3, .004, c[2] + Math.sin(a) * R * k]); }
  const sp = projPoly(pts); if (sp.length < 3) return; polyPath(ctx, sp); ctx.fillStyle = '#1a2448'; ctx.fill(); ctx.save(); ctx.clip();
  const m = project([c[0] - .3, .01, c[2] - .1]); if (m) { ctx.fillStyle = '#e8ecf8'; ctx.beginPath(); ctx.ellipse(m.x, m.y, .18 * m.s, .07 * m.s, 0, 0, TAU); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, m.x, m.y, .6 * m.s, '#8aa0e0', .5); ctx.restore(); }
  const fr = clamp(o.frost || 0, 0, 1);
  if (fr > 0) { const f0 = project([c[0] + R, .006, c[2]]); if (f0) { ctx.strokeStyle = 'rgba(220,240,255,.9)'; ctx.lineCap = 'round'; for (let k = 0; k < 18; k++) { const rr = fr * R * 2.6 * (k / 18); const ring = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * .45 + i / 30 * Math.PI * 1.1; ring.push([c[0] + R + Math.cos(a) * rr * 1.3, .006, c[2] + Math.sin(a) * rr]); } for (const r of projLine(ring)) { polyPath(ctx, r, false); ctx.lineWidth = 1.2 + (k % 3 === 0 ? 1 : 0); ctx.stroke(); } }
    ctx.fillStyle = 'rgba(210,235,255,.35)'; ctx.beginPath(); const cc = project([c[0] + R, .006, c[2]]); ctx.ellipse(cc.x, cc.y, fr * R * 2.6 * 1.3 * cc.s, fr * R * 2.6 * cc.s * .35, 0, 0, TAU); ctx.fill(); } }
  ctx.restore(); polyPath(ctx, sp); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(20,24,40,.8)'; ctx.stroke();
}
// plaster camouflage peeling off: fills wall-coloured flakes over a screen region that fall away by u (0..1)
function drawPlasterPeel(ctx, region, u, col = '#c4cce2', seed = 3) {
  const [x0, y0, x1, y1] = region, nx = 9, ny = 12, r = rng(seed);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const st = hash(seed + i * 13 + j * 7) * .7, k = clamp((u - st) / .3, 0, 1); const x = x0 + (i + .5) / nx * (x1 - x0), y = y0 + (j + .5) / ny * (y1 - y0), w = (x1 - x0) / nx * 1.15, h = (y1 - y0) / ny * 1.15;
    const fall = k * k * 400, rot = k * (hash(i + j) - .5) * 3; if (k >= 1) continue; ctx.save(); ctx.translate(x + (hash(i * 3 + j) - .5) * fall * .3, y + fall); ctx.rotate(rot); ctx.globalAlpha = 1 - k * .6;
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + r() * 4); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2 - r() * 6, h / 2); ctx.lineTo(-w / 2, h / 2 - r() * 4); ctx.closePath(); ctx.fillStyle = k > 0 ? mixHex(col, '#ffffff', .15) : col; ctx.fill();
    if (k > 0) { ctx.fillStyle = mixHex(col, '#5a6290', .45); ctx.fillRect(-w / 2, h / 2 - 5, w, 5); ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(30,30,50,.85)'; ctx.stroke(); } else if (u > st - .25) { ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(40,40,70,.75)'; ctx.beginPath(); ctx.moveTo(-w / 2, (hash(i + j * 9) - .5) * h); ctx.lineTo((hash(i * 7 + j) - .5) * w, (hash(j * 3) - .5) * h); ctx.lineTo(w / 2, (hash(i * 5 + j * 2) - .5) * h); ctx.stroke(); } ctx.restore();
    if (k > 0 && k < .7) { ctx.fillStyle = rgba('#e8ecf8', .6 * (1 - k)); for (let d = 0; d < 4; d++) { ctx.beginPath(); ctx.arc(x + (hash(i * 11 + d) - .5) * w * 2, y + h / 2 + fall * .5 + hash(j * 13 + d) * 40, 2 + hash(d + i) * 4, 0, TAU); ctx.fill(); } } }
}
function drawEyepatchProp(ctx, p, t, o = {}) { const q = project(p); if (!q) return; const s = q.s * .09; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(t * 2.2 + (o.rot || 0)); ctx.scale(1, .5 + .5 * Math.abs(Math.cos(t * 3))); ctx.fillStyle = '#16151c'; ctx.beginPath(); ctx.moveTo(-s, -s * .6); ctx.lineTo(s * 1.1, -s * .7); ctx.lineTo(s, s * .7); ctx.lineTo(-s * .9, s * .8); ctx.closePath(); ctx.fill(); ctx.lineWidth = Math.max(1.5, s * .08); ctx.strokeStyle = '#3a3846'; ctx.stroke(); ctx.strokeStyle = '#16151c'; ctx.lineWidth = Math.max(1, s * .12); ctx.beginPath(); ctx.moveTo(-s, -s * .3); ctx.quadraticCurveTo(-s * 3, -s * 2 + Math.sin(t * 5) * s, -s * 4.5, -s * .5); ctx.moveTo(s * 1.05, -s * .3); ctx.quadraticCurveTo(s * 3, s * 1.5, s * 4.2, s * .3); ctx.stroke(); ctx.restore(); }
// ---------------------------------------------------------------------------------------- Resurreccion: Grillar Grillo
// hunched cricket beast: black fur, four insect arms, horns with rings, wings, huge orange eyes with green pupils
function fxGrillo(ctx, t, o = {}) {
  const c = o.c || [0, 0, -4], s = o.scale || 1, M = mRotY(o.yaw || 0), INKC = '#0a0a0e', rise = o.rise == null ? 1 : o.rise;
  const W3 = (x, y, z) => vAdd(c, mApply(M, [x * s, y * s * rise, z * s]));
  const P = (x, y, z) => proj2(W3(x, y, z)), ps = pxScale(W3(0, 2, 0)) * s;
  // wings (behind)
  for (const sg of [-1, 1]) { const a = P(sg * .5, 3.2, -.6), b = P(sg * 3.6, 4.6 + Math.sin(t * 30) * .08, -1.4), c2 = P(sg * 3.2, 2.0, -1.2); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1] - ps * .6, b[0], b[1]); ctx.quadraticCurveTo(c2[0] + sg * ps * .4, c2[1], a[0], a[1] + ps * .6); ctx.closePath(); ctx.fillStyle = 'rgba(40,60,50,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); ctx.strokeStyle = 'rgba(160,220,180,.5)'; ctx.lineWidth = 1.5; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(b[0], c2[0], k / 5), lerp(b[1], c2[1], k / 5)); ctx.stroke(); } }
  // hunched body (black fur mass, jagged outline)
  const body = []; const bc = P(0, 1.9, 0), bw = ps * 1.5, bh = ps * 1.9;
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, rr = 1 + (i % 2 ? .08 : -.06) + .05 * Math.sin(t * 6 + i); body.push([bc[0] + Math.cos(a) * bw * rr * (Math.sin(a) > 0 ? .85 : 1), bc[1] + Math.sin(a) * bh * rr * .9]); }
  polyPath(ctx, body); ctx.fillStyle = '#16161c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INKC; ctx.stroke();
  ctx.save(); polyPath(ctx, body); ctx.clip(); ctx.strokeStyle = 'rgba(120,140,180,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = bc[0] + (hash(i) - .5) * bw * 2, y = bc[1] + (hash(i * 3) - .5) * bh * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ps * .15, y + ps * .3); ctx.stroke(); } ctx.fillStyle = 'rgba(90,110,150,.35)'; ctx.beginPath(); ctx.ellipse(bc[0] - bw * .35, bc[1] - bh * .4, bw * .45, bh * .3, -.4, 0, TAU); ctx.fill(); ctx.restore();
  // four insect arms (segmented, white chitin) reaching forward
  for (const [sg, yy, ph] of [[-1, 2.4, 0], [1, 2.4, 1], [-1, 1.5, 2], [1, 1.5, 3]]) { const sh = P(sg * .9, yy, .2), el = P(sg * (1.9 + Math.sin(t * 3 + ph) * .1), yy + .3, .9), cl = P(sg * 1.5, yy - .4 + Math.sin(t * 4 + ph) * .15, 1.8);
    for (const [a, b, w] of [[sh, el, .28], [el, cl, .2]]) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineCap = 'round'; ctx.lineWidth = ps * w + 6; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = ps * w; ctx.strokeStyle = '#e8e6dc'; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cl[0], cl[1]); ctx.lineTo(cl[0] + sg * ps * .35, cl[1] + ps * .45); ctx.lineTo(cl[0] - sg * ps * .1, cl[1] + ps * .25); ctx.closePath(); ctx.fillStyle = '#f4f2e8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); }
  // head: white mask-like face, horns with rings, huge orange eyes, green pupils
  const hc = P(0, 3.4, .5), hr = ps * .75;
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hc[0] + sg * hr * .4, hc[1] - hr * .6); ctx.bezierCurveTo(hc[0] + sg * hr * 1.2, hc[1] - hr * 2.2, hc[0] + sg * hr * 2.2, hc[1] - hr * 2.6, hc[0] + sg * hr * 2.6, hc[1] - hr * 3.4); ctx.lineWidth = hr * .22 + 6; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = hr * .22; ctx.strokeStyle = '#ece8dc'; ctx.stroke();
    const rx = hc[0] + sg * hr * 2.62, ry = hc[1] - hr * 3.45; ctx.beginPath(); ctx.arc(rx, ry, hr * .35, 0, TAU); ctx.lineWidth = hr * .1 + 4; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = hr * .1; ctx.strokeStyle = '#d8d8e4'; ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(hc[0], hc[1], hr, hr * 1.1, 0, 0, TAU); ctx.fillStyle = '#f2f0e6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INKC; ctx.stroke();
  ctx.fillStyle = '#c8c6bc'; ctx.beginPath(); ctx.ellipse(hc[0] + hr * .25, hc[1] + hr * .1, hr * .7, hr * .95, 0, -HP, HP); ctx.fill();
  for (const sg of [-1, 1]) { const ex = hc[0] + sg * hr * .42, ey = hc[1] - hr * .1; ctx.fillStyle = '#ff8a1a'; ctx.beginPath(); ctx.ellipse(ex, ey, hr * .36, hr * .42, sg * .3, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INKC; ctx.stroke(); ctx.fillStyle = '#3aff6a'; ctx.beginPath(); ctx.ellipse(ex + sg * hr * .04, ey + hr * .04, hr * .1, hr * .2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = INKC; ctx.beginPath(); ctx.ellipse(ex + sg * hr * .04, ey + hr * .04, hr * .04, hr * .12, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex - hr * .12, ey - hr * .18, hr * .07, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, ex, ey, hr * .9, '#ff8a1a', .5); ctx.restore(); }
  ctx.strokeStyle = INKC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hc[0], hc[1] - hr * 1.05); ctx.lineTo(hc[0], hc[1] + hr * 1.05); ctx.stroke();
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(hc[0] + k * hr * .14, hc[1] + hr * .55); ctx.lineTo(hc[0] + k * hr * .14, hc[1] + hr * .85); ctx.lineWidth = 2; ctx.stroke(); }
  // legs
  for (const sg of [-1, 1]) { const a = P(sg * .8, 1.0, 0), b = P(sg * 1.4, .6, .5), cc = P(sg * 1.2, 0, .9); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(cc[0], cc[1]); ctx.lineWidth = ps * .3 + 6; ctx.strokeStyle = INKC; ctx.stroke(); ctx.lineWidth = ps * .3; ctx.strokeStyle = '#1e1e26'; ctx.stroke(); }
}
// ---------------------------------------------------------------------------------------- Ryojin Hyoheki: woven wall of fine ice threads
function fxIceThreadWall(ctx, c, t, o = {}) {
  const u = easeOut(clamp(t / (o.dur || .35), 0, 1)); if (u <= 0) return; const Wd = o.w || 5, Hh = (o.h || 3.2) * u, yaw = o.yaw || 0, M = mRotY(yaw), curve = o.curve || .8;
  const P = (x, y) => vAdd(c, mApply(M, [x, y, -curve * (x / Wd) * (x / Wd) * 2]));
  ctx.save(); ctx.lineCap = 'round';
  const mesh = []; for (let i = 0; i <= 16; i++) for (let j = 0; j <= 10; j++) mesh.push([i, j]);
  const sheet = projPoly([P(-Wd / 2, 0), P(Wd / 2, 0), P(Wd / 2, Hh), P(-Wd / 2, Hh)]); if (sheet.length > 2) { polyPath(ctx, sheet); ctx.fillStyle = 'rgba(200,236,255,.18)'; ctx.fill(); }
  for (let pass = 0; pass < 2; pass++) for (let k = -12; k <= 12; k++) { const pts = []; for (let i = 0; i <= 14; i++) { const v = i / 14, x = (k / 12) * Wd / 2 + (pass ? 1 : -1) * (v - .5) * Wd * .6; if (Math.abs(x) > Wd / 2) continue; pts.push(P(x + Math.sin(v * 8 + k) * .03, v * Hh)); } for (const r of projLine(pts)) { polyPath(ctx, r, false); ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(30,80,130,.6)'; ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(235,250,255,.95)'; ctx.stroke(); } }
  ctx.restore();
}
// petal wall: a dense sheet of petals in a plane (Senbonzakura defence)
function fxPetalWall(ctx, c, t, o = {}) { const Wd = o.w || 4, Hh = o.h || 3, M = mRotY(o.yaw || 0), crack = o.crack || 0; fxPetals(ctx, t, Object.assign({ n: o.n || 1400, size: .05, flow: (i, u, tt) => { if (crack && hash(i * 17) < crack) return null; const x = (hash(i * 3) - .5) * Wd, y = hash(i * 5) * Hh, z = Math.sin(tt * 4 + i) * .08 + (hash(i * 7) - .5) * .15; return vAdd(c, mApply(M, [x + Math.sin(tt * 2 + y) * .05, y, z])); } }, o)); }
// single violet ice-flower petal falling in slow motion (macro insert)
function fxIcePetal(ctx, x, y, s, t, o = {}) { ctx.save(); ctx.translate(x + Math.sin(t * 1.3) * s * .6, y + t * s * .9); ctx.rotate(Math.sin(t * .9) * .8 + t * .3); ctx.scale(1, .55 + .45 * Math.abs(Math.cos(t * 1.1)));
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * .75, -s * .2, 0, s * .9); ctx.quadraticCurveTo(-s * .75, -s * .2, 0, -s); ctx.fillStyle = 'rgba(176,140,240,.85)'; ctx.fill(); ctx.lineWidth = Math.max(2, s * .03); ctx.strokeStyle = '#3a2a6a'; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(-s * .1, -s * .8); ctx.lineTo(s * .25, -s * .1); ctx.lineTo(0, s * .5); ctx.lineTo(-s * .3, -s * .2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,60,160,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s * .9); ctx.stroke(); ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, s * 1.6, '#b08cf0', .35); ctx.restore(); }
// Mayuri Jabarakaina: stretched snake-like arm from a shoulder point to a target (world)
function fxStretchArm(ctx, a, b, t, o = {}) { const n = 18, pts = []; const d = vSub(b, a), side = vNorm(vCross(d, [0, 1, 0])); for (let i = 0; i <= n; i++) { const u = i / n; pts.push(proj2(vAdd(vLerp(a, b, u), vMul(side, Math.sin(u * Math.PI * 3 + t * 8) * .25 * Math.sin(u * Math.PI))))); }
  const s = pxScale(vLerp(a, b, .5)), w = (o.w || .07) * s; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; polyPath(ctx, catmull(pts, false, 3), false); ctx.lineWidth = w + 5; ctx.strokeStyle = '#141018'; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = o.col || '#efe9e0'; ctx.stroke(); ctx.lineWidth = w * .25; ctx.strokeStyle = 'rgba(150,140,170,.6)'; polyPath(ctx, catmull(pts.map(p => [p[0] + w * .2, p[1] + w * .2]), false, 3), false); ctx.stroke(); ctx.restore(); }
// Los Nueve Aspectos: lime-green clawed circles of sound
function fxNueveRings(ctx, c, t, o = {}) { const q = P2(c); if (!q) return; for (let i = 0; i < 9; i++) { const u = ((t * 1.4 + i / 9) % 1), r = (o.r || 5) * q.s * (.15 + u); ctx.lineWidth = (o.w || 10) * (1 - u) + 2; ctx.strokeStyle = rgba('#b8ff3a', .95 * (1 - u)); ctx.beginPath(); ctx.ellipse(q.x, q.y, r, r * .9, i * .3, 0, TAU * (.75 + .25 * Math.sin(i))); ctx.stroke(); } ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, (o.r || 5) * q.s * .5, '#b8ff3a', .35); ctx.restore(); }
// ---------------------------------------------------------------------------------------- set additions
SETS.gate = { draw(ctx, t, o) { SETS.seireitei.draw(ctx, t, Object.assign({}, o, { layer: 'bg' })); if (o.layer !== 'fg') drawGate(ctx, o.pal, t, o.gateOpt || {}); } };
SETS.crater = { draw(ctx, t, o) { const pal = o.pal; if (o.layer !== 'fg') { drawSky(ctx, pal, t, Object.assign({ moon: true }, o)); drawMountains(ctx, pal, 4, 1400, 140); drawGround(ctx, pal); drawPaving(ctx, pal, CAM.cur.target, 30, 2.4); drawCrater(ctx, [0, 0, 0], o.craterR || 9, pal, 77, 1.3); for (let i = 0; i < 18; i++) { const r = rng(600 + i), a = r() * TAU, d = 10 + r() * 6; drawRock(ctx, [Math.cos(a) * d, 0, Math.sin(a) * d], .4 + r() * 1.1, pal, 600 + i, '#8a8696'); } }
  drawBuildings(ctx, seireiteiCity(o.seed || 1, { street: 14 }), pal, Object.assign({}, o, { dmg: Math.max(2, o.dmg || 2) })); if (o.layer !== 'fg') for (let i = 0; i < 4; i++) { const r = rng(140 + i); drawSmokeColumn(ctx, [(r() - .5) * 60, 0, -40 - r() * 60], 30 + r() * 30, 8, pal, t, 140 + i); } } };
// moon + lanterns hooks on the seireitei / rooftops sets
(function () { const s0 = SETS.seireitei.draw, r0 = SETS.rooftops.draw;
  SETS.seireitei.draw = function (ctx, t, o) { s0(ctx, t, o); if (o.lanterns && o.layer !== 'fg') drawLanterns(ctx, o.pal, t, o.lanterns === true ? {} : o.lanterns); };
  SETS.rooftops.draw = function (ctx, t, o) { r0(ctx, t, o); };
})();
// roof surface height on the 'rooftops' set at (x,z) (for standing characters on roofs); returns {y, b}
function roofY(x, z, seed = 1) { SETS.rooftops.draw && 0; const B = SETCACHE['roofs' + seed]; if (!B) return { y: 9, b: null };
  let best = null; for (const b of B) { if (b.kind === 'tree') continue; const M = mRotY(-(b.yaw || 0)), l = mApply(M, [x - b.c[0], 0, z - b.c[2]]); const hw = b.w / 2 + (b.ov == null ? 1.1 : b.ov), hd = b.d / 2 + (b.ov == null ? 1.1 : b.ov); if (Math.abs(l[0]) <= hw && Math.abs(l[2]) <= hd) { const rh = b.rh == null ? 2.6 : b.rh, k = Math.max(Math.abs(l[0]) / hw, Math.abs(l[2]) / hd); const y = b.h + rh * (1 - k); if (!best || y > best.y) best = { y, b }; } }
  return best || { y: 0, b: null }; }
// make sure the rooftops geometry exists before roofY is used (normally created on first draw)
function ensureRoofs(seed = 1) { if (SETCACHE['roofs' + seed]) return; const c = mkCanvas(4, 4).getContext('2d'); CAM.set({ pos: [0, 10, 10], target: [0, 9, 0] }); SETS.rooftops.draw(c, 0, { pal: PALETTES.moon, seed, layer: 'all' }); }
PALETTES.iceNight = Object.assign({}, PALETTES.ice, { skyTop: '#0e1a3a', skyMid: '#2a4a80', skyLow: '#7aa0d0', fog: '#5a7ab0', ground: '#a8c8e4', ground2: '#7aa4cc', cloud: '#b8cce8', cloudShade: '#4a6090', amb: '#b8d8ff', sun: [-.35, .7, -.6], stars: true });
GRADES.iceNight = { sat: 1.05, contrast: 1.08, tint: ['#c8e0ff', .22] };
