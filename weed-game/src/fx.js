// Tehosteet: kipinät/pöly-partikkelit, iskurenkaat, Battōga-kaari, hengen valot, välähdys, speed-linet.
import * as THREE from 'three';
import { E, shake } from './engine.js';
import { glowTexture } from './dogs.js';

const parts = [];
const pool = [];

function getSprite(additive) {
  let s = pool.find(p => !p.visible && p.userData.add === additive);
  if (!s) {
    s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
    s.userData.add = additive;
    pool.push(s); E.scene.add(s);
  }
  s.visible = true;
  return s;
}

/** Partikkelipurske. */
export function burst(pos, o = {}) {
  const { count = 16, color = 0xffd27a, speed = 4, life = 0.6, size = 0.35, gravity = -6, additive = true, spread = 1, up = 1.5 } = o;
  const n = E.lowFx ? Math.ceil(count / 2) : count;
  for (let i = 0; i < n; i++) {
    const s = getSprite(additive);
    s.material.color.set(color);
    s.material.opacity = 1;
    s.position.copy(pos);
    const a = Math.random() * Math.PI * 2;
    const v = new THREE.Vector3(Math.cos(a) * spread, Math.random() * up + 0.2, (Math.random() - 0.5) * spread).multiplyScalar(speed * (0.4 + Math.random() * 0.8));
    parts.push({ s, v, life, t: 0, size: size * (0.6 + Math.random() * 0.8), gravity });
  }
}

export function dust(pos, big = false) {
  burst(pos, { count: big ? 40 : 14, color: 0x9aa3b8, speed: big ? 5 : 2.5, life: big ? 1.6 : 0.9, size: big ? 1.6 : 0.7, gravity: 0.6, additive: false, up: 0.6 });
}

/** Laajeneva iskurengas. */
export function ring(pos, color = 0xffffff, maxR = 3, dur = 0.45) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.position.copy(pos); E.scene.add(m);
  parts.push({ mesh: m, t: 0, life: dur, maxR });
}

/** Battōgan hehkuva kaari (puolikas torus) hahmon ympärillä. */
export function slashArc(center, color = 0xbfe4ff, radius = 1.6, dur = 0.55, rot = 0) {
  const geo = new THREE.TorusGeometry(radius, 0.12, 6, 64, Math.PI * 1.5);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.position.copy(center); m.rotation.z = rot;
  E.scene.add(m);
  parts.push({ mesh: m, t: 0, life: dur, spinArc: true });
  return m;
}

/** Nouseva hengen valo (kaatuneen toverin muisto). */
export function spiritLight(pos, color = 0xbfe0ff, dur = 4) {
  const s = getSprite(true);
  s.material.color.set(color); s.material.opacity = 0;
  s.position.copy(pos);
  parts.push({ s, spirit: true, t: 0, life: dur, base: pos.clone(), size: 0.9 });
  return s;
}

export function flash(color = '#fff', dur = 0.25, peak = 0.9) {
  const el = document.getElementById('flash');
  el.style.transition = 'none'; el.style.background = color; el.style.opacity = peak;
  requestAnimationFrame(() => { el.style.transition = `opacity ${dur}s ease-out`; el.style.opacity = 0; });
}

export function hitStop(s = 0.08) {
  const prev = E.timeScale; E.timeScale = 0.05;
  setTimeout(() => { if (E.timeScale === 0.05) E.timeScale = prev; }, s * 1000);
}

export function impact(pos, strong = false) {
  burst(pos, { count: strong ? 30 : 14, color: 0xfff1c0, speed: strong ? 7 : 4.5, size: strong ? 0.5 : 0.35, life: 0.45 });
  ring(pos, 0xffffff, strong ? 4 : 2.2, 0.35);
  shake(strong ? 0.5 : 0.18);
}

// Speed-linet 2D-overlaylla
let speed = 0;
export function speedLines(v) { speed = v; }
let ctx2d = null;
export function setOverlay(c) { ctx2d = c; }

E.updaters.add((dt, dtr) => {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    const k = p.t / p.life;
    if (p.mesh) {
      if (p.spinArc) {
        p.mesh.rotation.z -= dt * 14;
        p.mesh.material.opacity = 1 - k;
        p.mesh.scale.setScalar(1 + k * 0.4);
      } else {
        const r = 0.2 + p.maxR * EASEOUT(k);
        p.mesh.scale.setScalar(r); p.mesh.material.opacity = 1 - k;
      }
      if (k >= 1) { E.scene.remove(p.mesh); p.mesh.geometry.dispose(); parts.splice(i, 1); }
      continue;
    }
    if (p.spirit) {
      const a = Math.min(1, p.t / 0.8) * (1 - Math.max(0, (k - 0.7) / 0.3));
      p.s.material.opacity = a;
      p.s.position.set(p.base.x + Math.sin(p.t * 2) * 0.25, p.base.y + p.t * 1.3, p.base.z);
      p.s.scale.setScalar(p.size * (1 + Math.sin(p.t * 5) * 0.1));
      if (k >= 1) { p.s.visible = false; parts.splice(i, 1); }
      continue;
    }
    p.v.y += p.gravity * dt;
    p.s.position.addScaledVector(p.v, dt);
    p.s.material.opacity = 1 - k;
    p.s.scale.setScalar(p.size * (p.s.userData.add ? (1 - k * 0.5) : (1 + k)));
    if (k >= 1) { p.s.visible = false; parts.splice(i, 1); }
  }
  // speed-linet
  if (ctx2d) {
    const c = ctx2d.canvas;
    if (speed > 0.01) {
      ctx2d.save();
      const cx = c.width / 2, cy = c.height / 2;
      ctx2d.strokeStyle = `rgba(230,240,255,${0.35 * speed})`;
      ctx2d.lineWidth = 2 * (window.devicePixelRatio || 1);
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2;
        const r0 = (0.35 + Math.random() * 0.2) * c.width, r1 = r0 + c.width * (0.2 + Math.random() * 0.4);
        ctx2d.beginPath(); ctx2d.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.6);
        ctx2d.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.6); ctx2d.stroke();
      }
      ctx2d.restore();
    }
  }
});

function EASEOUT(t) { return 1 - Math.pow(1 - t, 3); }
