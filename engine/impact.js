/* Bleach Showdown engine - impact.js : IMPACT FRAME library.
   Impact frames are 1-6 frame bursts that replace / re-process the composed image at the moment of a hit,
   in the hard-shape language of TV anime (no soft gradients unless stated).  Each STYLE is a function
       STYLE(c, g, f, p, k, n)    c = comp canvas (output res), g = its 2D context at 1920x1080 coords,
                                  f = frame builder, p = params, k = frame index inside the step, n = step length
   and every style has parameters (colours, focus point, strength, glyph ...).  STEPS are combined into SEQUENCES:
       [{ s: 'flash', n: 1 }, { s: 'invert', n: 2, p: {...} }, { s: 'hatch', n: 2 }]
   Use in a shot:   f.impact('hit_heavy', { t0: 1.25, at: [x,y,z] })     (t0 = LOCAL time the sequence starts)
                    f.impact([{s:'redblack',n:2},{s:'shatter',n:3}], { t0: 2.0 })
                    f.impact('invert', { t0: .5, n: 2 })                    (single style, n frames)
   impactLen(seq) -> frames; impactActive(f, seq, t0) -> bool (to hold camera/shake during it).
   STYLES (18): invert, hatch, whiteout, blackaccent, redblack, chroma, kanji, shatter, panels, flash, black,
     overexpose, radial, lens, closeup, desat, rimsil, duotone, ink, posterize
   Common params: at (world point) / x,y (screen focus), col / col2 / accent, char (kanji), jolt (px offset),
     lines (speed line count), seed.  Signature sequences: IMPACT_SEQ[...]  (see API.md for the list).          */
'use strict';
const IMPACT = {};
function impFocus(f, p) {
  if (p.x != null) return { x: p.x, y: p.y };
  if (p.at) { const q = project(p.at); if (q) return { x: q.x, y: q.y }; }
  if (f._figs.length) { let sx = 0, sy = 0, n = 0; for (const it of f._figs) { const S = figSkel(it.F, it.opt.t != null ? it.opt.t : f.T); const q = project(S.J.abd); if (q) { sx += q.x; sy += q.y; n++; } } if (n) return { x: sx / n, y: sy / n }; }
  return { x: W / 2, y: H / 2 };
}
// re-render the frame's figures with an override (lineart / silhouette) into layer 'impF'
function impFigs(f, fill, ink, lineK = 1.4) {
  const g = beginLayer('impF'); const save = { o: LIGHT.override, ink: LIGHT.ink, lk: LIGHT.lineK, st: f._style };
  LIGHT.override = { fill, ink }; LIGHT.ink = ink; LIGHT.lineK = lineK; TONE_CACHE.clear(); f._style = 'hand2d';   // weighted, boiling hand-drawn lineart
  try { renderFigures(g, f, f.T); } finally { LIGHT.override = save.o; LIGHT.ink = save.ink; LIGHT.lineK = save.lk; f._style = save.st; TONE_CACHE.clear(); }
  return layer('impF');
}
function impSil(srcName, col) { // colour-keyed copy of a layer's alpha
  const src = layer(srcName), d = layer('impS'), g = d.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, d.width, d.height); g.globalCompositeOperation = 'source-over'; g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, d.width, d.height); g.globalCompositeOperation = 'source-over'; return d;
}
function rawDraw(g, img, x = 0, y = 0, a = 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(img, x, y); g.restore(); }
function fillAll(g, col) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = col; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
function copyComp(c) { const t = layer('impC'), g = t.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, t.width, t.height); g.drawImage(c, 0, 0); return t; }
function filtered(c, filter) { const t = layer('impT'), g = t.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, t.width, t.height); g.filter = filter; g.drawImage(c, 0, 0); g.filter = 'none'; return t; }
function splatter(g, seed, n, col, focus, R = 700) { g.fillStyle = col; for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = R * (.35 + hash(seed + i * 3) * .9), x = focus.x + Math.cos(a) * d, y = focus.y + Math.sin(a) * d, r = 4 + hash(seed + i * 5) * 26; blobPath(g, x, y, r, seed + i * 7, 7, .45); g.fill(); for (let j = 0; j < 3; j++) { const rr = r * (.15 + hash(seed + i * 11 + j) * .25), dd = r * (1.4 + hash(seed + i * 13 + j) * 1.6), aa = a + (hash(seed + i * 17 + j) - .5) * 1.2; g.beginPath(); g.arc(x + Math.cos(aa) * dd, y + Math.sin(aa) * dd, rr, 0, TAU); g.fill(); } } }
// pixel helpers (full-res loops; only on impact frames)
function pixels(c, fn) { const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data, w = c.width; for (let i = 0, p = 0; i < d.length; i += 4, p++) { const L = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114); fn(d, i, L, p % w, (p / w) | 0); } g.putImageData(im, 0, 0); }

// ------------------------------------------------------------------------------------------------- styles
IMPACT.invert = (c, g, f, p, k) => { const t = filtered(c, `invert(1)${p.hue ? ` hue-rotate(${p.hue}deg)` : ''} contrast(${p.contrast || 1.35}) saturate(${p.sat || 1.2})`); rawDraw(g, t); if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines || 60, col: p.lineCol || '#000000', inner: 300, alpha: .9 }, impFocus(f, p))); };
IMPACT.hatch = (c, g, f, p, k) => { // manga: 3-tone threshold + diagonal hatching + screentone + ink splatter
  const paper = hexRGB(p.paper || '#f6f1e6'), inkc = hexRGB(p.ink || '#141016'), s = OUT.scale, per = Math.max(3, Math.round(7 * s)), lw = Math.max(1, Math.round(2.2 * s)), t1 = p.t1 || 150, t2 = p.t2 || 70, dot = Math.max(3, Math.round(6 * s));
  const shift = k * 3;
  pixels(c, (d, i, L, x, y) => {
    let on;
    if (L > t1) on = false; else if (L < t2) on = true;
    else if (L > (t1 + t2) / 2) { const xx = x % dot - dot / 2, yy = y % dot - dot / 2; on = xx * xx + yy * yy < (dot * dot) * .09 * (1 - (L - (t1 + t2) / 2) / ((t1 - t2) / 2)) * 2; }
    else { on = ((x + y + shift) % per) < lw || (L < (t1 + t2) * .38 && ((x - y + 9999 * per) % per) < lw); }
    const col = on ? inkc : paper; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2];
  });
  const F = impFocus(f, p);
  if (p.figs !== false) { g.save(); g.globalCompositeOperation = 'multiply'; rawDraw(g, impFigs(f, '#ffffff', p.ink || '#141016', 1.6)); g.restore(); }
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines || 70, col: p.ink || '#141016', inner: 340, w: 7, alpha: 1 }, F));
  if (p.splat !== 0) splatter(g, (p.seed || 3) + k * 17, p.splat || 14, p.ink || '#141016', F);
  if (p.accent) { g.save(); g.globalCompositeOperation = 'multiply'; rawDraw(g, impSil('glow', p.accent)); g.restore(); }
};
IMPACT.whiteout = (c, g, f, p, k) => { // white freeze: paper white, characters as black-ink lineart, fx as pale silhouettes
  fillAll(g, p.bg || '#ffffff');
  if (p.fx !== false) { rawDraw(g, impSil('fxover', p.fxCol || '#dcdce6')); rawDraw(g, impSil('glow', p.fxCol || '#e8e8f0')); }
  rawDraw(g, impFigs(f, p.fill || '#ffffff', p.ink || '#000000', p.lineK || 1.8));
  if (p.lines) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines, col: '#000000', inner: 360, w: 4, alpha: .8 }, impFocus(f, p)));
};
IMPACT.blackaccent = (c, g, f, p, k) => { // black frame, figures as accent-coloured lineart, fx glow in accent
  const acc = p.accent || '#ff3a5a'; fillAll(g, p.bg || '#050307');
  rawDraw(g, impSil('glow', acc), 0, 0, .9); rawDraw(g, impSil('fxover', mixHex(acc, '#000000', .3)), 0, 0, .9);
  rawDraw(g, impFigs(f, p.fill || '#050307', acc, p.lineK || 1.8));
  if (p.rim !== false) { const sil = impSil('chars', '#ffffff'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-over'; g.drawImage(sil, 3 * OUT.scale, -2 * OUT.scale); g.restore(); fillBehind(g, p.bg || '#050307'); }
  if (p.lines) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines, col: acc, inner: 380, w: 3, alpha: .8 }, impFocus(f, p)));
};
function fillBehind(g, col) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-over'; g.fillStyle = col; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
IMPACT.redblack = (c, g, f, p, k) => { // red field, black silhouettes, white cuts, black splatter
  const F = impFocus(f, p); fillAll(g, p.col || '#d4141c');
  g.save(); const gr = g.createRadialGradient(F.x, F.y, 50, F.x, F.y, 1300); gr.addColorStop(0, rgba(p.col2 || '#ff5a2a', .0)); gr.addColorStop(1, rgba('#3a0000', .55)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines || 50, col: '#000000', inner: 420, w: 9, alpha: 1 }, F));
  rawDraw(g, impSil('glow', '#ffffff')); rawDraw(g, impSil('fxover', '#000000'));
  rawDraw(g, impSil('chars', p.sil || '#000000'));
  splatter(g, (p.seed || 5) + k * 31, p.splat || 10, '#000000', F, 900);
};
IMPACT.chroma = (c, g, f, p, k) => { // RGB split + glitch slices
  const src = copyComp(c), d = (p.d || 26) * (k % 2 ? -1 : 1) * OUT.scale, w = c.width, h = c.height;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  const ch = layer('impCh'), cg = ch.getContext('2d');
  for (const [col, dx, dy] of [['#ff0000', d, 0], ['#00ff00', 0, d * .25], ['#0000ff', -d, 0]]) { cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, w, h); cg.drawImage(src, dx, dy); cg.globalCompositeOperation = 'multiply'; cg.fillStyle = col; cg.fillRect(0, 0, w, h); g.globalCompositeOperation = 'lighter'; g.drawImage(ch, 0, 0); }
  g.globalCompositeOperation = 'source-over';
  const sl = p.slices == null ? 9 : p.slices; for (let i = 0; i < sl; i++) { const y = hash((p.seed || 7) + i + k * 13) * h, hh = (8 + hash(i * 3 + k) * 60) * OUT.scale, dx = (hash(i * 5 + k * 7) - .5) * 160 * OUT.scale; g.drawImage(c, 0, y, w, hh, dx, y, w, hh); }
  g.restore();
};
IMPACT.kanji = (c, g, f, p, k, n) => { // giant glyph slam over a darkened / tinted frame
  const F = impFocus(f, p); const base = filtered(c, `brightness(${p.dim || .45}) saturate(${p.sat || 1.4})`); rawDraw(g, base);
  if (p.tint) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = p.tint; g.fillRect(0, 0, W, H); g.restore(); }
  fxSpeedLines(g, f.T + k, Object.assign({ n: 80, col: p.lineCol || '#ffffff', inner: 300, w: 6, alpha: .85 }, F));
  const sc = k === 0 ? 1.5 : 1 + .04 * Math.sin(k * 2), sz = (p.size || 760) * sc, ch = p.char || '斬';
  g.save(); g.translate(p.cx || W / 2, p.cy || H / 2 + 20); g.rotate(p.rot == null ? -.08 : p.rot); g.font = `900 ${sz}px "IPAGothic", "WenQuanYi Zen Hei", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = sz * .09; g.strokeStyle = p.outline || '#000000'; g.strokeText(ch, 0, 0);
  g.fillStyle = p.col || '#ffffff'; g.fillText(ch, 0, 0);
  if (p.col2) { g.save(); g.beginPath(); g.rect(-sz, sz * .05, sz * 2, sz); g.clip(); g.fillStyle = p.col2; g.fillText(ch, 0, 0); g.restore(); }
  g.restore();
  if (p.sub) { g.save(); g.font = `900 ${p.subSize || 64}px "Inter", sans-serif`; g.textAlign = 'center'; g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(p.sub, W / 2, H - 120); g.fillStyle = p.col || '#fff'; g.fillText(p.sub, W / 2, H - 120); g.restore(); }
};
IMPACT.shatter = (c, g, f, p, k, n) => { // the screen breaks into shards from the focus point
  const F = impFocus(f, p), src = copyComp(c), u = (k + 1) / Math.max(1, n), seed = p.seed || 11;
  const rays = p.rays || 14, rings = [0, 140, 330, 620, 1100, 2400];
  fillAll(g, p.gap || '#ffffff');
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  const ang = []; for (let i = 0; i < rays; i++) ang.push((i + hash(seed + i) * .7) / rays * TAU);
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < rays; i++) {
    const a0 = ang[i], a1 = ang[(i + 1) % rays] + (i === rays - 1 ? TAU : 0), r0 = rings[r] * (1 + (hash(seed + i * 3 + r) - .5) * .3), r1 = rings[r + 1] * (1 + (hash(seed + i * 5 + r + 1) - .5) * .3);
    const poly = [[F.x + Math.cos(a0) * r0, F.y + Math.sin(a0) * r0], [F.x + Math.cos(a0) * r1, F.y + Math.sin(a0) * r1], [F.x + Math.cos(a1) * r1, F.y + Math.sin(a1) * r1], [F.x + Math.cos(a1) * r0, F.y + Math.sin(a1) * r0]];
    const am = (a0 + a1) / 2, push = (p.push || 70) * u * (1 + r * .5) * (.6 + hash(seed + i * 7 + r)), rot = (hash(seed + i * 11 + r) - .5) * .25 * u;
    const cx = F.x + Math.cos(am) * (r0 + r1) / 2, cy = F.y + Math.sin(am) * (r0 + r1) / 2;
    g.save(); g.translate(cx + Math.cos(am) * push, cy + Math.sin(am) * push); g.rotate(rot); g.translate(-cx, -cy);
    g.save(); polyPath(g, poly); g.clip(); g.drawImage(src, 0, 0, src.width, src.height, 0, 0, W, H);
    if ((i + r) % 3 === 0) { g.fillStyle = rgba('#ffffff', .18); g.fill(); }
    g.restore(); polyPath(g, poly); g.lineWidth = 3; g.strokeStyle = p.edge || '#000000'; g.stroke(); g.restore();
  }
  g.restore();
};
IMPACT.panels = (c, g, f, p, k) => { // manga panel cut: 3 slanted panels with zoom / negative / original
  const F = impFocus(f, p), src = copyComp(c); fillAll(g, '#ffffff');
  const sl = p.slant == null ? 120 : p.slant, gut = 22, cuts = [W * .33, W * .64];
  const panels = [[[0, 0], [cuts[0] + sl, 0], [cuts[0] - sl, H], [0, H]], [[cuts[0] + sl + gut, 0], [cuts[1] + sl, 0], [cuts[1] - sl, H], [cuts[0] - sl + gut, H]], [[cuts[1] + sl + gut, 0], [W, 0], [W, H], [cuts[1] - sl + gut, H]]];
  const modes = p.modes || ['zoom', 'neg', 'orig'];
  panels.forEach((poly, i) => {
    g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); polyPath(g, poly); g.clip(); const m = modes[i];
    const z = m === 'zoom' ? (p.zoom || 2.6) : m === 'zoom2' ? (p.zoom2 || 4) : 1.08 + k * .02; const ox = (i - 1) * 40;
    if (m === 'neg') g.filter = 'invert(1) contrast(1.4)'; if (m === 'mono') g.filter = 'grayscale(1) contrast(2)';
    g.translate(F.x + ox, F.y); g.scale(z, z); g.translate(-F.x, -F.y); g.drawImage(src, 0, 0, src.width, src.height, 0, 0, W, H); g.filter = 'none';
    g.restore(); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); polyPath(g, poly); g.lineWidth = 7; g.strokeStyle = '#000'; g.stroke(); g.restore();
  });
};
IMPACT.flash = (c, g, f, p) => fillAll(g, p.col || '#ffffff');
IMPACT.black = (c, g, f, p) => fillAll(g, p.col || '#000000');
IMPACT.overexpose = (c, g, f, p, k) => { const t = filtered(c, `brightness(${p.b || 1.9}) contrast(${p.c || 1.7}) saturate(${p.s || 1.5})`); rawDraw(g, t); bloomPass(c, c, 1.5, 40, .8); if (p.col) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .45; g.fillStyle = p.col; g.fillRect(0, 0, W, H); g.restore(); } const F = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, F.x, F.y, 900, '#ffffff', .8); g.restore(); };
IMPACT.radial = (c, g, f, p, k) => { // zoom blur from focus + focus lines + screen shock rings
  const F = impFocus(f, p), src = copyComp(c), n = 8, s = OUT.scale;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= n; i++) { const z = 1 + i * (p.zoom || .035); g.globalAlpha = .55 / i * 1.6; g.drawImage(src, F.x * s - F.x * s * z, F.y * s - F.y * s * z, c.width * z, c.height * z); }
  g.restore();
  fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines || 110, col: p.lineCol || '#ffffff', inner: 220, w: 8, alpha: .95 }, F));
  for (let i = 0; i < 3; i++) { const r = (180 + i * 220) * (1 + k * .35); g.lineWidth = 14 - i * 3; g.strokeStyle = rgba(p.ringCol || '#ffffff', .9 - i * .2); g.beginPath(); g.ellipse(F.x, F.y, r, r * .75, 0, 0, TAU); g.stroke(); }
};
IMPACT.lens = (c, g, f, p, k) => { // extreme fisheye: mesh warp of the frame around the focus
  const F = impFocus(f, p), src = copyComp(c), s = OUT.scale, nx = 28, ny = 16, K = (p.k || .55) * (1 + k * .15);
  const RN = Math.hypot(W / 2, H / 2) * 1.05; const warp = (x, y) => { const dx = (x - F.x) / RN, dy = (y - F.y) / RN, r2 = dx * dx + dy * dy, f2 = (1 + K) / (1 + K * r2); return [F.x + dx * f2 * RN, F.y + dy * f2 * RN]; };
  fillAll(g, '#000'); g.save();
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x0 = i / nx * W, y0 = j / ny * H, x1 = (i + 1) / nx * W, y1 = (j + 1) / ny * H;
    const a = warp(x0, y0), b = warp(x1, y0), cc = warp(x0, y1), d = warp(x1, y1);
    // two triangles via affine of the cell corners (a,b,cc) and (d) approx: single affine on a,b,cc with slight overdraw
    g.setTransform((b[0] - a[0]) / (x1 - x0) * s, (b[1] - a[1]) / (x1 - x0) * s, (cc[0] - a[0]) / (y1 - y0) * s, (cc[1] - a[1]) / (y1 - y0) * s, a[0] * s, a[1] * s);
    g.drawImage(src, x0 * s, y0 * s, (x1 - x0) * s + 1.5, (y1 - y0) * s + 1.5, 0, 0, (x1 - x0) * 1.02 + .5, (y1 - y0) * 1.02 + .5);
  }
  g.restore(); fxSpeedLines(g, f.T + k, Object.assign({ n: 70, col: p.lineCol || '#ffffff', inner: 420, w: 6, alpha: .7 }, F));
};
/* closeup: re-renders the frame's figures with a close camera on a body part inside a strip / full frame.
   p: { fig: index (default 0), part: 'eye'|'face'|'hand'|'fist'|'blade'|'mouth', strip: true, dist, bg, lines, mode } */
IMPACT.closeup = (c, g, f, p, k) => {
  const it = f._figs[p.fig || 0]; if (!it) return; const F2 = it.F, tf = it.opt.t != null ? it.opt.t : f.T, S = figSkel(F2, tf);
  const camSave = CAM.cur; const part = p.part || 'eye';
  let target, dist = p.dist;
  if (part === 'eye' || part === 'face' || part === 'mouth') { const HM = headModel(S, designAt(F2, tf)); const fr = faceFrame(HM, part === 'eye' ? (p.side || 1) * .44 : 0, part === 'eye' ? -.2 : part === 'mouth' ? -.75 : -.3, .5, 1); target = fr.p; dist = dist || (part === 'face' ? .6 : part === 'mouth' ? .42 : .34); const dir = vNorm(vAdd(fr.n, vMul(HM.M[0], (p.yaw || 0)))); CAM.set({ pos: vMad(target, dir, dist), target, fov: 30, roll: p.roll || 0 }); }
  else { const side = p.hand || 'R'; target = part === 'blade' ? (swordAt(F2, tf) || { tip: S.J['hand' + side] }).tip : S.J['hand' + side]; dist = dist || .5; const dir = vNorm(vAdd(toCam(target, camSave), [0, .15, 0])); CAM.set({ pos: vMad(target, dir, dist), target, fov: 32, roll: p.roll || 0 }); }
  const lay = beginLayer('impClose'); lay.fillStyle = p.bg || '#0a0610'; lay.fillRect(0, 0, W, H);
  if (p.lines !== 0) fxSpeedLines(lay, f.T + k, { n: 90, col: p.lineCol || '#ffffff', inner: 280, w: 6, alpha: .5 });
  drawFig(lay, F2, tf, { clipNear: camDepth(target) - (p.clip || .12) }); CAM.set(camSave);
  if (p.mode === 'invert') { const t = filtered(layer('impClose'), 'invert(1) contrast(1.3)'); const lg = layer('impClose').getContext('2d'); lg.setTransform(1, 0, 0, 1, 0, 0); lg.drawImage(t, 0, 0); }
  if (p.strip) { const sh = p.stripH || 300, y0 = H / 2 - sh / 2 + (p.stripY || 0); const dim = filtered(c, 'brightness(.35) saturate(.6)'); rawDraw(g, dim); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.beginPath(); g.rect(0, y0, W, sh); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer('impClose'), 0, -(H / 2 - sh / 2 - y0) * 0); g.restore(); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.fillStyle = '#000'; g.fillRect(0, y0 - 10, W, 10); g.fillRect(0, y0 + sh, W, 10); g.restore(); }
  else rawDraw(g, layer('impClose'));
};
IMPACT.desat = (c, g, f, p, k) => { const t = filtered(c, `grayscale(1) contrast(${p.c || 1.8}) brightness(${p.b || 1.05})`); rawDraw(g, t); if (p.keep !== false) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.drawImage(layer('glow'), 0, 0); g.globalCompositeOperation = 'source-over'; if (p.accent) { g.globalCompositeOperation = 'color'; g.drawImage(impSil('fxover', p.accent), 0, 0); } g.restore(); } };
IMPACT.rimsil = (c, g, f, p, k) => { // gradient field + black silhouettes with white rim (Ufotable-ish)
  const F = impFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const gr = g.createLinearGradient(0, 0, W * .3, H); gr.addColorStop(0, p.col || '#ffd0e0'); gr.addColorStop(1, p.col2 || '#ff5a8a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: 60, col: '#ffffff', inner: 380, w: 5, alpha: .9 }, F));
  rawDraw(g, impSil('glow', '#ffffff'));
  const sil = impSil('chars', p.rimCol || '#ffffff'); rawDraw(g, sil, (p.rx || 5) * OUT.scale, (p.ry || -4) * OUT.scale);
  rawDraw(g, impSil('chars', p.sil || '#0a0610'));
};
IMPACT.duotone = (c, g, f, p) => { const A = hexRGB(p.dark || '#0b1a3a'), B = hexRGB(p.light || '#bff2ff'), th = p.th || 120; pixels(c, (d, i, L) => { const col = L > th ? B : A; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; }); };
IMPACT.posterize = (c, g, f, p) => { const cols = (p.cols || ['#120a18', '#5a2a5a', '#e0507a', '#fff0e0']).map(hexRGB), n = cols.length; pixels(c, (d, i, L) => { const col = cols[Math.min(n - 1, Math.floor(L / 256 * n))]; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; }); };
IMPACT.ink = (c, g, f, p, k) => { // inverse lineart: black void, white lines (sensory deprivation / Enma Korogi)
  fillAll(g, p.bg || '#000000'); if (p.fx !== false) rawDraw(g, impSil('glow', p.fxCol || '#3a3a4a'));
  rawDraw(g, impFigs(f, p.bg || '#000000', p.col || '#ffffff', p.lineK || 1.5));
  if (p.lines) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines, col: p.col || '#ffffff', inner: 380, w: 2, alpha: .6 }, impFocus(f, p)));
};


// ---- additional styles matching the pre-production style names (pre/shots.json) -------------------------------
IMPACT.sumi = (c, g, f, p, k) => { // sumi-e: grey paper, figures as wet black ink, ink streaks along the motion
  const F = impFocus(f, p); fillAll(g, p.paper || '#d9d4c8');
  g.save(); g.globalAlpha = .18; g.globalCompositeOperation = 'multiply'; rawDraw(g, filtered(c, 'grayscale(1) contrast(1.6) brightness(1.2)')); g.restore();
  const sil = impSil('chars', p.ink || '#141016'); for (let i = 3; i >= 1; i--) { rawDraw(g, sil, (hash(i + k) - .5) * 14 * i * OUT.scale, (hash(i * 3 + k) - .5) * 8 * i * OUT.scale, .18); } rawDraw(g, sil);
  rawDraw(g, impSil('glow', p.ink || '#141016'), 0, 0, .7);
  g.save(); g.strokeStyle = p.ink || '#141016'; g.lineCap = 'round'; for (let i = 0; i < (p.strokes || 9); i++) { const a = (p.ang == null ? -.25 : p.ang) + (hash(i * 7 + k) - .5) * .4, L = 300 + hash(i + k * 5) * 900, y0 = F.y + (hash(i * 3 + k) - .5) * 500, x0 = F.x - L * .6; const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([x0 + Math.cos(a) * L * u, y0 + Math.sin(a) * L * u + Math.sin(u * 5 + i) * 10]); } inkPts(g, pts, 10 + hash(i * 11) * 40, rgba(p.ink || '#141016', .85), [.05, .6], .6); } g.restore();
  splatter(g, (p.seed || 4) + k * 13, 8, p.ink || '#141016', F, 800);
};
IMPACT.tear = (c, g, f, p, k, n) => { // the frame rips into black paper strips with white light between
  const src = copyComp(c), u = (k + 1) / Math.max(1, n), strips = p.strips || 9; fillAll(g, p.light || '#ffffff');
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  for (let i = 0; i < strips; i++) { const x0 = i / strips * W, x1 = (i + 1) / strips * W, dy = (hash(i * 5 + 1) - .5) * 260 * u, rot = (hash(i * 3) - .5) * .08 * u, jag = []; for (let j = 0; j <= 12; j++) jag.push([x1 + (hash(i * 31 + j) - .5) * 30, j / 12 * H]);
    g.save(); g.translate(0, dy); g.rotate(rot); g.beginPath(); g.moveTo(x0 + (i ? 8 : -20), -40); for (const q of jag) g.lineTo(q[0], q[1]); g.lineTo(x1, H + 40); g.lineTo(x0, H + 40); g.closePath(); g.save(); g.clip(); g.drawImage(src, 0, 0, src.width, src.height, 0, 0, W, H); if (p.dark !== false) { g.fillStyle = rgba('#000000', .45 + .4 * u); g.fillRect(0, -100, W, H + 200); } g.restore(); g.lineWidth = 4; g.strokeStyle = '#000'; g.stroke(); g.restore(); }
  g.restore();
};
IMPACT.kabuki = (c, g, f, p, k) => { // flat pine painting (gold + green), characters as flat paper dolls
  fillAll(g, p.gold || '#d8b048'); g.save(); g.fillStyle = rgba('#fff4c0', .35); for (let i = 0; i < 9; i++) g.fillRect(0, i * 130 + 30, W, 18); g.restore();
  g.save(); const r = rng(p.seed || 3); for (let i = 0; i < 6; i++) { const x = r() * W, y = 150 + r() * 600; g.strokeStyle = '#3a2a1a'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, H); g.quadraticCurveTo(x + (r() - .5) * 300, y + 200, x + (r() - .5) * 200, y); g.stroke(); for (let j = 0; j < 4; j++) { const cx = x + (r() - .5) * 360, cy = y + (r() - .5) * 140; g.fillStyle = j % 2 ? '#2e6a3a' : '#3f8a4a'; g.beginPath(); g.ellipse(cx, cy, 140 + r() * 80, 40 + r() * 20, (r() - .5) * .3, 0, TAU); g.fill(); } } g.restore();
  const sil = impSil('chars', '#fffaf0'); rawDraw(g, sil, 6 * OUT.scale, 6 * OUT.scale); rawDraw(g, impFigs(f, '#f2ead8', '#2a1a10', 1.6));
};
IMPACT.waterink = (c, g, f, p, k) => { // deep blue ink wash with white bubbles
  const t = filtered(c, 'grayscale(1) contrast(1.4)'); fillAll(g, p.col || '#0c2a6a'); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .55; rawDraw(g, t); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = p.col || '#0c2a6a'; g.globalAlpha = .6; g.fillRect(0, 0, W, H); g.restore();
  g.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { const x = hash(i * 3) * W, y = (hash(i * 7) * H - k * 40 + H) % H, r = 2 + hash(i * 11) * 14; g.beginPath(); g.arc(x, y, r, 0, TAU); g.globalAlpha = .5 + hash(i) * .5; g.fill(); } g.globalAlpha = 1;
};
IMPACT.crimsonline = (c, g, f, p, k) => { // white frame crossed by one crimson thread
  const F = impFocus(f, p); fillAll(g, p.bg || '#ffffff'); rawDraw(g, impFigs(f, p.bg || '#ffffff', '#d8d0d8', 1.1));
  const a = p.ang == null ? -.35 : p.ang, L = 2600; g.save(); g.translate(F.x, F.y); g.rotate(a); g.fillStyle = p.col || '#b8102a'; g.beginPath(); g.moveTo(-L, -1); g.lineTo(0, -(p.w || 5)); g.lineTo(L, -1); g.lineTo(L, 1); g.lineTo(0, (p.w || 5)); g.lineTo(-L, 1); g.closePath(); g.fill(); g.restore();
};
IMPACT.dualsplit = (c, g, f, p, k) => { // frame split into two colour halves, figures in negative
  const neg = filtered(c, 'invert(1) grayscale(1) contrast(2.2)'); rawDraw(g, neg);
  g.save(); g.globalCompositeOperation = 'multiply'; const a = p.ang == null ? .3 : p.ang; g.translate(W / 2, H / 2); g.rotate(a); g.fillStyle = p.col || '#ff8fb8'; g.fillRect(-2000, -2000, 2000, 4000); g.fillStyle = p.col2 || '#7fd8ff'; g.fillRect(0, -2000, 2000, 4000); g.restore();
  g.save(); g.translate(W / 2, H / 2); g.rotate(p.ang == null ? .3 : p.ang); g.fillStyle = '#ffffff'; g.fillRect(-4, -2000, 8, 4000); g.restore();
};
IMPACT.crystal = (c, g, f, p, k) => { // cyan-white facets + fracture lines over a blue negative
  const neg = filtered(c, 'invert(1) hue-rotate(180deg) saturate(1.6) contrast(1.3)'); rawDraw(g, neg);
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = p.tint || '#9fe0ff'; g.fillRect(0, 0, W, H); g.restore();
  const F = impFocus(f, p), r = rng((p.seed || 7) + k); g.save();
  for (let i = 0; i < 16; i++) { const a = r() * TAU, d = 80 + r() * 900, x = F.x + Math.cos(a) * d, y = F.y + Math.sin(a) * d, s = 60 + r() * 220; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * .5, y); g.lineTo(x, y + s * .6); g.lineTo(x - s * .4, y); g.closePath(); g.fillStyle = rgba('#ffffff', .25 + r() * .3); g.fill(); g.lineWidth = 2; g.strokeStyle = '#e8fbff'; g.stroke(); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { let a = r() * TAU, x = F.x, y = F.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { a += (r() - .5) * .7; x += Math.cos(a) * 160; y += Math.sin(a) * 160; g.lineTo(x, y); } g.stroke(); }
  g.restore();
};
IMPACT.toxic = (c, g, f, p, k) => { // acid green / violet, chromatic smear, warped vignette
  IMPACT.chroma(c, g, f, Object.assign({ d: 22, slices: 4 }, p), k);
  g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = k % 2 ? (p.col || '#9adf3a') : (p.col2 || '#9a4ad8'); g.globalAlpha = .75; g.fillRect(0, 0, W, H); g.restore();
  const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2 + 60 * Math.sin(k), H / 2, 1100); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,0,30,.85)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
};
IMPACT.rings = (c, g, f, p, k) => { // concentric shock rings slamming in (sound / reiatsu) over a darkened frame
  rawDraw(g, filtered(c, 'brightness(.55) saturate(1.3)')); const F = impFocus(f, p);
  for (let i = 0; i < 6; i++) { const r = 120 + i * 160 + k * 60; g.lineWidth = 16 - i * 2; g.strokeStyle = i % 2 ? (p.col || '#b8ff5a') : '#ffffff'; g.beginPath(); g.ellipse(F.x, F.y, r, r * .8, 0, 0, TAU); g.stroke(); }
};
IMPACT.speedburst = (c, g, f, p, k) => { // black & white focus-line burst
  fillAll(g, p.bg || '#ffffff'); rawDraw(g, impSil('chars', '#000000')); fxSpeedLines(g, f.T + k, Object.assign({ n: 160, col: '#000000', inner: 260, w: 10, alpha: 1 }, impFocus(f, p)));
};

// ------------------------------------------------------------------------------------------------- sequences
const IMPACT_SEQ = {
  // generic
  hit: [{ s: 'flash', n: 1 }, { s: 'invert', n: 2 }, { s: 'hatch', n: 1 }],
  hit_light: [{ s: 'invert', n: 1 }, { s: 'radial', n: 1 }],
  hit_heavy: [{ s: 'whiteout', n: 1 }, { s: 'invert', n: 1 }, { s: 'redblack', n: 2 }, { s: 'hatch', n: 1 }, { s: 'chroma', n: 1 }],
  clash: [{ s: 'flash', n: 1 }, { s: 'blackaccent', n: 2, p: { accent: '#ffffff' } }, { s: 'invert', n: 1 }],
  block: [{ s: 'rimsil', n: 2, p: { col: '#e8f0ff', col2: '#6a8ad0' } }, { s: 'radial', n: 2 }],
  explosion: [{ s: 'overexpose', n: 2 }, { s: 'invert', n: 1 }, { s: 'hatch', n: 2 }, { s: 'desat', n: 1 }],
  transform: [{ s: 'blackaccent', n: 2 }, { s: 'kanji', n: 3, p: { char: '解' } }, { s: 'whiteout', n: 1 }, { s: 'overexpose', n: 2 }],
  finale: [{ s: 'whiteout', n: 2 }, { s: 'hatch', n: 2 }, { s: 'redblack', n: 2 }, { s: 'shatter', n: 4 }, { s: 'flash', n: 1 }],
  stagger: [{ s: 'chroma', n: 1 }, { s: 'invert', n: 1 }, { s: 'chroma', n: 1 }],
  freeze: [{ s: 'whiteout', n: 3, p: { lines: 60 } }],
  // Kuchiki Byakuya
  byakuya_scatter: [{ s: 'duotone', n: 2, p: { dark: '#3a0a24', light: '#ffc2dc' } }, { s: 'hatch', n: 2, p: { accent: '#ff7aa8' } }, { s: 'invert', n: 1, p: { hue: 160 } }],
  byakuya_kageyoshi: [{ s: 'blackaccent', n: 2, p: { accent: '#ff8fb8', lines: 80 } }, { s: 'kanji', n: 3, p: { char: '桜', col: '#ffd6e6', outline: '#3a0a1e', tint: '#ff8fb8' } }, { s: 'overexpose', n: 1, p: { col: '#ff9ec4' } }],
  byakuya_senkei: [{ s: 'rimsil', n: 2, p: { col: '#ffe6f0', col2: '#e0507a' } }, { s: 'shatter', n: 3, p: { gap: '#ffd6e6' } }],
  byakuya_shukei: [{ s: 'whiteout', n: 2, p: { lines: 40 } }, { s: 'blackaccent', n: 2, p: { accent: '#ffffff' } }, { s: 'flash', n: 1 }],
  // Hitsugaya Toshiro
  toshiro_dragon: [{ s: 'duotone', n: 2, p: { dark: '#08203a', light: '#c8f4ff' } }, { s: 'kanji', n: 3, p: { char: '氷', col: '#e8fbff', outline: '#0a2a4a', tint: '#7fd0ff' } }, { s: 'invert', n: 1 }],
  toshiro_freeze: [{ s: 'whiteout', n: 2, p: { ink: '#0a2a4a', fxCol: '#cfeeff' } }, { s: 'shatter', n: 4, p: { gap: '#e8fbff', edge: '#2a5a8a' } }],
  toshiro_bankai: [{ s: 'overexpose', n: 2, p: { col: '#9fe0ff' } }, { s: 'blackaccent', n: 2, p: { accent: '#7fe8ff', lines: 70 } }, { s: 'panels', n: 2, p: { modes: ['zoom2', 'neg', 'orig'] } }],
  toshiro_hyoten: [{ s: 'desat', n: 3, p: { accent: '#7fd0ff' } }, { s: 'flash', n: 1, p: { col: '#e8fbff' } }],
  // Zaraki Kenpachi
  kenpachi_slash: [{ s: 'redblack', n: 2 }, { s: 'hatch', n: 2 }, { s: 'invert', n: 1 }],
  kenpachi_kendo: [{ s: 'whiteout', n: 1 }, { s: 'radial', n: 2, p: { lineCol: '#ffe36a' } }, { s: 'shatter', n: 3, p: { gap: '#ffe36a' } }, { s: 'redblack', n: 2 }],
  kenpachi_patch: [{ s: 'blackaccent', n: 3, p: { accent: '#ffd84a', lines: 90 } }, { s: 'kanji', n: 2, p: { char: '鬼', col: '#ffd84a', outline: '#2a1400' } }],
  kenpachi_bankai: [{ s: 'redblack', n: 2, p: { col: '#a00808' } }, { s: 'chroma', n: 2, p: { d: 40 } }, { s: 'kanji', n: 2, p: { char: '剣', col: '#ff3a2a', col2: '#ffd84a', outline: '#000' } }, { s: 'overexpose', n: 1, p: { col: '#ff5a3a' } }],
  // Kyoraku Shunsui
  kyoraku_kageoni: [{ s: 'ink', n: 2, p: { col: '#ffb0cc', lines: 50 } }, { s: 'blackaccent', n: 2, p: { accent: '#ff8fb6' } }],
  kyoraku_takaoni: [{ s: 'lens', n: 3, p: { k: .8 } }, { s: 'invert', n: 1, p: { hue: 200 } }],
  kyoraku_irooni: [{ s: 'panels', n: 3, p: { modes: ['zoom', 'mono', 'neg'] } }, { s: 'chroma', n: 1 }],
  kyoraku_karamatsu: [{ s: 'desat', n: 3, p: { c: 1.4, b: .8 } }, { s: 'hatch', n: 2, p: { paper: '#e8dcd0', ink: '#2a0a1a' } }, { s: 'redblack', n: 1, p: { col: '#6a0a2a' } }],
  // Tosen Kaname
  tosen_suzumushi: [{ s: 'radial', n: 2, p: { lineCol: '#e8e0ff', ringCol: '#d8d0ff' } }, { s: 'invert', n: 1, p: { hue: 60 } }, { s: 'ink', n: 2, p: { col: '#d8d0ff' } }],
  tosen_benihiko: [{ s: 'rimsil', n: 2, p: { col: '#f0eaff', col2: '#7a6ad0' } }, { s: 'flash', n: 1 }, { s: 'hatch', n: 2 }],
  tosen_enma: [{ s: 'ink', n: 4, p: { col: '#ffffff', lines: 0 } }, { s: 'blackaccent', n: 2, p: { accent: '#9a8aff' } }],
  tosen_grillo: [{ s: 'chroma', n: 2 }, { s: 'duotone', n: 2, p: { dark: '#0a2a1a', light: '#c8ffe0' } }, { s: 'shatter', n: 2 }],
  // Kurotsuchi Mayuri
  mayuri_paralyze: [{ s: 'duotone', n: 2, p: { dark: '#1a0a2a', light: '#d8b0ff' } }, { s: 'chroma', n: 2, p: { d: 34 } }],
  mayuri_konjiki: [{ s: 'overexpose', n: 1, p: { col: '#ffd84a' } }, { s: 'kanji', n: 3, p: { char: '金', col: '#ffd84a', col2: '#fff6c8', outline: '#3a1a00' } }, { s: 'hatch', n: 2, p: { paper: '#fff2c8' } }],
  mayuri_poison: [{ s: 'desat', n: 2, p: { accent: '#b07ae0' } }, { s: 'lens', n: 2, p: { k: .6 } }],
  mayuri_grin: [{ s: 'closeup', n: 3, p: { part: 'mouth', strip: true, stripH: 340, lineCol: '#d8b0ff' } }, { s: 'invert', n: 1 }],
  // close-up generic
  eye_flash: [{ s: 'closeup', n: 3, p: { part: 'eye', strip: true, stripH: 260 } }, { s: 'flash', n: 1 }],
};

// ---- aliases: style names used in the pre-production shot list (pre/shots.json -> impact.style + pattern) -------
Object.assign(IMPACT_SEQ, {
  WHITE_NEG: [{ s: 'flash', n: 1 }, { s: 'invert', n: 2, p: { lines: 0 } }, { s: 'flash', n: 1 }],
  MANGA_HALFTONE: [{ s: 'hatch', n: 2 }],
  CHROMA_SPLIT: [{ s: 'chroma', n: 1 }, { s: 'chroma', n: 1, p: { d: 40 } }, { s: 'chroma', n: 1, p: { d: 18 } }],
  RED_BLACK: [{ s: 'redblack', n: 2 }, { s: 'flash', n: 1 }, { s: 'redblack', n: 1 }],
  SAKURA_PINK: [{ s: 'rimsil', n: 1, p: { col: '#ffd6e6', col2: '#ff7aa8' } }, { s: 'ink', n: 1, p: { col: '#ffb0cc' } }, { s: 'rimsil', n: 1, p: { col: '#ffd6e6', col2: '#ff7aa8' } }],
  SUMI_INK: [{ s: 'sumi', n: 2 }, { s: 'flash', n: 1 }],
  ICE_CRYSTAL: [{ s: 'crystal', n: 2 }, { s: 'invert', n: 1, p: { hue: 180 } }, { s: 'crystal', n: 1 }],
  SPEEDLINE_BURST: [{ s: 'speedburst', n: 1 }, { s: 'flash', n: 1 }, { s: 'speedburst', n: 2 }],
  DUAL_TONE: [{ s: 'dualsplit', n: 1 }, { s: 'flash', n: 1 }],
  MANGA_RED: [{ s: 'hatch', n: 1, p: { paper: '#e82a2a', accent: '#ffd84a' } }, { s: 'redblack', n: 2 }, { s: 'hatch', n: 1, p: { paper: '#e82a2a' } }],
  GLASS_SHATTER: [{ s: 'shatter', n: 1, p: { gap: '#ffb0cc' } }, { s: 'flash', n: 1 }, { s: 'shatter', n: 1, p: { gap: '#9fe8ff', push: 140 } }],
  VOID_LINEART: [{ s: 'ink', n: 2 }, { s: 'whiteout', n: 1 }, { s: 'ink', n: 1 }],
  PAPER_TEAR: [{ s: 'tear', n: 2 }, { s: 'invert', n: 1 }, { s: 'flash', n: 1 }],
  EYE_ORANGE: [{ s: 'closeup', n: 1, p: { part: 'eye', mode: 'invert', bg: '#e8822e' } }, { s: 'invert', n: 1 }],
  SAKURA_NEG: [{ s: 'invert', n: 1, p: { hue: 150 } }, { s: 'blackaccent', n: 2, p: { accent: '#ff8fb8' } }, { s: 'flash', n: 1 }],
  ICE_WINGS: [{ s: 'crystal', n: 1 }, { s: 'whiteout', n: 1, p: { ink: '#0a2a4a' } }, { s: 'crystal', n: 2 }],
  ICE_SHIELD_RINGS: [{ s: 'rings', n: 2 }, { s: 'crystal', n: 1 }, { s: 'flash', n: 1 }],
  INK_PETAL: [{ s: 'sumi', n: 1 }, { s: 'rimsil', n: 1, p: { col: '#ffd6e6', col2: '#ff7aa8' } }, { s: 'sumi', n: 1 }],
  TOXIC: [{ s: 'toxic', n: 1 }, { s: 'chroma', n: 1 }, { s: 'toxic', n: 1 }],
  RED_BLACK_SPLIT: [{ s: 'redblack', n: 1 }, { s: 'crimsonline', n: 1, p: { col: '#ffffff', bg: '#000000', w: 9 } }, { s: 'redblack', n: 2 }],
  SCREAM_WAVE: [{ s: 'hatch', n: 1 }, { s: 'toxic', n: 2, p: { col: '#5aff8a', col2: '#5aff8a' } }, { s: 'hatch', n: 1 }],
  KABUKI_BOARD: [{ s: 'kabuki', n: 2 }, { s: 'sumi', n: 1 }, { s: 'kabuki', n: 1 }],
  WATER_INK: [{ s: 'waterink', n: 2 }, { s: 'flash', n: 1 }],
  CRIMSON_WHITE: [{ s: 'flash', n: 1 }, { s: 'crimsonline', n: 2 }, { s: 'flash', n: 1 }],
  SILHOUETTE_ORANGE: [{ s: 'rimsil', n: 2, p: { col: '#ffb04a', col2: '#e8501a' } }, { s: 'redblack', n: 1 }, { s: 'rimsil', n: 2, p: { col: '#ffb04a', col2: '#e8501a' } }],
  TOXIC_SPLASH: [{ s: 'toxic', n: 1 }, { s: 'flash', n: 1 }, { s: 'toxic', n: 1 }],
  SENKEI_LIGHTS: [{ s: 'rimsil', n: 1, p: { col: '#ffe6f0', col2: '#e0507a' } }, { s: 'flash', n: 1 }, { s: 'rimsil', n: 1, p: { col: '#ffe6f0', col2: '#e0507a' } }, { s: 'invert', n: 1, p: { hue: 150 } }],
});
function impactSteps(seq, p) {
  if (Array.isArray(seq)) return seq;
  if (IMPACT_SEQ[seq]) return IMPACT_SEQ[seq];
  if (IMPACT[seq]) return [{ s: seq, n: p.n || 2 }];
  throw new Error('unknown impact ' + seq);
}
function impactLen(seq, p = {}) { return impactSteps(seq, p).reduce((a, s) => a + (s.n || 1), 0); }
function impactActive(f, seq, t0, p = {}) { const fr = Math.floor((f.lt - t0) * FPS + 1e-6); return fr >= 0 && fr < impactLen(seq, p); }
const PAPER_STYLES = new Set(['hatch', 'whiteout', 'redblack', 'ink', 'kanji', 'sumi', 'speedburst', 'crimsonline', 'rimsil', 'kabuki', 'blackaccent', 'tear', 'panels', 'duotone', 'posterize', 'dualsplit']);
function applyImpact(c, f, t) {
  const { seq, params } = f._impact, t0 = params.t0 || 0, fr = Math.floor((f.lt - t0) * FPS + 1e-6); if (fr < 0) return;
  const steps = impactSteps(seq, params); let acc = 0;
  for (const st of steps) { const n = st.n || 1; if (fr < acc + n) { const fn = IMPACT[st.s]; if (!fn) throw new Error('impact style ' + st.s); const g = c.getContext('2d'); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); fn(c, g, f, Object.assign({}, params, st.p || {}), fr - acc, n); g.restore();
      if (PAPER_STYLES.has(st.s) && params.paper !== false) { const gg = c.getContext('2d'); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); if (!LAY._impPaper) LAY._impPaper = gg.createPattern(brushTex(41, 512), 'repeat'); gg.globalCompositeOperation = 'multiply'; gg.globalAlpha = .32; gg.fillStyle = LAY._impPaper; gg.translate((fr * 37) % 256, (fr * 53) % 256); gg.fillRect(-256, -256, c.width + 512, c.height + 512); gg.restore(); }
      if (params.jolt || st.jolt) { const j = (params.jolt || st.jolt) * OUT.scale, tmp = copyComp(c), gg = c.getContext('2d'); gg.setTransform(1, 0, 0, 1, 0, 0); gg.fillStyle = '#000'; gg.fillRect(0, 0, c.width, c.height); gg.drawImage(tmp, (hash(fr + 3) - .5) * j * 2, (hash(fr + 7) - .5) * j * 2); }
      return; } acc += n; }
}
