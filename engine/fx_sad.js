/* engine/fx_sad.js (agent E) - signature effects for Shinji / Aizen / Dazai.  All effects take the effect's OWN time t (pass lt - start)
   and draw nothing outside their duration.  Positions: world [x,y,z] (projected, sized by depth) or screen {x,y}.
   SCREEN PROCESSES (register on the frame builder, run after grade and before the impact frame; see timeline.js f.screen):
     fxSakanadeWorld(f, t, o)      INVERTED WORLD: whole image rotates to upside-down (o.flip 0..1 or auto by t/o.dur), o.neg 0..1 b/w negative,
                                   o.mirror 0..1 mirrored seams / ghost copy, o.mist 0..1 pink haze, o.wobble vertigo sway.
     fxKyokaMirror(f, t, o)        KYOKA SUIGETSU shatter: the image cracks into mirror shards from o.at, shards slide/fall (o.break 0..1 or auto),
                                   behind them o.reveal ('void' violet-black | 'white' | 'neg' negative copy | css colour).
     sadNullify(f, t, o)           NO LONGER HUMAN on screen processes: inside a circle around o.at the screen processes are undone (colour and
                                   directions return), white-blue page wave on the edge, 人間失格 glyphs.  o.r (px @1080p) or grows with t.
   SHINJI:  fxSakanadeMist(g, src, t, o) pink aromatic mist (src = point | array of points | F -> 5 blade holes), fxRingSpin(g, F, t, o) spin smear,
            fxSakanadeFlower(g, base, t, o) bankai golden metal flower (o.open 0 bud .. 1 open, o.scale), fxShinjiHollow(g, F, t, o) mask forming,
            fxShinjiCero(g, a, dir, t, o) yellow cero (horizontal line before the fist -> very wide arc), fxSenjuKoten(g, c, b, t, o) Hado #91.
   AIZEN:   fxKyokaRelease(g, F, t, o) moon + flower reflected on the blade, fxKyokaIllusion(g, F, ft, t, o) an illusion double breaks into glass,
            fxShimmer(g, c, t, o) glints + water rings, fxKurohitsugi(g, c, t, o) Hado #90 black coffin (o.size, o.full, o.shatter time),
            fxKidoScript(g, c, t, o) ring of kido writing (o.shatter -> glyphs break), fxDanku(g, c, n, t, o) Bakudo #81 hex wall,
            fxByakurai(g, a, b, t, o) Hado #4 white lightning, fxHogyoku(g, c, t, o) orb glow (o.mode 'orb'|'fuse'|'pillar'),
            fxHogyokuCocoon(g, F, ft, t, o) white casing ribbons wrapping a figure, fxAizenPressure(g, c, t, o) violet reiatsu pressure,
            fxAizenFinal(g, c, t, o) final-fusion eruption (blood + violet + black tendrils), fxFragor(g, a, b, t, o) energy ball -> columnar blast,
            fxAizenAura(g, F, t, o) violet flame aura.
   DAZAI:   fxNoLongerHuman(g, p, t, o) touch: white-blue wave + page lines + 人間失格 glyphs, fxSnuff(g, p, t, o) an effect goes out like a candle,
            fxKidoShatter(g, c, t, o) kido writing breaks into falling glyph shards, fxDazaiGun(g, F, t, o) muzzle flash + tracer + shell (o.to),
            fxRicochet(g, p, t, o) spark + 'clink', fxPageTurn(g, t, o) screen page-turn wipe, sadGunMuzzle(F, t) -> {p, dir}.
   Blood / deaths: fx_blood.js (fxBloodSpray, fxBloodArc, fxSplitFig, fxDisintegrate ...).                                                 */
'use strict';
const SADFX = { pink: '#ff9ccf', pinkDeep: '#e0508f', gold: '#f2c84a', goldDeep: '#a8761e', violet: '#9a4ae0', violetDeep: '#3a0c66', cero: '#ffe24a', nlh: '#cfe8ff' };
const sadQ = p => (Array.isArray(p) ? project(p) : (p ? { x: p.x, y: p.y, s: p.s || 100 } : null));
const sadU = (t, dur) => (t < 0 || t > dur ? -1 : t / dur);

// ======================================================================================================== SCREEN PROCESSES
function sadCopy(c, name = 'sadTmp') { const t = layer(name), g = t.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, t.width, t.height); g.drawImage(c, 0, 0); return t; }
function fxSakanadeWorld(f, t, o = {}) {
  f.screen((c, g) => {
    const dur = o.dur || .6, flip = o.flip != null ? o.flip : clamp(t / dur, 0, 1), e = easeInOut ? easeInOut(flip) : flip, neg = o.neg || 0, mir = o.mirror || 0;
    const src = sadCopy(c), w = c.width, h = c.height, ang = e * Math.PI + (o.wobble ? Math.sin(t * 2.3) * .03 * o.wobble : 0);
    const cs = Math.abs(Math.cos(ang)), sn = Math.abs(Math.sin(ang)), cover = Math.max((w * cs + h * sn) / w, (w * sn + h * cs) / h) * (1 + (o.zoom || 0));
    const gg = c.getContext('2d'); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.fillStyle = '#000'; gg.fillRect(0, 0, w, h);
    gg.translate(w / 2, h / 2); gg.rotate(ang); gg.scale(cover, cover); gg.drawImage(src, -w / 2, -h / 2);
    if (flip > .02 && flip < .98) { gg.globalAlpha = .35; for (const d of [-.05, .05]) { gg.save(); gg.rotate(d * Math.sin(flip * Math.PI)); gg.drawImage(src, -w / 2, -h / 2); gg.restore(); } gg.globalAlpha = 1; }   // spin smear
    gg.restore();
    if (neg > 0) { const n = layer('sadNeg'), ng = n.getContext('2d'); ng.setTransform(1, 0, 0, 1, 0, 0); ng.filter = 'invert(1) grayscale(1) contrast(1.45)'; ng.clearRect(0, 0, w, h); ng.drawImage(c, 0, 0); ng.filter = 'none'; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = neg; gg.drawImage(n, 0, 0); gg.restore(); }
    if (mir > 0) { // mirrored ghost copy + seams ("peilatut linjat")
      const m = sadCopy(c, 'sadMir'); gg.save(); gg.setTransform(-1, 0, 0, 1, w, 0); gg.globalAlpha = .22 * mir; gg.globalCompositeOperation = 'screen'; gg.drawImage(m, 0, 0); gg.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#ffd8ee', .55 * mir); for (let i = 0; i < 9; i++) { const y = H * (hash(i * 7 + 3) * .9 + .05), x0 = W * hash(i * 3), L = W * (.15 + .4 * hash(i * 5)); g.lineWidth = 1 + 3 * hash(i); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + L, y); g.stroke(); g.beginPath(); g.moveTo(W - x0, H - y); g.lineTo(W - x0 - L, H - y); g.stroke(); }
      g.lineWidth = 3; g.strokeStyle = rgba('#ffffff', .5 * mir); g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.restore(); }
    const mist = (o.mist == null ? .3 : o.mist) * .6; if (mist > 0) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .95); gr.addColorStop(0, rgba(SADFX.pink, 0)); gr.addColorStop(1, rgba(SADFX.pink, .38 * mist)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }
  });
}
// Voronoi-ish shard cells over the screen (deterministic per seed)
function sadShards(seed, n, focus) { const r = rng(seed), pts = []; for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.pow(r(), .7) * 1300; pts.push([focus.x + Math.cos(a) * d * 1.2, focus.y + Math.sin(a) * d * .8]); }
  const cells = []; const box = [[-200, -200], [W + 200, -200], [W + 200, H + 200], [-200, H + 200]];
  for (let i = 0; i < pts.length; i++) { let poly = box.slice(); const p = pts[i];
    for (let j = 0; j < pts.length && poly.length > 2; j++) { if (i === j) continue; const q = pts[j], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = q[0] - p[0], ny = q[1] - p[1]; const out = []; // keep half-plane closer to p
      for (let k = 0; k < poly.length; k++) { const A = poly[k], B = poly[(k + 1) % poly.length], da = (A[0] - mx) * nx + (A[1] - my) * ny, db = (B[0] - mx) * nx + (B[1] - my) * ny; if (da <= 0) out.push(A); if ((da <= 0) !== (db <= 0)) { const s = da / (da - db); out.push([A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s]); } } poly = out; }
    if (poly.length > 2) cells.push({ poly, c: p, d: Math.hypot(p[0] - focus.x, p[1] - focus.y), h: hash(seed * 13 + i) }); }
  return cells;
}
const SAD_SHARD_CACHE = {};
function fxKyokaMirror(f, t, o = {}) {
  f.screen((c, g) => {
    const focus = o.at ? (sadQ(o.at) || { x: W / 2, y: H / 2 }) : { x: o.x == null ? W / 2 : o.x, y: o.y == null ? H / 2 : o.y };
    const key = (o.seed || 7) + ':' + Math.round(focus.x / 40) + ':' + Math.round(focus.y / 40); const cells = SAD_SHARD_CACHE[key] || (SAD_SHARD_CACHE[key] = sadShards(o.seed || 7, o.n || 46, focus));
    const crack = clamp(t / (o.crackDur || .18), 0, 1), br = o.break != null ? o.break : clamp((t - (o.hold || .3)) / (o.breakDur || .7), 0, 1);
    const src = sadCopy(c), w = c.width, sc = OUT.scale, gg = c.getContext('2d');
    // what lies behind the illusion
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); const rv = o.reveal || 'void';
    if (rv === 'neg') { gg.filter = 'invert(1) hue-rotate(180deg) saturate(.6)'; gg.drawImage(src, 0, 0); gg.filter = 'none'; }
    else { const gr = gg.createRadialGradient(focus.x * sc, focus.y * sc, 0, focus.x * sc, focus.y * sc, w); gr.addColorStop(0, rv === 'white' ? '#ffffff' : rv === 'void' ? '#6a2aa8' : rv); gr.addColorStop(1, rv === 'white' ? '#d8d4e8' : rv === 'void' ? '#0a0412' : rv); gg.fillStyle = gr; gg.fillRect(0, 0, w, c.height); }
    gg.restore();
    for (const cl of cells) {
      const reach = cl.d / 1100, go = clamp((br - reach * .6) / .5, 0, 1), fall = go * go; if (crack < reach * .9 && br === 0) { /* not cracked yet: draw whole */ }
      const dx = (cl.c[0] - focus.x) * .25 * fall + (cl.h - .5) * 60 * fall, dy = (cl.c[1] - focus.y) * .25 * fall + 900 * fall * fall * (o.gravity == null ? 1 : o.gravity), rot = (cl.h - .5) * 1.6 * fall;
      if (go >= 1) continue;
      g.save(); g.translate(cl.c[0] + dx, cl.c[1] + dy); g.rotate(rot); g.scale(1 - .3 * fall, 1 - .3 * fall); g.translate(-cl.c[0], -cl.c[1]);
      polyPath(g, cl.poly); g.save(); g.clip(); g.setTransform(g.getTransform()); g.drawImage(src, 0, 0, W, H);
      const lit = .12 + .3 * cl.h * (1 - fall * .5); g.fillStyle = rgba(cl.h > .5 ? '#ffffff' : '#c8b8ff', lit * Math.min(1, crack * 2) * (.4 + fall)); g.fillRect(-200, -200, W + 400, H + 400); g.restore();
      if (crack > reach * .8) { polyPath(g, cl.poly); g.lineWidth = 2.2; g.strokeStyle = rgba('#ffffff', .9); g.stroke(); g.lineWidth = 1; g.strokeStyle = rgba('#3a1a5a', .6); g.stroke(); }
      g.restore();
    }
    // glints at crack junctions
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const cl = cells[(i * 7) % cells.length]; if (!cl) continue; const p = cl.poly[0], a = clamp(crack * 2 - i * .05, 0, 1) * (1 - br); if (a <= 0) continue; fxImpactStar(g, p[0], p[1], 18 + 30 * hash(i), i, rgba('#ffffff', a), 4); } g.restore();
  });
}
function sadNullify(f, t, o = {}) { // register a nullify circle (expanding unless o.r given)
  const dur = o.dur || .45, r = o.r != null ? o.r : (o.r1 || 900) * easeOut(clamp(t / dur, 0, 1)); if (t < 0) return;
  f.nullify(Object.assign({}, o, { r, t }));
}
function sadNullifyRestore(comp, base, f, nl, t) {
  const q = nl.at ? sadQ(nl.at) : { x: nl.x == null ? W / 2 : nl.x, y: nl.y == null ? H / 2 : nl.y }; if (!q) return; const sc = OUT.scale, r = Math.max(1, nl.r) * sc, fe = (nl.feather || 40) * sc;
  const tmp = layer('nlTmp'), tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, tmp.width, tmp.height); tg.drawImage(base, 0, 0);
  tg.globalCompositeOperation = 'destination-in'; const gr = tg.createRadialGradient(q.x * sc, q.y * sc, Math.max(0, r - fe), q.x * sc, q.y * sc, r); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); tg.fillStyle = gr; tg.fillRect(0, 0, tmp.width, tmp.height); tg.globalCompositeOperation = 'source-over';
  const g = comp.getContext('2d'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.restore();
  if (nl.edge !== false) { g.save(); g.setTransform(sc, 0, 0, sc, 0, 0); g.globalCompositeOperation = 'lighter'; const R = nl.r; g.lineWidth = 6; g.strokeStyle = rgba(SADFX.nlh, .7); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
    g.globalCompositeOperation = 'source-over'; g.fillStyle = rgba('#e8f4ff', .85); g.font = '700 26px "IPAMincho", "IPAGothic", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + hash(i) * .3, rr = R + (hash(i * 3) - .5) * 30; g.save(); g.translate(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); g.rotate(a + HP); g.globalAlpha = .5 + .5 * hash(i * 5 + Math.floor(t * 12)); g.fillText('人間失格'[i % 4], 0, 0); g.restore(); } g.restore(); }
}

// ======================================================================================================== SHINJI
function sadBladeHoles(F, t) { const s = swordAt(F, t); if (!s) return null; const out = []; for (let i = 0; i < 5; i++) out.push(vLerp(s.base, s.tip, .05 + i * .16)); return out; }
function fxSakanadeMist(g, src, t, o = {}) {
  if (t < 0) return; const pts = src && src.design ? (sadBladeHoles(src, o.ft == null ? t : o.ft) || []) : Array.isArray(src) && Array.isArray(src[0]) ? src : [src];
  const n = o.n || 26, life = o.life || 2.2, R = o.r || 2.4, col = o.col || SADFX.pink, a0 = o.alpha == null ? .55 : o.alpha;
  g.save();
  pts.forEach((p0, pi) => { for (let i = 0; i < n; i++) { const born = (i / n) * life, age = ((t - born) % life + life) % life; if (t < born) continue; const u = age / life;
    const ang = hash(pi * 31 + i) * TAU + u * (o.swirl == null ? 2.2 : o.swirl), rad = R * Math.pow(u, .7);
    const p = Array.isArray(p0) ? vAdd(p0, [Math.cos(ang) * rad, (hash(i * 3 + pi) - .3) * rad * .6 + u * .6, Math.sin(ang) * rad]) : { x: p0.x + Math.cos(ang) * rad * 120, y: p0.y + Math.sin(ang) * rad * 70 };
    const q = sadQ(p); if (!q) continue; const r = (.25 + .9 * u) * (Array.isArray(p0) ? q.s : 100) * (o.size || 1), a = a0 * Math.sin(Math.PI * u);
    g.fillStyle = radial(g, q.x, q.y, r, [[0, rgba(col, a)], [.6, rgba(col, a * .45)], [1, rgba(col, 0)]]); g.fillRect(q.x - r, q.y - r, r * 2, r * 2);
    if (i % 3 === 0) { g.strokeStyle = rgba(SADFX.pinkDeep, a * .6); g.lineWidth = Math.max(1, r * .05); g.beginPath(); g.arc(q.x, q.y, r * .45, ang, ang + 2.4); g.stroke(); } } });
  g.restore();
}
function fxRingSpin(g, F, t, o = {}) { // circular smear of the blade spinning on its pommel ring
  const sw = swordAt(F, t); if (!sw) return; const S = figSkel(F, t), hg = handGeom(S, 'R', S.pose.hR || 'point'); if (!hg) return;
  const c = hg.fingers[0][2], L = vDist(c, sw.tip), axis = vNorm(o.axis || toCam(c)), M = mFromY(axis, Math.abs(axis[1]) > .9 ? [1, 0, 0] : [0, 1, 0]);
  const rot = t * (o.speed || 28), n = 3;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < n; k++) { const pts = []; for (let i = 0; i <= 24; i++) { const a = rot - k * 2.1 - i / 24 * 1.6; pts.push(vAdd(c, vAdd(vMul(M[0], Math.cos(a) * L), vMul(M[2], Math.sin(a) * L)))); }
    for (const rn of projLine(pts)) { polyPath(g, rn, false); g.lineWidth = Math.max(2, .05 * pxScale(c)); g.strokeStyle = rgba('#ffe8f4', .5 - k * .12); g.lineCap = 'round'; g.stroke(); } }
  g.restore();
}
// Bankai: large golden metal flower around Shinji (petals envelop him), pink mist from the top
function fxSakanadeFlower(g, base, t, o = {}) {
  if (t < 0) return; const sc = o.scale || 1, open = o.open == null ? clamp(1 - t / .6, 0, 1) : o.open, np = 8, Hh = 3.4 * sc, R0 = .55 * sc;
  const petals = []; for (let i = 0; i < np; i++) { const a = i / np * TAU + .2, d = [Math.cos(a), 0, Math.sin(a)];
    const lean = lerp(-.05, 1.05, open); // 0 = closed bud (tips meet over him), 1 = open bloom
    const ring = []; for (let v = 0; v <= 6; v++) { const u = v / 6, bend = lean * Math.pow(u, 1.4); const rr = R0 * (1 + 1.4 * Math.sin(u * Math.PI * .9)) * (1 - (1 - lean) * u * .85) + bend * 1.8 * sc; ring.push([rr, u * Hh * (1 - .45 * lean * u)]); }
    const side = [Math.cos(a + HP), 0, Math.sin(a + HP)], wv = v => (.9 * Math.sin(Math.min(1, v / 6 * 1.15) * Math.PI) + .15) * sc;
    const L = ring.map(([rr, y], v) => vAdd(base, vAdd(vMul(d, rr), vAdd([0, y, 0], vMul(side, -wv(v)))))), Rr = ring.map(([rr, y], v) => vAdd(base, vAdd(vMul(d, rr), vAdd([0, y, 0], vMul(side, wv(v))))));
    petals.push({ L, R: Rr, z: camDepth(vAdd(base, vAdd(vMul(d, R0 * 1.5), [0, Hh * .4, 0]))), d }); }
  petals.sort((a, b) => b.z - a.z);
  g.save(); if (o.alpha != null) g.globalAlpha = o.alpha;
  for (const p of petals) { if (o.behind === true && p.z < camDepth(base)) continue; if (o.behind === false && p.z >= camDepth(base)) continue;
    const poly = p.L.concat(p.R.slice().reverse()), sp = projPoly(poly); if (sp.length < 3) continue; const facing = vDot(p.d, toCam(base));
    polyPath(g, sp); g.fillStyle = facing > 0 ? '#e8b83a' : '#a8761e'; g.fill();
    g.save(); g.clip(); const mid = p.L.map((q, i) => vLerp(q, p.R[i], .5)); for (const rn of projLine(mid)) { polyPath(g, rn, false); g.lineWidth = 3; g.strokeStyle = rgba('#fff2b0', .8); g.stroke(); }
    for (const k of [.25, .75]) { const ln = p.L.map((q, i) => vLerp(q, p.R[i], k)); for (const rn of projLine(ln)) { polyPath(g, rn, false); g.lineWidth = 1.5; g.strokeStyle = rgba('#7a4a10', .6); g.stroke(); } }
    const gr = g.createLinearGradient(sp[0][0], sp[0][1], sp[Math.floor(sp.length / 2)][0], sp[Math.floor(sp.length / 2)][1]); gr.addColorStop(0, 'rgba(255,250,210,.35)'); gr.addColorStop(1, 'rgba(120,70,10,.25)'); g.fillStyle = gr; g.fill(); g.restore();
    polyPath(g, sp); g.lineWidth = 2.5; g.strokeStyle = '#3a2408'; g.lineJoin = 'round'; g.stroke(); }
  g.restore();
  if (o.mist !== false) fxSakanadeMist(g, [vAdd(base, [0, Hh * (1 - .4 * open), 0])], t, { r: 4 * sc, n: 14, size: 1.4 * sc, alpha: .3 });
}
function fxShinjiHollow(g, F, t, o = {}) { // bone shards gather on the face, Hollow reiatsu flares (black + yellow)
  if (t < 0 || t > (o.dur || 1.4)) return; const S = figSkel(F, t), hc = S.J.head, k = S.B.h / 1.8, q = project(hc); if (!q) return;
  const u = clamp(t / .35, 0, 1);
  fxAura(g, F, t, { col: '#16120e', col2: '#ffd84a', size: .5 * (o.size || 1), amt: Math.min(1, t * 3) * (1 - clamp((t - 1) / .4, 0, 1)), alpha: .85, inkCol: '#000' });
  g.save(); for (let i = 0; i < 16; i++) { const a = hash(i * 5) * TAU, d = (1 - easeIn(u)) * (.5 + hash(i) * .6) * k, p = vAdd(hc, [Math.cos(a) * d, Math.sin(a * 1.3) * d * .7, Math.sin(a) * d * .3 + .1 * k]), qq = project(p); if (!qq || u >= 1) continue;
    const r = .035 * k * qq.s * (1 + hash(i * 3)); g.save(); g.translate(qq.x, qq.y); g.rotate(a + t * 8); g.beginPath(); g.moveTo(-r, -r * .4); g.lineTo(r, -r * .7); g.lineTo(r * .4, r); g.closePath(); g.fillStyle = '#f6f4ee'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#1a1418'; g.stroke(); g.restore(); }
  if (t > .3 && t < .5) { g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, .5 * k * q.s, '#ffe27a', .8 * (1 - (t - .3) / .2)); }
  g.restore();
}
function fxShinjiCero(g, a, dir, t, o = {}) { // charge: a horizontal line of energy before the fist; fire: very wide arc
  if (t < 0) return; const ch = o.charge || .45, dur = o.dur || .9, col = o.col || SADFX.cero, d = vNorm(dir), side = vNorm(vCross(d, [0, 1, 0]));
  const qa = project(a); if (!qa) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (t < ch) { const u = t / ch, L = .9 * u * (o.size || 1); const p0 = proj2(vMad(a, side, -L)), p1 = proj2(vMad(a, side, L)); g.lineCap = 'round';
    for (const [w, c2] of [[22, rgba(col, .35)], [10, rgba(col, .8)], [3.5, '#ffffff']]) { g.lineWidth = w * (qa.s / 120) * (.6 + .4 * Math.sin(t * 60)); g.strokeStyle = c2; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); }
    glow(g, qa.x, qa.y, .8 * qa.s * u, col, .5); g.restore(); return; }
  const u = (t - ch) / dur; if (u > 1) { g.restore(); return; } const len = (o.len || 40) * easeOut(Math.min(1, u * 3)), w0 = .45 * (o.size || 1), w1 = (o.spread || 4) * (o.size || 1), fade = 1 - clamp((u - .6) / .4, 0, 1);
  for (const [k, c2] of [[1.15, rgba(col, .25 * fade)], [.75, rgba(col, .6 * fade)], [.3, rgba('#ffffff', .8 * fade)]]) {
    const pts = []; for (let i = 0; i <= 12; i++) { const v = i / 12, wv = lerp(w0, w1, Math.pow(v, .8)) * k * (1 + .05 * Math.sin(v * 30 - t * 60)); pts.push(vMad(vMad(a, d, len * v), side, wv)); } for (let i = 12; i >= 0; i--) { const v = i / 12, wv = lerp(w0, w1, Math.pow(v, .8)) * k; pts.push(vMad(vMad(a, d, len * v), side, -wv)); }
    const sp = projPoly(pts); if (sp.length > 2) { polyPath(g, sp); g.fillStyle = c2; g.fill(); } }
  glow(g, qa.x, qa.y, 1.2 * qa.s, '#ffffff', .6 * fade); g.restore();
}
function fxSenjuKoten(g, c, b, t, o = {}) { // Hado #91 Senju Koten Taiho: a thousand light spears appear, aim, fire
  if (t < 0) return; const n = o.n || 36, R = o.r || 3.2, appear = .45, aim = .35, fly = .3;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 1.2 - Math.PI * .1, rr = R * (.6 + .4 * hash(i)), home = vAdd(c, [Math.cos(a) * rr * (hash(i * 3) < .5 ? 1 : -1), Math.sin(a) * rr * .8 + 1.2, (hash(i * 7) - .5) * 1.5]);
    const ti = t - hash(i * 11) * .25, ua = clamp(ti / appear, 0, 1); if (ua <= 0) continue; const tgt = vAdd(b, [(hash(i * 13) - .5) * .8, (hash(i * 17) - .5) * .8, 0]);
    const ul = clamp((ti - appear - aim) / fly, 0, 1), pos = vLerp(home, tgt, easeIn(ul)); if (ul >= 1) continue; const dir = vNorm(vSub(tgt, home)), L = .55 * ua;
    const p0 = proj2(vMad(pos, dir, -L)), p1 = proj2(vMad(pos, dir, L * (1 + ul * 3))), q = project(pos); if (!q) continue;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; for (const [w, c2] of [[.09, rgba('#ffe8a0', .4)], [.04, '#fff8e0']]) { g.lineWidth = Math.max(1.5, w * q.s); g.strokeStyle = c2; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); } g.restore(); }
  const ti = t - appear - aim - fly * .8; if (ti > 0) fxExplosion(g, b, ti, { size: 3.5, pal: 'gold', dur: .8 });
}

// ======================================================================================================== AIZEN
function fxKyokaRelease(g, F, t, o = {}) { // moon + flower reflected on the blade, glints run along the edge
  const sw = swordAt(F, o.ft == null ? t : o.ft); if (!sw || t < 0 || t > (o.dur || 1.2)) return; const u = t / (o.dur || 1.2), m = vLerp(sw.base, sw.tip, .55), q = project(m); if (!q) return; const r = .07 * q.s;
  g.save(); g.globalAlpha = Math.sin(Math.PI * u); g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill(); g.fillStyle = '#cfd8e8'; g.beginPath(); g.arc(q.x + r * .35, q.y - r * .1, r * .85, 0, TAU); g.fill();   // crescent moon
  const fq = project(vLerp(sw.base, sw.tip, .3)); if (fq) { g.translate(fq.x, fq.y); g.scale(r * 1.2, r * 1.2); flowerMotif(g, rgba('#c890ff', .9)); }
  g.restore(); g.save(); g.globalCompositeOperation = 'lighter'; const gp = project(vLerp(sw.base, sw.tip, clamp(u * 1.3, 0, 1))); if (gp) fxImpactStar(g, gp.x, gp.y, .25 * gp.s, t * 3, '#ffffff', 4); g.restore();
}
function fxKyokaIllusion(g, F, ft, t, o = {}) { // the figure was an illusion: it cracks and bursts into mirror shards (draw instead of f.fig)
  if (t > (o.dur || 1.0)) return; const u = clamp(t / (o.dur || 1.0), 0, 1), lay = beginLayer('kyokaFig'); drawFig(lay, F, ft, o.figOpt || {});
  const S = figSkel(F, ft), q = project(S.J.abd); if (!q) return; const cells = SAD_SHARD_CACHE['ill' + (o.seed || 3)] || (SAD_SHARD_CACHE['ill' + (o.seed || 3)] = sadShards(o.seed || 3, 30, { x: W / 2, y: H / 2 }));
  const crack = clamp(t / .15, 0, 1), br = clamp((t - (o.hold || .15)) / .6, 0, 1), src = layer('kyokaFig'), offX = q.x - W / 2, offY = q.y - H / 2;
  if (t < 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 0); g.restore(); return; }
  for (const cl of cells) { const go = clamp(br * 1.4 - cl.d / 1600, 0, 1), dx = (cl.c[0] - W / 2) * .5 * go, dy = (cl.c[1] - H / 2) * .5 * go + 300 * go * go, rot = (cl.h - .5) * 2 * go;
    g.save(); g.translate(offX + cl.c[0] + dx, offY + cl.c[1] + dy); g.rotate(rot); g.translate(-(offX + cl.c[0]), -(offY + cl.c[1])); g.translate(offX, offY); polyPath(g, cl.poly); g.translate(-offX, -offY); g.save(); g.clip(); g.globalAlpha = 1 - go * .7; g.drawImage(src, 0, 0, W, H); g.fillStyle = rgba('#e8e0ff', .25 * cl.h * crack); g.fillRect(0, 0, W, H); g.restore();
    if (crack > 0) { g.translate(offX, offY); polyPath(g, cl.poly); g.translate(-offX, -offY); g.save(); g.clip(); g.restore(); g.lineWidth = 1.6; g.strokeStyle = rgba('#ffffff', .9 * (1 - go)); g.translate(offX, offY); g.stroke(); } g.restore(); }
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 1.4 * q.s, '#e0d0ff', .4 * Math.sin(Math.PI * u)); g.restore();
}
function fxShimmer(g, c, t, o = {}) { const q = sadQ(c); if (!q || t < 0) return; const n = o.n || 18, R = (o.r || 1.6) * (Array.isArray(c) ? q.s : 100);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const ph = (t * (o.rate || 1.4) + hash(i)) % 1, x = q.x + (hash(i * 3) - .5) * R * 2, y = q.y + (hash(i * 5) - .5) * R * 1.4, a = Math.sin(Math.PI * ph); fxImpactStar(g, x, y, 6 + 18 * a * hash(i * 7), i, rgba('#ffffff', a), 4); }
  if (Array.isArray(c)) for (let i = 0; i < 3; i++) { const uu = ((t * .7 + i / 3) % 1); fxShockRing(g, [c[0], .02, c[2]], uu * .9, { r: o.ring || 3, dur: .9, w: .05, col: '#dfe8ff', alpha: .5, ink: 0 }); }
  g.restore(); }
function fxKidoScript(g, c, t, o = {}) { // ring(s) of kido writing in a plane (o.up), o.shatter = time the glyphs break
  if (t < 0) return; const up = o.up || [0, 1, 0], R = (o.r || 1.6) * easeOut(clamp(t / .25, 0, 1)), col = o.col || '#c89aff', text = o.text || '黒棺縛道破道封天地鉄泥人形虚', M = mFromY(up, Math.abs(up[1]) > .9 ? [1, 0, 0] : [0, 1, 0]);
  const sh = o.shatter != null ? clamp((t - o.shatter) / .6, 0, 1) : 0, ng = o.n || 18;
  g.save(); g.globalAlpha = o.alpha == null ? 1 : o.alpha;
  if (sh < .05) { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; pts.push(vAdd(c, vAdd(vMul(M[0], Math.cos(a) * R * 1.12), vMul(M[2], Math.sin(a) * R * 1.12)))); } for (const rn of projLine(pts)) { polyPath(g, rn, false); g.lineWidth = 2.5; g.strokeStyle = col; g.stroke(); } }
  for (let i = 0; i < ng; i++) { const a = i / ng * TAU + t * (o.spin || .4), p0 = vAdd(c, vAdd(vMul(M[0], Math.cos(a) * R), vMul(M[2], Math.sin(a) * R))), hh = hash(i * 9);
    const p = vAdd(p0, [(hh - .5) * sh * 1.5, -sh * sh * 3 * (.5 + hh), (hash(i * 4) - .5) * sh * 1.5]);
    const tu = vMul(vAdd(vMul(M[0], -Math.sin(a)), vMul(M[2], Math.cos(a))), R * .13), tv = vMul(M[1], R * .13);
    decal(g, p, tu, tv, cc => { cc.rotate(sh * (hh - .5) * 6); if (sh > 0) { cc.beginPath(); cc.rect(-.6, -.6, 1.2, 1.2 * (1 - sh * hh)); cc.clip(); } cc.fillStyle = sh > 0 ? mixHex(col, '#ffffff', sh) : col; cc.globalAlpha = 1 - sh; cc.font = '900 1.1px "IPAMincho", "IPAGothic", serif'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.scale(1, -1); cc.fillText(text[i % text.length], 0, 0); }, -2); }
  g.restore();
}
function fxKurohitsugi(g, c, t, o = {}) { // Hado #90: black coffin with violet edges assembles around the target, spears pierce, collapse
  if (t < 0) return; const sz = o.size || [1.7, 2.7, 1.7], [hx, hy, hz] = [sz[0] / 2, sz[1], sz[2] / 2], asm = o.assemble || .45, endT = o.shatter == null ? 1.6 : o.shatter, u = clamp(t / asm, 0, 1);
  const crush = clamp((t - endT) / .5, 0, 1); if (crush >= 1) return;
  const walls = [ // [center offset, normal, u-axis, v-axis, half sizes]
    [[0, hy / 2, hz], [0, 0, 1], [1, 0, 0], [0, 1, 0], hx, hy / 2], [[0, hy / 2, -hz], [0, 0, -1], [-1, 0, 0], [0, 1, 0], hx, hy / 2],
    [[hx, hy / 2, 0], [1, 0, 0], [0, 0, -1], [0, 1, 0], hz, hy / 2], [[-hx, hy / 2, 0], [-1, 0, 0], [0, 0, 1], [0, 1, 0], hz, hy / 2], [[0, hy, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1], hx, hz]];
  const items = walls.map((w, i) => { const wi = clamp((u - i * .12) / .5, 0, 1), rise = (1 - easeOut(wi)) * (i === 4 ? 2.5 : 0), slide = (1 - easeOut(wi)) * (i < 4 ? 1.6 : 0);
    const ctr = vAdd(c, vAdd(w[0], vAdd(vMul(w[1], slide), [0, rise - (i < 4 ? (1 - wi) * hy * .6 : 0), 0]))), scl = 1 - crush * .5;
    const P = (a, b) => vAdd(ctr, vAdd(vMul(w[2], a * w[4] * scl), vMul(w[3], b * w[5] * scl)));
    return { w, wi, ctr, P, z: camDepth(ctr), facing: vDot(w[1], toCam(ctr)) }; }).filter(it => it.wi > 0);
  items.sort((a, b) => b.z - a.z);
  g.save();
  for (const it of items) { const corners = [it.P(-1, -1), it.P(1, -1), it.P(1, 1), it.P(-1, 1)], sp = projPoly(corners); if (sp.length < 3) continue;
    polyPath(g, sp); g.fillStyle = it.facing > 0 ? '#0c0a10' : '#16121c'; g.globalAlpha = it.wi; g.fill(); g.globalAlpha = 1;
    g.save(); g.clip(); // inner grid + violet energy seams
    g.strokeStyle = rgba('#5a2a8a', .6); g.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { for (const rn of projLine([it.P(k / 3, -1), it.P(k / 3, 1)])) { polyPath(g, rn, false); g.stroke(); } for (const rn of projLine([it.P(-1, k / 3), it.P(1, k / 3)])) { polyPath(g, rn, false); g.stroke(); } }
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; polyPath(g, sp); const fl = .6 + .4 * Math.sin(t * 40 + it.z); g.lineWidth = 12; g.strokeStyle = rgba(SADFX.violet, .5 * fl); g.stroke(); g.lineWidth = 5; g.strokeStyle = rgba('#b070ff', .8 * fl); g.stroke(); g.lineWidth = 2; g.strokeStyle = rgba('#e8d0ff', .9 * fl); g.stroke(); g.restore();
    polyPath(g, sp); g.lineWidth = 1.5; g.strokeStyle = '#000'; g.stroke(); }
  // spears punching through the walls (inward spears; their butts burst out of the surfaces)
  if (t > asm) { const ts = t - asm; for (let i = 0; i < (o.spears || 16); i++) { const wall = walls[i % 4], born = hash(i * 7) * .5; if (ts < born) continue; const uu = clamp((ts - born) / .12, 0, 1), a = (hash(i * 3) * 2 - 1) * .8, b = (hash(i * 5) * 2 - 1) * .8;
      const ctr = vAdd(c, wall[0]), base = vAdd(ctr, vAdd(vMul(wall[2], a * wall[4]), vMul(wall[3], b * wall[5]))), tip = vMad(base, wall[1], -(.9 + hash(i) * .6) * uu), butt = vMad(base, wall[1], (.7 + hash(i * 9) * .6) * uu);
      if (vDot(wall[1], toCam(base)) > 0) { const pb = proj2(base), pt = proj2(butt), qq = project(base); if (!qq) continue; g.lineCap = 'butt'; g.lineWidth = Math.max(3, .11 * qq.s); g.strokeStyle = '#08060a'; g.beginPath(); g.moveTo(pb[0], pb[1]); g.lineTo(pt[0], pt[1]); g.stroke(); g.lineWidth = Math.max(1, .025 * qq.s); g.strokeStyle = '#c890ff'; g.stroke(); } } }
  // gravity swirl + kido writing band
  if (t > asm * .5) fxKidoScript(g, vAdd(c, [0, .05, 0]), t - asm * .5, { r: Math.max(hx, hz) * 1.6, col: '#b880ff', text: '黒棺', n: 16, spin: .6, shatter: o.scriptShatter, alpha: 1 - crush });
  if (crush > 0) fxDebris(g, vAdd(c, [0, hy * .5, 0]), (t - endT), { n: 30, kind: 'rock', col: '#141018' });
  g.restore();
}
function fxDanku(g, c, n, t, o = {}) { // Bakudo #81 Danku: transparent hexagonal wall (crystal)
  if (t < 0 || t > (o.dur || 1.5)) return; const grow = easeOut(clamp(t / .15, 0, 1)), R = (o.r || 1.6) * grow; let side = vNorm(vCross(n, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, n);
  const hex = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; hex.push(vAdd(c, vAdd(vMul(side, Math.cos(a) * R), vMul(up, Math.sin(a) * R * 1.15)))); }
  const sp = projPoly(hex); if (sp.length < 3) return; g.save(); polyPath(g, sp); g.fillStyle = 'rgba(200,230,255,.18)'; g.fill(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 4; g.strokeStyle = 'rgba(190,225,255,.75)'; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = '#ffffff'; g.stroke();
  const q = project(c); if (q) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); g.lineTo(sp[3][0], sp[3][1]); g.stroke(); } g.restore(); }
function fxByakurai(g, a, b, t, o = {}) { if (t < 0 || t > (o.dur || .35)) return; fxLightning(g, a, b, t, Object.assign({ col: '#ffffff', w: 6, glow: '#cfe0ff' }, o)); const q = sadQ(a); if (q) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, .5 * q.s, '#ffffff', .9); g.restore(); } }
function fxHogyoku(g, c, t, o = {}) { // violet glow orb (mode 'orb'), sinking into the body ('fuse'), violet pillar ('pillar')
  if (t < 0) return; const q = sadQ(c); if (!q) return; const mode = o.mode || 'orb';
  if (mode === 'pillar') { fxPillar(g, c, t, { col: SADFX.violet, r: o.r || 2.2, h: o.h || 60, rise: .4 }); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 4 * q.s, SADFX.violet, .5); g.restore(); return; }
  const r = (o.r || .05) * (Array.isArray(c) ? q.s : 100), pulse = .7 + .3 * Math.sin(t * 6);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, r * 9 * pulse, SADFX.violet, .45); glow(g, q.x, q.y, r * 3, '#f0dcff', .5);
  for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * 1.05, L = r * (5 + 3 * Math.sin(t * 3 + i)); g.strokeStyle = rgba('#c890ff', .5); g.lineWidth = Math.max(1, r * .2); g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo(q.x + Math.cos(a) * L * .6, q.y + Math.sin(a) * L * .6 - L * .3, q.x + Math.cos(a + .5) * L, q.y + Math.sin(a + .5) * L); g.stroke(); }
  g.restore();
  if (mode === 'fuse') { const u = clamp(t / (o.dur || .8), 0, 1); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const rr = r * (1 + (u * 3 + i) % 3 * 6); g.lineWidth = 3; g.strokeStyle = rgba('#d8b0ff', .6 * (1 - ((u * 3 + i) % 3) / 3)); g.beginPath(); g.arc(q.x, q.y, rr, 0, TAU); g.stroke(); } g.restore(); }
}
function fxHogyokuCocoon(g, F, ft, t, o = {}) { // white casing ribbons spiral up and wrap the figure (draw over the figure)
  if (t < 0) return; const S = figSkel(F, ft), k = S.B.h / 1.8, base = vAdd(S.J.pelvis, [0, -S.J.pelvis[1], 0]), u = clamp(t / (o.dur || 1.2), 0, 1), Hh = S.B.h * 1.05;
  g.save(); for (let rI = 0; rI < (o.n || 5); rI++) { const pts = [], ws = []; for (let i = 0; i <= 40; i++) { const v = i / 40; if (v > u * 1.2 - rI * .05) break; const a = v * 9 + rI * 1.26 + t * 2, rad = (.32 - .08 * Math.sin(v * Math.PI)) * k * (1.15 - .1 * u); const p = vAdd(base, [Math.cos(a) * rad, v * Hh, Math.sin(a) * rad]); pts.push(proj2(p)); ws.push(.07 * k * pxScale(p)); }
    if (pts.length < 2) continue; polyPath(g, catmull(ribbon2D(pts, ws), true, 1)); g.fillStyle = '#f4f2f0'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#3a2a4a'; g.stroke(); }
  g.restore();
}
function fxAizenAura(g, F, t, o = {}) { fxAura(g, F, t, Object.assign({ col: '#7a2ad0', col2: '#e8d0ff', size: .6, inkCol: '#2a0848' }, o)); }
function fxAizenPressure(g, c, t, o = {}) { // violet reiatsu crushing down: cracks, crater, falling pressure streaks, rising violet haze
  if (t < 0) return; fxPressure(g, c, t, { r: o.r || 6, col: '#d8b8ff', seed: o.seed || 91 }); const q = sadQ(c); if (!q) return;
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = q.x + (hash(i * 3) - .5) * W * .9, ph = (t * 2.2 + hash(i)) % 1, y = ph * H * 1.2 - 100; g.strokeStyle = rgba('#b48aff', .25 * (1 - ph)); g.lineWidth = 2 + 3 * hash(i * 5); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 80 + 120 * hash(i * 7)); g.stroke(); }
  const gr = g.createLinearGradient(0, q.y, 0, q.y - H * .6); gr.addColorStop(0, rgba(SADFX.violet, .3 * (o.amt || 1))); gr.addColorStop(1, rgba(SADFX.violet, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
function fxAizenFinal(g, c, t, o = {}) { // final fusion eruption: blood + violet reiatsu + black tendrils lashing out
  if (t < 0) return; const q = sadQ(c); if (!q) return; const u = clamp(t / (o.dur || 1.5), 0, 1), s = Array.isArray(c) ? q.s : 100;
  fxBloodSpray(g, c, [0, 1, 0], t, { n: 40, speed: 7, size: 1.4 });
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 3.5 * s * easeOut(Math.min(1, u * 2)), SADFX.violet, .4 * (1 - u)); g.restore();
  g.save(); for (let i = 0; i < (o.n || 9); i++) { const a = hash(i * 5) * TAU, L = (2 + 3 * hash(i)) * s * easeOut(clamp(t * 2 - hash(i) * .3, 0, 1)), pts = []; for (let k = 0; k <= 10; k++) { const v = k / 10; pts.push([q.x + Math.cos(a + Math.sin(v * 5 + t * 4 + i) * .4) * L * v, q.y + Math.sin(a + Math.sin(v * 5 + t * 4 + i) * .4) * L * v * .7]); }
    inkPts(g, pts, Math.max(4, .25 * s), '#120c18', [.05, .95]); } g.restore();
  fxShockRing(g, Array.isArray(c) ? [c[0], .05, c[2]] : c, t, { r: 9, dur: .7, col: '#d8b8ff' });
}
function fxFragor(g, a, b, t, o = {}) { // small bluish-purple energy ball flies a->b, then a towering columnar explosion
  if (t < 0) return; const fly = o.fly || .35;
  if (t < fly) { const p = vLerp(a, b, easeIn(t / fly)), q = project(p); if (q) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, .9 * q.s, '#8a8aff', .8); glow(g, q.x, q.y, .35 * q.s, '#ffffff', 1); g.restore(); } return; }
  const tt = t - fly, dur = o.dur || 1.8, u = clamp(tt / dur, 0, 1); if (u >= 1) return; const q0 = project(b); if (!q0) return; const Hh = (o.h || 45) * easeOut(Math.min(1, u * 2.5)), w = (o.r || 5);
  const top = project(vAdd(b, [0, Hh, 0])); if (!top) return; const s0 = q0.s, fade = 1 - clamp((u - .7) / .3, 0, 1);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [k, c2] of [[1.5, rgba('#6a5aff', .4 * fade)], [1, rgba('#b8a8ff', .7 * fade)], [.45, rgba('#ffffff', .95 * fade)]]) { g.beginPath(); g.moveTo(q0.x - w * s0 * k, q0.y); g.quadraticCurveTo(q0.x - w * s0 * k * .4, (q0.y + top.y) / 2, top.x - w * s0 * k * .7, top.y); g.lineTo(top.x + w * s0 * k * .7, top.y); g.quadraticCurveTo(q0.x + w * s0 * k * .4, (q0.y + top.y) / 2, q0.x + w * s0 * k, q0.y); g.closePath(); g.fillStyle = c2; g.fill();
    g.beginPath(); g.ellipse(top.x, top.y, w * s0 * k * 2.2, w * s0 * k * 1.1, 0, 0, TAU); g.fill(); }
  g.restore(); fxShockRing(g, [b[0], .05, b[2]], tt, { r: 22, dur: 1.2, col: '#d0c8ff' }); fxSmoke(g, b, tt, { n: 14, size: 4, col: '#4a3a6a' });
}

// ======================================================================================================== DAZAI
function fxNoLongerHuman(g, p, t, o = {}) { // touch: white-blue wave + page lines + 人間失格 glyphs drifting off
  if (t < 0 || t > (o.dur || 1.2)) return; const q = sadQ(p); if (!q) return; const u = t / (o.dur || 1.2), s = Array.isArray(p) ? q.s : 100, R = (o.r || 3) * s * easeOut(Math.min(1, u * 1.8));
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, .7 * s, '#ffffff', .9 * (1 - u)); glow(g, q.x, q.y, R * .6, SADFX.nlh, .35 * (1 - u));
  g.lineWidth = 5 * (1 - u) + 1; g.strokeStyle = rgba('#ffffff', .9 * (1 - u)); g.beginPath(); g.ellipse(q.x, q.y, R, R * .62, 0, 0, TAU); g.stroke(); g.lineWidth = 2; g.strokeStyle = rgba(SADFX.nlh, .7 * (1 - u)); g.beginPath(); g.ellipse(q.x, q.y, R * .8, R * .5, 0, 0, TAU); g.stroke();
  // ruled page lines sweeping out
  g.strokeStyle = rgba('#e8f2ff', .45 * (1 - u)); g.lineWidth = 1.5; for (let i = -5; i <= 5; i++) { const y = q.y + i * R * .09, L = R * (.5 + .5 * Math.cos(i * .3)); g.beginPath(); g.moveTo(q.x - L, y); g.lineTo(q.x + L, y); g.stroke(); }
  g.restore();
  g.save(); g.font = `700 ${Math.max(14, .16 * s).toFixed(0)}px "IPAMincho", "IPAGothic", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < (o.n || 12); i++) { const a = hash(i * 3) * TAU, d = R * (.3 + .9 * u) * (.5 + hash(i * 5)), x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .6 - u * s * .6; g.globalAlpha = (1 - u) * .9; g.fillStyle = i % 3 ? '#f4f8ff' : '#9ac8ff'; g.save(); g.translate(x, y); g.rotate((hash(i) - .5) * u * 2); g.fillText('人間失格'[i % 4], 0, 0); g.restore(); } g.restore();
}
function fxSnuff(g, p, t, o = {}) { // an effect 'goes out like a candle': the flame shrinks to a wick, a smoke thread curls up
  if (t < 0 || t > (o.dur || 1.4)) return; const q = sadQ(p); if (!q) return; const s = (Array.isArray(p) ? q.s : 100) * (o.size || 1), u = t / (o.dur || 1.4), fl = clamp(1 - u * 3, 0, 1), col = o.col || '#ffb050';
  if (fl > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const h = .5 * s * fl, w = .16 * s * fl; g.beginPath(); g.moveTo(q.x - w, q.y); g.quadraticCurveTo(q.x - w, q.y - h * .6, q.x + Math.sin(t * 20) * w * .3, q.y - h); g.quadraticCurveTo(q.x + w, q.y - h * .6, q.x + w, q.y); g.closePath(); g.fillStyle = rgba(col, .9); g.fill(); glow(g, q.x, q.y - h * .4, h * 1.5, col, .4 * fl); g.restore(); }
  const pts = []; for (let i = 0; i <= 14; i++) { const v = i / 14; if (v > u * 1.3) break; pts.push([q.x + Math.sin(v * 7 + t * 2) * .12 * s * v, q.y - v * 1.4 * s]); }
  if (pts.length > 1) { g.save(); g.globalAlpha = .7 * (1 - u); inkPts(g, pts, Math.max(2, .035 * s), '#d8d8e0', [.1, .9]); g.restore(); }
}
function fxKidoShatter(g, c, t, o = {}) { fxKidoScript(g, c, t + (o.pre || .4), Object.assign({ shatter: o.pre || .4 }, o)); }
function sadGunMuzzle(F, t) { const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sd = S.pose.gunHand || 'R', hg = handGeom(S, sd, S.pose['h' + sd] || 'grip'); if (!hg) return null; const k = S.B.h / 1.8, fwd = vMul(hg.Y, -1), up = vNorm(hg.Z);
  return { p: vAdd(hg.palmC, vAdd(vMul(fwd, .15 * k), vMul(up, .05 * k))), dir: fwd }; }
function fxDazaiGun(g, F, t, o = {}) { // muzzle flash (4-point star), smoke, tracer to o.to, ejected shell
  if (t < 0 || t > (o.dur || .5)) return; const m = o.muzzle || sadGunMuzzle(F, o.ft == null ? t : o.ft); if (!m) return; const q = project(m.p); if (!q) return; const u = t / (o.dur || .5);
  g.save(); g.globalCompositeOperation = 'lighter';
  if (t < 2 / 24) { const r = .35 * q.s; fxImpactStar(g, q.x, q.y, r, .3, '#fff6c8', 4); fxImpactStar(g, q.x, q.y, r * .55, 1.0, '#ffffff', 4); glow(g, q.x, q.y, r * 1.8, '#ffb040', .8); }
  if (o.to && t < .12) { const a = proj2(m.p), b = proj2(o.to); g.lineWidth = Math.max(1.5, .02 * q.s); g.strokeStyle = rgba('#fff2c0', 1 - t / .12); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], clamp(t / .04, 0, 1)), lerp(a[1], b[1], clamp(t / .04, 0, 1))); g.stroke(); }
  g.restore(); fxSmoke(g, m.p, t, { n: 4, size: .25, col: '#c8c4c0', dur: o.dur || .5 });
  const sh = vAdd(m.p, vAdd([Math.cos(1.2) * u * .5, .3 * u - 2 * u * u, .2 * u], [0, 0, 0])), sq = project(sh); if (sq) { g.save(); g.translate(sq.x, sq.y); g.rotate(t * 30); g.fillStyle = '#e8b848'; g.fillRect(-.02 * sq.s, -.008 * sq.s, .04 * sq.s, .016 * sq.s); g.restore(); }
}
function fxRicochet(g, p, t, o = {}) { if (t < 0 || t > (o.dur || .3)) return; fxSparks(g, p, t, { n: 14, dur: o.dur || .3, col: '#fff2c0' }); const q = sadQ(p); if (!q) return; const u = t / (o.dur || .3);
  g.save(); g.globalCompositeOperation = 'lighter'; fxImpactStar(g, q.x, q.y, .3 * (Array.isArray(p) ? q.s : 100) * (1 - u), .6, '#ffffff', 4); g.strokeStyle = rgba('#ffffff', 1 - u); g.lineWidth = 2; for (let i = 0; i < 3; i++) { const a = -1.1 + i * .5, r0 = 30 + u * 40; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 22), q.y + Math.sin(a) * (r0 + 22)); g.stroke(); } g.restore(); }
function fxPageTurn(g, t, o = {}) { // screen-space page turn: a paper sheet with ruled text lines curls across (Dazai's 'script')
  const dur = o.dur || .6, u = t / dur; if (u < 0 || u > 1) return; const e = easeInOut ? easeInOut(u) : u, x = W * (1.1 - e * 1.3), curl = 160;
  g.save(); g.fillStyle = o.under || 'rgba(0,0,0,0)'; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x - curl, H / 2, x + curl * .4, H); g.lineTo(W + 10, H); g.lineTo(W + 10, 0); g.closePath(); g.fillStyle = o.paper || '#f2ece0'; g.fill();
  g.save(); g.clip(); g.strokeStyle = rgba('#8a7a6a', .4); g.lineWidth = 2; for (let y = 60; y < H; y += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(W, y); g.stroke(); } g.fillStyle = rgba('#3a3028', .55); g.font = '600 30px "IPAMincho", serif'; for (let i = 0; i < 18; i++) g.fillText(o.text || '人間失格', x + 80 + (i % 3) * 400, 100 + Math.floor(i / 3) * 132);
  const gr = g.createLinearGradient(x - curl, 0, x + 60, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(x - curl, 0, curl + 60, H); g.restore();
  g.lineWidth = 3; g.strokeStyle = '#2a2420'; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x - curl, H / 2, x + curl * .4, H); g.stroke(); g.restore();
}
// ======================================================================================================== WATER (canal / harbour)
function fxWaterSplash(g, p, t, o = {}) { // vertical column splash: white crown sheet + droplets + ring on the water (p on the surface)
  const dur = o.dur || 1.1, u = t / dur; if (u < 0 || u > 1) return; const q = project(p); if (!q) return; const H2 = (o.h || 4) * Math.sin(Math.PI * Math.min(1, u * 1.4)), R = (o.r || 1.2);
  g.save(); for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, rr = R * (.4 + .6 * hash(i)), hh = H2 * (.5 + .6 * hash(i * 3)), top = project(vAdd(p, [Math.cos(a) * rr * (1 + u), hh, Math.sin(a) * rr * (1 + u)])), b = project(vAdd(p, [Math.cos(a) * rr * .5, 0, Math.sin(a) * rr * .5])); if (!top || !b) continue;
    g.fillStyle = rgba(i % 3 ? '#e8f4ff' : '#9ac8e8', .85 * (1 - u * .6)); g.beginPath(); g.moveTo(b.x - .1 * b.s, b.y); g.quadraticCurveTo(top.x, (top.y + b.y) / 2, top.x, top.y); g.lineTo(b.x + .1 * b.s, b.y); g.fill(); }
  for (let i = 0; i < 40; i++) { const a = hash(i * 5) * TAU, v = 2 + 5 * hash(i * 7), tt = u * dur, pp = vAdd(p, [Math.cos(a) * v * .4 * tt, v * tt - 4.9 * tt * tt + H2 * .6, Math.sin(a) * v * .4 * tt]); if (pp[1] < p[1]) continue; const qq = project(pp); if (!qq) continue; g.fillStyle = '#f4faff'; g.beginPath(); g.arc(qq.x, qq.y, Math.max(1, .05 * qq.s), 0, TAU); g.fill(); }
  g.restore(); fxShockRing(g, [p[0], p[1] + .02, p[2]], t, { r: R * 3.5, dur, w: .08, col: '#e8f4ff', alpha: .7 });
}
function fxWaterWall(g, a, b, t, o = {}) { // pressure lifts the water into a wall along a->b (both on the surface)
  const dur = o.dur || 1.2, u = t / dur; if (u < 0 || u > 1) return; const n = 18, H2 = (o.h || 3.5) * Math.sin(Math.PI * Math.min(1, u * 1.2));
  const top = [], bot = []; for (let i = 0; i <= n; i++) { const v = i / n, p = vLerp(a, b, v); bot.push(p); top.push(vAdd(p, [0, H2 * (.7 + .3 * Math.sin(v * 9 + t * 6)) * Math.sin(Math.PI * v), 0])); }
  const sp = projPoly(top.concat(bot.reverse())); if (sp.length < 3) return; g.save(); polyPath(g, sp); g.fillStyle = rgba('#6aa0c8', .55 * (1 - u * .5)); g.fill(); g.lineWidth = 2.5; g.strokeStyle = rgba('#e8f4ff', .9 * (1 - u)); g.stroke();
  for (const rn of projLine(top)) { polyPath(g, rn, false); g.lineWidth = 5; g.strokeStyle = rgba('#ffffff', .8 * (1 - u)); g.stroke(); } g.restore();
}
function fxWaterTrail(g, a, b, t, o = {}) { // shunpo across the water: two furrows of spray
  const u = clamp(t / (o.dur || .4), 0, 1); if (t < 0 || t > (o.life || 1.2)) return; const fade = 1 - clamp((t - (o.dur || .4)) / ((o.life || 1.2) - (o.dur || .4)), 0, 1), d = vNorm(vSub(b, a)), side = vNorm(vCross(d, [0, 1, 0]));
  g.save(); for (const sg of [-1, 1]) { const pts = []; for (let i = 0; i <= 14; i++) { const v = i / 14 * u, p = vAdd(vLerp(a, b, v), vAdd(vMul(side, sg * (.3 + .4 * v)), [0, .15 + .5 * Math.sin(Math.PI * v) * (1 - v * .3), 0])); pts.push(proj2(p)); } inkPts(g, pts, Math.max(3, 12 * fade), rgba('#e8f4ff', .8 * fade), [.2, .1]); } g.restore();
}
function fxBubbles(g, p, t, o = {}) { const q = sadQ(p); if (!q || t < 0) return; const s = Array.isArray(p) ? q.s : 100; g.save(); g.strokeStyle = 'rgba(220,245,255,.85)'; g.lineWidth = 1.4;
  for (let i = 0; i < (o.n || 10); i++) { const ph = (t * (.5 + hash(i) * .5) + hash(i * 3)) % 1, x = q.x + (hash(i * 5) - .5) * .3 * s + Math.sin(t * 4 + i) * .03 * s, y = q.y - ph * (o.rise || 1.2) * s, r = (.02 + .04 * hash(i * 7)) * s; g.globalAlpha = 1 - ph; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); } g.restore(); }
