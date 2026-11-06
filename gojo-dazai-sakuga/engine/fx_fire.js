/* death-battle engine - fx_fire.js (agent E2) : FIRE FORCE effects (Benimaru Shinmon, Joker). Uses the E2 flame core
   from fx_bc.js (fxE2Flames / fxE2FlameRibbon / fxE2Embers / E2_FLAME palettes).
   BENIMARU (palette 'beni': white-gold core, vermilion edge, forked tongues)
     fxBeniAura(g, F, t, o)            flames rising off the body + forked fire-lightning crawling around him
     fxBeniForks(g, a, b, t, o)        forked 'ikazuchi' fire lightning between two points (visual signature, interpretation)
     fxFireMoon(g, c, dir, t, o)       Iai Hand-Sword 1st form: Fire Moon (火月) - crescent blade of flame flying along dir
     fxCrimsonMoonOrb(g, c, t, o)      Crimson Moon (紅月) charge: swirling red-moon fireball (o.r grows)
     fxCrimsonMoonBlast(g, c, t, o)    the blast: huge crimson sphere with crisp rim, flare and shock, fades to smoke
     fxSunWheel(g, F, t, o)            Sun Wheel (日輪) halo behind him (Acala's flame aureole): ring + spokes + tongues
     fxMatoiTrail(g, F, t, o)          fire jet trail behind the matoi when flying on it
     fxHeatBarrier(g, c, t, o)         4 m heat barrier dome (shimmer + rim flames)
     fireBeniParts                     'blaze' form part: flames on fists / shoulders
   JOKER (palette 'joker': ash-violet + ember; INTERPRETATION of colour)
     fxJokerCards(g, t, o)             volley of burning cards from o.a toward o.b (fan spread, arcs, spin) or orbit (o.orbit)
     fxJokerSuits(g, c, t, o)          giant flame card-suit glyph(s) blooming then detonating
     fxJokerBurst(g, p, t, o)          card explosion: violet-black smoke + ember flash + card shards
     fxJokerSmoke(g, p, t, o)          cigarette smoke ribbon
     fxAdollaEye(g, F, t, o)           burning concentric glow from the left eye (adolla form)
   + fxRedSun(g, a, dir, t, o) 4th form beam, fxSunWheelThrow(g, a, b, t, o), fxJoker53(g, c, t, o) the 53rd card,
     fxAshCloud(g, c, t, o), fxCardStorm(g, c, t, o)
   IMPACT_SEQ beni_firemoon, beni_crimson, beni_sunwheel, beni_iai, joker_cards, joker_grin, joker_adolla, joker_suits */
'use strict';
// =============================================================================================== BENIMARU
function fxBeniForks(g, a, b, t, o = {}) {
  const pa = P2(a), pb = P2(b); if (!pa || !pb || t < 0 || (o.dur && t > o.dur)) return; const pal = e2Pal(o.pal || 'beni'), seed = (o.seed || 3) + Math.floor(onN(t, o.hold || 2) * FPS / (o.hold || 2)) * 17;
  const path = (x0, y0, x1, y1, n, amp, sd) => { const pts = [[x0, y0]]; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; for (let i = 1; i < n; i++) { const u = i / n, j = (hash(sd + i) - .5) * amp * L * Math.sin(u * Math.PI); pts.push([x0 + dx * u + nx * j, y0 + dy * u + ny * j]); } pts.push([x1, y1]); return pts; };
  const main = path(pa.x, pa.y, pb.x, pb.y, 9, .35, seed), W = clamp((o.w || .05) * pa.s, 1.5, 14);
  const branches = [main]; for (let k = 0; k < (o.branches == null ? 3 : o.branches); k++) { const i = 2 + Math.floor(hash(seed + k * 5) * 5), p = main[i], a2 = Math.atan2(pb.y - pa.y, pb.x - pa.x) + (hash(seed + k) - .5) * 2.2, L = Math.hypot(pb.x - pa.x, pb.y - pa.y) * (.2 + .25 * hash(seed + k * 3)); branches.push(path(p[0], p[1], p[0] + Math.cos(a2) * L, p[1] + Math.sin(a2) * L, 5, .5, seed + k * 31)); }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [col, w] of [[pal.ink, 2.4], [pal.outer, 1.7], [pal.mid, 1.0], [pal.core, .45]]) for (let bi = 0; bi < branches.length; bi++) { polyPath(g, branches[bi], false); g.strokeStyle = col; g.lineWidth = W * w * (bi ? .55 : 1); g.stroke(); }
  g.globalCompositeOperation = 'lighter'; polyPath(g, main, false); g.strokeStyle = rgba(pal.glow, .35); g.lineWidth = W * 5; g.stroke(); g.restore();
}
function fxBeniAura(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, amt = o.amt == null ? 1 : o.amt; if (amt <= 0) return;
  const js = ['shL', 'shR', 'elL', 'elR', 'handL', 'handR', 'pelvis', 'knL', 'knR', 'anL', 'anR', 'abd', 'head'];
  fxE2Flames(g, js.map(j => ({ p: S.J[j], r: .14 * k * amt * (j === 'head' ? 1.2 : 1) })), t, { pal: 'beni', n: 2, seed: 81, alpha: o.alpha == null ? .92 : o.alpha, spread: .5, hK: 1.3 });
  if (o.forks !== false) for (let i = 0; i < 2; i++) { const ph = Math.floor(onN(t, 3) * 8) + i * 5; const a = S.J[js[Math.floor(hash(ph) * js.length)]], b = vAdd(a, [(hash(ph + 1) - .5) * 1.2 * k, (hash(ph + 2)) * 1.0 * k, (hash(ph + 3) - .5) * 1.2 * k]); fxBeniForks(g, a, b, t, { w: .025 * k, branches: 1, seed: ph, hold: 3 }); }
}
function fireBeniParts(S, D, F, t, parts, opt) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8;
  for (const sd of ['L', 'R']) { const h = S.J['hand' + sd]; parts.push({ z: camDepth(h) - .03, fn: c => fxE2Flames(c, [{ p: h, r: .09 * k }, { p: vLerp(S.J['el' + sd], S.J['wr' + sd], .6), r: .06 * k }], t, { pal: 'beni', n: 3, seed: sd === 'L' ? 7 : 9, spread: .9 }) }); }
}
// Fire Moon (Kagetsu): flame crescent travelling along dir from c; o {r, dist, dur, tilt}
function fxFireMoon(g, c, dir, t, o = {}) {
  const dur = o.dur || .55, u = t / dur; if (u < 0 || u > 1.15) return; const d = vNorm(dir), up = o.up || [0, 1, 0], side = mApply(mAxis(d, o.tilt || 0), vNorm(vCross(d, up)));
  const pos = vMad(c, d, (o.dist || 10) * easeOut(clamp(u, 0, 1))), R = (o.r || 2.2) * (1 + u * .6), fade = 1 - clamp((u - .85) / .3, 0, 1), pal = e2Pal(o.pal || 'beni');
  const arc = (rs, rd, off) => { const a = []; for (let i = 0; i <= 24; i++) { const an = (i / 24 - .5) * Math.PI * .95; a.push(vAdd(pos, vAdd(vMul(side, Math.sin(an) * R * rs), vMul(d, Math.cos(an) * R * rd + off)))); } return a; };
  const outer = arc(1, .45, 0), inner = arc(.88, .12, -R * .03), core = arc(.9, .3, 0);
  g.save(); g.globalAlpha = fade;
  fxE2Flames(g, outer.filter((p, i) => i % 2 === 0).map((p, i) => ({ p, r: R * .16 * Math.sin((i / 12) * Math.PI + .2), ang: 'x' })).map(e => { const q = P2(e.p), qc = P2(pos); if (q && qc) e.ang = Math.atan2(q.y - qc.y, q.x - qc.x) + Math.PI; return e; }), t, { pal, n: 2, spread: .5, seed: 91, hK: .9 });
  const sp = projPoly(outer.concat(inner.slice().reverse())); if (sp.length > 2) { polyPath(g, sp); g.fillStyle = pal.mid; g.fill(); g.lineWidth = 3.5; g.strokeStyle = pal.ink; g.stroke(); const cp = projPoly(outer.slice(4, 21).concat(core.slice(4, 21).reverse())); if (cp.length > 2) { polyPath(g, cp); g.fillStyle = pal.core; g.fill(); } }
  g.restore(); e2GlowAt(g, pos, R * 1.4, pal.glow, .45 * fade);
}
// Crimson Moon orb (charging/held): o {r, spin}
function fxCrimsonMoonOrb(g, c, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const q = P2(c); if (!q) return; const R = (typeof o.r === 'function' ? o.r(t) : (o.r || 1.6)) * q.s, tf = onN(t, 2), pal = e2Pal('beni');
  e2GlowAt(g, c, (typeof o.r === 'function' ? o.r(t) : (o.r || 1.6)) * 3, '#ff3a1a', .55);
  // corona tongues
  const E = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + tf * .6; E.push({ p: { x: q.x + Math.cos(a) * R * .9, y: q.y + Math.sin(a) * R * .9 }, r: R * .28, ang: a }); } fxE2Flames(g, E, t, { pal: { ink: '#4a0408', outer: '#c8101a', mid: '#ff3a1a', core: '#ffb02e' }, n: 2, spread: .4, seed: 101 });
  // sphere: deep crimson moon with mottled maria + white-gold hot rim (lit from inside)
  g.save(); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fillStyle = radial(g, q.x - R * .2, q.y - R * .25, R * 1.2, [[0, '#fff2c8'], [.25, '#ff8a2a'], [.6, '#e0201a'], [1, '#8a0810']]); g.fill(); g.clip();
  g.fillStyle = 'rgba(120,6,20,.45)'; for (let i = 0; i < 7; i++) { const a = hash(i * 3) * TAU + tf * .25, d = R * .55 * hash(i * 7); g.beginPath(); g.ellipse(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, R * (.15 + .15 * hash(i)), R * (.1 + .1 * hash(i + 4)), a, 0, TAU); g.fill(); }
  g.restore(); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.lineWidth = clamp(R * .05, 2, 7); g.strokeStyle = '#4a0408'; g.stroke(); g.lineWidth = clamp(R * .03, 1, 4); g.strokeStyle = '#fff2c8'; g.beginPath(); g.arc(q.x, q.y, R * .93, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
}
// Crimson Moon blast: o {r (final m), dur}
function fxCrimsonMoonBlast(g, c, t, o = {}) {
  const dur = o.dur || 1.6, u = t / dur; if (u < 0 || u > 1) return; const q = P2(c); if (!q) return; const Rm = o.r || 10, R = Rm * q.s * easeOut(clamp(u * 2.2, 0, 1));
  if (u < .06) { g.save(); g.fillStyle = '#fff6e0'; g.fillRect(0, 0, W, H); g.restore(); }
  e2GlowAt(g, c, Rm * 2.4 * Math.min(1, u * 3), '#ff2a1a', .8 * (1 - u));
  g.save(); g.globalAlpha = 1 - clamp((u - .7) / .3, 0, 1);
  g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fillStyle = radial(g, q.x, q.y, R, [[0, '#fff8e0'], [.35 + .3 * u, '#ffb02e'], [.75, '#e8181a'], [1, '#7a0610']]); g.fill();
  g.lineWidth = clamp(R * .02, 2, 10); g.strokeStyle = '#3a0206'; g.stroke();
  const E = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; E.push({ p: { x: q.x + Math.cos(a) * R, y: q.y + Math.sin(a) * R }, r: R * .12, ang: a }); } fxE2Flames(g, E, t, { pal: 'beni', n: 2, spread: .3, seed: 111 });
  g.restore();
  if (Array.isArray(c)) { fxShockRing(g, [c[0], 0, c[2]], t, { r: Rm * 2.4, dur: dur * .6, w: Rm * .2, col: '#ffd890' }); if (u > .45) fxExplosion(g, c, (u - .45) * dur, { size: Rm * .6, pal: 'beni', dur: dur * .6, n: 18, ring: false }); }
}
// Sun Wheel halo behind the figure (chest plane), o {r, amt, spokes}
function fxSunWheel(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, amt = o.amt == null ? 1 : o.amt; if (amt <= 0) return;
  const M = S.M.chest, c = vAdd(vLerp(S.J.neck, S.J.head, .2), vMul(M[2], -.35 * k)), R = (o.r || 1.25) * k * easeOut(amt), rot = t * .8, pal = e2Pal('beni');
  const ring = (rr, n = 48) => { const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU + rot; pts.push(vAdd(c, vAdd(vMul(M[0], Math.cos(a) * rr), vMul(M[1], Math.sin(a) * rr)))); } return pts; };
  e2GlowAt(g, c, R * 1.6, pal.glow, .4 * amt);
  // outer tongues radiating
  const E = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + rot, p = vAdd(c, vAdd(vMul(M[0], Math.cos(a) * R), vMul(M[1], Math.sin(a) * R))), qp = P2(p), qc = P2(c); if (qp && qc) E.push({ p, r: R * .14, ang: Math.atan2(qp.y - qc.y, qp.x - qc.x) }); }
  fxE2Flames(g, E, t, { pal, n: 2, spread: .3, seed: 121, hK: 1.2 });
  // ring band + spokes (wheel of the sun)
  const outer = projPoly(ring(R)), inner = projPoly(ring(R * .8).reverse());
  if (outer.length > 2 && inner.length > 2) { g.beginPath(); polyAdd(g, outer); polyAdd(g, inner); g.fillStyle = pal.mid; g.fill('evenodd'); g.lineWidth = 3; g.strokeStyle = pal.ink; g.stroke(); }
  const ns = o.spokes || 8; g.lineCap = 'round'; for (let i = 0; i < ns; i++) { const a = i / ns * TAU + rot, p0 = vAdd(c, vAdd(vMul(M[0], Math.cos(a) * R * .25), vMul(M[1], Math.sin(a) * R * .25))), p1 = vAdd(c, vAdd(vMul(M[0], Math.cos(a) * R * .82), vMul(M[1], Math.sin(a) * R * .82))); for (const run of projLine([p0, p1])) { polyPath(g, run, false); g.strokeStyle = pal.ink; g.lineWidth = 9; g.stroke(); g.strokeStyle = pal.core; g.lineWidth = 5; g.stroke(); } }
  const hub = projPoly(ring(R * .22)); if (hub.length > 2) { polyPath(g, hub); g.fillStyle = pal.core; g.fill(); g.lineWidth = 2.5; g.strokeStyle = pal.ink; g.stroke(); }
}
function fxMatoiTrail(g, F, t, o = {}) {
  const sw = swordAt(F, t); if (!sw) return; const pts = []; for (let i = 0; i < 8; i++) { const tt = t - i * .035; const s2 = swordAt(F, tt); if (s2) pts.push(vLerp(s2.base, s2.tip, .1)); }
  if (pts.length > 1) fxE2FlameRibbon(g, pts, t, { pal: 'beni', r: u => (o.r || .35) * (1 - u * .6), count: 9, n: 2, ang: 'back', seed: 131 });
  e2GlowAt(g, pts[0], .8, '#ff7a2a', .5);
}
function fxHeatBarrier(g, c, t, o = {}) {
  if (t < 0) return; const R = o.r || 4, amt = o.amt == null ? 1 : o.amt; g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) { const el = k / 6 * HP, pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU + t * .3 * (k % 2 ? 1 : -1); pts.push([c[0] + Math.cos(a) * Math.cos(el) * R, c[1] + Math.sin(el) * R, c[2] + Math.sin(a) * Math.cos(el) * R]); } for (const run of projLine(pts)) { polyPath(g, run, false); g.strokeStyle = rgba('#ffb04a', .14 * amt); g.lineWidth = 6; g.stroke(); } }
  g.restore(); const E = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; E.push({ p: [c[0] + Math.cos(a) * R, c[1], c[2] + Math.sin(a) * R], r: .35 }); } fxE2Flames(g, E, t, { pal: 'beni', n: 1, seed: 141, alpha: .85 * amt });
}

// =============================================================================================== JOKER
function e2Card(g, p, d, side, sz, lit, i, seed) { // card quad in 3D around p, long axis d
  const a = vMad(vMad(p, d, sz * .7), side, -sz * .5), b = vMad(vMad(p, d, sz * .7), side, sz * .5), c = vMad(vMad(p, d, -sz * .7), side, sz * .5), e = vMad(vMad(p, d, -sz * .7), side, -sz * .5);
  const sp = projPoly([a, b, c, e]); if (sp.length < 3) return; const q = P2(p); polyPath(g, sp); g.fillStyle = '#fbf4ea'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#1a0822'; g.stroke();
  if (q) { const s = sz * q.s; if (s > 6) { g.fillStyle = i % 2 ? '#c41e2c' : '#1a1820'; g.font = `900 ${s * .9}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('♠♥♦♣'[i % 4], q.x, q.y); } }
  if (lit > 0) { g.save(); g.globalCompositeOperation = 'lighter'; polyPath(g, sp); g.lineWidth = 3; g.strokeStyle = rgba('#ff8a3a', .9 * lit); g.stroke(); g.restore(); }
}
/* o: {a (from), b (to), n, spread (m), dur (flight), stagger, size, lit, orbit: {c, r, h} } */
function fxJokerCards(g, t, o = {}) {
  if (t < 0) return; const n = o.n || 16, seed = o.seed || 7, sz = o.size || .2, lit = o.lit == null ? 1 : o.lit;
  const items = [];
  for (let i = 0; i < n; i++) {
    let p, d, side;
    if (o.orbit) { const R = o.orbit.r || 1.2, a = t * (o.orbit.spin || 2.2) + i / n * TAU, y = (o.orbit.h || 0) + Math.sin(t * 2 + i * 1.7) * .25; p = vAdd(o.orbit.c, [Math.cos(a) * R, y, Math.sin(a) * R]); d = vNorm([-Math.sin(a), .2, Math.cos(a)]); side = [0, 1, 0]; }
    else { const t0 = i * (o.stagger == null ? .03 : o.stagger), u = (t - t0) / (o.dur || .45); if (u < 0 || u > 1.05) continue; const A = o.a || [0, 1.5, 0], B = o.b || [0, 1.5, 10], ax = vNorm(vSub(B, A)), sd = vNorm(vCross(ax, [0, 1, 0]));
      const off = vAdd(vMul(sd, (hash(seed + i) - .5) * 2 * (o.spread || 1.5)), [0, (hash(seed + i * 3) - .5) * (o.spread || 1.5), 0]); const mid = vAdd(vLerp(A, B, .5), vMul(off, 1.4));
      const uu = Math.min(1, u), p0 = vLerp(vLerp(A, mid, uu), vLerp(mid, vAdd(B, vMul(off, .25)), uu), uu); p = p0; d = vNorm(vSub(vLerp(vLerp(A, mid, uu + .02), vLerp(mid, B, uu + .02), uu + .02), p0)); side = mApply(mAxis(d, t * 25 + i), sd); }
    items.push({ p, d, side, i, z: camDepth(p) });
  }
  items.sort((a, b) => b.z - a.z);
  for (const it of items) { if (lit > .3) fxE2Flames(g, [{ p: vMad(it.p, it.d, -sz * .6), r: sz * .45, ang: 'x' }].map(e => { const q0 = P2(it.p), q1 = P2(vMad(it.p, it.d, -1)); if (q0 && q1) e.ang = Math.atan2(q1.y - q0.y, q1.x - q0.x); return e; }), t, { pal: 'joker', n: 2, seed: seed + it.i, spread: .5 }); e2Card(g, it.p, it.d, it.side, sz, lit, it.i, seed); }
}
function fxJokerSuits(g, c, t, o = {}) {
  const dur = o.dur || 1.4, u = t / dur; if (u < 0 || u > 1) return; const q = P2(c); if (!q) return; const glyphs = o.glyphs || '♠♥♦♣', pal = e2Pal('joker');
  const S = (o.size || 2.2) * q.s * easeBack(clamp(u * 2.5, 0, 1)), boom = clamp((u - .7) / .3, 0, 1);
  for (let k = 0; k < glyphs.length; k++) { const a = k / glyphs.length * TAU + t * .8, rr = glyphs.length > 1 ? S * .9 : 0, x = q.x + Math.cos(a) * rr, y = q.y + Math.sin(a) * rr * .6;
    fxE2Flames(g, [{ p: { x, y: y - S * .3 }, r: S * .3 }], t, { pal, n: 3, seed: 151 + k, alpha: 1 - boom });
    g.save(); g.globalAlpha = 1 - boom; g.font = `900 ${S}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = clamp(S * .06, 2, 10); g.strokeStyle = pal.ink; g.strokeText(glyphs[k], x, y);
    g.fillStyle = linear(g, x, y - S * .5, x, y + S * .5, [[0, pal.core], [.5, pal.mid], [1, pal.outer]]); g.fillText(glyphs[k], x, y); g.restore();
    if (boom > 0) fxJokerBurst(g, Array.isArray(c) ? vAdd(c, [Math.cos(a) * (glyphs.length > 1 ? 1.5 : 0), 0, 0]) : { x, y, s: q.s }, (u - .7) * dur, { size: (o.size || 2.2) * .8 }); }
}
function fxJokerBurst(g, p, t, o = {}) { fxExplosion(g, p, t, Object.assign({ size: 2, pal: 'joker', dur: 1.1, n: 12, ring: false, debris: false }, o)); if (Array.isArray(p)) fxJokerCards(g, t, { a: p, b: vAdd(p, [0, 1.5, 0]), n: 8, spread: (o.size || 2) * 1.6, dur: .5, stagger: .01, size: .1, lit: .7, seed: 171 }); }
function fxJokerSmoke(g, p, t, o = {}) {
  const q0 = P2(p); if (!q0 || t < 0) return; const n = o.n || 14; g.save();
  for (let i = 0; i < n; i++) { const life = ((t * .45 + i / n) % 1), wob = Math.sin(life * 7 + i) * .08 + life * (o.drift || .15);
    const pp = Array.isArray(p) ? project([p[0] + wob, p[1] + life * (o.h || .7), p[2]]) : { x: q0.x + wob * 300, y: q0.y - life * 200, s: q0.s }; if (!pp) continue;
    const r = Math.max(1, (.015 + life * .06) * pp.s * (o.size || 1)); g.fillStyle = rgba(o.col || '#d8d2e0', .35 * (1 - life)); g.beginPath(); g.ellipse(pp.x, pp.y, r * 1.4, r, Math.sin(i) * .5, 0, TAU); g.fill(); }
  g.restore();
}
function fxAdollaEye(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), D = designAt(F, t), HM = headModel(S, D), p = HM.at(.44, -.2), q = P2(p); if (!q) return; const amt = o.amt == null ? 1 : o.amt, R = HM.r * q.s;
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 1.6 * amt, '#c04aff', .5 * amt); glow(g, q.x, q.y, R * .6 * amt, '#ff9a4a', .6 * amt);
  for (let i = 0; i < 3; i++) { const rr = R * (.4 + ((t * .8 + i / 3) % 1) * 1.6); g.strokeStyle = rgba(i % 2 ? '#ff9a4a' : '#c84aff', .5 * amt * (1 - ((t * .8 + i / 3) % 1))); g.lineWidth = 2; g.beginPath(); g.ellipse(q.x, q.y, rr, rr * .85, 0, 0, TAU); g.stroke(); }
  g.restore(); fxE2Flames(g, [{ p: vAdd(p, mApply(HM.M, [HM.r * .25, HM.r * .1, 0])), r: HM.r * .35, ang: -HP - .6 }], t, { pal: 'joker', n: 3, seed: 181, alpha: .9 * amt });
}

// Red Sun (赤日, 4th form): twin palm flame blades fused into a beam from a along dir; o {len, w, grow, dur}
function fxRedSun(g, a, dir, t, o = {}) {
  if (t < 0 || (o.dur && t > o.dur)) return; const d = vNorm(dir), w = o.w || .45, pal = e2Pal('beni'); let L = (o.len || 22) * easeOut(clamp(t / (o.grow || .15), 0, 1)); while (L > .5 && !P2(vMad(a, d, L))) L *= .7;
  const pa = P2(a), pb = P2(vMad(a, d, L)); if (!pa || !pb) return; const dx = pb.x - pa.x, dy = pb.y - pa.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w0 = w * pa.s, w1 = Math.max(4, w * pb.s);
  const band = (k, col) => { g.beginPath(); g.moveTo(pa.x + nx * w0 * k, pa.y + ny * w0 * k); g.lineTo(pb.x + nx * w1 * k, pb.y + ny * w1 * k); g.lineTo(pb.x - nx * w1 * k, pb.y - ny * w1 * k); g.lineTo(pa.x - nx * w0 * k, pa.y - ny * w0 * k); g.closePath(); g.fillStyle = col; g.fill(); };
  e2GlowAt(g, a, w * 4, pal.glow, .7); g.save(); g.globalCompositeOperation = 'lighter'; band(2.2, rgba('#ff3a1a', .25)); g.restore();
  band(1.25, pal.ink); band(1.1, pal.outer); band(.7, pal.mid); band(.3, pal.core);
  const E = []; for (let i = 0; i < 10; i++) { const u = i / 9, p = vMad(a, d, L * u * .95); E.push({ p, r: w * .55 * (1 - u * .4), ang: Math.atan2(ny, nx) * (i % 2 ? 1 : -1) + (i % 2 ? 0 : Math.PI) }); } fxE2Flames(g, E, t, { pal, n: 1, spread: .5, seed: 191 });
}
// Sun Wheel thrown: flaming ring flying from a to b, spinning (plane faces the travel direction)
function fxSunWheelThrow(g, a, b, t, o = {}) {
  const dur = o.dur || .6, u = t / dur; if (u < 0 || u > 1.05) return; const c = vLerp(a, b, easeIn(Math.min(1, u))), d = vNorm(vSub(b, a)), R = o.r || 1.6, pal = e2Pal('beni');
  const X = vNorm(vCross(d, [0, 1, 0])), Y = vNorm(vCross(X, d)), rot = t * 14; const ring = rr => { const pts = []; for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU + rot; pts.push(vAdd(c, vAdd(vMul(X, Math.cos(an) * rr), vMul(Y, Math.sin(an) * rr)))); } return pts; };
  e2GlowAt(g, c, R * 1.8, pal.glow, .5);
  const E = ring(R).filter((p, i) => i % 3 === 0).map(p => { const q0 = P2(p), qc = P2(c); return { p, r: R * .16, ang: q0 && qc ? Math.atan2(q0.y - qc.y, q0.x - qc.x) : -HP }; }); fxE2Flames(g, E, t, { pal, n: 2, spread: .3, seed: 201 });
  const o1 = projPoly(ring(R)), i1 = projPoly(ring(R * .78).reverse()); if (o1.length > 2 && i1.length > 2) { g.beginPath(); polyAdd(g, o1); polyAdd(g, i1); g.fillStyle = pal.mid; g.fill('evenodd'); g.lineWidth = 3; g.strokeStyle = pal.ink; g.stroke(); }
  if (u >= 1) fxExplosion(g, b, (u - 1) * dur * 10, { size: R, pal: 'beni', dur: .8 });
}
// the 53rd card: one big black joker card spinning, then detonating in violet light. o {size, dur, boomAt}
function fxJoker53(g, c, t, o = {}) {
  const dur = o.dur || 1.6, bt = o.boomAt == null ? 1.0 : o.boomAt; if (t < 0 || t > dur) return; const sz = o.size || .6;
  if (t < bt) { const spin = t * 5, d = vNorm([Math.sin(spin * .3) * .2, 1, 0]), side = vNorm([Math.cos(spin), 0, Math.sin(spin)]);
    const p = vAdd(c, [0, Math.sin(t * 3) * .05, 0]), A = vMad(vMad(p, d, sz * .7), side, -sz * .5), B = vMad(vMad(p, d, sz * .7), side, sz * .5), C = vMad(vMad(p, d, -sz * .7), side, sz * .5), D2 = vMad(vMad(p, d, -sz * .7), side, -sz * .5);
    e2GlowAt(g, p, sz * 3, '#b04aff', .55); const sp = projPoly([A, B, C, D2]); if (sp.length > 2) { polyPath(g, sp); g.fillStyle = '#0e0a14'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#c84aff'; g.stroke(); const q = P2(p); if (q) { const s = sz * q.s * .55; g.fillStyle = '#e8d8ff'; g.font = `900 ${s}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🃏'.length > 1 ? 'J' : 'J', q.x, q.y); g.font = `900 ${s * .35}px serif`; g.fillText('53', q.x - s * .45, q.y - s * .75); } } }
  else { const u = (t - bt) / (dur - bt); const q = P2(c); if (!q) return; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, (2 + u * 14) * q.s, '#b04aff', 1 - u); glow(g, q.x, q.y, (1 + u * 5) * q.s, '#ffffff', (1 - u) * .9); g.restore(); fxShockRing(g, c, t - bt, { r: 9, dur: .6, w: .6, col: '#c84aff', up: [0, 0, 1] }); }
}
// ash cloud (Infernal ash / powder medicine) with cards forming inside; o {r, n, dense}
function fxAshCloud(g, c, t, o = {}) {
  if (t < 0) return; fxSmoke(g, c, t % 2.2, { n: o.n || 10, size: o.r || 1.6, col: '#6a6470', shade: '#3a3440', rise: .3, spread: (o.r || 1.6) * 1.2, dur: 2.2, seed: 211 });
  const q0 = P2(c); if (!q0) return; g.save(); g.fillStyle = 'rgba(200,196,206,.6)'; for (let i = 0; i < 60; i++) { const a = hash(i) * TAU + t * .4, rr = (o.r || 1.6) * 1.4 * Math.sqrt(hash(i * 3)), p = project([c[0] + Math.cos(a) * rr, c[1] + Math.sin(t + i) * .5 + hash(i * 5), c[2] + Math.sin(a) * rr]); if (p) g.fillRect(p.x, p.y, 2, 2); } g.restore();
}
// card storm past the 52 limit: many cards orbiting in big rings around c
function fxCardStorm(g, c, t, o = {}) { for (let k = 0; k < (o.rings || 3); k++) fxJokerCards(g, t, { orbit: { c: vAdd(c, [0, k * 1.2 - 1, 0]), r: (o.r || 4) * (1 - k * .15), spin: (k % 2 ? -1 : 1) * (1.2 + k * .3), h: 0 }, n: o.n || 24, size: o.size || .25, seed: 220 + k * 7, lit: 1 }); }

// =============================================================================================== IMPACT SEQUENCES (Fire Force)
Object.assign(IMPACT_SEQ, {
  beni_firemoon: [{ s: 'whiteout', n: 1, p: { ink: '#6a0810', fxCol: '#ffb02e' } }, { s: 'crimsonline', n: 2, p: { col: '#e0201a', bg: '#fff8e8', ang: -.35, w: 26 } }, { s: 'invert', n: 1, p: { hue: 190 } }],
  beni_crimson: [{ s: 'overexpose', n: 2, p: { col: '#ff3a1a' } }, { s: 'kanji', n: 3, p: { char: '紅月', col: '#fff2c8', col2: '#ff3a1a', outline: '#3a0206', tint: '#c8101a', size: .8 } }, { s: 'redblack', n: 2, p: { col: '#c8101a' } }, { s: 'flash', n: 1, p: { col: '#fff6e0' } }],
  beni_sunwheel: [{ s: 'rimsil', n: 2, p: { col: '#fff4c8', col2: '#e0301a', rimCol: '#ffffff' } }, { s: 'kanji', n: 3, p: { char: '日輪', col: '#fff8dc', col2: '#ffb02e', outline: '#6a0810', size: .8 } }, { s: 'radial', n: 2, p: { lineCol: '#ffe0a0', ringCol: '#ff6a2a' } }],
  beni_iai: [{ s: 'blackaccent', n: 2, p: { accent: '#ffb02e', lines: 90 } }, { s: 'speedburst', n: 1 }, { s: 'flash', n: 1, p: { col: '#fff8dc' } }],
  joker_cards: [{ s: 'chroma', n: 1, p: { d: 30 } }, { s: 'duotone', n: 2, p: { dark: '#1a0822', light: '#ffd8b8' } }, { s: 'panels', n: 2, p: { modes: ['zoom', 'neg', 'orig'] } }],
  joker_grin: [{ s: 'closeup', n: 3, p: { part: 'mouth', strip: true, stripH: 320, lineCol: '#c8a0ff' } }, { s: 'invert', n: 1, p: { hue: 90 } }],
  joker_adolla: [{ s: 'blackaccent', n: 2, p: { accent: '#c84aff', lines: 70 } }, { s: 'closeup', n: 2, p: { part: 'eye', strip: true, stripH: 260, mode: 'invert' } }, { s: 'dualsplit', n: 1, p: { col: '#3a0a5a', col2: '#ff8a3a' } }],
  joker_suits: [{ s: 'kanji', n: 2, p: { char: '♠', col: '#ffe4c8', col2: '#7a2aa8', outline: '#1a0822' } }, { s: 'kanji', n: 1, p: { char: '♥', col: '#ffe4c8', col2: '#c41e2c', outline: '#1a0822' } }, { s: 'shatter', n: 2, p: { gap: '#ff8a3a', edge: '#1a0822' } }],
});
