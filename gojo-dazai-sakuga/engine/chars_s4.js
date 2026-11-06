/* engine/chars_s4.js (S4) - SPOILER WARNING: finale-only forms + poses (part 4).
   Forms: kyoraku.s4_worn (shikai, wounds 2) · kyoraku.s4_nohat (shikai, wounds 3, no hat) · urahara.s4_bankai_hurt (bankai, wounds 2)
          rengoku.s4_bloody (flame, wounds 2) · rengoku.s4_dawn (base, wounds 2, sword drawn)
   Poses: s4_ren_ninthHold (two-handed blade high at the shoulder, before the last charge) · s4_aka_final (Final Form stance: low, arms open)
          s4_aka_push (arm thrust forward, open palm) · s4_shu_draw (both blades drawn low, leaning forward) · s4_shu_sit (sitting against the rock)
          s4_ura_down (lying, one arm across the chest) · s4_ren_kneel (one knee, both hands cupped low) · s4_ren_stand (standing tall, blade down) */
'use strict';
(function () {
  const K = CAST.kyoraku.forms, U = CAST.urahara.forms, R = CAST.rengoku.forms;
  K.s4_worn = Object.assign({}, K.shikai, { wounds: 2 });
  K.s4_nohat = Object.assign({}, K.shikai, { wounds: 3, noHat: true });
  U.s4_bankai_hurt = Object.assign({}, U.bankai, { wounds: 2 });
  R.s4_bloody = Object.assign({}, R.flame, { wounds: 2 });
  R.s4_dawn = Object.assign({}, R.base || {}, { wounds: 2 });
})();
Object.assign(POSES, {
  s4_ren_ninthHold: { sp: .25, st: .5, hp: .05, aR: [1.7, -.3, 0], eR: 1.5, hR: 'grip', aL: [1.4, -.9, 0], eL: 1.6, hL: 'grip', sword: { hand: 'R', dir: [-.3, .5, -.8], two: true }, lL: [.8, .25, .3], kL: 1.1, lR: [-.5, .2, -.3], kR: .5, face: { eye: 1, lid: .35, mouth: 'shout', mouthOpen: .5 } },
  s4_aka_final: { sp: .35, st: -.2, hp: -.1, aR: [1.2, 1.1, 0], eR: .5, hR: 'claw', aL: [1.2, 1.1, 0], eL: .5, hL: 'claw', lL: [1.0, .45, .35], kL: 1.3, lR: [.9, .45, -.35], kR: 1.3, face: { eye: 1.1, lid: .3, mouth: 'grin', mouthOpen: .45 } },
  s4_aka_push: { sp: .3, st: .3, hp: .05, aR: [1.55, -.05, 0], eR: .05, hR: 'open', wR: [-.8, 0], aL: [.5, .6, 0], eL: 1.2, hL: 'fist', lL: [.7, .2, .2], kL: .8, lR: [-.5, .15, -.2], kR: .3, face: { eye: .7, mouth: 'smile' } },
  s4_shu_draw: { sp: .35, st: -.25, hp: .2, aR: [.7, .55, 0], eR: .35, hR: 'grip', sword: { hand: 'R', dir: [.5, -.35, .8] }, sword2: { dir: [-.6, -.4, .7] }, aL: [.7, .55, 0], eL: .35, hL: 'grip', lL: [.75, .25, .3], kL: 1.0, lR: [-.4, .2, -.3], kR: .4, face: { eye: .6, lid: -.1, mouth: 'smile' } },
  s4_shu_sit: { sp: .15, hp: .1, hr: .15, aL: [.15, .35, 0], eL: .2, hL: 'relax', aR: [.15, .35, 0], eR: .3, hR: 'relax', lL: [1.5, .25, .2], kL: .35, lR: [1.3, .3, -.2], kR: .9, ground: 'all', rest: .02, sword: { sheathed: true }, face: { eye: .35, mouth: 'smile' } },
  s4_ura_down: { ground: 'all', rest: .05, pitch: -HP, hp: -.15, hy: .5, aR: [1.3, -.9, 0], eR: 1.6, hR: 'relax', aL: [.6, 1.2, 0], eL: .4, hL: 'open', lL: [.15, .15, 0], kL: .3, lR: [.05, .1, 0], kR: .1, sword: { sheathed: true }, face: { eye: 0, closed: true, mouth: 'smile' } },
  s4_ren_kneel: { sp: .55, hp: .55, lL: [1.5, .2, 0], kL: 1.55, lR: [.1, .15, 0], kR: 2.5, fR: 1.1, aR: [.75, -.35, 0], eR: 1.1, hR: 'open', wR: [.4, 0], aL: [.75, -.35, 0], eL: 1.1, hL: 'open', wL: [.4, 0], sword: { sheathed: true }, face: { eye: .7, mouth: 'line' } },
  s4_ren_stand: { sp: -.04, hp: -.12, aR: [.25, .25, 0], eR: .25, hR: 'grip', sword: { hand: 'R', dir: [.35, -.9, .2] }, aL: [.1, .2, 0], eL: .2, hL: 'relax', lL: [.12, .12, .1], kL: .1, lR: [-.08, .1, -.1], kR: .05, face: { eye: .8, mouth: 'line' } },
});
// memory flash: the human he was (black hair, plain eyes, no tattoos) - used for 3-4 frames inside a close-up
(function () { const A = CAST.akaza, F0 = A.face;
  A.forms.s4_human = { skin: '#f4d8c2', skinShade: '#d8a890', face: Object.assign({}, F0, { markings: null,
    eye: Object.assign({}, F0.eye, { white: '#fbf8f2', noPupil: false, irisKanji: null, irisCol: '#4a3a5a', irisLight: '#9a88b8', irisDark: '#1a1424', pupilR: .22, pupilCol: '#0c0a12', ink: '#2a1a1e' }),
    hair: Object.assign({}, F0.hair, { col: '#2a2228', shadeCol: '#100c10', glossCol: '#6a5a6a' }) }) }; })();
