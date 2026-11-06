/* engine/impact_ij.js (agent E, itachi-vs-julius) - impact styles + sequences.
   STYLES  mangekyo amaterasuneg tsukuyomired crowscatter susanooflare izanamiloop uchihafan | clockfreeze goldtime manaburst chronorewind crestflash | bwhalftone faceneg
   SEQUENCES (shots.json names work directly):
     MANGEKYO_FLASH AMATERASU_BURN TSUKUYOMI_RED CROW_SCATTER SUSANOO_FLARE IZANAMI_LOOP UCHIHA_FAN | CLOCK_FREEZE TIME_GOLD MANA_BURST CHRONO_REWIND WIZARD_CREST
   IMPACT BURSTS: one hit = 5+ different impact frames within 0.5-1 s, the style changes every 1-3 frames
     (negative, black/white halftone, speed lines, face invert, manga ink, colour flash):
       'BURST' (neutral, 16 fr) | 'BURST_ITA' (crimson accents, mangekyo eye) | 'BURST_JUL' (gold/blue accents, clock) | 'BURST_CLASH' (both, split colours)
       IJ.burst({frames 12..24, who:'itachi'|'julius'|'clash'|null, seed, face:true|false, eye:true}) -> custom step list (order shuffled by seed)
       shotT stretches any of them to the shots.json 'frames' (fitSeq).  The face-invert step uses the shot's first figure (p.fig = index to choose).   */
'use strict';
const IJI = { red: '#d81e26', dred: '#5a0008', gold: '#f6d36a', navy: '#0c1430', cyan: '#8ad8ff' };
function ijiFocus(f, p) { return impFocus(f, p); }
IMPACT.bwhalftone = (c, g, f, p, k) => { IMPACT.halftone(c, g, f, Object.assign({ cols: ['#ffffff', '#0a0a0a'] }, p), k); };
IMPACT.faceneg = (c, g, f, p, k) => { if (!f._figs.length) return IMPACT.invert(c, g, f, p, k); const eyes = p.part === 'eyes'; IMPACT.closeup(c, g, f, Object.assign({ part: eyes ? 'face' : p.part || 'face', mode: 'invert', bg: '#ffffff', lineCol: '#000000', dist: (eyes ? .46 : (p.dist || .62)) * (1 - .05 * k) }, p, eyes ? { part: 'face', dist: .46 * (1 - .05 * k) } : {}), k); };
IMPACT.mangekyo = (c, g, f, p, k) => { const q = ijiFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.fillStyle = radial(g, W / 2, H / 2, W * .7, [[0, '#7a0010'], [1, '#050002']]); g.fillRect(0, 0, W, H);
  fxSpeedLines(g, f.T + k, { x: W / 2, y: H / 2, n: 80, col: '#000000', inner: 380, w: 8, alpha: 1 }); IJ.sharIris(g, W / 2, H / 2, 330 + k * 25, { k: 1, mk: p.mk == null ? 1 : p.mk, spin: k * .6 + (p.spin || 0) }); g.restore();
  rawDraw(g, impSil('chars', '#000000'), 0, 0, p.sil === false ? 0 : .85); void q; };
IMPACT.amaterasuneg = (c, g, f, p, k) => { fillAll(g, '#f4efe6'); const q = ijiFocus(f, p); rawDraw(g, impSil('chars', '#050205'));
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); for (let i = 0; i < 22; i++) { const a = hash(i * 3 + k) * TAU, d = 120 + 420 * hash(i * 7), x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * .6 + 120;
    ijFlameTongue(g, x, y, 40 + 40 * hash(i), 160 + 260 * hash(i * 5), f.T + i, i * 3 + k, '#050205', IJI.red); } splatter(g, 9 + k * 11, 18, '#050205', q); g.restore(); };
IMPACT.tsukuyomired = (c, g, f, p, k) => { g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a0004'); gr.addColorStop(.6, '#c0101a'); gr.addColorStop(1, '#120004'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#050002'; g.beginPath(); g.arc(W * .78, H * .22, 150, 0, TAU); g.fill(); g.strokeStyle = '#ff5a4a'; g.lineWidth = 6; g.stroke(); g.restore(); const t = filtered(layer('chars'), 'invert(1) grayscale(1) contrast(1.4)'); rawDraw(g, t); };
IMPACT.crowscatter = (c, g, f, p, k) => { fillAll(g, p.bg || '#f4f0ea'); const q = ijiFocus(f, p); rawDraw(g, impSil('chars', '#0a0608')); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0);
  fxSpeedLines(g, f.T + k, Object.assign({ n: 70, col: '#0a0608', inner: 320, w: 6, alpha: 1 }, q)); for (let i = 0; i < 34; i++) { const a = hash(i * 5) * TAU, d = (120 + 600 * hash(i * 9)) * (1 + k * .25); ijDrawCrow(g, q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * .7, 40 + 60 * hash(i * 3), f.T * 12 + i, a, { flip: Math.cos(a) < 0 }); } g.restore(); };
IMPACT.susanooflare = (c, g, f, p, k) => { const t = filtered(c, 'brightness(1.6) contrast(1.6) saturate(1.8) sepia(.6) hue-rotate(-25deg)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ff6a5a'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  const sil = impSil('chars', '#ffffff'); rawDraw(g, sil, 5 * OUT.scale, -4 * OUT.scale); rawDraw(g, impSil('chars', '#1a0204')); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); fxSpeedLines(g, f.T + k, Object.assign({ n: 60, col: '#fff0e0', inner: 360, w: 5, alpha: .9 }, ijiFocus(f, p))); g.restore(); };
IMPACT.izanamiloop = (c, g, f, p, k) => { const t = filtered(c, 'sepia(1) saturate(2.4) hue-rotate(-30deg) contrast(1.2)'); rawDraw(g, t); for (let i = 1; i <= 3; i++) rawDraw(g, layer('chars'), -i * 40 * OUT.scale * (1 + k * .3), 0, .3 / i);
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.strokeStyle = '#ff2a2a'; g.lineCap = 'round'; for (let r = 0; r < 3; r++) { const R = 240 + r * 160, a0 = -k * .8 + r; g.lineWidth = 10 - r * 2; g.beginPath(); g.arc(W / 2, H / 2, R, a0, a0 + 4.8); g.stroke(); } g.restore(); };
IMPACT.uchihafan = (c, g, f, p, k) => { g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const q = ijiFocus(f, p), ang = (p.ang || -.35) + k * .05; g.translate(q.x, q.y); g.rotate(ang); g.fillStyle = IJI.red; g.fillRect(-3000, -3000, 6000, 3000); g.fillStyle = '#f6f2ea'; g.fillRect(-3000, 0, 6000, 3000);
  g.strokeStyle = '#000'; g.lineWidth = 16; g.beginPath(); g.moveTo(-3000, 0); g.lineTo(3000, 0); g.stroke(); g.restore(); rawDraw(g, impSil('chars', '#000000')); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); splatter(g, 5 + k * 7, 16, '#000', q); g.restore(); };
IMPACT.clockfreeze = (c, g, f, p, k) => { const t = filtered(c, 'grayscale(1) contrast(1.25) brightness(.95)'); rawDraw(g, t); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#b8d0ff'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); ijClockFace(g, W / 2, H / 2, 420, k * .02, .85); g.restore(); };
function ijClockFace(g, x, y, R, rot, a = 1, col = IJI.gold) { g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = col; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * .9, 0, TAU); g.stroke();
  for (let i = 0; i < 60; i++) { const an = i / 60 * TAU; g.lineWidth = i % 5 ? 2 : 6; g.beginPath(); g.moveTo(Math.cos(an) * R * .9, Math.sin(an) * R * .9); g.lineTo(Math.cos(an) * R * (i % 5 ? .86 : .8), Math.sin(an) * R * (i % 5 ? .86 : .8)); g.stroke(); }
  g.font = `900 ${R * .13}px "Cinzel", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; for (let i = 0; i < 12; i++) { const an = -HP + i / 12 * TAU; g.fillText(IJ_ROMAN[i], Math.cos(an) * R * .68, Math.sin(an) * R * .68); }
  g.lineCap = 'round'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-HP + rot * 2 + 1.2) * R * .4, Math.sin(-HP + rot * 2 + 1.2) * R * .4); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-HP + rot * 24) * R * .6, Math.sin(-HP + rot * 24) * R * .6); g.stroke(); g.restore(); }
IMPACT.goldtime = (c, g, f, p, k) => { IMPACT.duotone(c, g, f, { dark: IJI.navy, light: IJI.gold, th: 110 }, k); const q = ijiFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); ijClockFace(g, q.x, q.y, 300 + k * 40, k * .05, .9, '#fff6d0'); g.restore(); };
IMPACT.manaburst = (c, g, f, p, k) => { IMPACT.rimsil(c, g, f, Object.assign({ col: '#dff6ff', col2: '#3a8ad8', rimCol: IJI.gold, sil: '#0a1028' }, p), k); };
IMPACT.chronorewind = (c, g, f, p, k) => { IMPACT.invert(c, g, f, Object.assign({ hue: 180, lines: 0 }, p), k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.strokeStyle = IJI.gold; g.lineCap = 'round';
  for (let r = 0; r < 3; r++) { const R = 220 + r * 150, a0 = k * .9 + r * 2; g.lineWidth = 12 - r * 3; g.beginPath(); g.arc(W / 2, H / 2, R, a0, a0 + 4.6); g.stroke(); const ax = W / 2 + Math.cos(a0) * R, ay = H / 2 + Math.sin(a0) * R; g.fillStyle = IJI.gold; g.beginPath(); g.moveTo(ax + Math.cos(a0 - HP) * 34, ay + Math.sin(a0 - HP) * 34); g.lineTo(ax + Math.cos(a0 + .8) * 26, ay + Math.sin(a0 + .8) * 26); g.lineTo(ax + Math.cos(a0 + Math.PI - .8) * 26, ay + Math.sin(a0 + Math.PI - .8) * 26); g.fill(); } g.restore(); };
IMPACT.crestflash = (c, g, f, p, k) => { g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.fillStyle = radial(g, W / 2, H / 2, W * .7, [[0, '#2a3a7a'], [1, '#050818']]); g.fillRect(0, 0, W, H); fxWizardCrest(g, W / 2, H / 2, 360 + k * 30, { col: IJI.gold }); g.restore(); rawDraw(g, impSil('chars', '#000000'), 0, 0, .9); };
// ------------------------------------------------------------------------------------------------ sequences
Object.assign(IMPACT_SEQ, {
  MANGEKYO_FLASH: [{ s: 'flash', n: 1, p: { col: '#000000' } }, { s: 'mangekyo', n: 3 }, { s: 'invert', n: 1, p: { hue: 0 } }],
  AMATERASU_BURN: [{ s: 'amaterasuneg', n: 2 }, { s: 'invert', n: 1 }, { s: 'amaterasuneg', n: 1 }],
  TSUKUYOMI_RED: [{ s: 'flash', n: 1, p: { col: '#c0101a' } }, { s: 'tsukuyomired', n: 3 }],
  CROW_SCATTER: [{ s: 'crowscatter', n: 3 }, { s: 'invert', n: 1 }],
  SUSANOO_FLARE: [{ s: 'flash', n: 1, p: { col: '#ffd0c0' } }, { s: 'susanooflare', n: 3 }],
  IZANAMI_LOOP: [{ s: 'izanamiloop', n: 4 }],
  UCHIHA_FAN: [{ s: 'uchihafan', n: 3 }],
  CLOCK_FREEZE: [{ s: 'flash', n: 1, p: { col: '#e8f4ff' } }, { s: 'clockfreeze', n: 3 }],
  TIME_GOLD: [{ s: 'goldtime', n: 3 }],
  MANA_BURST: [{ s: 'flash', n: 1, p: { col: '#fff6d0' } }, { s: 'manaburst', n: 3 }],
  CHRONO_REWIND: [{ s: 'chronorewind', n: 3 }],
  WIZARD_CREST: [{ s: 'crestflash', n: 3 }],
});
// ------------------------------------------------------------------------------------------------ IMPACT BURSTS
IJ.BURST_POOL = {
  neutral: [['invert', {}], ['bwhalftone', {}], ['speedburst', {}], ['faceneg', {}], ['sumi', {}], ['flash', { col: '#ffffff' }], ['hatch', {}], ['ink', {}]],
  itachi: [['invert', { hue: 0 }], ['bwhalftone', {}], ['speedburst', {}], ['faceneg', { part: 'eye', dist: .4 }], ['sumi', {}], ['redblack', {}], ['mangekyo', {}], ['flash', { col: '#d81e26' }]],
  julius: [['invert', { hue: 180 }], ['bwhalftone', {}], ['speedburst', {}], ['faceneg', {}], ['ink', { col: '#f6d36a' }], ['goldtime', {}], ['clockfreeze', {}], ['flash', { col: '#f6d36a' }]],
  clash: [['invert', {}], ['dualsplit', { col: '#d81e26', col2: '#f6d36a' }], ['bwhalftone', {}], ['speedburst', {}], ['faceneg', {}], ['sumi', {}], ['flash', { col: '#ffffff' }], ['redblack', {}]],
};
IJ.burst = (o = {}) => { const fr = clamp(Math.round(o.frames || 16), 6, 30), pool = (IJ.BURST_POOL[o.who] || IJ.BURST_POOL.neutral).filter(([s]) => (o.face !== false || s !== 'faceneg') && IMPACT[s]), seed = o.seed || 1;
  const order = pool.map((x, i) => ({ x, r: i === 0 ? -1 : hash(seed * 7.3 + i * 3.1) })).sort((a, b) => a.r - b.r).map(e => e.x), out = []; let n = 0, i = 0;
  while (n < fr) { const [s, p] = order[i % order.length], len = Math.min(fr - n, 1 + Math.floor(hash(seed + i * 5.7) * 3)); if (out.length && out[out.length - 1].s === s) { i++; continue; } out.push({ s, n: len, p }); n += len; i++; }
  return out; };
IMPACT_SEQ.BURST = IJ.burst({ frames: 16, seed: 3 });
IMPACT_SEQ.BURST_ITA = IJ.burst({ frames: 16, who: 'itachi', seed: 5 });
IMPACT_SEQ.BURST_JUL = IJ.burst({ frames: 16, who: 'julius', seed: 7 });
IMPACT_SEQ.BURST_CLASH = IJ.burst({ frames: 18, who: 'clash', seed: 11 });

// ------------------------------------------------------------------------------------------------ impact_requests.md: pattern-coded BURSTs + new single styles
/* burstSeq(pattern, {who:'itachi'|'julius'|'clash', rev, fig, part}) : 'W1-N2-H2-S2-F2-G1-K2' -> steps.  Codes: W flash | N invert (hue red/gold by who) | H hatch halftone | S speedburst
   (rev: lines run backwards = radial) | F face-invert close-up (fig index, part 'eyes') | K sumi | C chroma | R / RB redblack | G gold overexpose | BLK black | D desat | L ink lineart.  */
function burstSeq(pattern, o = {}) { const who = o.who, hue = who === 'julius' ? 180 : who === 'itachi' ? 0 : 0, out = [];
  for (const tok of String(pattern).split('-')) { const m = /^([A-Z]+)(\d+)$/.exec(tok.trim()); if (!m) continue; const c = m[1], n = +m[2]; let st;
    switch (c) { case 'W': st = { s: 'flash', p: { col: '#ffffff' } }; break; case 'N': st = { s: 'invert', p: { hue: who === 'julius' ? 200 : 0, lines: 70 } }; break; case 'H': st = { s: 'hatch', p: { splat: 12, accent: who === 'itachi' ? '#d81a28' : who === 'julius' ? '#ffd36a' : null } }; break;
      case 'S': st = o.rev ? { s: 'radial', p: { zoom: -.12, lineCol: '#ffd36a' } } : { s: 'speedburst', p: {} }; break; case 'F': st = { s: 'faceneg', p: { part: o.part || 'eyes', fig: o.fig || 0, dist: o.part === 'face' ? .6 : .42 } }; break;
      case 'K': st = { s: 'sumi', p: {} }; break; case 'C': st = { s: 'chroma', p: { d: 22 } }; break; case 'R': case 'RB': st = o.split ? { s: 'dualsplit', p: { col: '#d81a28', col2: '#ffd36a' } } : { s: 'redblack', p: { col: '#d81a28' } }; break;
      case 'G': st = o.split ? { s: 'dualsplit', p: { col: '#d81a28', col2: '#ffd36a' } } : { s: 'overexpose', p: { col: '#ffd36a', b: 2.0 } }; break; case 'BLK': st = { s: 'blackaccent', p: { accent: who === 'julius' ? '#ffd36a' : '#6a2a9a' } }; break;
      case 'D': st = { s: 'desat', p: {} }; break; case 'L': st = { s: 'ink', p: {} }; break; default: st = { s: 'invert', p: {} }; }
    if (!IMPACT[st.s]) st = { s: 'invert', p: {} }; out.push(Object.assign(st, { n })); } void hue; return out; }
IJ.BURST_STYLE = {   // shots.json style name -> {who, rev, split, part}
  FIRST_CLASH: { who: 'clash' }, GENJUTSU_BURST: { who: 'itachi', part: 'eyes' }, AMATERASU_BURST: { who: 'itachi', part: 'face' }, REWIND_BURST: { who: 'julius', rev: true },
  SUSANOO_BURST: { who: 'itachi', part: 'eyes' }, MANAZONE_BURST: { who: 'julius' }, CLASH_BURST: { who: 'clash', split: true },
};
for (const [name, cfg] of Object.entries({ FIRST_CLASH: 'W1-N2-H2-S2-F2-G1-K2', GENJUTSU_BURST: 'R1-N2-H2-F2-K2-W1-R2', AMATERASU_BURST: 'BLK1-N2-R2-H2-F2-K2-W1', REWIND_BURST: 'G1-N2-W1-H2-S2-C2-G2',
  SUSANOO_BURST: 'R1-N2-H2-S2-F2-K2-W1', MANAZONE_BURST: 'G1-N2-W1-H2-S2-C2-G2', CLASH_BURST: 'W1-N2-R2-G2-H2-S2-F1' })) IMPACT_SEQ[name] = burstSeq(cfg, IJ.BURST_STYLE[name]);
// single styles
IMPACT.lightningneg = (c, g, f, p, k) => { if (k === 0) return fillAll(g, '#ffffff'); IMPACT.invert(c, g, f, Object.assign({ hue: 210, lines: 50, lineCol: '#ffffff' }, p), k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = hash(i * 3 + k) * W, y = hash(i * 7 + k) * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 40); g.stroke(); } g.restore(); };
IMPACT.rulestamp = (c, g, f, p, k) => { fillAll(g, '#000000'); const sil = impFigs(f, 'rgba(0,0,0,0)', '#ffffff', 2.6); rawDraw(g, sil); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const q = impFocus(f, p); g.globalCompositeOperation = 'lighter'; glow(g, p.tx || W * .85, p.ty || H * .3, 120 * (1 - k * .3), '#ff9a3a', .6); g.restore(); };
IMPACT.crowswirl = (c, g, f, p, k) => { IMPACT.redblack(c, g, f, Object.assign({ col: '#d81a28' }, p), k); const q = impFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); for (let i = 0; i < 40; i++) { const an = i / 40 * TAU + k * .5, rr = (520 - k * 120) * (.4 + .6 * hash(i * 3)); ijDrawCrow(g, q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr * .6, 40 + 30 * hash(i), k * 3 + i, an + HP, { flip: Math.sin(an) > 0, eye: true }); } g.restore(); };
IMPACT.eyered = (c, g, f, p, k) => { IMPACT.mangekyo(c, g, f, Object.assign({ mk: p.mk || 0, sil: false }, p), k); if (k === (p.negAt == null ? 1 : p.negAt)) { const t = filtered(c, 'invert(1)'); rawDraw(g, t); } };
IMPACT.mangekyoeye = (c, g, f, p, k) => { g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.fillStyle = '#050002'; g.fillRect(0, 0, W, H); mangekyoInsert(g, f.T, { x: W / 2, y: H / 2, w: W, h: H * .62, mk: 1, k: 1, spin: k * .4, bleed: .6 + k * .15 }); g.restore(); };
IMPACT.goldeyes = (c, g, f, p, k) => { g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.fillStyle = '#0a0c1a'; g.fillRect(0, 0, W, H); const R = 300 + k * 30, x = W / 2, y = H / 2; g.fillStyle = '#f2e8dc'; g.beginPath(); g.moveTo(x - R * 2.3, y); g.quadraticCurveTo(x, y - R * 1.5, x + R * 2.3, y); g.quadraticCurveTo(x, y + R * 1.2, x - R * 2.3, y); g.fill();
  g.save(); g.clip(); g.fillStyle = radial(g, x, y, R, [[0, '#fff6c8'], [.6, '#ffd36a'], [1, '#8a5a10']]); g.beginPath(); g.arc(x, y, R * .95, 0, TAU); g.fill(); ijClockFace(g, x, y, R * .85, k * .02 + .2, 1, '#3a2404'); g.restore(); g.strokeStyle = '#1a1010'; g.lineWidth = 16; g.beginPath(); g.moveTo(x - R * 2.35, y); g.quadraticCurveTo(x, y - R * 1.55, x + R * 2.35, y); g.stroke(); g.restore(); };
IMPACT.timefreeze = (c, g, f, p, k) => { const t = filtered(c, 'grayscale(1) invert(1) contrast(1.3)'); rawDraw(g, t); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); ijClockFace(g, W / 2, H / 2, 360 + k * 40, .1, .95, '#ffd36a'); g.fillStyle = '#ffffff'; for (let i = 0; i < 220; i++) { g.beginPath(); g.arc(hash(i * 3) * W, hash(i * 7) * H, 2 + 2 * hash(i), 0, TAU); g.fill(); } g.restore(); };
IMPACT.crowburst = (c, g, f, p, k) => { IMPACT.crowscatter(c, g, f, Object.assign({ bg: '#ffffff' }, p), k); const q = impFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); glow(g, q.x, q.y, 140, '#d81a28', .9); g.restore(); };
IMPACT.goldspeed = (c, g, f, p, k) => { fillAll(g, '#1a1408'); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); fxSpeedLines(g, f.T + k, Object.assign({ n: 150, col: '#ffd36a', inner: 260, w: 9, alpha: 1 }, impFocus(f, p))); g.restore(); for (let i = 3; i >= 1; i--) rawDraw(g, impSil('chars', '#ffd36a'), -i * 26 * OUT.scale, 0, .25 * (4 - i) / 3); rawDraw(g, impSil('chars', '#0a0806')); };
IMPACT.firebloom = (c, g, f, p, k) => { IMPACT.overexpose(c, g, f, { b: 2.2, c: 1.5, s: 2 }, k); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ff8a2a'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#140604', 2.4)); };
IMPACT.emberage = (c, g, f, p, k) => { IMPACT.desat(c, g, f, { c: 1.4, b: .9, keep: false }, k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); ijClockFace(g, W / 2, H / 2, 300, k * .3, .55, '#d8d0c8'); g.restore(); };
IMPACT.shadowshuriken = (c, g, f, p, k) => { IMPACT.crimsonline(c, g, f, Object.assign({ col: '#d81a28' }, p), k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); const q = impFocus(f, p); g.globalAlpha = 1; g.fillStyle = '#000'; for (const [dx, dy, r] of [[0, 0, 150], [60, 30, 140]]) { g.save(); g.translate(q.x + dx, q.y + dy); g.rotate(k * .4 + dx * .01); g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * HP; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(Math.cos(a + HP / 2) * r * .28, Math.sin(a + HP / 2) * r * .28); } g.closePath(); g.fill(); g.restore(); } g.restore(); };
IMPACT.desatflame = (c, g, f, p, k) => { IMPACT.desat(c, g, f, Object.assign({ accent: '#6a2a9a' }, p), k); };
IMPACT.giantsil = (c, g, f, p, k) => { IMPACT.rimsil(c, g, f, Object.assign({ col: '#3a0408', col2: '#c8202a', rimCol: '#ffb08a', sil: '#050002' }, p), k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.strokeStyle = '#ffe0e0'; g.lineWidth = 4; let x = W * (.2 + .6 * hash(k + 3)), y = 0; g.beginPath(); g.moveTo(x, y); while (y < H * .6) { x += (hash(y + k) - .5) * 80; y += 40; g.lineTo(x, y); } g.stroke(); g.restore();
  rawDraw(g, impSil('glow', '#050002'), 0, 0, .9); };
IMPACT.manasonar = (c, g, f, p, k) => { fillAll(g, '#000000'); const q = impFocus(f, p); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.strokeStyle = '#ffd36a'; for (let i = 0; i < 6; i++) { g.lineWidth = 6 - i * .7; g.globalAlpha = 1 - i * .14; g.beginPath(); g.ellipse(q.x, q.y + 120, 140 + i * 160 + k * 60, (140 + i * 160 + k * 60) * .35, 0, 0, TAU); g.stroke(); } g.restore(); rawDraw(g, impFigs(f, 'rgba(0,0,0,0)', '#ffffff', 1.8)); };
IMPACT.powercardI = (c, g, f, p, k) => { IMPACT.invert(c, g, f, { hue: 0, lines: 60, lineCol: '#d81a28' }, k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); g.globalAlpha = .18; g.translate(W * .7, H * .5); g.scale(260, 260); IJ.cloud(g); g.restore(); };
IMPACT.powercardJ = (c, g, f, p, k) => { IMPACT.duotone(c, g, f, { dark: '#1a2050', light: '#ffd36a', th: 120 }, k); g.save(); g.setTransform(OUT.scale, 0, 0, OUT.scale, 0, 0); ijClockFace(g, W * .3, H * .5, 380, .1, .25, '#fff2c0'); g.restore(); };
Object.assign(IMPACT_SEQ, {
  LIGHTNING_NEG: [{ s: 'lightningneg', n: 3 }], RULE_STAMP: [{ s: 'rulestamp', n: 3 }], CROW_SWIRL: [{ s: 'crowswirl', n: 3 }], EYE_RED: [{ s: 'eyered', n: 3 }],
  POWER_CARD_I: [{ s: 'flash', n: 1, p: { col: '#d81a28' } }, { s: 'powercardI', n: 2 }], POWER_CARD_J: [{ s: 'flash', n: 1, p: { col: '#ffd36a' } }, { s: 'powercardJ', n: 2 }],
  TIME_FREEZE: [{ s: 'flash', n: 1, p: { col: '#fff6e0' } }, { s: 'timefreeze', n: 3 }], CROW_BURST: [{ s: 'flash', n: 1 }, { s: 'crowburst', n: 3 }], GOLD_SPEED: [{ s: 'goldspeed', n: 3 }],
  FIRE_BLOOM: [{ s: 'firebloom', n: 2 }, { s: 'ink', n: 1 }], EMBER_AGE: [{ s: 'emberage', n: 2 }], SHADOW_SHURIKEN: [{ s: 'shadowshuriken', n: 3 }], MANGEKYO_EYE: [{ s: 'mangekyoeye', n: 4 }],
  DESAT_FLAME: [{ s: 'desatflame', n: 3 }], GIANT_SIL: [{ s: 'giantsil', n: 3 }], MANA_SONAR: [{ s: 'manasonar', n: 3 }], GOLD_EYES: [{ s: 'goldeyes', n: 3 }],
  DUAL_TONE: [{ s: 'dualsplit', n: 3, p: { col: '#d81a28', col2: '#ffd36a' } }], RED_BLACK_SPLIT: [{ s: 'dualsplit', n: 2, p: { col: '#140406', col2: '#1a2050' } }, { s: 'dualsplit', n: 1, p: { col: '#d81a28', col2: '#ffd36a' } }],
  WORLD_BREAKER: [{ s: 'flash', n: 1 }, { s: 'dualsplit', n: 2, p: { col: '#d81a28', col2: '#ffd36a' } }, { s: 'shatter', n: 2 }],
});
