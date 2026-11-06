/* engine/impact_hy.js (agent E, hulk-vs-yujiro) - impact styles + sequences (graphic, hand2d lineart, lines >= 3 px @1080).
   STYLES IMPACT[name](comp, g, f, p, k, n), focus = p.at (world) | p.x,p.y | figures' centre:
     gammaburst   green over-exposure, figures black with green-white rim, gamma starburst + radial lines at the focus
     comicpow     comic-book panel: posterised frame + Ben-Day halftone + heavy black figure outlines + burst lettering (p.text 'POW!', p.kind)
     halftone     comic halftone print (dot screen, yellow/purple/green duotone) (p.cols)
     musclebulge  extreme close insert on a body part (p.part 'hand'|'face'|..., p.fig) with pulsing tension lines and veins
     bonecrack    X-ray: dark frame, translucent figures, white bones; a jagged crack lights up at the focus (p.fig = victim index)
     concrete     the frame shatters into irregular concrete slabs, dust in the gaps, grey wash
     inkstare     sumi paper, figure lineart, heavy ink shadow across the eyes, two red eye glints (p.fig)
     ogreaura     dark crimson desaturated frame, figure black silhouette with a black flame aura + crimson rim, heat strokes
     inksplash    white paper, black ink explosion at the focus with red flecks, figures black silhouettes
     oniface      black frame, a huge demon face drawn in brush ink (the Demon Back read as a face), white eye slits, fangs (p.open 0..1)
     roarrings    green-tinted dim frame, white concentric pressure rings from the focus (p.n)
     shockdome    white-washed frame, refracting dome ring + dust ring, figures dark
     rageveins    dark green duotone, neon green veins crawl over the frame from the figures, red eyes dot
     crater       orange-brown field, black silhouettes, crater rings + flying chunks from the focus
   SEQUENCES (powers.md impact names): GAMMA_BURST ROAR_RINGS COMIC_POW SHOCKWAVE_RING CONCRETE_SHATTER MANGA_PANELS IMPACT_CRATER RAGE_VEINS INK_STARE OGRE_AURA
     INK_SPLASH_HIT ONI_FACE DUAL_CLASH BONE_CRACK MUSCLE_BULGE COMIC_HALFTONE (+ existing SPEEDLINE_BURST CHROMA_SPLIT RED_BLACK_SPLIT ...)
     character series: hlk_smash hlk_clap hlk_roar hlk_land hlk_haymaker yuj_fist yuj_oni yuj_stare yuj_kick clash_hy                                        */
'use strict';
const HYI = { green: '#7dff4a', green2: '#e8ffd0', gdark: '#0e2a0a', purple: '#5b2a86', ink: '#0c0a0c', paper: '#f2ebdd', red: '#c4122a', crimson: '#8a0a18' };
function hyiFocus(f, p) { return impFocus(f, p); }
function hyiLines(g, q, n, col, inner, w = 4, seed = 3) { const r = rng(seed); g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { const a = r() * TAU, r0 = inner * (.8 + r() * .6), ww = w * (.4 + r()) / 2; g.beginPath(); g.moveTo(q.x + Math.cos(a - .004) * r0, q.y + Math.sin(a - .004) * r0); g.lineTo(q.x + Math.cos(a) * 2600 + Math.cos(a + HP) * ww * 8, q.y + Math.sin(a) * 2600 + Math.sin(a + HP) * ww * 8); g.lineTo(q.x + Math.cos(a) * 2600 - Math.cos(a + HP) * ww * 8, q.y + Math.sin(a) * 2600 - Math.sin(a + HP) * ww * 8); g.closePath(); g.fill(); } g.restore(); }
function hyiDots(g, col, step, rMax, cx, cy, fall = 1, rot = .3) { g.save(); g.fillStyle = col; g.translate(cx, cy); g.rotate(rot); for (let y = -1400; y < 1400; y += step) for (let x = -1400; x < 1400; x += step) { const d = Math.hypot(x, y) / 1100, r = rMax * clamp(fall > 0 ? d * fall : 1 - d * -fall, .08, 1); g.beginPath(); g.arc(x + ((y / step) & 1) * step / 2, y, r, 0, TAU); g.fill(); } g.restore(); }
IMPACT.gammaburst = (c, g, f, p, k, n) => {
  const t = filtered(c, 'grayscale(1) brightness(1.7) contrast(1.5)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#9cff5a'; g.fillRect(0, 0, W, H); g.restore();
  const q = hyiFocus(f, p); hyiLines(g, q, 70, rgba('#ffffff', .85), 220, 5, 11 + k);
  rawDraw(g, impSil('chars', HYI.gdark)); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 760, HYI.green, .8); glow(g, q.x, q.y, 260, '#ffffff', .9); g.restore();
  g.save(); polyPath(g, hyJag(q.x, q.y, 120 + k * 30, 420 + k * 90, 11, 5 + k)); g.fillStyle = rgba('#f4ffe0', .9); g.fill(); g.lineWidth = 8; g.strokeStyle = HYI.gdark; g.stroke(); g.restore();
};
IMPACT.halftone = (c, g, f, p, k) => {
  const cols = p.cols || ['#ffe14a', '#5b2a86', '#2a8a1a'], t = filtered(c, 'grayscale(1) contrast(1.8) brightness(1.1)'); rawDraw(g, t);
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = cols[0]; g.fillRect(0, 0, W, H); g.restore(); const q = hyiFocus(f, p);
  g.save(); g.globalCompositeOperation = 'multiply'; hyiDots(g, rgba(cols[1], .85), 26, 11, q.x, q.y, 1.2, .26); g.restore();
  rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#0a0a0a', 2.4));
};
IMPACT.comicpow = (c, g, f, p, k, n) => {
  IMPACT.halftone(c, g, f, Object.assign({ cols: p.kind === 'purple' ? ['#ffd84a', '#5b2a86'] : ['#d8ff6a', '#5b2a86'] }, p), k);
  const q = hyiFocus(f, p); hyiLines(g, q, 40, '#0a0a0a', 360, 4, 7 + k);
  if (p.text !== false) { const txt = p.text || 'POW!'; comicBurst(g, q.x + (p.dx || 0), q.y - 60 + (p.dy || 0), 420, 260, 1 + k * .05, p.burstCol || '#ffe14a', '#ff8a2a', 3 + k);
    g.save(); g.translate(q.x + (p.dx || 0), q.y + (p.dy || 0)); g.rotate(-.14); g.font = `${p.size || 230}px "Bangers", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (let d = 16; d > 0; d -= 4) { g.fillStyle = '#1a0a2a'; g.fillText(txt, d, d - 60); } g.lineWidth = 34; g.strokeStyle = HYI.purple; g.strokeText(txt, 0, -60); g.lineWidth = 16; g.strokeStyle = '#0a0a0a'; g.strokeText(txt, 0, -60);
    const gr = g.createLinearGradient(0, -170, 0, 40); gr.addColorStop(0, '#f4ff8a'); gr.addColorStop(1, '#3ad02a'); g.fillStyle = gr; g.fillText(txt, 0, -60); g.restore(); }
};
IMPACT.musclebulge = (c, g, f, p, k, n) => {
  IMPACT.closeup(c, g, f, Object.assign({ part: p.part || 'hand', bg: p.bg || '#1a0a08', lineCol: '#ffd8b0', dist: (p.dist || .55) * (1 - .06 * k) }, p), k);
  const q = { x: W / 2, y: H / 2 }; g.save(); g.lineCap = 'round'; for (let i = 0; i < 18; i++) { const a = hash(i * 7 + k * 31) * TAU, r0 = 330 + 60 * hash(i + k), l = 80 + 60 * hash(i * 3); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + l), q.y + Math.sin(a) * (r0 + l)); g.lineWidth = 9; g.strokeStyle = '#0a0606'; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.stroke(); } g.restore();
};
function hyiBones(g, S) { // white bone sticks + ribs + skull for an X-ray frame
  const J = S.J, k = S.B.h / 1.8, P2p = j => project(J[j]); g.save(); g.lineCap = 'round'; g.strokeStyle = '#f4f8ff';
  const seg = (a, b, w) => { const A = P2p(a), B = P2p(b); if (!A || !B) return; g.lineWidth = Math.max(3, w * A.s * k); g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); for (const Q of [A, B]) { g.beginPath(); g.arc(Q.x, Q.y, Math.max(3, w * 1.1 * Q.s * k), 0, TAU); g.fillStyle = '#f4f8ff'; g.fill(); } };
  for (const sd of ['L', 'R']) { seg('sh' + sd, 'el' + sd, .035); seg('el' + sd, 'wr' + sd, .03); seg('hip' + sd, 'kn' + sd, .045); seg('kn' + sd, 'an' + sd, .038); seg('neck', 'sh' + sd, .025); }
  seg('pelvis', 'neck', .03); const C = project(vLerp(J.abd, J.neck, .55)), H0 = project(J.head);
  if (C) { for (let i = 0; i < 5; i++) { g.lineWidth = Math.max(2, .018 * C.s * k); g.beginPath(); g.ellipse(C.x, C.y - (i - 2) * .06 * C.s * k, .17 * C.s * k, .05 * C.s * k, 0, 0, TAU); g.stroke(); } }
  if (H0) { g.fillStyle = '#f4f8ff'; g.beginPath(); g.ellipse(H0.x, H0.y, .11 * H0.s * k, .13 * H0.s * k, 0, 0, TAU); g.fill(); g.fillStyle = '#0a1830'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(H0.x + sx * .04 * H0.s * k, H0.y - .01 * H0.s * k, .025 * H0.s * k, .03 * H0.s * k, 0, 0, TAU); g.fill(); } }
  g.restore();
}
IMPACT.bonecrack = (c, g, f, p, k, n) => {
  fillAll(g, '#06101e'); const t = filtered(c, 'grayscale(1) invert(1) brightness(.5) contrast(1.4)'); rawDraw(g, t, 0, 0, .35); g.save(); g.globalCompositeOperation = 'screen'; rawDraw(g, impSil('chars', '#2a4a7a'), 0, 0, .8); g.restore();
  const it = f._figs[p.fig == null ? f._figs.length - 1 : p.fig]; if (it) hyiBones(g, figSkel(it.F, it.opt.t != null ? it.opt.t : f.T));
  const q = hyiFocus(f, p); g.save(); g.lineCap = 'round'; g.lineJoin = 'miter';
  for (let i = 0; i < 9; i++) { let a = hash(i * 13 + 3) * TAU, x = q.x, y = q.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 4 + k; j++) { a += (hash(i * 7 + j) - .5) * 1.1; const L = 40 + 50 * hash(i + j); x += Math.cos(a) * L; y += Math.sin(a) * L; g.lineTo(x, y); } g.lineWidth = 10; g.strokeStyle = '#ff2a3a'; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.stroke(); }
  g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 260, '#ff4a5a', .8); g.restore();
};
IMPACT.concrete = (c, g, f, p, k, n) => {
  const src = copyComp(c); fillAll(g, '#1a1612'); const q = hyiFocus(f, p), r = rng(17), cells = [];
  for (let i = 0; i < 26; i++) cells.push([r() * W, r() * H]);
  const push = (p.push || 26) * (1 + k * .6);
  for (let i = 0; i < cells.length; i++) { // voronoi-ish slabs: polygon of points nearer to this seed (coarse grid sampling)
    const s0 = cells[i]; const poly = []; for (let a = 0; a < 12; a++) { const an = a / 12 * TAU; let lo = 0, hi = 900; for (let it = 0; it < 10; it++) { const m = (lo + hi) / 2, px = s0[0] + Math.cos(an) * m, py = s0[1] + Math.sin(an) * m; let near = true; for (let j = 0; j < cells.length; j++) if (j !== i && Math.hypot(px - cells[j][0], py - cells[j][1]) < Math.hypot(px - s0[0], py - s0[1])) { near = false; break; } if (near) lo = m; else hi = m; } poly.push([s0[0] + Math.cos(an) * lo, s0[1] + Math.sin(an) * lo]); }
    const dx = s0[0] - q.x, dy = s0[1] - q.y, dl = Math.hypot(dx, dy) || 1, off = push * (1 - Math.min(1, dl / 1400)) + 6; g.save(); g.translate(dx / dl * off, dy / dl * off); polyPath(g, poly); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `grayscale(.6) brightness(${.85 + .25 * hash(i)})`; g.drawImage(src, 0, 0); g.filter = 'none'; g.restore();
    g.save(); g.translate(dx / dl * off, dy / dl * off); polyPath(g, poly); g.lineWidth = 6; g.strokeStyle = '#0c0a08'; g.stroke(); g.restore(); }
  g.save(); g.globalAlpha = .55; fxSmoke(g, { x: q.x, y: q.y, s: 100 }, .4 + k * .1, { n: 10, size: 1.6, col: '#cdbb9a', dur: 2 }); g.restore();
};
IMPACT.inkstare = (c, g, f, p, k, n) => {
  fillAll(g, HYI.paper); rawDraw(g, impFigs(f, HYI.paper, HYI.ink, 2.2));
  const it = f._figs[p.fig != null && f._figs[p.fig] ? p.fig : Math.max(0, f._figs.findIndex(q => /yujiro/i.test(q.F.design.name || '')))]; if (!it) return; const S = figSkel(it.F, it.opt.t != null ? it.opt.t : f.T), HM = headModel(S, designAt(it.F, it.opt.t != null ? it.opt.t : f.T)), q = project(HM.c); if (!q) return; const r = HM.r * q.s;
  g.save(); g.fillStyle = rgba(HYI.ink, .88); g.beginPath(); g.ellipse(q.x, q.y - r * .25, r * 1.3, r * .55, 0, 0, TAU); g.fill();
  for (const sx of [-1, 1]) { const e = project(HM.at(sx * .44, -.2)); if (e) { g.fillStyle = HYI.red; g.beginPath(); g.ellipse(e.x, e.y, r * .14, r * .05, 0, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(e.x, e.y, r * .03 + 2, 0, TAU); g.fill(); } }
  g.restore(); hyiLines(g, q, 50, rgba(HYI.ink, .7), r * 2.4, 3, 9 + k);
};
IMPACT.ogreaura = (c, g, f, p, k, n) => {
  const t = filtered(c, 'grayscale(.85) brightness(.55) contrast(1.3)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c86060'; g.fillRect(0, 0, W, H); g.restore();
  const sil0 = impSil('chars', '#000000'), s = OUT.scale, sil = layer('hyiSil'), sg = sil.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sil.width, sil.height); sg.drawImage(sil0, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 4; i >= 1; i--) { g.globalAlpha = .18 + .1 * (4 - i); const dy = -i * 10 * s - k * 6 * s; g.filter = `blur(${i * 3 * s}px)`; g.drawImage(sil, (hash(i + k) - .5) * 12 * s, dy); } g.filter = 'none'; g.globalAlpha = 1;
  { const rs = impSil('chars', HYI.red); g.drawImage(rs, -4 * s, -4 * s); g.drawImage(rs, 4 * s, -4 * s); } g.drawImage(sil, 0, 0); g.restore();
  const q = hyiFocus(f, p); g.save(); g.strokeStyle = rgba('#000000', .7); g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const x = q.x + (hash(i * 3 + k) - .5) * 900, y0 = q.y + 300 - hash(i * 5) * 700; g.lineWidth = 4 + 6 * hash(i); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 30, y0 - 60, x - 30, y0 - 120, x + 10, y0 - 200); g.stroke(); } g.restore();
};
IMPACT.inksplash = (c, g, f, p, k, n) => { fillAll(g, HYI.paper); rawDraw(g, impSil('chars', HYI.ink)); const q = hyiFocus(f, p); fxInkSplash(g, { x: q.x, y: q.y, s: 300 }, .2 + k * .12, { size: 2.6 + k * .5, dur: 1, seed: 9 + k }); hyiLines(g, q, 36, rgba(HYI.ink, .8), 420, 3, 5 + k); };
function hyOniFaceDraw(g, cx, cy, R, open = 1, k = 0) { // brush-ink demon face (Demon Back read as a face)
  g.save(); g.translate(cx, cy); g.lineJoin = 'round'; g.lineCap = 'round'; const ink = HYI.ink, j = (i) => (hash(i * 7 + k) - .5) * R * .015;
  const stroke = (pts, w) => { inkPts(g, pts.map(([x, y], i) => [x * R + j(i), y * R + j(i + 9)]), w * R, ink, [.15, .4]); };
  for (const sx of [-1, 1]) {
    // brows: heavy angled brush strokes
    stroke([[sx * .08, -.32], [sx * .35, -.46], [sx * .7, -.38]], .1); stroke([[sx * .12, -.24], [sx * .38, -.34], [sx * .62, -.3]], .045);
    // eyes: white slits with red pupils inside ink sockets
    g.fillStyle = ink; g.beginPath(); g.ellipse(sx * .36 * R, -.16 * R, .24 * R, .12 * R, sx * -.25, 0, TAU); g.fill();
    g.fillStyle = '#fbf4ea'; g.beginPath(); g.ellipse(sx * .36 * R, -.16 * R, .18 * R, .045 * R * (.4 + .6 * open), sx * -.25, 0, TAU); g.fill();
    g.fillStyle = HYI.red; g.beginPath(); g.arc(sx * .33 * R, -.16 * R, .03 * R * open, 0, TAU); g.fill();
    // cheek muscles (lats)
    stroke([[sx * .66, -.1], [sx * .78, .2], [sx * .62, .5]], .06); stroke([[sx * .5, .05], [sx * .55, .25]], .03);
    // horns of the traps
    stroke([[sx * .25, -.62], [sx * .45, -.85], [sx * .5, -1.0]], .07);
  }
  stroke([[0, -.3], [0, .12]], .05); stroke([[-.1, .1], [0, .16], [.1, .1]], .05);   // nose (spine)
  // snarling mouth with fangs
  g.fillStyle = ink; g.beginPath(); g.moveTo(-.48 * R, .3 * R); g.quadraticCurveTo(0, (.22 - .1 * open) * R, .48 * R, .3 * R); g.quadraticCurveTo(0, (.62 + .12 * open) * R, -.48 * R, .3 * R); g.fill();
  g.fillStyle = '#fbf4ea'; for (let i = -3; i <= 3; i++) { const x = i * .12 * R, big = Math.abs(i) === 2 ? 1.8 : 1; g.beginPath(); g.moveTo(x - .04 * R, .3 * R); g.lineTo(x + .04 * R, .3 * R); g.lineTo(x, (.3 + .08 * big) * R); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x - .04 * R, .55 * R); g.lineTo(x + .04 * R, .55 * R); g.lineTo(x, (.55 - .06 * big) * R); g.closePath(); g.fill(); }
  g.restore();
}
IMPACT.oniface = (c, g, f, p, k, n) => {
  fillAll(g, p.bg || '#120608'); const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); gr.addColorStop(0, '#5a0a14'); gr.addColorStop(1, '#0a0204'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(.62 + k * .02, .62 + k * .02); g.translate(-W / 2, -H / 2); { const cx = W / 2, cy = H / 2; g.save(); g.beginPath(); g.moveTo(cx - 980, cy - 330); g.quadraticCurveTo(cx - 1020, cy - 520, cx - 760, cy - 560); g.quadraticCurveTo(cx - 400, cy - 470, cx - 170, cy - 640); g.lineTo(cx + 170, cy - 640); g.quadraticCurveTo(cx + 400, cy - 470, cx + 760, cy - 560); g.quadraticCurveTo(cx + 1020, cy - 520, cx + 980, cy - 330);
    g.quadraticCurveTo(cx + 800, cy + 200, cx + 520, cy + 620); g.lineTo(cx - 520, cy + 620); g.quadraticCurveTo(cx - 800, cy + 200, cx - 980, cy - 330); g.closePath(); const sk = g.createLinearGradient(0, cy - 600, 0, cy + 600); sk.addColorStop(0, '#e2b08a'); sk.addColorStop(1, '#9a6040'); g.fillStyle = sk; g.fill(); g.lineWidth = 14; g.strokeStyle = HYI.ink; g.stroke();
    g.clip(); g.fillStyle = 'rgba(60,20,10,.35)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * 700, cy - 250, 260, 360, sx * .4, 0, TAU); g.fill(); } g.restore(); }
  g.restore(); g.save(); g.translate(W / 2, H / 2); g.scale(.62, .62); g.translate(-W / 2, -H / 2); hyOniFaceDraw(g, W / 2, H / 2 + 20, 620 * (1 + k * .03), p.open == null ? Math.min(1, (k + 1) / Math.max(1, n - 1)) : p.open, k);
  g.restore(); g.save(); g.globalCompositeOperation = 'multiply'; const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1000); vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(60,0,10,1)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
};
IMPACT.roarrings = (c, g, f, p, k, n) => {
  const t = filtered(c, 'brightness(.5) saturate(.6)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#9ad87a'; g.fillRect(0, 0, W, H); g.restore(); const q = hyiFocus(f, p);
  g.save(); for (let i = 0; i < (p.n || 7); i++) { const r = 60 + (i + k * .5) * 170; g.beginPath(); g.ellipse(q.x, q.y, r, r * .8, 0, 0, TAU); g.lineWidth = 16 - i * 1.5; g.strokeStyle = rgba('#ffffff', .95 - i * .1); g.stroke(); } g.restore();
  rawDraw(g, impSil('chars', HYI.gdark));
};
IMPACT.shockdome = (c, g, f, p, k, n) => {
  const t = filtered(c, 'brightness(1.6) contrast(.8) saturate(.4)'); rawDraw(g, t); rawDraw(g, impSil('chars', '#2a2a34'));
  const q = hyiFocus(f, p), R = 300 + k * 220; g.save(); g.beginPath(); g.ellipse(q.x, q.y, R, R * .9, 0, 0, TAU); g.lineWidth = 26; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#7fb8ff'; g.stroke();
  g.beginPath(); g.ellipse(q.x, q.y + R * .75, R * 1.6, R * .25, 0, 0, TAU); g.lineWidth = 14; g.strokeStyle = 'rgba(240,220,190,.9)'; g.stroke(); g.restore(); hyiLines(g, q, 50, rgba('#ffffff', .8), R, 4, 3 + k);
};
IMPACT.rageveins = (c, g, f, p, k, n) => {
  const t = filtered(c, 'grayscale(1) contrast(1.6) brightness(.7)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#3aa02a'; g.fillRect(0, 0, W, H); g.restore();
  rawDraw(g, impSil('chars', '#051a04')); const q = hyiFocus(f, p); g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { let a = hash(i * 11) * TAU, x = q.x, y = q.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 9; j++) { a += (hash(i * 5 + j) - .5) * .9; const L = (60 + 40 * hash(j + i)) * (1 + k * .3); x += Math.cos(a) * L; y += Math.sin(a) * L; g.lineTo(x, y); } g.lineWidth = 12; g.strokeStyle = rgba(HYI.green, .35); g.stroke(); g.lineWidth = 4; g.strokeStyle = HYI.green2; g.stroke(); }
  g.restore();
};
IMPACT.crater = (c, g, f, p, k, n) => {
  fillAll(g, '#c86a2a'); const gr = g.createRadialGradient(W / 2, H * .6, 100, W / 2, H * .6, 1300); gr.addColorStop(0, '#ffd08a'); gr.addColorStop(1, '#5a1a08'); g.fillStyle = gr; g.fillRect(0, 0, W, H); const q = hyiFocus(f, p);
  g.save(); for (let i = 0; i < 5; i++) { const r = 120 + (i + k * .6) * 200; g.beginPath(); g.ellipse(q.x, q.y + 80, r, r * .35, 0, 0, TAU); g.lineWidth = 14 - i * 2; g.strokeStyle = '#1a0804'; g.stroke(); } g.restore();
  for (let i = 0; i < 18; i++) { const a = -Math.PI * hash(i * 3), d = 200 + (k + 1) * 160 * hash(i * 7 + 1); drawBoulder(g, { x: q.x + Math.cos(a) * d * 1.4, y: q.y + Math.sin(a) * d, s: 60 }, { r: .4 + .6 * hash(i), rot: i + k, seed: i, col: '#2a1408' }); }
  rawDraw(g, impSil('chars', '#0a0402'));
};
Object.assign(IMPACT_SEQ, {
  GAMMA_BURST: [{ s: 'flash', n: 1 }, { s: 'gammaburst', n: 2 }, { s: 'gammaburst', n: 1, p: { neg: true } }],
  ROAR_RINGS: [{ s: 'roarrings', n: 3 }],
  COMIC_POW: [{ s: 'comicpow', n: 2 }, { s: 'flash', n: 1 }],
  COMIC_HALFTONE: [{ s: 'halftone', n: 2 }],
  SHOCKWAVE_RING: [{ s: 'flash', n: 1 }, { s: 'shockdome', n: 3 }],
  CONCRETE_SHATTER: [{ s: 'concrete', n: 2 }, { s: 'concrete', n: 1, p: { push: 60 } }],
  MANGA_PANELS: [{ s: 'panels', n: 3, p: { modes: ['zoom', 'neg', 'mono'] } }],
  IMPACT_CRATER: [{ s: 'flash', n: 1 }, { s: 'crater', n: 2 }],
  RAGE_VEINS: [{ s: 'rageveins', n: 3 }],
  INK_STARE: [{ s: 'inkstare', n: 2 }],
  OGRE_AURA: [{ s: 'ogreaura', n: 3 }],
  INK_SPLASH_HIT: [{ s: 'flash', n: 1 }, { s: 'inksplash', n: 2 }],
  ONI_FACE: [{ s: 'black', n: 1 }, { s: 'oniface', n: 3 }],
  DUAL_CLASH: [{ s: 'flash', n: 1 }, { s: 'dualsplit', n: 2, p: { col: '#7dff4a', col2: '#c4122a', ang: .25 } }],
  BONE_CRACK: [{ s: 'bonecrack', n: 2 }, { s: 'invert', n: 1 }],
  MUSCLE_BULGE: [{ s: 'musclebulge', n: 3 }],
  hlk_smash: [{ s: 'flash', n: 1 }, { s: 'comicpow', n: 1, p: { text: 'SMASH!' } }, { s: 'concrete', n: 2 }],
  hlk_clap: [{ s: 'flash', n: 1 }, { s: 'shockdome', n: 3 }],
  hlk_roar: [{ s: 'roarrings', n: 2 }, { s: 'rageveins', n: 1 }],
  hlk_land: [{ s: 'flash', n: 1 }, { s: 'gammaburst', n: 1 }, { s: 'crater', n: 2 }],
  hlk_haymaker: [{ s: 'comicpow', n: 2, p: { text: 'POW!' } }, { s: 'speedburst', n: 1 }],
  yuj_fist: [{ s: 'flash', n: 1 }, { s: 'inksplash', n: 1 }, { s: 'bonecrack', n: 2 }],
  yuj_oni: [{ s: 'black', n: 1 }, { s: 'oniface', n: 3 }, { s: 'ogreaura', n: 1 }],
  yuj_stare: [{ s: 'inkstare', n: 2 }],
  yuj_kick: [{ s: 'panels', n: 2, p: { modes: ['zoom', 'neg', 'orig'] } }, { s: 'inksplash', n: 1 }],
  clash_hy: [{ s: 'flash', n: 1 }, { s: 'dualsplit', n: 2, p: { col: '#7dff4a', col2: '#c4122a' } }, { s: 'speedburst', n: 1 }],
});
// ================================================================================================ impact_requests.md additions
function hyiPanelFrame(g) { g.save(); g.lineWidth = 28; g.strokeStyle = '#ffffff'; g.strokeRect(14, 14, W - 28, H - 28); g.lineWidth = 8; g.strokeStyle = '#0a0a0a'; g.strokeRect(30, 30, W - 60, H - 60); g.restore(); }
function hyiKana(g, txt, x, y, size, col = '#0b0b0b', edge = '#f4efe6', rot = -.12) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px "Dela Gothic One", "IPAGothic", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .14; g.strokeStyle = edge; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); }
{ const cp = IMPACT.comicpow; IMPACT.comicpow = (c, g, f, p, k, n) => { cp(c, g, f, p, k, n); hyiPanelFrame(g); }; }
{ const is = IMPACT.inksplash; IMPACT.inksplash = (c, g, f, p, k, n) => { is(c, g, f, p, k, n); const q = hyiFocus(f, p); hyiKana(g, p.kana || 'ドン', q.x + (q.x < W / 2 ? 330 : -330), q.y - 230, 200, '#0b0b0b', '#f4efe6', -.15); }; }
{ const st = IMPACT.inkstare; IMPACT.inkstare = (c, g, f, p, k, n) => { fillAll(g, HYI.paper); g.save(); g.globalAlpha = .12; g.font = '820px "Dela Gothic One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#0b0b0b'; g.fillText(p.bgKanji || '範馬', W / 2, H / 2); g.restore();
  g.save(); g.strokeStyle = 'rgba(11,11,11,.55)'; for (let i = 0; i < 70; i++) { const x = (i / 70) * W + hash(i) * 10; g.lineWidth = 2 + 3 * hash(i * 3); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H * (.25 + .2 * hash(i * 7))); g.stroke(); } g.restore();
  rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', HYI.ink, 2.4)); const it = f._figs[p.fig != null && f._figs[p.fig] ? p.fig : Math.max(0, f._figs.findIndex(q => /yujiro/i.test(q.F.design.name || '')))]; if (!it) return; const tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(it.F, tf), HM = headModel(S, designAt(it.F, tf)), q = project(HM.c); if (!q) return; const r = HM.r * q.s;
  g.save(); g.fillStyle = rgba(HYI.ink, .85); g.beginPath(); g.ellipse(q.x, q.y - r * .25, r * 1.3, r * .5, 0, 0, TAU); g.fill(); for (const sx of [-1, 1]) { const e = project(HM.at(sx * .44, -.2)); if (e) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(e.x, e.y, r * .16, r * .045, 0, 0, TAU); g.fill(); g.fillStyle = '#0b0b0b'; g.beginPath(); g.arc(e.x, e.y, Math.max(2, r * .035), 0, TAU); g.fill(); } } g.restore(); }; }
IMPACT.rageveins = (c, g, f, p, k, n) => {   // black frame: only glowing green veins + eyes remain, pulsing twice with the heartbeat
  fillAll(g, '#020402'); const beat = [1, .45, 1, .5][k % 4], it = f._figs.find(q => /hulk/i.test(q.F.design.name || '')) || f._figs[0]; if (!it) return; const tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(it.F, tf), J = S.J, k2 = S.B.h / 1.8;
  g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
  const vein = (a, b, seed, w) => { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10, pp = vLerp(a, b, u), q = project([pp[0] + Math.sin(u * 9 + seed) * .03 * k2, pp[1], pp[2] + Math.cos(u * 7 + seed) * .03 * k2]); if (q) pts.push([q.x, q.y]); } if (pts.length < 2) return; polyPath(g, pts, false); g.lineWidth = w * 3; g.strokeStyle = rgba('#7dff4a', .35 * beat); g.stroke(); g.lineWidth = w; g.strokeStyle = rgba('#e8ffd0', beat); g.stroke(); };
  for (const sd of ['L', 'R']) { vein(J['sh' + sd], J['el' + sd], sd === 'L' ? 1 : 2, 6); vein(J['el' + sd], J['wr' + sd], sd === 'L' ? 3 : 4, 5); vein(J.neck, vLerp(J.neck, J['sh' + sd], .7), 5, 5); }
  vein(J.neck, J.head, 7, 6); const HM = headModel(S, designAt(it.F, tf)); for (const sx of [-1, 1]) { const e = project(HM.at(sx * .44, -.22)), tm = project(HM.at(sx * .7, .3)); if (e) { glow(g, e.x, e.y, 60, '#7dff4a', .9 * beat); glow(g, e.x, e.y, 20, '#ffffff', beat); } if (tm && e) { g.lineWidth = 4; g.strokeStyle = rgba('#c8ff9a', beat); g.beginPath(); g.moveTo(tm.x, tm.y); g.lineTo((tm.x + e.x) / 2, tm.y - 20); g.stroke(); } }
  g.restore();
};
IMPACT.musclebulge = (c, g, f, p, k, n) => {   // anatomy lines in black ink on white paper (back + arms), lines thicken over 2 frames
  fillAll(g, HYI.paper); const it = f._figs.find(q => /yujiro/i.test(q.F.design.name || '')) || f._figs[0]; if (!it) return; rawDraw(g, impFigs(f, HYI.paper, HYI.ink, 1.8 + k * .8));
  const tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(it.F, tf), J = S.J, w = 4 + k * 3; g.save(); g.strokeStyle = HYI.ink; g.lineCap = 'round';
  for (const sd of ['L', 'R']) for (let i = 0; i < 4; i++) { const a = project(vLerp(J['sh' + sd], J['el' + sd], .15 + i * .2)), b = project(vLerp(J['el' + sd], J['wr' + sd], .1 + i * .2)); if (a && b) { g.lineWidth = w * (1 - i * .15); g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2 + Math.sin(k + i) * 20, (a.y + b.y) / 2 - 30, b.x, b.y); g.stroke(); } }
  const ab = project(J.abd), nk = project(J.neck); if (ab && nk) for (let i = -3; i <= 3; i++) { g.lineWidth = w * .8; g.beginPath(); g.moveTo(nk.x + i * 18, nk.y + 10); g.quadraticCurveTo(lerp(nk.x, ab.x, .5) + i * 34 + Math.sin(k * 2 + i) * 8, lerp(nk.y, ab.y, .5), ab.x + i * 14, ab.y); g.stroke(); }
  g.restore(); hyiLines(g, hyiFocus(f, p), 30, rgba(HYI.ink, .5), 520, 3, 7 + k);
};
IMPACT.ogreaura = (c, g, f, p, k, n) => {   // Yujiro black silhouette against white, heat haze rising, crimson rim, the crowd recoils (blurred dark shapes)
  fillAll(g, '#f6f0e6'); const t = filtered(c, 'grayscale(1) brightness(1.5) contrast(.6) blur(3px)'); rawDraw(g, t, 0, 0, .35); const s = OUT.scale, sil0 = impSil('chars', '#000000'), sil = layer('hyiSil'), sg = sil.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sil.width, sil.height); sg.drawImage(sil0, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const rs = impSil('chars', HYI.red); g.drawImage(rs, -5 * s, -4 * s); g.drawImage(rs, 5 * s, -4 * s);
  const n2 = 22, hh = sil.height / n2; for (let i = 0; i < n2; i++) { const dx = Math.sin(i * 1.3 + k * 2) * 6 * s * (1 - i / n2); g.drawImage(sil, 0, i * hh, sil.width, hh + 1, dx, i * hh - k * 3 * s, sil.width, hh + 1); } g.restore();
  const q = hyiFocus(f, p); g.save(); g.strokeStyle = 'rgba(10,6,6,.55)'; g.lineCap = 'round'; for (let i = 0; i < 24; i++) { const x = q.x + (hash(i * 3 + k) - .5) * 700, y0 = q.y - 100 - hash(i * 5) * 300; g.lineWidth = 3 + 4 * hash(i); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 25, y0 - 50, x - 25, y0 - 100, x + 10, y0 - 170); g.stroke(); } g.restore();
};
IMPACT.worldbreaker = (c, g, f, p, k, n) => {   // green over-exposure, glowing lava-green fissures, Hulk black, shaking
  const sh = (k < 2 ? (hash(k * 7) - .5) * 30 : 0); const t = filtered(c, 'grayscale(1) brightness(1.9) contrast(1.4)'); rawDraw(g, t, sh * OUT.scale, 0); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#7dff4a'; g.fillRect(0, 0, W, H); g.restore();
  const q = hyiFocus(f, p); g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { let a = Math.PI * (.05 + .9 * hash(i * 7)), x = q.x, y = q.y + 120; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 7; j++) { a += (hash(i * 3 + j) - .5) * .8; x += Math.cos(a) * 120 * (hash(i) > .5 ? 1 : -1); y += Math.abs(Math.sin(a)) * 50; g.lineTo(x, y); } g.lineWidth = 26; g.strokeStyle = 'rgba(125,255,74,.45)'; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#f4ffe0'; g.stroke(); } g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(impSil('chars', '#020a02'), sh * OUT.scale, 0); g.restore(); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 900, '#b8ff8a', .5); g.restore();
};
IMPACT.bonexray = (c, g, f, p, k, n) => {   // bones white on black (forearm radius + ulna, skull), a white crack-star at the focus that does NOT break the bone
  fillAll(g, '#040810'); g.save(); g.globalCompositeOperation = 'screen'; rawDraw(g, impSil('chars', '#1a2a44'), 0, 0, .7); g.restore();
  const it = f._figs[p.fig == null ? f._figs.length - 1 : p.fig]; if (it) { const tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(it.F, tf); hyiBones(g, S); const J = S.J, sd = p.side || 'R';
    for (const off of [-.012, .012]) { const a = project(vAdd(J['el' + sd], [0, off * 2, 0])), b = project(vAdd(J['wr' + sd], [0, off * 2, 0])); if (a && b) { g.save(); g.strokeStyle = '#f4f8ff'; g.lineCap = 'round'; g.lineWidth = Math.max(4, .022 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); } } }
  const q = hyiFocus(f, p); g.save(); g.fillStyle = '#ffffff'; polyPath(g, hyJag(q.x, q.y, 18 + k * 6, 110 + k * 30, 8, 4 + k)); g.fill(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 240, '#9ad8ff', .7); g.restore();
};
IMPACT.stillripple = (c, g, f, p, k, n) => {   // monochrome frame, concentric ripples freeze and vanish in one frame; p.big = white frame where all motion stops
  if (p.big) { fillAll(g, '#ffffff'); rawDraw(g, impFigs(f, '#ffffff', '#0b0b0b', 1.6)); return; }
  rawDraw(g, filtered(c, 'grayscale(1) contrast(1.2)')); if (k >= n - 1) return; const q = hyiFocus(f, p); g.save(); for (let i = 1; i <= 5; i++) { g.beginPath(); g.ellipse(q.x, q.y, i * 120, i * 40, 0, 0, TAU); g.lineWidth = 6; g.strokeStyle = rgba('#ffffff', .9 - i * .12); g.stroke(); } g.restore();
};
IMPACT.ogreeye = (c, g, f, p, k, n) => {   // x-ray ink anatomy diagram, one organ glows red, ink arrows + annotation lines (manga explanation panel)
  fillAll(g, HYI.paper); rawDraw(g, impFigs(f, HYI.paper, HYI.ink, 1.6)); const it = f._figs[p.fig == null ? 0 : p.fig]; if (!it) return; const tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(it.F, tf); g.save(); g.globalAlpha = .5; hyiBones(g, S); g.restore();
  const tgt = project(S.J[p.joint || 'abd']); if (!tgt) return; g.save(); g.globalCompositeOperation = 'multiply'; glow(g, tgt.x, tgt.y, 120, '#ff1a2a', .95); g.restore(); g.fillStyle = HYI.red; g.beginPath(); g.ellipse(tgt.x, tgt.y, 46, 34, .3, 0, TAU); g.fill();
  g.save(); g.strokeStyle = HYI.ink; g.lineWidth = 5; g.lineCap = 'round'; for (const [dx, dy] of [[-420, -260], [380, -300], [420, 200]]) { g.beginPath(); g.moveTo(tgt.x + dx, tgt.y + dy); g.lineTo(tgt.x + dx * .2, tgt.y + dy * .2); g.stroke(); const a = Math.atan2(-dy, -dx); g.beginPath(); g.moveTo(tgt.x + dx * .2, tgt.y + dy * .2); g.lineTo(tgt.x + dx * .2 - Math.cos(a - .4) * 30, tgt.y + dy * .2 - Math.sin(a - .4) * 30); g.moveTo(tgt.x + dx * .2, tgt.y + dy * .2); g.lineTo(tgt.x + dx * .2 - Math.cos(a + .4) * 30, tgt.y + dy * .2 - Math.sin(a + .4) * 30); g.stroke(); g.beginPath(); g.moveTo(tgt.x + dx - 90, tgt.y + dy); g.lineTo(tgt.x + dx + 90, tgt.y + dy); g.stroke(); } g.restore();
};
IMPACT.spiralredirect = (c, g, f, p, k, n) => {   // two ink spirals (taiji), a green force arrow winds along and turns back; white ground
  fillAll(g, '#f8f4ec'); const q = hyiFocus(f, p); g.save(); g.lineCap = 'round'; for (const sg of [1, -1]) { g.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU * 2.2, r = 20 + i * 3.2; g.lineTo(q.x + sg * 160 + Math.cos(a * sg + (sg > 0 ? 0 : Math.PI)) * r, q.y + Math.sin(a * sg + (sg > 0 ? 0 : Math.PI)) * r * .8); } g.lineWidth = 22 - 8 * (sg < 0); g.strokeStyle = HYI.ink; g.stroke(); }
  const u = Math.min(1, (k + 1) / n), pts = []; for (let i = 0; i <= 60 * u; i++) { const a = i / 60 * TAU * 1.6, r = 360 - i * 4; pts.push([q.x + 160 + Math.cos(a) * r, q.y + Math.sin(a) * r * .8]); } if (pts.length > 1) { polyPath(g, pts, false); g.lineWidth = 26; g.strokeStyle = '#4fc72a'; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#e8ffd0'; g.stroke(); const e = pts[pts.length - 1], e2 = pts[Math.max(0, pts.length - 4)], a = Math.atan2(e[1] - e2[1], e[0] - e2[0]); g.fillStyle = '#4fc72a'; g.beginPath(); g.moveTo(e[0] + Math.cos(a) * 50, e[1] + Math.sin(a) * 50); g.lineTo(e[0] + Math.cos(a + 2.4) * 40, e[1] + Math.sin(a + 2.4) * 40); g.lineTo(e[0] + Math.cos(a - 2.4) * 40, e[1] + Math.sin(a - 2.4) * 40); g.fill(); }
  g.restore(); rawDraw(g, impSil('chars', HYI.ink), 0, 0, .9);
};
IMPACT.giantoni = (c, g, f, p, k, n) => {   // full-frame ink painting: a giant oni over the arena (crimson + black), a small green figure below
  fillAll(g, '#e8dccb'); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5a0a14'); gr.addColorStop(.7, '#c4122a'); gr.addColorStop(1, '#2a0408'); g.save(); g.globalAlpha = .85; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.fillStyle = '#0b0b0b'; g.beginPath(); g.moveTo(W * .1, H); g.quadraticCurveTo(W * .12, H * .35, W * .3, H * .28); g.quadraticCurveTo(W * .38, H * .02, W * .5, H * .05); g.quadraticCurveTo(W * .62, H * .02, W * .7, H * .28); g.quadraticCurveTo(W * .88, H * .35, W * .9, H); g.closePath(); g.fill(); g.restore();
  g.save(); g.translate(W / 2, H * .32); g.scale(.42, .42); g.translate(-W / 2, -H / 2); hyOniFaceDraw(g, W / 2, H / 2, 600, 1, k); g.restore();
  g.save(); g.fillStyle = '#2a1010'; g.beginPath(); g.ellipse(W / 2, H * .94, W * .4, 40, 0, 0, TAU); g.fill(); g.fillStyle = '#4fc72a'; g.beginPath(); g.ellipse(W / 2, H * .89, 16, 34, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(W / 2, H * .85, 11, 0, TAU); g.fill(); g.restore();
};
IMPACT.shrinksil = (c, g, f, p, k, n) => {   // a big green silhouette shrinks to a small human one over 3 frames (overlapping outlines), green -> skin
  fillAll(g, '#0a0a0c'); const it = f._figs.find(q => /hulk/i.test(q.F.design.name || '')) || f._figs[0]; const q = hyiFocus(f, p), u = n > 1 ? k / (n - 1) : 1, col = mixHex('#4fc72a', '#d9b49a', u);
  const sil = impSil('chars', col); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const s = OUT.scale; for (let j = 0; j <= k; j++) { const sc = 1 - .4 * (j / Math.max(1, n - 1)); g.globalAlpha = j === k ? 1 : .3; g.translate(q.x * s, (q.y + 260) * s); g.scale(sc, sc); g.translate(-q.x * s, -(q.y + 260) * s); g.drawImage(sil, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0); } g.restore();
};
IMPACT.onifist = (c, g, f, p, k, n) => {   // fist in the foreground with a translucent oni face over it, white speed lines behind
  rawDraw(g, filtered(c, 'grayscale(.7) contrast(1.3) brightness(.8)')); const q = hyiFocus(f, p); hyiLines(g, q, 80, rgba('#ffffff', .85), 260, 5, 3 + k);
  g.save(); g.globalAlpha = .55; g.translate(q.x, q.y); g.scale(.45, .45); g.translate(-W / 2, -H / 2); hyOniFaceDraw(g, W / 2, H / 2, 600, 1, k); g.restore(); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 300, '#ff3a3a', .45); g.restore();
};
Object.assign(IMPACT_SEQ, {
  WORLD_BREAKER: [{ s: 'flash', n: 1, p: { col: '#e8ffd0' } }, { s: 'worldbreaker', n: 3 }],
  BONE_XRAY: [{ s: 'bonexray', n: 3 }],
  STILL_RIPPLE: [{ s: 'stillripple', n: 2 }, { s: 'stillripple', n: 1, p: { big: true } }],
  OGRE_EYE: [{ s: 'ogreeye', n: 3 }], SPIRAL_REDIRECT: [{ s: 'spiralredirect', n: 3 }], GIANT_ONI_VISION: [{ s: 'giantoni', n: 3 }],
  SHRINK_SILHOUETTE: [{ s: 'shrinksil', n: 3 }], ONI_FIST: [{ s: 'onifist', n: 3 }],
});
