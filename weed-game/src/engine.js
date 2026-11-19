// Moottorin runko: renderöijä, kamera, pelisilmukka, tweenit, aikaskaala (slow-mo), ohitus.
// Renderöinti: laatutasot (gfx/quality.js), oma jälkikäsittelyputki (gfx/post.js), tunnelma (gfx/mood.js),
// cel-varjostuksen automaattinen päivitys (gfx/toon.js), elokuvakamera (tärinä, käsivara, rack focus).
import * as THREE from 'three';
import { Q, onQuality, refineWithRenderer, monitorFrame } from './gfx/quality.js';
import { post, initPost, setPostSize, renderPost } from './gfx/post.js';
import { directMood, mood, setMood } from './gfx/mood.js';
import { toonShared, upgradeScene, outlineHulls } from './gfx/toon.js';
import { initUiFx } from './gfx/uifx.js';

const params = new URLSearchParams(location.search);

export const E = {
  renderer: null, scene: null, camera: null,
  timeScale: 1,          // pelin aikaskaala (slow-mo)
  time: 0, realTime: 0,
  skipping: false,       // cutscenen ohitus: tweenit/odotukset päättyvät heti
  camPos: new THREE.Vector3(0, 2.6, 11.5),
  camLook: new THREE.Vector3(0, 1.3, 0),
  camRoll: 0,
  shakeAmt: 0,
  fovKick: 0,            // hetkellinen zoomaus iskuissa (asteina, vaimenee itsestään)
  updaters: new Set(),
  get lowFx() { return Q.tier === 'low'; },
  quality: Q, post, mood, setMood,
  cine: false,
  stats: { calls: 0, tris: 0 },
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

export function shake(a) {
  E.shakeAmt = Math.max(E.shakeAmt, a);
  E.fovKick = Math.max(E.fovKick, Math.min(3.5, a * 4));
  post.ca = Math.max(post.ca, Math.min(0.02, a * 0.016));
}

export function initEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !Q.post, powerPreference: 'high-performance', alpha: false, stencil: false });
  E.renderer = renderer;
  refineWithRenderer(renderer);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.info.autoReset = false;
  initPost(renderer);

  E.scene = new THREE.Scene();
  E.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 400);
  let baseFov = 40;

  const applyQuality = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, Q.maxDpr) * (Q.post ? 1 : Q.scale);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    // jälkikäsittely tekee tonemapin itse; ilman sitä (low) renderöijä hoitaa
    renderer.toneMapping = Q.post ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    E.camera.aspect = w / h;
    baseFov = w / h < 1.3 ? 58 : 40;      // kapeassa ruudussa (pysty) kauemmas, jotta areena mahtuu
    E.camera.fov = baseFov;
    E.camera.updateProjectionMatrix();
    setPostSize(w, h, dpr);
    const bufH = h * dpr * (Q.post ? Q.scale : 1);
    toonShared.uPointScale.value = bufH / (2 * Math.tan(THREE.MathUtils.degToRad(baseFov) / 2));
    toonShared.uAspect.value = w / h;
    document.body.classList.toggle('gfx-post', Q.post);
    document.body.dataset.gfx = Q.tier;
  };
  window.addEventListener('resize', applyQuality);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', applyQuality);   // mobile browser bars hide/show
  window.addEventListener('orientationchange', () => setTimeout(applyQuality, 250));
  onQuality(applyQuality);
  applyQuality();

  // cutscene-tila (body.cine) -> letterbox on CSS:ssä; tässä häivytys leikkauksessa ja syväterävyys
  new MutationObserver(() => {
    const c = document.body.classList.contains('cine');
    if (c !== E.cine) { E.cine = c; post.fade = Math.max(post.fade, 0.85); }
    E.freeze = document.body.classList.contains('freeze');
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  initUiFx(E);

  const clock = new THREE.Clock();
  let fpsAcc = 0, fpsN = 0, scanT = 0, focus = 10, lastFov = baseFov, wasPlaying = null, irisT = -1;
  const look = new THREE.Vector3(), olPos = new THREE.Vector3();
  let olWasCulled = false;
  const portraitMq = matchMedia('(orientation: portrait) and (max-width: 900px)');   // same rule as #rotate in style.css
  E.fps = 60;
  const loop = () => {
    requestAnimationFrame(loop);
    const dtReal = Math.min(clock.getDelta(), 0.05);
    const dt = dtReal * E.timeScale;
    E.time += dt; E.realTime += dtReal;
    toonShared.uTime.value = E.realTime % 3600;
    fpsAcc += dtReal; fpsN++;
    if (fpsAcc > 1) { E.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
    monitorFrame(dtReal, document.hidden);

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
    directMood(E, dtReal);
    for (const u of E.updaters) u(dt, dtReal);

    // uudet objektit: cel-varjostus, ääriviivat, varjot (halpa, 2 x sekunnissa)
    scanT -= dtReal;
    if (scanT <= 0) { scanT = 0.5; upgradeScene(E.scene, Q.shadowSize > 0, Q.texMax); }

    // ---------- kamera ----------
    const cam = E.camera, T = E.realTime;
    cam.position.copy(E.camPos);
    look.copy(E.camLook);
    if (E.cine) {
      // käsivarakameran hengitys cutsceneissä
      cam.position.x += Math.sin(T * 0.63) * 0.035 + Math.sin(T * 1.31) * 0.012;
      cam.position.y += Math.sin(T * 0.47 + 1.3) * 0.022;
      look.x += Math.sin(T * 0.41 + 0.6) * 0.025; look.y += Math.sin(T * 0.53) * 0.016;
    }
    let roll = E.camRoll;
    if (E.shakeAmt > 0.001) {
      const a = E.shakeAmt;
      cam.position.x += (Math.sin(T * 91.7) + Math.sin(T * 53.3 + 1.7)) * 0.42 * a;
      cam.position.y += (Math.sin(T * 83.1 + 0.4) + Math.sin(T * 47.9)) * 0.42 * a;
      roll += Math.sin(T * 71.3) * 0.03 * a;
      E.shakeAmt *= Math.pow(0.02, dtReal);
    }
    cam.lookAt(look);
    if (roll) cam.rotateZ(roll);
    E.fovKick *= Math.pow(0.004, dtReal);
    const fov = baseFov - (E.fovKick > 0.02 ? E.fovKick : 0);
    if (Math.abs(fov - lastFov) > 0.005) { cam.fov = lastFov = fov; cam.updateProjectionMatrix(); }

    // ---------- jälkikäsittelyn kuvakerronta ----------
    const fd = E.camPos.distanceTo(E.camLook);
    focus += (fd - focus) * Math.min(1, dtReal * 3.2);          // rack focus kameraleikkauksissa
    post.focus = focus;
    const wantDof = E.cine ? THREE.MathUtils.clamp((9.5 - fd) / 5, 0.15, 1) : 0;
    post.dof += (wantDof - post.dof) * Math.min(1, dtReal * 4);
    const wantTilt = E.cine ? 0.5 : 0;
    post.tilt += (wantTilt - post.tilt) * Math.min(1, dtReal * 3);
    post.freeze += ((E.freeze ? 1 : 0) - post.freeze) * Math.min(1, dtReal * 18);
    post.fade *= Math.pow(0.0015, dtReal); if (post.fade < 0.004) post.fade = 0;
    // iris-siirtymä, kun taso alkaa tai päättyy
    const S = window.__S, playing = !!(S && (S.active || S.cutscene));
    if (wasPlaying !== null && playing !== wasPlaying) irisT = 0;
    wasPlaying = playing;
    if (irisT >= 0) {
      irisT += dtReal;
      post.iris = EASE.out(Math.min(1, irisT / 0.9)) * 1.4;
      if (irisT >= 0.9) { irisT = -1; post.iris = 2; }
    }

    // ääriviivakuoret: kaukana kuori on ~1 px mutta tuplaa skinnauksen ja kolmiot -> pois (low: vain lähikuvissa)
    if (Q.olDist > 0) {
      const d2 = Q.olDist * Q.olDist;
      for (const ol of outlineHulls) {
        if (!ol.parent) { outlineHulls.delete(ol); continue; }
        ol.getWorldPosition(olPos);
        const near = olPos.distanceToSquared(cam.position) < d2 * (ol.visible ? 1.1 : 1);   // small hysteresis
        ol.visible = near;
      }
      olWasCulled = true;
    } else if (olWasCulled) { for (const ol of outlineHulls) ol.visible = true; olWasCulled = false; }

    const portraitBlock = portraitMq.matches && !document.body.classList.contains('ignorerotate');   // "Turn your phone" overlay covers the game
    if (E.noRender || portraitBlock || document.hidden) { /* fullscreen overlay (prologue / rotate prompt): skip the 3D render */ }
    else if (!renderPost(E.scene, cam, dtReal, E.realTime)) {
      renderer.info.reset();
      renderer.setRenderTarget(null);
      renderer.render(E.scene, cam);
      post.stats.calls = renderer.info.render.calls; post.stats.tris = renderer.info.render.triangles;
    }
    E.stats = post.stats;
  };
  requestAnimationFrame(loop);
}
