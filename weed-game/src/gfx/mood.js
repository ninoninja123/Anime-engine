// Tunnelmajärjestelmä: taivas, sumu, valot, värigradaatio ja sää yhtenä "moodina", jonka välillä häivytetään.
//   setMood('dawn', 4)      – vaihda käsin (cutscenet); pysyy kunnes pelitilanne (vaihe/cutscene) muuttuu
//   mood.cur                – nykyiset interpoloidut arvot (world.js ja post.js lukevat)
// Ohjaaja (director) valitsee perusmoodin automaattisesti pelitilasta (window.__S), joten pelilogiikan
// ei tarvitse tietää grafiikasta: vaihe 1 = kylmä sininen yö, panssari/vaihe 2 = punainen myrsky,
// vaihe 3 = revontulet, finaalin jälkeen kultainen aamunkoitto.
import * as THREE from 'three';

const BASE = {
  skyTop: '#040818', skyMid: '#13224c', skyHor: '#3a5490',
  stars: 1.0, aurora: 0.0, clouds: 0.22, cloudCol: '#1a2547',
  moon: 1.0, sun: 0.0, sunCol: '#ffc98a',
  fog: '#1c2a52', fogDensity: 0.0105, haze: '#27386a', mist: 0.55, mistCol: '#8fa6dc',
  hemiSky: '#9db0ee', hemiGround: '#34324e', hemi: 0.9,
  key: '#cfdcff', keyI: 1.9, keyX: -6, keyY: 11, keyZ: 8,
  back: '#6f9bff', backI: 1.0,
  rim: '#9cc0ff', rimAmt: 0.9,
  layerTint: '#ffffff', snowCol: '#bccbf0', snowShade: '#7388c4', sparkle: 1.0,
  wind: 1.0, snowAmt: 0.6, stretch: 1.0,
  bloom: 0.6, exposure: 1.0, sat: 1.0, contrast: 1.05, lift: '#e9eeff', gain: '#ffffff',
  vig: 0.6, vigColor: '#02030c', grain: 0.022, rays: 0.0, rayCol: '#bcd0ff',
  outline: '#090b18', water: '#bcd6ff',
};

const MOODS = {
  night: {},
  // Kaibutsun raivo: panssari päällä, punainen hätä
  rage: {
    skyTop: '#07050f', skyMid: '#1c0f26', skyHor: '#5c1f2a', stars: 0.35, clouds: 0.55, cloudCol: '#200c18',
    fog: '#1e1426', haze: '#2c1a2c', mistCol: '#6a4a5c', hemiSky: '#8088b8', hemiGround: '#30202c', hemi: 0.72,
    key: '#dcd4e8', keyI: 1.5, back: '#ff4a2a', backI: 0.9, rim: '#ff5a34', rimAmt: 1.9,
    layerTint: '#9a8298', snowCol: '#9896b8', snowShade: '#46406c', wind: 2.2, snowAmt: 0.85, stretch: 1.6,
    bloom: 0.75, sat: 1.05, contrast: 1.1, lift: '#efe2ee', gain: '#fff2ea', vig: 0.85, vigColor: '#200306', moon: 0.6,
  },
  // vaihe 2: lumimyrsky, punavioletti
  storm: {
    skyTop: '#07050f', skyMid: '#1a1028', skyHor: '#6a2228', stars: 0.15, clouds: 0.72, cloudCol: '#1c0e1a',
    fog: '#1c1428', fogDensity: 0.014, haze: '#2a1a30', mist: 0.8, mistCol: '#644a66', hemiSky: '#7c84b8', hemiGround: '#2e1e2a', hemi: 0.7,
    key: '#d4cce4', keyI: 1.45, back: '#ff3a24', backI: 1.0, rim: '#ff4a2c', rimAmt: 2.1,
    layerTint: '#8c7a94', snowCol: '#9290b6', snowShade: '#423c68', wind: 3.4, snowAmt: 1.0, stretch: 2.3,
    bloom: 0.8, sat: 1.05, contrast: 1.12, lift: '#eee0ee', gain: '#fff0e6', vig: 0.9, vigColor: '#260306', moon: 0.35,
  },
  // suru: hiljaisuus Smithin jälkeen
  grief: {
    skyTop: '#05070f', skyMid: '#141c30', skyHor: '#3a4660', stars: 0.6, clouds: 0.4, cloudCol: '#161c2c',
    fog: '#1c2436', haze: '#2a3448', mistCol: '#9aa6c0', back: '#9db4e0', backI: 0.8, rim: '#c8d8ff', rimAmt: 0.8,
    wind: 0.35, snowAmt: 0.45, bloom: 0.85, sat: 0.55, contrast: 1.0, lift: '#e8ecf8', gain: '#f4f6ff', vig: 0.8,
    rays: 0.22, rayCol: '#c8d8ff',
  },
  // Ōun henget: neljä nuolta / vaihe 3 – syvä sininen, revontulet syttyvät
  spirit: {
    skyTop: '#030716', skyMid: '#0d2148', skyHor: '#2c5a8c', stars: 1.3, aurora: 0.6, clouds: 0.12,
    fog: '#14284e', haze: '#1f3a6a', mistCol: '#8fc0e8', hemiSky: '#8fc4ff', back: '#58e0c0', backI: 1.3, rim: '#9fe8e0', rimAmt: 1.1,
    wind: 0.5, snowAmt: 0.4, bloom: 0.95, sat: 1.15, lift: '#dff0ff', vig: 0.65,
  },
  // Battōga-finaali: tähtitaivas ja revontulet täydellä teholla
  finale: {
    skyTop: '#020512', skyMid: '#0a1c44', skyHor: '#285a90', stars: 1.8, aurora: 1.25, clouds: 0.05,
    fog: '#122650', haze: '#1c3870', mistCol: '#9fd0f0', hemiSky: '#9fd0ff', hemi: 1.25, back: '#6ff0d0', backI: 1.7, rim: '#bff4ff', rimAmt: 1.4,
    wind: 0.25, snowAmt: 0.3, bloom: 1.15, sat: 1.2, contrast: 1.1, lift: '#dcecff', vig: 0.7, rays: 0.35, rayCol: '#c8e4ff',
  },
  // kultainen aamunkoitto
  dawn: {
    skyTop: '#27386e', skyMid: '#b0708a', skyHor: '#ffb872', stars: 0.12, aurora: 0.0, clouds: 0.3, cloudCol: '#e89a7a',
    moon: 0.0, sun: 1.0, sunCol: '#ffc88a',
    fog: '#b88a8c', fogDensity: 0.009, haze: '#e0a088', mist: 0.75, mistCol: '#ffd0a8',
    hemiSky: '#c8b8e8', hemiGround: '#6a5060', hemi: 1.05, key: '#ffd8a8', keyI: 2.5, keyX: 7, keyY: 5, keyZ: 2,
    back: '#ffb060', backI: 2.6, rim: '#ffd9a0', rimAmt: 1.5,
    layerTint: '#ffd8c8', snowCol: '#f4e2dc', snowShade: '#a890c0', sparkle: 1.8, wind: 0.3, snowAmt: 0.25,
    bloom: 0.95, exposure: 1.03, sat: 1.1, contrast: 1.04, lift: '#f0e2f4', gain: '#fff2dc', vig: 0.5, vigColor: '#140a10',
    rays: 1.0, rayCol: '#ffd09a', outline: '#1a1020', water: '#ffe0c0',
  },
  // muistohetki: aamunkoitto + henkien valo
  memorial: {
    skyTop: '#1c2a60', skyMid: '#8a6492', skyHor: '#ffc080', stars: 0.7, aurora: 0.45, clouds: 0.2, cloudCol: '#e0a08a',
    moon: 0.0, sun: 1.0, sunCol: '#ffd09a',
    fog: '#a88498', fogDensity: 0.009, haze: '#d8a090', mist: 0.8, mistCol: '#ffd8b8',
    hemiSky: '#c8c0f0', hemiGround: '#6a5468', key: '#ffdcb0', keyI: 2.4, keyX: 7, keyY: 5, keyZ: 2,
    back: '#ffc070', backI: 2.6, rim: '#ffe4b8', rimAmt: 1.6,
    layerTint: '#ffdcd0', snowCol: '#f6e6e0', snowShade: '#a894c8', sparkle: 2.0, wind: 0.2, snowAmt: 0.2,
    bloom: 1.2, exposure: 1.05, sat: 1.05, lift: '#f2e6f6', gain: '#fff4e0', vig: 0.6, vigColor: '#140a10',
    rays: 1.2, rayCol: '#ffd8a8', outline: '#1a1020', water: '#ffe0c0',
  },
};

const isColor = v => typeof v === 'string';
function resolve(name) {
  const o = {};
  const src = { ...BASE, ...(MOODS[name] || {}) };
  for (const k in src) o[k] = isColor(src[k]) ? new THREE.Color(src[k]) : src[k];
  return o;
}

export const mood = {
  name: 'night', manual: null, manualKey: '',
  cur: resolve('night'), from: resolve('night'), to: resolve('night'),
  t: 1, dur: 1,
  names: Object.keys(MOODS),
};

function start(name, dur) {
  if (!MOODS[name]) return;
  const c = mood.cur, f = mood.from;
  for (const k in c) { if (c[k].isColor) f[k].copy(c[k]); else f[k] = c[k]; }
  mood.to = resolve(name); mood.name = name; mood.t = 0; mood.dur = Math.max(0.001, dur);
}

let ctxKey = '';
/** Vaihda tunnelma käsin. Pysyy voimassa, kunnes pelitilanne (vaihe / cutscene / valikko) vaihtuu. */
export function setMood(name, dur = 2) {
  if (!MOODS[name]) return;
  mood.manual = name; mood.manualKey = ctxKey;
  if (mood.name !== name) start(name, dur);
}
export function clearMood() { mood.manual = null; }

/** Ohjaaja: päättelee perusmoodin pelitilasta. Kutsutaan joka frame (kevyt). */
let dirT = 0, menuEl = null;
export function directMood(E, dtReal) {
  dirT -= dtReal;
  if (dirT <= 0) {
    dirT = 0.15;
    const S = window.__S;
    menuEl = menuEl || document.getElementById('menu');
    const inMenu = !S || (!S.active && !S.cutscene && menuEl && !menuEl.classList.contains('hidden'));
    const castEl = document.getElementById('castScreen');
    const inCast = castEl && !castEl.classList.contains('hidden');
    const dawnSignal = E.rimLight && E.rimLight.intensity > 1.2;
    let auto = 'night', dur = 2.5;
    if (inMenu || inCast) {
      auto = 'night'; dur = 1.2;
      if (E.rimLight) E.rimLight.intensity = 0.9;
      if (E.snow) E.snow.uniforms.uWind.value = 1;
      if (E.resetWorld) E.resetWorld();
    } else if (S) {
      if (dawnSignal) { auto = 'dawn'; dur = 5; }
      else if (S.phase === 1) { auto = S.B && S.B.armored ? 'rage' : 'night'; dur = 1.2; }
      else if (S.phase === 2) { auto = 'storm'; dur = 2.5; }
      else if (S.phase === 3) { auto = 'spirit'; dur = 2; }
    }
    const key = inMenu || inCast ? 'menu' : S ? `${S.phase}|${S.B && S.B.armored}|${S.cutscene}|${S.active}|${dawnSignal}` : 'x';
    if (key !== ctxKey) { ctxKey = key; if (mood.manual && mood.manualKey !== key) mood.manual = null; }
    const want = mood.manual || auto;
    if (want !== mood.name) start(want, dur);
  }
  // interpolointi
  if (mood.t < 1) {
    mood.t = Math.min(1, mood.t + dtReal / mood.dur);
    const k = mood.t * mood.t * (3 - 2 * mood.t);
    const c = mood.cur, f = mood.from, t = mood.to;
    for (const key in c) {
      if (c[key].isColor) c[key].copy(f[key]).lerp(t[key], k);
      else c[key] = f[key] + (t[key] - f[key]) * k;
    }
  }
}
