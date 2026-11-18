// Geneeriset lisähahmot koiratehtaalle: alkuperäisiä, nimettömiä joukkovariantteja (liittolaissoturit,
// vihollissotilaat, ninjakoira) sekä villisika-siluetti. Nämä ovat pelin omia suunnitelmia, jotka
// perustuvat vain yleisiin koirarotujen piirteisiin; ne eivät esitä mitään tiettyä olemassa olevaa hahmoa.
//
// Skeema on sama kuin characters.js:n factory-hahmoilla:
//   p  = mittasuhteet (leg, legW, body, neck, head, ear, earTilt, tail, tailLen, muzzle)
//   c  = värit (coat, under, legs, head, ear, tail, muzzle, eye, nose)
//   marks = maalatut kuviot (dogs.js PAINT)
// Lisäkentät:
//   group  = 'allies' | 'enemies' | 'beasts' (gallerian luokittelu)
//   breed  = rotutyyppi
//   extras = lisäosat (src/accessories.js): eyeScar, blind, collar, scarf, tusks, bristles, snout,
//            metalLegs, aura, mane, scars, earNotch
//   base   = toisen tämän tiedoston hahmon id, jonka arvot peritään (variantit)

const ENEMY_COLLAR = '#7d1f1a';   // vihollisarmeijan tumma punainen panta (erottaa joukot)
const SCOUT_COLLAR = '#3d4a2a';   // vihollisen tiedustelijoiden oliivinvihreä panta
const NINJA_SCARF = '#2b2f3a';

export const ROSTER_SPECS = {
  // ================= liittolaissoturit (geneeriset) =================
  ally_warrior_a: {
    name: 'Warrior', kind: 'factory', height: 1.0, group: 'allies', breed: 'Shiba-type',
    role: 'A warrior of the pack.',
    gait: 'trot', speed: 1.05, wag: 0.4,
    p: { leg: 0.98, body: 0.98, ear: 1.0, tail: 'curl', muzzle: 1.0 },
    c: { coat: '#c97a3c', under: '#f4e2c6', head: '#cc7e40', ear: '#a86030', muzzle: '#f0dcbf' },
    marks: ['belly', 'muzzleLight', 'socks'],
  },
  ally_warrior_b: {
    name: 'Warrior', kind: 'factory', height: 1.08, group: 'allies', breed: 'Brindle Japanese-type', base: 'ally_warrior_a',
    p: { leg: 1.04, body: 1.04, ear: 1.05, tail: 'sabre', tailLen: 1.0, muzzle: 1.05 },
    c: { coat: '#3e342d', under: '#6d5c4e', head: '#40362e', ear: '#2e2621', muzzle: '#2b241f' },
    marks: ['brindle:#1b1612'],
  },
  ally_warrior_c: {
    name: 'Warrior', kind: 'factory', height: 1.12, group: 'allies', breed: 'Pale stocky spitz-type', base: 'ally_warrior_a',
    p: { leg: 1.0, legW: 1.15, body: 1.05, head: 1.08, ear: 0.9, tail: 'curl', muzzle: 0.95 },
    c: { coat: '#d9d2c4', under: '#f2eee6', head: '#dcd5c8', ear: '#b9b0a1', muzzle: '#efeae0' },
    marks: ['belly'],
    extras: [{ type: 'scars', count: 1 }],
  },
  ally_warrior_d: {
    name: 'Warrior', kind: 'factory', height: 1.02, group: 'allies', breed: 'Sesame Japanese-type', base: 'ally_warrior_a',
    c: { coat: '#9a6c45', under: '#ead6b8', head: '#7b5538', ear: '#5d3f28', muzzle: '#e6d0ae' },
    marks: ['belly', 'saddle:#4a3322', 'muzzleLight'],
  },
  ninja_dog_a: {
    name: 'Ninja dog', kind: 'factory', height: 0.9, group: 'allies', breed: 'Black-and-tan spitz-type',
    role: 'A shadowy scout from the mountain clans.',
    gait: 'light', speed: 1.25, wag: 0.2,
    p: { leg: 0.98, legW: 0.95, body: 0.98, neck: 0.95, head: 1.0, ear: 1.05, earTilt: -0.15, tail: 'curl', muzzle: 1.0 },
    c: { coat: '#2e2a28', under: '#9d7a55', head: '#302c2a', ear: '#262220', muzzle: '#a8835c', eye: '#d6a43c' },
    marks: ['tanPoints:#a8835c', 'brows:#b48d62'],
    extras: [{ type: 'scarf', color: NINJA_SCARF }],
  },
  ninja_dog_b: {
    name: 'Ninja dog', kind: 'factory', height: 0.88, group: 'allies', breed: 'Brown spitz-type', base: 'ninja_dog_a',
    c: { coat: '#5b4a3d', under: '#b79a78', head: '#5e4c3f', ear: '#4a3c31', muzzle: '#c2a481' },
    marks: ['belly', 'muzzleLight'],
  },

  // ================= vihollissotilaat (geneeriset) =================
  enemy_soldier_a: {
    name: 'Soldier', kind: 'factory', height: 1.12, group: 'enemies', breed: 'Mastiff-type mix',
    role: 'A soldier of the enemy army.',
    gait: 'heavy', speed: 1.0, wag: 0.05,
    p: { leg: 1.0, legW: 1.25, body: 1.08, neck: 0.95, head: 1.15, ear: 0.8, earTilt: 0.8, tail: 'straight', tailLen: 0.9, muzzle: 0.95 },
    c: { coat: '#7a5a3c', under: '#9c7c5a', head: '#7d5d3e', ear: '#4e3826', muzzle: '#2b1f16' },
    marks: ['mask:#2b1f16'],
    extras: [{ type: 'collar', color: ENEMY_COLLAR }],
  },
  enemy_soldier_b: {
    name: 'Soldier', kind: 'factory', height: 1.1, group: 'enemies', breed: 'Shepherd-type mix', base: 'enemy_soldier_a',
    p: { leg: 1.1, legW: 1.0, body: 1.08, neck: 1.08, head: 1.0, ear: 1.35, earTilt: -0.05, tail: 'sabre', tailLen: 1.1, muzzle: 1.2 },
    c: { coat: '#2a2624', under: '#5a4e45', head: '#2c2826', ear: '#211e1c', muzzle: '#1d1a18' },
    marks: ['belly'],
    extras: [{ type: 'collar', color: ENEMY_COLLAR }, { type: 'scars', count: 1 }],
  },
  enemy_soldier_c: {
    name: 'Soldier', kind: 'factory', height: 1.04, group: 'enemies', breed: 'Spotted mix', base: 'enemy_soldier_a',
    p: { leg: 1.05, legW: 1.0, body: 1.0, neck: 1.0, head: 1.0, ear: 1.0, earTilt: 0.9, tail: 'straight', tailLen: 1.0, muzzle: 1.1 },
    c: { coat: '#e6e0d4', under: '#f2eee6', head: '#e6e0d4', ear: '#3a3330', muzzle: '#e6e0d4' },
    marks: ['spots:#3a3330'],
  },
  enemy_soldier_d: {
    name: 'Soldier', kind: 'factory', height: 1.2, group: 'enemies', breed: 'Bull-type mix', base: 'enemy_soldier_a',
    p: { leg: 0.92, legW: 1.4, body: 1.12, neck: 0.85, head: 1.25, ear: 0.7, earTilt: 0.2, tail: 'docked', muzzle: 0.8 },
    c: { coat: '#9a7e66', under: '#d9cbb8', head: '#9e826a', ear: '#6c5544', muzzle: '#2c2420' },
    marks: ['chestBlaze:#e4d8c6', 'mask:#2c2420'],
    extras: [{ type: 'collar', color: ENEMY_COLLAR, spikes: true }],
  },
  enemy_scout_a: {
    name: 'Scout', kind: 'factory', height: 1.22, group: 'enemies', breed: 'Lurcher-type',
    role: 'A fast sighthound scout of the enemy army.',
    gait: 'light', speed: 1.15, wag: 0.05,
    p: { leg: 1.25, legW: 0.85, body: 1.08, neck: 1.15, ear: 0.8, earTilt: 0.5, tail: 'sabre', tailLen: 1.3, muzzle: 1.35 },
    c: { coat: '#6e6a62', under: '#8b867c', head: '#6a665e', ear: '#45423d', muzzle: '#47443f' },
    marks: ['brindle:#55524c'],
    extras: [{ type: 'collar', color: SCOUT_COLLAR }],
  },
  enemy_scout_b: {
    name: 'Scout', kind: 'factory', height: 1.15, group: 'enemies', breed: 'Dark lurcher-type', base: 'enemy_scout_a',
    c: { coat: '#4b4038', under: '#7a6a5c', head: '#4d4239', ear: '#2f2823', muzzle: '#2f2823' },
    marks: ['mask:#2a231f'],
    extras: [{ type: 'collar', color: SCOUT_COLLAR }, { type: 'scars', count: 1 }],
  },
  enemy_veteran: {
    name: 'Veteran', kind: 'factory', height: 1.25, group: 'enemies', breed: 'Hound-type mix',
    role: 'A scarred veteran with steel-braced forelegs.',
    gait: 'trot', speed: 1.0, wag: 0.05,
    p: { leg: 1.12, legW: 1.05, body: 1.1, neck: 1.05, head: 1.05, ear: 1.1, earTilt: 1.15, tail: 'sabre', tailLen: 1.1, muzzle: 1.25 },
    c: { coat: '#4f4a52', under: '#7c7680', head: '#524c55', ear: '#2e2b31', muzzle: '#2a272d' },
    marks: ['muzzleGrey', 'belly'],
    extras: [{ type: 'metalLegs' }, { type: 'eyeScar', side: 'L' }, { type: 'collar', color: '#3c3a38', spikes: true }],
  },

  // ================= pedot =================
  wild_boar: {
    name: 'Wild boar', kind: 'factory', height: 1.25, group: 'beasts', breed: 'Wild boar',
    role: 'A huge, charging mountain boar: a third body type next to dogs and monsters.',
    gait: 'heavy', speed: 0.95, wag: 0.25, boar: true,
    p: { leg: 0.72, legW: 1.6, body: 1.32, neck: 0.7, head: 1.38, ear: 0.6, earTilt: -0.3, tail: 'straight', tailLen: 0.5, muzzle: 1.4 },
    c: { coat: '#3a2e26', under: '#4a3c32', legs: '#2a221d', head: '#3e3229', ear: '#2a221d', tail: '#2a221d', muzzle: '#5a4a40', nose: '#6b5246', eye: '#e2532a' },
    marks: ['brindle:#2b221c'],
    extras: [{ type: 'bristles' }, { type: 'tusks' }, { type: 'snout' }, { type: 'scars', count: 3 }],
  },
};

export const GROUP_OF = {};
for (const [id, s] of Object.entries(ROSTER_SPECS)) GROUP_OF[id] = s.group;
export const GROUP_LABEL = { allies: 'Allied warriors', enemies: 'Enemy soldiers', beasts: 'Beasts' };

/** Perii base-hahmon arvot (p ja c yhdistetään kentittäin). */
export function resolveSpecs(all) {
  const out = {};
  const get = id => {
    if (out[id]) return out[id];
    const s = all[id];
    if (!s) return null;
    if (!s.base) return (out[id] = s);
    const b = get(s.base) || {};
    return (out[id] = {
      ...b, ...s,
      p: { ...(b.p || {}), ...(s.p || {}) },
      c: { ...(b.c || {}), ...(s.c || {}) },
      marks: s.marks || b.marks,
      extras: s.extras || b.extras,
      height: s.height ?? b.height,
    });
  };
  for (const id of Object.keys(all)) get(id);
  return out;
}
