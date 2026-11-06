/* engine/impact_hvg.js (agent E, project harry-vs-gojo) - impact styles + sequences for pre/impact_requests.md (all hand2d-graphic, lines >= 3 px @1080).
   STYLES (IMPACT[name](comp, g, f, p, k, n)) - focus = p.at (world) / p.x,p.y / figures' centre:
     fansnap        Urahara's fan fills the frame as a black silhouette against gold lantern light; last frame a white horizontal snap line; 開幕 gold (p.text)
     cardH / cardG  power-card hit: wine (H) / night-blue (G) negative, gold sparks / crystal hexes, Hallows sigil / 無下限 flash (p.flashMark)
     goldburn2      gold over-exposure with black silhouettes (K frames)
     sixeyes        a Six Eyes iris fills the frame: crystalline cyan galaxy, white lashes, radial light lines; p.neg = negative frame
     gongwave       gold concentric rings from the centre, figures + stands black, the sand ring white
     spellred       white frame, one red beam across from the wand tip (p.from screen/world or focus) + gold spiral sparks, white star at the tip
     infinityfreeze picture frozen to icy blue monochrome, effects (glow/fx layers) stay sharp and coloured, a hex grid sphere flashes (p.r px, p.col)
     singularity    the frame twirls into a spiral toward the focus, dark edges, blue core
     protegodome    black frame, figures white lineart, the shield as a white line dome with gold hexagons, ripples from p.hit (screen)
     apparate       black frame, the figure silhouette twists and squeezes to a point (k), white horizontal crack line
     redrepulse     red field, black silhouettes, white shock rings outward from the fingertip/focus
     blackflash     negative + black lightning with red glow around the focus + 10 px chromatic split
     voidstars      Unlimited Void: star sea + white information streams to the centre, figures white lineart (p.dense)
     purplevoid     Hollow Purple: flat featureless black, blue and red spirals merging into a violet sphere with a white rim
     masked set:    sixeyespov memorysepia cloakfade voidpass domainshatter hallowssigil patronussilver snitchtouch portkeyspin ringout winnercard handshakeglow
   SEQUENCES (shots.json names, frame patterns from impact_requests.md):
     FAN_SNAP POWER_CARD_H POWER_CARD_G SIX_EYES GONG_WAVE SPELL_RED INFINITY_FREEZE BLUE_SINGULARITY PROTEGO_DOME APPARATE_TWIST RED_REPULSE BLACK_FLASH
     UNLIMITED_VOID (V2-W1-V1) UNLIMITED_VOID_B (V1-W2) HOLLOW_PURPLE  + masked: SIX_EYES_POV MEMORY_SEPIA CLOAK_FADE VOID_PASS DOMAIN_SHATTER HALLOWS_SIGIL
     PATRONUS_SILVER SNITCH_TOUCH PORTKEY_SPIN RING_OUT WINNER_CARD HANDSHAKE_GLOW INFINITY_FREEZE_SILVER
     character series: har_expelliarmus har_patronus har_protego har_apparate goj_blue goj_red goj_purple goj_domain goj_blackflash goj_infinity clash_hvg      */
'use strict';
const HVIMP = { gold: '#ffd36a', gold2: '#fff4c8', wine: '#3a0b10', navy: '#050b1e', cyan: '#5fd3ff', cyan2: '#c9f3ff', red: '#ff2a2a', blue: '#3a7bff', purple: '#9b4dff' };
function hvFx(f, p) { return impFocus(f, p); }
function hvSil(col) { return impSil('chars', col); }
function hvLines(g, q, n, col, inner, w = 3, seed = 1) { const r = rng(seed); g.save(); g.strokeStyle = col; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = r() * TAU, r0 = inner * (.8 + r() * .5), r1 = 2400; g.lineWidth = w * (.5 + r()); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); } g.restore(); }
function hvHallows(g, x, y, R, col, w = 10) { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y - R); g.lineTo(x + R * .9, y + R * .6); g.lineTo(x - R * .9, y + R * .6); g.closePath(); g.moveTo(x, y - R); g.lineTo(x, y + R * .6); g.stroke(); g.beginPath(); g.arc(x, y + R * .14, R * .45, 0, TAU); g.stroke(); g.restore(); }
function hvTint(c, filter, col, mode = 'multiply', a = 1) { const t = filtered(c, filter), g = t.getContext('2d'); if (col) { g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, t.width, t.height); g.restore(); } return t; }

IMPACT.fansnap = (c, g, f, p, k, n) => {
  const q = { x: W / 2, y: H * .62 }; fillAll(g, '#000'); const gr = g.createRadialGradient(q.x, q.y - 200, 50, q.x, q.y, 1300); gr.addColorStop(0, '#fff2c0'); gr.addColorStop(.35, '#ffb84a'); gr.addColorStop(1, '#5a2a08'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(q.x, q.y + 260); const R = 980, open = .78 + .22 * Math.min(1, (k + 1) / n); g.fillStyle = '#050305'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, -Math.PI / 2 - open * 1.35, -Math.PI / 2 + open * 1.35); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,200,90,.35)'; g.lineWidth = 4; for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 - open * 1.35 + i / 14 * open * 2.7; g.beginPath(); g.moveTo(Math.cos(a) * 120, Math.sin(a) * 120); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke(); }
  g.font = '900 230px "IPAGothic", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = HVIMP.gold; g.shadowColor = '#ffb040'; g.shadowBlur = 40; g.fillText(p.text || '開幕', 0, -R * .55); g.restore();
  if (k === n - 1) { g.save(); g.fillStyle = '#ffffff'; g.shadowColor = '#ffffff'; g.shadowBlur = 30; g.fillRect(0, H * .5 - 6, W, 12); g.restore(); }
};
IMPACT.goldburn2 = (c, g, f, p, k) => { const t = hvTint(c, 'grayscale(1) brightness(1.6) contrast(1.6)', '#ffb030'); rawDraw(g, t); rawDraw(g, hvSil('#1a0a00')); const q = hvFx(f, p); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 700, '#ffe090', .7); g.restore(); };
IMPACT.cardH = (c, g, f, p, k, n) => {
  if (p.gold || (k === 0 && !p.neg)) return IMPACT.goldburn2(c, g, f, p, k);
  rawDraw(g, hvTint(c, 'invert(1) grayscale(1) contrast(1.6)', '#c0303a')); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#7a1a22'; g.fillRect(0, 0, W, H); g.restore();
  const q = hvFx(f, p); g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(31 + k); for (let i = 0; i < 70; i++) { const a = r() * TAU, d = 100 + r() * 900; g.fillStyle = rgba(HVIMP.gold, .9); g.fillRect(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, 4 + r() * 6, 4 + r() * 6); } g.restore();
  hvHallows(g, W / 2, H / 2, 380, rgba(HVIMP.gold, .9), 14);
};
IMPACT.cardG = (c, g, f, p, k, n) => {
  if (p.white) { fillAll(g, '#ffffff'); rawDraw(g, hvSil('#050b1e')); return; }
  rawDraw(g, hvTint(c, 'invert(1) grayscale(1) contrast(1.7)', '#3a7bff')); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#1a3a8a'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.strokeStyle = rgba(HVIMP.cyan2, .6); g.lineWidth = 3; const hs = 80; for (let y = -1; y < H / (hs * 1.5) + 1; y++) for (let x = -1; x < W / (hs * 1.73) + 1; x++) { if (hash(x * 7 + y * 13 + k) < .6) continue; const cx = x * hs * 1.73 + (y & 1) * hs * .87, cy = y * hs * 1.5; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(cx + Math.cos(a) * hs, cy + Math.sin(a) * hs); } g.closePath(); g.stroke(); } g.restore();
  g.save(); g.font = '900 360px "IPAGothic", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba('#ffffff', .85); g.shadowColor = HVIMP.cyan; g.shadowBlur = 50; g.fillText('無下限', W / 2, H / 2); g.restore();
};
IMPACT.sixeyes = (c, g, f, p, k) => {
  const neg = p.neg, cx = W / 2 + (p.dx || 0), cy = H / 2, R = 430; fillAll(g, neg ? '#f4fbff' : '#020410');
  g.save(); g.beginPath(); g.ellipse(cx, cy, 980, 380, 0, 0, TAU); g.fillStyle = neg ? '#0a1020' : '#f6fbff'; g.fill(); g.clip();
  const gr = g.createRadialGradient(cx, cy, 20, cx, cy, R); gr.addColorStop(0, neg ? '#ffe8c0' : '#e8fbff'); gr.addColorStop(.25, neg ? '#ff9a40' : HVIMP.cyan2); gr.addColorStop(.6, neg ? '#c04010' : HVIMP.cyan); gr.addColorStop(1, neg ? '#401000' : '#0a2a6a'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  const r = rng(77); g.strokeStyle = rgba(neg ? '#200800' : '#ffffff', .5); g.lineWidth = 3; for (let i = 0; i < 90; i++) { const a = r() * TAU, r0 = R * (.15 + r() * .2), r1 = R * (.6 + r() * .4); g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a + (r() - .5) * .2) * r1, cy + Math.sin(a) * r1); g.stroke(); }
  for (let i = 0; i < 120; i++) { const a = r() * TAU, d = r() * R; g.fillStyle = rgba('#ffffff', .4 + .6 * r()); g.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3, 3); }
  g.fillStyle = neg ? '#ffffff' : '#000818'; g.beginPath(); g.arc(cx, cy, R * .2, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(cx - R * .35, cy - R * .35, R * .16, R * .11, -.4, 0, TAU); g.fill();
  g.restore();
  g.save(); g.strokeStyle = neg ? '#000' : '#ffffff'; g.lineCap = 'round'; for (let i = 0; i < 14; i++) { const u = i / 13, x = cx - 900 + u * 1800, y = cy - 380 * Math.sin(Math.PI * (.08 + u * .84)) + 10; g.lineWidth = 10 - 4 * Math.abs(u - .5); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (u - .5) * 60, y - 60, x + (u - .5) * 140, y - 120 - 40 * Math.sin(u * Math.PI)); g.stroke(); }
  g.lineWidth = 16; g.beginPath(); g.ellipse(cx, cy, 980, 380, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke(); g.restore();
  if (!neg) { g.save(); g.globalCompositeOperation = 'lighter'; hvLines(g, { x: cx, y: cy }, 40, rgba(HVIMP.cyan2, .35), 450, 4, 9); g.restore(); }
};
IMPACT.gongwave = (c, g, f, p, k) => {
  if (p.white) { fillAll(g, '#ffffff'); rawDraw(g, hvSil('#1a1008')); return; }
  fillAll(g, '#2a1a06'); const t = hvTint(c, 'grayscale(1) contrast(2.2) brightness(.6)', '#6a4a18'); rawDraw(g, t, 0, 0, .55); rawDraw(g, hvSil('#000000'));
  const q = hvFx(f, p); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const R = 80 + i * 150 + k * 70; g.strokeStyle = rgba(HVIMP.gold, .9 - i * .08); g.lineWidth = 14 - i; g.beginPath(); g.ellipse(q.x, q.y, R, R * .55, 0, 0, TAU); g.stroke(); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.beginPath(); g.ellipse(W / 2, H * .82, W * .55, 120, 0, 0, TAU); g.stroke(); g.restore();
};
IMPACT.spellred = (c, g, f, p, k) => {
  fillAll(g, '#ffffff'); rawDraw(g, hvSil('#1a0808'), 0, 0, .9); const q = hvFx(f, p), fr = p.from ? (Array.isArray(p.from) ? (project(p.from) || q) : p.from) : { x: q.x - 700, y: q.y + 120 };
  const ang = Math.atan2(q.y - fr.y, q.x - fr.x), L = 3000, ex = fr.x + Math.cos(ang) * L, ey = fr.y + Math.sin(ang) * L;
  g.save(); g.lineCap = 'round'; g.strokeStyle = HVIMP.red; g.lineWidth = 46; g.beginPath(); g.moveTo(fr.x, fr.y); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#ffe0d0'; g.lineWidth = 12; g.stroke();
  const nx = -Math.sin(ang), ny = Math.cos(ang); g.fillStyle = HVIMP.gold; for (let i = 0; i < 60; i++) { const s = i * 40 + k * 20, off = Math.sin(i * .7 + k) * 70; g.beginPath(); g.arc(fr.x + Math.cos(ang) * s + nx * off, fr.y + Math.sin(ang) * s + ny * off, 7, 0, TAU); g.fill(); }
  fxImpactStar(g, fr.x, fr.y, 140, .3, '#ffffff', 4); g.strokeStyle = '#1a0808'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3, r = i % 2 ? 40 : 140; g.lineTo(fr.x + Math.cos(a) * r, fr.y + Math.sin(a) * r); } g.closePath(); g.stroke(); g.restore();
};
IMPACT.infinityfreeze = (c, g, f, p, k) => {
  if (p.blue) { rawDraw(g, hvTint(c, 'grayscale(1) contrast(1.3) brightness(1.1)', '#7ab8ff')); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .8; g.drawImage(layer('glow'), 0, 0, W, H); g.restore(); return; }
  const col = p.col || '#bfe4ff'; rawDraw(g, hvTint(c, 'grayscale(1) contrast(1.15) brightness(1.15)', col));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.drawImage(layer('fxover'), 0, 0); g.globalCompositeOperation = 'lighter'; g.drawImage(layer('glow'), 0, 0); g.restore();
  const q = hvFx(f, p), R = p.r || 420; g.save(); g.strokeStyle = rgba('#ffffff', .75); g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.clip();
  const hs = R / 6; g.strokeStyle = rgba('#e8f6ff', .45); g.lineWidth = 3; for (let iy = -8; iy <= 8; iy++) for (let ix = -8; ix <= 8; ix++) { const x = ix * hs * 1.73 + (iy & 1) * hs * .87, y = iy * hs * 1.5, d = Math.hypot(x, y) / R; if (d > 1) continue; const sc = Math.sqrt(1 - d * d) * .4 + .6; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(q.x + x * sc + Math.cos(a) * hs * .9 * sc, q.y + y * sc + Math.sin(a) * hs * .9 * sc); } g.closePath(); g.stroke(); } g.restore();
  g.save(); const vg = g.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, W * .7); vg.addColorStop(0, 'rgba(220,240,255,0)'); vg.addColorStop(1, 'rgba(220,240,255,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
};
IMPACT.singularity = (c, g, f, p, k, n) => {
  const q = hvFx(f, p), src = copyComp(c), sc = OUT.scale, N = 16, tw = (p.twist || 1.6) * (k + 1) / n; fillAll(g, '#000');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (let i = N; i >= 1; i--) { const r1 = 1400 * i / N, rot = tw * Math.pow(1 - i / N, 1.5), s = 1 - .45 * Math.pow(1 - i / N, 1.3); g.save(); g.beginPath(); g.arc(q.x * sc, q.y * sc, r1 * sc, 0, TAU); g.clip(); g.translate(q.x * sc, q.y * sc); g.rotate(rot); g.scale(s, s); g.translate(-q.x * sc, -q.y * sc); g.drawImage(src, 0, 0); g.restore(); } g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#4a6aff'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; const vg = g.createRadialGradient(q.x, q.y, 100, q.x, q.y, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.92)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 260, '#3a7bff', 1); glow(g, q.x, q.y, 80, '#ffffff', 1); g.restore();
};
IMPACT.protegodome = (c, g, f, p, k) => {
  if (p.white) { fillAll(g, '#ffffff'); rawDraw(g, impFigs(f, '#ffffff', '#101018')); return; }
  fillAll(g, '#04050a'); rawDraw(g, impFigs(f, '#04050a', '#ffffff', 1.6));
  const q = p.dome ? (Array.isArray(p.dome) ? project(p.dome) || hvFx(f, p) : p.dome) : hvFx(f, p), R = p.r || 520; g.save(); g.lineJoin = 'round';
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.ellipse(q.x, q.y + R * .25, R, R * 1.0, 0, Math.PI, TAU); g.stroke(); g.beginPath(); g.ellipse(q.x, q.y + R * .25, R, R * .25, 0, 0, TAU); g.stroke();
  const hs = R / 6.5; g.strokeStyle = HVIMP.gold; g.lineWidth = 3; for (let iy = -9; iy <= 2; iy++) for (let ix = -9; ix <= 9; ix++) { const x = ix * hs * 1.73 + (iy & 1) * hs * .87, y = iy * hs * 1.5; if ((x * x) / (R * R) + (y * y) / (R * R) > .92 || y > 0) continue; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(q.x + x + Math.cos(a) * hs * .88, q.y + R * .25 + y + Math.sin(a) * hs * .88); } g.closePath(); g.stroke(); }
  const hp = p.hit || { x: q.x + R * .5, y: q.y - R * .4 }; g.strokeStyle = '#ffffff'; for (let i = 0; i < 4; i++) { g.lineWidth = 6 - i; g.beginPath(); g.arc(hp.x, hp.y, 30 + i * 70 + k * 40, 0, TAU); g.stroke(); } g.restore();
};
IMPACT.apparate = (c, g, f, p, k, n) => {
  if (p.blackOnly) { fillAll(g, '#000'); g.save(); g.fillStyle = '#fff'; g.fillRect(0, H / 2 - 4, W, 8); g.restore(); return; }
  fillAll(g, '#000'); const q = hvFx(f, p), sil = hvSil('#ffffff'), sc = OUT.scale, u = (k + 1) / n * (p.squeeze == null ? 1 : p.squeeze), N = 12;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < N; i++) { const y0 = c.height * i / N, h = c.height / N, rot = u * 2.5 * (i / N - .5), s = 1 - u * .9; g.save(); g.beginPath(); g.rect(0, y0, c.width, h + 1); g.clip(); g.translate(q.x * sc, q.y * sc); g.rotate(rot); g.scale(s, 1 - u * .3); g.translate(-q.x * sc, -q.y * sc); g.drawImage(sil, 0, 0); g.restore(); } g.restore();
  g.save(); g.strokeStyle = '#ffffff'; g.lineWidth = 3; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + k; g.beginPath(); g.arc(q.x, q.y, 120 + i * 30, a, a + 1.4); g.stroke(); } g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 20; g.fillRect(0, q.y - 4, W, 8); g.restore();
};
IMPACT.redrepulse = (c, g, f, p, k) => {
  if (p.white) { fillAll(g, '#ffffff'); rawDraw(g, hvSil('#000000')); return; }
  fillAll(g, '#d0101e'); rawDraw(g, hvSil('#000000')); const q = hvFx(f, p); g.save(); g.strokeStyle = '#ffffff'; for (let i = 0; i < 6; i++) { const R = 60 + i * 190 + k * 110; g.lineWidth = 22 - i * 3; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); } hvLines(g, q, 30, 'rgba(0,0,0,.8)', 300, 6, 3); g.restore();
};
IMPACT.blackflash = (c, g, f, p, k) => {
  const q = hvFx(f, p), t = filtered(c, 'invert(1) contrast(1.5) saturate(1.3)'), sc = OUT.scale;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(t, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5; g.filter = 'none'; const d = 10 * sc; g.drawImage(filtered(c, 'invert(1) sepia(1) saturate(6) hue-rotate(-40deg)'), -d, 0); g.restore();
  g.save(); g.lineJoin = 'miter'; g.lineCap = 'round'; for (let i = 0; i < 14; i++) { const a = hash(i * 7 + k * 3) * TAU, L = 300 + hash(i + k) * 700, pts = [[q.x, q.y]]; for (let j = 1; j <= 7; j++) { const s = j / 7; pts.push([q.x + Math.cos(a) * L * s + (hash(i * 5 + j + k) - .5) * L * .3, q.y + Math.sin(a) * L * s + (hash(i * 3 + j * 7 + k) - .5) * L * .3]); }
    polyPath(g, pts, false); g.strokeStyle = '#ff2d3a'; g.lineWidth = 26; g.stroke(); g.strokeStyle = '#000000'; g.lineWidth = 11; g.stroke(); } g.restore();
};
IMPACT.voidstars = (c, g, f, p, k) => {
  const sf = hvgStarField(c.width, c.height, 3); rawDraw(g, sf); const q = hvFx(f, p), r = rng(13 + k); g.save(); g.lineCap = 'round';
  for (let i = 0; i < (p.dense || 140); i++) { const a = r() * TAU, d0 = 400 + r() * 1400, d1 = d0 * (.2 + r() * .4); g.strokeStyle = rgba('#ffffff', .4 + .6 * r()); g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(q.x + Math.cos(a) * d0, q.y + Math.sin(a) * d0); g.lineTo(q.x + Math.cos(a) * d1, q.y + Math.sin(a) * d1); g.stroke(); }
  g.restore(); rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#ffffff', 1.6));
};
IMPACT.purplevoid = (c, g, f, p, k, n) => {
  fillAll(g, '#000000'); const q = hvFx(f, p), u = (k + 1) / n, R = 220 + 160 * u; g.save(); g.lineCap = 'round';
  for (const [col, ph] of [[HVIMP.blue, 0], ['#ff2d3a', Math.PI]]) { const pts = []; for (let i = 0; i <= 80; i++) { const s = i / 80, a = ph + s * 9 + k, d = R * (1 + (1 - s) * 2.2 * (1 - u * .6)); pts.push([q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .7]); } polyPath(g, pts, false); g.strokeStyle = col; g.lineWidth = 26; g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.stroke(); }
  const gr = g.createRadialGradient(q.x, q.y, R * .1, q.x, q.y, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.3, '#e0b8ff'); gr.addColorStop(1, '#6a1ac8'); g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.stroke(); g.restore();
};
// ---------------------------------------------------------------------------------------------------------------- masked-shot styles (no plot)
IMPACT.sixeyespov = (c, g, f, p, k) => { fillAll(g, '#020818'); const t = filtered(c, 'grayscale(1) contrast(3) brightness(1.2)'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(1px)'; g.globalAlpha = .9; g.drawImage(t, 0, 0); g.drawImage(t, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#5aa8ff'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(95,211,255,.6)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const y = (i * 37 + k * 11) % H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y - 40, W * .6, y + 40, W, y); g.stroke(); } g.restore(); if (p.hole !== false) rawDraw(g, hvSil('#000000')); };
IMPACT.memorysepia = (c, g, f, p, k) => { rawDraw(g, filtered(c, 'sepia(1) contrast(1.1) brightness(1.1)')); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, W / 2, H / 2, 800, '#ffc860', .35); glow(g, (p.x || W / 2), (p.y || H / 2), 40, '#5fd3ff', 1); glow(g, (p.x || W / 2), (p.y || H / 2), 12, '#ffffff', 1); g.restore(); };
IMPACT.cloakfade = (c, g, f, p, k, n) => { const u = (k + 1) / n, cut = H * (1 - u), bgc = layer('bg'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(0, cut * OUT.scale, c.width, c.height); g.clip(); g.drawImage(bgc, 0, 0); g.restore(); g.save(); g.strokeStyle = 'rgba(220,235,255,.9)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); for (let x = 0; x <= W; x += 20) g.lineTo(x, cut + Math.sin(x * .02 + k * 2 + i) * 10 + i * 8); g.stroke(); } g.restore(); };
IMPACT.voidpass = (c, g, f, p, k) => { fillAll(g, '#ffffff'); rawDraw(g, impFigs(f, '#ffffff', '#000000', 1.6)); g.save(); g.strokeStyle = '#000'; for (let i = 0; i < 26; i++) { const y = hash(i * 3 + k) * H; g.lineWidth = 2 + hash(i) * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + (hash(i * 7) - .5) * 300); g.stroke(); } g.restore(); };
IMPACT.domainshatter = (c, g, f, p, k, n) => { rawDraw(g, hvgStarField(c.width, c.height, 3)); IMPACT.shatter(c, g, f, Object.assign({ rays: 18, push: 60 + k * 50, edge: '#000000', gap: '#000000' }, p), k, n); };
IMPACT.hallowssigil = (c, g, f, p, k) => { fillAll(g, '#000'); g.save(); g.fillStyle = '#0a0806'; for (let i = 0; i < 30; i++) { const x = i * 70 + hash(i) * 30, h = 300 + hash(i * 3) * 500; g.beginPath(); g.moveTo(x - 24, H); g.lineTo(x - 10, H - h); g.lineTo(x + 10, H - h); g.lineTo(x + 26, H); g.fill(); } g.globalCompositeOperation = 'lighter'; glow(g, W / 2, H / 2, 600, '#ffb040', .35); g.restore(); hvHallows(g, W / 2, H / 2 - 20, 300 + k * 10, HVIMP.gold, 14); };
IMPACT.patronussilver = (c, g, f, p, k) => { rawDraw(g, hvTint(c, 'invert(1) grayscale(1) contrast(1.8)', null)); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8aa0c0'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; hvLines(g, { x: W / 2, y: H / 2 }, 50, 'rgba(230,240,255,.5)', 200, 6, 5); g.restore(); if (typeof fxPatronus === 'function') fxPatronus(g, { x: W / 2, y: H * .66, s: 520 }, [1, 0, 0], 1 + k * .1, { scale: 1, trail: false }); };
IMPACT.snitchtouch = (c, g, f, p, k) => { fillAll(g, '#ffffff'); const q = hvFx(f, p); g.save(); g.fillStyle = HVIMP.gold; g.beginPath(); g.arc(q.x, q.y, 22, 0, TAU); g.fill(); g.strokeStyle = '#5fd3ff'; g.lineWidth = 4; g.beginPath(); g.arc(q.x, q.y, 90 + k * 60, 0, TAU); g.stroke(); g.restore(); };
IMPACT.portkeyspin = (c, g, f, p, k, n) => { IMPACT.singularity(c, g, f, Object.assign({ twist: 3.2 }, p), k, n); const q = hvFx(f, p); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { g.strokeStyle = i % 2 ? rgba(HVIMP.gold, .8) : rgba('#5fd3ff', .8); g.lineWidth = 8; g.beginPath(); for (let s = 0; s <= 60; s++) { const a = s / 60 * 8 + i + k, d = 40 + s * 18; g.lineTo(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .7); } g.stroke(); } g.restore(); };
IMPACT.ringout = (c, g, f, p, k, n) => { fillAll(g, '#c0101a'); rawDraw(g, hvSil('#000000')); g.save(); const col = mixHex(HVIMP.gold, '#ff2a2a', (k + 1) / n); g.strokeStyle = col; g.lineWidth = 18; g.shadowColor = col; g.shadowBlur = 30; g.beginPath(); g.ellipse(W / 2, H * .84, W * .7, 110, 0, 0, TAU); g.stroke(); g.restore(); };
IMPACT.winnercard = (c, g, f, p, k) => { fillAll(g, '#1a0e02'); const gr = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 1100); gr.addColorStop(0, '#ffe8a0'); gr.addColorStop(1, '#4a2a06'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.save(); g.strokeStyle = 'rgba(255,240,200,.8)'; for (let i = 0; i < 6; i++) { g.lineWidth = 10 - i; g.beginPath(); g.ellipse(W / 2, H / 2, 200 + i * 160 + k * 60, (200 + i * 160 + k * 60) * .55, 0, 0, TAU); g.stroke(); } g.restore(); arenaTitle(g, 1, { t0: 0, dur: 5, text: p.text || 'WINNER', size: 220, band: false, y: H / 2 + 80 }); };
IMPACT.handshakeglow = (c, g, f, p, k) => { rawDraw(g, filtered(c, 'brightness(1.6) contrast(.8) saturate(.4)')); const q = hvFx(f, p); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 600, '#ffffff', .6); g.lineCap = 'round'; g.lineWidth = 10; g.strokeStyle = '#5fd3ff'; g.beginPath(); g.moveTo(W + 50, q.y - 200); g.quadraticCurveTo(q.x + 300, q.y - 40, q.x, q.y); g.stroke(); g.strokeStyle = HVIMP.gold; g.beginPath(); g.moveTo(-50, q.y + 200); g.quadraticCurveTo(q.x - 300, q.y + 40, q.x, q.y); g.stroke(); g.restore(); };

// ---------------------------------------------------------------------------------------------------------------- sequences
Object.assign(IMPACT_SEQ, {
  FAN_SNAP: [{ s: 'flash', n: 1 }, { s: 'fansnap', n: 2 }],
  POWER_CARD_H: [{ s: 'cardH', n: 1, p: { gold: true } }, { s: 'cardH', n: 1, p: { neg: true } }, { s: 'cardH', n: 1, p: { gold: true } }],
  POWER_CARD_G: [{ s: 'cardG', n: 1 }, { s: 'cardG', n: 1, p: { white: true } }, { s: 'cardG', n: 1 }],
  SIX_EYES: [{ s: 'sixeyes', n: 1 }, { s: 'sixeyes', n: 1, p: { neg: true } }, { s: 'sixeyes', n: 1, p: { dx: 8 } }],
  GONG_WAVE: [{ s: 'gongwave', n: 2 }, { s: 'gongwave', n: 1, p: { white: true } }],
  SPELL_RED: [{ s: 'crimsonline', n: 1, p: { col: '#ff2a2a' } }, { s: 'flash', n: 1 }, { s: 'spellred', n: 1 }],
  INFINITY_FREEZE: [{ s: 'infinityfreeze', n: 1 }, { s: 'infinityfreeze', n: 1, p: { blue: true } }, { s: 'infinityfreeze', n: 1 }],
  INFINITY_FREEZE_SILVER: [{ s: 'infinityfreeze', n: 1, p: { col: '#e8eef8' } }, { s: 'infinityfreeze', n: 1, p: { blue: true } }, { s: 'infinityfreeze', n: 1, p: { col: '#e8eef8' } }],
  BLUE_SINGULARITY: [{ s: 'singularity', n: 2 }, { s: 'flash', n: 1 }],
  PROTEGO_DOME: [{ s: 'protegodome', n: 1 }, { s: 'protegodome', n: 1, p: { white: true } }, { s: 'protegodome', n: 1 }],
  APPARATE_TWIST: [{ s: 'apparate', n: 1, p: { squeeze: .5 } }, { s: 'apparate', n: 1, p: { blackOnly: true } }, { s: 'apparate', n: 1, p: { squeeze: 1 } }],
  RED_REPULSE: [{ s: 'redrepulse', n: 2 }, { s: 'redrepulse', n: 1, p: { white: true } }],
  BLACK_FLASH: [{ s: 'blackflash', n: 1 }, { s: 'redblack', n: 1, p: { col: '#d0101e' } }, { s: 'flash', n: 1 }],
  UNLIMITED_VOID: [{ s: 'voidstars', n: 2 }, { s: 'flash', n: 1 }, { s: 'voidstars', n: 1, p: { dense: 260 } }],
  UNLIMITED_VOID_B: [{ s: 'voidstars', n: 1 }, { s: 'flash', n: 2 }],
  HOLLOW_PURPLE: [{ s: 'purplevoid', n: 1 }, { s: 'flash', n: 1 }, { s: 'purplevoid', n: 2 }],
  SIX_EYES_POV: [{ s: 'sixeyespov', n: 3 }], MEMORY_SEPIA: [{ s: 'memorysepia', n: 3 }], CLOAK_FADE: [{ s: 'cloakfade', n: 4 }], VOID_PASS: [{ s: 'voidpass', n: 2 }, { s: 'voidstars', n: 1 }],
  DOMAIN_SHATTER: [{ s: 'domainshatter', n: 4 }], HALLOWS_SIGIL: [{ s: 'hallowssigil', n: 3 }], PATRONUS_SILVER: [{ s: 'patronussilver', n: 3 }], SNITCH_TOUCH: [{ s: 'snitchtouch', n: 2 }],
  PORTKEY_SPIN: [{ s: 'portkeyspin', n: 3 }], RING_OUT: [{ s: 'ringout', n: 3 }], WINNER_CARD: [{ s: 'winnercard', n: 3 }], HANDSHAKE_GLOW: [{ s: 'handshakeglow', n: 2 }],
  // character series (free use)
  har_expelliarmus: [{ s: 'flash', n: 1 }, { s: 'spellred', n: 2 }, { s: 'invert', n: 1 }],
  har_patronus: [{ s: 'flash', n: 1 }, { s: 'patronussilver', n: 3 }],
  har_protego: [{ s: 'protegodome', n: 2 }, { s: 'flash', n: 1 }],
  har_apparate: [{ s: 'apparate', n: 2 }, { s: 'apparate', n: 1, p: { blackOnly: true } }],
  goj_blue: [{ s: 'singularity', n: 2 }, { s: 'invert', n: 1, p: { hue: 180 } }],
  goj_red: [{ s: 'flash', n: 1 }, { s: 'redrepulse', n: 2 }],
  goj_purple: [{ s: 'purplevoid', n: 2 }, { s: 'flash', n: 1 }, { s: 'purplevoid', n: 1 }],
  goj_domain: [{ s: 'black', n: 1 }, { s: 'voidstars', n: 3 }],
  goj_blackflash: [{ s: 'black', n: 1 }, { s: 'blackflash', n: 2 }],
  goj_infinity: [{ s: 'infinityfreeze', n: 3 }],
  clash_hvg: [{ s: 'flash', n: 1 }, { s: 'dualsplit', n: 2, p: { col: '#ffd36a', col2: '#5fd3ff' } }, { s: 'invert', n: 1 }],
});
// banners open: the frame split into a gold (left, Harry) and a cyan (right, Gojo) duotone half behind two sliding banner cloths
IMPACT.bannersplit = (c, g, f, p, k, n) => {
  const u = (k + 1) / Math.max(1, n), sc = OUT.scale, gold = hvTint(c, 'grayscale(1) contrast(1.6)', '#ffc040'), gc = copyComp(gold), cyan = hvTint(c, 'grayscale(1) contrast(1.6)', '#40c8ff');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(gc, 0, 0); g.beginPath(); g.moveTo(c.width * .58, 0); g.lineTo(c.width, 0); g.lineTo(c.width, c.height); g.lineTo(c.width * .42, c.height); g.closePath(); g.clip(); g.drawImage(cyan, 0, 0); g.restore();
  g.save(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(W * .58 - 6, 0); g.lineTo(W * .58 + 6, 0); g.lineTo(W * .42 + 6, H); g.lineTo(W * .42 - 6, H); g.closePath(); g.fill();
  const off = u * W * .5; g.fillStyle = '#7a1820'; g.fillRect(W * .25 - off - 200, 0, 400, H); g.fillStyle = '#141c3a'; g.fillRect(W * .75 + off - 200, 0, 400, H); g.strokeStyle = '#d8a830'; g.lineWidth = 8; g.strokeRect(W * .25 - off - 200, -10, 400, H + 20); g.strokeStyle = '#5fd3ff'; g.strokeRect(W * .75 + off - 200, -10, 400, H + 20); g.restore();
};
Object.assign(IMPACT_SEQ, { BANNER_SPLIT: [{ s: 'bannersplit', n: 1 }, { s: 'flash', n: 1 }, { s: 'bannersplit', n: 1 }], 'UNLIMITED_VOID@V1-W2': IMPACT_SEQ.UNLIMITED_VOID_B });
