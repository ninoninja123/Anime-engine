/* engine/impact_nl.js (agent E, naruto-vs-luffy) - impact styles + sequences (graphic, hand2d lineart, lines >= 3 px @1080).
   STYLES IMPACT[name](comp, g, f, p, k, n), focus = p.at (world) | p.x,p.y | figures' centre:
     rasenswirl   deep-blue negative, figures black with cyan rim, a spiral of white wind strokes screwing into the focus
     windcuts     white frame, thousands of fine black needle cuts radiating, figures in black lineart (Rasenshuriken)
     kuramagold   gold/orange duotone, black silhouettes with flame rim, a giant fox eye (slit) opens behind (p.eye 0..1)
     sageeyes     orange-red frame: extreme close on the eyes (closeup) with the toad pigment, orange multiply (p.fig)
     clonewall    paper-white frame filled with rows of orange silhouettes of the figure (shadow clone army), kanji 多重影分身 (p.text)
     baryonred    red monochrome + orange motes rising, figures black with red-white rim
     hakicrack    black frame, red rim silhouettes, black lightning with red glow across the frame, cracks from the focus
     gomustretch  the frame is stretched / smeared horizontally from the focus (rubber), speed lines, a 'snap' outline (p.dir 1|-1)
     toonpop      Gear 5 cartoon: bright pastel posterise, chunky purple outline around the figures, rainbow rays, stars, p.text bubble word
     drumbeat     pink-white heartbeat rings 'DON DON', figures white silhouettes on violet (Drums of Liberation)
     nlsplit      two-colour diagonal split (orange Naruto side | red Luffy side), figures negative (p.ang)
   SEQUENCES: RASENGAN_SPIRAL RASENSHURIKEN_CUTS CLONE_WALL SAGE_EYES KURAMA_GOLD BARYON_RED HAKI_CRACK CONQUEROR_HAKI GOMU_STRETCH GEAR_SECOND_STEAM GIANT_FIST
     GEAR_FOURTH TOON_POP DRUMS_DON NL_CLASH  + character series nar_rasengan nar_shuriken nar_clones nar_sage nar_kurama nar_baryon luf_pistol luf_gatling luf_gear2
     luf_gear3 luf_gear4 luf_gear5 luf_haki clash_nl                                                                                                          */
'use strict';
const NLI = { blue: '#1a4ad8', cyan: '#8ae8ff', orange: '#ff8a1a', gold: '#ffc72a', red: '#e8242a', ink: '#0c0a0e', paper: '#f4efe4', violet: '#5a2a9a', pink: '#ff7ab8' };
function nliRays(g, q, n, col, inner, w = 4, seed = 3, len = 2600) { const r = rng(seed); g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { const a = r() * TAU, r0 = inner * (.8 + r() * .6), ww = w * (.4 + r()); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * len + Math.cos(a + HP) * ww * 6, q.y + Math.sin(a) * len + Math.sin(a + HP) * ww * 6); g.lineTo(q.x + Math.cos(a) * len - Math.cos(a + HP) * ww * 6, q.y + Math.sin(a) * len - Math.sin(a + HP) * ww * 6); g.closePath(); g.fill(); } g.restore(); }
function nliRim(g, ink, rim, d = 6) { g.save(); for (const [dx, dy] of [[-d, -d], [d, -d], [-d, d], [d, d]]) rawDraw(g, impSil('chars', rim), dx * .5, dy * .5, .85); g.restore(); rawDraw(g, impSil('chars', ink)); }
IMPACT.rasenswirl = (c, g, f, p, k) => {
  const t = filtered(c, 'grayscale(1) invert(1) contrast(1.6) brightness(.9)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#3a7aff'; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 700, '#4ab4ff', .7); glow(g, q.x, q.y, 220, '#ffffff', .95); g.restore();
  g.save(); g.lineCap = 'round'; for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU + k * .5, pts = []; for (let j = 0; j <= 30; j++) { const u = j / 30, an = a0 + u * 5, r = 40 + u * 1300; pts.push([q.x + Math.cos(an) * r, q.y + Math.sin(an) * r * .85]); }
    g.strokeStyle = i % 2 ? 'rgba(255,255,255,.9)' : 'rgba(140,220,255,.75)'; g.lineWidth = 3 + (i % 3) * 3; g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); } g.restore();
  nliRim(g, NLI.ink, NLI.cyan, 8);
};
IMPACT.windcuts = (c, g, f, p, k) => {
  fillAll(g, '#f6f8fc'); const q = impFocus(f, p), r = rng(17 + k); g.save(); g.strokeStyle = NLI.ink; g.lineCap = 'round';
  for (let i = 0; i < 900; i++) { const a = r() * TAU, d = 60 + Math.pow(r(), .7) * 1300, L = 18 + r() * 60, a2 = a + .5 + r() * .6; g.lineWidth = .8 + r() * 2.2; const x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a2) * L, y + Math.sin(a2) * L); g.stroke(); }
  g.restore(); g.save(); g.globalCompositeOperation = 'multiply'; glow(g, q.x, q.y, 500, '#8ad0ff', .6); g.restore(); rawDraw(g, impFigs(f, '#ffffff', NLI.ink, 2.2));
  g.save(); g.strokeStyle = '#3a8aff'; g.lineWidth = 6; g.beginPath(); g.arc(q.x, q.y, 260 + k * 60, 0, TAU); g.stroke(); g.restore();
};
IMPACT.kuramagold = (c, g, f, p, k) => {
  const t = filtered(c, 'grayscale(1) contrast(1.5) brightness(1.25)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffd23a'); gr.addColorStop(1, '#ff6a10'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p), eye = p.eye == null ? 1 : p.eye; if (eye > 0) { const ex = W / 2, ey = H * .4, rw = 760, rh = 230 * eye; g.save(); g.fillStyle = '#ff3a10'; g.beginPath(); g.moveTo(ex - rw, ey); g.quadraticCurveTo(ex, ey - rh * 2, ex + rw, ey); g.quadraticCurveTo(ex, ey + rh * 2, ex - rw, ey); g.fill(); g.lineWidth = 14; g.strokeStyle = NLI.ink; g.stroke();
    g.fillStyle = NLI.ink; g.beginPath(); g.ellipse(ex, ey, 48, rh * .95, 0, 0, TAU); g.fill(); g.restore(); }
  nliRays(g, q, 50, 'rgba(30,10,0,.55)', 300, 4, 5 + k); nliRim(g, NLI.ink, '#fff2a0', 10);
};
IMPACT.sageeyes = (c, g, f, p, k) => { IMPACT.closeup(c, g, f, Object.assign({ part: 'eye', strip: true, stripH: 300, dist: .3 }, p), k); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,170,90,.55)'; g.fillRect(0, 0, W, H); g.restore(); };
IMPACT.clonewall = (c, g, f, p, k) => {
  fillAll(g, NLI.paper); const sil = impSil('chars', NLI.orange), ink = impSil('chars', NLI.ink); const rows = 4, per = 7;
  for (let rI = 0; rI < rows; rI++) for (let i = 0; i < per; i++) { const sc = .32 + rI * .1, x = (i - (per - 1) / 2) * W / per * 1.05 + (rI % 2) * 90, y = -H * .05 + rI * H * .18; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const sx = g.canvas.width / W; g.translate(g.canvas.width / 2 + x * sx, y * sx); g.scale(sc, sc); g.translate(-g.canvas.width / 2, 0); g.globalAlpha = .55 + rI * .12; g.drawImage(ink, 3, 3); g.drawImage(sil, 0, 0); g.restore(); }
  rawDraw(g, ink, 6, 6); rawDraw(g, impSil('chars', '#ffb050'));
  g.save(); g.font = '230px "Yuji Boku", "Dela Gothic One", serif'; g.textAlign = 'right'; g.fillStyle = NLI.ink; const txt = p.text || '多重影分身'; for (let i = 0; i < txt.length; i++) g.fillText(txt[i], W - 60, 230 + i * 210); g.restore();
};
IMPACT.baryonred = (c, g, f, p, k) => {
  const t = filtered(c, 'grayscale(1) contrast(1.7) brightness(.8)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e82a1a'; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p), r = rng(7 + k); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 80; i++) { const x = r() * W, y = r() * H; glow(g, x, y, 10 + r() * 30, i % 3 ? '#ff7a2a' : '#ffe0a0', .7); } glow(g, q.x, q.y, 500, '#ff5a1a', .6); g.restore();
  nliRim(g, NLI.ink, '#ffd0b0', 8);
};
IMPACT.hakicrack = (c, g, f, p, k) => {
  fillAll(g, '#07050a'); const q = impFocus(f, p), r = rng(23 + k);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; for (let i = 0; i < 14; i++) { const a = r() * TAU, L = 500 + r() * 900, pts = [[q.x, q.y]]; for (let j = 1; j <= 8; j++) { const u = j / 8, off = (r() - .5) * 160; pts.push([q.x + Math.cos(a) * L * u + Math.cos(a + HP) * off, q.y + Math.sin(a) * L * u + Math.sin(a + HP) * off]); }
    const path = () => { g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); }; g.globalCompositeOperation = 'lighter'; path(); g.strokeStyle = 'rgba(255,30,60,.8)'; g.lineWidth = 22; g.stroke(); g.globalCompositeOperation = 'source-over'; path(); g.strokeStyle = '#000'; g.lineWidth = 9; g.stroke(); path(); g.strokeStyle = 'rgba(255,120,140,.9)'; g.lineWidth = 2; g.stroke(); }
  g.restore(); nliRim(g, '#000000', '#ff2040', 10); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 300, '#ff2040', .5); g.restore();
};
IMPACT.gomustretch = (c, g, f, p, k) => {
  const q = impFocus(f, p), dir = p.dir || 1, s = 1.25 + k * .35, src = copyComp(c);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const sx = g.canvas.width / W, qx = q.x * sx; g.translate(qx, 0); g.scale(s * dir, 1 / (1 + k * .08)); g.translate(-qx, 0); g.drawImage(src, 0, 0); g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineCap = 'round'; const r = rng(9 + k); for (let i = 0; i < 40; i++) { const y = r() * H, x0 = r() * W, L = 200 + r() * 600; g.lineWidth = 2 + r() * 6; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + L * dir, y); g.stroke(); } g.restore();
};
IMPACT.toonpop = (c, g, f, p, k) => {
  const t = filtered(c, 'saturate(2.2) contrast(1.25) brightness(1.18)'); rawDraw(g, t); const q = impFocus(f, p);
  g.save(); g.globalAlpha = .55; const cols = ['#ff7ab8', '#ffe14a', '#7ad8ff', '#b07aff', '#7affb0']; for (let i = 0; i < 24; i++) { const a0 = i / 24 * TAU + k * .2, a1 = a0 + TAU / 48; g.fillStyle = cols[i % cols.length]; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(a0) * 2400, q.y + Math.sin(a0) * 2400); g.lineTo(q.x + Math.cos(a1) * 2400, q.y + Math.sin(a1) * 2400); g.closePath(); g.fill(); } g.restore();
  const pur = impSil('chars', '#2a1a4a'); for (const [dx, dy] of [[-9, 0], [9, 0], [0, -9], [0, 9], [-6, -6], [6, 6], [6, -6], [-6, 6]]) rawDraw(g, pur, dx, dy); rawDraw(g, layer('chars'));
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + k, d = 380 + 60 * Math.sin(i * 2 + k); const x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .6, r = 44; g.save(); g.translate(x, y); g.rotate(a + k); g.fillStyle = i % 2 ? '#ffe14a' : '#ffffff'; g.strokeStyle = '#2a1a4a'; g.lineWidth = 7; g.beginPath(); for (let j = 0; j < 10; j++) { const aa = j / 10 * TAU - HP, rr = j % 2 ? r * .45 : r; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
  if (p.text !== false && typeof fxBoing === 'function') fxBoing(g, .25 + k * .05, { text: p.text || 'BOING!', x: p.tx || (q.x < W / 2 ? q.x + 520 : q.x - 520), y: p.ty || 230, size: 190, dur: 1 });
};
IMPACT.drumbeat = (c, g, f, p, k) => {
  fillAll(g, '#3a1a6a'); const q = impFocus(f, p); g.save(); for (let i = 0; i < 6; i++) { const r = 120 + i * 190 + k * 60; g.strokeStyle = i % 2 ? '#ff9ad0' : '#ffffff'; g.lineWidth = 26 - i * 3; g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.stroke(); } g.restore();
  rawDraw(g, impSil('chars', '#ffffff')); g.save(); g.font = '200px "Dela Gothic One", sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; for (const [x, y, rot] of [[W * .18, H * .3, -.2], [W * .82, H * .72, .15]]) { g.save(); g.translate(x, y); g.rotate(rot); g.lineWidth = 26; g.strokeStyle = '#2a1a4a'; g.strokeText('ドン', 0, 0); g.fillStyle = '#ffe14a'; g.fillText('ドン', 0, 0); g.restore(); } g.restore();
};
IMPACT.nlsplit = (c, g, f, p, k) => IMPACT.dualsplit(c, g, f, Object.assign({ col: '#ff8a1a', col2: '#e8242a', ang: .22 }, p), k);
Object.assign(IMPACT_SEQ, {
  RASENGAN_SPIRAL: [{ s: 'flash', n: 1, p: { col: '#e8f8ff' } }, { s: 'rasenswirl', n: 3 }],
  RASENSHURIKEN_CUTS: [{ s: 'flash', n: 1 }, { s: 'windcuts', n: 3 }, { s: 'invert', n: 1 }],
  CLONE_WALL: [{ s: 'clonewall', n: 3 }],
  SAGE_EYES: [{ s: 'sageeyes', n: 3 }],
  KURAMA_GOLD: [{ s: 'flash', n: 1, p: { col: '#fff2a0' } }, { s: 'kuramagold', n: 3 }],
  BARYON_RED: [{ s: 'baryonred', n: 3 }],
  HAKI_CRACK: [{ s: 'black', n: 1 }, { s: 'hakicrack', n: 2 }],
  CONQUEROR_HAKI: [{ s: 'hakicrack', n: 3 }, { s: 'invert', n: 1 }],
  GOMU_STRETCH: [{ s: 'gomustretch', n: 2 }, { s: 'flash', n: 1 }],
  GEAR_SECOND_STEAM: [{ s: 'flash', n: 1, p: { col: '#ffd0d0' } }, { s: 'speedburst', n: 2 }],
  GIANT_FIST: [{ s: 'flash', n: 1 }, { s: 'comicpow', n: 2, p: { text: 'DOOM!', kind: 'purple' } }],
  GEAR_FOURTH: [{ s: 'black', n: 1 }, { s: 'hakicrack', n: 1 }, { s: 'redblack', n: 2 }],
  TOON_POP: [{ s: 'toonpop', n: 3 }],
  DRUMS_DON: [{ s: 'drumbeat', n: 2 }, { s: 'flash', n: 1, p: { col: '#ffffff' } }],
  NL_CLASH: [{ s: 'flash', n: 1 }, { s: 'nlsplit', n: 2 }, { s: 'speedburst', n: 1 }],
  nar_rasengan: [{ s: 'flash', n: 1 }, { s: 'rasenswirl', n: 2 }, { s: 'speedburst', n: 1 }],
  nar_shuriken: [{ s: 'flash', n: 1 }, { s: 'windcuts', n: 3 }],
  nar_clones: [{ s: 'clonewall', n: 2 }],
  nar_sage: [{ s: 'sageeyes', n: 3 }],
  nar_kurama: [{ s: 'kuramagold', n: 3 }],
  nar_baryon: [{ s: 'black', n: 1 }, { s: 'baryonred', n: 3 }],
  luf_pistol: [{ s: 'gomustretch', n: 2 }, { s: 'speedburst', n: 1 }],
  luf_gatling: [{ s: 'speedburst', n: 1 }, { s: 'gomustretch', n: 1 }, { s: 'speedburst', n: 1 }],
  luf_gear2: [{ s: 'flash', n: 1, p: { col: '#ffd0d0' } }, { s: 'speedburst', n: 2 }],
  luf_gear3: [{ s: 'flash', n: 1 }, { s: 'comicpow', n: 2, p: { text: 'DOOM!', kind: 'purple' } }],
  luf_gear4: [{ s: 'black', n: 1 }, { s: 'redblack', n: 2 }],
  luf_gear5: [{ s: 'toonpop', n: 3 }],
  luf_haki: [{ s: 'hakicrack', n: 2 }],
  clash_nl: [{ s: 'flash', n: 1 }, { s: 'nlsplit', n: 2 }, { s: 'hakicrack', n: 1 }],
});
// ================================================================================================ pre/shots.json impact names (P, meta.impact_styles)
function nliSkel(f) { return f._figs.map(it => figSkel(it.F, it.opt.t != null ? it.opt.t : f.lt)); }
function nliStar(g, x, y, r0, r1, n, col, ink, lw, rot = 0) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, r = i % 2 ? r0 : r1 * (.85 + .3 * hash(i * 3 + n)); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fillStyle = col; g.fill(); if (ink) { g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); } }
function nliWord(g, txt, x, y, size, fill, ink, rot = -.1, font = '"Bangers", sans-serif') { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; for (let d = 14; d > 0; d -= 4) { g.fillStyle = ink; g.fillText(txt, d, d); } g.lineWidth = size * .16; g.strokeStyle = ink; g.strokeText(txt, 0, 0); g.fillStyle = fill; g.fillText(txt, 0, 0); g.restore(); }
IMPACT.smokeburst = (c, g, f, p, k) => {   // shadow-clone POOF sea: white, orange-tinted smoke balls in lineart, figures black
  fillAll(g, '#fffaf2'); const q = impFocus(f, p), r = rng(31 + (p.seed || 0));
  for (let i = 0; i < 46; i++) { const a = r() * TAU, d = Math.pow(r(), .6) * 1100 * (.6 + k * .25), R = 70 + r() * 150; if (typeof nlPuff === 'function') nlPuff(g, q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .7, R, i, i % 4 ? '#ffffff' : '#ffd8b0', '#1a1418', 1); }
  rawDraw(g, impSil('chars', NLI.ink)); nliRays(g, q, 24, 'rgba(255,138,26,.5)', 260, 3, 9 + k);
};
IMPACT.powercard = (c, g, f, p, k) => {   // character power-card hit: coloured negative + emblem + brush kanji flash
  const L = p.who === 'luffy', t = filtered(c, 'grayscale(1) invert(1) contrast(1.5)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = L ? '#e8241a' : '#ff8a1a'; g.fillRect(0, 0, W, H); g.restore();
  const cx = W * (L ? .3 : .7), cy = H * .45; g.save(); g.globalAlpha = .85; if (L) nlEmblem(g, { x: cx, y: cy }, 230, false, [0, 0, 0], { fog: '#000', haze: 0 }); else nlLeaf(g, cx, cy, 260, '#1a0a02', 34); g.restore();
  g.save(); g.font = '210px "Yuji Boku", "IPAGothic", serif'; g.textAlign = 'center'; g.lineJoin = 'round'; const kj = p.kanji || (L ? '五皇' : '七代目火影'); const x = L ? W - 170 : 170; for (let i = 0; i < kj.length; i++) { g.lineWidth = 22; g.strokeStyle = '#ffffff'; g.strokeText(kj[i], x, 230 + i * 200); g.fillStyle = '#0a0606'; g.fillText(kj[i], x, 230 + i * 200); } g.restore();
  rawDraw(g, impSil('chars', '#0a0606')); if (p.vs && k >= 1) nliWord(g, 'VS', W / 2, H / 2, 300, '#ffffff', '#0a0606', 0, '"Dela Gothic One", sans-serif');
};
IMPACT.twirl = (c, g, f, p, k) => {   // RASEN_SPIRAL: the frame twists into a spiral round the focus, blue core, white wind rings
  const q = impFocus(f, p), src = copyComp(c), sx = g.canvas.width / W, R = 1300, N = 64, amt = (p.amt || 1.5) * (.6 + k * .4);
  fillAll(g, '#0a1a4a'); for (let i = N; i >= 1; i--) { const r1 = R * i / N, r0 = R * (i - 1) / N, ang = amt * Math.pow(1 - (r0 + r1) / 2 / R, 2); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.arc(q.x * sx, q.y * sx, r1 * sx, 0, TAU); g.arc(q.x * sx, q.y * sx, r0 * sx, 0, TAU, true); g.clip(); g.translate(q.x * sx, q.y * sx); g.rotate(ang); g.translate(-q.x * sx, -q.y * sx); g.drawImage(src, 0, 0); g.restore(); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#9ac8ff'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 420, '#3a9aff', .9); glow(g, q.x, q.y, 140, '#ffffff', 1); g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { const r = 160 + i * 150 + k * 40; g.lineWidth = 10 - i; g.beginPath(); g.ellipse(q.x, q.y, r, r * .45, k * .4 + i, .3, 2.6); g.stroke(); } g.restore();
};
IMPACT.sagefull = (c, g, f, p, k) => {   // SAGE_EYES: the eyes fill the frame (orange pigment, yellow iris, horizontal pupil); p.neg = negative frame
  fillAll(g, '#f2c8a0'); const cy = H * .5;
  for (const sg of [-1, 1]) { const ex = W / 2 + sg * 470; g.save(); g.fillStyle = '#e2501e'; g.beginPath(); g.moveTo(ex - 400, cy - 40); g.quadraticCurveTo(ex, cy - 330, ex + 400, cy - 60); g.quadraticCurveTo(ex, cy - 170, ex - 400, cy - 40); g.fill();
    g.beginPath(); g.moveTo(ex - 330, cy + 120); g.quadraticCurveTo(ex, cy + 230, ex + 330, cy + 110); g.quadraticCurveTo(ex, cy + 170, ex - 330, cy + 120); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(ex - 360, cy); g.quadraticCurveTo(ex, cy - 230, ex + 360, cy - 20); g.quadraticCurveTo(ex, cy + 190, ex - 360, cy); g.fill();
    g.save(); g.clip(); const gr = g.createRadialGradient(ex, cy, 20, ex, cy, 170); gr.addColorStop(0, '#fff2a8'); gr.addColorStop(.6, '#f2c230'); gr.addColorStop(1, '#a86a0a'); g.fillStyle = gr; g.beginPath(); g.arc(ex, cy, 170, 0, TAU); g.fill(); g.fillStyle = '#120806'; g.fillRect(ex - 120, cy - 26, 240, 52); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - 60, cy - 70, 26, 0, TAU); g.fill(); g.restore();
    g.lineWidth = 16; g.strokeStyle = '#1a0a06'; g.beginPath(); g.moveTo(ex - 360, cy); g.quadraticCurveTo(ex, cy - 230, ex + 360, cy - 20); g.stroke(); g.restore(); }
  if (p.neg) { const t = filtered(g.canvas, 'invert(1)'); rawDraw(g, t); }
};
IMPACT.gear2steam = (c, g, f, p, k) => {   // pink overexposure, steam in white lineart, heartbeat ring
  const t = filtered(c, 'brightness(1.6) saturate(.6) contrast(1.1)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ffb0c0'; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p), r = rng(5 + k); for (let i = 0; i < 20; i++) { const x = q.x + (r() - .5) * 1400, y = q.y - r() * 700, R = 50 + r() * 110; g.save(); g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.beginPath(); for (let j = 0; j < 5; j++) g.arc(x + (j - 2) * R * .55, y + (j % 2) * R * .2, R * .45, Math.PI, TAU); g.stroke(); g.restore(); }
  g.save(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 18; g.beginPath(); g.arc(q.x, q.y, 220 + k * 160, 0, TAU); g.stroke(); g.restore(); rawDraw(g, impFigs(f, '#ffd8e0', '#5a0a1a', 2));
};
IMPACT.hakiblack = (c, g, f, p, k) => {   // Armament Haki: glossy black field, red rim lightning, figure in white lineart
  fillAll(g, '#050407'); const q = impFocus(f, p); g.save(); const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(120,100,160,.25)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(.55, 'rgba(160,140,220,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  const r = rng(13 + k); g.save(); g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const side = i % 4, x0 = side === 0 ? 0 : side === 1 ? W : r() * W, y0 = side === 2 ? 0 : side === 3 ? H : r() * H, pts = [[x0, y0]]; for (let j = 1; j < 7; j++) pts.push([lerp(x0, q.x, j / 9) + (r() - .5) * 120, lerp(y0, q.y, j / 9) + (r() - .5) * 120]);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,30,60,.85)'; g.lineWidth = 14; g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#ffd0d8'; g.lineWidth = 3; g.stroke(); } g.restore();
  rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#ffffff', 2.2));
};
IMPACT.boundman = (c, g, f, p, k) => {   // Gear 4: figure swells to a frame-filling silhouette, red haki lines, steam
  fillAll(g, '#1a0606'); const q = impFocus(f, p), sil = impSil('chars', '#000000'), sx = g.canvas.width / W, s = 1.25 + k * .25;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(q.x * sx, q.y * sx); g.scale(s, s); g.translate(-q.x * sx, -q.y * sx); g.drawImage(sil, 0, 0); g.restore();
  g.save(); g.strokeStyle = '#e0242a'; g.lineWidth = 12; g.lineCap = 'round'; const r = rng(3); for (let i = 0; i < 14; i++) { const x = q.x + (r() - .5) * 900, y = q.y + (r() - .5) * 700; g.beginPath(); g.moveTo(x - 60, y); g.quadraticCurveTo(x, y - 50, x + 60, y + 10); g.stroke(); } g.restore();
  g.save(); for (let i = 0; i < 18; i++) { const x = (i + .5) / 18 * W, y = H * (.1 + .3 * hash(i + k)), R = 60 + 50 * hash(i * 3); g.fillStyle = 'rgba(255,240,240,.35)'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); } g.restore();
};
IMPACT.kcmgold = (c, g, f, p, k) => {   // golden flame field, black seal (magatama ring) flares
  const t = filtered(c, 'grayscale(1) contrast(1.3) brightness(1.4)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, '#ff7a10'); gr.addColorStop(1, '#ffe060'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(11 + k); for (let i = 0; i < 40; i++) { const x = r() * W, h = 200 + r() * 500, w = 40 + r() * 90; g.fillStyle = 'rgba(255,200,60,.25)'; g.beginPath(); g.moveTo(x - w, H); g.quadraticCurveTo(x - w * .4, H - h * .6, x + (r() - .5) * 60, H - h); g.quadraticCurveTo(x + w * .4, H - h * .6, x + w, H); g.fill(); } g.restore();
  g.save(); g.strokeStyle = '#1a0a00'; g.lineWidth = 22; const R = 260 + k * 60; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k * .3, x = q.x + Math.cos(a) * R, y = q.y + Math.sin(a) * R; g.fillStyle = '#1a0a00'; g.beginPath(); g.arc(x, y, 38, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + 38, y); g.quadraticCurveTo(x + 50, y + 70, x - 14, y + 90); g.lineTo(x - 20, y); g.fill(); } g.restore();
  nliRim(g, '#1a0a00', '#fff4b0', 8);
};
IMPACT.giantfist = (c, g, f, p, k) => {   // a giant black fist fills the frame, red haki lightning, yellow Ben-Day background
  fillAll(g, '#ffe14a'); g.save(); g.globalCompositeOperation = 'multiply'; hyiDots(g, 'rgba(220,40,30,.55)', 30, 12, W / 2, H / 2, 1, .3); g.restore();
  const s = 1 + k * .12, cx = W * (p.dir === -1 ? .62 : .42), cy = H * .52; g.save(); g.translate(cx, cy); g.scale(s, s); g.fillStyle = '#0a0808'; g.strokeStyle = '#000'; g.lineWidth = 10; g.beginPath(); g.ellipse(0, 0, 520, 400, 0, 0, TAU); g.fill();
  g.strokeStyle = '#5a4a7a'; g.lineWidth = 14; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(260, (i - 1.5) * 190, 230, 95, 0, -1.3, 1.3); g.stroke(); } g.beginPath(); g.ellipse(-120, 260, 300, 110, -.2, -2.6, -.4); g.stroke();
  g.fillStyle = 'rgba(200,180,255,.35)'; g.beginPath(); g.ellipse(-180, -220, 200, 60, -.4, 0, TAU); g.fill(); g.restore();
  g.save(); g.lineCap = 'round'; const r = rng(7 + k); for (let i = 0; i < 8; i++) { const a = r() * TAU, pts = []; for (let j = 0; j < 7; j++) pts.push([cx + Math.cos(a) * (380 + j * 110) + (r() - .5) * 90, cy + Math.sin(a) * (300 + j * 90) + (r() - .5) * 90]); g.strokeStyle = '#ff2040'; g.lineWidth = 16; g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); g.strokeStyle = '#000'; g.lineWidth = 6; g.stroke(); } g.restore();
};
IMPACT.bijudama = (c, g, f, p, k) => {   // tailed-beast bomb: black-violet sphere, white dome, negative at the edges
  const t = filtered(c, 'invert(1) grayscale(.5) contrast(1.3)'); rawDraw(g, t); const q = impFocus(f, p), R = 300 + k * 220;
  g.save(); const gr = g.createRadialGradient(q.x, q.y, R * .2, q.x, q.y, R * 2.2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  g.save(); const gb = g.createRadialGradient(q.x - R * .2, q.y - R * .2, R * .1, q.x, q.y, R); gb.addColorStop(0, '#6a3aaa'); gb.addColorStop(.6, '#1a0a2a'); gb.addColorStop(1, '#000000'); g.fillStyle = gb; g.beginPath(); g.arc(q.x, q.y, R * .7, 0, TAU); g.fill();
  g.strokeStyle = '#b07aff'; g.lineWidth = 8; g.beginPath(); g.arc(q.x, q.y, R * .7, 0, TAU); g.stroke(); g.restore(); rawDraw(g, impSil('chars', '#000000'), 0, 0, .9);
};
IMPACT.conqwave = (c, g, f, p, k) => {   // Conqueror's Haki: black-red lightning, the invisible wave as lineart rings, silhouettes fall
  const t = filtered(c, 'grayscale(1) contrast(1.6) brightness(.6)'); rawDraw(g, t); const q = impFocus(f, p);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 5; i++) { const r = 200 + i * 230 + k * 120; g.lineWidth = 6; g.setLineDash([40, 22]); g.beginPath(); g.ellipse(q.x, q.y, r, r * .55, 0, 0, TAU); g.stroke(); } g.setLineDash([]); g.restore();
  const r = rng(19 + k); g.save(); g.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = r() * TAU, pts = [[q.x, q.y]]; for (let j = 1; j < 8; j++) pts.push([q.x + Math.cos(a) * j * 150 + (r() - .5) * 110, q.y + Math.sin(a) * j * 110 + (r() - .5) * 90]);
    g.strokeStyle = 'rgba(255,30,60,.8)'; g.lineWidth = 16; g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); g.strokeStyle = '#000'; g.lineWidth = 6; g.stroke(); } g.restore();
  g.save(); g.fillStyle = '#000'; for (let i = 0; i < 12; i++) { const x = (i + .5) / 12 * W, y = H - 20, fall = clamp(k * .6 + hash(i) * .5, 0, 1.4); g.save(); g.translate(x, y); g.rotate((i % 2 ? 1 : -1) * fall); g.beginPath(); g.arc(0, -150, 34, 0, TAU); g.fill(); g.fillRect(-36, -118, 72, 120); g.restore(); } g.restore();
  rawDraw(g, impSil('chars', '#0a0204'));
};
IMPACT.conqclash = (c, g, f, p, k) => {   // two wills collide: sky splits black-red | gold, white core, lightning
  const q = impFocus(f, p), a = p.ang == null ? .18 : p.ang; g.save(); g.fillStyle = '#ffb21e'; g.fillRect(0, 0, W, H); g.beginPath(); g.moveTo(q.x - Math.tan(a) * H - 40, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(q.x + Math.tan(a) * H + 40, H); g.closePath(); g.fillStyle = '#120206'; g.fill(); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 520, '#ffffff', 1); glow(g, q.x, q.y, 900, '#ff4060', .4); g.restore();
  const r = rng(29 + k); g.save(); g.lineCap = 'round'; for (let i = 0; i < 16; i++) { const an = r() * TAU, L = 400 + r() * 900, pts = [[q.x, q.y]]; for (let j = 1; j <= 7; j++) pts.push([q.x + Math.cos(an) * L * j / 7 + (r() - .5) * 100, q.y + Math.sin(an) * L * j / 7 + (r() - .5) * 100]); const left = Math.cos(an) < 0;
    g.strokeStyle = left ? 'rgba(255,240,180,.9)' : 'rgba(255,30,60,.9)'; g.lineWidth = 14; g.beginPath(); pts.forEach((pp, j) => j ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1])); g.stroke(); g.strokeStyle = left ? '#5a2a00' : '#000'; g.lineWidth = 5; g.stroke(); } g.restore();
  rawDraw(g, impSil('chars', '#000000'));
};
IMPACT.shurikenfull = (c, g, f, p, k) => {   // RASENSHURIKEN: white shuriken silhouette, blue core, radial wind blades on black
  fillAll(g, '#020308'); const q = impFocus(f, p), rot = k * .5; g.save(); g.translate(q.x, q.y); g.rotate(rot); g.scale(1, .62);
  for (let b = 0; b < 4; b++) { g.save(); g.rotate(b * TAU / 4); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(60, -80); g.quadraticCurveTo(600, -240, 1050, -20); g.quadraticCurveTo(560, 40, 60, 90); g.closePath(); g.fill(); g.restore(); } g.restore();
  g.save(); g.strokeStyle = 'rgba(160,220,255,.7)'; const r = rng(4 + k); for (let i = 0; i < 160; i++) { const a = r() * TAU, d0 = 200 + r() * 600, L = 80 + r() * 260; g.lineWidth = 1.5 + r() * 3; g.beginPath(); g.moveTo(q.x + Math.cos(a) * d0, q.y + Math.sin(a) * d0); g.lineTo(q.x + Math.cos(a + .25) * (d0 + L), q.y + Math.sin(a + .25) * (d0 + L)); g.stroke(); } g.restore();
  if (typeof nlSwirl === 'function') nlSwirl(g, q.x, q.y, 130, k * .2, ['#2a8cff', '#9ad8ff', '#ffffff']); rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#ffffff', 1.8), 0, 0, .8);
};
IMPACT.nikaburst = (c, g, f, p, k) => {   // Gear 5: bright white + pastel, cloud swirls in lineart, sun rays
  fillAll(g, '#fffdf6'); const q = impFocus(f, p); g.save(); const cols = ['#f4e0ff', '#fff4b0', '#e0f4ff']; for (let i = 0; i < 30; i++) { const a0 = i / 30 * TAU + k * .1; g.fillStyle = cols[i % 3]; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(a0) * 2400, q.y + Math.sin(a0) * 2400); g.lineTo(q.x + Math.cos(a0 + .1) * 2400, q.y + Math.sin(a0 + .1) * 2400); g.fill(); } g.restore();
  g.save(); g.strokeStyle = '#7a5ab8'; g.lineWidth = 7; g.lineCap = 'round'; const r = rng(2 + k); for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, R = 50 + r() * 90; g.beginPath(); for (let j = 0; j <= 30; j++) { const an = j / 30 * TAU * 1.6, rr = R * (1 - j / 40); j ? g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : g.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.stroke(); } g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 600, '#ffe8a0', .6); g.restore(); const pur = impSil('chars', '#3a2a6a'); for (const [dx, dy] of [[-8, 0], [8, 0], [0, -8], [0, 8]]) rawDraw(g, pur, dx, dy); rawDraw(g, impSil('chars', '#ffffff'));
};
IMPACT.rubberworld = (c, g, f, p, k) => {   // the whole frame stretches and waves (strip mesh-warp), concentric rubber lines, bright colours
  const src = filtered(c, 'saturate(1.8) brightness(1.1)'), cpy = copyComp(src), sx = g.canvas.width / W, N = 36, q = impFocus(f, p); fillAll(g, '#fff4d8');
  for (let i = 0; i < N; i++) { const y0 = i / N * H, h = H / N + 1, off = Math.sin(i / N * TAU * 1.5 + k * 1.7) * 70 * (1 + k * .3), scy = 1 + .25 * Math.sin(i * .7 + k); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(0, y0 * sx, g.canvas.width, h * sx); g.clip(); g.translate(off * sx, 0); g.drawImage(cpy, 0, 0); g.restore(); }
  g.save(); g.strokeStyle = 'rgba(42,26,74,.75)'; g.lineWidth = 8; for (let i = 0; i < 6; i++) { const r = 140 + i * 170 + k * 50; g.beginPath(); for (let j = 0; j <= 48; j++) { const an = j / 48 * TAU, rr = r * (1 + .07 * Math.sin(an * 6 + k * 3)); j ? g.lineTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr * .7) : g.moveTo(q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr * .7); } g.stroke(); } g.restore();
};
IMPACT.squashstretch = (c, g, f, p, k) => {   // frame 1 squashed flat, frame 2 stretched tall, SPLAT star
  const src = copyComp(c), sx = g.canvas.width / W, q = impFocus(f, p), flat = (k % 2) === 0; fillAll(g, '#ffe14a');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(q.x * sx, q.y * sx); g.scale(flat ? 1.35 : .72, flat ? .62 : 1.4); g.translate(-q.x * sx, -q.y * sx); g.drawImage(src, 0, 0); g.restore();
  nliStar(g, q.x + 300, q.y - 230, 70, 190, 9, '#ff3a5a', '#2a1a4a', 8, k); nliWord(g, p.text || 'SPLAT!', q.x + 300, q.y - 230, 120, '#ffffff', '#2a1a4a', -.15);
};
IMPACT.cartoonxray = (c, g, f, p, k) => {   // cartoon electrocution: black frame, white skeleton flashes, yellow bolts (alternating frames)
  const on = (k % 2) === 0; if (!on) { const t = filtered(c, 'brightness(1.4) saturate(1.5)'); rawDraw(g, t); } else fillAll(g, '#050505');
  const Ss = nliSkel(f); g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const S of Ss) { if (on) rawDraw(g, impSil('chars', '#2a3a8a'), 0, 0, .45); const J = S.J, P2b = j => project(J[j]); const bones = [['pelvis', 'abd'], ['abd', 'neck'], ['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'], ['hipL', 'knL'], ['knL', 'anL'], ['hipR', 'knR'], ['knR', 'anR'], ['shL', 'shR'], ['hipL', 'hipR']];
    if (!on) continue; g.strokeStyle = '#ffffff'; for (const [a, b] of bones) { const qa = P2b(a), qb = P2b(b); if (!qa || !qb) continue; g.lineWidth = Math.max(6, .05 * qa.s); g.beginPath(); g.moveTo(qa.x, qa.y); g.lineTo(qb.x, qb.y); g.stroke(); g.fillStyle = '#fff'; for (const qq of [qa, qb]) { g.beginPath(); g.arc(qq.x, qq.y, g.lineWidth * .9, 0, TAU); g.fill(); } }
    for (let i = 0; i < 4; i++) { const qa = P2b('abd'), qn = P2b('neck'); if (!qa || !qn) break; const y = lerp(qa.y, qn.y, .2 + i * .22); g.lineWidth = 5; g.beginPath(); g.ellipse(lerp(qa.x, qn.x, .2 + i * .22), y, .12 * qa.s, .03 * qa.s, 0, 0, TAU); g.stroke(); }
    const qh = P2b('head'); if (qh) { const r = .13 * qh.s; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(qh.x, qh.y, r, r * 1.15, 0, 0, TAU); g.fill(); g.fillStyle = '#000'; for (const sg of [-1, 1]) { g.beginPath(); g.arc(qh.x + sg * r * .38, qh.y - r * .05, r * .26, 0, TAU); g.fill(); } g.fillRect(qh.x - r * .4, qh.y + r * .5, r * .8, r * .12); } }
  g.restore(); const q = impFocus(f, p), r = rng(41 + k); g.save(); g.lineJoin = 'miter'; for (let i = 0; i < 7; i++) { const a = r() * TAU, x0 = q.x + Math.cos(a) * 200, y0 = q.y + Math.sin(a) * 200; g.beginPath(); g.moveTo(x0, y0); let x = x0, y = y0; for (let j = 0; j < 4; j++) { x += Math.cos(a) * 80 + (j % 2 ? 50 : -50); y += Math.sin(a) * 80; g.lineTo(x, y); } g.strokeStyle = '#2a1a4a'; g.lineWidth = 22; g.stroke(); g.strokeStyle = '#ffe14a'; g.lineWidth = 12; g.stroke(); } g.restore();
};
IMPACT.toondunk = (c, g, f, p, k) => {   // cartoon impact star burst, DOKAAAN lettering, ground wave
  const t = filtered(c, 'saturate(2) brightness(1.15) contrast(1.2)'); rawDraw(g, t); const q = impFocus(f, p);
  nliStar(g, q.x, q.y, 220 + k * 30, 640 + k * 80, 12, '#ffe14a', '#2a1a4a', 12, k * .2); nliStar(g, q.x, q.y, 120, 360 + k * 50, 10, '#ff3a3a', '#2a1a4a', 8, -k * .2);
  g.save(); g.strokeStyle = '#2a1a4a'; g.lineWidth = 9; for (let i = 0; i < 3; i++) { const y = H * .82 + i * 40; g.beginPath(); for (let x = 0; x <= W; x += 30) { const yy = y + Math.sin(x / 90 + k * 2 + i) * 22; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); } g.restore();
  const pur = impSil('chars', '#2a1a4a'); for (const [dx, dy] of [[-7, 0], [7, 0], [0, -7], [0, 7]]) rawDraw(g, pur, dx, dy); rawDraw(g, layer('chars'));
  nliWord(g, p.text || 'DOKAAAN!!', q.x, q.y - 40, 200 + k * 16, '#ffffff', '#2a1a4a', -.08);
};
IMPACT.cartoonpop = (c, g, f, p, k) => {   // pop rings, stars, thick outlines, eyes bulge (toonpop + concentric rings)
  IMPACT.toonpop(c, g, f, Object.assign({ text: p.text || 'POP!' }, p), k); const q = impFocus(f, p); g.save(); const cols = ['#ff7ab8', '#ffe14a', '#7ad8ff', '#b07aff']; for (let i = 0; i < 4; i++) { g.strokeStyle = cols[i]; g.lineWidth = 22; g.beginPath(); g.arc(q.x, q.y, 260 + i * 120 + k * 60, 0, TAU); g.stroke(); } g.restore();
};
Object.assign(IMPACT_SEQ, {
  SMOKE_BURST: [{ s: 'flash', n: 1, p: { col: '#ffffff' } }, { s: 'smokeburst', n: 2 }],
  POWER_CARD_N: [{ s: 'powercard', n: 3, p: { who: 'naruto' } }], POWER_CARD_L: [{ s: 'powercard', n: 2, p: { who: 'luffy' } }, { s: 'powercard', n: 1, p: { who: 'luffy', vs: true } }],
  RASEN_SPIRAL: [{ s: 'twirl', n: 3 }], SAGE_EYES: [{ s: 'sagefull', n: 2 }, { s: 'sagefull', n: 1, p: { neg: true } }],
  GEAR2_STEAM: [{ s: 'gear2steam', n: 3 }], HAKI_BLACK: [{ s: 'hakiblack', n: 3 }], BOUNDMAN_INFLATE: [{ s: 'boundman', n: 3 }], KCM_GOLD: [{ s: 'flash', n: 1, p: { col: '#fff2a0' } }, { s: 'kcmgold', n: 2 }],
  GIANT_FIST: [{ s: 'flash', n: 1 }, { s: 'giantfist', n: 2 }], BIJUDAMA_BLAST: [{ s: 'flash', n: 1 }, { s: 'bijudama', n: 3 }],
  CONQUEROR_WAVE: [{ s: 'conqwave', n: 3 }], CONQUEROR_CLASH: [{ s: 'flash', n: 1 }, { s: 'conqclash', n: 3 }], RASENSHURIKEN: [{ s: 'flash', n: 1 }, { s: 'shurikenfull', n: 3 }],
  NIKA_BURST: [{ s: 'nikaburst', n: 3 }], CARTOON_POP: [{ s: 'cartoonpop', n: 3 }], RUBBER_WORLD: [{ s: 'rubberworld', n: 3 }], SQUASH_STRETCH: [{ s: 'squashstretch', n: 2 }],
  CARTOON_XRAY: [{ s: 'cartoonxray', n: 4 }], TOON_DUNK: [{ s: 'toondunk', n: 3 }],
  DUAL_CLASH: [{ s: 'flash', n: 1 }, { s: 'nlsplit', n: 2 }], DUAL_TONE: [{ s: 'nlsplit', n: 2, p: { ang: 0 } }],
  EYE_ORANGE: [{ s: 'closeup', n: 2, p: { part: 'eye', mode: 'invert' } }, { s: 'sagefull', n: 1, p: { neg: true } }],
  WORLD_BREAKER: [{ s: 'flash', n: 1, p: { col: '#fff2a0' } }, { s: 'kuramagold', n: 2, p: { eye: 1 } }],
  COMIC_POW: [{ s: 'comicpow', n: 2, p: { kind: 'yellow', text: 'POW!' } }, { s: 'flash', n: 1 }],
});
IMPACT.comicnl = (c, g, f, p, k) => {   // COMIC_POW in Luffy's colours (red / yellow Ben-Day, black outlines, starburst + word)
  IMPACT.halftone(c, g, f, Object.assign({ cols: ['#ffe14a', '#e8241a'] }, p), k); const q = impFocus(f, p); nliRays(g, q, 40, '#0a0a0a', 360, 4, 7 + k);
  if (p.text !== false) { if (typeof comicBurst === 'function') comicBurst(g, q.x + (p.dx || 0), q.y - 60, 420, 260, 1 + k * .05, '#ffffff', 'rgba(232,36,26,.45)', 3 + k); nliWord(g, p.text || 'POW!', q.x + (p.dx || 0), q.y - 60, p.size || 220, '#ffe14a', '#1a0606', -.14); }
};
IMPACT_SEQ.COMIC_POW = [{ s: 'comicnl', n: 2 }, { s: 'flash', n: 1 }];
// ================================================================================================ impact_requests.md masked styles (technical descriptions only)
IMPACT.cloneslip = (c, g, f, p, k) => { if (k === 0) return IMPACT.smokeburst(c, g, f, p, k); fillAll(g, '#050505'); rawDraw(g, impSil('chars', '#ff7a1a')); const q = impFocus(f, p); if (typeof nlPuff === 'function') nlPuff(g, q.x + 220, q.y - 120, 160, 3, '#f4f0ea', '#1a1418', .9); };
IMPACT.flarering = (c, g, f, p, k) => { const t = filtered(c, 'grayscale(1) contrast(1.6) brightness(1.2)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ff5a1a'; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p); g.save(); g.fillStyle = '#120604'; for (let i = 0; i < 9; i++) { const y = (i + .5) / 9 * H + Math.sin(i + k) * 20; g.fillRect(0, y - 9, W, 18 * (.4 + hash(i + k))); } g.restore();
  const ex = p.ex || W * .5, ey = p.ey || H * .5, R = 170; g.save(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ex, ey, R * 2, R * .9, 0, 0, TAU); g.fill(); g.clip(); const gr = g.createRadialGradient(ex, ey, 10, ex, ey, R); gr.addColorStop(0, '#cfeaff'); gr.addColorStop(.6, '#2f7fe0'); gr.addColorStop(1, '#0a2a7a'); g.fillStyle = gr; g.beginPath(); g.arc(ex, ey, R, 0, TAU); g.fill();
  g.strokeStyle = '#e8f6ff'; g.lineWidth = 6; for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(ex, ey, R * i / 4, 0, TAU); g.stroke(); } g.fillStyle = '#05070a'; g.beginPath(); g.arc(ex, ey, R * .18, 0, TAU); g.fill(); g.restore(); g.save(); g.lineWidth = 16; g.strokeStyle = '#120604'; g.beginPath(); g.ellipse(ex, ey, R * 2, R * .9, 0, 0, TAU); g.stroke(); g.restore(); };
IMPACT.lifedrain = (c, g, f, p, k) => { const t = filtered(c, 'invert(1) grayscale(.6) contrast(1.3)'); rawDraw(g, t); const a = p.from ? project(p.from) : { x: W * .7, y: H * .45 }, b = p.to ? project(p.to) : { x: W * .3, y: H * .5 }; if (!a || !b) return;
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const u = (hash(i * 3) + k * .15) % 1, x = lerp(a.x, b.x, u) + (hash(i * 7) - .5) * 160 * Math.sin(u * Math.PI), y = lerp(a.y, b.y, u) + (hash(i * 11) - .5) * 160 * Math.sin(u * Math.PI); glow(g, x, y, 14 + 18 * hash(i), i % 3 ? '#ff7a1a' : '#ffd070', .9); } g.restore(); };
IMPACT.bajrangcollide = (c, g, f, p, k) => { fillAll(g, '#ffffff'); const q = impFocus(f, p), R = 520 + k * 60; g.save(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(q.x + (p.dir || 1) * 260, q.y, R, 0, TAU); g.fill(); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x - (p.dir || 1) * 120, q.y, 260, '#ff8a1a', 1); glow(g, q.x - (p.dir || 1) * 120, q.y, 90, '#ffffff', 1); g.restore();
  g.save(); g.fillStyle = '#9adcff'; g.beginPath(); g.ellipse(W * .5, 80, 360 + k * 80, 60, 0, 0, TAU); g.fill(); g.restore(); rawDraw(g, impSil('chars', '#0a0a0a')); };
IMPACT.gear5timeout = (c, g, f, p, k) => { const t = filtered(c, `saturate(${Math.max(0, 1.6 - k * .6)}) brightness(${1.1 - k * .3})`); rawDraw(g, t); g.save(); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(clamp(.2 + k * .3, 0, 1), 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,.95)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  const q = impFocus(f, p), sil = impSil('chars', '#000000'), sx = g.canvas.width / W, s = 1 - k * .12; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(q.x * sx, H * .9 * sx); g.scale(s, s); g.translate(-q.x * sx, -H * .9 * sx); g.drawImage(sil, 0, 0); g.restore(); };
IMPACT.emberfade = (c, g, f, p, k) => { fillAll(g, '#050302'); const lin = impFigs(f, 'rgba(0,0,0,0)', '#ff8a2a', 1.6); rawDraw(g, lin, 0, 0, 1 - k * .3); const q = impFocus(f, p);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 120; i++) { const x = q.x + (hash(i * 3) - .5) * 700, y = q.y + (hash(i * 7) - .5) * 900 - k * 60 * hash(i), r = 3 + 6 * hash(i * 5); glow(g, x, y, r * 3, i % 3 ? '#ff7a1a' : '#ffd070', .7); } g.restore(); };
IMPACT.memorygold = (c, g, f, p, k) => { const t = filtered(c, 'sepia(1) saturate(1.4) contrast(1.1) brightness(1.05)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ffd890'; g.fillRect(0, 0, W, H); g.restore();
  rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#5a3a10', 1.6), 0, 0, .8); g.save(); g.lineWidth = 26; g.strokeStyle = '#f6ecd8'; g.strokeRect(30, 30, W - 60, H - 60); g.lineWidth = 6; g.strokeStyle = '#5a3a10'; g.strokeRect(48, 48, W - 96, H - 96); g.restore(); };
IMPACT.clonepoofsage = (c, g, f, p, k) => { IMPACT.smokeburst(c, g, f, p, k); const q = impFocus(f, p); g.save(); g.fillStyle = '#ff7a1a'; g.globalAlpha = .35; g.fillRect(0, 0, W, H); g.restore(); if (k >= 1) for (const sg of [-1, 1]) { const ex = q.x + sg * 150, ey = q.y - 80; g.save(); g.fillStyle = '#f2c230'; g.beginPath(); g.ellipse(ex, ey, 90, 50, 0, 0, TAU); g.fill(); g.fillStyle = '#120806'; g.fillRect(ex - 60, ey - 12, 120, 24); g.lineWidth = 8; g.strokeStyle = '#120806'; g.beginPath(); g.ellipse(ex, ey, 90, 50, 0, 0, TAU); g.stroke(); g.restore(); } };
IMPACT.backdown = (c, g, f, p, k) => { fillAll(g, '#ffffff'); const q = impFocus(f, p); g.save(); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 10; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(q.x, q.y, 260 + i * 150 + k * 40, (260 + i * 150 + k * 40) * .55, 0, 0, TAU); g.stroke(); } g.restore(); rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#0a0a0a', 2.2)); };
Object.assign(IMPACT_SEQ, {
  CLONE_SLIP: [{ s: 'cloneslip', n: 1 }, { s: 'cloneslip', n: 1 }], FLARE_RING: [{ s: 'flarering', n: 3 }], LIFE_DRAIN: [{ s: 'lifedrain', n: 3 }], BAJRANG_COLLIDE: [{ s: 'flash', n: 1 }, { s: 'bajrangcollide', n: 3 }],
  GEAR5_TIMEOUT: [{ s: 'gear5timeout', n: 4 }], EMBER_FADE: [{ s: 'emberfade', n: 3 }], MEMORY_GOLD: [{ s: 'memorygold', n: 2 }, { s: 'flash', n: 1 }], CLONE_POOF_SAGE: [{ s: 'clonepoofsage', n: 3 }],
  FINAL_RASENGAN: [{ s: 'flash', n: 1 }, { s: 'twirl', n: 2, p: { amt: 2.2 } }, { s: 'speedburst', n: 1 }, { s: 'rasenswirl', n: 1 }], BACK_DOWN: [{ s: 'flash', n: 1 }, { s: 'backdown', n: 2 }],
});
