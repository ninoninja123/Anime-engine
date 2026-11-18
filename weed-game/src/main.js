// Käynnistys: lataus, päävalikko, Lauma-esittely, tason käynnistys, tauko, vaakatila.
import './style.css';
import * as THREE from 'three';
import { E, initEngine, tween } from './engine.js';
import { loadDogBase } from './dogs.js';
import { buildWorld } from './world.js';
import { initInput } from './input.js';
import { initAudio, setMuted, muted, music, sfx } from './audio.js';
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
  await loadDogBase(new URL('models/dog_base.glb', document.baseURI).href);
  createCast();
  UI.show('loading', false);
  wireUI();
  showMenu();

  // suorat testilinkit: ?play=1 (ohita valikko), ?phase=2|3, ?nointro
  const p = E.params;
  if (p.has('play') || p.has('phase')) startGame(Number(p.get('phase') || 1), !p.has('nointro'));
}

// ---------- päävalikko: koirat lumisella harjanteella ----------
function showMenu() {
  mode = 'menu';
  for (const d of Object.values(cast)) d.root.visible = false;
  const set = (id, x, z, face, anim, ts = 1) => { const d = cast[id]; d.root.visible = true; d.fade(1); d.root.position.set(x, 0, z); d.face(face, true); d.spin.rotation.set(0, 0, 0); d.play(anim, { timeScale: ts }); return d; };
  set('weed', 2.1, 0.4, -1, 'Idle');
  set('gin', 3.7, -1.2, -1, 'Idle_2');
  set('smith', 0.7, -1.4, 1, 'Idle_2_HeadLow');
  set('jerome', 5.2, -2.4, -1, 'Idle');
  const k = set('kaibutsu', 10.5, -7, -1, 'Idle', 0.6);
  k.weakReveal = 0;
  k.eyes.material.color.set(0xffb030); k.eyes.scale.setScalar(0.5);
  E.camPos.set(-0.6, 1.3, 6.2); E.camLook.set(2.6, 1.1, -0.5);
  UI.show('menu', true); UI.show('castScreen', false); UI.show('hud', false);
  const mem = JSON.parse(safeGet('weed.memorial') || '[]');
  if (mem.length) { $('memorial').innerHTML = `Muistokivi: <b>${mem.join(' · ')}</b> ✦`; UI.show('memorial', true); }
  music('calm');
}
function safeGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }

// kevyt kameran huojunta valikossa
E.updaters.add((dt, dtr) => {
  if (mode === 'menu') {
    const t = E.realTime * 0.15;
    E.camPos.x = -0.6 + Math.sin(t) * 0.35; E.camPos.y = 1.3 + Math.sin(t * 1.3) * 0.12;
  }
  if (mode === 'cast') castUpdate(dtr);
});

// ---------- Lauma: esittely, jossa näkyvät animaatiot ----------
const ROSTER = [
  ['weed', 'Akita. Pieni mutta nopea. Ei hyväksy turhaa tappamista. Liike: Battōga.'],
  ['gin', 'Weedin isä, Ōun legendaarinen johtaja. Kutsuu alaisiaan tovereiksi.'],
  ['smith', 'Kolmijalkainen veteraani. Menetti jalkansa pelastaessaan GB:n rekan alta.'],
  ['jerome', 'Saksanpaimenkoira, laboratorion entinen vartija ja lauman strategi.'],
  ['ken', 'Tanskandogi, Benin poika. Riitelee aluksi Kagetoran kanssa.'],
  ['kagetora', 'Kai-koira, Kurotoran poika. Kenin ystävä.'],
  ['kaibutsu', 'P4. Geenikokeilla muutettu, leijonamainen koira. Heikko kohta: karvaton vasen kylki.'],
];
const DEMO = ['Idle', 'Walk', 'Gallop', 'Attack', 'Gallop_Jump', 'Idle_HitReact1', 'Death'];
let castIdx = 0, castT = 0, demoIdx = 0;
function showCast(i) {
  mode = 'cast';
  castIdx = (i + ROSTER.length) % ROSTER.length; castT = 0; demoIdx = 0;
  for (const d of Object.values(cast)) d.root.visible = false;
  const [id, role] = ROSTER[castIdx];
  const d = cast[id]; d.root.visible = true; d.fade(1);
  d.root.position.set(0, 0, 0); d.face(1, true); d.play('Idle');
  if (d.weak) d.weakReveal = id === 'kaibutsu' ? 1 : 0;
  $('castName').textContent = d.name;
  $('castRole').textContent = role;
  UI.show('menu', false); UI.show('castScreen', true);
}
function castUpdate(dtr) {
  const [id] = ROSTER[castIdx];
  const d = cast[id]; const h = d.height;
  castT += dtr;
  const a = castT * 0.35 + 0.6;
  E.camPos.set(Math.sin(a) * h * 3.2, h * 0.75, Math.cos(a) * h * 3.2);
  E.camLook.set(0, h * 0.45, 0);
  const slot = Math.floor(castT / 2.4) % DEMO.length;
  if (slot !== demoIdx) {
    demoIdx = slot;
    const name = DEMO[slot];
    d.spin.rotation.z = 0;
    if (name === 'Gallop_Jump' && id === 'weed') {
      d.play('Gallop_Jump', { loop: false });
      tween(d.spin.rotation, { z: -Math.PI * 4 }, 0.9, { real: true }).then(() => { d.spin.rotation.z = 0; });
      FX.slashArc(new THREE.Vector3(0, h * 0.5, 0), 0xcfeaff, h * 0.9, 0.7);
    } else d.play(name, { loop: !['Attack', 'Gallop_Jump', 'Idle_HitReact1', 'Death'].includes(name) });
  }
}

// ---------- peli ----------
async function startGame(phase = 1, intro = true) {
  initAudio();
  requestLandscape();
  mode = 'level';
  UI.show('menu', false); UI.show('castScreen', false); UI.show('result', false);
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

function wireUI() {
  const tap = (id, fn) => $(id).addEventListener('click', e => { e.stopPropagation(); initAudio(); fn(); });
  tap('startBtn', () => startGame(1, true));
  tap('castBtn', () => showCast(0));
  tap('castNext', () => showCast(castIdx + 1));
  tap('castPrev', () => showCast(castIdx - 1));
  tap('castBack', () => showMenu());
  tap('soundBtn', () => { setMuted(!muted); $('soundBtn').textContent = `Ääni: ${muted ? 'pois' : 'päällä'}`; });
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
  // pitkä painallus ohittaa cutscenen
  let lp = null;
  $('touch').addEventListener('pointerdown', () => { if (document.body.classList.contains('cine')) lp = setTimeout(skip, 700); });
  $('touch').addEventListener('pointerup', () => clearTimeout(lp));
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'level') setPaused(true); });
}

window.__game = { E, cast, debug, startGame, showMenu, showCast, sfx };
boot().catch(err => {
  console.error(err);
  $('loading').innerHTML = `<div>Lataus epäonnistui: ${String(err.message || err)}</div>`;
});
