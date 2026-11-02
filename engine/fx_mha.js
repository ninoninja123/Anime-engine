/* engine/fx_mha.js (E1) - My Hero Academia effects (One For All / Decay / All For One) + generic limb smears.
   fxLimbSmear(g, F, t, {joint, span, col, w})   smear/afterimage arc behind a moving limb (punch: 'handR', kick: 'toeR')
   fxGreenArcs(g, c, t, {r, n, col})            free lightning crackle around a point (Full Cowl sparks)
   fxDetroitSmash(g, p, dir, t, {size, pct})    DETROIT SMASH: compressed-air blast cone, shock rings, wind tunnel, debris
                                                 pct: 5..100 (100 = the sky-splitting version: giant fist-shaped wind wall)
   fxDelaware(g, p, dir, t, {size})              DELAWARE SMASH: finger-flick air bullet
   fxManchester(g, c, t, {size})                 MANCHESTER SMASH: axe kick shockwave into the ground (crater + radial burst)
   fxStLouis(g, p, dir, t, {size})               ST. LOUIS SMASH: horizontal kick wind blade
   fxBlackwhip(g, a, b, t, {n, w, grab})         BLACKWHIP: black tendrils shooting from a to b (grab: coil at b)
   fxDecay(g, c, t, {r, dur})                    DECAY: five-finger touch -> crack web spreading over the ground, slabs crumble to dust
   fxDecayWave(g, c, t, {R, dur, speed})         awakened Decay: a crumbling wave front rolling outward, ground disintegrating
   fxDecayBody(g, F, ft, t, o)                   a FIGURE decaying from the touch point (cracks then crumble) - death use
   fxAFOTendrils(g, a, t, {n, len, dir})         All For One: black-red flesh tendrils whipping out from a
   fxAirCannon(g, p, dir, t, {size})             All For One air cannon (dark pressure blast)                         */
'use strict';
function fxLimbSmear(g, F, t, o = {}) {
  const span = o.span || .1, n = 8, j = o.joint || 'handR', pts = [];
  for (let i = 0; i <= n; i++) { const S = figSkel(F, t - span * i / n); pts.push(proj2(S.J[j])); }
  const travel = Math.hypot(pts[0][0] - pts[n][0], pts[0][1] - pts[n][1]); if (travel < (o.minPx || 90)) return;
  const s = pxScale(figSkel(F, t).J[j]), w0 = (o.w || .12) * s * clamp((travel - (o.minPx || 90)) / 120, .3, 1), L = [], R = [];
  for (let i = 0; i <= n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = w0 * (1 - i / n); L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); }
  g.save(); polyPath(g, catmull(L.concat(R.reverse()), true, 2)); g.fillStyle = rgba(o.col || '#ffffff', o.alpha == null ? .75 : o.alpha); g.fill(); if (o.edge) { g.lineWidth = 2; g.strokeStyle = o.edge; g.stroke(); } g.restore();
}
function boltPath(a, b, seed, jag = .18, n = 8) { const pts = [a]; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); for (let i = 1; i < n; i++) { const u = i / n; pts.push([a[0] + dx * u + (-dy / L) * (hash(seed + i) - .5) * L * jag * 2, a[1] + dy * u + (dx / L) * (hash(seed + i) - .5) * L * jag * 2]); } pts.push(b); return pts; }
function strokeBolt(g, pts, w, col, core = '#ffffff') { g.save(); g.lineJoin = 'miter'; g.lineCap = 'round'; polyPath(g, pts, false); g.lineWidth = w * 2.6; g.strokeStyle = rgba(col, .35); g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.lineWidth = Math.max(1, w * .4); g.strokeStyle = core; g.stroke(); g.restore(); }
function fxGreenArcs(g, c, t, o = {}) {
  const q = P2(c); if (!q) return; const R = (o.r || .6) * q.s, n = o.n || 6, fr = Math.floor(t * 12);
  for (let i = 0; i < n; i++) { const a = hash(fr * 7 + i) * TAU, l = R * (.4 + hash(fr + i * 3) * .8); const st = [q.x + Math.cos(a) * R * .2, q.y + Math.sin(a) * R * .2]; strokeBolt(g, boltPath(st, [st[0] + Math.cos(a) * l, st[1] + Math.sin(a) * l], fr * 31 + i, .25, 6), Math.max(1.5, .012 * q.s * (o.w || 1)), o.col || '#4dff7c'); }
}
function fxDetroitSmash(g, p, dir, t, o = {}) {
  const pct = o.pct || 20, size = (o.size || 1) * (pct >= 100 ? 2.6 : pct >= 45 ? 1.6 : 1), dur = .9 * (pct >= 100 ? 1.6 : 1), u = t / dur; if (t < 0 || u > 1) return; const d = vNorm(dir), q = P2(p); if (!q) return;
  let side = vNorm(vCross(d, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, d);
  // contact flash + rings at the fist
  if (u < .12) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 1.4 * size * q.s, '#f6fff0', 1 - u / .12); g.restore(); fxImpactStar(g, q.x, q.y, 1.1 * size * q.s * (1 - u * 4), .2, '#ffffff', 6); }
  // wind tunnel: spiral streak lines forming a cone along d
  const len = 9 * size * easeOut(clamp(u * 2.2, 0, 1)), fade = 1 - smooth((u - .5) / .5);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const a0 = i / 26 * TAU + t * 6, rr = (.3 + .9 * hash(i)) * size, l0 = hash(i * 3) * len * .5, l1 = l0 + len * (.35 + .4 * hash(i * 5)); const pts = [];
    for (let k = 0; k <= 8; k++) { const s = lerp(l0, l1, k / 8), a = a0 + s * .35, r = rr * (.4 + s / Math.max(1, len) * 1.4); pts.push(vAdd(vMad(p, d, s), vAdd(vMul(side, Math.cos(a) * r), vMul(up, Math.sin(a) * r)))); }
    const sp = projLine(pts); for (const r of sp) { polyPath(g, r, false); g.lineWidth = Math.max(1.2, .03 * q.s * size * (1 - hash(i * 9) * .5)); g.strokeStyle = rgba(i % 4 ? '#ffffff' : '#bfffd0', .85 * fade); g.stroke(); } }
  g.restore();
  // pressure rings travelling down the cone
  for (let k = 0; k < 4; k++) fxShockRing(g, vMad(p, d, (.6 + k * 1.6) * size * easeOut(clamp(u * 2, 0, 1))), t - k * .04, { r: (.6 + k * .5) * size, dur: .5, w: .08, up: d, col: '#f0fff4' });
  // OFA lightning crackling along the blast
  const fr = Math.floor(t * 12); for (let i = 0; i < 6; i++) { const a = vMad(p, d, hash(fr + i) * len * .6), b = vAdd(vMad(a, d, size * .9), vMul(side, (hash(fr * 3 + i) - .5) * size)); const pa = P2(a), pb = P2(b); if (pa && pb) strokeBolt(g, boltPath([pa.x, pa.y], [pb.x, pb.y], fr * 17 + i), Math.max(1.5, .014 * q.s), '#4dff7c'); }
  if (pct >= 100 && u < .6) { // giant fist-shaped wind wall
    const c2 = vMad(p, d, len * .7), q2 = P2(c2); if (q2) { const R = 3.2 * size * q2.s * .5; g.save(); g.globalAlpha = .55 * fade; g.fillStyle = '#e8fff0'; g.beginPath(); g.ellipse(q2.x, q2.y, R, R * .8, 0, 0, TAU); g.fill(); g.globalAlpha = .9 * fade; g.lineWidth = Math.max(3, R * .03); g.strokeStyle = '#ffffff'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(q2.x - R * .5 + k * R * .33, q2.y - R * .35, R * .16, R * .3, 0, Math.PI, TAU); g.stroke(); } g.restore(); } }
  fxDebris(g, vMad(p, d, 1.5 * size), t, { n: 22, size: .07 * size, speed: 9 * size, kind: 'rock' });
}
function fxDelaware(g, p, dir, t, o = {}) {
  const u = t / .5; if (t < 0 || u > 1) return; const d = vNorm(dir), size = o.size || 1, c = vMad(p, d, easeOut(u) * 7 * size), q = P2(c), q0 = P2(p); if (!q || !q0) return;
  g.save(); g.strokeStyle = rgba('#ffffff', .8 * (1 - u)); g.lineWidth = .25 * q.s * size; g.lineCap = 'round'; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q.x, q.y); g.stroke(); g.restore();
  fxShockRing(g, c, t, { r: .9 * size, dur: .5, w: .08, up: d, col: '#e8fff0' }); fxAirRings(g, c, d, t, { len: 1.5 * size, r: .35 * size, n: 3 });
  if (u < .15) fxImpactStar(g, q0.x, q0.y, .4 * q0.s * size, .4, '#ffffff', 5);
}
function fxManchester(g, c, t, o = {}) {
  const size = o.size || 1; if (t < 0 || t > 1.4) return;
  fxCracks(g, c, t, { r: 4 * size, n: 14 }); fxShockRing(g, [c[0], .03, c[2]], t, { r: 6 * size, dur: .5, w: .14, col: '#f2fff4' }); fxShockRing(g, [c[0], .03, c[2]], t - .08, { r: 9 * size, dur: .7, w: .08, col: '#bfffd0' });
  fxDust(g, c, t, { n: 18, size: 1.4 * size, spread: 4 * size }); fxDebris(g, c, t, { n: 30, size: .08 * size, speed: 8 * size, kind: 'rock' });
  const q = P2(vAdd(c, [0, .5, 0])); if (q && t < .15) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 2.5 * q.s * size, '#f6fff0', 1 - t / .15); g.restore(); }
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, tt = t - .02; if (tt < 0 || tt > .5) continue; const pa = P2(vAdd(c, [Math.cos(a) * .5, .05, Math.sin(a) * .5])), pb = P2(vAdd(c, [Math.cos(a) * (1 + tt * 8) * size, .1 + tt * 2, Math.sin(a) * (1 + tt * 8) * size])); if (pa && pb) strokeBolt(g, boltPath([pa.x, pa.y], [pb.x, pb.y], i * 7 + Math.floor(t * 12)), Math.max(1.5, .01 * pa.s), '#4dff7c'); }
}
function fxStLouis(g, p, dir, t, o = {}) {
  const u = t / .6; if (t < 0 || u > 1) return; const d = vNorm(dir), size = o.size || 1; let side = vNorm(vCross(d, [0, 1, 0]));
  const c = vMad(p, d, easeOut(u) * 6 * size), pts = []; for (let i = 0; i <= 16; i++) { const a = (i / 16 - .5) * 2.2; pts.push(vAdd(vMad(c, d, -Math.abs(a) * .5 * size), vMul(side, a * 1.4 * size))); }
  const sp = projLine(pts); g.save(); for (const r of sp) { polyPath(g, r, false); g.lineCap = 'round'; g.lineWidth = Math.max(3, .18 * size * pxScale(c)); g.strokeStyle = rgba('#ffffff', .85 * (1 - u)); g.stroke(); g.lineWidth *= .35; g.strokeStyle = rgba('#7dff9a', 1 - u); g.stroke(); } g.restore();
}
function fxBlackwhip(g, a, b, t, o = {}) {
  const n = o.n || 4, reach = easeOut(clamp(t / (o.shoot || .25), 0, 1)); if (t < 0) return; const d = vSub(b, a), L = vLen(d), dn = vNorm(d); let side = vNorm(vCross(dn, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, dn);
  for (let i = 0; i < n; i++) { const pts = []; const ph = i * 1.9 + t * 4;
    for (let j = 0; j <= 16; j++) { const u = j / 16 * reach; const wob = Math.sin(u * Math.PI) * L * .12; let p = vAdd(vMad(a, dn, u * L), vAdd(vMul(side, Math.sin(u * 7 + ph) * wob), vMul(up, Math.cos(u * 5 + ph) * wob)));
      if (o.grab && reach >= 1 && u > .85) { const k = (u - .85) / .15, an = k * TAU * 1.2 + i * 1.5; p = vAdd(b, vAdd(vMul(side, Math.cos(an) * .35), vAdd(vMul(up, Math.sin(an) * .35), vMul(dn, (k - .5) * .3)))); }
      pts.push(p); }
    blackTendril(g, pts, (o.w || .06), t, i, o.edge || '#4dff7c'); }
}
// Decay: crack web from the touch point; slabs crumble and dust rises behind the front
function fxDecay(g, c, t, o = {}) {
  const R = o.r || 5, dur = o.dur || 1.6, u = t / dur; if (t < 0) return; const front = R * easeOut(clamp(u, 0, 1)), seed = o.seed || 5;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 18; i++) { let a = i / 18 * TAU + hash(seed + i) * .3, p = [c[0], .01, c[2]]; const pts = [p];
    for (let k = 0; k < 10; k++) { const r = (k + 1) / 10 * R * (.7 + .3 * hash(seed + i * 3)); if (r > front) break; a += (hash(seed + i * 11 + k) - .5) * .5; p = [c[0] + Math.cos(a) * r, .01, c[2] + Math.sin(a) * r]; pts.push(p);
      if (hash(i * 7 + k) < .35) { const b = [p[0] + Math.cos(a + 1) * R * .12, .01, p[2] + Math.sin(a + 1) * R * .12]; for (const rr of projLine([p, b])) { polyPath(g, rr, false); g.lineWidth = 1.5; g.strokeStyle = '#2a1a1a'; g.stroke(); } } }
    for (const rr of projLine(pts)) { polyPath(g, rr, false); g.lineWidth = clamp(.025 * pxScale(c), 1.5, 6); g.strokeStyle = '#1e1214'; g.stroke(); g.lineWidth *= .35; g.strokeStyle = '#7a2a22'; g.stroke(); } }
  g.restore();
  // crumbling slabs + dust behind the front
  for (let i = 0; i < 40; i++) { const a = hash(seed + i * 5) * TAU, r = hash(seed + i * 9) * front, born = r / R * dur * .8, life = clamp((t - born) / 1.2, 0, 1); if (life <= 0 || life >= 1) continue;
    const p = [c[0] + Math.cos(a) * r, life * (.6 + hash(i) * 1.2), c[2] + Math.sin(a) * r]; const q = project(p); if (!q) continue; const sz = Math.min((.08 + .12 * hash(i * 3)) * q.s, 14) * (1 - life);
    g.save(); g.translate(q.x, q.y); g.rotate(i + t * 2); g.globalAlpha = 1 - life; g.fillStyle = i % 3 ? '#6a5a50' : '#8a7a6a'; g.beginPath(); g.moveTo(-sz, -sz * .4); g.lineTo(sz * .8, -sz * .6); g.lineTo(sz, sz * .5); g.lineTo(-sz * .6, sz * .6); g.closePath(); g.fill(); g.lineWidth = 1; g.strokeStyle = '#2a1e1e'; g.stroke(); g.restore(); }
  if (u > .1) fxSmoke(g, [c[0], 0, c[2]], (t - .15), { n: 8, size: Math.min(1.2, R * .12), col: '#9a8a7a', shade: '#5a4a44', rise: .6, spread: 1.6, dur: 2.2, alpha: .75 });
}
function fxDecayWave(g, c, t, o = {}) {
  const R = o.R || 60, speed = o.speed || 25, front = Math.min(R, t * speed), A = o.alpha == null ? .9 : o.alpha, hk = o.low ? .55 : 1; if (t < 0) return;
  // the crumbling front: tall jagged wall of rubble + dust rolling outward (drawn as a ring of debris columns)
  for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, r = front * (.96 + .04 * hash(i)), p = [c[0] + Math.cos(a) * r, 0, c[2] + Math.sin(a) * r], q = project(p); if (!q) continue; const h = (2.5 + 2 * hash(i * 3 + Math.floor(t * 8))) * q.s * hk, w = .9 * front / 64 * TAU * q.s;
    g.save(); g.fillStyle = '#8a7a6e'; g.globalAlpha = A; blobPath(g, q.x, q.y - h * .35, Math.max(w * .8, h * .32), i + Math.floor(t * 12), 9, .3); g.fill(); g.globalAlpha = Math.min(1, A + .3); g.lineWidth = 2.2; g.strokeStyle = '#2a201c'; g.stroke(); g.restore(); }
  fxDecay(g, c, t, { r: front, dur: front / speed + .01, seed: 9 });
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3; fxDebris(g, [c[0] + Math.cos(a) * front * .9, 0, c[2] + Math.sin(a) * front * .9], (t * 3) % 1, { n: 10, size: .2, speed: 6, kind: 'rock' }); }
}
// a figure decaying: cracks spread from a joint, then the body crumbles into dust from that point
function fxDecayBody(g, F, ft, t, o = {}) {
  const lay = getLayer('decayBody', g.canvas.width, g.canvas.height), c2 = lay.getContext('2d'); c2.setTransform(g.getTransform()); c2.clearRect(-1e4, -1e4, 3e4, 3e4);
  const S = drawFig(c2, F, ft); const src = S.J[o.from || 'abd'], q = project(src); if (!q) return; const u = clamp(t / (o.dur || 1.6), 0, 1), R = 2.2 * q.s;
  c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0); const sc = g.getTransform().a; const qx = q.x * sc, qy = q.y * sc;
  // cracks
  c2.globalCompositeOperation = 'source-atop'; c2.strokeStyle = '#1e1214'; c2.lineWidth = Math.max(1.5, .015 * q.s * sc);
  for (let i = 0; i < 14; i++) { let a = i / 14 * TAU, x = qx, y = qy; c2.beginPath(); c2.moveTo(x, y); for (let k = 0; k < 8; k++) { const l = R * sc * clamp(u * 2.5, 0, 1) / 8; a += (hash(i * 9 + k) - .5) * .9; x += Math.cos(a) * l; y += Math.sin(a) * l; c2.lineTo(x, y); } c2.stroke(); }
  // crumble: punch holes growing from the source
  c2.globalCompositeOperation = 'destination-out'; const er = R * sc * 1.4 * smooth((u - .3) / .7);
  for (let i = 0; i < 70; i++) { const a = hash(i * 3) * TAU, d = hash(i * 5) * er, r = (.05 + .12 * hash(i * 7)) * q.s * sc * smooth((u - .3) / .7) * 1.6; c2.beginPath(); c2.arc(qx + Math.cos(a) * d, qy + Math.sin(a) * d * 1.3, r, 0, TAU); c2.fill(); }
  if (er > 0) { c2.beginPath(); c2.arc(qx, qy, er * .55, 0, TAU); c2.fill(); }
  c2.restore(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lay, 0, 0); g.restore();
  // dust flakes
  for (let i = 0; i < 90; i++) { const life = clamp((u - .3 - hash(i) * .3) / .7, 0, 1); if (life <= 0 || life >= 1) continue; const a = hash(i * 13) * TAU, d = hash(i * 17) * R; const x = q.x + Math.cos(a) * d + life * R * .6, y = q.y + Math.sin(a) * d * 1.3 - life * R * .8, r = Math.min((.02 + .04 * hash(i * 19)) * q.s, 3 + 4 * hash(i * 23)) * (1 - life); g.save(); g.globalAlpha = 1 - life; g.fillStyle = i % 3 ? '#5a4a46' : '#8a7268'; g.fillRect(x - r, y - r, r * 2, r * 1.4); g.restore(); }
}
function fxAFOTendrils(g, a, t, o = {}) {
  const n = o.n || 7, len = o.len || 4, d = vNorm(o.dir || [0, .3, 1]); let side = vNorm(vCross(d, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, d), reach = easeOut(clamp(t / .4, 0, 1));
  for (let i = 0; i < n; i++) { const pts = [], sp = (i - (n - 1) / 2) / n; for (let j = 0; j <= 14; j++) { const u = j / 14 * reach, ph = t * 3 + i; pts.push(vAdd(vMad(a, d, u * len), vAdd(vMul(side, (sp * 2.2 * u + Math.sin(u * 6 + ph) * .3 * u) * len * .5), vMul(up, (Math.cos(u * 5 + ph) * .25 + sp * .4) * u * len * .5)))); }
    blackTendril(g, pts, o.w || .09, t, i, '#c8202a', '#140a0e'); }
}
function fxAirCannon(g, p, dir, t, o = {}) {
  const u = t / .7; if (t < 0 || u > 1) return; const d = vNorm(dir), size = o.size || 1;
  for (let k = 0; k < 5; k++) fxShockRing(g, vMad(p, d, (.5 + k * 1.3) * size * easeOut(clamp(u * 2, 0, 1))), t - k * .03, { r: (.5 + k * .4) * size, dur: .5, w: .1, up: d, col: k % 2 ? '#3a2a3a' : '#c8b8d8' });
  fxAirRings(g, p, d, t, { len: 5 * size, r: .8 * size, n: 5 });
}
