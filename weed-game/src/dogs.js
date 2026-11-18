// Koirat: yksi rigattu perusmalli (Quaternius ShibaInu, CC0), josta kaikki hahmot tehdään
// kloonaamalla + vaihtamalla värit, mittakaava, korvat ja lisäosat (harja, heikko kohta).
// Huom: hahmot ovat omia tyyliteltyjä koiria, eivät kopioi animen hahmosuunnittelua.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { E } from './engine.js';

let base = null;
let NORM = 1;           // skaala, jolla perusmallin korkeus = 1 yksikkö
let palette = null;     // alkuperäisen palettitekstuurin pikselit
let palW = 0, palH = 0;
const FACING_FIX = Math.PI / 2; // malli katsoo +Z:aan -> käännetään +X:ään (sivunäkymä)

// Hahmomäärittelyt (värit hex, mittakaava, korvien koko)
export const CHARS = {
  weed:     { name: 'Weed',     fur: '#f3efe6', light: '#ffffff', dark: '#2b2622', scale: 0.78, ear: 1.05, speed: 1.15 },
  gin:      { name: 'Gin',      fur: '#aeb8c4', light: '#e9eef3', dark: '#22262c', scale: 1.22, ear: 1.0 },
  smith:    { name: 'Smith',    fur: '#b3b0aa', light: '#e2ded6', dark: '#2e2c2a', scale: 0.98, ear: 0.85, threeLegs: true },
  jerome:   { name: 'Jerome',   fur: '#a9733a', light: '#d6a463', dark: '#1f1912', scale: 1.12, ear: 1.45 },
  ken:      { name: 'Ken',      fur: '#6f737c', light: '#9da2ab', dark: '#1d1e22', scale: 1.3, ear: 0.75 },
  kagetora: { name: 'Kagetora', fur: '#3e322b', light: '#7a6150', dark: '#16110e', scale: 1.0, ear: 1.0 },
  robert:   { name: 'Robert',   fur: '#5b4630', light: '#a07a4c', dark: '#151009', scale: 1.08, ear: 1.4 },
  rocker:   { name: 'Rocker',   fur: '#2d2925', light: '#8e7552', dark: '#0f0d0b', scale: 1.06, ear: 1.4 },
  heuler:   { name: 'Heuler',   fur: '#7d6a55', light: '#b9a283', dark: '#1a1510', scale: 1.1, ear: 1.4 },
  kaibutsu: { name: 'Kaibutsu', fur: '#a8814a', light: '#c9a46c', dark: '#1a0f08', scale: 2.75, ear: 0.55, monster: true },
};

export async function loadDogBase(url) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  base = await loader.loadAsync(url);
  base.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(base.scene, true);
  NORM = 1 / Math.max(box.max.y - box.min.y, 0.001);

  // luetaan paletti
  let tex = null;
  base.scene.traverse(o => { if (o.isMesh && o.material.map) tex = o.material.map; });
  if (tex && tex.image) {
    const img = tex.image;
    palW = img.width; palH = img.height;
    const c = document.createElement('canvas'); c.width = palW; c.height = palH;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    palette = g.getImageData(0, 0, palW, palH);
  }
  return base;
}

export function clipNames() { return base.animations.map(a => a.name); }

const gradientMap = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 225, 225, 225, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

const texCache = {};
function recolorTexture(id) {
  if (texCache[id]) return texCache[id];
  const c = CHARS[id];
  const fur = new THREE.Color(c.fur), light = new THREE.Color(c.light), dark = new THREE.Color(c.dark);
  const cv = document.createElement('canvas'); cv.width = palW; cv.height = palH;
  const g = cv.getContext('2d');
  const out = g.createImageData(palW, palH);
  const hsl = {};
  for (let i = 0; i < palette.data.length; i += 4) {
    const r = palette.data[i] / 255, gg = palette.data[i + 1] / 255, b = palette.data[i + 2] / 255;
    const col = new THREE.Color(r, gg, b); col.getHSL(hsl);
    let o;
    if (hsl.l < 0.09) o = dark.clone().lerp(new THREE.Color(0, 0, 0), 0.4);       // silmät/kirsu
    else if (hsl.l < 0.28) o = dark.clone().lerp(fur, 0.25);                         // tummat kohdat
    else if (hsl.s > 0.2 && hsl.h < 0.15) o = fur.clone().multiplyScalar(0.7 + hsl.l * 0.6); // turkki
    else if (hsl.l > 0.8) o = light.clone();                                         // vatsa/rinta
    else o = fur.clone().lerp(light, 0.5).multiplyScalar(0.85 + hsl.l * 0.2);        // välisävy
    out.data[i] = Math.min(255, o.r * 255); out.data[i + 1] = Math.min(255, o.g * 255);
    out.data[i + 2] = Math.min(255, o.b * 255); out.data[i + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.flipY = false; t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  texCache[id] = t;
  return t;
}

// Inverted hull -ääriviiva skinnatulle meshille (cel-look)
function outlineMaterial(width) {
  const m = new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <skinning_vertex>',
      `#include <skinning_vertex>\n transformed += normalize(objectNormal) * ${width.toFixed(4)};`);
  };
  return m;
}

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

export class Dog {
  constructor(id) {
    const c = CHARS[id];
    this.id = id; this.def = c; this.name = c.name;
    this.root = new THREE.Group();            // sijainti maailmassa
    this.turn = new THREE.Group();            // suunta (vasen/oikea)
    this.spin = new THREE.Group();            // Battōga-pyörähdys keskipisteen ympäri
    this.root.add(this.turn); this.turn.add(this.spin);
    const s = NORM * c.scale;
    this.height = c.scale;
    this.spin.position.y = 0.5 * this.height;

    const model = SkeletonUtils.clone(base.scene);
    model.scale.setScalar(s);
    model.rotation.y = FACING_FIX;
    model.position.y = -0.5 * this.height;
    this.spin.add(model);
    this.model = model;

    const tex = recolorTexture(id);
    this.mat = new THREE.MeshToonMaterial({ map: tex, gradientMap, side: THREE.DoubleSide });
    this.mat.emissive = new THREE.Color(0x000000);
    const meshes = [];
    model.traverse(o => { if (o.isSkinnedMesh) meshes.push(o); });
    for (const o of meshes) {
      o.material = this.mat; o.frustumCulled = false;
      const ol = new THREE.SkinnedMesh(o.geometry, outlineMaterial(c.monster ? 0.012 : 0.02));
      ol.bind(o.skeleton, o.bindMatrix); ol.frustumCulled = false;
      o.parent.add(ol);
      this.outline = ol;
    }
    this.bones = {};
    // GLTFLoader poistaa pisteet nimistä (Ear1.L -> Ear1L): tallennetaan molemmat muodot
    model.traverse(o => { if (o.isBone) { this.bones[o.name] = o; this.bones[o.name.replace(/\./g, '')] = o; } });

    // varjo (pehmeä läiskä)
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.01; sh.scale.set(c.scale * 1.3, c.scale * 0.55, 1);
    this.root.add(sh); this.shadow = sh;

    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const clip of base.animations) this.actions[clip.name] = this.mixer.clipAction(clip);
    this.current = null;
    this.facing = 1; this.facingTarget = 1;
    this.t = Math.random() * 10;
    this.wag = id === 'kaibutsu' ? 0.15 : 0.5;
    this.earPerk = 0;
    this.visible = true;

    model.updateMatrixWorld(true);
    if (c.monster) this._makeMonster();
    this.play('Idle');
  }

  _makeMonster() {
    // Harja: ryhmä kartioita kaulan ympärille (leijonamainen)
    const neck = this.bones['Neck2'] || this.bones['Neck1'];
    const head = this.bones['Head'];
    this.root.updateMatrixWorld(true);
    const np = new THREE.Vector3(); neck.getWorldPosition(np);
    const hp = new THREE.Vector3(); head.getWorldPosition(hp);
    const mane = new THREE.Group();
    const maneMat = new THREE.MeshToonMaterial({ color: 0x4a2a14, gradientMap });
    const olMat = new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide });
    const N = 26;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const ringK = i % 2;
      const len = (0.6 + Math.random() * 0.4) * (ringK ? 0.8 : 1.1);
      const geo = new THREE.ConeGeometry(0.2, len, 5);
      geo.translate(0, len / 2, 0);
      const cone = new THREE.Mesh(geo, maneMat);
      const ol = new THREE.Mesh(geo, olMat); ol.scale.setScalar(1.08); cone.add(ol);
      // säteittäin kaulan ympäri (kaula kulkee x-akselia pitkin, koska malli katsoo +X)
      cone.position.set(ringK * 0.18, Math.cos(a) * 0.36, Math.sin(a) * 0.36);
      cone.rotation.x = a - Math.PI / 2;
      cone.rotateZ(0.7); // kallistus taaksepäin
      mane.add(cone);
    }
    mane.position.copy(np).lerp(hp, 0.35);
    this.root.add(mane);
    neck.attach(mane);
    this.mane = mane;

    // Heikko kohta: karvaton alue VASEMMASSA kyljessä (= -Z, kun katsoo +X)
    const torso = this.bones['Torso'] || this.bones['Back'];
    const tp = new THREE.Vector3(); torso.getWorldPosition(tp);
    const w = this.height * 0.2;
    const patchMat = new THREE.MeshToonMaterial({ color: 0xb98a7a, gradientMap, emissive: 0x000000 });
    const patch = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), patchMat);
    patch.scale.set(0.42, 0.3, 0.06);
    patch.position.set(tp.x + 0.15, tp.y - 0.02, -w);
    this.root.add(patch);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xff5a3c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(1.6);
    glow.position.copy(patch.position).add(new THREE.Vector3(0, 0, -0.15));
    this.root.add(glow);
    torso.attach(patch); torso.attach(glow);
    this.weak = patch; this.weakGlow = glow;
    this.weakReveal = 0;

    // Hehkuvat silmät
    const eyeMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffb030, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const H = this.height;
    const eyes = new THREE.Group();
    for (const zs of [-1, 1]) {
      const e = new THREE.Sprite(eyeMat); e.scale.setScalar(0.09 * H);
      e.position.set(0.075 * H, 0.025 * H, zs * 0.04 * H); eyes.add(e);
    }
    eyes.position.copy(hp);
    this.root.add(eyes); head.attach(eyes);
    this.eyes = { material: eyeMat, scale: { setScalar: v => eyes.children.forEach(c => c.scale.setScalar(v * 0.18 * H)) } };
  }

  get x() { return this.root.position.x; }
  set x(v) { this.root.position.x = v; }

  play(name, { loop = true, fade = 0.18, timeScale = 1, clamp = false } = {}) {
    const a = this.actions[name];
    if (!a) return;
    if (this.current === a && loop) { a.timeScale = timeScale; return a; }
    a.reset();
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    a.clampWhenFinished = clamp || !loop;
    a.timeScale = timeScale;
    a.enabled = true;
    if (this.current && this.current !== a) a.crossFadeFrom(this.current, fade, false);
    a.play();
    this.current = a; this.currentName = name;
    return a;
  }

  /** Soita kertaluonteinen animaatio ja palaa looppiin. */
  oneShot(name, back = 'Idle', timeScale = 1) {
    const a = this.play(name, { loop: false, timeScale });
    if (!a) return Promise.resolve();
    const dur = a.getClip().duration / timeScale;
    return new Promise(res => {
      setTimeoutGame(dur * 0.92, () => { if (this.current === a && back) this.play(back); res(); });
    });
  }

  face(dir, instant = false) {
    this.facingTarget = dir;
    if (instant) { this.facing = dir; this.turn.rotation.y = dir > 0 ? 0 : Math.PI; }
  }

  setTint(hex, amt) { this.mat.emissive.setHex(hex); this.mat.emissiveIntensity = amt; }

  /** Häivytys (0..1) – käytetään kaatuneiden toverien hiljaiseen poistumiseen. */
  fade(op) {
    for (const m of [this.mat, this.outline && this.outline.material]) {
      if (!m) continue;
      m.transparent = op < 1; m.opacity = op; m.depthWrite = op >= 1;
    }
    this.shadow.material.opacity = 0.35 * op;
    this.root.visible = op > 0.01;
  }

  update(dt) {
    this.t += dt;
    this.mixer.update(dt);
    // käännös
    const targetRot = this.facingTarget > 0 ? 0 : Math.PI;
    this.turn.rotation.y += (targetRot - this.turn.rotation.y) * Math.min(1, dt * 10);
    // proseduraaliset lisäykset: häntä + korvat
    const b = this.bones;
    if (b.Tail1) b.Tail1.rotation.x += Math.sin(this.t * 9) * this.wag * 0.6;
    if (b.Tail2) b.Tail2.rotation.x += Math.sin(this.t * 9 - 0.8) * this.wag * 0.5;
    const es = this.def.ear;
    for (const n of ['Ear1L', 'Ear1R']) if (b[n]) b[n].scale.setScalar(es);
    if (b.Ear2L) b.Ear2L.rotation.z += Math.sin(this.t * 1.7) * 0.06 + this.earPerk * 0.3;
    if (b.Ear2R) b.Ear2R.rotation.z -= Math.sin(this.t * 1.9) * 0.06 + this.earPerk * 0.3;
    if (this.def.threeLegs && b.FrontUpperLegL) { b.FrontUpperLegL.scale.setScalar(0.001); if (b.FrontShoulderL) b.FrontShoulderL.scale.setScalar(0.55); }
    if (this.weak) {
      const pulse = 0.6 + Math.sin(this.t * 8) * 0.4;
      this.weakGlow.material.opacity = this.weakReveal * pulse;
      this.weak.material.emissive.setRGB(this.weakReveal * 0.9 * pulse, this.weakReveal * 0.25 * pulse, 0.05 * this.weakReveal);
    }
  }
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

export function makeDog(id) { return new Dog(id); }
export { glowTexture, gradientMap };
