/* engine/sets_hy.js (agent E, hulk-vs-yujiro) - ONE ARENA for the whole film: the Valhalla colosseum (sets_hvg.js) re-dressed for Hulk vs Yujiro.
   SETS.hyarena  f.bg({ set: 'hyarena', pal, dmg, ... })   palettes: arena_hy (night, dusty) | arena_hy_dust (thick dust) | arena_hy_dark (torches out)
                 | arena_hy_red (emergency red + gamma) | arena_hy_dawn (pale morning aftermath)
     options (all valhalla options still work: react cheer crowd eyes torch torchT torchSpan gateW gateE crater craterAt craterR rays statues):
       dmg 0..3      0 clean | 1 landing crater + cracks | 2 + wall hole, broken stand section, scattered boulders, smoke | 3 + collapsed stands (2 breaches),
                     fires in the stands, dust columns, the floor split by fissures
       dust 0..1     low dust haze layer (default by dmg)          spots 0..1  floodlight beams from the colonnade onto the centre (Baki feel)
       gamma 0..1    floor fissures glow green (use with dmg 3)    alarm 0..1  rotating red emergency light sweep
       fires 0..1    override fire amount                          ledge:false hide ARENA_LEDGE (low stone ledge at HY.LEDGE where Yujiro sits / eats)
       breach [a,..] angles (rad) of the collapsed stand sections  collapse {a, t0} animate one stand section collapsing (time t0 = set time)
   HY.LEDGE = {pos, top, yaw}: the ledge seat (sit pose: at([x, top - .5?...]) see API.md 15).  HY.SPOTS: floodlight anchor positions.
   STAR CROWD (cameos in the stands): crowdStar(f, key, reaction, o) draws a known character standing in the front rows;
       keys (priority first): shunsui dazai urahara gojo harry gowther shinji aizen ; reactions: hush cheer gasp roar smile shock laugh
       starFig(key, reaction, o) -> fig (cached); starCam(key, t, o) -> close-up camera on that star (face/bust); starShot(f, key, reaction, lt, o) = full
       1-2 s hand2d reaction shot (bg + cam + figure + crowd FG).  HY_STARS[key] = {cast, form, ang, tier, base pose}.
   Camera helpers (stands / tunnel / overhead / floor): camStands camTunnel camOverhead camFloor  (+ camLowTwo camLookUp camGiant in this file).      */
'use strict';
Object.assign(PALETTES, {
  arena_hy: { skyTop: '#05060c', skyMid: '#1a1a2a', skyLow: '#8a4a30', fog: '#3a2c2a', sun: [-.35, .75, .5], ground: '#a68a66', ground2: '#5a4632', wall: '#625656', wallShade: '#201a20', roof: '#2a2226', roofShade: '#100c10', wood: '#3a281a', cloud: '#4a3a40', cloudShade: '#16121a', haze: .55, line: '#0a0808', amb: '#ffb880', stars: true, crowd: '#120e12', crowdRim: '#ff9a50', torch: '#ff9a3a' },
  arena_hy_dust: { skyTop: '#1a1210', skyMid: '#4a3a2e', skyLow: '#a07a56', fog: '#8a6e52', sun: [-.35, .75, .5], ground: '#a0866a', ground2: '#5e4a38', wall: '#7a6a5e', wallShade: '#3a2e2a', roof: '#3a2e28', roofShade: '#1a1410', wood: '#3a2a1c', cloud: '#7a6450', cloudShade: '#3a2a20', haze: .8, line: '#120c08', amb: '#ffc890', crowd: '#2a2018', crowdRim: '#ffb070', torch: '#ffa040' },
  arena_hy_dark: { skyTop: '#020208', skyMid: '#080a18', skyLow: '#1a1a2a', fog: '#141420', sun: [-.3, .7, .5], ground: '#4a4448', ground2: '#1a181c', wall: '#2e2c34', wallShade: '#0a0a10', roof: '#141218', roofShade: '#060508', wood: '#1a1410', cloud: '#1a1a28', cloudShade: '#08080e', haze: .5, line: '#000000', amb: '#8a9ac8', stars: true, crowd: '#060608', crowdRim: '#6a7aa0', torch: '#ff7a2a' },
  arena_hy_red: { skyTop: '#0c0204', skyMid: '#3a0a10', skyLow: '#c03a20', fog: '#5a1a16', sun: [.3, .6, .6], ground: '#8a5a48', ground2: '#3a201a', wall: '#6a4440', wallShade: '#200c10', roof: '#2a1012', roofShade: '#0e0406', wood: '#2a140e', cloud: '#7a2a20', cloudShade: '#200808', haze: .6, line: '#060102', amb: '#ff7a5a', crowd: '#0e0406', crowdRim: '#ff5a3a', torch: '#ff6a2a' },
  arena_hy_dawn: { skyTop: '#3a4a6a', skyMid: '#a0a4b4', skyLow: '#f0d0b0', fog: '#b8aaa0', sun: [.5, .3, -.8], ground: '#b0a08a', ground2: '#6e6254', wall: '#8a8280', wallShade: '#4a4448', roof: '#4a4248', roofShade: '#2a2428', wood: '#4a3a2a', cloud: '#e8dcd8', cloudShade: '#8a8090', haze: .65, line: '#1a1618', amb: '#ffe8d0', crowd: '#3a3438', crowdRim: '#ffe0c0', torch: '#ffb060' },
});
Object.assign(GRADES, {
  arena_hy: { sat: 1.06, contrast: 1.14, tint: ['#ffcfa0', .12], lift: ['#140a12', .07] }, arena_hy_dust: { sat: .92, contrast: 1.04, soft: ['#e8c8a0', .2], lift: ['#3a2a1a', .06] },
  arena_hy_dark: { sat: .85, contrast: 1.16, tint: ['#a8b0d8', .18], lift: ['#04040a', .05] }, arena_hy_red: { sat: 1.15, contrast: 1.18, tint: ['#ffa090', .2], lift: ['#1a0206', .06] },
  arena_hy_dawn: { sat: .9, contrast: 1.02, soft: ['#ffe8d8', .18], lift: ['#2a2a3a', .05] },
});
if (window.GOW_PALPOST) Object.assign(window.GOW_PALPOST, { arena_hy: { bloom: .55 }, arena_hy_red: { bloom: .7 }, arena_hy_dark: { bloom: .65 }, arena_hy_dust: { bloom: .35 }, arena_hy_dawn: { bloom: .35 } });
if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, { arena_hy: { bloom: .55 }, arena_hy_red: { bloom: .7 }, arena_hy_dark: { bloom: .65 }, arena_hy_dust: { bloom: .35 }, arena_hy_dawn: { bloom: .35 } });
HY.R = 26;
HY.LEDGE = { pos: [10.5, 0, -22.2], top: .62, yaw: Math.atan2(-10.5, 22.2), len: 3.6 };   // low stone ledge against the north-east wall; sit: HY.ledgeSit('yuj_eat'|'yuj_sit', over)
HY.SPOTS = [[-30, 30, -18], [30, 30, -18], [-24, 30, 22], [24, 30, 22]];
HY.BREACH = [-2.45, .75];          // default collapsed stand sections (dmg 3; the first also at dmg 2, half size)
// emblems on the wall banners: west = Hulk's gamma burst (green), east = 鬼 (Yujiro)
function hyEmblem(ctx, qe, r, west, pm, pal) {
  if (west) { ctx.fillStyle = hvFog('#6aff3a', pm, pal); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 2 ? r * .45 : r; ctx.lineTo(qe.x + Math.cos(a) * rr, qe.y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  else { ctx.save(); ctx.font = `${Math.max(8, r * 1.9)}px "Yuji Boku", "IPAGothic", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = hvFog('#f0e6d8', pm, pal); ctx.fillText('鬼', qe.x, qe.y); ctx.restore(); }
}
function hyBox(ctx, c, w, h, d, yaw, col, pal, ink = 1) { // simple lit box (ledge, rubble slab)
  const cs = Math.cos(yaw), sn = Math.sin(yaw), P = (x, y, z) => [c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs];
  const faces = [[[-w, 0, d], [w, 0, d], [w, h, d], [-w, h, d], [0, 0, 1]], [[w, 0, -d], [-w, 0, -d], [-w, h, -d], [w, h, -d], [0, 0, -1]], [[w, 0, d], [w, 0, -d], [w, h, -d], [w, h, d], [1, 0, 0]], [[-w, 0, -d], [-w, 0, d], [-w, h, d], [-w, h, -d], [-1, 0, 0]], [[-w, h, d], [w, h, d], [w, h, -d], [-w, h, -d], [0, 1, 0]]];
  for (const f of faces) { const nl = f[4], n = [nl[0] * cs + nl[2] * sn, nl[1], -nl[0] * sn + nl[2] * cs], pts = f.slice(0, 4).map(q => P(...q)); const ctr = vMul(pts.reduce((a, b) => vAdd(a, b), [0, 0, 0]), .25); if (vDot(n, toCam(ctr)) <= 0) continue;
    hvP(ctx, pts, hvFog(hvLitCol(col, n, pal), ctr, pal), ink); }
}
function hyFire(ctx, p, s, t, seed, pal) { const q = project(p); if (!q || q.z < 1) return; const sz = s * q.s; ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, q.x, q.y - sz * .5, sz * 2.4, '#ff7a2a', .35); ctx.restore();
  for (let i = 0; i < 4; i++) hvFlame(ctx, q.x + (hash(seed + i) - .5) * sz * 1.2, q.y, sz * (.7 + .5 * hash(seed + i * 3)), t, seed + i, i % 2 ? '#ff8a2a' : '#ffc040'); }
SETS.hyarena = { pal: 'arena_hy', draw(ctx, t, o) {
  const pal = o.pal, dmg = o.dmg || 0, R = HY.R;
  const o2 = Object.assign({ emblem: 'hy', gateCols: ['#9cff6a', '#ff4a3a'], gateFlame: pal.torch || '#ffa040', eyes: false, react: 'cheer', cheer: .7 }, o);
  if (dmg >= 1 && o.crater == null) Object.assign(o2, { crater: 1, craterAt: [0, 0, 0], craterR: 4.5 });
  SETS.valhalla.draw(ctx, t, o2); if (o.layer === 'fg') return;
  const A = HVG_AR, breach = o.breach || (dmg >= 3 ? HY.BREACH : dmg >= 2 ? [HY.BREACH[0]] : []);
  // collapsed stand sections: dark broken notch through the tiers, rubble pile spilling onto the floor, smoke
  breach.forEach((a, bi) => { const half = (dmg >= 3 ? .2 : .12), seg = 10, top = A.h0 + A.tiers * A.rise * (dmg >= 3 ? .85 : .55), pts = [];
    for (let i = 0; i <= seg; i++) { const aa = a - half + i / seg * half * 2, rr = R + .3, yy = A.h0 * .2 + (top - A.h0 * .2) * (.55 + .45 * Math.sin(i / seg * Math.PI)) * (.85 + .3 * hash(bi * 13 + i)); pts.push([Math.cos(aa) * (rr + (yy - A.h0) / A.rise * A.tread), yy, Math.sin(aa) * (rr + (yy - A.h0) / A.rise * A.tread)]); }
    for (let i = seg; i >= 0; i--) { const aa = a - half + i / seg * half * 2; pts.push([Math.cos(aa) * (R + .2), 0, Math.sin(aa) * (R + .2)]); }
    const sp = projPoly(pts); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix('#0e0a0c', camDepth([Math.cos(a) * R, 4, Math.sin(a) * R]), pal, .6); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = pal.line; ctx.stroke();
      // exposed rebar / broken slab edges
      ctx.strokeStyle = rgba('#8a6a5a', .8); ctx.lineWidth = 1.5; for (let i = 1; i < seg; i += 2) { const q = project(pts[i]); if (q) { ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + (hash(i + bi) - .5) * 14, q.y + 10 + 10 * hash(i)); ctx.stroke(); } } }
    for (let i = 0; i < 14; i++) { const aa = a + (hash(bi * 7 + i) - .5) * half * 2.4, rr = R - .3 - hash(i * 3 + bi) * 4.5; drawBoulder(ctx, [Math.cos(aa) * rr, .3, Math.sin(aa) * rr], { r: .5 + 1.1 * hash(i * 5 + bi), rot: i, seed: 300 + i + bi * 20, col: pal.wall }); }
    drawSmokeColumn(ctx, [Math.cos(a) * (R + 3), 2, Math.sin(a) * (R + 3)], 22, 5, pal, t, 30 + bi, '#4a4048');
  });
  // animated collapse of one section (o.collapse = {a, t0})
  if (o.collapse) { const c = o.collapse, aa = c.a, ct = t - (c.t0 || 0); if (ct > 0) fxCollapse(ctx, [Math.cos(aa) * (R + 4), A.h0 + 10, Math.sin(aa) * (R + 4)], ct, { w: 9, h: 12, n: 22, dur: 1.8, col: pal.wall }); }
  // fires in the stands
  const fires = o.fires != null ? o.fires : (dmg >= 3 ? 1 : dmg >= 2 ? .4 : 0);
  if (fires > 0) { const fa = [-2.2, -.9, .4, 1.3, 2.7, 3.4], n = Math.ceil(fa.length * fires); for (let i = 0; i < n; i++) { const a = fa[i], k = 1 + (i % 4), rr = R + 1.5 + k * A.tread + .8, y = A.h0 + (k + 1) * A.rise; hyFire(ctx, [Math.cos(a) * rr, y, Math.sin(a) * rr], 1.4, t, 50 + i * 7, pal); if (i % 2 === 0) drawSmokeColumn(ctx, [Math.cos(a) * rr, y + 1, Math.sin(a) * rr], 18, 3.5, pal, t, 60 + i, '#3a3034'); } }
  // ledge (Yujiro's seat) with cup + meat
  if (o.ledge !== false) { const L = HY.LEDGE; hyBox(ctx, L.pos, L.len / 2, L.top, .55, L.yaw, mixHex(pal.wall, '#9a8a7a', .3), pal, 1.2);
    if (o.props !== false) { const cs = Math.cos(L.yaw), sn = Math.sin(L.yaw), side = (x) => [L.pos[0] + x * cs, L.top, L.pos[2] - x * sn]; drawCup(ctx, side(1.1), { size: .13, ripple: o.ripple || 0, t }); if (o.meat !== false) drawMeat(ctx, vAdd(side(-1.2), [0, .08, 0]), { size: .26, rot: .2, bite: o.meatBite }); } }
  // glowing gamma fissures across the floor
  const gk = o.gamma || 0; if (gk > 0) { ctx.save(); ctx.globalAlpha = clamp(gk, 0, 1); fxGammaCracks(ctx, [0, 0, 0], 10, { r: 16, n: 11, seed: 77 }); fxGammaCracks(ctx, [-6, 0, 4], 10, { r: 8, n: 6, seed: 81 }); ctx.restore(); }
  // floodlight beams (additive cones from the colonnade onto the centre)
  const spk = o.spots == null ? .55 : o.spots; if (spk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const [i, sp] of HY.SPOTS.entries()) { const a = project(sp), tgt = [(hash(i) - .5) * 6, 0, (hash(i * 3) - .5) * 6], b = project(tgt); if (!a || !b) continue; const w = 3.2 * b.s, dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const gr = ctx.createLinearGradient(a.x, a.y, b.x, b.y); gr.addColorStop(0, rgba('#fff4e0', .22 * spk)); gr.addColorStop(1, rgba('#fff4e0', .05 * spk)); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + nx * w, b.y + ny * w); ctx.lineTo(b.x - nx * w, b.y - ny * w); ctx.closePath(); ctx.fill(); glow(ctx, a.x, a.y, 28, '#ffffff', .6 * spk); } ctx.restore(); }
  // alarm: rotating red light sweep
  if (o.alarm) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const ph = (Math.sin(t * 5) * .5 + .5) * o.alarm; ctx.fillStyle = rgba('#ff1a1a', .22 * ph); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // low dust haze (bands above the floor)
  const dk = o.dust != null ? o.dust : [0, .25, .45, .65][Math.min(3, dmg)]; if (dk > 0) { const q0 = project([0, 0, 0]), q1 = project([0, 4, 0]); const yH = q0 && q1 ? q1.y : H * .55, yB = q0 ? q0.y : H * .8;
    const gr = ctx.createLinearGradient(0, yH - 200, 0, H); gr.addColorStop(0, rgba(pal.fog, 0)); gr.addColorStop(.35, rgba(mixHex(pal.fog, '#d8c0a0', .4), .35 * dk)); gr.addColorStop(1, rgba(mixHex(pal.fog, '#d8c0a0', .3), .15 * dk)); ctx.fillStyle = gr; ctx.fillRect(0, yH - 200, W, H - yH + 200);
    for (let i = 0; i < 7; i++) { const x = ((hash(i * 7) * W + t * 18 * (i % 2 ? 1 : -1)) % (W + 600)) - 300, y = lerp(yH, yB, .3 + .6 * hash(i * 3)); ctx.fillStyle = rgba(mixHex(pal.fog, '#e0c8a8', .5), .12 * dk); ctx.beginPath(); ctx.ellipse(x, y, 420, 60, 0, 0, TAU); ctx.fill(); } }
} };
// ------------------------------------------------------------------------------------------------ camera positions in the one arena
function camStands(t, o = {}) {   // from the crowd (tier, angle) looking at a target; o.over = crowd heads in the foreground via fxCrowdFG in the shot
  const k = o.tier == null ? 2 : o.tier, a = o.ang == null ? 2.4 : o.ang, rr = HY.R + 1.5 + k * HVG_AR.tread + 1.2, y = HVG_AR.h0 + (k + 1) * HVG_AR.rise + 1.6;
  const pos = [Math.cos(a) * rr, y, Math.sin(a) * rr]; return { pos, target: o.target || [0, 1.5, 0], fov: o.fov || 34, roll: o.roll || 0 };
}
function camTunnel(t, o = {}) {   // from the mouth of the west (Hulk) or east (Yujiro) gate tunnel, low, looking into the arena
  const west = o.side !== 'east', x = (west ? -1 : 1) * (HY.R + (o.depth == null ? 2.5 : o.depth)); return { pos: [x, o.h || 1.4, o.off || 0], target: o.target || [0, 1.6, 0], fov: o.fov || 38 };
}
function camOverhead(t, o = {}) { const c = o.target || [0, 0, 0], h = o.h || 34; return { pos: [c[0] + (o.dx || .01), h, c[2] + (o.dz || 4)], target: c, fov: o.fov || 40, roll: o.roll || 0 }; }
function camFloor(t, o = {}) { const c = o.target || [0, 1.2, 0], az = o.az == null ? .5 : o.az, d = o.dist || 9; return { pos: [c[0] + Math.sin(az) * d, o.h || .25, c[2] + Math.cos(az) * d], target: c, fov: o.fov || 36 }; }
// ------------------------------------------------------------------------------------------------ STAR CROWD (cameos)
const HY_STARS = {   // crowd.md seating: west stand = x < 0 (angle ~ PI), east = x > 0 (angle ~ 0), north = z < 0 (angle ~ -PI/2; the old gods' box is there)
  shunsui: { cast: 'kyoraku', form: 'base', ang: 2.78, tier: 1, base: 'kyoraku_lean', face: 'smirk', cup: true },
  dazai: { cast: 'dazai', form: 'base', ang: 2.63, tier: 1, base: 'any_handOnChin', face: 'smile' },
  urahara: { cast: 'urahara', form: 'base', ang: .32, tier: 2, base: 'urahara_fanFace', face: 'smile' },
  gojo: { cast: 'gojo', form: 'base', ang: -.12, tier: 0, base: 'goj_lean', face: 'smug' },
  harry: { cast: 'harry', form: 'base', ang: -.27, tier: 0, base: 'har_idle', face: 'determined' },
  kenpachi: { cast: 'kenpachi', form: 'base', ang: -1.18, tier: 6, base: 'kenpachi_shoulder', face: 'grin' },
  aizen: { cast: 'aizen', form: 'base', ang: -1.98, tier: 3, base: 'any_handOnChin', face: 'calm' },
  shinji: { cast: 'shinji', form: 'base', ang: -2.12, tier: 3, base: 'shinji_slouch', face: 'grin' },
  gowther: { cast: 'gowther', form: 'base', ang: 1.92, tier: 4, base: 'gow_stand', face: 'blank' },
};
const HY_STARCODE = { KYO: 'shunsui', DAZ: 'dazai', URA: 'urahara', GOJ: 'gojo', HAR: 'harry', KEN: 'kenpachi', AIZ: 'aizen', SHN: 'shinji', GOW: 'gowther' };
const HY_REACT = {   // generic reactions (any star) + character reactions from crowd.md; p = pose override, face, base = replace base pose, anim(t) extra
  hush: { p: {}, face: null }, smile: { p: {}, face: 'smile' }, shock: { p: { sp: -.1 }, face: 'shock' }, laugh: { p: { hp: -.25 }, face: 'laugh', bob: 4 },
  cheer: { p: { aL: [2.7, .5, 0], eL: .4, hL: 'fist', aR: [2.7, .5, 0], eR: .4, hR: 'fist' }, face: 'grin', bob: 7, talk: 1.5 },
  roar: { p: { aR: [2.8, .3, 0], eR: .8, hR: 'fist' }, face: 'shout', bob: 7, talk: 1.5 },
  gasp: { p: { sp: -.18, aL: [1.3, .2, 0], eL: 1.9, hL: 'open', aR: [1.3, .2, 0], eR: 1.9, hR: 'open' }, face: 'shock' },
  panic: { p: { sp: -.25, aL: [2.4, .6, 0], eL: .9, hL: 'open', aR: [2.2, .7, 0], eR: 1.0, hR: 'open' }, face: 'shock', bob: 9 },
  // kyoraku
  hatDown: { base: 'kyoraku_hat', face: 'smirk' }, hatUp: { base: 'kyoraku_hat', p: { hp: -.25 }, face: 'serious' }, toast: { p: { aR: [2.2, .2, 0], eR: 1.2, hR: 'grip' }, face: 'smile' },
  // dazai
  grin: { face: 'grin', clap: true },
  // urahara
  fanMouth: { base: 'urahara_fanFace', face: 'sly' },
  // gojo
  raiseHand: { p: { aR: [2.3, .6, 0], eR: .5, hR: 'open' }, face: 'smug' },
  // harry
  worried: { p: { aR: [1.1, -.35, 0], eR: 2.45, hR: 'open', hp: .1 }, face: 'worried' }, standShock: { base: 'stand', p: { aL: [.5, .6, 0], aR: [.5, .6, 0], eL: .3, eR: .3, hL: 'open', hR: 'open' }, face: 'shock' },
  clutch: { base: 'crouch', face: 'hurt' },
  // kenpachi / aizen / shinji
  excited: { p: { aR: [2.6, .4, 0], eR: .6, hR: 'fist' }, face: 'grin', talk: 1.6, bob: 5 }, calmSmile: { base: 'any_handOnChin', face: 'smile' },
  grimace: { face: 'angry', faceOver: { mouth: 'teeth', mouthOpen: .2, look: [.6, 0] }, p: { hy: .35 } },
};
HY.starPos = (key, o = {}) => { const S = HY_STARS[key], k = o.tier != null ? o.tier : S.tier, a = o.ang != null ? o.ang : S.ang, rr = HY.R + 1.5 + k * HVG_AR.tread + HVG_AR.tread * .45, y = HVG_AR.h0 + (k + 1) * HVG_AR.rise; return [Math.cos(a) * rr, y, Math.sin(a) * rr]; };
const HY_STARFIG = {};
function starFig(key, reaction = 'hush', o = {}) {
  const S = HY_STARS[key]; if (!S || !CAST[S.cast]) return null; const id = key + '|' + reaction + '|' + (o.form || S.form) + '|' + (o.tier != null ? o.tier : '') + (o.ang != null ? o.ang : '');
  if (HY_STARFIG[id]) return HY_STARFIG[id]; const pos = HY.starPos(key, o), yaw = lookAt(pos, [0, pos[1], 0]), R = HY_REACT[reaction] || HY_REACT.hush;
  const F = fig(S.cast, o.form || S.form, t => { const base = R.base && POSES[R.base] ? R.base : POSES[S.base] ? S.base : 'stand', bob = R.bob ? Math.abs(Math.sin(t * R.bob)) * .05 : 0;
    const face = faceAnim(Object.assign(expr(R.face || S.face), R.faceOver || {}), t, { talk: R.talk || 0, seed: key.length }), over = Object.assign({}, R.p || {});
    if (R.clap) { const c = Math.abs(Math.sin(t * 9)); Object.assign(over, { aL: [1.2, -.15 - .25 * c, 0], eL: 1.3, hL: 'flat', aR: [1.2, -.15 - .25 * c, 0], eR: 1.3, hR: 'flat' }); }
    return breathe(at(vAdd(pos, [0, bob, 0]), yaw, P(base, Object.assign(over, { face, ground: false }))), t); }, { timing: 2, springWin: .4 });
  F.starKey = key; F.starCup = S.cup;
  return (HY_STARFIG[id] = F);
}
function crowdStar(f, key, reaction = 'hush', o = {}) { const F = starFig(key, reaction, o); if (!F) return F; f.fig(F, Object.assign({ shadow: false }, o.figOpt || {}));
  if (F.starCup) f.fx(g => { const S = figSkel(F, onN(f.T - f.shot.t0, 2)); drawCup(g, vAdd(S.J.handR, [0, .05, 0]), { size: .07, fill: '#e8d8b0' }); }, { layer: 'over' }); return F; }
function starCam(key, t, o = {}) { const F = o.fig || starFig(key, o.reaction || 'hush', o); return closeCam(F, t, Object.assign({ part: 'face', az: .3, el: 0 }, o)); }
function starShot(f, key, reaction, lt, o = {}) {   // complete 1-2 s reaction shot
  const F = starFig(key, reaction, o); std(f, { pal: o.pal || 'arena_hy' }); f.style('hand2d'); f.light({ ambientK: .2, shadeK: .4, rimAmt: .9, rimCol: o.rimCol || '#ffb070' });
  f.cam(camHandheld(starCam(key, lt, Object.assign({ fig: F }, o.cam || {})), lt, .005, key.length)); f.bg(Object.assign({ set: 'hyarena', pal: o.pal || 'arena_hy', dmg: o.dmg || 0, react: reaction === 'hush' || reaction === 'smile' ? 'hush' : reaction === 'gasp' || reaction === 'shock' ? 'gasp' : 'cheer' }, o.bg || {}));
  crowdStar(f, key, reaction, o); if (o.neighbours !== false) f.fx(g => fxCrowdFG(g, lt, { n: 5, size: 380, rim: o.rimCol || '#ff9a50', react: reaction === 'cheer' || reaction === 'roar' ? 'roar' : 'hush' }), { layer: 'over' });
  return F;
}
// sit Yujiro (or anyone) on the ledge: HY.ledgeSit('yuj_eat', {face...}, 'yujiro') -> pose (pelvis just above the stone, knees over the front edge)
HY.ledgeSit = (poseName = 'yuj_sit', over = {}, cast = 'yujiro') => { const L = HY.LEDGE, B = CAST[cast]._body || makeBody(CAST[cast]), back = .38 * B.h / 1.92;
  return at([L.pos[0] - Math.sin(L.yaw) * back, L.top + .06 - B.pelvisH, L.pos[2] - Math.cos(L.yaw) * back], L.yaw, P(poseName, Object.assign({ ground: false }, over))); };
