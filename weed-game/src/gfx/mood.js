// Tunnelmajärjestelmä: taivas, sumu, valot, värigradaatio ja sää yhtenä "moodina", jonka välillä häivytetään.
//   setMood('dawn', 4)      – vaihda käsin (cutscenet); pysyy kunnes pelitilanne (vaihe/cutscene) muuttuu
//   mood.cur                – nykyiset interpoloidut arvot (world.js ja post.js lukevat)
//   setSeasonMoods('summer')– vuodenajan tunnelmataulu (world.js kutsuu): samat nimet, eri paletit
// Avaimet snowCol/snowShade = maan vaalea/tumma sävy (lumi tai nurmi), topCol = kivien ja puiden yläpinnan peite
// (lumi / sammal), partCol + fall = ilman hiukkaset (lumi / siitepöly), dustCol = tömähdysten pöly.
// Ohjaaja (director) valitsee perusmoodin automaattisesti pelitilasta (window.__S), joten pelilogiikan
// ei tarvitse tietää grafiikasta: vaihe 1 = kylmä sininen yö, panssari/vaihe 2 = punainen myrsky,
// vaihe 3 = revontulet, finaalin jälkeen kultainen aamunkoitto.
import * as THREE from 'three';

const BASE = {
  skyTop: '#040818', skyMid: '#13224c', skyHor: '#3a5490',
  stars: 1.0, aurora: 0.0, clouds: 0.22, cloudCol: '#1a2547',
  moon: 1.0, sun: 0.0, sunCol: '#ffc98a',
  fog: '#1c2a52', fogDensity: 0.0105, haze: '#27386a', mist: 0.55, mistCol: '#8fa6dc',
  hemiSky: '#a9b6e0', hemiGround: '#3a3850', hemi: 0.9,
  key: '#cfdcff', keyI: 1.9, keyX: -6, keyY: 11, keyZ: 8,
  back: '#6f9bff', backI: 1.0,
  rim: '#9cc0ff', rimAmt: 0.9,
  layerTint: '#ffffff', snowCol: '#bccbf0', snowShade: '#7388c4', sparkle: 1.0,
  wind: 1.0, snowAmt: 0.6, stretch: 1.0,
  bloom: 0.6, exposure: 1.0, sat: 0.94, contrast: 1.06, lift: '#eef0fb', gain: '#ffffff',
  vig: 0.6, vigColor: '#02030c', grain: 0.022, rays: 0.0, rayCol: '#bcd0ff',
  outline: '#090b18', water: '#bcd6ff',
  sunX: 0.274, sunY: 0.137, sunZ: -0.952, topCol: '#bccbf0', partCol: '#f4f7ff', fall: 1.0, dustCol: '#c8d4f2', fireflies: 0, breath: 1,
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

// ---------------------------------------------------------------- KESÄ (taso 2: Gajō, Kaibutsu)
// Aikajana taistelun mukana: kirkas kesäpäivä -> veripunainen ilta (raivo) -> ukkosmyrsky -> hämärä ja
// tulikärpäset (henget) -> tähtiyö (finaali) -> kultainen aamunkoitto.
const SUMMER_BASE = {
  ...BASE,
  skyTop: '#1a4fbc', skyMid: '#3f86e0', skyHor: '#96c6f2', stars: 0, aurora: 0, clouds: 0.3, cloudCol: '#f6f8fc',
  moon: 0, sun: 1, sunCol: '#fff0c8', sunX: -0.42, sunY: 0.62, sunZ: -0.66,
  fog: '#9cc2e4', fogDensity: 0.0055, haze: '#8fb8e0', mist: 0.1, mistCol: '#e8f2f8',
  hemiSky: '#c4dcff', hemiGround: '#566838', hemi: 0.85, key: '#fff0d0', keyI: 2.6, keyX: -5, keyY: 12, keyZ: 7,
  back: '#ffe6b0', backI: 0.9, rim: '#fff4d0', rimAmt: 0.8,
  layerTint: '#ffffff', snowCol: '#74a446', snowShade: '#467634', topCol: '#5f9038', sparkle: 1.0,
  wind: 0.5, snowAmt: 0.35, stretch: 1.0, partCol: '#fff6c8', fall: 0.12, dustCol: '#b8a880', fireflies: 0, breath: 0,
  bloom: 0.5, exposure: 0.95, sat: 1.1, contrast: 1.05, lift: '#f4f6ff', gain: '#fffaf0',
  vig: 0.42, vigColor: '#0a1408', grain: 0.018, rays: 0.5, rayCol: '#fff0c8', outline: '#1a1410', water: '#dff2ff',
};
const SUMMER_MOODS = {
  night: {},     // perustila = kesäpäivä (nimi säilyy, jotta ohjaajan logiikka on sama)
  rage: {
    skyTop: '#2a2038', skyMid: '#7a3a40', skyHor: '#ff8a50', clouds: 0.7, cloudCol: '#4a2a34', sun: 0.8, sunCol: '#ff9a5a',
    sunX: 0.3, sunY: 0.12, sunZ: -0.95, fog: '#6a4048', haze: '#8a5048', mistCol: '#c08a70', mist: 0.4,
    hemiSky: '#c0a0b0', hemiGround: '#4a3a2a', hemi: 0.75, key: '#ffd0a0', keyI: 1.8, back: '#ff5a2a', backI: 1.0, rim: '#ff6a34', rimAmt: 1.8,
    layerTint: '#c89a90', snowCol: '#7a8a48', snowShade: '#3e4a2c', topCol: '#5a6a34', wind: 2.0, snowAmt: 0.7, stretch: 1.5,
    partCol: '#ffb070', fall: 0.5, bloom: 0.7, exposure: 0.9, sat: 1.08, contrast: 1.12, lift: '#f4e0dc', gain: '#fff0e0',
    vig: 0.8, vigColor: '#200604', rays: 0.6, rayCol: '#ff9a5a',
  },
  storm: {
    skyTop: '#14101c', skyMid: '#3a2430', skyHor: '#b04a30', clouds: 0.85, cloudCol: '#2a1a22', sun: 0.5, sunCol: '#ff8a4a',
    sunX: 0.3, sunY: 0.1, sunZ: -0.95, fog: '#3a2a34', fogDensity: 0.011, haze: '#4a3038', mist: 0.6, mistCol: '#8a6a66',
    hemiSky: '#9a90b0', hemiGround: '#3a3024', hemi: 0.7, key: '#e8d0c8', keyI: 1.5, back: '#ff3a20', backI: 1.0, rim: '#ff4a28', rimAmt: 2.1,
    layerTint: '#8a7078', snowCol: '#5e7040', snowShade: '#2c3a26', topCol: '#465a2e', wind: 3.4, snowAmt: 1.0, stretch: 2.2,
    partCol: '#d8a070', fall: 0.8, bloom: 0.8, exposure: 0.9, contrast: 1.12, lift: '#eee0e4', gain: '#ffeee0',
    vig: 0.9, vigColor: '#260404', rays: 0.3, rayCol: '#ff8a4a',
  },
  grief: {
    skyTop: '#59657a', skyMid: '#8794a6', skyHor: '#c0c8d0', clouds: 0.8, cloudCol: '#9aa4b0', sun: 0.4, sunCol: '#ffffff',
    sunX: -0.1, sunY: 0.5, sunZ: -0.86, fog: '#8a96a4', haze: '#9aa6b2', mist: 0.6, mistCol: '#d0d8e0',
    hemiSky: '#c8d0dc', hemiGround: '#4a5244', hemi: 0.95, key: '#e8ecf4', keyI: 1.5, back: '#c8d4e8', backI: 0.7, rim: '#e0e8f8', rimAmt: 0.8,
    layerTint: '#c8d0d8', snowCol: '#6a8a52', snowShade: '#42603a', topCol: '#5a7a48', wind: 0.3, snowAmt: 0.3,
    bloom: 0.7, sat: 0.55, contrast: 1.0, vig: 0.75, rays: 0.5, rayCol: '#ffffff',
  },
  spirit: {
    skyTop: '#141a44', skyMid: '#4a3a78', skyHor: '#f08a6a', stars: 0.7, clouds: 0.25, cloudCol: '#6a4a70', sun: 0.35, sunCol: '#ff9a6a',
    sunX: 0.3, sunY: 0.05, sunZ: -0.95, moon: 0.6, fog: '#4a4470', fogDensity: 0.008, haze: '#5a4a78', mist: 0.5, mistCol: '#a898c8',
    hemiSky: '#9aa0e0', hemiGround: '#3a3a44', hemi: 0.8, key: '#d8d0f0', keyI: 1.6, back: '#58e0c0', backI: 1.2, rim: '#9fe8e0', rimAmt: 1.2,
    layerTint: '#9a90c0', snowCol: '#5a7a60', snowShade: '#2e4448', topCol: '#4a6a54', wind: 0.4, snowAmt: 0.25,
    partCol: '#d0ffe0', fireflies: 1, bloom: 0.95, exposure: 1.0, sat: 1.12, lift: '#e4e8ff', vig: 0.65, rays: 0,
  },
  finale: {
    skyTop: '#020512', skyMid: '#0a1c44', skyHor: '#28508a', stars: 1.8, aurora: 0.7, clouds: 0.05, sun: 0, moon: 1,
    fog: '#122650', fogDensity: 0.009, haze: '#1c3870', mist: 0.5, mistCol: '#9fd0f0', hemiSky: '#9fd0ff', hemiGround: '#2a3440', hemi: 1.1,
    key: '#cfdcff', keyI: 1.9, back: '#6ff0d0', backI: 1.6, rim: '#bff4ff', rimAmt: 1.4,
    layerTint: '#7a90c8', snowCol: '#3e6a5a', snowShade: '#1e3848', topCol: '#346050', wind: 0.25, snowAmt: 0.2,
    partCol: '#c0ffe8', fireflies: 1.5, bloom: 1.15, exposure: 1.0, sat: 1.2, contrast: 1.1, lift: '#dcecff', vig: 0.7, rays: 0.35, rayCol: '#c8e4ff',
  },
  dawn: {
    skyTop: '#27386e', skyMid: '#b0708a', skyHor: '#ffb872', stars: 0.12, clouds: 0.3, cloudCol: '#e89a7a', sun: 1, sunCol: '#ffc88a',
    sunX: 0.274, sunY: 0.137, sunZ: -0.952, fog: '#b88a8c', fogDensity: 0.008, haze: '#e0a088', mist: 0.7, mistCol: '#ffd0a8',
    hemiSky: '#c8b8e8', hemiGround: '#5a5a3a', hemi: 1.05, key: '#ffd8a8', keyI: 2.5, keyX: 7, keyY: 5, keyZ: 2,
    back: '#ffb060', backI: 2.2, rim: '#ffd9a0', rimAmt: 1.5, layerTint: '#ffd8c8',
    snowCol: '#a8b858', snowShade: '#566a48', topCol: '#8aa04a', sparkle: 1, wind: 0.3, snowAmt: 0.3, partCol: '#ffe8b0', fireflies: 0.3,
    bloom: 0.95, exposure: 1.0, sat: 1.1, contrast: 1.04, lift: '#f0e2f4', gain: '#fff2dc', vig: 0.5, vigColor: '#140a10',
    rays: 1.0, rayCol: '#ffd09a', outline: '#1a1020', water: '#ffe0c0',
  },
  memorial: {
    skyTop: '#1c2a60', skyMid: '#8a6492', skyHor: '#ffc080', stars: 0.7, aurora: 0.35, clouds: 0.2, cloudCol: '#e0a08a', sun: 1, sunCol: '#ffd09a',
    sunX: 0.274, sunY: 0.137, sunZ: -0.952, fog: '#a88498', fogDensity: 0.008, haze: '#d8a090', mist: 0.75, mistCol: '#ffd8b8',
    hemiSky: '#c8c0f0', hemiGround: '#5a5a40', key: '#ffdcb0', keyI: 2.4, keyX: 7, keyY: 5, keyZ: 2,
    back: '#ffc070', backI: 2.2, rim: '#ffe4b8', rimAmt: 1.6, layerTint: '#ffdcd0',
    snowCol: '#aebc60', snowShade: '#5a6e4e', topCol: '#90a650', wind: 0.2, snowAmt: 0.25, partCol: '#ffeec0', fireflies: 0.6,
    bloom: 1.2, exposure: 1.02, sat: 1.05, lift: '#f2e6f6', gain: '#fff4e0', vig: 0.6, vigColor: '#140a10',
    rays: 1.2, rayCol: '#ffd8a8', outline: '#1a1020', water: '#ffe0c0',
  },
};
const TABLES = { winter: { base: BASE, moods: MOODS }, summer: { base: SUMMER_BASE, moods: SUMMER_MOODS } };
let table = TABLES.winter;

const isColor = v => typeof v === 'string';
function resolve(name) {
  const o = {};
  const src = { ...table.base, ...(table.moods[name] || {}) };
  if (table === TABLES.winter && !(table.moods[name] || {}).topCol) src.topCol = src.snowCol;      // talvi: peite = lumen väri
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

/** Vaihda vuodenajan tunnelmataulu ('summer' | 'winter') ja siirry heti sen nykyiseen moodiin. */
export function setSeasonMoods(season) {
  table = TABLES[season] || TABLES.winter;
  mood.season = season;
  const t = resolve(mood.name);
  for (const k in t) { for (const o of [mood.cur, mood.from, mood.to]) { if (t[k].isColor) (o[k] || (o[k] = new THREE.Color())).copy(t[k]); else o[k] = t[k]; } }
  mood.t = 1;
}

/** Ohjaaja: päättelee perusmoodin pelitilasta. Kutsutaan joka frame (kevyt). */
let dirT = 0, menuEl = null, dawnLatch = false;
export function directMood(E, dtReal) {
  dirT -= dtReal;
  if (dirT <= 0) {
    dirT = 0.15;
    const S = window.__S;
    menuEl = menuEl || document.getElementById('menu');
    const inMenu = !S || (!S.active && !S.cutscene && menuEl && !menuEl.classList.contains('hidden'));
    const castEl = document.getElementById('castScreen');
    const inCast = castEl && !castEl.classList.contains('hidden');
    // aamunkoitto lukittuu päälle (kohtausskripti nostaa rim-valon) ja pysyy tulosruudun yli valikkoon asti
    if (E.rimLight && E.rimLight.intensity > 1.25 && S && S.phase === 3) dawnLatch = true;
    if (S && S.active && !S.cutscene) dawnLatch = false;
    const dawnSignal = dawnLatch;
    let auto = 'night', dur = 2.5;
    if (inMenu || inCast) {
      auto = 'night'; dur = 1.2; dawnLatch = false;
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
