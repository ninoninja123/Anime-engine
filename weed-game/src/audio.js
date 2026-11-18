// Äänimoottori: Epidemic Sound -musiikki ja -tehosteet (public/audio/), ladataan laiskasti.
//  - musiikki ristiinhäivytetään vaiheiden mukaan: intro -> battle -> sad -> dawn
//  - duck(): musiikki hiljenee repliikkien ja isojen iskujen ajaksi
//  - jos tiedosto puuttuu tai lataus epäonnistuu, käytetään vanhaa WebAudio-synteesiä varalla
// Selaimen autoplay-sääntö: AudioContext luodaan vasta käyttäjän ensimmäisestä napautuksesta (initAudio).
import { E } from './engine.js';

let ctx = null, master = null, musicBus = null, duckGain = null, sfxBus = null, voiceBus = null, synthMusic = null;
export let muted = false;
const NO_FILES = E.params.has('synthaudio');

const AUDIO_BASE = () => new URL('audio/', window.ASSET_BASE || document.baseURI).href;
export const MUSIC_FILES = { intro: 'mus_intro.mp3', battle: 'mus_battle.mp3', sad: 'mus_sad.mp3', dawn: 'mus_dawn.mp3' };
const MUSIC_VOL = { intro: 0.55, battle: 0.5, sad: 0.6, dawn: 0.6 };
const MUSIC_LOOP = { intro: true, battle: true, sad: false, dawn: false };
export const SFX_FILES = {
  bite: 'sfx_bite.mp3', hit: 'sfx_hit.mp3', roar: 'sfx_roar.mp3', rock: 'sfx_rock.mp3', rumble: 'sfx_rockslide.mp3',
  whoosh: 'sfx_whoosh.mp3', boom: 'sfx_battoga.mp3', spirit: 'sfx_spirit.mp3', bark: 'sfx_bark.mp3', hurt: 'sfx_hurt.mp3',
  wind: 'sfx_wind.mp3',
};
const SFX_VOL = { bite: 0.9, hit: 0.8, roar: 0.9, rock: 0.8, rumble: 1, whoosh: 0.55, boom: 1, spirit: 0.7, bark: 0.6, hurt: 0.6, wind: 0.35 };

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
    synthMusic = ctx.createGain(); synthMusic.gain.value = 0.35; synthMusic.connect(duckGain);
  } catch (e) { ctx = null; return; }
  // esilataa pienet tehosteet + valikon musiikki; muut kun niitä tarvitaan
  for (const k of Object.keys(SFX_FILES)) load(SFX_FILES[k]);
  load(MUSIC_FILES.intro);
  if (pendingMusic !== undefined) { const m = pendingMusic; pendingMusic = undefined; music(m); }
}
export function audioCtx() { return ctx; }
export function voiceOut() { return voiceBus; }
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

// ---------------------------------------------------------------- ambienssi (tuuli)
let amb = null;
export function ambience(on, vol = SFX_VOL.wind) {
  if (!ctx) return;
  if (!on) { if (amb) { amb.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5); const a = amb; setTimeout(() => { try { a.s.stop(); } catch (_) {} }, 2500); amb = null; } return; }
  if (amb) { amb.g.gain.setTargetAtTime(vol, ctx.currentTime, 0.5); return; }
  load(SFX_FILES.wind).then(buf => {
    if (!buf || amb) return;
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.0001; s.connect(g); g.connect(sfxBus);
    g.gain.setTargetAtTime(vol, ctx.currentTime, 0.8); s.start();
    amb = { s, g };
  });
}

// ---------------------------------------------------------------- tehosteet
function playFile(name, { vol = 1, rate = 1, vary = 0.06 } = {}) {
  const buf = buffers[SFX_FILES[name]];
  if (!ctx || !buf) return false;
  const s = ctx.createBufferSource(); s.buffer = buf;
  s.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 2 * vary);
  const g = ctx.createGain(); g.gain.value = (SFX_VOL[name] || 1) * vol;
  s.connect(g); g.connect(sfxBus); s.start();
  return true;
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

/** Tehosteet: tiedosto jos ladattu, muuten synteesi. Kutsut kuten ennen: sfx.bite(), sfx.roar() ... */
export const sfx = {
  bite() { if (!playFile('bite', { rate: 1.25 })) SYN.bite(); },
  hit() { if (!playFile('hit')) SYN.hit(); },
  whoosh() { if (!playFile('whoosh', { vary: 0.12 })) SYN.whoosh(); },
  hurt() { if (!playFile('hurt')) SYN.hurt(); },
  roar() { duck(0.45, 1.6); if (!playFile('roar', { vary: 0.03 })) SYN.roar(); },
  rock() { if (!playFile('rock', { vol: 0.8, vary: 0.15 })) SYN.rock(); },
  rumble(d = 2.5) { duck(0.5, Math.min(d, 3)); if (!playFile('rumble')) SYN.rumble(d); },
  boom() { duck(0.25, 1.8, 0.02); if (!playFile('boom')) SYN.boom(); },
  bark() { if (!playFile('bark', { vary: 0.1 })) SYN.bark(); },
  spirit() { if (!playFile('spirit')) SYN.spirit(); },
  howl() { tone({ f0: 420, f1: 640, dur: 1.6, type: 'triangle', peak: 0.16, a: 0.3 }); },
  tell() { tone({ f0: 300, f1: 300, dur: 0.12, type: 'square', peak: 0.08 }); tone({ f0: 450, f1: 450, dur: 0.12, type: 'square', peak: 0.08, when: 0.13 }); },
  card() { [660, 880, 1320].forEach((f, i) => tone({ f0: f, dur: 0.25, type: 'triangle', peak: 0.15, when: i * 0.06 })); },
  cutin() { noise({ dur: 0.35, type: 'bandpass', f0: 800, f1: 6000, q: 1, peak: 0.3, a: 0.02 }); [880, 1320].forEach((f, i) => tone({ f0: f, dur: 0.3, type: 'triangle', peak: 0.12, when: i * 0.05 })); },
  perfect() { [990, 1480].forEach((f, i) => tone({ f0: f, dur: 0.4, type: 'sine', peak: 0.18, when: i * 0.07 })); },
  battoga() { if (!playFile('whoosh', { rate: 0.7, vol: 1.2, vary: 0 })) noise({ dur: 0.7, type: 'bandpass', f0: 400, f1: 5000, q: 1.2, peak: 0.6, a: 0.3 }); [523, 659, 784, 1047].forEach((f, i) => tone({ f0: f, dur: 0.6, type: 'triangle', peak: 0.1, when: i * 0.05 })); },
};

// --- synteettinen musiikki (varalla, jos musiikkitiedostoa ei saada)
let synthTimer = null, synthMode = null, step = 0;
const SAD = [57, 64, 69, 72, 71, 64, 67, 64, 55, 62, 67, 71, 69, 62, 66, 62];
const BAT = [45, 45, 48, 45, 43, 45, 50, 48];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function stopSynth() { if (synthTimer) clearInterval(synthTimer); synthTimer = null; synthMode = null; }
function synthStart(name) {
  const m = name === 'battle' ? 'battle' : name === 'sad' ? 'sad' : 'calm';
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
