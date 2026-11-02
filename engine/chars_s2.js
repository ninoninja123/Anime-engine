/* engine/chars_s2.js (agent S2, harry-vs-gojo) - extra cast for showdown/part2.js and the masked shots of part1.js.
   !!! SPOILER WARNING: these characters only appear in the masked shots (pre/spoilers.md). Do not read if you want to be surprised. !!!
   CAST (all built like CAST.harry: design(SHINIGAMI, ...), hand2d-ready, 720p-readable silhouettes):
     s2lily, s2james, s2sirius, s2lupin   silver "shade" palette (whole-figure alpha pose.ghostA, default .72): forms base | warm (memory colours)
     s2toji                               memory (blue-grey): black fitted shirt, pale wide trousers, short black hair, scar at the lip corner
     s2cedric                             memory (sepia): neat brown hair, yellow-black striped scarf, school robe
   Poses: s2_shoulderHand (hand on someone's shoulder), s2_nod, s2_grin, s2_walk (use walkCycle), s2_handMouth (Gojo: hand over the mouth),
          s2_palmsUp (looks at both hands), s2_sitLaugh (Gojo sitting in the sand laughing), s2_offerHand, s2_pullUp, s2_fallBack, s2_raiseHand.  */
'use strict';
const S2CH = {
  silver: { skin: '#dbe6f6', shade: '#9db2d6', cloth: '#8aa0c6', cloth2: '#6c82ac', lin: '#b8c8e8', hair: '#c6d4ee', hairS: '#7f94bc', gloss: '#ffffff', ink: '#3a4a6e' },
};
const S2_SHORT = (o = {}) => () => {   // short neat hair (Lupin, Cedric), parted to one side
  const r = i => hash(i * 4.13 + (o.seed || 1)), L = o.len || 1;
  return [
    ...lockFan(16, 1.0, 5.28, .42, (th, u, i) => ({ th, ph: .4, len: (.7 + .15 * r(i)) * L * (1 - .1 * Math.cos(th)), w: .46, rootR: .95, dir: dirOut(th, .1, 1.0, -.1),
      curl: [-Math.sin(th) * .5, .2, -Math.cos(th) * .5], grav: .9, tw: .27, tip: 1.2, seg: 6, back: Math.cos(th) < .1, gloss: i % 4 === 1 })),
    ...lockFan(6, 2.3, 4.0, 1.12, (th, u, i) => ({ th, len: .45 * L, w: .48, rootR: .97, dir: dirOut(th, .9, 0, -.2), curl: [0, -.4, 0], grav: .3, tw: .3, tip: 1.2, seg: 5, back: true })),
    ...lockFan(6, -.9, .7, .92, (th, u, i) => ({ th, len: (.7 + .1 * r(i + 9)) * L, w: .42, rootR: .965, dir: [.65 + Math.sin(th) * .3, .15, .8], curl: [.8, -1.0, -.5], grav: 1.0, tw: .27, tip: 1.2, seg: 6, front: true, gloss: i === 2 })),
    ...lockFan(2, 1.15, 1.45, .3, (th, u, i) => ({ th, len: .6 * L, w: .34, rootR: .97, dir: [.3, -.85, .25], curl: [-.3, .1, .1], grav: 1.1, tw: .28, tip: 1.2, front: true })),
    ...lockFan(2, -1.45, -1.15, .3, (th, u, i) => ({ th, len: .6 * L, w: .34, rootR: .97, dir: [-.3, -.85, .25], curl: [.3, .1, .1], grav: 1.1, tw: .28, tip: 1.2, front: true })),
  ];
};
const S2_LONG = (o = {}) => () => {   // long hair (Lily: to the shoulder blades; Sirius: shoulder length, wavy), centre / side parting
  const r = i => hash(i * 2.91 + (o.seed || 3)), L = o.len || 2.3, wv = o.wave || .12;
  return [
    ...lockFan(18, 1.05, 5.23, .4, (th, u, i) => ({ th, ph: .38, len: (L + .25 * r(i)) * (1 - .1 * Math.cos(th)), w: .46, rootR: .95, dir: dirOut(th, .12, 1.15, -.08),
      curl: [-Math.sin(th) * .35, .1, -Math.cos(th) * .4], grav: 1.5, wave: [wv, 1.0, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .27, tip: 1.25, seg: 9, back: Math.cos(th) < .2, gloss: i % 4 === 1 })),
    ...lockFan(7, 2.2, 4.1, 1.05, (th, u, i) => ({ th, len: L * .8, w: .5, rootR: .97, dir: dirOut(th, -.1, .8, 0), curl: [0, -.2, -.3], grav: 1.4, wave: [wv, 1, i + 3], tw: .3, tip: 1.3, seg: 8, back: true })),
    // parted fringe falling to both sides of the face, framing it
    ...lockFan(4, -.95, -.15, .9, (th, u, i) => ({ th, len: (L * .55 + .2 * r(i + 20)), w: .42, rootR: .965, dir: [-.55 + Math.sin(th) * .2, -.2, .8], curl: [-.7, -1.2, -.3], grav: 1.6, wave: [wv * .6, 1, i], tw: .26, tip: 1.25, seg: 8, front: true, gloss: i === 1 })),
    ...lockFan(4, .15, .95, .9, (th, u, i) => ({ th, len: (L * .55 + .2 * r(i + 30)), w: .42, rootR: .965, dir: [.55 + Math.sin(th) * .2, -.2, .8], curl: [.7, -1.2, -.3], grav: 1.6, wave: [wv * .6, 1, i + 5], tw: .26, tip: 1.25, seg: 8, front: true })),
    ...lockFan(2, 1.1, 1.45, .3, (th, u, i) => ({ th, len: L * .85, w: .36, rootR: .97, dir: [.35, -.9, .2], curl: [-.3, 0, .1], grav: 1.4, wave: [wv, 1, i], tw: .27, tip: 1.2, seg: 8, front: true })),
    ...lockFan(2, -1.45, -1.1, .3, (th, u, i) => ({ th, len: L * .85, w: .36, rootR: .97, dir: [-.35, -.9, .2], curl: [.3, 0, .1], grav: 1.4, wave: [wv, 1, i + 1], tw: .27, tip: 1.2, seg: 8, front: true })),
  ];
};
const S2_TOJIHAIR = () => HVG_HHAIR({ mess: .55 })().map(L => Object.assign({}, L, { len: L.len * (L.front ? .62 : .72), grav: (L.grav || 0) * .8 }));
function s2Beard(c, HM, col, goatee) {   // moustache + goatee decals (Sirius, Lupin light)
  if (typeof faceFrame !== 'function' || typeof decal !== 'function') return;
  const fr = faceFrame(HM, 0, -1.0, .5, .5); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = col; cc.beginPath(); cc.moveTo(-.34, .42); cc.quadraticCurveTo(0, .28, .34, .42); cc.lineTo(.3, .5); cc.quadraticCurveTo(0, .4, -.3, .5); cc.closePath(); cc.fill();
    if (goatee) { cc.beginPath(); cc.moveTo(-.16, .05); cc.quadraticCurveTo(0, -.02, .16, .05); cc.lineTo(.08, -.42); cc.lineTo(0, -.52); cc.lineTo(-.08, -.42); cc.closePath(); cc.fill(); } }, .0, fr.n);
}
function s2Scar(c, HM, th, ph, ang, len, col) { if (typeof faceFrame !== 'function' || typeof decal !== 'function') return; const fr = faceFrame(HM, th, ph, .4, .35); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = col; cc.lineWidth = .09; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(-Math.cos(ang) * len, -Math.sin(ang) * len); cc.lineTo(Math.cos(ang) * len, Math.sin(ang) * len); cc.stroke(); }, .05, fr.n); }
// generic robed person built on Harry's construction (functions are re-attached: design() drops functions of a cloned base)
function s2Person(name, o) {
  const pal = o.pal || {}, sk = o.skin || pal.skin, sks = o.skinShade || pal.shade;
  const D = design(SHINIGAMI, {
    name, h: o.h || 1.8, body: Object.assign({ width: .92, limbs: .93, shoulders: .98, depth: .95, legs: 1.04, neck: 1.02 }, o.body || {}), skin: sk, skinShade: sks,
    kosode: o.kosode, collar: o.collar || { under: o.shirt || '#e8eef8', skinCol: o.shirt || '#e8eef8', v0: .64, w: .5, shift: 0 },
    sleeve: Object.assign({ col: o.coat, lining: o.lining || o.coat, r0: .08, r1: .095, r2: .118, sag: .1, len: 1.0 }, o.sleeve || {}),
    hakama: Object.assign({ col: o.trousers, r0: .09, r1: .078, r2: .07, pleats: false, ties: false }, o.hakama || {}), obi: null,
    haori: o.haori === null ? { none: true } : Object.assign({ col: o.coat, lining: o.lining || o.coat, len: .92, sleeves: true, hem: 'none', kanji: null, open: .34, flare: .5, collarLen: .66 }, o.haori || {}),
    feet: { col: o.shoe || '#2a2620', sandal: false, w: 1.0 },
    face: {
      eye: Object.assign({ w: 1.08, h: .34, irisR: .31, irisCol: o.iris || '#6a7a9a', irisLight: o.irisL || '#e8f0ff', irisDark: o.irisD || '#2a3450', tilt: .03, thick: 1.15, flick: .04, lashes: true, crease: true, pupilR: .32, lidShade: '#5a6a80' }, o.eye || {}),
      eyeSize: o.eyeSize || .37, eyeY: -.2, defaultExpr: o.expr || 'gentle', brow: { browW: .07, browY: .08, browCol: o.browCol || o.hair }, headShape: Object.assign({ jaw: .95, chin: .98, width: .94 }, o.head || {}), noseK: o.noseK || .92,
      mouth: { mouthW: .9 }, mouthSize: .25, mouthY: -.76,
      hair: { col: o.hair, shadeCol: o.hairS, gloss: true, glossCol: o.gloss || '#ffffff', springK: 30, springC: 5, cap: o.cap || { front: .6, side: .05, back: -.85 }, locks: o.locks },
    },
    sheetExprs: ['gentle', 'smile', 'calm', 'loving', 'sorrow', 'grin', 'serious', 'surprised', 'eyesClosed', 'laugh', 'menace', 'smirk', 'pain', 'shout'],
    forms: Object.assign({ base: {} }, o.forms || {}),
  });
  if (o.scarf) D.scarf = o.scarf;
  D.face.markings = o.markings || null;
  D.face.extraParts = o.glasses ? (S, Dd, F, t, parts, opt, HM, e, zc) => { if (S.pose.glasses !== false) parts.push({ z: zc - HM.r * 1.08, fn: c => hvgRoundGlasses(c, HM, opt, S.pose, { frame: o.glassesCol || '#141218', r: .36, lens: null, thick: 1.6, crack: 0 }) }); } : null;
  D.extras = (S, Dd, F, t, parts, opt) => { if (o.bust && typeof e2Bust === 'function') e2Bust(S, Dd, parts, opt, { col: Dd.kosode, rx: .05, ry: .046, rz: .034 }); if (typeof woundParts === 'function') woundParts(S, Dd, parts, opt, S.pose.wounds || Dd.wounds || 0); };
  if (o.ghost) { D.figAlpha = P => clamp(P.ghostA == null ? .72 : P.ghostA, 0, 1); for (const k in D.forms) if (D.forms[k].ghost === false) D.forms[k].figAlpha = null; }
  CAST[name] = D; D.drawHead = stdHead(D); return D;
}
// ---------------------------------------------------------------------------------------------------- the four shades (Resurrection Stone)
(function () {
  const P = S2CH.silver;
  const G = (extra) => Object.assign({ pal: P, kosode: P.cloth2, coat: P.cloth, lining: P.lin, trousers: P.cloth2, shoe: P.cloth2, hair: P.hair, hairS: P.hairS, gloss: P.gloss, browCol: P.hairS, shirt: '#eef4ff', ghost: true }, extra);
  s2Person('s2lily', G({ h: 1.66, body: { width: .8, limbs: .86, shoulders: .86, depth: .9, legs: 1.02, neck: .96 }, bust: true, expr: 'loving', iris: '#7fd8a0', irisL: '#e8fff0', irisD: '#2a6a44',
    eye: { h: .38, irisR: .33, tilt: .04, lashes: true, thick: 1.3 }, eyeSize: .4, head: { jaw: .9, chin: .94, width: .9 }, noseK: .8,
    hakama: { r0: .12, r1: .16, r2: .2, pleats: true }, haori: { len: 1.05, open: .26, flare: .62 }, locks: S2_LONG({ len: 2.5, wave: .14, seed: 5 }), cap: { front: .7, side: .1, back: -.85 } }));
  s2Person('s2james', G({ h: 1.8, expr: 'grin', iris: '#9fb6d8', locks: HVG_HHAIR({ mess: 1.15 }), cap: { front: .66, side: .05, back: -.85 }, glasses: true, glassesCol: '#2a3a5a',
    scarf: { col: P.cloth2, stripes: { col: P.lin, n: 7 }, v0: .9, v1: 1.0, tails: [{ th: .42, len: .5, w: .1, out: .07 }] } }));
  s2Person('s2sirius', G({ h: 1.84, expr: 'grin', iris: '#a8b8d0', body: { width: .9, shoulders: 1.0 }, haori: { len: 1.0, open: .4, flare: .58 }, locks: S2_LONG({ len: 1.65, wave: .22, seed: 9 }),
    markings: (c, HM) => s2Beard(c, HM, rgba(P.hairS, .9), true) }));
  s2Person('s2lupin', G({ h: 1.8, expr: 'gentle', iris: '#b0c0d8', locks: S2_SHORT({ len: .95, seed: 4 }), haori: { len: .9, open: .3, flare: .4, torn: .4 },
    markings: (c, HM) => { s2Beard(c, HM, rgba(P.hairS, .55), false); s2Scar(c, HM, -.32, -.42, 1.0, .55, rgba('#6a7aa0', .9)); s2Scar(c, HM, .1, -.62, .7, .35, rgba('#6a7aa0', .8)); } }));
  // warm (true colour) variants, used where the shades turn back into people for one frame (not needed by default)
})();
// ---------------------------------------------------------------------------------------------------- Toji (Gojo's memory: blue-grey) and Cedric (Harry's memory: sepia)
s2Person('s2toji', { h: 1.88, body: { width: 1.08, limbs: 1.06, shoulders: 1.16, depth: 1.04, legs: 1.03, neck: 1.1 }, skin: '#e8d2c0', skinShade: '#b89484', kosode: '#15161b', coat: '#15161b', lining: '#0a0a0e',
  sleeve: { r0: .086, r1: .082, r2: .07, sag: .02 }, haori: null, collar: { none: true }, trousers: '#cfcdc4', hakama: { r0: .12, r1: .14, r2: .15, pleats: true }, shoe: '#1a1a1e',
  hair: '#141318', hairS: '#050406', gloss: '#4a4a5a', iris: '#5a7a62', irisL: '#c8e8d0', irisD: '#1a3020', expr: 'menace', eye: { h: .3, irisR: .27, tilt: .1, thick: 1.3 }, head: { jaw: 1.05, chin: 1.02, width: .98 },
  locks: S2_TOJIHAIR, cap: { front: .62, side: .05, back: -.85 },
  markings: (c, HM) => s2Scar(c, HM, .3, -.8, 1.35, .42, rgba('#8a5048', .95)) });
s2Person('s2cedric', { h: 1.82, skin: '#f0d6bc', skinShade: '#c89e86', kosode: '#5a5a62', coat: '#1d1f2a', lining: '#c8a020', trousers: '#2a2a30', shirt: '#f2f0ea',
  hair: '#6a4426', hairS: '#3a2414', gloss: '#b08060', iris: '#6a5a40', irisL: '#e0d0b0', irisD: '#2a2014', expr: 'smile', locks: S2_SHORT({ len: 1.05, seed: 7 }),
  scarf: { col: '#e8b820', stripes: { col: '#1a1a1a', n: 7 }, v0: .9, v1: 1.0, tails: [{ th: .42, len: .55, w: .1, out: .07 }, { th: -.3, len: .62, w: .1, out: .06 }] } });
// ---------------------------------------------------------------------------------------------------- poses
Object.assign(POSES, {
  s2_shoulderHand: { sp: .06, hp: .12, hy: -.15, aR: [1.25, -.35, 0], eR: .55, hR: 'flat', wR: [.3, 0], aL: [.15, .3, 0], eL: .3, hL: 'relax', lL: [.05, .08, .1], lR: [-.02, .08, -.1], face: { eye: .6, lid: -.1, mouth: 'smile', brow: .2, browA: -.3 } },
  s2_nod: { sp: .04, hp: .32, aL: [.15, .3, 0], eL: .3, hL: 'relax', aR: [.15, .3, 0], eR: .3, hR: 'relax', face: { eye: .5, mouth: 'smile' } },
  s2_grin: { sp: -.04, hp: -.06, hr: .14, aL: [.3, .5, .2], eL: 1.6, hL: 'fist', aR: [.15, .3, 0], eR: .4, hR: 'relax', lL: [.1, .1, .15], face: { mouth: 'grin', mouthOpen: .35, eye: .6 } },
  s2_raiseHand: { sp: -.04, hp: -.1, aR: [2.3, .35, 0], eR: .5, hR: 'open', wR: [-.2, 0], aL: [.15, .3, 0], eL: .3, hL: 'relax', face: { mouth: 'smile', eye: .4 } },
  s2_handMouth: { sp: .06, hp: .12, hr: .05, aR: [1.2, -.75, 0], eR: 2.45, hR: 'flat', wR: [.4, 0], aL: [.45, -.4, 0], eL: 1.6, hL: 'relax', lL: [.06, .1, .25], lR: [-.03, .08, -.2], face: { eye: 1.15, pupil: .55, mouth: 'line', brow: .3, browA: -.1 } },
  s2_palmsUp: { sp: .14, hp: .38, aL: [.85, .25, -1.3], eL: 1.35, hL: 'open', wL: [-.2, 0], aR: [.85, .25, 1.3], eR: 1.35, hR: 'open', wR: [-.2, 0], lL: [.1, .08, .1], lR: [-.05, .08, -.1], face: { eye: 1.05, pupil: .7, mouth: 'o', mouthOpen: .2, look: [0, -.6] } },
  s2_sitLaugh: { ground: false, sp: -.3, hp: -.5, aL: [.55, 2.6, 0], eL: .25, hL: 'flat', aR: [.55, 2.6, 0], eR: .25, hR: 'flat', lL: [1.35, .35, .3], kL: .5, lR: [1.2, .3, -.2], kR: 1.4, face: { mouth: 'laugh', mouthOpen: .9, eye: .25, closed: 1, closedUp: 1 } },
  s2_offerHand: { sp: .32, hp: .2, aR: [1.05, .15, 0], eR: .3, hR: 'open', wR: [-.1, 0], aL: [.2, .4, .3], eL: .5, hL: 'hid', lL: [.25, .12, .2], kL: .3, lR: [-.1, .1, -.2], kR: .15, face: { mouth: 'smile', eye: .65 } },
  s2_pullUp: { sp: .05, st: .2, hp: .05, aR: [.95, .1, 0], eR: .6, hR: 'grip', aL: [.2, .4, .3], eL: .5, hL: 'hid', lL: [.3, .12, .2], kL: .35, lR: [-.25, .1, -.2], kR: .1, face: { mouth: 'grin', mouthOpen: .3, eye: .6 } },
  s2_fallBack: { ground: 'all', pitch: -1.45, sp: -.1, hp: -.2, aL: [1.6, 1.2, 0], eL: .4, hL: 'open', aR: [1.6, 1.2, 0], eR: .4, hR: 'open', lL: [.5, .2, .2], kL: .6, lR: [.2, .2, -.2], kR: .4, face: { eye: 1.1, pupil: .5, mouth: 'o', mouthOpen: .4 } },
  s2_walk: { sp: .02, hp: .02 },
});
