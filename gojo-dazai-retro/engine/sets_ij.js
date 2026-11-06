/* engine/sets_ij.js (agent E, itachi-vs-julius) - ONE ARENA (Valhalla re-dressed) + Tsukuyomi world + fighter-card backgrounds + the two crowd stars.
   SETS.ijarena  f.bg({ set: 'ijarena', pal, dmg, ... })   west = ITACHI (Uchiha fan emblem, crimson banners + gate), east = JULIUS (Clover-kingdom crest, gold banners + gate)
     palettes: arena_ij (night, red-tinted torches) | arena_ij_dusk | arena_ij_day | arena_ij_dark (torches out) | arena_ij_red (crimson sky) | arena_ij_gold (time-magic gold haze)
     options: all hyarena/valhalla options (react cheer crowd eyes torch torchT torchSpan gateW gateE crater craterAt craterR rays statues dust spots fires breach collapse) +
       scorch [[x,z,r],..]      Amaterasu scorch marks (black, red-edged) on the floor          blackFire 0..1  black flames still burning in the scorches
       gouge [[x0,z0,x1,z1,w]]  Totsuka / Susanoo sword gouges cut through the floor
       clockScar 0..1 + clockAt + clockR   a glowing clock-face burned into the floor (time magic)       frozen 0..1  debris hanging frozen in the air (time stop)
       feathers 0..1            black crow feathers drifting in the air                           moon 0..1  huge pale/red moon in the sky (night palettes)
   SETS.tsukuyomi f.bg({set:'tsukuyomi', pal:'tsukuyomi', crosses: 0..1, moon: 1})   red sky, black clouds, black moon with a red rim, negative ground grid
   SETS.ijcard    f.bg({set:'ijcard', who:'itachi'|'julius'|'vs'})
   CROWD STARS (seated among silhouettes, never alone): DAZAI = the wise one, SHUNSUI next to him = premature verdicts ('Ha, he lost.')
     IJ.STARS {dazai, shunsui}, reactions: dazai  watch knowing explain narrow smile shock sigh
                                            shunsui verdict toast smug oops laugh hush eyesWide sweat
     IJ.crowdPair(f, lt, {rD, rS, dim})       draws both seated + 8-12 seated silhouettes around them (flat dark figures with rim light) + bench stones
     IJ.crowdShot(f, lt, {focus:'dazai'|'shunsui'|'both', rD, rS, part:'face'|'bust'|'two', az, pal, push})  complete 1-2.5 s reaction shot (hand2d, moving camera)  */
'use strict';
Object.assign(PALETTES, {
  arena_ij: { skyTop: '#040508', skyMid: '#141826', skyLow: '#3a2a34', fog: '#262832', sun: [-.35, .75, .5], ground: '#6e604e', ground2: '#3a3026', wall: '#4e4a50', wallShade: '#16141a', roof: '#22202a', roofShade: '#0c0a10', wood: '#2a2018', cloud: '#262634', cloudShade: '#0c0c14', haze: .55, line: '#060608', amb: '#ffb090', stars: false, crowd: '#0e0c12', crowdRim: '#ff8a5a', torch: '#ff8a3a' },
  arena_ij_dusk: { skyTop: '#140f30', skyMid: '#5a2a5a', skyLow: '#ff8a4a', fog: '#7a4a52', sun: [.6, .18, -.75], ground: '#a8865e', ground2: '#5a422e', wall: '#74605e', wallShade: '#281c22', roof: '#3a2428', roofShade: '#160c10', wood: '#3a2618', cloud: '#d07a6a', cloudShade: '#4a2242', haze: .6, line: '#100808', amb: '#ffa870', crowd: '#180e16', crowdRim: '#ffa060', torch: '#ffa040' },
  arena_ij_day: { skyTop: '#2a5ac8', skyMid: '#7aa8e0', skyLow: '#e8ecf0', fog: '#c4ccd6', sun: [-.4, .85, .4], ground: '#c4a67c', ground2: '#786246', wall: '#aca094', wallShade: '#585058', roof: '#5a4a48', roofShade: '#2a2024', wood: '#5a3a24', cloud: '#ffffff', cloudShade: '#a4b0c8', haze: .45, line: '#14100e', amb: '#fff0dc', crowd: '#363038', crowdRim: '#fff0d0', torch: '#ffb060' },
  arena_ij_dark: { skyTop: '#020208', skyMid: '#080a16', skyLow: '#1a1626', fog: '#14121e', sun: [-.3, .7, .5], ground: '#4a4448', ground2: '#1a181c', wall: '#2e2c34', wallShade: '#0a0a10', roof: '#141218', roofShade: '#060508', wood: '#1a1410', cloud: '#1a1a28', cloudShade: '#08080e', haze: .5, line: '#000000', amb: '#9a8ab8', stars: true, crowd: '#060608', crowdRim: '#8a6aa0', torch: '#ff6a2a' },
  arena_ij_red: { skyTop: '#0c0204', skyMid: '#4a0a10', skyLow: '#d03a20', fog: '#5a1a16', sun: [.3, .6, .6], ground: '#8a5a48', ground2: '#3a201a', wall: '#6a4440', wallShade: '#200c10', roof: '#2a1012', roofShade: '#0e0406', wood: '#2a140e', cloud: '#2a0606', cloudShade: '#100202', haze: .6, line: '#060102', amb: '#ff6a4a', crowd: '#0e0406', crowdRim: '#ff4a3a', torch: '#ff5a2a' },
  arena_ij_gold: { skyTop: '#0a0c24', skyMid: '#2a2a4a', skyLow: '#c89a4a', fog: '#6a5a4a', sun: [-.3, .7, .5], ground: '#b09a70', ground2: '#5e4c34', wall: '#7a6c60', wallShade: '#2a2228', roof: '#3a2c28', roofShade: '#160e10', wood: '#3a2a1a', cloud: '#c8a060', cloudShade: '#3a2a3a', haze: .55, line: '#0e0a06', amb: '#ffe0a0', stars: true, crowd: '#14100c', crowdRim: '#ffd070', torch: '#ffc040' },
  ij_storm: { skyTop: '#03040a', skyMid: '#141a2a', skyLow: '#3a2430', fog: '#262a36', sun: [.3, .5, -.8], ground: '#5a5048', ground2: '#2e2824', wall: '#4a4648', wallShade: '#141218', roof: '#1e1a20', roofShade: '#0a080c', wood: '#2a2018', cloud: '#3a3e50', cloudShade: '#101218', haze: .5, line: '#060608', amb: '#c8a0a0', torch: '#ff8a3a', stars: false },
  tsukuyomi: { skyTop: '#2a0004', skyMid: '#8a0a12', skyLow: '#d01a1a', fog: '#5a0a0a', sun: [0, .8, .4], ground: '#0a0606', ground2: '#000000', wall: '#1a0a0a', wallShade: '#000000', roof: '#100404', roofShade: '#000000', wood: '#100404', cloud: '#050002', cloudShade: '#000000', haze: .2, line: '#000000', amb: '#ff4a3a' },
});
Object.assign(GRADES, {
  arena_ij: { sat: .95, contrast: 1.16, tint: ['#c8d0e8', .12], lift: ['#08080e', .06] }, arena_ij_dusk: { sat: 1.1, contrast: 1.08, soft: ['#ffb080', .16], lift: ['#2a0a2a', .06] },
  arena_ij_day: { sat: 1.05, contrast: 1.06, soft: ['#fff4e0', .1] }, arena_ij_dark: { sat: .82, contrast: 1.18, tint: ['#b0a8d8', .18], lift: ['#04040a', .05] },
  arena_ij_red: { sat: 1.12, contrast: 1.2, tint: ['#ff9a90', .22], lift: ['#1a0206', .06] }, arena_ij_gold: { sat: 1.08, contrast: 1.1, soft: ['#ffe0a0', .18], lift: ['#0a0a1a', .05] },
  ij_storm: { sat: .9, contrast: 1.15, tint: ['#b8c0e0', .15], lift: ['#06060c', .05] },
  tsukuyomi: { sat: 1.1, contrast: 1.25, lift: ['#100002', .04] },
});
(function () { const pp = { arena_ij: { bloom: .55 }, arena_ij_dusk: { bloom: .5 }, arena_ij_day: { bloom: .3 }, arena_ij_dark: { bloom: .65 }, arena_ij_red: { bloom: .7 }, arena_ij_gold: { bloom: .7 }, tsukuyomi: { bloom: .4 } };
  if (window.GOW_PALPOST) Object.assign(window.GOW_PALPOST, pp); if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, pp); })();
// emblems: west = Uchiha fan (red top, white bottom, handle), east = three-leaf clover crest in a ring with a crown
function ijEmblem(ctx, qe, r, west, pm, pal) { const x = qe.x, y = qe.y; ctx.save();
  if (west) { ctx.fillStyle = hvFog('#d81e26', pm, pal); ctx.beginPath(); ctx.arc(x, y - r * .1, r * .8, Math.PI, TAU); ctx.closePath(); ctx.fill(); ctx.fillStyle = hvFog('#f4f0ea', pm, pal); ctx.beginPath(); ctx.arc(x, y - r * .1, r * .8, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - r * .1, y + r * .6, r * .2, r * .55); ctx.strokeStyle = hvFog('#1a1418', pm, pal); ctx.lineWidth = Math.max(1, r * .08); ctx.beginPath(); ctx.arc(x, y - r * .1, r * .8, 0, TAU); ctx.stroke(); }
  else { if (typeof fxWizardCrest === 'function') fxWizardCrest(ctx, x, y, r * .9, { col: hvFog('#e8b830', pm, pal) }); }
  ctx.restore(); }
IJ.R = 26;
SETS.ijarena = { pal: 'arena_ij', draw(ctx, t, o) {
  const pal = o.pal, o2 = Object.assign({ emblem: ijEmblem, gateCols: ['#d81e26', '#e8b830'], gateFlame: pal.torch || '#ff8a3a', eyes: false, react: 'cheer', cheer: .7, ledge: false, spots: .45, crowd: .62 }, o);
  // big moon behind the colosseum (drawn first, the stands cover its lower part)
  const mk = o.moon || 0; if (mk > 0 && o.layer !== 'fg') { const sk = CAM.cur, dir = vNorm([-.4, .32, -1]), q = project(vAdd(sk.pos, vMul(dir, 900))); if (q) { ctx.save(); ctx.globalAlpha = mk; const R = 70 * (40 / (sk.fov || 40)) * 2.2; glow(ctx, q.x, q.y, R * 2.4, o.moonCol || '#ffd8c8', .25);
    ctx.fillStyle = radial(ctx, q.x - R * .2, q.y - R * .2, R * 1.2, [[0, '#fff6ee'], [.7, o.moonCol || '#f2d8c8'], [1, shadeHex(o.moonCol || '#f2d8c8', -.3)]]); ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(pal.cloudShade || '#100c14', .85); for (let i = 0; i < 4; i++) { const yy = q.y - R * .8 + i * R * .5 + Math.sin(t * .1 + i) * 6, xx = q.x + Math.sin(t * .05 + i * 2) * R * .6; ctx.beginPath(); ctx.ellipse(xx, yy, R * (1.4 + .4 * hash(i)), R * .12, 0, 0, TAU); ctx.fill(); } ctx.restore(); } }
  SETS.hyarena.draw(ctx, t, o2); if (o.layer === 'fg') return;
  // Amaterasu scorch marks (+ optional black flames)
  for (const [x, z, r] of (o.scorch || [])) { const ring = []; for (let i = 0; i < 26; i++) { const an = i / 26 * TAU, rr = r * (.75 + .35 * hash(i * 3 + x)); ring.push([x + Math.cos(an) * rr, .015, z + Math.sin(an) * rr * .9]); } const sp = projPoly(ring); if (sp.length < 3) continue;
    polyPath(ctx, sp); ctx.fillStyle = 'rgba(6,3,6,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(150,16,34,.85)'; ctx.lineWidth = 3; ctx.stroke();
    if ((o.blackFire || 0) > 0 && typeof fxAmaterasu === 'function') fxAmaterasu(ctx, [x, 0, z], t + 5, { r: r * .8, h: 1.2, n: Math.round(6 + r * 3), k: o.blackFire, seed: Math.round(x * 7 + z * 3) }); }
  // sword gouges
  for (const gz of (o.gouge || [])) { const [x0, z0, x1, z1, w0] = gz, w = w0 || .5, d = vNorm([x1 - x0, 0, z1 - z0]), n = [-d[2], 0, d[0]], pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, ww = w * Math.sin(Math.PI * (.05 + .9 * u)); pts.push([x0 + (x1 - x0) * u + n[0] * ww, .015, z0 + (z1 - z0) * u + n[2] * ww]); } for (let i = 12; i >= 0; i--) { const u = i / 12, ww = w * Math.sin(Math.PI * (.05 + .9 * u)); pts.push([x0 + (x1 - x0) * u - n[0] * ww, .015, z0 + (z1 - z0) * u - n[2] * ww]); }
    const sp = projPoly(pts); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = rgba(shadeHex(pal.ground2, -.6), .95); ctx.fill(); ctx.strokeStyle = rgba(mixHex(pal.ground, '#ffffff', .3), .55); ctx.lineWidth = 2; ctx.stroke(); } }
  // glowing clock scar
  const ck = o.clockScar || 0; if (ck > 0) { const c = o.clockAt || [0, 0, 0], R = o.clockR || 6; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const ringAt = (r, col, w) => { const pts = []; for (let i = 0; i <= 64; i++) { const an = i / 64 * TAU, q = project([c[0] + Math.cos(an) * r, .02, c[2] + Math.sin(an) * r]); if (q) pts.push([q.x, q.y]); } if (pts.length > 2) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.strokeStyle = rgba(col, .7 * ck); ctx.lineWidth = w; ctx.stroke(); } };
    ringAt(R, '#f6d36a', 5); ringAt(R * .9, '#8ad8ff', 2); for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, a = project([c[0] + Math.cos(an) * R * .9, .02, c[2] + Math.sin(an) * R * .9]), b = project([c[0] + Math.cos(an) * R * .78, .02, c[2] + Math.sin(an) * R * .78]); if (a && b) { ctx.strokeStyle = rgba('#f6d36a', .8 * ck); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    ctx.restore(); }
  // frozen debris (time stop): rocks hanging still with a faint gold outline
  const fz = o.frozen || 0; if (fz > 0) for (let i = 0; i < 40; i++) { const p = [(hash(i * 3) - .5) * 26, .5 + hash(i * 5) * 6, (hash(i * 7) - .5) * 26], q = project(p); if (!q || q.z < 1) continue; const s = (.1 + .25 * hash(i)) * q.s;
    ctx.save(); ctx.globalAlpha = fz; ctx.translate(q.x, q.y); ctx.rotate(hash(i * 9) * 6); ctx.fillStyle = shadeHex(pal.ground2, -.1); ctx.strokeStyle = 'rgba(246,211,106,.85)'; ctx.lineWidth = Math.max(1, s * .12); ctx.beginPath(); ctx.moveTo(-s, -s * .3); ctx.lineTo(-s * .2, -s); ctx.lineTo(s, -s * .4); ctx.lineTo(s * .6, s * .7); ctx.lineTo(-s * .5, s * .8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // wet sand: puddles reflecting the sky/moon with rain rings (o.wet 0..1, default 1 on night palettes)
  const wet = o.wet == null ? (pal.stars ? 1 : 0) : o.wet; if (wet > 0) { for (let i = 0; i < 22; i++) { const x = (hash(i * 3.1) - .5) * 40, z = (hash(i * 5.3) - .5) * 40, r = .8 + 2.2 * hash(i * 7.7); if (Math.hypot(x, z) > 22) continue; const ring = []; for (let j = 0; j < 20; j++) { const an = j / 20 * TAU; ring.push([x + Math.cos(an) * r * (1 + .2 * Math.sin(an * 3 + i)), .012, z + Math.sin(an) * r * .7]); }
    const sp = projPoly(ring); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = rgba(mixHex(pal.skyMid, pal.skyLow, .4), .55 * wet); ctx.fill(); ctx.strokeStyle = rgba('#ffffff', .12 * wet); ctx.lineWidth = 1.5; ctx.stroke();
    if (o.rainRings !== false) for (let k = 0; k < 3; k++) { const ph = (t * 1.6 + hash(i * 11 + k)) % 1, cx = x + (hash(i + k * 7) - .5) * r, cz = z + (hash(i * 2 + k) - .5) * r * .6, q = project([cx, .015, cz]); if (!q || q.z < 1) continue; const rr = ph * .35 * q.s; ctx.strokeStyle = rgba('#e0ecff', .4 * (1 - ph) * wet); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(q.x, q.y, rr, rr * .3, 0, 0, TAU); ctx.stroke(); } }
    const tq = [[-HVG_AR.R + 1, 4, -6], [-HVG_AR.R + 1, 4, 6], [HVG_AR.R - 1, 4, -6], [HVG_AR.R - 1, 4, 6]]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const tp of tq) { const a2 = project([tp[0] * .8, .02, tp[2] * .9]), b2 = project([tp[0] * .55, .02, tp[2] * .7]); if (!a2 || !b2) continue; const gr = ctx.createLinearGradient(a2.x, a2.y, b2.x, b2.y); gr.addColorStop(0, rgba(pal.torch || '#ff8a3a', .22 * wet)); gr.addColorStop(1, rgba(pal.torch || '#ff8a3a', 0)); ctx.strokeStyle = gr; ctx.lineWidth = Math.max(4, .5 * a2.s); ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); } ctx.restore(); }
  // gates: west (Itachi) red paper lanterns + crows perched on the arch; east (Julius) a carved golden clock face above the arch
  if (o.gateDress !== false) { const GW = HVG.GATE_W, GE = HVG.GATE_E, top = HVG.GATE_TOP;
    for (const dz of [-4.2, 4.2]) { const p = [GW[0] + .6, 6.5, dz], q = project(p); if (!q || q.z < 1) continue; const s = .9 * q.s; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, s * 2.4, '#ff3a2a', .35); ctx.restore(); ctx.fillStyle = '#c81a1a'; ctx.strokeStyle = '#2a0404'; ctx.lineWidth = Math.max(1, s * .06); ctx.beginPath(); ctx.ellipse(q.x, q.y, s * .42, s * .6, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffb08a'; ctx.beginPath(); ctx.ellipse(q.x, q.y, s * .22, s * .4, 0, 0, TAU); ctx.globalAlpha = .5; ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#1a0a0a'; ctx.fillRect(q.x - s * .3, q.y - s * .66, s * .6, s * .1); ctx.fillRect(q.x - s * .3, q.y + s * .56, s * .6, s * .1); }
    for (let i = 0; i < 5; i++) { const p = [GW[0] + .3, top + .3, -3 + i * 1.5], q = project(p); if (q && q.z > 1) ijDrawCrow(ctx, q.x, q.y - .2 * q.s, .5 * q.s, 1.4 + Math.sin(t * 2 + i) * .3 * (i % 2), -HP * .15, { eye: true }); }
    const qc = project([GE[0] - .4, top - 3.2, 0]); if (qc && qc.z > 1) { const R = 2.4 * qc.s; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, qc.x, qc.y, R * 1.6, '#ffd36a', .25 + .15 * (o.clockGlow || 0)); ctx.restore(); if (typeof ijClockFace === 'function') ijClockFace(ctx, qc.x, qc.y, R, t * .02, .9, '#e8b84a'); } }
  // lightning: o.lightning = [t0, ...] (set time) -> sky flash + forked bolt for 0.25 s
  for (const lt0 of (o.lightning || [])) { const u = t - lt0; if (u < 0 || u > .25) continue; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#c8d8ff', .35 * (1 - u / .25)); ctx.fillRect(0, 0, W, H * .55); ctx.strokeStyle = rgba('#ffffff', 1 - u / .25); ctx.lineWidth = 4; let x = W * (.2 + .6 * hash(lt0 * 7)), y = 0; ctx.beginPath(); ctx.moveTo(x, y); while (y < H * .45) { x += (hash(y + lt0) - .5) * 90; y += 30; ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
  if ((o.feathers || 0) > 0 && typeof fxFeathers === 'function') fxFeathers(ctx, [0, 3, 0], (t * .3) % 2.4, { n: Math.round(30 * o.feathers), r: 14, dur: 2.5 });
} };
// ------------------------------------------------------------------------------------------------ TSUKUYOMI world
SETS.tsukuyomi = { pal: 'tsukuyomi', draw(ctx, t, o) {
  if (o.layer === 'fg') return; const pal = o.pal; const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, pal.skyTop); gr.addColorStop(.5, pal.skyMid); gr.addColorStop(.75, pal.skyLow); gr.addColorStop(1, '#3a0004'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const sk = CAM.cur; if (o.moon !== false) { const q = project(vAdd(sk.pos, vMul(vNorm([.35, .35, -1]), 800))); if (q) { const R = 150 * 40 / (sk.fov || 40); ctx.fillStyle = '#060002'; ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 6; ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, R * 1.6, '#ff2a1a', .25); ctx.restore(); } }
  ctx.fillStyle = '#050002'; for (let i = 0; i < 9; i++) { const q = project(vAdd([0, 0, 0], [(hash(i * 3) - .5) * 400, 60 + hash(i * 5) * 80, -300 - hash(i * 7) * 200])); if (!q) continue; const rw = (90 + 120 * hash(i)) * q.s / 4; ctx.beginPath(); ctx.ellipse(q.x + Math.sin(t * .1 + i) * 10, q.y, rw, rw * .14, 0, 0, TAU); ctx.fill(); }
  const fl = projPoly([[-200, 0, 200], [200, 0, 200], [200, 0, -400], [-200, 0, -400]]); if (fl.length > 2) { polyPath(ctx, fl); ctx.fillStyle = '#0a0204'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; for (let i = -12; i <= 12; i++) for (const ln of projLine([[i * 4, 0, 40], [i * 4, 0, -200]])) { polyPath(ctx, ln, false); ctx.stroke(); } for (let j = 0; j < 20; j++) for (const ln of projLine([[-60, 0, 30 - j * 6], [60, 0, 30 - j * 6]])) { polyPath(ctx, ln, false); ctx.stroke(); }
  const ck = o.crosses || 0; if (ck > 0) for (let i = 0; i < 5; i++) { const x = (i - 2) * 7, z = -12 - (i % 2) * 6, v = projPoly([[x - .25, 0, z], [x + .25, 0, z], [x + .25, 7, z], [x - .25, 7, z]]), hbar = projPoly([[x - 2.2, 5.2, z], [x + 2.2, 5.2, z], [x + 2.2, 5.8, z], [x - 2.2, 5.8, z]]); ctx.globalAlpha = ck; ctx.fillStyle = '#000'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    for (const pp of [v, hbar]) if (pp.length > 2) { polyPath(ctx, pp); ctx.fill(); ctx.stroke(); } ctx.globalAlpha = 1; }
} };
// ------------------------------------------------------------------------------------------------ fighter-card background
SETS.ijcard = { pal: 'arena_ij', draw(ctx, t, o) {
  if (o.layer === 'fg') return; const who = o.who || 'itachi', cx = W * (who === 'julius' ? .3 : .7), cy = H * .46;
  if (who === 'itachi') { const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a0408'); gr.addColorStop(1, '#050204'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx, cy, 700, '#c8101e', .35); ctx.restore(); ctx.save(); ctx.globalAlpha = .22; IJ.sharIris(ctx, cx, cy, 420, { k: 1, mk: 1, spin: t * .3 }); ctx.restore();
    for (let i = 0; i < 26; i++) { const ph = (t * .12 + hash(i * 3)) % 1, x = (hash(i * 7) * 1.3 - .15) * W + ph * 260, y = (1 - ph) * H * .9 + Math.sin(t * 2 + i) * 20; ijDrawCrow(ctx, x, y, 22 + 30 * hash(i * 5), t * 12 + i, -.25, { eye: true }); } }
  else if (who === 'julius') { const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#0a1230'); gr.addColorStop(1, '#1a1a3a'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx, cy, 700, '#f6d36a', .3); for (let r = 0; r < 4; r++) { ctx.strokeStyle = rgba(r % 2 ? '#8ad8ff' : '#f6d36a', .35); ctx.lineWidth = 3 + r; ctx.beginPath(); ctx.arc(cx, cy, 200 + r * 110, t * (r % 2 ? -.3 : .3), t * (r % 2 ? -.3 : .3) + 5.3); ctx.stroke(); }
    for (let i = 0; i < 12; i++) { const a = -HP + i / 12 * TAU + t * .05; ctx.font = '900 54px "Cinzel", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba('#fff2c0', .45); ctx.fillText(IJ_ROMAN[i], cx + Math.cos(a) * 470, cy + Math.sin(a) * 470); } ctx.restore();
    ctx.save(); ctx.globalAlpha = .2; fxWizardCrest(ctx, cx, cy, 300, { col: '#f6d36a' }); ctx.restore(); }
  else { ctx.fillStyle = '#050206'; ctx.fillRect(0, 0, W, H); const gl = ctx.createLinearGradient(0, 0, W, 0); gl.addColorStop(0, '#5a0810'); gl.addColorStop(.5, '#050206'); gl.addColorStop(1, '#2a2a5a'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); }
} };
// ------------------------------------------------------------------------------------------------ CROWD STARS: Dazai (wise) + Shunsui (premature verdicts), seated among silhouettes
Object.assign(POSES, {
  ij_sit: { sp: .08, hp: .05, aL: [.42, .25, 0], eL: 1.05, hL: 'relax', aR: [.42, .25, 0], eR: 1.05, hR: 'relax', lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .14, -.08], kR: 1.55, ground: false },
  ij_sitChin: { sp: .22, hp: .12, aL: [.55, -.1, 0], eL: 1.5, hL: 'relax', aR: [.85, -.35, .2], eR: 2.45, hR: 'relax', wR: [.25, .1], lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .22, -.25], kR: 1.4, ground: false },
  ij_sitLean: { sp: -.12, hp: -.05, aL: [.3, .6, 0], eL: .5, hL: 'flat', aR: [.3, .6, 0], eR: .5, hR: 'flat', lL: [1.35, .3, .2], kL: 1.3, lR: [1.45, .25, -.15], kR: 1.5, ground: false },
  ij_sitPoint: { sp: -.04, hp: -.12, aL: [.42, .25, 0], eL: 1.05, hL: 'relax', aR: [1.25, .75, 0], eR: .25, hR: 'point', lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .14, -.08], kR: 1.55, ground: false },
  ij_sitToast: { sp: -.05, hp: -.1, aL: [.42, .25, 0], eL: 1.05, hL: 'relax', aR: [1.9, .7, 0], eR: 1.0, hR: 'grip', lL: [1.35, .3, .2], kL: 1.3, lR: [1.45, .25, -.15], kR: 1.5, ground: false },
  ij_sitFinger: { sp: .1, hp: .0, aL: [.42, .25, 0], eL: 1.05, hL: 'relax', aR: [1.05, .2, 0], eR: 2.0, hR: 'point', lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .22, -.25], kR: 1.4, ground: false },
  ij_sitCheer: { sp: -.05, hp: -.1, aL: [2.6, .5, 0], eL: .5, hL: 'fist', aR: [2.6, .5, 0], eR: .5, hR: 'fist', lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .14, -.08], kR: 1.55, ground: false },
  ij_sitSlap: { sp: .12, hp: -.05, aL: [.42, .25, 0], eL: 1.05, hL: 'relax', aR: [.65, .05, 0], eR: .55, hR: 'flat', lL: [1.5, .14, .08], kL: 1.55, lR: [1.45, .14, -.08], kR: 1.55, ground: false },
  ij_sitGasp: { sp: -.2, hp: -.1, aL: [1.2, .2, 0], eL: 1.8, hL: 'open', aR: [1.2, .2, 0], eR: 1.8, hR: 'open', lL: [1.5, .14, .08], kL: 1.55, lR: [1.5, .14, -.08], kR: 1.55, ground: false },
});
IJ.STAR_ANG = 2.74; IJ.STAR_TIER = 1;
IJ.STARS = {
  shunsui: { cast: 'kyoraku', form: 'base', off: 0, base: 'ij_sitLean', face: 'smirk', cup: true },   // LEFT on screen (crowd.md)
  dazai: { cast: 'dazai', form: 'base', off: .03, base: 'ij_sitChin', face: 'smile' },             // RIGHT on screen
};
IJ.REACT = {
  // DAZAI - the wise one
  watch: { base: 'ij_sitChin', face: 'smile', faceOver: { eye: .55, look: [.25, .05] } }, knowing: { base: 'ij_sitChin', face: 'smile', faceOver: { closed: 1, closedUp: 1 } },
  explain: { base: 'ij_sitFinger', face: 'smile', talk: 1.2 }, narrow: { base: 'ij_sitChin', face: 'serious', faceOver: { eye: .35, lid: .45 } },
  smile: { base: 'ij_sitChin', face: 'smile' }, shock: { base: 'ij_sitGasp', face: 'shock' }, sigh: { base: 'ij_sit', face: 'calm', faceOver: { closed: 1 }, p: { hp: .25 }, shake: 1 },
  // SHUNSUI - premature verdicts
  verdict: { base: 'ij_sitPoint', face: 'laugh', talk: 1.4 }, toast: { base: 'ij_sitToast', face: 'smile' }, smug: { base: 'ij_sitLean', face: 'smirk' },
  oops: { base: 'ij_sitGasp', face: 'shock', faceOver: { sweat: 1 } }, laugh: { base: 'ij_sitLean', face: 'laugh', bob: 4 }, hush: { base: 'ij_sit', face: 'calm' },
  eyesWide: { base: 'ij_sit', face: 'serious', faceOver: { eye: 1.25, pupil: .6 } }, sweat: { base: 'ij_sitLean', face: 'smile', faceOver: { sweat: 1, eye: .4 } },
  cheer: { base: 'ij_sitCheer', face: 'grin', bob: 6, talk: 1.5 }, gasp: { base: 'ij_sitGasp', face: 'shock' },
  // crowd.md names
  kyo_kneeSlap: { base: 'ij_sitSlap', face: 'grin', talk: 1.3, slap: 1 }, kyo_point: { base: 'ij_sitPoint', face: 'laugh', talk: 1.3 }, kyo_cupRaise: { base: 'ij_sitToast', face: 'grin', talk: 1.1 },
  kyo_cupWave: { base: 'ij_sitToast', face: 'smile', talk: 1.2, wave: 1 }, kyo_laugh: { base: 'ij_sitLean', face: 'laugh', bob: 9, talk: 1.6 },
  dazai_sitSmile: { base: 'ij_sitChin', face: 'smile', faceOver: { eye: .35, lid: .2, look: [.25, .02] } }, dazai_headTilt: { base: 'ij_sit', face: 'smile', faceOver: { eye: .45 }, p: { hr: .28, hp: .1 }, talk: 1.1 },
  dazai_chinPoint: { base: 'ij_sit', face: 'smirk', p: { hp: -.18, hy: .25 }, talk: 1.1 }, dazai_watch: { base: 'ij_sitChin', face: 'serious', faceOver: { eye: .6, look: [.3, .05] } },
};
IJ.seat = (ang, tier = IJ.STAR_TIER) => { const rr = IJ.R + 1.5 + tier * HVG_AR.tread + HVG_AR.tread * .45, y = HVG_AR.h0 + (tier + 1) * HVG_AR.rise; return { p: [Math.cos(ang) * rr, y, Math.sin(ang) * rr], yaw: lookAt([Math.cos(ang) * rr, y, Math.sin(ang) * rr], [0, y, 0]) }; };
IJ.sitAt = (cast, ang, tier, poseName, over = {}) => { const s = IJ.seat(ang, tier), B = CAST[cast]._body || makeBody(CAST[cast]); return at([s.p[0], s.p[1] + .48 - B.pelvisH, s.p[2]], s.yaw, P(poseName, Object.assign({ ground: false }, over))); };
const IJ_STARFIG = {};
IJ.starFig = (key, reaction = 'hush', o = {}) => { const S = IJ.STARS[key]; if (!S || !CAST[S.cast]) return null; const id = key + '|' + reaction; if (IJ_STARFIG[id]) return IJ_STARFIG[id];
  const R = IJ.REACT[reaction] || IJ.REACT.hush, ang = IJ.STAR_ANG + S.off;
  const F = fig(S.cast, S.form, t => { const face = faceAnim(Object.assign(expr(R.face || S.face), R.faceOver || {}), t, { talk: R.talk || 0, seed: key.length }), over = Object.assign({ face }, R.p || {});
    if (R.shake) over.hy = Math.sin(t * 7) * .18; if (R.slap) { const sl = Math.abs(Math.sin(t * 5)); over.aR = [.65 + .5 * sl, .05, 0]; over.eR = .55 + .3 * sl; } if (R.wave) over.aR = [1.9 + .25 * Math.sin(t * 6), .7, 0]; if (R.bob) over.sp = (POSES[R.base || S.base].sp || 0) - Math.abs(Math.sin(t * R.bob)) * .08;
    return breathe(IJ.sitAt(S.cast, ang, IJ.STAR_TIER, R.base || S.base, over), t); }, { timing: 2, springWin: .4 });
  F.starKey = key; F.starCup = S.cup && reaction !== 'oops' && reaction !== 'kyo_point'; return (IJ_STARFIG[id] = F); };
// seated silhouettes around the pair (cheap flat figures of stock casts, different builds)
IJ.CROWD_CASTS = ['byakuya', 'kenpachi', 'urahara', 'tosen', 'mayuri', 'hitsugaya', 'aizen', 'shinji', 'gowther', 'harry', 'gojo', 'naruto', 'luffy', 'yujiro'];
const IJ_SILFIG = {};
IJ.silFig = (i, ang, tier, react) => { if (react === 'freeze') react = 'gasp'; const id = i + '|' + ang.toFixed(3) + '|' + tier + '|' + react; if (IJ_SILFIG[id]) return IJ_SILFIG[id]; const casts = IJ.CROWD_CASTS.filter(c => CAST[c]), cast = casts[i % casts.length];
  const base = react === 'cheer' || react === 'roar' ? (i % 2 ? 'ij_sitCheer' : 'ij_sit') : react === 'gasp' ? (i % 3 ? 'ij_sitGasp' : 'ij_sit') : (i % 3 === 0 ? 'ij_sitLean' : 'ij_sit');
  const F = fig(cast, 'base', t => breathe(IJ.sitAt(cast, ang, tier, base, { hy: Math.sin(t * .7 + i) * .15, sp: (POSES[base].sp || 0) + (react === 'cheer' ? -Math.abs(Math.sin(t * 6 + i)) * .1 : 0) }), t + i), { timing: 2, springWin: 0 });
  return (IJ_SILFIG[id] = F); };
IJ.crowdPair = (f, lt, o = {}) => { const rD = o.rD || 'watch', rS = o.rS || 'smug', react = o.react || 'hush', col = o.silCol || '#0c0a10', rim = o.rim || '#ff9a60';
  const Fd = IJ.starFig('dazai', rD), Fs = IJ.starFig('shunsui', rS); if (Fd) f.fig(Fd, { shadow: false }); if (Fs) f.fig(Fs, { shadow: false });
  if (Fs && Fs.starCup && typeof drawCup === 'function') f.fx(g => { const S = figSkel(Fs, onN(lt, 2)); drawCup(g, vAdd(S.J.handR, [0, .05, 0]), { size: .07, fill: '#e8d8b0' }); }, { layer: 'over' });
  const slots = [[-.03, 0], [.06, 0], [-.06, 0], [.09, 0], [-.012, 1], [.018, 1], [.048, 1], [-.042, 1], [.078, 1], [.0, -1], [.03, -1], [-.03, -1]], n = o.n || slots.length;
  const frz = react === 'freeze'; slots.slice(0, n).forEach(([da, dt], i) => { const F = IJ.silFig(i, IJ.STAR_ANG + da, IJ.STAR_TIER + dt, react); f.fig(F, Object.assign({ mode: 'flat', col: frz ? '#6a6e78' : dt > 0 ? shadeHex(col, .08) : col, shadow: false }, frz ? { t: o.freezeT || 0 } : {})); });
  // stone benches under them
  f.fx(g => { for (const dt of [0, 1]) { const s0 = IJ.seat(IJ.STAR_ANG - .09, IJ.STAR_TIER + dt), s1 = IJ.seat(IJ.STAR_ANG + .12, IJ.STAR_TIER + dt), pts = []; for (let i = 0; i <= 10; i++) { const a = lerp(IJ.STAR_ANG - .09, IJ.STAR_ANG + .12, i / 10), s = IJ.seat(a, IJ.STAR_TIER + dt); pts.push([s.p[0], s.p[1] + .45, s.p[2]]); }
    const runs = projLine(pts); g.save(); g.strokeStyle = '#3a3238'; g.lineWidth = 10; for (const r of runs) { polyPath(g, r, false); g.stroke(); } g.restore(); void s0; void s1; } }, { layer: 'under' });
  void rim; return { Fd, Fs }; };
IJ.crowdShot = (f, lt, o = {}) => { const pal = o.pal || 'arena_ij', focus = o.focus || 'both';
  std(f, { pal }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .4, rimAmt: .9, rimCol: o.rimCol || '#ffb070' });
  f.bg(Object.assign({ set: 'ijarena', pal, dmg: o.dmg || 0, react: o.react || 'hush' }, o.bg || {}));
  const { Fd, Fs } = IJ.crowdPair(f, lt, o), tgt = focus === 'shunsui' ? Fs : Fd; if (!tgt) return;
  let cam; if (focus === 'both' || o.part === 'two') { const a = figPos(Fd, lt, 'head'), b = figPos(Fs, lt, 'head'), c = vLerp(a, b, .5), out = vNorm([-c[0], 0, -c[2]]), side = [-out[2], 0, out[0]], d = (o.dist || 2.6) - (o.push || .35) * clamp(lt / 2, 0, 1);
    cam = { pos: vAdd(vAdd(c, vMul(out, d)), vAdd(vMul(side, (o.az || .25) * d), [0, -.15, 0])), target: vAdd(c, [0, -.12, 0]), fov: o.fov || 34 }; }
  else cam = closeCam(tgt, lt, Object.assign({ part: o.part || 'bust', az: o.az == null ? (focus === 'shunsui' ? -.35 : .35) : o.az, el: .03 }, o.cam || {}));
  if (o.push !== 0 && focus !== 'both' && o.part !== 'two') { const k = (o.push || .12) * clamp(lt / 2.5, 0, 1); cam = Object.assign({}, cam, { pos: vLerp(cam.pos, cam.target, k) }); }
  f.cam(camHandheld(cam, lt, .005, 7));
  f.fx(g => fxCrowdFG(g, o.react === 'freeze' ? (o.freezeT || 0) : lt, { n: 6, size: 420, rim: o.rimCol || '#ff9a50', col: o.react === 'freeze' ? '#3a3e48' : undefined, react: o.react === 'cheer' ? 'roar' : 'hush' }), { layer: 'over' });
  // canopy edge at the top of the frame with rain dripping off it (crowd.md)
  if (o.canopy !== false) f.fx(g => { g.save(); g.fillStyle = '#120e10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 70); for (let x = W; x >= 0; x -= 120) g.lineTo(x, 70 + (x / 120 % 2) * 14); g.closePath(); g.fill(); g.fillStyle = '#2a2026'; g.fillRect(0, 62, W, 10);
    if (o.react !== 'freeze') { g.strokeStyle = 'rgba(200,220,255,.55)'; g.lineWidth = 2.5; g.lineCap = 'round'; for (let i = 0; i < 22; i++) { const x = (i + .5) / 22 * W + (hash(i) - .5) * 40, ph = (lt * 2.4 + hash(i * 3)) % 1, y0 = 76 + ph * 900; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 40); g.stroke(); } }
    else { g.fillStyle = 'rgba(230,240,255,.85)'; for (let i = 0; i < 22; i++) { const x = (i + .5) / 22 * W + (hash(i) - .5) * 40, y0 = 76 + hash(i * 3) * 900; g.beginPath(); g.arc(x, y0, 4, 0, TAU); g.fill(); } }
    g.restore(); }, { layer: 'top' });
  // field flashes on faces: o.flash 'red' (Itachi hit) | 'gold' (Julius) at o.flashT (local time)
  if (o.flash) { const u = lt - (o.flashT || 0); if (u >= 0 && u < .5) { const col = o.flash === 'gold' ? '#ffd36a' : '#ff3a2a', kk = 1 - u / .5; f.light({ fx: [{ p: vAdd(IJ.seat(IJ.STAR_ANG + .015).p, vMul(vNorm(IJ.seat(IJ.STAR_ANG).p), -6)), col, r: 10, a: .9 * kk }] }); f.flash(col, .18 * kk); } }
  if (o.react === 'freeze') f.grade({ sat: .25, tint: ['#c8d4ff', .2] });
};

// storm sky over the arena (SKY code): heavens + red moon behind cloud bands + rain haze
(function () { const base = SETS.heavens.draw; SETS.heavens.draw = function (ctx, t, o) { base.call(this, ctx, t, o); if (o.layer === 'fg' || !o.redMoon) return; const q = project(vAdd(CAM.cur.pos, vMul(vNorm([.3, .25, -1]), 900))); if (!q) return; const R = 60 * 40 / (CAM.cur.fov || 40);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, R * 3, '#c83a3a', .35); ctx.restore(); ctx.fillStyle = radial(ctx, q.x - R * .2, q.y - R * .2, R * 1.2, [[0, '#ff8a7a'], [.7, '#c83a3a'], [1, '#6a1010']]); ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(12,12,20,.85)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(q.x + Math.sin(t * .1 + i) * R * .5, q.y - R * .5 + i * R * .55, R * 1.6, R * .13, 0, 0, TAU); ctx.fill(); } }; })();
