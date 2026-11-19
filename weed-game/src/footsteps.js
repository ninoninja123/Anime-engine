// Askeläänet liikkeen mukaan (kevyt): seurataan näkyvien hahmojen juuren vaakasiirtymää. Toimii sekä pelissä että
// kohtauksissa (tween-siirrot), ilman animaatiokohtaisia merkintöjä. Ei per-frame-allokointeja.
//
//  - KÄVELYTYYLI nopeudesta suhteessa hahmon kokoon (sn = nopeus / korkeus):
//      walk (sn < 2.4): yksittäiset pehmeät askeleet 1,6–3 / s
//      trot (sn < 5):   tasainen ravi 3,2–4,4 / s
//      gallop:          laukan "ta-dum"-iskut 2,3–3 / s, joka iskussa kaksi jalkaa 55–70 ms välein, painokkaampi
//      boss (Kaibutsu): raskas askel 1,2–2,4 / s
//    Askeltiheys on aikaan sidottu (vaihe-akku), joten se ei tihene liikaa nopeissa tween-siirroissa eikä harvene
//    hitaissa; ensimmäinen askel soi heti liikkeelle lähdettäessä.
//  - PINTA: leaves (kuivat lehdet), dirt (multa/polku), rock (kallio/asfaltti, kynnet), water (kahlaus), snow
//    (pehmeä narske) + 'step' = lehdet + multa (oletus, syysmetsä). setSurface(s) koko kohtaukselle tai
//    setSurface(s, 'id') yhdelle hahmolle. Vanhat nimet 'step' | 'stepRock' | 'wade' toimivat edelleen.
//  - ETÄISYYS: käänteinen etäisyysvaimennus kamerasta (ref 3 m, 9 m ≈ 0,35, 20 m ≈ 0,15), stereopan x:n mukaan;
//    sivuhahmot hiljempaa ja yhteinen budjetti (≤ 9 askelta / s), ettei laumakohtaus ropise.
import { E } from './engine.js';
import { play } from './audio.js';

const state = new Map();       // dog -> { x, z, phase, moving, gait }
let castRef = null;
let surface = 'step';
const perDog = {};             // id -> pinta
export const stepStats = { steps: 0, boss: 0, gallop: 0, walk: 0, trot: 0, culled: 0 };

const SURF = {
  step: { walk: 'stepSoft', run: 'step' },
  leaves: { walk: 'stepLeafSoft', run: 'stepLeaf' },
  dirt: { walk: 'stepDirtSoft', run: 'stepDirt' },
  rock: { walk: 'stepRockSoft', run: 'stepRock' },
  stepRock: { walk: 'stepRockSoft', run: 'stepRock' },
  water: { walk: 'wade', run: 'wade' },
  wade: { walk: 'wade', run: 'wade' },
  snow: { walk: 'stepSnowSoft', run: 'stepSnow' },
};

export function initFootsteps(cast) {
  castRef = cast;
  E.updaters.add(update);
}
/** Alusta: 'step' (oletus: lehdet + multa) | 'leaves' | 'dirt' | 'rock' ('stepRock') | 'water' ('wade') | 'snow'.
 *  who = hahmon id -> vain tälle hahmolle (null/undefined poistaa hahmokohtaisen). */
export function setSurface(s, who) {
  if (who) { if (s) perDog[who] = s; else delete perDog[who]; return; }
  surface = s || 'step';
}
export function currentSurface(who) { return (who && perDog[who]) || surface; }

let budget = 9, budgetT = 0;   // sivuhahmojen yhteinen askelbudjetti / s

function update(dt, dtr) {
  if (!castRef || E.skipping || !(dtr > 0)) return;
  budgetT += dtr; if (budgetT >= 1) { budgetT = 0; budget = 9; }
  const cx = E.camPos ? E.camPos.x : 0, cz = E.camPos ? E.camPos.z : 8;
  for (const id in castRef) {
    const d = castRef[id];
    if (!d || !d.root) continue;
    const p = d.root.position;
    let st = state.get(d);
    if (!st) { st = { x: p.x, z: p.z, phase: 0, moving: false, gait: '' }; state.set(d, st); }
    const dx = p.x - st.x, dz = p.z - st.z;
    st.x = p.x; st.z = p.z;
    if (!d.root.visible || p.y > 0.08) { st.moving = false; st.phase = 0; continue; }   // ilmassa tai piilossa
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 1.5) { st.moving = false; continue; }                                      // teleporttaus (place)
    const speed = dist / dtr;
    if (speed < 0.3) { st.moving = false; st.phase = Math.min(st.phase, 0.6); continue; }
    const boss = id === 'kaibutsu';
    const h = Math.max(0.3, d.height || 1);
    const sn = speed / h;
    let gait, rate;
    if (boss) { gait = 'boss'; rate = Math.min(2.4, 1.2 + sn * 0.35); }
    else if (sn < 2.4) { gait = 'walk'; rate = Math.min(3, 1.6 + sn * 0.6); }
    else if (sn < 5) { gait = 'trot'; rate = Math.min(4.4, 3.2 + (sn - 2.4) * 0.45); }
    else { gait = 'gallop'; rate = Math.min(3, 2.3 + (sn - 5) * 0.12); }
    if (!st.moving) { st.moving = true; st.phase = 0.85; }                     // ensimmäinen askel heti
    if (gait !== st.gait) { st.gait = gait; }
    st.phase += rate * dtr;
    if (st.phase < 1) continue;
    st.phase -= Math.floor(st.phase);
    // etäisyysvaimennus (käänteinen etäisyys) kamerasta
    const far = Math.hypot(p.x - cx, p.z - cz);
    const att = Math.min(1, 3 / Math.max(3, 3 + (far - 3) * 0.95));
    if (boss) { stepStats.boss++; play('bossStep', { x: p.x, vol: att * (speed > 4 ? 1.15 : 0.9) }); continue; }
    const main = id === 'weed';
    if (!main) {
      if (att < 0.08 || budget <= 0) { stepStats.culled++; continue; }
      budget--;
    }
    stepStats.steps++; stepStats[gait]++;
    const S = SURF[currentSurface(id)] || SURF.step;
    const vol = att * (main ? 1 : 0.5);
    const rr = main ? 1 : 0.95 + Math.random() * 0.12;
    if (gait === 'walk') play(S.walk, { x: p.x, vol: vol * 0.9, rate: rr });
    else if (gait === 'trot') play(S.run, { x: p.x, vol: vol * 0.8, rate: rr * 1.03 });
    else {                                                                       // laukka: kaksi jalkaa per isku
      play(S.run, { x: p.x, vol: vol * 1.05, rate: rr });
      play(S.run, { x: p.x, vol: vol * 0.75, rate: rr * 1.06, delay: 0.055 + Math.random() * 0.015 });
    }
  }
}
