/* engine/fx_nl2.js (agent E, naruto-vs-luffy) - ATTACK-NAME LETTERING per character (pre/text_style.md; main word >= 150 px @1080, nothing under 44 px)
   attackTitle(g, lt, {style, text, kind, pre, jp, sub, t0, dur, x, y, align, size, side})  (text.js dispatcher extended)
     style 'ninja'   = SHINOBI (Naruto)  Dela Gothic One; fill #fff1c2 -> #ffb43a -> #ff6a00 (+ #c94400 foot); 8 px black brush-rough edge + 4 px dark orange + orange glow;
                       sumi ink stroke behind, small leaf spiral after the last letter, kanji column (Yuji Boku, white + black edge) at the frame edge.
                       IN 7 fr: ink stroke wipes from the left (2) -> letters slam 130 % -> 100 % in groups with little smoke puffs (3) -> orange flash (1) -> settle.
                       OUT 5 fr: letters burst into smoke poofs left -> right.  kind: orange (default) | rasengan (blue foot #4fb6ff) | kurama (gold) | sage | baryon | shuriken
                       Default position lower-left (Naruto's side).  pre = small first line ('SAGE ART:'), auto-split on ':'.
     style 'pirate'  = PIRATE (Luffy, Gear 2-4)  Bangers; fill #fff36a -> #ffb000 -> #e8202a; 10 px black + 5 px white outer + 10 px drop shadow; yellow Ben-Day starburst behind;
                       'GOMU GOMU NO' prefix 80 px (+ ゴムゴムの 60 px above). IN 6 fr: burst pops 60 -> 115 %, text stretches in 160 % wide -> 95 % -> spring overshoot -> settle.
                       OUT 5 fr: stretches sideways and snaps away.  kind: gomu (default) | haki (black fill, gloss stripe, red outline) | conqueror (black + red-black bolts) | gear2 | gear3 | gear4
                       Default position lower-right (Luffy's side).
     style 'cartoon' = NIKA (Gear 5)  Bangers rounded: white fill with pastel gradient #cbb8ff -> #fff3a8 -> #ffc0d8, 9 px #2a1a4a, 6 px white wavy cloud rim, stars; letters
                       drop one by one and squash (70 % -> 115 % -> 100 %), keep hopping out of phase; OUT: letters pop like soap bubbles (ring each).
   NL_MOVES[name] -> {style, kind, pre, jp, sub};  nlMoveTitle(lt, text, {who, g5}) -> options;  fxBoing (fx_nl.js) = free cartoon SFX word (BOYOOON! SPLAT! BZZZT! DOKAAAN!).   */
'use strict';
const NLT = {
  ninja: { orange: ['#fff1c2', '#ffb43a', '#ff6a00', '#c94400', '#7a2a00', '#ff8a1a'], rasengan: ['#fff1c2', '#ffb43a', '#ff6a00', '#4fb6ff', '#7a2a00', '#ff8a1a'], kurama: ['#fff4b0', '#ffd860', '#ffc43a', '#e08a10', '#6a3a00', '#ffc43a'],
    sage: ['#fff1c2', '#ffa050', '#ff5a10', '#b83000', '#6a1a00', '#ff7a1a'], baryon: ['#ffe8d8', '#ff9a6a', '#e8241a', '#8a0a0a', '#4a0606', '#ff4a1a'], shuriken: ['#ffffff', '#e8f6ff', '#9ad8ff', '#4fb6ff', '#1a3a7a', '#8ad0ff'] },
  pirate: { gomu: ['#fff36a', '#ffb000', '#e8202a', '#ffffff'], haki: ['#3a3a48', '#0c0c0e', '#0c0c0e', '#ff2a3a'], conqueror: ['#2a1a20', '#0c0c0e', '#000000', '#ff2a3a'], gear2: ['#ffffff', '#ffb0c0', '#e8405a', '#ffffff'], gear3: ['#fff36a', '#ffb000', '#e8202a', '#ffffff'], gear4: ['#ff6a5a', '#c81a1a', '#1a0a0a', '#ffffff'] },
};
const NL_MOVES = {
  'RASENGAN': { style: 'ninja', kind: 'rasengan', sub: '螺旋丸' }, 'ODAMA RASENGAN': { style: 'ninja', kind: 'rasengan', sub: '大玉螺旋丸' }, 'RASENSHURIKEN': { style: 'ninja', kind: 'shuriken', sub: '螺旋手裏剣' },
  'SAGE ART: RASENSHURIKEN': { style: 'ninja', kind: 'shuriken', pre: 'SAGE ART:', text: 'RASENSHURIKEN!', sub: '仙法・螺旋手裏剣' }, 'SAGE ART: GIANT RASENGAN': { style: 'ninja', kind: 'rasengan', pre: 'SAGE ART:', text: 'GIANT RASENGAN', sub: '仙法・大玉螺旋丸' },
  'KAGE BUNSHIN NO JUTSU': { style: 'ninja', kind: 'orange', sub: '影分身の術' }, 'SHADOW CLONE JUTSU': { style: 'ninja', kind: 'orange', sub: '影分身の術' }, 'TAJU KAGE BUNSHIN NO JUTSU': { style: 'ninja', kind: 'orange', sub: '多重影分身の術' },
  'SAGE MODE': { style: 'ninja', kind: 'sage', sub: '仙人モード' }, 'FROG KUMITE': { style: 'ninja', kind: 'sage', sub: '蛙組手' }, 'KURAMA MODE': { style: 'ninja', kind: 'kurama', sub: '九喇嘛モード' },
  'NINE-TAILS CHAKRA MODE': { style: 'ninja', kind: 'kurama', sub: '九尾チャクラモード' }, 'BARYON MODE': { style: 'ninja', kind: 'baryon', sub: '重粒子モード' }, 'TAILED BEAST BOMB': { style: 'ninja', kind: 'kurama', sub: '尾獣玉' },
  'UZUMAKI NARUTO RENDAN': { style: 'ninja', kind: 'orange', sub: 'うずまきナルト連弾' },
  'GEAR SECOND': { style: 'pirate', kind: 'gear2', jp: 'ギア2' }, 'JET PISTOL': { style: 'pirate', kind: 'gear2', pre: 'GOMU GOMU NO', text: 'JET PISTOL!' }, 'JET GATLING': { style: 'pirate', kind: 'gear2', pre: 'GOMU GOMU NO', text: 'JET GATLING!' },
  'GEAR THIRD': { style: 'pirate', kind: 'gear3', jp: 'ギア3' }, 'GEAR FOURTH': { style: 'pirate', kind: 'gear4', jp: 'ギア4' }, 'GEAR FOURTH: BOUNDMAN': { style: 'pirate', kind: 'gear4', pre: 'GEAR FOURTH:', text: 'BOUNDMAN', jp: 'ギア4' },
  'ARMAMENT HAKI: HARDENING': { style: 'pirate', kind: 'haki', pre: 'ARMAMENT HAKI:', text: 'HARDENING', jp: '武装色 硬化' }, 'OBSERVATION HAKI': { style: 'pirate', kind: 'haki', jp: '見聞色' },
  "CONQUEROR'S HAKI": { style: 'pirate', kind: 'conqueror', jp: '覇王色' }, 'GEAR FIFTH': { style: 'cartoon', jp: 'ギア5' }, 'GEAR 5': { style: 'cartoon', jp: 'ギア5' }, 'NIKA': { style: 'cartoon' },
};
function nlMoveTitle(lt, text, o = {}) { const raw = String(text || '').trim(), key = raw.toUpperCase().replace(/[!.]+$/g, '').replace(/\.\.\.\s*/g, ' ').replace(/\s+/g, ' ').trim(), m = NL_MOVES[key];
  if (m) return Object.assign({ text: m.text || raw.toUpperCase() }, m);
  const gm = /^GOMU GOMU NO[.\s]*(.+)$/.exec(raw.toUpperCase()); if (gm) { const nm = gm[1].trim(); return { style: o.g5 ? 'cartoon' : 'pirate', kind: /KING KONG|KONG/.test(nm) ? 'gear4' : /JET/.test(nm) ? 'gear2' : /RED HAWK|HAWK/.test(nm) ? 'haki' : 'gomu', pre: 'GOMU GOMU NO', jp: 'ゴムゴムの', text: nm }; }
  const ci = raw.indexOf(':'); const two = ci > 0 && ci < raw.length - 2 ? { pre: raw.slice(0, ci + 1).toUpperCase(), text: raw.slice(ci + 1).trim().toUpperCase() } : { text: raw.toUpperCase() };
  return Object.assign({ style: o.who === 'luffy' ? (o.g5 ? 'cartoon' : 'pirate') : o.who === 'naruto' ? 'ninja' : 'arena', kind: o.kind }, two); }
function nlFit(g, font, txt, size, maxW, sp) { g.font = font(size); let L = txtLetters(g, txt, size * sp); if (L.w > maxW) { size *= maxW / L.w; g.font = font(size); L = txtLetters(g, txt, size * sp); } return { size, L }; }
function nlKanjiCol(g, txt, x, y0, size, a, fill = '#ffffff', ink = '#0a0606', font = '"Yuji Boku", "IPAGothic", serif') { g.save(); g.globalAlpha *= a; g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'top'; g.lineJoin = 'round';
  for (let i = 0; i < txt.length; i++) { const cy = y0 + i * size * 1.02; g.lineWidth = size * .16; g.strokeStyle = ink; g.strokeText(txt[i], x, cy); g.fillStyle = fill; g.fillText(txt[i], x, cy); } g.restore(); }
// ------------------------------------------------------------------------------------------------ SHINOBI (Naruto)
function ninjaTitle(g, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, inT = 7 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const main = String(o.text).toUpperCase(), n = main.length, cols = NLT.ninja[o.kind || 'orange'] || NLT.ninja.orange, fi = Math.floor(u * TXT_FR), align = o.align || 'left', font = s => `${s}px "Dela Gothic One", "Inter Display", sans-serif`;
  g.save(); const { size, L } = nlFit(g, font, main, o.size || 180, o.maxW || (o.sub ? W - 600 : W - 420), .02);
  const x = o.x == null ? (align === 'right' ? W - (o.sub ? 300 : 150) : align === 'center' ? W / 2 : (o.sub && (o.side || 'left') === 'left' ? 300 : 150)) : o.x, y = o.y == null ? H - 150 : o.y, x0 = align === 'left' ? 0 : align === 'center' ? -L.w / 2 : -L.w;
  g.translate(x, y); const outK = clamp((u - inT - hold) / outT, 0, 1), shake = fi < 9 && fi > 2 ? 4 : 0; if (shake) g.translate((hash(fi * 3) - .5) * shake, (hash(fi * 7) - .5) * shake);
  // sumi ink stroke behind (wipes in from the left over 2 frames)
  const wk = clamp(u / (2 / TXT_FR), 0, 1); if (wk > 0) { g.save(); g.globalAlpha *= .35 * (1 - outK); g.fillStyle = '#0a0604'; g.beginPath(); const xa = x0 - size * .4, xb = xa + (L.w + size * .9) * wk; g.moveTo(xa, -size * .55); g.quadraticCurveTo((xa + xb) / 2, -size * .78, xb, -size * .62);
    for (let i = 0; i <= 6; i++) g.lineTo(xb - i * 6 + (hash(i * 3) - .5) * 20, -size * .62 + i * size * .12); g.quadraticCurveTo((xa + xb) / 2, size * .12, xa, size * .05); g.closePath(); g.fill(); g.restore(); }
  // kanji column at the frame edge (Naruto's side = left by default)
  if (o.sub && u > 2 / TXT_FR) { const left = (o.side || (align === 'right' ? 'right' : 'left')) === 'left', ks = Math.min(140, (H - 160) / o.sub.length), kx = (left ? 110 : W - 110) - x, n2 = Math.ceil(o.sub.length * clamp((u - 2 / TXT_FR) / (5 / TXT_FR), 0, 1));
    nlKanjiCol(g, o.sub.slice(0, n2), kx, 70 - y, ks, 1 - outK); }
  const pre = o.pre ? String(o.pre).toUpperCase() : null; if (pre && u > 1 / TXT_FR) { g.save(); g.globalAlpha *= 1 - outK; const ps = Math.max(70, size * .42); g.font = font(ps); g.textAlign = 'left'; g.lineJoin = 'round'; g.lineWidth = ps * .2; g.strokeStyle = '#120a04'; g.strokeText(pre, x0, -size * .98); g.fillStyle = cols[1]; g.fillText(pre, x0, -size * .98); g.restore(); }
  const gr = g.createLinearGradient(0, -size * .78, 0, size * .05); gr.addColorStop(0, cols[0]); gr.addColorStop(.4, cols[1]); gr.addColorStop(.8, cols[2]); gr.addColorStop(.81, cols[3]); gr.addColorStop(1, cols[3]);
  const flash = fi === 5, groups = 3; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const grp = Math.floor(i / Math.max(1, Math.ceil(n / groups))), ui = u - (2 + grp) / TXT_FR; if (ui < 0) continue; const cw = g.measureText(ch).width, cx = x0 + L.xs[i];
    if (outK > 0) { const pk = clamp(outK * 1.7 - (i / n) * .7, 0, 1); if (pk > 0 && typeof nlPuff === 'function') nlPuff(g, cx + cw / 2, -size * .35, size * .4 * (.6 + pk), i * 1.3, '#f6f2ec', rgba('#120a04', .85), 1 - pk * pk); if (pk > .3) continue; }
    if (ui < 1.5 / TXT_FR && typeof nlPuff === 'function') nlPuff(g, cx + cw / 2, -size * .3, size * .32 * (1 - ui * TXT_FR / 1.5) + 2, i * 2.1, '#ffffff', rgba('#120a04', .5), .8 - ui * TXT_FR * .5);
    const sc = ui < 1 / TXT_FR ? 1.3 : ui < 2 / TXT_FR ? .97 : 1; g.save(); g.translate(cx + cw / 2, -size * .35); g.scale(sc, sc); g.translate(-cw / 2, size * .35);
    g.save(); g.shadowColor = cols[5]; g.shadowBlur = 28; g.lineWidth = size * .16; g.strokeStyle = rgba(cols[5], .55); g.strokeText(ch, 0, 0); g.restore();
    g.lineWidth = size * .09 + 8; g.strokeStyle = '#120a04'; for (let r = 0; r < 2; r++) { g.save(); g.translate((hash(i * 9 + r) - .5) * 2.4, (hash(i * 5 + r) - .5) * 2.4); g.strokeText(ch, 0, 0); g.restore(); }   // brush-rough black edge
    g.lineWidth = size * .045 + 3; g.strokeStyle = cols[4]; g.strokeText(ch, 0, 0); g.fillStyle = flash ? '#ffd8a0' : gr; g.fillText(ch, 0, 0);
    g.save(); g.beginPath(); g.rect(-10, -size * .78, cw + 20, size * .14); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(ch, 0, 0); g.restore(); g.restore(); }
  // little leaf spiral after the last letter
  if (u > inT * .7 && outK < .5 && typeof nlLeaf === 'function') { g.save(); g.globalAlpha *= 1 - outK * 2; nlLeaf(g, x0 + L.w + size * .32, -size * .4, Math.min(40, size * .22), cols[5], Math.max(3, size * .035)); g.restore(); }
  if (flash) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x0 + L.w / 2, -size * .35, L.w * .6, '#ff8a1a', .45); g.restore(); }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ PIRATE (Luffy)
function pirateTitle(g, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.2, u = lt - t0, main = String(o.text).toUpperCase(), inT = 6 / TXT_FR, outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const kind = o.kind || 'gomu', cols = NLT.pirate[kind] || NLT.pirate.gomu, dark = kind === 'haki' || kind === 'conqueror', align = o.align || 'right', font = s => `${s}px "Bangers", "Inter Display", sans-serif`, fi = Math.floor(u * TXT_FR);
  g.save(); const { size, L } = nlFit(g, font, main, (o.size || 200) * (kind === 'gear3' ? 1.08 : 1), o.maxW || W - 320, .05);
  const x = o.x == null ? (align === 'right' ? W - 150 : align === 'center' ? W / 2 : 150) : o.x, y = o.y == null ? H - 140 : o.y, x0 = align === 'left' ? 0 : align === 'center' ? -L.w / 2 : -L.w, anchor = align === 'right' ? x0 + L.w : align === 'center' ? 0 : x0;
  g.translate(x, y); g.rotate(o.rot == null ? -.04 : o.rot); const outK = clamp((u - inT - hold) / outT, 0, 1);
  // comic starburst (pops 60 -> 115 -> 100 %)
  const bk = fi < 1 ? .6 : fi < 2 ? 1.15 : 1 - outK; if (bk > .02 && typeof comicBurst === 'function') { g.save(); g.globalAlpha *= .92; comicBurst(g, x0 + L.w / 2, -size * .38, L.w * .6 + size * .45, size * .9, bk, dark ? '#2a0a10' : '#ffe14a', dark ? 'rgba(255,40,60,.35)' : 'rgba(232,32,42,.35)', 5); g.restore(); }
  // prefix line + japanese above it
  if ((o.pre || o.jp) && u > 1 / TXT_FR) { g.save(); g.globalAlpha *= 1 - outK; const ps = Math.max(76, size * .4); let py = -size * 1.0; g.textAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left'; g.lineJoin = 'round'; const px = align === 'right' ? x0 + L.w : align === 'center' ? 0 : x0;
    if (o.pre) { g.font = font(ps); g.lineWidth = ps * .22; g.strokeStyle = '#0a0606'; g.strokeText(o.pre.toUpperCase(), px, py); g.fillStyle = dark ? '#ff4a5a' : '#ffffff'; g.fillText(o.pre.toUpperCase(), px, py); py -= ps * .95; }
    if (o.jp) { const js = 60; g.font = `${js}px "Dela Gothic One", "IPAGothic", sans-serif`; g.lineWidth = 10; g.strokeStyle = '#0a0606'; g.strokeText(o.jp, px, py); g.fillStyle = '#fff36a'; g.fillText(o.jp, px, py); } g.restore(); }
  // rubber stretch in (160 % wide -> 95 % -> overshoot -> 100 %), out: stretch sideways and snap
  const sxk = outK > 0 ? (outK < .5 ? 1 + outK * 2.2 : Math.max(.02, 2.1 * (1 - (outK - .5) * 2))) : fi < 2 ? 1.6 - fi * .3 : fi < 3 ? .95 : fi < 4 ? 1.05 : 1 + .015 * Math.sin(u * 10), syk = 1 / Math.sqrt(sxk);
  g.save(); g.translate(anchor, 0); g.scale(sxk, syk); g.translate(-anchor, 0); g.font = font(size); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  const gr = g.createLinearGradient(0, -size * .8, 0, size * .05); gr.addColorStop(0, cols[0]); gr.addColorStop(.5, cols[1]); gr.addColorStop(1, cols[2]);
  const pass = fn => { for (let i = 0; i < main.length; i++) { const ch = main[i]; if (ch === ' ') continue; g.save(); g.translate(x0 + L.xs[i], 0); fn(ch, i); g.restore(); } };
  if (dark) { g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = '#ff2a3a'; g.shadowBlur = 36; g.lineWidth = size * .16; g.strokeStyle = 'rgba(255,42,58,.8)'; pass(ch => g.strokeText(ch, 0, 0)); g.restore(); }
  g.fillStyle = '#000000'; pass(ch => g.fillText(ch, 10, 10));                                                    // 10 px drop shadow
  g.lineWidth = 10 * 2 + 10; g.strokeStyle = cols[3] === '#ff2a3a' ? '#ff2a3a' : '#ffffff'; pass(ch => g.strokeText(ch, 0, 0));   // 5 px white (or red) outer
  g.lineWidth = 20; g.strokeStyle = '#0a0606'; pass(ch => g.strokeText(ch, 0, 0));                                 // 10 px black
  g.fillStyle = fi === 4 ? '#ffffff' : gr; pass(ch => g.fillText(ch, 0, 0));
  g.save(); g.fillStyle = dark ? 'rgba(138,138,160,.75)' : 'rgba(255,255,255,.5)'; g.beginPath(); g.rect(x0 - 20, -size * (dark ? .5 : .8), L.w + 40, size * (dark ? .1 : .17)); g.clip(); pass(ch => g.fillText(ch, 0, 0)); g.restore();
  g.restore();
  if (kind === 'conqueror' && outK < 1) { g.save(); g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const sx0 = x0 + hash(i * 3 + fi) * L.w, pts = [[sx0, -size * .9]]; for (let j = 1; j < 6; j++) pts.push([sx0 + (hash(i * 7 + j + fi) - .5) * 90, -size * .9 + j * size * .22]); g.strokeStyle = 'rgba(255,42,58,.9)'; g.lineWidth = 9; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.strokeStyle = '#000'; g.lineWidth = 4; g.stroke(); } g.restore(); }
  if (kind === 'gear2' && outK < 1) { g.save(); for (let i = 0; i < 12; i++) { const life = (u * .9 + hash(i * 5)) % 1; g.fillStyle = rgba('#ffffff', .55 * (1 - life)); g.beginPath(); g.arc(x0 + hash(i * 9) * L.w, -size * (.5 + life * .8), size * (.06 + .1 * life), 0, TAU); g.fill(); } g.restore(); }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ NIKA (Gear 5 cartoon)
function cartoonTitle(g, lt, o) {
  const t0 = o.t0 || 0, hold = o.dur || 1.3, u = lt - t0, main = String(o.text).toUpperCase(), n = main.length, per = .7 / TXT_FR, inT = Math.max(6 / TXT_FR, per * (n + 4)), outT = 5 / TXT_FR; if (u < 0 || u > inT + hold + outT) return;
  const align = o.align || 'center', font = s => `${s}px "Bangers", "Inter Display", sans-serif`;
  g.save(); const { size, L } = nlFit(g, font, main, o.size || (/GEAR F/.test(main) ? 240 : 220), o.maxW || W - 260, .12); const x = o.x == null ? (align === 'left' ? 130 : align === 'right' ? W - 130 : W / 2) : o.x, y = o.y == null ? H * .8 : o.y, x0 = align === 'left' ? 0 : align === 'right' ? -L.w : -L.w / 2;
  g.translate(x, y); g.rotate(o.rot || 0); const outK = clamp((u - inT - hold) / outT, 0, 1);
  if ((o.pre || o.jp) && outK < 1) { g.save(); const ps = Math.max(70, size * .36); g.font = font(ps); g.textAlign = 'center'; g.lineJoin = 'round'; g.globalAlpha *= 1 - outK; g.translate(x0 + L.w / 2, -size * 1.08); g.rotate(-.05 + Math.sin(u * 5) * .03); const txt = o.pre ? o.pre.toUpperCase() : o.jp;
    if (!o.pre) g.font = `${ps}px "Dela Gothic One", sans-serif`; g.lineWidth = ps * .28; g.strokeStyle = '#2a1a4a'; g.strokeText(txt, 0, 0); g.fillStyle = '#ffffff'; g.fillText(txt, 0, 0); g.restore(); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  const gr = g.createLinearGradient(0, -size * .8, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, '#cbb8ff'); gr.addColorStop(.6, '#fff3a8'); gr.addColorStop(1, '#ffc0d8');
  for (let i = 0; i < n; i++) { const ch = main[i]; if (ch === ' ') continue; const ui = u - (i + 1) * per; if (ui < 0) continue; const cw = g.measureText(ch).width, cx = x0 + L.xs[i] + cw / 2;
    const fall = 2 / TXT_FR, drop = ui < fall ? -size * 1.5 * Math.pow(1 - ui / fall, 2) : 0, land = ui - fall, sq = land < 0 ? 1 : land < 1 / TXT_FR ? .7 : land < 2 / TXT_FR ? 1.15 : 1, hop = u > inT ? Math.abs(Math.sin(u * 6 + i * 1.1)) * -4 : 0;
    const popK = clamp(outK * 1.6 - (i / n) * .6, 0, 1); if (popK > .35) { g.save(); g.strokeStyle = rgba('#ffffff', 1 - popK); g.lineWidth = 6; g.beginPath(); g.arc(cx, -size * .35, size * .3 * (1 + popK), 0, TAU); g.stroke(); g.strokeStyle = rgba('#2a1a4a', .6 * (1 - popK)); g.lineWidth = 3; g.stroke(); g.restore(); continue; }
    g.save(); g.translate(cx, drop + hop); g.rotate(Math.sin(i * 2.1 + u * 4) * .08); g.scale((1 + popK * .3) / Math.sqrt(sq), sq * (1 + popK * .3));
    g.lineWidth = size * .14 + 30; g.strokeStyle = '#ffffff'; for (let w = 0; w < 3; w++) { g.save(); g.translate(Math.cos(w * 2.1 + u * 3) * 3, Math.sin(w * 2.1 + u * 3) * 3); g.strokeText(ch, 0, 0); g.restore(); }   // wavy cloud rim
    g.lineWidth = size * .14 + 18; g.strokeStyle = '#2a1a4a'; g.strokeText(ch, 0, 0); g.fillStyle = gr; g.fillText(ch, 0, 0);
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(-cw * .18, -size * .6, size * .07, size * .035, -.5, 0, TAU); g.fill(); g.restore(); }
  if (u > inT * .5 && outK < 1) for (let i = 0; i < 7; i++) { const an = u * 2.5 + i / 7 * TAU, rx = L.w * .6 + size * .35, px = x0 + L.w / 2 + Math.cos(an) * rx, py = -size * .35 + Math.sin(an) * size * .8, r = size * (i % 2 ? .07 : .1); g.save(); g.globalAlpha *= 1 - outK; g.translate(px, py); g.rotate(an * 2);
    g.fillStyle = i % 3 ? '#fff3a8' : '#ffffff'; g.strokeStyle = '#2a1a4a'; g.lineWidth = Math.max(3, r * .18); g.beginPath(); for (let j = 0; j < 8; j++) { const aa = j / 8 * TAU - HP, rr = j % 2 ? r * .32 : r; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore();
}
// long names -> small prefix line + big last word(s) (text_style.md: two lines when long), e.g. KAGE BUNSHIN NO / JUTSU!
function nlSplitLong(o, maxMain = 13) { if (o.pre || !o.text) return o; const w = String(o.text).trim().split(/\s+/); if (w.length < 3 || String(o.text).length <= 16) return o;
  let k = w.length - 1; while (k > 1 && w.slice(k - 1).join(' ').length <= maxMain) k--; return Object.assign({}, o, { pre: w.slice(0, k).join(' '), text: w.slice(k).join(' ') }); }
(function () { const at0 = attackTitle; attackTitle = function (g, lt, o) { if (o && (o.style === 'ninja' || o.style === 'pirate' || o.style === 'cartoon') && !o.noSplit) o = nlSplitLong(o); if (o && o.style === 'ninja') return ninjaTitle(g, lt, o); if (o && o.style === 'pirate') return pirateTitle(g, lt, o); if (o && (o.style === 'cartoon' || o.style === 'nika')) return cartoonTitle(g, lt, o); return at0(g, lt, o); }; })();
const narutoTitle = (g, lt, o) => ninjaTitle(g, lt, o), luffyTitle = (g, lt, o) => pirateTitle(g, lt, o), nikaTitle = (g, lt, o) => cartoonTitle(g, lt, o);
// fighter cards (Record-of-Ragnarok style intros): fighterCard(g, lt, {who:'naruto'|'luffy', side, t0, dur, round})
Object.assign(CARD_STYLE, {
  naruto: { bg0: '#ff7a1a', bg1: '#0a0402', frame: '#ff8a1a', name: 'NARUTO UZUMAKI', title: 'THE SEVENTH HOKAGE', sub: 'HIDDEN LEAF · NINE-TAILS JINCHŪRIKI', vkanji: '七代目火影', vfont: '"Yuji Boku", "IPAGothic", serif', style: 'ninja', kind: 'orange', mark: '火', icons: ['kunai', 'leaf', 'spiral', 'fox'] },
  luffy: { bg0: '#d4232b', bg1: '#060202', frame: '#ffc43a', name: 'MONKEY D. LUFFY', title: 'THE FIFTH EMPEROR', sub: 'STRAW HAT PIRATES · GOMU GOMU NO MI', vkanji: '五皇', vfont: '"Dela Gothic One", "IPAGothic", sans-serif', style: 'pirate', kind: 'gomu', mark: '麦', icons: ['hat', 'meat', 'fist', 'sun'] },
});
(function () { const ci0 = cardIcon; cardIcon = function (ctx, kind, x, y, col, a) {
  if (!['leaf', 'spiral', 'toad', 'fox', 'hat', 'fist', 'gear', 'sun', 'kunai', 'meat'].includes(kind)) return ci0(ctx, kind, x, y, col, a); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.globalAlpha = a * .3; ctx.fill(); ctx.globalAlpha = a; ctx.stroke();
  ctx.strokeStyle = '#fff4d8'; ctx.fillStyle = '#fff4d8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
  if (kind === 'leaf') nlLeaf(ctx, 0, 0, 24, '#fff4d8', 5);
  else if (kind === 'spiral') { for (let i = 0; i <= 30; i++) { const an = i / 30 * TAU * 2.2, r = 3 + i * .9; i ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.stroke(); }
  else if (kind === 'toad') { ctx.ellipse(0, 6, 26, 16, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(-12, -10, 7, 0, TAU); ctx.arc(12, -10, 7, 0, TAU); ctx.stroke(); }
  else if (kind === 'fox') { ctx.moveTo(-24, -24); ctx.lineTo(-12, 0); ctx.lineTo(0, 24); ctx.lineTo(12, 0); ctx.lineTo(24, -24); ctx.lineTo(8, -10); ctx.lineTo(-8, -10); ctx.closePath(); ctx.stroke(); }
  else if (kind === 'kunai') { ctx.moveTo(0, -28); ctx.lineTo(9, -6); ctx.lineTo(0, 4); ctx.lineTo(-9, -6); ctx.closePath(); ctx.moveTo(0, 4); ctx.lineTo(0, 20); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 25, 5, 0, TAU); }
  else if (kind === 'meat') { ctx.ellipse(-4, -2, 18, 13, -.5, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(24, 22); ctx.stroke(); ctx.beginPath(); ctx.arc(26, 20, 4, 0, TAU); ctx.arc(22, 26, 4, 0, TAU); }
  else if (kind === 'hat') { ctx.ellipse(0, 8, 30, 8, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(-16, -22, 0, -22); ctx.quadraticCurveTo(16, -22, 16, 6); ctx.stroke(); ctx.fillStyle = '#d01e26'; ctx.fillRect(-16, -4, 32, 7); }
  else if (kind === 'fist') { ctx.arc(0, 0, 18, 0, TAU); ctx.stroke(); for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(8, i * 9, 7, -1.4, 1.4); ctx.stroke(); } }
  else if (kind === 'gear') { for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; ctx.moveTo(Math.cos(an) * 16, Math.sin(an) * 16); ctx.lineTo(Math.cos(an) * 26, Math.sin(an) * 26); } ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke(); }
  else { ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); for (let i = 0; i < 10; i++) { const an = i / 10 * TAU; ctx.moveTo(Math.cos(an) * 19, Math.sin(an) * 19); ctx.lineTo(Math.cos(an) * 28, Math.sin(an) * 28); } ctx.stroke(); }
  ctx.restore(); }; })();
// vertical kanji column on the fighter cards (text_style.md: 七代目火影 Yuji Boku 120 px / 五皇 Dela Gothic One) + card text from the shot ('NAME / TITLE / SUB')
(function () { const fc0 = fighterCard; fighterCard = function (ctx, lt, o) { const C = CARD_STYLE[o.who]; fc0(ctx, lt, o); if (!C || !C.vkanji) return; const t0 = o.t0 || 0, dur = o.dur || 2.2, u = lt - t0; if (u < .2 || u > dur - 4 / TXT_FR) return;
  const left = (o.side || 'left') === 'left', a = clamp((u - .2) / .15, 0, 1), ks = C.vkanji.length > 3 ? 120 : 160; nlKanjiCol(ctx, C.vkanji, left ? W - 100 : 100, 110, ks, a, '#ffffff', '#0a0606', C.vfont); }; })();
