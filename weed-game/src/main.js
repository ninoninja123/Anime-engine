// Boot: loading, main menu, The Pack (character gallery), level start, pause, landscape lock, settings.
import './style.css';
import * as THREE from 'three';
import { E, initEngine, tween } from './engine.js';
import { loadFor, makeDog, isLoaded } from './dogs.js';
import { CHARACTERS, ROSTER } from './characters.js';
import { buildWorld } from './world.js';
import { initInput } from './input.js';
import { initAudio, setMuted, muted, music, sfx, audioStats, currentMusic, musicState } from './audio.js';
import { settings, setPref } from './voice.js';
import * as FX from './fx.js';
import * as UI from './ui.js';
import { cast, createCast, startLevel, retryPhase, setPaused, quit, debug } from './level2.js';
import { runPrologue, shouldPlayPrologue } from './prologue.js';
import './data/level1_config.js';          // prologue chapter characters (Sakura, Blue, Hook, ...) -> CHARACTERS + The Pack
import { startLevel1, quit1, setPaused1, retry1, isLevel1Active, debug1, SECTIONS } from './level1.js';
import './data/level3_config.js';          // level 3 placeholder characters (Reika, Hiro, Lefty, ...) -> CHARACTERS
import { startLevel3, quit3, setPaused3, retry3, isLevel3Active, debug3, SECTIONS3 } from './level3.js';

const $ = UI.$;
let mode = 'menu';

async function boot() {
  if (E.params.has('soundtest')) { UI.show('loading', false); (await import('./soundtest.js')).openSoundTest(); return; }   // ?soundtest: jokainen ääni napista
  initEngine($('gl'));
  initInput($('touch'), $('overlay'));
  FX.setOverlay($('overlay').getContext('2d'));
  buildWorld();
  await createCast();             // loads only the models level 2 needs
  UI.show('loading', false);
  wireUI();
  showMenu();
  const p = E.params;
  const lv = p.get('level');
  if (lv === '1') { const sec = p.get('section'); startChapter(sec ? (isNaN(+sec) ? Math.max(0, SECTIONS.indexOf(sec)) : +sec) : 0, p.has('story')); return; }
  if (lv === '2') { startGame(1, !p.has('nointro')); return; }
  if (lv === '3') { const sec = p.get('section'); startLevel3Flow(sec ? (isNaN(+sec) ? Math.max(0, SECTIONS3.indexOf(sec)) : +sec) : 0, Number(p.get('wave') || 0)); return; }
  if (p.has('prologue') && !(p.has('play') || p.has('phase'))) startGame(1, true);
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
  UI.show('menu', true); UI.show('castScreen', false); UI.show('hud', false); UI.show('result1', false); UI.show('result3', false);
  const l3open = safeGet('weed.cleared2') || safeGet('weed.l3done') === '1';
  $('level3Btn').classList.toggle('locked', !l3open);
  $('l3note').textContent = l3open ? (safeGet('weed.l3done') === '1' ? ' ✓' : '') : ' · after Level 2';
  const done = safeGet('weed.p1done') === '1';
  $('l2note').textContent = done ? '' : ' · Prologue first';
  $('prologueBtn').textContent = done ? '▶ Prologue: Weed and GB ✓' : '▶ Prologue: Weed and GB';
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
  // the illustrated prologue ("The story so far") leads into the level's own intro cutscene; once the playable
  // Prologue chapter has been played it already told that story, so it is skipped (?prologue forces it)
  const chapterDone = safeGet('weed.p1done') === '1' && !E.params.has('prologue');
  if (intro && phase === 1 && !chapterDone && shouldPlayPrologue()) await runPrologue();
  await startLevel({ phase, intro });
}

// ---------------------------------------------------------------- the playable Prologue chapter (level 1)
async function startChapter(section = 0, story = true) {
  initAudio();
  requestLandscape();
  mode = 'level';
  hideGallery();
  for (const d of Object.values(cast)) d.root.visible = false;
  UI.show('menu', false); UI.show('castScreen', false); UI.show('result', false); UI.show('result1', false);
  // "The story so far" (legend of Gin -> the monster) stays in front of the chapter
  if (story && section === 0 && shouldPlayPrologue()) await runPrologue();
  await startLevel1({ section, onDone: () => { UI.show('hud', false); UI.cine(false); UI.show('result1', true); sfx.victory(); } });
}

// ---------------------------------------------------------------- level 3: The Alps Trap – John's Last Stand
async function startLevel3Flow(section = 0, wave = 0) {
  initAudio();
  requestLandscape();
  mode = 'level';
  hideGallery();
  for (const d of Object.values(cast)) d.root.visible = false;
  UI.show('menu', false); UI.show('castScreen', false); UI.show('result', false); UI.show('result1', false); UI.show('result3', false);
  await startLevel3({ section, wave, onDone: () => { UI.show('hud', false); UI.cine(false); UI.show('result3', true); sfx.victory(); } });
}

function standalonePWA() { return window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches; }
function setupFullscreenUX() {
  const coarse = matchMedia('(pointer: coarse)').matches; if (!coarse) { const b = document.getElementById('fsBtn'); if (b) b.style.display = 'none'; return; }
  // first tap anywhere: go fullscreen where the browser allows it (Android Chrome etc.)
  document.addEventListener('pointerdown', () => requestLandscape(), { once: true, capture: true });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && mode === 'level') { /* re-enter on the next tap */ document.addEventListener('pointerdown', () => requestLandscape(), { once: true, capture: true }); } });
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false; try { dismissed = localStorage.getItem('weed.fshint') === '1'; } catch (_) {}
  if (ios && !standalonePWA() && !dismissed) {
    const h = document.getElementById('fsHint'); if (h) { h.classList.remove('hidden'); const x = document.getElementById('fsHintX'); if (x) x.addEventListener('click', () => { h.classList.add('hidden'); try { localStorage.setItem('weed.fshint', '1'); } catch (_) {} }); }
  }
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
  setupFullscreenUX(); { const fb = document.getElementById('fsBtn'); if (fb) fb.addEventListener('click', () => requestLandscape()); }
  // napin ääni: oletuksena klik; aloitus/paluu/ohitus omilla äänillä (pause/resume soittaa setPaused)
  const UI_SND = { startBtn: 'start', castBack: 'uiBack', quitBtn: 'uiBack', defeatQuit: 'uiBack', resultBtn: 'uiBack', helpClose: 'uiBack', skipBtn: 'skip', pauseBtn: null, resumeBtn: null, retryBtn: 'uiConfirm' };
  const tap = (id, fn) => { const el = $(id); if (!el) return; el.addEventListener('click', e => { e.stopPropagation(); initAudio(); const s = id in UI_SND ? UI_SND[id] : 'ui'; if (s) sfx.play(s); fn(); }); };
  tap('startBtn', () => startGame(1, true));
  tap('prologueBtn', () => startChapter(0, true));
  tap('nextBtn', () => { UI.show('result1', false); startGame(1, true); });
  tap('result1Menu', () => { UI.show('result1', false); showMenu(); });
  tap('level3Btn', () => { if ($('level3Btn').classList.contains('locked')) { UI.toast('Clear Level 2 first', 1.4); return; } startLevel3Flow(0); });
  tap('next3Btn', () => { UI.show('result', false); quit(); startLevel3Flow(0); });
  tap('result3Menu', () => { UI.show('result3', false); showMenu(); });
  tap('castBtn', () => showCast(0));
  tap('storyBtn', async () => { UI.show('menu', false); await runPrologue({ force: true }); showMenu(); });
  tap('castNext', () => showCast(castIdx + 1));
  tap('castPrev', () => showCast(castIdx - 1));
  tap('castBack', () => showMenu());
  tap('soundBtn', () => { setMuted(!muted); syncSettingLabels(); });
  tap('subsBtn', () => { setPref('subs', !settings.subs); syncSettingLabels(); });
  tap('pauseBtn', () => { if (!setPaused3(true) && !setPaused1(true)) setPaused(true); });
  tap('resumeBtn', () => { if (!setPaused3(false) && !setPaused1(false)) setPaused(false); });
  tap('helpBtn', () => { UI.show('pause', false); UI.show('help', true); });
  tap('helpClose', () => { UI.show('help', false); UI.show('pause', true); });
  tap('quitBtn', () => { quit3(); quit1(); quit(); showMenu(); });
  tap('retryBtn', () => (isLevel3Active() ? retry3() : isLevel1Active() ? retry1() : retryPhase()));
  tap('defeatQuit', () => { quit3(); quit1(); quit(); showMenu(); });
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
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'level') { if (!setPaused3(true) && !setPaused1(true)) setPaused(true); } });
  syncSettingLabels();
}

window.__game = { E, cast, debug, debug1, debug3, startLevel3Flow, startChapter, startGame, showMenu, showCast, sfx, audioStats, currentMusic, musicState, gallery, ROSTER };
boot().catch(err => {
  console.error(err);
  $('loading').innerHTML = `<div>Loading failed: ${String(err.message || err)}</div>`;
});
