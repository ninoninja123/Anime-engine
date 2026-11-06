/* engine/chars_sad.js (agent E, project shinji-aizen-dazai) - Hirako Shinji, Aizen Sousuke (Bleach) and Dazai Osamu (Bungo Stray Dogs).
   Sources (checked 2026-10-31): bleach.fandom.com MediaWiki API (Shinji_Hirako, Sousuke_Aizen incl. Hogyoku transformations),
   bungostraydogs.fandom.com (Osamu_Dazai, Appearance).
   SHINJI: brown eyes, straight-cut blonde bob (jaw/shoulder length, asymmetric bangs - left longer), expressions show the UPPER teeth;
     captain shihakusho + long-sleeved captain haori (5) with a tie tucked under the robe.  Sakanade sealed: katana, green hilt +
     sheath, hourglass guard.  Shikai 'Taore' (倒れろ): pommel = large ring (sword spins around his finger), guard extension covers
     the first inches of the blade, straight slim blade with a slanted razor tip, FIVE holes along the blade (pink mist comes out).
     Bankai Sakashima Yokoshima Happofusagari (逆様邪八方塞): blade tip replaced by a sharp ring, golden metal flower encloses him.
     Hollow mask: pharaoh-like, short flowing hood down the back of the neck; under it sclera black, irises grey.  (No canon red
     markings were found - the mask is white with fine grey hood stripes; `maskStripe` colour can be changed.)
   AIZEN: brown hair + eyes.  captain: soft shaggy curtain hair, black square glasses, captain haori with pale-turquoise lining (5th).
     base (traitor / Las Noches): hair slicked back with ONE strand over the face, white Arrancar coat (narrow sleeves, standing collar,
     black inside), white under-tunic with black trim, white hakama, pink sash with a silver plate holding Kyoka Suigetsu, black
     boots with white lining.  hogyoku (1st fusion): Hogyoku embedded below the chest.  chrysalis (2nd): white full-body casing, only
     purple eyes visible, four tails below the waist, four purple lines from the Hogyoku, sword fused to the right hand.  third
     (3rd): face free, waist-length hair, purple sclera + silver iris.  butterfly (4th): flaring white dress with tattered hem,
     no irises/brows, black vesica piscis on the forehead, chest hole with a white cross + Hogyoku, three pairs of butterfly wings.
     final: black skull-like face split open, three white eyes, black neck/hands/lower legs, spike feet, three chest holes,
     wing sheets with an eye each + tendrils ending in white skull faces.
   DAZAI: mildly wavy short dark-brown hair (bangs framing the face, some gathered at the forehead centre), narrow dark-brown eyes, tall
     and slim; sand trench coat (belt left untied), black vest over a light-blue striped shirt, bolo tie (brown cord + turquoise
     pendant), beige trousers, dark-brown shoes, bandages everywhere except face/hands/feet (visible at the neck and wrists).
     mafia (Dark Era): black long coat, bandage over the right eye.  Ability No Longer Human: touch nullifies abilities (fx_sad.js).
   Forms (fig(name, form, ...)):
     shinji: base shikai mask (shikai + hollow mask) bankai wounded masked_wounded
     aizen : captain base hogyoku chrysalis third butterfly final wounded
     dazai : base nocoat mafia gun (= base, gun drawn) wounded
   Pose fields (interpolate): ringSpin (Shinji: sword hangs on its pommel ring from the index finger, use with sword.dir keys),
     gun 0/1 (Dazai pistol in the right hand, gunHand 'R'|'L'), glasses:false (hide Aizen's glasses), wounds 0..3.                       */
'use strict';
const SAD = {};
var SIGNATURE_FORM = window.SIGNATURE_FORM || {};   // form used by posesSheet for each character (make_sheets.sh)   // shared constants for this project
SAD.col = { shinjiHair: '#f2d77a', shinjiHairShade: '#c9a24a', aizenHair: '#6a3f22', aizenHairShade: '#3e2212', dazaiHair: '#4a3022', dazaiHairShade: '#26160e',
  hogyoku: '#b06cff', hogyokuCore: '#f4e6ff', coat: '#c9b48c', coatShade: '#a08a62', mist: '#ff9ccf' };

// ------------------------------------------------------------------------------------------------------------- small shared helpers
function sadBox(c, ctr, ax, half, col, opt, inkW) { // oriented box: ax = [X,Y,Z] unit axes, half = [hx,hy,hz]
  const P = (sx, sy, sz) => vAdd(ctr, vAdd(vMul(ax[0], sx * half[0]), vAdd(vMul(ax[1], sy * half[1]), vMul(ax[2], sz * half[2]))));
  const faces = [[[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1], ax[0]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], vMul(ax[0], -1)],
    [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1], ax[1]], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], vMul(ax[1], -1)],
    [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], ax[2]], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1], vMul(ax[2], -1)]];
  for (const f of faces) { const n = f[4]; const fc = vDot(n, toCam(ctr)); if (fc <= 0) continue; const pts = f.slice(0, 4).map(q => P(...q));
    const shade = opt.mode === 'flat' ? opt.col : (LIGHT.override ? LIGHT.override.fill : (vDot(n, LIGHT.key) > .1 ? tones(col).base : tones(col).shade));
    fill3D(c, pts, shade, opt.mode === 'flat' ? 0 : inkW); }
}
function sadFlatFrame(dir) { let side = vCross(dir, [0, 1, 0]); if (vLen(side) < .1) side = vCross(dir, [1, 0, 0]); side = vNorm(side); return [side, vNorm(vCross(side, dir))]; }
// torso decal helper: draws fn(cc) in a frame on the torso surface at (u, v), size in metres
function sadTorsoDecal(c, S, D, u, v, size, fn, off = .006) {
  const T = torsoModel(S, D, off * S.B.h / 1.8), fr = surfFrame(T.surf, u, v); if (vDot(fr.n, toCam(fr.p)) < .02) return;
  const tu = vMul(vNorm(fr.du), size), tv = vMul(vNorm(fr.dv), size); decal(c, fr.p, tu, tv, fn, .02, fr.n);
}
// tie / cravat hanging down the chest centre (torso u = 0), drawn as a torso tone mask -> folds with the body
const sadTieMask = (w0, w1, v0, v1) => (u, v) => { if (v < v0 || v > v1) return -1; const t = (v1 - v) / (v1 - v0); return lerp(w1, w0, t) - Math.abs(angOf(u)); };

// =============================================================================================================== HIRAKO SHINJI
CAST.shinji = design(SHINIGAMI, {
  name: 'Hirako Shinji', h: 1.86, body: { width: .94, limbs: .95, shoulders: 1.0, legs: 1.04, neck: 1.1 }, skin: '#f6dcc6', skinShade: '#d2a294',
  kosode: '#1c1b24', collar: { under: '#f2f0ea', skinCol: '#f2f0ea', v0: .62, w: .5, shift: .03 },
  torsoTones: [{ col: '#2e3a6a', mask: sadTieMask(.07, .045, .62, .99) }],            // dark navy tie tucked under the robe
  sleeve: { col: '#1c1b24', lining: '#12121a', r0: .085, r1: .098, r2: .12, sag: .13 },
  hakama: { col: '#1c1b24', r0: .1, r1: .118, r2: .13 },
  haori: { col: '#f4f2ec', lining: '#d8dad2', len: .86, sleeves: true, kanji: '五', hem: 'hishi', open: .24, flare: .36 },
  feet: { col: '#f1efe8', sole: '#a88a5a' },
  face: {
    eye: { w: 1.12, h: .24, irisR: .25, irisCol: '#7a5230', irisLight: '#c8945a', irisDark: '#2e1a0c', tilt: -.04, thick: 1.15, flick: .02, lashes: false, crease: true, pupilR: .32 },
    eyeSize: .37, eyeY: -.2, defaultExpr: 'smirk', brow: { browW: .065, browY: .1, browCol: '#a07a3a' },
    mouth: { mouthW: 1.55, teethN: 9, teethAlways: true, mouthIn: '#3a0e14' }, mouthSize: .28, mouthY: -.76,
    headShape: { jaw: .95, chin: 1.05, width: .94 }, noseK: 1.0,
    hair: { col: SAD.col.shinjiHair, shadeCol: SAD.col.shinjiHairShade, gloss: true, glossCol: '#fff6c8', springK: 30, springC: 5, cap: { front: .62, side: .02, back: -.95 },
      locks: () => [
        // straight bob curtain: locks fall straight down and end in a blunt line at the jaw / shoulder
        ...lockFan(25, 1.0, 5.28, .3, (th, u, i) => ({ th, ph: .3 + .05 * Math.sin(i * 1.9), len: 1.7 + .06 * Math.cos(th) + .06 * hash(i), w: .3, rootR: .95, wave: [.06, .7, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], dir: dirOut(th, .05, 1.6, -.05), curl: [-Math.sin(th) * 1.0, .1, -Math.cos(th) * .8], grav: .9, tw: .24, tip: .22, seg: 8, back: Math.cos(th) < .2, gloss: i % 4 === 1 })),
        // side curtains in front of the ears (frame the face, end at the jaw)
        ...lockFan(3, 1.05, 1.45, .3, (th, u, i) => ({ th, len: 1.55 + .05 * i, w: .34, rootR: .97, dir: [.3, -.85, .25], curl: [-.45, 0, .05], grav: 1.2, tw: .26, tip: .2, seg: 8, front: true, gloss: i === 1 })),
        ...lockFan(3, -1.45, -1.05, .3, (th, u, i) => ({ th, len: 1.55 + .05 * i, w: .34, rootR: .97, dir: [-.3, -.85, .25], curl: [.45, 0, .05], grav: 1.2, tw: .26, tip: .2, seg: 8, front: true, gloss: i === 1 })),
        // blunt straight bangs, asymmetric: his left side (th > 0) longer
        ...lockFan(10, -.95, .95, .92, (th, u, i) => ({ th, len: .72 + .3 * u + .04 * hash(i * 3), w: .32, rootR: .96, dir: [Math.sin(th) * .3, -.35, 1], grav: 2.2, curl: [0, -1.3, -.6], tw: .26, tip: .25, front: true, gloss: i % 3 === 1 })),
      ] },
    markings: (c, HM, e, lod, D) => { if (D.maskEyes) { /* black sclera handled by the mask eye holes */ } },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { const mk = S.pose.maskK != null ? S.pose.maskK : (D.mask ? 1 : 0); if (mk > 0) { const P = S.pose; parts.push({ z: zc - .012, fn: c => drawShinjiMask(c, HM, opt, D, e, { k: mk, crack: P.maskCrack || 0, crumble: P.maskCrumble || 0, half: P.maskHalf || D.maskHalf || 0, t }) }); if (mk > .7 && !(P.maskHalf || D.maskHalf) && (P.maskCrumble || 0) < .5) parts.push({ z: zc + HM.r * .9, fn: c => drawShinjiHood(c, HM, opt, D) }); } },
  },
  sword: { len: .96, w: .03, curve: .03, handle: .27, tsuba: 'none', col: '#d2d8e0', hiltCol: '#2e5a34', wrapCol: '#7ec88a', extra: (ctx, fr, pts, s, fm, opt) => sadHourglassGuard(ctx, fr, s, fm, opt, '#c8b060') },
  extras: (S, D, F, t, parts, opt) => shinjiExtras(S, D, F, t, parts, opt),
  forms: {
    base: { sheathSword: true },
    shikai: { sword: null }, mask: { mask: true }, bankai: { bankai: true }, wounded: { wounds: 2 }, masked_wounded: { mask: true, wounds: 3 }, half_mask: { mask: true, maskHalf: 1 },
    captain_long: { longHair: true, sheathSword: true, torsoTones: [], collar: { under: '#f2f0ea', v0: .6, w: .55, shift: .05 } },
  },
});
(function () { // shikai / bankai blade specs
  const ring = (ctx, hA, dir, flat, edge, s, fm, opt) => drawRing3D(ctx, vMad(hA, dir, -.075), flat, dir, .07, Math.max(1.5, .013 * s), fm ? opt.col : '#cfd4dc', s);
  const holes = (ctx, fr, pts, s, fm, opt, n = 5, u1 = .82) => { if (fm || LIGHT.override) return; for (let i = 0; i < n; i++) { const p = pts(.18 + i * (u1 - .18) / (n - 1), .45), q = project(p); if (!q) continue; const r = Math.max(1.2, .009 * q.s); ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, TAU); ctx.fillStyle = '#16141c'; ctx.fill(); } };
  const guardExt = (ctx, fr, pts, s, fm, opt) => { const poly = [pts(-.04, -.25), pts(.13, -.2), pts(.15, .5), pts(.13, 1.2), pts(-.04, 1.25)]; fill3D(ctx, poly, fm ? opt.col : tones('#2a2a34').base, fm ? 0 : lineW(s, .6)); };
  const slant = (pts, bl) => { const top = [], bot = []; for (let i = 0; i <= 14; i++) { const u = i / 14 * bl; top.push(pts(u, 0)); bot.push(pts(Math.min(u, bl * .9), 1)); } return top.concat(bot.reverse()); };
  const base = { len: 1.0, w: .028, curve: 0, handle: .24, tsuba: 'none', col: '#d8dee6', edgeCol: '#ffffff', hiltCol: '#22222a', wrapCol: '#e8e4d8', pommel: ring };
  CAST.shinji.forms.shikai.sword = Object.assign({}, base, { bladePoly: slant, extra: (ctx, fr, pts, s, fm, opt) => { guardExt(ctx, fr, pts, s, fm, opt); holes(ctx, fr, pts, s, fm, opt); } });
  CAST.shinji.forms.mask.sword = CAST.shinji.forms.shikai.sword; CAST.shinji.forms.masked_wounded.sword = CAST.shinji.forms.shikai.sword;
  CAST.shinji.forms.bankai.sword = Object.assign({}, base, { extra: (ctx, fr, pts, s, fm, opt) => { guardExt(ctx, fr, pts, s, fm, opt); holes(ctx, fr, pts, s, fm, opt, 4, .7);
    const tip = pts(1.0, .4); drawRing3D(ctx, vMad(tip, fr.dir, .05), fr.flat, fr.dir, .05, Math.max(1.5, .012 * s), fm ? opt.col : '#e8ecf2', s); } });
  CAST.shinji.forms.wounded.sword = CAST.shinji.forms.shikai.sword; CAST.shinji.forms.half_mask.sword = CAST.shinji.forms.shikai.sword;
  // 110 years ago: very long straight hair down to the lower back, same blunt bangs
  const f0 = CAST.shinji.face; CAST.shinji.forms.captain_long.face = Object.assign({}, f0, { hair: Object.assign({}, f0.hair, { locks: () => [
    ...lockFan(17, 1.0, 5.28, .3, (th, u, i) => ({ th, ph: .3, len: 6.2 + .3 * hash(i), w: .4, rootR: .95, dir: dirOut(th, .05, 1.6, -.1), curl: [-Math.sin(th) * .35, 0, -Math.cos(th) * .25], grav: 1.3, tw: .24, tip: .25, seg: 12, back: Math.cos(th) < .3, gloss: i % 4 === 1 })),
    ...lockFan(7, -.95, .95, .92, (th, u, i) => ({ th, len: .74 + .3 * u, w: .42, rootR: .96, dir: [Math.sin(th) * .3, -.35, 1], grav: 2.2, curl: [0, -1.3, -.6], tw: .26, tip: .15, front: true, gloss: i === 2 || i === 5 })),
  ] }) });
})();
CAST.shinji.drawHead = stdHead(CAST.shinji);
function sadHourglassGuard(ctx, fr, s, fm, opt, col) { // hourglass-shaped tsuba (two triangles meeting at the blade)
  const g0 = vMad(fr.grip, fr.dir, .27 * .35 * 1.02), r = .055, pts = [[-1, -.8], [1, -.8], [.18, 0], [1, .8], [-1, .8], [-.18, 0]].map(([a, b]) => vAdd(g0, vAdd(vMul(fr.edge, a * r), vMul(fr.flat, b * r * .5))));
  fill3D(ctx, pts, fm ? opt.col : tones(col).base, fm ? 0 : lineW(s, .6));
}
function shinjiExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8;
  if (D.sheathSword || (p.sword && p.sword.sheathed) || !p.sword) hipSheath(S, D, parts, opt, { col: '#2e5a34', hiltCol: '#2e5a34', tsubaCol: '#c8b060', tsubaR: .04 });
  woundParts(S, D, parts, opt, D.wounds || p.wounds || 0);
  if (D.bankai && p.flower) parts.push({ z: camDepth(S.J.pelvis) + .6, fn: c => fxSakanadeFlower(c, S.J.pelvis, t, { open: p.flower, scale: 1, behind: true }) });
}
// ring-spin: sword hangs on its pommel ring from the index fingertip (pose.ringSpin) - patched into swordFrame below
(function () {
  const base = swordFrame;
  swordFrame = function (S, D, sw) { const fr = base(S, D, sw); if (!sw || !sw.ringSpin) return fr; const hg = handGeom(S, sw.hand || 'R', S.pose['h' + (sw.hand || 'R')] || 'point'); if (!hg) return fr;
    const k = S.B.h / 1.8, hl = ((D.sword && D.sword.handle) || .24) * k; fr.grip = vMad(hg.fingers[0][2], fr.dir, hl * .65 + .075 * k); return fr; };
})();
// Hollow mask: white pharaoh-like face plate (long chin), eye holes with black sclera + grey iris, carved grin of teeth
function drawShinjiMask(c, HM, opt, D, e, M = { k: 1 }) {
  const k1 = 1.075, surf = { nu: 22, nv: 16, wrapU: false, u0: -.3, u1: .3, v0: .0, v1: .86, fn: (u, v) => {
    const ph = (v - .5) * Math.PI, l = headShape(u * TAU, ph, HM.hs); let q = vMul(l, k1);
    if (v < .28) { const w = (.28 - v) / .28; q = [q[0] * (1 - .35 * w), q[1] - w * .38, q[2] + w * .1]; }   // elongated pharaoh chin
    return HM.toW(q); } };
  const flat = opt.mode === 'flat', G = sampleSurf(surf);
  // formation / half / crumble masks (positive = keep): k sweeps from his right (u -.3) to left; crumble removes cells; half keeps the left side
  const masks = [], jag = (u, v) => .06 * Math.sin(v * 23 + u * 7) + .04 * Math.sin(v * 51);
  if (M.k < 1) masks.push((u, v) => M.k * 1.25 - (u + .3) / .6 + jag(u, v));
  if (M.half) masks.push((u, v) => u + .02 + jag(u, v) * 1.5);
  if (M.crumble) masks.push((u, v) => hash(Math.floor((u + .3) * 14) * 31 + Math.floor(v * 10) * 7) - M.crumble * 1.1 + .05 * Math.sin(u * 40));
  drawSurf(c, G, Object.assign({ col: '#f6f4ee', shade: .1, shadeCol: '#c8c4bc', masks, maskInk: masks.map(() => true), borders: { u0: true, u1: true, v0: true, v1: true }, pattern: flat ? null : (cc, G2, sg) => {
    if (sg < 0) return; const s = gridScale(G2);
    // centre ridge
    const uv = []; for (let j = 0; j <= 10; j++) uv.push([0, .32 + j * .05]); strokeRuns(cc, surfLine(surf, uv, 0), lineW(s, .5), rgba('#6a6460', .7));
    // eye holes: black (sclera turns black), grey iris, slanted almond
    for (const sg2 of [-1, 1]) { const fr = faceFrame(HM, sg2 * .45, -.17, .5, .42); const tu = sg2 > 0 ? fr.tu : vMul(fr.tu, -1);
      decal(cc, vAdd(fr.p, vMul(fr.n, HM.r * .08)), tu, fr.tv, c3 => { c3.fillStyle = '#0a080c'; c3.beginPath(); c3.moveTo(-.85, .12); c3.quadraticCurveTo(-.1, .62, .95, .32); c3.quadraticCurveTo(.3, -.42, -.85, .12); c3.fill();
        const lx = (e.look ? e.look[0] * sg2 : 0) * .25; c3.fillStyle = 'rgba(255,214,90,.45)'; c3.beginPath(); c3.ellipse(.05 + lx, .14, .34, .34, 0, 0, TAU); c3.fill(); c3.fillStyle = '#9a9aa4'; c3.beginPath(); c3.ellipse(.05 + lx, .14, .2, .22, 0, 0, TAU); c3.fill(); c3.fillStyle = '#e8e8f0'; c3.beginPath(); c3.arc(.0 + lx, .22, .06, 0, TAU); c3.fill(); }, -1, fr.n); }
    // wide grin of teeth carved across the lower plate
    { const fr = faceFrame(HM, 0, -.72, .45, .62); decal(cc, vAdd(fr.p, vMul(fr.n, HM.r * .07)), fr.tu, fr.tv, c3 => { c3.fillStyle = '#0a080c'; c3.beginPath(); c3.moveTo(-1.05, .18); c3.quadraticCurveTo(0, -.05, 1.05, .18); c3.quadraticCurveTo(.9, -.45, 0, -.5); c3.quadraticCurveTo(-.9, -.45, -1.05, .18); c3.fill();
      c3.fillStyle = '#f6f4ee'; for (let i = -6; i <= 6; i++) { const x = i * .15; c3.beginPath(); c3.moveTo(x - .055, .12 - .04 * (i * i) / 36); c3.lineTo(x + .055, .12 - .04 * (i * i) / 36); c3.lineTo(x + .04, -.1); c3.lineTo(x - .04, -.1); c3.fill(); c3.beginPath(); c3.moveTo(x - .05, -.42 + .1 * (i * i) / 36); c3.lineTo(x + .05, -.42 + .1 * (i * i) / 36); c3.lineTo(x + .035, -.22); c3.lineTo(x - .035, -.22); c3.fill(); } }, -1, fr.n); }
    // thin black vertical lines over the plate (canon: 'ohuet mustat pystyviivat')
    for (const uu of [-.2, -.13, .13, .2]) { const uvv = []; for (let j = 0; j <= 8; j++) uvv.push([uu, .5 + j * .045]); strokeRuns(cc, surfLine(surf, uvv, 0), lineW(s, .45), '#1a1418'); }
    // brow lines (pharaoh band)
    { const uv2 = []; for (let j = 0; j <= 16; j++) uv2.push([-.28 + j * .035, .66]); strokeRuns(cc, surfLine(surf, uv2, 0), lineW(s, .6), rgba(D.maskStripe || '#8a8480', .9)); }
    if (M.crack) { const r = rng(17); for (let i = 0; i < 2 + M.crack * 6; i++) { let u = (r() - .5) * .4, v = .85 - r() * .2; const uv3 = [[u, v]]; for (let k = 0; k < 6; k++) { u += (r() - .5) * .08; v -= .05 + r() * .06 * M.crack; uv3.push([clamp(u, -.29, .29), clamp(v, .02, .85)]); } strokeRuns(cc, surfLine(surf, uv3, 0), lineW(s, .9), '#1a1418'); } }
    if (M.k < 1) { const r = rng(5); for (let i = 0; i < 6; i++) { const v = .2 + r() * .6, u = M.k * 1.25 * .6 - .3, a = proj2(surf.fn(clamp(u, -.3, .3), v)), L = 8 + r() * 20; cc.fillStyle = '#f6f4ee'; cc.beginPath(); cc.ellipse(a[0], a[1] + L * .5, 3 + r() * 3, L * .5, 0, 0, TAU); cc.fill(); } }   // dripping white mass on the forming edge
  } }, opt.surf || {}));
}
// the short flowing hood (nemes-like) hanging down the back of the neck
function drawShinjiHood(c, HM, opt, D) {
  const surf = { nu: 18, nv: 8, wrapU: false, fn: (u, v) => { const th = lerp(1.25, TAU - 1.25, u); const top = vMul(headShape(th, .25, HM.hs), 1.09); const fl = 1 + .35 * v; return HM.toW([top[0] * fl, top[1] - v * 1.55, top[2] * (1 + .2 * v) - v * .15]); } };
  drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f2f0ea', side: 'both', backCol: '#cfcbc2', shade: .1, borders: { v1: true, u0: true, u1: true }, pattern: opt.mode === 'flat' ? null : (cc, G2, sg) => { const s = gridScale(G2); for (let i = 1; i < 9; i++) strokeRuns(cc, surfLine(surf, [[i / 9, .05], [i / 9, .5], [i / 9, .98]], -1), lineW(s, .45), rgba(D.maskStripe || '#8a8480', .8)); } }, opt.surf || {}));
}

// =============================================================================================================== AIZEN SOUSUKE
const AIZEN_HAIR_BACK = () => [
  // slicked back: long locks from the hairline sweeping over the crown to the nape
  ...lockFan(13, -1.0, 1.0, .95, (th, u, i) => ({ th, len: 1.65 + .1 * hash(i), w: .38, rootR: .97, dir: [Math.sin(th) * .12, .35, -.94], curl: [-Math.sin(th) * .3, -.95, -.15], grav: .35, tw: .24, tip: 1.1, seg: 10, back: true, gloss: i % 3 === 1 })),
  ...lockFan(8, 1.5, 4.78, .5, (th, u, i) => ({ th, len: 1.3, w: .46, rootR: .965, dir: vNorm([Math.sin(th) * .15, -.45, -.9]), curl: [-Math.sin(th) * .5, -.3, -.1], grav: .7, tw: .26, tip: 1.2, seg: 8, back: true })),
  // side hair combed straight back over the ears (hugging the skull)
  ...lockFan(3, 1.15, 1.6, .2, (th, u, i) => ({ th, len: 1.1, w: .3, rootR: .965, dir: [-.05, .12, -1], curl: [-.35, -.2, 0], grav: .6, tw: .26, tip: 1.3, back: true })),
  ...lockFan(3, -1.6, -1.15, .2, (th, u, i) => ({ th, len: 1.1, w: .3, rootR: .965, dir: [.05, .12, -1], curl: [.35, -.2, 0], grav: .6, tw: .26, tip: 1.3, back: true })),
  // the single strand falling over the face (his signature): from the hairline, curving down past the right eye
  { th: .3, ph: .85, len: 1.05, w: .1, rootR: .97, dir: [-.05, .3, 1], curl: [-.35, -2.4, -.7], grav: 1.5, tw: .4, tip: 1.2, front: true, seg: 9 },
];
const AIZEN_HAIR_CURTAIN = () => [
  ...lockFan(13, 1.1, 5.18, .4, (th, u, i) => ({ th, len: 1.4 + .15 * hash(i), w: .44, rootR: .95, dir: dirOut(th, .05, 1.5, -.2), curl: [-Math.sin(th) * .95, 0, -Math.cos(th) * .6], grav: 1.0, tw: .28, tip: 1.2, seg: 8, back: true })),
  // soft shaggy curtain: parted in the middle, falling over the forehead to both sides
  ...lockFan(4, .05, .8, .92, (th, u, i) => ({ th, len: 1.05 + .2 * u, w: .45, rootR: .97, dir: [.35 + u * .3, .05, 1], curl: [.6, -1.4, -.5], grav: 1.6, tw: .28, tip: 1.3, front: true, gloss: i === 1 })),
  ...lockFan(4, -.8, -.05, .92, (th, u, i) => ({ th, len: 1.25 - .2 * u, w: .45, rootR: .97, dir: [-.65 + u * .3, .05, 1], curl: [-.6, -1.4, -.5], grav: 1.6, tw: .28, tip: 1.3, front: true, gloss: i === 2 })),
  ...lockFan(2, 1.05, 1.35, .3, (th, u, i) => ({ th, len: 1.4, w: .33, rootR: .97, dir: [.2, -.9, .3], curl: [-.45, 0, .1], grav: 1.1, tw: .3, tip: 1.3, front: true })),
  ...lockFan(2, -1.35, -1.05, .3, (th, u, i) => ({ th, len: 1.4, w: .33, rootR: .97, dir: [-.2, -.9, .3], curl: [.45, 0, .1], grav: 1.1, tw: .3, tip: 1.3, front: true })),
];
const AIZEN_HAIR_LONG = strand => () => [
  ...lockFan(9, -1.0, 1.0, .95, (th, u, i) => ({ th, len: 2.0, w: .5, rootR: .98, dir: [Math.sin(th) * .2, .55, -.85], curl: [0, -.55, -.25], grav: .45, tw: .25, tip: 1.1, seg: 9, back: true, gloss: i % 3 === 1 })),
  // waist-length mane behind
  ...lockFan(15, 1.15, 5.13, .35, (th, u, i) => ({ th, len: 6.5 + .8 * hash(i * 5), w: .5, rootR: .98, dir: dirOut(th, .1, 1.6, -.4), grav: 1.4, wave: [.15, .8, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .3, tip: 1.4, seg: 12, back: true, gloss: i % 4 === 2 })),
  ...lockFan(3, 1.05, 1.45, .25, (th, u, i) => ({ th, len: 4.6 + .5 * i, w: .36, rootR: .98, dir: [.4, -.85, .1], grav: 1.4, tw: .3, tip: 1.3, seg: 11, front: false })),
  ...lockFan(3, -1.45, -1.05, .25, (th, u, i) => ({ th, len: 4.6 + .5 * i, w: .36, rootR: .98, dir: [-.4, -.85, .1], grav: 1.4, tw: .3, tip: 1.3, seg: 11, front: false })),
  ...(strand ? [{ th: .22, ph: .9, len: 1.55, w: .13, rootR: .97, dir: [.05, .4, 1], curl: [-.15, -2.0, -.6], grav: 1.4, tw: .4, tip: 1.2, front: true, seg: 9 }] : []),
];
CAST.aizen = design(SHINIGAMI, {
  name: 'Aizen Sousuke', h: 1.86, body: { width: 1.0, limbs: 1.0, shoulders: 1.06, depth: 1.02, legs: 1.03 }, skin: '#f6dcc8', skinShade: '#cfa092',
  // Las Noches outfit (default): white under-tunic with black trim, white Arrancar coat, white hakama, pink sash + silver plate
  kosode: '#f1efe8', collar: { under: '#1c1a22', skinCol: '#f1efe8', v0: .7, w: .32, shift: 0 },
  torsoTones: [{ col: '#1c1a22', mask: (u, v) => .05 - Math.abs(Math.abs(angOf(u)) - .34) - (v < .14 ? 1 : 0) }],
  sleeve: { col: '#f1efe8', lining: '#1c1a22', r0: .078, r1: .074, r2: .072, sag: .03, len: 1.0 },
  hakama: { col: '#f1efe8', r0: .105, r1: .118, r2: .124, ties: false },
  obi: { col: '#e48ab2', v0: .03, v1: .1 },
  haori: { col: '#f6f4ee', lining: '#1c1a22', len: .9, sleeves: true, hem: 'none', kanji: null, open: .3, flare: .3, collarLen: .5 },
  feet: { col: '#18161c', sandal: true, sole: '#f2f0ea' },
  face: {
    eye: { w: 1.08, h: .27, irisR: .26, irisCol: '#7a4a24', irisLight: '#c48a4a', irisDark: '#2a140a', tilt: .1, thick: 1.15, flick: .05, lashes: true, crease: true, pupilR: .3 },
    eyeSize: .36, eyeY: -.2, defaultExpr: 'calm', brow: { browW: .075, browY: .03, browCol: '#4a2814' }, headShape: { jaw: 1.05, chin: 1.08, width: .9 },
    mouth: { mouthW: 1.05 },
    hair: { col: SAD.col.aizenHair, shadeCol: SAD.col.aizenHairShade, gloss: true, glossCol: '#a8744a', springK: 34, springC: 5, cap: { front: .78, side: .12, back: -.9 }, locks: AIZEN_HAIR_BACK },
    details: (c, HM, e, lod, D) => aizenFaceDetails(c, HM, e, lod, D),
    markings: (c, HM, e, lod, D) => aizenMarkings(c, HM, e, lod, D),
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { if (D.glasses && S.pose.glasses !== false) parts.push({ z: zc - HM.r * 1.05, fn: c => drawAizenGlasses(c, HM, opt) }); },
  },
  // Kyoka Suigetsu: gold hexagonal tsuba, green braid with diamond openings, gold kashira, black sheath (anime)
  sword: { len: .98, w: .033, curve: .035, handle: .28, tsuba: 'none', hiltCol: '#2e6a3e', wrapCol: '#e8d070', col: '#d0d8e0',
    extra: (ctx, fr, pts, s, fm, opt) => { const g0 = vMad(fr.grip, fr.dir, .28 * .35), r = .05, hx = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; hx.push(vAdd(g0, vAdd(vMul(fr.flat, Math.cos(a) * r), vMul(fr.edge, Math.sin(a) * r)))); } fill3D(ctx, hx, fm ? opt.col : tones('#d8b048').base, fm ? 0 : lineW(s, .6)); },
    pommel: (ctx, hA, dir, flat, edge, s, fm, opt) => { const q = project(hA); if (!q) return; ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.5, .02 * q.s), 0, TAU); ctx.fillStyle = fm ? opt.col : '#d8b048'; ctx.fill(); } },
  extras: (S, D, F, t, parts, opt) => aizenExtras(S, D, F, t, parts, opt),
  forms: {
    base: {},
    captain: { kosode: '#1f1d27', collar: { under: '#f1efe9', v0: .6, w: .6, shift: .05 }, torsoTones: [], sleeve: { col: '#1f1d27', r0: .085, r1: .1, r2: .13, sag: .16 },
      hakama: { col: '#1f1d27', r0: .1, r1: .118, r2: .135 }, obi: null, haori: { col: '#f4f2ec', lining: '#9fd8cf', len: .82, sleeves: true, kanji: '五', hem: 'hishi', open: .22 },
      feet: { col: '#f1efe8', sole: '#b7976a' }, glasses: true, captainHair: true },
    hogyoku: { hogyoku: 1 }, hogyoku_creep: { hogyoku: 1, creep: .6 },
    lieutenant: { kosode: '#1f1d27', collar: { under: '#f1efe9', v0: .6, w: .6, shift: .05 }, torsoTones: [], sleeve: { col: '#1f1d27', r0: .085, r1: .1, r2: .13, sag: .16 }, hakama: { col: '#1f1d27', r0: .1, r1: .118, r2: .135 }, obi: null, haori: { none: true }, feet: { col: '#f1efe8', sole: '#b7976a' }, glasses: true, captainHair: true, armband: true },
    chrysalis: { hogyoku: 2, suit: true, fused: true, noHair: true },
    third: { hogyoku: 2, suit: true, fused: true, longHair: true, purpleEyes: true },
    butterfly: { hogyoku: 3, suit: true, dress: true, fused: true, longHair: true, noIris: true, wings: 'butterfly' },
    final: { hogyoku: 4, monster: true, fused: true, wings: 'final' },
    wounded: { wounds: 2 },
  },
});
(function () { // form-specific design overrides (shallow form merge -> full objects)
  const A = CAST.aizen, F = A.forms, face0 = A.face;
  F.captain.face = Object.assign({}, face0, { hair: Object.assign({}, face0.hair, { cap: { front: .55, side: .05, back: -.9 }, locks: AIZEN_HAIR_CURTAIN }), eye: Object.assign({}, face0.eye, { tilt: -.04, h: .3 }), defaultExpr: 'smile' });
  F.lieutenant.face = F.captain.face;
  const suit = { kosode: '#f4f2f0', collar: { none: true }, torsoTones: [], sleeve: { col: '#f4f2f0', r0: .072, r1: .068, r2: .066, sag: .02, len: 1.0 }, hakama: { col: '#f4f2f0', r0: .1, r1: .09, r2: .08, pleats: false, ties: false }, obi: null,
    feet: { col: '#f4f2f0', sandal: false, w: .9 }, handSkin: '#f4f2f0' };
  Object.assign(F.chrysalis, suit, { haori: { col: '#f4f2f0', lining: '#3a1a4a', len: .72, sleeves: false, hem: 'none', open: .02, flare: .5, collarLen: 0, slits: 4 }, skin: '#f4f2f0', skinShade: '#c6c0cc',
    face: Object.assign({}, face0, { hair: { cap: false, locks: [] }, ears: false, brows: false, noMouth: true, noNose: true, eye: Object.assign({}, face0.eye, { irisCol: '#9a4ad8', irisLight: '#c88aff', irisDark: '#5a1a8a', white: '#9a4ad8', noPupil: true, lashes: false, crease: false }),
      details: null, markings: (c, HM, e, lod, D) => { const fr = faceFrame(HM, 0, -.2, .6, 1); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = rgba('#b8b0c4', .8); cc.lineWidth = .025; for (const y of [-.5, -.95]) { cc.beginPath(); cc.moveTo(-.8, y); cc.quadraticCurveTo(0, y - .12, .8, y); cc.stroke(); } }, .05, fr.n); } }) });
  Object.assign(F.third, suit, { haori: F.chrysalis.haori, face: Object.assign({}, face0, { brows: true, eye: Object.assign({}, face0.eye, { white: '#7a3ab8', irisCol: '#e8e8f0', irisLight: '#ffffff', irisDark: '#9a9aa8', lashes: true }),
    hair: Object.assign({}, face0.hair, { cap: { front: .8, side: .12, back: -.9 }, locks: AIZEN_HAIR_LONG(true) }) }) });
  Object.assign(F.butterfly, suit, { sleeve: { col: '#f6f4f2', r0: .07, r1: .066, r2: .064, sag: .02 }, haori: { col: '#f6f4f2', lining: '#d8d2e2', len: 1.05, sleeves: false, hem: 'none', open: .0, flare: .9, collarLen: 0, torn: .45 },
    face: Object.assign({}, face0, { brows: false, eye: Object.assign({}, face0.eye, { irisCol: '#f4f0ff', irisLight: '#ffffff', irisDark: '#d8d0e8', noPupil: true, irisR: .01 }),
      hair: Object.assign({}, face0.hair, { cap: { front: .8, side: .12, back: -.9 }, locks: AIZEN_HAIR_LONG(false) }) }) });
  Object.assign(F.final, { kosode: '#eeecef', collar: { none: true }, torsoTones: [], sleeve: { none: true, bare: true }, haori: { none: true }, obi: null, skin: '#eeecef', skinShade: '#b8b2c2',
    hakama: { col: '#eeecef', r0: .09, r1: .075, r2: .06, pleats: false, ties: false, lowerCol: '#141018', lowerV: .5 }, feet: { col: '#141018', sandal: false, w: .7 }, handSkin: '#141018', armSkin: '#eeecef',
    sword: { len: 1.05, w: .036, curve: .02, handle: .2, tsuba: 'none', col: '#1a1620', edgeCol: '#5a3a7a', drawHandle: false },
    face: Object.assign({}, face0, { hair: { cap: false, locks: [] }, brows: false, noEyes: true, noMouth: true, noNose: true, ears: false, details: null, markings: (c, HM, e, lod, D) => aizenFinalFace(c, HM, e, lod) }) });
  for (const f of ['chrysalis', 'third', 'butterfly']) F[f].sword = Object.assign({}, A.sword, { drawHandle: false, tsuba: 'none' });
})();
CAST.aizen.drawHead = stdHead(CAST.aizen);
function aizenMarkings(c, HM, e, lod, D) {
  if (D.dress) { const fr = faceFrame(HM, 0, .38, .6, .2); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = '#141018'; cc.beginPath(); cc.moveTo(0, .9); cc.quadraticCurveTo(.42, 0, 0, -.9); cc.quadraticCurveTo(-.42, 0, 0, .9); cc.fill(); }, .05, fr.n); }  // vesica piscis
}
function aizenFaceDetails(c, HM, e, lod, D) { /* reserved for close-up glints */ }
function aizenFinalFace(c, HM, e, lod) { // split white face pulled aside -> black skull visage, two rows of teeth, three white eyes
  const fr = faceFrame(HM, 0, -.25, .55, 1.02); decal(c, fr.p, fr.tu, fr.tv, cc => {
    cc.fillStyle = '#120e16'; cc.beginPath(); cc.moveTo(-.62, .75); cc.quadraticCurveTo(0, 1.0, .62, .75); cc.lineTo(.72, -.2); cc.quadraticCurveTo(.5, -1.0, 0, -1.08); cc.quadraticCurveTo(-.5, -1.0, -.72, -.2); cc.closePath(); cc.fill();
    cc.strokeStyle = '#7a6a8a'; cc.lineWidth = .03; for (const sg of [-1, 1]) { cc.beginPath(); cc.moveTo(sg * .62, .75); cc.lineTo(sg * .8, .2); cc.lineTo(sg * .7, -.3); cc.lineTo(sg * .78, -.7); cc.stroke(); }
    cc.fillStyle = '#f4f2f8'; for (const [x, y, r] of [[-.33, .02, .14], [.33, .02, .14], [0, .5, .12]]) { cc.beginPath(); cc.ellipse(x, y, r * 1.3, r * (y > .3 ? 1.4 : .75), 0, 0, TAU); cc.fill(); }
    cc.fillStyle = '#f4f2f8'; for (let row = 0; row < 2; row++) for (let i = -4; i <= 4; i++) { const x = i * .1, y = row ? -.66 : -.52; cc.beginPath(); cc.moveTo(x - .04, y); cc.lineTo(x + .04, y); cc.lineTo(x, y + (row ? .12 : -.12)); cc.closePath(); cc.fill(); }
  }, .05, fr.n);
}
function drawAizenGlasses(c, HM, opt) { // black square frames standing off the face + temples to the ears
  if (opt.mode === 'flat') return; const s = pxScale(HM.c), lw = Math.max(1.2, lineW(s, .9) * 1.1), ink = LIGHT.override ? LIGHT.ink : '#141018';
  const corners = [];
  for (const sg of [-1, 1]) { const fr = faceFrame(HM, sg * .45, -.19, .55, .44); const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1), p0 = vAdd(fr.p, vMul(fr.n, HM.r * .14)); if (vDot(fr.n, toCam(p0)) < -.2) continue;
    const q = [[-.62, .42], [.72, .42], [.72, -.38], [-.62, -.38]].map(([x, y]) => vAdd(p0, vAdd(vMul(tu, x), vMul(fr.tv, y)))); const sp = q.map(p => proj2(p));
    if (!LIGHT.override) { polyPath(c, sp); c.fillStyle = 'rgba(220,235,255,.12)'; c.fill(); c.save(); polyPath(c, sp); c.clip(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = lw * 1.4; c.beginPath(); c.moveTo(sp[0][0], lerp(sp[0][1], sp[3][1], .7)); c.lineTo(lerp(sp[0][0], sp[1][0], .45), sp[0][1]); c.stroke(); c.restore(); }
    polyPath(c, sp); c.lineWidth = lw; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke(); corners.push({ sg, inner: q[0], outer: q[1], outerB: q[2] });
    const ear = HM.at(sg * 1.45, -.12); if (vDot(vNorm(vSub(ear, HM.c)), toCam(ear)) > -.35) { const a = proj2(q[1]), b = proj2(ear); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
  if (corners.length === 2) { const a = proj2(corners[0].inner), b = proj2(corners[1].inner); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - lw * 1.5, b[0], b[1]); c.lineWidth = lw; c.strokeStyle = ink; c.stroke(); }
}
function aizenExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8;
  if (!D.suit && !D.monster) { if (!D.captainHair) aizenCollar(S, D, parts, opt); hipSheath(S, D, parts, opt, { col: '#16141a', hiltCol: '#2e6a3e', tsubaCol: '#d8b048', tsubaR: .045 }); }
  if (!D.suit && !D.monster && !D.captainHair) parts.push({ z: camDepth(S.J.pelvis) - .1, fn: c => sadTorsoDecal(c, S, D, .1, .07, .07 * k, cc => { cc.fillStyle = opt.mode === 'flat' ? opt.col : '#d8dce4'; cc.fillRect(-.8, -.5, 1.6, 1); if (opt.mode !== 'flat') { cc.lineWidth = .1; cc.strokeStyle = LIGHT.ink; cc.strokeRect(-.8, -.5, 1.6, 1); } }, .016) });
  if (D.hogyoku) parts.push({ z: camDepth(S.J.abd) - .2, fn: c => drawHogyokuOrb(c, S, D, t, opt) });
  if (D.wings) aizenWings(S, D, F, t, parts, opt);
  if (D.monster) parts.push({ z: camDepth(S.J.abd) - .12, fn: c => { for (let i = 0; i < 3; i++) sadTorsoDecal(c, S, D, 0, .72 - i * .2, (.07 - i * .012) * k, cc => { cc.fillStyle = opt.mode === 'flat' ? opt.col : '#08060a'; cc.beginPath(); cc.arc(0, 0, 1, 0, TAU); cc.fill(); if (opt.mode !== 'flat') { cc.lineWidth = .12; cc.strokeStyle = '#6a4a8a'; cc.stroke(); } }, .02); } });
  if (D.monster) { for (const sd of ['L', 'R']) parts.push({ z: camDepth(S.J['wr' + sd]) - .01, fn: c => { const surf = sTube([vLerp(S.J['el' + sd], S.J['wr' + sd], .55), S.J['wr' + sd]], v => S.B.limbR.fa * lerp(1, 1.05, v), S.M.chest[0], 10, 3); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#141018', shade: .1 }, opt.surf || {})); } }); }
  if (D.armband) parts.push({ z: camDepth(S.J.elL) - .03, fn: c => { const a = vLerp(S.J.shL, S.J.elL, .45), b = vLerp(S.J.shL, S.J.elL, .75); e2Tube(c, [a, b], S.B.limbR.ua * 1.9, '#f2f0ea', opt, { hint: S.M.chest[2] }); } });   // lieutenant badge on the left arm
  const cr = p.creep != null ? p.creep : (D.creep || 0); if (cr > 0) aizenCreep(S, D, parts, opt, cr, t);
  woundParts(S, D, parts, opt, D.wounds || p.wounds || 0);
}
function aizenCreep(S, D, parts, opt, cr, t) { // 1st fusion: white cloak-like substance creeping over the body from the Hogyoku, up to half the face
  const k = S.B.h / 1.8, HM = headModel(S, D), flat = opt.mode === 'flat', col = flat ? opt.col : '#f6f4f2';
  parts.push({ z: camDepth(S.J.abd) - .11, fn: c => { for (let i = 0; i < 9; i++) { const u = (hash(i * 3) - .5) * .7 * cr + (i % 2 ? .02 : -.02), v = .58 + (hash(i * 5) - .3) * .7 * cr; if (v > 1) continue; sadTorsoDecal(c, S, D, (u + 1) % 1, clamp(v, .05, .98), (.06 + .08 * cr) * k, cc => { cc.fillStyle = col; cc.beginPath(); for (let j = 0; j <= 10; j++) { const a = j / 10 * TAU, r = .8 + .35 * Math.sin(a * 3 + i + t * 2); cc.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.3); } cc.fill(); if (!flat) { cc.lineWidth = .06; cc.strokeStyle = '#4a3a5a'; cc.stroke(); } }, .025); } } });
  if (cr > .45) parts.push({ z: camDepth(HM.c) - HM.r * 1.02, fn: c => { const fr = faceFrame(HM, -.45, -.3, .5, 1); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { const g = (cr - .45) / .55; cc.fillStyle = col; cc.beginPath(); cc.moveTo(-.6, -1.2); cc.lineTo(.55, -1.2); cc.quadraticCurveTo(.4, -.2 + .6 * g, .5, .2 + 1 * g); cc.quadraticCurveTo(.1, -.3 + g, -.4, -.4 + g * 1.2); cc.closePath(); cc.fill(); if (!flat) { cc.lineWidth = .04; cc.strokeStyle = '#4a3a5a'; cc.stroke(); } }, .02, fr.n); } });
}
function aizenCollar(S, D, parts, opt) { // narrow standing collar of the Arrancar coat (white outside, black inside)
  const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.headBase) + .012, fn: c => { const T = torsoModel(S, D, .03 * k), surf = { nu: 22, nv: 2, wrapU: false, u0: 0, u1: 1, fn: (u, v) => { const th = lerp(.32, TAU - .32, u), b = T.ringAt(.985, th, .012 * k); const ctr = vLerp(S.J.neck, S.J.headBase, .1); return vAdd(vLerp(b, vLerp(ctr, b, .9), v), [0, v * .05 * k, 0]); } };
    drawSurf(c, sampleSurf(surf), Object.assign({ col: '#f6f4ee', side: 'both', backCol: '#1c1a22', shade: .08 }, opt.surf || {})); } });
}
function drawHogyokuOrb(c, S, D, t, opt) { // Hogyoku below the chest; stage 2: four purple lines crosswise; stage 3: white cross + hole
  const k = S.B.h / 1.8, T = torsoModel(S, D, .02 * k), fr = surfFrame(T.surf, 0, .58); if (vDot(fr.n, toCam(fr.p)) < -.1) return;
  const q = project(fr.p); if (!q) return; const r = .035 * k * q.s, flat = opt.mode === 'flat';
  if (D.hogyoku >= 3) { const tu = vMul(vNorm(fr.du), .13 * k), tv = vMul(vNorm(fr.dv), .13 * k); decal(c, fr.p, tu, tv, cc => { cc.fillStyle = flat ? opt.col : '#08060a'; cc.beginPath(); cc.arc(0, 0, .75, 0, TAU); cc.fill(); if (!flat) { cc.fillStyle = '#f6f4f2'; cc.fillRect(-.12, -1.2, .24, 2.4); cc.fillRect(-1.2, -.12, 2.4, .24); } }, -.2, fr.n); }
  if (D.hogyoku === 2 && !flat) { const tu = vMul(vNorm(fr.du), .25 * k), tv = vMul(vNorm(fr.dv), .25 * k); decal(c, fr.p, tu, tv, cc => { cc.strokeStyle = '#8a3ad0'; cc.lineWidth = .05; cc.beginPath(); cc.moveTo(0, 0); cc.lineTo(0, 1.9); cc.moveTo(0, 0); cc.lineTo(0, -1.4); cc.moveTo(0, 0); cc.lineTo(1.1, 0); cc.moveTo(0, 0); cc.lineTo(-1.1, 0); cc.stroke(); }, -.2, fr.n); }
  if (flat) { c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.fillStyle = opt.col; c.fill(); return; }
  const pulse = .75 + .25 * Math.sin(t * 5);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, q.x, q.y, r * 4.5, SAD.col.hogyoku, .35 * pulse); c.restore();
  c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.fillStyle = radial(c, q.x - r * .3, q.y - r * .3, r * 1.3, [[0, '#f0dcff'], [.25, '#9a52e0'], [.7, '#3a0c66'], [1, '#12021e']]); c.fill(); c.lineWidth = Math.max(1, r * .12); c.strokeStyle = '#2a0a4a'; c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.ellipse(q.x - r * .35, q.y - r * .4, r * .22, r * .14, -.5, 0, TAU); c.fill(); c.strokeStyle = rgba('#e8c8ff', .8); c.lineWidth = Math.max(1, r * .1); c.beginPath(); c.arc(q.x, q.y, r * .55, t * 3, t * 3 + 2); c.stroke(); // light moving inside
}
function aizenWings(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1], root = vAdd(S.J.neck, mApply(M, [0, -.14 * k, -.13 * k])), fin = D.wings === 'final';
  const flap = Math.sin(t * 2.4) * .1, behind = vDot(back, CAM.cur.F) > 0, flat = opt.mode === 'flat';
  const specs = [[.75, 1.25, .62, 0], [.05, 1.05, .52, 1], [-.6, .9, .42, 2]];  // [elevation, length, width, index]
  for (const sg of [1, -1]) for (const [el, len, wid, idx] of specs) {
    const side = vMul(M[0], sg), dir = vNorm(vAdd(vMul(side, 1), vAdd(vMul(up, el + flap * (1 + idx * .3)), vMul(back, .45)))), n = vNorm(vCross(dir, back));
    const L = len * k * (fin ? 1.15 : 1), W = wid * k * (fin ? 1.3 : 1);
    parts.push({ z: camDepth(vMad(root, dir, L * .5)) + (behind ? -.35 : .35), fn: c => {
      const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, rr = .5 * (1 - Math.cos(a)); pts.push(vAdd(vMad(root, dir, L * (.12 + .88 * rr)), vMul(n, Math.sin(a) * W * (.5 + .5 * Math.sin(a * .5 + .3)) * (idx === 2 ? .8 : 1)))); }
      const sp = projPoly(pts); if (sp.length < 3) return; polyPath(c, sp);
      if (flat) { c.fillStyle = opt.col; c.fill(); return; }
      c.fillStyle = fin ? rgba('#f2eef6', .96) : rgba('#f8f6ff', .82); c.fill(); c.save(); c.clip(); // veins + dark border band
      c.strokeStyle = fin ? '#3a2a4a' : rgba('#5a3a8a', .7); c.lineWidth = Math.max(1, lineW(pxScale(root), .5)); for (let v = 1; v <= 4; v++) { const a = proj2(root), b = proj2(vAdd(vMad(root, dir, L * .95), vMul(n, (v - 2.5) * W * .35))); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
      polyPath(c, sp); c.lineWidth = Math.max(3, .05 * k * pxScale(root)); c.strokeStyle = fin ? '#141018' : rgba('#2a1a40', .85); c.stroke(); c.restore();
      polyPath(c, sp); c.lineWidth = Math.max(1.2, lineW(pxScale(root), .8)); c.strokeStyle = LIGHT.ink; c.stroke();
      if (fin) { const e = project(vMad(root, dir, L * .58)); if (e) { const r = W * .28 * e.s; c.fillStyle = '#0a080c'; c.beginPath(); c.ellipse(e.x, e.y, r * 1.3, r * .8, 0, 0, TAU); c.fill(); c.fillStyle = '#f4f2f8'; c.beginPath(); c.arc(e.x, e.y, r * .4, 0, TAU); c.fill(); } }
      if (idx === 2) { const tail = [vMad(root, dir, L * .8), vAdd(vMad(root, dir, L * 1.25), vMul(up, -.5 * k))]; const a = proj2(tail[0]), b = proj2(tail[1]); inkPts(c, [a, [lerp(a[0], b[0], .5) + 4, lerp(a[1], b[1], .5)], b], Math.max(3, .045 * k * pxScale(root)), fin ? '#141018' : '#e8e4f2', [.1, .9]); }
      if (fin) { // tendril ending in a white skull face
        const tp = vAdd(vMad(root, dir, L * .9), vMul(up, (-.25 - idx * .2) * k)), tt = vAdd(tp, vMul(dir, .25 * k)), a = proj2(vMad(root, dir, L * .3)), b = proj2(tt);
        inkPts(c, [a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5) + 10], b], Math.max(3, .06 * k * pxScale(root)), '#1a1420', [.3, .2]); const q = project(tt); if (q) sadSkull2D(c, q.x, q.y, .1 * k * q.s, sg);
      }
    } });
  }
}
function sadSkull2D(c, x, y, r, sg = 1) { c.save(); c.translate(x, y); c.scale(sg, 1); c.fillStyle = '#f4f2f6'; c.beginPath(); c.ellipse(0, -r * .1, r, r * .85, 0, 0, TAU); c.fill(); c.lineWidth = Math.max(1, r * .08); c.strokeStyle = '#141018'; c.stroke();
  c.fillStyle = '#141018'; c.beginPath(); c.moveTo(-r * .7, r * .2); c.quadraticCurveTo(0, r * 1.1, r * .7, r * .2); c.quadraticCurveTo(0, r * .5, -r * .7, r * .2); c.fill(); c.fillStyle = '#f4f2f6'; for (let i = -3; i <= 3; i++) c.fillRect(i * r * .17 - r * .05, r * .3, r * .1, r * .18); c.restore(); }

// =============================================================================================================== DAZAI OSAMU
CAST.dazai = design(SHINIGAMI, {
  name: 'Dazai Osamu', h: 1.81, body: { width: .92, limbs: .92, shoulders: 1.0, depth: .98, legs: 1.05, neck: 1.05 }, skin: '#f6dfcc', skinShade: '#d0a494',
  kosode: '#1a191e', collar: { under: '#cfe0ee', skinCol: '#cfe0ee', v0: .55, w: .42, shift: 0 },
  torsoTones: [{ col: '#cfe0ee', mask: (u, v) => .045 - Math.abs(angOf(u)) - (v < .52 ? 1 : 0) }],
  torsoDetail: (c, S, D, T, G) => dazaiTorsoDetail(c, S, D, T, G),
  sleeve: { col: SAD.col.coat, lining: '#8a7454', r0: .084, r1: .08, r2: .078, sag: .05, len: 1.0 },
  hakama: { col: '#cdbb95', r0: .098, r1: .084, r2: .076, pleats: false, ties: false },
  obi: null,
  haori: { col: SAD.col.coat, lining: '#a08a62', len: .96, sleeves: true, hem: 'none', kanji: null, open: .3, flare: .42, collarLen: .62 },
  feet: { col: '#4a2e1e', sandal: false, w: 1.05 },
  face: {
    eye: { w: 1.1, h: .25, irisR: .27, irisCol: '#5a3420', irisLight: '#9a6440', irisDark: '#1e0e06', tilt: .02, thick: 1.15, flick: .03, lashes: true, crease: true, pupilR: .34 },
    eyeSize: .37, eyeY: -.19, defaultExpr: 'smile', brow: { browW: .065, browY: .06, browCol: '#3a2418' }, headShape: { jaw: .92, chin: 1.0, width: .93 },
    hair: { col: SAD.col.dazaiHair, shadeCol: SAD.col.dazaiHairShade, gloss: true, glossCol: '#7a5440', springK: 32, springC: 5, cap: { front: .6, side: .05, back: -.85 },
      locks: () => [
        // messy, mildly wavy short hair: tufts all around flicking out at the nape
        ...lockFan(13, 1.1, 5.18, .45, (th, u, i) => ({ th, ph: .4 + .1 * Math.sin(i * 2.3), len: 1.0 + .25 * hash(i * 3), w: .42, rootR: .95, dir: dirOut(th, .1, 1.2, -.2), grav: .8, curl: [-Math.sin(th) * .95 + Math.cos(th) * .25 * (i % 2 ? 1 : -1), .15, -Math.cos(th) * .5], wave: [.18, 1.2, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .3, tip: 1.3, seg: 7, back: true, gloss: i % 4 === 1 })),
        ...lockFan(5, 2.4, 3.9, .0, (th, u, i) => ({ th, len: .75 + .2 * hash(i), w: .36, rootR: .97, dir: dirOut(th, -.4, .3, -.6), curl: [(u - .5) * .8, .5, -.2], tw: .3, tip: 1.3, back: true })),
        // bangs framing the face, some gathered at the forehead centre
        ...lockFan(3, .05, .55, .9, (th, u, i) => ({ th, len: .82 + .1 * i, w: .42, rootR: .97, dir: [.35 + u * .4, .05, 1], curl: [.9, -1.6, -.6], grav: 1.5, wave: [.25, 1, i], waveAxis: [1, 0, 0], tw: .28, tip: 1.3, front: true, gloss: i === 1 })),
        ...lockFan(3, -.55, -.05, .9, (th, u, i) => ({ th, len: .95 - .1 * i, w: .42, rootR: .97, dir: [-.75 + u * .4, .05, 1], curl: [-.9, -1.6, -.6], grav: 1.5, wave: [.25, 1, i + 3], waveAxis: [1, 0, 0], tw: .28, tip: 1.3, front: true })),
        { th: .0, ph: .95, len: .9, w: .28, rootR: .97, dir: [0, -.1, 1], curl: [.3, -1.8, -.5], grav: 1.4, tw: .3, tip: 1.4, front: true },
        ...lockFan(2, 1.05, 1.4, .3, (th, u, i) => ({ th, len: 1.3, w: .34, rootR: .97, dir: [.2, -.9, .3], curl: [-.4, 0, .1], grav: 1.1, wave: [.15, 1, i], tw: .3, tip: 1.3, front: true })),
        ...lockFan(2, -1.4, -1.05, .3, (th, u, i) => ({ th, len: 1.3, w: .34, rootR: .97, dir: [-.2, -.9, .3], curl: [.4, 0, .1], grav: 1.1, wave: [.15, 1, i + 1], tw: .3, tip: 1.3, front: true })),
      ] },
    markings: (c, HM, e, lod, D) => { if (D.eyeBandage) dazaiEyeBandage(c, HM, lod); },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => {},
  },
  extras: (S, D, F, t, parts, opt) => dazaiExtras(S, D, F, t, parts, opt),
  forms: {
    base: {}, gun: { gunDefault: 1 },
    nocoat: { haori: { none: true }, sleeve: { col: '#cfe0ee', lining: '#b0c4d4', r0: .062, r1: .058, r2: .055, sag: .03, len: 1.0, stripes: true } },
    mafia: { haori: { col: '#18161c', lining: '#2a2830', len: 1.0, sleeves: true, hem: 'none', open: .34, flare: .45, collarLen: .62 }, sleeve: { col: '#18161c', lining: '#2a2830', r0: .084, r1: .08, r2: .078, sag: .05, len: 1.0 },
      kosode: '#1a191e', collar: { under: '#f0eee8', skinCol: '#f0eee8', v0: .55, w: .42, shift: 0 }, torsoTones: [], hakama: { col: '#1c1b20', r0: .098, r1: .084, r2: .076, pleats: false, ties: false }, feet: { col: '#141216', sandal: false, w: 1.05 }, eyeBandage: true, noBolo: true },
    wounded: { wounds: 2 },
  },
});
CAST.dazai.drawHead = stdHead(CAST.dazai);
function dazaiTorsoDetail(c, S, D, T, G) {
  const s = gridScale(G); if (LIGHT.override) return;
  if (!D.noBolo) { // bolo tie: brown cords from the collar + turquoise pendant
    strokeRuns(c, surfLine(T.surf, [[.012, .99], [.008, .9], [.006, .74]], .02), lineW(s, .9), '#6a3e22'); strokeRuns(c, surfLine(T.surf, [[.988, .99], [.992, .9], [.994, .74]], .02), lineW(s, .9), '#6a3e22');
    const fr = surfFrame(T.surf, 0, .9); if (vDot(fr.n, toCam(fr.p)) > .05) { const q = proj2(fr.p), r = Math.max(2, .012 * s); c.beginPath(); c.ellipse(q[0], q[1], r, r * 1.25, 0, 0, TAU); c.fillStyle = '#3ab8b0'; c.fill(); c.lineWidth = lineW(s, .5); c.strokeStyle = '#c8b070'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(q[0] - r * .4, q[1] - r * .6, r * .35, r * .4); }
  }
  // vest buttons
  for (let i = 0; i < 4; i++) { const fr = surfFrame(T.surf, .995, .16 + i * .1); if (vDot(fr.n, toCam(fr.p)) < .1) continue; const q = proj2(fr.p); c.beginPath(); c.arc(q[0] + 2, q[1], Math.max(1, .006 * s), 0, TAU); c.fillStyle = '#3a3638'; c.fill(); }
}
function dazaiEyeBandage(c, HM, lod) { const fr = faceFrame(HM, -.45, -.12, .5, .7); decal(c, fr.p, vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = '#f4f0e6'; cc.beginPath(); cc.moveTo(-1.3, .55); cc.quadraticCurveTo(0, .7, 1.4, .35); cc.lineTo(1.4, -.5); cc.quadraticCurveTo(0, -.25, -1.3, -.35); cc.closePath(); cc.fill(); cc.strokeStyle = 'rgba(120,110,95,.7)'; cc.lineWidth = .04; for (const y of [.3, .0, -.25]) { cc.beginPath(); cc.moveTo(-1.2, y + .1); cc.quadraticCurveTo(0, y + .25, 1.3, y - .05); cc.stroke(); } cc.lineWidth = .06; cc.strokeStyle = LIGHT.ink; cc.beginPath(); cc.moveTo(-1.3, .55); cc.quadraticCurveTo(0, .7, 1.4, .35); cc.moveTo(1.4, -.5); cc.quadraticCurveTo(0, -.25, -1.3, -.35); cc.stroke(); }, .02, fr.n); }
function dazaiExtras(S, D, F, t, parts, opt) {
  const p = S.pose, k = S.B.h / 1.8, J = S.J, ban = '#f2eee2';
  // bandages: neck wrap (above the collar) and wrists (below the sleeves), with wrap lines
  parts.push({ z: camDepth(J.neck) - .03, fn: c => { const a = vAdd(J.neck, mApply(S.M.neck, [0, .01 * k, 0])), b = vLerp(J.neck, J.headBase, .45), surf = sTube([a, b], v => S.B.limbR.neck * 1.05, S.M.chest[0], 12, 3);
    drawSurf(c, sampleSurf(surf), Object.assign({ col: ban, shade: .15, borders: { v0: true, v1: true } }, opt.surf || {})); if (opt.mode !== 'flat' && !LIGHT.override) for (const f of [.35, .7]) limbRing(c, a, b, f, S.B.limbR.neck * 1.06, rgba('#9a8e78', .8), .5); } });
  for (const sd of ['L', 'R']) { const el = J['el' + sd], wr = J['wr' + sd];
    parts.push({ z: camDepth(wr) - .007, fn: c => { const a = vLerp(el, wr, .8), b = vLerp(el, wr, 1.04); e2Tube(c, [a, b], S.B.limbR.fa * .95 * 1.0, ban, opt, { hint: S.M.chest[2] }); if (opt.mode !== 'flat' && !LIGHT.override) for (const f of [.35, .7]) limbRing(c, a, b, f, S.B.limbR.fa * .96, rgba('#9a8e78', .8), .5); } }); }
  // trench coat: lapels + belt hanging loose at the sides
  if (!(D.haori && D.haori.none)) dazaiCoatBits(S, D, F, t, parts, opt);
  const gun = p.gun != null ? p.gun : (D.gunDefault || 0); if (gun > .5) { const sd = p.gunHand || 'R'; const hg = handGeom(S, sd, p['h' + sd] || 'grip'); if (hg) parts.push({ z: camDepth(hg.palmC) - .02, fn: c => dazaiGun(c, S, hg, k, opt) }); }
  woundParts(S, D, parts, opt, D.wounds || p.wounds || 0);
}
function dazaiCoatBits(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, T = torsoModel(S, D, .034 * k), col = (D.haori && D.haori.col) || SAD.col.coat;
  parts.push({ z: camDepth(S.J.neck) - .09, fn: c => { // notched lapels on both sides of the opening
    for (const sg of [1, -1]) { const pts = [T.ringAt(.98, sg * .5), T.ringAt(.86, sg * .95), T.ringAt(.66, sg * .5), T.ringAt(.52, sg * .33), T.ringAt(.78, sg * .36)].map(q => vAdd(q, vMul(S.M.chest[2], .006 * k)));
      const fc = vDot(S.M.chest[2], toCam(pts[0])); if (fc < -.1) continue; fill3D(c, pts, opt.mode === 'flat' ? opt.col : (LIGHT.override ? LIGHT.override.fill : tones(col).base), opt.mode === 'flat' ? 0 : lineW(pxScale(pts[0]), .6)); }
  } });
  for (const sg of [1, -1]) { // untied belt ends hanging from the waist loops
    const root = T.ringAt(.04, sg * 1.4), lag = springLag(F, t, s2 => vAdd(torsoModel(s2, D, .034 * k).ringAt(.04, sg * 1.4), [0, -.35 * k, 0]), 30, 4, .5, 'belt' + sg, 1.2);
    const spine = [], wv = []; for (let i = 0; i <= 6; i++) { const v = i / 6; spine.push(vAdd(vAdd(root, [0, -.38 * k * v, 0]), vMul(lag, v * v))); wv.push(vMul(S.M.pelvis[2], .04 * k)); }
    parts.push({ z: camDepth(spine[3]) - .05, fn: c => drawSurf(c, sampleSurf(sRibbon(spine, wv, 2, 8)), Object.assign({ col, side: 'both', backCol: shadeHex(col, -.2), shade: .1 }, opt.surf || {})) });
  }
}
function dazaiGun(c, S, hg, k, opt) { // compact dark pistol: slide along -Y (knuckle direction) above the fist, grip through the palm
  const fwd = vMul(hg.Y, -1), up = vNorm(hg.Z), side = vNorm(vCross(fwd, up)), s = pxScale(hg.palmC), lw = lineW(s, .6);
  const slideC = vAdd(hg.palmC, vAdd(vMul(fwd, .055 * k), vMul(up, .05 * k))), gripC = vAdd(hg.palmC, vMul(up, .0));
  sadBox(c, gripC, [fwd, up, side], [.018 * k, .045 * k, .013 * k], '#2a2a30', opt, lw);
  sadBox(c, slideC, [fwd, up, side], [.085 * k, .016 * k, .013 * k], '#3a3a42', opt, lw);
  if (opt.mode !== 'flat' && !LIGHT.override) { const m = project(vMad(slideC, fwd, .085 * k)); if (m) { c.beginPath(); c.arc(m.x, m.y, Math.max(1, .006 * k * m.s), 0, TAU); c.fillStyle = '#000'; c.fill(); } }
}

// =============================================================================================================== SIGNATURE POSES
Object.assign(POSES, {
  // Shinji: lanky, slouched, theatrical
  shinji_slouch: { sp: -.06, ss: .05, hp: .08, hr: .14, aL: [.2, .3, .2], eL: .3, hL: 'relax', aR: [.25, .45, -.2], eR: .5, hR: 'relax', lL: [.15, .14, .3], kL: .25, lR: [-.05, .12, -.25], kR: .06, sword: { sheathed: true }, face: { mouth: 'grin', mouthOpen: .3, lid: .3, eye: .6 } },
  shinji_draw: { sp: .12, st: .5, hp: .1, aR: [.95, -.85, 0], eR: 1.2, hR: 'grip', aL: [.5, -.5, 0], eL: 1.3, hL: 'grip', sword: { hand: 'R', dir: [.7, .15, -.68] }, lL: [.45, .2, .3], kL: .6, lR: [-.35, .15, -.3], kR: .35 },
  shinji_taore: { sp: .02, hp: -.05, hy: .2, aR: [1.55, .35, 0], eR: .25, hR: 'point', sword: { hand: 'R', dir: [.05, -1, .1], ringSpin: true }, aL: [.25, .45, 0], eL: .4, hL: 'relax', lL: [.15, .14, .2], kL: .15, lR: [-.08, .12, -.2], face: { mouth: 'grin', mouthOpen: .5, lid: .35, eye: .7 } },
  shinji_spin: { sp: .05, st: -.3, hp: .05, aR: [1.4, .7, 0], eR: .2, hR: 'point', sword: { hand: 'R', dir: [1, 0, 0], ringSpin: true }, aL: [.6, -.3, 0], eL: 1.2, hL: 'open', lL: [.3, .2, .3], kL: .4, lR: [-.25, .15, -.2], kR: .15, face: { mouth: 'grin', mouthOpen: .45, lid: .3 } },
  shinji_slash: { sp: .45, st: -.6, hp: .15, aR: [1.35, 1.1, 0], eR: .08, hR: 'grip', sword: { hand: 'R', dir: [.95, -.15, .25] }, aL: [.6, -.5, 0], eL: 1.0, hL: 'open', lL: [.95, .25, .3], kL: 1.1, lR: [-.7, .2, -.3], kR: .3, face: { mouth: 'grin', mouthOpen: .6, lid: .4, eye: .8 } },
  shinji_mask: { sp: .1, hp: .15, aL: [2.1, -.15, 0], eL: 2.0, hL: 'claw', wL: [.4, 0], aR: [.5, .45, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [.2, -.9, .3] }, lL: [.35, .2, .3], kL: .45, lR: [-.25, .15, -.2], kR: .2, face: { mouth: 'grin', mouthOpen: .8, eye: .9, lid: .3 } },
  shinji_cero: { sp: .3, st: -.4, hp: .1, aR: [1.5, .1, 0], eR: .05, hR: 'fist', aL: [.6, -.2, 0], eL: 1.0, hL: 'grip', sword: { hand: 'L', dir: [.4, -.8, .4] }, lL: [.7, .25, .3], kL: .8, lR: [-.55, .2, -.3], kR: .3, face: { mouth: 'shout', mouthOpen: .8, lid: .4 } },
  shinji_upside: { sp: -.1, hp: .05, aR: [.9, -.4, 0], eR: 1.6, hR: 'point', aL: [.3, .5, 0], eL: .3, hL: 'relax', sword: { sheathed: true }, lL: [.12, .1, .3], kL: .1, face: { mouth: 'grin', mouthOpen: .35, lid: .25, eye: .65 } },
  shinji_bankai: { sp: -.05, hp: -.15, aR: [2.6, .2, 0], eR: .3, hR: 'point', sword: { hand: 'R', dir: [0, 1, .1], ringSpin: true }, aL: [.4, .6, 0], eL: .3, hL: 'open', lL: [.2, .18, .3], kL: .2, lR: [-.1, .15, -.2], face: { mouth: 'grin', mouthOpen: .55, lid: .35, eye: .7 }, flower: 1 },
  // Aizen: still, upright, minimal effort
  aizen_stand: { sp: -.02, hp: -.04, aL: [.08, .55, 0], eL: .2, hL: 'relax', aR: [.08, .55, 0], eR: .2, hR: 'relax', lL: [.03, .07, .1], lR: [.02, .07, -.1], sword: { sheathed: true }, face: { eye: .75, lid: .15, mouth: 'smirk' } },
  aizen_hair: { sp: -.05, hp: -.15, aR: [2.55, -.4, 0], eR: 2.3, hR: 'open', wR: [.5, 0], aL: [.1, .5, 0], eL: .25, sword: { sheathed: true }, glasses: false, face: { eye: .6, lid: .35, mouth: 'smirk', shadow: .4 } },
  aizen_draw: { sp: .02, st: .3, hp: .05, aR: [.9, -.7, 0], eR: 1.25, hR: 'grip', aL: [.35, -.4, 0], eL: 1.2, hL: 'grip', sword: { hand: 'R', dir: [.75, .1, -.6] }, face: { eye: .7, lid: .2, mouth: 'line' } },
  aizen_point: { sp: 0, hp: .05, aR: [1.5, .15, 0], eR: .05, hR: 'grip', sword: { hand: 'R', dir: [.05, .02, 1] }, aL: [.08, .5, 0], eL: .25, lL: [.05, .07, .1], lR: [-.05, .07, -.1], face: { eye: .7, lid: .25, mouth: 'smirk' } },
  aizen_shatter: { sp: 0, hp: .1, aR: [1.3, -.1, 0], eR: .9, hR: 'grip', sword: { hand: 'R', dir: [0, .99, .1] }, aL: [1.2, -.5, 0], eL: 1.5, hL: 'flat', face: { eye: .55, lid: .3, mouth: 'line' } },
  aizen_block: { sp: -.02, hp: 0, aL: [1.4, -.2, 0], eL: .15, hL: 'point', wL: [-.2, 0], aR: [.1, .5, 0], eR: .2, hR: 'relax', sword: { sheathed: true }, face: { eye: .6, lid: .2, mouth: 'smirk' } },
  aizen_kido: { sp: .03, st: -.2, aL: [1.5, .2, 0], eL: .1, hL: 'open', wL: [-.4, 0], aR: [.12, .5, 0], eR: .25, hR: 'relax', sword: { sheathed: true }, face: { eye: .7, lid: .3, mouth: 'line' } },
  aizen_slash: { sp: .3, st: -.5, hp: .1, aR: [1.3, 1.25, 0], eR: .06, hR: 'grip', sword: { hand: 'R', dir: [.98, -.1, .1] }, aL: [.15, .4, 0], eL: .3, lL: [.5, .2, .2], kL: .55, lR: [-.4, .15, -.2], kR: .2, face: { eye: .7, lid: .3, mouth: 'line' } },
  aizen_float: { ground: false, sp: -.05, hp: -.05, aL: [.35, .7, 0], eL: .3, hL: 'open', aR: [.35, .7, 0], eR: .3, hR: 'relax', lL: [.15, .05, .1], kL: .3, lR: [.05, .05, -.1], kR: .45, fL: .6, fR: .7, face: { eye: .7, lid: .2, mouth: 'smirk' } },
  aizen_laugh: { sp: -.2, hp: -.45, aR: [.55, .75, 0], eR: .7, hR: 'open', aL: [.55, .75, 0], eL: .7, hL: 'open', face: { mouth: 'laugh', mouthOpen: .8, eye: .3, closed: .6 } },
  // Dazai: loose, playful, hands in pockets
  dazai_pockets: { sp: -.05, ss: -.04, hp: .06, hr: -.1, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid', lL: [.1, .1, .3], kL: .15, lR: [-.04, .08, -.2], kR: .05, face: { mouth: 'smile', eye: .6, lid: .05 } },
  dazai_touch: { sp: .12, st: -.25, hp: .08, aR: [1.45, .1, 0], eR: .25, hR: 'open', wR: [-.5, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.4, .2, .3], kL: .45, lR: [-.3, .15, -.2], kR: .2, face: { mouth: 'smile', eye: .55, lid: .1 } },
  dazai_aim: { sp: .02, st: -.4, hp: .05, aR: [1.5, .15, 0], eR: .02, hR: 'grip', gun: 1, aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.15, .15, .3], kL: .1, lR: [-.08, .12, -.2], face: { mouth: 'line', eye: .6, lid: .25 } },
  dazai_aimTwo: { sp: .05, st: -.2, hp: .1, aR: [1.45, .1, 0], eR: .1, hR: 'grip', gun: 1, aL: [1.4, -.2, 0], eL: .5, hL: 'grip', lL: [.3, .2, .3], kL: .35, lR: [-.25, .15, -.2], kR: .2, face: { mouth: 'line', eye: .7, lid: .3 } },
  dazai_wave: { sp: -.04, hp: -.05, hr: .12, aR: [2.5, .3, 0], eR: .6, hR: 'open', aL: [.16, .3, .35], eL: .45, hL: 'hid', face: { mouth: 'laugh', mouthOpen: .5, eye: .25, closed: .8 } },
  dazai_lean: { sp: -.15, ss: .1, hp: -.1, hy: .2, aR: [.3, -.6, .4], eR: 2.0, hR: 'relax', aL: [.3, -.5, -.4], eL: 2.0, hL: 'relax', lL: [.25, .1, .4], kL: .3, lR: [-.1, .06, -.2], kR: .05, face: { mouth: 'smile', eye: .45, lid: .0 } },
  dazai_dodge: { sp: -.35, ss: .3, hp: -.2, aR: [.9, 1.0, 0], eR: .5, hR: 'open', aL: [1.1, .9, 0], eL: .4, hL: 'open', lL: [.6, .3, .3], kL: .8, lR: [-.4, .25, -.3], kR: .6, face: { mouth: 'smile', eye: .9 } },
  dazai_grabWrist: { sp: .15, st: -.35, hp: .1, aR: [1.3, -.05, 0], eR: .35, hR: 'grip', aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.35, .2, .3], kL: .4, lR: [-.25, .15, -.2], kR: .2, face: { mouth: 'smirk', eye: .55, lid: .3, shadow: .4 } },
  dazai_dark: { sp: .08, hp: .3, aL: [.1, .4, 0], eL: .3, hL: 'relax', aR: [.1, .4, 0], eR: .3, hR: 'relax', face: { mouth: 'line', eye: .5, lid: .35, shadow: .9, pupil: .6 } },
});
Object.assign(POSES, {
  shinji_swipe: { sp: .05, hp: .2, hy: .2, aL: [2.2, -.6, 0], eL: 2.15, hL: 'claw', wL: [.5, .2], aR: [.4, .5, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [.2, -.9, .3] }, lL: [.3, .2, .3], kL: .4, lR: [-.2, .15, -.2], kR: .2, face: { mouth: 'grin', mouthOpen: .9, eye: 1.0, lid: .4 } },
  shinji_shoulder: { sp: -.05, hp: .05, hr: .12, aR: [2.2, -.2, 0], eR: 2.3, hR: 'grip', sword: { hand: 'R', dir: [.3, .35, -.88] }, aL: [.2, .4, .3], eL: .4, hL: 'relax', lL: [.15, .14, .3], kL: .2, face: { mouth: 'grin', mouthOpen: .35, lid: .3, eye: .6 } },
  aizen_bow: { sp: .55, hp: .25, aL: [.25, .2, 0], eL: .5, hL: 'relax', aR: [1.0, -.3, 0], eR: 1.4, hR: 'flat', sword: { sheathed: true }, lL: [.08, .07, .1], lR: [.02, .07, -.1], face: { eye: .5, lid: .1, mouth: 'smile' } },
  aizen_handshake: { sp: .05, hp: .08, aR: [1.0, .05, 0], eR: .5, hR: 'flat', wR: [0, .3], aL: [.08, .5, 0], eL: .25, sword: { sheathed: true }, face: { eye: .65, lid: .15, mouth: 'smile' } },
  aizen_palmUp: { sp: .02, hp: .05, aL: [1.1, .15, -1.4], eL: .9, hL: 'open', wL: [-.3, 0], aR: [.1, .5, 0], eR: .25, sword: { sheathed: true }, face: { eye: .6, lid: .25, mouth: 'smirk' } },
  aizen_kneelPolite: { sp: .15, hp: .2, aL: [.2, .2, 0], eL: .6, hL: 'flat', aR: [.2, .2, 0], eR: .6, hR: 'flat', lL: [1.5, .15, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2, sword: { sheathed: true }, face: { eye: .55, mouth: 'smile' } },
  dazai_floatWater: { ground: false, pitch: -HP, sp: -.05, hp: -.2, aL: [1.5, 1.55, 0], eL: .1, hL: 'open', aR: [1.5, 1.55, 0], eR: .1, hR: 'open', lL: [.05, .15, .2], kL: .1, lR: [.05, .15, -.2], kR: .1, face: { eye: 0, closed: 1, mouth: 'smile' } },
  dazai_bow: { sp: .45, hp: .2, aL: [.25, .1, 0], eL: .4, hL: 'relax', aR: [.9, -.6, 0], eR: 1.6, hR: 'flat', face: { eye: .4, mouth: 'smile' } },
  dazai_palmChest: { sp: .1, st: -.2, hp: .1, aR: [1.35, .05, 0], eR: .45, hR: 'flat', wR: [-.9, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.3, .2, .3], kL: .35, lR: [-.2, .15, -.2], kR: .15, face: { mouth: 'smile', eye: .5, lid: .15 } },
  dazai_smileClosed: { sp: -.04, hp: -.02, hr: .15, aL: [.16, .3, .35], eL: .45, hL: 'hid', aR: [.16, .3, -.35], eR: .45, hR: 'hid', face: { mouth: 'smile', eye: 0, closedUp: 1, closed: 1 } },
  dazai_blank: { sp: .02, hp: .12, aL: [.08, .4, 0], eL: .15, hL: 'relax', aR: [.08, .4, 0], eR: .15, hR: 'relax', face: { mouth: 'line', eye: .7, lid: .1, pupil: .55, shadow: .5 } },
  dazai_stairs: { sp: .2, hp: .1, aL: [.3, .3, .2], eL: .5, hL: 'relax', aR: [.35, PI, 0], eR: .3, hR: 'relax', lL: [.9, .1, .1], kL: 1.2, lR: [-.2, .08, 0], kR: .3, face: { mouth: 'line', eye: .55, lid: .1 } },
});
Object.assign(POSES, {   // sitting on an edge (legs dangling) - give pos y = edge height, ground:false
  dazai_sit: { ground: false, sp: .1, hp: .15, aL: [.35, -.2, 0], eL: 1.3, hL: 'relax', aR: [.35, -.25, 0], eR: 1.4, hR: 'relax', lL: [1.45, .12, .1], kL: 1.35, lR: [1.4, .12, -.1], kR: 1.55, drop: -.48, face: { mouth: 'smile', eye: .55 } },
  aizen_sitPolite: { ground: false, sp: 0, hp: .05, aL: [.45, -.1, 0], eL: 1.1, hL: 'flat', aR: [.45, -.1, 0], eR: 1.1, hR: 'flat', lL: [1.5, .08, 0], kL: 1.5, lR: [1.5, .08, 0], kR: 1.5, drop: -.5, sword: { sheathed: true }, face: { eye: .6, mouth: 'smile' } },
  aizen_sitOffer: { ground: false, sp: .05, hp: .05, st: -.3, aR: [1.2, -.3, 0], eR: .4, hR: 'flat', wR: [0, .3], aL: [.45, -.1, 0], eL: 1.1, hL: 'flat', lL: [1.5, .08, 0], kL: 1.5, lR: [1.5, .08, 0], kR: 1.5, drop: -.5, sword: { sheathed: true }, face: { eye: .6, mouth: 'smile' } },
  dazai_sitShake: { ground: false, sp: .1, st: .3, hp: .1, aL: [1.2, .2, 0], eL: .4, hL: 'flat', aR: [.35, -.25, 0], eR: 1.4, hR: 'relax', lL: [1.45, .12, .1], kL: 1.35, lR: [1.4, .12, -.1], kR: 1.55, drop: -.48, face: { mouth: 'smile', eye: .5 } },
});
SIGNATURE.shinji = ['shinji_slouch', 'shinji_shoulder', 'shinji_swipe', 'shinji_draw', 'shinji_taore', 'shinji_spin', 'shinji_slash', 'shinji_mask', 'shinji_cero', 'shinji_upside', 'shinji_bankai'];
SIGNATURE.aizen = ['aizen_stand', 'aizen_bow', 'aizen_handshake', 'aizen_palmUp', 'aizen_kneelPolite', 'aizen_hair', 'aizen_draw', 'aizen_point', 'aizen_shatter', 'aizen_block', 'aizen_kido', 'aizen_slash', 'aizen_float', 'aizen_laugh'];
SIGNATURE_FORM.shinji = 'shikai'; SIGNATURE_FORM.aizen = 'base'; SIGNATURE_FORM.dazai = 'base';
SIGNATURE.dazai = ['dazai_pockets', 'dazai_floatWater', 'dazai_bow', 'dazai_palmChest', 'dazai_smileClosed', 'dazai_blank', 'dazai_stairs', 'dazai_touch', 'dazai_aim', 'dazai_aimTwo', 'dazai_wave', 'dazai_lean', 'dazai_dodge', 'dazai_grabWrist', 'dazai_dark'];
