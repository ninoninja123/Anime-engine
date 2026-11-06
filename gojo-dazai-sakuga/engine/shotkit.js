/* Bleach Showdown engine - shotkit.js : conveniences for writing shots quickly.
   fig(name, form, at, opts)        -> figure (makeFig with CAST[name]); at = pose fn or poseKeys array
   P(name, over)                     -> pose (alias of pose())
   K(keys)                           -> poseKeys(keys)   keys: [[t, poseOrName, ease], ...]
   at(pos, yaw, p)                   -> copy of pose p placed at pos with yaw
   walkCycle(ph, over) runCycle(ph, over)   cycles (phase in cycles)
   hitStop(t, stops)                 -> time remap that freezes during [[t0, dur], ...] (impact hit-stop for figures)
   lookAt(from, to)                  -> yaw so a character at `from` faces `to`
   GRADES / gradeFor(pal)            default colour scripts per palette, POSTS (bloom etc. presets)
   std(f, o)                         applies grade+post presets: o = { pal, grade, post }                     */
'use strict';
function fig(name, form, atFn, opts = {}) { const at = Array.isArray(atFn) ? poseKeys(atFn) : atFn; return makeFig(CAST[name], Object.assign({ form: form || 'base', at }, opts)); }
const P = (name, over) => pose(name, over);
const K = keys => poseKeys(keys);
function at(pos, yaw, p) { return Object.assign({}, typeof p === 'string' ? pose(p) : p, { pos, yaw }); }
const lookAt = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
Object.assign(POSES, {
  walk1: { sp: .08, hp: -.05, aL: [.35, -.1, 0], eL: .4, aR: [.3, PI, 0], eR: .3, lL: [.45, .04, 0], kL: .15, lR: [-.3, .04, 0], kR: .35, fR: .3 },
  walk2: { sp: .08, hp: -.05, aR: [.35, -.1, 0], eR: .4, aL: [.3, PI, 0], eL: .3, lR: [.45, .04, 0], kR: .15, lL: [-.3, .04, 0], kL: .35, fL: .3 },
});
function walkCycle(ph, over) { const u = .5 - .5 * Math.cos((ph % 1) * TAU); const p = mixPose(pose('walk1', over), pose('walk2', over), u); p.drop = -Math.abs(Math.sin(ph * TAU)) * .03; return p; }
function hitStop(t, stops) { let o = t; for (const [t0, d] of stops) { if (t > t0 + d) o -= d; else if (t > t0) o -= (t - t0); } return o; }
const GRADES = {
  day: { sat: 1.08, contrast: 1.05, soft: ['#ffe8c8', .12] }, noon: { sat: 1.1, contrast: 1.06 },
  dusk: { sat: 1.12, contrast: 1.08, tint: ['#ffd2b0', .25], lift: ['#3a1a40', .08] }, night: { sat: .95, contrast: 1.1, tint: ['#8090d0', .25] },
  storm: { sat: .8, contrast: 1.12, tint: ['#b0b0c0', .2] }, ice: { sat: 1.05, contrast: 1.05, tint: ['#d8f0ff', .2] },
  void: { sat: 1, contrast: 1.15 }, red: { sat: 1.2, contrast: 1.12, tint: ['#ff9a80', .25] }, gloom: { sat: .7, contrast: 1.08, tint: ['#c8a8b8', .3] },
};
const POSTS = { normal: { bloom: .45, grain: .05, ca: .8, vignette: .35 }, hot: { bloom: .9, halation: .5, grain: .06, ca: 1.6, vignette: .45 }, soft: { bloom: .3, grain: .04, ca: .5, vignette: .3 }, dark: { bloom: .7, grain: .07, ca: 1.2, vignette: .6 } };
function std(f, o = {}) { const pal = o.pal || 'day'; f.grade(Object.assign({}, GRADES[pal] || {}, o.grade || {})); f.post(Object.assign({}, POSTS[o.post || 'normal'], o.postOver || {})); if (PALETTES[pal]) f.light({ key: vNorm(PALETTES[pal].sun), ambient: PALETTES[pal].amb || null, ambientK: PALETTES[pal].amb ? .35 : 0 }); return f; }
// camera follow: point of a figure (joint) at time t, with optional smoothing window (seconds)
function figPos(F, t, joint = 'pelvis') { return figSkel(F, t).J[joint]; }
function followTarget(F, t, joint = 'abd', lag = .15, n = 5) { let s = [0, 0, 0]; for (let i = 0; i < n; i++) s = vAdd(s, figPos(F, t - lag * i / n, joint)); return vMul(s, 1 / n); }
// ---------------------------------------------------------------------------------- close-up acting (hand2d)
// blink(t, seed) -> eye multiplier (periodic 2-3 frame blinks); talk(t, rate) -> mouthOpen stepped on twos;
// gazeAt(t, keys) keyed [x,y] look; faceAnim(base, t, o) merges blink/talk/gaze into an expression.
function blink(t, seed = 0, every = 2.8) { const ph = (t + hash(seed) * every) % every; return ph < .05 ? .45 : ph < .1 ? 0 : ph < .14 ? .5 : 1; }
function talk(t, rate = 1, amp = .7) { const k = Math.floor(t * 12 * rate); return amp * (.25 + .75 * hash(k * 7 + 3)) * (hash(k * 3) < .2 ? .2 : 1); }
function gazeAt(t, keys) { return keyedV(keys.map(k => [k[0], [k[1][0], k[1][1], 0], k[2]]), t).slice(0, 2); }
function faceAnim(base, t, o = {}) { const e = typeof base === 'string' ? expr(base) : Object.assign({}, base); e.eye = (e.eye == null ? 1 : e.eye) * (o.blink === false ? 1 : blink(t, o.seed || 0, o.every)); if (o.talk) e.mouthOpen = talk(t, o.talk, o.amp); if (o.gaze) e.look = gazeAt(t, o.gaze); return e; }
/* closeCam(F, t, o): camera framing a body part. o: { part: 'face'|'eyes'|'eye'|'mouth'|'hands'|'hand'|'blade'|'bust'|'feet',
   az (rad around the part, 0 = in front of the character), el, dist (multiplier), fov, roll, side:'R' } */
function closeCam(F, t, o = {}) {
  const S = figSkel(F, t), D = designAt(F, t), k = S.B.h / 1.8, fwdYaw = (S.pose.yaw || 0), part = o.part || 'face';
  let c, d;
  if (part === 'face' || part === 'eyes' || part === 'eye' || part === 'mouth') { const HM = headModel(S, D); c = part === 'mouth' ? HM.at(0, -.75) : part === 'face' ? vAdd(S.J.head, mApply(S.M.head, [0, -.04 * k, 0])) : HM.at(part === 'eye' ? (o.side === 'R' ? -.44 : .44) : 0, -.2); d = { face: .62, eyes: .38, eye: .24, mouth: .3 }[part] * k; }
  else if (part === 'bust') { c = vLerp(S.J.head, S.J.neck, .55); d = 1.25 * k; }
  else if (part === 'hands' || part === 'hand') { c = part === 'hands' ? vLerp(S.J.handL, S.J.handR, .5) : S.J['hand' + (o.side || 'R')]; d = (part === 'hands' ? .9 : .45) * k; }
  else if (part === 'blade') { const sw = swordAt(F, t); c = sw ? vLerp(sw.base, sw.tip, .45) : S.J.handR; d = 1.1 * k; }
  else { c = vLerp(S.J.anL, S.J.anR, .5); d = .8 * k; }
  const az = fwdYaw + (o.az || 0), el = o.el || 0;
  return { pos: vAdd(c, orbitPos({ c: [0, 0, 0], r: d * (o.dist || 1), az, el })), target: c, fov: o.fov || 30, roll: o.roll || 0, focus: d * (o.dist || 1), aperture: o.aperture || 0 };
}

/* ---------------------------------------------------------------------------------------------- camera helpers (E1)
   camFollow(F, t, o)      tracking camera on a figure: {joint:'abd', dist:5, az (rel. to the figure's facing, or world if
                           o.world), el, fov, lag (s, smooth follow), lead (m along velocity), height}
   camTwoShot(A, B, t, o)  frames two figures (or points): {tA, tB, az (around the pair axis normal), el, pad (1.35), fov, bias 0..1}
   camHero(F, t, o)        low heroic angle looking up at the figure: {dist, az, fov}
   camOrbitAround(c, t, o) continuous orbit: {r, az0, speed (rad/s), el, fov, y}
   camImpactKick(cam, t, t0, o)  quick FOV punch-in + roll kick + recoil at an impact: {fov: -8, roll: .06, dur: .35}
   camPushIn(cam, t, t0, t1, k)  dolly toward the target by fraction k between t0..t1 (ease out)
   camRack(cam, A, B, t, t0, t1, o) focus pull from figure A to figure B ({aperture})                                     */
function _figPoint(X, t, joint) { return Array.isArray(X) ? X : followTarget(X, t, joint || 'abd', 0, 1); }
function camFollow(F, t, o = {}) {
  const j = o.joint || 'abd', lag = o.lag == null ? .12 : o.lag, c = lag ? followTarget(F, t, j, lag, 6) : figPos(F, t, j);
  let lead = [0, 0, 0]; if (o.lead) { const a = figPos(F, t - .1, 'pelvis'), b = figPos(F, t, 'pelvis'); lead = vMul(vSub(b, a), o.lead * 10); }
  const yaw = o.world ? 0 : (figSkel(F, t).pose.yaw || 0), tgt = vAdd(vAdd(c, lead), [0, o.height || 0, 0]);
  return { pos: orbitPos({ c: tgt, r: o.dist || 5, az: yaw + (o.az == null ? .6 : o.az), el: o.el == null ? .05 : o.el }), target: tgt, fov: o.fov || 34, roll: o.roll || 0 };
}
function camTwoShot(A, B, t, o = {}) {
  const pa = _figPoint(A, o.tA == null ? t : o.tA, o.joint), pb = _figPoint(B, o.tB == null ? t : o.tB, o.joint), mid = vLerp(pa, pb, o.bias == null ? .5 : o.bias);
  const sep = Math.max(1.5, vDist(pa, pb)), fov = o.fov || 34, d = sep * (o.pad || 1.35) / (2 * Math.tan(fov * Math.PI / 360)) * 1.05 + 1.2;
  const axis = vNorm([pb[0] - pa[0], 0, pb[2] - pa[2]]), normal = [-axis[2], 0, axis[0]], baseAz = Math.atan2(normal[0], normal[2]);
  return { pos: orbitPos({ c: mid, r: d, az: baseAz + (o.az || 0), el: o.el == null ? .06 : o.el }), target: vAdd(mid, [0, o.height || 0, 0]), fov, roll: o.roll || 0 };
}
function camHero(F, t, o = {}) { const c = figPos(F, t, 'abd'), yaw = figSkel(F, t).pose.yaw || 0, k = figSkel(F, t).B.h / 1.8; return { pos: vAdd(orbitPos({ c: [c[0], .25 * k, c[2]], r: (o.dist || 3.2) * k, az: yaw + (o.az == null ? .35 : o.az), el: 0 }), [0, 0, 0]), target: vAdd(c, [0, .45 * k, 0]), fov: o.fov || 40, roll: o.roll || 0 }; }
function camOrbitAround(c, t, o = {}) { return { pos: orbitPos({ c: [c[0], o.y == null ? c[1] : o.y, c[2]], r: o.r || 6, az: (o.az0 || 0) + t * (o.speed == null ? .35 : o.speed), el: o.el == null ? .08 : o.el }), target: c, fov: o.fov || 34 }; }
function camImpactKick(cam, t, t0, o = {}) { const u = (t - t0) / (o.dur || .35); if (u < 0 || u > 1) return cam; const k = u < .15 ? easeOut(u / .15) : 1 - easeInOut((u - .15) / .85); return Object.assign({}, cam, { fov: (cam.fov || 35) + (o.fov == null ? -8 : o.fov) * k, roll: (cam.roll || 0) + (o.roll == null ? .06 : o.roll) * k * (u < .15 ? 1 : -.4) }); }
function camPushIn(cam, t, t0, t1, k = .3) { const u = easeOut(clamp((t - t0) / (t1 - t0), 0, 1)) * k; return Object.assign({}, cam, { pos: vLerp(cam.pos, cam.target, u) }); }
function camRack(cam, A, B, t, t0, t1, o = {}) { const pa = _figPoint(A, t, 'head'), pb = _figPoint(B, t, 'head'), u = smooth((t - t0) / (t1 - t0)); return Object.assign({}, cam, { focus: lerp(vDist(cam.pos, pa), vDist(cam.pos, pb), u), aperture: o.aperture || 6 }); }

// ---------------------------------------------------------------------------------- group framing (agent E, shinji-aizen-dazai)
/* camGroup(figs, t, o): camera that frames one or more figures so that their group fills o.fill (0..1, default .62) of the frame height
   (wide shots stay readable: no tiny game-like figures).  o: { az (orbit angle, 0 = in front of +z), el (elevation), fov (default 32),
   fill, joint list (default head/feet/hands), lead [x,y,z] offset of the aim point, roll, minDist, t2 (optional second time for drift) }.
   Works with camPath-style composition: camHandheld(camGroup(...), lt, .01). */
function camGroup(figs, t, o = {}) {
  const pts = []; for (const F of figs) { const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t); for (const j of (o.joints || ['head', 'toeL', 'toeR', 'handL', 'handR', 'pelvis'])) if (S.J[j]) pts.push(S.J[j]); const hc = S.J.head; if (hc) pts.push(vAdd(hc, [0, S.B.headR * 1.4, 0])); }
  let c = [0, 0, 0]; for (const p of pts) c = vAdd(c, p); c = vMul(c, 1 / Math.max(1, pts.length));
  const fov = o.fov || 32, fill = o.fill || .62, az = o.az == null ? .3 : o.az, el = o.el == null ? .06 : o.el;
  const back = vNorm(vSub(orbitPos({ c: [0, 0, 0], r: 1, az, el }), [0, 0, 0])), right = vNorm(vCross([0, 1, 0], back)), up = vCross(back, right);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, zf = 0; for (const p of pts) { const d = vSub(p, c), x = vDot(d, right), y = vDot(d, up), z = vDot(d, back); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); zf = Math.max(zf, z); }
  const tn = Math.tan(fov * Math.PI / 360), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = Math.max(.3, (x1 - x0) / 2), hh = Math.max(.3, (y1 - y0) / 2);
  const dist = Math.max(o.minDist || 1.2, Math.max(hh / (tn * fill), hw / (tn * (W / H) * Math.min(.95, fill * 1.25))) + zf);
  const tgt = vAdd(vAdd(c, vAdd(vMul(right, cx), vMul(up, cy))), o.lead || [0, 0, 0]); return { pos: vMad(tgt, back, dist), target: tgt, fov, roll: o.roll || 0 };
}
