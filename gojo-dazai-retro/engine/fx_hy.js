/* engine/fx_hy.js (agent E, hulk-vs-yujiro) - HULK + YUJIRO effects, props and screen processes.  t = effect-local time (lt - start).
   Positions: world [x,y,z] (projected, metres) or screen {x,y} (1920x1080).  Layers: glows 'glow', ink/solid 'over', auras 'under'.
   HULK  fxGammaBurst(g,p,t,{size,dur})  fxSmashWave(g,c,t,{r,dur,tiles,glow})  fxConcreteSpray(g,p,t,{dir,n,size,dur})  fxThunderclap(g,c,t,{r,dur,dir})
         fxStomp(g,c,t,{size})  hyTremor(times,amp) -> f.shake list  fxRageSteam(g,F,t,{k,body})  fxRoarRings(g,F,t,{dur,n})  fxMeteorTrail(g,a,b,t,{w,len})
         fxRegen(g,F,t,{joint,k,r})  fxGammaCracks(g,c,t,{r,n,dur,glow})  fxCollapse(g,c,t,{w,h,n,dur})  drawBoulder(g,p,{r,rot,seed})  fxGammaVeins = pose.rage
   YUJIRO fxMusclePump(g,F,t,{k})  fxMenaceKana(g,t,{x,y,size,text})  fxOgreAura(g,F,t,{k})  fxOniSmoke(g,F,t,{k})  yujOniBack (pose.oni)  fxAirPressure(g,p,dir,t,{delay})
         fxInkSplash(g,p,t,{size,dur,red})  fxBoneCrack(g,p,t,{size})  fxBloodMouth (expr 'bleeding')
   SCREEN (call in the shot, not inside f.fx): hyHeartbeat(f,t,{bpm,k,at,beats}) (calm-threat heartbeat: pulse zoom + ripple + dark-red vignette),
         hyHeatHaze(f,t,{at,r,k}) (ogre aura air distortion), hyGammaTint(f,t,{k}) ;  time: hySlowmo(lt,t0,t1,k)
   PROPS drawCup(g,p,{size,ripple,t,fill}), drawMeat(g,p,{size,rot,bite}), ARENA_LEDGE (see sets_hy.js)                                   */
'use strict';
const HYFX = { green: '#7dff4a', greenDeep: '#2a8a1a', white: '#f4ffe8', ink: '#141016', red: '#c4122a', dust: '#d8c8a8', dustDark: '#8a7a64', concrete: '#b8b0a2' };
function hyQ(p) { return P2(p); }
function hyJag(cx, cy, r0, r1, n, seed, rot = 0) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, r = i % 2 ? r0 * (.8 + .4 * hash(seed + i)) : r1 * (.6 + .6 * hash(seed + i * 3)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; }
// ------------------------------------------------------------------------------------------------ HULK
function fxGammaBurst(g, p, t, o = {}) {
  const q = hyQ(p); if (!q) return; const dur = o.dur || .8, u = t / dur; if (u < 0 || u > 1) return;
  const R = (o.size || 2.2) * (Array.isArray(p) ? q.s : 260), fr = Math.floor(t * 24), seed = (o.seed || 3) + fr * 7, e = easeOut(u);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * (1.2 + e), HYFX.green, .8 * (1 - u)); glow(g, q.x, q.y, R * .5 * (1 - u * .5), HYFX.white, 1 - u); g.restore();
  // jagged starburst (ink outlined, ones)
  const st = hyJag(q.x, q.y, R * .18 * (1 + e), R * (.6 + e * .8), 9, seed, fr * .3);
  g.save(); polyPath(g, st); g.fillStyle = rgba(HYFX.green, .85 * (1 - u)); g.fill(); g.lineWidth = clamp(R * .02, 2, 7); g.strokeStyle = rgba(HYFX.ink, .9 * (1 - u)); g.stroke();
  polyPath(g, hyJag(q.x, q.y, R * .1, R * (.32 + e * .4), 7, seed + 5, -fr * .2)); g.fillStyle = rgba(HYFX.white, 1 - u); g.fill(); g.restore();
  // rays
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = hash(seed + i * 9) * TAU, l = R * (1.2 + 1.8 * hash(i + seed)) * e, w = R * .03 * (1 - u);
    g.beginPath(); g.moveTo(q.x + Math.cos(a + .02) * R * .2, q.y + Math.sin(a + .02) * R * .2); g.lineTo(q.x + Math.cos(a) * l, q.y + Math.sin(a) * l); g.lineTo(q.x + Math.cos(a - .02) * R * .2, q.y + Math.sin(a - .02) * R * .2); g.fillStyle = rgba('#c8ff9a', .8 * (1 - u)); g.fill(); g.lineWidth = w; } g.restore();
  // gamma sparks
  for (let i = 0; i < 22; i++) { const a = hash(i * 13 + (o.seed || 3)) * TAU, d = R * (.3 + 2.2 * e * hash(i * 5 + 1)), s = clamp(R * .025, 2, 8) * (1 - u); g.fillStyle = i % 3 ? HYFX.green : HYFX.white; g.beginPath(); g.arc(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .8, s, 0, TAU); g.fill(); }
}
// rising slab ring: ground tiles tilt up in a wave from c, dust ring, cracks
function fxSmashWave(g, c, t, o = {}) {
  const dur = o.dur || 1.1, R = o.r || 9; if (t < 0 || t > dur * 2.2) return;
  fxCracks(g, c, t, { r: R * .75, n: 14, dur: .25, seed: o.seed || 71 });
  if (o.glow) fxGammaCracks(g, c, t, { r: R * .6, n: 9, seed: (o.seed || 71) + 3 });
  const front = R * easeOut(clamp(t / dur, 0, 1)), n = o.tiles || 46, seed = o.seed || 71;
  const slabs = [];
  for (let i = 0; i < n; i++) { const a = hash(seed + i * 3) * TAU, d = R * (.15 + .85 * hash(seed + i * 7)), lag = (front - d) / (R * .25); if (lag < 0) continue;
    const lift = Math.sin(clamp(lag, 0, 1) * Math.PI * .5) * (1 - clamp((lag - 1.5) / 3, 0, 1) * .6), sz = .45 + .5 * hash(seed + i * 11), tilt = lift * (.6 + .6 * hash(i + seed));
    const ctr = [c[0] + Math.cos(a) * d, lift * .35 * sz, c[2] + Math.sin(a) * d], rd = [Math.cos(a), 0, Math.sin(a)], sd = [-Math.sin(a), 0, Math.cos(a)];
    const up = [rd[0] * -Math.sin(tilt), Math.cos(tilt), rd[2] * -Math.sin(tilt)], fw = vNorm(vCross(sd, up));
    const P = (x, z, y = 0) => vAdd(ctr, vAdd(vMul(sd, x * sz), vAdd(vMul(fw, z * sz), vMul(up, y))));
    slabs.push({ z: camDepth(ctr), top: [P(-.5, -.4, .12), P(.5, -.4, .12), P(.5, .4, .12), P(-.5, .4, .12)], side: [P(-.5, .4, .12), P(.5, .4, .12), P(.5, .4, -.05), P(-.5, .4, -.05)] }); }
  slabs.sort((a, b) => b.z - a.z);
  for (const s of slabs) { const lw = 2; for (const [poly, col] of [[s.side, '#6e6658'], [s.top, o.tileCol || '#a8a090']]) { const sp = projPoly(poly); if (sp.length < 3) continue; polyPath(g, sp); g.fillStyle = col; g.fill(); g.lineWidth = lw; g.strokeStyle = HYFX.ink; g.stroke(); } }
  fxShockRing(g, [c[0], .05, c[2]], t, { r: R * 1.1, dur: dur * .8, w: 1.4, col: '#fff6e0' });
  fxDust(g, c, t, { size: R * .22, spread: R * .3, dur: dur * 1.8, n: 14, col: HYFX.dust, seed: seed + 9 });
  fxDebris(g, [c[0], .2, c[2]], t, { n: 22, speed: 8, size: .16, kind: 'rock', dur: dur * 1.3, seed: seed + 4 });
}
function fxConcreteSpray(g, p, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0 || t > dur * 1.4) return; const dir = o.dir || [0, 1, 0], seed = o.seed || 23;
  fxSmoke(g, vMad(p, dir, .4 * easeOut(t / dur)), t, { n: o.n || 12, size: (o.size || 1.4), rise: .8, col: HYFX.dust, dur, seed });
  fxDebris(g, p, t, { n: 18, speed: 7, size: .12, kind: 'rock', dur, seed: seed + 1, dir });
  fxDebris(g, p, t, { n: 12, speed: 10, size: .05, kind: 'rock', dur: dur * .8, seed: seed + 2, dir });
}
// thunderclap: translucent pressure sphere (refraction rim), ground dust ring, wind lines
function fxThunderclap(g, c, t, o = {}) {
  const dur = o.dur || 1.0, u = t / dur; if (u < 0 || u > 1.3) return; const R = (o.r || 14) * easeOut(clamp(u, 0, 1)), fade = 1 - clamp(u, 0, 1);
  const q = project(c); if (!q) return; const rp = R * q.s;
  g.save(); g.globalCompositeOperation = 'lighter'; if (u < .12) glow(g, q.x, q.y, 900 * (1 - u / .12) + 200, '#ffffff', .9); g.restore();
  for (let i = 0; i < 3; i++) { const r = rp * (1 - i * .08); g.beginPath(); g.ellipse(q.x, q.y, r, r * .92, 0, 0, TAU); g.lineWidth = clamp(rp * (.02 - i * .006), 1.5, 26) * fade; g.strokeStyle = rgba(i ? '#cfe8ff' : '#ffffff', (.85 - i * .25) * fade); g.stroke(); }
  g.save(); g.beginPath(); g.ellipse(q.x, q.y, rp, rp * .92, 0, 0, TAU); g.clip(); g.fillStyle = rgba('#e8f4ff', .12 * fade); g.fillRect(q.x - rp, q.y - rp, rp * 2, rp * 2);
  g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(q.x, q.y, rp * .7, q.x, q.y, rp); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, rgba('#ffffff', .35 * fade)); g.fillStyle = gr; g.fillRect(q.x - rp, q.y - rp, rp * 2, rp * 2); g.restore();
  fxShockRing(g, [c[0], .05, c[2]], t, { r: (o.r || 14) * 1.05, dur: dur * .9, w: 1.8, col: '#fff8e8' });
  fxDust(g, [c[0], 0, c[2]], t, { size: (o.r || 14) * .16, spread: (o.r || 14) * .4, dur: dur * 1.6, n: 18, col: HYFX.dust, seed: 33 });
  // wind streaks radiating
  g.save(); g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const a = hash(i * 7.3) * TAU, d0 = rp * (.75 + .3 * hash(i * 3)), l = rp * .25 * fade; g.beginPath(); g.moveTo(q.x + Math.cos(a) * d0, q.y + Math.sin(a) * d0 * .9); g.lineTo(q.x + Math.cos(a) * (d0 + l), q.y + Math.sin(a) * (d0 + l) * .9); g.lineWidth = 3 * fade + 1; g.strokeStyle = rgba('#ffffff', .7 * fade); g.stroke(); } g.restore();
}
function fxStomp(g, c, t, o = {}) {
  if (t < 0 || t > 1.2) return; const s = o.size || 1;
  fxShockRing(g, [c[0], .03, c[2]], t, { r: 2.4 * s, dur: .45, w: .5, col: '#f0e6d0' });
  fxDust(g, c, t, { size: .7 * s, spread: 1.6 * s, dur: .9, n: 8, col: HYFX.dust, seed: o.seed || 17 });
  fxCracks(g, c, t, { r: 1.4 * s, n: 6, dur: .12, seed: (o.seed || 17) + 2 });
}
const hyTremor = (times, amp = 14) => times.map(t0 => [t0, amp, .3, 22]);
// green steam rising off the body (rage aura)
function fxRageSteam(g, F, t, o = {}) {   // thin green steam wisps curling up off the shoulders, head and arms
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sc = S.B.h / 1.8, tf = onN(t, 2);
  const src = ['shL', 'shR', 'head', 'neck', 'elL', 'elR', 'shL', 'shR'].map(j => S.J[j]).filter(Boolean);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < Math.round(22 * k); i++) { const b = src[i % src.length], ph = (tf * .9 + hash(i * 3.1)) % 1, rise = ph * .7 * sc, sway = Math.sin(ph * 6 + i) * .06 * sc;
    const p0 = [b[0] + (hash(i * 5) - .5) * .3 * sc, b[1] + .05 * sc + rise, b[2] + (hash(i * 7) - .5) * .3 * sc], q0 = project(p0), q1 = project(vAdd(p0, [sway, .18 * sc, 0])); if (!q0 || !q1) continue;
    const a = .55 * k * Math.sin(ph * Math.PI), w = Math.max(2, .05 * sc * q0.s * (1 - ph * .5)); g.strokeStyle = rgba(ph < .4 ? '#d8ffc0' : '#8ad870', a); g.lineWidth = w;
    g.beginPath(); g.moveTo(q0.x, q0.y); g.quadraticCurveTo(q0.x + (q1.x - q0.x) * .5 + w * 2 * Math.sin(i), (q0.y + q1.y) / 2, q1.x, q1.y); g.stroke(); }
  g.restore();
}
function fxRoarRings(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sc = S.B.h / 1.8, HM = headModel(S, F.design), mouth = HM.at(0, -.7), dir = HM.M[2];
  fxAirRings(g, mouth, dir, t, { n: o.n || 4, len: 3 * sc, r: .25 * sc, dur: o.dur || .5, w: 7 });
  if (t > 0 && t < (o.hold || 1.2)) { const q = project(mouth); if (q) { g.save(); g.globalAlpha = .5; for (let i = 0; i < 3; i++) { const u = ((t * 3 + i / 3) % 1); g.beginPath(); g.arc(q.x, q.y, 40 + u * 500, 0, TAU); g.lineWidth = 8 * (1 - u); g.strokeStyle = rgba('#ffffff', .6 * (1 - u)); g.stroke(); } g.restore(); } }
}
function fxMeteorTrail(g, a, b, t, o = {}) {
  const A = project(a), B = project(b); if (!A || !B) return; const w = (o.w || 1.2) * B.s, fr = Math.floor(t * 24);
  const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [ww, col, al] of [[1, HYFX.green, .55], [.55, '#c8ff9a', .75], [.22, '#ffffff', .95]]) { g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x + nx * w * ww, B.y + ny * w * ww); g.arc(B.x, B.y, w * ww, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); g.closePath(); g.fillStyle = rgba(col, al); g.fill(); }
  glow(g, B.x, B.y, w * 2.5, HYFX.green, .7); g.restore();
  for (let i = 0; i < 8; i++) { const u = hash(fr * 3 + i), px = lerp(B.x, A.x, u * .7) + nx * w * (hash(i + fr) - .5) * 1.6, py = lerp(B.y, A.y, u * .7) + ny * w * (hash(i * 2 + fr) - .5) * 1.6; g.fillStyle = HYFX.white; g.beginPath(); g.arc(px, py, 3 + 4 * (1 - u), 0, TAU); g.fill(); }
}
function fxRegen(g, F, t, o = {}) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), p = S.J[o.joint || 'abd'], q = project(p); if (!q || t < 0) return; const k = o.k == null ? 1 : o.k, sc = S.B.h / 1.8, r = (o.r || .35) * sc * q.s;
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, r * 1.6, HYFX.green, .3 * k); glow(g, q.x, q.y, r * .5, '#e8ffd8', .3 * k); g.restore();
  for (let i = 0; i < 10; i++) { const ph = (t * 1.5 + hash(i * 3)) % 1, a = hash(i * 7) * TAU, d = r * (1.4 - ph * 1.2); g.fillStyle = rgba('#d8ffb8', k * Math.sin(ph * Math.PI)); g.beginPath(); g.arc(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, 3, 0, TAU); g.fill(); }
  // the wound line knits shut (stitch-like closing cross ticks)
  const L = r * .9 * (1 - k * .9); if (L > 2) { g.lineCap = 'round'; g.strokeStyle = '#8a1018'; g.lineWidth = 4; g.beginPath(); g.moveTo(q.x - L, q.y - L * .4); g.lineTo(q.x + L, q.y + L * .4); g.stroke(); }
}
function fxGammaCracks(g, c, t, o = {}) {
  if (t < 0) return; const R = (o.r || 6) * easeOut(clamp(t / (o.dur || .5), 0, 1)), n = o.n || 9, seed = o.seed || 91, pulse = .75 + .25 * Math.sin(t * 9);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < n; i++) { let a = hash(seed + i) * TAU, p = [c[0], .02, c[2]]; const L = [p]; const len = R * (.5 + hash(seed + i * 3) * .7) / 6; for (let k = 0; k < 6; k++) { a += (hash(seed + i * 17 + k) - .5) * .8; p = [p[0] + Math.cos(a) * len, .02, p[2] + Math.sin(a) * len]; L.push(p); }
    const sp = projLine(L); if (sp.length < 2) continue; for (const run of (Array.isArray(sp[0][0]) ? sp : [sp])) { polyPath(g, run, false); g.lineWidth = 9; g.strokeStyle = HYFX.ink; g.stroke(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 10; g.strokeStyle = rgba(HYFX.green, .45 * pulse); g.stroke(); g.lineWidth = 3; g.strokeStyle = rgba('#e8ffd0', .95 * pulse); g.stroke(); g.globalCompositeOperation = 'source-over'; } }
  g.restore();
}
function fxCollapse(g, c, t, o = {}) { // chunks of stand / wall falling with dust (world c = top centre of the falling section)
  if (t < 0) return; const n = o.n || 16, w = o.w || 6, h = o.h || 5, dur = o.dur || 1.6, seed = o.seed || 101;
  for (let i = 0; i < n; i++) { const st = hash(seed + i) * .4, u = clamp((t - st) / dur, 0, 1); if (u <= 0) continue; const x = (hash(seed + i * 3) - .5) * w, y0 = (hash(seed + i * 5)) * h * .3, y = Math.max(0, c[1] + y0 - 9.8 * Math.pow(u * dur, 2) * .5);
    drawBoulder(g, [c[0] + x, y, c[2] + (hash(i * 7 + seed) - .5) * 2], { r: .4 + .7 * hash(i * 11 + seed), rot: u * 4 * (hash(i) - .5), seed: seed + i, col: o.col || HYFX.concrete }); }
  fxSmoke(g, [c[0], Math.max(.5, c[1] * .4), c[2]], t - .2, { n: 16, size: w * .35, rise: .6, col: HYFX.dust, dur: dur * 2, seed });
}
function drawBoulder(g, p, o = {}) {
  const q = project(p); if (!q) return; const r = (o.r || .6) * q.s, seed = o.seed || 1, n = 8, pts = [];
  for (let i = 0; i < n; i++) { const a = (o.rot || 0) + i / n * TAU, rr = r * (.75 + .4 * hash(seed + i)); pts.push([q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr * .85]); }
  polyPath(g, pts); g.fillStyle = o.col || '#a8a090'; g.fill(); g.save(); g.clip(); g.fillStyle = 'rgba(40,30,40,.35)'; g.beginPath(); g.ellipse(q.x + r * .35, q.y + r * .35, r * .9, r * .7, 0, 0, TAU); g.fill(); g.restore();
  polyPath(g, pts); g.lineWidth = clamp(r * .06, 1.5, 5); g.strokeStyle = HYFX.ink; g.stroke();
  g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(q.x, q.y); g.lineTo(pts[5][0], pts[5][1]); g.lineWidth = clamp(r * .03, 1, 3); g.stroke();
}
// ------------------------------------------------------------------------------------------------ YUJIRO
// manga tension strokes around the body outline (flickering, ones) + striation shimmer
function fxMusclePump(g, F, t, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sc = S.B.h / 1.8, fr = Math.floor(t * 24);
  const js = ['shL', 'shR', 'elL', 'elR', 'neck', 'abd', 'head', 'handL', 'handR'];
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 26 * k; i++) { const j = S.J[js[i % js.length]]; const q = project(j); if (!q) continue; const a = hash(fr * 7 + i * 3) * TAU, d = (.35 + .25 * hash(i + fr)) * sc * q.s, l = (.12 + .1 * hash(i * 5 + fr)) * sc * q.s;
    g.beginPath(); g.moveTo(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d); g.lineTo(q.x + Math.cos(a) * (d + l), q.y + Math.sin(a) * (d + l)); g.lineWidth = clamp(.012 * sc * q.s, 2, 7); g.strokeStyle = rgba(o.col || '#141016', .85); g.stroke(); }
  g.restore();
}
// menace onomatopoeia ゴゴゴ (manga) drifting near a character
function fxMenaceKana(g, t, o = {}) {
  if (t < 0 || t > (o.dur || 2.5)) return; const x = o.x == null ? 1500 : o.x, y = o.y == null ? 300 : o.y, sz = o.size || 120, txt = o.text || 'ゴゴゴゴ', fr = Math.floor(t * 12);
  g.save(); g.font = `900 ${sz}px "Noto Sans JP", "Noto Sans CJK JP", sans-serif`; g.textAlign = 'center'; g.lineJoin = 'round';
  [...txt].forEach((ch, i) => { const jx = (hash(fr * 3 + i) - .5) * sz * .08, jy = (hash(fr * 5 + i) - .5) * sz * .08, a = clamp((t - i * .12) / .15, 0, 1); if (a <= 0) return; const px = x + jx + i * sz * .15, py = y + jy + i * sz * .78;
    g.save(); g.translate(px, py); g.rotate(-.12 + i * .05); g.globalAlpha = a; g.lineWidth = sz * .16; g.strokeStyle = o.edge || '#f4ece0'; g.strokeText(ch, 0, 0); g.fillStyle = o.col || '#6a1a8a'; g.fillText(ch, 0, 0); g.restore(); });
  g.restore();
}
// black aura with crimson edge (layer 'under' behind the figure)
function fxOgreAura(g, F, t, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; fxAura(g, F, t, { col: '#1a0a10', col2: o.edge || '#c4122a', size: (o.size || .75), amt: k * .7, hold: 2, seed: 7 });
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), q = project(S.J.abd); if (!q) return; const r = S.B.h / 1.8 * q.s * 1.3;
  g.save(); g.globalCompositeOperation = 'multiply'; glow(g, q.x, q.y - r * .3, r * 1.6, '#3a1018', .45 * k); g.restore();
}
function fxOniSmoke(g, F, t, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0 || t < 0) return; const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), sc = S.B.h / 1.8, back = vMad(vLerp(S.J.abd, S.J.neck, .6), S.M.chest[2], -.25 * sc), tf = onN(t, 2);
  g.save(); for (let i = 0; i < 16 * k; i++) { const ph = (tf * .5 + hash(i * 2.3)) % 1, p = [back[0] + (hash(i * 3) - .5) * .7 * sc, back[1] + ph * 1.4 * sc, back[2] + (hash(i * 5) - .5) * .4 * sc]; const q = project(p); if (!q) continue; const r = (.15 + .3 * ph) * sc * q.s;
    g.fillStyle = rgba(i % 4 ? '#1c1418' : '#6a0c16', .45 * k * Math.sin(ph * Math.PI)); g.beginPath(); g.ellipse(q.x, q.y, r, r * 1.3, 0, 0, TAU); g.fill(); }
  g.restore();
}
// demon face formed by the back muscles (drawn on the torso surface; pose.oni 0..1). Reads only from behind (u ~ .5).
function yujOniBack(c, S, D, k) {
  if (LIGHT.override) return; const J = S.J, B = S.B, M = S.M.chest, X = M[0], Y = M[1], Z = M[2], A = clamp(k, 0, 1);
  const hgt = vDist(J.abd, J.neck), ctr = vAdd(vLerp(J.abd, J.neck, .36), vMul(Z, -B.ring.chest[1] * 1.06)), tu = vMul(X, B.ring.shoulder[0] * .8), tv = vMul(Y, hgt * .9), n = vMul(Z, -1);
  const sh = shadeHex(D.skinShade, -.12), deep = shadeHex(D.skinShade, -.5), hi = mixHex(D.skin, '#fff4e6', .45), ink = '#1a0806', pulse = .5 + .5 * Math.sin((S.t || 0) * 4);
  decal(c, ctr, tu, tv, cc => {
    cc.save(); cc.globalAlpha *= A; cc.lineJoin = 'round'; cc.lineCap = 'round';
    const blob = (pts, col, a = 1) => { cc.globalAlpha = A * a; polyPath(cc, catmull(pts, true, 4)); cc.fillStyle = col; cc.fill(); cc.globalAlpha = A; };
    for (const sx of [-1, 1]) { const m = pts => pts.map(([x, y]) => [x * sx, y]);
      blob(m([[.04, .5], [.3, .72], [.62, .66], [.78, .5], [.55, .48], [.28, .42]]), deep, .9);                        // brow ridge (traps) slanting down to the spine
      blob(m([[.1, .38], [.32, .44], [.6, .36], [.62, .2], [.38, .12], [.14, .2]]), deep, .95);                         // eye socket
      blob(m([[.2, .3], [.36, .34], [.52, .28], [.4, .22], [.24, .24]]), hi, .95);                                      // glaring eye bulge (infraspinatus)
      cc.globalAlpha = A * (.6 + .4 * pulse); cc.fillStyle = '#c4122a'; cc.beginPath(); cc.ellipse(sx * .36, .28, .04, .03, 0, 0, TAU); cc.fill(); cc.globalAlpha = A;
      blob(m([[.66, .16], [.8, .02], [.78, -.32], [.62, -.5], [.6, -.2]]), sh, .85);                                    // cheek (lats)
      inkPts(cc, m([[.62, .3], [.82, .02], [.74, -.42]]), .045, ink, [.2, .4]); inkPts(cc, m([[.06, .56], [.34, .74], [.7, .62]]), .06, ink, [.15, .4]);
      inkPts(cc, m([[.12, .36], [.36, .46], [.62, .36]]), .04, ink, [.2, .3]);
      blob(m([[.06, -.36], [.3, -.3], [.52, -.42], [.42, -.66], [.16, -.7]]), deep, .9);                                // snarl (lower lats / erectors)
      blob(m([[.1, -.4], [.16, -.62], [.22, -.4]]), hi, .95); blob(m([[.3, -.38], [.36, -.56], [.42, -.4]]), hi, .9);   // fangs (erector bulges)
    }
    blob([[-.06, .44], [.06, .44], [.08, -.1], [0, -.18], [-.08, -.1]], sh, .9); inkPts(cc, [[0, .48], [0, -.16]], .05, ink, [.1, .3]);   // nose (spine)
    inkPts(cc, [[-.5, -.34], [-.2, -.26], [0, -.3], [.2, -.26], [.5, -.34]], .05, ink, [.2, .2]); inkPts(cc, [[-.42, -.68], [0, -.76], [.42, -.68]], .04, ink, [.2, .2]);
    inkPts(cc, [[-.14, .82], [0, .86], [.14, .82]], .035, ink, [.3, .3]);                                                  // forehead furrow
    cc.restore();
  }, .05, n);
}
function fxAirPressure(g, p, dir, t, o = {}) {
  const d = o.delay == null ? .08 : o.delay; fxAirRings(g, p, dir, t, { n: 4, len: 2, r: .4, dur: .35, w: 8 });
  const u = (t - d) / .4; if (u < 0 || u > 1) return; const q = project(vMad(p, dir, .5)); if (!q) return; const r = (60 + 900 * easeOut(u));
  g.save(); g.beginPath(); g.ellipse(q.x, q.y, r, r * .55, Math.atan2(dir[1], dir[0]) * 0, 0, TAU); g.lineWidth = 14 * (1 - u); g.strokeStyle = rgba('#ffffff', .8 * (1 - u)); g.stroke(); g.restore();
}
function fxInkSplash(g, p, t, o = {}) {
  const q = hyQ(p); if (!q) return; const dur = o.dur || .7, u = t / dur; if (u < 0 || u > 1) return; const R = (o.size || 1.5) * (Array.isArray(p) ? q.s : 200), e = easeOut(clamp(u * 2.2, 0, 1)), seed = o.seed || 7;
  g.save(); g.globalAlpha = u < .7 ? 1 : 1 - (u - .7) / .3;
  for (let i = 0; i < 14; i++) { const a = hash(seed + i * 3) * TAU, l = R * (.6 + 1.2 * hash(seed + i)) * e, w = R * (.05 + .07 * hash(seed + i * 9)); const x1 = q.x + Math.cos(a) * l, y1 = q.y + Math.sin(a) * l;
    g.beginPath(); g.moveTo(q.x + Math.cos(a + 1.5) * w, q.y + Math.sin(a + 1.5) * w); g.quadraticCurveTo(lerp(q.x, x1, .6) + Math.cos(a + 1.5) * w * .6, lerp(q.y, y1, .6) + Math.sin(a + 1.5) * w * .6, x1, y1); g.quadraticCurveTo(lerp(q.x, x1, .6) - Math.cos(a + 1.5) * w * .6, lerp(q.y, y1, .6) - Math.sin(a + 1.5) * w * .6, q.x - Math.cos(a + 1.5) * w, q.y - Math.sin(a + 1.5) * w); g.fillStyle = HYFX.ink; g.fill();
    g.beginPath(); g.arc(x1 + Math.cos(a) * w * 2, y1 + Math.sin(a) * w * 2, w * .8, 0, TAU); g.fill(); }
  polyPath(g, hyJag(q.x, q.y, R * .35 * e, R * .6 * e, 10, seed)); g.fill();
  if (o.red !== false) { g.fillStyle = HYFX.red; for (let i = 0; i < 6; i++) { const a = hash(seed + 50 + i) * TAU, l = R * (.5 + hash(i + 3)) * e; g.beginPath(); g.arc(q.x + Math.cos(a) * l, q.y + Math.sin(a) * l, R * .05, 0, TAU); g.fill(); } }
  g.restore();
}
function fxBoneCrack(g, p, t, o = {}) {
  const q = hyQ(p); if (!q || t < 0 || t > (o.dur || .5)) return; const R = (o.size || .5) * (Array.isArray(p) ? q.s : 200);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'miter';
  for (let i = 0; i < 7; i++) { let a = hash(i * 13) * TAU, x = q.x, y = q.y; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { a += (hash(i * 7 + k) - .5) * 1.2; x += Math.cos(a) * R * .3; y += Math.sin(a) * R * .3; g.lineTo(x, y); } g.lineWidth = 7; g.strokeStyle = HYFX.ink; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.stroke(); }
  g.restore();
}
// blood trickle from the mouth corner for expr 'bleeding' (face decal; called from Yujiro markings)
function hyBloodMouth(c, HM, e) {
  if (!e.blood) return; const fr = faceFrame(HM, -.28, -.85, .45, .45); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = '#8a0a14'; cc.beginPath(); cc.moveTo(-.12, .2); cc.quadraticCurveTo(-.22, -.5, -.1, -1.2); cc.quadraticCurveTo(0, -.5, .05, .2); cc.closePath(); cc.fill(); cc.lineWidth = .04; cc.strokeStyle = '#2a0408'; cc.stroke(); }, .05, fr.n);
}
// ------------------------------------------------------------------------------------------------ screen processes
// calm-threat heartbeat: every beat a quick zoom pulse + radial ripple + dark red vignette; o.beats = explicit local beat times
function hyHeartbeat(f, t, o = {}) {
  if (t < 0) return; const bpm = o.bpm || 52, per = 60 / bpm, beats = o.beats || null, kk = o.k == null ? 1 : o.k;
  let dt; if (beats) { dt = 1e9; for (const b of beats) if (t >= b) dt = Math.min(dt, t - b); } else { const ph = t % per; dt = Math.min(ph, Math.abs(ph - .22)); }
  const pulse = Math.exp(-dt * 14) * kk; if (pulse < .02) return;
  f.screen((c, g2) => { const q = hyQ(o.at) || { x: W / 2, y: H / 2 }, sc = OUT.scale, src = gowCopy(c, 'hyBeat'), gg = c.getContext('2d'); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0);
    const z = 1 + .035 * pulse; gg.translate(q.x * sc, q.y * sc); gg.scale(z, z); gg.translate(-q.x * sc, -q.y * sc); gg.drawImage(src, 0, 0); gg.setTransform(1, 0, 0, 1, 0, 0);
    gg.globalAlpha = .35 * pulse; gg.translate(q.x * sc, q.y * sc); gg.scale(1 + .08 * pulse, 1 + .08 * pulse); gg.translate(-q.x * sc, -q.y * sc); gg.drawImage(src, 0, 0); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = 1;
    const vg = gg.createRadialGradient(c.width / 2, c.height / 2, c.height * .3, c.width / 2, c.height / 2, c.width * .65); vg.addColorStop(0, 'rgba(60,0,10,0)'); vg.addColorStop(1, rgba('#3a0008', .7 * pulse)); gg.fillStyle = vg; gg.fillRect(0, 0, c.width, c.height); gg.restore(); });
}
function hyHeatHaze(f, t, o = {}) {
  if (t < 0) return; const k = o.k == null ? 1 : o.k; f.screen((c) => { const q = hyQ(o.at) || { x: W / 2, y: H / 2 }, sc = OUT.scale, R = (o.r || 380) * sc, src = gowCopy(c, 'hyHaze'), gg = c.getContext('2d'), n = 18, fr = Math.floor(t * 12);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.beginPath(); gg.ellipse(q.x * sc, q.y * sc, R * .8, R * 1.2, 0, 0, TAU); gg.clip();
    for (let i = 0; i < n; i++) { const y0 = q.y * sc - R * 1.2 + i * R * 2.4 / n, h = R * 2.4 / n + 1, dx = Math.sin(i * 1.7 + fr * .9) * 6 * sc * k; gg.drawImage(src, 0, y0, c.width, h, dx, y0, c.width, h); }
    gg.restore(); });
}
function hyGammaTint(f, t, o = {}) { const k = o.k == null ? .4 : o.k; f.grade({ soft: ['#5aff3a', k * .5], lift: ['#103a08', k * .3] }); }
// slow motion remap: real time lt -> figure time (k = speed inside [t0, t1], e.g. .15)
const hySlowmo = (lt, t0, t1, k = .2) => lt < t0 ? lt : lt < t1 ? t0 + (lt - t0) * k : t0 + (t1 - t0) * k + (lt - t1);
// ------------------------------------------------------------------------------------------------ props
function drawCup(g, p, o = {}) { // shallow bronze bowl / cup on the ledge, liquid surface ripples (o.ripple 0..1)
  const q = project(p); if (!q) return; const r = (o.size || .12) * q.s, h = r * .9, lw = clamp(r * .06, 1.2, 4);
  g.save(); g.lineJoin = 'round';
  g.beginPath(); g.moveTo(q.x - r, q.y - h); g.quadraticCurveTo(q.x - r * .95, q.y, q.x - r * .3, q.y); g.lineTo(q.x + r * .3, q.y); g.quadraticCurveTo(q.x + r * .95, q.y, q.x + r, q.y - h); g.closePath(); g.fillStyle = '#9a6a2a'; g.fill(); g.lineWidth = lw; g.strokeStyle = HYFX.ink; g.stroke();
  g.fillStyle = 'rgba(255,220,140,.5)'; g.fillRect(q.x - r * .7, q.y - h * .85, r * .15, h * .6);
  g.beginPath(); g.ellipse(q.x, q.y - h, r, r * .28, 0, 0, TAU); g.fillStyle = o.fill || '#5a0a14'; g.fill(); g.stroke();
  const rp = o.ripple || 0; if (rp > 0) { g.save(); g.beginPath(); g.ellipse(q.x, q.y - h, r * .95, r * .26, 0, 0, TAU); g.clip(); for (let i = 0; i < 3; i++) { const u = ((o.t || 0) * 2 + i / 3) % 1; g.beginPath(); g.ellipse(q.x, q.y - h, r * u, r * .28 * u, 0, 0, TAU); g.lineWidth = lw * .8; g.strokeStyle = rgba('#ffb0a0', .7 * rp * (1 - u)); g.stroke(); } g.restore(); }
  g.restore();
}
function drawMeat(g, p, o = {}) { // roast on the bone (Yujiro's meal)
  const q = project(p); if (!q) return; const s = (o.size || .25) * q.s, rot = o.rot || 0, lw = clamp(s * .05, 1.2, 4);
  g.save(); g.translate(q.x, q.y); g.rotate(rot); g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-s * 1.1, -s * .08); g.lineTo(-s * .4, -s * .08); g.lineTo(-s * .4, s * .08); g.lineTo(-s * 1.1, s * .08); g.closePath(); g.fillStyle = '#efe6d2'; g.fill(); g.lineWidth = lw; g.strokeStyle = HYFX.ink; g.stroke();
  for (const sy of [-1, 1]) { g.beginPath(); g.arc(-s * 1.12, sy * s * .1, s * .1, 0, TAU); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(s * .1, 0, s * .62, s * .45, 0, 0, TAU); g.fillStyle = '#8a3a1a'; g.fill(); g.stroke();
  g.save(); g.clip(); g.fillStyle = '#5a2010'; g.beginPath(); g.ellipse(s * .3, s * .25, s * .6, s * .3, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,190,120,.6)'; g.beginPath(); g.ellipse(-s * .05, -s * .2, s * .25, s * .08, -.3, 0, TAU); g.fill(); g.restore();
  if (o.bite) { g.fillStyle = '#e88a7a'; g.beginPath(); g.arc(s * .62, -s * .1, s * .2, 0, TAU); g.fill(); g.lineWidth = lw; g.stroke(); }
  g.restore();
}
