// Procedural set pieces for cutscenes (toon + outline, no textures): the den under the old tree's roots (Sakura),
// a moonbeam / god-ray cone, autumn leaf litter, grave mounds, a shallow river ribbon. Scale: Weed pup ≈ 0.5 units.
import * as THREE from 'three';
import { mesh, toon } from './props.js';
import { gradientMap } from '../dogs.js';

/** Soft additive light cone (moonbeam / sunbeam / spirit pillar). setI(v) changes brightness. */
export function beam({ h = 7, r0 = 0.25, r1 = 1.4, color = 0xbfd4ff, alpha = 0.32 } = {}) {
  const geo = new THREE.CylinderGeometry(r0, r1, h, 24, 1, true); geo.translate(0, -h / 2, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uCol: { value: new THREE.Color(color) }, uA: { value: alpha }, uH: { value: h }, uT: { value: 0 } },
    vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV;
      void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uA; uniform float uH; uniform float uT; varying float vY; varying vec3 vN; varying vec3 vV;
      void main(){ float k = clamp(-vY/uH, 0.0, 1.0); float edge = pow(abs(dot(vN, vV)), 1.6);
        float a = uA * edge * smoothstep(0.0, 0.15, k) * (1.0 - smoothstep(0.75, 1.0, k)) * (0.85 + 0.15*sin(uT*1.3 + vY*2.0));
        gl_FragColor = vec4(uCol * a, a); }`,
  });
  const m = new THREE.Mesh(geo, mat); m.userData.noGfx = true; m.renderOrder = 5; m.frustumCulled = false;
  m.onBeforeRender = () => { mat.uniforms.uT.value = performance.now() / 1000; };
  m.userData.setI = v => { mat.uniforms.uA.value = alpha * v; };
  return m;
}

/** Scattered autumn leaves on the ground (one instanced draw). */
export function leafLitter(n = 120, rx = 3, rz = 2, seed = 3) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const geo = new THREE.CircleGeometry(0.06, 5); geo.rotateX(-Math.PI / 2); geo.scale(1, 1, 0.55);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap }), n);
  const cols = [0xc8642a, 0xe0a040, 0xa8401e, 0xd8b060, 0x8a4a22, 0xb87830];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    p.set(Math.cos(a) * d * rx, 0.012 + r() * 0.01, Math.sin(a) * d * rz);
    e.set((r() - 0.5) * 0.3, r() * 6.28, (r() - 0.5) * 0.3); q.setFromEuler(e);
    const k = 0.7 + r() * 0.9; sc.set(k, 1, k);
    im.setMatrixAt(i, m4.compose(p, q, sc)); im.setColorAt(i, new THREE.Color(cols[Math.floor(r() * cols.length)]));
  }
  im.receiveShadow = true; im.userData.castShadow = false;
  return im;
}

/** The den: an old tree whose roots arch over a dark hollow. Opening faces +z (camera side). */
export function rootDen() {
  const g = new THREE.Group();
  const bark = 0x3a332e, bark2 = 0x4a4038;
  // trunk, slightly leaning, wide flare at the base
  const trunk = mesh(new THREE.CylinderGeometry(0.42, 0.75, 5.2, 11, 3), bark, 0.02); trunk.position.set(0, 2.5, -0.9); trunk.rotation.z = 0.06; g.add(trunk);
  const flare = mesh(new THREE.CylinderGeometry(0.75, 1.25, 0.7, 11), bark2, 0.02); flare.position.set(0, 0.3, -0.9); g.add(flare);
  // roots arching from the trunk to the ground around the hollow
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const roots = [];
  for (const sx of [-1, 1]) {
    roots.push([[V(sx * 0.35, 0.9, -0.8), V(sx * 1.0, 0.6, -0.35), V(sx * 1.65, -0.05, 0.45)], 0.15]);
    roots.push([[V(sx * 0.45, 0.7, -0.95), V(sx * 1.3, 0.35, -0.7), V(sx * 2.1, -0.05, -0.25)], 0.12]);
    roots.push([[V(sx * 0.3, 0.6, -0.7), V(sx * 0.9, 0.3, 0.2), V(sx * 1.15, -0.05, 0.95)], 0.09]);
  }
  roots.push([[V(-1.35, -0.05, 0.8), V(-0.7, 0.95, 0.55), V(0.45, 1.08, 0.5), V(1.3, -0.05, 0.85)], 0.13]);   // the arch over the mouth
  roots.push([[V(-0.2, 1.1, -0.75), V(0.3, 1.2, 0.0), V(0.62, 1.0, 0.5)], 0.1]);
  for (const [pts, rad] of roots) {
    const tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, rad, 6, false), bark2, 0.012); g.add(tube);
  }
  // the hollow: a dark half-dome sunk behind the roots
  const hollow = new THREE.Mesh(new THREE.SphereGeometry(1.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x07050a, side: THREE.BackSide }));
  hollow.scale.set(1.25, 0.72, 0.85); hollow.position.set(0, -0.02, -0.45); hollow.userData.noGfx = true; g.add(hollow);
  // moss and stones
  const moss = toon(0x4f6a2e);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22 + i * 0.03, 8, 6), moss); m.scale.y = 0.35; m.position.set(-1.6 + i * 0.85, 0.03, 0.95 - (i % 2) * 0.4); g.add(m); }
  for (let i = 0; i < 4; i++) { const st = mesh(new THREE.DodecahedronGeometry(0.16 + (i % 2) * 0.08, 0), 0x6e6a62, 0.01); st.scale.y = 0.55; st.position.set(-2.4 + i * 1.6, 0.05, 1.3 + (i % 2) * 0.3); g.add(st); }
  // a few low branches with leaves above (catch the rim light)
  const leafA = toon(0xb4441c), leafB = toon(0xd88a2a);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + i * 0.2, 0), i % 2 ? leafA : leafB); c.position.set(-1.6 + i * 1.1, 4.6 + (i % 2) * 0.7, -1.2 - (i % 3) * 0.3); c.scale.set(1.3, 0.8, 1); g.add(c); }
  g.add(leafLitter(160, 3.2, 2.2, 7));
  return g;
}

/** A small grave: earth mound + standing stone (+ optional flower). */
export function grave(seed = 1) {
  const g = new THREE.Group();
  const mound = mesh(new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0x5a4232, 0.012); mound.scale.set(1.0, 0.45, 0.75); g.add(mound);
  const stone = mesh(new THREE.BoxGeometry(0.18, 0.42 + (seed % 3) * 0.06, 0.1), 0x8a867e, 0.01); stone.position.set(0, 0.22, -0.28); stone.rotation.z = ((seed % 5) - 2) * 0.04; g.add(stone);
  const fl = mesh(new THREE.SphereGeometry(0.035, 6, 5), [0xf0d040, 0xe8e0f0, 0xd86a8a][seed % 3], 0); fl.position.set(0.14, 0.12, 0.1); g.add(fl);
  return g;
}
