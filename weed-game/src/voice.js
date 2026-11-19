// Puheäänet + tekstitys. Hahmot puhuvat japania, tekstitys englanniksi (valinnaisesti myös japaniksi).
// Repliikit: src/data/lines.js. Äänitiedostot: public/audio/voice/<who>_<id>.mp3 (valinnainen).
// Saatavilla olevat tiedostot luetaan manifest.json:sta (npm run voices), jotta puuttuvat tiedostot eivät
// aiheuta 404-virheitä: jos ääntä ei ole, tekstitys näkyy merkkimäärän mukaan ajastettuna.
import { E, wait } from './engine.js';
import { LINES, VOICES, estimateDuration } from './data/lines.js';
import { audioCtx, voiceOut, load, duck, voiceLevel, cachedBuffer } from './audio.js';

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
  if (jp) { jp.textContent = ''; jp.style.display = 'none'; }   // Japanese is spoken only; no Japanese glyphs on screen
  el.classList.toggle('narr', line.who === 'narrator');
  el.classList.toggle('nosubs', !settings.subs);
  el.classList.remove('hidden');
}
function hideSub() { const el = $('sub'); if (el) el.classList.add('hidden'); }

// Puhuva hahmo kaikille hahmoille: E.speaking = { who, level, roar } (null = kukaan ei puhu).
// dogs.js lukee tämän joka frame ja liikuttaa leukaa / suuta / päätä. Kertojalla ei suuta.
E.speaking = null;
let speakSrc = null, speakT = 0, smooth = 0, peak = 0.05;
E.updaters.add((dt, dtr) => {
  const sp = E.speaking; if (!sp) { smooth = 0; return; }
  speakT += dtr;
  let target;
  if (sp.roar) target = 0.95;                                            // karjunta: suu auki koko ajan
  else if (speakSrc) { const r = voiceLevel(); peak = Math.max(peak * Math.pow(0.6, dtr), r, 0.02); target = Math.min(1, Math.max(0, r / peak - 0.12) * 1.25); }   // amplitudi, automaattinen tasonsäätö per ääni
  else target = 0.25 + 0.45 * Math.max(0, Math.sin(speakT * 2 * Math.PI * 7.5) * (0.6 + 0.4 * Math.sin(speakT * 2.3)));  // ei ääntä: 7–8 Hz
  smooth += (target - smooth) * Math.min(1, dtr * 22);
  sp.level = smooth;
});
const PAUSE = 0.6;   // repliikkien pre/post-tauot skaalataan (nopeampi rytmi)

/**
 * Toista repliikki (id src/data/lines.js:stä). Palauttaa lupauksen, joka ratkeaa repliikin jälkeen.
 * Tekstitys näkyy heti; jos ääni ei ole vielä ladattu, se käynnistyy heti kun lataus valmistuu.
 * opts.hold = lisäaika sekunteina; opts.noWait = älä odota loppuun (taistelun huudot).
 */
export async function say(id, opts = {}) {
  const line = LINES[id];
  if (!line) { console.warn('missing line', id); return; }
  if (!available) await manifest();
  if (line.pre && !opts.noWait) await wait(line.pre * PAUSE, true);
  if (E.skipping && !opts.noWait) return;
  const ctx = audioCtx();
  const hasFile = ctx && available.has(line.file);
  const token = {}; current = token;
  let src = null, dur = estimateDuration(line), t0 = performance.now();
  const start = buf => {
    if (current !== token || E.skipping) return;
    src = ctx.createBufferSource(); src.buffer = buf; (() => { const gn = ctx.createGain(); gn.gain.value = line.gain ?? 1; src.connect(gn); gn.connect(voiceOut()); })(); src.start();
    speakSrc = src; src.onended = () => { if (speakSrc === src) speakSrc = null; };
    dur = (performance.now() - t0) / 1000 + buf.duration;
    duck(line.duck ?? (line.who === 'kaibutsu' ? 0.55 : 0.32), buf.duration + 0.2);
  };
  showSub(line);
  E.speaking = line.who === 'narrator' ? null : { who: line.who, level: 0, roar: line.who === 'kaibutsu' && !/speak/.test(id) };
  speakT = 0; peak = 0.05;
  if (hasFile) {
    const cached = cachedBuffer(line.file);
    if (cached) start(cached);
    else load(line.file, VOICE_BASE()).then(b => { if (b && (performance.now() - t0) / 1000 < dur * 0.6) start(b); });
  }
  if (!src) duck(line.duck ?? (line.who === 'kaibutsu' ? 0.55 : 0.32), dur + 0.2);
  const finish = () => { if (current === token) { hideSub(); E.speaking = null; speakSrc = null; } };
  if (opts.noWait) { const check = () => { if ((performance.now() - t0) / 1000 >= dur + 0.2) finish(); else setTimeout(check, 100); }; setTimeout(check, 200); return; }
  // odota kunnes repliikki (äänen kesto, joka voi päivittyä latauksen jälkeen) on ohi
  while (!E.skipping && (performance.now() - t0) / 1000 < dur + (opts.hold || 0)) await wait(0.05, true);
  if (src && E.skipping) try { src.stop(); } catch (_) {}
  finish();
  if (line.post && !E.skipping) await wait(line.post * PAUSE, true);
}
export function stopVoice() { hideSub(); current = null; E.speaking = null; if (speakSrc) try { speakSrc.stop(); } catch (_) {} speakSrc = null; }
export { LINES };
