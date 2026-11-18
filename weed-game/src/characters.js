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
  tesshin_auto:    { file: 'tesshin_auto.glb',    rotY: 0, rigged: true },   // tesshin.glb auto-rig
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
    role: 'P4. A dog twisted by gene experiments into a lion-like monster. Weak spot: the bare skin on its left chest.',
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
    name: 'Kagetora', jp: '影虎', kind: 'rigged', model: 'striped_b_rigged', height: 1.02,
    role: 'A black brindle Kai dog, son of Kurotora, with two scars on the left of his muzzle. Hot-headed at first, then Ken\'s closest friend.',
    gait: 'trot', speed: 1.1, wag: 0.4,
    rig: { belly: 0.42, neck: 0.30, tail: 0.25, legSwing: 0.5, headAmt: 1 },
    outline: 0.01,
    scars: [{ at: [0.7, 0.74, -0.062], size: 0.085, n: 2 }],   // canon: kaksi arpea kuonon vasemmalla puolella
  },
  kurotora: {
    name: 'Kurotora', jp: '黒虎', kind: 'rigged', model: 'striped_b_rigged', height: 1.08, tint: '#a39d96',
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
    name: 'Tōbee', jp: '闘兵衛', kind: 'rigged', model: 'tobei_rigged', height: 1.4,
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

  tesshin: {
    name: 'Tesshin', jp: '哲心', kind: 'rigged', model: 'tesshin_auto', height: 1.0,
    role: 'A ninja dog of the Kōga clan. At the hot spring he teaches Weed Gin\'s secret move, Zetsu Tenrō Battōga – a move he cannot perform himself.',
    gait: 'light', speed: 1.2, wag: 0.3,
    outline: 0.008,
  },

  // ---------------- koiratehdas ----------------
  // p = mittasuhteet: leg (jalan pituus), legW (paksuus), body (pituus), neck, head, ear, earTilt (rad,
  //     + = luimussa/roikkuu), tail: 'curl'|'straight'|'sabre'|'docked', tailLen, muzzle (kuonon pidennys)
  // c = värit: coat, under, legs, head, ear, tail, muzzle, eye, nose
  // marks = maalatut kuviot (ks. dogs.js PAINT)
  gin: {
    name: 'Gin', jp: '銀', kind: 'rigged', model: 'gin_auto', height: 1.25, tint: '#9fb6d2',
    role: 'A blue-grey Akita, Weed\'s father and Ōu\'s legendary leader. He calls those under him comrades, never servants.',
    gait: 'trot', speed: 1.05, wag: 0.4,
    outline: 0.008,
  },
  jerome: {
    name: 'Jerome', jp: 'ジェロム', kind: 'factory', height: 1.2,
    role: 'German shepherd, former laboratory guard dog and the pack\'s strategist.',
    gait: 'trot', speed: 1.1, wag: 0.25,
    p: { leg: 1.12, body: 1.12, neck: 1.1, head: 1.02, ear: 1.5, earTilt: -0.1, tail: 'sabre', tailLen: 1.25, muzzle: 1.25 },
    // canon: musta viitta, korvat ja päälaki; kerma/vaaleanharmaat kasvot ja rinta; mustat raidat silmien ympärillä; hyvin vaaleat silmät
    c: { coat: '#e2d9c8', under: '#ece4d4', head: '#e0d6c3', ear: '#151313', tail: '#1a1716', muzzle: '#d8cdb8', eye: '#c9d6e4' },
    marks: ['saddle:#171514', 'capHead:#171514', 'eyeStripe:#171514'],
  },
  ken: {
    name: 'Ken', jp: 'ケン', kind: 'factory', height: 1.5,
    role: 'Great Dane, son of Ben. At first he quarrels with Kagetora.',
    gait: 'trot', speed: 1, wag: 0.3,
    p: { leg: 1.4, legW: 1.1, body: 1.14, neck: 1.35, head: 1.12, ear: 1.05, earTilt: -0.15, tail: 'straight', tailLen: 1.2, muzzle: 1.35 },
    // canon: ruskea (fawn) tanskandoggi-salukiristeytys, musta naamio, tummempi kuono, pystyt typistetyt korvat, 2 arpea vasemmalla
    c: { coat: '#c39a62', under: '#d7b787', head: '#c69c64', ear: '#2a2018', muzzle: '#1b1512', eye: '#d39a3a' },
    marks: ['belly', 'mask:#1b1512', 'eyeMask:#171210', 'scarL'],
  },
  robert: {
    name: 'Robert', jp: 'ロバート', kind: 'factory', height: 1.1,
    role: 'One of Jerome\'s men, a hound mix. Quiet and steady; the first of the Four Arrows.',
    gait: 'trot', speed: 1.1, wag: 0.25,
    p: { leg: 1.08, body: 1.08, neck: 1.05, ear: 1.3, earTilt: 1.15, tail: 'sabre', tailLen: 1.15, muzzle: 1.25 },
    // canon (JW): amerikkalaisen ajokoiran sekoitus, luppakorvat
    c: { coat: '#9a6633', under: '#dcc199', head: '#a06c38', ear: '#5a3a1e', tail: '#2c2116', muzzle: '#d9bd92' },
    marks: ['saddle:#1d1712', 'muzzleLight', 'belly'],
  },
  rocker: {
    name: 'Rocker', jp: 'ロッカ', kind: 'factory', height: 1.08,
    role: 'One of Jerome\'s men. Black and tan, sharp-eared and fearless.',
    gait: 'trot', speed: 1.15, wag: 0.25,
    p: { leg: 1.15, legW: 0.9, body: 1.05, neck: 1.12, ear: 1.45, earTilt: -0.15, tail: 'docked', muzzle: 1.25 },
    c: { coat: '#1f1c1a', under: '#9a6a36', head: '#211e1c', ear: '#1a1716', muzzle: '#9a6a36' },
    marks: ['tanPoints:#a8743c', 'brows:#b07a40'],
  },
  heuler: {
    name: 'Heuler', jp: 'ホイラー', kind: 'factory', height: 1.14,
    role: 'One of Jerome\'s men. "Let\'s not die yet, Robert. We go together."',
    gait: 'trot', speed: 1.05, wag: 0.25,
    p: { leg: 1.1, body: 1.1, neck: 1.08, ear: 1.3, earTilt: 1.15, tail: 'sabre', tailLen: 1.2, muzzle: 1.25 },
    // canon (JW): gascon-saintongeois – valkomusta ajokoira, luppakorvat
    c: { coat: '#ece6da', under: '#f4f0e8', head: '#1c1a19', ear: '#1c1a19', tail: '#ece6da', muzzle: '#ece6da' },
    marks: ['spots:#1c1a19', 'muzzleLight'],
  },
  north: {
    name: 'North', jp: 'ノース', kind: 'factory', height: 1.12,
    role: 'The fifth of Jerome\'s men. Falls in the ambush inside Gajō, just before Smith\'s sacrifice. (Appearance not confirmed by sources.)',
    gait: 'trot', speed: 1.05, wag: 0.25,
    p: { leg: 1.1, body: 1.08, neck: 1.06, ear: 1.4, tail: 'sabre', tailLen: 1.1, muzzle: 1.2 },
    c: { coat: '#6e6a63', under: '#bdb5a6', head: '#75706a', ear: '#2b2826', tail: '#3b3836', muzzle: '#2a2725' },
    marks: ['saddle:#2a2725', 'mask:#2a2725', 'belly'],
  },
  kite: {
    name: 'Kite', jp: 'カイト', kind: 'factory', height: 1.25,
    role: 'One of Hōgen\'s captains with Kamakiri, Buruge and Batto (romanised Kite / Kaito, "god of wind"). Steel prosthetic forelegs. Defeated, spared, later repents.',
    gait: 'light', speed: 1.2, wag: 0.1,
    p: { leg: 1.15, legW: 1.0, body: 1.08, neck: 1.1, ear: 1.2, earTilt: 0.2, tail: 'sabre', tailLen: 1.1, muzzle: 1.25 },
    c: { coat: '#5b544c', under: '#a39b8e', head: '#5f5850', ear: '#3a3530', muzzle: '#2d2925' },
    marks: ['belly', 'mask:#2d2925'],
    extras: [{ type: 'metalLegs' }, { type: 'collar', color: '#4a2a22' }],
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
    p: { leg: 1.0, body: 1.05, neck: 1.0, ear: 1.35, earTilt: 1.2, tail: 'straight', tailLen: 1.15, muzzle: 1.2 },
    // canon (kuva): kermanvalkoinen, mustat täplät, pitkät mustat korvat
    c: { coat: '#f0e9da', under: '#f8f4ea', head: '#efe7d7', ear: '#1b1918', muzzle: '#efe7d7' },
    marks: ['spots:#1d1a18'],
  },
  lector: {
    name: 'Lector', jp: 'レクター', kind: 'factory', height: 1.12,
    role: 'One of Hōgen\'s Killer Fang assassins. A Dobermann with razor teeth.',
    gait: 'light', speed: 1.25, wag: 0.1,
    p: { leg: 1.2, legW: 0.85, body: 1.02, neck: 1.18, ear: 1.2, earTilt: 0.85, tail: 'docked', muzzle: 1.35 },
    c: { coat: '#181514', under: '#181514', head: '#1b1817', ear: '#171413', muzzle: '#8a4b22', eye: '#e2a23a' },
    marks: ['tanPoints:#8a4b22', 'brows:#9a5526'],
  },
  thunder: {
    name: 'Thunder', jp: 'サンダー', kind: 'factory', height: 1.12,
    role: 'Lector\'s partner in the Killer Fang duo. Red Dobermann, quick as lightning.',
    gait: 'light', speed: 1.25, wag: 0.1,
    p: { leg: 1.2, legW: 0.85, body: 1.02, neck: 1.18, ear: 1.45, earTilt: 0.85, tail: 'docked', muzzle: 1.35 },
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
    name: 'Genba', jp: '玄婆', kind: 'rigged', model: 'hogen_rigged', height: 1.75, tint: '#9c9ea3',   // harmaa, mustat täplät (käyttäjän kooste; väri canonissa epävarma)
    role: 'Hōgen\'s brother: raw strength and rage. Hōgen ends his suffering in tears.',
    gait: 'heavy', speed: 0.9, wag: 0.05,
    rig: { belly: 0.44, neck: 0.26, tail: 0.22, legSwing: 0.42, headAmt: 0.9 },
    outline: 0.009,
  },
};

// Pelissä käytetyt (taso 2) ja galleriassa näytettävät
export const LEVEL2_CAST = ['weed', 'kaibutsu', 'smith', 'jerome', 'ken', 'kagetora', 'robert', 'rocker', 'heuler', 'north', 'gin'];
export const ROSTER = ['weed', 'gin', 'smith', 'jerome', 'ken', 'kagetora', 'robert', 'rocker', 'heuler', 'north', 'kaibutsu',
  'rocket', 'tobee', 'kurotora', 'moss', 'tesshin', 'kite', 'akame', 'john', 'ben', 'gb', 'lector', 'thunder', 'hogen', 'genba'];

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
