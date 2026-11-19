// Äänikartta (Epidemic Sound -tehosteet, public/audio/sfx2_*.mp3 + vanhat sfx_*.mp3). Ks. CREDITS.md.
//
// SOUNDS = atomiset äänet: files (variantit, arvotaan ilman peräkkäistä toistoa), vol (0..1), pitch [min,max]
//   (playbackRate-kerroin, satunnainen), gain [min,max] (dB-satunnaisuus), cat (väylä/miksaus), max (polyfonia:
//   montako samaa ääntä soi yhtä aikaa, vanhin häivytetään), group (latausryhmä: core heti, boss/cine ennen kohtausta).
// EVENTS = pelin tapahtumat (sfx.bite(), sfx.play('crit') …): layers = kerrokset { s: sound, d: viive s, vol, rate,
//   p: todennäköisyys }, duck: [musiikin taso, kesto s, attack] (musiikki hiljenee isoissa iskuissa), ambDuck: sama
//   ambienssille, syn: synteettinen varaääni (jos tiedostot puuttuvat), cool: minimiväli s (ettei spämmi).
// AMBIENCE = kerrokselliset ympäristöpreset (tuuli + lehdet + korpit + vesiputous …), ristiinhäivytys preseteistä toiseen.

import { AUDIO_LEVELS } from './audio_levels.js';

// ------------------------------------------------------------------ MIKSAUSPOLITIIKKA (docs/weed-game/audio-audit.md)
// Tasot mitattu: tools/audio-audit.py -> audio_levels.js. Tiedostoja ei muokata; koodi kompensoi:
//  - musiikki: raitakohtainen trim tavoitteeseen target.music (LUFS, integrated) -> duck -> Music-liukusäädin
//  - puhe: tiedostokohtainen normalisointi target.voice:hen -> kompressori -> Voice-liukusäädin (voice.js)
//  - sfx: varianttien tasaus äänen sisällä (variantTrim) -> vol -> kategoria (cat) -> sfx-väylä -> Effects-liukusäädin
//  - ambienssi: kerroskohtainen trim (ambTrim) -> ambDuck -> Effects-liukusäädin
//  - master: limitteri (DynamicsCompressorNode) ettei summa leikkaa
export const MIX = {
  target: { music: -13, voice: -14 },
  bus: { sfx: 0.9 },
  // kategoriagainit: iskut (combat/boss) eturivissä, liike ja UI taustalla
  cat: { move: 0.85, combat: 1.25, boss: 1.2, env: 0.9, cine: 0.95, ui: 0.9 },
  ambBus: 1.5,
  ambTrim: {},                 // täytetään alla mittauksista (tavoite -24 LUFS ennen preset-painoa)
  duck: {
    speech: 0.32, narrator: 0.16, roar: 0.55,         // musiikin taso puheen alla
    speechAmb: 0.6, narratorAmb: 0.4,                 // ambienssin taso puheen alla
  },
  limiter: { threshold: -4, knee: 2, ratio: 20, attack: 0.002, release: 0.12 },
  voiceComp: { threshold: -22, knee: 8, ratio: 3, attack: 0.004, release: 0.18, makeup: 1.25 },
};
/** Variantin tasaus: tiedoston taso äänen varianttien keskitasoon (±6 dB). Puuttuva mittaus = 1. */
export function variantTrim(file, s) {
  const L = AUDIO_LEVELS[file]; if (!L || !s || s.files.length < 2) return 1;
  if (!s._ref) {
    const ls = s.files.map(f => AUDIO_LEVELS[f]?.[0]).filter(x => x !== undefined).sort((a, b) => a - b);
    s._ref = ls.length ? ls[ls.length >> 1] : L[0];
  }
  return Math.min(2, Math.max(0.5, Math.pow(10, (s._ref - L[0]) / 20)));
}
/** Musiikkiraidan trim tavoitetasoon (ei mittausta: 0.5). */
export function musicTrim(file) {
  const L = AUDIO_LEVELS[file]; if (!L) return 0.5;
  return Math.min(1.6, Math.max(0.08, Math.pow(10, (MIX.target.music - L[0]) / 20)));
}
/** Puhetiedoston normalisointi (voice/<file>) tavoitetasoon, ±8 dB. */
export function voiceTrim(file) {
  const L = AUDIO_LEVELS['voice/' + file]; if (!L) return 1;
  return Math.min(2.5, Math.max(0.4, Math.pow(10, (MIX.target.voice - L[0]) / 20)));
}

const v = (base, n) => Array.from({ length: n }, (_, i) => `sfx2_${base}_${i + 1}.mp3`);

export const SOUNDS = {
  // ------------------------------------------------------------------ liike
  step_dirt:   { files: v('step_dirt', 5), vol: 0.42, pitch: [0.9, 1.12], gain: [-3, 0], cat: 'move', max: 5, group: 'core' },
  step_leaf:   { files: v('step_leaf', 4), vol: 0.3, pitch: [0.92, 1.15], gain: [-4, 0], cat: 'move', max: 4, group: 'core' },
  step_claw:   { files: v('step_claw', 4), vol: 0.22, pitch: [0.95, 1.15], gain: [-4, 0], cat: 'move', max: 3, group: 'core' },
  land:        { files: v('land', 3), vol: 0.85, pitch: [0.9, 1.08], gain: [-2, 0], cat: 'move', max: 2, group: 'core' },
  scuff:       { files: ['sfx2_scuff.mp3'], vol: 0.45, pitch: [0.9, 1.15], cat: 'move', max: 2, group: 'core' },
  claw_scrape: { files: ['sfx2_claw_scrape.mp3'], vol: 0.45, pitch: [0.9, 1.1], cat: 'move', max: 2, group: 'core' },
  fur:         { files: ['sfx2_fur.mp3'], vol: 0.3, pitch: [0.85, 1.15], cat: 'move', max: 2, group: 'core' },
  pant:        { files: ['sfx2_pant.mp3'], vol: 0.45, pitch: [0.95, 1.05], cat: 'move', max: 1, group: 'cine' },
  breath:      { files: ['sfx2_breath.mp3'], vol: 0.5, pitch: [0.9, 1.05], cat: 'move', max: 1, group: 'cine' },
  wade:        { files: v('wade', 3), vol: 0.5, pitch: [0.9, 1.1], cat: 'move', max: 2, group: 'cine' },

  // ------------------------------------------------------------------ taistelu
  bite_snap:   { files: ['sfx2_bite_snap.mp3', 'sfx2_bite_snap_2.mp3'], vol: 1.2, pitch: [0.85, 1.2], gain: [-2, 0], cat: 'combat', max: 3, group: 'core' },
  bite_growl:  { files: ['sfx2_bite_growl_1.mp3', 'sfx2_bite_growl_2.mp3', 'sfx2_bite_growl_3.mp3', 'sfx_bite.mp3'], vol: 0.55, pitch: [0.92, 1.12], gain: [-3, 0], cat: 'combat', max: 2, group: 'core' },
  hit_light:   { files: v('hit_light', 3), vol: 1.0, pitch: [0.9, 1.15], gain: [-2, 0], cat: 'combat', max: 3, group: 'core' },
  hit_med:     { files: [...v('hit_med', 3), 'sfx_hit.mp3'], vol: 1.1, pitch: [0.88, 1.1], gain: [-2, 0], cat: 'combat', max: 3, group: 'core' },
  hit_heavy:   { files: v('hit_heavy', 3), vol: 1.35, pitch: [0.8, 1.0], gain: [-1, 0], cat: 'combat', max: 2, group: 'core' },
  whoosh:      { files: [...v('whoosh', 4), 'sfx_whoosh.mp3'], vol: 0.8, pitch: [0.88, 1.15], gain: [-2, 0], cat: 'combat', max: 3, group: 'core' },
  whoosh_big:  { files: ['sfx2_whoosh_big.mp3'], vol: 0.6, pitch: [0.85, 1.1], cat: 'combat', max: 2, group: 'core' },
  perfect:     { files: ['sfx2_perfect.mp3'], vol: 0.6, pitch: [0.98, 1.04], cat: 'combat', max: 1, group: 'core' },
  parry:       { files: ['sfx2_parry.mp3'], vol: 0.55, pitch: [0.9, 1.1], cat: 'combat', max: 2, group: 'core' },
  yelp:        { files: ['sfx2_yelp_1.mp3', 'sfx2_yelp_2.mp3', 'sfx2_yelp_3.mp3', 'sfx_hurt.mp3'], vol: 0.7, pitch: [0.95, 1.12], gain: [-2, 0], cat: 'combat', max: 1, group: 'core' },
  whimper:     { files: ['sfx2_whimper_1.mp3', 'sfx2_whimper_2.mp3', 'sfx2_whine.mp3'], vol: 0.55, pitch: [0.95, 1.05], cat: 'combat', max: 1, group: 'core' },
  bodyfall:    { files: ['sfx2_bodyfall.mp3'], vol: 1.15, pitch: [0.85, 1.05], cat: 'combat', max: 2, group: 'core' },
  dust:        { files: ['sfx2_dust.mp3'], vol: 0.55, pitch: [0.85, 1.2], gain: [-4, 0], cat: 'combat', max: 3, group: 'core' },
  crit:        { files: ['sfx2_crit.mp3'], vol: 0.75, pitch: [0.95, 1.05], cat: 'combat', max: 1, group: 'core' },
  shockwave:   { files: ['sfx2_shockwave.mp3'], vol: 0.65, pitch: [0.9, 1.1], cat: 'combat', max: 2, group: 'core' },
  sonic_boom:  { files: ['sfx2_sonic_boom.mp3'], vol: 0.85, pitch: [0.97, 1.03], cat: 'combat', max: 1, group: 'core' },
  braam_old:   { files: ['sfx_battoga.mp3'], vol: 0.8, pitch: [0.98, 1.02], cat: 'combat', max: 1, group: 'core' },
  spin_wind:   { files: ['sfx2_spin_wind.mp3'], vol: 0.6, pitch: [0.95, 1.08], cat: 'combat', max: 1, group: 'core' },
  spin_howl:   { files: ['sfx2_spin_howl.mp3'], vol: 0.45, pitch: [0.95, 1.05], cat: 'combat', max: 1, group: 'core' },
  bark:        { files: ['sfx_bark.mp3'], vol: 0.6, pitch: [0.88, 1.15], cat: 'combat', max: 3, group: 'core' },

  // ------------------------------------------------------------------ Kaibutsu / boss
  roar:        { files: ['sfx2_roar_1.mp3', 'sfx2_roar_2.mp3', 'sfx2_roar_3.mp3', 'sfx_roar.mp3'], vol: 0.85, pitch: [0.82, 0.98], gain: [-1, 0], cat: 'boss', max: 1, group: 'boss' },
  boss_growl:  { files: ['sfx2_boss_growl.mp3'], vol: 0.6, pitch: [0.7, 0.9], cat: 'boss', max: 1, group: 'boss' },
  boss_grunt:  { files: ['sfx2_boss_grunt.mp3'], vol: 0.6, pitch: [0.75, 0.95], cat: 'boss', max: 1, group: 'boss' },
  boss_step:   { files: v('boss_step', 3), vol: 0.8, pitch: [0.85, 1.05], gain: [-3, 0], cat: 'boss', max: 3, group: 'boss' },
  rock_lift:   { files: ['sfx2_rock_lift.mp3'], vol: 0.8, pitch: [0.9, 1.05], cat: 'boss', max: 1, group: 'boss' },
  rock_crash:  { files: ['sfx2_rock_crash_1.mp3', 'sfx2_rock_crash_2.mp3', 'sfx_rock.mp3'], vol: 1.25, pitch: [0.85, 1.1], gain: [-3, 0], cat: 'boss', max: 4, group: 'boss' },
  boss_land:   { files: ['sfx2_boss_land.mp3'], vol: 0.85, pitch: [0.9, 1.05], cat: 'boss', max: 1, group: 'boss' },
  quake:       { files: ['sfx2_quake.mp3'], vol: 0.8, pitch: [0.9, 1.05], cat: 'boss', max: 1, group: 'boss' },
  debris:      { files: ['sfx2_debris.mp3'], vol: 0.5, pitch: [0.9, 1.1], cat: 'boss', max: 2, group: 'boss' },
  rockslide:   { files: ['sfx_rockslide.mp3'], vol: 0.9, pitch: [0.95, 1.05], cat: 'boss', max: 1, group: 'boss' },
  heli:        { files: ['sfx2_heli.mp3'], vol: 0.6, pitch: [1, 1], cat: 'env', max: 1, group: 'cine' },

  // ------------------------------------------------------------------ ympäristö (yksittäiset)
  crow:        { files: ['sfx2_crow_1.mp3', 'sfx2_crow_2.mp3', 'sfx2_crow_3.mp3'], vol: 0.22, pitch: [0.9, 1.08], gain: [-6, 0], cat: 'env', max: 1, group: 'amb' },
  splash:      { files: ['sfx2_splash.mp3'], vol: 0.85, pitch: [0.9, 1.0], cat: 'env', max: 1, group: 'cine' },
  underwater:  { files: ['sfx2_underwater.mp3'], vol: 0.6, pitch: [0.9, 1.0], cat: 'env', max: 1, group: 'cine' },

  // ------------------------------------------------------------------ tunne / elokuvallinen
  heartbeat:   { files: ['sfx2_heartbeat.mp3'], vol: 0.9, pitch: [0.95, 1.0], cat: 'cine', max: 1, group: 'cine' },
  spirit_rise: { files: ['sfx2_spirit_rise.mp3'], vol: 0.6, pitch: [0.97, 1.03], cat: 'cine', max: 2, group: 'core' },
  spirit_old:  { files: ['sfx_spirit.mp3'], vol: 0.55, pitch: [0.97, 1.03], cat: 'cine', max: 2, group: 'core' },
  memory:      { files: ['sfx2_memory.mp3'], vol: 0.55, pitch: [1, 1], cat: 'cine', max: 1, group: 'cine' },
  riser:       { files: ['sfx2_riser.mp3'], vol: 0.55, pitch: [0.98, 1.02], cat: 'cine', max: 1, group: 'cine' },
  riser_hit:   { files: ['sfx2_riser_hit.mp3'], vol: 0.7, pitch: [0.98, 1.02], cat: 'cine', max: 1, group: 'cine' },
  riser_air:   { files: ['sfx2_riser_air.mp3'], vol: 0.65, pitch: [0.98, 1.02], cat: 'cine', max: 1, group: 'cine' },
  braam:       { files: ['sfx2_braam.mp3'], vol: 0.7, pitch: [0.98, 1.02], cat: 'cine', max: 1, group: 'cine' },
  cine_boom:   { files: ['sfx2_cine_boom.mp3'], vol: 0.7, pitch: [0.97, 1.03], cat: 'cine', max: 1, group: 'core' },
  slowmo:      { files: ['sfx2_slowmo.mp3'], vol: 0.7, pitch: [0.95, 1.05], cat: 'cine', max: 1, group: 'core' },
  rev_cymbal:  { files: ['sfx2_rev_cymbal.mp3'], vol: 0.45, pitch: [0.98, 1.05], cat: 'cine', max: 1, group: 'core' },
  speed_whoosh:{ files: ['sfx2_speed_whoosh.mp3'], vol: 0.5, pitch: [0.95, 1.1], cat: 'cine', max: 1, group: 'core' },
  up_sweep:    { files: ['sfx2_up_sweep.mp3'], vol: 0.55, pitch: [0.97, 1.05], cat: 'cine', max: 1, group: 'core' },
  scan_ping:   { files: ['sfx2_scan_ping.mp3'], vol: 0.5, pitch: [1, 1], cat: 'cine', max: 3, group: 'core' },
  lock_on:     { files: ['sfx2_lock_on.mp3'], vol: 0.6, pitch: [1, 1], cat: 'cine', max: 1, group: 'core' },
  boss_drone:  { files: ['sfx2_boss_drone.mp3'], vol: 0.5, pitch: [1, 1], cat: 'cine', max: 1, group: 'boss' },

  // ------------------------------------------------------------------ UI
  ui_click:    { files: ['sfx2_ui_click.mp3'], vol: 0.45, pitch: [0.96, 1.06], cat: 'ui', max: 2, group: 'core' },
  ui_confirm:  { files: ['sfx2_ui_confirm.mp3'], vol: 0.5, pitch: [1, 1], cat: 'ui', max: 1, group: 'core' },
  ui_back:     { files: ['sfx2_ui_back.mp3'], vol: 0.45, pitch: [1, 1], cat: 'ui', max: 1, group: 'core' },
  ui_open:     { files: ['sfx2_ui_open.mp3'], vol: 0.45, pitch: [0.98, 1.02], cat: 'ui', max: 1, group: 'core' },
  ui_tick:     { files: ['sfx2_ui_tick.mp3'], vol: 0.3, pitch: [0.95, 1.1], cat: 'ui', max: 2, group: 'core' },
  card_ready:  { files: ['sfx2_card_ready.mp3'], vol: 0.45, pitch: [1, 1], cat: 'ui', max: 1, group: 'core' },
  heart_lost:  { files: ['sfx2_heart_lost.mp3'], vol: 0.5, pitch: [1, 1], cat: 'ui', max: 1, group: 'core' },
  game_over:   { files: ['sfx2_game_over.mp3'], vol: 0.6, pitch: [1, 1], cat: 'ui', max: 1, group: 'core' },
  victory:     { files: ['sfx2_victory.mp3'], vol: 0.55, pitch: [1, 1], cat: 'ui', max: 1, group: 'cine' },
};

// ------------------------------------------------------------------ flesh-paketti (Neljä nuolta, sfx3_*.mp3)
// Ryhmäavaimet (variantit arvotaan) + yksittäiset avaimet <ryhmä>_<N> (esim. bite_flesh_deep_2) suoraan soitettaviksi.
const v3 = (base, n) => Array.from({ length: n }, (_, i) => `sfx3_${base}_${i + 1}.mp3`);
const FLESH = {
  bite_flesh_shallow: { files: v3('bite_flesh_shallow', 4), vol: 0.6, pitch: [0.95, 1.12], gain: [-2, 0], cat: 'combat', max: 2, group: 'cine' },
  bite_flesh_mid:     { files: v3('bite_flesh_mid', 3), vol: 0.75, pitch: [0.9, 1.05], gain: [-2, 0], cat: 'combat', max: 2, group: 'cine' },
  bite_flesh_deep:    { files: v3('bite_flesh_deep', 4), vol: 0.85, pitch: [0.82, 0.95], gain: [-1, 0], cat: 'combat', max: 2, group: 'cine' },
  tear:               { files: v3('tear', 4), vol: 0.6, pitch: [0.85, 1.05], gain: [-2, 0], cat: 'combat', max: 2, group: 'cine' },
  crunch:             { files: v3('crunch', 3), vol: 0.5, pitch: [0.8, 0.95], gain: [-3, 0], cat: 'combat', max: 2, group: 'cine' },
  battlecry_dog:      { files: v3('battlecry_dog', 3), vol: 0.7, pitch: [0.92, 1.08], cat: 'combat', max: 2, group: 'cine' },
  yelp_pain:          { files: [...v3('yelp_pain', 2), 'sfx2_yelp_1.mp3', 'sfx2_yelp_2.mp3', 'sfx2_yelp_3.mp3'], vol: 0.7, pitch: [0.95, 1.1], gain: [-2, 0], cat: 'combat', max: 1, group: 'cine' },
  roar_pain:          { files: v3('roar_pain', 4), vol: 0.85, pitch: [0.72, 0.88], gain: [-1, 0], cat: 'boss', max: 1, group: 'cine' },
  thud_deep:          { files: v3('thud_deep', 3), vol: 1.0, pitch: [0.85, 1.0], cat: 'combat', max: 2, group: 'cine' },
  rush_whoosh:        { files: v3('rush_whoosh', 4), vol: 0.6, pitch: [0.9, 1.12], gain: [-2, 0], cat: 'combat', max: 3, group: 'cine' },
  hide_stretch:       { files: ['sfx3_hide_stretch.mp3'], vol: 0.45, pitch: [0.55, 0.7], cat: 'combat', max: 1, group: 'cine' },
};
for (const [k, s] of Object.entries(FLESH)) {
  SOUNDS[k] = s;
  if (k === 'hide_stretch') continue;
  s.files.filter(f => f.startsWith('sfx3_')).forEach((f, i) => { SOUNDS[`${k}_${i + 1}`] = { ...s, files: [f] }; });
}

/** Tapahtumat. Vanhat nimet (bite, hit, roar, rock, rumble, boom, bark, spirit, whoosh, hurt, tell, card, cutin, perfect,
 *  battoga, howl) säilyvät, jotta olemassa olevat kutsut ja kohtausdatan { sfx: '…' } toimivat ennallaan. */
export const EVENTS = {
  // --- liike
  step:      { cat: 'move', layers: [{ s: 'step_dirt' }, { s: 'step_leaf', d: 0.012, vol: 0.9, p: 0.75 }, { s: 'step_claw', d: 0.02, p: 0.3 }] },
  stepSoft:  { cat: 'move', layers: [{ s: 'step_dirt', vol: 0.55 }, { s: 'step_leaf', d: 0.01, vol: 0.5, p: 0.5 }] },
  stepRock:  { cat: 'move', layers: [{ s: 'step_claw', vol: 1.4 }, { s: 'step_dirt', vol: 0.5 }] },
  // pintakohtaiset askeleet (footsteps.js: setSurface('leaves' | 'dirt' | 'rock' | 'water' | 'snow'); *Soft = kävely)
  stepLeaf:     { cat: 'move', layers: [{ s: 'step_leaf' }, { s: 'step_dirt', d: 0.01, vol: 0.45 }] },
  stepLeafSoft: { cat: 'move', layers: [{ s: 'step_leaf', vol: 0.6, rate: 1.05 }] },
  stepDirt:     { cat: 'move', layers: [{ s: 'step_dirt', vol: 1.15 }, { s: 'step_claw', d: 0.015, vol: 0.5, p: 0.35 }] },
  stepDirtSoft: { cat: 'move', layers: [{ s: 'step_dirt', vol: 0.65 }] },
  stepRockSoft: { cat: 'move', layers: [{ s: 'step_claw', vol: 0.9, rate: 1.05 }, { s: 'step_dirt', vol: 0.3 }] },
  stepSnow:     { cat: 'move', layers: [{ s: 'step_dirt', vol: 0.8, rate: 0.72 }, { s: 'fur', d: 0.01, vol: 0.5, rate: 1.3 }] },   // pehmeä narske (ei omaa lumitiedostoa)
  stepSnowSoft: { cat: 'move', layers: [{ s: 'step_dirt', vol: 0.5, rate: 0.7 }] },
  wade:      { cat: 'move', layers: [{ s: 'wade' }] },
  lunge:     { cat: 'move', layers: [{ s: 'whoosh', vol: 0.45, rate: 1.1 }, { s: 'scuff', vol: 0.5, p: 0.7 }] },
  jump:      { cat: 'move', layers: [{ s: 'scuff', vol: 0.8 }, { s: 'whoosh', d: 0.03, rate: 0.85 }, { s: 'fur', d: 0.02, p: 0.7 }] },
  land:      { cat: 'move', layers: [{ s: 'land' }, { s: 'step_leaf', d: 0.015, vol: 1.2 }, { s: 'dust', d: 0.03, p: 0.5 }], cool: 0.1 },
  slide:     { cat: 'move', layers: [{ s: 'scuff', rate: 0.8 }, { s: 'dust', d: 0.05 }] },
  claw:      { cat: 'move', layers: [{ s: 'claw_scrape' }] },
  fur:       { cat: 'move', layers: [{ s: 'fur' }] },
  tired:     { cat: 'move', layers: [{ s: 'pant' }] },
  breath:    { cat: 'move', layers: [{ s: 'breath' }] },

  // --- taistelu
  bite:      { cat: 'combat', syn: 'bite', layers: [{ s: 'bite_snap' }, { s: 'bite_growl', d: 0.005 }, { s: 'hit_light', d: 0.012, vol: 0.8 }, { s: 'fur', d: 0.02, vol: 0.6, p: 0.4 }] },
  hit:       { cat: 'combat', syn: 'hit', layers: [{ s: 'hit_med' }, { s: 'hit_heavy', d: 0.008, vol: 0.7 }, { s: 'dust', d: 0.04, p: 0.5 }], duck: [0.6, 0.4] },
  hitLight:  { cat: 'combat', syn: 'hit', layers: [{ s: 'hit_light' }] },
  hitMed:    { cat: 'combat', syn: 'hit', layers: [{ s: 'hit_med' }, { s: 'hit_light', d: 0.01, vol: 0.5 }] },
  hitHeavy:  { cat: 'combat', syn: 'hit', layers: [{ s: 'hit_heavy' }, { s: 'hit_med', d: 0.006, vol: 0.7 }, { s: 'shockwave', d: 0.01, vol: 0.4 }], duck: [0.5, 0.6] },
  crit:      { cat: 'combat', syn: 'hit', layers: [{ s: 'crit' }, { s: 'hit_heavy', vol: 0.8 }, { s: 'perfect', d: 0.02, vol: 0.35, rate: 1.25 }], duck: [0.45, 0.9, 0.02], ambDuck: [0.5, 0.9] },
  whoosh:    { cat: 'combat', syn: 'whoosh', layers: [{ s: 'whoosh' }] },
  dodge:     { cat: 'combat', syn: 'whoosh', layers: [{ s: 'whoosh', rate: 1.05 }, { s: 'scuff', d: 0.02, vol: 0.6 }, { s: 'fur', d: 0.03, vol: 0.6, p: 0.6 }] },
  perfect:   { cat: 'combat', syn: 'perfect', layers: [{ s: 'perfect' }, { s: 'slowmo', d: 0.02, vol: 0.7 }], duck: [0.45, 0.8, 0.02], ambDuck: [0.4, 0.8] },
  parry:     { cat: 'combat', syn: 'hit', layers: [{ s: 'parry' }, { s: 'hit_light', vol: 0.5 }, { s: 'rock_crash', d: 0.01, vol: 0.25, p: 0.5 }], cool: 0.15 },
  hurt:      { cat: 'combat', syn: 'hurt', layers: [{ s: 'yelp' }, { s: 'hit_med', vol: 0.85 }, { s: 'heart_lost', d: 0.06, vol: 0.6 }, { s: 'fur', d: 0.02, vol: 0.5 }], duck: [0.55, 0.5] },
  die:       { cat: 'combat', layers: [{ s: 'whimper', vol: 0.9 }, { s: 'bodyfall', d: 0.35 }, { s: 'dust', d: 0.4 }], duck: [0.3, 2.5] },
  whimper:   { cat: 'combat', layers: [{ s: 'whimper' }] },
  bark:      { cat: 'combat', syn: 'bark', layers: [{ s: 'bark' }] },
  howl:      { cat: 'combat', syn: 'howl', layers: [{ s: 'whimper', rate: 1.1, vol: 0.6 }] },
  bodyfall:  { cat: 'combat', layers: [{ s: 'bodyfall' }, { s: 'dust', d: 0.05 }] },
  dust:      { cat: 'combat', layers: [{ s: 'dust' }, { s: 'debris', d: 0.02, vol: 0.35, p: 0.5 }] },
  shockwave: { cat: 'combat', layers: [{ s: 'shockwave' }, { s: 'dust', d: 0.08, vol: 0.7 }] },
  battoga:   { cat: 'combat', syn: 'battoga', layers: [{ s: 'spin_wind' }, { s: 'spin_howl', vol: 0.9 }, { s: 'up_sweep', vol: 0.8 }, { s: 'bite_growl', d: 0.05, vol: 0.7 }, { s: 'whoosh_big', d: 0.25 }], duck: [0.5, 1.2] },
  boom:      { cat: 'combat', syn: 'boom', layers: [{ s: 'sonic_boom' }, { s: 'hit_heavy' }, { s: 'crit', d: 0.01, vol: 0.7 }, { s: 'shockwave', d: 0.02, vol: 0.8 }, { s: 'bite_snap', vol: 0.8 }], duck: [0.25, 1.8, 0.02], ambDuck: [0.3, 1.8] },
  zetsu:     { cat: 'combat', syn: 'battoga', layers: [{ s: 'riser_air' }, { s: 'spin_wind', rate: 0.85 }, { s: 'spin_howl', d: 0.2 }, { s: 'speed_whoosh', d: 0.4 }, { s: 'whoosh_big', d: 0.8, rate: 0.8 }, { s: 'sonic_boom', d: 0.96 }, { s: 'braam_old', d: 0.98, vol: 0.6 }], duck: [0.2, 3, 0.05], ambDuck: [0.2, 3] },

  // --- laumakortit / cut-in
  card:      { cat: 'ui', syn: 'card', layers: [{ s: 'ui_confirm' }, { s: 'whoosh', d: 0.02, vol: 0.4, rate: 1.2 }] },
  cardReady: { cat: 'ui', layers: [{ s: 'card_ready' }], cool: 0.3 },
  denied:    { cat: 'ui', syn: 'tell', layers: [{ s: 'ui_back', vol: 0.8 }] },
  cutin:     { cat: 'cine', syn: 'cutin', layers: [{ s: 'whoosh_big', rate: 1.15 }, { s: 'up_sweep', vol: 0.8 }, { s: 'hit_heavy', d: 0.09, vol: 0.6 }, { s: 'perfect', d: 0.07, vol: 0.3, rate: 1.4 }], duck: [0.4, 1.2] },
  gallopIn:  { cat: 'move', layers: [{ s: 'step_dirt', vol: 0.6 }, { s: 'step_dirt', d: 0.09, vol: 0.5 }, { s: 'step_dirt', d: 0.2, vol: 0.6 }, { s: 'step_leaf', d: 0.1, vol: 0.6 }, { s: 'whoosh', d: 0.15, vol: 0.4 }] },
  twinFang:  { cat: 'combat', layers: [{ s: 'bite_snap' }, { s: 'bite_snap', d: 0.07, rate: 1.15 }, { s: 'crit', d: 0.02, vol: 0.8 }, { s: 'shockwave', d: 0.03 }, { s: 'hit_heavy', d: 0.05, vol: 0.7 }], duck: [0.3, 1.2, 0.02] },
  scan:      { cat: 'cine', layers: [{ s: 'scan_ping' }, { s: 'scan_ping', d: 0.14, rate: 1.12, vol: 0.8 }, { s: 'scan_ping', d: 0.28, rate: 1.25, vol: 0.7 }] },
  lockOn:    { cat: 'cine', layers: [{ s: 'lock_on' }, { s: 'perfect', d: 0.02, vol: 0.35, rate: 1.5 }] },
  sacrifice: { cat: 'cine', layers: [{ s: 'heartbeat' }, { s: 'boss_drone', vol: 0.5 }, { s: 'perfect', d: 0.4, vol: 0.3, rate: 0.75 }], duck: [0.5, 2] },

  // --- Neljä nuolta: jokainen purenta syvemmälle (kerrokset: rush-whoosh → hampaiden transientti → liha → matala
  //     tömähdys → huuto/vinkaisu). Soita ~0,07 s ennen osumaa (whoosh johtaa), tai osumahetkellä.
  arrowRush:   { cat: 'combat', layers: [{ s: 'rush_whoosh' }, { s: 'battlecry_dog', d: 0.02, vol: 0.8 }] },
  arrow_bite_1: { cat: 'combat', layers: [{ s: 'rush_whoosh', vol: 0.6 }, { s: 'bite_snap', d: 0.07 }, { s: 'bite_flesh_shallow', d: 0.075 }, { s: 'hide_stretch', d: 0.1, vol: 0.6 }, { s: 'thud_deep', d: 0.08, vol: 0.45 }, { s: 'roar_pain', d: 0.25, vol: 0.6 }], duck: [0.5, 1.0, 0.02], ambDuck: [0.5, 1.0] },
  arrow_bite_2: { cat: 'combat', layers: [{ s: 'rush_whoosh', vol: 0.7 }, { s: 'bite_snap', d: 0.07 }, { s: 'bite_flesh_mid', d: 0.075 }, { s: 'tear', d: 0.16, vol: 0.7 }, { s: 'thud_deep', d: 0.08, vol: 0.7 }, { s: 'hit_heavy', d: 0.075, vol: 0.6 }, { s: 'roar_pain', d: 0.22, vol: 0.8 }], duck: [0.35, 1.3, 0.02], ambDuck: [0.4, 1.3] },
  arrow_bite_3: { cat: 'combat', layers: [{ s: 'rush_whoosh', vol: 0.8 }, { s: 'bite_snap', d: 0.07 }, { s: 'bite_flesh_deep', d: 0.075 }, { s: 'crunch', d: 0.12, vol: 0.6 }, { s: 'tear', d: 0.3, vol: 0.8 }, { s: 'thud_deep', d: 0.075 }, { s: 'crit', d: 0.08, vol: 0.6 }, { s: 'roar_pain', d: 0.2 }, { s: 'yelp_pain', d: 0.9, vol: 0.6, p: 0.5 }], duck: [0.2, 2.0, 0.02], ambDuck: [0.25, 2.0] },
  fleshBite:   { cat: 'combat', layers: [{ s: 'bite_snap' }, { s: 'bite_flesh_mid', d: 0.005 }, { s: 'thud_deep', d: 0.01, vol: 0.5 }] },
  battleCry:   { cat: 'combat', layers: [{ s: 'battlecry_dog' }] },
  yelpPain:    { cat: 'combat', layers: [{ s: 'yelp_pain' }, { s: 'thud_deep', vol: 0.4 }], duck: [0.5, 0.8] },
  roarPain:    { cat: 'boss', layers: [{ s: 'roar_pain' }], duck: [0.45, 1.6], ambDuck: [0.5, 1.6] },
  thudDeep:    { cat: 'combat', layers: [{ s: 'thud_deep' }] },
  rushWhoosh:  { cat: 'combat', layers: [{ s: 'rush_whoosh' }] },
  strain:      { cat: 'cine', layers: [{ s: 'breath', rate: 0.9 }, { s: 'heartbeat', d: 0.1, vol: 0.8 }] },

  // --- Kaibutsu
  roar:    { cat: 'boss', syn: 'roar', layers: [{ s: 'roar' }, { s: 'boss_growl', d: 0.9, vol: 0.5, p: 0.5 }], duck: [0.45, 1.6], ambDuck: [0.5, 1.6] },
  growl:     { cat: 'boss', layers: [{ s: 'boss_growl' }] },
  tell:      { cat: 'boss', syn: 'tell', layers: [{ s: 'boss_growl', vol: 0.8 }, { s: 'rev_cymbal', vol: 0.8 }] },
  bossStep:  { cat: 'boss', layers: [{ s: 'boss_step' }, { s: 'step_leaf', d: 0.02, vol: 0.9, rate: 0.75, p: 0.6 }, { s: 'dust', d: 0.05, vol: 0.6, p: 0.25 }] },
  rockLift:  { cat: 'boss', layers: [{ s: 'rock_lift' }, { s: 'boss_grunt', d: 0.05 }] },
  throw:     { cat: 'boss', syn: 'whoosh', layers: [{ s: 'whoosh_big', rate: 0.75 }, { s: 'boss_grunt', p: 0.6 }] },
  rock:      { cat: 'boss', syn: 'rock', layers: [{ s: 'rock_crash' }, { s: 'dust', d: 0.03, p: 0.6 }, { s: 'debris', d: 0.06, vol: 0.5, p: 0.25 }] },
  bossLand:  { cat: 'boss', syn: 'rock', layers: [{ s: 'boss_land' }, { s: 'shockwave', vol: 0.6 }, { s: 'rock_crash', d: 0.02, vol: 0.5, p: 0.6 }, { s: 'debris', d: 0.1, vol: 0.5 }], duck: [0.55, 0.8] },
  bossCrash: { cat: 'boss', syn: 'rock', layers: [{ s: 'rock_crash', vol: 0.9 }, { s: 'boss_land', vol: 0.6 }, { s: 'debris', d: 0.08 }], duck: [0.6, 0.6] },
  rumble:    { cat: 'boss', syn: 'rumble', layers: [{ s: 'quake' }, { s: 'rockslide', d: 0.15, vol: 0.8 }, { s: 'debris', d: 0.6, vol: 0.6 }], duck: [0.5, 2.5], ambDuck: [0.5, 2.5] },
  quake:     { cat: 'boss', syn: 'rumble', layers: [{ s: 'quake' }, { s: 'debris', d: 0.4, vol: 0.5 }], duck: [0.55, 2] },
  armor:     { cat: 'boss', layers: [{ s: 'rock_crash', vol: 0.6, rate: 0.7 }, { s: 'crit', vol: 0.5, rate: 0.8 }, { s: 'braam', d: 0.05, vol: 0.6 }], duck: [0.4, 2] },
  knockdown: { cat: 'boss', layers: [{ s: 'boss_land', rate: 0.85 }, { s: 'bodyfall', d: 0.05, rate: 0.7 }, { s: 'debris', d: 0.15 }, { s: 'roar', vol: 0.5, rate: 0.75 }], duck: [0.3, 2] },

  // --- ympäristö
  crow:      { cat: 'env', layers: [{ s: 'crow' }] },
  splash:    { cat: 'env', layers: [{ s: 'splash' }, { s: 'underwater', d: 0.55, vol: 0.8 }], duck: [0.35, 2.5], ambDuck: [0.3, 2.5] },
  heli:      { cat: 'env', syn: 'rumble', layers: [{ s: 'heli' }], ambDuck: [0.5, 10] },

  // --- tunne / elokuvallinen
  spirit:    { cat: 'cine', syn: 'spirit', layers: [{ s: 'spirit_rise' }, { s: 'spirit_old', d: 0.15, vol: 0.7 }], cool: 0.4 },
  heartbeat: { cat: 'cine', layers: [{ s: 'heartbeat' }] },
  memory:    { cat: 'cine', layers: [{ s: 'memory' }, { s: 'spirit_old', d: 0.3, vol: 0.4 }] },
  riser:     { cat: 'cine', layers: [{ s: 'riser' }] },
  braam:     { cat: 'cine', layers: [{ s: 'braam' }, { s: 'cine_boom', vol: 0.5 }], duck: [0.4, 2] },
  cineBoom:  { cat: 'cine', layers: [{ s: 'cine_boom' }], duck: [0.5, 1.5] },
  bossAppear:{ cat: 'cine', layers: [{ s: 'riser_hit' }, { s: 'braam', d: 0.7, vol: 0.8 }], duck: [0.4, 3] },
  slowmo:    { cat: 'cine', layers: [{ s: 'slowmo' }], cool: 0.5 },
  freeze:    { cat: 'cine', layers: [{ s: 'perfect', rate: 1.3, vol: 0.55 }, { s: 'hit_light', vol: 0.4 }], cool: 0.2 },
  speed:     { cat: 'cine', layers: [{ s: 'speed_whoosh' }], cool: 0.4 },
  upSweep:   { cat: 'cine', layers: [{ s: 'up_sweep' }] },
  revCymbal: { cat: 'cine', layers: [{ s: 'rev_cymbal' }] },
  levelStart:{ cat: 'cine', layers: [{ s: 'cine_boom', vol: 0.8 }, { s: 'rev_cymbal', vol: 0.5 }] },
  caption:   { cat: 'ui', layers: [{ s: 'whoosh', vol: 0.25, rate: 0.8 }], cool: 0.3 },

  // --- UI
  ui:        { cat: 'ui', layers: [{ s: 'ui_click' }], cool: 0.05 },
  uiConfirm: { cat: 'ui', layers: [{ s: 'ui_confirm' }] },
  uiBack:    { cat: 'ui', layers: [{ s: 'ui_back' }] },
  uiOpen:    { cat: 'ui', layers: [{ s: 'ui_open' }] },
  tick:      { cat: 'ui', layers: [{ s: 'ui_tick' }], cool: 0.04 },
  skip:      { cat: 'ui', layers: [{ s: 'whoosh', rate: 1.3, vol: 0.5 }, { s: 'ui_click', vol: 0.8 }], cool: 0.3 },
  start:     { cat: 'ui', layers: [{ s: 'ui_confirm' }, { s: 'cine_boom', d: 0.08, vol: 0.5 }] },
  heartLost: { cat: 'ui', layers: [{ s: 'heart_lost' }] },
  gameOver:  { cat: 'ui', layers: [{ s: 'game_over' }], duck: [0.15, 4] },
  victory:   { cat: 'ui', layers: [{ s: 'victory' }], duck: [0.3, 4] },
};

/** Kerroksellinen ambienssi: layer -> tiedosto. Presetit: layer -> äänenvoimakkuus (crows = satunnaiset korpit). */
export const AMB_FILES = {
  forest: 'sfx2_amb_forest.mp3',       // tuuli puissa + kuivat lehdet (myöhäissyksy)
  wind: 'sfx_ambience.mp3',            // vanha syysyön miksaus (tuuli + korpit kaukana) – varalla
  waterfall: 'sfx2_amb_waterfall.mp3', // kaukainen vesiputous (alipäästetty)
  river: 'sfx2_amb_river.mp3',
  gorge: 'sfx2_amb_gorge.mp3',         // rotkon ulvova tuuli
  dawn: 'sfx2_amb_dawn.mp3',           // aamu: tuuli + harvat linnut
  drone: 'sfx2_boss_drone.mp3',        // bossin matala drone (sub)
};
// ambienssikerrosten tasaus: jokainen silmukka -24 LUFS:iin ennen preset-painoa (gorge -31 -> +7 dB, river -22 -> -2 dB)
for (const [k, f] of Object.entries(AMB_FILES)) { const L = AUDIO_LEVELS[f]; MIX.ambTrim[k] = L ? Math.min(2.5, Math.max(0.4, Math.pow(10, (-24 - L[0]) / 20))) : 1; }
export const AMBIENCE = {
  battle: { forest: 0.55, waterfall: 0.14, crows: true },
  boss:   { forest: 0.45, waterfall: 0.12, drone: 0.22, crows: true },
  night:  { forest: 0.32, waterfall: 0.1, crows: false },
  sad:    { gorge: 0.22, forest: 0.18, crows: false },
  gorge:  { gorge: 0.5, waterfall: 0.3, crows: false },
  river:  { river: 0.45, waterfall: 0.42, forest: 0.12, crows: false },
  dusk:   { forest: 0.32, river: 0.2, crows: true },
  dawn:   { dawn: 0.5, river: 0.15, crows: false },
};

/** Ryhmät latausta varten (core heti initAudiossa, boss/cine startLevelissä ennen kohtausta, amb presetin mukaan). */
export function filesOfGroup(g) {
  const out = new Set();
  for (const s of Object.values(SOUNDS)) if (s.group === g) s.files.forEach(f => out.add(f));
  return [...out];
}
export const CATEGORIES = ['move', 'combat', 'boss', 'env', 'cine', 'ui'];
