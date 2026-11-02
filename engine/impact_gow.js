/* engine/impact_gow.js (agent E, gowther-dazai-urahara) - impact styles + sequences for Gowther / Dazai / Urahara (pre/shots.json meta.impact_styles).
   STYLES (IMPACT[name](comp, g, f, p, k)):
     puppetstr    black frame, hundreds of pink marionette strings tighten from the top onto the figures' wrists/head/knees, figures as white silhouettes,
                  marionette stutter (p.jerk: frame offset pattern)
     stringsnap   strings snap (short recoiling pieces), pink negative, 1-frame sideways jolt
     memrewrite   the picture breaks into pink-edged SQUARES (Gowther's square speech bubbles) that flip like cards; the back of each card is a
                  different memory picture (p.cols, p.flip 0..1 override)
     memcrack     a pink film over the picture cracks like glass and falls in shards, revealing the real (unfiltered) image underneath
     dolljoints   b/w manga panels of porcelain ball joints (close crops of the figure + drawn joints), white crack lines, pink accent
     nightmareink pink ink pours from the top edge, turns black, sumi-e nightmare with one staring eye in the middle
     stitchrebuild the frame is cut into strips, re-sewn in a different order with red stitches, black-red grade
     hijackrings  two pink rings (Herritt bent) in the centre, the target's head seen through them as a pink negative, concentric waves
     memrewind    VHS rewind: bands, white noise, the frame wipes to a white page
     gowglitch    hard data-mosh glitch (RGB split, block shifts) in pink/cyan - for 1-frame Invasion hits
     bluepaper    Dazai's reality: blue-white paper, figures as ink lineart, page lines, 人間失格 small in the corner (calmer than pagewhite)
     redstitchsil red field, black silhouettes outlined by gold seams + red stitches (Urahara Bankai)
     fanflash     Urahara's fan snaps open full-frame: white paper fan fills the frame (p.text on it), black ink, red accent
   SEQUENCES (shots.json names): PUPPET_STRINGS STRING_SNAP MEMORY_REWRITE MEMORY_CRACK DOLL_JOINTS NIGHTMARE_INK STITCH_REBUILD HIJACK_RINGS MEMORY_REWIND
     character series: gow_invasion gow_searchlight gow_rewrite gow_jack gow_blackout gow_herritt gow_lostworld gow_doll gow_broken
                       daz_nlh_doll (Dazai's touch on Gowther) daz_reality ura_okiro ura_fan ura_bankai_stitch ura_shitone ura_gigai clash_gdu         */
'use strict';
const GOWIMP = { pink: '#ff7ad8', violet: '#c86bff', red: '#b3122a', blue: '#cfe8ff' };
function gowFigJoints(f, names) { const out = []; for (const it of f._figs) { if (it.opt.hidden) continue; const S = figSkel(it.F, it.opt.t != null ? it.opt.t : f.lt); for (const j of names) { const p = S.J[j]; if (!p) continue; const q = project(j === 'head' ? vAdd(p, [0, S.B.headR * 1.1, 0]) : p); if (q) out.push(q); } } return out; }
IMPACT.puppetstr = (c, g, f, p, k) => {
  const jerk = p.jerk == null ? [0, 0, 14, 14, -10, -10] : p.jerk, dy = jerk[k % jerk.length] || 0;
  fillAll(g, p.bg || '#050307'); g.save(); g.translate(0, dy); rawDraw(g, impSil('chars', p.sil || '#ffffff'), 0, dy * OUT.scale);
  const pts = gowFigJoints(f, ['wrL', 'wrR', 'head', 'knL', 'knR', 'elL', 'elR']); const r = rng(p.seed || 5);
  g.globalCompositeOperation = 'lighter'; for (let i = 0; i < (p.n || 220); i++) { const tgt = pts.length ? pts[i % pts.length] : { x: W / 2, y: H / 2 }, x0 = r() * W * 1.2 - W * .1; g.strokeStyle = rgba(GOWIMP.pink, .15 + .45 * r()); g.lineWidth = r() < .15 ? 2.5 : 1; g.beginPath(); g.moveTo(x0, -20); g.lineTo(tgt.x + (r() - .5) * 18, tgt.y - dy * 0 + (r() - .5) * 10); g.stroke(); }
  for (const q of pts) glow(g, q.x, q.y, 26, GOWIMP.pink, .7); g.restore(); };
IMPACT.stringsnap = (c, g, f, p, k) => {
  const src = filtered(c, 'invert(1) hue-rotate(110deg) saturate(1.6)'); fillAll(g, '#000'); rawDraw(g, src, (k === 0 ? 46 : 0) * OUT.scale, 0); g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(GOWIMP.pink, .35); g.fillRect(0, 0, W, H); g.restore();
  const pts = gowFigJoints(f, ['wrL', 'wrR', 'head', 'knL', 'knR']), r = rng(9); g.save(); g.lineCap = 'round'; for (let i = 0; i < 60; i++) { const q = pts.length ? pts[i % pts.length] : { x: W / 2, y: H / 2 }, x0 = r() * W, L = 60 + r() * 160, rec = (k + 1) * 50; const ax = lerp(x0, q.x, .5), ay = lerp(-20, q.y, .5) - rec * r(); g.strokeStyle = '#fff4fc'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + (r() - .5) * 40, ay - L * .5, ax + (r() - .5) * 60, ay - L); g.stroke(); }
  g.restore(); };
IMPACT.memrewrite = (c, g, f, p, k) => {
  const src = copyComp(c), cols = p.cols || 8, cw = W / cols, rows = Math.ceil(H / cw), F = impFocus(f, p); fillAll(g, '#1a0a18');
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = i * cw, y = j * cw, d = Math.hypot(x + cw / 2 - F.x, y + cw / 2 - F.y) / 1400, fl = p.flip != null ? p.flip : clamp((k + 1) / 3 - d * .5 + hash(i * 7 + j * 3) * .7 - .3, 0, 1), sx = Math.cos(fl * Math.PI);
    g.save(); g.translate(x + cw / 2, y + cw / 2); g.scale(Math.max(.02, Math.abs(sx)), 1); const back = sx < 0; g.beginPath(); g.rect(-cw / 2 + 3, -cw / 2 + 3, cw - 6, cw - 6); g.clip();
    if (back) { g.drawImage(gowMemPic(i * 13 + j * 5), -cw / 2, -cw / 2, cw, cw); g.fillStyle = rgba(GOWIMP.pink, .25); g.fillRect(-cw / 2, -cw / 2, cw, cw); } else g.drawImage(src, x * OUT.scale, y * OUT.scale, cw * OUT.scale, cw * OUT.scale, -cw / 2, -cw / 2, cw, cw);
    g.restore(); g.save(); g.translate(x + cw / 2, y + cw / 2); g.scale(Math.max(.02, Math.abs(sx)), 1); g.lineWidth = 4; g.strokeStyle = back ? '#ffffff' : GOWIMP.pink; g.strokeRect(-cw / 2 + 3, -cw / 2 + 3, cw - 6, cw - 6); g.restore(); } };
IMPACT.memcrack = (c, g, f, p, k) => {
  const real = copyComp(c), pinkT = layer('gowPinkT'), pg = pinkT.getContext('2d'); pg.setTransform(1, 0, 0, 1, 0, 0); pg.filter = 'sepia(.6) saturate(2.2) hue-rotate(280deg) brightness(1.08)'; pg.drawImage(c, 0, 0); pg.filter = 'none';
  const F = impFocus(f, p), cells = sadShards((p.seed || 23), p.n || 40, F), br = (k + 1) / 4; rawDraw(g, real);
  for (const cl of cells) { const reach = cl.d / 1100, go = clamp((br - reach * .5) / .5, 0, 1), e = go * go; if (go >= 1) continue; g.save(); g.translate(cl.c[0], cl.c[1] + 700 * e); g.rotate((cl.h - .5) * e * 1.5); g.translate(-cl.c[0], -cl.c[1]); polyPath(g, cl.poly); g.save(); g.clip(); g.drawImage(pinkT, 0, 0, W, H); g.fillStyle = rgba('#ffffff', .12 * cl.h); g.fillRect(0, 0, W, H); g.restore(); polyPath(g, cl.poly); g.lineWidth = 3; g.strokeStyle = '#ffe8f6'; g.stroke(); g.restore(); }
  g.save(); g.globalCompositeOperation = 'lighter'; fxImpactStar(g, F.x, F.y, 200 - k * 30, k, '#ffffff', 4); g.restore(); };
IMPACT.dolljoints = (c, g, f, p, k) => {
  const src = filtered(c, 'grayscale(1) contrast(1.9) brightness(1.1)'); fillAll(g, '#f4f0ec'); const pts = gowFigJoints(f, p.joints || ['elR', 'shL', 'knL', 'wrR']), panels = [[30, 30, 900, 500], [960, 30, 930, 500], [30, 560, 600, 490], [660, 560, 1230, 490]];
  panels.forEach(([x, y, w, h], i) => { const q = pts[(i + k) % Math.max(1, pts.length)] || { x: W / 2, y: H / 2 }, z = 2.6 + i * .3; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x + w / 2, y + h / 2); g.scale(z, z); g.translate(-q.x, -q.y); g.drawImage(src, 0, 0, W, H); g.restore();
    g.save(); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .22; g.lineWidth = 7; g.strokeStyle = '#141018'; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, R * .78, 0, TAU); g.stroke(); g.strokeStyle = GOWIMP.pink; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R * 1.15, -1, .4); g.stroke();
    const r = rng(i * 7 + k); g.strokeStyle = '#ffffff'; g.lineWidth = 3; for (let n = 0; n < 4; n++) { let px = cx + (r() - .5) * R, py = cy + (r() - .5) * R; g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 5; s++) { px += (r() - .5) * 60; py += (r() - .5) * 60; g.lineTo(px, py); } g.stroke(); } g.restore();
    g.lineWidth = 8; g.strokeStyle = '#141018'; g.strokeRect(x, y, w, h); }); };
IMPACT.nightmareink = (c, g, f, p, k) => {
  const src = filtered(c, 'grayscale(1) contrast(2.2) brightness(.8)'); rawDraw(g, src); const u = (k + 1) / (p.frames || 4);
  g.save(); for (let i = 0; i < 26; i++) { const x = i / 25 * W, L = (180 + hash(i * 3) * 600) * Math.min(1, u * 1.6), w = 40 + hash(i * 7) * 70; const gr = g.createLinearGradient(0, 0, 0, L); gr.addColorStop(0, GOWIMP.pink); gr.addColorStop(.45, '#5a1048'); gr.addColorStop(1, '#050205'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x + w / 2, 0); g.lineTo(x + w * .2, L); g.arc(x, L, w * .22, 0, Math.PI); g.closePath(); g.fill(); }
  if (u > .4) { g.globalAlpha = clamp((u - .4) / .4, 0, 1); g.fillStyle = 'rgba(5,2,5,.75)'; g.fillRect(0, 0, W, H); const F = impFocus(f, p); g.fillStyle = '#f4ece8'; g.beginPath(); g.ellipse(F.x, F.y, 300, 120, 0, 0, TAU); g.fill(); g.fillStyle = '#c8203a'; g.beginPath(); g.arc(F.x, F.y, 95, 0, TAU); g.fill(); g.fillStyle = '#050205'; g.beginPath(); g.arc(F.x, F.y, 45, 0, TAU); g.fill(); g.strokeStyle = '#050205'; g.lineWidth = 14; g.beginPath(); g.ellipse(F.x, F.y, 300, 120, 0, 0, TAU); g.stroke(); }
  g.restore(); };
IMPACT.stitchrebuild = (c, g, f, p, k) => {
  const src = filtered(c, 'saturate(1.6) contrast(1.3)'), n = p.strips || 7, r = rng((p.seed || 3) + k * 11), order = [...Array(n).keys()].sort(() => r() - .5), sh = H / n; fillAll(g, '#0b0b0e');
  for (let i = 0; i < n; i++) { const s = order[i], off = (r() - .5) * 120 * (1 - k * .3); g.save(); g.beginPath(); g.rect(0, i * sh, W, sh); g.clip(); g.drawImage(src, 0, s * sh * OUT.scale, c.width, sh * OUT.scale, off, i * sh, W, sh); g.restore(); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#d02030'; g.fillRect(0, 0, W, H); g.restore();
  for (let i = 1; i < n; i++) { const pts = []; for (let x = -20; x <= W + 20; x += 120) pts.push({ x, y: i * sh + Math.sin(x * .01 + i) * 4 }); fxStitches(g, pts, 1, { dur: .5, w: 14, col: '#ff3b4e', seam: '#e8c47a' }); } };
IMPACT.hijackrings = (c, g, f, p, k) => {
  const neg = filtered(c, 'invert(1) hue-rotate(120deg) saturate(1.8)'); fillAll(g, '#07040a'); const F = impFocus(f, p), head = gowFigJoints(f, ['head'])[p.target || 0] || F, R = 230 + k * 20;
  for (const sg of [-1, 1]) { const cx = W / 2 + sg * R * .62, cy = H / 2; g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); g.translate(cx, cy); g.scale(3.4, 3.4); g.translate(-head.x, -head.y + 30); g.drawImage(neg, 0, 0, W, H); g.restore(); }
  g.save(); g.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) { const cx = W / 2 + sg * R * .62; g.lineWidth = 26; g.strokeStyle = rgba(GOWIMP.violet, .5); g.beginPath(); g.arc(cx, H / 2, R, 0, TAU); g.stroke(); g.lineWidth = 9; g.strokeStyle = '#fff4ff'; g.stroke(); }
  for (let i = 0; i < 5; i++) { g.lineWidth = 3; g.strokeStyle = rgba(GOWIMP.pink, .6 - i * .1); g.beginPath(); g.arc(W / 2, H / 2, R * 1.4 + i * 90 + k * 40, 0, TAU); g.stroke(); } g.restore(); };
IMPACT.memrewind = (c, g, f, p, k) => {
  const src = copyComp(c), u = (k + 1) / (p.frames || 4), r = rng(k * 5 + 1); rawDraw(g, src); g.save();
  for (let i = 0; i < 16; i++) { const y = r() * H, hh = 4 + r() * 30; g.drawImage(src, 0, y * OUT.scale, c.width, hh * OUT.scale, (r() - .3) * 140, y, W, hh); }
  g.fillStyle = `rgba(255,255,255,${.25 + .5 * u})`; for (let i = 0; i < 5; i++) { const y = ((i * .23 + k * .17) % 1) * H; g.fillRect(0, y, W, 20 + r() * 40); }
  const tile = gowNoiseTile(k % 6); g.globalAlpha = .35; g.globalCompositeOperation = 'overlay'; for (let y = 0; y < H; y += 256) for (let x = 0; x < W; x += 256) g.drawImage(tile, x, y); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = clamp((u - .5) * 2, 0, 1); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(150,180,220,.5)'; g.lineWidth = 2; for (let y = 60; y < H; y += 52) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore(); g.save(); g.fillStyle = '#ffffff'; g.font = '700 54px "Inter", sans-serif'; g.fillText('◀◀', 70, 110); g.restore(); };
IMPACT.gowglitch = (c, g, f, p, k) => { const src = copyComp(c), r = rng((p.seed || 1) + k * 17); rawDraw(g, src); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .7; g.filter = 'sepia(1) saturate(8) hue-rotate(-60deg)'; g.drawImage(src, 18, 0, W, H); g.filter = 'sepia(1) saturate(8) hue-rotate(150deg)'; g.drawImage(src, -18, 0, W, H); g.filter = 'none'; g.restore();
  for (let i = 0; i < 18; i++) { const y = r() * H, hh = 8 + r() * 60, x = r() * W, w = 100 + r() * 600; g.drawImage(src, x * OUT.scale, y * OUT.scale, w * OUT.scale, hh * OUT.scale, x + (r() - .5) * 200, y, w, hh); if (r() < .3) { g.fillStyle = r() < .5 ? rgba(GOWIMP.pink, .6) : 'rgba(80,220,255,.5)'; g.fillRect(x, y, w, hh * .3); } } };
IMPACT.bluepaper = (c, g, f, p, k) => { fillAll(g, '#f6f8fc'); g.save(); g.strokeStyle = rgba('#a8c4e0', .55); g.lineWidth = 2; for (let y = 50; y < H; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.strokeStyle = rgba('#e89aa8', .6); g.beginPath(); g.moveTo(160, 0); g.lineTo(160, H); g.stroke(); g.restore();
  rawDraw(g, impFigs(f, '#f6f8fc', p.ink || '#24426e', 1.6)); g.save(); g.fillStyle = rgba('#24426e', .55); g.font = '700 54px "IPAMincho", serif'; g.textAlign = 'right'; g.fillText('人間失格', W - 60, H - 60); g.restore(); };
IMPACT.redstitchsil = (c, g, f, p, k) => { fillAll(g, '#8a0e1c'); const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * .7); gr.addColorStop(0, 'rgba(255,80,90,.5)'); gr.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  rawDraw(g, impSil('chars', '#e8c47a'), 5, 5); rawDraw(g, impSil('chars', '#e8c47a'), -5, -5); rawDraw(g, impSil('chars', '#0b0b0e'));
  for (let i = 0; i < 4; i++) { const pts = []; for (let x = -40; x <= W + 40; x += 160) pts.push({ x, y: 140 + i * 260 + Math.sin(x * .006 + i * 2) * 60 }); fxStitches(g, pts, 1, { dur: .3, w: 12, col: '#ff3b4e' }); } };
IMPACT.fanflash = (c, g, f, p, k) => { const src = copyComp(c); rawDraw(g, src); g.save(); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H); const cx = W / 2, cy = H * 1.1, R = H * (.95 + k * .03), span = Math.min(2.6, 1.6 + k * .5);
  for (let i = 0; i < 18; i++) { const a0 = -HP - span / 2 + i / 18 * span, a1 = a0 + span / 18; g.fillStyle = i % 2 ? '#f6f2e8' : '#ddd6c6'; g.beginPath(); g.moveTo(cx + Math.cos(a0) * R * .25, cy + Math.sin(a0) * R * .25); g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); g.lineTo(cx + Math.cos(a1) * R * .25, cy + Math.sin(a1) * R * .25); g.closePath(); g.fill(); }
  g.lineWidth = 8; g.strokeStyle = '#141018'; g.beginPath(); g.arc(cx, cy, R, -HP - span / 2, -HP + span / 2); g.stroke(); g.strokeStyle = '#6a4a2e'; g.lineWidth = 4; for (let i = 0; i <= 18; i += 2) { const a = -HP - span / 2 + i / 18 * span; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * .25, cy + Math.sin(a) * R * .25); g.stroke(); }
  if (p.text) { g.fillStyle = '#141018'; g.font = `900 ${p.text.length > 4 ? 120 : 200}px "IPAMincho", "IPAGothic", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.text, cx, cy - R * .62); } g.fillStyle = GOWIMP.red; g.beginPath(); g.arc(cx, cy - R * .25, 22, 0, TAU); g.fill(); g.restore(); };
['dolljoints', 'bluepaper', 'redstitchsil'].forEach(s => PAPER_STYLES.add(s));

Object.assign(IMPACT_SEQ, {
  PUPPET_STRINGS: [{ s: 'puppetstr', n: 2 }, { s: 'puppetstr', n: 1, p: { jerk: [22] } }, { s: 'puppetstr', n: 2, p: { jerk: [-8] } }],
  STRING_SNAP: [{ s: 'stringsnap', n: 1 }, { s: 'flash', n: 1, p: { col: '#ffe0f4' } }, { s: 'stringsnap', n: 1 }],
  MEMORY_REWRITE: [{ s: 'gowglitch', n: 1 }, { s: 'memrewrite', n: 3 }, { s: 'memrewrite', n: 1, p: { flip: 1 } }],
  MEMORY_CRACK: [{ s: 'memcrack', n: 4 }],
  DOLL_JOINTS: [{ s: 'dolljoints', n: 3 }, { s: 'flash', n: 1 }],
  NIGHTMARE_INK: [{ s: 'nightmareink', n: 4, p: { frames: 4 } }],
  STITCH_REBUILD: [{ s: 'stitchrebuild', n: 2 }, { s: 'redstitchsil', n: 1 }, { s: 'stitchrebuild', n: 1, p: { strips: 4 } }],
  HIJACK_RINGS: [{ s: 'hijackrings', n: 3 }, { s: 'flash', n: 1, p: { col: '#ffd8f4' } }],
  MEMORY_REWIND: [{ s: 'memrewind', n: 4, p: { frames: 4 } }],
  gow_invasion: [{ s: 'gowglitch', n: 1 }, { s: 'memrewrite', n: 2 }, { s: 'kanji', n: 2, p: { char: '侵入', col: '#ff7ad8', col2: '#fff0fa', outline: '#2a0420', size: 380 } }],
  gow_searchlight: [{ s: 'flash', n: 1, p: { col: '#ffe0f4' } }, { s: 'gowglitch', n: 1 }],
  gow_rewrite: [{ s: 'blackaccent', n: 2, p: { accent: '#ff7ad8', lines: 70 } }, { s: 'memrewrite', n: 2 }, { s: 'flash', n: 1 }],
  gow_jack: [{ s: 'puppetstr', n: 2 }, { s: 'kanji', n: 2, p: { char: '傀儡', col: '#ff7ad8', col2: '#fff0fa', outline: '#2a0420', size: 380 } }],
  gow_blackout: [{ s: 'black', n: 1 }, { s: 'blackaccent', n: 2, p: { accent: '#c86bff', lines: 0 } }, { s: 'black', n: 1 }],
  gow_herritt: [{ s: 'flash', n: 1, p: { col: '#f0d8ff' } }, { s: 'rimsil', n: 2, p: { col: '#ffd8f4', col2: '#7a2ad0', rimCol: '#ffffff' } }],
  gow_lostworld: [{ s: 'memrewind', n: 3, p: { frames: 3 } }, { s: 'whiteout', n: 2 }],
  gow_doll: [{ s: 'dolljoints', n: 2 }, { s: 'stringsnap', n: 1 }],
  gow_broken: [{ s: 'hatch', n: 2, p: { accent: '#ff7ad8' } }, { s: 'dolljoints', n: 1 }],
  daz_nlh_doll: [{ s: 'pagewhite', n: 2 }, { s: 'stringsnap', n: 1 }, { s: 'bluepaper', n: 2 }],
  daz_reality: [{ s: 'bluepaper', n: 3 }],
  ura_okiro: [{ s: 'blackaccent', n: 2, p: { accent: '#d8243a', lines: 60 } }, { s: 'kanji', n: 3, p: { char: '起きろ', col: '#d8243a', col2: '#ffb0b8', outline: '#1a0004', size: 300 } }],
  ura_fan: [{ s: 'fanflash', n: 3 }],
  ura_bankai_stitch: [{ s: 'black', n: 1 }, { s: 'redstitchsil', n: 2 }, { s: 'kanji', n: 3, p: { char: '観音開紅姫改メ', col: '#d8243a', col2: '#fff0f0', outline: '#000', size: 200 } }, { s: 'stitchrebuild', n: 2 }],
  ura_shitone: [{ s: 'speedburst', n: 1 }, { s: 'crimsonline', n: 2, p: { ang: .5 } }, { s: 'whiteout', n: 1 }],
  ura_gigai: [{ s: 'flash', n: 1 }, { s: 'hatch', n: 2 }],
  clash_gdu: [{ s: 'flash', n: 1 }, { s: 'dualsplit', n: 2, p: { col: '#ff7ad8', col2: '#cfe8ff' } }, { s: 'invert', n: 1 }],
});
