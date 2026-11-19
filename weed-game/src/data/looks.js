// Ulkonäkövariantit rigatuille pohjamalleille (tekstuurit: tools/make-looks.mjs -> public/models/looks/<id>.webp).
// Look = pohjamalli + turkin pääväri + merkkikerrokset (järjestyksessä, myöhempi päälle).
// Merkkityypit (ks. make-looks.mjs MARKS): under, saddle, cap, muzzle, mask, cheeks, brows, blaze, ears, socks,
//   legs, tailTip, tail, chest, spots, ticking, stripes, patches, scar.
// Pään paikalliset koordinaatit: hx 0 = pääluu (kallon takaosa) ... 1 = kuonon kärki, hy ylös, hz kylki.
// Nämä ovat pelin omia rotutyypillisiä turkkeja (värit siirretty characters.js:n aiemmista tehdasspekseistä);
// ne eivät kopioi mitään kuvamateriaalia. Ks. docs/weed-game/look-dev-notes.md.
export const LOOKS = {
  // ======== v2: yksityiskohdat säilyttävät värimuunnokset (tools/recolor-looks.mjs) ========
  // grade.gradient = tavoitepaletti pohjan omalle sävyakselille (tummin luokka -> vaalein luokka);
  // flatten 1 = pohjan omat läikät pois (vaalein luokka koko turkkiin), varjostus ja viivat säilyvät.
  // marks: blend 'tone' (oletus: uusi väri, yksityiskohta näkyy läpi) | 'multiply' | 'overlay' | 'softlight' | 'normal'.

  // ---- dobermann-tyypit (pohja john_auto: pystykorvainen paimenkoira; luuskaalaus hahmossa) ----
  pinscher_black_tan: { base: 'john_auto', grade: { gradient: ['#100e0d', '#26201d'] }, marks: [
    { type: 'cheeks', color: '#8c5a2c', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#8c5a2c', extent: 0.8, lower: true },
    { type: 'brows', color: '#9c6630' },
    { type: 'chest', color: '#8c5a2c', w: 0.3, opacity: 0.8 },
    { type: 'socks', color: '#94602f', height: 0.17 },
  ] },
  pinscher_black_rust: { base: 'john_auto', grade: { gradient: ['#0c0b0b', '#1d1a19'] }, marks: [
    { type: 'cheeks', color: '#74371a', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#74371a', extent: 0.78, lower: true },
    { type: 'brows', color: '#82401e', r: 0.085 },
    { type: 'chest', color: '#74371a', w: 0.26, opacity: 0.75 },
    { type: 'socks', color: '#7a3b1c', height: 0.14 },
  ] },
  pinscher_red: { base: 'john_auto', grade: { gradient: ['#3a1b10', '#5e2f1c'] }, marks: [
    { type: 'cheeks', color: '#a86a3c', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#a86a3c', extent: 0.8, lower: true },
    { type: 'brows', color: '#b5733f' },
    { type: 'chest', color: '#a86a3c', w: 0.3, opacity: 0.8 },
    { type: 'socks', color: '#a86a3c', height: 0.16 },
  ] },
  // ---- paimenkoira/susi-tyypit (john_auto) ----
  shepherd_grey_wolf: { base: 'john_auto', grade: { gradient: ['#2b2927', '#9b958b'], chroma: 0.3 }, marks: [
    { type: 'under', color: '#cfc9bd', opacity: 0.85 },
    { type: 'cheeks', color: '#c9c2b4', extent: 0.4, level: 0.05, opacity: 0.7 },
  ] },
  shepherd_sable: { base: 'john_auto', grade: { gradient: ['#3a2a1c', '#a8834f'] } },
  shepherd_bicolor: { base: 'john_auto', grade: { gradient: ['#24201c', '#7d6a55'] }, marks: [
    { type: 'socks', color: '#7a5532', height: 0.12 }] },
  // ---- ajokoirat ja setterit (smith_rigged: pitkäkarvainen luppakorva) ----
  hound_tan_saddle: { base: 'smith_rigged', grade: { gradient: ['#1e1712', '#b37a46'] },
    regionGrades: { head: { gradient: ['#8a5a30', '#b37a46'] }, muzzle: { gradient: ['#8a5a30', '#c99a68'] }, legs: { gradient: ['#a36c3a', '#e2d3bd'] },
      paws: { gradient: ['#e8dcc8', '#f2ebdf'] }, belly: { gradient: ['#c09060', '#e6d6bf'] }, chest: { gradient: ['#e2d3bd', '#f0e8da'] }, ears: { gradient: ['#4a2e1a', '#7a4c2a'] } },
    marks: [{ type: 'saddle', color: '#1b1511', level: 0.1, y: 0.6, tail: 1, neck: 0.5, thigh: 0.3 }] },
  hound_blue_mottled: { base: 'smith_rigged', grade: { gradient: ['#141313', '#e9e6df'] }, marks: [
    { type: 'ticking', color: '#5d6168', blend: 'multiply', size: 0.018, opacity: 0.85, noHead: true },
    { type: 'ticking', color: '#3c3f45', blend: 'multiply', size: 0.03, seed: 9, opacity: 0.6, noHead: true },
    { type: 'brows', color: '#a8743c', r: 0.08 },
    { type: 'ears', color: '#151414' },
  ] },
  setter_belton: { base: 'smith_rigged', grade: { gradient: ['#efe8d9', '#f3eee4'], flatten: 1, chroma: 0.2 }, marks: [
    { type: 'ticking', color: '#3a3532', blend: 'multiply', size: 0.014, opacity: 0.55, dorsal: true, noHead: true },
    { type: 'spots', color: '#1c1a19', size: 0.06, r: 0.34, noBelly: true, seed: 4 },
    { type: 'ears', color: '#1b1918' },
    { type: 'mask', color: '#1b1918', extent: 9, eyes: true, eyeX: 0.42, opacity: 0.9 },
  ] },
  // ---- tanskandoggit ----
  dane_grey_old: { base: 'ken_auto', grade: { gradient: ['#2e2b28', '#6f6a62'], chroma: 0.25 }, marks: [
    { type: 'grizzle', color: '#cfc9be', extent: 0.5, opacity: 0.75 },
    { type: 'under', color: '#a8a296', opacity: 0.7 },
  ] },
  dane_grey_spotted: { base: 'hogen_rigged', grade: { gradient: ['#141317', '#72747b'], chroma: 0.3 } },
  dane_blue: { base: 'ken_auto', grade: { gradient: ['#25272c', '#5f6570'], chroma: 0.15 }, marks: [
    { type: 'chest', color: '#c9ccd2', w: 0.25, opacity: 0.8 }] },
  dane_brindle: { base: 'ken_auto', grade: { gradient: ['#1a1410', '#a07a4c'] }, marks: [
    { type: 'stripes', color: '#2a1f17', blend: 'multiply', freq: 46, thick: 0.4, opacity: 0.85, head: 0.2 }] },
};

// Hahmot, jotka käyttävät lookia rigatun pohjamallin päällä (aiemmin koiratehtaan hahmoja).
// characters.js yhdistää nämä kentät hahmon määrittelyyn (kind/model/look/bones/height korvataan, muu säilyy).
// bones = luiden skaalaus mittasuhteita varten (dogs.js: head, neck, ears, legs, frontLegs, backLegs, tail, spine
//         tai mikä tahansa luun nimi; luku = tasainen skaala, [x,y,z] = akseleittain).
export const LOOK_CAST = {
  jerome:  { model: 'john_auto', height: 1.2, bones: { ears: 1.1 } },   // user: Jerome = the original (lighter) John model; John is the darker one
  robert:  { model: 'smith_rigged', look: 'hound_tan_saddle', height: 1.12, bones: { legs: 1.08, neck: 1.05 } },   // ajokoira-tyyppi: luppakorvat
  heuler:  { model: 'smith_rigged', look: 'hound_blue_mottled', height: 1.14, bones: { legs: 1.1, head: 1.04 } },   // valkomusta pilkullinen ajokoira-tyyppi
  north:   { model: 'john_auto', look: 'shepherd_grey_wolf', height: 1.12, bones: { ears: 1.05 } },
  kite:    { model: 'john_auto', look: 'shepherd_bicolor', height: 1.22, bones: { legs: 1.06 } },
  rocker:  { model: 'john_auto', look: 'pinscher_black_tan', height: 1.08, bones: { ears: 1.2, tail: 0.38, legs: 1.06, head: 0.95 } },
  lector:  { model: 'john_auto', look: 'pinscher_black_rust', height: 1.12, bones: { ears: 1.25, tail: 0.32, legs: 1.08, head: 0.96 } },
  thunder: { model: 'john_auto', look: 'pinscher_red', height: 1.12, bones: { ears: 1.25, tail: 0.32, legs: 1.08, head: 0.96 } },
  ken:     { model: 'ken_auto', height: 1.5, tint: null },   // the user's own Ken model, used as is
  ben:     { model: 'ken_auto', look: 'dane_grey_old', height: 1.46 },   // doggipohja (Kenin malli) harmaana
  genba:   { model: 'hogen_rigged', look: 'dane_grey_spotted', height: 1.75, bones: { head: 1.06, neck: 1.08 }, tint: null },   // harmaa, mustat täplät (värimuunnos, viivat säilyvät)
  gb:      { model: 'smith_rigged', look: 'setter_belton', height: 1.0 },
  akame:   { model: 'akame_auto', height: 1.02, tint: null },   // the user's own Akame model, used as is
};
