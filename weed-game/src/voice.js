// Puheäänet + tekstitys. Hahmot puhuvat japania, tekstitys englanniksi (valinnaisesti myös japaniksi).
// Repliikit: src/data/lines.js. Äänitiedostot: public/audio/voice/<who>_<id>.mp3 (valinnainen).
// Saatavilla olevat tiedostot luetaan manifest.json:sta (npm run voices), jotta puuttuvat tiedostot eivät
// aiheuta 404-virheitä: jos ääntä ei ole, tekstitys näkyy merkkimäärän mukaan ajastettuna.
import { E, wait } from './engine.js';
import { LINES, VOICES, estimateDuration } from './data/lines.js';
import { audioCtx, voiceOut, load, duck } from './audio.js';

const VOICE_BASE = () => new URL('audio/voice/', window.ASSET_BASE || document.baseURI).href;
let available = null;          // Set tiedostonimistä
let manifestP = null;

export const settings = {
  subs: readPref('weed.subs', '1') === '1',
  jp: readPref('weed.jpsubs', '1') === '1',
};
function readPref(k, d) { try { return localStorage.getItem(k) ?? d; } catch (_) { return d; } }
export function setPref(key, v) {
  settings[key] = v;
  try { localStorage.setItem(key === 'subs' ? 'weed.subs' : 'weed.jpsubs', v ? '1' : '0'); } catch (_) {}
}

function manifest() {
  if (manifestP) return manifestP;
  manifestP = fetch(VOICE_BASE() + 'manifest.json').then(r => r.ok ? r.json() : []).catch(() => [])
    .then(list => { available = new Set(list); return available; });
  return manifestP;
}

/** Esilataa kohtauksen repliikkien äänet (jos olemassa). */
export async function preloadLines(ids) {
  await manifest();
  for (const id of ids) { const l = LINES[id]; if (l && available.has(l.file)) load(l.file, VOICE_BASE()); }
}

const $ = id => document.getElementById(id);
let current = null;
function showSub(line) {
  const el = $('sub'); if (!el) return;
  const v = VOICES[line.who] || {};
  el.querySelector('.who').textContent = v.name || '';
  el.querySelector('.who').style.display = v.name ? '' : 'none';
  el.querySelector('.txt').textContent = line.en;
  const jp = el.querySelector('.jp');
  if (jp) { jp.textContent = line.ja; jp.style.display = settings.jp ? '' : 'none'; }
  el.classList.toggle('narr', line.who === 'narrator');
  el.classList.toggle('nosubs', !settings.subs);
  el.classList.remove('hidden');
}
function hideSub() { const el = $('sub'); if (el) el.classList.add('hidden'); }

/**
 * Toista repliikki (id src/data/lines.js:stä). Palauttaa lupauksen, joka ratkeaa repliikin jälkeen.
 * opts.hold = lisäaika sekunteina; opts.noWait = älä odota loppuun (taistelun huudot).
 */
export async function say(id, opts = {}) {
  const line = LINES[id];
  if (!line) { console.warn('missing line', id); return; }
  await manifest();
  if (line.pre && !opts.noWait) await wait(line.pre, true);
  if (E.skipping && !opts.noWait) return;
  let dur = estimateDuration(line);
  let src = null;
  const ctx = audioCtx();
  if (ctx && available.has(line.file)) {
    const buf = await Promise.race([load(line.file, VOICE_BASE()), new Promise(r => setTimeout(() => r(null), 1500))]);
    if (buf) {
      src = ctx.createBufferSource(); src.buffer = buf; src.connect(voiceOut()); src.start();
      dur = buf.duration;
    }
  }
  duck(line.duck ?? (line.who === 'kaibutsu' ? 0.55 : 0.32), dur + 0.2);   // line.duck: per-line music level (prologue narration ducks gently)
  const token = {}; current = token;
  showSub(line);
  if (opts.noWait) { setTimeout(() => { if (current === token) hideSub(); }, (dur + 0.3) * 1000); return; }
  await wait(dur + (opts.hold || 0), true);
  if (src && E.skipping) try { src.stop(); } catch (_) {}
  if (current === token) hideSub();
  if (line.post && !E.skipping) await wait(line.post, true);
}
export function stopVoice() { hideSub(); current = null; }
export { LINES };
