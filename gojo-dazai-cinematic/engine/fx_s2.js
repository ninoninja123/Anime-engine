/* engine/fx_s2.js (agent S2, harry-vs-gojo) - helper effects + props for showdown/part2.js and the masked shots of part1.js.
   !!! SPOILER WARNING: used by the masked shots (pre/spoilers.md). Do not read if you want to be surprised by the video. !!!
   (Replaces the old gowther-dazai-urahara helper file of the same name; nothing else in this project referenced it.)
   t = effect time; positions world [x,y,z] or screen {x,y}.
   PROPS / FX (call inside f.fx)
     s2Cameo(g, kind, p, t, o)        dark crowd silhouette with rim light + glowing eyes at world foot point p ('dumbledore'|'sirius'|'dog'|'geto'|'nanami'),
                                      o: {h (m), act 'cheer'|'toast'|'jump'|'clap'|'watch'|'wave'|'still', rim, eyes, lit 0..1 (more readable), flip}
     s2RingFire(g, t, o)              gold fire running along the rune ring (o.k 0..1 progress, o.a0 start angle, o.R, o.red 0..1)
     s2Chain(g, p, t, o)              light chains coiling round a wrist point (o.k wrap 0..1, o.red 0..1 flash, o.fade 0..1, o.r m)
     s2Ember(g, p, t, o)              glowing ember flake (o.r m)
     s2InfoStreams(g, c, t, o)        Unlimited Void information streams converging on c (o.k density, o.pass true = they pass straight through)
     s2HoleFig(g, F, ft, o)           a figure as an empty grey outline with nothing inside (Six Eyes POV), draw layer 'top'
     s2Blindfold(g, a, b, u, t, o)    black blindfold cloth flying from a to b (u 0..1)
     s2VoidShards(g, t, o)            black-glass star shards falling after the domain breaks (screen)
     s2SnitchOpen(g, p, r, open, t, o) Snitch opening on a palm: halves part, engraved line glows, a black stone drops (o.stone 0..1)
     s2Cup(g, p, t, o)                Triwizard cup with blue glow (o.glow, o.size m)
     s2Barrier(g, c, t, o)            black curtain barrier with ripples (o.hole = world point of the ripple, o.w, o.h)
     s2CloakCorner(g, p, t, o)        invisible cloth corner (refracting ripple) hovering over p
     s2Vortex(g, c, t, o)             blue-gold portkey vortex (o.k, o.r)
     s2Motes(g, p, t, o)              small gold motes (levitation) around p
     s2LightSpiral(g, from[], to, t, o) silver light streams spiralling from points into a wand tip
     s2Hallows(g, p, size, k)         Deathly Hallows sign in the world (gold glow)
     s2RedDot(g, p, k, t)             Gojo's charging red point (fingertip)
     s2Dust(g, c, t, o)               dust cloud puffs
   SCREEN PROCESSES (call in a shot, NOT inside f.fx)
     s2SixPOV(f, t, o)                Six Eyes POV: the frame becomes blue energy lines (o.k)
     s2Memory(f, kind, o)             memory grade: kind 'H' sepia + gold, 'G' blue-grey; scratches + vignette (o.k, o.t)
     s2Black(f, k)                    fade to black (k 0..1)                                                                                 */
'use strict';
const S2FX = { gold: '#ffd36a', gold2: '#fff4c8', silver: '#e6f0ff', cyan: '#5fd3ff', red: '#ff2a2a' };
function s2Q(p) { if (!p) return null; if (Array.isArray(p)) { const q = project(p); return q ? { x: q.x, y: q.y, s: q.s } : null; } return { x: p.x, y: p.y, s: p.s || 100 }; }
// ---------------------------------------------------------------------------------------------------------------- cameo silhouettes
function s2Cameo(g, kind, p, t, o = {}) {
  const q = s2Q(p), qh = s2Q(Array.isArray(p) ? vAdd(p, [0, o.h || 1.8, 0]) : null); if (!q) return; const Hh = qh ? q.y - qh.y : (o.hpx || 120); if (Hh < 6) return;
  const col = o.col || '#120c18', rim = o.rim || '#ffb060', act = o.act || 'still', lit = o.lit || 0, fr = Math.floor(t * 12), bob = act === 'jump' ? Math.abs(Math.sin(t * 7)) * .12 : act === 'cheer' ? Math.abs(Math.sin(t * 5)) * .03 : 0;
  g.save(); g.translate(q.x, q.y - bob * Hh); g.scale((o.flip ? -1 : 1) * Hh, Hh); g.lineJoin = 'round'; g.lineCap = 'round';
  const P = new Path2D(), hx = 0, hy = -.9;   // head centre (units: height 1, feet y 0, up -y)
  const arm = (side, ang, len = .36) => { const sx = side * .12, sy = -.74; const ex = sx + Math.sin(ang) * len * side, ey = sy - Math.cos(ang) * len; return [sx, sy, ex, ey]; };
  let arms = [[-1, .25], [1, .25]], prop = null, extra = null;
  if (kind === 'dumbledore') { // tall pointed hat, long beard, robe flaring
    P.moveTo(-.04, -1.02); P.lineTo(.02, -1.32); P.lineTo(.13, -1.0); P.lineTo(.19, -.98); P.lineTo(-.17, -.98); P.closePath();             // hat
    P.ellipse(hx, hy, .075, .085, 0, 0, TAU); P.moveTo(-.07, -.86); P.quadraticCurveTo(0, -.5, .07, -.86); P.closePath();                       // head + beard
    P.moveTo(-.14, -.78); P.lineTo(.14, -.78); P.lineTo(.25, 0); P.lineTo(-.25, 0); P.closePath();
    arms = act === 'toast' ? [[-1, .3], [1, 2.6 + Math.sin(t * 3) * .05]] : [[-1, .3], [1, .5]]; if (act === 'toast') prop = 'goblet'; extra = 'halfmoon';
  } else if (kind === 'sirius') { // long hair, open coat, lean
    P.ellipse(hx, hy, .075, .085, 0, 0, TAU); P.moveTo(-.085, -.95); P.quadraticCurveTo(-.12, -.8, -.09, -.72); P.lineTo(.09, -.72); P.quadraticCurveTo(.12, -.8, .085, -.95); P.closePath();
    P.moveTo(-.15, -.78); P.lineTo(.15, -.78); P.lineTo(.13, -.36); P.lineTo(.2, -.05); P.lineTo(.05, -.36); P.lineTo(.07, 0); P.lineTo(-.07, 0); P.lineTo(-.05, -.36); P.lineTo(-.2, -.05); P.lineTo(-.13, -.36); P.closePath();
    arms = act === 'jump' || act === 'cheer' ? [[-1, 2.7 + Math.sin(t * 7) * .2], [1, 2.6 + Math.sin(t * 7 + 1) * .2]] : [[-1, .3], [1, .3]];
  } else if (kind === 'dog') { // big black dog (Padfoot), sits / jumps
    g.restore(); g.save(); const s = Hh * .55; g.translate(q.x, q.y - (act === 'jump' ? Math.abs(Math.sin(t * 7 + .6)) * .25 * Hh : 0)); g.scale(o.flip ? -s : s, s);
    const D = new Path2D(); D.ellipse(0, -.55, .5, .22, 0, 0, TAU); D.ellipse(.48, -.82, .16, .14, -.3, 0, TAU); D.moveTo(.56, -.9); D.lineTo(.8, -.82); D.lineTo(.6, -.74); D.closePath(); D.moveTo(.4, -.96); D.lineTo(.44, -1.1); D.lineTo(.5, -.95); D.closePath();
    for (const lx of [-.35, -.2, .2, .35]) D.rect(lx - .04, -.5, .08, .5); D.moveTo(-.48, -.6); D.quadraticCurveTo(-.8, -.9 + Math.sin(t * 14) * .15, -.75, -1.0); D.lineTo(-.7, -.95); D.quadraticCurveTo(-.7, -.8, -.45, -.5); D.closePath();
    g.save(); g.translate(-2 / s, -2 / s); g.fillStyle = rgba(rim, .7); g.fill(D); g.restore(); g.fillStyle = col; g.fill(D); g.globalCompositeOperation = 'lighter'; glow(g, .56, -.84, .05, o.eyes || '#ffcf5a', .9); g.restore(); return;
  } else if (kind === 'geto') { // half-up bun, long bangs, wide monk robe (kesa band)
    P.ellipse(hx, hy, .072, .082, 0, 0, TAU); P.ellipse(0, -.99, .05, .04, 0, 0, TAU); P.moveTo(-.08, -.95); P.quadraticCurveTo(-.11, -.8, -.08, -.74); P.lineTo(-.05, -.86); P.closePath();
    P.moveTo(-.16, -.78); P.lineTo(.16, -.78); P.lineTo(.3, 0); P.lineTo(-.3, 0); P.closePath();
    arms = act === 'wave' ? [[-1, .3], [1, 2.5]] : [[-1, .45], [1, .45]]; extra = 'kesa';
  } else if (kind === 'nanami') { // neat parted hair, glasses, suit + tie, arms crossed
    P.ellipse(hx, hy, .07, .08, 0, 0, TAU); P.moveTo(-.075, -.92); P.quadraticCurveTo(0, -1.02, .08, -.94); P.lineTo(.08, -.9); P.closePath();
    P.moveTo(-.15, -.78); P.lineTo(.15, -.78); P.lineTo(.12, -.4); P.lineTo(.08, 0); P.lineTo(-.08, 0); P.lineTo(-.12, -.4); P.closePath();
    arms = act === 'clap' ? [[-1, 1.3 + (fr % 3 === 0 ? .25 : 0)], [1, 1.3 + (fr % 3 === 0 ? .25 : 0)]] : act === 'watch' ? [[-1, 1.5], [1, 1.2]] : [[-1, 1.2], [1, 1.2]]; extra = act === 'still' || act === 'cross' ? 'cross' : 'glasses';
  } else { P.ellipse(hx, hy, .075, .085, 0, 0, TAU); P.rect(-.15, -.78, .3, .78); }
  // same look as the crowd: a rim-coloured copy offset up-left, then the body; arms as thick limbs
  const AP = new Path2D(); if (extra !== 'cross') for (const [sd, ang] of arms) { const a = arm(sd, ang), nx = -(a[3] - a[1]), ny = a[2] - a[0], nl = Math.hypot(nx, ny) || 1, w = .045; AP.moveTo(a[0] + nx / nl * w, a[1] + ny / nl * w); AP.lineTo(a[2] + nx / nl * w * .8, a[3] + ny / nl * w * .8); AP.lineTo(a[2] - nx / nl * w * .8, a[3] - ny / nl * w * .8); AP.lineTo(a[0] - nx / nl * w, a[1] - ny / nl * w); AP.closePath(); AP.ellipse(a[2], a[3], w * 1.1, w * 1.1, 0, 0, TAU); }
  else { AP.rect(-.15, -.7, .3, .1); }
  const off = (1.6 + lit * 1.2) / Hh; g.save(); g.translate(-off, -off); g.fillStyle = rgba(rim, .55 + .3 * lit); g.fill(P); g.fill(AP); g.restore(); g.fillStyle = col; g.fill(P); g.fill(AP);
  if (prop === 'goblet') { const a = arm(1, arms[1][1]); g.fillStyle = '#d8a830'; g.beginPath(); g.moveTo(a[2] - .03, a[3] - .07); g.lineTo(a[2] + .03, a[3] - .07); g.lineTo(a[2] + .01, a[3] - .02); g.lineTo(a[2] - .01, a[3] - .02); g.closePath(); g.fill(); g.globalCompositeOperation = 'lighter'; glow(g, a[2], a[3] - .05, .06, '#ffd36a', .7); g.globalCompositeOperation = 'source-over'; }
  if (extra === 'kesa') { g.strokeStyle = rgba('#8a6a40', .6 + .3 * lit); g.lineWidth = .035; g.beginPath(); g.moveTo(-.12, -.76); g.lineTo(.18, -.3); g.stroke(); }
  // glowing eyes / glasses glints
  g.globalCompositeOperation = 'lighter'; const ec = o.eyes || '#ffcf5a';
  if (extra === 'halfmoon' || extra === 'glasses' || kind === 'nanami') { for (const sx of [-.03, .03]) { g.fillStyle = rgba('#ffffff', .7 + .3 * lit); g.beginPath(); g.ellipse(sx, hy + .005, .022, extra === 'halfmoon' ? .01 : .016, 0, 0, TAU); g.fill(); } glow(g, 0, hy, .06, '#fff4c8', .35); }
  else { for (const sx of [-.028, .028]) glow(g, sx, hy, .022, ec, .95); }
  g.restore();
}
// ---------------------------------------------------------------------------------------------------------------- rune ring fire, chains, ember
function s2RingFire(g, t, o = {}) {
  const R = o.R || 24.1, k = clamp(o.k == null ? 1 : o.k, 0, 1), a0 = o.a0 || 0, dir = o.dir || 1, n = 240, red = o.red || 0, col = mixHex(S2FX.gold, S2FX.red, red);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; if (u > k) break; const a = a0 + dir * u * TAU, q = project([Math.cos(a) * R, .03, Math.sin(a) * R]); pts.push(q && q.z > .5 ? q : null); }
  // the burning line (soft wide glow + bright core), drawn in runs
  let run = []; const flush = () => { if (run.length > 1) { const L = run.map(q => [q.x, q.y]); polyPath(g, L, false); g.strokeStyle = rgba(col, .25); g.lineWidth = clamp(run[0].s * .5, 6, 34); g.stroke(); g.strokeStyle = rgba('#fff2c8', .85); g.lineWidth = clamp(run[0].s * .08, 2, 6); g.stroke(); } run = []; };
  for (const q of pts) { if (q) run.push(q); else flush(); } flush();
  // flickering flame tongues (thin, curved), taller near the running head
  for (let i = 0; i < pts.length; i += 2) { const q = pts[i]; if (!q) continue; const u = i / n, head = clamp(1 - (k - u) * 8, 0, 1), fl = hash(i * 3 + Math.floor(t * 16)), hpx = Math.min(140, (.12 + .25 * fl + head * .9) * q.s);
    g.strokeStyle = rgba(fl > .5 ? col : '#ffb040', .35 + .4 * head); g.lineWidth = clamp(q.s * .035, 1.2, 5); g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo(q.x + (fl - .5) * q.s * .3, q.y - hpx * .6, q.x + (hash(i) - .5) * q.s * .2, q.y - hpx); g.stroke();
    if (head > .6) glow(g, q.x, q.y - hpx * .3, hpx * 1.4, col, .3 * head); }
  g.restore();
}
function s2Chain(g, p, t, o = {}) {
  const q = s2Q(p); if (!q) return; const k = clamp(o.k == null ? 1 : o.k, 0, 1), fade = 1 - clamp(o.fade || 0, 0, 1); if (k <= 0 || fade <= 0) return; const R = (o.r || .07) * q.s, col = mixHex(S2FX.gold, S2FX.red, clamp(o.red || 0, 0, 1)), L = o.len || 4;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  // spiral of links: comes in from far (o.from direction) and coils
  const turns = 3, N = 40;
  for (let i = 0; i < N; i++) { const u = i / N; if (u > k) break; const an = u * turns * TAU + t * 2, rr = R * (1 + (1 - u) * L * (1 - k) * 2), x = q.x + Math.cos(an) * rr, y = q.y + Math.sin(an) * rr * .45 + (u - .5) * R * 1.4;
    const lw = Math.max(1.5, R * .18); g.strokeStyle = rgba(col, .85 * fade); g.lineWidth = lw; g.beginPath(); g.ellipse(x, y, Math.max(2, R * .28), Math.max(1.5, R * .16), an, 0, TAU); g.stroke(); }
  glow(g, q.x, q.y, R * 3, col, .35 * fade * k); g.restore();
}
function s2Ember(g, p, t, o = {}) { const q = s2Q(p); if (!q) return; const r = Math.max(2, (o.r || .02) * q.s), fl = .7 + .3 * Math.sin(t * 23) * Math.sin(t * 7); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, r * 7, '#ff8a2a', .45 * fl); glow(g, q.x, q.y, r * 2.2, '#ffd36a', .9 * fl); g.fillStyle = '#fff2c8'; g.beginPath(); g.ellipse(q.x, q.y, r, r * .7, t * 2, 0, TAU); g.fill(); g.restore(); }
// ---------------------------------------------------------------------------------------------------------------- Unlimited Void streams
function s2InfoStreams(g, c, t, o = {}) {
  const q = s2Q(c); if (!q) return; const n = o.n || 70, k = o.k == null ? 1 : o.k, pass = !!o.pass, fr = Math.floor(t * 24);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.font = '700 26px "IPAGothic", monospace';
  for (let i = 0; i < n; i++) { if (hash(i * 5.1) > k) continue; const a = hash(i * 1.7) * TAU, sp = .9 + hash(i * 3.3) * .9, ph = (t * sp + hash(i * 9.1)) % 1, D = 1500;
    const d0 = pass ? lerp(D, -D, ph) : D * (1 - ph), d1 = d0 + 260 * sp, x0 = q.x + Math.cos(a) * d0, y0 = q.y + Math.sin(a) * d0 * .7, x1 = q.x + Math.cos(a) * d1, y1 = q.y + Math.sin(a) * d1 * .7;
    const w = 2 + hash(i * 2.2) * 5; g.strokeStyle = rgba(i % 5 ? '#ffffff' : '#9fe0ff', .55); g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    if (i % 4 === 0) { g.fillStyle = rgba('#e8f8ff', .7); g.fillText(HVG_GLYPHS[Math.floor(hash(i * 7 + fr) * HVG_GLYPHS.length)], x0, y0); } }
  g.restore();
}
function s2HoleFig(g, F, ft, o = {}) {
  const lay = getLayer('s2hole', g.canvas.width, g.canvas.height), lg = lay.getContext('2d'), w = o.w || 4;
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, lay.width, lay.height); lg.setTransform(g.getTransform());
  for (const [dx, dy] of [[-w, 0], [w, 0], [0, -w], [0, w]]) { lg.save(); lg.translate(dx, dy); drawFig(lg, F, ft, { mode: 'flat', col: o.rim || '#a8b0bc', _noPost: true }); lg.restore(); }
  lg.save(); lg.globalCompositeOperation = 'destination-out'; drawFig(lg, F, ft, { mode: 'flat', col: '#000', _noPost: true }); lg.restore();
  lg.save(); lg.globalCompositeOperation = 'destination-over'; drawFig(lg, F, ft, { mode: 'flat', col: o.fill || '#05060a', alpha: o.fillA == null ? .92 : o.fillA, _noPost: true }); lg.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lay, 0, 0); g.restore();
}
// ---------------------------------------------------------------------------------------------------------------- props
function s2Blindfold(g, a, b, u, t, o = {}) {
  const qa = s2Q(a), qb = s2Q(b); if (!qa || !qb) return; const e = easeInOut(clamp(u, 0, 1)), x = lerp(qa.x, qb.x, e), y = lerp(qa.y, qb.y, e) - Math.sin(e * Math.PI) * 60, s = lerp(qa.s, qb.s, e) * (o.size || 1);
  const L = .55 * s, ang = Math.atan2(qb.y - qa.y, qb.x - qa.x), pts = [], N = 12; for (let i = 0; i <= N; i++) { const v = i / N; pts.push([x - Math.cos(ang) * L * v + Math.sin(v * 7 - t * 30) * .04 * s, y - Math.sin(ang) * L * v + Math.cos(v * 6 - t * 26) * .05 * s]); }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; polyPath(g, pts, false); g.strokeStyle = '#05060a'; g.lineWidth = Math.max(5, .085 * s); g.stroke(); g.strokeStyle = '#1e2030'; g.lineWidth = Math.max(3, .055 * s); g.stroke();
  g.strokeStyle = 'rgba(160,170,200,.5)'; g.lineWidth = 1.5; g.stroke(); g.restore();
}
function s2VoidShards(g, t, o = {}) {
  if (t < 0) return; const n = o.n || 46, r = rng(o.seed || 5), sf = typeof hvgStarField === 'function' ? hvgStarField(W, H, 3) : null;
  g.save();
  for (let i = 0; i < n; i++) { const x0 = r() * W, y0 = r() * H, sz = 60 + r() * 220, vy = 300 + r() * 900, vx = (r() - .5) * 400, rot = (r() - .5) * 3, x = x0 + vx * t, y = y0 + vy * t * t * 1.3 + vy * t * .2;
    if (y - sz > H) continue; const a = clamp(1.2 - t * .8, 0, 1); if (a <= 0) continue; const m = 3 + Math.floor(r() * 3), pts = []; for (let j = 0; j < m; j++) { const an = j / m * TAU + r() * .8; pts.push([Math.cos(an) * sz * (.5 + r() * .5), Math.sin(an) * sz * (.5 + r() * .5)]); }
    g.save(); g.translate(x, y); g.rotate(rot * t); g.globalAlpha = a; polyPath(g, pts, true); g.save(); g.clip(); if (sf) g.drawImage(sf, -x0 * .3, -y0 * .3, W * .7, H * .7); else { g.fillStyle = '#050818'; g.fill(); } g.restore();
    g.strokeStyle = rgba('#e8f8ff', .9); g.lineWidth = 3; g.stroke(); g.restore(); }
  g.restore();
}
function s2SnitchOpen(g, p, r, open, t, o = {}) {
  const q = s2Q(p); if (!q) return; const R = r * q.s, op = clamp(open, 0, 1), fl = Math.sin(t * 50) * .4 * (1 - op * .7);
  g.save(); g.translate(q.x, q.y);
  if (op < .99) for (const sg of [-1, 1]) { g.save(); g.translate(sg * R * .8, -R * .2); g.rotate(sg * (-.5 + fl)); g.fillStyle = 'rgba(240,244,255,.9)'; g.strokeStyle = LIGHT.ink; g.lineWidth = Math.max(1, R * .05); g.beginPath(); g.ellipse(sg * R * 1.4, -R * .3, R * 1.5, R * .5, sg * -.3, 0, TAU); g.fill(); g.stroke(); g.restore(); }
  const gr = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R); gr.addColorStop(0, '#fff6c0'); gr.addColorStop(.5, '#ffd040'); gr.addColorStop(1, '#a8701a');
  // stone inside (visible when open)
  const st = o.stone == null ? op : o.stone; if (op > .05) { const sy = R * .1 + (o.drop || 0) * R * 2.5; g.fillStyle = '#16141c'; g.beginPath(); g.ellipse(0, sy, R * .55, R * .42, .3, 0, TAU); g.fill(); g.strokeStyle = 'rgba(220,235,255,.8)'; g.lineWidth = Math.max(1, R * .05); g.beginPath(); g.moveTo(0, sy - R * .3); g.lineTo(R * .28, sy + R * .2); g.lineTo(-R * .28, sy + R * .2); g.closePath(); g.stroke(); g.beginPath(); g.arc(0, sy + R * .05, R * .14, 0, TAU); g.stroke(); g.globalCompositeOperation = 'lighter'; glow(g, 0, sy, R * 1.2, '#bfe0ff', .3 * st); g.globalCompositeOperation = 'source-over'; }
  for (const sg of [-1, 1]) { g.save(); g.translate(0, -R * .05); g.rotate(sg * op * 1.1); g.translate(sg * op * R * .25, 0); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, sg > 0 ? -HP : HP, sg > 0 ? HP : HP * 3); g.closePath(); g.fill(); g.strokeStyle = LIGHT.ink; g.lineWidth = Math.max(1, R * .08); g.stroke(); g.restore(); }
  if (o.engrave) { g.globalCompositeOperation = 'lighter'; g.font = `italic 700 ${Math.max(10, R * .34)}px "Caladea", serif`; g.textAlign = 'center'; g.fillStyle = rgba('#fff4c8', o.engrave); g.fillText('I open at the close', 0, -R * 1.25); glow(g, 0, -R * .1, R * 2.2, '#ffd36a', .3 * o.engrave); }
  g.restore();
}
function s2Cup(g, p, t, o = {}) {
  const q = s2Q(p), qt = s2Q(Array.isArray(p) ? vAdd(p, [0, o.size || .6, 0]) : null); if (!q || !qt) return; const Hh = q.y - qt.y, x = q.x, y = q.y; g.save();
  if (o.glow) { g.globalCompositeOperation = 'lighter'; glow(g, x, y - Hh * .6, Hh * 1.6, '#5fd3ff', .5 * o.glow); glow(g, x, y - Hh * .7, Hh * .5, '#e8fbff', .5 * o.glow); g.globalCompositeOperation = 'source-over'; }
  const P = new Path2D(); P.moveTo(x - Hh * .25, y); P.lineTo(x + Hh * .25, y); P.lineTo(x + Hh * .12, y - Hh * .1); P.lineTo(x + Hh * .06, y - Hh * .42); P.quadraticCurveTo(x + Hh * .38, y - Hh * .5, x + Hh * .34, y - Hh); P.lineTo(x - Hh * .34, y - Hh); P.quadraticCurveTo(x - Hh * .38, y - Hh * .5, x - Hh * .06, y - Hh * .42); P.lineTo(x - Hh * .12, y - Hh * .1); P.closePath();
  const gr = g.createLinearGradient(x - Hh * .3, 0, x + Hh * .3, 0); gr.addColorStop(0, '#6a8aa8'); gr.addColorStop(.4, '#e8f4ff'); gr.addColorStop(1, '#4a6a88'); g.fillStyle = gr; g.fill(P); g.strokeStyle = '#141820'; g.lineWidth = Math.max(2, Hh * .02); g.stroke(P);
  for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(x + sg * Hh * .4, y - Hh * .72, Hh * .1, Hh * .16, 0, 0, TAU); g.stroke(); }
  g.restore();
}
function s2Barrier(g, c, t, o = {}) {
  const Wd = o.w || 7, Hd = o.h || 5, pts = [[-Wd / 2, 0, 0], [Wd / 2, 0, 0], [Wd / 2, Hd, 0], [-Wd / 2, Hd, 0]].map(v => vAdd(c, v)), sp = projPoly(pts); if (!sp || sp.length < 3) return;
  g.save(); polyPath(g, sp, true); const qa = s2Q(pts[0]), qb = s2Q(pts[2]); const gr = g.createLinearGradient(0, qb ? qb.y : 0, 0, qa ? qa.y : H); gr.addColorStop(0, 'rgba(4,6,16,.92)'); gr.addColorStop(1, 'rgba(10,14,30,.75)'); g.fillStyle = gr; g.fill(); g.clip();
  g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const y = (i / 18) * H + Math.sin(t * 2 + i) * 6; g.strokeStyle = 'rgba(80,110,180,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 20); g.stroke(); }
  if (o.hole) { const qh = s2Q(o.hole); if (qh) for (let k = 0; k < 4; k++) { const rr = (40 + k * 50 + (t * 160) % 50) * (qh.s / 120); g.strokeStyle = rgba('#9fc8ff', .5 - k * .1); g.lineWidth = 3; g.beginPath(); g.ellipse(qh.x, qh.y, rr * .6, rr, 0, 0, TAU); g.stroke(); } }
  g.restore();
}
function s2CloakCorner(g, p, t, o = {}) {
  const q = s2Q(p); if (!q) return; const s = (o.size || .5) * q.s, a = o.a == null ? 1 : o.a; g.save(); g.translate(q.x, q.y); g.globalCompositeOperation = 'lighter';
  const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([lerp(-s, s * .8, u), -s * .6 + Math.sin(u * 5 + t * 3) * s * .08 + u * u * s * .2]); } pts.push([s * .5, s * .5], [-s * .9, s * .3]);
  polyPath(g, pts, true); g.fillStyle = rgba('#dfeaff', .05 * a); g.fill(); g.strokeStyle = rgba('#eef4ff', .16 * a); g.lineWidth = 2; g.stroke();
  for (let i = 0; i < 5; i++) { const y = -s * .4 + i * s * .18; g.strokeStyle = rgba('#ffffff', .18 * a); g.beginPath(); for (let x = -s * .8; x <= s * .6; x += s * .1) g.lineTo(x, y + Math.sin(x / s * 6 + t * 4 + i) * s * .04); g.stroke(); }
  g.restore();
}
function s2Vortex(g, c, t, o = {}) {
  const q = s2Q(c); if (!q) return; const k = o.k == null ? 1 : o.k, R = (o.r || 2) * q.s; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const col = i % 2 ? S2FX.gold : S2FX.cyan, ph = i / 14 * TAU + t * 9; g.strokeStyle = rgba(col, .7 * k); g.lineWidth = Math.max(2, R * .03); g.beginPath();
    for (let s = 0; s <= 40; s++) { const u = s / 40, rr = R * (1 - u) * (.4 + k * .8), an = ph + u * 5; g.lineTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr * .55); } g.stroke(); }
  glow(g, q.x, q.y, R * .6, '#bfe8ff', .6 * k); glow(g, q.x, q.y, R * .15, '#ffffff', .9 * k); g.restore();
}
function s2Motes(g, p, t, o = {}) { const q = s2Q(p); if (!q) return; const n = o.n || 14, R = (o.r || .25) * q.s; g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const an = hash(i) * TAU + t * (1 + hash(i * 3)), d = R * (.4 + .6 * hash(i * 7)), y = ((t * .3 + hash(i * 5)) % 1); glow(g, q.x + Math.cos(an) * d, q.y + Math.sin(an) * d * .5 - y * R, Math.max(2, R * .06), o.col || S2FX.gold, .8 * Math.sin(y * Math.PI)); } g.restore(); }
function s2LightSpiral(g, from, to, t, o = {}) {
  const qt = s2Q(to); if (!qt) return; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; const k = clamp(t / (o.dur || 1), 0, 1);
  from.forEach((p, i) => { const qf = s2Q(p); if (!qf) return; const pts = []; for (let s = 0; s <= 30; s++) { const u = s / 30 * k, e = easeIn(u), an = u * 8 + i * 1.6, rr = (1 - e) * 120; pts.push([lerp(qf.x, qt.x, e) + Math.cos(an) * rr, lerp(qf.y, qt.y, e) + Math.sin(an) * rr * .5]); }
    polyPath(g, pts, false); g.strokeStyle = rgba(o.col || S2FX.silver, .25); g.lineWidth = 18; g.stroke(); g.strokeStyle = rgba('#ffffff', .8); g.lineWidth = 4; g.stroke(); const e = pts[pts.length - 1]; glow(g, e[0], e[1], 40, '#e8f4ff', .6); });
  glow(g, qt.x, qt.y, 60 + 80 * k, '#e8f4ff', .5 * k); g.restore();
}
function s2Hallows(g, p, size, k) { const q = s2Q(p); if (!q || k <= 0) return; const R = size * q.s; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 2.2, '#ffb040', .35 * k); g.globalAlpha = k; if (typeof hvHallows === 'function') { hvHallows(g, q.x, q.y, R, rgba('#ffd36a', .9), Math.max(2, R * .06)); hvHallows(g, q.x, q.y, R, rgba('#ffffff', .6), Math.max(1, R * .02)); } g.restore(); }
function s2RedDot(g, p, k, t) { const q = s2Q(p); if (!q || k <= 0) return; const R = Math.max(3, .06 * q.s) * (.4 + .6 * k); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 9, '#ff2d3a', .45 * k); glow(g, q.x, q.y, R * 3, '#ff6a5a', .9 * k); g.fillStyle = '#fff0ea'; g.beginPath(); g.arc(q.x, q.y, R * .7, 0, TAU); g.fill();
  g.strokeStyle = rgba('#ff4a4a', .6 * k); g.lineWidth = 2; for (let i = 0; i < 3; i++) { const rr = R * (2 + ((t * 3 + i / 3) % 1) * 5); g.beginPath(); g.arc(q.x, q.y, rr, 0, TAU); g.stroke(); } g.restore(); }
function s2Dust(g, c, t, o = {}) { if (typeof fxSmoke === 'function') fxSmoke(g, c, t, Object.assign({ n: 10, size: 2.2, col: '#8a7458', dur: 2.5, seed: 4 }, o)); }
// ---------------------------------------------------------------------------------------------------------------- screen processes
function s2SixPOV(f, t, o = {}) {
  f.screen((c, g) => { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const src = gowCopy(c, 's2pov'), gg = c.getContext('2d'), sc = OUT.scale;
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.fillStyle = '#020818'; gg.fillRect(0, 0, c.width, c.height);
    gg.filter = 'grayscale(1) contrast(2.6) brightness(1.15)'; gg.globalCompositeOperation = 'lighter'; gg.drawImage(src, 0, 0); gg.filter = 'blur(3px) grayscale(1) contrast(2)'; gg.globalAlpha = .6 * k; gg.drawImage(src, 0, 0); gg.filter = 'none';
    gg.globalCompositeOperation = 'multiply'; gg.globalAlpha = 1; gg.fillStyle = '#4ab8ff'; gg.fillRect(0, 0, c.width, c.height); gg.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = k; const fr = Math.floor(t * 24);
    for (let i = 0; i < 60; i++) { const y = (i * 18 + t * 120) % H; g.strokeStyle = rgba('#5fd3ff', .07); g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = 0; i < 40; i++) { const x = hash(i * 3) * W, y = (hash(i * 7) * H - t * (80 + hash(i) * 200) + H * 4) % H; g.fillStyle = rgba('#c9f3ff', .5); g.fillRect(x, y, 2, 10 + hash(i + fr) * 20); }
    const gr = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,40,120,.6)'); g.globalCompositeOperation = 'source-over'; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); });
}
function s2Memory(f, kind, o = {}) {
  const k = o.k == null ? 1 : o.k, t = o.t || 0;
  f.grade(kind === 'H' ? { sat: .45, tint: ['#e8c890', .4 * k], contrast: 1.08, lift: ['#3a2410', .08 * k] } : { sat: .4, tint: ['#a8c0e8', .38 * k], contrast: 1.06, lift: ['#0a1830', .08 * k] });
  f.fx(g => { g.save(); const fr = Math.floor(t * 12), r = rng(fr * 7 + 3); g.strokeStyle = kind === 'H' ? 'rgba(80,50,20,.25)' : 'rgba(200,220,255,.18)'; g.lineWidth = 1.5; for (let i = 0; i < 5; i++) { const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - .5) * 30, H); g.stroke(); }
    const gr = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .9); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, kind === 'H' ? 'rgba(40,20,5,.55)' : 'rgba(5,15,40,.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }, { layer: 'top' });
}
function s2Black(f, k) { if (k > 0) f.flash('#000000', clamp(k, 0, 1)); }
