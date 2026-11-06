/* engine/fx_ij3.js (agent E, itachi-vs-julius) - powers.md additions.  t = the effect's own time.
   RAIN (the rule the viewer learns: time stops -> rain stops; time returns -> rain crashes down)
     fxRain(g, t, {k, clock, mode:'fall'|'frozen'|'collapse', collapseT, c, r, n, speed, wind, splash})
        clock = the rain's own time (writer controls it: hold it constant while time is stopped; slow it in the Mana Zone);
        mode 'frozen' draws every drop as a hanging glass bead (glint), 'collapse' = frozen beads fall all at once (collapseT = time since release).
        c/r = centre/radius of the rain volume round the camera target (default: around the camera).  Ground splashes + ripples while falling.
   ITACHI  fxShurikens(g, a, b, t, {n, curve, dur, shadow})  curving shuriken volley, each with a hidden 'shadow' shuriken behind it
           fxHosenka(g, a, dir, t, {n, spread, r})           Phoenix Flower: ring of small fireballs
           fxMagatama(g, a, b, t, {n, dur, rev})            Yasaka magatama volley (red-orange comma beads); rev = flying back (time reversal)
           fxAmaterasuRewind(g, from, eye, t, {dur, n})      black flames streaming back into the eye (Chrono Anastasis)
           ijGenjutsuScreen(f, t, {k, at})                   screen process: the world bleeds red from 'at', black moon, crows binding (Genjutsu: Sharingan)
   JULIUS  fxClockShield(g, c, n, t, {r, hit, k})            clock-face shield that ripples on a hit (hit = time since impact)
           fxFireballAge(g, c, t, {r, age 0..1})            a fireball aged forward: shrinks -> dark ember -> ash flakes drifting
           fxManaSense(g, c, t, {k, r, n})                  gold sonar rings pulsing over the floor (eyes closed)
           fxGears(g, c, t, {n, r, k, size})                 golden gears turning in the air (Mana Zone)
           fxGoldTrail(F, t, n)                              -> afterimage list for f.fig(F, {afterimages: fxGoldTrail(...), afterCol: '#f6d36a', afterA: .5}) (acceleration)  */
'use strict';
// ------------------------------------------------------------------------------------------------ RAIN
function fxRain(g, t, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; const cam = CAM.cur, n = Math.round((o.n || 700) * k), R = o.r || 14, sp = o.speed || 16, clock = o.clock == null ? t : o.clock, mode = o.mode || 'fall';
  const c = o.c || vAdd(cam.target || [0, 1.5, 0], [0, 0, 0]), H0 = o.h || 12, wind = o.wind || [-.12, 0, 0], ct = o.collapseT || 0;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const h1 = hash(i * 1.37 + 3), h2 = hash(i * 2.71 + 9), h3 = hash(i * 4.13 + 1), x = c[0] + (h1 - .5) * 2 * R, z = c[2] + (h2 - .5) * 2 * R, per = H0 / sp, ph = (clock / per + h3) % 1;
    let y = H0 * (1 - ph) - .2; if (mode === 'collapse') y = Math.max(-.1, y - .5 * 9.8 * ct * ct * 1.6 - ct * 4);
    const p = [x + wind[0] * (1 - ph) * 3, y, z + wind[2] * (1 - ph) * 3], q = project(p); if (!q || q.z < .6 || q.x < -40 || q.x > W + 40 || q.y < -60 || q.y > H + 60) continue;
    if (mode === 'frozen' || (mode === 'collapse' && y > -.05)) { const r = Math.max(1.4, .034 * q.s); g.fillStyle = rgba('#e8f4ff', .8 * k); g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill(); if (r > 1.6) { g.fillStyle = rgba('#ffffff', .95 * k); g.beginPath(); g.arc(q.x - r * .35, q.y - r * .35, r * .35, 0, TAU); g.fill(); g.strokeStyle = rgba('#f6d36a', .35 * k); g.lineWidth = Math.max(.6, r * .2); g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.stroke(); }
      if (mode === 'collapse') { const q2 = project(vAdd(p, [0, .25 + ct * 2, 0])); if (q2) { g.strokeStyle = rgba('#cfe4ff', .45 * k); g.lineWidth = Math.max(1, .01 * q.s); g.beginPath(); g.moveTo(q2.x, q2.y); g.lineTo(q.x, q.y); g.stroke(); } } continue; }
    if (mode === 'collapse') continue; const q2 = project(vAdd(p, [-wind[0] * .7, .7 + sp * .025, -wind[2] * .7])); if (!q2) continue;
    g.strokeStyle = rgba('#d8e8ff', (.32 + .35 * h1) * k); g.lineWidth = Math.max(1, .018 * q.s); g.beginPath(); g.moveTo(q2.x, q2.y); g.lineTo(q.x, q.y); g.stroke(); }
  // ground splashes / ripples
  if (o.splash !== false && (mode === 'fall' || (mode === 'collapse' && ct > .25))) { const m = Math.round(120 * k); for (let i = 0; i < m; i++) { const ph = (clock * 2.2 + hash(i * 5.3)) % 1, x = c[0] + (hash(i * 3.3) - .5) * 2 * R, z = c[2] + (hash(i * 7.9) - .5) * 2 * R, q = project([x, .01, z]); if (!q || q.z < .6) continue;
    const rr = (.05 + .25 * ph) * q.s; g.strokeStyle = rgba('#e0ecff', .35 * (1 - ph) * k); g.lineWidth = Math.max(.6, .01 * q.s); g.beginPath(); g.ellipse(q.x, q.y, rr, rr * .3, 0, 0, TAU); g.stroke(); } }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ ITACHI
function fxShurikens(g, a, b, t, o = {}) { if (t < 0) return; const n = o.n || 8, dur = o.dur || .5, d = vSub(b, a), side = vNorm(vCross(d, [0, 1, 0]));
  for (let i = 0; i < n; i++) { const u = clamp((t - i * .025) / dur, 0, 1); if (u <= 0 || u >= 1) continue; const off = ((i + .5) / n - .5) * (o.spread || 2.4), bend = Math.sin(u * Math.PI) * off * (o.curve || 1.2);
    const p = vAdd(vAdd(a, vMul(d, u)), vAdd(vMul(side, off * (1 - u) + bend), [0, Math.sin(u * Math.PI) * .4 * ((i % 3) - 1), 0])), q = project(p); if (!q) continue; const r = .12 * q.s;
    const q0 = project(vAdd(p, vMul(d, -.05))); if (q0) { g.strokeStyle = rgba('#c8ccd8', .35); g.lineWidth = Math.max(1, r * .3); g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q.x, q.y); g.stroke(); }
    IJ.drawShuriken(g, q.x, q.y, r, t * 30 + i); if (o.shadow !== false) { const ps = vAdd(p, vMul(vNorm(d), -.35)), qs = project(ps); if (qs) { g.save(); g.globalAlpha = .9; IJ.drawShuriken(g, qs.x, qs.y + r * .1, r * .95, -t * 30 + i); g.restore(); } } } }
function fxHosenka(g, a, dir, t, o = {}) { if (t < 0) return; const n = o.n || 6, d = vNorm(dir), side = vNorm(vCross(d, [0, 1, 0]));
  for (let i = 0; i < n; i++) { const an = (i / n) * TAU + .3, off = vAdd(vMul(side, Math.cos(an) * (o.spread || 1.4)), [0, Math.sin(an) * (o.spread || 1.4) * .6, 0]); const tt = t - i * .04; if (tt < 0) continue;
    const start = vAdd(a, vMul(off, Math.min(1, tt * 4) * .3)); fxFireball(g, start, vNorm(vAdd(d, vMul(off, .12))), tt, { r: o.r || .45, charge: .12, speed: o.speed || 11, travel: o.travel || 20 }); } }
function ijMagatamaShape(g, x, y, r, ang, col) { g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-r * .2, -r); g.quadraticCurveTo(-r * 2.4, -r * .6, -r * 2.2, r * 1.4); g.quadraticCurveTo(-r * 1.4, r * .5, -r * .2, r); g.fill();
  g.strokeStyle = shadeHex(col, -.5); g.lineWidth = Math.max(1, r * .15); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, r * 3, col, .45); g.restore(); }
function fxMagatama(g, a, b, t, o = {}) { if (t < 0) return; const n = o.n || 9, dur = o.dur || .6, d = vSub(b, a), side = vNorm(vCross(d, [0, 1, 0]));
  for (let i = 0; i < n; i++) { let u = clamp((t - i * .03) / dur, 0, 1); if (o.rev) u = 1 - u; if (u <= 0 || u >= 1) continue; const an = i / n * TAU, sp = (o.spread || 1.6) * (1 - u * .7), p = vAdd(vAdd(a, vMul(d, u)), vAdd(vMul(side, Math.cos(an) * sp), [0, Math.sin(an) * sp * .7, 0])), q = project(p); if (!q) continue;
    const q0 = project(vAdd(p, vMul(d, o.rev ? .04 : -.04))), ang = q0 ? Math.atan2(q.y - q0.y, q.x - q0.x) : 0; if (q0) { g.save(); g.strokeStyle = rgba(o.rev ? IJ.col.time : '#ff6a3a', .55); g.lineWidth = Math.max(2, .1 * q.s); g.lineCap = 'round'; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q.x, q.y); g.stroke(); g.restore(); }
    ijMagatamaShape(g, q.x, q.y, Math.max(3, .14 * q.s), ang + Math.PI, '#ff5a2a'); } }
function fxAmaterasuRewind(g, from, eye, t, o = {}) { if (t < 0) return; const dur = o.dur || .8, n = o.n || 26;
  for (let i = 0; i < n; i++) { const u = clamp((t - hash(i * 3) * .3) / dur, 0, 1); if (u <= 0 || u >= 1) continue; const off = [(hash(i * 5) - .5) * 2.2, hash(i * 7) * 1.4, (hash(i * 9) - .5) * 2.2], s0 = vAdd(from, off), p = vLerp(s0, eye, easeIn(u)), q = project(p); if (!q) continue;
    const q0 = project(vLerp(s0, eye, easeIn(Math.max(0, u - .12)))); const w = Math.max(2, .22 * q.s * (1 - u * .8)); g.save(); g.lineCap = 'round'; if (q0) { g.strokeStyle = '#050205'; g.lineWidth = w; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q.x, q.y); g.stroke(); g.strokeStyle = rgba('#a01a6a', .7); g.lineWidth = w * .3; g.stroke(); } g.restore(); }
  const qe = project(eye); if (qe) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, qe.x, qe.y, 40 + 60 * clamp(t / dur, 0, 1), IJ.col.time, .4); g.restore(); } }
function ijGenjutsuScreen(f, t, o = {}) { if (t < 0) return; f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const gg = c.getContext('2d'), sc = OUT.scale, q = IJQ(o.at) || { x: W / 2, y: H / 2 }, R = easeOut(clamp(t / (o.dur || .9), 0, 1)) * 2400;
  gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.beginPath(); for (let i = 0; i <= 48; i++) { const an = i / 48 * TAU, rr = R * (1 + .12 * Math.sin(an * 7 + t * 3) + .08 * (fbm(an * 3) - .5)); const x = (q.x + Math.cos(an) * rr) * sc, y = (q.y + Math.sin(an) * rr) * sc; i ? gg.lineTo(x, y) : gg.moveTo(x, y); } gg.closePath(); gg.clip();
  gg.globalCompositeOperation = 'multiply'; gg.globalAlpha = .85 * k; gg.fillStyle = '#ff3a2a'; gg.fillRect(0, 0, c.width, c.height); gg.globalCompositeOperation = 'source-over'; gg.globalAlpha = k;
  const mx = c.width * .76, my = c.height * .2, mr = c.height * .12; gg.fillStyle = '#050002'; gg.beginPath(); gg.arc(mx, my, mr, 0, TAU); gg.fill(); gg.strokeStyle = '#ff6a5a'; gg.lineWidth = c.height * .005; gg.stroke(); gg.restore();
  if (o.crows !== false && o.bind) { g.save(); const b = IJQ(o.bind); if (b) for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + t * 2, rr = 140 + 30 * Math.sin(t * 5 + i); ijDrawCrow(g, b.x + Math.cos(an) * rr, b.y + Math.sin(an) * rr * .5, 46, t * 14 + i, an + HP, { flip: Math.sin(an) > 0 }); } g.restore(); } }); }
// ------------------------------------------------------------------------------------------------ JULIUS
function fxClockShield(g, c, n, t, o = {}) { if (t < 0) return; const k = (o.k == null ? 1 : o.k) * smooth(t / .12), R = o.r || 1.3, hit = o.hit; let wob = 0; if (hit != null && hit >= 0 && hit < .5) wob = Math.sin(hit * 50) * (1 - hit / .5) * .1;
  fxClockCircle(g, c, n, t, { r: R * (1 + wob), k, spin: .4, w: 1.4, grow: .08 }); const qc = project(c); if (!qc || k <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radial(g, qc.x, qc.y, R * qc.s, [[0, rgba('#fff6d0', .05 * k)], [.85, rgba('#f6d36a', .16 * k)], [1, rgba('#ffffff', .3 * k)]]); g.beginPath(); g.arc(qc.x, qc.y, R * qc.s * (1 + wob), 0, TAU); g.fill();
  if (hit != null && hit >= 0 && hit < .4) { for (let i = 0; i < 3; i++) { const rr = R * qc.s * (.2 + hit * 3 + i * .15); g.strokeStyle = rgba('#ffffff', (1 - hit / .4) * .6); g.lineWidth = 4; g.beginPath(); g.arc(qc.x, qc.y, rr, 0, TAU); g.stroke(); } } g.restore(); }
function fxFireballAge(g, c, t, o = {}) { const age = clamp(o.age == null ? t / 1.2 : o.age, 0, 1), R = (o.r || 2) * (1 - age * .85), q = project(c); if (!q) return; const rp = R * q.s;
  if (age < .75) { const hot = clamp(1 - age / .6, 0, 1); g.save(); if (hot > 0) { g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, rp * 2.2, '#ff6a10', .4 * hot); g.globalCompositeOperation = 'source-over'; }
    g.beginPath(); for (let i = 0; i <= 32; i++) { const an = i / 32 * TAU, rr = rp * (1 + .12 * Math.sin(an * 6 + t * 10 * hot) * hot); i ? g.lineTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr) : g.moveTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr); } g.closePath();
    g.fillStyle = radial(g, q.x, q.y, rp, [[0, mixHex('#3a1a10', '#fff4a0', hot)], [.6, mixHex('#1a0a08', '#ff8a20', hot)], [1, mixHex('#0a0606', '#c81a08', hot)]]); g.fill(); g.strokeStyle = rgba(mixHex('#ff5a1a', '#c81a08', hot), .8 * (1 - age)); g.lineWidth = Math.max(1, rp * .06); g.stroke();
    for (let i = 0; i < 10; i++) { const an = hash(i * 3) * TAU, rr = rp * .7 * hash(i * 7); g.fillStyle = rgba('#ff7a2a', .8 * (1 - hot) * (1 - age / .75)); g.beginPath(); g.arc(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr, Math.max(1, rp * .06), 0, TAU); g.fill(); } g.restore(); }
  const ak = clamp((age - .5) / .5, 0, 1); if (ak > 0) for (let i = 0; i < 40; i++) { const u = (ak + hash(i * 5) * .4), an = hash(i * 3) * TAU, d = (o.r || 2) * (.2 + u * 1.5 * hash(i * 9)), p = [c[0] + Math.cos(an) * d, c[1] - u * 1.2 + Math.sin(t * 2 + i) * .1, c[2] + Math.sin(an) * d], qq = project(p); if (!qq) continue;
    g.fillStyle = rgba(i % 3 ? '#8a8480' : '#3a3634', clamp(1.3 - u, 0, 1)); g.save(); g.translate(qq.x, qq.y); g.rotate(t * 3 + i); g.fillRect(-.04 * qq.s, -.015 * qq.s, .08 * qq.s, .03 * qq.s); g.restore(); } }
function fxManaSense(g, c, t, o = {}) { if (t < 0) return; const k = o.k == null ? 1 : o.k, R = o.r || 14, n = o.n || 4, per = o.per || 1.1; g.save(); g.globalCompositeOperation = 'lighter';
  for (let j = 0; j < n; j++) { const u = ((t + j * per / n) % per) / per, r = .5 + u * R, pts = []; for (let i = 0; i <= 64; i++) { const an = i / 64 * TAU, q = project([c[0] + Math.cos(an) * r, .03, c[2] + Math.sin(an) * r]); if (q) pts.push([q.x, q.y]); } if (pts.length < 3) continue;
    const p = new Path2D(); pts.forEach((pp, i) => i ? p.lineTo(pp[0], pp[1]) : p.moveTo(pp[0], pp[1])); ijGlowStroke(g, p, IJ.col.time, 3, '#fffbe8', k * (1 - u) * .9); } g.restore(); }
function ijGear(g, x, y, r, rot, col, teeth = 12) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); for (let i = 0; i < teeth * 2; i++) { const a0 = i / (teeth * 2) * TAU, a1 = (i + 1) / (teeth * 2) * TAU, rr = i % 2 ? r * .82 : r; g.arc(0, 0, rr, a0, a1); }
  g.closePath(); g.moveTo(r * .45, 0); g.arc(0, 0, r * .45, 0, TAU, true); g.fillStyle = rgba(col, .55); g.fill('evenodd'); g.strokeStyle = rgba('#fff6d0', .9); g.lineWidth = Math.max(1, r * .05); g.stroke(); for (let i = 0; i < 4; i++) { g.rotate(HP); g.fillRect(r * .1, -r * .05, r * .35, r * .1); } g.restore(); }
function fxGears(g, c, t, o = {}) { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const n = o.n || 10, R = o.r || 9, list = [];
  for (let i = 0; i < n; i++) { const an = hash(i * 3.7) * TAU + t * .05, rr = R * (.4 + .6 * hash(i * 5.1)), p = [c[0] + Math.cos(an) * rr, c[1] + 2 + hash(i * 9.3) * 7 + Math.sin(t + i) * .2, c[2] + Math.sin(an) * rr], q = project(p); if (q && q.z > .5) list.push({ q, i }); }
  list.sort((a, b) => b.q.z - a.q.z); g.save(); g.globalAlpha = k; g.globalCompositeOperation = 'lighter'; for (const { q, i } of list) { const r = (o.size || .9) * (.5 + hash(i * 2.2)) * q.s; glow(g, q.x, q.y, r * 1.6, IJ.col.time, .12); ijGear(g, q.x, q.y, r, t * (i % 2 ? .6 : -.6) * (1 + hash(i)), i % 3 ? IJ.col.time : IJ.col.clock, 10 + (i % 3) * 4); } g.restore(); }
function fxGoldTrail(F, t, n = 4, dt = .05) { const out = []; for (let i = 1; i <= n; i++) out.push(i * dt); return out; }
