/* engine/impact_e1.js (E1) - new impact-frame styles + signature sequences for Rengoku, Akaza, Deku, Shigaraki + death sequences.
   STYLES (IMPACT.*):  flame (crimson field, black silhouettes rimmed in fire, flame tongues rising from the frame edge)
     compassneg (cyan negative + giant snowflake compass at the focus)   greenbolt (black field, white lineart, green lightning)
     decay (sepia-grey desaturation, red-black crack web from the focus, crumbling silhouettes)   bloodsplit (red field, black
     silhouettes, white diagonal slash, ink blood splashes)   silhouette (flat figures, no lines: death frames)   ash (grey paper,
     figures dissolving into flakes)   sunrise (overexposed gold dawn wash)                                                       */
'use strict';
function impBolt(g, x0, y0, x1, y1, seed, w, col) { const pts = [[x0, y0]]; const n = 9, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1; for (let i = 1; i < n; i++) { const u = i / n, j = (hash(seed + i) - .5) * L * .22; pts.push([x0 + dx * u - dy / L * j, y0 + dy * u + dx / L * j]); } pts.push([x1, y1]); g.save(); g.lineJoin = 'miter'; polyPath(g, pts, false); g.lineWidth = w * 2.4; g.strokeStyle = rgba(col, .35); g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.lineWidth = w * .35; g.strokeStyle = '#ffffff'; g.stroke(); g.restore(); }
IMPACT.flame = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#3a0602'); const F = impFocus(f, p);
  g.save(); g.globalCompositeOperation = 'lighter'; rawDraw(g, impSil('glow', '#ff7a1a'), 0, 0, .9); g.restore();
  for (let i = 0; i < 26; i++) { const x = (i + .5) / 26 * W + (hash(i + k * 7) - .5) * 40; flameTongue(g, x, H + 20, 50 + 30 * hash(i * 3), 260 + 260 * hash(i * 5 + k), (hash(i * 9) - .5) * .4, ['#7a0c04', '#e2401a', '#ffb22a'], i + k); }
  const sil = impSil('chars', p.rim || '#ffb040'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) g.drawImage(sil, dx * OUT.scale, dy * OUT.scale); g.restore();
  rawDraw(g, impSil('chars', p.fill || '#0c0202'));
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines || 60, col: '#ffd27a', inner: 380, w: 5, alpha: .7 }, F));
};
IMPACT.compassneg = (c, g, f, p, k) => {
  const t = filtered(c, `invert(1) hue-rotate(${p.hue == null ? 170 : p.hue}deg) saturate(1.6) contrast(1.4)`); rawDraw(g, t); const F = impFocus(f, p), R = p.r || 420;
  g.save(); g.translate(F.x, F.y); g.scale(1, p.flat == null ? .45 : p.flat); g.rotate(k * .08); g.globalCompositeOperation = 'lighter'; g.strokeStyle = p.col || '#bff0ff'; g.lineCap = 'round';
  for (const rr of [1, .92, .5, .18]) { g.lineWidth = rr === 1 ? 7 : 4; g.beginPath(); g.arc(0, 0, R * rr, 0, TAU); g.stroke(); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, l = i % 3 ? R * .92 : R * 1.15; g.lineWidth = i % 3 ? 3 : 6; g.beginPath(); g.moveTo(Math.cos(a) * R * .18, Math.sin(a) * R * .18); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.stroke();
    for (const fr of [.45, .7]) for (const sg of [-1, 1]) { const b0 = R * fr, bl = R * .12; g.beginPath(); g.moveTo(Math.cos(a) * b0, Math.sin(a) * b0); g.lineTo(Math.cos(a + sg * .2) * (b0 + bl), Math.sin(a + sg * .2) * (b0 + bl)); g.stroke(); } }
  g.restore();
  if (p.lines !== 0) fxSpeedLines(g, f.T + k, Object.assign({ n: 70, col: '#e8fbff', inner: R * .9, w: 4, alpha: .8 }, F));
};
IMPACT.greenbolt = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#020604'); const F = impFocus(f, p);
  g.save(); g.globalCompositeOperation = 'lighter'; rawDraw(g, impSil('glow', p.col || '#4dff7c'), 0, 0, .8); g.restore();
  for (let i = 0; i < (p.n || 14); i++) { const a = hash(i * 7 + k * 31) * TAU, l = 400 + 700 * hash(i + k * 13); impBolt(g, F.x + Math.cos(a) * 60, F.y + Math.sin(a) * 60, F.x + Math.cos(a) * l, F.y + Math.sin(a) * l, i * 17 + k * 5, 6, p.col || '#4dff7c'); }
  rawDraw(g, impFigs(f, p.fill || '#020604', p.ink || '#f4fff6', 1.9));
  if (p.lines) fxSpeedLines(g, f.T + k, Object.assign({ n: p.lines, col: '#bfffd0', inner: 400, w: 3, alpha: .8 }, F));
};
IMPACT.decay = (c, g, f, p, k) => {
  rawDraw(g, filtered(c, 'grayscale(1) sepia(.55) contrast(1.35) brightness(.9)')); const F = impFocus(f, p);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 22; i++) { let a = i / 22 * TAU + hash(i) * .3, x = F.x, y = F.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 12; j++) { a += (hash(i * 13 + j) - .5) * .6; const l = 40 + 60 * hash(i * 3 + j); x += Math.cos(a) * l; y += Math.sin(a) * l; g.lineTo(x, y); } g.lineWidth = 7 - k; g.strokeStyle = '#1a0406'; g.stroke(); g.lineWidth = 2; g.strokeStyle = p.glow || '#c8202a'; g.stroke(); }
  g.restore();
  const sil = impSil('chars', '#2a1a1a'); rawDraw(g, sil, 0, 0, .55);
  for (let i = 0; i < 160; i++) { const a = hash(i * 3 + k) * TAU, d = 100 + 700 * hash(i * 5); g.fillStyle = i % 3 ? '#3a2a26' : '#8a7268'; const r = 2 + 6 * hash(i * 7); g.fillRect(F.x + Math.cos(a) * d, F.y + Math.sin(a) * d * .7, r, r * .7); }
};
IMPACT.bloodsplit = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#b8101c'); const F = impFocus(f, p), ang = p.ang == null ? -.5 : p.ang;
  g.fillStyle = '#4a0208'; for (let i = 0; i < 9; i++) { const a = hash(i * 5 + 3) * TAU, d = 120 + 520 * hash(i * 7), r = 50 + 120 * hash(i * 11); blobPath(g, F.x + Math.cos(a) * d, F.y + Math.sin(a) * d, r, i * 9 + 1, 12, .45); g.fill(); }
  splatter(g, 7 + k * 5, 26, '#2a0004', F, 800);
  rawDraw(g, impSil('chars', p.sil || '#080002'));
  g.save(); g.translate(F.x, F.y); g.rotate(ang); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(-1400, 0); g.quadraticCurveTo(0, -(p.w || 14), 1400, 0); g.quadraticCurveTo(0, p.w || 14, -1400, 0); g.fill(); g.restore();
};
IMPACT.silhouette = (c, g, f, p, k) => { fillAll(g, p.bg || '#e8401a'); if (p.bg2) { g.save(); g.fillStyle = p.bg2; g.beginPath(); g.arc(impFocus(f, p).x, impFocus(f, p).y, p.r || 380, 0, TAU); g.fill(); g.restore(); } rawDraw(g, impSil('chars', p.col || '#050203')); };
IMPACT.ash = (c, g, f, p, k) => {
  fillAll(g, p.bg || '#d8d2c8'); const sil = impSil('chars', p.col || '#2a2024'); rawDraw(g, sil, 0, 0, .9); const F = impFocus(f, p);
  for (let i = 0; i < 260; i++) { const a = -HP + (hash(i * 3) - .5) * 1.6, d = 50 + 800 * hash(i * 5) * (1 + k * .2); const x = F.x + Math.cos(a) * d + 200 * hash(i * 9), y = F.y + Math.sin(a) * d, r = 3 + 9 * hash(i * 7); g.save(); g.translate(x, y); g.rotate(i); g.fillStyle = i % 4 ? '#2a2024' : '#a03a2a'; g.fillRect(-r, -r * .5, r * 2, r); g.restore(); }
};
IMPACT.sunrise = (c, g, f, p, k) => { rawDraw(g, filtered(c, 'brightness(1.8) contrast(1.3) saturate(1.4) sepia(.35)')); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, rgba(p.col || '#ffd27a', .9)); gr.addColorStop(1, rgba(p.col || '#ffd27a', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); };
// mark paper styles (texture multiply in applyImpact)
for (const s of ['flame', 'bloodsplit', 'silhouette', 'ash', 'decay']) PAPER_STYLES.add(s);

Object.assign(IMPACT_SEQ, {
  // Rengoku Kyojuro
  rengoku_unknowing: [{ s: 'flash', n: 1, p: { col: '#fff2c8' } }, { s: 'flame', n: 2 }, { s: 'crimsonline', n: 1, p: { col: '#e8401a', bg: '#fff6e0', ang: -.05, w: 10 } }],
  rengoku_tiger: [{ s: 'flame', n: 2, p: { lines: 80 } }, { s: 'kanji', n: 3, p: { char: '炎虎', col: '#ffb22a', col2: '#fff2b8', outline: '#3a0602', tint: '#e8401a', size: 520 } }, { s: 'overexpose', n: 1, p: { col: '#ff8a2a' } }],
  rengoku_ninth: [{ s: 'blackaccent', n: 2, p: { accent: '#ff7a1a', lines: 90 } }, { s: 'kanji', n: 3, p: { char: '煉獄', col: '#ff5a1a', col2: '#ffd23a', outline: '#000000', tint: '#b8160e', size: 560 } }, { s: 'flame', n: 2 }, { s: 'whiteout', n: 1, p: { ink: '#3a0602' } }],
  rengoku_rising: [{ s: 'flame', n: 1 }, { s: 'invert', n: 1, p: { hue: 20 } }, { s: 'flame', n: 1 }],
  rengoku_heart: [{ s: 'closeup', n: 3, p: { part: 'eye', strip: true, stripH: 280 } }, { s: 'flame', n: 2, p: { lines: 0 } }],
  // Akaza
  akaza_compass: [{ s: 'compassneg', n: 3 }, { s: 'blackaccent', n: 2, p: { accent: '#7fdcff' } }],
  akaza_air: [{ s: 'invert', n: 1, p: { hue: 170 } }, { s: 'rings', n: 2, p: { col: '#bff0ff' } }],
  akaza_annihilation: [{ s: 'flash', n: 1, p: { col: '#e8fbff' } }, { s: 'compassneg', n: 2, p: { r: 560 } }, { s: 'kanji', n: 3, p: { char: '滅式', col: '#bff0ff', col2: '#ffffff', outline: '#06203a', tint: '#2a6aa8', size: 520 } }, { s: 'shatter', n: 3, p: { gap: '#bff0ff', edge: '#06203a' } }],
  akaza_bluesilver: [{ s: 'compassneg', n: 2, p: { col: '#ff6a8a' } }, { s: 'speedburst', n: 2 }, { s: 'compassneg', n: 2 }, { s: 'flash', n: 1 }],
  akaza_grin: [{ s: 'closeup', n: 3, p: { part: 'eye', strip: true, stripH: 260, mode: 'invert' } }, { s: 'invert', n: 1, p: { hue: 170 } }],
  // Midoriya Izuku
  deku_detroit: [{ s: 'flash', n: 1 }, { s: 'greenbolt', n: 2, p: { lines: 60 } }, { s: 'radial', n: 2, p: { lineCol: '#ffffff', ringCol: '#bfffd0' } }, { s: 'hatch', n: 1 }],
  deku_100: [{ s: 'greenbolt', n: 2, p: { n: 24 } }, { s: 'kanji', n: 3, p: { char: '100%', col: '#4dff7c', col2: '#f4fff6', outline: '#02140a', tint: '#0a6a2a', size: 420 } }, { s: 'overexpose', n: 2, p: { col: '#d8ffe0' } }, { s: 'whiteout', n: 1 }],
  deku_delaware: [{ s: 'invert', n: 1 }, { s: 'rings', n: 2, p: { col: '#e8fff0' } }],
  deku_manchester: [{ s: 'greenbolt', n: 1 }, { s: 'shatter', n: 3, p: { gap: '#d8ffe0' } }, { s: 'hatch', n: 1 }],
  deku_blackwhip: [{ s: 'ink', n: 2, p: { col: '#4dff7c', lines: 40 } }, { s: 'greenbolt', n: 1 }],
  deku_eye: [{ s: 'closeup', n: 3, p: { part: 'eye', strip: true, stripH: 260 } }, { s: 'greenbolt', n: 1 }],
  // Shigaraki Tomura
  shigaraki_decay: [{ s: 'decay', n: 3 }, { s: 'invert', n: 1, p: { hue: 0, sat: .3 } }, { s: 'decay', n: 1 }],
  shigaraki_wave: [{ s: 'desat', n: 2, p: { c: 1.5, b: .8 } }, { s: 'decay', n: 2 }, { s: 'kanji', n: 3, p: { char: '崩壊', col: '#d8d0c8', col2: '#ffffff', outline: '#1a0406', tint: '#4a3a36', size: 520 } }, { s: 'ash', n: 2 }],
  shigaraki_afo: [{ s: 'blackaccent', n: 2, p: { accent: '#ff3a2a', lines: 70 } }, { s: 'redblack', n: 2, p: { col: '#5a0a10' } }, { s: 'chroma', n: 1, p: { d: 30 } }],
  shigaraki_grin: [{ s: 'closeup', n: 3, p: { part: 'mouth', strip: true, stripH: 300, mode: 'invert' } }, { s: 'decay', n: 1 }],
  // death / kill frames (generic)
  death_blood: [{ s: 'flash', n: 1 }, { s: 'bloodsplit', n: 3 }, { s: 'redblack', n: 2 }, { s: 'black', n: 1 }],
  death_silhouette: [{ s: 'silhouette', n: 4, p: { bg: '#e8401a', bg2: '#ffd27a' } }, { s: 'black', n: 1 }],
  death_ash: [{ s: 'whiteout', n: 1 }, { s: 'ash', n: 4 }, { s: 'flash', n: 1, p: { col: '#d8d2c8' } }],
  death_split: [{ s: 'crimsonline', n: 2, p: { col: '#c8101a', bg: '#ffffff', w: 12 } }, { s: 'bloodsplit', n: 3 }, { s: 'black', n: 2 }],
  death_decay: [{ s: 'decay', n: 3 }, { s: 'ash', n: 3, p: { bg: '#c8c0b4' } }],
  final_dawn: [{ s: 'sunrise', n: 4 }, { s: 'flash', n: 1, p: { col: '#fff4d0' } }],
});

// ---- pre/impact_requests.md: named series used by pre/shots.json (fallbacks upgraded with the E1 styles where they exist) ----
Object.assign(IMPACT_SEQ, {
  CARD_DECK: [{ s: 'panels', n: 2, p: { modes: ['zoom', 'neg', 'orig'] } }, { s: 'invert', n: 1 }],
  SUIT_FLASH: [{ s: 'kanji', n: 1, p: { char: '♠', col: '#ff3a3a', outline: '#000000', tint: '#2a0000' } }, { s: 'flash', n: 1 }, { s: 'kanji', n: 1, p: { char: '♥', col: '#ff3a3a', outline: '#000000', tint: '#2a0000' } }],
  JOKER_53: [{ s: 'closeup', n: 1, p: { part: 'eye', mode: 'invert', bg: '#5a2a7a' } }, { s: 'duotone', n: 1, p: { dark: '#12001a', light: '#c04ae0' } }],
  NICHIRIN_HALO: [{ s: 'radial', n: 1, p: { lineCol: '#ffb04a', ringCol: '#ffd23a' } }, { s: 'rimsil', n: 2, p: { col: '#ffd23a', col2: '#e8401a' } }, { s: 'flash', n: 1 }],
  CRIMSON_MOON: [{ s: 'overexpose', n: 1, p: { col: '#c8102e' } }, { s: 'rimsil', n: 2, p: { col: '#ff3a3a', col2: '#6a0010' } }, { s: 'flash', n: 1 }],
  LION_CLAW: [{ s: 'tear', n: 1 }, { s: 'redblack', n: 1 }, { s: 'tear', n: 1 }],
  HELLFIRE: [{ s: 'overexpose', n: 1, p: { col: '#fff0b0' } }, { s: 'posterize', n: 2 }, { s: 'flash', n: 1 }],
  MERCURY_MIRROR: [{ s: 'invert', n: 1, p: { hue: 0 } }, { s: 'desat', n: 1 }, { s: 'chroma', n: 1, p: { d: 24 } }],
  SILVER_EAGLE: [{ s: 'rimsil', n: 1, p: { col: '#e6e8ee', col2: '#7a808e' } }, { s: 'speedburst', n: 1 }, { s: 'flash', n: 1 }],
  FLAME_TIGER: [{ s: 'sumi', n: 1 }, { s: 'flame', n: 1, p: { lines: 50 } }, { s: 'sumi', n: 1 }],
  PURGATORY_DRAGON: [{ s: 'speedburst', n: 1 }, { s: 'flame', n: 1, p: { lines: 90, bg: '#5a0a02' } }],
  COMPASS_NEEDLE: [{ s: 'compassneg', n: 2 }, { s: 'invert', n: 1, p: { hue: 200 } }],
  DESTRUCTIVE_BLUE: [{ s: 'rings', n: 1, p: { col: '#4ab8ff' } }, { s: 'black', n: 1 }, { s: 'rings', n: 1, p: { col: '#ff3a5a' } }],
  OFA_GREEN: [{ s: 'chroma', n: 1, p: { d: 30 } }, { s: 'greenbolt', n: 1 }, { s: 'chroma', n: 1 }],
  DETROIT_SKY: [{ s: 'radial', n: 1 }, { s: 'whiteout', n: 1 }, { s: 'radial', n: 1 }],
  DECAY_DUST: [{ s: 'decay', n: 1 }, { s: 'desat', n: 1 }, { s: 'decay', n: 1 }],
  AFO_TENDRIL: [{ s: 'blackaccent', n: 2, p: { accent: '#c8102e', lines: 60 } }],
  BLOOD_MIST: [{ s: 'shatter', n: 1, p: { gap: '#d2203a' } }, { s: 'flash', n: 1 }, { s: 'shatter', n: 1, p: { gap: '#6a0010' } }],
  KANNON_THREAD: [{ s: 'crimsonline', n: 2, p: { col: '#d2203a' } }, { s: 'whiteout', n: 1 }],
  KABUKI_CURTAIN: [{ s: 'kabuki', n: 1 }, { s: 'panels', n: 1 }, { s: 'black', n: 1 }],
  GOLD_BURN: [{ s: 'overexpose', n: 2, p: { col: '#ffd27a' } }, { s: 'whiteout', n: 1 }],
});
