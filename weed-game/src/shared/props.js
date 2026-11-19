// Kevyet proseduraaliset 3D-esineet (prologi / taso 1): puunrunko, aita, verkkoaita, rekka, koppi, heinäpaali,
// laatikko, matala orsi, ankkalampi, pesäkolo, rikkaruoho, tie. Toon-materiaali + ääriviivakuori, ei tekstuureja.
// Jokainen funktio palauttaa THREE.Group:n (lisää itse sceneen). Mittakaava: Weed-pentu ≈ 0.5 yksikköä korkea.
import * as THREE from 'three';
import { gradientMap } from '../dogs.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const matCache = new Map();
export function toon(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap, ...o });
  matCache.set(key, m); return m;
}
const olMat = new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide });
/** Mesh + ääriviiva. */
export function mesh(geo, color, ol = 0.035, o = {}) {
  const m = new THREE.Mesh(geo, toon(color, o));
  m.castShadow = true; m.receiveShadow = true;
  if (ol) {
    geo.computeBoundingSphere();
    const r = geo.boundingSphere.radius || 1;
    const s = new THREE.Mesh(geo, olMat); s.scale.setScalar(1 + ol / r); s.userData.noGfx = true; m.add(s);
  }
  return m;
}
const grp = (...c) => { const g = new THREE.Group(); for (const x of c) g.add(x); return g; };

/** Kaatunut puunrunko (hypättävä). */
export function log(len = 1.6, r = 0.16) {
  const body = mesh(new THREE.CylinderGeometry(r, r * 1.1, len, 9, 1), 0x5a3a26);
  body.rotation.x = Math.PI / 2; body.position.y = r;
  const end = mesh(new THREE.CircleGeometry(r * 0.92, 9), 0xc79a62, 0);
  end.position.set(0, r, len / 2 + 0.002);
  const stub = mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.3, 5), 0x4a3020, 0.01);
  stub.position.set(0.04, r * 1.9, -0.2); stub.rotation.z = -0.5;
  const g = flatten(grp(body, end, stub)); g.userData.h = r * 2; return g;
}
/** Puuaita (2 vaakalankkua + tolpat). */
export function fence(w = 1.4, h = 0.55, color = 0x8a6440) {
  const g = new THREE.Group();
  for (const z of [-w / 2, w / 2]) { const p = mesh(new THREE.BoxGeometry(0.08, h + 0.12, 0.08), color, 0.012); p.position.set(0, (h + 0.12) / 2, z); g.add(p); }
  for (const y of [h * 0.45, h * 0.92]) { const b = mesh(new THREE.BoxGeometry(0.05, 0.08, w + 0.1), color, 0.012); b.position.set(0, y, 0); g.add(b); }
  flatten(g); g.userData.h = h; return g;
}
/** Heinäpaali. */
export function hay(r = 0.3) {
  const b = mesh(new THREE.CylinderGeometry(r, r, 0.9, 12), 0xc9a24e);
  b.rotation.x = Math.PI / 2; b.position.y = r;
  const band = mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 0.05, 12), 0x8a6a2a, 0); band.rotation.x = Math.PI / 2; band.position.set(0, r, 0.2);
  const g = flatten(grp(b, band)); g.userData.h = r * 2; return g;
}
/** Puulaatikko. */
export function crate(s = 0.42, color = 0x9c7446) {
  const b = mesh(new THREE.BoxGeometry(s, s, s), color, 0.015); b.position.y = s / 2;
  const x1 = mesh(new THREE.BoxGeometry(s * 1.02, 0.04, 0.04), 0x5a3e22, 0); x1.position.set(0, s / 2, s / 2 + 0.005); x1.rotation.z = 0.78;
  const g = flatten(grp(b, x1)); g.userData.h = s; return g;
}
/** Matala orsi / kärryn aisa / oksa (alitettava). y = alareuna. */
export function beam(y = 0.36, len = 1.6, color = 0x6a4a30) {
  const b = mesh(new THREE.BoxGeometry(0.12, 0.12, len), color, 0.015); b.position.y = y + 0.06;
  const g = new THREE.Group(); g.add(b);
  for (const z of [-len / 2, len / 2]) { const p = mesh(new THREE.BoxGeometry(0.08, y + 0.12, 0.08), color, 0.012); p.position.set(0, (y + 0.12) / 2, z); g.add(p); }
  flatten(g); g.userData.low = y; return g;
}
/** Roikkuva verkko (ihmisten koiranloukku), alitettava. */
export function hangingNet(y = 0.34) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); x.strokeStyle = '#e8e2d0'; x.lineWidth = 3;
  for (let i = -64; i < 128; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  net.rotation.y = Math.PI / 2; net.position.y = y + 0.5; g.add(net);
  const rope = mesh(new THREE.BoxGeometry(0.04, 0.04, 1.7), 0xd8c8a0, 0); rope.position.y = y + 1.0; g.add(rope);
  const ropeLow = mesh(new THREE.BoxGeometry(0.05, 0.05, 1.7), 0xd8c8a0, 0); ropeLow.position.y = y; g.add(ropeLow);
  g.userData.low = y; return g;
}
/** Hanhiparvi (napautus = haukku hajottaa). Palauttaa ryhmän, userData.birds. */
export function geese(n = 3) {
  const g = new THREE.Group(); g.userData.birds = [];
  for (let i = 0; i < n; i++) {
    const b = new THREE.Group();
    const body = mesh(new THREE.SphereGeometry(0.13, 10, 8), 0xf2efe6, 0.012); body.scale.set(1.35, 0.85, 0.9); body.position.y = 0.16;
    const neck = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 6), 0xf2efe6, 0.008); neck.position.set(0.12, 0.3, 0); neck.rotation.z = -0.3;
    const head = mesh(new THREE.SphereGeometry(0.05, 8, 6), 0xf2efe6, 0.008); head.position.set(0.16, 0.4, 0);
    const beak = mesh(new THREE.ConeGeometry(0.025, 0.08, 6), 0xf09030, 0); beak.rotation.z = -Math.PI / 2; beak.position.set(0.22, 0.4, 0);
    b.add(body, neck, head, beak);
    for (const x of [neck, head, beak]) x.userData.castShadow = false;
    flatten(b);
    b.position.set((i - (n - 1) / 2) * 0.28, 0, (i % 2 ? 0.25 : -0.2)); b.rotation.y = Math.PI + (i - 1) * 0.4;
    g.add(b); g.userData.birds.push(b);
  }
  g.userData.h = 0.45; return g;
}
/** Koirankoppi (lankkuseinä voi hajota: userData.planks). */
export function kennel() {
  const g = new THREE.Group(); g.userData.planks = [];
  const W = 1.5, D = 1.3, H = 1.1;
  const floor = mesh(new THREE.BoxGeometry(W, 0.08, D), 0x6a4a30, 0.01); floor.position.y = 0.04; g.add(floor);
  for (let i = 0; i < 7; i++) {        // etuseinä lankuista (hajoaa)
    const p = mesh(new THREE.BoxGeometry(0.2, H, 0.07), i % 2 ? 0x8a6240 : 0x7c5636, 0.01);
    p.position.set(-W / 2 + 0.11 + i * 0.213, H / 2, D / 2); p.userData.home = p.position.clone(); g.add(p); g.userData.planks.push(p);
  }
  for (const s of [-1, 1]) { const w = mesh(new THREE.BoxGeometry(0.08, H, D), 0x6e4c30, 0.012); w.position.set(s * W / 2, H / 2, 0); g.add(w); }
  const back = mesh(new THREE.BoxGeometry(W, H, 0.08), 0x6e4c30, 0.012); back.position.set(0, H / 2, -D / 2); g.add(back);
  for (const s of [-1, 1]) { const r = mesh(new THREE.BoxGeometry(W + 0.3, 0.06, D * 0.62), 0x3e3a44, 0.012); r.position.set(0, H + 0.26, s * D * 0.25); r.rotation.x = s * 0.62; g.add(r); }
  return flatten(g, g.userData.planks);                 // planks stay separate (they fly apart); the rest is one mesh
}
/** Ankkalampi (litteä vesitaso + kivireuna). */
export function pond(r = 1.6) {
  const w = new THREE.Mesh(new THREE.CircleGeometry(r, 28), new THREE.MeshToonMaterial({ color: 0x2c4a6a, gradientMap, emissive: 0x0a1424 }));
  w.rotation.x = -Math.PI / 2; w.position.y = 0.025; w.scale.y = 0.6; w.receiveShadow = true; w.userData.noGfx = true;
  const g = grp(w);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const s = mesh(new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.06, 0), 0x7a766e, 0.01); s.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r * 0.6); g.add(s); }
  return flatten(g);                                   // 14 stones + hulls -> 2 meshes
}
/** Pesäkolo juurakon alla (Sakuran pesä). */
export function den() {
  const g = new THREE.Group();
  const mound = mesh(new THREE.SphereGeometry(1.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x4a3424, 0.02); mound.scale.set(1.2, 0.75, 0.9); g.add(mound);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), new THREE.MeshBasicMaterial({ color: 0x0c0806 })); hole.position.set(0.2, 0.42, 1.18); hole.scale.y = 0.7; g.add(hole);
  for (let i = 0; i < 6; i++) {      // juuret
    const r = mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.5, 6), 0x3a2a1c, 0.01);
    r.position.set(-1 + i * 0.42, 0.6, 0.6 + Math.sin(i) * 0.3); r.rotation.set(0.9, 0, (i - 2.5) * 0.35); g.add(r);
  }
  const trunk = mesh(new THREE.CylinderGeometry(0.35, 0.55, 4.2, 9), 0x3a2a1c, 0.02); trunk.position.set(-0.3, 2.6, -0.5); g.add(trunk);
  const crown = mesh(new THREE.IcosahedronGeometry(1.6, 0), 0x9c3a18, 0.03); crown.position.set(-0.3, 5.1, -0.5); crown.scale.set(1.3, 0.9, 1.1); g.add(crown);
  const crown2 = mesh(new THREE.IcosahedronGeometry(1.1, 0), 0xc47a22, 0.03); crown2.position.set(0.8, 4.6, 0.2); g.add(crown2);
  return g;
}
/** Rikkaruoho kiven raossa (nimen antaminen). */
export function weedPlant() {
  const g = new THREE.Group();
  const stone = mesh(new THREE.DodecahedronGeometry(0.22, 0), 0x8a867c, 0.012); stone.scale.set(1.6, 0.5, 1.2); stone.position.y = 0.08; g.add(stone);
  for (let i = 0; i < 7; i++) {
    const l = mesh(new THREE.ConeGeometry(0.025, 0.28 + (i % 3) * 0.06, 4), i % 2 ? 0x5c8a34 : 0x4a7a2a, 0);
    l.position.set(0.03 * Math.cos(i * 1.7), 0.24, 0.03 * Math.sin(i * 1.7)); l.rotation.set(Math.cos(i * 2.1) * 0.5, 0, Math.sin(i * 2.1) * 0.5); g.add(l);
  }
  const flower = mesh(new THREE.SphereGeometry(0.035, 6, 5), 0xf0d040, 0); flower.position.set(0.02, 0.42, 0); g.add(flower);
  g.userData.flower = flower; return g;
}
/** Asfalttitie (pitkä taso) + keskiviiva. */
export function road(len = 120, w = 2.6) {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.PlaneGeometry(len, w), toon(0x34343a)); a.rotation.x = -Math.PI / 2; a.position.y = 0.02; a.receiveShadow = true; a.userData.noGfx = true; g.add(a);
  for (let x = -len / 2; x < len / 2; x += 2.4) { const l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.08), new THREE.MeshBasicMaterial({ color: 0xd8d0b0 })); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.025, 0); l.userData.noGfx = true; g.add(l); }
  return flatten(g);                                   // ~60 lane marks (each its own material) -> 1 mesh
}
/** Verkkoaita tien varressa (pitkä). */
export function netFence(len = 30, h = 1.0) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); x.strokeStyle = 'rgba(200,205,210,0.95)'; x.lineWidth = 2.5;
  for (let i = -64; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 0.5, h / 0.5);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(len, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  net.position.y = h / 2; net.userData.noGfx = true; g.add(net);
  for (let p = -len / 2; p <= len / 2; p += 2.5) { const post = mesh(new THREE.CylinderGeometry(0.03, 0.03, h + 0.1, 6), 0x8a8e94, 0.008); post.position.set(p, (h + 0.1) / 2, 0); g.add(post); }
  const top = mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 5), 0x8a8e94, 0); top.rotation.z = Math.PI / 2; top.position.y = h; g.add(top);
  return flatten(g);                                   // posts + hulls (~50 draw calls) -> 3 meshes
}
/** Rekka (kuorma-auto) +X-suuntaan, ajovalot. userData.lights = valokartiot. */
export function truck(color = 0x4a6a8a) {
  const g = new THREE.Group();
  const cab = mesh(new THREE.BoxGeometry(1.5, 1.7, 2.1), color, 0.03); cab.position.set(2.6, 1.25, 0); g.add(cab);
  const glass = mesh(new THREE.BoxGeometry(0.05, 0.6, 1.8), 0x1a2430, 0, { emissive: 0x0a1018 }); glass.position.set(3.36, 1.65, 0); g.add(glass);
  const box = mesh(new THREE.BoxGeometry(4.4, 2.3, 2.2), 0xd8d4c8, 0.03); box.position.set(-0.5, 1.55, 0); g.add(box);
  const stripe = mesh(new THREE.BoxGeometry(4.42, 0.22, 2.22), 0xb03a2a, 0); stripe.position.set(-0.5, 1.0, 0); g.add(stripe);
  const chassis = mesh(new THREE.BoxGeometry(6.2, 0.3, 1.9), 0x1c1c22, 0.02); chassis.position.set(0.5, 0.45, 0); g.add(chassis);
  for (const x of [-2, -1.1, 2.6]) for (const z of [-0.95, 0.95]) {
    const w = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14), 0x121214, 0.02); w.rotation.x = Math.PI / 2; w.position.set(x, 0.42, z); g.add(w);
    const hub = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 8), 0x9a9aa0, 0); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.42, z); g.add(hub);
  }
  g.userData.lights = [];
  for (const z of [-0.65, 0.65]) {
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), new THREE.MeshBasicMaterial({ color: 0xfff4c8 })); h.position.set(3.36, 0.75, z); h.rotation.y = Math.PI / 2; g.add(h);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    cone.rotation.z = Math.PI / 2; cone.position.set(6.9, 0.6, z); cone.userData.noGfx = true; g.add(cone); g.userData.lights.push(cone);
  }
  return g;
}
/** Pieni saalispala (lihanpala / kala). */
export function scrap() {
  const m = mesh(new THREE.SphereGeometry(0.08, 8, 6), 0xa84a3a, 0.01); m.scale.set(1.6, 0.7, 1); m.position.y = 0.06;
  const bone = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 5), 0xf0e6d0, 0); bone.rotation.z = Math.PI / 2; bone.position.y = 0.07;
  return grp(m, bone);
}
/** Kylän talo (tausta). */
export function house(w = 3, h = 2.2, color = 0xb8a890) {
  const g = new THREE.Group();
  const b = mesh(new THREE.BoxGeometry(w, h, 2.4), color, 0.03); b.position.y = h / 2; g.add(b);
  const roof = mesh(new THREE.ConeGeometry(w * 0.82, 1.2, 4), 0x4a3a40, 0.03); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.75; roof.position.y = h + 0.6; g.add(roof);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.45), new THREE.MeshBasicMaterial({ color: 0xffd890 })); win.position.set(0.5, h * 0.55, 1.21); g.add(win);
  g.userData.window = win; return g;
}
/** Draw-call saver for static props: merges every mesh under `root` that shares a material (outline hulls included)
 * into one mesh, transforms baked in. Children listed in `keep` (and their subtrees) stay separate (animated parts).
 * Town: ~70 -> ~6 draw calls; fence: 8 -> 2; a goose: 8 -> 3. Falls back to leaving the group as it was. */
export function flatten(root, keep = []) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), rel = new THREE.Matrix4();
  const keepSet = new Set(keep), groups = new Map(), victims = [];
  const walk = o => {
    for (const c of o.children) {
      if (keepSet.has(c)) continue;
      if (c.isMesh && !c.isSkinnedMesh && c.geometry && !Array.isArray(c.material)) {
        const m = c.material;
        const key = m.isMeshBasicMaterial && !m.map ? `b${m.color.getHex()}_${m.side}_${m.transparent}_${m.opacity}` : m.uuid;
        if (!groups.has(key)) groups.set(key, { mat: m, geos: [], first: c });
        let g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
        g.applyMatrix4(rel.multiplyMatrices(inv, c.matrixWorld));
        for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        groups.get(key).geos.push(g); victims.push(c);
      }
      walk(c);
    }
  };
  walk(root);
  const out = [];
  for (const { mat, geos, first } of groups.values()) {
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) { geos.forEach(g => g.dispose()); out.forEach(m => m.geometry.dispose()); return root; }
    if (geos.length > 1) geos.forEach(g => g.dispose());
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = first.castShadow; m.receiveShadow = first.receiveShadow; Object.assign(m.userData, first.userData);
    out.push(m);
  }
  for (const v of victims) { v.parent.remove(v); v.geometry.dispose(); }
  const prune = o => { for (const c of [...o.children]) { if (keepSet.has(c)) continue; prune(c); if (c.type === 'Group' && !c.children.length && !c.userData.birds) o.remove(c); } };
  prune(root);
  for (const m of out) root.add(m);
  return root;
}
/** Vapauta esineryhmä. */
export function dispose(g) {
  if (!g) return;
  if (g.parent) g.parent.remove(g);
  g.traverse(o => { if (o.geometry) o.geometry.dispose(); });
}
