/* engine/sets_nl.js (agent E, naruto-vs-luffy) - ONE ARENA for the whole film: the Valhalla colosseum (sets_hvg.js, via sets_hy.js 'hyarena' damage system)
   re-dressed for Naruto vs Luffy.
   SETS.nlarena  f.bg({ set: 'nlarena', pal, dmg, ... })   west = Konoha leaf (orange banners / gate), east = Straw Hat jolly roger (red banners / gate)
     palettes: arena_nl (night, torches) | arena_nl_dusk (sunset, orange-violet sky) | arena_nl_day (bright noon) | arena_nl_toon (Gear 5: pastel, saturated, sunny)
               | arena_nl_dark (torches out, cold) | arena_nl_red (blood-red sky)  (+ all arena_hy_* palettes work)
     options: everything of hyarena / valhalla (react cheer crowd eyes torch torchT torchSpan gateW gateE crater craterAt craterR rays statues dust spots fires
              breach collapse) +
       spiral 0..1 + spiralAt [x,0,z] + spiralR    Rasengan crater: spiral grooves cut into the floor (use with crater)
       cuts 0..1 + cutsAt + cutsR                  Rasenshuriken: thousands of fine wind cuts scored over the floor in a disc
       fists [[x,z,r],..]                          fist-shaped imprints punched into the floor / wall (Gear 3/4 hits)
       toon 0..1                                   Gear 5 cartoon dress: thick ink outlines on the floor rings + bouncy wobble of the stands (rubber world)
       leaves 0..1                                 drifting leaves in the air (Konoha)
   NL.STAR = 'shunsui' (the one wise crowd character: HY_STARS.shunsui, west stand row 2, sake cup).  NL.starShot(f, reaction, lt, o) = 1-2 s hand2d reaction.
   Ring radius 26 (fighters |x|,|z| < 18).                                                                                                                */
'use strict';
Object.assign(PALETTES, {
  arena_nl: { skyTop: '#04060e', skyMid: '#161a30', skyLow: '#7a4a3a', fog: '#2e2a34', sun: [-.35, .75, .5], ground: '#a68a66', ground2: '#5a4632', wall: '#625a5e', wallShade: '#1e1a22', roof: '#2a2228', roofShade: '#100c12', wood: '#3a281a', cloud: '#3a3448', cloudShade: '#141220', haze: .5, line: '#0a0808', amb: '#ffb880', stars: true, crowd: '#100e14', crowdRim: '#ff9a50', torch: '#ff9a3a' },
  arena_nl_dusk: { skyTop: '#1a1440', skyMid: '#7a3a6a', skyLow: '#ff9a4a', fog: '#8a5a5a', sun: [.6, .18, -.75], ground: '#b08a62', ground2: '#5e4430', wall: '#7a6060', wallShade: '#2a1c24', roof: '#3a2428', roofShade: '#160c10', wood: '#3a2618', cloud: '#e08a6a', cloudShade: '#5a2a4a', haze: .6, line: '#100808', amb: '#ffb070', crowd: '#1a1018', crowdRim: '#ffa060', torch: '#ffa040' },
  arena_nl_day: { skyTop: '#2a6ad8', skyMid: '#7ab8f0', skyLow: '#e8f0f4', fog: '#c8d4dc', sun: [-.4, .85, .4], ground: '#c8aa80', ground2: '#7a6448', wall: '#b0a498', wallShade: '#5a5058', roof: '#5a4a48', roofShade: '#2a2024', wood: '#5a3a24', cloud: '#ffffff', cloudShade: '#a8b4cc', haze: .45, line: '#14100e', amb: '#fff4e0', crowd: '#3a3038', crowdRim: '#fff0d0', torch: '#ffb060' },
  arena_nl_toon: { skyTop: '#3aa0ff', skyMid: '#9ad8ff', skyLow: '#fff6d8', fog: '#e8eef8', sun: [-.3, .9, .3], ground: '#f4d8a0', ground2: '#c89a68', wall: '#f0dcc8', wallShade: '#a888a8', roof: '#c86a8a', roofShade: '#6a3a6a', wood: '#a0603a', cloud: '#ffffff', cloudShade: '#c8c0f0', haze: .3, line: '#2a1a4a', amb: '#ffffff', crowd: '#5a3a8a', crowdRim: '#ffe080', torch: '#ffd040' },
  arena_nl_dark: { skyTop: '#020208', skyMid: '#080a18', skyLow: '#1a1a2a', fog: '#141420', sun: [-.3, .7, .5], ground: '#4a4448', ground2: '#1a181c', wall: '#2e2c34', wallShade: '#0a0a10', roof: '#141218', roofShade: '#060508', wood: '#1a1410', cloud: '#1a1a28', cloudShade: '#08080e', haze: .5, line: '#000000', amb: '#8a9ac8', stars: true, crowd: '#060608', crowdRim: '#6a7aa0', torch: '#ff7a2a' },
  arena_nl_red: { skyTop: '#0c0204', skyMid: '#3a0a10', skyLow: '#c03a20', fog: '#5a1a16', sun: [.3, .6, .6], ground: '#8a5a48', ground2: '#3a201a', wall: '#6a4440', wallShade: '#200c10', roof: '#2a1012', roofShade: '#0e0406', wood: '#2a140e', cloud: '#7a2a20', cloudShade: '#200808', haze: .6, line: '#060102', amb: '#ff7a5a', crowd: '#0e0406', crowdRim: '#ff5a3a', torch: '#ff6a2a' },
});
Object.assign(GRADES, {
  arena_nl: { sat: 1.08, contrast: 1.12, tint: ['#ffd8b0', .1], lift: ['#0a0a18', .06] }, arena_nl_dusk: { sat: 1.12, contrast: 1.08, soft: ['#ffb080', .16], lift: ['#2a0a2a', .06] },
  arena_nl_day: { sat: 1.08, contrast: 1.06, soft: ['#fff4e0', .1] }, arena_nl_toon: { sat: 1.3, contrast: 1.04, lift: ['#ffffff', .05], soft: ['#ffe8f8', .12] },
  arena_nl_dark: { sat: .85, contrast: 1.16, tint: ['#a8b0d8', .18], lift: ['#04040a', .05] }, arena_nl_red: { sat: 1.15, contrast: 1.18, tint: ['#ffa090', .2], lift: ['#1a0206', .06] },
});
(function () { const pp = { arena_nl: { bloom: .55 }, arena_nl_dusk: { bloom: .5 }, arena_nl_day: { bloom: .3 }, arena_nl_toon: { bloom: .25 }, arena_nl_dark: { bloom: .65 }, arena_nl_red: { bloom: .7 } };
  if (window.GOW_PALPOST) Object.assign(window.GOW_PALPOST, pp); if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, pp); })();
// emblems: west = Konoha leaf (orange on dark cloth), east = Straw Hat jolly roger (skull wearing the straw hat over crossbones)
function nlEmblem(ctx, qe, r, west, pm, pal) {
  if (west) { const col = hvFog('#ff8a1a', pm, pal); if (typeof nlLeaf === 'function') nlLeaf(ctx, qe.x, qe.y, r * .9, col, Math.max(1.2, r * .22)); return; }
  const ink = hvFog('#f4f0e6', pm, pal), x = qe.x, y = qe.y; ctx.save(); ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.2, r * .22);
  ctx.beginPath(); ctx.moveTo(x - r, y + r * .1); ctx.lineTo(x + r, y + r * .95); ctx.moveTo(x + r, y + r * .1); ctx.lineTo(x - r, y + r * .95); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x, y + r * .05, r * .55, 0, TAU); ctx.fill();
  ctx.fillStyle = hvFog('#f2cf6a', pm, pal); ctx.beginPath(); ctx.ellipse(x, y - r * .3, r * .95, r * .2, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y - r * .48, r * .5, r * .3, 0, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = hvFog('#d01e26', pm, pal); ctx.fillRect(x - r * .5, y - r * .42, r, r * .1);
  ctx.fillStyle = hvFog('#1a1418', pm, pal); for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sg * r * .2, y + r * .05, r * .13, 0, TAU); ctx.fill(); } ctx.restore();
}
NL.R = 26;
SETS.nlarena = { pal: 'arena_nl', draw(ctx, t, o) {
  const pal = o.pal, toon = o.toon || o.rubber || 0;
  const o2 = Object.assign({ emblem: nlEmblem, gateCols: ['#ff8a1a', '#ff3a2a'], gateFlame: pal.torch || '#ffa040', eyes: false, react: 'cheer', cheer: .7, ledge: false, spots: .45, crowd: .45 }, o);
  if (o.rubber != null && o.toon == null) o2.toon = o.rubber;
  SETS.hyarena.draw(ctx, t, o2); if (o.layer === 'fg') return;
  // Gear 5 'sunny': the sky brightens to pale blue and sunlight washes in (o.sunny 0..1)
  const sun = o.sunny || 0; if (sun > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const gr = ctx.createLinearGradient(0, 0, 0, H * .6); gr.addColorStop(0, rgba('#9fdcff', .55 * sun)); gr.addColorStop(1, rgba('#fff4d0', .15 * sun)); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * .6); glow(ctx, W * .78, H * .08, 520, '#fff8d0', .5 * sun); ctx.restore(); }
  // Rasengan spiral grooves
  const sk = o.spiral || 0; if (sk > 0) { const c = o.spiralAt || o.craterAt || [0, 0, 0], R = o.spiralR || (o.craterR || 4.5) * 1.15; ctx.save(); ctx.lineCap = 'round';
    for (let arm = 0; arm < 5; arm++) { const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30, an = arm / 5 * TAU + u * 3.6, rr = R * (.12 + .88 * u); const q = project([c[0] + Math.cos(an) * rr, .02, c[2] + Math.sin(an) * rr]); if (q) pts.push([q.x, q.y]); }
      if (pts.length > 2) { ctx.globalAlpha = sk; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.strokeStyle = rgba(shadeHex(pal.ground2, -.45), .9); ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = rgba(mixHex(pal.ground, '#ffffff', .3), .5); ctx.lineWidth = 2; ctx.stroke(); } }
    ctx.restore(); }
  // Rasenshuriken wind cuts
  const ck = o.cuts || 0; if (ck > 0) { const c = o.cutsAt || [0, 0, 0], R = o.cutsR || 7; ctx.save(); ctx.globalAlpha = ck; ctx.strokeStyle = rgba(shadeHex(pal.ground2, -.5), .75); ctx.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const an = hash(i * 3.1) * TAU, rr = R * Math.sqrt(hash(i * 7.7)), L = .25 + .5 * hash(i * 1.3), a2 = an + 1.2 + hash(i) * .8; const p0 = [c[0] + Math.cos(an) * rr, .02, c[2] + Math.sin(an) * rr], p1 = vAdd(p0, [Math.cos(a2) * L, 0, Math.sin(a2) * L]); const qa = project(p0), qb = project(p1); if (!qa || !qb) continue; ctx.lineWidth = Math.max(.8, .03 * qa.s); ctx.beginPath(); ctx.moveTo(qa.x, qa.y); ctx.lineTo(qb.x, qb.y); ctx.stroke(); }
    ctx.restore(); }
  // fist imprints (round dents with four knuckle bumps)
  for (const fz of (o.fists || [])) { const [x, z, r] = fz, ring = []; for (let i = 0; i < 20; i++) { const an = i / 20 * TAU; ring.push([x + Math.cos(an) * r, .01, z + Math.sin(an) * r * .8]); } const sp = projPoly(ring); if (sp.length < 3) continue;
    polyPath(ctx, sp); ctx.fillStyle = rgba(shadeHex(pal.ground2, -.35), .85); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = pal.line; ctx.stroke();
    for (let k = 0; k < 4; k++) { const q = project([x - r * .35, .01, z + (k - 1.5) * r * .38]); if (q) { ctx.fillStyle = rgba(shadeHex(pal.ground2, -.6), .8); ctx.beginPath(); ctx.ellipse(q.x, q.y, r * .2 * q.s, r * .12 * q.s, 0, 0, TAU); ctx.fill(); } } }
  // Gear 5 toon dress: bold ink rings on the floor + bouncy concentric outlines (o.rubber = alias)
  if ((toon || o.rubber || 0) > 0) { ctx.save(); ctx.globalAlpha = toon; ctx.lineJoin = 'round'; for (let i = 1; i <= 4; i++) { const R = i * 5.6 + Math.sin(t * 5 + i) * .25 * toon, pts = []; for (let j = 0; j <= 48; j++) { const an = j / 48 * TAU; const q = project([Math.cos(an) * R, .02 + .12 * toon * Math.sin(an * 3 + t * 6 + i), Math.sin(an) * R]); if (q) pts.push([q.x, q.y]); }
      if (pts.length > 2) { ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.strokeStyle = rgba(pal.line, .55); ctx.lineWidth = 5; ctx.stroke(); } } ctx.restore(); }
  // drifting leaves
  const lk = o.leaves || 0; if (lk > 0) { for (let i = 0; i < 40 * lk; i++) { const life = (t * .12 + hash(i * 3.7)) % 1, p = [(hash(i * 5) - .5) * 40 + life * 8, 12 - life * 12 + Math.sin(t + i) * .5, (hash(i * 9) - .5) * 40], q = project(p); if (!q || q.z < 1) continue; const s = .12 * q.s;
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(t * 2 + i); ctx.fillStyle = i % 3 ? '#4a8a2a' : '#8ab83a'; ctx.beginPath(); ctx.ellipse(0, 0, s, s * .45, 0, 0, TAU); ctx.fill(); ctx.restore(); } }
} };
NL.STAR = 'shunsui';
NL.starShot = (f, reaction, lt, o = {}) => starShot(f, o.key || NL.STAR, reaction, lt, Object.assign({ pal: o.pal || 'arena_nl' }, o, { bg: Object.assign({ set: 'nlarena', pal: o.pal || 'arena_nl', dmg: o.dmg || 0 }, o.bg || {}) }));
// fighter-card background (f.bg({set:'nlcard', who:'naruto'|'luffy'|'nika'})): naruto = deep orange + black swirl + leaves, luffy = crimson + straw-gold rays, nika = pastel sky + clouds
SETS.nlcard = { pal: 'arena_nl', draw(ctx, t, o) {
  if (o.layer === 'fg') return; const who = o.who || 'naruto', C = { naruto: ['#2a0e02', '#7a2a06', '#ff8a1a'], luffy: ['#1a0204', '#7a0a10', '#ffd23a'], nika: ['#7ac8ff', '#fff4d8', '#ff7ab8'] }[who] || ['#111', '#333', '#fff'];
  const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, C[1]); gr.addColorStop(1, C[0]); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.save(); const cx = W * .7, cy = H * .48;
  if (who === 'naruto') { ctx.globalAlpha = .18; ctx.strokeStyle = C[2]; ctx.lineCap = 'round'; ctx.lineWidth = 40; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU * 3 + t * 1.5, r = 20 + i * 5.5; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.stroke();
    ctx.globalAlpha = .7; for (let i = 0; i < 26; i++) { const ph = (t * .2 + hash(i * 3)) % 1, x = hash(i * 7) * W + ph * 200, y = ph * H; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.fillStyle = i % 2 ? '#5aa03a' : '#8ac04a'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); ctx.fill(); ctx.restore(); } }
  else if (who === 'luffy') { ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t * .15; ctx.fillStyle = rgba(C[2], i % 2 ? .1 : .04); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 2400, cy + Math.sin(a) * 2400); ctx.lineTo(cx + Math.cos(a + .13) * 2400, cy + Math.sin(a + .13) * 2400); ctx.fill(); } glow(ctx, cx, cy, 600, C[2], .25); }
  else { for (let i = 0; i < 16; i++) { const x = hash(i * 3) * W + Math.sin(t + i) * 30, y = hash(i * 7) * H, r = 60 + 80 * hash(i); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.strokeStyle = '#7a6aa8'; ctx.lineWidth = 5; for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(x + (j - 1.5) * r * .6, y + (j % 2) * r * .2, r * (.6 + .2 * (j % 2)), 0, TAU); ctx.stroke(); ctx.fill(); } } }
  ctx.restore();
} };
// SEAL: Naruto's inner seal room - flooded dark corridor floor (ankle-deep water, ripples, reflections), colossal cage gate (bars + torii beam) with the 封 seal tag,
// pipes on the walls, warm orange glow from behind the bars.  f.bg({set:'nlseal', pal:'nl_seal', open 0..1 (gate bars part), glow 0..1, gateZ (default -14), ripples [[x,z,t0],..]})
PALETTES.nl_seal = { skyTop: '#05060a', skyMid: '#0c1018', skyLow: '#1a1a20', fog: '#141a1e', sun: [-.2, .8, .4], ground: '#1a2a30', ground2: '#0a1216', wall: '#2a2e2a', wallShade: '#0e100e', roof: '#141614', roofShade: '#060706', wood: '#2a2018', cloud: '#141414', cloudShade: '#060606', haze: .6, line: '#000000', amb: '#ffb060' };
GRADES.nl_seal = { sat: .9, contrast: 1.15, tint: ['#c8d8d0', .12], lift: ['#04080a', .06] };
SETS.nlseal = { pal: 'nl_seal', draw(ctx, t, o) {
  if (o.layer === 'fg' && !o.bars) return; if (o.bars) return nlSealBars(ctx, t, o); const pal = o.pal, gz = o.gateZ == null ? -14 : o.gateZ, open = o.open || 0, gk = o.glow == null ? 1 : o.glow;
  ctx.fillStyle = pal.skyTop; ctx.fillRect(0, 0, W, H);
  const P = (x, y, z) => project([x, y, z]);
  // walls + pipes (both sides), ceiling darkness
  for (const sx of [-1, 1]) { const wall = [[sx * 9, 0, 12], [sx * 9, 0, gz - 2], [sx * 9, 26, gz - 2], [sx * 9, 26, 12]]; const sp = projPoly(wall); if (sp.length > 2) { polyPath(ctx, sp); ctx.fillStyle = fogMix(pal.wall, camDepth([sx * 9, 5, gz / 2]), pal, .5); ctx.fill(); }
    for (let k = 0; k < 4; k++) { const y = 2 + k * 2.6, pts = projLine([[sx * 8.6, y, 12], [sx * 8.6, y, gz - 2]]); ctx.strokeStyle = rgba('#3a3e36', .9); ctx.lineWidth = 6 + k; for (const rn of pts) { polyPath(ctx, rn, false); ctx.stroke(); } ctx.strokeStyle = rgba('#5a5e52', .4); ctx.lineWidth = 2; for (const rn of pts) { polyPath(ctx, rn, false); ctx.stroke(); } } }
  // glow behind the bars
  const gq = P(0, 7, gz - 1.5); if (gq) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, gq.x, gq.y, 26 * gq.s, '#ff8a20', .5 * gk); glow(ctx, gq.x, gq.y + 3 * gq.s, 10 * gq.s, '#ffd080', .35 * gk); ctx.restore(); }
  // the gate: top beam (torii-like), bars, seal tag
  const beam = projPoly([[-9, 15, gz], [9, 15, gz], [9, 16.6, gz], [-9, 16.6, gz]]); if (beam.length > 2) { polyPath(ctx, beam); ctx.fillStyle = '#2a2420'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke(); }
  for (let i = -8; i <= 8; i++) { const x = i * 1.05 + Math.sign(i) * open * 4 * (Math.abs(i) / 8 + .3), bar = projPoly([[x - .16, 0, gz], [x + .16, 0, gz], [x + .16, 15, gz], [x - .16, 15, gz]]); if (bar.length < 3) continue; polyPath(ctx, bar); ctx.fillStyle = '#1a1612'; ctx.fill(); ctx.strokeStyle = rgba('#ff9a40', .25 * gk); ctx.lineWidth = 2; ctx.stroke(); }
  const tag = projPoly([[-.55, 8.2, gz + .05], [.55, 8.2, gz + .05], [.55, 12.4, gz + .05], [-.55, 12.4, gz + .05]]); if (tag.length > 2 && open < .3) { polyPath(ctx, tag); ctx.fillStyle = '#efe6cc'; ctx.fill(); ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.stroke();
    const tq = P(0, 10.3, gz + .06); if (tq) { ctx.save(); ctx.font = `${Math.max(10, 1.0 * tq.s)}px "Yuji Boku", "IPAGothic", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a0a06'; ctx.fillText('封', tq.x, tq.y); ctx.restore(); } }
  // water floor: dark, reflective strips + ripples
  const fl = projPoly([[-9, 0, 12], [9, 0, 12], [9, 0, gz], [-9, 0, gz]]); if (fl.length > 2) { polyPath(ctx, fl); const q0 = P(0, 0, 8), q1 = P(0, 0, gz); const gr = ctx.createLinearGradient(0, q0 ? q0.y : H, 0, q1 ? q1.y : 0); gr.addColorStop(0, '#0e1a1e'); gr.addColorStop(1, '#1e2a2a'); ctx.fillStyle = gr; ctx.fill(); }
  if (gq) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const rq = P(0, 0, gz + 3); if (rq) { ctx.fillStyle = rgba('#ff8a30', .18 * gk); ctx.beginPath(); ctx.ellipse(rq.x, rq.y + 2 * rq.s, 6 * rq.s, 1.2 * rq.s, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
  for (let i = 0; i < 18; i++) { const z = 10 - i * ((10 - gz) / 18), y = 0, a = P(-8.5, y, z), b = P(8.5, y, z); if (!a || !b) continue; ctx.strokeStyle = rgba('#8aa8a8', .08 + .05 * Math.sin(t * 2 + i)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x, a.y + Math.sin(t * 3 + i) * 2); ctx.lineTo(b.x, b.y + Math.sin(t * 3 + i + 1) * 2); ctx.stroke(); }
  for (const [x, z, t0] of (o.ripples || [])) { const tt = t - t0; if (tt < 0 || tt > 2) continue; for (let k = 0; k < 3; k++) { const r = (tt - k * .25) * 2.2; if (r <= 0) continue; const ring = []; for (let j = 0; j <= 32; j++) { const an = j / 32 * TAU; ring.push([x + Math.cos(an) * r, .01, z + Math.sin(an) * r]); } ctx.strokeStyle = rgba('#c8e0e0', .5 * (1 - tt / 2)); ctx.lineWidth = 2; for (const rn of projLine(ring)) { polyPath(ctx, rn, false); ctx.stroke(); } } }
} };
// foreground bars only (Kurama drawn between bg and bars): f.fg({set:'nlseal', bars:true, open, gateZ})
function nlSealBars(ctx, t, o) { const gz = o.gateZ == null ? -14 : o.gateZ, open = o.open || 0;
  for (let i = -8; i <= 8; i++) { const x = i * 1.05 + Math.sign(i) * open * 4 * (Math.abs(i) / 8 + .3), bar = projPoly([[x - .16, 0, gz + .3], [x + .16, 0, gz + .3], [x + .16, 15, gz + .3], [x - .16, 15, gz + .3]]); if (bar.length < 3) continue; polyPath(ctx, bar); ctx.fillStyle = '#1a1612'; ctx.fill(); ctx.strokeStyle = 'rgba(255,154,64,.3)'; ctx.lineWidth = 2; ctx.stroke(); }
  const tag = projPoly([[-.55, 8.2, gz + .35], [.55, 8.2, gz + .35], [.55, 12.4, gz + .35], [-.55, 12.4, gz + .35]]); if (tag.length > 2 && open < .3) { polyPath(ctx, tag); ctx.fillStyle = '#efe6cc'; ctx.fill(); ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.stroke(); const tq = project([0, 10.3, gz + .36]); if (tq) { ctx.save(); ctx.font = `${Math.max(10, 1.0 * tq.s)}px "Yuji Boku", "IPAGothic", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a0a06'; ctx.fillText('封', tq.x, tq.y); ctx.restore(); } } }
// crowd.md: Shunsui (west stand, 3rd row, stone bench + sake bottle) and his reactions
if (typeof HY_STARS !== 'undefined') { Object.assign(HY_STARS.shunsui, { tier: 2, ang: 2.86 });
  Object.assign(HY_REACT, { narrow: { base: 'kyoraku_lean', p: { hp: .05 }, face: 'focusedCalm', faceOver: { eye: .35, lid: .45 } }, cupDown: { base: 'kyoraku_lean', p: { aR: [.6, .3, 0], eR: .6, hR: 'grip', hp: .1 }, face: 'serious' },
    eyesWide: { base: 'kyoraku_lean', face: 'serious', faceOver: { eye: 1.25, pupil: .6 } }, stand: { base: 'stand', face: 'serious' } });
  HY_REACT.toast = { base: 'kyoraku_lean', p: { aR: [2.0, .3, 0], eR: 1.3, hR: 'grip' }, face: 'smile' };
  HY_REACT.laugh = { base: 'kyoraku_lean', p: { hp: -.15 }, face: 'laugh', faceOver: { eye: .3 }, bob: 5 }; }
// sake bottle (tokkuri) on the bench beside Shunsui
function nlTokkuri(g, p, s = .3) { const q = project(p); if (!q) return; const h = s * q.s, w = h * .42; g.save(); g.translate(q.x, q.y); g.fillStyle = '#efe8d8'; g.strokeStyle = '#1a1418'; g.lineWidth = Math.max(1, h * .05);
  g.beginPath(); g.moveTo(-w * .25, -h); g.lineTo(w * .25, -h); g.lineTo(w * .2, -h * .72); g.quadraticCurveTo(w * 1.1, -h * .45, w * .7, 0); g.lineTo(-w * .7, 0); g.quadraticCurveTo(-w * 1.1, -h * .45, -w * .2, -h * .72); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#3a5a8a'; g.fillRect(-w * .45, -h * .45, w * .9, h * .12); g.restore(); }
if (typeof crowdStar === 'function') { const cs0 = crowdStar; crowdStar = function (f, key, reaction, o = {}) { const F = cs0(f, key, reaction, o); if (F && key === 'shunsui' && o.bottle !== false) { const p = HY.starPos('shunsui', o), side = [-Math.sin(Math.atan2(p[2], p[0])), 0, Math.cos(Math.atan2(p[2], p[0]))];
  f.prop(vAdd(p, vMul(side, .55)), g => nlTokkuri(g, vAdd(vAdd(p, vMul(side, .55)), [0, .02, 0]), .28)); } return F; }; }
