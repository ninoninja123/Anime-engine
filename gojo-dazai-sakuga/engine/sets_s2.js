/* engine/sets_s2.js (agent S2, harry-vs-gojo) - palettes / grades for showdown/part2.js (the sets themselves come from sets_hvg.js via BGX).
   (Replaces the old gowther-dazai-urahara file of the same name; nothing in this project referenced it.)
   PALETTES/GRADES: s2dawn (cloud sea at sunrise, last shot), s2void_cold (Unlimited Void with a colder, emptier grade), s2forest (moonlit forest, warmer silver)  */
'use strict';
PALETTES.s2dawn = Object.assign({}, PALETTES.heavens || {}, { skyTop: '#1a2458', skyMid: '#8a7ab8', skyLow: '#ffc890', fog: '#f0c8b0', sun: [.2, .25, -.9], cloud: '#ffe0c8', cloudShade: '#8a6a9a', amb: '#ffd8b8', haze: .6 });
PALETTES.s2void_cold = Object.assign({}, PALETTES.void_inf || {}, { skyMid: '#04081a', skyLow: '#081430', amb: '#c8e8ff' });
PALETTES.s2forest = Object.assign({}, PALETTES.forest_night || {}, { fog: '#2a4048', amb: '#c8dcf0', skyLow: '#2a3a48' });
Object.assign(GRADES, {
  s2dawn: { sat: 1.1, contrast: 1.04, soft: ['#ffd8b0', .22], lift: ['#2a1a3a', .05] },
  s2void_cold: { sat: .9, contrast: 1.18, tint: ['#c8dcff', .12] },
  s2forest: { sat: .8, contrast: 1.12, tint: ['#b8cce0', .22], lift: ['#0a1820', .07] },
});
if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, { s2dawn: { bloom: .45, halation: .12 }, s2void_cold: { bloom: .55 }, s2forest: { bloom: .55 } });
