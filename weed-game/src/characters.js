// Hahmoluettelo (data). Jokainen hahmo on joko
//   kind 'rigid'   = käyttäjän oma Tripo-malli (yksi jäykkä mesh, animoidaan vertex-shaderin "pehmeällä rigillä")
//   kind 'factory' = koiratehtaan peruskoira (dog_parts.glb, 13 osaa) + värit, mittasuhteet, kuviot
// Kaikki mallit normalisoidaan: katse +X, jalat y=0, korkeus = height (maailman yksikköä).
// rotY = kierto, jolla lähdemalli saadaan katsomaan +X:ään (Weed/Tōbee katsovat alun perin +Z:aan,
// Kaibutsu -X:ään). Rig-arvot ovat osuuksia normalisoidusta korkeudesta (h = 1).

const HALF_PI = Math.PI / 2;

export const MODELS = {
  weed:      { file: 'weed.glb',      rotY: HALF_PI },
  kaibutsu:  { file: 'kaibutsu.glb',  rotY: Math.PI },
  smith:     { file: 'smith.glb',     rotY: 0 },
  striped_a: { file: 'striped_a.glb', rotY: 0 },
  striped_b: { file: 'striped_b.glb', rotY: 0 },
  rocket:    { file: 'rocket.glb',    rotY: 0 },
  tobei:     { file: 'tobei.glb',     rotY: HALF_PI },
  dog_parts: { file: 'dog_parts.glb', rotY: 0 },
  hogen:     { file: 'hogen.glb',     rotY: 0 },
  weed_rigged:     { file: 'weed_rigged.glb',     rotY: 0, rigged: true },
  john_auto:       { file: 'john_auto.glb',       rotY: 0, rigged: true },   // john.glb (wolf) auto-rig
  gin_auto:        { file: 'gin_auto.glb',        rotY: 0, rigged: true },   // gin_rigged.glb (Tripo) uudelleenrigattu rig_dog_standalone.py:llä -> 9 klippiä
  kagetora_rigged: { file: 'kagetora_rigged.glb', rotY: 0, rigged: true },
  smith_rigged: { file: 'smith_rigged.glb', rotY: 0, rigged: true },
  kaibutsu_rigged: { file: 'kaibutsu_rigged.glb', rotY: 0, rigged: true, mirrorZ: true },  // auto-rig peilasi mallin: karvaton laikku takaisin vasemmalle kyljelle
  rocket_rigged: { file: 'rocket_rigged.glb', rotY: 0, rigged: true },
  tobei_rigged: { file: 'tobei_rigged.glb', rotY: 0, rigged: true },
  hogen_rigged: { file: 'hogen_rigged.glb', rotY: 0, rigged: true },
  striped_b_rigged: { file: 'striped_b_rigged.glb', rotY: 0, rigged: true },
};

// Liikkeen tyyli: gait = 'trot' | 'limp3' (kolmijalkainen) | 'heavy' | 'light'
// rig: pehmeän rigin parametrit jäykälle mallille (belly = jalkojen yläraja, neck = pään alku x-suunnassa
// osuutena mallin pituudesta etupäästä, tail = hännän alku takapäästä).
export const CHARACTERS = {
  // ---------------- päähahmot: omat mallit ----------------
  weed: {
    name: 'Weed', jp: 'ウィード', kind: 'rigged', model: 'weed_rigged', height: 0.78,
    role: 'Son of Gin. Small but swift, and he refuses pointless killing. Signature move: Battōga.',
    gait: 'light', speed: 1.15, wag: 0.6,
    rig: { belly: 0.36, neck: 0.36, tail: 0.24, legSwing: 0.55, headAmt: 1 },
    outline: 0.012,
  },
  kaibutsu: {
    name: 'Kaibutsu', jp: '怪物', kind: 'rigged', model: 'kaibutsu_rigged', height: 2.9,
    role: 'P4. A dog twisted by gene experiments into a lion-like monster. Weak spot: the hairless left flank.',
    gait: 'heavy', speed: 0.8, wag: 0.12, monster: true,
    rig: { belly: 0.40, neck: 0.30, tail: 0.30, legSwing: 0.42, headAmt: 0.8 },
    // karvaton laikku näkyy mallissa vasemmassa kyljessä olan takana (mallin omassa avaruudessa, h=1)
    weakSpot: { x: 0.40, y: 0.47, z: -0.26, r: 0.2 },
    eyes: { x: 0.70, y: 0.80, z: 0.075 },
    outline: 0.006,
  },
  smith: {
    name: 'Smith', jp: 'スミス', kind: 'rigged', model: 'smith_rigged', height: 0.98,
    role: 'A three-legged veteran. He lost a leg saving GB from under a truck.',
    gait: 'limp3', speed: 0.9, wag: 0.35,
    rig: { belly: 0.40, neck: 0.30, tail: 0.25, legSwing: 0.45, headAmt: 0.9 },
    outline: 0.01,
  },
  kagetora: {
    name: 'Kagetora', jp: '影虎', kind: 'rigged', model: 'kagetora_rigged', height: 1.02,
    role: 'A Kai dog, son of Kurotora. Hot-headed at first, then Ken\'s closest friend.',
    gait: 'trot', speed: 1.1, wag: 0.4,
    rig: { belly: 0.42, neck: 0.30, tail: 0.25, legSwing: 0.5, headAmt: 1 },
    outline: 0.01,
  },
  kurotora: {
    name: 'Kurotora', jp: '黒虎', kind: 'rigged', model: 'striped_b_rigged', height: 1.06,
    role: 'Kai veteran of Gin\'s generation and Kagetora\'s father. Leader of the Kai brothers.',
    gait: 'trot', speed: 1, wag: 0.3,
    rig: { belly: 0.42, neck: 0.30, tail: 0.25, legSwing: 0.48, headAmt: 1 },
    outline: 0.01,
  },
  rocket: {
    name: 'Rocket', jp: 'ロケット', kind: 'rigged', model: 'rocket_rigged', height: 1.18,
    role: 'A borzoi and the fastest of Ōu. A trusted scout who defects from Hōgen\'s side.',
    gait: 'light', speed: 1.35, wag: 0.3,
    rig: { belly: 0.48, neck: 0.30, tail: 0.25, legSwing: 0.6, headAmt: 1 },
    outline: 0.01,
  },
  tobee: {
    name: 'Tōbee', jp: '藤兵衛', kind: 'rigged', model: 'tobei_rigged', height: 1.4,
    role: 'Former fighting-dog yokozuna and one of Hōgen\'s generals. He dies standing, like a mountain.',
    gait: 'heavy', speed: 0.85, wag: 0.15,
    rig: { belly: 0.36, neck: 0.32, tail: 0.18, legSwing: 0.38, headAmt: 0.7 },
    outline: 0.01,
  },
  moss: {
    name: 'Moss', jp: 'モス', kind: 'rigged', model: 'tobei_rigged', height: 1.5, tint: '#8a8f99',
    role: 'Gin\'s heavyweight veteran. Gives his life shielding his comrades in Hokkaidō.',
    gait: 'heavy', speed: 0.85, wag: 0.15,
    rig: { belly: 0.36, neck: 0.32, tail: 0.18, legSwing: 0.38, headAmt: 0.7 },
    outline: 0.01,
  },

  // ---------------- koiratehdas ----------------
  // p = mittasuhteet: leg (jalan pituus), legW (paksuus), body (pituus), neck, head, ear, earTilt (rad,
  //     + = luimussa/roikkuu), tail: 'curl'|'straight'|'sabre'|'docked', tailLen, muzzle (kuonon pidennys)
  // c = värit: coat, under, legs, head, ear, tail, muzzle, eye, nose
  // marks = maalatut kuviot (ks. dogs.js PAINT)
  gin: {
    name: 'Gin', jp: '銀', kind: 'rigged', model: 'gin_auto', height: 1.25,
    role: 'Weed\'s father, Ōu\'s legendary leader. He calls those under him comrades, never servants.',
    gait: 'trot', speed: 1.05, wag: 0.4,
    outline: 0.008,
  },
  jerome: {
    name: 'Jerome', jp: 'ジェローム', kind: 'factory', height: 1.2,
    role: 'German shepherd, former laboratory guard dog and the pack\'s strategist.',
    gait: 'trot', speed: 1.1, wag: 0.25,
    p: { leg: 1.12, body: 1.12, neck: 1.1, head: 1.02, ear: 1.5, earTilt: -0.1, tail: 'sabre', tailLen: 1.25, muzzle: 1.25 },
    c: { coat: '#b47a3c', under: '#d9a764', head: '#b8803f', ear: '#2a1f17', tail: '#5a3b1e', muzzle: '#1f1813' },
    marks: ['saddle:#1e1712', 'mask:#1f1813', 'belly'],
  },
  ken: {
    name: 'Ken', jp: 'ケン', kind: 'factory', height: 1.5,
    role: 'Great Dane, son of Ben. At first he quarrels with Kagetora.',
    gait: 'trot', speed: 1, wag: 0.3,
    p: { leg: 1.38, legW: 1.05, body: 1.12, neck: 1.35, head: 1.08, ear: 0.7, earTilt: 0.9, tail: 'straight', tailLen: 1.2, muzzle: 1.35 },
    c: { coat: '#666c78', under: '#8c919c', head: '#6c7280', ear: '#4f545e', muzzle: '#3b3f47' },
    marks: ['belly', 'chestBlaze:#d8dbe0'],
  },
  robert: {
    name: 'Robert', jp: 'ロバート', kind: 'factory', height: 1.1,
    role: 'One of Jerome\'s men. Quiet and steady; the first of the Four Arrows.',
    gait: 'trot', speed: 1.1, wag: 0.25,
    p: { leg: 1.08, body: 1.08, neck: 1.05, ear: 1.4, tail: 'sabre', tailLen: 1.15, muzzle: 1.2 },
    c: { coat: '#5c4631', under: '#a57d4e', head: '#5f4832', ear: '#1d1610', tail: '#2c2116', muzzle: '#1b140e' },
    marks: ['saddle:#17110c', 'mask:#1b140e'],
  },
  rocker: {
    name: 'Rocker', jp: 'ロッカー', kind: 'factory', height: 1.08,
    role: 'One of Jerome\'s men. Black and tan, sharp-eared and fearless.',
    gait: 'trot', speed: 1.15, wag: 0.25,
    p: { leg: 1.15, legW: 0.9, body: 1.05, neck: 1.12, ear: 1.45, earTilt: -0.15, tail: 'docked', muzzle: 1.25 },
    c: { coat: '#1f1c1a', under: '#9a6a36', head: '#211e1c', ear: '#1a1716', muzzle: '#9a6a36' },
    marks: ['tanPoints:#a8743c', 'brows:#b07a40'],
  },
  heuler: {
    name: 'Heuler', jp: 'ヒューラー', kind: 'factory', height: 1.14,
    role: 'One of Jerome\'s men. "Let\'s not die yet, Robert. We go together."',
    gait: 'trot', speed: 1.05, wag: 0.25,
    p: { leg: 1.1, body: 1.1, neck: 1.08, ear: 1.4, tail: 'sabre', tailLen: 1.2, muzzle: 1.2 },
    c: { coat: '#7e6c5a', under: '#bfae96', head: '#86735f', ear: '#3a3028', tail: '#4b3e32', muzzle: '#2d261f' },
    marks: ['saddle:#3d342b', 'belly'],
  },
  akame: {
    name: 'Akame', jp: '赤目', kind: 'factory', height: 1.02,
    role: 'Kishu, Gin\'s contemporary and former leader of the Iga ninja dogs. Messenger and strategist.',
    gait: 'light', speed: 1.2, wag: 0.3,
    p: { leg: 1.0, body: 1.0, ear: 1.0, tail: 'curl', muzzle: 1.05 },
    c: { coat: '#a8492f', under: '#e7c7a4', head: '#ad4d31', ear: '#7a3220', muzzle: '#e4c09a', eye: '#d3281c' },
    marks: ['belly', 'muzzleLight', 'scar'],
  },
  john: {
    name: 'John', jp: 'ジョン', kind: 'rigged', model: 'john_auto', height: 1.22,
    role: 'Ōu\'s strongest warrior. His last stand against fifty of Hōgen\'s men becomes a legend that frightens even Hōgen.',
    gait: 'trot', speed: 1.05, wag: 0.3,
    outline: 0.008,
  },
  ben: {
    name: 'Ben', jp: 'ベン', kind: 'factory', height: 1.46,
    role: 'Blind Great Dane veteran and Ken\'s father. Sees with the heart.',
    gait: 'heavy', speed: 0.85, wag: 0.2,
    p: { leg: 1.3, legW: 1.08, body: 1.12, neck: 1.25, head: 1.1, ear: 0.7, earTilt: 0.9, tail: 'straight', tailLen: 1.15, muzzle: 1.35 },
    c: { coat: '#8d8478', under: '#b7ae9f', head: '#958c80', ear: '#5e574e', muzzle: '#4a443d', eye: '#c9d2d6' },
    marks: ['belly', 'muzzleGrey'],
  },
  gb: {
    name: 'GB', jp: 'ジービー', kind: 'factory', height: 1.0,
    role: 'English setter. Lazy and boastful, yet he keeps his promise to bring Weed to Ōu.',
    gait: 'light', speed: 1.0, wag: 0.8,
    p: { leg: 1.0, body: 1.05, neck: 1.0, ear: 1.1, earTilt: 1.15, tail: 'straight', tailLen: 1.15, muzzle: 1.2 },
    c: { coat: '#f2eee6', under: '#fbf9f4', head: '#f2eee6', ear: '#4a3424', muzzle: '#f2eee6' },
    marks: ['spots:#3b2c22'],
  },
  lector: {
    name: 'Lector', jp: 'レクター', kind: 'factory', height: 1.12,
    role: 'One of Hōgen\'s Killer Fang assassins. A Dobermann with razor teeth.',
    gait: 'light', speed: 1.25, wag: 0.1,
    p: { leg: 1.2, legW: 0.85, body: 1.02, neck: 1.18, ear: 1.6, earTilt: -0.25, tail: 'docked', muzzle: 1.35 },
    c: { coat: '#181514', under: '#181514', head: '#1b1817', ear: '#171413', muzzle: '#8a4b22', eye: '#e2a23a' },
    marks: ['tanPoints:#8a4b22', 'brows:#9a5526'],
  },
  thunder: {
    name: 'Thunder', jp: 'サンダー', kind: 'factory', height: 1.12,
    role: 'Lector\'s partner in the Killer Fang duo. Red Dobermann, quick as lightning.',
    gait: 'light', speed: 1.25, wag: 0.1,
    p: { leg: 1.2, legW: 0.85, body: 1.02, neck: 1.18, ear: 1.6, earTilt: -0.25, tail: 'docked', muzzle: 1.35 },
    c: { coat: '#5e2f1c', under: '#5e2f1c', head: '#623120', ear: '#552a19', muzzle: '#b97a45', eye: '#e2a23a' },
    marks: ['tanPoints:#b97a45', 'brows:#c4844c'],
  },
  hogen: {
    name: 'Hōgen', jp: '法玄', kind: 'rigged', model: 'hogen_rigged', height: 1.85,
    role: 'A starved Great Dane who came to hate humans. Gathers an army of 700 to rule Japan.',
    gait: 'heavy', speed: 0.9, wag: 0.05,
    rig: { belly: 0.44, neck: 0.26, tail: 0.22, legSwing: 0.45, headAmt: 0.9 },
    eyes: { x: 0.64, y: 0.86, z: 0.055 }, eyeColor: '#ff3a24', eyeScale: 0.35,   // "god of death" -hehku
    outline: 0.008,
  },
  genba: {
    name: 'Genba', jp: '玄馬', kind: 'rigged', model: 'hogen_rigged', height: 1.75, tint: '#b8977c',
    role: 'Hōgen\'s brother: raw strength and rage. Hōgen ends his suffering in tears.',
    gait: 'heavy', speed: 0.9, wag: 0.05,
    rig: { belly: 0.44, neck: 0.26, tail: 0.22, legSwing: 0.42, headAmt: 0.9 },
    outline: 0.009,
  },
};

// Pelissä käytetyt (taso 2) ja galleriassa näytettävät
export const LEVEL2_CAST = ['weed', 'kaibutsu', 'smith', 'jerome', 'ken', 'kagetora', 'robert', 'rocker', 'heuler', 'gin'];
export const ROSTER = ['weed', 'gin', 'smith', 'jerome', 'ken', 'kagetora', 'robert', 'rocker', 'heuler', 'kaibutsu',
  'rocket', 'tobee', 'kurotora', 'moss', 'akame', 'john', 'ben', 'gb', 'lector', 'thunder', 'hogen', 'genba'];

// ---------------- geneeriset joukkovariantit (src/data/roster_specs.js) ----------------
// Ei ylikirjoita yllä olevia hahmoja; lisätyt id:t ROSTER_EXTRA_IDS, galleriaryhmät GROUP_OF.
import { ROSTER_SPECS, resolveSpecs, GROUP_OF, GROUP_LABEL } from './data/roster_specs.js';
export const ROSTER_EXTRA_IDS = [];
{
  const resolved = resolveSpecs(ROSTER_SPECS);
  for (const id of Object.keys(ROSTER_SPECS)) {
    if (CHARACTERS[id]) continue;
    CHARACTERS[id] = resolved[id];
    ROSTER_EXTRA_IDS.push(id);
    if (!ROSTER.includes(id)) ROSTER.push(id);
  }
}
export { GROUP_OF, GROUP_LABEL };
