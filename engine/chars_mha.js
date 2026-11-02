/* engine/chars_mha.js (E1) - My Hero Academia: Midoriya Izuku (Deku) + Shigaraki Tomura.
   CAST.deku forms: base (hero costume Gamma: dark teal jumpsuit, black outlines, red belt, white gloves, iron-soled red boots),
                    fullcowl (One For All: Full Cowl - green lightning hugging the body, glowing lines),
                    max (OFA 100%: heavy arcs, glowing eyes, hair lifting), blackwhip (Full Cowl + Blackwhip tendrils from the forearms),
                    epsilon (ragged dark costume, red Mid-Gauntlets, scarf-cape: the lone vigilante look), wounded
   CAST.shigaraki forms: base (black clothes + the embalmed hands, "Father" on the face), unmasked (hands, face free), plain,
                    final (final-war look: pale grey-white hair, black clothes, Father hanging at the neck, dark AFO cracks),
                    awakened (Father on the face, black AFO wings, glowing red cracks), afo (All For One: white eyes, wings,
                    finger-mass left arm, Rivet Stab tendrils from the back), crumble (body breaking apart: cracks everywhere)  */
'use strict';
// ============================================================================================ MIDORIYA IZUKU (DEKU)
const DEKU_SUIT = '#1f6650', DEKU_LINE = '#101814';
CAST.deku = design(SHINIGAMI, {
  name: 'Midoriya Izuku', h: 1.68, body: { head: 1.07, width: .97, shoulders: 1.02, limbs: 1.02, legs: .98 }, skin: '#fbe0c8', skinShade: '#dfa88f',
  kosode: DEKU_SUIT, collar: { none: true }, sleeve: { bare: true }, armSkin: DEKU_SUIT, handSkin: '#f1ede2', fingerCol: '#f1ede2', nailCol: false,
  scarf: { col: DEKU_SUIT, v0: .93, v1: 1.0 },
  obi: { col: '#c8241e', v0: .1, v1: .17 },
  hakama: { col: DEKU_SUIT, r0: .088, r1: .074, r2: .058, ties: false, pleats: false },
  feet: { col: '#d42a1e', sandal: false, w: 1.3, shaft: .26, shaftCol: '#d42a1e', shaftR: 1.35, soleCol: '#26262c', soleH: .032, soleLine: '#f2c230' },
  haori: { none: true },
  torsoDetail: (c, S, D, T, G) => { // black costume outlines (side panels + chest V)
    const s = gridScale(G), lw = lineW(s, 1.6);
    for (const sg of [1, -1]) { strokeRuns(c, surfLine(T.surf, [[.25, .05], [.25 + sg * 0, .4], [.2, .75], [.08, .97]].map(([u, v]) => [sg > 0 ? u : 1 - u, v]), .02), lw, DEKU_LINE); strokeRuns(c, surfLine(T.surf, [[.04, .62], [.12, .85], [.18, .98]].map(([u, v]) => [sg > 0 ? u : 1 - u, v]), .02), lw * .8, DEKU_LINE); }
    if (D.glowLines) for (const sg of [1, -1]) strokeRuns(c, surfLine(T.surf, [[.05, .2], [.12, .45], [.08, .7], [.15, .9]].map(([u, v]) => [sg > 0 ? u : 1 - u, v]), .02), lineW(s, .9), '#9dffb8');
  },
  face: {
    eye: { w: 1.0, h: .62, irisR: .37, irisCol: '#2c9a58', irisLight: '#9af0b4', irisDark: '#0e4a2a', round: true, tilt: .04, thick: 1.1, flick: .03, lashes: true, crease: true, lowerH: .2, lidShade: '#3a6a5a' },
    eyeSize: .42, eyeY: -.22, defaultExpr: 'determined', brow: { browW: .08, browY: .02, browCol: '#16382a' }, headShape: { jaw: 1.05, chin: .9, width: 1.0 }, mouth: { mouthW: 1.0 },
    hair: { col: '#1e4a38', shadeCol: '#0c2a1e', gloss: true, glossCol: '#3f7a5c', springK: 150, springC: 16, cap: { front: .62, side: .1, back: -.7, jag: .08, jagN: 20 },
      locks: () => [
        // fluffy curly mop: clumps curling in all directions
        ...lockFan(10, .9, 5.38, .55, (th, u, i) => ({ th, ph: .45 + .25 * (i % 2), len: .85 + .2 * hash(i * 3), w: .62, rootR: .93, dir: dirOut(th, .55 + .25 * (i % 2), .15, -.1), curl: [(i % 2 ? .6 : -.6), -1.0, .2], tw: .38, tip: 1.3, back: Math.cos(th) < -.2 })),
        ...lockFan(8, -2.8, 2.8, 1.05, (th, u, i) => ({ len: .8, w: .62, rootR: .94, dir: [Math.sin(th) * .6, .9, Math.cos(th) * .4], curl: [(i % 2 ? .8 : -.8), -1.1, 0], tw: .38, tip: 1.3 })),
        // bangs falling just over the eyes
        ...lockFan(5, -.7, .7, .9, (th, u, i) => ({ len: .78 + .12 * hash(i), w: .5, rootR: .95, dir: [Math.sin(th) * .7, .45, 1], curl: [(i % 2 ? .7 : -.7), -2.0, -.2], tw: .32, tip: 1.3, front: true, gloss: true })),
        { th: 1.2, ph: .3, len: .85, w: .42, rootR: .96, dir: [.45, -.3, .4], curl: [.6, -.9, 0], grav: .3, tw: .32, tip: 1.3, front: true },
        { th: -1.2, ph: .3, len: .85, w: .42, rootR: .96, dir: [-.45, -.3, .4], curl: [-.6, -.9, 0], grav: .3, tw: .32, tip: 1.3, front: true },
      ] },
    markings: (c, HM, e, lod, D) => { // four freckles in a diamond on each cheek
      for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .5, -.55, .5, .22); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = '#b8705a'; for (const [x, y] of [[0, .5], [-.45, 0], [.45, 0], [0, -.5]]) { cc.beginPath(); cc.arc(x * .8, y * .8, .085, 0, TAU); cc.fill(); } }, .05, fr.n); }
      if (D.veins) for (const sg of [1, -1]) { const fv = faceFrame(HM, sg * .62, -.35, .3, .55); decal(c, fv.p, sg > 0 ? fv.tu : vMul(fv.tu, -1), fv.tv, cc => { cc.strokeStyle = '#ff3a2a'; cc.lineWidth = .07; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(.6, -.9); cc.lineTo(.3, -.3); cc.lineTo(.45, .2); cc.moveTo(.3, -.3); cc.lineTo(-.1, -.1); cc.lineTo(-.2, .4); cc.stroke(); }, -1, fv.n); }
      if (D.eyeGlow) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .46, -.2, .5, .5); decal(c, fr.p, fr.tu, fr.tv, cc => { const g = cc.createRadialGradient(0, 0, 0, 0, 0, .9); g.addColorStop(0, 'rgba(160,255,190,.75)'); g.addColorStop(1, 'rgba(160,255,190,0)'); cc.fillStyle = g; cc.fillRect(-1, -1, 2, 2); }, .02, fr.n); }
    },
  },
  extras: (S, D, F, t, parts, opt) => {
    const J = S.J, k = S.B.h / 1.8;
    // knee pads (black, long) + elbow pads + arm braces with blue stripes + belt pouches
    for (const sd of ['L', 'R']) {
      parts.push({ z: camDepth(J['kn' + sd]) - .07, fn: c => { const a = vLerp(J['hip' + sd], J['kn' + sd], .72), b = vLerp(J['kn' + sd], J['an' + sd], .3); const surf = sTube([a, J['kn' + sd], b], v => S.B.limbR.th * (1.18 - .25 * v) * k / k, S.M.pelvis[0], 10, 6); drawSurf(c, sampleSurf(surf), Object.assign({ col: D.padCol || '#202228', shade: .1, borders: { v0: true, v1: true }, facingBias: -.05 }, opt.surf || {})); if (opt.mode !== 'flat' && !LIGHT.override) { const q = project(J['kn' + sd]); if (q) { c.fillStyle = '#e8c23a'; c.beginPath(); c.arc(q.x, q.y, Math.max(1, .012 * k * q.s), 0, TAU); c.fill(); } } } });
      const zA = camDepth(vLerp(J['el' + sd], J['wr' + sd], .5)), zT = camDepth(vLerp(J.pelvis, J.neck, .5));
      parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .004, fn: c => { const a = vLerp(J['el' + sd], J['wr' + sd], .35), b = J['wr' + sd]; const surf = sTube([a, b], v => S.B.limbR.fa * lerp(1.32, 1.18, v), S.M.chest[2], 10, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: D.braceCol || '#2a2c34', shade: .1, borders: { v0: true, v1: true } }, opt.surf || {})); if (opt.mode !== 'flat' && !LIGHT.override) { limbRing(c, a, b, .3, S.B.limbR.fa * 1.36, '#3a8ae0', 2.2); limbRing(c, J['sh' + sd], J['el' + sd], .62, S.B.limbR.ua * 1.32, '#3a8ae0', 2.0); } } });
    }
    for (const th of [.9, 1.3, -.9, -1.3]) { const p0 = torsoModel(S, D, .03 * k).ringAt(.12, th); parts.push({ z: camDepth(p0) - .03, fn: c => { if (opt.mode === 'flat') return; const n = vNorm(vSub(p0, vAdd(S.J.pelvis, [0, p0[1] - S.J.pelvis[1], 0]))); if (vDot(n, toCam(p0)) < -.1) return; const q = project(p0); if (!q) return; const w = .05 * k * q.s, h = .055 * k * q.s; c.fillStyle = tones('#c8241e').base; c.fillRect(q.x - w / 2, q.y - h * .3, w, h); c.lineWidth = lineW(q.s, .5); c.strokeStyle = LIGHT.ink; c.strokeRect(q.x - w / 2, q.y - h * .3, w, h); } }); }
    if (D.cowl) cowlArcs(S, D, F, t, parts, opt, { n: Math.round(14 * D.cowl), col: D.cowlCol || '#4dff7c', core: '#f0fff4', w: D.cowl, spread: .8 + .4 * D.cowl, skip: D.cowl > 1.2 ? .1 : .3 });
    if (D.whips) dekuWhips(S, D, F, t, parts, opt);
    if (D.veins) for (const sd of ['L', 'R']) parts.push({ z: camDepth(J['el' + sd]) - .05, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const fwd = S.M.chest[2]; limbLine(c, J['sh' + sd], J['el' + sd], vNorm(vAdd(fwd, [0, .3, 0])), S.B.limbR.ua * 1.15, '#ff3a2a', 1.4, .1, .95); limbLine(c, J['el' + sd], J['wr' + sd], fwd, S.B.limbR.fa * 1.3, '#ff3a2a', 1.2, .05, .7); } });
    woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  },
  forms: {
    base: {}, fullcowl: { cowl: 1, glowLines: true }, max: { cowl: 1.8, glowLines: true, eyeGlow: true, cowlCol: '#6dff8e', veins: true },
    blackwhip: { cowl: .8, whips: true, glowLines: true },
    epsilon: { kosode: '#14302a', armSkin: '#14302a', scarf: { col: '#14302a', v0: .965, v1: 1.0 }, hakama: { col: '#14302a', r0: .088, r1: .074, r2: .058, ties: false, pleats: false }, braceCol: '#7a1a18', padCol: '#18181c', cowl: .6, wounds: 1,
      haori: { col: '#3a3426', lining: '#2a241a', len: .55, flare: .2, sleeves: false, hem: 'none', open: 1.5, collarLen: .3, torn: .9 } },
    wounded: { cowl: .5, wounds: 3 },
  },
});
CAST.deku.drawHead = stdHead(CAST.deku);
// Blackwhip: black smoky tendrils with green edges coiling out of both forearms
function dekuWhips(S, D, F, t, parts, opt) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8;
  for (const sd of ['L', 'R']) for (let i = 0; i < 3; i++) {
    const a = vLerp(S.J['el' + sd], S.J['wr' + sd], .4 + i * .2), ax = vNorm(vSub(S.J['wr' + sd], S.J['el' + sd])); const pts = [];
    for (let j = 0; j <= 10; j++) { const u = j / 10, ph = t * 3 + i * 2 + (sd === 'L' ? 1 : 0); pts.push(vAdd(a, [Math.sin(u * 5 + ph) * .25 * u * k + ax[0] * u * .5 * k, (Math.cos(u * 4 + ph) * .2 + u * .25) * k, Math.cos(u * 5 + ph * 1.3) * .25 * u * k + ax[2] * u * .5 * k])); }
    parts.push({ z: camDepth(pts[5]) - .05, fn: c => blackTendril(c, pts, .035 * k, t, i) });
  }
}
// shared tendril painter: black ribbon tapering, smoky green edge glow (Blackwhip) or red (AFO, col option)
function blackTendril(c, pts, w0, t, seed = 0, edge = '#4dff7c', body = '#0a0c0e') {
  const sp = pts.map(p => proj2(p)), s = pxScale(pts[0]), n = sp.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = w0 * s * (1 - i / n * .85) * (1 + .25 * Math.sin(i * 1.7 + t * 9 + seed)); L.push([sp[i][0] - dy * w, sp[i][1] + dx * w]); R.push([sp[i][0] + dy * w, sp[i][1] - dx * w]); }
  const poly = catmull(L.concat(R.reverse()), true, 2); c.save(); polyPath(c, poly); c.lineWidth = Math.max(2, w0 * s * .6); c.strokeStyle = rgba(edge, .55); c.stroke(); c.fillStyle = body; c.fill(); c.lineWidth = Math.max(1, w0 * s * .15); c.strokeStyle = edge; c.stroke(); c.restore();
}

// ============================================================================================ SHIGARAKI TOMURA
const SHIG_HAND = '#a8b4c8';
CAST.shigaraki = design(SHINIGAMI, {
  name: 'Shigaraki Tomura', h: 1.75, body: { width: .9, shoulders: .94, limbs: .88, neck: 1.05 }, skin: '#ebe5e2', skinShade: '#a9a0b4',
  kosode: '#1c1a20', collar: { under: '#1c1a20', skinCol: '#ebe5e2', v0: .78, w: .38, shift: 0 }, sleeve: { bare: true }, armSkin: '#1c1a20', handSkin: '#ebe5e2', fingerCol: '#e6dedc',
  hakama: { col: '#1c1a20', r0: .085, r1: .075, r2: .062, ties: false, pleats: false, len: .86 },
  feet: { col: '#c82a24', sandal: false, w: 1.15, soleCol: '#f2efe8', soleH: .022 },
  haori: { none: true },
  face: {
    eye: { w: 1.05, h: .52, irisR: .17, irisCol: '#e01e1e', irisDark: '#7a0a0a', white: '#fff6f2', pupilR: .4, round: true, tilt: -.02, thick: 1.0, flick: 0, lashes: false, crease: true, lowerH: .22, lidShade: '#8a5a6a' },
    eyeSize: .38, eyeY: -.2, defaultExpr: 'menace', brows: false, headShape: { jaw: .95, chin: .95, width: .95 }, mouth: { mouthW: 1.2, mouthIn: '#3a1418' },
    hair: { col: '#a6b6cc', shadeCol: '#64748e', gloss: false, springK: 30, springC: 5, cap: { front: .55, side: .05, back: -.75, jag: .1, jagN: 14 },
      locks: () => [
        ...lockFan(11, 1.0, 5.28, .45, (th, u, i) => ({ th, ph: .4 + .2 * Math.sin(i * 2.1), len: 1.8 + .6 * hash(i * 5), w: .45, rootR: .95, dir: dirOut(th, .2, 1.0, -.2), grav: 1.0, wave: [.4, 1.2, i], waveAxis: [1, 0, 0], tw: .3, tip: 1.2, back: true, seg: 9 })),
        // uneven clumps hanging over the face
        ...lockFan(5, -.8, .8, .85, (th, u, i) => ({ len: 1.5 + .5 * hash(i * 9), w: .42, rootR: .96, dir: [Math.sin(th) * .5, .2, 1], grav: 1.6, curl: [0, -.3, -.3], wave: [.35, 1.4, i * 2], waveAxis: [1, 0, 0], tw: .3, tip: 1.2, front: true, seg: 9 })),
        { th: 1.2, ph: .3, len: 2.1, w: .4, rootR: .96, dir: [.4, -.5, .3], grav: 1.2, wave: [.3, 1.3], waveAxis: [0, 0, 1], tw: .3, tip: 1.2, front: true, seg: 9 },
        { th: -1.2, ph: .3, len: 2.0, w: .4, rootR: .96, dir: [-.4, -.5, .3], grav: 1.2, wave: [.3, 1.3, 1], waveAxis: [0, 0, 1], tw: .3, tip: 1.2, front: true, seg: 9 },
      ] },
    markings: (c, HM, e, lod, D) => {
      // dry wrinkled skin around the eyes, scar over the right eye, lip scar (left), mole under the lip (right)
      for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .45, -.2, .5, .62); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.strokeStyle = rgba('#8a6070', .75); cc.lineWidth = .045; for (let i = 0; i < 3; i++) { cc.beginPath(); cc.arc(.05, -.05, .55 + i * .14, Math.PI * 1.15, Math.PI * 1.85); cc.stroke(); } cc.beginPath(); cc.arc(.05, .02, .62, Math.PI * .2, Math.PI * .8); cc.stroke(); cc.fillStyle = rgba('#c88a8a', .25); cc.beginPath(); cc.ellipse(0, -.05, .8, .65, 0, 0, TAU); cc.fill(); }, -1, fr.n); }
      { const fr = faceFrame(HM, -.45, -.2, .5, .7); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.strokeStyle = '#9a5a64'; cc.lineWidth = .07; cc.beginPath(); cc.moveTo(-.15, .75); cc.lineTo(.05, -.7); cc.stroke(); }, -1, fr.n); }
      { const fr = faceFrame(HM, .1, -.8, .45, .3); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = '#a06a70'; cc.lineWidth = .1; cc.beginPath(); cc.moveTo(.3, .5); cc.lineTo(.55, -.4); cc.stroke(); cc.fillStyle = '#4a3036'; cc.beginPath(); cc.arc(-.55, -.55, .07, 0, TAU); cc.fill(); }, -1, fr.n); }
      if (D.cracks) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .7, -.65, .3, .5); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => crackDecal(cc, 7 + sg, D.cracks, D.crackCol), -1, fr.n); }
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      if (D.faceHand === 'neck') parts.push({ z: camDepth(S.J.neck) - .09, fn: c => stuckHand(c, S, vAdd(S.J.neck, mApply(S.M.chest, [.02 * S.B.h / 1.8, -.02, .1 * S.B.h / 1.8])), mApply(S.M.chest, [0, -1, .25]), mApply(S.M.chest, [0, 0, -1]), opt, { col: SHIG_HAND, shape: 'hook', size: 1.0, box: true, side: 'L' }) });
      else if (D.faceHand) parts.push({ z: zc - HM.r * 1.3, fn: c => stuckHand(c, S, HM.toW([.08, -1.05, 1.18]), vNorm(vAdd(HM.M[1], vMul(HM.M[2], -.15))), vMul(HM.M[2], -1), opt, { col: SHIG_HAND, shape: 'spread', size: 1.05, box: true, side: 'L' }) });
      if (D.hands) parts.push({ z: zc - HM.r * .2, fn: c => stuckHand(c, S, HM.toW([.0, 1.25, -.35]), vNorm(vAdd(HM.M[2], HM.M[1])), vMul(HM.M[1], -1), opt, { col: SHIG_HAND, shape: 'hook', size: .95, side: 'R' }) });
    },
  },
  extras: (S, D, F, t, parts, opt) => {
    const J = S.J, k = S.B.h / 1.8, M = S.M.chest;
    if (D.hands) {
      // neck pair (gripping from behind), arms, forearms, chest + shoulders - all embalmed grey-blue hands
      const T = torsoModel(S, D, .03 * k);
      const spots = [
        { p: () => vAdd(J.neck, mApply(M, [.07 * k, .06 * k, -.03 * k])), X: () => mApply(M, [-.2, .2, 1]), N: () => mApply(M, [-1, 0, .2]), side: 'R' },
        { p: () => vAdd(J.neck, mApply(M, [-.07 * k, .06 * k, -.03 * k])), X: () => mApply(M, [.2, .2, 1]), N: () => mApply(M, [1, 0, .2]), side: 'L' },
        { p: () => T.ringAt(.78, .35), X: () => mApply(M, [-.6, .6, .1]), N: () => mApply(M, [0, 0, -1]), side: 'R' },
        { p: () => T.ringAt(.78, -.35), X: () => mApply(M, [.6, .6, .1]), N: () => mApply(M, [0, 0, -1]), side: 'L' },
        { p: () => T.ringAt(.9, 1.2), X: () => mApply(M, [0, -.3, 1]), N: () => mApply(M, [-1, -.3, 0]), side: 'R' },
        { p: () => T.ringAt(.9, -1.2), X: () => mApply(M, [0, -.3, 1]), N: () => mApply(M, [1, -.3, 0]), side: 'L' },
      ];
      for (const sd of ['L', 'R']) { const sg = sd === 'L' ? 1 : -1; for (const f of [.45, .4]) { const isFA = f === .4; const a = isFA ? J['el' + sd] : J['sh' + sd], b = isFA ? J['wr' + sd] : J['el' + sd]; spots.push({ p: () => vMad(vLerp(a, b, f), mApply(M, [sg, 0, .3]), S.B.limbR.ua * 1.2), X: () => vSub(b, a), N: () => mApply(M, [-sg, 0, -.2]), side: sd, arm: true }); } }
      for (const sp of spots) { const p = sp.p(); parts.push({ z: camDepth(p) - (sp.arm ? .03 : .06), fn: c => stuckHand(c, S, p, sp.X(), sp.N(), opt, { col: SHIG_HAND, shape: 'hook', size: .85, side: sp.side }) }); }
    }
    if (D.cracks) { // red Decay cracks over chest, arms and neck
      parts.push({ z: camDepth(vLerp(J.pelvis, J.neck, .5)) - .08, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const paths = [[[.1, .95], [.15, .8], [.08, .7], [.2, .55], [.15, .4]], [[.85, .9], [.8, .75], [.9, .6], [.82, .45]], [[.4, .8], [.35, .6], [.42, .4]], [[.6, .85], [.65, .65], [.6, .5]]].slice(0, 1 + D.cracks); torsoLines(c, S, D, paths, D.crackCol || '#5a0a10', 2.6, .01); torsoLines(c, S, D, paths, D.crackGlow || '#ff4a3a', 1.0, .012); } });
      for (const sd of ['L', 'R']) parts.push({ z: camDepth(J['el' + sd]) - .06, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const fwd = M[2]; limbLine(c, J['sh' + sd], J['el' + sd], vNorm(vAdd(fwd, [0, .4, 0])), S.B.limbR.ua * 1.15, D.crackCol || '#7a0a10', 2.4, .1, .9); limbLine(c, J['el' + sd], J['wr' + sd], fwd, S.B.limbR.fa * 1.1, D.crackGlow || '#ff4a3a', 1.2, .05, .8); } });
    }
    if (D.fingerMass) shigFingerMass(S, D, F, t, parts, opt);
    if (D.wings) shigWings(S, D, F, t, parts, opt);
    if (D.tendrils) for (let i = 0; i < 6; i++) { const root = vAdd(J.neck, mApply(M, [(i - 2.5) * .06 * k, -.15 * k, -.12 * k])); const pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12, ph = t * 1.6 + i * 1.3; pts.push(vAdd(root, mApply(M, [(i - 2.5) * .35 * u * k + Math.sin(u * 4 + ph) * .2 * u * k, (.25 + Math.sin(i * 1.7) * .6) * u * k + Math.cos(u * 3 + ph) * .15 * k * u, -1.1 * u * k]))); }
      parts.push({ z: camDepth(pts[6]) + .2, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; blackTendril(c, pts, .05 * k, t, i, '#c8202a', '#120a0e'); } }); }
    woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  },
  forms: {
    base: { hands: true, faceHand: true }, unmasked: { hands: true }, plain: {},
    final: { hands: false, faceHand: 'neck', cracks: 2, crackCol: '#2a0608', crackGlow: '#7a1018' },
    winged: { hands: false, faceHand: 'neck', cracks: 2, crackCol: '#2a0608', crackGlow: '#c8202a', wings: true },
    awakened: { hands: false, faceHand: true, cracks: 3, crackCol: '#2a0608', crackGlow: '#c8202a', wings: true },
    afo: { hands: false, faceHand: 'neck', cracks: 3, crackCol: '#1a0204', crackGlow: '#ff3a2a', wings: true, fingerMass: true, tendrils: true, eyesWhite: true, body: { width: .98, shoulders: 1.05, limbs: .98, neck: 1.05 } },
    crumble: { hands: false, cracks: 3, wounds: 2 },
  },
});
CAST.shigaraki.drawHead = stdHead(CAST.shigaraki);
// awakened forms: white hair, (afo) white blank eyes
for (const fm of ['final', 'winged', 'awakened', 'afo']) {
  const F0 = CAST.shigaraki.face; CAST.shigaraki.forms[fm].face = Object.assign({}, F0, { hair: Object.assign({}, F0.hair, { col: '#d4d8e2', shadeCol: '#8a90a8' }) });
}
CAST.shigaraki.forms.afo.face.eye = Object.assign({}, CAST.shigaraki.face.eye, { irisCol: '#f4f4f8', irisDark: '#c8c8d4', pupilCol: '#e8e8f0', white: '#fffafa' });
function crackDecal(cc, seed, n = 2, col = '#7a0a14') { cc.strokeStyle = col; cc.lineWidth = .08; cc.lineCap = 'round'; for (let i = 0; i < n + 1; i++) { let x = (hash(seed + i) - .5) * .8, y = -.8; cc.beginPath(); cc.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (hash(seed * 3 + i * 7 + j) - .5) * .5; y += .35; cc.lineTo(x, y); } cc.stroke(); } }
// AFO 'Wing': big black feathered wings with red-cracked edges
function shigWings(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1], root = vAdd(S.J.neck, mApply(M, [0, -.14 * k, -.13 * k])), flap = Math.sin(t * 2.4) * .15;
  for (const sg of [1, -1]) { const side = vMul(M[0], sg); const bone = [root, vAdd(root, vAdd(vMul(side, .55 * k), vAdd(vMul(up, (.5 + flap) * k), vMul(back, .3 * k)))), vAdd(root, vAdd(vMul(side, 1.45 * k), vAdd(vMul(up, (.85 + flap * 2) * k), vMul(back, .45 * k))))];
    parts.push({ z: camDepth(bone[1]) + (vDot(back, CAM.cur.F) > 0 ? -.3 : .3), fn: c => { for (let i = 0; i < 9; i++) { const u = i / 8, a = vLerp(bone[1], bone[2], u * .95), dirF = vNorm(vAdd(vMul(up, -1.2 + u * .5), vAdd(vMul(side, .1 + u * .7), vMul(back, .15)))), len = (1.15 - u * .35) * k, w = .1 * k; const tip = vMad(a, dirF, len), sv = vMul(vNorm(vCross(dirF, back)), w);
        iceShard(c, [vAdd(a, sv), vMad(vAdd(a, sv), dirF, len * .7), tip, vMad(vSub(a, sv), dirF, len * .55), vSub(a, sv)], opt, '#141016', 1); }
      if (opt.mode !== 'flat' && !LIGHT.override) { const sb = bone.map(p => proj2(p)); polyPath(c, sb, false); c.lineCap = 'round'; c.lineWidth = .07 * k * pxScale(bone[1]); c.strokeStyle = '#1a1014'; c.stroke(); c.lineWidth *= .25; c.strokeStyle = D.crackGlow || '#c8202a'; c.stroke(); } } }); }
}
// All For One: grotesque mass of writhing fingers sprouting from the left forearm
function shigFingerMass(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, wr = S.J.wrL, el = S.J.elL, ax = vNorm(vSub(wr, el));
  parts.push({ z: camDepth(wr) - .06, fn: c => {
    for (let i = 0; i < 18; i++) { const an = i / 18 * TAU * 2.3, len = (.25 + .45 * hash(i * 3)) * k; let u = vNorm(vCross(ax, [0, 1, 0])); const v = vCross(ax, u); const dir = vNorm(vAdd(vMul(ax, .7 + hash(i)), vAdd(vMul(u, Math.cos(an)), vMul(v, Math.sin(an)))));
      const b0 = vLerp(el, wr, .6 + hash(i * 5) * .45), pts = []; for (let j = 0; j <= 4; j++) { const w = j / 4; pts.push(vAdd(vMad(b0, dir, len * w), [0, Math.sin(w * 3 + t * 4 + i) * .04 * k, 0])); }
      const surf = sTube(pts, vv => .026 * k * (1 - vv * .35), u, 8, 4); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#d8c8c8', shade: .1, shadeCol: '#8a6a7a' }, opt.surf || {})); }
  } });
}

// ============================================================================================ SIGNATURE POSES
Object.assign(POSES, {
  // Deku: Full Cowl hero stances, Smash punches and Shoot Style kicks
  deku_ready: { sp: .22, st: -.25, hp: .1, aL: [1.1, .1, 0], eL: 1.5, hL: 'fist', aR: [.9, .5, 0], eR: 1.8, hR: 'fist', lL: [.5, .25, .2], kL: .75, lR: [-.3, .2, -.2], kR: .45, face: { eye: 1.0, lid: .25, mouth: 'line' } },
  deku_detroitWind: { sp: .25, st: .9, hp: .05, hy: -.5, aR: [1.3, PI * .7, 0], eR: 2.2, hR: 'fist', aL: [1.4, -.3, 0], eL: .5, hL: 'open', lL: [.8, .3, .3], kL: 1.1, lR: [-.45, .25, -.3], kR: .5, face: { eye: 1.1, lid: .4, mouth: 'shout', mouthOpen: .6, brow: -.35, browA: .6 } },
  deku_detroit: { sp: .55, st: -.95, hp: .2, hy: .45, aR: [1.6, -.1, 0], eR: 0, hR: 'fist', aL: [.8, 1.0, 0], eL: 1.9, hL: 'fist', lL: [1.15, .3, .3], kL: 1.35, lR: [-.95, .2, -.3], kR: .15, fR: .5, face: { eye: 1.15, lid: .45, mouth: 'shout', mouthOpen: 1, brow: -.4, browA: .7 } },
  deku_delaware: { sp: .1, st: -.4, hp: .05, aR: [1.55, -.05, 0], eR: .1, hR: 'sign', wR: [.4, 0], aL: [.8, .6, 0], eL: 1.6, hL: 'fist', lL: [.5, .25, .2], kL: .6, lR: [-.3, .2, -.2], kR: .3, face: { eye: 1.0, lid: .35, mouth: 'line' } },
  deku_shootWind: { sp: -.1, st: .6, hp: -.05, aL: [1.2, .9, 0], eL: .6, hL: 'fist', aR: [1.0, 1.2, 0], eR: .9, hR: 'fist', lL: [-.1, .25, 0], kL: .4, lR: [1.4, .4, -.5], kR: 2.1, face: { eye: 1.1, lid: .35, mouth: 'shout', mouthOpen: .4 } },
  deku_shoot: { sp: -.3, ss: .25, st: -.7, hp: -.1, aL: [1.1, 1.3, 0], eL: .5, hL: 'fist', aR: [1.25, 1.0, 0], eR: .6, hR: 'fist', lL: [-.2, .2, 0], kL: .3, lR: [1.85, .9, -.2], kR: .0, fR: .6, face: { eye: 1.15, lid: .4, mouth: 'shout', mouthOpen: .8 } },
  deku_manchesterWind: { pitch: -.6, sp: -.3, aL: [2.2, .8, 0], eL: .5, hL: 'fist', aR: [2.0, .9, 0], eR: .6, hR: 'fist', lL: [-.6, .2, 0], kL: .8, lR: [2.6, .2, 0], kR: .1, fR: .6, ground: false, face: { eye: 1.1, lid: .4, mouth: 'shout', mouthOpen: .6 } },
  deku_manchester: { pitch: .7, sp: .5, aL: [1.0, 1.3, 0], eL: .5, hL: 'fist', aR: [1.0, 1.3, 0], eR: .5, hR: 'fist', lL: [-.3, .2, 0], kL: 1.0, lR: [1.2, .15, 0], kR: .05, fR: .5, ground: false, face: { eye: 1.15, lid: .45, mouth: 'shout', mouthOpen: 1 } },
  deku_float: { sp: -.05, hp: -.1, aL: [.6, 1.1, 0], eL: .4, hL: 'open', aR: [.6, 1.1, 0], eR: .4, hR: 'open', lL: [.4, .15, .1], kL: .8, lR: [.1, .15, -.1], kR: .5, fL: .5, fR: .5, ground: false, face: { eye: .95, lid: .2 } },
  deku_whip: { sp: .2, st: -.5, hp: .05, aR: [1.5, .2, 0], eR: .25, hR: 'open', aL: [1.4, -.3, 0], eL: .4, hL: 'open', lL: [.6, .3, .3], kL: .8, lR: [-.4, .25, -.3], kR: .4, face: { eye: 1.05, lid: .35, mouth: 'shout', mouthOpen: .5 } },
  deku_max: { sp: .3, hp: -.2, aR: [.9, .9, 0], eR: 2.0, hR: 'fist', aL: [.9, .9, 0], eL: 2.0, hL: 'fist', lL: [.6, .35, .3], kL: 1.0, lR: [-.3, .35, -.3], kR: .6, face: { eye: 1.2, lid: .5, mouth: 'shout', mouthOpen: 1, brow: -.45, browA: .8 } },
  deku_smile: { sp: 0, hp: -.05, aR: [1.5, -.4, 0], eR: 1.9, hR: 'fist', wR: [0, 0], aL: [.12, .5, 0], eL: .3, hL: 'fist', face: { eye: .85, mouth: 'smile', brow: .15, browA: -.1 } },
  // Shigaraki: hunched, loose, menacing - Decay is five fingers touching
  shig_slouch: { sp: .35, ss: .08, hp: .25, hr: .12, aR: [.25, .35, .2], eR: .5, hR: 'claw', aL: [.2, .3, -.2], eL: .4, hL: 'relax', lL: [.15, .12, .3], kL: .2, lR: [-.05, .12, -.2], kR: .1, face: { eye: 1.15, mouth: 'grin', mouthOpen: .3, pupil: .7 } },
  shig_reach: { sp: .4, st: -.3, hp: .1, aR: [1.4, -.05, 0], eR: .25, hR: 'open', wR: [-.5, 0], aL: [.3, .4, 0], eL: .5, hL: 'claw', lL: [.6, .2, .2], kL: .7, lR: [-.4, .15, -.2], kR: .35, face: { eye: 1.25, mouth: 'grin', mouthOpen: .5, pupil: .5, shadow: .5 } },
  shig_touchGround: { sp: 1.0, st: -.2, hp: -.2, aR: [.55, .1, 0], eR: .25, hR: 'open', wR: [-1.2, 0], aL: [.3, .6, 0], eL: .9, hL: 'claw', lL: [1.5, .35, .3], kL: 2.1, lR: [.2, .3, -.3], kR: 2.0, fR: .9, face: { eye: 1.3, mouth: 'grin', mouthOpen: .7, pupil: .45, shadow: .6 } },
  shig_scratch: { sp: .2, hp: .15, hy: .2, aR: [2.2, -.6, 0], eR: 2.3, hR: 'claw', aL: [.2, .3, 0], eL: .4, hL: 'claw', face: { eye: 1.3, mouth: 'frown', pupil: .45, vein: 1 } },
  shig_laugh: { sp: -.3, hp: -.55, aR: [.5, .8, 0], eR: .6, hR: 'claw', aL: [.5, .8, 0], eL: .6, hL: 'claw', lL: [.1, .2, .2], kL: .15, lR: [-.05, .2, -.2], kR: .1, face: { mouth: 'laugh', mouthOpen: 1, eye: 1.3, pupil: .5, closed: 0 } },
  shig_grab: { sp: .55, st: -.6, hp: .25, aR: [1.55, -.2, 0], eR: .05, hR: 'claw', aL: [1.0, .9, 0], eL: 1.2, hL: 'claw', lL: [1.1, .25, .3], kL: 1.3, lR: [-.85, .2, -.3], kR: .2, fR: .5, face: { eye: 1.3, mouth: 'grin', mouthOpen: .8, pupil: .4, shadow: .5 } },
  shig_afo: { sp: -.15, hp: -.2, aR: [1.2, 1.2, 0], eR: .2, hR: 'open', aL: [1.5, .4, 0], eL: .3, hL: 'claw', lL: [.25, .3, .3], kL: .3, lR: [-.15, .3, -.3], kR: .2, face: { eye: 1.2, mouth: 'grin', mouthOpen: .6, pupil: .5, shadow: .7 } },
});
SIGNATURE.deku = ['deku_ready', 'deku_detroitWind', 'deku_detroit', 'deku_delaware', 'deku_shoot', 'deku_manchester', 'deku_whip', 'deku_max'];
SIGNATURE.shigaraki = ['shig_slouch', 'shig_reach', 'shig_touchGround', 'shig_scratch', 'shig_laugh', 'shig_grab', 'shig_afo', 'shig_reach'];
