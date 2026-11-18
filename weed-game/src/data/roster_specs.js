// Laajennettu hahmoluettelo (koiratehtaan hahmot, joita characters.js ei vielä määrittele).
//
// LINJAUS (sama kuin README:ssä): hahmot ovat pelin OMIA tyyliteltyjä low-poly-koiria. Ulkonäkö
// rakennetaan koirarodun yleisistä piirteistä (rotumääritelmät: värit, korvat, häntä, mittasuhteet)
// sekä tarinan roolista (docs/weed-game/research.md). Animen/mangan hahmosuunnittelua ei kopioida.
// Jokaisella hahmolla on `look`-kenttä: mistä ulkonäkö tulee ja mikä on pelin oma ratkaisu (OMA).
//
// Skeema on sama kuin characters.js:n factory-hahmoilla:
//   p  = mittasuhteet (leg, legW, body, neck, head, ear, earTilt, tail, tailLen, muzzle)
//   c  = värit (coat, under, legs, head, ear, tail, muzzle, eye, nose)
//   marks = maalatut kuviot (dogs.js PAINT)
// Lisäkentät tässä tiedostossa:
//   group  = 'ou' (Ōun lauma) | 'hogen' (Hōgenin armeija) | 'ally' (liittolaiset / muut) | 'wild'
//   breed  = rotu
//   extras = lisäosat (src/accessories.js): eyeScar, blind, collar, scarf, tusks, bristles, snout,
//            metalLegs, aura, mane, scars, earNotch
//   base   = toisen hahmon id, jonka arvot peritään (variantit)

const SOLDIER_COLLAR = '#7d1f1a';   // OMA: Hōgenin armeijan tumma punainen kaulapanta (tunnistettavuus)
const KISHU_COLLAR = '#3d4a2a';     // OMA: Kamakirin Kishū-joukkojen oliivinvihreä panta
const KOGA_SCARF = '#2b2f3a';       // OMA: Kōga-ninjojen tumma kaulahuivi

export const ROSTER_SPECS = {
  // ================= Ōun lauma ja liittolaiset =================
  hiro: {
    name: 'Hiro', jp: 'ヒロ', kind: 'factory', height: 1.5, group: 'ou', breed: 'Great Pyrenees',
    role: 'Pyrenean mountain dog of enormous strength, nicknamed "Tamatori". Seeks revenge on Kamakiri.',
    gait: 'heavy', speed: 0.95, wag: 0.3,
    p: { leg: 1.05, legW: 1.35, body: 1.2, neck: 1.0, head: 1.18, ear: 0.85, earTilt: 1.05, tail: 'straight', tailLen: 1.15, muzzle: 1.05 },
    c: { coat: '#f1ede2', under: '#faf8f2', head: '#f3efe5', ear: '#d8c6a6', tail: '#ece6d8', muzzle: '#f6f3ea', nose: '#1a1716' },
    marks: ['belly'],
    extras: [{ type: 'eyeScar', side: 'L' }, { type: 'mane', color: '#f4f0e6', size: 0.9 }],
    look: 'Rotu (research.md): pyreneittenkoira -> valkoinen, iso, raskas, roikkuvat korvat, tuuhea häntä, '
      + 'kermanväriset korvat (rodulle tyypillinen "badger"-merkki). Silmän menetys Kamakirille (research.md). '
      + 'OMA: kaulaharja korostamaan kokoa.',
  },
  mel: {
    name: 'Mel', jp: 'メル', kind: 'factory', height: 1.08, group: 'ally', breed: 'Golden Retriever',
    role: 'A gentle golden retriever who helps young Weed on the road to Ōu.',
    gait: 'trot', speed: 1.0, wag: 0.7,
    p: { leg: 1.0, legW: 1.08, body: 1.08, neck: 1.0, head: 1.05, ear: 0.95, earTilt: 1.1, tail: 'straight', tailLen: 1.2, muzzle: 1.1 },
    c: { coat: '#d9a24e', under: '#ecc683', head: '#dba653', ear: '#c38a3c', tail: '#cf9644', muzzle: '#e4b46a' },
    marks: ['belly', 'muzzleLight'],
    extras: [{ type: 'mane', color: '#e3b260', size: 0.55 }],
    look: 'Rotu (tehtävänanto): kultainennoutaja -> kultainen turkki, roikkuvat korvat, sulkahäntä. Muu OMA.',
  },
  kyoshiro: {
    name: 'Kyōshirō', jp: '狂四郎', kind: 'factory', height: 1.0, group: 'ally', breed: 'Kishu',
    role: 'A kishu who leads a band of abandoned dogs. Wild, proud and fast.',
    gait: 'light', speed: 1.2, wag: 0.3,
    p: { leg: 1.02, body: 1.0, neck: 1.0, head: 1.0, ear: 1.0, earTilt: -0.1, tail: 'curl', muzzle: 1.05 },
    c: { coat: '#ece4d4', under: '#f8f4ec', head: '#efe8da', ear: '#e0d4bf', muzzle: '#f4efe5', eye: '#4a2c18' },
    marks: ['belly'],
    extras: [{ type: 'scars', count: 2 }, { type: 'earNotch', side: 'R' }],
    look: 'Rotu (tehtävänanto): kishu -> rodun yleisin väri valkoinen, pystykorvat, kippurahäntä. '
      + 'ARVAUS/OMA: villin elämän arvet ja korvalovi; väri valittu rodun yleisimmästä.',
  },
  tesshin: {
    name: 'Tesshin', jp: '鉄心', kind: 'factory', height: 0.9, group: 'ally', breed: 'Japanese dog (Kōga ninja)',
    role: 'Leader of the Kōga ninja dogs. Teaches Weed the inherited Zetsu Tenrō Battōga.',
    gait: 'light', speed: 1.25, wag: 0.2,
    p: { leg: 0.98, legW: 0.95, body: 0.98, neck: 0.95, head: 1.0, ear: 1.05, earTilt: -0.15, tail: 'curl', muzzle: 1.0 },
    c: { coat: '#2e2a28', under: '#9d7a55', head: '#302c2a', ear: '#262220', muzzle: '#a8835c', eye: '#d6a43c' },
    marks: ['tanPoints:#a8835c', 'brows:#b48d62'],
    extras: [{ type: 'scarf', color: KOGA_SCARF, tail: true }],
    look: 'ARVAUS: rotua ei ole varmistettu lähteistä. Valittu keskikokoinen japanilainen pystykorva, '
      + 'musta-ruskea (shiba/kai-tyyppinen väritys). OMA: Kōga-ninjan kaulahuivi.',
  },
  koga_ninja: {
    name: 'Kōga ninja', jp: '甲賀忍犬', kind: 'factory', height: 0.88, group: 'ally', breed: 'Japanese dog',
    role: 'A ninja dog of the Kōga clan.', base: 'tesshin',
    c: { coat: '#5b4a3d', under: '#b79a78', head: '#5e4c3f', ear: '#4a3c31', muzzle: '#c2a481' },
    marks: ['belly', 'muzzleLight'],
    extras: [{ type: 'scarf', color: KOGA_SCARF, tail: true }],
    look: 'OMA geneerinen Kōga-ninja: ruskea pystykorva + tumma huivi.',
  },
  jet: {
    name: 'Jet', jp: 'ジェット', kind: 'factory', height: 1.16, group: 'ou', breed: 'Borzoi',
    role: 'Borzoi, Rocket\'s brother. Executed by Hōgen; returns as one of Ōu\'s spirits.',
    gait: 'light', speed: 1.35, wag: 0.25,
    p: { leg: 1.35, legW: 0.72, body: 1.12, neck: 1.25, head: 0.9, ear: 0.8, earTilt: 0.6, tail: 'sabre', tailLen: 1.45, muzzle: 1.6 },
    c: { coat: '#f0ebe2', under: '#fbf8f2', head: '#f0ebe2', ear: '#3a302a', tail: '#ece5d8', muzzle: '#f4efe6' },
    marks: ['patches:#3a302a', 'belly'],
    look: 'Rotu (research.md): borzoi -> pitkät jalat, kapea pitkä kuono, pitkä matala häntä, taittuvat korvat. '
      + 'ARVAUS: väritys (valkoinen tummin laikuin) valittu rodun tavallisista väreistä, jotta erottuu Missilestä.',
  },
  missile: {
    name: 'Missile', jp: 'ミサイル', kind: 'factory', height: 1.14, group: 'ou', breed: 'Borzoi', base: 'jet',
    role: 'Borzoi, Rocket\'s brother. Executed by Hōgen; returns as one of Ōu\'s spirits.',
    c: { coat: '#d9a46a', under: '#f3e3cc', head: '#dcaa72', ear: '#a8723f', tail: '#e8c9a0', muzzle: '#c88f57' },
    marks: ['belly', 'mask:#7a4c26'],
    look: 'Kuten Jet. ARVAUS: punaruskea (red/cream) borzoi, tumma maski -> veljekset erottuvat väreistä.',
  },
  teru: {
    name: 'Teru', jp: 'テル', kind: 'factory', height: 0.72, group: 'ally', breed: 'mixed (young)',
    role: 'A young dog whose father once mistreated him, and then died protecting him.',
    gait: 'light', speed: 1.15, wag: 0.6,
    p: { leg: 0.92, legW: 0.95, body: 0.92, neck: 0.9, head: 1.15, ear: 1.1, earTilt: 0.35, tail: 'straight', tailLen: 0.9, muzzle: 0.85 },
    c: { coat: '#b08458', under: '#e6d0b0', head: '#b5895c', ear: '#7a5634', muzzle: '#e0c6a2' },
    marks: ['belly', 'muzzleLight', 'socks'],
    look: 'ARVAUS: rotu tuntematon. Nuori sekarotuinen, iso pää ja puolipystyt korvat = nuoruus. '
      + 'Väritys sama kuin isällä, jotta sukulaisuus näkyy.',
  },
  teru_father: {
    name: 'Teru\'s father', jp: 'テルの父', kind: 'factory', height: 1.2, group: 'ally', breed: 'mixed',
    role: 'A hard dog who mistreated his son, then gave his life shielding him from the Killer Fangs.',
    gait: 'heavy', speed: 0.95, wag: 0.15,
    p: { leg: 1.05, legW: 1.2, body: 1.12, neck: 1.05, head: 1.12, ear: 1.0, earTilt: 0.35, tail: 'straight', tailLen: 1.0, muzzle: 1.1 },
    c: { coat: '#8d6540', under: '#c9ab84', head: '#906843', ear: '#5c3f26', muzzle: '#3b2a1c' },
    marks: ['belly', 'mask:#3b2a1c'],
    extras: [{ type: 'scars', count: 3 }],
    look: 'ARVAUS: rotu tuntematon. Teru isompana ja karumpana: sama ruskea, tumma maski, arvet.',
  },
  ryu: {
    name: 'Ryū', jp: 'リュウ', kind: 'factory', height: 1.05, group: 'ou', breed: 'Japanese dog (anime original)',
    role: 'Anime-original warrior, Ryō\'s brother. Killed by Hōgen.',
    gait: 'trot', speed: 1.1, wag: 0.3,
    p: { leg: 1.02, body: 1.02, neck: 1.0, head: 1.0, ear: 1.0, tail: 'curl', muzzle: 1.05 },
    c: { coat: '#b45a2a', under: '#f0dcc0', head: '#b85e2d', ear: '#8e4420', muzzle: '#ecd4b4' },
    marks: ['belly', 'muzzleLight'],
    look: 'ARVAUS: animeoriginaali, rotua ei varmistettu. Punainen japanilainen pystykorva (shiba-tyyppi).',
  },
  ryo: {
    name: 'Ryō', jp: 'リョウ', kind: 'factory', height: 1.03, group: 'ou', breed: 'Japanese dog (anime original)', base: 'ryu',
    role: 'Anime-original warrior, Ryū\'s brother.',
    c: { coat: '#4a3c33', under: '#c9a983', head: '#4d3e35', ear: '#3a2e27', muzzle: '#c9a983' },
    marks: ['belly', 'brows:#c9a983', 'muzzleLight'],
    look: 'ARVAUS: kuten Ryū, mutta "sesami/musta-ruskea" väritys -> veljekset erottuvat.',
  },
  ou_fighter_a: {
    name: 'Ōu warrior', jp: '奥羽の戦士', kind: 'factory', height: 1.0, group: 'ou', breed: 'Shiba-type',
    role: 'A warrior of the Ōu pack.',
    gait: 'trot', speed: 1.05, wag: 0.4,
    p: { leg: 0.98, body: 0.98, ear: 1.0, tail: 'curl', muzzle: 1.0 },
    c: { coat: '#c97a3c', under: '#f4e2c6', head: '#cc7e40', ear: '#a86030', muzzle: '#f0dcbf' },
    marks: ['belly', 'muzzleLight', 'socks'],
    look: 'OMA geneerinen: punainen shiba-tyyppi (Ōun koirat ovat pääosin japanilaisia rotuja).',
  },
  ou_fighter_b: {
    name: 'Ōu warrior', jp: '奥羽の戦士', kind: 'factory', height: 1.08, group: 'ou', breed: 'Kai-type', base: 'ou_fighter_a',
    p: { leg: 1.04, body: 1.04, ear: 1.05, tail: 'sabre', tailLen: 1.0, muzzle: 1.05 },
    c: { coat: '#3e342d', under: '#6d5c4e', head: '#40362e', ear: '#2e2621', muzzle: '#2b241f' },
    marks: ['brindle:#1b1612'],
    look: 'OMA geneerinen: kai-tyyppinen tiikerijuova.',
  },
  ou_fighter_c: {
    name: 'Ōu warrior', jp: '奥羽の戦士', kind: 'factory', height: 1.12, group: 'ou', breed: 'Hokkaido-type', base: 'ou_fighter_a',
    p: { leg: 1.0, legW: 1.15, body: 1.05, head: 1.08, ear: 0.9, tail: 'curl', muzzle: 0.95 },
    c: { coat: '#d9d2c4', under: '#f2eee6', head: '#dcd5c8', ear: '#b9b0a1', muzzle: '#efeae0' },
    marks: ['belly', 'scars'],
    extras: [{ type: 'scars', count: 1 }],
    look: 'OMA geneerinen: hokkaido-tyyppinen vaalea, tanakka.',
  },
  ou_fighter_d: {
    name: 'Ōu warrior', jp: '奥羽の戦士', kind: 'factory', height: 1.02, group: 'ou', breed: 'Sesame Japanese dog', base: 'ou_fighter_a',
    c: { coat: '#9a6c45', under: '#ead6b8', head: '#7b5538', ear: '#5d3f28', muzzle: '#e6d0ae' },
    marks: ['belly', 'saddle:#4a3322', 'muzzleLight'],
    look: 'OMA geneerinen: sesami-väritys (tumma selkä).',
  },

  // ================= Hōgenin armeija =================
  hogen_shinigami: {
    name: 'Hōgen (Death God)', jp: '死神 法玄', kind: 'factory', height: 1.95, group: 'hogen', base: 'hogen',
    role: 'Abandoned by all, Hōgen awakens "like a god of death" on Futago Pass.',
    c: { coat: '#1f1b1a', under: '#2a2422', head: '#221d1c', ear: '#151211', muzzle: '#0e0c0b', eye: '#ff3b2a' },
    marks: ['scar', 'brindle:#121010'],
    extras: [{ type: 'aura', color: '#5a1020', power: 1 }, { type: 'scars', count: 4 }],
    look: 'Finaaliversio: research.md ("herää kuin kuolemanjumala"). OMA: tummempi turkki, punaiset silmät, aura.',
  },
  kamakiri: {
    name: 'Kamakiri', jp: 'カマキリ', kind: 'factory', height: 1.75, group: 'hogen', breed: 'Irish Wolfhound',
    role: 'Irish wolfhound whose fangs are stronger than Hōgen\'s. He killed Hiro\'s father and took Hiro\'s eye.',
    gait: 'light', speed: 1.1, wag: 0.05,
    p: { leg: 1.45, legW: 0.95, body: 1.18, neck: 1.3, head: 1.02, ear: 0.75, earTilt: 0.55, tail: 'sabre', tailLen: 1.5, muzzle: 1.5 },
    c: { coat: '#8a8780', under: '#a19e96', head: '#86837c', ear: '#55524c', tail: '#7c7972', muzzle: '#5e5b55', eye: '#d9e04a' },
    marks: ['brindle:#6a6761', 'mask:#4a4843'],
    extras: [{ type: 'mane', color: '#7f7c75', size: 0.6, shaggy: true }, { type: 'scars', count: 3 }, { type: 'eyeScar', side: 'R' }],
    look: 'Rotu (research.md): irlanninsusikoira -> erittäin korkea, karkea harmaa karva, pitkä häntä, '
      + 'pienet taaksepäin taittuvat korvat, parransuu. ARVAUS: silmäarpi (tehtävänannon "yksisilmäinen/arpinen").',
  },
  kamakiri_broken: {
    name: 'Kamakiri (fangs broken)', jp: 'カマキリ', kind: 'factory', group: 'hogen', base: 'kamakiri',
    role: 'After Hiro breaks his fangs, Kamakiri is left in the snow.',
    extras: [{ type: 'mane', color: '#7f7c75', size: 0.6, shaggy: true }, { type: 'scars', count: 5 }, { type: 'eyeScar', side: 'R' }],
    c: { coat: '#7d7a74', under: '#94918a', muzzle: '#4f4c47', eye: '#9aa040' },
    look: 'Myöhäisvaihe research.md:n mukaan. OMA: lisää arpia, himmeämmät silmät.',
  },
  kishu_soldier_a: {
    name: 'Kamakiri\'s soldier', jp: 'カマキリ兵', kind: 'factory', height: 1.22, group: 'hogen', breed: 'Lurcher-type',
    role: 'One of Kamakiri\'s Kishū troops.',
    gait: 'light', speed: 1.15, wag: 0.05,
    p: { leg: 1.25, legW: 0.85, body: 1.08, neck: 1.15, ear: 0.8, earTilt: 0.5, tail: 'sabre', tailLen: 1.3, muzzle: 1.35 },
    c: { coat: '#6e6a62', under: '#8b867c', head: '#6a665e', ear: '#45423d', muzzle: '#47443f' },
    marks: ['brindle:#55524c'],
    extras: [{ type: 'collar', color: KISHU_COLLAR }],
    look: 'OMA geneerinen: Kamakirin kaltainen harmaa vinttikoiraristeytys + oliivinvihreä panta.',
  },
  kishu_soldier_b: {
    name: 'Kamakiri\'s soldier', jp: 'カマキリ兵', kind: 'factory', height: 1.15, group: 'hogen', base: 'kishu_soldier_a',
    c: { coat: '#4b4038', under: '#7a6a5c', head: '#4d4239', ear: '#2f2823', muzzle: '#2f2823' },
    marks: ['mask:#2a231f'],
    extras: [{ type: 'collar', color: KISHU_COLLAR }, { type: 'scars', count: 1 }],
    look: 'OMA geneerinen: tumma vinttikoiraristeytys.',
  },
  soldier_a: {
    name: 'Hōgen\'s soldier', jp: '法玄軍', kind: 'factory', height: 1.12, group: 'hogen', breed: 'Mixed (mastiff-type)',
    role: 'A soldier of Hōgen\'s 700-strong army.',
    gait: 'heavy', speed: 1.0, wag: 0.05,
    p: { leg: 1.0, legW: 1.25, body: 1.08, neck: 0.95, head: 1.15, ear: 0.8, earTilt: 0.8, tail: 'straight', tailLen: 0.9, muzzle: 0.95 },
    c: { coat: '#7a5a3c', under: '#9c7c5a', head: '#7d5d3e', ear: '#4e3826', muzzle: '#2b1f16' },
    marks: ['mask:#2b1f16'],
    extras: [{ type: 'collar', color: SOLDIER_COLLAR }],
    look: 'OMA geneerinen: ruskea mastiffityyppi + Hōgenin armeijan punainen panta.',
  },
  soldier_b: {
    name: 'Hōgen\'s soldier', jp: '法玄軍', kind: 'factory', height: 1.1, group: 'hogen', breed: 'Mixed (shepherd-type)', base: 'soldier_a',
    p: { leg: 1.1, legW: 1.0, body: 1.08, neck: 1.08, head: 1.0, ear: 1.35, earTilt: -0.05, tail: 'sabre', tailLen: 1.1, muzzle: 1.2 },
    c: { coat: '#2a2624', under: '#5a4e45', head: '#2c2826', ear: '#211e1c', muzzle: '#1d1a18' },
    marks: ['belly'],
    extras: [{ type: 'collar', color: SOLDIER_COLLAR }, { type: 'scars', count: 1 }],
    look: 'OMA geneerinen: musta paimenkoiratyyppi.',
  },
  soldier_c: {
    name: 'Hōgen\'s soldier', jp: '法玄軍', kind: 'factory', height: 1.04, group: 'hogen', breed: 'Mixed (spotted)', base: 'soldier_a',
    p: { leg: 1.05, legW: 1.0, body: 1.0, neck: 1.0, head: 1.0, ear: 1.0, earTilt: 0.9, tail: 'straight', tailLen: 1.0, muzzle: 1.1 },
    c: { coat: '#e6e0d4', under: '#f2eee6', head: '#e6e0d4', ear: '#3a3330', muzzle: '#e6e0d4' },
    marks: ['patches:#3a3330'],
    extras: [{ type: 'collar', color: SOLDIER_COLLAR }],
    look: 'OMA geneerinen: valkoinen laikukas sekarotuinen.',
  },
  soldier_d: {
    name: 'Hōgen\'s soldier', jp: '法玄軍', kind: 'factory', height: 1.2, group: 'hogen', breed: 'Mixed (bull-type)', base: 'soldier_a',
    p: { leg: 0.92, legW: 1.4, body: 1.12, neck: 0.85, head: 1.25, ear: 0.7, earTilt: 0.2, tail: 'docked', muzzle: 0.8 },
    c: { coat: '#9a7e66', under: '#d9cbb8', head: '#9e826a', ear: '#6c5544', muzzle: '#2c2420' },
    marks: ['chestBlaze:#e4d8c6', 'mask:#2c2420'],
    extras: [{ type: 'collar', color: SOLDIER_COLLAR, spikes: true }],
    look: 'OMA geneerinen: tanakka bulldoggityyppi, piikkipanta.',
  },
  buruge: {
    name: 'Buruge', jp: 'ブルゲ', kind: 'factory', height: 1.3, group: 'hogen', breed: 'Bulldog/mastiff-type',
    role: 'One of Hōgen\'s generals. Surrenders when Gin is rescued.',
    gait: 'heavy', speed: 0.9, wag: 0.05,
    p: { leg: 0.88, legW: 1.55, body: 1.15, neck: 0.85, head: 1.35, ear: 0.7, earTilt: 0.35, tail: 'docked', muzzle: 0.78 },
    c: { coat: '#c4a682', under: '#e6d6c0', head: '#c8aa86', ear: '#7c6348', muzzle: '#2a211b', eye: '#d8902a' },
    marks: ['chestBlaze:#ece1d0', 'mask:#2a211b'],
    extras: [{ type: 'collar', color: '#3c3a38', spikes: true }, { type: 'scars', count: 2 }],
    look: 'ARVAUS: rotua ei varmistettu. Nimi viittaa bulldoggiin -> leveä, matala, iso pää, lyhyt kuono. '
      + 'OMA: kenraalin piikkipanta.',
  },
  batto: {
    name: 'Batto', jp: 'バット', kind: 'factory', height: 1.25, group: 'hogen', breed: 'Mixed (hound-type)',
    role: 'A blind general of Hōgen\'s, who fights with "the eye of the heart".',
    gait: 'trot', speed: 1.0, wag: 0.05,
    p: { leg: 1.12, legW: 1.05, body: 1.1, neck: 1.05, head: 1.05, ear: 1.1, earTilt: 1.15, tail: 'sabre', tailLen: 1.1, muzzle: 1.25 },
    c: { coat: '#4f4a52', under: '#7c7680', head: '#524c55', ear: '#2e2b31', muzzle: '#2a272d', eye: '#dfe6ea' },
    marks: ['muzzleGrey', 'belly'],
    extras: [{ type: 'blind' }, { type: 'collar', color: '#3c3a38' }, { type: 'scars', count: 2 }],
    look: 'Sokeus (research.md). ARVAUS: rotu tuntematon -> roikkokorvainen ajokoiratyyppi, '
      + 'harmaa-sininen. Sokeat silmät: vaaleat, arpi silmien yli (OMA).',
  },
  kaito: {
    name: 'Kaito', jp: '海斗', kind: 'factory', height: 1.25, group: 'hogen', breed: 'Mixed (sighthound-type)',
    role: 'Hōgen\'s general, "god of the wind". In the anime he runs on metal forelegs.',
    gait: 'light', speed: 1.3, wag: 0.05,
    p: { leg: 1.25, legW: 0.95, body: 1.08, neck: 1.15, head: 0.98, ear: 1.3, earTilt: -0.2, tail: 'sabre', tailLen: 1.3, muzzle: 1.35 },
    c: { coat: '#c9c2b2', under: '#e8e2d6', head: '#cbc4b5', ear: '#8c8474', muzzle: '#d6cfc1', eye: '#4fb2d8' },
    marks: ['belly', 'saddle:#9b9282'],
    extras: [{ type: 'metalLegs', color: '#8d97a3' }, { type: 'collar', color: '#3c3a38' }],
    look: 'Metalliset etujalat (research.md, anime). ARVAUS: rotu tuntematon -> kevyt, pitkäjalkainen '
      + 'tuulen nopeuden takia, vaalea. Silmien sininen = OMA.',
  },
  blue: {
    name: 'Blue', jp: 'ブルー', kind: 'factory', height: 1.08, group: 'ally', breed: 'Mixed (stray)',
    role: 'A bandit dog on the road. He dies shielding young Weed from a truck.',
    gait: 'trot', speed: 1.05, wag: 0.2,
    p: { leg: 1.02, legW: 1.05, body: 1.05, neck: 1.0, head: 1.05, ear: 1.0, earTilt: 0.4, tail: 'straight', tailLen: 1.0, muzzle: 1.1 },
    c: { coat: '#6c7a8a', under: '#a8b2bc', head: '#6f7d8d', ear: '#47525e', muzzle: '#3c4550', eye: '#9ad0f0' },
    marks: ['brindle:#56626f', 'belly'],
    extras: [{ type: 'scars', count: 2 }, { type: 'earNotch', side: 'L' }],
    look: 'Rooli (research.md): rosvokoira. ARVAUS: ulkonäköä ei varmistettu -> nimen mukaan sinertävän '
      + 'harmaa kulkukoira, arvet ja korvalovi (OMA).',
  },
  nero: {
    name: 'Nero', jp: 'ネロ', kind: 'factory', height: 1.3, group: 'ally', breed: 'Mixed (rottweiler-type)',
    role: 'Boss of the bandit dogs, once GB\'s and Sasuke\'s leader.',
    gait: 'heavy', speed: 0.95, wag: 0.05,
    p: { leg: 1.02, legW: 1.35, body: 1.12, neck: 1.0, head: 1.2, ear: 0.8, earTilt: 0.8, tail: 'docked', muzzle: 1.0 },
    c: { coat: '#1c1918', under: '#1f1c1b', head: '#1e1b1a', ear: '#171413', muzzle: '#8c5a2e', eye: '#e0b03c' },
    marks: ['tanPoints:#8c5a2e', 'brows:#9c6634'],
    extras: [{ type: 'collar', color: '#5a4a38', spikes: true }, { type: 'scars', count: 3 }],
    look: 'Rooli (research.md): rosvojen pomo. ARVAUS: ulkonäköä ei varmistettu -> tanakka musta-ruskea '
      + 'rottweilertyyppi, piikkipanta (OMA), selkeästi isompi kuin Blue.',
  },
  lenny: {
    name: 'Lenny', jp: 'レニー', kind: 'factory', height: 1.05, group: 'ally', breed: 'Mixed',
    role: 'A dog Weed meets on his journey.',
    gait: 'trot', speed: 1.05, wag: 0.4,
    p: { leg: 1.0, body: 1.02, neck: 1.0, head: 1.0, ear: 1.2, earTilt: 0.2, tail: 'straight', tailLen: 1.05, muzzle: 1.15 },
    c: { coat: '#a67a4c', under: '#e6d2b6', head: '#a97d4f', ear: '#6e4c2c', muzzle: '#e2cba9' },
    marks: ['belly', 'chestBlaze:#efe2cc', 'socks'],
    look: 'ARVAUS: ulkonäköä tai roolia ei varmistettu lähteistä. Neutraali ruskea sekarotuinen, valkoinen rinta.',
  },

  // ================= villieläimet =================
  sancho: {
    name: 'Sancho', jp: 'サンチョ', kind: 'factory', height: 1.25, group: 'wild', breed: 'Wild boar',
    role: 'A huge wild boar that preys on dogs. Weed brings it down at the hot spring.',
    gait: 'heavy', speed: 0.95, wag: 0.25, boar: true,
    p: { leg: 0.62, legW: 1.45, body: 1.55, neck: 0.55, head: 1.3, ear: 0.55, earTilt: -0.3, tail: 'straight', tailLen: 0.55, muzzle: 1.35 },
    c: { coat: '#3a2e26', under: '#4a3c32', legs: '#2a221d', head: '#3e3229', ear: '#2a221d', tail: '#2a221d', muzzle: '#5a4a40', nose: '#6b5246', eye: '#e2532a' },
    marks: ['brindle:#2b221c'],
    extras: [{ type: 'bristles', color: '#1e1814' }, { type: 'tusks' }, { type: 'snout', color: '#7a5e50' }, { type: 'scars', count: 3 }],
    look: 'Laji (research.md): villisika -> tanakka, korkea etuosa, lyhyet jalat, harjasharja selässä, '
      + 'torahampaat, litteä kärsä, ohut häntä. Tehtaan koiravartaloa venytetty ja lisäosat koodissa.',
  },

  // ================= prologi =================
  weed_pup: {
    name: 'Weed (pup)', jp: 'ウィード（子犬）', kind: 'rigid', model: 'weed', height: 0.46, group: 'ou',
    role: 'Weed as a newborn pup, carried to Ōu by GB.',
    gait: 'light', speed: 0.9, wag: 0.8,
    rig: { belly: 0.36, neck: 0.36, tail: 0.24, legSwing: 0.55, headAmt: 1 },
    outline: 0.012,
    look: 'Weedin oma malli pienennettynä (prologi).',
  },
};

// Gallerian luokittelu kaikille hahmoille (myös characters.js:n omille).
export const GROUP_OF = {
  weed: 'ou', gin: 'ou', smith: 'ou', jerome: 'ou', ken: 'ou', kagetora: 'ou', robert: 'ou', rocker: 'ou',
  heuler: 'ou', rocket: 'ou', tobee: 'ou', kurotora: 'ou', moss: 'ou', akame: 'ou', john: 'ou', ben: 'ou',
  gb: 'ou', kaibutsu: 'wild', lector: 'hogen', thunder: 'hogen', hogen: 'hogen', genba: 'hogen',
};
for (const [id, s] of Object.entries(ROSTER_SPECS)) GROUP_OF[id] = s.group;

export const GROUP_LABEL = {
  ou: 'Ōu pack', hogen: 'Hōgen\'s army', ally: 'Allies & others', wild: 'Beasts',
};

/** Perii base-hahmon arvot (p, c, rig yms. yhdistetään kentittäin). */
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
