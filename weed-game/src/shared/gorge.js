// Procedural water and gorge pieces for the level 2 cutscenes (no gorge model exists):
//   river({ x0, x1, z, w })   flowing water ribbon (animated toon stripes + foam edges), sits just above the ground
//   chasm({ x, w, len })      a dark crack in the ground with rock lips and mist (the night crossing before Gajō)
//   fallSet({ y0, depth })    the gorge below the arena edge: two rock walls, a waterfall sheet, mist, river at the bottom.
//                             It lives under the ground plane (invisible from below), so the camera can fall with the dogs.
import * as THREE from 'three';
import { mesh, toon } from './props.js';

const WATER_VS = `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
function waterMat({ col = 0x5a7fa8, deep = 0x24384f, foam = 0xeef6ff, speed = 0.6, alpha = 0.92, fall = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 }, uCol: { value: new THREE.Color(col) }, uDeep: { value: new THREE.Color(deep) }, uFoam: { value: new THREE.Color(foam) }, uS: { value: speed }, uA: { value: alpha } },
    vertexShader: WATER_VS,
    fragmentShader: `uniform float uT; uniform vec3 uCol; uniform vec3 uDeep; uniform vec3 uFoam; uniform float uS; uniform float uA; varying vec2 vUv; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        ${fall ? 'vec2 p = vec2(vUv.x*6.0, vUv.y*3.0 + uT*uS*2.5);' : 'vec2 p = vec2(vW.x*0.9 - uT*uS, vW.z*2.2);'}
        float s = n(p*vec2(1.0,3.0)) * 0.6 + n(p*vec2(2.3,7.0) + 3.1) * 0.4;
        float band = step(0.62, s);                                    // toon streaks
        float edge = ${fall ? 'smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x)' : '1.0 - smoothstep(0.0, 0.16, min(vUv.y, 1.0 - vUv.y))'};
        vec3 c = mix(uDeep, uCol, 0.55 + 0.45*s);
        c = mix(c, uFoam, band*0.55 ${fall ? '+ 0.25' : '+ edge*0.6'});
        float a = uA ${fall ? '* edge * (0.75 + 0.25*s)' : ''};
        gl_FragColor = vec4(c, a);
      }`,
  });
}
function ticker(m) { m.onBeforeRender = () => { m.material.uniforms.uT.value = performance.now() / 1000; }; m.userData.noGfx = true; m.frustumCulled = false; return m; }

/** Flowing river ribbon along x. */
export function river({ x0 = -24, x1 = 24, z = 0.6, w = 2.4, y = 0.035, col, deep } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(x1 - x0, w, 1, 1); geo.rotateX(-Math.PI / 2);
  const water = ticker(new THREE.Mesh(geo, waterMat({ col, deep }))); water.position.set((x0 + x1) / 2, y, z); water.renderOrder = 2; g.add(water);
  // stones along the banks
  for (let i = 0; i < 18; i++) {
    const x = x0 + 1 + i * (x1 - x0 - 2) / 17, side = i % 2 ? 1 : -1;
    const st = mesh(new THREE.DodecahedronGeometry(0.16 + (i % 3) * 0.07, 0), 0x77736a, 0.008); st.scale.y = 0.5;
    st.position.set(x + Math.sin(i * 3.1) * 0.4, y + 0.01, z + side * (w / 2 + 0.05)); g.add(st);
  }
  return g;
}

/** A crack in the ground: dark gap + rock lips + mist sprites. Runs along z (the dogs jump across it in x). */
export function chasm({ x = -1.4, w = 1.5, len = 14 } = {}) {
  const g = new THREE.Group();
  const gap = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({ color: 0x030308 }));
  gap.rotation.x = -Math.PI / 2; gap.position.set(x, 0.015, -1); gap.userData.noGfx = true; g.add(gap);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, len), new THREE.MeshBasicMaterial({ color: 0x1a2236, transparent: true, opacity: 0.6, depthWrite: false }));
  inner.rotation.x = -Math.PI / 2; inner.position.set(x, 0.02, -1); inner.userData.noGfx = true; g.add(inner);
  for (const side of [-1, 1]) for (let i = 0; i < 12; i++) {
    const r = mesh(new THREE.DodecahedronGeometry(0.22 + ((i * 7) % 5) * 0.05, 0), 0x5c5a58, 0.01);
    r.scale.set(1.3, 0.55, 1); r.position.set(x + side * (w / 2 + 0.1), 0.05, -1 - len / 2 + i * len / 11 + Math.sin(i) * 0.3); r.rotation.y = i; g.add(r);
  }
  g.userData.x = x; g.userData.w = w;
  return g;
}

/** The gorge under the arena edge (x ≈ 9.5): rock walls, waterfall, mist, river far below. */
export function fallSet({ x = 12, y0 = -1, depth = 46, z = 0 } = {}) {
  const g = new THREE.Group();
  const rockA = toon(0x5a5450), rockB = toon(0x474240);
  const wall = (side) => {
    const w = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const h = i / 25, yy = y0 - h * depth;
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 + (i % 4) * 0.6, 0), i % 2 ? rockA : rockB);
      b.scale.set(1.4, 1.2, 1.0); b.position.set(x + Math.sin(i * 1.7) * 2.5, yy, z + side * (6.2 + Math.cos(i * 2.3) * 0.8)); b.rotation.set(i, i * 0.7, 0);
      w.add(b);
    }
    return w;
  };
  g.add(wall(-1), wall(1));
  // back wall + waterfall
  for (let i = 0; i < 16; i++) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(3 + (i % 3), 0), rockB); b.position.set(x + 7 + Math.sin(i) * 1.5, y0 - i * depth / 15, z + Math.cos(i * 2.1) * 4); g.add(b); }
  const fallGeo = new THREE.PlaneGeometry(5, depth + 4, 1, 1);
  const fall = ticker(new THREE.Mesh(fallGeo, waterMat({ col: 0xc8dcf0, deep: 0x6a88a8, speed: 1.4, alpha: 0.85, fall: true })));
  fall.position.set(x + 4.6, y0 - depth / 2 + 1, z); fall.rotation.y = -Math.PI / 2; fall.material.side = THREE.DoubleSide; g.add(fall);
  // river at the bottom
  const rv = river({ x0: x - 14, x1: x + 14, z, w: 9, y: y0 - depth, col: 0x6a90b8, deep: 0x2a405a }); g.add(rv);
  g.userData.bottom = y0 - depth;
  g.traverse(o => { if (o.isMesh && !o.userData.noGfx) { o.castShadow = false; o.receiveShadow = false; o.userData.castShadow = false; } });
  return g;
}
