// Tehosteet. Julkinen rajapinta (ennallaan): burst, dust, ring, slashArc, spiritLight, flash, hitStop, impact,
// speedLines, setOverlay.  Uudet: afterimage, lightPillar, hitStar, breath, embers, debris, mistPlume, spiritGhost.
// Toteutus: kaksi GPU-pistepilveä (additiivinen + savu) objektipoolina, poolatut shader-neliöt (shokkiaallot,
// valopallot, valopilarit, iskutähdet), instansoitu kivimurska, bakatut kuvajäljet (afterimage) ja
// henkisiluetit (jakavat hahmon geometrian ja vertex-rigin). Ei per-frame-allokaatioita.
import * as THREE from 'three';
import { E, shake } from './engine.js';
import { Q } from './gfx/quality.js';
import { post } from './gfx/post.js';
import { mood, setMood } from './gfx/mood.js';
import { toonShared } from './gfx/toon.js';

const OUT = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';
const _c = new THREE.Color(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const rnd = (a = 1) => (Math.random() - 0.5) * 2 * a;

// =====================================================================
//                         partikkelipoolit
// =====================================================================
class Pool {
  constructor(max, additive) {
    this.max = max; this.n = 0; this.additive = additive;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.age = new Float32Array(max); this.life = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.a0 = new Float32Array(max);
    this.grav = new Float32Array(max); this.drag = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uPointScale: toonShared.uPointScale, uLight: { value: new THREE.Color(1, 1, 1) } },
      vertexShader: `attribute vec4 aColor; attribute float aSize; uniform float uPointScale; varying vec4 vC;
        void main(){ vC = aColor; vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = min(aSize * uPointScale / max(-mv.z, 0.3), 300.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: additive
        ? `varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard;
            float a = pow(1.0 - d, 2.2) + exp(-d * d * 30.0) * 0.6; gl_FragColor = vec4(vC.rgb * 1.8, a * vC.a); ${OUT} }`
        : `uniform vec3 uLight; varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard;
            float a = smoothstep(1.0, 0.15, d); gl_FragColor = vec4(vC.rgb * uLight * (1.05 - d * 0.25), a * a * vC.a); ${OUT} }`,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false; this.points.renderOrder = additive ? 8 : 6;
    this.geo = g;
  }
  spawn(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, grav = 0, drag = 0) {
    let i = this.n;
    if (i >= this.max) i = (Math.random() * this.max) | 0; else this.n++;
    const i3 = i * 3, i4 = i * 4;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i4] = r; this.col[i4 + 1] = g; this.col[i4 + 2] = b; this.col[i4 + 3] = 0;
    this.age[i] = 0; this.life[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = a; this.grav[i] = grav; this.drag[i] = drag;
    this.size[i] = s0;
  }
  update(dt) {
    const { pos, vel, col, size, age, life, s0, s1, a0, grav, drag } = this;
    let n = this.n;
    for (let i = 0; i < n;) {
      age[i] += dt;
      if (age[i] >= life[i]) {
        n--;
        if (i !== n) {
          const a3 = i * 3, b3 = n * 3, a4 = i * 4, b4 = n * 4;
          pos[a3] = pos[b3]; pos[a3 + 1] = pos[b3 + 1]; pos[a3 + 2] = pos[b3 + 2];
          vel[a3] = vel[b3]; vel[a3 + 1] = vel[b3 + 1]; vel[a3 + 2] = vel[b3 + 2];
          col[a4] = col[b4]; col[a4 + 1] = col[b4 + 1]; col[a4 + 2] = col[b4 + 2]; col[a4 + 3] = col[b4 + 3];
          age[i] = age[n]; life[i] = life[n]; s0[i] = s0[n]; s1[i] = s1[n]; a0[i] = a0[n]; grav[i] = grav[n]; drag[i] = drag[n]; size[i] = size[n];
        }
        continue;
      }
      const i3 = i * 3, k = age[i] / life[i];
      vel[i3 + 1] += grav[i] * dt;
      const dr = Math.max(0, 1 - drag[i] * dt);
      vel[i3] *= dr; vel[i3 + 1] *= dr; vel[i3 + 2] *= dr;
      pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
      if (grav[i] < -3 && pos[i3 + 1] < 0.03 && vel[i3 + 1] < 0) { pos[i3 + 1] = 0.03; vel[i3 + 1] *= -0.35; vel[i3] *= 0.6; vel[i3 + 2] *= 0.6; }
      size[i] = s0[i] + (s1[i] - s0[i]) * k;
      col[i * 4 + 3] = a0[i] * Math.min(1, k * 10) * (1 - k) * (1 - k * 0.3);
      i++;
    }
    this.n = n;
    const g = this.geo;
    g.setDrawRange(0, n);
    if (n > 0) {
      g.attributes.position.needsUpdate = true; g.attributes.aColor.needsUpdate = true; g.attributes.aSize.needsUpdate = true;
    }
  }
}

let glow = null, smoke = null, quads = [], debrisMesh = null, debris = [], inited = false;
const QUAD_FS = `
uniform vec3 uColor; uniform float uAlpha, uMode; varying vec2 vUv;
void main(){
  vec2 p = vUv * 2.0 - 1.0; float r = length(p); float a = 0.0; vec3 c = uColor;
  if (uMode < 0.5) {                                   // shokkiaalto
    float edge = smoothstep(0.80, 0.94, r) * smoothstep(1.0, 0.95, r);
    float trail = smoothstep(0.35, 0.94, r) * smoothstep(1.0, 0.94, r) * 0.22;
    a = edge + trail; c = mix(uColor, vec3(1.0), edge * 0.6);
  } else if (uMode < 1.5) {                            // valopallo + ristisäde
    float g = exp(-r * r * 7.0), core = exp(-r * r * 60.0);
    float fl = exp(-abs(p.y) * 40.0) * exp(-abs(p.x) * 3.0) + exp(-abs(p.x) * 40.0) * exp(-abs(p.y) * 3.0);
    a = (g * 0.7 + core + fl * 0.5) * smoothstep(1.0, 0.7, r); c = mix(uColor, vec3(1.0), core);
  } else if (uMode < 2.5) {                            // valopilari
    float w = exp(-p.x * p.x * 9.0) + exp(-p.x * p.x * 140.0) * 0.8;
    a = w * smoothstep(0.0, 0.07, vUv.y) * pow(1.0 - vUv.y, 1.3);
  } else if (uMode < 3.5) {                            // iskutähti
    float s1 = max(0.0, 1.0 - abs(p.x) * abs(p.y) * 60.0 - r * 0.9);
    vec2 q = vec2(p.x + p.y, p.x - p.y) * 0.7071;
    float s2 = max(0.0, 1.0 - abs(q.x) * abs(q.y) * 140.0 - r * 1.6);
    a = s1 + s2 * 0.7 + exp(-r * r * 18.0); c = mix(uColor, vec3(1.0), clamp(a - 0.4, 0.0, 1.0));
  } else {                                             // Battōga-viilto (rengassektori)
    float ang = atan(p.y, p.x); if (ang < 0.0) ang += 6.28318;
    float t = ang / 4.71239;                           // 0..1 kaaren matkalla (pää = 1)
    float width = 0.05 + 0.2 * t * t;
    float rad = (1.0 - r) / width;
    float band = step(0.0, rad) * step(rad, 1.0) * sin(clamp(rad, 0.0, 1.0) * 3.14159);
    a = band * smoothstep(0.0, 0.2, t) * step(t, 1.0) * (0.25 + 0.75 * t * t);
    c = mix(uColor, vec3(1.0), smoothstep(0.5, 1.0, t) * band);
  }
  gl_FragColor = vec4(c * 1.7, clamp(a, 0.0, 1.0) * uAlpha); ${OUT}
}`;

function init() {
  if (inited || !E.scene) return inited;
  inited = true;
  glow = new Pool(Math.round(900 * Math.max(0.6, Q.particles)), true);
  smoke = new Pool(Math.round(420 * Math.max(0.6, Q.particles)), false);
  E.scene.add(glow.points, smoke.points);
  const geo = new THREE.PlaneGeometry(2, 2);
  for (let i = 0; i < 28; i++) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color() }, uAlpha: { value: 0 }, uMode: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: QUAD_FS,
    });
    const m = new THREE.Mesh(geo, mat); m.visible = false; m.frustumCulled = false; m.renderOrder = 9;
    m.userData.noGfx = true; E.scene.add(m);
    quads.push({ m, mat, on: false });
  }
  // kivimurska (instansoitu)
  const dg = new THREE.DodecahedronGeometry(1, 0);
  debrisMesh = new THREE.InstancedMesh(dg, new THREE.MeshLambertMaterial({ color: 0x5a6384, flatShading: true }), 48);
  debrisMesh.count = 0; debrisMesh.frustumCulled = false; debrisMesh.castShadow = false; debrisMesh.userData.noGfx = true;
  E.scene.add(debrisMesh);
  return true;
}

function quad(mode, pos, color, o) {
  if (!init()) return null;
  let q = quads.find(k => !k.on);
  if (!q) { q = quads[0]; for (const k of quads) if (k.t / k.life > q.t / q.life) q = k; }
  q.on = true; q.t = 0; q.life = o.life || 0.5; q.mode = mode;
  q.s0 = o.s0 ?? 0.2; q.s1 = o.s1 ?? 2; q.sy = o.sy || 0; q.alpha = o.alpha ?? 1; q.rise = o.rise || 0; q.spin = o.spin || 0;
  q.fadeIn = o.fadeIn || 0; q.real = !!o.real; q.ease = o.ease !== false; q.billboard = !!o.billboard; q.ground = !!o.ground; q.wobble = o.wobble || 0;
  q.m.position.copy(pos); q.base = q.base || new THREE.Vector3(); q.base.copy(pos);
  q.m.rotation.set(q.ground ? -Math.PI / 2 : 0, 0, o.rot || 0);
  q.mat.uniforms.uMode.value = mode; q.mat.uniforms.uColor.value.set(color); q.mat.uniforms.uAlpha.value = 0;
  q.mat.depthTest = o.depthTest !== false;
  q.m.scale.setScalar(q.s0); q.m.visible = true;
  return q;
}

// =====================================================================
//                         julkinen rajapinta
// =====================================================================
/** Partikkelipurske. */
export function burst(pos, o = {}) {
  if (!init()) return;
  const { count = 16, color = 0xffd27a, speed = 4, life = 0.6, size = 0.35, gravity = -6, additive = true, spread = 1, up = 1.5 } = o;
  const n = Math.max(1, Math.ceil(count * Q.particles));
  _c.set(color);
  const pool = additive ? glow : smoke;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = speed * (0.4 + Math.random() * 0.8);
    const s = size * (0.5 + Math.random() * 0.9);
    pool.spawn(pos.x, pos.y, pos.z, Math.cos(a) * spread * sp, (Math.random() * up + 0.2) * sp, rnd(0.5) * spread * sp,
      life * (0.7 + Math.random() * 0.6), s, additive ? s * 0.3 : s * 2.2, _c.r, _c.g, _c.b, additive ? 1 : 0.6, gravity, additive ? 1.2 : 1.6);
  }
  if (additive) {   // muutama kuuma kipinä
    const k = Math.ceil(n * 0.4);
    for (let i = 0; i < k; i++) {
      const a = Math.random() * Math.PI * 2, sp = speed * (1 + Math.random());
      glow.spawn(pos.x, pos.y, pos.z, Math.cos(a) * sp, Math.abs(Math.sin(a)) * sp + 1, rnd(1.5), life * 1.3, size * 0.16, size * 0.05, 1, 0.95, 0.8, 1, -14, 0.4);
    }
  }
}

/** Lumipöly / pölypilvi. big = raskas tömähdys (myös kivimurska ja maa-aalto). */
export function dust(pos, big = false) {
  if (!init()) return;
  const n = Math.ceil((big ? 16 : 6) * Q.particles), m = mood.cur.dustCol;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = (big ? 3.4 : 1.6) * (0.4 + Math.random());
    const s = (big ? 0.9 : 0.4) * (0.6 + Math.random() * 0.8);
    smoke.spawn(pos.x + rnd(0.3), Math.max(0.1, pos.y) + Math.random() * 0.3, pos.z + rnd(0.3), Math.cos(a) * sp, 0.5 + Math.random() * (big ? 2.2 : 1), Math.sin(a) * sp * 0.5,
      (big ? 1.7 : 0.9) * (0.7 + Math.random() * 0.6), s, s * 3, m.r, m.g, m.b, big ? 0.5 : 0.4, 0.4, 2.2);
  }
  const k = Math.ceil((big ? 18 : 6) * Q.particles);   // lumikokkareet
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2, sp = (big ? 5 : 2.6) * (0.3 + Math.random());
    smoke.spawn(pos.x, Math.max(0.05, pos.y), pos.z, Math.cos(a) * sp, 1.5 + Math.random() * (big ? 5 : 2.5), Math.sin(a) * sp * 0.5,
      0.7 + Math.random() * 0.5, 0.07 + Math.random() * 0.07, 0.03, m.r * 1.15, m.g * 1.15, m.b * 1.15, 0.95, -13, 0.3);
  }
  if (big) {
    quad(0, _v.set(pos.x, 0.06, pos.z), 0xe8e4d8, { ground: true, s0: 0.4, s1: 4.2, life: 0.55, alpha: 0.55 });
    spawnDebris(pos, 7);
    post.ca = Math.max(post.ca, 0.008);
  }
}

/** Laajeneva shokkiaalto. */
export function ring(pos, color = 0xffffff, maxR = 3, dur = 0.45) {
  quad(0, pos, color, { s0: 0.2, s1: maxR, life: dur, alpha: 1 });
  if (maxR >= 4) quad(0, pos, 0xffffff, { s0: 0.1, s1: maxR * 0.62, life: dur * 0.8, alpha: 0.6 });
  if (maxR >= 6) {            // suuri isku: valopilari + tähti + maa-aalto
    lightPillar(_v.set(pos.x, 0, pos.z), color, 1.2, 9);
    hitStar(pos, 0xffffff, maxR * 0.9);
    quad(0, _v.set(pos.x, 0.07, pos.z), color, { ground: true, s0: 0.5, s1: maxR * 1.5, life: dur * 1.3, alpha: 0.8 });
  }
}

/** Battōgan viilto: kaksi pyörivää valokaarta + ilmavirran kipinät. */
export function slashArc(center, color = 0xbfe4ff, radius = 1.6, dur = 0.55, rot = 0) {
  const q = quad(4, center, color, { s0: radius * 1.05, s1: radius * 1.5, life: dur, alpha: 0.95, rot, spin: -14, ease: false });
  quad(4, center, 0xffffff, { s0: radius * 0.7, s1: radius * 1.05, life: dur * 0.8, alpha: 0.6, rot: rot + 2.4, spin: -19, ease: false });
  if (init()) {
    _c.set(color);
    const n = Math.ceil(10 * Q.particles);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rr = radius * (0.8 + Math.random() * 0.4);
      glow.spawn(center.x + Math.cos(a) * rr, center.y + Math.sin(a) * rr, center.z + rnd(0.2), -Math.sin(a) * 5, Math.cos(a) * 5, 0,
        0.35 + Math.random() * 0.3, 0.14, 0.03, _c.r, _c.g, _c.b, 1, 0, 2.5);
    }
  }
  // finaalin Battōga: taivas syttyy
  const S = window.__S;
  if (S && S.cutscene && S.phase === 3 && mood.name !== 'finale') setMood('finale', 1.2);
  return q ? q.m : null;
}

/** Valopilari maasta taivaaseen. */
export function lightPillar(pos, color = 0xbfe0ff, dur = 3, height = 12, width = 1.3) {
  const q = quad(2, _v2.set(pos.x, pos.y + height / 2, pos.z), color, { s0: 1, s1: 1, life: dur, alpha: 0.75, fadeIn: Math.min(0.6, dur * 0.3), real: true, billboard: false });
  if (q) { q.sx = width; q.sy = height / 2; q.m.scale.set(width, height / 2, 1); }
  return q ? q.m : null;
}

/** Anime-iskutähti (terävä ristivälähdys). */
export function hitStar(pos, color = 0xfff4d0, size = 1.6) {
  quad(3, pos, color, { s0: size * 0.5, s1: size * 1.25, life: 0.16, alpha: 1, rot: Math.random() * 0.8, depthTest: false, real: true });
}

/** Nouseva hengen valo (kaatuneen toverin muisto): valopallo, valopilari, kipinät ja henkisiluetti. */
export function spiritLight(pos, color = 0xbfe0ff, dur = 4) {
  if (!init()) return null;
  const q = quad(1, pos, color, { s0: 0.75, s1: 1.15, life: dur, alpha: 1, fadeIn: 0.8, rise: 1.3, wobble: 0.25, real: false, billboard: true, ease: false });
  if (q) q.sparkle = color;
  lightPillar(_v.set(pos.x, 0, pos.z), color, dur * 0.9, 13, 0.9);
  // lähin kaatunut koira -> henki nousee ruumiista
  const dog = nearestDog(pos, 1.4);
  if (dog && dog.id !== 'weed' && dog.id !== 'kaibutsu') spiritGhost(dog, color, dur);
  // tunnelma: suru / henget / muistohetki
  const now = E.realTime, quick = now - lastSpirit < 2.5; lastSpirit = now;
  if (mood.name === 'dawn') { if (quick) setMood('memorial', 3); }     // useita henkiä peräkkäin = muistohetki
  else if (mood.name === 'rage' || mood.name === 'night') setMood('grief', 2.5);
  else if (mood.name === 'storm') setMood('spirit', 3);
  return q ? q.m : null;
}

export function flash(color = '#fff', dur = 0.25, peak = 0.9) {
  const el = document.getElementById('flash');
  if (el) {
    el.style.transition = 'none'; el.style.background = color; el.style.opacity = Q.post ? peak * 0.75 : peak;
    requestAnimationFrame(() => { el.style.transition = `opacity ${dur}s ease-out`; el.style.opacity = 0; });
  }
  _c.set(color);
  post.bloomKick = Math.max(post.bloomKick, peak * 1.2);
  post.ca = Math.max(post.ca, peak * 0.014);
  if (peak >= 0.8) post.impactT = 0.07;                         // anime impact frame
  if (_c.r > 0.9 && _c.b < 0.5 && mood.name === 'grief') setMood('storm', 0.8);   // hirviö nousee
}

export function hitStop(s = 0.08) {
  const prev = E.timeScale; E.timeScale = 0.05;
  setTimeout(() => { if (E.timeScale === 0.05) E.timeScale = prev; }, s * 1000);
}

export function impact(pos, strong = false) {
  burst(pos, { count: strong ? 26 : 12, color: 0xfff1c0, speed: strong ? 7 : 4.5, size: strong ? 0.42 : 0.3, life: 0.45 });
  ring(pos, 0xffffff, strong ? 4 : 2.2, 0.35);
  hitStar(pos, 0xfff4d0, strong ? 2.6 : 1.5);
  shake(strong ? 0.5 : 0.18);
  post.ca = Math.max(post.ca, strong ? 0.02 : 0.009);
  post.bloomKick = Math.max(post.bloomKick, strong ? 0.9 : 0.3);
  if (strong) post.impactT = 0.05;
}

/** Hengityshöyry (kutsutaan automaattisesti näkyville koirille). */
export function breath(pos, dirX = 1) {
  if (!init()) return;
  for (let i = 0; i < 3; i++) smoke.spawn(pos.x + dirX * 0.05, pos.y, pos.z, dirX * (0.5 + Math.random() * 0.4), 0.12 + Math.random() * 0.15, rnd(0.08),
    0.9 + Math.random() * 0.5, 0.06, 0.3 + Math.random() * 0.15, 1, 1, 1, 0.3, 0.12, 1.6);
}

/** Nousevat kekäleet (raivo). */
export function embers(pos, count = 4, color = 0xff6a30, radius = 1.2) {
  if (!init()) return;
  _c.set(color);
  for (let i = 0; i < count; i++) glow.spawn(pos.x + rnd(radius), pos.y + Math.random() * radius, pos.z + rnd(radius * 0.5), rnd(0.5), 0.8 + Math.random() * 1.4, rnd(0.3),
    0.9 + Math.random() * 0.8, 0.07 + Math.random() * 0.07, 0.02, _c.r, _c.g, _c.b, 1, 0.5, 0.5);
}

/** Usva-/vesipilvi (rotko, vesiputous). */
export function mistPlume(pos, count = 6, spread = 1.5) {
  if (!init()) return;
  const m = mood.cur.mistCol;
  for (let i = 0; i < count; i++) smoke.spawn(pos.x + rnd(spread), pos.y + Math.random() * 0.6, pos.z + rnd(spread * 0.6), rnd(0.7), 0.6 + Math.random() * 1.5, rnd(0.3),
    1.8 + Math.random() * 1.2, 0.9 + Math.random() * 0.7, 3.2 + Math.random() * 1.5, m.r, m.g, m.b, 0.42, 0.1, 0.9);
}

function spawnDebris(pos, n) {
  for (let i = 0; i < n; i++) {
    let d = debris.find(k => !k.on);
    if (!d) { if (debris.length >= 48) return; d = { p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Vector3(), w: new THREE.Vector3() }; debris.push(d); }
    d.on = true; d.t = 0; d.life = 1.6 + Math.random() * 1.2; d.s = 0.07 + Math.random() * 0.16;
    d.p.set(pos.x + rnd(0.5), Math.max(0.2, pos.y), pos.z + rnd(0.5));
    d.v.set(rnd(4), 3 + Math.random() * 5, rnd(2)); d.r.set(rnd(3), rnd(3), rnd(3)); d.w.set(rnd(9), rnd(9), rnd(9));
  }
}
export function debrisBurst(pos, n = 10) { if (init()) spawnDebris(pos, n); }

// ---------- hehkuvat kopiot hahmosta: henkisiluetti (elävä, nousee) ja kuvajälki (jäädytetty) ----------
// Toimii minkä tahansa hahmototeutuksen kanssa: kopio jakaa lähteen geometrian ja lainaa sen ääriviivakuoren
// vertex-muunnoksen (onBeforeCompile: pehmeä rigi), joten asento seuraa lähdettä ilman CPU-työtä.
const ghostPool = new Map();   // lähdemesh -> vapaat kopiot
const ghosts = [];
function ghostMeshes(root, color) {
  const out = [], srcs = [];
  root.traverse(o => { if (o.isMesh && !o.userData.gfxGhost && o.material && o.material.side === THREE.BackSide && o.material.isMeshBasicMaterial) srcs.push(o); });
  if (!srcs.length) root.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && !o.userData.gfxGhost && o.material && o.material.isMeshToonMaterial) srcs.push(o); });
  for (const src of srcs) {
    let free = ghostPool.get(src);
    if (!free) ghostPool.set(src, (free = []));
    let g = free.pop();
    if (!g) {
      const sm = src.material, shell = sm.side === THREE.BackSide;
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const U = { uGhostOff: { value: new THREE.Vector3() } };
      mat.userData.U = U;
      mat.onBeforeCompile = (sh, r) => {
        if (shell && sm.onBeforeCompile) sm.onBeforeCompile.call(sm, sh, r);
        Object.assign(sh.uniforms, U);
        sh.vertexShader = 'uniform vec3 uGhostOff;\n' + sh.vertexShader.replace('#include <project_vertex>',
          '#include <project_vertex>\n mvPosition.xyz += (viewMatrix * vec4(uGhostOff, 0.0)).xyz; gl_Position = projectionMatrix * mvPosition;');
      };
      const key = 'gfxghost:' + (shell && sm.customProgramCacheKey ? sm.customProgramCacheKey() : 'plain');
      mat.customProgramCacheKey = () => key;
      g = new THREE.Mesh(src.geometry, mat);
      g.matrixAutoUpdate = false; g.frustumCulled = false; g.renderOrder = 7;
      g.userData.gfxGhost = true; g.userData.noGfx = true; g.userData.src = src;
    }
    g.material.color.set(color); g.material.opacity = 0; g.material.userData.U.uGhostOff.value.set(0, 0, 0);
    src.updateWorldMatrix(true, false);
    g.matrix.copy(src.matrixWorld); g.matrixWorldNeedsUpdate = true;
    E.scene.add(g); out.push(g);
  }
  return out;
}

/** Henki nousee hahmosta: läpikuultava hehkuva siluetti, joka seuraa hahmon asentoa ja kohoaa ylös. */
export function spiritGhost(dog, color = 0xbfe0ff, dur = 4) {
  if (!init()) return;
  const meshes = ghostMeshes(dog.root || dog, color);
  if (meshes.length) ghosts.push({ meshes, t: 0, life: dur, live: true, alpha: 0.5 });
}

/** Kuvajälki (afterimage): jäädytetty hehkuva kopio hahmon nykyisestä sijainnista. target = Dog tai Object3D. */
export function afterimage(target, color = 0x8fc8ff, life = 0.32, alpha = 0.5) {
  if (!init() || Q.tier === 'low' || ghosts.length >= 12) return;
  const meshes = ghostMeshes(target.root || target, color);
  if (meshes.length) ghosts.push({ meshes, t: 0, life, live: false, alpha });
}

// Speed-linet: jälkikäsittelyssä (shader) tai low-tasolla 2D-overlaylla
let speed = 0;
export function speedLines(v) { speed = v; }
let ctx2d = null;
export function setOverlay(c) { ctx2d = c; }

// ---------- apurit automaattisille tehosteille ----------
function castMap() { return (window.__game && window.__game.cast) || null; }
function nearestDog(pos, maxD) {
  const cast = castMap(); if (!cast) return null;
  let best = null, bd = maxD;
  for (const id in cast) {
    const d = cast[id]; if (!d || !d.root || !d.root.visible) continue;
    const dist = Math.hypot(d.root.position.x - pos.x, d.root.position.z - pos.z);
    if (dist < bd) { bd = dist; best = d; }
  }
  return best;
}
const dogState = new WeakMap();
let lastSpirit = -99;
function headOf(d) {
  if (d._gfxHead !== undefined) return d._gfxHead;
  let h = d.headPivot || (d.bones && (d.bones.Head || d.bones.head)) || null;
  if (!h && d.root) d.root.traverse(o => { if (!h && o.isBone && /head/i.test(o.name)) h = o; });
  return (d._gfxHead = h);
}
let autoT = 0, fallSplash = false;
function autoFx(dt, dtr) {
  const cast = castMap(); if (!cast) return;
  const S = window.__S;
  autoT += dtr;
  const tick = autoT > 0.05; if (tick) autoT = 0;
  const dc = mood.cur.dustCol;
  // tulikärpäset (kesäillan henget): hitaasti leijuvia valopisteitä areenan ympärillä
  const ff = mood.cur.fireflies;
  if (ff > 0.05 && tick && Math.random() < ff * 0.5) {
    glow.spawn(rnd(11), 0.25 + Math.random() * 2.6, -5 + Math.random() * 8, rnd(0.25), rnd(0.12) + 0.05, rnd(0.15), 2.2 + Math.random() * 2, 0.09, 0.05, 0.75, 1.0, 0.45, 0.9, 0, 0.2);
  }
  for (const id in cast) {
    const d = cast[id];
    if (!d || !d.root || !d.root.visible) continue;
    let st = dogState.get(d);
    if (!st) dogState.set(d, (st = { x: d.root.position.x, breathT: 1 + Math.random() * 3, stepT: 0, afterT: 0 }));
    const p = d.root.position, h = d.height || 1;
    const vx = dt > 0 ? (p.x - st.x) / dt : 0; st.x = p.x;
    // hengityshöyry
    st.breathT -= dt;
    if (st.breathT <= 0 && mood.cur.breath > 0.5) {
      st.breathT = 2.2 + Math.random() * 2.2;
      const head = headOf(d);
      if (head && p.y < 0.3) { const f = d.facingTarget || d.facing || 1; head.getWorldPosition(_v); breath(_v.set(_v.x + f * 0.2 * h, _v.y - 0.02 * h, _v.z), f); }
    }
    // juoksun lumipölly
    st.stepT -= dt;
    if (Math.abs(vx) > 4.5 && p.y < 0.06 && st.stepT <= 0 && Math.abs(vx) < 60) {
      st.stepT = 0.09;
      smoke.spawn(p.x - Math.sign(vx) * 0.3 * h, 0.08, p.z + rnd(0.15), -Math.sign(vx) * 0.8, 0.6 + Math.random() * 0.6, rnd(0.3), 0.6, 0.18 * h, 0.7 * h, dc.r, dc.g, dc.b, 0.38, 0.3, 2);
      if (id === 'kaibutsu') smoke.spawn(p.x, 0.1, p.z + rnd(0.5), rnd(1), 1.2, rnd(0.4), 0.9, 0.5, 1.8, dc.r, dc.g, dc.b, 0.4, 0.3, 2);
    }
    // kuvajäljet: Weedin Battōga-pyörähdys, hirviön syöksy
    st.afterT -= dtr;
    if (st.afterT <= 0) {
      if (id === 'weed' && d.spin && Math.abs(d.spin.rotation.z) > 0.25) { st.afterT = 0.06; afterimage(d, 0x6fb8ff, 0.3, 0.45); }
      else if (id === 'kaibutsu' && Math.abs(vx) > 9 && Math.abs(vx) < 60) { st.afterT = 0.1; afterimage(d, 0xff4020, 0.24, 0.28); }
    }
    if (id === 'kaibutsu' && tick) {
      // raivon kekäleet
      if (S && S.active && ((S.B && S.B.armored) || S.phase === 2) && p.y > -0.2) embers(_v.set(p.x, 0.3, p.z), 1, 0xff6a30, 1.4);
      // heikko kohta kipinöi
      if (d.weak && d.weakReveal > 0.5 && Math.random() < 0.5) { d.weak.getWorldPosition(_v); glow.spawn(_v.x + rnd(0.25), _v.y + rnd(0.2), _v.z + 0.2, rnd(0.6), 0.5 + Math.random(), 0.3, 0.5, 0.12, 0.02, 1, 0.6, 0.3, 1, 0, 1); }
      // putoaminen rotkoon: usva nielaisee
      if (p.y < -0.25) {
        mistPlume(_v.set(p.x, 0.2, p.z + 0.8), 3, 1.8);
        if (!fallSplash && p.y < -3) { fallSplash = true; mistPlume(_v.set(p.x, 0.5, p.z + 0.5), 14, 2.5); burst(_v.set(p.x, 0.4, p.z + 0.6), { count: 30, color: 0xdfeeff, speed: 6, life: 1.2, size: 0.3, gravity: -5, up: 2.4 }); }
      } else fallSplash = false;
    }
  }
}

function EASEOUT(t) { return 1 - Math.pow(1 - t, 3); }

E.updaters.add((dt, dtr) => {
  if (!init()) return;
  // partikkelit
  glow.update(dt); smoke.update(dt);
  const m = mood.cur;
  smoke.mat.uniforms.uLight.value.copy(m.hemiSky).lerp(m.key, 0.45).multiplyScalar(0.95);
  // neliöt
  for (const q of quads) {
    if (!q.on) continue;
    q.t += q.real ? dtr : dt;
    const k = Math.min(1, q.t / q.life);
    const e = q.ease ? EASEOUT(k) : k;
    let a = q.alpha * (1 - k);
    if (q.fadeIn) a = q.alpha * Math.min(1, q.t / q.fadeIn) * (1 - Math.max(0, (k - 0.7) / 0.3));
    if (q.mode === 3) a = q.alpha * (k < 0.5 ? 1 : 2 - k * 2);
    q.mat.uniforms.uAlpha.value = a;
    const s = q.s0 + (q.s1 - q.s0) * e;
    if (q.mode === 2) q.m.scale.set(q.sx * (1 + Math.sin(q.t * 3) * 0.08), q.sy, 1);
    else q.m.scale.setScalar(s);
    if (q.spin) q.m.rotation.z += q.spin * dt;
    if (q.rise) q.m.position.set(q.base.x + Math.sin(q.t * 2) * q.wobble, q.base.y + q.t * q.rise, q.base.z);
    if (q.billboard) q.m.quaternion.copy(E.camera.quaternion);
    if (q.sparkle && Math.random() < 0.5) {
      _c.set(q.sparkle);
      glow.spawn(q.m.position.x + rnd(0.3), q.m.position.y + rnd(0.3), q.m.position.z, rnd(0.3), -0.3 - Math.random() * 0.5, rnd(0.2), 0.8 + Math.random() * 0.6, 0.1, 0.02, _c.r, _c.g, _c.b, a, 0, 0.5);
    }
    if (k >= 1) { q.on = false; q.m.visible = false; q.sparkle = null; q.sx = 0; }
  }
  // henkisiluetit ja kuvajäljet
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i]; g.t += g.live ? dt : dtr;
    const k = g.t / g.life;
    const a = g.live ? Math.min(1, g.t / 0.9) * (1 - Math.max(0, (k - 0.6) / 0.4)) * g.alpha : g.alpha * (1 - k);
    const rise = g.live ? g.t * g.t * 0.09 + g.t * 0.12 : 0;
    for (const mm of g.meshes) {
      mm.material.opacity = Math.max(0, a);
      if (g.live) {
        const src = mm.userData.src;
        mm.matrix.copy(src.matrixWorld); mm.matrixWorldNeedsUpdate = true;
        mm.material.userData.U.uGhostOff.value.set(Math.sin(g.t * 2.2) * 0.04 * rise, rise, 0);
      }
    }
    if (k >= 1) { for (const mm of g.meshes) { E.scene.remove(mm); ghostPool.get(mm.userData.src).push(mm); } ghosts.splice(i, 1); }
  }
  // kivimurska
  if (debrisMesh) {
    let n = 0;
    for (const d of debris) {
      if (!d.on) continue;
      d.t += dt; if (d.t >= d.life) { d.on = false; continue; }
      d.v.y -= 20 * dt; d.p.addScaledVector(d.v, dt);
      if (d.p.y < d.s * 0.6 && d.v.y < 0) { d.p.y = d.s * 0.6; d.v.y *= -0.38; d.v.x *= 0.7; d.v.z *= 0.7; d.w.multiplyScalar(0.6); }
      d.r.addScaledVector(d.w, dt);
      _dummy.position.copy(d.p); _dummy.rotation.set(d.r.x, d.r.y, d.r.z);
      _dummy.scale.setScalar(d.s * Math.min(1, (d.life - d.t) * 3)); _dummy.updateMatrix();
      debrisMesh.setMatrixAt(n++, _dummy.matrix);
    }
    debrisMesh.count = n; if (n) debrisMesh.instanceMatrix.needsUpdate = true;
  }
  autoFx(dt, dtr);

  // speed-linet
  post.speed += (speed - post.speed) * Math.min(1, dtr * 14);
  if (ctx2d && !Q.post && speed > 0.01) {
    const c = ctx2d.canvas;
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
});
const _dummy = new THREE.Object3D();
