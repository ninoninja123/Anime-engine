/* Bleach Showdown engine - chars.js : character designs (model sheets in code) for the six captains, all forms.
   A design = plain object read by body.js / faces.js:
     h, body{width,shoulders,limbs,head,legs...}, skin, skinShade, kosode, hakama{}, haori{}, sleeve{}, collar{},
     scarf{}, feet{}, face{eye style, hair{col, cap, locks}, markings, details}, sword{blade spec}, extras(),
     forms: { name: overrides }   (shikai / bankai / mask ... ; select with makeFig(D, {form}) or F.formAt(t))
   CAST[name] -> design.  Signature poses are added to POSES with a char prefix (e.g. POSES.byakuya_point).    */
'use strict';
const CAST = {};
const SHINIGAMI = {
  h: 1.8, skin: '#f7dcc6', skinShade: '#dba79c', kosode: '#1f1d27', hakama: { col: '#1f1d27', r0: .1, r1: .118, r2: .135 },
  collar: { under: '#f1efe9', v0: .6, w: .6, shift: .05 }, feet: { col: '#f1efe8', sole: '#b7976a' },
  sleeve: { col: '#1f1d27', r0: .085, r1: .1, r2: .13, sag: .16 },
};
function design(base, over) {
  const d = JSON.parse(JSON.stringify(base));
  const deep = (a, b) => { for (const k in b) { const v = b[k]; if (v && typeof v === 'object' && !Array.isArray(v) && typeof v !== 'function' && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) deep(a[k], v); else a[k] = v; } };
  deep(d, over); return d;
}
// lock helpers ---------------------------------------------------------------------------------------------
// fan of locks between th0..th1 at phase ph
function lockFan(n, th0, th1, ph, f) { const out = []; for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : .5, th = lerp(th0, th1, u); out.push(Object.assign({ th, ph }, f(th, u, i))); } return out; }
const dirOut = (th, ph, down = 0, fwd = 0) => vNorm([Math.sin(th) * Math.cos(ph), Math.sin(ph) - down, Math.cos(th) * Math.cos(ph) + fwd]);
// simple tube prop attached to the head (kenseikan, horns, pins)
function headProp(S, D, local, dirL, len, r, col, opt, ink = .8) {
  const HM = headModel(S, D); const a = HM.toW(local), b = HM.toW(vMad(local, dirL, len));
  const surf = sTube([a, b], v => r * HM.r * (v > .9 ? lerp(1, .75, (v - .9) / .1) : 1), HM.M[1], 10, 3);
  drawSurf(opt.ctx, sampleSurf(surf), Object.assign({ col, shade: .1, inkW: ink }, opt.surf || {}));
}

// ============================================================================================ KUCHIKI BYAKUYA
CAST.byakuya = design(SHINIGAMI, {
  name: 'Kuchiki Byakuya', h: 1.8, body: { width: .97, limbs: .95 }, skin: '#f8e0cd', skinShade: '#d9a8a0',
  haori: { col: '#f4f2ec', lining: '#d6d3cc', len: .82, sleeves: false, capSleeve: true, kanji: '六', hem: 'hishi', open: .22 },
  sleeve: { col: '#1f1d27', lining: '#121118', r0: .082, r1: .1, r2: .13, sag: .17 },
  scarf: { col: '#e9f0ee', v0: .93, v1: 1.0, tails: [{ th: 2.7, len: .72, w: .1, out: .05 }, { th: 3.6, len: .82, w: .095, out: .05 }] },
  face: {
    eye: { w: 1.05, h: .27, irisR: .24, irisCol: '#5e5a7c', irisLight: '#9a96b8', tilt: .07, thick: 1.05, flick: .05, lashes: true, crease: true },
    eyeSize: .37, eyeY: -.2, defaultExpr: 'calm', brow: { browW: .08, browY: .02 },
    hair: { col: '#1b1b28', shadeCol: '#0d0d16', gloss: true, glossCol: '#3d4058', springK: 30, springC: 5,
      cap: { front: .42, side: .05, back: -.85 },
      locks: () => [
        ...lockFan(9, 1.5, 4.78, .45, (th, u) => ({ len: 2.2 + .3 * Math.cos(u * 9), w: .4, dir: dirOut(th, .4, 1.3, -.4), grav: .8, tw: .32, tip: 1.2, seg: 8, back: true, col: '#22233a' })),
        ...lockFan(9, 1.35, 4.93, .2, (th, u) => ({ len: 2.6 + .4 * Math.sin(u * Math.PI), w: .55, dir: dirOut(th, .2, 1.4, -.3), grav: .8, tw: .32, tip: 1.3, seg: 8, back: true })),
        ...lockFan(5, 1.2, 1.9, .05, (th, u) => ({ len: 2.2, w: .45, dir: dirOut(th, .1, 1.2), grav: .7, tw: .3, seg: 8 })),
        ...lockFan(5, -1.9, -1.2, .05, (th, u) => ({ len: 2.2, w: .45, dir: dirOut(th, .1, 1.2), grav: .7, tw: .3, seg: 8 })),
        // side locks framing the face
        { th: 1.12, ph: .4, len: 2.0, w: .34, dir: [.5, -.6, .25], grav: .9, tw: .3, front: true, seg: 8 },
        { th: -1.12, ph: .4, len: 2.0, w: .34, dir: [-.5, -.6, .25], grav: .9, tw: .3, front: true, seg: 8 },
        // bangs: side-swept, ending above the eyes, eyes stay readable
        ...lockFan(4, -.75, .1, .95, (th, u) => ({ len: .72, w: .46, rootR: .97, dir: [Math.sin(th) * .35 - .3, .1, 1], grav: 2.2, curl: [-.5, -1.5, -.6], tw: .28, front: true, tip: 1.3, gloss: true })),
        ...lockFan(3, .35, .8, .95, (th, u) => ({ len: .8, w: .44, rootR: .97, dir: [Math.sin(th) * .35 + .35, .1, 1], grav: 2.2, curl: [.6, -1.5, -.6], tw: .28, front: true, tip: 1.3, gloss: true })),
        // the single strand between the eyes
        { th: .12, ph: .8, len: 1.35, w: .08, rootR: .97, dir: [0, .1, 1], grav: 2.4, curl: [.1, -.9, -.5], tw: .4, front: true, tip: 1 },
      ],
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      // kenseikan: white tubular ornaments holding strands on the upper left of the head, one on the right
      const pieces = [[[-.25, .95, .2], [.05, .25, -.97]], [[0, 1.0, .18], [0, .25, -.97]], [[.25, .95, .2], [-.05, .25, -.97]], [[-.78, .45, .25], [-.15, .15, -.97]], [[-.84, .25, .3], [-.15, .1, -.97]]];
      for (const [p, d] of pieces) { const w = HM.toW(vMul(p, 1.05)); parts.push({ z: camDepth(w) - .002, fn: c => headProp(S, D, vMul(p, 1.08), vNorm(d), .55, .07, '#f6f6f2', Object.assign({ ctx: c }, opt), .7) }); }
    },
  },
  sword: { len: .98, w: .033, curve: .035, handle: .27, tsuba: 'square', tsubaR: .05, tsubaCol: '#b88a3e', hiltCol: '#a8804a', wrapCol: '#c8b8e8' },
  extras: (S, D, F, t, parts, opt) => byakuyaTekko(S, D, parts, opt),
  forms: {
    base: {},
    shikai: { swordForm: 'petals' },
    bankai: { swordForm: 'kageyoshi' },
    senkei: { swordForm: 'senkei' },
    shukei: { swordForm: 'shukei', wings: 'white' },
  },
});
function byakuyaTekko(S, D, parts, opt) { // white tekko plates on the back of the hands
  for (const sd of ['L', 'R']) {
    const M = S.M['hand' + sd], wr = S.J['wr' + sd], sg = sd === 'L' ? 1 : -1, k = S.B.h / 1.8;
    const np = vMul(M[0], -sg), back = vMul(np, -1);
    parts.push({ z: camDepth(S.J['hand' + sd]) - .012, fn: c => {
      const c0 = vAdd(wr, vAdd(vMul(M[1], -.03 * k), vMul(back, .02 * k)));
      const surf = sEllipsoid(c0, [M[2], M[1], back], [.04 * k, .055 * k, .014 * k], .6, 10, 6);
      drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f3f1ec', shade: .1, inkW: .7 }, opt.surf || {}));
    } });
  }
}
CAST.byakuya.drawHead = stdHead(CAST.byakuya);

// ============================================================================================ blade shape helpers
// jagged / chipped edge: returns bladePoly fn for drawSword spec
function jaggedBlade(seed, amp = .35, n = 22) {
  return (pts, bl) => { const top = [], bot = []; for (let i = 0; i <= n; i++) { const u = i / n * bl; top.push(pts(u, 0)); const chip = hash(seed + i * 7) < .45 ? amp * hash(seed + i * 3) : 0; bot.push(pts(Math.min(u, bl * .985), 1 - chip)); } return top.concat([pts(bl, .15)]).concat(bot.reverse()); };
}
function drawRing3D(ctx, c, ax1, ax2, r, w, col, s) { const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; pts.push(vAdd(c, vAdd(vMul(ax1, Math.cos(a) * r), vMul(ax2, Math.sin(a) * r)))); } const sp = pts.map(p => proj2(p)); polyPath(ctx, sp, false); ctx.lineWidth = w + 2.2; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }

// ============================================================================================ HITSUGAYA TOSHIRO
CAST.hitsugaya = design(SHINIGAMI, {
  name: 'Hitsugaya Toshiro', h: 1.36, body: { head: 1.22, legs: .9, width: .92, limbs: .9, neck: .8 }, skin: '#f8e2cf', skinShade: '#dcaca0',
  haori: { col: '#f4f2ec', lining: '#d6d3cc', len: .78, sleeves: false, kanji: '十', hem: 'hishi', open: .2 },
  sleeve: { col: '#1f1d27', lining: '#121118', r0: .08, r1: .095, r2: .12, sag: .14 },
  face: {
    eye: { w: 1.1, h: .46, irisR: .3, irisCol: '#27b5a6', irisLight: '#7fe8d6', irisDark: '#0d5a58', tilt: .1, thick: 1.15, flick: .07, lashes: true, crease: true },
    eyeSize: .4, eyeY: -.22, defaultExpr: 'determined', brow: { browW: .085, browY: .0 },
    hair: { col: '#eef2f7', shadeCol: '#a7b6d2', gloss: false, springK: 60, springC: 8,
      cap: { front: .5, side: .1, back: -.6, jag: .06, jagN: 14 },
      locks: () => [
        // big swept-back spikes
        ...lockFan(7, -1.6, 1.6, 1.05, (th, u) => ({ len: 1.0 + .25 * Math.sin(u * Math.PI), w: .55, rootR: .92, dir: vNorm([Math.sin(th) * .6, .9, -.7 + Math.cos(th) * .2]), curl: [0, -.3, -.4], tw: .32, tip: 1.6, back: true })),
        ...lockFan(7, 1.7, 4.58, .55, (th, u) => ({ len: .95, w: .55, rootR: .93, dir: dirOut(th, .35, 0, -.2), curl: [0, -.6, -.2], tw: .32, tip: 1.6 })),
        ...lockFan(5, 1.3, 1.9, .25, (th) => ({ len: .8, w: .45, rootR: .93, dir: dirOut(th, .1, .2), curl: [0, -.5, 0], tw: .32, tip: 1.6 })),
        ...lockFan(5, -1.9, -1.3, .25, (th) => ({ len: .8, w: .45, rootR: .93, dir: dirOut(th, .1, .2), curl: [0, -.5, 0], tw: .32, tip: 1.6 })),
        // spiky bangs over the forehead
        ...lockFan(5, -.6, .6, .95, (th, u) => ({ len: .95 + .2 * (u === .5 ? 1 : 0), w: .4, rootR: .96, dir: [Math.sin(th) * .7, .35, 1], curl: [0, -1.9, -.4], tw: .3, tip: 1.5, front: true })),
        { th: .95, ph: .3, len: 1.25, w: .32, rootR: .97, dir: [.3, -.6, .6], grav: .6, tw: .3, tip: 1.5, front: true },
        { th: -.95, ph: .3, len: 1.25, w: .32, rootR: .97, dir: [-.3, -.6, .6], grav: .6, tw: .3, tip: 1.5, front: true },
      ],
    },
  },
  sword: { len: 1.45, w: .034, curve: .03, handle: .32, tsuba: 'star', tsubaR: .06, tsubaCol: '#c89a4a', hiltCol: '#7fb4e0', wrapCol: '#e8f4ff',
    pommel: (ctx, hA, dir, flat, edge, s, flatMode, opt) => { const p = proj2(vMad(hA, dir, -.02)); ctx.fillStyle = flatMode ? opt.col : '#d9c26a'; ctx.beginPath(); ctx.arc(p[0], p[1], .012 * s + 1, 0, TAU); ctx.fill(); } },
  sash: { col: '#5f9a63', v: .55, amp: .3, ph: .4, w: .045 },
  extras: (S, D, F, t, parts, opt) => { drawSashParts(S, D, parts, opt); hitsugayaBack(S, D, F, t, parts, opt); if (D.daiguren) daigurenParts(S, D, F, t, parts, opt); },
  forms: {
    base: {}, shikai: { chain: true },
    bankai: { daiguren: true, chain: true, armSkin: '#cfe9ff', handSkin: '#cfe9ff' },
  },
});
CAST.hitsugaya.drawHead = stdHead(CAST.hitsugaya);
// diagonal sash over the haori (holds the sword on the back)
function drawSashParts(S, D, parts, opt) {
  const sa = D.sash; if (!sa) return; const k = S.B.h / 1.8;
  parts.push({ z: camDepth(vLerp(S.J.pelvis, S.J.neck, .6)) - .09, fn: c => {
    const T = torsoModel(S, D, .045 * k);
    const surf = { nu: 28, nv: 2, wrapU: true, fn: (u, v) => { const th = u * TAU; return T.ringAt(sa.v + sa.amp * Math.sin(th + sa.ph) + (v - .5) * sa.w * 2, th); } };
    drawSurf(c, sampleSurf(surf), Object.assign({ col: sa.col, shade: .05 }, opt.surf || {}));
  } });
}
function hitsugayaBack(S, D, F, t, parts, opt) { // sheath on the back + hilt over the right shoulder when not drawn
  const p = S.pose; if (p.sword && !p.sword.sheathed) return; const k = S.B.h / 1.8;
  const M = S.M.chest, back = vMul(M[2], -1);
  const a = vAdd(S.J.neck, mApply(M, [-.16 * k, .16 * k, -.16 * k])), b = vAdd(S.J.pelvis, mApply(M, [.3 * k, -.5 * k, -.17 * k]));
  parts.push({ z: camDepth(vLerp(a, b, .5)) + (vDot(back, CAM.cur.F) > 0 ? .1 : -.1), fn: c => {
    const surf = sTube([a, b], v => .022 * k, M[2], 8, 3);
    drawSurf(c, sampleSurf(surf), Object.assign({ col: '#1e2c5a', shade: .1 }, opt.surf || {}));
    const hilt = vAdd(a, vMul(vNorm(vSub(a, b)), .22 * k)); const s = project(a) ? pxScale(a) : 100;
    const p0 = proj2(a), p1 = proj2(hilt); ctx2line(c, p0, p1, .03 * k * s, '#7fb4e0', lineW(s, .7));
    const gp = []; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, rr = i % 2 ? .02 * k : .06 * k; gp.push(vAdd(a, vAdd(vMul(M[0], Math.cos(an) * rr), vMul(M[2], Math.sin(an) * rr)))); }
    fill3D(c, gp, tones('#c89a4a').base, lineW(s, .6));
  } });
}
function ctx2line(c, a, b, w, col, lw) { c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = w + lw * 2; c.strokeStyle = LIGHT.ink; c.stroke(); c.lineWidth = w; c.strokeStyle = col; c.stroke(); }

// ============================================================================================ ZARAKI KENPACHI
CAST.kenpachi = design(SHINIGAMI, {
  name: 'Zaraki Kenpachi', h: 2.02, body: { shoulders: 1.22, width: 1.1, limbs: 1.3, depth: 1.1, neck: 1.1 }, skin: '#ecc7a3', skinShade: '#c08f74',
  collar: { under: '#f1efe9', v0: .42, w: .95, shift: .04 },
  haori: { col: '#f2efe6', lining: '#d2cec4', len: .74, sleeves: true, kanji: '十一', kanjiScale: .9, hem: 'hishi', open: .26, torn: .9 },
  sleeve: { col: '#f2efe6', lining: '#2a2834', r0: .1, r1: .12, r2: .15, sag: .17, torn: .5 },
  hakama: { r0: .11, r1: .13, r2: .15 },
  face: {
    eye: { w: 1.15, h: .24, irisR: .19, irisCol: '#6b6040', irisDark: '#2c2616', tilt: .15, thick: 1.35, flick: .02, lashes: false, crease: false, pupilR: .55 },
    eyeSize: .36, eyeY: -.18, defaultExpr: 'grin', brow: { browW: .12, browY: -.05 }, mouth: { mouthW: 1.25, teethN: 6, fangs: true }, headShape: { jaw: .75, chin: .85, wide: true, width: 1.0 },
    hair: { col: '#1c1c22', shadeCol: '#0c0c10', springK: 70, springC: 9, cap: { front: .55, side: .05, back: -1.0 },
      locks: () => lockFan(11, -2.6, 2.6, .55, (th, u, i) => ({ th: th + (i % 2 ? .12 : -.08), ph: .45 + .35 * Math.cos(u * Math.PI * 1.0) * (i % 2 ? .6 : 1), len: 1.45 + .35 * (i % 3 === 0 ? 1 : 0), w: .3, rootR: .95, dir: dirOut(th, .7 + .4 * Math.cos(u * Math.PI), 0, 0), curl: [0, -.12, 0], tw: .9, round: true, tip: 1.9, bell: true })),
      castShadow: false,
    },
    markings: (c, HM, e, lod, D) => { // scar over the left eye
      const fr = faceFrame(HM, .42, -.1, .4, .75); decal(c, fr.p, fr.tu, fr.tv, cc => { inkPts(cc, [[-.05, .95], [.02, .3], [-.02, -.3], [.06, -.85]], .09, '#5a2a24', [.2, .3]); for (let i = 0; i < 6; i++) { const y = .8 - i * .32; inkPts(cc, [[-.13, y + .04], [.13, y - .04]], .05, '#5a2a24', [.3, .3]); } }, .05, fr.n);
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      // eyepatch over the RIGHT eye (head's -x side) + strap
      if (!D.noPatch) { const fr = faceFrame(HM, -.47, -.18, .5, .44); parts.push({ z: zc - .003, fn: c => decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.beginPath(); cc.moveTo(-.55, .35); cc.lineTo(.6, .45); cc.lineTo(.5, -.45); cc.lineTo(-.45, -.5); cc.closePath(); cc.fillStyle = '#16151c'; cc.fill(); cc.lineWidth = .06; cc.strokeStyle = LIGHT.ink; cc.stroke(); cc.fillStyle = '#3a3846'; cc.fillRect(-.3, .15, .5, .08); }, -.1, fr.n) });
        parts.push({ z: zc - .0025, fn: c => { const pts = []; for (let i = 0; i <= 16; i++) { const th = -.1 - i / 16 * 2.0; pts.push(HM.at(th, .02 + .25 * Math.sin(i / 16 * Math.PI) * 0)); } strokeRuns(c, projLine(pts.filter(p => vDot(vNorm(vSub(p, HM.c)), toCam(p)) > -.1)), lineW(pxScale(HM.c), .9), '#16151c'); } }); }
      // bells on the spike tips
      if (!D.noBells) for (const L of D.face.hair.locks()) { const pts = lockCurve(HM, L, [0, 0, 0], t); const tip = pts[pts.length - 1]; parts.push({ z: camDepth(tip) - .002, fn: c => { const p = project(tip); if (!p) return; const r = HM.r * .14 * p.s; c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fillStyle = tones('#d8b448').base; c.fill(); c.lineWidth = lineW(p.s, .6); c.strokeStyle = LIGHT.ink; c.stroke(); c.fillStyle = '#fff3c0'; c.beginPath(); c.arc(p.x - r * .3, p.y - r * .3, r * .3, 0, TAU); c.fill(); } }); }
    },
  },
  torsoTones: [{ col: '#ece8de', mask: (u, v) => .07 - Math.abs(v - .2) }],
  sword: { len: 1.12, w: .042, curve: .02, handle: .3, tsuba: 'star', tsubaR: .045, tsubaCol: '#5a5248', hiltCol: '#e8e4da', wrapCol: '#b8b2a4', col: '#a8b0b6', bladePoly: jaggedBlade(11, .45) },
  forms: {
    base: {},
    unleashed: { noPatch: true, auraCol: '#ffd84a' },
    shikai: { noPatch: true, sword: { len: 2.3, w: .5, curve: .0, handle: 1.1, tsuba: 'square', tsubaR: .08, tsubaCol: '#c8a048', hiltCol: '#e4dccb', wrapCol: '#a8a090', col: '#aab2ba', widthFn: u => u < .15 ? .45 + u * 3.6 : u < .92 ? 1 : (1 - u) * 12, bladePoly: jaggedBlade(5, .1, 20), pommel: (ctx, hA, dir, flat, edge, s, fm, opt) => { const a = proj2(hA), b = proj2(vMad(vMad(hA, dir, -.35), [0, -1, 0], .3)); ctx2line(ctx, a, b, .05 * s, fm ? opt.col : '#3a8a4a', 1.5); } } },
    bankai: { noPatch: true, noBells: true, skin: '#c8402e', skinShade: '#7a1e18', armSkin: '#c8402e', handSkin: '#c8402e', neckSkin: '#c8402e', bankai: true,
      sword: { len: .95, w: .13, curve: .0, handle: .2, tsuba: 'none', col: '#e4d6c4', edgeCol: '#fff4e0', bladePoly: jaggedBlade(23, .5, 16) } },
  },
});
CAST.kenpachi.drawHead = stdHead(CAST.kenpachi);
// bankai: horns + black markings
CAST.kenpachi.forms.bankai.face = Object.assign({}, CAST.kenpachi.face, {
  hair: Object.assign({}, CAST.kenpachi.face.hair, { col: '#1a0d0c', locks: () => lockFan(13, -2.8, 2.8, .45, (th, u, i) => ({ th, ph: .4 + .4 * Math.cos(u * Math.PI), len: 1.5 + .4 * hash(i), w: .38, rootR: .95, dir: dirOut(th, .4, -.2, 0), grav: .5, tw: .8, round: true, tip: 1.6 })) }),
  eye: Object.assign({}, CAST.kenpachi.face.eye, { white: '#fff2a0', irisCol: '#1a0806', irisR: .12 }),
  markings: (c, HM, e, lod) => { for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .4, .1, .4, .6); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = '#120808'; cc.beginPath(); cc.moveTo(-.1, 1.0); cc.lineTo(.25, .9); cc.lineTo(.12, -.9); cc.lineTo(-.02, -.95); cc.closePath(); cc.fill(); }, .05, fr.n); } },
  extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { for (const sg of [1, -1]) { const base = [sg * .32, .78, .45]; parts.push({ z: camDepth(HM.toW(base)) - .002, fn: c => { const surf = sTube([HM.toW(base), HM.toW([sg * .42, 1.35, .55]), HM.toW([sg * .4, 1.75, .35])], v => HM.r * .16 * Math.pow(1 - v, .8) + .001, HM.M[2], 10, 6); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#efe6d0', shade: .1 }, opt.surf || {})); } }); } },
  defaultExpr: 'rage', mouth: { mouthW: 1.3, teethN: 7, fangs: true },
});

// ============================================================================================ KYORAKU SHUNSUI
CAST.kyoraku = design(SHINIGAMI, {
  name: 'Kyoraku Shunsui', h: 1.92, body: { width: 1.06, shoulders: 1.08, limbs: 1.08 }, skin: '#f0cfb2', skinShade: '#cc9a84',
  collar: { under: '#f1efe9', v0: .5, w: .8, shift: .05 },
  haori: { col: '#ec93b4', lining: '#f4f2ec', len: .9, sleeves: true, hem: 'none', open: .3, flowers: true, patCol: '#fbe7ef' },
  sleeve: { col: '#ec93b4', lining: '#f4f2ec', r0: .095, r1: .115, r2: .15, sag: .2, flowers: true },
  face: {
    eye: { w: 1.1, h: .26, irisR: .22, irisCol: '#6c6a66', irisDark: '#2a2826', tilt: .02, thick: 1.15, flick: .03, lashes: false, crease: true },
    eyeSize: .36, eyeY: -.18, defaultExpr: 'smile', brow: { browW: .09, browY: .02 }, headShape: { jaw: .85, chin: .95 },
    hair: { col: '#3b2a24', shadeCol: '#1e1412', gloss: true, glossCol: '#6a4c40', springK: 32, springC: 5, cap: { front: .48, side: 0, back: -.8 },
      locks: () => [
        // wavy hair pulled back into a ponytail
        ...lockFan(7, 1.6, 4.68, .35, (th, u) => ({ len: 1.1, w: .55, rootR: .95, dir: dirOut(th, -.2, .6, -.6), grav: .4, tw: .35, tip: 1.2, back: true })),
        { th: Math.PI, ph: .05, len: 3.2, w: .5, rootR: 1.0, dir: [0, -.4, -1], grav: 1.4, tw: .55, wave: [1.3, 2.2], waveAxis: [1, 0, 0], tip: 1.1, back: true, seg: 10 },
        { th: Math.PI + .25, ph: .1, len: 2.8, w: .4, rootR: 1.0, dir: [.1, -.4, -1], grav: 1.4, tw: .55, wave: [1.2, 2.4, 1], waveAxis: [1, 0, 0], tip: 1.1, back: true, seg: 10 },
        { th: Math.PI - .25, ph: .1, len: 2.9, w: .4, rootR: 1.0, dir: [-.1, -.4, -1], grav: 1.4, tw: .55, wave: [1.2, 2.4, 2], waveAxis: [1, 0, 0], tip: 1.1, back: true, seg: 10 },
        // swept front hair with long bangs framing the LEFT side of his face
        ...lockFan(4, -.8, .4, .9, (th) => ({ len: 1.0, w: .5, rootR: .96, dir: [Math.sin(th) * .4 + .3, .4, .2], curl: [.6, -.7, -.6], tw: .3, tip: 1.2 })),
        { th: .7, ph: .7, len: 2.1, w: .4, rootR: .97, dir: [.3, .2, .9], grav: 1.6, curl: [0, -.8, -.4], wave: [.6, 1.5], waveAxis: [1, 0, 0], tw: .3, front: true, tip: 1.2, seg: 9 },
        { th: .95, ph: .5, len: 1.9, w: .36, rootR: .97, dir: [.3, -.3, .6], grav: 1.2, wave: [.5, 1.6], waveAxis: [0, 0, 1], tw: .3, front: true, tip: 1.2, seg: 9 },
        { th: -1.1, ph: .35, len: 1.0, w: .35, rootR: .97, dir: [-.2, -.5, .3], grav: 1, tw: .3, tip: 1.2 },
      ],
    },
    markings: (c, HM, e, lod, D) => { // stubble + chin beard
      if (!D.noHat) { const fh = faceFrame(HM, 0, .25, .7, 1); decal(c, fh.p, fh.tu, fh.tv, cc => { cc.fillStyle = rgba('#4a2a48', .38); cc.beginPath(); cc.moveTo(-1.5, 1.5); cc.lineTo(1.5, 1.5); cc.lineTo(1.5, -.05); cc.quadraticCurveTo(0, -.3, -1.5, -.05); cc.closePath(); cc.fill(); }, -1, fh.n); }
      const fr = faceFrame(HM, 0, -1.02, .5, .5); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = rgba('#3b2a24', .9); cc.beginPath(); cc.moveTo(-.28, .25); cc.quadraticCurveTo(0, .1, .28, .25); cc.lineTo(.12, -.45); cc.lineTo(0, -.6); cc.lineTo(-.12, -.45); cc.closePath(); cc.fill(); }, .0, fr.n);
      if (lod > 0) for (const sg of [1, -1]) { const f2 = faceFrame(HM, sg * .55, -.75, .3, .4); decal(c, f2.p, sg > 0 ? f2.tu : vMul(f2.tu, -1), f2.tv, cc => { cc.fillStyle = rgba('#5a4036', .55); for (let i = 0; i < 16; i++) { const x = hash(i * 3) - .5, y = hash(i * 5 + 1) - .5; cc.fillRect(x * .8, y * .6, .045, .045); } }, .1, f2.n); }
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      // pinwheel hairpins on the left side
      for (const [lp, ph] of [[[.82, .55, .1], 0], [[.88, .3, .2], 1]]) { const w = HM.toW(lp); parts.push({ z: camDepth(w) - .02, fn: c => { const p = project(w); if (!p) return; const r = HM.r * .2 * p.s; c.save(); c.translate(p.x, p.y); c.rotate(ph + t * .2); for (let i = 0; i < 4; i++) { c.rotate(HP); c.beginPath(); c.moveTo(0, 0); c.lineTo(r, -r * .1); c.quadraticCurveTo(r * .9, r * .6, 0, 0); c.fillStyle = i % 2 ? '#e2445a' : '#f6d24a'; c.fill(); c.lineWidth = lineW(p.s, .5); c.strokeStyle = LIGHT.ink; c.stroke(); } c.restore(); } }); }
      // straw hat (sugegasa): shallow cone on top of the head
      if (!D.noHat) { const z = camDepth(HM.toW([0, 1.25, 0])); parts.push({ z: z - .06, fn: c => drawSugegasa(c, HM, opt) }); }
    },
  },
  feet: { col: '#f0cfb2', sole: '#8a6a4a' },
  sword: { len: .9, w: .033, curve: .035, handle: .26, tsuba: 'star', tsubaR: .045, tsubaCol: '#8a6a3a', hiltCol: '#1e2a5a', wrapCol: '#8a9ac8' },
  extras: (S, D, F, t, parts, opt) => { kyorakuSwords(S, D, F, t, parts, opt); },
  forms: {
    base: {},
    shikai: { dual: true, sword: { len: 1.05, w: .12, curve: .16, handle: .26, tsuba: 'square', tsubaR: .05, tsubaCol: '#1a1a20', col: '#1c1a22', edgeCol: '#d8dce8', hiltCol: '#1a1a20', wrapCol: '#3a3440', pommel: (ctx, hA, dir, flat, edge, s, fm, opt) => { const a = proj2(hA), b = proj2(vMad(vMad(hA, dir, -.12), [0, -1, 0], .22)); ctx2line(ctx, a, b, .022 * s, fm ? opt.col : '#d8243a', 1.2); }, widthFn: u => .55 + .65 * Math.sin(Math.min(1, u * 1.15) * Math.PI * .5) - (u > .9 ? (u - .9) * 6 : 0) } },
    bankai: { dual: true, gloom: true, sword: { len: 1.0, w: .1, curve: .12, handle: .26, tsuba: 'none', col: '#2a2630', edgeCol: '#9a9cb0', hiltCol: '#1a1418', wrapCol: '#8a2a3a', widthFn: u => .55 + .65 * Math.sin(Math.min(1, u * 1.15) * Math.PI * .5) - (u > .9 ? (u - .9) * 6 : 0) } },
  },
});
CAST.kyoraku.drawHead = stdHead(CAST.kyoraku);
function drawSugegasa(c, HM, opt) {
  const M0 = HM.M, tilt = -.42, M = [M0[0], vNorm(vAdd(vMul(M0[1], Math.cos(tilt)), vMul(M0[2], Math.sin(tilt)))), vNorm(vAdd(vMul(M0[2], Math.cos(tilt)), vMul(M0[1], -Math.sin(tilt))))];
  const top = HM.toW([0, 1.6, -.35]), r = HM.r * 2.0;
  const surf = { nu: 28, nv: 4, wrapU: true, fn: (u, v) => { const a = u * TAU, rr = r * v; const drop = HM.r * .62 * v; return vAdd(top, vAdd(vMul(M[0], Math.sin(a) * rr), vAdd(vMul(M[2], Math.cos(a) * rr), vMul(M[1], -drop - HM.r * .03 * Math.sin(a * 2) * v)))); } };
  const G = sampleSurf(surf);
  drawSurf(c, G, Object.assign({ col: '#d9b56e', side: 'both', backCol: '#a9853f', shade: .2, borders: { v0: false, v1: true },
    pattern: (cc, G2, sg) => { const s = gridScale(G2), lw = lineW(s, .45); for (let i = 0; i < 24; i++) { const uv = [[i / 24, .05], [i / 24, 1]]; strokeRuns(cc, surfLine(surf, uv, -1), lw, rgba('#7a5a2a', .8)); } for (const vv of [.35, .7]) { const uv = []; for (let i = 0; i <= 28; i++) uv.push([i / 28, vv]); strokeRuns(cc, surfLine(surf, uv, -1), lw, rgba('#7a5a2a', .8)); } } }, opt.surf || {}));
}
function kyorakuSwords(S, D, F, t, parts, opt) {
  const p = S.pose;
  if (D.dual && p.sword && !p.sword.sheathed) { // second blade in the other hand
    const o = (p.sword.hand || 'R') === 'R' ? 'L' : 'R';
    const sw2 = Object.assign({}, p.sword2 || { p: (p.sword.p || 0) * .6 - .2, r: -(p.sword.r || 0) }, { hand: o });
    const spec = Object.assign({}, D.sword, { len: D.sword.len * .78 });
    const fr = swordFrame(S, D, sw2);
    parts.push({ z: Math.min(camDepth(vMad(fr.grip, fr.dir, .3)), camDepth(S.J['hand' + o]) + .005), fn: c => drawSword(c, S, D, sw2, spec, opt) });
    // red tassel cords at the pommels
  }
  if (!p.sword || p.sword.sheathed) { // two sheathed swords tucked in the sash on the left hip
    const k = S.B.h / 1.8, M = S.M.pelvis;
    for (const [dz, len] of [[.0, .95], [.05, .65]]) {
      const a = vAdd(S.J.pelvis, mApply(M, [.19 * k, .06 * k, .1 * k + dz])), b = vAdd(S.J.pelvis, mApply(M, [.24 * k, -.42 * k * len, -.42 * k * len]));
      parts.push({ z: camDepth(vLerp(a, b, .4)) - .05, fn: c => { const surf = sTube([vMad(a, vNorm(vSub(a, b)), .22 * k), b], v => .021 * k, M[1], 8, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: v => 0, }, { col: '#3a2a2e', shade: .1 }, opt.surf || {})); } });
    }
  }
}

// ============================================================================================ TOSEN KANAME
CAST.tosen = design(SHINIGAMI, {
  name: 'Tosen Kaname', h: 1.88, body: { width: 1.0, limbs: 1.02 }, skin: '#7a4e36', skinShade: '#4e2f22', armSkin: '#f2f1ec', handSkin: '#f2f1ec',
  // Arrancar outfit: white sleeveless high-collared coat over black hakama, long white gloves, white boots, orange rope
  kosode: '#f2f1ec', collar: { none: true }, sleeve: { none: true, bare: true },
  haori: { col: '#f2f1ec', lining: '#e2e0d8', len: .78, sleeves: false, kanji: null, hem: 'none', open: .12, collarLen: .5 },
  hakama: { col: '#1f1d27' }, feet: { col: '#f2f1ec', sandal: false, w: 1.1 },
  sash: { col: '#e8822e', v: .58, amp: .3, ph: -.3, w: .022 },
  face: {
    eye: { w: 1.0, h: .2, irisR: .2, irisCol: '#d8ccf0', blind: true, thick: 1.0, lashes: false, lower: false }, defaultExpr: 'calm', eyeSize: .34, hiCrescent: .0,
    markings: (c, HM, e, lod) => { const fr = faceFrame(HM, 0, -.35, .6, 1); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = 'rgba(255,214,170,.42)'; cc.beginPath(); cc.moveTo(-.05, .1); cc.lineTo(.06, .1); cc.lineTo(.07, -.2); cc.lineTo(-.04, -.2); cc.closePath(); cc.fill(); for (const sg of [-1, 1]) { cc.beginPath(); cc.ellipse(sg * .55, -.2, .22, .08, sg * -.3, 0, TAU); cc.fill(); } cc.beginPath(); cc.ellipse(0, -.62, .18, .04, 0, 0, TAU); cc.fill(); }, -.1, fr.n); },
    headShape: { jaw: .9, chin: .9 }, noseK: 1.05, mouth: { mouthIn: '#3a1418' },
    hair: { col: '#1d1614', shadeCol: '#0c0908', springK: 30, springC: 5, cap: { front: .62, side: .1, back: -.7 },
      locks: () => [
        ...lockFan(13, 1.0, 5.28, .45, (th, u, i) => ({ th, ph: .5 + .25 * Math.sin(i * 1.7), len: 2.3 + .5 * hash(i * 13), w: .17, rootR: .97, dir: dirOut(th, .6, .9, -.4), grav: 1.1, round: true, tw: 1, tip: .35, seg: 9, back: true, dread: true })),
        ...lockFan(6, -.95, .95, .82, (th, u, i) => ({ th, ph: .82, len: 2.0 + .3 * hash(i), w: .16, rootR: .97, dir: [Math.sin(th) * .5, .55, -.7], grav: 1.2, round: true, tw: 1, tip: .35, seg: 9, dread: true })),
      ],
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      if (D.mask) parts.push({ z: zc - .006, fn: c => drawTosenMask(c, HM, opt, D) });
      else if (!D.noVisor) parts.push({ z: zc - .004, fn: c => drawVisor(c, HM, opt) });
    },
  },
  sword: { len: .96, w: .032, curve: .03, handle: .27, tsuba: 'none', tsubaCol: '#8a8a96', hiltCol: '#3a3a4a', wrapCol: '#e0e0ea',
    pommel: (ctx, hA, dir, flat, edge, s, flatMode, opt) => { drawRing3D(ctx, vMad(hA, dir, -.045), flat, dir, .04, Math.max(1, .008 * s), flatMode ? opt.col : '#c8c8d4', s); },
    extra: (ctx, fr, pts, s, flatMode, opt) => { // crescent-bow guard
      const g0 = vMad(fr.grip, fr.dir, .1); const p = []; for (let i = 0; i <= 10; i++) { const a = (i / 10 - .5) * 2.4; p.push(vAdd(g0, vAdd(vMul(fr.edge, Math.sin(a) * .07), vMul(fr.dir, (1 - Math.cos(a)) * .03)))); } const sp = p.map(q => proj2(q)); polyPath(ctx, sp, false); ctx.lineWidth = .014 * s + 2; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); ctx.lineWidth = .014 * s; ctx.strokeStyle = flatMode ? opt.col : '#b8b8c6'; ctx.stroke(); } },
  forms: { base: {}, shikai: {}, bankai: {}, mask: { mask: true }, resurreccion: { mask: true, wings: true, noVisor: true, hakama: { col: '#ecebe6' } } },
});
CAST.tosen.drawHead = stdHead(CAST.tosen);
function drawVisor(c, HM, opt) { // narrow reflective band visor: orange glass, dark frame, highlight streak, moon glint
  const n = 24, facing = p => vDot(vNorm(vSub(p, HM.c)), toCam(p)), top = [], bot = [], mid = [];
  for (let i = 0; i <= n; i++) { const th = (i / n - .5) * 2.7; const a = HM.at(th, -.08), b = HM.at(th, -.3), m = HM.at(th, -.19); if (facing(a) < -.05) continue; const k = 1.07; top.push(proj2(vAdd(HM.c, vMul(vSub(a, HM.c), k)))); bot.push(proj2(vAdd(HM.c, vMul(vSub(b, HM.c), k)))); mid.push(proj2(vAdd(HM.c, vMul(vSub(m, HM.c), k + .01)))); }
  if (top.length < 2) return; const poly = top.concat(bot.slice().reverse());
  if (opt.mode === 'flat' || LIGHT.override) { polyPath(c, poly); c.fillStyle = opt.mode === 'flat' ? opt.col : LIGHT.override.fill; c.fill(); if (LIGHT.override) { c.lineWidth = 2; c.strokeStyle = LIGHT.ink; c.stroke(); } return; }
  const s = pxScale(HM.c), lw = lineW(s, .9);
  polyPath(c, poly); c.fillStyle = '#c85a1e'; c.fill();
  c.save(); polyPath(c, poly); c.clip();
  polyPath(c, top.concat(mid.slice().reverse())); c.fillStyle = '#f08a3a'; c.fill();                       // lit upper half
  const L = top.length; polyPath(c, top.slice(Math.floor(L * .15), Math.floor(L * .55)).concat(mid.slice(Math.floor(L * .15), Math.floor(L * .55)).reverse().map((p, i, arr) => [lerp(p[0], top[Math.floor(L * .55) - 1 - i][0], .55), lerp(p[1], top[Math.floor(L * .55) - 1 - i][1], .55)]))); c.fillStyle = 'rgba(255,236,200,.85)'; c.fill();
  const g0 = mid[Math.floor(L * .7)]; if (g0) { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(g0[0], g0[1], Math.max(2, s * .012), Math.max(1.2, s * .006), -.2, 0, TAU); c.fill(); }
  c.restore();
  polyPath(c, poly); c.lineWidth = lw * 1.2; c.strokeStyle = '#2a1408'; c.lineJoin = 'round'; c.stroke();
  polyPath(c, top, false); c.lineWidth = lw * .6; c.strokeStyle = '#ffd8a8'; c.stroke();
}
function drawTosenMask(c, HM, opt, D) { // hollow mask: white, vertical ridged visor with dark slits
  const surf = { nu: 22, nv: 14, wrapU: false, u0: -.32, u1: .32, v0: .12, v1: .78, fn: (u, v) => { const l = headShape(u * TAU, (v - .5) * Math.PI, HM.hs); return HM.toW(vMul(l, 1.08)); } };
  const G = sampleSurf(surf);
  drawSurf(c, G, Object.assign({ col: '#f4f1e8', shade: .1, borders: { u0: true, u1: true, v0: true, v1: true },
    pattern: (cc, G2) => { const s = gridScale(G2); for (let i = -3; i <= 3; i++) { if (i === 0) continue; const uv = []; for (let j = 0; j <= 10; j++) uv.push([i * .045, .2 + j * .055]); strokeRuns(cc, surfLine(surf, uv, 0), lineW(s, .5), rgba('#2a1e2a', .45)); } { const uv = []; for (let j = 0; j <= 10; j++) uv.push([0, .14 + j * .062]); strokeRuns(cc, surfLine(surf, uv, 0), lineW(s, 1.4), '#2a1e2a'); }
      for (const sg of [-1, 1]) { const fr = faceFrame(HM, sg * .42, -.18, .5, .3); decal(cc, vAdd(fr.p, vMul(fr.n, HM.r * .09)), sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, c3 => { c3.fillStyle = '#120a14'; c3.beginPath(); c3.moveTo(-.7, .05); c3.quadraticCurveTo(0, .35, .8, .15); c3.quadraticCurveTo(0, -.15, -.7, .05); c3.fill(); }, -1, fr.n); } } }, opt.surf || {}));
}

// ============================================================================================ KUROTSUCHI MAYURI
CAST.mayuri = design(SHINIGAMI, {
  name: 'Kurotsuchi Mayuri', h: 1.76, body: { width: .9, limbs: .85, shoulders: .95 }, skin: '#f4f2ea', skinShade: '#b8b4c4', armSkin: '#efe9e0', handSkin: '#efe9e0',
  haori: { col: '#f4f2ec', lining: '#c9b8e0', len: .86, sleeves: true, kanji: '十二', kanjiScale: .85, hem: 'hishi', open: .18 },
  sleeve: { col: '#f4f2ec', lining: '#4a3a6a', r0: .09, r1: .11, r2: .15, sag: .2 },
  scarf: { col: '#7a52b0', v0: .88, v1: 1.0, tails: [{ th: .4, len: .5, w: .16, out: .08 }] },
  collar: { none: false, under: '#efe9e0', skinCol: '#1a1820', v0: .7, w: .4 },
  face: {
    eye: { w: .95, h: .5, irisR: .26, irisCol: '#e8b828', irisLight: '#fff0a0', irisDark: '#8a5a08', white: '#fffef2', round: true, thick: 1.1, flick: .02, lashes: false, crease: false, pupilR: .38 },
    eyeSize: .4, eyeY: -.15, defaultExpr: 'grin', brows: false, mouth: { mouthW: 1.55, teethN: 8, mouthIn: '#1a0e14', teethAlways: true, ink: '#0a0810' }, headShape: { jaw: 1.1, chin: 1.15, width: .93 },
    hair: { col: '#3a4f9a', shadeCol: '#22306a', cap: false, castShadow: false, springK: 50,
      locks: () => lockFan(5, 2.4, 3.9, .1, (th) => ({ len: 1.1, w: .35, rootR: .95, dir: dirOut(th, -.3, .2, -.5), curl: [0, -.4, -.6], tw: .35, tip: 1.5, back: true })) },
    markings: (c, HM, e, lod) => { // white face paint, black centre of the face (nose stays white)
      const fr = faceFrame(HM, 0, -.35, .6, 1); decal(c, fr.p, fr.tu, fr.tv, cc => {
        cc.fillStyle = '#16141c'; cc.beginPath(); cc.moveTo(-.95, .42); cc.quadraticCurveTo(0, .62, .95, .42); cc.quadraticCurveTo(.98, -.3, .45, -.82); cc.quadraticCurveTo(0, -1.0, -.45, -.82); cc.quadraticCurveTo(-.98, -.3, -.95, .42); cc.closePath(); cc.fill();
        cc.fillStyle = '#f4f2ea'; cc.beginPath(); cc.moveTo(-.06, .35); cc.lineTo(.06, .35); cc.lineTo(.1, -.2); cc.lineTo(-.1, -.2); cc.closePath(); cc.fill();
      }, -.1, fr.n);
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {
      // golden headdress: ear cones + tall rear crest
      for (const sg of [1, -1]) { const base = [sg * .95, -.15, -.05]; parts.push({ z: camDepth(HM.toW(base)) - .001, fn: c => { const surf = sTube([HM.toW([sg * .7, -.15, -.05]), HM.toW([sg * 1.25, -.05, -.1]), HM.toW([sg * 1.75, .25, -.2])], v => HM.r * (.42 * Math.pow(1 - v, .9) + .02), HM.M[2], 14, 6); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#e2b33a', shade: .1, gloss: { mask: (u, v, P, N) => .06 - Math.abs(v - .3), col: '#fff0a8' } }, opt.surf || {})); } }); }
      // white hat: dome over the cranium with two long points sweeping to his right
      parts.push({ z: zc - .0008, fn: c => { const surf = sEllipsoid(HM.toW([0, .42, -.1]), HM.M, [HM.r * 1.08, HM.r * .78, HM.r * 1.1], 1, 24, 12); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f2f0ea', shade: .1, masks: [(u, v) => v - .42 - .1 * Math.cos(u * TAU)], maskInk: [true] }, opt.surf || {})); } });
      for (const [y, z, len] of [[.95, .1, 1.9], [.75, -.35, 1.6]]) { const base = [-.2, y, z]; parts.push({ z: camDepth(HM.toW(base)) - .0009, fn: c => { const surf = sTube([HM.toW([.2, y, z]), HM.toW([-.6, y + .25, z - .05]), HM.toW([-len, y + .1, z - .1])], v => HM.r * (.32 * Math.pow(1 - v, .9) + .015), HM.M[1], 12, 6, { sx: .55, sz: 1 }); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f2f0ea', shade: .1 }, opt.surf || {})); } }); }
    },
  },
  sword: { len: .85, w: .03, curve: .0, handle: .26, tsuba: 'none', hiltCol: '#4a3a6a', wrapCol: '#d0c0e8', col: '#d0d6dc' },
  forms: {
    base: {},
    shikai: { sword: { len: .85, w: .04, curve: 0, handle: .26, tsuba: 'none', hiltCol: '#4a3a6a', wrapCol: '#d0c0e8', col: '#d8c060', edgeCol: '#fff6c0',
      extra: (ctx, fr, pts, s, flatMode, opt) => { // trident prongs + baby face on the guard
        for (const sg of [1, -1]) { const p = []; for (let i = 0; i <= 10; i++) { const u = i / 10; p.push(vAdd(fr.grip, vAdd(vMul(fr.dir, .12 + u * .3), vMul(fr.edge, sg * (.03 + .12 * Math.sin(u * Math.PI * .8)))))); } const sp = p.map(q => proj2(q)); polyPath(ctx, sp, false); ctx.lineCap = 'round'; ctx.lineWidth = .028 * s + 2.5; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); ctx.lineWidth = .028 * s; ctx.strokeStyle = flatMode ? opt.col : '#d8c060'; ctx.stroke(); }
        const g = proj2(vMad(fr.grip, fr.dir, .1)); const r = .045 * s; ctx.beginPath(); ctx.arc(g[0], g[1], r, 0, TAU); ctx.fillStyle = flatMode ? opt.col : '#e8c440'; ctx.fill(); if (!flatMode) { ctx.lineWidth = 1.5; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); ctx.fillStyle = LIGHT.ink; ctx.beginPath(); ctx.arc(g[0] - r * .35, g[1] - r * .1, r * .12, 0, TAU); ctx.arc(g[0] + r * .35, g[1] - r * .1, r * .12, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(g[0], g[1] + r * .35, r * .2, 0, Math.PI); ctx.stroke(); }
      } } },
    bankai: {},
  },
});
CAST.mayuri.drawHead = stdHead(CAST.mayuri);
// long nail on the right middle finger
CAST.mayuri.extras = (S, D, F, t, parts, opt) => {
  const hg = handGeom(S, 'R', S.pose.hR || 'relax'); if (!hg) return; const f = hg.fingers[1]; const dir = vNorm(vSub(f[2], f[1])); const tip = vMad(f[2], dir, .09 * S.B.h / 1.8);
  parts.push({ z: camDepth(f[2]) - .012, fn: c => { const a = proj2(f[2]), b = proj2(tip), s = pxScale(f[2]); inkPts(c, [a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)], b], .012 * s + 2, LIGHT.ink, [0, .9]); inkPts(c, [a, b], .012 * s, '#16141c', [0, .9]); } });
};

// ============================================================================================ shared form extras
// Daiguren Hyorinmaru: ice wings, tail, claw arm, neck ruff, ice flowers
function iceShard(ctx, pts3, opt, col = '#bfe6ff', alpha = .9) {
  const sp = projPoly(pts3); if (sp.length < 3) return; polyPath(ctx, sp);
  if (opt.mode === 'flat') { ctx.fillStyle = opt.col; ctx.fill(); return; }
  if (LIGHT.override) { ctx.fillStyle = LIGHT.override.fill; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = LIGHT.ink; ctx.stroke(); return; }
  ctx.fillStyle = rgba(col, alpha); ctx.fill();
  // facet: lighter half
  ctx.save(); ctx.clip(); ctx.fillStyle = rgba('#ffffff', .45); ctx.beginPath(); ctx.moveTo(sp[0][0], sp[0][1]); for (let i = 1; i <= Math.floor(sp.length / 2); i++) ctx.lineTo(sp[i][0], sp[i][1]); ctx.closePath(); ctx.fill(); ctx.restore();
  polyPath(ctx, sp); ctx.lineWidth = alpha >= 1 ? 2.2 : 1.6; ctx.strokeStyle = alpha >= 1 ? '#0e2a4a' : '#3a6a9a'; ctx.lineJoin = 'round'; ctx.stroke();
}
function daigurenParts(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1];
  const root = vAdd(S.J.neck, mApply(M, [0, -.12 * k, -.14 * k]));
  const flap = Math.sin(t * 2.2) * .12;
  const behind = vDot(back, CAM.cur.F) > 0; // camera looking at the back -> wings in front
  for (const sg of [1, -1]) {
    const side = vMul(M[0], sg);
    // wing = 5 long feather shards fanning out from an arm bone
    const bone = [root, vAdd(root, vAdd(vMul(side, .55 * k), vAdd(vMul(up, (.45 + flap) * k), vMul(back, .25 * k)))), vAdd(root, vAdd(vMul(side, 1.25 * k), vAdd(vMul(up, (.75 + flap * 2) * k), vMul(back, .4 * k))))];
    parts.push({ z: camDepth(bone[1]) + (behind ? -.3 : .3), fn: c => {
      for (let i = 0; i < 6; i++) {
        const u = i / 5, a = vLerp(bone[1], bone[2], u * .9), dirF = vNorm(vAdd(vMul(up, -1.1 + u * .3), vAdd(vMul(side, .2 + u * .6), vMul(back, .2))));
        const len = (.95 - u * .25) * k, w = .09 * k;
        const tip = vMad(a, dirF, len), sidev = vMul(vNorm(vCross(dirF, back)), w);
        iceShard(c, [vAdd(a, sidev), vMad(vAdd(a, sidev), dirF, len * .65), tip, vMad(vSub(a, sidev), dirF, len * .5), vSub(a, sidev)], opt);
      }
      const sb = bone.map(p => proj2(p)); polyPath(c, sb, false); c.lineCap = 'round'; c.lineWidth = .06 * k * pxScale(bone[1]); c.strokeStyle = opt.mode === 'flat' ? opt.col : '#d8f2ff'; c.stroke();
    } });
  }
  // tail
  const tailPts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; tailPts.push(vAdd(S.J.pelvis, vAdd(vMul(back, (.12 + u * .9) * k), vAdd(vMul(up, (-.1 - u * .55 + Math.sin(u * 4 + t * 2) * .08) * k), vMul(M[0], Math.sin(u * 3 + t * 1.5) * .2 * k))))); }
  parts.push({ z: camDepth(tailPts[5]) + (behind ? -.1 : .2), fn: c => { const surf = sTube(tailPts, v => (.07 * (1 - v) + .006) * k, up, 8, 10); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#c6eaff', shade: .1, inkCol: '#3a6a9a' }, opt.surf || {})); } });
  // ice flowers (3 x 4 petals) floating behind
  for (let f = 0; f < 3; f++) { const c0 = vAdd(root, vAdd(vMul(back, .55 * k), vAdd(vMul(up, (.15 + f * .0) * k), vMul(M[0], (f - 1) * .35 * k))));
    parts.push({ z: camDepth(c0) + .4, fn: c => { for (let i = 0; i < 4; i++) { const a = i * HP + t * .4 + f; const d1 = vAdd(vMul(M[0], Math.cos(a)), vMul(up, Math.sin(a))), d2 = vAdd(vMul(M[0], Math.cos(a + .4)), vMul(up, Math.sin(a + .4))), d3 = vAdd(vMul(M[0], Math.cos(a - .4)), vMul(up, Math.sin(a - .4))); iceShard(c, [c0, vMad(c0, d2, .1 * k), vMad(c0, d1, .17 * k), vMad(c0, d3, .1 * k)], opt, '#e2f6ff'); } } }); }
  // claw on the right forearm
  const wr = S.J.wrR, el = S.J.elR, dirA = vNorm(vSub(wr, el));
  parts.push({ z: camDepth(S.J.handR) - .02, fn: c => { for (let i = 0; i < 3; i++) { const sd = vNorm(vCross(dirA, S.M.handR[0])); const b0 = vMad(vLerp(el, wr, .6), sd, (i - 1) * .04 * k); const tip = vMad(vMad(b0, dirA, .35 * k), sd, (i - 1) * .06 * k); iceShard(c, [vMad(b0, S.M.handR[0], .03 * k), tip, vMad(b0, S.M.handR[0], -.03 * k)], opt); }
    const surf = sTube([vLerp(el, wr, .2), wr], v => S.B.limbR.fa * 1.6 * k, S.M.handR[0], 8, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#cdeeff', shade: .1, inkCol: '#3a6a9a' }, opt.surf || {})); } });
}
// Byakuya Shukei Hakuteiken / generic light wings
function lightWings(S, D, F, t, parts, opt, col = '#ffffff') {
  const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1], root = vAdd(S.J.neck, mApply(M, [0, -.1 * k, -.12 * k]));
  for (const sg of [1, -1]) for (let i = 0; i < 5; i++) {
    const side = vMul(M[0], sg), a = vAdd(root, vMul(side, .08 * k)), dir = vNorm(vAdd(vMul(side, 1), vAdd(vMul(up, .9 - i * .45), vMul(back, .3)))), len = (1.1 - i * .12) * k;
    parts.push({ z: camDepth(vMad(a, dir, len * .5)) + .25, fn: c => { const n = vNorm(vCross(dir, back)); iceShard(c, [vMad(a, n, .06 * k), vMad(vMad(a, n, .1 * k), dir, len * .7), vMad(a, dir, len), vMad(vMad(a, n, -.04 * k), dir, len * .5)], opt, col, .95); } });
  }
}
CAST.byakuya.forms.shukei.extras = (S, D, F, t, parts, opt) => { byakuyaTekko(S, D, parts, opt); lightWings(S, D, F, t, parts, opt); };
// Tosen resurreccion wings (4 insect wings)
CAST.tosen.extras = (S, D, F, t, parts, opt) => {
  drawSashParts(S, D, parts, opt); tosenCollar(S, D, parts, opt);
  if (!D.wings) return; const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1], root = vAdd(S.J.neck, mApply(M, [0, -.15 * k, -.13 * k]));
  const buzz = Math.sin(t * 60) * .08;
  for (const sg of [1, -1]) for (const [ang, len] of [[.5, 1.3], [-.35, 1.1]]) {
    const side = vMul(M[0], sg), dir = vNorm(vAdd(side, vAdd(vMul(up, ang + buzz), vMul(back, .5))));
    parts.push({ z: camDepth(vMad(root, dir, .5)) + .3, fn: c => { const n = vNorm(vCross(dir, back)); const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU; pts.push(vAdd(vMad(root, dir, len * k * .5 * (1 - Math.cos(a)) * .5 + len * k * .25), vMul(n, Math.sin(a) * .16 * k))); }
      const sp = projPoly(pts); if (sp.length < 3) return; polyPath(c, sp); c.fillStyle = opt.mode === 'flat' ? opt.col : 'rgba(200,240,255,.45)'; c.fill(); if (opt.mode !== 'flat') { c.lineWidth = 1.6; c.strokeStyle = '#2a3a4a'; c.stroke(); const a0 = proj2(root), a1 = proj2(vMad(root, dir, len * k)); c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineWidth = 1; c.stroke(); } } });
  }
};
// flower motifs on Kyoraku's kimono (haori + sleeves)
function flowerMotif(c, col, n = 5) { c.fillStyle = col; for (let i = 0; i < n; i++) { const a = i / n * TAU; c.beginPath(); c.ellipse(Math.cos(a) * .45, Math.sin(a) * .45, .38, .26, a, 0, TAU); c.fill(); } c.fillStyle = '#f6d24a'; c.beginPath(); c.arc(0, 0, .2, 0, TAU); c.fill(); }
function surfFlowers(c, surf, seed, n, col, size, vmin = 0, vmax = 1) {
  for (let i = 0; i < n; i++) { const u = hash(seed + i * 3), v = lerp(vmin, vmax, hash(seed + i * 7)); const fr = surfFrame(surf, u, v); if (vDot(fr.n, toCam(fr.p)) <= .05) continue; const tu = vMul(vNorm(fr.du), size), tv = vMul(vNorm(vCross(fr.n, vNorm(fr.du))), size); decal(c, fr.p, tu, tv, cc => { cc.rotate(hash(seed + i) * 6); flowerMotif(cc, col); }, .05, fr.n); }
}

// ============================================================================================ SIGNATURE POSES
// (char prefixed; all also usable by any character).  sword.dir = blade direction in character space.
Object.assign(POSES, {
  // Byakuya: cool, minimal movement
  byakuya_point: { sp: 0, hp: .08, aL: [1.5, .25, 0], eL: .05, hL: 'flat', wL: [-.3, 0], aR: [.15, .5, 0], eR: .3, hR: 'grip', sword: { hand: 'R', dir: [.1, -.85, .5] }, lL: [.05, .06, .1], lR: [-.05, .06, -.1] },
  byakuya_release: { sp: 0, hp: .15, aR: [1.2, .05, 0], eR: .5, hR: 'grip', sword: { hand: 'R', dir: [0, -1, .05] }, aL: [.1, .5, 0], eL: .25, face: { eye: .55, lid: .1 } },
  byakuya_senkei: { sp: 0, hp: .05, aR: [1.1, -.25, 0], eR: 1.5, hR: 'grip', sword: { hand: 'R', dir: [0, 1, .02] }, aL: [.1, .5, 0], eL: .2 },
  byakuya_command: { sp: -.02, hp: -.05, aL: [2.0, .9, 0], eL: .25, hL: 'open', aR: [.15, .5, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [0, -.9, .4], noBlade: true } },
  byakuya_after: { sp: .1, st: .4, hp: .1, hy: -.3, aR: [.9, 1.3, 0], eR: .15, hR: 'grip', sword: { hand: 'R', dir: [.95, -.3, -.1] }, aL: [.1, .4, 0], eL: .2, lL: [.3, .1, .2], kL: .35, lR: [-.3, .1, -.2], kR: .2 },
  // Hitsugaya: athletic, aerial
  toshiro_draw: { sp: .1, hp: .05, aR: [2.7, -.5, 0], eR: 1.9, hR: 'grip', aL: [.5, .7, 0], eL: .6, hL: 'open', lL: [.45, .15, .2], kL: .6, lR: [-.4, .12, -.2], kR: .4 },
  toshiro_thrust: { sp: .55, st: -.5, hp: .2, aR: [1.55, .1, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [0, -.05, 1] }, aL: [.8, PI * .8, 0], eL: .4, hL: 'open', lL: [1.1, .2, .2], kL: 1.3, lR: [-.9, .15, -.2], kR: .3, fR: .5 },
  toshiro_sky: { sp: -.2, hp: -.4, aR: [2.9, .05, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [0, 1, -.1] }, aL: [2.6, .3, 0], eL: .4, hL: 'grip', lL: [.6, .1, 0], kL: 1.1, lR: [-.2, .1, 0], kR: .9, fL: .5, fR: .6, ground: false },
  toshiro_bankai: { sp: -.05, hp: -.1, aR: [.6, .9, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [.35, -.6, .7] }, aL: [.9, 1.1, 0], eL: .3, hL: 'claw', lL: [.2, .2, .1], kL: .2, lR: [-.1, .18, -.1], kR: .1, ground: false },
  toshiro_cast: { sp: .2, hp: .1, aR: [1.6, -.2, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [-.2, .2, .97] }, aL: [1.5, -.35, 0], eL: .5, hL: 'grip', sword2: null, lL: [.6, .15, .2], kL: .8, lR: [-.5, .15, -.2], kR: .4 },
  // Kenpachi: brutal, open, wide
  kenpachi_shoulder: { sp: -.04, hp: .05, aR: [2.2, -.15, 0], eR: 2.3, hR: 'grip', sword: { hand: 'R', dir: [.25, .35, -.9] }, aL: [.15, .5, 0], eL: .25, hL: 'fist', lL: [.12, .2, .2], kL: .1, lR: [-.05, .15, -.2], kR: .05 },
  kenpachi_kendo: { sp: -.12, hp: .1, aR: [2.85, .0, 0], eR: .55, hR: 'grip', sword: { hand: 'R', dir: [0, .55, -.84], two: true }, lL: [.5, .2, .2], kL: .6, lR: [-.45, .15, -.2], kR: .35 },
  kenpachi_kendoStrike: { sp: .65, hp: .35, aR: [1.2, .0, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [0, -.55, .84], two: true }, lL: [1.15, .25, .2], kL: 1.35, lR: [-.85, .2, -.2], kR: .25, fR: .5 },
  kenpachi_open: { sp: -.18, hp: -.2, aR: [1.2, 1.35, 0], eR: .2, hR: 'grip', sword: { hand: 'R', dir: [.95, -.3, 0] }, aL: [1.1, 1.4, 0], eL: .25, hL: 'claw', lL: [.3, .3, .3], kL: .4, lR: [-.2, .3, -.3], kR: .3 },
  kenpachi_lunge: { sp: .75, st: -.3, hp: .45, aR: [1.4, .3, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [.3, -.2, .93] }, aL: [.9, PI * .75, 0], eL: .5, hL: 'claw', lL: [1.25, .25, .3], kL: 1.5, lR: [-.95, .2, -.2], kR: .2, fR: .5 },
  // Kyoraku: lazy elegance, dual blades
  kyoraku_hat: { sp: -.03, hp: .25, aR: [2.45, -.35, 0], eR: 2.2, hR: 'relax', aL: [.2, .4, 0], eL: .5, hL: 'relax', lL: [.12, .08, .3], kL: .15, lR: [-.08, .05, -.2], kR: .05, sword: { sheathed: true } },
  kyoraku_dual: { sp: .2, st: -.3, hp: .1, aR: [1.3, .5, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [.4, .15, .9] }, sword2: { dir: [-.6, -.3, -.75] }, aL: [.8, -2.4, 0], eL: .5, hL: 'grip', lL: [.55, .2, .3], kL: .7, lR: [-.45, .15, -.2], kR: .35 },
  kyoraku_spread: { sp: .1, hp: .05, aR: [1.5, 1.45, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [-.9, -.2, .3] }, sword2: { dir: [.9, -.2, .3] }, aL: [1.5, 1.45, 0], eL: .1, hL: 'grip', lL: [.35, .3, .3], kL: .5, lR: [-.3, .3, -.3], kR: .3 },
  kyoraku_bankai: { sp: .25, hp: .45, aR: [.5, .5, 0], eR: .3, hR: 'grip', sword: { hand: 'R', dir: [.3, -.9, .2] }, sword2: { dir: [-.3, -.9, .2] }, aL: [.5, .5, 0], eL: .3, hL: 'grip', face: { eye: .5, lid: -.2, mouth: 'line' } },
  kyoraku_lean: { sp: -.12, ss: .12, hp: -.1, hr: .15, aR: [.3, -.6, .4], eR: 1.9, hR: 'relax', aL: [.3, -.5, -.4], eL: 1.9, hL: 'relax', lL: [.2, .1, .4], kL: .25, lR: [-.1, .06, -.2], kR: .05, sword: { sheathed: true } },
  // Tosen: upright, ritual
  tosen_ring: { sp: 0, hp: .1, aR: [1.3, -.2, 0], eR: 1.2, hR: 'grip', sword: { hand: 'R', dir: [0, 1, .1] }, aL: [1.3, -.4, 0], eL: 1.6, hL: 'flat' },
  tosen_justice: { sp: .08, hp: .08, aR: [1.5, .05, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [0, .1, 1] }, aL: [.15, .5, 0], eL: .3, lL: [.25, .1, .2], kL: .25, lR: [-.2, .1, -.2], kR: .1 },
  tosen_benihiko: { sp: .05, st: -.6, aR: [1.5, 1.5, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [.95, .1, .2] }, aL: [.6, .1, 0], eL: 1.3, hL: 'flat', lL: [.3, .15, .2], kL: .3, lR: [-.25, .15, -.2], kR: .1 },
  tosen_bankai: { sp: -.05, hp: -.25, aR: [2.6, .1, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [0, .1, .99] }, aL: [.2, .6, 0], eL: .3 },
  // Mayuri: crooked, creepy
  mayuri_hunch: { sp: .35, ss: -.1, hp: -.25, hr: -.2, aR: [1.0, .4, -.5], eR: 1.5, hR: 'claw', aL: [.9, .3, .5], eL: 1.7, hL: 'claw', lL: [.3, .15, .4], kL: .45, lR: [-.15, .1, -.3], kR: .3, sword: { sheathed: true } },
  mayuri_shikai: { sp: .1, st: -.2, hp: .05, aR: [1.45, .25, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [.1, .05, 1] }, aL: [.7, -.3, 0], eL: 1.6, hL: 'claw', lL: [.3, .12, .2], kL: .35, lR: [-.25, .1, -.2], kR: .15 },
  mayuri_bankai: { sp: -.15, hp: -.35, aR: [1.4, 1.2, 0], eR: .1, hR: 'grip', sword: { hand: 'R', dir: [.6, -.7, .3] }, aL: [1.6, 1.2, 0], eL: .2, hL: 'open', lL: [.2, .2, .2], kL: .2, lR: [-.15, .2, -.2], kR: .1 },
  mayuri_laugh: { sp: -.3, hp: -.6, aR: [.6, .7, 0], eR: 1.6, hR: 'claw', aL: [.6, .7, 0], eL: 1.6, hL: 'claw', face: { mouth: 'laugh', mouthOpen: 1, eye: 1.2, pupil: .5 } },
});
const SIGNATURE = {
  byakuya: ['byakuya_point', 'byakuya_release', 'byakuya_senkei', 'byakuya_command', 'byakuya_after'],
  hitsugaya: ['toshiro_draw', 'toshiro_thrust', 'toshiro_sky', 'toshiro_bankai', 'toshiro_cast'],
  kenpachi: ['kenpachi_shoulder', 'kenpachi_kendo', 'kenpachi_kendoStrike', 'kenpachi_open', 'kenpachi_lunge'],
  kyoraku: ['kyoraku_hat', 'kyoraku_dual', 'kyoraku_spread', 'kyoraku_bankai', 'kyoraku_lean'],
  tosen: ['tosen_ring', 'tosen_justice', 'tosen_benihiko', 'tosen_bankai'],
  mayuri: ['mayuri_hunch', 'mayuri_shikai', 'mayuri_bankai', 'mayuri_laugh'],
};

function tosenCollar(S, D, parts, opt) { // high standing collar of the arrancar coat
  const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.neck) - .03, fn: c => { const T = torsoModel(S, D, .03 * k); const surf = { nu: 20, nv: 2, wrapU: false, u0: .1, u1: .9, fn: (u, v) => vAdd(T.ringAt(.95, u * TAU, (.05 + .02 * v) * k), [0, v * .045 * k, 0]) }; drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f2f1ec', side: 'both', backCol: '#d8d6ce', shade: .05 }, opt.surf || {})); } });
}
