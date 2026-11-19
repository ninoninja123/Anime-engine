// LEVEL 3 – "The Alps Trap – John's Last Stand" (anime ep. 6–10). Chapter = sections played in order, each a checkpoint:
//   trap (scene) → cover (playable: John covers Akame's breakout) → hostage (scene) → captive (scene) → oath (scene)
//   → stand (playable: Hold the Line, 4 waves = 50 of Hōgen's men; a comrade falls between waves) → hogen (scene)
//   → farewell (scene). Research: docs/weed-game/level3-research.md · design: docs/weed-game/level3-design.md.
// Shares the engine, scene runner, voice/subtitles, gestures, FX and HUD with levels 1–2 (no changes to those files).
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
import { resetActing } from './shared/acting.js';
import { makeTelegraph } from './gfx/telegraph.js';
import { ACTORS, SOLDIER_IDS, JOHN, FOES, WAVES, STAND_TOTAL, ALLY_CARDS } from './data/level3_config.js';
import * as SC from './data/scenes_level3.js';
import { cast as cast2 } from './level2.js';

E.V3 = E.V3 || THREE.Vector3;
export const SECTIONS3 = ['trap', 'cover', 'hostage', 'captive', 'oath', 'stand', 'hogen', 'farewell'];
export const cast3 = {};
const ABORT = new Error('level3-abort');
const S3 = { active: false, paused: false, mode: null, token: 0, retry: null, onDone: null, section: 0, wave: 0, sceneDone: false };
window.__S3 = S3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const save = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
const POOL = SOLDIER_IDS.map((_, i) => 's' + (i + 1));

// ---------------------------------------------------------------- props
function makeTree() {
  const g = new THREE.Group();
  const bark = 0x3a2e28, snow = 0xe6ecf8;
  const trunk = PR.mesh(new THREE.CylinderGeometry(0.2, 0.32, 5.2, 9), bark, 0.02); trunk.position.y = 2.6; g.add(trunk);
  const boughs = [[1.6, 1.4, 0.5], [2.4, 1.1, -0.6], [3.2, 0.9, 0.9], [4.0, 0.7, -0.3]];
  for (const [y, len, rz] of boughs) {
    const b = PR.mesh(new THREE.CylinderGeometry(0.05, 0.09, len, 6), bark, 0.012);
    b.position.set(Math.sign(rz) * len * 0.42, y, 0); b.rotation.z = -Math.sign(rz) * 1.1; g.add(b);
    const s = PR.mesh(new THREE.SphereGeometry(0.22, 8, 5), snow, 0.01); s.scale.set(1.6, 0.4, 0.9); s.position.set(Math.sign(rz) * len * 0.55, y + 0.22, 0); g.add(s);
    s.userData.drop = true;
  }
  // the low broken branch (dark silhouette only – PEGI 12); shown during the impact beat
  const br = PR.mesh(new THREE.CylinderGeometry(0.035, 0.07, 1.0, 6), 0x1c1612, 0.01);
  br.rotation.z = -1.25; br.position.set(0.55, 0.62, 0.15); br.visible = false; g.add(br); g.userData.branch = br;
  return g;
}
const P = {
  objs: {},
  make(name) {
    if (this.objs[name]) return this.objs[name];
    let o;
    switch (name) {
      case 'cabin': o = PR.house(3.0, 2.2, 0x5e4c3e); o.rotation.y = -0.35; break;
      case 'shed': o = PR.house(2.6, 1.7, 0x3c3530); o.rotation.y = 0.3; o.userData.window.material.color.set(0xffb060); break;
      case 'tree': o = makeTree(); break;
      case 'graves': {
        o = new THREE.Group();
        [-1.2, -0.4, 0.4, 1.2].forEach((x, i) => { const gr = SETS.grave(i + 2); gr.position.set(x, 0, 0); gr.rotation.y = (i - 1.5) * 0.06; o.add(gr); });
        break;
      }
      case 'stick': o = PR.mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.9, 6), 0x2a2018, 0.01); break;
      default: return null;
    }
    o.visible = false; E.scene.add(o); this.objs[name] = o; return o;
  },
  show(name, x = 0, z = 0) { const o = this.make(name); if (!o) return; o.visible = true; o.position.set(x, 0, z); return o; },
  hide(name) { const o = this.objs[name]; if (o) o.visible = false; },
  hideAll() { for (const k in this.objs) this.objs[k].visible = false; if (this.objs.tree) this.objs.tree.userData.branch.visible = false; },
  showGraves(on) { if (on) this.show('graves', 0.6, -1.6); else this.hide('graves'); },
  showBranch(on) { const t = this.make('tree'); t.userData.branch.visible = on; },
  treeShake() {
    const t = this.make('tree'); const p0 = t.position.x;
    tween(t.position, { x: p0 + 0.06 }, 0.05).then(() => tween(t.position, { x: p0 - 0.04 }, 0.08)).then(() => tween(t.position, { x: p0 }, 0.12));
    for (const c of t.children) if (c.userData.drop) FX.burst(c.getWorldPosition(new THREE.Vector3()), { color: 0xeef3ff, count: 14, speed: 2 });
  },
  throwStick(from, to) {
    const s = this.make('stick'); s.visible = true;
    const a = from.root.position.clone().add(new THREE.Vector3(0.4, from.height * 0.75, 0));
    const b = to.root.position.clone().add(new THREE.Vector3(0, to.height * 0.9, 0));
    s.position.copy(a);
    const o = { k: 0 };
    return tween(o, { k: 1 }, 0.35, { real: true, onUpdate: () => { s.position.lerpVectors(a, b, o.k); s.position.y += Math.sin(o.k * Math.PI) * 0.3; s.rotation.z = o.k * 9; } })
      .then(() => { s.visible = false; FX.hitStar(b, 0xfff4d0, 0.9); sfx.hitLight(); });
  },
};

// ---------------------------------------------------------------- world: winter Alps, no Gajō set dressing
let hiddenWorld = [], prevSeason = null;
function setWorldForAlps(on) {
  if (on) {
    prevSeason = E.season || 'autumn';
    if (E.setSeason) E.setSeason('winter');
    hiddenWorld = [];
    if (E.cliff && E.cliff.visible) { E.cliff.visible = false; hiddenWorld.push(E.cliff); }
    E.scene.traverse(o => { const p = o.geometry && o.geometry.parameters; if (o.isMesh && p && ((p.width === 3.4 && p.height === 27) || (p.width === 1.3 && p.height === 15)) && o.visible) { o.visible = false; hiddenWorld.push(o); } });
  } else {
    for (const o of hiddenWorld) o.visible = true; hiddenWorld = [];
    if (E.setSeason && prevSeason) E.setSeason(prevSeason);
  }
}

// ---------------------------------------------------------------- cast
let castReady = null;
export function loadCast3() {
  if (castReady) return castReady;
  castReady = loadFor([...new Set(Object.values(ACTORS))]).then(() => {
    for (const [role, id] of Object.entries(ACTORS)) {
      const d = makeDog(id); d.id = role;
      d.root.visible = false; E.scene.add(d.root); cast3[role] = d;
    }
  });
  return castReady;
}
function hideCast() {
  for (const d of Object.values(cast3)) { d.fade(1); d.setTint(0, 0); d.lookTarget = null; d.expr && d.expr(null); d.root.visible = false; }
  for (const b of Object.values(bangs)) b.visible = false;
}

let updaterOn = false, gestureOff = null, hudEl = null;
const saved = {};
function enter() {
  S3.active = true; S3.paused = false;
  setSceneCast(cast3); initFootsteps(cast3);
  if (window.__game) { window.__game.prevCast3 = window.__game.cast; window.__game.cast = cast3; }
  setWorldForAlps(true);
  if (!updaterOn) { E.updaters.add(update); updaterOn = true; }
  if (!gestureOff) gestureOff = onGesture(handleGesture);
  const hk = UI.$('henki'); if (hk && !hk.dataset.l3) { hk.dataset.l3 = '1'; hk.addEventListener('pointerdown', e => { if (!S3.active || !H) return; e.stopPropagation(); if (H.J.henki >= 1) ouFang(); }); }
  for (const d of Object.values(cast2)) d.root.visible = false;
  // HUD labels (restored on leave)
  const wn = UI.$('weedbox').querySelector('.nm'), bn = UI.$('bossbox').querySelector('.nm');
  saved.wn = wn.innerHTML; saved.bn = bn.innerHTML;
  const df = UI.$('defeat'); saved.dh = df.querySelector('h2').innerHTML; saved.dp = df.querySelector('p').innerHTML; saved.db = UI.$('retryBtn').textContent;
  wn.textContent = 'JOHN';
  df.querySelector('h2').textContent = 'John is down…';
  df.querySelector('p').textContent = 'Hiro and Reika aren\'t safe yet. Stand once more, old warrior.';
  UI.$('retryBtn').textContent = 'Retry this wave';
  if (!hudEl) {
    hudEl = document.createElement('div'); hudEl.id = 'l3progress';
    hudEl.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 10px);transform:translateX(-50%);width:min(38vw,300px);z-index:7;pointer-events:none;font:700 11px/1.1 system-ui,sans-serif;letter-spacing:.12em;color:#e8eefc;text-shadow:0 1px 2px #000;text-align:center;';
    hudEl.innerHTML = '<div class="lb">HIRO &amp; REIKA</div><div style="margin-top:4px;height:8px;border-radius:5px;background:rgba(10,14,30,.6);box-shadow:inset 0 0 0 1px rgba(200,220,255,.35);overflow:hidden"><div class="fill" style="height:100%;width:0%;background:linear-gradient(90deg,#9fc8ff,#fff2c8);transition:width .25s"></div></div>';
    document.body.appendChild(hudEl);
  }
  hudEl.style.display = 'none';
}
function leave() {
  S3.active = false; S3.mode = null;
  setSceneCast(cast2); initFootsteps(cast2);
  if (window.__game && window.__game.prevCast3) window.__game.cast = window.__game.prevCast3;
  hideCast(); P.hideAll(); clearFight();
  setWorldForAlps(false);
  if (saved.wn !== undefined) {
    UI.$('weedbox').querySelector('.nm').innerHTML = saved.wn; UI.$('bossbox').querySelector('.nm').innerHTML = saved.bn;
    const df = UI.$('defeat'); df.querySelector('h2').innerHTML = saved.dh; df.querySelector('p').innerHTML = saved.dp; UI.$('retryBtn').textContent = saved.db;
  }
  if (hudEl) hudEl.style.display = 'none';
  UI.$('bossbox').classList.remove('hidden'); UI.$('henki').classList.remove('hidden');
  UI.$('cards').innerHTML = '';
  E.timeScale = 1; E.skipping = false; FX.speedLines(0); E.camRoll = 0;
  setSurface('step');
}

// ---------------------------------------------------------------- chapter flow
export async function startLevel3({ section = 0, wave = 0, onDone } = {}) {
  S3.onDone = onDone; S3.token++;
  const tok = S3.token;
  UI.show('loading', true); UI.$('loadingText').textContent = 'Into the snow of the Alps…';
  await loadCast3();
  UI.show('loading', false);
  enter();
  preloadMusic('sad', 'battle', 'dawn');
  preloadSfx('boss', 'cine');
  S3.wave = clamp(wave, 0, WAVES.stand.length - 1); S3.lastRun = null; S3.henki = 0;
  await wait(0.35, true);
  try {
    for (let i = clamp(section, 0, SECTIONS3.length - 1); i < SECTIONS3.length; i++) {
      S3.section = i; save('weed.l3.section', String(i));
      await SECTION_FNS[SECTIONS3[i]](tok);
      check(tok);
      S3.lastRun = SECTIONS3[i];
    }
  } catch (e) { if (e !== ABORT) console.error(e); return; }
  save('weed.l3done', '1'); save('weed.l3.section', '0');
  leave();
  if (S3.onDone) S3.onDone();
}
function check(tok) { if (tok !== S3.token || !S3.active) throw ABORT; }

// `place` steps run as `fn` (also while skipping; scenes.js would re-dispatch a skipped place to itself)
function placeNow(s) {
  const d = cast3[s.place]; if (!d) return;
  d.root.visible = true; d.fade(E.skipping ? 1 : (s.fade ?? 1));
  d.root.position.set(s.x ?? d.root.position.x, s.y ?? 0, s.z ?? d.root.position.z);
  if (s.face) d.face(s.face, true);
  d.spin.rotation.set(0, 0, 0);
  if (s.anim) d.play(s.anim, { timeScale: s.ts || 1, loop: s.loop ?? true });
}
function safeSteps(steps) { return steps.map(s => s.place ? { fn: () => placeNow(s) } : s.par ? { ...s, par: safeSteps(s.par) } : s); }
async function scene(steps, tok) {
  check(tok);
  steps = safeSteps(steps);
  UI.cine(true); UI.show('hud', false); UI.hint(''); setInputEnabled(false);
  if (hudEl) hudEl.style.display = 'none';
  S3.mode = 'scene'; S3.sceneDone = false;
  preloadLines(SC.linesOf(steps));
  drift({ push: 0.035, truck: 0.018 });
  await runScene(steps, ctx);
  drift(null); resetActing(cast3); grade({ t: 0 });
  E.skipping = false; E.timeScale = 1; FX.speedLines(0); stopVoice(); E.camRoll = 0;
  S3.sceneDone = true;
  check(tok);
}
const ctx = { cast: cast3, P, E, FX, sfx, wait, say, setMood };

const SECTION_FNS = {
  trap: async tok => { hideCast(); P.hideAll(); setSurface('step'); await scene(SC.trap(ctx), tok); },
  cover: async tok => {
    await loopUntilWin(() => holdLine(WAVES.cover, 'cover', tok), tok);
    hideCast(); P.hideAll(); await scene(SC.hostage(ctx), tok);
  },
  hostage: async tok => { if (S3.lastRun === 'cover') return; hideCast(); P.hideAll(); await scene(SC.hostage(ctx), tok); },
  captive: async tok => { hideCast(); P.hideAll(); await scene(SC.captive(ctx), tok); },
  oath: async tok => { hideCast(); P.hideAll(); await scene(SC.oath(ctx), tok); },
  stand: async tok => {
    for (let w = S3.wave; w < WAVES.stand.length; w++) {
      S3.wave = w; save('weed.l3.wave', String(w));
      const cfg = WAVES.stand[w];
      await loopUntilWin(() => holdLine(cfg, 'stand', tok), tok);
      if (cfg.after) { for (const r of POOL) cast3[r].root.visible = false; await scene(SC[cfg.after](ctx), tok); }
    }
    S3.wave = 0; save('weed.l3.wave', '0');
  },
  hogen: async tok => { hideCast(); P.hideAll(); await scene(SC.hogenScene(ctx), tok); },
  farewell: async tok => { hideCast(); P.hideAll(); await scene(SC.farewell(ctx), tok); },
};
// (the hostage scene follows "cover" directly; started at section 'hostage' it runs on its own)

async function loopUntilWin(play, tok) {
  for (;;) {
    check(tok);
    const ok = await play();
    check(tok);
    if (ok) return;
    const choice = await defeatPrompt();
    if (choice !== 'retry') throw ABORT;
  }
}
function defeatPrompt() { return new Promise(res => { S3.retry = res; UI.show('hud', false); if (hudEl) hudEl.style.display = 'none'; UI.show('defeat', true); }); }
export function retry3() { UI.show('defeat', false); if (S3.retry) { const r = S3.retry; S3.retry = null; r('retry'); } }

// =====================================================================================
//                                 HOLD THE LINE
// =====================================================================================
let H = null;
const bangs = {};
function iconSprite(text, color) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10,12,24,0.55)'; g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.fill();
  g.strokeStyle = color; g.lineWidth = 7; g.stroke();
  g.fillStyle = color; g.font = `900 ${text.length > 1 ? 44 : 70}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 68);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  s.scale.setScalar(0.5); s.renderOrder = 10; s.userData.noGfx = true; s.visible = false; return s;
}
function bangOf(id, kind) {
  const k = id + kind;
  if (!bangs[k]) { bangs[k] = iconSprite(kind === 'run' ? '»' : '!', kind === 'run' ? '#ffd27a' : '#ff5040'); E.scene.add(bangs[k]); }
  return bangs[k];
}
let warn = null;
function clearFight() {
  if (H) { H.over = true; for (const f of H.foes) { f.dog.setTint(0, 0); } }
  for (const b of Object.values(bangs)) b.visible = false;
  if (warn) warn.material.opacity = 0;
  H = null;
}

function holdLine(cfg, kind, tok) {
  check(tok);
  hideCast(); P.hideAll();
  if (!warn) { warn = makeTelegraph({ guard: () => S3.active && S3.mode === 'fight' && H && H.foes.some(f => f.state === 'tell' || f.state === 'lunge') }); E.scene.add(warn); }
  const isStand = kind === 'stand';
  const base = isStand ? WAVES.stand.slice(0, S3.wave).reduce((a, w) => a + w.seq.length, 0) : 0;
  const total = isStand ? STAND_TOTAL : cfg.seq.length;
  H = { cfg, kind, tok, over: false, base, total, defeated: 0, breached: 0, queue: cfg.seq.split(''), foes: [], spawnT: 0.6, attackGap: 0.6, matsuT: 3,
    J: { x: -0.4, y: 0, hp: cfg.hearts, max: cfg.hearts, inv: 1, busy: false, seq: 0, biteCD: 0, roarCD: 0, henki: S3.henki || 0, vy: 0 },
    allies: [], cards: [] };
  const j = cast3.john; j.root.visible = true; j.fade(1); j.root.position.set(H.J.x, 0, 0); j.face(1, true); j.play('Idle');
  if (isStand) P.show('tree', -3.9, -1.5);
  else { P.show('cabin', 4.4, -3.8); const a = cast3.akame; a.root.visible = true; a.root.position.set(-3.4, 0, -0.9); a.face(-1, true); a.play('Gallop', { timeScale: 1.2 }); H.akame = a; }
  // comrades beside John (stand): each a card until he falls
  const ALLY_POS = { lefty: [1.4, -2.3], tommy: [3.0, -2.7], rossi: [-1.3, -2.4] };
  for (const id of cfg.allies || []) {
    const d = cast3[id]; d.root.visible = true; d.fade(1); d.root.position.set(ALLY_POS[id][0], 0, ALLY_POS[id][1]); d.face(1, true); d.play('Idle');
    H.allies.push({ id, d, home: ALLY_POS[id], busy: false, t: Math.random() * 2 });
  }
  if (cfg.matsu) { const m = cast3.matsu; m.root.visible = true; m.fade(1); m.root.position.set(10.5, 0, -2.6); m.face(-1, true); m.play('Idle'); }
  H.cards = (cfg.allies || []).map(id => ({ id, ...ALLY_CARDS[id], cool: 4, state: 'cooldown' }));
  // fallen comrades of earlier waves keep their cards "In memory"
  if (isStand) for (const id of ['lefty', 'tommy', 'rossi']) if (!(cfg.allies || []).includes(id)) H.cards.push({ id, ...ALLY_CARDS[id], cool: 0, state: 'fallen' });
  UI.buildCards(H.cards, id => useCard(id));
  E.camPos.set(1.0, 1.5, 6.6); E.camLook.set(1.4, 0.8, 0);
  UI.$('bossbox').querySelector('.nm').innerHTML = `HŌGEN'S MEN <span class="sub" id="l3left"></span>`;
  UI.cine(false); UI.show('hud', true); UI.$('bossbox').classList.remove('hidden'); UI.$('henki').classList.remove('hidden');
  UI.setHearts(H.J.hp, H.J.max); UI.setHenki(H.J.henki);
  hudEl.style.display = ''; hudEl.querySelector('.lb').textContent = isStand ? 'HIRO & REIKA ESCAPE' : 'AKAME\'S ESCAPE';
  updateBars();
  setInputEnabled(true);
  music('battle', { fade: 0.8 });
  ambience(cfg.amb || 'gorge');
  setMood(cfg.mood || 'night', 1.5);
  if (isStand) UI.toast(`${cfg.label}`, 1.6);
  UI.hint(cfg.hint, 6);
  S3.mode = 'fight';
  sfx.levelStart();
  if (isStand && S3.wave === 3) say('l3_matsu_order', { noWait: true });
  return new Promise(res => { H.done = res; });
}
function updateBars() {
  if (!H) return;
  const gone = H.defeated + H.breached;
  const left = H.total - H.base - gone;
  UI.setBossHP(Math.max(0, left) / H.total);
  const el = document.getElementById('l3left'); if (el) el.textContent = `${left} left`;
  const frac = (H.base + gone) / H.total;
  if (hudEl) hudEl.querySelector('.fill').style.width = `${(frac * 100).toFixed(1)}%`;
}

// ---- spawning: pick a free soldier from the pool that fits the type
function spawn(type) {
  const def = FOES[type];
  const used = new Set(H.foes.map(f => f.role));
  const free = POOL.filter(r => !used.has(r));
  if (!free.length) return false;
  const want = def.ids ? free.filter(r => def.ids.includes(ACTORS[r])) : free.filter(r => !FOES.brute.ids.includes(ACTORS[r]));
  const role = (want.length ? want : free)[Math.floor(Math.random() * (want.length ? want : free).length)];
  const d = cast3[role];
  const f = { role, dog: d, type, def, hp: def.hp, x: H.J.x + 7.2 + Math.random() * 1.2, z: type === 'runner' ? 0.95 : (Math.random() - 0.5) * 0.5, state: type === 'runner' ? 'run' : 'approach', t: 0, cd: 0.6 + Math.random() * 0.8, stun: 0 };
  d.root.visible = true; d.fade(1); d.setTint(0, 0); d.root.position.set(f.x, 0, f.z); d.face(-1, true); d.spin.rotation.set(0, 0, 0);
  d.play(type === 'runner' ? 'Gallop' : 'Walk', { timeScale: type === 'runner' ? 1.4 : 1 });
  H.foes.push(f);
  if (type === 'runner') { sfx.gallopIn(); UI.toast('One is slipping past – bite it!', 1.1); }
  return true;
}
const activeCount = () => H.foes.filter(f => f.state !== 'dead' && f.state !== 'gone').length;
const half = d => (d.length || 1.2) * 0.5;
const gapTo = f => half(cast3.john) * 0.9 + half(f.dog) * 0.9;     // body centres when muzzle meets shoulder (no overlap)

function fightUpdate(dt, dtr) {
  const J = H.J, j = cast3.john;
  // spawning
  H.spawnT -= dt;
  if (H.queue.length && H.spawnT <= 0 && activeCount() < H.cfg.maxActive) {
    const t = { s: 'soldier', b: 'brute', r: 'runner' }[H.queue[0]];
    if (spawn(t)) { H.queue.shift(); H.spawnT = 0.7 + Math.random() * 0.5; }
  }
  // John
  J.biteCD = Math.max(0, J.biteCD - dt); J.roarCD = Math.max(0, J.roarCD - dt);
  if (J.y > 0 || J.vy > 0) { J.vy -= 22 * dt; J.y += J.vy * dt; if (J.y <= 0) { J.y = 0; J.vy = 0; } }
  J.x = clamp(J.x, JOHN.minX, JOHN.maxX);
  for (const f of H.foes) if (f.type !== 'runner' && f.state !== 'dead' && f.state !== 'gone' && f.state !== 'lunge') { const lim = f.x - gapTo(f) * 0.78; if (J.x > lim && !J.busy) J.x = lim; }
  j.root.position.x = J.x; j.root.position.y = J.y;
  if (!J.busy) j.face(1);
  if (J.inv > 0) { J.inv -= dt; j.model.visible = J.inv > 0.9 || Math.floor(J.inv * 14) % 2 === 0 || J.inv <= 0; } else j.model.visible = true;
  // front-line ordering (no stacking: each fighter keeps its own distance)
  const line = H.foes.filter(f => f.state !== 'dead' && f.state !== 'gone' && f.type !== 'runner').sort((a, b) => a.x - b.x);
  line.forEach((f, i) => { f.slot = i; });
  H.attackGap -= dt;
  const attacking = H.foes.some(f => f.state === 'tell' || f.state === 'lunge');
  for (const f of H.foes) foeUpdate(f, dt, attacking);
  H.foes = H.foes.filter(f => f.state !== 'gone');
  // allies idle-fight beside John
  for (const a of H.allies) if (!a.busy) { a.t -= dt; if (a.t <= 0) { a.t = 1.5 + Math.random() * 2; a.d.play(Math.random() < 0.5 ? 'Bark' : 'Attack', { loop: false }); setTimeout(() => { if (!a.busy && a.d.root.visible) a.d.play('Idle'); }, 700); } }
  if (H.akame) { H.akame.root.position.x -= dt * 2.2; if (H.akame.root.position.x < -9) { H.akame.root.visible = false; H.akame = null; } }
  if (H.cfg.matsu) { H.matsuT -= dt; if (H.matsuT <= 0) { H.matsuT = 6 + Math.random() * 3; cast3.matsu.play('Bark', { loop: false }); sfx.bark(); } }
  tickCards(dt);
  // camera: side-on, low (an old soldier holding the line); frames John and the front of the line
  const front = line[0] ? line[0].x : J.x + 3;
  const mid = (J.x + Math.min(front, J.x + 5)) / 2;
  const camD = clamp(5.6 + Math.abs(front - J.x) * 0.25, 5.8, 7.4);
  E.camPos.lerp(new THREE.Vector3(mid, 1.35, camD), Math.min(1, dtr * 3));
  E.camLook.lerp(new THREE.Vector3(mid + 0.3, 0.75, 0), Math.min(1, dtr * 3));
  // win
  if (!H.queue.length && activeCount() === 0 && !H.over) winWave();
}

function foeUpdate(f, dt, attacking) {
  const d = f.dog, J = H.J;
  f.t += dt; f.cd -= dt;
  const b = bangOf(f.role, '!'), r = bangOf(f.role, 'run');
  b.visible = false; r.visible = false;
  if (f.stun > 0) { f.stun -= dt; if (f.stun <= 0 && f.state === 'stagger') { f.state = 'approach'; d.play('Walk'); } }
  switch (f.state) {
    case 'approach': {
      const want = J.x + gapTo(f) + 0.55 + f.slot * (1.0 + half(f.dog) * 0.9);
      const dx = want - f.x;
      if (Math.abs(dx) > 0.08) { f.x += Math.sign(dx) * Math.min(Math.abs(dx), f.def.speed * dt); if (d._anim !== 'Walk') { d.play('Walk'); d._anim = 'Walk'; } }
      else if (d._anim !== 'Idle') { d.play('Idle'); d._anim = 'Idle'; }
      d.face(-1);
      if (f.slot <= 1 && f.cd <= 0 && !attacking && H.attackGap <= 0 && Math.abs(dx) < 0.4) {
        f.state = 'tell'; f.t = 0; d.play('Bark', { loop: true, timeScale: 0.6 }); d._anim = 'Bark'; sfx.tell();
        warn.position.set(J.x + 0.6, 0.03, 0); warn.scale.set(2.2 + f.slot, 1.4, 1); warn.material.opacity = 0.32;
      }
      break;
    }
    case 'tell': {
      b.visible = true; b.position.set(f.x, d.height + 0.4 + Math.sin(f.t * 20) * 0.04, f.z + 0.3);
      d.setTint(0xff2a10, 0.06 + 0.16 * Math.abs(Math.sin(f.t * 12)));
      if (f.t >= f.def.tell) { f.state = 'lunge'; f.t = 0; f.x0 = f.x; f.tx = J.x + gapTo(f) * 0.82; d.setTint(0, 0); d.play('Attack', { loop: false, timeScale: 1.2 }); sfx.whoosh(); }
      break;
    }
    case 'lunge': {
      const dur = 0.22, k = Math.min(1, f.t / dur);
      f.x = f.x0 + (f.tx - f.x0) * k;
      f.threat = dur - f.t;
      if (!f.hitDone && k >= 0.85) {
        f.hitDone = true;
        if (J.inv <= 0 && J.x > f.tx - gapTo(f) * 0.82 - 0.55) hurtJohn(f.def.dmg, f.x);
        else if (J.inv <= 0 || J.x <= f.tx - gapTo(f) * 0.82 - 0.55) FX.ring(new THREE.Vector3(f.x - half(d) * 0.9, 0.5, f.z + 0.2), 0x9fd0ff, 0.6, 0.25);   // fangs snap on empty air
        sfx.bite();
      }
      if (k >= 1) { f.state = 'recover'; f.t = 0; f.hitDone = false; warn.material.opacity = 0; d.play('Idle_2_HeadLow', { timeScale: 1.3 }); d._anim = 'rec'; H.attackGap = 0.5; f.x = Math.max(f.x, J.x + gapTo(f) * 0.82); }
      break;
    }
    case 'recover': {
      if (f.t > 0.8) { f.state = 'approach'; f.cd = 1.0 + Math.random() * 1.0; }
      break;
    }
    case 'stagger': break;
    case 'run': {          // runner: slips past John on the near lane toward Hiro and Reika
      r.visible = true; r.position.set(f.x, d.height + 0.45, f.z + 0.3);
      f.x -= f.def.speed * dt; d.face(-1);
      if (f.x < JOHN.minX - 1.6) { f.state = 'gone'; d.root.visible = false; breach(); }
      break;
    }
    case 'dead': {
      if (f.t > 1.3) { d.fade(Math.max(0, 1 - (f.t - 1.3) / 0.6)); if (f.t > 1.9) { d.root.visible = false; f.state = 'gone'; } }
      break;
    }
  }
  if (f.state !== 'dead' && f.state !== 'gone') { d.root.position.x = f.x; d.root.position.z += (f.z - d.root.position.z) * Math.min(1, dt * 4); }
}

function damageFoe(f, dmg, o = {}) {
  if (f.state === 'dead' || f.state === 'gone') return;
  f.hp -= dmg;
  const d = f.dog;
  const p = d.root.position.clone().add(new THREE.Vector3(0, d.height * 0.6, 0.3));
  FX.impact(p, o.strong || dmg >= 2); d.setTint(0xffffff, 0.7); setTimeout(() => d.setTint(0, 0), 70);
  if (f.state === 'tell' || f.state === 'lunge') warn.material.opacity = 0;
  if (f.hp <= 0) {
    f.state = 'dead'; f.t = 0; d.play('Death', { loop: false }); sfx.bodyfall();
    H.defeated++; updateBars();
    if (f.type !== 'runner' && Math.random() < 0.35 && !o.quiet) say('l3_john_come', { noWait: true });
    return;
  }
  f.x += o.knock ?? 0.6; f.state = o.stagger ? 'stagger' : 'recover'; f.t = 0; f.stun = o.stagger || 0;
  d.play('Idle_HitReact1', { loop: false, fade: 0.05 }); d._anim = 'hit';
}
function breach() {
  H.breached++; updateBars();
  UI.toast('One got past! Hiro and Reika have to run harder…', 1.6);
  hurtJohn(1, cast3.john.root.position.x - 1, true);
}
function hurtJohn(dmg, fromX, noInv) {
  const J = H.J, j = cast3.john;
  if ((J.inv > 0 && !noInv) || H.over) return;
  J.hp = Math.max(0, J.hp - dmg); J.inv = 1.2; J.seq++; J.busy = false;
  UI.setHearts(J.hp, J.max);
  sfx.hurt(); shake(0.3 + dmg * 0.1); FX.flash('#ff2040', 0.3, 0.3);
  if (navigator.vibrate) try { navigator.vibrate(110); } catch (_) {}
  if (!noInv) tween(J, { x: clamp(J.x - 0.7, JOHN.minX, JOHN.maxX) }, 0.25, { ease: 'out' });
  j.play('Idle_HitReact2', { loop: false, fade: 0.05 });
  if (Math.random() < 0.4) say('l3_john_hurt', { noWait: true });
  setTimeout(() => { if (H && !J.busy) j.play('Idle'); }, 500);
  if (J.hp <= 0) loseWave();
}

// ---- John's moves
function frontFoe(reach) {
  const J = H.J; let best = null, bd = 1e9;
  for (const f of H.foes) {
    if (f.state === 'dead' || f.state === 'gone') continue;
    const dx = f.x - J.x;
    const ok = f.type === 'runner' ? Math.abs(dx) <= reach + 0.4 : dx > -0.4 && dx <= reach + half(f.dog) * 0.5;
    if (ok && Math.abs(dx) < bd) { bd = Math.abs(dx); best = f; }
  }
  return best;
}
async function bite() {
  const J = H.J, j = cast3.john;
  if (J.busy || J.biteCD > 0 || J.y > 0.05) return;
  J.biteCD = JOHN.biteCool; J.busy = true; const seq = ++J.seq;
  const f = frontFoe(JOHN.biteReach);
  j.play('Attack', { loop: false, timeScale: 1.15 }); sfx.lunge();
  if (!f) {        // snaps at empty air
    await tween(J, { x: clamp(J.x + 0.5, JOHN.minX, JOHN.maxX) }, 0.12, { ease: 'out' });
    if (seq !== J.seq) return; sfx.play ? sfx.play('bite_snap') : sfx.bite();
    await tween(J, { x: clamp(J.x - 0.5, JOHN.minX, JOHN.maxX) }, 0.18);
    if (seq === J.seq) { J.busy = false; j.play('Idle'); }
    return;
  }
  const dir = Math.sign(f.x - J.x) || 1; j.face(dir);
  const tx = clamp(f.x - dir * (half(f.dog) * 0.55 + half(j) * 0.55), JOHN.minX, JOHN.maxX + 1.2);
  await tween(J, { x: tx }, clamp(Math.abs(tx - J.x) / 12, 0.06, 0.18), { ease: 'in' });
  if (seq !== J.seq || !H) return;
  const counter = f.state === 'tell';
  sfx.bite();
  if (counter) { damageFoe(f, JOHN.counterDmg, { strong: true, knock: 0.9 }); addHenki(0.2); UI.toast('Counter!', 0.7); FX.hitStop && FX.hitStop(0.06); }
  else { damageFoe(f, JOHN.biteDmg, { knock: 0.5 }); addHenki(0.07); }
  await wait(0.14);
  if (seq !== J.seq || !H) return;
  await tween(J, { x: clamp(J.x - dir * 0.7, JOHN.minX, JOHN.maxX) }, 0.22, { ease: 'out' });
  if (seq === J.seq) { J.busy = false; j.play('Idle'); j.face(1); }
}
async function dodge(dir) {
  const J = H.J, j = cast3.john;
  if (J.y > 0.05) return;
  J.seq++; J.busy = true; const seq = J.seq;
  const perfect = H.foes.some(f => (f.state === 'lunge' && f.t < 0.2) || (f.state === 'tell' && f.def.tell - f.t < 0.3));
  J.inv = Math.max(J.inv, JOHN.iframes); sfx.dodge();
  if (perfect) {
    E.timeScale = 0.3; setTimeout(() => { if (S3.mode === 'fight' && !S3.paused) E.timeScale = 1; }, 420);
    sfx.perfect(); UI.toast('Perfect dodge!'); addHenki(0.25); J.inv = Math.max(J.inv, 0.6);
    FX.ring(j.root.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 0x9fd0ff, 1.8, 0.4);
  }
  j.play('Gallop', { timeScale: 1.4 }); FX.afterimage && FX.afterimage(j, 0x8fc8ff, 0.25, 0.35);
  await tween(J, { x: clamp(J.x + dir * JOHN.dodge, JOHN.minX, JOHN.maxX) }, JOHN.dodgeT, { ease: 'out' });
  if (seq !== J.seq) return;
  J.busy = false; j.play('Idle');
}
function roar() {
  const J = H.J, j = cast3.john;
  if (J.roarCD > 0) { UI.toast('Catching his breath…', 0.7); return; }
  J.roarCD = JOHN.roarCool;
  j.play('Bark', { loop: false }); sfx.growl(); sfx.bark();
  FX.ring(j.root.position.clone().add(new THREE.Vector3(0.4, 0.7, 0)), 0xffe0a0, 2.6, 0.4);
  for (const f of H.foes) if (f.state !== 'dead' && f.state !== 'gone' && f.type !== 'runner' && Math.abs(f.x - J.x) < 3.2) {
    f.state = 'stagger'; f.stun = JOHN.roarStun; f.t = 0; f.dog.play('Idle_HitReact1', { loop: false }); f.dog.setTint(0, 0);
  }
  warn.material.opacity = 0;
  setTimeout(() => { if (H && !H.J.busy) j.play('Idle'); }, 500);
}
function addHenki(v) {
  const J = H.J, was = J.henki;
  J.henki = Math.min(1, J.henki + v); S3.henki = J.henki; UI.setHenki(J.henki);
  if (was < 1 && J.henki >= 1) { UI.hint('Spirit full! Draw a circle ⟳ (or tap the Spirit ring) = <b>Ōu Fang</b>', 4); sfx.spirit(); }
}
async function ouFang() {
  const J = H.J, j = cast3.john;
  if (!H || H.over || J.henki < 1) return;
  J.henki = 0; S3.henki = 0; UI.setHenki(0);
  J.busy = true; const seq = ++J.seq; J.inv = 2;
  UI.cutin({ color: '#1c1a22', color2: '#cfd8ff', name: 'JOHN', move: 'Ōu Fang' }); sfx.cutin();
  say('l3_john_fang', { noWait: true });
  E.timeScale = 0.35; FX.speedLines(1);
  j.play('Gallop', { timeScale: 1.6 });
  await tween(J, { x: clamp(J.x + 2.2, JOHN.minX, JOHN.maxX + 1.5) }, 0.3, { ease: 'in' });
  FX.speedLines(0); E.timeScale = 1; setTimeout(() => UI.cutin(null), 600);
  if (seq !== J.seq || !H) return;
  j.play('Attack', { loop: false, timeScale: 1.3 });
  const p = j.root.position.clone().add(new THREE.Vector3(0.8, 0.7, 0));
  FX.slashArc(p, 0xcfe0ff, 1.8, 0.5); FX.flash('#dff0ff', 0.25, 0.7); FX.ring(p, 0xcfe0ff, 4, 0.5); sfx.hitHeavy(); sfx.shockwave(); shake(0.6);
  for (const f of [...H.foes]) if (f.state !== 'dead' && f.state !== 'gone' && Math.abs(f.x - J.x) < JOHN.fangRange) damageFoe(f, JOHN.fangDmg, { strong: true, knock: 1.4, stagger: 1.0, quiet: true });
  await wait(0.3);
  if (seq !== J.seq || !H) return;
  await tween(J, { x: clamp(J.x - 1.6, JOHN.minX, JOHN.maxX) }, 0.3, { ease: 'out' });
  if (seq === J.seq) { J.busy = false; j.play('Idle'); }
}

// ---- comrade cards
function useCard(id) {
  if (!H || H.over || S3.paused) return;
  const c = H.cards.find(k => k.id === id); if (!c) return;
  if (c.state !== 'ready') { sfx.denied(); return; }
  const a = H.allies.find(x => x.id === id); if (!a) return;
  const f = H.foes.filter(x => x.state !== 'dead' && x.state !== 'gone').sort((p, q) => Math.abs(p.x - H.J.x) - Math.abs(q.x - H.J.x))[0];
  if (!f) { UI.toast('No one to tackle yet', 0.8); return; }
  c.state = 'cooldown'; c.cool = c.cooldown; sfx.card();
  a.busy = true;
  const d = a.d; d.play('Gallop', { timeScale: 1.5 }); sfx.battleCry();
  const tx = f.x - half(f.dog) * 0.6 - half(d) * 0.5;
  tween(d.root.position, { x: tx, z: f.z - 0.35 }, 0.3, { ease: 'in' }).then(() => {
    if (!H) return;
    d.play('Attack', { loop: false }); sfx.hitHeavy();
    damageFoe(f, 2, { strong: true, knock: 1.0, stagger: 1.2 });
    for (const g of H.foes) if (g !== f && g.state !== 'dead' && g.state !== 'gone' && g.type !== 'runner' && Math.abs(g.x - f.x) < 2.5) { g.state = 'stagger'; g.stun = 1.0; g.dog.setTint(0, 0); }
    warn.material.opacity = 0;
    return wait(0.35).then(() => tween(d.root.position, { x: a.home[0], z: a.home[1] }, 0.5)).then(() => { d.face(1); d.play('Idle'); a.busy = false; });
  });
}
function tickCards(dt) {
  for (const c of H.cards) {
    if (c.state === 'cooldown') { c.cool -= dt; if (c.cool <= 0) { c.state = 'ready'; c.cool = 0; sfx.cardReady(); } }
    UI.updateCard(c);
  }
}

async function winWave() {
  if (H.over) return;
  H.over = true; setInputEnabled(false); UI.hint('');
  warn.material.opacity = 0;
  const j = cast3.john; j.play('Idle_2_HeadLow'); sfx.tired && sfx.tired();
  await wait(1.0, true);
  S3.mode = 'fightEnd';
  const done = H.done; clearFight(); UI.show('hud', false); if (hudEl) hudEl.style.display = 'none';
  done(true);
}
async function loseWave() {
  if (H.over) return;
  H.over = true; setInputEnabled(false); warn.material.opacity = 0;
  for (const f of H.foes) f.dog.setTint(0, 0);
  cast3.john.play('Death', { loop: false }); sfx.die(); music(null);
  await wait(1.4, true);
  S3.mode = 'fightEnd';
  const done = H.done; clearFight(); S3.henki = 0;
  done(false);
}

// ---------------------------------------------------------------- input
function handleGesture(g) {
  if (!S3.active || S3.paused || S3.mode !== 'fight' || !H || H.over) return;
  if (g.type === 'tap') bite();
  else if (g.type === 'swipe') { if (g.dir === 'up') roar(); else if (g.dir === 'left') dodge(-1); else if (g.dir === 'right') dodge(1); else bite(); }
  else if (g.type === 'arc') { if (H.J.henki >= 1) ouFang(); else { UI.toast('Spirit is not full yet', 1); bite(); } }
}

// =====================================================================================
function update(dt, dtr) {
  for (const d of Object.values(cast3)) if (d.root.visible) d.update(dt);
  if (!S3.active || S3.paused) return;
  if (S3.mode === 'fight' && H && !H.over) fightUpdate(dt, dtr);
}

export function setPaused3(p) {
  if (!S3.active || S3.mode !== 'fight') return false;
  S3.paused = p; E.timeScale = p ? 0 : 1;
  UI.show('pause', p); sfx[p ? 'uiOpen' : 'uiBack']();
  return true;
}
export function quit3() {
  if (!S3.active) return;
  S3.token++;
  if (H) H.over = true;
  if (S3.retry) { const r = S3.retry; S3.retry = null; r('quit'); }
  E.skipping = true;
  setTimeout(() => { E.skipping = false; }, 300);
  UI.show('hud', false); UI.cine(false); UI.hint(''); UI.cutin(null); stopVoice();
  for (const id of ['pause', 'defeat']) UI.show(id, false);
  music(null); ambience(false);
  leave();
}
export const isLevel3Active = () => S3.active;

// test hooks (Playwright)
export const debug3 = {
  S3, get H() { return H; },
  winWave: () => { if (H && !H.over) { for (const f of H.foes) if (f.state !== 'dead' && f.state !== 'gone') { f.state = 'gone'; f.dog.root.visible = false; H.defeated++; } H.defeated += H.queue.length; H.queue = []; updateBars(); } },
  killFront: () => { if (H) { const f = frontFoe(99); if (f) damageFoe(f, 99); } },
  fillHenki: () => H && addHenki(1),
  fang: () => H && ouFang(),
  hurt: n => H && hurtJohn(n || 1, 5, true),
  gesture: g => handleGesture(g),
};
