/* engine/fx_hvg2.js (agent E, project harry-vs-gojo) - HARRY POTTER spell effects + Urahara announcer props.
   t = effect time (lt - start); positions world [x,y,z] or screen {x,y}.  Wand tip of a figure: hvWandTip(F, t) (= swordAt(F,t).tip).
   SPELLS
     fxSpellBeam(g, a, b, t, {col, core, w, dur, life, wobble, helix, sparks, hit, hitSize, jag})   generic wand beam a -> b (grows, holds, fades)
     fxExpelliarmus(g, a, b, t, o)   scarlet disarming beam (+ disarm burst at b)       fxStupefy(g, a, b, t, o)  short red bolt (stunner)
     fxAvada(g, a, b, t, o)          jagged green killing curse with rushing rings      fxConfringo(g, a, b, t, o) orange bolt + fire explosion
     fxBeamClash(g, a, b, mid, t, {colA, colB, w})   two beams lock at a sparking knot (Priori Incantatem style)
     fxProtego(g, c, n, t, {r, hits:[{t0, p}], crack, alpha, dur})   blue-gold hexagon shield cap facing n
     fxPatronus(g, p, dir, t, {scale, gallop, alpha, trail, rear})   silver stag (2D drawn on a world anchor), galloping, mist trail
     patronusPath(a, b, t, {speed, hop}) -> point                    helper: galloping path a -> b
     fxAccio(g, a, b, t, {dur, col})                                 summoning light line with chevrons travelling toward the wand
     fxIncendio(g, a, dir, t, {len, w, dur})                         fire stream from the wand          fxReparo(g, c, t, {n, r, dur}) pieces fly back together
     fxApparate(g, p, t, {out:true|false, h, r})                     twisting black smoke + crack ring;  apparateFig(t, dur, out) -> {alpha, sq}
     fxInvisCloak(g, F, ft, k, {col})                                silver refraction edge of a figure under the Invisibility Cloak
                                                                     (draw the figure with f.fig(F, {alpha: 1 - .93 * k}) and this layer:'over')
     fxCloakThrow(g, F, ft, t, {dur})                                the silvery cloak swirls over the body (0..dur), then k = 1
     fxGhosts(g, c, t, {n, r, col, alpha, h})                        Resurrection Stone: translucent spectral figures circling
     fxWandTrail(g, F, t, {span, col, w, n})                         light trail of the wand tip over the last 'span' seconds (spell-writing)
     fxWandSparks(g, F, t, {col, n, dur})                            sparks at the wand tip      fxLumos(g, F, t, {col, r})
     fxSerpent(g, a, b, t, {col, size})                              Parseltongue: a shadow snake slithering a -> b
     fxSpellRunes(g, c, t, {r, col, up})                             rotating golden rune circle (big spell charge)
   URAHARA (announcer)
     pose field mic 1 (handheld microphone in the right hand; 'micHand') on CAST.urahara + POSES urahara_announce, urahara_announceFan, urahara_shout
     fxMicWaves(g, p, t, {col, n, dir})                              sound rings from the microphone
     drawMegaphone(g, p, {yaw, size})                                megaphone prop (booth)                                                   */
'use strict';
const HVFX2 = { red: '#ff3a36', red2: '#ffd2c8', green: '#3dff6a', green2: '#e2ffe8', gold: '#ffcf5a', gold2: '#fff3c8', shield: '#7fc8ff', silver: '#e6f0ff', silver2: '#9fc4ff', fire: '#ff8a2a' };
function hvWandTip(F, t) { const s = swordAt(F, t); return s ? s.tip : figPos(F, t, 'handR'); }

// =========================================================================================================== BEAMS
function fxSpellBeam(g, a, b, t, o = {}) {
  const dur = o.dur || .18, life = o.life == null ? .5 : o.life, fadeT = o.fade || .25; if (t < 0 || t > dur + life + fadeT) return;
  const qa = hvQ(a), qb0 = hvQ(b); if (!qa || !qb0) return; const u = clamp(t / dur, 0, 1), e = easeOut(u), fade = clamp((dur + life + fadeT - t) / fadeT, 0, 1);
  const tail = o.trail ? clamp((t - o.trail) / dur, 0, 1) : 0, qb = { x: lerp(qa.x, qb0.x, e), y: lerp(qa.y, qb0.y, e) }, q0 = { x: lerp(qa.x, qb0.x, tail), y: lerp(qa.y, qb0.y, tail) };
  const col = o.col || HVFX2.red, core = o.core || '#ffffff', w = (o.w || 1) * Math.max(3, .045 * Math.min(qa.s, qb0.s || qa.s)), fr = Math.floor(t * 24);
  const L = Math.hypot(qb.x - q0.x, qb.y - q0.y), ang = Math.atan2(qb.y - q0.y, qb.x - q0.x), nx = -Math.sin(ang), ny = Math.cos(ang), n = Math.max(6, Math.floor(L / 18));
  const pts = []; for (let i = 0; i <= n; i++) { const s = i / n, wob = (o.wobble == null ? 1 : o.wobble) * Math.sin(s * 9 + t * 40) * w * .35 * Math.sin(s * Math.PI) + (o.jag ? (hash(i * 7 + fr) - .5) * w * 2.2 * o.jag * Math.sin(s * Math.PI) : 0); pts.push([lerp(q0.x, qb.x, s) + nx * wob, lerp(q0.y, qb.y, s) + ny * wob]); }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter'; g.globalAlpha = fade;
  polyPath(g, pts, false); g.strokeStyle = rgba(col, .22); g.lineWidth = w * 4.5; g.stroke(); g.strokeStyle = rgba(col, .75); g.lineWidth = w * 1.8; g.stroke(); g.strokeStyle = core; g.lineWidth = w * .6; g.stroke();
  if (o.helix !== false) for (const ph of [0, Math.PI]) { const hp = []; for (let i = 0; i <= n; i++) { const s = i / n, off = Math.sin(s * L / 28 - t * 30 + ph) * w * 1.6; hp.push([pts[i][0] + nx * off, pts[i][1] + ny * off]); } polyPath(g, hp, false); g.strokeStyle = rgba(o.col2 || core, .55); g.lineWidth = Math.max(1, w * .3); g.stroke(); }
  if (o.sparks !== false) for (let i = 0; i < 10; i++) { const s = hash(i * 3 + fr), p = pts[Math.floor(s * n)], an = hash(i * 5 + fr) * TAU, d = w * (2 + hash(i * 9 + fr) * 4); g.strokeStyle = rgba(core, .8); g.lineWidth = 1.5; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + Math.cos(an) * d, p[1] + Math.sin(an) * d); g.stroke(); }
  glow(g, qa.x, qa.y, w * 5, col, .6); glow(g, qb.x, qb.y, w * 6, col, .7);
  if (u >= 1 && o.hit !== false) { const k = clamp((t - dur) / .35, 0, 1); glow(g, qb0.x, qb0.y, w * (14 + 10 * k) * (o.hitSize || 1), col, .8 * (1 - k * .6)); fxImpactStar(g, qb0.x, qb0.y, w * 9 * (1 - k * .5) * (o.hitSize || 1), fr * .4, rgba('#ffffff', .9 * (1 - k)), 4); for (const rr of [1, 1.7]) { g.strokeStyle = rgba(col, .8 * (1 - k)); g.lineWidth = Math.max(1.5, w * .6 * (1 - k)); g.beginPath(); g.arc(qb0.x, qb0.y, w * 6 * rr * (.3 + k), 0, TAU); g.stroke(); } }
  g.restore();
}
function fxExpelliarmus(g, a, b, t, o = {}) { fxSpellBeam(g, a, b, t, Object.assign({ col: HVFX2.red, core: '#fff2ea', col2: '#ffb0a0', w: 1.1, dur: .16, life: .45 }, o)); }
function fxStupefy(g, a, b, t, o = {}) { fxSpellBeam(g, a, b, t, Object.assign({ col: '#ff2a4a', core: '#ffe0e6', w: .9, dur: .14, life: .05, trail: .08, helix: false, fade: .2 }, o)); }
function fxAvada(g, a, b, t, o = {}) {
  fxSpellBeam(g, a, b, t, Object.assign({ col: HVFX2.green, core: '#f4fff6', col2: '#a8ffb8', w: 1.2, dur: .2, life: .4, jag: 1, helix: false }, o));
  const qa = hvQ(a), qb = hvQ(b); if (!qa || !qb || t < 0 || t > .8) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) { const s = ((t * 3 + k / 4) % 1), x = lerp(qa.x, qb.x, s), y = lerp(qa.y, qb.y, s); g.strokeStyle = rgba(HVFX2.green, .5 * (1 - s)); g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, 14 + 30 * s, 30 + 50 * s, Math.atan2(qb.y - qa.y, qb.x - qa.x), 0, TAU); g.stroke(); }
  g.restore();
}
function fxConfringo(g, a, b, t, o = {}) { fxSpellBeam(g, a, b, t, Object.assign({ col: HVFX2.fire, core: '#fff4d8', w: 1, dur: .16, life: .05, trail: .1, helix: false }, o)); if (t > .16) fxExplosion(g, b, t - .16, { size: o.size || 3.2, pal: 'fire', dur: 1.2, ring: true, debris: true }); }
function fxBeamClash(g, a, b, mid, t, o = {}) {
  fxSpellBeam(g, a, mid, t, { col: o.colA || HVFX2.red, core: '#fff', w: o.w || 1.2, dur: .15, life: 99, hit: false, sparks: true });
  fxSpellBeam(g, b, mid, t, { col: o.colB || HVFX2.green, core: '#fff', w: o.w || 1.2, dur: .15, life: 99, hit: false, sparks: true });
  const q = hvQ(mid); if (!q || t < .15) return; const fr = Math.floor(t * 24), R = .25 * q.s * (1 + .15 * Math.sin(t * 37)); g.save(); g.globalCompositeOperation = 'lighter';
  glow(g, q.x, q.y, R * 5, o.colKnot || HVFX2.gold, .8); glow(g, q.x, q.y, R * 1.4, '#ffffff', 1);
  for (let i = 0; i < 26; i++) { const an = hash(i * 7 + fr) * TAU, d = R * (1.5 + hash(i + fr * 3) * 5); g.strokeStyle = rgba(i % 2 ? HVFX2.gold2 : '#ffffff', .85); g.lineWidth = 2; g.beginPath(); g.moveTo(q.x + Math.cos(an) * R, q.y + Math.sin(an) * R); g.lineTo(q.x + Math.cos(an) * d, q.y + Math.sin(an) * d); g.stroke(); }
  g.restore();
}
// =========================================================================================================== PROTEGO
function fxProtego(g, c, n, t, o = {}) {
  if (t < 0) return; const dur = o.dur || 99, grow = easeOut(clamp(t / .18, 0, 1)), fade = clamp((dur - t) / .3, 0, 1); if (fade <= 0) return;
  const R = (o.r || 1.25) * grow, N = vNorm(n), e1 = vNorm(vCross(N, Math.abs(N[1]) > .9 ? [1, 0, 0] : [0, 1, 0])), e2 = vCross(N, e1), bulge = .35 * R;
  const P = (x, y) => { const d2 = (x * x + y * y) / (R * R); return vAdd(c, vAdd(vAdd(vMul(e1, x), vMul(e2, y)), vMul(N, bulge * (1 - d2)))); };
  let flash = 0; for (const h of (o.hits || [])) { const u = (t - h.t0) / .4; if (u >= 0 && u < 1) flash = Math.max(flash, 1 - u); }
  const a = (o.alpha == null ? 1 : o.alpha) * fade, hs = R / 5.2, cells = [];
  for (let iy = -7; iy <= 7; iy++) for (let ix = -7; ix <= 7; ix++) { const x = (ix + (iy & 1) * .5) * hs * 1.732, y = iy * hs * 1.5; if (x * x + y * y > R * R * .93) continue; cells.push([x, y]); }
  g.save(); g.lineJoin = 'round';
  const qc = hvQ(c); if (qc) { g.globalCompositeOperation = 'lighter'; glow(g, qc.x, qc.y, R * qc.s * 1.4, HVFX2.shield, (.18 + .3 * flash) * a); }
  for (const [x, y] of cells) { const hex = []; for (let k = 0; k < 6; k++) { const an = k / 6 * TAU + Math.PI / 6; hex.push(P(x + Math.cos(an) * hs * .96, y + Math.sin(an) * hs * .96)); }
    const sp = hex.map(hvQ); if (sp.some(q => !q)) continue; const d = Math.hypot(x, y) / R, wave = .5 + .5 * Math.sin(t * 6 - d * 8 + x * 2), crk = o.crack && hash(x * 13 + y * 7) < o.crack;
    g.globalCompositeOperation = 'lighter'; g.beginPath(); sp.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath(); g.fillStyle = rgba(crk ? '#ffffff' : HVFX2.shield, (.08 + .1 * wave + .25 * flash) * a); g.fill();
    g.strokeStyle = rgba(d > .8 ? HVFX2.gold : '#bfe6ff', (.35 + .3 * wave + .4 * flash) * a); g.lineWidth = Math.max(1, .012 * (sp[0].s)); g.stroke(); }
  // gold rim
  const rim = []; for (let k = 0; k <= 48; k++) { const an = k / 48 * TAU; rim.push(hvQ(P(Math.cos(an) * R * .985, Math.sin(an) * R * .985))); } if (!rim.some(q => !q)) { g.globalCompositeOperation = 'lighter'; polyPath(g, rim.map(q => [q.x, q.y]), true); g.strokeStyle = rgba(HVFX2.gold, (.7 + .3 * flash) * a); g.lineWidth = Math.max(2.5, .03 * rim[0].s); g.stroke(); g.strokeStyle = rgba('#fff8e0', .8 * a); g.lineWidth = Math.max(1, .01 * rim[0].s); g.stroke(); }
  for (const h of (o.hits || [])) { const u = (t - h.t0) / .4; if (u < 0 || u > 1) continue; const q = hvQ(h.p); if (!q) continue; g.strokeStyle = rgba('#ffffff', 1 - u); g.lineWidth = 3; for (const rr of [1, 1.6]) { g.beginPath(); g.arc(q.x, q.y, (20 + 120 * u) * rr, 0, TAU); g.stroke(); } }
  g.restore();
}
// =========================================================================================================== PATRONUS (silver stag)
function hvStagPath(g, ph, rear) {   // local units: body length ~1, facing +x, y down; ph = gallop phase 0..1
  const legs = [[.3, .1, 0], [.22, .1, .5], [-.32, .08, .25], [-.4, .08, .75]], sw = a => Math.sin((ph + a) * TAU);
  g.beginPath(); g.ellipse(0, 0, .5, .2, rear ? -.25 : -.04 * sw(0), 0, TAU);                                         // body
  g.moveTo(.3, -.12); g.quadraticCurveTo(.48, -.42, .6, -.58); g.lineTo(.7, -.52); g.quadraticCurveTo(.56, -.3, .44, .02); g.closePath();   // neck
  g.moveTo(.56, -.66); g.quadraticCurveTo(.72, -.68, .9, -.56); g.quadraticCurveTo(.88, -.5, .78, -.5); g.quadraticCurveTo(.66, -.5, .58, -.55); g.closePath();   // head
  g.moveTo(.6, -.66); g.lineTo(.5, -.78); g.lineTo(.56, -.64); g.closePath();                                         // ear
  g.moveTo(-.48, -.08); g.quadraticCurveTo(-.6, -.18, -.58, -.02); g.closePath();                                     // tail
  for (const [x, y, a] of legs) { const front = x > 0, s = sw(a), th1 = (front ? .55 : -.45) * s + (rear && front ? -1.1 : 0), th2 = th1 + (front ? -.9 : .9) * Math.max(0, -s) * .8;
    const kx = x + Math.sin(th1) * .3, ky = y + Math.cos(th1) * .3, fx = kx + Math.sin(th2) * .3, fy = ky + Math.cos(th2) * .3; g.moveTo(x - .045, y); g.lineTo(kx - .03, ky); g.lineTo(fx - .015, fy); g.lineTo(fx + .025, fy + .01); g.lineTo(kx + .03, ky); g.lineTo(x + .05, y); g.closePath(); }
}
function hvAntlers(g) { const beam = (s) => { g.moveTo(.62, -.68); g.quadraticCurveTo(.56 + s * .02, -.95, .4 + s * .06, -1.18); for (const [u, l] of [[.35, .16], [.6, .2], [.85, .14]]) { const x = lerp(.62, .4 + s * .06, u), y = lerp(-.68, -1.18, u); g.moveTo(x, y); g.lineTo(x + .12 + s * .03, y - l); } }; beam(0); beam(1.2); }
function fxPatronus(g, p, dir, t, o = {}) {
  const q = hvQ(p); if (!q || t < 0) return; const a = (o.alpha == null ? 1 : o.alpha) * clamp(t / .35, 0, 1), S = (o.scale || 1.6) * q.s, qd = Array.isArray(p) ? hvQ(vAdd(p, vNorm(dir))) : { x: q.x + dir[0], y: q.y }, face = qd && qd.x < q.x ? -1 : 1, ph = (o.gallop == null ? t * 2.6 : o.gallop) % 1;
  const bob = Math.sin(ph * TAU) * .05;
  g.save();
  // mist trail behind
  if (o.trail !== false) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const s = hash(i * 3), x = q.x - face * S * (.4 + s * 1.6), y = q.y + (hash(i * 7) - .5) * S * .6 - S * .1, r = S * (.04 + .12 * hash(i * 5)) * (1 - s * .5); glow(g, x + Math.sin(t * 3 + i) * 6, y, r * 2.4, HVFX2.silver2, .22 * a * (1 - s)); } }
  g.translate(q.x, q.y + bob * S); g.scale(S * face, S);
  g.globalCompositeOperation = 'lighter'; g.shadowColor = '#bfe0ff'; g.shadowBlur = 40;
  hvStagPath(g, ph, o.rear); g.fillStyle = rgba('#dceaff', .55 * a); g.fill(); g.shadowBlur = 0;
  // inner light (brighter core along the spine)
  g.save(); hvStagPath(g, ph, o.rear); g.clip(); const gr = g.createLinearGradient(0, -.6, 0, .4); gr.addColorStop(0, rgba('#ffffff', .7 * a)); gr.addColorStop(1, rgba('#9fc4ff', .15 * a)); g.fillStyle = gr; g.fillRect(-1, -1.4, 2.2, 2);
  g.strokeStyle = rgba('#ffffff', .35 * a); g.lineWidth = .012; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-.6 + i * .16, -.3); g.quadraticCurveTo(-.5 + i * .16, 0, -.62 + i * .16, .5); g.stroke(); } g.restore();
  hvStagPath(g, ph, o.rear); g.strokeStyle = rgba('#ffffff', .95 * a); g.lineWidth = .016; g.stroke();
  g.beginPath(); hvAntlers(g); g.lineCap = 'round'; g.strokeStyle = rgba('#bfe0ff', .5 * a); g.lineWidth = .06; g.stroke(); g.strokeStyle = rgba('#ffffff', .95 * a); g.lineWidth = .024; g.stroke();
  g.beginPath(); g.arc(.76, -.6, .018, 0, TAU); g.fillStyle = rgba('#ffffff', a); g.fill();
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y - S * .2, S * 1.4, '#9fc8ff', .3 * a); g.restore();
}
function patronusPath(a, b, t, o = {}) { const L = vDist(a, b), u = clamp(t * (o.speed || 6) / Math.max(.01, L), 0, 1); const p = vLerp(a, b, u); return [p[0], p[1] + Math.abs(Math.sin(t * 2.6 * Math.PI)) * (o.hop || .25), p[2]]; }
// =========================================================================================================== ACCIO / INCENDIO / REPARO
function fxAccio(g, a, b, t, o = {}) {
  const dur = o.dur || .8; if (t < 0 || t > dur + .2) return; const qa = hvQ(a), qb = hvQ(b); if (!qa || !qb) return; const col = o.col || HVFX2.gold, fade = clamp((dur + .2 - t) / .2, 0, 1), grow = clamp(t / .12, 0, 1);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  const ex = lerp(qa.x, qb.x, grow), ey = lerp(qa.y, qb.y, grow); g.strokeStyle = rgba(col, .35 * fade); g.lineWidth = 8; g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = rgba('#fffbe8', .9 * fade); g.lineWidth = 2.5; g.stroke();
  const ang = Math.atan2(qa.y - qb.y, qa.x - qb.x); for (let k = 0; k < 6; k++) { const s = ((t * 2.2 + k / 6) % 1); const x = lerp(qb.x, qa.x, s), y = lerp(qb.y, qa.y, s), L = 16; g.strokeStyle = rgba(col, .9 * fade * Math.sin(s * Math.PI)); g.lineWidth = 3; g.beginPath(); g.moveTo(x - Math.cos(ang - .6) * L, y - Math.sin(ang - .6) * L); g.lineTo(x, y); g.lineTo(x - Math.cos(ang + .6) * L, y - Math.sin(ang + .6) * L); g.stroke(); }
  glow(g, qb.x, qb.y, 50, col, .5 * fade); g.restore();
}
function fxIncendio(g, a, dir, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0 || t > dur + .5) return; const len = o.len || 5, dn = vNorm(dir), fade = clamp((dur + .5 - t) / .5, 0, 1), fr = Math.floor(t * 24), n = 26;
  g.save();
  for (const [col, k, al] of [['#c8281a', 1.0, .9], ['#ff8a2a', .72, .95], ['#ffe08a', .42, 1]]) { for (let i = 0; i < n; i++) { const s = ((i / n) + t * 1.6) % 1; if (s > Math.min(1, t * 4)) continue; const p = vAdd(vMad(a, dn, s * len), [(hash(i * 3 + fr) - .5) * .25 * s, (hash(i * 5 + fr) - .5) * .2 * s + s * s * .4, 0]), q = hvQ(p); if (!q) continue;
    const r = (.08 + .5 * s) * q.s * k * (o.w || 1) * (1 - s * .3); g.fillStyle = rgba(col, al * fade * (1 - s * .5)); g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill(); } }
  const qa = hvQ(a); if (qa) { g.globalCompositeOperation = 'lighter'; glow(g, qa.x, qa.y, 90, '#ffb040', .6 * fade); }
  g.restore();
}
function fxReparo(g, c, t, o = {}) {
  const dur = o.dur || 1.0; if (t < 0 || t > dur + .4) return; const n = o.n || 18, R = o.r || 2.2, u = easeInOut(clamp(t / dur, 0, 1));
  g.save(); for (let i = 0; i < n; i++) { const an = hash(i * 7) * TAU, d = R * (.4 + hash(i * 3) * .6) * (1 - u), p = vAdd(c, [Math.cos(an) * d, (hash(i * 5) - .2) * d * .8, Math.sin(an) * d]), q = hvQ(p); if (!q) continue; const s = .1 * q.s;
    g.save(); g.translate(q.x, q.y); g.rotate((1 - u) * 6 * (hash(i) - .5)); g.fillStyle = '#8a7a6a'; g.strokeStyle = HVFX.ink; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-s, -s * .5); g.lineTo(s * .7, -s * .7); g.lineTo(s * .5, s * .6); g.lineTo(-s * .6, s * .4); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, s * 2, HVFX2.gold, .35 * (1 - u * .5)); g.globalCompositeOperation = 'source-over'; }
  if (u >= 1) { const q = hvQ(c); if (q) { const k = (t - dur) / .4; g.globalCompositeOperation = 'lighter'; fxImpactStar(g, q.x, q.y, 80 * (1 - k), 0, rgba('#fff4c8', 1 - k), 4); } } g.restore();
}
// =========================================================================================================== APPARITION
function apparateFig(t, dur = .45, out = true) { const u = clamp(t / dur, 0, 1), k = out ? u : 1 - u; return { alpha: clamp(1 - k * 1.1, 0, 1), sq: 1 + k * .5 }; }
function fxApparate(g, p, t, o = {}) {
  const dur = o.dur || .6; if (t < 0 || t > dur + .5) return; const q = hvQ(p); if (!q) return; const out = o.out !== false, u = clamp(t / dur, 0, 1), k = out ? u : 1 - u, H2 = (o.h || 2.0) * q.s, R = (o.r || .55) * q.s, fr = Math.floor(t * 24);
  g.save();
  // twisting smoke ribbons narrowing to a point
  for (let i = 0; i < 9; i++) { const pts = []; for (let j = 0; j <= 14; j++) { const s = j / 14, rr = R * (1 - k * .9) * (1 - s * .3) * (out ? 1 : 1), an = s * 6 + i / 9 * TAU + t * 14 * (out ? 1 : -1); pts.push([q.x + Math.cos(an) * rr, q.y - s * H2 + Math.sin(an) * rr * .25]); }
    polyPath(g, pts, false); g.strokeStyle = rgba(i % 3 ? '#1a1620' : '#3a3442', .75 * (1 - Math.abs(k - .5) * .8)); g.lineWidth = Math.max(4, R * .22 * (1 - k * .6)); g.lineCap = 'round'; g.stroke(); }
  if (t > dur * .85 && t < dur + .3) { const c = (t - dur * .85) / .45; g.strokeStyle = rgba('#ffffff', .9 * (1 - c)); g.lineWidth = 4; g.beginPath(); g.ellipse(q.x, q.y - H2 * .45, R * (.3 + c * 2.4), R * (.15 + c * .7), 0, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + fr; g.beginPath(); g.moveTo(q.x + Math.cos(an) * R * .3, q.y - H2 * .45 + Math.sin(an) * R * .2); g.lineTo(q.x + Math.cos(an) * R * (1 + c * 2), q.y - H2 * .45 + Math.sin(an) * R * (.5 + c)); g.stroke(); } }
  g.restore(); if (t > dur * .7) fxSmoke(g, p, t - dur * .7, { n: 8, size: 1.0, col: '#4a4452', dur: 1.2, seed: 9 });
}
// =========================================================================================================== INVISIBILITY CLOAK
function fxInvisCloak(g, F, ft, k, o = {}) {
  if (k <= .02) return; const col = o.col || '#dfeaff', w = Math.max(2, 3.5 * k), lay = getLayer('hvcloak', g.canvas.width, g.canvas.height), lg = lay.getContext('2d');
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, lay.width, lay.height); lg.setTransform(g.getTransform());
  for (const [dx, dy, a] of [[-w, 0, .5], [w, w * .5, .4], [0, -w, .35]]) { lg.save(); lg.translate(dx + Math.sin(ft * 9) * w * .6, dy); drawFig(lg, F, ft, { mode: 'flat', col, alpha: a * k, _noPost: true }); lg.restore(); }
  lg.save(); lg.globalCompositeOperation = 'destination-out'; drawFig(lg, F, ft, { mode: 'flat', col: '#000', alpha: .8, _noPost: true }); lg.restore();   // keep only the refracting rim
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.drawImage(lay, 0, 0); g.restore();
}
function fxCloakThrow(g, F, ft, t, o = {}) {
  const dur = o.dur || .6; if (t < 0 || t > dur + .1) return; const S = figSkel(F, ft), u = easeInOut(clamp(t / dur, 0, 1)), top = vAdd(S.J.head, [0, .5 - u * .3, 0]), bot = vLerp(top, vAdd(S.J.pelvis, [0, -.95, 0]), u), hw = .55;
  const side = vNorm(vCross(vSub(CAM.cur.target, CAM.cur.pos), [0, 1, 0])), N = 12, L = [], R = [];
  for (let i = 0; i <= N; i++) { const s = i / N, c = vLerp(top, bot, s), wv = Math.sin(s * 5 - t * 14) * .08; L.push(hvQ(vAdd(vMad(c, side, -hw * (.6 + .4 * s)), [0, 0, wv]))); R.push(hvQ(vAdd(vMad(c, side, hw * (.6 + .4 * s)), [0, 0, -wv]))); }
  if (L.some(q => !q) || R.some(q => !q)) return; const poly = L.map(q => [q.x, q.y]).concat(R.reverse().map(q => [q.x, q.y]));
  g.save(); polyPath(g, poly, true); const gr = g.createLinearGradient(poly[0][0], poly[0][1], poly[N][0], poly[N][1]); gr.addColorStop(0, 'rgba(230,240,255,.55)'); gr.addColorStop(.5, 'rgba(170,190,230,.35)'); gr.addColorStop(1, 'rgba(240,248,255,.5)'); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.stroke(); g.globalCompositeOperation = 'lighter'; for (let i = 1; i < 5; i++) { const a = poly[Math.floor(i / 5 * N)], b = poly[poly.length - 1 - Math.floor(i / 5 * N)]; g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } g.restore();
}
// =========================================================================================================== RESURRECTION STONE GHOSTS
function fxGhosts(g, c, t, o = {}) {
  if (t < 0) return; const n = o.n || 3, R = o.r || 1.6, a = (o.alpha == null ? 1 : o.alpha) * clamp(t / .8, 0, 1), col = o.col || '#cfe4ff';
  for (let i = 0; i < n; i++) { const an = i / n * TAU + t * .25 + (o.az || 0), p = vAdd(c, [Math.sin(an) * R, .05 * Math.sin(t * 1.3 + i), Math.cos(an) * R]), q = hvQ(p), qh = hvQ(vAdd(p, [0, (o.h || 1.75), 0])); if (!q || !qh) continue;
    const Hh = q.y - qh.y, x = q.x, top = qh.y, w = Hh * .2; g.save(); g.globalCompositeOperation = 'lighter';
    glow(g, x, top + Hh * .4, Hh * .6, col, .18 * a);
    g.beginPath(); g.arc(x, top + Hh * .07, Hh * .065, 0, TAU); g.moveTo(x - w * .7, top + Hh * .17); g.quadraticCurveTo(x - w * 1.2, top + Hh * .5, x - w * .8 + Math.sin(t * 2 + i) * w * .3, top + Hh); g.lineTo(x + w * .8 + Math.sin(t * 2.3 + i) * w * .3, top + Hh); g.quadraticCurveTo(x + w * 1.2, top + Hh * .5, x + w * .7, top + Hh * .17); g.closePath();
    const gr = g.createLinearGradient(0, top, 0, top + Hh); gr.addColorStop(0, rgba(col, .45 * a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fill(); g.strokeStyle = rgba('#ffffff', .4 * a); g.lineWidth = 1.5; g.stroke(); g.restore(); }
}
// =========================================================================================================== WAND helpers
function fxWandTrail(g, F, t, o = {}) {
  const span = o.span || .35, n = o.n || 14, pts = []; for (let i = 0; i <= n; i++) { const q = hvQ(hvWandTip(F, t - span * (1 - i / n))); if (q) pts.push([q.x, q.y]); } if (pts.length < 3) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round'; for (let i = 1; i < pts.length; i++) { const s = i / pts.length; g.strokeStyle = rgba(o.col || HVFX2.gold, .9 * s); g.lineWidth = (o.w || 5) * s; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
  const e = pts[pts.length - 1]; glow(g, e[0], e[1], 30, o.col || HVFX2.gold, .6); g.restore();
}
function fxWandSparks(g, F, t, o = {}) { fxSparks(g, hvWandTip(F, t), (t % (o.dur || .3)), { n: o.n || 12, dur: o.dur || .3, col: o.col || HVFX2.gold2, seed: Math.floor(t / (o.dur || .3)) * 7 }); }
function fxLumos(g, F, t, o = {}) { const q = hvQ(hvWandTip(F, t)); if (!q) return; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, (o.r || 1) * .6 * q.s, o.col || '#eaf4ff', .7); glow(g, q.x, q.y, .08 * q.s, '#ffffff', 1); fxImpactStar(g, q.x, q.y, .25 * q.s, t, 'rgba(255,255,255,.8)', 4); g.restore(); }
function fxSerpent(g, a, b, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0 || t > dur + .3) return; const u = clamp(t / dur, 0, 1), fade = clamp((dur + .3 - t) / .3, 0, 1), n = 24, pts = [];
  for (let i = 0; i <= n; i++) { const s = u - i / n * .35; if (s < 0) break; const p = vLerp(a, b, s), q = hvQ(p); if (!q) continue; const side = Math.sin(s * 30 - t * 10) * .18 * q.s * (o.size || 1); pts.push([q.x, q.y + side * .4 + 0, q.s]); }
  if (pts.length < 3) return; g.save(); g.lineCap = 'round'; for (let i = 1; i < pts.length; i++) { const w = (o.size || 1) * .12 * pts[i][2] * Math.sin((1 - i / pts.length) * Math.PI * .9 + .1); g.strokeStyle = rgba(o.col || '#0e1a12', .85 * fade); g.lineWidth = Math.max(2, w); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
  const h = pts[0]; g.fillStyle = rgba('#3aff7a', fade); g.beginPath(); g.arc(h[0] + 4, h[1] - 3, 2.5, 0, TAU); g.fill(); g.restore();
}
function fxSpellRunes(g, c, t, o = {}) {
  const q = hvQ(c); if (!q || t < 0) return; const R = (o.r || 1.2) * q.s * easeOut(clamp(t / .3, 0, 1)), a = clamp(t / .2, 0, 1), col = o.col || HVFX2.gold;
  g.save(); g.translate(q.x, q.y); g.scale(1, o.flat == null ? .45 : o.flat); g.rotate(t * .8); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(col, .85 * a); g.lineWidth = 3;
  for (const rr of [1, .82, .5]) { g.beginPath(); g.arc(0, 0, R * rr, 0, TAU); g.stroke(); }
  g.font = `700 ${Math.max(10, R * .12)}px serif`; g.fillStyle = rgba(col, .9 * a); const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'; for (let i = 0; i < 24; i++) { const an = i / 24 * TAU; g.save(); g.rotate(an); g.fillText(runes[i], -R * .05, -R * .88); g.restore(); }
  for (let i = 0; i < 3; i++) { const an = i / 3 * TAU; g.beginPath(); g.moveTo(Math.cos(an) * R * .82, Math.sin(an) * R * .82); g.lineTo(Math.cos(an + TAU / 3) * R * .82, Math.sin(an + TAU / 3) * R * .82); g.stroke(); }
  g.restore();
}

// =========================================================================================================== URAHARA announcer: microphone pose field + poses
function drawMicProp(c, S, hg, opt) {
  const k = S.B.h / 1.8, up = vNorm(vMul(hg.Y, -1)), a = vMad(hg.palmC, up, -.05 * k), b = vMad(hg.palmC, up, .12 * k), head = vMad(b, up, .03 * k), qa = project(a), qb = project(b), qh = project(head); if (!qa || !qb || !qh) return;
  const lw = Math.max(1, lineW(qb.s, .7)); c.lineCap = 'round'; c.strokeStyle = LIGHT.ink; c.lineWidth = .03 * k * qb.s + lw * 2; c.beginPath(); c.moveTo(qa.x, qa.y); c.lineTo(qb.x, qb.y); c.stroke();
  if (opt.mode === 'flat') return; c.strokeStyle = LIGHT.override ? LIGHT.override.fill : '#22202a'; c.lineWidth = .03 * k * qb.s; c.stroke();
  const R = .03 * k * qh.s; c.fillStyle = LIGHT.override ? LIGHT.override.fill : '#b8bcc8'; c.beginPath(); c.arc(qh.x, qh.y, R, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = lw; c.stroke();
  if (!LIGHT.override && R > 3) { c.strokeStyle = 'rgba(60,60,80,.6)'; c.lineWidth = Math.max(.6, R * .08); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(qh.x - R * .9, qh.y + i * R * .35); c.lineTo(qh.x + R * .9, qh.y + i * R * .35); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(qh.x - R * .35, qh.y - R * .35, R * .25, 0, TAU); c.fill(); }
}
(function () {
  const U = CAST.urahara; if (!U) return;
  const wrap = ex => (S, D, F, t, parts, opt) => { if (ex) ex(S, D, F, t, parts, opt); const p = S.pose; if (p.mic) { const sd = p.micHand || 'R', hg = handGeom(S, sd, p['h' + sd] || 'grip'); if (hg) parts.push({ z: camDepth(hg.palmC) - .02, fn: c => drawMicProp(c, S, hg, opt) }); } };
  U.extras = wrap(U.extras); for (const fm in (U.forms || {})) if (U.forms[fm].extras) U.forms[fm].extras = wrap(U.forms[fm].extras);
  for (const k in U) if (k.startsWith('_m_')) delete U[k];
})();
Object.assign(POSES, {
  urahara_announce: { sp: -.04, hp: .02, hr: .06, aR: [1.05, -.5, .2], eR: 2.3, hR: 'grip', wR: [.2, 0], mic: 1, aL: [.25, .4, 0], eL: .4, hL: 'grip', fan: 0, sword: { sheathed: true }, face: { eye: .55, mouth: 'open', mouthOpen: .5 } },
  urahara_announceFan: { sp: -.06, hp: -.04, hr: .08, aR: [1.05, -.5, .2], eR: 2.3, hR: 'grip', wR: [.2, 0], mic: 1, aL: [1.35, .9, -.2], eL: .5, hL: 'grip', fan: 1, fanHand: 'L', sword: { sheathed: true }, face: { eye: .5, mouth: 'grin', mouthOpen: .4 } },
  urahara_shout: { sp: .12, hp: -.15, aR: [1.2, -.4, .2], eR: 2.1, hR: 'grip', mic: 1, aL: [2.4, .6, 0], eL: .4, hL: 'fist', lL: [.25, .14, .2], kL: .3, lR: [-.15, .12, -.2], sword: { sheathed: true }, face: { eye: 1.05, lid: .2, mouth: 'shout', mouthOpen: 1 } },
});
function fxMicWaves(g, p, t, o = {}) { const q = hvQ(p); if (!q || t < 0) return; const n = o.n || 4, col = o.col || '#ffe08a', dirA = o.dir == null ? 0 : o.dir; g.save(); g.lineCap = 'round';
  for (let k = 0; k < n; k++) { const u = ((t * 1.6 + k / n) % 1), R = 30 + u * 220; g.strokeStyle = rgba(col, .85 * (1 - u)); g.lineWidth = 6 * (1 - u) + 1.5; g.beginPath(); g.arc(q.x, q.y, R, dirA - .7, dirA + .7); g.stroke(); } g.restore(); }
function drawMegaphone(g, p, o = {}) { const q = hvQ(p); if (!q) return; const s = (o.size || .5) * q.s, f = o.flip ? -1 : 1; g.save(); g.translate(q.x, q.y); g.scale(f, 1); g.rotate(o.rot || -.2);
  g.fillStyle = '#e8e2d4'; g.strokeStyle = HVFX.ink; g.lineWidth = Math.max(2, s * .04); g.beginPath(); g.moveTo(0, -s * .12); g.lineTo(s, -s * .38); g.lineTo(s, s * .38); g.lineTo(0, s * .12); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#c82a2a'; g.fillRect(s * .55, -s * .3, s * .08, s * .6); g.fillStyle = '#2a2830'; g.fillRect(-s * .25, -s * .1, s * .26, s * .2); g.strokeRect(-s * .25, -s * .1, s * .26, s * .2); g.restore(); }
