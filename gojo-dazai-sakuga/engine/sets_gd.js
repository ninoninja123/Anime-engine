/* engine/sets_gd.js (project gojo-dazai-sakuga): Yokohama harbour at SUNSET - saturated magenta/orange sky, warm rim, teal water.
   Use: f.bg({ set: 'yokohama', pal: 'harbor_dusk', moonDir: [...] }) + std(f, { pal: 'harbor_dusk' }).                          */
'use strict';
Object.assign(PALETTES, {
  harbor_dusk: { skyTop: '#241a66', skyMid: '#a03a86', skyLow: '#ff8a52', fog: '#d86a7a', sun: [.15, .35, -1], ground: '#6a5a6e', ground2: '#3a2c42', wall: '#b04a3a', wallShade: '#521e2a',
    roof: '#3e2a44', roofShade: '#1c1222', wood: '#5a3226', cloud: '#ffa07a', cloudShade: '#7a2e66', haze: .5, line: '#0c0612', amb: '#ffb48a', stars: false },
});
Object.assign(GRADES, { harbor_dusk: { sat: 1.18, contrast: 1.1, tint: ['#ffd0c0', .1], lift: ['#2a0e3a', .06] } });
if (typeof SAD_PALPOST !== 'undefined') Object.assign(SAD_PALPOST, { harbor_dusk: { bloom: .5 } });
