// Boot: loading, main menu, The Pack (character gallery), level start, pause, landscape lock, settings.
import './style.css';
import * as THREE from 'three';
import { E, initEngine, tween } from './engine.js';
import { loadFor, makeDog, isLoaded } from './dogs.js';
import { CHARACTERS, ROSTER } from './characters.js';
import { buildWorld } from './world.js';
import { initInput } from './input.js';
import { initAudio, setMuted, muted, music, sfx, audioStats, currentMusic } from './audio.js';
import { settings, setPref } from './voice.js';
import * as FX from './fx.js';
import * as UI from './ui.js';
import { cast, createCast, startLevel, retryPhase, setPaused, quit, debug } from './level2.js';

const $ = UI.$;
let mode = 'menu';

async function boot() {
  initEngine($('gl'));
  initInput($('touch'), $('overlay'));
  FX.setOverlay($('overlay').getContext('2d'));
  buildWorld();
  await createCast();             // loads only the models level 2 needs
  UI.show('loading', false);
  wireUI();
  showMenu();
  const p = E.params;
  if (p.has('play') || p.has('phase')) startGame(Number(p.get('phase') || 1), !p.has('nointro'));
  if (p.has('gallery')) showCast(Number(p.get('gallery')) || 0);
}

// ---------------------------------------------------------------- main menu: the pack on the ridge
function showMenu() {
  mode = 'menu';
  hideGallery();
  for (const d of Object.values(cast)) d.root.visible = false;
  const set = (id, x, z, face, anim, ts = 1) => { const d = cast[id]; d.root.visible = true; d.fade(1); d.root.position.set(x, 0, z); d.root.rotation.set(0, 0, 0); d.face(face, true); d.spin.rotation.set(0, 0, 0); d.play(anim, { timeScale: ts }); return d; };
  set('weed', 2.1, 0.4, -1, 'Idle');
  set('gin', 3.8, -1.3, -1, 'Idle_2');
  set('smith', 0.5, -1.4, 1, 'Idle_2_HeadLow');
  set('jerome', 5.4, -2.6, -1, 'Idle');
  const k = set('kaibutsu', 11, -7.5, -1, 'Idle', 0.6);
  k.weakReveal = 0;
  k.eyes.material.color.set(0xffb030); k.eyes.scale.setScalar(0.5);
  E.camPos.set(-0.6, 1.3, 6.2); E.camLook.set(2.6, 1.1, -0.5);
  UI.show('menu', true); UI.show('castScreen', false); UI.show('hud', false);
  const mem = JSON.parse(safeGet('weed.memorial') || '[]');
  if (mem.length) { $('memorial').innerHTML = `Memorial stone: <b>${mem.join(' · ')}</b> ✦`; UI.show('memorial', true); }
  music('intro');
}
function safeGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

E.updaters.add((dt, dtr) => {
  if (mode === 'menu') {
    const t = E.realTime * 0.15;
    E.camPos.x = -0.6 + Math.sin(t) * 0.35; E.camPos.y = 1.3 + Math.sin(t * 1.3) * 0.12;
  }
  if (mode === 'cast') castUpdate(dt, dtr);
});

// ---------------------------------------------------------------- The Pack: every character, rotating + animated
const GAL_Z = -40;                 // gallery row lives behind the arena
const gallery = { dogs: {}, xs: {}, loaded: false };
let castIdx = 0, castT = 0, demoIdx = -1;
const DEMO = ['Idle', 'Walk', 'Gallop', 'Attack', 'Gallop_Jump', 'Bark', 'Idle_HitReact1', 'Battoga', 'Death', 'LieDown', 'Howl'];
const ONCE = ['Attack', 'Gallop_Jump', 'Idle_HitReact1', 'Death', 'Bark'];

function galDog(id) {
  if (gallery.dogs[id]) return gallery.dogs[id];
  const d = makeDog(id); E.scene.add(d.root); gallery.dogs[id] = d; return d;
}
async function ensureGallery() {
  if (gallery.loaded) return;
  UI.show('loading', true); $('loadingText').textContent = 'Gathering the whole pack…';
  await loadFor(ROSTER);
  UI.show('loading', false);
  // lay everyone out in a row, spacing by body length
  let x = 0;
  ROSTER.forEach((id, i) => {
    const d = galDog(id);
    const half = Math.max(0.8, d.length * 0.55);
    if (i) x += half;
    gallery.xs[id] = x; x += half + 0.6;
    d.root.position.set(gallery.xs[id], 0, GAL_Z); d.face(1, true); d.root.visible = false;
    d.play(i % 3 === 0 ? 'Walk' : i % 3 === 1 ? 'Idle' : 'Idle_2');
  });
  E.updaters.add((dt) => { if (mode === 'cast') for (const d of Object.values(gallery.dogs)) if (d.root.visible) d.update(dt); });
  gallery.loaded = true;
}
function hideGallery() { for (const d of Object.values(gallery.dogs)) d.root.visible = false; }

async function showCast(i) {
  initAudio();
  await ensureGallery();
  mode = 'cast';
  for (const d of Object.values(cast)) d.root.visible = false;
  castIdx = (i + ROSTER.length) % ROSTER.length; castT = 0; demoIdx = -1;
  const id = ROSTER[castIdx]; const c = CHARACTERS[id];
  for (const [k, d] of Object.entries(gallery.dogs)) {
    const near = Math.abs(ROSTER.indexOf(k) - castIdx) <= 2;
    d.root.visible = near; d.fade(1); d.spin.rotation.set(0, 0, 0);
    if (near && k !== id) d.play(['Walk', 'Idle', 'Idle_2', 'Gallop'][ROSTER.indexOf(k) % 4], { timeScale: 0.8 });
  }
  const d = gallery.dogs[id];
  if (d.weak) d.weakReveal = 1;
  $('castName').textContent = c.name;
  $('castJp').textContent = '';
  $('castRole').textContent = c.role || '';
  $('castCount').textContent = `${castIdx + 1} / ${ROSTER.length}`;
  UI.show('menu', false); UI.show('castScreen', true);
  // smooth camera glide along the row
  const h = d.height, x = gallery.xs[id];
  tween(E.camLook, { x, y: h * 0.5, z: GAL_Z }, 0.6, { real: true, ease: 'out' });
}
function castUpdate(dt, dtr) {
  const id = ROSTER[castIdx]; const d = gallery.dogs[id]; if (!d) return;
  const h = d.height, x = gallery.xs[id];
  castT += dtr;
  // everyone visible turns slowly on their own turntable; the focused one a bit faster
  for (const [k, g] of Object.entries(gallery.dogs)) if (g.root.visible) g.root.rotation.y += dtr * (k === id ? 0.5 : 0.25);
  const dist = Math.max(2.3, h * 1.7 + d.length * 0.35);
  E.camPos.lerp(new THREE.Vector3(x - dist * 0.32, h * 0.7 + 0.25, GAL_Z + dist), Math.min(1, dtr * 3));
  E.camLook.lerp(new THREE.Vector3(x - dist * 0.22, h * 0.5, GAL_Z), Math.min(1, dtr * 3));   // hahmo oikealle, teksti vasemmalle
  const slot = Math.floor(castT / 2.2) % DEMO.length;
  if (slot !== demoIdx) {
    demoIdx = slot;
    const name = DEMO[slot];
    d.spin.rotation.set(0, 0, 0);
    if (name === 'Battoga') {
      const z = d.hasClip && d.hasClip('Zetsu') && id === 'weed';
      d.play(z ? 'Zetsu' : 'Battoga', { loop: false });
      FX.vortex(d.root, 1, h * 0.9, 1.0, z);
      if (!(d.hasClip && d.hasClip('Battoga'))) tween(d.spin.rotation, { z: -Math.PI * 4, x: Math.PI * 2 }, 1.0, { real: true }).then(() => d.spin.rotation.set(0, 0, 0));
      FX.slashArc(new THREE.Vector3(x, h * 0.5, GAL_Z), 0xcfeaff, h * 0.9, 0.7);
    } else d.play(name, { loop: !ONCE.includes(name) });
  }
}

// ---------------------------------------------------------------- game
async function startGame(phase = 1, intro = true) {
  initAudio();
  requestLandscape();
  mode = 'level';
  hideGallery();
  UI.show('menu', false); UI.show('castScreen', false); UI.show('result', false);
  for (const d of Object.values(cast)) d.root.rotation.set(0, 0, 0);
  await startLevel({ phase, intro });
}

function requestLandscape() {
  try {
    const el = document.documentElement;
    if (matchMedia('(pointer: coarse)').matches && el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
    }
  } catch (_) {}
}

function syncSettingLabels() {
  $('soundBtn').textContent = `Sound: ${muted ? 'off' : 'on'}`;
  $('subsBtn').textContent = `Subtitles: ${settings.subs ? 'on' : 'off'}`;
}

function wireUI() {
  const tap = (id, fn) => $(id).addEventListener('click', e => { e.stopPropagation(); initAudio(); fn(); });
  tap('startBtn', () => startGame(1, true));
  tap('castBtn', () => showCast(0));
  tap('castNext', () => showCast(castIdx + 1));
  tap('castPrev', () => showCast(castIdx - 1));
  tap('castBack', () => showMenu());
  tap('soundBtn', () => { setMuted(!muted); syncSettingLabels(); });
  tap('subsBtn', () => { setPref('subs', !settings.subs); syncSettingLabels(); });
  tap('pauseBtn', () => setPaused(true));
  tap('resumeBtn', () => setPaused(false));
  tap('helpBtn', () => { UI.show('pause', false); UI.show('help', true); });
  tap('helpClose', () => { UI.show('help', false); UI.show('pause', true); });
  tap('quitBtn', () => { quit(); showMenu(); });
  tap('retryBtn', () => retryPhase());
  tap('defeatQuit', () => { quit(); showMenu(); });
  tap('resultBtn', () => { quit(); showMenu(); });
  tap('rotateIgnore', () => document.body.classList.add('ignorerotate'));
  const skip = () => { E.skipping = true; };
  tap('skipBtn', skip);
  let lp = null;
  $('touch').addEventListener('pointerdown', () => { initAudio(); if (document.body.classList.contains('cine')) lp = setTimeout(skip, 700); });
  $('touch').addEventListener('pointerup', () => clearTimeout(lp));
  // first touch anywhere unlocks audio (mobile autoplay rules)
  const unlock = () => { initAudio(); window.removeEventListener('pointerdown', unlock, true); };
  window.addEventListener('pointerdown', unlock, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'level') setPaused(true); });
  syncSettingLabels();
}

window.__game = { E, cast, debug, startGame, showMenu, showCast, sfx, audioStats, currentMusic, gallery, ROSTER };
boot().catch(err => {
  console.error(err);
  $('loading').innerHTML = `<div>Loading failed: ${String(err.message || err)}</div>`;
});
