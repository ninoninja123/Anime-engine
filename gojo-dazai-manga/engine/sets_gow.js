/* engine/sets_gow.js (agent E, gowther-dazai-urahara) - painted gouache sets for the three-genius mind game.  Real 3D geometry -> true parallax,
   sky / far / mid / near layers, foreground via f.fg({ set, zSplit }).  Every set has a default palette (SETS[name].pal) + GRADES preset.
   Origin: characters stand on y = 0 around x,z = 0 unless noted.
   SETS (default palette):
     theater     (theater)  MARIONETTE THEATRE: stage floor (planks) at y 0 (z -9..5), red velvet swag curtains, gilded proscenium at z 5.5, painted
                            backdrop (moon + hills), footlights, fly-loft battens with hanging Harlequin marionettes (o.puppets count, o.puppetDrop 0..1),
                            empty audience seats beyond z 7 (look from the stage toward +z), spotlight cones (o.spot = [x,z] or false)
     memlib      (memlib)   ENDLESS MEMORY LIBRARY: polished floor, giant shelves receding into fog on both sides of an aisle along -z, arches,
                            floating memory pictures (o.mem count), glowing orbs.  o.aisle (half width, default 5)
     chess       (chess)    CHESSBOARD + MIRROR CORRIDOR: infinite checker floor (1.5 m tiles), giant chess pieces (o.pieces), rows of standing mirror
                            panels forming a corridor along z (o.mirrors), violet starry sky.  o.tilt (rad) tips the whole board (vertigo)
     mindscape  (mind)      GOWTHER'S MIND WORLD: pastel void, glowing grid floor, floating pixel blocks / picture frames / door frames, a vast glitching
                            sun-disc; o.glitch 0..1 (dropout blocks, RGB tears), o.crumble 0..1 (floor breaks into falling pixels from the edges)
     urashop     (shop_dusk) URAHARA SHOP exterior: small two-storey wooden candy shop (浦原商店 sign, sliding glass doors, eaves), dirt lot in front,
                            fence, utility poles + wires, neighbouring houses, dusk sky.  Shop front faces +z at z = -7.
     undergrounds (study)   UNDERGROUND TRAINING GROUND (Urahara's 'study room'): huge cavern disguised as a desert with a painted blue sky, rock spires,
                            mesas, dead trees, boulders, the ladder down from the ceiling hatch (o.ladder), craters (o.dmg 0..3)
     clocktower (clock)     INSIDE A CLOCK TOWER: plank floor, huge backlit clock dial window (z -10, o.time hours), rotating gears on the walls (o.stop
                            0..1 slows them to a halt = time stops), swinging pendulum (o.pendulum), beams, light shafts + dust
     shiftarena (shift)     EMPTY ARENA WHOSE WALLS CHANGE: square hall 30 x 30 m, wall panels flip in a wave from o.from to o.wall
                            ('stone'|'mirror'|'books'|'curtain'|'glitch'|'void'|'clocks'), o.phase 0..1, floor tiles follow (o.floor:false keeps stone)
   Reused from sets_sad.js: yokohama (HARBOR), canal, dojo, arena; from sets_a/b: stage, void ...                                        */
'use strict';
Object.assign(PALETTES, {
  theater: { skyTop: '#12060a', skyMid: '#3a1218', skyLow: '#7a2a2a', fog: '#2a0e14', sun: [.2, .8, .4], ground: '#7a5434', ground2: '#4a301c', wall: '#8a1a24', wallShade: '#3a0810', roof: '#1a0a0c', roofShade: '#0c0406', wood: '#6a4424', cloud: '#3a1a20', cloudShade: '#1a0a0e', haze: .3, line: '#0c0406', amb: '#ffb880' },
  memlib: { skyTop: '#0e0a1a', skyMid: '#2a1e3a', skyLow: '#6a4a6a', fog: '#4a3450', sun: [.2, .7, .5], ground: '#3a2622', ground2: '#1a100e', wall: '#5a3a2a', wallShade: '#2a1a14', roof: '#24161a', roofShade: '#120a0c', wood: '#5a3622', cloud: '#5a4060', cloudShade: '#2a1a30', haze: .7, line: '#0e0808', amb: '#ffd0a8' },
  chess: { skyTop: '#06041a', skyMid: '#24184a', skyLow: '#7a5aa8', fog: '#5a4a8a', sun: [-.4, .6, .4], ground: '#e8e0f0', ground2: '#1a1626', wall: '#d8d0f0', wallShade: '#6a5a9a', roof: '#2a2040', roofShade: '#160f24', wood: '#3a2a4a', cloud: '#8a7ac0', cloudShade: '#3a2a6a', haze: .5, line: '#0e0a1a', amb: '#d8c8ff', stars: true },
  mind: { skyTop: '#f6d8f0', skyMid: '#e8c8f4', skyLow: '#fff2fa', fog: '#f8e4f6', sun: [-.3, .7, .5], ground: '#f0e0f8', ground2: '#c8b0e0', wall: '#ffffff', wallShade: '#c8b0e0', roof: '#b890d8', roofShade: '#8a62b0', wood: '#d0a8e0', cloud: '#ffffff', cloudShade: '#e0c0ec', haze: .6, line: '#5a3a7a', amb: '#ffe8fa' },
  shop_dusk: { skyTop: '#2a2a5a', skyMid: '#c87a7a', skyLow: '#ffd09a', fog: '#e8a890', sun: [.5, .25, -.6], ground: '#a08a70', ground2: '#6a5a48', wall: '#c8b494', wallShade: '#6a5a4e', roof: '#3a3a44', roofShade: '#22222a', wood: '#6a4a30', cloud: '#ffc8a0', cloudShade: '#8a5a7a', haze: .5, line: '#1a1418', amb: '#ffc8a0' },
  study: { skyTop: '#3a7ad8', skyMid: '#7ab0f0', skyLow: '#d8ecf8', fog: '#d8d0c0', sun: [-.3, .8, .3], ground: '#c8a87a', ground2: '#8a6a4a', wall: '#b8946a', wallShade: '#6a4a34', roof: '#5a4a3a', roofShade: '#3a2a20', wood: '#5a4030', cloud: '#ffffff', cloudShade: '#a8c0e0', haze: .55, line: '#2a1a12', amb: '#fff0d8' },
  clock: { skyTop: '#1a120e', skyMid: '#4a3020', skyLow: '#d8a060', fog: '#6a4a30', sun: [.0, .5, -1], ground: '#5a3e26', ground2: '#2a1a10', wall: '#4a3424', wallShade: '#1e140c', roof: '#2a1c12', roofShade: '#140c06', wood: '#5a3a20', cloud: '#6a4a30', cloudShade: '#2a1a10', haze: .4, line: '#0e0804', amb: '#ffc078' },
  shift: { skyTop: '#0e0e16', skyMid: '#2a2a3a', skyLow: '#6a6a7a', fog: '#3a3a4a', sun: [-.4, .8, .3], ground: '#8a8890', ground2: '#4a4a54', wall: '#a8a6ae', wallShade: '#4a4852', roof: '#2a2a32', roofShade: '#16161c', wood: '#4a3e36', cloud: '#5a5a6a', cloudShade: '#2a2a36', haze: .4, line: '#0e0e14', amb: '#e0e0f0' },
});
Object.assign(GRADES, {
  theater: { sat: 1.12, contrast: 1.12, tint: ['#ffc8a0', .2], lift: ['#2a0810', .06] }, memlib: { sat: 1.0, contrast: 1.08, tint: ['#f0c8b0', .2], lift: ['#1a1030', .06] },
  chess: { sat: 1.0, contrast: 1.1, tint: ['#d8c8ff', .18], lift: ['#1a1040', .07] }, mind: { sat: 1.05, contrast: 1.0, tint: ['#ffe0f4', .15] },
  shop_dusk: { sat: 1.1, contrast: 1.06, tint: ['#ffd0b0', .22], lift: ['#3a1a40', .06] }, study: { sat: 1.08, contrast: 1.05, soft: ['#fff0d8', .12] },
  clock: { sat: 1.05, contrast: 1.12, tint: ['#ffc890', .25], lift: ['#1a0a04', .05] }, shift: { sat: .95, contrast: 1.1, tint: ['#d8d8f0', .12] },
});
if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, { mind: { bloom: .22, halation: 0 }, study: { bloom: .25 }, chess: { bloom: .4 }, theater: { bloom: .55, vignette: .55 } });
window.GOW_PALPOST = { mind: { bloom: .22, halation: 0 }, study: { bloom: .25 }, chess: { bloom: .4 }, theater: { bloom: .55, vignette: .55 } };
// ------------------------------------------------------------------------------------------------ helpers (draw-time: sadPoly/sadBox3 come from sets_sad.js)
var GOW_SETSTATE = { spin: 0, pend: 1, ph: 1, from: 'stone', to: 'stone' };
function gowQuad(ctx, a, b, h, col, ink) { return sadPoly(ctx, [a, b, vAdd(b, [0, h, 0]), vAdd(a, [0, h, 0])], col, ink); }
function gowLines(ctx, pts, w, col) { for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); } }
function gowGlowAt(ctx, p, r, col, a) { const q = project(p); if (!q) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, r * q.s, col, a); ctx.restore(); }
function gowFloor(ctx, R, col, col2, o = {}) { // big floor quad around the camera with a depth gradient
  const cam = CAM.cur, c = [o.cx == null ? cam.pos[0] : o.cx, o.y || 0, o.cz == null ? cam.pos[2] : o.cz], sp = projPoly([[c[0] - R, c[1], c[2] - R], [c[0] + R, c[1], c[2] - R], [c[0] + R, c[1], c[2] + R], [c[0] - R, c[1], c[2] + R]]); if (sp.length < 3) return null;
  const [a, b] = horizonLine(cam), my = (a[1] + b[1]) / 2, g = ctx.createLinearGradient(0, my, 0, H); g.addColorStop(0, o.far || col); g.addColorStop(.35, col); g.addColorStop(1, col2); polyPath(ctx, sp); ctx.fillStyle = g; ctx.fill(); return sp;
}
// gear in a vertical plane: centre c, normal n (unit), radius R, teeth, rotation a
function gowGear(ctx, c, n, R, teeth, a, col, pal) {
  let u = vNorm(vCross(n, [0, 1, 0])); if (vLen(vCross(n, [0, 1, 0])) < .1) u = [1, 0, 0]; const v = vCross(u, n), pts = [];
  for (let i = 0; i < teeth * 4; i++) { const k = i % 4, an = a + i / (teeth * 4) * TAU, rr = (k === 1 || k === 2) ? R : R * .86; pts.push(vAdd(c, vAdd(vMul(u, Math.cos(an) * rr), vMul(v, Math.sin(an) * rr)))); }
  const sp = sadPoly(ctx, pts, col, sadInkW(c, .9), '#1a0e06'); if (!sp) return;
  const hub = []; for (let i = 0; i < 20; i++) { const an = i / 20 * TAU; hub.push(vAdd(c, vAdd(vMul(u, Math.cos(an) * R * .2), vMul(v, Math.sin(an) * R * .2)))); } sadPoly(ctx, hub, shadeHex(col, -.3), sadInkW(c, .7), '#1a0e06');
  for (let s = 0; s < 5; s++) { const an = a + s / 5 * TAU + .3; const hole = []; for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, cx = Math.cos(an) * R * .52, cy = Math.sin(an) * R * .52; hole.push(vAdd(c, vAdd(vMul(u, cx + Math.cos(b) * R * .17), vMul(v, cy + Math.sin(b) * R * .17)))); } sadPoly(ctx, hole, shadeHex(pal.wall, -.45)); }
  const hl = sp.slice(0, Math.floor(sp.length * .3)); if (hl.length > 2) { ctx.save(); ctx.globalAlpha = .25; polyPath(ctx, hl, false); ctx.lineWidth = 2; ctx.strokeStyle = '#ffe8b0'; ctx.stroke(); ctx.restore(); }
}

// ================================================================================================ MARIONETTE THEATRE
SETS.theater = { pal: 'theater', draw(ctx, t, o) {
  const pal = o.pal, Z0 = -9, Z1 = 5.5, X = 11;
  if (bgPass(o)) {
    ctx.fillStyle = '#0c0406'; ctx.fillRect(0, 0, W, H);
    // auditorium behind the camera side (+z): dark rows of red seats descending, balcony rail with lamps
    const dark = gowFloor(ctx, 80, '#1a0a0c', '#0c0406', { y: -1.2 });
    for (let row = 0; row < 14; row++) { const z = 8 + row * 1.2, y = -1.2 + row * .38; for (let i = -9; i <= 9; i++) { const x = i * 1.0 + (row % 2) * .5; const c = [x, y, z]; if (camDepth(c) < .5) continue; sadPoly(ctx, [[x - .42, y, z], [x + .42, y, z], [x + .42, y + .95, z + .1], [x - .42, y + .95, z + .1]], fogMix('#7a1420', camDepth(c), pal, .6), sadInkW(c, .4)); } }
    // painted backdrop: night hills + big moon + stars (painted cloth with seams)
    gowQuad(ctx, [-X, 0, Z0], [X, 0, Z0], 11, '#1a2448'); const moon = project([2.5, 7.2, Z0 + .05]); if (moon) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, moon.x, moon.y, 5 * moon.s, '#ffe8c0', .45); ctx.restore(); ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(moon.x, moon.y, 1.5 * moon.s, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 40; i++) { const q = project([(hash(i * 3) - .5) * 20, 4 + hash(i * 5) * 6.5, Z0 + .04]); if (q) { ctx.fillStyle = '#fff6e0'; ctx.fillRect(q.x, q.y, Math.max(1, .06 * q.s), Math.max(1, .06 * q.s)); } }
    for (const [k, col] of [[0, '#2a3a5a'], [1, '#1a2440']]) { const pts = [[-X, 0, Z0 + .06 + k * .02]]; for (let i = 0; i <= 20; i++) { const x = -X + i / 20 * 2 * X; pts.push([x, 2.2 + k * -.6 + Math.sin(x * .5 + k * 2) * .9 + Math.sin(x * 1.3) * .3, Z0 + .06 + k * .02]); } pts.push([X, 0, Z0 + .06 + k * .02]); sadPoly(ctx, pts, col); }
    for (let i = -3; i <= 3; i++) gowLines(ctx, [[i * 3.1, 0, Z0 + .1], [i * 3.1, 11, Z0 + .1]], 1, 'rgba(0,0,0,.25)');
    // stage floor planks + front apron edge
    sadPoly(ctx, [[-X, 0, Z0], [X, 0, Z0], [X, 0, Z1 + 1], [-X, 0, Z1 + 1]], '#8a5a34'); ctx.strokeStyle = rgba('#3a2010', .55); ctx.lineWidth = 1.2; for (let x = -X; x <= X; x += .55) gowLines(ctx, [[x, .003, Z0], [x, .003, Z1 + 1]], 1, rgba('#3a2010', .5));
    for (let z = Z0; z < Z1; z += 2.4) gowLines(ctx, [[-X, .003, z], [X, .003, z]], 1, rgba('#3a2010', .3));
    sadPoly(ctx, [[-X, 0, Z1 + 1], [X, 0, Z1 + 1], [X, -1.2, Z1 + 1], [-X, -1.2, Z1 + 1]], '#2a140c', 1);
    // spotlight pool on the floor
    if (o.spot !== false) { const sp = o.spot || [0, 0], q = project([sp[0], 0, sp[1]]); if (q) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,230,180,.35)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, 2.6 * q.s, .9 * q.s, 0, 0, TAU); ctx.fill(); glow(ctx, q.x, q.y, 3.5 * q.s, '#ffd8a0', .25); ctx.restore();
      const top = project([sp[0] * .3, 12, Z1 - 1]); if (top) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const gr = ctx.createLinearGradient(top.x, top.y, q.x, q.y); gr.addColorStop(0, 'rgba(255,235,190,.32)'); gr.addColorStop(1, 'rgba(255,235,190,.05)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(top.x - 10, top.y); ctx.lineTo(top.x + 10, top.y); ctx.lineTo(q.x + 2.6 * q.s, q.y); ctx.lineTo(q.x - 2.6 * q.s, q.y); ctx.fill(); ctx.restore(); } } }
    // footlights along the apron
    for (let i = -10; i <= 10; i++) gowGlowAt(ctx, [i * 1.0, .12, Z1 + .8], 1.2, '#ffc070', .4);
  }
  const key = 'theater'; if (!SETCACHE[key]) { const I = [];
    // side curtains (velvet folds) + top valance swags + gilded proscenium frame
    for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) { const x0 = sg * (X - 1.2 - k * .1), z = Z1 - k * 4.5 - .3, c = [x0, 0, z]; I.push({ c, h: 10, w: 3, draw: (g, p, tt) => { const pts = []; const n = 14; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x0 - sg * u * 2.6, 0, z + Math.sin(u * 22 + k) * .15]); } const top = pts.map(q => [q[0] + sg * .4 * (1 - Math.abs(q[0] - x0) / 2.6), 11, q[2]]);
      const sp = sadPoly(g, pts.concat(top.reverse()), fogMix(k ? '#6a0e18' : '#8a1422', camDepth(c), p, .5), sadInkW(c, .7), '#1a0206'); if (!sp) return; g.save(); polyPath(g, sp); g.clip(); for (let i = 0; i <= n; i++) { const u = i / n, a = project([x0 - sg * u * 2.6, 0, z]), b = project([x0 - sg * u * 2.6 + sg * .3, 11, z]); if (!a || !b) continue; g.strokeStyle = i % 2 ? 'rgba(0,0,0,.35)' : 'rgba(255,120,120,.18)'; g.lineWidth = Math.max(2, .25 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } g.restore(); } }); }
    { const c = [0, 9, Z1]; I.push({ c, h: 3, w: 2 * X, draw: (g, p) => { for (let s = -2; s <= 2; s++) { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = (s - .5) * 4.4 + u * 4.4; pts.push([x, 9.6 - Math.sin(u * Math.PI) * 1.5, Z1 - .1]); } pts.push([(s + .5) * 4.4, 11.2, Z1 - .1], [(s - .5) * 4.4, 11.2, Z1 - .1]); sadPoly(g, pts, '#9a1828', 1.2, '#2a0408'); const tas = project([(s + .5) * 4.4, 9.4, Z1 - .1]); if (tas) { g.fillStyle = '#e8b84a'; g.beginPath(); g.ellipse(tas.x, tas.y, .12 * tas.s, .3 * tas.s, 0, 0, TAU); g.fill(); } }
      for (const pts of [[[-X - .4, 0, Z1], [-X + .6, 0, Z1], [-X + .6, 11.5, Z1], [-X - .4, 11.5, Z1]], [[X - .6, 0, Z1], [X + .4, 0, Z1], [X + .4, 11.5, Z1], [X - .6, 11.5, Z1]], [[-X - .4, 11.2, Z1], [X + .4, 11.2, Z1], [X + .4, 12.2, Z1], [-X - .4, 12.2, Z1]]]) { const sp = sadPoly(g, pts, '#c8963a', 1.4, '#3a2208'); if (sp && sp.length > 3) { g.save(); polyPath(g, sp); g.clip(); g.strokeStyle = 'rgba(255,240,180,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); g.lineTo(sp[3][0], sp[3][1]); g.stroke(); g.restore(); } } } }); }
    // fly-loft battens
    for (let i = 0; i < 4; i++) { const z = Z0 + 2 + i * 3; I.push({ c: [0, 10, z], h: 1, w: 20, draw: g => gowLines(g, [[-X, 10.5, z], [X, 10.5, z]], 4, '#1a0e0a') }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  // hanging marionettes in the fly loft (sway; o.puppetDrop lowers them)
  const np = o.puppets == null ? 7 : o.puppets; if (np && o.layer !== 'fg') for (let i = 0; i < np; i++) { const x = (i - (np - 1) / 2) * 2.6, z = Z0 + 2.5 + (i % 3) * 2.2, y = 6.4 - (o.puppetDrop || 0) * 4.2 + hash(i) * .5; drawHarlequin(ctx, [x, y, z], { size: .85, t: t + i, phase: i * 1.7, swing: .12, col: ['#d8203a', '#2a2a3a', '#7a3ad8'][i % 3], col2: ['#f2f0f4', '#f2c84a', '#f2f0f4'][i % 3], face: ['tear', 'smile', 'blank'][i % 3], alpha: .95 }); }
} };

// ================================================================================================ MEMORY LIBRARY
SETS.memlib = { pal: 'memlib', draw(ctx, t, o) {
  const pal = o.pal, A = o.aisle || 5, Z1 = 14, Z0 = -180;
  if (bgPass(o)) {
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, pal.skyTop); sky.addColorStop(.6, pal.skyMid); sky.addColorStop(1, pal.skyLow); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const vp = project([0, 6, Z0]); if (vp) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, vp.x, vp.y, 900, '#ffd8b0', .45); ctx.restore(); }
    // polished floor with long reflections of the light at the end
    const fl = gowFloor(ctx, 400, '#3a2420', '#140c0a', { far: '#8a5a4a' }); if (fl) { ctx.save(); polyPath(ctx, fl); ctx.clip(); ctx.globalCompositeOperation = 'screen'; if (vp) { const g2 = ctx.createLinearGradient(vp.x, vp.y, vp.x, H); g2.addColorStop(0, 'rgba(255,210,170,.5)'); g2.addColorStop(1, 'rgba(255,210,170,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(vp.x - 20, vp.y); ctx.lineTo(vp.x + 20, vp.y); ctx.lineTo(vp.x + 500, H); ctx.lineTo(vp.x - 500, H); ctx.fill(); } ctx.restore();
      for (let z = Z1; z > -80; z -= 3) gowLines(ctx, [[-A, .002, z], [A, .002, z]], 1, rgba('#1a0e0a', .4)); gowLines(ctx, [[-A + .6, .003, Z1], [-A + .6, .003, Z0]], 2, rgba('#c89a5a', .35)); gowLines(ctx, [[A - .6, .003, Z1], [A - .6, .003, Z0]], 2, rgba('#c89a5a', .35)); }
  }
  const key = 'memlib' + A; if (!SETCACHE[key]) { const I = [], spines = ['#7a2a22', '#2a3a5a', '#a8803a', '#3a5a3a', '#5a2a4a', '#8a6a4a', '#2a2a2a', '#c8b89a'];
    for (const sg of [-1, 1]) for (let k = 0; k < 40; k++) { const z = Z1 - k * 4.4, x = sg * (A + .6), c = [x, 0, z]; I.push({ c, h: 18, w: 4.4, d: 1.2, draw: (g, p, tt, zz) => {
      const H2 = 16 + (k % 3) * 2, front = sg > 0 ? -1 : 1; const face = [[x, 0, z + 2.15], [x, 0, z - 2.15], [x, H2, z - 2.15], [x, H2, z + 2.15]]; const sp = sadPoly(g, face, fogMix('#4a2c1c', zz, p, 1.1), sadInkW(c, .5), '#140a06'); if (!sp) return;
      if (zz < 90) { for (let s = 0; s < 9; s++) { const y0 = .35 + s * 1.8; sadPoly(g, [[x, y0, z + 2.1], [x, y0, z - 2.1], [x + front * .05, y0 + .14, z - 2.1], [x + front * .05, y0 + .14, z + 2.1]], fogMix('#6a4428', zz, p, 1.1));
          const n = zz < 40 ? 28 : 12; for (let b = 0; b < n; b++) { const u0 = b / n, u1 = (b + .85) / n, hh = 1.3 + .35 * hash(b + s * 31 + k * 7); const zA = z + 2.05 - u0 * 4.1, zB = z + 2.05 - u1 * 4.1; sadPoly(g, [[x + front * .06, y0 + .14, zA], [x + front * .06, y0 + .14, zB], [x + front * .06, y0 + .14 + hh, zB], [x + front * .06, y0 + .14 + hh, zA]], fogMix(spines[Math.floor(hash(b * 3 + s * 11 + k) * 8)], zz, p, 1.1)); } } }
      sadPoly(g, [[x, H2, z + 2.2], [x, H2, z - 2.2], [x + front * .4, H2 + .5, z - 2.2], [x + front * .4, H2 + .5, z + 2.2]], fogMix('#2a160c', zz, p, 1.1)); } }); }
    // arches over the aisle every 13 m + lamps
    for (let k = 0; k < 14; k++) { const z = Z1 - 4 - k * 13.2, c = [0, 18, z]; I.push({ c, h: 4, w: 2 * A, draw: (g, p, tt, zz) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = Math.PI - i / 16 * Math.PI; pts.push([Math.cos(a) * (A + .6), 16 + Math.sin(a) * 4.5, z]); } const inner = pts.map(q => [q[0] * .9, 16 + (q[1] - 16) * .86, z]).reverse(); sadPoly(g, pts.concat(inner), fogMix('#5a3422', zz, p, 1.1), sadInkW(c, .5), '#140a06');
      const lp = [0, 13.5, z]; gowLines(g, [[0, 20, z], lp], 1.5, fogMix('#2a1a10', zz, p, 1)); const q = project(lp); if (q) { g.save(); g.globalCompositeOperation = 'screen'; glow(g, q.x, q.y, 4 * q.s, '#ffc880', .5); g.restore(); g.fillStyle = '#fff0c8'; g.beginPath(); g.arc(q.x, q.y, Math.max(1.5, .25 * q.s), 0, TAU); g.fill(); } } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  // floating memory pictures drifting along the aisle (only far/mid ones in the bg layer)
  if (o.layer !== 'fg') { const n = o.mem == null ? 26 : o.mem; const items = []; for (let i = 0; i < n; i++) { const z = Z1 - ((hash(i * 3) * 120 + t * .6) % 120), p = [(hash(i * 5) - .5) * (A * 1.6), 2.5 + hash(i * 7) * 9 + Math.sin(t * .7 + i) * .3, z], q = project(p); if (q && q.z > 1.5) items.push({ q, i }); }
    items.sort((a, b) => b.q.z - a.q.z); for (const it of items) gowMemCard(ctx, it.q.x, it.q.y, .9 * it.q.s, (hash(it.i) - .5) * .5 + Math.sin(t * .5 + it.i) * .05, clamp(.95 - it.q.z / 120, .15, .85), it.i * 7 + 3, { glowCol: '#ffd0a0' }); }
} };

// ================================================================================================ CHESSBOARD + MIRROR CORRIDOR
SETS.chess = { pal: 'chess', draw(ctx, t, o) {
  const pal = o.pal, T = 1.5;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 4, cloudSeed: 91, cirrus: false }, o));
    // checker floor: draw only tiles around the camera (perspective fades into fog)
    const cam = CAM.cur, cx = Math.round(cam.target[0] / T), cz = Math.round(cam.target[2] / T), R = 26;
    gowFloor(ctx, 300, '#2a2440', '#14101e', { far: pal.fog });
    for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) { if ((i + j) % 2 === 0) continue; const x = (cx + i) * T, z = (cz + j) * T, c = [x + T / 2, 0, z + T / 2], zz = camDepth(c); if (zz < -2 || zz > 70) continue; sadPoly(ctx, [[x, .001, z], [x + T, .001, z], [x + T, .001, z + T], [x, .001, z + T]], fogMix('#e8e0f4', zz, pal, .9)); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const mp = project(vAdd(cam.pos, vMul(vNorm([-.2, .25, -1]), 4000))); if (mp) glow(ctx, mp.x, mp.y, 500, '#c8a8ff', .3); ctx.restore(); }
  const key = 'chess' + (o.pieces == null ? 9 : o.pieces) + (o.mirrors == null ? 12 : o.mirrors); if (!SETCACHE[key]) { const I = [], r = rng(33);
    const lathe = (g, p, c, prof, col, zz) => { // simple lathe silhouette (screen-facing profile) shaded with the palette sun
      const q0 = project(c); if (!q0) return; const pts = []; for (const [rr, y] of prof) pts.push(proj2([c[0] + rr, c[1] + y, c[2]])); const back = prof.slice().reverse().map(([rr, y]) => proj2([c[0] - rr, c[1] + y, c[2]])); const poly = pts.concat(back);
      polyPath(g, catmull(poly, true, 2)); g.fillStyle = fogMix(col, zz, p, .8); g.fill(); g.save(); g.clip(); g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(q0.x + (back[0][0] - q0.x) * .05, 0, W, H); g.restore(); polyPath(g, catmull(poly, true, 2)); g.lineWidth = sadInkW(c, 1); g.strokeStyle = '#0e0a1a'; g.stroke(); };
    const PROF = { pawn: [[.9, 0], [.9, .3], [.5, .5], [.35, 1.6], [.6, 1.8], [.55, 2.2], [.3, 2.5], [0, 2.6]], king: [[1.1, 0], [1.1, .4], [.6, .7], [.42, 3.4], [.8, 3.7], [.6, 4.2], [.2, 4.5], [.2, 5.2], [.06, 5.3]], rook: [[1, 0], [1, .4], [.65, .7], [.6, 2.8], [.9, 3.1], [.9, 3.7], [0, 3.7]], queen: [[1.05, 0], [1.05, .4], [.6, .7], [.38, 3.3], [.85, 3.9], [.5, 4.3], [.3, 4.6], [0, 4.7]] };
    const np = o.pieces == null ? 9 : o.pieces; for (let i = 0; i < np; i++) { const kind = ['pawn', 'king', 'rook', 'queen', 'pawn'][i % 5], s = 1.4 + r() * 1.6, c = [(r() - .5) * 60, 0, -8 - r() * 50], col = i % 2 ? '#f2eef8' : '#1e1a2a'; const prof = PROF[kind].map(([a, b]) => [a * s, b * s]); I.push({ c, h: prof[prof.length - 1][1], w: 2 * s, draw: (g, p, tt, zz) => lathe(g, p, c, prof, col, zz) }); }
    const nm = o.mirrors == null ? 12 : o.mirrors; for (let i = 0; i < nm; i++) { const sg = i % 2 ? 1 : -1, z = 6 - Math.floor(i / 2) * 6, x = sg * 4.2, c = [x, 0, z]; I.push({ c, h: 5, w: 2.4, d: .3, draw: (g, p, tt, zz) => {
      const fr = [[x, 0, z - 1.2], [x, 0, z + 1.2], [x, 4.6, z + 1.2], [x, 4.6, z - 1.2]], sp = sadPoly(g, fr, fogMix('#c8b8f0', zz, p, .7), sadInkW(c, 1.2), '#1a1030'); if (!sp || sp.length < 4) return;
      g.save(); polyPath(g, sp); g.clip(); const gr = g.createLinearGradient(sp[0][0], sp[0][1], sp[2][0], sp[2][1]); gr.addColorStop(0, rgba('#ffffff', .5)); gr.addColorStop(.45, rgba('#a890e0', .1)); gr.addColorStop(.55, rgba('#ffffff', .4)); gr.addColorStop(1, rgba('#5a4aa0', .3)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const ph = (tt * .15 + i * .3) % 1; g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6; g.beginPath(); g.moveTo(lerp(sp[0][0], sp[1][0], ph) - 40, sp[0][1]); g.lineTo(lerp(sp[3][0], sp[2][0], ph) + 40, sp[3][1]); g.stroke(); g.restore();
      const top = [[x, 4.6, z - 1.3], [x, 4.6, z + 1.3], [x, 5.0, z + 1.3], [x, 5.0, z - 1.3]]; sadPoly(g, top, '#2a2040', 1); } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };

// ================================================================================================ GOWTHER'S MIND WORLD
SETS.mindscape = { pal: 'mind', draw(ctx, t, o) {
  const pal = o.pal, gl = o.glitch || 0, cr = o.crumble || 0, cam = CAM.cur;
  if (bgPass(o)) {
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, pal.skyTop); sky.addColorStop(.55, pal.skyMid); sky.addColorStop(1, pal.skyLow); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // vast pale sun-disc with concentric rings (glitch: slices displaced)
    const sp = project(vAdd(cam.pos, vMul(vNorm([.15, .22, -1]), 4000))); if (sp) { const R = 260 * cam.f / 1000; ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, sp.x, sp.y, R * 3, '#ffffff', .55); ctx.restore(); ctx.fillStyle = '#fffafd'; ctx.beginPath(); ctx.arc(sp.x, sp.y, R, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba('#e0a8e8', .5); ctx.lineWidth = 3; for (const k of [1.3, 1.7, 2.3]) { ctx.beginPath(); ctx.arc(sp.x, sp.y, R * k, 0, TAU); ctx.stroke(); }
      if (gl > 0) { const r = rng(Math.floor(t * 12)); for (let i = 0; i < 6 * gl; i++) { const y = sp.y - R + r() * R * 2, hh = 4 + r() * 18; ctx.fillStyle = r() < .5 ? rgba('#ff6ad0', .5) : rgba('#7ad8ff', .5); ctx.fillRect(sp.x - R * 1.2 + (r() - .5) * 80 * gl, y, R * 2.4, hh); } } }
    // floating pastel clouds (soft)
    for (let i = 0; i < 9; i++) { const d = vNorm([Math.sin(i * 2.3) , .05 + hash(i) * .25, -Math.abs(Math.cos(i * 2.3)) - .3]), q = project(vAdd(cam.pos, vMul(d, 3000))); if (!q) continue; ctx.save(); ctx.globalAlpha = .55; paintCloud(ctx, q.x + t * 6, q.y, 520 * q.s / q.s, 140, pal, 400 + i); ctx.restore(); }
    // glowing grid floor (glass), fading to the horizon
    const fl = gowFloor(ctx, 300, '#f4e8fa', '#d8c0ec', { far: '#fff4fc' }); if (fl) { ctx.save(); polyPath(ctx, fl); ctx.clip(); const cx = Math.round(cam.target[0] / 2) * 2, cz = Math.round(cam.target[2] / 2) * 2;
      for (let i = -30; i <= 30; i++) { const a = .5 * (1 - Math.abs(i) / 30); gowLines(ctx, [[cx + i * 2, .002, cz - 60], [cx + i * 2, .002, cz + 60]], 1.3, rgba('#b88ae0', a)); gowLines(ctx, [[cx - 60, .002, cz + i * 2], [cx + 60, .002, cz + i * 2]], 1.3, rgba('#b88ae0', a)); }
      // crumble: floor tiles missing (void shows) from the edges, falling squares
      if (cr > 0) { for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) { const d = Math.hypot(i, j) / 14, k = clamp((cr * 1.4 - (1 - d)) / .3, 0, 1); if (k <= 0) continue; const x = cx + i * 2, z = cz + j * 2, drop = -k * k * 6; sadPoly(ctx, [[x, 0, z], [x + 2, 0, z], [x + 2, 0, z + 2], [x, 0, z + 2]], '#3a1a4a'); if (k < 1) sadPoly(ctx, [[x, drop, z], [x + 2, drop, z], [x + 2, drop, z + 2], [x, drop, z + 2]], rgba('#e8d0f4', 1 - k), 1, rgba('#5a3a7a', 1 - k)); } }
      ctx.restore(); }
  }
  const key = 'mind'; if (!SETCACHE[key]) { const I = [], r = rng(71);
    for (let i = 0; i < 34; i++) { const c = [(r() - .5) * 70, 1 + r() * 14, -4 - r() * 60], s = .3 + r() * 1.6, kind = r() < .55 ? 'cube' : r() < .6 ? 'frame' : 'door', sd = i;
      I.push({ c, h: s * 2, w: s * 2, draw: (g, p, tt, zz) => { const y = c[1] + Math.sin(tt * .6 + sd) * .3, cc = [c[0], y, c[2]];
        if (kind === 'cube') { const yaw = tt * .2 * (hash(sd) - .5) + sd; sadBox3(g, [cc[0], y - s / 2, cc[2]], s, s, s, fogMix(['#ffffff', '#f6c8ec', '#d8c8ff', '#c8f0ff'][sd % 4], zz, p, .8), p, { yaw }); }
        else if (kind === 'frame') { const a = [cc[0] - s, y - s * .66, cc[2]], b = [cc[0] + s, y - s * .66, cc[2]], q = project(cc); if (!q) return; gowMemCard(g, q.x, q.y, 2 * s * q.s, Math.sin(tt * .3 + sd) * .1, clamp(1 - zz / 70, .2, .9), sd * 5 + 1, { glowCol: '#ff9ce0' }); }
        else { const yaw = sd; const M = mRotY(yaw), P2_ = (x, yy) => vAdd(cc, mApply(M, [x, yy, 0])); const pts = [P2_(-s * .55, -s), P2_(s * .55, -s), P2_(s * .55, s), P2_(-s * .55, s)]; const sp = sadPoly(g, pts, fogMix('#ffffff', zz, p, .6), sadInkW(cc, 1), '#8a62b0'); if (sp) { const inner = [P2_(-s * .42, -s * .95), P2_(s * .42, -s * .95), P2_(s * .42, s * .88), P2_(-s * .42, s * .88)]; sadPoly(g, inner, rgba('#ffd8f4', .9)); g.save(); g.globalCompositeOperation = 'screen'; const q = project(cc); if (q) glow(g, q.x, q.y, s * 1.5 * q.s, '#ffffff', .5); g.restore(); } } } }); }
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
  if (gl > 0 && o.layer !== 'fg') { const r = rng(Math.floor(t * 10) + 5); for (let i = 0; i < 20 * gl; i++) { const x = r() * W, y = r() * H, s = 8 + r() * 46; ctx.fillStyle = r() < .3 ? '#ffffff' : r() < .5 ? rgba('#ff6ad0', .7) : rgba('#3a1a4a', .8); ctx.fillRect(Math.floor(x / 8) * 8, Math.floor(y / 8) * 8, s, s * (.3 + r())); } }
} };

// ================================================================================================ URAHARA SHOP (exterior, dusk)
SETS.urashop = { pal: 'shop_dusk', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 10, cloudSeed: 23 }, o)); drawGround(ctx, pal, { col: '#a08a70', col2: '#6a5a48' });
    const r = rng(17); ctx.fillStyle = rgba('#5a4a3a', .35); for (let i = 0; i < 90; i++) { const q = project([(r() - .5) * 24, .002, -6 + r() * 20]); if (q) { ctx.beginPath(); ctx.ellipse(q.x, q.y, .08 * q.s, .03 * q.s, 0, 0, TAU); ctx.fill(); } }   // pebbles
    gowLines(ctx, [[-30, .003, 6], [30, .003, 6]], 3, rgba('#5a4a3a', .5)); }
  const key = 'urashop'; if (!SETCACHE[key]) { const I = [];
    // the shop: 2 storeys, wood + plaster, tiled roof with eaves, sign board, sliding glass doors with shop shelves inside (warm light)
    { const c = [0, 0, -9]; I.push({ c, h: 8, w: 11, d: 5, draw: (g, p, tt) => {
      sadBox3(g, c, 11, 5, 3.2, '#8a6a48', p, { face: (cc, f, P, n) => { if (f[4][2] !== 1) return; const at = (u, y) => vAdd(vLerp(P(...f[0]), P(...f[1]), u), [0, y, .02]);
        // sliding doors: 4 glass panes with warm interior + candy shelves
        for (let i = 0; i < 4; i++) { const u0 = .12 + i * .19, u1 = u0 + .18, sp = sadPoly(cc, [at(u0, .1), at(u1, .1), at(u1, 2.5), at(u0, 2.5)], '#ffd890', 1.2, '#2a1a10'); if (sp) { cc.save(); polyPath(cc, sp); cc.clip(); for (let s = 0; s < 3; s++) { const y = .5 + s * .65; for (let b = 0; b < 10; b++) { const pa = project(at(u0 + (b / 10) * .18, y)); if (pa) { cc.fillStyle = ['#e85a5a', '#5ab0e8', '#f2c84a', '#8ae05a', '#e88ad8'][(b + s + i) % 5]; cc.fillRect(pa.x, pa.y - .25 * pa.s, .1 * pa.s, .25 * pa.s); } } } cc.restore(); for (let k = 1; k < 3; k++) gowLines(cc, [at(u0, k * .8), at(u1, k * .8)], 1.2, '#2a1a10'); } }
        gowGlowAt(cc, at(.5, 1.3), 4, '#ffb060', .35); } });
      sadBox3(g, [0, 3.2, -9.3], 10.4, 4.4, 2.8, '#c8b494', p, { face: (cc, f, P, n) => { if (f[4][2] !== 1) return; const at = (u, y) => vAdd(vLerp(P(...f[0]), P(...f[1]), u), [0, y, .02]); for (const u of [.2, .62]) { sadPoly(cc, [at(u, .7), at(u + .18, .7), at(u + .18, 2.1), at(u, 2.1)], '#3a3040', 1); gowLines(cc, [at(u + .09, .7), at(u + .09, 2.1)], 1.5, '#e8dcc8'); } } });
      // eaves (front overhang) + roof
      sadPoly(g, [[-6, 3.3, -6.2], [6, 3.3, -6.2], [6, 3.6, -7.0], [-6, 3.6, -7.0]], '#3a3a44', 1.2); sadPoly(g, [[-5.8, 6.0, -6.6], [5.8, 6.0, -6.6], [5.8, 7.2, -9.3], [-5.8, 7.2, -9.3]], '#2e2e38', 1.2); sadPoly(g, [[-5.8, 7.2, -9.3], [5.8, 7.2, -9.3], [5.8, 6.0, -12], [-5.8, 6.0, -12]], '#22222a', 1.2);
      for (let i = 0; i < 18; i++) gowLines(g, [[-5.8 + i * .68, 6.0, -6.6], [-5.8 + i * .68, 7.2, -9.3]], 1, 'rgba(0,0,0,.35)');
      // sign board 浦原商店 above the doors
      const sp = sadPoly(g, [[-3.2, 3.55, -6.45], [3.2, 3.55, -6.45], [3.2, 4.65, -6.45], [-3.2, 4.65, -6.45]], '#4a3020', 1.4, '#1a0e06'); const q = project([0, 4.1, -6.4]); if (sp && q) { g.fillStyle = '#f2e8d0'; g.font = `900 ${Math.max(8, .82 * q.s)}px "IPAMincho", "IPAGothic", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('浦原商店', q.x, q.y); } } }); }
    // neighbouring houses + fence + utility poles with wires
    for (const [x, z, w, h, col] of [[-14, -11, 7, 5.5, '#b8a890'], [13, -12, 8, 6.5, '#a89a88'], [-22, -16, 7, 7, '#9a8a7a'], [22, -18, 9, 6, '#b0a090']]) { const c = [x, 0, z]; I.push({ c, h, w, d: 6, draw: (g, p) => { sadBox3(g, c, w, 6, h, p === PALETTES.shop_dusk ? col : col, p); sadPoly(g, [[x - w / 2 - .4, h, z + 3.4], [x + w / 2 + .4, h, z + 3.4], [x + w / 2 + .4, h + 1.4, z], [x - w / 2 - .4, h + 1.4, z]], '#3a3a44', 1); } }); }
    for (const x of [-9, 9]) { const c = [x, 0, -4]; I.push({ c, h: 1.6, w: 6, d: .2, draw: g => { for (let i = 0; i < 12; i++) gowLines(g, [[x - 3 + i * .5, 0, -4], [x - 3 + i * .5, 1.5, -4]], 3, '#6a5040'); gowLines(g, [[x - 3, 1.3, -4], [x + 3, 1.3, -4]], 2, '#4a3426'); } }); }
    for (const [x, z] of [[-7.5, 2], [10, 1]]) { const c = [x, 0, z]; I.push({ c, h: 10, w: .4, draw: g => { gowLines(g, [[x, 0, z], [x, 9.5, z]], Math.max(2, sadInkW(c, 5)), '#3a3236'); gowLines(g, [[x - .9, 8.8, z], [x + .9, 8.8, z]], 2, '#3a3236'); } }); }
    I.push({ c: [0, 9, 1.5], h: 1, w: 30, draw: g => { for (const dy of [0, .35, .7]) { const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(-30, 30, u), 8.8 - dy - Math.sin(u * Math.PI * 3) * .3, 1.5]); } gowLines(g, pts, 1.2, '#2a2228'); } } });
    SETCACHE[key] = I; }
  drawItems(ctx, SETCACHE[key], pal, o, t);
} };

// ================================================================================================ UNDERGROUND TRAINING GROUND
SETS.undergrounds = { pal: 'study', draw(ctx, t, o) {
  const pal = o.pal;
  if (bgPass(o)) { drawSky(ctx, pal, t, Object.assign({ clouds: 14, cloudSeed: 47 }, o)); drawMountains(ctx, pal, 37, 1100, 120, '#b89a7a'); drawMountains(ctx, pal, 39, 700, 70, '#a8845e'); drawGround(ctx, pal, { col: '#c8a87a', col2: '#9a7a54' });
    if (o.dmg) for (let i = 0; i < 2 + o.dmg * 2; i++) { const rr = rng(700 + i); drawCrater(ctx, [(rr() - .5) * 30, 0, (rr() - .5) * 30 - 6], 1.5 + rr() * 2.5 * o.dmg, pal, 700 + i); } }
  const key = 'underg'; if (!SETCACHE[key]) { const I = [], r = rng(41);
    for (let i = 0; i < 9; i++) { const c = [(r() - .5) * 160, 0, -30 - r() * 120], rr = 8 + r() * 14, h = 14 + r() * 26, sd = 40 + i; I.push({ c, h, w: rr * 2, draw: (g, p) => drawPainterCliff(g, c, rr, h, p, sd, { col: '#c09a6e' }) }); }
    for (let i = 0; i < 14; i++) { const c = [(r() - .5) * 90, 0, -8 - r() * 70], h = 4 + r() * 12, w0 = .6 + r() * 1.2, sd = i; I.push({ c, h, w: w0 * 2, draw: (g, p, tt, zz) => { const pts = [[c[0] - w0, 0, c[2]], [c[0] - w0 * .6, h * .55, c[2]], [c[0] - w0 * .2 + Math.sin(sd) * .3, h, c[2]], [c[0] + w0 * .3, h * .7, c[2]], [c[0] + w0, 0, c[2]]]; const sp = sadPoly(g, pts, fogMix('#b08a62', zz, p, 1), sadInkW(c, .8), '#3a2414'); if (sp && sp.length > 2) { g.save(); polyPath(g, sp); g.clip(); g.fillStyle = 'rgba(80,50,30,.35)'; g.fillRect(sp[2][0], 0, W, H); g.restore(); } } }); }
    for (let i = 0; i < 16; i++) { const c = [(r() - .5) * 50, 0, -2 - r() * 40], rr = .4 + r() * 1.6, sd = 200 + i; I.push({ c, h: rr, w: rr * 2, draw: (g, p) => drawRock(g, c, rr, p, sd, '#a08060') }); }
    for (let i = 0; i < 6; i++) { const c = [(r() - .5) * 60, 0, -10 - r() * 40], h = 3 + r() * 3, sd = i; I.push({ c, h, w: 2, draw: (g, p, tt, zz) => { const col = fogMix('#5a4030', zz, p, 1); gowLines(g, [c, [c[0] + .2, h, c[2]]], Math.max(2, sadInkW(c, 3)), col); for (let b = 0; b < 4; b++) { const y = h * (.45 + b * .13), s = b % 2 ? 1 : -1; gowLines(g, [[c[0] + .1, y, c[2]], [c[0] + s * (1 + hash(sd + b)), y + .8, c[2]], [c[0] + s * (1.4 + hash(sd + b)), y + 1.4, c[2]]], Math.max(1, sadInkW(c, 1.6)), col); } } }); }
    I.push({ c: [0, 0, -10], h: 7, w: 6, draw: (g, p, tt) => { if (!GOW_SETSTATE.keik) return; const gk = GOW_SETSTATE.garg; for (const x of [-2.6, 2.6]) { sadBox3(g, [x, 0, -10], .55, .55, 6.4, '#6a4a2e', p); sadBox3(g, [x, 6.4, -10], .8, .8, .25, '#4a3020', p); for (const y of [1.5, 4.5]) { const q = project([x, y, -9.7]); if (q) { g.fillStyle = '#f2e8d0'; g.fillRect(q.x - .12 * q.s, q.y - .3 * q.s, .24 * q.s, .6 * q.s); g.fillStyle = '#c8203a'; g.fillRect(q.x - .05 * q.s, q.y - .2 * q.s, .1 * q.s, .4 * q.s); } } }
      if (gk > 0) { const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, r = (Math.sin(a * 3 + tt * 2) * .15 + 1); pts.push([Math.cos(a) * 1.9 * gk * r * (1 + .1 * hash(i)), 3.2 + Math.sin(a) * 2.9 * r * Math.min(1, gk * 1.5), -10]); } const q = project([0, 3.2, -10]); if (q) { g.save(); g.globalCompositeOperation = 'screen'; glow(g, q.x, q.y, 4 * gk * q.s, '#ff7ad8', .55); g.restore(); } sadPoly(g, pts, '#05030a', 2.5, '#ff7ad8'); const inner = pts.map(pp => [pp[0] * .6, 3.2 + (pp[1] - 3.2) * .6, -10]); sadPoly(g, inner, rgba('#3a0a30', .9)); } } });
    if (o.ladder !== false) I.push({ c: [6, 0, -12], h: 30, w: 1, draw: (g, p) => { for (const dx of [-.3, .3]) gowLines(g, [[6 + dx, 0, -12], [6 + dx, 40, -12]], Math.max(1.5, sadInkW([6, 0, -12], 2)), '#4a3a30'); for (let y = .4; y < 40; y += .45) gowLines(g, [[5.7, y, -12], [6.3, y, -12]], 1.5, '#4a3a30'); } });
    SETCACHE[key] = I; }
  GOW_SETSTATE.keik = o.keikaigi; GOW_SETSTATE.garg = o.garganta || 0; drawItems(ctx, SETCACHE[key], pal, o, t);
} };

// ================================================================================================ CLOCK TOWER (interior)
SETS.clocktower = { pal: 'clock', draw(ctx, t, o) {
  const pal = o.pal, R = 10, Hh = 14, stop = o.stop || 0, spin = t * (1 - stop * stop) + (o.spinT || 0);
  if (bgPass(o)) { ctx.fillStyle = '#140c06'; ctx.fillRect(0, 0, W, H);
    sadPoly(ctx, [[-R, 0, -R], [R, 0, -R], [R, 0, R], [-R, 0, R]], '#5a3e26'); for (let x = -R; x <= R; x += .7) gowLines(ctx, [[x, .003, -R], [x, .003, R]], 1, rgba('#2a1a10', .55));
    // walls (dark wood planks) + back wall with the big dial window
    for (const [a, b, col] of [[[-R, 0, -R], [R, 0, -R], '#3a2818'], [[R, 0, -R], [R, 0, R], '#2e2014'], [[-R, 0, R], [-R, 0, -R], '#2e2014'], [[R, 0, R], [-R, 0, R], '#2a1c12']]) { gowQuad(ctx, a, b, Hh, col); for (let i = 0; i <= 16; i++) { const p = vLerp(a, b, i / 16); gowLines(ctx, [p, vAdd(p, [0, Hh, 0])], 1, 'rgba(0,0,0,.35)'); } }
    // dial window: backlit translucent glass, roman numerals, hands
    const C = [0, 7.2, -R + .05], DR = 5.2, q = project(C); if (q) { const rp = DR * q.s; ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y, rp * 2.2, '#ffd08a', .5); ctx.restore();
      const ring = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; ring.push([C[0] + Math.cos(a) * DR, C[1] + Math.sin(a) * DR, C[2]]); } const sp = sadPoly(ctx, ring, '#f8dca0', 3, '#1a0e06');
      if (sp) { ctx.save(); polyPath(ctx, sp); ctx.clip(); const gr = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rp); gr.addColorStop(0, '#fff4d8'); gr.addColorStop(1, '#e8a860'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 12; i++) { const a = -HP + i / 12 * TAU; gowLines(ctx, [C, [C[0] + Math.cos(a) * DR, C[1] - Math.sin(a) * DR, C[2]]], 2.5, '#2a1a0e'); }
        const inner = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; inner.push([C[0] + Math.cos(a) * DR * .72, C[1] + Math.sin(a) * DR * .72, C[2]]); } for (const rn of projLine(inner.concat([inner[0]]))) { polyPath(ctx, rn, false); ctx.lineWidth = 4; ctx.strokeStyle = '#2a1a0e'; ctx.stroke(); }
        ctx.fillStyle = '#2a1a0e'; ctx.font = `700 ${Math.max(8, .7 * q.s)}px "Times New Roman", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; for (let i = 0; i < 12; i++) { const a = -HP + i / 12 * TAU, p = project([C[0] + Math.cos(a) * DR * .86, C[1] - Math.sin(a) * DR * .86, C[2]]); if (p) ctx.fillText(RN[i], p.x, p.y); }
        const hrs = o.time == null ? 11.9 : o.time, ha = -HP + (hrs % 12) / 12 * TAU, ma = -HP + ((hrs % 1) * 60 + spin * .5) / 60 * TAU; gowLines(ctx, [C, [C[0] + Math.cos(ha) * DR * .5, C[1] - Math.sin(ha) * DR * .5, C[2]]], Math.max(3, .18 * q.s), '#1a0e06'); gowLines(ctx, [C, [C[0] + Math.cos(ma) * DR * .78, C[1] - Math.sin(ma) * DR * .78, C[2]]], Math.max(2, .12 * q.s), '#1a0e06'); ctx.restore(); }
      // light shafts from the dial into the room
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const f0 = project([0, 0, 2]); if (f0) { const gr = ctx.createLinearGradient(q.x, q.y, f0.x, f0.y); gr.addColorStop(0, 'rgba(255,210,140,.3)'); gr.addColorStop(1, 'rgba(255,210,140,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(q.x - rp, q.y); ctx.lineTo(q.x + rp, q.y); ctx.lineTo(f0.x + 4 * f0.s, f0.y); ctx.lineTo(f0.x - 4 * f0.s, f0.y); ctx.fill(); } ctx.restore(); } }
  const key = 'clock'; if (!SETCACHE[key]) { const I = [];
    const gears = [[[-R + .1, 6, -4], [1, 0, 0], 3.2, 18, 1], [[-R + .15, 2.8, -.8], [1, 0, 0], 1.8, 12, -1.8], [[-R + .1, 9, 2], [1, 0, 0], 2.4, 14, -1.3], [[R - .1, 5, -3], [-1, 0, 0], 2.8, 16, -1.1], [[R - .15, 8.8, -6.6], [-1, 0, 0], 1.6, 10, 2], [[R - .1, 3, 3], [-1, 0, 0], 2.2, 13, 1.4], [[-5, 11.5, -R + .1], [0, 0, 1], 2, 12, 1.6], [[5.5, 11.8, -R + .1], [0, 0, 1], 1.7, 11, -1.9]];
    gears.forEach(([c, n, Rg, teeth, sp]) => I.push({ c, h: Rg * 2, w: Rg * 2, draw: (g, p, tt) => gowGear(g, c, n, Rg, teeth, GOW_SETSTATE.spin * sp * .35, '#a8763a', p) }));
    // pendulum (swings) hanging from the dial axle
    I.push({ c: [0, 4, -R + 1.2], h: 7, w: 2, draw: (g, p, tt) => { const a = Math.sin(GOW_SETSTATE.spin * 2.2) * .35 * (GOW_SETSTATE.pend), top = [0, 7.2, -R + 1.2], bob = [Math.sin(a) * 5.6, 7.2 - Math.cos(a) * 5.6, -R + 1.2]; gowLines(g, [top, bob], Math.max(2, sadInkW(top, 3)), '#5a3a1a'); const q = project(bob); if (q) { g.fillStyle = '#c8963a'; g.beginPath(); g.arc(q.x, q.y, .7 * q.s, 0, TAU); g.fill(); g.lineWidth = sadInkW(bob, 1.2); g.strokeStyle = '#1a0e06'; g.stroke(); g.fillStyle = 'rgba(255,240,180,.6)'; g.beginPath(); g.arc(q.x - .2 * q.s, q.y - .2 * q.s, .2 * q.s, 0, TAU); g.fill(); } } });
    for (let i = -2; i <= 2; i++) { const z = i * 4; I.push({ c: [0, Hh - .4, z], h: 1, w: 2 * R, draw: (g, p) => sadBox3(g, [0, Hh - 1, z], 2 * R, .5, .6, '#2a1a0e', p) }); }
    SETCACHE[key] = I; }
  GOW_SETSTATE.pend = o.pendulum === false ? 0 : 1; GOW_SETSTATE.spin = spin; drawItems(ctx, SETCACHE[key], pal, o, t);
  if (o.layer !== 'bg') { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 60; i++) { const u = ((stop >= 1 ? 0 : t) * .04 + hash(i)) % 1, q = project([(hash(i * 3) - .5) * 10, 1 + u * 9, -R + 2 + hash(i * 5) * 9]); if (q) { ctx.fillStyle = rgba('#ffe0a8', .6 * Math.sin(u * Math.PI)); ctx.fillRect(q.x, q.y, Math.max(1, .04 * q.s), Math.max(1, .04 * q.s)); } } ctx.restore(); }
} };

// ================================================================================================ SHIFTING ARENA
const GOW_WALLS = { stone: ['#a8a6ae', '#8a8890'], mirror: ['#d8d0f0', '#b8a8e8'], books: ['#5a3a2a', '#4a2a1c'], curtain: ['#8a1422', '#6a0e18'], glitch: ['#ff6ad0', '#7ad8ff'], void: ['#0a0810', '#14101c'], clocks: ['#c8963a', '#8a6a3a'] };
function gowWallPanel(g, kind, P, w, h, zz, pal, tt, seed) { // decorate one wall panel (P(u,v) -> world point, u 0..1 across, v 0..1 up)
  if (kind === 'books') { for (let s = 0; s < 6; s++) { const v0 = .04 + s * .16; for (let b = 0; b < 14; b++) { const u0 = b / 14, u1 = u0 + .06; sadPoly(g, [P(u0, v0), P(u1, v0), P(u1, v0 + .12), P(u0, v0 + .12)], fogMix(['#7a2a22', '#2a3a5a', '#a8803a', '#3a5a3a', '#c8b89a'][Math.floor(hash(seed * 9 + b + s * 17) * 5)], zz, pal, 1)); } } }
  else if (kind === 'mirror') { const sp = projPoly([P(.08, .05), P(.92, .05), P(.92, .95), P(.08, .95)]); if (sp.length > 2) { g.save(); polyPath(g, sp); g.clip(); const gr = g.createLinearGradient(sp[0][0], sp[0][1], sp[2][0], sp[2][1]); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(.5, 'rgba(160,140,220,.1)'); gr.addColorStop(1, 'rgba(255,255,255,.4)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); polyPath(g, sp); g.lineWidth = 2; g.strokeStyle = '#4a3a7a'; g.stroke(); } }
  else if (kind === 'curtain') { for (let i = 0; i <= 10; i++) { const a = project(P(i / 10, 0)), b = project(P(i / 10, 1)); if (a && b) { g.strokeStyle = i % 2 ? 'rgba(0,0,0,.35)' : 'rgba(255,120,120,.2)'; g.lineWidth = Math.max(2, .3 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } } }
  else if (kind === 'glitch') { const r = rng(seed + Math.floor(tt * 8)); for (let i = 0; i < 6; i++) { const u = r(), v = r(); sadPoly(g, [P(u, v), P(Math.min(1, u + .2 * r()), v), P(Math.min(1, u + .2 * r()), Math.min(1, v + .08)), P(u, Math.min(1, v + .08))], r() < .5 ? '#ffffff' : '#2a1a3a'); } }
  else if (kind === 'clocks') { const c = P(.5, .55), q = project(c); if (q) { const rr = w * .32 * q.s; g.fillStyle = '#f2e8d0'; g.beginPath(); g.arc(q.x, q.y, rr, 0, TAU); g.fill(); g.lineWidth = Math.max(1.5, rr * .08); g.strokeStyle = '#2a1a0e'; g.stroke(); const a1 = tt * .5 + seed, a2 = tt * 4 + seed * 2; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(a1) * rr * .5, q.y + Math.sin(a1) * rr * .5); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(a2) * rr * .8, q.y + Math.sin(a2) * rr * .8); g.stroke(); } }
  else if (kind === 'stone') { for (let v = .25; v < 1; v += .25) gowLines(g, [P(0, v), P(1, v)], 1, 'rgba(0,0,0,.25)'); }
}
SETS.shiftarena = { pal: 'shift', draw(ctx, t, o) {
  const pal = o.pal, R = 15, Hh = 9, from = o.from || 'stone', to = o.wall || from, ph = o.phase == null ? 1 : o.phase;
  if (bgPass(o)) { ctx.fillStyle = '#0a0a10'; ctx.fillRect(0, 0, W, H);
    if (o.floor === 'chess') { for (let i = -10; i < 10; i++) for (let j = -10; j < 10; j++) sadPoly(ctx, [[i * 1.5, .002, j * 1.5], [i * 1.5 + 1.5, .002, j * 1.5], [i * 1.5 + 1.5, .002, j * 1.5 + 1.5], [i * 1.5, .002, j * 1.5 + 1.5]], (i + j + 20) % 2 ? '#e8e0f0' : '#1e1828', .5, 'rgba(10,6,14,.5)'); } else
    for (let i = -10; i < 10; i++) for (let j = -10; j < 10; j++) { const x = i * 1.5, z = j * 1.5, d = Math.hypot(x, z) / (R * 1.42), k = o.floor === false ? 0 : clamp((ph * 1.3 - d) / .15, 0, 1), kind = k < .5 ? from : to, cols = GOW_WALLS[kind === 'books' || kind === 'curtain' ? 'stone' : kind] || GOW_WALLS.stone, flip = Math.abs(Math.cos(k * Math.PI));
      sadPoly(ctx, [[x, 0, z], [x + 1.5, 0, z], [x + 1.5, 0, z + 1.5], [x, 0, z + 1.5]], mixHex(cols[(i + j + 20) % 2], '#000000', (1 - flip) * .5), .6, 'rgba(10,10,20,.4)'); } }
  const key = 'shift'; if (!SETCACHE[key]) { const I = []; const sides = [[[-R, 0, -R], [R, 0, -R]], [[R, 0, -R], [R, 0, R]], [[R, 0, R], [-R, 0, R]], [[-R, 0, R], [-R, 0, -R]]];
    sides.forEach(([a, b], si) => { const n = 6; for (let i = 0; i < n; i++) { const A = vLerp(a, b, i / n), B = vLerp(a, b, (i + 1) / n), c = vAdd(vLerp(A, B, .5), [0, 0, 0]), seed = si * 10 + i; I.push({ c, h: Hh, w: 5, d: .5, draw: (g, p, tt, zz) => {
      const cc = vLerp(A, B, .5), d = (Math.abs(cc[0]) + Math.abs(cc[2])) / (2 * R), k = clamp((GOW_SETSTATE.ph * 1.3 - d * .9) / .2, 0, 1), kind = k < .5 ? GOW_SETSTATE.from : GOW_SETSTATE.to, cols = GOW_WALLS[kind] || GOW_WALLS.stone, sq = Math.abs(Math.cos(k * Math.PI));
      const mid = vLerp(A, B, .5), P = (u, v) => { const base = vLerp(A, B, u), x = vLerp(mid, base, sq); return [x[0], v * Hh, x[2]]; };
      const sp = sadPoly(g, [P(0, 0), P(1, 0), P(1, 1), P(0, 1)], fogMix(cols[seed % 2], zz, p, .6), sadInkW(cc, 1), '#0e0e14'); if (sp && sq > .3) gowWallPanel(g, kind, P, 5 * sq, Hh, zz, p, tt, seed); } }); } });
    SETCACHE[key] = I; }
  GOW_SETSTATE.ph = ph; GOW_SETSTATE.from = from; GOW_SETSTATE.to = to; drawItems(ctx, SETCACHE[key], pal, o, t);
  if (to === 'void' && ph > .5 && o.layer !== 'fg') { ctx.save(); ctx.globalAlpha = (ph - .5) * .6; ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, W, H * .35); ctx.restore(); }
} };
// palette photography tweaks for these sets (std hook from sets_sad.js picks SAD_PALPOST; register ours when it exists at draw time)
(function () { const base = std; std = function (f, o = {}) { base(f, o); const pp = window.GOW_PALPOST[o.pal]; if (pp && (typeof SAD_PALPOST === 'undefined' || !SAD_PALPOST[o.pal]) && (!o.post || o.post === 'normal' || o.post === 'soft')) f.post(Object.assign({}, pp, o.postOver || {})); }; })();
