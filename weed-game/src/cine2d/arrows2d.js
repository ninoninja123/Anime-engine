// "Four Arrows" as a 2D motion comic (hand-drawn feel, vector Canvas 2D). Replaces the 3D cutscene in level 2
// (src/level2.js fourArrows(); ?arrows3d keeps the old 3D version for comparison).
//
// Timeline: SHOTS (src/cine2d/shots.js) play back to back with HARD CUTS. One clock: the engine's frame updater
// (E.updaters, real time) advances the player, so tools/cine-capture.cjs (virtual clock + rAF stepping) records it
// deterministically. Each shot = { dur, cam keys, draw(S), cues [[t, fn]] }; a cue may hold the shot until a spoken
// line ends (S.say(id, { hold: true })). Drawing: src/cine2d/art.js (characters, landscape), fx.js (effects).
// Phone cost: one canvas, immediate-mode drawing of the current shot only, small grain canvas scaled by CSS,
// no DOM per shot, no SVG filters. E.noRender = true while the overlay covers the 3D view.
import { E, wait } from '../engine.js';
import { sfx, music, ambience, duck } from '../audio.js';
import { say, stopVoice, preloadLines } from '../voice.js';
import { ART } from './art.js';
import { Parts, makeGrain } from './fx.js';
import { SHOTS, LINE_IDS } from './shots.js';

export const VW = 1600, VH = 800;
const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const lerp = (a, b, k) => a + (b - a) * k;

/** Interpolate camera keys [{ k, z, x, y, r, e }] at normalised time k (k may run past 1: slow drift on). */
export function camAt(keys, k) {
  if (!keys || !keys.length) return { z: 1, x: 0, y: 0, r: 0 };
  const c = Math.min(1, Math.max(0, k));
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (c >= keys[i].k && c <= keys[i + 1].k) { a = keys[i]; b = keys[i + 1]; break; }
  const span = Math.max(1e-6, b.k - a.k), u = b.e === 'lin' ? (c - a.k) / span : b.e === 'out' ? 1 - Math.pow(1 - (c - a.k) / span, 3) : b.e === 'in' ? Math.pow((c - a.k) / span, 3) : ease((c - a.k) / span);
  const v = { z: lerp(a.z ?? 1, b.z ?? 1, u), x: lerp(a.x ?? 0, b.x ?? 0, u), y: lerp(a.y ?? 0, b.y ?? 0, u), r: lerp(a.r ?? 0, b.r ?? 0, u) };
  if (k > 1) v.z *= 1 + Math.min(0.06, (k - 1) * 0.025);              // held for speech: keep a slow push going
  return v;
}

export class Player {
  constructor(canvas, { audio = true } = {}) {
    this.cv = canvas; this.g = canvas.getContext('2d', { alpha: false });
    this.audio = audio; this.P = new Parts(7); this.i = -1; this.t = 0; this.T = 0; this.done = false;
    this.shakeA = 0; this.flashA = 0; this.flashC = '#fff'; this.holds = []; this.onDone = null; this.from = 0;
  }
  resize(cssW, cssH, dpr) {
    this.cv.width = Math.round(cssW * dpr); this.cv.height = Math.round(cssH * dpr);
    this.cssH = cssH; this.dpr = dpr;
  }
  setShot(i) {
    this.i = i; this.shot = SHOTS[i]; this.t = 0; this.ci = 0; this.holds = []; this.P = new Parts(100 + i); this.shakeA = 0; this.flashA = 0;
    this.state = {};
    if (this.shot && this.shot.enter) this.shot.enter(this.api());
  }
  api() {
    const self = this;
    return {
      get t() { return self.t; }, get k() { return self.t / self.shot.dur; }, get dur() { return self.shot.dur; }, get T() { return self.T; },
      P: this.P, st: this.state, W: VW, H: VH,
      shake(a) { self.shakeA = Math.max(self.shakeA, a); },
      flash(a = 1, col = '#fff') { self.flashA = a; self.flashC = col; },
      sfx(name, arg) { if (!self.audio || E.skipping) return; const f = sfx[name]; if (f) f(arg); },
      music(name, o) { if (self.audio && !E.skipping) music(name, o); },
      duck(l, s) { if (self.audio) duck(l, s); },
      ambience(p, v) { if (self.audio && !E.skipping) ambience(p, v); },
      say(id, o = {}) {
        if (!self.audio || E.skipping) return;
        const p = say(id, o.hold ? {} : { noWait: true });
        if (o.hold) { const h = { done: false }; self.holds.push(h); Promise.resolve(p).then(() => { h.done = true; }); }
      },
      /** mouth level of a speaking character (0..1); preview: a soft flap */
      talk(who) { if (!self.audio) return 0; const sp = E.speaking; return sp && sp.who === who ? sp.level : 0; },
    };
  }
  step(dt) {
    if (this.done || !this.shot) return;
    this.T += dt; this.t += dt;
    ART.boil = Math.floor(this.T * 12) % 3;                         // line boil "on twos" (12 drawings a second)
    const S = this.api();
    const cues = this.shot.cues || [];
    while (this.ci < cues.length && cues[this.ci][0] <= this.t) { cues[this.ci][1](S); this.ci++; }
    if (!this.shot.freeze || !this.shot.freeze(this.t)) this.P.update(dt);
    this.shakeA *= Math.pow(0.006, dt); this.flashA *= Math.pow(0.0005, dt);
    const held = this.holds.some(h => !h.done) && !E.skipping;
    if (this.t >= this.shot.dur && !held) {
      if (this.i + 1 < SHOTS.length) this.setShot(this.i + 1);
      else { this.done = true; if (this.onDone) this.onDone(); }
    }
  }
  render() {
    const g = this.g, cw = this.cv.width, ch = this.cv.height, sh = this.shot;
    if (!sh) return;
    ART.px = this.dpr * (this.cssH / 390);
    const s0 = Math.max(cw / VW, ch / VH), ox = (cw - VW * s0) / 2, oy = (ch - VH * s0) / 2;
    const k = this.t / sh.dur, cam = camAt(sh.cam, k);
    const T = this.T, a = this.shakeA;
    const sx = a > 0.01 ? (Math.sin(T * 91.7) + Math.sin(T * 53.3 + 1.7)) * a * ch * 0.012 : 0;
    const sy = a > 0.01 ? (Math.sin(T * 83.1 + 0.4) + Math.sin(T * 47.9)) * a * ch * 0.012 : 0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = sh.bg || '#101018'; g.fillRect(0, 0, cw, ch);
    const S = this.api();
    S.cam = cam;
    S.L = (d, fn) => {                                              // a parallax layer: d 0 far … 1 near
      const z = 1 + (cam.z - 1) * d;
      g.setTransform(s0, 0, 0, s0, ox + sx, oy + sy);
      g.translate(VW / 2, VH / 2); if (cam.r) g.rotate(cam.r * Math.PI / 180); g.scale(z, z); g.translate(-VW / 2 - cam.x * d, -VH / 2 - cam.y * d);
      g.save(); fn(g); g.restore();
    };
    S.screen = fn => { g.setTransform(1, 0, 0, 1, 0, 0); g.save(); fn(g, cw, ch); g.restore(); };
    sh.draw(S);
    // particles live in the shot's frame (depth 1)
    if (this.P.list.length) S.L(sh.partsDepth ?? 1, gg => this.P.draw(gg));
    if (sh.post) sh.post(S);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (this.flashA > 0.02) { g.globalAlpha = Math.min(1, this.flashA); g.fillStyle = this.flashC; g.fillRect(0, 0, cw, ch); g.globalAlpha = 1; }
  }
  /** preview/tests: render shot i at time t (particles simulated from the cut). */
  still(i, t) {
    this.setShot(i); this.done = false;
    const dt = 1 / 30; let tt = 0;
    while (tt + dt <= t) { this.T = tt; this.t = tt; const S = this.api(); const cues = this.shot.cues || []; while (this.ci < cues.length && cues[this.ci][0] <= tt) { cues[this.ci][1](S); this.ci++; } if (!this.shot.freeze || !this.shot.freeze(tt)) this.P.update(dt); this.shakeA *= Math.pow(0.006, dt); this.flashA *= Math.pow(0.0005, dt); tt += dt; }
    this.t = t; this.T = t + i * 1.7; ART.boil = Math.floor(this.T * 12) % 3;
    this.render();
  }
}

// ------------------------------------------------------------------------------------------ in-game runner
let root = null, cv = null, grainCv = null, player = null, running = false;
function build() {
  root = document.createElement('div');
  root.id = 'cine2d';
  root.style.cssText = 'position:fixed;inset:0;z-index:3;pointer-events:none;background:#000;display:none;opacity:1';
  cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  grainCv = document.createElement('canvas');
  grainCv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0.9;pointer-events:none';
  const vig = document.createElement('div');
  vig.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(20,10,20,0.42) 100%)';
  root.append(cv, vig, grainCv);
  document.body.appendChild(root);
}
let tiles = null, lastBoil = -1;
function drawGrain() {
  if (!tiles) { tiles = makeGrain(); grainCv.width = 200; grainCv.height = 100; }
  if (ART.boil === lastBoil) return; lastBoil = ART.boil;
  const g = grainCv.getContext('2d'); g.clearRect(0, 0, 200, 100); g.drawImage(tiles[ART.boil], 0, 0);
}
function resize() {
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  player.resize(window.innerWidth, window.innerHeight, E.params.has('fixedres') ? 1 : dpr);
}

/**
 * Play the 2D Four Arrows cutscene. Resolves when finished or skipped (E.skipping).
 * onBeforeEnd: called after the last shot while the overlay still covers the view (set the game state up there).
 */
export async function runArrows2D({ onBeforeEnd } = {}) {
  if (running) return false;
  if (!root) build();
  running = true;
  preloadLines(LINE_IDS);
  player = new Player(cv, { audio: true });
  resize(); window.addEventListener('resize', resize);
  root.style.display = 'block'; root.style.opacity = '1';
  E.noRender = true;
  let fadeIn = 0;
  const finished = new Promise(res => { player.onDone = res; });
  const tick = (dt, dtr) => {
    if (E.skipping && !player.done) { player.done = true; player.onDone && player.onDone(); }
    if (player.done) return;
    player.step(Math.min(dtr, 1 / 20));
    player.render();
    if (fadeIn < 1) { fadeIn = Math.min(1, fadeIn + dtr / 0.35); cv.style.opacity = String(fadeIn); }
    drawGrain();
  };
  cv.style.opacity = '0';
  player.setShot(0);
  E.updaters.add(tick);
  await finished;
  const completed = !E.skipping;
  E.updaters.delete(tick);
  stopVoice();
  E.noRender = false;
  if (onBeforeEnd) await onBeforeEnd();
  // reveal the 3D battle: fade the overlay out (real-time engine wait → deterministic in capture)
  const t0 = E.realTime;
  E.skipping = false;
  await new Promise(res => {
    const f = () => { const k = (E.realTime - t0) / 0.4; root.style.opacity = String(Math.max(0, 1 - k)); if (k >= 1) { E.updaters.delete(f); res(); } };
    E.updaters.add(f);
  });
  root.style.display = 'none';
  window.removeEventListener('resize', resize);
  player = null; running = false;
  return completed;
}
export const arrows2dRunning = () => running;
export { wait };
