/* model sheet generator (run through lab.js):  node lab.js out.png @sheets.js-call  -> see make_sheets.sh
   modelSheet(ctx, name, form): turnaround (5 views) + 3 head angles + 12 expressions + forms row        */
function modelSheet(ctx, name, form = 'base', style = 'action3d') {
  const D = CAST[name]; const Wc = ctx.canvas.width, Hc = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f2efe8'; ctx.fillRect(0, 0, Wc, Hc);
  lightReset(); LIGHT.key = vNorm([-.5, .7, .6]); LIGHT.style = style; LIGHT.boil = 0;
  const panel = (x, y, w, h, camFn, drawFn) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const sc = h / 1080; ctx.translate(x + w / 2 - 960 * sc, y); ctx.scale(sc, sc); CAM.set(camFn()); drawFn(); ctx.restore(); };
  ctx.fillStyle = '#1a1420'; ctx.font = '900 54px "Inter Display", sans-serif'; ctx.fillText((D.name || name).toUpperCase() + '  —  ' + form.toUpperCase() + (style === 'hand2d' ? '  ·  HAND2D' : ''), 40, 70);
  ctx.font = '600 22px "Inter", sans-serif'; ctx.fillStyle = '#5a5060'; ctx.fillText('model sheet · bleach-showdown engine · views: front / 3-4 front / side / 3-4 back / back · heads: front / 3-4 / profile · expressions', 40, 104);
  const F = makeFig(D, { form, at: t => pose('stand', { sword: { sheathed: true } }), springWin: 0 });
  const h = D.h || 1.8, views = [0, .78, HP, 2.36, Math.PI];
  views.forEach((az, i) => panel(20 + i * 470, 120, 470, 860, () => ({ pos: orbitPos({ c: [0, h * .5, 0], r: h * 2.45, az, el: .03 }), target: [0, h * .5, 0], fov: 30 }), () => { drawFig(ctx, F, 0); }));
  // ground line
  ctx.strokeStyle = '#b8b0a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, 930); ctx.lineTo(2370, 930); ctx.stroke();
  // heads
  const exprs = D.sheetExprs || ['calm', 'angry', 'smile', 'smirk', 'shock', 'menace', 'pain', 'triumph', 'tears', 'determined', 'laugh', 'rage', 'focused', 'eyesClosed'];
  const headCam = (az, el = .04, d = .95) => () => { const S = figSkel(F, 0), c = S.J.head; return { pos: orbitPos({ c, r: d * h / 1.8, az, el }), target: vAdd(c, [0, -.02, 0]), fov: 30 }; };
  [[0, 'front'], [.7, '3/4'], [HP, 'profile'], [-.6, '3/4 low', -.35], [.5, '3/4 high', .45]].forEach(([az, lab, el], i) => panel(20 + i * 470, 1000, 470, 300, headCam(az, el == null ? .04 : el), () => { drawFig(ctx, F, 0); }));
  exprs.forEach((ex, i) => { const Fe = makeFig(D, { form, at: t => pose('stand', { face: expr(ex), sword: { sheathed: true } }), springWin: 0 }); const x = 20 + (i % 7) * 336, y = 1320 + Math.floor(i / 7) * 200;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, 336, 189); ctx.clip(); ctx.translate(x + 168 - 960 * 189 / 1080, y); ctx.scale(189 / 1080, 189 / 1080); const S = figSkel(Fe, 0); CAM.set({ pos: vAdd(S.J.head, orbitPos({ c: [0, 0, 0], r: .5 * h / 1.8, az: .35, el: .05 })), target: vAdd(S.J.head, [0, -.03, 0]), fov: 30 }); ctx.fillStyle = '#e8e2d8'; ctx.fillRect(0, 0, 1920, 1080); drawFig(ctx, Fe, 0); ctx.restore();
    ctx.fillStyle = '#1a1420'; ctx.font = '700 18px "Inter", sans-serif'; ctx.fillText(ex, x + 8, y + 182); });
}
function formsSheet(ctx, name) {
  const D = CAST[name], forms = Object.keys(D.forms || { base: {} }); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f2efe8'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); lightReset();
  ctx.fillStyle = '#1a1420'; ctx.font = '900 50px "Inter Display", sans-serif'; ctx.fillText((D.name || name).toUpperCase() + ' — FORMS & SIGNATURE POSES', 40, 64);
  const sig = (SIGNATURE[name] || []).slice(0, 8); const w = 2400 / Math.max(forms.length, 1);
  forms.forEach((fm, i) => { const F = makeFig(D, { form: fm, at: t => pose(sig[i % sig.length] || 'guard'), springWin: .3 }); ctx.save(); ctx.beginPath(); ctx.rect(i * w, 90, w, 700); ctx.clip(); { const sc = 700 / 1080; ctx.translate(i * w + w / 2 - 960 * sc, 90); ctx.scale(sc, sc); } const h = D.h || 1.8; CAM.set({ pos: orbitPos({ c: [0, h * .55, 0], r: h * 3.6, az: .5, el: .1 }), target: [0, h * .55, 0], fov: 32 }); drawFig(ctx, F, 1); ctx.restore(); ctx.fillStyle = '#1a1420'; ctx.font = '800 26px "Inter", sans-serif'; ctx.fillText(fm + ' · ' + (sig[i % sig.length] || 'guard'), i * w + 20, 780); });
  sig.forEach((sp, i) => { const F = makeFig(D, { form: (window.SIGNATURE_FORM && SIGNATURE_FORM[name]) || forms[Math.min(forms.length - 1, 1)], at: t => pose(sp), springWin: .3 }); const x = (i % 8) * 300; ctx.save(); ctx.beginPath(); ctx.rect(x, 820, 300, 500); ctx.clip(); { const sc = 500 / 1080; ctx.translate(x + 150 - 960 * sc, 820); ctx.scale(sc, sc); } const h = D.h || 1.8; CAM.set({ pos: orbitPos({ c: [0, h * .55, 0], r: h * 2.6, az: [.4, -.6, 1.2, 2.6, -.2, .9, -1.3, .1][i], el: [.1, .3, 0, .15, -.25, .5, .1, .05][i] }), target: [0, h * .55, 0], fov: 32 }); drawFig(ctx, F, 1); ctx.restore(); ctx.fillStyle = '#1a1420'; ctx.font = '700 18px "Inter", sans-serif'; ctx.fillText(sp, x + 10, 1310); });
}
/* posesSheet(ctx, name, poses, form, cols): grid of poses (3/4 view, ground line) for pose-library review */
function posesSheet(ctx, name, list, form = 'base', cols = 7) {
  const D = CAST[name], Wc = ctx.canvas.width, rows = Math.ceil(list.length / cols), cw = Wc / cols, ch = cw * 1.15;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f2efe8'; ctx.fillRect(0, 0, Wc, ctx.canvas.height); lightReset(); LIGHT.key = vNorm([-.5, .7, .6]);
  list.forEach((pn, i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * ch; const F = makeFig(D, { form, at: t => pose(pn), springWin: .2 }); const h = D.h || 1.8;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip(); const sc = ch / 1080; ctx.translate(x + cw / 2 - 960 * sc, y); ctx.scale(sc, sc);
    CAM.set({ pos: orbitPos({ c: [0, h * .5, 0], r: h * 3.3, az: .7, el: .15 }), target: [0, h * .5, 0], fov: 34 }); const gp = projPoly([[-2, 0, -2], [2, 0, -2], [2, 0, 2], [-2, 0, 2]]); if (gp.length > 2) { polyPath(ctx, gp); ctx.fillStyle = '#e2dccf'; ctx.fill(); } drawFig(ctx, F, .4); ctx.restore();
    ctx.fillStyle = '#1a1420'; ctx.font = '700 20px "Inter", sans-serif'; ctx.fillText(pn, x + 10, y + ch - 12); ctx.strokeStyle = '#c8c0b4'; ctx.strokeRect(x, y, cw, ch); });
}
