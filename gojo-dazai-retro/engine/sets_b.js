/* death-battle engine - sets_b.js (agent E2) : painted 3D sets for the Fire Force / Black Clover side.
   f.bg({ set, pal, dmg, burn, seed, layer/zSplit })  - all sets support dmg 0..3 (craters / rubble / smoke) and the painted pass.
   asakusa       Asakusa old town street: wooden machiya, tiled roofs, paper lanterns, fire watchtower (hinomi-yagura),
                 Company 7 station; o.burn 0..1 = roofs on fire, embers, smoke.   palettes: ember (default), asakusa_night
   volcano       Ultime-Volcano lava field (Mereoleona's training ground): black basalt, glowing lava cracks + rivers,
                 erupting cone, ash plume, embers.                                 palette: magma
   joker_table   Joker's card table in the void: giant green felt with wooden rim, giant playing cards, poker-chip
                 towers, one hanging lamp (light cone), smoke.                     palette: table
   adolla        Adolla space: black sky, giant burning concentric eyes, black-glass ground with cracks + flame horizon.  palette: adolla
   clover_castle Clover Kingdom castle on green hills: round towers with blue cone roofs, crenellated walls, silver
                 spire; o.dmg -> ruins (broken towers, rubble).                    palettes: clover (default), clover_dusk
   Helpers (global): e2Tower(ctx, c, r, h, pal, o), e2Lantern(ctx, p, r, col, t), e2LavaPool(ctx, c, r, seed, t), e2Watchtower(ctx, c, h, pal) */
'use strict';
Object.assign(PALETTES, {
  ember: { skyTop: '#2a1420', skyMid: '#a8402a', skyLow: '#ffb060', fog: '#d8784a', sun: [.6, .25, -.6], ground: '#7a5a48', ground2: '#5a4036', wall: '#7a5640', wallShade: '#3a2830', roof: '#2e2a34', roofShade: '#1a161e', wood: '#3a241c', cloud: '#e08a5a', cloudShade: '#6a3040', haze: .7, line: '#2a1414', amb: '#ffd0b0' },
  asakusa_night: { skyTop: '#0a0c22', skyMid: '#22264a', skyLow: '#5a4a6a', fog: '#3a3450', sun: [.3, .6, .5], ground: '#3a3440', ground2: '#2a2632', wall: '#5a4a46', wallShade: '#2a2230', roof: '#1a1a24', roofShade: '#0e0e16', wood: '#2a1c18', cloud: '#4a4a6a', cloudShade: '#1e1e34', haze: .5, line: '#100c14', amb: '#d8c8f0', stars: true },
  magma: { skyTop: '#140608', skyMid: '#5a1410', skyLow: '#e0502a', fog: '#8a2a1e', sun: [.2, .4, .8], ground: '#2c2226', ground2: '#1a1418', wall: '#3a3034', wallShade: '#16101a', roof: '#1a1418', roofShade: '#0a0608', wood: '#2a1a14', cloud: '#7a2a20', cloudShade: '#2a0c0c', haze: .55, line: '#0a0406', amb: '#ffc8a8' },
  table: { skyTop: '#050506', skyMid: '#0c0b10', skyLow: '#16131c', fog: '#0c0b10', sun: [0, 1, .15], ground: '#1e6a3e', ground2: '#0e3a22', wall: '#6a3a22', wallShade: '#2a160e', roof: '#1a1a1a', roofShade: '#0a0a0a', wood: '#5a3018', cloud: '#2a2830', cloudShade: '#121016', haze: .25, line: '#05050a', amb: '#ffe0a8' },
  adolla: { skyTop: '#000000', skyMid: '#0a0408', skyLow: '#3a0c14', fog: '#1a0610', sun: [0, .8, .6], ground: '#0c0a10', ground2: '#050408', wall: '#1a141c', wallShade: '#0a080c', roof: '#0a080c', roofShade: '#050405', wood: '#140c10', cloud: '#2a0c18', cloudShade: '#0a0408', haze: .3, line: '#000000', amb: '#ff8a4a' },
  clover: { skyTop: '#3f7ad0', skyMid: '#8cc0ee', skyLow: '#e4f2f4', fog: '#cfe2ea', sun: [-.5, .75, .45], ground: '#7aa858', ground2: '#5a8a42', wall: '#e8e2d4', wallShade: '#a8a8c0', roof: '#2e4a8a', roofShade: '#1c2e5a', wood: '#6a4a3a', cloud: '#ffffff', cloudShade: '#b0bad8', haze: .55, line: '#4a5466' },
  clover_dusk: { skyTop: '#2a2a62', skyMid: '#b8607a', skyLow: '#f8b878', fog: '#e09a7a', sun: [.7, .22, -.5], ground: '#6a7a48', ground2: '#4a5a36', wall: '#f0c8a8', wallShade: '#7a6a8a', roof: '#2a3466', roofShade: '#1a1e40', wood: '#4a2e2e', cloud: '#ffd2a8', cloudShade: '#8a5a8a', haze: .6, line: '#3a2a40', amb: '#ffc8a0' },
});
Object.assign(GRADES, { ember: { sat: 1.1, contrast: 1.04, bright: 1.08, tint: ['#ffc8a8', .14], lift: ['#3a1a20', .08] }, asakusa_night: { sat: 1, contrast: 1.05, bright: 1.12, tint: ['#b0b4e8', .14], lift: ['#202040', .08] }, magma: { sat: 1.1, contrast: 1.05, bright: 1.1, tint: ['#ffb090', .14], lift: ['#3a1410', .08] }, table: { sat: 1.05, contrast: 1.2 }, adolla: { sat: 1.1, contrast: 1.2, tint: ['#ff9aa0', .1] }, clover: { sat: 1.1, contrast: 1.05, soft: ['#fff0d0', .1] }, clover_dusk: { sat: 1.12, contrast: 1.08, tint: ['#ffd2b0', .22] } });

// --------------------------------------------------------------------------------------------- shared prop helpers
function e2Faces(ctx, faces, pal, base, shade, z0) { // faces: arrays of 3D points; back-face culled, sun-shaded, fogged, painted
  const cam = CAM.cur; const vis = [];
  for (const f of faces) { const n = vNorm(vCross(vSub(f[1], f[0]), vSub(f[f.length - 1], f[0]))), m = f.reduce((a, p) => vAdd(a, vMul(p, 1 / f.length)), [0, 0, 0]); if (vDot(n, vSub(cam.pos, m)) <= 0) continue; vis.push({ f, n, m, z: camDepth(m) }); }
  vis.sort((a, b) => b.z - a.z);
  for (const v of vis) { const sp = projPoly(v.f); if (sp.length < 3) continue; const col = fogMix(faceCol(base, shade, v.n, pal), v.z, pal); polyPath(ctx, sp); ctx.fillStyle = col; ctx.fill(); if (BGSTYLE.painted) paintPatches(ctx, sp, col, Math.round(v.m[0] * 7 + v.m[2] * 3), v.z, pal); ctx.lineWidth = clamp(160 / Math.max(1, v.z), .5, 2); ctx.strokeStyle = rgba(shadeHex(base, -.5), .35); ctx.stroke(); }
}
// round tower: n-gon cylinder + cone roof; o {wall, roof, roofH, n, broken (0..1 height cut), windows}
function e2Tower(ctx, c, r, h, pal, o = {}) {
  const n = o.n || 14, hh = h * (1 - (o.broken || 0)), ring = (y, rr) => { const a = []; for (let i = 0; i < n; i++) { const an = i / n * TAU; a.push([c[0] + Math.cos(an) * rr, y, c[2] + Math.sin(an) * rr]); } return a; };
  const b = ring(c[1] || 0, r), tp = ring((c[1] || 0) + hh, r * .96), faces = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; const top0 = o.broken ? [tp[i][0], tp[i][1] - hash(i + c[0]) * h * .15, tp[i][2]] : tp[i], top1 = o.broken ? [tp[j][0], tp[j][1] - hash(j + c[0]) * h * .15, tp[j][2]] : tp[j]; faces.push([b[j], b[i], top0, top1]); }
  e2Faces(ctx, faces, pal, o.wall || pal.wall, pal.wallShade);
  const z = camDepth([c[0], hh * .5, c[2]]);
  if (o.windows !== false && z < 220) { ctx.fillStyle = fogMix('#2a2a3a', z, pal); for (let k = 1; k < 4; k++) for (let i = 0; i < n; i += 3) { const an = (i + .5) / n * TAU, y = hh * k / 4.2; const p0 = [c[0] + Math.cos(an) * r * 1.01, y, c[2] + Math.sin(an) * r * 1.01]; if (vDot([Math.cos(an), 0, Math.sin(an)], vSub(CAM.cur.pos, p0)) <= 0) continue; const sp = projPoly([vAdd(p0, [-Math.sin(an) * r * .12, 0, Math.cos(an) * r * .12]), vAdd(p0, [Math.sin(an) * r * .12, 0, -Math.cos(an) * r * .12]), vAdd(p0, [Math.sin(an) * r * .12, h * .06, -Math.cos(an) * r * .12]), vAdd(p0, [-Math.sin(an) * r * .12, h * .06, Math.cos(an) * r * .12])]); if (sp.length > 2) { polyPath(ctx, sp); ctx.fill(); } } }
  if (o.broken) return;
  if (o.crenel) { const cf = []; for (let i = 0; i < n; i += 2) { const j = (i + 1) % n, y = (c[1] || 0) + hh; const p = ring(y, r * 1.06); cf.push([p[j], p[i], vAdd(p[i], [0, h * .06, 0]), vAdd(p[j], [0, h * .06, 0])]); } e2Faces(ctx, cf, pal, o.wall || pal.wall, pal.wallShade); }
  const apex = [c[0], (c[1] || 0) + hh + (o.roofH == null ? r * 2.4 : o.roofH), c[2]], er = ring((c[1] || 0) + hh, r * 1.15), rf = [];
  for (let i = 0; i < n; i++) rf.push([er[(i + 1) % n], er[i], apex]);
  if (o.roofH !== 0) e2Faces(ctx, rf, pal, o.roof || pal.roof, pal.roofShade);
  if (o.spire) { for (const run of projLine([apex, vAdd(apex, [0, r * 1.2, 0])])) { polyPath(ctx, run, false); ctx.strokeStyle = fogMix(o.spire, z, pal); ctx.lineWidth = clamp(300 / z, 1, 4); ctx.stroke(); } }
}
function e2Lantern(ctx, p, r, col, t, on = 1) {
  const q = project(p); if (!q) return; const rr = r * q.s; if (rr < .6) return; const fl = .85 + .15 * Math.sin(t * 7 + p[0] * 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, rr * 4, '#ffb060', .35 * on * fl); ctx.restore();
  ctx.beginPath(); ctx.ellipse(q.x, q.y, rr * .8, rr, 0, 0, TAU); ctx.fillStyle = on ? mixHex(col, '#fff2c0', .35 * fl) : col; ctx.fill();
  if (rr > 3) { ctx.strokeStyle = rgba('#2a0a0a', .6); ctx.lineWidth = Math.max(.6, rr * .08); for (const k of [-.5, 0, .5]) { ctx.beginPath(); ctx.ellipse(q.x, q.y + k * rr * .7, rr * .8 * Math.sqrt(1 - k * k * .5), rr * .12, 0, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#1a1010'; ctx.fillRect(q.x - rr * .5, q.y - rr * 1.12, rr, rr * .18); ctx.fillRect(q.x - rr * .5, q.y + rr * .95, rr, rr * .18); }
}
function e2Watchtower(ctx, c, h, pal) { // hinomi-yagura: 4 splayed posts, cross braces, ladder, platform with roof + bell
  const z = camDepth(vAdd(c, [0, h / 2, 0])), lw = clamp(500 / Math.max(1, z), 1, 6), wcol = fogMix('#3a2418', z, pal), bw = h * .12, tw = h * .06;
  const post = (sx, sz) => [vAdd(c, [sx * bw, 0, sz * bw]), vAdd(c, [sx * tw, h, sz * tw])];
  const P = [post(-1, -1), post(1, -1), post(1, 1), post(-1, 1)], line = (a, b, w = lw) => { for (const run of projLine([a, b])) { polyPath(ctx, run, false); ctx.strokeStyle = wcol; ctx.lineWidth = w; ctx.stroke(); } };
  for (const [a, b] of P) line(a, b, lw * 1.4);
  for (let k = 1; k < 7; k++) { const u = k / 7, v = (k + 1) / 7; for (let i = 0; i < 4; i++) { const A = P[i], B = P[(i + 1) % 4]; line(vLerp(A[0], A[1], u), vLerp(B[0], B[1], u)); if (k < 6) line(vLerp(A[0], A[1], u), vLerp(B[0], B[1], v), lw * .6); } }
  const top = c[1] + h, pl = [[-tw * 1.8, 0, -tw * 1.8], [tw * 1.8, 0, -tw * 1.8], [tw * 1.8, 0, tw * 1.8], [-tw * 1.8, 0, tw * 1.8]].map(p => vAdd(c, [p[0], h + p[1], p[2]]));
  e2Faces(ctx, [[pl[0], pl[3], pl[2], pl[1]].map(p => p), [pl[0], pl[1], vAdd(pl[1], [0, h * .03, 0]), vAdd(pl[0], [0, h * .03, 0])]], pal, '#4a2e20', '#1a100c');
  const apex = vAdd(c, [0, h * 1.18, 0]), rr = pl.map(p => vAdd(c, [(p[0] - c[0]) * 1.4, h * 1.08, (p[2] - c[2]) * 1.4])); e2Faces(ctx, [[rr[1], rr[0], apex], [rr[2], rr[1], apex], [rr[3], rr[2], apex], [rr[0], rr[3], apex]], pal, pal.roof, pal.roofShade);
  for (const p of pl) line(p, vAdd(c, [(p[0] - c[0]) * 1.2, h * 1.08, (p[2] - c[2]) * 1.2]), lw * .8);
  const bell = project(vAdd(c, [0, h * 1.04, 0])); if (bell) { ctx.beginPath(); ctx.arc(bell.x, bell.y, Math.max(1, h * .025 * bell.s), 0, TAU); ctx.fillStyle = fogMix('#c8a040', z, pal); ctx.fill(); }
}
function e2LavaPool(ctx, c, r, seed, t, flow = 0) { // glowing lava pool on the ground (crisp crust edge + bright core + flowing streaks)
  const pts = [], core = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, k = .75 + .45 * hash(seed + i); pts.push([c[0] + Math.cos(a) * r * k, .01, c[2] + Math.sin(a) * r * k]); core.push([c[0] + Math.cos(a) * r * k * .6, .012, c[2] + Math.sin(a) * r * k * .6]); }
  const sp = projPoly(pts); if (sp.length < 3) return; polyPath(ctx, catmull(sp, true, 2)); ctx.fillStyle = '#e0401a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1a0a0a'; ctx.stroke();
  const cp = projPoly(core); if (cp.length > 2) { polyPath(ctx, catmull(cp, true, 2)); ctx.fillStyle = '#ffb040'; ctx.fill(); }
  ctx.save(); polyPath(ctx, catmull(sp, true, 2)); ctx.clip(); ctx.strokeStyle = 'rgba(255,240,170,.7)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const z0 = c[2] - r + ((i / 6 + t * .05 * (1 + flow)) % 1) * 2 * r; for (const run of projLine([[c[0] - r, .013, z0], [c[0], .013, z0 + r * .2], [c[0] + r, .013, z0]])) { polyPath(ctx, run, false); ctx.stroke(); } } ctx.restore();
  const q = project(c); if (q) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, r * q.s * 1.6, '#ff6a2a', .35); ctx.restore(); }
}
function e2RubbleField(ctx, pal, seed, n, R, col) { for (let i = 0; i < n; i++) { const r = rng(seed + i); drawRock(ctx, [(r() - .5) * R, 0, (r() - .5) * R], .3 + r() * 1.2, pal, seed + i, col); } }
function e2Dmg(ctx, o, pal, t, seed, R = 30) { if (!o.dmg) return; for (let i = 0; i < 2 + o.dmg * 2; i++) { const r = rng(seed + i); drawCrater(ctx, [(r() - .5) * R, 0, (r() - .5) * R], 1.5 + r() * 2.5 * o.dmg, pal, seed + i); } if (o.dmg > 1) for (let i = 0; i < o.dmg * 2; i++) { const r = rng(seed + 50 + i); drawSmokeColumn(ctx, [(r() - .5) * 220, 0, -120 - r() * 200], 60 + r() * 60, 18, pal, t, seed + 50 + i); } }

// --------------------------------------------------------------------------------------------- ASAKUSA
function asakusaCity(seed = 1) {
  const key = 'asakusa' + seed; if (SETCACHE[key]) return SETCACHE[key]; const r = rng(seed), B = [], street = 6;
  for (let z = -220; z < 220; z += 7 + r() * 4) for (const side of [-1, 1]) {
    const w = 6 + r() * 3, d = 6 + r() * 5, h = 5.5 + r() * 2.5 + (r() < .2 ? 2.5 : 0), x = side * (street + w / 2 + r() * .6);
    B.push({ c: [x, 0, z], w, d: Math.min(d, 9), h, yaw: 0, roof: r() < .55 ? 'gable' : 'hip', rh: 1.8 + r(), ov: .9, base: .5, posts: 1.6, postCol: '#2a1810', win: true, wall: r() < .5 ? '#7a5640' : '#8a6a52', roofCol: '#2e2c36', baseCol: '#4a3a34', seed: Math.floor(r() * 1e5), lant: r() < .7, lantCol: r() < .7 ? '#e8302a' : '#f4ead0' });
    if (r() < .25) B.push({ c: [x - side * (w * .3), h, z], w: w * .55, d: Math.min(d, 9) * .6, h: 2.6, roof: 'hip', rh: 1.3, ov: .6, wall: '#6a4a36', roofCol: '#2a2832', posts: 1.4, win: true, seed: Math.floor(r() * 1e5) });
  }
  // Company 7 station (bigger, with a tall front) + the gate
  B.push({ c: [-street - 9, 0, -26], w: 16, d: 12, h: 9, roof: 'hip', rh: 3.4, ov: 1.4, base: .8, posts: 2, win: true, wall: '#8a3a2a', roofCol: '#26242e', seed: 777, station: true });
  for (let i = 0; i < 40; i++) B.push({ kind: 'tree', c: [(r() < .5 ? -1 : 1) * (street + 18 + r() * 30), 0, -200 + r() * 400], w: 3, d: 3, h: 6 + r() * 4, seed: Math.floor(r() * 1e5), col: '#3a5a40' });
  return SETCACHE[key] = B;
}
SETS.asakusa = { draw(ctx, t, o) {
  const pal = o.pal, B = asakusaCity(o.seed || 1), burn = o.burn || 0;
  if (o.layer !== 'fg') { drawSky(ctx, pal, t, Object.assign({ clouds: 10 }, o)); drawMountains(ctx, pal, 21, 1500, 90, mixHex(pal.fog, pal.skyMid, .4));
    // distant city silhouette (Tokyo high-rises beyond the old town)
    const r = rng(9); for (let i = 0; i < 70; i++) { const a = (i / 70) * TAU, d = 380 + r() * 200; drawBuilding(ctx, { c: [Math.sin(a) * d, 0, Math.cos(a) * d], w: 18 + r() * 20, d: 18 + r() * 20, h: 30 + r() * 70, roof: 'flat', wall: mixHex(pal.fog, '#3a3040', .4), seed: i }, pal, { far: 2000 }); }
    drawGround(ctx, pal, { col: mixHex(pal.ground, '#8a7a6a', .2), col2: pal.ground2 }); drawPaving(ctx, pal, CAM.cur.target, 30, 1.6, { alpha: .22 });
    e2Watchtower(ctx, [-4, 0, -70], 24, pal); e2Watchtower(ctx, [30, 0, -150], 22, pal); }
  drawBuildings(ctx, B, pal, Object.assign({}, o, { shadows: !pal.stars }));
  if (o.layer !== 'fg') {
    // lantern strings along the street (both sides) + standing lanterns
    for (const b of B) { if (!b.lant || b.kind) continue; const zz = camDepth(b.c); if (zz > 160 || zz < -2) continue; const side = Math.sign(b.c[0]), x = b.c[0] - side * (b.w / 2 + .5), y = b.h * .55; for (let k = -1; k <= 1; k++) e2Lantern(ctx, [x, y + Math.abs(k) * .12, b.c[2] + k * 1.6], .32, b.lantCol, t, pal.stars || burn ? 1 : .4); }
    // overhead cross strings with small lanterns
    for (let z = -90; z < 60; z += 9) { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([lerp(-6, 6, u), 5.2 - Math.sin(u * Math.PI) * .9, z]); } for (const run of projLine(pts)) { polyPath(ctx, run, false); ctx.strokeStyle = rgba('#1a1010', .6); ctx.lineWidth = 1; ctx.stroke(); } for (let i = 1; i < 10; i += 2) e2Lantern(ctx, vAdd(pts[i], [0, -.35, 0]), .2, i % 4 === 1 ? '#e8302a' : '#f4ead0', t, pal.stars || burn ? 1 : .35); }
    if (burn > 0) { const fl = []; for (const b of B) { if (b.kind || hash(b.seed) > burn * .6) continue; const zz = camDepth(b.c); if (zz > 220 || zz < 0) continue; fl.push({ p: [b.c[0], b.h + (b.rh || 1) * .6, b.c[2]], r: .7 + hash(b.seed + 1) * .7 }); }
      fxE2Flames(ctx, fl, t, { pal: 'beni', n: 2, seed: 401, alpha: .95, hK: 1.3 }); for (let i = 0; i < 2 + burn * 3; i++) { const rr = rng(410 + i); drawSmokeColumn(ctx, [(rr() < .5 ? -1 : 1) * (30 + rr() * 60), 0, -120 - rr() * 180], 50 + rr() * 50, 10, pal, t, 410 + i, '#3a2a2e'); } fxE2Embers(ctx, CAM.cur.target, t, { pal: 'beni', n: 60, r: 14, h: 10, size: .06 }); }
    e2Dmg(ctx, o, pal, t, 420, 12);
  }
} };

// --------------------------------------------------------------------------------------------- VOLCANO
SETS.volcano = { draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return;
  drawSky(ctx, pal, t, Object.assign({ clouds: 3, cirrus: false }, o));
  // erupting cone in the distance + lava glow + ash plume
  const cone = [[-260, 0, -700], [260, 0, -700]], apex = [0, 260, -760]; const cz = camDepth(apex);
  const base = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; base.push([Math.cos(a) * 420, 0, -760 + Math.sin(a) * 160]); }
  const bp = projPoly(base.concat([[60, 250, -760], [-60, 250, -760]])); if (bp.length > 2) { polyPath(ctx, bp); ctx.fillStyle = mixHex('#1a1012', pal.fog, .35); ctx.fill(); }
  const ap = project(apex); if (ap) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, ap.x, ap.y, 380 * ap.s, '#ff5a1a', .45); ctx.restore(); smokeMass(ctx, ap.x, ap.y - 300 * ap.s, 420 * ap.s, 360 * ap.s, '#3a1e1e', .9, 77, 40, '#1a0c0e');
    ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = Math.max(2, 6 * ap.s); for (let i = 0; i < 5; i++) { const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([ (i - 2) * 30 * u + Math.sin(u * 6 + i) * 10, 250 - u * 240, -760 + u * 120]); } for (const run of projLine(pts)) { polyPath(ctx, run, false); ctx.stroke(); } } }
  drawMountains(ctx, pal, 31, 1300, 160, '#24161a');
  drawGround(ctx, pal, { col: '#2e2428', col2: '#18121a', seed: 7 });
  // lava crack network (glowing)
  const r = rng(o.seed || 5); ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 70; i++) { let p = [(r() - .5) * 140, .005, (r() - .5) * 140 - 20]; const L = [p]; for (let k = 0; k < 5; k++) { p = [p[0] + (r() - .5) * 7, .005, p[2] + (r() - .5) * 7]; L.push(p); } const z = camDepth(L[0]); if (z > 140 || z < -5) continue; for (const run of projLine(L)) { polyPath(ctx, run, false); ctx.strokeStyle = 'rgba(255,90,30,.35)'; ctx.lineWidth = clamp(260 / Math.max(1, z), 2, 12); ctx.stroke(); ctx.strokeStyle = '#ffb040'; ctx.lineWidth = clamp(70 / Math.max(1, z), .8, 4); ctx.stroke(); } } ctx.restore();
  // lava river crossing the field + pools
  const riv = []; for (let i = -40; i <= 40; i++) riv.push([i * 4, .008, -30 + Math.sin(i * .25) * 8]); const L1 = riv.map(p => vAdd(p, [0, 0, 2.4])), L2 = riv.map(p => vAdd(p, [0, 0, -2.4])).reverse(); const rp = projPoly(L1.concat(L2)); if (rp.length > 2) { polyPath(ctx, rp); ctx.fillStyle = '#e8481a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#140808'; ctx.stroke(); const cpts = projPoly(riv.map(p => vAdd(p, [0, 0, 1])).concat(riv.map(p => vAdd(p, [0, 0, -1])).reverse())); if (cpts.length > 2) { polyPath(ctx, cpts); ctx.fillStyle = '#ffc050'; ctx.fill(); } }
  for (let i = 0; i < 6; i++) { const rr = rng(500 + i); e2LavaPool(ctx, [(rr() - .5) * 60, 0, -8 - rr() * 60], 2 + rr() * 3, 500 + i, t); }
  // basalt rocks / pillars
  for (let i = 0; i < 46; i++) { const rr = rng(600 + i); drawRock(ctx, [(rr() - .5) * 130, 0, (rr() - .5) * 130 - 10], .5 + rr() * 2.6, pal, 600 + i, '#2a2024'); }
  for (let i = 0; i < 10; i++) { const rr = rng(700 + i); const c = [(rr() - .5) * 160, 0, -40 - rr() * 120]; const hgt = 6 + rr() * 14; e2Faces(ctx, (() => { const n = 6, f = []; for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU, rad = 1.6 + rr() * .6; f.push([[c[0] + Math.cos(a1) * rad, 0, c[2] + Math.sin(a1) * rad], [c[0] + Math.cos(a0) * rad, 0, c[2] + Math.sin(a0) * rad], [c[0] + Math.cos(a0) * rad * .8, hgt, c[2] + Math.sin(a0) * rad * .8], [c[0] + Math.cos(a1) * rad * .8, hgt, c[2] + Math.sin(a1) * rad * .8]]); } return f; })(), pal, '#3a2e32', '#120c10'); }
  fxE2Embers(ctx, CAM.cur.target, t, { pal: { core: '#fff2c0', spark: '#ff8a3a' }, n: 70, r: 16, h: 9, size: .05 });
  e2Dmg(ctx, o, pal, t, 520, 20);
} };

// --------------------------------------------------------------------------------------------- JOKER'S TABLE
SETS.joker_table = { draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return; const R = o.r || 26, lamp = [0, 34, 0];
  ctx.fillStyle = pal.skyTop; ctx.fillRect(0, 0, W, H);
  // felt disc (oval table) with wooden rim; lit by the single lamp: radial falloff
  const disc = (rr, y) => { const a = []; for (let i = 0; i < 72; i++) { const an = i / 72 * TAU; a.push([Math.cos(an) * rr * 1.35, y, Math.sin(an) * rr]); } return a; };
  const rimTop = projPoly(disc(R + 1.6, .02)), rimSide = [], felt = projPoly(disc(R, .03));
  const sideF = []; const top = disc(R + 1.6, .02), bot = disc(R + 1.8, -1.6); for (let i = 0; i < 72; i++) { const j = (i + 1) % 72; sideF.push([bot[i], bot[j], top[j], top[i]]); } e2Faces(ctx, sideF.map(f => f.reverse()), pal, '#5a2e16', '#1a0c06');
  if (rimTop.length > 2) { polyPath(ctx, rimTop); ctx.fillStyle = '#6a3a1e'; ctx.fill(); }
  const lq = project([0, 0, 0]); if (felt.length > 2) { polyPath(ctx, felt); const g = lq ? radial(ctx, lq.x, lq.y, Math.max(W, H) * .9, [[0, '#2f9a58'], [.45, '#1e6a3e'], [1, '#08200f']]) : '#1e6a3e'; ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip(); const path = new Path2D(); felt.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1])); texOverlay(ctx, path, .3); ctx.restore(); ctx.lineWidth = 2; ctx.strokeStyle = '#d8c070'; ctx.stroke(); }
  // printed betting lines on the felt
  for (const rr of [R * .55, R * .8]) for (const run of projLine(disc(rr, .035).concat([disc(rr, .035)[0]]))) { polyPath(ctx, run, false); ctx.strokeStyle = 'rgba(230,220,170,.35)'; ctx.lineWidth = 2; ctx.stroke(); }
  // giant playing cards lying on the felt + chip towers
  const cards = []; const r = rng(o.seed || 3); for (let i = 0; i < 9; i++) { const a = r() * TAU, d = 6 + r() * (R - 8), c = [Math.cos(a) * d * 1.2, .04 + i * .002, Math.sin(a) * d], rot = r() * TAU; cards.push({ c, rot, i, z: camDepth(c) }); }
  cards.sort((a, b) => b.z - a.z);
  for (const cd of cards) { const w = 2.2, h = 3.2, ca = Math.cos(cd.rot), sa = Math.sin(cd.rot); const P = (x, z) => [cd.c[0] + x * ca - z * sa, cd.c[1], cd.c[2] + x * sa + z * ca]; const sp = projPoly([P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)]); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = fogMix('#f4ece0', cd.z * .6, pal); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#2a1a1a'; ctx.stroke(); const m = project(cd.c); if (m) { ctx.fillStyle = cd.i % 2 ? '#c41e2c' : '#1a1820'; ctx.font = `900 ${Math.max(6, 1.2 * m.s)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.translate(m.x, m.y); ctx.scale(1, clamp(Math.abs(CAM.cur.F[1]) + .25, .2, 1)); ctx.fillText('♠♥♦♣'[cd.i % 4], 0, 0); ctx.restore(); } }
  for (let i = 0; i < 7; i++) { const a = r() * TAU, d = 10 + r() * (R - 12), c = [Math.cos(a) * d * 1.25, 0, Math.sin(a) * d], hh = 1 + r() * 5, col = ['#c41e2c', '#1a1820', '#f0ece4', '#2a4ac0'][i % 4]; e2Tower(ctx, c, 1.5, hh, pal, { wall: col, roofH: 0, n: 16, windows: false }); }
  // the lamp: shade far above + light cone (additive) + smoke haze layers
  const lp = project(lamp); if (lp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fp = project([0, 0, 0]); if (fp) { const g = ctx.createLinearGradient(lp.x, lp.y, fp.x, fp.y); g.addColorStop(0, 'rgba(255,230,170,.35)'); g.addColorStop(1, 'rgba(255,230,170,.04)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lp.x - 20 * lp.s * .1, lp.y); ctx.lineTo(fp.x - R * 1.4 * fp.s, fp.y); ctx.lineTo(fp.x + R * 1.4 * fp.s, fp.y); ctx.lineTo(lp.x + 20 * lp.s * .1, lp.y); ctx.closePath(); ctx.fill(); } glow(ctx, lp.x, lp.y, 6 * lp.s, '#fff0c0', .8); ctx.restore();
    const shade = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; shade.push([Math.cos(a) * 3, 33.5, Math.sin(a) * 3]); } const ssp = projPoly(shade.concat([[0, 36, 0]])); if (ssp.length > 2) { polyPath(ctx, projPoly(shade)); ctx.fillStyle = '#1e3a22'; ctx.fill(); } for (const run of projLine([[0, 36, 0], [0, 120, 0]])) { polyPath(ctx, run, false); ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 2; ctx.stroke(); } }
  ctx.save(); for (let i = 0; i < 5; i++) { const q = project([Math.sin(t * .2 + i) * 15, 8 + i * 3, -10 + i * 3]); if (q) smokeMass(ctx, q.x, q.y, 900 * (q.s / 40), 160 * (q.s / 40), '#8a8490', .08, 90 + i, 20); } ctx.restore();
  e2Dmg(ctx, o, pal, t, 530, 20);
} };

// --------------------------------------------------------------------------------------------- ADOLLA
SETS.adolla = { draw(ctx, t, o) {
  const pal = o.pal; if (o.layer === 'fg') return; drawSky(ctx, pal, t, { clouds: 0, cirrus: false });
  // giant burning eyes in the black sky (concentric rings), billboards on a far dome
  const eyes = o.eyes || [[-.5, .2], [.45, .3], [0, .55], [1.6, .18], [-1.7, .26], [3.0, .22], [2.2, .32], [-2.6, .2], [1.0, .5], [-1.1, .42]];
  for (const [az, el] of eyes) { const d = [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)], p = project(vAdd(CAM.cur.pos, vMul(d, 3000))); if (!p) continue; const R = p.s * 3000 * .075;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, p.x, p.y, R * 2.2, '#ff5a2a', .35); ctx.restore();
    ctx.save(); ctx.translate(p.x, p.y); ctx.beginPath(); ctx.moveTo(-R * 1.6, 0); ctx.quadraticCurveTo(0, -R * 1.1, R * 1.6, 0); ctx.quadraticCurveTo(0, R * 1.1, -R * 1.6, 0); ctx.fillStyle = '#120408'; ctx.fill(); ctx.lineWidth = Math.max(2, R * .06); ctx.strokeStyle = '#ff7a2a'; ctx.stroke(); ctx.clip();
    for (const [k, col] of [[.95, '#ff5a1a'], [.72, '#ffb040'], [.5, '#c84aff'], [.3, '#ff7a2a'], [.14, '#fff2d0']]) { ctx.beginPath(); ctx.arc(Math.sin(t * .3 + az) * R * .1, 0, R * k * (1 + .03 * Math.sin(t * 4 + k * 9)), 0, TAU); ctx.lineWidth = R * .07; ctx.strokeStyle = col; ctx.stroke(); }
    ctx.restore(); }
  const gp = drawGround(ctx, pal, { col: '#140c12', col2: '#040305' });
  // black glass: reflections of the eyes (vertical streaks) + crack network
  ctx.save(); if (gp) ctx.clip(gp); ctx.globalCompositeOperation = 'lighter'; for (const [az, el] of eyes) { const p = project(vAdd(CAM.cur.pos, vMul([Math.sin(az), 0, -Math.cos(az)], 3000))); if (p) { const g = ctx.createLinearGradient(0, p.y, 0, H); g.addColorStop(0, 'rgba(255,110,40,.18)'); g.addColorStop(1, 'rgba(255,110,40,0)'); ctx.fillStyle = g; ctx.filter = 'blur(18px)'; ctx.fillRect(p.x - 70, p.y, 140, H); ctx.filter = 'none'; } } ctx.restore();
  const r = rng(7); ctx.strokeStyle = 'rgba(255,120,60,.35)'; ctx.lineWidth = 1.2; for (let i = 0; i < 60; i++) { let p = [(r() - .5) * 100, .004, (r() - .5) * 100]; const L = [p]; for (let k = 0; k < 4; k++) { p = [p[0] + (r() - .5) * 6, .004, p[2] + (r() - .5) * 6]; L.push(p); } for (const run of projLine(L)) { polyPath(ctx, run, false); ctx.stroke(); } }
  // flame horizon ring
  const E = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; E.push({ p: [CAM.cur.pos[0] + Math.sin(a) * 220, 0, CAM.cur.pos[2] + Math.cos(a) * 220], r: 7 }); } fxE2Flames(ctx, E, t, { pal: 'joker', n: 3, seed: 541, alpha: .8, wK: 1.6 });
  fxE2Embers(ctx, CAM.cur.target, t, { pal: 'joker', n: 50, r: 14, h: 8 });
} };

// --------------------------------------------------------------------------------------------- CLOVER CASTLE
SETS.clover_castle = { draw(ctx, t, o) {
  const pal = o.pal, dmg = o.dmg || 0;
  if (o.layer !== 'fg') { drawSky(ctx, pal, t, Object.assign({ clouds: 16 }, o));
    // rolling green hills (distant), forest band
    drawMountains(ctx, pal, 41, 1300, 120, mixHex(pal.fog, '#5a8a62', .35)); drawMountains(ctx, pal, 43, 800, 60, mixHex(pal.fog, '#4a7a4a', .55));
    drawGround(ctx, pal, { col: pal.ground, col2: pal.ground2, seed: 11 }); drawPaving(ctx, pal, [0, 0, 0], 22, 2.6, { alpha: .25 });
    for (let i = 0; i < 60; i++) { const r = rng(800 + i); drawTree(ctx, [(r() < .5 ? -1 : 1) * (40 + r() * 80), 0, -60 - r() * 200], 8 + r() * 6, pal, 800 + i, '#4a7a46'); } }
  // castle: curtain walls around a keep + round towers with blue cone roofs + the silver spire (Silva)
  const key = 'clover' + (o.seed || 1); if (!SETCACHE[key]) { const Bq = []; const cz = -95; for (const [x, z, w, d] of [[0, cz - 30, 70, 2], [0, cz + 30, 70, 2], [-35, cz, 2, 60], [35, cz, 2, 60]]) Bq.push({ c: [x, 0, z], w, d, h: 11, roof: 'flat', wall: '#e4ddcc', base: 1.2, seed: x + z, kind: 'wall' }); Bq.push({ c: [0, 0, cz - 5], w: 30, d: 22, h: 26, roof: 'hip', rh: 9, ov: 1, wall: '#ece6d6', roofCol: '#2e4a8a', base: 2, win: true, posts: 0, seed: 91 }); SETCACHE[key] = Bq; }
  drawBuildings(ctx, SETCACHE[key].map(b => dmg ? Object.assign({}, b, { h: b.kind === 'wall' && hash(b.seed + 2) < .5 * dmg ? b.h * .45 : b.h, broken: Math.min(1, dmg * .35) }) : b), pal, Object.assign({}, o, { dmg: 0 }));
  if (o.layer === 'fg') return;
  const towers = [[-35, -125, 4.5, 26], [35, -125, 4.5, 30], [-35, -65, 4, 22], [35, -65, 4, 22], [-12, -110, 3.2, 44, true], [14, -100, 3.6, 38]];
  const tz = towers.map(tw => ({ tw, z: camDepth([tw[0], tw[3] / 2, tw[1]]) })).sort((a, b) => b.z - a.z);
  for (const { tw } of tz) { const [x, z, r, h, silver] = tw; const br = dmg ? (hash(x * 3 + z) < .35 * dmg ? .35 + hash(x) * .3 : 0) : 0; e2Tower(ctx, [x, 0, z], r, h, pal, { wall: '#ece6d8', roof: silver ? '#c8ccd8' : pal.roof, roofH: r * (silver ? 3.6 : 2.4), broken: br, crenel: !silver, spire: silver ? '#e8ecf4' : null }); }
  // banners
  if (!dmg) for (const [x, z] of [[-35, -125], [35, -125]]) { const top = [x, 26 + 4.5 * 2.4 + 2, z]; for (const run of projLine([vAdd(top, [0, -3, 0]), top])) { polyPath(ctx, run, false); ctx.strokeStyle = '#3a3030'; ctx.lineWidth = 1.5; ctx.stroke(); } const fl = []; for (let i = 0; i <= 6; i++) fl.push(vAdd(top, [i * .7, -Math.sin(i * .8 + t * 4) * .3 - .2, 0])); for (let i = 6; i >= 0; i--) fl.push(vAdd(top, [i * .7, -Math.sin(i * .8 + t * 4) * .3 - 1.4, 0])); const sp = projPoly(fl); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = '#c8202e'; ctx.fill(); } }
  if (dmg) { e2RubbleField(ctx, pal, 850, 30 * dmg, 60, '#cfc6b4'); e2Dmg(ctx, o, pal, t, 860, 24); }
} };
// default palettes (drawSet / showdown BGX use SETS[name].pal when no pal is given)
Object.assign(SETS.asakusa, { pal: 'ember' }); Object.assign(SETS.volcano, { pal: 'magma' }); Object.assign(SETS.joker_table, { pal: 'table' });
Object.assign(SETS.adolla, { pal: 'adolla' }); Object.assign(SETS.clover_castle, { pal: 'clover' });
