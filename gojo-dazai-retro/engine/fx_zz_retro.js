/* fx_zz_retro.js - "RETRO 90s CEL" photography pass (gojo-dazai-retro project only).
   Runs as the very last step of composeFrame (post.js hook) when window.RETRO is set by the program:
     1. faded film stock: lifted warm blacks, rolled-off highlights, lower saturation, slight magenta/amber cast
     2. soft optical print: a blurred copy laid over (cel edges bloom softly like a 16/35 mm telecine)
     3. gate weave: the whole frame drifts +-1.5 px / tiny rotation (smooth noise, changes every film frame)
     4. coarse film grain (2 layers, per-frame offset), dust specks, a hair, rare vertical scratch
     5. wide heavy vignette + per-frame exposure flicker
   RETRO options (window.RETRO): { k (0..1 overall), weave (px), grain, dust, vignette, fade, warm }. f._retro (shot override) merges in. */
'use strict';
var RETRO = null;
function retroNoise(x, s) { const i = Math.floor(x), u = x - i, a = hash(i * 7.31 + s), b = hash((i + 1) * 7.31 + s); return lerp(a, b, u * u * (3 - 2 * u)) - .5; }
let RETRO_GRAIN = null;
function retroGrainTex() {
  if (RETRO_GRAIN) return RETRO_GRAIN; RETRO_GRAIN = [];
  for (let k = 0; k < 8; k++) { const s = 192, c = mkCanvas(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), r = rng(4400 + k);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 150; im.data[i] = v; im.data[i + 1] = v * .98; im.data[i + 2] = v * .95; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); RETRO_GRAIN.push(c); }
  return RETRO_GRAIN;
}
function retroPass(comp, t, f) {
  const R = Object.assign({ k: 1, weave: 1.6, grain: .2, dust: 1, vignette: .62, fade: 1, warm: 1, soft: .32 }, RETRO || {}, (f && f._retro) || {});
  if (!R.k) return;
  const w = comp.width, h = comp.height, sc = OUT.scale, fr = Math.round(t * FPS), g = comp.getContext('2d');
  let tmp = LAY._retroTmp; if (!tmp || tmp.width !== w || tmp.height !== h) tmp = LAY._retroTmp = mkCanvas(w, h);
  const tg = tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = 1; tg.globalCompositeOperation = 'source-over';
  // 1 + 2: film stock grade into tmp, then soft print
  tg.filter = `saturate(${(1 - .2 * R.fade).toFixed(3)}) contrast(${(1 - .1 * R.fade).toFixed(3)}) sepia(${(.14 * R.warm).toFixed(3)})`; tg.clearRect(0, 0, w, h); tg.drawImage(comp, 0, 0); tg.filter = 'none';
  if (R.soft > 0) { tg.globalAlpha = R.soft; tg.filter = `blur(${(1.6 * sc).toFixed(2)}px)`; tg.drawImage(tmp, 0, 0); tg.filter = 'none'; tg.globalAlpha = 1; }
  // lifted blacks (screen a warm violet-brown), highlight roll-off (multiply a cream)
  tg.globalCompositeOperation = 'screen'; tg.fillStyle = rgba('#2c1a2a', .55 * R.fade); tg.fillRect(0, 0, w, h);
  tg.globalCompositeOperation = 'multiply'; tg.fillStyle = rgba('#fff1dc', 1); tg.globalAlpha = .55 * R.fade; tg.fillRect(0, 0, w, h); tg.globalAlpha = 1;
  tg.globalCompositeOperation = 'soft-light'; tg.fillStyle = rgba('#ffb070', .22 * R.warm); tg.fillRect(0, 0, w, h); tg.globalCompositeOperation = 'source-over';
  // 3: gate weave -> back into comp (slight overscan so the edges never show)
  const wx = retroNoise(fr * .45, 1) * 2 * R.weave * sc + (hash(fr * 1.7) - .5) * .6 * sc, wy = retroNoise(fr * .38, 5) * 2.4 * R.weave * sc + (hash(fr * 2.3) - .5) * .7 * sc, rot = retroNoise(fr * .3, 9) * .0016 * R.weave;
  const flick = 1 + (hash(fr * 3.1) - .5) * .05 + retroNoise(fr * .2, 13) * .03, os = 1.012;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#120a10'; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2 + wx, h / 2 + wy); g.rotate(rot); g.scale(os, os); g.filter = `brightness(${flick.toFixed(3)})`; g.drawImage(tmp, -w / 2, -h / 2); g.filter = 'none'; g.restore();
  // 4: grain (coarse, scaled up = 35 mm clumps) + fine layer
  const tx = retroGrainTex(); g.globalCompositeOperation = 'overlay';
  for (const [k, scl, a] of [[0, 2.2, 1], [3, 1.1, .6]]) { const pat = g.createPattern(tx[(fr + k) % tx.length], 'repeat'); g.save(); g.globalAlpha = R.grain * a; g.translate((hash(fr + k * 11) * 192) | 0, (hash(fr * 1.3 + k * 7) * 192) | 0); g.scale(scl * sc, scl * sc); g.fillStyle = pat; g.fillRect(-200, -200, w / (scl * sc) + 400, h / (scl * sc) + 400); g.restore(); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // dust, hair, scratch (deterministic per film frame)
  if (R.dust > 0) { const r = rng(7000 + fr), n = Math.floor(r() * 5 * R.dust); g.save(); g.setTransform(sc, 0, 0, sc, 0, 0);
    for (let i = 0; i < n; i++) { const x = r() * W, y = r() * H, s = 1.5 + r() * 4.5, dark = r() < .7; g.fillStyle = dark ? 'rgba(18,10,8,.75)' : 'rgba(255,248,230,.6)'; g.beginPath(); g.ellipse(x, y, s, s * (.5 + r() * .7), r() * 3, 0, TAU); g.fill(); }
    if (r() < .22 * R.dust) { const x = r() * W, y = r() * H, L = 40 + r() * 90; g.strokeStyle = 'rgba(20,12,10,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * .4, y - L * .3, x + L * .2, y + L * .6, x + L * .9, y + L * .3); g.stroke(); }
    if (hash(Math.floor(fr / 5) * 3.3) < .35 * R.dust) { const x = W * (.15 + .7 * hash(Math.floor(fr / 5) * 1.9)) + (hash(fr) - .5) * 6; g.fillStyle = 'rgba(255,245,225,.18)'; g.fillRect(x, 0, 1.6, H); }
    g.restore(); }
  // 5: wide heavy vignette (oval, warm-dark) + soft top/bottom roll
  g.save(); g.setTransform(sc, 0, 0, sc, 0, 0); g.translate(W / 2, H / 2); g.scale(1, H / W * 1.18);
  const gr = g.createRadialGradient(0, 0, W * .26, 0, 0, W * .66); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.55, `rgba(24,10,14,${(R.vignette * .35).toFixed(3)})`); gr.addColorStop(1, `rgba(12,4,8,${R.vignette.toFixed(3)})`);
  g.fillStyle = gr; g.fillRect(-W, -W, W * 2, W * 2); g.restore();
}
