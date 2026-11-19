// Dev preview of the 2D Four Arrows shots without the game: ?shot=N&t=sec renders one still;
// window.__still(i, t) re-renders (tools: screenshots / contact sheets); ?play plays the whole timeline silently.
import { Player } from './arrows2d.js';
import { SHOTS } from './shots.js';
const cv = document.getElementById('c'), lab = document.getElementById('lab');
const P = new Player(cv, { audio: false });
P.resize(window.innerWidth, window.innerHeight, 1);
const q = new URLSearchParams(location.search);
window.__shots = SHOTS.map(s => ({ n: s.n, dur: s.dur }));
window.__still = (i, t) => { const t0 = performance.now(); P.still(i, t); lab.textContent = `#${SHOTS[i].n}  t=${t.toFixed(2)}  ${(performance.now() - t0).toFixed(1)}ms`; return performance.now() - t0; };
if (q.has('play')) {
  P.setShot(+(q.get('shot') || 0)); let last = performance.now();
  const f = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; P.step(dt); P.render(); lab.textContent = `#${P.shot && P.shot.n}`; if (!P.done) requestAnimationFrame(f); };
  requestAnimationFrame(f);
} else window.__still(+(q.get('shot') || 0), +(q.get('t') || 0.3));
