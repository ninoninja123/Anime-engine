/* engine/chars_gow.js (agent E, project gowther-dazai-urahara) - GOWTHER (The Seven Deadly Sins / Nanatsu no Taizai), Goat's Sin of Lust.
   Sources (checked 2026-11-01): nanatsu-no-taizai.fandom.com MediaWiki API (pages Gowther: Appearance / Abilities, Invasion, Herritt).
   APPEARANCE: a doll made in the likeness of Glariza -> very feminine face, 175 cm, slim.  Hot-pink hair reaching just past the jaw,
     YELLOW eyes, glasses with LIGHT frames (cannot see without them).  Usual attire: white shirt with GREY long sleeves over a BLACK
     CROPPED tank top (midriff bare), dark pants, short grey boots.  Goat symbol on the RIGHT side of the chest.  As the demon's proxy
     (Ten Commandments) his eyes were BLACK.  Doll body: survives a broken neck / decapitation (re-attaches), torn limbs keep moving.
   POWERS (fx_gow.js): Invasion 侵入 (read / rewrite memories, trap in a memory illusion, control nerves).  Twin Bow Herritt 双弓ハーリット:
     a pair of luminous PURPLE energy bows that appear at will, fired without drawing (both at once); 'Jido Tsuibi' = hands crossed ->
     the bows form a cross (lock-on).  Techniques: Searchlight (finger arrow), Broadcast (hand at the temple + zig-zag beam), Rewrite
     Light (volley of arrows), Lost World, Nightmare Teller, Blackout (dome; Blackout Arrow from pressed hands), Jack / Hijack / Gatling
     Jack (puppet binding; Hijack bends Herritt into rings), Breaker Off, Kill Switch, Kaleidoscope (illusion copies), Playback.
   FORMS: base | herritt (bows out) | doll (shirt + sleeves gone: porcelain ball-jointed arms, joint seams, cracks) | mind (inner self:
     pale lavender monochrome, glowing magenta ring eyes, floating hair) | proxy (black demon eyes) | noglasses | wounded (cracks, cracked lens).
   POSE FIELDS (interpolate): bows 0..1 (Herritt grows in / fades), bowRings 0..1 (Hijack: bows bend into rings), glasses:false,
     glint 0..1 (white lens flash), crack 0..1 (porcelain cracks on face/arms), headOff 0..1 (eerie neck break: head roll is in hr),
     wounds 0..3, mindGlow 0..1.                                                                                                       */
'use strict';
var GOW = window.GOW || {};
GOW.col = { hair: '#f2559c', hairShade: '#b52f6c', hairGloss: '#ffc4df', eye: '#f2c437', eyeLight: '#fff3a6', eyeDark: '#9a6410', shirt: '#f4f2f6', shirtLin: '#d6d2de',
  sleeve: '#8f8d9a', top: '#19171e', pants: '#2b2938', boot: '#8a8894', frame: '#e8e0ee', bow: '#c86bff', bow2: '#ff7ad8', core: '#fff4ff', mem: '#ffd6f0', skin: '#f9e4d6', skinShade: '#ddaa9e' };
// Gowther's expressions (also usable by everyone): the blank doll stare is his default; the rare emotions get their own presets
Object.assign(EXPR, {
  blank: { eye: 1.0, lid: 0, brow: .02, browA: 0, pupil: .82, mouth: 'line', mouthW: .55, glint: 1 },
  curious: { eye: 1.1, lid: -.05, brow: .3, browA: -.15, pupil: .9, mouth: 'o', mouthOpen: .12, mouthW: .45 },
  gentle: { eye: .62, lid: -.08, brow: .18, browA: -.25, pupil: 1, mouth: 'smile', mouthW: .7 },
  cold: { eye: .62, lid: .22, brow: -.1, browA: .15, pupil: .6, mouth: 'line', mouthW: .5, shadow: .35 },
  sorrow: { eye: .74, lid: -.38, brow: .42, browA: -.62, pupil: 1.05, mouth: 'frown', mouthW: .6, tears: 1, glint: 1 },
  emptyTears: { eye: 1.0, lid: 0, brow: .02, browA: 0, pupil: .8, mouth: 'line', mouthW: .5, tears: 1 },
  thinking: { eye: .7, lid: .12, brow: .12, browA: .1, pupil: .9, mouth: 'smirk', mouthW: .8, look: [-.35, .25] },
  sly: { eye: .55, lid: .25, brow: .1, browA: .2, pupil: .85, mouth: 'smirk', mouthW: 1.05, look: [.3, 0] },
});

// ------------------------------------------------------------------------------------------------------------- hair (hot-pink bob)
const GOW_HAIR = (o = {}) => () => {
  const L = o.len || 1.0, fl = o.float || 0;   // fl: mind form - locks drift upward / outward
  return [
    // back curtain: many narrow locks (soft, not angular), ends curl slightly inward like a bob, reaching just past the jaw
    ...lockFan(19, 1.0, 5.28, .32, (th, u, i) => ({ th, ph: .32 + .05 * Math.sin(i * 2.1), len: (1.74 + .07 * Math.cos(th) + .06 * hash(i * 5)) * L, w: .36, rootR: .95,
      dir: dirOut(th, .05, 1.55 - fl * 1.2, -.04), curl: [-Math.sin(th) * (1.2 - fl), .15 + fl * .6, -Math.cos(th) * 1.05], grav: .8 - fl * .7, wave: [.05 + fl * .1, .8, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)],
      tw: .22, tip: .55, seg: 9, back: Math.cos(th) < .2, gloss: i % 4 === 1 })),
    // side locks framing the cheeks, slightly longer than the rest (down to the chin line)
    ...lockFan(4, 1.18, 1.52, .26, (th, u, i) => ({ th, len: (1.6 + .07 * i) * L, w: .26, rootR: .97, dir: [.32, -.9, .06], curl: [-.42 - fl * .4, fl * .4, -.05], grav: 1.15 - fl, wave: [.05, .9, i], tw: .24, tip: .45, seg: 9, front: true, gloss: i === 1 })),
    ...lockFan(4, -1.52, -1.18, .26, (th, u, i) => ({ th, len: (1.68 - .05 * i) * L, w: .26, rootR: .97, dir: [-.32, -.9, .06], curl: [.42 + fl * .4, fl * .4, -.05], grav: 1.15 - fl, wave: [.05, .9, i + 2], tw: .24, tip: .45, seg: 9, front: true, gloss: i === 2 })),
    // bangs: soft, slightly uneven fringe over the brows, parted a little off-centre (his right), one longer lock between the eyes
    ...lockFan(9, -.82, .78, .9, (th, u, i) => ({ th, len: (.78 + .07 * Math.sin(u * 5.2 + .4) + .04 * hash(i * 7)) * (1 - .25 * Math.pow(Math.abs(u - .5) * 2, 3)), w: .29, rootR: .965, dir: [Math.sin(th) * .35 - .06, -.3, 1], grav: 2.0 - fl, curl: [.12 * (u - .4), -1.25, -.62], tw: .26, tip: .6, seg: 8, front: true, gloss: i % 3 === 1 })),
    { th: .12, ph: .93, len: 1.02, w: .22, rootR: .965, dir: [-.05, -.25, 1], curl: [-.15, -1.35, -.6], grav: 1.9, tw: .26, tip: .6, seg: 9, front: true },
  ];
};

// ------------------------------------------------------------------------------------------------------------- design
CAST.gowther = design(SHINIGAMI, {
  name: 'Gowther', h: 1.75, body: { width: .86, limbs: .9, shoulders: .9, depth: .93, legs: 1.07, neck: 1.1 }, skin: GOW.col.skin, skinShade: GOW.col.skinShade,
  kosode: GOW.col.top, collar: { none: true },
  // bare midriff band between the cropped tank top and the trousers + the shirt's white front edge is the haori
  torsoTones: [{ col: GOW.col.skin, mask: (u, v) => Math.min(v - .17, .46 - v) }],
  torsoDetail: (c, S, D, T, G) => gowTorsoDetail(c, S, D, T, G),
  sleeve: { col: GOW.col.sleeve, lining: '#6c6a78', r0: .064, r1: .06, r2: .056, sag: .02, len: 1.0 },
  hakama: { col: GOW.col.pants, r0: .084, r1: .07, r2: .06, pleats: false, ties: false },
  haori: { col: GOW.col.shirt, lining: GOW.col.shirtLin, len: .08, sleeves: true, hem: 'none', kanji: null, open: .52, flare: .1, collarLen: .55 },
  feet: { col: GOW.col.boot, sandal: false, w: .92, shaft: .3, shaftCol: GOW.col.boot, shaftR: 1.18 },
  face: {
    eye: { w: 1.14, h: .36, irisR: .31, irisCol: GOW.col.eye, irisLight: GOW.col.eyeLight, irisDark: GOW.col.eyeDark, tilt: 0, thick: 1.12, flick: .05, lashes: true, crease: true, pupilR: .3, lowerH: .19, lidShade: '#a0607a' },
    eyeSize: .39, eyeY: -.2, defaultExpr: 'blank', brow: { browW: .052, browY: .12, browCol: '#c23a78' }, headShape: { jaw: .97, chin: .94, width: .93 }, noseK: .82,
    mouth: { mouthW: .85 }, mouthSize: .24, mouthY: -.76,
    hair: { col: GOW.col.hair, shadeCol: GOW.col.hairShade, gloss: true, glossCol: GOW.col.hairGloss, springK: 30, springC: 5, cap: { front: .62, side: .02, back: -.95 }, locks: GOW_HAIR() },
    markings: (c, HM, e, lod, D) => gowMarkings(c, HM, e, lod, D),
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (!D.noGlasses && S.pose.glasses !== false) parts.push({ z: zc - HM.r * 1.08, fn: c => drawGowGlasses(c, HM, opt, D, S.pose) }); },
  },
  sheetExprs: ['blank', 'calm', 'curious', 'gentle', 'smile', 'surprised', 'shock', 'cold', 'menace', 'pain', 'sorrow', 'emptyTears', 'laugh', 'eyesClosed'],
  extras: (S, D, F, t, parts, opt) => gowExtras(S, D, F, t, parts, opt),
  forms: {
    base: {}, herritt: { bowsDefault: 1 }, noglasses: { noGlasses: true },
    doll: { doll: true, haori: { none: true }, sleeve: { none: true, bare: true }, skin: '#f8ebe4', skinShade: '#d6c2c4', crackDefault: .35 },
    mind: { mind: true, bowsDefault: 0, skin: '#f4eefa', skinShade: '#c9bcdc', kosode: '#e8e0f2', hakama: { col: '#d8cfe8', r0: .092, r1: .08, r2: .07, pleats: false, ties: false },
      sleeve: { col: '#cfc6e0', lining: '#b0a6c8', r0: .064, r1: .06, r2: .056, sag: .02, len: 1.0 }, haori: { col: '#fbf8ff', lining: '#e2d8f2', len: .5, sleeves: true, hem: 'none', open: .45, flare: .6, collarLen: .55, slits: 5 },
      feet: { col: '#d8cfe8', sandal: false, w: .92, shaft: .3, shaftCol: '#d8cfe8', shaftR: 1.18 }, torsoTones: [], noGlasses: true },
    proxy: { proxy: true },
    wounded: { wounds: 2, crackDefault: .7, lensCrack: 1 },
  },
});
(function () { // form-specific face overrides (shallow form merge -> full objects)
  const G = CAST.gowther, f0 = G.face;
  G.forms.mind.face = Object.assign({}, f0, { defaultExpr: 'blank', hair: Object.assign({}, f0.hair, { col: '#ff8cc4', shadeCol: '#d0559a', glossCol: '#ffe2f0', locks: GOW_HAIR({ float: .28, len: 1.05 }) }),
    eye: Object.assign({}, f0.eye, { irisCol: '#ff5ad0', irisLight: '#ffd0f4', irisDark: '#8a1a7a', noPupil: true, irisRing: '#fff0ff', white: '#fdf6ff' }) });
  G.forms.proxy.face = Object.assign({}, f0, { eye: Object.assign({}, f0.eye, { white: '#0e0b12', irisCol: '#241a2c', irisLight: '#3a2a46', irisDark: '#08060a', noPupil: true, lidShade: '#000000' }) });
})();
CAST.gowther.drawHead = stdHead(CAST.gowther);

// ------------------------------------------------------------------------------------------------------------- details
function gowTorsoDetail(c, S, D, T, G) {
  if (LIGHT.override || D.mind) return; const s = gridScale(G);
  // goat symbol (right side of the chest): pale magenta glyph - horns curling back, narrow face, beard
  const fr = surfFrame(T.surf, .915, .8); if (vDot(fr.n, toCam(fr.p)) < .08) return; const k = S.B.h / 1.8;
  const tu = vMul(vNorm(fr.du), -.045 * k), tv = vMul(vNorm(fr.dv), .045 * k);
  decal(c, vMad(fr.p, fr.n, .004 * k), tu, tv, cc => { cc.strokeStyle = D.doll ? '#8a3a6a' : '#e89ac4'; cc.lineWidth = .16; cc.lineCap = 'round';
    cc.beginPath(); cc.moveTo(-.25, .35); cc.bezierCurveTo(-.9, .9, -1.1, .1, -.55, -.15); cc.moveTo(.25, .35); cc.bezierCurveTo(.9, .9, 1.1, .1, .55, -.15); cc.stroke();
    cc.beginPath(); cc.moveTo(-.3, .3); cc.lineTo(0, -.75); cc.lineTo(.3, .3); cc.closePath(); cc.stroke(); cc.beginPath(); cc.moveTo(0, -.75); cc.lineTo(0, -1.05); cc.stroke(); }, .05, fr.n);
  if (s > 5) { const nv = surfFrame(T.surf, 0, .3); if (vDot(nv.n, toCam(nv.p)) > .2) { const q = proj2(nv.p); c.strokeStyle = rgba(D.skinShade, .9); c.lineWidth = lineW(s, .45); c.beginPath(); c.moveTo(q[0], q[1] - 2); c.lineTo(q[0], q[1] + Math.max(2, .006 * s)); c.stroke(); } }   // navel
}
function gowMarkings(c, HM, e, lod, D) {
  const ck = (D._crack != null ? D._crack : 0); if (ck > 0 && lod >= 0) { // porcelain cracks spreading from the left cheek / temple
    const fr = faceFrame(HM, .55, -.15, .4, .9); decal(c, fr.p, fr.tu, fr.tv, cc => { const r = rng(21); cc.strokeStyle = '#3a2232'; cc.lineCap = 'round';
      for (let b = 0; b < 1 + Math.floor(ck * 4); b++) { let x = .15 + r() * .2, y = .3 - r() * .5; cc.lineWidth = .045; cc.beginPath(); cc.moveTo(x, y); for (let k = 0; k < 3 + ck * 4; k++) { x += (r() - .35) * .25; y += (r() - .5) * .3; cc.lineTo(x, y); if (r() < .3) { cc.moveTo(x, y); cc.lineTo(x + (r() - .5) * .2, y + (r() - .5) * .2); cc.moveTo(x, y); } } cc.stroke(); } }, .05, fr.n); }
  if (D.mind && lod > 0) { const fr = faceFrame(HM, 0, .45, .6, .25); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = rgba('#ff5ad0', .75); cc.beginPath(); cc.moveTo(0, .9); cc.lineTo(.35, 0); cc.lineTo(0, -.9); cc.lineTo(-.35, 0); cc.closePath(); cc.fill(); }, .05, fr.n); }   // small diamond on the brow (inner self)
}
// glasses: light (pale lilac-silver) rounded-rectangle frames, thin dark outline so they read at 720p, lens glare
function drawGowGlasses(c, HM, opt, D, P) {
  if (opt.mode === 'flat') return; const s = pxScale(HM.c), lw = Math.max(1.3, lineW(s, .95) * 1.15), ink = LIGHT.override ? LIGHT.ink : '#2a2230';
  const frameCol = LIGHT.override ? (LIGHT.override.fill || '#fff') : GOW.col.frame, inner = [], glint = P.glint || 0;
  const fwd = HM.M[2], fwdFacing = vDot(fwd, toCam(HM.c));
  for (const sg of [-1, 1]) { // both lenses lie in ONE flat plane in front of the face (real glasses), far lens hidden when the head turns away
    const ep = HM.at(sg * .46, -.2), tu = vMul(HM.M[0], HM.r * .44 * sg), tvv = vMul(HM.M[1], HM.r * .44), p0 = vMad(vAdd(ep, vMul(HM.M[0], -sg * HM.r * .02)), fwd, HM.r * .1), fr = { tv: tvv };
    const sideFacing = vDot(vMul(HM.M[0], sg), toCam(HM.c)); if (fwdFacing < .1 || (fwdFacing < .55 && sideFacing < -.25)) continue;
    const ring = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, cx = Math.cos(a), cy = Math.sin(a); const x = Math.sign(cx) * Math.pow(Math.abs(cx), .6) * .64 + .04, y = Math.sign(cy) * Math.pow(Math.abs(cy), .8) * (cy > 0 ? .5 : .42); ring.push(vAdd(p0, vAdd(vMul(tu, x), vMul(fr.tv, y)))); }
    const sp = ring.map(p => proj2(p));
    if (!LIGHT.override) { polyPath(c, sp); c.fillStyle = `rgba(230,240,255,${.1 + .5 * glint})`; c.fill(); c.save(); polyPath(c, sp); c.clip(); c.strokeStyle = `rgba(255,255,255,${.55 + .4 * glint})`; c.lineWidth = lw * (1.5 + glint * 3);
      const a = sp[13], b = sp[3]; c.beginPath(); c.moveTo(lerp(a[0], b[0], .15), lerp(a[1], b[1], .15)); c.lineTo(lerp(a[0], b[0], .55), lerp(a[1], b[1], .55)); c.stroke();
      if (D.lensCrack && sg > 0) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = lw * .5; const m = proj2(vAdd(p0, vMul(tu, .25))); for (let i = 0; i < 6; i++) { const an = i * 1.1 + .3; c.beginPath(); c.moveTo(m[0], m[1]); c.lineTo(m[0] + Math.cos(an) * lw * 9, m[1] + Math.sin(an) * lw * 9); c.stroke(); } }
      c.restore(); }
    polyPath(c, sp); c.lineJoin = 'round'; c.lineWidth = lw * 1.9; c.strokeStyle = ink; c.stroke(); c.lineWidth = lw * .95; c.strokeStyle = frameCol; c.stroke();
    inner.push(ring[11]);
    const ear = HM.at(sg * 1.45, -.12); if (vDot(vNorm(vSub(ear, HM.c)), toCam(ear)) > -.35) { const a = proj2(ring[0]), b = proj2(ear); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = lw * 1.7; c.strokeStyle = ink; c.stroke(); c.lineWidth = lw * .8; c.strokeStyle = frameCol; c.stroke(); } }
  if (inner.length === 2) { const a = proj2(inner[0]), b = proj2(inner[1]); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - lw * 2, b[0], b[1]); c.lineWidth = lw * 1.7; c.strokeStyle = ink; c.stroke(); c.lineWidth = lw * .8; c.strokeStyle = frameCol; c.stroke(); }
}
function gowExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8;
  D._crack = p.crack != null ? p.crack : (D.crackDefault || 0);
  if (!(D.haori && D.haori.none) && !D.mind) gowCollar(S, D, parts, opt);
  if (D.doll) gowDollJoints(S, D, parts, opt);
  const bw = p.bows != null ? p.bows : (D.bowsDefault || 0); if (bw > .01) for (const sd of ['L', 'R']) parts.push({ z: camDepth(S.J['hand' + sd]) - .06, fn: c => { if (opt.mode === 'flat') return; drawHerrittBow(c, S, sd, bw, t, { rings: p.bowRings || 0 }); } });
  if (D.mind || p.mindGlow) parts.push({ z: camDepth(S.J.abd) + .4, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const q = project(S.J.abd); if (!q) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, .9 * k * q.s, '#ff8ce0', .16 * (p.mindGlow || 1)); c.restore(); } });
  if (p.book) { const sd = p.bookHand || 'L', hg = handGeom(S, sd, p['h' + sd] || 'flat'); if (hg) parts.push({ z: camDepth(hg.palmC) - .03, fn: c => drawGowBook(c, S, hg, p.book, opt, p) }); }
  woundParts(S, D, parts, opt, D.wounds || p.wounds || 0);
}
// a book resting open on the palm (pose.book 0..1 = closed..open, bookTitle, bookCover css colour, bookGlow 0..1 = memory light from the pages)
function drawGowBook(c, S, hg, open, opt, p) {
  const k = S.B.h / 1.8, n = vNorm(vMul(hg.np, -1)), up = vNorm(vMul(hg.Y, -1)), side = vNorm(vCross(n, up)), ctr = vMad(vMad(hg.palmC, n, .025 * k), up, .02 * k), w = .1 * k, h = .14 * k, flat = opt.mode === 'flat';
  const ang = lerp(.05, 1.35, clamp(open, 0, 1)), cover = p.bookCover || '#3a2a5a', s = pxScale(ctr), lw = Math.max(1, lineW(s, .7));
  for (const sg of [-1, 1]) { const dir = vNorm(vAdd(vMul(side, sg * Math.sin(ang)), vMul(n, Math.cos(ang)))); const q = [ctr, vMad(ctr, dir, w), vMad(vMad(ctr, dir, w), up, h), vMad(ctr, up, h)].map(x => vMad(x, up, -h / 2));
    const pages = q.map(x => vMad(x, n, .006 * k)); fill3D(c, q, flat ? opt.col : tones(cover).base, flat ? 0 : lw); if (!flat && open > .3) { fill3D(c, pages, LIGHT.override ? LIGHT.override.fill : '#f6f0e2', lw * .6); if (!LIGHT.override) for (let i = 1; i < 6; i++) { const a = proj2(vLerp(pages[0], pages[3], i / 6.5)), b = proj2(vLerp(pages[1], pages[2], i / 6.5)); c.strokeStyle = 'rgba(80,70,90,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(lerp(a[0], b[0], .1), lerp(a[1], b[1], .1)); c.lineTo(lerp(a[0], b[0], .85), lerp(a[1], b[1], .85)); c.stroke(); } } }
  if (!flat && p.bookGlow) { const q = project(vMad(ctr, n, .05 * k)); if (q) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, .25 * k * q.s, '#ff9ce0', .6 * p.bookGlow); c.restore(); } }
}
// the shirt's tall white collar standing up behind the neck (popped, flaring outward), open at the front
function gowCollar(S, D, parts, opt) {
  const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.headBase) + .02, fn: c => { const T = torsoModel(S, D, .03 * k), ctr = vLerp(S.J.neck, S.J.headBase, .1);
    const surf = { nu: 24, nv: 3, wrapU: false, u0: 0, u1: 1, fn: (u, v) => { const th = lerp(.62, TAU - .62, u), b = T.ringAt(.97, th, .014 * k); const rad = vNorm(vSub(b, ctr)); const back = Math.max(0, -Math.cos(th)); return vAdd(vMad(b, rad, v * (.02 + .028 * back) * k), [0, v * (.06 + .05 * back) * k, 0]); } };
    drawSurf(c, sampleSurf(surf), Object.assign({ col: GOW.col.shirt, side: 'both', backCol: GOW.col.shirtLin, shade: .1, borders: { v1: true, u0: true, u1: true } }, opt.surf || {})); } });
}
// doll form: ball-joint seams at shoulders / elbows / wrists / knees / neck + porcelain cracks on the forearms
function gowDollJoints(S, D, parts, opt) {
  if (opt.mode === 'flat') return; const J = S.J, R = S.B.limbR;
  for (const sd of ['L', 'R']) {
    parts.push({ z: camDepth(J['el' + sd]) - .012, fn: c => { if (LIGHT.override) return; const col = rgba('#6a4a5a', .9);
      limbRing(c, J['sh' + sd], J['el' + sd], .14, R.ua * 1.13, col, .75); limbRing(c, J['sh' + sd], J['el' + sd], .97, R.ua * 1.02, col, .75); limbRing(c, J['el' + sd], J['wr' + sd], .05, R.fa * 1.04, col, .75); limbRing(c, J['el' + sd], J['wr' + sd], .97, R.fa * .95, col, .7);
      const q = project(J['el' + sd]); if (q) { const r = R.fa * 1.05 * q.s; c.beginPath(); c.arc(q.x, q.y, r * .55, 0, TAU); c.strokeStyle = rgba('#6a4a5a', .7); c.lineWidth = Math.max(1, r * .12); c.stroke(); }
      const ck = D._crack || 0; if (ck > .05) { const a = proj2(vLerp(J['el' + sd], J['wr' + sd], .35)), b = proj2(vLerp(J['el' + sd], J['wr' + sd], .7)); const r = rng(sd === 'L' ? 3 : 7); const pts = [a]; for (let i = 1; i < 5; i++) pts.push([lerp(a[0], b[0], i / 5) + (r() - .5) * 8, lerp(a[1], b[1], i / 5) + (r() - .5) * 8]); inkPts(c, pts, Math.max(1, lineW(pxScale(J['el' + sd]), .5)), '#3a2232', [.3, .3]); } } });
    parts.push({ z: camDepth(J['kn' + sd]) - .03, fn: c => { if (LIGHT.override) return; const q = project(J['kn' + sd]); if (!q) return; const r = R.sh * 1.25 * q.s; c.beginPath(); c.arc(q.x, q.y, r, Math.PI * .1, Math.PI * .9); c.strokeStyle = rgba('#e8e0f0', .55); c.lineWidth = Math.max(1, r * .14); c.stroke(); } });
  }
  parts.push({ z: camDepth(J.neck) - .02, fn: c => { if (LIGHT.override) return; limbRing(c, J.neck, J.headBase, .55, R.neck * 1.02, rgba('#6a4a5a', .9), .7); } });
}
/* Twin Bow Herritt: a luminous purple energy bow floating in front of each hand, its plane facing the aim direction (forearm); string
   straight.  k 0..1 grows the bow from the hand; rings 0..1 bends it into a full ring (Hijack).  Drawn additive + white core + ink. */
function drawHerrittBow(c, S, sd, k, t, o = {}) {
  const J = S.J, kk = S.B.h / 1.8, aim = vNorm(vSub(J['hand' + sd], J['el' + sd])), c0 = vMad(J['hand' + sd], aim, .1 * kk);
  let up = vNorm(vSub([0, 1, 0], vMul(aim, aim[1]))); if (!isFinite(up[0]) || vLen(up) < .1) up = [0, 0, 1];
  const L = .55 * kk * easeOut(clamp(k, 0, 1)), rr = o.rings || 0, n = 22, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n - .5, a = u * lerp(2.1, TAU * .98, rr), R = L / lerp(2.1, Math.PI, rr) * 1.3; pts.push(vAdd(vMad(c0, up, Math.sin(a) * R), vMul(aim, (Math.cos(a) - 1) * R * .55 + .02 * kk))); }
  const sp = pts.map(p => project(p)).filter(Boolean); if (sp.length < 3) return; const s = pxScale(c0), w = Math.max(2, .035 * kk * s) * (.6 + .4 * k);
  const path = () => { c.beginPath(); c.moveTo(sp[0].x, sp[0].y); for (const q of sp) c.lineTo(q.x, q.y); };
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.globalCompositeOperation = 'lighter'; path(); c.strokeStyle = rgba(GOW.col.bow, .2 * k); c.lineWidth = w * 4; c.stroke(); path(); c.strokeStyle = rgba(GOW.col.bow2, .55 * k); c.lineWidth = w * 2; c.stroke();
  c.globalCompositeOperation = 'source-over'; path(); c.strokeStyle = rgba('#3a0a48', .85 * k); c.lineWidth = w * 1.25; c.stroke(); path(); c.strokeStyle = rgba(GOW.col.core, k); c.lineWidth = w * .7; c.stroke();
  // grip ornament (small diamond) in the middle + string
  const m = sp[Math.floor(sp.length / 2)]; c.fillStyle = rgba(GOW.col.core, k); c.beginPath(); c.moveTo(m.x, m.y - w * 1.6); c.lineTo(m.x + w, m.y); c.lineTo(m.x, m.y + w * 1.6); c.lineTo(m.x - w, m.y); c.closePath(); c.fill(); c.strokeStyle = rgba('#3a0a48', .8 * k); c.lineWidth = Math.max(1, w * .25); c.stroke();
  if (rr < .6) { const a = sp[0], b = sp[sp.length - 1]; c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(GOW.col.bow2, .7 * k * (1 - rr)); c.lineWidth = Math.max(1, w * .3); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  c.restore();
}

// ------------------------------------------------------------------------------------------------------------- signature poses
Object.assign(POSES, {
  gow_stand: { sp: -.02, hp: .02, aL: [.07, .32, .1], eL: .14, hL: 'relax', aR: [.07, .32, -.1], eR: .14, hR: 'relax', lL: [.02, .05, .05], lR: [.02, .05, -.05] },
  gow_tilt: { sp: -.01, hp: .05, hr: .42, hy: .12, aL: [.07, .32, .1], eL: .14, hL: 'relax', aR: [.07, .32, -.1], eR: .14, hR: 'relax', lL: [.03, .05, .05], lR: [.0, .07, -.05], face: { eye: 1.05, mouth: 'line', mouthW: .5, look: [.15, .05] } },
  gow_glasses: { sp: 0, hp: .12, aR: [1.3, -.45, .2], eR: 2.62, hR: 'point', wR: [.35, .1], aL: [.25, -.2, 0], eL: 1.55, hL: 'relax', glint: .6, face: { eye: .7, lid: .1, mouth: 'line', mouthW: .5 } },
  gow_point: { sp: .03, st: -.25, hp: .02, aR: [1.55, .08, 0], eR: .02, hR: 'point', aL: [.08, .3, .1], eL: .15, hL: 'relax', lL: [.12, .1, .2], kL: .1, lR: [-.08, .08, -.15], face: { eye: 1.0, mouth: 'line', mouthW: .5 } },
  gow_temple: { sp: .02, st: -.2, hp: .1, hy: -.1, aL: [1.85, .55, .3], eL: 2.6, hL: 'point', wL: [.3, 0], aR: [1.5, .1, 0], eR: .05, hR: 'point', lL: [.1, .1, .2], lR: [-.06, .08, -.15], face: { eye: .55, lid: .1, mouth: 'line', mouthW: .5 } },
  gow_bowAim: { sp: .04, hp: .02, aL: [1.42, .2, 0], eL: .12, hL: 'open', wL: [-.4, 0], aR: [1.42, .2, 0], eR: .12, hR: 'open', wR: [-.4, 0], lL: [.25, .15, .2], kL: .25, lR: [-.2, .12, -.2], kR: .1, bows: 1, face: { eye: 1.0, mouth: 'line', mouthW: .5 } },
  gow_cross: { sp: .06, hp: .06, aL: [1.32, -.38, 0], eL: .55, hL: 'open', wL: [-.3, .2], aR: [1.4, -.3, 0], eR: .45, hR: 'open', wR: [-.3, -.2], lL: [.2, .14, .2], kL: .2, lR: [-.15, .12, -.2], bows: 1, face: { eye: .9, lid: .15, mouth: 'line', mouthW: .5 } },
  gow_rewrite: { sp: -.1, hp: -.18, aL: [1.6, 1.25, 0], eL: .15, hL: 'open', aR: [1.6, 1.25, 0], eR: .15, hR: 'open', lL: [.18, .2, .2], kL: .1, lR: [-.1, .2, -.2], bows: 1, face: { eye: .95, mouth: 'line', mouthW: .5, look: [0, .3] } },
  gow_blackout: { sp: .05, hp: .08, aL: [1.4, -.22, 0], eL: .55, hL: 'flat', wL: [-.9, 0], aR: [1.4, -.22, 0], eR: .55, hR: 'flat', wR: [-.9, 0], lL: [.2, .15, .2], kL: .2, lR: [-.12, .12, -.2], face: { eye: .5, lid: .2, mouth: 'line', mouthW: .5 } },
  gow_jack: { sp: .06, hp: .12, aL: [1.25, .45, 0], eL: .55, hL: 'spread', wL: [.7, 0], aR: [1.25, .45, 0], eR: .55, hR: 'spread', wR: [.7, 0], lL: [.15, .15, .2], lR: [-.08, .12, -.2], face: { eye: .7, lid: .25, mouth: 'line', mouthW: .5, shadow: .3 } },
  gow_catch: { sp: .12, st: -.3, hp: .04, aR: [1.62, .1, 0], eR: .25, hR: 'grip', aL: [.1, .35, 0], eL: .2, lL: [.35, .18, .3], kL: .4, lR: [-.25, .14, -.2], kR: .15, face: { eye: 1.0, mouth: 'line', mouthW: .5 } },
  gow_reach: { sp: .1, hp: .05, aR: [1.3, .05, 0], eR: .35, hR: 'open', wR: [-.2, 0], aL: [.12, .3, 0], eL: .25, hL: 'relax', lL: [.3, .12, .2], kL: .3, lR: [-.15, .1, -.2], face: { eye: .8, lid: -.25, brow: .3, browA: -.4, mouth: 'line', mouthW: .5 } },
  gow_bow: { sp: .52, hp: .18, aR: [.9, -.6, 0], eR: 1.65, hR: 'flat', aL: [.3, .35, 0], eL: .3, hL: 'relax', lL: [.05, .05, .05], lR: [.03, .05, -.05], face: { eye: .55, mouth: 'line', mouthW: .5 } },
  gow_broken: { sp: .12, ss: -.08, hp: .1, hr: 1.25, aL: [.05, .25, 0], eL: .05, hL: 'relax', aR: [.05, .25, 0], eR: .05, hR: 'relax', lL: [.04, .08, .1], lR: [.0, .08, -.1], face: { eye: 1.05, mouth: 'line', mouthW: .45, pupil: .7 } },
  gow_sit: { sp: .05, hp: .12, hr: .25, aL: [.4, .55, 0], eL: .1, hL: 'flat', aR: [.4, .55, 0], eR: .1, hR: 'flat', lL: [1.5, .08, .05], kL: .02, lR: [1.5, .08, -.05], kR: .02, fL: -.2, fR: -.2, face: { eye: 1.0, mouth: 'line', mouthW: .5 } },
  gow_float: { ground: false, sp: .25, hp: -.05, hr: .2, aL: [.5, .9, .3], eL: .4, hL: 'open', aR: [.5, .9, -.3], eR: .4, hR: 'open', lL: [.35, .05, .1], kL: .6, lR: [.15, .05, -.1], kR: .9, fL: .5, fR: .6, face: { eye: .5, lid: .05, mouth: 'line', mouthW: .5 } },
  gow_read: { sp: .05, hp: .3, aL: [.75, -.25, -1.2], eL: 1.35, hL: 'flat', wL: [-.2, 0], aR: [.5, -.3, 0], eR: 1.5, hR: 'relax', book: 1, face: { eye: .7, mouth: 'line', mouthW: .5, look: [0, -.4] } },
  gow_neck180: { sp: .02, hp: .05, hy: Math.PI, aL: [.07, .32, .1], eL: .14, hL: 'relax', aR: [.07, .32, -.1], eR: .14, hR: 'relax', face: { eye: 1.05, mouth: 'line', mouthW: .45 } },
  gow_kneel: { sp: .2, hp: .2, aL: [.3, .25, 0], eL: .5, hL: 'relax', aR: [.3, .25, 0], eR: .5, hR: 'relax', lL: [1.5, .15, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2, face: { eye: .8, mouth: 'line', mouthW: .5 } },
});
SIGNATURE.gowther = ['gow_stand', 'gow_tilt', 'gow_glasses', 'gow_point', 'gow_temple', 'gow_bowAim', 'gow_cross', 'gow_rewrite', 'gow_blackout', 'gow_jack', 'gow_catch', 'gow_reach', 'gow_bow', 'gow_broken', 'gow_sit', 'gow_read'];
(window.SIGNATURE_FORM = window.SIGNATURE_FORM || {}).gowther = 'base';
