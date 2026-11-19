// LEVEL 1 – PROLOGUE "Weed and GB" (anime ep. 1–2). Chapter = sections played in order, each a checkpoint:
//   opening (scene) → farm run (side-scrolling runner) → the farm Tosa (light 2-phase fight, Weed's first Battōga)
//   → Sakura (scene: her death, the name) → Jōshū run (lead Mel away from the dog catcher) → Hook (scene)
//   → Blue (2-phase fight, Mel is set on Weed) → the truck (scene + "leap the fence" action) → ending (scene).
// Shares the engine, scene runner, voice/subtitles, gestures, FX and HUD with level 2 (no level2.js changes).
import * as THREE from 'three';
import { E, tween, wait, shake } from './engine.js';
import { loadFor, makeDog } from './dogs.js';
import * as FX from './fx.js';
import { sfx, music, ambience, preloadMusic, preloadSfx } from './audio.js';
import { initFootsteps, setSurface } from './footsteps.js';
import { say, preloadLines, stopVoice } from './voice.js';
import { runScene, setSceneCast } from './scenes.js';
import { setMood } from './gfx/mood.js';
import * as UI from './ui.js';
import { onGesture, setInputEnabled } from './input.js';
import * as PR from './shared/props.js';
import * as SETS from './shared/sets.js';
import { drift, grade } from './shared/cine.js';
import { vehicleSound, horn } from './shared/synth.js';
import { resetActing } from './shared/acting.js';
import { ACTORS, RUNS, FIGHTS } from './data/level1_config.js';
import * as SC from './data/scenes_level1.js';
import { cast as cast2 } from './level2.js';

E.V3 = E.V3 || THREE.Vector3;
export const SECTIONS = ['opening', 'farmRun', 'tosa', 'sakura', 'townRun', 'blue', 'truck', 'ending'];
export const cast1 = {};
const ABORT = new Error('level1-abort');
const S1 = { active: false, paused: false, mode: null, token: 0, retry: null, onDone: null, section: 0 };
window.__S1 = S1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const save = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

// ---------------------------------------------------------------- props (one instance each, shown per scene)
const P = {
  objs: {},
  make(name) {
    if (this.objs[name]) return this.objs[name];
    let o;
    switch (name) {
      case 'scrap': o = PR.scrap(); break;
      case 'kennel': o = PR.kennel(); break;
      case 'pond': o = PR.pond(1.5); break;
      case 'den': o = PR.den(); break;
      case 'rootDen': o = SETS.rootDen(); break;
      case 'moonbeam': o = new THREE.Group(); { const b = SETS.beam({ h: 8, r0: 0.35, r1: 1.6, color: 0xb8ccff, alpha: 0.3 }); b.position.y = 8; b.rotation.z = 0.22; o.add(b); o.userData.beam = b; } break;
      case 'sunbeam': o = new THREE.Group(); { const b = SETS.beam({ h: 9, r0: 0.5, r1: 1.9, color: 0xffd7a0, alpha: 0.26 }); b.position.y = 9; b.rotation.z = -0.38; o.add(b); o.userData.beam = b; } break;
      case 'weedPlant': o = PR.weedPlant(); break;
      case 'road': o = PR.road(140, 2.6); break;
      case 'netFence': o = PR.netFence(60, 1.0); break;
      case 'netThrow': o = PR.hangingNet(0.4); break;
      case 'hookKennel': o = PR.kennel(); o.scale.setScalar(0.85); o.rotation.y = 0.5; break;
      case 'town': {
        o = new THREE.Group();
        const cols = [0xb8a890, 0xa89480, 0xc4b49c, 0x9c8c7c, 0xb4a490];
        for (let i = 0; i < 9; i++) { const h = PR.house(2.6 + (i % 3) * 0.5, 2 + (i % 2) * 0.7, cols[i % 5]); h.position.set(-20 + i * 5, 0, (i % 2) * -1.6); o.add(h); }
        for (let i = 0; i < 6; i++) { const f = PR.fence(1.4, 0.6, 0x7a6a5a); f.rotation.y = Math.PI / 2; f.position.set(-12 + i * 1.45, 0, 3.2); o.add(f); }
        break;
      }
      default: return null;
    }
    o.visible = false; E.scene.add(o); this.objs[name] = o; return o;
  },
  show(name, x = 0, z = 0) { const o = this.make(name); if (!o) return; if (o.parent !== E.scene) E.scene.add(o); o.visible = true; o.position.set(x, 0, z); return o; },
  hide(name) { const o = this.objs[name]; if (o) o.visible = false; },
  hideAll() { for (const k in this.objs) this.objs[k].visible = false; for (const t of trucks) t.visible = false; truckSnd.forEach((s, i) => { if (s) { s.stop(); truckSnd[i] = null; } }); },
  attach(name, dog) { const o = this.make(name); dog.root.add(o); o.position.set(0.24, 0, 0.0); o.visible = true; },
  breakKennel() {
    const k = this.objs.kennel; if (!k) return;
    k.userData.planks.forEach((p, i) => {
      const dx = (Math.random() - 0.5) * 1.4, dz = 0.8 + Math.random() * 1.2;
      tween(p.position, { x: p.position.x + dx, y: 0.06, z: p.position.z + dz }, 0.5 + Math.random() * 0.3, { ease: 'out' });
      tween(p.rotation, { x: Math.PI / 2 * (0.6 + Math.random() * 0.4), z: (Math.random() - 0.5) * 1.5 }, 0.5, { ease: 'out' });
    });
    FX.debrisBurst(k.position.clone().add(new THREE.Vector3(0, 0.5, 0.7)), 10);
  },
  resetKennel() { const k = this.objs.kennel; if (!k) return; for (const p of k.userData.planks) { p.position.copy(p.userData.home); p.rotation.set(0, 0, 0); } },
};
const trucks = [];
const truckSnd = [];
function truckRun(i, { from = -34, to = 34, t = 2.4, honk = false, keep = false } = {}) {
  if (!trucks[i]) { trucks[i] = PR.truck(i ? 0x6a3a3a : 0x3a5a7a); trucks[i].scale.setScalar(0.85); E.scene.add(trucks[i]); }
  const tr = trucks[i]; tr.visible = true; tr.position.set(from, 0, -4.6);
  if (!truckSnd[i]) truckSnd[i] = vehicleSound(tr);                   // engine + tyres, Doppler (src/shared/synth.js)
  if (honk) horn(honk === true ? 1.0 : honk);
  const id = tr.userData.run = (tr.userData.run || 0) + 1;              // a newer run of the same truck wins
  const o = { x: from };
  return tween(o, { x: to }, t, { ease: 'linear', onUpdate: () => { if (tr.userData.run === id) tr.position.x = o.x; } }).then(() => { if (tr.userData.run !== id) return; if (!keep) { tr.visible = false; if (truckSnd[i]) { truckSnd[i].stop(); truckSnd[i] = null; } } });
}

// ---------------------------------------------------------------- world: hide Gajō-specific set dressing
let hiddenWorld = [];
function setWorldForPrologue(on) {
  if (on) {
    hiddenWorld = [];
    if (E.cliff && E.cliff.visible) { E.cliff.visible = false; hiddenWorld.push(E.cliff); }
    E.scene.traverse(o => { const p = o.geometry && o.geometry.parameters; if (o.isMesh && p && ((p.width === 3.4 && p.height === 27) || (p.width === 1.3 && p.height === 15)) && o.visible) { o.visible = false; hiddenWorld.push(o); } });
  } else { for (const o of hiddenWorld) o.visible = true; hiddenWorld = []; }
}

// ---------------------------------------------------------------- cast
let castReady = null;
export function loadCast1() {
  if (castReady) return castReady;
  castReady = loadFor(Object.values(ACTORS)).then(() => {
    for (const [role, id] of Object.entries(ACTORS)) {
      const d = makeDog(id); d.id = role;          // role id = voice "who" (mouth animation) + footsteps key
      d.root.visible = false; E.scene.add(d.root); cast1[role] = d;
    }
  });
  return castReady;
}
function hideCast() { for (const d of Object.values(cast1)) { d.root.visible = false; d.lookTarget = null; d.expr && d.expr(null); d.setTint(0, 0); d.model.scale.y = d.height; } }

let updaterOn = false, gestureOff = null;
function enter() {
  S1.active = true; S1.paused = false;
  setSceneCast(cast1); initFootsteps(cast1);
  if (window.__game) { window.__game.prevCast = window.__game.cast; window.__game.cast = cast1; }
  setWorldForPrologue(true);
  if (!updaterOn) { E.updaters.add(update); updaterOn = true; }
  if (!gestureOff) gestureOff = onGesture(handleGesture);
  const hk = UI.$('henki'); if (hk && !hk.dataset.l1) { hk.dataset.l1 = '1'; hk.addEventListener('pointerdown', e => { if (!S1.active || !F) return; e.stopPropagation(); if (F.W.henki >= 1) fightBattoga(); }); }
  for (const d of Object.values(cast2)) d.root.visible = false;
}
function leave() {
  S1.active = false; S1.mode = null;
  setSceneCast(cast2); initFootsteps(cast2);
  if (window.__game && window.__game.prevCast) window.__game.cast = window.__game.prevCast;
  setWorldForPrologue(false);
  hideCast(); P.hideAll(); clearRunObjs();
  UI.$('bossbox').classList.remove('hidden');
  UI.$('henki').classList.remove('hidden');
  if (bossNameOrig !== null) UI.$('bossbox').querySelector('.nm').innerHTML = bossNameOrig;
  UI.$('cards').innerHTML = '';
  E.timeScale = 1; E.skipping = false; FX.speedLines(0); E.camRoll = 0;
  setSurface('step');
}

// ---------------------------------------------------------------- chapter flow
export async function startLevel1({ section = 0, onDone } = {}) {
  S1.onDone = onDone; S1.token++;
  const tok = S1.token;
  UI.show('loading', true); UI.$('loadingText').textContent = 'Following a small pup…';
  await loadCast1();
  UI.show('loading', false);
  enter();
  preloadMusic('sad', 'dawn', 'battle', 'smith', 'smith2');
  preloadSfx('boss', 'cine');
  await wait(0.35, true);            // let the mood director settle on the level context before scene moods
  try {
    for (let i = clamp(section, 0, SECTIONS.length - 1); i < SECTIONS.length; i++) {
      S1.section = i; save('weed.p1.section', String(i));
      await SECTION_FNS[SECTIONS[i]](tok);
      check(tok);
    }
  } catch (e) { if (e !== ABORT) console.error(e); return; }
  save('weed.p1done', '1'); save('weed.p1.section', '0');
  leave();
  if (S1.onDone) S1.onDone();
}
function check(tok) { if (tok !== S1.token || !S1.active) throw ABORT; }

// scenes.js re-dispatches a skipped `place` step to itself while E.skipping is on (endless recursion); place steps are
// therefore run here as `fn` steps, which the scene runner always executes (also when skipping).
function placeNow(s) {
  const d = cast1[s.place]; if (!d) return;
  d.root.visible = true; d.fade(E.skipping ? 1 : (s.fade ?? 1));
  d.root.position.set(s.x ?? d.root.position.x, s.y ?? 0, s.z ?? d.root.position.z);
  if (s.face) d.face(s.face, true);
  d.spin.rotation.set(0, 0, 0);
  if (s.anim) d.play(s.anim, { timeScale: s.ts || 1, loop: s.loop ?? true });
}
function safeSteps(steps) {
  return steps.map(s => s.place ? { fn: () => placeNow(s) } : s.par ? { ...s, par: safeSteps(s.par) } : s);
}
async function scene(steps, tok) {
  check(tok);
  steps = safeSteps(steps);
  UI.cine(true); UI.show('hud', false); UI.hint(''); setInputEnabled(false);
  S1.mode = 'scene';
  preloadLines(SC.linesOf(steps));
  drift({ push: 0.035, truck: 0.018 });            // the camera keeps creeping on every hold (src/shared/cine.js)
  await runScene(steps, ctx);
  drift(null); resetActing(cast1); grade({ t: 0 });
  E.skipping = false; E.timeScale = 1; FX.speedLines(0); stopVoice();
  check(tok);
}
const ctx = { cast: cast1, P, E, FX, sfx, wait, say, truckRun, setMood, horn, trucks };

const SECTION_FNS = {
  opening: async tok => { hideCast(); P.hideAll(); setSurface('step'); await scene(SC.opening(ctx), tok); },
  farmRun: async tok => { hideCast(); P.hideAll(); await scene(SC.farmIntro(ctx), tok); await loopUntilWin(() => runRun('farm', tok), tok); },
  tosa: async tok => {
    hideCast(); P.hideAll(); P.resetKennel();
    await scene(SC.tosaIntro(ctx), tok);
    await loopUntilWin(() => runFight('tosa', tok), tok, async () => { hideCast(); P.resetKennel(); P.show('kennel', 3.6, -1.6); P.show('pond', -2.5, -3.4); });
    await scene(SC.tosaEnd(ctx), tok);
  },
  sakura: async tok => { hideCast(); P.hideAll(); await scene(SC.sakura(ctx), tok); },
  townRun: async tok => {
    hideCast(); P.hideAll(); await scene(SC.journey(ctx), tok);
    await loopUntilWin(() => runRun('town', tok), tok);
    hideCast(); await scene(SC.hook(ctx), tok);
  },
  blue: async tok => {
    hideCast(); P.hideAll(); await scene(SC.blueIntro(ctx), tok);
    await loopUntilWin(() => runFight('blue', tok), tok, async () => { hideCast(); P.hideAll(); P.show('road', 0, -4.2); P.show('netFence', 0, -2.6); });
    await scene(SC.blueHook(ctx), tok);
  },
  truck: async tok => {
    hideCast(); P.hideAll(); P.show('road', 0, -4.2); P.show('netFence', 0, -2.6);
    await scene(SC.truckHit(ctx), tok);
    await leapAction(tok);
    await scene(SC.truckSave(ctx), tok);
    await scene(SC.blueDeath(ctx), tok);
  },
  ending: async tok => { hideCast(); P.hideAll(); await scene(SC.ending(ctx), tok); },
};

async function loopUntilWin(play, tok, reset) {
  for (;;) {
    check(tok);
    const ok = await play();
    check(tok);
    if (ok) return;
    const choice = await defeatPrompt();
    if (choice !== 'retry') throw ABORT;
    if (reset) await reset();
  }
}
function defeatPrompt() {
  return new Promise(res => {
    S1.retry = res;
    UI.show('hud', false); UI.show('defeat', true);
  });
}
export function retry1() { UI.show('defeat', false); if (S1.retry) { const r = S1.retry; S1.retry = null; r('retry'); } }

// ---------------------------------------------------------------- input
function handleGesture(g) {
  if (!S1.active || S1.paused) return;
  if (S1.mode === 'run') return runGesture(g);
  if (S1.mode === 'fight') return fightGesture(g);
  if (S1.mode === 'leap' && g.type === 'swipe' && g.dir === 'up' && leapRes) leapRes();
}

// ---------------------------------------------------------------- shared HUD bits
let bossNameOrig = null;
function setBossName(name, sub) {
  const nm = UI.$('bossbox').querySelector('.nm');
  if (bossNameOrig === null) bossNameOrig = nm.innerHTML;
  nm.innerHTML = `${name} <span class="sub">${sub || ''}</span>`;
}
let cards = [];
function buildGBCard(desc) {
  cards = [{ id: 'gb', name: 'GB', desc, color: '#2a2622', color2: '#efe7d7', cooldown: 13, cool: 5, state: 'cooldown' }];
  UI.buildCards(cards, id => useCard(id));
}
function useCard(id) {
  const c = cards.find(k => k.id === id); if (!c || !S1.active || S1.paused) return;
  if (c.state !== 'ready') { sfx.denied(); return; }
  c.state = 'cooldown'; c.cool = c.cooldown; sfx.card();
  if (S1.mode === 'run') runDecoy(); else if (S1.mode === 'fight') fightDecoy();
}
function tickCards(dt) {
  for (const c of cards) {
    if (c.state === 'cooldown') { c.cool -= dt; if (c.cool <= 0) { c.state = 'ready'; c.cool = 0; sfx.cardReady(); } }
    UI.updateCard(c);
  }
}

// ---------------------------------------------------------------- warning icon sprites
function iconSprite(text, color) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10,12,24,0.55)'; g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.fill();
  g.strokeStyle = color; g.lineWidth = 7; g.stroke();
  g.fillStyle = color; g.font = `900 ${text.length > 1 ? 40 : 70}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 68);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  s.scale.setScalar(0.55); s.renderOrder = 10; s.userData.noGfx = true; return s;
}
let ICONS = null;
const icon = k => { if (!ICONS) ICONS = { up: ['↑', '#9fe0ff'], down: ['↓', '#ffd27a'], tap: ['TAP', '#ff9a8a'] }; const [t, c] = ICONS[k]; return iconSprite(t, c); };

// =====================================================================================
//                                   RUNNER
// =====================================================================================
const KIND = { log: 'up', fence: 'up', hay: 'up', crate: 'up', beam: 'down', net: 'down', geese: 'tap' };
let R = null;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function genObstacles(cfg, key) {
  const r = rng(key === 'farm' ? 7 : 19), out = [];
  const pool = key === 'farm' ? ['log', 'log', 'beam', 'geese', 'fence', 'hay', 'beam', 'crate'] : ['crate', 'net', 'net', 'fence', 'geese', 'crate', 'net', 'beam'];
  let d = 16, last = '';
  while (d < cfg.length - 10) {
    let t = pool[Math.floor(r() * pool.length)];
    if (t === last && (t === 'geese' || r() < 0.6)) t = pool[(pool.indexOf(t) + 1) % pool.length];
    out.push([d, t]); last = t;
    const k = d / cfg.length;
    d += (9.5 - k * 3.2) + r() * 3;
  }
  return out;
}
function makeObstacle(type) {
  switch (type) {
    case 'log': return PR.log(1.6, 0.17);
    case 'fence': { const f = PR.fence(1.6, 0.5); f.rotation.y = 0; return f; }
    case 'hay': return PR.hay(0.27);
    case 'crate': return PR.crate(0.4);
    case 'beam': return PR.beam(0.36, 1.7);
    case 'net': return PR.hangingNet(0.36);
    case 'geese': return PR.geese(3);
  }
}
function clearRunObjs() { if (R) { for (const o of R.obs) { PR.dispose(o.obj); if (o.icon) { E.scene.remove(o.icon); o.icon.material.map.dispose(); } } R.obs = []; } }

function runRun(key, tok) {
  check(tok);
  const cfg = RUNS[key];
  clearRunObjs();
  hideCast(); P.hideAll();
  if (key === 'town') P.show('town', 0, -8);
  const w = cast1.weed; w.root.visible = true; w.fade(1); w.face(1, true); w.play('Gallop', { timeScale: 1.25 });
  const followers = key === 'farm' ? [['gb', -3.2, -0.9]] : [['mel', -1.5, 0.75], ['gb', -3.4, -0.9], ['smith', -4.6, -0.3]];
  for (const [id, , z] of followers) { const d = cast1[id]; d.root.visible = true; d.fade(1); d.face(1, true); d.play('Gallop', { timeScale: 1.2 }); d.root.position.z = z; }
  R = { key, cfg, d: 0, wx: -30, y: 0, vy: 0, slideT: 0, inv: 0, hp: cfg.hearts, obs: [], followers, calls: cfg.calls.map(c => ({ d: c[0], id: c[1], done: false })), wrapFx: 0, stumble: 0 };
  for (const [d, type] of genObstacles(cfg, key)) {
    const obj = makeObstacle(type); E.scene.add(obj);
    const ic = icon(KIND[type]); ic.visible = false; E.scene.add(ic);
    R.obs.push({ d, type, kind: KIND[type], obj, icon: ic, passed: false, cleared: false, h: obj.userData.h || 0.4 });
  }
  E.camPos.set(R.wx + 1.6, 1.25, 5.4); E.camLook.set(R.wx + 2.4, 0.45, 0);
  UI.cine(false); UI.show('hud', true); UI.$('bossbox').classList.add('hidden'); UI.$('henki').classList.add('hidden');
  UI.setHearts(R.hp, cfg.hearts);
  buildGBCard(key === 'farm' ? 'Decoy' : 'Clear the way');
  setInputEnabled(true);
  music('battle', { fade: 1 });
  ambience(key === 'farm' ? 'night' : 'battle');
  setMood(key === 'farm' ? 'autumn_night' : 'night', 1);
  UI.hint(cfg.hint, 6);
  S1.mode = 'run';
  sfx.levelStart();
  return new Promise(res => { R.done = res; });
}

function runGesture(g) {
  if (!R || R.over) return;
  const w = cast1.weed;
  if (g.type === 'swipe' && g.dir === 'up') {
    if (R.y > 0.02) return;
    R.vy = 7.6; R.y = 0.01; R.slideT = 0; sfx.jump(); w.play('Gallop_Jump', { loop: false, timeScale: 1.2 });
  } else if (g.type === 'swipe' && g.dir === 'down') {
    if (R.y > 0.3) { R.vy = Math.min(R.vy, -6); }
    R.slideT = 0.7; sfx.dodge ? sfx.dodge() : sfx.whoosh(); FX.dust(new THREE.Vector3(R.wx, 0.05, 0.1));
  } else if (g.type === 'tap' || g.type === 'arc' || (g.type === 'swipe' && (g.dir === 'right' || g.dir === 'left'))) {
    // bark: scatters birds ahead
    sfx.bark(); w.play('Bark', { loop: false }); setTimeout(() => { if (R && !R.over && R.y <= 0.02) w.play('Gallop', { timeScale: 1.25 }); }, 260);
    FX.ring(w.root.position.clone().add(new THREE.Vector3(0.3, 0.3, 0)), 0xffe0a0, 1.6, 0.35);
    for (const o of R.obs) { const ahead = o.d - R.d; if (o.kind === 'tap' && !o.cleared && ahead > -0.2 && ahead < 7.5) scatter(o); }
  }
}
function scatter(o) {
  o.cleared = true; o.icon.visible = false; sfx.whoosh();
  for (const b of o.obj.userData.birds || []) {
    tween(b.position, { y: 2.5 + Math.random() * 2, x: b.position.x + 2 + Math.random() * 3, z: b.position.z - 2 - Math.random() * 3 }, 1.2, { ease: 'in' });
    tween(b.rotation, { z: 0.6 }, 0.4);
  }
}
function runDecoy() {
  const next = R.obs.find(o => !o.passed && !o.cleared && o.d - R.d > 1.2 && o.d - R.d < 16);
  say('p_gb_decoy', { noWait: true });
  const gb = cast1.gb; gb.play('Gallop', { timeScale: 1.6 });
  if (!next) return;
  next.cleared = true; next.icon.visible = false;
  next.gbDash = 1;                       // GB sprints ahead and knocks it aside (handled in runUpdate)
  if (next.kind === 'tap') scatter(next);
}

function runUpdate(dt, dtr) {
  const w = cast1.weed, cfg = R.cfg;
  if (R.over) return;
  const v = cfg.speed * (R.stumble > 0 ? 0.55 : 1);
  R.stumble = Math.max(0, R.stumble - dt);
  R.d += v * dt; R.wx += v * dt;
  if (R.wx > 32) {                         // wrap the treadmill (hidden by a quick dip + speed lines)
    R.wx -= 64; E.camPos.x -= 64; E.camLook.x -= 64;
    E.post.fade = Math.max(E.post.fade, 0.5); FX.speedLines(0.6); R.wrapFx = 0.3;
  }
  if (R.wrapFx > 0) { R.wrapFx -= dtr; if (R.wrapFx <= 0) FX.speedLines(0); }
  // jump / slide
  if (R.y > 0 || R.vy > 0) {
    R.vy -= 25 * dt; R.y += R.vy * dt;
    if (R.y <= 0) { R.y = 0; R.vy = 0; sfx.land({}, { x: R.wx }); FX.dust(new THREE.Vector3(R.wx, 0.05, 0)); if (!R.over) w.play('Gallop', { timeScale: 1.25 }); }
  }
  R.slideT = Math.max(0, R.slideT - dt);
  const sq = R.slideT > 0 ? 0.52 : 1;
  w.model.scale.y += (w.height * sq - w.model.scale.y) * Math.min(1, dtr * 18);
  w.root.position.set(R.wx, R.y, 0);
  if (R.inv > 0) { R.inv -= dt; w.model.visible = Math.floor(R.inv * 14) % 2 === 0 || R.inv <= 0; } else w.model.visible = true;
  // followers
  R.followers.forEach(([id, off, z], i) => {
    const d = cast1[id];
    d.root.position.set(R.wx + off + Math.sin(E.time * 1.3 + i) * 0.25, 0, z);
  });
  // obstacles
  for (const o of R.obs) {
    const ahead = o.d - R.d;
    const x = R.wx + ahead;
    o.obj.position.x = x;
    o.obj.visible = ahead > -8 && ahead < 26;
    if (o.gbDash && o.gbDash > 0) {        // GB knocks the obstacle aside
      o.gbDash -= dt * 1.6;
      const gb = cast1.gb; gb.root.position.x = x - 0.6 * o.gbDash; gb.root.position.z = -0.4;
      if (o.gbDash <= 0.4 && !o.knocked) { o.knocked = true; sfx.hit(); FX.dust(new THREE.Vector3(x, 0.2, 0), true); tween(o.obj.position, { z: -2.2 }, 0.35, { ease: 'out' }); tween(o.obj.rotation, { y: 1.2 }, 0.35); }
      if (o.gbDash <= 0) { o.gbDash = 0; gb.root.position.z = -0.9; }
    }
    o.icon.visible = !o.passed && !o.cleared && ahead > 0.4 && ahead < 10;
    if (o.icon.visible) { o.icon.position.set(x, 1.15 + Math.sin(E.time * 6) * 0.05, 0.3); const k = clamp(1 - (ahead - 2) / 8, 0.35, 1); o.icon.scale.setScalar(0.38 + 0.25 * k); o.icon.material.opacity = 0.4 + 0.6 * k; }
    if (!o.passed && ahead < 0.15) {
      o.passed = true;
      let safe = o.cleared;
      if (!safe) safe = o.kind === 'up' ? R.y > o.h * 0.75 : o.kind === 'down' ? R.slideT > 0 : false;
      if (!safe && R.inv <= 0) runHit(o);
      else if (!o.cleared && !o.knocked) { if (o.kind === 'up') FX.ring(new THREE.Vector3(x, 0.3, 0), 0x9fe0ff, 0.9, 0.3); }
    }
  }
  // voice calls
  for (const c of R.calls) if (!c.done && R.d >= c.d) { c.done = true; say(c.id, { noWait: true }); }
  tickCards(dt);
  // camera: side-on, low (the pup is small), slight lead
  const cx = R.wx + 1.9, lead = R.y * 0.25;
  E.camPos.x += (cx - E.camPos.x) * Math.min(1, dtr * 6); E.camPos.y += (1.15 + lead - E.camPos.y) * Math.min(1, dtr * 3); E.camPos.z = 5.0;
  E.camLook.set(E.camPos.x + 0.6, 0.45 + lead * 0.5, 0);
  if (R.d >= cfg.length) { R.over = true; endRun(true); }
}
function runHit(o) {
  const w = cast1.weed;
  R.hp--; R.inv = 1.3; R.stumble = 0.5;
  UI.setHearts(R.hp, R.cfg.hearts);
  sfx.hurt(); shake(0.3); FX.flash('#ff2040', 0.3, 0.3);
  if (navigator.vibrate) try { navigator.vibrate(90); } catch (_) {}
  w.play('Idle_HitReact1', { loop: false, fade: 0.05 });
  setTimeout(() => { if (R && !R.over && R.y <= 0.02) w.play('Gallop', { timeScale: 1.25 }); }, 380);
  if (o.kind === 'tap') scatter(o);
  UI.toast(o.kind === 'up' ? 'Swipe ↑ to jump!' : o.kind === 'down' ? 'Swipe ↓ to duck!' : 'Tap to bark!', 1.2);
  if (R.hp <= 0) { R.over = true; endRun(false); }
}
async function endRun(ok) {
  S1.mode = 'runEnd';
  setInputEnabled(false);
  const w = cast1.weed; w.model.scale.y = w.height; w.model.visible = true;
  if (!ok) { w.play('Death', { loop: false }); sfx.die(); music(null); await wait(1.2, true); clearRunObjs(); R.done(false); return; }
  UI.hint(''); sfx.victory && sfx.victory();
  w.play('Idle');
  for (const [id] of R.followers) cast1[id].play('Idle');
  await wait(0.6, true);
  clearRunObjs();
  R.done(true);
}

// =====================================================================================
//                              LIGHT FIGHT (2 phases)
// =====================================================================================
const ARENA = { min: -5.2, max: 5.2 };
let F = null;
let warnMesh = null, bangSprite = null;
function fightProps() {
  if (warnMesh) return;
  warnMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xff3322, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  warnMesh.rotation.x = -Math.PI / 2; warnMesh.position.y = 0.03; warnMesh.userData.noGfx = true; E.scene.add(warnMesh);
  bangSprite = iconSprite('!', '#ff5040'); bangSprite.visible = false; E.scene.add(bangSprite);
}
function showWarn(x, w, on = true) { warnMesh.position.x = x; warnMesh.scale.set(w, 1.4, 1); warnMesh.material.opacity = on ? 0.32 : 0; }

function runFight(key, tok) {
  check(tok);
  fightProps();
  const cfg = FIGHTS[key];
  const bossRole = key;
  F = { key, cfg, tok, boss: cast1[bossRole], phase: 1, over: false,
    W: { x: -3, y: 0, vy: 0, hp: 4, max: 4, inv: 1, busy: false, seq: 0, henki: 0 },
    B: { x: 2.6, hp: cfg.hp, max: cfg.hp, token: 0, open: false, attacking: false, threatT: -1, stun: 0 },
    mel: null, refusedAt: -9, p2T: 0 };
  hideCast();
  const w = cast1.weed; w.root.visible = true; w.fade(1); w.root.position.set(F.W.x, 0, 0); w.face(1, true); w.play('Idle');
  const b = F.boss; b.root.visible = true; b.fade(1); b.root.position.set(F.B.x, 0, 0); b.face(-1, true); b.play('Idle');
  const gb = cast1.gb; gb.root.visible = true; gb.fade(1); gb.root.position.set(-5.6, 0, -2.2); gb.face(1, true); gb.play('Idle');
  if (key === 'tosa') { P.show('kennel', 3.6, -1.6); P.show('pond', -2.5, -3.4); }
  else { const m = cast1.mel; m.root.visible = true; m.fade(1); m.root.position.set(4.8, 0, -1.4); m.face(-1, true); m.play('Idle'); }
  E.camPos.set(0, 1.6, 6.6); E.camLook.set(0, 0.8, 0);
  setBossName(cfg.name, cfg.sub);
  UI.cine(false); UI.show('hud', true); UI.$('bossbox').classList.remove('hidden'); UI.$('henki').classList.remove('hidden');
  UI.setHearts(F.W.hp, F.W.max); UI.setBossHP(1); UI.setHenki(0);
  buildGBCard('Decoy');
  setInputEnabled(true);
  music('battle', { fade: 0.8 });
  ambience('battle');
  setMood(key === 'tosa' ? 'autumn_night' : 'night', 1);
  UI.hint(key === 'tosa' ? 'Tap = bite &nbsp;•&nbsp; Swipe ←/→ = dodge &nbsp;•&nbsp; Swipe ↑ = jump' : 'Blue is fast and feints. Watch for the <b>!</b> and dodge.', 5);
  S1.mode = 'fight';
  F.B.token++; bossBrain(F.B.token);
  return new Promise(res => { F.done = res; });
}
const alive = t => F && !F.over && t === F.B.token && S1.mode === 'fight';
const half = () => F.boss.length * 0.5;

function fightGesture(g) {
  if (!F || F.over || F.cut) return;
  if (g.type === 'tap') fightBite();
  else if (g.type === 'swipe') { if (g.dir === 'up') fightJump(); else if (g.dir === 'left') fightDodge(-1); else if (g.dir === 'right') fightDodge(1); }
  else if (g.type === 'arc') { if (F.W.henki >= 1) fightBattoga(); else { UI.toast('Spirit is not full yet', 1); fightBite(); } }
}
function checkPerfect() {
  const ts = [F.B.threatT, F.mel ? F.mel.threatT : -1];
  if (ts.some(t => t > 0 && t < 0.34)) {
    E.timeScale = 0.3; setTimeout(() => { if (S1.mode === 'fight' && !F.cut) E.timeScale = 1; }, 450);
    sfx.perfect(); UI.toast('Perfect dodge!'); addHenki(0.25);
    FX.ring(cast1.weed.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 0x9fd0ff, 1.8, 0.4);
  }
}
function addHenki(v) {
  const W = F.W, was = W.henki;
  W.henki = Math.min(1, W.henki + v); UI.setHenki(W.henki);
  if (was < 1 && W.henki >= 1) { UI.hint('Spirit full! Draw a circle ⟳ (or tap the Spirit ring) = <b>Battōga</b>', 4); sfx.spirit(); }
}
function fightJump() { const W = F.W; if (W.y > 0.05) return; W.seq++; W.busy = false; checkPerfect(); W.vy = 8.4; W.y = 0.01; sfx.jump(); cast1.weed.play('Gallop_Jump', { loop: false, timeScale: 1.1 }); }
async function fightDodge(dir) {
  const W = F.W, w = cast1.weed; if (W.y > 0.05) return;
  W.seq++; W.busy = true; const seq = W.seq; checkPerfect();
  W.inv = Math.max(W.inv, 0.32); sfx.dodge ? sfx.dodge() : sfx.whoosh();
  w.play('Gallop', { timeScale: 1.8 }); FX.afterimage && FX.afterimage(w, 0x8fc8ff, 0.25, 0.35);
  await tween(W, { x: clamp(W.x + dir * 1.7, ARENA.min, ARENA.max) }, 0.2, { ease: 'out' });
  if (seq !== W.seq) return;
  W.busy = false; w.play('Idle');
}
async function fightBite() {
  const W = F.W, B = F.B, w = cast1.weed;
  if (W.busy || W.y > 0.05) return;
  // nearest target: Blue or Mel (Weed refuses to bite Mel)
  if (F.mel && F.mel.active) {
    const mx = cast1.mel.root.position.x;
    if (Math.abs(mx - W.x) < Math.abs(B.x - W.x) && Math.abs(mx - W.x) < 2.4) {
      if (E.time - F.refusedAt > 4) { F.refusedAt = E.time; say('p_weed_notenemy', { noWait: true }); }
      UI.toast('Mel isn\'t your enemy! Dodge him.', 1.1); sfx.denied(); return;
    }
  }
  W.busy = true; const seq = ++W.seq;
  const dir = Math.sign(B.x - W.x) || 1; w.face(dir);
  const target = B.x - dir * (half() * 0.8 + 0.25);
  w.play('Gallop', { timeScale: 1.7 }); sfx.lunge ? sfx.lunge() : sfx.whoosh();
  await tween(W, { x: target }, clamp(Math.abs(target - W.x) / 13, 0.06, 0.28), { ease: 'in' });
  if (seq !== W.seq) return;
  w.play('Attack', { loop: false, timeScale: 1.3 }); sfx.bite();
  const p = new THREE.Vector3(B.x - dir * half() * 0.4, F.boss.height * 0.5, 0.4);
  damageBoss(F.cfg.biteDmg * (B.open ? 1.7 : 1) * (B.stun > 0 ? 1.4 : 1), p);
  addHenki(0.05);
  await wait(0.16);
  if (seq !== W.seq) return;
  w.play('Gallop', { timeScale: 1.3 });
  await tween(W, { x: clamp(target - dir * 1.4, ARENA.min, ARENA.max) }, 0.22, { ease: 'out' });
  if (seq !== W.seq) return;
  W.busy = false; w.play('Idle');
}
async function fightBattoga() {
  const W = F.W, B = F.B, w = cast1.weed;
  if (F.cut || F.over) return;
  W.henki = 0; UI.setHenki(0);
  W.busy = true; const seq = ++W.seq; W.inv = 2;
  const dir = Math.sign(B.x - W.x) || 1; w.face(dir);
  say('battoga', { noWait: true }); sfx.battoga(); FX.speedLines(1); E.timeScale = 0.35;
  w.play('Battoga', { loop: false });
  FX.vortex(w.root, dir, w.height * 1.1, 0.7);
  const trail = setInterval(() => FX.slashArc(w.root.position.clone().add(new THREE.Vector3(0, w.height * 0.5, 0.3)), 0xbfe4ff, 0.55, 0.3, Math.random() * 6), 70);
  await tween(W, { x: B.x - dir * half() * 0.3, y: F.boss.height * 0.7 }, 0.45, { ease: 'inOut' });
  clearInterval(trail); FX.speedLines(0); E.timeScale = 1;
  if (seq !== W.seq) return;
  const p = new THREE.Vector3(B.x, F.boss.height * 0.75, 0.4);
  FX.flash('#dff0ff', 0.3, 0.8); sfx.boom(); FX.ring(p, 0xbfe4ff, 3.5, 0.45);
  w.play('Gallop_Jump', { loop: false });
  if (F.key === 'tosa' && F.phase === 2) { tween(W, { x: B.x - dir * 2.4, y: 0 }, 0.4, { ease: 'out' }); F.B.hp = 1; finishFight(); return; }
  damageBoss(22, p, { strong: true });
  await tween(W, { x: clamp(B.x - dir * 2.6, ARENA.min, ARENA.max), y: 0 }, 0.4, { ease: 'out' });
  if (seq !== W.seq) return;
  W.busy = false; w.play('Idle');
}
function damageBoss(amount, pos, o = {}) {
  const B = F.B, b = F.boss;
  if (F.over || F.cut) return;
  const floor = F.key === 'tosa' && F.phase === 2 ? 20 : 0;
  B.hp = Math.max(floor, B.hp - amount);
  UI.setBossHP(B.hp / B.max);
  FX.impact(pos, o.strong); sfx.hit();
  b.setTint(0xffffff, 0.7); setTimeout(() => b.setTint(0x000000, 0), 70);
  if (!B.attacking) b.play('Idle_HitReact1', { loop: false, fade: 0.05 });
  if (navigator.vibrate) try { navigator.vibrate(o.strong ? 50 : 15); } catch (_) {}
  thresholds();
}
function thresholds() {
  const B = F.B, cfg = F.cfg;
  if (F.phase === 1 && B.hp <= cfg.phase2At) phase2();
  else if (F.key === 'blue' && F.phase === 2 && B.hp <= cfg.endAt) finishFight();
}
function hurtWeed(fromX) {
  const W = F.W, w = cast1.weed;
  if (W.inv > 0 || F.over || F.cut) return;
  W.hp--; W.inv = 1.3; W.seq++; W.busy = false;
  UI.setHearts(W.hp, W.max);
  sfx.hurt(); shake(0.3); FX.flash('#ff2040', 0.3, 0.3);
  if (navigator.vibrate) try { navigator.vibrate(110); } catch (_) {}
  const dir = Math.sign(W.x - fromX) || -1;
  tween(W, { x: clamp(W.x + dir * 1.6, ARENA.min, ARENA.max) }, 0.3, { ease: 'out' });
  w.play('Idle_HitReact2', { loop: false, fade: 0.05 });
  setTimeout(() => { if (F && !W.busy && W.y <= 0.01) w.play('Idle'); }, 500);
  if (W.hp <= 0) loseFight();
}
async function loseFight() {
  F.over = true; F.B.token++; endAttack();
  setInputEnabled(false);
  cast1.weed.play('Death', { loop: false }); sfx.die(); music(null);
  await wait(1.3, true);
  S1.mode = 'fightEnd';
  F.done(false);
}
function endAttack() {
  if (warnMesh) showWarn(0, 1, false);
  if (bangSprite) bangSprite.visible = false;
  if (!F) return;
  F.B.threatT = -1; F.B.attacking = false; F.B.open = false; F.boss.setTint(0, 0);
  if (F.mel) F.mel.threatT = -1;
}

async function telegraph(t, secs, who = F.boss, color = 0xff2a10) {
  sfx.tell(); bangSprite.visible = true;
  const t0 = E.time;
  while (alive(t) && E.time - t0 < secs) {
    const k = (E.time - t0) / secs;
    who.setTint(color, 0.05 + 0.15 * Math.abs(Math.sin(k * 12)));
    bangSprite.position.set(who.root.position.x, who.height + 0.45 + Math.sin(k * 20) * 0.04, 0.4);
    await wait(1 / 60);
  }
  bangSprite.visible = false; who.setTint(0, 0);
}
async function bossBrain(t) {
  const B = F.B, b = F.boss, cfg = F.cfg;
  let i = 0;
  while (alive(t)) {
    if (B.stun > 0) {               // GB decoy: the boss turns away, open for free bites
      b.face(-Math.sign(F.W.x - B.x) || 1); b.play('Bark', { loop: true, timeScale: 0.6 }); B.open = true;
      while (alive(t) && B.stun > 0) { B.stun -= 1 / 60; await wait(1 / 60); }
      B.open = false; B.stun = 0;
      if (!alive(t)) return;
    }
    b.play('Walk', { timeScale: 0.9 });
    const t0 = E.time, keep = half() + 1.5;
    const spd = cfg.speed * (F.phase === 2 && F.key === 'tosa' ? 0.7 : 1);
    while (alive(t) && B.stun <= 0 && E.time - t0 < 1.3 / spd) {
      const want = clamp(F.W.x + (B.x >= F.W.x ? keep : -keep), ARENA.min + 0.4, ARENA.max - 0.4);
      b.face(Math.sign(F.W.x - B.x) || -1);
      B.x += clamp(want - B.x, -1, 1) * 1.5 * spd / 60;
      await wait(1 / 60);
    }
    if (!alive(t) || B.stun > 0) continue;
    const kind = cfg.attacks[i++ % cfg.attacks.length];
    B.attacking = true;
    if (kind === 'charge') await atkCharge(t, spd);
    else await atkLunge(t, spd, kind === 'feint');
    if (!alive(t)) return;
    B.attacking = false;
  }
}
async function atkCharge(t, spd) {
  const B = F.B, b = F.boss, W = F.W;
  const dir = Math.sign(W.x - B.x) || -1; b.face(dir);
  b.play('Eating', { timeScale: 1.4 });
  const endX = dir > 0 ? ARENA.max + 0.2 : ARENA.min - 0.2;
  showWarn((B.x + endX) / 2, Math.abs(endX - B.x) + 1.5);
  await telegraph(t, 0.95 / spd);
  if (!alive(t)) return;
  b.play('Gallop', { timeScale: 1.2 }); sfx.growl ? sfx.growl() : sfx.bark();
  const speed = 9.5 * spd; let hit = false;
  while (alive(t) && Math.sign(endX - B.x) === dir) {
    B.x += dir * speed / 60;
    const ahead = (W.x - B.x) * dir; B.threatT = ahead > 0 ? ahead / speed : -1;
    if (!hit && Math.abs(W.x - B.x) < half() * 0.7 && W.y < 0.5 && W.inv <= 0) { hit = true; hurtWeed(B.x); }
    if (Math.random() < 0.25) FX.dust(new THREE.Vector3(B.x - dir * 0.6, 0.1, 0));
    await wait(1 / 60);
  }
  showWarn(0, 1, false); B.threatT = -1;
  if (!alive(t)) return;
  B.x = clamp(B.x, ARENA.min, ARENA.max);
  await recover(t, 1.3 / spd);
}
async function atkLunge(t, spd, feint) {
  const B = F.B, b = F.boss, W = F.W;
  const dir = Math.sign(W.x - B.x) || -1; b.face(dir);
  const reach = 2.2;
  showWarn(B.x + dir * (half() + reach * 0.5), reach + 0.6);
  if (feint) {                       // a fake-out, then the real (quicker) lunge
    b.play('Bark', { loop: false }); await telegraph(t, 0.35 / spd); if (!alive(t)) return;
    b.play('Idle'); await wait(0.25); if (!alive(t)) return;
  }
  b.play('Bark', { loop: true, timeScale: 0.5 });
  await telegraph(t, (feint ? 0.45 : 0.75) / spd);
  if (!alive(t)) return;
  b.play('Attack', { loop: false, timeScale: 1.2 }); sfx.whoosh();
  const x0 = B.x, x1 = clamp(B.x + dir * reach, ARENA.min, ARENA.max);
  const t0 = E.time, dur = 0.22;
  let hit = false;
  while (alive(t) && E.time - t0 < dur) {
    const k = (E.time - t0) / dur; B.x = x0 + (x1 - x0) * k;
    const front = B.x + dir * half() * 0.9;
    B.threatT = Math.max(0.01, (dur - (E.time - t0)));
    if (!hit && (W.x - front) * dir < 0.35 && (W.x - B.x) * dir > -half() && W.y < 0.45 && W.inv <= 0) { hit = true; hurtWeed(B.x); }
    await wait(1 / 60);
  }
  sfx.bite(); showWarn(0, 1, false); B.threatT = -1;
  if (!alive(t)) return;
  await recover(t, 1.0 / spd);
}
async function recover(t, secs) { const B = F.B; B.open = true; F.boss.play('Idle_2_HeadLow', { timeScale: 1.4 }); await wait(secs); B.open = false; }

// Mel (Blue phase 2): lunges at Weed on his own rhythm; dodge, never bite
async function melBrain(t) {
  const m = cast1.mel, M = F.mel, W = F.W;
  while (alive(t) && M.active) {
    m.play('Walk', { timeScale: 1.1 });
    const t0 = E.time;
    while (alive(t) && E.time - t0 < 1.6) {
      const want = clamp(W.x + (M.x >= W.x ? 1.9 : -1.9), ARENA.min, ARENA.max);
      m.face(Math.sign(W.x - M.x) || 1);
      M.x += clamp(want - M.x, -1, 1) * 2.2 / 60; m.root.position.x = M.x;
      await wait(1 / 60);
    }
    if (!alive(t)) return;
    const dir = Math.sign(W.x - M.x) || 1; m.face(dir);
    m.setTint(0xffc040, 0.25); sfx.tell(); m.play('Bark', { loop: false });
    await wait(0.6); m.setTint(0, 0);
    if (!alive(t)) return;
    m.play('Gallop', { timeScale: 1.5 }); sfx.whoosh();
    const x0 = M.x, x1 = clamp(M.x + dir * 2.6, ARENA.min, ARENA.max), s0 = E.time, dur = 0.3;
    let hit = false;
    while (alive(t) && E.time - s0 < dur) {
      M.x = x0 + (x1 - x0) * ((E.time - s0) / dur); m.root.position.x = M.x;
      M.threatT = Math.max(0.01, dur - (E.time - s0));
      if (!hit && Math.abs(W.x - M.x) < 0.45 && W.y < 0.4 && W.inv <= 0) { hit = true; hurtWeed(M.x); }
      await wait(1 / 60);
    }
    M.threatT = -1; m.play('Idle');
    await wait(1.3);
  }
}

function fightDecoy() {
  const gb = cast1.gb, B = F.B;
  say('p_gb_decoy', { noWait: true });
  gb.play('Gallop', { timeScale: 1.5 });
  const side = B.x > 0 ? ARENA.max + 0.6 : ARENA.min - 0.6;
  tween(gb.root.position, { x: side, z: -1.6 }, 0.6, { ease: 'out' }).then(() => { gb.face(-Math.sign(side) || 1); gb.play('Bark', { loop: true }); sfx.bark(); });
  B.stun = 3.2; B.token++; endAttack(); bossBrain(B.token);
  if (F.mel && F.mel.active) { F.mel.active = false; cast1.mel.play('Idle'); setTimeout(() => { if (F && F.mel && !F.over && F.phase === 2) { F.mel.active = true; melBrain(F.B.token); } }, 3200); }
  UI.toast('GB draws its attention – bite now!', 1.4);
  setTimeout(() => { if (F && !F.over) { tween(gb.root.position, { x: -5.6, z: -2.2 }, 0.8); gb.face(1); gb.play('Idle'); } }, 3300);
}

async function phase2() {
  F.phase = 2; F.cut = true; F.B.token++; endAttack();
  setInputEnabled(false);
  S1.mode = 'fightCut';
  if (F.key === 'tosa') {
    await runScene(safeSteps(SC.tosaThrow(ctx)), ctx);
    E.skipping = false; E.timeScale = 1;
    F.W.x = 3.0; cast1.weed.root.position.set(3.0, 0, 0); cast1.weed.root.position.z = 0; F.B.x = 0.6;
    F.boss.root.position.set(F.B.x, 0, 0); F.boss.face(1, true);
    F.W.henki = 0; addHenki(1);
    UI.hint('Weed\'s spirit is burning! Draw a circle ⟳ — or tap the Spirit ring — <b>BATTŌGA!</b>');
  } else {
    preloadLines(SC.linesOf(SC.blueMel(ctx)));
    await runScene(safeSteps(SC.blueMel(ctx)), ctx);
    E.skipping = false; E.timeScale = 1;
    F.mel = { active: true, x: cast1.mel.root.position.x, threatT: -1 };
    cast1.mel.root.position.z = 0.6;
    UI.hint('Mel is forced to attack. <b>Dodge Mel</b> – bite only Blue!', 5);
  }
  E.camPos.set(0, 1.6, 6.6); E.camLook.set(0, 0.8, 0);
  UI.cine(false); UI.show('hud', true); setInputEnabled(true);
  S1.mode = 'fight'; F.cut = false; F.W.busy = false; F.W.inv = 1;
  music('battle', { fade: 0.5 });
  F.B.token++; bossBrain(F.B.token);
  if (F.mel) melBrain(F.B.token);
}
async function finishFight() {
  if (F.over) return;
  F.over = true; F.B.token++; endAttack();
  setInputEnabled(false); UI.hint('');
  await wait(0.5, true);
  S1.mode = 'fightEnd';
  F.done(true);
}

function fightUpdate(dt, dtr) {
  const W = F.W, B = F.B, w = cast1.weed, b = F.boss;
  if (F.cut) return;
  if (W.y > 0 || W.vy > 0) {
    W.vy -= 24 * dt; W.y += W.vy * dt;
    if (W.y <= 0) { W.y = 0; W.vy = 0; sfx.land({}, { x: W.x }); w.play('Jump_ToIdle', { loop: false }); setTimeout(() => { if (F && !W.busy && W.y <= 0) w.play('Idle'); }, 300); FX.dust(new THREE.Vector3(W.x, 0.05, 0)); }
  }
  W.x = clamp(W.x, ARENA.min, ARENA.max);
  w.root.position.x = W.x; w.root.position.y = W.y;
  if (!W.busy && W.y <= 0) w.face(Math.sign(B.x - W.x) || 1);
  if (W.inv > 0) { W.inv -= dt; w.model.visible = W.inv > 0.9 || Math.floor(W.inv * 14) % 2 === 0 || W.inv <= 0; } else w.model.visible = true;
  b.root.position.x = B.x;
  tickCards(dt);
  if (F.key === 'tosa' && F.phase === 2) { F.p2T += dt; if (F.p2T > 10 && !F.nag) { F.nag = true; UI.hint('Draw a big circle ⟳ on the screen — or tap the glowing <b>SPIRIT</b> ring!'); } }
  const mid = (W.x + B.x) / 2, dist = Math.abs(W.x - B.x);
  const camD = clamp(5.2 + dist * 0.3, 5.4, 7.2);
  E.camPos.lerp(new THREE.Vector3(mid * 0.8, 1.45, camD), Math.min(1, dtr * 3));
  E.camLook.lerp(new THREE.Vector3(mid * 0.8, 0.75, 0), Math.min(1, dtr * 3));
}

// =====================================================================================
//                       THE FENCE: "leap" action before the second truck
// =====================================================================================
let leapRes = null;
async function leapAction(tok) {
  check(tok);
  UI.cine(false); UI.show('hud', false);
  S1.mode = 'leap'; setInputEnabled(true);
  const w = cast1.weed;
  E.timeScale = 0.4;
  P.make('road');
  truckRun(1, { from: -38, to: -16, t: 9 });            // headlights creep closer while the player decides
  UI.hint('<b>Swipe ↑</b> — leap the fence and save Blue!');
  const ic = icon('up'); E.scene.add(ic); ic.position.set(w.root.position.x + 0.3, 1.3, w.root.position.z); ic.scale.setScalar(0.6);
  await Promise.race([new Promise(r => { leapRes = r; }), wait(7, true)]);
  leapRes = null; E.scene.remove(ic); ic.material.map.dispose();
  UI.hint(''); setInputEnabled(false); E.timeScale = 1;
  check(tok);
  S1.mode = 'scene'; UI.cine(true);
  say('p_weed_blue', { noWait: true });
  w.play('Gallop_Jump', { loop: false }); sfx.jump(); sfx.whoosh();
  const p = w.root.position;
  await tween(p, { y: 1.25, z: -2.6, x: p.x + 0.3 }, 0.32, { ease: 'out', real: true });
  await tween(p, { y: 0, z: -3.4, x: p.x + 0.4 }, 0.3, { ease: 'in', real: true });
  sfx.land(); FX.dust(p.clone());
  if (trucks[1]) trucks[1].visible = false;
}

// =====================================================================================
function update(dt, dtr) {
  for (const d of Object.values(cast1)) if (d.root.visible) d.update(dt);
  if (!S1.active || S1.paused) return;
  if (S1.mode === 'run' && R) runUpdate(dt, dtr);
  else if (S1.mode === 'fight' && F) fightUpdate(dt, dtr);
}

export function setPaused1(p) {
  if (!S1.active || !(S1.mode === 'run' || S1.mode === 'fight')) return false;
  S1.paused = p; E.timeScale = p ? 0 : 1;
  UI.show('pause', p); sfx[p ? 'uiOpen' : 'uiBack']();
  return true;
}
export function quit1() {
  if (!S1.active) return;
  S1.token++;
  if (F) { F.over = true; F.B.token++; endAttack(); }
  if (R) R.over = true;
  if (S1.retry) { const r = S1.retry; S1.retry = null; r('quit'); }
  E.skipping = true;                   // fast-forward any running scene so it can unwind
  setTimeout(() => { E.skipping = false; }, 300);
  UI.show('hud', false); UI.cine(false); UI.hint(''); UI.cutin(null); stopVoice();
  for (const id of ['pause', 'defeat']) UI.show(id, false);
  music(null); ambience(false);
  leave();
}
export const isLevel1Active = () => S1.active;

// test hooks (Playwright)
export const debug1 = {
  S1, get R() { return R; }, get F() { return F; },
  winRun: () => { if (R && !R.over) R.d = R.cfg.length; },
  bossTo: hp => { if (F && !F.over) { F.B.hp = hp; UI.setBossHP(hp / F.B.max); thresholds(); } },
  fillHenki: () => F && addHenki(1),
  battoga: () => F && fightBattoga(),
  leap: () => leapRes && leapRes(),
  gesture: g => handleGesture(g),
};
