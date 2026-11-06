/* engine/fx_nl4.js (agent E, naruto-vs-luffy) - impact_requests.md effect names (aliases + the missing ones).  t = effect-local time.
   fxCloneSmoke(g,p,t,{n,r}) = fxPoof   fxRasenshuriken(g,p,t,{r,dome}) (orb + optional expanding dome)   fxSageAura(g,F,t,{k})   fxKCMCloak(g,F,t,{k})   fxKuramaAvatar(g,F,t,{k,scale})
   fxChakraArms(g,F,t,{n,reach,to,k})  golden chakra arms growing from Naruto's back (to = world target they grab)
   fxRubberArm(g,from,to,t,{wobble,r,fist,col})  free-standing rubber arm (2D)   fxSteam = fxGearSteam   fxHakiArms = fxHakiCoat   fxConquerorSky(g,t,{k,seed}) black-red sky cracks (screen)
   fxObservationGhost(g,F,t,{dt,col,alpha})  reddish translucent 'future' copy of a figure (draws F at t+dt as a flat silhouette)
   fxGiantFist(g,a,b,t,{dur,size,haki})  fxToonImpactStar(g,p,t,{size,text})  fxLightningRope(g,a,b,t,{loops})  fxToonXray(g,F,t)  fxCloudScarf = fxCloudBoa  fxToonSweat(g,F,t)
   fxDrumPulse(g,F,t,{bpm})  fxLifeDrain = fxBaryonDrain  fxEmbers (fx_ds.js)  fxRubberGround(g,c,t,{r,amp,dur}) (fx_nl.js; world floor waves)                                     */
'use strict';
function fxCloneSmoke(g, p, t, o = {}) { return fxPoof(g, p, t, { size: o.r || .9, n: o.n || 3, dur: o.dur }); }
function fxRasenshuriken(g, p, t, o = {}) { fxRasengan(g, p, t, { kind: 'shuriken', k: 1, size: (o.r || .2) / .2 }); if (o.dome) fxRasenganHit(g, p, t - o.dome, { kind: 'shuriken', size: o.domeR || 1.6 }); }
function fxSageAura(g, F, t, o = {}) { fxChakraCloak(g, F, t, { k: (o.k == null ? 1 : o.k) * .6, kind: 'sage' }); }
function fxKCMCloak(g, F, t, o = {}) { fxChakraCloak(g, F, t, { k: o.k == null ? 1 : o.k, kind: 'kcm' }); }
function fxKuramaAvatar(g, F, t, o = {}) { const S = figSkel(F, t); fxKurama(g, [S.J.pelvis[0], 0, S.J.pelvis[2]], t, Object.assign({ scale: o.scale || 14, rise: o.k == null ? 1 : o.k, alpha: .8 }, o)); }
const fxSteam = (g, F, t, o) => fxGearSteam(g, F, t, o), fxHakiArms = (g, F, t, o) => fxHakiCoat(g, F, t, o), fxCloudScarf = (g, S, t, o) => fxCloudBoa(g, S, t, o), fxLifeDrain = (g, a, b, t, o) => fxBaryonDrain(g, a, b, t, o);
function fxChakraArms(g, F, t, o = {}) {   // 2-4 golden chakra arms sprouting from the shoulder blades, reaching out (k 0..1 growth) toward o.to
  const S = figSkel(F, t), kk = S.B.h / 1.8, k = clamp(o.k == null ? 1 : o.k, 0, 1), n = o.n || 2, back = vMul(S.M.chest[2], -1), up = [0, 1, 0];
  for (let i = 0; i < n; i++) { const sg = i % 2 ? 1 : -1, root = vAdd(vAdd(S.J.neck, vMul(back, .12 * kk)), vMul(S.M.chest[0], sg * .18 * kk)), tgt = o.to ? vAdd(o.to, [sg * .4 * Math.floor(i / 2 + 1), 0, 0]) : vAdd(root, vAdd(vMul(S.M.chest[2], (o.reach || 3) * kk), vMul(up, (.5 + i * .3) * kk)));
    const end = vLerp(root, tgt, easeOut(k)), mid = vAdd(vLerp(root, end, .5), vAdd(vMul(up, .8 * kk * (1 + i * .2)), vMul(S.M.chest[0], sg * .5 * kk))), pts = []; for (let j = 0; j <= 14; j++) { const u = j / 14, a0 = vLerp(root, mid, u), a1 = vLerp(mid, end, u); pts.push(project(vLerp(a0, a1, u))); }
    if (pts.some(q => !q)) continue; const w0 = .14 * kk * pts[0].s, w1 = .1 * kk * pts[14].s;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round'; for (const [lw, col, a] of [[2.2, '#ff9a10', .35], [1.2, '#ffc43a', .7], [.45, '#fff2a0', .9]]) { g.strokeStyle = rgba(col, a); g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.lineWidth = lerp(w0, w1, .5) * lw; g.stroke(); }
    const qe = pts[14]; glow(g, qe.x, qe.y, w1 * 2.5, '#ffd040', .6); g.restore();
    g.save(); g.strokeStyle = 'rgba(60,20,0,.7)'; g.lineWidth = Math.max(1.5, w1 * .15); for (let f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(qe.x, qe.y); g.lineTo(qe.x + f * w1 * .9 + (qe.x - pts[12].x) * .8, qe.y + (qe.y - pts[12].y) * .8 - w1 * .3); g.stroke(); } g.restore(); }
}
function fxRubberArm(g, from, to, t, o = {}) { const qa = P2(from), qb = P2(to); if (!qa || !qb) return; const dx = qb.x - qa.x, dy = qb.y - qa.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, r = (o.r || .06) * (Array.isArray(to) ? qb.s : 100), wob = o.wobble == null ? .2 : o.wobble;
  g.save(); g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, off = Math.sin(u * Math.PI) * Math.sin(t * 14 + u * 9) * L * .06 * wob; i ? g.lineTo(qa.x + dx * u + nx * off, qa.y + dy * u + ny * off) : g.moveTo(qa.x, qa.y); }
  g.strokeStyle = LIGHT.ink; g.lineWidth = r * 2 + 5; g.stroke(); g.strokeStyle = o.col || CAST.luffy.skin; g.lineWidth = r * 2; g.stroke(); const R = r * 1.9 * (o.fist || 1); g.fillStyle = o.col || CAST.luffy.skin; g.strokeStyle = LIGHT.ink; g.lineWidth = Math.max(2, R * .12); g.beginPath(); g.arc(qb.x, qb.y, R, 0, TAU); g.fill(); g.stroke(); g.restore(); }
function fxConquerorSky(g, t, o = {}) {   // the sky splits into black-red lightning cracks (screen space, upper half), k 0..1
  const k = clamp(o.k == null ? 1 : o.k, 0, 1), fr = Math.floor(t * 12), r = rng((o.seed || 7) + Math.floor(fr / 2)); if (k <= 0) return; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = rgba('#1a0006', .35 * k); g.fillRect(0, 0, W, H * .55);
  for (let i = 0; i < 9 * k; i++) { let x = W * (.1 + .8 * r()), y = 0; const pts = [[x, y]]; while (y < H * .6) { x += (r() - .5) * 160; y += 40 + r() * 70; pts.push([x, y]); }
    const path = () => { g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); }; g.globalCompositeOperation = 'lighter'; path(); g.strokeStyle = rgba('#ff2040', .7 * k); g.lineWidth = 18; g.stroke(); g.globalCompositeOperation = 'source-over'; path(); g.strokeStyle = rgba('#000', k); g.lineWidth = 7; g.stroke(); }
  g.restore(); }
function fxObservationGhost(g, F, t, o = {}) {   // the opponent's next move as a reddish translucent ghost (F drawn at t + dt, flat)
  const dt = o.dt == null ? .35 : o.dt; g.save(); g.globalCompositeOperation = 'source-over'; drawFig(g, F, t + dt, { mode: 'flat', col: o.col || '#ff4a5a', alpha: o.alpha == null ? .35 : o.alpha }); g.restore(); }
function fxGiantFist(g, a, b, t, o = {}) { const dur = o.dur || .5, k = clamp(t / dur, 0, 1); if (t < 0 || t > dur + .4) return; const p = vLerp(a, b, easeIn(k)), q = project(p); if (!q) return; const R = (o.size || 3) * q.s;
  g.save(); if (o.haki !== false) { g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 1.6, '#ff2040', .3); g.globalCompositeOperation = 'source-over'; } g.fillStyle = o.haki === false ? CAST.luffy.skin : '#0c0c0e'; g.strokeStyle = o.haki === false ? '#1a0a0a' : '#5a4a7a'; g.lineWidth = Math.max(3, R * .05);
  g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill(); g.stroke(); for (let f = 0; f < 4; f++) { g.beginPath(); g.ellipse(q.x + R * .45, q.y + (f - 1.5) * R * .42, R * .42, R * .2, 0, -1.4, 1.4); g.stroke(); } g.restore();
  if (o.haki !== false) fxHakiLightning(g, p, t % .6, { r: (o.size || 3) * 1.4, n: 7, dur: .6 }); }
function fxToonImpactStar(g, p, t, o = {}) { const q = P2(p); if (!q) return; const dur = o.dur || .45, u = t / dur; if (u < 0 || u > 1) return; const R = (o.size || 1.2) * (Array.isArray(p) ? q.s : 100) * (u < .3 ? easeOut(u / .3) : 1) * (1 - .3 * u);
  g.save(); g.globalAlpha = 1 - clamp((u - .7) / .3, 0, 1); for (const [rr, col] of [[1, '#ffe14a'], [.6, '#ff3a3a']]) { g.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + t * 2, r = i % 2 ? R * rr * .45 : R * rr; g.lineTo(q.x + Math.cos(a) * r, q.y + Math.sin(a) * r); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = Math.max(3, R * .04); g.strokeStyle = '#2a1a4a'; g.stroke(); }
  g.restore(); if (o.text) fxBoing(g, t, { text: o.text, x: q.x, y: q.y - R * .1, size: Math.min(220, R * .55), dur }); }
function fxLightningRope(g, a, b, t, o = {}) {   // Gear 5 grabs lightning like a rope: thick cartoon zig-zag with a loop (lasso) at b
  const qa = P2(a), qb = P2(b); if (!qa || !qb) return; fxNikaLightning(g, a, b, t); const R = 40 + 10 * Math.sin(t * 9); g.save(); g.lineWidth = 16; g.strokeStyle = '#2a1a4a'; g.beginPath(); g.ellipse(qb.x, qb.y, R * 1.4, R * .6, .3, 0, TAU); g.stroke(); g.lineWidth = 8; g.strokeStyle = '#ffe14a'; g.stroke(); g.restore(); }
function fxToonXray(g, F, t, o = {}) { const S = figSkel(F, t), on = Math.floor(t * 12) % 2 === 0; if (!on) return; g.save(); drawFig(g, F, t, { mode: 'flat', col: '#2a3a8a', alpha: .7 }); g.strokeStyle = '#ffffff'; g.lineCap = 'round';
  for (const [a, b] of [['pelvis', 'abd'], ['abd', 'neck'], ['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'], ['hipL', 'knL'], ['knL', 'anL'], ['hipR', 'knR'], ['knR', 'anR'], ['shL', 'shR']]) { const qa = project(S.J[a]), qb = project(S.J[b]); if (!qa || !qb) continue; g.lineWidth = Math.max(4, .045 * qa.s); g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(qb.x, qb.y); g.stroke(); }
  const qh = project(S.J.head); if (qh) { const r = .12 * qh.s; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(qh.x, qh.y, r, r * 1.15, 0, 0, TAU); g.fill(); g.fillStyle = '#000'; for (const sg of [-1, 1]) { g.beginPath(); g.arc(qh.x + sg * r * .38, qh.y, r * .25, 0, TAU); g.fill(); } } g.restore(); }
function fxToonSweat(g, F, t, o = {}) { NL.toonLines(g, figSkel(F, t), t, o.k == null ? 1 : o.k); }
function fxDrumPulse(g, F, t, o = {}) { const S = figSkel(F, t); fxDrums(g, S.J.neck ? vLerp(S.J.neck, S.J.abd, .4) : S.J.abd, t, { bpm: o.bpm || 150, r: o.r || 1.4 }); }
