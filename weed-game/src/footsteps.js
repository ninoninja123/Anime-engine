// Askeläänet liikkeen mukaan (kevyt): seurataan näkyvien hahmojen juuren vaakasiirtymää, ja kun kuljettu matka ylittää
// askelpituuden (∝ hahmon koko), soitetaan askel. Toimii sekä pelissä että kohtauksissa (tween-siirrot), ilman
// animaatiokohtaisia merkintöjä. Ei per-frame-allokointeja (tila hahmokohtaisessa objektissa).
import { E } from './engine.js';
import { play } from './audio.js';

const state = new Map();       // dog -> { x, z, acc, n }
let castRef = null;
let surface = 'step';          // step | stepRock | wade (kohtaus voi vaihtaa: setSurface)
export const stepStats = { steps: 0, boss: 0 };

export function initFootsteps(cast) {
  castRef = cast;
  E.updaters.add(update);
}
/** Alusta: 'step' (kuivat lehdet + multa), 'stepRock' (kallio, kynnet), 'wade' (joki). */
export function setSurface(s) { surface = s || 'step'; }

function update(dt, dtr) {
  if (!castRef || E.skipping || !(dtr > 0)) return;
  const cx = E.camPos ? E.camPos.x : 0, cz = E.camPos ? E.camPos.z : 8;
  for (const id in castRef) {
    const d = castRef[id];
    if (!d || !d.root) continue;
    const p = d.root.position;
    let st = state.get(d);
    if (!st) { st = { x: p.x, z: p.z, acc: 0, n: 0 }; state.set(d, st); }
    const dx = p.x - st.x, dz = p.z - st.z;
    st.x = p.x; st.z = p.z;
    if (!d.root.visible || p.y > 0.08) { st.acc = 0; continue; }       // ilmassa tai piilossa: ei askelia
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 1.5) { st.acc = 0; continue; }                          // teleporttaus (place / setupArena)
    const speed = dist / dtr;
    if (speed < 0.35) { st.acc *= 0.9; continue; }
    st.acc += dist;
    const boss = id === 'kaibutsu';
    const h = d.height || 1;
    // laukka: lyhyempi askelväli suhteessa nopeuteen (useampi jalka); kävely: pitkä väli
    const stride = boss ? h * 0.55 : h * (speed > 3 ? 0.42 : 0.6);
    if (st.acc < stride) continue;
    st.acc -= stride; st.n++;
    // etäisyysvaimennus kamerasta + pan
    const far = Math.hypot(p.x - cx, p.z - cz);
    const att = Math.max(0.12, Math.min(1, 1.25 - far / 16));
    if (boss) { stepStats.boss++; play('bossStep', { x: p.x, vol: att * (speed > 4 ? 1.1 : 0.85) }); continue; }
    stepStats.steps++;
    const main = id === 'weed';
    const vol = att * (main ? 1 : 0.5) * (speed > 3 ? 1 : 0.75);
    play(main ? surface : (surface === 'step' ? 'stepSoft' : surface), { x: p.x, vol, rate: main ? 1 : 0.95 + Math.random() * 0.15 });
  }
}
