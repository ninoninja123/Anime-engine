/* engine/sets_gow2.js (agent E, gowther-dazai-urahara) - the remaining sets of pre/cast.md (BG codes in brackets; see showdown/common.js BGX).
     shopin     (shop_morning) [SHOP]  URAHARA SHOTEN interior, morning: plank shop floor, candy shelves, low counter (black cat Yoruichi on it, o.cat:false),
                                       raised tatami room with shoji behind (z < -3), coat rack with a PINK FLOWERED HAORI + sake bottle with a note (o.haori:false),
                                       broom, sliding front doors at z = +6 letting in warm light.  Characters stand around x,z = 0 (counter at z = -1.6).
     yokoalley  (alley_rain)   [YOKO]  YOKOHAMA RAINY-NIGHT ALLEY along -z: wet asphalt with neon reflections, pink + teal neon signs, pipes, AC units, oil drums,
                                       puddles; at the far end the bay + Cosmo Clock; o.crack 0..1 = pink crack in the sky.  (rain: fxRain, added by BGX)
     mindlib    (mindlib)      [LIB]   GOWTHER'S MIND LIBRARY = MARIONETTE THEATRE: the memlib shelves in lavender, glowing books, a proscenium stage at z -16,
                                       strings + bodiless marionettes hanging from the dark, o.locked (chained shelf at x -A, z -6), o.mem floating memories
     paperwhite (paper)        [WHITE] NO LONGER HUMAN WORLD: white paper floor (ruled lines), paper sky, floating 人間失格 glyphs, blank open books, cut strings
     stitch     (stitch)       [STITCH] BANKAI REBUILD WORLD: black floor sewn together with red stitches + gold seams, red-lit slits, a huge seam across the sky,
                                       black curtains at the sides.  o.sew 0..1 animates the stitches closing
     voidboard  (voidpink)     [VOID]  COLD OPEN: a broken chessboard island floating in black-pink void, fallen pieces, a wall clock (hands run BACKWARD with t),
                                       pink mist, tiles crumbling at the edges (o.crumble 0..1)
   BOARD = shiftarena with o.floor 'chess' and walls 'books' -> 'alley' -> 'shopdoor' (+ o.queens:true three queens, sets_gow.js).                 */
'use strict';
Object.assign(PALETTES, {
  shop_morning: { skyTop: '#8ab8e8', skyMid: '#cfe2f4', skyLow: '#fff2d8', fog: '#f0d8b0', sun: [.2, .55, .8], ground: '#8a5a33', ground2: '#5a3a20', wall: '#e8d8b8', wallShade: '#8a6a48', roof: '#3a2a20', roofShade: '#20160e', wood: '#8a5a33', cloud: '#ffffff', cloudShade: '#c8d8e8', haze: .3, line: '#1a1008', amb: '#ffe7b8' },
  alley_rain: { skyTop: '#05070e', skyMid: '#121a30', skyLow: '#1b2a44', fog: '#1a2440', sun: [-.2, .6, .5], ground: '#20283a', ground2: '#0c1018', wall: '#2a2e3e', wallShade: '#12141e', roof: '#181a24', roofShade: '#0c0d12', wood: '#2a2420', cloud: '#1a2238', cloudShade: '#0a0e1a', haze: .55, line: '#04060a', amb: '#7a9ad8', stars: false },
  mindlib: { skyTop: '#120c1e', skyMid: '#3a2a5a', skyLow: '#8a70b8', fog: '#6a5490', sun: [.2, .7, .5], ground: '#2a2038', ground2: '#140e1e', wall: '#c9b8e8', wallShade: '#4a3a6a', roof: '#1a1424', roofShade: '#0e0a14', wood: '#4a3658', cloud: '#8a70b8', cloudShade: '#3a2a5a', haze: .65, line: '#0e0a14', amb: '#e8d0ff' },
  paper: { skyTop: '#e8f0f8', skyMid: '#f4f2ec', skyLow: '#fbfaf6', fog: '#f7f4ec', sun: [-.3, .8, .4], ground: '#f7f4ec', ground2: '#e4e0d6', wall: '#ffffff', wallShade: '#cfd8e4', roof: '#d8dce4', roofShade: '#aab4c4', wood: '#c8c4bc', cloud: '#ffffff', cloudShade: '#dfe6ee', haze: .5, line: '#1a1a22', amb: '#ffffff' },
  stitch: { skyTop: '#0a0608', skyMid: '#1a1014', skyLow: '#4a0c16', fog: '#2a0a12', sun: [.3, .7, .4], ground: '#241a1e', ground2: '#0e0a0c', wall: '#1a1418', wallShade: '#0a080a', roof: '#0b0b0e', roofShade: '#050505', wood: '#2a1a14', cloud: '#2a0a10', cloudShade: '#0e0406', haze: .4, line: '#000000', amb: '#ff6a7a' },
  voidpink: { skyTop: '#030205', skyMid: '#07060a', skyLow: '#3a1030', fog: '#2a0c24', sun: [-.3, .7, .5], ground: '#e8e0f0', ground2: '#1a1424', wall: '#d8d0e8', wallShade: '#4a3a5a', roof: '#16101c', roofShade: '#08060a', wood: '#3a2a3a', cloud: '#4a1a40', cloudShade: '#1a0818', haze: .5, line: '#07060a', amb: '#ffb0e0' },
});
Object.assign(GRADES, {
  shop_morning: { sat: 1.08, contrast: 1.04, soft: ['#ffe7b8', .18] }, alley_rain: { sat: 1.1, contrast: 1.12, tint: ['#9ab0e8', .2], lift: ['#0a1020', .06] },
  mindlib: { sat: 1.05, contrast: 1.08, tint: ['#e0d0ff', .18], lift: ['#1a1030', .06] }, paper: { sat: .6, contrast: 1.05, tint: ['#f0f4ff', .1] },
  stitch: { sat: 1.15, contrast: 1.18, lift: ['#2a0408', .05] }, voidpink: { sat: 1.1, contrast: 1.12, lift: ['#2a0a24', .07] },
});
Object.assign(window.GOW_PALPOST, { paper: { bloom: .15, halation: 0, vignette: .2 }, shop_morning: { bloom: .35 }, alley_rain: { bloom: .6 }, mindlib: { bloom: .5 }, stitch: { bloom: .6, vignette: .6 }, voidpink: { bloom: .55 } });

// ================================================================================================ URAHARA SHOTEN interior
SETS.shopin = { pal: 'shop_morning', draw(ctx, t, o) {
  const pal = o.pal, X = 6, Z0 = -7, Z1 = 6, Hh = 3.3;
  if (bgPass(o)) { ctx.fillStyle = '#2a1a10'; ctx.fillRect(0, 0, W, H);
    sadPoly(ctx, [[-X, 0, -3], [X, 0, -3], [X, 0, Z1], [-X, 0, Z1]], '#8a5a33'); for (let x = -X; x <= X; x += .45) gowLines(ctx, [[x, .002, -3], [x, .002, Z1]], 1, rgba('#4a2a14', .5));
    // tatami room (raised .4) with shoji back wall
    sadPoly(ctx, [[-X, .4, Z0], [X, .4, Z0], [X, .4, -3], [-X, .4, -3]], '#c8b878'); for (let i = 0; i < 6; i++) gowLines(ctx, [[-X + i * 2, .402, Z0], [-X + i * 2, .402, -3]], 2, rgba('#5a4a2a', .6)); gowLines(ctx, [[-X, .402, -5], [X, .402, -5]], 2, rgba('#5a4a2a', .6));
    sadPoly(ctx, [[-X, 0, -3], [X, 0, -3], [X, .4, -3], [-X, .4, -3]], '#5a3a20', 1);
    gowQuad(ctx, [-X, .4, Z0], [X, .4, Z0], Hh, '#f2ead6'); for (let i = 0; i <= 12; i++) gowLines(ctx, [[-X + i, .4, Z0 + .02], [-X + i, .4 + Hh, Z0 + .02]], i % 3 ? 1.2 : 4, '#5a3a20'); for (let y = .9; y < Hh; y += .6) gowLines(ctx, [[-X, .4 + y, Z0 + .02], [X, .4 + y, Z0 + .02]], 1, rgba('#6a4a2e', .7));
    gowGlowAt(ctx, [0, 2, Z0 + .1], 6, '#fff2d0', .35);
    // side walls with candy shelves
    for (const sg of [-1, 1]) { const x = sg * X; gowQuad(ctx, [x, 0, Z0], [x, 0, Z1], Hh + .4, '#d8c4a0'); for (let s = 0; s < 4; s++) { const y = .5 + s * .6; sadPoly(ctx, [[x - sg * .02, y, -2.8], [x - sg * .02, y, 5], [x - sg * .4, y, 5], [x - sg * .4, y, -2.8]], '#6a4426'); for (let b = 0; b < 26; b++) { const z = -2.6 + b * .3, c = ['#e85a5a', '#5ab0e8', '#f2c84a', '#8ae05a', '#e88ad8', '#ffffff'][Math.floor(hash(b * 3 + s * 7 + (sg > 0 ? 50 : 0)) * 6)]; sadPoly(ctx, [[x - sg * .05, y, z], [x - sg * .05, y, z + .22], [x - sg * .05, y + .3 + .15 * hash(b + s), z + .22], [x - sg * .05, y + .3 + .15 * hash(b + s), z]], c); } } }
    // front sliding doors (+z): bright morning light, lattice
    gowQuad(ctx, [-X, 0, Z1], [X, 0, Z1], Hh, '#fff4dc'); for (let i = 0; i <= 8; i++) gowLines(ctx, [[-X + i * 1.5, 0, Z1 - .02], [-X + i * 1.5, Hh, Z1 - .02]], 3, '#6a4426'); gowLines(ctx, [[-X, 1.1, Z1 - .02], [X, 1.1, Z1 - .02]], 2.5, '#6a4426');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 4; i++) { const a = project([-4.5 + i * 3, 2.6, Z1]), b = project([-3.5 + i * 3, 0, 1]); if (!a || !b) continue; const gr = ctx.createLinearGradient(a.x, a.y, b.x, b.y); gr.addColorStop(0, 'rgba(255,236,190,.42)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(a.x - 30, a.y); ctx.lineTo(a.x + 30, a.y); ctx.lineTo(b.x + 80, b.y); ctx.lineTo(b.x - 80, b.y); ctx.fill(); } ctx.restore();
    // ceiling beams
    for (let z = Z0; z <= Z1; z += 2.2) gowLines(ctx, [[-X, Hh + .4, z], [X, Hh + .4, z]], 5, '#3a2416'); }
  const key = 'shopin'; if (!SETCACHE[key]) { const I = [];
    // counter
    I.push({ c: [0, 0, -1.6], h: 1, w: 6, d: .7, draw: (g, p) => { sadBox3(g, [0, 0, -1.6], 6, .7, .95, '#7a4a28', p, { top: '#a8703e' }); gowLines(g, [[-3, .5, -1.24], [3, .5, -1.24]], 1.5, 'rgba(0,0,0,.35)'); } });
    // cat on the counter (o.cat) - drawn by the set so it sits correctly
    I.push({ c: [1.8, .95, -1.6], h: .4, w: .4, draw: (g, p, tt) => { if (GOW_SETSTATE.cat === false) return; drawCat(g, [1.8, .95, -1.6], { pose: 'sit', t: tt, size: .38, flip: true }); const e = project([1.83, 1.3, -1.45]); if (e) { g.fillStyle = '#f2c84a'; g.fillRect(e.x - 3, e.y - 1, 2.5, 2); g.fillRect(e.x + 2, e.y - 1, 2.5, 2); } } });
    // coat rack with the pink flowered haori + sake bottle with note
    I.push({ c: [-4.6, 0, -2.4], h: 2, w: 1, draw: (g, p, tt) => { if (GOW_SETSTATE.haori === false) return; gowLines(g, [[-4.6, 0, -2.4], [-4.6, 2.1, -2.4]], Math.max(2, sadInkW([-4.6, 1, -2.4], 3)), '#4a2e18'); gowLines(g, [[-5.1, 2.0, -2.4], [-4.1, 2.0, -2.4]], 3, '#4a2e18');
      const sp = sadPoly(g, [[-5.2, 2.0, -2.38], [-4.0, 2.0, -2.38], [-3.85, .7, -2.36], [-5.35, .7, -2.36]], '#f2a0c4', sadInkW([-4.6, 1.3, -2.4], 1), '#3a1a24'); if (sp) { g.save(); polyPath(g, sp); g.clip(); for (let i = 0; i < 14; i++) { const q = project([-5.2 + hash(i) * 1.3, .8 + hash(i * 3) * 1.1, -2.35]); if (!q) continue; const r = .06 * q.s; g.fillStyle = i % 2 ? '#ffffff' : '#ffe0ec'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.ellipse(q.x + Math.cos(a) * r, q.y + Math.sin(a) * r, r * .7, r * .45, a, 0, TAU); g.fill(); } } g.restore(); }
      const b = [-3.4, .95, -1.6]; const q = project(b); if (q) { const s = q.s; g.fillStyle = '#f2ead6'; g.fillRect(q.x - .06 * s, q.y - .32 * s, .12 * s, .32 * s); g.fillRect(q.x - .025 * s, q.y - .42 * s, .05 * s, .1 * s); g.strokeStyle = '#2a1a10'; g.lineWidth = 1.2; g.strokeRect(q.x - .06 * s, q.y - .32 * s, .12 * s, .32 * s); g.fillStyle = '#c8203a'; g.fillRect(q.x - .06 * s, q.y - .2 * s, .12 * s, .06 * s); g.fillStyle = '#fffaf0'; g.save(); g.translate(q.x + .1 * s, q.y - .18 * s); g.rotate(.2); g.fillRect(0, 0, .14 * s, .09 * s); g.restore(); } } });
    // broom leaning by the door
    I.push({ c: [4.8, 0, 5], h: 1.5, w: .4, draw: g => { gowLines(g, [[4.9, 0, 5.3], [5.4, 1.5, 5.6]], 3, '#a8803a'); const pa = project([4.9, .05, 5.3]); if (pa) { g.fillStyle = '#c8a050'; g.beginPath(); g.moveTo(pa.x - .15 * pa.s, pa.y); g.lineTo(pa.x + .15 * pa.s, pa.y); g.lineTo(pa.x + .05 * pa.s, pa.y - .35 * pa.s); g.lineTo(pa.x - .05 * pa.s, pa.y - .35 * pa.s); g.fill(); } } });
    SETCACHE[key] = I; }
  GOW_SETSTATE.cat = o.cat; GOW_SETSTATE.haori = o.haori; drawItems(ctx, SETCACHE[key], pal, o, t);
  if (o.layer !== 'bg') { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 40; i++) { const u = (t * .04 + hash(i)) % 1, q = project([(hash(i * 3) - .5) * 9, .4 + u * 2.4, 1 + hash(i * 5) * 4]); if (q) { ctx.fillStyle = rgba('#fff0c8', .6 * Math.sin(u * Math.PI)); ctx.fillRect(q.x, q.y, Math.max(1, .03 * q.s), Math.max(1, .03 * q.s)); } } ctx.restore(); }
} };

// ================================================================================================ YOKOHAMA RAINY ALLEY
SETS.yokoalley = { pal: 'alley_rain', draw(ctx, t, o) {
  const pal = o.pal, A = 3.4, Z1 = 10, Z0 = -60;
  if (bgPass(o)) { const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, pal.skyTop); sky.addColorStop(1, pal.skyLow); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // far end: bay with Cosmo Clock (reuse sets_sad skyline far away) + pink crack in the sky
    if (typeof sadSkyline === 'function') { ctx.save(); sadSkyline(ctx, pal, t, 0); ctx.restore(); }
    if (o.crack) { const q = project([0, 160, -700]); if (q) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = rng(4); ctx.strokeStyle = rgba('#ff7ad8', .9 * o.crack); ctx.lineWidth = 6; let x = q.x - 300 * o.crack, y = q.y; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 14 * o.crack; i++) { x += 30 + r() * 30; y += (r() - .5) * 60; ctx.lineTo(x, y); } ctx.stroke(); glow(ctx, q.x, q.y, 400 * o.crack, '#ff7ad8', .3); ctx.restore(); } }
    // wet asphalt: dark, glossy with neon reflection streaks
    const fl = gowFloor(ctx, 200, '#1a2234', '#0a0e16', { far: '#2a3450' }); if (fl) { ctx.save(); polyPath(ctx, fl); ctx.clip(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 16; i++) { const sg = i % 2 ? 1 : -1, z = Z1 - 2 - i * 3.6, col = ['#ff4aa8', '#2ae0d0', '#ffb04a', '#ff4aa8'][i % 4]; if (typeof sadReflect === 'function') sadReflect(ctx, [sg * (A - .3), 3 + hash(i) * 3, z], .6, .9, col, .45, t, i); } ctx.restore();
      ctx.fillStyle = 'rgba(160,190,255,.12)'; for (let i = 0; i < 12; i++) { const q = project([(hash(i * 3) - .5) * 5, .002, Z1 - 1 - hash(i * 7) * 30]); if (q) { ctx.beginPath(); ctx.ellipse(q.x, q.y, (.6 + hash(i) * .9) * q.s, (.12 + hash(i) * .1) * q.s, 0, 0, TAU); ctx.fill(); } } } }
  const key = 'yokoalley'; if (!SETCACHE[key]) { const I = [];
    for (const sg of [-1, 1]) for (let k = 0; k < 14; k++) { const z = Z1 - k * 5, x = sg * A, c = [x + sg * 2, 0, z - 2.5], hgt = 9 + hash(k * 3 + (sg > 0 ? 9 : 0)) * 10, sd = k * 2 + (sg > 0 ? 1 : 0); I.push({ c, h: hgt, w: 5, d: 4, draw: (g, p, tt, zz) => {
      const face = [[x, 0, z], [x, 0, z - 5], [x, hgt, z - 5], [x, hgt, z]]; sadPoly(g, face, fogMix(['#2a2e3e', '#30283a', '#262a30'][sd % 3], zz, p, 1), sadInkW(c, .6), '#05060a');
      for (let fl = 1; fl < hgt / 2.6; fl++) for (let w2 = 0; w2 < 3; w2++) { const zz2 = z - .6 - w2 * 1.5, y = fl * 2.6, on = hash(sd * 31 + fl * 7 + w2) < .3; sadPoly(g, [[x - sg * .01, y, zz2], [x - sg * .01, y, zz2 - .9], [x - sg * .01, y + 1.2, zz2 - .9], [x - sg * .01, y + 1.2, zz2]], on ? '#ffd890' : fogMix('#0e1018', zz, p, 1)); }
      gowLines(g, [[x - sg * .15, 0, z - .2], [x - sg * .15, hgt, z - .2]], Math.max(1, sadInkW(c, 1.4)), fogMix('#4a4a58', zz, p, 1));   // drain pipe
      if (hash(sd * 5) < .55) sadBox3(g, [x - sg * .35, 2.4 + hash(sd) * 3, z - 2.5], .7, 1, .5, fogMix('#8a8e98', zz, p, 1), p);   // AC unit
      if (hash(sd * 7) < .6) { const col = ['#ff4aa8', '#2ae0d0', '#ffb04a'][sd % 3], ny = 3 + hash(sd * 11) * 4, nz = z - 1.2 - hash(sd) * 2, sp = sadPoly(g, [[x - sg * .2, ny, nz], [x - sg * .2, ny, nz - 1.6], [x - sg * .2, ny + .6, nz - 1.6], [x - sg * .2, ny + .6, nz]], '#0a0a10', 1.5, col);
        const q = project([x - sg * .22, ny + .3, nz - .8]); if (q && sp) { g.save(); g.globalCompositeOperation = 'screen'; glow(g, q.x, q.y, 2.2 * q.s, col, .5 * (.85 + .15 * Math.sin(tt * 9 + sd))); g.restore(); g.fillStyle = mixHex(col, '#ffffff', .5); g.font = `900 ${Math.max(6, .4 * q.s)}px "IPAGothic", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['バー', '酒', 'BAR', '喫茶', 'ホテル'][sd % 5], q.x, q.y); } } } }); }
    for (let i = 0; i < 5; i++) { const c = [(i % 2 ? 1 : -1) * (A - .6), 0, Z1 - 3 - i * 6.5]; I.push({ c, h: 1, w: .7, draw: (g, p) => { if (typeof drawDrumCan === 'function') drawDrumCan(g, c, { col: ['#3a5a7a', '#7a3a2a', '#4a5a3a'][i % 3] }); } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };

// ================================================================================================ MIND LIBRARY = MARIONETTE THEATRE
SETS.mindlib = { pal: 'mindlib', draw(ctx, t, o) {
  const pal = o.pal, A = o.aisle || 5;
  SETS.memlib.draw(ctx, t, Object.assign({}, o, { mem: o.mem == null ? 18 : o.mem }));
  if (o.layer === 'fg') return;
  // glowing books (pink / gold) along the shelves
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 40; i++) { const sg = i % 2 ? 1 : -1, z = 12 - hash(i * 3) * 70, y = .5 + Math.floor(hash(i * 5) * 8) * 1.8 + .8, q = project([sg * (A + .5), y, z]); if (!q || q.z < 1) continue; const a = .5 + .5 * Math.sin(t * 2 + i); glow(ctx, q.x, q.y, 1.4 * q.s, i % 3 ? '#ff7ad8' : '#e8c47a', .45 * a); ctx.fillStyle = rgba('#fff0fa', .8 * a); ctx.fillRect(q.x - .06 * q.s, q.y - .6 * q.s, .12 * q.s, 1.2 * q.s); } ctx.restore();
  // proscenium stage in the aisle (gold frame, red curtain swags, lit floor)
  const zS = o.stageZ == null ? -16 : o.stageZ; sadPoly(ctx, [[-A + .8, .6, zS - 3], [A - .8, .6, zS - 3], [A - .8, .6, zS + 1], [-A + .8, .6, zS + 1]], '#7a5434', 1); sadPoly(ctx, [[-A + .8, 0, zS + 1], [A - .8, 0, zS + 1], [A - .8, .6, zS + 1], [-A + .8, .6, zS + 1]], '#3a2016', 1);
  for (const pts of [[[-A + .5, 0, zS + 1.1], [-A + 1.1, 0, zS + 1.1], [-A + 1.1, 8, zS + 1.1], [-A + .5, 8, zS + 1.1]], [[A - 1.1, 0, zS + 1.1], [A - .5, 0, zS + 1.1], [A - .5, 8, zS + 1.1], [A - 1.1, 8, zS + 1.1]], [[-A + .5, 7.4, zS + 1.1], [A - .5, 7.4, zS + 1.1], [A - .5, 8.2, zS + 1.1], [-A + .5, 8.2, zS + 1.1]]]) sadPoly(ctx, pts, '#e8c47a', 1.2, '#4a3010');
  for (const sg of [-1, 1]) { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([sg * (A - 1.1) - sg * u * 1.8, .6 + (1 - Math.sin(u * Math.PI * .5)) * 6.6, zS + 1]); } pts.push([sg * (A - 1.1), 7.4, zS + 1]); sadPoly(ctx, pts, '#8a1422', 1, '#1a0206'); }
  const sq = project([0, .62, zS - 1]); if (sq) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,220,240,.3)'; ctx.beginPath(); ctx.ellipse(sq.x, sq.y, 2.4 * sq.s, .7 * sq.s, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // strings from the dark + bodiless marionettes (heads + hands only, like dropped puppets)
  for (let i = 0; i < (o.strings == null ? 14 : o.strings); i++) { const x = (hash(i * 3) - .5) * (A * 1.7), z = 8 - hash(i * 7) * 40, y0 = 4 + hash(i * 5) * 5 + Math.sin(t * .8 + i) * .15, top = [x, 22, z], bot = [x, y0, z]; gowLines(ctx, [top, bot], 1, rgba('#ffd8f4', .55));
    const q = project(bot); if (!q || q.z < 1) continue; if (i % 3 === 0) drawHarlequin(ctx, bot, { size: .7, t: t + i, phase: i, swing: .1, col: '#5a3a8a', col2: '#e8e0f4', face: 'blank', alpha: .9, strings: false }); else { const r = .14 * q.s; ctx.fillStyle = '#f6eee8'; ctx.beginPath(); ctx.ellipse(q.x, q.y, r, r * 1.15, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a1018'; ctx.lineWidth = Math.max(1, r * .1); ctx.stroke(); ctx.fillStyle = '#1a1018'; ctx.fillRect(q.x - r * .5, q.y - r * .1, r * .25, r * .3); ctx.fillRect(q.x + r * .25, q.y - r * .1, r * .25, r * .3); } }
  // locked shelf: chains across one bookcase + a padlock glow
  if (o.locked !== false) { const z = o.lockZ == null ? -6 : o.lockZ, x = -(A + .55); for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([x + .05, 3 + k * 3.5 + Math.sin(u * Math.PI) * -.6 + (u - .5) * 1.2, z + 2 - u * 4]); } gowLines(ctx, pts, Math.max(2, sadInkW([x, 5, z], 2.5)), '#8a8494'); } const q = project([x + .1, 5.5, z]); if (q) { ctx.fillStyle = '#c8a24a'; ctx.fillRect(q.x - .25 * q.s, q.y - .3 * q.s, .5 * q.s, .45 * q.s); ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 2; ctx.strokeRect(q.x - .25 * q.s, q.y - .3 * q.s, .5 * q.s, .45 * q.s); ctx.beginPath(); ctx.arc(q.x, q.y - .3 * q.s, .15 * q.s, Math.PI, 0); ctx.stroke(); } }
} };

// ================================================================================================ NO LONGER HUMAN: paper world
SETS.paperwhite = { pal: 'paper', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, pal.skyTop); sky.addColorStop(.7, pal.skyMid); sky.addColorStop(1, pal.skyLow); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const fl = gowFloor(ctx, 300, '#f7f4ec', '#e8e2d6', { far: '#fbfaf6' }); if (fl) { ctx.save(); polyPath(ctx, fl); ctx.clip(); const cz = Math.round(CAM.cur.target[2]); for (let z = cz - 60; z < cz + 20; z += 1.2) gowLines(ctx, [[-80, .002, z], [80, .002, z]], 1, rgba('#9ab4d8', .35)); gowLines(ctx, [[-3, .003, cz + 20], [-3, .003, cz - 60]], 1.5, rgba('#e89aa8', .5)); ctx.restore(); }
    // ink drips / splashes on the paper
    const r = rng(8); for (let i = 0; i < 7; i++) { const q = project([(r() - .5) * 30, .003, -2 - r() * 30]); if (!q) continue; ctx.fillStyle = rgba('#1a1a22', .75); ctx.beginPath(); ctx.ellipse(q.x, q.y, (.2 + r() * .5) * q.s, (.06 + r() * .1) * q.s, 0, 0, TAU); ctx.fill(); } }
  if (o.layer === 'fg') return;
  // floating glyphs 人間失格 + blank books + cut strings
  const items = []; for (let i = 0; i < (o.glyphs == null ? 28 : o.glyphs); i++) { const p = [(hash(i * 3) - .5) * 40, 1 + hash(i * 5) * 9 + Math.sin(t * .6 + i) * .25, 4 - hash(i * 7) * 50], q = project(p); if (q && q.z > 1) items.push({ q, i }); } items.sort((a, b) => b.q.z - a.q.z);
  for (const it of items) { const { q, i } = it, a = clamp(1 - q.z / 60, .15, .9); if (i % 4 === 3) { const w = .8 * q.s, h = .5 * q.s; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.sin(t * .4 + i) * .2); ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = Math.max(1, .02 * q.s); ctx.beginPath(); ctx.moveTo(0, h * .1); ctx.quadraticCurveTo(-w * .5, -h * .2, -w, 0); ctx.lineTo(-w, h); ctx.quadraticCurveTo(-w * .5, h * .8, 0, h * 1.1); ctx.quadraticCurveTo(w * .5, h * .8, w, h); ctx.lineTo(w, 0); ctx.quadraticCurveTo(w * .5, -h * .2, 0, h * .1); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); continue; }
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#1a1a22'; ctx.font = `700 ${Math.max(8, .9 * q.s)}px "IPAMincho", "IPAGothic", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(q.x, q.y); ctx.rotate(Math.sin(t * .3 + i) * .3); ctx.fillText('人間失格'[i % 4], 0, 0); ctx.restore(); }
  for (let i = 0; i < 10; i++) { const x = (hash(i * 13) - .5) * 30, z = -4 - hash(i * 17) * 30, y1 = 6 + hash(i) * 4; gowLines(ctx, [[x, 30, z], [x, y1, z]], 1.2, rgba('#c8506a', .6)); const q = project([x, y1, z]); if (q) { ctx.strokeStyle = rgba('#c8506a', .6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(q.x + 6, q.y + 8, q.x + 2, q.y + 14); ctx.stroke(); } }
} };

// ================================================================================================ STITCH (Bankai rebuild world)
SETS.stitch = { pal: 'stitch', draw(ctx, t, o) {
  const pal = o.pal, sew = o.sew == null ? 1 : o.sew;
  if (bgPass(o)) { ctx.fillStyle = '#120a0e'; ctx.fillRect(0, 0, W, H); const [a, b] = horizonLine(CAM.cur), my = (a[1] + b[1]) / 2, gr = ctx.createLinearGradient(0, my - H * .3, 0, my); gr.addColorStop(0, 'rgba(60,6,14,0)'); gr.addColorStop(1, 'rgba(160,20,36,.6)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    gowFloor(ctx, 300, '#2a1e22', '#120c0e', { far: '#5a1420' });
    // floor seams: grid of gold seams with red stitches (sewing progress = sew)
    const cx = Math.round(CAM.cur.target[0] / 4) * 4, cz = Math.round(CAM.cur.target[2] / 4) * 4;
    for (let i = -6; i <= 6; i++) { fxStitches(ctx, [[cx + i * 4, .01, cz + 20], [cx + i * 4, .01, cz - 40]], sew * .6, { dur: .6, w: 7 }); fxStitches(ctx, [[cx - 30, .01, cz + i * 4], [cx + 30, .01, cz + i * 4]], sew * .6, { dur: .6, w: 7 }); }
    // red-lit slits torn in the floor (closing as sew -> 1)
    for (let i = 0; i < 5; i++) { const p = [(hash(i * 3) - .5) * 20, .02, -3 - hash(i * 5) * 20], q = project(p); if (!q) continue; const w = (1 - sew * .8) * (1.2 + hash(i) * 2) * q.s; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, q.x, q.y, w * 1.5, '#ff3b4e', .5); ctx.fillStyle = '#ff6a7a'; ctx.beginPath(); ctx.ellipse(q.x, q.y, w, w * .12, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    // huge seam across the sky
    const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push({ x: lerp(-100, W + 100, u), y: H * .18 + Math.sin(u * 5) * 60 }); } fxStitches(ctx, pts, sew * .9, { dur: .9, w: 26 }); }
  if (o.layer === 'fg') return;
  for (const sg of [-1, 1]) { const x = sg * 12; const pts = []; for (let i = 0; i <= 12; i++) pts.push([x - sg * i * .15, 0, 8 - i * 2]); const top = pts.map(p => [p[0], 18, p[2]]); const sp = sadPoly(ctx, pts.concat(top.reverse()), '#0b0b0e', 2, '#b3122a'); if (sp) { ctx.save(); polyPath(ctx, sp); ctx.clip(); for (let i = 0; i <= 12; i++) { const a = project(pts[i]), b = project([pts[i][0], 18, pts[i][2]]); if (a && b) { ctx.strokeStyle = i % 2 ? 'rgba(60,20,30,.7)' : 'rgba(0,0,0,.8)'; ctx.lineWidth = Math.max(2, .25 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } } ctx.restore(); } }
} };

// ================================================================================================ COLD OPEN: broken chessboard in black-pink void
SETS.voidboard = { pal: 'voidpink', draw(ctx, t, o) {
  const pal = o.pal, N = 8, T = 1.5, cr = o.crumble || 0;
  if (bgPass(o)) { ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, W, H); const gr = ctx.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, W * .7); gr.addColorStop(0, 'rgba(255,122,216,.22)'); gr.addColorStop(.5, 'rgba(120,30,90,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff'; const r = rng(3); for (let i = 0; i < 120; i++) { const d = vNorm([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]), q = project(vAdd(CAM.cur.pos, vMul(d, 3000))); if (q) { ctx.globalAlpha = .2 + .5 * r(); ctx.fillRect(q.x, q.y, 1.5, 1.5); } } ctx.globalAlpha = 1;
    // board island: tiles (some missing at the jagged edge), thickness slab, falling tiles below
    for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) { const x = i * T, z = j * T, d = Math.hypot(x + T / 2, z + T / 2) / (N * T), edge = d + .18 * hash(i * 31 + j * 7) - .02, gone = edge > 1 - cr * .5 || edge > 1.02; const fallT = clamp((edge - (1 - cr * .5)) * 6, 0, 1);
      const drop = gone ? -(fallT * fallT * 8 + 1) - ((t * .7 + hash(i + j * 13)) % 1) * 6 : 0; if (gone && edge > 1.25) continue; const col = (i + j + 64) % 2 ? '#e8e0f0' : '#1e1828';
      const pts = [[x, drop, z], [x + T, drop, z], [x + T, drop, z + T], [x, drop, z + T]]; sadPoly(ctx, pts, gone ? rgba(col, .8) : col, gone ? 1 : .5, 'rgba(10,6,14,.6)');
      if (!gone && (Math.abs(i + .5) > N - 2 || Math.abs(j + .5) > N - 2)) sadPoly(ctx, [[x, 0, z + T], [x + T, 0, z + T], [x + T, -.6, z + T], [x, -.6, z + T]], '#2a1a30', .8); }
    for (let i = 0; i < 12; i++) { const q = project([(hash(i * 3) - .5) * 20, -1.5 - hash(i * 7) * 3, (hash(i * 5) - .5) * 20]); if (q) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, 3 * q.s, '#ff7ad8', .15); ctx.restore(); } } }
  if (o.layer === 'fg') return;
  // fallen chess pieces lying on the board (silhouettes) + floating wall clock with hands running backward
  const pieces = [[-3, -2, 1.2, '#e8e0f0'], [4, 1, -.6, '#1e1828'], [-1, 5, .3, '#e8e0f0'], [6, -5, 2.1, '#1e1828']]; for (const [x, z, a, col] of pieces) { const c = [x, .25, z], q = project(c); if (!q) continue; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(a); const s = q.s; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, .9 * s, .28 * s, 0, 0, TAU); ctx.fill(); ctx.fillRect(-.2 * s, -.18 * s, 1.4 * s, .36 * s); ctx.beginPath(); ctx.arc(1.4 * s, 0, .3 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = col === '#1e1828' ? '#e8e0f0' : '#1e1828'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
  const cc = o.clockAt || [5, 4.5, -8], q = project(cc); if (q) { const R = 1.6 * q.s; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(.15 + Math.sin(t * .4) * .05); ctx.fillStyle = '#f2e8d8'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.lineWidth = Math.max(2, R * .1); ctx.strokeStyle = '#3a2a3a'; ctx.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.lineWidth = Math.max(1, R * .04); ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * .8, Math.sin(a) * R * .8); ctx.lineTo(Math.cos(a) * R * .92, Math.sin(a) * R * .92); ctx.stroke(); }
    const m = -t * 2.2 - HP, h2 = -t * .18 - HP + 1; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, R * .07); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(h2) * R * .5, Math.sin(h2) * R * .5); ctx.stroke(); ctx.lineWidth = Math.max(1.5, R * .045); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(m) * R * .8, Math.sin(m) * R * .8); ctx.stroke(); ctx.strokeStyle = '#c8203a'; ctx.lineWidth = Math.max(1, R * .02); const sA = -t * 12 - HP; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sA) * R * .85, Math.sin(sA) * R * .85); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const hz = ctx.createLinearGradient(0, H * .6, 0, H); hz.addColorStop(0, 'rgba(255,122,216,0)'); hz.addColorStop(1, 'rgba(255,122,216,.12)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H); ctx.restore();
} };

// ================================================================================================ BOARD: shiftarena extras (chess floor, alley + shop-door walls, three queens)
Object.assign(GOW_WALLS, { alley: ['#2a2e3e', '#30283a'], shopdoor: ['#fff4dc', '#f2e4c4'] });
(function () { const basePanel = gowWallPanel; gowWallPanel = function (g, kind, P, w, h, zz, pal, tt, seed) {
  if (kind === 'alley') { for (let y = .15; y < 1; y += .2) for (const u of [.2, .55]) sadPoly(g, [P(u, y), P(u + .2, y), P(u + .2, y + .1), P(u, y + .1)], hash(seed * 7 + y * 10 + u * 3) < .35 ? '#ffd890' : '#0e1018'); const q = project(P(.5, .45)); if (q && seed % 2) { g.save(); g.globalCompositeOperation = 'screen'; glow(g, q.x, q.y, 2 * q.s, seed % 3 ? '#ff4aa8' : '#2ae0d0', .45); g.restore(); } return; }
  if (kind === 'shopdoor') { for (let i = 0; i <= 4; i++) gowLines(g, [P(i / 4, 0), P(i / 4, .9)], 3, '#6a4426'); gowLines(g, [P(0, .33), P(1, .33)], 2, '#6a4426'); gowLines(g, [P(0, .9), P(1, .9)], 4, '#4a2e18'); return; }
  return basePanel(g, kind, P, w, h, zz, pal, tt, seed); }; })();
(function () { const base = SETS.shiftarena.draw; SETS.shiftarena.draw = function (ctx, t, o) {
  base.call(this, ctx, t, o);
  if (o.queens && o.layer !== 'fg') { const cols = [['#c86bff', '#ff7ad8'], ['#cfe8ff', '#ffffff'], ['#d8243a', '#2f5d3a']]; [[-6, -9], [0, -11], [6, -9]].forEach(([x, z], i) => { const c = [x, 0, z], q = project(c), top = project([x, 4.6, z]); if (!q || !top) return; const s = q.s, cx = q.x; ctx.save(); const pts = [[1.05, 0], [1.05, .4], [.6, .7], [.38, 3.3], [.85, 3.9], [.5, 4.3], [.3, 4.6], [0, 4.7]].map(([r, y]) => proj2([x + r, y, z])), back = [[1.05, 0], [1.05, .4], [.6, .7], [.38, 3.3], [.85, 3.9], [.5, 4.3], [.3, 4.6], [0, 4.7]].reverse().map(([r, y]) => proj2([x - r, y, z]));
    polyPath(ctx, catmull(pts.concat(back), true, 2)); ctx.fillStyle = mixHex(cols[i][0], '#141018', .35); ctx.fill(); ctx.lineWidth = sadInkW(c, 1.2); ctx.strokeStyle = '#07060a'; ctx.stroke(); ctx.globalCompositeOperation = 'screen'; glow(ctx, top.x, top.y, 2 * s, cols[i][1], .4); ctx.restore(); }); }
}; })();
