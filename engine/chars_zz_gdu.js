/* engine/chars_zz_gdu.js (agent E, gowther-dazai-urahara) - Dazai + Urahara updates for this project (loads after chars_sad / chars_bleach).
   URAHARA (CAST.urahara):
     new forms: captain (110 years ago: 12th-division captain haori 十二, no hat, tidier hair, no cane), gigai (= base, used for the decoy copy)
     pose fields: fan 0..1 (folding fan in the right hand, 0 closed .. 1 open; fanHand 'L'|'R'), fanText (string written on the fan face),
                  fanSide 'front'|'back'|'both' (which face shows fanText: 'front' = side away from his palm), fanDraw(fn(ctx)) custom face art,
                  eyeFlash 0..1 (sharp glint under the hat brim), cane:false (hide the cane)
     poses: urahara_fanFace (fan hides the mouth), urahara_fanOpen (fan out to the side, theatrical), urahara_fanPoint (closed fan pointing),
            urahara_hatTip, urahara_think, urahara_bow, urahara_okiro (cane held up before the face), urahara_shitone (cane tip thrust down -
            Shitonegaeshi finish), urahara_ready (low stance, cane forward), urahara_snap (finger snap: kido trigger), urahara_sit (seated on an edge),
            urahara_lean (leaning on the cane, relaxed)
     effects: fxGigaiPop(g, F, ft, t, o) decoy bursts into cotton + cloth scraps ('pof'), fxBlackCurtain(g, c, yaw, t, o) Bankai black curtain
              (falls, then parts: o.open), fxBenihimeDoll(g, base, yaw, t, o) REDRAWN: slender ball-jointed doll, dark hair in braided loops,
              pale face with stitched eyes, red open robe, temple-door hands (o.open 0..1 or auto), red stitches; fxStitches(g, pts, t, o) red
              zig-zag stitches sewing along a world polyline; fxStitchPath(g, a, b, t, o) stitched path on the floor; fxRedReiatsu(g, F, t, o)
              red reiatsu aura; fxKeikaigi -> see sets_gow (undergrounds o.garganta).
   DAZAI (CAST.dazai):
     new forms: wet (rain: flattened darker hair, droplets, darker coat), wet_nocoat
     poses: dazai_think (hand to chin, sly smile), dazai_shrug, dazai_finger (index up: 'one thing'), dazai_reach (reaching to touch, palm out),
            dazai_drum (head-first in a drum can: use with drawDrumCan + pos y ~ .7, ground:false), dazai_hands (both hands up, 'I surrender')
     props: drawDrumCan(g, c, o) oil drum (o.col, o.tilt, o.lying), fxRain(g, t, o) screen rain (+ splashes on y=0 if o.ground)            */
'use strict';
// ============================================================================================================ URAHARA
(function () {
  const U = CAST.urahara, F = U.forms;
  F.gigai = {};
  F.captain = { cane: false, noHat: true, haori: { col: '#f4f2ec', lining: '#d8d6cf', len: .82, sleeves: false, hem: 'hishi', kanji: '十二', open: .24 }, kosode: '#1f1d27', collar: { under: '#f1efe9', v0: .6, w: .6, shift: .05 },
    sleeve: { col: '#1f1d27', r0: .085, r1: .1, r2: .13, sag: .16 }, hakama: { col: '#1f1d27', r0: .1, r1: .118, r2: .135 }, feet: { col: '#f1efe8', sole: '#b7976a' } };
  const f0 = U.face; F.captain.face = Object.assign({}, f0, { hair: Object.assign({}, f0.hair, { cap: { front: .55, side: .05, back: -.75 } }) });
  // extras: keep the old (cane + wounds) and add the fan, eye flash
  const oldExtras = U.extras;
  U.extras = (S, D, Fg, t, parts, opt) => { if (S.pose.cane === false) { const D2 = Object.assign({}, D, { cane: false }); oldExtras(S, D2, Fg, t, parts, opt); } else oldExtras(S, D, Fg, t, parts, opt); uraExtras(S, D, Fg, t, parts, opt); };
  // markings: sharper eye glint under the brim
  const oldMark = U.face.markings;
  const newMark = (c, HM, e, lod, D) => { oldMark(c, HM, e, lod, D); if (e.eyeFlash && lod >= 0) for (const sg of [-1, 1]) { const fr = faceFrame(HM, sg * .46, -.18, .5, .5); decal(c, fr.p, sg > 0 ? fr.tu : vMul(fr.tu, -1), fr.tv, cc => { cc.globalCompositeOperation = 'lighter'; cc.fillStyle = `rgba(255,255,255,${.9 * e.eyeFlash})`; cc.beginPath(); cc.moveTo(-.7, .02); cc.lineTo(0, .12); cc.lineTo(.8, .02); cc.lineTo(0, -.06); cc.closePath(); cc.fill(); cc.fillStyle = `rgba(255,80,90,${.35 * e.eyeFlash})`; cc.beginPath(); cc.arc(0, .03, .35, 0, TAU); cc.fill(); }, -.1, fr.n); } };
  U.face.markings = newMark; for (const k in F) if (F[k].face) F[k].face.markings = newMark;
})();
function uraExtras(S, D, F, t, parts, opt) {
  const p = S.pose, fan = p.fan || 0;
  if (fan > 0 || p.fanClosed) { const sd = p.fanHand || 'R', hg = handGeom(S, sd, p['h' + sd] || 'grip'); if (hg) parts.push({ z: camDepth(hg.palmC) - .03, fn: c => drawUraFan(c, S, hg, fan, opt, p) }); }
}
// folding fan: ribs fan out from a pivot in the hand; paper face (two-sided); closed = a thin stick
function drawUraFan(c, S, hg, open, opt, p) {
  const k = S.B.h / 1.8, piv = vMad(hg.palmC, hg.Y, .02 * k); let up = vMul(hg.Y, -1), side = vNorm(hg.Z), n = vNorm(hg.np); if (p.fanFront) { side = vNorm(S.M.chest[0]); up = vNorm(vSub(p.fanUp ? mApply(S.M.chest, p.fanUp) : S.M.chest[1], vMul(side, 0))); n = vNorm(vCross(side, up)); } const R = .3 * k, r0 = .07 * k, span = lerp(.08, 2.5, clamp(open, 0, 1)), N = 16, flat = opt.mode === 'flat';
  const dirAt = a => vNorm(vAdd(vMul(up, Math.cos(a)), vMul(side, Math.sin(a)))), pts = [], inner = [];
  for (let i = 0; i <= N; i++) { const a = -span / 2 + i / N * span + (p.fanRot || 0), d = dirAt(a); pts.push(vMad(piv, d, R)); inner.push(vMad(piv, d, r0)); }
  const s = pxScale(piv), lw = Math.max(1, lineW(s, .8)), fc = vDot(n, toCam(piv)), front = p.fanFront ? vDot(S.M.chest[2], toCam(piv)) > 0 : fc < 0;   // 'front' = side away from the palm
  if (open < .1) { const a = proj2(piv), b = proj2(vMad(piv, up, R)); ctx2line(c, a, b, Math.max(3, .025 * k * s), flat ? opt.col : '#e8e0cc', lw); return; }
  // paper: alternating folds (zig-zag light / shade)
  for (let i = 0; i < N; i++) { const quad = [inner[i], pts[i], pts[i + 1], inner[i + 1]], sp = projPoly(quad); if (sp.length < 3) continue; polyPath(c, sp); c.fillStyle = flat ? opt.col : (LIGHT.override ? LIGHT.override.fill : (i % 2 ? '#f6f2e8' : '#ddd6c6')); c.fill(); }
  if (!flat && !LIGHT.override) {
    // ribs + pivot
    c.strokeStyle = '#6a4a2e'; c.lineWidth = Math.max(1, lw * .8); for (let i = 0; i <= N; i += 2) { const a = proj2(piv), b = proj2(inner[i]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    const txt = p.fanText, sideOk = !p.fanSide || p.fanSide === 'both' || (p.fanSide === 'front') === front;
    if ((txt || p.fanDraw) && sideOk && open > .6) { const mid = vMad(piv, up, R * .62), tu = vMul(side, R * .55 * (front ? 1 : -1)), tv = vMul(up, R * .3); decal(c, mid, tu, tv, cc => { if (p.fanDraw) return p.fanDraw(cc); cc.fillStyle = '#1a1210'; cc.font = `900 ${txt.length > 3 ? .5 : .8}px "IPAMincho", "IPAGothic", serif`; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.save(); cc.scale(1, -1); cc.fillText(txt, 0, 0); cc.restore(); }, -1); }
  }
  const outline = pts.concat(inner.slice().reverse()), so = projPoly(outline); if (so.length > 2) { polyPath(c, so); c.lineWidth = lw; c.strokeStyle = LIGHT.ink; c.lineJoin = 'round'; c.stroke(); }
}
Object.assign(POSES, {
  urahara_fanFace: { sp: -.02, hp: .12, hr: .08, ikHR: [-.03, 1.27, .2], hR: 'grip', fan: 1, fanFront: true, fanUp: [.25, 1, .15], aL: [.25, .4, 0], eL: .45, hL: 'grip', lL: [.08, .08, .15], lR: [-.03, .07, -.1], face: { eye: .55, mouth: 'smile', lid: .1 } },
  urahara_fanOpen: { sp: -.05, hp: .02, aR: [1.35, .9, .2], eR: .5, hR: 'grip', wR: [-.3, 0], fan: 1, fanRot: .2, aL: [.25, .4, 0], eL: .45, hL: 'grip', lL: [.1, .1, .2], lR: [-.05, .08, -.15], face: { eye: .6, mouth: 'smile', mouthOpen: .2 } },
  urahara_fanPoint: { sp: .04, hp: .05, aR: [1.5, .1, 0], eR: .1, hR: 'grip', fan: .02, fanClosed: true, aL: [.25, .4, 0], eL: .45, hL: 'grip', lL: [.15, .12, .2], lR: [-.08, .1, -.15], face: { eye: .6, mouth: 'smirk', lid: .2 } },
  urahara_hatTip: { sp: 0, hp: .2, aL: [1.6, -.2, 0], eL: 2.2, hL: 'grip', wL: [.4, 0], aR: [.15, .5, 0], eR: .3, hR: 'relax', cane: false, face: { eye: .5, mouth: 'smirk', shadow: .4 } },
  urahara_think: { sp: .03, hp: .12, hr: -.1, aR: [1.0, -.55, .2], eR: 2.4, hR: 'point', wR: [.3, .2], aL: [.75, -.6, 0], eL: 1.6, hL: 'relax', cane: false, face: { eye: .6, mouth: 'line', look: [.3, .1] } },
  urahara_bow: { sp: .45, hp: .2, aR: [.6, -.3, 0], eR: .9, hR: 'relax', aL: [.3, .3, 0], eL: .5, hL: 'grip', face: { eye: .4, mouth: 'smile' } },
  urahara_okiro: { sp: .02, hp: .08, aL: [1.2, -.35, 0], eL: 1.9, hL: 'grip', aR: [1.25, -.25, 0], eR: 1.7, hR: 'grip', sword: { hand: 'R', dir: [.9, .3, .3] }, face: { eye: .7, lid: .25, mouth: 'line', shadow: .3 } },
  urahara_shitone: { sp: .55, st: -.2, hp: .35, aR: [1.0, .1, 0], eR: .3, hR: 'grip', sword: { hand: 'R', dir: [.05, -.9, .4] }, aL: [.5, .5, 0], eL: .6, hL: 'open', lL: [1.1, .25, .3], kL: 1.5, lR: [-.3, .2, -.2], kR: .9, face: { eye: .85, lid: .35, mouth: 'line', eyeFlash: 1 } },
  urahara_ready: { sp: .2, st: -.4, hp: .1, aR: [1.2, .2, 0], eR: .4, hR: 'grip', sword: { hand: 'R', dir: [.3, .2, .93] }, aL: [.5, -.3, 0], eL: 1.1, hL: 'open', lL: [.55, .22, .3], kL: .75, lR: [-.4, .18, -.25], kR: .4, face: { eye: .85, lid: .3, mouth: 'line' } },
  urahara_snap: { sp: .02, hp: .05, aL: [1.4, -.1, 0], eL: .6, hL: 'sign', wL: [-.2, 0], aR: [.25, .4, 0], eR: .45, hR: 'grip', face: { eye: .65, lid: .2, mouth: 'smirk' } },
  urahara_sit: { ground: false, sp: .15, hp: .15, aL: [.5, -.2, 0], eL: 1.1, hL: 'grip', aR: [.4, -.25, 0], eR: 1.4, hR: 'relax', lL: [1.45, .15, .1], kL: 1.35, lR: [1.4, .15, -.1], kR: 1.55, drop: -.48, face: { eye: .55, mouth: 'smile' } },
  urahara_lean: { sp: .08, ss: .06, hp: .08, hr: .1, aL: [.45, .1, 0], eL: .3, hL: 'grip', aR: [.15, .5, 0], eR: .35, hR: 'relax', lL: [.05, .08, .1], lR: [.15, .12, -.2], kR: .25, face: { eye: .5, mouth: 'smile' } },
});
SIGNATURE.urahara = SIGNATURE.urahara.concat(['urahara_fanFace', 'urahara_fanOpen', 'urahara_hatTip', 'urahara_think', 'urahara_okiro', 'urahara_shitone', 'urahara_ready', 'urahara_snap']);
(window.SIGNATURE_FORM = window.SIGNATURE_FORM || {}).urahara = 'shikai';
// decoy gigai: the hit lands, the body bursts into cotton puffs + cloth scraps; draw INSTEAD of f.fig after o.at (default 0)
function fxGigaiPop(g, F, ft, t, o = {}) {
  if (t < 0) { drawFig(g, F, ft); return; } const S = figSkel(F, F.timing > 1 ? onN(ft, F.timing) : ft), c = S.J.abd, q = project(c); if (!q) return; const k = S.B.h / 1.8;
  if (t < .06) { drawFig(g, F, ft); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, 1.2 * k * q.s, '#ffffff', .8); g.restore(); return; }
  const u = clamp((t - .06) / (o.dur || .9), 0, 1), r = rng(o.seed || 3);
  g.save(); for (let i = 0; i < 26; i++) { const a = r() * TAU, sp = .6 + r() * 1.6, el = (r() - .3) * 1.5, d = sp * easeOut(u) * k, p = vAdd(vLerp(S.J.pelvis, S.J.head, r()), [Math.cos(a) * d, el * d * .6 - u * u * .6, Math.sin(a) * d]), pq = project(p); if (!pq) continue; const rr = (.08 + r() * .12) * k * pq.s * (1 - u * .4), al = 1 - u;
    if (i % 3) { g.fillStyle = rgba('#fbf8f2', al); g.beginPath(); for (let j = 0; j < 5; j++) { const b = j / 5 * TAU; g.moveTo(pq.x + Math.cos(b) * rr * .6 + rr * .6, pq.y + Math.sin(b) * rr * .6); g.arc(pq.x + Math.cos(b) * rr * .6, pq.y + Math.sin(b) * rr * .6, rr * .6, 0, TAU); } g.fill(); g.strokeStyle = rgba('#a8a090', al * .8); g.lineWidth = 1.2; g.stroke(); }
    else { g.save(); g.translate(pq.x, pq.y); g.rotate(a + u * 6); g.fillStyle = rgba(['#15171a', '#2b3b2c', '#e8efe6', '#2f5d3a'][i % 4], al); g.beginPath(); g.moveTo(-rr, -rr * .4); g.lineTo(rr, -rr * .6); g.lineTo(rr * .7, rr * .5); g.lineTo(-rr * .8, rr * .3); g.closePath(); g.fill(); g.restore(); } }
  if (u < .35) { g.strokeStyle = rgba('#ffffff', 1 - u / .35); g.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r1 = (.4 + u * 2) * k * q.s, r2 = r1 + .3 * k * q.s; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.lineTo(q.x + Math.cos(a) * r2, q.y + Math.sin(a) * r2); g.stroke(); } }
  g.restore();
}
// Bankai entrance: a black curtain drops behind / around (world plane, width o.w, height o.h, facing yaw), then parts from the middle (o.open or auto)
function fxBlackCurtain(g, c, yaw, t, o = {}) {
  if (t < 0) return; const w = o.w || 7, h = o.h || 9, drop = easeOut(clamp(t / (o.dropDur || .45), 0, 1)), open = o.open != null ? o.open : easeInOut(clamp((t - (o.openAt || .9)) / .7, 0, 1)), side = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const top = h, bot = h - h * drop; g.save();
  for (const sg of [-1, 1]) { const N = 12, pts = []; for (let i = 0; i <= N; i++) { const u = i / N, x = sg * lerp(0, w / 2, u) + sg * open * w * .55 * (1 - u * .3), wave = Math.sin(u * 30 + t * 2) * .08; pts.push(vAdd(c, vAdd(vMul(side, x), [0, 0, wave]))); }
    const poly = pts.map(p => vAdd(p, [0, top, 0])).concat(pts.slice().reverse().map((p, i) => vAdd(p, [0, bot + (open * h * .08 * Math.sin((1 - i / N) * Math.PI)), 0]))), sp = projPoly(poly); if (sp.length < 3) continue;
    polyPath(g, sp); g.fillStyle = '#0b0b0e'; g.fill(); g.save(); g.clip(); for (let i = 0; i <= N; i++) { const a = project(vAdd(pts[i], [0, top, 0])), b = project(vAdd(pts[i], [0, bot, 0])); if (!a || !b) continue; g.strokeStyle = i % 2 ? 'rgba(60,40,60,.6)' : 'rgba(0,0,0,.8)'; g.lineWidth = Math.max(2, .2 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } g.restore();
    polyPath(g, sp); g.lineWidth = 2; g.strokeStyle = '#b3122a'; g.stroke(); }
  if (open > 0) { const gq = project(vAdd(c, [0, h * .5, 0])); if (gq) { g.globalCompositeOperation = 'lighter'; glow(g, gq.x, gq.y, w * .4 * gq.s * open, '#ff3b4e', .35 * open); } }
  g.restore();
}
/* Kannonbiraki Benihime Aratame (redrawn): a towering slender ball-jointed doll behind Urahara.  Pale porcelain face with stitched eyes and red lips,
   black hair in braided loops either side, red open robe with gold trim, white under-collar, joints at shoulders / elbows / wrists, huge hands that
   swing open like temple doors (o.open 0..1, or automatic after rise), red stitch lines on the robe.  base = floor point under the doll. */
fxBenihimeDoll = function (g, base, yaw, t, o = {}) {
  if (t < 0) return; const rise = easeOut(clamp(t / (o.rise || 1.2), 0, 1)), S2 = o.scale || 4.5, side = [Math.cos(yaw), 0, -Math.sin(yaw)], fwd = [Math.sin(yaw), 0, Math.cos(yaw)];
  const W3 = (x, y, z = 0) => vAdd(base, vAdd(vMul(side, x * S2), vAdd([0, y * S2 * rise, 0], vMul(fwd, z * S2))));
  const head = project(W3(0, 1.05)), neck = project(W3(0, .86)), hip = project(W3(0, .3)), b0 = project(W3(0, 0)); if (!head || !neck || !hip || !b0) return; const R = .17 * S2 * head.s, ink = '#1a0408', lw = Math.max(2, R * .05);
  const open = o.open != null ? o.open : easeInOut(clamp((t - (o.openAt || .8)) / .8, 0, 1)), ht = (o.headTurn || 0) * R * .3;
  g.save(); g.globalAlpha = rise; g.lineJoin = 'round'; g.lineCap = 'round'; if (o.lean) { g.translate(b0.x, b0.y); g.rotate(o.lean); g.translate(-b0.x, -b0.y); }
  // braided hair loops behind
  for (const sg of [-1, 1]) { const lx = head.x + sg * R * 1.35, ly = head.y + R * .6; g.fillStyle = '#100a10'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(lx + sg * R * .1 * i, ly + i * R * .42, R * (.46 - i * .05), R * .3, sg * .3, 0, TAU); g.fill(); g.strokeStyle = '#3a2a3a'; g.lineWidth = lw * .6; g.stroke(); } g.beginPath(); g.ellipse(head.x + sg * R * 1.1, head.y - R * .3, R * .55, R * .75, 0, 0, TAU); g.fillStyle = '#100a10'; g.fill(); }
  // robe: shoulders -> flaring hem (kneeling), red with gold trim + red stitch lines
  const sh = R * 2.2, hw = R * 3.6; g.beginPath(); g.moveTo(neck.x - R * .5, neck.y); g.quadraticCurveTo(neck.x - sh, neck.y + R * .1, neck.x - sh * 1.05, neck.y + R * 1.2); g.quadraticCurveTo(hip.x - hw * .8, hip.y, b0.x - hw, b0.y); g.lineTo(b0.x + hw, b0.y); g.quadraticCurveTo(hip.x + hw * .8, hip.y, neck.x + sh * 1.05, neck.y + R * 1.2); g.quadraticCurveTo(neck.x + sh, neck.y + R * .1, neck.x + R * .5, neck.y); g.closePath();
  g.fillStyle = '#a8121f'; g.fill(); g.lineWidth = lw * 1.4; g.strokeStyle = ink; g.stroke(); g.save(); g.clip();
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(neck.x + R * .2, neck.y, hw * 2, b0.y - neck.y + 10);
  g.strokeStyle = '#d8a84a'; g.lineWidth = lw * 1.6; g.beginPath(); g.moveTo(neck.x - R * .5, neck.y); g.lineTo(hip.x - R * .3, b0.y); g.moveTo(neck.x + R * .5, neck.y); g.lineTo(hip.x + R * .3, b0.y); g.stroke();
  g.fillStyle = '#f2ece4'; g.beginPath(); g.moveTo(neck.x - R * .45, neck.y); g.lineTo(neck.x, neck.y + R * 1.6); g.lineTo(neck.x + R * .45, neck.y); g.closePath(); g.fill();
  g.strokeStyle = '#ff3b4e'; g.lineWidth = lw * .8; for (let s = 0; s < 3; s++) { const x0 = neck.x + (s - 1) * R * 1.6, y0 = neck.y + R * 1.6; g.beginPath(); for (let i = 0; i < 9; i++) { const y = y0 + i * R * .45; g.moveTo(x0 - R * .12, y); g.lineTo(x0 + R * .12, y + R * .2); } g.stroke(); }
  g.restore();
  // face: porcelain oval, centre-parted black fringe, stitched eyes, red lips, blush
  g.fillStyle = '#f6efe8'; g.beginPath(); g.ellipse(head.x, head.y, R * .82, R * 1.0, 0, 0, TAU); g.fill(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke();
  g.save(); g.translate(ht, 0); g.fillStyle = '#100a10'; g.beginPath(); g.moveTo(head.x - R * .9, head.y - R * .1); g.quadraticCurveTo(head.x - R * .95, head.y - R * 1.2, head.x, head.y - R * 1.15); g.quadraticCurveTo(head.x + R * .95, head.y - R * 1.2, head.x + R * .9, head.y - R * .1); g.quadraticCurveTo(head.x + R * .5, head.y - R * .65, head.x, head.y - R * .62); g.quadraticCurveTo(head.x - R * .5, head.y - R * .65, head.x - R * .9, head.y - R * .1); g.fill();
  g.strokeStyle = ink; g.lineWidth = lw * 1.1; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(head.x + sg * R * .55, head.y - R * .02); g.quadraticCurveTo(head.x + sg * R * .35, head.y + R * .06, head.x + sg * R * .14, head.y - R * .02); g.stroke(); g.lineWidth = lw * .7; for (let k = 0; k < 3; k++) { const x = head.x + sg * R * (.2 + k * .14); g.beginPath(); g.moveTo(x, head.y - R * .11); g.lineTo(x, head.y + R * .1); g.stroke(); } g.lineWidth = lw * 1.1; g.fillStyle = rgba('#e8808a', .45); g.beginPath(); g.ellipse(head.x + sg * R * .45, head.y + R * .32, R * .15, R * .08, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#c8121f'; g.beginPath(); g.ellipse(head.x, head.y + R * .55, R * .13, R * .065, 0, 0, TAU); g.fill();
  if (o.eyeGlow) { g.save(); g.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) glow(g, head.x + sg * R * .35, head.y, R * .45, o.eyeCol || '#ff3b4e', .8 * o.eyeGlow); g.restore(); }
  g.restore();
  // arms + temple-door hands: shoulder ball joint -> elbow -> wrist joint -> big flat hand that swings outward with open
  for (const sg of [-1, 1]) { const shp = project(W3(sg * .28, .82, .05)), el = project(W3(sg * (.42 + open * .1), .55, .15)), wr = project(W3(sg * (.18 + open * .42), .52, .32)); if (!shp || !el || !wr) continue;
    for (const [a, b] of [[shp, el], [el, wr]]) { g.strokeStyle = ink; g.lineWidth = R * .34 + lw * 2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.strokeStyle = '#a8121f'; g.lineWidth = R * .34; g.stroke(); }
    for (const j of [shp, el, wr]) { g.fillStyle = '#f2eae2'; g.beginPath(); g.arc(j.x, j.y, R * .17, 0, TAU); g.fill(); g.lineWidth = lw * .8; g.strokeStyle = ink; g.stroke(); }
    const ang = sg * (.15 + open * 1.25); g.save(); g.translate(wr.x, wr.y); g.rotate(ang); g.fillStyle = '#f6efe8'; g.beginPath(); g.moveTo(-R * .25, 0); g.lineTo(R * .25, 0); g.lineTo(R * .3, -R * 1.25); g.quadraticCurveTo(0, -R * 1.45, -R * .3, -R * 1.25); g.closePath(); g.fill(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); g.lineWidth = lw * .5; for (let f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(f * R * .1, -R * .55); g.lineTo(f * R * .1, -R * 1.25); g.stroke(); } g.restore(); }
  g.restore();
};
// red zig-zag stitches sewing along a world polyline (progress = t / o.dur), gold seam glow
function fxStitches(g, pts, t, o = {}) {
  if (t < 0 || pts.length < 2) return; const u = clamp(t / (o.dur || .6), 0, 1), sp = pts.map(p => gowQ(p)).filter(Boolean); if (sp.length < 2) return; const w = o.w || 10;
  let L = 0; const seg = []; for (let i = 1; i < sp.length; i++) { const d = Math.hypot(sp[i].x - sp[i - 1].x, sp[i].y - sp[i - 1].y); seg.push(d); L += d; } const upto = L * u;
  g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(o.seam || '#e8c47a', .5); g.lineWidth = w * .6; g.beginPath(); g.moveTo(sp[0].x, sp[0].y); let acc = 0; for (let i = 1; i < sp.length; i++) { const d = seg[i - 1]; if (acc + d > upto) { const f = (upto - acc) / d; g.lineTo(lerp(sp[i - 1].x, sp[i].x, f), lerp(sp[i - 1].y, sp[i].y, f)); break; } g.lineTo(sp[i].x, sp[i].y); acc += d; } g.stroke();
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = o.col || '#b3122a'; g.lineWidth = Math.max(1.5, w * .28); acc = 0; let s = 0;
  for (let i = 1; i < sp.length; i++) { const a = sp[i - 1], b = sp[i], d = seg[i - 1], ux = (b.x - a.x) / (d || 1), uy = (b.y - a.y) / (d || 1); for (let x = (s ? 0 : 0); x < d; x += w * .9) { if (acc + x > upto) { i = sp.length; break; } const px = a.x + ux * x, py = a.y + uy * x; g.beginPath(); g.moveTo(px - uy * w - ux * w * .3, py + ux * w - uy * w * .3); g.lineTo(px + uy * w + ux * w * .3, py - ux * w + uy * w * .3); g.stroke(); } acc += d; }
  g.restore();
}
function fxStitchPath(g, a, b, t, o = {}) { const pts = []; for (let i = 0; i <= 12; i++) pts.push(vAdd(vLerp(a, b, i / 12), [0, .01, 0])); fxStitches(g, pts, t, Object.assign({ dur: .8, w: 12 }, o)); }
function fxRedReiatsu(g, F, t, o = {}) { fxAura(g, F, t, Object.assign({ col: '#d8243a', col2: '#ffb0b8', size: .5, inkCol: '#3a0408' }, o)); }

// ============================================================================================================ DAZAI
(function () {
  const D = CAST.dazai, F = D.forms, f0 = D.face;
  const wetHair = Object.assign({}, f0.hair, { col: '#3a2418', shadeCol: '#1e100a', glossCol: '#9a7a6a', cap: { front: .5, side: 0, back: -.9 },
    locks: () => f0.hair.locks().map(L => Object.assign({}, L, { grav: (L.grav || 0) + 1.6, curl: L.curl ? [L.curl[0] * .4, L.curl[1] * .5 - .2, L.curl[2] * .4] : null, wave: null, len: (L.len || 1) * 1.08, gloss: true })) });
  F.wet = { wet: true, haori: Object.assign({}, D.haori, { col: '#a8946c', lining: '#806c4c' }), sleeve: Object.assign({}, D.sleeve, { col: '#a8946c', lining: '#806c4c' }), face: Object.assign({}, f0, { hair: wetHair, defaultExpr: 'calm' }) };
  F.wet_nocoat = Object.assign({}, F.nocoat, { wet: true, face: F.wet.face });
  const old = D.extras; D.extras = (S, Dd, Fg, t, parts, opt) => { old(S, Dd, Fg, t, parts, opt); if (Dd.wet) parts.push({ z: camDepth(S.J.head) - .2, fn: c => { if (opt.mode === 'flat' || LIGHT.override) return; const HM = headModel(S, Dd); for (let i = 0; i < 7; i++) { const ph = (t * 1.3 + hash(i)) % 1, p = HM.toW([(hash(i * 3) - .5) * 1.6, .2 - ph * 2.2 - hash(i * 5) * .4, .9]), q = project(p); if (!q) continue; const r = Math.max(1, HM.r * q.s * .05); c.fillStyle = 'rgba(220,235,255,.85)'; c.beginPath(); c.moveTo(q.x, q.y - r * 2); c.quadraticCurveTo(q.x + r, q.y, q.x, q.y + r); c.quadraticCurveTo(q.x - r, q.y, q.x, q.y - r * 2); c.fill(); } } }); };
})();
Object.assign(POSES, {
  dazai_think: { sp: .02, hp: .1, hr: .14, aR: [1.0, -.55, .2], eR: 2.45, hR: 'relax', wR: [.25, .1], aL: [.7, -.55, 0], eL: 1.65, hL: 'relax', lL: [.1, .1, .3], kL: .15, lR: [-.04, .08, -.2], face: { mouth: 'smirk', eye: .55, lid: .15, look: [.25, .15] } },
  dazai_shrug: { sp: -.06, hp: -.05, hr: .15, shL: [.12, 0], shR: [.12, 0], aL: [.6, .9, 0], eL: 1.5, hL: 'open', wL: [-.6, 0], aR: [.6, .9, 0], eR: 1.5, hR: 'open', wR: [-.6, 0], face: { mouth: 'smile', eye: .4, closedUp: 1 } },
  dazai_finger: { sp: .02, hp: .05, aR: [1.4, .3, 0], eR: 1.6, hR: 'point', wR: [-.3, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', face: { mouth: 'smile', mouthOpen: .25, eye: .6 } },
  dazai_reach: { sp: .14, st: -.25, hp: .08, aR: [1.4, .0, 0], eR: .3, hR: 'open', wR: [-.7, 0], aL: [.16, .3, .35], eL: .45, hL: 'hid', lL: [.45, .2, .3], kL: .5, lR: [-.3, .15, -.2], kR: .25, face: { mouth: 'line', eye: .6, lid: .25 } },
  dazai_hands: { sp: -.03, hp: -.02, aL: [1.6, 1.0, 0], eL: 1.6, hL: 'open', aR: [1.6, 1.0, 0], eR: 1.6, hR: 'open', face: { mouth: 'smile', mouthOpen: .3, eye: .5 } },
  dazai_drum: { ground: false, pitch: Math.PI, sp: .05, aL: [2.9, .2, 0], eL: .3, hL: 'relax', aR: [2.9, .2, 0], eR: .3, hR: 'relax', lL: [.35, .2, .2], kL: .9, lR: [-.1, .2, -.2], kR: .4, face: { mouth: 'line' } },
});
SIGNATURE.dazai = SIGNATURE.dazai.concat(['dazai_think', 'dazai_shrug', 'dazai_finger', 'dazai_reach', 'dazai_hands']);
// oil drum: blue-grey steel, two ribs, rim; o.lying = on its side (axis along o.axis), o.col, o.r, o.h, o.dent
function drawDrumCan(g, c, o = {}) {
  const r = o.r || .3, h = o.h || .88, col = o.col || '#3a5a7a', ax = o.lying ? vNorm(o.axis || [1, 0, 0]) : [0, 1, 0], base = o.lying ? vAdd(c, [0, r, 0]) : c, top = vMad(base, ax, h);
  const surf = sTube([base, top], v => r * (1 + (Math.abs(v - .33) < .03 || Math.abs(v - .66) < .03 ? .04 : 0)), o.lying ? [0, 1, 0] : [1, 0, 0], 20, 8); drawSurf(g, sampleSurf(surf), { col, shade: .15, borders: { v0: true, v1: true } });
  const cap = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; let u = vNorm(vCross(ax, [0, 0, 1])); if (vLen(vCross(ax, [0, 0, 1])) < .1) u = [1, 0, 0]; const w = vCross(ax, u); cap.push(vAdd(top, vAdd(vMul(u, Math.cos(a) * r), vMul(w, Math.sin(a) * r)))); }
  const fc = vDot(ax, toCam(top)); if (fc > 0) { const sp = projPoly(cap); if (sp.length > 2) { polyPath(g, sp); g.fillStyle = o.open ? '#0c0c10' : shadeHex(col, .15); g.fill(); g.lineWidth = sadInkW(top, 1); g.strokeStyle = LIGHT.ink; g.stroke(); } }
  for (const f of [.33, .66]) limbRing(g, base, top, f, r * 1.04, rgba('#1a2a3a', .8), .9);
}
function fxRain(g, t, o = {}) { // screen-space slanted rain streaks (+ ripple splashes on the ground plane if o.ground)
  const n = o.n || 260, ang = o.ang == null ? .18 : o.ang, a = o.alpha == null ? .55 : o.alpha, col = o.col || '#cfe0ff', len = o.len || 46, sp = o.speed || 1900;
  g.save(); g.strokeStyle = rgba(col, a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const dep = .35 + hash(i * 3) * .65, x = (hash(i * 7) * (W + 300) + t * sp * ang * dep) % (W + 300) - 150, y = (hash(i * 11) * (H + 200) + t * sp * dep) % (H + 200) - 100; g.lineWidth = .8 + dep * 1.6; g.globalAlpha = dep; g.beginPath(); g.moveTo(x, y); g.lineTo(x - ang * len * dep, y - len * dep); g.stroke(); }
  g.globalAlpha = 1; if (o.ground) { for (let i = 0; i < (o.splash || 40); i++) { const ph = (t * 2 + hash(i * 13)) % 1, p = [CAM.cur.target[0] + (hash(i * 5) - .5) * 16, .01, CAM.cur.target[2] + (hash(i * 9) - .5) * 14], q = project(p); if (!q) continue; g.strokeStyle = rgba(col, (1 - ph) * .6); g.lineWidth = 1.2; g.beginPath(); g.ellipse(q.x, q.y, ph * .25 * q.s, ph * .08 * q.s, 0, 0, TAU); g.stroke(); } }
  g.restore();
}
