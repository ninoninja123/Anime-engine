/* death-battle engine - chars_bc.js (agent E2) : BLACK CLOVER - Mereoleona Vermillion + Nozel Silva, and the E2 KIT
   (shared helpers used by chars_fire.js too; this file loads first: chars_bc < chars_fire).
   Sources (checked 2026-10-31): blackclover.fandom.com MediaWiki API (pages Mereoleona_Vermillion, Nozel_Silva, Fire_Magic,
   Mercury_Magic, Calidus_Brachium*, Hellfire_Incarnate, Exercitus_Leonum, Mana_Zone, Silver_* spells).
   - Mereoleona: 178 cm, blue eyes, long wavy vermilion hair, red markings around the eyes, one sharp canine; white tunic
     under a long dark-blue high-collared shirt with striped trim, sleeves rolled to the elbows, purple sash, white trousers,
     long red cape.  Spells: Calidus Brachium (flaming fist), Mana Zone: Calidus Brachium Barrage, Calidus Brachium
     Purgatory (BLUE flames), ... Purgatory: Abyss / Flame Burial, Hellfire Incarnate (body becomes fire), Ultimate Magic:
     Exercitus Leonum.  NOTE: 'Leo Rugiens' (fire lion) is Fuegoleon's spell; the lion motif used here (fxCrimsonLion)
     is an interpretation (Crimson Lion squad + Calidus Brachium as a lion-headed fist), marked as such in README_fire_bc.md.
   - Nozel: slender, narrow purple eyes, small brows, silver-white hair: long straight at the lower back, top swept back into
     a long spiky fringe, a braid between the eyes down to the nose tip with a House Silva pendant; high-collared loose shirt
     closed by a gold band, loose pants banded below the knee, sandals; Silver Eagles robe = short fur mantle with frilled
     panels to the elbow + robe to the feet; grimoire case on the left hip.  Spells (Mercury Magic): Silver Rain, Silver
     Spear, Silver Bullet, Silver Blade, Silver Shining Regal Spear (palm beam), Silver Star of Execution (cage),
     Silver Guardian (mercury armour coating), Silver Eagle (giant mercury eagle).  NOTE: "Valkyrie Armor" is Noelle's
     (Water Magic), not Nozel's; the armoured form here is Silver Guardian with eagle-wing robe fins (post-timeskip robe).
   Colours: Mereoleona fire = CRIMSON-MAGENTA (#ff3d6e / #c4125a, violet-blue for Purgatory) - distinct from Benimaru's
   white-gold/vermilion and Rengoku's orange-gold.                                                                       */
'use strict';
// =============================================================================================== E2 KIT (shared)
// overlay drawn inside an eye (after the stock eye): fn(cc, icx, icy, ir, open) in eye-local units, clipped to the eye white
function e2EyeOverlay(c, HM, D, e, sg, fn) {
  if (LIGHT.override) return; const fz = D.face || {}; const st = Object.assign({ w: 1, h: .42, irisR: .3 }, fz.eye || {});
  const open = clamp(e.eye == null ? 1 : e.eye, 0, 1.4); if (e.closed || open < .15) return;
  const ex = fz.eyeX || .44, ey = fz.eyeY || -.2, esz = fz.eyeSize || .36, fr = faceFrame(HM, sg * ex * 1.05, ey, fz.flat == null ? .5 : fz.flat, esz);
  const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1), mirror = sg < 0;
  decal(c, fr.p, tu, fr.tv, cc => {
    const lid = e.lid || 0, w = st.w || 1, h = (st.h || .42) * open, tilt = st.tilt || 0;
    const ix = -.5 * w, iy = -.02 + lid * .1, ox = .52 * w, oy = .06 + tilt - lid * .02;
    const topY = x => { const u = (x - ix) / (ox - ix); return lerp(iy, oy, u) + Math.sin(Math.PI * Math.pow(clamp(u, 0, 1), st.round ? .9 : .75)) * h * (1 - lid * .45 * (1 - u)) - lid * .14 * (1 - u) * open; };
    const botY = x => { const u = (x - ix) / (ox - ix); return lerp(iy, oy, u) - Math.sin(Math.PI * clamp(u, 0, 1)) * (st.lowerH || .16) * Math.max(.35, open) - .02; };
    cc.beginPath(); for (let i = 0; i <= 16; i++) { const x = lerp(ix, ox, i / 16); i ? cc.lineTo(x, topY(x)) : cc.moveTo(x, topY(x)); } for (let i = 16; i >= 0; i--) { const x = lerp(ix, ox, i / 16); cc.lineTo(x, botY(x)); } cc.closePath(); cc.save(); cc.clip();
    const lk = e.look || [0, 0], ir = (st.irisR || .3) * (e.irisK || 1);
    fn(cc, (mirror ? -1 : 1) * lk[0] * .3 + (st.irisX || 0), -.02 + lk[1] * .15 + (st.irisY || 0), ir, open);
    cc.restore();
  }, -0.15, fr.n);
}
// tube helper in world space, drawn as toon surface
function e2Tube(c, pts, r, col, opt, extra = {}) { const surf = sTube(pts, typeof r === 'function' ? r : (v => r), extra.hint || [1, 0, 0], extra.nu || 10, extra.nv || 4, extra.tube || {}); drawSurf(c, sampleSurf(surf), Object.assign({ col, shade: .1 }, extra.surf || {}, opt.surf || {})); }
// boots: shaft from a fraction of the shin down over the ankle (trousers tucked in)
function e2Boots(S, D, parts, opt, b = {}) {
  const k = S.B.h / 1.8;
  for (const sd of ['L', 'R']) {
    const kn = S.J['kn' + sd], an = S.J['an' + sd], top = vLerp(kn, an, b.top == null ? .3 : b.top), bot = vAdd(an, mApply(S.M['shin' + sd], [0, -.03 * k, 0]));
    parts.push({ z: Math.min(camDepth(top), camDepth(an)) - .03, fn: c => { e2Tube(c, [top, vLerp(top, bot, .6), bot], v => (b.r || .058) * k * lerp(1.06, .95, v), b.col || '#16141a', opt, { hint: S.M['shin' + sd][0], surf: { borders: { v0: true, v1: false } } });
      if (b.cuff && opt.mode !== 'flat') e2Tube(c, [top, vLerp(top, bot, .1)], (b.r || .058) * k * 1.12, b.cuff, opt, { hint: S.M['shin' + sd][0] }); } });
  }
}
// bare shin from below the knee band to the ankle (sandals) + band ring
function e2Shins(S, D, parts, opt, b = {}) {
  const k = S.B.h / 1.8;
  for (const sd of ['L', 'R']) {
    const kn = S.J['kn' + sd], an = S.J['an' + sd], top = vLerp(kn, an, b.top == null ? .16 : b.top);
    parts.push({ z: Math.min(camDepth(top), camDepth(an)) - .03, fn: c => { e2Tube(c, [top, vLerp(top, an, .55), an], v => (b.r || .052) * k * lerp(1.05, .78, v) * (1 + .12 * Math.sin(clamp(v * 1.6, 0, 1) * Math.PI)), D.skin, opt, { hint: S.M['shin' + sd][0], surf: { shadeCol: D.skinShade } });
      if (b.band) e2Tube(c, [vLerp(kn, an, (b.top || .16) - .05), vLerp(kn, an, (b.top || .16) + .03)], (b.bandR || .07) * k, b.band, opt, { hint: S.M['shin' + sd][0] }); } });
  }
}
// second coat-like cloth (haori machinery with its own spec): mode 'skirt' (hip -> hem only) or 'full'; u range for asymmetry
function e2CoatSurf(S, D, F, t, spec, mode, u0 = 0, u1 = 1) {
  const D2 = Object.assign({}, D, { haori: spec }), base = haoriSurf(S, D2, F, t), v0 = mode === 'skirt' ? .42 : 0;
  return { nu: 34, nv: mode === 'skirt' ? 10 : 16, flip: true, fn: (u, v) => base.fn(lerp(u0, u1, u), lerp(v0, 1, v)) };
}
function e2Coat(S, D, F, t, parts, opt, spec, mode = 'skirt', u0 = 0, u1 = 1) {
  const zT = camDepth(vLerp(S.J.pelvis, S.J.neck, mode === 'skirt' ? .1 : .5));
  for (const pass of ['back', 'front']) parts.push({ z: pass === 'back' ? zT + .22 : zT - (spec.zFront || .05), fn: c => {
    const surf = e2CoatSurf(S, D, F, t, spec, mode, u0, u1), G = sampleSurf(surf);
    drawSurf(c, G, Object.assign({ col: spec.col, backCol: spec.lining || shadeHex(spec.col, -.35), side: pass, shade: .06, borders: { v0: mode !== 'skirt', v1: true, u0: true, u1: true }, pattern: spec.pattern ? (cc, G2, sg) => spec.pattern(cc, surf, G2, sg) : null }, opt.surf || {}));
    if (opt.mode === 'flat' || pass !== 'front') return; const s = gridScale(G), lw = lineW(s, .5);
    for (const uu of [.25, .4, .6, .75]) { const uv = []; for (let i = 0; i <= 6; i++) uv.push([uu + .01 * Math.sin(i), .3 + i / 6 * .65]); strokeRuns(c, surfLine(surf, uv, .15), lw * .8, LIGHT.ink, [.6, .2]); }
  } });
}
// trim stripe band along the front edges / hem of a coat surface (pattern callback factory)
function e2TrimPattern(col, col2, w = .03) {
  return (c, surf, G, sg) => { if (sg < 0) return; const s = gridScale(G);
    for (const [u, side] of [[w * .5, 1], [1 - w * .5, -1]]) { const uv = []; for (let i = 0; i <= 12; i++) uv.push([u, i / 12]); strokeRuns(c, surfLine(surf, uv, 0), Math.max(1.5, s * .018), col); if (col2) { const uv2 = uv.map(q => [q[0] + side * w * .6, q[1]]); strokeRuns(c, surfLine(surf, uv2, 0), Math.max(1, s * .007), col2); } }
    const uv = []; for (let i = 0; i <= 30; i++) uv.push([i / 30, .97]); strokeRuns(c, surfLine(surf, uv, 0), Math.max(1.5, s * .02), col); };
}
// high standing collar (ring on top of the torso)
function e2HighCollar(S, D, parts, opt, col, h = .06, open = .1, trim = null) {
  const k = S.B.h / 1.8; parts.push({ z: camDepth(S.J.neck) - .035, fn: c => { const T = torsoModel(S, D, .028 * k); const surf = { nu: 22, nv: 2, wrapU: false, u0: open, u1: 1 - open, fn: (u, v) => vAdd(T.ringAt(.985, lerp(open, 1 - open, u) * TAU, (.016 + .01 * v) * k), [0, v * h * k, 0]) };
    drawSurf(c, sampleSurf(surf), Object.assign({ col, side: 'both', backCol: shadeHex(col, -.3), shade: .05, borders: { u0: true, u1: true, v0: false, v1: true } }, opt.surf || {}));
    if (trim && opt.mode !== 'flat') { const uv = []; for (let i = 0; i <= 20; i++) uv.push([i / 20, .85]); strokeRuns(c, surfLine(surf, uv, -1), Math.max(1.2, pxScale(S.J.neck) * .008), trim); } } });
}
// soft bust volume (two merged ellipsoids in the top colour) - female characters
function e2Bust(S, D, parts, opt, b = {}) {
  const k = S.B.h / 1.8, M = S.M.chest;
  for (const sg of [1, -1]) { const T = torsoModel(S, D); const p = T.ringAt(b.v || .62, sg * (b.th || .36), -.012 * k);
    parts.push({ z: camDepth(S.J.abd) + .035, fn: c => { const surf = sEllipsoid(vAdd(p, mApply(M, [0, 0, -.004 * k])), [M[0], M[1], M[2]], [(b.rx || .058) * k, (b.ry || .052) * k, (b.rz || .04) * k], .9, 12, 8); drawSurf(c, sampleSurf(surf), Object.assign({ col: b.col || D.kosode, shade: .14, inkW: .55, rim: true }, opt.surf || {})); } }); }
}
// floating grimoire (Black Clover): pose fields grim (0..1 open) and grimSide ('L'|'R'). Cover colour from design.grimoire
function e2Grimoire(S, D, F, t, parts, opt) {
  const p = S.pose, op = p.grim || 0; if (op <= .02 || !D.grimoire) return; const gr = D.grimoire, k = S.B.h / 1.8, sd = p.grimSide || 'L', sg = sd === 'L' ? 1 : -1;
  const M = S.M.chest, hand = S.J['hand' + sd];
  const c0 = vAdd(hand, vAdd(vMul(M[0], sg * .2 * k), vAdd([0, (.12 + .03 * Math.sin(t * 2.4)) * k, 0], vMul(M[2], .12 * k))));
  const facing = vNorm(vAdd(vAdd(vMul(M[2], .5), vMul(toCam(c0), .8)), [0, .35, 0])), right = vNorm(vCross([0, 1, 0], facing)), up = vNorm(vCross(facing, right));
  const ang = lerp(.05, 1.25, op), W2 = .11 * k, H2 = .15 * k;
  const page = (s, a, inset) => { const d = vNorm(vAdd(vMul(right, s * Math.cos(a)), vMul(facing, Math.sin(a)))); const w = W2 * (1 - inset * .12), hh = H2 * (1 - inset * .12); return [vAdd(c0, vMul(up, hh)), vAdd(vAdd(c0, vMul(up, hh)), vMul(d, w)), vAdd(vSub(c0, vMul(up, hh)), vMul(d, w)), vSub(c0, vMul(up, hh))]; };
  parts.push({ z: camDepth(c0) - .01, fn: c => {
    const s = pxScale(c0), lw = lineW(s, .7), flat = opt.mode === 'flat';
    for (const sgn of [-1, 1]) fill3D(c, page(sgn, Math.PI * .5 - ang, 0), flat ? opt.col : tones(gr.col).base, flat ? 0 : lw);
    if (!flat) { for (let i = 0; i < 4; i++) { const sgn = i % 2 ? 1 : -1; fill3D(c, page(sgn, Math.PI * .5 - ang * (.97 - (i >> 1) * .04), 1), LIGHT.override ? LIGHT.override.fill : (op > .5 ? '#fff6dc' : '#efe6d0'), lw * .5); }
      if (op > .5 && !LIGHT.override) for (const sgn of [-1, 1]) { const P4 = page(sgn, Math.PI * .5 - ang * .97, 1); c.strokeStyle = rgba(gr.glow || '#ffd890', .9); c.lineWidth = Math.max(1, lw * .6); for (let r = 1; r < 7; r++) { const v = r / 7; const a0 = proj2(vLerp(vLerp(P4[0], P4[3], v), vLerp(P4[1], P4[2], v), .15)), a1 = proj2(vLerp(vLerp(P4[0], P4[3], v), vLerp(P4[1], P4[2], v), .15 + .7 * hash(r + sgn * 9))); c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.stroke(); } } }
    // three-leaf clover emblem on the front cover (visible when nearly closed)
    if (!flat && op < .5) { const q = proj2(vAdd(c0, vMul(facing, .01 * k))); c.fillStyle = gr.emblem || '#e8c860'; for (let i = 0; i < 3; i++) { const an = i / 3 * TAU - HP; c.beginPath(); c.arc(q[0] + Math.cos(an) * .025 * k * s, q[1] + Math.sin(an) * .025 * k * s, .022 * k * s, 0, TAU); c.fill(); } }
  } });
}
// tiny pendant / gem in world space
function e2Gem(c, p, r, col, opt) { const q = project(p); if (!q) return; const rr = r * q.s; c.beginPath(); c.moveTo(q.x, q.y - rr); c.lineTo(q.x + rr * .7, q.y); c.lineTo(q.x, q.y + rr * 1.1); c.lineTo(q.x - rr * .7, q.y); c.closePath(); c.fillStyle = opt.mode === 'flat' ? opt.col : col; c.fill(); if (opt.mode !== 'flat') { c.lineWidth = lineW(q.s, .5); c.strokeStyle = LIGHT.ink; c.stroke(); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(q.x - rr * .25, q.y - rr * .45, rr * .22, rr * .3); } }
// custom body proportions on top of makeBody (ring overrides, multipliers)
function e2Body(D, f) { const B = makeBody(D); f(B); D._body = B; return D; }

// =============================================================================================== MEREOLEONA VERMILLION
CAST.mereoleona = design(SHINIGAMI, {
  name: 'Mereoleona Vermillion', h: 1.78, body: { width: 1.0, limbs: 1.0, shoulders: .98, neck: .95 }, skin: '#f6d8c4', skinShade: '#d8a090',
  kosode: '#1f2a4c', collar: { under: '#f1eee6', skinCol: '#f3dccb', v0: .7, w: .42, shift: 0 },
  sleeve: { col: '#1f2a4c', lining: '#c8b48a', r0: .066, r1: .07, r2: .082, sag: .02, len: .14 },
  hakama: { col: '#ecebe4', r0: .098, r1: .08, r2: .07, pleats: false, ties: false },
  obi: { col: '#6a3a9a', v0: .04, v1: .15 },
  haori: { col: '#c81e2c', lining: '#8a121c', len: 1.12, sleeves: false, hem: 'none', open: 1.1, flare: .55, collarLen: .15 },
  feet: { col: '#3a2a24', sandal: false, w: 1.05 },
  grimoire: { col: '#9a2a2a', emblem: '#e8c860', glow: '#ff7aa0' },
  face: {
    eye: { w: 1.12, h: .3, irisR: .27, irisCol: '#3a78d8', irisLight: '#9ac8ff', irisDark: '#0e2a5a', tilt: .16, thick: 1.25, flick: .09, lashes: true, crease: true },
    eyeSize: .37, eyeY: -.2, defaultExpr: 'grin', brow: { browW: .085, browY: -.01 }, mouth: { mouthW: 1.15, teethN: 6, fangs: true }, headShape: { jaw: .95, chin: .95, width: .95 },
    hair: { col: '#e44a2c', shadeCol: '#a0261a', gloss: true, glossCol: '#ff8a5a', springK: 26, springC: 4.5, cap: { front: .5, side: .08, back: -.9, jag: .04, jagN: 16 },
      locks: () => [
        // huge wavy mane behind (lion-like volume)
        ...lockFan(13, 1.25, 5.03, .3, (th, u, i) => ({ len: 3.0 + .7 * hash(i * 7 + 1), w: .6, rootR: .96, dir: dirOut(th, .3, 1.1, -.25), grav: .9, wave: [.55, 1.4 + hash(i) * .6, i], waveAxis: [Math.cos(th), 0, -Math.sin(th)], tw: .32, tip: 1.25, seg: 9, back: true, gloss: i % 3 === 0 })),
        ...lockFan(9, 1.6, 4.68, .7, (th, u, i) => ({ len: 2.2 + .5 * hash(i * 3), w: .55, rootR: .96, dir: dirOut(th, .45, .8, -.5), grav: 1.0, wave: [.45, 1.3, i * 2], waveAxis: [1, 0, 0], tw: .32, tip: 1.3, seg: 8, back: true })),
        // long side locks over the shoulders and chest
        { th: 1.25, ph: .3, len: 3.0, w: .46, rootR: .97, dir: [.75, -.65, .08], grav: 1.0, wave: [.4, 1.6], waveAxis: [0, 0, 1], tw: .32, tip: 1.2, seg: 9, front: true },
        { th: -1.25, ph: .3, len: 3.0, w: .46, rootR: .97, dir: [-.75, -.65, .08], grav: 1.0, wave: [.4, 1.6, 1], waveAxis: [0, 0, 1], tw: .32, tip: 1.2, seg: 9, front: true },
        { th: 1.45, ph: .2, len: 2.4, w: .45, rootR: .97, dir: [.8, -.4, .1], grav: .8, wave: [.5, 1.4], waveAxis: [0, 0, 1], tw: .32, tip: 1.3, seg: 8 },
        { th: -1.45, ph: .2, len: 2.4, w: .45, rootR: .97, dir: [-.8, -.4, .1], grav: .8, wave: [.5, 1.4, 2], waveAxis: [0, 0, 1], tw: .32, tip: 1.3, seg: 8 },
        // wild spiky bangs
        ...lockFan(6, -1.0, 1.0, .95, (th, u, i) => ({ len: .62 + .22 * hash(i * 5 + 2), w: .42, rootR: .97, dir: [Math.sin(th) * .9, .1, 1], curl: [Math.sin(th) * .9, -1.5, -1.0], grav: .9, wave: [.25, 1.2, i], waveAxis: [1, 0, 0], tw: .3, tip: 1.4, front: true, gloss: i === 3 })),
      ],
    },
    markings: (c, HM, e, lod) => { // Vermillion red markings at the outer eye corners
      for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .62, -.26, .4, .35); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.fillStyle = '#c8202e'; cc.beginPath(); cc.moveTo(-.3, .05); cc.quadraticCurveTo(.3, -.05, .75, .35); cc.quadraticCurveTo(.25, -.25, -.35, -.18); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(-.1, -.35); cc.quadraticCurveTo(.3, -.4, .55, -.15); cc.quadraticCurveTo(.25, -.5, -.15, -.5); cc.closePath(); cc.fill(); }, .05, fr.n); }
    },
  },
  extras: (S, D, F, t, parts, opt) => mereoExtras(S, D, F, t, parts, opt),
  forms: { base: {}, hellfire: { hellfire: true } },
});
e2Body(CAST.mereoleona, B => { const k = 1.78 / 1.8; B.ring.hip = [.172 * k, .12 * k]; B.ring.waist = [.122 * k, .088 * k]; B.ring.chest = [.158 * k, .112 * k]; B.ring.shoulder = [.18 * k, .088 * k]; B.limbR.ua *= 1.04; B.limbR.th *= 1.05; B.limbR.neck *= .9; B.hipW *= 1.06; });
CAST.mereoleona.drawHead = stdHead(CAST.mereoleona);
CAST.mereoleona.forms.hellfire = {
  hellfire: true, skin: '#ffb08a', skinShade: '#e0405a', armSkin: '#ffc49a', handSkin: '#ffc49a', neckSkin: '#ffb08a',
  face: Object.assign({}, CAST.mereoleona.face, { defaultExpr: 'rage', hair: Object.assign({}, CAST.mereoleona.face.hair, { col: '#ff6a3a', shadeCol: '#d0184a', tipCol: '#ffe6a0', tipLen: .3, glossCol: '#fff0b0', springK: 18 }),
    eye: Object.assign({}, CAST.mereoleona.face.eye, { irisCol: '#ffe070', irisLight: '#ffffff', irisDark: '#ff3a5a', white: '#fff4e0' }) }),
};
function mereoExtras(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8; if (typeof woundParts === 'function') woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  e2Bust(S, D, parts, opt, { col: D.kosode });
  e2HighCollar(S, D, parts, opt, D.kosode, .028, .16, null);
  // tunic skirt (long shirt) with striped trim, slit at the front
  e2Coat(S, D, F, t, parts, opt, { col: D.kosode, lining: '#16203a', len: .44, open: .1, flare: .25, sleeves: false, hem: 'none', pattern: e2TrimPattern('#e8d8a8', '#f4f0e0', .035) }, 'skirt');
  // rolled sleeve cuffs at the elbow
  for (const sd of ['L', 'R']) { const el = S.J['el' + sd], wr = S.J['wr' + sd]; parts.push({ z: camDepth(el) - .008, fn: c => e2Tube(c, [vLerp(el, wr, .02), vLerp(el, wr, .2)], v => .062 * k * (1 + .1 * Math.sin(v * 9)), '#28365e', opt, { hint: S.M.chest[2] }) }); }
  // sash tails on the left hip
  parts.push({ z: camDepth(S.J.pelvis) - .1, fn: c => { const T = torsoModel(S, D, .02 * k); const root = T.ringAt(.06, .9); const sp = [], wv = []; const sway = Math.sin(t * 2.2) * .03 * k; for (let i = 0; i <= 8; i++) { const v = i / 8; sp.push(vAdd(root, vAdd([sway * v, -.34 * k * v, 0], vMul(S.M.pelvis[0], .03 * k * v)))); wv.push(vMul(S.M.pelvis[2], .07 * k * (1 - .3 * v))); } drawSurf(c, sampleSurf(sRibbon(sp, wv, 2, 8)), Object.assign({ col: '#6a3a9a', side: 'both', backCol: '#4a2470', shade: .05 }, opt.surf || {})); } });
  e2Boots(S, D, parts, opt, { col: '#3a2a24', top: .55, r: .062 });
  e2Grimoire(S, D, F, t, parts, opt);
  if (D.hellfire && typeof bcHellfireParts === 'function') bcHellfireParts(S, D, F, t, parts, opt);
}

// =============================================================================================== NOZEL SILVA
CAST.nozel = design(SHINIGAMI, {
  name: 'Nozel Silva', h: 1.86, body: { width: .9, limbs: .86, shoulders: .98, neck: 1.05 }, skin: '#f7e4d8', skinShade: '#d6aaa4',
  kosode: '#2b2d3c', collar: { under: '#2b2d3c', skinCol: '#f7e4d8', v0: .82, w: .32, shift: 0 },
  sleeve: { col: '#2b2d3c', lining: '#1a1b26', r0: .07, r1: .085, r2: .095, sag: .06, len: 1.0 },
  hakama: { col: '#2b2d3c', r0: .108, r1: .085, r2: .062, pleats: false, ties: false },
  haori: { col: '#d4d7e1', lining: '#5a5f7a', len: 1.06, sleeves: false, capSleeve: true, hem: 'none', open: .48, flare: .3, collarLen: .4 },
  feet: { col: '#f7e4d8', sole: '#6a5a4a' },
  grimoire: { col: '#9aa2b8', emblem: '#e8e8f0', glow: '#d8e8ff' },
  face: {
    eye: { w: 1.05, h: .21, irisR: .22, irisCol: '#7a58b8', irisLight: '#c4a8ff', irisDark: '#2a1a4a', tilt: .1, thick: 1.05, flick: .07, lashes: true, crease: true },
    eyeSize: .36, eyeY: -.21, defaultExpr: 'calm', brow: { browW: .045, browY: .06 }, headShape: { jaw: .92, chin: 1.0, width: .94 },
    hair: { col: '#e9edf4', shadeCol: '#a2abc4', gloss: true, glossCol: '#ffffff', springK: 34, springC: 5.5, cap: { front: .55, side: .1, back: -.95 },
      locks: () => [
        // long straight hair at the lower back
        ...lockFan(9, 2.3, 3.98, -.15, (th, u, i) => ({ len: 3.1 + .2 * Math.cos(u * 6), w: .5, rootR: .98, dir: [Math.sin(th) * .2, -1, Math.cos(th) * .35], grav: 1.4, tw: .3, tip: 1.1, seg: 9, back: true, gloss: i % 4 === 1 })),
        // heavily styled top swept back into long spikes
        ...lockFan(7, -1.25, 1.25, .95, (th, u, i) => ({ len: 1.75 + .25 * Math.sin(u * Math.PI), w: .55, rootR: .96, dir: vNorm([Math.sin(th) * .45, .55, -1]), curl: [0, -.35, -.25], tw: .3, tip: 1.7, back: true, gloss: i === 3 })),
        ...lockFan(4, 1.35, 2.3, .45, (th) => ({ len: 1.5, w: .48, rootR: .96, dir: dirOut(th, .15, .35, -1.8), curl: [0, -.25, -.3], tw: .3, tip: 1.7, back: true })),
        ...lockFan(4, -2.3, -1.35, .45, (th) => ({ len: 1.5, w: .48, rootR: .96, dir: dirOut(th, .15, .35, -1.8), curl: [0, -.2, -.2], tw: .3, tip: 1.7, back: true })),
        // side locks in front of the ears
        { th: 1.25, ph: .25, len: 1.5, w: .32, rootR: .97, dir: [.3, -.9, .25], grav: 1.1, tw: .3, tip: 1.3, front: true },
        { th: -1.25, ph: .25, len: 1.5, w: .32, rootR: .97, dir: [-.3, -.9, .25], grav: 1.1, tw: .3, tip: 1.3, front: true },
        // braid between the eyes down to the nose tip
        { th: 0, ph: .82, len: 1.12, w: .22, rootR: .98, dir: [0, .15, 1], grav: 2.8, curl: [0, -1.2, -.4], tw: .9, round: true, bulge: .3, tip: .45, col: '#dfe4ee', front: true, seg: 8, braid: true },
      ],
    },
    extraParts: (S, D, F, t, parts, opt, HM, e, zc) => { // braid weave marks + House Silva pendant at the tip
      const L = D.face.hair.locks().find(l => l.braid); if (!L) return; const pts = lockCurve(HM, L, [0, 0, 0], t), tip = pts[pts.length - 1];
      parts.push({ z: Math.min(camDepth(tip), zc) - .004, fn: c => { if (opt.mode !== 'flat' && !LIGHT.override) { const s = pxScale(tip); for (let i = 1; i < pts.length - 1; i++) { const a = proj2(pts[i]), b = proj2(pts[i + 1]); const dx = b[0] - a[0], dy = b[1] - a[1]; c.beginPath(); c.moveTo(a[0] - dy * .5, a[1] + dx * .5); c.lineTo(a[0] + dx * .5 + dy * .4, a[1] + dy * .5 - dx * .4); c.lineWidth = lineW(s, .35); c.strokeStyle = '#8a92aa'; c.stroke(); } }
        e2Gem(c, vAdd(tip, mApply(HM.M, [0, -HM.r * .08, HM.r * .04])), HM.r * .12, '#9ab8e8', opt); } });
    },
  },
  extras: (S, D, F, t, parts, opt) => nozelExtras(S, D, F, t, parts, opt),
  forms: { base: {}, guardian: {} },
});
CAST.nozel.drawHead = stdHead(CAST.nozel);
// Silver Guardian: mercury coating over the whole body (face stays readable), eagle-wing fins on the shoulders
CAST.nozel.forms.guardian = { guardian: true, kosode: '#b9c2d0', collar: { under: '#b9c2d0', skinCol: '#c9d1dc', v0: .82, w: .3, shift: 0 },
  sleeve: { col: '#b9c2d0', lining: '#6a7488', r0: .066, r1: .07, r2: .072, sag: .0, len: 1.0 }, hakama: { col: '#b9c2d0', r0: .1, r1: .08, r2: .066, pleats: false, ties: false },
  haori: { col: '#d4d7e1', lining: '#5a5f7a', len: 1.06, sleeves: false, capSleeve: true, hem: 'none', open: .48, flare: .45, collarLen: .4 }, armSkin: '#c9d1dc', handSkin: '#c9d1dc', feet: { col: '#b9c2d0', sandal: false } };
function nozelExtras(S, D, F, t, parts, opt) {
  const k = S.B.h / 1.8, M = S.M.chest; if (typeof woundParts === 'function') woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0);
  // gold band closing the high collar
  e2HighCollar(S, D, parts, opt, D.kosode, .03, .14, '#d8b44a');
  // white fur mantle: lumpy ring over the shoulders
  parts.push({ z: camDepth(S.J.neck) - .05, fn: c => { const T = torsoModel(S, D, .05 * k); const surf = { nu: 30, nv: 4, wrapU: true, fn: (u, v) => { const th = u * TAU, lump = 1 + .25 * Math.sin(th * 14) * Math.sin(v * Math.PI); return T.ringAt(lerp(.8, .99, v), th, (.03 + .022 * Math.sin(v * Math.PI) * lump) * k); } };
    drawSurf(c, sampleSurf(surf), Object.assign({ col: D.guardian ? '#e6ecf4' : '#f5f4f2', shade: .12, inkW: .8 }, opt.surf || {})); } });
  // Silver Eagles insignia on the left chest of the robe
  if (opt.mode !== 'flat') parts.push({ z: camDepth(S.J.neck) - .07, fn: c => { const T = torsoModel(S, D, .04 * k); const p = T.ringAt(.72, .55); const n = vNorm(vSub(p, S.J.abd)); if (vDot(n, toCam(p)) < .1) return; const q = project(p); if (!q) return; const r = .03 * k * q.s; c.save(); c.translate(q.x, q.y); c.fillStyle = '#b0b8c8'; c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 1.3, -r * .2); c.lineTo(r * .4, -r * .1); c.lineTo(0, r); c.lineTo(-r * .4, -r * .1); c.lineTo(-r * 1.3, -r * .2); c.closePath(); c.fill(); c.lineWidth = 1; c.strokeStyle = LIGHT.ink; c.stroke(); c.restore(); } });
  // loose pants banded below the knee + bare shins (sandals)
  if (!D.guardian) e2Shins(S, D, parts, opt, { top: .2, r: .05, band: '#d8b44a', bandR: .066 });
  else e2Boots(S, D, parts, opt, { col: '#c9d1dc', top: .18, r: .062, cuff: '#eef2f8' });
  // grimoire case on the left hip
  parts.push({ z: camDepth(S.J.pelvis) - .08, fn: c => { const P = S.J.pelvis, Mp = S.M.pelvis; const ctr = vAdd(P, mApply(Mp, [.2 * k, -.04 * k, .02 * k])); const surf = sEllipsoid(ctr, Mp, [.025 * k, .085 * k, .07 * k], .25, 10, 6); drawSurf(c, sampleSurf(surf), Object.assign({ col: '#4a3a3a', shade: .1 }, opt.surf || {})); } });
  if (D.guardian) nozelWings(S, D, F, t, parts, opt);
  e2Grimoire(S, D, F, t, parts, opt);
}
function nozelWings(S, D, F, t, parts, opt) { // mercury eagle-wing fins (post-timeskip robe silhouette), 2 per side
  const k = S.B.h / 1.8, M = S.M.chest, back = vMul(M[2], -1), up = M[1], flap = Math.sin(t * 1.8) * .06;
  const behind = vDot(back, CAM.cur.F) > 0;
  for (const sg of [1, -1]) for (const [lift, len, w] of [[.75, 1.05, .2], [.15, .8, .16]]) {
    const side = vMul(M[0], sg), root = vAdd(S.J['sh' + (sg > 0 ? 'L' : 'R')], vMul(back, .06 * k));
    const dir = vNorm(vAdd(vMul(side, .9), vAdd(vMul(up, lift + flap), vMul(back, .45))));
    parts.push({ z: camDepth(vMad(root, dir, len * .4 * k)) + (behind ? -.25 : .28), fn: c => {
      const n = vNorm(vCross(dir, back)), pts = [];
      for (let i = 0; i <= 7; i++) { const u = i / 7; pts.push(vMad(vMad(root, dir, len * k * u), n, w * k * Math.sin(u * Math.PI * .9 + .2) * (1 - u * .3))); }
      for (let i = 6; i >= 1; i--) { const u = i / 7; const f = i % 2 ? .0 : .35; pts.push(vMad(vMad(root, dir, len * k * u * (1 - f * .08)), n, -w * k * .15 * (1 - u))); }
      const sp = projPoly(pts); if (sp.length < 3) return; polyPath(c, sp);
      if (opt.mode === 'flat') { c.fillStyle = opt.col; c.fill(); return; }
      if (LIGHT.override) { c.fillStyle = LIGHT.override.fill; c.fill(); c.lineWidth = 1.6; c.strokeStyle = LIGHT.ink; c.stroke(); return; }
      const a = proj2(root), b = proj2(vMad(root, dir, len * k)); const g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, '#8a94aa'); g.addColorStop(.45, '#eef3fa'); g.addColorStop(.7, '#b4bed0'); g.addColorStop(1, '#ffffff'); c.fillStyle = g; c.fill();
      c.lineWidth = lineW(pxScale(root), .8); c.strokeStyle = '#2a3042'; c.lineJoin = 'round'; c.stroke();
      // feather separations
      c.strokeStyle = 'rgba(60,70,90,.55)'; c.lineWidth = 1; for (let i = 2; i < 7; i += 1) { const p0 = proj2(vMad(root, dir, len * k * i / 7)), p1 = proj2(vMad(vMad(root, dir, len * k * i / 7), n, w * k * .8)); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); }
    } });
  }
}

// =============================================================================================== SIGNATURE POSES
Object.assign(POSES, {
  // Mereoleona: wide, predatory, fists
  mereo_stance: { sp: .08, st: -.2, hp: -.05, aR: [.9, .5, 0], eR: 1.6, hR: 'fist', aL: [.5, .8, 0], eL: 1.2, hL: 'fist', lL: [.45, .3, .3], kL: .55, lR: [-.3, .3, -.3], kR: .35, fR: .25, face: { mouth: 'grin', mouthOpen: .4, lid: .3, browA: .4 } },
  mereo_armsCrossed: { sp: -.06, hp: -.12, aL: [.6, -.55, -.5], eL: 2.1, aR: [.55, -.5, .5], eR: 2.15, lL: [.12, .22, .3], kL: .05, lR: [-.05, .22, -.3], kR: .02 },
  mereo_calidusWind: { sp: -.05, st: .85, hp: .05, hy: -.3, aR: [1.0, -1.0, 0], eR: 2.0, hR: 'fist', aL: [1.3, .2, 0], eL: .5, hL: 'open', lL: [.6, .25, .3], kL: .7, lR: [-.45, .2, -.3], kR: .4 },
  mereo_calidus: { sp: .38, st: -.75, hp: .1, aR: [1.57, .05, 0], eR: 0, hR: 'fist', aL: [.7, PI * .82, 0], eL: 1.4, hL: 'fist', lL: [1.0, .2, .2], kL: 1.0, lR: [-.85, .2, -.2], kR: .15, fR: .45, face: { mouth: 'shout', mouthOpen: 1, eye: 1.1, lid: .4, browA: .6 } },
  mereo_uppercut: { sp: -.2, st: -.5, hp: -.35, aR: [2.6, .2, 0], eR: .5, hR: 'fist', aL: [.6, .9, 0], eL: 1.3, hL: 'fist', lL: [.5, .2, .2], kL: .6, lR: [-.5, .2, -.2], kR: .2, fR: .6 },
  mereo_grimoire: { sp: -.04, hp: -.1, aL: [1.2, .4, 0], eL: .6, hL: 'open', wL: [-.5, 0], aR: [.4, .7, 0], eR: 1.4, hR: 'fist', grim: 1, grimSide: 'L', face: { mouth: 'grin', mouthOpen: .5, lid: .25 } },
  mereo_roar: { sp: -.2, hp: -.55, aL: [.5, 1.5, 0], eL: 1.0, aR: [.5, 1.5, 0], eR: 1.0, hL: 'claw', hR: 'claw', lL: [.4, .38, .25], kL: .55, lR: [.4, .38, -.25], kR: .55, face: { mouth: 'shout', mouthOpen: 1, eye: 1.1, lid: .5, browA: .7, vein: 1 } },
  // Nozel: upright, aristocratic, palm casts
  nozel_stand: { sp: -.03, hp: -.08, aL: [.12, .35, 0], eL: .3, aR: [.15, .4, 0], eR: .25, hR: 'relax', lL: [.04, .05, .1], lR: [-.03, .05, -.1], face: { lid: .25, eye: .8 } },
  nozel_palm: { sp: .02, st: -.25, hp: -.04, aR: [1.55, .1, 0], eR: .05, hR: 'open', wR: [-.9, 0], aL: [.15, .45, 0], eL: .3, lL: [.3, .1, .2], kL: .3, lR: [-.25, .1, -.2], kR: .1, face: { lid: .3, eye: .75, browA: .25 } },
  nozel_grimoire: { sp: -.02, hp: -.12, aL: [1.1, .3, 0], eL: .5, hL: 'open', wL: [-.4, 0], aR: [1.6, -.1, 0], eR: .1, hR: 'open', wR: [-.8, 0], grim: 1, grimSide: 'L', face: { lid: .3, eye: .7 } },
  nozel_command: { sp: -.05, hp: -.2, aR: [2.4, .55, 0], eR: .2, hR: 'open', aL: [.15, .4, 0], eL: .3, lL: [.15, .1, .1], kL: .1, lR: [-.1, .1, -.1], face: { lid: .35, eye: .7, mouth: 'line', browA: .35 } },
  nozel_spear: { sp: .3, st: -.6, hp: .05, aR: [1.5, .05, 0], eR: .1, hR: 'grip', aL: [.7, PI * .8, 0], eL: .4, hL: 'open', lL: [.9, .15, .2], kL: 1.0, lR: [-.75, .15, -.2], kR: .2, fR: .4 },
  nozel_float: { sp: .02, hp: -.15, aL: [.5, 1.1, 0], eL: .3, hL: 'open', aR: [.5, 1.1, 0], eR: .3, hR: 'open', lL: [.15, .04, 0], kL: .3, lR: [-.05, .04, 0], kR: .5, fL: .7, fR: .8, ground: false },
});
SIGNATURE.mereoleona = ['mereo_stance', 'mereo_calidus', 'mereo_grimoire', 'mereo_roar', 'mereo_armsCrossed', 'mereo_uppercut', 'mereo_calidusWind'];
SIGNATURE.nozel = ['nozel_stand', 'nozel_palm', 'nozel_grimoire', 'nozel_command', 'nozel_float', 'nozel_spear'];
