/* Bleach Showdown engine - post.js : compositor + photography (satsuei) pass.
   renderTime(t) builds the frame (timeline.js) and composites layers at output scale:
     BG (sets, rack-focus blur) -> figure contact shadows -> fx 'under' -> figures (depth sorted with props,
     afterimages, per-figure DOF) -> fx 'over' -> FG -> fx 'glow' (additive, feeds bloom) -> bloom + halation ->
     colour grade (tint / lift / soft-light / saturation / contrast) -> light leaks & lens flare -> impact frame
     processing (impact.js, may replace the whole image) -> chromatic aberration -> motion blur -> vignette -> film
     grain -> flash -> text overlays (sharp) .
   Post params (f.post / shot.post):  bloom (0..1.5), bloomR (px), halation (0..1), ca (px), vignette (0..1),
     grain (0...2), blur (motion blur px), blurAng, flare: {x,y,col,a}, leak: {col,a,side}
   Grade (f.grade): tint:[hex,k] multiply, lift:[hex,k] screen, soft:[hex,k] soft-light, sat, contrast, bright   */
'use strict';
const OUT = { canvas: null, ctx: null, scale: SCALE };
const LAY = {};
function layer(name) { const w = Math.round(W * OUT.scale), h = Math.round(H * OUT.scale); let c = LAY[name]; if (!c || c.width !== w || c.height !== h) { c = LAY[name] = mkCanvas(w, h); } const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); return c; }
function beginLayer(name, clear = true) { const c = layer(name), g = c.getContext('2d'); if (clear) g.clearRect(0, 0, c.width, c.height); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; return g; }
const POST_DEFAULT = { bloom: .45, bloomR: 18, halation: .25, ca: .8, vignette: .35, grain: .05, blur: 0 };
let GRAIN = null;
function grainTex() { if (GRAIN) return GRAIN; GRAIN = []; for (let k = 0; k < 6; k++) { const s = 256, c = mkCanvas(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), r = rng(900 + k); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 255 * .9; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); GRAIN.push(c); } return GRAIN; }

function drawBgItem(g, item, t, f, layerName) {
  if (typeof item === 'function') { item(g, t, f); return; }
  drawSet(g, item.set, t, Object.assign({}, item, { layer: layerName === 'fg' ? 'fg' : (item.zSplit != null ? 'bg' : 'all') }));
}
function contactShadow(g, F, t, opt) {
  const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t); const k = S.B.h / 1.8;
  const mid = vLerp(S.J.anL, S.J.anR, .5), hgt = Math.max(0, Math.min(S.J.heelL[1], S.J.heelR[1]) - (opt.groundY || 0));
  const a = clamp(1 - hgt / 2.5, 0, 1) * (opt.shadowA || .38); if (a <= .01) return;
  const rx = (.42 + vDist(S.J.anL, S.J.anR) * .5) * k * (1 + hgt * .3), rz = .3 * k * (1 + hgt * .3);
  const pts = []; for (let i = 0; i < 20; i++) { const an = i / 20 * TAU; pts.push([mid[0] + Math.cos(an) * rx, (opt.groundY || 0) + .004, mid[2] + Math.sin(an) * rz]); }
  const sp = projPoly(pts); if (sp.length < 3) return; polyPath(g, sp); g.fillStyle = rgba(opt.shadowCol || '#2a2040', a); g.fill();
}
function renderFigures(g, f, t) {
  const items = [];
  for (const it of f._figs) {
    const F = it.F, opt = it.opt, tf = opt.t != null ? opt.t : t;
    const S = figSkel(F, F.timing > 1 ? onN(tf, F.timing) : tf);
    const style = opt.style || f._style || 'action3d';
    items.push({ z: camDepth(S.J.pelvis) + (opt.zBias || 0), fn: gg => {
      const prevStyle = LIGHT.style, prevBoil = LIGHT.boil; LIGHT.style = style; LIGHT.boil = style === 'hand2d' ? (opt.boil == null ? .9 : opt.boil) : 0; LIGHT.drawIdx = drawIdx(tf, F.timing || 2);
      try {
      if (opt.afterimages) opt.afterimages.forEach((dt, i) => drawFig(gg, F, tf - dt, { mode: 'flat', col: opt.afterCol || '#bfe8ff', alpha: (opt.afterA || .5) * (1 - i / opt.afterimages.length) }));
      if (opt.hidden) return;
      const blur = opt.dof !== false && f._cam && f._cam.aperture ? dofBlur(camDepth(S.J.pelvis)) : 0;
      if (blur > .8) { const lg = beginLayer('figdof'); lg.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); drawFig(lg, F, tf, opt); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.filter = `blur(${(blur * OUT.scale).toFixed(1)}px)`; gg.drawImage(layer('figdof'), 0, 0); gg.restore(); }
      else if (opt.alpha != null && opt.alpha < 1 && opt.mode !== 'flat') { const lg = beginLayer('figAlpha'); drawFig(lg, F, tf, opt); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = opt.alpha; gg.drawImage(layer('figAlpha'), 0, 0); gg.restore(); }
      else drawFig(gg, F, tf, opt);
      } finally { LIGHT.style = prevStyle; LIGHT.boil = prevBoil; }
    } });
  }
  for (const p of f._props) items.push(Array.isArray(p.z) ? { z: camDepth(p.z), fn: p.fn } : p);   // z may be a world point (depth taken with the final camera)
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.fn(g);
}
function applyGrade(c, gr) {
  if (!gr || !Object.keys(gr).length) return;
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  if (gr.sat != null || gr.contrast != null || gr.bright != null || gr.hue != null) {
    const tmp = layer('gradeTmp'), tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tmp.width, tmp.height);
    tg.filter = `saturate(${gr.sat == null ? 1 : gr.sat}) contrast(${gr.contrast == null ? 1 : gr.contrast}) brightness(${gr.bright == null ? 1 : gr.bright})${gr.hue ? ` hue-rotate(${gr.hue}deg)` : ''}`; tg.drawImage(c, 0, 0); tg.filter = 'none';
    g.clearRect(0, 0, c.width, c.height); g.drawImage(tmp, 0, 0);
  }
  const fillMode = (mode, col, k) => { g.globalCompositeOperation = mode; g.globalAlpha = k; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
  if (gr.tint) fillMode('multiply', gr.tint[0], gr.tint[1]);
  if (gr.lift) fillMode('screen', gr.lift[0], gr.lift[1]);
  if (gr.soft) fillMode('soft-light', gr.soft[0], gr.soft[1]);
  if (gr.color) fillMode('color', gr.color[0], gr.color[1]);
}
function bloomPass(c, src, amt, rad, halation) {
  if (amt <= 0) return; const q = 4, w = Math.max(2, Math.round(c.width / q)), h = Math.max(2, Math.round(c.height / q));
  let b = LAY._bloom; if (!b || b.width !== w || b.height !== h) b = LAY._bloom = mkCanvas(w, h);
  const bg = b.getContext('2d'); bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, w, h);
  // bright pass via contrast/brightness, then blur at quarter res
  { const tw = 32, th = 18; let sm = LAY._bloomMean; if (!sm) sm = LAY._bloomMean = mkCanvas(tw, th); const sg = sm.getContext('2d'); sg.drawImage(src, 0, 0, tw, th); const d = sg.getImageData(0, 0, tw, th).data; let m = 0; for (let i = 0; i < d.length; i += 4) m += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; m /= (d.length / 4) * 255;
    if (m > .5) amt *= clamp(1 - (m - .5) / .3, .25, 1); }   // bright frames: weaker bloom (no white disc)
  bg.filter = `brightness(.75) contrast(2.6) blur(${(rad * OUT.scale / q).toFixed(1)}px)`; bg.drawImage(src, 0, 0, w, h); bg.filter = 'none';
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.globalAlpha = clamp(amt, 0, 1.5) * .8; g.drawImage(b, 0, 0, c.width, c.height);
  if (halation > 0) { g.globalCompositeOperation = 'screen'; g.globalAlpha = halation * .5; g.filter = 'sepia(1) saturate(4) hue-rotate(-30deg)'; g.drawImage(b, -6, -4, c.width + 12, c.height + 8); g.filter = 'none'; }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function glowLayerAdd(c, glow, amt = 1) { const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = amt; g.drawImage(glow, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
function chromaPass(c, px) {
  if (px <= .2) return; const w = c.width, h = c.height, s = px * OUT.scale;
  const tmp = c; // fringes are sampled straight from the frame (saves a full-frame copy; the 2nd fringe sees the 1st, invisible at these offsets)
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  // red fringe outward, blue inward: screen channel-isolated copies over the original
  const ch = layer('caCh'), cg = ch.getContext('2d');
  for (const [col, k] of [['#ff0000', 1], ['#0000ff', -1]]) {
    cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, w, h);
    const sc = 1 + k * s / w * 2; cg.drawImage(tmp, w / 2 - w * sc / 2, h / 2 - h * sc / 2, w * sc, h * sc);
    cg.globalCompositeOperation = 'multiply'; cg.fillStyle = col; cg.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighten'; g.globalAlpha = .55; g.drawImage(ch, 0, 0);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function motionBlurPass(c, px, ang = 0) {
  if (px < 1) return; const g = c.getContext('2d'), tmp = layer('mbTmp'), tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tmp.width, tmp.height); tg.drawImage(c, 0, 0);
  const n = Math.min(10, 3 + Math.floor(px / 12)), dx = Math.cos(ang) * px * OUT.scale, dy = Math.sin(ang) * px * OUT.scale;
  g.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < n; i++) { const u = i / (n - 1) - .5; g.globalAlpha = 1 / (i + 1.4); g.drawImage(tmp, dx * u, dy * u); } g.globalAlpha = 1;
}
function vignettePass(c, k) { if (k <= 0) return; const g = c.getContext('2d'); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const gr = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(10,4,18,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function grainPass(c, k, t) { if (k <= 0) return; const g = c.getContext('2d'), tx = grainTex(), i = Math.floor(t * FPS) % tx.length; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = k * 2.2; const pat = g.createPattern(tx[i], 'repeat'); g.fillStyle = pat; g.save(); g.translate((hash(Math.floor(t * FPS)) * 256) | 0, (hash(Math.floor(t * FPS) + 9) * 256) | 0); g.fillRect(-256, -256, c.width + 512, c.height + 512); g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
function flarePass(c, fl) { if (!fl) return; const g = c.getContext('2d'); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.globalCompositeOperation = 'screen'; const a = fl.a == null ? 1 : fl.a, col = fl.col || '#ffd9a0';
  glow(g, fl.x, fl.y, 420, col, .55 * a); glow(g, fl.x, fl.y, 90, '#ffffff', .9 * a); g.fillStyle = rgba(col, .35 * a); g.fillRect(0, fl.y - 1.5, W, 3);
  const cx = W / 2, cy = H / 2; [[.4, 50, '#9fd0ff'], [.8, 26, '#ffb0e0'], [1.3, 80, '#b0ffd0'], [1.7, 34, '#ffe0a0']].forEach(([k2, r, cc]) => { const px = fl.x + (cx - fl.x) * k2 * 2, py = fl.y + (cy - fl.y) * k2 * 2; g.strokeStyle = rgba(cc, .35 * a); g.lineWidth = 3; g.beginPath(); g.arc(px, py, r, 0, TAU); g.stroke(); glow(g, px, py, r, cc, .18 * a); });
  g.globalCompositeOperation = 'source-over'; }

/* ---------------------------------------------------------------------------------------------- main entry */
function composeFrame(t, outCanvas) {
  const f = buildFrame(t);
  if (!f || !f._split) return composeOne(f, t, outCanvas);
  // split screen: render panel 0 into the output, panel 1 into a spare canvas, then cut along the slanted divider
  const sp = f._split; composeOne(f, t, outCanvas);
  const B = layer('splitB'); const f1 = buildFrame(t, 1); composeOne(f1, t, B);
  const g = outCanvas.getContext('2d'), w = outCanvas.width, h = outCanvas.height, x0 = sp.x * w, dx = Math.tan(sp.ang) * h / 2;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.moveTo(x0 + dx, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(x0 - dx, h); g.closePath(); g.clip(); g.drawImage(B, 0, 0); g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = sp.col; g.lineWidth = sp.gap * (w / 1920); g.beginPath(); g.moveTo(x0 + dx, -2); g.lineTo(x0 - dx, h + 2); g.stroke(); g.restore();
  buildFrame(t, 0);
}
function composeOne(f, t, outCanvas) {
  const c = outCanvas, g0 = c.getContext('2d');
  g0.setTransform(1, 0, 0, 1, 0, 0); g0.fillStyle = '#000'; g0.fillRect(0, 0, c.width, c.height);
  if (!f) return;
  // camera + shake
  let cam = f._cam || camLook([0, 1, 0], 6, 0, .05, 35);
  if (f._shake.length) cam = camShake(cam, f._shake, f.lt);
  CAM.set(cam);
  if (f._light) Object.assign(LIGHT, f._light);
  const P = Object.assign({}, POST_DEFAULT, f._post);
  // BG
  const bg = beginLayer('bg'); for (const item of f._bg) drawBgItem(bg, item, t, f, 'bg');
  if (f._paintBG !== false) paintLayer('bg', Object.assign(f._style === 'hand2d' ? { soft: .3, alpha: .2, dab: 10 } : { soft: .22, alpha: .12, dab: 10 }, f._paintBG || {}), t);
  const bgBlur = cam.aperture ? dofBlur(cam.bgDepth || 60) : (P.bgBlur || 0);
  // main comp canvas
  const comp = layer('comp'), g = comp.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, comp.width, comp.height);
  if (bgBlur > .5) { g.filter = `blur(${(bgBlur * OUT.scale).toFixed(1)}px)`; g.drawImage(layer('bg'), 0, 0); g.filter = 'none'; } else g.drawImage(layer('bg'), 0, 0);
  g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  for (const it of f._figs) if (it.opt.shadow !== false && !it.opt.hidden) contactShadow(g, it.F, it.opt.t != null ? it.opt.t : t, it.opt);
  for (const fn of f._fx.under) { g.save(); fn(g, t, f); g.restore(); }
  // figures into their own layer (impact frames need the character mask)
  const chars = beginLayer('chars'); renderFigures(chars, f, t);
  if (f._style === 'hand2d' || P.figTex) figureTexture(P.figTex == null ? .35 : P.figTex);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer('chars'), 0, 0); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  const fxo = beginLayer('fxover'); for (const fn of f._fx.over) { fxo.save(); fn(fxo, t, f); fxo.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer('fxover'), 0, 0); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  for (const item of f._fg) { g.save(); drawBgItem(g, item, t, f, 'fg'); g.restore(); }
  const gl = beginLayer('glow'); for (const fn of f._fx.glow) { gl.save(); fn(gl, t, f); gl.restore(); }
  glowLayerAdd(comp, layer('glow'), 1);
  // photography
  bloomPass(comp, comp, P.bloom, P.bloomR, P.halation);
  applyGrade(comp, f._grade);
  if (P.leak) { const lg = comp.getContext('2d'); lg.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); lg.globalCompositeOperation = 'screen'; const x = P.leak.side === 'left' ? 0 : W; const gr = lg.createRadialGradient(x, H * .3, 0, x, H * .3, W * .6); gr.addColorStop(0, rgba(P.leak.col || '#ff9a5a', P.leak.a || .5)); gr.addColorStop(1, rgba(P.leak.col || '#ff9a5a', 0)); lg.fillStyle = gr; lg.fillRect(0, 0, W, H); lg.globalCompositeOperation = 'source-over'; }
  flarePass(comp, P.flare);
  // screen-space processes (fx_sad.js: Sakanade inverted world, Kyoka Suigetsu shatter ...) with an optional nullified circle
  if (f._screen && f._screen.length) { const nl = f._nullify; let base = null; if (nl) { base = layer('nlBase'); const bg2 = base.getContext('2d'); bg2.setTransform(1, 0, 0, 1, 0, 0); bg2.clearRect(0, 0, base.width, base.height); bg2.drawImage(comp, 0, 0); }
    for (const fn of f._screen) { const sg = comp.getContext('2d'); sg.save(); sg.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); fn(comp, sg, f, t); sg.restore(); }
    if (nl && typeof sadNullifyRestore === 'function') sadNullifyRestore(comp, base, f, nl, t); }
  // impact frame processing (may replace the image)
  if (f._impact && typeof applyImpact === 'function') applyImpact(comp, f, t);
  chromaPass(comp, P.ca);
  motionBlurPass(comp, Math.max(P.blur || 0, f._blur || 0), f._blurAng || P.blurAng || 0);
  vignettePass(comp, P.vignette);
  grainPass(comp, P.grain, t);
  const cg = comp.getContext('2d'); cg.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  for (const [col, a] of f._flash) { cg.globalAlpha = clamp(a, 0, 1); cg.fillStyle = col; cg.fillRect(0, 0, W, H); cg.globalAlpha = 1; }
  for (const fn of f._fx.top) { cg.save(); fn(cg, t, f); cg.restore(); }
  if (f._trans) drawTransition(cg, f, t);
  for (const ov of (PROGRAM.overlays || [])) { cg.save(); ov(cg, t, f); cg.restore(); }
  for (const fn of f._text) { cg.save(); fn(cg, t, f); cg.restore(); }
  g0.drawImage(comp, 0, 0);
}
function renderTime(t) { composeFrame(t, OUT.canvas); }

// gouache texture on the figures (masked to the character layer)
function figureTexture(k) {
  const ch = layer('chars'), tmp = layer('figTex'), g = tmp.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, tmp.width, tmp.height);
  g.drawImage(ch, 0, 0); g.globalCompositeOperation = 'source-in'; if (!LAY._texPatF) LAY._texPatF = g.createPattern(brushTex(5, 512), 'repeat'); g.fillStyle = LAY._texPatF; g.fillRect(0, 0, tmp.width, tmp.height);
  const cg = ch.getContext('2d'); cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalCompositeOperation = 'soft-light'; cg.globalAlpha = k; cg.drawImage(tmp, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
}
/* painterly pass over a layer: oriented gouache dabs sampled from a low-res copy + soft wash + paper grain + edge
   darkening.  o: { dab (px spacing), alpha, soft, paper, seed }.  Dab positions are anchored to the screen grid.  */
function paintLayer(name, o, t) {
  const c = layer(name), w = c.width, h = c.height, sc = OUT.scale, step = Math.max(4, Math.round((o.dab || 13) * sc));
  const gw = Math.ceil(w / step), gh = Math.ceil(h / step);
  let sm = LAY._paintSm; if (!sm || sm.width !== gw || sm.height !== gh) sm = LAY._paintSm = mkCanvas(gw, gh);
  const sg = sm.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, gw, gh); sg.drawImage(c, 0, 0, gw, gh); const d = sg.getImageData(0, 0, gw, gh).data;
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  // soft wash: a blurred copy laid over at partial strength (kills hard polygon edges)
  if (o.soft !== 0) { // blurred copy at half resolution (4x cheaper than a full-res blur), laid over at partial strength
    let hb = LAY._paintHalf; const hw = Math.ceil(w / 2), hh = Math.ceil(h / 2); if (!hb || hb.width !== hw || hb.height !== hh) hb = LAY._paintHalf = mkCanvas(hw, hh);
    const hg = hb.getContext('2d'); hg.setTransform(1, 0, 0, 1, 0, 0); hg.clearRect(0, 0, hw, hh); hg.filter = `blur(${(1.1 * sc).toFixed(1)}px)`; hg.drawImage(c, 0, 0, hw, hh); hg.filter = 'none';
    g.globalAlpha = o.soft == null ? .45 : o.soft; g.imageSmoothingEnabled = true; g.drawImage(hb, 0, 0, w, h); g.globalAlpha = 1; }
  const L = (x, y) => { x = clamp(x, 0, gw - 1); y = clamp(y, 0, gh - 1); const i = (y * gw + x) * 4; return d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; };
  const r = rng(o.seed || 17), a0 = o.alpha == null ? .55 : o.alpha;
  // dabs batched by quantised colour: one Path2D + one fill per colour bucket instead of one fill per dab (~20k -> a few hundred)
  const buckets = new Map();
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const i = (y * gw + x) * 4; if (d[i + 3] < 8) { r(); r(); continue; }
    const gx = L(x + 1, y) - L(x - 1, y), gy = L(x, y + 1) - L(x, y - 1), ang = Math.atan2(gy, gx) + HP + (r() - .5) * .5, len = step * (1.1 + r() * .9), wid = step * (.35 + r() * .25);
    const k = (r() - .5) * 18, q = v => clamp((v + k) >> 4, 0, 15), key = (q(d[i]) << 8) | (q(d[i + 1]) << 4) | q(d[i + 2] * .9 + d[i + 2] * .1);
    let P = buckets.get(key); if (!P) { P = new Path2D(); buckets.set(key, P); }
    const cx = (x + .5) * step + (r() - .5) * step * .6, cy = (y + .5) * step + (r() - .5) * step * .6; P.moveTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); P.ellipse(cx, cy, len, wid, ang, 0, TAU);
  }
  for (const [key, P] of buckets) { const R = ((key >> 8) & 15) * 17, G = ((key >> 4) & 15) * 17, B = (key & 15) * 17; g.fillStyle = `rgba(${R},${G},${B},${a0})`; g.fill(P); }
  // paper grain + watercolour edge darkening
  if (!LAY._paperPat) LAY._paperPat = g.createPattern(brushTex(23, 512), 'repeat');
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = o.paper == null ? .35 : o.paper; g.fillStyle = LAY._paperPat; g.fillRect(0, 0, w, h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
/* transition overlays at the start of a shot: f.trans({ type: 'inkWipe'|'whiteFlash'|'smear'|'petals'|'iris', dur, col, dir }) */
function drawTransition(g, f, t) {
  const o = f._trans, u = f.lt / (o.dur || .25); if (u >= 1 || u < 0) return; const col = o.col || '#0a0610';
  g.save();
  if (o.type === 'whiteFlash') { g.globalAlpha = 1 - u; g.fillStyle = o.col || '#ffffff'; g.fillRect(0, 0, W, H); }
  else if (o.type === 'inkWipe') { // a black brush sweep that uncovers the new shot
    const x = lerp(-.2, 1.25, easeOut(u)) * W, dir = o.dir || 1; g.fillStyle = col; g.beginPath(); g.moveTo(dir > 0 ? W : 0, -20);
    for (let k = 0; k <= 20; k++) { const y = k / 20 * (H + 40) - 20; g.lineTo((dir > 0 ? x : W - x) + Math.sin(k * 1.7) * 40 + (hash(k) - .5) * 60, y); } g.lineTo(dir > 0 ? W : 0, H + 20); g.closePath(); g.fill();
    for (let k = 0; k < 14; k++) { const y = hash(k * 3) * H, xx = (dir > 0 ? x : W - x) + (hash(k * 5) - .5) * 80; g.beginPath(); g.arc(xx - dir * (20 + hash(k) * 60), y, 4 + hash(k * 7) * 16, 0, TAU); g.fill(); } }
  else if (o.type === 'smear') { g.globalAlpha = (1 - u) * .85; fxSpeedBG(g, f.T, { ang: o.ang || 0, col: '#ffffff', col2: o.col || '#ffd0e0', alpha: 1, n: 90, w: 30 }); }
  else if (o.type === 'iris') { const r = easeOut(u) * Math.hypot(W, H) * .6; g.fillStyle = col; g.beginPath(); g.rect(0, 0, W, H); g.arc(o.x || W / 2, o.y || H / 2, r, 0, TAU, true); g.fill(); }
  else if (o.type === 'petals') { g.globalAlpha = 1 - u; fxPetals(g, f.lt, { n: 260, size: .035, flow: (i, uu, tt) => vAdd(CAM.cur.pos, vAdd(vMul(CAM.cur.R, (hash(i) - .5) * 5 + tt * 9 - 2), vAdd(vMul(CAM.cur.U, (hash(i * 3) - .5) * 3), vMul(CAM.cur.F, 2.5 + hash(i * 5) * 3)))) }); }
  g.restore();
}
