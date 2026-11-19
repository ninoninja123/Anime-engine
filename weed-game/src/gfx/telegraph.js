// Ground telegraph marker for boss attacks: a soft, rounded danger zone (stadium shape) with a glowing rim and
// a slow inward pulse, instead of a flat additive rectangle (which read as an orange box on the ground and could
// stay behind when an attack was interrupted).
// API is a drop-in for the old Mesh(PlaneGeometry(1,1), MeshBasicMaterial): the level code keeps setting
// position, scale (x = length, y = depth of the zone) and material.opacity (0 = hidden).
// guard(): optional predicate; while it returns false the marker fades out on its own, so a telegraph that was
// interrupted (special move, cutscene, phase change, quit) never lingers on the ground.
import * as THREE from 'three';
import { E } from '../engine.js';

const VS = `
varying vec2 vUv; varying vec2 vSize;
uniform vec2 uSize;
void main(){
  vUv = uv; vSize = uSize;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}`;
const FS = `
varying vec2 vUv; varying vec2 vSize;
uniform vec3 uColor; uniform float uOpacity, uTime;
void main(){
  // stadium SDF in world units: half extents (w/2, d/2), corner radius = d/2
  vec2 p = (vUv - 0.5) * vSize;
  float r = vSize.y * 0.5;
  vec2 q = abs(p) - vec2(max(vSize.x * 0.5 - r, 0.0), 0.0);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;    // < 0 inside
  float edge = 1.0 - smoothstep(-0.02, 0.06, d);                    // soft outer edge
  float rim = smoothstep(-0.32, -0.06, d) * edge;                    // bright band along the border
  float fill = 0.22 * edge;
  float wave = 0.5 + 0.5 * sin(d * 7.0 + uTime * 9.0);               // ripples moving inward
  float a = (rim * 0.85 + fill * (0.6 + 0.4 * wave)) * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * a, a);
}`;

const live = new Set();
let hooked = false;

export function makeTelegraph({ color = 0xff4a26, guard = null } = {}) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, fog: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,  // premultiplied: soft, no hard additive box
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,                             // never z-fights the ground
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 }, uTime: { value: 0 }, uSize: { value: new THREE.Vector2(1, 1) },
    },
  });
  mat.opacity = 0;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.03;
  mesh.renderOrder = 2; mesh.frustumCulled = false; mesh.visible = false;
  mesh.userData.noGfx = true;
  mesh.userData.tg = { guard, shown: 0 };
  live.add(mesh);
  if (!hooked) {
    hooked = true;
    E.updaters.add((dt, dtr) => {
      for (const m of live) {
        const st = m.userData.tg, u = m.material.uniforms;
        let want = m.material.opacity;
        if (want > 0 && st.guard) { try { if (!st.guard()) want = 0; } catch (_) { want = 0; } }
        // ease in quickly, fade out a little slower (no popping)
        st.shown += (want - st.shown) * Math.min(1, dtr * (want > st.shown ? 14 : 7));
        if (st.shown < 0.004) st.shown = 0;
        m.visible = st.shown > 0;
        u.uOpacity.value = st.shown * 2.4;   // old opacity 0.32..0.35 -> ~0.8 visual strength
        u.uTime.value = E.realTime % 1000;
        u.uSize.value.set(Math.abs(m.scale.x), Math.abs(m.scale.y));
      }
    });
  }
  return mesh;
}
