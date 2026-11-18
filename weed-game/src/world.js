// Maailma: Gajōn vuoristo. Proseduraalinen taivas (tähdet, kuu, revontulet, pilvet, auringonnousu),
// maalatut parallax-vuorikerrokset, kalliotornit, vesiputous, instansoitu mäntymetsä, lumipeite (kimallus),
// usvakerrokset, valot + varjot ja kolmikerroksinen lumisade. Kaikki värit tulevat tunnelmasta (gfx/mood.js).
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { E } from './engine.js';
import { Q, onQuality } from './gfx/quality.js';
import { mood } from './gfx/mood.js';
import { makeToonMaterial, addOutline, toonShared } from './gfx/toon.js';
import { post } from './gfx/post.js';

const OUT = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';
const NOISE = `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
`;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- maalatut vuoret ----------
function paintRange(g, w, h, o) {
  const r = rng(o.seed);
  const n = 257, hs = new Float32Array(n);
  hs[0] = r(); hs[n - 1] = r();
  for (let step = n - 1, amp = 1; step > 1; step >>= 1, amp *= o.rough || 0.56) {
    const half = step >> 1;
    for (let i = half; i < n; i += step) hs[i] = (hs[i - half] + hs[i + half]) / 2 + (r() - 0.5) * amp;
  }
  let mn = 9, mx = -9; for (const v of hs) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  const pts = [];
  for (let i = 0; i < n; i++) {
    let k = (hs[i] - mn) / (mx - mn);
    k = Math.pow(k, o.sharp || 1.6);                       // terävät huiput, leveät laaksot
    pts.push([i / (n - 1) * w, o.base - k * o.amp]);
  }
  const path = () => { g.beginPath(); g.moveTo(0, h); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(w, h); g.closePath(); };
  // siluetti
  path();
  const gr = g.createLinearGradient(0, o.base - o.amp, 0, h);
  gr.addColorStop(0, o.rock[0]); gr.addColorStop(1, o.rock[1]);
  g.fillStyle = gr; g.fill();
  // paikalliset huiput
  const peaks = [];
  for (let i = 4; i < n - 4; i++) { let ok = true; for (let k = -4; k <= 4; k++) if (pts[i + k][1] < pts[i][1]) ok = false; if (ok) peaks.push(i); }
  const facets = alpha => {
    for (const pi of peaks) {
      const [px, py] = pts[pi];
      const len = 10 + Math.floor(r() * 14);
      g.beginPath(); g.moveTo(px, py);
      let last = pts[pi];
      for (let k = 1; k <= len && pi + k < n; k++) { last = pts[pi + k]; g.lineTo(last[0], last[1]); }
      const drop = (h - py) * (0.35 + r() * 0.3);
      g.lineTo(last[0] - (last[0] - px) * 0.25, last[1] + drop);
      g.lineTo(px + (r() - 0.3) * 12, py + drop * (0.5 + r() * 0.4));
      g.closePath(); g.globalAlpha = alpha; g.fill();
      // pienempi harjanne varjon sisällä
      g.beginPath(); g.moveTo(px, py); g.lineTo(px - 14 - r() * 22, py + drop * 0.6); g.lineTo(px - 4, py + drop * 0.75); g.closePath();
      g.globalAlpha = alpha * 0.35; g.fill();
    }
    g.globalAlpha = 1;
  };
  g.save(); path(); g.clip();
  g.fillStyle = o.shade; facets(0.6);
  // kallion juovat
  g.strokeStyle = o.shade; g.lineWidth = 2; g.globalAlpha = 0.22;
  for (let i = 0; i < 90; i++) { const x = r() * w, y = o.base - r() * o.amp * 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + r() * 16, y + 30 + r() * 70); g.stroke(); }
  g.globalAlpha = 1;
  // lumi: harjanteelta alaspäin repaleinen reuna
  if (o.snow) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts) g.lineTo(x, y - 2);
    for (let i = n - 1; i >= 0; i--) {
      const [x, y] = pts[i];
      const above = Math.max(0, o.snowLine - y);
      const d = above * (0.35 + r() * 0.75) + (i % 3 === 0 ? above * 0.5 * r() : 0);
      g.lineTo(x + (r() - 0.5) * 6, y + d);
    }
    g.closePath();
    g.save(); g.clip();
    g.fillStyle = o.snow; g.fillRect(0, 0, w, h);
    g.fillStyle = o.snowShade; facets(0.85);
    g.restore();
  }
  g.restore();
  // alareunan häivytys usvaan
  g.globalCompositeOperation = 'destination-out';
  const fg = g.createLinearGradient(0, h * (o.fadeFrom || 0.72), 0, h * (o.fadeTo || 0.98));
  fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = fg; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
}

function paintSpires(g, w, h) {
  const r = rng(5);
  const spire = (x, wd, top) => {
    const L = [], R = [];
    const N = 16;
    for (let s = 0; s <= N; s++) {
      const k = s / N, y = h - (h - top) * k;
      const half = wd * (1 - k * 0.72) * (1 + (r() - 0.5) * 0.22) + (s % 4 === 0 ? wd * 0.12 : 0);
      L.push([x - half + (r() - 0.5) * 8, y]); R.push([x + half * (0.9 + r() * 0.2) + (r() - 0.5) * 8, y]);
    }
    const tip = [x + (r() - 0.5) * wd * 0.2, top - 16 - r() * 14];
    const full = () => { g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const p of L) g.lineTo(p[0], p[1]); g.lineTo(tip[0], tip[1]); for (let i = N; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); };
    full(); g.fillStyle = '#2f3a64'; g.fill();
    g.save(); full(); g.clip();
    // varjopuoli (oikea)
    g.beginPath(); g.moveTo(tip[0], tip[1]);
    for (let i = N; i >= 0; i--) g.lineTo(R[i][0] + 4, R[i][1]);
    for (let i = 0; i <= N; i++) g.lineTo(x + (L[i][0] - x) * -0.18 + ((i * 7) % 5 - 2) * 5, L[i][1]);
    g.closePath(); g.fillStyle = '#141a3a'; g.fill();
    // halkeamat
    g.strokeStyle = '#141a36'; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const yy = top + r() * (h - top) * 0.9, xx = x + (r() - 0.5) * wd * 1.2; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + (r() - 0.5) * 16, yy + 40 + r() * 80); g.lineTo(xx + (r() - 0.5) * 24, yy + 110 + r() * 60); g.stroke(); }
    g.globalAlpha = 1;
    // kuunvalon reuna vasemmalla
    g.strokeStyle = 'rgba(190,210,255,0.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(L[0][0] + 2, L[0][1]); for (const p of L) g.lineTo(p[0] + 2, p[1]); g.lineTo(tip[0], tip[1]); g.stroke();
    // lumijuovat vasemmalla reunalla
    for (let i = 2; i <= N; i += 1 + Math.floor(r() * 2)) {
      const y = L[i][1], x0 = L[i][0] - 1, len = 14 + r() * 30;
      g.fillStyle = '#dfe8ff'; g.beginPath(); g.moveTo(x0, y - 6); g.lineTo(x0 + len, y + 4 + r() * 6); g.lineTo(x0 + len * 0.5, y + 12 + r() * 10); g.lineTo(x0 + 1, y + 16); g.closePath(); g.fill();
    }
    // huipun lumi
    g.fillStyle = '#eef3ff'; g.beginPath(); g.moveTo(tip[0], tip[1] - 2); g.lineTo(L[N][0] - 4, L[N][1] + 26); g.lineTo(x - 4, L[N][1] + 12 + r() * 20); g.lineTo(x + 10, L[N][1] + 40); g.lineTo(R[N][0] + 2, L[N][1] + 14); g.closePath(); g.fill();
    g.restore();
  };
  spire(150, 120, 420); spire(430, 170, 200); spire(760, 110, 470);
  spire(1130, 130, 520); spire(1450, 220, 90); spire(1760, 160, 300); spire(1980, 130, 540);
  g.globalCompositeOperation = 'destination-out';
  const fg = g.createLinearGradient(0, h * 0.8, 0, h);
  fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.9)');
  g.fillStyle = fg; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
}

const layers = [];
function addLayer(scene, tex, w, h, z, y, hazeAmt, sunLit) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { map: { value: tex }, uTint: { value: new THREE.Color(1, 1, 1) }, uHaze: { value: new THREE.Color() }, uHazeAmt: { value: hazeAmt },
      uSun: { value: new THREE.Color() }, uSunAmt: { value: 0 }, uSunLit: { value: sunLit } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 uTint, uHaze, uSun; uniform float uHazeAmt, uSunAmt, uSunLit; varying vec2 vUv;
      void main(){ vec4 t = texture2D(map, vUv); vec3 c = t.rgb * uTint;
        float l = dot(t.rgb, vec3(0.33));
        c += uSun * uSunAmt * uSunLit * smoothstep(0.35, 0.8, l) * 0.55;
        c = mix(c, uHaze, clamp(uHazeAmt + (1.0 - vUv.y) * 0.25, 0.0, 1.0));
        gl_FragColor = vec4(c, t.a); ${OUT} }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(0, y, z); m.renderOrder = -5; scene.add(m);
  layers.push(mat);
  return m;
}

// ---------- maaston korkeus ----------
function groundH(x, z) {
  const back = THREE.MathUtils.smoothstep(-z, 8, 17);
  // takamaasto kohoaa, mutta laskee takaisin tasaiseksi: z = -40 on Lauma-gallerian rivi (main.js GAL_Z)
  const far = THREE.MathUtils.smoothstep(-z, 13, 20) * (1 - THREE.MathUtils.smoothstep(-z, 24, 29));
  const n = Math.sin(x * 0.23 + 1.3) * Math.cos(z * 0.31) * 0.5 + Math.sin(x * 0.61 + z * 0.4) * 0.25;
  return back * (1 - THREE.MathUtils.smoothstep(-z, 24, 29)) * (0.45 + n * 0.5) + far * (2.2 + Math.sin(x * 0.11) * 1.2);
}

export function buildWorld() {
  const scene = E.scene;
  const M = mood.cur;
  scene.fog = new THREE.FogExp2(0x1c2a52, 0.0105);
  const uTime = toonShared.uTime;

  // ---------- taivas ----------
  const moonDir = new THREE.Vector3(-38, 46, -160).normalize();
  const sunDir = new THREE.Vector3(46, 23, -160).normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: M.skyTop }, uMid: { value: M.skyMid }, uHor: { value: M.skyHor }, uCloudCol: { value: M.cloudCol }, uSunCol: { value: M.sunCol },
      uStars: { value: 1 }, uAurora: { value: 0 }, uCloud: { value: 0.2 }, uMoon: { value: 1 }, uSun: { value: 0 }, uTime,
      uMoonDir: { value: moonDir }, uSunDir: { value: sunDir }, uLow: { value: Q.tier === 'low' ? 1 : 0 },
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 uTop, uMid, uHor, uCloudCol, uSunCol, uMoonDir, uSunDir;
      uniform float uStars, uAurora, uCloud, uMoon, uSun, uTime, uLow;
      varying vec3 vP;
      ${NOISE}
      void main(){
        vec3 d = normalize(vP); float h = d.y;
        vec3 c = h > 0.12 ? mix(uMid, uTop, smoothstep(0.12, 0.7, h)) : mix(uHor, uMid, smoothstep(-0.05, 0.12, h));
        float az = atan(d.x, -d.z);
        // aurinko (aamunkoitto)
        float sd = max(dot(d, uSunDir), 0.0);
        c += uSunCol * uSun * (pow(sd, 5.0) * 0.5 + pow(sd, 40.0) * 0.9 + pow(sd, 900.0) * 9.0);
        c += uSunCol * uSun * 0.3 * exp(-abs(h - 0.08) * 9.0) * (0.35 + 0.65 * sd);
        // pilvet
        float cl = fbm(vec2(az * 2.4 + uTime * 0.012, h * 9.0 - uTime * 0.003));
        float cm = smoothstep(1.0 - uCloud * 0.9, 1.25 - uCloud * 0.9, cl + 0.25) * smoothstep(-0.02, 0.1, h) * (1.0 - smoothstep(0.45, 0.85, h));
        vec3 ccol = uCloudCol + uSunCol * uSun * 0.5 * pow(sd, 3.0) + vec3(0.1, 0.12, 0.2) * uMoon * pow(max(dot(d, uMoonDir), 0.0), 8.0);
        float clear = 1.0 - cm * 0.9;
        // tähdet
        if (uStars > 0.01 && h > 0.0) {
          vec2 sp = vec2(az, asin(clamp(h, -1.0, 1.0))) * 58.0;
          vec2 g = floor(sp), f = fract(sp) - 0.5;
          float rnd = hash21(g);
          if (rnd > 0.84) {
            vec2 off = (vec2(hash21(g + 7.1), hash21(g + 13.7)) - 0.5) * 0.7;
            float sz = 0.035 + 0.1 * fract(rnd * 37.0);
            float star = smoothstep(sz, 0.0, length(f - off));
            float tw = 0.65 + 0.35 * sin(uTime * (1.0 + rnd * 5.0) + rnd * 50.0);
            vec3 sc = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), fract(rnd * 17.0));
            c += sc * star * tw * uStars * smoothstep(0.0, 0.22, h) * (1.2 + 3.5 * fract(rnd * 91.0)) * clear;
          }
        }
        // kuu
        if (uMoon > 0.01) {
          float md = dot(d, uMoonDir);
          float disc = smoothstep(0.99880, 0.99900, md);
          vec3 mc = vec3(1.0, 0.97, 0.88) * (2.3 - 0.5 * vnoise(d.xy * 90.0));
          c = mix(c, mc, disc * uMoon);
          c += vec3(0.55, 0.68, 1.0) * uMoon * (pow(max(md, 0.0), 700.0) * 0.55 + pow(max(md, 0.0), 60.0) * 0.16) * (1.0 - disc);
        }
        // revontulet
        if (uAurora > 0.01 && h > 0.02) {
          float a = 0.0;
          for (int i = 0; i < 2; i++) {
            float fi = float(i);
            float xx = az * (2.6 + fi * 1.9) + uTime * 0.06 * (fi + 1.0) + fi * 2.0;
            float wave = sin(xx + sin(xx * 0.7 + uTime * 0.23) * 1.5) * 0.055 + 0.2 + fi * 0.11;
            float band = smoothstep(wave - 0.025, wave + 0.012, h) * exp(-(h - wave) * (5.5 - fi * 1.8));
            float rays = uLow > 0.5 ? 0.8 : 0.5 + 0.5 * vnoise(vec2(xx * 15.0, uTime * 0.5 + fi * 5.0));
            a += band * rays * (1.0 - fi * 0.35);
          }
          vec3 ac = mix(vec3(0.12, 1.0, 0.55), vec3(0.5, 0.3, 1.0), smoothstep(0.18, 0.7, h));
          c += ac * a * uAurora * 1.5 * clear;
        }
        c = mix(c, ccol, cm * 0.85);
        gl_FragColor = vec4(c, 1.0); ${OUT}
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 20), skyMat);
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  E.moon = new THREE.Object3D(); E.moon.position.copy(moonDir).multiplyScalar(170);

  // ---------- parallax-vuoret ----------
  const far = canvasTex(2048, 512, (g, w, h) => paintRange(g, w, h, { seed: 11, base: 400, amp: 330, sharp: 1.5, rock: ['#5a6ea4', '#34446e'], shade: '#283860', snow: '#eaf0ff', snowShade: '#8fa4dc', snowLine: 330 }));
  addLayer(scene, far, 460, 115, -150, 24, 0.55, 1);
  const mid = canvasTex(2048, 512, (g, w, h) => paintRange(g, w, h, { seed: 23, base: 420, amp: 300, sharp: 1.8, rock: ['#3c4c7c', '#232e54'], shade: '#18203f', snow: '#dfe8ff', snowShade: '#7c90cc', snowLine: 300 }));
  addLayer(scene, mid, 280, 70, -82, 13, 0.34, 0.8);
  const near = canvasTex(2048, 512, (g, w, h) => paintRange(g, w, h, { seed: 41, base: 430, amp: 240, sharp: 2.0, rough: 0.6, rock: ['#263158', '#161d3a'], shade: '#0e1430', snow: '#cfdaf8', snowShade: '#6577b8', snowLine: 290 }));
  addLayer(scene, near, 170, 42.5, -46, 7.5, 0.16, 0.5);
  const spires = canvasTex(2048, 1024, paintSpires);
  addLayer(scene, spires, 76, 38, -23, 16.5, 0.05, 0.6);

  // ---------- vesiputous ----------
  const fallMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime, uColor: { value: M.water } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime; uniform vec3 uColor; varying vec2 vUv; ${NOISE}
      void main(){
        float x = vUv.x, y = vUv.y;
        float edge = smoothstep(0.0, 0.22, x) * smoothstep(1.0, 0.78, x);
        float s1 = vnoise(vec2(x * 26.0, y * 5.0 + uTime * 2.6));
        float s2 = vnoise(vec2(x * 60.0 + 4.0, y * 11.0 + uTime * 4.2));
        float streak = s1 * 0.6 + s2 * 0.4;
        float foam = smoothstep(0.55, 0.9, streak);
        float body = 0.26 + 0.26 * streak;
        float base = smoothstep(0.2, 0.0, y);                       // kuohu alhaalla
        float lip = smoothstep(0.93, 1.0, y);
        vec3 c = uColor * (body + foam * 0.7 + base * 0.7 + lip * 0.4);
        float a = edge * (0.55 + foam * 0.45) * smoothstep(1.0, 0.97, y) + base * edge * 0.4;
        gl_FragColor = vec4(c, clamp(a, 0.0, 1.0)); ${OUT} }`,
  });
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 27), fallMat);
  fall.position.set(18.2, 13.2, -22.4); fall.renderOrder = -4; scene.add(fall);
  const fall2 = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 15), fallMat);
  fall2.position.set(-21.5, 9.5, -22.6); fall2.renderOrder = -4; scene.add(fall2);

  // ---------- maa: lumi (kimallus, kinokset, varjot) ----------
  const gg = new THREE.PlaneGeometry(170, 84, 84, 42);
  gg.rotateX(-Math.PI / 2); gg.translate(0, 0, -24);
  const gp = gg.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, groundH(gp.getX(i), gp.getZ(i)));
  gg.computeVertexNormals();
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const gU = { uSnowA: { value: M.snowCol }, uSnowB: { value: M.snowShade }, uSparkle: { value: 1 }, uTime };
  groundMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, gU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos; uniform vec3 uSnowA, uSnowB; uniform float uSparkle, uTime; ${NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float drift = fbm(vec2(vWPos.x * 0.35 + vWPos.z * 0.12, vWPos.z * 0.9));
        float fine = vnoise(vWPos.xz * 7.0);
        float tr = smoothstep(7.5, 3.0, length(vec2(vWPos.x * 0.55, vWPos.z * 1.2)));   // tallattu areena
        diffuseColor.rgb = mix(uSnowB, uSnowA, smoothstep(0.25, 0.7, drift) * 0.75 + 0.25 + fine * 0.08);
        diffuseColor.rgb *= 1.0 - tr * 0.07 * (0.5 + vnoise(vWPos.xz * 3.0));`)
      .replace('#include <opaque_fragment>', `
        { float dist = length(vViewPosition);
          vec2 gpp = vWPos.xz * 48.0; vec2 gi = floor(gpp);
          float rnd = hash21(gi);
          float sp = step(0.982, rnd) * smoothstep(0.5, 0.1, length(fract(gpp) - 0.5));
          float tw = pow(max(0.0, sin(rnd * 90.0 + uTime * 1.7 + vViewPosition.x * 2.3 + vViewPosition.y * 1.7)), 6.0);
          outgoingLight += vec3(0.85, 0.92, 1.0) * sp * tw * uSparkle * 2.6 * smoothstep(26.0, 5.0, dist); }
        #include <opaque_fragment>`);
  };
  const ground = new THREE.Mesh(gg, groundMat);
  ground.receiveShadow = true; ground.userData.noGfx = true; scene.add(ground);

  // ---------- kivet ja kallio ----------
  const r = rng(99);
  const rockMat = makeToonMaterial({ color: 0x565c78, steps: 3, snow: 0.75, rim: 0.7, flatShading: true, detail: 1 });
  const rockGeo = (rad, seed, detail = 0, sy = 0.85, j = 0.26) => {
    const rr = rng(seed);
    let g = new THREE.IcosahedronGeometry(rad, detail);
    g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 1 - j + rr() * 2 * j; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * sy, p.getZ(i) * k); }
    g.computeVertexNormals();
    return g;
  };
  const slabGeo = (rad, seed) => {          // kulmikas kalliolohkare (jalusta)
    const rr = rng(seed);
    let g = new THREE.BoxGeometry(rad * 1.5, rad * 3.2, rad * 1.5, 2, 3, 2);
    g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) / (rad * 3.2) + 0.5, k = 1.15 - t * 0.5; p.setXYZ(i, p.getX(i) * k + (rr() - 0.5) * rad * 0.5, p.getY(i) + (rr() - 0.5) * rad * 0.5, p.getZ(i) * k + (rr() - 0.5) * rad * 0.5); }
    g.computeVertexNormals();
    return g;
  };
  const staticRocks = [];
  for (let i = 0; i < 16; i++) {
    const g = rockGeo(0.7 + r() * 1.7, 100 + i);
    const x = -28 + r() * 56, z = -4.2 - r() * 11;
    if (Math.abs(x) < 7 && z > -6.5) continue;
    g.rotateY(r() * 6); g.translate(x, groundH(x, z) + 0.15, z);
    staticRocks.push(g);
  }
  const rocks = new THREE.Mesh(mergeGeometries(staticRocks), rockMat);
  rocks.castShadow = true; rocks.receiveShadow = true; scene.add(rocks);
  addOutline(rocks, { width: 0.0026 });

  // oikean reunan kallio (josta kivivyöry tulee). children[3..] ovat irtolohkareita.
  const cliff = new THREE.Group();
  const cliffDefs = [
    [15.6, 4.2, -6.9, 3.1], [13.3, 1.6, -5.0, 1.5], [18.4, 6.0, -7.8, 4.0],        // jalusta (pysyy)
    [13.6, 5.6, -5.6, 2.3], [12.2, 7.4, -4.9, 1.6], [14.6, 8.4, -6.0, 2.4], [11.4, 9.0, -5.0, 1.5],
    [13.0, 10.2, -5.6, 2.0], [10.6, 10.4, -4.6, 1.2], [15.2, 11.4, -6.4, 2.4], [12.0, 12.2, -5.2, 1.6],
  ];

  cliffDefs.forEach(([x, y, z, rad], i) => {
    const b = new THREE.Mesh(i < 3 ? slabGeo(rad, 300 + i) : rockGeo(rad, 300 + i, 0, 1.0, 0.22), rockMat);
    b.position.set(x, y, z); b.rotation.set(i < 3 ? 0 : r() * 0.6, r() * 6, i < 3 ? (r() - 0.5) * 0.16 : r() * 0.6);
    b.castShadow = true; b.userData.home = b.position.clone();
    cliff.add(b); addOutline(b, { width: 0.0028 });
  });
  scene.add(cliff); E.cliff = cliff;
  E.resetWorld = () => { for (const b of cliff.children) if (b.userData.home && b.position.y !== b.userData.home.y) b.position.copy(b.userData.home); };

  // etualan kivet (siluetti, syvyys)
  const fgGeos = [];
  for (let i = 0; i < 6; i++) { const g = rockGeo(0.9 + r() * 1.1, 500 + i); g.translate(-17 + i * 6.8 + r() * 3, -0.75, 5.0 + r() * 0.8); fgGeos.push(g); }
  const fgRocks = new THREE.Mesh(mergeGeometries(fgGeos), makeToonMaterial({ color: 0x1a2040, steps: 2, snow: 0.7, rim: 0.5, flatShading: true }));
  scene.add(fgRocks);

  // ---------- mäntymetsä (instansoitu) ----------
  const pineGeo = (() => {
    const parts = [];
    const col = (g, hex) => { const c = new THREE.Color(hex); const n = g.attributes.position.count; const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); g.deleteAttribute('uv'); return g; };
    const trunk = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 5); trunk.translate(0, 0.15, 0); parts.push(col(trunk, '#2a1c1c'));
    for (let k = 0; k < 4; k++) {
      const rad = 0.36 * (1 - k * 0.2), hh = 0.42 - k * 0.04, y = 0.22 + k * 0.2;
      const cone = new THREE.ConeGeometry(rad, hh, 7); cone.translate(0, y + hh / 2, 0); parts.push(col(cone, k % 2 ? '#16302e' : '#1b3a36'));
      const cap = new THREE.ConeGeometry(rad * 0.7, hh * 0.62, 7); cap.translate(0.012, y + hh * 0.69 + 0.012, 0.01); parts.push(col(cap, '#e6eeff'));
    }
    return mergeGeometries(parts.map(p => p.toNonIndexed()));
  })();
  const pineMat = makeToonMaterial({ color: 0xffffff, vertexColors: true, steps: 3, rim: 0.8 });
  const spots = [];
  for (let i = 0; i < 400 && spots.length < 74; i++) {
    const band = r();
    const x = -48 + r() * 96, z = band < 0.3 ? -6.5 - r() * 5 : -12 - r() * 15;
    if (Math.abs(x) < 10 && z > -11) continue;                          // areenan takana avoin näkymä vuorille
    if (x > 8 && x < 20 && z > -10) continue;                           // kallion kohta
    if (spots.some(s => Math.hypot(s[0] - x, (s[1] - z) * 1.5) < 1.7)) continue;
    spots.push([x, z, (z > -12 ? 2.0 : 2.6) + r() * 2.6]);
  }
  const pines = new THREE.InstancedMesh(pineGeo, pineMat, spots.length);
  const dm = new THREE.Object3D();
  spots.forEach(([x, z, s], i) => { dm.position.set(x, groundH(x, z) - 0.1, z); dm.scale.set(s * (0.85 + r() * 0.3), s, s * (0.85 + r() * 0.3)); dm.rotation.y = r() * 6; dm.updateMatrix(); pines.setMatrixAt(i, dm.matrix); });
  pines.userData.castShadow = false; pines.frustumCulled = false; scene.add(pines);

  // ---------- usvakerrokset (korkeussumu) ----------
  const mists = [];
  const mistDefs = [[150, 9, 3.4, -13, 1.0, 3.0], [240, 22, 8, -44.5, 0.9, 2.2], [420, 44, 15, -110, 0.8, 1.6]].slice(0, Q.mist);
  for (const [w, h, y, z, op, sc] of mistDefs) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: M.mistCol }, uOpacity: { value: op }, uBase: { value: op }, uTime, uScale: { value: sc } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity, uTime, uScale; varying vec2 vUv; ${NOISE}
        void main(){ float n = fbm(vec2(vUv.x * 9.0 * uScale + uTime * 0.03, vUv.y * 2.4 - uTime * 0.012));
          float a = pow(1.0 - vUv.y, 1.6) * smoothstep(0.0, 0.12, vUv.y) * (0.35 + 0.9 * smoothstep(0.3, 0.75, n));
          a *= smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
          gl_FragColor = vec4(uColor, a * uOpacity); ${OUT} }`,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(0, y, z); m.renderOrder = -3; scene.add(m); mists.push(mat);
  }

  // ---------- valot ----------
  const hemi = new THREE.HemisphereLight(0x9db4ff, 0x2a2438, 1.15); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xdfe8ff, 2.0);
  key.position.set(-6, 11, 8); scene.add(key); scene.add(key.target);
  const back = new THREE.DirectionalLight(0x6f9bff, 1.0);
  back.position.set(9, 5, -9); scene.add(back);
  // vanha rajapinta: level2 tweenaa E.rimLight.intensity -> tulkitaan aamunkoiton signaaliksi (mood.js)
  E.rimLight = { intensity: 0.9 };
  const setupShadows = () => {
    const on = Q.shadowSize > 0;
    E.renderer.shadowMap.enabled = on; E.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = on;
    if (on) {
      const s = key.shadow;
      if (s.mapSize.x !== Q.shadowSize) { s.mapSize.set(Q.shadowSize, Q.shadowSize); if (s.map) { s.map.dispose(); s.map = null; } }
      s.camera.left = -15; s.camera.right = 15; s.camera.top = 9; s.camera.bottom = -8; s.camera.near = 1; s.camera.far = 46;
      s.bias = -0.0006; s.normalBias = 0.03; s.radius = 2.5; s.camera.updateProjectionMatrix();
    }
    groundMat.needsUpdate = true;
  };
  setupShadows(); onQuality(setupShadows);

  // ---------- lumisade ----------
  const snow = buildSnow(scene);

  // ---------- tunnelman vienti kohtaukseen joka frame ----------
  const su = skyMat.uniforms;
  const keyPos = new THREE.Vector3(), tmp = new THREE.Vector3();
  let windX = 0;
  E.updaters.add((dt, dtr) => {
    const m = mood.cur;
    su.uStars.value = m.stars; su.uAurora.value = m.aurora; su.uCloud.value = m.clouds; su.uMoon.value = m.moon; su.uSun.value = m.sun;
    scene.fog.color.copy(m.fog); scene.fog.density = m.fogDensity;
    for (const l of layers) { l.uniforms.uTint.value.copy(m.layerTint); l.uniforms.uHaze.value.copy(m.haze); l.uniforms.uSun.value.copy(m.sunCol); l.uniforms.uSunAmt.value = m.sun; }
    for (const mm of mists) mm.uniforms.uOpacity.value = mm.uniforms.uBase.value * m.mist;
    hemi.color.copy(m.hemiSky); hemi.groundColor.copy(m.hemiGround); hemi.intensity = m.hemi;
    key.color.copy(m.key); key.intensity = m.keyI;
    keyPos.set(m.keyX, m.keyY, m.keyZ).normalize().multiplyScalar(24);
    // varjokartta seuraa kameran katsetta (areena z = 0, galleria z = -40), puolen yksikön askelin
    key.target.position.set(Math.round(E.camLook.x * 2) / 2, 0, Math.round(E.camLook.z * 2) / 2 - 1.5);
    key.position.copy(key.target.position).add(keyPos);
    back.color.copy(m.back); back.intensity = m.backI;
    toonShared.uRimColor.value.copy(m.rim); toonShared.uRimAmt.value = m.rimAmt; toonShared.uSnowColor.value.copy(m.snowCol);
    toonShared.uOutlineColor.value.copy(m.outline);
    // rim-suunta: takavalo näkymäavaruudessa
    tmp.copy(back.position).normalize().transformDirection(E.camera.matrixWorldInverse);
    toonShared.uRimDir.value.copy(tmp);
    gU.uSparkle.value = m.sparkle;
    // jälkikäsittely
    const b = post.base;
    b.bloom = m.bloom; b.exposure = m.exposure; b.sat = m.sat; b.contrast = m.contrast; b.vig = m.vig; b.grain = m.grain;
    b.lift.copy(m.lift); b.gain.copy(m.gain); b.vigColor.copy(m.vigColor); b.rays = m.rays; b.rayColor.copy(m.rayCol);
    post.sunWorld.copy(m.sun > 0.5 ? sunDir : moonDir).multiplyScalar(250);
    if (!Q.post) { E.renderer.toneMappingExposure = 1.05 * m.exposure; }
    // lumi
    const legacyWind = E.snow.uniforms.uWind.value;
    windX += dt * m.wind * legacyWind;
    snow.uniforms.uWindX.value = windX; snow.uniforms.uAmt.value = m.snowAmt; snow.uniforms.uStretch.value = m.stretch;
    snow.uniforms.uFall.value += dt * (0.8 + m.wind * 0.25);
    snow.uniforms.uTint.value.copy(m.snowCol).lerp(tmpC.set(1, 1, 1), 0.6);
  });
}
const tmpC = new THREE.Color();

function buildSnow(scene) {
  const N = Math.round(1500 * Q.particles);
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), seed = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const layer = i % 10 === 0 ? 2 : i % 3 === 0 ? 1 : 0;          // 0 = kaukana (pieni), 1 = keski, 2 = lähellä (iso, pehmeä)
    pos[i * 3] = (Math.random() - 0.5) * 56; pos[i * 3 + 1] = Math.random() * 18;
    pos[i * 3 + 2] = layer === 2 ? 1.5 + Math.random() * 6 : layer === 1 ? -5 + Math.random() * 7 : -22 + Math.random() * 17;
    seed[i * 2] = Math.random(); seed[i * 2 + 1] = layer;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 2));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: toonShared.uTime, uFall: { value: 0 }, uWindX: { value: 0 }, uAmt: { value: 0.6 }, uStretch: { value: 1 },
      uPointScale: toonShared.uPointScale, uTint: { value: new THREE.Color(1, 1, 1) }, uWind: { value: 1 } },
    vertexShader: `
      attribute vec2 seed; uniform float uTime, uFall, uWindX, uAmt, uPointScale, uStretch; varying float vA; varying float vSoft;
      void main(){
        float s = seed.x, layer = seed.y;
        vec3 p = position;
        p.y = mod(p.y - uFall * (0.7 + s * 0.9), 18.0);
        p.x = mod(p.x + uWindX * (0.55 + s * 0.9) + 28.0, 56.0) - 28.0 + sin(uTime * 1.3 + s * 40.0) * 0.35;
        p.z += sin(uTime * 0.7 + s * 17.0) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = layer > 1.5 ? 0.11 + s * 0.12 : (0.035 + s * 0.05);
        float vis = step(fract(s * 7.31), uAmt);
        gl_PointSize = min(size * uPointScale * uStretch / max(-mv.z, 0.4), 64.0) * vis;
        vA = (layer > 1.5 ? 0.3 : 0.55 + s * 0.45) * smoothstep(0.3, 1.2, -mv.z);
        vSoft = layer > 1.5 ? 1.0 : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uTint; uniform float uStretch; varying float vA; varying float vSoft;
      void main(){
        vec2 q = gl_PointCoord - 0.5;
        // tuulessa hiutale venyy viistoon viiruksi
        float cs = 0.92, sn = -0.38;
        q = vec2(q.x * cs - q.y * sn, q.x * sn + q.y * cs);
        q.y *= uStretch * uStretch;
        float d = length(q) * 2.0;
        if (d > 1.0) discard;
        float a = mix(1.0 - d, smoothstep(1.0, 0.2, d) * 0.8, vSoft);
        gl_FragColor = vec4(uTint * 1.25, a * vA); ${OUT} }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 5;
  scene.add(pts);
  E.snow = mat;
  return mat;
}
