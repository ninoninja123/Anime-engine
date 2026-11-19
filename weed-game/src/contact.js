// Kontaktijärjestelmä: iskut osuvat oikeasti.
//  - Hyökkääjän KUONO (pää- ja leukaluun etummaiset verteksit, hampaiden kohta) tai TASSU (front_paw-luu) viedään
//    täsmälleen kohteen PINNAN pisteeseen (kaula, olka, kylki, rinnan heikko kohta, kurkku, jalka ...) iskuhetkellä.
//    Pinnan piste haetaan kohteen omista verteksistä (luupaino -> luun avaruus), joten se seuraa animaatiota.
//  - PIN: hampaat pysyvät kiinni pisteessä purennan ajan. Vartalo ratkaistaan joka ruutu: jos takajalat ylettyvät
//    maahan, koira nousee takajaloilleen (rearing), muuten se roikkuu kiinni ja heiluu kuin heiluri kohteen liikkeestä.
//  - Reaktiot (nytkähdys, horjahdus, karjunta, riuhtonta), hitstop, kamerasykäys, pöly/kipinät ja äänet.
//  - Erottelu: maassa olevat hahmot eivät jää sisäkkäin (jalanjälkien työntö, raskas hahmo ei liiku).
//  - Mittaus (tools/contact-check.cjs): window.__contact.strikes / violations, hold = pysäytä kontaktihetkeen kuvaa varten.
import * as THREE from 'three';
import { E, shake } from './engine.js';
import * as FX from './fx.js';
import { sfx } from './audio.js';

export const LOG = (typeof window !== 'undefined' && (window.__contact = window.__contact || {
  strikes: [], violations: [], monitor: false, hold: false, pending: null, scene: '', n: 0,
})) || { strikes: [], violations: [] };

let cast = {};
export function setContactCast(c) { cast = c; }
const dogOf = d => (typeof d === 'string' ? cast[d] : d);

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _m1 = new THREE.Vector3(), _m2 = new THREE.Vector3(), _n1 = new THREE.Vector3(), _n2 = new THREE.Vector3();   // vain mouthWorld / nearSide
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = { in: k => k * k, out: k => 1 - (1 - k) * (1 - k), inOut: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2), lin: k => k };

// ------------------------------------------------------------------ hahmon analyysi (kerran per hahmo)
/** Verteksit hallitsevan luun mukaan (luun omassa avaruudessa), kuonon ja leuan kärki, luiden säteet. */
export function analyze(dog) {
  const d = dogOf(dog);
  if (d._cx) return d._cx;
  const info = d._cx = { byBone: {}, radius: {}, nose: null, jaw: null };
  const m = d.skinned;
  if (!m || !d.bones) return info;
  const keep = { rot: d.pose.rotation.clone(), order: d.pose.rotation.order };
  d.pose.rotation.set(0, 0, 0);
  d.root.updateMatrixWorld(true);
  const g = m.geometry, n = g.attributes.position.count, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const bones = m.skeleton.bones;
  const step = Math.max(1, Math.floor(n / 9000));
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i += step) {
    let bi = 0, bw = -1;
    const ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], is = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)];
    for (let k = 0; k < 4; k++) if (ws[k] > bw) { bw = ws[k]; bi = is[k]; }
    const b = bones[bi]; if (!b) continue;
    m.getVertexPosition(i, v); v.applyMatrix4(m.matrixWorld);
    (info.byBone[b.name] = info.byBone[b.name] || []).push(b.worldToLocal(v.clone()));
  }
  // luun säde (mediaani verteksien etäisyydestä luusta), maailman yksiköissä
  for (const [name, list] of Object.entries(info.byBone)) {
    const b = d.bones[name], s = Math.abs(b.getWorldScale(_a).x);
    const ds = list.map(p => p.length() * s).sort((x, y) => x - y);
    info.radius[name] = ds[Math.floor(ds.length * 0.6)] || 0.1;
  }
  // kuonon kärki (pää) ja leuan kärki: etummaisimmat verteksit katseen suuntaan
  const fwd = new THREE.Vector3(1, 0, 0).transformDirection(d.pose.matrixWorld);
  const tip = name => {
    const list = info.byBone[name]; const b = d.bones[name]; if (!list || !b) return null;
    let best = null, bd = -1e9;
    for (const p of list) { const w = b.localToWorld(_b.copy(p)); const k = w.dot(fwd); if (k > bd) { bd = k; best = p; } }
    return best && { bone: name, p: best.clone() };
  };
  info.nose = tip('head'); info.jaw = tip('jaw');
  d.pose.rotation.copy(keep.rot); d.pose.rotation.order = keep.order;
  d.root.updateMatrixWorld(true);
  return info;
}

function boneWorld(d, name, out) { const b = d.bones && d.bones[name]; if (!b) return null; return b.getWorldPosition(out); }

/** Hampaiden kohta maailmassa (kuonon ja leuan kärkien keskeltä, hieman taaempaa). */
export function mouthWorld(dog, out = new THREE.Vector3()) {
  const d = dogOf(dog), info = analyze(d);
  if (info.nose) {
    const nb = d.bones[info.nose.bone];
    out.copy(info.nose.p); nb.localToWorld(out);
    if (info.jaw) { const jb = d.bones[info.jaw.bone]; _m1.copy(info.jaw.p); jb.localToWorld(_m1); out.lerp(_m1, 0.5); }
    const hb = boneWorld(d, 'head', _m2); if (hb) out.lerp(hb, 0.16);
    return out;
  }
  // tehdaskoira: pään nivel + kuono eteen
  d.headPivot.getWorldPosition(out); out.x += d.facing * d.height * 0.22; out.y -= d.height * 0.04;
  return out;
}

/** Etutassu (lähempi puoli kameraan nähden, tai 'L'/'R'). */
export function pawWorld(dog, side = 'near', out = new THREE.Vector3()) {
  const d = dogOf(dog);
  if (!d.bones || !d.bones.front_paw_L) return mouthWorld(d, out).setY(d.height * 0.15);
  const s = side === 'L' || side === 'R' ? side : nearSide(d, side);
  return d.bones['front_paw_' + s].getWorldPosition(out);
}
function nearSide(d, side = 'near') {
  const l = boneWorld(d, 'front_upper_L', _n1).z, r = boneWorld(d, 'front_upper_R', _n2).z;
  const near = l > r ? 'L' : 'R';
  return side === 'far' ? (near === 'L' ? 'R' : 'L') : near;
}

// ------------------------------------------------------------------ kohdepisteet
// dir kohteen "kehyksessä": x = kohteen katse eteenpäin, y = ylös, z = kohti hyökkääjän puolta (near = kameran puoli)
const POINTS = {
  neck:       { bone: 'neck', dir: [0.15, 0.55, 0.82] },
  nape:       { bone: 'neck', dir: [-0.2, 1, 0.3] },
  throat:     { bone: 'neck', dir: [0.55, -0.65, 0.5] },
  shoulder:   { bone: 'spine_03', dir: [0.25, 0.45, 0.86] },
  chest:      { bone: 'spine_03', dir: [0.75, -0.3, 0.6] },
  chest_weak: { weak: true },
  flank:      { bone: 'spine_02', dir: [0, 0.15, 1] },
  back:       { bone: 'spine_02', dir: [0, 1, 0.3] },
  hip:        { bone: 'spine_01', dir: [-0.2, 0.3, 0.9] },
  leg:        { bone: 'front_upper_S', dir: [0.35, -0.1, 1] },
  foreleg:    { bone: 'front_lower_S', dir: [0.35, 0, 1] },
  hindleg:    { bone: 'back_upper_S', dir: [-0.2, 0, 1] },
  head:       { bone: 'head', dir: [0, 0.35, 1] },
  muzzle:     { bone: 'head', dir: [1, 0, 0.3] },
};

/**
 * Kohteen pinnan piste, joka seuraa kohteen luuta. point: nimi (POINTS) | { bone, dir } | [x,y,z] (maailma).
 * side: 'near' | 'far'. sink = kuinka syvälle hampaat painuvat (m).
 */
export function targetRef(target, point = 'neck', side = 'near', sink = 0.03) {
  const tg = dogOf(target);
  if (Array.isArray(point)) { const p = new THREE.Vector3(...point); return { tg, name: 'xyz', world: o => o.copy(p), normal: new THREE.Vector3(0, 0, 1) }; }
  const spec = typeof point === 'string' ? POINTS[point] : point;
  if (!spec) throw new Error('unknown contact point ' + point);
  const info = analyze(tg);
  if (spec.weak && tg.weak) {
    // heikko kohta: ankkuri vietynä lähimpään pinnan verteksiin (rinta/olka-luut)
    tg.root.updateMatrixWorld(true);
    const wp = tg.weak.getWorldPosition(new THREE.Vector3());
    let best = null, bd = 1e9, bb = null;
    for (const bn of ['spine_03', 'spine_02', 'neck', 'front_upper_L', 'front_upper_R']) {
      const list = info.byBone[bn], b = tg.bones && tg.bones[bn]; if (!list || !b) continue;
      for (const p of list) { const w = b.localToWorld(_a.copy(p)); const dd = w.distanceToSquared(wp); if (dd < bd) { bd = dd; best = p; bb = b; } }
    }
    if (best) return mkRef(tg, 'chest_weak', bb, best, sink);
    return { tg, name: 'chest_weak', world: o => tg.weak.getWorldPosition(o), normal: new THREE.Vector3(0, 0, 1) };
  }
  if (!tg.bones) { // tehdaskoira: arvio vartalon mukaan
    return { tg, name: String(point), world: o => o.copy(tg.root.position).add(_a.set(tg.facing * tg.length * 0.25, tg.height * 0.6, tg.width * 0.5)), normal: new THREE.Vector3(0, 0, 1) };
  }
  const bn = spec.bone.replace('_S', '_' + nearSide(tg, side));
  const b = tg.bones[bn], list = info.byBone[bn];
  if (!b || !list) throw new Error('no bone ' + bn + ' on ' + tg.id);
  tg.root.updateMatrixWorld(true);
  const fwd = new THREE.Vector3(1, 0, 0).transformDirection(tg.pose.matrixWorld).setY(0).normalize();
  const sideV = new THREE.Vector3(0, 0, side === 'far' ? -1 : 1);
  const dir = new THREE.Vector3().addScaledVector(fwd, spec.dir[0]).add(_a.set(0, spec.dir[1], 0)).addScaledVector(sideV, spec.dir[2]).normalize();
  const bw = b.getWorldPosition(new THREE.Vector3());
  let best = null, bd = -1e9;
  for (const p of list) { const w = b.localToWorld(_a.copy(p)); const k = _b.copy(w).sub(bw).dot(dir); if (k > bd) { bd = k; best = p; } }
  return mkRef(tg, typeof point === 'string' ? point : (point.name || bn), b, best, sink);
}
function mkRef(tg, name, bone, local, sink) {
  const p = local.clone();
  // painuma: hieman pinnan sisään luuta kohti (hampaat uppoavat nahkaan)
  const s = Math.abs(bone.getWorldScale(_a).x) || 1;
  const len = p.length() * s;
  if (len > 1e-4) p.multiplyScalar(Math.max(0.5, (len - sink) / len));
  const ref = { tg, name, bone, local: p, world: o => bone.localToWorld(o.copy(p)) };
  ref.normal = () => { const w = ref.world(new THREE.Vector3()); return w.sub(bone.getWorldPosition(_b)).setY(0).normalize(); };
  return ref;
}

/** Vartalopallot (spine/kaula/pää) läpileikkaustarkistukseen. */
const BODY_BONES = ['spine_01', 'spine_02', 'spine_03', 'neck', 'head'];
export function bodySpheres(dog) {
  const d = dogOf(dog), info = analyze(d), out = [];
  if (!d.bones) { out.push({ bone: 'body', p: d.root.position.clone().setY(d.height * 0.55), r: d.height * 0.22 }); return out; }
  for (const bn of BODY_BONES) { const b = d.bones[bn]; if (!b) continue; out.push({ bone: bn, p: b.getWorldPosition(new THREE.Vector3()), r: info.radius[bn] || d.height * 0.15 }); }
  return out;
}
/** Pienin normalisoitu etäisyys kahden vartalon välillä (d / (ra+rb)); < ~0.6 = sisäkkäin. skipA: hyökkääjän pää/kaula ohitetaan. */
export function bodyOverlap(a, b, skipA = []) {
  const A = bodySpheres(a).filter(s => !skipA.includes(s.bone)), B = bodySpheres(b);
  let worst = 9, pair = null;
  for (const s of A) for (const t of B) { const k = s.p.distanceTo(t.p) / (s.r + t.r); if (k < worst) { worst = k; pair = [s.bone, t.bone]; } }
  return { k: worst, pair };
}

// ------------------------------------------------------------------ luukerrokset (riuhtonta, nytkähdys)
const _m4 = new THREE.Matrix4(), _ax = new THREE.Vector3();
export function rotBoneWorld(bone, axis, ang) {
  // kierrä luuta maailman akselin ympäri: akseli vanhemman avaruuteen; peilatussa hierarkiassa (det < 0, esim. P4) kulma kääntyy
  const par = bone.parent; par.updateWorldMatrix(true, false);
  _m4.copy(par.matrixWorld).invert();
  _ax.copy(axis).transformDirection(_m4);
  const sgn = par.matrixWorld.determinant() < 0 ? -1 : 1;
  _q2.setFromAxisAngle(_ax, ang * sgn);
  bone.quaternion.premultiply(_q2);
}
const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0);

/** P4 (tai kuka tahansa) riuhtoo päätään: kaula ja pää heittelevät sivuttain + ylös/alas. */
export function thrash(dog, secs = 1.5, amp = 0.45, freq = 2.6) {
  const d = dogOf(dog); if (!d.bones) return Promise.resolve();
  let t = 0;
  return new Promise(res => {
    const off = d.overlay((dd, dt) => {
      t += dt; const env = Math.min(1, t / 0.2) * Math.min(1, Math.max(0, (secs - t) / 0.3));
      const a = Math.sin(t * freq * Math.PI * 2) * amp * env, b = Math.sin(t * freq * Math.PI * 4 + 1) * amp * 0.35 * env;
      for (const [bn, w] of [['spine_03', 0.3], ['neck', 0.7], ['head', 0.45]]) {
        const bone = d.bones[bn]; if (!bone) continue;
        rotBoneWorld(bone, Y, a * w); rotBoneWorld(bone, X, b * w * 0.6);
      }
      if (t >= secs || E.skipping) { off(); res(); }
    });
  });
}

/** Lyhyt osumareaktio luukerroksena (ei katkaise kohteen nykyistä klippiä): nytkähdys poispäin iskusta. */
export function flinch(dog, dirX = 1, amp = 0.25, secs = 0.35) {
  const d = dogOf(dog); if (!d.bones) { d.play('Idle_HitReact1', { loop: false }); return; }
  let t = 0;
  const off = d.overlay((dd, dt) => {
    t += dt; const k = t / secs, s = Math.sin(Math.min(1, k) * Math.PI) * (1 - k * 0.3);
    for (const [bn, w] of [['spine_02', 0.4], ['spine_03', 0.6], ['neck', 0.8], ['head', 0.5]]) {
      const bone = d.bones[bn]; if (!bone) continue;
      rotBoneWorld(bone, Z, -dirX * s * amp * w * d.facing * 0.6); rotBoneWorld(bone, X, s * amp * w * 0.5);
    }
    if (t >= secs) off();
  });
}

/** Kohteen reaktio osumaan. kind: flinch | stagger | roar | hurt | fall | none. */
export function react(target, kind = 'flinch', dirX = 1, o = {}) {
  const tg = dogOf(target); if (!tg || kind === 'none') return;
  tg.setTint && (tg.setTint(0xffffff, 0.7), setTimeout(() => tg.setTint(0x000000, 0), 80));
  const back = o.after || (tg.currentName && !/HitReact|Attack|Gallop_Jump/.test(tg.currentName) ? tg.currentName : 'Idle');
  if (kind === 'flinch') { flinch(tg, dirX, o.amp || 0.3); return; }
  if (kind === 'hurt') { tg.play('Idle_HitReact1', { loop: false, fade: 0.05 }); setTimeoutReal(0.45, () => tg.currentName === 'Idle_HitReact1' && tg.play(back)); return; }
  if (kind === 'stagger') {
    tg.play('Idle_HitReact2', { loop: false, fade: 0.05 }); flinch(tg, dirX, (o.amp || 0.35), 0.5);
    const push = o.push ?? 0.35, p = tg.root.position, x0 = p.x; let t = 0;
    const off = tg.overlay((dd, dt) => { t += dt; const k = Math.min(1, t / 0.35); p.x = x0 + dirX * push * ease.out(k); if (o.onMove) o.onMove(p.x); if (k >= 1) off(); });
    setTimeoutReal(0.7, () => tg.currentName === 'Idle_HitReact2' && tg.play(back));
    return;
  }
  if (kind === 'roar') { flinch(tg, dirX, o.amp || 0.3, 0.4 + (o.amp || 0.3) * 0.3); tg.play('Howl', { fade: 0.08 }); sfx.roar(); setTimeoutReal(o.secs || 1.2, () => tg.currentName === 'Howl' && tg.play(back)); return; }
  if (kind === 'fall') { tg.play('Death', { loop: false, fade: 0.05 }); return; }
}
function setTimeoutReal(s, fn) { let t = 0; const u = (dt, dtr) => { t += dt; if (t >= s) { E.updaters.delete(u); fn(); } }; E.updaters.add(u); }

// ------------------------------------------------------------------ koko vartalon reaktiot (proseduraalinen asento)
// rearup: iskun voima heilauttaa kohteen takajaloilleen (pivot takatassuissa), etutassut huitovat, huipulla hitstop,
//         raskas alastulo.  fallback: kohde kaatuu selälleen (rulla pituusakselin ympäri), makaa jalat ilmassa,
//         nousee kolmessa vaiheessa (kyljelle -> rinta ylös -> jaloille).
const motions = new Set();
export function bodyMotion(dog, kind = 'rearup', o = {}) {
  install();
  const d = dogOf(dog);
  return new Promise(res => {
    const m = { d, kind, o, t: 0, res, apex: false, impact: false };
    if (kind === 'rearup') { m.T = [o.rise ?? 0.38, o.hold ?? 0.55, o.drop ?? 0.32]; m.ang = o.angle ?? 1.08; sfx.roar(); }
    else { m.T = [o.topple ?? 0.6, o.lie ?? 1.0, o.rise1 ?? 0.45, o.rise2 ?? 0.35, o.rise3 ?? 0.4]; sfx.roar(); }
    motions.add(m);
    if (o.onStart) o.onStart();
  });
}
function applyMotion(m, dt) {
  const d = m.d, h = d.height, L = d.length, o = m.o; m.t += dt;
  const r = d.pose.rotation, P = d.pose.position;
  r.order = 'XYZ';
  if (m.kind === 'rearup') {
    const [a, b, c] = m.T; let th;
    if (m.t < a) th = ease.out(m.t / a);
    else if (m.t < a + b) { th = 1; if (!m.apex) { m.apex = true; if (!LOG.hold) { const prev = E.timeScale; E.timeScale = 0.08; setTimeoutRealS(0.09, () => { E.timeScale = prev || 1; }); } if (o.onApex) o.onApex(); } }
    else th = 1 - ease.in(Math.min(1, (m.t - a - b) / c));
    th *= m.ang;
    r.z = th;                                                     // nokka ylös (paikallinen kehys, turn hoitaa suunnan)
    const px = -0.38 * L, py = -0.5 * h, cs = Math.cos(th), sn = Math.sin(th);
    P.x += px - (cs * px - sn * py); P.y += py - (sn * px + cs * py);   // pivot takatassuissa
    if (d.bones && th > 0.2) for (const s of ['L', 'R']) { const b = d.bones['front_upper_' + s]; if (b) rotBoneWorld(b, new THREE.Vector3(0, 0, 1), Math.sin(m.t * 11 + (s === 'L' ? 0 : 2)) * 0.5 * (th / m.ang) * d.facing); }
    if (d.bones && d.bones.neck) rotBoneWorld(d.bones.neck, new THREE.Vector3(0, 0, 1), 0.4 * (th / m.ang) * d.facing);   // pää taakse karjuntaan
    if (m.t >= a + b + c && !m.impact) {
      m.impact = true; r.z = 0;
      const fx = d.root.position.clone().add(new THREE.Vector3(d.facing * L * 0.35, 0.1, 0));
      FX.dust(fx, true); FX.ring(fx.clone().setY(0.08), 0xd9ccb0, 5, 0.5); shake(0.7);
      playAny(['thudDeep', 'thud_deep', 'bossLand'], { x: fx.x }); sfx.bossLand({}, { x: fx.x });
      if (o.onImpact) o.onImpact();
      motions.delete(m); m.res();
    }
    return;
  }
  // fallback
  const [a, b, c1, c2, c3] = m.T, side = o.side ?? -1, drop = 0.28 * h;
  let roll, pitch = 0, y = 0;
  if (m.t < a) { const k = ease.in(m.t / a); roll = Math.PI * k; pitch = 0.45 * Math.sin(k * Math.PI); y = -drop * k; }
  else if (m.t < a + b) {
    roll = Math.PI; y = -drop;
    if (!m.impact) {
      m.impact = true;
      const g = d.root.position.clone().setY(0.1);
      FX.dust(g, true); FX.dust(g.clone().add(new THREE.Vector3(d.facing * L * 0.3, 0, 0)), true); FX.ring(g.clone().setY(0.08), 0xd9ccb0, 5.5, 0.6);
      shake(1.0); playAny(['knockdown'], { x: g.x }); playAny(['thud_deep', 'thud_deep_1'], { x: g.x });
      if (o.onImpact) o.onImpact();
    }
    if (d.bones) for (const s of ['front_upper_L', 'front_upper_R', 'back_upper_L', 'back_upper_R']) { const bn = d.bones[s]; if (bn) rotBoneWorld(bn, new THREE.Vector3(0, 0, 1), Math.sin(m.t * 7 + s.length) * 0.35); }   // tassut sätkivät ilmassa
  } else if (m.t < a + b + c1) { const k = ease.inOut((m.t - a - b) / c1); roll = Math.PI - Math.PI * 0.5 * k; y = -drop * (1 - 0.6 * k); }                 // kyljelleen
  else if (m.t < a + b + c1 + c2) { const k = ease.inOut((m.t - a - b - c1) / c2); roll = Math.PI * 0.5 * (1 - 0.7 * k); pitch = 0.25 * k; y = -drop * 0.4 * (1 - k); }   // rinta ylös
  else if (m.t < a + b + c1 + c2 + c3) { const k = ease.out((m.t - a - b - c1 - c2) / c3); roll = Math.PI * 0.15 * (1 - k); pitch = 0.25 * (1 - k); }   // jaloille
  else { r.x = 0; r.z = 0; motions.delete(m); FX.dust(d.root.position.clone().setY(0.1)); playAny(['bossStep'], { x: d.root.position.x }); if (o.onEnd) o.onEnd(); m.res(); return; }
  r.x = roll * side; r.z = pitch; P.y += y;
}

// ------------------------------------------------------------------ iskut ja purennat
const active = new Set();       // käynnissä olevat ohjaimet
export const pins = {};         // id -> ohjain (purenta kiinni)
let installed = false;
function install() {
  if (installed) return; installed = true;
  E.updaters.add(update);      // lisätään laiskasti -> ajetaan hahmojen päivityksen (level2 update) JÄLKEEN
}
export function isBusy(d) { return !!(d && d._cxBusy); }

// Vartalon kallistus tehdään pose-ryhmällä (sama nivelpiste kuin spin, mutta spin on varattu Battōga-pyörähdykselle
// ja fx.js tulkitsee spinin kierron pyörähdykseksi -> jälkikuvat).
function spinSet(d, roll, yaw, pitch) {
  const r = d.pose.rotation;
  if (r.order !== 'YZX') r.order = 'YZX';
  r.set(roll, yaw, pitch);
}
function spinReset(d) { d.pose.rotation.order = 'XYZ'; d.pose.rotation.set(0, 0, 0); }

// osa, joka osuu: hampaat tai tassu
function partWorld(c, out) { return c.part === 'paw' ? pawWorld(c.a, c.pawSide || 'near', out) : mouthWorld(c.a, out); }

/** Ratkaise pitch niin, että osa on pisteessä P ja takajalat maassa (nousu takajaloille); muuten roikkuu. Asettaa juuren. */
function solveBody(c, P, extraPitch = 0, allowAir = true) {
  const a = c.a, R = a.root.position;
  const evalAt = th => {
    spinSet(a, c.roll, c.yaw, th);
    a.root.updateMatrixWorld(true);
    partWorld(c, _a); const ox = _a.x - R.x, oy = _a.y - R.y, oz = _a.z - R.z;
    let hy = 1e9;
    for (const bn of ['back_paw_L', 'back_paw_R']) { const b = boneWorld(a, bn, _b); if (b) hy = Math.min(hy, b.y - R.y); }
    if (hy > 1e8) hy = -a.height * 0.0;
    return { ox, oy, oz, f: P.y - oy + hy };
  };
  let th, r;
  const lo = c.minPitch ?? -0.9, hi = c.maxPitch ?? 1.2;
  const rLo = evalAt(lo);
  if (rLo.f <= 0.02) { th = lo; r = rLo; }                      // matala kohde: nokka alas, juuri maassa
  else {
    const rHi = evalAt(hi);
    if (rHi.f > 0.02 && allowAir) { th = hi; r = rHi; c.hanging = true; }   // korkea kohde: roikkuu hampaiden varassa
    else {
      let a0 = lo, a1 = hi; c.hanging = false;
      for (let i = 0; i < 11; i++) { const m = (a0 + a1) / 2; const rm = evalAt(m); if (rm.f > 0.02) a0 = m; else a1 = m; }
      th = a1; r = evalAt(th);
    }
  }
  th += extraPitch;
  if (extraPitch) r = evalAt(th);
  R.set(P.x - r.ox, P.y - r.oy, P.z - r.oz);
  if (!c.hanging) R.y = Math.max(0, R.y);
  // tarkennus: mittaa uudelleen ja korjaa jäännös
  a.root.updateMatrixWorld(true); partWorld(c, _c);
  R.add(_d.copy(P).sub(_c)); if (!c.hanging) R.y = Math.max(0, R.y);
  a.root.updateMatrixWorld(true);
  return th;
}

/** Jos hyökkääjän vartalo painuu kohteen sisään (heilunta, riuhtonta), kallista sitä ulospäin (roll) kunnes irti. */
const SKIP_PIN = ['head', 'neck', 'spine_03'];
function pushOut(c, P, extra) {
  let k = bodyOverlap(c.a, c.tg, SKIP_PIN).k;
  for (let i = 0; i < 6 && k < 0.6; i++) {
    let best = 0;
    for (const [key, dr] of [['roll', 0.08], ['roll', -0.08], ['yaw', 0.1], ['yaw', -0.1]]) {
      c[key] += dr; solveBody(c, P, extra, true);
      const k2 = bodyOverlap(c.a, c.tg, SKIP_PIN).k;
      c[key] -= dr;
      if (k2 > k + 1e-3) { k = k2; best = [key, dr]; }
    }
    if (!best) break;
    c[best[0]] = clamp(c[best[0]] + best[1], -1.3, 1.3);
  }
  solveBody(c, P, extra, true);
}

/**
 * Isku/purenta. Palauttaa lupauksen, joka täyttyy KONTAKTIHETKELLÄ (tai o.wait === 'end': kun isku on ohi).
 * o: { who, target, point, side, part: 'jaw'|'paw', t (syöksyn kesto, pelin aikaa), arc (hypyn korkeus), from: 'run'|'leap',
 *      anim (lennon klippi), hitAt (purennan klipin osuusaika 0..1), yaw, pitch, pin (s | true = kunnes release),
 *      react, reactDir, fx: 'impact'|'crit'|'light', sfx: [..], hitstop (s), shake, strong, onHit(ctx), recoil {dist, t} }
 */
export function strike(o) {
  install();
  const a = dogOf(o.who), tg = dogOf(o.target);
  if (!a || !tg) return Promise.resolve();
  if (pins[a.id]) endCtrl(pins[a.id], true);
  a.root.visible = true; a.fade(1);
  // depth 0..1: kuinka syvälle hampaat uppoavat (Neljä nuolta: 0.3 -> 0.6 -> 0.9); kuono painuu pinnan sisään
  const ref = targetRef(tg, o.point || 'neck', o.side || 'near', o.sink ?? (0.03 + (o.depth || 0) * 0.2) * a.height);
  const c = {
    kind: 'strike', o, a, tg, ref, id: ++LOG.n, part: o.part || 'jaw', pawSide: o.pawSide,
    phase: 'lunge', el: 0, T: Math.max(0.05, o.t ?? 0.45), R0: a.root.position.clone(), arc: o.arc ?? 0,
    roll: o.roll || 0, yaw: 0, pitch0: 0, minPitch: o.minPitch, maxPitch: o.maxPitch, swing: 0, swingV: 0, prevP: null,
    biteLead: 0, bitePlayed: false, hanging: false,
  };
  a._cxBusy = c;
  const P = ref.world(new THREE.Vector3());
  if (o.whiff) c.fixedP = P.clone();          // väistö: hampaat napsahtavat kohtaan, jossa kohde OLI
  const dirX = Math.sign(P.x - a.root.position.x) || a.facing || 1;
  a.face(dirX, true);
  // lähestymiskulma: pinnan normaalin vastasuunta sekoitettuna sivukuvan suuntaan (vartalo ei mene kohteen sisään)
  let n = ref.normal ? ref.normal() : new THREE.Vector3(0, 0, 1);
  if (typeof n === 'function') n = n();
  const want = new THREE.Vector3(dirX * (o.xBias ?? 0.75), 0, 0).addScaledVector(n, -(o.inBias ?? 0.6)).normalize();
  c.yaw = o.yaw ?? clamp(Math.atan2(-want.z * dirX, want.x * dirX), -0.85, 0.85);
  // klipit: lento (o.anim) -> purenta (Attack) niin, että hampaat sulkeutuvat kontaktissa
  const clipDur = (a.play('Attack', { loop: false }).duration) || 0.5;
  c.biteLead = (o.hitAt ?? 0.45) * clipDur;
  // ennakointi (anticipation): kyyristyy, vetäytyy ja kerää voiman ennen syöksyä
  c.wind = o.wind ?? 0;
  if (c.wind > 0) {
    c.phase = 'wind'; c.flightAnim = a.cur && a.cur.name;
    a.play(o.windAnim || 'Idle', { fade: 0.1 });
    if (c.part === 'jaw') sfx.play('bite_growl', { vol: 0.55, x: a.root.position.x }); else sfx.play('scuff', { x: a.root.position.x });
  } else lungeStart(c);
  holdFrame({ strike: c.id, who: a.id, point: ref.name, frame: c.wind > 0 ? 'f1_anticipation' : 'f2_launch' });
  active.add(c);
  let resolve; const pr = new Promise(r => { resolve = r; });
  if (o.wait === 'end') c.resEnd = resolve; else c.onHit = resolve;
  return pr;
}
function lungeStart(c) {
  const a = c.a, o = c.o;
  c.phase = 'lunge'; c.el = 0; c.R0 = a.root.position.clone();
  a.play(o.anim || (c.arc > 0.2 ? 'Gallop_Jump' : 'Gallop'), { loop: !(c.arc > 0.2), timeScale: o.ts || 1.3, fade: 0.06 });
  if (c.T <= c.biteLead) { a.play(o.biteAnim || 'Attack', { loop: false, timeScale: c.biteLead / c.T, fade: 0.06 }); c.bitePlayed = true; }
  if (!o.whiffSilent) { sfx.whoosh({}, { x: a.root.position.x }); if (c.arc > 0.2) sfx.jump({}, { x: a.root.position.x }); }
  if (o.cry) playAny([].concat(o.cry), { x: a.root.position.x, rate: o.cryRate || 0.9 });     // taistelukiljahdus syöksyssä
}

/** Irrota purenta. mode: 'drop' (putoaa alas) | 'throw' (kohde heittää: to [x,z], arc, t, spin) | 'back' (perääntyy). */
export function release(o) {
  const a = dogOf(o.who); let c = a && pins[a.id];
  if (!c && a && o.mode === 'throw' && o.to) {   // heitto ilman purentaa (esim. P4 viskaa purkemansa koiran sivuun)
    install(); c = { kind: 'toss', o: {}, a, tg: null, id: ++LOG.n }; a._cxBusy = c; active.add(c);
  }
  if (!c) return Promise.resolve();
  delete pins[a.id];
  c.phase = 'release'; c.el = 0;
  c.rel = { mode: o.mode || 'drop', from: a.root.position.clone(), to: o.to ? new THREE.Vector3(o.to[0], 0, o.to[1]) : null,
    t: o.t ?? (o.mode === 'throw' ? 0.7 : 0.45), arc: o.arc ?? (o.mode === 'throw' ? 1.2 : 0.2), spin: o.spin ?? (o.mode === 'throw' ? 1 : 0),
    land: o.land || (o.mode === 'throw' ? 'Idle_HitReact2' : 'Jump_ToIdle'), after: o.after, pitch0: a.pose.rotation.z, yaw0: a.pose.rotation.y, roll0: a.pose.rotation.x,
    sfx: o.sfx, dust: o.dust ?? true };
  if (c.rel.mode === 'throw') { a.play('Idle_HitReact2', { loop: false, fade: 0.05 }); sfx.hurt(); }
  else a.play('Gallop_Jump', { loop: false, fade: 0.08 });
  if (o.thrown) a.play(o.thrown, { loop: false });
  return new Promise(res => { c.relRes = res; });
}

/** Keskeytä hahmon isku/purenta heti (esim. pelaaja saa osuman kesken syöksyn). */
export function cancel(dog) { const d = dogOf(dog); for (const c of [...active]) if (c.a === d) endCtrl(c, true); }

/** Hampaat irti heti ilman animaatiota (ohitus / kohtauksen loppu). */
export function releaseAll() { for (const c of [...active]) endCtrl(c, true); }

function endCtrl(c, snap) {
  active.delete(c); if (pins[c.a.id] === c) delete pins[c.a.id];
  if (c.a._cxBusy === c) c.a._cxBusy = null;
  if (c.tugOff) c.tugOff();
  if (snap) { spinReset(c.a); c.a.root.position.y = 0; }
  if (c.onHit) { const f = c.onHit; c.onHit = null; f(); }
  if (c.resEnd) { const f = c.resEnd; c.resEnd = null; f(); }
  if (c.relRes) { const f = c.relRes; c.relRes = null; f(); }
}

// Tehoste tapahtuman mukaan (ei yhtä oletusefektiä):
//  bite  = hammasiskun välähdys (pieni terävä tähti) + pöly-/karvarengas; strong = isompi + matala tömähdys
//  crit  = heikon kohdan osuma: lämmin tähti, oranssi kipinäpurske, rengas, valkoinen välähdys
//  impact= tassu/vartalo: iskutähti + paineaalto (FX.impact)
function hitFx(c, P) {
  const o = c.o, strong = !!o.strong || o.fx === 'crit';
  let kind = o.fx || (c.part === 'jaw' ? 'bite' : 'impact');
  if (kind === 'impact' && c.part === 'jaw') kind = 'bite';
  if (kind === 'bite') {
    FX.hitStar(P, 0xffffff, strong ? 1.4 : 0.9);
    FX.ring(P, 0xd9ccb0, strong ? 2.2 : 1.4, 0.35);
    FX.burst(P, { color: 0xb8ad98, count: strong ? 14 : 8, additive: false, speed: 2.4, size: 0.24, gravity: -9 });   // karvaa / pölyä
    if (strong) shake(0.15);
  } else if (kind === 'crit') {
    FX.hitStar(P, 0xffe6b8, 2.4);
    FX.burst(P, { color: 0xffb070, count: 26, speed: 6 }); FX.ring(P, 0xffe0b0, 4, 0.5); FX.flash('#fff2d0', 0.25, 0.55);
  } else if (kind === 'impact') FX.impact(P, strong);
  if (kind !== 'none' && P.y < 0.9) FX.dust(P.clone().setY(0.1));
  const dep = o.depth || 0;
  if (dep > 0 && kind !== 'none') {
    const layered = o.fleshSfx === false;      // kohtaus antaa valmiin kerrostetun tapahtuman (esim. arrow_bite_N)
    // hampaat uppoavat: turkki murskautuu (tumma varjo, ei verta), kipinät ja pölyrengas kasvavat syvyyden mukaan
    FX.burst(P, { color: 0x2a1c16, count: Math.round(8 + 22 * dep), additive: false, speed: 1.6 + 3 * dep, size: 0.2 + 0.25 * dep, gravity: -6, spread: 0.7 });
    FX.burst(P, { color: 0xffe2b0, count: Math.round(6 + 18 * dep), speed: 4 + 5 * dep, size: 0.25 });
    FX.ring(P, 0xcbbd9e, 1.6 + 2.6 * dep, 0.4 + 0.2 * dep);
    FX.slashArc(P, 0xfff0d8, 0.5 + 0.6 * dep, 0.3, Math.random() * 6);   // kova viiltotehoste osumassa (ei täysruutuvalkoista)
    const tier = dep < 0.45 ? 'shallow' : dep < 0.75 ? 'mid' : 'deep';
    if (!layered) {
      playAny([`bite_flesh_${tier}`, `bite_flesh_${tier}_1`, `bite_flesh_${tier}_2`], { x: P.x });
      if (dep >= 0.45) playAny(['tear', 'tear_1', 'tear_wet', 'tear_2'], { x: P.x, delay: 0.06 });
      if (dep >= 0.75) playAny(['crunch', 'crunch_1', 'crunch_2'], { x: P.x, delay: 0.03 });
    }
    shake(0.25 * dep);
  }
  if (o.grunt) playAny([].concat(o.grunt), { x: P.x, delay: 0.08 });                     // ähkäisy/vingahdus osumassa
  for (const s of [].concat(o.sfx ?? (c.part === 'paw' ? ['hit'] : ['bite']))) if (s && sfx[s]) sfx[s]({}, { x: P.x });
  if (strong && kind !== 'none' && o.fleshSfx !== false) playAny(['thud_deep', 'hit_heavy'], { vol: 0.5, x: P.x });     // matala tömähdys
  shake(o.shake ?? (strong ? 0.55 : 0.3));
  E.fovKick = Math.max(E.fovKick || 0, strong ? 3 : 1.6);
  const hs = o.hitstop ?? (strong ? 0.12 : 0.07);
  if (hs > 0 && !LOG.hold) { const prev = E.timeScale; E.timeScale = Math.min(prev, 0.06); setTimeoutRealS(hs, () => { if (E.timeScale <= 0.06) E.timeScale = prev; }); }
  if (navigator.vibrate) try { navigator.vibrate(strong ? 50 : 20); } catch (_) {}
}
/** Soita ensimmäinen olemassa oleva ääni/tapahtuma listasta (uudet sfx_map-avaimet otetaan käyttöön kun ne ilmestyvät). */
function playAny(names, opts = {}) {
  for (const n of names) if (n in sfx) { sfx.play(n, opts); return n; }
  return null;
}
function setTimeoutRealS(s, fn) { let t = 0; const u = (dt, dtr) => { t += dtr; if (t >= s) { E.updaters.delete(u); fn(); } }; E.updaters.add(u); }

function contact(c) {
  const a = c.a, tg = c.tg, P = c.ref.world(new THREE.Vector3());
  const M = partWorld(c, new THREE.Vector3());
  const dist = M.distanceTo(P);
  const ov = bodyOverlap(a, tg, c.part === 'jaw' ? ['head', 'neck', 'spine_03'] : ['spine_03']);   // rinta painuu purressa kohdetta vasten
  const rec = { id: c.id, scene: LOG.scene, who: a.id, target: tg.id, point: c.ref.name, part: c.part, dist: +dist.toFixed(4),
    th: tg.height, ratio: +(dist / tg.height).toFixed(4), bodyK: +ov.k.toFixed(3), pair: ov.pair, hanging: c.hanging,
    P: [P.x, P.y, P.z].map(v => +v.toFixed(3)), M: [M.x, M.y, M.z].map(v => +v.toFixed(3)), t: +E.time.toFixed(2) };
  LOG.strikes.push(rec);
  hitFx(c, P);
  const dirX = Math.sign(tg.root.position.x - a.root.position.x) || 1;
  if (c.o.react !== 'none') react(tg, c.o.react || 'flinch', dirX, { amp: 0.3 + 0.5 * (c.o.depth || 0), ...(c.o.reactOpts || {}) });
  if (c.o.onHit) try { c.o.onHit(P, c); } catch (e) { console.error(e); }
  // pin: leuka kiinni (klippi pysähtyy purentahetkeen) + riuhtova pää
  if (c.o.pin) {
    c.phase = 'pin'; c.el = 0; c.pinT = c.o.pin === true ? Infinity : c.o.pin; pins[a.id] = c;
    if (a.cur && a.cur.action) a.cur.action.timeScale = 0;
    if (a.bones && a.bones.neck && c.part === 'jaw') {
      let t = 0; const tug = c.o.tug ?? 0.16;
      c.tugOff = a.overlay((dd, dt) => { t += dt; rotBoneWorld(a.bones.neck, Y, Math.sin(t * 13) * tug); rotBoneWorld(a.bones.head, X, Math.sin(t * 9 + 1) * tug * 0.6); });
    }
  } else { c.phase = 'recoil'; c.el = 0; c.recoilFrom = a.root.position.clone(); }
  followFrames({ strike: c.id, who: a.id, point: c.ref.name });
  if (LOG.hold) {   // contact-check: pysäytä kuva kontaktihetkeen
    rec.frame = 'f4_contact'; rec.strike = c.id;
    c.held = true; LOG.pending = rec; c.prevTS = E.timeScale; E.timeScale = 0;
  } else fireHit(c);
}
function whiff(c) {
  const a = c.a, M = mouthWorld(a, new THREE.Vector3()), real = c.ref.world(new THREE.Vector3());
  (LOG.whiffs = LOG.whiffs || []).push({ scene: LOG.scene, who: a.id, target: c.tg.id, point: c.ref.name, miss: +M.distanceTo(real).toFixed(3) });
  sfx.play && sfx.play('bite_snap'); sfx.whoosh();
  c.phase = 'release'; c.el = 0;
  c.rel = { mode: 'drop', from: a.root.position.clone(), to: new THREE.Vector3(a.root.position.x + a.facing * 0.5, 0, a.root.position.z), t: 0.4, arc: 0.1, spin: 0,
    land: 'Jump_ToIdle', after: 'Idle', pitch0: a.pose.rotation.z, yaw0: a.pose.rotation.y, roll0: a.pose.rotation.x, dust: true };
  fireHit(c);
}
// contact-check -kuvasarja: pysäytä kuva (anticipation -> lunge -> contact -> follow-through)
let frameSeq = 0;
function holdFrame(info) {
  if (!LOG.seq || E.skipping || LOG.pending) return;
  const pend = { ...info, id: 'f' + (++frameSeq), scene: LOG.scene };
  const prev = E.timeScale; LOG.pending = pend; E.timeScale = 0;
  const u = () => { if (!LOG.pending || LOG.pending.id !== pend.id) { E.updaters.delete(u); E.timeScale = prev || 1; } };
  E.updaters.add(u);
}
function followFrames(info) {
  if (!LOG.seq) return;
  let t = 0, n = 0; const at = [0.22, 0.6];
  const u = (dt) => { t += dt; if (LOG.pending) return; if (t >= at[n]) { holdFrame({ ...info, frame: n === 0 ? 'f5_follow' : 'f6_after' }); n++; if (n >= at.length) E.updaters.delete(u); } };
  E.updaters.add(u);
}
function fireHit(c) { const f = c.onHit; c.onHit = null; if (f) f(); }

function update(dt, dtr) {
  for (const m of [...motions]) { if (E.skipping) { m.d.pose.rotation.set(0, 0, 0); motions.delete(m); m.res(); continue; } applyMotion(m, dt); }
  if (E.skipping) { for (const c of [...active]) { if (c.held) { c.held = false; LOG.pending = null; E.timeScale = c.prevTS || 1; } endCtrl(c, true); } }
  for (const c of [...active]) {
    if (c.held) {
      if (!LOG.pending || LOG.pending.id !== c.id) { c.held = false; E.timeScale = c.prevTS || 1; fireHit(c); }
      continue;
    }
    const a = c.a; c.el += dt;
    if (c.tg) c.tg.root.updateMatrixWorld(true);          // kohteen luut tämän ruudun asentoon (klippi + kerrokset)
    const P = c.fixedP ? c.fixedP.clone() : c.ref ? c.ref.world(new THREE.Vector3()) : null;
    if (c.phase === 'wind') {
      const k = Math.min(1, c.el / c.wind), e = ease.inOut(k), R = a.root.position;
      R.x = c.R0.x - a.facing * a.height * 0.14 * e;                 // vetäytyy
      spinSet(a, 0, c.yaw * 0.3 * e, -0.12 * e);                       // pää alas, kyyristys
      a.pose.scale.set(1 + 0.04 * e, 1 - 0.1 * e, 1);
      a.pose.position.y = -a.height * 0.05 * e;
      if (k >= 1) { lungeStart(c); holdFrame({ strike: c.id, who: a.id, point: c.ref.name, frame: 'f2_launch' }); }
      continue;
    }
    if (c.phase === 'lunge') {
      const k = Math.min(1, c.el / c.T);
      // sakuga-venytys (smear): vartalo venyy liikkeen suuntaan syöksyn keskellä
      const sm = Math.sin(Math.min(1, k) * Math.PI) * (c.o.smear ?? 1);
      a.pose.scale.set(1 + 0.2 * sm, 1 - 0.07 * sm, 1 - 0.04 * sm);
      if (c.o.strong && !c.ghost && k > 0.45) { c.ghost = true; FX.afterimage && FX.afterimage(a, 0xdfe8ff, 0.28, 0.35); }
      if (!c.midShot && k >= 0.6) { c.midShot = true; holdFrame({ strike: c.id, who: a.id, point: c.ref.name, frame: 'f3_lunge' }); }
      if (!c.bitePlayed && c.el >= c.T - c.biteLead) { a.play(c.o.biteAnim || 'Attack', { loop: false, timeScale: 1, fade: 0.06 }); c.bitePlayed = true; }
      // kontaktiasento: missä juuri olisi, jos hampaat olisivat nyt pisteessä
      const R = a.root.position, save = R.clone();
      const kk = (c.o.ease ? ease[c.o.ease] : ease.in)(k);
      const pitchK = ease.inOut(Math.min(1, k * 1.4));
      solveBody(c, P, 0, true);
      const Rc = R.clone(), thC = a.pose.rotation.z;
      R.copy(save);
      R.lerpVectors(c.R0, Rc, kk);
      R.y = c.R0.y + (Rc.y - c.R0.y) * kk + Math.sin(k * Math.PI) * c.arc;
      if (!c.hanging && k < 1) R.y = Math.max(0, R.y);
      spinSet(a, c.roll * pitchK, c.yaw * pitchK, thC * pitchK);
      if (k >= 1) {
        a.pose.scale.set(1, 1, 1);
        solveBody(c, P, 0, true);
        if (c.o.whiff) { whiff(c); continue; }
        pushOut(c, P, 0);
        contact(c);
      }
      continue;
    }
    if (c.phase === 'pin') {
      // heiluri: kohdepisteen kiihtyvyys heiluttaa roikkuvaa vartaloa
      if (c.prevP) {
        const vx = (P.x - c.prevP.x) / Math.max(dt, 1e-4), vy = (P.y - c.prevP.y) / Math.max(dt, 1e-4);
        const ax = c.prevV ? (vx - c.prevV.x) / Math.max(dt, 1e-4) : 0; c.prevV = { x: vx, y: vy };
        const kS = c.hanging ? 30 : 60, damp = c.hanging ? 2.2 : 6;
        c.swingV += (-kS * c.swing - damp * c.swingV - clamp(ax, -60, 60) * 0.02 * a.facing) * dt;
        c.swing = clamp(c.swing + c.swingV * dt, -0.6, 0.6);
      }
      c.prevP = P.clone();
      if (dt > 0) { solveBody(c, P, c.swing + (c.o.pinPitch || 0), true); pushOut(c, P, c.swing + (c.o.pinPitch || 0)); }
      if (c.el >= c.pinT) { release({ who: a.id, mode: c.o.then || 'drop', ...(c.o.releaseOpts || {}) }); }
      continue;
    }
    if (c.phase === 'recoil') {
      const r = c.o.recoil || {}, T = r.t ?? 0.35, k = Math.min(1, c.el / T);
      const back = r.dist ?? 0.7;
      const R = a.root.position;
      R.x = c.recoilFrom.x - a.facing * back * ease.out(k);
      R.y = Math.max(0, c.recoilFrom.y * (1 - ease.in(k)) + Math.sin(k * Math.PI) * (r.arc ?? 0.15));
      spinSet(a, 0, c.yaw * (1 - k), a.pose.rotation.z * (1 - k));
      if (k >= 1) { spinReset(a); R.y = 0; if (c.o.after) a.play(c.o.after); else a.play('Idle'); endCtrl(c, false); }
      continue;
    }
    if (c.phase === 'release') {
      const r = c.rel, k = Math.min(1, c.el / r.t), R = a.root.position;
      const to = r.to || new THREE.Vector3(r.from.x - a.facing * 0.5, 0, r.from.z + 0.2);
      R.x = r.from.x + (to.x - r.from.x) * ease.out(k);
      R.z = r.from.z + (to.z - r.from.z) * ease.out(k);
      R.y = Math.max(0, r.from.y * (1 - k * k) + Math.sin(k * Math.PI) * r.arc);
      spinSet(a, r.roll0 * (1 - k), r.yaw0 * (1 - k), r.pitch0 * (1 - k));
      if (r.spin) spinSet(a, r.roll0 * (1 - k) + Math.sin(k * Math.PI) * 0.8 * r.spin, r.yaw0 * (1 - k), r.pitch0 * (1 - k) + Math.sin(k * Math.PI * 2) * 0.6 * r.spin);
      if (k >= 1) {
        spinReset(a); R.y = 0;
        if (r.dust) FX.dust(R.clone().setY(0.1), r.mode === 'throw');
        if (r.mode === 'throw') { sfx.bodyfall({}, { x: R.x }); shake(0.3); }
        else sfx.land({}, { x: R.x });
        a.play(r.land, { loop: r.land === 'LieDown' || r.land === 'Idle' || r.land === 'Idle_2_HeadLow', fade: 0.06 });
        if (r.after) setTimeoutRealS(0.6, () => a.currentName === r.land && a.play(r.after));
        endCtrl(c, false);
      }
      continue;
    }
  }
  separate();
  if (LOG.monitor) monitor(dtr);
}

// ------------------------------------------------------------------ pään ojennus (CCD-IK): iso hahmo puree paikaltaan
/**
 * Hyökkääjä (esim. P4) ojentaa kaulansa ja päänsä niin, että hampaat osuvat kohteen pisteeseen – juuri ei liiku.
 * o: { who, target, point, side, t (ojennuksen kesto), hold (s pidossa), fx, sfx, react, strong, onHit }
 * Palauttaa lupauksen, joka täyttyy kontaktissa (o.wait === 'end': kun pää on palannut).
 */
export function reach(o) {
  install();
  const a = dogOf(o.who), tg = dogOf(o.target);
  if (!a || !tg || !a.bones) return Promise.resolve();
  const ref = targetRef(tg, o.point || 'neck', o.side || 'near', o.sink ?? 0.02 * tg.height);
  const paw = o.part === 'paw', S = paw ? nearSide(a, o.pawSide || 'near') : null;
  const joints = (paw ? [['front_lower_' + S, 1.4], ['front_upper_' + S, 1.4], ['spine_03', 0.25]]
    : [['head', 1.1], ['neck', 1.2], ['spine_03', 0.5], ['spine_02', 0.35], ['spine_01', 0.15]]).filter(([n]) => a.bones[n]);
  const eff = out => paw ? a.bones['front_paw_' + S].getWorldPosition(out) : mouthWorld(a, out);
  const T = Math.max(0.05, o.t ?? 0.3), hold = o.hold ?? 0.25, back = o.back ?? 0.35;
  const P = new THREE.Vector3(), M = new THREE.Vector3(), J = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), ax = new THREE.Vector3();
  let t = 0, hit = false, done = false;
  a._cxReach = tg;                               // valvonta: pään ja kohteen päällekkäisyys on purenta, ei läpileikkaus
  const rec = { id: ++LOG.n, kind: 'reach' };
  let resolveHit, resolveEnd;
  const pHit = new Promise(r => { resolveHit = r; }), pEnd = new Promise(r => { resolveEnd = r; });
  a.play(o.anim || (paw ? 'Idle' : 'Attack'), { loop: false, timeScale: o.ts || 0.8, fade: 0.08 });
  const off = a.overlay((dd, dt) => {
    t += dt;
    const w = t < T ? ease.inOut(t / T) : t < T + hold ? 1 : Math.max(0, 1 - (t - T - hold) / back);
    ref.world(P);
    if (o.dip) { a.pose.rotation.order = 'XYZ'; a.pose.rotation.z = -o.dip * w; a.pose.position.y -= a.height * 0.04 * o.dip * w; }   // etupää alas (syöksy)
    for (let it = 0; it < 5; it++) {
      for (const [bn, lim] of joints) {
        a.root.updateMatrixWorld(true);
        const b = a.bones[bn]; b.getWorldPosition(J); eff(M);
        v1.subVectors(M, J); v2.subVectors(P, J);
        const ang = v1.angleTo(v2); if (ang < 1e-3) continue;
        ax.crossVectors(v1, v2).normalize();
        rotBoneWorld(b, ax, Math.min(ang, lim * 0.5) * w);
      }
    }
    if (!hit && t >= T) {
      hit = true; a.root.updateMatrixWorld(true); eff(M);
      const dist = M.distanceTo(P);
      Object.assign(rec, { scene: LOG.scene, who: a.id, target: tg.id, point: ref.name, part: paw ? 'paw' : 'jaw', dist: +dist.toFixed(4), th: tg.height, ratio: +(dist / tg.height).toFixed(4),
        bodyK: +bodyOverlap(tg, a, ['head', 'neck', 'spine_03']).k.toFixed(3), P: [P.x, P.y, P.z].map(v => +v.toFixed(3)), M: [M.x, M.y, M.z].map(v => +v.toFixed(3)), t: +E.time.toFixed(2) });
      LOG.strikes.push(rec);
      hitFx({ o: { strong: o.strong, fx: o.fx, sfx: o.sfx ?? (paw ? ['hitHeavy'] : ['bite']), hitstop: o.hitstop, shake: o.shake }, part: paw ? 'paw' : 'jaw' }, P.clone());
      if (o.react !== 'none') react(tg, o.react || 'hurt', Math.sign(tg.root.position.x - a.root.position.x) || 1, o.reactOpts || {});
      if (o.onHit) try { o.onHit(P.clone()); } catch (e) { console.error(e); }
      if (LOG.hold) { LOG.pending = rec; rec.prevTS = E.timeScale; E.timeScale = 0; const u = () => { if (!LOG.pending || LOG.pending.id !== rec.id) { E.updaters.delete(u); E.timeScale = rec.prevTS || 1; resolveHit(); } }; E.updaters.add(u); }
      else resolveHit();
    }
    if ((t >= T + hold + back || E.skipping) && !done) { done = true; off(); a._cxReach = null; if (o.dip) a.pose.rotation.z = 0; if (!hit) resolveHit(); resolveEnd(); }
  });
  return o.wait === 'end' ? pEnd : pHit;
}

/** Kirjaa vartalokontakti (rynnäkkö/törmäys): hyökkääjän pinnan piste vs kohteen vartalopallo. Palauttaa etäisyyden pintaan. */
export function touch(attacker, point, target, o = {}) {
  const a = dogOf(attacker), tg = dogOf(target);
  a.root.updateMatrixWorld(true); tg.root.updateMatrixWorld(true);
  const P = targetRef(a, point, o.side || 'near', 0).world(new THREE.Vector3());
  let best = 9, at = null;
  for (const sp of bodySpheres(tg)) { const d = Math.max(0, sp.p.distanceTo(P) - sp.r); if (d < best) { best = d; at = sp.p; } }
  const rec = { id: ++LOG.n, kind: 'touch', scene: LOG.scene, who: a.id, target: tg.id, point, part: 'body', dist: +best.toFixed(4), th: tg.height, ratio: +(best / tg.height).toFixed(4),
    bodyK: 9, P: [P.x, P.y, P.z].map(v => +v.toFixed(3)), t: +E.time.toFixed(2) };
  LOG.strikes.push(rec);
  hitFx({ o: { strong: true, fx: o.fx, sfx: o.sfx ?? ['hitHeavy'], hitstop: o.hitstop, shake: o.shake }, part: 'paw' }, at ? at.clone().lerp(P, 0.5) : P);
  if (LOG.hold) { LOG.pending = rec; rec.prevTS = E.timeScale; E.timeScale = 0; const u = () => { if (!LOG.pending || LOG.pending.id !== rec.id) { E.updaters.delete(u); E.timeScale = rec.prevTS || 1; } }; E.updaters.add(u); }
  return best;
}

// ------------------------------------------------------------------ erottelu (ei sisäkkäisyyttä maassa)
export const SEP = { on: true, skip: new Set() };
function foot(d) { return { hl: d.length * 0.42, hw: Math.max(0.12, d.width * 0.5) }; }
function separate() {
  if (!SEP.on) return;
  const ds = Object.values(cast).filter(d => d.root.visible && !d._cxBusy && !d._carried && !SEP.skip.has(d.id) && d.root.position.y < 0.2);
  for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) {
    const a = ds[i], b = ds[j], A = a.root.position, B = b.root.position;
    const fa = foot(a), fb = foot(b);
    const px = fa.hl + fb.hl - Math.abs(A.x - B.x), pz = fa.hw + fb.hw - Math.abs(A.z - B.z);
    if (px <= 0 || pz <= 0) continue;
    const ma = a.height ** 3 * (a.id === 'kaibutsu' ? 50 : 1), mb = b.height ** 3 * (b.id === 'kaibutsu' ? 50 : 1);
    const sa = mb / (ma + mb), sb = ma / (ma + mb);
    if (pz < px * 1.6) { const s = Math.sign(A.z - B.z) || (a.id === 'kaibutsu' ? -1 : 1); A.z += s * pz * sa; B.z -= s * pz * sb; }
    else { const s = Math.sign(A.x - B.x) || 1; A.x += s * px * sa; B.x -= s * px * sb; if (a.id === 'weed' || b.id === 'weed') syncWeed(a, b); }
  }
}
let weedSync = null;
export function onWeedPushed(fn) { weedSync = fn; }
function syncWeed(a, b) { if (weedSync) weedSync((a.id === 'weed' ? a : b).root.position.x); }

// ------------------------------------------------------------------ valvonta (contact-check)
let monT = 0; const seen = new Set();
function monitor(dtr) {
  monT -= dtr; if (monT > 0) return; monT = 0.08;
  const ds = Object.values(cast).filter(d => d.root.visible && d.root.parent);
  for (const a of ds) for (const b of ds) {
    if (a === b || a._carried || b._carried) continue;
    const busyA = a._cxBusy, A = a.root.position, B = b.root.position;
    // seisoo toisen päällä / roikkuu selässä ilman kontaktia
    const fb = foot(b);
    if (!busyA && A.y > 0.25 && Math.abs(A.x - B.x) < fb.hl && Math.abs(A.z - B.z) < fb.hw + 0.1 && A.y > b.height * 0.3 && a.id !== b.id)
      add('on_top', a, b, { y: +A.y.toFixed(2) });
    // vartalot sisäkkäin (paitsi purennassa / loikassa)
    if (a.id < b.id && !busyA && !b._cxBusy && a._cxReach !== b && b._cxReach !== a) {
      const ov = bodyOverlap(a, b);
      if (ov.k < 0.55) add('inside', a, b, { k: +ov.k.toFixed(2), pair: ov.pair });
    }
    // purennassa: hyökkääjän vartalo (ei pää/kaula) ei saa mennä kohteen sisään
    if (busyA && busyA.tg === b && (busyA.phase === 'pin' || busyA.phase === 'lunge')) {
      const ov = bodyOverlap(a, b, ['head', 'neck', 'spine_03']);
      if (ov.k < 0.5) add('pin_inside', a, b, { k: +ov.k.toFixed(2), pair: ov.pair, phase: busyA.phase });
    }
  }
}
function add(kind, a, b, extra) {
  const key = LOG.scene + kind + a.id + b.id; if (seen.has(key)) { const v = LOG.violations.find(x => x.key === key); if (v) v.n++; return; }
  seen.add(key); LOG.violations.push({ key, scene: LOG.scene, kind, a: a.id, b: b.id, n: 1, t: +E.time.toFixed(2), ...extra });
}
if (typeof window !== 'undefined') {
  LOG.release = () => { LOG.pending = null; };
  LOG.measure = (who, target, point, side) => { const r = targetRef(target, point, side); return mouthWorld(who).distanceTo(r.world(new THREE.Vector3())); };
  LOG.debugSolve = (id, yaw, maxPitch, roll = 0) => {   // contact-check / säätö: kokeile asentoa pysäytetyssä kontaktissa
    const c = [...active].find(x => x.id === id); if (!c) return null;
    c.yaw = yaw; c.maxPitch = maxPitch; c.roll = roll; solveBody(c, c.ref.world(new THREE.Vector3()));
    return { k: bodyOverlap(c.a, c.tg, ['head', 'neck', 'spine_03']), hanging: c.hanging, root: c.a.root.position.toArray() };
  };
  LOG.reset = () => { LOG.strikes.length = 0; LOG.violations.length = 0; seen.clear(); };
}
if (typeof window !== 'undefined') LOG.api = { SEP, bodyMotion, strike, reach, release, releaseAll, thrash, react, mouthWorld, targetRef, bodyOverlap };
