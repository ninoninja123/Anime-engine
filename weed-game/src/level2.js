// LEVEL 2 "Gajō – Kaibutsu": real-time gesture-controlled boss fight + data-driven cutscenes (scenes.js).
// Phases: 1) fight -> armor -> Smith's sacrifice (rockslide)  2) fight -> "Four Arrows"
//         3) staggering monster -> Weed's Battōga finisher -> fall into the gorge -> river, helicopter, graves at dusk.
// Pack cards = special moves with an anime cut-in, choreography, impact FX and a clean exit.
import { makeTelegraph } from './gfx/telegraph.js';
import * as THREE from 'three';
import { E, tween, wait, shake } from './engine.js';
import { makeDog, gradientMap, loadFor } from './dogs.js';
import { LEVEL2_CAST } from './characters.js';
import * as FX from './fx.js';
import { sfx, music, ambience, preloadMusic, duck, preloadSfx } from './audio.js';
import { initFootsteps } from './footsteps.js';
import { say, preloadLines, stopVoice } from './voice.js';
import { runScene, setSceneCast, freezeFrame } from './scenes.js';
import * as UI from './ui.js';
import { onGesture, setInputEnabled } from './input.js';
import * as SC from './data/scenes_level2.js';
import * as C from './contact.js';

const ARENA = { min: -5.6, max: 5.6 };
const PHASE_HP = { 1: 100, 2: 45, 3: 8 };   // 1: taistelu -> Neljä nuolta (45)  2: taistelu -> lukitus (20)  3: Battōga
const MEN = ['robert', 'rocker', 'heuler'];

export const cast = {};
const S = {
  active: false, cutscene: false, special: false, paused: false, phase: 1, defeats: 0,
  slowT: 0, slowScale: 1,
  W: { hp: 5, max: 5, x: -3, y: 0, vy: 0, inv: 0, busy: false, seq: 0, henki: 0 },
  B: { hp: 100, max: 100, x: 3.5, armored: false, weakT: 0, open: false, threatT: -1, token: 0, speed: 1, attacking: false, stagger: 0 },
  cards: [], pending: null, onExit: null,
};
window.__S = S;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function setSlow(scale, realSecs) { S.slowScale = scale; S.slowT = realSecs; }
const bossHalf = () => cast.kaibutsu.length * 0.5;

// ---------------------------------------------------------------- props
let warnMat, warn, bang, reticle, rocks = [];
function makeProps() {
  // soft rounded danger zone (gfx/telegraph.js); fades out by itself if the attack is interrupted
  warn = makeTelegraph({ guard: () => S.active && !S.cutscene && !S.special && S.B && S.B.attacking }); warnMat = warn.material; E.scene.add(warn);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.font = '900 56px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ff4030';
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.strokeText('!', 32, 54); g.fillText('!', 32, 54);
  bang = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  bang.scale.setScalar(0.9); bang.visible = false; E.scene.add(bang);
  // Jeromen analyysin tähtäin heikon kohdan päällä
  const rc = document.createElement('canvas'); rc.width = rc.height = 128;
  const r = rc.getContext('2d'); r.strokeStyle = '#ffd27a'; r.lineWidth = 6;
  r.beginPath(); r.arc(64, 64, 44, 0, Math.PI * 2); r.stroke();
  r.lineWidth = 4; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; r.beginPath(); r.moveTo(64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30); r.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); r.stroke(); }
  reticle = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  reticle.scale.setScalar(1.3); E.scene.add(reticle);
}
function showWarn(x, w, on = true) { warn.position.x = x; warn.scale.set(w, 1.6, 1); warnMat.opacity = on ? 0.35 : 0; }

const rockMat = new THREE.MeshToonMaterial({ color: 0x59617a, gradientMap });
function makeRock(r = 0.45) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
  const ol = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide }));
  ol.scale.setScalar(1.08); m.add(ol);
  E.scene.add(m); return m;
}

// ---------------------------------------------------------------- cast
export async function createCast() {
  await loadFor(LEVEL2_CAST);
  for (const id of LEVEL2_CAST) {
    const d = makeDog(id); cast[id] = d; E.scene.add(d.root);
    d.root.visible = false;
  }
  setSceneCast(cast);
  initFootsteps(cast);            // askeläänet liikkeen mukaan (myös kohtauksissa)
  makeProps();
  E.updaters.add(update);
  onGesture(handleGesture);
}

function place(id, x, z = 0, face = 1, anim = 'Idle') {
  const d = cast[id]; d.root.visible = true; d.fade(1);
  d.root.position.set(x, 0, z); d.face(face, true); d.spin.rotation.set(0, 0, 0); d.pose.rotation.set(0, 0, 0); d._cxBusy = null;
  d.play(anim); return d;
}

// ---------------------------------------------------------------- cards (special moves)
function cardDefs() {
  return [
    { id: 'jerome', name: 'Jerome', desc: 'Weak-spot analysis', color: '#a9733a', color2: '#e0b070', cooldown: 15, cool: 4, state: 'cooldown' },
    { id: 'kenkage', name: 'Ken & Kagetora', desc: 'Twin Fang', color: '#585c66', color2: '#d8d2c4', cooldown: 20, cool: 9, state: 'cooldown' },
    { id: 'lock', name: 'Weed, Ken & Kagetora', desc: 'Pin it down', color: '#4a5a72', color2: '#e6ecf4', cooldown: 1, cool: 0, state: 'locked' },   // canon: kolmikko lukitsee P4:n, Jerome puree valtimoon
  ];
}

function useCard(id) {
  if (!S.active || S.cutscene || S.special || S.paused) return;
  const c = S.cards.find(k => k.id === id);
  if (!c) return;
  if (c.state === 'sacrifice') { c.state = 'fallen'; UI.updateCard(c); sfx.sacrifice(); lockScene(); return; }
  if (c.state !== 'ready') { sfx.denied(); return; }
  if (S.phase === 3) { UI.toast('This is Weed\'s moment!'); return; }
  sfx.card();
  c.state = 'cooldown'; c.cool = c.cooldown;
  if (id === 'jerome') special(jeromeReveal);
  if (id === 'kenkage') special(kenKageStrike);
}

/** Special move wrapper: pauses the boss, lets the player tap to skip, restores the camera. */
async function special(fn) {
  S.special = true; S.W.seq++; S.W.busy = false;
  const B = S.B; B.token++; endAttackVisuals();
  setInputEnabled(true);
  try { await fn(); } catch (e) { console.error(e); }
  E.skipping = false; E.timeScale = 1; FX.speedLines(0); UI.cutin(null);
  S.special = false;
  if (S.active && !S.cutscene) { B.token++; bossBrain(B.token); }
}

async function jeromeReveal() {
  const j = cast.jerome, B = S.B, boss = cast.kaibutsu;
  const home = { x: j.x, z: j.root.position.z };
  UI.cutin({ name: 'JEROME', move: 'Weak-Spot Analysis', color: '#a9733a', color2: '#ffd27a' });
  sfx.cutin(); duck(0.4, 1.2);
  E.timeScale = 0.12;
  await wait(0.75, true);
  UI.cutin(null);
  // dash in, low-angle close-up on Jerome's eyes
  E.timeScale = 1;
  j.face(1); j.play('Gallop', { timeScale: 1.4 });
  const tx = clamp(B.x - bossHalf() - 2.2, ARENA.min, ARENA.max);
  await tween(j.root.position, { x: tx, z: 0.9 }, 0.35, { ease: 'out' });
  j.play('Bark'); say('card_reveal', { noWait: true }); sfx.bark();
  const jp = j.root.position;
  await Promise.all([
    tween(E.camPos, { x: jp.x - 0.4, y: j.height * 0.9, z: jp.z + 1.6 }, 0.25, { real: true, ease: 'out' }),
    tween(E.camLook, { x: jp.x + 1.5, y: j.height * 0.8, z: jp.z }, 0.25, { real: true, ease: 'out' }),
  ]);
  E.timeScale = 0.15;
  await wait(0.45, true);
  // whip-pan to the weak spot: reticle locks on, glow pulses
  const wp = boss.weak.getWorldPosition(new THREE.Vector3());
  await Promise.all([
    tween(E.camPos, { x: wp.x - 0.6, y: wp.y + 0.3, z: wp.z + 3.2 }, 0.22, { real: true, ease: 'out' }),
    tween(E.camLook, { x: wp.x, y: wp.y, z: wp.z }, 0.22, { real: true, ease: 'out' }),
  ]);
  B.weakT = 9; tween(boss, { weakReveal: 1 }, 0.25, { real: true });
  reticle.material.opacity = 1; reticle.scale.setScalar(3);
  tween(reticle.scale, { x: 1.3, y: 1.3 }, 0.3, { real: true, ease: 'out' });
  sfx.scan(); setTimeout(() => sfx.lockOn(), 300);      // heikon kohdan tähtäin: skannaus-ping + lukittuu
  FX.ring(wp, 0xffaa55, 2.5, 0.6); FX.burst(wp, { color: 0xffb070, count: 20 });
  FX.flash('#ffe2b0', 0.25, 0.35);
  await wait(0.55, true);
  E.timeScale = 1;
  j.play('Gallop'); j.face(-1);
  await tween(j.root.position, { x: home.x, z: home.z }, 0.5, { ease: 'inOut' });
  j.face(1); j.play('Idle');
}

async function kenKageStrike() {
  const k = cast.ken, g = cast.kagetora, B = S.B, boss = cast.kaibutsu;
  const homes = [[k.x, k.root.position.z], [g.x, g.root.position.z]];
  UI.cutin({ name: 'KEN & KAGETORA', move: 'Twin Fang', color: '#585c66', color2: '#f2eadc' });
  sfx.cutin(); duck(0.4, 1.4);
  E.timeScale = 0.12;
  await wait(0.7, true);
  UI.cutin(null); E.timeScale = 1;
  const dir = Math.sign(B.x - S.W.x) || 1;
  // both charge from different lanes, camera low behind them
  for (const d of [k, g]) { d.play('Gallop', { timeScale: 1.5 }); d.face(dir); }
  say('sync_call', { noWait: true });
  E.camPos.set(B.x - dir * 4.6, 0.7, 6.2); E.camLook.set(B.x - dir * 2.2, 1.3, 0.6);
  await Promise.all([
    tween(k.root.position, { x: B.x - dir * (bossHalf() + 2.0), z: 1.5 }, 0.42, { ease: 'in' }),
    tween(g.root.position, { x: B.x - dir * (bossHalf() + 1.6), z: 0.9 }, 0.38, { ease: 'in' }),
  ]);
  say('sync_reply', { noWait: true });
  // two spinning fangs at once: Ken's jaws close on the shoulder, Kagetora's on the haunch (both real contacts)
  FX.vortex(g.root, dir, g.height * 0.8, 0.6);
  E.timeScale = 0.3; FX.speedLines(1); sfx.rushWhoosh && sfx.rushWhoosh();
  tween(E.camPos, { x: B.x - dir * 2.4, y: 1.6, z: 5.6 }, 0.9, { real: true, ease: 'out' });
  tween(E.camLook, { x: B.x - dir * 0.4, y: 1.7, z: 0.4 }, 0.9, { real: true, ease: 'out' });
  const fang = (who, point, arc) => C.strike({ who, target: 'kaibutsu', point, side: 'near', wind: 0.12, t: 0.3, arc, anim: 'Battoga', ts: 1.8, hitAt: 0.4,
    pin: 0.45, then: 'drop', react: 'none', fx: 'impact', strong: true, sfx: [], depth: 0.5, fleshSfx: false, hitstop: 0, maxPitch: 1.0, tug: 0.25 });
  await Promise.all([fang('ken', 'shoulder', 0.8), fang('kagetora', 'hip', 0.6)]);
  const pk = C.mouthWorld('ken'), pg = C.mouthWorld('kagetora'), mid = pk.clone().lerp(pg, 0.5);
  FX.slashArc(mid, 0xd8e6ff, 1.5, 0.5, 0.8);
  FX.slashArc(mid, 0xffe0b0, 1.5, 0.5, -0.8);
  sfx.bite(); sfx.twinFang(); FX.flash('#ffffff', 0.25, 0.6);
  FX.ring(mid, 0xffffff, 5, 0.5);
  E.timeScale = 1; FX.speedLines(0);
  damageBoss(9, pk, { stagger: 1.8, force: false });
  await freezeFrame(0.22);
  shake(0.5);
  await wait(0.75);             // fangs held, then they drop off
  for (const d of [k, g]) { d.play('Gallop', { timeScale: 1.2 }); d.face(-dir); }
  await Promise.all([
    tween(k.root.position, { x: homes[0][0], y: 0, z: homes[0][1] }, 0.8),
    tween(g.root.position, { x: homes[1][0], y: 0, z: homes[1][1] }, 0.8),
  ]);
  for (const d of [k, g]) { d.face(1); d.play('Idle'); }
}

// ---------------------------------------------------------------- level start
export async function startLevel({ phase = 1, intro = true, onExit } = {}) {
  S.onExit = onExit;
  S.defeats = 0;
  S.cards = cardDefs();
  UI.buildCards(S.cards, useCard);
  if (phase >= 3) { const lk = S.cards.find(c => c.id === 'lock'); lk.state = 'fallen'; }
  preloadMusic('battle', 'sad', 'dawn', 'smith', 'smith2');
  setupArena(phase);
  preloadSfx('boss', 'cine');     // boss- ja kohtausäänet ennen intro-kohtausta
  ambience(phase >= 2 ? 'boss' : 'battle');
  if (intro && phase === 1) await introCutscene();
  beginPhase(phase);
}

function setupArena(phase) {
  for (const d of Object.values(cast)) d.root.visible = false;
  S.W.x = -3; S.W.y = 0; S.W.vy = 0; S.W.busy = false; S.W.seq++; S.W.inv = 0;
  place('weed', S.W.x, 0, 1);
  S.B.x = 3.5; place('kaibutsu', S.B.x, 0, -1);
  cast.kaibutsu.weakReveal = 0;
  cast.kaibutsu.eyes.material.color.set(phase >= 2 ? 0xff3010 : 0xffb030);
  place('jerome', -5.6, -2.6, 1);
  place('ken', -7.2, -3.0, 1);
  place('kagetora', -4.2, -2.3, 1);
  // Smith ja North kaatuivat yöllä Gajōn sisällä (intro); Jeromen miehet ovat mukana Neljään nuoleen asti
  if (phase === 1) MEN.forEach((id, i) => place(id, -9.4 - i * 1.2, -4.4 + (i % 2) * 0.5, 1, 'Idle'));
  E.camPos.set(0, 2.4, 9); E.camLook.set(0, 1.4, 0);
}

function beginPhase(p) {
  S.phase = p;
  const B = S.B, W = S.W;
  B.hp = PHASE_HP[p]; B.armored = false; B.weakT = 0; B.open = false; B.stagger = 0; B.attacking = false;
  B.speed = p === 1 ? 1 : p === 2 ? 1.22 : 0.6;
  W.hp = W.max; W.inv = 1;
  if (p === 3) W.henki = 1;
  S.active = true; S.cutscene = false; S.special = false; S.pending = null;
  UI.cine(false); UI.show('hud', true);
  UI.setHearts(W.hp, W.max); UI.setBossHP(B.hp / B.max); UI.setHenki(W.henki);
  for (const c of S.cards) UI.updateCard(c);
  setInputEnabled(true);
  music('battle');
  ambience(p >= 2 ? 'boss' : 'battle');   // vaihe 2–3: matala drone mukaan
  if (p === 1) UI.hint('Tap = bite &nbsp;•&nbsp; Swipe ←/→ = dodge &nbsp;•&nbsp; Swipe ↑ = jump', 6);
  if (p === 2) UI.hint('Kaibutsu is enraged and faster. Use Jerome and strike its left chest!', 4);
  if (p === 3) UI.hint('Kaibutsu is staggering! Draw a circle ⟳ – <b>BATTŌGA!</b>');
  B.token++;
  bossBrain(B.token);
}

// ---------------------------------------------------------------- input
function handleGesture(g) {
  if (S.special && g.type === 'tap') { E.skipping = true; return; }   // tap skips a special move
  if (!S.active || S.cutscene || S.special || S.paused) return;
  const W = S.W;
  if (g.type === 'tap') bite();
  else if (g.type === 'swipe') {
    if (g.dir === 'up') jump();
    else if (g.dir === 'left') dodge(-1);
    else if (g.dir === 'right') dodge(1);
  } else if (g.type === 'arc') {
    if (W.henki >= 1) battoga();
    else { UI.toast('Spirit is not full yet', 1); bite(); }
  }
}

function checkPerfect() {
  const t = S.B.threatT;
  if (t > 0 && t < 0.32) {
    setSlow(0.25, 0.7); sfx.perfect();
    UI.toast('Perfect dodge!');
    addHenki(0.25);
    FX.ring(cast.weed.root.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x9fd0ff, 2.5, 0.5);
  }
}

function addHenki(v) {
  const W = S.W; const was = W.henki;
  W.henki = Math.min(1, W.henki + v); UI.setHenki(W.henki);
  if (was < 1 && W.henki >= 1) { UI.hint('Spirit full! Draw a circle ⟳ = Battōga', 3); sfx.spirit(); }
}

async function bite() {
  const W = S.W, B = S.B, w = cast.weed;
  if (W.busy || W.y > 0.05) return;
  W.busy = true; const seq = ++W.seq;
  const dir = Math.sign(B.x - W.x) || 1;
  w.face(dir, true);
  sfx.lunge();
  // real contact: Weed's jaws close on the near foreleg (he is small – the leg is what he can reach)
  w.root.position.x = W.x; w.root.position.y = 0;
  const dist = Math.abs(B.x - W.x);
  await C.strike({ who: 'weed', target: 'kaibutsu', point: 'leg', side: 'near', t: clamp(dist / 10, 0.14, 0.4), anim: 'Gallop', ts: 1.6, hitAt: 0.35,
    react: B.attacking ? 'none' : 'flinch', fx: B.armored ? 'none' : undefined, sfx: [], recoil: { dist: 1.8, t: 0.26, arc: 0.2 }, after: 'Idle', wait: 'end',
    onHit: (P) => { if (seq !== W.seq) return; sfx.bite(); damageBoss(4, P); addHenki(0.1); } });
  if (seq !== W.seq) return;
  W.x = clamp(w.root.position.x, ARENA.min, ARENA.max); W.y = 0;
  w.play('Idle'); W.busy = false;
}

async function dodge(dir) {
  const W = S.W, w = cast.weed;
  if (W.y > 0.05) return;
  const seq = ++W.seq; W.busy = true;
  checkPerfect();
  W.inv = Math.max(W.inv, 0.32);
  sfx.dodge();
  w.play('Gallop', { timeScale: 2 });
  w.face(dir);
  FX.dust(new THREE.Vector3(W.x, 0.1, 0));
  await tween(W, { x: clamp(W.x + dir * 2.6, ARENA.min, ARENA.max) }, 0.22, { ease: 'out' });
  if (seq !== W.seq) return;
  w.play('Idle'); W.busy = false;
}

function jump() {
  const W = S.W, w = cast.weed;
  if (W.y > 0.05) return;
  W.seq++; W.busy = false;
  checkPerfect();
  W.vy = 9.2; W.y = 0.01;
  sfx.jump();
  w.play('Gallop_Jump', { loop: false, timeScale: 1.1 });
}

/** In-battle Battōga: crouch, corkscrew spin (forward flip + barrel roll), slash trail, heavy hit. */
async function battoga() {
  const W = S.W, B = S.B, w = cast.weed;
  if (W.busy && S.phase !== 3) return;
  if (S.phase === 3) { finale(); return; }
  W.henki = 0; UI.setHenki(0);
  W.busy = true; const seq = ++W.seq; W.inv = 2;
  const dir = Math.sign(B.x - W.x) || 1; w.face(dir);
  say('battoga', { noWait: true }); sfx.battoga(); setSlow(0.3, 1.0); FX.speedLines(1);
  const startX = W.x;
  w.play('Jump_ToIdle', { loop: false });               // crouch
  await wait(0.12);
  if (seq !== W.seq) return;
  FX.vortex(w.root, dir, w.height * 0.9, 0.7);
  const trail = setInterval(() => FX.slashArc(w.root.position.clone().add(new THREE.Vector3(0, w.height * 0.5, 0.3)), 0xbfe4ff, 0.7, 0.35, Math.random() * 6), 70);
  // the spinning fang closes on P4's shoulder (real contact), holds for a beat, then Weed drops off
  w.root.position.set(W.x, 0, w.root.position.z);
  await C.strike({ who: 'weed', target: 'kaibutsu', point: 'shoulder', side: 'near', t: 0.5, arc: 0.9, anim: 'Battoga', ts: 1.6, hitAt: 0.4,
    pin: 0.2, then: 'drop', releaseOpts: { land: 'Jump_ToIdle', after: 'Idle' }, react: 'none', fx: 'none', sfx: ['bite'], hitstop: 0, maxPitch: 1.0, tug: 0.3,
    onHit: (p) => {
      clearInterval(trail); FX.speedLines(0);
      FX.flash('#dff0ff', 0.3, 0.8); sfx.boom(); FX.ring(p, 0xbfe4ff, 5, 0.5);
      if (seq === W.seq) damageBoss(16, p, { strong: true, stagger: 1.2, battoga: true });
    } });
  clearInterval(trail); FX.speedLines(0);
  while (w._cxBusy && seq === W.seq) await wait(0.05);
  if (seq !== W.seq) return;
  W.x = clamp(w.root.position.x, ARENA.min, ARENA.max); W.y = 0;
  w.play('Gallop', { timeScale: 1.4 });
  await tween(W, { x: clamp(startX, ARENA.min, ARENA.max) }, 0.4, { ease: 'out' });
  if (seq !== W.seq) return;
  w.play('Idle');
  W.busy = false;
}

// ---------------------------------------------------------------- damage
function damageBoss(amount, pos, o = {}) {
  const B = S.B, boss = cast.kaibutsu;
  const p = pos || new THREE.Vector3(B.x, 1.3, 0.5);
  if (B.armored && !o.force) {
    FX.burst(p, { color: 0x9aa3b8, count: 8, speed: 3 }); sfx.parry();   // kivikova nahka: kilahdus
    UI.toast('No effect! Its hide is like stone', 1.1);
    return 0;
  }
  let d = amount;
  if (B.open) d *= 1.6;
  if (B.weakT > 0) d *= 2;
  const floor = S.phase === 3 ? 2 : 0;
  B.hp = Math.max(floor, B.hp - d);
  UI.setBossHP(B.hp / B.max, B.armored);
  FX.impact(p, o.strong || B.weakT > 0);
  if (B.weakT > 0) FX.burst(p, { color: 0xff9a50, count: 12, speed: 5 });
  if (B.weakT > 0 && !o.battoga) sfx.crit({}, { x: p.x });          // kriittinen isku heikkoon kohtaan
  boss.setTint(0xffffff, 0.8); setTimeout(() => boss.setTint(0x000000, 0), 70);
  if (B.open && !o.battoga) UI.toast(B.weakT > 0 ? 'Weak spot + opening!' : 'Opening!', 0.7);
  else if (B.weakT > 0 && !o.battoga) UI.toast('Weak spot!', 0.6);
  if (o.stagger) { B.stagger = o.stagger; B.token++; endAttackVisuals(); if (!S.special) bossBrain(B.token); }
  else if (!B.attacking) boss.play('Idle_HitReact1', { loop: false, fade: 0.05 });
  if (!S.special) setSlow(0.05, o.strong ? 0.12 : 0.05);
  if (navigator.vibrate) try { navigator.vibrate(o.strong ? 60 : 20); } catch (_) {}
  checkThresholds();
  return d;
}

function checkThresholds() {
  const B = S.B;
  if (S.phase === 1 && B.hp <= PHASE_HP[2] && !S.pending) { S.pending = 'arrows'; fourArrows(); }
  if (S.phase === 2 && B.hp <= 20) {
    B.hp = Math.max(B.hp, 20); UI.setBossHP(B.hp / B.max);
    const lk = S.cards.find(c => c.id === 'lock');
    if (lk.state === 'locked') {
      lk.state = 'sacrifice'; UI.updateCard(lk);
      sfx.roar(); shake(0.4); say('roar_armor', { noWait: true });
      UI.hint('Its hide is too tough to finish it! <b>Tap the card – pin it down for Jerome.</b>');
    }
  }
}

function hurtWeed(fromX, o = {}) {
  const W = S.W, w = cast.weed;
  if (W.inv > 0) return;
  C.cancel('weed');
  W.hp -= 1; W.inv = 1.3; W.seq++; W.busy = false;
  UI.setHearts(W.hp, W.max);
  sfx.hurt(); shake(0.35); FX.flash('#ff2040', 0.35, 0.35);
  if (navigator.vibrate) try { navigator.vibrate(120); } catch (_) {}
  const dir = o.dir || Math.sign(W.x - fromX) || -1;
  // thrown by the blow: arc through the air (gravity in update() lands him with dust)
  if (o.toss) { W.vy = o.toss; W.y = Math.max(W.y, 0.02); }
  tween(W, { x: clamp(W.x + dir * (o.dist || 1.8), ARENA.min, ARENA.max) }, o.toss ? 0.55 : 0.3, { ease: 'out' });
  w.play('Idle_HitReact2', { loop: false, fade: 0.05 });
  setTimeout(() => { if (!W.busy && W.y <= 0.01) w.play('Idle'); }, 500);
  if (W.hp <= 0) defeat();
}

async function defeat() {
  S.active = false; S.B.token++; endAttackVisuals();
  setInputEnabled(false);
  cast.weed.play('Death', { loop: false });
  S.defeats++;
  music(null); sfx.die();
  await wait(1.4, true);
  sfx.gameOver();
  UI.show('hud', false);
  UI.show('defeat', true);
}
export function retryPhase() {
  UI.show('defeat', false);
  setupArena(S.phase);
  if (S.phase >= 2) cast.smith.root.visible = false;
  S.W.henki = 0;
  beginPhase(S.phase);
}

// ---------------------------------------------------------------- boss AI
function endAttackVisuals() {
  showWarn(0, 1, false); bang.visible = false; S.B.threatT = -1; S.B.attacking = false; S.B.open = false;
  cast.kaibutsu.setTint(0x000000, 0);
  cast.kaibutsu.root.position.y = 0;
  for (const r of rocks) E.scene.remove(r); rocks = [];
}

async function bossBrain(token) {
  const B = S.B, boss = cast.kaibutsu;
  const alive = () => token === B.token && S.active && !S.cutscene && !S.special;
  if (B.stagger > 0) {
    boss.play('Idle_HitReact2', { loop: false });
    await wait(B.stagger);
    B.stagger = 0;
    if (!alive()) return;
  }
  let last = '';
  while (alive()) {
    boss.play('Walk', { timeScale: 0.9 * B.speed });
    const t0 = E.time;
    const keep = bossHalf() + 1.6;
    while (alive() && E.time - t0 < (S.phase === 3 ? 2.2 : 1.1 / B.speed)) {
      const want = clamp(S.W.x + (B.x >= S.W.x ? keep : -keep), ARENA.min + 0.5, ARENA.max - 0.5);
      const dx = want - B.x;
      boss.face(Math.sign(S.W.x - B.x) || -1);
      B.x += clamp(dx, -1, 1) * 1.6 * B.speed * (1 / 60) * (E.timeScale > 0 ? 1 : 0);
      await wait(1 / 60);
    }
    if (!alive()) return;
    const dist = Math.abs(S.W.x - B.x);
    let pick;
    if (S.phase === 3) pick = 'pounce';
    else if (dist < keep + 0.5 && last !== 'pounce') pick = 'pounce';
    else pick = Math.random() < 0.5 && last !== 'charge' ? 'charge' : (last === 'rock' ? 'charge' : 'rock');
    last = pick;
    B.attacking = true;
    if (pick === 'charge') await atkCharge(alive);
    else if (pick === 'rock') await atkRock(alive);
    else await atkPounce(alive);
    if (!alive()) return;
    B.attacking = false;
  }
}

async function telegraph(alive, secs) {
  const B = S.B, boss = cast.kaibutsu;
  sfx.tell(); bang.visible = true;
  const t0 = E.time;
  while (alive() && E.time - t0 < secs) {
    const k = (E.time - t0) / secs;
    boss.setTint(0xff2a10, 0.06 + 0.14 * Math.abs(Math.sin(k * 12)));
    bang.position.set(B.x, boss.height + 0.6 + Math.sin(k * 20) * 0.05, 0.5);
    await wait(1 / 60);
  }
  bang.visible = false; boss.setTint(0x000000, 0);
}

async function recover(alive, secs) {
  const B = S.B, boss = cast.kaibutsu;
  B.open = true; B.threatT = -1;
  boss.play('Idle_2_HeadLow', { timeScale: 1.5 });
  await wait(secs);
  B.open = false;
}

async function atkCharge(alive) {
  const B = S.B, boss = cast.kaibutsu, W = S.W;
  const dir = Math.sign(W.x - B.x) || -1;
  boss.face(dir);
  boss.play('Eating', { timeScale: 1.4 });
  const endX = dir > 0 ? ARENA.max + 0.3 : ARENA.min - 0.3;
  showWarn((B.x + endX) / 2, Math.abs(endX - B.x) + 2);
  await telegraph(alive, 0.95 / B.speed);
  if (!alive()) return;
  boss.play('Gallop', { timeScale: 1.1 });
  sfx.roar();
  const speed = 12 * B.speed;
  let hit = false, reaching = null;
  C.SEP.skip.add('weed');                         // stays in the lane: the charge either connects or he must dodge/jump
  while (alive() && Math.sign(endX - B.x) === dir) {
    const step = speed * Math.min(E.timeScale > 0 ? 1 / 60 : 0, 1);
    B.x += dir * step;
    const ahead = (W.x - B.x) * dir;
    B.threatT = ahead > 0 ? ahead / speed : -1;
    // close enough: P4 plants its forelegs and drives its jaws down into Weed (real contact, below)
    if (W.y < 0.9 && W.inv <= 0 && Math.abs(cast.weed.root.position.z) < 0.9) {
      const gap = (W.x - C.pawWorld('kaibutsu').x) * dir;
      if (gap > 0.2 && gap < 1.0) { reaching = gap; break; }
    }
    if (Math.random() < 0.3) FX.dust(new THREE.Vector3(B.x - dir, 0.1, 0));
    await wait(1 / 60);
  }
  showWarn(0, 1, false); B.threatT = -1;
  C.SEP.skip.delete('weed');
  if (!alive()) return;
  if (reaching !== null) {
    tween(B, { x: B.x + dir * clamp(reaching - 0.5, 0, 0.5) }, 0.14, { ease: 'out' });     // last step in
    boss.play('Jump_ToIdle', { loop: false }); FX.dust(new THREE.Vector3(B.x + dir, 0.1, 0), true); sfx.slide({}, { x: B.x });
    // the forepaw comes down on him (a small dog is struck with the paw, not swallowed by the jaws)
    await C.reach({ who: 'kaibutsu', target: 'weed', point: 'back', side: 'near', part: 'paw', t: 0.16, hold: 0.12, back: 0.35, fx: 'impact', strong: true, sfx: ['hitHeavy', 'bodyfall'], react: 'none',
      onHit: () => { if (S.W.y < 0.9 && S.W.inv <= 0) { hit = true; hurtWeed(B.x, { dir, dist: 3.2, toss: 7 }); sfx.roar(); } } });
  }
  if (hit && reaching === null) {                      // skids to a stop after the blow
    const v0 = speed * 0.6; let v = v0;
    while (alive() && v > 0.3) { B.x = clamp(B.x + dir * v / 60, ARENA.min - 0.3, ARENA.max + 0.3); v *= 0.88; if (Math.random() < 0.4) FX.dust(new THREE.Vector3(B.x + dir, 0.1, 0)); await wait(1 / 60); }
    boss.play('Idle_HitReact1', { loop: false });
  }
  shake(0.3); sfx.bossCrash({}, { x: B.x });
  await recover(alive, 1.5 / B.speed);
}

async function atkRock(alive) {
  const B = S.B, boss = cast.kaibutsu, W = S.W;
  boss.face(Math.sign(W.x - B.x) || -1);
  const rock = makeRock(0.5); rocks.push(rock);
  boss.play('Bark', { loop: true, timeScale: 0.4 });
  const t0 = E.time; const tell = 0.85 / B.speed;
  sfx.rockLift({}, { x: B.x }); sfx.tell(); bang.visible = true;
  while (alive() && E.time - t0 < tell) {
    rock.position.set(B.x + boss.facing * bossHalf() * 0.8, boss.height + 0.3, 0.2);
    rock.rotation.x += 0.1;
    showWarn(W.x, 1.8);
    bang.position.set(B.x, boss.height + 1.1, 0.5);
    await wait(1 / 60);
  }
  bang.visible = false;
  if (!alive()) return;
  boss.play('Attack', { loop: false, timeScale: 0.9 });
  const tx = W.x, from = rock.position.clone(), flight = 0.95 / B.speed;
  sfx.throw({}, { x: B.x });
  const t1 = E.time;
  while (alive() && E.time - t1 < flight) {
    const k = (E.time - t1) / flight;
    rock.position.set(from.x + (tx - from.x) * k, from.y * (1 - k) + Math.sin(k * Math.PI) * 3.2, 0.2);
    rock.rotation.z -= 0.2;
    B.threatT = flight - (E.time - t1);
    await wait(1 / 60);
  }
  B.threatT = -1; showWarn(0, 1, false);
  E.scene.remove(rock); rocks = rocks.filter(r => r !== rock);
  if (!alive()) return;
  sfx.rock(); shake(0.3); FX.dust(new THREE.Vector3(tx, 0.2, 0.2));
  FX.burst(new THREE.Vector3(tx, 0.3, 0.2), { color: 0x8a90a6, count: 10, additive: false, speed: 4, size: 0.3, gravity: -12 });
  if (Math.abs(W.x - tx) < 1.15 && W.y < 1.0) hurtWeed(tx);
  await recover(alive, 1.1 / B.speed);
}

async function atkPounce(alive) {
  const B = S.B, boss = cast.kaibutsu, W = S.W;
  const dir = Math.sign(W.x - B.x) || -1; boss.face(dir);
  boss.play('Idle_2_HeadLow', { timeScale: 2 });
  const tell = (S.phase === 3 ? 1.4 : 0.6) / B.speed;
  // land so that the jaws come down on Weed (mouth is ~bossHalf*0.85 ahead of the body centre), max leap 3.4
  const mOff = dir * Math.abs(C.mouthWorld('kaibutsu').x - B.x);          // jaws ahead of the body centre
  const want = W.x - mOff * 0.55;   // lands with its forepaws over him
  const landX = clamp(B.x + dir * clamp((want - B.x) * dir, 1.2, 3.6), ARENA.min, ARENA.max);
  showWarn(landX + mOff, 2.4);
  await telegraph(alive, tell);
  if (!alive()) return;
  boss.play('Gallop_Jump', { loop: false, timeScale: 1.2 });
  const fromX = B.x, dur = 0.42; const t0 = E.time;
  while (alive() && E.time - t0 < dur) {
    const k = (E.time - t0) / dur;
    B.x = fromX + (landX - fromX) * k;
    boss.root.position.y = Math.sin(k * Math.PI) * 1.3;
    B.threatT = dur - (E.time - t0);
    await wait(1 / 60);
  }
  boss.root.position.y = 0; showWarn(0, 1, false); B.threatT = -1;
  if (!alive()) return;
  boss.play('Jump_ToIdle', { loop: false });
  shake(0.35); sfx.bossLand({}, { x: landX }); FX.dust(new THREE.Vector3(landX, 0.1, 0), true);
  const mouth = C.pawWorld('kaibutsu');
  if (Math.abs(W.x - mouth.x) < 1.4 && W.y < 0.8 && W.inv <= 0) {
    // the forepaw slams down on Weed's back (real contact), then he is flung aside
    await C.reach({ who: 'kaibutsu', target: 'weed', point: 'back', side: 'near', part: 'paw', t: 0.14, hold: 0.12, back: 0.35, fx: 'impact', strong: true, sfx: ['hitHeavy', 'bodyfall'], react: 'none' });
    hurtWeed(landX, { dir, dist: 2.6, toss: 6 });
  }
  await recover(alive, (S.phase === 3 ? 2.5 : 1.2) / B.speed);
}

// ---------------------------------------------------------------- update
function update(dt, dtr) {
  for (const d of Object.values(cast)) if (d.root.visible) d.update(dt);
  reticle.material.opacity = Math.max(0, reticle.material.opacity - dtr * (S.B.weakT > 0 ? 0.08 : 2));
  if (reticle.material.opacity > 0 && cast.kaibutsu.weak) { cast.kaibutsu.weak.getWorldPosition(reticle.position); reticle.material.rotation += dtr * 2; }
  if (!S.active) return;
  const W = S.W, B = S.B, w = cast.weed, boss = cast.kaibutsu;

  if (!S.cutscene && !S.paused && !S.special) {
    if (S.slowT > 0) { S.slowT -= dtr; E.timeScale = S.slowScale; } else E.timeScale = 1;
  }
  if (W.y > 0 || W.vy > 0) {
    W.vy -= 24 * dt; W.y += W.vy * dt;
    if (W.y <= 0) { W.y = 0; W.vy = 0; sfx.land({}, { x: W.x }); w.play('Jump_ToIdle', { loop: false }); setTimeout(() => { if (!W.busy && W.y <= 0) w.play('Idle'); }, 350); FX.dust(new THREE.Vector3(W.x, 0.1, 0)); }
  }
  W.x = clamp(W.x, ARENA.min, ARENA.max);
  if (!S.special && !S.cutscene) {
    w.root.position.x = W.x; w.root.position.y = W.y;
    if (!W.busy && !w._cxBusy) w.root.position.z += (0 - w.root.position.z) * Math.min(1, dt * 2.5);   // back to the lane (separation pushes him beside P4)
  }   // kohtauksissa Weed liikkuu kohtausaskelin
  if (!W.busy && W.y <= 0 && !S.special) w.face(Math.sign(B.x - W.x) || 1);
  if (W.inv > 0) { W.inv -= dt; w.model.visible = W.inv > 0.9 || Math.floor(W.inv * 14) % 2 === 0 || W.inv <= 0; }
  else w.model.visible = true;

  boss.root.position.x = B.x;
  if (B.weakT > 0) { B.weakT -= dt; if (B.weakT <= 0) tween(boss, { weakReveal: 0 }, 0.4); }

  for (const c of S.cards) {
    if (c.state === 'cooldown') { c.cool -= dt; if (c.cool <= 0) { c.state = 'ready'; c.cool = 0; sfx.cardReady(); } }
    UI.updateCard(c);
  }
  if (!S.cutscene && !S.special) {
    const mid = (W.x + B.x) / 2;
    const dist = Math.abs(W.x - B.x);
    const camD = clamp(7.6 + dist * 0.35, 8, 10.5);
    E.camPos.lerp(new THREE.Vector3(mid * 0.75, 2.4, camD), Math.min(1, dtr * 3));
    E.camLook.lerp(new THREE.Vector3(mid * 0.75, 1.6, 0), Math.min(1, dtr * 3));
  }
}

// ---------------------------------------------------------------- pause / quit
export function setPaused(p) {
  if (!S.active || S.cutscene || S.special) return;
  S.paused = p;
  E.timeScale = p ? 0 : 1;
  UI.show('pause', p);
  sfx[p ? 'uiOpen' : 'uiBack']();
}
export function quit() {
  S.active = false; S.paused = false; S.cutscene = false; S.special = false; S.B.token++; endAttackVisuals();
  E.timeScale = 1; E.skipping = false;
  UI.show('hud', false); UI.cine(false); UI.hint(''); UI.cutin(null); stopVoice();
  for (const id of ['pause', 'defeat', 'result']) UI.show(id, false);
  music(null); ambience(false);
  restoreLight();
}

// =====================================================================
//                          CUTSCENES (scene scripts)
// =====================================================================
let lightState = null;
function saveLight() { lightState = { rim: E.rimLight ? E.rimLight.intensity : 1, fog: E.scene.fog ? E.scene.fog.color.getHex() : 0, exp: E.renderer.toneMappingExposure }; }
function restoreLight() { if (!lightState) return; if (E.rimLight) E.rimLight.intensity = lightState.rim; if (E.scene.fog) E.scene.fog.color.setHex(lightState.fog); E.renderer.toneMappingExposure = lightState.exp; }

async function cutStart() {
  S.cutscene = true; S.B.token++; S.W.seq++; S.W.busy = false;
  endAttackVisuals();
  setInputEnabled(false);
  UI.show('hud', false); UI.hint('');
  UI.cine(true);
  E.timeScale = 1;
  if (!lightState) saveLight();
}
function cutEnd() {
  E.skipping = false; E.timeScale = 1; FX.speedLines(0);
  E.camRoll = 0; stopVoice();
}

const ctx = { cast, S, makeRock, E, FX, sfx, ARENA, bossHalf, contact: C, say, runSteps: (st) => runScene(st, ctx, { keepPins: true }), restoreLight: () => restoreLight() };

async function introCutscene() {
  await cutStart();
  const steps = SC.intro(ctx), night = SC.smith(ctx);
  preloadLines(SC.linesOf(steps).concat(SC.linesOf(night)));
  await runScene(steps, ctx);
  E.skipping = false;
  // canon: yöllä Gajōn sisällä North kaatuu ja Smith uhrautuu kivisortumassa; aamulla P4 nousee raunioista
  await runScene(night, ctx);
  cutEnd();
  for (const r of ctx.fallingRocks || []) E.scene.remove(r);
  cast.smith.root.visible = false;
  setupArena(1);
  UI.toast('Smith & North – in our memories', 2.2);
}

async function lockScene() {
  await cutStart();
  const steps = SC.lock(ctx);
  preloadLines(SC.linesOf(steps));
  await runScene(steps, ctx);
  cutEnd();
  setupArena(3);
  S.W.x = -3; S.B.x = 3.5;
  beginPhase(3);
}

async function fourArrows() {
  await cutStart();
  const steps = SC.arrows(ctx);
  preloadLines(SC.linesOf(steps));
  await runScene(steps, ctx);
  cutEnd();
  for (const id of MEN) cast[id].root.visible = false;
  cast.jerome.root.position.set(-5.6, 0, -2.6);
  S.W.x = -3; S.B.x = 3.5;
  beginPhase(2);
}

async function finale() {
  await cutStart();
  S.W.henki = 0; UI.setHenki(0);
  const fin = SC.finale(ctx);
  preloadLines(SC.linesOf(fin).concat(SC.linesOf(SC.post(ctx))));
  await runScene(fin, ctx, { keepPins: true });
  S.B.hp = 0; UI.setBossHP(0);
  E.skipping = false;
  await runScene(SC.post(ctx), ctx);
  cutEnd();
  restoreLight(); lightState = null;
  S.active = false; S.cutscene = false;
  ambience('dawn');               // aamunkoitto: linnut heräävät, joki
  music('dawn');
  showResult(['Smith', 'North', 'Robert', 'Rocker', 'Heuler']);
}

function showResult(names) {
  const stars = 1 + (S.W.hp >= 3 ? 1 : 0) + (S.defeats === 0 ? 1 : 0);
  UI.$('stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  UI.$('fallen').innerHTML = `Spirit of Ōu: ${stars}/3<br>Fallen comrades (permanent): <b>${names.join(', ')}</b><br><small>Sacrifices are permanent – they will not return in later levels.</small>`;
  try {
    localStorage.setItem('weed.memorial', JSON.stringify(names));
    localStorage.setItem('weed.cleared2', String(Math.max(stars, Number(localStorage.getItem('weed.cleared2') || 0))));
  } catch (_) {}
  UI.show('result', true);
  sfx.victory();
}

// test hooks (Playwright)
export const debug = {
  S,
  arrows: () => { if (S.phase === 1) { S.B.hp = 40; checkThresholds(); } },
  lockReady: () => { if (S.phase === 2) { S.B.hp = 20; checkThresholds(); } },
  lock: () => useCard('lock'),
  finale: () => { if (S.phase === 3) finale(); },
  fillHenki: () => addHenki(1),
  readyCards: () => S.cards.forEach(c => { if (c.state === 'cooldown') c.cool = 0; }),
  card: id => useCard(id),
  bite, dodge, jump, battoga,
  // contact-check (tools/contact-check.cjs): aja yksittäinen kohtaus; S.sceneDone = true kun valmis
  scene: async (name) => {
    S.sceneDone = false; C.LOG.scene = name;
    try {
      if (name === 'smith') {
        S.active = false;                       // kuten pelissä: yökohtaus ajetaan ennen taistelun alkua
        await cutStart(); setupArena(1);
        const st = SC.smith(ctx); preloadLines(SC.linesOf(st));
        await runScene(st, ctx); cutEnd();
        for (const r of ctx.fallingRocks || []) E.scene.remove(r);
        cast.smith.root.visible = false; setupArena(1); beginPhase(1);
      } else if (name === 'arrows') { S.phase = 1; S.pending = 'arrows'; await fourArrows(); }
      else if (name === 'lock') { S.phase = 2; await lockScene(); }
      else if (name === 'finale') { S.phase = 3; await finale(); }
      else if (name === 'twinfang' || name === 'jerome') {
        S.cards.forEach(c => { c.state = 'ready'; c.cool = 0; });
        useCard(name === 'twinfang' ? 'kenkage' : 'jerome');
        while (S.special) await wait(0.1, true);
      } else if (name === 'bite') {
        S.B.token++; S.B.x = 3.5; S.W.x = -1.5; await wait(0.3, true); await bite(); await wait(0.6, true);
        // P4's own attacks: charge (head-butt) and pounce (bite) on Weed
        const alive = () => S.active && !S.cutscene; S.W.inv = 0; S.W.hp = 99; S.W.x = -1.5; S.B.x = 3.5;
        await atkCharge(alive); await wait(1.2, true);
        S.W.inv = 0; S.W.hp = 99; S.W.y = 0; S.W.vy = 0; S.W.x = S.B.x + (S.W.x < S.B.x ? -3.2 : 3.2);
        await atkPounce(alive); await wait(1.2, true);
        // in-battle Battōga (phase 1–2): spinning fang to the shoulder
        S.B.token++; S.W.busy = false; S.W.henki = 1; S.W.y = 0; S.W.vy = 0; S.W.x = clamp(S.B.x - 3.6, ARENA.min, ARENA.max); await wait(0.4, true);
        await battoga(); await wait(0.8, true);
      }
    } catch (e) { console.error(e); }
    S.sceneDone = true;
  },
};
