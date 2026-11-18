// Ulkonäkövariantit rigatuille pohjamalleille (tekstuurit: tools/make-looks.mjs -> public/models/looks/<id>.webp).
// Look = pohjamalli + turkin pääväri + merkkikerrokset (järjestyksessä, myöhempi päälle).
// Merkkityypit (ks. make-looks.mjs MARKS): under, saddle, cap, muzzle, mask, cheeks, brows, blaze, ears, socks,
//   legs, tailTip, tail, chest, spots, ticking, stripes, patches, scar.
// Pään paikalliset koordinaatit: hx 0 = pääluu (kallon takaosa) ... 1 = kuonon kärki, hy ylös, hz kylki.
// Nämä ovat pelin omia rotutyypillisiä turkkeja (värit siirretty characters.js:n aiemmista tehdasspekseistä);
// ne eivät kopioi mitään kuvamateriaalia. Ks. docs/weed-game/look-dev-notes.md.
export const LOOKS = {
  // ---- paimenkoirat (pohja: john_auto, susimainen pystykorva) ----
  // ruskeankeltainen paimenkoira, musta satula ja kuono
  shepherd_tan_saddle: { base: 'john_auto', coat: '#b47a3c', marks: [
    { type: 'under', color: '#d9a764' },
    { type: 'saddle', color: '#1e1712', level: 0.05, y: 0.6, tail: 1, neck: 0.9, thigh: 0.4 },
    { type: 'muzzle', color: '#1f1813', extent: 0.62 },
    { type: 'mask', color: '#1f1813', extent: 0.78, eyes: true, opacity: 0.85 },
    { type: 'ears', color: '#2a1f17' },
    { type: 'tailTip', color: '#16110d', from: 0.6 },
  ] },
  // tummanruskea paimenkoira, leveä musta satula + tumma naamio
  shepherd_dark_saddle: { base: 'john_auto', coat: '#6b4f33', marks: [
    { type: 'under', color: '#a57d4e' },
    { type: 'legs', color: '#9a7347', y: 0.3 },
    { type: 'saddle', color: '#17110c', level: -0.1, y: 0.55, tail: 1, neck: 1, thigh: 0.6, head: 0.6 },
    { type: 'mask', color: '#1b140e', extent: 0.5 },
    { type: 'ears', color: '#1d1610' },
  ] },
  // harmaanruskea (soopeli) paimenkoira, kapeampi tumma satula
  shepherd_grey_sable: { base: 'john_auto', coat: '#7e6c5a', marks: [
    { type: 'under', color: '#bfae96' },
    { type: 'legs', color: '#a8957c', y: 0.28 },
    { type: 'saddle', color: '#3d342b', level: 0.25, y: 0.64, tail: 0.8, neck: 0.6, thigh: 0.2 },
    { type: 'muzzle', color: '#2d261f', extent: 0.72 },
    { type: 'ears', color: '#3a3028' },
    { type: 'cheeks', color: '#b4a28a', extent: 0.4, level: 0.0, opacity: 0.7 },
  ] },
  // ---- dobermann/pinseri-tyypit (pohja: john_auto + luuskaalaus: lyhytkarvainen siluetti tehdään hahmossa) ----
  pinscher_black_tan: { base: 'john_auto', coat: '#1f1c1a', detail: 0.8, marks: [
    { type: 'cheeks', color: '#9a6a36', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#9a6a36', extent: 0.8, lower: true },
    { type: 'brows', color: '#b07a40' },
    { type: 'chest', color: '#9a6a36', w: 0.35, opacity: 0.85 },
    { type: 'socks', color: '#a8743c', height: 0.17 },
    { type: 'under', color: '#3a2b1e', level: -0.25, innerLegs: false, chest: 0, throat: false, opacity: 0.6 },
  ] },
  pinscher_black_rust: { base: 'john_auto', coat: '#181514', detail: 0.8, marks: [
    { type: 'cheeks', color: '#8a4b22', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#8a4b22', extent: 0.8, lower: true },
    { type: 'brows', color: '#9a5526' },
    { type: 'chest', color: '#8a4b22', w: 0.3, opacity: 0.8 },
    { type: 'socks', color: '#8a4b22', height: 0.16 },
  ] },
  pinscher_red: { base: 'john_auto', coat: '#5e2f1c', detail: 0.8, marks: [
    { type: 'cheeks', color: '#b97a45', extent: 0.42, level: 0.15 },
    { type: 'muzzle', color: '#b97a45', extent: 0.8, lower: true },
    { type: 'brows', color: '#c4844c' },
    { type: 'chest', color: '#b97a45', w: 0.3, opacity: 0.8 },
    { type: 'socks', color: '#b97a45', height: 0.16 },
  ] },
  // ---- tanskandoggit (pohja: hogen_rigged) ----
  dane_blue: { base: 'hogen_rigged', coat: '#666c78', detail: 0.9, marks: [
    { type: 'under', color: '#8c919c' },
    { type: 'chest', color: '#d8dbe0', w: 0.3 },
    { type: 'muzzle', color: '#3b3f47', extent: 0.7 },
    { type: 'ears', color: '#4f545e' },
  ] },
  dane_grey_old: { base: 'hogen_rigged', coat: '#8d8478', detail: 0.9, marks: [
    { type: 'under', color: '#b7ae9f' },
    { type: 'muzzle', color: '#4a443d', extent: 0.66 },
    { type: 'muzzle', color: '#c9c2b6', extent: 0.86, opacity: 0.8 },
    { type: 'mask', color: '#c4bdb1', extent: 2, eyes: true, opacity: 0.55 },
    { type: 'ears', color: '#5e574e' },
  ] },
  dane_tan_brute: { base: 'hogen_rigged', coat: '#9c7656', detail: 0.9, marks: [
    { type: 'under', color: '#c4a582' },
    { type: 'muzzle', color: '#2b221c', extent: 0.62 },
    { type: 'ears', color: '#3a2d24' },
    { type: 'scar', color: '#e3c9b3', space: 'body', a: [0.12, 0.6, 0.16], b: [-0.08, 0.5, 0.17], w: 0.012 },
  ] },
  // ---- setteri (pohja: smith_rigged, pitkäkarvainen, luppakorva) ----
  setter_white_spotted: { base: 'smith_rigged', coat: '#f2eee6', detail: 0.9, marks: [
    { type: 'under', color: '#fbf9f4' },
    { type: 'ticking', color: '#6e5a4b', size: 0.02, opacity: 0.55, dorsal: true },
    { type: 'spots', color: '#3b2c22', size: 0.07, r: 0.38, noBelly: true },
    { type: 'ears', color: '#4a3424' },
    { type: 'mask', color: '#4a3424', extent: 9, eyes: true, eyeX: 0.42, opacity: 0.9 },
  ] },
  // ---- japanilainen pystykorva (pohja: kagetora_true_auto) ----
  kishu_red: { base: 'kagetora_true_auto', coat: '#a8492f', marks: [
    { type: 'under', color: '#e7c7a4' },
    { type: 'cheeks', color: '#e4c09a', extent: 0.3, level: 0.25 },
    { type: 'muzzle', color: '#e4c09a', extent: 0.75 },
    { type: 'legs', color: '#c98a5c', y: 0.2, opacity: 0.6 },
    { type: 'ears', color: '#7a3220', opacity: 0.6 },
    { type: 'scar', color: '#f0d5c0', a: [0.25, 0.55, 0.3], b: [0.55, 0.15, 0.36], w: 0.05 },
  ] },
};

// Hahmot, jotka käyttävät lookia rigatun pohjamallin päällä (aiemmin koiratehtaan hahmoja).
// characters.js yhdistää nämä kentät hahmon määrittelyyn (kind/model/look/bones/height korvataan, muu säilyy).
// bones = luiden skaalaus mittasuhteita varten (dogs.js: head, neck, ears, legs, frontLegs, backLegs, tail, spine
//         tai mikä tahansa luun nimi; luku = tasainen skaala, [x,y,z] = akseleittain).
export const LOOK_CAST = {
  jerome:  { model: 'john_auto', height: 1.2, bones: { ears: 1.1 } },   // user: Jerome = the original (lighter) John model; John is the darker one
  robert:  { model: 'john_auto', look: 'shepherd_dark_saddle', height: 1.12, bones: { head: 1.04 } },
  heuler:  { model: 'john_auto', look: 'shepherd_grey_sable', height: 1.14, bones: { ears: 1.05 } },
  rocker:  { model: 'john_auto', look: 'pinscher_black_tan', height: 1.08, bones: { ears: 1.2, tail: 0.38, legs: 1.06, head: 0.95 } },
  lector:  { model: 'john_auto', look: 'pinscher_black_rust', height: 1.12, bones: { ears: 1.25, tail: 0.32, legs: 1.08, head: 0.96 } },
  thunder: { model: 'john_auto', look: 'pinscher_red', height: 1.12, bones: { ears: 1.25, tail: 0.32, legs: 1.08, head: 0.96 } },
  ken:     { model: 'hogen_rigged', look: 'dane_blue', height: 1.5, bones: { head: 0.95 } },
  ben:     { model: 'hogen_rigged', look: 'dane_grey_old', height: 1.46 },
  genba:   { model: 'hogen_rigged', look: 'dane_tan_brute', height: 1.75, bones: { head: 1.06, neck: 1.08 }, tint: null },
  gb:      { model: 'smith_rigged', look: 'setter_white_spotted', height: 1.0 },
  akame:   { model: 'kagetora_true_auto', look: 'kishu_red', height: 1.02 },
};
