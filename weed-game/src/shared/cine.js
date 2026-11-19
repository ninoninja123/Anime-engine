// Cinematography helpers for the data-driven scenes (src/scenes.js stays untouched):
//  - DRIFT: the camera never freezes. After every camera move/cut the shot keeps creeping (push-in, truck, rise) with an
//    ease-out, like a slow dolly on a hold. A new camera keyframe (anything else writing E.camPos) starts a new shot.
//      Drift({ push: 0.05, truck: 0.03, rise: 0.01 })  per-second fractions of the camera-target distance; Drift(null) = off
//  - MARKS for testing: ?cinefrom=<label> skips (fast-forwards) a scene up to Mark('<label>').
//  - Steps: Hush(level, secs) (music + ambience drop for a silent beat), Breathe('id') (breath sound at a dog),
//    Light/exposure pulses are plain { light } steps.
import * as THREE from 'three';
import { E, tween } from '../engine.js';
import { duck } from '../audio.js';
import { post } from '../gfx/post.js';
import { setMood } from '../gfx/mood.js';

const D = { on: null, t: 0, last: new THREE.Vector3(), lastLook: new THREE.Vector3(), has: false };
const _d = new THREE.Vector3(), _s = new THREE.Vector3();
let installed = false;

function update(_dt, dtr) {
  if (!D.on || !E.cine || E.skipping || !(dtr > 0)) { D.has = false; return; }
  const moved = !D.has || E.camPos.distanceToSquared(D.last) > 1e-10 || E.camLook.distanceToSquared(D.lastLook) > 1e-10;
  if (moved) { D.t = 0; D.has = true; }           // someone else moved the camera (tween or cut): a new shot starts
  else {
    D.t += dtr;
    const env = Math.exp(-D.t / (D.on.tau || 5)) * dtr;           // eases out over a long hold
    _d.subVectors(E.camLook, E.camPos); const dist = Math.min(4, _d.length()); _d.normalize();          // far look points: no runaway drift
    _s.set(-_d.z, 0, _d.x).normalize();
    const push = (D.on.push ?? 0.04) * dist * env, truck = (D.on.truck ?? 0.02) * dist * env, rise = (D.on.rise ?? 0) * dist * env;
    if (dist > 0.6) E.camPos.addScaledVector(_d, push);
    E.camPos.addScaledVector(_s, truck); E.camLook.addScaledVector(_s, truck * 0.6);
    E.camPos.y += rise; E.camLook.y += rise * 0.5;
  }
  D.last.copy(E.camPos); D.lastLook.copy(E.camLook);
}
export function drift(o) {
  if (!installed) { E.updaters.add(update); installed = true; }
  D.on = o === null ? null : { push: 0.04, truck: 0.02, rise: 0, tau: 5, ...(o || {}) };
  D.has = false;
}
export const Drift = (o) => ({ fn: () => drift(o) });

// ---------------------------------------------------------------- test marks
const FROM = E.params.get('cinefrom');
let fromDone = false;
/** First step of a scene: fast-forward when ?cinefrom names a mark inside it. */
export const From = (labels) => ({ fn: () => { if (FROM && !fromDone && labels.includes(FROM)) E.skipping = true; } });
export const Mark = (label) => ({ always: true, fn: () => { window.__cineMark = label; if (FROM === label && !fromDone) { fromDone = true; E.skipping = false; } } });

/** A silent beat: music (and with it everything on the music bus) drops to `level` for `secs`. */
export const Hush = (level = 0.15, secs = 3) => ({ fn: () => { if (!E.skipping) duck(level, secs, 0.4); } });

// ---------------------------------------------------------------- grade (light / colour on top of the mood)
// The mood director rewrites post.base every frame, so scene "light" changes are applied here as multipliers after it:
//   Grade({ exposure: 0.7, sat: 0.6, vig: 0.2, bloom: 0.3, t: 2 })  (exposure/sat multiply, vig/bloom add); Grade(null) = off
const G = { exposure: 1, sat: 1, vig: 0, bloom: 0 };
let gradeOn = false;
function gradeUpd() {
  const b = post.base;
  b.exposure *= G.exposure; b.sat *= G.sat; b.vig += G.vig; b.bloom += G.bloom;
  if (!post.ready && E.renderer && G.exposure !== 1) E.renderer.toneMappingExposure *= G.exposure;
}
export function grade(o) {
  if (!gradeOn) { E.updaters.add(gradeUpd); gradeOn = true; }
  const to = o ? { exposure: o.exposure ?? 1, sat: o.sat ?? 1, vig: o.vig ?? 0, bloom: o.bloom ?? 0 } : { exposure: 1, sat: 1, vig: 0, bloom: 0 };
  const t = o && o.t !== undefined ? o.t : 1.5;
  if (t <= 0 || E.skipping) { Object.assign(G, to); return Promise.resolve(); }
  return tween(G, to, t, { real: true, ease: 'inOut' });
}
/** Waits for the grade change; GradeNow does not. */
export const Grade = (o) => ({ fn: () => grade(o) });
export const GradeNow = (o) => ({ fn: () => { grade(o); } });
/** Mood change that also runs while a scene is being skipped (plain { mood } steps are skipped). */
export const Mood = (name, t = 2) => ({ fn: () => setMood(name, E.skipping ? 0.01 : t) });

// ---------------------------------------------------------------- headlight glare (screen-space, from one side)
let glareEl = null;
/** A warm light grows from the left edge of the frame (headlights coming) over `secs`, then snaps off. */
export function glare(secs = 2.4, peak = 0.8, side = 'left') {
  if (E.skipping) return;
  if (!glareEl) { glareEl = document.createElement('div'); glareEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;mix-blend-mode:screen;'; document.body.appendChild(glareEl); }
  const x = side === 'left' ? '-5%' : '105%';
  glareEl.style.background = `radial-gradient(60% 75% at ${x} 58%, rgba(255,246,214,0.95), rgba(255,226,160,0.45) 35%, rgba(255,200,120,0) 70%)`;
  const o = { k: 0 };
  tween(o, { k: 1 }, secs, { real: true, ease: 'in', onUpdate: () => { glareEl.style.opacity = String(o.k * peak); } })
    .then(() => { const f = { k: 1 }; tween(f, { k: 0 }, 0.5, { real: true, onUpdate: () => { glareEl.style.opacity = String(f.k * peak); } }); });
}
