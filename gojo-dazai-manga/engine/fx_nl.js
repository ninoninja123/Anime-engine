/* engine/fx_nl.js (agent E, naruto-vs-luffy) - NARUTO + LUFFY effects.  t = effect-local time (lt - start).  Positions: world [x,y,z] (metres) or
   screen {x,y,s} (1920x1080).  Layers: glows 'glow', ink/solid 'over', auras 'under'.
   NARUTO fxRasengan(g,c,t,{k,kind:'rasengan'|'odama'|'shuriken'|'baryon'|'planet',size})  fxRasenganHit(g,p,t,{size,kind,dur})  fxRasenTrail(g,a,b,t,{w,kind})
          fxPoof(g,p,t,{size,dur,n})  fxClonePuffs(g,pts[],t,{stagger,size})  fxChakraCloak(g,F,t,{k,kind:'kcm'|'baryon'|'sage'|'chakra'})  fxSageGather(g,F,t,{k})
          fxKurama (fx_nl3.js)  fxBaryonDrain(g,a,b,t,{n,dur})  fxChakraLines(g,F,t,{k,col})  fxKunaiThrow(g,a,b,t)
   LUFFY  fxGearSteam(g,F,t,{k,g4})  fxCloudBoa(g,S,t,{k})  fxGatling(g,F,side|null,dir,t,{n,len,fist,haki})  fxStretchLines(g,a,b,t,{w,col})
          fxHakiLightning(g,c,t,{r,n,dur,col})  fxHakiCoat(g,F,t,{joints})  fxConquerorWave(g,c,t,{r,dur})  fxRubberSnap(g,p,t,{size})  fxRubberGround(g,c,t,{r,amp,dur})
          fxDrums(g,c,t,{bpm,r})  fxBoing(g,t,{text,x,y,size,rot,col,dur})  fxToonStars(g,p,t,{n,r})  fxBajrang(g,a,dir,t,{size,travel})  fxNikaLightning(g,a,b,t)
   both   fxClashSpiral(g,p,t,{size,colA,colB})  fxShockSphere(g,p,t,{r,dur,col})  fxDebrisRing(g,c,t,{r,n})                                                      */
'use strict';
const NLFX = { blue: '#4ab4ff', blueCore: '#e8f8ff', blueDeep: '#1a5ad8', orange: '#ff8a1a', gold: '#ffd23a', red: '#e8242a', ink: '#120e16', white: '#ffffff', haki: '#14101a', hakiRed: '#ff2040', steam: '#fff4f0' };
const nlQ = p => P2(p);
const nlS = (p, q, def = 120) => Array.isArray(p) ? q.s : (p.s || def);
// ------------------------------------------------------------------------------------------------ RASENGAN family
const NL_RASCOL = { rasengan: ['#2a8cff', '#9ad8ff', '#ffffff'], odama: ['#1a6cff', '#8acfff', '#ffffff'], shuriken: ['#3a9cff', '#bfe8ff', '#ffffff'], baryon: ['#ff3a1a', '#ffb070', '#fff4e0'], planet: ['#2a8cff', '#9ad8ff', '#ffffff'], sage: ['#2a8cff', '#ffd27a', '#ffffff'] };
function nlSwirl(g, x, y, R, t, cols, o = {}) {   // swirling chakra sphere: dark rim, inner spiral strokes (ones), bright core
  const spin = t * (o.spin || 26), n = o.arms || 7;
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, R * 2.6, cols[0], .5 * (o.a || 1)); glow(g, x, y, R * 1.4, cols[1], .55 * (o.a || 1)); g.restore();
  const gr = g.createRadialGradient(x - R * .25, y - R * .25, R * .05, x, y, R); gr.addColorStop(0, cols[2]); gr.addColorStop(.35, cols[1]); gr.addColorStop(.85, cols[0]); gr.addColorStop(1, rgba(cols[0], .2));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, R * 1.02, 0, TAU); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a0 = spin + i / n * TAU, pts = []; for (let j = 0; j <= 14; j++) { const u = j / 14, a = a0 + u * 3.6, r = R * (.12 + .95 * u); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * (o.flat || .82)]); }
    g.strokeStyle = rgba(i % 2 ? cols[2] : cols[1], .85); g.lineWidth = Math.max(1.2, R * (i % 2 ? .05 : .085)); g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  g.restore();
  // outer wind rings (stepped)
  const fr = Math.floor(t * 24); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(cols[1], .7); g.lineWidth = Math.max(1, R * .05);
  for (let i = 0; i < 3; i++) { const a = (fr * .9 + i * 2.1), rr = R * (1.1 + .12 * i); g.beginPath(); g.ellipse(x, y, rr, rr * (.35 + .2 * i), a, .2, 2.4); g.stroke(); } g.restore();
  g.strokeStyle = rgba(NLFX.ink, .55); g.lineWidth = Math.max(1, R * .04); g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x - R * .2, y - R * .25, R * .45, '#ffffff', .9); g.restore();
}
function fxRasengan(g, c, t, o = {}) {
  const q = nlQ(c); if (!q) return; const k = clamp(o.k == null ? 1 : o.k, 0, 1.5), kind = o.kind || 'rasengan', cols = o.cols || NL_RASCOL[kind] || NL_RASCOL.rasengan, s = nlS(c, q);
  const base = { rasengan: .16, odama: .42, shuriken: .2, baryon: .2, planet: .14, sage: .2 }[kind] || .16, R = base * (o.size || 1) * s * easeOut(clamp(k, 0, 1)) * (1 + .04 * Math.sin(t * 50));
  if (R < 1) return;
  if (kind === 'shuriken') {   // Rasenshuriken: four broad white wind blades spinning round the core + a thin ring
    const rot = t * 30; g.save(); g.translate(q.x, q.y); g.scale(1, o.tilt == null ? .55 : o.tilt);
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, R * 6, '#9ad8ff', .35); g.restore();
    for (let b = 0; b < 4; b++) { const a = rot + b * TAU / 4; g.save(); g.rotate(a); const L = R * 4.6;
      const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.7, 'rgba(210,240,255,.75)'); gr.addColorStop(1, 'rgba(160,220,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(R * .4, -R * .55); g.quadraticCurveTo(L * .55, -R * 1.25, L, -R * .1); g.quadraticCurveTo(L * .55, R * .2, R * .4, R * .6); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(80,140,220,.55)'; g.lineWidth = Math.max(1, R * .06); g.stroke(); g.restore(); }
    g.strokeStyle = 'rgba(230,248,255,.8)'; g.lineWidth = Math.max(1, R * .08); g.beginPath(); g.arc(0, 0, R * 2.4, 0, TAU); g.stroke(); g.restore();
    nlSwirl(g, q.x, q.y, R, t, cols, { spin: 34 }); return;
  }
  if (kind === 'planet') { nlSwirl(g, q.x, q.y, R * 1.3, t, cols); for (let i = 0; i < 4; i++) { const a = t * 6 + i * TAU / 4; nlSwirl(g, q.x + Math.cos(a) * R * 3, q.y + Math.sin(a) * R * 1.1, R * .6, t + i, cols, { arms: 4 }); } return; }
  if (kind === 'baryon') { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = t * 3 + i, d = R * (1.4 + .4 * Math.sin(t * 9 + i)); glow(g, q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .7, R * .5, '#ff5a1a', .4); } g.restore(); }
  nlSwirl(g, q.x, q.y, R, t, cols, { spin: kind === 'odama' ? 18 : 26 });
}
// impact: grinding spiral blast -> dome of chakra -> spiral crater lines (Rasenshuriken = white dome of needle cuts)
function fxRasenganHit(g, p, t, o = {}) {
  const q = nlQ(p); if (!q) return; const dur = o.dur || 1.0, u = t / dur; if (u < 0 || u > 1.3) return; const kind = o.kind || 'rasengan', cols = NL_RASCOL[kind] || NL_RASCOL.rasengan, s = nlS(p, q);
  const R = (o.size || 1.6) * s * (kind === 'shuriken' ? 2.2 : kind === 'odama' ? 1.6 : 1) * easeOut(clamp(u * 1.6, 0, 1)), a = 1 - clamp((u - .6) / .7, 0, 1);
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 1.8, cols[0], .7 * a); glow(g, q.x, q.y, R * .8, cols[2], .9 * a); g.restore();
  g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(q.x, q.y, R * .1, q.x, q.y, R); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.6, rgba(cols[1], .6)); gr.addColorStop(1, rgba(cols[0], .05)); g.fillStyle = gr; g.beginPath(); g.ellipse(q.x, q.y, R, R * .92, 0, 0, TAU); g.fill();
  g.lineCap = 'round'; const fr = Math.floor(t * 24);
  if (kind === 'shuriken') { for (let i = 0; i < 70; i++) { const an = hash(i * 7 + fr) * TAU, r0 = R * hash(i * 3 + fr * 5) * .9, L = R * (.15 + .25 * hash(i)); g.strokeStyle = i % 3 ? 'rgba(255,255,255,.9)' : rgba(cols[0], .8); g.lineWidth = Math.max(1, R * .008); g.beginPath(); g.moveTo(q.x + Math.cos(an) * r0, q.y + Math.sin(an) * r0); g.lineTo(q.x + Math.cos(an + .3) * (r0 + L), q.y + Math.sin(an + .3) * (r0 + L)); g.stroke(); } }
  for (let i = 0; i < 9; i++) { const a0 = t * 22 + i / 9 * TAU, pts = []; for (let j = 0; j <= 16; j++) { const v = j / 16, an = a0 + v * 4.2, r = R * (.05 + .95 * v); pts.push([q.x + Math.cos(an) * r, q.y + Math.sin(an) * r * .9]); }
    g.strokeStyle = rgba(i % 2 ? '#ffffff' : cols[1], .8); g.lineWidth = Math.max(1.5, R * .03); g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); }
  g.strokeStyle = rgba(NLFX.ink, .6); g.lineWidth = Math.max(1.5, R * .02); g.beginPath(); g.ellipse(q.x, q.y, R, R * .92, 0, 0, TAU); g.stroke(); g.restore();
  if (Array.isArray(p) && typeof fxDebris === 'function') fxDebris(g, p, t, { n: 18, kind: 'rock', speed: 9 });
}
function fxRasenTrail(g, a, b, t, o = {}) { const qa = nlQ(a), qb = nlQ(b); if (!qa || !qb) return; const cols = NL_RASCOL[o.kind || 'rasengan'], w = (o.w || .3) * nlS(b, qb), dur = o.dur || .3, k = clamp(t / dur, 0, 1); if (t < 0 || t > dur + .35) return; const fade = 1 - clamp((t - dur) / .35, 0, 1);
  g.save(); g.globalCompositeOperation = 'lighter'; const ex = lerp(qa.x, qb.x, k), ey = lerp(qa.y, qb.y, k); g.lineCap = 'round'; for (const [lw, c, al] of [[w * 2.2, cols[0], .35], [w, cols[1], .7], [w * .35, '#ffffff', .95]]) { g.strokeStyle = rgba(c, al * fade); g.lineWidth = lw; g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(ex, ey); g.stroke(); } g.restore(); }
// ------------------------------------------------------------------------------------------------ shadow clones
function nlPuff(g, x, y, R, seed, col, ink, a) { g.save(); g.globalAlpha *= a; const n = 9; g.fillStyle = col; g.strokeStyle = ink; g.lineWidth = Math.max(1.5, R * .06);
  const pts = []; for (let i = 0; i < n; i++) { const an = i / n * TAU + seed, r = R * (.7 + .3 * hash(seed * 7 + i)); pts.push([x + Math.cos(an) * r, y + Math.sin(an) * r * .85, R * (.38 + .2 * hash(i + seed))]); }
  for (const [px, py, r] of pts) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.stroke(); } for (const [px, py, r] of pts) { g.beginPath(); g.arc(px, py, r - g.lineWidth * .5, 0, TAU); g.fill(); }
  g.beginPath(); g.arc(x, y, R * .7, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,205,220,.55)'; for (const [px, py, r] of pts.slice(0, 4)) { g.beginPath(); g.arc(px + r * .2, py + r * .25, r * .5, 0, TAU); g.fill(); } g.restore(); }
function fxPoof(g, p, t, o = {}) {   // 'BOFUN' smoke poof of a shadow clone appearing / vanishing
  const q = nlQ(p); if (!q) return; const dur = o.dur || .55, u = t / dur; if (u < 0 || u > 1) return; const R = (o.size || .9) * nlS(p, q) * (.45 + .75 * easeOut(u)), a = 1 - smooth(clamp((u - .45) / .55, 0, 1));
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 1.3, '#ffffff', .35 * (1 - u)); g.restore();
  for (let i = 0; i < (o.n || 3); i++) { const an = i * 2.3 + (o.seed || 0), d = R * .45 * easeOut(u); nlPuff(g, q.x + Math.cos(an) * d, q.y + Math.sin(an) * d * .6 - R * .1 * u, R * (.7 - i * .12), i + (o.seed || 0), '#f2f2f6', rgba(NLFX.ink, .8), a); }
  if (u < .25) { g.strokeStyle = rgba('#ffffff', 1 - u * 4); g.lineWidth = 3; for (let i = 0; i < 10; i++) { const an = i / 10 * TAU, r0 = R * .9, r1 = R * 1.5; g.beginPath(); g.moveTo(q.x + Math.cos(an) * r0, q.y + Math.sin(an) * r0); g.lineTo(q.x + Math.cos(an) * r1, q.y + Math.sin(an) * r1); g.stroke(); } }
}
function fxClonePuffs(g, pts, t, o = {}) { pts.forEach((p, i) => fxPoof(g, p, t - i * (o.stagger == null ? .03 : o.stagger), { size: o.size || .9, seed: i * 1.7, dur: o.dur })); }
// clone army helper: n Naruto figs around c (rows), each with its own phase; keyFn(i, ph) -> pose (default run/stand mix)
NL.clones = (n, o = {}) => { const out = []; const c = o.c || [0, 0, 0], yaw = o.yaw == null ? 0 : o.yaw, cols = o.cols || Math.ceil(Math.sqrt(n * 2)), sp = o.spacing || 1.3;
  for (let i = 0; i < n; i++) { const row = Math.floor(i / cols), col = i % cols, jx = (hash(i * 3.1) - .5) * .6, jz = (hash(i * 5.7) - .5) * .5;
    const lx = (col - (cols - 1) / 2) * sp + jx + (row % 2) * sp * .5, lz = -row * sp * .9 + jz, pos = [c[0] + lx * Math.cos(yaw) + lz * Math.sin(yaw), 0, c[2] - lx * Math.sin(yaw) + lz * Math.cos(yaw)], ph = hash(i * 9.3);
    const key = o.key ? (t => o.key(i, ph, t, pos)) : (t => at(pos, yaw, NL.narRun(t * 1.6 + ph, { face: expr(i % 3 ? 'yell' : 'nindo') })));
    out.push(fig('naruto', o.form || 'base', key, { timing: 2 })); }
  return out; };
// ------------------------------------------------------------------------------------------------ chakra cloaks / auras
function fxChakraCloak(g, F, t, o = {}) {
  const S = o.S || figSkel(F, t), k = clamp(o.k == null ? 1 : o.k, 0, 1.5), kind = o.kind || 'kcm', kk = S.B.h / 1.8; if (k <= .01) return;
  const cols = { kcm: ['#ffb020', '#fff2a0', '#ffe060'], baryon: ['#ff3a10', '#ffb060', '#ff7a2a'], sage: ['#ff7a2a', '#ffd0a0', '#ffa060'], chakra: ['#4ab4ff', '#d8f4ff', '#8ad0ff'] }[kind] || ['#ffb020', '#fff2a0', '#ffe060'];
  const fr = Math.floor(t * 12), J = S.J, pts = [J.head, J.neck, J.abd, J.pelvis, J.elL, J.elR, J.wrL, J.wrR, J.knL, J.knR, J.anL, J.anR, J.shL, J.shR].filter(Boolean);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const p of pts) { const q = project(p); if (!q) continue; glow(g, q.x, q.y, .42 * kk * q.s, cols[0], .16 * k); }
  // flame tongues licking upward from limbs (stepped on 2s)
  const nT = kind === 'baryon' ? 30 : 22; for (let i = 0; i < nT; i++) { const p = pts[i % pts.length], q = project(p); if (!q) continue; if (p === J.head && kind !== 'baryon') continue; const sz = (.14 + .18 * hash(i * 3 + fr)) * kk * q.s * (kind === 'baryon' ? 1.35 : 1) * k, dx = (hash(i * 7 + fr) - .5) * sz * 1.2;
    g.fillStyle = rgba(i % 3 ? cols[0] : cols[2], (kind === 'baryon' ? .2 : .22) * k); g.beginPath(); g.moveTo(q.x + dx - sz * .35, q.y); g.quadraticCurveTo(q.x + dx - sz * .25, q.y - sz * 1.1, q.x + dx + (hash(i + fr) - .5) * sz * .6, q.y - sz * 2.1); g.quadraticCurveTo(q.x + dx + sz * .3, q.y - sz * .9, q.x + dx + sz * .35, q.y); g.closePath(); g.fill(); }
  // rising sparks
  for (let i = 0; i < 18; i++) { const p = pts[(i * 5) % pts.length], q = project(p); if (!q) continue; const life = (t * 1.4 + hash(i * 11)) % 1, y = q.y - life * 1.2 * kk * q.s, x = q.x + (hash(i * 13) - .5) * .5 * kk * q.s + Math.sin(t * 6 + i) * 6;
    g.fillStyle = rgba(cols[1], (1 - life) * .9 * k); g.beginPath(); g.arc(x, y, Math.max(1, .018 * kk * q.s), 0, TAU); g.fill(); }
  g.restore();
}
function fxSageGather(g, F, t, o = {}) {   // natural energy drawn in: soft orange motes spiralling into the body + leaves
  const S = figSkel(F, t), q = project(S.J.abd); if (!q) return; const k = o.k == null ? 1 : o.k, kk = S.B.h / 1.8, R = 1.6 * kk * q.s;
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const life = (t * .6 + hash(i * 3.3)) % 1, an = hash(i * 7) * TAU + life * 3, r = R * (1 - life);
    g.fillStyle = rgba(i % 4 ? '#ffb050' : '#ffffff', .7 * k * Math.sin(life * Math.PI)); g.beginPath(); g.arc(q.x + Math.cos(an) * r, q.y + Math.sin(an) * r * .6 - R * .2, Math.max(1.2, R * .012), 0, TAU); g.fill(); }
  glow(g, q.x, q.y - R * .15, R * .7, '#ff9a40', .12 * k); g.restore();
  for (let i = 0; i < 6; i++) { const life = (t * .4 + hash(i * 5.1)) % 1, an = hash(i * 9) * TAU + life * 2.4, r = R * 1.2 * (1 - life), x = q.x + Math.cos(an) * r, y = q.y + Math.sin(an) * r * .5; g.save(); g.translate(x, y); g.rotate(an * 3); g.fillStyle = rgba('#5aa03a', .8 * Math.sin(life * Math.PI)); g.beginPath(); g.ellipse(0, 0, R * .03, R * .012, 0, 0, TAU); g.fill(); g.restore(); }
}
function fxChakraLines(g, F, t, o = {}) {   // chakra flowing along the arms (charge)
  const S = figSkel(F, t), col = o.col || '#8ad0ff', k = o.k == null ? 1 : o.k; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const sd of ['L', 'R']) { const pts = [S.J['sh' + sd], S.J['el' + sd], S.J['wr' + sd]].map(p => project(p)).filter(Boolean); if (pts.length < 3) continue;
    for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1; g.strokeStyle = rgba(col, .6 * k); g.lineWidth = 3; g.beginPath(); let st = 0; for (let j = 0; j <= 10; j++) { const u = j / 10, seg = u < .5 ? 0 : 1, uu = u < .5 ? u * 2 : (u - .5) * 2, x = lerp(pts[seg].x, pts[seg + 1].x, uu) + Math.sin(u * 12 + t * 20 + i) * 4, y = lerp(pts[seg].y, pts[seg + 1].y, uu); if (Math.abs(u - ph) < .25) { if (st++) g.lineTo(x, y); else g.moveTo(x, y); } } g.stroke(); } }
  g.restore();
}
// fxKurama: see fx_nl3.js
function fxBaryonDrain(g, a, b, t, o = {}) {   // red-orange motes stream from target a to Naruto b (life force being burned)
  const qa = nlQ(a), qb = nlQ(b); if (!qa || !qb) return; const n = o.n || 30, k = o.k == null ? 1 : o.k; g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const life = (t * .9 + hash(i * 3.7)) % 1, wob = Math.sin(life * Math.PI) * 60 * (hash(i * 5) - .5) * 2, x = lerp(qa.x, qb.x, life) + wob * .3, y = lerp(qa.y, qb.y, life) - Math.sin(life * Math.PI) * 50 + wob;
    glow(g, x, y, 12, i % 3 ? '#ff5a1a' : '#ffd070', .6 * k * Math.sin(life * Math.PI)); } g.restore();
}
function fxKunaiThrow(g, a, b, t, o = {}) { const qa = nlQ(a), qb = nlQ(b); if (!qa || !qb) return; const dur = o.dur || .25, k = clamp(t / dur, 0, 1); if (t < 0 || t > dur) return; const x = lerp(qa.x, qb.x, k), y = lerp(qa.y, qb.y, k), an = Math.atan2(qb.y - qa.y, qb.x - qa.x), L = o.len || 40;
  g.save(); g.translate(x, y); g.rotate(an); g.fillStyle = '#4a4e5a'; g.beginPath(); g.moveTo(L * .6, 0); g.lineTo(0, -L * .12); g.lineTo(-L * .1, 0); g.lineTo(0, L * .12); g.closePath(); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#2a2420'; g.fillRect(-L * .5, -L * .04, L * .42, L * .08); g.beginPath(); g.arc(-L * .58, 0, L * .07, 0, TAU); g.stroke(); g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(lerp(qa.x, x, .4), lerp(qa.y, y, .4)); g.lineTo(x, y); g.stroke(); g.restore(); }
// ------------------------------------------------------------------------------------------------ LUFFY: steam, clouds, rubber
function fxGearSteam(g, F, t, o = {}) {   // Gear 2 / 4 steam rising off the body (soft white puffs, drifting up, on 2s)
  const S = o.S || figSkel(F, t), k = clamp(o.k == null ? 1 : o.k, 0, 1.5), kk = S.B.h / 1.8, fr = Math.floor(t * 12), J = S.J, src = [J.shL, J.shR, J.neck, J.abd, J.elL, J.elR, J.knL, J.knR].filter(Boolean);
  g.save(); for (let i = 0; i < 22; i++) { const p = src[i % src.length], q = project(p); if (!q) continue; const life = ((fr / 12) * .8 + hash(i * 3.1)) % 1, r = (.08 + .2 * life) * kk * q.s * (o.g4 ? 1.4 : 1);
    const x = q.x + (hash(i * 7) - .5) * .3 * kk * q.s + Math.sin(life * 4 + i) * r * .5, y = q.y - life * .9 * kk * q.s; g.fillStyle = rgba(o.col || NLFX.steam, .42 * k * (1 - life)); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.restore();
}
function fxCloudBoa(g, S, t, o = {}) {   // Gear 5: puffy white cloud ring draped around the shoulders, ends floating
  const k = o.k == null ? 1 : o.k; if (k <= .01) return; const T = torsoModel(S, CAST.luffy, .05 * S.B.h / 1.8), kk = S.B.h / 1.8, fr = Math.floor(t * 12);
  const ring = []; for (let i = 0; i < 18; i++) { const th = i / 18 * TAU; ring.push(T.ringAt(.93, th, .06 * kk)); }
  const tail = (sg) => { const out = []; const b = T.ringAt(.85, sg * .5, .08 * kk); for (let i = 1; i <= 5; i++) out.push(vAdd(b, [sg * .06 * i * kk + Math.sin(t * 3 + i) * .03, -.08 * i * kk + Math.sin(t * 2 + i) * .02 + .03 * i * i * kk * .2, .06 * kk])); return out; };
  const pts = [...ring, ...tail(1), ...tail(-1)].map((p, i) => ({ p, q: project(p), z: camDepth(p), i })).filter(e => e.q).sort((a, b) => b.z - a.z);
  for (const e of pts) { const r = (.075 + .03 * hash(e.i)) * kk * e.q.s * k * (1 + .06 * Math.sin(t * 4 + e.i)); g.fillStyle = '#ffffff'; g.strokeStyle = '#7a6aa8'; g.lineWidth = Math.max(1.5, r * .12);
    g.beginPath(); g.arc(e.q.x, e.q.y, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(200,200,235,.6)'; g.beginPath(); g.arc(e.q.x + r * .25, e.q.y + r * .3, r * .55, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(e.q.x - r * .1, e.q.y - r * .1, r * .75, 0, TAU); g.fill(); }
}
function fxGatling(g, F, side, dir, t, o = {}) {   // dozens of blurred fist afterimages fanning forward from the shoulders (Gomu Gomu no Gatling)
  const S = figSkel(F, t), kk = S.B.h / 1.8, n = o.n || 14, L = (o.len || 1.6) * kk, fr = Math.floor(t * 24), d = vNorm(dir), up = [0, 1, 0], rt = vNorm(vCross(d, up));
  const shs = side ? [S.J['sh' + side]] : [S.J.shL, S.J.shR]; const col = o.haki ? NLFX.haki : (o.col || CAST.luffy.skin);
  for (let i = 0; i < n; i++) { const sh = shs[i % shs.length], j = hash(i * 7 + fr), off = vAdd(vMul(rt, (hash(i * 3 + fr) - .5) * .9 * kk), vMul(up, (hash(i * 5 + fr) - .5) * .7 * kk));
    const end = vAdd(vAdd(sh, vMul(d, L * (.6 + .5 * j))), off), qa = project(sh), qb = project(end); if (!qa || !qb) continue; const R = .07 * kk * qb.s * (o.fist || 1) * (o.haki ? 1.15 : 1);
    g.save(); g.globalAlpha = .35 + .5 * j; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = R * .9; g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(qb.x, qb.y); g.stroke();
    g.fillStyle = col; g.strokeStyle = NLFX.ink; g.lineWidth = Math.max(1.5, R * .15); g.beginPath(); g.arc(qb.x, qb.y, R, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = rgba(NLFX.ink, .7); g.lineWidth = Math.max(1, R * .1); for (let f = -1; f <= 1; f++) { g.beginPath(); g.arc(qb.x + R * .25, qb.y + f * R * .35, R * .45, -1, 1); g.stroke(); }
    if (o.haki) { g.globalCompositeOperation = 'lighter'; glow(g, qb.x, qb.y, R * 1.6, '#b07aff', .25); } g.restore(); }
  const qs = project(vAdd(shs[0], vMul(d, L * .8))); if (qs) { g.save(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = hash(i * 9 + fr) * TAU, r0 = 30 + 40 * hash(i + fr), r1 = r0 + 60; g.beginPath(); g.moveTo(qs.x + Math.cos(a) * r0, qs.y + Math.sin(a) * r0); g.lineTo(qs.x + Math.cos(a) * r1, qs.y + Math.sin(a) * r1); g.stroke(); } g.restore(); }
}
function fxStretchLines(g, a, b, t, o = {}) {   // rubbery speed lines along a stretching limb + 'snap' wobble rings near the end
  const qa = nlQ(a), qb = nlQ(b); if (!qa || !qb) return; const dx = qb.x - qa.x, dy = qb.y - qa.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, fr = Math.floor(t * 24), w = o.w || 40;
  g.save(); g.strokeStyle = o.col || 'rgba(255,255,255,.75)'; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const off = (hash(i * 3 + fr) - .5) * w * 2.2, u0 = hash(i * 7 + fr) * .5, u1 = u0 + .3 + .3 * hash(i); g.lineWidth = 2 + 3 * hash(i * 11);
    g.beginPath(); g.moveTo(qa.x + dx * u0 + nx * off, qa.y + dy * u0 + ny * off); g.lineTo(qa.x + dx * u1 + nx * off, qa.y + dy * u1 + ny * off); g.stroke(); } g.restore();
}
function fxRubberSnap(g, p, t, o = {}) {   // limb snapping back: wobbly concentric 'boing' arcs
  const q = nlQ(p); if (!q) return; const dur = o.dur || .4, u = t / dur; if (u < 0 || u > 1) return; const R = (o.size || .5) * nlS(p, q);
  g.save(); g.strokeStyle = rgba('#ffffff', 1 - u); g.lineWidth = 4; for (let i = 0; i < 3; i++) { const r = R * (.4 + i * .3 + u * .8); g.beginPath(); for (let j = 0; j <= 24; j++) { const an = j / 24 * TAU, rr = r * (1 + .12 * Math.sin(an * 6 + t * 40)); j ? g.lineTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr) : g.moveTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr); } g.stroke(); } g.restore();
}
// Haki: black lightning with red edges (Conqueror's clash) radiating from c
function nlBolt(g, x0, y0, x1, y1, seed, w, depth = 0) { const pts = [[x0, y0]], n = 7, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) { const u = i / n, off = (hash(seed + i * 3.3) - .5) * L * .28; pts.push([x0 + dx * u + nx * off, y0 + dy * u + ny * off]); } pts.push([x1, y1]); return pts; }
function fxHakiLightning(g, c, t, o = {}) {
  const q = nlQ(c); if (!q) return; const dur = o.dur || 1.0; if (t < 0 || t > dur) return; const R = (o.r || 4) * nlS(c, q), n = o.n || 9, fr = Math.floor(t * 24), fade = 1 - clamp((t - dur * .6) / (dur * .4), 0, 1);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < n; i++) { if (hash(i * 13 + Math.floor(fr / 2)) < .3) continue; const an = hash(i * 7 + Math.floor(fr / 2) * 3) * TAU, L = R * (.5 + .5 * hash(i * 5 + fr)), pts = nlBolt(g, q.x, q.y, q.x + Math.cos(an) * L, q.y + Math.sin(an) * L * .8, i * 17 + fr, 1);
    const path = () => { g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
    g.globalCompositeOperation = 'lighter'; path(); g.strokeStyle = rgba(o.col || NLFX.hakiRed, .8 * fade); g.lineWidth = Math.max(4, R * .045); g.stroke();
    g.globalCompositeOperation = 'source-over'; path(); g.strokeStyle = rgba(NLFX.haki, fade); g.lineWidth = Math.max(2, R * .022); g.stroke();
    const m = pts[3]; if (m && hash(i + fr) > .5) { const b2 = nlBolt(g, m[0], m[1], m[0] + Math.cos(an + .7) * L * .4, m[1] + Math.sin(an + .7) * L * .3, i * 31 + fr); g.beginPath(); b2.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = rgba(NLFX.haki, fade); g.lineWidth = Math.max(1.5, R * .012); g.stroke(); } }
  g.restore();
}
function fxConquerorWave(g, c, t, o = {}) {   // Haoshoku pressure: dark dome wave + rings + lightning
  const q = nlQ(c); if (!q) return; const dur = o.dur || 1.2, u = t / dur; if (u < 0 || u > 1) return; const R = (o.r || 10) * nlS(c, q) * easeOut(u);
  g.save(); g.globalAlpha = (1 - u) * .8; g.strokeStyle = '#000'; g.lineWidth = 14 * (1 - u) + 2; g.beginPath(); g.ellipse(q.x, q.y, R, R * .35, 0, 0, TAU); g.stroke(); g.strokeStyle = NLFX.hakiRed; g.lineWidth = 3; g.beginPath(); g.ellipse(q.x, q.y, R * .96, R * .33, 0, 0, TAU); g.stroke(); g.restore();
  fxHakiLightning(g, c, t, { r: (o.r || 10) * .55, n: 12, dur });
}
function fxHakiCoat(g, F, t, o = {}) {   // glossy purple-white sheen sliding along black-coated limbs
  const S = figSkel(F, t), js = o.joints || [['elR', 'wrR'], ['elL', 'wrL']]; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [a, b] of js) { const qa = project(S.J[a]), qb = project(S.J[b]); if (!qa || !qb) continue; const ph = (t * 1.5) % 1; g.strokeStyle = 'rgba(200,180,255,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(lerp(qa.x, qb.x, ph * .6), lerp(qa.y, qb.y, ph * .6) - 4); g.lineTo(lerp(qa.x, qb.x, ph * .6 + .3), lerp(qa.y, qb.y, ph * .6 + .3) - 4); g.stroke(); } g.restore();
}
function fxRubberGround(g, c, t, o = {}) {   // Gear 5: the floor turns to rubber - concentric bulging ripples with ink outlines (cartoon)
  const q = nlQ(c); if (!q) return; const dur = o.dur || 2.0; if (t < 0 || t > dur) return; const R = (o.r || 8), amp = (o.amp || .35), fade = 1 - clamp((t - dur * .6) / (dur * .4), 0, 1);
  for (let i = 4; i >= 0; i--) { const r = R * ((t * .9 + i * .22) % 1.1), pts = [], h = amp * Math.sin(((t * .9 + i * .22) % 1.1) * Math.PI) * fade; for (let j = 0; j <= 36; j++) { const an = j / 36 * TAU; pts.push(project([c[0] + Math.cos(an) * r, h * (1 + .3 * Math.sin(an * 4 + t * 6)), c[2] + Math.sin(an) * r])); }
    if (pts.some(p => !p)) continue; g.save(); g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.strokeStyle = rgba('#3a2a5a', .85 * fade); g.lineWidth = 6; g.stroke(); g.strokeStyle = rgba('#fff4c8', .8 * fade); g.lineWidth = 2.5; g.stroke(); g.restore(); }
}
function fxDrums(g, c, t, o = {}) {   // Drums of Liberation: heartbeat 'don don' rings pulsing out of the chest
  const q = nlQ(c); if (!q || t < 0) return; const bpm = o.bpm || 150, per = 60 / bpm, R = (o.r || 1.6) * nlS(c, q);
  g.save(); for (let i = 0; i < 3; i++) { const ph = (((t + i * per * .5) % (per * 1.5)) + per * 1.5) % (per * 1.5) / (per * 1.5); g.strokeStyle = rgba('#ffffff', (1 - ph) * .85); g.lineWidth = 6 * (1 - ph) + 1; g.beginPath(); g.arc(q.x, q.y, R * (.2 + ph), 0, TAU); g.stroke(); } g.restore();
}
// cartoon sound-effect word (BOING / POING / DON / BOYOYON): bubble letters, squash bounce, wobble; t = local time, dur
function fxBoing(g, t, o = {}) {
  const dur = o.dur || .8, u = t / dur; if (u < 0 || u > 1) return; const txt = (o.text || 'BOING!').toUpperCase(), size = (o.size || 150), x = o.x == null ? W / 2 : o.x, y = o.y == null ? H * .4 : o.y;
  const pop = u < .15 ? easeOut(u / .15) * 1.25 : 1 + .25 * Math.exp(-(u - .15) * 8) * Math.cos((u - .15) * 40), fade = 1 - clamp((u - .8) / .2, 0, 1), cols = o.cols || ['#ffffff', '#ffe14a', '#ff7ab8'];
  g.save(); g.translate(x, y); g.rotate(o.rot == null ? -.1 : o.rot); g.globalAlpha = fade; g.font = `${size}px "Bangers", "Inter Display", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const L = txtLetters(g, txt, size * .16); let x0 = -L.w / 2;
  for (let i = 0; i < txt.length; i++) { const ch = txt[i], cx = x0 + L.xs[i] + g.measureText(ch).width / 2, bob = Math.sin(t * 18 + i * .9) * size * .08, sq = 1 + .15 * Math.sin(t * 22 + i);
    g.save(); g.translate(cx, bob); g.scale(pop / sq, pop * sq); g.rotate(Math.sin(i * 1.7 + t * 9) * .12);
    g.lineWidth = size * .28; g.strokeStyle = o.ink || '#2a1a4a'; g.strokeText(ch, 0, 0); g.lineWidth = size * .14; g.strokeStyle = cols[2]; g.strokeText(ch, 0, 0);
    const gr = g.createLinearGradient(0, -size * .45, 0, size * .4); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); g.fillStyle = gr; g.fillText(ch, 0, 0);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(-size * .12, -size * .22, size * .07, size * .04, -.5, 0, TAU); g.fill(); g.restore(); }
  g.restore();
}
function fxToonStars(g, p, t, o = {}) { const q = nlQ(p); if (!q) return; const n = o.n || 6, R = (o.r || .5) * nlS(p, q); for (let i = 0; i < n; i++) { const an = t * 4 + i / n * TAU, x = q.x + Math.cos(an) * R, y = q.y + Math.sin(an) * R * .35, r = R * .14;
  g.save(); g.translate(x, y); g.rotate(t * 6 + i); g.fillStyle = i % 2 ? '#ffe14a' : '#ffffff'; g.strokeStyle = '#2a1a4a'; g.lineWidth = Math.max(2, r * .2); g.beginPath(); for (let j = 0; j < 10; j++) { const a = j / 10 * TAU - Math.PI / 2, rr = j % 2 ? r * .45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); } }
// Gear 5 giant fist (Bajrang Gun style): huge cartoon fist flying along dir with steam + speed lines
function fxBajrang(g, a, dir, t, o = {}) {
  const travel = (o.travel || 12) * easeOut(clamp(t / (o.dur || .5), 0, 1)), p = vAdd(a, vMul(vNorm(dir), travel)), q = project(p), qa = project(a); if (!q || !qa) return; const R = (o.size || 2.4) * q.s;
  g.save(); g.lineCap = 'round'; g.strokeStyle = '#fbe0c6'; g.lineWidth = R * .9; g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(q.x, q.y); g.stroke(); g.strokeStyle = '#2a1a4a'; g.lineWidth = Math.max(3, R * .05); g.stroke();
  g.fillStyle = '#fbe0c6'; g.strokeStyle = '#2a1a4a'; g.lineWidth = Math.max(4, R * .06); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill(); g.stroke();
  for (let f = 0; f < 4; f++) { const yy = q.y + (f - 1.5) * R * .42; g.beginPath(); g.ellipse(q.x + R * .45, yy, R * .42, R * .2, 0, -1.4, 1.4); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(q.x - R * .35, q.y - R * .45, R * .25, R * .12, -.6, 0, TAU); g.fill();
  for (let i = 0; i < 10; i++) { const an = hash(i * 3) * TAU, d = R * (1.2 + .4 * Math.sin(t * 9 + i)); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(q.x + Math.cos(an) * d, q.y + Math.sin(an) * d, R * .16, 0, TAU); g.fill(); }
  g.restore();
}
function fxNikaLightning(g, a, b, t, o = {}) {   // Gear 5 grabbing lightning: a bright cartoon zig-zag with thick outline
  const qa = nlQ(a), qb = nlQ(b); if (!qa || !qb) return; const fr = Math.floor(t * 12), pts = nlBolt(g, qa.x, qa.y, qb.x, qb.y, fr * 7, 1);
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; const path = () => { g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  path(); g.strokeStyle = '#2a1a4a'; g.lineWidth = 22; g.stroke(); path(); g.strokeStyle = '#ffe14a'; g.lineWidth = 13; g.stroke(); path(); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.stroke(); g.restore();
}
// ------------------------------------------------------------------------------------------------ shared
function fxClashSpiral(g, p, t, o = {}) {   // two energies grinding: half blue spiral / half red-gold burst, sparks
  const q = nlQ(p); if (!q) return; const R = (o.size || 1.5) * nlS(p, q), fr = Math.floor(t * 24), ca = o.colA || '#4ab4ff', cb = o.colB || '#ff4a2a';
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x - R * .3, q.y, R * 1.6, ca, .55); glow(g, q.x + R * .3, q.y, R * 1.6, cb, .55); glow(g, q.x, q.y, R * .6, '#ffffff', .9);
  for (let i = 0; i < 30; i++) { const an = hash(i * 7 + fr) * TAU, d = R * (.4 + 1.4 * hash(i * 3 + fr)); g.strokeStyle = rgba(i % 2 ? ca : cb, .8); g.lineWidth = 2 + 3 * hash(i); g.beginPath(); g.moveTo(q.x + Math.cos(an) * d * .4, q.y + Math.sin(an) * d * .4); g.lineTo(q.x + Math.cos(an) * d, q.y + Math.sin(an) * d); g.stroke(); }
  g.restore();
}
function fxShockSphere(g, p, t, o = {}) { const q = nlQ(p); if (!q) return; const dur = o.dur || .5, u = t / dur; if (u < 0 || u > 1) return; const R = (o.r || 3) * nlS(p, q) * easeOut(u);
  g.save(); g.globalAlpha = 1 - u; g.strokeStyle = o.col || '#ffffff'; g.lineWidth = 10 * (1 - u) + 2; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); g.globalAlpha = (1 - u) * .25; g.fillStyle = o.col || '#ffffff'; g.fill(); g.restore(); }
function fxDebrisRing(g, c, t, o = {}) { if (typeof fxDebris === 'function') fxDebris(g, c, t, { n: o.n || 26, kind: 'rock', speed: o.speed || 8 }); if (typeof fxDust === 'function') fxDust(g, c, t, { r: o.r || 4 }); }
