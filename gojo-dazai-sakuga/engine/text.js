/* Bleach Showdown engine - text.js : anime-style lettering (attack names, cards, kanji, subtitles).   (rewritten for harry-vs-gojo, pre/text_style.md)
   attackTitle(ctx, lt, o)  o: { text, t0 (local start), dur (hold, default 1.2), style 'shonen' | 'wizard' | 'arena' | 'slam' (legacy),
        kind (colour key: blue red purple black domain infinity sixeyes | spell keys: red protego patronus gold green silver fire), col (override accent),
        pre (small prefix line above, e.g. 'CURSED TECHNIQUE LAPSE:'), sub (kanji line), x, y (anchor), align 'left'|'center'|'right', size (main px), shake }
        - 'shonen' (Gojo): Inter Display Black Italic, white + colour foot gradient, 6 px black + 14 px colour edge, 30 px glow, skew -8 deg, kanji above;
          in 6 frames: white wipe line -> letters slam in one by one (140 % -> 100 %) with RGB glitch -> overexpose frame -> settle; out 5 frames: stretch +
          three slices sliding apart.  Default anchor lower-left.  Size default 170 (auto-shrinks to fit), pre line 70.
        - 'wizard' (Harry): Caladea Bold caps (+8 % spacing), engraved gold gradient, 8 px brown + 4 px wine edge, spell-colour glow, bigger initial, gold
          underline with star sparks + a tiny lightning bolt; in 8 frames: a wand light draws the underline, letters ignite one by one as gold sparks, flash
          in the spell colour; hold: gold motes rise; out 6 frames: letters blow away right as gold dust.  Default anchor lower-right.  '\n' = two lines.
        - 'arena' (announcer): letterbox banner + Caladea Bold white, 8 px black edge, gold glow, letters drop in; o.big = BEGIN! style (240 px red + rings).
   fighterCard(ctx, lt, o)  Record-of-Ragnarok power card: { who: 'harry'|'gojo', t0, dur (2.2), name, title, sub, kanji, round, side 'left' }
        diagonal panel (60 % width) slides in, name + title + sub + icons, watermark; panel splits apart at the end.  Put the hand2d portrait in the scene
        on the free side (right by default).
   vsCard(ctx, lt, o)       { t0, dur, colL, colR }  diagonal lightning border + 'VS' 260 px (use with f.split for the two halves)
   announceCard(ctx, lt, o) = attackTitle style 'arena' centred (TWO WORLDS. ONE ARENA. / ROUND ONE / BEGIN! / WINNER)
   moveTitle(lt, text, o)   -> options with style/kind/kanji looked up from HVG_MOVES (Harry / Gojo move names; unknown -> arena)
   kanjiColumn(ctx, lt, o)  vertical kanji column  { text, x, y, size, col, alpha }
   subtitle(ctx, text, o)   dialogue line: Inter 700 52 px, 8 px black edge, y 960, speaker name 30 px in o.whoCol   { who, a, size, y, italic }
   Fonts on the render machine: Inter / Inter Display (Black, Black Italic), Caladea, FreeSerif, IPAGothic.                                       */
'use strict';
const TXT_FR = 24;
const TXT_COLS = {
  blue: ['#3a7bff', '#bfe6ff'], red: ['#ff2d3a', '#ffd0c8'], purple: ['#9b4dff', '#f3e6ff'], black: ['#ff2d3a', '#000000'], domain: ['#5fd3ff', '#e8fbff'], infinity: ['#9fd2ff', '#eef8ff'],
  sixeyes: ['#5fd3ff', '#c9f3ff'], protego: ['#9fd2ff', '#e8f6ff'], patronus: ['#e8f4ff', '#ffffff'], gold: ['#ffd36a', '#fff4c8'], green: ['#3dff6a', '#e2ffe8'], silver: ['#e8f4ff', '#ffffff'],
  fire: ['#ff8a2a', '#fff0c8'], white: ['#ffffff', '#ffffff'],
};
function titleEnv(lt, t0, dur) { const u = lt - t0; if (u < 0 || u > dur + .35) return null; const inK = clamp(u / .12, 0, 1), out = clamp((u - dur) / .35, 0, 1); return { u, inK, out, slam: u < .12 }; }
function txtLetters(ctx, s, spacing) { const xs = []; let x = 0; for (const ch of s) { xs.push(x); x += ctx.measureText(ch).width + spacing; } return { xs, w: x - spacing }; }
function attackTitle(ctx, lt, o) {
  if (o.style === 'shonen') return shonenTitle(ctx, lt, o);
  if (o.style === 'wizard') return wizardTitle(ctx, lt, o);
  if (o.style === 'arena') return arenaTitle(ctx, lt, o);
  if (o.style === 'comic' || o.style === 'hulk') return comicTitle(ctx, lt, o);
  if (o.style === 'baki' || o.style === 'ogre') return bakiTitle(ctx, lt, o);
  return slamTitle(ctx, lt, o);
}
// ------------------------------------------------------------------------------------------------ legacy slam (1.5x bigger than before)
function slamTitle(ctx, lt, o) {
  const e = titleEnv(lt, o.t0 || 0, o.dur || 1.6); if (!e) return;
  const size = o.size || 144, x = o.x == null ? 110 : o.x, y = o.y == null ? H - 170 : o.y, align = o.align || 'left', skew = o.skew == null ? -.18 : o.skew;
  const words = o.text.toUpperCase();
  ctx.save(); ctx.translate(x, y);
  const sc = e.slam ? lerp(1.9, 1, easeOut(e.inK)) : 1 + .015 * Math.sin(e.u * 7); ctx.scale(sc, sc);
  ctx.transform(1, 0, skew, 1, 0, 0);
  ctx.translate(-e.out * 300 * (align === 'right' ? -1 : 1), 0); ctx.globalAlpha = 1 - e.out;
  ctx.font = `900 ${size}px "Inter Display", "Inter", sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const wTxt = ctx.measureText(words).width, x0 = align === 'left' ? 0 : align === 'center' ? -wTxt / 2 : -wTxt;
  ctx.fillStyle = rgba(o.bar || '#000000', .55); ctx.beginPath(); ctx.moveTo(x0 - 60, -size * .78); ctx.lineTo(x0 + wTxt + 140, -size * .86); ctx.lineTo(x0 + wTxt + 90, size * .2); ctx.lineTo(x0 - 110, size * .26); ctx.closePath(); ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .22; ctx.strokeStyle = o.edge || '#0a0610'; ctx.strokeText(words, 0, 0);
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 30; }
  ctx.lineWidth = size * .09; ctx.strokeStyle = o.inner || '#ffffff'; ctx.strokeText(words, 0, 0); ctx.shadowBlur = 0;
  const gr = ctx.createLinearGradient(0, -size * .75, 0, size * .05); gr.addColorStop(0, o.col || '#ffffff'); gr.addColorStop(.55, o.col || '#ffffff'); gr.addColorStop(.56, o.col2 || '#ffd2e2'); gr.addColorStop(1, o.col2 || '#ff8fb8');
  ctx.fillStyle = gr; ctx.fillText(words, 0, 0);
  if (o.sub) { ctx.font = `900 ${size * .42}px "IPAGothic", sans-serif`; ctx.lineWidth = size * .1; ctx.strokeStyle = o.edge || '#0a0610'; const sy = -size * 1.02; ctx.strokeText(o.sub, align === 'left' ? 8 : 0, sy); ctx.fillStyle = o.subCol || o.col2 || '#ffd2e2'; ctx.fillText(o.sub, align === 'left' ? 8 : 0, sy); }
  ctx.restore();
}
// ------------------------------------------------------------------------------------------------ SHONEN (Gojo)
function shonenTitle(ctx, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 6 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const fi = Math.floor(u * TXT_FR), [acc, core] = o.col ? [o.col, o.col2 || '#ffffff'] : (TXT_COLS[o.kind] || TXT_COLS.blue), black = o.kind === 'black';
  const main = o.text.toUpperCase(), align = o.align || 'left', maxW = o.maxW || (W - 260);
  ctx.save(); let size = o.size || 170; ctx.font = `italic 900 ${size}px "Inter Display", "Inter", sans-serif`; let L = txtLetters(ctx, main, -size * .02);
  if (L.w > maxW) { size *= maxW / L.w; ctx.font = `italic 900 ${size}px "Inter Display", "Inter", sans-serif`; L = txtLetters(ctx, main, -size * .02); }
  const x = o.x == null ? (align === 'right' ? W - 120 : align === 'center' ? W / 2 : 120) : o.x, y = o.y == null ? H - 150 : o.y, x0 = align === 'left' ? 0 : align === 'center' ? -L.w / 2 : -L.w;
  ctx.translate(x, y); if (o.shake) ctx.translate((hash(fi * 3) - .5) * o.shake * 2, (hash(fi * 7) - .5) * o.shake * 2);
  const outK = clamp((u - inT - hold) / outT, 0, 1);
  // frame 0: white wipe line
  if (fi === 0) { const k = clamp(u * TXT_FR, 0, 1); ctx.fillStyle = '#ffffff'; ctx.shadowColor = acc; ctx.shadowBlur = 24; ctx.fillRect(x0 - 40, -size * .3, (L.w + 80) * k, 12); ctx.restore(); return; }
  const skew = o.skew == null ? -.14 : o.skew; ctx.transform(1, 0, skew, 1, 0, 0);
  if (outK > 0) ctx.scale(1 + .15 * outK, 1);
  const n = main.length, stagger = Math.min(.03, (inT * .55) / Math.max(1, n)), drawPass = (fn) => { for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const ui = u - 1 / TXT_FR - i * stagger; if (ui < 0) continue; const s = ui < 2 / TXT_FR ? lerp(1.4, 1, easeOut(ui / (2 / TXT_FR))) : 1; const cx = x0 + L.xs[i]; ctx.save(); ctx.translate(cx, 0); ctx.scale(s, s); fn(ch); ctx.restore(); } };
  const sliceDraw = (fn) => { if (outK <= 0) return fn(); const bands = 3; for (let b = 0; b < bands; b++) { const y0 = -size * .95 + b * size * 1.05 / bands; ctx.save(); ctx.beginPath(); ctx.rect(x0 - 200, y0, L.w + 400, size * 1.05 / bands + 1); ctx.clip(); ctx.translate((b % 2 ? 1 : -1) * outK * 240 * (b + 1) / 2, 0); ctx.globalAlpha = 1 - outK; fn(); ctx.restore(); } };
  // kanji + prefix line
  const extras = () => {
    if (o.sub) { ctx.save(); ctx.font = `900 ${size * .58}px "IPAGothic", sans-serif`; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; const sy = -size * (o.pre ? 1.55 : 1.0), sx = x0 + (o.pre ? 0 : 6); ctx.lineWidth = size * .12; ctx.strokeStyle = '#05060a'; ctx.strokeText(o.sub, sx + (o.pre ? L.w * .0 : 0), sy - (o.pre ? size * .1 : 0)); ctx.fillStyle = o.subCol || '#bfe6ff'; ctx.fillText(o.sub, sx, sy - (o.pre ? size * .1 : 0)); ctx.restore(); }
    if (o.pre) { ctx.save(); const ps = o.preSize || Math.max(52, size * .42); ctx.font = `italic 900 ${ps}px "Inter Display", "Inter", sans-serif`; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; const py = -size * .92; ctx.lineWidth = ps * .28; ctx.strokeStyle = acc; ctx.strokeText(o.pre.toUpperCase(), x0, py); ctx.lineWidth = ps * .12; ctx.strokeStyle = '#05060a'; ctx.strokeText(o.pre.toUpperCase(), x0, py); ctx.fillStyle = '#ffffff'; ctx.fillText(o.pre.toUpperCase(), x0, py); ctx.restore(); }
  };
  const over = fi === 4;   // overexpose frame
  const gr = ctx.createLinearGradient(0, -size * .74, 0, size * .02); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.72, black ? '#ffffff' : '#ffffff'); gr.addColorStop(.75, black ? '#1a1a1a' : core); gr.addColorStop(1, black ? '#000000' : acc);
  sliceDraw(() => {
    if (u > 1 / TXT_FR) extras();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    if (fi >= 1 && fi <= 2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .7; ctx.fillStyle = '#ff2040'; ctx.translate(-8, 0); drawPass(ch => ctx.fillText(ch, 0, 0)); ctx.translate(16, 0); ctx.fillStyle = '#20a0ff'; drawPass(ch => ctx.fillText(ch, 0, 0)); ctx.restore(); }
    ctx.save(); ctx.shadowColor = acc; ctx.shadowBlur = 30; ctx.lineWidth = 40; ctx.strokeStyle = rgba(black ? '#ff2d3a' : acc, .95); drawPass(ch => ctx.strokeText(ch, 0, 0)); ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = black ? '#ffffff' : '#05060a'; drawPass(ch => ctx.strokeText(ch, 0, 0));
    if (black) { ctx.lineWidth = 6; ctx.strokeStyle = '#05060a'; drawPass(ch => ctx.strokeText(ch, 0, 0)); }
    ctx.fillStyle = over ? '#ffffff' : gr; drawPass(ch => ctx.fillText(ch, 0, 0));
    if (over) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 60; ctx.fillStyle = 'rgba(255,255,255,.8)'; drawPass(ch => ctx.fillText(ch, 0, 0)); ctx.restore(); }
  });
  ctx.restore();
}
// ------------------------------------------------------------------------------------------------ WIZARD (Harry)
function wizardTitle(ctx, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 8 / TXT_FR, outT = 6 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const [acc] = o.col ? [o.col] : (TXT_COLS[o.kind] || TXT_COLS.red), lines = o.text.toUpperCase().split('\n'), align = o.align || 'right';
  ctx.save(); const sizes = lines.map((l, i) => lines.length > 1 && i === 0 ? (o.preSize || (o.size || 170) * .58) : (o.size || 170));
  const font = s => `700 ${s}px "Caladea", "FreeSerif", "Liberation Serif", serif`;
  // fit width
  let k = 1; for (let i = 0; i < lines.length; i++) { ctx.font = font(sizes[i]); const w = txtLetters(ctx, lines[i], sizes[i] * .08).w + sizes[i] * .15; if (w * k > W - 240) k = (W - 240) / w; }
  const S = sizes.map(s => s * k), x = o.x == null ? (align === 'right' ? W - 120 : align === 'center' ? W / 2 : 120) : o.x, y = o.y == null ? H - 150 : o.y;
  ctx.translate(x, y);
  const outK = clamp((u - inT - hold) / outT, 0, 1), lineDraw = clamp(u / (3 / TXT_FR), 0, 1), flash = u > 6 / TXT_FR && u < inT + .3 ? 1 - (u - 6 / TXT_FR) / (inT + .3 - 6 / TXT_FR) * .4 : .6;
  // layout per line (bottom line at y=0)
  const L = []; let yy = 0; for (let i = lines.length - 1; i >= 0; i--) { ctx.font = font(S[i]); const lt2 = txtLetters(ctx, lines[i], S[i] * .08), init = S[i] * .15; const w = lt2.w + init; const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w; L[i] = { y: yy, s: S[i], x0, w, xs: lt2.xs.map((v, j) => v + (j > 0 ? init : 0)) }; yy -= S[i] * 1.02; }
  const total = lines.reduce((a, l) => a + l.length, 0), ulW = Math.max(...L.map(l => l.w)), ulX = align === 'left' ? 0 : align === 'center' ? -ulW / 2 : -ulW, ulY = S[S.length - 1] * .2;
  // underline drawn by the wand light, with star sparks + lightning motif
  ctx.save(); ctx.globalAlpha = 1 - outK; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 4; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(ulX, ulY); ctx.lineTo(ulX + ulW * lineDraw, ulY); ctx.stroke(); ctx.shadowBlur = 0;
  if (lineDraw < 1) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, ulX + ulW * lineDraw, ulY, 50, '#fff4c8', 1); glow(ctx, ulX + ulW * lineDraw, ulY, 14, '#ffffff', 1); }
  else { for (const ex of [ulX, ulX + ulW]) { txtStar(ctx, ex, ulY, 16 + 4 * Math.sin(u * 9), '#fff4c8'); } const mx = ulX + ulW / 2; ctx.fillStyle = '#ffd36a'; ctx.strokeStyle = '#2a1606'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx + 4, ulY - 15); ctx.lineTo(mx - 7, ulY + 1); ctx.lineTo(mx + 1, ulY + 1); ctx.lineTo(mx - 4, ulY + 15); ctx.lineTo(mx + 8, ulY - 2); ctx.lineTo(mx, ulY - 2); ctx.closePath(); ctx.stroke(); ctx.fill(); }
  ctx.restore();
  // letters ignite one by one (frames 3..5), then flash (6..7)
  let idx = 0; const igT0 = 3 / TXT_FR, igSpan = 3 / TXT_FR;
  for (let li = 0; li < lines.length; li++) { const Ln = L[li], s = Ln.s; for (let j = 0; j < lines[li].length; j++, idx++) { const ch = lines[li][j]; if (ch === ' ') continue;
    const ti = igT0 + idx / Math.max(1, total) * igSpan, a = clamp((u - ti) / (1.5 / TXT_FR), 0, 1); if (a <= 0) continue;
    const isInit = j === 0, cs = isInit ? s * 1.15 : s, cx = Ln.x0 + Ln.xs[j], dust = clamp(outK * 1.6 - (j / lines[li].length) * .6, 0, 1);
    ctx.save(); ctx.translate(cx + dust * 160, Ln.y - dust * 30); ctx.globalAlpha = a * (1 - dust); ctx.font = font(cs); ctx.textAlign = 'left'; ctx.lineJoin = 'round';
    ctx.save(); ctx.shadowColor = acc; ctx.shadowBlur = 26 * (a < 1 ? 2 : flash / .6); ctx.lineWidth = 24; ctx.strokeStyle = '#7a1717'; ctx.strokeText(ch, 0, 0); ctx.restore();
    ctx.lineWidth = 16; ctx.strokeStyle = '#2a1606'; ctx.strokeText(ch, 0, 0);
    const gr = ctx.createLinearGradient(0, -cs * .72, 0, cs * .02); gr.addColorStop(0, '#fff4c8'); gr.addColorStop(.35, '#ffd36a'); gr.addColorStop(.6, '#b07a1e'); gr.addColorStop(.62, '#e8b44a'); gr.addColorStop(1, '#ffe9a6');
    ctx.fillStyle = gr; ctx.fillText(ch, 0, 0); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,248,220,.75)'; ctx.strokeText(ch, 0, 0);
    if (a < 1 || (u > 6 / TXT_FR && u < inT + .12)) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(a < 1 ? '#fff4c8' : acc, a < 1 ? (1 - a) : .45 * flash); ctx.fillText(ch, 0, 0); }
    ctx.restore();
    if (a < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let p = 0; p < 6; p++) { const an = hash(idx * 7 + p) * TAU, d = (1 - a) * 40 + 10; ctx.fillStyle = 'rgba(255,230,150,.9)'; ctx.fillRect(cx + cs * .3 + Math.cos(an) * d, Ln.y - cs * .4 + Math.sin(an) * d, 3, 3); } ctx.restore(); }
    if (dust > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let p = 0; p < 10; p++) { const r = hash(idx * 13 + p), d = dust * (120 + r * 260); ctx.fillStyle = rgba('#ffd36a', (1 - dust) * .9); ctx.fillRect(cx + cs * .3 + d, Ln.y - cs * .5 + (hash(p * 3 + idx) - .5) * cs - dust * 40 * r, 3, 3); } ctx.restore(); } } }
  // hold: gold motes rising from the text
  if (u > inT && outK < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let p = 0; p < 24; p++) { const ph = ((u - inT) * (.5 + hash(p) * .6) + hash(p * 3)) % 1, px = ulX + hash(p * 5) * ulW, py = ulY - ph * (S[0] * 1.6 + 60); ctx.fillStyle = rgba('#ffe08a', .8 * Math.sin(ph * Math.PI) * (1 - outK)); ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill(); } ctx.restore(); }
  ctx.restore();
}
function txtStar(ctx, x, y, r, col) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = i % 2 ? r * .25 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
// ------------------------------------------------------------------------------------------------ ARENA (announcer)
function arenaTitle(ctx, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.4, u = lt - t0, inT = .25, outT = .25; if (u < 0 || u > inT + hold + outT) return;
  const big = !!o.big, size = o.size || (big ? 240 : 140), text = o.text.toUpperCase(), outK = clamp((u - inT - hold) / outT, 0, 1), bandK = easeOut(clamp(u / (4 / TXT_FR), 0, 1));
  const y = o.y == null ? H / 2 + size * .35 : o.y, x = o.x == null ? W / 2 : o.x;
  ctx.save(); ctx.globalAlpha = 1 - outK;
  if (o.band !== false) { const bh = Math.max(180, size * 1.3); ctx.fillStyle = 'rgba(0,0,0,.58)'; ctx.fillRect(W / 2 - W / 2 * bandK, y - size * .35 - bh / 2, W * bandK, bh); ctx.fillStyle = '#d8a830'; ctx.fillRect(W / 2 - W / 2 * bandK, y - size * .35 - bh / 2, W * bandK, 3); ctx.fillRect(W / 2 - W / 2 * bandK, y - size * .35 + bh / 2 - 3, W * bandK, 3); }
  ctx.font = `700 ${size}px "Caladea", "FreeSerif", serif`; const sp = size * .06, Lx = txtLetters(ctx, text, sp); let s = 1; if (Lx.w > W - 160) s = (W - 160) / Lx.w;
  ctx.translate(x, y); ctx.scale(s, s); const x0 = -Lx.w / 2; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  for (let i = 0; i < text.length; i++) { const ch = text[i]; if (ch === ' ') continue; const ui = u - .05 - i * Math.min(.03, .2 / text.length); if (ui < 0) continue; const k = easeOut(clamp(ui / .12, 0, 1)), dy = (1 - k) * -size * .6;
    ctx.save(); ctx.translate(x0 + Lx.xs[i], dy - outK * 0); ctx.globalAlpha = (1 - outK) * k;
    ctx.save(); ctx.shadowColor = big ? '#ff2a2a' : '#ffc850'; ctx.shadowBlur = 34; ctx.lineWidth = big ? 22 : 16; ctx.strokeStyle = big ? '#ffffff' : '#000000'; ctx.strokeText(ch, 0, 0); ctx.restore();
    if (big) { ctx.lineWidth = 8; ctx.strokeStyle = '#2a0204'; ctx.strokeText(ch, 0, 0); }
    ctx.fillStyle = big ? '#ff2a2a' : '#ffffff'; ctx.fillText(ch, 0, 0); ctx.restore(); }
  if (big && u < inT + .6) { const k = clamp(u / (inT + .6), 0, 1); ctx.strokeStyle = rgba('#ffd36a', 1 - k); ctx.lineWidth = 10 * (1 - k) + 2; for (const R of [1, 1.6]) { ctx.beginPath(); ctx.ellipse(0, -size * .35, (200 + 900 * k) * R, (80 + 360 * k) * R, 0, 0, TAU); ctx.stroke(); } }
  ctx.restore();
}
function announceCard(ctx, lt, o) { return arenaTitle(ctx, lt, o); }
// ------------------------------------------------------------------------------------------------ fighter card (Record of Ragnarok style)
const CARD_STYLE = {
  harry: { bg0: '#3a0b10', bg1: '#060203', frame: '#d8a830', name: 'HARRY POTTER', title: 'THE BOY WHO LIVED', sub: 'WIZARDING WORLD · MASTER OF DEATH', style: 'wizard', kind: 'gold', mark: 'hallows', icons: ['wand', 'elder', 'cloak', 'stone'] },
  gojo: { bg0: '#050b1e', bg1: '#000000', frame: '#5fd3ff', name: 'GOJO SATORU', title: 'THE STRONGEST', sub: 'JUJUTSU HIGH · SPECIAL GRADE · LIMITLESS & SIX EYES', kanji: '五条悟', style: 'shonen', kind: 'blue', mark: '無下限' },
};
function fighterCard(ctx, lt, o) {
  const C = Object.assign({}, CARD_STYLE[o.who] || CARD_STYLE.harry, o), t0 = o.t0 || 0, dur = o.dur || 2.2, u = lt - t0; if (u < 0 || u > dur) return;
  const inK = easeOut(clamp(u / (4 / TXT_FR), 0, 1)), outK = easeIn(clamp((u - (dur - 4 / TXT_FR)) / (4 / TXT_FR), 0, 1)), left = (o.side || 'left') === 'left', PW = W * .6;
  ctx.save(); if (!left) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  const panel = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(PW + 160, 0); ctx.lineTo(PW - 160, H); ctx.lineTo(0, H); ctx.closePath(); };
  for (const half of [0, 1]) { ctx.save(); const dx = (1 - inK) * -(PW + 200) + (half ? 1 : -1) * outK * 0, dy = (half ? 1 : -1) * outK * H * .7; ctx.translate(dx, dy);
    ctx.beginPath(); if (half === 0) ctx.rect(-10, -10, W + 20, H / 2 + 10); else ctx.rect(-10, H / 2, W + 20, H / 2 + 10); ctx.clip();
    panel(); const gr = ctx.createLinearGradient(0, 0, PW, H); gr.addColorStop(0, C.bg0); gr.addColorStop(1, C.bg1); ctx.fillStyle = gr; ctx.globalAlpha = .94; ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); panel(); ctx.clip(); ctx.globalAlpha = .12; ctx.strokeStyle = C.frame; ctx.fillStyle = C.frame; if (C.mark === 'hallows') { const cx = PW * .55, cy = H * .5, R = 330; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx + R * .9, cy + R * .6); ctx.lineTo(cx - R * .9, cy + R * .6); ctx.closePath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R * .6); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + R * .14, R * .45, 0, TAU); ctx.stroke(); }
      else { ctx.save(); ctx.translate(PW * .5, H * .62); if (!left) ctx.scale(-1, 1); ctx.font = '900 300px "IPAGothic", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(C.mark, 0, 0); ctx.restore(); }
      ctx.globalAlpha = .18; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(-100 + i * 90, H); ctx.lineTo(200 + i * 90, 0); ctx.stroke(); } ctx.restore();
    panel(); ctx.lineWidth = 6; ctx.strokeStyle = C.frame; ctx.stroke(); ctx.restore(); }
  if (outK > .02) { ctx.restore(); return; }
  if (!left) { ctx.restore(); ctx.save(); }
  const tx = left ? 110 : W - 110, al = left ? 'left' : 'right', nk = u - 4 / TXT_FR;
  if (o.round || C.round) arenaTitle(ctx, lt, { t0: t0 + .1, dur: dur - .6, text: o.round || C.round, size: 56, x: left ? PW - 40 : W - PW + 40, y: 110, band: false });
  if (C.kanji && nk > 0) { ctx.save(); ctx.font = '900 90px "IPAGothic", sans-serif'; ctx.textAlign = al; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000'; ctx.globalAlpha = clamp(nk / .15, 0, 1); ctx.strokeText(C.kanji, tx, H * .36); ctx.fillStyle = '#bfe6ff'; ctx.fillText(C.kanji, tx, H * .36); ctx.restore(); }
  if (nk > 0) attackTitle(ctx, lt, { style: C.style, kind: C.kind, text: C.name, t0: t0 + 4 / TXT_FR, dur: dur - 4 / TXT_FR - .45, size: 170, x: tx, y: H * .54, align: al, maxW: PW - 60 });
  const tk = clamp((u - .45) / .2, 0, 1); if (tk > 0) { ctx.save(); ctx.globalAlpha = tk; ctx.textAlign = al; ctx.font = '800 64px "Inter", sans-serif'; ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = '#000'; const ttl = C.title.split('').join(String.fromCharCode(8202)); ctx.strokeText(ttl, tx, H * .54 + 100); ctx.fillStyle = '#ffffff'; ctx.fillText(ttl, tx, H * .54 + 100);
    ctx.fillStyle = C.frame; ctx.fillRect(left ? tx : tx - 360, H * .54 + 130, 360 * tk, 5); ctx.font = '700 44px "Inter", sans-serif'; ctx.lineWidth = 6; ctx.strokeText(C.sub, tx, H * .54 + 196); ctx.fillStyle = mixHex(C.frame, '#ffffff', .5); ctx.fillText(C.sub, tx, H * .54 + 196);
    if (C.icons) C.icons.forEach((ic, i) => cardIcon(ctx, ic, (left ? tx + 40 : tx - 40) + (left ? 1 : -1) * i * 110, H * .54 + 290, C.frame, clamp((u - .6 - i * .08) / .15, 0, 1)));
    ctx.restore(); }
  ctx.restore();
}
function cardIcon(ctx, kind, x, y, col, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.globalAlpha = a * .3; ctx.fill(); ctx.globalAlpha = a; ctx.stroke();
  ctx.strokeStyle = '#fff4d8'; ctx.lineWidth = 6; ctx.beginPath();
  if (kind === 'wand') { ctx.moveTo(-24, 24); ctx.lineTo(24, -24); } else if (kind === 'elder') { ctx.moveTo(-24, 24); ctx.lineTo(24, -24); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-16 + i * 11, 16 - i * 11, 4, 0, TAU); ctx.stroke(); } ctx.beginPath(); }
  else if (kind === 'cloak') { ctx.moveTo(-18, -22); ctx.quadraticCurveTo(0, -30, 18, -22); ctx.lineTo(26, 24); ctx.quadraticCurveTo(0, 14, -26, 24); ctx.closePath(); }
  else { ctx.moveTo(0, -26); ctx.lineTo(24, 18); ctx.lineTo(-24, 18); ctx.closePath(); ctx.moveTo(0, -26); ctx.lineTo(0, 18); ctx.moveTo(10, 4); ctx.arc(0, 4, 10, 0, TAU); }
  ctx.stroke(); ctx.restore();
}
function vsCard(ctx, lt, o = {}) {
  const t0 = o.t0 || 0, dur = o.dur || .8, u = lt - t0; if (u < 0 || u > dur) return; const k = easeOut(clamp(u / .12, 0, 1)), fr = Math.floor(u * TXT_FR);
  ctx.save(); const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10; pts.push([W * .5 + (s - .5) * W * .28 + (i % 2 ? 24 : -24) * (hash(i + fr) + .5), H * s]); }
  ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'miter'; polyPath(ctx, pts, false); ctx.strokeStyle = rgba('#ffffff', .9 * k); ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = rgba(o.colL || '#ffd36a', .6); ctx.lineWidth = 30; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over'; arenaTitle(ctx, lt, { t0, dur: dur - .2, text: 'VS', size: 260, band: false, y: H / 2 + 90 });
  ctx.restore();
}
// ------------------------------------------------------------------------------------------------ move table -> title options
const HVG_MOVES = {
  'INFINITY': { style: 'shonen', kind: 'infinity', sub: '無下限' }, 'SIX EYES': { style: 'shonen', kind: 'sixeyes', sub: '六眼' },
  'BLUE': { style: 'shonen', kind: 'blue', sub: '蒼', pre: 'CURSED TECHNIQUE LAPSE:' }, 'RED': { style: 'shonen', kind: 'red', sub: '赫', pre: 'REVERSAL:' },
  'HOLLOW PURPLE': { style: 'shonen', kind: 'purple', sub: '茈' }, 'UNLIMITED VOID': { style: 'shonen', kind: 'domain', sub: '無量空処', pre: 'DOMAIN EXPANSION:' },
  'DOMAIN EXPANSION': { style: 'shonen', kind: 'domain', sub: '領域展開' }, 'BLACK FLASH': { style: 'shonen', kind: 'black', sub: '黒閃' }, 'TELEPORT': { style: 'shonen', kind: 'blue' }, 'RCT': { style: 'shonen', kind: 'sixeyes', sub: '反転術式' },
  'REVERSE CURSED TECHNIQUE': { style: 'shonen', kind: 'sixeyes', sub: '反転術式' },
  'EXPELLIARMUS': { style: 'wizard', kind: 'red' }, 'STUPEFY': { style: 'wizard', kind: 'red' }, 'PROTEGO': { style: 'wizard', kind: 'protego' }, 'SECTUMSEMPRA': { style: 'wizard', kind: 'silver' },
  'ACCIO': { style: 'wizard', kind: 'gold' }, 'WINGARDIUM LEVIOSA': { style: 'wizard', kind: 'gold' }, 'BOMBARDA MAXIMA': { style: 'wizard', kind: 'fire' }, 'BOMBARDA': { style: 'wizard', kind: 'fire' },
  'APPARITION': { style: 'wizard', kind: 'gold' }, 'EXPECTO PATRONUM': { style: 'wizard', kind: 'patronus', split: true }, 'INVISIBILITY CLOAK': { style: 'wizard', kind: 'silver' },
  'RESURRECTION STONE': { style: 'wizard', kind: 'gold' }, 'ELDER WAND': { style: 'wizard', kind: 'gold' }, 'PORTKEY': { style: 'wizard', kind: 'protego' }, 'AVADA KEDAVRA': { style: 'wizard', kind: 'green' },
  'CONFRINGO': { style: 'wizard', kind: 'fire' }, 'INCENDIO': { style: 'wizard', kind: 'fire' }, 'REPARO': { style: 'wizard', kind: 'gold' }, 'LUMOS': { style: 'wizard', kind: 'silver' },
};
function moveTitle(lt, text, o = {}) {
  { const r0 = String(text || '').toUpperCase().trim(), k0 = r0.replace(/[!.]+$/, '').trim(), HM = (typeof HY_MOVES !== 'undefined') ? (HY_MOVES[k0] || HY_MOVES[r0]) : null;
    if (HM) return Object.assign({}, HM, { text: HM.text || r0 }, o);
    if (o.who === 'hulk' || o.who === 'HLK') return Object.assign({ style: 'comic', text: r0 }, o); if (o.who === 'yujiro' || o.who === 'YUJ') return Object.assign({ style: 'baki', text: r0 }, o); }
  const raw = String(text || '').toUpperCase().trim(), key = raw.replace(/[!.]+$/, '').replace(/^CURSED TECHNIQUE LAPSE:\s*/, '').replace(/^REVERSAL:\s*/, '').replace(/^DOMAIN EXPANSION:\s*/, (m) => raw.includes('UNLIMITED') ? '' : m).trim();
  const M = HVG_MOVES[key] || HVG_MOVES[raw] || null; let base;
  if (M) { base = Object.assign({}, M, { text: M.pre ? key : raw }); if (M.split && raw.includes(' ')) { const w = raw.split(' '); base.text = w[0] + '\n' + w.slice(1).join(' '); } }
  else base = { style: 'arena', text: raw };
  return Object.assign(base, o);
}
// ------------------------------------------------------------------------------------------------ kanji column + subtitles
function kanjiColumn(ctx, lt, o) {
  const size = o.size || 180, a = o.alpha == null ? .9 : o.alpha; ctx.save(); ctx.globalAlpha = a; ctx.font = `900 ${size}px "IPAGothic", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [...o.text].forEach((ch, i) => { const y = (o.y || 140) + i * size * 1.02 + (o.drift || 0) * lt; ctx.lineWidth = size * .08; ctx.strokeStyle = o.edge || '#000'; ctx.strokeText(ch, o.x || W - 160, y); ctx.fillStyle = o.col || '#ffffff'; ctx.fillText(ch, o.x || W - 160, y); });
  ctx.restore();
}
function subtitle(ctx, text, o = {}) {
  const size = o.size || 52; ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; ctx.font = `${o.italic ? 'italic ' : ''}700 ${size}px "Inter", sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.fillStyle = '#ffffff';
  const y = o.y || 960; ctx.strokeText(text, W / 2, y); ctx.fillText(text, W / 2, y);
  if (o.who) { ctx.font = `800 ${o.whoSize || 30}px "Inter", sans-serif`; ctx.lineWidth = 6; ctx.fillStyle = o.whoCol || '#ffd2e2'; ctx.strokeText(o.who.toUpperCase(), W / 2, y - size * 1.0); ctx.fillText(o.who.toUpperCase(), W / 2, y - size * 1.0); }
  ctx.restore();
}
// aliases requested by pre/impact_requests.md
const spellTitle = (g, lt, o) => attackTitle(g, lt, o.style ? o : moveTitle(lt, o.text, o));
const powerCard = fighterCard;

// ================================================================================================ HULK vs YUJIRO lettering (pre/text_style.md)
/* COMIC (Hulk, alias 'hulk'): Bangers, comic-book sound-effect lettering: huge (default 250 px), tilted, gradient fill (kind 'green' | 'purple' | 'gamma'),
     3D extrusion, 10 % black outline + coloured outer rim, halftone starburst behind, big '!' ; letters punch in one at a time (1 frame each, 220 % -> 100 % with
     overshoot), hold with a 2-px tremble, out: whole word pops (scale up 25 %, fades) in 4 frames.  o = {text, t0, dur, kind, x, y, align, size, rot, burst:false}
   BAKI (Yujiro, alias 'ogre'): raw sumi-ink manga lettering: giant brush kanji (Yuji Boku, default 300 px, black ink with dry-brush edge + red rim) + English
     line (Dela Gothic One, white, black + crimson outline); entrance 'crush': a black brush smear swipes in (2 frames), the kanji slams down squashed (frame 2-4)
     and cracks the frame (white crack lines + ink splatter), the English letters crash in left-to-right; out: the ink dries away in streaks.
     o = {text, sub (kanji), t0, dur, x, y, align, size, vertical (kanji column at the side), red}                                                  */
const COMIC_COLS = { green: ['#c8ff3a', '#4fc72a', '#1f6e14'], gamma: ['#f4ffd0', '#9cff4a', '#2aa020'], purple: ['#f2c8ff', '#b05cff', '#4a1a86'], yellow: ['#fff7a0', '#ffd23a', '#d0700a'] };
function comicBurst(ctx, cx, cy, rx, ry, k, col, dot, seed) {
  const n = 18, pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? .62 + .1 * hash(seed + i) : 1 + .18 * hash(seed + i * 3); pts.push([cx + Math.cos(a) * rx * r * k, cy + Math.sin(a) * ry * r * k]); }
  ctx.save(); polyPath(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#0a0a0a'; ctx.stroke(); ctx.clip();
  ctx.fillStyle = dot; const step = 22; for (let y = cy - ry * 1.3; y < cy + ry * 1.3; y += step) for (let x = cx - rx * 1.3; x < cx + rx * 1.3; x += step) { const d = Math.hypot((x - cx) / rx, (y - cy) / ry), r = step * .42 * clamp(d * 1.1 - .15, 0, 1); if (r > .5) { ctx.beginPath(); ctx.arc(x + ((y / step) % 2) * step * .5, y, r, 0, TAU); ctx.fill(); } }
  ctx.restore();
}
function comicTitle(ctx, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.3, u = lt - t0, outT = 4 / TXT_FR; const main = String(o.text || '').toUpperCase(), n = main.length, per = 1 / TXT_FR, inT = per * (n + 2);
  if (u < 0 || u > inT + hold + outT) return; const fi = Math.floor(u * TXT_FR), cols = COMIC_COLS[o.kind || 'green'] || COMIC_COLS.green;
  ctx.save(); let size = o.size || 250; const font = s => `${s}px "Bangers", "Inter Display", sans-serif`; ctx.font = font(size); let L = txtLetters(ctx, main, size * .07); const maxW = o.maxW || W - 240;
  if (L.w > maxW) { size *= maxW / L.w; ctx.font = font(size); L = txtLetters(ctx, main, size * .07); }
  const align = o.align || 'center', x = o.x == null ? (align === 'left' ? 120 : align === 'right' ? W - 120 : W / 2) : o.x, y = o.y == null ? H * .72 : o.y, x0 = align === 'left' ? 0 : align === 'right' ? -L.w : -L.w / 2;
  const outK = clamp((u - inT - hold) / outT, 0, 1); ctx.translate(x, y); ctx.rotate(o.rot == null ? -.12 : o.rot); if (u > inT && outK === 0) ctx.translate((hash(fi * 5) - .5) * 4, (hash(fi * 9) - .5) * 4);
  if (outK > 0) { ctx.globalAlpha = 1 - outK * .9; }   // out: letters fly apart spinning (below)
  const flash = fi === n + 1;
  if (o.burst !== false) { const bk = clamp(u / per, 0, 1) * 1.2 - clamp((u - per) / per, 0, 1) * .2 - outK * .9; comicBurst(ctx, x0 + L.w / 2, -size * .32, L.w * .62 + size * .5, size * .95, Math.max(0, bk), o.burstCol || '#ffe14a', o.dotCol || 'rgba(230,40,40,.4)', 7); }
  ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const gr = ctx.createLinearGradient(0, -size * .78, 0, size * .05); gr.addColorStop(0, cols[0]); gr.addColorStop(.5, cols[1]); gr.addColorStop(1, cols[2]);
  for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const ui = u - (i + 1) * per; if (ui < 0) continue; const s = ui < per ? 2.2 : ui < 2 * per ? .88 : ui < 3 * per ? 1.06 : 1;
    const big = (ch === '!' ? 1.18 : 1) * (1 + (hash(i * 5) - .5) * .12) * (flash ? 1.15 : 1) * (u > inT && outK === 0 ? 1 + .02 * Math.sin(u * 6 + i) : 1), cx = x0 + L.xs[i] + ctx.measureText(ch).width / 2, wob = (hash(i * 3) - .5) * .21, wave = Math.sin(i * 1.3) * size * .05;
    const fly = outK > 0 ? [Math.cos(i * 2.1) * outK * 500, -Math.abs(Math.sin(i * 1.7)) * outK * 300] : [0, 0], spin = outK * (i % 2 ? 2.5 : -2.5);
    const dirIn = ui < per ? [(hash(i * 7) - .5) * size * 1.2, (hash(i * 11) - .5) * size * .8] : [0, 0];
    ctx.save(); ctx.translate(cx + fly[0] + dirIn[0], -size * .3 + wave + fly[1] + dirIn[1]); ctx.rotate(wob + spin); ctx.scale(s * big, s * big); ctx.translate(0, size * .3); ctx.textAlign = 'center';
    for (let d = 18; d > 0; d -= 3) { ctx.fillStyle = '#2a0f45'; ctx.fillText(ch, d * .8, d); }        // 3D drop (right-down)
    ctx.lineWidth = size * .15; ctx.strokeStyle = '#0a0a0a'; ctx.strokeText(ch, 0, 0);
    ctx.lineWidth = size * .075; ctx.strokeStyle = o.rim || (o.kind === 'purple' ? '#1f6e14' : '#5b2a86'); ctx.strokeText(ch, 0, 0); ctx.fillStyle = flash ? '#ffffff' : gr; ctx.fillText(ch, 0, 0);
    ctx.save(); ctx.clip(); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = font(size); ctx.save(); ctx.beginPath(); ctx.rect(-size, -size * .78, size * 2, size * .18); ctx.clip(); ctx.fillText(ch, 0, 0); ctx.restore();
    ctx.restore(); }
  ctx.restore();
}
function bakiInk(ctx, txt, x, y, size, col, seed, rough = 1) { // dry-brush text: jittered passes + speckle knock-out
  for (let i = 0; i < 4; i++) { ctx.fillStyle = col; ctx.fillText(txt, x + (hash(seed + i) - .5) * size * .03 * rough, y + (hash(seed + i * 3) - .5) * size * .03 * rough); }
}
function bakiTitle(ctx, lt, o) {   // OGRE (text_style.md 2): vertical kanji column at the frame edge + English beside it, ragged ink, wet red stroke, drips
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 6 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const fi = Math.floor(u * TXT_FR), outK = clamp((u - inT - hold) / outT, 0, 1), main = String(o.text || '').toUpperCase(), kan = [...(o.sub || '')], red = o.red || '#c4122a';
  const side = o.align === 'right' ? 'right' : 'left', ks = o.size || Math.min(210, (H - 260) / Math.max(1, kan.length)), kfont = `${ks}px "Dela Gothic One", "IPAGothic", sans-serif`;
  ctx.save(); let es = o.enSize || 140; ctx.font = `${es}px "Dela Gothic One", "Inter Display", sans-serif`; let L = txtLetters(ctx, main, es * .01); const maxW = (o.maxW || W * .62); if (L.w > maxW) { es *= maxW / L.w; ctx.font = `${es}px "Dela Gothic One", sans-serif`; L = txtLetters(ctx, main, es * .01); }
  const colH = kan.length * ks * 1.0, colX = o.x != null ? o.x : (side === 'left' ? 70 + ks / 2 : W - 70 - ks / 2), top = o.y != null ? o.y - colH : Math.max(60, H * .5 - colH / 2 - 40);
  const enX = side === 'left' ? colX + ks * .62 : colX - ks * .62 - L.w, enY = kan.length ? top + colH * .62 : (o.y || H - 150);
  if (u < inT && fi < 2) { ctx.save(); ctx.globalAlpha = .7; ctx.fillStyle = '#efe6d2'; ctx.fillRect(side === 'left' ? 0 : W * .4, top - 60, W * .6, colH + 120); ctx.strokeStyle = 'rgba(20,10,10,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 40; i++) { const a = hash(i * 3) * TAU; ctx.beginPath(); ctx.moveTo(colX + Math.cos(a) * 120, top + colH / 2 + Math.sin(a) * 120); ctx.lineTo(colX + Math.cos(a) * 1400, top + colH / 2 + Math.sin(a) * 1400); ctx.stroke(); } ctx.restore(); }
  if (outK > 0) { ctx.beginPath(); for (let i = 0; i < 18; i++) { const yy = top - 80 + i * (colH + 300) / 18, w = 2400 * (1 - clamp(outK * 1.7 - hash(i * 5) * .7, 0, 1)); ctx.rect(side === 'left' ? -100 : W - w + 100, yy, w, (colH + 300) / 18 * .82); } ctx.clip(); ctx.filter = `grayscale(${outK})`; }
  // frame 0: ink splat at the column centre
  const cy = top + colH / 2; if (fi >= 0) { ctx.save(); ctx.fillStyle = '#0b0b0b'; const k0 = Math.min(1, (u + .01) * TXT_FR); for (let i = 0; i < 14; i++) { const a = hash(i * 13) * TAU, d = ks * (.6 + 1.1 * hash(i * 5)) * k0, r = 6 + 18 * hash(i * 3); ctx.beginPath(); ctx.arc(colX + Math.cos(a) * d * .7, cy + Math.sin(a) * d, r, 0, TAU); ctx.fill(); } ctx.globalAlpha = .9; polyPath(ctx, hyJagT(colX, cy, ks * .3 * k0, ks * .55 * k0, 9, 5)); ctx.fill(); ctx.restore(); }
  // frame 3+: wet red diagonal brush stroke behind the column
  if (fi >= 3 && kan.length) { const rk = clamp((u - 3 / TXT_FR) / (1 / TXT_FR), 0, 1); ctx.save(); ctx.translate(colX, cy); ctx.rotate(.22 * (side === 'left' ? 1 : -1)); ctx.fillStyle = rgba(red, .92); const hh = colH * 1.05 * rk;
    for (let b = 0; b < 22; b++) { const x = -ks * .62 + b * ks * 1.24 / 22, len = hh * (.82 + .18 * hash(b * 3)); ctx.fillRect(x, -hh / 2 + (hash(b * 7) - .5) * 30, ks * 1.24 / 22 + 1, len); } ctx.restore(); }
  // frames 1-2: kanji paint top -> bottom (stroke reveal); ragged dry-brush edge
  if (kan.length && fi >= 1) { const rv = clamp((u - 1 / TXT_FR) / (2 / TXT_FR), 0, 1); ctx.save(); ctx.beginPath(); ctx.rect(colX - ks, top - ks * .3, ks * 2, (colH + ks * .4) * rv); ctx.clip();
    ctx.font = kfont; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    kan.forEach((ch, i) => { const y = top + i * ks; ctx.lineWidth = ks * .07; ctx.strokeStyle = '#f4efe6'; ctx.strokeText(ch, colX, y); bakiInk(ctx, ch, colX, y, ks, '#0b0b0b', 31 + i, .5);
      ctx.fillStyle = '#0b0b0b'; for (let k = 0; k < 2; k++) { const a = hash(i * 9 + k) * TAU, d = ks * (.5 + .2 * hash(k + i)); ctx.beginPath(); ctx.arc(colX + Math.cos(a) * d * .95, y + ks * .5 + Math.sin(a) * d * .9, 3 + 4 * hash(k * 3 + i), 0, TAU); ctx.fill(); } });
    ctx.restore(); }
  // ink drips running below the text during the hold
  if (u > inT) { const dk = clamp((u - inT) / .5, 0, 1); ctx.save(); ctx.fillStyle = '#0b0b0b'; for (let i = 0; i < 3; i++) { const x = (kan.length ? colX : enX + L.w * (.2 + .3 * i)) + (i - 1) * ks * .25, y0 = kan.length ? top + colH - ks * .1 : enY + es * .2, len = (40 + 60 * hash(i * 7)) * dk; ctx.fillRect(x - 3, y0, 6, len); ctx.beginPath(); ctx.arc(x, y0 + len, 7, 0, TAU); ctx.fill(); } ctx.restore(); }
  // frames 4-5: English slams in 130 % -> 100 %, white + 6 px black edge
  if (fi >= 4 || !kan.length) { const sc = fi === 4 ? 1.3 : 1; ctx.save(); ctx.translate(enX + L.w / 2, enY); ctx.scale(sc, sc); ctx.translate(-L.w / 2, 0); ctx.font = `${es}px "Dela Gothic One", "Inter Display", sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = es * .16 + 6; ctx.strokeStyle = '#0b0b0b'; ctx.strokeText(main, 0, 0); ctx.lineWidth = 3; ctx.strokeStyle = rgba(red, .9); ctx.strokeText(main, 0, 0); ctx.fillStyle = '#f4efe6'; ctx.fillText(main, 0, 0); ctx.restore(); }
  ctx.restore();
}
function hyJagT(cx, cy, r0, r1, n, seed) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? r0 * (.8 + .4 * hash(seed + i)) : r1 * (.6 + .6 * hash(seed + i * 3)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; }
// move names (powers.md): Hulk = COMIC, Yujiro = BAKI (kanji + English)
const HY_MOVES = {
  'SMASH': { style: 'comic', kind: 'green', text: 'SMASH!' }, 'SMASH!!': { style: 'comic', kind: 'green', text: 'SMASH!!' }, 'HULK SMASH': { style: 'comic', kind: 'green', text: 'HULK SMASH!' }, 'THUNDERCLAP': { style: 'comic', kind: 'purple', text: 'THUNDERCLAP!' },
  'GAMMA CRASH': { style: 'comic', kind: 'gamma', text: 'GAMMA CRASH!' }, 'RAAAGH': { style: 'comic', kind: 'gamma', text: 'RAAAGH!', burst: true }, 'RAAAAGH': { style: 'comic', kind: 'gamma', text: 'RAAAAGH!' },
  'OGRE FIST': { style: 'baki', sub: '鬼拳', text: 'OGRE FIST' }, 'AXE KICK': { style: 'baki', sub: '踵落とし', text: 'AXE KICK' }, 'BACKHAND': { style: 'baki', sub: '裏拳', text: 'BACKHAND' },
  'HAND POCKET': { style: 'baki', sub: 'ハンドポケット', text: 'HAND POCKET' }, 'THUNDERCLAP (OGRE)': { style: 'baki', sub: '雷拍', text: 'THUNDERCLAP' }, 'DRESS': { style: 'baki', sub: 'ドレス', text: 'DRESS' }, 'DEMON BACK': { style: 'baki', sub: '鬼の貌', text: 'DEMON BACK' }, 'ONI NO SE': { style: 'baki', sub: '鬼の貌', text: 'DEMON BACK' },
};
const hulkTitle = (g, lt, o) => comicTitle(g, lt, o), ogreTitle = (g, lt, o) => bakiTitle(g, lt, o);
