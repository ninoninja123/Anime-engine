/* engine/chars_bleach.js (E1) - Urahara Kisuke (team Bleach, partner of CAST.kyoraku from chars.js).
   CAST.urahara forms: base (cane = sealed Benihime, fan), shikai (Benihime: straight blade with hooked tip, red tassel),
                       bankai (Kannonbiraki Benihime Aratame: kneeling giant doll behind him -> fxBenihimeDoll), wounded
   Effects: fxNakeBenihime (crimson crescent wave), fxBloodMistShield (hexagon shield), fxShibari (red thread net),
            fxBenihimeDoll (bankai doll, 2D painted on a 3D anchor), fxRikujokoro (six rods of light).                        */
'use strict';
CAST.urahara = design(SHINIGAMI, {
  name: 'Urahara Kisuke', h: 1.83, body: { width: .97, limbs: 1.0 }, skin: '#f6dcc4', skinShade: '#d4a58e',
  kosode: '#2b3b2c', collar: { under: '#2b3b2c', v0: .55, w: .7, shift: .04 }, sleeve: { col: '#15171a', lining: '#2b3b2c', r0: .09, r1: .11, r2: .14, sag: .18 },
  hakama: { col: '#2b3b2c', r0: .1, r1: .115, r2: .12 },
  haori: { col: '#15171a', lining: '#2a2c30', len: .82, sleeves: false, hem: 'hishi', patCol: '#e8efe6', open: .26, kanji: null },
  feet: { col: '#f0ece2', sole: '#7a5a3a' },
  face: {
    eye: { w: 1.05, h: .3, irisR: .24, irisCol: '#8a8e8a', irisDark: '#3a3e3a', tilt: .03, thick: 1.1, flick: .03, lashes: false, crease: true },
    eyeSize: .36, eyeY: -.2, defaultExpr: 'smile', brow: { browW: .07, browY: .03, browCol: '#8a7a50' }, headShape: { jaw: .88, chin: 1.0 },
    hair: { col: '#efe6b8', shadeCol: '#c8b880', springK: 40, springC: 6, cap: { front: .5, side: .05, back: -.7 },
      locks: () => [
        ...lockFan(9, 1.3, 4.98, .3, (th, u, i) => ({ len: 1.2 + .3 * hash(i), w: .45, rootR: .96, dir: dirOut(th, .1, .8, -.3), grav: .9, tw: .3, tip: 1.3, back: true })),
        // messy strands hanging between the eyes
        { th: .05, ph: .7, len: 1.25, w: .3, rootR: .97, dir: [0, -.3, 1], grav: 1.6, curl: [0, -.4, -.4], tw: .3, tip: 1.2, front: true },
        { th: .35, ph: .7, len: 1.15, w: .3, rootR: .97, dir: [.2, -.3, 1], grav: 1.6, curl: [.1, -.4, -.4], tw: .3, tip: 1.2, front: true },
        { th: -.3, ph: .7, len: 1.05, w: .3, rootR: .97, dir: [-.2, -.3, 1], grav: 1.6, curl: [-.1, -.4, -.4], tw: .3, tip: 1.2, front: true },
        { th: 1.1, ph: .35, len: 1.3, w: .34, rootR: .97, dir: [.4, -.6, .3], grav: 1.1, tw: .3, tip: 1.3, front: true },
        { th: -1.1, ph: .35, len: 1.3, w: .34, rootR: .97, dir: [-.4, -.6, .3], grav: 1.1, tw: .3, tip: 1.3, front: true },
      ] },
    markings: (c, HM, e, lod, D) => { // stubble on the chin + hat shadow over the eyes
      if (lod > 0) { const fr = faceFrame(HM, 0, -.95, .5, .5); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = rgba('#8a7a50', .55); for (let i = 0; i < 30; i++) cc.fillRect((hash(i * 3) - .5) * 1.1, (hash(i * 5) - .5) * .7, .05, .05); }, .1, fr.n); }
      if (!D.noHat) { const fh = faceFrame(HM, 0, .2, .7, 1); decal(c, fh.p, fh.tu, fh.tv, cc => { cc.fillStyle = rgba('#203024', .42); cc.beginPath(); cc.moveTo(-1.5, 1.5); cc.lineTo(1.5, 1.5); cc.lineTo(1.5, -.25); cc.quadraticCurveTo(0, -.45, -1.5, -.25); cc.closePath(); cc.fill(); }, -1, fh.n); }
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (!D.noHat) parts.push({ z: camDepth(HM.toW([0, 1.0, 0])) - .05, fn: c => drawBucketHat(c, HM, opt) }); },
  },
  sword: { len: .92, w: .03, curve: 0, handle: .3, tsuba: 'none', col: '#d0d8e0', hiltCol: '#4a3a2a', wrapCol: '#6a5a40', drawHandle: true,
    pommel: (ctx, hA, dir, flat, edge, s, fm, opt) => { const a = proj2(hA), b = proj2(vMad(vMad(hA, dir, -.1), [0, -1, 0], .22)); ctx2line(ctx, a, b, .02 * s, fm ? opt.col : '#d2203a', 1.2); } },
  extras: (S, D, F, t, parts, opt) => { if (D.cane && (!S.pose.sword || S.pose.sword.sheathed)) uraharaCane(S, D, parts, opt); woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0); },
  forms: {
    base: { cane: true, sword: { len: .92, w: .022, curve: 0, handle: .3, tsuba: 'none', col: '#4a3a2a', edgeCol: '#5a4a34', hiltCol: '#4a3a2a', wrapCol: '#4a3a2a', widthFn: u => 1 } },
    shikai: { sword: { len: .95, w: .036, curve: 0, handle: .27, tsuba: 'none', col: '#d8dee6', edgeCol: '#ffffff', hiltCol: '#2a2622', wrapCol: '#d2203a',
      bladePoly: (pts, bl) => { const top = [], bot = []; for (let i = 0; i <= 14; i++) { const u = i / 14 * bl * .93; top.push(pts(u, 0)); bot.push(pts(u, 1)); } return top.concat([pts(bl, -.6), pts(bl * .97, -1.4), pts(bl * .9, .1)]).concat(bot.reverse()); },
      pommel: (ctx, hA, dir, flat, edge, s, fm, opt) => { const a = proj2(hA), b = proj2(vMad(vMad(hA, dir, -.12), [0, -1, 0], .28)); ctx2line(ctx, a, b, .022 * s, fm ? opt.col : '#d2203a', 1.2); } } },
    bankai: { sword: { len: .95, w: .036, curve: 0, handle: .27, tsuba: 'none', col: '#d8dee6', edgeCol: '#ffffff', hiltCol: '#2a2622', wrapCol: '#d2203a' } },
    wounded: { wounds: 2, noHat: true },
  },
});
CAST.urahara.drawHead = stdHead(CAST.urahara);
// green-and-white striped bucket hat
function drawBucketHat(c, HM, opt) {
  const M = HM.M, top = HM.toW([0, .95, -.05]), r0 = HM.r * 1.08, r1 = HM.r * 1.75;
  const crown = { nu: 28, nv: 6, wrapU: true, fn: (u, v) => { const a = u * TAU, rr = lerp(r0 * .82, r0 * 1.05, v); return vAdd(top, vAdd(vMul(M[0], Math.sin(a) * rr), vAdd(vMul(M[2], Math.cos(a) * rr), vMul(M[1], HM.r * (.55 - v * .75))))); } };
  const brim = { nu: 28, nv: 3, wrapU: true, fn: (u, v) => { const a = u * TAU, rr = lerp(r0 * 1.03, r1, v); return vAdd(top, vAdd(vMul(M[0], Math.sin(a) * rr), vAdd(vMul(M[2], Math.cos(a) * rr), vMul(M[1], HM.r * (-.22 - v * .28 + .1 * Math.cos(a) * v))))); } };
  const stripes = (cc, G2, sg) => { const s = gridScale(G2); for (let i = 0; i < 28; i += 2) { const uv = [[i / 28, 0], [i / 28, 1]]; strokeRuns(cc, surfLine(crown, uv, -1), Math.max(1.5, s * .011), '#e8efe6'); } };
  drawSurf(c, sampleSurf(brim), Object.assign({ col: '#2f5d3a', side: 'both', backCol: '#1e3a26', shade: .2, borders: { v0: false, v1: true }, pattern: (cc, G2, sg) => { if (sg < 0) return; const s = gridScale(G2); for (let i = 0; i < 28; i += 2) strokeRuns(cc, surfLine(brim, [[i / 28, .05], [i / 28, 1]], -1), Math.max(1.5, s * .014), '#e8efe6'); } }, opt.surf || {}));
  const lid = { nu: 20, nv: 2, wrapU: true, fn: (u, v) => { const a = u * TAU, rr = r0 * .82 * v; return vAdd(top, vAdd(vMul(M[0], Math.sin(a) * rr), vAdd(vMul(M[2], Math.cos(a) * rr), vMul(M[1], HM.r * .55)))); } };
  drawSurf(c, sampleSurf(lid), Object.assign({ col: '#2f5d3a', side: 'both', backCol: '#2f5d3a', shade: .2, borders: { v0: false, v1: false } }, opt.surf || {}));
  drawSurf(c, sampleSurf(crown), Object.assign({ col: '#2f5d3a', shade: .15, borders: { v0: true, v1: false }, pattern: stripes }, opt.surf || {}));
}
function uraharaCane(S, D, parts, opt) { // cane held in the left hand / leaning
  const k = S.B.h / 1.8, hand = S.J.handL, base = vAdd(S.J.anL, mApply(S.M.pelvis, [.12 * k, -.05, .25 * k])); const top = vMad(hand, vNorm(vSub(hand, base)), .12 * k);
  parts.push({ z: camDepth(vLerp(hand, base, .5)) - .02, fn: c => { const surf = sTube([base, top], v => .016 * k, [1, 0, 0], 8, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#4a3a2a', shade: .1 }, opt.surf || {})); } });
}
// ------------------------------------------------------------------------------------------------ Urahara effects
function fxNakeBenihime(g, p, dir, t, o = {}) { const u = t / (o.dur || .8); if (t < 0 || u > 1) return; const d = vNorm(dir); let side = vNorm(vCross(d, [0, 1, 0])); const c = vMad(p, d, easeOut(u) * (o.len || 9));
  const pts = []; for (let i = 0; i <= 18; i++) { const a = (i / 18 - .5) * 2.4; pts.push(vAdd(vMad(c, d, -Math.abs(a) * .7), vAdd(vMul(side, a * 1.3 * (o.size || 1)), [0, Math.cos(a) * .5, 0]))); }
  const sp = pts.map(q => proj2(q)), s0 = pxScale(c), ws = sp.map((_, i) => .3 * s0 * Math.sin(Math.PI * i / 18) * (o.size || 1)); polyPath(g, catmull(ribbon2D(sp, ws), true, 2)); g.fillStyle = rgba('#d2203a', .92 * (1 - u * .5)); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#4a0610'; g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; polyPath(g, catmull(ribbon2D(sp, ws.map(w => w * .35)), true, 2)); g.fillStyle = rgba('#ffb0b8', .8 * (1 - u)); g.fill(); g.restore(); fxDust(g, vAdd(c, [0, -c[1], 0]), t, { n: 6, size: .8 }); }
function fxBloodMistShield(g, c, n, t, o = {}) { const grow = easeOut(clamp(t / .2, 0, 1)), R = (o.r || 1.4) * grow; let side = vNorm(vCross(n, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, n); const crack = o.crack || 0;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const x = (i + (j % 2 ? .5 : 0)) * .55, y = j * .48; if (Math.hypot(x, y) > 1.15) continue; const cc = vAdd(c, vAdd(vMul(side, x * R), vMul(up, y * R))), hex = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; hex.push(vAdd(cc, vAdd(vMul(side, Math.cos(a) * R * .3), vMul(up, Math.sin(a) * R * .3)))); }
    const sp = projPoly(hex); if (sp.length < 3) continue; polyPath(g, sp); g.fillStyle = rgba('#d2203a', .35); g.fill(); g.lineWidth = 2; g.strokeStyle = rgba('#ff8a9a', .9); g.stroke(); if (crack && hash(i * 7 + j) < crack) { g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); g.lineTo(sp[3][0], sp[3][1]); g.strokeStyle = '#ffffff'; g.stroke(); } } }
function fxShibari(g, a, b, t, o = {}) { const u = easeOut(clamp(t / .3, 0, 1)); g.save(); g.strokeStyle = '#ff3a4a'; g.lineWidth = 2; for (let i = 0; i < (o.n || 9); i++) { const off = [(hash(i) - .5) * 1.2, (hash(i * 3) - .5) * 1.4, (hash(i * 5) - .5) * 1.2], e = vAdd(b, off), m = vAdd(vLerp(a, e, .5), [0, .4 * Math.sin(i), 0]); const pts = []; for (let k = 0; k <= 10; k++) { const s = k / 10 * u; pts.push(vLerp(vLerp(a, m, s), vLerp(m, e, s), s)); } for (const r of projLine(pts)) { polyPath(g, r, false); g.stroke(); } } g.restore(); }
function fxRikujokoro(g, c, t, o = {}) { const u = clamp(t / .15, 0, 1); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, from = vAdd(c, [Math.cos(a) * 3 * (1 - u) + Math.cos(a) * .25, .3 + i * .15, Math.sin(a) * 3 * (1 - u) + Math.sin(a) * .25]), dir = [Math.cos(a), 0, Math.sin(a)]; const p0 = P2(vMad(from, dir, -.9)), p1 = P2(vMad(from, dir, .9)); if (!p0 || !p1) continue; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineWidth = Math.max(4, .12 * p0.s); g.strokeStyle = 'rgba(255,240,160,.5)'; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke(); g.lineWidth *= .4; g.strokeStyle = '#fffbe0'; g.stroke(); g.restore(); } }
// Bankai doll: kneeling giant behind Urahara (pale face, stitched eyes, red kimono with flowers, temple-door hands)
function fxBenihimeDoll(g, base, yaw, t, o = {}) {
  const rise = easeOut(clamp(t / (o.rise || 1.2), 0, 1)); if (t < 0) return; const S2 = o.scale || 4.5, f = [Math.sin(yaw), 0, Math.cos(yaw)], side = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const head = vAdd(base, [0, S2 * 1.02 * rise, 0]), q = P2(head), qb = P2(base), qs = P2(vAdd(base, [0, S2 * .78 * rise, 0])); if (!q || !qb || !qs) return; const R = S2 * .3 * q.s;
  g.save(); g.globalAlpha = rise;
  // kneeling body: wide sleeves + shoulders tapering to the knees (red kimono, gold flowers, white V collar)
  const sw = R * 2.3; g.beginPath(); g.moveTo(qs.x - R * .9, qs.y); g.quadraticCurveTo(qs.x - sw, qs.y + R * .3, qb.x - sw * 1.05, qb.y); g.lineTo(qb.x + sw * 1.05, qb.y); g.quadraticCurveTo(qs.x + sw, qs.y + R * .3, qs.x + R * .9, qs.y); g.closePath();
  g.fillStyle = '#b8182a'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3a0408'; g.stroke(); g.save(); g.clip(); g.fillStyle = '#f2c84a'; for (let i = 0; i < 18; i++) { const x = qb.x + (hash(i) - .5) * sw * 2, y = lerp(qs.y, qb.y, hash(i * 3)); g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.ellipse(x + Math.cos(a) * R * .07, y + Math.sin(a) * R * .07, R * .06, R * .04, a, 0, TAU); } g.fill(); }
  g.fillStyle = '#f4ece2'; g.beginPath(); g.moveTo(qs.x - R * .45, qs.y); g.lineTo(qs.x, qs.y + R * 1.1); g.lineTo(qs.x + R * .45, qs.y); g.closePath(); g.fill(); g.fillStyle = '#b8182a'; g.beginPath(); g.moveTo(qs.x - R * .25, qs.y); g.lineTo(qs.x, qs.y + R * .7); g.lineTo(qs.x + R * .25, qs.y); g.closePath(); g.fill(); g.restore();
  // black bob hair behind the face, straight bangs over it
  g.fillStyle = '#141014'; g.beginPath(); g.moveTo(q.x - R * 1.05, q.y + R * .9); g.lineTo(q.x - R * 1.05, q.y - R * .3); g.quadraticCurveTo(q.x - R * 1.0, q.y - R * 1.35, q.x, q.y - R * 1.4); g.quadraticCurveTo(q.x + R * 1.0, q.y - R * 1.35, q.x + R * 1.05, q.y - R * .3); g.lineTo(q.x + R * 1.05, q.y + R * .9); g.closePath(); g.fill();
  g.fillStyle = '#f4ece2'; g.beginPath(); g.ellipse(q.x, q.y + R * .05, R * .78, R * .95, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a1a1a'; g.stroke();
  g.fillStyle = '#141014'; g.beginPath(); g.moveTo(q.x - R * .85, q.y - R * .3); g.lineTo(q.x - R * .85, q.y - R * .95); g.quadraticCurveTo(q.x, q.y - R * 1.3, q.x + R * .85, q.y - R * .95); g.lineTo(q.x + R * .85, q.y - R * .3); g.closePath(); g.fill();
  g.strokeStyle = '#2a1a1a'; g.lineWidth = Math.max(2, R * .05); for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(q.x + sg * R * .55, q.y - R * .05); g.lineTo(q.x + sg * R * .15, q.y - R * .05); g.stroke(); for (let k = 0; k < 3; k++) { const x = q.x + sg * R * (.2 + k * .13); g.beginPath(); g.moveTo(x, q.y - R * .14); g.lineTo(x, q.y + R * .04); g.stroke(); } }
  g.fillStyle = '#c81a2a'; g.beginPath(); g.ellipse(q.x, q.y + R * .5, R * .13, R * .06, 0, 0, TAU); g.fill();
  for (const sg of [-1, 1]) { g.fillStyle = rgba('#e8808a', .5); g.beginPath(); g.ellipse(q.x + sg * R * .45, q.y + R * .3, R * .14, R * .08, 0, 0, TAU); g.fill(); }
  // opening temple-door hands
  const open = clamp((t - .6) / .6, 0, 1); for (const sg of [-1, 1]) { const hp = P2(vAdd(base, vAdd(vMul(side, sg * S2 * (.12 + open * .45)), [0, S2 * .55 * rise, S2 * .1]))); if (!hp) continue; g.fillStyle = '#f4ece2'; g.beginPath(); g.ellipse(hp.x, hp.y, R * .28, R * .5, sg * (.3 + open * .7), 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#2a1a1a'; g.stroke(); g.strokeStyle = '#d2203a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hp.x, hp.y); g.lineTo(hp.x + sg * R * 1.5, hp.y + R * .8); g.stroke(); }
  g.restore();
}
Object.assign(POSES, {
  urahara_fan: { sp: -.02, hp: .1, aR: [1.3, -.55, .3], eR: 1.9, hR: 'open', wR: [-.3, 0], aL: [.25, .4, 0], eL: .4, hL: 'grip', sword: { sheathed: true }, face: { eye: .5, mouth: 'smile' } },
  urahara_cane: { sp: .02, hp: .05, aL: [.4, .3, 0], eL: .6, hL: 'grip', aR: [.15, .5, 0], eR: .3, sword: { sheathed: true }, face: { eye: .6, mouth: 'smile' } },
  urahara_draw: { sp: .2, st: .4, hp: .1, aR: [.9, -.8, 0], eR: 1.3, hR: 'grip', aL: [.5, -.5, 0], eL: 1.4, hL: 'grip', sword: { hand: 'R', dir: [.7, .2, -.65] }, lL: [.5, .2, .3], kL: .7, lR: [-.4, .15, -.3], kR: .4 },
  urahara_sing: { sp: .35, st: -.7, hp: .15, aR: [1.4, .9, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [.95, -.15, .25] }, aL: [.6, -.4, 0], eL: 1.0, hL: 'open', lL: [.9, .25, .3], kL: 1.1, lR: [-.6, .2, -.3], kR: .3, face: { eye: .9, lid: .3, mouth: 'line' } },
  urahara_shield: { sp: .1, hp: .1, aR: [1.5, -.1, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [0, .9, .4] }, aL: [.3, .5, 0], eL: .5, lL: [.4, .2, .2], kL: .5, lR: [-.3, .2, -.2], kR: .3 },
  urahara_bankai: { sp: .3, hp: .3, aR: [.8, -.3, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [0, -.95, .3] }, aL: [.9, -.6, 0], eL: 1.5, hL: 'sign', lL: [1.5, .2, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2, face: { eye: .8, lid: .2, mouth: 'line' } },
  urahara_kido: { sp: .05, st: -.3, aL: [1.55, .1, 0], eL: .05, hL: 'point', aR: [.4, .3, 0], eR: .6, hR: 'grip', sword: { hand: 'R', dir: [.2, -.9, .3] }, lL: [.4, .2, .2], kL: .5, lR: [-.3, .2, -.2], kR: .2 },
});
SIGNATURE.urahara = ['urahara_fan', 'urahara_cane', 'urahara_draw', 'urahara_sing', 'urahara_shield', 'urahara_bankai', 'urahara_kido'];
Object.assign(IMPACT_SEQ, {
  urahara_sing: [{ s: 'blackaccent', n: 2, p: { accent: '#d2203a', lines: 70 } }, { s: 'kanji', n: 3, p: { char: '啼', col: '#d2203a', col2: '#ffb0b8', outline: '#1a0004' } }, { s: 'redblack', n: 1 }],
  urahara_bankai: [{ s: 'whiteout', n: 2 }, { s: 'kanji', n: 3, p: { char: '観音開', col: '#d2203a', col2: '#fff0f0', outline: '#000', size: 460 } }, { s: 'rimsil', n: 2, p: { col: '#ffd0d8', col2: '#b8182a' } }],
  urahara_shield: [{ s: 'crystal', n: 1, p: { tint: '#ff6a7a' } }, { s: 'flash', n: 1 }],
});
