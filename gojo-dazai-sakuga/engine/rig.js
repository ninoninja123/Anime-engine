/* Bleach Showdown engine - rig.js : pseudo-3D skeleton, FK + IK, pose library, spring secondary motion, and the
   depth-sorted figure renderer that turns a solved skeleton into view-dependent cel parts (toon.js).

   SKELETON (character-local space: x = character's LEFT, y = up, z = facing direction; world placement by root
   pos + yaw/pitch/roll).  Joints: pelvis -> abdomen -> chest -> neck -> head; clavicle -> shoulder -> elbow -> wrist
   -> hand; hip -> knee -> ankle -> toe.  Every limb is attached at its joint, so limbs never float.

   POSE OBJECT (all angles in radians, every field optional, missing = neutral standing):
     pos:[x,y,z] world root (ground point under the pelvis)   yaw, pitch, roll: whole-body orientation
     ground: true -> feet are snapped so the lowest sole touches pos.y (crouch / lunge adjust automatically)
     drop: extra pelvis height offset (jump arcs when ground:false)
     sp spine forward bend, ss side bend (+ = toward left), st chest twist (+ = chest turns toward its left)
     hp head pitch (+ = chin down), hy head yaw (+ = look to its left), hr head roll
     aL/aR [el, az, tw]: upper-arm ELEVATION from hanging (0 down, PI/2 horizontal, PI straight up), AZIMUTH
           (0 = forward, +PI/2 = out to its own side, PI = behind, negative = across the body), twist
     eL/eR elbow bend (0 straight .. 2.6), wL/wR [flex, side] wrist, hL/hR hand shape name, cL/cR curl 0..1
     shL/shR [up, fwd] clavicle shrug
     lL/lR [flex, abd, tw]: thigh flex forward (+) / back (-), abduction out (+), twist; kL/kR knee bend; fL/fR ankle
           (+ = toes point down)
     ikHL/ikHR/ikFL/ikFR: [x,y,z] targets (char-local, or world if pose.ikWorld) -> two-bone IK overrides FK
     sword: {hand:'R', p: pitch rel. to the fist (0 = blade forward when the arm hangs), r: roll, y: yaw,
             two: true (other hand grips handle), dir:[x,y,z] explicit char-local blade direction, sheathed:true}
     face: expression object (see faces.js), sq: squash-stretch (1 = none), lean helpers via sp
   Poses blend numerically (mixPose / poseKeys).  POSES holds the library; char designs add signature poses.     */
'use strict';
// ------------------------------------------------------------------------------------------------ proportions
const BODY0 = {
  h: 1.8, pelvisH: .98, hipW: .095, hipDrop: .06, thigh: .44, shin: .42, ankleH: .07, foot: .2,
  abd: .25, chest: .2, neck: .09, headUp: .09, headFwd: .02, headR: .124,
  shW: .19, shDrop: .035, ua: .30, fa: .26, hand: .1,
  // torso rings (half widths x / depth z): hip, waist, chest, shoulder
  ring: { hip: [.165, .115], waist: [.14, .1], chest: [.172, .122], shoulder: [.19, .095] },
  limbR: { ua: .05, fa: .042, th: .075, sh: .055, neck: .05 },
};
function makeBody(design) {
  const k = (design.h || 1.8) / 1.8, b = JSON.parse(JSON.stringify(BODY0)), o = design.body || {};
  for (const key in b) if (typeof b[key] === 'number' && key !== 'h') b[key] *= k;
  for (const r in b.ring) b.ring[r] = b.ring[r].map(v => v * k);
  for (const r in b.limbR) b.limbR[r] *= k;
  b.h = design.h || 1.8;
  // design overrides: multipliers
  if (o.width) { for (const r in b.ring) b.ring[r][0] *= o.width; b.shW *= o.width; }
  if (o.shoulders) { b.ring.shoulder[0] *= o.shoulders; b.ring.chest[0] *= (1 + (o.shoulders - 1) * .7); b.shW *= o.shoulders; }
  if (o.depth) for (const r in b.ring) b.ring[r][1] *= o.depth;
  if (o.limbs) for (const r in b.limbR) b.limbR[r] *= o.limbs;
  if (o.head) { b.headR *= o.head; b.headUp *= o.head; }
  if (o.legs) { b.thigh *= o.legs; b.shin *= o.legs; b.pelvisH = b.pelvisH + (b.thigh + b.shin) * (1 - 1 / o.legs); }
  if (o.arms) { b.ua *= o.arms; b.fa *= o.arms; }
  if (o.neck) b.neck *= o.neck;
  return b;
}

// ------------------------------------------------------------------------------------------------ pose library
const POSE0 = { yaw: 0, pitch: 0, roll: 0, sp: .03, ss: 0, st: 0, hp: 0, hy: 0, hr: 0,
  aL: [.12, .9, 0], eL: .2, wL: [0, 0], aR: [.12, .9, 0], eR: .2, wR: [0, 0], shL: [0, 0], shR: [0, 0],
  lL: [.02, .06, 0], kL: .04, fL: 0, lR: [.02, .06, 0], kR: .04, fR: 0, hL: 'relax', hR: 'relax', cL: .5, cR: .5, sq: 1, drop: 0 };
const PI = Math.PI, HP = Math.PI / 2;
const POSES = {
  idle: {},
  stand: { sp: 0, aL: [.08, .6, 0], aR: [.08, .6, 0], eL: .15, eR: .15 },
  relaxed: { sp: -.02, hp: .05, aL: [.1, .8, 0], aR: [.06, .5, 0], eL: .3, eR: .1, lL: [.05, .08, .2], lR: [-.02, .04, -.1], kL: .12 },
  guard: { sp: .12, st: -.25, hp: .1, aR: [.75, .1, 0], eR: 1.5, hR: 'grip', aL: [.7, -.1, 0], eL: 1.6, hL: 'grip', lL: [.4, .12, .2], kL: .55, lR: [-.35, .1, -.3], kR: .35, fR: .25, sword: { hand: 'R', p: -.55, two: true, dir: [0, .78, .62] } },
  ready: { sp: .18, st: -.35, hp: .15, aR: [.55, .2, 0], eR: 1.2, hR: 'grip', aL: [.3, .6, 0], eL: .9, hL: 'open', lL: [.55, .15, .25], kL: .8, lR: [-.45, .12, -.3], kR: .55, fR: .35, sword: { hand: 'R', p: -.2, dir: [-.15, .35, .92] } },
  crouch: { sp: .45, hp: -.25, aR: [.5, .3, 0], eR: .6, aL: [.6, -.2, 0], eL: .7, hL: 'open', lL: [1.2, .25, .2], kL: 2.1, lR: [.5, .2, -.2], kR: 2.0, fR: .6 },
  land: { sp: .6, hp: -.3, aR: [1.1, 1.0, 0], eR: .3, aL: [.9, 1.1, 0], eL: .4, hL: 'open', hR: 'open', lL: [1.35, .3, .2], kL: 2.3, lR: [-.05, .35, -.2], kR: 1.7, fR: .8 },
  jump: { sp: .25, hp: -.2, aL: [2.2, .5, 0], eL: .4, aR: [-.5, .3, 0], eR: .6, lL: [1.0, .1, 0], kL: 1.7, lR: [-.3, .1, 0], kR: 1.2, fR: .6, fL: .4, ground: false },
  tuck: { sp: .8, hp: .3, aL: [.8, .1, 0], eL: 1.8, aR: [.8, -.1, 0], eR: 1.8, lL: [1.9, .1, 0], kL: 2.5, lR: [1.8, .12, 0], kR: 2.5, ground: false },
  fall: { sp: -.6, hp: -.4, aL: [2.4, .9, 0], eL: .3, aR: [2.1, 1.0, 0], eR: .5, hL: 'open', hR: 'open', lL: [1.0, .2, 0], kL: .5, lR: [.5, .2, 0], kR: 1.0, ground: false },
  hurt: { sp: -.35, ss: .15, hp: -.45, hr: .2, aL: [.9, 1.0, 0], eL: .6, aR: [1.2, 1.3, 0], eR: .5, hL: 'open', hR: 'claw', lL: [.4, .15, 0], kL: .3, lR: [-.2, .1, 0], kR: .6 },
  hurtFwd: { sp: .7, hp: .4, aL: [.5, -.3, 0], eL: 1.2, aR: [.6, -.4, 0], eR: 1.4, hL: 'claw', hR: 'claw', lL: [.3, .1, 0], kL: .7, lR: [-.2, .1, 0], kR: .9, fR: .5 },
  block: { sp: .1, st: .2, hp: .2, aR: [1.2, -.2, 0], eR: 1.9, aL: [1.1, -.3, 0], eL: 2.1, hR: 'grip', hL: 'grip', lL: [.45, .12, .2], kL: .65, lR: [-.4, .12, -.2], kR: .45, sword: { hand: 'R', p: -1.45, r: 1.4, two: true, dir: [1, .35, .25] } },
  dodge: { sp: -.45, ss: .3, hp: -.2, aL: [.8, 1.2, 0], eL: 1.2, aR: [.9, 1.0, 0], eR: .9, hL: 'open', lL: [.15, .4, 0], kL: .6, lR: [-.7, .25, 0], kR: 1.0 },
  run1: { sp: .45, hp: -.25, aL: [.9, -.15, 0], eL: 1.5, aR: [.6, PI * .95, 0], eR: 1.3, hL: 'fist', hR: 'fist', lL: [1.15, .05, 0], kL: 1.1, lR: [-.6, .05, 0], kR: 1.5, fR: .6 },
  run2: { sp: .45, hp: -.25, aR: [.9, -.15, 0], eR: 1.5, aL: [.6, PI * .95, 0], eL: 1.3, hL: 'fist', hR: 'fist', lR: [1.15, .05, 0], kR: 1.1, lL: [-.6, .05, 0], kL: 1.5, fL: .6 },
  dash: { sp: .85, hp: -.6, aL: [1.0, PI * .92, 0], eL: .2, aR: [1.1, PI * .9, 0], eR: .25, hL: 'open', hR: 'open', lL: [1.0, .1, 0], kL: 1.6, lR: [-.9, .1, 0], kR: 1.1, fR: .7 },
  shunpo: { sp: .55, hp: -.35, aL: [.4, PI * .8, 0], eL: .3, aR: [.5, .6, 0], eR: .9, hR: 'grip', lL: [.9, .15, 0], kL: 1.4, lR: [-.5, .15, 0], kR: .9, fR: .6, sword: { hand: 'R', p: .9, dir: [-.3, -.45, -.84] } },
  drawWind: { sp: .2, st: .5, hp: .1, aR: [.6, -.9, 0], eR: 1.6, hR: 'grip', aL: [.4, -.4, 0], eL: 1.4, hL: 'grip', lL: [.5, .15, .3], kL: .7, lR: [-.4, .15, -.3], kR: .5, sword: { hand: 'R', p: .3, r: .2, dir: [.55, -.35, -.75] } },
  slashWind: { sp: -.05, st: .45, hp: .05, aR: [2.6, -.3, 0], eR: 1.3, hR: 'grip', aL: [2.4, -.5, 0], eL: 1.5, hL: 'grip', lL: [.35, .12, .2], kL: .5, lR: [-.35, .12, -.2], kR: .3, sword: { hand: 'R', p: -1.9, two: true, dir: [0, .45, -.89] } },
  slashDown: { sp: .55, st: -.15, hp: .3, aR: [1.1, -.1, 0], eR: .1, hR: 'grip', aL: [1.0, -.3, 0], eL: .3, hL: 'grip', lL: [.95, .15, .2], kL: 1.2, lR: [-.7, .15, -.2], kR: .4, fR: .4, sword: { hand: 'R', p: .35, two: true, dir: [0, -.6, .8] } },
  slashSideWind: { sp: .1, st: 1.0, hp: .05, hy: -.4, aR: [1.4, -1.6, 0], eR: .9, hR: 'grip', aL: [.5, .3, 0], eL: .7, hL: 'open', lL: [.6, .2, .3], kL: .8, lR: [-.4, .15, -.3], kR: .45, sword: { hand: 'R', p: -.3, r: -1.4, dir: [-.92, .2, -.35] } },
  slashSide: { sp: .3, st: -1.0, hp: .1, hy: .3, aR: [1.5, 1.4, 0], eR: .05, hR: 'grip', aL: [.6, -.4, 0], eL: .9, hL: 'open', lL: [.9, .2, .3], kL: 1.1, lR: [-.6, .2, -.3], kR: .4, fR: .4, sword: { hand: 'R', p: 0, r: -1.5, dir: [.92, -.05, .4] } },
  slashUp: { sp: -.2, st: -.4, hp: -.3, aR: [2.8, .2, 0], eR: .2, hR: 'grip', aL: [.4, .8, 0], eL: .4, hL: 'open', lL: [.2, .1, 0], kL: .1, lR: [-.3, .1, 0], kR: .2, fR: .5, sword: { hand: 'R', p: -.1, dir: [0, .95, .3] } },
  thrustWind: { sp: -.05, st: .7, aR: [.6, -.3, 0], eR: 2.2, hR: 'grip', aL: [.9, .3, 0], eL: .4, hL: 'open', lL: [.4, .15, .2], kL: .6, lR: [-.4, .15, -.2], kR: .4, sword: { hand: 'R', p: .1, dir: [0, .05, 1] } },
  thrust: { sp: .4, st: -.5, hp: .15, aR: [1.55, .05, 0], eR: .02, hR: 'grip', aL: [.7, PI * .85, 0], eL: .3, hL: 'open', lL: [1.0, .15, .2], kL: 1.1, lR: [-.85, .15, -.2], kR: .2, fR: .5, sword: { hand: 'R', p: 0, dir: [0, 0, 1] } },
  punchWind: { sp: .05, st: .6, aR: [.5, -.2, 0], eR: 2.2, hR: 'fist', aL: [1.2, .2, 0], eL: .7, hL: 'open', lL: [.45, .15, .2], kL: .6, lR: [-.4, .15, -.2], kR: .4 },
  punch: { sp: .3, st: -.6, hp: .1, aR: [1.57, .02, 0], eR: 0, hR: 'fist', aL: [.6, PI * .8, 0], eL: 1.6, hL: 'fist', lL: [.85, .15, .2], kL: .9, lR: [-.75, .15, -.2], kR: .15, fR: .4 },
  kickWind: { sp: -.1, aL: [.7, .9, 0], eL: 1.2, aR: [.8, .8, 0], eR: 1.2, hL: 'fist', hR: 'fist', lR: [1.3, .1, 0], kR: 2.2, lL: [.05, .1, 0], kL: .2 },
  kick: { sp: -.35, ss: -.15, hp: .2, aL: [.9, 1.2, 0], eL: .9, aR: [1.0, 1.4, 0], eR: .6, hL: 'fist', hR: 'open', lR: [1.6, .25, 0], kR: .05, fR: .5, lL: [-.1, .1, 0], kL: .15 },
  throwWind: { sp: -.15, st: .7, aR: [2.2, -1.2, 0], eR: 1.5, hR: 'claw', aL: [1.2, .3, 0], eL: .4, hL: 'open', lL: [.4, .1, 0], kL: .4, lR: [-.4, .1, 0], kR: .3 },
  throw: { sp: .45, st: -.7, aR: [1.4, .1, 0], eR: .1, hR: 'open', aL: [.6, PI * .9, 0], eL: .7, hL: 'fist', lL: [.8, .1, 0], kL: .8, lR: [-.7, .1, 0], kR: .3, fR: .5 },
  charge: { sp: .15, hp: -.15, aL: [.6, .9, 0], eL: 1.1, aR: [.6, .9, 0], eR: 1.1, hL: 'fist', hR: 'fist', lL: [.45, .3, .2], kL: .7, lR: [.45, .3, -.2], kR: .7 },
  powerUp: { sp: -.25, hp: -.45, aL: [.5, 1.3, 0], eL: .8, aR: [.5, 1.3, 0], eR: .8, hL: 'claw', hR: 'claw', lL: [.25, .35, .2], kL: .4, lR: [.25, .35, -.2], kR: .4 },
  roar: { sp: -.15, hp: -.6, aL: [.3, 1.4, 0], eL: 1.2, aR: [.3, 1.4, 0], eR: 1.2, hL: 'fist', hR: 'fist', lL: [.4, .35, .2], kL: .6, lR: [.4, .35, -.2], kR: .6 },
  float: { sp: .05, hp: .05, aL: [.3, 1.0, 0], eL: .4, aR: [.3, 1.0, 0], eR: .4, hL: 'open', hR: 'open', lL: [.25, .05, 0], kL: .5, lR: [.05, .05, 0], kR: .7, fL: .6, fR: .7, ground: false },
  fly: { sp: .9, hp: -.9, pitch: .9, aL: [.6, PI * .85, 0], eL: .2, aR: [.5, PI * .85, 0], eR: .3, lL: [-.1, .05, 0], kL: .3, lR: [-.3, .05, 0], kR: .5, fL: .7, fR: .8, ground: false },
  airSlash: { sp: .5, st: -.4, aR: [1.3, .4, 0], eR: .1, hR: 'grip', aL: [1.0, PI * .7, 0], eL: .3, lL: [1.4, .1, 0], kL: 1.8, lR: [.3, .1, 0], kR: 1.6, fR: .7, ground: false, sword: { hand: 'R', p: .2, dir: [.6, -.35, .72] } },
  kneel: { sp: .35, hp: .35, aL: [.4, .3, 0], eL: .3, aR: [.25, .2, 0], eR: .2, lL: [1.5, .15, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2 },
  slump: { sp: .6, hp: .6, aL: [.1, .2, 0], eL: .1, aR: [.1, .2, 0], eR: .1, lL: [1.5, .2, 0], kL: 1.6, lR: [1.4, .2, 0], kR: 1.7 },
  armsCrossed: { sp: -.03, aL: [.55, -.6, -.5], eL: 2.1, aR: [.5, -.5, .5], eR: 2.15, hL: 'relax', hR: 'relax' },
  sleevesHide: { sp: .02, aL: [.6, -.45, -.3], eL: 1.9, aR: [.6, -.45, .3], eR: 1.9, hL: 'hid', hR: 'hid' },
  point: { sp: .05, aR: [1.55, .15, 0], eR: 0, hR: 'point', aL: [.1, .6, 0], eL: .3 },
  cast: { sp: .1, aR: [1.5, .1, 0], eR: .05, hR: 'open', wR: [-.8, 0], aL: [.15, .6, 0], eL: .5 },
  swordUp: { sp: -.05, hp: -.2, aR: [2.9, .1, 0], eR: .1, hR: 'grip', aL: [.1, .7, 0], eL: .3, sword: { hand: 'R', p: -1.5, dir: [0, 1, .05] } },
  swordForward: { sp: .05, aR: [1.4, .1, 0], eR: .1, hR: 'grip', aL: [.15, .5, 0], eL: .3, sword: { hand: 'R', p: -.05, dir: [0, .05, 1] } },
  swordDown: { sp: .02, aR: [.1, .3, 0], eR: .1, hR: 'grip', aL: [.08, .6, 0], eL: .2, sword: { hand: 'R', p: .5, dir: [.1, -.95, .3] } },
  swordPlunge: { sp: .25, hp: .2, aR: [1.0, -.05, 0], eR: .8, hR: 'grip', aL: [.95, -.15, 0], eL: .9, hL: 'grip', sword: { hand: 'R', p: 1.1, two: true, dir: [0, -1, .12] }, lL: [.25, .1, 0], kL: .3, lR: [-.1, .1, 0], kR: .2 },
};
function pose(name, over) { return Object.assign({}, POSE0, POSES[name] || {}, over || {}); }
// numeric blend of two poses (arrays element-wise, strings/objects step at .5)
function mixPose(a, b, t) {
  const o = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    let va = a[k], vb = b[k];
    if (va == null) va = POSE0[k]; if (vb == null) vb = POSE0[k];
    if (va == null) { o[k] = vb; continue; } if (vb == null) { o[k] = va; continue; }
    if (typeof va === 'number' && typeof vb === 'number') o[k] = va + (vb - va) * t;
    else if (Array.isArray(va) && Array.isArray(vb) && typeof va[0] === 'number') o[k] = va.map((x, i) => x + ((vb[i] == null ? x : vb[i]) - x) * t);
    else if (k === 'sword' && va && vb && typeof va === 'object') { o[k] = Object.assign({}, t < .5 ? va : vb); for (const q of ['p', 'r', 'y']) { const x = va[q] || 0, y = vb[q] || 0; o[k][q] = x + (y - x) * t; } if (va.dir && vb.dir) o[k].dir = vLerp(va.dir, vb.dir, t); }
    else if (k === 'face' && va && vb && typeof va === 'object') o[k] = mixFace(va, vb, t);
    else o[k] = t < .5 ? va : vb;
  }
  return o;
}
function mixFace(a, b, t) { const o = Object.assign({}, t < .5 ? a : b); for (const k in a) if (typeof a[k] === 'number' && typeof b[k] === 'number') o[k] = a[k] + (b[k] - a[k]) * t; return o; }
/* keyed poses: [[t, poseObjOrName, ease], ...]  (ease applies to the segment ending at that key) */
function poseKeys(keys) {
  const K = keys.map(k => [k[0], typeof k[1] === 'string' ? pose(k[1]) : Object.assign({}, POSE0, k[1]), k[2]]);
  return function (t) {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const A = K[i - 1], B = K[i]; return mixPose(A[1], B[1], easeOf(B[2])((t - A[0]) / Math.max(1e-6, B[0] - A[0]))); }
    return K[K.length - 1][1];
  };
}
// breathing / idle life on top of a pose
function breathe(p, t, amt = 1, seed = 0) {
  const b = Math.sin(t * 2.1 + seed) * .012 * amt;
  return Object.assign({}, p, { sp: (p.sp || 0) + b, hp: (p.hp || 0) - b * .6, shL: [(p.shL ? p.shL[0] : 0) + b * .6, p.shL ? p.shL[1] : 0], shR: [(p.shR ? p.shR[0] : 0) + b * .6, p.shR ? p.shR[1] : 0] });
}
// run cycle generator: phase in cycles; returns pose
function runCycle(ph, over) { const u = .5 - .5 * Math.cos((ph % 1) * TAU); return mixPose(pose('run1', over), pose('run2', over), u); }

// ------------------------------------------------------------------------------------------------ solver
function rootMatrix(p) { return mYPR(p.yaw || 0, p.pitch || 0, p.roll || 0); }
function limbFrame(parent, el, az, tw, side) { return mMul(parent, mMul(mRotY(side * az), mMul(mRotX(-el), mRotY(side * tw)))); }
function twoBoneIK(a, target, l1, l2, poleDir) {
  let d = vSub(target, a), L = vLen(d); const maxL = (l1 + l2) * .999; if (L > maxL) { d = vMul(d, maxL / L); L = maxL; }
  const dn = vNorm(d); const cosA = clamp((l1 * l1 + L * L - l2 * l2) / (2 * l1 * L), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  let pole = vSub(poleDir, vMul(dn, vDot(poleDir, dn))); if (vLen(pole) < 1e-6) pole = Math.abs(dn[1]) < .9 ? [0, 1, 0] : [0, 0, 1]; pole = vNorm(pole);
  const mid = vAdd(a, vAdd(vMul(dn, cosA * l1), vMul(pole, sinA * l1)));
  return [mid, vAdd(a, d)];
}
/* solve(design, pose) -> skeleton { J: joints (world), M: frames (world), local: same in char space, B: body }   */
function solveSkeleton(design, p0) {
  let p = p0;
  const B = design._body || (design._body = makeBody(design));
  const J = {}, M = {};
  const Mp = M_ID();
  // spine
  const sp = p.sp || 0, ss = p.ss || 0, st = p.st || 0;
  const Mab = mMul(Mp, mMul(mRotX(sp * .45), mMul(mRotZ(-ss * .5), mRotY(st * .4))));
  const Mc = mMul(Mab, mMul(mRotX(sp * .55), mMul(mRotZ(-ss * .5), mRotY(st * .6))));
  const Mn = mMul(Mc, mMul(mRotX((p.hp || 0) * .35), mRotY((p.hy || 0) * .3)));
  const Mh = mMul(Mn, mMul(mRotX((p.hp || 0) * .65), mMul(mRotY((p.hy || 0) * .7), mRotZ(-(p.hr || 0)))));
  const sq = p.sq || 1;
  J.pelvis = [0, B.pelvisH + (p.drop || 0), 0];
  J.abd = vAdd(J.pelvis, mApply(Mab, [0, B.abd * sq, 0]));
  J.neck = vAdd(J.abd, mApply(Mc, [0, B.chest * sq, 0]));
  J.headBase = vAdd(J.neck, mApply(Mn, [0, B.neck, 0]));
  J.head = vAdd(J.headBase, mApply(Mh, [0, B.headUp, B.headFwd]));
  Object.assign(M, { pelvis: Mp, abd: Mab, chest: Mc, neck: Mn, head: Mh });
  // arms
  for (const [S, sg] of [['L', 1], ['R', -1]]) {
    const sh = p['sh' + S] || [0, 0];
    J['clav' + S] = vAdd(J.neck, mApply(Mc, [sg * B.shW * .25, -B.shDrop * .5, 0]));
    J['sh' + S] = vAdd(J.neck, mApply(Mc, [sg * B.shW, -B.shDrop + sh[0] * .08, sh[1] * .06]));
    const a = p['a' + S] || [0, 0, 0];
    let Mua = limbFrame(Mc, a[0], a[1], a[2] || 0, sg);
    let Mfa = mMul(Mua, mRotX(-(p['e' + S] || 0)));
    J['el' + S] = vAdd(J['sh' + S], mApply(Mua, [0, -B.ua, 0]));
    J['wr' + S] = vAdd(J['el' + S], mApply(Mfa, [0, -B.fa, 0]));
    M['ua' + S] = Mua; M['fa' + S] = Mfa;
    const w = p['w' + S] || [0, 0];
    M['hand' + S] = mMul(Mfa, mMul(mRotX(-w[0]), mRotZ(sg * w[1])));
  }
  // legs
  for (const [S, sg] of [['L', 1], ['R', -1]]) {
    J['hip' + S] = vAdd(J.pelvis, mApply(Mp, [sg * B.hipW, -B.hipDrop, 0]));
    const l = p['l' + S] || [0, 0, 0];
    const Mth = mMul(Mp, mMul(mRotZ(sg * (l[1] || 0)), mMul(mRotX(-(l[0] || 0)), mRotY(sg * (l[2] || 0)))));
    const Msh = mMul(Mth, mRotX(p['k' + S] || 0));
    J['kn' + S] = vAdd(J['hip' + S], mApply(Mth, [0, -B.thigh, 0]));
    J['an' + S] = vAdd(J['kn' + S], mApply(Msh, [0, -B.shin, 0]));
    const Mft = mMul(Msh, mRotX(p['f' + S] || 0));
    M['th' + S] = Mth; M['shin' + S] = Msh; M['foot' + S] = Mft;
  }
  // IK (char-local targets)
  const ikT = (key) => { const v = p[key]; if (!v) return null; return v; };
  for (const [S, sg] of [['L', 1], ['R', -1]]) {
    const th = ikT('ikH' + S);
    if (th) { const [el, wr] = twoBoneIK(J['sh' + S], th, B.ua, B.fa, mApply(Mc, [sg * .6, -.5, -.6])); J['el' + S] = el; J['wr' + S] = wr;
      M['ua' + S] = mFromY(vSub(J['sh' + S], el), mApply(Mc, [1, 0, 0])); M['fa' + S] = mFromY(vSub(el, wr), mApply(Mc, [1, 0, 0])); M['hand' + S] = M['fa' + S]; }
    const tf = ikT('ikF' + S);
    if (tf) { const [kn, an] = twoBoneIK(J['hip' + S], tf, B.thigh, B.shin, [0, 0, 1]); J['kn' + S] = kn; J['an' + S] = an;
      M['th' + S] = mFromY(vSub(J['hip' + S], kn), [1, 0, 0]); M['shin' + S] = mFromY(vSub(kn, an), [1, 0, 0]); M['foot' + S] = M['shin' + S]; }
  }
  // feet / hands derived points
  for (const S of ['L', 'R']) {
    J['heel' + S] = vAdd(J['an' + S], mApply(M['foot' + S], [0, -B.ankleH, -B.foot * .22]));
    J['toe' + S] = vAdd(J['an' + S], mApply(M['foot' + S], [0, -B.ankleH * .8, B.foot * .78]));
    J['hand' + S] = vAdd(J['wr' + S], mApply(M['hand' + S], [0, -B.hand, 0]));
  }
  // to world
  const R = rootMatrix(p), pos = p.pos || [0, 0, 0];
  let lift = 0;
  if (p.ground !== false && p.ground !== 'all') { let mn = 1e9; for (const S of ['L', 'R']) for (const k of ['heel', 'toe']) mn = Math.min(mn, J[k + S][1]); lift = -mn; }
  if (p.float) lift += p.float;   // hover height (m) on top of ground snapping (Gojo levitating)
  // two-handed sword grip: IK the free arm onto the handle (char-local, before world transform)
  if (p.sword && p.sword.two && !p.sword.sheathed) {
    const side = p.sword.hand || 'R', o = side === 'R' ? 'L' : 'R', sgo = o === 'L' ? 1 : -1;
    const Sx = { J, M, B, R: M_ID() };
    const fr = swordFrame(Sx, design, p.sword);
    const target = vMad(fr.grip, fr.dir, -(p.sword.gap || .085) * B.h / 1.8);
    const [el, wr0] = twoBoneIK(J['sh' + o], vMad(target, mApply(M.chest, [sgo, 0, 0]), .0), B.ua, B.fa, mApply(Mc, [sgo * .5, -.6, -.3]));
    J['el' + o] = el; J['wr' + o] = wr0;
    M['ua' + o] = mFromY(vSub(J['sh' + o], el), mApply(Mc, [1, 0, 0])); M['fa' + o] = mFromY(vSub(el, wr0), mApply(Mc, [1, 0, 0]));
    // hand frame: thumb (Z) along the blade, fingers wrap toward the handle
    const Yh = vNorm(vSub(el, wr0)); let Zh = vNorm(vSub(fr.dir, vMul(Yh, vDot(fr.dir, Yh)))); const Xh = vCross(Yh, Zh);
    M['hand' + o] = [Xh, Yh, Zh];
    J['hand' + o] = vAdd(wr0, mApply(M['hand' + o], [0, -B.hand, 0]));
    // place the wrist so the fist sits on the handle
    p = Object.assign({}, p, { ['h' + o]: 'grip' });
  }
  const local = { J: {}, M: {} };
  for (const k in J) { local.J[k] = J[k]; }
  for (const k in M) { local.M[k] = M[k]; }
  const Jw = {}, Mw = {};
  // pitch/roll pivot around pelvis for airborne bodies so the body rotates around its centre
  const piv = J.pelvis;
  for (const k in J) { const q = J[k]; const r = vAdd(mApply(R, vSub(q, piv)), piv); Jw[k] = vAdd([r[0], r[1] + lift, r[2]], pos); }
  for (const k in M) Mw[k] = mMul(R, M[k]);
  if (p.ground === 'all') { // lying / sprawled bodies: the lowest point of the whole body rests on the ground (+ body thickness)
    let mn = 1e9; for (const k in Jw) if (!/^(clav)/.test(k)) mn = Math.min(mn, Jw[k][1]); const lift2 = pos[1] + (p.rest == null ? .07 * B.h / 1.8 : p.rest) - mn; for (const k in Jw) Jw[k][1] += lift2; }
  return { J: Jw, M: Mw, local, B, pose: p, R, pos, design };
}

/* ------------------------------------------------------------------------------------------------ figure object
   makeFig(design, { form, at: t => pose, faceAt: t => expression, timing: 1|2|3 (drawn on ones/twos/threes),
                     wind: t => [x,y,z] })                                                                    */
function makeFig(design, opts = {}) {
  const F = Object.assign({ design, form: opts.form || 'base', timing: 1, springWin: .8, wind: null, cache: new Map(), id: (makeFig._n = (makeFig._n || 0) + 1) }, opts);
  if (!F.at) F.at = () => pose('idle');
  return F;
}
function figPose(F, t) { const p = F.at(t); return p; }
function figSkel(F, t) {
  const key = Math.round(t * 960);
  let s = F.cache.get(key); if (s) return s;
  const p = figPose(F, t); const d = F.design.forms && F.design.forms[F.formAt ? F.formAt(t) : F.form] ? Object.assign({}, F.design, F.design.forms[F.formAt ? F.formAt(t) : F.form]) : F.design;
  if (!d._body) d._body = F.design._body || makeBody(F.design);
  if (d.dynBody) d._body = d.dynBody(p, d);   // per-frame body (e.g. Hulk -> Banner shrink)
  s = solveSkeleton(d, p); s.t = t; s.fig = F;
  if (F.cache.size > 3000) F.cache.clear(); F.cache.set(key, s); return s;
}
/* spring lag of an anchor point: integrates x'' = k (anchor - x) - c x' + wind over the past window.
   anchorFn(skel) -> world point.  Returns offset (x - anchor) at t, clamped to maxLen.                       */
function springLag(F, t, anchorFn, k = 60, c = 9, maxLen = .6, key = '', windK = 1) {
  const ck = 'spr' + key + '|' + Math.round(t * 960); const hit = F.cache.get(ck); if (hit) return hit;
  const dt = 1 / 48, n = Math.round(F.springWin / dt);
  let x = null, v = [0, 0, 0];
  for (let i = n; i >= 0; i--) {
    const ti = t - i * dt; const a = anchorFn(figSkel(F, ti));
    if (!x) { x = a.slice(); continue; }
    const w = F.wind ? vMul(F.wind(ti), windK) : [0, 0, 0];
    const acc = vAdd(vMul(vSub(a, x), k), vAdd(vMul(v, -c), w));
    v = vMad(v, acc, dt); x = vMad(x, v, dt);
  }
  const a = anchorFn(figSkel(F, t)); let off = vSub(x, a); const l = vLen(off); if (l > maxLen) off = vMul(off, maxLen / l);
  F.cache.set(ck, off); return off;
}
