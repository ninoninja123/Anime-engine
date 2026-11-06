/* engine/sets_s4.js (S4) - SPOILER WARNING: finale location (part 4).
   SETS.s4cliff  seaside cliff in front of the horizon; opt.dawn 0..1 drives the whole colour script:
                 0 = frozen crimson pre-dawn (red sun on the horizon line), .5 = first beams split the clouds, 1 = full gold morning.
                 opt.rays 0..1 god-ray strength, opt.pulse (red sun throb), opt.sunEl (override sun elevation), opt.ash (grey drift on the ground)
   s4DawnPal(d)  interpolated palette object (also usable with std via f.grade / f.light)                                         */
'use strict';
const S4_PAL_RED = { skyTop: '#140c2a', skyMid: '#6a1a3a', skyLow: '#e8402a', fog: '#a83a3a', sun: [0, .02, -1], ground: '#5a3434', ground2: '#2a1820', wall: '#c08888', wallShade: '#5a2a3a', roof: '#2a1a28', roofShade: '#1a0e18', wood: '#3a1a1a', cloud: '#e8604a', cloudShade: '#4a1a34', haze: .7, line: '#1a0a14', amb: '#e87a6a' };
const S4_PAL_MID = { skyTop: '#2a2a5e', skyMid: '#d06a5a', skyLow: '#ffc06a', fog: '#f0a070', sun: [0, .08, -1], ground: '#7a6450', ground2: '#423a30', wall: '#e0c0a0', wallShade: '#6a4a5a', roof: '#3a2c3a', roofShade: '#221a26', wood: '#4a2c24', cloud: '#ffc890', cloudShade: '#8a4a5e', haze: .6, line: '#2a1a1e', amb: '#ffc090' };
const S4_PAL_GOLD = { skyTop: '#4a7ac0', skyMid: '#f2c89a', skyLow: '#fff0c8', fog: '#ffe2b0', sun: [0, .2, -1], ground: '#9a9a62', ground2: '#5a6a42', wall: '#f0e0c8', wallShade: '#8a7a7a', roof: '#4a4048', roofShade: '#2a2430', wood: '#5a3c2c', cloud: '#fff4e0', cloudShade: '#c89a8a', haze: .5, line: '#2a2026', amb: '#fff0d0' };
function s4MixPal(a, b, t) { const o = {}; for (const k in a) { const va = a[k], vb = b[k]; if (typeof va === 'string' && va[0] === '#') o[k] = mixHex(va, vb, t); else if (typeof va === 'number') o[k] = lerp(va, vb, t); else if (Array.isArray(va)) o[k] = va.map((x, i) => lerp(x, vb[i], t)); else o[k] = t < .5 ? va : vb; } return o; }
function s4DawnPal(d) { d = clamp(d, 0, 1); return d < .5 ? s4MixPal(S4_PAL_RED, S4_PAL_MID, d * 2) : s4MixPal(S4_PAL_MID, S4_PAL_GOLD, (d - .5) * 2); }
function s4SunEl(d) { return lerp(-.006, .17, smooth(clamp(d, 0, 1))); }
function s4SunScreen(d, el) { const cam = CAM.cur; const p = project(vAdd(cam.pos, vMul(vNorm([0, el == null ? s4SunEl(d) : el, -1]), 4000))); return p; }
function s4GodRays(ctx, sx, sy, amt, t, col) { if (amt <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 22; i++) { const a = -Math.PI + (i + .5) / 22 * Math.PI + Math.sin(t * .3 + i) * .015, w = .018 + .05 * hash(i * 3); const L = 2600;
    const gr = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * L, sy + Math.sin(a) * L); gr.addColorStop(0, rgba(col, .55 * amt * (.4 + .6 * hash(i * 7)))); gr.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a - w) * L, sy + Math.sin(a - w) * L); ctx.lineTo(sx + Math.cos(a + w) * L, sy + Math.sin(a + w) * L); ctx.closePath(); ctx.fill(); }
  ctx.restore(); }
SETS.s4cliff = { pal: 'dawn', draw(ctx, t, o) {
  const d = o.dawn == null ? .5 : o.dawn, pal = (o.pal && o.pal.skyTop && o.palFixed) ? o.pal : s4DawnPal(d); o.pal = pal;
  if (!bgPass(o)) return;
  const el = o.sunEl == null ? s4SunEl(d) : o.sunEl, cam = CAM.cur;
  drawSky(ctx, pal, t, Object.assign({ clouds: 9, cloudSeed: 41, wind: 3 }, o));
  const sp = s4SunScreen(d, el), R = lerp(200, 130, d) * (cam.f / 1000);
  // sun: red throbbing disk (frozen) -> white-gold (risen), long horizontal cloud bars cut across it
  if (sp) { const pulse = o.pulse ? (.5 + .5 * Math.sin(t * 5.2)) * o.pulse : 0; const core = mixHex(mixHex('#ff3a22', '#ffd890', smooth(clamp(d * 1.6, 0, 1))), '#fffbea', smooth(clamp((d - .5) * 2, 0, 1)));
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, sp.x, sp.y, R * (5 + pulse * 2 + d * 3), mixHex('#ff3a1a', '#ffc070', d), .55 + .25 * pulse); glow(ctx, sp.x, sp.y, R * 2.2, core, .7); ctx.restore();
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(sp.x, sp.y, R * (1 + pulse * .04), 0, TAU); ctx.fill();
    s4GodRays(ctx, sp.x, sp.y, o.rays == null ? smooth(clamp((d - .25) * 2, 0, 1)) * .9 : o.rays, t, mixHex('#ff8a5a', '#fff0c0', d));
    // cloud bars over the disk
    ctx.save(); for (let i = 0; i < 3; i++) { const y = sp.y - R * (.55 - i * .45) + Math.sin(i * 3) * 6, w = R * (.9 + hash(i) * 1.1); ctx.fillStyle = rgba(mixHex(pal.cloudShade, pal.skyMid, .4), .78); ctx.beginPath(); ctx.ellipse(sp.x + (hash(i * 5) - .5) * R * 3 + t * 4, y, w, R * .07, 0, 0, TAU); ctx.fill(); ctx.fillStyle = rgba(core, .6); ctx.beginPath(); ctx.ellipse(sp.x + (hash(i * 5) - .5) * R * 3 + t * 4, y - R * .03, w * .9, R * .025, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
  // ocean below the cliff + glitter path toward the sun
  const sea = projPoly([[-4000, -40, -4000], [4000, -40, -4000], [4000, -40, -8], [-4000, -40, -8]]);
  if (sea.length > 2) { const [a, b] = horizonLine(); const my = (a[1] + b[1]) / 2; polyPath(ctx, sea); const g = ctx.createLinearGradient(0, my, 0, H); g.addColorStop(0, mixHex(pal.skyLow, pal.fog, .4)); g.addColorStop(.25, mixHex(pal.skyMid, '#4a5a8a', .4)); g.addColorStop(1, mixHex('#22305a', pal.skyTop, .35)); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'screen'; const sx = sp ? sp.x : W / 2;
    for (let i = 0; i < 140; i++) { const yy = my + Math.pow(hash(i), 2.2) * (H - my), k = (yy - my) / H, w = (12 + 70 * hash(i * 3)) * (1 + k * 5); ctx.fillStyle = rgba(mixHex('#ff7a4a', '#fff2c8', d), (.65 - k * .5) * (.4 + .6 * hash(i + Math.floor(t * 6)))); ctx.fillRect(sx - w / 2 + (hash(i * 5) - .5) * (60 + k * 900), yy, w, 2 + k * 3); }
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = rgba(mixHex(pal.skyTop, '#000000', .3), .35); ctx.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const yy = my + Math.pow(hash(i * 9), 1.6) * (H - my), x = hash(i * 13) * W; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 40, yy - 3, x + 90 + 200 * (yy - my) / H, yy); ctx.stroke(); }
    ctx.restore();
    // far sea stacks on the horizon (silhouettes with sun-side rim)
    for (const [x, z, h, w] of [[-260, -900, 60, 40], [-180, -1000, 90, 30], [340, -1200, 70, 60], [420, -1100, 40, 30]]) { const base = project([x, -40, z]), top = project([x, -40 + h, z]); if (!base || !top) continue; const ww = w * base.s; ctx.fillStyle = mixHex(pal.skyMid, '#140c1e', .65); ctx.beginPath(); ctx.moveTo(base.x - ww, base.y); ctx.lineTo(base.x - ww * .6, top.y + (base.y - top.y) * .2); ctx.lineTo(base.x - ww * .1, top.y); ctx.lineTo(base.x + ww * .5, top.y + (base.y - top.y) * .15); ctx.lineTo(base.x + ww, base.y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rgba(mixHex('#ff8a5a', '#fff0c8', d), .6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(base.x - ww * .1, top.y); ctx.lineTo(base.x + ww * .5, top.y + (base.y - top.y) * .15); ctx.stroke(); } }
  const edge = []; for (let i = -40; i <= 40; i++) edge.push([i * 2, 0, -8 + Math.sin(i * .9) * .6 + Math.sin(i * .31) * .8]);
  const face = edge.concat(edge.slice().reverse().map(p => [p[0], -40, p[2] - 4])); const fp = projPoly(face); if (fp.length > 2) { polyPath(ctx, fp); ctx.fillStyle = mixHex(pal.wallShade, '#1a1018', .55); ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = rgba(mixHex(pal.fog, '#ffffff', .2), .25); ctx.lineWidth = 2; for (let k = 1; k < 9; k++) { const pts = edge.map(p => [p[0], -k * 4.2 + Math.sin(p[0] * .2 + k) * .5, p[2] - k * .4]); for (const rn of projLine(pts)) { polyPath(ctx, rn, false); ctx.stroke(); } } ctx.restore();
    ctx.strokeStyle = rgba(mixHex('#ff9a5a', '#fff2c8', d), .8); ctx.lineWidth = 2.5; for (const rn of projLine(edge)) { polyPath(ctx, rn, false); ctx.stroke(); } }
  // cliff plateau (ends at z = -8) + rock face with strata
  const top = projPoly(edge.concat([[80, 0, 80], [-80, 0, 80]])); if (top.length > 2) { polyPath(ctx, top); const [a, b] = horizonLine(); const my = (a[1] + b[1]) / 2; const gg = ctx.createLinearGradient(0, my, 0, H); gg.addColorStop(0, mixHex(pal.ground, pal.fog, .45)); gg.addColorStop(.35, pal.ground); gg.addColorStop(1, pal.ground2); ctx.fillStyle = gg; ctx.fill();
    // long warm light streaks across the grass from the sun side
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'soft-light'; for (let i = 0; i < 12; i++) { const z0 = -6 + i * 3.2, q0 = project([-40, 0, z0]), q1 = project([40, 0, z0 + 1.2]); if (!q0 || !q1) continue; ctx.fillStyle = rgba(mixHex('#ff8a5a', '#fff2c0', d), .25 + .15 * hash(i)); ctx.fillRect(0, Math.min(q0.y, q1.y), W, Math.max(2, Math.abs(q1.y - q0.y))); } ctx.restore();
    if (o.ash) { ctx.save(); ctx.globalAlpha = .5 * o.ash; ctx.fillStyle = '#d8d0c8'; for (let i = 0; i < 160; i++) { const r = rng(900 + i), p = project([(r() - .5) * 20, .01, -7 + r() * 16]); if (!p) continue; ctx.fillRect(p.x, p.y, 2 + .03 * p.s, 1 + .01 * p.s); } ctx.restore(); } }
  drawGrass(ctx, pal, [cam.target[0], 0, Math.max(-5, cam.target[2])], 16, 700, mixHex(pal.ground, '#c8d07a', .25 + .3 * d), t, 9);
  for (let i = 0; i < 12; i++) { const r = rng(170 + i); drawRock(ctx, [(r() - .5) * 46, 0, -6 + r() * 26], .3 + r() * 1.3, pal, 170 + i, mixHex(pal.wallShade, '#6a6058', .5)); }
  // big rock outcrop (Shunsui is pinned against it) at x = 4.6, z = 5.2
  fxS4Boulder(ctx, [4.8, 0, 6.0], 1.5, t, { lit: mixHex(pal.wallShade, '#9a8a80', .6), shade: mixHex(pal.wallShade, '#2a2228', .5), rim: mixHex('#ff9a6a', '#fff0c8', d) });
} };
