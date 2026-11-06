/* engine/poses_core.js (E1) - extended sakuga pose library (usable by every character) + death pose library.
   ground: 'all' (rig.js) = the whole body rests on the ground (lying / sprawled); 'rest' = body thickness (m).
   FIST FIGHTING:  f_guard f_jab f_cross f_hookWind f_hook f_uppercutWind f_uppercut f_elbow f_knee f_roundWind f_roundhouse
                   f_spinBack f_axeWind f_axe f_palm f_headbutt f_grapple f_rush1 f_rush2 (alternate for rapid punches)
   SWORD:          s_iai (draw stance) s_iaiCut s_overheadWind s_overhead s_diagWind s_diag s_backhand s_lunge s_parry s_crossGuard
                   s_spinCut s_upperCut s_reverseGrip s_sheathe s_bladeRest (blade on shoulder)
   AIR:            a_leap a_dive a_flip a_spinKick a_airPunch a_hover a_fallBack a_slamDown a_glide a_superman
   THROW / HIT:    t_grabWind t_throw t_hurled (thrown, spinning) t_hitHead t_hitBody t_hitBack t_doubleOver t_knockback
                   t_skid (sliding back, feet dragging) t_wallHit t_getUp t_kneelPant t_staggerL t_staggerR
   DEATH:          death_fallBack (toppling backward) death_fallFwd death_kneel (dying on knees, head bowed) death_slump (seated)
                   death_sprawl (lying on the back, arms out) death_face (face down) death_side (curled on the side)
                   death_impaled (run through: arched, arms limp) death_reach (last reach to the sky) death_standing (dies on his feet)
                   death_air (limp mid-air, ragdoll) death_split (torso twist for fxSplitFig) death_crumble (head back, arms rising: ash)
   Lying poses already rest on the ground (ground: 'all'); just give pos + yaw.                                              */
'use strict';
Object.assign(POSES, {
  // ------------------------------------------------------------------ fist fighting
  f_guard: { sp: .2, st: -.35, hp: .12, aL: [1.15, -.1, 0], eL: 1.9, hL: 'fist', aR: [.95, .05, 0], eR: 2.15, hR: 'fist', lL: [.45, .2, .25], kL: .6, lR: [-.35, .18, -.3], kR: .45, fR: .3 },
  f_jab: { sp: .25, st: -.15, hp: .12, aL: [1.55, -.05, 0], eL: .02, hL: 'fist', aR: [.95, .05, 0], eR: 2.15, hR: 'fist', lL: [.6, .2, .25], kL: .75, lR: [-.45, .18, -.3], kR: .3, fR: .35 },
  f_cross: { sp: .38, st: -.8, hp: .15, hy: .3, aR: [1.58, -.1, 0], eR: 0, hR: 'fist', aL: [1.0, .3, 0], eL: 2.1, hL: 'fist', lL: [.8, .2, .3], kL: .95, lR: [-.75, .2, -.3], kR: .15, fR: .5 },
  f_hookWind: { sp: .15, st: .55, hp: .1, aR: [1.3, 1.3, .3], eR: 1.6, hR: 'fist', aL: [1.1, -.1, 0], eL: 1.9, hL: 'fist', lL: [.5, .25, .3], kL: .7, lR: [-.35, .2, -.3], kR: .5 },
  f_hook: { sp: .3, st: -.9, hp: .15, hy: .4, aR: [1.5, -.55, .4], eR: 1.5, hR: 'fist', aL: [1.0, .4, 0], eL: 2.0, hL: 'fist', lL: [.6, .25, .3], kL: .8, lR: [-.5, .2, -.4], kR: .3, fR: .4 },
  f_uppercutWind: { sp: .45, st: .3, hp: .2, aR: [.3, .4, 0], eR: 1.9, hR: 'fist', aL: [1.1, -.1, 0], eL: 1.9, hL: 'fist', lL: [.9, .25, .3], kL: 1.5, lR: [-.2, .2, -.3], kR: 1.2 },
  f_uppercut: { sp: -.2, st: -.5, hp: -.25, aR: [2.6, -.1, 0], eR: 1.0, hR: 'fist', aL: [.9, .5, 0], eL: 1.8, hL: 'fist', lL: [.3, .2, .2], kL: .2, lR: [-.4, .2, -.3], kR: .2, fR: .7 },
  f_elbow: { sp: .3, st: -.9, hp: .1, aR: [1.5, -.3, 0], eR: 2.5, hR: 'fist', aL: [1.0, .6, 0], eL: 2.0, hL: 'fist', lL: [.7, .25, .3], kL: .8, lR: [-.5, .2, -.3], kR: .3 },
  f_knee: { sp: .1, hp: .2, aL: [1.6, -.1, 0], eL: 1.5, hL: 'claw', aR: [1.6, -.1, 0], eR: 1.5, hR: 'claw', lL: [-.2, .1, 0], kL: .2, lR: [1.7, .1, 0], kR: 2.3, fR: .5 },
  f_roundWind: { sp: -.05, st: .8, aL: [1.1, .6, 0], eL: 1.4, hL: 'fist', aR: [1.0, .9, 0], eR: 1.5, hR: 'fist', lL: [-.05, .3, .3], kL: .4, lR: [.9, .5, -.6], kR: 1.9 },
  f_roundhouse: { sp: -.4, ss: .35, st: -1.0, hp: -.1, aL: [1.2, 1.2, 0], eL: .8, hL: 'fist', aR: [1.0, 1.5, 0], eR: .5, hR: 'fist', lL: [-.1, .2, .5], kL: .25, lR: [1.5, 1.1, -.5], kR: .05, fR: .6 },
  f_spinBack: { yaw: PI, sp: -.3, ss: -.3, hp: -.1, hy: -1.0, aL: [1.2, 1.3, 0], eL: .7, aR: [1.0, 1.4, 0], eR: .6, hL: 'fist', hR: 'fist', lL: [1.6, .7, .2], kL: .05, fL: .5, lR: [-.1, .2, 0], kR: .3 },
  f_axeWind: { sp: -.3, aL: [1.6, .8, 0], eL: .5, hL: 'fist', aR: [1.6, .8, 0], eR: .5, hR: 'fist', lL: [-.1, .1, 0], kL: .2, lR: [2.8, .1, 0], kR: .05, fR: .6 },
  f_axe: { sp: .5, hp: .3, aL: [.8, 1.1, 0], eL: .7, hL: 'fist', aR: [.8, 1.1, 0], eR: .7, hR: 'fist', lL: [-.3, .1, 0], kL: .6, lR: [.9, .1, 0], kR: .05, fR: .5 },
  f_palm: { sp: .35, st: -.6, hp: .1, aR: [1.55, -.05, 0], eR: .05, hR: 'open', wR: [-1.2, 0], aL: [.7, .8, 0], eL: 1.8, hL: 'fist', lL: [.9, .25, .3], kL: 1.0, lR: [-.7, .2, -.3], kR: .2, fR: .4 },
  f_headbutt: { sp: .55, hp: .55, aL: [1.2, .2, 0], eL: 1.0, hL: 'claw', aR: [1.2, .2, 0], eR: 1.0, hR: 'claw', lL: [.6, .2, .2], kL: .6, lR: [-.5, .2, -.2], kR: .3 },
  f_grapple: { sp: .35, hp: .2, aL: [1.4, -.15, 0], eL: .7, hL: 'claw', aR: [1.4, -.15, 0], eR: .7, hR: 'claw', lL: [.5, .25, .2], kL: .7, lR: [-.4, .25, -.2], kR: .4 },
  f_rush1: { sp: .35, st: -.5, hp: .15, aR: [1.55, -.05, 0], eR: .05, hR: 'fist', aL: [1.1, .2, 0], eL: 2.0, hL: 'fist', lL: [.7, .25, .3], kL: .9, lR: [-.6, .2, -.3], kR: .3 },
  f_rush2: { sp: .35, st: .4, hp: .15, aL: [1.55, -.05, 0], eL: .05, hL: 'fist', aR: [1.1, .2, 0], eR: 2.0, hR: 'fist', lL: [.7, .25, .3], kL: .9, lR: [-.6, .2, -.3], kR: .3 },
  // ------------------------------------------------------------------ sword
  s_iai: { sp: .35, st: .6, hp: .2, aR: [.9, -1.1, 0], eR: 1.5, hR: 'grip', aL: [.5, -.6, 0], eL: 1.4, hL: 'grip', lL: [.9, .25, .3], kL: 1.2, lR: [-.5, .2, -.3], kR: .6, sword: { hand: 'R', dir: [.6, -.3, -.75], bladeLen: .15 } },
  s_iaiCut: { sp: .45, st: -1.0, hp: .2, hy: .4, aR: [1.5, 1.45, 0], eR: .05, hR: 'grip', aL: [.6, -.3, 0], eL: 1.2, hL: 'open', lL: [1.1, .25, .3], kL: 1.3, lR: [-.8, .2, -.3], kR: .3, fR: .5, sword: { hand: 'R', dir: [.95, .05, .3] } },
  s_overheadWind: { sp: -.15, hp: -.15, aR: [2.9, -.1, 0], eR: .9, hR: 'grip', lL: [.4, .15, .2], kL: .4, lR: [-.3, .15, -.2], kR: .2, sword: { hand: 'R', dir: [0, .35, -.94], two: true } },
  s_overhead: { sp: .65, hp: .35, aR: [1.0, 0, 0], eR: .1, hR: 'grip', lL: [1.1, .2, .2], kL: 1.3, lR: [-.8, .15, -.2], kR: .3, fR: .5, sword: { hand: 'R', dir: [0, -.7, .7], two: true } },
  s_diagWind: { sp: .05, st: .7, hp: 0, aR: [2.5, .9, 0], eR: 1.2, hR: 'grip', lL: [.45, .2, .3], kL: .6, lR: [-.4, .2, -.3], kR: .4, sword: { hand: 'R', dir: [.7, .55, -.45], two: true } },
  s_diag: { sp: .55, st: -.7, hp: .25, aR: [.9, -.5, 0], eR: .1, hR: 'grip', lL: [1.0, .25, .3], kL: 1.2, lR: [-.7, .2, -.3], kR: .3, fR: .4, sword: { hand: 'R', dir: [-.75, -.55, .35], two: true } },
  s_backhand: { sp: .2, st: 1.1, hp: .1, hy: -.5, aR: [1.4, 1.7, 0], eR: .2, hR: 'grip', aL: [.8, -.5, 0], eL: .8, hL: 'open', lL: [.5, .3, .4], kL: .6, lR: [-.4, .3, -.4], kR: .4, sword: { hand: 'R', dir: [.7, .1, -.7] } },
  s_lunge: { sp: .6, st: -.6, hp: .3, aR: [1.55, .0, 0], eR: .02, hR: 'grip', aL: [.9, PI * .85, 0], eL: .3, hL: 'open', lL: [1.3, .2, .2], kL: 1.5, lR: [-1.05, .15, -.2], kR: .15, fR: .6, sword: { hand: 'R', dir: [0, -.05, 1] } },
  s_parry: { sp: .1, st: -.3, hp: .1, aR: [1.4, -.5, 0], eR: 1.0, hR: 'grip', aL: [.5, .6, 0], eL: .8, hL: 'open', lL: [.4, .2, .2], kL: .5, lR: [-.4, .2, -.2], kR: .4, sword: { hand: 'R', dir: [-.4, .9, .2] } },
  s_crossGuard: { sp: .2, hp: .15, aR: [1.3, -.3, 0], eR: 1.3, hR: 'grip', aL: [1.2, -.4, 0], eL: 1.6, hL: 'flat', lL: [.5, .2, .2], kL: .7, lR: [-.4, .2, -.2], kR: .4, sword: { hand: 'R', dir: [-.95, .25, .2] } },
  s_spinCut: { yaw: PI * .6, sp: .3, st: -1.2, hp: .1, aR: [1.5, 1.5, 0], eR: .05, hR: 'grip', aL: [1.4, -1.5, 0], eL: .1, hL: 'open', lL: [.8, .4, .3], kL: 1.0, lR: [-.5, .3, -.3], kR: .5, sword: { hand: 'R', dir: [.95, .0, -.2] } },
  s_upperCut: { sp: -.25, st: -.3, hp: -.3, aR: [2.7, .3, 0], eR: .2, hR: 'grip', lL: [.6, .2, .2], kL: .9, lR: [-.3, .2, -.2], kR: .2, fR: .5, sword: { hand: 'R', dir: [.2, .95, .2], two: true } },
  s_reverseGrip: { sp: .3, st: .4, hp: .15, aR: [.9, .3, 0], eR: 1.6, hR: 'grip', aL: [1.2, -.2, 0], eL: 1.2, hL: 'open', lL: [.7, .25, .3], kL: 1.0, lR: [-.5, .2, -.3], kR: .5, sword: { hand: 'R', dir: [.1, -.4, -.9] } },
  s_sheathe: { sp: .02, hp: .1, aR: [.5, -.6, 0], eR: 1.5, hR: 'grip', aL: [.35, -.4, 0], eL: 1.3, hL: 'grip', sword: { hand: 'R', dir: [.5, -.4, -.75], bladeLen: .3 } },
  s_bladeRest: { sp: -.03, hp: -.05, aR: [2.3, .1, 0], eR: 2.2, hR: 'grip', aL: [.1, .5, 0], eL: .3, hL: 'relax', lL: [.12, .14, .3], kL: .1, lR: [-.05, .14, -.3], kR: .05, sword: { hand: 'R', dir: [.2, .3, -.93] } },
  // ------------------------------------------------------------------ air
  a_leap: { sp: .3, hp: -.3, aL: [2.6, .3, 0], eL: .3, aR: [2.5, .3, 0], eR: .3, lL: [1.2, .15, 0], kL: 2.0, lR: [.1, .1, 0], kR: .6, fL: .5, fR: .7, ground: false },
  a_dive: { pitch: 1.2, sp: .2, hp: -.6, aL: [2.9, .2, 0], eL: .1, aR: [2.9, .2, 0], eR: .1, hL: 'fist', hR: 'fist', lL: [-.1, .05, 0], kL: .2, lR: [-.1, .05, 0], kR: .3, fL: .7, fR: .7, ground: false },
  a_flip: { pitch: -2.4, sp: .8, hp: .3, aL: [.8, .3, 0], eL: 1.6, aR: [.8, .3, 0], eR: 1.6, lL: [1.8, .1, 0], kL: 2.3, lR: [1.7, .1, 0], kR: 2.3, ground: false },
  a_spinKick: { roll: .4, sp: -.3, ss: .3, st: -.9, aL: [1.4, 1.3, 0], eL: .6, hL: 'fist', aR: [1.2, 1.4, 0], eR: .6, hR: 'fist', lL: [.8, .3, 0], kL: 1.8, lR: [1.6, 1.0, -.4], kR: .05, fR: .6, ground: false },
  a_airPunch: { pitch: .3, sp: .4, st: -.7, hp: .1, aR: [1.6, -.05, 0], eR: 0, hR: 'fist', aL: [.8, PI * .8, 0], eL: .6, hL: 'fist', lL: [.9, .15, 0], kL: 1.6, lR: [-.4, .1, 0], kR: .8, fR: .6, ground: false },
  a_hover: { sp: .05, hp: -.05, aL: [.4, 1.0, 0], eL: .5, hL: 'open', aR: [.5, 1.0, 0], eR: .5, hR: 'open', lL: [.3, .1, 0], kL: .7, lR: [.05, .1, 0], kR: .4, fL: .6, fR: .6, ground: false },
  a_fallBack: { pitch: -.8, sp: -.5, hp: -.5, aL: [2.6, 1.1, 0], eL: .4, hL: 'open', aR: [2.4, 1.2, 0], eR: .5, hR: 'open', lL: [1.1, .3, 0], kL: .6, lR: [.6, .3, 0], kR: 1.1, ground: false },
  a_slamDown: { pitch: .5, sp: .6, hp: .3, aR: [2.8, .1, 0], eR: .3, hR: 'fist', aL: [2.6, .3, 0], eL: .4, hL: 'fist', lL: [.6, .2, 0], kL: 1.4, lR: [.2, .2, 0], kR: 1.0, ground: false },
  a_glide: { pitch: .6, sp: .4, hp: -.5, aL: [1.2, 1.4, 0], eL: .2, hL: 'open', aR: [1.2, 1.4, 0], eR: .2, hR: 'open', lL: [-.1, .1, 0], kL: .4, lR: [-.2, .1, 0], kR: .6, ground: false },
  a_superman: { pitch: 1.35, sp: 0, hp: -1.0, aR: [2.95, .05, 0], eR: 0, hR: 'fist', aL: [.3, .6, 0], eL: .4, hL: 'fist', lL: [-.05, .05, 0], kL: .1, lR: [-.2, .05, 0], kR: .4, fL: .8, fR: .8, ground: false },
  // ------------------------------------------------------------------ throws / getting hit
  t_grabWind: { sp: .3, st: .3, hp: .1, aR: [1.5, .1, 0], eR: .4, hR: 'claw', aL: [1.4, -.2, 0], eL: .6, hL: 'claw', lL: [.6, .2, .2], kL: .8, lR: [-.4, .2, -.2], kR: .4 },
  t_throw: { sp: .5, st: -1.1, hp: .1, hy: .5, aR: [1.8, -.8, 0], eR: .2, hR: 'open', aL: [1.2, -.9, 0], eL: .5, hL: 'open', lL: [.9, .3, .3], kL: 1.0, lR: [-.6, .3, -.3], kR: .3, fR: .5 },
  t_hurled: { pitch: -1.6, roll: .6, sp: -.4, hp: -.5, aL: [2.4, 1.3, 0], eL: .6, hL: 'open', aR: [1.8, 1.4, 0], eR: .9, hR: 'open', lL: [.9, .4, 0], kL: 1.2, lR: [.3, .4, 0], kR: .6, ground: false },
  t_hitHead: { sp: -.4, ss: .2, hp: -.7, hr: .4, hy: .5, aL: [1.0, 1.3, 0], eL: .4, hL: 'open', aR: [1.3, 1.2, 0], eR: .3, hR: 'open', lL: [.2, .2, 0], kL: .3, lR: [-.3, .2, 0], kR: .5, face: { eye: .3, mouth: 'pain', mouthOpen: .8 } },
  t_hitBody: { sp: .85, hp: .3, aL: [.9, -.2, 0], eL: .7, hL: 'claw', aR: [1.0, .6, 0], eR: .3, hR: 'open', lL: [.5, .2, 0], kL: .7, lR: [-.2, .2, 0], kR: .5, fR: .4, face: { eye: 1.3, shock: 1, mouth: 'o', mouthOpen: 1 } },
  t_hitBack: { sp: -.6, hp: -.4, aL: [.9, 1.5, 0], eL: .2, hL: 'open', aR: [.9, 1.5, 0], eR: .2, hR: 'open', lL: [.6, .2, 0], kL: .4, lR: [-.2, .2, 0], kR: .2, ground: false, face: { eye: 1.2, mouth: 'pain', mouthOpen: 1 } },
  t_doubleOver: { sp: 1.05, hp: .4, aL: [.6, -.5, 0], eL: 1.4, hL: 'claw', aR: [.6, -.5, 0], eR: 1.5, hR: 'claw', lL: [.4, .15, 0], kL: .7, lR: [.1, .15, 0], kR: .6, face: { eye: .4, lid: -.3, mouth: 'pain', mouthOpen: .9 } },
  t_knockback: { pitch: -.35, sp: -.5, hp: -.5, aL: [1.4, 1.4, 0], eL: .3, hL: 'open', aR: [1.6, 1.3, 0], eR: .3, hR: 'open', lL: [.7, .2, 0], kL: .5, lR: [.3, .2, 0], kR: .8, ground: false, face: { eye: .5, mouth: 'pain', mouthOpen: 1 } },
  t_skid: { sp: .45, hp: .2, aL: [.6, 1.0, 0], eL: .6, hL: 'claw', aR: [.2, .6, 0], eR: .4, hR: 'open', lL: [.9, .35, .3], kL: 1.6, lR: [-.6, .3, -.3], kR: .5, fR: .5 },
  t_wallHit: { sp: -.1, hp: -.4, aL: [1.3, 1.6, 0], eL: .2, hL: 'open', aR: [1.4, 1.6, 0], eR: .2, hR: 'open', lL: [.3, .3, 0], kL: .4, lR: [.2, .3, 0], kR: .5, ground: false, face: { eye: .3, mouth: 'pain', mouthOpen: 1 } },
  t_getUp: { sp: .7, hp: -.2, aL: [.5, .2, 0], eL: .3, hL: 'flat', aR: [.9, .5, 0], eR: .6, hR: 'claw', lL: [1.5, .25, .2], kL: 2.2, lR: [.3, .2, -.2], kR: 2.4, fR: 1.0 },
  t_kneelPant: { sp: .55, hp: .2, aL: [.35, .1, 0], eL: .6, hL: 'flat', aR: [.6, .3, 0], eR: 1.2, hR: 'claw', lL: [1.5, .2, .1], kL: 1.7, lR: [.25, .15, 0], kR: 2.5, fR: 1.2, face: { eye: .7, lid: .2, mouth: 'pain', mouthOpen: .5, sweat: 1 } },
  t_staggerL: { sp: .2, ss: .35, hp: .1, hr: .3, aL: [.7, 1.3, 0], eL: .4, hL: 'open', aR: [.5, .7, 0], eR: .8, hR: 'claw', lL: [.2, .5, 0], kL: .4, lR: [-.1, .1, 0], kR: .2 },
  t_staggerR: { sp: .2, ss: -.35, hp: .1, hr: -.3, aR: [.7, 1.3, 0], eR: .4, hR: 'open', aL: [.5, .7, 0], eL: .8, hL: 'claw', lR: [.2, .5, 0], kR: .4, lL: [-.1, .1, 0], kL: .2 },
  // ------------------------------------------------------------------ death
  death_fallBack: { pitch: -.9, sp: -.3, hp: -.6, aL: [1.9, 1.3, 0], eL: .3, hL: 'relax', aR: [1.7, 1.4, 0], eR: .4, hR: 'relax', lL: [.5, .15, 0], kL: .7, lR: [.2, .15, 0], kR: .4, ground: 'all', rest: .55, face: { eye: .3, mouth: 'open', mouthOpen: .3, pupil: .4 } },
  death_fallFwd: { pitch: .9, sp: .4, hp: .2, aL: [.6, .4, 0], eL: .3, hL: 'relax', aR: [.5, .3, 0], eR: .3, hR: 'relax', lL: [-.2, .1, 0], kL: .5, lR: [.3, .1, 0], kR: .8, ground: 'all', rest: .45, face: { eye: .2, closed: 0, mouth: 'open', mouthOpen: .3 } },
  death_kneel: { sp: .7, hp: .8, hr: .1, aL: [.05, .15, 0], eL: .15, hL: 'relax', aR: [.05, .1, 0], eR: .1, hR: 'relax', lL: [1.55, .2, .1], kL: 2.6, lR: [1.5, .2, -.1], kR: 2.6, fL: 1.2, fR: 1.2, face: { eye: .25, mouth: 'line', pupil: .5 } },
  death_slump: { sp: .65, hp: .9, hr: .2, aL: [.05, .3, 0], eL: .1, hL: 'relax', aR: [.05, .3, 0], eR: .1, hR: 'relax', lL: [1.5, .25, .2], kL: .4, lR: [1.4, .3, -.2], kR: .6, ground: 'all', rest: .02, face: { eye: .2, mouth: 'open', mouthOpen: .2 } },
  death_sprawl: { pitch: -HP, sp: -.1, hp: -.15, hy: .5, hr: .3, aL: [1.8, 1.4, 0], eL: .35, hL: 'relax', aR: [2.1, 1.3, 0], eR: .25, hR: 'open', lL: [.15, .25, .3], kL: .25, lR: [.05, .2, -.3], kR: .1, ground: 'all', rest: .06, face: { eye: .15, mouth: 'open', mouthOpen: .25, pupil: .3 } },
  death_face: { pitch: HP, sp: 0, hp: .1, hy: .9, aL: [1.2, 1.2, 0], eL: .9, hL: 'relax', aR: [.2, .3, 0], eR: .2, hR: 'relax', lL: [0, .2, 0], kL: .1, lR: [0, .25, 0], kR: .2, ground: 'all', rest: .08, face: { eye: 0, closed: 1 } },
  death_side: { roll: HP, sp: .6, hp: .4, aL: [.9, -.4, 0], eL: 1.4, hL: 'relax', aR: [.7, -.3, 0], eR: 1.2, hR: 'relax', lL: [1.2, .1, 0], kL: 1.6, lR: [.9, .1, 0], kR: 1.4, ground: 'all', rest: .1, face: { eye: .2, mouth: 'line' } },
  death_impaled: { sp: -.45, hp: -.6, aL: [.35, .7, 0], eL: .4, hL: 'open', aR: [.5, .8, 0], eR: .5, hR: 'claw', lL: [.1, .15, 0], kL: .25, lR: [-.1, .15, 0], kR: .2, face: { eye: 1.3, shock: 1, mouth: 'open', mouthOpen: .9 } },
  death_reach: { pitch: -HP, sp: -.1, hp: -.2, aR: [2.9, .2, 0], eR: .3, hR: 'open', aL: [1.5, 1.4, 0], eL: .2, hL: 'relax', lL: [.1, .2, .2], kL: .4, lR: [.3, .2, -.2], kR: .8, ground: 'all', rest: .06, face: { eye: .5, mouth: 'smile', brow: .2, browA: -.3 } },
  death_standing: { sp: .25, hp: .55, aL: [.08, .2, 0], eL: .2, hL: 'relax', aR: [.1, .3, 0], eR: .3, hR: 'grip', lL: [.3, .2, .2], kL: .4, lR: [-.2, .2, -.2], kR: .2, face: { eye: .3, mouth: 'smile', pupil: .5 } },
  death_air: { pitch: -1.2, roll: .3, sp: -.3, hp: -.8, hr: .5, aL: [2.2, 1.5, 0], eL: .4, hL: 'relax', aR: [1.6, 1.5, 0], eR: .9, hR: 'relax', lL: [.7, .3, 0], kL: .9, lR: [.2, .3, 0], kR: .4, ground: false, face: { eye: .2, mouth: 'open', mouthOpen: .4 } },
  death_split: { sp: -.2, ss: .25, st: .5, hp: -.5, aL: [1.2, 1.4, 0], eL: .3, hL: 'open', aR: [1.0, 1.5, 0], eR: .2, hR: 'open', lL: [.2, .25, 0], kL: .3, lR: [-.2, .25, 0], kR: .4, face: { eye: 1.3, shock: 1, mouth: 'open', mouthOpen: 1 } },
  death_crumble: { sp: -.15, hp: -.7, aL: [1.0, 1.0, 0], eL: .5, hL: 'open', aR: [1.3, .9, 0], eR: .4, hR: 'open', lL: [.2, .15, 0], kL: .4, lR: [.1, .15, 0], kR: .5, face: { eye: .7, mouth: 'open', mouthOpen: .5 } },
});
const POSE_GROUPS = {
  fist: ['f_guard', 'f_jab', 'f_cross', 'f_hookWind', 'f_hook', 'f_uppercutWind', 'f_uppercut', 'f_elbow', 'f_knee', 'f_roundWind', 'f_roundhouse', 'f_spinBack', 'f_axeWind', 'f_axe', 'f_palm', 'f_headbutt', 'f_grapple', 'f_rush1', 'f_rush2'],
  sword: ['s_iai', 's_iaiCut', 's_overheadWind', 's_overhead', 's_diagWind', 's_diag', 's_backhand', 's_lunge', 's_parry', 's_crossGuard', 's_spinCut', 's_upperCut', 's_reverseGrip', 's_sheathe', 's_bladeRest'],
  air: ['a_leap', 'a_dive', 'a_flip', 'a_spinKick', 'a_airPunch', 'a_hover', 'a_fallBack', 'a_slamDown', 'a_glide', 'a_superman'],
  hit: ['t_grabWind', 't_throw', 't_hurled', 't_hitHead', 't_hitBody', 't_hitBack', 't_doubleOver', 't_knockback', 't_skid', 't_wallHit', 't_getUp', 't_kneelPant', 't_staggerL', 't_staggerR'],
  death: ['death_fallBack', 'death_fallFwd', 'death_kneel', 'death_slump', 'death_sprawl', 'death_face', 'death_side', 'death_impaled', 'death_reach', 'death_standing', 'death_air', 'death_split', 'death_crumble'],
};
// rapid alternating punches (Ranshiki / rush): pose for phase ph (0..1 per punch pair)
function rushPunch(ph, over) { const u = .5 - .5 * Math.cos((ph % 1) * TAU); return mixPose(pose('f_rush1', over), pose('f_rush2', over), u); }

// agent E (shinji-aizen-dazai): extra hurt / death poses
Object.assign(POSES, {
  t_coughBlood: { sp: .55, hp: .35, aL: [.8, -.2, 0], eL: 1.9, hL: 'relax', aR: [.4, .3, 0], eR: .9, hR: 'claw', lL: [.4, .15, .2], kL: .6, lR: [-.1, .12, -.2], kR: .4, face: { eye: .5, lid: -.3, brow: .3, browA: -.5, mouth: 'pain', mouthOpen: .7, sweat: 1 } },
  t_clutchChest: { sp: .35, ss: .1, hp: .2, aR: [.9, -.6, 0], eR: 1.5, hR: 'claw', aL: [.5, .2, 0], eL: .8, hL: 'relax', lL: [.3, .15, .2], kL: .45, lR: [-.15, .12, -.2], kR: .3, face: { eye: 1.2, mouth: 'o', mouthOpen: .5, shock: 1, pupil: .5 } },
  t_impaledFront: { sp: .25, hp: -.2, aL: [.7, .5, 0], eL: .4, hL: 'claw', aR: [.7, .5, 0], eR: .4, hR: 'claw', lL: [.1, .1, .1], kL: .3, lR: [.1, .1, -.1], kR: .3, face: { eye: 1.25, mouth: 'pain', mouthOpen: .8, shock: 1, pupil: .4 } },
  death_leanSword: { sp: .6, hp: .5, aR: [.9, .1, 0], eR: .6, hR: 'grip', sword: { hand: 'R', dir: [.1, -1, .2] }, aL: [.2, .3, 0], eL: .4, hL: 'relax', lL: [1.4, .15, .1], kL: 1.7, lR: [.25, .12, 0], kR: 2.4, fR: 1.1, face: { eye: .3, lid: -.2, mouth: 'pain', mouthOpen: .3 } },
  death_floatBack: { ground: false, pitch: -HP, sp: 0, hp: -.3, aL: [1.3, 1.5, 0], eL: .3, hL: 'relax', aR: [1.2, 1.4, 0], eR: .4, hR: 'relax', lL: [.1, .1, .1], kL: .2, lR: [.05, .1, -.1], kR: .25, face: { eye: 0, closed: 1, mouth: 'line' } },
});
POSE_GROUPS.hit.push('t_coughBlood', 't_clutchChest', 't_impaledFront'); POSE_GROUPS.death.push('death_leanSword', 'death_floatBack');
