// Prologue player: illustrated "story so far" panels with Ken Burns motion, particle layers, animated light,
// narration (src/voice.js: Japanese voice + English subtitle, timed text when no voice file) and music.
// Data: src/data/scenes_prologue.js. Art: public/story/*.webp (generated, not in git) with a painted fallback.
//
// runPrologue({ force }) → resolves when finished or skipped.
//   - Plays automatically before Level 2 the first time; "Skip" skips it once, "Skip always" remembers
//     (localStorage weed.prologue = 'skip'). Watching it to the end also marks it seen.
//   - Menu "Story so far" replays it any time (force). URL: ?prologue forces it, ?noprologue bypasses it.
import './prologue.css';
import { E, wait } from './engine.js';
import { music, sfx, ambience, initAudio } from './audio.js';
import { say, stopVoice, preloadLines } from './voice.js';
import { PANELS, PROLOGUE_MUSIC, PROLOGUE_LINES } from './data/scenes_prologue.js';
import { LINES, estimateDuration } from './data/lines.js';

const KEY = 'weed.prologue';
const get = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };

/** Should the prologue play before the level starts? */
export function shouldPlayPrologue() {
  if (E.params.has('noprologue')) return false;
  if (E.params.has('prologue')) return true;
  return !get();
}

const BASE = () => window.ASSET_BASE || document.baseURI;
let root = null, els = null, running = false, raf = 0;

function build() {
  root = document.createElement('div');
  root.id = 'prologue';
  root.innerHTML = `
    <div class="pl-stage"></div>
    <div class="pl-light"></div>
    <canvas class="pl-fx"></canvas>
    <div class="pl-fog a"></div><div class="pl-fog b"></div>
    <div class="pl-vig"></div>
    <canvas class="pl-grain"></canvas>
    <div class="pl-flash"></div>
    <div class="pl-kicker"></div>
    <div class="pl-title"><div class="k"></div><div class="m"></div><div class="s"></div><div class="j" lang="ja"></div></div>
    <div class="pl-bar top"></div><div class="pl-bar bottom"></div>
    <div class="pl-btns"><button class="pl-always">Skip always</button><button class="pl-skip">Skip ▸▸</button></div>
    <div class="pl-black"></div>`;
  document.body.appendChild(root);
  const q = s => root.querySelector(s);
  els = { stage: q('.pl-stage'), light: q('.pl-light'), fx: q('.pl-fx'), grain: q('.pl-grain'), flash: q('.pl-flash'),
    kicker: q('.pl-kicker'), title: q('.pl-title'), black: q('.pl-black'), skip: q('.pl-skip'), always: q('.pl-always') };
  const stop = e => e.stopPropagation();
  root.addEventListener('pointerdown', stop);
  els.skip.addEventListener('click', e => { e.stopPropagation(); initAudio(); E.skipping = true; });
  els.always.addEventListener('click', e => { e.stopPropagation(); initAudio(); set('skip'); E.skipping = true; });
}

// ---------------------------------------------------------------- art loading (+ painted fallback)
const images = {};
function loadArt(p) {
  if (images[p.id]) return images[p.id];
  images[p.id] = new Promise(res => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => res(img.src));
    img.onerror = () => res(paint(p.paint));
    img.src = new URL(p.img, BASE()).href;
  });
  return images[p.id];
}
/** Fallback illustration: sky gradient, glowing orb, layered noisy ridges, haze. */
function paint(o = {}) {
  const w = 1280, h = 720, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, o.sky?.[0] || '#061028'); sky.addColorStop(1, o.sky?.[1] || '#2a3f6e');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  if (o.orb) {
    const { x, y, r, color, glow } = o.orb;
    const gl = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w * 5); gl.addColorStop(0, glow); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(0, 0, w, h);
    g.fillStyle = color; g.beginPath(); g.arc(x * w, y * h, r * w, 0, Math.PI * 2); g.fill();
  }
  const ridges = o.ridges || ['#2c3d63', '#1d2a48', '#121b31', '#070b16'];
  ridges.forEach((col, i) => {
    const base = h * (0.45 + i * 0.13), amp = h * (0.16 - i * 0.025), seed = i * 17.3 + 3;
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const t = x / w;
      const y = base - amp * (0.55 * Math.sin(t * 6.1 + seed) + 0.3 * Math.sin(t * 13.7 + seed * 2) + 0.15 * Math.sin(t * 31 + seed * 3)) - amp * 0.4 * Math.abs(Math.sin(t * 3.3 + seed));
      g.lineTo(x, y);
    }
    g.lineTo(w, h); g.closePath(); g.fill();
    if (o.haze && i < ridges.length - 1) { const hz = g.createLinearGradient(0, base - amp, 0, base + h * 0.1); hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, o.haze); g.fillStyle = hz; g.fillRect(0, base - amp, w, h * 0.3); }
  });
  return c.toDataURL('image/jpeg', 0.85);
}

// ---------------------------------------------------------------- particles (3 depth layers → parallax)
let parts = [], fxKinds = [], fxW = 0, fxH = 0, fxDpr = 1;
const R = (a, b) => a + Math.random() * (b - a);
function resizeFx() {
  fxDpr = Math.min(1.5, window.devicePixelRatio || 1);
  fxW = window.innerWidth; fxH = window.innerHeight;
  for (const c of [els.fx]) { c.width = Math.round(fxW * fxDpr); c.height = Math.round(fxH * fxDpr); }
  els.grain.width = 256; els.grain.height = 256;
}
function spawn(kind, init) {
  const z = Math.random() < 0.15 ? 2 : Math.random() < 0.45 ? 1 : 0;          // depth layer: 0 far, 1 mid, 2 near
  const s = [0.55, 1, 1.9][z];
  const p = { kind, z, s, x: R(0, fxW), y: init ? R(0, fxH) : -10, a: R(0, Math.PI * 2), life: R(4, 9), t: 0 };
  switch (kind) {
    case 'snow': p.vx = R(-14, 6) * s; p.vy = R(18, 34) * s; p.r = R(0.8, 1.8) * s; break;
    case 'blizzard': p.vx = R(-260, -140) * s; p.vy = R(60, 120) * s; p.r = R(0.7, 1.6) * s; p.x = init ? R(0, fxW) : fxW + 10; p.y = R(-20, fxH); break;
    case 'rain': p.vx = -60 * s; p.vy = R(620, 820) * s; p.r = s; p.len = R(10, 18) * s; break;
    case 'motes': p.vx = R(-5, 5); p.vy = R(-8, -2); p.r = R(0.8, 2) * s; p.y = init ? R(0, fxH) : fxH + 5; break;
    case 'seeds': p.vx = R(12, 30) * s; p.vy = R(-6, 4); p.r = R(1, 2.2) * s; p.x = init ? R(0, fxW) : -10; p.y = R(0, fxH); break;
    case 'fireflies': p.vx = R(-6, 6); p.vy = R(-6, 6); p.r = R(1.2, 2.4) * s; p.y = init ? R(fxH * 0.3, fxH) : R(fxH * 0.3, fxH); p.x = R(0, fxW); break;
    case 'sparks': p.vx = R(-160, 160); p.vy = R(-160, 40); p.r = R(0.8, 1.8) * s; p.x = fxW * R(0.25, 0.55); p.y = fxH * R(0.3, 0.6); p.life = R(0.6, 1.4); break;
    case 'stars': p.vx = 0; p.vy = 0; p.r = R(0.4, 1.3); p.y = R(0, fxH * 0.45); p.life = 1e9; break;
  }
  return p;
}
const COUNTS = { snow: 90, blizzard: 220, rain: 160, motes: 40, seeds: 26, fireflies: 34, sparks: 0, stars: 70 };
function setFx(kinds) {
  fxKinds = kinds || [];
  const keep = parts.filter(p => fxKinds.includes(p.kind));
  parts = keep;
  for (const k of fxKinds) { const have = parts.filter(p => p.kind === k).length; for (let i = have; i < (COUNTS[k] || 0) * (E.lowFx ? 0.5 : 1); i++) parts.push(spawn(k, true)); }
}
function burstSparks(n = 60) { for (let i = 0; i < n; i++) parts.push(spawn('sparks', true)); }
function drawFx(dt, time) {
  const g = els.fx.getContext('2d');
  g.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
  g.clearRect(0, 0, fxW, fxH);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t += dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 'snow') p.x += Math.sin(time * 0.8 + p.a) * 12 * p.s * dt;
    if (p.kind === 'fireflies' || p.kind === 'motes') { p.vx += R(-20, 20) * dt; p.vy += R(-20, 20) * dt; p.vx *= 0.98; p.vy *= 0.98; }
    if (p.kind === 'sparks') p.vy += 220 * dt;
    const out = p.y > fxH + 20 || p.x < -30 || p.x > fxW + 30 || p.y < -30 || p.t > p.life;
    if (out) { if (p.kind === 'sparks' || !fxKinds.includes(p.kind)) parts.splice(i, 1); else parts[i] = spawn(p.kind, false); continue; }
    let alpha = 1;
    if (p.kind === 'fireflies') alpha = 0.35 + 0.65 * Math.max(0, Math.sin(time * 2.2 + p.a));
    else if (p.kind === 'stars') alpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.3 + p.a));
    else if (p.kind === 'motes' || p.kind === 'seeds') alpha = Math.min(1, p.t, (p.life - p.t)) * 0.8;
    else if (p.kind === 'sparks') alpha = 1 - p.t / p.life;
    g.globalAlpha = Math.max(0, alpha) * (p.z === 0 ? 0.55 : p.z === 1 ? 0.8 : 0.95);
    if (p.kind === 'rain') {
      g.strokeStyle = 'rgba(190,220,230,0.45)'; g.lineWidth = p.r; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + p.vx * 0.02, p.y - p.len); g.stroke();
    } else if (p.kind === 'blizzard') {
      g.strokeStyle = 'rgba(235,242,255,0.8)'; g.lineWidth = p.r; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); g.stroke();
    } else {
      const col = p.kind === 'fireflies' ? '#e9ff8a' : p.kind === 'sparks' ? '#cfe8ff' : p.kind === 'seeds' ? '#fff8e0' : p.kind === 'motes' ? '#fff1c8' : '#ffffff';
      if (p.kind === 'fireflies' || p.kind === 'motes' || p.kind === 'sparks') { g.shadowColor = col; g.shadowBlur = 8; } else g.shadowBlur = 0;
      g.fillStyle = col; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
    }
  }
  g.globalAlpha = 1; g.shadowBlur = 0;
}
// film grain: a small noise tile re-rolled a few times per second, scaled up by CSS
let grainT = 0;
function drawGrain(dt) {
  grainT -= dt; if (grainT > 0) return; grainT = 0.08;
  const g = els.grain.getContext('2d'); const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; }
  g.putImageData(d, 0, 0);
}

// ---------------------------------------------------------------- panels: Ken Burns + light
let cur = null;          // { el, p, t0, dur }
let shakeAmt = 0;
function lerp(a, b, k) { return a + (b - a) * k; }
const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function kbTransform(p, k) {
  const a = p.kb.from, b = p.kb.to, e = ease(Math.min(1, k));
  const s = lerp(a[0], b[0], e), x = lerp(a[1], b[1], e), y = lerp(a[2], b[2], e);
  return `scale(${s.toFixed(4)}) translate(${x.toFixed(3)}%, ${y.toFixed(3)}%)`;
}
function lightCss(kind, t) {
  switch (kind) {
    case 'moon': return { bg: `radial-gradient(60% 70% at ${72 + Math.sin(t * 0.3) * 2}% 20%, rgba(200,220,255,0.22), transparent 70%)`, op: 0.85 + 0.15 * Math.sin(t * 0.7) };
    case 'warm': return { bg: 'radial-gradient(50% 60% at 40% 40%, rgba(255,180,90,0.25), transparent 70%)', op: 0.8 + 0.2 * Math.sin(t * 2.3) * Math.sin(t * 1.7) };
    case 'redstorm': return { bg: 'radial-gradient(70% 60% at 70% 20%, rgba(255,30,10,0.35), transparent 70%)', op: 0.6 + 0.4 * Math.abs(Math.sin(t * 0.9)) };
    case 'flash': return { bg: 'radial-gradient(45% 55% at 35% 40%, rgba(200,230,255,0.4), transparent 70%)', op: 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) };
    case 'sun': return { bg: `radial-gradient(70% 80% at 84% 35%, rgba(255,215,140,0.33), transparent 70%)`, op: 0.75 + 0.25 * Math.sin(t * 0.6) };
    case 'alarm': { const s = Math.max(0, Math.sin(t * 4.2)); return { bg: `radial-gradient(55% 70% at ${30 + 20 * Math.sin(t * 2.1)}% 25%, rgba(255,20,20,0.5), transparent 70%)`, op: 0.15 + 0.85 * s * s }; }
    case 'beams': { const a = 18 + 14 * Math.sin(t * 0.55); return { bg: `linear-gradient(${a}deg, transparent 30%, rgba(235,240,255,0.16) 38%, transparent 46%), linear-gradient(${a + 22}deg, transparent 52%, rgba(235,240,255,0.10) 58%, transparent 64%)`, op: 0.8 + 0.2 * Math.sin(t * 5.1) * Math.sin(t * 3.3) }; }
    case 'dawn': return { bg: 'conic-gradient(from 200deg at 80% 30%, transparent 0deg, rgba(255,230,170,0.18) 12deg, transparent 22deg, rgba(255,230,170,0.14) 36deg, transparent 48deg, rgba(255,230,170,0.12) 66deg, transparent 80deg)', op: 0.7 + 0.3 * Math.sin(t * 0.5) };
  }
  return { bg: 'none', op: 0 };
}
function estimate(p) {
  // panel length estimate (Ken Burns runs over it; voice files may stretch it – motion then eases out slowly)
  let s = p.hold || 0;
  for (const st of p.steps) {
    if (st.say) { const l = LINES[st.say]; s += l ? l.pre + l.post + estimateDuration(l) : 4; }
    if (st.wait) s += st.wait;
  }
  return Math.max(4, s + 1);
}
async function showPanel(p) {
  const src = await loadArt(p);
  const el = document.createElement('div');
  el.className = 'pl-panel';
  el.innerHTML = `<div class="pl-img"></div><div class="pl-grade"></div>`;
  el.firstChild.style.backgroundImage = `url("${src}")`;
  el.querySelector('.pl-grade').style.background = p.grade || 'none';
  el.firstChild.style.transform = kbTransform(p, 0);
  els.stage.appendChild(el);
  const xf = E.skipping ? 0 : (p.xfade ?? 1.2);
  el.style.transition = `opacity ${xf}s ease`;
  void el.offsetWidth; el.style.opacity = 1;
  const prev = cur;
  cur = { el, p, t0: performance.now() / 1000, dur: estimate(p) };
  setFx(p.fx);
  setKicker(p.kicker || '');
  if (p.title) setTimeout(() => setTitle(p.title), 700);
  if (prev) setTimeout(() => prev.el.remove(), xf * 1000 + 100);
  // preload the next panel
  const i = PANELS.indexOf(p); if (PANELS[i + 1]) loadArt(PANELS[i + 1]);
}
function setKicker(text) {
  const k = els.kicker;
  k.classList.remove('on');
  if (!text) return;
  setTimeout(() => { k.textContent = text; k.classList.add('on'); }, 500);
}
function setTitle(o) {
  const t = els.title;
  if (!o) { t.classList.remove('on'); return; }
  t.querySelector('.k').textContent = o.kicker || '';
  t.querySelector('.m').textContent = o.main || '';
  t.querySelector('.s').textContent = o.sub || '';
  t.querySelector('.j').textContent = o.jp || '';
  t.classList.toggle('big', !!o.sub);
  t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
}
function flash(peak = 0.9) {
  const f = els.flash; f.style.transition = 'none'; f.style.opacity = String(peak);
  void f.offsetWidth; f.style.transition = 'opacity 0.9s ease-out'; f.style.opacity = '0';
  burstSparks(70);
}

function frame() {
  if (!running) return;
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, now - (frame.last || now)); frame.last = now;
  if (cur) {
    const k = (now - cur.t0) / cur.dur;
    const img = cur.el.firstChild;
    shakeAmt *= Math.pow(0.02, dt);
    const sx = (Math.random() - 0.5) * shakeAmt * 14, sy = (Math.random() - 0.5) * shakeAmt * 10;
    img.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) ` + kbTransform(cur.p, k < 1 ? k : 1 + (1 - Math.exp(-(k - 1))) * 0.05);
    const L = lightCss(cur.p.light, now);
    els.light.style.background = L.bg; els.light.style.opacity = L.op.toFixed(3);
  }
  drawFx(dt, now);
  drawGrain(dt);
  raf = requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- run
async function runStep(s) {
  if (s.say) { await say(s.say); return; }
  if (E.skipping) return;
  if (s.wait) { await wait(s.wait, true); return; }
  if (s.sfx) { (sfx[s.sfx] || (() => {}))(s.arg); return; }
  if (s.shake) { shakeAmt = Math.max(shakeAmt, s.shake); return; }
  if (s.flash) { flash(s.flash); return; }
  if (s.music !== undefined) { music(s.music, { fade: s.fade ?? 1.6 }); return; }
  if (s.ambience !== undefined) { ambience(s.ambience, 0.3); return; }
  if (s.title !== undefined) { setTitle(s.title); return; }
}

/**
 * Play the prologue. opts.force = play even if skipped before (menu "Story so far").
 * opts.onBeforeEnd = called while the screen is black, before the overlay fades (set up the next scene there).
 */
export async function runPrologue({ force = false, onBeforeEnd } = {}) {
  if (running) return;
  if (!force && !shouldPlayPrologue()) return;
  initAudio();
  if (!root) build();
  running = true; E.skipping = false;
  preloadLines(PROLOGUE_LINES);
  loadArt(PANELS[0]); loadArt(PANELS[1]);
  document.body.classList.add('prologue');
  root.classList.remove('ending'); root.classList.add('on');
  E.noRender = true;                                           // the overlay is opaque: save the phone's GPU
  els.black.style.transition = 'none'; els.black.style.opacity = 1;
  resizeFx(); window.addEventListener('resize', resizeFx);
  frame.last = 0; raf = requestAnimationFrame(frame);
  music(null, { fade: 1.2 });                                  // restart the theme from its first bar
  await wait(0.9, true);
  music(PROLOGUE_MUSIC, { fade: 2.5 });
  let completed = true;
  for (let i = 0; i < PANELS.length; i++) {
    if (E.skipping) { completed = false; break; }
    const p = PANELS[i];
    await showPanel(p);
    if (i === 0) { els.black.style.transition = 'opacity 2.4s ease'; els.black.style.opacity = 0; }
    for (const s of p.steps) { if (E.skipping) break; await runStep(s); }
    if (p.hold && !E.skipping) await wait(p.hold, true);
  }
  if (E.skipping) completed = false;
  E.skipping = false;
  stopVoice(); setTitle(null); setKicker('');
  if (completed) set(get() || 'seen');
  // fade to black, let the caller set up the next scene behind it, then reveal
  els.black.style.transition = `opacity ${completed ? 1.6 : 0.5}s ease`; els.black.style.opacity = 1;
  await wait(completed ? 1.7 : 0.55, true);
  ambience(false);
  E.noRender = false;
  if (onBeforeEnd) await onBeforeEnd();
  running = false; cancelAnimationFrame(raf);
  window.removeEventListener('resize', resizeFx);
  for (const el of [...els.stage.children]) el.remove();
  cur = null; parts = [];
  document.body.classList.remove('prologue');
  E.skipping = false;
  // reveal what the caller set up: the black layer fades out on its own while the next scene already runs
  els.black.style.transition = 'opacity 1.1s ease'; els.black.style.opacity = 0;
  root.classList.add('ending');
  setTimeout(() => { if (!running) root.classList.remove('on', 'ending'); }, 1150);
  return completed;
}
export const prologueRunning = () => running;
