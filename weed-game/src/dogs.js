// Koirat: hahmot rakennetaan characters.js:n datasta.
//  - 'rigid'   = käyttäjän Tripo-malli (yksi jäykkä mesh). Liike tehdään "pehmeällä rigillä" vertex-shaderissa:
//                jalat (4 aluetta: etu/taka x vasen/oikea), pää ja häntä kiertyvät omien nivelpisteidensä
//                ympäri pehmeillä painoilla, joten etu- ja takajalat saavat vastakkaisen liikkeen ilman luurankoa.
//  - 'factory' = koiratehdas: dog_parts.glb:n 13 osaa jaetaan nivelhierarkiaksi (lonkat, olat, kaula, pää,
//                korvat, häntä), osien mittasuhteita muutetaan ja kuviot maalataan verteksiväreinä.
// Molemmat käyttävät samaa proseduraalista animaattoria (sama poseformaatti), joten pelikoodi kutsuu
// vain play('Walk') / play('Attack') jne. niin kuin ennenkin.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { E } from './engine.js';
import { CHARACTERS, MODELS } from './characters.js';
import { attachExtras } from './accessories.js';
import { buildFace } from './face.js';

export const CHARS = CHARACTERS;
const RIG_DEBUG = E.params.has('rigdebug');

// ------------------------------------------------------------------ lataus
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const modelCache = {};   // avain -> Promise
const modelData = {};    // avain -> valmis data

/** Lataa mallin vain kerran (laiska). */
export function loadModel(key) {
  if (modelCache[key]) return modelCache[key];
  const def = MODELS[key];
  const url = new URL('models/' + def.file, window.ASSET_BASE || document.baseURI).href;
  modelCache[key] = loader.loadAsync(url).then(g => (modelData[key] = key === 'dog_parts' ? prepFactory(g) : prepRigid(g, def)));
  return modelCache[key];
}

/** Lataa kaikki mallit, joita annetut hahmot tarvitsevat. */
export function loadFor(ids) {
  const keys = new Set(ids.map(id => CHARACTERS[id].kind === 'factory' ? 'dog_parts' : CHARACTERS[id].model));
  return Promise.all([...keys].map(loadModel));
}
export function isLoaded(id) {
  const c = CHARACTERS[id]; const k = c.kind === 'factory' ? 'dog_parts' : c.model;
  return !!modelData[k];
}

function prepRigid(g, def) {
  let mesh = null;
  g.scene.updateMatrixWorld(true);
  g.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; });
  const geo = mesh.geometry.clone();
  geo.applyMatrix4(mesh.matrixWorld);
  geo.rotateY(def.rotY);
  geo.computeBoundingBox();
  const b = geo.boundingBox;
  const h = b.max.y - b.min.y;
  geo.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -(b.max.z + b.min.z) / 2);
  geo.scale(1 / h, 1 / h, 1 / h);
  geo.computeBoundingBox();
  if (!geo.attributes.normal) geo.computeVertexNormals();
  // jalkojen tunnistus: lähellä maata olevat verteksit -> etu- ja takajalkojen keskikohdat
  const pos = geo.attributes.position;
  let fx = 0, fn = 0, rx = 0, rn = 0, fz = 0;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i); if (y > 0.07) continue;
    const x = pos.getX(i);
    if (x > 0) { fx += x; fn++; fz += Math.abs(pos.getZ(i)); } else { rx += x; rn++; }
  }
  const bb = geo.boundingBox;
  const info = {
    geo, map: mesh.material.map,
    minX: bb.min.x, maxX: bb.max.x, halfW: Math.max(bb.max.z, -bb.min.z),
    frontX: fn ? fx / fn : bb.max.x * 0.5, rearX: rn ? rx / rn : bb.min.x * 0.5,
    legZ: fn ? fz / fn : 0.08,
  };
  return info;
}

// dog_parts.glb osien roolit (tarkistettu renderöimällä väriavaimilla)
const P = { TAIL: 0, BODY: 1, BL: 2, BR: 3, FR: 4, HEAD: 5, FL: 6, CHEST: 7, NECK: 8, EARL: 9, EARR: 10, EYE: 11, NOSE: 12 };
function prepFactory(g) {
  g.scene.updateMatrixWorld(true);
  const parts = [];
  g.scene.traverse(o => {
    if (!o.isMesh) return;
    const i = Number((o.name.match(/(\d+)$/) || [0, 0])[1]);
    const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
    parts[i] = geo;
  });
  const all = new THREE.Box3();
  for (const p of parts) { p.computeBoundingBox(); all.union(p.boundingBox); }
  const h = all.max.y - all.min.y;
  for (const p of parts) { p.translate(0, -all.min.y, 0); p.scale(1 / h, 1 / h, 1 / h); p.computeBoundingBox(); if (!p.attributes.normal) p.computeVertexNormals(); }
  const centroid = (geo, test) => {
    const a = geo.attributes.position; const c = new THREE.Vector3(); let n = 0;
    for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i); if (test(x, y, z)) { c.x += x; c.y += y; c.z += z; n++; } }
    return n ? c.multiplyScalar(1 / n) : geo.boundingBox.getCenter(new THREE.Vector3());
  };
  const piv = {};
  for (const k of ['BL', 'BR', 'FR', 'FL']) {
    const g2 = parts[P[k]], top = g2.boundingBox.max.y;
    const c = centroid(g2, (x, y) => y > top - 0.12); c.y = top - 0.09; piv[k] = c;
  }
  { const g2 = parts[P.HEAD]; const mx = g2.boundingBox.min.x; piv.HEAD = centroid(g2, x => x < mx + 0.07); }
  { const g2 = parts[P.NECK]; const my = g2.boundingBox.min.y; piv.NECK = centroid(g2, (x, y) => y < my + 0.08); }
  for (const k of ['EARL', 'EARR']) { const g2 = parts[P[k]]; const my = g2.boundingBox.min.y; piv[k] = centroid(g2, (x, y) => y < my + 0.035); }
  { // hännän tyvi = hännän verteksit, jotka ovat vartalon laatikon sisällä (kippura kaartuu selän yli)
    const g2 = parts[P.TAIL], bb = parts[P.BODY].boundingBox;
    piv.TAIL = centroid(g2, (x, y) => x > bb.min.x + 0.015 && y < bb.max.y);
  }
  piv.BODY = parts[P.BODY].boundingBox.getCenter(new THREE.Vector3());
  return { parts, piv };
}

// ------------------------------------------------------------------ materiaalit
const gradientMap = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 225, 225, 225, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

function glowTexture() {
  if (glowTexture.t) return glowTexture.t;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  glowTexture.t = new THREE.CanvasTexture(c);
  return glowTexture.t;
}

// Pehmeä rigi (GLSL). Kaikki mallin omassa avaruudessa (h = 1, katse +X, oikea kylki +Z).
const RIG_GLSL = /* glsl */`
uniform vec4 uLeg;      // FL FR BL BR heilahdus (rad, + = eteen)
uniform vec4 uLift;     // tassujen nosto
uniform vec4 uHT;       // pään nyökkäys, pään kääntö, hännän heilutus, hännän nosto
uniform vec4 uRigA;     // belly, splitX, neckX, tailX
uniform vec4 uRigB;     // frontX, rearX, hipY, shoulderY
uniform vec4 uRigC;     // headPivX, headPivY, tailPivX, tailPivY
varying vec3 vRigDbg;
varying vec3 vObjPos;
vec2 rot2(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
void rig(inout vec3 p, inout vec3 n) {
  vec3 o = p;
  float belly = uRigA.x;
  float legW = smoothstep(belly + 0.07, belly - 0.05, o.y);
  float fW = smoothstep(uRigA.y - 0.06, uRigA.y + 0.06, o.x);
  float rW = smoothstep(-0.02, 0.02, o.z);
  float ang = mix(mix(uLeg.z, uLeg.w, rW), mix(uLeg.x, uLeg.y, rW), fW) * legW;
  float lift = mix(mix(uLift.z, uLift.w, rW), mix(uLift.x, uLift.y, rW), fW) * legW * (1.0 - o.y / max(belly, 0.01));
  vec2 piv = vec2(mix(uRigB.y, uRigB.x, fW), mix(uRigB.z, uRigB.w, fW));
  vec3 d = vec3(0.0);
  vec2 q = rot2(o.xy - piv, ang) + piv;
  d.xy += q - o.xy; d.y += lift;
  vec3 nn = n; nn.xy = rot2(nn.xy, ang);
  // pää
  float hW = smoothstep(uRigA.z - 0.07, uRigA.z + 0.07, o.x) * smoothstep(belly - 0.02, belly + 0.14, o.y);
  vec3 hp = o - vec3(uRigC.x, uRigC.y, 0.0);
  hp.xy = rot2(hp.xy, -uHT.x * hW);
  hp.xz = rot2(hp.xz, -uHT.y * hW);
  d += (hp + vec3(uRigC.x, uRigC.y, 0.0)) - o;
  nn.xy = rot2(nn.xy, -uHT.x * hW);
  // häntä
  float tW = smoothstep(uRigA.w + 0.06, uRigA.w - 0.06, o.x) * smoothstep(belly - 0.12, belly + 0.04, o.y);
  vec3 tp = o - vec3(uRigC.z, uRigC.w, 0.0);
  tp.xz = rot2(tp.xz, uHT.z * tW);
  tp.xy = rot2(tp.xy, uHT.w * tW);
  d += (tp + vec3(uRigC.z, uRigC.w, 0.0)) - o;
  p = o + d; n = normalize(nn);
  vRigDbg = vec3(legW * (0.4 + 0.6 * fW), hW, tW);
  vObjPos = o;
}
`;

function rigUniforms(info, rig) {
  const L = info.maxX - info.minX;
  const neckX = info.maxX - rig.neck * L;
  const tailX = info.minX + rig.tail * L;
  return {
    uLeg: { value: new THREE.Vector4() }, uLift: { value: new THREE.Vector4() }, uHT: { value: new THREE.Vector4() },
    uRigA: { value: new THREE.Vector4(rig.belly, (info.frontX + info.rearX) / 2, neckX, tailX) },
    uRigB: { value: new THREE.Vector4(info.frontX, info.rearX, rig.belly + 0.08, rig.belly + 0.12) },
    uRigC: { value: new THREE.Vector4(neckX, rig.belly + 0.25, tailX, rig.belly + 0.28) },
    uWeak: { value: new THREE.Vector4(0, 0, 0, 0.0001) }, uWeakAmt: { value: 0 },
  };
}

function injectRig(shader, uniforms, { outline = 0, weak = false } = {}) {
  Object.assign(shader.uniforms, uniforms);
  if (outline) {
    shader.vertexShader = RIG_GLSL + shader.vertexShader.replace('#include <begin_vertex>',
      `vec3 rigPos = vec3(position); vec3 rigN = vec3(normal); rig(rigPos, rigN); vec3 transformed = rigPos + rigN * ${outline.toFixed(4)};`);
  } else {
    shader.vertexShader = RIG_GLSL + shader.vertexShader
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(normal); vec3 rigPos = vec3(position); rig(rigPos, objectNormal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = rigPos;');
  }
  shader.fragmentShader = 'varying vec3 vRigDbg;\nvarying vec3 vObjPos;\nuniform vec4 uWeak;\nuniform float uWeakAmt;\n' + shader.fragmentShader;
  if (RIG_DEBUG && !outline) shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.rgb = mix(gl_FragColor.rgb, vRigDbg, 0.75);');
  if (weak) {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float wk = 1.0 - smoothstep(uWeak.w * 0.4, uWeak.w, distance(vObjPos, uWeak.xyz));
       totalEmissiveRadiance += vec3(1.0, 0.32, 0.12) * wk * uWeakAmt;`);
  }
}

function outlineBasic(width, rigU) {
  const m = new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    if (rigU) injectRig(sh, rigU, { outline: width });
    else sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed += normalize(normal) * ${width.toFixed(4)};`);
  };
  return m;
}

// ------------------------------------------------------------------ koiratehtaan maalaus
const _c = new THREE.Color();
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function spotNoise(x, y, z, cell) {
  const ix = Math.floor(x / cell), iy = Math.floor(y / cell), iz = Math.floor(z / cell);
  let best = 9;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
    const cx = (ix + a + hash3(ix + a, iy + b, iz + c)) * cell, cy = (iy + b + hash3(iy + b, iz + c, ix + a)) * cell, cz = (iz + c + hash3(iz + c, ix + a, iy + b)) * cell;
    const d = Math.hypot(x - cx, y - cy, z - cz) / cell; if (d < best) best = d;
  }
  return best;
}
const BODYISH = [P.BODY, P.CHEST, P.NECK];
const LEGS = [P.FL, P.FR, P.BL, P.BR];
// Jokainen kuvio palauttaa [paino 0..1, väri] verteksille (osa, x, y, z) – koordinaatit h = 1
const PAINT = {
  belly: (c, part, x, y, z) => BODYISH.includes(part) ? [ss(0.47, 0.40, y) * (part === P.NECK ? 0.6 : 1), c.under] : null,
  saddle: (c, part, x, y, z, col) => {
    if (part === P.BODY) return [ss(0.6, 0.67, y) * ss(0.30, 0.2, x), col];
    if (part === P.NECK) return [ss(0.80, 0.86, y) * 0.8, col];
    if (part === P.TAIL) return [0.7, col];
    return null;
  },
  mask: (c, part, x, y, z, col) => part === P.HEAD ? [Math.max(ss(0.46, 0.52, x), ss(0.05, 0.02, Math.hypot(x - 0.45, y - 0.86, Math.abs(z) - 0.07)) * 0.8), col] : null,
  muzzleLight: (c, part, x, y, z) => part === P.HEAD ? [Math.max(ss(0.47, 0.52, x), ss(0.78, 0.74, y) * ss(0.36, 0.42, x)), c.under] : null,
  muzzleGrey: (c, part, x, y, z) => part === P.HEAD ? [ss(0.47, 0.54, x) * 0.8, '#b9b4ac'] : null,
  socks: (c, part, x, y) => LEGS.includes(part) ? [ss(0.15, 0.1, y), '#f4f1ea'] : null,
  brindle: (c, part, x, y, z, col) => {
    if (![...BODYISH, P.HEAD, P.TAIL, ...LEGS].includes(part)) return null;
    const s = Math.sin(x * 46 + Math.sin(y * 11 + z * 3) * 1.8 + z * 5);
    return [ss(0.45, 0.8, s) * ss(0.36, 0.48, y) * 0.85, col];
  },
  tanPoints: (c, part, x, y, z, col) => {
    if (LEGS.includes(part)) return [ss(0.42, 0.34, y), col];
    if (part === P.CHEST) return [ss(0.62, 0.52, y) * ss(0.24, 0.32, x), col];
    if (part === P.HEAD) return [ss(0.48, 0.53, x), col];
    if (part === P.BODY) return [ss(0.42, 0.36, y) * 0.7, col];
    return null;
  },
  brows: (c, part, x, y, z, col) => part === P.HEAD ? [ss(0.03, 0.018, Math.hypot(x - 0.465, y - 0.875, Math.abs(z) - 0.075)), col] : null,
  chestBlaze: (c, part, x, y, z, col) => part === P.CHEST ? [ss(0.07, 0.035, Math.abs(z)) * ss(0.28, 0.36, x), col] : null,
  spots: (c, part, x, y, z, col) => {
    if (part === P.EARL || part === P.EARR) return [1, col];
    if (![...BODYISH, P.HEAD, P.TAIL, ...LEGS].includes(part)) return null;
    const d = spotNoise(x + 3, y, z, 0.07);
    return [ss(0.42, 0.3, d) * (part === P.HEAD ? 0.5 : 1) * ss(0.12, 0.2, y), col];
  },
  scar: (c, part, x, y, z) => {
    if (part !== P.HEAD || z < 0) return null;
    const t = Math.min(1, Math.max(0, (x - 0.40) / 0.1)); const py = 0.93 - t * 0.12;
    return [ss(0.012, 0.004, Math.abs(y - py)) * (x > 0.39 && x < 0.51 ? 1 : 0), '#e2a7a0'];
  },
};

function paintGeometry(geo, part, c, marks) {
  const pos = geo.attributes.position; const n = pos.count; const nrm = geo.attributes.normal;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const col = new Float32Array(n * 3);
  const base = {
    [P.TAIL]: c.tail || c.coat, [P.BODY]: c.coat, [P.CHEST]: c.chest || c.coat, [P.NECK]: c.coat,
    [P.HEAD]: c.head || c.coat, [P.EARL]: c.ear || c.coat, [P.EARR]: c.ear || c.coat,
    [P.EYE]: c.eye || '#120f0e', [P.NOSE]: c.nose || '#121010',
  }[part] || c.legs || c.coat;
  const rules = (marks || []).map(m => { const [k, v] = m.split(':'); return [PAINT[k], v]; }).filter(r => r[0]);
  const bc = new THREE.Color(base);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    _c.copy(bc);
    if (part !== P.EYE && part !== P.NOSE) for (const [fn, v] of rules) {
      const r = fn(c, part, x, y, z, v); if (!r || r[0] <= 0) continue;
      _c.lerp(new THREE.Color(r[1]), Math.min(1, r[0]));
    }
    if ((part === P.EARL || part === P.EARR) && nrm) {
      const nx = nrm.getX(i), nz = nrm.getZ(i) * (part === P.EARL ? -1 : 1);
      const inner = ss(0.05, 0.45, nx) * ss(0.2, -0.3, nz) * ss(0.02, 0.06, y - geo.boundingBox.min.y);
      if (inner > 0) _c.lerp(new THREE.Color(c.earInner || '#d79a92'), inner * 0.75);
    }
    // kevyt varjostus alapuolelle (luettavampi siluetti)
    const sh = 0.86 + 0.14 * ss(0.1, 0.6, y);
    col[i * 3] = _c.r * sh; col[i * 3 + 1] = _c.g * sh; col[i * 3 + 2] = _c.b * sh;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

// ------------------------------------------------------------------ animaatiot (proseduraaliset)
const TAU = Math.PI * 2;
const DUR = { Attack: 0.55, Gallop_Jump: 0.8, Jump_ToIdle: 0.55, Death: 1.3, Idle_HitReact1: 0.42, Idle_HitReact2: 0.6, Bark: 0.5, Howl: 2.6, Battoga: 0.6 };
const blankPose = () => ({ x: 0, y: 0, pitch: 0, roll: 0, sx: 1, sy: 1, l0: 0, l1: 0, l2: 0, l3: 0, f0: 0, f1: 0, f2: 0, f3: 0, hp: 0, hy: 0, ty: 0, tp: 0, ear: 0, lie: 0 });
const KEYS = Object.keys(blankPose());

function gaitLegs(o, ph, amp, gait, liftAmt) {
  // ravi: FL & BR samassa vaiheessa, FR & BL vastakkain
  const s0 = Math.sin(ph), s1 = Math.sin(ph + Math.PI);
  o.l0 = s0 * amp; o.l3 = s0 * amp; o.l1 = s1 * amp; o.l2 = s1 * amp;
  o.f0 = Math.max(0, Math.cos(ph)) * liftAmt; o.f3 = o.f0; o.f1 = Math.max(0, -Math.cos(ph)) * liftAmt; o.f2 = o.f1;
  if (gait === 'limp3') { // kolmijalkainen: yksi etujalka kantaa, vartalo hypähtää etuosan kohdalla
    o.l0 = o.l1 = Math.sin(ph * 2) * amp * 0.7; o.f0 = o.f1 = Math.max(0, Math.cos(ph * 2)) * liftAmt;
  }
}

const ANIMS = {
  Idle: (t, d) => { const o = {}; o.sy = 1 + Math.sin(t * 2.4) * 0.012; o.sx = 1 - Math.sin(t * 2.4) * 0.006; o.hp = Math.sin(t * 0.9) * 0.05; o.hy = Math.sin(t * 0.5) * 0.08; o.pitch = Math.sin(t * 2.4) * 0.006; if (d.def.gait === 'limp3') o.roll = 0.04; return o; },
  Idle_2: (t) => { const o = ANIMS.Idle(t, { def: {} }); o.hy = Math.sin(t * 0.8) * 0.35; o.hp = -0.08 + Math.sin(t * 1.3) * 0.06; o.ear = Math.max(0, Math.sin(t * 0.8)) * 0.3; return o; },
  Idle_2_HeadLow: (t) => ({ hp: 0.55 + Math.sin(t * 1.2) * 0.05, pitch: -0.05, y: -0.015, sy: 0.97 + Math.sin(t * 1.8) * 0.01, ty: 0, tp: -0.3, ear: -0.4 }),
  Eating: (t) => ({ hp: 0.6 + Math.abs(Math.sin(t * 5)) * 0.15, pitch: -0.12, y: -0.03, l0: 0.25, l1: 0.25, l2: -0.15, l3: -0.15, sy: 0.95, ear: -0.3, tp: -0.2 }),
  Walk: (t, d) => {
    const g = d.def.gait, f = g === 'heavy' ? 1.15 : g === 'light' ? 1.8 : 1.5, ph = t * TAU * f;
    const o = {}; gaitLegs(o, ph, (d.rig.legSwing || 0.5) * 0.7, g, 0.04);
    o.y = Math.abs(Math.sin(ph)) * 0.012; o.pitch = Math.sin(ph * 2) * 0.015; o.roll = Math.sin(ph) * (g === 'heavy' ? 0.05 : 0.025);
    o.hp = Math.sin(ph * 2) * 0.05; o.sy = 1 + Math.sin(ph * 2) * 0.012; o.sx = 1 - Math.sin(ph * 2) * 0.008;
    if (g === 'limp3') { o.y = Math.abs(Math.sin(ph * 2)) * 0.03; o.pitch = Math.sin(ph * 2) * 0.06; o.roll = 0.08 + Math.sin(ph) * 0.05; o.hp = Math.sin(ph * 2) * 0.12; }
    return o;
  },
  Gallop: (t, d) => { // laukka: taka- ja etujalat pareittain, selkä venyy ja kokoontuu
    const g = d.def.gait, f = g === 'heavy' ? 1.8 : g === 'light' ? 2.8 : 2.4, ph = t * TAU * f;
    const A = (d.rig.legSwing || 0.5) * 1.25;
    const o = {};
    o.l0 = Math.sin(ph) * A; o.l1 = Math.sin(ph - 0.45) * A; o.l2 = Math.sin(ph + Math.PI) * A; o.l3 = Math.sin(ph + Math.PI - 0.45) * A;
    o.f0 = Math.max(0, Math.cos(ph)) * 0.08; o.f1 = Math.max(0, Math.cos(ph - 0.45)) * 0.08; o.f2 = Math.max(0, Math.cos(ph + Math.PI)) * 0.08; o.f3 = o.f2;
    o.pitch = Math.sin(ph + 0.6) * 0.11; o.y = (0.5 + 0.5 * Math.sin(ph * 2 - 1)) * 0.05;
    o.sx = 1 + Math.sin(ph) * 0.07; o.sy = 1 - Math.sin(ph) * 0.05;
    o.hp = -Math.sin(ph + 0.6) * 0.12; o.tp = 0.35 + Math.sin(ph) * 0.2; o.ear = -0.5;
    if (g === 'limp3') { o.l1 = o.l0; o.roll = 0.1 + Math.sin(ph) * 0.06; o.pitch *= 1.4; }
    return o;
  },
  Attack: (t) => { // purenta: kyyristyy, syöksyy, pää iskee alas ja nykäisee ylös
    const k = t / DUR.Attack, o = {};
    const crouch = ss(0, 0.25, k) * (1 - ss(0.25, 0.4, k));
    const lunge = ss(0.25, 0.42, k) * (1 - ss(0.65, 1, k));
    o.x = lunge * 0.22 - crouch * 0.04; o.y = -crouch * 0.05 + lunge * 0.02;
    o.pitch = -crouch * 0.08 + lunge * 0.1 - ss(0.42, 0.55, k) * (1 - ss(0.7, 1, k)) * 0.18;
    o.hp = -crouch * 0.25 + ss(0.38, 0.5, k) * (1 - ss(0.55, 0.9, k)) * 0.75 - ss(0.55, 0.7, k) * (1 - ss(0.75, 1, k)) * 0.35;
    o.sx = 1 + lunge * 0.1 - crouch * 0.05; o.sy = 1 - lunge * 0.06 + crouch * -0.04;
    o.l0 = o.l1 = lunge * 0.6; o.l2 = o.l3 = -lunge * 0.5; o.ear = -0.6 * lunge;
    return o;
  },
  Bark: (t) => { const k = t / DUR.Bark; const b = Math.sin(Math.min(1, k * 2) * Math.PI); return { hp: -0.3 * b, pitch: 0.05 * b, sy: 1 + 0.03 * b, y: 0.01 * b, ear: 0.5 }; },
  Howl: (t) => { const k = Math.min(1, t / 0.6); return { hp: -0.9 * k, pitch: 0.12 * k, sy: 1 + 0.02 * Math.sin(t * 3), tp: -0.2, ear: -0.3 * k }; },
  Gallop_Jump: (t, d) => { // hyppy: kyyristys -> ojennus -> kerä -> lasku
    const k = t / DUR.Gallop_Jump, o = {};
    const crouch = ss(0, 0.15, k) * (1 - ss(0.15, 0.3, k));
    const stretch = ss(0.15, 0.35, k) * (1 - ss(0.45, 0.65, k));
    const tuck = ss(0.45, 0.6, k) * (1 - ss(0.75, 0.9, k));
    const land = ss(0.85, 0.92, k) * (1 - ss(0.92, 1, k));
    o.sy = 1 - crouch * 0.14 + stretch * 0.05 - land * 0.12; o.sx = 1 + crouch * 0.06 + stretch * 0.12 + land * 0.06;
    o.pitch = stretch * 0.32 - tuck * 0.25; o.y = -crouch * 0.05 - land * 0.04;
    o.l0 = o.l1 = stretch * 1.0 - tuck * 0.6; o.l2 = o.l3 = -stretch * 0.9 + tuck * 0.7;
    o.hp = -stretch * 0.2 + tuck * 0.2; o.tp = stretch * 0.4; o.ear = -0.7 * (stretch + tuck);
    return o;
  },
  Jump_ToIdle: (t) => { const k = t / DUR.Jump_ToIdle; const s = Math.sin(Math.min(1, k * 1.6) * Math.PI) * (1 - k); return { sy: 1 - s * 0.16, sx: 1 + s * 0.09, y: -s * 0.04, hp: s * 0.3, l0: -s * 0.3, l1: -s * 0.3, l2: s * 0.3, l3: s * 0.3 }; },
  Battoga: (t) => ({ sx: 0.86, sy: 0.88, l0: -0.9, l1: -0.9, l2: 0.9, l3: 0.9, hp: 0.35, tp: 0.6, ear: -0.9 }),
  Idle_HitReact1: (t) => { const k = t / DUR.Idle_HitReact1; const s = Math.sin(Math.min(1, k * 1.5) * Math.PI) * (1 - k * 0.6); return { x: -s * 0.12, pitch: s * 0.16, roll: s * 0.06, sy: 1 - s * 0.08, sx: 1 + s * 0.05, hp: -s * 0.4, ear: -s }; },
  Idle_HitReact2: (t) => { const k = t / DUR.Idle_HitReact2; const s = Math.sin(Math.min(1, k * 1.3) * Math.PI) * (1 - k * 0.5); return { x: -s * 0.2, pitch: s * 0.24, roll: -s * 0.1, sy: 1 - s * 0.12, sx: 1 + s * 0.08, hp: -s * 0.55, l0: s * 0.5, l1: s * 0.4, ear: -s, y: s * 0.03 }; },
  Death: (t) => { // horjuu, polvet pettävät, kaatuu kyljelleen
    const k = Math.min(1, t / DUR.Death), o = {};
    const stag = ss(0, 0.3, k), fall = ss(0.3, 0.85, k), settle = ss(0.85, 1, k);
    o.x = -stag * 0.05; o.pitch = stag * 0.08 - fall * 0.08; o.sy = 1 - stag * 0.08 * (1 - fall);
    o.lie = fall * 1.42 + Math.sin(settle * Math.PI) * 0.06;
    o.hp = -stag * 0.3 + fall * 0.25; o.l0 = o.l1 = fall * 0.35; o.l2 = o.l3 = -fall * 0.3; o.tp = -0.4 * fall; o.ear = -0.8 * fall;
    return o;
  },
  LieDown: (t) => ({ y: -0.2, sy: 0.75, sx: 1.06, l0: 1.2, l1: 1.2, l2: -1.1, l3: -1.1, hp: 0.15 + Math.sin(t * 0.8) * 0.03, ear: -0.5, tp: -0.4, f0: 0.18, f1: 0.18 }),
};

// ------------------------------------------------------------------ Dog
export class Dog {
  constructor(id) {
    const c = CHARACTERS[id];
    this.id = id; this.def = c; this.name = c.name;
    this.height = c.height;
    this.root = new THREE.Group();          // sijainti maailmassa
    this.turn = new THREE.Group();          // suunta (vasen/oikea)
    this.spin = new THREE.Group();          // Battōga-pyörähdys keskipisteen ympäri
    this.pose = new THREE.Group();          // proseduraalinen asento (kallistus, squash & stretch)
    this.model = new THREE.Group();         // mallin omat koordinaatit (h = 1), skaalattu korkeuteen
    this.root.add(this.turn); this.turn.add(this.spin); this.spin.add(this.pose); this.pose.add(this.model);
    this.spin.position.y = 0.5 * this.height;
    this.model.position.y = -0.5 * this.height;
    this.model.scale.setScalar(this.height);
    this.mats = [];
    this.rig = c.rig || { legSwing: 0.55 };
    if (c.kind === 'factory') this._buildFactory(); else this._buildRigid();

    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; sh.scale.set(this.length * 1.05, this.width * 1.5, 1);
    this.root.add(sh); this.shadow = sh;

    this.facing = 1; this.facingTarget = 1;
    this.t = Math.random() * 10;
    this.wag = c.wag ?? 0.4;
    this.earPerk = 0;
    this.earTw = 0; this.nextTwitch = 1 + Math.random() * 4;
    this.cur = null; this.prev = null;
    this.P = blankPose();
    this.play('Idle');
    if (c.extras) this._extras = attachExtras(this, c.extras);
  }

  // --- jäykkä malli + pehmeä rigi
  _buildRigid() {
    const c = this.def;
    const info = modelData[c.model];
    const U = rigUniforms(info, c.rig);
    this.U = U;
    const mat = new THREE.MeshToonMaterial({ map: info.map, gradientMap });
    if (c.tint) mat.color.set(c.tint);
    mat.onBeforeCompile = sh => injectRig(sh, U, { weak: !!c.weakSpot });
    mat.customProgramCacheKey = () => 'rig' + (c.weakSpot ? 'w' : '');
    const mesh = new THREE.Mesh(info.geo, mat); mesh.frustumCulled = false;
    const ol = new THREE.Mesh(info.geo, outlineBasic(c.outline || 0.01, U)); ol.frustumCulled = false;
    ol.material.customProgramCacheKey = () => 'rigol' + (c.outline || 0.01);
    this.model.add(mesh, ol);
    this.mat = mat; this.outline = ol; this.mats.push(mat, ol.material);
    this.length = (info.maxX - info.minX) * this.height; this.width = info.halfW * 2 * this.height;
    this.halfW = info.halfW;
    this.headPivot = new THREE.Group(); this.headPivot.position.set(U.uRigC.value.x, U.uRigC.value.y, 0); this.model.add(this.headPivot);
    if (c.weakSpot) this._makeWeak(c.weakSpot);
    if (c.eyes) this._makeEyes(c.eyes);
  }

  // --- koiratehdas
  _buildFactory() {
    const c = this.def, p = c.p || {};
    const F = modelData.dog_parts;
    const { piv } = F;
    const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap });
    const olMat = outlineBasic(0.011, null);
    olMat.customProgramCacheKey = () => 'fol';
    this.mat = mat; this.mats.push(mat, olMat);
    const leg = p.leg || 1, legW = p.legW || 1, bodyL = p.body || 1, neckL = p.neck || 1, headS = p.head || 1, earS = p.ear || 1;
    const dx = (bodyL - 1) * 0.28;
    const avgHip = (piv.FL.y + piv.FR.y + piv.BL.y + piv.BR.y) / 4;
    const lift = (leg - 1) * avgHip;
    const rigRoot = new THREE.Group(); rigRoot.position.y = lift; this.model.add(rigRoot);
    const mk = (idx, pivot) => {
      const geo = F.parts[idx].clone();
      if (pivot) geo.translate(-pivot.x, -pivot.y, -pivot.z);
      if (idx === P.HEAD && p.muzzle && p.muzzle !== 1) { // kuonon pidennys geometriassa
        const a = geo.attributes.position, x0 = 0.44 - pivot.x;
        for (let i = 0; i < a.count; i++) { const x = a.getX(i); if (x > x0) a.setX(i, x0 + (x - x0) * p.muzzle); }
      }
      const g0 = F.parts[idx];
      // maalaus alkuperäisissä koordinaateissa
      const tmp = g0.clone(); paintGeometry(tmp, idx, c.c, c.marks); geo.setAttribute('color', tmp.attributes.color);
      if (E.params.has('partdbg')) { const cc = new THREE.Color().setHSL(idx / 13, 1, 0.5); const a = geo.attributes.color; for (let i = 0; i < a.count; i++) a.setXYZ(i, cc.r, cc.g, cc.b); }
      const m = new THREE.Mesh(geo, mat); const o = new THREE.Mesh(geo, olMat);
      m.frustumCulled = o.frustumCulled = false;
      const holder = new THREE.Group(); holder.add(m, o); return holder;
    };
    const joint = (parent, at, offsetFrom) => { const j = new THREE.Group(); j.position.copy(at).sub(offsetFrom || new THREE.Vector3()); parent.add(j); return j; };
    const O = new THREE.Vector3();
    const bodyJ = joint(rigRoot, piv.BODY);
    const body = mk(P.BODY, piv.BODY); body.scale.x = bodyL; bodyJ.add(body);
    const chest = mk(P.CHEST, piv.BODY); chest.position.x = dx; bodyJ.add(chest);
    const J = this.J = {};
    // jalat
    for (const [k, front] of [['FL', 1], ['FR', 1], ['BL', 0], ['BR', 0]]) {
      const j = joint(bodyJ, piv[k], piv.BODY); j.position.x += front ? dx : -dx;
      const m = mk(P[k], piv[k]); m.scale.set(legW, leg, legW); j.add(m); J[k] = j;
    }
    // kaula + pää
    const neckJ = joint(bodyJ, piv.NECK, piv.BODY); neckJ.position.x += dx;
    const neck = mk(P.NECK, piv.NECK); neck.scale.set(1, neckL, 1); neckJ.add(neck);
    const headAt = piv.HEAD.clone().sub(piv.NECK); headAt.y *= neckL; headAt.x *= 0.5 + neckL * 0.5;
    const headJ = new THREE.Group(); headJ.position.copy(headAt); neckJ.add(headJ);
    const headS_ = new THREE.Group(); headS_.scale.setScalar(headS); headJ.add(headS_);
    headS_.add(mk(P.HEAD, piv.HEAD));
    // kasvot: anime-silmät, kulmat, suu + hampaat, kiiltävä nenä (face.js); vanhat pikkuosat 11/12 jätetään pois
    this.faceRig = buildFace(headS_, F, c);
    this.mats.push(...this.faceRig.mats);
    for (const [k, s] of [['EARL', -1], ['EARR', 1]]) {
      const j = new THREE.Group(); j.position.copy(piv[k]).sub(piv.HEAD); headS_.add(j);
      const m = mk(P[k], piv[k]); m.scale.setScalar(earS); j.add(m);
      const tilt = p.earTilt || 0;
      j.userData.base = new THREE.Euler(s * -tilt * 0.9, 0, -Math.abs(tilt) * 0.45);
      J[k] = j;
    }
    // häntä
    const tailJ = joint(bodyJ, piv.TAIL, piv.BODY); tailJ.position.x -= dx;
    const tt = p.tail || 'curl';
    if (tt === 'curl') tailJ.add(mk(P.TAIL, piv.TAIL));
    else {
      const len = (tt === 'docked' ? 0.07 : 0.32) * (p.tailLen || 1);
      const g = new THREE.ConeGeometry(tt === 'docked' ? 0.035 : 0.045, len, 7, 4);
      g.translate(0, len / 2, 0); // tyvi nivelessä, kärki +Y
      // kevyt kaarevuus (sapelihäntä)
      const a = g.attributes.position;
      for (let i = 0; i < a.count; i++) { const y = a.getY(i); const k = y / len; a.setX(i, a.getX(i) + k * k * (tt === 'sabre' ? 0.1 : 0.03)); }
      g.computeVertexNormals();
      const col = new Float32Array(a.count * 3); const tc = new THREE.Color(c.c.tail || c.c.coat);
      for (let i = 0; i < a.count; i++) { col[i * 3] = tc.r; col[i * 3 + 1] = tc.g; col[i * 3 + 2] = tc.b; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const m = new THREE.Mesh(g, mat), o = new THREE.Mesh(g, olMat);
      const holder = new THREE.Group(); holder.add(m, o); holder.position.set(-0.13, 0.035, 0);
      holder.rotation.z = tt === 'docked' ? 1.15 : tt === 'sabre' ? 2.25 : 2.45; // kärki +Y -> taaksepäin-alas
      tailJ.add(holder);
    }
    J.neck = neckJ; J.head = headJ; J.tail = tailJ; J.body = bodyJ; J.rigRoot = rigRoot;
    // Liitospisteet lisäosille (accessories.js): ryhmät ovat nivelissä, joten lisäosa liikkuu osan mukana.
    // Koordinaatit: mallin oma avaruus (h = 1, katse +X, oikea kylki +Z); pivot = nivelen paikka.
    this.parts = {
      head: headS_, torso: bodyJ, neck: neckJ, tail: tailJ, legs: [J.FL, J.FR, J.BL, J.BR], ears: [J.EARL, J.EARR],
      nose: headS_, eyes: headS_, pivots: piv, params: p,
    };
    this.length = 1.15 * bodyL * this.height; this.width = 0.3 * this.height; this.halfW = 0.15;
    this.headPivot = headJ;
  }

  _makeWeak(ws) {
    // Heikko kohta = mallin oma karvaton laikku vasemmassa kyljessä. Hehku shaderissa + sprite pinnalla.
    this.U.uWeak.value.set(ws.x, ws.y, ws.z, ws.r);
    const anchor = new THREE.Object3D(); anchor.position.set(ws.x, ws.y, ws.z); this.model.add(anchor);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xff5a3c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(0.4); glow.position.set(ws.x, ws.y, ws.z - 0.06);
    this.model.add(glow);
    this.weak = anchor; this.weakGlow = glow; this.weakReveal = 0;
  }

  _makeEyes(e) {
    const eyeMat = new THREE.SpriteMaterial({ map: glowTexture(), color: new THREE.Color(this.def.eyeColor || '#ffb030'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const eyes = new THREE.Group();
    for (const zs of [-1, 1]) { const s = new THREE.Sprite(eyeMat); s.scale.setScalar(0.06); s.position.set(e.x, e.y, zs * e.z); eyes.add(s); }
    // silmät seuraavat pään nyökkäystä (sama kierto kuin shaderissa)
    const hp = this.headPivot; eyes.position.sub(hp.position); hp.add(eyes);
    this.eyes = { material: eyeMat, scale: { setScalar: v => eyes.children.forEach(s => s.scale.setScalar(v * 0.12)) } };
    if (this.def.eyeScale) this.eyes.scale.setScalar(this.def.eyeScale);
  }

  get x() { return this.root.position.x; }
  set x(v) { this.root.position.x = v; }

  /** Vaihda animaatiota (nimet kuten ennen: Idle, Walk, Gallop, Attack, Gallop_Jump, Death ...). */
  play(name, { loop = true, fade = 0.18, timeScale = 1 } = {}) {
    const fn = ANIMS[name] || ANIMS.Idle;
    if (this.cur && this.cur.name === name && loop && this.cur.loop) { this.cur.ts = timeScale; return this.cur; }
    if (this.cur) this.prev = { ...this.cur, w: 1 };
    const dur = DUR[name] || 1;
    this.cur = { name, fn, t: 0, ts: timeScale, loop, fade: Math.max(fade, 0.001), blend: 0, duration: dur, getClip: () => ({ duration: dur }) };
    this.currentName = name;
    return this.cur;
  }

  oneShot(name, back = 'Idle', timeScale = 1) {
    const a = this.play(name, { loop: false, timeScale });
    const dur = a.duration / timeScale;
    return new Promise(res => setTimeoutGame(dur * 0.95, () => { if (this.cur === a && back) this.play(back); res(); }));
  }

  face(dir, instant = false) {
    this.facingTarget = dir;
    if (instant) { this.facing = dir; this.turn.rotation.y = dir > 0 ? 0 : Math.PI; }
  }

  setTint(hex, amt) { this.mat.emissive.setHex(hex); this.mat.emissiveIntensity = amt; }

  /** Häivytys (0..1). */
  fade(op) {
    for (const m of this.mats) { if (m.isShaderMaterial) continue; m.transparent = op < 1; m.opacity = op; m.depthWrite = op >= 1; }
    if (this.faceRig) this.faceRig.setOpacity(op);
    this.shadow.material.opacity = 0.35 * op;
    this.root.visible = op > 0.01;
  }

  _sample(a, d) {
    const t = a.loop ? a.t : Math.min(a.t, a.duration);
    return a.fn(t, d);
  }

  update(dt) {
    this.t += dt;
    const P = this.P;
    // animaattorin ajastus + ristihäivytys
    const cur = this.cur;
    cur.t += dt * cur.ts; cur.blend = Math.min(1, cur.blend + dt / cur.fade);
    const A = Object.assign(blankPose(), this._sample(cur, this));
    if (this.prev && cur.blend < 1) {
      this.prev.t += dt * this.prev.ts;
      const B = Object.assign(blankPose(), this._sample(this.prev, this));
      for (const k of KEYS) P[k] = B[k] + (A[k] - B[k]) * cur.blend;
    } else { for (const k of KEYS) P[k] = A[k]; this.prev = null; }
    // lisäkerrokset: hännän heilutus, korvien värähdys, hengitys
    const moving = cur.name === 'Gallop' || cur.name === 'Walk';
    P.ty += Math.sin(this.t * (moving ? 6 : 9)) * this.wag * (cur.name === 'Death' || cur.name === 'LieDown' ? 0.1 : 0.7);
    this.nextTwitch -= dt;
    if (this.nextTwitch <= 0) { this.earTw = 1; this.nextTwitch = 2 + Math.random() * 5; }
    this.earTw = Math.max(0, this.earTw - dt * 6);
    P.ear += this.earPerk * 0.35 + Math.sin(this.earTw * Math.PI) * 0.35;

    // käännös
    const targetRot = this.facingTarget > 0 ? 0 : Math.PI;
    this.turn.rotation.y += (targetRot - this.turn.rotation.y) * Math.min(1, dt * 10);

    // runko
    const H = this.height, c = 0.5 * H;
    const pose = this.pose;
    pose.rotation.set(0, 0, 0);
    pose.rotation.x = -P.lie + P.roll; pose.rotation.z = P.pitch;
    pose.scale.set(P.sx, P.sy, 1 + (1 - P.sy) * 0.5);
    const lieDrop = (c - this.halfW * H) * Math.abs(Math.sin(P.lie));
    pose.position.set(P.x * H, P.y * H - (1 - P.sy) * c - lieDrop, 0);

    if (this.U) { // jäykkä: rigi-uniformit
      this.U.uLeg.value.set(P.l0, P.l1, P.l2, P.l3);
      this.U.uLift.value.set(P.f0, P.f1, P.f2, P.f3);
      this.U.uHT.value.set(P.hp * (this.rig.headAmt ?? 1), P.hy * (this.rig.headAmt ?? 1), P.ty * 0.8, P.tp * 0.5);
      this.headPivot.rotation.set(0, -P.hy * (this.rig.headAmt ?? 1), -P.hp * (this.rig.headAmt ?? 1));
    } else if (this.J) {
      const J = this.J;
      J.FL.rotation.z = P.l0; J.FR.rotation.z = P.l1; J.BL.rotation.z = P.l2; J.BR.rotation.z = P.l3;
      J.head.rotation.set(0, P.hy, -P.hp * 0.7);
      J.neck.rotation.z = -P.hp * 0.35;
      J.tail.rotation.set(0, P.ty * 0.9, P.tp * 0.6);
      for (const [k, s] of [['EARL', -1], ['EARR', 1]]) {
        const b = J[k].userData.base; J[k].rotation.set(b.x + s * -P.ear * 0.25, b.y, b.z - P.ear * 0.3);
      }
    }
    if (this.weak) {
      const pulse = 0.6 + Math.sin(this.t * 8) * 0.4;
      this.weakGlow.material.opacity = this.weakReveal * pulse * 0.55;
      this.U.uWeakAmt.value = this.weakReveal * (0.25 + pulse * 0.35);
    }
    if (this.faceRig) {
      const n = cur.name, k = cur.loop ? 0 : cur.t / cur.duration;
      const auto = n === 'Death' ? 'closed' : n.startsWith('Idle_HitReact') ? 'hurt' : (n === 'Attack' || n === 'Battoga' || n === 'Gallop_Jump') ? 'angry'
        : (n === 'Idle_2_HeadLow' || n === 'LieDown') ? 'sad' : n === 'Howl' ? 'closed' : n === 'Gallop' ? 'determined' : 'neutral';
      this.faceRig.set(this.exprLock || auto);
      const mouth = n === 'Attack' ? Math.max(0, Math.sin(Math.min(1, k * 1.6) * Math.PI)) : n === 'Bark' ? Math.max(0, Math.sin(Math.min(1, k * 2) * Math.PI)) * 0.8
        : n === 'Howl' ? 0.6 : n === 'Gallop' ? 0.25 + Math.sin(this.t * 14) * 0.1 : 0;
      this.faceRig.mouth(mouth);
      if (this.lookTarget) {
        const tp = this.lookTarget.isVector3 ? this.lookTarget : this.lookTarget.root.position;
        const dx = (tp.x - this.root.position.x) * this.facing, dy = (this.lookTarget.height ? tp.y + this.lookTarget.height * 0.7 : tp.y) - (this.root.position.y + this.height * 0.8);
        this.faceRig.gaze(Math.max(-0.2, Math.min(0.2, dx * 0.06)), Math.max(-0.15, Math.min(0.15, dy * 0.08)));
      } else this.faceRig.gaze(Math.sin(this.t * 0.37) * 0.08, 0);
      this.faceRig.update(dt);
    }
    if (this._extras) this._extras(this.t, dt);
  }

  /** Lukitse ilme (neutral, determined, angry, sad, happy, closed, hurt, dead, surprised) tai null = automaattinen. */
  expr(name) { this.exprLock = name || null; }
}

// pelin aikaan sidottu setTimeout (slow-mo vaikuttaa)
const gameTimers = [];
export function setTimeoutGame(s, fn) { gameTimers.push({ t: s, fn }); }
E.updaters.add(dt => {
  for (let i = gameTimers.length - 1; i >= 0; i--) {
    gameTimers[i].t -= dt;
    if (gameTimers[i].t <= 0) { const f = gameTimers[i].fn; gameTimers.splice(i, 1); f(); }
  }
});

/** Luo hahmo (mallin pitää olla ladattu: käytä ensin await loadFor([id])). */
export function makeDog(id) { return new Dog(id); }
export async function makeDogAsync(id) { await loadFor([id]); return new Dog(id); }
export { glowTexture, gradientMap, ANIMS };
