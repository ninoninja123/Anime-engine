// Äänimoottori: Epidemic Sound -musiikki ja -tehosteet (public/audio/), ladataan laiskasti.
//  - musiikki ristiinhäivytetään vaiheiden mukaan: intro -> battle -> sad -> dawn
//  - duck(): musiikki hiljenee repliikkien ja isojen iskujen ajaksi
//  - jos tiedosto puuttuu tai lataus epäonnistuu, käytetään vanhaa WebAudio-synteesiä varalla
// Selaimen autoplay-sääntö: AudioContext luodaan vasta käyttäjän ensimmäisestä napautuksesta (initAudio).
import { E } from './engine.js';
import { SOUNDS, EVENTS, AMBIENCE, AMB_FILES, CATEGORIES, filesOfGroup } from './data/sfx_map.js';

let analyser = null, anaBuf = null;
let ctx = null, master = null, musicBus = null, duckGain = null, sfxBus = null, voiceBus = null, synthMusic = null;
export let muted = false;
const NO_FILES = E.params.has('synthaudio');

const AUDIO_BASE = () => new URL('audio/', window.ASSET_BASE || document.baseURI).href;
export const MUSIC_FILES = { intro: 'mus_intro_user.mp3', battle: 'mus_battle.mp3', sad: 'mus_sad.mp3', dawn: 'mus_dawn.mp3', smith: 'mus_smith_theme.mp3', smith2: 'mus_smith_theme2.mp3' };
const MUSIC_VOL = { intro: 0.55, battle: 0.5, sad: 0.6, dawn: 0.6, smith: 0.6, smith2: 0.6 };
const MUSIC_LOOP = { intro: true, battle: true, sad: false, dawn: false, smith: false, smith2: false };
export const SFX_FILES = {
  bite: 'sfx_bite.mp3', hit: 'sfx_hit.mp3', roar: 'sfx_roar.mp3', rock: 'sfx_rock.mp3', rumble: 'sfx_rockslide.mp3',
  whoosh: 'sfx_whoosh.mp3', boom: 'sfx_battoga.mp3', spirit: 'sfx_spirit.mp3', bark: 'sfx_bark.mp3', hurt: 'sfx_hurt.mp3',
  wind: 'sfx_ambience.mp3',   // myöhäissyksy: tuuli + kuivat lehdet, korpit kaukana (käyttäjän päätös + canon: ei lunta)
};
const SFX_VOL = { bite: 0.9, hit: 0.8, roar: 0.9, rock: 0.8, rumble: 1, whoosh: 0.55, boom: 1, spirit: 0.7, bark: 0.6, hurt: 0.6, wind: 0.4 };

const buffers = {};     // tiedosto -> AudioBuffer | null (epäonnistui)
const loading = {};
export const audioStats = { loaded: [], failed: [] };

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
    duckGain = ctx.createGain(); duckGain.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 1; musicBus.connect(duckGain);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1; voiceBus.connect(master);
    analyser = ctx.createAnalyser(); analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.3;
    voiceBus.connect(analyser); anaBuf = new Float32Array(analyser.fftSize);
    synthMusic = ctx.createGain(); synthMusic.gain.value = 0.35; synthMusic.connect(duckGain);
  } catch (e) { ctx = null; return; }
  initSfxBuses();
  // esilataa ydintehosteet (isku/purenta/askel/UI) + valikon musiikki; boss/cine/ambienssi kun niitä tarvitaan
  preloadSfx('core');
  load(MUSIC_FILES.intro);
  if (pendingMusic !== undefined) { const m = pendingMusic; pendingMusic = undefined; music(m); }
}
export function audioCtx() { return ctx; }
export function voiceOut() { return voiceBus; }
/** Puheen voimakkuus 0..1 (RMS voiceBusista) – suun animointiin. */
export function voiceLevel() {
  if (!analyser) return 0;
  analyser.getFloatTimeDomainData(anaBuf);
  let s = 0; for (let i = 0; i < anaBuf.length; i++) s += anaBuf[i] * anaBuf[i];
  return Math.min(1, Math.sqrt(s / anaBuf.length) * 6);
}
/** Valmiiksi ladattu puskuri (tai undefined, jos lataus kesken / ei ladattu). */
export function cachedBuffer(file) { return buffers[file] || undefined; }
export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05); }

/** Lataa ja purkaa äänitiedoston (välimuisti). Palauttaa AudioBufferin tai null. */
export function load(file, base = AUDIO_BASE()) {
  if (!ctx || NO_FILES) return Promise.resolve(null);
  if (file in buffers) return Promise.resolve(buffers[file]);
  if (loading[file]) return loading[file];
  loading[file] = fetch(base + file)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(a => new Promise((res, rej) => ctx.decodeAudioData(a, res, rej)))
    .then(b => { buffers[file] = b; audioStats.loaded.push(file); return b; })
    .catch(() => { buffers[file] = null; audioStats.failed.push(file); return null; });
  return loading[file];
}
export function preloadMusic(...names) { for (const n of names) if (MUSIC_FILES[n]) load(MUSIC_FILES[n]); }

// ---------------------------------------------------------------- ducking
let duckUntil = 0;
/** Hiljennä musiikkia (level 0..1) secs sekunniksi. */
export function duck(level = 0.35, secs = 1, attack = 0.08) {
  if (!ctx) return;
  const t = ctx.currentTime;
  duckGain.gain.cancelScheduledValues(t);
  duckGain.gain.setTargetAtTime(level, t, attack);
  duckUntil = Math.max(duckUntil, t + secs);
  const until = duckUntil;
  setTimeout(() => { if (ctx && Math.abs(until - duckUntil) < 1e-6) duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.35); }, secs * 1000);
}

// ---------------------------------------------------------------- musiikki
let current = null;      // { name, src, gain }
let wantName = null;
let pendingMusic;
const ALIAS = { calm: 'intro' };

/** Vaihda musiikki ristiinhäivytyksellä. name: intro|battle|sad|dawn|null (hiljaisuus). */
export function music(name, { fade = 1.6 } = {}) {
  name = ALIAS[name] || name;
  if (!ctx) { pendingMusic = name; return; }
  if (current && current.name === name) return;
  wantName = name;
  fadeOutCurrent(fade);
  stopSynth();
  if (!name) return;
  const file = MUSIC_FILES[name];
  load(file).then(buf => {
    if (wantName !== name) return;
    if (!buf) { synthStart(name); return; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = MUSIC_LOOP[name];
    const g = ctx.createGain(); g.gain.value = 0.0001;
    src.connect(g); g.connect(musicBus);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(MUSIC_VOL[name], t + Math.max(0.05, fade));
    src.start(t);
    current = { name, src, gain: g };
  });
}
function fadeOutCurrent(fade) {
  if (!current) return;
  const { src, gain } = current; const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.05, fade));
  try { src.stop(t + fade + 0.05); } catch (_) {}
  current = null;
}
export function currentMusic() { return current ? current.name : (synthMode ? 'synth:' + synthMode : null); }

// ---------------------------------------------------------------- tehostemoottori (src/data/sfx_map.js)
// Väylät: sfxBus (move/combat/boss/env/cine, kategoriakohtaiset gainit) + ambBus (ambienssi, oma ducking) + uiBus.
// sfx.<tapahtuma>(arg) / play(name, { vol, rate, x, delay }) → kerrokset viiveillä, variantin arvonta (ei samaa kahdesti
// peräkkäin), pitch/gain-satunnaisuus, polyfoniaraja per ääni (vanhin häivytetään), stereopan x-sijainnin mukaan.
let ambBus = null, ambDuck = null, uiBus = null;
const catBus = {};
const CAT_GAIN = { move: 0.85, combat: 1, boss: 1, env: 0.9, cine: 0.9, ui: 0.7 };
const lastVariant = {};          // sound -> viimeisin variantti-indeksi
const voices = {};               // sound -> [{ src, g, end }] (polyfonia)
const lastEventAt = {};          // event -> ctx.currentTime (cooldown)
const groupLoaded = {};
audioStats.events = {};          // tapahtuma -> laukaisukerrat (testit / ?soundtest)
audioStats.missing = [];         // tuntemattomat tapahtumanimet

function initSfxBuses() {
  ambDuck = ctx.createGain(); ambDuck.connect(master);
  ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(ambDuck);
  uiBus = ctx.createGain(); uiBus.gain.value = CAT_GAIN.ui; uiBus.connect(master);
  for (const c of CATEGORIES) {
    if (c === 'ui') { catBus.ui = uiBus; continue; }
    const g = ctx.createGain(); g.gain.value = CAT_GAIN[c] ?? 1; g.connect(sfxBus); catBus[c] = g;
  }
}

/** Lataa latausryhmän tiedostot (core | boss | cine | amb). Palauttaa Promisen. */
export function preloadSfx(...groups) {
  if (!ctx) return Promise.resolve();
  const ps = [];
  for (const g of groups) { groupLoaded[g] = true; for (const f of filesOfGroup(g)) ps.push(loadSfxFile(f)); }
  return Promise.all(ps);
}
// Muistin säästö puhelimessa: tehosteet dekoodataan matalammalla näytetaajuudella (OfflineAudioContext), soitto
// resamplaa. 32 kHz riittää iskuille/UI:lle (taajuudet < 16 kHz), matalat/ambienssit 22.05 kHz. ~½–⅔ muistista.
const LOW_RATE = /amb_|boss_drone|boss_step|boss_land|quake|heli|underwater|rockslide|sfx_ambience|debris|heartbeat/;
const decoders = {};
function decoderFor(rate) {
  if (decoders[rate] !== undefined) return decoders[rate];
  try { const O = window.OfflineAudioContext || window.webkitOfflineAudioContext; decoders[rate] = O ? new O(1, 1, rate) : null; }
  catch (_) { decoders[rate] = null; }
  return decoders[rate];
}
function loadSfxFile(file) {
  if (!ctx || NO_FILES) return Promise.resolve(null);
  if (file in buffers) return Promise.resolve(buffers[file]);
  if (loading[file]) return loading[file];
  const dec = decoderFor(LOW_RATE.test(file) ? 22050 : 32000) || ctx;
  loading[file] = fetch(AUDIO_BASE() + file)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(a => new Promise((res, rej) => dec.decodeAudioData(a, res, rej)))
    .then(b => { buffers[file] = b; audioStats.loaded.push(file); return b; })
    .catch(() => { buffers[file] = null; audioStats.failed.push(file); return null; });
  return loading[file];
}
/** Vapauttaa ryhmän puskurit muistista (esim. cine-äänet kohtausten jälkeen). Ladataan uudelleen tarvittaessa. */
export function releaseSfx(group) {
  for (const f of filesOfGroup(group)) if (buffers[f]) { delete buffers[f]; delete loading[f]; }
  groupLoaded[group] = false;
}
/** Arvio dekoodattujen puskureiden muistista (MB). */
export function audioMemoryMB() {
  let b = 0; for (const k in buffers) { const x = buffers[k]; if (x) b += x.length * x.numberOfChannels * 4; }
  return Math.round(b / 1e5) / 10;
}
/** Suurimmat puskurit (debug): [tiedosto, MB, Hz, kanavat]. */
export function audioBufferList() {
  return Object.entries(buffers).filter(([, x]) => x).map(([k, x]) => [k, Math.round(x.length * x.numberOfChannels * 4 / 1e4) / 100, x.sampleRate, x.numberOfChannels]).sort((a, b) => b[1] - a[1]);
}

function pick(id, n) {
  if (n <= 1) return 0;
  let i = Math.floor(Math.random() * n);
  if (i === lastVariant[id]) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
  lastVariant[id] = i; return i;
}
const rnd = (a, b) => a + Math.random() * (b - a);

/** Soita yksi atomiääni (SOUNDS). Palauttaa true jos soi. */
function playSound(id, { delay = 0, vol = 1, rate = 1, pan = 0 } = {}) {
  const s = SOUNDS[id];
  if (!ctx || !s) return false;
  const file = s.files[pick(id, s.files.length)];
  let buf = buffers[file];
  if (buf === undefined) {                      // ei vielä ladattu: lataa laiskasti (seuraava kerta soi), kokeile toista varianttia
    loadSfxFile(file);
    buf = s.files.map(f => buffers[f]).find(Boolean);
    if (!buf) return false;
  }
  if (!buf) return false;
  const t = ctx.currentTime + Math.max(0, delay);
  // polyfoniaraja: häivytä vanhin
  const list = voices[id] || (voices[id] = []);
  for (let i = list.length - 1; i >= 0; i--) if (list[i].end < ctx.currentTime) list.splice(i, 1);
  if (list.length >= (s.max || 4)) {
    const old = list.shift();
    try { old.g.gain.setTargetAtTime(0.0001, t, 0.015); old.src.stop(t + 0.08); } catch (_) {}
  }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const r = rate * (s.pitch ? rnd(s.pitch[0], s.pitch[1]) : 1);
  src.playbackRate.value = r;
  const g = ctx.createGain();
  g.gain.value = (s.vol ?? 1) * vol * (s.gain ? Math.pow(10, rnd(s.gain[0], s.gain[1]) / 20) : 1);
  src.connect(g);
  let out = g;
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); out = p; }
  out.connect(catBus[s.cat] || sfxBus);
  src.start(t);
  const v = { src, g, end: t + buf.duration / r };
  list.push(v);
  src.onended = () => { const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); try { out.disconnect(); } catch (_) {} };
  return true;
}

/** Stereopan maailman x-koordinaatista kameran suhteen (-0.8..0.8). */
function panFor(x) {
  if (x === undefined || !E.camPos) return 0;
  return Math.max(-0.8, Math.min(0.8, (x - E.camPos.x) / 9));
}

/** Laukaise tapahtuma (EVENTS) tai suoraan yksittäinen ääni (SOUNDS). opts: { vol, rate, x (pan), delay, arg } */
export function play(name, opts = {}) {
  audioStats.events[name] = (audioStats.events[name] || 0) + 1;
  if (!ctx) return false;
  const ev = EVENTS[name] || (SOUNDS[name] ? { layers: [{ s: name }] } : null);
  if (!ev) { if (SYN[name]) { SYN[name](opts.arg); return true; } if (!audioStats.missing.includes(name)) audioStats.missing.push(name); return false; }
  const now = ctx.currentTime;
  if (ev.cool && now - (lastEventAt[name] ?? -9) < ev.cool) return false;
  lastEventAt[name] = now;
  if (ev.duck) duck(ev.duck[0], ev.duck[1], ev.duck[2]);
  if (ev.ambDuck) duckAmb(ev.ambDuck[0], ev.ambDuck[1]);
  const pan = panFor(opts.x);
  let any = false;
  for (const L of ev.layers) {
    if (L.p !== undefined && Math.random() > L.p) continue;
    any = playSound(L.s, { delay: (L.d || 0) + (opts.delay || 0), vol: (L.vol ?? 1) * (opts.vol ?? 1), rate: (L.rate || 1) * (opts.rate || 1), pan }) || any;
  }
  if (!any && ev.syn && SYN[ev.syn]) SYN[ev.syn](opts.arg);
  return any;
}

let ambDuckUntil = 0;
function duckAmb(level, secs) {
  if (!ambDuck) return;
  const t = ctx.currentTime;
  ambDuck.gain.cancelScheduledValues(t); ambDuck.gain.setTargetAtTime(level, t, 0.05);
  ambDuckUntil = Math.max(ambDuckUntil, t + secs); const until = ambDuckUntil;
  setTimeout(() => { if (ctx && Math.abs(until - ambDuckUntil) < 1e-6) ambDuck.gain.setTargetAtTime(1, ctx.currentTime, 0.6); }, secs * 1000);
}

// ---------------------------------------------------------------- ambienssi (kerroksellinen, myöhäissyksy)
// ambience(true|false|preset, vol): preset = AMBIENCE-avain (battle, boss, night, sad, gorge, river, dusk, dawn).
// true = 'battle'. vol skaalaa koko ambienssin (vanha oletus 0.4 = 1.0).
const ambLayers = {};            // layer -> { s, g, want }
let ambPreset = null, crowTimer = null, ambScale = 1;
export function ambience(on, vol = 0.4) {
  if (!ctx) return;
  const preset = on === true ? 'battle' : on;
  ambScale = vol / 0.4;
  if (!preset || !AMBIENCE[preset]) { stopAmbience(); return; }
  ambPreset = preset;
  const P = AMBIENCE[preset];
  for (const k of Object.keys(ambLayers)) if (!(k in P)) fadeAmbLayer(k, 0);
  for (const [k, gv] of Object.entries(P)) if (AMB_FILES[k]) fadeAmbLayer(k, gv * ambScale);
  if (P.crows && !crowTimer) { preloadSfx('amb'); scheduleCrow(); }
  if (!P.crows && crowTimer) { clearTimeout(crowTimer); crowTimer = null; }
}
export function currentAmbience() { return ambPreset; }
function fadeAmbLayer(k, gv) {
  const L = ambLayers[k];
  if (L) {
    L.want = gv;
    if (!L.g) return;                           // lataus kesken: käytetään want-arvoa kun valmis
    L.g.gain.setTargetAtTime(Math.max(0.0001, gv), ctx.currentTime, 0.8);
    if (gv <= 0) setTimeout(() => { if (ambLayers[k] === L && L.want <= 0) { try { L.s.stop(); } catch (_) {} delete ambLayers[k]; delete buffers[AMB_FILES[k]]; delete loading[AMB_FILES[k]]; } }, 3500);
    return;
  }
  if (gv <= 0) return;
  const holder = { want: gv, s: null, g: null }; ambLayers[k] = holder;
  loadSfxFile(AMB_FILES[k]).then(buf => {
    if (ambLayers[k] !== holder || !buf) { if (!buf) delete ambLayers[k]; return; }
    if (holder.want <= 0) { delete ambLayers[k]; return; }
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.0001; s.connect(g); g.connect(ambBus);
    s.start(ctx.currentTime, Math.random() * buf.duration);        // eri kohta joka kerta, ettei silmukka erotu
    holder.s = s; holder.g = g;
    g.gain.setTargetAtTime(Math.max(0.0001, holder.want), ctx.currentTime, 0.9);
  });
}
function stopAmbience() {
  ambPreset = null;
  if (crowTimer) { clearTimeout(crowTimer); crowTimer = null; }
  for (const k of Object.keys(ambLayers)) fadeAmbLayer(k, 0);
}
function scheduleCrow() {
  crowTimer = setTimeout(() => {
    crowTimer = null;
    if (!ambPreset || !AMBIENCE[ambPreset].crows) return;
    if (!document.hidden) play('crow', { vol: ambScale * rnd(0.5, 1), x: (E.camPos ? E.camPos.x : 0) + rnd(-12, 12) });
    scheduleCrow();
  }, rnd(7000, 19000));
}

// --- synteettinen varajärjestelmä (vanha WebAudio-toteutus)
function noiseBuf(dur) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function noise({ dur = 0.3, type = 'lowpass', f0 = 1200, f1 = 300, q = 1, peak = 0.6, a = 0.005, out = sfxBus }) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf(dur + 0.05);
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
  const g = ctx.createGain(); env(g, t, a, peak, dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.1);
}
function tone({ f0 = 200, f1 = f0, dur = 0.3, type = 'sine', peak = 0.4, a = 0.01, out = sfxBus, when = 0 }) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
  const g = ctx.createGain(); env(g, t, a, peak, dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + a + dur + 0.05);
}
const SYN = {
  bite() { noise({ dur: 0.12, type: 'bandpass', f0: 2500, f1: 900, q: 2, peak: 0.7 }); tone({ f0: 160, f1: 60, dur: 0.12, type: 'triangle', peak: 0.5 }); },
  hit() { noise({ dur: 0.25, f0: 900, f1: 120, peak: 0.8 }); tone({ f0: 110, f1: 40, dur: 0.25, type: 'sine', peak: 0.7 }); },
  whoosh() { noise({ dur: 0.25, type: 'bandpass', f0: 500, f1: 2600, q: 1.5, peak: 0.35, a: 0.04 }); },
  hurt() { tone({ f0: 900, f1: 500, dur: 0.18, type: 'square', peak: 0.12 }); noise({ dur: 0.2, f0: 1500, f1: 300, peak: 0.4 }); },
  roar() { tone({ f0: 70, f1: 45, dur: 1.4, type: 'sawtooth', peak: 0.35, a: 0.15 }); tone({ f0: 104, f1: 60, dur: 1.3, type: 'sawtooth', peak: 0.2, a: 0.2 }); noise({ dur: 1.4, f0: 600, f1: 150, peak: 0.45, a: 0.15 }); },
  rock() { noise({ dur: 0.6, f0: 400, f1: 60, peak: 0.9 }); tone({ f0: 70, f1: 30, dur: 0.5, peak: 0.6 }); },
  rumble(d = 2.5) { noise({ dur: d, f0: 180, f1: 50, peak: 0.9, a: 0.4 }); },
  boom() { noise({ dur: 1.2, f0: 2000, f1: 40, peak: 1 }); tone({ f0: 90, f1: 25, dur: 1.2, peak: 0.9 }); },
  bark() { tone({ f0: 520, f1: 300, dur: 0.12, type: 'sawtooth', peak: 0.25 }); noise({ dur: 0.1, type: 'bandpass', f0: 1200, f1: 800, peak: 0.3 }); },
  spirit() { [784, 988, 1175, 1568].forEach((f, i) => tone({ f0: f, dur: 1.4, type: 'sine', peak: 0.08, a: 0.3, when: i * 0.18 })); },
};

Object.assign(SYN, {
  howl() { tone({ f0: 420, f1: 640, dur: 1.6, type: 'triangle', peak: 0.16, a: 0.3 }); },
  tell() { tone({ f0: 300, f1: 300, dur: 0.12, type: 'square', peak: 0.08 }); tone({ f0: 450, f1: 450, dur: 0.12, type: 'square', peak: 0.08, when: 0.13 }); },
  card() { [660, 880, 1320].forEach((f, i) => tone({ f0: f, dur: 0.25, type: 'triangle', peak: 0.15, when: i * 0.06 })); },
  cutin() { noise({ dur: 0.35, type: 'bandpass', f0: 800, f1: 6000, q: 1, peak: 0.3, a: 0.02 }); [880, 1320].forEach((f, i) => tone({ f0: f, dur: 0.3, type: 'triangle', peak: 0.12, when: i * 0.05 })); },
  perfect() { [990, 1480].forEach((f, i) => tone({ f0: f, dur: 0.4, type: 'sine', peak: 0.18, when: i * 0.07 })); },
  battoga() { noise({ dur: 0.7, type: 'bandpass', f0: 400, f1: 5000, q: 1.2, peak: 0.6, a: 0.3 }); [523, 659, 784, 1047].forEach((f, i) => tone({ f0: f, dur: 0.6, type: 'triangle', peak: 0.1, when: i * 0.05 })); },
});

/** Tehosteet: sfx.<tapahtuma>(arg, opts) – mikä tahansa EVENTS/SOUNDS-nimi (src/data/sfx_map.js). Kutsut kuten ennen:
 *  sfx.bite(), sfx.roar(), sfx.rumble(2) … Tiedostot jos ladattu, muuten synteettinen varaääni.
 *  sfx.play(name, opts) ja sfx.at(name, x) (stereopan maailman x:n mukaan) toimivat myös. */
const sfxFns = {};
export const sfx = new Proxy({}, {
  get(_, name) {
    if (typeof name !== 'string') return undefined;
    if (name === 'play') return play;
    if (name === 'at') return (n, x, o = {}) => play(n, { ...o, x });
    if (!(name in EVENTS) && !(name in SOUNDS) && !(name in SYN)) return undefined;
    return sfxFns[name] || (sfxFns[name] = (arg, o = {}) => play(name, { ...o, arg }));
  },
  has(_, name) { return name in EVENTS || name in SOUNDS || name in SYN; },
});

// --- synteettinen musiikki (varalla, jos musiikkitiedostoa ei saada)
let synthTimer = null, synthMode = null, step = 0;
const SAD = [57, 64, 69, 72, 71, 64, 67, 64, 55, 62, 67, 71, 69, 62, 66, 62];
const BAT = [45, 45, 48, 45, 43, 45, 50, 48];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function stopSynth() { if (synthTimer) clearInterval(synthTimer); synthTimer = null; synthMode = null; }
function synthStart(name) {
  const m = name === 'battle' ? 'battle' : name === 'sad' || name === 'smith' || name === 'smith2' ? 'sad' : 'calm';
  synthMode = m; step = 0;
  const bpm = m === 'battle' ? 132 : 72, stepDur = 60 / bpm / 2, out = synthMusic;
  synthTimer = setInterval(() => {
    if (!ctx || muted) return;
    if (m === 'sad') {
      const n = SAD[step % SAD.length];
      tone({ f0: mtof(n), dur: 1.6, type: 'sine', peak: 0.25, out }); tone({ f0: mtof(n + 12), dur: 0.8, type: 'sine', peak: 0.05, out });
      if (step % 8 === 0) tone({ f0: mtof(n - 24), dur: 3, type: 'triangle', peak: 0.18, a: 0.3, out });
    } else if (m === 'battle') {
      if (step % 4 === 0) tone({ f0: 120, f1: 45, dur: 0.25, peak: 0.7, out });
      if (step % 4 === 2) noise({ dur: 0.1, type: 'highpass', f0: 3000, f1: 3000, peak: 0.12, out });
      const n = BAT[Math.floor(step / 2) % BAT.length];
      if (step % 2 === 0) tone({ f0: mtof(n), dur: 0.22, type: 'sawtooth', peak: 0.09, out });
    } else if (step % 4 === 0) tone({ f0: mtof([69, 72, 76, 74][(step / 4) % 4]), dur: 2.4, type: 'sine', peak: 0.12, a: 0.4, out });
    step++;
  }, stepDur * 1000);
}

// Never keep playing in a hidden tab / when the page is put in the background (phones, other tabs).
if (typeof document !== 'undefined') {
  const syncAudioWithVisibility = () => {
    if (!ctx) return;
    if (document.hidden) { try { ctx.suspend(); } catch (_) {} }
    else if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) {} }
  };
  document.addEventListener('visibilitychange', syncAudioWithVisibility);
  window.addEventListener('pagehide', () => { if (ctx) { try { ctx.suspend(); } catch (_) {} } });
  window.addEventListener('pageshow', syncAudioWithVisibility);
}
