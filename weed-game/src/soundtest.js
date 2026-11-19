// ?soundtest – kuuntele jokainen tehoste napista (kategorioittain), ambienssipresetit ja yksittäiset atomiäänet.
// Ei lataa 3D-maailmaa. Ensimmäinen napautus avaa AudioContextin.
import { initAudio, play, ambience, preloadSfx, audioStats, audioMemoryMB, audioBufferList } from './audio.js';
import { EVENTS, SOUNDS, AMBIENCE, CATEGORIES } from './data/sfx_map.js';

const CAT_NAME = { move: 'Movement', combat: 'Combat', boss: 'Kaibutsu / boss', env: 'Environment', cine: 'Cinematic / emotion', ui: 'UI' };

export function openSoundTest() {
  const root = document.createElement('div');
  root.id = 'soundtest';
  root.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:auto;background:#14121a;color:#eee;font:14px/1.3 system-ui,sans-serif;padding:12px 16px;-webkit-overflow-scrolling:touch';
  const css = document.createElement('style');
  css.textContent = `#soundtest h2{font-size:15px;margin:14px 0 6px;color:#ffd27a}#soundtest button{margin:3px;padding:8px 10px;border:1px solid #555;border-radius:6px;background:#23202c;color:#eee;font-size:13px}
  #soundtest button:active{background:#46405a}#soundtest .atom{font-size:11px;padding:5px 7px;color:#bbb}#soundtest #stInfo{font-size:12px;color:#9ab;margin:6px 0}
  #rotate{display:none!important}`;
  document.head.appendChild(css);
  const groups = {};
  for (const [name, ev] of Object.entries(EVENTS)) (groups[ev.cat || 'combat'] ||= []).push(name);
  let html = `<h1 style="font-size:18px;margin:0">Sound test</h1><div>Tap a button to play. Every play is randomised (variant, pitch, gain) like in the game.</div>
    <div><button id="stLoadAll">Load all</button><button id="stStop">Stop ambience</button></div><div id="stInfo"></div>`;
  html += `<h2>Ambience presets (layered loops)</h2>` + Object.keys(AMBIENCE).map(k => `<button data-amb="${k}">${k}</button>`).join('');
  for (const c of CATEGORIES) if (groups[c]) html += `<h2>${CAT_NAME[c] || c} – events</h2>` + groups[c].map(n => `<button data-ev="${n}">${n}</button>`).join('');
  html += `<h2>Single sounds (all variants)</h2>` + Object.entries(SOUNDS).map(([n, s]) => `<button class="atom" data-ev="${n}">${n} (${s.files.length})</button>`).join('');
  root.innerHTML = html;
  document.body.appendChild(root);
  const info = root.querySelector('#stInfo');
  const refresh = () => { info.textContent = `loaded ${audioStats.loaded.length} files, failed ${audioStats.failed.length}, decoded ≈ ${audioMemoryMB()} MB`; };
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    initAudio();
    if (b.id === 'stLoadAll') { preloadSfx('core', 'boss', 'cine', 'amb').then(refresh); return; }
    if (b.id === 'stStop') { ambience(false); return; }
    if (b.dataset.amb) { preloadSfx('amb'); ambience(b.dataset.amb); return; }
    if (b.dataset.ev) {
      const n = b.dataset.ev;
      const s = SOUNDS[n] || null;
      if (!play(n)) {                       // ei vielä ladattu: lataa ryhmä ja soita perään
        const grp = s ? [s.group] : [...new Set((EVENTS[n]?.layers || []).map(l => SOUNDS[l.s]?.group).filter(Boolean))];
        preloadSfx(...grp).then(() => { play(n); refresh(); });
      }
      setTimeout(refresh, 600);
    }
  });
  window.__soundtest = { audioStats, mem: audioMemoryMB, dbg: () => audioBufferList().slice(0, 12) };
  setInterval(refresh, 2000);
}
