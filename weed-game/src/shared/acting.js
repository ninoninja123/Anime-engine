// Body language ("acting") on top of animation clips: head low, ears back, tail tucked, breathing, trembling, looking at
// someone, small nods. Works for rigged models (bones; the clips have no "sad" pose, Idle_2_HeadLow is only a slower idle)
// and factory dogs (joints + anime face). Values blend smoothly, so a scene only sets targets:
//
//   act(dog, { head: 0.5, ears: 1, tail: 1, breath: 1, look: otherDog, t: 0.8 })     head/ears/tail 0..1 (+ head < 0 = chin up)
//   act(dog, null)                                                                   back to neutral (blends out)
//   nod(dog, 0.25) / shiver(dog, 1.2)                                                one-shot gestures
//   A('weed', {...}) -> scene step { fn } for data scripts (cast from ctx)
//
// Rigged bones: the mixer only writes the tracks of the playing clip; a bone the clip does not animate would accumulate our
// extra rotation, so each bone remembers what we wrote last frame and restores its own base first.
import * as THREE from 'three';
import { E } from '../engine.js';

const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
const _m = new THREE.Matrix4(), _ax = new THREE.Vector3(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _w = new THREE.Vector3();
const KEYS = ['head', 'yaw', 'ears', 'tail', 'breath', 'tremble', 'lookAmt', 'lie'];
const DEF = { head: 0, yaw: 0, ears: 0, tail: 0, breath: 0.35, tremble: 0, lookAmt: 0, lie: 0 };
// lie: rest pose for rigged models (front legs forward, hind legs folded, body lowered) – the clips only have 'die'
const LIE = [['front_upper_L', 1.3], ['front_upper_R', 1.3], ['front_lower_L', -0.3], ['front_lower_R', -0.3], ['front_paw_L', 0.25], ['front_paw_R', 0.25],
  ['back_upper_L', 0.95], ['back_upper_R', 0.95], ['back_lower_L', -2.15], ['back_lower_R', -2.15], ['back_paw_L', 1.05], ['back_paw_R', 1.05]];
const ST = new WeakMap();

function rotWorld(bone, axis, ang) {
  if (!ang) return;
  const par = bone.parent; par.updateWorldMatrix(true, false);
  _m.copy(par.matrixWorld).invert();
  _ax.copy(axis).transformDirection(_m);
  const sgn = par.matrixWorld.determinant() < 0 ? -1 : 1;
  _q.setFromAxisAngle(_ax, ang * sgn);
  bone.quaternion.premultiply(_q);
}
function guard(st, bone) {
  // restore the clip value if the mixer did not overwrite our last write (untracked bone in this clip)
  let g = st.bones.get(bone);
  if (!g) { g = { base: bone.quaternion.clone(), out: new THREE.Quaternion(), has: false }; st.bones.set(bone, g); }
  if (g.has && bone.quaternion.equals(g.out)) bone.quaternion.copy(g.base);
  else g.base.copy(bone.quaternion);
  return g;
}
function commit(g, bone) { g.out.copy(bone.quaternion); g.has = true; }

function state(dog) {
  let st = ST.get(dog);
  if (st) return st;
  st = { cur: { ...DEF }, to: { ...DEF }, rate: 1.6, look: null, bones: new Map(), nod: 0, nodAmt: 0, shiver: 0, t: Math.random() * 9, spineScale: null };
  ST.set(dog, st);
  st.off = dog.overlay((d, dt) => apply(d, st, dt));
  return st;
}

/** Set acting targets (missing keys keep their target). null = neutral. */
export function act(dog, o) {
  if (!dog || !dog.overlay) return;
  const st = state(dog);
  if (!o) { Object.assign(st.to, DEF); st.look = null; st.rate = 1.2; if (dog.lookTarget !== undefined && !dog.mixer) dog.lookTarget = null; return; }
  for (const k of KEYS) if (o[k] !== undefined) st.to[k] = o[k];
  if (o.look !== undefined) { st.look = o.look; st.to.lookAmt = o.look ? (o.lookAmt ?? 1) : 0; if (!dog.mixer) dog.lookTarget = o.look || null; }
  st.rate = o.t !== undefined ? 1 / Math.max(0.05, o.t) : 1.6;
  if (E.skipping) Object.assign(st.cur, st.to);
}
export function nod(dog, amt = 0.25) { const st = state(dog); st.nod = 1; st.nodAmt = amt; }
export function shiver(dog, secs = 1) { const st = state(dog); st.shiver = secs; }
/** Reset everyone in a cast (end of a scene). */
export function resetActing(cast) { for (const d of Object.values(cast || {})) { const st = d && ST.get(d); if (st) { Object.assign(st.to, DEF); Object.assign(st.cur, DEF); st.look = null; st.nod = 0; st.shiver = 0; } } }

/** Scene-step helpers (data scripts): A('weed', { head: 0.5 }), Nod('gb'), Shiver('weed', 1). */
export const A = (id, o) => ({ fn: (ctx) => act(ctx.cast[id], o === null ? null : { ...o, look: typeof o?.look === 'string' ? ctx.cast[o.look] : o?.look }) });
export const Nod = (id, amt) => ({ fn: (ctx) => nod(ctx.cast[id], amt) });
export const Shiver = (id, s) => ({ fn: (ctx) => shiver(ctx.cast[id], s) });

function apply(d, st, dt) {
  if (!d.root.visible) return;
  const k = 1 - Math.exp(-dt * st.rate * 3);
  const c = st.cur;
  for (const key of KEYS) c[key] += (st.to[key] - c[key]) * k;
  st.t += dt;
  const f = Math.cos(d.turn.rotation.y) >= 0 ? 1 : -1;          // actual heading (d.facing is only set on instant turns)
  // look: yaw + pitch toward the target's head (clamped, shared by neck and head)
  let yaw = c.yaw, pitch = 0;
  if (st.look && c.lookAmt > 0.01) {
    const tp = st.look.isVector3 ? _w.copy(st.look) : _w.copy(st.look.root.position).add(_v.set(0, (st.look.height || 1) * 0.8, 0));
    const hp = d.root.position;
    const dx = tp.x - hp.x, dz = tp.z - hp.z, dy = tp.y - (hp.y + d.height * 0.8);
    let a = Math.atan2(-dz * f, dx * f);
    if (Math.abs(a) > 1.9) a = 0;                                   // behind: do not twist the neck around
    yaw += THREE.MathUtils.clamp(a, -0.85, 0.85) * c.lookAmt;
    pitch += THREE.MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.5, 0.5) * c.lookAmt;
  }
  // nod (one-shot, ~0.7 s) and shiver (fast small noise)
  if (st.nod > 0) { st.nod = Math.max(0, st.nod - dt * 1.5); pitch -= Math.sin((1 - st.nod) * Math.PI) * st.nodAmt; }
  let trem = c.tremble;
  if (st.shiver > 0) { st.shiver -= dt; trem = Math.max(trem, 0.6); }
  const tr = trem ? (Math.sin(st.t * 47) + Math.sin(st.t * 31 + 1)) * 0.012 * trem : 0;
  const breath = Math.sin(st.t * (c.breath > 0.8 ? 4.2 : 2.4)) * c.breath;
  const headDown = c.head;                                         // radians-ish: 1 ≈ 0.9 rad total
  if (d.mixer && d.bones) {
    const B = d.bones;
    const neck = B.neck, head = B.head;
    if (neck) { const g = guard(st, neck); rotWorld(neck, Y, yaw * 0.45); rotWorld(neck, Z, (-headDown * 0.45 + pitch * 0.4 + breath * 0.012) * f); commit(g, neck); }
    if (head) { const g = guard(st, head); rotWorld(head, Y, yaw * 0.55 + tr); rotWorld(head, Z, (-headDown * 0.5 + pitch * 0.6 + tr) * f); commit(g, head); }
    for (const n of ['ear_L', 'ear_R']) { const b = B[n]; if (b && c.ears) { const g = guard(st, b); rotWorld(b, Z, c.ears * 0.85 * f); commit(g, b); } }
    if (B.tail_01 && c.tail) { const g = guard(st, B.tail_01); rotWorld(B.tail_01, Z, c.tail * 0.9 * f); commit(g, B.tail_01); }
    if (B.tail_02 && c.tail) { const g = guard(st, B.tail_02); rotWorld(B.tail_02, Z, c.tail * 0.4 * f); commit(g, B.tail_02); }
    if (c.lie > 0.01 || st.modelY !== undefined) {
      if (st.modelY === undefined) st.modelY = d.model.position.y;
      if (c.lie > 0.01) for (const [n, a] of LIE) { const b = B[n]; if (b) { const g = guard(st, b); rotWorld(b, Z, a * c.lie * f); commit(g, b); } }
      d.model.position.y = st.modelY - c.lie * d.height * (d.def.lieDrop ?? 0.3);
      if (c.lie <= 0.01 && st.to.lie === 0) { d.model.position.y = st.modelY; st.modelY = undefined; }
    }
    const sp = B.spine_03 || B.spine_02;
    if (sp) { if (!st.spineScale) st.spineScale = sp.scale.clone(); const s = 1 + breath * 0.035; sp.scale.set(st.spineScale.x, st.spineScale.y * s, st.spineScale.z * (1 + breath * 0.02)); }
  } else if (d.J) {
    const J = d.J;
    J.neck.rotation.z += -headDown * 0.35 + pitch * 0.3 + breath * 0.01;
    J.head.rotation.z += -headDown * 0.55 + pitch * 0.5 + tr;
    J.head.rotation.y += yaw + tr;
    if (J.EARL) J.EARL.rotation.z += c.ears * 0.6;
    if (J.EARR) J.EARR.rotation.z += c.ears * 0.6;
    J.tail.rotation.z -= c.tail * 0.9;
  }
}
