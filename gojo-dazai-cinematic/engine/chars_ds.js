/* engine/chars_ds.js (E1) - Demon Slayer: Rengoku Kyojuro (Flame Hashira) + Akaza (Upper Moon Three).
   CAST.rengoku forms: base (sword sheathed on the hip until drawn), flame (blade burning: fire on the Nichirin blade),
                       ninth (Ninth Form: Rengoku - blazing body aura, hair flaring), wounded (left eye crushed, blood)
   CAST.akaza   forms: base, compass (Destructive Death: Compass Needle - glowing snowflake compass under his feet),
                       battle (veins + glowing tattoos), regen (torn haori, blood, regenerating), crumble (head cut: ash flakes)
   Signature poses (POSES.*): see SIGNATURE.rengoku / SIGNATURE.akaza.                                                */
'use strict';
const DS_UNIFORM = '#24212c';
// ============================================================================================ RENGOKU KYOJURO
CAST.rengoku = design(SHINIGAMI, {
  name: 'Rengoku Kyojuro', h: 1.77, body: { width: 1.03, shoulders: 1.06, limbs: 1.06 }, skin: '#f9ddc4', skinShade: '#dba58f',
  kosode: DS_UNIFORM, collar: { none: true },
  sleeve: { bare: true }, armSkin: DS_UNIFORM, handSkin: '#f9ddc4',
  scarf: { col: DS_UNIFORM, v0: .955, v1: 1.0 },                       // stand-up gakuran collar
  obi: { col: '#f2efe6', v0: .05, v1: .12 },                         // white belt
  haori: { col: '#f7f1e2', lining: '#f0dcb0', len: .86, sleeves: false, capSleeve: true, capLen: 1.55, capR: [.105, .165], hem: 'none', open: .34, collarLen: .55,
    flames: { col: '#f6b82a', col2: '#e2481c', col3: '#b81810', h: .42, n: 14 } },
  hakama: { col: DS_UNIFORM, r0: .1, r1: .11, r2: .072, lowerCol: '#c42a1c', lowerV: .6, ties: false,
    lowerPattern: (c, surf, G, S, side) => flamePattern(c, { fn: (u, v) => surf.fn(u, lerp(.6, 1, 1 - v)) }, { col: '#f4b62a', col2: '#f4b62a', h: .55, n: 9 }, 1, side === 'L' ? 5 : 9) },
  feet: { col: '#5a3a2c', sole: '#f2ede4' },
  torsoDetail: (c, S, D, T, G) => { // gold buttons down the front + breast pocket line
    const s = gridScale(G); for (let i = 0; i < 5; i++) { const fr = surfFrame(T.surf, 0, .3 + i * .13); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const p = proj2(fr.p), r = Math.max(1.4, .011 * s); c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.fillStyle = '#e8c24a'; c.fill(); c.lineWidth = lineW(s, .4); c.strokeStyle = LIGHT.ink; c.stroke(); }
    strokeRuns(c, surfLine(T.surf, [[.06, .74], [.1, .74], [.14, .74]], .05), lineW(s, .5), LIGHT.ink);
    strokeRuns(c, surfLine(T.surf, [[0, .2], [0, .4], [0, .6], [0, .8], [0, .95]], .05), lineW(s, .55), LIGHT.ink);
  },
  face: {
    eye: { w: 1.05, h: .5, irisR: .34, irisCol: '#f6c02a', irisLight: '#fff0a0', irisDark: '#c42a18', irisRing: '#d83a1c', pupilR: .25, pupilCol: '#fff4c8', round: true, tilt: .08, thick: 1.25, flick: .05, lashes: true, crease: true, lidShade: '#a0502a' },
    eyeSize: .4, eyeY: -.2, defaultExpr: 'smile', brow: { browW: .13, browY: .07, browCol: '#c8401c', browFork: true },
    headShape: { jaw: .9, chin: 1.0 }, mouth: { mouthW: 1.15, teethN: 6 },
    hair: { col: '#f8c82e', shadeCol: '#e8922a', tipCol: '#dc3418', tipLen: .34, gloss: true, glossCol: '#fff0a0', springK: 40, springC: 6,
      cap: { front: .52, side: .1, back: -.6, jag: .05, jagN: 16 },
      locks: () => [
        // flaring mane: big spikes fanning out and up around the crown and sides (flame silhouette)
        ...lockFan(7, 1.1, 5.18, .75, (th, u, i) => ({ len: 1.2 + .3 * Math.sin(u * Math.PI) + .15 * (i % 2), w: .7, rootR: .93, dir: dirOut(th, .9 + .25 * (i % 2), -.2, -.35), curl: [0, -.55, -.25], tw: .32, tip: 1.6, back: true, tipCol: '#dc3418' })),
        ...lockFan(7, 1.2, 5.08, .3, (th, u, i) => ({ len: 1.3 + .3 * Math.sin(u * Math.PI), w: .7, rootR: .94, dir: dirOut(th, .45, .1, -.2), curl: [0, -.45, 0], tw: .32, tip: 1.55, back: true })),
        // ponytail (messy) behind
        { th: Math.PI, ph: .55, len: 2.0, w: .65, rootR: .97, dir: [0, .1, -1], grav: 1.1, curl: [0, .2, 0], tw: .4, tip: 1.3, back: true, seg: 9 },
        { th: Math.PI + .3, ph: .45, len: 1.7, w: .45, rootR: .97, dir: [.25, 0, -1], grav: 1.0, tw: .4, tip: 1.4, back: true, seg: 9 },
        // shoulder-length side bangs + chin-length bangs framing the face
        { th: 1.2, ph: .25, len: 1.75, w: .4, rootR: .97, dir: [.5, -.7, .2], grav: 1, tw: .3, tip: 1.3, front: true, seg: 9 },
        { th: -1.2, ph: .25, len: 1.75, w: .4, rootR: .97, dir: [-.5, -.7, .2], grav: 1, tw: .3, tip: 1.3, front: true, seg: 9 },
        { th: .85, ph: .55, len: 1.25, w: .38, rootR: .97, dir: [.6, -.4, .6], grav: .9, tw: .3, tip: 1.4, front: true },
        { th: -.85, ph: .55, len: 1.25, w: .38, rootR: .97, dir: [-.6, -.4, .6], grav: .9, tw: .3, tip: 1.4, front: true },
        // spiky bangs over the forehead (eyes stay readable)
        ...lockFan(4, -.5, .5, .95, (th, u) => ({ len: .8 + .15 * Math.sin(u * Math.PI), w: .5, rootR: .96, dir: [Math.sin(th) * .8, .35, 1], curl: [0, -1.7, -.35], tw: .3, tip: 1.5, front: true, gloss: true })),
        // crown spikes standing up
        ...lockFan(3, -.7, .7, 1.25, (th, u) => ({ len: .9, w: .6, rootR: .95, dir: [Math.sin(th) * .6, 1, -.3], curl: [0, -.4, -.6], tw: .32, tip: 1.6 })),
      ],
    },
    markings: (c, HM, e, lod, D) => { if (D.eyeCrushed) { const fr = faceFrame(HM, -.44, -.2, .5, .5); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = '#5a0a10'; cc.beginPath(); cc.ellipse(0, 0, .75, .45, .1, 0, TAU); cc.fill(); cc.fillStyle = '#a0141c'; cc.beginPath(); cc.moveTo(-.2, -.2); cc.quadraticCurveTo(-.1, -1.2, 0, -1.9); cc.quadraticCurveTo(.12, -1.1, .25, -.2); cc.fill(); }, .05, fr.n); } },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (D.eyeCrushed) parts.push({ z: zc - .003, fn: c => { const fr = faceFrame(HM, -.44, -.2, .5, .42); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = '#4a060c'; cc.beginPath(); cc.ellipse(0, 0, .62, .32, .1, 0, TAU); cc.fill(); }, .02, fr.n); } }); },
  },
  // Nichirin blade: crimson-orange steel, flame tsuba, inscription "悪鬼滅殺"
  sword: { len: .98, w: .033, curve: .03, handle: .27, tsuba: 'none', col: '#4a1416', edgeCol: '#e8502a', hiltCol: '#efe7d6', wrapCol: '#c83020',
    extra: (ctx, fr, pts, s, flatMode, opt, S) => { // flame-shaped tsuba (red, eight flame tongues)
      const k = S.B.h / 1.8, g0 = vMad(fr.grip, fr.dir, .27 * k * .35), gp = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, rr = .042 * k * (1 + .55 * Math.pow(Math.max(0, Math.sin(a * 4)), 2)); gp.push(vAdd(g0, vAdd(vMul(fr.flat, Math.cos(a + .2 * Math.sin(a * 4)) * rr), vMul(fr.edge, Math.sin(a + .2 * Math.sin(a * 4)) * rr)))); }
      fill3D(ctx, gp, flatMode ? opt.col : tones('#f07a1c').base, flatMode ? 0 : lineW(s, .6));
      if (!flatMode) { const gp2 = gp.map(p => vLerp(g0, p, .62)), gp3 = gp.map(p => vLerp(g0, p, .3)); fill3D(ctx, gp2, tones('#a8141a').base, 0); fill3D(ctx, gp3, tones('#ffd23a').base, 0); }
      if (!flatMode && s > 600) { const a = proj2(pts(.25, .45)), b = proj2(pts(.6, .45)); ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0])); ctx.fillStyle = 'rgba(40,10,10,.75)'; ctx.font = `900 ${Math.max(6, .022 * s)}px "IPAGothic", sans-serif`; ctx.textBaseline = 'middle'; ctx.fillText('惡鬼滅殺', 0, 0); ctx.restore(); }
      if (opt.mode !== 'flat' && S.design && false) {}
    } },
  extras: (S, D, F, t, parts, opt) => {
    hipSheath(S, D, parts, opt, { col: '#1c1a20', tsubaCol: '#d4301c', hiltCol: '#efe7d6', flameGuard: true });
    if (D.bladeFire && S.pose.sword && !S.pose.sword.sheathed) rengokuBladeFire(S, D, F, t, parts, opt);
    if (D.aura) dsFlameAura(S, D, F, t, parts, opt, D.aura);
    woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  },
  forms: { base: {}, flame: { bladeFire: 1 }, ninth: { bladeFire: 1.4, aura: 1 }, wounded: { bladeFire: 1, wounds: 3, eyeCrushed: true } },
});
CAST.rengoku.drawHead = stdHead(CAST.rengoku);
// fire licking along the blade (drawn with the figure so it is depth sorted with the sword)
function rengokuBladeFire(S, D, F, t, parts, opt) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8, fr = swordFrame(S, D, S.pose.sword), L = .98 * k, amt = D.bladeFire || 1;
  const fi = Math.floor(t * 12); // flames on twos
  parts.push({ z: camDepth(vMad(fr.grip, fr.dir, .4)) - .01, fn: c => {
    for (const [col, wk] of [['#e2381a', 1], ['#f8a02a', .66], ['#fff2b0', .33]]) {
      const left = [], right = []; for (let i = 0; i <= 12; i++) { const u = i / 12, p = vMad(fr.grip, fr.dir, .1 * k + u * L), fl = (.05 + .07 * Math.sin(u * Math.PI)) * k * amt * wk * (.75 + .5 * hash(fi * 7 + i)); const up = vNorm(vAdd(vMul(fr.edge, -1), [0, .6, 0]));
        left.push(proj2(vMad(vMad(p, up, fl * 1.6), fr.edge, fl * .4))); right.push(proj2(vMad(p, fr.edge, fl * .45))); }
      const tip = proj2(vMad(fr.grip, fr.dir, .1 * k + L * 1.08)); const poly = catmull(left.concat([tip], right.reverse()), true, 2);
      polyPath(c, poly); c.fillStyle = col; c.globalAlpha = .92; c.fill(); c.globalAlpha = 1; if (wk === 1) { c.lineWidth = lineW(pxScale(fr.grip), .6); c.strokeStyle = '#6a0e08'; c.stroke(); }
    }
  } });
}
// flame aura licking up from the body (Ninth Form): tongues around the silhouette, depth split front/back
function dsFlameAura(S, D, F, t, parts, opt, amt = 1, cols = ['#d8281a', '#f8902a', '#ffe8a0']) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8, fi = Math.floor(t * 12), J = S.J, base = vLerp(J.anL, J.anR, .5);
  for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + hash(i) * .3, back = Math.cos(an - (S.pose.yaw || 0)) < 0;
    const r0 = (.28 + .08 * hash(i * 3)) * k, p0 = vAdd(base, [Math.sin(an) * r0, .1 * k, Math.cos(an) * r0]);
    parts.push({ z: camDepth(p0) + (back ? .4 : -.4), fn: c => { const s = pxScale(p0), h = (.6 + .7 * hash(i * 5 + fi)) * k * amt; const a = proj2(p0), top = proj2(vAdd(p0, [Math.sin(an) * .25 * k, h, Math.cos(an) * .25 * k])); const w = .1 * k * s * amt;
      for (let j = 0; j < 3; j++) { const ww = w * (1 - j * .3), hh = 1 - j * .28, tx = lerp(a[0], top[0], hh), ty = lerp(a[1], top[1], hh), sw = Math.sin(fi * .7 + i) * ww * .6;
        c.beginPath(); c.moveTo(a[0] - ww, a[1]); c.quadraticCurveTo(a[0] - ww * 1.1 + sw, lerp(a[1], ty, .5), tx + sw, ty); c.quadraticCurveTo(a[0] + ww * 1.1 + sw, lerp(a[1], ty, .5), a[0] + ww, a[1]); c.closePath(); c.fillStyle = cols[j]; c.globalAlpha = back ? .85 : .32; c.fill(); c.globalAlpha = 1; } } });
  }
}

// ============================================================================================ AKAZA
const AKAZA_INK = '#2a3a9a';
CAST.akaza = design(SHINIGAMI, {
  name: 'Akaza', h: 1.73, body: { width: 1.04, shoulders: 1.12, limbs: 1.2, depth: 1.05 }, skin: '#f3f1e2', skinShade: '#b9b6c8',
  kosode: '#f3f1e2', collar: { none: true }, sleeve: { none: true }, armSkin: '#f3f1e2', handSkin: '#f3f1e2', fingerCol: '#2c3c94', nailCol: '#f08a28',
  haori: { col: '#6c2a5c', lining: '#4a1a3e', len: .03, flare: 0, sleeves: false, hem: 'none', open: .62, collarLen: .4, squares: { col: '#3a0e30', n: 6 } },
  hakama: { col: '#f0eee6', r0: .12, r1: .14, r2: .15, len: .42, ties: false },
  obi: { col: '#2ab6ae', v0: .02, v1: .06 },
  feet: { col: '#f3f1e2', sandal: false },
  torsoDetail: (c, S, D, T, G) => { // muscle definition + criminal-tattoo lines
    const s = gridScale(G), lw = lineW(s, .45), mk = rgba('#8a86a0', .8);
    strokeRuns(c, surfLine(T.surf, [[.93, .62], [.97, .58], [.03, .58], [.07, .62]].map(([u, v]) => [u, v]), .05), lw, mk);              // pec line
    for (const v of [.42, .33, .24]) strokeRuns(c, surfLine(T.surf, [[.955, v], [.99, v - .01], [.01, v - .01], [.045, v]], .05), lw * .8, mk); // abs
    torsoLines(c, S, D, [[[0, .97], [0, .5]], [[.07, .99], [.12, .78], [.24, .62], [.25, .32]], [[.93, .99], [.88, .78], [.76, .62], [.75, .32]], [[.25, .32], [.0, .2], [.75, .32]], [[.2, .14], [0, .1], [.8, .14]]], AKAZA_INK, 2.2, .008);
    for (const v of [.985, .94]) torsoLines(c, S, D, [[[0, v], [.25, v], [.5, v], [.75, v], [1, v]]], AKAZA_INK, 1.4, .006);
    if (D.glowInk) torsoLines(c, S, D, [[[0, .97], [0, .5]]], '#8ad8ff', .6, .004);
  },
  face: {
    eye: { w: 1.08, h: .4, irisR: .3, irisCol: '#f4d62c', irisLight: '#fff6a0', irisDark: '#c89610', white: '#6a9ee0', noPupil: true, irisKanji: ['上弦', '参'], kanjiCol: '#1a1430', ink: '#7a1a48', tilt: -.06, thick: 1.25, flick: .09, lashes: true, crease: false, lidShade: '#2a4a9a' },
    eyeSize: .38, eyeY: -.2, defaultExpr: 'smirk', brow: { browW: .08, browY: .03, browCol: '#c8406a' }, headShape: { jaw: .9, chin: .95 }, mouth: { mouthW: 1.15, teethN: 6, fangs: true },
    hair: { col: '#ea5a82', shadeCol: '#b4285a', gloss: true, glossCol: '#ffb0c8', springK: 70, springC: 9, cap: { front: .6, side: .12, back: -.62, jag: .07, jagN: 18 },
      locks: () => [
        ...lockFan(12, .9, 5.38, .5, (th, u, i) => ({ th, ph: .35 + .3 * (i % 2), len: .7 + .2 * hash(i * 7), w: .5, rootR: .95, dir: dirOut(th, .35 + .3 * (i % 2), .1, -.1), curl: [0, -.6, 0], tw: .33, tip: 1.7, back: Math.cos(th) < 0 })),
        ...lockFan(6, -1.6, 1.6, 1.1, (th, u, i) => ({ len: .75, w: .5, rootR: .95, dir: [Math.sin(th) * .7, .9, -.25], curl: [0, -.8, -.3], tw: .33, tip: 1.7 })),
        ...lockFan(5, -.7, .7, .92, (th, u) => ({ len: .7 + .1 * (u === .5 ? 1 : 0), w: .4, rootR: .96, dir: [Math.sin(th) * .9, .5, 1], curl: [0, -1.9, -.3], tw: .3, tip: 1.7, front: true, gloss: true })),
        { th: 1.15, ph: .25, len: .8, w: .32, rootR: .97, dir: [.4, -.5, .5], grav: .5, tw: .3, tip: 1.6, front: true },
        { th: -1.15, ph: .25, len: .8, w: .32, rootR: .97, dir: [-.4, -.5, .5], grav: .5, tw: .3, tip: 1.6, front: true },
      ] },
    markings: (c, HM, e, lod, D) => { // face tattoos: lines from below the ears curving through the eyes to the temples + forehead line
      for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .62, -.12, .2, 1); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { inkPts(cc, catmull([[.9, -.55], [.45, -.2], [.05, .02], [-.35, .1]], false, 4), .07, AKAZA_INK, [.2, .3]); inkPts(cc, catmull([[.15, .1], [.4, .35], [.75, .6]], false, 4), .06, AKAZA_INK, [.2, .4]); }, -1, fr.n); }
      const f2 = faceFrame(HM, 0, .3, .7, .7); decal(c, f2.p, f2.tu, f2.tv, cc => inkPts(cc, [[0, .9], [0, .2], [0, -.55]], .085, AKAZA_INK, [.1, .5]), -1, f2.n);
      if (D.veins) for (const sg of [1, -1]) { const f3 = faceFrame(HM, sg * .55, .28, .3, .35); decal(c, f3.p, sg > 0 ? f3.tu : vMul(f3.tu, -1), f3.tv, cc => { cc.strokeStyle = '#8a2a5a'; cc.lineWidth = .08; cc.beginPath(); cc.moveTo(0, -.6); cc.lineTo(.15, 0); cc.lineTo(-.1, .4); cc.moveTo(.15, 0); cc.lineTo(.4, .3); cc.stroke(); }, -1, f3.n); }
    },
  },
  extras: (S, D, F, t, parts, opt) => {
    const J = S.J, k = S.B.h / 1.8;
    // arm tattoos: rings around the biceps + lines down to the wrists
    for (const sd of ['L', 'R']) { const zA = camDepth(vLerp(J['el' + sd], J['wr' + sd], .3)), zT = camDepth(vLerp(J.pelvis, J.neck, .5));
      parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const r = S.B.limbR.ua * 1.25;
        limbRing(c, J['sh' + sd], J['el' + sd], .45, r * 1.05, AKAZA_INK, 1.3); limbRing(c, J['sh' + sd], J['el' + sd], .6, r * 1.02, AKAZA_INK, 1.3);
        const fwd = S.M.chest[2]; limbLine(c, J['sh' + sd], J['el' + sd], fwd, r * 1.1, AKAZA_INK, 1.2, .05, .45); limbLine(c, J['el' + sd], J['wr' + sd], vNorm(vAdd(fwd, [0, .3, 0])), S.B.limbR.fa * 1.05, AKAZA_INK, 1.2, .1, 1);
        limbRing(c, J['el' + sd], J['wr' + sd], .96, S.B.limbR.fa * .85, AKAZA_INK, 1.1); } });
      // ankle bead chains (red pearls)
      parts.push({ z: camDepth(J['an' + sd]) - .015, fn: c => { if (LIGHT.override) return; const an = J['an' + sd], M = S.M['shin' + sd]; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, p = vAdd(an, mApply(M, [Math.sin(a) * .055 * k, .02 * k, Math.cos(a) * .055 * k])); if (vDot(vNorm(vSub(p, an)), toCam(p)) < -.2) continue; const q = project(p); if (!q) continue; const r = .016 * k * q.s; c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.fillStyle = opt.mode === 'flat' ? opt.col : '#d8243a'; c.fill(); if (opt.mode !== 'flat') { c.lineWidth = lineW(q.s, .4); c.strokeStyle = LIGHT.ink; c.stroke(); c.fillStyle = '#ff9aa8'; c.beginPath(); c.arc(q.x - r * .3, q.y - r * .3, r * .3, 0, TAU); c.fill(); } } } });
      // toes dark blue (feet tattoo)
    }
    // rope belt tassels (pink) front + back
    for (const [th, dz] of [[0, 1], [Math.PI, -1]]) { const T0 = () => torsoModel(S, D, .02 * k).ringAt(.04, th); const p0 = T0();
      parts.push({ z: camDepth(p0) - .05 * dz * 0 - .02, fn: c => { const p1 = vAdd(p0, [0, -.07 * k, 0]), a = proj2(p0), b = proj2(p1), s = pxScale(p0); if (opt.mode === 'flat') return; ctx2line(c, a, b, .02 * k * s, '#2ab6ae', lineW(s, .5)); c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - .045 * k * s, b[1] + .09 * k * s); c.quadraticCurveTo(b[0], b[1] + .11 * k * s, b[0] + .045 * k * s, b[1] + .09 * k * s); c.closePath(); c.fillStyle = tones('#f05a9a').base; c.fill(); c.lineWidth = lineW(s, .5); c.strokeStyle = LIGHT.ink; c.stroke(); } });
    }
    if (D.compass) parts.push({ z: camDepth(vLerp(J.anL, J.anR, .5)) + 2.5, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; if (typeof fxCompass === 'function') fxCompass(c, [J.pelvis[0], .01, J.pelvis[2]], 1, { r: 1.6 * k, alpha: .9, rot: S.pose.yaw || 0 }); } });
    if (D.crumble) dsCrumble(S, D, F, t, parts, opt, D.crumble);
    woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  },
  forms: { base: {}, compass: { compass: true, veins: true }, battle: { veins: true, glowInk: true }, regen: { wounds: 3, haori: { col: '#6c2a5c', lining: '#4a1a3e', len: .0, sleeves: false, hem: 'none', open: .9, collarLen: .3, torn: .8 } }, crumble: { crumble: 1, wounds: 2 } },
});
CAST.akaza.drawHead = stdHead(CAST.akaza);
// demon death: ash flakes peeling off the silhouette and drifting up (crumbling from the neck)
function dsCrumble(S, D, F, t, parts, opt, amt = 1) {
  if (opt.mode === 'flat' || LIGHT.override) return; const k = S.B.h / 1.8, J = S.J;
  parts.push({ z: camDepth(J.head) - .5, fn: c => { for (let i = 0; i < 80; i++) { const src = ['head', 'neck', 'shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'abd', 'pelvis'][i % 10], p0 = J[src], u = (t * .35 + hash(i * 3)) % 1; const p = vAdd(p0, [(hash(i) - .5) * .3 * k + u * .6 * k, u * 1.6 * k, (hash(i * 7) - .5) * .3 * k]); const q = project(p); if (!q) continue; const r = Math.min((.02 + .03 * hash(i * 11)) * k * q.s, 4 + 5 * hash(i * 13)) * (1 - u) * amt; c.save(); c.translate(q.x, q.y); c.rotate(i + t * 3); c.fillStyle = i % 3 ? '#4a3a40' : '#9a5a4a'; c.fillRect(-r, -r * .5, r * 2, r); c.restore(); } } });
}

// ============================================================================================ SIGNATURE POSES
Object.assign(POSES, {
  // Rengoku: big, open, confident; two-handed sword work
  rengoku_stance: { sp: .12, st: -.35, hp: .05, hy: .2, aR: [1.0, .15, 0], eR: 1.2, hR: 'grip', sword: { hand: 'R', dir: [.15, .78, .6], two: true }, aL: [1.0, -.4, 0], eL: 1.5, hL: 'grip', lL: [.55, .22, .25], kL: .7, lR: [-.4, .2, -.3], kR: .35, face: { eye: 1.15, mouth: 'smile', brow: .05, browA: .25 } },
  rengoku_unknowingWind: { sp: .45, st: .6, hp: .2, hy: -.3, aR: [1.2, 1.4, 0], eR: .6, hR: 'grip', sword: { hand: 'R', dir: [.8, .1, -.55], two: true }, aL: [1.1, .9, 0], eL: 1.4, hL: 'grip', lL: [.95, .25, .2], kL: 1.25, lR: [-.6, .2, -.2], kR: .35, face: { eye: 1.1, lid: .3, mouth: 'shout', mouthOpen: .4, brow: -.3, browA: .6 } },
  rengoku_unknowing: { sp: .6, st: -.8, hp: .3, hy: .4, aR: [1.45, -.45, 0], eR: .08, hR: 'grip', sword: { hand: 'R', dir: [-.85, -.05, .5] }, aL: [1.2, PI * .8, 0], eL: .4, hL: 'open', lL: [1.2, .2, .2], kL: 1.35, lR: [-.95, .15, -.2], kR: .25, fR: .5, face: { eye: 1.1, lid: .35, mouth: 'shout', mouthOpen: .7, brow: -.3, browA: .6 } },
  rengoku_rising: { sp: -.15, st: -.3, hp: -.3, aR: [2.9, .1, 0], eR: .15, hR: 'grip', sword: { hand: 'R', dir: [.05, .95, .3], two: true }, aL: [2.7, -.2, 0], eL: .3, hL: 'grip', lL: [.7, .15, .2], kL: 1.1, lR: [-.25, .12, -.2], kR: .2, fR: .4, face: { eye: 1.15, lid: .3, mouth: 'shout', mouthOpen: .8 } },
  rengoku_tigerWind: { sp: -.2, st: .5, hp: -.15, aR: [2.6, .9, 0], eR: 1.6, hR: 'grip', sword: { hand: 'R', dir: [.3, .45, -.85], two: true }, aL: [2.4, .4, 0], eL: 1.7, hL: 'grip', lL: [.6, .25, .3], kL: .7, lR: [-.35, .2, -.2], kR: .3, face: { eye: 1.15, lid: .35, mouth: 'shout', mouthOpen: .9, brow: -.35, browA: .65 } },
  rengoku_tiger: { sp: .75, st: -.2, hp: .4, aR: [1.15, .05, 0], eR: .08, hR: 'grip', sword: { hand: 'R', dir: [0, -.6, .8], two: true }, aL: [1.05, -.2, 0], eL: .3, hL: 'grip', lL: [1.15, .25, .2], kL: 1.4, lR: [-.85, .2, -.2], kR: .25, fR: .5, face: { eye: 1.15, lid: .35, mouth: 'shout', mouthOpen: 1, brow: -.35, browA: .7 } },
  rengoku_ninthWind: { sp: .85, st: .45, hp: .55, hy: -.1, aR: [.7, 1.9, 0], eR: .5, hR: 'grip', sword: { hand: 'R', dir: [.45, -.15, -.88], two: true }, aL: [.9, .9, 0], eL: 1.3, hL: 'grip', lL: [1.45, .3, .3], kL: 2.0, lR: [-.4, .25, -.2], kR: 1.0, fR: .6, face: { eye: 1.2, lid: .45, mouth: 'shout', mouthOpen: .6, brow: -.4, browA: .8 } },
  rengoku_ninth: { sp: .7, st: -.7, hp: .45, aR: [1.5, -.2, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [-.3, -.1, .95] }, aL: [1.0, PI * .85, 0], eL: .3, hL: 'open', lL: [1.3, .25, .2], kL: 1.5, lR: [-1.05, .2, -.2], kR: .2, fR: .6, face: { eye: 1.2, lid: .45, mouth: 'shout', mouthOpen: 1, brow: -.4, browA: .8 } },
  rengoku_blazing: { sp: .2, st: 1.2, hp: .1, hy: -.6, aR: [1.6, 1.6, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [.95, .25, -.1] }, aL: [1.3, -.6, 0], eL: 1.2, hL: 'fist', lL: [.6, .3, .4], kL: .8, lR: [-.4, .3, -.3], kR: .4, face: { eye: 1.15, lid: .3, mouth: 'shout', mouthOpen: .7 } },
  rengoku_heart: { sp: -.04, hp: -.08, aR: [1.4, -.25, 0], eR: 1.9, hR: 'fist', aL: [.15, .5, 0], eL: .25, hL: 'relax', lL: [.15, .14, .25], kL: .1, lR: [-.08, .14, -.25], kR: .05, sword: { sheathed: true }, face: { eye: 1.15, mouth: 'grin', mouthOpen: .5, brow: .1, browA: .3 } },
  rengoku_arms: { sp: -.06, hp: -.12, aR: [.95, -.75, .3], eR: 1.85, hR: 'fist', aL: [.95, -.75, -.3], eL: 1.85, hL: 'fist', lL: [.1, .16, .3], kL: .05, lR: [-.05, .16, -.3], kR: .05, sword: { sheathed: true }, face: { eye: 1.15, mouth: 'smile', brow: .1 } },
  rengoku_last: { sp: .1, hp: .3, hr: .05, aR: [.1, .3, 0], eR: .2, hR: 'relax', aL: [.08, .3, 0], eL: .2, hL: 'relax', lL: [.05, .1, .1], kL: .05, lR: [0, .1, -.1], kR: .04, sword: { sheathed: true }, face: { eye: .7, mouth: 'smile', brow: .25, browA: -.3, tears: 0 } },
  // Akaza: martial artist (Soryu style), compact guard, explosive strikes
  akaza_stance: { sp: .18, st: -.45, hp: .05, hy: .35, aL: [1.25, -.05, 0], eL: .55, hL: 'open', wL: [.5, 0], aR: [.55, .55, 0], eR: 2.0, hR: 'fist', lL: [.5, .35, .35], kL: .75, lR: [-.35, .3, -.35], kR: .55, face: { eye: 1.0, mouth: 'smirk', lid: .2 } },
  akaza_compass: { sp: .35, st: -.3, hp: -.05, hy: .3, aL: [1.3, .35, 0], eL: .3, hL: 'open', wL: [.6, 0], aR: [1.1, 1.3, 0], eR: .9, hR: 'open', lL: [.9, .55, .4], kL: 1.5, lR: [-.2, .5, -.4], kR: 1.1, face: { eye: 1.1, lid: .3, mouth: 'grin', mouthOpen: .3 } },
  akaza_punchWind: { sp: .2, st: .7, hp: .1, hy: -.4, aR: [.8, PI * .75, 0], eR: 2.1, hR: 'fist', aL: [1.4, -.2, 0], eL: .4, hL: 'open', lL: [.7, .3, .3], kL: .9, lR: [-.4, .25, -.3], kR: .45, face: { eye: 1.05, lid: .35, mouth: 'grin', mouthOpen: .4 } },
  akaza_punch: { sp: .45, st: -.75, hp: .2, hy: .35, aR: [1.55, -.1, 0], eR: .02, hR: 'fist', aL: [.7, .9, 0], eL: 2.1, hL: 'fist', lL: [1.05, .25, .3], kL: 1.2, lR: [-.85, .2, -.3], kR: .15, fR: .5, face: { eye: 1.1, lid: .4, mouth: 'shout', mouthOpen: .7 } },
  akaza_air: { sp: .3, st: -.6, hp: .15, aR: [1.6, -.05, 0], eR: .05, hR: 'fist', aL: [1.55, .1, 0], eL: .9, hL: 'fist', lL: [.6, .2, .2], kL: .9, lR: [-.3, .2, -.2], kR: .6, ground: false, face: { eye: 1.1, lid: .35, mouth: 'grin', mouthOpen: .6 } },
  akaza_kickWind: { sp: -.15, st: .4, hp: -.05, aL: [1.2, .6, 0], eL: 1.2, hL: 'fist', aR: [1.1, .8, 0], eR: 1.4, hR: 'fist', lL: [-.1, .25, 0], kL: .3, lR: [1.6, .3, -.6], kR: 2.0, face: { eye: 1.05, lid: .3, mouth: 'grin', mouthOpen: .3 } },
  akaza_kick: { sp: -.35, ss: .3, st: -.6, hp: -.15, aL: [1.0, 1.2, 0], eL: .7, hL: 'fist', aR: [1.3, 1.1, 0], eR: .6, hR: 'fist', lL: [-.15, .2, 0], kL: .25, lR: [1.75, .85, -.3], kR: .05, fR: .6, face: { eye: 1.1, lid: .35, mouth: 'shout', mouthOpen: .6 } },
  akaza_annihWind: { sp: .1, st: 1.0, hp: .0, hy: -.6, aR: [1.2, PI * .85, 0], eR: 1.7, hR: 'fist', aL: [1.4, -.5, 0], eL: .5, hL: 'open', lL: [.8, .45, .4], kL: 1.2, lR: [-.4, .4, -.4], kR: .8, face: { eye: 1.15, lid: .45, mouth: 'shout', mouthOpen: .9, vein: 1 } },
  akaza_annih: { sp: .6, st: -1.0, hp: .25, hy: .5, aR: [1.6, -.15, 0], eR: .0, hR: 'fist', aL: [.9, 1.3, 0], eL: 1.6, hL: 'fist', lL: [1.25, .3, .3], kL: 1.5, lR: [-1.0, .25, -.3], kR: .1, fR: .5, face: { eye: 1.15, lid: .45, mouth: 'shout', mouthOpen: 1, vein: 1 } },
  akaza_grin: { sp: -.05, ss: .06, hp: -.12, hr: .18, aR: [.25, .45, 0], eR: .4, hR: 'fist', aL: [.25, .45, 0], eL: .5, hL: 'relax', lL: [.1, .16, .3], kL: .1, lR: [-.05, .14, -.3], kR: .05, face: { eye: 1.05, lid: .15, mouth: 'grin', mouthOpen: .6, brow: .1, browA: .2 } },
  akaza_offer: { sp: -.02, hp: -.05, aR: [1.3, .05, 0], eR: .3, hR: 'open', wR: [-.4, 0], aL: [.15, .45, 0], eL: .3, hL: 'fist', face: { eye: 1.0, mouth: 'smile', brow: .1 } },
  akaza_regen: { sp: .45, ss: -.15, hp: .3, aR: [.4, .3, 0], eR: .6, hR: 'claw', aL: [.7, .5, 0], eL: 1.6, hL: 'claw', lL: [.6, .3, .3], kL: 1.2, lR: [-.2, .3, -.2], kR: .9, wounds: 2, face: { eye: 1.2, lid: .5, mouth: 'shout', mouthOpen: .8, vein: 1, shadow: .4 } },
});
SIGNATURE.rengoku = ['rengoku_stance', 'rengoku_unknowing', 'rengoku_rising', 'rengoku_tigerWind', 'rengoku_tiger', 'rengoku_ninthWind', 'rengoku_ninth', 'rengoku_heart'];
SIGNATURE.akaza = ['akaza_stance', 'akaza_compass', 'akaza_punchWind', 'akaza_punch', 'akaza_kick', 'akaza_annihWind', 'akaza_annih', 'akaza_grin'];
