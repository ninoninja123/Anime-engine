/* engine/fx_ij.js (agent E, itachi-vs-julius) - signature effects.  t = the effect's own time (pass lt - start).  Positions: world [x,y,z] or screen {x,y}.
   ITACHI
     fxCrows(g, t, {c, n, r, mode:'swirl'|'burst'|'gather'|'stream', from, to, dur, size, k, eyes, seed})   crow flock (3D, depth-sorted, flapping, red eyes)
     fxFeathers(g, c, t, {n, r, dur})                    black feathers drifting down
     fxCrowClone(g, F, ft, t, {dur, n})                  the figure bursts into crows (use IJ.cloneAlpha(t, dur) as the figure's alpha)
     fxAmaterasu(g, c, t, {r, h, n, k, seed}) | fxAmaterasuOn(g, F, ft, t, {k, h})   black flames (red-violet rim, black embers): patch on the ground / on a figure
     fxFireball(g, a, dir, t, {r, charge, speed, travel})   Great Fireball (Katon: Goukakyuu): breath stream -> huge rolling fireball
     fxSusanoo(g, t, {at, yaw, stage 0..4, k, scale, sword 0..1, swing 0..1, shield 0..1, arm 0..1, col, seed})
                                                          1 ribcage | 2 skeleton arms + skull | 3 muscled half body | 4 armoured: tengu mask, hood, gourd + Totsuka blade, Yata mirror
     mangekyoInsert(g, t, {x, y, w, h, k, mk, spin, open, bleed, side, bg})  extreme close-up eye band (screen space; draw with f.text or layer 'top')
     ijTsukuyomiScreen(f, t, {k, moon})                    screen process: red sky world, figures as grey negative (Tsukuyomi)
     ijLoopScreen(f, t, {k, n, dt})                        screen process: Izanami loop (ghost repeats, red rewind rings, film stutter)
   JULIUS
     fxClockCircle(g, c, n, t, {r, k, spin, hands, col, col2, numerals, ticks})   time-magic circle in a 3D plane (Roman numerals, gear ring, clock hands)
     fxChronoStasis(g, c, t, {r, k, lock})                 a target frozen inside a golden clock sphere (meridians, numerals, frozen sparks)
     fxTimeBullets(g, a, b, t, {n, dur, spread, col})      clock-hand shaped golden bolts
     fxTimeRewind(g, c, t, {r, k})                         counter-clockwise rewind arrows + reversed motion streaks (Chrono Anastasis)
     fxHourglass(g, p, t, {size, k, flow})                 floating hourglass (time stock / life force)
     fxGrimoire(g, p, t, {size, k, open, flip, glow})      floating three-leaf grimoire (open book, glowing pages)
     fxManaZone(g, c, t, {r, k, col, col2})                Mana Zone dome: swirling mana streams in a hemisphere + ground ring
     fxManaAura(g, F, t, {k, col})                         blue-gold mana flames round a figure (layer 'under')
     fxWizardCrest(g, x, y, s, o)                          Wizard King crest (crown over three-leaf clover in a ring) - screen space
     ijTimeStopScreen(f, t, {k, at, dur})                  screen process: world drains to blue-grey, a clock ripple spreads from 'at'; figures in o.keep stay coloured   */
'use strict';
const IJQ = p => { if (!p) return null; if (Array.isArray(p)) { const q = project(p); return q ? { x: q.x, y: q.y, s: q.s, z: q.z } : null; } return { x: p.x, y: p.y, s: p.s || 100, z: 1 }; };
function ijGlowStroke(g, path, col, w, core = '#ffffff', a = 1) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = a * .35; g.strokeStyle = col; g.lineWidth = w * 2.6; g.stroke(path);
  g.globalAlpha = a; g.lineWidth = w; g.stroke(path); g.globalAlpha = a * .9; g.strokeStyle = core; g.lineWidth = Math.max(1, w * .3); g.stroke(path); g.restore(); }
// ================================================================================================ CROWS
function ijDrawCrow(g, x, y, s, flap, ang, o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); if (o.flip) g.scale(1, -1); const col = o.col || '#060508', w = Math.sin(flap);
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, s * .55, s * .2, 0, 0, TAU); g.fill();                         // body
  g.beginPath(); g.arc(s * .52, -s * .05, s * .16, 0, TAU); g.fill();                                               // head
  g.beginPath(); g.moveTo(s * .64, -s * .1); g.lineTo(s * .92, -s * .02); g.lineTo(s * .64, s * .03); g.fill();       // beak
  g.beginPath(); g.moveTo(-s * .5, 0); g.lineTo(-s * .95, -s * .16); g.lineTo(-s * .88, s * .02); g.lineTo(-s * .95, s * .16); g.closePath(); g.fill();   // tail
  for (const sd of [-1, 1]) { const wy = -sd * s * (.15 + .85 * Math.max(0, w * sd + .25)), tip = s * (.25 + .9 * Math.abs(w + sd * .3));   // wings (near one bigger)
    g.beginPath(); g.moveTo(s * .22, -s * .02); g.quadraticCurveTo(s * .05, wy * .6 - sd * s * .1, -s * .25, wy * 1.05); g.lineTo(-s * .05, wy * .55); g.lineTo(-s * .35, wy * .7); g.lineTo(-s * .12, s * .02 * sd); g.closePath(); g.globalAlpha = sd > 0 ? 1 : .9; g.fill(); g.globalAlpha = 1; void tip; }
  if (o.rim) { g.strokeStyle = rgba(o.rim, .55); g.lineWidth = Math.max(1, s * .04); g.beginPath(); g.ellipse(0, 0, s * .55, s * .2, 0, Math.PI * 1.05, Math.PI * 1.9); g.stroke(); }
  if (o.eye !== false && s > 6) { g.fillStyle = '#ff2a1a'; g.beginPath(); g.arc(s * .58, -s * .09, Math.max(1, s * .045), 0, TAU); g.fill(); if (s > 18) { g.globalCompositeOperation = 'lighter'; glow(g, s * .58, -s * .09, s * .18, '#ff2a1a', .35); } }
  g.restore();
}
function fxCrows(g, t, o = {}) {
  if (t < 0) return; const n = Math.round((o.n || 40) * (o.k == null ? 1 : Math.min(1, o.k))), c = o.c || [0, 2, 0], r = o.r || 3, dur = o.dur || 1.2, mode = o.mode || 'swirl', seed = o.seed || 7, sz = o.size || .42, list = [];
  for (let i = 0; i < n; i++) { const h1 = hash(seed + i * 3.1), h2 = hash(seed + i * 5.7), h3 = hash(seed + i * 9.3); let p, v;
    if (mode === 'swirl') { const a = h1 * TAU + t * (1.4 + h2) * (h3 > .2 ? 1 : -1), rr = r * (.45 + .6 * h2), y = c[1] + (h3 - .5) * r * .9 + Math.sin(t * 2 + i) * .3; p = [c[0] + Math.cos(a) * rr, y, c[2] + Math.sin(a) * rr]; v = [-Math.sin(a), 0, Math.cos(a)]; }
    else if (mode === 'burst' || mode === 'gather') { let u = clamp((t - h3 * .12) / dur, 0, 1); if (mode === 'gather') u = 1 - u; const e = 1 - Math.pow(1 - u, 2.2), th = h1 * TAU, ph = (h2 - .35) * 1.6, d = [Math.cos(th) * Math.cos(ph), Math.sin(ph) + .25, Math.sin(th) * Math.cos(ph)];
      p = vAdd(c, vMul(d, r * (.15 + e * (.7 + .6 * h3)))); p[1] += u * u * 1.5; v = mode === 'gather' ? vMul(d, -1) : d; if ((mode === 'burst' && u >= 1 && o.fade !== false) || (mode === 'gather' && u <= 0)) continue; }
    else { const a = o.from || [-6, 2, 0], b = o.to || [6, 2, 0], u = clamp((t - h1 * (o.stagger || .5)) / dur, 0, 1); if (u <= 0 || u >= 1) continue; const side = vNorm(vCross(vSub(b, a), [0, 1, 0])), wob = Math.sin(u * 6 + i) * (o.spread || .8);
      p = vAdd(vLerp(a, b, u), vAdd(vMul(side, (h2 - .5) * (o.spread || .8) * 2 + wob * .3), [0, (h3 - .5) * (o.spread || .8) * 1.4 + Math.sin(u * Math.PI) * (o.arc || 0), 0])); v = vNorm(vSub(b, a)); }
    const q = IJQ(p); if (!q || q.z < .3) continue; const q2 = IJQ(vAdd(p, vMul(v, .3))); const ang = q2 ? Math.atan2(q2.y - q.y, q2.x - q.x) : 0; list.push({ q, ang, flap: t * (13 + 5 * h2) + i * 1.7, s: sz * q.s * (.75 + .5 * h1) }); }
  list.sort((a, b) => b.q.z - a.q.z); for (const C of list) ijDrawCrow(g, C.q.x, C.q.y, C.s, C.flap, C.ang, { flip: Math.cos(C.ang) < 0, eye: o.eyes !== false, rim: o.rim });
}
function fxFeathers(g, c, t, o = {}) { if (t < 0) return; const n = o.n || 24, r = o.r || 2.5, dur = o.dur || 2.5;
  for (let i = 0; i < n; i++) { const u = clamp((t - hash(i * 3) * .3) / dur, 0, 1); if (u <= 0 || u >= 1) continue; const th = hash(i * 7) * TAU, p = [c[0] + Math.cos(th) * r * hash(i * 11) + Math.sin(t * 2 + i) * .3, c[1] + 1 - u * 2.5, c[2] + Math.sin(th) * r * hash(i * 11)], q = IJQ(p); if (!q) continue;
    const s = .12 * q.s; g.save(); g.translate(q.x, q.y); g.rotate(Math.sin(t * 3 + i) * .8 + i); g.globalAlpha = Math.min(1, (1 - u) * 3); g.fillStyle = '#08070c'; g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .45, -s * .2, 0, s); g.quadraticCurveTo(-s * .4, -s * .2, 0, -s); g.fill();
    g.strokeStyle = rgba('#5a5a7a', .5); g.lineWidth = Math.max(.8, s * .06); g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s * 1.1); g.stroke(); g.restore(); } }
IJ.cloneAlpha = (t, dur = .35) => clamp(1 - t / dur, 0, 1);
function fxCrowClone(g, F, ft, t, o = {}) { if (t < 0) return; const S = figSkel(F, ft), c = S.J.abd; fxCrows(g, t, { c, n: o.n || 46, r: o.r || 3.2, mode: 'burst', dur: o.dur || .9, seed: o.seed || 11, size: .38 }); fxFeathers(g, c, t, { n: 18, r: 1.5 }); }
// ================================================================================================ AMATERASU (black flames)
function ijFlameTongue(g, x, y, w, h, t, seed, fill, rim) {
  const n = 9, L = [], R = []; for (let i = 0; i <= n; i++) { const u = i / n, wv = w * (1 - u) * (1 - u * .35), sw = Math.sin(u * 5 - t * 9 + seed) * w * .35 * u + (fbm(seed + u * 3 - t * 2) - .5) * w * .6 * u;
    L.push([x - wv + sw, y - h * u]); R.push([x + wv + sw, y - h * u]); }
  g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const p of L) g.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
  if (rim) { g.save(); g.strokeStyle = rim; g.lineWidth = Math.max(1.5, w * .22); g.lineJoin = 'round'; g.stroke(); g.restore(); } g.fillStyle = fill; g.fill();
}
function fxAmaterasu(g, c, t, o = {}) {
  if (t < 0) return; const k = (o.k == null ? 1 : o.k) * smooth(t / .2), n = o.n || 26, r = o.r || 1.6, h = o.h || 1.6, seed = o.seed || 3; if (k <= 0) return;
  const pts = []; for (let i = 0; i < n; i++) { const a = hash(seed + i * 2.3) * TAU, rr = r * Math.sqrt(hash(seed + i * 4.1)), p = [c[0] + Math.cos(a) * rr, c[1], c[2] + Math.sin(a) * rr], q = IJQ(p); if (q) pts.push({ q, i, hh: h * (.5 + .7 * hash(seed + i * 6.7)) * (1 - rr / r * .5) }); }
  pts.sort((a, b) => b.q.z - a.q.z); const cq = IJQ(c);
  if (cq) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, cq.x, cq.y - h * .4 * cq.s, r * 1.8 * cq.s, '#8a0a2a', .28 * k); g.restore(); }
  for (const P of pts) { const tf = onN(t, 2) + P.i * .37, w = Math.min(.32 * P.q.s, 120) * k, hh = Math.min(P.hh * P.q.s, 520) * k * (.8 + .25 * Math.sin(tf * 7 + P.i));
    ijFlameTongue(g, P.q.x, P.q.y, w, hh, tf, P.i * 1.3 + seed, '#040206', rgba('#9a0a24', .95));
    ijFlameTongue(g, P.q.x, P.q.y - hh * .05, w * .55, hh * .7, tf + .3, P.i * 2.1 + seed, '#1a0414', null); }
  for (let i = 0; i < 18 * k; i++) { const u = (t * .6 + hash(i * 9 + seed)) % 1, a = hash(i * 5 + seed) * TAU, p = [c[0] + Math.cos(a) * r * .8, c[1] + u * h * 2.2, c[2] + Math.sin(a) * r * .8], q = IJQ(p); if (!q) continue;   // black embers
    g.fillStyle = rgba('#050307', 1 - u); g.beginPath(); g.arc(q.x + Math.sin(t * 4 + i) * 6, q.y, clamp(.05 * q.s, 1.5, 6), 0, TAU); g.fill(); }
}
function fxAmaterasuOn(g, F, ft, t, o = {}) { if (t < 0) return; const S = figSkel(F, ft), k = (o.k == null ? 1 : o.k) * smooth(t / .25);
  ['abd', 'chest', 'shL', 'shR', 'elL', 'elR', 'handL', 'handR', 'knL', 'knR', 'pelvis', 'anL', 'anR'].forEach((j, i) => { const p = S.J[j]; if (!p) return; fxAmaterasu(g, p, t - i * .02, { r: .28, h: (o.h || .9) * (j.startsWith('an') ? .8 : 1), n: 4, k, seed: i * 7 + 1 }); }); }
// ================================================================================================ GREAT FIREBALL
function fxFireball(g, a, dir, t, o = {}) {
  if (t < 0) return; const ch = o.charge || .35, R = o.r || 2.4, sp = o.speed || 9, d = vNorm(dir), dist = Math.max(0, t - ch) * sp, travel = o.travel || 30; if (dist > travel) return;
  const grow = smooth(t / ch), c = vMad(a, d, R * .8 * grow + dist), q = IJQ(c), qa = IJQ(a); if (!q || !qa) return; const rp = R * q.s * (.35 + .65 * grow);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, rp * 2.6, '#ff6a10', .45); g.restore();
  // breath stream from the mouth to the ball
  g.save(); g.lineCap = 'round'; const gr = g.createLinearGradient(qa.x, qa.y, q.x, q.y); gr.addColorStop(0, rgba('#fff2a0', .95)); gr.addColorStop(1, rgba('#ff7a1a', .6)); g.strokeStyle = gr; g.lineWidth = Math.max(3, rp * .35); g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(q.x, q.y); g.stroke(); g.restore();
  // trailing flame licks behind the ball
  for (let i = 0; i < 16; i++) { const an = Math.atan2(qa.y - q.y, qa.x - q.x) + (hash(i * 3) - .5) * 1.6, L = rp * (.8 + 1.1 * hash(i * 7)) * (.9 + .2 * Math.sin(t * 20 + i)); g.save(); g.translate(q.x, q.y); g.rotate(an - HP);
    ijFlameTongue(g, 0, 0, rp * .35, -L, t + i, i, rgba(i % 2 ? '#ff5a10' : '#ff9a20', .85), null); g.restore(); }
  // rolling ball: dark-red rim -> orange -> yellow -> white core, flame bumps on the edge
  g.save(); g.beginPath(); for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU, rr = rp * (1 + .14 * Math.sin(an * 7 + t * 18) + .1 * (fbm(an * 2 + t * 4) - .5)); const x = q.x + Math.cos(an) * rr, y = q.y + Math.sin(an) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath();
  g.fillStyle = radial(g, q.x - rp * .15, q.y - rp * .15, rp * 1.15, [[0, '#ffffff'], [.25, '#fff4a0'], [.55, '#ffb020'], [.8, '#ff5a10'], [1, '#c81a08']]); g.fill(); g.lineWidth = Math.max(2, rp * .05); g.strokeStyle = rgba('#5a0a04', .8); g.stroke();
  g.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const an = t * 6 + i * 1.05; g.strokeStyle = rgba('#fff0b0', .5); g.lineWidth = rp * .07; g.beginPath(); g.arc(q.x, q.y, rp * (.35 + i * .09), an, an + 1.4); g.stroke(); } g.restore();
}
// ================================================================================================ SUSANOO
function fxSusanoo(g, t, o = {}) {
  const st = o.stage == null ? 4 : o.stage, k = o.k == null ? 1 : o.k; if (k <= 0 || st <= 0) return;
  const at = o.at || [0, 0, 0], yaw = o.yaw || 0, Hs = o.scale || (st < 2.5 ? 3.6 : 11), col = o.col || IJ.col.susanoo, core = o.core || '#ffe0c8', dark = shadeHex(col, -.55), lite = mixHex(col, '#ffffff', .45);
  const rt = [Math.cos(yaw), 0, -Math.sin(yaw)], fw = [Math.sin(yaw), 0, Math.cos(yaw)], fl = .85 + .15 * Math.sin(t * 23) * Math.sin(t * 7.1);
  const W3 = (x, y, z = 0) => vAdd(at, vAdd(vMul(rt, x * Hs), vAdd([0, y * Hs, 0], vMul(fw, z * Hs))));
  const P2 = (x, y, z = 0) => { const q = project(W3(x, y, z)); return q ? [q.x, q.y] : null; };
  const path = (pts, close) => { const p = new Path2D(); let ok = false; for (const xy of pts) { const q = P2(xy[0], xy[1], xy[2] || 0); if (!q) continue; ok ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); ok = true; } if (close) p.closePath(); return p; };
  const smoothPath = (pts, close) => { const qs = pts.map(xy => P2(xy[0], xy[1], xy[2] || 0)).filter(Boolean), p = new Path2D(); if (qs.length < 3) return p; const n = qs.length, m = (i) => qs[(i + n) % n];
    if (close) { const s0 = [(m(-1)[0] + m(0)[0]) / 2, (m(-1)[1] + m(0)[1]) / 2]; p.moveTo(s0[0], s0[1]); for (let i = 0; i < n; i++) { const c0 = m(i), c1 = m(i + 1); p.quadraticCurveTo(c0[0], c0[1], (c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2); } p.closePath(); }
    else { p.moveTo(qs[0][0], qs[0][1]); for (let i = 1; i < n - 1; i++) p.quadraticCurveTo(qs[i][0], qs[i][1], (qs[i][0] + qs[i + 1][0]) / 2, (qs[i][1] + qs[i + 1][1]) / 2); p.lineTo(qs[n - 1][0], qs[n - 1][1]); } return p; };
  const qb = project(W3(0, .5)); if (!qb) return; const px = Hs * qb.s, lw = Math.max(2, (o.w || 1) * .011 * px);
  const solid = (pp, a, y0 = .0, y1 = .9) => { const q0 = P2(0, y0), q1 = P2(0, y1); g.save(); g.globalAlpha = k * a; const gr = q0 && q1 ? g.createLinearGradient(q1[0], q1[1], q0[0], q0[1]) : null; if (gr) { gr.addColorStop(0, lite); gr.addColorStop(.45, col); gr.addColorStop(1, rgba(dark, .1)); }
    g.fillStyle = gr || col; g.fill(pp); g.clip(pp); g.globalCompositeOperation = 'lighter'; g.globalAlpha = k * a * .7; g.strokeStyle = lite; g.lineWidth = lw * 4; g.stroke(pp); g.restore(); };
  const limb = (a, b, wa, wb) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; return [[a[0] + nx * wa, a[1] + ny * wa, a[2]], [b[0] + nx * wb, b[1] + ny * wb, b[2]], [b[0] - nx * wb, b[1] - ny * wb, b[2]], [a[0] - nx * wa, a[1] - ny * wa, a[2]]]; };
  g.save();
  // chakra flames rising round the whole silhouette
  { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = k; for (let i = 0; i < 34; i++) { const h1 = hash(i * 3.3), ph = (t * (.8 + h1) + hash(i * 7.7)) % 1, x = (hash(i * 5.1) - .5) * .95, y = ph * (st > 2.5 ? 1 : .8), q = P2(x * (1 - ph * .4), y, -.05); if (!q) continue;
    glow(g, q[0], q[1], (.07 + .06 * h1) * px * (1 - ph), col, .12 * (1 - ph)); } glow(g, qb.x, qb.y, px * .55, col, .16); g.restore(); }
  const A = o.arm || 0, AL = o.armL || 0, sw = o.swing || 0, fk = clamp(st - 2.2, 0, 1), ak = clamp(st - 3.2, 0, 1), sk = clamp(st - 1, 0, 1), rk = clamp(st, 0, 1), shY = .63;
  const armPts = sg => { const a2 = sg > 0 ? A : AL; return [[sg * .3, shY - .01, .02], [sg * lerp(.45, .47, a2), lerp(.4, .62, a2), lerp(.06, .22, a2)], [sg * lerp(.42, .3, a2), lerp(.19, .8, a2), lerp(.16, .46, a2)]]; };
  // FLESH / ARMOUR body (stage 3+)
  if (fk > 0) { const body = [[-.17, -.06], [-.16, .1], [-.18, .24], [-.27, .42], [-.38, .56], [-.36, .66], [-.2, .69], [-.07, .71], [.07, .71], [.2, .69], [.36, .66], [.38, .56], [.27, .42], [.18, .24], [.16, .1], [.17, -.06]];
    const bp = smoothPath(body, true); solid(bp, .5 * fk, -.05, .75); ijGlowStroke(g, smoothPath(body, false), col, lw, core, k * fk * fl);
  }
  const drawArms = () => { if (fk <= 0) return;
    for (const sg of [-1, 1]) { const [sh, el, hd] = armPts(sg); const up = smoothPath(limb(sh, el, .075, .06), true), fo = smoothPath(limb(el, hd, .06, .05), true); solid(up, .5 * fk, .3, .7); solid(fo, .5 * fk, .2, .7); ijGlowStroke(g, up, col, lw * .8, core, k * fk * fl); ijGlowStroke(g, fo, col, lw * .8, core, k * fk * fl);
      const hp = []; for (let i = 0; i <= 12; i++) { const an = i / 12 * TAU; hp.push([hd[0] + Math.cos(an) * .055, hd[1] + Math.sin(an) * .05, hd[2]]); } const hpp = smoothPath(hp, true); solid(hpp, .55 * fk); ijGlowStroke(g, hpp, col, lw * .7, core, k * fk); } };
  if (ak > 0) { g.save(); g.globalAlpha = k * ak;   // armour detail: dark plate seams + shoulder pauldrons + belt
    for (const sg of [-1, 1]) { const sp = smoothPath([[sg * .17, .66, .05], [sg * .47, .65, .03], [sg * .52, .52, .04], [sg * .3, .5, .08]], true); solid(sp, .7); ijGlowStroke(g, sp, col, lw * .9, core, fl);
      for (let i = 0; i < 3; i++) { const sl = path([[sg * (.22 + i * .02), .6 - i * .03, .07], [sg * (.48 - i * .02), .58 - i * .03, .05]]); g.save(); g.strokeStyle = rgba(dark, .8); g.lineWidth = lw * .6; g.stroke(sl); g.restore(); } }
    for (let i = 0; i < 4; i++) { const y = .54 - i * .085, pl = smoothPath([[-.21 + i * .012, y, .1], [0, y - .035, .13], [.21 - i * .012, y, .1]]); g.save(); g.strokeStyle = rgba(dark, .85); g.lineWidth = lw * .7; g.stroke(pl); g.restore(); ijGlowStroke(g, pl, col, lw * .3, core, .5 * fl); }
    const belt = smoothPath([[-.17, .2, .1], [0, .17, .13], [.17, .2, .1]]); g.save(); g.strokeStyle = rgba(dark, .9); g.lineWidth = lw * 1.4; g.stroke(belt); g.restore(); g.restore(); }
  drawArms();
  // RIBCAGE (stage 1+), fades out under the armour
  const ribA = k * fl * (1 - ak); if (ribA > .02) { const spine = path([[0, .06, -.1], [0, lerp(.06, .66, rk), -.1]]); ijGlowStroke(g, spine, col, lw * 1.15, core, ribA);
    const nR = 6; for (let j = 0; j < nR; j++) { const kj = clamp(rk * nR - (nR - 1 - j), 0, 1); if (kj <= 0) continue; const y = .3 + j * .055, w = .17 + j * .012, d = .14;
      for (const sg of [-1, 1]) { const pts = []; for (let i = 0; i <= 14 * kj; i++) { const u = i / 14, a = u * Math.PI * .9; pts.push([sg * Math.sin(a) * w, y - Math.sin(u * Math.PI) * .02 - u * .05, -Math.cos(a) * d]); } ijGlowStroke(g, smoothPath(pts), col, lw * .85, core, ribA); } } }
  // SKELETON ARMS (stage 2, under the flesh later)
  if (sk > 0) { const skA = k * fl * (1 - fk * .8); ijGlowStroke(g, path([[-.27 * sk, shY, -.06], [.27 * sk, shY, -.06]]), col, lw, core, skA);
    for (const sg of [-1, 1]) { const [sh, el, hd] = armPts(sg), kk = clamp(sk * 2 - .4, 0, 1); if (kk <= 0) continue; ijGlowStroke(g, path([sh, el, hd].slice(0, kk > .5 ? 3 : 2)), col, lw, core, skA);
      if (kk >= 1 && fk < 1) for (let f2 = -1; f2 <= 1; f2++) ijGlowStroke(g, path([hd, [hd[0] + sg * .03 + f2 * .02, hd[1] - .06, hd[2] + .04]]), col, lw * .6, core, skA); } }
  // Yata mirror (left forearm) + gourd & Totsuka blade (right hand)
  if (ak > 0 && (o.shield || 0) > 0) { const [, el, hd] = armPts(-1), sk2 = o.shield * ak, cxy = vLerp(el, hd, .55), pts = []; for (let i = 0; i <= 32; i++) { const an = i / 32 * TAU; pts.push([cxy[0] + Math.cos(an) * .15 * sk2, cxy[1] + Math.sin(an) * .15 * sk2, cxy[2] + .1]); }
    const sp = path(pts, true), cq = P2(cxy[0], cxy[1], cxy[2] + .1); g.save(); g.globalAlpha = k * .75; if (cq) g.fillStyle = radial(g, cq[0], cq[1], .15 * px, [[0, '#fff4ea'], [.45, lite], [.85, col], [1, dark]]); g.fill(sp); g.restore(); ijGlowStroke(g, sp, col, lw * 1.2, core, k);
    for (let m = 0; m < 3; m++) { const an = t * .5 + m * TAU / 3, mq = P2(cxy[0] + Math.cos(an) * .085 * sk2, cxy[1] + Math.sin(an) * .085 * sk2, cxy[2] + .11); if (mq) { g.fillStyle = rgba(dark, k); g.beginPath(); g.arc(mq[0], mq[1], .02 * px, 0, TAU); g.fill(); } }
    const ring = []; for (let i = 0; i <= 32; i++) { const an = i / 32 * TAU; ring.push([cxy[0] + Math.cos(an) * .11 * sk2, cxy[1] + Math.sin(an) * .11 * sk2, cxy[2] + .105]); } g.save(); g.strokeStyle = rgba(dark, .8 * k); g.lineWidth = lw * .5; g.stroke(path(ring, true)); g.restore(); }
  if (fk > 0 && (o.sword || 0) > 0) { const [, , hd] = armPts(1), sk3 = o.sword, gp = smoothPath([[hd[0] - .035, hd[1] - .03, hd[2] + .02], [hd[0] + .035, hd[1] - .03, hd[2] + .02], [hd[0] + .045, hd[1] + .04, hd[2] + .02], [hd[0] + .02, hd[1] + .07, hd[2] + .02], [hd[0] + .03, hd[1] + .1, hd[2] + .02], [hd[0] - .03, hd[1] + .1, hd[2] + .02], [hd[0] - .02, hd[1] + .07, hd[2] + .02], [hd[0] - .045, hd[1] + .04, hd[2] + .02]], true);
    solid(gp, .8); ijGlowStroke(g, gp, col, lw * .7, core, k);
    const ang = lerp(1.95, -.6, sw), L = .66 * sk3, base = [hd[0], hd[1] + .1, hd[2] + .02], pts = []; for (let i = 0; i <= 22; i++) { const u = i / 22; pts.push([base[0] + Math.cos(ang) * L * u + Math.sin(u * 9 + t * 14) * .014 * u, base[1] + Math.sin(ang) * L * u, base[2] + .05 * u]); }
    const bp = smoothPath(pts); ijGlowStroke(g, bp, '#ffb08a', lw * 3, '#ffffff', k); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 4; i < 22; i += 3) { const q = P2(...pts[i]); if (q) glow(g, q[0], q[1], .05 * px, '#ffd0b0', .25 * k); } g.restore(); }
  // HEAD: skull (stage 2) -> hood + tengu mask (stage 4)
  const hk = clamp(sk * 2 - 1, 0, 1); if (hk > 0) { const cy = .78; g.save(); g.globalAlpha = k * hk;
    const skull = []; for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU; skull.push([Math.cos(an) * .085, cy + Math.sin(an) * .1, .03]); } const spp = smoothPath(skull, true);
    if (ak < 1) { g.save(); g.globalAlpha *= (1 - ak); solid(spp, .35); ijGlowStroke(g, spp, col, lw, core, fl); ijGlowStroke(g, path([[-.05, .72, .06], [-.035, .675, .07], [.035, .675, .07], [.05, .72, .06]]), col, lw * .8, core, fl); g.restore(); }
    if (ak > 0) { g.save(); g.globalAlpha *= ak; const hood = smoothPath([[-.14, .66, -.02], [-.16, .8, 0], [-.11, .92, 0], [0, .97, 0], [.11, .92, 0], [.16, .8, 0], [.14, .66, -.02], [0, .68, .05]], true); solid(hood, .7, .66, .97); ijGlowStroke(g, hood, col, lw * 1.1, core, fl);
      const face = smoothPath([[-.09, .7, .06], [-.1, .8, .07], [0, .86, .09], [.1, .8, .07], [.09, .7, .06], [0, .67, .08]], true); g.save(); g.globalAlpha *= .85; g.fillStyle = rgba(mixHex(col, '#ffd8c8', .35), .9); g.fill(face); g.restore(); ijGlowStroke(g, face, dark, lw * .5, core, .6 * fl);
      const nose = smoothPath([[-.022, .79, .1], [-.01, .73, .18], [0, .66, .24], [.01, .73, .18], [.022, .79, .1]], true); g.save(); g.fillStyle = rgba(lite, .95); g.fill(nose); g.strokeStyle = rgba(dark, .9); g.lineWidth = lw * .45; g.stroke(nose); g.restore(); g.restore(); }
    for (const sg of [-1, 1]) { const q = P2(sg * .038, .795, .1); if (!q) continue; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q[0], q[1], .035 * px, '#ffd0b0', .9); g.restore();
      g.fillStyle = '#fff4ea'; g.beginPath(); g.ellipse(q[0], q[1], .03 * px, .01 * px, -sg * .35, 0, TAU); g.fill(); }
    g.restore(); }
  g.restore();
}
// ================================================================================================ MANGEKYO INSERT (extreme close-up eye band)
function mangekyoInsert(g, t, o = {}) {
  const w = o.w || W, h = o.h || 300, x = o.x == null ? W / 2 : o.x, y = o.y == null ? H / 2 : o.y, open = o.open == null ? 1 : o.open, R = h * .36;
  g.save(); g.beginPath(); g.rect(x - w / 2, y - h / 2, w, h); g.clip();
  g.fillStyle = o.bg || IJ.col.iSkin; g.fillRect(x - w / 2, y - h / 2, w, h); g.fillStyle = rgba('#a87a6a', .35); g.fillRect(x - w / 2, y - h / 2, w, h * .28);
  const ex = x + (o.side === 'left' ? -1 : 1) * w * .06;
  // eye almond
  const lid = (s) => { g.beginPath(); g.moveTo(ex - R * 2.4, y + R * .1); g.quadraticCurveTo(ex - R * .3, y - R * 1.55 * open * s, ex + R * 2.5, y - R * .25); g.quadraticCurveTo(ex + R * .2, y + R * 1.15 * open * s, ex - R * 2.4, y + R * .1); g.closePath(); };
  if (open > .04) { g.save(); lid(1); g.fillStyle = '#f6efe8'; g.fill(); g.clip(); const lk = o.look || [0, 0]; IJ.sharIris(g, ex + lk[0] * R, y + lk[1] * R, R, { k: o.k == null ? 1 : o.k, mk: o.mk || 0, spin: o.spin != null ? o.spin : t * 2 });
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(ex - R * .35, y - R * .4, R * .16, R * .1, -.5, 0, TAU); g.fill();
    g.fillStyle = rgba('#3a0a10', .35); g.beginPath(); g.ellipse(ex, y - R * 1.3 * open, R * 2.6, R * .7, 0, 0, TAU); g.fill(); g.restore(); }
  g.strokeStyle = '#100808'; g.lineCap = 'round'; g.lineWidth = R * .14; g.beginPath(); g.moveTo(ex - R * 2.5, y + R * .1); g.quadraticCurveTo(ex - R * .3, y - R * 1.6 * open, ex + R * 2.6, y - R * .28); g.stroke();
  g.lineWidth = R * .05; g.beginPath(); g.moveTo(ex - R * 2.2, y + R * .2); g.quadraticCurveTo(ex + R * .2, y + R * 1.2 * Math.max(open, .15), ex + R * 2.3, y - R * .2); g.stroke();
  g.lineWidth = R * .04; g.globalAlpha = .7; g.beginPath(); g.moveTo(ex - R * 1.9, y - R * 1.0 * open - R * .25); g.quadraticCurveTo(ex, y - R * 1.95 * open - R * .2, ex + R * 2.1, y - R * .75); g.stroke(); g.globalAlpha = 1;   // crease
  // tear trough under the eye
  g.strokeStyle = rgba('#7a4a44', .9); g.lineWidth = R * .06; g.beginPath(); g.moveTo(ex - R * 1.6, y + R * .7); g.quadraticCurveTo(ex - R * 1.2, y + R * 1.3, ex - R * .5, y + R * 1.8); g.stroke();
  if (o.bleed) { g.fillStyle = '#a0000e'; const L = h * .9 * o.bleed; g.beginPath(); g.moveTo(ex - R * .9, y + R * .5); g.quadraticCurveTo(ex - R * .8, y + R * .5 + L * .5, ex - R * .95, y + R * .5 + L); g.arc(ex - R * .85, y + R * .5 + L, R * .12, Math.PI, 0, true); g.quadraticCurveTo(ex - R * .6, y + R * .5 + L * .4, ex - R * .65, y + R * .5); g.fill(); }
  // hair strands across the top
  g.fillStyle = IJ.col.iHair; for (let i = 0; i < 5; i++) { const hx = x - w / 2 + (i + .3) * w / 5 + (hash(i) - .5) * 80; g.beginPath(); g.moveTo(hx - 40, y - h / 2); g.quadraticCurveTo(hx + 10, y - h * .2, hx + 60 + i * 8, y - h * (.05 + hash(i * 3) * .2)); g.lineTo(hx + 90, y - h / 2); g.fill(); }
  g.restore();
  g.save(); g.strokeStyle = '#000'; g.lineWidth = 6; g.strokeRect(x - w / 2, y - h / 2, w, h); g.restore();
}
// ================================================================================================ TSUKUYOMI / IZANAMI screen processes
function ijTsukuyomiScreen(f, t, o = {}) { if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const gg = c.getContext('2d'), w = c.width, h = c.height;
  gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; const gr = gg.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a0006'); gr.addColorStop(.55, '#b0101a'); gr.addColorStop(1, '#16020a'); gg.fillStyle = gr; gg.fillRect(0, 0, w, h);
  gg.globalAlpha = k * .9; gg.fillStyle = '#050003'; for (let i = 0; i < 7; i++) { const cx = (hash(i * 3) * 1.2 - .1) * w + Math.sin(t * .2 + i) * 20, cy = (.08 + hash(i * 7) * .3) * h, rw = (.12 + .1 * hash(i)) * w; gg.beginPath(); gg.ellipse(cx, cy, rw, rw * .16, 0, 0, TAU); gg.fill(); }
  if (o.moon !== false) { const mx = w * .78, my = h * .2, mr = h * .14; gg.globalAlpha = k; gg.fillStyle = '#0a0004'; gg.beginPath(); gg.arc(mx, my, mr, 0, TAU); gg.fill(); gg.strokeStyle = '#ff5a4a'; gg.lineWidth = h * .006; gg.stroke(); }
  gg.globalAlpha = k * .7; gg.strokeStyle = '#ffffff'; gg.lineWidth = Math.max(1, h * .0015); for (let i = 0; i < 9; i++) { const yy = h * (.7 + i * i * .006); gg.beginPath(); gg.moveTo(0, yy); gg.lineTo(w, yy); gg.stroke(); }
  gg.globalAlpha = k; gg.filter = 'invert(1) grayscale(1) contrast(1.35)'; gg.drawImage(layer('chars'), 0, 0); gg.filter = 'none'; gg.restore(); }); }
function ijLoopScreen(f, t, o = {}) { if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const gg = c.getContext('2d'), w = c.width, h = c.height, n = o.n || 3, ch = layer('chars');
  gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalCompositeOperation = 'multiply'; gg.globalAlpha = .55 * k; gg.fillStyle = '#ff9a8a'; gg.fillRect(0, 0, w, h); gg.globalCompositeOperation = 'source-over';
  for (let i = 1; i <= n; i++) { gg.globalAlpha = .28 * k / i; gg.filter = 'sepia(1) hue-rotate(-30deg) saturate(3)'; gg.drawImage(ch, -i * w * (o.dt || .035), 0); } gg.filter = 'none';
  const st = Math.floor(t * 24) % 6; if (st < 2) { gg.globalAlpha = .18 * k; gg.fillStyle = '#000'; for (let y = 0; y < h; y += 6) gg.fillRect(0, y, w, 2); } gg.restore();
  g.save(); g.globalAlpha = k; g.strokeStyle = '#ff2a2a'; g.lineCap = 'round'; for (let r = 0; r < 3; r++) { const R = 260 + r * 150, a0 = -t * (2.2 - r * .4) + r; g.lineWidth = 9 - r * 2; g.beginPath(); g.arc(W / 2, H / 2, R, a0, a0 + 4.6); g.stroke();
    const ax = W / 2 + Math.cos(a0) * R, ay = H / 2 + Math.sin(a0) * R, ta = a0 - HP; g.fillStyle = '#ff2a2a'; g.beginPath(); g.moveTo(ax + Math.cos(ta) * 30, ay + Math.sin(ta) * 30); g.lineTo(ax + Math.cos(ta + 2.4) * 22, ay + Math.sin(ta + 2.4) * 22); g.lineTo(ax + Math.cos(ta - 2.4) * 22, ay + Math.sin(ta - 2.4) * 22); g.fill(); }
  g.restore(); }); }
// ================================================================================================ JULIUS: TIME MAGIC
const IJ_ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
function ijPlane(n) { const nn = vNorm(n), ref = Math.abs(nn[1]) > .9 ? [1, 0, 0] : [0, 1, 0], u = vNorm(vCross(ref, nn)), v = vCross(nn, u); return { n: nn, u, v }; }
function fxClockCircle(g, c, n, t, o = {}) {
  if (t < 0) return; const k = (o.k == null ? 1 : o.k) * smooth(t / (o.grow || .25)); if (k <= 0) return; const R = (o.r || 2) * (.6 + .4 * k), col = o.col || IJ.col.time, col2 = o.col2 || IJ.col.clock, B = ijPlane(n), spin = (o.spin == null ? .6 : o.spin) * t;
  const P = (r, a) => project(vAdd(c, vAdd(vMul(B.u, Math.cos(a) * r), vMul(B.v, Math.sin(a) * r))));
  const ring = (r, a0 = 0, a1 = TAU, N = 64) => { const p = new Path2D(); let ok = false; for (let i = 0; i <= N; i++) { const q = P(r, lerp(a0, a1, i / N)); if (!q) { ok = false; continue; } ok ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y); ok = true; } return p; };
  const qc = project(c); if (!qc) return; const s = qc.s, lw = Math.max(1.5, .035 * s * (o.w || 1));
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, qc.x, qc.y, R * s * 1.2, col2, .14 * k); g.globalAlpha = k;
  ijGlowStroke(g, ring(R), col, lw * 1.3, '#fffbe8', k); ijGlowStroke(g, ring(R * .9), col, lw * .6, '#fffbe8', k * .8); ijGlowStroke(g, ring(R * .56), col2, lw * .7, '#ffffff', k * .8);
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU + spin * .2, L = i % 5 ? .04 : .09, p0 = P(R * .9, a), p1 = P(R * (.9 - L), a); if (!p0 || !p1) continue; g.strokeStyle = rgba(col, k); g.lineWidth = i % 5 ? lw * .35 : lw * .7; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke(); }
  // gear ring (rotating opposite)
  { const gp = new Path2D(); const N = 24; for (let i = 0; i <= N * 4; i++) { const a = i / (N * 4) * TAU - spin * .5, rr = R * (i % 4 < 2 ? .66 : .61), q = P(rr, a); if (q) i ? gp.lineTo(q.x, q.y) : gp.moveTo(q.x, q.y); } ijGlowStroke(g, gp, col2, lw * .5, '#ffffff', k * .8); }
  if (o.numerals !== false) { g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 12; i++) { const a = HP - i / 12 * TAU, q = P(R * .76, a); if (!q) continue; const fs = Math.max(8, R * .13 * s); g.save(); g.translate(q.x, q.y); g.font = `900 ${fs}px "Cinzel", "Caladea", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = rgba('#fff6d0', k); g.shadowColor = col; g.shadowBlur = fs * .5; g.fillText(IJ_ROMAN[i], 0, 0); g.restore(); } g.globalCompositeOperation = 'lighter'; }
  // pentagram-like star inside (Black Clover circle grammar)
  { const sp = new Path2D(); for (let i = 0; i <= 5; i++) { const q = P(R * .54, -HP + i * 2 * TAU / 5 + spin * .3); if (q) i ? sp.lineTo(q.x, q.y) : sp.moveTo(q.x, q.y); } ijGlowStroke(g, sp, col, lw * .45, '#fffbe8', k * .6); }
  if (o.hands !== false) { const ah = (o.handsT == null ? t : o.handsT), hh = P(R * .32, HP - ah * .8), mm = P(R * .48, HP - ah * 9.6); g.lineCap = 'round';
    if (hh) ijGlowStroke(g, new Path2D(`M${qc.x} ${qc.y} L${hh.x} ${hh.y}`), col, lw * 1.4, '#ffffff', k); if (mm) ijGlowStroke(g, new Path2D(`M${qc.x} ${qc.y} L${mm.x} ${mm.y}`), col, lw * .9, '#ffffff', k); glow(g, qc.x, qc.y, lw * 3, '#ffffff', .8 * k); }
  g.restore();
}
function fxChronoStasis(g, c, t, o = {}) {
  if (t < 0) return; const k = (o.k == null ? 1 : o.k) * smooth(t / .2), R = o.r || 1.3, qc = IJQ(c); if (!qc || k <= 0) return; const rp = R * qc.s;
  g.save(); g.globalAlpha = k; g.fillStyle = radial(g, qc.x, qc.y, rp, [[0, rgba('#8ad8ff', .05)], [.85, rgba('#8ad8ff', .12)], [1, rgba('#f6d36a', .35)]]); g.beginPath(); g.arc(qc.x, qc.y, rp, 0, TAU); g.fill();
  g.globalCompositeOperation = 'lighter'; ijGlowStroke(g, (() => { const p = new Path2D(); p.arc(qc.x, qc.y, rp, 0, TAU); return p; })(), IJ.col.time, Math.max(2, rp * .03), '#fffbe8', k);
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI + t * .25, p = new Path2D(); p.ellipse(qc.x, qc.y, rp * Math.abs(Math.cos(a)), rp, 0, 0, TAU); ijGlowStroke(g, p, IJ.col.clock, Math.max(1, rp * .01), '#ffffff', .5 * k); }
  { const p = new Path2D(); p.ellipse(qc.x, qc.y, rp, rp * .28, 0, 0, TAU); ijGlowStroke(g, p, IJ.col.time, Math.max(1.5, rp * .016), '#ffffff', .8 * k); }
  g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 12; i++) { const a = -HP + i / 12 * TAU, x = qc.x + Math.cos(a) * rp * .86, y = qc.y + Math.sin(a) * rp * .86, fs = Math.max(9, rp * .1); g.font = `900 ${fs}px "Cinzel", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba('#fff2c0', .9); g.fillText(IJ_ROMAN[i], x, y); }
  for (let i = 0; i < 30; i++) { const a = hash(i * 3) * TAU, rr = rp * Math.sqrt(hash(i * 7)) * .8, x = qc.x + Math.cos(a) * rr, y = qc.y + Math.sin(a) * rr; g.fillStyle = rgba(i % 2 ? '#fff6d0' : '#bfefff', .9); g.fillRect(x, y, 3, 3); }   // frozen sparks
  if (o.lock) { g.strokeStyle = rgba('#f6d36a', .95); g.lineWidth = Math.max(2, rp * .025); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; g.beginPath(); g.moveTo(qc.x + Math.cos(a) * rp, qc.y + Math.sin(a) * rp); g.lineTo(qc.x + Math.cos(a) * rp * 1.35, qc.y + Math.sin(a) * rp * 1.35); g.stroke(); } }
  g.restore();
}
function fxTimeBullets(g, a, b, t, o = {}) { if (t < 0) return; const n = o.n || 7, dur = o.dur || .45, sp = o.spread || .9, side = vNorm(vCross(vSub(b, a), [0, 1, 0]));
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const u = clamp((t - i * .05) / dur, 0, 1); if (u <= 0 || u >= 1) continue; const off = vAdd(vMul(side, (hash(i * 3) - .5) * sp * 2 * (1 - u)), [0, (hash(i * 7) - .5) * sp * (1 - u), 0]), p = vAdd(vLerp(a, b, easeIn(u) * .5 + u * .5), off), p0 = vAdd(vLerp(a, b, Math.max(0, u - .12)), off);
    const q = IJQ(p), q0 = IJQ(p0); if (!q || !q0) continue; const ang = Math.atan2(q.y - q0.y, q.x - q0.x), L = Math.hypot(q.x - q0.x, q.y - q0.y), s = Math.max(4, .12 * q.s);
    g.strokeStyle = rgba(o.col || IJ.col.time, .5); g.lineWidth = s * .5; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q.x, q.y); g.stroke();
    g.save(); g.translate(q.x, q.y); g.rotate(ang); g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(s * 2.2, 0); g.lineTo(s * .4, -s * .55); g.lineTo(-s * 1.4, -s * .18); g.lineTo(-s * 1.8, 0); g.lineTo(-s * 1.4, s * .18); g.lineTo(s * .4, s * .55); g.closePath(); g.fill();
    g.strokeStyle = o.col || IJ.col.time; g.lineWidth = Math.max(1, s * .2); g.stroke(); g.beginPath(); g.arc(-s * .5, 0, s * .35, 0, TAU); g.stroke(); glow(g, 0, 0, s * 3, o.col || IJ.col.time, .4); g.restore(); void L; } g.restore(); }
function fxTimeRewind(g, c, t, o = {}) { if (t < 0) return; const k = o.k == null ? 1 : o.k, qc = IJQ(c); if (!qc) return; const rp = (o.r || 1.6) * qc.s;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = k; for (let r = 0; r < 3; r++) { const R = rp * (.7 + r * .25), a0 = t * (3 - r * .6) + r * 2, p = new Path2D(); p.arc(qc.x, qc.y, R, a0, a0 + 4.2); ijGlowStroke(g, p, r === 1 ? IJ.col.clock : IJ.col.time, Math.max(2, rp * .03), '#ffffff', k);
    const ax = qc.x + Math.cos(a0) * R, ay = qc.y + Math.sin(a0) * R, ta = a0 - HP, s = rp * .08; g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(ax + Math.cos(ta) * s, ay + Math.sin(ta) * s); g.lineTo(ax + Math.cos(ta + 2.4) * s * .8, ay + Math.sin(ta + 2.4) * s * .8); g.lineTo(ax + Math.cos(ta - 2.4) * s * .8, ay + Math.sin(ta - 2.4) * s * .8); g.fill(); }
  for (let i = 0; i < 26; i++) { const a = hash(i * 5) * TAU, u = (1 - ((t * 1.3 + hash(i * 9)) % 1)), r0 = rp * (.3 + 1.1 * u); g.strokeStyle = rgba('#bfefff', .6 * u); g.lineWidth = 2; g.beginPath(); g.moveTo(qc.x + Math.cos(a) * r0, qc.y + Math.sin(a) * r0); g.lineTo(qc.x + Math.cos(a) * (r0 + rp * .2), qc.y + Math.sin(a) * (r0 + rp * .2)); g.stroke(); }
  g.restore(); }
function fxHourglass(g, p, t, o = {}) { const q = IJQ(p); if (!q) return; const s = (o.size || .5) * q.s, k = o.k == null ? 1 : o.k, fl = o.flow == null ? (t * .25) % 1 : o.flow; if (k <= 0) return;
  g.save(); g.translate(q.x, q.y + Math.sin(t * 2) * s * .05); g.rotate(Math.sin(t * .8) * .1); g.globalAlpha = k; g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, s * 1.4, IJ.col.time, .35); g.globalCompositeOperation = 'source-over';
  const glass = () => { g.beginPath(); g.moveTo(-s * .4, -s * .55); g.lineTo(s * .4, -s * .55); g.quadraticCurveTo(s * .4, -s * .1, s * .05, 0); g.quadraticCurveTo(s * .4, s * .1, s * .4, s * .55); g.lineTo(-s * .4, s * .55); g.quadraticCurveTo(-s * .4, s * .1, -s * .05, 0); g.quadraticCurveTo(-s * .4, -s * .1, -s * .4, -s * .55); g.closePath(); };
  glass(); g.fillStyle = 'rgba(200,240,255,.18)'; g.fill(); g.save(); glass(); g.clip(); g.fillStyle = IJ.col.time; g.fillRect(-s * .5, -s * .55 + s * .5 * fl, s, s * .5 * (1 - fl)); g.fillRect(-s * .5, s * .55 - s * .5 * fl, s, s * .5 * fl); g.fillRect(-s * .02, -s * .05, s * .04, s * .55); g.restore();
  glass(); g.strokeStyle = '#fffbe8'; g.lineWidth = Math.max(1.5, s * .035); g.stroke(); g.fillStyle = IJ.col.gold; g.strokeStyle = IJ.col.goldDark; for (const sy of [-1, 1]) { g.beginPath(); g.rect(-s * .5, sy * s * .55 - (sy < 0 ? s * .08 : 0), s, s * .08); g.fill(); g.stroke(); } g.restore(); }
function fxGrimoire(g, p, t, o = {}) { const q = IJQ(p); if (!q) return; const s = (o.size || .32) * q.s, k = o.k == null ? 1 : o.k, op = o.open == null ? 1 : o.open; if (k <= 0) return;
  g.save(); g.translate(q.x, q.y + Math.sin(t * 2.2) * s * .08); g.rotate(-.12 + Math.sin(t * 1.3) * .05); g.globalAlpha = k;
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 0, -s * .2, s * 1.8, o.glow || IJ.col.time, .4); g.restore();
  const cw = s * .7, ch = s * .9, spread = op * .9; for (const sd of [-1, 1]) { g.save(); g.scale(sd, 1); g.transform(1, -.18 * spread, 0, 1, 0, 0); g.fillStyle = '#5a3a1e'; g.strokeStyle = '#1a0e06'; g.lineWidth = Math.max(1, s * .03); g.beginPath(); g.rect(0, -ch / 2, cw * (.3 + .7 * spread), ch); g.fill(); g.stroke();
    if (spread > .3) { g.fillStyle = '#fbf2dc'; g.beginPath(); g.rect(s * .02, -ch / 2 + s * .04, cw * (.3 + .7 * spread) - s * .06, ch - s * .08); g.fill(); g.strokeStyle = rgba('#8a6a3a', .6); g.lineWidth = Math.max(.6, s * .012); for (let i = 0; i < 6; i++) { const yy = -ch * .35 + i * ch * .12; g.beginPath(); g.moveTo(s * .08, yy); g.lineTo(cw * .8 * spread, yy); g.stroke(); } }
    g.restore(); }
  if (o.flip) { const u = (t * 3) % 1; g.save(); g.scale(Math.cos(u * Math.PI), 1); g.fillStyle = '#fffaf0'; g.fillRect(0, -ch / 2 + s * .04, cw * .9, ch - s * .08); g.restore(); }
  if (spread < .4) { g.save(); g.translate(cw * .3 * .5, 0); ijClover(g, 0, 0, s * .22, IJ.col.gold, 3); g.restore(); }
  g.restore(); }
function ijClover(g, x, y, r, col, leaves = 3) { g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = shadeHex(col, -.5); g.lineWidth = Math.max(1, r * .08); for (let i = 0; i < leaves; i++) { g.save(); g.rotate(-HP + i / leaves * TAU); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(r * .2, -r * .3, r * 1.1, -r * .55, r * .95, 0); g.bezierCurveTo(r * 1.1, r * .55, r * .2, r * .3, 0, 0); g.fill(); g.stroke(); g.restore(); }
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(r * .1, r * .7, -r * .15, r * 1.1); g.lineWidth = Math.max(1, r * .14); g.strokeStyle = col; g.stroke(); g.restore(); }
function fxWizardCrest(g, x, y, s, o = {}) { const col = o.col || IJ.col.gold, a = o.a == null ? 1 : o.a; g.save(); g.globalAlpha = a; g.translate(x, y);
  g.lineWidth = s * .06; g.strokeStyle = col; g.beginPath(); g.arc(0, 0, s, 0, TAU); g.stroke(); g.lineWidth = s * .025; g.beginPath(); g.arc(0, 0, s * .88, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(an) * s * .88, Math.sin(an) * s * .88); g.lineTo(Math.cos(an) * s, Math.sin(an) * s); g.stroke(); }
  ijClover(g, 0, s * .08, s * .42, col, 3);
  g.fillStyle = col; g.beginPath(); g.moveTo(-s * .42, -s * .42); g.lineTo(-s * .42, -s * .7); g.lineTo(-s * .22, -s * .54); g.lineTo(0, -s * .78); g.lineTo(s * .22, -s * .54); g.lineTo(s * .42, -s * .7); g.lineTo(s * .42, -s * .42); g.closePath(); g.fill();   // crown
  g.restore(); }
function fxManaZone(g, c, t, o = {}) { if (t < 0) return; const k = (o.k == null ? 1 : o.k) * smooth(t / .4), R = (o.r || 12) * (.3 + .7 * smooth(t / .5)), col = o.col || IJ.col.clock, col2 = o.col2 || IJ.col.time; if (k <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let m = 0; m < 10; m++) { const a0 = m / 10 * TAU + t * .25, pts = new Path2D(); let ok = false; for (let i = 0; i <= 20; i++) { const u = i / 20, el = u * HP, a = a0 + u * .8, q = project([c[0] + Math.cos(a) * Math.cos(el) * R, c[1] + Math.sin(el) * R * .75, c[2] + Math.sin(a) * Math.cos(el) * R]); if (!q) { ok = false; continue; } ok ? pts.lineTo(q.x, q.y) : pts.moveTo(q.x, q.y); ok = true; }
    ijGlowStroke(g, pts, m % 2 ? col : col2, 2.5, '#ffffff', .35 * k); }
  { const gr = new Path2D(); let ok = false; for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, q = project([c[0] + Math.cos(a) * R, c[1] + .02, c[2] + Math.sin(a) * R]); if (!q) { ok = false; continue; } ok ? gr.lineTo(q.x, q.y) : gr.moveTo(q.x, q.y); ok = true; } ijGlowStroke(g, gr, col2, 4, '#ffffff', .7 * k); }
  for (let i = 0; i < 140; i++) { const h1 = hash(i * 3.3), u = (t * (.15 + .2 * h1) + hash(i * 7.1)) % 1, a = hash(i * 5.7) * TAU + t * (.4 + h1) , el = u * HP * .95, rr = R * (.4 + .6 * hash(i * 9.9)), q = project([c[0] + Math.cos(a) * Math.cos(el) * rr, c[1] + Math.sin(el) * rr * .75, c[2] + Math.sin(a) * Math.cos(el) * rr]); if (!q) continue;
    g.fillStyle = rgba(i % 3 ? col : col2, .7 * k * Math.sin(u * Math.PI)); g.beginPath(); g.arc(q.x, q.y, Math.max(1.2, .05 * q.s), 0, TAU); g.fill(); }
  g.restore(); }
function fxManaAura(g, F, t, o = {}) { if (typeof fxAura === 'function') fxAura(g, F, t, { col: o.col || '#8ad8ff', col2: o.col2 || '#fff6d0', size: o.size || 1.1, amt: o.k == null ? 1 : o.k }); }
function ijTimeStopScreen(f, t, o = {}) { if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const gg = c.getContext('2d'), w = c.width, h = c.height, sc = OUT.scale, q = IJQ(o.at) || { x: W / 2, y: H / 2 }, dur = o.dur || .6, R = easeOut(clamp(t / dur, 0, 1)) * (o.maxR || 2400);
  const tmp = layer('ijts'), tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h); tg.filter = 'grayscale(1) contrast(1.15) brightness(.95)'; tg.drawImage(c, 0, 0); tg.filter = 'none';
  tg.globalCompositeOperation = 'multiply'; tg.fillStyle = '#b8d0ff'; tg.fillRect(0, 0, w, h); tg.globalCompositeOperation = 'source-over'; if (o.keep) tg.drawImage(layer('chars'), 0, 0);
  gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.beginPath(); gg.arc(q.x * sc, q.y * sc, R * sc, 0, TAU); gg.clip(); gg.drawImage(tmp, 0, 0); gg.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const rr = R - i * 60; if (rr <= 0) continue; const p = new Path2D(); p.arc(q.x, q.y, rr, 0, TAU); ijGlowStroke(g, p, i ? IJ.col.clock : IJ.col.time, 6 - i * 1.5, '#ffffff', k * (1 - clamp(t / (dur * 1.5), 0, 1)) * .9); } g.restore(); }); }
