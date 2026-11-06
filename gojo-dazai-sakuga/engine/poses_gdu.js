/* engine/poses_gdu.js (agent E, gowther-dazai-urahara) - extra poses (doll / defeat / mind-game acting) + camera helpers for dialogue-heavy shots.
   POSES: gow_lifeless (marionette with cut strings: head dropped, arms dangling, knees soft - Dazai's touch), gow_dollSlump (sitting slumped like a
          dropped doll, ground:'all'-style sitting), gow_dollFall (mid-collapse), gow_rise (getting up mechanically), gow_headTilt90 (eerie),
          dazai_pinned (on his back, Shitonegaeshi victim: give pos + yaw), dazai_thrown (airborne, t_hurled-like with coat), ura_kneelHurt,
          ura_slashBack (Urahara cut from behind, arching), any_fingerTemple (two fingers at the temple: 'reading'), any_handOnChin, any_armsFold.
   CAMERA:
     camOTS(A, B, t, o)        OVER-THE-SHOULDER: camera behind A's shoulder (o.side 'R'|'L'), framing B's face; A's shoulder/hair soft in the fore-
                               ground. o: { dist (behind A, 1.0), height (.05), fov (30), lookJoint ('head'), bias (.0 = aim at B) }
     camLowHero(F, t, o)       dramatic worm's-eye from near the feet (o.dist 2.2, o.az, o.fov 46, o.roll)
     camSlowPush(F, t, t0, t1, o)  slow push-in on a part (closeCam) from o.from to o.to distance multipliers
     camWideGroup(figs, t, o)  = camGroup with readable defaults for 720p wide shots (fill .58, fov 30, el .08) - use instead of fixed far cameras    */
'use strict';
Object.assign(POSES, {
  gow_lifeless: { sp: .32, ss: .06, hp: .75, hr: .35, aL: [.02, .15, 0], eL: .05, hL: 'relax', aR: [.04, .1, 0], eR: .08, hR: 'relax', lL: [.12, .06, .1], kL: .35, lR: [.05, .08, -.1], kR: .25, shL: [-.1, .05], shR: [-.12, .05], face: { eye: .55, lid: .1, pupil: .5, mouth: 'line', mouthW: .45, glint: 0 } },
  gow_dollFall: { sp: .55, ss: -.1, hp: .6, hr: -.4, aL: [.5, .6, 0], eL: .2, hL: 'relax', aR: [.35, .7, 0], eR: .3, hR: 'relax', lL: [.9, .1, .2], kL: 1.6, lR: [.5, .15, -.1], kR: 1.9, face: { eye: .5, pupil: .5, mouth: 'line', glint: 0 } },
  gow_dollSlump: { sp: .45, ss: .12, hp: .8, hr: .6, aL: [.15, .55, 0], eL: .1, hL: 'relax', aR: [.2, .45, 0], eR: .15, hR: 'relax', lL: [1.45, .25, .2], kL: .25, lR: [1.4, .18, -.3], kR: .5, face: { eye: .6, pupil: .5, mouth: 'line', glint: 0 } },
  gow_rise: { sp: .05, hp: -.1, hr: .0, aL: [.2, .5, 0], eL: .1, hL: 'open', aR: [.2, .5, 0], eR: .1, hR: 'open', lL: [.1, .1, .1], lR: [.1, .1, -.1], face: { eye: 1.05, mouth: 'line', mouthW: .45 } },
  gow_headTilt90: { sp: 0, hp: 0, hr: 1.5, aL: [.07, .32, .1], eL: .14, hL: 'relax', aR: [.07, .32, -.1], eR: .14, hR: 'relax', face: { eye: 1.05, mouth: 'line', mouthW: .45 } },
  dazai_pinned: { ground: 'all', rest: .12, pitch: -HP, sp: -.05, hp: -.2, hy: .3, aL: [1.2, 1.4, 0], eL: .6, hL: 'open', aR: [.6, 1.2, 0], eR: .9, hR: 'open', lL: [.25, .15, .2], kL: .5, lR: [.05, .12, -.2], kR: .2, face: { mouth: 'smile', eye: .5 } },
  dazai_thrown: { ground: false, pitch: -.9, sp: -.2, hp: -.3, aL: [2.2, 1.0, 0], eL: .4, hL: 'open', aR: [1.8, 1.3, 0], eR: .3, hR: 'open', lL: [.9, .2, .2], kL: .9, lR: [.4, .25, -.2], kR: .4, face: { mouth: 'o', mouthOpen: .3, eye: 1.0 } },
  ura_kneelHurt: { sp: .35, hp: .25, aL: [.6, -.2, 0], eL: 1.5, hL: 'claw', aR: [.4, .3, 0], eR: .3, hR: 'grip', lL: [1.5, .15, .1], kL: 1.6, lR: [.2, .12, 0], kR: 2.5, fR: 1.2, face: { eye: .6, lid: .3, mouth: 'pain', mouthOpen: .3, sweat: 1 } },
  ura_slashBack: { sp: -.4, ss: .1, hp: -.5, aL: [.9, 1.3, 0], eL: .3, hL: 'claw', aR: [.8, 1.1, 0], eR: .4, hR: 'grip', lL: [.2, .2, .2], kL: .4, lR: [-.3, .2, -.2], kR: .2, face: { eye: 1.1, mouth: 'pain', mouthOpen: .6 } },
  any_fingerTemple: { sp: .02, hp: .08, aR: [1.55, .55, .3], eR: 2.6, hR: 'sign', wR: [.2, 0], aL: [.1, .35, 0], eL: .2, hL: 'relax', face: { eye: .6, lid: .2, mouth: 'line' } },
  any_handOnChin: { sp: .04, hp: .1, aR: [1.0, -.55, .2], eR: 2.45, hR: 'relax', wR: [.25, .1], aL: [.7, -.55, 0], eL: 1.65, hL: 'relax', face: { eye: .65, mouth: 'line', look: [.2, .1] } },
  any_armsFold: { sp: -.02, hp: .05, aL: [.75, -.7, 0], eL: 1.9, hL: 'flat', aR: [.75, -.7, 0], eR: 1.9, hR: 'flat', face: { eye: .7, mouth: 'line' } },
});
if (typeof POSE_GROUPS !== 'undefined') POSE_GROUPS.gdu = ['gow_lifeless', 'gow_dollFall', 'gow_dollSlump', 'gow_rise', 'gow_headTilt90', 'dazai_pinned', 'dazai_thrown', 'ura_kneelHurt', 'ura_slashBack', 'any_fingerTemple', 'any_handOnChin', 'any_armsFold'];
function camOTS(A, B, t, o = {}) {
  const SA = figSkel(A, A.timing > 1 ? onN(t, A.timing) : t), SB = figSkel(B, B.timing > 1 ? onN(t, B.timing) : t), k = SA.B.h / 1.8, side = o.side || 'R';
  const sh = SA.J['sh' + side], hb = SB.J[o.lookJoint || 'head'], dir = vNorm(vSub(hb, sh)), lat = vNorm(vCross([0, 1, 0], dir)), sg = side === 'R' ? -1 : 1;
  const pos = vAdd(vMad(sh, dir, -(o.dist || 1.0) * k), vAdd(vMul(lat, sg * (o.lat == null ? .28 : o.lat) * k), [0, (o.height == null ? .12 : o.height) * k, 0]));
  const tgt = vLerp(hb, vLerp(sh, hb, .5), o.bias || 0); return { pos, target: vAdd(tgt, [0, -.02 * k, 0]), fov: o.fov || 30, roll: o.roll || 0, focus: vDist(pos, hb), aperture: o.aperture == null ? 3 : o.aperture };
}
function camLowHero(F, t, o = {}) { const S = figSkel(F, F.timing > 1 ? onN(t, F.timing) : t), k = S.B.h / 1.8, yaw = S.pose.yaw || 0, c = S.J.pelvis; return { pos: vAdd(orbitPos({ c: [c[0], .15 * k, c[2]], r: (o.dist || 2.2) * k, az: yaw + (o.az == null ? .25 : o.az), el: 0 }), [0, 0, 0]), target: vAdd(S.J.neck, [0, .1 * k, 0]), fov: o.fov || 46, roll: o.roll || 0 }; }
function camSlowPush(F, t, t0, t1, o = {}) { const u = easeInOut(clamp((t - t0) / Math.max(.01, t1 - t0), 0, 1)); return closeCam(F, t, Object.assign({}, o, { dist: lerp(o.from || 1.4, o.to || .9, u) })); }
function camWideGroup(figs, t, o = {}) { return camGroup(figs, t, Object.assign({ fill: .58, fov: 30, el: .08 }, o)); }
