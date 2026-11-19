// Prologue player: "The story so far" panels drawn with code (layered SVG, src/story/panels.js) with a slow camera
// push + parallax, particle layers, beats (impact flash, the bear's fall, hunters' lights), narration (src/voice.js:
// Japanese voice + English subtitle, timed text when no voice file) and music. Data: src/data/scenes_prologue.js.
// No image files are loaded. Docs: docs/weed-game/story-intro-svg.md.
//
// runPrologue({ force }) → resolves when finished or skipped.
//   - Plays automatically before the chapter the first time; "Skip" skips it once, "Skip always" remembers
//     (localStorage weed.prologue = 'skip'). Watching it to the end also marks it seen.
//   - Menu "Story so far" replays it any time (force). URL: ?prologue forces it, ?noprologue bypasses it.
import './prologue.css';
import { E, wait } from './engine.js';
import { music, sfx, ambience, initAudio } from './audio.js';
import { say, stopVoice, preloadLines } from './voice.js';
import { PANELS, PROLOGUE_MUSIC, PROLOGUE_LINES } from './data/scenes_prologue.js';
import { LINES, estimateDuration } from './data/lines.js';
import { SCENES } from './story/panels.js';

const KEY = 'weed.prologue';
const get = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };

/** Should the prologue play before the level starts? */
export function shouldPlayPrologue() {
  if (E.params.has('noprologue')) return false;
  if (E.params.has('prologue')) return true;
  return !get();
}

let root = null, els = null, running = false, raf = 0;

function build() {
  root = document.createElement('div');
  root.id = 'prologue';
  root.innerHTML = `
    <div class="pl-stage"></div>
    <canvas class="pl-fx"></canvas>
    <div class="pl-fog a"></div>
    <div class="pl-vig"></div>
    <canvas class="pl-grain"></canvas>
    <div class="pl-flash"></div>
    <div class="pl-kicker"></div>
    <div class="pl-title"><div class="k"></div><div class="m"></div><div class="s"></div></div>
    <div class="pl-bar top"></div><div class="pl-bar bottom"></div>
    <div class="pl-btns"><button class="pl-always">Skip always</button><button class="pl-skip">Skip ▸▸</button></div>
    <div class="pl-black"></div>`;
  document.body.appendChild(root);
  const q = s => root.querySelector(s);
  els = { stage: q('.pl-stage'), fx: q('.pl-fx'), grain: q('.pl-grain'), flash: q('.pl-flash'),
    kicker: q('.pl-kicker'), title: q('.pl-title'), black: q('.pl-black'), skip: q('.pl-skip'), always: q('.pl-always') };
  const stop = e => e.stopPropagation();
  root.addEventListener('pointerdown', stop);
  els.skip.addEventListener('click', e => { e.stopPropagation(); initAudio(); E.skipping = true; });
  els.always.addEventListener('click', e => { e.stopPropagation(); initAudio(); set('skip'); E.skipping = true; });
}

// ---------------------------------------------------------------- particles (3 depth layers → parallax)
let parts = [], fxKinds = [], fxW = 0, fxH = 0, fxDpr = 1;
const R = (a, b) => a + Math.random() * (b - a);
function resizeFx() {
  fxDpr = Math.min(1.5, window.devicePixelRatio || 1);
  fxW = window.innerWidth; fxH = window.innerHeight;
  els.fx.width = Math.round(fxW * fxDpr); els.fx.height = Math.round(fxH * fxDpr);
  els.grain.width = 192; els.grain.height = 192;
}
function spawn(kind, init) {
  const z = Math.random() < 0.15 ? 2 : Math.random() < 0.45 ? 1 : 0;          // depth layer: 0 far, 1 mid, 2 near
  const s = [0.55, 1, 1.9][z];
  const p = { kind, z, s, x: R(0, fxW), y: init ? R(0, fxH) : -10, a: R(0, Math.PI * 2), life: R(4, 9), t: 0 };
  switch (kind) {
    case 'snow': p.vx = R(-14, 6) * s; p.vy = R(18, 34) * s; p.r = R(0.8, 1.8) * s; break;
    case 'blizzard': p.vx = R(-260, -140) * s; p.vy = R(60, 120) * s; p.r = R(0.7, 1.6) * s; p.x = init ? R(0, fxW) : fxW + 10; p.y = R(-20, fxH); break;
    case 'motes': p.vx = R(-5, 5); p.vy = R(-8, -2); p.r = R(0.6, 1.4) * s; p.y = init ? R(0, fxH) : fxH + 5; break;
    case 'embers': p.vx = R(-4, 14) * s; p.vy = R(-34, -14) * s; p.r = R(0.8, 1.7) * s; p.y = init ? R(fxH * 0.2, fxH) : fxH + 5; p.life = R(3, 7); break;
    case 'leaves': p.vx = R(-30, -8) * s; p.vy = R(14, 34) * s; p.r = R(2, 3.6) * s; p.x = init ? R(0, fxW) : R(0, fxW * 1.3); p.spin = R(1, 4); p.col = ['#c8642a', '#e0a040', '#a8401e', '#d8b060'][Math.floor(R(0, 4))]; break;
    case 'seeds': p.vx = R(12, 30) * s; p.vy = R(-6, 4); p.r = R(1, 2.2) * s; p.x = init ? R(0, fxW) : -10; p.y = R(0, fxH); break;
    case 'fireflies': p.vx = R(-6, 6); p.vy = R(-6, 6); p.r = R(1.2, 2.4) * s; p.y = R(fxH * 0.3, fxH); p.x = R(0, fxW); break;
    case 'sparks': p.vx = R(-160, 160); p.vy = R(-160, 40); p.r = R(0.8, 1.8) * s; p.x = fxW * R(0.45, 0.75); p.y = fxH * R(0.25, 0.5); p.life = R(0.6, 1.4); break;
    case 'stars': p.vx = 0; p.vy = 0; p.r = R(0.5, 1.4); p.y = R(fxH * 0.1, fxH * 0.5); p.life = 1e9; break;
  }
  return p;
}
const COUNTS = { leaves: 20, snow: 80, blizzard: 160, motes: 30, embers: 40, seeds: 22, fireflies: 30, sparks: 0, stars: 45 };
const GLOW = { fireflies: '#e9ff8a', sparks: '#cfe8ff', motes: '#fff1c8', embers: '#ff9a40' };
function setFx(kinds) {
  fxKinds = kinds || [];
  parts = parts.filter(p => fxKinds.includes(p.kind));
  for (const k of fxKinds) { const have = parts.filter(p => p.kind === k).length; for (let i = have; i < (COUNTS[k] || 0) * (E.lowFx ? 0.5 : 1); i++) parts.push(spawn(k, true)); }
}
function burstSparks(n = 60) { for (let i = 0; i < n * (E.lowFx ? 0.5 : 1); i++) parts.push(spawn('sparks', true)); }
function drawFx(dt, time) {
  const g = els.fx.getContext('2d');
  g.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
  g.clearRect(0, 0, fxW, fxH);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t += dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 'snow') p.x += Math.sin(time * 0.8 + p.a) * 12 * p.s * dt;
    if (p.kind === 'leaves') p.x += Math.sin(time * 1.4 + p.a) * 20 * p.s * dt;
    if (p.kind === 'embers') p.x += Math.sin(time * 1.7 + p.a) * 10 * p.s * dt;
    if (p.kind === 'fireflies' || p.kind === 'motes') { p.vx += R(-20, 20) * dt; p.vy += R(-20, 20) * dt; p.vx *= 0.98; p.vy *= 0.98; }
    if (p.kind === 'sparks') p.vy += 220 * dt;
    const out = p.y > fxH + 20 || p.x < -30 || p.x > fxW + 30 || p.y < -30 || p.t > p.life;
    if (out) { if (p.kind === 'sparks' || !fxKinds.includes(p.kind)) parts.splice(i, 1); else parts[i] = spawn(p.kind, false); continue; }
    let alpha = 1;
    if (p.kind === 'fireflies') alpha = 0.35 + 0.65 * Math.max(0, Math.sin(time * 2.2 + p.a));
    else if (p.kind === 'stars') alpha = 0.25 + 0.75 * Math.abs(Math.sin(time * 1.1 + p.a));
    else if (p.kind === 'motes' || p.kind === 'seeds' || p.kind === 'embers') alpha = Math.min(1, p.t, (p.life - p.t)) * 0.85;
    else if (p.kind === 'sparks') alpha = 1 - p.t / p.life;
    alpha = Math.max(0, alpha) * (p.z === 0 ? 0.55 : p.z === 1 ? 0.8 : 0.95);
    g.globalAlpha = alpha;
    if (p.kind === 'leaves') {
      g.fillStyle = p.col; g.save(); g.translate(p.x, p.y); g.rotate(time * p.spin + p.a); g.scale(1, 0.45 + 0.4 * Math.sin(time * p.spin * 1.7 + p.a));
      g.beginPath(); g.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, Math.PI * 2); g.fill(); g.restore();
    } else if (p.kind === 'blizzard') {
      g.strokeStyle = 'rgba(235,242,255,0.8)'; g.lineWidth = p.r; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); g.stroke();
    } else {
      const col = GLOW[p.kind] || (p.kind === 'seeds' ? '#fff8e0' : '#ffffff');
      g.fillStyle = col;
      if (GLOW[p.kind]) { g.globalAlpha = alpha * 0.16; g.beginPath(); g.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2); g.fill(); g.globalAlpha = alpha; }   // cheap halo, no shadowBlur
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
    }
  }
  g.globalAlpha = 1;
}
// film grain: a small noise tile re-rolled a few times per second, scaled up by CSS
let grainT = 0;
function drawGrain(dt) {
  grainT -= dt; if (grainT > 0) return; grainT = 0.1;
  const g = els.grain.getContext('2d'); const d = g.createImageData(192, 192);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 14; }
  g.putImageData(d, 0, 0);
}

// ---------------------------------------------------------------- panels: SVG layers + camera
// Each panel is a stack of full-frame <svg> layers. The SVGs are rasterised once; per frame only CSS transforms are
// written (camera push + parallax by depth), so the browser composites them instead of repainting.
let cur = null;          // { el, p, t0, dur, layers: [{ el, d }] }
let shakeAmt = 0;
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function estimate(p) {
  // panel length estimate (the camera move runs over it; voice files may stretch it – motion then eases on slowly)
  let s = p.hold || 0;
  for (const st of p.steps) {
    if (st.say) { const l = LINES[st.say]; s += l ? (l.pre + l.post) * 0.6 + estimateDuration(l) : 4; }
    if (st.wait) s += st.wait;
  }
  return Math.max(4, s + 1);
}
const built = {};
function buildPanel(p) {
  if (built[p.id]) return built[p.id];
  const el = document.createElement('div');
  const layers = SCENES[p.scene]();
  el.innerHTML = layers.map(l => `<div class="pl-ly ${l.cls}" style="${l.origin ? `transform-origin:${l.origin};` : ''}${l.style}">${l.html}</div>`).join('');
  return (built[p.id] = { el, layers: [...el.children].map((c, i) => ({ el: c, d: layers[i].d })) });
}
function placeLayers(c, k) {
  const a = c.p.cam.from, b = c.p.cam.to, e = ease(Math.min(1, k)) + (k > 1 ? (1 - Math.exp(-(k - 1))) * 0.04 : 0);
  const s = lerp(a[0], b[0], e), x = lerp(a[1], b[1], e), y = lerp(a[2], b[2], e);
  for (const L of c.layers) {
    const f = 0.3 + 0.9 * L.d;                                      // far layers follow the camera less → parallax
    L.el.style.translate = `${(x * f).toFixed(2)}% ${(y * f).toFixed(2)}%`;
    L.el.style.scale = (1 + (s - 1) * f).toFixed(4);
  }
}
function showPanel(p) {
  const c = buildPanel(p), el = c.el;
  el.className = 'pl-panel pn-' + p.id;                              // resets beat classes (replay from the menu)
  const xf = E.skipping ? 0 : (p.xfade ?? 1.2);
  const trans = p.trans || 'fade';
  el.style.transition = 'none'; el.style.opacity = 0; el.style.clipPath = '';
  els.stage.appendChild(el);
  const prev = cur;
  cur = { el, p, layers: c.layers, t0: performance.now() / 1000, dur: estimate(p) };
  placeLayers(cur, 0);
  void el.offsetWidth;
  if (trans === 'cut') el.style.opacity = 1;
  else if (trans === 'iris') {
    el.style.opacity = 1; el.style.clipPath = 'circle(0% at 38% 62%)'; void el.offsetWidth;
    el.style.transition = `clip-path ${xf}s cubic-bezier(.5,0,.3,1)`; el.style.clipPath = 'circle(130% at 38% 62%)';
    setTimeout(() => { if (cur && cur.el === el) { el.style.transition = 'none'; el.style.clipPath = ''; } }, xf * 1000 + 60);
  } else { el.style.transition = `opacity ${xf}s ease`; el.style.opacity = 1; }
  setFx(p.fx);
  setKicker(p.kicker || '');
  if (p.title) setTimeout(() => setTitle(p.title), 700);
  if (prev) setTimeout(() => prev.el.remove(), (trans === 'cut' ? 0 : xf) * 1000 + 100);
  const i = PANELS.indexOf(p); if (PANELS[i + 1]) setTimeout(() => { if (running) buildPanel(PANELS[i + 1]); }, 400);   // prepare the next one off the critical path
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
  t.classList.toggle('big', !!o.sub);
  t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
}
function flash(peak = 0.9) {
  const f = els.flash; f.style.transition = 'none'; f.style.opacity = String(peak);
  void f.offsetWidth; f.style.transition = 'opacity 0.9s ease-out'; f.style.opacity = '0';
  burstSparks(60);
}

function frame() {
  if (!running) return;
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, now - (frame.last || now)); frame.last = now;
  if (cur) {
    placeLayers(cur, (now - cur.t0) / cur.dur);
    shakeAmt *= Math.pow(0.02, dt);
    const sx = (Math.random() - 0.5) * shakeAmt * 14, sy = (Math.random() - 0.5) * shakeAmt * 10;
    els.stage.style.translate = shakeAmt > 0.02 ? `${sx.toFixed(1)}px ${sy.toFixed(1)}px` : '';
  }
  drawFx(dt, now);
  drawGrain(dt);
  raf = requestAnimationFrame(frame);
}
// a hidden tab pauses the CSS motion too (rAF and the game timers stop on their own)
function onVis() { if (root) root.classList.toggle('paused', document.hidden); }

// ---------------------------------------------------------------- run
async function runStep(s) {
  if (s.say) { await say(s.say); return; }
  if (E.skipping) return;
  if (s.wait) { await wait(s.wait, true); return; }
  if (s.sfx) { (sfx[s.sfx] || (() => {}))(s.arg); return; }
  if (s.shake) { shakeAmt = Math.max(shakeAmt, s.shake); return; }
  if (s.flash) { flash(s.flash); return; }
  if (s.beat) { if (cur) cur.el.classList.add('b-' + s.beat); return; }
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
  buildPanel(PANELS[0]);
  document.body.classList.add('prologue');
  root.classList.remove('ending', 'paused'); root.classList.add('on');
  E.noRender = true;                                           // the overlay is opaque: save the phone's GPU
  els.black.style.transition = 'none'; els.black.style.opacity = 1;
  resizeFx(); window.addEventListener('resize', resizeFx); document.addEventListener('visibilitychange', onVis);
  frame.last = 0; raf = requestAnimationFrame(frame);
  music(null, { fade: 1.2 });                                  // restart the theme from its first bar
  await wait(0.9, true);
  music(PROLOGUE_MUSIC, { fade: 2.5 });
  let completed = true;
  for (let i = 0; i < PANELS.length; i++) {
    if (E.skipping) { completed = false; break; }
    const p = PANELS[i];
    showPanel(p);
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
  window.removeEventListener('resize', resizeFx); document.removeEventListener('visibilitychange', onVis);
  for (const el of [...els.stage.children]) el.remove();
  els.stage.style.translate = '';
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
