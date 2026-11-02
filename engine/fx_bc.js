/* death-battle engine - fx_bc.js (agent E2) : shared E2 FLAME CORE + BLACK CLOVER effects (Mereoleona, Nozel).
   Loads before fx_fire.js (alphabetical); fx_fire.js uses the flame core defined here (at draw time).
   All effects: deterministic in local time t (negative/over-duration = nothing), positions world [x,y,z] or screen {x,y}.

   FLAME CORE   fxE2Flames(g, emitters, t, o)         merged three-tone anime flame tongues (one ink silhouette)
                fxE2FlameRibbon(g, pts, t, o)          flames along a 3D polyline (arms, trails, waves)
                fxE2Embers(g, c, t, o)                 rising sparks / embers
                E2_FLAME palettes: beni (white-gold/vermilion), joker (ash-violet/ember), mereo (crimson-magenta),
                purgatory (violet-blue, Calidus Brachium Purgatory), mercury (chrome), rengokuRef (only for comparison)
   MEREOLEONA   fxCalidusFist(g, F, t, o)  flaming forearm + lion PAW of flame at the fist (Calidus Brachium); o.lion -> lion head
                fxLionPaw2D(g, c, dir, R, t, o) paw alone (barrages: call many);  fxLionPack(g, a, b, t, o) Exercitus Leonum
                fxCrimsonLion(g, t, o)     giant flame lion head charging (INTERPRETATION, see chars_bc.js header)
                fxHellfire(g, F, t, o)     Hellfire Incarnate body flames + flame mane;  bcHellfireParts = form part
                fxPurgatoryBarrage(g, c, t, o)  fists of (blue-violet) flame converging from all directions
                fxManaZone(g, c, t, o)     swirling mana streams in a dome (o.col)
   NOZEL        fxSilverRain(g, t, o)      mercury needles raining on an area, splashes
                fxSilverSpear(g, a, b, t, o)   mercury spear forming at a and shooting to b
                fxRegalSpear(g, a, dir, t, o)  Silver Shining Regal Spear: beam from the palm, sweeps with dir(t)
                fxSilverEagle(g, t, o)     giant mercury eagle (2D drawn on a 3D anchor), wings flapping
                fxSilverStar(g, c, t, o)   Silver Star of Execution: cage of bars + star ring + spears launching inward
                fxMercuryBlobs(g, c, t, o) orbiting mercury droplets (casting idle)
   IMPACT_SEQ   mereo_calidus, mereo_lion, mereo_hellfire, mereo_purgatory, nozel_eagle, nozel_rain, nozel_regal, nozel_star */
'use strict';
const E2_FLAME = {
  beni: { ink: '#6a0810', outer: '#ff3a1c', mid: '#ffb02e', core: '#fff8dc', glow: '#ff6a2a', spark: '#fff2a0' },
  joker: { ink: '#1a0822', outer: '#7a2aa8', mid: '#ff7a3a', core: '#ffe4c8', glow: '#b04aff', spark: '#ffb27a' },
  mereo: { ink: '#4a0428', outer: '#d0145a', mid: '#ff4a78', core: '#ffe2ee', glow: '#ff2a6a', spark: '#ffc0d8' },
  purgatory: { ink: '#0e0838', outer: '#3a3cff', mid: '#9a7aff', core: '#eeeaff', glow: '#5a5aff', spark: '#d8d0ff' },
  rengokuRef: { ink: '#5a2400', outer: '#ff7a10', mid: '#ffc040', core: '#fff4c0', glow: '#ff9a20', spark: '#ffe080' },
};
Object.assign(EXPL_COLS, { beni: ['#ffffff', '#fff6d0', '#ffb02e', '#e0301a', '#3a1418'], joker: ['#ffffff', '#ffe0c8', '#c060ff', '#3a1a4a', '#120814'], mereo: ['#ffffff', '#ffe2ee', '#ff4a78', '#a0104a', '#2a0818'], purgatory: ['#ffffff', '#eeeaff', '#8a7aff', '#2a2a9a', '#0a0a2a'], mercury: ['#ffffff', '#f4f8ff', '#b8c4d8', '#6a7488', '#2a3040'] });
const e2Pal = p => typeof p === 'object' ? p : (E2_FLAME[p] || E2_FLAME.beni);
// one flame tongue path in screen space: base (x,y), width w, height h, direction angle a (screen, -PI/2 = up)
function e2TonguePts(x, y, w, h, a, seed, ph, k = 1, shift = 0) {
  const ca = Math.cos(a), sa = Math.sin(a), L = [], R = [], n = 9;
  for (let i = 0; i <= n; i++) { const s = i / n, wp = w * .5 * k * Math.sin(Math.PI * Math.pow(1 - s, 1.55)) + (i === n ? 0 : .0001);
    const sway = w * .55 * Math.sin(s * 2.6 + ph + seed * 5) * Math.pow(s, 1.25) + w * .25 * Math.sin(s * 6 + ph * 1.7 + seed) * s * s;
    const along = h * (s * k + (1 - k) * .12 + shift * (1 - s)), cx = x + ca * along - sa * sway, cy = y + sa * along + ca * sway;
    L.push([cx - sa * wp, cy + ca * wp]); R.push([cx + sa * wp, cy - ca * wp]); }
  return catmull(L.concat(R.slice(0, -1).reverse()), true, 2);
}
/* emitters: [{p, r, ang?, h?}] - r = size (m for world points, px for screen); o: {pal, n tongues/emitter, hold (frames),
   seed, alpha, ang (default -PI/2), spread, inkK, layers:false (flat), gustAng}                                   */
function fxE2Flames(g, emitters, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const pal = e2Pal(o.pal), hold = o.hold || 2, tf = onN(t, hold), fr = Math.floor(tf * FPS / hold), seed = o.seed || 7, n = o.n || 3;
  const T = []; let maxW = 0;
  emitters.forEach((e, i) => { const q = P2(e.p); if (!q) return; const sz = (e.r || .5) * (Array.isArray(e.p) ? q.s : 1); if (sz < 1.5) return;
    for (let j = 0; j < n; j++) { const sd = seed + i * 13 + j * 7, life = (tf * (1.6 + hash(sd) * .9) + hash(sd * 3)) % 1, grow = Math.sin(Math.PI * Math.min(1, life * 1.15));
      const w = sz * (.55 + .35 * hash(sd + 1)) * (o.wK || 1), h = sz * (1.4 + 1.2 * hash(sd + 2)) * (.45 + .75 * grow) * (e.h || 1) * (o.hK || 1);
      const ang = (e.ang != null ? e.ang : (o.ang != null ? o.ang : -HP)) + (hash(sd + 5) - .5) * (o.spread == null ? .7 : o.spread) + Math.sin(tf * 3 + sd) * .12;
      const ox = (hash(sd + 9) - .5) * sz * .9, oy = (hash(sd + 11) - .5) * sz * .3; T.push({ x: q.x + ox, y: q.y + oy, w, h, a: ang, sd, ph: fr * .9 + j }); maxW = Math.max(maxW, w); } });
  if (!T.length) return; g.save(); g.globalAlpha = o.alpha == null ? 1 : o.alpha; const lw = clamp(maxW * .06 * (o.inkK || 1), 1.2, 5);
  const layer = (k, sh) => { g.beginPath(); for (const q of T) { const pts = e2TonguePts(q.x, q.y, q.w, q.h, q.a, q.sd, q.ph, k, sh); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); g.closePath(); } };
  if (o.ink !== false) { layer(1, 0); g.lineWidth = lw * 2; g.lineJoin = 'round'; g.strokeStyle = pal.ink; g.stroke(); }
  layer(1, 0); g.fillStyle = pal.outer; g.fill();
  if (o.layers !== false) { layer(.68, -.02); g.fillStyle = pal.mid; g.fill(); layer(.36, -.05); g.fillStyle = pal.core; g.fill(); }
  g.restore();
}
// flames along a world polyline: pts [[x,y,z]...], o.r (m, or fn(u)), o.step (emitters), o.ang (screen) or 'normal'
function fxE2FlameRibbon(g, pts, t, o = {}) {
  if (pts.length < 2) return; const n = o.count || 10, E = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1), f = u * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(f)), p = vLerp(pts[k], pts[k + 1], f - k); const r = typeof o.r === 'function' ? o.r(u) : (o.r || .4);
    let ang = o.ang; if (ang === 'back') { const a = proj2(pts[Math.min(pts.length - 1, k + 1)]), b = proj2(pts[k]); ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } E.push({ p, r, ang }); }
  fxE2Flames(g, E, t, Object.assign({ n: 2 }, o));
}
function fxE2Embers(g, c, t, o = {}) {
  const q0 = P2(c); if (!q0 || t < 0) return; const pal = e2Pal(o.pal), n = o.n || 40, seed = o.seed || 33, R = o.r || 2, dur = o.dur || 99;
  if (t > dur) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const life = (t * (.35 + hash(seed + i) * .4) + hash(seed + i * 3)) % 1, a = hash(seed + i * 7) * TAU, rr = R * Math.sqrt(hash(seed + i * 5));
    const p = Array.isArray(c) ? [c[0] + Math.cos(a) * rr + Math.sin(t * 2 + i) * .2, c[1] + life * (o.h || 3), c[2] + Math.sin(a) * rr] : null; const q = p ? project(p) : { x: q0.x + Math.cos(a) * rr * 100, y: q0.y - life * 300, s: 100 }; if (!q) continue;
    const sz = Math.max(1.2, (o.size || .03) * q.s) * (1 - life); g.fillStyle = rgba(life < .3 ? pal.core : pal.spark, .9 * (1 - life)); g.fillRect(q.x - sz / 2, q.y - sz, sz, sz * 2.2); }
  g.restore();
}
function e2GlowAt(g, p, r, col, a) { const q = P2(p); if (!q) return; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, r * (Array.isArray(p) ? q.s : 1), col, a); g.restore(); }

// =============================================================================================== MEREOLEONA
// Calidus Brachium: flame sleeve along the forearm + big flame fist ahead of the knuckles. o: {side, size, pal, lion, amt}
function fxCalidusFist(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sd = o.side || 'R', k = S.B.h / 1.8, amt = o.amt == null ? 1 : o.amt; if (amt <= 0) return;
  const el = S.J['el' + sd], wr = S.J['wr' + sd], hand = S.J['hand' + sd], dir = vNorm(vSub(hand, el)), sz = (o.size || 1) * amt;
  const fist = vMad(hand, dir, .2 * k * sz);
  fxE2FlameRibbon(g, [vLerp(el, wr, -.2), wr, hand], t, { pal: o.pal || 'mereo', r: u => (.1 + .1 * u) * k * sz, count: 7, n: 2, ang: 'back', spread: .9, seed: 41 });
  if (o.lion) { fxLionHead2D(g, fist, dir, .35 * k * sz, t, { pal: o.pal || 'mereo', roar: o.roar == null ? .8 : o.roar, seed: 9 }); return; }
  fxLionPaw2D(g, fist, dir, .32 * k * sz, t, { pal: o.pal || 'mereo', seed: 51 });
}
// lion PAW of flame (Calidus Brachium is a fiery lion paw): pads + claws, oriented along the screen direction of dir
function fxLionPaw2D(g, c, dir, R0, t, o = {}) {
  const q = P2(c); if (!q) return; const pal = e2Pal(o.pal || 'mereo'), R = R0 * (Array.isArray(c) ? q.s : 1); if (R < 3) return;
  const d2 = dir ? P2(vMad(c, dir, .3)) : null; const ang = d2 ? Math.atan2(d2.y - q.y, d2.x - q.x) : -HP;
  e2GlowAt(g, c, R0 * 2.2, pal.glow, .5);
  const E = []; for (let i = 0; i < 12; i++) { const a = ang + Math.PI + (i / 11 - .5) * 2.6; E.push({ p: { x: q.x + Math.cos(a) * R * .55, y: q.y + Math.sin(a) * R * .55 }, r: R * .32, ang: a }); }
  fxE2Flames(g, E, t, { pal, n: 2, spread: .4, seed: (o.seed || 1) + 3 });
  g.save(); g.translate(q.x, q.y); g.rotate(ang + HP); const lw = clamp(R * .04, 1.5, 6); // local: fingers toward -y
  const blob = (x, y, rx, ry, col, ink = true) => { g.beginPath(); g.ellipse(x * R, y * R, rx * R, ry * R, 0, 0, TAU); g.fillStyle = col; g.fill(); if (ink) { g.lineWidth = lw; g.strokeStyle = pal.ink; g.stroke(); } };
  blob(0, .05, .62, .55, pal.outer); // paw mass
  for (const [x, y] of [[-.42, -.35], [-.15, -.55], [.15, -.55], [.42, -.35]]) { blob(x, y, .2, .22, pal.outer); g.beginPath(); g.moveTo((x - .07) * R, (y - .15) * R); g.quadraticCurveTo(x * R, (y - .42) * R, (x + .1) * R, (y - .5) * R); g.quadraticCurveTo((x + .04) * R, (y - .3) * R, (x + .08) * R, (y - .14) * R); g.closePath(); g.fillStyle = '#fff6fa'; g.fill(); g.lineWidth = lw * .7; g.strokeStyle = pal.ink; g.stroke(); }
  blob(0, .12, .36, .3, pal.mid, false); blob(0, .12, .2, .16, pal.core, false);
  for (const [x, y] of [[-.4, -.36], [-.14, -.55], [.14, -.55], [.4, -.36]]) blob(x, y, .1, .11, pal.core, false);
  g.restore();
}
// Exercitus Leonum: a pack of running fire lions along the ground from a toward b
function fxLionPack(g, a, b, t, o = {}) {
  const dur = o.dur || 1.6; if (t < 0 || t > dur) return; const n = o.n || 5, d = vNorm(vSub(b, a)), side = vNorm(vCross(d, [0, 1, 0]));
  const items = []; for (let i = 0; i < n; i++) { const u = clamp((t - i * .08) / dur, 0, 1); if (u <= 0) continue; const p = vAdd(vMad(vLerp(a, b, easeOut(u)), side, (i - (n - 1) / 2) * (o.gap || 1.6)), [0, (o.size || 1) * .9 + Math.abs(Math.sin(t * 9 + i)) * .3, 0]); items.push({ p, i, z: camDepth(p) }); }
  items.sort((x, y) => y.z - x.z);
  for (const it of items) { const sz = o.size || 1; const tail = []; for (let k = 0; k <= 5; k++) tail.push(vAdd(vMad(it.p, d, -k * .5 * sz), [0, -k * .12 * sz, 0])); fxE2FlameRibbon(g, tail, t, { pal: o.pal || 'mereo', r: u => sz * (.5 - .3 * u), count: 6, n: 2, ang: 'back', seed: 300 + it.i }); fxLionHead2D(g, it.p, d, sz * .7, t, { pal: o.pal || 'mereo', roar: .6, seed: 20 + it.i }); }
}
// lion head of flame in screen space around a world anchor; faces the camera, rotated toward the screen direction of dir
function fxLionHead2D(g, c, dir, R0, t, o = {}) {
  const q = P2(c); if (!q) return; const pal = e2Pal(o.pal || 'mereo'), R = R0 * (Array.isArray(c) ? q.s : 1), tf = onN(t, 2), roar = o.roar == null ? .7 : o.roar, seed = o.seed || 3;
  const d2 = dir ? proj2(vMad(c, dir, 1)) : [q.x, q.y + 1]; const tilt = clamp(Math.atan2(d2[1] - q.y, d2[0] - q.x) * 0 + (d2[0] - q.x) / (Math.abs(d2[0] - q.x) + Math.abs(d2[1] - q.y) + 1e-3) * .25, -.4, .4);
  g.save(); g.translate(q.x, q.y); g.rotate(tilt);
  // mane: ring of big tongues radiating outward (merged)
  const E = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU + Math.sin(tf * 2 + i) * .05; E.push({ p: { x: Math.cos(a) * R * .62, y: Math.sin(a) * R * .55 + R * .05 }, r: R * (.32 + .1 * hash(seed + i)), ang: a, h: 1.1 }); }
  fxE2Flames(g, E, t, { pal, n: 2, spread: .35, seed: seed + 5, hK: 1.0 });
  const lw = clamp(R * .03, 1.5, 6), S = (x, y) => [x * R, y * R];
  const poly = (pts, col, ink = true) => { polyPath(g, catmull(pts.map(p => S(p[0], p[1])), true, 3)); g.fillStyle = col; g.fill(); if (ink) { g.lineWidth = lw; g.strokeStyle = pal.ink; g.lineJoin = 'round'; g.stroke(); } };
  // head mass + ears
  for (const sx of [-1, 1]) poly([[sx * .38, -.42], [sx * .55, -.62], [sx * .62, -.38]], pal.outer);
  poly([[-.5, -.3], [0, -.48], [.5, -.3], [.56, .05], [.38, .42], [0, .62], [-.38, .42], [-.56, .05]], pal.outer);
  poly([[-.36, -.22], [0, -.36], [.36, -.22], [.4, .08], [.26, .36], [0, .46], [-.26, .36], [-.4, .08]], pal.mid, false);
  // brow ridge + nose bridge + eyes (white-hot slits)
  poly([[-.12, -.2], [.12, -.2], [.1, .16], [0, .2], [-.1, .16]], pal.core, false);
  for (const sx of [-1, 1]) { poly([[sx * .1, -.04], [sx * .34, -.14], [sx * .3, -.02], [sx * .14, .02]], '#fff', true); }
  // muzzle + open jaw with fangs
  const jaw = .12 + .26 * roar * (.85 + .15 * Math.sin(tf * 12));
  poly([[-.28, .2], [0, .14], [.28, .2], [.24, .32], [0, .36], [-.24, .32]], pal.mid);
  poly([[-.22, .32], [.22, .32], [.16, .32 + jaw], [0, .38 + jaw * 1.1], [-.16, .32 + jaw]], '#3a0418');
  g.fillStyle = '#fff4f8'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(...S(sx * .17, .32)); g.lineTo(...S(sx * .12, .32 + jaw * .7)); g.lineTo(...S(sx * .08, .32)); g.fill(); g.beginPath(); g.moveTo(...S(sx * .14, .32 + jaw)); g.lineTo(...S(sx * .1, .32 + jaw * .45)); g.lineTo(...S(sx * .06, .34 + jaw)); g.fill(); }
  poly([[-.08, .14], [.08, .14], [0, .22]], pal.ink, false);
  g.restore();
}
// giant crimson lion charging: o {c, dir, scale (m), roar, body:true, pal, dur}
function fxCrimsonLion(g, t, o = {}) {
  const dur = o.dur || 2.2; if (t < 0 || t > dur) return; const c = o.c || [0, 2, 0], dir = vNorm(o.dir || [0, 0, 1]), sc = (o.scale || 3) * Math.min(1, .3 + t * 2.5), pal = e2Pal(o.pal || 'mereo');
  const fade = 1 - clamp((t - dur + .3) / .3, 0, 1); g.save(); g.globalAlpha = fade;
  if (o.body !== false) { const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(vAdd(vMad(c, dir, -u * sc * 3.2), [Math.sin(u * 5 + t * 6) * sc * .15, -u * sc * .3, 0])); } fxE2FlameRibbon(g, pts, t, { pal, r: u => sc * (.55 - .35 * u), count: 12, n: 3, ang: 'back', spread: 1, seed: 77 }); }
  e2GlowAt(g, c, sc * 2.2, pal.glow, .5);
  fxLionHead2D(g, c, dir, sc, t, { pal, roar: o.roar == null ? .5 + .5 * Math.sin(t * 3) : o.roar, seed: 11 });
  g.restore();
}
// Hellfire Incarnate: flames streaming off the whole body (joints) + a flame mane from the head
function fxHellfire(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, amt = o.amt == null ? 1 : o.amt; if (amt <= 0) return;
  const js = ['shL', 'shR', 'elL', 'elR', 'handL', 'handR', 'pelvis', 'knL', 'knR', 'abd', 'neck'];
  fxE2Flames(g, js.map(j => ({ p: S.J[j], r: (j.startsWith('hand') ? .16 : .13) * k * amt })), t, { pal: o.pal || 'mereo', n: 2, seed: 61, alpha: o.alpha == null ? .9 : o.alpha, spread: 1 });
  const hd = S.J.head; fxE2Flames(g, [-.6, -.3, 0, .3, .6].map((a, i) => ({ p: vAdd(hd, mApply(S.M.head, [Math.sin(a) * .12 * k, .08 * k, -.08 * k])), r: .2 * k * amt, ang: -HP + a * .8, h: 1.4 })), t, { pal: o.pal || 'mereo', n: 2, seed: 71, spread: .3 });
}
// form part for the 'hellfire' design: small flames on forearms, fists and hair, depth-sorted with the body
function bcHellfireParts(S, D, F, t, parts, opt) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8;
  for (const sd of ['L', 'R']) { const a = S.J['el' + sd], b = S.J['hand' + sd]; parts.push({ z: camDepth(b) - .03, fn: c => fxE2FlameRibbon(c, [a, vLerp(a, b, .5), b], t, { pal: 'mereo', r: .07 * k, count: 5, n: 2, seed: sd === 'L' ? 3 : 5 }) }); }
  parts.push({ z: camDepth(S.J.head) + .05, fn: c => fxE2Flames(c, [{ p: vAdd(S.J.head, mApply(S.M.head, [0, .1 * k, -.12 * k])), r: .14 * k, h: 1.3 }], t, { pal: 'mereo', n: 4, seed: 17, spread: 1.2 }) });
}
// Calidus Brachium Purgatory / Barrage: N fists streaking from all directions into c (pal 'purgatory' = canon blue flames)
function fxPurgatoryBarrage(g, c, t, o = {}) {
  const dur = o.dur || 1.6; if (t < 0 || t > dur + .5) return; const n = o.n || 18, pal = e2Pal(o.pal || 'purgatory'), R = o.r || 9, seed = o.seed || 19;
  for (let i = 0; i < n; i++) { const t0 = hash(seed + i) * dur * .8, life = (t - t0) / .32; if (life < 0 || life > 1.25) continue;
    const a = hash(seed + i * 3) * TAU, el = (hash(seed + i * 5) - .3) * 1.2, from = vAdd(c, [Math.cos(a) * Math.cos(el) * R, Math.sin(el) * R * .6 + 1, Math.sin(a) * Math.cos(el) * R]);
    if (life <= 1) { const p = vLerp(from, c, easeIn(life)), back = vLerp(from, c, Math.max(0, easeIn(life) - .25)); fxE2FlameRibbon(g, [back, p], t, { pal, r: u => .25 + .35 * u, count: 5, n: 2, ang: 'back', seed: seed + i }); e2GlowAt(g, p, .9, pal.glow, .5); }
    else { const u = (life - 1) / .25; fxE2Flames(g, [{ p: c, r: .9 * (1 - u * .5) }], t, { pal, n: 5, spread: TAU, seed: seed + i * 7 }); e2GlowAt(g, c, 2.5, pal.glow, .6 * (1 - u)); }
  }
}
function fxManaZone(g, c, t, o = {}) {
  if (t < 0) return; const R = (o.r || 6) * Math.min(1, t * 1.5 + .2), n = o.n || 26, col = o.col || '#ff6a9a', col2 = o.col2 || '#fff0f6', seed = o.seed || 5, amt = o.amt == null ? 1 : o.amt;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ph = hash(seed + i) * TAU, el = (hash(seed + i * 3) - .5) * 1.6, sp = .8 + hash(seed + i * 5) * .8, pts = [];
    for (let j = 0; j <= 10; j++) { const a = ph + t * sp - j * .07, rr = R * (.75 + .25 * Math.sin(i + j * .2)); pts.push([c[0] + Math.cos(a) * Math.cos(el) * rr, c[1] + Math.sin(el + Math.sin(t + i) * .2) * rr * .7 + R * .2, c[2] + Math.sin(a) * Math.cos(el) * rr]); }
    for (const run of projLine(pts)) { polyPath(g, run, false); g.strokeStyle = rgba(col, .35 * amt); g.lineWidth = 7; g.stroke(); g.strokeStyle = rgba(col2, .7 * amt); g.lineWidth = 2; g.stroke(); } }
  g.restore();
}

// =============================================================================================== NOZEL (Mercury Magic)
const E2_CHROME = ['#4e586c', '#eef3fb', '#98a4b8', '#ffffff', '#5e687c'];
function e2ChromeFill(g, x0, y0, x1, y1, a = 1, cols = E2_CHROME) { const gr = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); g.globalAlpha = a; g.fillStyle = gr; g.fill(); g.globalAlpha = 1; }
// tapered mercury spike between world points a (base) and b (tip), width w (m)
function e2Spike(g, a, b, w, ink = '#1c2232', alpha = 1) {
  const pa = P2(a), pb = P2(b); if (!pa || !pb) return; const dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, ww = w * pa.s;
  g.beginPath(); g.moveTo(pa.x + nx * ww * .3 - dx * .04, pa.y + ny * ww * .3 - dy * .04); g.quadraticCurveTo(pa.x + nx * ww + dx * .2, pa.y + ny * ww + dy * .2, pb.x, pb.y); g.quadraticCurveTo(pa.x - nx * ww + dx * .2, pa.y - ny * ww + dy * .2, pa.x - nx * ww * .3 - dx * .04, pa.y - ny * ww * .3 - dy * .04); g.closePath();
  e2ChromeFill(g, pa.x + nx * ww, pa.y + ny * ww, pa.x - nx * ww, pa.y - ny * ww, alpha); g.lineWidth = clamp(ww * .12, 1, 3.5); g.strokeStyle = ink; g.lineJoin = 'round'; g.stroke();
}
function e2Droplet(g, p, r, alpha = 1) { const q = P2(p); if (!q) return; const rr = r * (Array.isArray(p) ? q.s : 1); if (rr < .8) return; g.beginPath(); g.ellipse(q.x, q.y, rr, rr * .92, 0, 0, TAU); e2ChromeFill(g, q.x - rr, q.y - rr, q.x + rr, q.y + rr, alpha); g.lineWidth = clamp(rr * .12, .8, 3); g.strokeStyle = '#1c2232'; g.stroke(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(q.x - rr * .35, q.y - rr * .35, rr * .22, rr * .14, -.6, 0, TAU); g.fill(); }
function fxMercuryBlobs(g, c, t, o = {}) { if (t < 0) return; const n = o.n || 9, R = o.r || .8; for (let i = 0; i < n; i++) { const a = t * (1.1 + hash(i) * .5) + i / n * TAU, y = Math.sin(t * 1.7 + i) * .25; e2Droplet(g, [c[0] + Math.cos(a) * R, c[1] + y, c[2] + Math.sin(a) * R], (o.size || .06) * (.6 + hash(i * 3) * .8)); } }
// Silver Rain: needles fall from above onto a disc (c, r); o: {n, dur, len, h}
function fxSilverRain(g, t, o = {}) {
  const dur = o.dur || 1.8; if (t < 0 || t > dur + .6) return; const c = o.c || [0, 0, 0], R = o.r || 5, n = o.n || 70, seed = o.seed || 23, Hh = o.h || 14, len = o.len || 1.6;
  for (let i = 0; i < n; i++) { const t0 = hash(seed + i) * dur, ft = .35 + hash(seed + i * 3) * .15, u = (t - t0) / ft; if (u < 0) continue;
    const a = hash(seed + i * 5) * TAU, rr = R * Math.sqrt(hash(seed + i * 7)), gp = [c[0] + Math.cos(a) * rr, c[1], c[2] + Math.sin(a) * rr], tilt = [(hash(seed + i * 9) - .5) * .4, 1, (hash(seed + i * 11) - .5) * .4];
    if (u <= 1) { const tip = vMad(gp, tilt, Hh * (1 - easeIn(u))); e2Spike(g, vMad(tip, tilt, len), tip, o.w || .1); }
    else if (u < 2.2) { const k = (u - 1) / 1.2; e2Spike(g, vMad(gp, tilt, len * .6 * (1 - k * .3)), vMad(gp, tilt, -.15), o.w || .1, '#1c2232', 1 - k * .5); if (k < .5) fxShockRing(g, gp, k * .5, { r: .6, dur: .25, w: .08, col: '#e8eef8', ink: 0 }); }
  }
}
// spear forming at a (blob grows into a spike) then shooting to b; o: {form (s), fly (s), w}
function fxSilverSpear(g, a, b, t, o = {}) {
  const fm = o.form == null ? .25 : o.form, fl = o.fly || .18, w = o.w || .09; if (t < 0 || t > fm + fl + .4) return; const d = vNorm(vSub(b, a)), L = o.len || 2.2;
  if (t < fm) { const u = t / fm; e2Droplet(g, a, w * (1 + u)); e2Spike(g, vMad(a, d, -L * .3 * u), vMad(a, d, L * .7 * u), w * u); return; }
  const u = Math.min(1, (t - fm) / fl), tip = vLerp(vMad(a, d, L * .7), b, easeIn(u)); e2Spike(g, vMad(tip, d, -L), tip, w);
  if (u < 1) { const pa = P2(vMad(tip, d, -L)), pt = P2(tip); if (pa && pt) { g.save(); g.strokeStyle = 'rgba(220,232,255,.5)'; g.lineWidth = w * pa.s * 1.2; g.beginPath(); g.moveTo(pa.x, pa.y); const pb = P2(vMad(a, d, L * .5)); if (pb) g.lineTo(pb.x, pb.y); g.stroke(); g.restore(); } }
  else fxSparks(g, b, t - fm - fl, { col: '#ffffff', n: 16, dur: .25 });
}
// Silver Shining Regal Spear: beam from the palm a along dir (vector or fn(t)), o {len, w, grow}
function fxRegalSpear(g, a, dir, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const d = vNorm(typeof dir === 'function' ? dir(t) : dir), w = o.w || .16; let L = (o.len || 25) * easeOut(clamp(t / (o.grow || .12), 0, 1)); while (L > .5 && !P2(vMad(a, d, L))) L *= .7;
  const pa = P2(a), pb = P2(vMad(a, d, L)); if (!pa || !pb) return; const dx = pb.x - pa.x, dy = pb.y - pa.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const w0 = w * pa.s, w1 = w * pb.s * .4 + 1; const quad = () => { g.beginPath(); g.moveTo(pa.x + nx * w0, pa.y + ny * w0); g.lineTo(pb.x + nx * w1, pb.y + ny * w1); g.lineTo(pb.x, pb.y); g.lineTo(pb.x - nx * w1, pb.y - ny * w1); g.lineTo(pa.x - nx * w0, pa.y - ny * w0); g.closePath(); };
  g.save(); g.globalCompositeOperation = 'lighter'; quad(); g.lineWidth = w0 * 2.2; g.strokeStyle = 'rgba(160,190,255,.25)'; g.stroke(); g.restore();
  quad(); e2ChromeFill(g, pa.x + nx * w0, pa.y + ny * w0, pa.x - nx * w0, pa.y - ny * w0); g.lineWidth = clamp(w0 * .1, 1, 3); g.strokeStyle = '#1c2232'; g.stroke();
  g.save(); g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1, w0 * .25); g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke(); g.restore();
  e2GlowAt(g, a, .5, '#cfe0ff', .7); e2Droplet(g, a, w * 1.3);
}
// giant mercury eagle: o {c, dir, scale (m wingspan/2), flap, dur, alpha}
function fxSilverEagle(g, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const c = o.c || [0, 4, 0], q = P2(c); if (!q) return; const dir = o.dir || [0, 0, 1];
  const R = (o.scale || 4) * q.s * Math.min(1, .25 + t * 2), d2 = proj2(vMad(c, vNorm(dir), 1)); let ang = Math.atan2(d2[1] - q.y, d2[0] - q.x); if (Math.hypot(d2[0] - q.x, d2[1] - q.y) < 2) ang = -HP;
  const flap = o.flap == null ? Math.sin(t * 5) : o.flap, lw = clamp(R * .012, 1.2, 5);
  g.save(); g.translate(q.x, q.y); g.rotate(ang + HP); g.globalAlpha = o.alpha == null ? 1 : o.alpha; // local: head toward -y
  const shape = (pts, cols, inkW = lw) => { polyPath(g, catmull(pts.map(p => [p[0] * R, p[1] * R]), true, 2)); const ys = pts.map(p => p[1] * R), xs = pts.map(p => p[0] * R); e2ChromeFill(g, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 1, cols); g.lineWidth = inkW; g.strokeStyle = '#1a2030'; g.lineJoin = 'round'; g.stroke(); };
  // wings: arm (leading edge) + secondaries + 6 fingered primaries fanning from the wrist; flap raises/lowers the tips
  const DARK = ['#3a4256', '#c8d2e4', '#6a7690', '#f4f8ff', '#46506a'];
  for (const sx of [-1, 1]) { const lift = flap * .22, wx = sx * .52, wy = -.16 - lift * .6;
    for (let i = 0; i < 6; i++) { const a0 = -.95 + i * .26, L = .5 - Math.abs(i - 1.5) * .05, tx = wx + sx * Math.cos(a0) * L, ty = wy + Math.sin(a0) * L * .8 + .25 - lift * .4; shape([[wx, wy + .02], [tx - sx * .02, ty - .03], [tx + sx * .04, ty], [tx, ty + .05], [wx + sx * .02, wy + .1]], DARK, lw * .8); }
    for (let i = 0; i < 6; i++) { const u = i / 5, bx = sx * (.1 + u * .42), tyy = .2 + .06 * Math.sin(u * Math.PI) - lift * u * .5; shape([[bx - sx * .04, -.05 - lift * u * .5], [bx + sx * .05, -.08 - lift * u * .6], [bx + sx * .04, tyy + .04], [bx - sx * .02, tyy]], DARK, lw * .7); }
    shape([[sx * .06, -.16], [sx * .3, -.22 - lift * .3], [wx, wy - .03], [wx + sx * .02, wy + .08], [sx * .3, -.04 - lift * .2], [sx * .06, .02]], E2_CHROME); }
  // tail fan
  for (let i = -2; i <= 2; i++) shape([[i * .04, .3], [i * .09 - .03, .62], [i * .09 + .03, .63], [i * .04 + .02, .3]], E2_CHROME, lw * .8);
  // body + head + beak + eye
  shape([[-.12, -.15], [0, -.25], [.12, -.15], [.1, .25], [0, .36], [-.1, .25]], ['#6a7488', '#ffffff', '#b8c2d4', '#f4f8ff', '#5a6478']);
  shape([[-.09, -.22], [-.06, -.33], [0, -.37], [.06, -.33], [.09, -.22], [.06, -.15], [-.06, -.15]], E2_CHROME);
  g.beginPath(); g.moveTo(-.035 * R, -.35 * R); g.quadraticCurveTo(-.01 * R, -.5 * R, .02 * R, -.48 * R); g.quadraticCurveTo(.03 * R, -.43 * R, .01 * R, -.42 * R); g.lineTo(.035 * R, -.35 * R); g.closePath(); g.fillStyle = '#d8b44a'; g.fill(); g.lineWidth = lw * .7; g.strokeStyle = '#1a2030'; g.stroke();
  for (const sx of [-1, 1]) { g.fillStyle = '#d8b44a'; g.beginPath(); g.ellipse(sx * .045 * R, -.29 * R, .014 * R, .008 * R, sx * .4, 0, TAU); g.fill(); g.strokeStyle = '#1a2030'; g.lineWidth = lw; g.beginPath(); g.moveTo(sx * .02 * R, -.31 * R); g.lineTo(sx * .075 * R, -.3 * R); g.stroke(); }
  g.restore(); e2GlowAt(g, c, (o.scale || 4) * .9, '#c8d8ff', .25);
}
// Silver Star of Execution: bars rise around c, star ring on top, spears launch inward at o.launch
function fxSilverStar(g, c, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const R = o.r || 4, n = o.n || 10, Hh = o.h || 6, rise = easeOut(clamp(t / .5, 0, 1)), L = o.launch == null ? .8 : o.launch;
  const bars = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; bars.push({ a, b: [c[0] + Math.cos(a) * R, c[1], c[2] + Math.sin(a) * R] }); }
  bars.sort((p, q) => camDepth(q.b) - camDepth(p.b));
  for (const B of bars) e2Spike(g, vAdd(B.b, [0, -.2, 0]), vAdd(B.b, [0, Hh * rise, 0]), o.w || .2);
  if (rise > .8) { const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU - HP, r = i % 2 ? R * .45 : R; pts.push([c[0] + Math.cos(a) * r, c[1] + Hh * rise, c[2] + Math.sin(a) * r]); } for (const run of projLine(pts)) { polyPath(g, run, false); g.lineWidth = 6; g.strokeStyle = '#1c2232'; g.stroke(); g.lineWidth = 3.5; g.strokeStyle = '#eef3fb'; g.stroke(); } }
  if (t > L) for (let i = 0; i < n; i++) { const B = bars[i], hgt = Hh * (.3 + .5 * hash(i)); fxSilverSpear(g, vAdd(B.b, [0, hgt, 0]), vAdd(c, [0, 1.2, 0]), t - L - i * .03, { form: .12, fly: .15, len: 1.6, w: .07 }); }
}

// =============================================================================================== IMPACT SEQUENCES (Black Clover)
Object.assign(IMPACT_SEQ, {
  mereo_calidus: [{ s: 'whiteout', n: 1, p: { ink: '#4a0428', fxCol: '#ff4a78' } }, { s: 'blackaccent', n: 2, p: { accent: '#ff3d6e', lines: 80 } }, { s: 'redblack', n: 1, p: { col: '#c4125a' } }],
  mereo_lion: [{ s: 'overexpose', n: 1, p: { col: '#ff4a78' } }, { s: 'kanji', n: 3, p: { char: '獅', col: '#ffe2ee', col2: '#ff3d6e', outline: '#4a0428', tint: '#c4125a' } }, { s: 'invert', n: 1, p: { hue: 200 } }, { s: 'radial', n: 2, p: { lineCol: '#ffd0e0', ringCol: '#ff3d6e' } }],
  mereo_hellfire: [{ s: 'rimsil', n: 2, p: { col: '#ffe2ee', col2: '#d0145a', rimCol: '#fff' } }, { s: 'kanji', n: 2, p: { char: '業火', col: '#ff4a78', col2: '#ffe2ee', outline: '#2a0818', size: .8 } }, { s: 'overexpose', n: 1, p: { col: '#ff6a9a' } }],
  mereo_purgatory: [{ s: 'duotone', n: 2, p: { dark: '#0e0838', light: '#b8b0ff' } }, { s: 'speedburst', n: 1 }, { s: 'kanji', n: 2, p: { char: '煉獄', col: '#d8d0ff', outline: '#0e0838', tint: '#3a3cff', size: .8 } }, { s: 'flash', n: 1, p: { col: '#e8e4ff' } }],
  nozel_eagle: [{ s: 'rimsil', n: 2, p: { col: '#f4f8ff', col2: '#7a86a0', rimCol: '#ffffff' } }, { s: 'kanji', n: 3, p: { char: '銀', col: '#f4f8ff', col2: '#b8c4d8', outline: '#1c2232', tint: '#9aa6ba' } }, { s: 'flash', n: 1 }],
  nozel_rain: [{ s: 'desat', n: 2, p: { accent: '#dfe8ff' } }, { s: 'invert', n: 1, p: { hue: 180 } }, { s: 'hatch', n: 2, p: { paper: '#e8ecf4', ink: '#1c2232' } }],
  nozel_regal: [{ s: 'whiteout', n: 1, p: { ink: '#1c2232', fxCol: '#dfe8ff', lines: 50 } }, { s: 'crimsonline', n: 2, p: { col: '#5a6478', bg: '#f4f8ff' } }, { s: 'invert', n: 1 }],
  nozel_star: [{ s: 'blackaccent', n: 2, p: { accent: '#e8eef8', lines: 60 } }, { s: 'shatter', n: 3, p: { gap: '#f4f8ff', edge: '#5a6478' } }, { s: 'flash', n: 1 }],
});
