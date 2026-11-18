// DOM-käyttöliittymän apurit: HUD, kortit, tekstitys, vihjeet.
import { E, wait } from './engine.js';

export const $ = id => document.getElementById(id);
export const show = (id, v = true) => $(id).classList.toggle('hidden', !v);

export function setHearts(n, max) {
  const el = $('hearts'); el.innerHTML = '';
  for (let i = 0; i < max; i++) { const h = document.createElement('i'); if (i >= n) h.className = 'off'; el.appendChild(h); }
}
export function setBossHP(frac, armored = false) {
  $('bosshp').style.width = `${Math.max(0, frac) * 100}%`;
  $('bossghost').style.width = `${Math.max(0, frac) * 100}%`;
  $('bossbox').classList.toggle('armored', armored);
}
export function setHenki(frac) {
  $('henkiArc').style.strokeDashoffset = String(264 * (1 - Math.min(1, frac)));
  $('henki').classList.toggle('full', frac >= 1);
}

let hintTimer = null;
export function hint(text, secs = 0) {
  const el = $('hint');
  if (!text) { el.classList.add('hidden'); return; }
  el.innerHTML = text; el.classList.remove('hidden');
  clearTimeout(hintTimer);
  if (secs) hintTimer = setTimeout(() => el.classList.add('hidden'), secs * 1000);
}
let toastTimer = null;
export function toast(text, secs = 0.9) {
  const el = $('toast'); el.textContent = text; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), secs * 1000);
}

export function cine(on) {
  document.body.classList.toggle('cine', on);
  show('skipBtn', on);
  if (!on) { show('sub', false); show('caption', false); }
}

/** Repliikki: puhuja + teksti, kesto arvioidaan pituudesta. */
export async function say(who, text, secs) {
  const d = secs ?? Math.max(2.2, text.length * 0.055);
  $('sub').querySelector('.who').textContent = who || '';
  $('sub').querySelector('.who').style.display = who ? '' : 'none';
  $('sub').querySelector('.txt').textContent = text;
  show('sub', true);
  await wait(d, true);
  show('sub', false);
}
export async function caption(html, secs = 3) {
  const el = $('caption'); el.innerHTML = html; el.style.opacity = 1; show('caption', true);
  await wait(secs, true);
  el.style.opacity = 0;
  await wait(0.4, true);
  show('caption', false);
}

// Kortit
export function buildCards(defs, onUse) {
  const box = $('cards'); box.innerHTML = '';
  for (const d of defs) {
    const el = document.createElement('button');
    el.className = 'card'; el.dataset.id = d.id;
    el.innerHTML = `<div class="portrait" style="background:radial-gradient(circle at 40% 35%, ${d.color2}, ${d.color} 70%)"></div><div class="cn">${d.name}</div><div class="cd">${d.desc}</div><div class="cool"></div>`;
    el.addEventListener('pointerdown', e => { e.stopPropagation(); onUse(d.id); });
    box.appendChild(el);
    d.el = el;
  }
}
export function updateCard(d) {
  const el = d.el; if (!el) return;
  const frac = d.state === 'cooldown' ? d.cool / d.cooldown : (d.state === 'locked' || d.state === 'fallen' ? 1 : 0);
  el.querySelector('.cool').style.height = `${frac * 100}%`;
  el.classList.toggle('ready', d.state === 'ready');
  el.classList.toggle('locked', d.state === 'locked');
  el.classList.toggle('sacrifice', d.state === 'sacrifice');
  el.classList.toggle('fallen', d.state === 'fallen');
  el.querySelector('.cd').textContent = d.state === 'fallen' ? 'Muistoissa' : d.state === 'sacrifice' ? 'UHRAUS' : d.desc;
}

export function isSkipping() { return E.skipping; }
