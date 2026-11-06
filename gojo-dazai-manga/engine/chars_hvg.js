/* engine/chars_hvg.js (agent E, project harry-vs-gojo) - HARRY POTTER (Harry Potter) and GOJO SATORU (Jujutsu Kaisen).
   Sources (checked 2026-11-01): en.wikipedia.org "Harry Potter (character)", "Satoru Gojo"; jujutsu-kaisen.fandom.com (search
   summaries: Satoru Gojo / Appearance); harrypotter.fandom.com summaries (wands, Deathly Hallows).
   HARRY: ~1.74 m, slim; untidy jet-black hair that sticks up at the back, round glasses, bright GREEN eyes (his mother's),
     lightning-bolt scar on the forehead (his right side).  Recognisable costume: black Hogwarts robe with scarlet Gryffindor
     lining, grey V-neck jumper over a white shirt, scarlet-and-gold striped tie and scarf, dark trousers, black shoes.
     Wand: holly + phoenix feather (11", reddish brown); Elder Wand (pale elder wood, knobbly nodes along the shaft).
     Invisibility Cloak (silvery, fluid, see-through fabric), Resurrection Stone (black stone, Hallows sign), Sword of Gryffindor
     (silver blade, rubies in the hilt, 'GODRIC GRYFFINDOR' on the blade).
   GOJO: ~1.90 m, long legs; snow-white hair, pushed up into spikes by a BLACK BLINDFOLD (his usual eye covering); off duty small
     round black sunglasses; when the eyes are bare the hair falls down and the Six Eyes are a vivid luminous blue with white
     lashes.  Teacher uniform: dark navy zip-up jacket with a WIDE HIGH COLLAR, slim black trousers, black boots.
   FORMS
     harry: base (holly wand) | elder (Elder Wand) | sword (Sword of Gryffindor in the right hand, two-hand capable) |
            cloak (Invisibility Cloak worn: silver cloak; combine with fxInvisCloak for transparency) | memory (Pensieve-blue
            memory version) | wounded (wounds 2, torn robe hem)
     gojo : base (blindfold, spiky hair) | glasses (round black sunglasses, hair down) | bare (Six Eyes, hair down, eye glow) |
            rct (bare + Reverse Cursed Technique glow) | wounded (bare + wounds 2) | domain (bare, stronger eye glow)
   POSE FIELDS (interpolate where numeric)
     both:  wounds 0..3
     harry: wandGlow 0..1 + wandCol (tip light), stone 0..1 (Resurrection Stone on the left palm, glow), glasses:false, scarK
            (scar glow 0..1), sword {hand, dir, two} = the wand (or the Gryffindor sword in form 'sword')
     gojo:  sixGlow 0..1 (bare-eye glow; default 1 in bare/rct/domain), blindfold:false (base form without the band),
            glassesDown 0..1 (sunglasses slide down the nose -> eyes peek over), rctGlow 0..1, hands: 'cross' (index+middle
            crossed: Domain sign / Hollow Purple), 'pinch', 'two' (peace sign)                                          */
'use strict';
var HVG = window.HVG || {};
window.HVG = HVG;
HVG.col = {
  hHair: '#17151c', hHairShade: '#050408', hHairGloss: '#5a5a78', hEye: '#3fae4f', hEyeLight: '#b0f4a8', hEyeDark: '#0e4a24',
  robe: '#1d1f2a', robeLin: '#7a1717', jumper: '#5d5f68', shirt: '#f2f0ea', tie: '#8e1b1b', gold: '#d9a630', trousers: '#2a2a30', shoe: '#3b2a20',
  holly: '#8a4a2c', hollyDark: '#4a2414', elder: '#cfc6b2', elderDark: '#7e745e',
  gHair: '#f3f5fb', gHairShade: '#aebad6', gHairGloss: '#ffffff', gEye: '#46c4ff', gEyeLight: '#e6fbff', gEyeDark: '#1758b0',
  navy: '#1a2034', navyLin: '#0c0e16', gPants: '#121218', band: '#141218', skinH: '#f1d2b8', skinHShade: '#cf9e8c', skinG: '#f1d6c4', skinGShade: '#cf9f92',
};
// expressions (usable by everyone)
Object.assign(EXPR, {
  resolute: { eye: .92, lid: .22, brow: -.22, browA: .42, pupil: .9, mouth: 'line', mouthW: .85 },
  wry: { eye: .72, lid: .12, brow: .18, browA: -.05, pupil: .95, mouth: 'smirk', mouthW: .9, look: [.15, 0] },
  tired: { eye: .5, lid: -.12, brow: .1, browA: -.3, pupil: 1, mouth: 'line', mouthW: .8, sweat: 1 },
  defiant: { eye: 1.0, lid: .3, brow: -.3, browA: .55, pupil: .85, mouth: 'teeth', mouthOpen: .25, mouthW: .9 },
  hurt: { eye: .55, lid: -.25, brow: .2, browA: -.55, pupil: .85, mouth: 'pain', mouthOpen: .45, sweat: 1 },
  loving: { eye: .7, lid: -.15, brow: .22, browA: -.35, pupil: 1.12, mouth: 'smile', mouthW: .75, glint: 1, blush: .25 },
  playful: { eye: .7, lid: .05, brow: .25, browA: -.1, pupil: .95, mouth: 'grin', mouthOpen: .35, mouthW: 1.3 },
  serious: { eye: .8, lid: .25, brow: -.15, browA: .3, pupil: .8, mouth: 'line', mouthW: .75 },
  cocky: { eye: .62, lid: .28, brow: .15, browA: .1, pupil: .8, mouth: 'smirk', mouthW: 1.15, look: [.1, -.05] },
  honored: { eye: .85, lid: .05, brow: .05, browA: 0, pupil: .7, mouth: 'smile', mouthW: .8, glint: 1 },
  exhausted: { eye: .45, lid: -.15, brow: .08, browA: -.35, pupil: 1, mouth: 'open', mouthOpen: .25, mouthW: .7, sweat: 1 },
  sorrow: { eye: .74, lid: -.38, brow: .42, browA: -.62, pupil: 1.05, mouth: 'frown', mouthW: .6, tears: 1, glint: 1 },
  smug: { eye: .62, lid: .25, brow: .12, browA: .12, pupil: .82, mouth: 'smirk', mouthW: 1.2, look: [.08, -.04] },
  delighted: { eye: .3, lid: 0, brow: .38, browA: -.3, pupil: 1, mouth: 'laugh', mouthOpen: .8, mouthW: 1.3, closed: 1, closedUp: 1 },
  bliss: { eye: .25, lid: 0, brow: .35, browA: -.25, pupil: 1, mouth: 'laugh', mouthOpen: .7, mouthW: 1.25, closed: 1, closedUp: 1 },
});
Object.assign(HAND_SHAPES, {
  cross: { curl: [0, .02, 1, 1], spread: -.62, thumb: .85 },     // index + middle crossed (Domain Expansion sign / Purple)
  pinch: { curl: [.55, 1, 1, 1], spread: 0, thumb: .55 },        // small flick (Red / Blue at the fingertip)
  wandgrip: { curl: [.8, .95, .97, 1], spread: 0, thumb: .6 },   // index resting along the wand
});

// ------------------------------------------------------------------------------------------------------------- HARRY hair
const HVG_HHAIR = (o = {}) => () => {
  const r = i => hash(i * 7.31 + 3), mess = o.mess == null ? 1 : o.mess;
  return [
    // untidy back + sides: many short locks pointing every which way, the crown sticks up
    ...lockFan(18, .95, 5.33, .42, (th, u, i) => ({ th, ph: .38 + .12 * Math.sin(i * 2.7), len: (.78 + .26 * r(i)) * (1 - .12 * Math.cos(th)), w: .44, rootR: .95,
      dir: dirOut(th + (r(i + 9) - .5) * .45 * mess, .12 + .22 * r(i + 4), 1.0, -.1), curl: [(r(i + 2) - .5) * 1.0 * mess - Math.sin(th) * .5, .2 + .25 * r(i + 5), -Math.cos(th) * .55], grav: .85,
      wave: [.12, 1.1, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .28, tip: 1.25, seg: 7, back: Math.cos(th) < .1, gloss: i % 4 === 1 })),
    ...lockFan(8, 2.3, 4.0, 1.12, (th, u, i) => ({ th, len: .48 + .22 * r(i + 30), w: .44, rootR: .97, dir: dirOut(th + (r(i + 40) - .5) * .8, .95, 0, -.2), curl: [(r(i + 41) - .5) * 2 * mess, -.4, (r(i + 42) - .5)], grav: .2,
      tw: .3, tip: 1.2, seg: 6, back: true })),
    ...lockFan(6, -1.0, 1.0, 1.32, (th, u, i) => ({ th, len: .6 + .25 * r(i + 50), w: .44, rootR: .97, dir: dirOut(th, 1.1, 0, .3), curl: [(r(i + 51) - .5) * 1.6 * mess, -1.1, .6], grav: .4, tw: .3, tip: 1.3, seg: 6, gloss: i === 2 })),
    // messy fringe: tufts falling over the brow, a gap over the (viewer-left) scar
    ...lockFan(7, -.8, .8, .9, (th, u, i) => { const gap = Math.abs(th + .27) < .16 ? .62 : 1; return { th, len: (.82 + .16 * r(i + 60)) * gap, w: .36, rootR: .965,
      dir: [Math.sin(th) * .5 + (r(i + 61) - .5) * .35, -.1, 1], curl: [(r(i + 62) - .5) * 1.1 + Math.sin(th) * .4, -1.5, -.55], grav: 1.4, tw: .27, tip: 1.2, seg: 7, front: true, gloss: i % 3 === 1 }; }),
    // side locks over the ears
    ...lockFan(2, 1.15, 1.45, .3, (th, u, i) => ({ th, len: .95, w: .34, rootR: .97, dir: [.3, -.85, .25], curl: [-.3, .1, .1], grav: 1.1, wave: [.15, 1, i], tw: .28, tip: 1.2, front: true })),
    ...lockFan(2, -1.45, -1.15, .3, (th, u, i) => ({ th, len: .95, w: .34, rootR: .97, dir: [-.3, -.85, .25], curl: [.3, .1, .1], grav: 1.1, wave: [.15, 1, i + 1], tw: .28, tip: 1.2, front: true })),
  ];
};
// ------------------------------------------------------------------------------------------------------------- GOJO hair
const HVG_GHAIR_UP = () => {   // blindfold: hair pushed up into soft white spikes
  const r = i => hash(i * 5.17 + 11);
  return [
    ...lockFan(16, 0, TAU * .94, .3, (th, u, i) => ({ th: th + (r(i + 7) - .5) * .25, ph: .26 + .14 * r(i + 8), len: .8 + .55 * r(i), w: .6 + .15 * r(i + 9), rootR: .95, dir: dirOut(th + (r(i + 5) - .5) * .4, .5 + .55 * r(i + 3), -.05, -.3),
      curl: [Math.sin(th) * .45 + (r(i + 4) - .5) * .7, .25, Math.cos(th) * .1 - .55], grav: -.08, tw: .3, tip: 1.1, seg: 7, back: Math.cos(th) < -.3, sway: .6, gloss: i % 4 === 0 })),
    ...lockFan(7, .3, TAU * .9, .95, (th, u, i) => ({ th, len: .75 + .35 * r(i + 20), w: .72, rootR: .97, dir: dirOut(th, 1.0 + .3 * r(i + 23), -.1, -.45), curl: [(r(i + 21) - .5) * .8, .2, -.7], grav: -.06, tw: .3, tip: 1.1, seg: 7, sway: .6, gloss: i % 3 === 0 })),
    { th: 0, ph: 1.45, len: .95, w: .7, rootR: .97, dir: [0, 1, .1], curl: [.1, .2, .3], grav: -.1, tw: .3, tip: 1.6, seg: 7, sway: .5 },
    // front spikes above the band (flick forward-up over the forehead)
    ...lockFan(6, -.8, .8, .3, (th, u, i) => ({ th, len: .85 + .2 * r(i + 30), w: .52, rootR: .965, dir: [Math.sin(th) * .55, .95, .35], curl: [Math.sin(th) * .4, .3, -.2], grav: -.05, tw: .3, tip: 1.15, seg: 7, front: true, sway: .5, gloss: i === 2 })),
  ];
};
const HVG_GHAIR_DOWN = () => { // eyes bare / sunglasses: soft white hair falls over the forehead, nape length
  const r = i => hash(i * 3.71 + 5);
  return [
    ...lockFan(17, 1.0, 5.28, .4, (th, u, i) => ({ th, ph: .36 + .06 * Math.sin(i * 2.3), len: (1.25 + .18 * r(i)) * (1 - .12 * Math.cos(th)), w: .42, rootR: .95, dir: dirOut(th, .15, 1.0, -.05),
      curl: [-Math.sin(th) * .6 + (r(i + 1) - .5) * .5, .2, -Math.cos(th) * .7], grav: .85, wave: [.1, .9, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .27, tip: 1.3, seg: 8, back: Math.cos(th) < .2, gloss: i % 4 === 1 })),
    ...lockFan(7, 2.2, 4.1, 1.1, (th, u, i) => ({ th, len: .9 + .2 * r(i + 10), w: .48, rootR: .97, dir: dirOut(th, -.1, .6, 0), curl: [(r(i + 11) - .5) * .6, -.2, -.4], grav: 1.0, tw: .3, tip: 1.3, seg: 7, back: true })),
    // fringe: long white bangs hanging between and over the brows (one lock between the eyes)
    ...lockFan(7, -.85, .85, .92, (th, u, i) => ({ th, len: (.8 + .12 * Math.sin(u * 7.3 + 1) + .14 * r(i + 20)) * (1 - .2 * Math.pow(Math.abs(u - .5) * 2, 3)), w: .38, rootR: .965,
      dir: [Math.sin(th) * .45 + (r(i + 21) - .5) * .2, -.25, 1], grav: 1.9, curl: [.18 * (u - .5) + (r(i + 22) - .5) * .3, -1.3, -.62], tw: .26, tip: 1.25, seg: 8, front: true, gloss: i % 3 === 1 })),
    { th: .06, ph: .95, len: 1.0, w: .24, rootR: .965, dir: [0, -.2, 1], curl: [-.1, -1.4, -.6], grav: 1.9, tw: .26, tip: 1.3, seg: 8, front: true },
    ...lockFan(2, 1.12, 1.5, .3, (th, u, i) => ({ th, len: 1.3, w: .3, rootR: .97, dir: [.3, -.9, .2], curl: [-.35, .05, .05], grav: 1.1, wave: [.1, 1, i], tw: .26, tip: 1.2, front: true })),
    ...lockFan(2, -1.5, -1.12, .3, (th, u, i) => ({ th, len: 1.3, w: .3, rootR: .97, dir: [-.3, -.9, .2], curl: [.35, .05, .05], grav: 1.1, wave: [.1, 1, i + 1], tw: .26, tip: 1.2, front: true })),
  ];
};

// ------------------------------------------------------------------------------------------------------------- wands + sword specs
function hvgWandPoly(base, tipW) { return (pts, bl) => { const n = 10, a = [], b = []; for (let i = 0; i <= n; i++) { const u = i / n * bl, w = lerp(1, tipW, u); a.push(pts(u, .3 - .3 * w * 1.6)); b.push(pts(u, .3 + .7 * w)); } return a.concat(b.reverse()); }; }
HVG.WAND_HOLLY = { len: .28, w: .016, curve: 0, handle: .11, tsuba: 'none', col: HVG.col.holly, edgeCol: shadeHex(HVG.col.holly, .12), hiltCol: HVG.col.hollyDark, wrapCol: '#b07a52', bladePoly: hvgWandPoly(1, .35),
  extra: (c, fr, pts, s, flat, opt) => { if (flat || LIGHT.override) return; const p = proj2(pts(.02, .3)); c.fillStyle = HVG.col.hollyDark; c.beginPath(); c.arc(p[0], p[1], Math.max(1.2, .011 * s), 0, TAU); c.fill(); } };
HVG.WAND_ELDER = { len: .3, w: .019, curve: .012, handle: .11, tsuba: 'none', col: HVG.col.elder, edgeCol: '#e8e2d2', hiltCol: HVG.col.elderDark, wrapCol: '#9a907a', bladePoly: hvgWandPoly(1, .3),
  extra: (c, fr, pts, s, flat, opt) => { if (flat || LIGHT.override) return; const lw = Math.max(1, lineW(s, .55)); for (let i = 0; i < 6; i++) { const u = .05 + i * .16, p = proj2(pts(u, .3)), r = Math.max(1.2, .014 * s * (1 - u * .45));   // knobbly nodes
    c.fillStyle = HVG.col.elder; c.beginPath(); c.ellipse(p[0], p[1], r, r * .8, i, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = lw; c.stroke(); } } };
HVG.GSWORD = { len: .9, w: .05, curve: 0, handle: .24, tsuba: 'none', col: '#d6dde6', edgeCol: '#f6f9ff', hiltCol: '#b8bcc6', wrapCol: '#8a1420',
  bladePoly: (pts, bl) => { const n = 12, a = [], b = []; for (let i = 0; i <= n; i++) { const u = i / n * bl * .93; a.push(pts(u, -.65)); b.push(pts(u, 1.25)); } return a.concat([pts(bl, .3)]).concat(b.reverse()); },
  extra: (c, fr, pts, s, flat, opt) => { const k = 1, g0 = vMad(fr.grip, fr.dir, .24 * .35 * k), e = fr.edge, lw = Math.max(1, lineW(s, .7));
    const bar = [vMad(g0, e, -.1), vMad(g0, e, .1)].map(p => proj2(p)); c.lineCap = 'round'; c.strokeStyle = flat ? opt.col : LIGHT.ink; c.lineWidth = .028 * s + lw * 2; c.beginPath(); c.moveTo(bar[0][0], bar[0][1]); c.lineTo(bar[1][0], bar[1][1]); c.stroke();
    if (flat) return; c.strokeStyle = tones('#c8a040').base; c.lineWidth = .028 * s; c.stroke();
    for (const q of [proj2(g0), proj2(vMad(fr.grip, fr.dir, -.17))]) { const r = Math.max(1.6, .016 * s); c.fillStyle = '#c0122a'; c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = lw * .8; c.stroke(); c.fillStyle = 'rgba(255,220,230,.85)'; c.beginPath(); c.arc(q[0] - r * .3, q[1] - r * .3, r * .3, 0, TAU); c.fill(); }
    if (!LIGHT.override && s > 260) { const a = proj2(pts(.12, .3)), b = proj2(pts(.6, .3)); c.save(); c.translate(a[0], a[1]); c.rotate(Math.atan2(b[1] - a[1], b[0] - a[0])); c.font = `700 ${Math.max(6, .022 * s)}px serif`; c.fillStyle = 'rgba(80,90,110,.55)'; c.fillText('GODRIC  GRYFFINDOR', 0, Math.max(2, .006 * s)); c.restore(); } } };

// ------------------------------------------------------------------------------------------------------------- HARRY design
CAST.harry = design(SHINIGAMI, {
  name: 'Harry Potter', h: 1.74, body: { width: .9, limbs: .92, shoulders: .96, depth: .95, legs: 1.04, neck: 1.02 }, skin: HVG.col.skinH, skinShade: HVG.col.skinHShade,
  kosode: HVG.col.jumper, collar: { under: HVG.col.shirt, skinCol: HVG.col.shirt, v0: .64, w: .5, shift: 0 },
  torsoTones: [{ col: HVG.col.tie, mask: (u, v) => .05 - Math.abs(angOf(u)) - (v < .66 ? 1 : 0) }],
  torsoDetail: (c, S, D, T, G) => harryTorsoDetail(c, S, D, T, G),
  sleeve: { col: HVG.col.robe, lining: '#3a1418', r0: .08, r1: .095, r2: .118, sag: .1, len: 1.0 },
  hakama: { col: HVG.col.trousers, r0: .09, r1: .078, r2: .07, pleats: false, ties: false },
  obi: null,
  haori: { col: HVG.col.robe, lining: HVG.col.robeLin, len: .94, sleeves: true, hem: 'none', kanji: null, open: .34, flare: .5, collarLen: .66 },
  scarf: { col: HVG.col.tie, stripes: { col: HVG.col.gold, n: 7 }, v0: .9, v1: 1.0, tails: [{ th: .42, len: .58, w: .11, out: .07 }, { th: -.3, len: .66, w: .105, out: .06 }] },
  feet: { col: HVG.col.shoe, sandal: false, w: 1.0 },
  sword: HVG.WAND_HOLLY,
  face: {
    eye: { w: 1.08, h: .36, irisR: .32, irisCol: HVG.col.hEye, irisLight: HVG.col.hEyeLight, irisDark: HVG.col.hEyeDark, tilt: .02, thick: 1.15, flick: .04, lashes: true, crease: true, pupilR: .34, lidShade: '#5a6a80' },
    eyeSize: .38, eyeY: -.2, defaultExpr: 'determined', brow: { browW: .07, browY: .08, browCol: '#141218' }, headShape: { jaw: .95, chin: .98, width: .94 }, noseK: .9,
    mouth: { mouthW: .9 }, mouthSize: .25, mouthY: -.76,
    hair: { col: HVG.col.hHair, shadeCol: HVG.col.hHairShade, gloss: true, glossCol: HVG.col.hHairGloss, springK: 34, springC: 5, cap: { front: .66, side: .05, back: -.85 }, locks: HVG_HHAIR() },
    markings: (c, HM, e, lod, D) => harryScar(c, HM, e, lod, D),
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (!D.noGlasses && S.pose.glasses !== false) parts.push({ z: zc - HM.r * 1.08, fn: c => hvgRoundGlasses(c, HM, opt, S.pose, { frame: D.memory ? '#4a3a24' : '#141218', r: .37, lens: null, thick: 1.7, crack: D.glassesCrack || 0 }) }); },
  },
  sheetExprs: ['determined', 'calm', 'wry', 'pain', 'shock', 'sorrow', 'smile', 'exhausted', 'defiant', 'loving', 'shout', 'surprised', 'angry', 'eyesClosed'],
  extras: (S, D, F, t, parts, opt) => harryExtras(S, D, F, t, parts, opt),
  forms: {
    base: {}, elder: { sword: HVG.WAND_ELDER }, sword: { sword: HVG.GSWORD },
    cloak: { haori: { col: '#aeb8cc', lining: '#d8e0ee', len: 1.0, sleeves: true, hem: 'none', open: .22, flare: .62, collarLen: .72 }, sleeve: { col: '#aeb8cc', lining: '#d8e0ee', r0: .085, r1: .1, r2: .125, sag: .12, len: 1.0 }, cloakShimmer: true,
      figAlpha: P => .05 + .95 * clamp(P.cloak == null ? 1 : P.cloak, 0, 1), postFig: (ctx, F, t, S, D, opt) => { const k = 1 - clamp(S.pose.cloak == null ? 1 : S.pose.cloak, 0, 1); if (k > .02 && typeof fxInvisCloak === 'function') fxInvisCloak(ctx, F, t, k); } },
    memory: { memory: true, h: 1.5, body: { width: .86, limbs: .9, shoulders: .9, depth: .92, legs: .98, neck: 1.0, head: 1.1 }, skin: '#ecd6b4', skinShade: '#c8a07a', kosode: '#8a7a62', collar: { under: '#f4ead8', skinCol: '#f4ead8', v0: .64, w: .5, shift: 0 }, torsoTones: [{ col: '#9a5a30', mask: (u, v) => .05 - Math.abs(angOf(u)) - (v < .66 ? 1 : 0) }],
      haori: { col: '#3a2e22', lining: '#8a4a2a', len: .97, sleeves: true, hem: 'none', open: .3, flare: .5, collarLen: .66 }, sleeve: { col: '#3a2e22', lining: '#5a3a24', r0: .08, r1: .095, r2: .118, sag: .1, len: 1.0 },
      hakama: { col: '#4a4034', r0: .09, r1: .078, r2: .07, pleats: false, ties: false }, scarf: { col: '#9a5a30', stripes: { col: '#e8c890', n: 7 }, v0: .9, v1: 1.0, tails: [{ th: .42, len: .5, w: .1, out: .07 }, { th: -.3, len: .56, w: .095, out: .06 }] },
      feet: { col: '#3a2a1e', sandal: false, w: 1.0 }, sword: Object.assign({}, HVG.WAND_HOLLY, { col: '#8a5a34', hiltCol: '#4a2a14' }) },
    battle: { wounds: 1, haori: { col: HVG.col.robe, lining: HVG.col.robeLin, len: .9, sleeves: true, hem: 'none', open: .42, flare: .6, collarLen: .66, torn: .5 } },
    wounded: { wounds: 2, glassesCrack: 1, haori: { col: HVG.col.robe, lining: HVG.col.robeLin, len: .88, sleeves: true, hem: 'none', open: .44, flare: .6, collarLen: .66, torn: .8 } },
  },
});
(function () {
  const H = CAST.harry, f0 = H.face;
  H.forms.memory.face = Object.assign({}, f0, { eyeSize: .42, hair: Object.assign({}, f0.hair, { col: '#3a2a1c', shadeCol: '#1e140c', glossCol: '#a08060' }), eye: Object.assign({}, f0.eye, { irisCol: '#7a9a50', irisLight: '#e8f0c0', irisDark: '#3a4a20' }), brow: Object.assign({}, f0.brow, { browCol: '#3a2a1c' }) });
})();
CAST.harry.drawHead = stdHead(CAST.harry);
for (const fm of ['base', 'elder', 'sword', 'battle', 'wounded']) if (CAST.harry.forms[fm]) CAST.harry.forms[fm].postFig = null;

function harryScar(c, HM, e, lod, D) {   // lightning-bolt scar on the forehead (his right = viewer's left), glows with pose.scarK
  const fr = faceFrame(HM, -.27, .5, .55, .2), k = D._scarK || 0;
  decal(c, fr.p, fr.tu, fr.tv, cc => { const pts = [[.05, .95], [-.18, .25], [.18, .12], [-.08, -.85]];
    if (k > .01) { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.strokeStyle = rgba('#ff5040', .5 * k); cc.lineWidth = .34; cc.lineJoin = 'round'; cc.beginPath(); pts.forEach((p, i) => i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])); cc.stroke(); cc.restore(); }
    cc.strokeStyle = k > .3 ? '#c0283a' : (D.memory ? '#7a86a8' : '#b05a5a'); cc.lineWidth = lod > 0 ? .12 : .2; cc.lineJoin = 'miter'; cc.lineCap = 'round'; cc.beginPath(); pts.forEach((p, i) => i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])); cc.stroke(); }, .05, fr.n);
}
function harryTorsoDetail(c, S, D, T, G) {
  if (LIGHT.override) return; const s = gridScale(G);
  // gold diagonal stripes on the tie
  const lw = lineW(s, .6); for (let i = 0; i < 4; i++) { const v = .7 + i * .065; const fr = surfFrame(T.surf, 0, v); if (vDot(fr.n, toCam(fr.p)) < .1) continue;
    const a = proj2(surfFrame(T.surf, .99, v - .012).p), b = proj2(surfFrame(T.surf, .01, v + .012).p); c.strokeStyle = D.memory ? '#d8e4f8' : HVG.col.gold; c.lineWidth = Math.max(1, lw * 1.2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
}
// round glasses: one flat plane in front of the eyes, thin dark frames, a lens glare; opt dark lenses (Gojo)
function hvgRoundGlasses(c, HM, opt, P, o = {}) {
  if (opt.mode === 'flat') return; const s = pxScale(HM.c), lw = Math.max(1.6, lineW(s, .9) * (o.w || 1.05)), ink = LIGHT.override ? LIGHT.ink : (o.frame || '#1c1a20');
  const fwd = HM.M[2], fwdFacing = vDot(fwd, toCam(HM.c)), inner = [], down = (P.glassesDown || 0) * HM.r * .22, R = o.r || .4;
  for (const sg of [-1, 1]) {
    const sideFacing = vDot(vMul(HM.M[0], sg), toCam(HM.c)); if (fwdFacing < .05 || (fwdFacing < .5 && sideFacing < -.3)) continue;
    const ep = HM.at(sg * .45, -.2), tu = vMul(HM.M[0], HM.r * R * sg), tv = vMul(HM.M[1], HM.r * R), p0 = vMad(vMad(ep, fwd, HM.r * .12), HM.M[1], -down);
    const ring = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ring.push(vAdd(p0, vAdd(vMul(tu, Math.cos(a) * .98), vMul(tv, Math.sin(a) * .92)))); }
    const sp = ring.map(p => proj2(p));
    if (!LIGHT.override) {
      if (o.lens) { polyPath(c, sp); c.fillStyle = o.lens; c.fill(); }
      c.save(); polyPath(c, sp); c.clip(); c.strokeStyle = o.dark ? 'rgba(140,170,220,.55)' : 'rgba(255,255,255,.85)'; c.lineWidth = lw * 1.5; const a = sp[15], b = sp[3];
      c.beginPath(); c.moveTo(lerp(a[0], b[0], .18), lerp(a[1], b[1], .18)); c.lineTo(lerp(a[0], b[0], .42), lerp(a[1], b[1], .42)); c.moveTo(lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)); c.lineTo(lerp(a[0], b[0], .58), lerp(a[1], b[1], .58)); c.stroke();
      const ck = (P.glassesCrack != null ? P.glassesCrack : (o.crack || 0)); if (ck > .02 && sg < 0) { const m = proj2(vAdd(p0, vMul(tu, -.2))); c.strokeStyle = `rgba(255,255,255,${.9 * Math.min(1, ck * 1.5)})`; c.lineWidth = Math.max(1, lw * .45); for (let i = 0; i < 3 + Math.round(ck * 5); i++) { const an = i * 1.3 + .4, L = lw * (6 + 6 * hash(i * 3)) * (.5 + ck); c.beginPath(); c.moveTo(m[0], m[1]); c.lineTo(m[0] + Math.cos(an) * L, m[1] + Math.sin(an) * L); c.lineTo(m[0] + Math.cos(an + .3) * L * 1.4, m[1] + Math.sin(an + .3) * L * 1.4); c.stroke(); } }
      c.restore();
    }
    polyPath(c, sp); c.lineJoin = 'round'; c.lineWidth = lw * (o.thick || 1.25); c.strokeStyle = ink; c.stroke();
    inner.push(ring[12 + (sg > 0 ? 0 : 0)]);
    const ear = HM.at(sg * 1.45, -.1); if (vDot(vNorm(vSub(ear, HM.c)), toCam(ear)) > -.35) { const a = proj2(ring[sg > 0 ? 0 : 12]), b = proj2(ear); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = lw; c.strokeStyle = ink; c.stroke(); }
  }
  if (inner.length === 2) { const L = proj2(vAdd(HM.at(.45, -.2), vMul(HM.M[0], -HM.r * R))), Rr = proj2(vAdd(HM.at(-.45, -.2), vMul(HM.M[0], HM.r * R))); const off = down ? proj2(vMad(HM.c, HM.M[1], -down)) : null;
    const lp = proj2(vMad(vMad(vAdd(HM.at(.45, -.2), vMul(HM.M[0], -HM.r * R * .98)), fwd, HM.r * .12), HM.M[1], -down)), rp = proj2(vMad(vMad(vAdd(HM.at(-.45, -.2), vMul(HM.M[0], HM.r * R * .98)), fwd, HM.r * .12), HM.M[1], -down));
    c.beginPath(); c.moveTo(lp[0], lp[1]); c.quadraticCurveTo((lp[0] + rp[0]) / 2, (lp[1] + rp[1]) / 2 - lw * 2.5, rp[0], rp[1]); c.lineWidth = lw; c.strokeStyle = ink; c.stroke(); }
}
function harryExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8;
  D._scarK = p.scarK || 0;
  // wand-tip light (Lumos / spell charge)
  if (p.wandGlow && p.sword && !p.sword.sheathed && D.sword) { const fr = swordFrame(S, D, p.sword), L = (D.sword.len || .3) * k, tip = vMad(fr.grip, fr.dir, (D.sword.handle || .1) * k * .35 + L);
    parts.push({ z: camDepth(tip) - .02, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const q = project(tip); if (!q) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, .22 * k * q.s * (.6 + p.wandGlow * .6), p.wandCol || '#e8f4ff', .85 * p.wandGlow); glow(c, q.x, q.y, .05 * k * q.s, '#ffffff', p.wandGlow); c.restore(); } }); }
  if (p.snitch) { const sd = p.snitchHand || 'L', hg = handGeom(S, sd, p['h' + sd] || 'flat'); if (hg) parts.push({ z: camDepth(hg.palmC) - .04, fn: c => drawSnitch(c, vMad(hg.palmC, vNorm(vMul(hg.np, -1)), .04 * k), .03 * k * p.snitch, t, opt) }); }
  if (p.stone) { const hg = handGeom(S, 'L', p.hL || 'flat'); if (hg) parts.push({ z: camDepth(hg.palmC) - .03, fn: c => drawResStone(c, S, hg, p.stone, opt) }); }
  if (D.cloakShimmer) parts.push({ z: camDepth(S.J.abd) - .2, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const q = project(S.J.abd); if (!q) return; c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(Math.floor(t * 12));
    for (let i = 0; i < 9; i++) { const x = q.x + (r() - .5) * .7 * k * q.s, y = q.y + (r() - .3) * 1.1 * k * q.s; c.strokeStyle = rgba('#e8f0ff', .35 * r()); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 10, y + .1 * k * q.s); c.stroke(); } c.restore(); } });
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0));
}
// Golden Snitch: walnut-sized gold ball with two fluttering silver wings (p = world centre, r = radius)
function drawSnitch(c, p, r, t, opt) { const q = project(p); if (!q || r <= 0) return; const R = r * q.s, fl = Math.sin(t * 60) * .6;
  if (opt && opt.mode === 'flat') { c.fillStyle = opt.col; c.beginPath(); c.arc(q.x, q.y, R, 0, TAU); c.fill(); return; }
  for (const sg of [-1, 1]) { c.save(); c.translate(q.x + sg * R * .8, q.y - R * .2); c.rotate(sg * (-.5 + fl)); c.fillStyle = 'rgba(240,244,255,.9)'; c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(.8, R * .06); c.beginPath(); c.ellipse(sg * R * 1.4, -R * .3, R * 1.5, R * .5, sg * -.3, 0, TAU); c.fill(); c.stroke(); c.restore(); }
  const gr = c.createRadialGradient(q.x - R * .3, q.y - R * .3, R * .1, q.x, q.y, R); gr.addColorStop(0, '#fff6c0'); gr.addColorStop(.5, '#ffd040'); gr.addColorStop(1, '#a8701a'); c.fillStyle = LIGHT.override ? LIGHT.override.fill : gr; c.beginPath(); c.arc(q.x, q.y, R, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(1, R * .1); c.stroke();
  if (!LIGHT.override) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, R * 4, '#ffd36a', .35); c.restore(); } }
// Resurrection Stone: a small black stone with the Hallows sign (triangle, circle, line) resting on the palm, glow 0..1
function drawResStone(c, S, hg, k, opt) {
  const kk = S.B.h / 1.8, n = vNorm(vMul(hg.np, -1)), ctr = vMad(hg.palmC, n, .025 * kk), q = project(ctr); if (!q) return; const r = .022 * kk * q.s * clamp(k * 1.5, 0, 1);
  if (opt.mode === 'flat') { c.fillStyle = opt.col; c.beginPath(); c.ellipse(q.x, q.y, r, r * .8, 0, 0, TAU); c.fill(); return; }
  if (!LIGHT.override && k > .5) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, r * 9 * (k - .3), '#bfe0ff', .45 * (k - .4)); c.restore(); }
  c.fillStyle = LIGHT.override ? LIGHT.override.fill : '#1e1c24'; c.beginPath(); c.ellipse(q.x, q.y, r * 1.1, r * .85, .3, 0, TAU); c.fill(); c.strokeStyle = LIGHT.ink; c.lineWidth = Math.max(1, r * .12); c.stroke();
  if (!LIGHT.override && r > 3) { c.strokeStyle = 'rgba(220,235,255,.85)'; c.lineWidth = Math.max(.6, r * .07); c.beginPath(); c.moveTo(q.x, q.y - r * .6); c.lineTo(q.x + r * .55, q.y + r * .4); c.lineTo(q.x - r * .55, q.y + r * .4); c.closePath(); c.moveTo(q.x, q.y - r * .6); c.lineTo(q.x, q.y + r * .4); c.stroke(); c.beginPath(); c.arc(q.x, q.y + r * .1, r * .29, 0, TAU); c.stroke(); }
}

// ------------------------------------------------------------------------------------------------------------- GOJO design
CAST.gojo = design(SHINIGAMI, {
  name: 'Gojo Satoru', h: 1.9, body: { width: .94, limbs: .95, shoulders: 1.06, depth: .95, legs: 1.1, neck: 1.08 }, skin: HVG.col.skinG, skinShade: HVG.col.skinGShade,
  kosode: HVG.col.navy, collar: { none: true }, obi: null,
  torsoDetail: (c, S, D, T, G) => gojoTorsoDetail(c, S, D, T, G),
  sleeve: { col: HVG.col.navy, lining: HVG.col.navyLin, r0: .07, r1: .066, r2: .062, sag: .03, len: 1.0 },
  hakama: { col: HVG.col.gPants, r0: .094, r1: .078, r2: .066, pleats: false, ties: false },
  haori: { col: HVG.col.navy, lining: HVG.col.navyLin, len: .42, sleeves: true, hem: 'none', kanji: null, open: .03, flare: .22, collarLen: .25 },
  feet: { col: '#141218', sandal: false, w: 1.05, shaft: .22, shaftCol: '#141218', shaftR: 1.12 },
  face: {
    eye: { w: 1.1, h: .4, irisR: .37, irisCol: HVG.col.gEye, irisLight: HVG.col.gEyeLight, irisDark: HVG.col.gEyeDark, irisRing: '#bff2ff', tilt: .03, thick: 1.12, flick: .06, lashes: true, crease: true, pupilR: .26, lidShade: '#7a8ab8', ink: '#2c3148' },
    eyeSize: .38, eyeY: -.2, defaultExpr: 'smug', brow: { browW: .06, browY: .1, browCol: '#c8cfe0' }, headShape: { jaw: .96, chin: .98, width: .93 }, noseK: .92,
    mouth: { mouthW: .9 }, mouthSize: .25, mouthY: -.77,
    hair: { col: HVG.col.gHair, shadeCol: HVG.col.gHairShade, gloss: true, glossCol: HVG.col.gHairGloss, springK: 30, springC: 5, cap: { front: .0, side: -.05, back: -.85 }, locks: HVG_GHAIR_UP },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => gojoHeadParts(S, D, F, t, parts, opt, HM, e, zc),
  },
  sheetExprs: ['smug', 'playful', 'bored', 'serious', 'delighted', 'shock', 'honored', 'surprised', 'angry', 'calm', 'grin', 'menace', 'pain', 'shout'],
  extras: (S, D, F, t, parts, opt) => gojoExtras(S, D, F, t, parts, opt),
  forms: { base: { blindfold: true }, eyes: { blindfold: true, blindDefault: 0, sixDefault: 1 }, glasses: { sunglasses: true }, bare: { sixDefault: 1 }, rct: { sixDefault: 1, rctDefault: 1, wounds: 1 }, wounded: { sixDefault: .6, wounds: 2 }, domain: { sixDefault: 1 },
    serious: { blindfold: true, blindDefault: 0, sixDefault: 1, haori: { col: HVG.col.navy, lining: HVG.col.navyLin, len: .42, sleeves: true, hem: 'none', kanji: null, open: .3, flare: .4, collarLen: .4 } },
    youth: { h: 1.86, sunglasses: true, haori: { col: '#15161c', lining: '#0c0d12', len: .1, sleeves: true, hem: 'none', kanji: null, open: .02, flare: .1, collarLen: .25 }, hakama: { col: '#15161c', r0: .1, r1: .1, r2: .1, pleats: false, ties: false } } },
});
(function () {
  const G = CAST.gojo, f0 = G.face, down = Object.assign({}, f0, { noEyes: false, brows: true, hair: Object.assign({}, f0.hair, { locks: HVG_GHAIR_DOWN, cap: { front: .62, side: .05, back: -.85 } }) });
  for (const fm of ['glasses', 'bare', 'rct', 'wounded', 'domain']) G.forms[fm].face = down;
  G.forms.youth.face = Object.assign({}, down, { eyeSize: .4 });
  G.forms.serious.face = Object.assign({}, f0, { hair: Object.assign({}, f0.hair, { locks: () => HVG_GHAIR_UP().map(L => Object.assign({}, L, { dir: vNorm(vAdd(L.dir, [0, -.45, -.25])), grav: (L.grav || 0) + .35, len: L.len * .95 })) }) });
})();
CAST.gojo.drawHead = stdHead(CAST.gojo);
function gojoTorsoDetail(c, S, D, T, G) {
  if (LIGHT.override) return; const s = gridScale(G);
  strokeRuns(c, surfLine(T.surf, [[0, .98], [0, .8], [0, .6], [0, .4], [0, .25]], .02), lineW(s, .55), '#3a4466');   // zip line
}
function gojoHeadParts(S, D, F, t, parts, opt, HM, e, zc) {
  const p = S.pose;
  const bf = gojoBlind(D, p); if (bf > .12) parts.push({ z: zc - .0003, fn: c => drawBlindfold(c, HM, opt, bf) });
  if (D.sunglasses && p.glasses !== false) parts.push({ z: zc - HM.r * 1.08, fn: c => hvgRoundGlasses(c, HM, opt, p, { frame: '#0c0b10', r: .36, lens: 'rgba(14,14,22,.94)', dark: true, w: 1.2 }) });
  const six = p.eyeGlow != null ? p.eyeGlow : p.sixGlow != null ? p.sixGlow : (D.sixDefault || (D.blindfold && gojoBlind(D, p) < .5 ? 1 : 0));
  if (six > .01 && gojoBlind(D, p) < .55 && !(D.sunglasses && p.glasses !== false && !(p.glassesDown > .5))) parts.push({ z: zc - HM.r * 1.1, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return;
    if (vDot(HM.M[2], toCam(HM.c)) < .05) return; c.save(); c.globalCompositeOperation = 'lighter'; const sc = project(HM.c); const pxR = HM.r * (sc ? sc.s : 100);
    for (const sg of [-1, 1]) { const q = project(vMad(HM.at(sg * .46, -.21), HM.M[2], HM.r * .05)); if (!q) continue; const sk = Math.min(1, six); glow(c, q.x, q.y, pxR * .2 * sk, '#5fd4ff', .16 * sk); glow(c, q.x, q.y, pxR * .06, '#e8fbff', .26 * sk); } c.restore(); } });
}
// black blindfold band around the eyes (front ~230 deg of the head; the back is under the hair)
function gojoBlind(D, p) { if (!D.blindfold || p.blindfold === false || p.blindfold === 'none') return 0; const b = p.blindfold != null && p.blindfold !== true ? p.blindfold : (D.blindDefault != null ? D.blindDefault : 1); return clamp(b, 0, 1); }
function drawBlindfold(c, HM, opt, b = 1) {
  const dn = (1 - b) * 1.15, sc = 1.04 + .05 * (1 - b);   // pulled down: the band slides over the cheeks toward the chin
  const surf = { nu: 26, nv: 3, wrapU: false, fn: (u, v) => HM.toW(vMul(headShape(lerp(-2.05, 2.05, u), Math.max(-1.45, lerp(-.4, -.02, v) - dn), HM.hs), sc + .01 * Math.sin(v * Math.PI))) };
  const G = sampleSurf(surf); drawSurf(c, G, Object.assign({ col: HVG.col.band, shade: .2, side: 'front', borders: { v0: true, v1: true, u0: false, u1: false }, rimW: .12 }, opt.surf || {}));
  if (opt.mode === 'flat' || LIGHT.override) return;
  const s = gridScale(G); strokeRuns(c, surfLine(surf, [[.3, .55], [.42, .5], [.5, .52], [.58, .5], [.7, .55]], .05), lineW(s, .4), 'rgba(90,96,130,.6)');   // fold
}
function gojoExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8;
  gojoCollar(S, D, parts, opt);
  if (D.blindfold && p.blindfold !== 'none' && p.blindfold !== false && gojoBlind(D, p) <= .12) parts.push({ z: camDepth(S.J.headBase) - .005, fn: c => { const T = torsoModel(S, D, .035 * k);   // band around the neck, over the collar
    const surf = { nu: 24, nv: 2, wrapU: true, fn: (u, v) => vAdd(T.ringAt(.965, u * TAU, .085 * k), [0, (.02 + v * .036) * k, 0]) }; drawSurf(c, sampleSurf(surf), Object.assign({ col: HVG.col.band, side: 'front', shade: .2 }, opt.surf || {})); } });
  const rg = p.rctGlow != null ? p.rctGlow : (D.rctDefault || 0);
  if (rg > .01) parts.push({ z: camDepth(S.J.abd) - .3, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const q = project(S.J.abd), h = project(S.J.head); if (!q || !h) return; c.save(); c.globalCompositeOperation = 'lighter';
    glow(c, q.x, q.y, .6 * k * q.s, '#b8ffd8', .12 * rg); glow(c, h.x, h.y, .3 * k * h.s, '#ffffff', .12 * rg); c.restore(); } });
  // orbs in the hands (Blue left / Red right), the Infinity shell, float offset handled by the rig (pos y)
  for (const [key, sd, cols] of [['orbL', 'L', ['#3a7bff', '#bfe6ff']], ['orbR', 'R', ['#ff2d3a', '#ffd0c8']]]) { const v = p[key] || 0; if (v <= .01) continue; const hg = handGeom(S, sd, p['h' + sd] || 'claw'), c0 = hg ? vMad(hg.palmC, vNorm(vMul(hg.np, -1)), .09 * k) : S.J['hand' + sd];
    parts.push({ z: camDepth(c0) - .05, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const q = project(c0); if (q && typeof hvOrb === 'function') hvOrb(c, { x: q.x, y: q.y }, .085 * k * q.s * v * (1 + .06 * Math.sin(t * 40)), cols, t, { halo: 3, haloA: .5 }); } }); }
  if (p.infinity) parts.push({ z: camDepth(S.J.abd) - 1.0, fn: c => { if (opt.mode === 'flat' || LIGHT.override || typeof fxInfinity !== 'function') return; fxInfinity(c, vAdd(S.J.abd, [0, .15 * k, 0]), t, { r: 1.25 * k, alpha: p.infinity }); } });
  woundParts(S, D, parts, opt, p.wounds != null ? p.wounds : (D.wounds || 0));
}
// wide high standing collar of the jujutsu teacher jacket (flares outward, open a little at the front, dark lining inside)
function gojoCollar(S, D, parts, opt) {
  const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.headBase) + .015, fn: c => { const T = torsoModel(S, D, .035 * k), ctr = vLerp(S.J.neck, S.J.headBase, .1);
    const surf = { nu: 26, nv: 3, wrapU: false, u0: 0, u1: 1, fn: (u, v) => { const th = lerp(.22, TAU - .22, u), b = T.ringAt(.965, th, .02 * k); const rad = vNorm(vSub(b, ctr)); return vAdd(vMad(b, rad, v * .035 * k), [0, v * .12 * k, 0]); } };
    drawSurf(c, sampleSurf(surf), Object.assign({ col: HVG.col.navy, side: 'both', backCol: HVG.col.navyLin, shade: .12, borders: { v1: true, u0: true, u1: true } }, opt.surf || {})); } });
}

// ------------------------------------------------------------------------------------------------------------- signature poses
const HVG_W = (dir, o = {}) => Object.assign({ hand: 'R', dir }, o);   // wand helper
Object.assign(POSES, {
  // HARRY (right-handed)
  har_stand: { sp: .22, ss: .06, hp: .15, hr: -.08, aR: [.3, .35, 0], eR: .5, hR: 'grip', sword: HVG_W([.1, -.8, .5]), aL: [.45, -.1, 0], eL: 1.4, hL: 'claw', lL: [.25, .12, .15], kL: .45, lR: [.05, .1, -.1], kR: .3, face: { eye: .6, lid: -.1, brow: .15, browA: -.4, mouth: 'pain', mouthOpen: .3, sweat: 1 } },
  har_ready: { sp: .1, st: -.38, hp: .02, hy: .25, aR: [1.2, .22, 0], eR: .6, hR: 'grip', sword: HVG_W([.05, .12, 1]), aL: [.7, .55, 0], eL: .9, hL: 'open', lL: [.3, .18, .25], kL: .35, lR: [-.22, .14, -.3], kR: .2, face: { eye: .9, lid: .25, brow: -.2, browA: .4, mouth: 'line' } },
  har_aim: { sp: .08, st: -.42, hp: .0, hy: .3, aR: [1.52, .02, 0], eR: .04, hR: 'grip', sword: HVG_W([0, .03, 1]), aL: [.5, .85, 0], eL: .7, hL: 'open', lL: [.35, .18, .3], kL: .4, lR: [-.25, .15, -.3], kR: .15, face: { eye: .95, lid: .3, brow: -.25, browA: .45, mouth: 'line' } },
  har_castWind: { sp: -.05, st: .45, hp: .05, hy: -.2, aR: [1.4, -.85, .2], eR: 1.9, hR: 'grip', sword: HVG_W([-.55, .6, .2]), aL: [.6, .4, 0], eL: .6, hL: 'open', lL: [.2, .15, .2], kL: .25, lR: [-.15, .12, -.25], kR: .3, face: { eye: .9, lid: .3, brow: -.2, browA: .45, mouth: 'teeth', mouthOpen: .2 } },
  har_cast: { sp: .2, st: -.5, hp: -.02, hy: .3, aR: [1.48, .22, 0], eR: .08, hR: 'grip', sword: HVG_W([.08, .05, 1]), aL: [.7, .95, 0], eL: .4, hL: 'open', lL: [.5, .18, .3], kL: .6, lR: [-.35, .14, -.3], kR: .1, face: { eye: 1.05, lid: .3, brow: -.3, browA: .55, mouth: 'shout', mouthOpen: .8 } },
  har_flick: { sp: .1, st: -.3, hp: .02, aR: [1.62, .05, 0], eR: .35, hR: 'grip', wR: [-.45, 0], sword: HVG_W([0, -.15, 1]), aL: [.3, .5, 0], eL: .5, hL: 'relax', lL: [.25, .14, .2], kL: .3, lR: [-.18, .12, -.25], kR: .1, face: { eye: .95, lid: .25, mouth: 'shout', mouthOpen: .5 } },
  har_protego: { sp: .12, st: -.1, hp: .08, aR: [1.25, -.2, 0], eR: 1.65, hR: 'grip', sword: HVG_W([.05, 1, .3]), aL: [1.35, .25, 0], eL: .35, hL: 'open', wL: [-.95, 0], lL: [.38, .2, .2], kL: .55, lR: [-.2, .18, -.2], kR: .35, face: { eye: .95, lid: .3, brow: -.25, browA: .5, mouth: 'shout', mouthOpen: .55 } },
  har_patronus: { sp: -.12, st: -.2, hp: -.22, aR: [2.05, .1, 0], eR: .08, hR: 'grip', sword: HVG_W([0, .62, .8]), aL: [.45, .75, 0], eL: .5, hL: 'open', lL: [.3, .15, .2], kL: .3, lR: [-.25, .12, -.2], kR: .1, face: { eye: 1.05, lid: .15, brow: -.1, browA: .3, mouth: 'shout', mouthOpen: .9 } },
  har_accio: { sp: .12, st: .15, hp: .02, aL: [1.5, .02, 0], eL: .08, hL: 'open', wL: [-.35, 0], aR: [.95, .95, 0], eR: 1.3, hR: 'grip', sword: HVG_W([0, .35, 1]), lL: [.35, .15, .2], kL: .45, lR: [-.25, .12, -.2], kR: .15, face: { eye: 1.0, lid: .2, brow: -.15, browA: .35, mouth: 'shout', mouthOpen: .6 } },
  har_apparate: { sp: .32, st: 1.15, hp: .2, hy: -.4, aR: [1.15, -.75, 0], eR: 1.8, hR: 'grip', sword: HVG_W([0, .8, .3]), aL: [1.05, -.8, 0], eL: 1.85, hL: 'fist', lL: [.65, .15, .4], kL: .8, lR: [.45, .12, -.3], kR: .9, face: { eye: .3, lid: .2, brow: -.3, browA: .5, mouth: 'teeth', mouthOpen: .2 } },
  har_duck: { sp: .55, st: -.2, hp: -.25, aR: [.9, .4, 0], eR: .8, hR: 'grip', sword: HVG_W([0, .2, 1]), aL: [.6, .9, 0], eL: .4, hL: 'flat', lL: [1.0, .2, .2], kL: 1.4, lR: [.1, .2, -.2], kR: 1.3, face: { eye: 1.1, brow: .1, browA: .3, mouth: 'teeth', mouthOpen: .3 } },
  har_swordUp: { sp: -.05, hp: -.1, aR: [2.65, .15, 0], eR: .45, hR: 'grip', aL: [2.6, -.15, 0], eL: .5, hL: 'grip', sword: HVG_W([0, .65, -.6], { two: true }), lL: [.3, .18, .2], kL: .3, lR: [-.2, .15, -.2], kR: .15, face: { eye: 1.0, lid: .3, brow: -.3, browA: .55, mouth: 'shout', mouthOpen: .9 } },
  har_swordSlash: { sp: .35, st: -.3, hp: .1, aR: [.95, -.2, 0], eR: .2, hR: 'grip', aL: [.95, -.35, 0], eL: .35, hL: 'grip', sword: HVG_W([0, -.55, 1], { two: true }), lL: [.6, .2, .3], kL: .8, lR: [-.4, .15, -.3], kR: .15, face: { eye: 1.05, lid: .35, brow: -.35, browA: .6, mouth: 'shout', mouthOpen: 1 } },
  har_cloak: { sp: -.05, hp: -.05, aR: [2.35, .65, 0], eR: 1.45, hR: 'grip', aL: [2.35, .65, 0], eL: 1.45, hL: 'grip', sword: { sheathed: true }, lL: [.1, .1, .1], lR: [-.05, .1, -.1], face: { eye: .8, lid: .1, mouth: 'line' } },
  har_stone: { sp: .08, hp: .32, aL: [.95, -.3, -1.2], eL: 1.45, hL: 'flat', wL: [-.25, 0], stone: 1, aR: [.15, .3, 0], eR: .3, hR: 'grip', sword: HVG_W([0, -.9, .4]), face: { eye: .7, lid: -.12, brow: .22, browA: -.35, mouth: 'line', look: [0, -.4] } },
  har_kneel: { sp: .3, hp: .05, aR: [.62, .3, 0], eR: .45, hR: 'grip', sword: HVG_W([0, -.6, .8]), aL: [.3, .3, 0], eL: .7, hL: 'flat', lL: [1.5, .15, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2, face: { eye: .6, lid: -.2, brow: .2, browA: -.5, mouth: 'pain', mouthOpen: .4, sweat: 1 } },
  har_hair: { sp: 0, hp: .1, hr: .12, aL: [2.4, .55, 0], eL: 2.45, hL: 'relax', aR: [.15, .3, 0], eR: .35, hR: 'grip', sword: HVG_W([.05, -.85, .5]), face: { eye: .7, lid: .1, brow: .2, browA: -.1, mouth: 'smirk', look: [.2, 0] } },
  har_defy: { sp: -.03, hp: -.08, aR: [.55, .55, 0], eR: .2, hR: 'grip', sword: HVG_W([.4, -.6, .5]), aL: [.12, .3, 0], eL: .4, hL: 'fist', lL: [.1, .14, .15], lR: [-.05, .14, -.15], face: { eye: 1.0, lid: .3, brow: -.3, browA: .55, mouth: 'line' } },
  // HARRY (pre/cast.md names)
  har_idle: { sp: 0, hp: .04, aR: [.18, .28, 0], eR: .35, hR: 'grip', sword: HVG_W([.05, -.85, .5]), aL: [.08, .3, .1], eL: .2, hL: 'relax', lL: [.03, .06, .08], lR: [.0, .06, -.08] },
  har_castBig: { sp: -.15, st: -.1, hp: -.25, aR: [2.1, .05, 0], eR: .2, hR: 'grip', sword: HVG_W([0, .7, .7]), aL: [1.95, -.1, 0], eL: .45, hL: 'open', wL: [-.6, 0], lL: [.32, .16, .2], kL: .35, lR: [-.28, .12, -.2], kR: .1, face: { eye: 1.05, lid: .2, brow: -.15, browA: .35, mouth: 'shout', mouthOpen: 1 } },
  har_dodgeRoll: { sp: .9, pitch: .7, hp: .3, aR: [1.2, .3, 0], eR: 1.9, hR: 'grip', sword: HVG_W([0, .5, .6]), aL: [1.2, .2, 0], eL: 1.9, hL: 'fist', lL: [1.9, .1, 0], kL: 2.3, lR: [1.7, .1, 0], kR: 2.2, face: { eye: .4, lid: .2, mouth: 'teeth', mouthOpen: .2 } },
  har_skid: { sp: .3, ss: -.05, hp: -.05, aR: [1.3, .25, 0], eR: .4, hR: 'grip', sword: HVG_W([.05, .1, 1]), aL: [.9, 1.3, 0], eL: .3, hL: 'open', lL: [.75, .2, .2], kL: 1.1, lR: [-.55, .14, -.2], kR: .15, fR: -.3, face: { eye: 1.0, lid: .3, brow: -.25, browA: .5, mouth: 'teeth', mouthOpen: .3 } },
  har_snitch: { sp: .02, hp: .1, aL: [1.1, -.35, -1.3], eL: 2.15, hL: 'flat', wL: [-.3, 0], snitch: 1, aR: [.15, .3, 0], eR: .3, hR: 'grip', sword: HVG_W([0, -.9, .4]), face: { eye: .65, lid: -.1, brow: .2, browA: -.3, mouth: 'line', look: [0, -.25] } },
  har_sit: { ground: false, sp: .35, hp: .15, aR: [.6, .1, 0], eR: 1.0, hR: 'grip', sword: HVG_W([0, -.6, .6]), aL: [.5, .1, 0], eL: 1.1, hL: 'relax', lL: [1.4, .2, .1], kL: 1.5, lR: [1.2, .15, -.1], kR: 1.2, face: { eye: .45, lid: -.15, brow: .08, browA: -.35, mouth: 'open', mouthOpen: .25, sweat: 1 } },
  // GOJO
  goj_stand: { sp: -.04, ss: -.03, hp: .02, hr: -.06, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid', lL: [.06, .1, .25], kL: .1, lR: [-.03, .08, -.2], kR: .04 },
  goj_pockets: { sp: -.08, ss: -.06, hp: -.04, hr: -.14, hy: .1, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid', lL: [.14, .12, .35], kL: .22, lR: [-.05, .08, -.2], kR: .04, face: { mouth: 'smirk', eye: .6, lid: .2 } },
  goj_lean: { sp: -.18, ss: .12, hp: -.12, hr: .18, hy: .25, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.4, -.4, .4], eR: 2.2, hR: 'relax', lL: [.28, .1, .45], kL: .4, lR: [-.08, .06, -.2], kR: .05, face: { mouth: 'grin', mouthOpen: .3, eye: .55 } },
  goj_tilt: { sp: -.05, hp: .08, hr: .38, hy: .2, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid', lL: [.06, .1, .25], kL: .1, lR: [-.03, .08, -.2], face: { mouth: 'grin', mouthOpen: .35, mouthW: 1.3 } },
  goj_wave: { sp: -.03, hp: .02, hr: .15, aR: [1.65, .55, 0], eR: 2.0, hR: 'two', wR: [.1, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.06, .1, .25], kL: .1, lR: [-.03, .08, -.2], face: { mouth: 'grin', mouthOpen: .35, mouthW: 1.35 } },
  goj_blue: { sp: .02, st: -.25, hp: .04, aR: [1.42, .18, 0], eR: .4, hR: 'point', wR: [.35, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.18, .12, .25], kL: .2, lR: [-.12, .1, -.25], kR: .05, face: { mouth: 'smirk', eye: .7, lid: .2 } },
  goj_red: { sp: .08, st: -.45, hp: .02, hy: .35, aR: [1.52, .02, 0], eR: .04, hR: 'sign', wR: [.1, 0], aL: [.6, .7, 0], eL: .7, hL: 'relax', lL: [.32, .15, .3], kL: .35, lR: [-.24, .12, -.3], kR: .1, face: { mouth: 'line', eye: .8, lid: .3 } },
  goj_purpleWind: { sp: -.02, hp: -.02, aL: [1.42, 1.15, 0], eL: .35, hL: 'point', wL: [.3, 0], aR: [1.42, 1.15, 0], eR: .35, hR: 'point', wR: [.3, 0], lL: [.18, .15, .25], kL: .15, lR: [-.12, .14, -.25], face: { mouth: 'line', eye: .8, lid: .25 } },
  goj_purple: { sp: .06, st: -.15, hp: .02, aR: [1.38, -.28, 0], eR: .75, hR: 'cross', wR: [.2, 0], aL: [1.35, -.2, 0], eL: .9, hL: 'open', wL: [-.3, 0], lL: [.25, .15, .25], kL: .25, lR: [-.18, .12, -.25], kR: .1, face: { mouth: 'line', eye: .85, lid: .3, brow: -.2, browA: .35 } },
  goj_purpleFire: { sp: .12, st: -.5, hp: 0, hy: .4, aR: [1.55, -.02, 0], eR: .02, hR: 'cross', aL: [.5, .8, 0], eL: .5, hL: 'relax', lL: [.4, .18, .3], kL: .45, lR: [-.3, .14, -.3], kR: .1, face: { mouth: 'smirk', eye: .85, lid: .3 } },
  goj_infinity: { sp: -.02, hp: .0, hr: -.06, aR: [1.45, .12, 0], eR: .12, hR: 'open', wR: [-.95, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.06, .1, .25], kL: .1, lR: [-.03, .08, -.2], face: { mouth: 'smirk', eye: .6, lid: .25 } },
  goj_heaven: { sp: -.06, hp: -.2, aR: [2.75, .25, 0], eR: .12, hR: 'point', wR: [.2, 0], aL: [.35, .35, 0], eL: .1, hL: 'point', wL: [.4, 0], lL: [.05, .1, .1], lR: [-.02, .1, -.1], face: { mouth: 'smile', eye: .85, look: [0, .2] } },
  goj_domain: { sp: .02, hp: .06, hy: .1, aR: [1.3, -.5, 0], eR: 2.05, hR: 'cross', wR: [.25, .1], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.12, .12, .25], kL: .15, lR: [-.08, .1, -.25], face: { mouth: 'smirk', eye: .8, lid: .2, shadow: .3 } },
  goj_lift: { sp: -.03, hp: -.08, hr: .1, aR: [2.1, -.3, 0], eR: 2.55, hR: 'grip', wR: [.2, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.08, .1, .25], kL: .1, lR: [-.04, .08, -.2], face: { mouth: 'grin', mouthOpen: .3, mouthW: 1.3 } },
  goj_float: { ground: false, sp: .1, hp: .05, hr: .1, aL: [.55, .95, .3], eL: .6, hL: 'relax', aR: [.55, .95, -.3], eR: .6, hR: 'relax', lL: [.9, .3, .6], kL: 1.6, lR: [.7, .3, -.6], kR: 1.7, fL: .4, fR: .4, face: { mouth: 'smirk', eye: .6 } },
  goj_punchWind: { sp: .05, st: .55, hp: .05, aR: [1.0, .9, 0], eR: 2.1, hR: 'fist', aL: [1.2, -.3, 0], eL: 1.1, hL: 'open', lL: [.35, .18, .3], kL: .45, lR: [-.2, .15, -.3], kR: .25, face: { mouth: 'grin', mouthOpen: .3, eye: .9, lid: .3 } },
  goj_punch: { sp: .22, st: -.6, hp: -.02, aR: [1.56, .0, 0], eR: .04, hR: 'fist', aL: [.7, .7, 0], eL: 1.3, hL: 'fist', lL: [.6, .18, .3], kL: .7, lR: [-.4, .15, -.3], kR: .1, face: { mouth: 'teeth', mouthOpen: .3, eye: 1.0, lid: .35 } },
  goj_peace: { sp: -.03, hp: .02, hr: .15, aR: [1.65, .55, 0], eR: 2.0, hR: 'two', wR: [.1, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.06, .1, .25], kL: .1, lR: [-.03, .08, -.2], face: { mouth: 'grin', mouthOpen: .35, mouthW: 1.35 } },
  goj_blindfoldDown: { sp: -.02, hp: .1, hr: .05, aR: [1.75, -.35, 0], eR: 2.6, hR: 'point', wR: [.5, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.08, .1, .25], kL: .1, lR: [-.04, .08, -.2], face: { mouth: 'smirk', eye: .7, lid: .2 } },
  goj_blueL: { sp: .03, st: .3, hp: .04, aL: [1.42, .18, 0], eL: .4, hL: 'claw', wL: [.25, 0], aR: [.16, .3, -.35], eR: .45, hR: 'hid', lL: [-.12, .1, .25], kL: .05, lR: [.18, .12, -.25], kR: .2, face: { mouth: 'smirk', eye: .7, lid: .2 } },
  goj_laugh: { sp: -.22, hp: -.45, aL: [.35, .5, .3], eL: 1.2, hL: 'relax', aR: [.9, -.4, 0], eR: 1.8, hR: 'open', lL: [.06, .12, .2], lR: [-.03, .1, -.2], face: { mouth: 'laugh', mouthOpen: .9, eye: .25, closed: 1, closedUp: 1 } },
  goj_sitGate: { ground: false, sp: .2, hp: .08, hr: .1, aR: [1.7, .6, 0], eR: 1.9, hR: 'open', wR: [.2, 0], aL: [.5, .2, 0], eL: 1.2, hL: 'relax', lL: [1.45, .55, .9], kL: 2.3, lR: [1.45, .55, -.9], kR: 2.3, fL: .3, fR: .3, face: { mouth: 'grin', mouthOpen: .3, mouthW: 1.3 } },
  goj_honored: { sp: -.06, hp: -.12, aR: [2.75, .25, 0], eR: .12, hR: 'point', wR: [.2, 0], aL: [.35, .35, 0], eL: .1, hL: 'point', wL: [.4, 0], lL: [.05, .1, .1], lR: [-.02, .1, -.1], face: { mouth: 'smile', eye: .55, lid: .1, look: [0, .1] } },
  goj_heal: { sp: -.18, hp: -.38, aL: [.7, 1.0, 0], eL: .3, hL: 'open', aR: [.7, 1.0, 0], eR: .3, hR: 'open', lL: [.08, .12, .1], lR: [-.04, .12, -.1], face: { mouth: 'laugh', mouthOpen: .9, eye: 1.1, pupil: .5, look: [0, .3] } },
  goj_flash: { sp: .5, st: -.15, hp: -.3, aL: [.4, 2.6, 0], eL: .3, hL: 'relax', aR: [.4, 2.6, 0], eR: .3, hR: 'relax', lL: [.9, .1, 0], kL: 1.2, lR: [-.5, .1, 0], kR: .6, ground: false, drop: .15 },
});
Object.assign(POSES, { har_wandReady: POSES.har_ready, har_cloakThrow: POSES.har_cloak });
SIGNATURE.harry = ['har_idle', 'har_wandReady', 'har_aim', 'har_castWind', 'har_cast', 'har_flick', 'har_protego', 'har_patronus', 'har_castBig', 'har_accio', 'har_apparate', 'har_dodgeRoll', 'har_skid', 'har_cloakThrow', 'har_stone', 'har_snitch', 'har_kneel', 'har_stand', 'har_sit', 'har_hair', 'har_defy'];
SIGNATURE.gojo = ['goj_stand', 'goj_pockets', 'goj_lean', 'goj_tilt', 'goj_peace', 'goj_blindfoldDown', 'goj_blueL', 'goj_blue', 'goj_red', 'goj_purpleWind', 'goj_purple', 'goj_purpleFire', 'goj_infinity', 'goj_honored', 'goj_domain', 'goj_float', 'goj_punchWind', 'goj_punch', 'goj_laugh', 'goj_sitGate', 'goj_heal'];
(window.SIGNATURE_FORM = window.SIGNATURE_FORM || {}).harry = 'base'; SIGNATURE_FORM.gojo = 'bare';

// ------------------------------------------------------------------------------------------------------------- GETO SURUGU, young (GET: only in Gojo's memory)
/* Jujutsu High student: long black hair in a half-up bun with one long bang over the forehead, narrow dark eyes, large stretched earlobes with
   black plugs, dark high-collar school jacket with gold buttons, very wide baggy trousers.  Forms: base | wounded.  Poses: geto_stand, geto_smile.  */
CAST.geto_youth = design(SHINIGAMI, {
  name: 'Geto Suguru (youth)', h: 1.85, body: { width: .95, limbs: .95, shoulders: 1.04, depth: .96, legs: 1.06, neck: 1.05 }, skin: '#f2dcc6', skinShade: '#cfa292',
  kosode: '#16171e', collar: { none: true }, obi: null, torsoDetail: (c, S, D, T, G) => { if (LIGHT.override) return; for (let i = 0; i < 4; i++) { const fr = surfFrame(T.surf, 0, .86 - i * .14); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const q = proj2(fr.p), r = Math.max(1.2, .009 * gridScale(G)); c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fillStyle = '#d8b04a'; c.fill(); } },
  sleeve: { col: '#16171e', lining: '#0c0d12', r0: .072, r1: .07, r2: .066, sag: .03, len: 1.0 },
  hakama: { col: '#16171e', r0: .12, r1: .15, r2: .17, pleats: true, ties: false },
  haori: { none: true }, feet: { col: '#141218', sandal: false, w: 1.05 },
  face: {
    eye: { w: 1.12, h: .2, irisR: .22, irisCol: '#2a2230', irisLight: '#5a4a60', irisDark: '#0e0a10', tilt: .06, thick: 1.2, flick: .06, lashes: true, crease: true, pupilR: .4 },
    eyeSize: .37, eyeY: -.19, defaultExpr: 'smile', brow: { browW: .06, browY: .06, browCol: '#141218' }, headShape: { jaw: .95, chin: 1.0, width: .93 },
    hair: { col: '#16141a', shadeCol: '#050408', gloss: true, glossCol: '#5a5a70', springK: 30, springC: 5, cap: { front: .62, side: .02, back: -.4 }, locks: () => [
      ...lockFan(13, 1.3, 4.98, .3, (th, u, i) => ({ th, ph: .3, len: 1.25 + .1 * hash(i), w: .42, rootR: .95, dir: dirOut(th, .1, 1.1, -.1), curl: [-Math.sin(th) * .5, .1, -Math.cos(th) * .6], grav: 1.0, tw: .26, tip: 1.2, seg: 8, back: true })),
      { th: -.22, ph: .92, len: 1.75, w: .3, rootR: .965, dir: [-.1, -.1, 1], curl: [-.2, -1.3, -.5], grav: 1.8, wave: [.12, 1, 2], tw: .25, tip: 1.3, seg: 10, front: true, gloss: true },
      ...lockFan(5, -.7, .7, .95, (th, u, i) => ({ th, len: .55, w: .4, rootR: .965, dir: [Math.sin(th) * .4, .5, -.6], curl: [0, -.2, -1.2], grav: .6, tw: .28, tip: 1.1, seg: 6 })),
    ] },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {   // bun at the back + ear plugs
      parts.push({ z: camDepth(HM.toW([0, .45, -1.15])) + .001, fn: c => drawSurf(c, sampleSurf(sEllipsoid(HM.toW([0, .45, -1.12]), HM.M, [HM.r * .42, HM.r * .36, HM.r * .36], 1, 14, 10)), Object.assign({ col: '#16141a', shade: .1 }, opt.surf || {})) });
      for (const sg of [-1, 1]) parts.push({ z: zc - .001, fn: c => { if (opt.mode === 'flat') return; const p = HM.toW([sg * 1.0, -.55, -.05]); if (vDot(vNorm(vSub(p, HM.c)), toCam(p)) < -.1) return; const q = project(p); if (!q) return; const r = HM.r * .14 * q.s; c.fillStyle = '#121016'; c.beginPath(); c.ellipse(q.x, q.y, r, r * 1.2, 0, 0, TAU); c.fill(); c.strokeStyle = '#d8d0c0'; c.lineWidth = Math.max(1, r * .2); c.stroke(); } });
    },
  },
  sheetExprs: ['smile', 'calm', 'smirk', 'laugh', 'sorrow', 'cold', 'surprised', 'angry', 'pain', 'eyesClosed', 'gentle', 'tired', 'serious', 'shout'],
  extras: (S, D, F, t, parts, opt) => { gojoCollar(S, Object.assign({}, D), parts, opt); woundParts(S, D, parts, opt, S.pose.wounds || D.wounds || 0); },
  forms: { base: {}, wounded: { wounds: 2 } },
});
CAST.geto_youth.drawHead = stdHead(CAST.geto_youth);
Object.assign(POSES, {
  geto_stand: { sp: -.03, hp: .02, aL: [.2, .35, .3], eL: .6, hL: 'hid', aR: [.2, .35, -.3], eR: .6, hR: 'hid', lL: [.06, .12, .2], lR: [-.03, .1, -.2], face: { mouth: 'smile', eye: .5 } },
  geto_smile: { sp: .02, hp: .1, hr: .12, aR: [1.0, -.4, 0], eR: 1.6, hR: 'relax', aL: [.2, .35, .3], eL: .6, hL: 'hid', face: { mouth: 'smile', eye: .2, closed: 1, closedUp: 1 } },
});
SIGNATURE.geto_youth = ['geto_stand', 'geto_smile'];

// ------------------------------------------------------------------------------------------------------------- camera helpers (harry-vs-gojo)
/* camTruck(cam, dx, dy): move camera + target sideways (camera right / up, metres) -> the subject slides the other way on screen (place a
   portrait on the free side of a card).  camDutch(cam, roll) adds roll.  camOrbitShot(c, t, o): {r, az0, az1, el0, el1, dur, fov, ease} orbit sweep.   */
function camTruck(cam, dx, dy = 0) { const F = vNorm(vSub(cam.target, cam.pos)), Rt = vNorm(vCross(F, [0, 1, 0])), Up = vCross(Rt, F), d = vAdd(vMul(Rt, dx), vMul(Up, dy)); return Object.assign({}, cam, { pos: vAdd(cam.pos, d), target: vAdd(cam.target, d) }); }
function camDutch(cam, roll) { return Object.assign({}, cam, { roll: (cam.roll || 0) + roll }); }
function camOrbitShot(c, t, o = {}) { const u = (o.ease === 'lin' ? x => x : easeInOut)(clamp(t / (o.dur || 2), 0, 1)); return { pos: orbitPos({ c, r: lerp(o.r || 5, o.r1 || o.r || 5, u), az: lerp(o.az0 || 0, o.az1 == null ? (o.az0 || 0) + .6 : o.az1, u), el: lerp(o.el0 || .05, o.el1 == null ? (o.el0 || .05) : o.el1, u) }), target: c, fov: o.fov || 34, roll: o.roll || 0 }; }
