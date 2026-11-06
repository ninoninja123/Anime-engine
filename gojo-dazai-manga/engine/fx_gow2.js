/* engine/fx_gow2.js (agent E, gowther-dazai-urahara) - the shared visual language of pre/cast.md + props.
   SCREEN PROCESSES (f.screen; sadNullify undoes them inside its circle):
     gowPinkFilm(f, t, o)    INVASION POV MARKER: thin pink vignette + three small squares in a corner (o.corner 'tl'|'tr'|'bl'|'br', o.a 0..1, o.pulse)
                             -> 'if the frame has a pink edge, do not trust it'.  Never use it in Dazai's POV.
     gowTear(f, t, o)        A LIE THAT IS NOT CONSISTENT TEARS: the picture cracks along a jagged line (o.at, o.ang) then tears open into two halves
                             with white light / o.reveal behind (o.open 0..1 or auto by t/o.dur); used for Rewrite Light breaking AND the Book page tearing
     gowRewind(f, t, o)      LOST WORLD rewind: VHS white shimmer, tracking bands, horizontal jitter, slight desaturation, '◀◀' (o.a, o.label:false)
   PROPS (inside f.fx / f.prop):
     drawBookPage(g, c, o)   THE BOOK's page (BSD): aged paper sheet floating in 3D at c (o.yaw, o.pitch, o.roll, o.size m, o.t flutter), handwritten lines
                             (o.lines 0..1 = how full), o.glow, o.tear 0..1 (torn in two along a jagged line), o.text (string on the page)
     drawBookCover(g, c, o)  a hardback book in 3D (o.yaw, o.size, o.open 0..1, o.cover css, o.title, o.art 'pig'|'nlh'|'fairy'|'giant'|'princess'|fn)
     drawChuyaHat(g, p, o)   a black fedora drifting (o.rot, o.size), small band + chain detail
     gowSpeech(g, text, o)   Gowther's SQUARE speech box (manga: his bubbles are square) at o.x,o.y (screen), o.a
   Gowther's subtitles use the square box automatically (showdown/common.js).                                                           */
'use strict';
function gowPinkFilm(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const a = (o.a == null ? 1 : o.a) * Math.min(1, t / .15) * (o.pulse ? .85 + .15 * Math.sin(t * 6) : 1);
    g.save(); const gr = g.createRadialGradient(W / 2, H / 2, H * .42, W / 2, H / 2, H * .98); gr.addColorStop(0, 'rgba(255,122,216,0)'); gr.addColorStop(1, `rgba(255,122,216,${.42 * a})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = `rgba(255,140,220,${.5 * a})`; g.lineWidth = 3; g.strokeRect(10, 10, W - 20, H - 20);
    const cn = o.corner || 'tr', x0 = cn.includes('r') ? W - 60 : 36, y0 = cn.includes('b') ? H - 60 : 36, dx = cn.includes('r') ? -30 : 30;
    for (let i = 0; i < 3; i++) { const on = hash(Math.floor(t * 4) + i) > .15; g.fillStyle = `rgba(255,${on ? 170 : 120},230,${(on ? .85 : .4) * a})`; g.fillRect(x0 + i * dx, y0, 18, 18); g.strokeStyle = `rgba(90,20,70,${.6 * a})`; g.lineWidth = 1.5; g.strokeRect(x0 + i * dx, y0, 18, 18); }
    g.restore();
  });
}
function gowTear(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const focus = o.at ? (gowQ(o.at) || { x: W / 2, y: H / 2 }) : { x: o.x == null ? W / 2 : o.x, y: o.y == null ? H / 2 : o.y }, ang = o.ang == null ? 1.25 : o.ang, sc = OUT.scale;
    const crack = clamp(t / (o.crackDur || .2), 0, 1), open = o.open != null ? o.open : easeInOut(clamp((t - (o.hold || .25)) / (o.dur || .6), 0, 1));
    const r = rng(o.seed || 12), ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, line = []; for (let i = -14; i <= 14; i++) { const d = i / 14 * 1400; line.push([focus.x + ux * d + nx * (r() - .5) * 46, focus.y + uy * d + ny * (r() - .5) * 46]); }
    const src = gowCopy(c, 'gowTear'), gg = c.getContext('2d');
    if (open > 0) { gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.fillStyle = o.reveal || '#fffaf6'; gg.fillRect(0, 0, c.width, c.height); gg.restore(); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, focus.x, focus.y, 700 * open, o.glowCol || '#cfe8ff', .6 * open); g.restore();
      for (const sg of [-1, 1]) { const poly = line.slice(); poly.push([line[line.length - 1][0] + nx * sg * 3000, line[line.length - 1][1] + ny * sg * 3000], [line[0][0] + nx * sg * 3000, line[0][1] + ny * sg * 3000]);
        g.save(); const off = open * 260; g.translate(nx * sg * off, ny * sg * off); g.rotate(sg * open * .06); polyPath(g, poly); g.save(); g.clip(); g.drawImage(src, 0, 0, W, H); g.restore();
        polyPath(g, line, false); g.lineWidth = 6; g.strokeStyle = '#fffaf2'; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(80,60,60,.6)'; g.stroke(); g.restore(); } }
    if (crack > 0 && open < 1) { const n = Math.floor(line.length * crack), mid = Math.floor(line.length / 2), seg = line.slice(Math.max(0, mid - n / 2), Math.min(line.length, mid + n / 2 + 1)); g.save(); polyPath(g, seg, false); g.lineWidth = 5 * (1 - open); g.strokeStyle = '#ffffff'; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = o.crackCol || '#ff7ad8'; g.stroke();
      for (let i = 0; i < seg.length; i += 3) { const p = seg[i], a = ang + HP + (r() - .5) * 1.4, L = 20 + r() * 60; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke(); } g.restore(); }
  });
}
function gowRewind(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const a = o.a == null ? 1 : o.a, w = c.width, h = c.height, sc = OUT.scale, src = gowCopy(c, 'gowRw'), gg = c.getContext('2d'), r = rng(Math.floor(t * 24) + 3);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.filter = `saturate(${1 - .5 * a}) brightness(${1 + .1 * a})`; gg.drawImage(src, 0, 0); gg.filter = 'none';
    for (let i = 0; i < 10; i++) { const y = r() * h, hh = (2 + r() * 14) * sc, dx = (r() - .3) * 50 * a * sc; gg.drawImage(src, 0, y, w, hh, dx, y, w, hh); }
    for (let k = 0; k < 2; k++) { const y = ((t * (1.4 + k * .7) + k * .4) % 1) * h, bh = (30 + 40 * k) * sc; const gr = gg.createLinearGradient(0, y, 0, y + bh); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.45 * a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); gg.fillStyle = gr; gg.fillRect(0, y, w, bh); gg.drawImage(src, 0, y, w, bh * .4, (r() - .5) * 60 * sc, y, w, bh * .4); }
    gg.fillStyle = `rgba(255,255,255,${.06 * a})`; for (let y = 0; y < h; y += 4 * sc) gg.fillRect(0, y, w, sc); gg.restore();
    if (o.label !== false) { g.save(); g.globalAlpha = a * (Math.floor(t * 3) % 2 ? .95 : .6); g.fillStyle = '#ffffff'; g.font = '700 46px "Inter", sans-serif'; g.fillText('◀◀', 70, 100); g.font = '600 26px "Inter", monospace'; g.fillText('REW', 160, 96); g.restore(); }
  });
}
// ------------------------------------------------------------------------------------------------ the Book's page
function drawBookPage(g, c, o = {}) {
  const q0 = gowQ(c); if (!q0) return; const s = (o.size || .8), tt = o.t || 0, yaw = (o.yaw || 0) + Math.sin(tt * .7) * .15, pitch = (o.pitch == null ? -.15 : o.pitch) + Math.sin(tt * .9) * .08, roll = (o.roll || 0) + Math.sin(tt * .5) * .05;
  const M = mMul(mRotY(yaw), mMul(mRotX(pitch), mRotZ(roll))), P = (x, y, z = 0) => vAdd(c, mApply(M, [x * s, y * s, z * s + Math.sin(x * 3 + tt * 2) * .03 * s]));
  const N = 8, edgeL = [], edgeR = []; for (let i = 0; i <= N; i++) { const y = .7 - i / N * 1.4; edgeL.push(P(-.5, y)); edgeR.push(P(.5, y)); }
  const tear = o.tear || 0, tr = rng(o.seed || 7), jag = []; const ly = o.lineY == null ? .05 : o.lineY; for (let i = 0; i <= 10; i++) jag.push([-.5 + i / 10, (tr() - .5) * .1 + ly - .03]);
  const half = (sg) => { const top = sg > 0, pts = []; if (top) { pts.push(...edgeL.slice(0, N / 2 + 1).reverse().reverse()); } return pts; };
  const drawPoly = (poly2d, off) => { polyPath(g, poly2d); g.fillStyle = '#f2e6c8'; g.fill(); g.save(); g.clip(); const gr = g.createLinearGradient(poly2d[0][0], poly2d[0][1], poly2d[Math.floor(poly2d.length / 2)][0], poly2d[Math.floor(poly2d.length / 2)][1]); gr.addColorStop(0, 'rgba(255,250,235,.5)'); gr.addColorStop(1, 'rgba(160,120,70,.25)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const lines = clamp(o.lines == null ? .8 : o.lines, 0, 1), nl = Math.floor(18 * lines); g.strokeStyle = 'rgba(40,30,30,.75)'; g.lineWidth = Math.max(.8, .006 * s * q0.s); for (let i = 0; i < nl; i++) { const y = .6 - i * .065, a = proj2(P(-.42 + off[0], y + off[1])), b = proj2(P(.4 * (i === nl - 1 ? .5 : 1) + off[0], y + off[1])); g.beginPath(); g.moveTo(a[0], a[1]); for (let k = 1; k <= 8; k++) { const u = k / 8; g.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * 30 + i) * .6); } g.stroke(); }
    if (o.line) { const m = proj2(P(-.4 + off[0], (o.lineY == null ? .05 : o.lineY) + off[1])); g.save(); g.fillStyle = '#1a1a3a'; g.font = `italic 600 ${Math.max(9, .075 * s * q0.s)}px "Georgia", "Times New Roman", serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; const n = Math.max(0, Math.floor(o.line.length * clamp(o.write == null ? 1 : o.write, 0, 1))); g.fillText(o.line.slice(0, n), m[0], m[1]); g.restore(); }
    if (o.text) { const m = proj2(P(off[0], .05 + off[1])); g.fillStyle = '#2a1a14'; g.font = `600 ${Math.max(8, .07 * s * q0.s)}px "IPAMincho", serif`; g.textAlign = 'center'; g.fillText(o.text, m[0], m[1]); }
    g.restore(); polyPath(g, poly2d); g.lineWidth = Math.max(2, .022 * s * q0.s); g.strokeStyle = o.gold === false ? '#5a3e24' : '#d8b04a'; g.stroke(); g.lineWidth = Math.max(1, .006 * s * q0.s); g.strokeStyle = '#5a3e24'; g.stroke(); };
  if (o.glow) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q0.x, q0.y, 1.2 * s * q0.s, o.glowCol || '#ffe8b0', .45 * o.glow); g.restore(); }
  if (tear <= 0) { drawPoly(edgeR.map(p => proj2(p)).concat(edgeL.slice().reverse().map(p => proj2(p))), [0, 0]); return; }
  for (const sg of [1, -1]) { const d = tear * .35 * sg, rot = tear * .25 * sg, Pt = (x, y) => { const yy = y + d, xx = x * Math.cos(rot) - (y) * Math.sin(rot) * .2; return proj2(P(xx, yy)); };
    const poly = sg > 0 ? [Pt(-.5, .7), Pt(.5, .7)].concat(jag.slice().reverse().map(([x, y]) => Pt(x, y))) : [Pt(-.5, -.7), Pt(.5, -.7)].concat(jag.slice().reverse().map(([x, y]) => Pt(x, y)));
    drawPoly(poly, [0, d]); polyPath(g, jag.map(([x, y]) => Pt(x, y)), false); g.lineWidth = 3; g.strokeStyle = '#fffaf0'; g.stroke(); }
}
function drawBookCover(g, c, o = {}) {
  const q = gowQ(c); if (!q) return; const s = (o.size || .35) * q.s, w = s * .72, h = s, open = o.open || 0; g.save(); g.translate(q.x, q.y); g.rotate(o.rot || 0);
  if (open > .05) { g.fillStyle = '#f6f0e2'; g.fillRect(-w * (1 + open * .9), -h / 2, w * (1 + open * .9) * 2 * .5, h); g.strokeStyle = '#3a2a20'; g.lineWidth = Math.max(1, s * .02); g.strokeRect(-w * (1 + open * .9), -h / 2, w * (1 + open * .9), h); }
  g.fillStyle = o.cover || '#3a2a5a'; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = '#1a1018'; g.lineWidth = Math.max(1, s * .025); g.strokeRect(-w / 2, -h / 2, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2, -h / 2, w * .08, h);
  g.save(); g.beginPath(); g.rect(-w / 2 + w * .1, -h / 2 + h * .1, w * .8, h * .55); g.clip(); const art = o.art;
  if (typeof art === 'function') art(g, w, h);
  else if (art === 'pig') { g.fillStyle = '#ffd8c8'; g.fillRect(-w, -h, 2 * w, 2 * h); g.fillStyle = '#f2a0a8'; g.beginPath(); g.ellipse(0, -h * .08, w * .3, h * .18, 0, 0, TAU); g.fill(); g.fillStyle = '#c86a7a'; g.beginPath(); g.ellipse(0, -h * .02, w * .1, h * .06, 0, 0, TAU); g.fill(); g.fillStyle = '#1a1018'; g.fillRect(-w * .14, -h * .14, w * .05, h * .04); g.fillRect(w * .09, -h * .14, w * .05, h * .04); }
  else if (art === 'nlh') { g.fillStyle = '#e8e4dc'; g.fillRect(-w, -h, 2 * w, 2 * h); g.fillStyle = '#1a1a22'; g.font = `700 ${h * .13}px "IPAMincho", serif`; g.textAlign = 'center'; for (let i = 0; i < 4; i++) g.fillText('人間失格'[i], 0, -h * .32 + i * h * .13); }
  else if (art === 'fairy') { g.fillStyle = '#c8e8a8'; g.fillRect(-w, -h, 2 * w, 2 * h); g.fillStyle = '#e8c84a'; g.beginPath(); g.arc(0, -h * .1, w * .15, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(sg * w * .2, -h * .15, w * .15, h * .08, sg * .5, 0, TAU); g.fill(); } }
  else if (art === 'giant') { g.fillStyle = '#a8d0f0'; g.fillRect(-w, -h, 2 * w, 2 * h); g.fillStyle = '#5a3a2a'; g.beginPath(); g.ellipse(0, h * .2, w * .3, h * .35, 0, 0, TAU); g.fill(); g.fillStyle = '#f2c8a8'; g.beginPath(); g.arc(0, -h * .1, w * .14, 0, TAU); g.fill(); }
  else if (art === 'princess') { g.fillStyle = '#f2e0f0'; g.fillRect(-w, -h, 2 * w, 2 * h); g.fillStyle = '#e8e0c8'; g.beginPath(); g.ellipse(0, h * .05, w * .25, h * .3, 0, 0, TAU); g.fill(); g.fillStyle = '#f6dcc8'; g.beginPath(); g.arc(0, -h * .12, w * .12, 0, TAU); g.fill(); }
  else { g.fillStyle = '#d8c8a8'; g.fillRect(-w, -h, 2 * w, 2 * h); }
  g.restore();
  if (o.title) { g.fillStyle = o.titleCol || '#f2e8d0'; g.font = `700 ${Math.max(6, h * (o.title.length > 14 ? .065 : .09))}px "Inter", serif`; g.textAlign = 'center'; g.fillText(o.title, 0, h * .3); if (o.sub) { g.font = `500 ${Math.max(5, h * .055)}px "Inter", serif`; g.fillText(o.sub, 0, h * .4); } }
  g.restore();
}
function drawChuyaHat(g, p, o = {}) { const q = gowQ(p); if (!q) return; const s = (o.size || .35) * (Array.isArray(p) ? q.s : 100); g.save(); g.translate(q.x, q.y); g.rotate(o.rot || 0);
  g.fillStyle = '#121014'; g.beginPath(); g.ellipse(0, s * .2, s * 1.1, s * .3, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-s * .62, s * .15); g.quadraticCurveTo(-s * .7, -s * .55, -s * .2, -s * .6); g.quadraticCurveTo(0, -s * .45, s * .2, -s * .6); g.quadraticCurveTo(s * .7, -s * .55, s * .62, s * .15); g.closePath(); g.fill();
  g.fillStyle = '#5a1a1a'; g.fillRect(-s * .63, -s * .02, s * 1.26, s * .14); g.strokeStyle = '#c8c8d0'; g.lineWidth = Math.max(1, s * .03); g.beginPath(); g.moveTo(s * .3, s * .05); g.quadraticCurveTo(s * .55, s * .3, s * .8, s * .12); g.stroke(); g.strokeStyle = '#3a3440'; g.lineWidth = Math.max(1, s * .04); g.beginPath(); g.ellipse(0, s * .2, s * 1.1, s * .3, 0, 0, TAU); g.stroke(); g.restore(); }
function gowSpeech(g, text, o = {}) { const a = o.a == null ? 1 : o.a; g.save(); g.globalAlpha = a; g.font = `600 ${o.size || 36}px "Inter", sans-serif`; const tw = g.measureText(text).width, pad = 22, w = tw + pad * 2, h = (o.size || 36) * 1.8, x = (o.x == null ? W / 2 : o.x) - w / 2, y = o.y == null ? H - 150 : o.y;
  g.fillStyle = 'rgba(250,246,252,.95)'; g.fillRect(x, y, w, h); g.lineWidth = 4; g.strokeStyle = '#1a1018'; g.strokeRect(x, y, w, h); g.fillStyle = '#ff7ad8'; g.fillRect(x, y, 10, 10); g.fillRect(x + w - 10, y + h - 10, 10, 10);
  g.fillStyle = '#1a1018'; g.textBaseline = 'middle'; g.fillText(text, x + pad, y + h / 2 + 1); if (o.who) { g.font = '800 22px "Inter", sans-serif'; g.fillStyle = '#ff7ad8'; g.fillText(o.who, x + 4, y - 16); } g.restore(); }
