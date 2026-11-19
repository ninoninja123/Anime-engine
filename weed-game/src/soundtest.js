// ?soundtest – kuuntele jokainen ääni napista: tapahtumat (kategorioittain), ambienssipresetit, musiikki, yksittäiset
// atomiäänet ja jokainen varianttitiedosto. Jokaisessa napissa mitattu taso (LUFS, tools/audio-audit.py) ja kategoria.
// "Mix preview" soittaa tyypillisen taistelun kerrokset yhdessä (musiikki + ambienssi + askeleet + iskut + puhe-duck),
// jotta tasapainon kuulee. Ei lataa 3D-maailmaa. Ensimmäinen napautus avaa AudioContextin.
import { initAudio, play, ambience, music, preloadSfx, audioStats, audioMemoryMB, audioBufferList, duck, duckState, volumes, setVolume, MUSIC_FILES, load, audioCtx, voiceOut } from './audio.js';
import { EVENTS, SOUNDS, AMBIENCE, AMB_FILES, CATEGORIES, MIX, variantTrim, voiceTrim } from './data/sfx_map.js';
import { AUDIO_LEVELS } from './data/audio_levels.js';

const CAT_NAME = { move: 'Movement', combat: 'Combat', boss: 'Kaibutsu / boss', env: 'Environment', cine: 'Cinematic / emotion', ui: 'UI' };
const db = g => 20 * Math.log10(Math.max(1e-6, g));
const psum = ls => ls.length ? 10 * Math.log10(ls.reduce((a, l) => a + Math.pow(10, l / 10), 0)) : null;

/** Äänen (SOUNDS) tehollinen taso pelissä: varianttien keskiarvo + trim + vol + kategoria + väylä. */
function soundLevel(id) {
  const s = SOUNDS[id]; if (!s) return null;
  const ls = s.files.map(f => AUDIO_LEVELS[f] ? AUDIO_LEVELS[f][0] + db(variantTrim(f, s)) : null).filter(x => x !== null);
  if (!ls.length) return null;
  return psum(ls) - 10 * Math.log10(ls.length) + db((s.vol ?? 1) * (MIX.cat[s.cat] ?? 1) * (s.cat === 'ui' ? 1 : MIX.bus.sfx));
}
function eventLevel(name) {
  const ev = EVENTS[name]; if (!ev) return soundLevel(name);
  return psum(ev.layers.filter(L => !(L.p < 0.5)).map(L => { const l = soundLevel(L.s); return l === null ? null : l + db(L.vol ?? 1); }).filter(x => x !== null));
}
const fmt = l => (l === null || l === undefined ? '–' : l.toFixed(0));
// policy colour: green inside the target band, amber outside, red when far off
function band(l, lo, hi) { if (l === null) return ''; return l >= lo - 1 && l <= hi + 1 ? 'ok' : l >= lo - 5 && l <= hi + 5 ? 'warn' : 'bad'; }
const FOLEY = /^(step|stepSoft|stepRock|step[A-Z]\w*|wade|claw|fur|tired|breath|dust|tick|ui\w*|caption|crow|card\w*|skip|denied|scan|lunge|slide|jump|land|gallopIn)$/;
function evBand(name, l) { return FOLEY.test(name) ? band(l, -28, -18) : band(l, -18, -11); }

export function openSoundTest() {
  const root = document.createElement('div');
  root.id = 'soundtest';
  root.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:auto;background:#14121a;color:#eee;font:14px/1.3 system-ui,sans-serif;padding:12px 16px;-webkit-overflow-scrolling:touch;touch-action:pan-y';
  const css = document.createElement('style');
  css.textContent = `#soundtest h2{font-size:15px;margin:14px 0 6px;color:#ffd27a}#soundtest button{margin:3px;padding:8px 10px;border:1px solid #555;border-radius:6px;background:#23202c;color:#eee;font-size:13px;min-height:0}
  #soundtest button:active{background:#46405a}#soundtest .atom{font-size:11px;padding:5px 7px;color:#bbb}#soundtest #stInfo{font-size:12px;color:#9ab;margin:6px 0}
  #soundtest .lv{display:inline-block;margin-left:6px;padding:0 4px;border-radius:4px;font-size:10px;font-variant-numeric:tabular-nums;background:#333;color:#ccc}
  #soundtest .ok .lv{background:#1f4a2c;color:#9fe0b0}#soundtest .warn .lv{background:#4a3f1f;color:#f0d690}#soundtest .bad .lv{background:#5a2222;color:#ffb0b0}
  #soundtest .big{background:#3a3260;border-color:#8a7fd0;font-weight:700}#soundtest .legend{font-size:11px;color:#aaa;margin:4px 0}
  #soundtest .vols label{display:inline-flex;align-items:center;gap:6px;margin-right:14px;font-size:12px}#soundtest .vols input{width:110px}
  #soundtest details{margin:6px 0}#soundtest summary{cursor:pointer;color:#ffd27a;font-size:14px}
  #rotate{display:none!important}`;
  document.head.appendChild(css);
  const groups = {};
  for (const [name, ev] of Object.entries(EVENTS)) (groups[ev.cat || 'combat'] ||= []).push(name);
  const evBtn = (n, cls = '') => { const l = eventLevel(n); return `<button class="${cls} ${evBand(n, l)}" data-ev="${n}" title="${l === null ? 'not measured' : l.toFixed(1) + ' LUFS in game'}">${n}<span class="lv">${fmt(l)}</span></button>`; };
  let html = `<h1 style="font-size:18px;margin:0">Sound test</h1>
    <div>Tap a button to play. Every play is randomised (variant, pitch, gain) like in the game.</div>
    <div class="legend">Badge = loudness in game (LUFS: momentary max for effects, integrated for music/voice/ambience) after the code mix
      (<code>MIX</code> in sfx_map.js). Green = inside policy (impacts -18..-11, foley/UI -28..-18), amber = near, red = off. Numbers from
      <code>tools/audio-audit.py</code>.</div>
    <div><button id="stLoadAll">Load all</button><button id="stStop">Stop music + ambience</button>
      <button id="stMix" class="big">▶ Mix preview: typical fight</button><button id="stMixNarr" class="big">▶ Mix preview: narrator over music</button></div>
    <div class="vols">${['music', 'sfx', 'voice'].map(k => `<label>${k === 'sfx' ? 'Effects' : k[0].toUpperCase() + k.slice(1)} <input type="range" min="0" max="100" step="5" data-vol="${k}" value="${Math.round(volumes[k] * 100)}"></label>`).join('')}</div>
    <div id="stInfo"></div>`;
  html += `<h2>Music (trimmed to ${MIX.target.music} LUFS)</h2>` + Object.entries(MUSIC_FILES).map(([k, f]) => { const L = AUDIO_LEVELS[f]; return `<button data-mus="${k}" class="ok" title="${f}: file ${L ? L[0] : '?'} LUFS">${k}<span class="lv">file ${L ? L[0].toFixed(0) : '?'}</span></button>`; }).join('');
  html += `<h2>Ambience presets (layered loops)</h2>` + Object.keys(AMBIENCE).map(k => {
    const ls = Object.entries(AMBIENCE[k]).filter(([l]) => AMB_FILES[l]).map(([l, g]) => (AUDIO_LEVELS[AMB_FILES[l]]?.[0] ?? -30) + db(g * (MIX.ambTrim[l] ?? 1) * MIX.ambBus));
    const l = psum(ls); return `<button data-amb="${k}" class="${band(l, -30, -22)}">${k}<span class="lv">${fmt(l)}</span></button>`;
  }).join('');
  for (const c of CATEGORIES) if (groups[c]) html += `<h2>${CAT_NAME[c] || c} – events</h2>` + groups[c].map(n => evBtn(n)).join('');
  html += `<h2>Single sounds (category, variants)</h2>` + Object.entries(SOUNDS).filter(([n]) => !/_\d+$/.test(n)).map(([n, s]) => {
    const l = soundLevel(n); return `<button class="atom ${evBand(n, l)}" data-ev="${n}" title="${s.cat} · ${s.files.length} variant(s)">${n} · ${s.cat} (${s.files.length})<span class="lv">${fmt(l)}</span></button>`;
  }).join('');
  html += `<details><summary>Every file (raw, no mix) – ${Object.keys(AUDIO_LEVELS).filter(f => !f.startsWith('voice/')).length} files</summary>` +
    Object.entries(AUDIO_LEVELS).filter(([f]) => !f.startsWith('voice/') && !f.startsWith('mus_')).map(([f, L]) => `<button class="atom" data-file="${f}" title="${L[3]} · ${L[2]} s · TP ${L[1]} dBTP">${f.replace('.mp3', '')}<span class="lv">${L[0].toFixed(0)}</span></button>`).join('') + '</details>';
  root.innerHTML = html;
  document.body.appendChild(root);
  const info = root.querySelector('#stInfo');
  const refresh = () => { const d = duckState(); info.textContent = `loaded ${audioStats.loaded.length} files, failed ${audioStats.failed.length}, decoded ≈ ${audioMemoryMB()} MB · duck music ${d.music} amb ${d.amb}`; };
  const playEv = n => {
    if (play(n)) return;
    const s = SOUNDS[n];
    const grp = s ? [s.group] : [...new Set((EVENTS[n]?.layers || []).map(l => SOUNDS[l.s]?.group).filter(Boolean))];
    preloadSfx(...grp).then(() => { play(n); refresh(); });
  };
  root.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.vol; if (k) { initAudio(); setVolume(k, +e.target.value / 100); } });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    initAudio();
    if (b.id === 'stLoadAll') { preloadSfx('core', 'boss', 'cine', 'amb').then(refresh); return; }
    if (b.id === 'stStop') { ambience(false); music(null); return; }
    if (b.id === 'stMix') { mixPreview(); return; }
    if (b.id === 'stMixNarr') { narratorPreview(); return; }
    if (b.dataset.mus) { music(b.dataset.mus); return; }
    if (b.dataset.amb) { preloadSfx('amb'); ambience(b.dataset.amb); return; }
    if (b.dataset.file) { playFile(b.dataset.file); return; }
    if (b.dataset.ev) { playEv(b.dataset.ev); setTimeout(refresh, 600); }
  });

  // Tyypillinen taistelu: battle-musiikki + boss-ambienssi, Weedin laukka, väistö, purenta, raskas isku, P4:n
  // karjaisu (duck), kivi, Battōga + boom (syvä duck). Kuuntele: puhe/iskut erottuvat, musiikki ei peity eikä peitä.
  async function mixPreview() {
    await preloadSfx('core', 'boss', 'cine', 'amb');
    music('battle'); ambience('boss');
    const T = [
      [0.8, 'gallopIn'], [1.1, 'step'], [1.35, 'step'], [1.6, 'step'],
      [1.9, 'dodge'], [2.3, 'lunge'], [2.45, 'bite'], [2.5, 'hitMed'],
      [3.2, 'bossStep'], [3.6, 'bossStep'], [3.9, 'tell'], [4.6, 'roar'],
      [5.4, 'rock'], [5.7, 'dust'], [6.2, 'jump'], [6.7, 'land'],
      [7.2, 'hitHeavy'], [7.25, 'hurt'], [8.0, 'perfect'], [8.6, 'bite'], [8.65, 'crit'],
      [9.5, 'battoga'], [10.6, 'boom'], [11.4, 'roarPain'], [12.6, 'knockdown'], [14, 'spirit'],
    ];
    const t0 = performance.now();
    for (const [t, n] of T) setTimeout(() => { play(n); refresh(); }, t * 1000);
    // repliikin kohta (puheen ducking-ryhmä ilman tiedostoa): kuuluuko musiikki laskevan?
    setTimeout(() => duck(MIX.duck.speech, 1.8, 0.06, 'voice', { amb: MIX.duck.speechAmb }), 4800);
    setTimeout(() => { ambience(false); music(null); refresh(); }, 17000);
    info.textContent = 'Mix preview playing (17 s)…'; void t0;
  }
  // Kertoja musiikin päällä: story-musiikki täysillä, sitten kertojan ducking (0.16) ja yksi isku kesken (ei saa nostaa musiikkia).
  async function narratorPreview() {
    await preloadSfx('core', 'cine');
    music('story'); ambience('night');
    setTimeout(() => { duck(MIX.duck.narrator, 6, 0.06, 'voice', { amb: MIX.duck.narratorAmb }); playVoiceSample(); refresh(); }, 3000);
    setTimeout(() => { play('hit'); refresh(); }, 5500);           // isku kesken kertojan: duck pysyy 0.16:ssa
    setTimeout(refresh, 6000);
    setTimeout(() => { ambience(false); music(null); refresh(); }, 13000);
  }
  function playVoiceSample() {
    const f = Object.keys(AUDIO_LEVELS).find(k => k.startsWith('voice/narrator_intro')) || Object.keys(AUDIO_LEVELS).find(k => k.startsWith('voice/narrator'));
    if (f) playFile(f, 'voice');
  }
  window.__soundtest = { audioStats, mem: audioMemoryMB, dbg: () => audioBufferList().slice(0, 12), duck: duckState, mix: mixPreview };
  setInterval(refresh, 1000);
}

// Raakatiedosto (ilman miksausta) – "Every file" -lista + kertojan näyte mix previewssa.
async function playFile(f, kind) {
  const base = new URL('audio/', window.ASSET_BASE || document.baseURI).href;
  const b = await load(f, base); const ctx = audioCtx(); if (!b || !ctx) return;
  const s = ctx.createBufferSource(); s.buffer = b;
  const g = ctx.createGain(); g.gain.value = kind === 'voice' ? voiceTrim(f.replace('voice/', '')) * 1.45 : 0.8;
  s.connect(g); g.connect(kind === 'voice' ? voiceOut() : ctx.destination); s.start();
}
