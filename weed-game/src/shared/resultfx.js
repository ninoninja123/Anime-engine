// Result / transition screens as small animated moments (no markup changes): when #result, #result1 or #defeat becomes
// visible, its text is revealed in beats (kicker → title letter by letter → stars one by one → the fallen names, each with
// a soft spirit glow), drifting particles fill the background (gold leaves for victory, cold motes for defeat) and each
// beat has a sound. Installed once from level1.js; works for both levels.
import { sfx } from '../audio.js';

const CSS = `
.rfx-canvas{position:absolute;inset:0;pointer-events:none;z-index:0}
.screen.rfx>*:not(.rfx-canvas){position:relative;z-index:1}
.rfx .kicker{animation:rfxKick .9s cubic-bezier(.2,.8,.2,1) both}
.rfx h2 .ch{padding:0 .06em;margin:0 -.06em;background:inherit;-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-block;opacity:0;transform:translateY(.5em) scale(1.3);filter:blur(4px);animation:rfxCh .55s cubic-bezier(.2,.8,.2,1) forwards}
.rfx .rfx-in{opacity:0;animation:rfxIn 1.1s ease forwards}
.rfx .rfx-star{display:inline-block;opacity:0;transform:scale(2.4);animation:rfxStar .5s cubic-bezier(.2,1.6,.4,1) forwards}
.rfx .rfx-name{display:inline-block;opacity:0;animation:rfxName 1.4s ease forwards;text-shadow:0 0 0 rgba(255,226,160,0)}
.rfx button{opacity:0;animation:rfxIn .8s ease forwards}
#defeat.rfx{animation:rfxDesat 3s ease both}
@keyframes rfxKick{from{opacity:0;letter-spacing:.8em}to{opacity:1}}
@keyframes rfxCh{to{opacity:1;transform:none;filter:none}}
@keyframes rfxIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes rfxStar{to{opacity:1;transform:none}}
@keyframes rfxName{0%{opacity:0;text-shadow:0 0 22px rgba(255,226,160,1)}40%{opacity:1;text-shadow:0 0 18px rgba(255,226,160,.9)}100%{opacity:1;text-shadow:0 0 6px rgba(255,226,160,.35)}}
@keyframes rfxDesat{from{backdrop-filter:saturate(1)}to{backdrop-filter:saturate(.35) brightness(.8)}}
`;

function particles(el, kind) {
  const c = document.createElement('canvas'); c.className = 'rfx-canvas'; el.prepend(c);
  const g = c.getContext('2d'), dpr = Math.min(1.5, devicePixelRatio || 1);
  const P = [], N = kind === 'defeat' ? 40 : 34, R = (a, b) => a + Math.random() * (b - a);
  const cols = kind === 'defeat' ? ['#8fa6dc', '#c8d4f0'] : ['#e8a050', '#d86a2a', '#f0c070', '#fff0c8'];
  let W = 0, H = 0, raf = 0, last = performance.now();
  const size = () => { W = el.clientWidth; H = el.clientHeight; c.width = W * dpr; c.height = H * dpr; };
  size();
  for (let i = 0; i < N; i++) P.push({ x: R(0, W), y: R(0, H), vx: R(-12, 6), vy: kind === 'defeat' ? R(-14, -4) : R(10, 26), r: R(1.2, 3.4), a: R(0, 6.3), s: R(1, 3), c: cols[i % cols.length] });
  const tick = (now) => {
    if (el.classList.contains('hidden')) { cancelAnimationFrame(raf); c.remove(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (const p of P) {
      p.x += (p.vx + Math.sin(now / 900 + p.a) * 10) * dt; p.y += p.vy * dt;
      if (p.y > H + 10) p.y = -10; if (p.y < -10) p.y = H + 10; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      g.globalAlpha = kind === 'defeat' ? 0.45 : 0.75; g.fillStyle = p.c;
      g.save(); g.translate(p.x, p.y); g.rotate(now / 1000 * p.s + p.a);
      if (kind === 'defeat') { g.beginPath(); g.arc(0, 0, p.r * 0.7, 0, 6.3); g.fill(); }
      else { g.scale(1, 0.45 + 0.4 * Math.sin(now / 300 * p.s + p.a)); g.beginPath(); g.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, 6.3); g.fill(); }
      g.restore();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function play(el) {
  el.classList.remove('rfx'); void el.offsetWidth; el.classList.add('rfx');
  const kind = el.id === 'defeat' ? 'defeat' : 'win';
  el.querySelectorAll('.rfx-canvas').forEach(c => c.remove());
  particles(el, kind);
  let t = 0.5;
  const h2 = el.querySelector('h2');
  if (h2) {
    const txt = h2.dataset.txt || h2.textContent; h2.dataset.txt = txt;
    h2.innerHTML = [...txt].map((ch, i) => `<span class="ch" style="animation-delay:${(t + i * 0.045).toFixed(3)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
    t += txt.length * 0.045 + 0.35;
  }
  const stars = el.querySelector('#stars');
  if (stars && stars.textContent) {
    const s = stars.textContent;
    stars.innerHTML = [...s].map((ch, i) => `<span class="rfx-star" style="animation-delay:${(t + i * 0.32).toFixed(2)}s">${ch}</span>`).join('');
    [...s].forEach((ch, i) => setTimeout(() => { if (ch === '★') sfx.perfect && sfx.perfect(); else sfx.tick && sfx.tick(); }, (t + i * 0.32) * 1000));
    t += s.length * 0.32 + 0.3;
  }
  const fallen = el.querySelector('#fallen');
  if (fallen) {
    fallen.classList.add('rfx-in'); fallen.style.animationDelay = `${t}s`;
    const b = fallen.querySelector('b');
    if (b) {
      const names = (b.dataset.txt || b.textContent).split(/,\s*/); b.dataset.txt = names.join(', ');
      b.innerHTML = names.map((n, i) => `<span class="rfx-name" style="animation-delay:${(t + 0.6 + i * 0.7).toFixed(2)}s">${n}</span>`).join(', ');
      names.forEach((_, i) => setTimeout(() => sfx.spirit && sfx.spirit(), (t + 0.6 + i * 0.7) * 1000));
      t += 0.6 + names.length * 0.7;
    }
  }
  el.querySelectorAll('p').forEach(p => { p.classList.add('rfx-in'); p.style.animationDelay = `${t}s`; t += 0.4; });
  el.querySelectorAll('button').forEach((bt, i) => { bt.style.animationDelay = `${t + 0.3 + i * 0.15}s`; });
  if (kind === 'defeat') { sfx.heartbeat && sfx.heartbeat(); setTimeout(() => sfx.heartbeat && sfx.heartbeat(), 1400); }
}

let installed = false;
export function installResultFx() {
  if (installed || typeof document === 'undefined') return; installed = true;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  for (const id of ['result', 'result1', 'defeat']) {
    const el = document.getElementById(id); if (!el) continue;
    let was = !el.classList.contains('hidden');
    new MutationObserver(() => { const vis = !el.classList.contains('hidden'); if (vis && !was) play(el); was = vis; }).observe(el, { attributes: true, attributeFilter: ['class'] });
  }
}
