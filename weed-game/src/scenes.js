// Datapohjainen kohtausohjaus (scene script). Kohtaus = taulukko askelia, jotka ajetaan järjestyksessä.
// Askeltyypit (yksi avain per askel + valinnaiset parametrit):
//   { cam: [x,y,z], look: [x,y,z], t: 0|s, ease }      kamera-avainkuva (t=0 = leikkaus)
//   { orbit: 'id'|[x,y,z], from, to, r, h, lookY, t }   kiertävä kamera kohteen ympäri
//   { dolly: 'id', dist, h, side, t }                    nopea dolly hahmon luo (lähikuva)
//   { place: 'id', x, z, y, face, anim, ts, fade }       hahmon asetus
//   { move: 'id', x, z, y, t, anim, ts, ease, after }    hahmon siirto (after = animaatio perillä)
//   { expr: 'id', name } (ilme, null = automaattinen)   { anim: 'id', name, loop, ts }    { face: 'id', dir }    { hide: 'id' }    { fadeOut: 'id', t }
//   { say: 'lineId', hold }   { bark: 'lineId' } (ei odota)   { caption: 'html', t }
//   { wait: s }   { slow: scale } (pelin aikaskaala, palautuu kohtauksen lopussa)   { freeze: s }
//   { music: 'intro'|'battle'|'sad'|'dawn'|null }   { sfx: 'roar' }   { shake: a }
//   { fx: 'flash'|'ring'|'burst'|'impact'|'spirit'|'dust'|'speed'|'arc', at: 'id'|[x,y,z], ... }
//   { light: { rim, fog, exposure, t } }   { par: [step, ...] } (rinnakkain)   { fn: async ctx => ... }
// Hahmoviittaus 'id' = cast[id]; sijainti [x,y,z] tai { at:'id', dx, dy, dz }.
import * as THREE from 'three';
import { E, tween, wait, shake } from './engine.js';
import * as FX from './fx.js';
import { sfx, music, ambience } from './audio.js';
import { setSurface } from './footsteps.js';
import { say } from './voice.js';
import * as UI from './ui.js';

let castRef = {};
export function setSceneCast(c) { castRef = c; }

const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function resolvePos(p, dy = 0) {
  if (Array.isArray(p)) return V(p);
  if (typeof p === 'string') { const d = castRef[p]; return d.root.position.clone().add(new THREE.Vector3(0, d.height * 0.55 + dy, 0)); }
  if (p && p.at) { const d = castRef[p.at]; return d.root.position.clone().add(new THREE.Vector3(p.dx || 0, (p.dy ?? d.height * 0.55), p.dz || 0)); }
  return new THREE.Vector3();
}
const camTo = (pos, look, t, ease = 'inOut') => t <= 0 ? (E.camPos.copy(pos), E.camLook.copy(look), Promise.resolve()) : Promise.all([
  tween(E.camPos, { x: pos.x, y: pos.y, z: pos.z }, t, { ease, real: true }),
  tween(E.camLook, { x: look.x, y: look.y, z: look.z }, t, { ease, real: true }),
]);

async function step(s, ctx) {
  if (E.skipping && !s.always) {
    // ohitus: aja vain tilaa muuttavat askeleet heti (sijainnit, piilotus, musiikki), ohita odotukset
    if (s.place) return step({ ...s, fade: undefined }, { ...ctx });
    if (!(s.move || s.hide || s.music !== undefined || s.amb !== undefined || s.surface !== undefined || s.fn || s.par || s.face || s.anim || s.expr)) return;
  }
  if (s.par) { await Promise.all(s.par.map(x => step(x, ctx))); return; }
  if (s.cam) { await camTo(V(s.cam), V(s.look || [0, 1, 0]), s.t || 0, s.ease); return; }
  if (s.orbit) {
    const o = { a: s.from || 0 };
    const c = () => resolvePos(s.orbit, 0);
    const upd = () => { const p = c(); E.camPos.set(p.x + Math.sin(o.a) * s.r, p.y + (s.h || 0.4), p.z + Math.cos(o.a) * s.r); E.camLook.set(p.x, p.y + (s.lookY || 0), p.z); };
    upd(); await tween(o, { a: s.to }, s.t || 2, { ease: s.ease || 'inOut', real: true, onUpdate: upd }); return;
  }
  if (s.dolly) {
    const d = castRef[s.dolly]; const p = d.root.position; const h = d.height;
    const look = new THREE.Vector3(p.x + (d.facing || 1) * h * 0.35, p.y + h * (s.lookH ?? 0.75), p.z);
    const pos = new THREE.Vector3(look.x + (s.side || 0.6) * h, look.y + (s.h ?? 0.05) * h, look.z + (s.dist || 1.4) * h);
    await camTo(pos, look, s.t ?? 0.35, s.ease || 'out'); return;
  }
  if (s.place) {
    const d = castRef[s.place]; d.root.visible = true; d.fade(s.fade ?? 1);
    d.root.position.set(s.x ?? d.root.position.x, s.y ?? 0, s.z ?? d.root.position.z);
    if (s.face) d.face(s.face, true);
    d.spin.rotation.set(0, 0, 0);
    if (s.anim) d.play(s.anim, { timeScale: s.ts || 1, loop: s.loop ?? true });
    return;
  }
  if (s.move) {
    const d = castRef[s.move];
    if (s.anim) d.play(s.anim, { timeScale: s.ts || 1 });
    if (s.x !== undefined && s.faceMove !== false) d.face(Math.sign(s.x - d.root.position.x) || d.facingTarget);
    const to = {}; for (const k of ['x', 'y', 'z']) if (s[k] !== undefined) to[k] = s[k];
    await tween(d.root.position, to, s.t || 1, { ease: s.ease || 'inOut', real: s.real ?? true });
    if (s.after) d.play(s.after);
    if (s.faceEnd) d.face(s.faceEnd);
    return;
  }
  if (s.anim) { castRef[s.anim].play(s.name, { loop: s.loop ?? true, timeScale: s.ts || 1 }); return; }
  if (s.face) { castRef[s.face].face(s.dir); return; }
  if (s.expr) { const d = castRef[s.expr]; if (d.expr) d.expr(s.name); return; }   // ilme (tehdaskoirat): neutral/determined/angry/sad/happy/closed/hurt/dead/surprised, null = auto
  if (s.hide) { castRef[s.hide].root.visible = false; return; }
  if (s.fadeOut) { const d = castRef[s.fadeOut]; await tween({ v: 1 }, { v: 0 }, s.t || 1.5, { real: true, onUpdate: e => d.fade(1 - e) }); d.root.visible = false; return; }
  if (s.say) { await say(s.say, { hold: s.hold }); return; }
  if (s.bark) { say(s.bark, { noWait: true }); return; }
  if (s.caption) { sfx.caption(); if (s.wait === false) UI.caption(s.caption, s.t || 3); else await UI.caption(s.caption, s.t || 3); return; }
  if (s.wait !== undefined) { await wait(s.wait, true); return; }
  if (s.slow !== undefined) { if (s.slow < 0.5 && E.timeScale >= 0.5) sfx.slowmo(); E.timeScale = s.slow; return; }
  if (s.freeze !== undefined) { await freezeFrame(s.freeze, s.tint); return; }
  if (s.music !== undefined) { music(s.music, { fade: s.fade ?? 1.6 }); return; }
  if (s.amb !== undefined) { ambience(s.amb); return; }                 // ambienssipreset (sfx_map.js AMBIENCE) tai null
  if (s.surface !== undefined) { setSurface(s.surface); return; }       // askelten alusta: step | stepRock | wade
  if (s.sfx) { (sfx[s.sfx] || (() => {}))(s.arg); return; }
  if (s.shake) { shake(s.shake); return; }
  if (s.fx) { doFx(s); return; }
  if (s.light) { await light(s.light); return; }
  if (s.fn) { await s.fn(ctx); return; }
}

function doFx(s) {
  const p = s.at ? resolvePos(s.at, s.dy || 0) : new THREE.Vector3();
  switch (s.fx) {
    case 'flash': FX.flash(s.color || '#fff', s.t || 0.3, s.peak ?? 0.8); break;
    case 'ring': FX.ring(p, s.color ?? 0xffffff, s.r || 3, s.t || 0.5); break;
    case 'burst': FX.burst(p, { color: s.color ?? 0xffd27a, count: s.count || 20, speed: s.speed || 5 }); break;
    case 'impact': FX.impact(p, s.strong); break;
    case 'spirit': FX.spiritLight(p, s.color ?? 0xcfe4ff, s.t || 5); sfx.spirit(); break;
    case 'dust': FX.dust(p, s.big); break;
    case 'speed': FX.speedLines(s.v ?? 1); if ((s.v ?? 1) >= 0.5) sfx.speed(); break;
    case 'arc': FX.slashArc(p, s.color ?? 0xbfe4ff, s.r || 1.2, s.t || 0.6, s.rot || 0); break;
  }
}

async function light({ rim, fog, exposure, bg, t = 2 }) {
  const ps = [];
  if (rim !== undefined && E.rimLight) ps.push(tween(E.rimLight, { intensity: rim }, t, { real: true }));
  if (exposure !== undefined) ps.push(tween(E.renderer, { toneMappingExposure: exposure }, t, { real: true }));
  if (fog !== undefined && E.scene.fog) { const c0 = E.scene.fog.color.clone(), c1 = new THREE.Color(fog); ps.push(tween({ k: 0 }, { k: 1 }, t, { real: true, onUpdate: k => E.scene.fog.color.copy(c0).lerp(c1, k) })); }
  await Promise.all(ps);
}

/** Taukokuva: aika pysähtyy, kuva saa anime-sävytyksen + nopeuslinjat. */
export async function freezeFrame(secs, tint = 'freeze') {
  const prev = E.timeScale; E.timeScale = 0;
  if (!E.skipping) sfx.freeze();
  document.body.classList.add(tint);
  FX.speedLines(0.7);
  await wait(secs, true);
  document.body.classList.remove(tint);
  FX.speedLines(0);
  E.timeScale = prev || 1;
}

/** Aja kohtaus. ctx välitetään fn-askelille. */
export async function runScene(steps, ctx = {}) {
  for (const s of steps) {
    try { await step(s, ctx); } catch (e) { console.error('scene step failed', s, e); }
  }
  E.timeScale = 1; FX.speedLines(0);
}
