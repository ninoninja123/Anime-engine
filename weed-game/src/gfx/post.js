// Kevyt oma jälkikäsittelyputki (ei EffectComposeria):
//   kohtaus -> HDR-kohde (MSAA) -> puoliresoluution sumennus -> kynnystetty bloom-pyramidi (dual kawase)
//   -> koostepassi: bloom, god rays, kromaattinen aberraatio, tilt-shift / syvyys-DoF, ACES-tonemap,
//      värigradaatio (varjo-/valosävy, saturaatio, kontrasti), vinjetti, filmirae, impact frame,
//      nopeuslinjat, häivytys ja iris-siirtymä, sRGB.
// Kaikki tasot ovat pieniä (1/2 .. 1/16), joten hinta mobiilissa on noin 1,3 x täysruudun täyttö.
import * as THREE from 'three';
import { Q, onQuality } from './quality.js';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const DOWN_FS = `
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2( 1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0,  1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2( 1.0,  1.0)).rgb;
  c = min(c * 0.125, vec3(10.0));
  if (uThreshold >= 0.0) {
    float l = max(c.r, max(c.g, c.b));
    c *= smoothstep(uThreshold, uThreshold + 0.55, l);
  }
  gl_FragColor = vec4(c, 1.0);
}`;

const UP_FS = `
uniform sampler2D tBase, tLow; uniform vec2 uTexel; uniform float uMix;
varying vec2 vUv;
void main(){
  vec3 lo = texture2D(tLow, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tLow, vUv + uTexel * vec2(1.0, -1.0)).rgb
          + texture2D(tLow, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tLow, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(texture2D(tBase, vUv).rgb + lo * 0.25 * uMix, 1.0);
}`;

const COMP_FS = `
uniform sampler2D tScene, tBlur, tBloom, tDepth;
uniform vec2 uBlurTexel, uSun, uCenter;
uniform float uAspect, uTime, uBloom, uExposure, uSat, uContrast, uVig, uGrain, uCA, uImpact, uTilt, uDof, uFocus,
  uNear, uFar, uRays, uFade, uIris, uSpeed, uHasDepth, uHasBloom, uFreeze;
uniform vec3 uLift, uGain, uVigColor, uRayColor;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 blur9(vec2 uv){
  vec2 t = uBlurTexel * 2.4;
  vec3 c = texture2D(tBlur, uv).rgb * 2.0;
  c += texture2D(tBlur, uv + vec2(t.x, 0.0)).rgb + texture2D(tBlur, uv - vec2(t.x, 0.0)).rgb;
  c += texture2D(tBlur, uv + vec2(0.0, t.y)).rgb + texture2D(tBlur, uv - vec2(0.0, t.y)).rgb;
  c += texture2D(tBlur, uv + t * 0.7).rgb + texture2D(tBlur, uv - t * 0.7).rgb;
  c += texture2D(tBlur, uv + vec2(t.x, -t.y) * 0.7).rgb + texture2D(tBlur, uv - vec2(t.x, -t.y) * 0.7).rgb;
  return c * 0.1;
}
void main(){
  vec2 uv = vUv; vec2 d = uv - 0.5;
  float r2 = dot(d, d);
  vec3 col;
  if (uCA > 0.0002) {
    vec2 o = d * uCA * (0.35 + r2 * 4.0);
    col = vec3(texture2D(tScene, uv + o).r, texture2D(tScene, uv).g, texture2D(tScene, uv - o).b);
  } else col = texture2D(tScene, uv).rgb;

  float blurAmt = uTilt * smoothstep(0.24, 0.5, abs(d.y));
  if (uDof > 0.01 && uHasDepth > 0.5) {
    float z = texture2D(tDepth, uv).x * 2.0 - 1.0;
    float lin = 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));
    float coc = clamp(abs(lin - uFocus) / (uFocus * 0.8 + 1.5) - 0.12, 0.0, 1.0);
    blurAmt = max(blurAmt, coc * uDof);
  }
  if (blurAmt > 0.01) col = mix(col, blur9(uv), min(blurAmt, 1.0));

  if (uHasBloom > 0.5) {
    vec3 bloom = texture2D(tBloom, uv).rgb;
    col += bloom * uBloom;
    if (uRays > 0.01) {
      vec2 stp = (uSun - uv) * 0.085;
      vec2 p = uv;
      float w = 1.0; vec3 acc = vec3(0.0);
      for (int i = 0; i < 10; i++) { p += stp; acc += texture2D(tBloom, p).rgb * w; w *= 0.86; }
      col += acc * uRayColor * (uRays * 0.12);
    }
  }

  col = aces(col * (uExposure * 1.3));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, uSat);
  col = (col - 0.5) * uContrast + 0.5;
  col *= mix(uLift, uGain, smoothstep(0.0, 0.75, l));
  col = max(col, 0.0);

  if (uFreeze > 0.01) {                                // freeze frame: anime-pysäytyskuva
    vec3 fz = mix(vec3(l), col, 0.5); fz = (fz - 0.5) * 1.4 + 0.55;
    col = mix(col, max(fz, 0.0), uFreeze);
  }
  if (uImpact > 0.01) {
    float k = smoothstep(0.28, 0.42, l);
    col = mix(col, vec3(1.0 - k) * vec3(0.92, 0.96, 1.0) + vec3(0.02, 0.02, 0.06), uImpact);
  }
  if (uSpeed > 0.01) {
    vec2 q = uv - uCenter; q.x *= uAspect;
    float a = atan(q.y, q.x) / 6.28318 * 72.0;
    float id = floor(a), f = fract(a), t = floor(uTime * 22.0);
    float h = hash(vec2(id, t)), h2 = hash(vec2(id + 31.0, t * 1.7 + 3.0));
    float wedge = smoothstep(0.5, 0.1, abs(f - 0.5) / (0.2 + 0.8 * h2));
    float start = mix(0.30, 0.62, h) / (0.65 + 0.35 * uSpeed);
    float line = step(0.6, h2) * wedge * smoothstep(start, start + 0.3, length(q));
    col = mix(col, vec3(0.94, 0.97, 1.0), line * min(uSpeed, 1.0) * 0.75);
  }
  float v = smoothstep(0.22, 0.78, length(d * vec2(1.0, 1.15)));
  col = mix(col, col * uVigColor, v * uVig);
  col *= 1.0 - uFade;
  if (uIris < 1.5) {
    vec2 q = d; q.x *= uAspect;
    col *= smoothstep(uIris, uIris - 0.03, length(q));
  }
  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  col += (hash(uv * vec2(1920.0, 1080.0) + fract(uTime) * 61.0) - 0.5) * uGrain;
  gl_FragColor = vec4(col, 1.0);
}`;

export const post = {
  ready: false,
  // tunnelman ohjaamat perusarvot (mood.js kirjoittaa)
  base: { bloom: 0.8, exposure: 1.0, sat: 1.0, contrast: 1.0, vig: 0.55, grain: 0.035,
    lift: new THREE.Color(1, 1, 1), gain: new THREE.Color(1, 1, 1), vigColor: new THREE.Color(0, 0, 0.03),
    rays: 0, rayColor: new THREE.Color(1, 0.8, 0.5) },
  sunWorld: new THREE.Vector3(0, 30, -200),
  // hetkelliset tehosteet
  ca: 0, impactT: 0, bloomKick: 0, exposureKick: 0,
  reduceFlash: false,          // saavutettavuus (Settings): impact-kehykset pois, bloom/valotus/CA-potkut 25–30 %
  speed: 0, fade: 0, iris: 2, tilt: 0, dof: 0, focus: 10, freeze: 0,
  center: new THREE.Vector2(0.5, 0.5),
  stats: { calls: 0, tris: 0 },
};

let renderer, rtScene, depthTex, levels = [], ups = [], hdrType;
let quad, fsScene, fsCam, matDown, matUp, matComp;
let W = 1, H = 1, PR = 1;
const v3 = new THREE.Vector3(), camDir = new THREE.Vector3();

function makeRT(w, h, opts = {}) {
  return new THREE.WebGLRenderTarget(Math.max(2, w | 0), Math.max(2, h | 0), {
    type: hdrType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false, ...opts,
  });
}

function build() {
  if (rtScene) { rtScene.dispose(); if (depthTex) depthTex.dispose(); }
  for (const r of levels) r.dispose(); for (const r of ups) r && r.dispose();
  levels = []; ups = []; depthTex = null; rtScene = null;
  if (!Q.post) return;
  const sw = Math.round(W * PR * Q.scale), sh = Math.round(H * PR * Q.scale);
  const o = { depthBuffer: true, samples: Q.msaa };
  if (Q.dof) { depthTex = new THREE.DepthTexture(sw, sh); depthTex.type = THREE.UnsignedIntType; o.depthTexture = depthTex; }
  rtScene = makeRT(sw, sh, o);
  let w = sw, h = sh;
  for (let i = 0; i <= Q.bloomLevels; i++) { w = Math.max(2, w >> 1); h = Math.max(2, h >> 1); levels.push(makeRT(w, h)); }
  for (let i = 1; i < Q.bloomLevels; i++) ups[i] = makeRT(levels[i].width, levels[i].height);
}

export function initPost(r) {
  renderer = r;
  const gl = r.getContext();
  const float = r.capabilities.isWebGL2 !== false && (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  hdrType = float ? THREE.HalfFloatType : THREE.UnsignedByteType;
  post.hdr = !!float;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mk = (fs, uniforms) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false });
  matDown = mk(DOWN_FS, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: -1 } });
  matUp = mk(UP_FS, { tBase: { value: null }, tLow: { value: null }, uTexel: { value: new THREE.Vector2() }, uMix: { value: 1 } });
  const b = post.base;
  matComp = mk(COMP_FS, {
    tScene: { value: null }, tBlur: { value: null }, tBloom: { value: null }, tDepth: { value: null },
    uBlurTexel: { value: new THREE.Vector2() }, uSun: { value: new THREE.Vector2(0.5, 0.5) }, uCenter: { value: post.center },
    uAspect: { value: 1 }, uTime: { value: 0 }, uBloom: { value: 1 }, uExposure: { value: 1 }, uSat: { value: 1 }, uContrast: { value: 1 },
    uVig: { value: 0.5 }, uGrain: { value: 0.03 }, uCA: { value: 0 }, uImpact: { value: 0 }, uTilt: { value: 0 }, uDof: { value: 0 },
    uFocus: { value: 10 }, uNear: { value: 0.1 }, uFar: { value: 400 }, uRays: { value: 0 }, uFade: { value: 0 }, uIris: { value: 2 },
    uSpeed: { value: 0 }, uHasDepth: { value: 0 }, uHasBloom: { value: 1 }, uFreeze: { value: 0 },
    uLift: { value: b.lift }, uGain: { value: b.gain }, uVigColor: { value: b.vigColor }, uRayColor: { value: b.rayColor },
  });
  quad = new THREE.Mesh(geo, matDown); quad.frustumCulled = false;
  fsScene = new THREE.Scene(); fsScene.add(quad);
  fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  onQuality(() => { build(); });
  post.ready = true;
}

export function setPostSize(w, h, pr) { W = w; H = h; PR = pr; build(); }

function pass(mat, target) {
  quad.material = mat;
  renderer.setRenderTarget(target);
  renderer.render(fsScene, fsCam);
}

/** Renderöi kohtauksen jälkikäsittelyn läpi. Palauttaa false, jos putki ei ole käytössä (low). */
export function renderPost(scene, camera, dtReal, time) {
  if (!Q.post || !rtScene) return false;
  renderer.info.reset();
  renderer.setRenderTarget(rtScene);
  renderer.render(scene, camera);
  post.stats.calls = renderer.info.render.calls; post.stats.tris = renderer.info.render.triangles;

  const hasBloom = Q.bloomLevels > 0;
  // 1) puoliresoluution sumea kopio (DoF/tilt-shift + bloomin lähde)
  let u = matDown.uniforms;
  u.tSrc.value = rtScene.texture; u.uTexel.value.set(0.5 / levels[0].width, 0.5 / levels[0].height); u.uThreshold.value = -1;
  pass(matDown, levels[0]);
  // 2) kynnystys + alaspäin
  for (let i = 1; i < levels.length; i++) {
    u.tSrc.value = levels[i - 1].texture; u.uTexel.value.set(1 / levels[i - 1].width, 1 / levels[i - 1].height);
    u.uThreshold.value = i === 1 ? (post.hdr ? 0.95 : 0.7) : -1;
    pass(matDown, levels[i]);
  }
  // 3) ylöspäin (tent) -> bloom = ups[1]
  let low = levels[levels.length - 1];
  for (let i = levels.length - 2; i >= 1; i--) {
    const m = matUp.uniforms;
    m.tBase.value = levels[i].texture; m.tLow.value = low.texture; m.uTexel.value.set(1 / low.width, 1 / low.height); m.uMix.value = 0.9;
    pass(matUp, ups[i]); low = ups[i];
  }
  // 4) kooste
  const c = matComp.uniforms, b = post.base;
  c.tScene.value = rtScene.texture; c.tBlur.value = levels[0].texture; c.tBloom.value = hasBloom ? low.texture : null;
  c.tDepth.value = depthTex; c.uHasDepth.value = depthTex ? 1 : 0; c.uHasBloom.value = hasBloom ? 1 : 0;
  c.uBlurTexel.value.set(1 / levels[0].width, 1 / levels[0].height);
  c.uAspect.value = W / H; c.uTime.value = time % 1000;
  c.uBloom.value = b.bloom + post.bloomKick; c.uExposure.value = b.exposure * (1 + post.exposureKick);
  c.uSat.value = b.sat; c.uContrast.value = b.contrast; c.uVig.value = b.vig; c.uGrain.value = b.grain;
  c.uCA.value = post.ca; c.uImpact.value = post.impactT > 0 && !post.reduceFlash ? 1 : 0;
  if (post.reduceFlash) { c.uBloom.value = b.bloom + post.bloomKick * 0.25; c.uExposure.value = b.exposure * (1 + post.exposureKick * 0.25); c.uCA.value = post.ca * 0.3; }   // Settings: Reduce flashing
  c.uTilt.value = post.tilt; c.uDof.value = post.dof; c.uFocus.value = post.focus;
  c.uNear.value = camera.near; c.uFar.value = camera.far;
  c.uFade.value = post.fade; c.uIris.value = post.iris; c.uSpeed.value = post.speed; c.uFreeze.value = post.freeze;
  c.uVig.value = Math.min(1, b.vig + post.freeze * 0.35);
  // aurinko/kuu ruudulla (god rays)
  let rays = 0;
  if (Q.rays && b.rays > 0.01) {
    camera.getWorldDirection(camDir);
    v3.copy(post.sunWorld).sub(camera.position);
    if (v3.dot(camDir) > 0) {
      v3.copy(post.sunWorld).project(camera);
      c.uSun.value.set(v3.x * 0.5 + 0.5, v3.y * 0.5 + 0.5);
      const off = Math.max(Math.abs(v3.x), Math.abs(v3.y));
      rays = b.rays * Math.max(0, 1 - Math.max(0, off - 1) * 1.2);
    }
  }
  c.uRays.value = rays;
  pass(matComp, null);

  // hetkellisten tehosteiden vaimennus
  post.ca *= Math.pow(0.002, dtReal); if (post.ca < 0.0003) post.ca = 0;
  post.bloomKick *= Math.pow(0.01, dtReal);
  post.exposureKick *= Math.pow(0.004, dtReal);
  if (post.impactT > 0) post.impactT -= dtReal;
  return true;
}
