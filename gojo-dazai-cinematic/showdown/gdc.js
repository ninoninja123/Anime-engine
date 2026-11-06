/* GOJO vs DAZAI - "CINEMATIC / UFOTABLE LIGHT" (10 s, 1280x720 24 fps).  node render.js ... ../showdown/gdc
   Story/winner: see ../pre/story_secret.md (not for the user).  Style module: engine/fx_zz_gdc.js.               */
PROGRAM.reset(10, 'gdc');
const DX = -2.6, GX = 2.6, GF = 2.3;   // Dazai on the quay (faces +x), Gojo floats above the quay (faces -x)
const atD = (p, o, x = DX, z = 0, yaw = HP) => at([x, 0, z], yaw, P(p, o));
const atG = (p, o, x = GX, z = 0, yaw = -HP) => at([x, 0, z], yaw, P(p, o));
const DZW = t => [1.4 + Math.sin(t * 2.1) * .4, .1, .5];          // sea wind (coat)
const camLerp = (a, b, u) => ({ pos: vLerp(a.pos, b.pos, u), target: vLerp(a.target, b.target, u), fov: lerp(a.fov || 35, b.fov || 35, u), roll: lerp(a.roll || 0, b.roll || 0, u), focus: lerp(a.focus || 8, b.focus || 8, u), aperture: lerp(a.aperture || 0, b.aperture || 0, u) });
const SUNP = [34, 9, -420];                                         // low magic-hour sun behind the skyline (flare source)
const SUBL = [{ t0: 5.05, t1: 6.25, who: 'DAZAI', col: '#e8c48a', text: 'Your Infinity ends where I touch.' },
              { t0: 7.05, t1: 8.05, who: 'GOJO', col: '#8fe0ff', text: 'Then... no technique.' }];
function SUBS_DRAW(f, T) { f.text(g => { for (const s of SUBL) gdcSub(g, s.text, { t: T, t0: s.t0, t1: s.t1, who: s.who, col: s.col }); }); }
function LOOK(f, T, o = {}) {   // shared cinematic dressing: letterbox, bokeh, embers (drawn per shot)
  f.fx(g => gdcBokeh(g, T, Object.assign({ n: 12, seed: 5, side: 'edges', a: .9 }, o.bokeh || {})), { layer: 'glow' });
  if (o.embers !== false) f.fx(g => gdcEmbers(g, T, Object.assign({ n: 34, seed: 9, rise: 90, size: 5 }, o.embers || {})), { layer: 'glow' });
  f.text(g => gdcLetterbox(g, 1)); SUBS_DRAW(f, T);
}
const DUSK = (f, o = {}) => { std(f, { pal: o.pal || 'gdc_dusk', post: 'hot', postOver: Object.assign({ bloom: .75, halation: .45, vignette: .42, grain: .04 }, o.post || {}) });
  f.light(Object.assign({ ambientK: .2, shadeK: .45, shadeTint: '#6a4ab8', rimAmt: 1, rimCol: '#ffb070', rim: vNorm([.8, .35, -.5]) }, o.light || {}));
  f.bg(Object.assign({ set: 'yokohama', pal: o.pal || 'gdc_dusk', moonDir: [-.5, .5, -1], moonR: 60 }, o.bg || {})); };

// ================================================================================================ S1 0.0-1.7  crane down over the harbour -> Dazai
const S1D = fig('dazai', 'base', t => breathe(atD('dazai_pockets', { face: faceAnim(expr('smile', { eye: .55 }), t, { seed: 2, gaze: [[0, [.3, .05]], [1, [.4, .1]]] }) }), t), { timing: 2, wind: DZW });
const S1G = fig('gojo', 'base', t => breathe(atG('goj_float', { float: GF + Math.sin(t * 1.6) * .06 }), t), { timing: 2, wind: t => [-.5, .2, .2] });
shot('S1_open', 0, 1.7, (f, lt, u, T) => {
  DUSK(f); const cA = { pos: [3.5, 7.5, 17], target: [0, 3.2, -12], fov: 44, focus: 16, aperture: 2 }, cB = closeCam(S1D, lt, { part: 'bust', az: .55, el: .02, dist: 2.3, fov: 34, aperture: 5 });
  f.cam(camHandheld(camLerp(cA, cB, easeInOut(clamp(lt / 1.6, 0, 1))), lt, .004, 2));
  f.fig(S1D); f.fig(S1G);
  f.fx(g => { gdcShafts(g, SUNP, T, { col: '#ffb27a', a: .07, n: 8, ang: Math.PI * 1.08, spread: 1.0 }); gdcFlare(g, SUNP, T, { col: '#ffb070', a: .8, len: 1.1 }); }, { layer: 'glow' });
  f.fx(g => fxSixEyes(g, S1G, lt, { k: .0 }), { layer: 'glow' });
  LOOK(f, T, { bokeh: { n: 14, rMax: 150 } });
  f.text(g => { const a = clamp(Math.min(lt / .25, (1.55 - lt) / .25), 0, 1); if (a <= 0) return; g.save(); g.globalAlpha = a; g.textAlign = 'left'; g.font = '900 italic 64px "Inter Display", Inter, Arial'; g.lineWidth = 8; g.strokeStyle = '#000';
    g.strokeText('SATORU GOJO', 120, 190); g.fillStyle = '#9fe6ff'; g.fillText('SATORU GOJO', 120, 190); g.font = '800 34px Inter, Arial'; g.strokeText('VS', 120, 240); g.fillStyle = '#fff'; g.fillText('VS', 120, 240);
    g.font = '900 italic 64px "Inter Display", Inter, Arial'; g.strokeText('OSAMU DAZAI', 120, 304); g.fillStyle = '#f2c98a'; g.fillText('OSAMU DAZAI', 120, 304); g.restore(); });
});
// ================================================================================================ S2 1.7-3.4  orbit under Gojo: Blue + Red -> Hollow Purple charge
const S2G = fig('gojo', 'eyes', K([[0, atG('goj_float', { float: GF, eyeGlow: 1 })], [.22, atG('goj_purpleWind', { float: GF, orbL: 1, orbR: 1, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) }), 'snap'],
  [1.7, atG('goj_purpleWind', { float: GF, orbL: 1, orbR: 1, eyeGlow: 1, face: expr('serious', { eye: 1.05 }) })]]), { timing: 1, wind: t => [-.9, .5, .2] });
shot('S2_charge', 1.7, 3.4, (f, lt, u, T) => {
  DUSK(f, { pal: 'gdc_purple', light: { rimCol: '#c08aff', fx: [{ p: vAdd(figPos(S2G, lt, 'handL'), [0, 0, 0]), col: '#3a8bff', r: 2.2, a: .5 }, { p: figPos(S2G, lt, 'handR'), col: '#ff3048', r: 2.2, a: .5 }] } });
  const c = vAdd(figPos(S2G, lt, 'head'), [0, -.35, 0]);
  f.cam(camHandheld(camImpactKick(camOrbitShot(c, lt, { r: 3.0, r1: 2.4, az0: -HP - .75, az1: -HP - .3, el0: -.22, el1: -.1, dur: 1.7, fov: 40 }), lt, .22, { fov: -5 }), lt, .006, 4));
  f.fig(S2G);
  f.fx(g => fxSixEyes(g, S2G, lt, { k: .45, streak: .5 }), { layer: 'glow' });
  f.fx(g => fxHollowPurple(g, vAdd(figPos(S2G, .3, 'abd'), [-.9, .35, 0]), [-1, -.3, 0], lt - .3, { charge: 1.45, len: 6, speed: 14, r: 1.1 }), { layer: 'over' });
  f.fx(g => gdcEmbers(g, T, { n: 50, seed: 21, cols: ['#b06aff', '#ff4a7a', '#4aa8ff'], rise: -160, size: 6 }), { layer: 'glow' });
  f.fx(g => { const q = project(vAdd(figPos(S2G, .3, 'abd'), [-.9, .35, 0])); if (q) gdcFlare(g, q, T, { col: '#c08aff', a: clamp((lt - .6) / .6, 0, 1), len: 1.2, size: 1.1 }); }, { layer: 'glow' });
  f.impact([{ s: 'flash', n: 1, p: { col: '#bfe8ff' } }, { s: 'invert', n: 1 }], { t0: .22 });
  LOOK(f, T, { embers: false, bokeh: { cols: ['#c08aff', '#ff6ab0', '#6ab8ff'] } });
  f.text(g => attackTitle(g, lt, { style: 'shonen', kind: 'purple', text: 'HOLLOW PURPLE', pre: 'IMAGINARY TECHNIQUE', sub: '虚式「茈」', t0: .55, dur: 1.05, y: 880, size: 150 }));
});
// ================================================================================================ S3 3.4-4.4  the purple fires: wide sweep from behind Gojo
const S3G = fig('gojo', 'eyes', K([[0, atG('goj_purpleWind', { float: GF, orbL: 1, orbR: 1, eyeGlow: 1 })], [.08, atG('goj_purpleFire', { float: GF, orbL: 0, orbR: 0, eyeGlow: 1, face: expr('serious') }), 'snap'], [1, atG('goj_purpleFire', { float: GF, eyeGlow: 1, face: expr('serious') })]]), { timing: 1, wind: t => [-1.2, .3, 0] });
const S3D = fig('dazai', 'base', K([[0, atD('dazai_pockets')], [.5, atD('dazai_pockets'), 'hold'], [.75, atD('dazai_touch', { face: expr('smile', { eye: .55 }) }), 'snap'], [1, atD('dazai_touch')]]), { timing: 1, wind: t => [-2.2, .2, .3] });
const PA = () => vAdd(figPos(S3G, .3, 'abd'), [-.9, .35, 0]);
shot('S3_fire', 3.4, 4.4, (f, lt, u, T) => {
  DUSK(f, { pal: 'gdc_purple', light: { rimCol: '#d0a0ff', fx: [{ p: [0, 2.4, 0], col: '#9b4dff', r: 6, a: .55 }] }, bg: { pal: 'gdc_purple' } });
  f.cam(camHandheld(camPath([{ t: 0, pos: [GX + 3.4, GF + 2.4, 4.2], target: [GX - 1, GF + 1.2, 0], fov: 36 }, { t: .09, pos: [GX + 3.6, GF + 2.6, 4.6], target: [GX - 1.2, GF + 1.1, 0], fov: 36 },
    { t: .12, pos: [GX + 4.5, GF + 2.2, 8.2], target: [DX + .5, 1.2, -.5], fov: 44, ease: 'snap' }, { t: 1, pos: [GX + 3.4, GF + 1.4, 7.2], target: [DX + .2, 1.3, -.3], fov: 40 }])(lt), lt, .008, 6));
  f.fig(S3G); f.fig(S3D);
  const a = PA(), dir = vSub(figPos(S3D, .8, 'handR'), a), L = vLen(dir);
  f.fx(g => fxHollowPurple(g, a, dir, lt + 1.45 - .08, { charge: 1.45, len: L - .2, speed: 9, r: 1.1 }), { layer: 'over' });
  f.fx(g => gdcEmbers(g, T, { n: 60, seed: 31, cols: ['#c08aff', '#ffffff', '#ff6ab0'], rise: 40, wind: -260, size: 6 }), { layer: 'glow' });
  f.fx(g => { const q = project(vAdd(a, vMul(vNorm(dir), Math.min(L, Math.max(0, lt - .08) * 9)))); if (q) { gdcFlare(g, q, T, { col: '#c890ff', a: .9, len: 1.3, size: 1.2 }); gdcShafts(g, q, T, { col: '#b07aff', a: .08, n: 10, ang: 0, spread: TAU }); } }, { layer: 'glow' });
  f.shake([[.1, 26, .55]]);
  f.impact([{ s: 'flash', n: 1, p: { col: '#f4e8ff' } }, { s: 'purplevoid', n: 2 }, { s: 'invert', n: 1 }, { s: 'purplevoid', n: 1 }], { t0: .1, at: a });
  LOOK(f, T, { embers: false, bokeh: { cols: ['#c08aff', '#ff6ab0', '#6ab8ff'], n: 10 } });
});
// ================================================================================================ S4 4.4-6.2  Dazai's palm: the purple goes out (No Longer Human)
const S4D = fig('dazai', 'base', K([[0, atD('dazai_touch', { face: expr('smile', { eye: .55 }) })], [.3, atD('dazai_touch', { face: expr('smile', { eye: .5, lid: .2 }) }), 'hold'], [.9, atD('dazai_touch', { face: expr('smile', { eye: .5 }) })],
  [1.25, atD('dazai_pockets', { face: faceAnim(expr('smile', { eye: .5 }), 1.25, { seed: 7 }) }), 'inOut'], [1.8, atD('dazai_pockets', { face: expr('smile', { eye: .5 }) })]]), { timing: 2, wind: t => [-2.5 * Math.max(.3, 1 - t), .3, .4] });
const S4HAND = () => vAdd(figPos(S4D, .2, 'handR'), [.18, 0, 0]);
shot('S4_nullify', 4.4, 6.2, (f, lt, u, T) => {
  const kP = clamp(1 - (lt - .15) / .4, 0, 1);   // purple strength at the palm
  DUSK(f, { light: { rimCol: '#cfe8ff', rim: vNorm([.9, .3, -.3]), fx: [{ p: S4HAND(), col: '#9b4dff', r: 3, a: .7 * kP }, { p: S4HAND(), col: '#e8f4ff', r: 2, a: lt > .2 ? .5 * clamp(1 - (lt - .3), 0, 1) : 0 }] } });
  f.cam(camHandheld(camLerp(closeCam(S4D, .2, { part: 'bust', az: .75, el: -.12, dist: 1.6, fov: 38, aperture: 6 }), closeCam(S4D, .2, { part: 'bust', az: .45, el: -.04, dist: 1.05, fov: 32, aperture: 7 }), easeInOut(clamp(lt / 1.8, 0, 1))), lt, .004, 8));
  f.fig(S4D);
  const hand = S4HAND();
  f.fx(g => { const tail = vAdd(hand, [6.5, 2.4, 0]); fxHollowPurple(g, tail, vSub(hand, tail), 1.45 + vDist(hand, tail) / 9 + lt * .9, { charge: 1.45, len: vDist(hand, tail), speed: 9, r: 1.1 });
    if (kP > 0) { const q = hvQ(hand); if (q) { hvOrb(g, q, .55 * q.s * kP, [HVFX.purple, HVFX.purple2], T, { halo: 2.2 * kP, haloA: .6, spin: 4, arcs: 6, edge: '#2a0848' }); } } }, { layer: 'over' });
  f.fx(g => { fxNoLongerHuman(g, hand, lt - .2, { r: 2.2, dur: 1.3 }); fxSnuff(g, hand, lt - .55, { col: '#c08aff', size: 1.2 }); gdcFlare(g, hand, T, { col: '#dff0ff', a: clamp(1 - Math.abs(lt - .35) * 2.5, 0, 1), len: 1.4, size: 1.3 }); }, { layer: 'glow' });
  f.fx(g => gdcEmbers(g, T, { n: 40, seed: 41, cols: ['#e8f4ff', '#9fd0ff', '#c08aff'], rise: 70, size: 5, a: clamp(1 - (lt - .3) / 1.2, .25, 1) }), { layer: 'glow' });
  f.impact([{ s: 'flash', n: 1, p: { col: '#eef6ff' } }, { s: 'nlhRing', n: 2 }], { t0: .2, at: hand }); f.shake([[.2, 10, .3]]);
  LOOK(f, T, { embers: false, bokeh: { cols: ['#ffd27a', '#ff9ad0', '#9fd0ff'] } });
  f.text(g => attackTitle(g, lt, { style: 'shonen', kind: 'silver', text: 'NO LONGER HUMAN', sub: '人間失格', t0: .3, dur: .95, y: 250, size: 140 }));
});
// ================================================================================================ S5 6.2-7.7  the grip: Infinity shatters; Gojo's eyes widen -> grin
const S5G = fig('gojo', 'eyes', K([[0, at([.55, 0, 0], -HP, P('goj_red', { eyeGlow: 1, face: expr('serious', { eye: 1.0 }) }))], [.3, at([.55, 0, 0], -HP, P('goj_red', { eyeGlow: 1, face: expr('surprised', { eye: 1.3 }) })), 'snap'],
  [.85, at([.55, 0, 0], -HP, P('goj_red', { eyeGlow: 1, face: expr('surprised', { eye: 1.25 }) }))], [1.1, at([.55, 0, 0], -HP, P('goj_red', { eyeGlow: 1, face: expr('cocky', { eye: .9 }) })), 'inOut'], [1.5, at([.55, 0, 0], -HP, P('goj_red', { eyeGlow: 1, face: expr('cocky') }))]]), { timing: 2, wind: t => [-.6, .3, .2] });
const S5D = fig('dazai', 'base', t => breathe(at([-.55, 0, .12], HP, P('dazai_grabWrist', { face: expr('smirk', { eye: .5 }) })), t), { timing: 2, wind: DZW });
shot('S5_grip', 6.2, 7.7, (f, lt, u, T) => {
  DUSK(f, { light: { rimCol: '#9fe0ff', rim: vNorm([-.8, .35, -.4]), fx: [{ p: figPos(S5G, lt, 'head'), col: '#5fd3ff', r: 1.2, a: .3 }] } });
  f.trans({ type: 'whiteFlash', dur: .1 });
  const camA = closeCam(S5D, 0, { part: 'hand', az: -1.25, el: .18, dist: 2.0, fov: 34, aperture: 6 }), camB = closeCam(S5G, 0, { part: 'face', az: .5, el: .04, dist: 1.0, fov: 30, aperture: 8 });
  const uu = easeInOut(clamp((lt - .45) / .55, 0, 1)); f.cam(camHandheld(camImpactKick(camLerp(camA, camB, uu), lt, .3, { fov: -4 }), lt, .004, 10));
  f.fig(S5G); f.fig(S5D);
  const grip = figPos(S5D, 0, 'handR'), gc = figPos(S5G, 0, 'abd');
  f.fx(g => { fxInfinity(g, gc, lt, { r: 1.25, dur: .32 }); fxNoLongerHuman(g, grip, lt - .3, { r: 1.6 }); }, { layer: 'glow' });
  f.fx(g => fxDebris(g, grip, lt - .3, { n: 22, kind: 'glass', speed: 5, seed: 4 }), { layer: 'over' });
  f.fx(g => { fxSixEyes(g, S5G, lt, { k: uu, streak: .6 }); gdcFlare(g, figPos(S5G, lt, 'head'), T, { col: '#7fe0ff', a: .35 * uu, len: .9, ghosts: false }); }, { layer: 'glow' });
  f.impact('NLH_SHATTER', { t0: .3, at: grip }); f.shake([[.3, 12, .3]]);
  LOOK(f, T, { embers: { cols: ['#9fe0ff', '#ffd27a', '#ff9ad0'], n: 26 }, bokeh: { cols: ['#7fe8ff', '#ffd27a', '#ff9ad0'] } });
});
// ================================================================================================ S6 7.7-9.0  the fist (impact frame) - Dazai is blown off the quay
const HIT = .55;
const S6G = fig('gojo', 'eyes', K([[0, at([.6, 0, 0], -HP, P('goj_punchWind', { eyeGlow: 1, face: expr('cocky') }))], [.42, at([.7, 0, 0], -HP, P('goj_punchWind', { eyeGlow: 1, face: expr('serious') })), 'out'],
  [HIT, at([.35, 0, 0], -HP, P('goj_punch', { eyeGlow: 1 })), 'snap'], [1.3, at([.3, 0, 0], -HP, P('goj_punch', { eyeGlow: 1 })), 'hold']]), { timing: 1, wind: t => [-1, .2, 0] });
const S6D = fig('dazai', 'base', t => { if (t < HIT) return at([-.55, 0, .12], HP, P('dazai_grabWrist', { face: expr('smirk', { eye: .5 }) })); const u = t - HIT, x = -.55 - u * 11, y = 1.0 * Math.sin(Math.min(1, u * 2.2) * Math.PI * .5);
  return at([x, y, .12], HP, P('t_knockback', { face: { eye: .55, mouth: 'smile', mouthOpen: .2 } })); }, { timing: 1, wind: t => [-3, .5, 0] });
shot('S6_fist', 7.7, 9.0, (f, lt, u, T) => {
  DUSK(f, { post: { blur: lt > HIT && lt < HIT + .25 ? 14 : 0 }, light: { rimCol: '#ff8a5a', fx: lt > HIT ? [{ p: [-.2, 1.4, 0], col: '#ff2038', r: 3, a: .6 * clamp(1 - (lt - HIT) * 2, 0, 1) }] : [] } });
  const base = lt < HIT ? camLowHero(S6G, lt, { dist: 2.9, az: -.85, fov: 42 }) : camPath([{ t: 0, pos: [1.2, .7, 4.6], target: [-1.4, 1.2, 0], fov: 40 }, { t: .75, pos: [-.8, 1.2, 6.5], target: [-5.5, 1.4, -.5], fov: 44, ease: 'out' }])(lt - HIT);
  f.cam(camHandheld(camImpactKick(base, lt, HIT, { fov: -10, roll: .1 }), lt, .007, 12));
  f.fig(S6G, { afterimages: lt > HIT - .1 && lt < HIT + .1 ? [.03, .06] : [] }); f.fig(S6D, { afterimages: lt > HIT ? [.04, .08, .12] : [] });
  const hitP = [-.1, 1.45, .1];
  f.fx(g => { fxBlackFlash(g, hitP, lt - HIT, { size: 2.2, dur: .5 }); }, { layer: 'over' });
  f.fx(g => { if (lt > HIT) fxSpeedLines(g, lt, { n: 70, inner: 300, col: '#ffffff', alpha: .5 * clamp(1 - (lt - HIT) * 1.5, 0, 1) }); gdcEmbers(g, T, { n: 40, seed: 51, cols: ['#ff5a3a', '#ffd27a', '#ff2a6a'], rise: 60, wind: lt > HIT ? -500 : 0, size: 6 }); }, { layer: 'glow' });
  f.shake([[HIT, 30, .6]]);
  f.impact([{ s: 'flash', n: 1, p: { col: '#ffffff' } }, { s: 'blackflash', n: 1 }, { s: 'redblack', n: 1, p: { col: '#d0101e' } }, { s: 'invert', n: 1 }, { s: 'kanji', n: 1, p: { char: '拳', col: '#0a0006' } }, { s: 'shatter', n: 2 }], { t0: HIT, at: hitP });
  LOOK(f, T, { embers: false });
});
// ================================================================================================ S7 9.0-9.45  over Gojo's shoulder: the splash out on the water
const S7G = fig('gojo', 'eyes', K([[0, at([.3, 0, 0], -HP, P('goj_punch', { eyeGlow: 1 }))], [.45, at([.3, 0, 0], -HP, P('goj_stand', { eyeGlow: 1, face: expr('cocky') })), 'inOut']]), { timing: 2, wind: t => [-.6, .2, .2] });
const SPL = [-9.5, -1.2, -15.5];
shot('S7_splash', 9.0, 9.45, (f, lt, u, T) => {
  DUSK(f, { light: { rimCol: '#ffb070' } });
  f.cam(camHandheld(camPath([{ t: 0, pos: [2.4, 1.9, 2.2], target: [-8, 1.2, -14], fov: 40, focus: 18, aperture: 4 }, { t: .45, pos: [2.6, 2.3, 2.6], target: [-8.5, 2.2, -14], fov: 37, focus: 18, aperture: 4 }])(lt), lt, .005, 14));
  f.fig(S7G);
  f.fx(g => fxWaterSplash(g, SPL, lt + .1, { h: 10, r: 2.4, dur: 1.2 }), { layer: 'over' });
  f.fx(g => { gdcShafts(g, SUNP, T, { col: '#ffb27a', a: .08, n: 9, ang: Math.PI * 1.08, spread: 1.0 }); gdcFlare(g, SUNP, T, { col: '#ffb070', a: 1, len: 1.2 }); }, { layer: 'glow' });
  LOOK(f, T, { bokeh: { n: 12, rMax: 140 } });
});
// ================================================================================================ S8 9.45-10.0  Gojo against the sun (push to the face)
const S8G = fig('gojo', 'eyes', t => breathe(at([.3, 0, 0], -HP + .35, P('goj_stand', { eyeGlow: 1, face: faceAnim(expr('cocky'), t, { seed: 3 }) })), t), { timing: 2, wind: t => [-.7, .3, .2] });
shot('S8_end', 9.45, 10.0, (f, lt, u, T) => {
  DUSK(f, { light: { rimCol: '#ffb070', rimAmt: 1.2, rim: vNorm([.3, .3, -.9]) } });
  f.cam(camHandheld(camLerp(closeCam(S8G, lt, { part: 'face', az: .55, el: .03, dist: 1.7, fov: 30 }), closeCam(S8G, lt, { part: 'face', az: .45, el: .03, dist: 1.3, fov: 30 }), easeOut(clamp(lt / .55, 0, 1))), lt, .003, 9));
  f.fig(S8G);
  f.fx(g => { fxSixEyes(g, S8G, lt, { k: .5, streak: .5 }); gdcShafts(g, SUNP, T, { col: '#ffb27a', a: .09, n: 9, ang: Math.PI * 1.08, spread: 1.0 }); gdcFlare(g, SUNP, T, { col: '#ffb070', a: 1, len: 1.3 }); }, { layer: 'glow' });
  LOOK(f, T, { bokeh: { n: 14, rMax: 150 } });
});
