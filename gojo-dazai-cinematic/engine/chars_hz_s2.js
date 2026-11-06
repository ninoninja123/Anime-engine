/* engine/chars_hz_s2.js (shot writer S2, hulk-vs-yujiro part 2): extra poses (Yujiro: palmSpiral, kneelPunch, twoFingerCatch, shirtToss; Banner: smileWeak,
   Hulk regrow helpers) and the cameo BAKI (Baki Hanma: 168 cm, reddish-brown hair, scar, black tank top).  Loaded automatically (chars_ prefix, after chars_hy.js). */
'use strict';
Object.assign(POSES, {
  // Yujiro takes a punch in the open right palm and winds the whole body round it (twist + low sway)
  yuj_palmSpiral: { sp: .12, st: -.95, ss: .05, hp: .04, aR: [1.52, .05, 0], eR: .38, hR: 'open', wR: [-.95, 0], aL: [.75, 1.45, 0], eL: .9, hL: 'open', lL: [.6, .32, .2], kL: .75, lR: [-.55, .3, -.2], kR: .3, pump: .6, face: expr('stoic') },
  yuj_palmSpiral2: { sp: .22, st: .8, ss: -.08, hp: .08, aR: [1.2, .7, 0], eR: .5, hR: 'open', wR: [-.5, 0], aL: [1.0, 1.7, 0], eL: .7, hL: 'open', lL: [.35, .34, .2], kL: .5, lR: [-.75, .32, -.2], kR: .55, fR: .3, pump: .7, face: expr('stoic') },
  // one knee on the floor, right fist driven into the ground
  yuj_kneelPunch: { sp: .8, hp: -.3, aR: [.85, -.02, 0], eR: .05, hR: 'fist', aL: [.45, .55, 0], eL: .9, hL: 'open', lL: [1.45, .28, .12], kL: 2.1, lR: [.1, .3, -.15], kR: 2.55, fR: 1.15, pump: 1, face: expr('oniGrin') },
  yuj_kneelFistUp: { sp: .55, hp: -.25, aR: [1.05, -.05, 0], eR: 1.9, hR: 'fist', aL: [.45, .55, 0], eL: .9, hL: 'open', lL: [1.45, .28, .12], kL: 2.1, lR: [.1, .3, -.15], kR: 2.55, fR: 1.15, pump: 1, face: expr('focused') },
  // two fingers (index + middle) raised and set down on stone (the 'tremor-stilling' gesture), kneeling on one knee
  yuj_kneelTwoFinger: { sp: .72, hp: -.2, aR: [.95, -.02, 0], eR: .1, hR: 'sign', aL: [.45, .55, 0], eL: .9, hL: 'relax', lL: [1.45, .28, .12], kL: 2.1, lR: [.1, .3, -.15], kR: 2.55, fR: 1.15, face: expr('stoic') },
  // stops a fist with two raised fingers of the right hand (arm straight out, relaxed)
  yuj_twoFingerCatch: { sp: .06, st: -.25, hp: -.02, aR: [1.55, .02, 0], eR: .12, hR: 'sign', wR: [-.2, 0], aL: [.18, .5, 0], eL: .4, hL: 'hid', lL: [.2, .14, .2], kL: .25, lR: [-.3, .14, -.2], kR: .2, face: expr('stoic') },
  yuj_shirtToss: { sp: .12, st: -.6, hp: -.05, aR: [1.7, .3, 0], eR: .2, hR: 'open', wR: [-.3, 0], aL: [.2, .5, 0], eL: .3, hL: 'relax', lL: [.12, .14, .2], kL: .15, lR: [-.1, .14, -.2], kR: .1, face: expr('calm') },
  yuj_shirtWind: { sp: -.05, st: .5, hp: -.05, aR: [1.0, -.4, 0], eR: 1.9, hR: 'grip', aL: [.2, .5, 0], eL: .3, hL: 'relax', lL: [.1, .14, .2], kL: .12, lR: [-.08, .14, -.2], kR: .1, face: expr('calm') },
  yuj_eatStand: { sp: .1, hp: .05, aR: [1.15, -.35, 0], eR: 2.2, hR: 'grip', aL: [.2, .55, 0], eL: .35, hL: 'relax', lL: [.08, .14, .2], kL: .1, lR: [-.06, .14, -.2], kR: .08, face: expr('chew') },
  yuj_lowGuard: { sp: .25, st: .1, hp: -.1, aL: [.85, .3, 0], eL: 1.3, hL: 'open', aR: [.8, .25, 0], eR: 1.5, hR: 'open', lL: [.55, .2, .2], kL: .85, lR: [-.4, .2, -.2], kR: .5, fR: .3, pump: .5, face: expr('relish') },
  // Banner
  ban_smileWeak: { sp: .5, hp: .45, aL: [.6, .1, 0], eL: .3, hL: 'flat', aR: [.6, .1, 0], eR: .3, hR: 'flat', lL: [1.4, .12, .1], kL: 2.0, lR: [1.4, .12, 0], kR: 2.0, fR: .9, face: expr('smile', { eye: .55, lid: -.2, mouthW: .9 }) },
  ban_shield: { sp: .6, hp: .5, aL: [1.3, .1, 0], eL: 2.2, hL: 'flat', aR: [1.2, .0, 0], eR: 2.3, hR: 'flat', lL: [1.4, .12, .1], kL: 2.0, lR: [1.3, .12, 0], kR: 2.1, fR: .9, face: expr('afraid') },
});
// ------------------------------------------------------------------------------------------------------------- BAKI HANMA (cameo, E13)
HY.bakiHair = () => { const r = i => hash(i * 3.71 + 1); return [
  ...lockFan(12, .9, 5.4, .45, (th, u, i) => ({ th, ph: .4 + .15 * r(i), len: .6 + .22 * r(i + 1), w: .52, rootR: .95, dir: dirOut(th, .5 + .3 * r(i + 2), -.05, -.3), curl: [(r(i + 3) - .5) * .6, -.1, -.5], grav: .05, tw: .3, tip: 1.5, seg: 5, back: Math.cos(th) < .1, sway: .3 })),
  ...lockFan(8, -.9, .9, .8, (th, u, i) => ({ th, len: .55 + .22 * r(i + 9), w: .5, rootR: .96, dir: [Math.sin(th) * .4, .8, .1], curl: [Math.sin(th) * .4, -.4, -.4], grav: .1, tw: .3, tip: 1.5, seg: 5, front: true, gloss: i % 3 === 0 })),
]; };
CAST.baki = design(CAST.yujiro, {
  name: 'Baki Hanma', h: 1.7, headShape: { jaw: .78, chin: .95, square: .6, width: .98, tall: 1.0 }, body: { width: 1.12, shoulders: 1.2, depth: 1.1, limbs: 1.28, head: .95, legs: 1.0, neck: .75 },
  skin: '#e0ab86', skinShade: '#8e5a40', kosode: '#17161c', armSkin: '#e0ab86', handSkin: '#e0ab86', neckSkin: '#e0ab86', veinCol: '#8a4a3a',
  sleeve: { none: true }, haori: { none: true }, arm: { delt: 1.2, bicep: .4, elbow: .8, fore: .42, wrist: .75, flex: .3 }, fingerW: 1.05,
  hakama: { col: '#1a1920', r0: .11, r1: .095, r2: .088, pleats: false, ties: false },
  forms: { base: {} },
});
CAST.baki.face.eye = Object.assign({}, CAST.baki.face.eye, { irisCol: '#4a2a1c', irisLight: '#a8683a', irisDark: '#1a0c08', white: '#fbf4ec' });
CAST.baki.face.hair = Object.assign({}, CAST.baki.face.hair, { col: '#6a2e22', shadeCol: '#26100c', glossCol: '#b0604a', locks: HY.bakiHair(), springK: 60, springC: 8, cap: { front: .72, side: .06, back: -.7, jag: .08, jagN: 16 } });
CAST.baki.face.brow = { browW: .15, browY: 0, browCol: '#3a1810' };
CAST.baki.face.mouth = { mouthW: 1.15, teethN: 8, fangs: false };
CAST.baki.face.markings = (c, HM, e, lod, D) => {
  hyHeavyBrow(c, HM, e, D.skinShade, rgba(shadeHex(D.skinShade, -.5), .9), { fold: .9, brow: '#2a1210', eyeY: D.face.eyeY, browTh: .24 });
  const fr = faceFrame(HM, -.62, -.38, .5, .6);   // scar across the left cheek (viewer's right)
  decal(c, fr.p, fr.tu, fr.tv, cc => { inkPts(cc, [[-.5, .45], [.05, .02], [.5, -.4]], .07, '#8a2a28', [.4, .4]); inkPts(cc, [[-.28, .22], [-.2, .06]], .05, '#e8c8b0', [.3, .3]); inkPts(cc, [[.1, -.04], [.18, -.16]], .05, '#e8c8b0', [.3, .3]); }, .02, fr.n);
};
CAST.baki.torsoDetail = (c, S, D) => { if (LIGHT.override) return; hyMuscles(c, S, D, { def: .55 }); };
CAST.baki.extras = (S, D, F, t, parts, opt) => { for (const sd of ['L', 'R']) { const zA = camDepth(vLerp(S.J['el' + sd], S.J['wr' + sd], .3)), zT = camDepth(vLerp(S.J.pelvis, S.J.neck, .5)); parts.push({ z: (zA < zT ? zA - .02 : zA + .02) - .001, fn: c => { if (opt.mode !== 'flat') hyArmLines(c, S, D, sd); } }); } };
CAST.baki._body = hyBody(CAST.baki, B => { const k = B.h / 1.8; B.ring.waist[0] *= .85; B.ring.hip[0] *= .9; B.ring.shoulder[0] *= .9; B.shDrop = .09 * k; B.hand *= 1.3; B.limbR.neck *= 1.15; B.neck *= .7; });
CAST.baki.drawHead = stdHead(CAST.baki);
Object.assign(POSES, { baki_armsCrossed: Object.assign({}, POSES.yuj_armsCross, { hp: -.12, face: expr('grin', { eye: .6, lid: .3, mouthW: 1.1, mouthOpen: .15 }) }) });
if (window.HY_CODE2CAST) HY_CODE2CAST.BAKI = 'baki';
