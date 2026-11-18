// Moottorin runko: renderöijä, kamera, pelisilmukka, tweenit, aikaskaala (slow-mo), ohitus.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const params = new URLSearchParams(location.search);

export const E = {
  renderer: null, scene: null, camera: null, composer: null, bloom: null,
  timeScale: 1,          // pelin aikaskaala (slow-mo)
  time: 0, realTime: 0,
  skipping: false,       // cutscenen ohitus: tweenit/odotukset päättyvät heti
  camPos: new THREE.Vector3(0, 2.6, 11.5),
  camLook: new THREE.Vector3(0, 1.3, 0),
  camRoll: 0,
  shakeAmt: 0,
  updaters: new Set(),
  lowFx: params.has('lowfx'),
  params,
};

const tweens = [];
const timers = [];

export const EASE = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

/** Tweenaa objektin numeerisia kenttiä. Palauttaa lupauksen. */
export function tween(obj, to, dur, opts = {}) {
  const { ease = 'inOut', real = false, onUpdate } = opts;
  return new Promise(resolve => {
    const from = {};
    for (const k in to) from[k] = obj[k];
    tweens.push({ obj, from, to, dur: Math.max(dur, 0.0001), t: 0, ease: EASE[ease] || ease, real, onUpdate, resolve });
  });
}

/** Odota pelin aikaa (real=true: todellista aikaa, slow-mo ei vaikuta). */
export function wait(s, real = false) {
  return new Promise(resolve => timers.push({ t: s, real, resolve }));
}

export function shake(a) { E.shakeAmt = Math.max(E.shakeAmt, a); }

export function initEngine(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, E.lowFx ? 1.25 : 1.75);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  E.renderer = renderer;

  E.scene = new THREE.Scene();
  E.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 400);

  if (!E.lowFx) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(E.scene, E.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.55, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    E.composer = composer; E.bloom = bloom;
  }

  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    E.camera.aspect = w / h;
    // kapeassa ruudussa (pysty) kauemmas, jotta areena mahtuu
    E.camera.fov = w / h < 1.3 ? 58 : 40;
    E.camera.updateProjectionMatrix();
    if (E.composer) E.composer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
  onResize();

  const clock = new THREE.Clock();
  let fpsAcc = 0, fpsN = 0;
  E.fps = 60;
  const loop = () => {
    const dtReal = Math.min(clock.getDelta(), 0.05);
    const dt = dtReal * E.timeScale;
    E.time += dt; E.realTime += dtReal;
    fpsAcc += dtReal; fpsN++;
    if (fpsAcc > 1) { E.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

    // ajastimet
    for (let i = timers.length - 1; i >= 0; i--) {
      const tm = timers[i];
      tm.t -= tm.real ? dtReal : dt;
      if (tm.t <= 0 || E.skipping) { timers.splice(i, 1); tm.resolve(); }
    }
    // tweenit
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += tw.real ? dtReal : dt;
      let k = E.skipping ? 1 : Math.min(tw.t / tw.dur, 1);
      const e = tw.ease(k);
      for (const key in tw.to) tw.obj[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * e;
      if (tw.onUpdate) tw.onUpdate(e);
      if (k >= 1) { tweens.splice(i, 1); tw.resolve(); }
    }
    for (const u of E.updaters) u(dt, dtReal);

    // kamera + tärinä
    const cam = E.camera;
    cam.position.copy(E.camPos);
    if (E.shakeAmt > 0.001) {
      cam.position.x += (Math.random() - 0.5) * E.shakeAmt;
      cam.position.y += (Math.random() - 0.5) * E.shakeAmt;
      E.shakeAmt *= Math.pow(0.02, dtReal);
    }
    cam.lookAt(E.camLook);
    if (E.camRoll) cam.rotateZ(E.camRoll);

    if (E.noRender) { /* fullscreen 2D overlay (prologue) covers the view: skip the 3D render */ }
    else if (E.composer) E.composer.render(); else renderer.render(E.scene, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
