// Hahmojen lisäosat (roster_specs.js `extras`): arvet, sokeat silmät, kaulapannat, huivit,
// villisian torahampaat/harjakset/kärsä, metallijalat, aura, kaulaharja, korvalovi.
// Kaikki geometriat ja materiaalit jaetaan hahmojen kesken (välimuisti avaimella).
//
// attachExtras(dog, extras, anchors)
//   anchors: { head, neck, torso, tail, legs:[FL,FR,BL,BR], earL, earR }  -> Object3D-osat
//            (koiratehtaan osat; lisäosa liitetään osan lapseksi, jolloin se liikkuu sen mukana)
//   Mitat annetaan osan omassa koordinaatistossa; `size(part)` palauttaa osan bounding boxin.
import * as THREE from 'three';

const geoCache = new Map();
const matCache = new Map();
function geo(key, make) { if (!geoCache.has(key)) geoCache.set(key, make()); return geoCache.get(key); }
let gradientMapRef = null;
export function setGradientMap(g) { gradientMapRef = g; }
function toon(hex, opts = {}) {
  const key = 't' + hex + JSON.stringify(opts);
  if (!matCache.has(key)) {
    const m = new THREE.MeshToonMaterial({ color: new THREE.Color(hex), ...opts });
    if (gradientMapRef) m.gradientMap = gradientMapRef;
    matCache.set(key, m);
  }
  return matCache.get(key);
}
function basic(hex, opts = {}) {
  const key = 'b' + hex + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), ...opts }));
  return matCache.get(key);
}
const OUTLINE = () => basic('#0b0a10', { side: THREE.BackSide });

function withOutline(mesh, k = 1.12) {
  const ol = new THREE.Mesh(mesh.geometry, OUTLINE());
  ol.scale.setScalar(k); ol.renderOrder = -1; mesh.add(ol);
  return mesh;
}

// paikallinen bounding box osalle (ilman lapsia, jotka me lisäsimme)
const boxCache = new WeakMap();
export function partBox(part) {
  if (boxCache.has(part)) return boxCache.get(part);
  const box = new THREE.Box3();
  const meshes = [];
  part.traverse(o => { if (o.isMesh && !o.userData.extra) meshes.push(o); });
  part.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(part.matrixWorld).invert();
  for (const m of meshes) {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const b = m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    box.union(b);
  }
  if (box.isEmpty()) box.set(new THREE.Vector3(-0.05, -0.05, -0.05), new THREE.Vector3(0.05, 0.05, 0.05));
  boxCache.set(part, box);
  return box;
}

function mark(o) { o.userData.extra = true; o.traverse(c => { c.userData.extra = true; c.castShadow = false; }); return o; }

// ---------------- yksittäiset lisäosat ----------------
const BUILDERS = {
  // arpi silmän yli + suljettu silmä (silmä menetetty)
  eyeScar(a, e) {
    const head = a.head; if (!head) return;
    const b = partBox(head), s = b.getSize(new THREE.Vector3());
    const z = e.side === 'R' ? b.max.z : b.min.z;
    const g = new THREE.Group();
    // suljettu silmä: tumma viiva
    const lid = new THREE.Mesh(geo('lid', () => new THREE.BoxGeometry(1, 1, 1)), basic('#141010'));
    lid.scale.set(s.x * 0.16, s.y * 0.035, s.z * 0.05);
    lid.position.set(b.min.x + s.x * 0.72, b.min.y + s.y * 0.64, z * 0.98);
    g.add(lid);
    // arpi: kaksi vinoa vaaleaa viivaa
    for (const k of [-1, 1]) {
      const sc = new THREE.Mesh(geo('lid', () => new THREE.BoxGeometry(1, 1, 1)), basic('#d9a0a0'));
      sc.scale.set(s.x * 0.04, s.y * 0.34, s.z * 0.05);
      sc.position.set(b.min.x + s.x * (0.72 + k * 0.035), b.min.y + s.y * 0.64, z * 1.0);
      sc.rotation.z = 0.45;
      g.add(sc);
    }
    head.add(mark(g));
  },
  // sokeat silmät: vaaleat, hehkuttomat "maitosilmät" + arpi silmien yli
  blind(a) {
    const head = a.head; if (!head) return;
    const b = partBox(head), s = b.getSize(new THREE.Vector3());
    const g = new THREE.Group();
    for (const z of [b.min.z, b.max.z]) {
      const eye = new THREE.Mesh(geo('eyeS', () => new THREE.SphereGeometry(1, 10, 8)), basic('#dfe7ea'));
      eye.scale.set(s.x * 0.07, s.y * 0.07, s.z * 0.04);
      eye.position.set(b.min.x + s.x * 0.72, b.min.y + s.y * 0.64, z * 0.97);
      g.add(eye);
    }
    const band = new THREE.Mesh(geo('lid', () => new THREE.BoxGeometry(1, 1, 1)), basic('#b98a86'));
    band.scale.set(s.x * 0.05, s.y * 0.05, s.z * 1.04);
    band.position.set(b.min.x + s.x * 0.72, b.min.y + s.y * 0.7, (b.min.z + b.max.z) / 2);
    band.rotation.x = 0.0; band.rotation.z = 0.5;
    g.add(band);
    head.add(mark(g));
  },
  // kaulapanta (valinnaisesti piikit) kaulan ympäri
  collar(a, e) {
    const neck = a.neck || a.head; if (!neck) return;
    const b = partBox(neck), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const r = Math.max(s.y, s.z) * 0.5;
    const ring = new THREE.Mesh(geo('collar', () => new THREE.TorusGeometry(1, 0.16, 6, 18)), toon(e.color || '#7d1f1a'));
    ring.scale.setScalar(r * 0.95);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(c.x - s.x * 0.05, c.y - s.y * 0.08, c.z);
    ring.rotation.z = -0.35;
    withOutline(ring, 1.06);
    if (e.spikes) {
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * Math.PI * 2;
        const sp = new THREE.Mesh(geo('spike', () => new THREE.ConeGeometry(0.12, 0.42, 5).translate(0, 0.21, 0)), toon('#cfd3d8'));
        sp.position.set(0, Math.cos(ang) * 1.12, Math.sin(ang) * 1.12);
        sp.rotation.x = ang;
        ring.add(sp);
      }
    }
    // pieni metallilaatta / solki edessä
    const tag = new THREE.Mesh(geo('tag', () => new THREE.CylinderGeometry(0.22, 0.22, 0.08, 8)), toon('#d8b25a'));
    tag.position.set(0, -1.15, 0); tag.rotation.x = Math.PI / 2; ring.add(tag);
    neck.add(mark(ring));
  },
  // ninjahuivi: rengas kaulassa + kaksi liehuvaa päätä
  scarf(a, e) {
    const neck = a.neck || a.head; if (!neck) return;
    const b = partBox(neck), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const r = Math.max(s.y, s.z) * 0.5;
    const mat = toon(e.color || '#2b2f3a', { side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geo('scarfRing', () => new THREE.TorusGeometry(1, 0.3, 6, 16)), mat);
    ring.scale.setScalar(r);
    ring.rotation.y = Math.PI / 2; ring.rotation.z = -0.3;
    ring.position.set(c.x, c.y - s.y * 0.05, c.z);
    withOutline(ring, 1.06);
    const tails = new THREE.Group();
    for (const k of [0, 1]) {
      const t = new THREE.Mesh(geo('scarfTail', () => new THREE.PlaneGeometry(1, 0.32).translate(-0.5, 0, 0)), mat);
      t.scale.setScalar(1.6 + k * 0.3);
      t.position.set(0, 0.95, 0.1 * (k ? 1 : -1));
      t.rotation.set(0, 0, 0.35 + k * 0.25);
      tails.add(t);
    }
    tails.rotation.y = -Math.PI / 2;   // ring-avaruudessa takaisin osan x-suuntaan
    ring.add(tails);
    neck.add(mark(ring));
    a.animated?.push(t => { tails.children.forEach((c, i) => { c.rotation.z = 0.35 + i * 0.25 + Math.sin(t * 6 + i) * 0.18; }); });
  },
  // villisian torahampaat
  tusks(a) {
    const head = a.head; if (!head) return;
    const b = partBox(head), s = b.getSize(new THREE.Vector3());
    const g = new THREE.Group();
    for (const z of [b.min.z * 0.55, b.max.z * 0.55]) {
      const t = new THREE.Mesh(geo('tusk', () => new THREE.ConeGeometry(0.22, 1, 6).translate(0, 0.5, 0)), toon('#f1e8cf'));
      t.scale.set(s.x * 0.12, s.y * 0.38, s.x * 0.12);
      t.position.set(b.max.x - s.x * 0.18, b.min.y + s.y * 0.2, z);
      t.rotation.z = -0.5; t.rotation.x = z > 0 ? 0.35 : -0.35;
      withOutline(t, 1.15);
      g.add(t);
    }
    head.add(mark(g));
  },
  // litteä kärsä
  snout(a, e) {
    const head = a.head; if (!head) return;
    const b = partBox(head), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const disc = new THREE.Mesh(geo('snout', () => new THREE.CylinderGeometry(1, 1, 0.5, 12)), toon(e.color || '#7a5e50'));
    disc.scale.set(s.y * 0.2, s.x * 0.12, s.z * 0.28);
    disc.rotation.z = Math.PI / 2;
    disc.position.set(b.max.x + s.x * 0.02, b.min.y + s.y * 0.36, c.z);
    withOutline(disc, 1.08);
    for (const z of [-1, 1]) {
      const n = new THREE.Mesh(geo('nostril', () => new THREE.SphereGeometry(1, 6, 5)), basic('#1a1210'));
      n.scale.set(0.12, 0.25, 0.22); n.position.set(0, 0.5, z * 0.4); disc.add(n);
    }
    head.add(mark(disc));
  },
  // harjasharja selkärangan päällä (torso + kaula)
  bristles(a, e) {
    for (const [part, n, k] of [[a.torso, 11, 1], [a.neck, 5, 1.25]]) {
      if (!part) continue;
      const b = partBox(part), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      const g = new THREE.Group();
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const h = s.y * (0.18 + 0.22 * Math.sin(f * Math.PI)) * k * (0.85 + ((i * 37) % 10) / 40);
        const cone = new THREE.Mesh(geo('bristle', () => new THREE.ConeGeometry(0.5, 1, 4).translate(0, 0.5, 0)), toon(e.color || '#1e1814'));
        cone.scale.set(s.x * 0.09, h, s.z * 0.16);
        cone.position.set(b.min.x + s.x * (0.08 + f * 0.84), b.max.y - s.y * 0.06, c.z);
        cone.rotation.z = 0.5;
        withOutline(cone, 1.15);
        g.add(cone);
      }
      part.add(mark(g));
    }
  },
  // kaulaharja / tuuhea rintakarva: kartiorengas kaulan ympärillä
  mane(a, e) {
    const neck = a.neck; if (!neck) return;
    const b = partBox(neck), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const r = Math.max(s.y, s.z) * 0.42;
    const size = e.size ?? 0.7;
    const g = new THREE.Group();
    const N = e.shaggy ? 16 : 12;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      const len = r * (1.1 + 0.5 * ((i * 53) % 7) / 7) * size * (e.shaggy ? 1.15 : 1);
      const cone = new THREE.Mesh(geo('maneTuft', () => new THREE.ConeGeometry(0.5, 1, 4).translate(0, 0.5, 0)), toon(e.color || '#ddd'));
      cone.scale.set(r * 0.55, len, r * 0.55);
      cone.position.set(0, Math.cos(ang) * r, Math.sin(ang) * r);
      cone.rotation.x = ang;
      cone.rotateZ(0.9);
      g.add(cone);
    }
    g.position.set(c.x - s.x * 0.1, c.y - s.y * 0.12, c.z);
    neck.add(mark(g));
  },
  // metalliset etujalat: harmaa kiiltävä holkki + nivelrenkaat
  metalLegs(a, e) {
    const legs = a.legs || [];
    for (const leg of legs.slice(0, 2)) {
      if (!leg) continue;
      const b = partBox(leg), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      const g = new THREE.Group();
      const sleeve = new THREE.Mesh(geo('metalSleeve', () => new THREE.CylinderGeometry(0.5, 0.42, 1, 8)),
        new THREE.MeshStandardMaterial({ color: e.color || '#8d97a3', metalness: 0.85, roughness: 0.3 }));
      sleeve.scale.set(s.x * 1.12, s.y * 0.72, s.z * 1.12);
      sleeve.position.set(c.x, b.min.y + s.y * 0.38, c.z);
      withOutline(sleeve, 1.06);
      g.add(sleeve);
      for (const f of [0.1, 0.42, 0.72]) {
        const ring = new THREE.Mesh(geo('metalRing', () => new THREE.TorusGeometry(0.5, 0.09, 5, 12)), toon('#3d434b'));
        ring.scale.set(s.x * 1.2, s.z * 1.2, s.x);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(c.x, b.min.y + s.y * f, c.z);
        g.add(ring);
      }
      leg.add(mark(g));
      if (leg.isMesh) leg.visible = true;
    }
  },
  // aura: läpikuultavat pyörivät liekkikartiot (kuolemanjumala-Hōgen)
  aura(a, e) {
    const torso = a.torso; if (!torso) return;
    const b = partBox(torso), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const mat = basic(e.color || '#5a1020', { transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const g = new THREE.Group();
    const N = 14;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      const fl = new THREE.Mesh(geo('flame', () => new THREE.ConeGeometry(0.5, 1, 5, 1, true).translate(0, 0.5, 0)), mat);
      fl.scale.set(s.x * 0.22, s.y * (1.3 + (i % 3) * 0.35), s.x * 0.22);
      fl.position.set(c.x + Math.cos(ang) * s.x * 0.55, b.min.y - s.y * 0.2, c.z + Math.sin(ang) * s.z * 0.7);
      g.add(fl);
    }
    torso.add(mark(g));
    a.animated?.push(t => g.children.forEach((f, i) => {
      f.scale.y = s.y * (1.3 + (i % 3) * 0.35) * (0.8 + 0.35 * Math.sin(t * 7 + i * 1.7));
    }));
  },
  // arvet: vaaleat viirut kylkiin/olkaan (deterministinen sijoittelu)
  scars(a, e) {
    const n = e.count || 2;
    const parts = [a.torso, a.head, a.neck].filter(Boolean);
    for (let i = 0; i < n; i++) {
      const part = parts[i % parts.length];
      const b = partBox(part), s = b.getSize(new THREE.Vector3());
      const side = i % 2 ? b.max.z : b.min.z;
      const sc = new THREE.Mesh(geo('scar', () => new THREE.BoxGeometry(1, 1, 1)), basic('#cf9a92'));
      const f = ((i * 0.37) % 1);
      sc.scale.set(s.x * 0.035, s.y * 0.36, Math.max(0.004, s.z * 0.03));
      sc.position.set(b.min.x + s.x * (0.3 + f * 0.4), b.min.y + s.y * (0.5 + (i % 3) * 0.1), side * 1.005);
      sc.rotation.z = 0.5 + (i % 3) * 0.3;
      part.add(mark(sc));
    }
  },
  // korvalovi: pieni tumma kolmio korvan kärjessä
  earNotch(a, e) {
    const ear = e.side === 'R' ? a.earR : a.earL; if (!ear) return;
    const b = partBox(ear), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const n = new THREE.Mesh(geo('notch', () => new THREE.ConeGeometry(0.5, 1, 3)), basic('#1b1614'));
    n.scale.set(s.x * 0.5, s.y * 0.35, s.z * 1.3);
    n.position.set(c.x, b.max.y - s.y * 0.15, c.z);
    n.rotation.z = Math.PI;
    ear.add(mark(n));
  },
};

/** Lisää lisäosat koiraan. Palauttaa päivitysfunktion (aika t sekunteina) tai null. */
export function attachExtras(anchors, extras) {
  if (!extras || !extras.length) return null;
  const animated = [];
  const a = { ...anchors, animated };
  for (const e of extras) {
    const f = BUILDERS[e.type];
    if (f) f(a, e); else console.warn('tuntematon lisäosa', e.type);
  }
  return animated.length ? t => { for (const f of animated) f(t); } : null;
}
