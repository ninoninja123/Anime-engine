/* engine/impact_sad.js (agent E) - impact styles + sequences for Shinji / Aizen / Dazai.
   STYLES: sakasama (180deg flipped pink negative + mirror seam), mirrorshard (image shattered into offset mirror shards, white edges),
           pagewhite (paper page: figures as blue-ink lineart, ruled lines, 人間失格), coffin (black void, violet-edged figures, kido glyphs),
           violetpulse (Hogyoku violet duotone + rings), cerogold (yellow overexposure, black silhouettes, horizontal flare),
           hollowbone (bone-white field, black silhouettes, grin of teeth across the frame), muzzle (black frame, white star flash at p.at),
           pinkmist (pink haze washout with dark silhouettes), mirrorsplit (left/right mirrored halves, different tint).
   SEQUENCES (f.impact(name, {t0, at})): shinji_taore shinji_inverted shinji_mask shinji_cero shinji_bankai shinji_senju
     aizen_kyoka aizen_shatter aizen_kurohitsugi aizen_hogyoku aizen_pressure aizen_chrysalis aizen_finger
     dazai_touch dazai_nullify dazai_gun dazai_page   clash_sad death_sad
   pre/impact_requests.md names: added below as aliases when the file exists (see API.md 12.6).                                  */
'use strict';
IMPACT.sakasama = (c, g, f, p, k) => { const t = copyComp(c), w = c.width, h = c.height, gg = c.getContext('2d'); gg.save(); gg.setTransform(-1, 0, 0, -1, w, h); gg.filter = `invert(1) hue-rotate(${p.hue == null ? 150 : p.hue}deg) saturate(${p.sat || 1.4}) contrast(1.2)`; gg.drawImage(t, 0, 0); gg.filter = 'none'; gg.restore();
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(p.col || '#ff9ccf', .3); g.fillRect(0, 0, W, H); g.restore(); g.save(); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, H / 2 + (k % 2 ? 8 : -8)); g.lineTo(W, H / 2 + (k % 2 ? -8 : 8)); g.stroke(); g.restore();
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: 50, col: '#ffffff', inner: 360, alpha: .7 }, impFocus(f, p))); };
IMPACT.mirrorshard = (c, g, f, p, k) => { const F = impFocus(f, p), cells = sadShards((p.seed || 11) + k * 3, p.n || 34, F), src = copyComp(c); fillAll(g, p.bg || '#0a0412');
  for (const cl of cells) { const off = (cl.d / 600) * (p.push || 40) * (1 + k * .5), a = Math.atan2(cl.c[1] - F.y, cl.c[0] - F.x); g.save(); polyPath(g, cl.poly); g.clip(); g.translate(Math.cos(a) * off, Math.sin(a) * off); if (cl.h > .7) { g.translate(W / 2, H / 2); g.scale(-1, 1); g.translate(-W / 2, -H / 2); } g.drawImage(src, 0, 0, W, H); g.restore();
    polyPath(g, cl.poly); g.lineWidth = 3; g.strokeStyle = p.edge || '#ffffff'; g.stroke(); }
  g.save(); g.globalCompositeOperation = 'lighter'; fxImpactStar(g, F.x, F.y, 220, k, '#ffffff', 4); g.restore(); };
IMPACT.pagewhite = (c, g, f, p, k) => { fillAll(g, p.paper || '#f4f6fa'); g.save(); g.strokeStyle = rgba('#9ab8d8', .5); g.lineWidth = 2; for (let y = 40; y < H; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.restore();
  g.save(); g.fillStyle = rgba('#7aa0c8', .35); g.font = '700 120px "IPAMincho", "IPAGothic", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const F = impFocus(f, p); '人間失格'.split('').forEach((ch, i) => g.fillText(ch, F.x + (i - 1.5) * 150 + k * 6, F.y - 300 + (i % 2) * 40)); g.restore();
  rawDraw(g, impFigs(f, p.paper || '#f4f6fa', p.ink || '#2a4a7a', p.lineK || 1.5));
  if (p.ring !== false) { g.save(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(F.x, F.y, 160 + k * 120, 0, TAU); g.stroke(); g.lineWidth = 2; g.strokeStyle = '#9ac8ff'; g.stroke(); g.restore(); } };
IMPACT.coffin = (c, g, f, p, k) => { fillAll(g, p.bg || '#030205'); rawDraw(g, impSil('glow', p.accent || '#9a4ae0'), 0, 0, .8); rawDraw(g, impFigs(f, '#030205', p.accent || '#b880ff', 1.8)); const F = impFocus(f, p);
  g.save(); g.fillStyle = p.accent || '#b880ff'; g.font = '900 64px "IPAMincho", "IPAGothic", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + k * .2; g.save(); g.translate(F.x + Math.cos(a) * 420, F.y + Math.sin(a) * 260); g.rotate(a + HP); g.fillText('黒棺縛鉄泥'[i % 5], 0, 0); g.restore(); } g.restore();
  g.save(); g.strokeStyle = rgba('#b880ff', .8); g.lineWidth = 4; for (let i = 0; i < 4; i++) { const x = F.x + (i - 1.5) * 260; g.strokeRect(x - 110, F.y - 330, 220, 660); } g.restore(); };
IMPACT.violetpulse = (c, g, f, p, k) => { const A = hexRGB(p.dark || '#12021e'), B = hexRGB(p.light || '#d8b0ff'); pixels(c, (d, i, L) => { const col = L > (p.th || 110) ? B : A; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; }); const F = impFocus(f, p);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { g.lineWidth = 8 - i * 1.5; g.strokeStyle = rgba('#b06cff', .8 - i * .15); g.beginPath(); g.arc(F.x, F.y, 80 + i * 110 + k * 60, 0, TAU); g.stroke(); } glow(g, F.x, F.y, 180, '#f4e6ff', .9); g.restore(); };
IMPACT.cerogold = (c, g, f, p, k) => { const t = filtered(c, 'brightness(2.2) saturate(1.8) sepia(.6)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = p.col || '#ffd84a'; g.fillRect(0, 0, W, H); g.restore(); rawDraw(g, impSil('chars', '#140c02'));
  const F = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,240,.9)'; g.fillRect(0, F.y - 10 - k * 6, W, 20 + k * 12); glow(g, F.x, F.y, 500, '#fff8c0', .6); g.restore(); };
IMPACT.hollowbone = (c, g, f, p, k) => { fillAll(g, p.bg || '#f1ece0'); rawDraw(g, impSil('chars', '#0a0808')); const F = impFocus(f, p);
  g.save(); g.fillStyle = '#0a0808'; g.beginPath(); g.moveTo(0, F.y + 120); g.quadraticCurveTo(W / 2, F.y + 40, W, F.y + 120); g.lineTo(W, F.y + 300); g.quadraticCurveTo(W / 2, F.y + 420, 0, F.y + 300); g.closePath(); g.globalAlpha = .9; g.fill();
  g.fillStyle = '#f1ece0'; for (let i = 0; i < 16; i++) { const x = i * W / 15; g.fillRect(x - 30, F.y + 100 + 20 * Math.abs(Math.sin(i)), 60, 80); g.fillRect(x - 28, F.y + 230, 56, 70); } g.restore(); if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: 60, col: '#0a0808', inner: 360, alpha: .8 }, F)); };
IMPACT.muzzle = (c, g, f, p, k) => { const F = impFocus(f, p); fillAll(g, '#000000'); rawDraw(g, impFigs(f, '#000000', '#f4f0e0', 1.4)); g.save(); g.globalCompositeOperation = 'lighter'; fxImpactStar(g, F.x, F.y, 260 - k * 80, .3, '#fff6c8', 4); fxImpactStar(g, F.x, F.y, 140, 1.1, '#ffffff', 4); g.restore(); };
IMPACT.pinkmist = (c, g, f, p, k) => { const t = filtered(c, 'saturate(.4) brightness(1.4)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(p.col || '#ff9ccf', .65); g.fillRect(0, 0, W, H); g.restore(); rawDraw(g, impSil('chars', p.sil || '#3a0a24'), 0, 0, .85); };
IMPACT.mirrorsplit = (c, g, f, p, k) => { const src = copyComp(c), gg = c.getContext('2d'), w = c.width, h = c.height; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.beginPath(); gg.rect(w / 2, 0, w / 2, h); gg.clip(); gg.translate(w, 0); gg.scale(-1, 1); gg.filter = 'invert(1) hue-rotate(200deg)'; gg.drawImage(src, 0, 0); gg.filter = 'none'; gg.restore();
  g.save(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.restore(); };
['mirrorshard', 'pagewhite', 'coffin', 'hollowbone', 'muzzle'].forEach(s => typeof PAPER_STYLES !== 'undefined' && PAPER_STYLES.add && (s === 'pagewhite' || s === 'hollowbone') && PAPER_STYLES.add(s));
Object.assign(IMPACT_SEQ, {
  shinji_taore: [{ s: 'flash', n: 1, p: { col: '#ffe0f0' } }, { s: 'pinkmist', n: 2 }, { s: 'kanji', n: 3, p: { char: '倒', col: '#ff9ccf', col2: '#fff0f8', outline: '#2a0414' } }],
  shinji_inverted: [{ s: 'sakasama', n: 2 }, { s: 'mirrorsplit', n: 2 }, { s: 'sakasama', n: 1, p: { hue: 300 } }],
  shinji_mask: [{ s: 'hollowbone', n: 2 }, { s: 'blackaccent', n: 2, p: { accent: '#ffd84a', lines: 60 } }, { s: 'kanji', n: 2, p: { char: '虚', col: '#f1ece0', col2: '#ffffff', outline: '#000' } }],
  shinji_cero: [{ s: 'flash', n: 1, p: { col: '#fff6c8' } }, { s: 'cerogold', n: 3 }, { s: 'whiteout', n: 2 }],
  shinji_bankai: [{ s: 'whiteout', n: 2 }, { s: 'kanji', n: 3, p: { char: '逆様邪八方塞', col: '#e8b83a', col2: '#fff4c8', outline: '#2a1804', size: 300 } }, { s: 'pinkmist', n: 3 }],
  shinji_senju: [{ s: 'flash', n: 1 }, { s: 'radial', n: 2, p: { lineCol: '#fff4c8', ringCol: '#ffe8a0' } }, { s: 'overexpose', n: 2, p: { col: '#fff0c0' } }],
  aizen_kyoka: [{ s: 'flash', n: 1, p: { col: '#f0e8ff' } }, { s: 'mirrorshard', n: 3 }, { s: 'kanji', n: 3, p: { char: '鏡花水月', col: '#d8c8ff', col2: '#ffffff', outline: '#1a0a2a', size: 300 } }],
  aizen_shatter: [{ s: 'mirrorshard', n: 2, p: { push: 70 } }, { s: 'mirrorshard', n: 2, p: { push: 140, seed: 21 } }, { s: 'white', n: 0 }].filter(x => x.n),
  aizen_kurohitsugi: [{ s: 'black', n: 1 }, { s: 'coffin', n: 4 }, { s: 'kanji', n: 3, p: { char: '黒棺', col: '#b880ff', col2: '#f0e0ff', outline: '#000', size: 420 } }],
  aizen_hogyoku: [{ s: 'violetpulse', n: 2 }, { s: 'flash', n: 1, p: { col: '#f4e6ff' } }, { s: 'violetpulse', n: 2, p: { th: 140 } }],
  aizen_pressure: [{ s: 'desat', n: 2, p: { accent: '#b06cff' } }, { s: 'rings', n: 2, p: { col: '#b06cff' } }],
  aizen_chrysalis: [{ s: 'whiteout', n: 2 }, { s: 'violetpulse', n: 2, p: { dark: '#f4f2f0', light: '#9a4ae0', th: 200 } }],
  aizen_finger: [{ s: 'flash', n: 1 }, { s: 'closeup', n: 3, p: { part: 'hand' } }],
  dazai_touch: [{ s: 'flash', n: 1, p: { col: '#eef6ff' } }, { s: 'pagewhite', n: 3 }, { s: 'desat', n: 2, p: { accent: '#cfe8ff' } }],
  dazai_nullify: [{ s: 'pagewhite', n: 2, p: { ring: true } }, { s: 'kanji', n: 3, p: { char: '人間失格', col: '#2a4a7a', col2: '#cfe8ff', outline: '#f4f6fa', size: 300, tint: '#f4f6fa' } }],
  dazai_gun: [{ s: 'muzzle', n: 1 }, { s: 'invert', n: 1, p: { lines: 30 } }],
  dazai_page: [{ s: 'pagewhite', n: 2, p: { ring: false } }, { s: 'tear', n: 2 }],
  clash_sad: [{ s: 'flash', n: 1 }, { s: 'invert', n: 2, p: { lines: 70 } }, { s: 'shatter', n: 2 }],
  death_sad: [{ s: 'redblack', n: 2, p: { col: '#b3122e' } }, { s: 'silhouette', n: 3 }],
});
// pre/impact_requests.md aliases are appended in impact_sad_req.js (generated when the request file exists)
// ======================================================================================= pre/shots.json style names (NEW in this project)
IMPACT.hollowEye = (c, g, f, p, k, n) => { // the Hollow eye fills the frame: black sclera, grey iris, yellow glow, bone-white mask lines
  fillAll(g, '#f1ece0'); const cx = W / 2 + (p.dx || 0), cy = H / 2, rw = 820 + k * 30, rh = 300 + k * 10;
  g.save(); g.fillStyle = '#0a0808'; g.beginPath(); g.moveTo(cx - rw, cy + 40); g.quadraticCurveTo(cx - 100, cy - rh * 1.4, cx + rw, cy - 60); g.quadraticCurveTo(cx + 200, cy + rh * 1.1, cx - rw, cy + 40); g.fill();
  g.globalCompositeOperation = 'lighter'; glow(g, cx, cy - 10, 330, '#ffd84a', .55); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#8a8a96'; g.beginPath(); g.arc(cx, cy - 10, 170, 0, TAU); g.fill(); g.fillStyle = '#4a4a56'; g.beginPath(); g.arc(cx, cy - 10, 90, 0, TAU); g.fill(); g.fillStyle = '#f4f4fa'; g.beginPath(); g.ellipse(cx - 60, cy - 70, 40, 26, -.4, 0, TAU); g.fill();
  g.strokeStyle = '#0a0808'; g.lineWidth = 10; for (const x of [-700, -560, 560, 700]) { g.beginPath(); g.moveTo(cx + x, 0); g.lineTo(cx + x * 1.05, H); g.stroke(); } g.restore(); };
IMPACT.ceroLine = (c, g, f, p, k, n) => { const u = (k + 1) / (n || 3), F = impFocus(f, p); fillAll(g, '#050302'); rawDraw(g, impSil('chars', '#000000'));
  g.save(); g.globalCompositeOperation = 'lighter'; const hgt = 6 + u * u * 520, gr = g.createLinearGradient(0, F.y - hgt, 0, F.y + hgt); gr.addColorStop(0, 'rgba(255,216,74,0)'); gr.addColorStop(.42, 'rgba(255,216,74,.9)'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(.58, 'rgba(255,216,74,.9)'); gr.addColorStop(1, 'rgba(255,216,74,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(F.x - 60, F.y - 4); g.quadraticCurveTo(W * .7, F.y - hgt, W + 60, F.y - hgt * 1.2); g.lineTo(W + 60, F.y + hgt * 1.2); g.quadraticCurveTo(W * .7, F.y + hgt, F.x - 60, F.y + 4); g.closePath(); g.fill(); g.fillRect(0, F.y - 3 - u * 8, W, 6 + u * 16); glow(g, F.x, F.y, 260 + 400 * u, '#fff4c0', .7); g.restore(); };
IMPACT.violetRings = (c, g, f, p, k) => { const F = impFocus(f, p); fillAll(g, '#12021e'); g.save(); for (let i = 9; i >= 0; i--) { g.fillStyle = i % 2 ? '#3a0c66' : '#7a3fd0'; g.beginPath(); g.arc(F.x, F.y, 80 + i * 130 + k * 40, 0, TAU); g.fill(); } g.restore(); rawDraw(g, impSil('chars', '#000000'));
  g.save(); g.fillStyle = '#f4e6ff'; g.beginPath(); g.ellipse(F.x, F.y, 110, 40, 0, 0, TAU); g.fill(); g.fillStyle = '#5b3a1e'; g.beginPath(); g.arc(F.x, F.y, 36, 0, TAU); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(F.x, F.y, 14, 0, TAU); g.fill(); g.restore(); };
IMPACT.coffinBox = (c, g, f, p, k, n) => { IMPACT.coffin(c, g, f, p, k); const F = impFocus(f, p), u = (k + 1) / (n || 4); g.save(); g.strokeStyle = '#ffffff'; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const sd = i % 4, a = hash(i * 3), L = (180 + 220 * hash(i)) * Math.min(1, u * 1.6);
    const [x0, y0, dx, dy] = sd === 0 ? [F.x - 520, F.y - 330 + a * 660, 1, 0] : sd === 1 ? [F.x + 520, F.y - 330 + a * 660, -1, 0] : sd === 2 ? [F.x - 520 + a * 1040, F.y - 330, 0, 1] : [F.x - 520 + a * 1040, F.y + 330, 0, -1]; g.lineWidth = 3 + 4 * hash(i * 5); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + dx * L, y0 + dy * L); g.stroke(); }
  g.lineWidth = 10; g.strokeStyle = '#9a4ae0'; g.strokeRect(F.x - 520, F.y - 330, 1040, 660); g.restore(); };
IMPACT.goldFlower = (c, g, f, p, k, n) => { const u = (k + 1) / (n || 3), F = impFocus(f, p); const t = filtered(c, 'brightness(1.5) saturate(.6)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,156,207,.5)'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3, R0 = lerp(1500, 260, easeOut(u)), x0 = F.x + Math.cos(a) * R0, y0 = F.y + Math.sin(a) * R0; g.save(); g.translate(x0, y0); g.rotate(a + Math.PI); g.beginPath(); g.moveTo(0, -260); g.quadraticCurveTo(600, -200, 900, 0); g.quadraticCurveTo(600, 200, 0, 260); g.closePath(); g.fillStyle = i % 2 ? '#e8b83a' : '#c8922a'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#3a2408'; g.stroke(); g.strokeStyle = 'rgba(255,244,200,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 0); g.lineTo(820, 0); g.stroke(); g.restore(); }
  g.globalCompositeOperation = 'lighter'; glow(g, F.x, F.y, 500, '#fff4c8', .5 * u); g.restore(); };
IMPACT.gunFlash = (c, g, f, p, k) => { const F = impFocus(f, p); IMPACT.hatch(c, g, f, Object.assign({ splat: 0, lines: 0 }, p), k); g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; fxImpactStar(g, F.x, F.y, 420 - k * 120, .35, '#ffffff', 4); fxImpactStar(g, F.x, F.y, 200, 1.15, '#fff6c8', 4); glow(g, F.x, F.y, 300, '#ffffff', .8); g.restore();
  g.save(); g.translate(W * .78, H * .3 + k * 60); g.rotate(.6 + k * .8); g.fillStyle = '#000'; g.fillRect(-90, -36, 180, 72); g.lineWidth = 6; g.strokeStyle = '#fff'; g.strokeRect(-90, -36, 180, 72); g.restore(); };
IMPACT.bandage = (c, g, f, p, k) => { fillAll(g, '#1a2230'); const cx = W / 2, cy = H / 2; // one eye between the bands
  g.save(); g.fillStyle = '#f6dfcc'; g.fillRect(cx - 420, cy - 120, 840, 240); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - 300, cy + 10); g.quadraticCurveTo(cx, cy - 120, cx + 300, cy - 10); g.quadraticCurveTo(cx, cy + 90, cx - 300, cy + 10); g.fill(); g.fillStyle = '#5a3420'; g.beginPath(); g.arc(cx + 10, cy - 5, 72, 0, TAU); g.fill(); g.fillStyle = '#1e0e06'; g.beginPath(); g.arc(cx + 10, cy - 5, 34, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - 15, cy - 30, 14, 0, TAU); g.fill();
  g.lineWidth = 7; g.strokeStyle = '#1b1420'; g.beginPath(); g.moveTo(cx - 310, cy + 10); g.quadraticCurveTo(cx, cy - 125, cx + 310, cy - 12); g.stroke(); g.restore();
  g.save(); for (let i = -4; i <= 4; i++) { if (i === 0) continue; const off = i * 150 + k * 40; g.save(); g.translate(cx, cy + off); g.rotate(-.18); g.fillStyle = i % 2 ? '#f3efe6' : '#e6e0d2'; g.fillRect(-1300, -62, 2600, 124); g.strokeStyle = 'rgba(120,130,160,.6)'; g.lineWidth = 3; g.strokeRect(-1300, -62, 2600, 124); g.fillStyle = 'rgba(110,130,170,.25)'; g.fillRect(-1300, 30, 2600, 32); g.restore(); } g.restore(); };
IMPACT.friendFoe = (c, g, f, p, k) => { const src = copyComp(c), gg = c.getContext('2d'), w = c.width, h = c.height, sw = k % 2; gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0);
  for (const side of [0, 1]) { gg.save(); gg.beginPath(); if (side === 0) { gg.moveTo(0, 0); gg.lineTo(w * .56, 0); gg.lineTo(w * .44, h); gg.lineTo(0, h); } else { gg.moveTo(w * .56, 0); gg.lineTo(w, 0); gg.lineTo(w, h); gg.lineTo(w * .44, h); } gg.closePath(); gg.clip(); gg.translate(w, 0); gg.scale(-1, 1); gg.filter = (side ^ sw) ? 'invert(1) hue-rotate(160deg) saturate(1.6)' : 'invert(1) hue-rotate(300deg) saturate(1.8)'; gg.drawImage(src, 0, 0); gg.restore(); }
  gg.restore(); g.save(); g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.beginPath(); g.moveTo(W * .56, 0); g.lineTo(W * .44, H); g.stroke(); g.restore(); };
IMPACT.nlhRing = (c, g, f, p, k, n) => { const F = impFocus(f, p), u = (k + 1) / (n || 2), R = 120 + u * 700, src = copyComp(c); const t = filtered(c, 'grayscale(1) contrast(1.15) brightness(1.1)'); rawDraw(g, t);
  g.save(); g.beginPath(); g.arc(F.x, F.y, R, 0, TAU); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 0); g.restore(); g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 14; g.strokeStyle = 'rgba(207,232,255,.6)'; g.beginPath(); g.arc(F.x, F.y, R, 0, TAU); g.stroke(); g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.stroke(); g.restore(); };
IMPACT.nlhShatter = (c, g, f, p, k, n) => { const F = impFocus(f, p), u = (k + 1) / (n || 3); IMPACT.overexpose(c, g, f, { col: '#cfe8ff', b: 1.8 }, k); g.save();
  for (let i = 0; i < 40; i++) { const a = hash(i * 3) * TAU, d = (100 + 900 * hash(i * 5)) * u, x = F.x + Math.cos(a) * d, y = F.y + Math.sin(a) * d * .7; g.save(); g.translate(x, y); g.rotate(a + u * 3 * (hash(i) - .5)); g.fillStyle = '#f6f8fc'; g.fillRect(-60, -80, 120, 160); g.strokeStyle = '#9ab8d8'; g.lineWidth = 2; g.strokeRect(-60, -80, 120, 160); for (let l = -60; l < 70; l += 18) { g.beginPath(); g.moveTo(-50, l); g.lineTo(50, l); g.stroke(); } g.fillStyle = '#2a4a7a'; g.font = '700 30px "IPAMincho", serif'; g.textAlign = 'center'; g.fillText('人間失格'[i % 4], 0, 10); g.restore(); } g.restore(); };
IMPACT.invertFlip = (c, g, f, p, k, n) => { const u = (k + 1) / (n || 3), src = copyComp(c), gg = c.getContext('2d'), w = c.width, h = c.height, ang = u * Math.PI, cs = Math.abs(Math.cos(ang)), sn = Math.abs(Math.sin(ang)), cover = Math.max((w * cs + h * sn) / w, (w * sn + h * cs) / h);
  gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.fillStyle = '#000'; gg.fillRect(0, 0, w, h); gg.translate(w / 2, h / 2); gg.rotate(ang); gg.scale(cover, cover); gg.filter = `invert(1) hue-rotate(${140 + 40 * u}deg) saturate(1.5)`; gg.drawImage(src, -w / 2, -h / 2); gg.filter = 'none'; gg.restore();
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,156,207,.35)'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,220,240,.7)'; g.lineWidth = 6; for (let i = 0; i < 5; i++) { g.beginPath(); for (let a = 0; a < 9; a += .1) { const r = 30 + a * 70 + i * 20, x = W / 2 + Math.cos(a + i * 1.25 + u * 3) * r, y = H / 2 + Math.sin(a + i * 1.25 + u * 3) * r * .6; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); } g.restore(); };
IMPACT.mirrorShatterPre = (c, g, f, p, k) => { const F = impFocus(f, p), cells = sadShards((p.seed || 31), 30, F), src = copyComp(c); fillAll(g, '#0a0412');
  cells.forEach((cl, i) => { g.save(); polyPath(g, cl.poly); g.clip(); const m = i % 4; g.translate(cl.c[0], cl.c[1]); g.rotate((cl.h - .5) * .6 * (1 + k)); if (m === 1) g.scale(-1, 1); if (m === 2) g.scale(1.4, 1.4); g.translate(-cl.c[0], -cl.c[1]); g.filter = m === 3 ? 'grayscale(1) brightness(1.3)' : m === 2 ? 'hue-rotate(240deg) saturate(.7)' : 'none'; g.drawImage(src, 0, 0, W, H); g.filter = 'none'; g.restore();
    polyPath(g, cl.poly); g.lineWidth = 2.5; g.strokeStyle = cl.h > .5 ? '#e8e8ff' : '#b080ff'; g.stroke(); });
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) fxImpactStar(g, cells[i * 3 % cells.length].poly[0][0], cells[i * 3 % cells.length].poly[0][1], 40 + 40 * hash(i + k), i, '#ffffff', 4); g.restore(); };
IMPACT.rimsilViolet = (c, g, f, p, k) => IMPACT.rimsil(c, g, f, Object.assign({ col: '#d8b0ff', col2: '#3a0c66', rimCol: '#ffffff', sil: '#0a0410' }, p), k);
Object.assign(IMPACT_SEQ, {
  MIRROR_SHATTER: [{ s: 'flash', n: 1, p: { col: '#f0e8ff' } }, { s: 'mirrorShatterPre', n: 3 }],
  INVERT_FLIP: [{ s: 'invertFlip', n: 3 }, { s: 'sakasama', n: 1 }],
  NLH_PAGE: [{ s: 'flash', n: 1, p: { col: '#eef6ff' } }, { s: 'pagewhite', n: 3 }],
  NLH_RING: [{ s: 'nlhRing', n: 2 }],
  NLH_SHATTER: [{ s: 'flash', n: 1, p: { col: '#eef6ff' } }, { s: 'nlhShatter', n: 3 }],
  HOLLOW_EYE: [{ s: 'hollowEye', n: 3 }],
  CERO_LINE: [{ s: 'ceroLine', n: 3 }, { s: 'flash', n: 1, p: { col: '#fff6c8' } }],
  VIOLET_PRESSURE: [{ s: 'violetRings', n: 3 }],
  KUROHITSUGI_BOX: [{ s: 'black', n: 1 }, { s: 'coffinBox', n: 3 }],
  GOLD_FLOWER: [{ s: 'goldFlower', n: 3 }, { s: 'overexpose', n: 1, p: { col: '#fff0c0' } }],
  GUN_FLASH: [{ s: 'gunFlash', n: 2 }],
  BANDAGE_WRAP: [{ s: 'bandage', n: 3 }],
  FRIEND_FOE: [{ s: 'friendFoe', n: 3 }],
  RIMSIL: [{ s: 'rimsilViolet', n: 3 }],
  CLOSEUP_PANELS: [{ s: 'panels', n: 3, p: { modes: ['zoom', 'neg', 'zoom2'] } }],
});
['HOLLOW_EYE', 'BANDAGE_WRAP', 'NLH_PAGE'].forEach(() => {});
// impact_requests.md refinements (frame-by-frame as requested) + masked HOGYOKU_* styles
IMPACT.hollowEyeNeg = (c, g, f, p, k) => { IMPACT.hollowEye(c, g, f, p, k); const t = filtered(c, 'invert(1)'); rawDraw(g, t); };
IMPACT.hogyokuPulse = (c, g, f, p, k) => { fillAll(g, '#030106'); const F = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { g.lineWidth = 10 - i * 1.6; g.strokeStyle = rgba('#b06cff', .9 - i * .15); g.beginPath(); g.arc(F.x, F.y, 60 + i * 120 + k * 50, 0, TAU); g.stroke(); } glow(g, F.x, F.y, 160, '#b06cff', .9); glow(g, F.x, F.y, 50, '#f4e6ff', 1); g.restore();
  g.save(); g.strokeStyle = '#f4f2f0'; g.lineWidth = 5; const r = rng(7 + k); for (let i = 0; i < 9; i++) { let x = F.x, y = F.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - .5) * 260; y += (r() - .5) * 200; g.lineTo(x, y); } g.stroke(); }
  for (const sx of [-1, 1]) { g.fillStyle = '#9b5cff'; g.beginPath(); g.ellipse(F.x + sx * 260, F.y - 260, 70, 26, 0, 0, TAU); g.fill(); } g.restore(); };
IMPACT.hogyokuCrack = (c, g, f, p, k) => { const F = impFocus(f, p); fillAll(g, '#000000'); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, F.x, F.y, 140, '#b06cff', .9); g.strokeStyle = '#d8b0ff'; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, L = 300 + 500 * hash(i) + k * 200; let x = F.x, y = F.y; g.lineWidth = 9 - k * 2; g.beginPath(); g.moveTo(x, y); for (let j = 1; j <= 5; j++) { const u = j / 5; x = F.x + Math.cos(a + (hash(i * 7 + j) - .5) * .5) * L * u; y = F.y + Math.sin(a + (hash(i * 7 + j) - .5) * .5) * L * u; g.lineTo(x, y); } g.stroke(); } g.restore();
  g.save(); g.fillStyle = '#2a0a4a'; g.beginPath(); g.arc(F.x, F.y, 70, 0, TAU); g.fill(); g.lineWidth = 4; g.strokeStyle = '#e8d0ff'; g.stroke(); g.restore(); };
IMPACT.ceroLineSil = (c, g, f, p, k, n) => { IMPACT.ceroLine(c, g, f, p, k, n); if (k > 0) rawDraw(g, impSil('chars', '#fff8e0')); };
Object.assign(IMPACT_SEQ, {
  MIRROR_SHATTER: [{ s: 'mirrorshard', n: 1, p: { push: 4, edge: '#e8eef8' } }, { s: 'mirrorshard', n: 1, p: { push: 40, edge: '#cfd6e0' } }, { s: 'mirrorShatterPre', n: 2 }],
  HOLLOW_EYE: [{ s: 'hollowEye', n: 1 }, { s: 'black', n: 1 }, { s: 'hollowEyeNeg', n: 1 }],
  CERO_LINE: [{ s: 'ceroLineSil', n: 3 }, { s: 'overexpose', n: 1, p: { col: '#fff2b0' } }],
  RIMSIL: [{ s: 'rimsil', n: 3, p: { col: '#7a3fd0', col2: '#120a1e', rimCol: '#e8d8ff' } }],
  HOGYOKU_PULSE: [{ s: 'hogyokuPulse', n: 3 }], HOGYOKU_CRACK: [{ s: 'hogyokuCrack', n: 3 }],
});
