/* Bleach Showdown engine - world.js : painted 2.5D sets in real perspective.
   Every set is 3D geometry (ground plane, boxes with tiled hip roofs, walls, rocks, ice spikes, trees, craters ...)
   projected through the shot camera and painted with flat gouache tones, vertical gradients, brush-texture overlays,
   thin coloured edge lines and atmospheric perspective.  Orbit / crane / dolly moves therefore give true parallax.
   API:
     drawSet(ctx, name, t, opt)   opt: { pal: palette name or object, dmg: 0..3 destruction, layer: 'bg'|'fg'|'all',
                                         zSplit: camera depth splitting bg/fg props, seed, focusBlur }
     SETS: seireitei (streets + compounds + towers), rooftops (roof level of the same city), courtyard, wasteland,
           ice (frozen field), void (bankai darkness), sky (sky only)
     PALETTES: day, noon, dusk, night, storm, ice, void, red, gloom
     Helpers usable in shots: drawSky, drawGround, drawCrater, drawRock, drawIceSpike, drawSmokeColumn, groundY()   */
'use strict';
const PALETTES = {
  day:   { skyTop: '#4f83c9', skyMid: '#8fbbe6', skyLow: '#dbe9f0', fog: '#c9d9e6', sun: [-.5, .7, .45], ground: '#d6c9a9', ground2: '#c4b592', wall: '#efe8d8', wallShade: '#b8b0c6', roof: '#4c566d', roofShade: '#2f3548', wood: '#6a4a3a', cloud: '#ffffff', cloudShade: '#b9b7d6', haze: .55, line: '#5a5466', amb: null },
  noon:  { skyTop: '#3d78c8', skyMid: '#7fb3ea', skyLow: '#d6ecf6', fog: '#cfe2ee', sun: [-.2, .9, .3], ground: '#ddd0ae', ground2: '#cabb96', wall: '#f3eee0', wallShade: '#bdb6cc', roof: '#4a5670', roofShade: '#2e3550', wood: '#6a4a3a', cloud: '#ffffff', cloudShade: '#c2c3e0', haze: .5, line: '#5a5466' },
  dusk:  { skyTop: '#3b3a78', skyMid: '#c46a7a', skyLow: '#f6b26b', fog: '#e7a27a', sun: [.7, .2, -.5], ground: '#b48a72', ground2: '#9a7462', wall: '#f0c8a8', wallShade: '#8a6a8a', roof: '#3a3450', roofShade: '#241f36', wood: '#4a2e2e', cloud: '#ffd2a8', cloudShade: '#8a5a8a', haze: .6, line: '#4a3448', amb: '#ffc8a0' },
  night: { skyTop: '#0b1030', skyMid: '#1d2a5a', skyLow: '#3a4a7a', fog: '#2a3460', sun: [.3, .6, .6], ground: '#3a3a52', ground2: '#2e2e44', wall: '#7a7f9e', wallShade: '#3e4262', roof: '#1e2236', roofShade: '#12141f', wood: '#2a2230', cloud: '#5a6488', cloudShade: '#262c4a', haze: .4, line: '#141626', amb: '#8090d0', stars: true },
  storm: { skyTop: '#22242e', skyMid: '#4a4a58', skyLow: '#8a8478', fog: '#6a6a70', sun: [-.3, .8, .4], ground: '#7a7266', ground2: '#665e54', wall: '#bdb6a8', wallShade: '#6a6474', roof: '#2e3240', roofShade: '#1c1e28', wood: '#3a2e2a', cloud: '#8a8a96', cloudShade: '#3a3a48', haze: .65, line: '#2a2830', amb: '#c0bcc8' },
  ice:   { skyTop: '#5a7fb8', skyMid: '#a9c8e8', skyLow: '#eaf6fb', fog: '#d8ecf6', sun: [-.4, .7, .5], ground: '#cfe8f4', ground2: '#a9d0e6', wall: '#e6f2f8', wallShade: '#9ab6d6', roof: '#4a6280', roofShade: '#2e4260', wood: '#5a6a80', cloud: '#ffffff', cloudShade: '#a8c0e0', haze: .6, line: '#4a6a8a', amb: '#d8f0ff' },
  void:  { skyTop: '#000000', skyMid: '#05050a', skyLow: '#0c0a14', fog: '#05050a', sun: [0, 1, .3], ground: '#0c0b12', ground2: '#08070c', wall: '#1a1a22', wallShade: '#0a0a10', roof: '#0a0a10', roofShade: '#050508', wood: '#0a0a10', cloud: '#14141c', cloudShade: '#08080c', haze: .2, line: '#000000', amb: '#6a6a90' },
  red:   { skyTop: '#2a0608', skyMid: '#7a1410', skyLow: '#e0502a', fog: '#a0301e', sun: [.2, .5, .7], ground: '#6a2a1e', ground2: '#4e1e16', wall: '#c08070', wallShade: '#5a2a2e', roof: '#2a1214', roofShade: '#160808', wood: '#2a1010', cloud: '#c0503a', cloudShade: '#4a1414', haze: .6, line: '#200606', amb: '#ff9070' },
  gloom: { skyTop: '#1a1420', skyMid: '#3a2a3a', skyLow: '#6a5060', fog: '#4a3a48', sun: [-.4, .5, .4], ground: '#4a3e44', ground2: '#3a3036', wall: '#8a7e84', wallShade: '#4a3e4a', roof: '#241e28', roofShade: '#161218', wood: '#2a2024', cloud: '#5a4a5a', cloudShade: '#2a2028', haze: .6, line: '#1a1418', amb: '#c8a8b8' },
};
const palOf = p => typeof p === 'object' ? p : (PALETTES[p] || PALETTES.day);
// background art style: painted (no ink outlines, soft colour patches, light washes) is the default anime-BG look
const BGSTYLE = { painted: true };
function paintPatches(ctx, sp, col, seed, z, pal) { // large soft colour variation inside a face (gouache wash)
  if (!BGSTYLE.painted || sp.length < 3 || z > 260) return; const r = rng(seed); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of sp) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const w = x1 - x0, h = y1 - y0; if (w * h < 400) return; ctx.save(); polyPath(ctx, sp); ctx.clip();
  for (let i = 0; i < 4; i++) { const x = x0 + r() * w, y = y0 + r() * h, rad = Math.max(w, h) * (.3 + r() * .5), light = r() < .5; const g = ctx.createRadialGradient(x, y, 0, x, y, rad); const c2 = light ? mixHex(col, '#fff6e0', .25) : mixHex(col, pal.wallShade || '#7a7090', .22); g.addColorStop(0, rgba(c2, .55)); g.addColorStop(1, rgba(c2, 0)); ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  // dry-brush streaks
  ctx.globalAlpha = .12; ctx.strokeStyle = mixHex(col, '#000000', .3); ctx.lineWidth = Math.max(1, h * .02); for (let i = 0; i < 6; i++) { const y = y0 + r() * h; ctx.beginPath(); ctx.moveTo(x0 + r() * w * .3, y); ctx.lineTo(x0 + w * (.5 + r() * .5), y + (r() - .5) * h * .05); ctx.stroke(); }
  ctx.restore();
}
// ------------------------------------------------------------------------------------------- painted textures
const TEX = {};
function brushTex(seed = 3, size = 512) {
  const key = 'b' + seed + size; if (TEX[key]) return TEX[key];
  const c = mkCanvas(size, size), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#808080'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) { const x = r() * size, y = r() * size, l = 8 + r() * 60, a = r() * .6 - .3 + (r() < .5 ? 0 : Math.PI / 2) * 0; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = r() < .5 ? `rgba(255,255,255,${.04 + r() * .08})` : `rgba(0,0,0,${.04 + r() * .08})`; g.beginPath(); g.ellipse(0, 0, l, 2 + r() * 5, 0, 0, TAU); g.fill(); g.restore(); }
  const im = g.getImageData(0, 0, size, size); for (let i = 0; i < im.data.length; i += 4) { const n = (r() - .5) * 22; im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n; } g.putImageData(im, 0, 0);
  // make tileable-ish by mirroring edges softly
  TEX[key] = c; return c;
}
let _texPat = null;
function texOverlay(ctx, path, alpha = .35, mode = 'overlay') {
  if (!_texPat) _texPat = ctx.createPattern(brushTex(), 'repeat');
  ctx.save(); if (path) ctx.clip(path); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = _texPat; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function fogMix(col, z, pal, k = 1) { const f = clamp((z - 25) / 260, 0, 1) * (pal.haze || .5) * k; return f > .001 ? mixHex(col, pal.fog, f) : col; }
function lightK(n, pal) { const s = vNorm(pal.sun); return clamp(vDot(n, s), -1, 1); }
function faceCol(base, shade, n, pal) { const k = lightK(n, pal); return k > .12 ? (k > .6 ? mixHex(base, '#ffffff', .08) : base) : mixHex(base, shade, clamp(.55 - k * 2, .35, .85)); }
const groundY = () => 0;

// ------------------------------------------------------------------------------------------- sky
function horizonLine(cam = CAM.cur) {
  const far = 5000, f = cam.F; const fl = vNorm([f[0], 0, f[2]]);
  const r = vNorm(vCross(fl, [0, 1, 0]));
  const a = proj2(vAdd([cam.pos[0], 0, cam.pos[2]], vAdd(vMul(fl, far), vMul(r, -far)))), b = proj2(vAdd([cam.pos[0], 0, cam.pos[2]], vAdd(vMul(fl, far), vMul(r, far))));
  // camera height lifts the true horizon slightly; ignore (far)
  return [a, b];
}
function drawSky(ctx, pal, t, opt = {}) {
  const cam = CAM.cur, [a, b] = horizonLine(cam);
  // gradient perpendicular to the horizon
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L; // normal pointing up-screen
  const span = H * 1.4;
  const g = ctx.createLinearGradient(mx, my, mx + nx * span, my + ny * span);
  g.addColorStop(0, pal.skyLow); g.addColorStop(.25, pal.skyMid); g.addColorStop(1, pal.skyTop);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (pal.stars) { const r = rng(5); ctx.fillStyle = '#fff'; for (let i = 0; i < 260; i++) { const d = vNorm([r() * 2 - 1, r() * .9 + .05, r() * 2 - 1]); const p = project(vAdd(cam.pos, vMul(d, 4000))); if (!p) continue; ctx.globalAlpha = .3 + .7 * hash(i + Math.floor(t * 3)); ctx.fillRect(p.x, p.y, 1.6, 1.6); } ctx.globalAlpha = 1; }
  if (opt.moon && typeof drawMoon === 'function') drawMoon(ctx, pal, t, opt.moonOpt || {});
  // painted clouds on a dome (billboards far away) -> parallax with camera rotation
  const r = rng(opt.cloudSeed || 11), n = opt.clouds == null ? 16 : opt.clouds;
  for (let i = 0; i < n; i++) {
    const az = r() * TAU, el = .04 + r() * .32 * (opt.cloudHigh || 1), dist = 1800 + r() * 900;
    const d = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    const c = vAdd([cam.pos[0], 0, cam.pos[2]], vMul(d, dist)); c[0] += t * (opt.wind || 6);
    const p = project(c); if (!p) continue;
    const w = (380 + r() * 620) * p.s, h = w * (.22 + r() * .18);
    if (p.x < -w || p.x > W + w || p.y < -h * 2 || p.y > H + h) { r(); continue; }
    paintCloud(ctx, p.x, p.y, w, h, pal, Math.floor(r() * 1e6), Math.atan2(dy, dx));
  }
  if (pal !== PALETTES.void && opt.cirrus !== false) paintCirrus(ctx, pal, t, opt.cloudSeed || 3);
  // haze band at the horizon
  const hg = ctx.createLinearGradient(mx, my, mx + nx * H * .25, my + ny * H * .25); hg.addColorStop(0, rgba(pal.fog, .75 * (pal.haze || .5))); hg.addColorStop(1, rgba(pal.fog, 0));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
}
// anime cumulus: lit top lobes, flat shaded base, crisp edges, brush texture
function paintCloud(ctx, x, y, w, h, pal, seed, rot = 0) {
  // towering anime cumulus: many lobes in three tones (lit cap, mid body, cool shaded base), brushy rim light
  const r = rng(seed), C = [];
  const n = 10 + Math.floor(r() * 8);
  for (let i = 0; i < n; i++) { const u = r(), tower = Math.pow(Math.sin(u * Math.PI), 1.5); C.push([(u - .5) * w * .95, -tower * h * (.7 + r() * .8) - r() * h * .25, w * (.07 + r() * .09) * (.6 + tower)]); }
  for (let i = 0; i < 6; i++) { const u = r(); C.push([(u - .5) * w, -h * .05 - r() * h * .15, w * (.06 + r() * .05)]); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const P = (dx, dy, k) => { const p = new Path2D(); for (const [cx, cy, rr] of C) { p.moveTo(cx + dx + rr * k, cy + dy); p.arc(cx + dx, cy + dy, rr * k, 0, TAU); } return p; };
  ctx.save(); ctx.beginPath(); ctx.rect(-w * 2, -h * 5, w * 4, h * 5 + h * .08); ctx.clip();
  const base = P(0, 0, 1); ctx.fillStyle = pal.cloudShade; ctx.fill(base); ctx.clip(base);
  ctx.fillStyle = mixHex(pal.cloud, pal.cloudShade, .45); ctx.fill(P(-w * .015, -h * .12, .97));
  ctx.fillStyle = pal.cloud; ctx.fill(P(-w * .03, -h * .22, .9));
  ctx.globalAlpha = .65; ctx.fillStyle = mixHex(pal.cloud, '#ffffff', .7); ctx.fill(P(-w * .045, -h * .32, .62)); ctx.globalAlpha = 1;
  // soft bottom haze
  const g = ctx.createLinearGradient(0, -h * .3, 0, h * .1); g.addColorStop(0, rgba(pal.cloudShade, 0)); g.addColorStop(1, rgba(mixHex(pal.cloudShade, pal.skyLow, .4), .6)); ctx.fillStyle = g; ctx.fillRect(-w, -h * .3, w * 2, h * .5);
  ctx.restore(); ctx.restore();
}
function paintCirrus(ctx, pal, t, seed = 3) { // thin high streaks across the sky
  const r = rng(seed); ctx.save(); ctx.globalAlpha = .35; ctx.strokeStyle = mixHex(pal.cloud, pal.skyMid, .3); ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const d = vNorm([r() * 2 - 1, .25 + r() * .5, r() * 2 - 1]); const p = project(vAdd(CAM.cur.pos, vMul(d, 3000))); if (!p) { r(); r(); continue; } const L = 200 + r() * 500, a = -.15 + r() * .3; ctx.lineWidth = 3 + r() * 10; ctx.beginPath(); ctx.moveTo(p.x - L / 2, p.y); ctx.quadraticCurveTo(p.x, p.y + Math.sin(a) * L * .2 - 10, p.x + L / 2 + t * 4, p.y + Math.sin(a) * L * .3); ctx.stroke(); }
  ctx.restore();
}
// ------------------------------------------------------------------------------------------- ground
function drawGround(ctx, pal, opt = {}) {
  const cam = CAM.cur, R = 3000, c = [cam.pos[0], 0, cam.pos[2]];
  const quad = [[c[0] - R, 0, c[2] - R], [c[0] + R, 0, c[2] - R], [c[0] + R, 0, c[2] + R], [c[0] - R, 0, c[2] + R]];
  const sp = projPoly(quad); if (sp.length < 3) return;
  const [a, b] = horizonLine(cam); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const g = ctx.createLinearGradient(mx, my, mx + nx * H, my + ny * H);
  g.addColorStop(0, mixHex(opt.col || pal.ground, pal.fog, .55)); g.addColorStop(.25, opt.col || pal.ground); g.addColorStop(1, opt.col2 || pal.ground2);
  polyPath(ctx, sp); ctx.fillStyle = g; ctx.fill();
  const path = new Path2D(); path.moveTo(sp[0][0], sp[0][1]); for (const p of sp) path.lineTo(p[0], p[1]); path.closePath();
  texOverlay(ctx, path, .22);
  if (BGSTYLE.painted) { ctx.save(); ctx.clip(path); const r = rng(opt.seed || 31); for (let i = 0; i < 9; i++) { const p = project([cam.pos[0] + (r() - .5) * 60, 0, cam.pos[2] - 6 - r() * 60]); if (!p) continue; const rad = (8 + r() * 14) * p.s; const c2 = r() < .5 ? mixHex(opt.col || pal.ground, '#fff4dc', .3) : mixHex(opt.col2 || pal.ground2, pal.wallShade || '#7a7090', .25); const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad); g2.addColorStop(0, rgba(c2, .45)); g2.addColorStop(1, rgba(c2, 0)); ctx.fillStyle = g2; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .35); ctx.translate(-p.x, -p.y); ctx.fillRect(p.x - rad, p.y - rad, rad * 2, rad * 2); ctx.restore(); } ctx.restore(); }
  return path;
}
// paving grid (stone slabs) around a point
function drawPaving(ctx, pal, center, half = 30, step = 2.2, opt = {}) {
  const lines = []; const x0 = Math.round(center[0] / step) * step, z0 = Math.round(center[2] / step) * step;
  ctx.strokeStyle = rgba(opt.line || pal.line, opt.alpha || .32); ctx.lineWidth = 1.2;
  for (let i = -half; i <= half; i += step) {
    for (const r of projLine([[x0 + i, .002, z0 - half], [x0 + i, .002, z0 + half]])) { polyPath(ctx, r, false); ctx.stroke(); }
  }
  for (let j = -half; j <= half; j += step * .6) {
    const off = (Math.round(j / (step * .6)) % 2) * step * .5;
    for (let i = -half; i < half; i += step) for (const r of projLine([[x0 + i + off, .002, z0 + j], [x0 + i + off + step, .002, z0 + j]])) { polyPath(ctx, r, false); ctx.stroke(); }
  }
  // random slab tint variation
  const rr = rng(77);
  for (let k = 0; k < 140; k++) { const x = x0 + Math.floor((rr() * 2 - 1) * half / step) * step, z = z0 + Math.floor((rr() * 2 - 1) * half / (step * .6)) * step * .6; const sp = projPoly([[x, .003, z], [x + step, .003, z], [x + step, .003, z + step * .6], [x, .003, z + step * .6]]); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = rgba(rr() < .5 ? '#ffffff' : '#000000', .045); ctx.fill(); }
}
// ------------------------------------------------------------------------------------------- buildings
/* b: { c:[x,0,z], w, d, h, yaw, roof:'hip'|'gable'|'flat'|'cap', rh: roof height, ov: overhang, wall, roof colours,
        base: stone base height, posts: n vertical posts, win: windows true, broken: 0..1 }                         */
function boxCorners(b) {
  const M = mRotY(b.yaw || 0), hw = b.w / 2, hd = b.d / 2, y0 = b.c[1] || 0;
  const loc = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]];
  const P = loc.map(l => vAdd(b.c, mApply(M, l)));
  return { M, bot: P.map(p => [p[0], y0, p[2]]), top: P.map(p => [p[0], y0 + b.h, p[2]]) };
}
function drawBuilding(ctx, b, pal, opt = {}) {
  const cam = CAM.cur, { M, bot, top } = boxCorners(b);
  const cz = camDepth(vAdd(b.c, [0, b.h / 2, 0])); if (cz < -b.w - b.d) return;
  const wallC = b.wall || pal.wall, roofC = b.roof || pal.roof;
  const lineCol = BGSTYLE.painted ? rgba(mixHex(pal.line, wallC, .55), .35) : rgba(pal.line, .7), lw = clamp(220 / Math.max(1, cz), .6, 2.4) * (BGSTYLE.painted ? .7 : 1);
  // walls
  for (let i = 0; i < 4; i++) {
    const a = bot[i], bb = bot[(i + 1) % 4], n = vNorm(vCross(vSub(bb, a), [0, 1, 0]));
    const mid = vLerp(vLerp(a, bb, .5), vLerp(top[i], top[(i + 1) % 4], .5), .5);
    if (vDot(n, vSub(cam.pos, mid)) <= 0) continue;
    const poly = [a, bb, top[(i + 1) % 4], top[i]], sp = projPoly(poly); if (sp.length < 3) continue;
    const z = camDepth(mid), col = fogMix(faceCol(wallC, pal.wallShade, n, pal), z, pal);
    polyPath(ctx, sp);
    // vertical gradient: darker at the ground (bounce/AO), brighter under the eave
    const yTop = Math.min(...sp.map(p => p[1])), yBot = Math.max(...sp.map(p => p[1]));
    const g = ctx.createLinearGradient(0, yTop, 0, yBot); g.addColorStop(0, shadeHex(col, -.12)); g.addColorStop(.18, col); g.addColorStop(1, shadeHex(col, -.08)); ctx.fillStyle = g; ctx.fill();
    // stone base band
    if (b.base) { const bh = b.base; const bp = projPoly([a, bb, vAdd(bb, [0, bh, 0]), vAdd(a, [0, bh, 0])]); if (bp.length > 2) { polyPath(ctx, bp); ctx.fillStyle = fogMix(faceCol(b.baseCol || '#8c857a', '#5a5462', n, pal), z, pal); ctx.fill(); } }
    // posts / wooden frame & windows (sparse)
    const len = vDist(a, bb);
    if (b.posts && z < 160) { const np = Math.max(1, Math.round(len / b.posts)); ctx.strokeStyle = fogMix(b.postCol || pal.wood, z, pal); ctx.lineWidth = Math.max(1, 2.4 * 40 / z * 3); for (let k = 1; k < np; k++) { const p0 = vLerp(a, bb, k / np); for (const r of projLine([vAdd(p0, [0, b.base || 0, 0]), vAdd(p0, [0, b.h, 0])])) { polyPath(ctx, r, false); ctx.stroke(); } } }
    if (b.win && z < 140 && hash((b.seed || 1) * 3 + i) < .45) { // sparse, irregular openings: shoji panels / dark windows / doors
      const r = rng((b.seed || 1) + i * 17); const np = 1 + Math.floor(r() * Math.min(4, len / 4));
      for (let k = 0; k < np; k++) { const u0 = clamp((k + .15 + r() * .3) / np, 0, 1), uw = (.2 + r() * .35) / np, kind = r(); const h0 = kind < .2 ? (b.base || 0) : b.h * (.3 + r() * .2), h1 = kind < .2 ? b.h * .62 : h0 + b.h * (.18 + r() * .2);
        const q = [vAdd(vLerp(a, bb, u0), [0, h0, 0]), vAdd(vLerp(a, bb, u0 + uw), [0, h0, 0]), vAdd(vLerp(a, bb, u0 + uw), [0, h1, 0]), vAdd(vLerp(a, bb, u0), [0, h1, 0])]; const wp = projPoly(q); if (wp.length < 3) continue;
        polyPath(ctx, wp); const shoji = kind > .55; ctx.fillStyle = fogMix(shoji ? mixHex(col, '#fffbe8', .4) : (b.winCol || '#3a3446'), z, pal); ctx.fill();
        ctx.lineWidth = clamp(90 / z, .6, 2); ctx.strokeStyle = fogMix(pal.wood, z, pal); ctx.stroke();
        if (shoji && z < 90) { ctx.save(); ctx.clip(); ctx.lineWidth = clamp(40 / z, .4, 1.2); const nx = 2 + Math.floor(r() * 3), ny = 2 + Math.floor(r() * 3); for (let s2 = 1; s2 < nx; s2++) for (const rn of projLine([vLerp(q[0], q[1], s2 / nx), vLerp(q[3], q[2], s2 / nx)])) { polyPath(ctx, rn, false); ctx.stroke(); } for (let s2 = 1; s2 < ny; s2++) for (const rn of projLine([vLerp(q[0], q[3], s2 / ny), vLerp(q[1], q[2], s2 / ny)])) { polyPath(ctx, rn, false); ctx.stroke(); } ctx.restore(); } }
    }
    if (b.broken) { const r = rng((b.seed || 3) + i); ctx.fillStyle = fogMix('#3a3036', z, pal); for (let k = 0; k < 3 * b.broken; k++) { const u = r(), v = .2 + r() * .6, s = .08 + r() * .18 * b.broken; const cpt = vLerp(vLerp(a, bb, u), vLerp(top[i], top[(i + 1) % 4], u), v); const cr = []; for (let q = 0; q < 7; q++) { const an = q / 7 * TAU, rr = s * (.6 + r() * .6); cr.push(vAdd(cpt, vAdd(vMul(vNorm(vSub(bb, a)), Math.cos(an) * rr * len), [0, Math.sin(an) * rr * b.h, 0]))); } const cp = projPoly(cr); if (cp.length > 2) { polyPath(ctx, cp); ctx.fill(); } } }
    paintPatches(ctx, sp, col, (b.seed || 1) * 7 + i, z, pal);
    polyPath(ctx, sp); ctx.lineWidth = lw; ctx.strokeStyle = lineCol; ctx.stroke();
  }
  if (b.roof === 'flat' || !b.roof) { const sp = projPoly(top); if (sp.length > 2 && cam.pos[1] > top[0][1]) { polyPath(ctx, sp); ctx.fillStyle = fogMix(pal.roof, cz, pal); ctx.fill(); } return; }
  drawRoof(ctx, b, M, top, pal, cz, lw);
}
function drawRoof(ctx, b, M, top, pal, cz, lw) {
  const cam = CAM.cur, ov = b.ov == null ? Math.min(b.w, b.d) * .14 : b.ov, rh = b.rh == null ? Math.min(b.w, b.d) * .38 : b.rh;
  const y = top[0][1], hw = b.w / 2 + ov, hd = b.d / 2 + ov, L = (x, yy, z) => vAdd([b.c[0], y + yy, b.c[2]], mApply(M, [x, 0, z]));
  const eave = [L(-hw, -ov * .25, -hd), L(hw, -ov * .25, -hd), L(hw, -ov * .25, hd), L(-hw, -ov * .25, hd)];
  let faces;
  if (b.roof === 'gable' || b.roof === 'cap') { const r0 = L(-hw, rh, 0), r1 = L(hw, rh, 0); faces = [[eave[0], eave[1], r1, r0], [eave[2], eave[3], r0, r1], [eave[1], eave[2], r1], [eave[3], eave[0], r0]]; }
  else { const ridge = Math.max(0, hw - hd) * .9; const r0 = L(-ridge, rh, 0), r1 = L(ridge, rh, 0); faces = [[eave[0], eave[1], r1, r0], [eave[2], eave[3], r0, r1], [eave[1], eave[2], r1], [eave[3], eave[0], r0]]; }
  // underside (visible from below)
  if (cam.pos[1] < y) { const sp = projPoly(eave); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix(mixHex(b.wood || pal.wood, pal.roofShade, .6), cz, pal); ctx.fill(); if (cz < 120) { ctx.save(); ctx.clip(); ctx.strokeStyle = rgba('#000000', .25); ctx.lineWidth = 1.2; const nR = Math.round(b.w / .6); for (let k = 0; k <= nR; k++) { const u = k / nR; for (const rn of projLine([vLerp(eave[0], eave[1], u), vLerp(eave[3], eave[2], u)])) { polyPath(ctx, rn, false); ctx.stroke(); } } ctx.restore(); } } }
  const roofC = b.roofCol || pal.roof;
  const vis = faces.map(f => { const n = vNorm(vCross(vSub(f[1], f[0]), vSub(f[f.length - 1], f[0]))); const nn = n[1] < 0 ? vMul(n, -1) : n; const mid = f.reduce((a, p) => vAdd(a, vMul(p, 1 / f.length)), [0, 0, 0]); return { f, n: nn, mid, d: vDot(nn, vSub(cam.pos, mid)) }; }).filter(o => o.d > 0);
  vis.sort((p, q) => camDepth(q.mid) - camDepth(p.mid));
  for (const { f, n, mid } of vis) {
    const sp = projPoly(f); if (sp.length < 3) continue; const z = camDepth(mid);
    polyPath(ctx, sp); ctx.fillStyle = fogMix(faceCol(roofC, pal.roofShade, n, pal), z, pal); ctx.fill();
    // tile rows: lines from eave toward ridge
    if (z < 180) {
      ctx.save(); polyPath(ctx, sp); ctx.clip(); ctx.strokeStyle = rgba(shadeHex(roofC, -.45), BGSTYLE.painted ? .28 : .55); ctx.lineWidth = clamp(120 / z, .5, 2);
      const e0 = f[0], e1 = f[1], top0 = f.length === 4 ? f[3] : f[2], top1 = f.length === 4 ? f[2] : f[2];
      const n2 = Math.round(vDist(e0, e1) / .45);
      for (let k = 0; k <= n2; k++) { const u = k / n2; for (const r of projLine([vLerp(e0, e1, u), vLerp(top0, top1, u)])) { polyPath(ctx, r, false); ctx.stroke(); } }
      ctx.restore();
    }
    paintPatches(ctx, sp, faceCol(roofC, pal.roofShade, n, pal), Math.round(mid[0] * 13 + mid[2] * 7), z, pal);
    polyPath(ctx, sp); ctx.lineWidth = lw; ctx.strokeStyle = BGSTYLE.painted ? rgba(shadeHex(roofC, -.4), .4) : rgba(pal.line, .8); ctx.stroke();
  }
  // eave edge highlight line (white tile caps)
  const ep = projPoly(eave); if (ep.length > 2) { polyPath(ctx, ep); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = rgba(mixHex(roofC, '#ffffff', .4), .8); ctx.stroke(); }
}
// ------------------------------------------------------------------------------------------- props
function drawRock(ctx, c, r, pal, seed, col) {
  const rr = rng(seed), n = 7, h = r * (.55 + rr() * .5), base = [], mid = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU + rr() * .4; const k = .75 + rr() * .4; base.push([c[0] + Math.cos(a) * r * k, c[1], c[2] + Math.sin(a) * r * k]); const k2 = .5 + rr() * .3; mid.push([c[0] + Math.cos(a + .2) * r * k2, c[1] + h * (.55 + rr() * .25), c[2] + Math.sin(a + .2) * r * k2]); }
  const apex = [c[0] + (rr() - .5) * r * .3, c[1] + h, c[2] + (rr() - .5) * r * .3];
  const cam = CAM.cur, b0 = col || '#8a7e70', z = camDepth(c), faces = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push([base[i], base[j], mid[j], mid[i]]); faces.push([mid[i], mid[j], apex]); }
  const lw = clamp(160 / Math.max(1, z), .6, 2.6);
  for (const f of faces.map(f => ({ f, m: f.reduce((a, p) => vAdd(a, vMul(p, 1 / f.length)), [0, 0, 0]) })).sort((a, b) => camDepth(b.m) - camDepth(a.m))) {
    const nn = vNorm(vCross(vSub(f.f[1], f.f[0]), vSub(f.f[f.f.length - 1], f.f[0]))); if (vDot(nn, vSub(cam.pos, f.m)) <= 0) continue;
    const sp = projPoly(f.f); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = fogMix(faceCol(b0, '#4a4058', nn, pal), z, pal); ctx.fill(); ctx.lineWidth = lw * .6; ctx.strokeStyle = rgba('#2a2228', .5); ctx.stroke();
  }
  // silhouette ink
  const h2 = hull2(base.concat(mid, [apex]).map(p => { const q = proj2(p); return [q[0], q[1]]; })); if (h2.length > 2) { polyPath(ctx, h2); ctx.lineWidth = lw; ctx.strokeStyle = rgba('#2a2228', .85); ctx.stroke(); }
}
function drawIceSpike(ctx, c, h, r, pal, seed, tilt = [0, 0]) {
  const rr = rng(seed), n = 5, pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + rr() * .5; pts.push([c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]); }
  const apex = [c[0] + tilt[0] * h, c[1] + h, c[2] + tilt[1] * h]; const cam = CAM.cur, z = camDepth(c);
  for (let i = 0; i < n; i++) { const f = [pts[i], pts[(i + 1) % n], apex], nn = vNorm(vCross(vSub(f[1], f[0]), vSub(f[2], f[0]))), m = vMul(vAdd(vAdd(f[0], f[1]), f[2]), 1 / 3); if (vDot(nn, vSub(cam.pos, m)) <= 0) continue; const sp = projPoly(f); if (sp.length < 3) continue; const k = lightK(nn, pal); polyPath(ctx, sp); ctx.fillStyle = fogMix(k > .2 ? '#e6f8ff' : k > -.2 ? '#a8d8f2' : '#6aa4d0', z, pal, .7); ctx.fill(); ctx.lineWidth = clamp(140 / z, .6, 2.2); ctx.strokeStyle = 'rgba(40,90,140,.85)'; ctx.stroke(); }
}
function drawCrater(ctx, c, r, pal, seed = 1, depth = 1) {
  const rr = rng(seed), n = 28, rim = [], inner = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = .85 + rr() * .3; rim.push([c[0] + Math.cos(a) * r * k * 1.15, .01, c[2] + Math.sin(a) * r * k * 1.15]); inner.push([c[0] + Math.cos(a) * r * k * .8, .012, c[2] + Math.sin(a) * r * k * .8]); }
  let sp = projPoly(rim); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = mixHex(pal.ground, '#ffffff', .12); ctx.fill(); }
  sp = projPoly(inner); if (sp.length > 2) { polyPath(ctx, sp); const z = camDepth(c); ctx.fillStyle = fogMix(mixHex(pal.ground2, '#20141a', .45 * depth), z, pal); ctx.fill();
    // far inner wall catches light: crescent of lighter tone
    const s = vNorm(pal.sun), lit = inner.map((p, i) => { const a = i / n * TAU, d = Math.cos(a) * -s[0] + Math.sin(a) * -s[2]; return vLerp([c[0], .013, c[2]], p, d > 0 ? 1 : .55 + .45 * (1 + d)); });
    const lp = projPoly(lit); ctx.save(); polyPath(ctx, sp); ctx.clip(); ctx.beginPath(); polyAdd(ctx, sp); polyAdd(ctx, lp.slice().reverse()); ctx.fillStyle = fogMix(mixHex(pal.ground, '#ffffff', .05), z, pal); ctx.globalAlpha = .7; ctx.fill('evenodd'); ctx.restore();
    polyPath(ctx, sp); ctx.lineWidth = 1.8; ctx.strokeStyle = rgba(pal.line, .85); ctx.stroke(); }
  // radial cracks
  ctx.strokeStyle = rgba('#20141a', .7); ctx.lineWidth = 1.6;
  for (let i = 0; i < 12; i++) { const a = rr() * TAU; let p = [c[0] + Math.cos(a) * r, .013, c[2] + Math.sin(a) * r]; const line = [p]; for (let k = 0; k < 4; k++) { const aa = a + (rr() - .5) * .8; p = [p[0] + Math.cos(aa) * r * .25, .013, p[2] + Math.sin(aa) * r * .25]; line.push(p); } for (const rn of projLine(line)) { polyPath(ctx, rn, false); ctx.stroke(); } }
  for (let i = 0; i < 8; i++) { const a = rr() * TAU; drawRock(ctx, [c[0] + Math.cos(a) * r * 1.2, 0, c[2] + Math.sin(a) * r * 1.2], r * (.06 + rr() * .08), pal, seed * 31 + i); }
}
// soft painted smoke column far away (for destruction stages)
function drawSmokeColumn(ctx, base, h, w, pal, t, seed = 1, col = '#5a5058') {
  const r = rng(seed); for (let i = 0; i < 12; i++) { const u = i / 11; const p = project(vAdd(base, [Math.sin(u * 3 + t * .15 + seed) * w * .5 * u + t * .25 * u, u * h, 0])); if (!p) continue; const rad = (w * (.35 + u * .8)) * p.s;
    const c1 = fogMix(mixHex(col, pal.fog, u * .35), 200, pal); blobPath(ctx, p.x, p.y, rad, seed * 13 + i, 8, .18, t * .3); ctx.fillStyle = shadeHex(c1, -.12); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(pal.line, .5); ctx.stroke();
    blobPath(ctx, p.x - rad * .15, p.y - rad * .18, rad * .75, seed * 17 + i, 8, .15); ctx.fillStyle = c1; ctx.fill(); }
}
function drawTree(ctx, c, h, pal, seed, blossom = '#f6b6c8') { // sakura: trunk + branches + layered blossom clusters
  const p0 = project(c); if (!p0) return; const z = camDepth(c), r = rng(seed), s = p0.s;
  const trunkC = fogMix('#4a3430', z, pal), B = fogMix(blossom, z, pal), Bd = fogMix(mixHex(blossom, '#a04a78', .35), z, pal), Bl = fogMix(mixHex(blossom, '#fff4f8', .5), z, pal);
  const P = (x, y, zz) => proj2([c[0] + x, c[1] + y, c[2] + zz]);
  // branches
  ctx.strokeStyle = trunkC; ctx.lineCap = 'round';
  const tips = [];
  const branch = (x, y, zz, ang, len, wdt, depth) => { const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len * .9 + len * .4, z2 = zz + (r() - .5) * len * .6; const a = P(x, y, zz), b = P(x2, y2, z2); ctx.lineWidth = Math.max(1, wdt * s); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2 + (r() - .5) * len * s * .2, (a[1] + b[1]) / 2, b[0], b[1]); ctx.stroke(); if (depth > 0) { branch(x2, y2, z2, ang - .5 - r() * .3, len * .7, wdt * .6, depth - 1); branch(x2, y2, z2, ang + .45 + r() * .3, len * .65, wdt * .6, depth - 1); } else tips.push([x2, y2, z2]); };
  branch(0, 0, 0, -HP + .08, h * .32, .32, 0); tips.length = 0;
  branch(0, h * .3, 0, -HP - .1, h * .25, .25, 3);
  // blossom clusters: shaded base, mid, lit top; then petal speckles
  const cl = tips.map(tp => ({ p: P(tp[0], tp[1] + h * .04, tp[2]), rr: h * (.12 + r() * .1) * s })).sort((a, b) => a.p[1] - b.p[1]);
  for (const pass of [0, 1, 2]) for (const q of cl) { const off = pass === 0 ? [q.rr * .1, q.rr * .18] : pass === 1 ? [0, 0] : [-q.rr * .2, -q.rr * .25]; const rr = q.rr * (pass === 2 ? .55 : 1); ctx.fillStyle = pass === 0 ? Bd : pass === 1 ? B : Bl; blobPath(ctx, q.p[0] + off[0], q.p[1] + off[1], rr, seed * 7 + Math.round(q.p[0]), 9, .22); ctx.fill(); }
  ctx.fillStyle = Bl; for (let i = 0; i < 60; i++) { const q = cl[i % cl.length]; if (!q) break; const a = r() * TAU, d = q.rr * (.6 + r() * .6); ctx.beginPath(); ctx.ellipse(q.p[0] + Math.cos(a) * d, q.p[1] + Math.sin(a) * d, Math.max(1, q.rr * .07), Math.max(.7, q.rr * .04), a, 0, TAU); ctx.fill(); }
}
// foreground branches/foliage in front of the camera (out-of-focus framing element). side: 'tl'|'tr'|'bl'|'br'
function drawForegroundBranch(ctx, pal, side = 'tr', t = 0, col = '#f2a8c0', blur = 6) {
  const sx = side[1] === 'r' ? 1 : -1, sy = side[0] === 'b' ? 1 : -1, x0 = W / 2 + sx * W * .55, y0 = H / 2 + sy * H * .55, r = rng(side.charCodeAt(0) * 7 + side.charCodeAt(1));
  ctx.save(); ctx.filter = `blur(${blur}px)`; ctx.strokeStyle = '#2a1a1c'; ctx.lineCap = 'round'; ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 - sx * 260, y0 - sy * 60, x0 - sx * 520 + Math.sin(t) * 10, y0 - sy * 180); ctx.stroke();
  for (let i = 0; i < 26; i++) { const u = r(), x = lerp(x0, x0 - sx * 520, u) + (r() - .5) * 160, y = lerp(y0, y0 - sy * 180, u) + (r() - .5) * 140 + Math.sin(t * 1.3 + i) * 4, rr = 30 + r() * 50; ctx.fillStyle = r() < .3 ? mixHex(col, '#a04a78', .3) : r() < .6 ? col : mixHex(col, '#ffffff', .45); blobPath(ctx, x, y, rr, i * 13, 8, .25); ctx.fill(); }
  ctx.restore();
}
// ------------------------------------------------------------------------------------------- set generators
const SETCACHE = {};
function seireiteiCity(seed = 1, opt = {}) {
  const key = 'city' + seed + JSON.stringify(opt); if (SETCACHE[key]) return SETCACHE[key];
  const r = rng(seed), B = [];
  const street = opt.street || 7; // half width of the main street along z
  for (let z = -260; z < 260; z += 18 + r() * 8) {
    for (const side of [-1, 1]) {
      // compound wall along the street
      const wx = side * (street + .4); B.push({ c: [wx, 0, z + 9], w: .7, d: 18, h: 3.2, yaw: 0, roof: 'cap', rh: .55, ov: .45, base: .6, kind: 'wall', seed: Math.floor(r() * 1e5) });
      // inner buildings
      for (let k = 0; k < 2; k++) {
        const w = 8 + r() * 10, d = 8 + r() * 8, h = 4.5 + r() * 6 + (r() < .12 ? 10 : 0);
        const x = side * (street + 5 + k * 13 + w / 2 + r() * 4);
        B.push({ c: [x, 0, z + 9 + (r() - .5) * 6], w, d, h, yaw: (r() - .5) * .04, roof: r() < .7 ? 'hip' : 'gable', base: .9, posts: 2.6, win: true, seed: Math.floor(r() * 1e5) });
      }
    }
  }
  // side street walls crossing (perspective variety)
  for (let i = 0; i < 6; i++) { const z = -120 + i * 48; for (const side of [-1, 1]) B.push({ c: [side * (street + 22), 0, z], w: 28, d: .7, h: 3.2, yaw: 0, roof: 'cap', rh: .55, ov: .45, base: .6, kind: 'wall', seed: i * 7 + side }); }
  // garden trees inside the compounds (pines and sakura) - break the box rhythm
  for (let z = -200; z < 200; z += 11 + r() * 9) for (const side of [-1, 1]) if (r() < .55) B.push({ kind: 'tree', c: [side * (street + 3 + r() * 6), 0, z], w: 3, d: 3, h: 6 + r() * 4, seed: Math.floor(r() * 1e5), col: r() < .45 ? '#f2b0c8' : '#3a5a48' });
  // landmark towers far away
  const towers = [[-90, -330, 60], [140, -420, 85], [-260, 120, 48], [300, 60, 70], [40, 380, 52]];
  for (const [x, z, h] of towers) B.push({ c: [x, 0, z], w: 18, d: 18, h, roof: 'hip', rh: 7, ov: 3, base: 2, posts: 4, win: true, seed: x + z, tower: true });
  return SETCACHE[key] = B;
}
function drawBuildings(ctx, list, pal, opt) {
  const cam = CAM.cur; const items = list.map(b => ({ b, z: camDepth(vAdd(b.c, [0, b.h / 2, 0])) })).filter(o => o.z > -Math.max(o.b.w, o.b.d) && o.z < (opt.far || 900));
  items.sort((a, b) => b.z - a.z);
  if (opt.layer !== 'fg' && opt.shadows !== false) drawBuildingShadows(ctx, items.filter(o => o.z < 260).map(o => o.b), pal);
  for (const o of items) {
    if (opt.layer === 'bg' && opt.zSplit != null && o.z < opt.zSplit) continue;
    if (opt.layer === 'fg' && (opt.zSplit == null || o.z >= opt.zSplit)) continue;
    const b = o.b; if (b.kind === 'tree') { drawTree(ctx, b.c, b.h, pal, b.seed, b.col); continue; }
    const brk = b.kind === 'wall' && opt.dmg > 1 && hash(b.seed) < .3 * opt.dmg; const bb = opt.dmg ? Object.assign({}, b, { broken: b.kind === 'wall' ? 0 : Math.min(1, opt.dmg * .4), h: brk ? b.h * (.35 + hash(b.seed + 1) * .3) : b.h, roof: brk ? 'flat' : b.roof }) : b;
    drawBuilding(ctx, bb, pal, opt);
  }
}
// sun-projected cast shadows of boxes on the ground plane (painted, multiply)
function hull2(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
function drawBuildingShadows(ctx, list, pal) {
  const s = vNorm(pal.sun); if (s[1] < .08) return; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mixHex(pal.wallShade || '#8a80a8', '#ffffff', .25);
  ctx.beginPath();
  for (const b of list) { const { bot, top } = boxCorners(b); const hh = b.h + (b.roof && b.roof !== 'flat' ? (b.rh == null ? Math.min(b.w, b.d) * .38 : b.rh) : 0); const pts = []; for (const p of bot) pts.push([p[0], p[2]]); for (const p of top) { const y = hh; pts.push([p[0] - s[0] / s[1] * y, p[2] - s[2] / s[1] * y]); }
    const hl = hull2(pts); const sp = projPoly(hl.map(q => [q[0], .004, q[1]])); if (sp.length < 3) continue; polyAdd(ctx, sp); }
  ctx.fill('nonzero'); ctx.restore();
}
function drawMountains(ctx, pal, seed = 4, dist = 1200, hMax = 160, col = null) {
  const cam = CAM.cur, r = rng(seed), pts = [];
  for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU; pts.push([cam.pos[0] + Math.sin(a) * dist, hMax * (.25 + .75 * Math.pow(Math.abs(fbm(i * .21 + seed, 3)), .8)) * (.5 + r() * .5), cam.pos[2] + Math.cos(a) * dist]); }
  const c = col || mixHex(pal.fog, pal.skyMid, .35);
  for (let i = 0; i < 72; i++) { const a = pts[i], b = pts[i + 1]; const sp = projPoly([[a[0], -5, a[2]], [b[0], -5, b[2]], b, a]); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke(); }
}
// Sokyoku-like rock plateau / mesas for wasteland
function drawMesa(ctx, c, r, h, pal, seed) {
  const rr = rng(seed), n = 12, bot = [], top = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = .8 + rr() * .4; bot.push([c[0] + Math.cos(a) * r * k, 0, c[2] + Math.sin(a) * r * k]); top.push([c[0] + Math.cos(a) * r * k * .82, h * (.9 + rr() * .2), c[2] + Math.sin(a) * r * k * .82]); }
  const cam = CAM.cur, z = camDepth(c);
  for (let i = 0; i < n; i++) { const f = [bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]], nn = vNorm(vCross(vSub(f[1], f[0]), vSub(f[3], f[0]))), m = vLerp(f[0], f[2], .5); if (vDot(nn, vSub(cam.pos, m)) <= 0) continue; const sp = projPoly(f); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = fogMix(faceCol('#b08a6a', '#6a4a5a', nn, pal), z, pal); ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = rgba('#5a3a3a', .25); ctx.lineWidth = 2; for (let s2 = 1; s2 < 6; s2++) { const y = h * s2 / 6 * (.9 + .1 * Math.sin(s2 + i)); for (const rn of projLine([vLerp(f[0], f[3], s2 / 6), vLerp(f[1], f[2], s2 / 6)])) { polyPath(ctx, rn, false); ctx.stroke(); } } ctx.restore(); ctx.strokeStyle = rgba(pal.line, .5); ctx.lineWidth = 1; ctx.stroke(); }
  if (cam.pos[1] > h * .9) { const sp = projPoly(top); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix('#c8a882', z, pal); ctx.fill(); } }
}

const SETS = {
  sky: { draw(ctx, t, o) { drawSky(ctx, o.pal, t, o); } },
  seireitei: {
    draw(ctx, t, o) {
      const pal = o.pal;
      if (o.layer !== 'fg') { drawSky(ctx, pal, t, o); drawMountains(ctx, pal, 4, 1400, 140); drawGround(ctx, pal); drawPaving(ctx, pal, CAM.cur.target, 36, 2.4); }
      if (o.layer !== 'fg' && o.dmg) for (let i = 0; i < 3 + o.dmg * 2; i++) { const r = rng(90 + i); drawCrater(ctx, [(r() - .5) * 12, 0, (r() - .5) * 60], 2 + r() * 3 * o.dmg, pal, 90 + i, 1); }
      drawBuildings(ctx, seireiteiCity(o.seed || 1, { street: o.street }), pal, o);
      if (o.layer !== 'fg' && o.dmg > 1) for (let i = 0; i < o.dmg * 2; i++) { const r = rng(140 + i); drawSmokeColumn(ctx, [(r() - .5) * 200, 0, -150 - r() * 200], 60 + r() * 60, 18, pal, t, 140 + i); }
    },
  },
  rooftops: {
    draw(ctx, t, o) {
      const pal = o.pal; if (o.layer !== 'fg') { drawSky(ctx, pal, t, o); drawMountains(ctx, pal, 6, 1400, 140); drawGround(ctx, pal); }
      // dense roof field: buildings of similar height so the camera can sit on the roofline
      const key = 'roofs' + (o.seed || 1); if (!SETCACHE[key]) { const r = rng(o.seed || 1), B = []; for (let i = -9; i <= 9; i++) for (let j = -9; j <= 9; j++) { if (r() < .12) continue; const w = 9 + r() * 4, d = 9 + r() * 4; B.push({ c: [i * 14 + (r() - .5) * 2, 0, j * 14 + (r() - .5) * 2], w, d, h: 7 + r() * 2.5, roof: r() < .8 ? 'hip' : 'gable', rh: 2.4 + r(), ov: 1.1, base: .8, posts: 2.6, win: true, seed: i * 31 + j, yaw: r() < .5 ? 0 : HP }); } for (let k = 0; k < 60; k++) B.push({ kind: 'tree', c: [(r() - .5) * 250, 0, (r() - .5) * 250].map((v, q) => q === 1 ? 0 : Math.round(v / 14) * 14 + 7), w: 3, d: 3, h: 9 + r() * 4, seed: k * 13, col: r() < .5 ? '#f2b0c8' : '#3a5a48' }); SETCACHE[key] = B; }
      drawBuildings(ctx, SETCACHE[key], pal, o);
    },
  },
  courtyard: {
    draw(ctx, t, o) {
      const pal = o.pal; if (o.layer !== 'fg') { drawSky(ctx, pal, t, o); drawGround(ctx, pal, { col: '#e2dccb', col2: '#cfc6b0' }); // raked sand rings
        ctx.strokeStyle = rgba('#a89c84', .5); ctx.lineWidth = 1.2; for (let rr = 3; rr < 26; rr += .9) { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; pts.push([Math.cos(a) * rr, .002, Math.sin(a) * rr]); } for (const r of projLine(pts)) { polyPath(ctx, r, false); ctx.stroke(); } } }
      const key = 'court'; if (!SETCACHE[key]) { const B = []; const R = 30; for (const [x, z, w, d] of [[0, -R, 2 * R, 1], [0, R, 2 * R, 1], [-R, 0, 1, 2 * R], [R, 0, 1, 2 * R]]) B.push({ c: [x, 0, z], w, d, h: 3.6, roof: 'cap', rh: .7, ov: .6, base: .7, kind: 'wall', seed: x + z });
        for (const [x, z, w, d, h] of [[0, -R - 9, 26, 14, 9], [-R - 9, -10, 14, 22, 8], [R + 9, 8, 14, 24, 10], [6, R + 9, 22, 14, 8]]) B.push({ c: [x, 0, z], w, d, h, roof: 'hip', base: 1, posts: 2.8, win: true, seed: x * 3 + z }); SETCACHE[key] = B; }
      drawBuildings(ctx, SETCACHE[key], pal, o);
      if (o.layer !== 'fg') { drawTree(ctx, [-14, 0, -16], 9, pal, 3); drawTree(ctx, [17, 0, -12], 8, pal, 5); drawRock(ctx, [9, 0, 10], 1.6, pal, 9, '#7a7a7e'); drawRock(ctx, [-11, 0, 8], 1.1, pal, 12, '#7a7a7e'); }
      if (o.dmg && o.layer !== 'fg') for (let i = 0; i < 2 + o.dmg * 2; i++) { const r = rng(300 + i); drawCrater(ctx, [(r() - .5) * 30, 0, (r() - .5) * 30], 1.5 + r() * 2.5 * o.dmg, pal, 300 + i); }
    },
  },
  wasteland: {
    draw(ctx, t, o) {
      const pal = o.pal; if (o.layer !== 'fg') { drawSky(ctx, pal, t, Object.assign({ clouds: 10 }, o)); drawMountains(ctx, pal, 9, 1500, 220, mixHex(pal.fog, '#a0806a', .3)); drawGround(ctx, pal, { col: '#d8b98e', col2: '#b8946a' });
        const r = rng(51); for (let i = 0; i < 6; i++) drawMesa(ctx, [(r() - .5) * 700, 0, -200 - r() * 500], 40 + r() * 50, 30 + r() * 60, pal, 51 + i);
        for (let i = 0; i < 40; i++) { const rr = rng(700 + i); drawRock(ctx, [(rr() - .5) * 120, 0, (rr() - .5) * 120], .4 + rr() * 1.8, pal, 700 + i, '#9a7e62'); }
        // dune ridges
        ctx.strokeStyle = rgba('#8a6a4a', .45); ctx.lineWidth = 1.4; for (let k = 0; k < 18; k++) { const z0 = -10 - k * 9, pts = []; for (let i = -40; i <= 40; i++) pts.push([i * 2, .01, z0 + Math.sin(i * .3 + k) * 2]); for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } }
        if (o.dmg) for (let i = 0; i < 2 + o.dmg * 2; i++) { const rr = rng(400 + i); drawCrater(ctx, [(rr() - .5) * 30, 0, (rr() - .5) * 30], 2 + rr() * 4 * o.dmg, pal, 400 + i); } }
    },
  },
  ice: {
    draw(ctx, t, o) {
      const pal = o.pal; if (o.layer !== 'fg') { drawSky(ctx, pal, t, Object.assign({ clouds: 12 }, o)); drawMountains(ctx, pal, 13, 1500, 200, '#c8def0'); const gp = drawGround(ctx, pal, { col: '#d8eef8', col2: '#9cc8e4' });
        // ice floor cracks / reflections
        ctx.strokeStyle = 'rgba(80,140,190,.45)'; ctx.lineWidth = 1.3; const r = rng(61); for (let i = 0; i < 70; i++) { let p = [(r() - .5) * 80, .003, (r() - .5) * 80]; const L = [p]; for (let k = 0; k < 4; k++) { p = [p[0] + (r() - .5) * 5, .003, p[2] + (r() - .5) * 5]; L.push(p); } for (const rn of projLine(L)) { polyPath(ctx, rn, false); ctx.stroke(); } }
        // vertical reflection streaks
        ctx.save(); if (gp) ctx.clip(gp); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 18; i++) { const rr = rng(90 + i); const p = project([(rr() - .5) * 60, 0, -20 - rr() * 60]); if (!p) continue; ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(p.x - 3 * p.s, p.y, 6 * p.s, H); } ctx.restore();
        const rs = rng(81); for (let i = 0; i < 46; i++) { const a = rs() * TAU, d = 12 + rs() * 90; drawIceSpike(ctx, [Math.cos(a) * d, 0, Math.sin(a) * d], 3 + rs() * 14, 1 + rs() * 2.5, pal, 81 + i, [(rs() - .5) * .3, (rs() - .5) * .3]); } }
    },
  },
  void: {
    draw(ctx, t, o) { const pal = o.pal; if (o.layer === 'fg') return; ctx.fillStyle = pal.skyTop; ctx.fillRect(0, 0, W, H); const gp = drawGround(ctx, pal, { col: '#0e0d14', col2: '#06060a' });
      ctx.strokeStyle = 'rgba(120,120,170,.18)'; ctx.lineWidth = 1; for (let rr = 2; rr < 60; rr += 3) { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; pts.push([Math.cos(a) * rr, .002, Math.sin(a) * rr]); } for (const r of projLine(pts)) { polyPath(ctx, r, false); ctx.stroke(); } } },
  },
};
function drawSet(ctx, name, t, opt = {}) {
  const o = Object.assign({ layer: 'all' }, opt); const S = SETS[name]; if (!S) throw new Error('unknown set ' + name);
  o.pal = palOf(opt.pal || S.pal || (name === 'ice' ? 'ice' : name === 'void' ? 'void' : 'day')); S.draw(ctx, t, o); return o.pal;
}
