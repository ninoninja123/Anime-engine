/* engine/sets_hvg.js (agent E, project harry-vs-gojo) - painted 3D sets (parallax, depth layers, gouache pass by post.js).
   valhalla   (valhalla | valhalla_day | valhalla_red) RECORD-OF-RAGNAROK ARENA: round sand + stone floor (r 26, centre rune ring, breakable
              flagstones dmg 0..3), inner wall with torches + banners, 7 tiers of stands full of animated god/creature silhouettes (cheering,
              arms up, giants with horns / halos / wings; o.crowd 0..1 density, o.cheer 0..1), colonnade on top, colossal statues outside,
              raised gods' / announcer box at the back (HVG.BOOTH = {pos, yaw}: stand Urahara there), light shafts on the centre (o.rays).
              Fighters stand around the origin (keep |x|,|z| < 20).  o.dmg 0..3, o.torch 0..1 (flame intensity), o.statues:false.
   valgate    (valgate)   VALHALLA GATES: colossal carved double gate (o.open 0..1), stairs, braziers, cloud floor below, approach causeway along -z.
   voidspace  (void_inf)  UNLIMITED VOID: endless star space, nebulae, infinite light lattice, faint mirror floor of light (o.floor:false), o.k
   hogwarts   (hog_dusk | hog_night)  HARRY'S MEMORY: grassy slope above the Black Lake, Hogwarts castle across the water at z ~ -140 (towers, lit windows),
              mountains, evening sky; o.snow, o.fog.  Characters on the grass near the origin.
   darkforest (forest_night)  FORBIDDEN FOREST: gnarled dark trunks, roots, ferns, moon shafts through mist, glowing eyes far away (o.eyes)
   heavens    (heavens)  ABOVE THE CLOUDS: gold-lit cloud sea, floating broken pillars and rings of light; fighters on a floating stone disc (r 9)
   Palettes in PALETTES / GRADES; BG codes for showdown/common.js: ARENA ARENA_DAY ARENA_RED GATE VOID HOGWARTS FOREST HEAVEN.          */
'use strict';
Object.assign(PALETTES, {
  valhalla: { skyTop: '#060818', skyMid: '#1c2448', skyLow: '#b8643a', fog: '#2a2236', sun: [-.3, .75, .5], ground: '#b8966a', ground2: '#6a4e36', wall: '#6e6066', wallShade: '#241e2c', roof: '#2a2230', roofShade: '#120e16', wood: '#4a3020', cloud: '#5a4a6a', cloudShade: '#1a1830', haze: .45, line: '#0a0810', amb: '#ffc890', stars: true, crowd: '#14101c', crowdRim: '#ffb060', torch: '#ffa040' },
  valhalla_day: { skyTop: '#3a5aa0', skyMid: '#9ab8e0', skyLow: '#ffe2b0', fog: '#e8d0b0', sun: [-.4, .8, .45], ground: '#e0c494', ground2: '#b08a5a', wall: '#d8c8b0', wallShade: '#8a7a8a', roof: '#6a5a6a', roofShade: '#3a3040', wood: '#6a4a30', cloud: '#ffffff', cloudShade: '#c0b8d8', haze: .5, line: '#2a2028', amb: '#fff0d0', crowd: '#3a2e40', crowdRim: '#fff0c0', torch: '#ffc060' },
  valhalla_red: { skyTop: '#12030a', skyMid: '#4a0c18', skyLow: '#e04a2a', fog: '#6a1a1e', sun: [.3, .6, .6], ground: '#a87058', ground2: '#5a3028', wall: '#8a5a50', wallShade: '#2a1018', roof: '#2a1014', roofShade: '#10060a', wood: '#3a1a14', cloud: '#8a2a2a', cloudShade: '#2a0a10', haze: .5, line: '#0a0204', amb: '#ff8a6a', crowd: '#12060a', crowdRim: '#ff6a40', torch: '#ff7030' },
  valgate: { skyTop: '#1a2050', skyMid: '#6a6aa0', skyLow: '#ffc890', fog: '#c8a8b0', sun: [.2, .5, -.8], ground: '#b8a890', ground2: '#7a6a5a', wall: '#c8b8a0', wallShade: '#5a4a5a', roof: '#4a3a40', roofShade: '#1a1218', wood: '#5a3a24', cloud: '#ffe8d0', cloudShade: '#a07a90', haze: .55, line: '#1a1018', amb: '#ffd8b0', torch: '#ffa040' },
  void_inf: { skyTop: '#020208', skyMid: '#060a20', skyLow: '#0c1a40', fog: '#0a1430', sun: [0, .8, .6], ground: '#08101e', ground2: '#02040a', wall: '#2a3a6a', wallShade: '#0a1020', roof: '#0a0e1a', roofShade: '#04060c', wood: '#101420', cloud: '#1a2a5a', cloudShade: '#060a1a', haze: .2, line: '#000000', amb: '#a8d8ff' },
  hog_dusk: { skyTop: '#1e2a5a', skyMid: '#7a5a8a', skyLow: '#ffb070', fog: '#9a7a8a', sun: [.6, .25, -.75], ground: '#3e5236', ground2: '#202c1c', wall: '#a89a8a', wallShade: '#4a4050', roof: '#2a3040', roofShade: '#141820', wood: '#3a2a20', cloud: '#ffc8a0', cloudShade: '#6a4a6a', haze: .55, line: '#141018', amb: '#ffc8a0', water: '#3a4a7a' },
  hog_night: { skyTop: '#03061a', skyMid: '#101c44', skyLow: '#2a3a6a', fog: '#1a2448', sun: [.3, .6, -.6], ground: '#1e2c26', ground2: '#0c1410', wall: '#5a5a70', wallShade: '#1a1a28', roof: '#121624', roofShade: '#080a12', wood: '#1a1410', cloud: '#2a3458', cloudShade: '#0a0e20', haze: .45, line: '#04060a', amb: '#8aa0e0', water: '#101a3a', stars: true },
  forest_night: { skyTop: '#02040a', skyMid: '#0a1420', skyLow: '#1a2a34', fog: '#20343a', sun: [.4, .8, -.3], ground: '#1a2418', ground2: '#0a100a', wall: '#2a3a30', wallShade: '#0a120e', roof: '#0e1610', roofShade: '#050806', wood: '#2a2018', cloud: '#1a2a30', cloudShade: '#0a1014', haze: .7, line: '#020402', amb: '#8ab0c8' },
  heavens: { skyTop: '#2a3a8a', skyMid: '#a8b8f0', skyLow: '#fff0c8', fog: '#ffe8c8', sun: [-.3, .5, -.8], ground: '#d8ccb8', ground2: '#9a8a7a', wall: '#f0e8d8', wallShade: '#a898a8', roof: '#8a7a8a', roofShade: '#4a3a4a', wood: '#7a6a5a', cloud: '#ffffff', cloudShade: '#d0b8c8', haze: .6, line: '#3a2a30', amb: '#fff4d8' },
});
Object.assign(GRADES, {
  valhalla: { sat: 1.12, contrast: 1.12, tint: ['#ffd8b0', .12], lift: ['#140a20', .06] }, valhalla_day: { sat: 1.08, contrast: 1.06, soft: ['#ffe8c0', .15] },
  valhalla_red: { sat: 1.18, contrast: 1.16, tint: ['#ffb0a0', .18], lift: ['#200408', .06] }, valgate: { sat: 1.1, contrast: 1.08, soft: ['#ffd8b8', .16] },
  void_inf: { sat: 1.1, contrast: 1.15 }, hog_dusk: { sat: 1.1, contrast: 1.08, tint: ['#ffd0b0', .15], lift: ['#2a1a3a', .06] }, hog_night: { sat: .95, contrast: 1.12, tint: ['#a0b0e8', .2] },
  forest_night: { sat: .85, contrast: 1.14, tint: ['#a8c0d0', .2], lift: ['#0a1418', .06] }, heavens: { sat: 1.08, contrast: 1.04, soft: ['#fff0d0', .2] },
});
if (window.GOW_PALPOST) Object.assign(window.GOW_PALPOST, { valhalla: { bloom: .6 }, valhalla_red: { bloom: .7 }, void_inf: { bloom: .6 }, hog_night: { bloom: .5 }, forest_night: { bloom: .5 }, heavens: { bloom: .35 } });
if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, { valhalla: { bloom: .6 }, valhalla_red: { bloom: .7 }, void_inf: { bloom: .6 }, heavens: { bloom: .35, halation: .1 } });

const HVG_AR = { R: 26, tiers: 8, tread: 2.3, rise: 2.7, h0: 3.0, seg: 96 };
HVG.BOOTH = { pos: [-1.2, 15.2, -(HVG_AR.R + 8.2)], yaw: 0 };
HVG.GONG = { pos: [4.4, 15.2, -(HVG_AR.R + 7.6)] };   // bronze gong on its stand (Urahara strikes it with the cane; o.gongT = strike time -> wobble)   // announcer / gods' box: stand Urahara here (facing +z = the arena)
function hvPath2D(sp) { const p = new Path2D(); sp.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; }
function hvP(ctx, pts, col, ink = 0, inkCol) { return sadPoly(ctx, pts, col, ink, inkCol); }
function hvFog(col, p, pal, k = 1) { return fogMix(col, camDepth(p), pal, k); }
function hvLitCol(base, n, pal, shadeK = .55) { const k = clamp(vDot(n, vNorm(pal.sun)), -1, 1); return mixHex(mixHex(base, pal.wallShade, shadeK * clamp(.5 - k, 0, 1)), '#ffffff', .08 * clamp(k, 0, 1)); }
// one painted god/creature silhouette into a Path2D at screen pos (x = centre, y = feet), height hpx; kind bits from the seed
function hvCrowdFig(path, x, y, hpx, seed, t, cheer, mode = 'cheer', eyes = null) {
  if (mode === 'fallen') { const h0 = hash(seed), w0 = hpx * .32, sg0 = h0 < .5 ? -1 : 1; path.moveTo(x + w0 * 1.1, y - hpx * .1); path.ellipse(x, y - hpx * .1, w0 * 1.1, hpx * .1, 0, 0, TAU); path.moveTo(x + sg0 * w0 * 1.25 + hpx * .1, y - hpx * .14); path.arc(x + sg0 * w0 * 1.25, y - hpx * .14, hpx * .1, 0, TAU); return; }   // fainted (Conqueror's Haki)
  if (mode === 'toonRun') { const h0 = hash(seed), dir = h0 < .5 ? -1 : 1; x += (((t * 2.5 + h0 * 7) % 1) - .5) * hpx * 1.4 * dir; const r = hpx * .2; path.moveTo(x + r, y - r); path.arc(x, y - r, r, 0, TAU); y -= r * 1.4; mode = 'gasp'; }   // cartoon run: legs as a spinning wheel
  const h = hash(seed), h2 = hash(seed * 1.7 + 3), roar = mode === 'roar', gasp = mode === 'gasp', hush = mode === 'hush';
  if (roar) hpx *= 1.08; const bob = hush || gasp ? 0 : Math.abs(Math.sin(t * (5 + h * 4) * (roar ? 1.4 : 1) + h2 * 9)) * hpx * (roar ? .1 : .06) * cheer, lean = gasp ? -hpx * .08 : 0, w = hpx * (.28 + h2 * .08), yy = y - bob - (gasp ? hpx * .03 : 0);
  const hr = hpx * .12, hy = yy - hpx + hr; x += lean * (h < .5 ? 1 : -1) * .3;
  path.moveTo(x - w * .55, yy); path.lineTo(x - w * .5, yy - hpx * .55); path.quadraticCurveTo(x - w * .52, yy - hpx * .78, x - w * .2, yy - hpx * .8); path.lineTo(x + w * .2, yy - hpx * .8); path.quadraticCurveTo(x + w * .52, yy - hpx * .78, x + w * .5, yy - hpx * .55); path.lineTo(x + w * .55, yy); path.closePath();
  if (eyes && h2 > .55) eyes.push([x - hr * .35, hy, hr * .16], [x + hr * .35, hy, hr * .16]);
  if (gasp) { const aw = w * .14; for (const sg of [-1, 1]) { path.moveTo(x + sg * w * .42 - aw, yy - hpx * .72); path.lineTo(x + sg * hr * .5 - aw, hy + hr * .9); path.lineTo(x + sg * hr * .5 + aw, hy + hr * .9); path.lineTo(x + sg * w * .42 + aw, yy - hpx * .7); path.closePath(); } }
  path.moveTo(x + hr, hy); path.arc(x, hy, hr, 0, TAU);
  const arms = hush || gasp ? 0 : roar ? 2 : cheer > .2 ? (hash(seed * 3.3 + Math.floor(t * 2 + h * 5)) < .55 * cheer ? (h < .5 ? 2 : 1) : 0) : 0;
  if (arms) { const aw = w * .16, wave = Math.sin(t * 7 + h * 20) * hpx * .08; for (const sg of arms === 2 ? [-1, 1] : [h2 < .5 ? -1 : 1]) { const sx = x + sg * w * .42; path.moveTo(sx - aw, yy - hpx * .72); path.lineTo(sx + sg * hpx * .12 + wave - aw, yy - hpx * 1.22); path.lineTo(sx + sg * hpx * .12 + wave + aw, yy - hpx * 1.25); path.lineTo(sx + aw, yy - hpx * .7); path.closePath(); } }
  if (h > .9) { for (const sg of [-1, 1]) { path.moveTo(x + sg * hr * .75, hy - hr * .4); path.quadraticCurveTo(x + sg * hr * 1.9, hy - hr * .9, x + sg * hr * 1.35, hy - hr * 2.1); path.quadraticCurveTo(x + sg * hr * 1.3, hy - hr * 1.1, x + sg * hr * .3, hy - hr * .85); path.closePath(); } }   // curved horns
  else if (h > .84) { path.moveTo(x - w * .4, yy - hpx * .75); path.quadraticCurveTo(x - w * 1.6, yy - hpx * 1.3, x - w * 1.2, yy - hpx * .3); path.closePath(); path.moveTo(x + w * .4, yy - hpx * .75); path.quadraticCurveTo(x + w * 1.6, yy - hpx * 1.3, x + w * 1.2, yy - hpx * .3); path.closePath(); }   // wings
  else if (h < .06) { path.moveTo(x - hr * .85, hy - hr * .7); path.quadraticCurveTo(x - hr * .7, hy - hr * 1.5, x - hr * .45, hy - hr * 1.65); path.quadraticCurveTo(x - hr * .2, hy - hr * 1.15, x, hy - hr * 1.6); path.quadraticCurveTo(x + hr * .2, hy - hr * 1.15, x + hr * .45, hy - hr * 1.65); path.quadraticCurveTo(x + hr * .7, hy - hr * 1.5, x + hr * .85, hy - hr * .7); path.closePath(); }   // crown
  else if (h > .8 && h < .84) { path.moveTo(x + hr * .5, hy - hr * .2); path.quadraticCurveTo(x + hr * 1.6, hy - hr * .1, x + hr * 1.5, hy + hr * .4); path.quadraticCurveTo(x + hr * 1.0, hy + hr * .3, x + hr * .5, hy + hr * .5); path.closePath(); }   // beast snout
}
function hvStatueShape(g, kind) {   // colossal statue silhouette, local units: height 1 (feet y = 0, up = -y), centred x
  g.beginPath();
  g.moveTo(-.16, 0); g.lineTo(-.13, -.5); g.lineTo(-.2, -.66); g.lineTo(-.12, -.78); g.lineTo(-.05, -.8); g.lineTo(-.045, -.86); g.arc(0, -.9, .055, Math.PI * .7, Math.PI * 2.3); g.lineTo(.05, -.8); g.lineTo(.12, -.78); g.lineTo(.2, -.66); g.lineTo(.13, -.5); g.lineTo(.16, 0); g.closePath();
  if (kind === 0) { g.moveTo(.2, -.66); g.lineTo(.27, -.5); g.lineTo(.3, -.52); g.lineTo(.22, -.7); g.closePath(); g.rect(.26, -1.15, .022, 1.15); g.moveTo(.27, -1.15); g.lineTo(.24, -1.08); g.lineTo(.3, -1.08); g.closePath(); }          // spear
  else if (kind === 1) { g.moveTo(-.2, -.66); g.lineTo(-.3, -.82); g.lineTo(-.27, -.85); g.lineTo(-.17, -.72); g.closePath(); g.rect(-.31, -1.18, .03, .4); g.moveTo(-.33, -.82); g.lineTo(-.25, -.82); g.lineTo(-.25, -.8); g.lineTo(-.33, -.8); g.closePath(); }     // raised sword
  else { g.moveTo(-.12, -.76); g.quadraticCurveTo(-.55, -1.05, -.48, -.45); g.quadraticCurveTo(-.3, -.62, -.14, -.6); g.closePath(); g.moveTo(.12, -.76); g.quadraticCurveTo(.55, -1.05, .48, -.45); g.quadraticCurveTo(.3, -.62, .14, -.6); g.closePath(); }   // wings
}
function hvFlame(ctx, x, y, s, t, seed, col) {
  const f = Math.floor(t * 12), k = .85 + .3 * hash(seed + f); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - s * .6, s * 4.5, col, .32); ctx.restore();
  ctx.fillStyle = '#ff5a1a'; ctx.beginPath(); ctx.moveTo(x - s * .45, y); ctx.quadraticCurveTo(x - s * .6, y - s * .9 * k, x + (hash(seed + f * 3) - .5) * s * .5, y - s * 1.8 * k); ctx.quadraticCurveTo(x + s * .6, y - s * .9 * k, x + s * .45, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd860'; ctx.beginPath(); ctx.moveTo(x - s * .22, y); ctx.quadraticCurveTo(x - s * .3, y - s * .6, x, y - s * 1.1 * k); ctx.quadraticCurveTo(x + s * .3, y - s * .6, x + s * .22, y); ctx.closePath(); ctx.fill();
}

// ============================================================================================================== VALHALLA ARENA
SETS.valhalla = { pal: 'valhalla', draw(ctx, t, o) {
  const pal = o.pal, A = HVG_AR, R = A.R, cam = CAM.cur, N = A.seg, dmg = o.dmg || 0, cheer = o.cheer == null ? .8 : o.cheer, dens = o.crowd == null ? 1 : o.crowd;
  if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 10, cloudSeed: 77, moon: pal === PALETTES.valhalla, moonOpt: { size: 90 } }, o));
  drawMountains(ctx, pal, 31, 1600, 120, mixHex(pal.fog, pal.skyMid, .4));
  const camAng = Math.atan2(cam.pos[2], cam.pos[0]), visible = a => { const d = Math.cos(a - camAng); return true || d < .95; };
  const Rtop = R + 1.5 + A.tiers * A.tread, Htop = A.h0 + A.tiers * A.rise;
  // colossal statues outside the bowl (behind everything)
  if (o.statues !== false) { const angs = [-2.2, -1.2, -.35, .5, 1.4, 2.3, 3.0]; angs.forEach((a, i) => { const base = [Math.cos(a) * (Rtop + 22), Htop - 6, Math.sin(a) * (Rtop + 22)], q = project(base), qt = project(vAdd(base, [0, 62, 0])); if (!q || !qt || q.z < 1) return;
    const hpx = q.y - qt.y; if (hpx < 8) return; ctx.save(); ctx.translate(q.x, q.y); ctx.scale(hpx, hpx); hvStatueShape(ctx, i % 3); ctx.fillStyle = hvFog(mixHex(pal.wall, pal.wallShade, .35), base, pal, 1.3); ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = hvFog(mixHex(pal.wallShade, pal.skyTop, .3), base, pal, 1.3); ctx.fillRect(0, -1.3, 1, 1.4); ctx.restore(); ctx.lineWidth = 1.2 / hpx; ctx.strokeStyle = rgba(pal.line, .5); ctx.stroke(); ctx.restore();
    if (pal.torch) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y - hpx * .2, hpx * .5, pal.torch, .12); ctx.restore(); } }); }
  // colonnade ring on top of the stands
  for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, a2 = (i + 1) / 48 * TAU, r = Rtop + .8, p0 = [Math.cos(a) * r, Htop, Math.sin(a) * r], n = [-Math.cos(a), 0, -Math.sin(a)]; if (vDot(n, toCam(p0)) <= 0) continue;
    const col = hvFog(hvLitCol(pal.wall, n, pal), p0, pal); hvP(ctx, [p0, [p0[0], Htop + 7, p0[2]], [p0[0] + Math.cos(a) * .9, Htop + 7, p0[2] + Math.sin(a) * .9], [p0[0] + Math.cos(a) * .9, Htop, p0[2] + Math.sin(a) * .9]], col, .8);
    hvP(ctx, [[Math.cos(a) * r, Htop + 7, Math.sin(a) * r], [Math.cos(a2) * r, Htop + 7, Math.sin(a2) * r], [Math.cos(a2) * r, Htop + 8.4, Math.sin(a2) * r], [Math.cos(a) * r, Htop + 8.4, Math.sin(a) * r]], hvFog(mixHex(pal.wall, pal.wallShade, .25), p0, pal), .8);
    if (i % 2 === 0) { const ba = a + TAU / 96, br = r - .2, top = Htop + 6.6, bw = .9; hvP(ctx, [[Math.cos(ba) * br - Math.sin(ba) * bw, top, Math.sin(ba) * br + Math.cos(ba) * bw], [Math.cos(ba) * br + Math.sin(ba) * bw, top, Math.sin(ba) * br - Math.cos(ba) * bw], [Math.cos(ba) * br + Math.sin(ba) * bw * .7, top - 4.5, Math.sin(ba) * br - Math.cos(ba) * bw * .7], [Math.cos(ba) * br, top - 5.3, Math.sin(ba) * br], [Math.cos(ba) * br - Math.sin(ba) * bw * .7, top - 4.5, Math.sin(ba) * br + Math.cos(ba) * bw * .7]], hvFog(i % 4 ? '#8a1c24' : '#c8962a', p0, pal), .6); } }
  // gods' box (announcer) at the back: platform + columns + canopy, warm light (drawn with the tiers so nearer tiers overlap it correctly)
  const drawBooth = () => { const z0 = -(R + 4.2), z1 = -(R + 13.5), y = HVG.BOOTH.pos[1], x0 = -7, x1 = 7;
    hvP(ctx, [[x0 - 1, A.h0, z0 + .2], [x1 + 1, A.h0, z0 + .2], [x1 + 1, y, z0 + .2], [x0 - 1, y, z0 + .2]], hvFog(mixHex(pal.wall, pal.wallShade, .45), [0, y * .6, z0], pal), 1.2);
    for (const sx of [-1, 1]) hvP(ctx, [[sx * 3.2 - .8, A.h0 + 1, z0 + .3], [sx * 3.2 + .8, A.h0 + 1, z0 + .3], [sx * 3.2 + .8, y - 1.8, z0 + .3], [sx * 3.2, y - 2.6, z0 + .3], [sx * 3.2 - .8, y - 1.8, z0 + .3]], hvFog('#7a1820', [0, y * .6, z0], pal), .8);
    { const qe = project([0, (A.h0 + y) / 2, z0 + .3]); if (qe && qe.z > 1) { ctx.strokeStyle = hvFog('#d8a830', [0, y, z0], pal); ctx.lineWidth = Math.max(1.5, .2 * qe.s); ctx.beginPath(); ctx.arc(qe.x, qe.y, 2.2 * qe.s, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(qe.x, qe.y, 1.6 * qe.s, 0, TAU); ctx.stroke(); } }
    const wcol = hvFog(mixHex('#6a3a20', pal.wall, .25), [0, y, z0], pal);
    hvP(ctx, [[x0, y, z0], [x1, y, z0], [x1, y - 1.6, z0], [x0, y - 1.6, z0]], hvFog(mixHex(pal.wall, pal.wallShade, .3), [0, y, z0], pal), 1.2);
    hvP(ctx, [[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]], hvFog(mixHex(pal.ground, pal.wall, .5), [0, y, z0], pal), .8);
    hvP(ctx, [[x0 + .3, y, z1 + .5], [x1 - .3, y, z1 + .5], [x1 - .3, y + 6.5, z1 + .5], [x0 + .3, y + 6.5, z1 + .5]], hvFog('#3a1a24', [0, y, z1], pal), .8);
    for (const x of [x0 + .5, -2.4, 2.4, x1 - .5]) hvP(ctx, [[x - .3, y, z0 + .3], [x + .3, y, z0 + .3], [x + .3, y + 6.8, z0 + .3], [x - .3, y + 6.8, z0 + .3]], wcol, 1);
    hvP(ctx, [[x0 - .6, y + 6.8, z0 + 1], [x1 + .6, y + 6.8, z0 + 1], [x1 + .2, y + 8.6, (z0 + z1) / 2], [x0 - .2, y + 8.6, (z0 + z1) / 2]], hvFog('#8a1c24', [0, y + 7, z0], pal), 1.2);
    hvP(ctx, [[x0 - .6, y + 6.8, z0 + 1], [x1 + .6, y + 6.8, z0 + 1], [x1 + .6, y + 6.3, z0 + 1], [x0 - .6, y + 6.3, z0 + 1]], hvFog('#d8a830', [0, y + 7, z0], pal), .8);
    hvP(ctx, [[x0, y + 1.1, z0 + .1], [x1, y + 1.1, z0 + .1], [x1, y + .9, z0 + .1], [x0, y + .9, z0 + .1]], hvFog('#d8a830', [0, y, z0], pal), .6);
    const ql = project([0, y + 3, z0 - 3]); if (ql) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, ql.x, ql.y, 9 * ql.s, '#ffc880', .35); ctx.restore(); }
    { const lp = [-4.6, y + 4.6, z0 + .2], q = project(lp); if (q && q.z > 1) { const r = .7 * q.s; ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = Math.max(1, .05 * q.s); ctx.beginPath(); ctx.moveTo(q.x, q.y - r * 2.2); ctx.lineTo(q.x, q.y - r * 1.2); ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, r * 4, '#ffb060', .5); ctx.restore(); ctx.fillStyle = '#f4e2c0'; ctx.beginPath(); ctx.ellipse(q.x, q.y, r * .75, r * 1.1, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a1a10'; ctx.lineWidth = Math.max(1, .04 * q.s); ctx.stroke(); ctx.fillStyle = '#b8201c'; ctx.fillRect(q.x - r * .75, q.y - r * 1.15, r * 1.5, r * .22); ctx.fillRect(q.x - r * .75, q.y + r * .93, r * 1.5, r * .22); ctx.font = `900 ${Math.max(6, r * .9)}px "IPAGothic", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a1010'; ctx.fillText('浦', q.x, q.y); } }
    { const gp = HVG.GONG.pos, q = project(gp), qt = project(vAdd(gp, [0, 2.6, 0])); if (q && qt && q.z > 1) { const s2 = q.s; ctx.strokeStyle = '#3a2414'; ctx.lineWidth = Math.max(1.5, .14 * s2); ctx.beginPath(); ctx.moveTo(q.x - 1.3 * s2, q.y); ctx.lineTo(q.x - 1.3 * s2, qt.y); ctx.lineTo(q.x + 1.3 * s2, qt.y); ctx.lineTo(q.x + 1.3 * s2, q.y); ctx.stroke();
      const gc = project(vAdd(gp, [0, 1.45, 0])); if (gc) { const r = 1.0 * s2, wob = o.gongT != null && t > o.gongT ? Math.sin((t - o.gongT) * 30) * Math.exp(-(t - o.gongT) * 2) * .12 : 0; ctx.save(); ctx.translate(gc.x, gc.y); ctx.rotate(wob); const gr = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); gr.addColorStop(0, '#f0c070'); gr.addColorStop(.6, '#b07a2a'); gr.addColorStop(1, '#5a3a14'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2a1808'; ctx.lineWidth = Math.max(1, .06 * s2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .4, 0, TAU); ctx.stroke(); ctx.restore(); } } }
    for (const sx of [-1, 1]) { const q = project([sx * 6.2, y + .1, z0 + .4]); if (q && q.z > 1) { const s = .7 * q.s; ctx.fillStyle = '#2a2028'; ctx.fillRect(q.x - s * .25, q.y - s * 1.6, s * .5, s * 1.6); hvFlame(ctx, q.x, q.y - s * 1.6, s * .9, t, sx * 13, pal.torch || '#ffa040'); } } };
  // tiers from the outermost inward (painter's order), each followed by its crowd
  const boothA = -HP; let boothDone = false;
  for (let k = A.tiers - 1; k >= 0; k--) {
    const r0 = R + 1.5 + k * A.tread, r1 = r0 + A.tread, h1 = A.h0 + (k + 1) * A.rise, h0 = A.h0 + k * A.rise;
    for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU, am = (a + b) / 2; if (Math.abs(Math.atan2(Math.sin(am - boothA), Math.cos(am - boothA))) < .25 && k < 7) continue;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), pm = [Math.cos(am) * r0, h1, Math.sin(am) * r0];
      if (camDepth(pm) < -5) continue;
      const n = [-Math.cos(am), 0, -Math.sin(am)];
      if (vDot(n, toCam([Math.cos(am) * r0, (h0 + h1) / 2, Math.sin(am) * r0])) > 0) hvP(ctx, [[ca * r0, h0, sa * r0], [cb * r0, h0, sb * r0], [cb * r0, h1, sb * r0], [ca * r0, h1, sa * r0]], hvFog(hvLitCol(mixHex(pal.wall, pal.wallShade, .35), n, pal), pm, pal));
      hvP(ctx, [[ca * r0, h1, sa * r0], [cb * r0, h1, sb * r0], [cb * r1, h1, sb * r1], [ca * r1, h1, sa * r1]], hvFog(pal.wall, pm, pal));
    }
    // crowd on this tier (one Path2D per tier: rim pass + body pass)
    const eyeL = [], eyesOn = o.eyes != null ? o.eyes : !!pal.stars;
    const pathC = new Path2D(), nPer = Math.floor(N * 2.6 * dens * (r0 / R)); let cnt = 0, zs = 0;
    for (let i = 0; i < nPer; i++) { const a = (i + hash(i * 3 + k) * .6) / nPer * TAU; if (Math.abs(Math.atan2(Math.sin(a - boothA), Math.cos(a - boothA))) < .27 && k < 7) continue;
      const rr = r0 + A.tread * (.35 + .3 * hash(i * 7 + k)), p = [Math.cos(a) * rr, h1, Math.sin(a) * rr], q = project(p); if (!q || q.z < 2 || q.x < -60 || q.x > W + 60 || q.y < -40 || q.y > H + 260) continue;
      const big = hash(i * 13 + k * 7) > .965 ? 2.6 : 1, hpx = (1.35 + .5 * hash(i * 5 + k)) * big * q.s; if (hpx < 1.2) continue; let md = o.react || 'cheer'; if (o.faint) { const f0 = o.faint * (A.tiers + 1.5) - k * .9; if (f0 > hash(i * 17 + k * 3)) md = 'fallen'; } hvCrowdFig(pathC, q.x, q.y, hpx, i * 31 + k * 977, t, cheer, md, eyesOn ? eyeL : null); cnt++; zs += q.z; }
    if (cnt) { const zm = zs / cnt, c0 = fogMix(pal.crowd || '#14101c', zm, pal, .8), rim = fogMix(pal.crowdRim || '#ffb060', zm, pal, .8);
      ctx.save(); ctx.translate(-1.6, -1.6); ctx.fillStyle = rgba(rim, .55); ctx.fill(pathC); ctx.restore(); ctx.fillStyle = c0; ctx.fill(pathC);
      if (eyeL.length) { ctx.fillStyle = rgba('#ffe27a', .9); const pe = new Path2D(); for (const [ex, ey, er] of eyeL) { if (er < .6) continue; pe.moveTo(ex + er, ey); pe.arc(ex, ey, Math.max(.7, er), 0, TAU); } ctx.fill(pe); } }
    if (k === 3 && !boothDone) { drawBooth(); boothDone = true; }
  }
  // inner arena wall (stone blocks), banners, torches
  const wallH = A.h0;
  const gateHalf = .16, nearGate = a => Math.min(Math.abs(Math.atan2(Math.sin(a), Math.cos(a))), Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI)))) < gateHalf;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU, am = (a + b) / 2, n = [-Math.cos(am), 0, -Math.sin(am)], pm = [Math.cos(am) * R, wallH / 2, Math.sin(am) * R]; if (vDot(n, toCam(pm)) <= 0 || camDepth(pm) < -3 || nearGate(am)) continue;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), col = hvFog(hvLitCol(mixHex(pal.wall, pal.wallShade, .15), n, pal), pm, pal);
    const sp = hvP(ctx, [[ca * R, 0, sa * R], [cb * R, 0, sb * R], [cb * R, wallH, sb * R], [ca * R, wallH, sa * R]], col);
    if (sp) { ctx.strokeStyle = rgba(pal.line, .35); ctx.lineWidth = Math.max(.6, sadInkW(pm, .8)); for (let j = 1; j < 4; j++) { const y = wallH * j / 4, off = (j % 2) * .5; const p0 = project([ca * R, y, sa * R]), p1 = project([cb * R, y, sb * R]); if (p0 && p1) { ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); } const am2 = lerp(a, b, off + .25), pa = project([Math.cos(am2) * R, y, Math.sin(am2) * R]), pb = project([Math.cos(am2) * R, y - wallH / 4, Math.sin(am2) * R]); if (pa && pb) { ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); } } }
    hvP(ctx, [[ca * R, wallH, sa * R], [cb * R, wallH, sb * R], [cb * (R + .7), wallH, sb * (R + .7)], [ca * (R + .7), wallH, sa * (R + .7)]], hvFog(mixHex(pal.wall, '#ffffff', .12), pm, pal));
    if (i % 8 === 4) { const bw = .7, top = wallH - .2, br = R - .05, west = Math.cos(am) < 0; hvP(ctx, [[Math.cos(am) * br - Math.sin(am) * bw, top, Math.sin(am) * br + Math.cos(am) * bw], [Math.cos(am) * br + Math.sin(am) * bw, top, Math.sin(am) * br - Math.cos(am) * bw], [Math.cos(am) * br + Math.sin(am) * bw, top - 2.4, Math.sin(am) * br - Math.cos(am) * bw], [Math.cos(am) * br, top - 2.9, Math.sin(am) * br], [Math.cos(am) * br - Math.sin(am) * bw, top - 2.4, Math.sin(am) * br + Math.cos(am) * bw]], hvFog(west ? '#7a1820' : '#141c3a', pm, pal), .8);
      const qe = project([Math.cos(am) * br, top - 1.2, Math.sin(am) * br]); if (qe && qe.z > 1) { const r = .38 * qe.s; ctx.lineWidth = Math.max(1, .08 * qe.s); ctx.strokeStyle = hvFog(west ? '#d8a830' : '#7fd8ff', pm, pal); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); if (o.emblem && (typeof o.emblem === 'function' || window.hyEmblem)) { (typeof o.emblem === 'function' ? o.emblem : hyEmblem)(ctx, qe, r, west, pm, pal); } else
        if (west) { ctx.moveTo(qe.x + r * .3, qe.y - r); ctx.lineTo(qe.x - r * .4, qe.y + r * .05); ctx.lineTo(qe.x + r * .1, qe.y + r * .05); ctx.lineTo(qe.x - r * .3, qe.y + r); ctx.lineTo(qe.x + r * .5, qe.y - r * .15); ctx.lineTo(qe.x, qe.y - r * .15); ctx.closePath(); ctx.fill(); }
        else { ctx.ellipse(qe.x, qe.y, r, r * .5, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(qe.x, qe.y, r * .3, 0, TAU); ctx.fill(); } } }
    if (i % 8 === 0) { const tp = [Math.cos(am) * (R - .2), wallH + .1, Math.sin(am) * (R - .2)], q = project(tp), qb = project([tp[0], wallH - 1.2, tp[2]]); if (q && qb && q.z > 1) { ctx.strokeStyle = '#2a1e18'; ctx.lineWidth = Math.max(1.5, .18 * q.s); ctx.beginPath(); ctx.moveTo(qb.x, qb.y); ctx.lineTo(q.x, q.y); ctx.stroke(); const ig = (o.torchT == null ? 1 : clamp((t - o.torchT - (i / N) * (o.torchSpan || 1.2)) / .15, 0, 1)) * (o.torchOutT == null ? 1 : 1 - clamp((t - o.torchOutT - (i / N) * (o.torchSpan || 1.2)) / .1, 0, 1)); if (ig > 0) hvFlame(ctx, q.x, q.y, .55 * q.s * (o.torch == null ? 1 : o.torch) * ig, t, i, pal.torch || '#ffa040'); } }
  }
  hvArenaGate(ctx, Math.PI, 'west', o, pal, t); hvArenaGate(ctx, 0, 'east', o, pal, t);
  // floor: sand disc + inner flagstone circle + rune ring + damage
  const disc = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU; disc.push([Math.cos(a) * R, 0, Math.sin(a) * R]); }
  const dp = projPoly(disc); if (dp.length > 2) { polyPath(ctx, dp); const gq = project([0, 0, 0]); const grd = ctx.createRadialGradient(gq ? gq.x : W / 2, gq ? gq.y : H * .7, 10, gq ? gq.x : W / 2, gq ? gq.y : H * .7, W * .8); grd.addColorStop(0, mixHex(pal.ground, '#fff0d0', .12)); grd.addColorStop(1, pal.ground2); ctx.fillStyle = grd; ctx.fill(); const path = hvPath2D(dp); texOverlay(ctx, path, .25); }
  ctx.strokeStyle = rgba(pal.line, .3); ctx.lineWidth = 1;
  for (let ring = 1; ring <= 5; ring++) { const rr = ring * 2.2; const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; pts.push([Math.cos(a) * rr, .002, Math.sin(a) * rr]); } for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); }
    const nS = ring * 8; for (let i = 0; i < nS; i++) { const a = (i + (ring % 2) * .5) / nS * TAU, l = projLine([[Math.cos(a) * (rr - 2.2), .002, Math.sin(a) * (rr - 2.2)], [Math.cos(a) * rr, .002, Math.sin(a) * rr]]); for (const rn of l) { polyPath(ctx, rn, false); ctx.stroke(); } } }
  { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU; pts.push([Math.cos(a) * 11.4, .003, Math.sin(a) * 11.4]); } ctx.strokeStyle = rgba('#d8a830', .55); ctx.lineWidth = 3; for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } const pts2 = pts.map(p => [p[0] * 1.08, p[1], p[2] * 1.08]); for (const rn of projLine(pts2)) { polyPath(ctx, rn, false); ctx.stroke(); }
    ctx.fillStyle = rgba('#d8a830', .5); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, c = [Math.cos(a) * 11.85, .004, Math.sin(a) * 11.85], q = project(c); if (!q || q.z < 1) continue; const s = .28 * q.s; ctx.save(); ctx.translate(q.x, q.y); ctx.scale(1, .45); ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .6, 0); ctx.lineTo(0, s); ctx.lineTo(-s * .6, 0); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  { const rr0 = R - 2.4, rr1 = R - 1.4, rc = mixHex('#ffd36a', '#ff2a2a', clamp(o.ringRed || 0, 0, 1)), band = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU; band.push([Math.cos(a) * rr1, .004, Math.sin(a) * rr1]); } for (let i = 96; i >= 0; i--) { const a = i / 96 * TAU; band.push([Math.cos(a) * rr0, .004, Math.sin(a) * rr0]); }
    const sp = projPoly(band); if (sp.length > 2) { ctx.save(); ctx.globalCompositeOperation = 'screen'; polyPath(ctx, sp); ctx.fillStyle = rgba(rc, .35); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const rr of [rr0, rr1]) { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU; pts.push([Math.cos(a) * rr, .005, Math.sin(a) * rr]); } ctx.strokeStyle = rgba(rc, .95); ctx.lineWidth = 3; for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } }
    ctx.font = '700 40px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'; for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, c = [Math.cos(a) * (rr0 + rr1) / 2, .006, Math.sin(a) * (rr0 + rr1) / 2], q = project(c); if (!q || q.z < 1) continue; const sz = .6 * q.s; if (sz < 3) continue; ctx.save(); ctx.translate(q.x, q.y); ctx.scale(sz / 40, sz / 40 * .45); ctx.fillStyle = rgba(rc, .9); ctx.fillText(runes[i % runes.length], 0, 0); ctx.restore(); } ctx.restore(); }
  if (o.crater) { const cc = o.craterAt || [9, 0, -3], cr = (o.craterR || 9) * clamp(o.crater, 0, 1), ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; ring.push([cc[0] + Math.cos(a) * cr, .01, cc[2] + Math.sin(a) * cr]); } const sp = projPoly(ring);
    if (sp.length > 2) { polyPath(ctx, sp); const q = project(cc); const gr = ctx.createRadialGradient(q ? q.x : W / 2, q ? q.y : H / 2, 0, q ? q.x : W / 2, q ? q.y : H / 2, cr * (q ? q.s : 50)); gr.addColorStop(0, '#0a0608'); gr.addColorStop(.7, mixHex(pal.ground2, '#000', .6)); gr.addColorStop(1, pal.ground2); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = rgba('#2a1810', .9); ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 18; i++) { const a = hash(i * 3) * TAU; drawRock(ctx, [cc[0] + Math.cos(a) * cr * 1.05, 0, cc[2] + Math.sin(a) * cr * 1.05], .3 + hash(i) * .7, pal, 600 + i, mixHex(pal.wall, pal.ground2, .5)); } } }
  if (dmg) { const r = rng(91); for (let i = 0; i < dmg * 5; i++) { const c = [(r() - .5) * 22, .005, (r() - .5) * 22], rr = .8 + r() * 1.6 * dmg; hvBrokenTiles(ctx, c, rr, pal, 91 + i); }
    for (let i = 0; i < dmg * 2; i++) drawCrater(ctx, [(r() - .5) * 18, 0, (r() - .5) * 18], 1.5 + r() * 2 * dmg, pal, 300 + i, 1);
    ctx.strokeStyle = rgba('#1a1010', .7); ctx.lineWidth = 2; for (let i = 0; i < dmg * 7; i++) { let p = [(r() - .5) * 16, .004, (r() - .5) * 16]; const L = [p]; for (let k = 0; k < 5; k++) { p = [p[0] + (r() - .5) * 3, .004, p[2] + (r() - .5) * 3]; L.push(p); } for (const rn of projLine(L)) { polyPath(ctx, rn, false); ctx.stroke(); } } }
  // light shafts onto the centre (contrast: pools of light in a dark bowl)
  if (o.rays !== false) { const qc = project([0, 0, 0]), qt = project([6, 60, -10]); if (qc && qt) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let k = 0; k < 3; k++) { const off = (k - 1) * 90, w0 = 260 + k * 60, gr = ctx.createLinearGradient(qt.x, qt.y, qc.x, qc.y); gr.addColorStop(0, rgba('#ffe8c0', 0)); gr.addColorStop(.6, rgba('#ffe0b0', .05 * (o.rays || 1))); gr.addColorStop(1, rgba('#fff0d0', .09 * (o.rays || 1)));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(qt.x + off - 40, qt.y); ctx.lineTo(qt.x + off + 40, qt.y); ctx.lineTo(qc.x + off * 2 + w0, qc.y + 40); ctx.lineTo(qc.x + off * 2 - w0, qc.y + 40); ctx.closePath(); ctx.fill(); }
      const fl = ctx.createRadialGradient(qc.x, qc.y, 0, qc.x, qc.y, 12 * qc.s); fl.addColorStop(0, rgba('#fff0d0', .22)); fl.addColorStop(1, rgba('#fff0d0', 0)); ctx.fillStyle = fl; ctx.save(); ctx.translate(qc.x, qc.y); ctx.scale(1, .35); ctx.translate(-qc.x, -qc.y); ctx.fillRect(qc.x - 14 * qc.s, qc.y - 14 * qc.s, 28 * qc.s, 28 * qc.s); ctx.restore(); ctx.restore(); } }
} };
// arena gates in the inner wall: west (Harry, gold light, gothic arch + iron portcullis) / east (Gojo, blue light, dark square arch); o.gateW / o.gateE 0..1 = open
function hvArenaGate(ctx, a, side, o, pal, t) {
  const R = HVG_AR.R, C = [Math.cos(a) * R, 0, Math.sin(a) * R], T = [-Math.sin(a), 0, Math.cos(a)], N = [-Math.cos(a), 0, -Math.sin(a)]; if (vDot(N, toCam(vAdd(C, [0, 3, 0]))) <= 0 || camDepth(C) < -3) return;
  const P = (x, y, d = 0) => vAdd(vAdd(C, vMul(T, x)), vAdd([0, y, 0], vMul(N, d))), west = side === 'west', ow = 3.2, oh = west ? 6.5 : 6.0, open = clamp(west ? (o.gateW || 0) : (o.gateE || 0), 0, 1);
  const stone = hvFog(west ? mixHex(pal.wall, '#a08a6a', .3) : mixHex(pal.wall, '#2a3040', .5), C, pal), light = o.gateCols ? o.gateCols[west ? 0 : 1] : (west ? '#ffd36a' : '#5fd3ff');
  hvP(ctx, [P(-5.5, 0), P(5.5, 0), P(5.5, 10.5), P(4.6, 11.6), P(0, 12.6), P(-4.6, 11.6), P(-5.5, 10.5)], stone, 1.2);
  const hole = []; hole.push(P(-ow, 0, .05), P(ow, 0, .05)); if (west) { for (let i = 0; i <= 8; i++) { const u = i / 8, an = u * Math.PI; hole.push(P(Math.cos(an) * ow, oh + Math.sin(an) * 1.6 * (1 - Math.abs(Math.cos(an)) * .3), .05)); } } else hole.push(P(ow, oh, .05), P(-ow, oh, .05));
  const sp = projPoly(hole); if (sp.length > 2) { polyPath(ctx, sp); const q = project(P(0, 2.5, -1)); const gr = ctx.createRadialGradient(q ? q.x : W / 2, q ? q.y : H / 2, 0, q ? q.x : W / 2, q ? q.y : H / 2, 6 * (q ? q.s : 40)); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, light); gr.addColorStop(1, mixHex(light, '#000', .7)); ctx.fillStyle = gr; ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'screen'; if (q) glow(ctx, q.x, q.y, 7 * q.s, light, .35 + .25 * open); ctx.restore(); }
  // portcullis / grille rising with 'open'
  const yb = open * oh, bars = west ? '#2a2a30' : '#0e1018'; ctx.strokeStyle = bars; for (let i = -6; i <= 6; i++) { const x = i / 6 * ow * .95, a1 = project(P(x, yb, .1)), b1 = project(P(x, oh + (west ? 1.4 * Math.sqrt(Math.max(0, 1 - (x / ow) ** 2)) : 0), .1)); if (a1 && b1) { ctx.lineWidth = Math.max(1.5, .12 * a1.s); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); } }
  for (let j = 0; j < 7; j++) { const y = yb + j * 1.0; if (y > oh) break; const a1 = project(P(-ow, y, .1)), b1 = project(P(ow, y, .1)); if (a1 && b1) { ctx.lineWidth = Math.max(1.5, .12 * a1.s); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); } }
  for (const sx of [-1, 1]) { const q = project(P(sx * 4.6, 7.2, .3)); if (q && q.z > 1) hvFlame(ctx, q.x, q.y, .6 * q.s, t, sx * 5 + (west ? 1 : 2), o.gateCols ? (o.gateFlame || '#ffa040') : (west ? '#ffb040' : '#60c8ff')); }
  const qk = project(P(0, 9.6, .1)); if (qk && qk.z > 1) { const r = .9 * qk.s; ctx.lineWidth = Math.max(1.5, .14 * qk.s); ctx.strokeStyle = light; ctx.fillStyle = light; ctx.beginPath(); if (o.emblem && (typeof o.emblem === 'function' || window.hyEmblem)) { (typeof o.emblem === 'function' ? o.emblem : hyEmblem)(ctx, qk, r, west, C, pal); } else if (west) { ctx.moveTo(qk.x, qk.y - r); ctx.lineTo(qk.x + r * .9, qk.y + r * .6); ctx.lineTo(qk.x - r * .9, qk.y + r * .6); ctx.closePath(); ctx.moveTo(qk.x, qk.y - r); ctx.lineTo(qk.x, qk.y + r * .6); ctx.stroke(); ctx.beginPath(); ctx.arc(qk.x, qk.y + r * .15, r * .4, 0, TAU); ctx.stroke(); } else { ctx.ellipse(qk.x, qk.y, r, r * .5, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(qk.x, qk.y, r * .25, 0, TAU); ctx.fill(); } }
}
// foreground crowd (screen space, big soft heads + shoulders along the bottom edge; put in f.fx(..., {layer:'top'}) or 'over')
function fxCrowdFG(g, t, o = {}) {
  const n = o.n || 9, col = o.col || '#0a080e', path = new Path2D(), react = o.react || 'cheer', y0 = H + (o.y || 40);
  for (let i = 0; i < n; i++) { const x = (i + .5) / n * W + (hash(i * 3) - .5) * 120, hpx = (o.size || 300) * (.85 + hash(i * 7) * .35); hvCrowdFig(path, x, y0 + hpx * .42, hpx, i * 13 + 5, t, o.cheer == null ? .9 : o.cheer, o.faint && o.faint * 1.2 > hash(i * 5 + 1) ? 'fallen' : react); }
  g.save(); if (o.blur !== false) g.filter = `blur(${o.blur || 5}px)`; if (o.rim) { g.save(); g.translate(-5, -5); g.fillStyle = rgba(o.rim, .6); g.fill(path); g.restore(); } g.fillStyle = col; g.fill(path); g.restore();
}
// broken flagstones: tilted slabs with dark gaps (dmg)
function hvBrokenTiles(ctx, c, r, pal, seed) {
  const rr = rng(seed); const qc = project(c); if (!qc || qc.z < 1) return;
  const hole = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, d = r * (.7 + rr() * .4); hole.push([c[0] + Math.cos(a) * d, .004, c[2] + Math.sin(a) * d]); } hvP(ctx, hole, rgba('#1a0e0a', .85));
  for (let i = 0; i < 5; i++) { const a = rr() * TAU, d = r * rr() * .8, cc = [c[0] + Math.cos(a) * d, .06 + rr() * .25, c[2] + Math.sin(a) * d], s = .3 + rr() * .5, tilt = (rr() - .5) * .6;
    const pts = [[-s, 0, -s * .7], [s, tilt * s, -s * .6], [s * .8, tilt * s, s * .7], [-s * .9, 0, s * .6]].map(p => vAdd(cc, p)); hvP(ctx, pts, hvFog(mixHex(pal.ground, pal.wall, .4), cc, pal), sadInkW(cc, .9)); }
}

// ============================================================================================================== VALHALLA GATES
SETS.valgate = { pal: 'valgate', draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return; const open = o.open || 0;
  drawSky(ctx, pal, t, Object.assign({ clouds: 14, cloudSeed: 41 }, o)); if (typeof drawCloudSea === 'function') drawCloudSea(ctx, pal, t, -14, { seed: 4 });
  // causeway + stairs
  hvP(ctx, [[-6, 0, 30], [6, 0, 30], [6, 0, -40], [-6, 0, -40]], hvFog(pal.ground, [0, 0, -5], pal)); hvP(ctx, [[-6, 0, 30], [6, 0, 30], [6, -12, 30], [-6, -12, 30]], hvFog(pal.wallShade, [0, 0, 30], pal));
  for (let i = 0; i < 12; i++) { const z = -40 - i * 1.2, y = i * .5; hvP(ctx, [[-9, y, z], [9, y, z], [9, y + .5, z], [-9, y + .5, z]], hvFog(mixHex(pal.wall, pal.wallShade, .3), [0, y, z], pal), .6); hvP(ctx, [[-9, y + .5, z], [9, y + .5, z], [9, y + .5, z - 1.2], [-9, y + .5, z - 1.2]], hvFog(pal.wall, [0, y, z], pal)); }
  const zg = -55, yg = 6, Wg = 22, Hg = 46;
  // gate frame (pylons + lintel with runes) and the two doors (o.open swings them in)
  for (const sx of [-1, 1]) { hvP(ctx, [[sx * Wg / 2, yg, zg + 1], [sx * (Wg / 2 + 7), yg, zg + 1], [sx * (Wg / 2 + 6), yg + Hg + 6, zg + 1], [sx * Wg / 2, yg + Hg + 6, zg + 1]], hvFog(mixHex(pal.wall, pal.wallShade, .2), [sx * 14, 30, zg], pal), 1.2); }
  hvP(ctx, [[-Wg / 2 - 8, yg + Hg, zg + 1.2], [Wg / 2 + 8, yg + Hg, zg + 1.2], [Wg / 2 + 5, yg + Hg + 9, zg + 1.2], [-Wg / 2 - 5, yg + Hg + 9, zg + 1.2]], hvFog(pal.wall, [0, yg + Hg, zg], pal), 1.2);
  const ql = project([0, yg + Hg + 4.5, zg + 1.3]); if (ql) { ctx.save(); ctx.font = `700 ${Math.max(8, 2.2 * ql.s)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = hvFog('#c8962a', [0, yg + Hg, zg], pal); ctx.fillText('ᚹᚨᛚᚺᚨᛚᛚᚨ', ql.x, ql.y); ctx.restore(); }
  const inner = project([0, yg + Hg * .5, zg - 20]); if (open > .01 && inner) { const a = project([-Wg / 2, yg, zg]), b = project([Wg / 2, yg + Hg, zg]); if (a && b) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const gr = ctx.createRadialGradient(inner.x, inner.y, 0, inner.x, inner.y, Math.abs(b.x - a.x)); gr.addColorStop(0, rgba('#ffffff', .95 * open)); gr.addColorStop(1, rgba('#ffd890', .25 * open)); ctx.fillStyle = gr; ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); ctx.restore(); } }
  for (const sx of [-1, 1]) { const ang = open * 1.2 * sx, hinge = [sx * Wg / 2, yg, zg], dir = [-sx * Math.cos(ang), 0, -Math.sin(Math.abs(ang))], far = vAdd(hinge, vMul(dir, Wg / 2));
    const pts = [hinge, far, vAdd(far, [0, Hg, 0]), vAdd(hinge, [0, Hg, 0])], n = vNorm(vCross(vSub(pts[1], pts[0]), vSub(pts[3], pts[0])));
    const sp = hvP(ctx, pts, hvFog(hvLitCol('#6a4a30', vMul(n, sx), pal), hinge, pal), 1.4);
    for (let k = 1; k < 6; k++) { const a = project(vLerp(pts[0], pts[3], k / 6)), b = project(vLerp(pts[1], pts[2], k / 6)); if (a && b) { ctx.strokeStyle = hvFog('#c8962a', hinge, pal); ctx.lineWidth = Math.max(1, .25 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    const m = project(vLerp(vLerp(pts[0], pts[1], .5), vLerp(pts[3], pts[2], .5), .55)); if (m) { ctx.strokeStyle = hvFog('#e0b040', hinge, pal); ctx.lineWidth = Math.max(1, .3 * m.s); ctx.beginPath(); ctx.arc(m.x, m.y, 3 * m.s, 0, TAU); ctx.stroke(); } }
  for (const sx of [-1, 1]) { const p = [sx * 8, .5 * 11 + 6, -47], q = project(p); if (q && q.z > 1) { const s = 1.4 * q.s; ctx.fillStyle = hvFog('#3a2a20', p, pal); ctx.fillRect(q.x - s * .5, q.y - s * 1.2, s, s * 1.2); hvFlame(ctx, q.x, q.y - s * 1.2, s * 1.2, t, sx * 7, pal.torch); } }
} };

// ============================================================================================================== UNLIMITED VOID
SETS.voidspace = { pal: 'void_inf', draw(ctx, t, o) {
  if (o.layer === 'fg') return; const k = o.k == null ? 1 : o.k, sc = ctx.getTransform().a || 1, sf = hvgStarField(Math.round(W * sc), Math.round(H * sc), o.seed || 3), cam = CAM.cur;
  // star space with a small parallax drift from the camera yaw
  const yaw = Math.atan2(cam.F[0], cam.F[2]), pitch = cam.F[1], dx = ((yaw / TAU) * W * 2) % W, dy = pitch * H * .6;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; for (const ox of [-1, 0, 1]) ctx.drawImage(sf, (-dx + ox * W) * sc, dy * sc); ctx.restore();
  const qc = project(vAdd(cam.pos, vMul(vNorm([cam.F[0], 0, cam.F[2]]), 1000))); hvgVoidLattice(ctx, t, { x: qc ? qc.x : W / 2, y: qc ? qc.y : H * .5, a: .8 * k });
  if (o.floor !== false) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.2; for (let i = -20; i <= 20; i++) { for (const [a, b] of [[[i * 3, 0, -90], [i * 3, 0, 40]], [[-90, 0, i * 3], [90, 0, i * 3]]]) { for (const rn of projLine([a, vLerp(a, b, .25), vLerp(a, b, .5), vLerp(a, b, .75), b])) { ctx.strokeStyle = rgba('#5aa8ff', .12 * k); polyPath(ctx, rn, false); ctx.stroke(); } } }
    const q0 = project([0, 0, 0]); if (q0) { const gr = ctx.createRadialGradient(q0.x, q0.y, 0, q0.x, q0.y, 10 * q0.s); gr.addColorStop(0, rgba('#9fd8ff', .2 * k)); gr.addColorStop(1, rgba('#9fd8ff', 0)); ctx.fillStyle = gr; ctx.save(); ctx.translate(q0.x, q0.y); ctx.scale(1, .3); ctx.translate(-q0.x, -q0.y); ctx.fillRect(q0.x - 10 * q0.s, q0.y - 10 * q0.s, 20 * q0.s, 20 * q0.s); ctx.restore(); } ctx.restore(); }
} };

// ============================================================================================================== HOGWARTS (memory)
function hvTower(ctx, c, r, h, roofH, pal, wallCol, roofCol, t, win = true) {
  const n = 10, L = vNorm(pal.sun); for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU, am = (a + b) / 2, nn = [Math.sin(am), 0, Math.cos(am)], pm = [c[0] + nn[0] * r, c[1] + h / 2, c[2] + nn[2] * r]; if (vDot(nn, toCam(pm)) <= 0) continue;
    const lit = vDot(nn, L), col = hvFog(mixHex(wallCol, pal.wallShade, clamp(.45 - lit * .6, 0, .8)), pm, pal, 1.2); hvP(ctx, [[c[0] + Math.sin(a) * r, c[1], c[2] + Math.cos(a) * r], [c[0] + Math.sin(b) * r, c[1], c[2] + Math.cos(b) * r], [c[0] + Math.sin(b) * r, c[1] + h, c[2] + Math.cos(b) * r], [c[0] + Math.sin(a) * r, c[1] + h, c[2] + Math.cos(a) * r]], col);
    if (win && i % 2 === 0) for (let k = 1; k < Math.min(6, h / 6); k++) { if (hash(c[0] * 3 + i * 7 + k) < .35) continue; const q = project([c[0] + Math.sin(am) * r * 1.01, c[1] + k * 6, c[2] + Math.cos(am) * r * 1.01]); if (!q || q.z < 1) continue; const s = Math.max(1.2, .9 * q.s), flick = .8 + .2 * Math.sin(t * 3 + k + i); ctx.fillStyle = rgba('#ffd27a', .9 * flick); ctx.fillRect(q.x - s * .4, q.y - s, s * .8, s * 1.6); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, s * 4, '#ffb050', .25); ctx.restore(); } }
  const tip = [c[0], c[1] + h + roofH, c[2]]; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU, am = (a + b) / 2, nn = vNorm([Math.sin(am), r / roofH, Math.cos(am)]), pm = [c[0] + Math.sin(am) * r * .5, c[1] + h + roofH * .5, c[2] + Math.cos(am) * r * .5]; if (vDot(nn, toCam(pm)) <= 0) continue;
    hvP(ctx, [[c[0] + Math.sin(a) * r * 1.15, c[1] + h, c[2] + Math.cos(a) * r * 1.15], [c[0] + Math.sin(b) * r * 1.15, c[1] + h, c[2] + Math.cos(b) * r * 1.15], tip], hvFog(mixHex(roofCol, pal.roofShade, clamp(.5 - vDot(nn, L) * .6, 0, .9)), pm, pal, 1.2)); }
}
SETS.hogwarts = { pal: 'hog_dusk', draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 12, cloudSeed: 23, moon: !!pal.stars }, o)); drawMountains(ctx, pal, 17, 1500, 200, mixHex(pal.fog, '#3a4060', .3));
  // the Black Lake: flat water to the castle cliff, sky reflection + shimmer
  if (typeof sadWater === 'function') sadWater(ctx, pal, -1.5, pal.water || '#3a4a7a', mixHex(pal.water || '#3a4a7a', pal.skyLow, .4), { t });
  // castle on a cliff across the water
  const cz = -115; { const cl = [[-90, -1.5, cz + 14]]; for (let i = 0; i <= 18; i++) { const u = i / 18, x = lerp(-80, 90, u); cl.push([x, 18 + 6 * Math.sin(u * 7) + 5 * hash(i * 3) - (u < .1 || u > .9 ? 14 : 0), cz + 6 - 8 * Math.sin(u * Math.PI)]); } cl.push([100, -1.5, cz + 14]); hvP(ctx, cl, hvFog(mixHex(pal.wallShade, '#2a2a34', .3), [0, 10, cz], pal, 1.0));
    for (let i = 0; i < 14; i++) { const x = -70 + i * 11 + hash(i) * 5, a = [x, 20, cz], b = [x + 3 + hash(i * 2) * 4, -1, cz + 12]; const qa = project(a), qb = project(b); if (qa && qb) { ctx.strokeStyle = hvFog(mixHex(pal.wallShade, pal.fog, .3), a, pal); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(qa.x, qa.y); ctx.lineTo(qb.x, qb.y); ctx.stroke(); } } }
  for (const [x, z, w, d, h] of [[-25, cz - 15, 30, 14, 22], [12, cz - 18, 36, 16, 26], [40, cz - 12, 20, 14, 16]]) { const yb = 14; sadBox3(ctx, [x, yb, z], w, d, h, hvFog(pal.wall, [x, 30, z], pal, 1.2), pal); hvP(ctx, [[x - w / 2, yb + h, z + d / 2], [x + w / 2, yb + h, z + d / 2], [x + w / 2, yb + h + 8, z], [x - w / 2, yb + h + 8, z]], hvFog(pal.roof, [x, 30, z], pal, 1.2)); }
  for (const [x, z, r, h, rh] of [[-42, cz - 8, 4.6, 46, 15], [-10, cz - 2, 3.8, 34, 12], [28, cz - 6, 5.6, 64, 20], [52, cz - 2, 4, 38, 13], [-28, cz - 26, 3.4, 52, 13], [4, cz - 30, 4.8, 74, 22], [64, cz - 14, 3, 30, 10]]) hvTower(ctx, [x, 14, z], r, h, rh, pal, pal.wall, pal.roof, t);
  // near shore: grass slope, rocks, a few pines, path stones
  hvP(ctx, [[-200, -1.4, -24], [200, -1.4, -24], [200, 0, 40], [-200, 0, 40]], pal.ground);
  const gp = projPoly([[-200, 0, -18], [200, 0, -18], [200, 0, 60], [-200, 0, 60]]); if (gp.length > 2) { const path = hvPath2D(gp); texOverlay(ctx, path, .3); }
  if (typeof drawGrass === 'function') drawGrass(ctx, pal, [0, 0, 0], 18, 700, mixHex(pal.ground, '#6a8a4a', .4), t, 11);
  for (const [x, z, h] of [[-16, -14, 11], [-22, -6, 14], [19, -12, 12], [26, -4, 9]]) if (typeof drawCedar === 'function') drawCedar(ctx, [x, 0, z], h, pal, Math.round(x * 3), mixHex('#1e3424', pal.fog, .2));
  for (let i = 0; i < 8; i++) drawRock(ctx, [(hash(i * 3) - .5) * 30, 0, -6 - hash(i * 7) * 14], .4 + hash(i) * 1.1, pal, 50 + i, mixHex(pal.wall, pal.wallShade, .4));
  if (o.snow && typeof fxSnow === 'function') fxSnow(ctx, t, { n: 160 });
} };

// ============================================================================================================== FORBIDDEN FOREST
function hvGnarledTree(ctx, c, h, r, pal, seed, t) {
  const rr = rng(seed), p0 = project(c); if (!p0 || p0.z < 1) return; const z = camDepth(c), col = fogMix('#1e1a16', z, pal, 1.3), lit = fogMix('#3a3a40', z, pal, 1.3);
  const pts = []; let p = c.slice(); for (let i = 0; i <= 8; i++) { pts.push(p.slice()); p = [p[0] + (rr() - .5) * .8, p[1] + h / 8, p[2] + (rr() - .5) * .8]; }
  const L = [], Rr = []; pts.forEach((q, i) => { const s = project(q); if (!s) return; const w = r * (1 - i / 10) * s.s * (i === 0 ? 1.8 : 1); L.push([s.x - w, s.y]); Rr.push([s.x + w, s.y]); });
  if (L.length < 3) return; polyPath(ctx, L.concat(Rr.reverse())); ctx.fillStyle = col; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = rgba(lit, .6); ctx.fillRect(L[0][0] - 9999, 0, 9999 + (L[0][0] + Rr[Rr.length - 1][0]) / 2 - L[0][0] * 0, H); ctx.restore();
  ctx.strokeStyle = col; ctx.lineCap = 'round'; for (let k = 0; k < 6; k++) { const i = 3 + Math.floor(rr() * 5), a = pts[i], dir = [(rr() - .5) * 2, .4 + rr() * .6, (rr() - .5) * 2], b = vAdd(a, vMul(dir, h * .3)), m = vAdd(vLerp(a, b, .5), [0, -h * .04, 0]), qa = project(a), qb = project(b), qm = project(m); if (!qa || !qb || !qm) continue; ctx.lineWidth = Math.max(1, r * .45 * qa.s); ctx.beginPath(); ctx.moveTo(qa.x, qa.y); ctx.quadraticCurveTo(qm.x, qm.y, qb.x, qb.y); ctx.stroke(); }
  for (let k = 0; k < 4; k++) { const an = k / 4 * TAU + rr(), a = project(c), b = project([c[0] + Math.cos(an) * r * 5, 0, c[2] + Math.sin(an) * r * 5]); if (a && b) { ctx.lineWidth = Math.max(1, r * .5 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y - r * a.s); ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - r * a.s * .8, b.x, b.y); ctx.stroke(); } }
}
SETS.darkforest = { pal: 'forest_night', draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return; MOON.az = -2.2; MOON.el = .7;
  drawSky(ctx, pal, t, Object.assign({ clouds: 4, moon: true }, o)); drawGround(ctx, pal, { col: pal.ground, col2: pal.ground2 });
  const trees = []; const r = rng(17); for (let i = 0; i < 70; i++) { const x = (r() - .5) * 90, z = 8 - r() * 100; if (Math.abs(x) < 4 && z > -12) continue; trees.push([x, z, 14 + r() * 14, .35 + r() * .5, i]); }
  trees.sort((a, b) => camDepth([b[0], 0, b[1]]) - camDepth([a[0], 0, a[1]]));
  let fogDone = false; for (const [x, z, h, rr, i] of trees) { if (!fogDone && camDepth([x, 0, z]) < 30) { fogDone = true; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rgba(pal.fog, .25); ctx.fillRect(0, H * .35, W, H * .65); ctx.restore(); } hvGnarledTree(ctx, [x, 0, z], h, rr, pal, 17 + i, t); }
  // moon shafts through the mist
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let k = 0; k < 4; k++) { const q = project([-8 + k * 6, 0, -14 - k * 4]), qt = project([-20 + k * 6, 30, -30 - k * 4]); if (!q || !qt) continue; const gr = ctx.createLinearGradient(qt.x, qt.y, q.x, q.y); gr.addColorStop(0, 'rgba(180,210,255,0)'); gr.addColorStop(1, 'rgba(180,210,255,.14)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(qt.x - 20, qt.y); ctx.lineTo(qt.x + 20, qt.y); ctx.lineTo(q.x + 120, q.y); ctx.lineTo(q.x - 120, q.y); ctx.closePath(); ctx.fill(); } ctx.restore();
  for (let i = 0; i < 40; i++) { const p = [(hash(i * 3) - .5) * 16, 0, -2 - hash(i * 5) * 14], q = project(p); if (!q || q.z < 1) continue; const s = .5 * q.s; ctx.strokeStyle = fogMix('#1e3020', q.z, pal); ctx.lineWidth = Math.max(1, s * .06); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(q.x + Math.cos(a) * s * .5, q.y + Math.sin(a) * s * .8, q.x + Math.cos(a) * s, q.y + Math.sin(a) * s * .6); ctx.stroke(); } }
  if (o.eyes) for (let i = 0; i < 5; i++) { const q = project([(hash(i * 9) - .5) * 40, 1 + hash(i) * 2, -30 - hash(i * 3) * 30]); if (!q) continue; const bl = Math.sin(t * 2 + i * 3) > -.85; if (!bl) continue; ctx.fillStyle = '#e8ff8a'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(q.x + sx * .12 * q.s, q.y, Math.max(1.2, .05 * q.s), 0, TAU); ctx.fill(); } }
} };

// ============================================================================================================== HEAVENS (above the clouds)
SETS.heavens = { pal: 'heavens', draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 18, cloudSeed: 9, cloudHigh: .6 }, o)); if (typeof drawCloudSea === 'function') drawCloudSea(ctx, pal, t, -18, { seed: 8 });
  // sun glare + rings of light
  const qs = project(vAdd(CAM.cur.pos, vMul(vNorm([-.3, .22, -.9]), 3000))); if (qs) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, qs.x, qs.y, 600, '#fff2c8', .55); glow(ctx, qs.x, qs.y, 120, '#ffffff', .9); ctx.strokeStyle = rgba('#fff4d0', .3); ctx.lineWidth = 3; for (const R of [180, 260, 380]) { ctx.beginPath(); ctx.arc(qs.x, qs.y, R, 0, TAU); ctx.stroke(); } ctx.restore(); }
  // floating broken pillars
  for (let i = 0; i < 9; i++) { const a = hash(i * 3) * TAU, d = 30 + hash(i * 7) * 60, c = [Math.cos(a) * d, -6 + hash(i) * 14 + Math.sin(t * .5 + i) * .4, Math.sin(a) * d - 20], h = 6 + hash(i * 5) * 10; hvTower(ctx, c, 1.1 + hash(i * 9) * .6, h, .01, pal, pal.wall, pal.wall, t, false); }
  // the floating stone disc the fighters stand on
  const top = [], bot = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; top.push([Math.cos(a) * 9, 0, Math.sin(a) * 9]); bot.push([Math.cos(a) * 7, -2.5, Math.sin(a) * 7]); }
  for (let i = 0; i < 48; i++) { const n = [Math.cos((i + .5) / 48 * TAU), -.3, Math.sin((i + .5) / 48 * TAU)]; if (vDot(n, toCam(top[i])) <= 0) continue; hvP(ctx, [top[i], top[i + 1], bot[i + 1], bot[i]], hvFog(hvLitCol(pal.wall, n, pal), top[i], pal)); }
  hvP(ctx, top, hvFog(pal.ground, [0, 0, 0], pal), 1); ctx.strokeStyle = rgba('#c8962a', .6); ctx.lineWidth = 2; const ring = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; ring.push([Math.cos(a) * 7.5, .003, Math.sin(a) * 7.5]); } for (const rn of projLine(ring)) { polyPath(ctx, rn, false); ctx.stroke(); }
} };

// ============================================================================================================== JUJUTSU HIGH ROOFTOP (Gojo's memory, summer)
Object.assign(PALETTES, { jj_summer: { skyTop: '#3a7ad8', skyMid: '#8cc4f0', skyLow: '#e8f6ff', fog: '#cfe4f4', sun: [-.4, .85, .3], ground: '#9a9aa2', ground2: '#6a6a74', wall: '#d8d4cc', wallShade: '#7a7a8a', roof: '#3a3a44', roofShade: '#22222a', wood: '#6a4a30', cloud: '#ffffff', cloudShade: '#b8cce8', haze: .45, line: '#22222a', amb: '#e8f4ff' } });
Object.assign(GRADES, { jj_summer: { sat: .75, contrast: 1.1, tint: ['#c8dcf4', .2] } });
HVG.GATE_W = [-HVG_AR.R, 0, 0]; HVG.GATE_E = [HVG_AR.R, 0, 0]; HVG.GATE_TOP = 12.6;   // gate centres (Gojo can sit on the east gate top: y = HVG.GATE_TOP)
SETS.jjhigh = { pal: 'jj_summer', draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 22, cloudSeed: 5, cloudHigh: 1.4 }, o)); drawMountains(ctx, pal, 8, 1500, 260, mixHex(pal.fog, '#5a7a6a', .35));
  hvP(ctx, [[-2000, -12, -2000], [2000, -12, -2000], [2000, -12, 400], [-2000, -12, 400]], mixHex('#4a6a4a', pal.fog, .35));
  // wooded hills + traditional school buildings below the roof edge
  for (let i = 0; i < 40; i++) { const x = (hash(i * 3) - .5) * 400, z = -60 - hash(i * 7) * 200; if (typeof drawCedar === 'function') drawCedar(ctx, [x, -12, z], 14 + hash(i) * 10, pal, 70 + i, mixHex('#3a6a44', pal.fog, .3)); }
  for (const [x, z, w, d, h] of [[-40, -70, 30, 12, 8], [30, -90, 40, 14, 10], [0, -130, 24, 12, 7]]) { sadBox3(ctx, [x, -12, z], w, d, h, hvFog(pal.wall, [x, -6, z], pal), pal); hvP(ctx, [[x - w / 2 - 1, -12 + h, z + d / 2 + 1], [x + w / 2 + 1, -12 + h, z + d / 2 + 1], [x + w / 2 - 2, -12 + h + 4, z], [x - w / 2 + 2, -12 + h + 4, z]], hvFog(pal.roof, [x, -6, z], pal)); }
  // concrete roof slab, water tank, fence
  hvP(ctx, [[-14, 0, 10], [14, 0, 10], [14, 0, -14], [-14, 0, -14]], pal.ground); const gp = projPoly([[-14, 0, 10], [14, 0, 10], [14, 0, -14], [-14, 0, -14]]); if (gp.length > 2) texOverlay(ctx, hvPath2D(gp), .3);
  ctx.strokeStyle = rgba(pal.line, .25); ctx.lineWidth = 1; for (let i = -14; i <= 14; i += 2) for (const rn of projLine([[i, .002, 10], [i, .002, -14]])) { polyPath(ctx, rn, false); ctx.stroke(); }
  sadBox3(ctx, [8, 0, -10], 3, 3, 2.2, hvFog('#b8b8c0', [8, 1, -10], pal), pal); hvP(ctx, [[6.6, 2.2, -11.4], [9.4, 2.2, -11.4], [9.4, 4.2, -11.4], [6.6, 4.2, -11.4]], hvFog('#d8d8e0', [8, 3, -10], pal), 1);
  for (let i = 0; i <= 28; i++) { const x = -14 + i; const a = project([x, 0, -14]), b = project([x, 1.6, -14]); if (a && b) { ctx.strokeStyle = hvFog('#5a6a7a', [x, 1, -14], pal); ctx.lineWidth = Math.max(1, .05 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
  for (const y of [.8, 1.6]) for (const rn of projLine([[-14, y, -14], [14, y, -14]])) { polyPath(ctx, rn, false); ctx.lineWidth = 2; ctx.stroke(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const qs = project(vAdd(CAM.cur.pos, vMul(vNorm([-.4, .5, -.8]), 3000))); if (qs) glow(ctx, qs.x, qs.y, 500, '#fffbe8', .5); ctx.restore();
} };
// ============================================================================================================== CARD (graphic power-card background)
SETS.cardbg = { pal: 'valhalla', draw(ctx, t, o) {
  if (o.layer === 'fg') return; const gojo = o.who === 'gojo', c0 = gojo ? '#050b1e' : '#3a0b10', c1 = gojo ? '#0a1a40' : '#120406', acc = gojo ? '#5fd3ff' : '#d8a830';
  const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, c1); gr.addColorStop(1, c0); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = rgba(acc, .12); ctx.lineWidth = 3; for (let i = -10; i < 30; i++) { const x = i * 90 + (t * 120) % 90; ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + 500, 0); ctx.stroke(); }
  glow(ctx, W * .72, H * .45, 700, acc, .25); for (let i = 0; i < 60; i++) { const ph = (t * (.3 + hash(i) * .4) + hash(i * 3)) % 1; ctx.fillStyle = rgba(acc, .7 * Math.sin(ph * Math.PI)); ctx.fillRect(hash(i * 7) * W, H * (1 - ph), 4, 4); } ctx.restore();
} };
// SKY option: the colosseum far below through a gap in the cloud sea (o.arena:true)
(function () { const base = SETS.heavens.draw; SETS.heavens.draw = function (ctx, t, o) { if (!o.arena) return base.call(this, ctx, t, o); const pal = o.pal; if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 18, cloudSeed: 9, cloudHigh: .6 }, o));
  const c = o.arenaAt || [0, -90, -70], R = 52; for (let k = 6; k >= 0; k--) { const ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = R + k * 6; ring.push([c[0] + Math.cos(a) * rr, c[1] + k * 4, c[2] + Math.sin(a) * rr]); } hvP(ctx, ring, hvFog(mixHex(pal.wall, pal.wallShade, .3 + k * .05), c, pal, .6)); }
  const fl = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; fl.push([c[0] + Math.cos(a) * R * .8, c[1] + 1, c[2] + Math.sin(a) * R * .8]); } hvP(ctx, fl, hvFog('#d8b880', c, pal, .6));
  for (let k = 0; k < 7; k++) { const rr = R + k * 6, pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; pts.push([c[0] + Math.cos(a) * rr, c[1] + k * 4 + .2, c[2] + Math.sin(a) * rr]); } ctx.strokeStyle = rgba(pal.line, .45); ctx.lineWidth = 2; for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); }
    const r = rng(k + 3); ctx.fillStyle = rgba('#1a1018', .55); for (let i = 0; i < 160; i++) { const a = r() * TAU, qq = project([c[0] + Math.cos(a) * (rr + 3), c[1] + k * 4 + .5, c[2] + Math.sin(a) * (rr + 3)]); if (qq) ctx.fillRect(qq.x, qq.y - 2, 2.5, 3); } }
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, qq = project([c[0] + Math.cos(a) * R, c[1] + 4, c[2] + Math.sin(a) * R]); if (qq) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, qq.x, qq.y, 14, '#ffa040', .8); ctx.restore(); } }
  const q = project(c); if (q) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, 80 * q.s, '#ffb050', .4); ctx.restore(); }
  for (let i = 0; i < 14; i++) { const a = hash(i * 3) * TAU, d = R * (.6 + hash(i * 5) * 1.6), qq = project([c[0] + Math.cos(a) * d, c[1] + 30 + hash(i) * 20, c[2] + Math.sin(a) * d]); if (qq) paintCloud(ctx, qq.x, qq.y, 34 * qq.s, 10 * qq.s, pal, 900 + i, 0); }
  if (typeof drawCloudSea === 'function') drawCloudSea(ctx, pal, t, -55, { seed: 8 });
  if (o.lightning) { const fr = Math.floor(t * 24); if (hash(fr * 3) < .12) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 4; let x = hash(fr) * W, y = H * .55; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 8; i++) { x += (hash(fr + i) - .5) * 120; y += 40; ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); } }
}; })();
