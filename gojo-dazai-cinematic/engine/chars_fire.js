/* death-battle engine - chars_fire.js (agent E2) : FIRE FORCE - Joker + Benimaru Shinmon.  Uses the E2 KIT from chars_bc.js.
   Sources (checked 2026-10-31): fire-force.fandom.com MediaWiki API (pages Joker, Benimaru_Shinmon, Iai_Hand-Sword,
   Fire_Moon, Crimson_Moon, Crimson_Moon's_Sun_Wheel).
   - JOKER: tall, long black stringy hair below the shoulders, concentric-circle iris in the right eye (grey; PURPLE in the
     anime), purple bandana over the left eye, black bowler hat, white shirt, waistcoat (burgundy in the anime), red
     cravat/scarf, trousers, Oxford shoes, cigarette, menacing grin.  Later outfit: dark overcoat (used here as the long coat).
     Powers: pyrokinesis of unknown generation (manipulates Infernal ash = 2nd gen, ignites his cigarette = 3rd gen);
     shapes flame into letters, card SUITS and card-shaped projectiles that cut and explode; claims a 52-card limit but can
     exceed it; skilled knife/hand-to-hand fighter.  INTERPRETATION: 'adolla' form (bandana off, burning concentric left eye)
     and his ash-violet / ember flame colour are design choices for this film (not canon colours).
   - BENIMARU: chin-length straight black hair partly covering the face; red eyes - right with black rim + pupil, left with
     a white X instead of a pupil; white T-shirt + black vest, dark-blue kimono outer garment worn only on the LEFT arm,
     Fire Force uniform trousers tucked into black boots; fights with a matoi (fire-brigade standard) and his hands.
     Powers: 2nd + 3rd generation; Iai Hand-Sword (居合手刀) forms 1-7: Fire Moon (火月 Kagetsu, crescent blade of flame
     from the palm), Moonlight, Daybreak, Red Sun, Sunset, Dusk, Sun Wheel (日輪 Nichirin); Crimson Moon (紅月 Akatsuki,
     huge fireball exploding like a red moon); Crimson Moon's Sun Wheel (紅月の日輪); 4 m heat barrier; flies on the matoi.
     Compared to Kagutsuchi / Acala (Fudo Myoo) with the Sun Wheel behind him -> flame halo.
   Colour separation: Benimaru flame = white-gold core + vermilion/scarlet edges, forked 'ikazuchi' tongues (fx_fire.js).       */
'use strict';
// =============================================================================================== JOKER
CAST.joker = design(SHINIGAMI, {
  name: 'Joker', h: 1.9, body: { width: 1.0, limbs: 1.02, shoulders: 1.12, depth: 1.08, neck: 1.0, legs: 1.0 }, skin: '#efd6c6', skinShade: '#c49c98',
  kosode: '#6e1626', collar: { under: '#f2efe8', skinCol: '#c41e2c', v0: .6, w: .5, shift: 0 },
  torsoDetail: (c, S, D, T, G) => { const s = gridScale(G); for (let i = 0; i < 4; i++) { const fr = surfFrame(T.surf, 0, .14 + i * .12); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const p = proj2(fr.p), r = Math.max(1.2, .009 * s); c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.fillStyle = '#d8b44a'; c.fill(); }
    for (const sg of [1, -1]) strokeRuns(c, surfLine(T.surf, [[(sg * .25 + 1) % 1, .12], [(sg * .2 + 1) % 1, .35], [(sg * .12 + 1) % 1, .58]], .05), lineW(s, .5), LIGHT.ink); },
  sleeve: { col: '#24222c', lining: '#5a1424', r0: .085, r1: .08, r2: .076, sag: .04, len: 1.0 },
  hakama: { col: '#1d1b24', r0: .1, r1: .085, r2: .078, pleats: false, ties: false },
  haori: { col: '#24222c', lining: '#6a1828', len: .9, sleeves: true, hem: 'none', open: .34, flare: .38, collarLen: .55 },
  feet: { col: '#141218', sandal: false, w: 1.0 },
  face: {
    eye: { w: 1.1, h: .26, irisR: .25, irisCol: '#8a64b8', irisLight: '#c8b0ee', irisDark: '#2a1a40', tilt: .12, thick: 1.15, flick: .05, lashes: false, crease: true, pupilR: .3 },
    eyeSize: .36, eyeY: -.19, defaultExpr: 'grin', brow: { browW: .07, browY: .02 }, mouth: { mouthW: 1.35, teethN: 7 }, headShape: { jaw: .9, chin: 1.08, width: .92 },
    hair: { col: '#18161e', shadeCol: '#070609', gloss: true, glossCol: '#4a4660', springK: 24, springC: 4, cap: { front: .5, side: .05, back: -.9 },
      locks: () => [
        // long stringy curtain behind, below the shoulders
        ...lockFan(15, 1.35, 4.93, .3, (th, u, i) => ({ len: 2.8 + .8 * hash(i * 11 + 3), w: .3, rootR: .97, dir: dirOut(th, .15, 1.6, -.25), grav: 1.3, wave: [.25, 1.1 + hash(i) * .8, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .3, tip: 1.5, seg: 9, back: true, gloss: i % 5 === 2 })),
        // strands falling in front of the shoulders
        ...lockFan(3, 1.05, 1.4, .25, (th, u, i) => ({ len: 2.6 + .4 * i, w: .28, rootR: .97, dir: [.45, -.8, .3], grav: 1.3, wave: [.3, 1.3, i], waveAxis: [0, 0, 1], tw: .3, tip: 1.5, seg: 9, front: true })),
        ...lockFan(3, -1.4, -1.05, .25, (th, u, i) => ({ len: 2.5 + .4 * i, w: .28, rootR: .97, dir: [-.45, -.8, .3], grav: 1.3, wave: [.3, 1.3, i + 2], waveAxis: [0, 0, 1], tw: .3, tip: 1.5, seg: 9, front: true })),
        // messy stringy bangs (parted, hanging over the brows)
        ...lockFan(6, -.85, .85, .92, (th, u, i) => ({ len: 1.25 + .45 * hash(i * 7), w: .3, rootR: .97, dir: [Math.sin(th) * .5, -.1, 1], curl: [Math.sin(th) * .7, -1.25, -.4], grav: 1.2, tw: .3, tip: 1.6, front: true })),
      ],
    },
    details: (c, HM, e, lod, D) => { // concentric-circle iris (right eye); adolla: burning left eye
      e2EyeOverlay(c, HM, D, e, -1, (cc, x, y, ir) => { cc.lineWidth = .022; for (const k of [.5, .72, .92]) { cc.strokeStyle = k > .9 ? rgba('#1a0e28', .9) : rgba('#2a1a40', .75); cc.beginPath(); cc.ellipse(x, y - ir * .05, ir * k, ir * 1.12 * k, 0, 0, TAU); cc.stroke(); } cc.fillStyle = '#d8c8f0'; cc.beginPath(); cc.ellipse(x, y - ir * .05, ir * .14, ir * .16, 0, 0, TAU); cc.fill(); });
      if (D.adolla) e2EyeOverlay(c, HM, D, e, 1, (cc, x, y, ir) => { cc.fillStyle = '#0c0610'; cc.fillRect(-2, -2, 4, 4); for (const [k, col] of [[1.0, '#ff7a2a'], [.75, '#ffd27a'], [.5, '#c84aff'], [.28, '#fff4e0']]) { cc.strokeStyle = col; cc.lineWidth = .05; cc.beginPath(); cc.ellipse(x, y, ir * k, ir * 1.15 * k, 0, 0, TAU); cc.stroke(); } });
    },
    markings: (c, HM, e, lod, D) => { if (D.adolla) { const fr = faceFrame(HM, .45, -.15, .45, .55); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = rgba('#6a1a2a', .55); cc.lineWidth = .06; for (let i = 0; i < 5; i++) { cc.beginPath(); cc.moveTo(-.6 + i * .25, .7); cc.lineTo(-.4 + i * .22, -.7); cc.stroke(); } }, .05, fr.n); } },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      if (!D.adolla) parts.push({ z: zc - .0003, fn: c => jokerBandana(c, HM, opt) });
      if (S.pose.cig !== false) parts.push({ z: zc - .02, fn: c => jokerCig(c, HM, opt, t) });
      if (!D.noHat) parts.push({ z: zc - .06, fn: c => jokerHat(c, HM, opt) });
    },
  },
  extras: (S, D, F, t, parts, opt) => jokerExtras(S, D, F, t, parts, opt),
  forms: { base: {}, nohat: { noHat: true }, adolla: { noHat: true, adolla: true },
    dying: { noHat: true, adolla: true, wounds: 3, haori: { col: '#141218', lining: '#2a0a12', len: .9, sleeves: true, hem: 'none', open: .3, flare: .28, collarLen: .55, torn: .6 } },
    vest: { haori: { none: true }, sleeve: { col: '#f2efe8', lining: '#d8d4cc', r0: .06, r1: .056, r2: .054, sag: .03, len: 1.0 } } },
});
CAST.joker.drawHead = stdHead(CAST.joker);
function jokerBandana(c, HM, opt) {
  const fr = faceFrame(HM, .47, -.2, .5, .44); const flat = opt.mode === 'flat', col = flat ? opt.col : (LIGHT.override ? LIGHT.override.fill : '#5a2a8a');
  decal(c, fr.p, fr.tu, fr.tv, cc => { cc.beginPath(); cc.moveTo(-.72, .62); cc.quadraticCurveTo(.1, .8, .95, .45); cc.lineTo(.92, -.42); cc.quadraticCurveTo(.1, -.72, -.6, -.32); cc.quadraticCurveTo(-.82, .15, -.72, .62); cc.closePath(); cc.fillStyle = col; cc.fill();
    if (!flat) { cc.lineWidth = .06; cc.strokeStyle = LIGHT.ink; cc.stroke(); if (!LIGHT.override) { cc.strokeStyle = rgba('#2a1040', .6); cc.lineWidth = .035; for (const y of [.25, -.05]) { cc.beginPath(); cc.moveTo(-.55, y + .1); cc.quadraticCurveTo(.2, y + .2, .85, y); cc.stroke(); } cc.fillStyle = rgba('#8a5ac0', .55); cc.beginPath(); cc.moveTo(-.55, .5); cc.quadraticCurveTo(.1, .66, .8, .38); cc.lineTo(.78, .22); cc.quadraticCurveTo(.1, .45, -.5, .32); cc.closePath(); cc.fill(); } } }, -.1, fr.n);
  // tie band around the head
  const pts = []; for (let i = 0; i <= 18; i++) { const th = .9 + i / 18 * 4.2; pts.push(HM.at(th, .05 - .1 * Math.cos(i / 18 * Math.PI))); }
  const vis = pts.map(p => vAdd(HM.c, vMul(vSub(p, HM.c), 1.04))).filter(p => vDot(vNorm(vSub(p, HM.c)), toCam(p)) > .3);
  if (vis.length > 1) strokeRuns(c, projLine(vis), lineW(pxScale(HM.c), 1.6) + HM.r * pxScale(HM.c) * .05, col);
}
function jokerCig(c, HM, opt, t) {
  const a = HM.toW([-.2, -.8, headShape(0, -.8, HM.hs)[2] * .98]), d = vNorm(mApply(HM.M, [-.35, -.35, 1])), b = vMad(a, d, HM.r * .75);
  const pa = proj2(a), pb = proj2(b), s = pxScale(a), w = HM.r * .09 * s; if (vDot(HM.M[2], toCam(a)) < -.25) return;
  c.lineCap = 'butt'; c.lineWidth = w + lineW(s, .6) * 2; c.strokeStyle = opt.mode === 'flat' ? opt.col : LIGHT.ink; c.beginPath(); c.moveTo(pa[0], pa[1]); c.lineTo(pb[0], pb[1]); c.stroke();
  if (opt.mode === 'flat') return; c.lineWidth = w; c.strokeStyle = LIGHT.override ? LIGHT.override.fill : '#f6f2ea'; c.stroke();
  if (LIGHT.override) return; const pe = proj2(vMad(a, d, HM.r * .65)); c.strokeStyle = '#d08a4a'; c.beginPath(); c.moveTo(pa[0], pa[1]); c.lineTo(lerp(pa[0], pb[0], .25), lerp(pa[1], pb[1], .25)); c.stroke();
  c.strokeStyle = '#ff5a1a'; c.beginPath(); c.moveTo(pe[0], pe[1]); c.lineTo(pb[0], pb[1]); c.stroke(); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, pb[0], pb[1], w * 2.5, '#ff7a2a', .5 + .3 * Math.sin(t * 9)); c.restore();
}
function jokerHat(c, HM, opt) {
  const M0 = HM.M, tilt = -.14, M = [M0[0], vNorm(vAdd(vMul(M0[1], Math.cos(tilt)), vMul(M0[2], Math.sin(tilt)))), vNorm(vAdd(vMul(M0[2], Math.cos(tilt)), vMul(M0[1], -Math.sin(tilt))))];
  const ctr = HM.toW([0, .5, -.06]), r = HM.r;
  const brim = sEllipsoid(vAdd(ctr, vMul(M[1], r * .02)), M, [r * 1.5, r * .06, r * 1.58], 1, 28, 6, (l, u, v) => { const rr = Math.hypot(l[0], l[2]) / (r * 1.5); return [l[0], l[1] + Math.pow(Math.abs(l[0] / (r * 1.5)), 2) * r * .07 * rr, l[2]]; });
  const dome = sEllipsoid(ctr, M, [r * 1.08, r * .82, r * 1.16], .92, 26, 14);
  const S2 = Object.assign({ col: '#1a1820', shade: .1 }, opt.surf || {});
  const up = vDot(M[1], toCam(ctr)) > 0; // seeing the top of the brim
  const drawBrim = () => drawSurf(c, sampleSurf(brim), Object.assign({}, S2, { col: '#1d1b22', side: 'both', backCol: '#121016' }));
  const drawDome = () => drawSurf(c, sampleSurf(dome), Object.assign({}, S2, { masks: [(u, v) => v - .5], maskInk: [true], gloss: { mask: (u, v, P, N) => .04 - Math.abs(v - .78), col: '#4a4858' }, extraTones: [{ col: '#4a1420', mask: (u, v) => .045 - Math.abs(v - .57) }] }));
  if (up) { drawBrim(); drawDome(); } else { drawDome(); drawBrim(); }
}
function jokerExtras(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8; if (typeof woundParts === 'function') woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  // shirt cuffs at the wrists
  for (const sd of ['L', 'R']) { const el = S.J['el' + sd], wr = S.J['wr' + sd]; parts.push({ z: camDepth(wr) - .006, fn: c => e2Tube(c, [vLerp(el, wr, .86), vLerp(el, wr, 1.0)], .046 * k, '#f2efe8', opt, { hint: S.M.chest[2] }) }); }
  // fan of cards in the hand (pose.cards = count, pose.cardsLit = 0..1 flame glow, pose.cardHand)
  const n = S.pose.cards | 0; if (n > 0) { const sd = S.pose.cardHand || 'R', hg = handGeom(S, sd, S.pose['h' + sd] || 'relax'); if (hg) parts.push({ z: camDepth(hg.palmC) - .015, fn: c => jokerCardFan(c, hg, n, S.pose.cardsLit || 0, k, opt) }); }
}
function jokerCardFan(c, hg, n, lit, k, opt) {
  const base = vLerp(hg.fingers[1][1], hg.fingers[4][2], .5), out = vNorm(vSub(hg.fingers[1][2], hg.palmC));
  for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * .22, d = vNorm(vAdd(vMul(out, Math.cos(a)), vMul(hg.Z, Math.sin(a)))), side = vNorm(vCross(d, hg.np));
    const p0 = vMad(base, side, -.028 * k), p1 = vMad(base, side, .028 * k), q0 = vMad(p0, d, .085 * k), q1 = vMad(p1, d, .085 * k); const sp = projPoly([p0, p1, q1, q0]); if (sp.length < 3) continue;
    polyPath(c, sp); if (opt.mode === 'flat') { c.fillStyle = opt.col; c.fill(); continue; }
    c.fillStyle = LIGHT.override ? LIGHT.override.fill : '#fbf6ee'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = LIGHT.ink; c.stroke();
    if (!LIGHT.override) { const m = proj2(vLerp(vLerp(p0, p1, .5), vLerp(q0, q1, .5), .5)); const s = pxScale(base) * .012 * k; c.fillStyle = i % 2 ? '#c41e2c' : '#1a1820'; c.font = `900 ${Math.max(4, s * 2.2)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♠♥♦♣'[i % 4], m[0], m[1]);
      if (lit > 0) { c.save(); c.globalCompositeOperation = 'lighter'; polyPath(c, sp); c.lineWidth = 3; c.strokeStyle = rgba('#ff8a3a', lit * .9); c.stroke(); glow(c, m[0], m[1], s * 8, '#c060ff', lit * .25); c.restore(); } }
  }
}

// =============================================================================================== BENIMARU SHINMON
CAST.benimaru = design(SHINIGAMI, {
  name: 'Benimaru Shinmon', h: 1.78, body: { width: 1.03, shoulders: 1.07, limbs: 1.06, depth: 1.03 }, skin: '#f4d8c4', skinShade: '#cc9c8e',
  kosode: '#18181e', collar: { none: true }, torsoTones: [{ col: '#f0eee8', mask: (u, v) => .23 - Math.abs(angOf(u)) - (v > .93 ? 1 : 0) }],
  sleeve: { none: true, bare: true }, haori: { none: true },
  hakama: { col: '#262833', r0: .102, r1: .082, r2: .072, pleats: false, ties: false },
  obi: { col: '#121216', v0: .03, v1: .075 },
  feet: { col: '#141218', sandal: false, w: 1.08 },
  face: {
    eye: { w: 1.08, h: .27, irisR: .27, irisCol: '#d0222c', irisLight: '#ff7a6a', irisDark: '#120606', tilt: .08, thick: 1.2, flick: .04, lashes: false, crease: true, pupilR: .36 },
    eyeSize: .37, eyeY: -.2, defaultExpr: 'calm', brow: { browW: .08, browY: -.02 }, headShape: { jaw: .9, chin: .95 },
    hair: { col: '#18161c', shadeCol: '#060508', gloss: true, glossCol: '#45465a', springK: 34, springC: 5, cap: { front: .55, side: .02, back: -.95 },
      locks: () => [
        // straight chin-length bob all around
        ...lockFan(13, 1.2, 5.08, .3, (th, u, i) => ({ len: 1.5 + .15 * hash(i * 5), w: .4, rootR: .95, dir: dirOut(th, -.35, 1.6, 0), grav: 1.6, tw: .3, tip: 1.1, seg: 8, back: Math.cos(th) < -.2, gloss: i % 4 === 1 })),
        // heavy bangs, partly covering the eyes
        ...lockFan(6, -.95, .95, .95, (th, u, i) => ({ len: .95 + .2 * hash(i * 3), w: .4, rootR: .97, dir: [Math.sin(th) * .35, -.1, 1], curl: [Math.sin(th) * .3, -1.65, -.5], grav: 1.5, tw: .3, tip: 1.3, front: true, gloss: i === 2 })),
        // long lock falling over the left eye
        { th: .2, ph: .9, len: 1.5, w: .3, rootR: .97, dir: [.05, -.1, 1], curl: [-.15, -1.55, -.5], grav: 1.6, tw: .3, tip: 1.2, front: true, seg: 8 },
        // side locks framing the cheeks
        { th: 1.0, ph: .35, len: 1.6, w: .36, rootR: .97, dir: [.2, -.95, .3], grav: 1.2, tw: .3, tip: 1.2, front: true },
        { th: -1.0, ph: .35, len: 1.6, w: .36, rootR: .97, dir: [-.2, -.95, .3], grav: 1.2, tw: .3, tip: 1.2, front: true },
      ],
    },
    details: (c, HM, e, lod, D) => { // left eye: white X instead of a pupil
      e2EyeOverlay(c, HM, D, e, 1, (cc, x, y, ir) => { const r = ir * .42; cc.fillStyle = '#d0222c'; cc.beginPath(); cc.ellipse(x, y, ir * .45, ir * .5, 0, 0, TAU); cc.fill(); cc.strokeStyle = '#ffffff'; cc.lineCap = 'round'; cc.lineWidth = ir * .2; cc.beginPath(); cc.moveTo(x - r, y - r); cc.lineTo(x + r, y + r); cc.moveTo(x + r, y - r); cc.lineTo(x - r, y + r); cc.stroke(); });
      if (D.blaze) for (const sg of [1, -1]) e2EyeOverlay(c, HM, D, e, sg, (cc, x, y, ir) => { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.fillStyle = 'rgba(255,190,90,.35)'; cc.beginPath(); cc.ellipse(x, y, ir * 1.1, ir * 1.2, 0, 0, TAU); cc.fill(); cc.restore(); });
    },
  },
  // matoi (fire-brigade standard): wooden pole held like a sword (pose.sword), ornament + paper strips (baren) at the top
  sword: { len: 1.55, w: .036, curve: 0, handle: .95, tsuba: 'none', col: '#6a4630', edgeCol: '#5a3a26', hiltCol: '#5a3a26', wrapCol: '#3a2418',
    bladePoly: (pts, bl) => { const a = [], b = []; for (let i = 0; i <= 6; i++) { a.push(pts(i / 6 * bl, 0)); b.push(pts(i / 6 * bl, 1)); } return a.concat(b.reverse()); },
    extra: (ctx, fr, pts, s, flatMode, opt, S) => matoiHead(ctx, fr, pts, s, flatMode, opt, S) },
  extras: (S, D, F, t, parts, opt) => beniExtras(S, D, F, t, parts, opt),
  forms: { base: {}, blaze: { blaze: true } },
});
CAST.benimaru.drawHead = stdHead(CAST.benimaru);
function matoiHead(ctx, fr, pts, s, flat, opt, S) {
  const k = S.B.h / 1.8, top = pts(1, .3), dir = fr.dir, t = S.t || 0, up = [0, 1, 0];
  const side = vNorm(vCross(dir, Math.abs(dir[1]) > .9 ? [1, 0, 0] : up)), side2 = vNorm(vCross(dir, side)), lw = lineW(s, .7);
  const ink = c => { ctx.lineWidth = lw; ctx.strokeStyle = LIGHT.ink; ctx.lineJoin = 'round'; ctx.stroke(); };
  const col = c => flat ? opt.col : LIGHT.override ? LIGHT.override.fill : c;
  // hanging paper strips (baren): ring of strips below the head, hanging with gravity + sway
  const ringC = vMad(top, dir, -.04 * k), N = 14, strips = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU, rd = vAdd(vMul(side, Math.cos(a)), vMul(side2, Math.sin(a))), r0 = vMad(ringC, rd, .13 * k);
    const sway = [Math.sin(t * 3.1 + i) * .04 * k, 0, Math.cos(t * 2.7 + i * 1.3) * .04 * k], hang = vNorm(vAdd(vAdd(vMul(dir, -.35), [0, -1, 0]), vMul(rd, .25)));
    const r1 = vAdd(vMad(r0, hang, .5 * k), sway), w = vMul(vNorm(vCross(hang, rd)), .035 * k); strips.push({ z: camDepth(r1), q: [vSub(r0, w), vAdd(r0, w), vAdd(r1, w), vSub(r1, w)], tip: [vLerp(vSub(r0, w), vSub(r1, w), .85), vLerp(vAdd(r0, w), vAdd(r1, w), .85)], r1, w }); }
  strips.sort((a, b) => b.z - a.z);
  const drawStrips = farHalf => { for (const st of strips) { if ((st.z > camDepth(ringC)) !== farHalf) continue; const sp = projPoly(st.q); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = col('#f4f1ea'); ctx.fill(); if (!flat) { ink(); if (!LIGHT.override) { const tp = projPoly([st.tip[0], st.tip[1], vAdd(st.r1, st.w), vSub(st.r1, st.w)]); if (tp.length > 2) { polyPath(ctx, tp); ctx.fillStyle = '#1a1a22'; ctx.fill(); } } } } };
  drawStrips(true);
  // ornament: square box + spherical top (white / red / gold)
  const b0 = vMad(top, dir, -.02 * k), b1 = vMad(top, dir, .14 * k), hw = .08 * k; const box = [];
  for (const [a, bb] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box.push(vAdd(vMul(side, a * hw), vMul(side2, bb * hw)));
  for (let i = 0; i < 4; i++) { const q = [vAdd(b0, box[i]), vAdd(b0, box[(i + 1) % 4]), vAdd(b1, box[(i + 1) % 4]), vAdd(b1, box[i])]; const n = vNorm(vAdd(box[i], box[(i + 1) % 4])); if (vDot(n, toCam(b0)) < 0) continue; const sp = projPoly(q); if (sp.length < 3) continue; polyPath(ctx, sp); ctx.fillStyle = col(vDot(n, LIGHT.key) > 0 ? '#f4efe4' : '#c8c0b4'); ctx.fill(); if (!flat) { ink(); if (!LIGHT.override) { const m = proj2(vLerp(q[0], q[2], .5)); ctx.fillStyle = '#c41e2c'; ctx.beginPath(); ctx.arc(m[0], m[1], .03 * k * s, 0, TAU); ctx.fill(); } } }
  const sc = vMad(b1, dir, .07 * k), sq = project(sc); if (sq) { ctx.beginPath(); ctx.arc(sq.x, sq.y, .075 * k * sq.s, 0, TAU); ctx.fillStyle = col('#d8b04a'); ctx.fill(); if (!flat) { ink(); if (!LIGHT.override) { ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(sq.x - .025 * k * sq.s, sq.y - .025 * k * sq.s, .02 * k * sq.s, 0, TAU); ctx.fill(); } } }
  drawStrips(false);
}
function beniExtras(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8; if (typeof woundParts === 'function') woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  // crew neck of the T-shirt
  parts.push({ z: camDepth(S.J.neck) - .03, fn: c => { const T = torsoModel(S, D, .012 * k); const surf = { nu: 22, nv: 2, wrapU: true, fn: (u, v) => T.ringAt(lerp(.93, .985, v), u * TAU) }; drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f0eee8', shade: .05 }, opt.surf || {})); } });
  // kimono outer garment worn on the LEFT arm only: left half of the coat on the body, right half dropped and hanging at the waist
  const kim = { col: '#24314f', lining: '#121a2e', len: .55, open: .22, flare: .3, sleeves: false, hem: 'none', zFront: .07 };
  e2Coat(S, D, F, t, parts, opt, kim, 'full', 0, .6);
  e2Coat(S, D, F, t, parts, opt, Object.assign({}, kim, { len: .42, flare: .45 }), 'skirt', .55, 1);
  // left kimono sleeve (wide, with sag) over the bare arm; right arm: white T-shirt sleeve
  const DK = Object.assign({}, D, { sleeve: { col: '#24314f', lining: '#121a2e', r0: .085, r1: .1, r2: .12, sag: .1, len: 1.0 } });
  const zL = camDepth(vLerp(S.J.elL, S.J.wrL, .3)); parts.push({ z: zL - .025, fn: c => { drawSleeve(c, S, DK, F, t, 'L', 'back', opt); drawSleeve(c, S, DK, F, t, 'L', 'front', opt); } });
  parts.push({ z: Math.min(camDepth(vLerp(S.J.shR, S.J.elR, .3)), camDepth(vLerp(S.J.elR, S.J.wrR, .3))) - .045, fn: c => e2Tube(c, [vAdd(S.J.shR, mApply(S.M.chest, [.02 * k, .015 * k, 0])), vLerp(S.J.shR, S.J.elR, .45)], v => .064 * k * lerp(1, 1.08, v), '#f0eee8', opt, { hint: S.M.chest[2], surf: { borders: { v0: false, v1: true } } }) });
  // vest shoulder straps over the T-shirt (right side visible)
  e2Boots(S, D, parts, opt, { col: '#141218', top: .38, r: .066 });
  if (D.blaze && typeof fireBeniParts === 'function') fireBeniParts(S, D, F, t, parts, opt);
}

// =============================================================================================== SIGNATURE POSES
Object.assign(POSES, {
  // Joker: loose, theatrical, crooked
  joker_lean: { sp: -.08, ss: .1, hp: .12, hr: .12, aL: [.15, .3, .3], eL: .6, hL: 'relax', aR: [.2, .4, -.2], eR: .9, hR: 'relax', lL: [.15, .1, .3], kL: .25, lR: [-.05, .12, -.2], kR: .05, face: { mouth: 'grin', mouthOpen: .3, lid: .25 } },
  joker_hat: { sp: .02, hp: .3, hr: -.1, aR: [2.5, -.3, 0], eR: 2.15, hR: 'relax', wR: [.3, 0], aL: [.2, .5, 0], eL: .4, lL: [.1, .1, .3], kL: .1, lR: [-.05, .08, -.2], face: { mouth: 'grin', mouthOpen: .45, shadow: .6, lid: .35 } },
  joker_cards: { sp: .05, st: -.3, hp: .05, hr: .1, aR: [1.35, .35, 0], eR: .35, hR: 'sign', wR: [-.4, .2], cards: 5, cardsLit: 0, aL: [.2, .5, 0], eL: .5, lL: [.3, .15, .3], kL: .35, lR: [-.2, .15, -.2], kR: .1, face: { mouth: 'grin', mouthOpen: .5, lid: .3 } },
  joker_throwWind: { sp: -.1, st: .8, hp: .1, aR: [1.5, -1.2, 0], eR: 1.6, hR: 'sign', cards: 4, cardsLit: 1, aL: [1.2, .4, 0], eL: .4, hL: 'open', lL: [.5, .2, .3], kL: .55, lR: [-.4, .15, -.2], kR: .35 },
  joker_throw: { sp: .4, st: -.8, hp: .15, aR: [1.4, .9, 0], eR: .05, hR: 'open', wR: [.3, 0], aL: [.6, PI * .85, 0], eL: .9, hL: 'open', lL: [.9, .2, .3], kL: .9, lR: [-.8, .15, -.2], kR: .2, fR: .4, face: { mouth: 'grin', mouthOpen: .8, eye: 1.1, lid: .2 } },
  joker_smoke: { sp: 0, hp: -.15, hy: .1, aR: [.9, -.6, 0], eR: 2.4, hR: 'sign', wR: [-.3, 0], aL: [.5, -.5, -.3], eL: 1.9, hL: 'relax', lL: [.1, .1, .3], kL: .1, face: { mouth: 'smirk', eye: .55, lid: .2 } },
  joker_crouch: { sp: .5, hp: -.45, aR: [.6, .8, 0], eR: .5, hR: 'claw', aL: [.7, .4, 0], eL: .9, hL: 'claw', lL: [1.3, .35, .3], kL: 2.2, lR: [.4, .3, -.3], kR: 2.0, fR: .6, face: { mouth: 'grin', mouthOpen: .9, eye: 1.15, pupil: .5, lid: .1 } },
  joker_laugh: { sp: -.35, hp: -.75, aR: [.5, .9, 0], eR: 1.0, hR: 'open', aL: [.5, .9, 0], eL: 1.0, hL: 'open', lL: [.2, .15, .3], kL: .2, face: { mouth: 'laugh', mouthOpen: 1, closed: 1, eye: .2 } },
  // Benimaru: slouched calm, then explosive; iai hand-sword
  beni_idle: { sp: .06, ss: -.05, hp: .18, aL: [.1, .5, 0], eL: .4, aR: [.12, .6, 0], eR: .3, hR: 'relax', lL: [.1, .12, .3], kL: .15, lR: [-.04, .1, -.2], face: { eye: .7, lid: .1, mouth: 'line' } },
  beni_shoulder: { sp: .02, hp: .1, aR: [2.3, -.1, 0], eR: 2.2, hR: 'grip', sword: { hand: 'R', dir: [.2, .45, -.87] }, aL: [.12, .5, 0], eL: .4, lL: [.12, .14, .3], kL: .15, lR: [-.05, .12, -.2], face: { eye: .72, lid: .12 } },
  beni_iaiReady: { sp: .35, st: .7, hp: .1, hy: -.5, aR: [.75, -.75, 0], eR: 1.5, hR: 'flat', wR: [.2, 0], aL: [.45, -.1, 0], eL: 1.5, hL: 'fist', lL: [.85, .3, .3], kL: 1.25, lR: [-.6, .25, -.3], kR: .6, fR: .5, face: { eye: .75, lid: .4, browA: .4 } },
  beni_iaiSlash: { sp: .3, st: -.9, hp: .1, hy: .3, aR: [1.5, 1.35, 0], eR: .02, hR: 'flat', wR: [0, 0], aL: [.5, -.3, 0], eL: 1.6, hL: 'fist', lL: [1.0, .3, .3], kL: 1.2, lR: [-.75, .25, -.3], kR: .3, fR: .5, face: { eye: .9, lid: .5, browA: .6, mouth: 'frown' } },
  beni_crimsonMoon: { sp: -.15, hp: -.35, aR: [2.85, .35, 0], eR: .25, hR: 'open', aL: [2.85, .35, 0], eL: .25, hL: 'open', lL: [.35, .3, .3], kL: .45, lR: [-.3, .3, -.3], kR: .3, face: { eye: .9, lid: .4, mouth: 'shout', mouthOpen: .7, browA: .5 } },
  beni_moonThrow: { sp: .45, st: -.3, hp: .2, aR: [1.7, .1, 0], eR: .1, hR: 'open', aL: [1.6, -.15, 0], eL: .2, hL: 'open', lL: [1.0, .2, .2], kL: 1.0, lR: [-.85, .2, -.2], kR: .2, fR: .5, face: { eye: 1.0, lid: .45, mouth: 'shout', mouthOpen: .8 } },
  beni_matoiSwing: { sp: .2, st: -.9, hp: .1, aR: [1.4, 1.2, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [.95, .1, .3], two: false }, aL: [.8, -.6, 0], eL: 1.2, hL: 'fist', lL: [.8, .3, .3], kL: .9, lR: [-.6, .25, -.3], kR: .3 },
  beni_ride: { sp: .25, hp: -.25, aR: [1.4, .1, 0], eR: .5, hR: 'grip', sword: { hand: 'R', dir: [.1, -.55, .85] }, aL: [1.3, -.2, 0], eL: .6, hL: 'grip', lL: [.7, .15, .1], kL: 1.3, lR: [.2, .12, -.1], kR: 1.6, fL: .5, fR: .6, ground: false },
});
SIGNATURE.joker = ['joker_lean', 'joker_cards', 'joker_hat', 'joker_throw', 'joker_smoke', 'joker_crouch', 'joker_laugh', 'joker_throwWind'];
SIGNATURE.benimaru = ['beni_idle', 'beni_shoulder', 'beni_iaiReady', 'beni_iaiSlash', 'beni_crimsonMoon', 'beni_moonThrow', 'beni_matoiSwing', 'beni_ride'];
