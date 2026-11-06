/* engine/fx_gdm.js (gojo-dazai-manga project only) - MANGA INK style pass + lettering + page/panel overlays.
   gdmManga(f, o)          registers a screen process: frame -> black/white manga (paper white, ink black, rotated screentone dots, diagonal
                           hatching) with ONE accent colour kept (blue-violet hues -> GDM.acc ramp), then the figures are re-rendered as thick
                           weighted hand2d ink lineart and multiplied on top.  o: {t1, t2, lineK, figs:false, accent:false, paper, tone}
   gdmTitle(g, lt, o)      big technique lettering: brush kanji (Yuji Boku) + English (Dela Gothic One), thick ink edge, accent offset, slam-in.
   gdmSub(g, lt, o)        caption box (manga narration box) {t0, t1, who, text, side}
   gdmPage(g, lt, o)       page gutter + panel border around the frame {inset, slant, tilt}
   gdmOno(g, lt, o)        hand lettered onomatopoeia (katakana) {text, x, y, size, rot, t0, dur, col}
   gdmBG(g, T, f, o)       graphic manga backgrounds: 'tone' (screentone gradient + ink horizon), 'speed' (parallel speed lines), 'focus' (focus lines),
                           'black' (ink with white flecks)                                                                          */
'use strict';
const GDM = { acc: '#1f6bff', accL: '#9cc8ff', accD: '#0a1f6a', paper: '#f7f4ec', ink: '#0b0a0e' };
function gdmManga(f, o = {}) {
  f.screen((comp, g, ff, t) => {
    const s = OUT.scale, cg = comp.getContext('2d'); cg.setTransform(1, 0, 0, 1, 0, 0);
    const w = comp.width, h = comp.height, im = cg.getImageData(0, 0, w, h), d = im.data;
    const P = hexRGB(o.paper || GDM.paper), I = hexRGB(GDM.ink), A = hexRGB(GDM.acc), AL = hexRGB(GDM.accL), AD = hexRGB(GDM.accD);
    const t1 = o.t1 || 160, t2 = o.t2 || 74, dot = Math.max(4, Math.round((o.tone || 7) * s)), per = Math.max(4, Math.round(9 * s)), lw = Math.max(1, Math.round(1.6 * s));
    const c45 = Math.SQRT1_2, mid = (t1 + t2) / 2, accOn = o.accent !== false;
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2], L = r * .299 + gg * .587 + b * .114, mx = Math.max(r, gg);
      let col;
      if (accOn && b > 70 && L > 45 && (b - mx) / b > .3 && b - mx > 38) { // accent (blue -> violet)
        const k = (b - mx) / Math.max(1, b);
        col = L > 175 ? AL : (L > 70 || k > .55) ? A : AD;
        if (L > 225) col = P;
      } else if (L >= t1) col = P;
      else if (L < t2) col = I;
      else if (L > mid) { // screentone dots (45 deg grid)
        const u = (x * c45 + y * c45) / dot, v = (x * c45 - y * c45) / dot, du = u - Math.round(u), dv = v - Math.round(v), q = (L - mid) / (t1 - mid);
        col = (du * du + dv * dv) < .22 * (1 - q) + .02 ? I : P;
      } else { // hatching
        const q = (L - t2) / (mid - t2);
        const on = ((x + y) % per) < lw + (1 - q) * lw || (q < .45 && ((x - y + 99999 * per) % per) < lw);
        col = on ? I : P;
      }
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2];
    }
    cg.putImageData(im, 0, 0);
    if (o.figs !== false && ff._figs.length) { const fl = impFigs(ff, '#ffffff', GDM.ink, o.lineK || 1.9); cg.save(); cg.globalCompositeOperation = 'multiply'; cg.drawImage(fl, 0, 0); cg.restore(); }
  });
}
// ------------------------------------------------------------------------------------------------ backgrounds
function gdmBG(g, T, f, o = {}) {
  const kind = o.kind || 'tone', seed = o.seed || 7;
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  if (kind === 'black') { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { const x = hash(seed + i) * W, y = hash(seed + i * 3) * H, r = 1 + hash(seed + i * 7) * 3; g.fillRect(x, y, r, r); } }
  else if (kind === 'speed') { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); fxSpeedBG(g, T, { ang: o.ang || 0, col: '#000', n: o.n || 70, seed }); }
  else if (kind === 'focus') { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); fxSpeedLines(g, T, { x: o.x == null ? W / 2 : o.x, y: o.y == null ? H / 2 : o.y, n: o.n || 140, col: '#000', inner: o.inner || 330, w: 9, alpha: 1, seed, hold: 2 }); }
  else { // tone: sky gradient (grey -> becomes screentone) + ink horizon from the camera
    const hy = (() => { const q = project([0, 0, -400]); return q ? q.y : H * .6; })();
    const gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, o.top || '#5a5a5a'); gr.addColorStop(1, o.low || '#e8e8e8'); g.fillStyle = gr; g.fillRect(0, 0, W, Math.max(0, hy));
    const gr2 = g.createLinearGradient(0, hy, 0, H); gr2.addColorStop(0, '#d8d8d8'); gr2.addColorStop(1, o.floor || '#9a9a9a'); g.fillStyle = gr2; g.fillRect(0, hy, W, H - hy);
    // ruined skyline silhouette on the horizon
    g.fillStyle = '#0b0a0e'; g.beginPath(); g.moveTo(0, hy); let x = -20; let i = 0; while (x < W + 40) { const bw = 40 + hash(seed + i) * 110, bh = 20 + hash(seed + i * 5) * (o.city || 170); g.lineTo(x, hy - bh); g.lineTo(x + bw * (.7 + hash(i + 3) * .3), hy - bh - hash(i * 9) * 25); g.lineTo(x + bw, hy - bh * .6); x += bw; i++; } g.lineTo(W + 40, hy); g.closePath(); g.fill();
    // floor cracks / perspective ink lines
    g.strokeStyle = '#0b0a0e'; g.lineWidth = 3; for (let k = -10; k <= 10; k++) { const a = project([k * 3, 0, 8]), b = project([k * 3, 0, -60]); if (a && b) { g.globalAlpha = .55; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } } g.globalAlpha = 1;
  }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ lettering
function gdmEnv(lt, t0, dur) { const u = lt - t0; if (u < 0 || u > dur + .25) return null; return { u, inK: clamp(u / .12, 0, 1), out: clamp((u - dur) / .25, 0, 1) }; }
function gdmTitle(g, lt, o) {
  const e = gdmEnv(lt, o.t0 || 0, o.dur || 1.2); if (!e) return;
  const size = o.size || 150, x = o.x == null ? W / 2 : o.x, y = o.y == null ? H * .8 : o.y, acc = o.acc || GDM.acc;
  g.save(); g.translate(x, y); g.rotate(o.rot || -.05);
  const sc = lerp(2.2, 1, easeOut(e.inK)) * (1 + e.u * .03); g.scale(sc, sc); g.globalAlpha = 1 - e.out; g.translate(e.out * 260, 0);
  // ink smear bar behind
  g.fillStyle = '#000'; g.beginPath(); const bw = (o.text.length * size * .62) / 2 + 80; g.moveTo(-bw - 40, -size * .62); g.lineTo(bw + 60, -size * .78); g.lineTo(bw + 20, size * .22); g.lineTo(-bw - 70, size * .3); g.closePath(); g.fill();
  for (let i = 0; i < 9; i++) { const sx = -bw + hash(i * 7 + 1) * bw * 2, sy = size * (.2 + hash(i * 3) * .3); g.beginPath(); g.arc(sx, sy, 4 + hash(i * 5) * 12, 0, TAU); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.font = `400 ${size}px "Dela Gothic One", "Inter", sans-serif`;
  const tx = o.text.toUpperCase(); let fs = size; while (g.measureText(tx).width > W * .86 / sc && fs > 60) { fs -= 6; g.font = `400 ${fs}px "Dela Gothic One", "Inter", sans-serif`; }
  g.fillStyle = acc; g.fillText(tx, 9, 9);
  g.lineWidth = fs * .16; g.strokeStyle = '#000'; g.strokeText(tx, 0, 0); g.fillStyle = '#fff'; g.fillText(tx, 0, 0);
  if (o.sub) { g.font = `400 ${fs * .95}px "Yuji Boku", serif`; g.lineWidth = fs * .14; g.strokeStyle = '#fff'; const sx = o.subX == null ? -bw * .55 : o.subX, sy = -fs * .95; g.strokeText(o.sub, sx, sy); g.fillStyle = '#000'; g.fillText(o.sub, sx, sy); g.fillStyle = acc; g.globalAlpha *= .9; g.fillText(o.sub, sx + 6, sy + 6); }
  g.restore();
}
function gdmSub(g, lt, o) {
  if (lt < o.t0 || lt > o.t1) return; const a = Math.min(1, (lt - o.t0) / .1, (o.t1 - lt) / .1); const size = o.size || 50;
  g.save(); g.globalAlpha = a; g.font = `800 ${size}px "Inter", sans-serif`; const tw = g.measureText(o.text).width, bw = tw + 80, bh = size * 2.25, x = W / 2 - bw / 2, y = (o.y || 905) - bh / 2;
  g.translate(W / 2, y + bh / 2); g.rotate(o.rot || -.012); g.translate(-W / 2, -(y + bh / 2));
  g.fillStyle = '#000'; g.fillRect(x + 10, y + 10, bw, bh); g.fillStyle = '#fff'; g.fillRect(x, y, bw, bh); g.lineWidth = 6; g.strokeStyle = '#000'; g.strokeRect(x, y, bw, bh);
  g.fillStyle = '#000'; g.textAlign = 'center'; g.fillText(o.text, W / 2, y + bh * .72);
  if (o.who) { g.font = `400 30px "Dela Gothic One", sans-serif`; const ww = g.measureText(o.who).width + 30; g.fillStyle = o.whoCol || '#000'; g.fillRect(x - 12, y - 26, ww, 44); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(o.who, x + 3, y + 7); }
  g.restore();
}
function gdmPage(g, lt, o = {}) { // white page gutter with a black panel border (slanted edges optional)
  const ins = o.inset == null ? 26 : o.inset, sl = o.slant || 0, tl = o.tilt || 0;
  const pts = [[ins, ins + tl], [W - ins, ins - tl], [W - ins - sl, H - ins], [ins + sl * 0, H - ins]];
  g.save(); g.fillStyle = o.paper || GDM.paper; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(pts[0][0], pts[0][1]); for (let i = 3; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill('evenodd');
  g.lineWidth = o.lw || 9; g.strokeStyle = '#000'; g.lineJoin = 'miter'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
  if (o.num) { g.font = '400 24px "Dela Gothic One", sans-serif'; g.fillStyle = '#000'; g.textAlign = o.numSide === 'left' ? 'left' : 'right'; g.fillText(o.num, o.numSide === 'left' ? ins + 6 : W - ins - 6, H - 4); }
  g.restore();
}
function gdmOno(g, lt, o) {
  const e = gdmEnv(lt, o.t0 || 0, o.dur || .8); if (!e) return; const size = o.size || 220;
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot || .12); const sc = lerp(1.6, 1, easeOut(clamp(e.u / .08, 0, 1))) + e.u * .05; g.scale(sc, sc); g.globalAlpha = 1 - e.out;
  g.font = `400 ${size}px "Dela Gothic One", sans-serif`; g.textAlign = 'center'; g.lineJoin = 'round';
  const chars = [...o.text]; let xx = -(chars.length - 1) * size * .45;
  chars.forEach((ch, i) => { g.save(); g.translate(xx + i * size * .9, (i % 2 ? -1 : 1) * size * .08); g.rotate((hash(i * 11 + 3) - .5) * .35); g.scale(1 + i * .08, 1 + i * .08);
    g.lineWidth = size * .2; g.strokeStyle = o.edge || '#fff'; g.strokeText(ch, 0, 0); g.fillStyle = o.col || '#000'; g.fillText(ch, 0, 0); g.restore(); });
  g.restore();
}
// ink splatter overlay (top layer)
function gdmSplat(g, x, y, R, seed, n = 10, col = '#000') { g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { const a = hash(seed + i) * TAU, d = R * (.3 + hash(seed + i * 3)), r = 5 + hash(seed + i * 5) * 22; blobPath(g, x + Math.cos(a) * d, y + Math.sin(a) * d, r, seed + i * 7, 7, .45); g.fill(); } g.restore(); }

// ------------------------------------------------------------------------------------------------ impact styles (manga ink)
IMPACT.gdmblue = (c, g, f, p, k) => { // accent field + parallel speed lines + white silhouettes with ink edge
  const F = impFocus(f, p); fillAll(g, p.col || GDM.acc);
  fxSpeedBG(g, f.T + k, { ang: p.ang || 0, col: '#000', n: 80, seed: 11 + k });
  fxSpeedLines(g, f.T + k, Object.assign({ n: 70, col: '#ffffff', inner: 300, w: 6, alpha: .9 }, F));
  const sil = impSil('chars', '#000000'); rawDraw(g, sil, 7 * OUT.scale, 7 * OUT.scale); rawDraw(g, impSil('chars', '#ffffff'));
  rawDraw(g, impFigs(f, '#ffffff', '#000000', 2.2));
  rawDraw(g, impSil('glow', '#ffffff'));
};
IMPACT.gdmblack = (c, g, f, p, k) => { // ink black + white focus lines + white lineart figures, accent rim
  const F = impFocus(f, p); fillAll(g, '#000');
  fxSpeedLines(g, f.T + k, Object.assign({ n: 150, col: '#ffffff', inner: 240, w: 8, alpha: 1 }, F));
  const sil = impSil('chars', p.rim || GDM.acc); rawDraw(g, sil, -9 * OUT.scale, -5 * OUT.scale); rawDraw(g, impSil('chars', '#000000'));
  rawDraw(g, impFigs(f, '#000000', '#ffffff', 2.2));
};
IMPACT.gdmwhite = (c, g, f, p, k) => { // paper white + black speed burst + black silhouettes, accent glow kept
  const F = impFocus(f, p); fillAll(g, GDM.paper);
  fxSpeedLines(g, f.T + k, Object.assign({ n: 170, col: '#000', inner: 260, w: 11, alpha: 1 }, F));
  rawDraw(g, impSil('glow', GDM.acc)); rawDraw(g, impSil('chars', '#000000'));
  splatter(g, 9 + k * 13, 12, '#000', F, 760);
};
