// TASO 2 "Gajō – Kaibutsu": reaaliaikainen eleohjattu bossitaistelu + skriptatut cutscenet.
// Vaiheet: 1) taistelu -> panssari -> Smithin uhraus (kivivyöry)  2) taistelu -> "Neljä nuolta"
//          3) horjuva hirviö -> Weedin Battōga-viimeistely -> loppu + muistohetki.
import * as THREE from 'three';
import { E, tween, wait, shake } from './engine.js';
import { makeDog, gradientMap } from './dogs.js';
import * as FX from './fx.js';
import { sfx, music } from './audio.js';
import * as UI from './ui.js';
import { onGesture, setInputEnabled } from './input.js';

const ARENA = { min: -5.6, max: 5.6 };
const PHASE_HP = { 1: 100, 2: 45, 3: 8 };

export const cast = {};
const S = {
  active: false, cutscene: false, paused: false, phase: 1, defeats: 0,
  slowT: 0, slowScale: 1,
  W: { hp: 5, max: 5, x: -3, y: 0, vy: 0, inv: 0, busy: false, seq: 0, henki: 0 },
  B: { hp: 100, max: 100, x: 3.5, armored: false, weakT: 0, open: false, threatT: -1, token: 0, speed: 1, attacking: false, stagger: 0 },
  cards: [],
  pending: null,
  onExit: null,
};
window.__S = S;

// ---------- apurit ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function setSlow(scale, realSecs) { S.slowScale = scale; S.slowT = realSecs; }

let warnMat, warn, bang, rocks = [];
function makeProps() {
  warnMat = new THREE.MeshBasicMaterial({ color: 0xff3322, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  warn = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), warnMat);
  warn.rotation.x = -Math.PI / 2; warn.position.y = 0.03; E.scene.add(warn);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.font = '900 56px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ff4030';
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.strokeText('!', 32, 54); g.fillText('!', 32, 54);
  bang = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  bang.scale.setScalar(0.9); bang.visible = false; E.scene.add(bang);
}
function showWarn(x, w, on = true) { warn.position.x = x; warn.scale.set(w, 1.6, 1); warnMat.opacity = on ? 0.35 : 0; }

const rockMat = new THREE.MeshToonMaterial({ color: 0x59617a, gradientMap });
function makeRock(r = 0.45) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
  const ol = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: 0x0b0a10, side: THREE.BackSide }));
  ol.scale.setScalar(1.08); m.add(ol);
  E.scene.add(m); return m;
}

// ---------- hahmot ----------
export function createCast() {
  for (const id of ['weed', 'jerome', 'smith', 'ken', 'kagetora', 'robert', 'rocker', 'heuler', 'kaibutsu', 'gin']) {
    const d = makeDog(id); cast[id] = d; E.scene.add(d.root);
    d.root.visible = false;
  }
  makeProps();
  E.updaters.add(update);
  onGesture(handleGesture);
}

function place(id, x, z = 0, face = 1, anim = 'Idle') {
  const d = cast[id]; d.root.visible = true; d.fade(1);
  d.root.position.set(x, 0, z); d.face(face, true); d.spin.rotation.set(0, 0, 0);
  d.play(anim); return d;
}

// ---------- kortit ----------
function cardDefs() {
  return [
    { id: 'jerome', name: 'Jerome', desc: 'Paljastaa heikon kohdan', color: '#a9733a', color2: '#e0b070', cooldown: 15, cool: 4, state: 'cooldown' },
    { id: 'kenkage', name: 'Ken & Kagetora', desc: 'Yhteisisku', color: '#585c66', color2: '#8a6a55', cooldown: 20, cool: 9, state: 'cooldown' },
    { id: 'smith', name: 'Smith', desc: 'Odottaa hetkeään', color: '#85817a', color2: '#d6d0c6', cooldown: 1, cool: 0, state: 'locked' },
  ];
}

function useCard(id) {
  if (!S.active || S.cutscene || S.paused) return;
  const c = S.cards.find(k => k.id === id);
  if (!c) return;
  if (c.state === 'sacrifice') { c.state = 'fallen'; UI.updateCard(c); smithSacrifice(); return; }
  if (c.state !== 'ready') { sfx.tell(); return; }
  if (S.phase === 3) { UI.toast('Nyt on Weedin vuoro!'); return; }
  sfx.card();
  c.state = 'cooldown'; c.cool = c.cooldown;
  if (id === 'jerome') jeromeReveal();
  if (id === 'kenkage') kenKageStrike();
}

async function jeromeReveal() {
  const j = cast.jerome, B = S.B, boss = cast.kaibutsu;
  const home = j.x;
  j.play('Gallop', { timeScale: 1.2 }); j.face(1);
  await tween(j.root.position, { x: clamp(B.x - 3, ARENA.min, ARENA.max), z: -1 }, 0.5, { ease: 'out' });
  j.play('Idle'); sfx.bark();
  UI.toast('Jerome: "Vasen kylki – nyt!"', 1.4);
  B.weakT = 8;
  tween(boss, { weakReveal: 1 }, 0.3);
  const p = boss.weak.getWorldPosition(new THREE.Vector3());
  FX.ring(p, 0xffaa55, 2.5, 0.6); FX.burst(p, { color: 0xffb070, count: 20 });
  await wait(0.7);
  j.play('Gallop'); j.face(-1);
  await tween(j.root.position, { x: home, z: -2.6 }, 0.6, { ease: 'inOut' });
  j.face(1); j.play('Idle');
}

async function kenKageStrike() {
  const k = cast.ken, g = cast.kagetora, B = S.B;
  const homes = [k.x, g.x];
  UI.toast('Ken & Kagetora!', 1.2);
  for (const d of [k, g]) { d.play('Gallop', { timeScale: 1.3 }); d.face(Math.sign(B.x - d.x) || 1); }
  const dir = Math.sign(B.x - S.W.x) || 1;
  await Promise.all([
    tween(k.root.position, { x: B.x - dir * 2.4, z: 0.6 }, 0.55, { ease: 'in' }),
    tween(g.root.position, { x: B.x - dir * 2.0, z: -0.6 }, 0.5, { ease: 'in' }),
  ]);
  k.play('Gallop_Jump', { loop: false }); g.play('Gallop_Jump', { loop: false });
  await Promise.all([
    tween(k.root.position, { x: B.x - dir * 1.2, y: 1.2 }, 0.25, { ease: 'out' }),
    tween(g.root.position, { x: B.x - dir * 0.9, y: 0.9 }, 0.25, { ease: 'out' }),
  ]);
  sfx.bite(); sfx.hit();
  damageBoss(7, null, { stagger: 1.6 });
  await Promise.all([tween(k.root.position, { y: 0 }, 0.2), tween(g.root.position, { y: 0 }, 0.2)]);
  for (const d of [k, g]) { d.play('Gallop'); d.face(-dir); }
  await Promise.all([
    tween(k.root.position, { x: homes[0], z: -2.8 }, 0.8),
    tween(g.root.position, { x: homes[1], z: -2.4 }, 0.8),
  ]);
  for (const d of [k, g]) { d.face(1); d.play('Idle'); }
}

// ---------- taistelun käynnistys ----------
export async function startLevel({ phase = 1, intro = true, onExit } = {}) {
  S.onExit = onExit;
  S.defeats = 0;
  S.cards = cardDefs();
  UI.buildCards(S.cards, useCard);
  if (phase >= 2) { const sm = S.cards.find(c => c.id === 'smith'); sm.state = 'fallen'; }
  setupArena(phase);
  if (intro && phase === 1) await introCutscene();
  beginPhase(phase);
}

function setupArena(phase) {
  for (const d of Object.values(cast)) d.root.visible = false;
  S.W.x = -3; S.W.y = 0; S.W.vy = 0; S.W.busy = false; S.W.seq++; S.W.inv = 0;
  place('weed', S.W.x, 0, 1);
  S.B.x = 3.5; place('kaibutsu', S.B.x, 0, -1);
  cast.kaibutsu.weakReveal = 0;
  place('jerome', -5.2, -2.6, 1);
  place('ken', -6.6, -2.8, 1);
  place('kagetora', -4.1, -2.4, 1);
  if (phase === 1) place('smith', -7.6, -3.2, 1, 'Idle_2');
  E.camPos.set(0, 2.4, 9); E.camLook.set(0, 1.4, 0);
}

function beginPhase(p) {
  S.phase = p;
  const B = S.B, W = S.W;
  B.hp = PHASE_HP[p]; B.armored = false; B.weakT = 0; B.open = false; B.stagger = 0; B.attacking = false;
  B.speed = p === 1 ? 1 : p === 2 ? 1.22 : 0.6;
  W.hp = W.max; W.inv = 1;
  if (p === 3) W.henki = 1;
  S.phaseStart = p;
  S.active = true; S.cutscene = false; S.pending = null;
  UI.cine(false); UI.show('hud', true);
  UI.setHearts(W.hp, W.max); UI.setBossHP(B.hp / B.max); UI.setHenki(W.henki);
  for (const c of S.cards) UI.updateCard(c);
  setInputEnabled(true);
  music('battle');
  if (p === 1) UI.hint('Napauta = purenta &nbsp;•&nbsp; Pyyhkäise ←/→ = väistö &nbsp;•&nbsp; Pyyhkäise ↑ = hyppy', 6);
  if (p === 2) UI.hint('Kaibutsu on raivoissaan ja nopeampi. Käytä Jeromea ja iske kylkeen!', 4);
  if (p === 3) UI.hint('Kaibutsu horjuu! Piirrä kaari ⟳ – <b>BATTŌGA!</b>');
  B.token++;
  bossBrain(B.token);
}

// ---------- syöte ----------
function handleGesture(g) {
  if (!S.active || S.cutscene || S.paused) return;
  const W = S.W;
  if (g.type === 'tap') bite();
  else if (g.type === 'swipe') {
    if (g.dir === 'up') jump();
    else if (g.dir === 'left') dodge(-1);
    else if (g.dir === 'right') dodge(1);
  } else if (g.type === 'arc') {
    if (W.henki >= 1) battoga();
    else { UI.toast('Henki ei ole vielä täynnä', 1); bite(); }
  }
}

function checkPerfect() {
  const t = S.B.threatT;
  if (t > 0 && t < 0.32) {
    setSlow(0.25, 0.7); sfx.perfect();
    UI.toast('Täydellinen väistö!');
    addHenki(0.25);
    FX.ring(cast.weed.root.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x9fd0ff, 2.5, 0.5);
  }
}

function addHenki(v) {
  const W = S.W; const was = W.henki;
  W.henki = Math.min(1, W.henki + v); UI.setHenki(W.henki);
  if (was < 1 && W.henki >= 1) { UI.hint('Henki täynnä! Piirrä kaari ⟳ = Battōga', 3); sfx.howl(); }
}

async function bite() {
  const W = S.W, B = S.B, w = cast.weed;
  if (W.busy || W.y > 0.05) return;
  W.busy = true; const seq = ++W.seq;
  const dir = Math.sign(B.x - W.x) || 1;
  w.face(dir);
  const reach = 1.55;
  const target = B.x - dir * reach;
  w.play('Gallop', { timeScale: 1.6 });
  await tween(W, { x: target }, clamp(Math.abs(target - W.x) / 14, 0.08, 0.3), { ease: 'in' });
  if (seq !== W.seq) return;
  w.play('Attack', { loop: false, timeScale: 1.8, fade: 0.06 });
  await wait(0.18);
  if (seq !== W.seq) return;
  sfx.bite();
  const hitPos = new THREE.Vector3(B.x - dir * 0.6, 1.1, 0.4);
  damageBoss(4, hitPos);
  addHenki(0.1);
  await wait(0.18);
  if (seq !== W.seq) return;
  w.play('Gallop', { timeScale: 1.6 });
  await tween(W, { x: clamp(W.x - dir * 2.2, ARENA.min, ARENA.max) }, 0.22, { ease: 'out' });
  if (seq !== W.seq) return;
  w.play('Idle'); W.busy = false;
}

async function dodge(dir) {
  const W = S.W, w = cast.weed;
  if (W.y > 0.05) return;
  const seq = ++W.seq; W.busy = true;
  checkPerfect();
  W.inv = Math.max(W.inv, 0.32);
  sfx.whoosh();
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
  sfx.whoosh();
  w.play('Gallop_Jump', { loop: false, timeScale: 1.1 });
}

async function battoga() {
  const W = S.W, B = S.B, w = cast.weed;
  if (W.busy && S.phase !== 3) return;
  if (S.phase === 3) { finale(); return; }
  W.henki = 0; UI.setHenki(0);
  W.busy = true; const seq = ++W.seq; W.inv = 2;
  const dir = Math.sign(B.x - W.x) || 1; w.face(dir);
  sfx.battoga(); setSlow(0.3, 0.9); FX.speedLines(1);
  UI.toast('BATTŌGA!', 1);
  w.play('Gallop_Jump', { loop: false });
  const startX = W.x;
  tween(w.spin.rotation, { z: -dir * Math.PI * 4 }, 0.55, { ease: 'inOut' });
  FX.slashArc(new THREE.Vector3(W.x, 1.2, 0.3), 0xbfe4ff, 1.2, 0.6);
  await tween(W, { x: B.x - dir * 0.8, y: 1.8 }, 0.5, { ease: 'inOut', onUpdate: () => {} });
  if (seq !== W.seq) { w.spin.rotation.z = 0; return; }
  FX.speedLines(0);
  const p = new THREE.Vector3(B.x, 1.4, 0.5);
  FX.flash('#dff0ff', 0.3, 0.8); sfx.boom();
  damageBoss(16, p, { strong: true, stagger: 1.2, battoga: true });
  w.spin.rotation.z = 0;
  await tween(W, { x: clamp(startX, ARENA.min, ARENA.max), y: 0 }, 0.45, { ease: 'out' });
  if (seq !== W.seq) return;
  w.play('Idle'); W.busy = false;
}

// ---------- vahinko ----------
function damageBoss(amount, pos, o = {}) {
  const B = S.B, boss = cast.kaibutsu;
  const p = pos || new THREE.Vector3(B.x, 1.3, 0.5);
  if (B.armored && !o.force) {
    FX.burst(p, { color: 0x9aa3b8, count: 8, speed: 3 });
    UI.toast('Ei tehoa! Nahka on kuin kiveä', 1.1);
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
  boss.setTint(0xffffff, 0.8); setTimeout(() => boss.setTint(0x000000, 0), 70);
  if (B.open && !o.battoga) UI.toast(B.weakT > 0 ? 'Heikko kohta + avautuminen!' : 'Avautuminen!', 0.7);
  else if (B.weakT > 0 && !o.battoga) UI.toast('Heikko kohta!', 0.6);
  if (o.stagger) { B.stagger = o.stagger; B.token++; endAttackVisuals(); bossBrain(B.token); }
  else if (!B.attacking) boss.play('Idle_HitReact1', { loop: false, fade: 0.05 });
  setSlow(0.05, o.strong ? 0.12 : 0.05);
  if (navigator.vibrate) try { navigator.vibrate(o.strong ? 60 : 20); } catch (_) {}
  checkThresholds();
  return d;
}

function checkThresholds() {
  const B = S.B;
  if (S.phase === 1 && B.hp <= 60 && !B.armored) {
    B.hp = 60; B.armored = true; UI.setBossHP(B.hp / B.max, true);
    const sm = S.cards.find(c => c.id === 'smith'); sm.state = 'sacrifice'; UI.updateCard(sm);
    sfx.roar(); shake(0.4);
    UI.hint('Raivo kovettaa nahan! <b>Napauta Smithin korttia.</b>');
    cast.smith.play('Idle'); cast.smith.earPerk = 1;
  }
  if (S.phase === 2 && B.hp <= 22 && !S.pending) { S.pending = 'arrows'; fourArrows(); }
}

function hurtWeed(fromX) {
  const W = S.W, w = cast.weed;
  if (W.inv > 0) return;
  W.hp -= 1; W.inv = 1.3; W.seq++; W.busy = false;
  UI.setHearts(W.hp, W.max);
  sfx.hurt(); shake(0.35); FX.flash('#ff2040', 0.35, 0.35);
  if (navigator.vibrate) try { navigator.vibrate(120); } catch (_) {}
  const dir = Math.sign(W.x - fromX) || -1;
  tween(W, { x: clamp(W.x + dir * 1.8, ARENA.min, ARENA.max) }, 0.3, { ease: 'out' });
  w.play('Idle_HitReact2', { loop: false, fade: 0.05 });
  setTimeout(() => { if (!W.busy && W.y <= 0.01) w.play('Idle'); }, 500);
  if (W.hp <= 0) defeat();
}

async function defeat() {
  S.active = false; S.B.token++; endAttackVisuals();
  setInputEnabled(false);
  cast.weed.play('Death', { loop: false });
  S.defeats++;
  music(null);
  await wait(1.4, true);
  UI.show('hud', false);
  UI.show('defeat', true);
}
export function retryPhase() {
  UI.show('defeat', false);
  setupArena(S.phase);
  if (S.phase >= 2) { cast.smith.root.visible = false; }
  S.W.henki = 0;
  beginPhase(S.phase);
}

// ---------- bossin tekoäly ----------
function endAttackVisuals() {
  showWarn(0, 1, false); bang.visible = false; S.B.threatT = -1; S.B.attacking = false; S.B.open = false;
  cast.kaibutsu.setTint(0x000000, 0);
  for (const r of rocks) E.scene.remove(r); rocks = [];
}

async function bossBrain(token) {
  const B = S.B, boss = cast.kaibutsu;
  const alive = () => token === B.token && S.active && !S.cutscene;
  if (B.stagger > 0) {
    boss.play('Idle_HitReact2', { loop: false });
    await wait(B.stagger);
    B.stagger = 0;
    if (!alive()) return;
  }
  let last = '';
  while (alive()) {
    // asemoidu: pidä etäisyys Weediin
    boss.play('Walk', { timeScale: 0.9 * B.speed });
    const t0 = E.time;
    while (alive() && E.time - t0 < (S.phase === 3 ? 2.2 : 1.1 / B.speed)) {
      const want = clamp(S.W.x + (B.x >= S.W.x ? 3.4 : -3.4), ARENA.min + 0.5, ARENA.max - 0.5);
      const dx = want - B.x;
      boss.face(Math.sign(S.W.x - B.x) || -1);
      B.x += clamp(dx, -1, 1) * 1.6 * B.speed * (1 / 60) * (E.timeScale > 0 ? 1 : 0);
      await wait(1 / 60);
    }
    if (!alive()) return;
    const dist = Math.abs(S.W.x - B.x);
    let pick;
    if (S.phase === 3) pick = 'pounce';
    else if (dist < 3.2 && last !== 'pounce') pick = 'pounce';
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
    bang.position.set(B.x, boss.height + 0.9 + Math.sin(k * 20) * 0.05, 0.5);
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
  boss.play('Eating', { timeScale: 1.4 }); // pää alas: valmistautuu syöksyyn
  const endX = dir > 0 ? ARENA.max + 0.3 : ARENA.min - 0.3;
  showWarn((B.x + endX) / 2, Math.abs(endX - B.x) + 2);
  await telegraph(alive, 0.95 / B.speed);
  if (!alive()) return;
  boss.play('Gallop', { timeScale: 1.3 });
  sfx.roar();
  const speed = 12 * B.speed;
  let hit = false;
  while (alive() && Math.sign(endX - B.x) === dir) {
    const step = speed * Math.min(E.timeScale > 0 ? 1 / 60 : 0, 1);
    B.x += dir * step;
    const ahead = (W.x - B.x) * dir;
    B.threatT = ahead > 0 ? ahead / speed : -1;
    if (!hit && Math.abs(W.x - B.x) < 1.5 && W.y < 0.9 && W.inv <= 0) { hit = true; hurtWeed(B.x); }
    if (Math.random() < 0.3) FX.dust(new THREE.Vector3(B.x - dir, 0.1, 0));
    await wait(1 / 60);
  }
  showWarn(0, 1, false); B.threatT = -1;
  if (!alive()) return;
  shake(0.3); sfx.rock();
  await recover(alive, 1.5 / B.speed);
}

async function atkRock(alive) {
  const B = S.B, boss = cast.kaibutsu, W = S.W;
  boss.face(Math.sign(W.x - B.x) || -1);
  const rock = makeRock(0.5); rocks.push(rock);
  boss.play('Attack', { loop: false, timeScale: 0.6 });
  const t0 = E.time; const tell = 0.85 / B.speed;
  sfx.tell(); bang.visible = true;
  while (alive() && E.time - t0 < tell) {
    rock.position.set(B.x + boss.facing * 0.8, boss.height + 0.6, 0.2);
    rock.rotation.x += 0.1;
    showWarn(W.x, 1.8);
    bang.position.set(B.x, boss.height + 1.4, 0.5);
    await wait(1 / 60);
  }
  bang.visible = false;
  if (!alive()) return;
  const tx = W.x, from = rock.position.clone(), flight = 0.95 / B.speed;
  sfx.whoosh();
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
  const landX = clamp(B.x + dir * 2.9, ARENA.min, ARENA.max);
  showWarn(landX, 3);
  await telegraph(alive, tell);
  if (!alive()) return;
  boss.play('Gallop_Jump', { loop: false, timeScale: 1.2 });
  const fromX = B.x, dur = 0.42; const t0 = E.time;
  while (alive() && E.time - t0 < dur) {
    const k = (E.time - t0) / dur;
    B.x = fromX + (landX - fromX) * k;
    cast.kaibutsu.root.position.y = Math.sin(k * Math.PI) * 1.3;
    B.threatT = dur - (E.time - t0);
    await wait(1 / 60);
  }
  cast.kaibutsu.root.position.y = 0; showWarn(0, 1, false); B.threatT = -1;
  if (!alive()) return;
  shake(0.35); sfx.rock(); FX.dust(new THREE.Vector3(landX, 0.1, 0), true);
  if (Math.abs(W.x - landX) < 1.7 && W.y < 0.8) hurtWeed(landX);
  await recover(alive, (S.phase === 3 ? 2.5 : 1.2) / B.speed);
}

// ---------- päivitys ----------
function update(dt, dtr) {
  for (const d of Object.values(cast)) if (d.root.visible) d.update(dt);
  if (!S.active) return;
  const W = S.W, B = S.B, w = cast.weed, boss = cast.kaibutsu;

  // slow-mo hallinta (ei cutscenen aikana)
  if (!S.cutscene && !S.paused) {
    if (S.slowT > 0) { S.slowT -= dtr; E.timeScale = S.slowScale; } else E.timeScale = 1;
  }
  // Weed: painovoima ja sijainti
  if (W.y > 0 || W.vy > 0) {
    W.vy -= 24 * dt; W.y += W.vy * dt;
    if (W.y <= 0) { W.y = 0; W.vy = 0; w.play('Idle'); FX.dust(new THREE.Vector3(W.x, 0.1, 0)); }
  }
  W.x = clamp(W.x, ARENA.min, ARENA.max);
  w.root.position.x = W.x; w.root.position.y = W.y;
  if (!W.busy && W.y <= 0) w.face(Math.sign(B.x - W.x) || 1);
  if (W.inv > 0) { W.inv -= dt; w.model.visible = W.inv > 0.9 || Math.floor(W.inv * 14) % 2 === 0 || W.inv <= 0; }
  else w.model.visible = true;

  boss.root.position.x = B.x;
  if (B.weakT > 0) { B.weakT -= dt; if (B.weakT <= 0) tween(boss, { weakReveal: 0 }, 0.4); }

  // kortit
  for (const c of S.cards) {
    if (c.state === 'cooldown') { c.cool -= dt; if (c.cool <= 0) { c.state = 'ready'; c.cool = 0; } }
    UI.updateCard(c);
  }
  // kamera seuraa
  if (!S.cutscene) {
    const mid = (W.x + B.x) / 2;
    const dist = Math.abs(W.x - B.x);
    const camD = clamp(7.2 + dist * 0.35, 7.5, 10);
    E.camPos.lerp(new THREE.Vector3(mid * 0.75, 2.3, camD), Math.min(1, dtr * 3));
    E.camLook.lerp(new THREE.Vector3(mid * 0.75, 1.55, 0), Math.min(1, dtr * 3));
  }
}

// ---------- tauko ----------
export function setPaused(p) {
  if (!S.active || S.cutscene) return;
  S.paused = p;
  E.timeScale = p ? 0 : 1;
  UI.show('pause', p);
}
export function quit() {
  S.active = false; S.paused = false; S.cutscene = false; S.B.token++; endAttackVisuals();
  E.timeScale = 1; E.skipping = false;
  UI.show('hud', false); UI.cine(false); UI.hint('');
  for (const id of ['pause', 'defeat', 'result']) UI.show(id, false);
  music(null);
}

// =====================================================================
//                              CUTSCENET
// =====================================================================
async function cutStart() {
  S.cutscene = true; S.B.token++; S.W.seq++; S.W.busy = false;
  endAttackVisuals();
  setInputEnabled(false);
  UI.show('hud', false); UI.hint('');
  UI.cine(true);
  E.timeScale = 1;
}
function cutEnd() {
  E.skipping = false; E.timeScale = 1; FX.speedLines(0);
  E.camRoll = 0;
}
const cam = (pos, look, dur, ease = 'inOut') => Promise.all([
  tween(E.camPos, { x: pos[0], y: pos[1], z: pos[2] }, dur, { ease, real: true }),
  tween(E.camLook, { x: look[0], y: look[1], z: look[2] }, dur, { ease, real: true }),
]);
const camSet = (pos, look) => { E.camPos.set(...pos); E.camLook.set(...look); };

// --- Intro ---
async function introCutscene() {
  await cutStart();
  music('calm');
  const boss = cast.kaibutsu, w = cast.weed;
  boss.root.visible = false;
  camSet([-6, 9, 22], [-18, 22, -100]);
  UI.caption('<b>TASO 2</b>Gajō – Kaibutsu', 3.2);
  await cam([0, 3.2, 13], [2, 2.5, 0], 4.2);
  UI.caption('Futago-sola, Ōu. Ōun koirien linnake on joutunut hirviön valtaan.', 3.6);
  await wait(3.6, true);
  // Kaibutsu saapuu
  boss.root.visible = true; S.B.x = 11; boss.root.position.x = 11; boss.face(-1, true);
  boss.play('Walk', { timeScale: 0.8 });
  camSet([6.5, 0.9, 6.5], [4.5, 2.4, 0]);
  await tween(S.B, { x: 3.5 }, 3, { ease: 'out', real: true, onUpdate: () => { boss.root.position.x = S.B.x; } });
  boss.play('Attack', { loop: false, timeScale: 0.7 });
  sfx.roar(); shake(0.5);
  FX.ring(new THREE.Vector3(3.5, 2.2, 0.5), 0xffa060, 5, 0.9);
  await wait(1.6, true);
  boss.play('Idle');
  camSet([-4.4, 1.3, 4.6], [-4.8, 0.9, -1.5]);
  await UI.say('Jerome', 'Tuo on laboratoriosta karannut koe. Ihmiset luulevat, että sen teot ovat meidän tekojamme.');
  camSet([-1.6, 0.9, 3.6], [-3, 0.6, 0]);
  w.play('Walk'); tween(S.W, { x: -2.4 }, 1.2, { real: true, onUpdate: () => { w.root.position.x = S.W.x; } });
  w.earPerk = 1;
  await UI.say('Weed', 'Tämä on isäni maa. Emme anna sen tuhota sitä!');
  w.play('Idle');
  await UI.say('Jerome', 'Sen vasemmassa kyljessä on karvaton kohta. Kun hetki tulee, näytän sen sinulle.');
  camSet([-6.4, 1.2, 3.2], [-7.4, 0.6, -3]);
  await UI.say('Smith', 'Pidä pää kylmänä, poika. Me olemme kanssasi.');
  await cam([0, 2.4, 9], [0, 1.4, 0], 1.2);
  w.earPerk = 0;
  cutEnd();
  S.W.x = -3; w.root.position.x = -3; S.B.x = 3.5;
}

// --- Smithin uhraus ---
async function smithSacrifice() {
  await cutStart();
  music(null);
  const sm = cast.smith, boss = cast.kaibutsu, w = cast.weed, B = S.B;
  // asetelma: hirviö kallion alle oikealle
  S.W.x = -2.5; w.root.position.set(-2.5, 0, 0); w.face(1, true); w.play('Idle');
  B.x = 4.2; boss.root.position.set(4.2, 0, 0); boss.face(-1, true); boss.play('Idle');
  sm.root.position.set(-5.5, 0, -1.2); sm.face(1, true); sm.play('Idle');
  camSet([-5.2, 1.0, 2.2], [-5.6, 0.7, -1.2]);
  await UI.say('Smith', 'Weed… näetkö kallion tuolla yllä? Minä hoidan tämän.');
  camSet([-2.0, 0.8, 2.4], [-2.5, 0.6, 0]);
  w.earPerk = 1;
  await UI.say('Weed', 'Smith, odota!');
  // Smith juoksee kolmella jalalla
  camSet([0, 2.0, 8], [1, 1.4, 0]);
  sm.play('Gallop', { timeScale: 1.1 });
  await tween(sm.root.position, { x: 2.2, z: 0 }, 1.3, { ease: 'in', real: true });
  sm.play('Gallop_Jump', { loop: false });
  sfx.bark();
  await tween(sm.root.position, { x: B.x - 0.3, y: boss.height * 0.78 }, 0.45, { ease: 'out', real: true });
  sm.play('Attack', { timeScale: 1.4 });
  sfx.bite(); boss.play('Idle_HitReact2', { timeScale: 0.8 });
  FX.impact(new THREE.Vector3(B.x, boss.height * 0.8, 0.4));
  // hirviö horjuu kallion alle
  await Promise.all([
    tween(B, { x: 7 }, 1.6, { real: true, onUpdate: () => { boss.root.position.x = B.x; sm.root.position.x = B.x - 0.3; } }),
    cam([3.0, 2.6, 10.5], [5.8, 2.6, -1], 1.6),
  ]);
  await UI.say('Smith', 'Elä, Weed. Elä ja johda heitä!', 2.6);
  sfx.howl();
  // kivivyöry
  sfx.rumble(3); shake(0.6);
  const falling = [];
  for (let i = 0; i < 18; i++) {
    const r = makeRock(0.5 + Math.random() * 0.9);
    r.position.set(5 + Math.random() * 4.5, 9 + Math.random() * 8, -1 + Math.random() * 2);
    falling.push({ r, v: -Math.random() * 3, s: (Math.random() - 0.5) * 6 });
  }
  E.cliff.children.slice(3).forEach(b => tween(b.position, { y: b.position.y - 3.5 }, 1.2, { real: true, ease: 'in' }));
  const t0 = E.realTime;
  E.timeScale = 0.55;
  while (E.realTime - t0 < 2.2 && !E.skipping) {
    for (const f of falling) {
      f.v -= 22 * 0.016; f.r.position.y = Math.max(0.3 + Math.random() * 0.02, f.r.position.y + f.v * 0.016);
      f.r.rotation.x += f.s * 0.016;
      if (f.r.position.y < 0.4 && !f.landed) { f.landed = true; FX.dust(f.r.position.clone(), true); sfx.rock(); }
    }
    await wait(0.016, true);
  }
  for (const f of falling) { f.r.position.y = 0.3 + Math.random() * 1.6; }
  FX.flash('#e8eeff', 1.2, 1);
  sm.root.visible = false;
  boss.root.visible = false;
  E.timeScale = 1;
  shake(0.8);
  await wait(1.2, true);
  // hiljaisuus
  music('sad');
  camSet([3.6, 1.0, 6.5], [6.5, 1.0, 0]);
  await UI.say('Weed', 'SMITH!!', 2.2);
  FX.spiritLight(new THREE.Vector3(6.6, 1.6, 0.6), 0xcfe4ff, 5);
  await cam([4.2, 1.6, 7.5], [6.5, 2.4, 0], 3);
  UI.caption('Smith', 2.4);
  await wait(2.6, true);
  // hirviö nousee kivien alta
  sfx.rumble(1.5); shake(0.5);
  await wait(1.0, true);
  boss.root.visible = true; B.x = 6.5; boss.root.position.set(6.5, -2, 0);
  boss.play('Jump_ToIdle', { loop: false });
  sfx.roar(); shake(0.9); FX.flash('#ff8050', 0.4, 0.4);
  tween(boss.root.position, { y: 0 }, 0.6, { ease: 'out', real: true });
  for (const f of falling) {
    const dx = f.r.position.x - 6.5;
    tween(f.r.position, { x: f.r.position.x + dx * 3, y: f.r.position.y + 2 + Math.random() * 3, z: f.r.position.z + 2 }, 0.6, { real: true, ease: 'out' })
      .then(() => tween(f.r.scale, { x: 0.01, y: 0.01, z: 0.01 }, 0.6, { real: true }));
  }
  FX.dust(new THREE.Vector3(6.5, 0.5, 0), true);
  boss.eyes.material.color.set(0xff3010); boss.eyes.scale.setScalar(0.75);
  await wait(1.2, true);
  camSet([-3.8, 1.2, 3.6], [-4.8, 0.9, -1.5]);
  cast.jerome.root.position.set(-4.6, 0, -1.5);
  await UI.say('Jerome', 'Se nousee yhä… mutta se on haavoittunut. Smithin uhraus ei ollut turha.');
  for (const f of falling) E.scene.remove(f.r);
  await cam([0, 2.4, 9], [0, 1.4, 0], 1);
  cutEnd();
  cast.jerome.root.position.set(-5.2, 0, -2.6);
  B.x = 3.5; S.W.x = -3; w.earPerk = 0;
  UI.toast('Smith – muistoissa', 2);
  beginPhase(2);
}

// --- Neljä nuolta ---
async function fourArrows() {
  await cutStart();
  const B = S.B, boss = cast.kaibutsu, j = cast.jerome, w = cast.weed;
  const men = [cast.robert, cast.rocker, cast.heuler];
  B.x = 3.2; boss.root.position.set(3.2, 0, 0); boss.face(-1, true); boss.play('Idle_2_HeadLow');
  S.W.x = -1.5; w.root.position.set(-1.5, 0, 1); w.face(1, true); w.play('Idle');
  j.root.position.set(-3.6, 0, 0); j.face(1, true); j.play('Idle');
  men.forEach((m, i) => { m.root.visible = true; m.fade(1); m.root.position.set(-12 - i * 1.5, 0, -0.8 + i * 0.8); m.face(1, true); m.play('Gallop', { timeScale: 1.2 }); });
  camSet([-5, 1.3, 5.5], [-5, 0.8, 0]);
  music('sad');
  await Promise.all(men.map((m, i) => tween(m.root.position, { x: -6.2 + i * 0.9 }, 1.4 + i * 0.15, { ease: 'out', real: true })));
  men.forEach(m => m.play('Idle'));
  UI.caption('<b>NELJÄ NUOLTA</b>', 2.4);
  await wait(2.2, true);
  await UI.say('Jerome', 'Robert, Rocker, Heuler. Haavaan, yksi kerrallaan. Neljä nuolta – yksi kohde.');
  camSet([-4.6, 0.9, 3.4], [-5.6, 0.6, 0]);
  await UI.say('Heuler', 'Ei kuolla vielä, Robert. Lähdetään kaikki yhdessä.');
  boss.weakReveal = 1;
  const fallenAt = [];
  for (let i = 0; i < men.length; i++) {
    const m = men[i];
    camSet([0.5, 1.6, 7.5], [1.2, 1.4, 0]);
    m.root.position.z = 0;
    m.play('Gallop', { timeScale: 1.4 }); sfx.bark();
    await tween(m.root.position, { x: B.x - 2.4 }, 0.55, { ease: 'in', real: true });
    E.timeScale = 0.3; FX.speedLines(0.6);
    m.play('Gallop_Jump', { loop: false });
    await tween(m.root.position, { x: B.x - 0.9, y: 1.6 }, 0.3, { ease: 'out' });
    const hp = boss.weak.getWorldPosition(new THREE.Vector3());
    FX.impact(hp, true); FX.burst(hp, { color: 0xffb070, count: 26, speed: 6 });
    FX.flash('#fff2d0', 0.3, 0.6); sfx.hit();
    boss.play('Idle_HitReact1', { loop: false });
    B.hp = Math.max(9, B.hp - 4); UI.setBossHP(B.hp / B.max);
    E.timeScale = 1; FX.speedLines(0);
    await wait(0.15, true);
    // hirviö sinkoaa toverin
    boss.play('Attack', { loop: false, timeScale: 1.5 });
    m.play('Idle_HitReact2', { loop: false });
    const landX = -0.6 - i * 1.2;
    await tween(m.root.position, { x: landX, y: 0, z: -1.8 + i * 0.3 }, 0.5, { ease: 'out', real: true });
    m.play('Death', { loop: false, timeScale: 0.7 });
    fallenAt.push(m.root.position.clone());
    camSet([landX + 0.8, 0.7, 1.6], [landX, 0.35, -1.8 + i * 0.3]);
    await UI.say(m.name, ['Kapteeni… oli kunnia.', 'Jatka… ilman meitä.', 'Me lähdimme… yhdessä.'][i], 2.2);
  }
  // Jerome – neljäs nuoli
  camSet([-0.8, 1.2, 6.5], [0.8, 1.2, 0]);
  await UI.say('Jerome', 'Minä olen neljäs!', 1.6);
  j.play('Gallop', { timeScale: 1.5 });
  await tween(j.root.position, { x: B.x - 2.4 }, 0.5, { ease: 'in', real: true });
  E.timeScale = 0.25; FX.speedLines(1);
  j.play('Gallop_Jump', { loop: false });
  await tween(j.root.position, { x: B.x - 0.9, y: 1.7 }, 0.3, { ease: 'out' });
  const hp = boss.weak.getWorldPosition(new THREE.Vector3());
  FX.impact(hp, true); FX.flash('#fff', 0.5, 0.9); sfx.boom(); shake(0.7);
  FX.burst(hp, { color: 0xffd090, count: 40, speed: 8 });
  E.timeScale = 1; FX.speedLines(0);
  B.hp = PHASE_HP[3]; UI.setBossHP(B.hp / B.max);
  boss.play('Idle_2_HeadLow', { timeScale: 0.6 });
  tween(j.root.position, { x: B.x - 3, y: 0 }, 0.5, { ease: 'out', real: true });
  j.play('Idle');
  await wait(0.8, true);
  // hiljainen hetki
  camSet([-1.5, 0.8, 3.5], [-1.2, 0.4, -1.5]);
  j.face(-1);
  await UI.say('Jerome', '…Kiitos, toverit.', 2.6);
  for (const p of fallenAt) FX.spiritLight(p.clone().add(new THREE.Vector3(0, 0.5, 0)), 0xcfe4ff, 5);
  await Promise.all(men.map(m => tween({ v: 1 }, { v: 0 }, 2.4, { real: true, onUpdate: e => m.fade(1 - e) })));
  men.forEach(m => { m.root.visible = false; });
  j.face(1);
  camSet([-2.5, 1.1, 4.5], [-1.5, 0.8, 0]);
  await UI.say('Jerome', 'Weed! Se horjuu – nyt!', 2);
  await cam([0, 2.4, 9], [0, 1.4, 0], 0.8);
  j.root.position.set(-5.2, 0, -2.6);
  cutEnd();
  S.W.x = -3; B.x = 3.5;
  beginPhase(3);
}

// --- Battōga-viimeistely ja loppu ---
async function finale() {
  await cutStart();
  const B = S.B, boss = cast.kaibutsu, w = cast.weed, W = S.W;
  W.henki = 0; UI.setHenki(0);
  B.x = 3.4; boss.root.position.set(3.4, 0, 0); boss.face(-1, true); boss.play('Idle_2_HeadLow', { timeScale: 0.5 });
  W.x = -1.5; w.root.position.set(-1.5, 0, 0); w.face(1, true);
  music(null); sfx.battoga();
  UI.caption('<b>BATTŌGA</b>', 1.8);
  // kamera kiertää Weedin ympäri slow-mossa
  E.timeScale = 0.18; FX.speedLines(1);
  w.play('Gallop_Jump', { loop: false, timeScale: 0.8 });
  const orbit = { a: -0.6 };
  const p0 = new THREE.Vector3();
  const arcs = setInterval(() => FX.slashArc(w.root.position.clone().add(new THREE.Vector3(0, 0.45, 0.2)), 0x9fd0ff, 0.9, 0.4, Math.random() * 6), 230);
  tween(w.spin.rotation, { z: -Math.PI * 6 }, 1.9, { real: true, ease: 'inOut' });
  tween(W, { x: B.x - 0.7, y: 1.9 }, 1.9, { real: true, ease: 'inOut', onUpdate: () => w.root.position.set(W.x, W.y, 0) });
  await tween(orbit, { a: 1.4 }, 1.9, { real: true, ease: 'inOut', onUpdate: () => {
    p0.copy(w.root.position);
    E.camPos.set(p0.x + Math.sin(orbit.a) * 3.6, p0.y + 0.9, p0.z + Math.cos(orbit.a) * 3.6);
    E.camLook.set(p0.x, p0.y + 0.4, 0);
  } });
  clearInterval(arcs);
  // ISKU
  const hp = boss.weak.getWorldPosition(new THREE.Vector3());
  E.timeScale = 0.05;
  FX.flash('#ffffff', 1.4, 1); sfx.boom(); shake(1.0);
  FX.burst(hp, { color: 0xffffff, count: 60, speed: 10, life: 1 });
  FX.ring(hp, 0xbfe4ff, 7, 0.8);
  await wait(0.6, true);
  E.timeScale = 1; FX.speedLines(0);
  w.spin.rotation.z = 0;
  B.hp = 0; UI.setBossHP(0);
  tween(W, { x: 0.5, y: 0 }, 0.6, { real: true, ease: 'out', onUpdate: () => w.root.position.set(W.x, W.y, 0) });
  w.play('Jump_ToIdle', { loop: false });
  boss.play('Death', { loop: false, timeScale: 0.6 });
  camSet([1.5, 2.2, 10], [5, 1.5, 0]);
  await wait(1.6, true);
  // hirviö putoaa usvaan
  await tween(boss.root.position, { x: 9.5, y: -1 }, 1.4, { real: true, ease: 'in' });
  await tween(boss.root.position, { y: -9 }, 1.0, { real: true, ease: 'in' });
  FX.dust(new THREE.Vector3(10, 0, 0), true); sfx.rock();
  boss.root.visible = false;
  UI.caption('Hirviö katosi vesiputouksen usvaan.', 3.2);
  await wait(3.4, true);
  // aamunkoitto + koskettava hetki
  music('sad');
  tween(E.rimLight, { intensity: 2.6 }, 4, { real: true });
  E.scene.fog.color.set(0x3a3550);
  if (E.snow) tween(E.snow.uniforms.uWind, { value: 0.3 }, 3, { real: true });
  const j = cast.jerome;
  w.root.position.set(1.2, 0, 0); w.face(1, true); w.play('Idle_2');
  j.root.position.set(-0.4, 0, -0.6); j.face(1, true); j.play('Idle_2_HeadLow');
  camSet([3.4, 0.9, 4.5], [0.7, 0.7, 0]);
  await UI.say('Weed', 'Ihmiset tekivät siitä hirviön… Se ei itse valinnut tätä.');
  camSet([-0.6, 0.9, 2.6], [-0.4, 0.7, -0.6]);
  await UI.say('Jerome', 'Mieheni kuolivat. Ja minä jäin henkiin.');
  w.face(-1);
  camSet([2.4, 0.7, 2.6], [0.9, 0.6, -0.2]);
  await UI.say('Weed', 'He luottivat sinuun loppuun asti. Kannetaan heidän muistonsa yhdessä.');
  // muistohetki: neljä valoa nousee
  w.face(1); w.play('Idle');
  await cam([0, 2.2, 10], [0, 2.6, -3], 2);
  const names = ['Smith', 'Robert', 'Rocker', 'Heuler'];
  names.forEach((n, i) => setTimeout(() => FX.spiritLight(new THREE.Vector3(-3 + i * 2, 1.4, -1), 0xffe6b0, 6), i * 450));
  sfx.howl();
  UI.caption('<b>MUISTOISSA</b>' + names.join(' · '), 4.5);
  await wait(5, true);
  cutEnd();
  S.active = false; S.cutscene = false;
  music('calm');
  showResult(names);
}

function showResult(names) {
  const stars = 1 + (S.W.hp >= 3 ? 1 : 0) + (S.defeats === 0 ? 1 : 0);
  UI.$('stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  UI.$('fallen').innerHTML = `Ōun henki: ${stars}/3<br>Kaatuneet toverit (pysyvä): <b>${names.join(', ')}</b><br><small>Uhraukset ovat pysyviä – he eivät palaa myöhemmillä tasoilla.</small>`;
  try {
    localStorage.setItem('weed.memorial', JSON.stringify(names));
    localStorage.setItem('weed.cleared2', String(Math.max(stars, Number(localStorage.getItem('weed.cleared2') || 0))));
  } catch (_) {}
  UI.show('result', true);
}

// testikoukut (Playwright)
export const debug = {
  S,
  smith: () => { S.B.hp = 60; checkThresholds(); },
  sacrifice: () => useCard('smith'),
  arrows: () => { if (S.phase === 2) { S.B.hp = 20; checkThresholds(); } },
  finale: () => { if (S.phase === 3) finale(); },
  fillHenki: () => addHenki(1),
  bite, dodge, jump, battoga,
};
