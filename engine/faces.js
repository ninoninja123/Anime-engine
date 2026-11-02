/* Bleach Showdown engine - faces.js : anime head model, faces, expressions, hair locks.
   The head is a deformed sphere (big cranium, tapering cheeks, pointed chin) rendered by toon.js, so its silhouette
   is correct from every angle.  Facial features are decals placed on the face plane in 3D (affine foreshortening:
   the far eye narrows in 3/4 view and is cut by the cheek line, the mouth slides to the silhouette in profile).
   Nose = small 3D wedge (a line from the front, a protruding profile in side view).  Hair = cap (hairline mask)
   + individual 3D locks (flat tapered tubes) with spring lag; front locks cast a shadow on the face.
   The same model renders full-body (low LOD) and extreme close-ups (high LOD: lashes, iris layers, strand lines).

   EXPRESSIONS: face = { eye: openness (1 normal, 0 closed, 1.3 wide), lid: upper-lid slant (+ angry, - sad),
     brow: height (-1..1), browA: brow angle (+ angry), pupil: size mult, look:[x,y] gaze, mouth: 'line'|'smile'|
     'smirk'|'frown'|'open'|'shout'|'grin'|'teeth'|'o'|'pain'|'laugh', mouthOpen 0..1, mouthW, blush, sweat, tears,
     vein (anger mark), shadow (menacing upper-face shade 0..1), glint, shock (tiny pupils), closed (eyes shut arcs) }
   EXPR holds named presets: calm, angry, smile, smirk, shock, menace, pain, triumph, tears, determined, laugh,
     focused, rage, surprised, bored, eyesClosed, grin.                                                           */
'use strict';
const EXPR = {
  calm: { eye: .95, lid: 0, brow: 0, browA: 0, pupil: 1, mouth: 'line', mouthW: 1 },
  bored: { eye: .55, lid: -.05, brow: -.1, browA: -.05, pupil: 1, mouth: 'line', mouthW: .8 },
  angry: { eye: .85, lid: .35, brow: -.35, browA: .55, pupil: .9, mouth: 'frown', mouthW: 1 },
  rage: { eye: 1.1, lid: .45, brow: -.4, browA: .7, pupil: .65, mouth: 'shout', mouthOpen: 1, vein: 1, shadow: .3 },
  smile: { eye: .8, lid: -.1, brow: .1, browA: -.1, pupil: 1, mouth: 'smile', mouthW: 1.1 },
  smirk: { eye: .75, lid: .1, brow: .05, browA: .15, pupil: 1, mouth: 'smirk', mouthW: 1 },
  grin: { eye: .8, lid: .2, brow: -.1, browA: .3, pupil: .75, mouth: 'grin', mouthOpen: .5, mouthW: 1.4 },
  laugh: { eye: .2, lid: 0, brow: .3, browA: -.2, pupil: 1, mouth: 'laugh', mouthOpen: .9, mouthW: 1.3, closed: 1 },
  shock: { eye: 1.3, lid: -.1, brow: .6, browA: -.3, pupil: .45, mouth: 'o', mouthOpen: .6, shock: 1, sweat: 1 },
  surprised: { eye: 1.2, lid: -.05, brow: .5, browA: -.2, pupil: .8, mouth: 'o', mouthOpen: .35 },
  menace: { eye: .62, lid: .4, brow: -.3, browA: .45, pupil: .55, mouth: 'smirk', shadow: .85, glint: 1 },
  pain: { eye: .45, lid: -.35, brow: .25, browA: -.6, pupil: .8, mouth: 'pain', mouthOpen: .6, sweat: 1 },
  triumph: { eye: .85, lid: .15, brow: .1, browA: .25, pupil: .9, mouth: 'grin', mouthOpen: .3, mouthW: 1.2 },
  tears: { eye: .8, lid: -.3, brow: .35, browA: -.5, pupil: 1.1, mouth: 'frown', tears: 1, glint: 1 },
  determined: { eye: .9, lid: .25, brow: -.2, browA: .35, pupil: .9, mouth: 'line', mouthW: .9 },
  focused: { eye: .7, lid: .3, brow: -.25, browA: .4, pupil: .85, mouth: 'line', mouthW: .8 },
  eyesClosed: { eye: 0, closed: 1, brow: 0, mouth: 'line' },
  shout: { eye: 1, lid: .3, brow: -.3, browA: .5, pupil: .8, mouth: 'shout', mouthOpen: .9 },
};
function expr(name, over) { return Object.assign({}, EXPR.calm, EXPR[name] || {}, over || {}); }

// ------------------------------------------------------------------------------------------------- head geometry
// unit-sphere -> anime head (units of headR). th: 0 = front, + toward the head's left; ph: -PI/2 chin .. PI/2 top
function headShape(th, ph, hs) {
  const cp = Math.cos(ph), sp = Math.sin(ph), ct = Math.cos(th), st = Math.sin(th);
  let x = cp * st, y = sp, z = cp * ct;
  const jaw = hs.jaw == null ? 1 : hs.jaw, chin = hs.chin == null ? 1 : hs.chin;
  if (sp < 0) {
    const s = -sp;
    const tp = (.36 * Math.pow(s, 1.3) + .14 * Math.pow(s, 4)) * jaw * (hs.wide ? .7 : 1);
    x *= 1 - (hs.square ? lerp(tp, (.1 * Math.pow(s, 1.4) + .42 * Math.pow(s, 5)) * jaw, hs.square) : tp);   // square: heavy masculine jaw
    y = -s * (1 + .2 * s * chin);
    if (ct < 0) z *= 1 - .5 * s;
    z = z * (1 - .18 * s) + .19 * s * s * chin;
  } else {
    y = sp * (hs.tall || 1.02);
    if (ct < 0) z *= 1.07;
  }
  if (ct > 0) z *= .93;
  x *= hs.width || .97;
  return [x, y, z];
}
function headModel(S, D, scale = 1) {
  const r = S.B.headR * (D.headScale || 1) * scale, c = S.J.head, M = S.M.head, hs = D.headShape || {};
  const toW = l => vAdd(c, mApply(M, vMul(l, r)));
  const at = (th, ph) => toW(headShape(th, ph, hs));
  return { r, c, M, hs, toW, at, surf: (nu, nv) => ({ nu, nv, wrapU: true, fn: (u, v) => at(u * TAU, (v - .5) * Math.PI) }) };
}
// face-plane frame at (th, ph): normal blended toward head forward (anime faces are flatter than spheres)
function faceFrame(HM, th, ph, flat = .55, size = 1) {
  const p = HM.at(th, ph), e = .01;
  const pu = HM.at(th + e, ph), pv = HM.at(th, ph + e);
  let n = vNorm(vCross(vSub(pu, p), vSub(pv, p)));
  const fwd = HM.M[2], up = HM.M[1];
  n = vNorm(vLerp(n, fwd, flat));
  let tu = vNorm(vCross(up, n)); const tv = vNorm(vCross(n, tu));
  // tu points toward the head's LEFT (x+) when n faces forward
  return { p, n, tu: vMul(tu, HM.r * size), tv: vMul(tv, HM.r * size) };
}

// ------------------------------------------------------------------------------------------------- eye
/* draws one eye in eye-local units: x outward (to the face's side), y up; eye width ~1 unit (scaled by style.w).
   st: style {w, h, tilt, irisCol, irisDark, irisR, pupilR, lash, lower, white, slit, round, thick}           */
function drawEyeLocal(c, e, st, fc, lod, mirror) {
  const open = clamp(e.eye == null ? 1 : e.eye, 0, 1.4), lid = e.lid || 0, w = st.w || 1, h = (st.h || .42) * open;
  const ink = st.ink || LIGHT.ink, tilt = st.tilt || 0;
  // corners
  const ix = -.5 * w, iy = -.02 + lid * .1, ox = .52 * w, oy = .06 + tilt - lid * .02;
  const topY = x => { const u = (x - ix) / (ox - ix); return lerp(iy, oy, u) + Math.sin(Math.PI * Math.pow(clamp(u, 0, 1), st.round ? .9 : .75)) * h * (1 - lid * .45 * (1 - u)) - lid * .14 * (1 - u) * open; };
  const botY = x => { const u = (x - ix) / (ox - ix); return lerp(iy, oy, u) - Math.sin(Math.PI * clamp(u, 0, 1)) * (st.lowerH || .16) * Math.max(.35, open) - .02; };
  const N = 16, top = [], bot = [];
  for (let i = 0; i <= N; i++) { const x = lerp(ix, ox, i / N); top.push([x, topY(x)]); bot.push([x, botY(x)]); }
  if (e.closed || open < .08) { // closed: one arc (happy closed = upward arc)
    const arc = []; for (let i = 0; i <= N; i++) { const x = lerp(ix, ox, i / N), u = i / N; arc.push([x, lerp(iy, oy, u) + (e.closedUp ? 1 : -1) * Math.sin(Math.PI * u) * .1]); }
    inkPts(c, arc, .085 * (st.thick || 1), ink, [.15, .35]); return;
  }
  // eye white
  c.save();
  c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (const p of top) c.lineTo(p[0], p[1]); for (let i = N; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
  c.fillStyle = st.white || '#fbfbff'; c.fill(); c.clip();
  // iris
  const lk = e.look || [0, 0], ir = (st.irisR || .3) * (e.irisK || 1), pr = ir * (st.pupilR || .45) * (e.pupil == null ? 1 : e.pupil) * (e.shock ? .45 : 1);
  const icx = (mirror ? -1 : 1) * lk[0] * .3 + (st.irisX || 0), icy = -.02 + lk[1] * .15 + (st.irisY || 0);
  const irisC = st.irisCol || '#5a4a3a';
  if (!st.blind) {
    c.fillStyle = st.irisDark || shadeHex(irisC, -.55); c.beginPath(); c.ellipse(icx, icy, ir, ir * 1.18, 0, 0, TAU); c.fill();
    c.fillStyle = irisC; c.beginPath(); c.ellipse(icx, icy - ir * .1, ir * .84, ir * 1.02, 0, 0, TAU); c.fill();
    if (lod > 1) { c.fillStyle = st.irisLight || shadeHex(irisC, .35); c.beginPath(); c.ellipse(icx, icy - ir * .55, ir * .7, ir * .55, 0, Math.PI * .05, Math.PI * .95); c.fill();
      c.strokeStyle = rgba('#000000', .25); c.lineWidth = .012; for (let a = 0; a < 12; a++) { const an = a / 12 * TAU; c.beginPath(); c.moveTo(icx + Math.cos(an) * pr * 1.1, icy + Math.sin(an) * pr * 1.3); c.lineTo(icx + Math.cos(an) * ir * .8, icy + Math.sin(an) * ir); c.stroke(); } }
    if (st.irisRing) { c.strokeStyle = st.irisRing; c.lineWidth = ir * .22; c.beginPath(); c.ellipse(icx, icy, ir * .78, ir * .95, 0, 0, TAU); c.stroke(); }
    if (st.irisKanji && lod > 0) { const ch = st.irisKanji[mirror ? 0 : 1]; if (ch) { c.save(); c.translate(icx, icy); c.scale(1, -1); c.fillStyle = st.kanjiCol || '#1a1028'; c.font = `900 ${ch.length > 1 ? ir * .62 : ir * 1.0}px "IPAGothic", "WenQuanYi Zen Hei", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (ch.length > 1) { c.fillText(ch[0], 0, -ir * .34); c.fillText(ch[1], 0, ir * .34); } else c.fillText(ch, 0, 0); c.restore(); } }
    if (st.noPupil) { /* no pupil (Akaza yellow eyes / blank) */ } else if (st.slit) { c.fillStyle = '#120c08'; c.beginPath(); c.ellipse(icx, icy, pr * .35, pr * 1.6, 0, 0, TAU); c.fill(); }
    else { c.fillStyle = st.pupilCol || '#120c10'; c.beginPath(); c.ellipse(icx, icy, pr, pr * 1.15, 0, 0, TAU); c.fill(); }
    if (st.irisFn) st.irisFn(c, icx, icy, ir, pr, e, mirror, lod);   // custom iris (Sharingan / Mangekyo / clock eyes)
    // lid shadow band on the eyeball
    c.fillStyle = rgba(st.lidShade || '#6a5a90', .38); c.beginPath(); c.moveTo(top[0][0], top[0][1] + .2); for (const p of top) c.lineTo(p[0], p[1] - .09 - .04 * open); for (let i = N; i >= 0; i--) c.lineTo(top[i][0], top[i][1] + .3); c.closePath(); c.fill();
    // highlights
    if (e.glint !== 0) {
      const hk = LIGHT.style === 'hand2d' ? 1.45 : 1; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(icx - ir * .35 * (mirror ? -1 : 1), icy + ir * .45, ir * .26 * hk, ir * .2 * hk, -.3, 0, TAU); c.fill(); if (hk > 1) { c.beginPath(); c.ellipse(icx + ir * .3 * (mirror ? -1 : 1), icy - ir * .2, ir * .08, ir * .08, 0, 0, TAU); c.fill(); }
      c.beginPath(); c.ellipse(icx + ir * .38 * (mirror ? -1 : 1), icy - ir * .5, ir * .1, ir * .08, 0, 0, TAU); c.fill();
      if (e.tears || e.glint > .5) { c.beginPath(); c.ellipse(icx + ir * .1, icy + ir * .05, ir * .12, ir * .12, 0, 0, TAU); c.fill(); }
    }
  } else { c.fillStyle = rgba(st.irisCol || '#c8c4d8', .55); c.beginPath(); c.ellipse(icx, icy, ir, ir * 1.1, 0, 0, TAU); c.fill(); }
  c.restore();
  // lid lines
  const lt = (st.thick || 1) * (.11 + .02 * (lod > 1 ? 1 : 0));
  inkPts(c, top.map(p => [p[0], p[1] + .01]), lt, ink, [.08, .12]);
  if (st.lash !== false) { // outer flick + small lashes
    const o = top[N]; inkPts(c, [[o[0] - .1, o[1] + .03], [o[0] + .07, o[1] + .05 + (st.flick || .06)], [o[0] + .16, o[1] + .06 + (st.flick || .06) * 1.6]], lt * .9, ink, [0, .8]);
    if (lod > 1 && st.lashes) for (let i = 0; i < 4; i++) { const p = top[N - 2 - i * 2]; inkPts(c, [[p[0], p[1]], [p[0] + .05, p[1] + .1]], lt * .5, ink, [0, .9]); }
  }
  if (st.lower !== false) inkPts(c, bot.slice(Math.round(N * .35)).map(p => [p[0], p[1] - .005]), lt * .38, ink, [.4, .2]);
  if (st.crease && lod > 0) { const cr = top.slice(5, N - 3).map(p => [p[0] + .03, p[1] + .09 + .03 * open]); inkPts(c, cr, lt * .22, ink, [.4, .4]); }
  if (e.tears) { c.fillStyle = 'rgba(210,235,255,.85)'; c.beginPath(); c.moveTo(-.1, bot[8][1]); c.quadraticCurveTo(-.05, -.6, -.08, -1.1); c.quadraticCurveTo(-.18, -.6, -.2, bot[6][1]); c.fill(); }
}
function drawBrowLocal(c, e, st) {
  const by = .55 + (e.brow || 0) * .12 + (st.browY || 0), ba = (e.browA || 0) * .22, ink = st.browCol || st.ink || LIGHT.ink;
  const pts = [[-.52, by - ba], [-.1, by + .05 - ba * .3], [.35, by + .04], [.62, by - .06 + ba * .3]];
  inkPts(c, catmull(pts, false, 4), (st.browW || .07), ink, [.15, .7]);
  if (st.browFork) inkPts(c, [[-.3, by - ba * .7 - .02], [.05, by + .11 - ba * .2], [.3, by + .17]], (st.browW || .07) * .75, ink, [.1, .9]);
}
// ------------------------------------------------------------------------------------------------- mouth (mouth-local units, width ~1)
function drawMouthLocal(c, e, st, lod) {
  let m0 = e.mouth || 'line'; if (st.teethAlways && /^(line|smile|smirk|frown)$/.test(m0)) { e = Object.assign({}, e, { mouth: 'grin', mouthOpen: Math.max(.3, e.mouthOpen || 0) }); }
  const ink = st.ink || LIGHT.ink, m = e.mouth || 'line', o = e.mouthOpen || 0, w = .5 * (e.mouthW || 1) * (st.mouthW || 1);
  const lw = .07 * (st.mouthInk || 1);
  const inner = st.mouthIn || '#5a1e26', tongue = '#c0545a', teeth = '#fbf7f0';
  const fillShape = (pts, col) => { polyPath(c, pts); c.fillStyle = col; c.fill(); };
  if (m === 'line') { inkPts(c, [[-w, .02], [0, -.01], [w, .02]], lw, ink, [.3, .3]); return; }
  if (m === 'smile' || m === 'smirk') {
    const sk = m === 'smirk' ? 1 : 0;
    inkPts(c, catmull([[-w, .1 - sk * .08], [-w * .3, -.04], [w * .4, -.03], [w * 1.05, .14 + sk * .1]], false, 5), lw, ink, [.3, .3]);
    if (sk && lod > 0) inkPts(c, [[w * .95, .2], [w * 1.12, .1]], lw * .6, ink, [.3, .3]); return;
  }
  if (m === 'frown') { inkPts(c, catmull([[-w, -.08], [-w * .3, .03], [w * .3, .03], [w, -.08]], false, 5), lw, ink, [.3, .3]); return; }
  const h = .12 + .55 * o;
  let poly;
  if (m === 'o') { poly = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; poly.push([Math.cos(a) * w * .45, -h * .5 + Math.sin(a) * h * .5]); } }
  else if (m === 'shout' || m === 'laugh') poly = catmull([[-w, .06], [0, .1], [w, .06], [w * .6, -h * .7], [0, -h], [-w * .6, -h * .7]], true, 4);
  else if (m === 'pain') poly = catmull([[-w, -.05], [-w * .3, .06], [w * .3, .06], [w, -.05], [w * .5, -h * .6], [-w * .5, -h * .6]], true, 4);
  else /* grin / teeth / open */ poly = catmull([[-w * 1.05, .08], [0, .02], [w * 1.05, .08], [w * .7, -h * .45], [0, -h * .62], [-w * .7, -h * .45]], true, 4);
  fillShape(poly, inner);
  c.save(); polyPath(c, poly); c.clip();
  if (m === 'grin' || m === 'teeth' || st.teeth) { // clenched teeth: upper + lower rows with gaps
    c.fillStyle = teeth; c.fillRect(-2, -h * .5 + .01, 4, 2);
    c.fillRect(-2, -5, 4, 5 - h * .5 - .06);
    c.strokeStyle = ink; c.lineWidth = .025; c.beginPath();
    for (let x = -w; x <= w; x += w / (st.teethN || 4)) { c.moveTo(x, .2); c.lineTo(x, -h); } c.moveTo(-2, -h * .5 + .01); c.lineTo(2, -h * .5 + .01); c.stroke();
    if (st.fangs) { c.fillStyle = teeth; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * w * .55, 0); c.lineTo(sx * w * .45, -h * .45); c.lineTo(sx * w * .35, 0); c.fill(); } }
  } else {
    c.fillStyle = teeth; c.fillRect(-w * .7, -.02, w * 1.4, .09 + o * .05);
    c.fillStyle = tongue; c.beginPath(); c.ellipse(0, -h * .95, w * .55, h * .35, 0, 0, TAU); c.fill();
  }
  c.restore();
  polyPath(c, poly); c.lineWidth = lw * .9; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke();
}

// ------------------------------------------------------------------------------------------------- hair locks
/* lock spec (head-local, units of headR): { th, ph: root on scalp, len, w: root width, dir:[x,y,z] start direction,
   curl:[x,y,z] per-unit bend, grav: gravity pull, tw: thickness ratio (flatness), wave:[amp,freq], spring: weight,
   col, tip: tip sharpness power, seg: segments, round: true -> cylindrical (dreadlock) }                       */
const HAIR_SWAY = { amp: .045, f: 1.7 };   // idle hair life (head-radius units); set HAIR_SWAY.amp = 0 to freeze
function lockCurve(HM, L, lag, t) {
  const n = L.seg || 7, pts = [];
  const r0 = L.rootR || 1.0;
  let p = vMul(headShape(L.th, L.ph, HM.hs), r0);
  let d = vNorm(L.dir || headShape(L.th, L.ph, HM.hs));
  const step = (L.len || 1) / n;
  const Minv = mT(HM.M);
  const gl = mApply(Minv, [0, -1, 0]); // world gravity in head-local
  const lagL = lag ? mApply(Minv, vMul(lag, 1 / HM.r)) : [0, 0, 0];
  pts.push(HM.toW(p));
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    if (L.curl) d = vNorm(vAdd(d, vMul(L.curl, step)));
    if (L.grav) d = vNorm(vAdd(d, vMul(gl, L.grav * step)));
    if (L.wave) { const wv = Math.sin(u * L.wave[1] * TAU + (L.wave[2] || 0)) * L.wave[0]; d = vNorm(vAdd(d, vMul(L.waveAxis || [1, 0, 0], wv * step))); }
    p = vMad(p, d, step);
    let q = vMad(p, lagL, Math.pow(u, 1.4) * (L.spring == null ? (L.front ? .3 : 1) : L.spring));
    if (HAIR_SWAY.amp && t != null) { const ph = (L.th || 0) * 2.3 + (L.ph || 0) * 1.7, a = HAIR_SWAY.amp * Math.pow(u, 1.6) * (L.front ? .45 : 1) * (L.sway == null ? 1 : L.sway); q = vAdd(q, [Math.sin(t * HAIR_SWAY.f + ph) * a, Math.sin(t * HAIR_SWAY.f * .7 + ph * 1.3) * a * .3, Math.cos(t * HAIR_SWAY.f * .8 + ph) * a * .6]); }
    pts.push(HM.toW(q));
  }
  return pts;
}
function lockSurf(HM, L, pts) {
  const nrm = HM.toW(vMul(headShape(L.th, L.ph, HM.hs), 2)); const hint = vNorm(vSub(nrm, HM.c));
  const w = (L.w || .3) * HM.r, tw = L.round ? 1 : (L.tw || .35), tp = L.tip || 1.1;
  return sTube(pts, (v) => w * Math.pow(1 - v, tp) * (v < .12 ? .75 + v * 2 : 1) * (L.bulge ? 1 + L.bulge * Math.sin(v * Math.PI) : 1) + (L.round ? w * .25 * (1 - v) : 0) + .0008,
    hint, L.round ? 8 : 10, L.seg || 7, { sx: tw, sz: 1, round: .3 });
}
/* ------------------------------------------------------------------------------------------------- standard head
   design.face = { style (eye style object), browStyle, mouthStyle, skin, skinShade, cheek:true, ears:true,
                   hair: { col, cap: {front, side, back} hairline phases, capScale, locks: [...], springK },
                   markings(ctx, HM, faceFn), noseK, details(ctx, HM, ...) }                                    */
function stdHead(D) {
  return function (S, D2, F, t, parts, opt) {
    const HM = headModel(S, D2), fz = D2.face || {}, hair = fz.hair || {};
    const zc = camDepth(HM.c);
    const e = Object.assign({}, EXPR.calm, D2.face && D2.face.defaultExpr ? expr(D2.face.defaultExpr) : {}, (S.pose.face) || {});
    // spring lag for hair (whole head as anchor)
    const lag = F && F.springWin && hair.spring !== false ? springLag(F, t, s2 => s2.J.head, hair.springK || 45, hair.springC || 7, HM.r * 3, 'hair', 1.4) : [0, 0, 0];
    const locks = (typeof hair.locks === 'function' ? hair.locks(S, D2, t) : hair.locks) || [];
    const geo = locks.map(L => { const pts = lockCurve(HM, L, lag, t); return { L, pts, z: camDepth(pts[Math.min(pts.length - 1, Math.round(pts.length * (L.zAt || .5)))]) }; });
    const front = geo.filter(g => g.L.front || (g.z < zc - HM.r * .2 && !g.L.back));
    // head part (face skin, features, cap)
    parts.push({ z: zc, fn: c => drawHeadCore(c, S, D2, F, t, HM, e, front, opt) });
    for (const g of geo) {
      const isFront = front.includes(g);
      parts.push({ z: isFront ? Math.min(g.z, zc - .0005) : Math.max(g.z, zc + (g.L.back ? .02 : -.0) * 0), fn: c => drawLock(c, HM, g, hair, opt, D2) });
    }
    if (fz.extraParts) fz.extraParts(S, D2, F, t, parts, opt, HM, e, zc);
  };
}
function drawLock(c, HM, g, hair, opt, D) {
  if (opt.mode !== 'flat' && !LIGHT.override && !hair.tubeLocks) return drawLock2D(c, HM, g, hair, opt, D);
  const surf = lockSurf(HM, g.L, g.pts), G = sampleSurf(surf);
  const col = g.L.col || hair.col || '#222';
  drawSurf(c, G, Object.assign({ col, shade: g.L.shade == null ? .05 : g.L.shade, shadeCol: hair.shadeCol, borders: { v0: false, v1: false },
    rim: false, gloss: hair.gloss && g.L.gloss ? { mask: (u, v, P, N) => Math.min(.05 - Math.abs(v - (hair.glossV || .22)), vDot(N, LIGHT.key) - .15), col: hair.glossCol || shadeHex(col, .45) } : null,
    inkW: g.L.inkW || .9 }, opt.surf || {}));
}
function drawHeadCore(c, S, D, F, t, HM, e, frontLocks, opt) {
  const fz = D.face || {}, hair = fz.hair || {}, flat = opt.mode === 'flat';
  const sc = project(HM.c); if (!sc) return; const pxR = HM.r * sc.s, lod = pxR > 260 ? 2 : pxR > 70 ? 1 : 0;
  const nu = lod === 2 ? 48 : lod === 1 ? 34 : 24, nv = lod === 2 ? 34 : lod === 1 ? 24 : 16;
  const G = sampleSurf(HM.surf(nu, nv));
  let headPath = null;
  // ears (behind the face silhouette but in front of back hair)
  if (fz.ears !== false) for (const sg of [1, -1]) drawEar(c, HM, sg, D, flat, opt);
  drawSurf(c, G, Object.assign({ col: D.skin, shade: (D.face && D.face.shade != null) ? D.face.shade : -.36, shadeCol: D.skinShade, handShade: true, h2d: .12, hiCrescent: D.face && D.face.hiCrescent != null ? D.face.hiCrescent : .0, onRegion: (cc, reg) => { headPath = reg.path; } }, opt.surf || {}));
  if (flat || !headPath || LIGHT.override) { if (hair.cap !== false) drawHairCap(c, HM, hair, nu, nv, opt); return; }
  const fwdFacing = vDot(HM.M[2], toCam(HM.c));
  // face features clipped to the head silhouette
  c.save(); c.clip(headPath);
  // cast shadow of front locks onto the face
  if (frontLocks.length && hair.castShadow !== false) {
    const off = pxR * .09;
    c.save(); c.translate(off * .35, off); c.globalAlpha = .9;
    for (const g of frontLocks) { const G2 = sampleSurf(lockSurf(HM, g.L, g.pts)); const r = clipRegion(G2, [fieldFacing(G2, 1, .2)], false); c.fillStyle = tones(D.skinShade || shadeHex(D.skin, -.2)).base; c.fill(r.path); }
    c.restore();
  }
  // menacing upper-face shadow
  if (e.shadow) { const fr = faceFrame(HM, 0, .05, .8, 1); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = rgba('#2a1838', .55 * e.shadow); cc.fillRect(-1.6, -.25, 3.2, 2); }, -1, fr.n); }
  if (fz.cheek !== false && lod > 0 && e.blush) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * .62, -.48, .3, .22); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = rgba('#e05a6a', .7 * e.blush); cc.lineWidth = .12; for (let i = -1; i <= 1; i++) { cc.beginPath(); cc.moveTo(i * .5 - .2, -.3); cc.lineTo(i * .5 + .2, .3); cc.stroke(); } }, .05, fr.n); }
  if (fz.markings) fz.markings(c, HM, e, lod, D);
  // eyes + brows
  const st = Object.assign({ w: 1, h: .42, irisR: .3 }, fz.eye || {}); if (fz.eyeHook) fz.eyeHook(st, S, D, e); if (pxR < 110) { const k = clamp(110 / Math.max(8, pxR), 1, 2.8); st.thick = (st.thick || 1) * k; st.browW = (fz.brow && fz.brow.browW || .07) * k; }
  const ex = fz.eyeX || .44, ey = fz.eyeY || -.2, esz = (fz.eyeSize || .36) * (pxR < 60 ? lerp(1.34, 1, clamp((pxR - 12) / 48, 0, 1)) : 1);   // small heads (720p delivery: boost from 60 px): slightly larger eyes stay readable
  if (!fz.noEyes) for (const sg of [1, -1]) {
    const fr = faceFrame(HM, sg * ex * 1.05, ey, fz.flat == null ? .5 : fz.flat, esz);
    const mir = sg < 0; // right eye: outward = -tu
    const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1);
    decal(c, fr.p, tu, vMul(fr.tv, 1), (cc, fcv) => {
      cc.scale(1, -1); cc.scale(1, -1); // local y up handled by tv direction (tv = up)
      cc.save(); cc.scale(1, 1); drawEyeLocal(withYUp(cc), e, st, fcv, lod, mir); cc.restore();
      if (fz.brows !== false && !fz.browOverHair) drawBrowLocal(cc, e, Object.assign({}, st, fz.brow || {}, st.browW ? { browW: st.browW } : {}));
    }, -0.15, fr.n);
  }
  // nose
  if (!fz.noNose) drawNose(c, HM, D, lod, fwdFacing);
  // mouth
  if (!fz.noMouth) { const fr = faceFrame(HM, 0, fz.mouthY || -.78, .45, fz.mouthSize || .26); decal(c, fr.p, fr.tu, fr.tv, cc => drawMouthLocal(cc, e, Object.assign({}, st, fz.mouth || {}, pxR < 110 ? { mouthInk: clamp(110 / Math.max(8, pxR), 1, 2.6) } : {}), lod), -0.25, fr.n); }
  if (e.sweat && lod > 0) { const fr = faceFrame(HM, .75, .2, .2, .18); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.fillStyle = 'rgba(200,230,255,.9)'; cc.beginPath(); cc.moveTo(0, .8); cc.quadraticCurveTo(.5, -.3, 0, -.5); cc.quadraticCurveTo(-.5, -.3, 0, .8); cc.fill(); cc.lineWidth = .08; cc.strokeStyle = LIGHT.ink; cc.stroke(); }, .05, fr.n); }
  if (fz.details) fz.details(c, HM, e, lod, D);
  c.restore();
  // contour shading under chin onto neck is handled by neck draw order; hair cap over the head
  if (hair.cap !== false) drawHairCap(c, HM, hair, nu, nv, opt);
  if (e.vein && lod > 0) { const fr = faceFrame(HM, -.45, .42, .3, .3); decal(c, fr.p, fr.tu, fr.tv, cc => { cc.strokeStyle = '#c0283a'; cc.lineWidth = .14; cc.lineCap = 'round'; for (let i = 0; i < 4; i++) { const a = i * HP + .4; cc.beginPath(); cc.arc(Math.cos(a) * .55, Math.sin(a) * .55, .32, a + 2.2, a + 4.1); cc.stroke(); } }, -.2, fr.n); }
  if (fz.browOverHair && fz.brows !== false) for (const sg of [1, -1]) { const fr = faceFrame(HM, sg * ex * 1.05, ey, .5, esz); const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1); decal(c, fr.p, tu, fr.tv, cc => drawBrowLocal(withYUp(cc), e, Object.assign({}, st, fz.brow || {})), .1, fr.n); }
}
// decal frame: tv maps to screen 'up' already (proj of +tv), so local +y is up in eye coordinates. Canvas y-down
// does not apply because the affine is built from world vectors. withYUp is identity (kept for clarity).
function withYUp(c) { return c; }
function drawEar(c, HM, sg, D, flat, opt) {
  const fr = faceFrame(HM, sg * 1.5, -.25, 0, .3); const f = vDot(fr.n, toCam(fr.p)); if (f < -.2) return;
  const tu = sg > 0 ? fr.tu : vMul(fr.tu, -1);
  const p = vMad(fr.p, fr.n, HM.r * .03);
  decal(c, p, vMul(HM.M[2], -HM.r * .3 * sg * sg), fr.tv, cc => {
    cc.beginPath(); cc.moveTo(-.55, .55); cc.bezierCurveTo(.2, 1.1, .8, .5, .5, -.2); cc.bezierCurveTo(.3, -.8, -.1, -1, -.45, -.75); cc.closePath();
    cc.fillStyle = flat ? opt.col : tones(D.skin).base; cc.fill(); if (!flat) { cc.lineWidth = .1; cc.strokeStyle = LIGHT.ink; cc.stroke(); cc.beginPath(); cc.moveTo(-.2, .4); cc.quadraticCurveTo(.4, .5, .2, -.3); cc.lineWidth = .06; cc.stroke(); }
  }, -1, fr.n);
}
function drawNose(c, HM, D, lod, fwdFacing) {
  const k = (D.face && D.face.noseK) || 1;
  const L = (x, y, z) => HM.toW([x, y, z]);
  const zf = headShape(0, -.36, HM.hs)[2];
  const bridge = L(0, -.34, zf + .06), tip = L(0, -.5 * k, zf + .15 * k), base = L(0, -.56 * k, zf + .03);
  const wingL = L(.07, -.53 * k, zf + .02), wingR = L(-.07, -.53 * k, zf + .02);
  const pb = proj2(bridge), pt = proj2(tip), pbs = proj2(base), s = pxScale(tip), lw = lineW(s, .7);
  // which side is shadowed: the side away from the key light
  const right = HM.M[0]; const shadeSide = vDot(right, LIGHT.key) > 0 ? -1 : 1;
  const wing = proj2(shadeSide > 0 ? wingL : wingR);
  c.fillStyle = tones(D.skinShade || shadeHex(D.skin, -.18)).base;
  c.beginPath(); c.moveTo(pb[0], pb[1]); c.lineTo(pt[0], pt[1]); c.lineTo(wing[0], wing[1]); c.closePath(); c.globalAlpha = lod > 0 ? .8 : .5; c.fill(); c.globalAlpha = 1;
  // ink: profile edge when turned, otherwise a short tip line
  const side = 1 - Math.abs(fwdFacing);
  const nc = LIGHT.style === 'hand2d' ? mixHex(LIGHT.ink, D.skinShade || '#a06a5a', .45) : LIGHT.ink;
  if (side > .35) inkPts(c, [pb, pt, pbs], lw * 1.1, nc, [.6, .1]);
  else inkPts(c, [[lerp(pt[0], wing[0], .2), lerp(pt[1], wing[1], .2) - 1], pt, [lerp(pt[0], pbs[0], .6), lerp(pt[1], pbs[1], .6)]], lw * .9, nc, [.4, .3]);
}
// hair cap: slightly enlarged head surface masked by a hairline
function drawHairCap(c, HM, hair, nu, nv, opt) {
  const cap = hair.cap || {}, sc = hair.capScale || 1.07;
  const surf = { nu, nv: Math.round(nv * .8), wrapU: true, v0: .3, fn: (u, v) => { const l = headShape(u * TAU, (v - .5) * Math.PI, HM.hs); return HM.toW([l[0] * sc * (cap.wx || 1), l[1] * sc + (cap.dy || 0), l[2] * sc * (cap.wz || 1) + (cap.dz || 0)]); } };
  const fr = cap.front == null ? .32 : cap.front, sd = cap.side == null ? -.1 : cap.side, bk = cap.back == null ? -.75 : cap.back;
  const mask = (u, v) => { const th = angOf(u), ph = (v - .5) * Math.PI, a = Math.abs(th) / Math.PI;
    const hl = a < .5 ? lerp(fr, sd, smooth(a / .5)) : lerp(sd, bk, smooth((a - .5) / .5));
    return ph - hl + (cap.jag ? Math.sin(th * (cap.jagN || 18)) * cap.jag : 0); };
  drawSurf(c, sampleSurf(surf), Object.assign({ col: hair.col, shade: .08, rim: false, shadeCol: hair.shadeCol, masks: [mask], maskInk: [true], maskW: .6, borders: { v0: false, v1: false },
    gloss: hair.gloss ? { mask: (u, v, P, N) => { const tri = Math.abs(((u * 34) % 1) - .5) * 2; return Math.min(.035 + .045 * tri - Math.abs(v - .8), vDot(N, LIGHT.key) - .2); }, col: hair.glossCol || shadeHex(hair.col, .45) } : null }, opt.surf || {}));
}

/* HAND2D hair lock: a brush-shaped 2D ribbon built on the projected lock centreline: flat fill, hand-placed shadow on
   the side away from the light, a sawtooth highlight near the root, ink thick at the root and tapering to the tip.    */
function drawLock2D(c, HM, g, hair, opt, D) {
  const pts = g.pts.map(p => proj2(p)), n = pts.length; if (n < 2) return; const L = g.L;
  const s = pxScale(g.pts[0]), w0 = (L.w || .3) * HM.r * s * (L.round ? .6 : .78), tp = L.tip || 1.1;
  const ld = lightDir2D(HM.c), left = [], right = [], mid = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const v = i / (n - 1);
    let w = w0 * Math.pow(1 - v, tp) * (v < .12 ? .7 + v * 2.5 : 1) + (L.round ? w0 * .25 * (1 - v) : 0); if (i === n - 1) w = 0;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); mid.push(pts[i]); }
  const col = L.col || hair.col || '#222', T = tones(col), Ts = hair.shadeCol ? tones(hair.shadeCol) : null;
  const poly = left.concat(right.slice().reverse());
  polyPath(c, catmull(poly, true, 2)); c.fillStyle = T.base; c.fill();
  // which side faces away from the light
  const a = pts[0], b = pts[Math.min(n - 1, 2)]; const nx = -(b[1] - a[1]), ny = b[0] - a[0]; const leftLit = (nx * ld[0] + ny * ld[1]) > 0;
  const shadeEdge = leftLit ? right : left, litEdge = leftLit ? left : right;
  c.save(); polyPath(c, catmull(poly, true, 2)); c.clip();
  { const sh = [], k0 = n - 1; for (let i = 0; i <= k0; i++) { const v = i / k0, kk = clamp(v / .75, 0, 1); sh.push([lerp(mid[i][0], shadeEdge[i][0], kk * .9), lerp(mid[i][1], shadeEdge[i][1], kk * .9)]); }
    polyPath(c, sh.concat(shadeEdge.slice().reverse())); c.fillStyle = Ts ? Ts.base : T.shade; c.fill(); }
  if (L.gloss && hair.gloss !== false && n > 4) { const i0 = 1, i1 = Math.max(2, Math.floor(n * .38)), hl = []; for (let i = i0; i <= i1; i++) { const k = (i - i0) % 2 ? .25 : .62; hl.push([lerp(litEdge[i][0], mid[i][0], k), lerp(litEdge[i][1], mid[i][1], k)]); } polyPath(c, litEdge.slice(i0, i1 + 1).concat(hl.reverse())); c.fillStyle = hair.glossCol || shadeHex(col, .4); c.globalAlpha = .9; c.fill(); c.globalAlpha = 1; }
  const tipC = L.tipCol || hair.tipCol; if (tipC && n > 3) { const k0 = Math.floor((n - 1) * (1 - (L.tipLen || hair.tipLen || .35))); polyPath(c, catmull(left.slice(k0).concat(right.slice(k0).reverse()), true, 2)); c.fillStyle = tones(tipC).base; c.fill(); }
  c.restore();
  const lw = lineW(s, .95) * (L.inkW || 1);
  inkPts(c, left, lw * 1.25, LIGHT.ink, [.02, .9]); inkPts(c, right, lw * 1.25, LIGHT.ink, [.02, .9]);
  if (n > 5 && w0 > 6) { const st = []; for (let i = 1; i < n - 1; i++) st.push([lerp(mid[i][0], shadeEdge[i][0], .35), lerp(mid[i][1], shadeEdge[i][1], .35)]); inkPts(c, st, lw * .5, rgba(LIGHT.ink, .7), [.2, .5]); }
}
