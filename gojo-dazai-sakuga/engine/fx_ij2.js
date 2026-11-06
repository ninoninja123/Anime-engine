/* engine/fx_ij2.js (agent E, itachi-vs-julius) - ATTACK-NAME LETTERING + fighter cards (main word ~180 px @1080, nothing under 44 px)
   attackTitle(g, lt, {style, text, kind, pre, sub, t0, dur, x, y, align, size, side})   (text.js dispatcher extended)
     style 'uchiha' = ITACHI: Shippori Mincho B1 ExtraBold; letters BLACK with a blood-red 10 px edge over an 18 px black edge, thin pale-red inner line, red glow;
                      crimson sumi brush stroke behind, kanji column (Yuji Syuku, white + red edge) at the frame edge, Mangekyo icon after the last letter.
                      IN 6 fr: brush wipes (2) -> letters condense 118 % -> 100 % from blurred red ghosts (3) -> red flash (1).  HOLD: drifting embers.
                      OUT 5 fr: letters scatter as black feathers left -> right.  kind: red (default) | amaterasu (black-violet edge) | tsukuyomi (white fill, red sky edge) | susanoo (orange-red edge) | fire
                      Default lower-left.
     style 'chrono' = JULIUS: Cinzel Black; gold gradient #fff7d6 -> #f6d36a -> #c8901a -> #8a5a08, 14 px navy edge + blue glow, rotating clock ring behind the
                      first letter, gold rule with diamond ends + Roman numeral ticks under the word, gold sparks.
                      IN 6 fr: a clock hand sweeps (2) -> letters tick in one by one 130 % -> 100 % with a gold flash (3) -> shimmer (1).  HOLD: shimmer band.
                      OUT 5 fr: letters rewind right -> left with ghost trails.  kind: time (default) | mana (cyan) | crest (white-gold) | stasis (ice blue)
                      Default lower-right.  sub = small Japanese label line (時間魔法).
   IJ_MOVES[name] -> options;  ijMoveTitle(lt, text, {who}) -> options (unknown names: 'X: Y' -> pre + main).
   fighterCard(g, lt, {who:'itachi'|'julius', side, t0, dur, title, sub}) uses CARD_STYLE.itachi / .julius (vertical kanji うちはイタチ / 魔法帝).            */
'use strict';
const IJT = {
  uchiha: { red: ['#0a0002', '#d81e26', '#ff8a80', '#ff2a1a'], amaterasu: ['#050205', '#7a1a5a', '#d08aff', '#a01a6a'], tsukuyomi: ['#fff4f0', '#c0101a', '#ffffff', '#ff2a1a'], susanoo: ['#0a0002', '#ff5a2a', '#ffd0b0', '#ff6a3a'], fire: ['#1a0400', '#ff7a1a', '#fff0a0', '#ff8a1a'] },
  chrono: { time: ['#fff7d6', '#f6d36a', '#c8901a', '#8a5a08', '#0c1430', '#3a7ae8'], mana: ['#f0fbff', '#9ae0ff', '#3a9ad8', '#1a4a8a', '#06122a', '#5ad0ff'], crest: ['#ffffff', '#fff2c0', '#e8c060', '#9a7020', '#1a1430', '#ffe08a'], stasis: ['#ffffff', '#cfefff', '#7ac0f0', '#2a6aa8', '#06142a', '#8ad8ff'] },
};
const IJ_UFONT = s => `800 ${s}px "Shippori Mincho B1", "Shippori Mincho B1 ExtraBold", "Caladea", serif`, IJ_CFONT = s => `900 ${s}px "Cinzel", "Cinzel Black", "Caladea", serif`;
const IJ_MOVES = {
  'GENJUTSU: SHARINGAN': { style: 'uchiha', kind: 'red', pre: 'GENJUTSU:', text: 'SHARINGAN', sub: '写輪眼' }, 'KATON: GŌKAKYŪ NO JUTSU': { style: 'uchiha', kind: 'fire', pre: 'KATON:', text: 'GŌKAKYŪ NO JUTSU', sub: '火遁・豪火球の術' },
  'KATON: HŌSENKA NO JUTSU': { style: 'uchiha', kind: 'fire', pre: 'KATON:', text: 'HŌSENKA NO JUTSU', sub: '火遁・鳳仙火の術' }, 'TIME MAGIC: ACCELERATION': { style: 'chrono', kind: 'time', pre: 'TIME MAGIC:', text: 'ACCELERATION' },
  'TIME MAGIC: CHRONO STASIS': { style: 'chrono', kind: 'stasis', pre: 'TIME MAGIC:', text: 'CHRONO STASIS' }, 'MANGEKYŌ SHARINGAN': { style: 'uchiha', kind: 'red', sub: '万華鏡写輪眼' },
  'AMATERASU': { style: 'uchiha', kind: 'amaterasu', sub: '天照' }, 'TSUKUYOMI': { style: 'uchiha', kind: 'tsukuyomi', sub: '月読' }, 'SUSANOO': { style: 'uchiha', kind: 'susanoo', sub: '須佐能乎' },
  'TOTSUKA BLADE': { style: 'uchiha', kind: 'susanoo', pre: 'SUSANOO:', sub: '十拳剣' }, 'TOTSUKA NO TSURUGI': { style: 'uchiha', kind: 'susanoo', sub: '十拳剣' }, 'YATA MIRROR': { style: 'uchiha', kind: 'susanoo', pre: 'SUSANOO:', sub: '八咫鏡' },
  'IZANAMI': { style: 'uchiha', kind: 'red', sub: 'イザナミ' }, 'IZANAGI': { style: 'uchiha', kind: 'red', sub: '伊邪那岐' }, 'SHARINGAN': { style: 'uchiha', kind: 'red', sub: '写輪眼' },
  'MANGEKYO SHARINGAN': { style: 'uchiha', kind: 'red', sub: '万華鏡写輪眼' }, 'MANGEKYŌ SHARINGAN': { style: 'uchiha', kind: 'red', sub: '万華鏡写輪眼' }, 'CROW CLONE': { style: 'uchiha', kind: 'red', sub: '烏分身' },
  'GENJUTSU': { style: 'uchiha', kind: 'red', sub: '幻術' }, 'KOTOAMATSUKAMI': { style: 'uchiha', kind: 'red', sub: '別天神' }, 'SHURIKENJUTSU': { style: 'uchiha', kind: 'red', sub: '手裏剣術' },
  'GREAT FIREBALL': { style: 'uchiha', kind: 'fire', pre: 'FIRE STYLE:', sub: '火遁・豪火球の術' }, 'FIRE STYLE: GREAT FIREBALL': { style: 'uchiha', kind: 'fire', pre: 'FIRE STYLE:', text: 'GREAT FIREBALL', sub: '火遁・豪火球の術' },
  'KATON: GOUKAKYUU NO JUTSU': { style: 'uchiha', kind: 'fire', pre: 'KATON:', text: 'GŌKAKYŪ NO JUTSU', sub: '火遁・豪火球の術' }, 'PHOENIX FLOWER JUTSU': { style: 'uchiha', kind: 'fire', pre: 'FIRE STYLE:', text: 'PHOENIX FLOWER', sub: '鳳仙火の術' },
  'TIME MAGIC': { style: 'chrono', kind: 'time', sub: '時間魔法' }, 'CHRONO STASIS': { style: 'chrono', kind: 'stasis', pre: 'TIME MAGIC:' },
  'CHRONO STASIS: GRIGORA': { style: 'chrono', kind: 'stasis', pre: 'CHRONO STASIS:', text: 'GRIGORA', sub: '時間魔法 クロノスタシス・グリゴラ' }, 'CHRONO ANASTASIS': { style: 'chrono', kind: 'rewind' },
  'TIME HALT': { style: 'chrono', kind: 'stasis', pre: 'TIME MAGIC:', sub: '時間魔法' }, 'TIME STOP': { style: 'chrono', kind: 'stasis', pre: 'TIME MAGIC:', sub: '時間魔法' }, 'TIME STEAL': { style: 'chrono', kind: 'time', pre: 'TIME MAGIC:', sub: '時間魔法' },
  'TIME RECOVERY': { style: 'chrono', kind: 'time', pre: 'TIME MAGIC:', sub: '時間魔法' }, 'MANA ZONE': { style: 'chrono', kind: 'time' }, 'MANA METHOD': { style: 'chrono', kind: 'mana', sub: 'マナメソッド' },
  'WIZARD KING': { style: 'chrono', kind: 'crest', sub: '魔法帝' }, 'CHRONO STASIS: TIME HALT': { style: 'chrono', kind: 'stasis', pre: 'CHRONO STASIS:', text: 'TIME HALT', sub: '時間魔法' },
};
function ijMoveTitle(lt, text, o = {}) { const raw = String(text || '').trim(), key = raw.toUpperCase().replace(/[!.]+$/g, '').replace(/\s+/g, ' ').trim(), m = IJ_MOVES[key];
  if (m) return Object.assign({ text: m.text || key }, m); const ci = raw.indexOf(':'), two = ci > 0 && ci < raw.length - 2 ? { pre: raw.slice(0, ci + 1).toUpperCase(), text: raw.slice(ci + 1).trim().toUpperCase() } : { text: raw.toUpperCase() };
  const sub = two.text && IJ_MOVES[two.text] ? IJ_MOVES[two.text].sub : undefined; return Object.assign({ style: o.who === 'julius' ? 'chrono' : o.who === 'itachi' ? 'uchiha' : 'arena', kind: o.kind, sub }, two); }
function ijKanjiCol(g, txt, x, y0, size, a, fill, edge, font) { g.save(); g.globalAlpha *= a; g.font = `${size}px ${font || '"Yuji Syuku", "Shippori Mincho B1", "IPAGothic", serif'}`; g.textAlign = 'center'; g.textBaseline = 'top'; g.lineJoin = 'round';
  for (let i = 0; i < txt.length; i++) { const cy = y0 + i * size * 1.02; g.lineWidth = size * .16; g.strokeStyle = edge; g.strokeText(txt[i], x, cy); g.fillStyle = fill; g.fillText(txt[i], x, cy); } g.restore(); }
function ijFit(g, font, txt, size, maxW, sp) { g.font = font(size); let L = txtLetters(g, txt, size * sp); if (L.w > maxW) { size *= maxW / L.w; g.font = font(size); L = txtLetters(g, txt, size * sp); } return { size, L }; }
// ------------------------------------------------------------------------------------------------ CROW (Itachi)  text_style.md 1
function uchihaTitle(g, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 7 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const main = String(o.text).toUpperCase(), n = main.length, ama = o.kind === 'amaterasu', card = o.kind === 'card', fi = Math.floor(u * TXT_FR), align = o.align || 'left', font = s => `${s}px "Dela Gothic One", "Inter Display", sans-serif`;
  g.save(); const sideL = (o.side || (align === 'right' ? 'right' : 'left')) === 'left', { size, L } = ijFit(g, font, main, o.size || 184, o.maxW || (o.sub ? W - 560 : W - 380), .02);
  const x = o.x == null ? (align === 'right' ? W - (o.sub ? 280 : 140) : align === 'center' ? W / 2 : (o.sub && sideL ? 280 : 140)) : o.x, y = o.y == null ? H - 150 : o.y, x0 = align === 'left' ? 0 : align === 'center' ? -L.w / 2 : -L.w;
  g.translate(x, y); const outK = clamp((u - inT - hold) / outT, 0, 1), breathe = 1 + .15 * Math.sin(u * 4), cy = -size * .36;
  // red full-moon circle behind (expands in frames 2-4)
  const mk = clamp((u - 2 / TXT_FR) / (2 / TXT_FR), 0, 1) * (1 - outK); if (mk > 0) { const R = Math.max(Math.min(L.w * .36, size * 1.6), size * 1.1) * (.4 + .6 * easeOut(mk)); g.save(); g.globalAlpha *= .2 * mk; g.fillStyle = radial(g, x0 + L.w * .5, cy, R, [[0, '#ff3a3a'], [.8, '#c8102a'], [1, '#7a0010']]); g.beginPath(); g.arc(x0 + L.w * .5, cy, R, 0, TAU); g.fill(); g.restore(); }
  if (o.sub && u > 2 / TXT_FR) { const ks = Math.min(140, (H - 160) / o.sub.length), kx = (sideL ? 100 : W - 100) - x, n2 = Math.ceil(o.sub.length * clamp((u - 2 / TXT_FR) / (5 / TXT_FR), 0, 1)); ijKanjiCol(g, o.sub.slice(0, n2), kx, 70 - y, ks, 1 - outK, '#d81a28', '#000000', '"Yuji Boku", "IPAGothic", serif'); }
  const pre = o.pre ? String(o.pre).toUpperCase() : null; if (pre && u > 1 / TXT_FR) { g.save(); g.globalAlpha *= 1 - outK; const ps = Math.max(72, size * .4); g.font = font(ps); g.textAlign = 'left'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#000'; g.strokeText(pre, x0, -size * .98); g.lineWidth = 5; g.strokeStyle = '#c8102a'; g.strokeText(pre, x0, -size * .98); g.fillStyle = '#0c0a0c'; g.fillText(pre, x0, -size * .98); g.restore(); }
  const gr = g.createLinearGradient(0, -size * .78, 0, size * .06); if (ama) { gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#0a0008'); } else if (card) { gr.addColorStop(0, '#2a0a0e'); gr.addColorStop(.5, '#7a0a14'); gr.addColorStop(1, '#c8102a'); } else { gr.addColorStop(0, '#0c0a0c'); gr.addColorStop(.5, '#2a060a'); gr.addColorStop(1, '#5a0a12'); }
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = font(size);
  for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const cw = g.measureText(ch).width, cx = x0 + L.xs[i], form = clamp((u - (i / n) * (1.5 / TXT_FR)) / (2 / TXT_FR), 0, 1);
    let a = 1, dx = 0; if (outK > 0) { const pk = clamp(outK * 1.8 - ((n - 1 - i) / n) * .8, 0, 1); a = 1 - pk; dx = -pk * size * .2; if (pk > .02) for (let j = 0; j < 3; j++) { g.save(); g.globalAlpha *= 1 - pk; ijDrawCrow(g, cx + cw / 2 - pk * size * (1 + j * .7), cy - (hash(i * 3 + j) - .5) * size * pk, size * .2, lt * 14 + i * 3 + j, Math.PI + (hash(i + j) - .5) * .5, { flip: true, eye: true }); g.restore(); } if (a <= .02) continue; }
    if (form < 1) { for (let j = 0; j < 3; j++) { const fx = cx + cw / 2 + (1 - form) * size * (1.5 + j), fy = cy + (hash(i * 7 + j) - .5) * size * (1 - form) * 1.4; g.save(); g.globalAlpha *= 1 - form * .7; ijDrawCrow(g, fx, fy, size * .2, lt * 14 + i + j, Math.PI, { flip: true, eye: true }); g.restore(); } if (form < .5) continue; }
    g.save(); g.globalAlpha *= a * clamp(form * 2 - 1, 0, 1); g.translate(cx + dx, 0);
    g.save(); g.shadowColor = ama ? 'rgba(106,42,154,.6)' : 'rgba(216,26,40,.45)'; g.shadowBlur = 24 * breathe; g.lineWidth = 6 + 20; g.strokeStyle = '#000000'; g.strokeText(ch, 0, 0); g.restore();
    g.lineWidth = card ? 16 : 12; g.strokeStyle = ama ? '#6a2a9a' : card ? '#ff2a3a' : '#c8102a'; g.strokeText(ch, 0, 0); g.fillStyle = gr; g.fillText(ch, 0, 0);
    if (!ama) { g.save(); g.beginPath(); g.rect(-10, -size, cw + 20, size * 1.2); g.clip(); g.lineWidth = 3; g.strokeStyle = rgba('#ff2a3a', .9); g.save(); g.translate(cw * .05, size * .05); g.scale(.9, .9); g.strokeText(ch, 0, -size * .04); g.restore(); g.restore(); }
    if (ama) { for (let j = 0; j < 4; j++) { const ph = (u * 1.2 + hash(i * 5 + j)) % 1; g.fillStyle = rgba(j % 2 ? '#6a2a9a' : '#050205', 1 - ph); g.beginPath(); g.ellipse(cw * hash(i + j * 3), -size * (.75 + ph * .5), 6 * (1 - ph) + 2, 14 * (1 - ph) + 3, 0, 0, TAU); g.fill(); } }
    g.restore(); }
  // tomoe flash over the text (frame 5)
  if (fi === 5 || fi === 4) { g.save(); g.globalAlpha *= fi === 5 ? 1 : .5; IJ.sharIris(g, x0 + L.w / 2, cy, size * .55, { k: 1, mk: 0, spin: u * 9 }); g.restore(); }
  // 3-6 crows flying through the letters right -> left + black feathers falling
  if (u > inT * .5 && outK < 1) { g.save(); g.globalAlpha *= 1 - outK; for (let i = 0; i < 5; i++) { const ph = ((u - inT * .5) * .45 + hash(i * 9)) % 1, cxx = x0 + L.w * 1.25 - ph * L.w * 1.6, cyy = cy + (hash(i * 4) - .5) * size * 1.3 + Math.sin(u * 3 + i) * 10; ijDrawCrow(g, cxx, cyy, size * (.18 + .08 * hash(i)), lt * 13 + i * 2, Math.PI, { flip: true, eye: true }); }
    for (let i = 0; i < 8; i++) { const ph = (u * .5 + hash(i * 3)) % 1, fx = x0 + hash(i * 7) * L.w + Math.sin(u * 2 + i) * 14, fy = -size * .1 + ph * size * 1.2, s2 = 10 + 6 * hash(i); g.save(); g.translate(fx, fy); g.rotate(Math.sin(u * 3 + i)); g.globalAlpha *= 1 - ph; g.fillStyle = '#050205'; g.beginPath(); g.moveTo(0, -s2); g.quadraticCurveTo(s2 * .4, 0, 0, s2); g.quadraticCurveTo(-s2 * .4, 0, 0, -s2); g.fill(); g.restore(); } g.restore(); }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ WIZARD (Julius)  text_style.md 2
function chronoTitle(g, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 7 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const main = String(o.text).toUpperCase(), n = main.length, fi = Math.floor(u * TXT_FR), align = o.align || 'right', font = s => `700 ${s}px "Cinzel Decorative", "Cinzel", "Caladea", serif`;
  const handsMode = o.hands || (o.kind === 'stasis' ? 'stop' : o.kind === 'rewind' ? 'back' : 'run');
  g.save(); const { size, L } = ijFit(g, font, main, o.size || (main === 'MANA ZONE' ? 220 : 180), o.maxW || W - 380, .04);
  const x = o.x == null ? (align === 'right' ? W - 140 : align === 'center' ? W / 2 : 140) : o.x, y = o.y == null ? H - 160 : o.y, x0 = align === 'left' ? 0 : align === 'center' ? -L.w / 2 : -L.w;
  g.translate(x, y); const outK = clamp((u - inT - hold) / outT, 0, 1), cx = x0 + L.w / 2, cy = -size * .36, R = Math.min(L.w * .65, 520);
  // clock-face ring behind: draws clockwise over 3 frames, numerals, two hands, two small gears
  const dk = clamp(u / (3 / TXT_FR), 0, 1) * (1 - outK); if (dk > 0) { g.save(); g.globalAlpha *= .9 * dk; g.strokeStyle = '#e8b84a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, -HP, -HP + TAU * dk); g.stroke(); g.globalAlpha *= .6; g.beginPath(); g.arc(cx, cy, R * .93, -HP, -HP + TAU * dk); g.stroke(); g.globalAlpha /= .6;
    g.font = `700 ${Math.max(44, R * .12)}px "Cinzel Decorative", "Cinzel", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba('#ffd36a', .75);
    for (let i = 0; i < 12; i++) { if (i / 12 > dk) break; const an = -HP + i / 12 * TAU; if (Math.abs(Math.sin(an)) < .35 && Math.cos(an) * R < L.w * .55 && Math.abs(Math.cos(an) * R) < L.w * .5) continue; g.fillText(IJ_ROMAN[i], cx + Math.cos(an) * R * .82, cy + Math.sin(an) * R * .82); }
    const ht = handsMode === 'stop' ? Math.min(u, inT) : handsMode === 'back' ? -u : u, ha = -HP + ht * .9, ma = -HP + ht * 6; g.lineCap = 'round'; g.strokeStyle = rgba('#ffd36a', .85); g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ha) * R * .45, cy + Math.sin(ha) * R * .45); g.stroke(); g.lineWidth = 3.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ma) * R * .7, cy + Math.sin(ma) * R * .7); g.stroke();
    if (typeof ijGear === 'function') { ijGear(g, x0 - size * .35, cy + size * .3, size * .22, ht * 1.5, '#e8b84a'); ijGear(g, x0 + L.w + size * .35, cy - size * .35, size * .17, -ht * 2, '#6aa8ff'); } g.restore(); }
  const pre = o.pre ? String(o.pre).toUpperCase() : null; if (pre && u > 1 / TXT_FR) { g.save(); g.globalAlpha *= 1 - outK; const ps = Math.max(70, size * .39); g.font = font(ps); g.textAlign = 'left'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#e8b84a'; g.strokeText(pre, x0, -size * .98); g.lineWidth = 4; g.strokeStyle = '#1a2050'; g.strokeText(pre, x0, -size * .98); g.fillStyle = '#fff2c0'; g.fillText(pre, x0, -size * .98); g.restore(); }
  if (o.sub && u > 2 / TXT_FR) { g.save(); g.globalAlpha *= clamp((u - 2 / TXT_FR) / .12, 0, 1) * (1 - outK); const ss = 46; g.font = `800 ${ss}px "Shippori Mincho B1", "IPAGothic", serif`; g.textAlign = align === 'right' ? 'right' : 'left'; g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = '#1a2050'; const sx = align === 'right' ? 0 : x0; g.strokeText(o.sub, sx, size * .5); g.fillStyle = '#ffd36a'; g.fillText(o.sub, sx, size * .5); g.restore(); }
  const gr = g.createLinearGradient(0, -size * .74, 0, size * .02); gr.addColorStop(0, '#fff2c0'); gr.addColorStop(.5, '#ffd36a'); gr.addColorStop(1, '#c9902a');
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = font(size);
  for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const ui = u - (3 / TXT_FR + i * Math.min(.04, (3 / TXT_FR) / n)); if (ui < 0) continue; const cw = g.measureText(ch).width; let cxx = x0 + L.xs[i], a = 1;
    if (outK > 0) { const pk = clamp(outK * 1.8 - ((n - 1 - i) / n) * .8, 0, 1); a = 1 - pk; for (let j = 0; j < 6; j++) { const an = -pk * 4 - j, rr = pk * size * (.3 + j * .12); g.fillStyle = rgba('#ffd36a', (1 - pk) * .8); g.beginPath(); g.arc(cxx + cw / 2 + Math.cos(an) * rr, cy + Math.sin(an) * rr, 3, 0, TAU); g.fill(); } if (a <= .02) continue; }
    const sc = ui < 1 / TXT_FR ? 1.12 : 1, tick = ui < 1 / TXT_FR ? -.08 : 0; g.save(); g.globalAlpha *= a; g.translate(cxx + cw / 2, cy); g.rotate(tick); g.scale(sc, sc); g.translate(-cw / 2, -cy);
    g.save(); g.shadowColor = 'rgba(232,184,74,.5)'; g.shadowBlur = 30; g.lineWidth = 4 + 16; g.strokeStyle = '#e8b84a'; g.strokeText(ch, 0, 0); g.restore();
    g.save(); g.shadowColor = 'rgba(106,168,255,.35)'; g.shadowBlur = 18; g.lineWidth = 8; g.strokeStyle = '#1a2050'; g.strokeText(ch, 0, 0); g.restore();
    g.fillStyle = rgba('#6aa8ff', .9); g.fillText(ch, 0, 4); g.fillStyle = ui < 1 / TXT_FR ? '#ffffff' : gr; g.fillText(ch, 0, 0); g.restore(); }
  // gloss stripe sliding in (frame 7) then slowly across while holding
  if (u > 6 / TXT_FR && outK < 1) { const sx = x0 - 100 + (((u - 6 / TXT_FR) * .9) % 1.6) * (L.w + 200); g.save(); g.beginPath(); for (let i = 0; i < n; i++) { if (main[i] !== ' ') { g.font = font(size); } } g.globalCompositeOperation = 'source-atop'; g.restore();
    g.save(); g.globalAlpha *= .55 * (1 - outK); g.globalCompositeOperation = 'lighter'; const sg = g.createLinearGradient(sx - 50, 0, sx + 50, 0); sg.addColorStop(0, 'rgba(255,251,232,0)'); sg.addColorStop(.5, 'rgba(255,251,232,1)'); sg.addColorStop(1, 'rgba(255,251,232,0)'); g.fillStyle = sg; g.font = font(size);
    for (let i = 0; i < n; i++) if (main[i] !== ' ') { g.save(); g.beginPath(); g.rect(sx - 50, -size, 100, size * 1.2); g.clip(); g.fillText(main[i], x0 + L.xs[i], 0); g.restore(); } g.restore(); }
  if (fi === 6) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, cx, cy, L.w * .6, '#ffd36a', .45); g.restore(); }
  g.restore();
}
(function () { const at0 = attackTitle; attackTitle = function (g, lt, o) { if (o && o.style === 'crow') o = Object.assign({}, o, { style: 'uchiha' }); if (o && (o.style === 'wizardking' || o.style === 'wizardJ')) o = Object.assign({}, o, { style: 'chrono' });
  if (o && (o.style === 'uchiha' || o.style === 'chrono') && !o.noSplit && typeof nlSplitLong === 'function') o = nlSplitLong(o, 14); if (o && o.style === 'uchiha') return uchihaTitle(g, lt, o); if (o && o.style === 'chrono') return chronoTitle(g, lt, o); return at0(g, lt, o); }; })();
const itachiTitle = (g, lt, o) => uchihaTitle(g, lt, o), juliusTitle = (g, lt, o) => chronoTitle(g, lt, o);
// ------------------------------------------------------------------------------------------------ fighter cards
Object.assign(CARD_STYLE, {
  itachi: { bg0: '#5a0a12', bg1: '#000000', frame: '#d81a28', name: 'ITACHI UCHIHA', title: 'THE CROW OF THE LEAF', sub: 'UCHIHA CLAN · MANGEKYŌ SHARINGAN', vkanji: 'うちはイタチ', vfont: '"Yuji Boku", "IPAGothic", serif', style: 'uchiha', kind: 'card', mark: '写', icons: ['crow', 'tomoe', 'kunai', 'cloud'], wm: 'itachi' },
  julius: { bg0: '#1a2050', bg1: '#8a6a20', frame: '#e8b84a', name: 'JULIUS NOVACHRONO', title: 'THE 28TH WIZARD KING', sub: 'CLOVER KINGDOM · TIME MAGIC', vkanji: '魔法帝', vfont: '"Shippori Mincho B1", "IPAGothic", serif', style: 'chrono', kind: 'time', mark: '時', icons: ['clock', 'grimoire', 'crown', 'hourglass'], wm: 'julius' },
});
(function () { const ci0 = cardIcon; cardIcon = function (ctx, kind, x, y, col, a) {
  if (!['crow', 'tomoe', 'cloud', 'clock', 'clover', 'hourglass', 'crown', 'grimoire'].includes(kind)) return ci0(ctx, kind, x, y, col, a); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.globalAlpha = a * .3; ctx.fill(); ctx.globalAlpha = a; ctx.stroke();
  ctx.strokeStyle = '#fff4e8'; ctx.fillStyle = '#fff4e8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  if (kind === 'crow') ijDrawCrow(ctx, 0, 2, 52, 1.2, 0, { col: '#fff4e8', eye: false });
  else if (kind === 'tomoe') IJ.sharIris(ctx, 0, 0, 28, { k: 1, mk: 0, spin: .5 });
  else if (kind === 'cloud') { ctx.save(); ctx.scale(26, 26); IJ.cloud(ctx, '#d81e26', '#fff4e8'); ctx.restore(); }
  else if (kind === 'clock') { ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.moveTo(0, 0); ctx.lineTo(13, 6); ctx.stroke(); }
  else if (kind === 'clover') ijClover(ctx, 0, -2, 18, '#fff4e8', 3);
  else if (kind === 'grimoire') { ctx.strokeRect(-20, -24, 40, 48); ijClover(ctx, 0, -2, 11, '#fff4e8', 3); }
  else if (kind === 'hourglass') { ctx.beginPath(); ctx.moveTo(-14, -24); ctx.lineTo(14, -24); ctx.lineTo(-14, 24); ctx.lineTo(14, 24); ctx.closePath(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-24, 14); ctx.lineTo(-24, -12); ctx.lineTo(-12, 2); ctx.lineTo(0, -20); ctx.lineTo(12, 2); ctx.lineTo(24, -12); ctx.lineTo(24, 14); ctx.closePath(); ctx.fill(); }
  ctx.restore(); }; })();
(function () { const fc0 = fighterCard; fighterCard = function (ctx, lt, o) { const C = CARD_STYLE[o.who]; fc0(ctx, lt, o); if (!C || !C.vkanji || (o.who !== 'itachi' && o.who !== 'julius')) return; const t0 = o.t0 || 0, dur = o.dur || 2.2, u = lt - t0; if (u < .2 || u > dur - 4 / TXT_FR) return;
  const left = (o.side || 'left') === 'left', a = clamp((u - .2) / .15, 0, 1), ks = C.vkanji.length > 4 ? 110 : 150; ijKanjiCol(ctx, C.vkanji, left ? W - 100 : 100, 100, ks, a, '#ffffff', o.who === 'itachi' ? '#7a0010' : '#0c1430', C.vfont); }; })();
