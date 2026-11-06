/* Bleach Showdown engine - camera.js
   Pseudo-3D (2.5D) pinhole camera.  Everything in the world (characters, sets, fx anchors) is placed in 3D world units
   (1 unit ~ 1 metre, y up) and projected through ONE camera per frame, so orbit / dolly / crane / dutch / whip-pan and
   parallax are all real perspective.  A camera is a plain object:
     { pos:[x,y,z], target:[x,y,z], fov:deg(vertical), roll:rad, shift:[px,py], distort:k(barrel, 0 = none),
       focus: distance of the focal plane (for rack focus / DOF), aperture: blur px per unit of defocus }
   CAM.set(cam) makes it current for the frame; project(p) / projPoly(pts) use it.
   Tracks: camPath(keys)(t) -> cam   (keys: {t, pos, target, fov, roll, ease} or {t, orbit:{c,r,az,el}, ...})
   Modifiers: camHandheld, camShake (impulses), camWhip (fast pan with blur amount), camDutch.                  */
'use strict';
const CAM = {
  cur: null, f: 1, basis: null, near: .05,
  set(c) {
    const cam = Object.assign({ fov: 35, roll: 0, shift: [0, 0], distort: 0, focus: 8, aperture: 0, up: [0, 1, 0] }, c);
    const fwd = vNorm(vSub(cam.target, cam.pos));
    let right = vCross(fwd, cam.up); if (vLen(right) < 1e-6) right = [1, 0, 0]; right = vNorm(right);
    const up = vCross(right, fwd);
    // roll rotates right/up around fwd
    const cr = Math.cos(cam.roll), sr = Math.sin(cam.roll);
    cam.R = vAdd(vMul(right, cr), vMul(up, sr)); cam.U = vAdd(vMul(up, cr), vMul(right, -sr)); cam.F = fwd;
    cam.f = (H / 2) / Math.tan(cam.fov * Math.PI / 360);
    this.cur = cam; return cam;
  },
};
// camera-space coordinates of a world point
function camSpace(p, cam = CAM.cur) { if (!cam) cam = CAM.set({ pos: [0, 1.6, 6], target: [0, 1, 0] }); const d = vSub(p, cam.pos); return [vDot(d, cam.R), vDot(d, cam.U), vDot(d, cam.F)]; }
function screenOf(c, cam = CAM.cur) {
  let x = c[0] * cam.f / c[2], y = -c[1] * cam.f / c[2];
  if (cam.distort) { const r2 = (x * x + y * y) / (H * H * .25); const k = 1 + cam.distort * r2; x *= k; y *= k; }
  return [W / 2 + x + cam.shift[0], H / 2 + y + cam.shift[1]];
}
// project world point -> {x, y, z: depth, s: pixels per world unit at that depth} or null when behind the camera
function project(p, cam = CAM.cur) {
  const c = camSpace(p, cam); if (c[2] < CAM.near) return null;
  const s = screenOf(c, cam); return { x: s[0], y: s[1], z: c[2], s: cam.f / c[2] * (cam.distort ? 1 + cam.distort * .3 : 1) };
}
// fast: returns [x,y,depth] (depth<=near -> still returns a clamped point; use for already-visible geometry)
function proj2(p, cam = CAM.cur) { const c = camSpace(p, cam); const z = Math.max(CAM.near, c[2]); const s = screenOf([c[0], c[1], z], cam); s.push(c[2]); return s; }
// project a 3D polygon with near-plane clipping -> array of [x,y] (may be empty)
function projPoly(pts, cam = CAM.cur) {
  const cs = pts.map(p => camSpace(p, cam)), out = [], n = cs.length, zn = CAM.near + .01;
  for (let i = 0; i < n; i++) {
    const a = cs[i], b = cs[(i + 1) % n], ina = a[2] >= zn, inb = b[2] >= zn;
    if (ina) out.push(screenOf(a, cam));
    if (ina !== inb) { const t = (zn - a[2]) / (b[2] - a[2]); out.push(screenOf([lerp(a[0], b[0], t), lerp(a[1], b[1], t), zn], cam)); }
  }
  return out;
}
// projected polyline (open) with near clipping, splits into visible runs
function projLine(pts, cam = CAM.cur) {
  const runs = []; let cur = null; const zn = CAM.near + .01;
  for (let i = 0; i < pts.length; i++) {
    const c = camSpace(pts[i], cam);
    if (c[2] >= zn) { if (!cur) { cur = []; runs.push(cur); if (i > 0) { const pc = camSpace(pts[i - 1], cam); const t = (zn - pc[2]) / (c[2] - pc[2]); cur.push(screenOf([lerp(pc[0], c[0], t), lerp(pc[1], c[1], t), zn], cam)); } } cur.push(screenOf(c, cam)); }
    else if (cur) { const pc = camSpace(pts[i - 1], cam); const t = (zn - pc[2]) / (c[2] - pc[2]); cur.push(screenOf([lerp(pc[0], c[0], t), lerp(pc[1], c[1], t), zn], cam)); cur = null; }
  }
  return runs;
}
const camDepth = (p, cam = CAM.cur) => vDot(vSub(p, cam.pos), cam.F);
// unit vector from point toward the camera
const toCam = (p, cam = CAM.cur) => vNorm(vSub(cam.pos, p));
// screen-space blur radius (px) for a point at depth z (rack focus)
const dofBlur = (z, cam = CAM.cur) => cam.aperture ? Math.min(24, Math.abs(z - cam.focus) / Math.max(.5, z) * cam.aperture) : 0;

// ---------------------------------------------------------------------------------------------- camera paths
// orbit spec -> pos: c center, r radius, az azimuth (rad, 0 = camera on +z side looking toward -z), el elevation (rad)
function orbitPos(o) { const ce = Math.cos(o.el || 0); return [o.c[0] + Math.sin(o.az || 0) * ce * o.r, o.c[1] + Math.sin(o.el || 0) * o.r, o.c[2] + Math.cos(o.az || 0) * ce * o.r]; }
function keyCam(k) { const o = Object.assign({}, k); if (k.orbit) { o.pos = orbitPos(k.orbit); o.target = k.target || k.orbit.c; } return o; }
/* camPath(keys) -> function(t) returning a camera object.
   key: { t, pos, target, fov, roll, ease, orbit:{c,r,az,el}, shift, focus, aperture, distort }
   Orbit keys interpolate in orbit parameters (true arcs) when both neighbours are orbit keys.            */
function camPath(keys) {
  keys = keys.slice().sort((a, b) => a.t - b.t);
  return function (t) {
    if (t <= keys[0].t) return keyCam(keys[0]);
    for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) {
      const A = keys[i - 1], B = keys[i], u = easeOf(B.ease)((t - A.t) / Math.max(1e-6, B.t - A.t));
      const o = {};
      if (A.orbit && B.orbit) {
        const oa = A.orbit, ob = B.orbit;
        o.pos = orbitPos({ c: vLerp(oa.c, ob.c, u), r: lerp(oa.r, ob.r, u), az: lerp(oa.az || 0, ob.az || 0, u), el: lerp(oa.el || 0, ob.el || 0, u) });
        o.target = vLerp(A.target || oa.c, B.target || ob.c, u);
      } else { const a = keyCam(A), b = keyCam(B); o.pos = vLerp(a.pos, b.pos, u); o.target = vLerp(a.target, b.target, u); }
      for (const k of ['fov', 'roll', 'focus', 'aperture', 'distort']) { const va = A[k] != null ? A[k] : B[k], vb = B[k] != null ? B[k] : A[k]; if (va != null) o[k] = lerp(va, vb, u); }
      if (A.shift || B.shift) { const sa = A.shift || [0, 0], sb = B.shift || [0, 0]; o.shift = [lerp(sa[0], sb[0], u), lerp(sa[1], sb[1], u)]; }
      return o;
    }
    return keyCam(keys[keys.length - 1]);
  };
}
// look-from helper: camera at distance d from target, azimuth az, elevation el, fov
function camLook(target, d, az, el, fov = 35, roll = 0) { return { pos: orbitPos({ c: target, r: d, az, el }), target, fov, roll }; }
// handheld: adds smooth noise to pos/target (amp in world units, rot in rad)
function camHandheld(cam, t, amp = .03, seed = 1, rot = .004) {
  const o = Object.assign({}, cam);
  o.pos = vAdd(cam.pos, [fbm(t * .9 + seed) * amp, fbm(t * .8 + seed + 9) * amp, fbm(t * .7 + seed + 19) * amp * .5]);
  o.target = vAdd(cam.target, [fbm(t * .6 + seed + 33) * amp * .6, fbm(t * .55 + seed + 41) * amp * .6, 0]);
  o.roll = (cam.roll || 0) + fbm(t * .5 + seed + 57) * rot; return o;
}
/* shake impulses: list of [t0, amp(px), dur, freq]; applied in screen space as lens shift + tiny roll (anime 'camera
   shake' is a 2D frame shake).  Returns [dx, dy, droll]. Deterministic.                                     */
function shakeAt(list, t) {
  let dx = 0, dy = 0, dr = 0;
  for (const [t0, amp, dur = .5, fq = 26] of list) {
    const u = (t - t0) / dur; if (u < 0 || u > 1) continue;
    const env = Math.pow(1 - u, 2.2) * amp, k = Math.floor((t - t0) * fq);  // stepped (on-ones jitter) like 2D shakes
    dx += (hash(k * 7 + t0 * 1000) * 2 - 1) * env; dy += (hash(k * 13 + t0 * 777) * 2 - 1) * env * .8; dr += (hash(k * 5 + 3) * 2 - 1) * env * .0004;
  }
  return [dx, dy, dr];
}
function camShake(cam, list, t) { const [dx, dy, dr] = shakeAt(list, t); const o = Object.assign({}, cam); const s = cam.shift || [0, 0]; o.shift = [s[0] + dx, s[1] + dy]; o.roll = (cam.roll || 0) + dr; return o; }
/* whip pan: between t0..t1 rotate the view by yaw angle (rad) about the camera position with an ease that is fast
   in the middle; returns {cam, blur} where blur is the horizontal motion-blur amount (px) for post.          */
function camWhip(cam, t, t0, t1, yaw, ease = easeInOut, into = false) {  // into: start rotated by yaw and whip INTO cam
  if (!into && t <= t0) return { cam, blur: 0 };
  const u = ease(seg(t, t0, t1)), du = (ease(seg(t + 1 / FPS, t0, t1)) - u);
  const d = vSub(cam.target, cam.pos), R = mRotY(yaw * (into ? 1 - u : u));
  const o = Object.assign({}, cam, { target: vAdd(cam.pos, mApply(R, d)) });
  return { cam: o, blur: Math.abs(du * yaw) * 1400 };
}
// dolly-zoom (vertigo): keeps subject width constant while moving; returns cam with adjusted fov
function camVertigo(cam, subj, widthUnits) { const d = vDist(cam.pos, subj); const fov = 2 * Math.atan(widthUnits / 2 / d) * 180 / Math.PI; return Object.assign({}, cam, { fov }); }
const pxScale = (p, cam = CAM.cur) => cam.f / Math.max(CAM.near, camDepth(p, cam));
