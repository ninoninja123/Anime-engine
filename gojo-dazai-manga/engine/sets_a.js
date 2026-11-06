/* engine/sets_a.js (E1) - painted gouache battle sets for the death battle (all real 3D -> true parallax; sky/far/mid/near layers;
   foreground props via f.fg({ set, zSplit })).  Every set has a default palette (SETS[name].pal) and accepts { pal, dmg, seed, t }.
   SETS:  mugen       Mugen Train wreck in a grass field before dawn (rails, derailed cars, cedar tree line)       pal predawn
          nexus       fused-worlds arena: stone ring, Seireitei walls, Asakusa lanterns + fire tower, silver spire, rails,
                      ruined high-rises; the frozen sun on the horizon (eternal dawn)                               pal eternal
          jaku        Jaku City after the Decay wave: crumbled high-rises, dust dunes, rubble                     pal dust
          forest      misty cedar forest under the moon                                                            pal mist
          nightstreet Taisho-era night street, two-storey wooden shops, glowing lanterns, wet paving                pal lantern
          stage       Karamatsu Shinju kabuki stage: grey world, painted pine backdrop, curtains                    pal stage
          underwater  deep water: light shafts, caustics, sea floor rocks, bubbles                                 pal deep
          cliff       seaside cliff before the sunrise, ocean to the horizon                                       pal dawn
          skyhigh     above the clouds: cloud sea, towering cumulus                                                pal highsky
   PALETTES added: predawn eternal dust mist lantern stage deep dawn highsky
   Helpers: drawCedar, drawHighrise, drawTrainCar, drawRails, drawLantern, drawFireTower, drawSpire, drawSunDisk, drawMoon,
            drawCloudSea, drawGrass, drawRubble, drawItems(ctx, items, pal, o, t) (depth-sorted props honouring layer/zSplit)    */
'use strict';
Object.assign(PALETTES, {
  predawn: { skyTop: '#0c1638', skyMid: '#2e4a86', skyLow: '#8aa6d0', fog: '#5a74a8', sun: [.5, .25, -.6], ground: '#3a5a5a', ground2: '#26403e', wall: '#8a9ab8', wallShade: '#3a4668', roof: '#1e2840', roofShade: '#121a2c', wood: '#2a2a3a', cloud: '#8aa0c8', cloudShade: '#34466e', haze: .55, line: '#0e1428', amb: '#8aa8e0', stars: true },
  eternal: { skyTop: '#1c1a4a', skyMid: '#a04a6a', skyLow: '#ffb46a', fog: '#e89a7a', sun: [0, .12, -1], ground: '#a08070', ground2: '#6a5058', wall: '#f0d0b8', wallShade: '#8a6080', roof: '#3a2c48', roofShade: '#221a30', wood: '#4a2c2c', cloud: '#ffc8a0', cloudShade: '#8a4a70', haze: .6, line: '#3a2030', amb: '#ffc0a0' },
  dust: { skyTop: '#5a5a62', skyMid: '#9a9088', skyLow: '#d0bea8', fog: '#b8a898', sun: [-.4, .6, .4], ground: '#a89684', ground2: '#867462', wall: '#c8bcb0', wallShade: '#7a7078', roof: '#5a5258', roofShade: '#3a343a', wood: '#5a4a40', cloud: '#c8bcb0', cloudShade: '#7a7078', haze: .75, line: '#3a3234', amb: '#e0d0c0' },
  mist: { skyTop: '#121e2a', skyMid: '#2e4654', skyLow: '#6a8890', fog: '#8aa6aa', sun: [.3, .6, -.5], ground: '#2e4234', ground2: '#1e2e24', wall: '#7a8a8a', wallShade: '#3a4a50', roof: '#1e2a2a', roofShade: '#121a1a', wood: '#2a2420', cloud: '#7a9098', cloudShade: '#2a3a44', haze: .85, line: '#0a1410', amb: '#9ab8c0' },
  lantern: { skyTop: '#06081a', skyMid: '#141a3a', skyLow: '#3a2a4a', fog: '#2a2240', sun: [.2, .7, .5], ground: '#3a3444', ground2: '#262230', wall: '#8a6a5a', wallShade: '#3a2a34', roof: '#1e1a26', roofShade: '#100e16', wood: '#3a2420', cloud: '#2a2a48', cloudShade: '#141428', haze: .35, line: '#0a080e', amb: '#ffb070', stars: true },
  stage: { skyTop: '#9a9a96', skyMid: '#c4c2bc', skyLow: '#e4e0d6', fog: '#d0ccc2', sun: [-.3, .8, .4], ground: '#8a7a64', ground2: '#6a5c4a', wall: '#d8d2c4', wallShade: '#8a8478', roof: '#3a3a3a', roofShade: '#222222', wood: '#5a4634', cloud: '#e8e4dc', cloudShade: '#a8a49c', haze: .3, line: '#2a2622', amb: '#e8e0d0' },
  deep: { skyTop: '#02101e', skyMid: '#06304a', skyLow: '#1a6a7a', fog: '#0e4a5e', sun: [0, 1, 0], ground: '#2a4a4a', ground2: '#16302e', wall: '#3a6a70', wallShade: '#16323a', roof: '#0e2a30', roofShade: '#061418', wood: '#1a2a2a', cloud: '#3a8a9a', cloudShade: '#0e3a4a', haze: .9, line: '#021014', amb: '#6ac8d8' },
  dawn: { skyTop: '#22305a', skyMid: '#c86a6a', skyLow: '#ffd08a', fog: '#e8a888', sun: [.0, .1, -1], ground: '#6a6a5a', ground2: '#4a4a40', wall: '#d8c0a8', wallShade: '#6a5a6a', roof: '#3a3040', roofShade: '#221c2a', wood: '#3a2c28', cloud: '#ffd0a8', cloudShade: '#8a5a7a', haze: .55, line: '#2a2028', amb: '#ffc8a0' },
  highsky: { skyTop: '#1a4aa8', skyMid: '#5a96e0', skyLow: '#cfe6f8', fog: '#dceaf6', sun: [-.4, .6, .5], ground: '#e8f0f8', ground2: '#c8d8ea', wall: '#ffffff', wallShade: '#a8b8d8', roof: '#4a5a7a', roofShade: '#2a3450', wood: '#5a6a8a', cloud: '#ffffff', cloudShade: '#a8bce0', haze: .4, line: '#3a4a6a' },
});
// ------------------------------------------------------------------------------------------------ helpers
function drawItems(ctx, items, pal, o, t) {
  const L = items.map(it => ({ it, z: camDepth(vAdd(it.c, [0, (it.h || 2) * .4, 0])) })).filter(q => q.z > -(it2r(q.it)) && q.z < (o.far || 1400));
  L.sort((a, b) => b.z - a.z);
  for (const q of L) { if (o.layer === 'bg' && o.zSplit != null && q.z < o.zSplit) continue; if (o.layer === 'fg' && (o.zSplit == null || q.z >= o.zSplit)) continue; if (o.layer === 'all' && o.zSplit != null && q.z < o.zSplit && o.noFg) continue; q.it.draw(ctx, pal, t, q.z); }
}
const it2r = it => Math.max(it.w || 3, it.d || 3, 3);
function drawCedar(ctx, c, h, pal, seed = 1, col = '#24402e', z = null) {
  const r = rng(seed); z = z == null ? camDepth(c) : z; const p0 = project(c); if (!p0) return; const s = p0.s;
  const trunk = fogMix('#3a2a24', z, pal, 1.1), dark = fogMix(shadeHex(col, -.25), z, pal, 1.1), mid = fogMix(col, z, pal, 1.1), lit = fogMix(mixHex(col, '#c8e0a0', .25), z, pal, 1.1);
  const top = proj2([c[0], c[1] + h, c[2]]); ctx.strokeStyle = trunk; ctx.lineWidth = Math.max(1, h * .035 * s); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(top[0], top[1]); ctx.stroke();
  const tiers = 6 + Math.floor(r() * 3);
  for (let i = 0; i < tiers; i++) { const u = .25 + i / tiers * .75, y = c[1] + h * u, w = h * .2 * (1 - u * .78) * (.85 + r() * .3), q = proj2([c[0], y, c[2]]), wp = w * s, hp = h * .16 * s;
    for (const [col2, dx, k] of [[dark, wp * .12, 1], [mid, 0, .92], [lit, -wp * .18, .55]]) { ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(q[0] - wp * k + dx, q[1] + hp * .1); for (let j = 0; j <= 6; j++) { const a = j / 6; ctx.lineTo(q[0] + dx + lerp(-wp * k, wp * k, a), q[1] + hp * .1 + (j % 2 ? -hp * .12 : hp * .05)); } ctx.lineTo(q[0] + dx + wp * .05 * k, q[1] - hp * k); ctx.closePath(); ctx.fill(); } }
}
function drawHighrise(ctx, b, pal, t, z) {
  const cam = CAM.cur, { bot, top } = boxCorners(b), wallC = b.wall || '#a8a4a8'; z = z == null ? camDepth(b.c) : z;
  const jag = b.ruin ? (i, u) => -b.h * b.ruin * (.15 + .35 * Math.abs(Math.sin(u * 7 + i * 3 + b.seed))) * (hash(b.seed + i) < .6 ? 1 : .2) : () => 0;
  for (let i = 0; i < 4; i++) { const a = bot[i], bb = bot[(i + 1) % 4], n = vNorm(vCross(vSub(bb, a), [0, 1, 0])), mid = vLerp(vLerp(a, bb, .5), vLerp(top[i], top[(i + 1) % 4], .5), .5); if (vDot(n, vSub(cam.pos, mid)) <= 0) continue;
    const poly = [a, bb]; for (let k = 8; k >= 0; k--) { const u = k / 8, p = vLerp(top[i], top[(i + 1) % 4], u); poly.push(vAdd(p, [0, jag(i, u), 0])); }
    const sp = projPoly(poly); if (sp.length < 3) continue; const col = fogMix(faceCol(wallC, pal.wallShade, n, pal), z, pal); polyPath(ctx, sp); ctx.fillStyle = col; ctx.fill();
    if (z < 400) { ctx.save(); polyPath(ctx, sp); ctx.clip(); const len = vDist(a, bb), nx = Math.max(2, Math.round(len / 3)), ny = Math.max(2, Math.round(b.h / 3.2)); ctx.fillStyle = fogMix(b.winCol || '#3a4458', z, pal);
      for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) { if (hash(b.seed * 7 + i * 131 + ix * 17 + iy) < (b.dark || .12)) continue; const u0 = (ix + .2) / nx, u1 = (ix + .8) / nx, v0 = (iy + .25) / ny * b.h, v1 = (iy + .75) / ny * b.h; const wp = projPoly([vAdd(vLerp(a, bb, u0), [0, v0, 0]), vAdd(vLerp(a, bb, u1), [0, v0, 0]), vAdd(vLerp(a, bb, u1), [0, v1, 0]), vAdd(vLerp(a, bb, u0), [0, v1, 0])]); if (wp.length > 2) { polyPath(ctx, wp); ctx.fill(); } }
      ctx.restore(); }
    paintPatches(ctx, sp, col, b.seed * 3 + i, z, pal); polyPath(ctx, sp); ctx.lineWidth = clamp(200 / z, .5, 2); ctx.strokeStyle = rgba(pal.line, .35); ctx.stroke(); }
  if (!b.ruin && cam.pos[1] > top[0][1]) { const sp = projPoly(top); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix(shadeHex(wallC, -.2), z, pal); ctx.fill(); } }
}
function drawTrainCar(ctx, c, yaw, len, pal, opt = {}, z = null) { // derailed passenger car: box body, rounded roof, window row
  const M = mYPR(yaw, 0, opt.roll || 0), w = 2.8, h = 2.9, col = opt.col || '#3a2620'; z = z == null ? camDepth(c) : z;
  const P = (x, y, zz) => vAdd(c, mApply(M, [x, y, zz])), cam = CAM.cur;
  const faces = [[[-w / 2, .5, -len / 2], [w / 2, .5, -len / 2], [w / 2, h, -len / 2], [-w / 2, h, -len / 2]], [[w / 2, .5, len / 2], [-w / 2, .5, len / 2], [-w / 2, h, len / 2], [w / 2, h, len / 2]], [[w / 2, .5, -len / 2], [w / 2, .5, len / 2], [w / 2, h, len / 2], [w / 2, h, -len / 2]], [[-w / 2, .5, len / 2], [-w / 2, .5, -len / 2], [-w / 2, h, -len / 2], [-w / 2, h, len / 2]]];
  for (const f of faces) { const W3 = f.map(q => P(...q)), n = vNorm(vCross(vSub(W3[1], W3[0]), vSub(W3[3], W3[0]))), m = vLerp(W3[0], W3[2], .5); if (vDot(n, vSub(cam.pos, m)) <= 0) continue; const sp = projPoly(W3); if (sp.length < 3) continue; const cc = fogMix(faceCol(col, '#140c10', n, pal), z, pal); polyPath(ctx, sp); ctx.fillStyle = cc; ctx.fill();
    if (Math.abs(f[0][0] - f[1][0]) < .01 && z < 200) { const nW = Math.round(len / 1.6); ctx.fillStyle = fogMix(opt.lit ? '#ffd890' : '#1a1418', z, pal); for (let i = 0; i < nW; i++) { const u0 = (i + .2) / nW, u1 = (i + .75) / nW, A = vLerp(W3[0], W3[1], u0), B = vLerp(W3[0], W3[1], u1); const wp = projPoly([vAdd(A, mApply(M, [0, 1.3, 0])), vAdd(B, mApply(M, [0, 1.3, 0])), vAdd(B, mApply(M, [0, 2.3, 0])), vAdd(A, mApply(M, [0, 2.3, 0]))]); if (wp.length > 2) { polyPath(ctx, wp); ctx.fill(); } } }
    polyPath(ctx, sp); ctx.lineWidth = clamp(160 / z, .5, 2); ctx.strokeStyle = rgba('#0a0608', .6); ctx.stroke(); }
  const roof = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8; roof.push([Math.cos(a) * w * .55, h + Math.sin(a) * .45]); }
  for (let i = 0; i < 8; i++) { const q = [P(roof[i][0], roof[i][1], -len / 2), P(roof[i + 1][0], roof[i + 1][1], -len / 2), P(roof[i + 1][0], roof[i + 1][1], len / 2), P(roof[i][0], roof[i][1], len / 2)]; const n = vNorm(vCross(vSub(q[1], q[0]), vSub(q[3], q[0]))); if (vDot(n, vSub(cam.pos, q[0])) <= 0) continue; const sp = projPoly(q); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix(faceCol('#1e1a1e', '#08060a', n, pal), z, pal); ctx.fill(); } }
}
function drawRails(ctx, a, b, pal, opt = {}) { const d = vNorm(vSub(b, a)), side = vNorm(vCross(d, [0, 1, 0])), L = vDist(a, b); ctx.strokeStyle = rgba(opt.tie || '#3a2a22', .8); ctx.lineWidth = 2;
  for (let s = 0; s < L; s += .7) { const p = vMad(a, d, s); for (const r of projLine([vMad(p, side, -1.1), vMad(p, side, 1.1)])) { polyPath(ctx, r, false); ctx.stroke(); } }
  ctx.strokeStyle = opt.rail || '#8a8e98'; ctx.lineWidth = 2.4; for (const sg of [-1, 1]) for (const r of projLine([vMad(a, side, sg * .72), vMad(b, side, sg * .72)].map(p => vAdd(p, [0, .05, 0])))) { polyPath(ctx, r, false); ctx.stroke(); } }
function drawLantern(ctx, p, pal, t, z, opt = {}) { const q = project(p); if (!q) return; const r = (opt.r || .28) * q.s, sw = Math.sin(t * 1.3 + p[0]) * r * .1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x + sw, q.y, r * 4, opt.glow || '#ffa040', .35); ctx.restore();
  ctx.fillStyle = opt.col || '#e8402a'; ctx.beginPath(); ctx.ellipse(q.x + sw, q.y, r * .8, r, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.ellipse(q.x + sw - r * .15, q.y - r * .1, r * .35, r * .55, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a1410'; ctx.lineWidth = Math.max(1, r * .08); for (const dy of [-.6, 0, .6]) { ctx.beginPath(); ctx.ellipse(q.x + sw, q.y + dy * r * .8, r * .78 * Math.sqrt(1 - dy * dy * .6), r * .1, 0, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#1a1010'; ctx.fillRect(q.x + sw - r * .4, q.y - r * 1.1, r * .8, r * .18); ctx.fillRect(q.x + sw - r * .4, q.y + r * .92, r * .8, r * .18); }
function drawFireTower(ctx, c, h, pal, z) { // Asakusa fire watchtower: four leaning legs + cabin + bell
  const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, zz]) => [vAdd(c, [x * 2.2, 0, zz * 2.2]), vAdd(c, [x * .8, h, zz * .8])]); ctx.strokeStyle = fogMix('#3a2a22', z, pal); ctx.lineWidth = clamp(300 / z, 1, 5);
  for (const [a, b] of legs) for (const r of projLine([a, b])) { polyPath(ctx, r, false); ctx.stroke(); }
  for (let k = 1; k < 6; k++) { const u = k / 6; const ring = legs.map(([a, b]) => vLerp(a, b, u)); ring.push(ring[0]); for (const r of projLine(ring)) { polyPath(ctx, r, false); ctx.stroke(); } for (let i = 0; i < 4; i++) for (const r of projLine([ring[i], vLerp(legs[(i + 1) % 4][0], legs[(i + 1) % 4][1], u - 1 / 6)])) { polyPath(ctx, r, false); ctx.lineWidth = clamp(150 / z, .6, 2.5); ctx.stroke(); } }
  drawBuilding(ctx, { c: vAdd(c, [0, h, 0]), w: 2.4, d: 2.4, h: 1.8, roof: 'hip', rh: 1.2, ov: .5, wall: '#5a3a2a', seed: 9 }, pal, {}); }
function drawSpire(ctx, c, h, pal, z, col = '#d8dce8') { const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; pts.push([c[0] + Math.cos(a) * h * .06, 0, c[2] + Math.sin(a) * h * .06]); } const apex = [c[0], h, c[2]], cam = CAM.cur;
  for (let i = 0; i < 6; i++) { const f = [pts[i], pts[(i + 1) % 6], vLerp(pts[(i + 1) % 6], apex, .8), vLerp(pts[i], apex, .8)], n = vNorm(vCross(vSub(f[1], f[0]), vSub(f[3], f[0]))), m = vLerp(f[0], f[2], .5); if (vDot(n, vSub(cam.pos, m)) <= 0) continue; const sp = projPoly(f); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = fogMix(faceCol(col, '#6a7090', n, pal), z, pal); ctx.fill(); }
  const tip = projPoly([vLerp(pts[0], apex, .8), vLerp(pts[2], apex, .8), vLerp(pts[4], apex, .8), apex]); if (tip.length > 2) { polyPath(ctx, tip); ctx.fillStyle = fogMix('#4a5a8a', z, pal); ctx.fill(); } }
function drawSunDisk(ctx, pal, dir, opt = {}) { const cam = CAM.cur, d = vNorm(dir), p = project(vAdd(cam.pos, vMul(d, 4000))); if (!p) return; const R = (opt.r || 160) * (cam.f / 1000);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p.x, p.y, R * 6, opt.glow || '#ffb060', .6); for (let i = 0; i < 14; i++) { const a = -Math.PI + i / 13 * Math.PI; ctx.fillStyle = rgba('#ffe0a0', .08); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a - .04) * W, p.y + Math.sin(a - .04) * W); ctx.lineTo(p.x + Math.cos(a + .04) * W, p.y + Math.sin(a + .04) * W); ctx.fill(); } ctx.restore();
  ctx.fillStyle = opt.col || '#fff2c8'; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill(); }
// drawMoonDir: props.js owns drawMoon(ctx, pal, t, {size,k}); this one places the moon by direction
function drawMoonDir(ctx, pal, t, o = {}) { const cam = CAM.cur, p = project(vAdd(cam.pos, vMul(vNorm(o.dir || [.4, .45, -1]), 4000))); if (!p) return; const R = (o.r || 90) * cam.f / 1000;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p.x, p.y, R * 5, o.glow || '#c8d8ff', .45); ctx.restore(); ctx.fillStyle = o.col || '#f4f0dc'; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill(); ctx.fillStyle = rgba('#a8a090', .35); for (const [dx, dy, r] of [[-.3, -.2, .25], [.25, .1, .18], [-.05, .35, .14]]) { ctx.beginPath(); ctx.arc(p.x + dx * R, p.y + dy * R, r * R, 0, TAU); ctx.fill(); } }
function drawCloudSea(ctx, pal, t, y = -20, opt = {}) { const cam = CAM.cur, r = rng(opt.seed || 5);
  const items = []; for (let i = 0; i < 160; i++) { const a = r() * TAU, d = 160 + Math.pow(r(), .7) * 1400; items.push([cam.pos[0] * 0 + Math.cos(a) * d + t * 2, y + r() * 6, Math.sin(a) * d]); }
  items.sort((p, q) => camDepth(q) - camDepth(p)); for (const c of items) { const p = project(c); if (!p) continue; const w = (40 + hash(c[0] * 3) * 60) * p.s; if (w < 2) continue; paintCloud(ctx, p.x, p.y, w, w * .3, pal, Math.round(c[0] * 7 + c[2]), 0); } }
function drawGrass(ctx, pal, center, R = 30, n = 900, col = '#4a6a4a', t = 0, seed = 3) { const r = rng(seed); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const p = [center[0] + (r() - .5) * 2 * R, 0, center[2] + (r() - .5) * 2 * R]; const q = project(p); if (!q || q.s < 4) { r(); continue; } const hgt = (.25 + r() * .35) * q.s, z = camDepth(p); const sway = Math.sin(t * 2 + p[0] * .5) * hgt * .15; ctx.strokeStyle = fogMix(r() < .4 ? shadeHex(col, -.2) : r() < .5 ? col : mixHex(col, '#c8d8a0', .3), z, pal); ctx.lineWidth = Math.max(.8, .025 * q.s); ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(q.x + sway, q.y - hgt * .6, q.x + sway * 2 + (r() - .5) * hgt * .3, q.y - hgt); ctx.stroke(); } }
function drawRubble(ctx, pal, center, R = 30, n = 60, col = '#8a7e74', seed = 21) { const r = rng(seed); for (let i = 0; i < n; i++) drawRock(ctx, [center[0] + (r() - .5) * 2 * R, 0, center[2] + (r() - .5) * 2 * R], .2 + r() * 1.2, pal, seed * 7 + i, col); }
function bgPass(o) { return o.layer !== 'fg'; }

// ------------------------------------------------------------------------------------------------ sets
SETS.mugen = { pal: 'predawn', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 9 }, o)); drawMoonDir(ctx, pal, t, { dir: [-.6, .35, -1], r: 70 }); drawMountains(ctx, pal, 21, 1500, 220, mixHex(pal.fog, '#1a2a4a', .35)); drawMountains(ctx, pal, 22, 900, 120, mixHex(pal.fog, '#14243a', .55));
    drawGround(ctx, pal, { col: '#3a5a52', col2: '#22362e' }); drawGrass(ctx, pal, [CAM.cur.target[0], 0, CAM.cur.target[2]], 22, 1100, '#3e6a5a', t);
    drawRails(ctx, [-200, 0, 6], [200, 0, -4], pal); }
  const key = 'mugen' + (o.seed || 1); if (!SETCACHE[key]) { const r = rng(o.seed || 1), I = [];
    for (let i = 0; i < 70; i++) { const x = -260 + i * 7.5 + r() * 4, zz = -70 - r() * 50; const c = [x, 0, zz], h = 16 + r() * 14, sd = Math.floor(r() * 1e5); I.push({ c, h, draw: (g, p, tt, z) => drawCedar(g, c, h, p, sd, '#1e3a34', z) }); }
    const cars = [[-14, 3, .5, 0, .25], [-2, 9, -.4, 0, -.4], [12, 4, .9, 1, .1], [26, 1, .2, 0, 1.3], [38, 7, -.8, 0, .2]];
    for (const [x, zz, yaw, lit, roll] of cars) { const c = [x, roll > 1 ? 1.4 : 0, -zz]; I.push({ c, h: 3, w: 12, d: 12, draw: (g, p, tt, z) => drawTrainCar(g, c, yaw, 18, p, { roll, lit, col: '#3a2422' }, z) }); }
    for (let i = 0; i < 18; i++) { const c = [(r() - .5) * 90, 0, -r() * 40 + 10]; const rr = .4 + r() * 1.4, sd = 700 + i; I.push({ c, h: rr, draw: (g, p, tt, z) => drawRock(g, c, rr, p, sd, '#5a6a6a') }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (bgPass(o) && o.dmg) for (let i = 0; i < o.dmg * 2; i++) { const r = rng(40 + i); drawSmokeColumn(ctx, [(r() - .5) * 120, 0, -40 - r() * 60], 40 + r() * 30, 10, pal, t, 40 + i, '#3a3a4a'); }
} };
SETS.nexus = { pal: 'eternal', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 12, cloudSeed: 17 }, o)); drawSunDisk(ctx, pal, [0, -.012, -1], { r: 210, col: '#fff0c0', glow: '#ff9a50' }); drawMountains(ctx, pal, 31, 1500, 160, mixHex(pal.fog, '#5a3a5a', .4));
    drawGround(ctx, pal, { col: '#9a7a6a', col2: '#5a4450' });
    // stone arena ring with radial slabs
    ctx.strokeStyle = rgba('#3a2430', .45); ctx.lineWidth = 1.4; for (let rr = 4; rr <= 28; rr += 4) { const pts = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU; pts.push([Math.cos(a) * rr, .003, Math.sin(a) * rr]); } for (const r of projLine(pts)) { polyPath(ctx, r, false); ctx.stroke(); } }
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; for (const r of projLine([[Math.cos(a) * 4, .003, Math.sin(a) * 4], [Math.cos(a) * 28, .003, Math.sin(a) * 28]])) { polyPath(ctx, r, false); ctx.stroke(); } }
    drawRails(ctx, [-300, 0, -40], [300, 0, -60], pal); if (o.dmg) for (let i = 0; i < 2 + o.dmg * 2; i++) { const r = rng(500 + i); drawCrater(ctx, [(r() - .5) * 30, 0, (r() - .5) * 30], 1.5 + r() * 2.5 * o.dmg, pal, 500 + i); } }
  const key = 'nexus'; if (!SETCACHE[key]) { const I = [], r = rng(77);
    // Seireitei fragment (white walls, tiled roofs) - north-west
    for (let i = 0; i < 6; i++) { const b = { c: [-70 + i * 12, 0, -60 - r() * 10], w: 10, d: 8, h: 5 + r() * 3, roof: 'hip', base: .8, posts: 2.6, win: true, seed: 300 + i }; I.push({ c: b.c, h: b.h, w: b.w, draw: (g, p) => drawBuilding(g, b, p, {}) }); }
    { const b = { c: [-40, 0, -45], w: 40, d: .8, h: 3.4, roof: 'cap', rh: .6, ov: .5, base: .6, kind: 'wall', seed: 41 }; I.push({ c: b.c, h: 3, w: 40, draw: (g, p) => drawBuilding(g, b, p, {}) }); }
    // Asakusa fragment: fire tower, wooden houses, lantern line - east
    { const c = [55, 0, -50]; I.push({ c, h: 18, draw: (g, p, tt, z) => drawFireTower(g, c, 18, p, z) }); }
    for (let i = 0; i < 5; i++) { const b = { c: [35 + i * 9, 0, -38 - r() * 6], w: 8, d: 7, h: 6, roof: 'gable', rh: 2.4, ov: .8, wall: '#6a4a3a', base: .5, posts: 2, win: true, seed: 330 + i }; I.push({ c: b.c, h: 6, w: 8, draw: (g, p) => drawBuilding(g, b, p, {}) }); }
    for (let i = 0; i < 9; i++) { const c = [30 + i * 4.5, 4.2, -33]; I.push({ c, h: 1, draw: (g, p, tt, z) => drawLantern(g, c, p, tt, z) }); }
    // Clover silver spire - far north
    { const c = [10, 0, -180]; I.push({ c, h: 110, w: 20, draw: (g, p, tt, z) => drawSpire(g, c, 110, p, z) }); } { const c = [-6, 0, -170]; I.push({ c, h: 70, w: 14, draw: (g, p, tt, z) => drawSpire(g, c, 70, p, z, '#c8ccd8') }); }
    // Jaku ruins - west / south-west
    for (let i = 0; i < 7; i++) { const b = { c: [-120 + i * 14, 0, -110 - r() * 40], w: 12, d: 12, h: 25 + r() * 30, seed: 360 + i, ruin: .3 + r() * .4, wall: '#a8a0a0' }; I.push({ c: b.c, h: b.h, w: 12, draw: (g, p, tt, z) => drawHighrise(g, b, p, tt, z) }); }
    // broken pillars around the arena
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .2, c = [Math.cos(a) * 31, 0, Math.sin(a) * 31], h = 3 + r() * 5; const b = { c, w: 1.6, d: 1.6, h, roof: 'flat', wall: '#c8b8a8', seed: 380 + i }; I.push({ c, h, w: 2, draw: (g, p) => drawBuilding(g, b, p, {}) }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };
SETS.jaku = { pal: 'dust', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 6, cloudSeed: 9 }, o)); drawGround(ctx, pal, { col: '#a89684', col2: '#7a6a5a' });
    ctx.strokeStyle = rgba('#6a5a4a', .4); ctx.lineWidth = 1.4; for (let k = 0; k < 22; k++) { const z0 = 10 - k * 8, pts = []; for (let i = -50; i <= 50; i++) pts.push([i * 2, .01, z0 + Math.sin(i * .25 + k * 1.7) * 2.5]); for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } }
    drawRubble(ctx, pal, [CAM.cur.target[0], 0, CAM.cur.target[2] - 10], 30, 50, '#8a7a6e'); }
  const key = 'jaku' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1);
    for (let i = 0; i < 46; i++) { const a = r() * TAU, d = 70 + r() * 260, b = { c: [Math.cos(a) * d, 0, Math.sin(a) * d], w: 10 + r() * 10, d: 10 + r() * 10, h: 10 + r() * 45, seed: 600 + i, ruin: .35 + r() * .55, wall: mixHex('#b0a8a4', '#8a7e78', r()), yaw: r() * .3, dark: .35 }; I.push({ c: b.c, h: b.h, w: b.w, draw: (g, p, tt, z) => drawHighrise(g, b, p, tt, z) }); }
    for (let i = 0; i < 26; i++) { const c = [(r() - .5) * 120, 0, -20 - r() * 90], rr = 1 + r() * 4, sd = 640 + i; I.push({ c, h: rr, draw: (g, p) => drawRock(g, c, rr, p, sd, '#8a7a70') }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (bgPass(o)) for (let i = 0; i < 4 + (o.dmg || 0) * 2; i++) { const r = rng(90 + i); drawSmokeColumn(ctx, [(r() - .5) * 500, 0, -250 - r() * 300], 70 + r() * 60, 14, pal, t, 90 + i, '#9a8a7a'); }
} };
SETS.forest = { pal: 'mist', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 5 }, o)); drawMoonDir(ctx, pal, t, { dir: [.3, .5, -1], r: 80 }); drawGround(ctx, pal, { col: '#2e4234', col2: '#18261c' }); drawGrass(ctx, pal, [CAM.cur.target[0], 0, CAM.cur.target[2]], 18, 700, '#2e5040', t, 7); }
  const key = 'forest' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1);
    for (let i = 0; i < 220; i++) { const c = [(r() - .5) * 220, 0, (r() - .5) * 220]; if (Math.hypot(c[0], c[2]) < 7) continue; const h = 18 + r() * 16, sd = Math.floor(r() * 1e5), col = mixHex('#1e3a2e', '#2e4a3a', r()); I.push({ c, h, w: 3, draw: (g, p, tt, z) => drawCedar(g, c, h, p, sd, col, z) }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (bgPass(o) || o.layer === 'all') { const [a, b] = horizonLine(); const my = (a[1] + b[1]) / 2; const g = ctx.createLinearGradient(0, my - H * .25, 0, my + H * .2); g.addColorStop(0, rgba(pal.fog, 0)); g.addColorStop(.6, rgba(pal.fog, .55)); g.addColorStop(1, rgba(pal.fog, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
} };
SETS.nightstreet = { pal: 'lantern', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 4 }, o)); drawMoonDir(ctx, pal, t, { dir: [-.2, .55, -1], r: 60 }); drawGround(ctx, pal, { col: '#3a3444', col2: '#221e2a' }); drawPaving(ctx, pal, CAM.cur.target, 30, 1.6, { line: '#14101a', alpha: .45 });
    // wet reflections of lanterns
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = -8; i <= 8; i++) for (const sd of [-1, 1]) { const q = project([sd * 6.2, 0, i * 7]); if (!q) continue; ctx.fillStyle = rgba('#ff9a40', .12); ctx.fillRect(q.x - .15 * q.s, q.y, .3 * q.s, 2.5 * q.s); } ctx.restore(); }
  const key = 'nightstreet'; if (!SETCACHE[key]) { const I = [], r = rng(5);
    for (let i = -14; i <= 14; i++) for (const sd of [-1, 1]) { const w = 6.5, b = { c: [sd * 10.5, 0, i * 7.2], w: 7, d: w, h: 6.5 + r() * 1.5, roof: 'gable', rh: 2.2, ov: 1.0, wall: mixHex('#6a4a3a', '#8a6048', r()), base: .4, posts: 1.8, win: true, seed: 900 + i * 3 + sd, winCol: '#ffcf80', yaw: HP }; I.push({ c: b.c, h: b.h, w: 7, d: 7, draw: (g, p) => drawBuilding(g, b, p, {}) });
      const lc = [sd * 6.6, 3.0, i * 7.2 + 1.5]; I.push({ c: lc, h: .5, w: 1, draw: (g, p, tt, z) => drawLantern(g, lc, p, tt, z, { col: i % 3 ? '#e8402a' : '#f0e0c0' }) }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };
SETS.stage = { pal: 'stage', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { ctx.fillStyle = '#b8b6b0'; ctx.fillRect(0, 0, W, H);
    // painted backdrop: grey sky wash + giant ink pine (Karamatsu Shinju), on a flat at z = -30
    const z = -30, Pt = (x, y) => proj2([x, y, z]); const bd = projPoly([[-60, 0, z], [60, 0, z], [60, 40, z], [-60, 40, z]]); if (bd.length > 2) { polyPath(ctx, bd); ctx.fillStyle = '#cfccc4'; ctx.fill(); }
    ctx.lineCap = 'round'; const trunk = [[-14, 0], [-12, 6], [-15, 12], [-9, 18], [-4, 22], [4, 24]].map(([x, y]) => Pt(x, y)); polyPath(ctx, catmull(trunk, false, 4), false); ctx.lineWidth = 1.4 * (CAM.cur.f / Math.max(5, camDepth([0, 10, z]))); ctx.strokeStyle = '#2a2622'; ctx.stroke();
    for (const [x, y, w] of [[-18, 14, 9], [-6, 20, 11], [6, 23, 12], [14, 18, 8], [-22, 9, 7]]) { const c = Pt(x, y), s = CAM.cur.f / Math.max(5, camDepth([x, y, z])); ctx.fillStyle = '#4a5a48'; for (let k = 0; k < 5; k++) { blobPath(ctx, c[0] + (k - 2) * w * .22 * s, c[1] - (k % 2) * s * .5, w * .16 * s, x * 7 + k, 10, .2); ctx.fill(); } ctx.fillStyle = '#2a3a2a'; ctx.fillRect(c[0] - w * .45 * s, c[1] + s * .2, w * .9 * s, s * .15); }
    // stage floor (planks)
    drawGround(ctx, pal, { col: '#8a7258', col2: '#5a4a38' }); ctx.strokeStyle = rgba('#3a2a1e', .5); ctx.lineWidth = 1.2; for (let x = -40; x <= 40; x += 1.2) for (const r of projLine([[x, .003, -30], [x, .003, 30]])) { polyPath(ctx, r, false); ctx.stroke(); }
    // curtains left/right (red-white-black stripes)
    for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) { const x0 = sd * (22 + i * 1.4), q = projPoly([[x0, 0, -12], [x0 + sd * 1.4, 0, -12], [x0 + sd * 1.4, 22, -12], [x0, 22, -12]]); if (q.length > 2) { polyPath(ctx, q); ctx.fillStyle = ['#2a1a1a', '#d8d2c4', '#8a1a1a'][i % 3]; ctx.fill(); } } }
} };
SETS.underwater = { pal: 'deep', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 0, cirrus: false }, o)); drawGround(ctx, pal, { col: '#2a4a4a', col2: '#12282a' });
    // caustics on the floor
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = rgba('#8ae8f0', .18); ctx.lineWidth = 2; for (let i = 0; i < 60; i++) { const r = rng(i * 7); const c = [CAM.cur.target[0] + (r() - .5) * 40, .01, CAM.cur.target[2] + (r() - .5) * 40]; const pts = []; for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU; pts.push([c[0] + Math.cos(a) * (1 + .3 * Math.sin(a * 3 + t * 2 + i)), .01, c[2] + Math.sin(a) * (1 + .3 * Math.cos(a * 2 + t * 1.7))]); } for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } }
    // light shafts from the surface
    for (let i = 0; i < 9; i++) { const x = (i - 4) * 9 + Math.sin(t * .3 + i) * 2, a = project([x, 60, -30]), b = project([x + 6, 0, -10]); if (!a || !b) continue; const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y); g.addColorStop(0, 'rgba(160,240,255,.22)'); g.addColorStop(1, 'rgba(160,240,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a.x - 20, a.y); ctx.lineTo(a.x + 20, a.y); ctx.lineTo(b.x + 140, b.y); ctx.lineTo(b.x - 60, b.y); ctx.fill(); } ctx.restore();
    drawRubble(ctx, pal, [CAM.cur.target[0], 0, CAM.cur.target[2] - 15], 40, 30, '#3a5a5a', 33); }
  if (o.layer !== 'bg') { ctx.save(); ctx.strokeStyle = 'rgba(200,250,255,.6)'; ctx.lineWidth = 1.2; for (let i = 0; i < 60; i++) { const u = (t * (.15 + hash(i) * .2) + hash(i * 3)) % 1; const q = project([CAM.cur.target[0] + (hash(i * 5) - .5) * 14, u * 8, CAM.cur.target[2] + (hash(i * 7) - .5) * 14]); if (!q) continue; ctx.beginPath(); ctx.arc(q.x + Math.sin(t * 3 + i) * 3, q.y, Math.max(1, .05 * q.s * (.5 + hash(i * 9))), 0, TAU); ctx.stroke(); } ctx.restore(); }
} };
SETS.cliff = { pal: 'dawn', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 10, cloudSeed: 23 }, o)); drawSunDisk(ctx, pal, [0, o.sunUp == null ? -.01 : o.sunUp, -1], { r: 190, col: '#fff2c8', glow: '#ffb060' });
    // ocean plane below the cliff edge with glitter path toward the sun
    const sea = projPoly([[-3000, -40, -3000], [3000, -40, -3000], [3000, -40, -8], [-3000, -40, -8]]); if (sea.length > 2) { polyPath(ctx, sea); const [a, b] = horizonLine(); const my = (a[1] + b[1]) / 2; const g = ctx.createLinearGradient(0, my, 0, H); g.addColorStop(0, mixHex(pal.skyLow, '#3a4a7a', .3)); g.addColorStop(1, '#1a2448'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'screen'; const sp = project(vAdd(CAM.cur.pos, [0, -4000 * .01, -4000])); if (sp) for (let i = 0; i < 80; i++) { const y = my + Math.pow(hash(i), 2) * (H - my), w = (10 + 60 * hash(i * 3)) * (1 + (y - my) / H * 4); ctx.fillStyle = rgba('#ffe0a0', .5 * (1 - (y - my) / H)); ctx.fillRect(sp.x - w / 2 + (hash(i * 5) - .5) * (y - my) * .6 + Math.sin(t * 2 + i) * 4, y, w, 2); } ctx.restore(); }
    // cliff top: grassy rock plateau ending at z = -8
    const top = projPoly([[-60, 0, -8], [60, 0, -8], [60, 0, 60], [-60, 0, 60]]); if (top.length > 2) { polyPath(ctx, top); const gg = ctx.createLinearGradient(0, H * .5, 0, H); gg.addColorStop(0, '#7a7a5a'); gg.addColorStop(1, '#4a5038'); ctx.fillStyle = gg; ctx.fill(); }
    const edge = []; for (let i = -30; i <= 30; i++) edge.push([i * 2, 0, -8 + Math.sin(i * .9) * .6]); const face = edge.map(p => p).concat(edge.slice().reverse().map(p => [p[0], -40, p[2] - 3])); const fp = projPoly(face); if (fp.length > 2) { polyPath(ctx, fp); ctx.fillStyle = '#3a3438'; ctx.fill(); }
    drawGrass(ctx, pal, [CAM.cur.target[0], 0, Math.max(-4, CAM.cur.target[2])], 14, 600, '#6a7a4a', t, 9);
    for (let i = 0; i < 10; i++) { const r = rng(70 + i); drawRock(ctx, [(r() - .5) * 40, 0, -5 + r() * 25], .3 + r() * 1.2, pal, 70 + i, '#6a6058'); } }
} };
SETS.skyhigh = { pal: 'highsky', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 20, cloudHigh: 1.6 }, o)); drawCloudSea(ctx, pal, t, o.seaY == null ? -25 : o.seaY); }
} };
