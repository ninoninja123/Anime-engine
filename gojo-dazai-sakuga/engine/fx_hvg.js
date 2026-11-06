/* engine/fx_hvg.js (agent E, project harry-vs-gojo) - GOJO SATORU effects (Limitless / Six Eyes / Domain) + screen processes.
   t = the effect's own time (lt - start).  Positions: world point [x,y,z] (projected) or screen {x,y} (1920x1080).
   GOJO
     fxInfinity(g, c, t, {r, alpha, hue, ripples:[{t0, p}], dur})        the invisible wall: thin refracting shell, slow rings, contact ripples
     fxInfinityStop(g, c, items, t, {r, k})                              objects decelerate asymptotically and freeze before the shell
                                                                         items: [{from:[x,y,z], kind:'spark'|'shard'|'bolt'|'fist'|'orb', col, t0, size}]
     fxBlue(g, c, t, {r, dur, debris, n, grow})                          Lapse: Blue - blue attraction orb, inward spiral streaks, debris pulled in
     fxRed(g, a, dir, t, {r, charge, travel, speed, dur})                Reversal: Red - crimson orb at the fingertip, then a repulsion blast along dir
     fxHollowPurple(g, a, dir, t, {r, charge, len, speed, side, trench}) Hollow Purple - Blue + Red merge (charge s), giant violet sphere + erasure path
     fxBlackFlash(g, p, t, {size, dir, n})                               black lightning arcs with red glow + distortion flash
     fxRCT(g, F, t, {k})                                                 Reverse Cursed Technique: green/white light rising from the body
     fxSixEyes(g, F, t, {k, streak})                                     anamorphic blue streaks from the eyes (close-ups)
     fxFlashStep(g, a, b, t, {col})                                      teleport streak + dust ring (use with f.fig afterimages)
     fxDomainHand(g, F, t, {k})                                          glow at the crossed fingers before Domain Expansion
   SCREEN PROCESSES (call directly in the shot, NOT inside f.fx; they run after grade, before impact)
     gojoWarp(f, t, {at, r, k, twist})                                   space bends toward a point (Blue): radial pinch + twist
     gojoDomainWipe(f, t, {at, dur, hold})                               Unlimited Void opens: a black sphere grows from 'at' revealing star space
     gojoInfoOverload(f, t, {k, seed, white})                            'information overload': flickering glyph streams, scanlines, whiteout pulses
     gojoVoidScreen(f, t, {k})                                           the whole frame becomes endless space (stars + infinite light lattice)
   Drawing helpers: hvQ(p) projection, hvBeam2D(g, a, b, w, col, core, alpha), hvOrb(g, q, R, cols, t)                        */
'use strict';
const HVFX = { blue: '#3aa8ff', blue2: '#9be2ff', red: '#ff2a3c', red2: '#ff9a8a', purple: '#a24cff', purple2: '#e0b8ff', core: '#ffffff', ink: '#120a1a', heal: '#a8ffcf', void: '#05030c' };
function hvQ(p) { if (!p) return null; if (Array.isArray(p)) { const q = project(p); return q ? { x: q.x, y: q.y, s: q.s } : null; } return { x: p.x, y: p.y, s: p.s || 100 }; }
function hvBeam2D(g, a, b, w, col, core, alpha = 1) {
  g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter'; g.globalAlpha = alpha;
  g.strokeStyle = rgba(col, .25); g.lineWidth = w * 3.2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  g.strokeStyle = rgba(col, .75); g.lineWidth = w * 1.5; g.stroke(); g.strokeStyle = core || '#fff'; g.lineWidth = w * .55; g.stroke(); g.restore();
}
// layered energy orb: ink rim, colour body, bright core, rotating arcs
function hvOrb(g, q, R, cols, t, o = {}) {
  if (R < 1) return; g.save();
  g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * (o.halo || 3.2), cols[0], o.haloA || .45); glow(g, q.x, q.y, R * 1.6, cols[1], .5);
  g.globalCompositeOperation = 'source-over';
  if (o.ink !== false) { g.beginPath(); g.arc(q.x, q.y, R * 1.04, 0, TAU); g.lineWidth = Math.max(2, R * .09); g.strokeStyle = HVFX.ink; g.stroke(); }
  const gr = g.createRadialGradient(q.x - R * .2, q.y - R * .25, R * .05, q.x, q.y, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, cols[1]); gr.addColorStop(.8, cols[0]); gr.addColorStop(1, o.edge || shadeHex(cols[0], -.35));
  g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill();
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < (o.arcs || 4); i++) { const a0 = t * (o.spin || 5) * (i % 2 ? -1 : 1) + i * 1.7, rr = R * (.55 + .12 * i); g.strokeStyle = rgba('#ffffff', .55); g.lineWidth = Math.max(1, R * .05); g.beginPath(); g.ellipse(q.x, q.y, rr, rr * (.35 + .15 * i), i * .8 + t, a0, a0 + 2.2); g.stroke(); }
  g.restore();
}

// =========================================================================================================== INFINITY
function fxInfinity(g, c, t, o = {}) {
  const q = hvQ(c); if (!q || t < 0) return; const dur = o.dur || 99, fade = clamp(Math.min(t / .25, (dur - t) / .3), 0, 1); if (fade <= 0) return;
  const R = (o.r || 1.4) * q.s, a = (o.alpha == null ? 1 : o.alpha) * fade, col = o.col || '#bfe8ff';
  g.save(); g.globalCompositeOperation = 'lighter';
  // thin fresnel shell: bright rim, faint body
  const gr = g.createRadialGradient(q.x, q.y, R * .6, q.x, q.y, R); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(.86, rgba(col, .06 * a)); gr.addColorStop(.97, rgba(col, .32 * a)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill();
  // slowly turning concentric rings (the 'convergence' of infinitely many halvings): spacing halves toward the rim
  g.lineWidth = Math.max(1, R * .006); for (let i = 1; i < 7; i++) { const rr = R * (1 - Math.pow(.55, i)); g.strokeStyle = rgba(col, .12 * a * (1 - i / 9)); const ph = t * .4 * (i % 2 ? 1 : -1); g.beginPath(); g.ellipse(q.x, q.y, rr, rr * .96, ph, 0, TAU); g.stroke(); }
  // short refraction glints running round the rim
  for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + t * .7; g.strokeStyle = rgba('#ffffff', .4 * a * (.5 + .5 * Math.sin(t * 3 + i))); g.lineWidth = Math.max(1, R * .012); g.beginPath(); g.arc(q.x, q.y, R * .985, an, an + .18); g.stroke(); }
  // contact ripples
  for (const rp of (o.ripples || [])) { const u = (t - rp.t0) / .6; if (u < 0 || u > 1) continue; const p = hvQ(rp.p) || q; for (let k = 0; k < 3; k++) { const rr = (R * .08 + R * .45 * u) * (1 + k * .35); g.strokeStyle = rgba('#e8f8ff', .7 * (1 - u) * a / (k + 1)); g.lineWidth = Math.max(1.5, R * .02 * (1 - u)); g.beginPath(); g.ellipse(p.x, p.y, rr, rr * .7, Math.atan2(p.y - q.y, p.x - q.x) + HP, 0, TAU); g.stroke(); } }
  g.restore();
}
// objects approaching the shell: distance to the surface keeps halving (x(t) = r + d0 * 2^(-t*k)), streak shortens, they tremble when 'frozen'
function fxInfinityStop(g, c, items, t, o = {}) {
  const qc = hvQ(c); if (!qc) return; const r = o.r || 1.4, k = o.k || 6;
  for (const it of items) { const tt = t - (it.t0 || 0); if (tt < 0) continue;
    const from = it.from, d = vSub(from, c), d0 = vLen(d) - r, dir = vNorm(d), dist = r + d0 * Math.pow(2, -tt * k), p = vMad(c, dir, dist), q = hvQ(p); if (!q) continue;
    const speed = d0 * k * Math.LN2 * Math.pow(2, -tt * k), tail = vMad(p, dir, Math.min(1.8, speed * .06) + .02), qt = hvQ(tail) || q, col = it.col || '#ffd27a', sz = (it.size || .06) * q.s;
    const jit = speed < .4 ? Math.sin(tt * 90 + hash(from[0]) * 9) * 1.2 : 0;
    g.save(); g.translate(jit, -jit * .5);
    if (it.kind === 'shard') { g.fillStyle = col; g.strokeStyle = HVFX.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(q.x - sz, q.y - sz * .4); g.lineTo(q.x + sz * .8, q.y - sz * .6); g.lineTo(q.x + sz * .3, q.y + sz * .7); g.closePath(); g.fill(); g.stroke(); }
    else if (it.kind === 'orb' || it.kind === 'bolt') { hvBeam2D(g, qt, q, Math.max(2, sz * .5), col, '#fff', .9); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, sz * 3, col, .6); }
    else { g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(col, .9); g.lineCap = 'round'; g.lineWidth = Math.max(1.5, sz * .35); g.beginPath(); g.moveTo(qt.x, qt.y); g.lineTo(q.x, q.y); g.stroke(); glow(g, q.x, q.y, sz * 1.6, col, .5); }
    if (speed < 1.5) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#dff6ff', .35 * (1 - speed / 1.5)); g.lineWidth = 1.2; g.beginPath(); g.arc(q.x, q.y, sz * 2.2, 0, TAU); g.stroke(); }
    g.restore(); }
}

// =========================================================================================================== BLUE
function fxBlue(g, c, t, o = {}) {
  const q = hvQ(c); if (!q || t < 0) return; const dur = o.dur || 2.5; if (t > dur + .4) return;
  const grow = easeOut(clamp(t / (o.grow || .35), 0, 1)), fade = clamp((dur + .4 - t) / .4, 0, 1), R = (o.r || .35) * q.s * grow * (1 + .05 * Math.sin(t * 30));
  g.save();
  // inward spiral streaks (space being dragged in)
  const n = o.n || 26, rr = rng(o.seed || 3); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a0 = rr() * TAU, sp = .8 + rr(), ph = (t * sp + rr()) % 1, d0 = R * (5.5 - 4.6 * ph), d1 = d0 * .62, tw = 1.4;
    const pts = []; for (let k = 0; k <= 6; k++) { const s = k / 6, d = lerp(d0, d1, s), a = a0 + tw * (1 - d / (R * 6)) + s * .5; pts.push([q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .8]); }
    polyPath(g, pts, false); g.strokeStyle = rgba(i % 3 ? HVFX.blue : HVFX.blue2, .55 * fade * Math.sin(ph * Math.PI)); g.lineWidth = Math.max(1.2, R * .05 * (1 - ph * .5)); g.stroke(); }
  // debris spiralling in
  if (o.debris !== false) for (let i = 0; i < 14; i++) { const ph = (t * (.5 + hash(i * 3) * .8) + hash(i)) % 1, a = hash(i * 7) * TAU + ph * 4, d = R * (6 - 5.4 * easeIn(ph)), x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .75, s = Math.max(2, R * .08 * (1 - ph * .6));
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#6a6070'; g.strokeStyle = HVFX.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x, y - s * .8); g.lineTo(x + s * .9, y + s * .3); g.closePath(); g.fill(); g.stroke(); }
  hvOrb(g, q, R, [HVFX.blue, HVFX.blue2], t, { halo: 3.6, haloA: .55 * fade, spin: 7, edge: '#0a2a8a' });
  // dark core ring (gravity well)
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = rgba('#05103a', .7 * fade); g.lineWidth = Math.max(2, R * .16); g.beginPath(); g.arc(q.x, q.y, R * 1.35, 0, TAU); g.stroke();
  g.restore();
}
// =========================================================================================================== RED
function fxRed(g, a, dir, t, o = {}) {
  if (t < 0) return; const ch = o.charge == null ? .45 : o.charge, travel = o.travel == null ? 6 : o.travel, sp = o.speed || 28, dur = o.dur || (ch + travel / sp + .6); if (t > dur) return;
  const dn = vNorm(dir), fired = t > ch, ft = t - ch, pos = fired ? vMad(a, dn, Math.min(travel, ft * sp)) : a, q = hvQ(pos); if (!q) return;
  const R = (o.r || .22) * q.s * (fired ? 1.15 : easeOut(clamp(t / ch, 0, 1))) * (1 + .08 * Math.sin(t * 40));
  g.save();
  if (!fired) { // charge: red sparks sucked to the fingertip + kanji-like flare
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const an = hash(i * 5) * TAU + t * 3, d = R * (4 - 3 * ((t * 2 + hash(i)) % 1)); g.strokeStyle = rgba(HVFX.red2, .6); g.lineWidth = 2; g.beginPath(); g.moveTo(q.x + Math.cos(an) * d, q.y + Math.sin(an) * d); g.lineTo(q.x + Math.cos(an) * d * .7, q.y + Math.sin(an) * d * .7); g.stroke(); }
  } else { // repulsion: trail, shock rings travelling with the orb, things pushed away
    const qa = hvQ(a); if (qa) hvBeam2D(g, qa, q, R * .7, HVFX.red, '#ffe0d8', clamp(1 - ft / .5, 0, 1) * .8);
    g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const u = ((ft * 3 + k / 4) % 1), rr = R * (1.3 + u * 4); g.strokeStyle = rgba(HVFX.red2, .6 * (1 - u)); g.lineWidth = Math.max(2, R * .12 * (1 - u)); g.beginPath(); g.arc(q.x, q.y, rr, 0, TAU); g.stroke(); }
    const end = ft > travel / sp; if (end) { const u = (ft - travel / sp) / .6; if (u < 1) { fxExplosion(g, pos, u * .9, { size: (o.r || .22) * 9, pal: 'red', dur: .9, ring: true }); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 14 * (1 - u * .5), HVFX.red, .7 * (1 - u)); } }
  }
  hvOrb(g, q, R, [HVFX.red, HVFX.red2], t, { halo: 3.4, haloA: .55, spin: 9, edge: '#5a0010' });
  g.restore();
}
// =========================================================================================================== HOLLOW PURPLE
function fxHollowPurple(g, a, dir, t, o = {}) {
  if (t < 0) return; const ch = o.charge == null ? 1.0 : o.charge, len = o.len || 40, sp = o.speed || 30, dur = ch + len / sp + 1.2; if (t > dur) return;
  const dn = vNorm(dir), side = vNorm(vCross(dn, [0, 1, 0])), r0 = o.r || 1.6;
  g.save();
  if (t < ch) { // blue + red orbit and merge in front of the hands
    const u = easeIn(clamp(t / ch, 0, 1)), sep = lerp(.9, 0, u) * (o.side || 1), ang = u * 6, pB = vAdd(a, vAdd(vMul(side, Math.cos(ang) * sep), [0, Math.sin(ang) * sep * .4, 0])), pR = vAdd(a, vAdd(vMul(side, -Math.cos(ang) * sep), [0, -Math.sin(ang) * sep * .4, 0]));
    const qb = hvQ(pB), qr = hvQ(pR), qa = hvQ(a); if (qb && qr) {
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(HVFX.purple2, .5 * u); g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(qb.x, qb.y); g.quadraticCurveTo((qb.x + qr.x) / 2 + (hash(k + Math.floor(t * 24)) - .5) * 80, (qb.y + qr.y) / 2 + (hash(k * 3 + Math.floor(t * 24)) - .5) * 80, qr.x, qr.y); g.stroke(); }
      hvOrb(g, qb, .22 * qb.s * (1 - u * .3), [HVFX.blue, HVFX.blue2], t, {}); hvOrb(g, qr, .22 * qr.s * (1 - u * .3), [HVFX.red, HVFX.red2], t, {});
      if (u > .6 && qa) { const k = (u - .6) / .4; hvOrb(g, qa, .5 * qa.s * k, [HVFX.purple, HVFX.purple2], t, { halo: 4, haloA: .6 * k }); } }
  } else { // the sphere travels, erasing everything along its path
    const ft = t - ch, d = Math.min(len, ft * sp), head = vMad(a, dn, d), qh = hvQ(head), qa = hvQ(a), R = r0 * (qh ? qh.s : 100) * (1 + .04 * Math.sin(t * 50)), fade = clamp((dur - t) / 1.0, 0, 1);
    if (qh && qa) {
      // erasure path: a dark violet tube with bright edges (projected as a band with the sphere's projected radius at each end)
      const Ra = r0 * qa.s * .9, ang = Math.atan2(qh.y - qa.y, qh.x - qa.x), nx = -Math.sin(ang), ny = Math.cos(ang);
      const band = [[qa.x + nx * Ra, qa.y + ny * Ra], [qh.x + nx * R, qh.y + ny * R], [qh.x - nx * R, qh.y - ny * R], [qa.x - nx * Ra, qa.y - ny * Ra]];
      const rag = (s, sg) => { const n = 18, pts = []; for (let i = 0; i <= n; i++) { const u = i / n, rr = lerp(Ra, R, u) * (1 + (hash(i * 7 + sg * 3 + Math.floor(t * 12)) - .5) * .18); pts.push([lerp(qa.x, qh.x, u) + nx * rr * sg, lerp(qa.y, qh.y, u) + ny * rr * sg]); } return pts; };
      const L1 = rag(0, 1), L2 = rag(0, -1).reverse(), poly = L1.concat(L2), mx = (qa.x + qh.x) / 2, my = (qa.y + qh.y) / 2, Rm = (Ra + R) / 2;
      const gr = g.createLinearGradient(mx + nx * Rm, my + ny * Rm, mx - nx * Rm, my - ny * Rm); gr.addColorStop(0, rgba('#8a3ae0', .9 * fade)); gr.addColorStop(.18, rgba('#1a0630', .95 * fade)); gr.addColorStop(.5, rgba('#000000', fade)); gr.addColorStop(.82, rgba('#1a0630', .95 * fade)); gr.addColorStop(1, rgba('#8a3ae0', .9 * fade));
      g.globalCompositeOperation = 'source-over'; polyPath(g, poly); g.fillStyle = gr; g.fill();
      g.globalCompositeOperation = 'lighter'; for (const Ls of [L1, L2]) { polyPath(g, Ls, false); g.strokeStyle = rgba(HVFX.purple2, .85 * fade); g.lineWidth = Math.max(3, R * .05); g.stroke(); }
      for (let k = 0; k < 8; k++) { const s0 = hash(k * 3 + Math.floor(t * 12)), s1 = Math.min(1, s0 + .2), w = (hash(k * 7) - .5) * 1.6; g.strokeStyle = rgba(k % 2 ? HVFX.purple : '#ffffff', .5 * fade); g.lineWidth = 2; g.beginPath(); g.moveTo(lerp(qa.x, qh.x, s0) + nx * w * lerp(Ra, R, s0) * .5, lerp(qa.y, qh.y, s0) + ny * w * lerp(Ra, R, s0) * .5); g.lineTo(lerp(qa.x, qh.x, s1) + nx * w * lerp(Ra, R, s1) * .5, lerp(qa.y, qh.y, s1) + ny * w * lerp(Ra, R, s1) * .5); g.stroke(); }
      if (d < len) { // the sphere: violet with black ink, white core, crackling arcs, debris dissolving at its rim
        hvOrb(g, qh, R, [HVFX.purple, HVFX.purple2], t, { halo: 2.6, haloA: .7, spin: 4, arcs: 6, edge: '#2a0848' });
        g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 10; k++) { const an = hash(k + Math.floor(t * 24) * 3) * TAU, pts = [[qh.x + Math.cos(an) * R, qh.y + Math.sin(an) * R]]; for (let j = 1; j < 5; j++) pts.push([pts[j - 1][0] + Math.cos(an + (hash(j * 9 + k) - .5) * 1.6) * R * .2, pts[j - 1][1] + Math.sin(an + (hash(j * 5 + k) - .5) * 1.6) * R * .2]); polyPath(g, pts, false); g.strokeStyle = rgba(HVFX.purple2, .8); g.lineWidth = 2.2; g.stroke(); }
      } else { const u = (d - len) || (ft - len / sp); g.globalCompositeOperation = 'lighter'; glow(g, qh.x, qh.y, R * 4 * fade, HVFX.purple, .6 * fade); }
    }
  }
  g.restore();
}
// =========================================================================================================== BLACK FLASH
function fxBlackFlash(g, p, t, o = {}) {
  const q = hvQ(p); if (!q) return; const dur = o.dur || .55; if (t < 0 || t > dur) return; const u = t / dur, S = (o.size || 1.6) * q.s, fr = Math.floor(t * 24);
  g.save(); g.lineJoin = 'miter'; g.lineCap = 'round';
  // distortion flash: red bloom then black core
  g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, S * (1.2 + u), '#ff1030', .8 * (1 - u)); g.globalCompositeOperation = 'source-over';
  if (u < .35) { g.fillStyle = rgba('#000000', .85 * (1 - u / .35)); g.beginPath(); g.arc(q.x, q.y, S * .25 * (1 + u * 2), 0, TAU); g.fill(); }
  const n = o.n || 9;
  for (let i = 0; i < n; i++) { const an = hash(i * 11 + fr * 3) * TAU, L = S * (.6 + hash(i + fr) * .9) * (.4 + u), pts = [[q.x, q.y]];
    for (let j = 1; j <= 6; j++) { const s = j / 6; pts.push([q.x + Math.cos(an) * L * s + (hash(i * 7 + j + fr) - .5) * L * .35, q.y + Math.sin(an) * L * s + (hash(i * 3 + j * 5 + fr) - .5) * L * .35]); }
    polyPath(g, pts, false); g.strokeStyle = rgba('#ff2038', .9 * (1 - u)); g.lineWidth = Math.max(4, S * .05); g.stroke(); g.strokeStyle = '#050208'; g.lineWidth = Math.max(2, S * .025); g.stroke();
    if (hash(i + fr * 7) < .5) { const m = pts[3]; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0] + (hash(i * 13 + fr) - .5) * L * .6, m[1] + (hash(i * 17 + fr) - .5) * L * .6); g.strokeStyle = '#050208'; g.lineWidth = Math.max(1.5, S * .018); g.stroke(); } }
  g.restore();
}
// =========================================================================================================== RCT / SIX EYES / FLASH STEP / DOMAIN HAND
function fxRCT(g, F, t, o = {}) {
  const S = figSkel(F, t), k = o.k == null ? 1 : o.k; if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter';
  const pts = [S.J.abd, S.J.neck, S.J.head, S.J.pelvis, S.J.shL, S.J.shR];
  for (const p of pts) { const q = hvQ(p); if (q) glow(g, q.x, q.y, .5 * q.s, HVFX.heal, .14 * k); }
  for (let i = 0; i < 40; i++) { const ph = (t * (.4 + hash(i) * .5) + hash(i * 3)) % 1, base = vLerp(S.J.pelvis, S.J.head, hash(i * 5)), p = vAdd(base, [(hash(i * 7) - .5) * .7, ph * 1.2, (hash(i * 9) - .5) * .5]), q = hvQ(p); if (!q) continue;
    g.fillStyle = rgba(i % 3 ? HVFX.heal : '#ffffff', .8 * k * Math.sin(ph * Math.PI)); g.beginPath(); g.ellipse(q.x, q.y, 2 + .012 * q.s, 6 + .03 * q.s, 0, 0, TAU); g.fill(); }
  g.restore();
}
function fxSixEyes(g, F, t, o = {}) {
  const S = figSkel(F, t), D = designAt(F, t), HM = headModel(S, D), k = o.k == null ? 1 : o.k; if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (const sg of [-1, 1]) { const q = hvQ(HM.at(sg * .46, -.21)); if (!q) continue; const L = (o.streak || 1) * HM.r * q.s * 2.4 * k;
    const gr = g.createLinearGradient(q.x - L, q.y, q.x + L, q.y); gr.addColorStop(0, 'rgba(90,200,255,0)'); gr.addColorStop(.5, rgba('#bff2ff', .85 * k)); gr.addColorStop(1, 'rgba(90,200,255,0)');
    g.fillStyle = gr; g.fillRect(q.x - L, q.y - Math.max(1.5, HM.r * q.s * .025), L * 2, Math.max(3, HM.r * q.s * .05)); glow(g, q.x, q.y, HM.r * q.s * .3, '#7fdcff', .4 * k);
    fxImpactStar(g, q.x, q.y, HM.r * q.s * .25 * k, t * 2, rgba('#ffffff', .8 * k), 4); }
  g.restore();
}
function fxFlashStep(g, a, b, t, o = {}) {
  const dur = o.dur || .25; if (t < 0 || t > dur + .3) return; const qa = hvQ(a), qb = hvQ(b); if (!qa || !qb) return; const u = clamp(t / dur, 0, 1), col = o.col || '#dff4ff';
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const off = (i - 3) * 6, f = clamp(1 - (t - dur * .5) / .3, 0, 1); g.strokeStyle = rgba(col, .5 * f); g.lineWidth = i === 3 ? 5 : 2; g.beginPath(); g.moveTo(qa.x, qa.y + off); g.lineTo(lerp(qa.x, qb.x, u), lerp(qa.y, qb.y, u) + off); g.stroke(); }
  g.restore(); fxShockRing(g, [a[0], .02, a[2]], t, { r: .9, dur: .35, w: .22, col: '#e8e0d8' }); if (t > dur) fxShockRing(g, [b[0], .02, b[2]], t - dur, { r: .8, dur: .35, w: .22, col: '#e8e0d8' });
}
function fxDomainHand(g, F, t, o = {}) {
  const S = figSkel(F, t), q = hvQ(S.J.handR), k = o.k == null ? 1 : o.k; if (!q || k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter';
  glow(g, q.x, q.y, .5 * q.s * k, '#7fd8ff', .45 * k); fxImpactStar(g, q.x, q.y, .3 * q.s * k, t, rgba('#ffffff', .9 * k), 4); g.restore();
}

// =========================================================================================================== SCREEN PROCESSES
// procedural star space drawn into a context in 1920x1080 units (cached per seed + size)
const HVG_STARCACHE = {};
function hvgStarField(w, h, seed = 3) {
  const key = w + 'x' + h + ':' + seed; if (HVG_STARCACHE[key]) return HVG_STARCACHE[key];
  const c = mkCanvas(w, h), g = c.getContext('2d'), r = rng(seed), s = w / W;
  g.fillStyle = HVFX.void; g.fillRect(0, 0, w, h);
  // nebula washes (deep blue / violet / teal)
  for (let i = 0; i < 9; i++) { const x = r() * w, y = r() * h, R = (240 + r() * 520) * s; const gr = g.createRadialGradient(x, y, 0, x, y, R); const col = ['#1a2a8a', '#4a1a8a', '#0a5a8a', '#2a0a5a'][i % 4]; gr.addColorStop(0, rgba(col, .45)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  // stars (three sizes) + a few cross-flare stars
  for (let i = 0; i < 1400; i++) { const x = r() * w, y = r() * h, b = r(); g.fillStyle = rgba(b > .9 ? '#bfe8ff' : '#ffffff', .35 + .65 * b); const sz = (b > .97 ? 2.6 : b > .8 ? 1.6 : .9) * s; g.fillRect(x, y, sz, sz); }
  for (let i = 0; i < 22; i++) { const x = r() * w, y = r() * h, L = (8 + r() * 26) * s; g.strokeStyle = 'rgba(220,240,255,.8)'; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(x - L, y); g.lineTo(x + L, y); g.moveTo(x, y - L); g.lineTo(x, y + L); g.stroke(); }
  return (HVG_STARCACHE[key] = c);
}
// the endless light lattice of Unlimited Void (perspective grid of glowing lines receding to a centre + concentric shells)
function hvgVoidLattice(g, t, o = {}) {
  const cx = o.x || W / 2, cy = o.y || H * .46, a = o.a == null ? 1 : o.a; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < 40; i++) { const an = i / 40 * TAU + t * .02; g.strokeStyle = rgba(i % 5 ? '#6fb8ff' : '#e8f6ff', (i % 5 ? .14 : .3) * a); g.lineWidth = i % 5 ? 1 : 2; g.beginPath(); g.moveTo(cx + Math.cos(an) * 30, cy + Math.sin(an) * 30); g.lineTo(cx + Math.cos(an) * 2400, cy + Math.sin(an) * 2400); g.stroke(); }
  for (let k = 0; k < 14; k++) { const ph = ((k + t * .6) % 14) / 14, R = 40 * Math.pow(60, ph); g.strokeStyle = rgba('#8fcaff', .28 * a * Math.sin(ph * Math.PI)); g.lineWidth = 1 + ph * 2; g.beginPath(); g.ellipse(cx, cy, R, R * .62, 0, 0, TAU); g.stroke(); }
  g.restore();
}
function gojoVoidScreen(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const sf = hvgStarField(c.width, c.height, o.seed || 3), gg = c.getContext('2d');
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.drawImage(sf, 0, 0); gg.restore(); g.save(); g.globalAlpha = 1; hvgVoidLattice(g, t, { a: k }); g.restore(); if (o.keepFigs !== false) { gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.drawImage(layer('chars'), 0, 0); gg.restore(); } });
}
function gojoDomainWipe(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => { const dur = o.dur || .9, u = easeIn(clamp(t / dur, 0, 1)), q = hvQ(o.at) || { x: W / 2, y: H / 2 }, sc = OUT.scale, R = u * 2400 + 2;
    const gg = c.getContext('2d'), sf = hvgStarField(c.width, c.height, o.seed || 3);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.beginPath(); gg.arc(q.x * sc, q.y * sc, R * sc, 0, TAU); gg.clip(); gg.drawImage(sf, 0, 0); if (o.keepFigs !== false) gg.drawImage(layer('chars'), 0, 0); gg.restore();
    g.save(); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.clip(); hvgVoidLattice(g, t, { x: q.x, y: q.y, a: u }); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#e8f8ff', .9 * (1 - u * .6)); g.lineWidth = 6 + 20 * (1 - u); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); glow(g, q.x, q.y, Math.min(R, 600) * .4, '#9fd8ff', .3 * (1 - u)); g.restore(); });
}
// information overload: the victim's brain receives infinite information -> glyph rain, flicker, whiteout pulses, chromatic doubling
const HVG_GLYPHS = '無量空処情報無限∞01天上天下唯我独尊六眼術式領域展開ΣΔΨΩ∫√≡≈∞πλ01011010'.split('');
function gojoInfoOverload(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const fr = Math.floor(t * 24), r = rng((o.seed || 7) + fr * 13), gg = c.getContext('2d');
    if (o.double !== false) { const src = gowCopy(c, 'hvgOver'); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalCompositeOperation = 'lighter'; gg.globalAlpha = .35 * k; gg.drawImage(src, (r() - .5) * 24 * k * OUT.scale, (r() - .5) * 10 * k * OUT.scale); gg.restore(); }
    g.save(); g.font = '700 30px "IPAGothic", monospace'; g.textAlign = 'center';
    for (let col = 0; col < 34; col++) { const x = col * 58 + 20, sp = 300 + hash(col * 3) * 500, off = (t * sp + hash(col) * H) % (H + 400) - 200; for (let j = 0; j < 9; j++) { const y = off - j * 40, ch = HVG_GLYPHS[Math.floor(hash(col * 31 + j * 7 + fr) * HVG_GLYPHS.length)]; g.fillStyle = rgba(j === 0 ? '#ffffff' : '#9fe0ff', (j === 0 ? .9 : .5 - j * .05) * k); g.fillText(ch, x, y); } }
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const y = r() * H; g.fillStyle = rgba('#bfe8ff', .12 * k); g.fillRect(0, y, W, 2 + r() * 6); }
    const pulse = o.white == null ? (fr % 6 === 0 ? .5 : 0) : o.white; if (pulse) { g.globalCompositeOperation = 'source-over'; g.fillStyle = rgba('#ffffff', pulse * k); g.fillRect(0, 0, W, H); }
    g.restore(); });
}
// Blue's warp: annuli of the frame scaled toward 'at' (pinch) with a slight twist
function gojoWarp(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => { const k = (o.k == null ? 1 : o.k) * clamp(t / .3, 0, 1); if (k <= 0) return; const q = hvQ(o.at) || { x: W / 2, y: H / 2 }, sc = OUT.scale, R = (o.r || 420), src = gowCopy(c, 'hvgWarp'), gg = c.getContext('2d'), n = 12;
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = n; i >= 1; i--) { const r1 = R * i / n, s = 1 - k * .35 * Math.pow(1 - i / n, 1.2) - k * .05, tw = (o.twist == null ? .25 : o.twist) * k * (1 - i / n);
      gg.save(); gg.beginPath(); gg.arc(q.x * sc, q.y * sc, r1 * sc, 0, TAU); gg.clip(); gg.translate(q.x * sc, q.y * sc); gg.rotate(tw); gg.scale(s, s); gg.translate(-q.x * sc, -q.y * sc); gg.drawImage(src, 0, 0); gg.restore(); }
    gg.restore(); });
}
