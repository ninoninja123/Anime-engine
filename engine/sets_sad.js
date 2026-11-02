/* engine/sets_sad.js (agent E) - painted gouache sets for Shinji / Aizen / Dazai.  Real 3D geometry -> true parallax; sky / far / mid / near
   layers; foreground props via f.fg({ set, zSplit }).  Every set has a default palette (SETS[name].pal) and a GRADES preset (std(f, {pal})).
   SETS (default palette):
     yokohama   (harbor)    Yokohama harbour at night: quay, red-brick warehouses, gantry cranes, container stacks, lamp posts, black water
                            with light reflections, Minato Mirai skyline (tower, sail hotel, ferris wheel) far across the bay.  o.fogK
     lasnoches  (hueco)     Hueco Mundo: white sand dunes under a black sky and a huge crescent moon, white quartz trees, the Las Noches dome
                            with towers on the horizon, drifting sand.  o.moonR
     dojo       (dojo)      empty dojo / library hall at dusk: plank floor, pillars, shoji walls, tall bookshelves, scrolls, light shafts, dust
     mirror     (mirror)    the mirror world of Kyoka Suigetsu: a lilac void, perfectly reflective water floor (ripples), floating mirror shards,
                            reflected moon; o.shards count, o.crack 0..1 cracks in the sky
     sakasama   (inverted)  Sakanade's inverted world: the sky is BELOW (clouds under the feet, a glass floor), the city hangs from above
                            (upside-down roofs and towers), pink mist.  o.flip 0..1 eases it in (0 = city still on the ground)
     arena      (arena)     round stone arena whose floor tiles change surface in a wave: o.surf 'stone'|'sand'|'mirror'|'black'|'water'
                            (target), o.from (start surface), o.phase 0..1 (wave front from the centre outward), o.dmg cracks
     rooftops   (seirei_night / dusk)  Seireitei roofs = built-in set 'rooftops' with the new palette 'seirei_night'
   PALETTES added: harbor hueco dojo mirror inverted arena seirei_night.                                                        */
'use strict';
Object.assign(PALETTES, {
  harbor: { skyTop: '#04060f', skyMid: '#101a38', skyLow: '#3a3a5a', fog: '#2a2e4a', sun: [.35, .55, .5], ground: '#3a3a44', ground2: '#22222a', wall: '#8a4a3a', wallShade: '#3a1e1e', roof: '#2a2a32', roofShade: '#16161c', wood: '#3a2a22', cloud: '#2a3050', cloudShade: '#141830', haze: .45, line: '#08080e', amb: '#8aa0d8', stars: true },
  hueco: { skyTop: '#020208', skyMid: '#0a0c1e', skyLow: '#26283e', fog: '#3a3c52', sun: [-.4, .5, -.6], ground: '#d4d2e2', ground2: '#9a98b4', wall: '#f2f0f4', wallShade: '#9a98b0', roof: '#d8d6e0', roofShade: '#8a88a0', wood: '#cfcde0', cloud: '#2a2c40', cloudShade: '#12121e', haze: .5, line: '#2a283a', amb: '#c8c8f0', stars: true },
  dojo: { skyTop: '#3a2a22', skyMid: '#7a5a3a', skyLow: '#e8b878', fog: '#c89a6a', sun: [.6, .5, .3], ground: '#8a6440', ground2: '#5a3e24', wall: '#e8dcc0', wallShade: '#8a7458', roof: '#4a3222', roofShade: '#2a1a12', wood: '#6a4426', cloud: '#e8c8a0', cloudShade: '#8a6a4a', haze: .4, line: '#2a1a10', amb: '#ffd8a8' },
  mirror: { skyTop: '#1a1236', skyMid: '#6a5aa8', skyLow: '#e8d8ff', fog: '#c8b8ee', sun: [-.3, .6, -.6], ground: '#b8a8e0', ground2: '#5a4a90', wall: '#f0e8ff', wallShade: '#8a7ab8', roof: '#3a2a6a', roofShade: '#22184a', wood: '#5a4a8a', cloud: '#f0e8ff', cloudShade: '#8a7ac0', haze: .6, line: '#2a1a4a', amb: '#e0d0ff' },
  inverted: { skyTop: '#2a3a8a', skyMid: '#8a9ae0', skyLow: '#ffd8ec', fog: '#ffc8e0', sun: [.3, -.6, .4], ground: '#8a7a8a', ground2: '#5a4a5a', wall: '#e8d8d0', wallShade: '#8a6a7a', roof: '#3a2a3a', roofShade: '#221a26', wood: '#5a3a3a', cloud: '#ffffff', cloudShade: '#c8a8d8', haze: .5, line: '#2a1a2a', amb: '#ffd0e8' },
  arena: { skyTop: '#1a1a3a', skyMid: '#7a4a6a', skyLow: '#f0a070', fog: '#d89a8a', sun: [-.5, .35, -.5], ground: '#9a8a7a', ground2: '#6a5a4e', wall: '#c8b8a4', wallShade: '#6a5a5e', roof: '#3a3040', roofShade: '#221c28', wood: '#4a3830', cloud: '#ffc8a0', cloudShade: '#7a4a6a', haze: .5, line: '#2a2026', amb: '#ffc8a8' },
  seirei_night: { skyTop: '#060a1c', skyMid: '#16224a', skyLow: '#4a4a74', fog: '#3a3c62', sun: [.4, .6, -.4], ground: '#4a4a5a', ground2: '#2a2a36', wall: '#c8c4d0', wallShade: '#5a5670', roof: '#2a2a3e', roofShade: '#16161e', wood: '#3a2e30', cloud: '#3a4068', cloudShade: '#1a1e38', haze: .45, line: '#0a0a14', amb: '#a0b0e8', stars: true },
});
Object.assign(GRADES, {
  harbor: { sat: 1.0, contrast: 1.1, tint: ['#9aa8e0', .18], lift: ['#1a1a3a', .06] }, hueco: { sat: .9, contrast: 1.12, tint: ['#d8d8f8', .12] },
  dojo: { sat: 1.08, contrast: 1.06, tint: ['#ffd8b0', .2], lift: ['#3a2010', .05] }, mirror: { sat: 1.05, contrast: 1.04, tint: ['#e0d0ff', .18], lift: ['#3a2a6a', .06] },
  inverted: { sat: 1.12, contrast: 1.05, tint: ['#ffd0e8', .2] }, arena: { sat: 1.1, contrast: 1.08, tint: ['#ffd0b0', .2], lift: ['#3a1a40', .06] }, seirei_night: { sat: .95, contrast: 1.1, tint: ['#9aa8e0', .22] },
});
// ------------------------------------------------------------------------------------------------ helpers
function sadPoly(ctx, pts, col, ink = 0, inkCol) { const sp = projPoly(pts); if (sp.length < 3) return null; polyPath(ctx, sp); ctx.fillStyle = col; ctx.fill(); if (ink) { ctx.lineWidth = ink; ctx.strokeStyle = inkCol || 'rgba(10,8,14,.75)'; ctx.lineJoin = 'round'; ctx.stroke(); } return sp; }
function sadInkW(p, k = 1) { const q = project(p); return q ? clamp(q.s * .012 * k, .6, 3) : 1; }
// lit box (visible faces only), key light from the palette sun
function sadBox3(ctx, c, w, d, h, col, pal, o = {}) {
  const yaw = o.yaw || 0, M = mRotY(yaw), hw = w / 2, hd = d / 2, y0 = c[1] || 0, P = (x, y, z) => vAdd([c[0], y0, c[2]], mApply(M, [x, y, z]));
  const L = vNorm(pal.sun || [.4, .6, .5]), faces = [[[hw, 0, -hd], [hw, 0, hd], [hw, h, hd], [hw, h, -hd], [1, 0, 0]], [[-hw, 0, hd], [-hw, 0, -hd], [-hw, h, -hd], [-hw, h, hd], [-1, 0, 0]], [[-hw, 0, hd], [hw, 0, hd], [hw, h, hd], [-hw, h, hd], [0, 0, 1]], [[hw, 0, -hd], [-hw, 0, -hd], [-hw, h, -hd], [hw, h, -hd], [0, 0, -1]], [[-hw, h, -hd], [hw, h, -hd], [hw, h, hd], [-hw, h, hd], [0, 1, 0]]];
  const out = []; for (const f of faces) { const n = mApply(M, f[4]), ctr = P(f[0][0] * .5 + f[2][0] * .5, (f[0][1] + f[2][1]) / 2, f[0][2] * .5 + f[2][2] * .5); if (vDot(n, toCam(ctr)) <= 0) continue; const lit = vDot(n, L);
    const colF = f[4][1] ? (o.top || shadeHex(col, .08)) : lit > .15 ? col : shadeHex(col, lit > -.2 ? -.22 : -.38); const sp = sadPoly(ctx, f.slice(0, 4).map(q => P(...q)), colF, sadInkW(ctr, .8)); out.push({ f, sp, n, P }); if (o.face && sp) o.face(ctx, f, P, n, lit); }
  return out;
}
function sadWater(ctx, pal, y, col, col2, o = {}) { // flat water plane to the horizon (+ light streak reflections drawn by the caller)
  const cam = CAM.cur, R = 3000, c = [cam.pos[0], y, cam.pos[2]]; const sp = projPoly([[c[0] - R, y, c[2] - R], [c[0] + R, y, c[2] - R], [c[0] + R, y, c[2] + R], [c[0] - R, y, c[2] + R]]); if (sp.length < 3) return null;
  const [a, b] = horizonLine(cam), my = (a[1] + b[1]) / 2, g = ctx.createLinearGradient(0, my, 0, H); g.addColorStop(0, mixHex(col, pal.fog, .5)); g.addColorStop(.3, col); g.addColorStop(1, col2); polyPath(ctx, sp); ctx.fillStyle = g; ctx.fill(); return sp;
}
function sadReflect(ctx, p, w, len, col, a, t, seed = 0) { // vertical shimmering reflection streak under a light at p (on water y = 0)
  const q0 = project([p[0], 0, p[2]]), q1 = project([p[0], -p[1] * .9, p[2]]); if (!q0 || !q1) return; const W2 = Math.max(2, w * q0.s);
  for (let i = 0; i < 8; i++) { const v = i / 8, y = lerp(q0.y, q0.y + (q1.y - q0.y) * len, v), dx = Math.sin(t * 2 + i * 1.7 + seed) * W2 * .6; ctx.fillStyle = rgba(col, a * (1 - v)); ctx.fillRect(q0.x - W2 / 2 + dx, y, W2 * (1 - v * .5), Math.max(1.5, (q1.y - q0.y) * len / 10)); }
}
// ================================================================================================ YOKOHAMA HARBOUR
function sadCrane(ctx, c, h, yaw, pal, z) { // container gantry crane: 4 legs, boom over the water
  const M = mRotY(yaw), P = (x, y, zz) => vAdd(c, mApply(M, [x, y, zz])), col = '#5a6a7a', lw = sadInkW(P(0, h * .5, 0), .7);
  ctx.lineCap = 'butt'; const line = (a, b, w) => { const pa = project(a), pb = project(b); if (!pa || !pb) return; ctx.lineWidth = Math.max(1, w * (pa.s + pb.s) / 2); ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); };
  for (const [x, zz] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) line(P(x, 0, zz), P(x * .8, h, zz), .45);
  line(P(-5, h, -3), P(5, h, -3), .6); line(P(-5, h, 3), P(5, h, 3), .6); line(P(-5, h * 1.08, 0), P(5, h * 1.08, 0), .8); line(P(0, h * 1.08, -22), P(0, h * 1.08, 12), .9); line(P(0, h * 1.5, 0), P(0, h * 1.08, -22), .25); line(P(0, h * 1.5, 0), P(0, h * 1.08, 12), .25); line(P(0, h * 1.08, 0), P(0, h * 1.5, 0), .5);
  const lamp = project(P(0, h * 1.5, 0)); if (lamp) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, lamp.x, lamp.y, 2 * lamp.s, '#ff4a3a', .8); ctx.restore(); }
}
function sadWarehouse(ctx, b, pal, t) { // red-brick warehouse (Akarenga style): brick box, white stone bands per floor, tall ARCHED windows (few lit), dark roof
  sadBox3(ctx, b.c, b.w, b.d, b.h, b.col || '#8a3e2e', pal, { yaw: b.yaw || 0, top: '#3a3036', face: (c, f, P, n, lit) => { if (f[4][1]) return; const along = Math.abs(f[4][0]) ? b.d : b.w, cols = Math.max(2, Math.floor(along / 3.2)), floors = Math.max(1, Math.floor(b.h / 4.2));
    const A0 = P(...f[0]), A1 = P(...f[1]), out = vMul(n, .02), at = (u, y) => vAdd(vAdd(vLerp(A0, A1, u), [0, y, 0]), out);
    for (let fl = 0; fl <= floors; fl++) { const y = fl * 4.2 + .1; sadPoly(c, [at(0, y), at(1, y), at(1, y + .28), at(0, y + .28)], '#e8dcc8'); }                       // stone bands
    for (let fl = 0; fl < floors; fl++) for (let i = 0; i < cols; i++) { const u = (i + .5) / cols, hw = .55 / along, y0 = fl * 4.2 + 1.0, y1 = y0 + 2.3, on = hash(b.seed + fl * 13 + i * 7) < .14, pts = [];
      pts.push(at(u - hw, y0), at(u + hw, y0), at(u + hw, y1)); for (let k = 1; k < 6; k++) { const a = k / 6 * Math.PI; pts.push(at(u + Math.cos(a) * hw, y1 + Math.sin(a) * .5)); } pts.push(at(u - hw, y1));
      sadPoly(c, pts, on ? '#ffc870' : '#141218', .7, '#3a1a14'); const mul = vLerp(at(u, y0), at(u, y1 + .5), .5); for (const rn of projLine([at(u, y0), at(u, y1 + .5)])) { polyPath(c, rn, false); c.lineWidth = 1; c.strokeStyle = on ? '#a86a30' : '#2a2226'; c.stroke(); }
      if (on) { const q = project(mul); if (q) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, q.x, q.y, 2 * q.s, '#ffb050', .3); c.restore(); } } }
    if (sadInkW(A0) > .8) { c.strokeStyle = 'rgba(40,10,8,.18)'; c.lineWidth = 1; for (let y = .6; y < b.h; y += .45) for (const rn of projLine([at(0, y), at(1, y)])) { polyPath(c, rn, false); c.stroke(); } } } });   // brick courses
}
function sadSkyline(ctx, pal, t, wf = 0) { // Minato Mirai across the bay: tall tower, sail hotel, ferris wheel (Cosmo Clock), lit windows, all at z ~ -900
  const Z = -900, base = 0, col = '#141a30', lit = '#ffd890';
  const blds = [[-420, 60, 80], [-330, 40, 110], [-250, 70, 296], [-170, 50, 140], [-90, 60, 90], [30, 40, 120], [120, 70, 100], [260, 50, 160], [360, 80, 70], [480, 60, 130], [-560, 70, 90]];
  for (const [x, w, h] of blds) { const sp = sadPoly(ctx, [[x - w / 2, base, Z], [x + w / 2, base, Z], [x + w / 2 * .8, h, Z], [x - w / 2 * .8, h, Z]], h > 250 ? '#1a2240' : col); if (!sp) continue; ctx.fillStyle = lit; for (let i = 0; i < h / 5; i++) { if (hash(x + i * 3) < .55) continue; const q = project([x + (hash(i * 7 + x) - .5) * w * .7, 4 + hash(i * 11 + x) * (h - 8), Z]); if (q) ctx.fillRect(q.x, q.y, Math.max(1, q.s * 2.2), Math.max(1, q.s * 1.2)); } }
  // sail hotel
  sadPoly(ctx, [[180, 0, Z + 20], [215, 0, Z + 20], [205, 110, Z + 20], [192, 118, Z + 20]], '#2a3256');
  // ferris wheel (Cosmo Clock 21): rim + spokes + coloured lights
  const ang = -easeIn(clamp(wf, 0, 1)) * 1.35, base0 = [-20, 0, Z + 60], RT = p => { const dx = p[0] - base0[0], dy = p[1] - base0[1]; return [base0[0] + dx * Math.cos(ang) - dy * Math.sin(ang), base0[1] + dx * Math.sin(ang) + dy * Math.cos(ang), p[2]]; };   // wf: the wheel tips over
  const fc = RT([-20, 55, Z + 60]), R = 50, rim = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU + t * .02; rim.push(RT([-20 + Math.cos(a) * R, 55 + Math.sin(a) * R, Z + 60])); }
  for (const rn of projLine(rim)) { polyPath(ctx, rn, false); ctx.lineWidth = 2; ctx.strokeStyle = '#3a4a7a'; ctx.stroke(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 48; i += 2) { const q = project(rim[i]); if (q) { ctx.fillStyle = ['#ff6a8a', '#6ae0ff', '#ffe06a', '#9aff8a'][(i / 2) % 4]; ctx.fillRect(q.x - 1.5, q.y - 1.5, 3, 3); } } ctx.restore();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, pa = project(fc), pb = project(rim[i * 4]); if (!pa || !pb) continue; ctx.lineWidth = 1; ctx.strokeStyle = '#2a3460'; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); }
  const leg = projPoly([RT([-45, 0, Z + 60]), RT([5, 0, Z + 60]), RT([-17, 55, Z + 60]), RT([-23, 55, Z + 60])]); if (leg.length > 2) { polyPath(ctx, leg); ctx.fillStyle = '#1a2240'; ctx.fill(); }
}
SETS.yokohama = { pal: 'harbor', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 6, cloudSeed: 41 }, o)); drawMoonDir(ctx, pal, t, { dir: o.moonDir || [-.35, .42, -1], r: o.moonR || 70, glow: '#9ab0ff' });
    sadWater(ctx, pal, -1.2, '#141a30', '#05070e'); sadSkyline(ctx, pal, t, o.wheelFall || 0);
    // skyline + lamp reflections on the black water
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 40; i++) { const x = -600 + i * 30 + hash(i) * 20; sadReflect(ctx, [x, 40 + hash(i * 3) * 80, -880], 4, 1, hash(i * 5) < .3 ? '#ff8a6a' : '#ffd890', .35, t, i); } ctx.restore();
    // quay: concrete apron in front of the water edge (z > -14)
    sadPoly(ctx, [[-400, 0, -14], [400, 0, -14], [400, 0, 400], [-400, 0, 400]], '#4a4a54'); sadPoly(ctx, [[-400, 0, -14], [400, 0, -14], [400, -1.2, -14], [-400, -1.2, -14]], '#2a2a32');
    ctx.strokeStyle = rgba('#e8c84a', .5); ctx.lineWidth = 2; for (const rn of projLine([[-200, .01, -12.8], [200, .01, -12.8]])) { polyPath(ctx, rn, false); ctx.stroke(); }
    drawPaving(ctx, pal, CAM.cur.target, 40, 4, { line: '#1a1a22', alpha: .35 });
    // wet sheen + lamp pools
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = -6; i <= 6; i++) { const q = project([i * 12, 0, -8]); if (q) glow(ctx, q.x, q.y, 6 * q.s, '#ffc880', .18); } ctx.restore(); }
  const key = 'yoko' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1);
    for (let i = 0; i < 6; i++) { const b = { c: [-60 + i * 26 + (r() - .5) * 4, 0, 24 + r() * 6], w: 20, d: 12, h: 10 + r() * 4, seed: 300 + i, col: mixHex('#8a3e2e', '#6a2e24', r()) }; I.push({ c: b.c, h: b.h, w: 20, d: 12, draw: (g, p, tt) => sadWarehouse(g, b, p, tt) }); }
    for (let i = 0; i < 26; i++) { const c = [(r() - .5) * 120, 0, 6 + r() * 14], w = 2.4, d = 6, stack = 1 + Math.floor(r() * 3), yaw = r() < .5 ? 0 : HP, cols = ['#a83a2a', '#2a5a8a', '#3a7a4a', '#c88a2a', '#5a5a6a'];
      if (Math.abs(c[0]) < 10 && c[2] < 12) continue; I.push({ c, h: stack * 2.6, w: 6, d: 6, draw: (g, p) => { if (camDepth([c[0], 1.3, c[2]]) < 4.5) return; for (let s = 0; s < stack; s++) sadBox3(g, [c[0], s * 2.6, c[2]], w, d, 2.6, cols[(i + s) % 5], p, { yaw, face: (cc, f, P, n) => { if (f[4][1]) return; for (let k = 1; k < 8; k++) { const a = vLerp(P(...f[0]), P(...f[1]), k / 8), b = vAdd(a, [0, 2.6, 0]); for (const rn of projLine([a, b])) { polyPath(cc, rn, false); cc.lineWidth = 1; cc.strokeStyle = 'rgba(0,0,0,.25)'; cc.stroke(); } } } }); } }); }
    for (let i = 0; i < 3; i++) { const c = [-70 + i * 60, 0, -11]; I.push({ c, h: 30, w: 10, d: 30, draw: (g, p, tt, z) => sadCrane(g, c, 24, HP + (i - 1) * .1, p, z) }); }
    for (let i = -6; i <= 6; i++) { const c = [i * 14 + 5, 0, -10], top = [c[0], 6, c[2]]; I.push({ c, h: 6, w: 1, d: 1, draw: (g, p, tt) => { const a = project(c), b = project(top); if (!a || !b) return; g.lineWidth = Math.max(1, .12 * a.s); g.strokeStyle = '#1a1a22'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.save(); g.globalCompositeOperation = 'screen'; glow(g, b.x, b.y, 1.6 * b.s, '#ffd890', .7); glow(g, b.x, b.y, .3 * b.s, '#ffffff', .9); g.restore(); } }); }
    for (let i = -12; i <= 12; i++) { const c = [i * 6, 0, -13.4]; I.push({ c, h: .6, w: .5, d: .5, draw: (g, p) => sadBox3(g, c, .45, .45, .55, '#2a2a30', p) }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (bgPass(o) && (o.fogK == null || o.fogK > 0)) { const [a, b] = horizonLine(); const my = (a[1] + b[1]) / 2, g = ctx.createLinearGradient(0, my - 120, 0, my + 80); g.addColorStop(0, rgba(pal.fog, 0)); g.addColorStop(.6, rgba(pal.fog, .35 * (o.fogK || 1))); g.addColorStop(1, rgba(pal.fog, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
} };
// ================================================================================================ HUECO MUNDO / LAS NOCHES
function sadQuartzTree(ctx, c, h, seed) { // white crystalline dead tree: angular trunk, branching shards
  const r = rng(seed), segs = []; const grow = (p, d, L, depth) => { const e = vAdd(p, vMul(d, L)); segs.push([p, e, depth]); if (depth > 3) return; const n = 2 + Math.floor(r() * 2); for (let i = 0; i < n; i++) { const nd = vNorm(vAdd(d, [(r() - .5) * 1.4, .3 + r() * .4, (r() - .5) * 1.4])); grow(e, nd, L * (.55 + r() * .2), depth + 1); } };
  grow(c, [0, 1, 0], h * .45, 0);
  for (const [a, b, dpt] of segs) { const pa = project(a), pb = project(b); if (!pa || !pb) continue; const w = Math.max(1, (.35 / (dpt + 1)) * h * .08 * pa.s); ctx.lineCap = 'round'; ctx.lineWidth = w + 2; ctx.strokeStyle = '#5a5870'; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = dpt % 2 ? '#e8e6f2' : '#cfcde0'; ctx.stroke(); }
}
SETS.lasnoches = { pal: 'hueco', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 0, cirrus: false }, o));
    // huge crescent moon
    const cam = CAM.cur, mp = project(vAdd(cam.pos, vMul(vNorm(o.moonDir || [.45, .38, -1]), 4000))); if (mp) { const R = (o.moonR || 210) * cam.f / 1000; ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, mp.x, mp.y, R * 3, '#b8c0ff', .3); ctx.restore(); ctx.save(); ctx.beginPath(); ctx.arc(mp.x, mp.y, R, 0, TAU); ctx.arc(mp.x + R * .42, mp.y - R * .18, R * .92, 0, TAU, true); ctx.fillStyle = '#f6f4ff'; ctx.fill('evenodd'); ctx.restore(); }
    // far dunes + Las Noches dome on the horizon
    const Z = -1200; for (let k = 0; k < 3; k++) { const pts = [[-3000, -2, Z + k * 300]]; for (let i = -30; i <= 30; i++) pts.push([i * 100, 18 + 14 * Math.sin(i * .7 + k * 2) + 8 * Math.sin(i * 1.9), Z + k * 300]); pts.push([3000, -2, Z + k * 300]); sadPoly(ctx, pts, mixHex('#d8d6e6', pal.fog, .55 - k * .15)); }
    const dc = [-200, 0, -1600]; const dome = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; dome.push([dc[0] + Math.cos(a) * 260, Math.sin(a) * 120, dc[2]]); } sadPoly(ctx, dome, '#eeeef6', 1.2, '#7a7890');
    for (const [dx, h] of [[-300, 190], [-240, 230], [-150, 200], [-60, 170], [60, 150], [200, 120]]) sadPoly(ctx, [[dc[0] + dx - 8, 0, dc[2] - 20], [dc[0] + dx + 8, 0, dc[2] - 20], [dc[0] + dx + 5, h, dc[2] - 20], [dc[0] + dx - 5, h, dc[2] - 20]], '#f4f4fa', 1, '#7a7890');
    drawGround(ctx, pal, { col: '#d4d2e2', col2: '#9a98b4' });
    // dune ridges with blue shadow sides
    for (let k = 0; k < 14; k++) { const z0 = 8 - k * 14, pts = []; for (let i = -40; i <= 40; i++) pts.push([i * 2.5, .02, z0 + Math.sin(i * .25 + k * 1.3) * 3]); const sh = pts.concat(pts.slice().reverse().map(p => [p[0], .02, p[2] - 3.5])); sadPoly(ctx, sh, rgba('#9a98c0', .35)); for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba('#7a78a0', .5); ctx.stroke(); } } }
  const key = 'hueco' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1);
    for (let i = 0; i < 40; i++) { const a = r() * TAU, d = 14 + r() * 120, c = [Math.cos(a) * d, 0, Math.sin(a) * d], h = 4 + r() * 6, sd = 900 + i; I.push({ c, h, w: 3, draw: (g) => sadQuartzTree(g, c, h, sd) }); }
    for (let i = 0; i < 30; i++) { const c = [(r() - .5) * 140, 0, (r() - .5) * 140], rr = .4 + r() * 1.4, sd = 950 + i; I.push({ c, h: rr, draw: (g, p) => drawRock(g, c, rr, p, sd, '#d8d6e4') }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (o.layer !== 'bg') { ctx.save(); ctx.fillStyle = 'rgba(240,240,255,.5)'; for (let i = 0; i < 70; i++) { const u = (t * (.3 + hash(i) * .4) + hash(i * 3)) % 1, q = project([CAM.cur.target[0] - 10 + u * 20, .2 + hash(i * 5) * 1.5, CAM.cur.target[2] + (hash(i * 7) - .5) * 14]); if (q) ctx.fillRect(q.x, q.y, Math.max(1, .04 * q.s), Math.max(1, .015 * q.s)); } ctx.restore(); }
} };
// ================================================================================================ DOJO / LIBRARY
SETS.dojo = { pal: 'dojo', draw(ctx, t, o) {
  const pal = o.pal, Rw = 14, Hh = 7;
  if (bgPass(o)) { ctx.fillStyle = '#3a2618'; ctx.fillRect(0, 0, W, H);
    // floor planks
    sadPoly(ctx, [[-Rw, 0, -Rw], [Rw, 0, -Rw], [Rw, 0, Rw], [-Rw, 0, Rw]], '#8a6440'); ctx.strokeStyle = rgba('#4a3018', .55); ctx.lineWidth = 1.2; for (let x = -Rw; x <= Rw; x += 1.1) for (const rn of projLine([[x, .003, -Rw], [x, .003, Rw]])) { polyPath(ctx, rn, false); ctx.stroke(); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 5; i++) { const p0 = project([-Rw + 3 + i * 6, .01, -2 + i]); if (p0) glow(ctx, p0.x, p0.y, 5 * p0.s, '#ffd8a0', .18); } ctx.restore();
    // walls: shoji panels (paper + lattice) on three sides, bookshelves on the left
    const walls = [[[-Rw, 0, -Rw], [Rw, 0, -Rw]], [[Rw, 0, -Rw], [Rw, 0, Rw]], [[-Rw, 0, Rw], [-Rw, 0, -Rw]], [[Rw, 0, Rw], [-Rw, 0, Rw]]];
    walls.forEach(([a, b], wi) => { const n = vNorm(vCross(vSub(b, a), [0, 1, 0])); if (vDot(n, toCam(vLerp(a, b, .5))) > 0) {} sadPoly(ctx, [a, b, vAdd(b, [0, Hh, 0]), vAdd(a, [0, Hh, 0])], wi === 2 ? '#4a301e' : '#e8dcc0');
      const cols = 8; for (let i = 0; i <= cols; i++) { const p = vLerp(a, b, i / cols); for (const rn of projLine([p, vAdd(p, [0, Hh, 0])])) { polyPath(ctx, rn, false); ctx.lineWidth = i % 2 ? 1.2 : 4; ctx.strokeStyle = '#4a301e'; ctx.stroke(); } }
      if (wi !== 2) for (let y = 1; y < Hh; y += .9) for (const rn of projLine([vAdd(a, [0, y, 0]), vAdd(b, [0, y, 0])])) { polyPath(ctx, rn, false); ctx.lineWidth = 1; ctx.strokeStyle = rgba('#6a4a2e', .7); ctx.stroke(); }
      else { for (let y = .5; y < Hh; y += 1.1) for (let i = 0; i < 40; i++) { const u0 = i / 40, p0 = vAdd(vLerp(a, b, u0), [.3, y, 0]), p1 = vAdd(vLerp(a, b, u0 + .02), [.3, y + .7 + .2 * hash(i + y * 9), 0]); sadPoly(ctx, [p0, [p0[0], p0[1], p1[2]], [p0[0], p1[1], p1[2]], [p0[0], p1[1], p0[2]]], ['#8a2a22', '#2a4a6a', '#c8a050', '#3a5a3a', '#5a3a5a'][Math.floor(hash(i * 7 + y * 3) * 5)]); } } });
    // ceiling beams + high windows with light shafts
    for (let i = -3; i <= 3; i++) { const z = i * 4; sadPoly(ctx, [[-Rw, Hh, z - .2], [Rw, Hh, z - .2], [Rw, Hh - .5, z - .2], [-Rw, Hh - .5, z - .2]], '#3a2414'); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 4; i++) { const a = project([Rw, Hh - .5, -8 + i * 5]), b = project([Rw - 9, 0, -10 + i * 5]); if (!a || !b) continue; const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y); g.addColorStop(0, 'rgba(255,220,160,.35)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a.x, a.y - 20); ctx.lineTo(a.x, a.y + 30); ctx.lineTo(b.x + 60, b.y); ctx.lineTo(b.x - 60, b.y); ctx.fill(); } ctx.restore();
    // hanging scroll + pillars
    sadPoly(ctx, [[-2, 2, -Rw + .05], [2, 2, -Rw + .05], [2, 6, -Rw + .05], [-2, 6, -Rw + .05]], '#f2ead8', 1.2); const sq = project([0, 4.1, -Rw + .1]); if (sq) { ctx.fillStyle = '#1a1210'; ctx.font = `900 ${Math.max(8, 1.6 * sq.s)}px "IPAMincho", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('心', sq.x, sq.y); } }
  const key = 'dojo'; if (!SETCACHE[key]) { const I = []; for (const x of [-9, 9]) for (const z of [-9, 0, 9]) { const c = [x, 0, z]; I.push({ c, h: Hh, w: 1, d: 1, draw: (g, p) => sadBox3(g, c, .6, .6, Hh, '#5a3a22', p) }); } SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (o.layer !== 'bg') { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 50; i++) { const u = (t * .05 + hash(i)) % 1, q = project([(hash(i * 3) - .5) * 16, u * 6, (hash(i * 5) - .5) * 16]); if (q) { ctx.fillStyle = rgba('#ffe8c0', .5 * Math.sin(u * Math.PI)); ctx.fillRect(q.x, q.y, Math.max(1, .03 * q.s), Math.max(1, .03 * q.s)); } } ctx.restore(); }
} };
// ================================================================================================ MIRROR WORLD (Kyoka Suigetsu)
SETS.mirror = { pal: 'mirror', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 6, cloudSeed: 77 }, o)); drawMoonDir(ctx, pal, t, { dir: [.2, .3, -1], r: 110, col: '#fffaf0', glow: '#e8d0ff' });
    // mirror floor: reflected sky gradient + reflected moon + ripples
    const fp = sadWater(ctx, pal, 0, mixHex(pal.skyLow, pal.skyMid, .4), pal.skyTop); if (fp) { ctx.save(); polyPath(ctx, fp); ctx.clip();
      const cam = CAM.cur, mp = project(vAdd(cam.pos, vMul(vNorm([.2, -.3, -1]), 4000))); if (mp) { const R = 110 * cam.f / 1000; ctx.globalAlpha = .35; ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(mp.x, mp.y, R, R * .35, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'screen'; glow(ctx, mp.x, mp.y, R * 4, '#e8d0ff', .3); }
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = rgba('#ffffff', .35); ctx.lineWidth = 1.2; for (let k = 0; k < 6; k++) { const rr = ((t * .6 + k / 6) % 1) * 18; const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; pts.push([CAM.cur.target[0] + Math.cos(a) * rr, .005, CAM.cur.target[2] + Math.sin(a) * rr]); } for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.globalAlpha = 1 - rr / 18; ctx.stroke(); } } ctx.globalAlpha = 1; ctx.restore(); }
    if (o.crack) { ctx.save(); ctx.strokeStyle = rgba('#ffffff', .8 * o.crack); ctx.lineWidth = 2; const r = rng(5); for (let i = 0; i < 12 * o.crack; i++) { let x = W * r(), y = H * .4 * r(); ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 160; y += r() * 60; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); } }
  const key = 'mirror' + (o.shards || 26); if (!SETCACHE[key]) { const I = [], r = rng(13); for (let i = 0; i < (o.shards || 26); i++) { const c = [(r() - .5) * 60, 1 + r() * 9, -6 - r() * 50], s = .8 + r() * 2.2, rot = r() * TAU, tilt = (r() - .5) * 1.2, sd = i;
      I.push({ c, h: s, w: s, draw: (g, p, tt) => { const a = rot + tt * .2 * (hash(sd) - .5), M = mMul(mRotY(a), mRotX(tilt)), pts = [[-s, -s * .6, 0], [s * .7, -s * .9, 0], [s, s * .4, 0], [-s * .2, s, 0], [-s * .9, s * .5, 0]].map(q => vAdd(c, mApply(M, vMul(q, .6)))), n = mApply(M, [0, 0, 1]), f = vDot(n, toCam(c));
        const sp = sadPoly(g, pts, mixHex(f > 0 ? '#f0e8ff' : '#8a7ac0', p.skyMid, .35 + .3 * Math.abs(Math.sin(a * 2))), 1.2, '#4a3a7a'); if (sp) { g.save(); polyPath(g, sp); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); g.lineTo(sp[1][0], sp[1][1]); g.lineTo(sp[2][0] * .5 + sp[0][0] * .5, sp[2][1] * .5 + sp[0][1] * .5); g.fill(); g.restore(); } } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };
// ================================================================================================ INVERTED WORLD (Sakanade)
SETS.sakasama = { pal: 'inverted', draw(ctx, t, o) {
  const pal = o.pal, flip = o.flip == null ? 1 : o.flip, cam = CAM.cur;
  if (bgPass(o)) { // sky everywhere, clouds BELOW the horizon (the sky is down), ground texture above
    const [a, b] = horizonLine(cam), my = (a[1] + b[1]) / 2; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mixHex(pal.ground2, pal.skyTop, 1 - flip)); g.addColorStop(clamp(my / H, .05, .95), pal.skyLow); g.addColorStop(1, pal.skyTop); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r = rng(33); for (let i = 0; i < 14; i++) { const az = r() * TAU, el = -(.05 + r() * .4) * flip + (1 - flip) * (.05 + r() * .3), d = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)], p = project(vAdd(cam.pos, vMul(d, 2000))); if (!p) continue; const w = (380 + r() * 520) * p.s, h = w * .3; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, flip > .5 ? -1 : 1); paintCloud(ctx, 0, 0, w, h, pal, Math.floor(r() * 1e6), 0); ctx.restore(); }
    // glass floor (they stand on air): faint grid + pink reflections
    ctx.strokeStyle = rgba('#ffffff', .22); ctx.lineWidth = 1; for (let i = -20; i <= 20; i++) { for (const rn of projLine([[i * 3, 0, -60], [i * 3, 0, 60]])) { polyPath(ctx, rn, false); ctx.stroke(); } for (const rn of projLine([[-60, 0, i * 3], [60, 0, i * 3]])) { polyPath(ctx, rn, false); ctx.stroke(); } } }
  // the city hangs from the 'ground' far above: upside-down Seireitei/Yokohama blocks with roofs pointing down
  const key = 'saka' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1); for (let i = 0; i < 70; i++) { const a = r() * TAU, d = 14 + r() * 140, c = [Math.cos(a) * d, 0, Math.sin(a) * d], w = 6 + r() * 8, dd = 6 + r() * 8, h = 6 + r() * 22, col = mixHex('#e8d8d0', '#b8a0a8', r()), sd = i; I.push({ c, h: 30, w, d: dd, draw: (g, p) => {
      const ceil = 60 - 50 * (1 - flip); const top = ceil - h; sadBox3(g, [c[0], top, c[2]], w, dd, h, col, p, { top: '#3a2a3a' }); const peak = projPoly([[c[0] - w / 2, top, c[2] - dd / 2], [c[0] + w / 2, top, c[2] - dd / 2], [c[0], top - 3, c[2]]]); if (peak.length > 2) { polyPath(g, peak); g.fillStyle = '#3a2a3a'; g.fill(); }
      if (flip < 1) sadBox3(g, c, w * .3, dd * .3, (1 - flip) * h, col, p); } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (o.layer !== 'bg') { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g2 = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); g2.addColorStop(0, 'rgba(255,156,207,0)'); g2.addColorStop(1, 'rgba(255,156,207,.3)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore(); }
} };
// ================================================================================================ SHIFTING ARENA
const SAD_SURF = { stone: ['#9a8a7a', '#7a6a5e'], sand: ['#e2cfa8', '#c8b088'], mirror: ['#c8c0e8', '#8a80c0'], black: ['#18141e', '#0a080e'], water: ['#3a6a9a', '#1a3a6a'] };
SETS.arena = { pal: 'arena', draw(ctx, t, o) {
  const pal = o.pal, R = 34;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 9, cloudSeed: 61 }, o)); drawMountains(ctx, pal, 21, 1400, 160); drawGround(ctx, pal, { col: '#6a5a4e', col2: '#4a3e36' });
    // tiles in rings: each tile flips from 'from' to 'surf' when the wave reaches it (rotating edge-on = brief dark sliver)
    const from = SAD_SURF[o.from || 'stone'], to = SAD_SURF[o.surf || o.from || 'stone'], ph = o.phase == null ? 0 : o.phase;
    for (let ring = 0; ring < 8; ring++) { const r0 = ring * R / 8, r1 = (ring + 1) * R / 8, n = 8 + ring * 6; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, dist = (r0 + r1) / 2 / R, k = clamp((ph * 1.3 - dist) / .15, 0, 1), flipK = Math.abs(Math.cos(k * Math.PI)), cols = k < .5 ? from : to, colT = mixHex(cols[(i + ring) % 2], '#000000', (1 - flipK) * .6);
      const mid = (a0 + a1) / 2, shrink = (1 - flipK) * .45, A0 = lerp(a0, mid, shrink), A1 = lerp(a1, mid, shrink), pts = [[Math.cos(A0) * r0, .01, Math.sin(A0) * r0], [Math.cos(A1) * r0, .01, Math.sin(A1) * r0], [Math.cos(A1) * r1, .01, Math.sin(A1) * r1], [Math.cos(A0) * r1, .01, Math.sin(A0) * r1]];
      sadPoly(ctx, pts, colT, .8, 'rgba(20,14,20,.5)'); } }
    if ((o.surf === 'mirror' || o.surf === 'water') && ph > .2) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .25 * ph; const q = project([0, 0, -R]); if (q) glow(ctx, q.x, q.y, 20 * q.s, '#ffffff', .4); ctx.restore(); }
    if (o.dmg) for (let i = 0; i < 2 + o.dmg * 2; i++) { const rr = rng(500 + i); drawCrater(ctx, [(rr() - .5) * 30, 0, (rr() - .5) * 30], 1.5 + rr() * 2.5 * o.dmg, pal, 500 + i); } }
  // ring wall + columns
  const key = 'arena'; if (!SETCACHE[key]) { const I = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, c = [Math.cos(a) * (R + 2), 0, Math.sin(a) * (R + 2)]; I.push({ c, h: 4, w: 6, d: 2, draw: (g, p) => sadBox3(g, c, 6.2, 2, 3.6, '#b8a894', p, { yaw: -a + HP }) });
      if (i % 3 === 0) { const cc = [Math.cos(a) * (R + 4), 0, Math.sin(a) * (R + 4)]; I.push({ c: cc, h: 14, w: 2, d: 2, draw: (g, p) => sadBox3(g, cc, 1.6, 1.6, 13, '#c8b8a4', p, { yaw: -a }) }); } } SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };

// per-palette photography tweaks (bright white sets bloom out otherwise): applied by std(f, {pal})
const SAD_PALPOST = { hueco: { bloom: .18, halation: 0 }, mirror: { bloom: .25 }, inverted: { bloom: .25 }, harbor: { bloom: .5 } };
(function () { const base = std; std = function (f, o = {}) { base(f, o); const pp = SAD_PALPOST[o.pal]; if (pp && (!o.post || o.post === 'normal' || o.post === 'soft')) f.post(Object.assign({}, pp, o.postOver || {})); }; })();
// ================================================================================================ (cast.md set codes) CANAL / PAST / LUPIN
Object.assign(PALETTES, {
  canal: { skyTop: '#040812', skyMid: '#0e1a2e', skyLow: '#2a3a5a', fog: '#1e2a44', sun: [-.3, .5, -.7], ground: '#4a4a52', ground2: '#2a2a32', wall: '#8a3e2e', wallShade: '#3a1a16', roof: '#2a2630', roofShade: '#16141a', wood: '#3a2a22', cloud: '#2a3654', cloudShade: '#121a2e', haze: .4, line: '#06080e', amb: '#9ab0e0', stars: true },
  harbor_teal: { skyTop: '#03090c', skyMid: '#0f2a33', skyLow: '#2e4a52', fog: '#1e3a40', sun: [.35, .55, .5], ground: '#3a4044', ground2: '#20262a', wall: '#8a4a3a', wallShade: '#3a1e1e', roof: '#2a2e32', roofShade: '#161a1c', wood: '#3a2a22', cloud: '#203a44', cloudShade: '#0c1a20', haze: .45, line: '#06090a', amb: '#ffb000', stars: true },
  underwater_canal: { skyTop: '#020814', skyMid: '#06203a', skyLow: '#1a4a6a', fog: '#0e3050', sun: [0, 1, 0], ground: '#1a2a34', ground2: '#0a141a', wall: '#2a4a5a', wallShade: '#0e1e26', roof: '#0e2a30', roofShade: '#061418', wood: '#1a2a2a', cloud: '#3a6a8a', cloudShade: '#0e2a3a', haze: .9, line: '#021014', amb: '#6aa8d8' },
  past: { skyTop: '#0a0a1a', skyMid: '#1e2238', skyLow: '#4a4458', fog: '#3a3448', sun: [.4, .6, .4], ground: '#7a5a3a', ground2: '#4a3622', wall: '#d8c49a', wallShade: '#6a5438', roof: '#2a2026', roofShade: '#160f12', wood: '#5a3a22', cloud: '#3a3a52', cloudShade: '#1a1a2a', haze: .4, line: '#1a1008', amb: '#ffc888', stars: true },
  lupin: { skyTop: '#140a06', skyMid: '#2a1408', skyLow: '#5a2e12', fog: '#3a1e0e', sun: [.1, .9, .2], ground: '#3a2214', ground2: '#1e1008', wall: '#5a3a24', wallShade: '#2a160a', roof: '#1a0e08', roofShade: '#0e0804', wood: '#6a3a1a', cloud: '#3a2010', cloudShade: '#1a0e06', haze: .3, line: '#0a0604', amb: '#ffb060' },
});
Object.assign(GRADES, { canal: { sat: 1.0, contrast: 1.12, tint: ['#9ab0e8', .2] }, harbor_teal: { sat: 1.05, contrast: 1.1, tint: ['#a8d8d0', .14], lift: ['#0f2a33', .08] }, underwater_canal: { sat: .9, contrast: 1.05, tint: ['#7ab8e8', .3] },
  past: { sat: .85, contrast: 1.05, tint: ['#e8c890', .32], lift: ['#3a2010', .06] }, lupin: { sat: 1.0, contrast: 1.15, tint: ['#ffb070', .3], lift: ['#1a0a04', .05] } });
Object.assign(SAD_PALPOST, { canal: { bloom: .55 }, past: { bloom: .35, grain: .09 }, lupin: { bloom: .5, vignette: .6 } });
function sadGasLamp(ctx, p, h, t) { const a = project(p), b = project([p[0], h, p[2]]); if (!a || !b) return; ctx.lineWidth = Math.max(1, .1 * a.s); ctx.strokeStyle = '#141216'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  const r = .22 * b.s; ctx.fillStyle = '#ffd890'; ctx.fillRect(b.x - r, b.y - r * 1.6, r * 2, r * 1.6); ctx.strokeStyle = '#141216'; ctx.lineWidth = Math.max(1, .03 * b.s); ctx.strokeRect(b.x - r, b.y - r * 1.6, r * 2, r * 1.6); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, b.x, b.y - r, 3 * b.s * (1 + .04 * Math.sin(t * 7 + p[0])), '#ffb35a', .55); ctx.restore(); }
SETS.canal = { pal: 'canal', draw(ctx, t, o) { // Yokohama canal at night: stone steps into still water, red-brick warehouses, gas lamps, the moon in the water (o.under = underwater view)
  const pal = o.pal, under = !!o.under, cam = CAM.cur;
  if (under) { if (!bgPass(o)) return; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a6a8a'); g.addColorStop(.35, '#0e3050'); g.addColorStop(1, '#020812'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const mp = project(vAdd(cam.pos, vMul(vNorm([.1, 1, -.4]), 400))); if (mp) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const wob = Math.sin(t * 2 + i) * 8; glow(ctx, mp.x + wob, mp.y, 120 + i * 30, '#f4f0d8', .18); } ctx.fillStyle = 'rgba(244,240,216,.6)'; ctx.beginPath(); ctx.ellipse(mp.x, mp.y, 60 + Math.sin(t * 3) * 6, 40, Math.sin(t) * .2, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 7; i++) { const x = (hash(i) - .5) * W * 1.4 + W / 2 + Math.sin(t * .4 + i) * 40; const gg = ctx.createLinearGradient(x, 0, x + 200, H); gg.addColorStop(0, 'rgba(180,230,255,.18)'); gg.addColorStop(1, 'rgba(180,230,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 260, H); ctx.lineTo(x + 120, H); ctx.fill(); } ctx.restore();
    ctx.strokeStyle = 'rgba(210,240,255,.7)'; ctx.lineWidth = 1.3; for (let i = 0; i < 50; i++) { const u = (t * (.2 + hash(i) * .25) + hash(i * 3)) % 1, x = W * hash(i * 5) + Math.sin(t * 3 + i) * 6, y = H * (1 - u), r = 2 + 7 * hash(i * 7); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
    // silhouette of the canal wall + steps above the surface
    ctx.fillStyle = 'rgba(4,10,20,.8)'; ctx.fillRect(0, 0, W * .22, H); return; }
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 5, cloudSeed: 51 }, o)); drawMoonDir(ctx, pal, t, { dir: o.moonDir || [.1, .3, -1], r: 85, glow: '#c8d8ff', col: '#f4f0d8' });
    const wp = sadWater(ctx, pal, -1.5, '#0e1a2e', '#03060c'); if (wp) { ctx.save(); polyPath(ctx, wp); ctx.clip(); // water moon: reflected moon + light streaks
      const md = o.moonDir || [.1, .3, -1], mp = project(vAdd(cam.pos, vMul(vNorm([md[0], -md[1], md[2]]), 4000))); if (mp) { const R = 85 * cam.f / 1000; ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 9; i++) { const y = mp.y + (i - 4) * R * .25, w = R * (1 - Math.abs(i - 4) / 5) * (1 + .15 * Math.sin(t * 2 + i)); ctx.fillStyle = rgba('#f4f0d8', .55 * (1 - Math.abs(i - 4) / 5)); ctx.fillRect(mp.x - w + Math.sin(t * 1.7 + i) * 6, y, w * 2, R * .14); } glow(ctx, mp.x, mp.y, R * 3, '#c8d8ff', .2); }
      ctx.restore(); }
    // stone steps descending into the water on the near side (x < -3), quay walkway along the canal (z from -40 to 40)
    sadPoly(ctx, [[-60, 0, -60], [-3, 0, -60], [-3, 0, 60], [-60, 0, 60]], '#4a4a52'); for (let i = 0; i < 6; i++) { const x0 = -3 + i * .45, y = -i * .25; sadPoly(ctx, [[x0, y, -4], [x0 + .45, y, -4], [x0 + .45, y, 4], [x0, y, 4]], i % 2 ? '#5a5a62' : '#62626a', .8); sadPoly(ctx, [[x0 + .45, y, -4], [x0 + .45, y, 4], [x0 + .45, y - .25, 4], [x0 + .45, y - .25, -4]], '#34343c', .8); }
    sadPoly(ctx, [[-3, 0, -60], [-3, 0, -4], [-3, -1.5, -4], [-3, -1.5, -60]], '#3a3a42', .8); sadPoly(ctx, [[-3, 0, 4], [-3, 0, 60], [-3, -1.5, 60], [-3, -1.5, 4]], '#3a3a42', .8);
    sadPoly(ctx, [[14, 0, -60], [60, 0, -60], [60, 0, 60], [14, 0, 60]], '#3a3a42'); sadPoly(ctx, [[14, 0, -60], [14, 0, 60], [14, -1.5, 60], [14, -1.5, -60]], '#2a2a30', .8); drawPaving(ctx, pal, [-12, 0, 0], 20, 1.6, { line: '#16161c', alpha: .4 }); }
  const key = 'canal' + (o.seed || 1); if (!SETCACHE[key]) { const I = [], r = rng(o.seed || 1);
    for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) { const b = { c: [sd < 0 ? -22 : 26, 0, -40 + i * 24], w: 14, d: 20, h: 11 + r() * 3, seed: 400 + i * 2 + sd, col: mixHex('#8a3e2e', '#6a2e24', r()), yaw: 0 }; I.push({ c: b.c, h: b.h, w: 14, d: 20, draw: (g, p, tt) => sadWarehouse(g, b, p, tt) }); }
    for (let i = -4; i <= 4; i++) for (const x of [-4.2, 15]) { const c = [x, 0, i * 9]; I.push({ c, h: 4, w: 1, d: 1, draw: (g, p, tt) => sadGasLamp(g, c, 3.8, tt) }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (bgPass(o)) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = -4; i <= 4; i++) for (const x of [-4.2, 15]) sadReflect(ctx, [x, 3.8, i * 9], .5, .9, '#ffb35a', .3, t, i); ctx.restore(); }
} };
SETS.past = { pal: 'past', draw(ctx, t, o) { // 5th Division barracks 110 years ago at night: wooden hall, paper lanterns, gramophone, moonlit engawa (o.forest = Hollowfication night forest)
  const pal = o.pal;
  if (o.forest) { SETS.forest.draw(ctx, t, Object.assign({}, o, { pal: PALETTES.mist })); return; }
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 4 }, o)); drawMoonDir(ctx, pal, t, { dir: [-.5, .45, -1], r: 70 }); drawGround(ctx, pal, { col: '#4a4038', col2: '#2a241e' });
    // raised wooden floor (engawa + hall) z > -8, posts, shoji back wall with warm light, low eave
    sadPoly(ctx, [[-30, .5, -8], [30, .5, -8], [30, .5, 20], [-30, .5, 20]], '#7a5a3a'); ctx.strokeStyle = rgba('#3a2412', .5); ctx.lineWidth = 1.1; for (let x = -30; x <= 30; x += 1) for (const rn of projLine([[x, .503, -8], [x, .503, 20]])) { polyPath(ctx, rn, false); ctx.stroke(); }
    sadPoly(ctx, [[-30, 0, -8], [30, 0, -8], [30, .5, -8], [-30, .5, -8]], '#3a2616');
    sadPoly(ctx, [[-30, .5, 12], [30, .5, 12], [30, 4.2, 12], [-30, 4.2, 12]], '#e8d0a0'); for (let i = -15; i <= 15; i++) { for (const rn of projLine([[i * 2, .5, 11.98], [i * 2, 4.2, 11.98]])) { polyPath(ctx, rn, false); ctx.lineWidth = i % 2 ? 1.2 : 3.5; ctx.strokeStyle = '#4a2e18'; ctx.stroke(); } } for (let y = 1; y < 4.2; y += .7) for (const rn of projLine([[-30, y, 11.98], [30, y, 11.98]])) { polyPath(ctx, rn, false); ctx.lineWidth = 1; ctx.strokeStyle = rgba('#6a4a2a', .6); ctx.stroke(); }
    sadPoly(ctx, [[-32, 4.2, 13], [32, 4.2, 13], [32, 5, -9.5], [-32, 5, -9.5]], '#2a2026', 1); }
  const key = 'past'; if (!SETCACHE[key]) { const I = []; for (let i = -6; i <= 6; i++) { const c = [i * 5, .5, -7.6]; I.push({ c, h: 4.5, w: .4, d: .4, draw: (g, p) => sadBox3(g, c, .32, .32, 4.4, '#4a2e18', p) }); const lc = [i * 5 + 2.5, 3.6, -7.2]; I.push({ c: lc, h: .6, w: .6, draw: (g, p, tt, z) => drawLantern(g, lc, p, tt, z, { col: '#f0e0c0' }) }); }
    const gc = [6, .5, 6]; I.push({ c: gc, h: 1.4, w: 1, draw: (g, p, tt) => { sadBox3(g, gc, .6, .6, .5, '#4a2a16', p); const hc = [gc[0] + .2, 1.1, gc[2]], bell = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU; bell.push([hc[0] + .25 + Math.cos(a) * .05, hc[1] + .35 + Math.sin(a) * .45, hc[2] + Math.sin(a) * .45]); } const sp = projPoly(bell.concat([hc])); if (sp.length > 2) { polyPath(g, sp); g.fillStyle = '#c89a3a'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#3a2410'; g.stroke(); } } }); // gramophone
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };
SETS.lupin = { pal: 'lupin', draw(ctx, t, o) { // Bar Lupin: narrow cellar bar, wooden counter, one lamp, record player, three glasses (o.glasses)
  const pal = o.pal; if (!bgPass(o) && o.layer !== 'all') { /* fg pass: counter front only */ }
  if (bgPass(o)) { ctx.fillStyle = '#100804'; ctx.fillRect(0, 0, W, H);
    sadPoly(ctx, [[-4, 0, -12], [4, 0, -12], [4, 0, 12], [-4, 0, 12]], '#3a2214'); sadPoly(ctx, [[-4, 0, -12], [-4, 0, 12], [-4, 3.2, 12], [-4, 3.2, -12]], '#4a2e1a'); sadPoly(ctx, [[4, 0, -12], [4, 0, 12], [4, 3.2, 12], [4, 3.2, -12]], '#3a2212'); sadPoly(ctx, [[-4, 3.2, -12], [4, 3.2, -12], [4, 3.2, 12], [-4, 3.2, 12]], '#1a0e08'); sadPoly(ctx, [[-4, 0, -12], [4, 0, -12], [4, 3.2, -12], [-4, 3.2, -12]], '#2a180c');
    // bottle shelves behind the counter
    for (let y = 1.3; y < 3; y += .55) { sadPoly(ctx, [[3.95, y, -8], [3.95, y, 6], [3.6, y, 6], [3.6, y, -8]], '#2a160a'); for (let i = 0; i < 26; i++) { const z = -7.8 + i * .53, hgt = .3 + hash(i * 3 + y) * .15, q0 = project([3.75, y, z]), q1 = project([3.75, y + hgt, z]); if (!q0 || !q1) continue; ctx.lineWidth = Math.max(2, .09 * q0.s); ctx.strokeStyle = ['#3a6a3a', '#8a4a1a', '#c8a050', '#5a2a3a'][i % 4]; ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke(); } }
    // single lamp pool
    const lp = project([1.5, 2.9, 0]); if (lp) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, lp.x, lp.y, 9 * lp.s, '#ffb060', .5); glow(ctx, lp.x, lp.y, .6 * lp.s, '#fff0c8', .9); ctx.restore(); } }
  const key = 'lupin' + (o.glasses == null ? 3 : o.glasses); if (!SETCACHE[key]) { const I = [];
    const cc = [2.2, 0, 0]; I.push({ c: cc, h: 1.1, w: 1, d: 16, draw: (g, p) => { sadBox3(g, cc, .8, 16, 1.05, '#5a3018', p, { top: '#7a4422' }); } });
    for (let i = 0; i < (o.glasses == null ? 3 : o.glasses); i++) { const gp = [1.95, 1.06, -1 + i * .7]; I.push({ c: gp, h: .2, w: .2, draw: (g) => { const a = project(gp), b = project([gp[0], gp[1] + .14, gp[2]]); if (!a || !b) return; const w = .045 * a.s; g.fillStyle = 'rgba(255,220,160,.35)'; g.fillRect(a.x - w, b.y, w * 2, a.y - b.y); g.fillStyle = 'rgba(200,120,40,.7)'; g.fillRect(a.x - w, lerp(b.y, a.y, .5), w * 2, (a.y - b.y) * .5); g.strokeStyle = 'rgba(255,240,210,.8)'; g.lineWidth = 1; g.strokeRect(a.x - w, b.y, w * 2, a.y - b.y); } }); }
    for (let i = 0; i < 4; i++) { const sc = [1.2, 0, -1.4 + i * 1.0]; I.push({ c: sc, h: .8, w: .5, draw: (g, p) => { sadBox3(g, [sc[0], .7, sc[2]], .45, .45, .08, '#2a160c', p); const a = project([sc[0], 0, sc[2]]), b = project([sc[0], .7, sc[2]]); if (a && b) { g.lineWidth = Math.max(1, .05 * a.s); g.strokeStyle = '#1a0e06'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } } }); }
    const rp = [2.3, 1.06, 4]; I.push({ c: rp, h: .2, w: .5, draw: (g, p, tt) => { sadBox3(g, rp, .45, .45, .1, '#3a2010', p); const q = project([rp[0], rp[1] + .11, rp[2]]); if (q) { g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(q.x, q.y, .18 * q.s, .07 * q.s, 0, 0, TAU); g.fill(); g.fillStyle = '#a83a2a'; g.beginPath(); g.ellipse(q.x, q.y, .05 * q.s, .02 * q.s, 0, 0, TAU); g.fill(); } } });
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };
// INVERTED with a real base set: o.base = 'yokohama' | 'canal' | ... draws that set mirrored vertically (sky below, city hanging above)
(function () { const base = SETS.sakasama.draw; SETS.sakasama.draw = function (ctx, t, o) {
  if (!o.base) return base.call(this, ctx, t, o); if (!bgPass(o)) return;
  const lay = getLayer('sadInv', ctx.canvas.width, ctx.canvas.height), lg = lay.getContext('2d'); lg.setTransform(ctx.getTransform()); lg.clearRect(-1e4, -1e4, 3e4, 3e4);
  SETS[o.base].draw(lg, t, Object.assign({}, o, { pal: PALETTES[o.basePal] || PALETTES[SETS[o.base].pal] || o.pal, layer: 'all' }));
  const [a, b] = horizonLine(), my = (a[1] + b[1]) / 2; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const sc = ctx.canvas.height / H, f = o.flip == null ? 1 : o.flip;
  ctx.translate(0, my * sc); ctx.scale(1, lerp(1, -1, f)); ctx.translate(0, -my * sc); ctx.drawImage(lay, 0, 0); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const g2 = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); g2.addColorStop(0, 'rgba(255,156,207,0)'); g2.addColorStop(1, 'rgba(255,156,207,.18)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.strokeStyle = rgba('#ffffff', .18); ctx.lineWidth = 1; for (let i = -12; i <= 12; i++) for (const rn of projLine([[i * 3, 0, -40], [i * 3, 0, 40]])) { polyPath(ctx, rn, false); ctx.stroke(); }
}; })();
