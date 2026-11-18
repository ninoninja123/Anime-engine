// Eleohjaus: napautus = purenta, pyyhkäisy = väistö/hyppy, kaaren piirto = Battōga.
// Toimii kosketuksella ja hiirellä (pointer events). Piirtää eleen jäljen overlay-canvasille.
const listeners = new Set();
export function onGesture(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(g) { for (const l of listeners) l(g); }

let trail = [];      // {x,y,t} näytettävä jälki
export let enabled = true;
export function setInputEnabled(v) { enabled = v; }

export function initInput(el, overlay) {
  const ctx = overlay.getContext('2d');
  const resize = () => {
    const d = window.devicePixelRatio || 1;
    overlay.width = window.innerWidth * d; overlay.height = window.innerHeight * d;
  };
  window.addEventListener('resize', resize); resize();

  let stroke = null;
  el.addEventListener('pointerdown', e => {
    if (!enabled) return;
    stroke = { pts: [{ x: e.clientX, y: e.clientY, t: performance.now() }], id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
  });
  el.addEventListener('pointermove', e => {
    if (!stroke || stroke.id !== e.pointerId) return;
    const p = { x: e.clientX, y: e.clientY, t: performance.now() };
    stroke.pts.push(p); trail.push(p);
  });
  const end = e => {
    if (!stroke || stroke.id !== e.pointerId) return;
    stroke.pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    const g = classify(stroke.pts);
    stroke = null;
    if (g && enabled) emit(g);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => { stroke = null; });

  // jäljen piirto
  const draw = () => {
    const now = performance.now();
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    trail = trail.filter(p => now - p.t < 260);
    if (trail.length > 1) {
      const d = window.devicePixelRatio || 1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        trail.forEach((p, i) => i ? ctx.lineTo(p.x * d, p.y * d) : ctx.moveTo(p.x * d, p.y * d));
        ctx.strokeStyle = pass ? 'rgba(255,255,255,0.95)' : 'rgba(120,190,255,0.45)';
        ctx.lineWidth = (pass ? 4 : 14) * d;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

export function classify(pts) {
  const a = pts[0], b = pts[pts.length - 1];
  const dur = b.t - a.t;
  let len = 0, turn = 0, prevAng = null;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
    const l = Math.hypot(dx, dy); len += l;
    if (l > 4) {
      const ang = Math.atan2(dy, dx);
      if (prevAng !== null) { let d = ang - prevAng; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn += d; }
      prevAng = ang;
    }
  }
  const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
  if (len < 22 && dur < 450) return { type: 'tap', x: b.x, y: b.y };
  // kaari: riittävä pituus ja kääntyminen (> ~150°)
  if (len > 140 && Math.abs(turn) > 2.6) return { type: 'arc', turn, len };
  if (dist > 35) {
    if (Math.abs(dx) > Math.abs(dy)) return { type: 'swipe', dir: dx > 0 ? 'right' : 'left' };
    return { type: 'swipe', dir: dy < 0 ? 'up' : 'down' };
  }
  return { type: 'tap', x: b.x, y: b.y };
}
