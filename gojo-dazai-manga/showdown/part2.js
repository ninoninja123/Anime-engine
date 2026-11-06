/* showdown/part2.js - ITACHI vs JULIUS, part 2: shots with t0 >= PART_SPLIT (84 s): D19 .. J22 (agent S2).  (Masked C17 lives in part1.js.)
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !!  SPOILER WARNING: this file contains the twists and the FINALE (pre/spoilers.md).  Do not read it if you want to be surprised.  !!
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   Helpers: common.js (shotT, CH, BGX, STAR, SUS, CLOCK, autoTitle, burstSeq), engine API.md ch. 17.  Itachi = west (x < 0), Julius = east.
   RHYTHM: uneven internal cuts (CUT), one-take moves and snap pushes; the camera always moves.  X-* impacts are built here from spoilers.md.   */
'use strict';
(function () { // S2 scope
// ================================================================================================ helpers
const I2 = (form, keys, o) => CH('ITA', form, typeof keys === 'function' ? keys : K(keys), Object.assign({ springWin: .6, wind: t => [-.35, -.05, .2] }, o || {}));
const J2 = (form, keys, o) => CH('JUL', form, typeof keys === 'function' ? keys : K(keys), Object.assign({ springWin: .6 }, o || {}));
const FA2 = (e, t, o) => faceAnim(typeof e === 'string' ? expr(e) : e, t, Object.assign({ seed: 7 }, o || {}));
const U = (t, t0, t1) => clamp((t - t0) / Math.max(1e-3, t1 - t0), 0, 1);
const E = (a, b, t0, t1, t, e) => lerp(a, b, (e || easeInOut)(U(t, t0, t1)));
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const CUT = (lt, segs) => { for (const [te, fn] of segs) if (lt < te) return fn(lt); return segs[segs.length - 1][1](lt); };
const HH = (cam, lt, a, seed) => camHandheld(cam, lt, a == null ? .005 : a, seed || 3);
const CP = keys => camPath(keys);
const JP = (F, t, j) => j === 'chest' ? vLerp(figPos(F, t, 'neck'), figPos(F, t, 'abd'), .4) : figPos(F, t, j);
const imp = (f, steps, T, p) => f.impact(steps, Object.assign({ t0: T - f.shot.t0 }, p || {}));
const fit = (name, n) => fitSeq(name, n);
const sub = (t0, t1, who, line, italic) => SUBS.push({ t0, t1, who, line, italic: !!italic });
const TT = (f, lt, text, style, o) => autoTitle(f, lt, { text, text_style: style, t0: f.shot.t0, t1: f.shot.t1, chars: [] }, o || {});
// aim a camera at a point between two world points (weight k toward b) - keeps a giant and a man in one frame
const aim2 = (pos, a, b, k = .5) => { const da = vNorm(vSub(a, pos)), db = vNorm(vSub(b, pos)); return vAdd(pos, vMul(vNorm(vLerp(da, db, k)), 10)); };
const shake = (f, t0, amp = 26, dur = .45) => f.shake([[t0, amp, dur, 22]]);
// Susanoo local -> world (fxSusanoo frame: x right, y up, z forward; scale Hs)
const susW = (at, yaw, Hs, x, y, z = 0) => { const rt = [Math.cos(yaw), 0, -Math.sin(yaw)], fw = [Math.sin(yaw), 0, Math.cos(yaw)]; return vAdd(at, vAdd(vMul(rt, x * Hs), vAdd([0, y * Hs, 0], vMul(fw, z * Hs)))); };
const susHand = (at, yaw, Hs, A = 0, sg = 1) => susW(at, yaw, Hs, sg * lerp(.42, .3, A), lerp(.19, .8, A) + .1, lerp(.16, .46, A) + .02);
// Izanami: only the LEFT eye goes blind (pose field blindL) - wraps the engine eye hook (irisFn gets 'mirror' = which eye)
(function () { const h0 = IJ.itaEyeHook; IJ.itaEyeHook = (st, S, D, e) => { h0(st, S, D, e); if (!S.pose || !S.pose.blindL) return; const f0 = st.irisFn, kb = S.pose.blindL;
  st.irisFn = (c, x, y, ir, pr, e2, mirror, lod) => { if (f0) f0(c, x, y, ir, pr, e2, mirror, lod); if (mirror !== IJ_BLIND_MIRROR) return; c.save(); c.globalAlpha = clamp(kb, 0, 1); c.fillStyle = '#9a9ca6'; c.beginPath(); c.ellipse(x, y, ir * 1.06, ir * 1.22, 0, 0, TAU); c.fill();
    c.fillStyle = '#c8cad2'; c.beginPath(); c.ellipse(x, y - ir * .45, ir * .7, ir * .45, 0, Math.PI * .05, Math.PI * .95); c.fill(); c.fillStyle = '#7e808a'; c.beginPath(); c.ellipse(x, y, pr * .55, pr * .65, 0, 0, TAU); c.fill(); c.restore(); }; }; })();
var IJ_BLIND_MIRROR = false;
// ------------------------------------------------------------------------------------------------ custom drawing
// Totsuka: the liquid-fire blade as a 3D segment a -> b (tapered, flickering, white core); k = alpha
function totsuka(g, a, b, t, o = {}) { const k = o.k == null ? 1 : o.k; if (k <= 0) return; const n = 18, w0 = o.w || .22, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n, p = vLerp(a, b, u), q = project(vAdd(p, [0, Math.sin(u * 11 + t * 17) * .03 * u, 0])); if (q) pts.push([q.x, q.y, q.s * w0 * (1 - u * .8)]); } if (pts.length < 2) return;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter';
  for (const [col, wk, al] of [['#ff3a1a', 2.6, .35], ['#ff8a3a', 1.5, .7], ['#ffd8a0', .8, .9], ['#ffffff', .32, 1]]) { for (let i = 1; i < pts.length; i++) { const p0 = pts[i - 1], p1 = pts[i]; g.strokeStyle = rgba(col, al * k); g.lineWidth = Math.max(1.5, (p0[2] + p1[2]) * .5 * wk); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); } }
  for (let i = 0; i < 14; i++) { const u = hash(i * 3.1 + Math.floor(t * 12)), p = pts[Math.floor(u * (pts.length - 1))]; glow(g, p[0] + (hash(i * 7) - .5) * 30, p[1] - hash(i * 5) * 40, 6 + p[2] * .4, '#ffb060', .5 * k); }
  g.restore(); }
// grey strands growing from the head (Tsukuyomi: 72 hours pass on Julius' face)
function ageHair(g, F, t, k) { if (k <= 0) return; const S = figSkel(F, t), hd = S.J.head, q = project(hd); if (!q) return; const s = q.s;
  g.save(); g.lineCap = 'round'; for (let i = 0; i < 30; i++) { const sg = i % 2 ? 1 : -1, ax = sg * (.085 + .06 * hash(i * 3)), L = (.1 + .45 * k) * (.7 + .3 * hash(i * 5)), x0 = q.x + ax * s, y0 = q.y - (.04 + .06 * hash(i * 7)) * s;
    g.strokeStyle = rgba(i % 3 ? '#e2ded6' : '#b8b2a8', .8 * clamp(k * 1.6, 0, 1)); g.lineWidth = Math.max(1, .005 * s); g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + sg * .03 * s, y0 + L * s * .5, x0 + sg * (.05 + .05 * hash(i)) * s + Math.sin(t * 2 + i) * 2, y0 + L * s); g.stroke(); } g.restore(); }
// screen cracks radiating from (x, y) (Tsukuyomi breaking, frozen time breaking, the Izanami loop shattering)
function screenCracks(g, x, y, k, o = {}) { if (k <= 0) return; const n = o.n || 14, R = (o.r || 1400) * easeOut(clamp(k, 0, 1)), seed = o.seed || 3; g.save(); g.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU + hash(i * seed) * .4; let px = x, py = y; const pts = [[px, py]]; for (let j = 0; j < 7; j++) { const a = a0 + (hash(i * 13 + j * seed) - .5) * .7, d = R / 7 * (.6 + .8 * hash(i * 7 + j)); px += Math.cos(a) * d; py += Math.sin(a) * d; pts.push([px, py]); }
    for (const [col, w] of [[o.glow || 'rgba(255,240,230,.55)', 9], [o.col || '#ffffff', 3]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, m) => m ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } }
  g.restore(); }
// falling glass shards in screen space (t = time since the break)
function screenShards(g, x, y, t, o = {}) { if (t < 0) return; g.save(); for (let i = 0; i < (o.n || 40); i++) { const a = hash(i * 3.7) * TAU, v = 300 + 900 * hash(i * 5.3), px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t * .6 + 900 * t * t, s = 14 + 40 * hash(i * 9), r = t * (3 + 6 * hash(i));
  g.save(); g.translate(px, py); g.rotate(r); g.globalAlpha = clamp(1.2 - t * .9, 0, 1); g.fillStyle = o.col || 'rgba(255,220,220,.75)'; g.strokeStyle = o.edge || '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-s, -s * .3); g.lineTo(s * .7, -s * .6); g.lineTo(s * .3, s * .8); g.closePath(); g.fill(); g.stroke(); g.restore(); } g.restore(); }
// wooden stake / cross (Tsukuyomi) at base c, facing +z
function stake(g, c, k = 1) { const v = projPoly([[c[0] - .14, 0, c[2] - .3], [c[0] + .14, 0, c[2] - .3], [c[0] + .14, 3.4, c[2] - .3], [c[0] - .14, 3.4, c[2] - .3]]), h = projPoly([[c[0] - 1.3, 2.35, c[2] - .3], [c[0] + 1.3, 2.35, c[2] - .3], [c[0] + 1.3, 2.62, c[2] - .3], [c[0] - 1.3, 2.62, c[2] - .3]]);
  g.save(); g.globalAlpha = k; for (const pp of [v, h]) if (pp.length > 2) { polyPath(g, pp); g.fillStyle = '#1a0a08'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.stroke(); } g.restore(); }
// a clock face drawn over a figure (Julius reads Itachi's remaining time): almost midnight, thin and dim
function lifeClock(g, F, t, k, o = {}) { if (k <= 0) return; const c = vAdd(JP(F, t, 'chest'), [0, .15, .25]); fxClockCircle(g, c, o.n || [0, 0, 1], (o.t == null ? t : o.t) + .4, { r: o.r || .75, k: k * (o.dim == null ? .55 : o.dim), handsT: o.hands == null ? -.035 : o.hands, w: o.w || .45, spin: .1 }); }
// blood: a drop running from the mouth / wound (screen)
function bloodTrail(g, p, L, k = 1) { const q = project(p); if (!q || k <= 0) return; const l = L * q.s; g.save(); g.globalAlpha = k; g.fillStyle = '#9a0010'; g.beginPath(); g.moveTo(q.x - .01 * q.s, q.y); g.quadraticCurveTo(q.x - .015 * q.s, q.y + l * .6, q.x, q.y + l); g.quadraticCurveTo(q.x + .015 * q.s, q.y + l * .6, q.x + .01 * q.s, q.y); g.fill(); g.restore(); }
function wound(g, p, r, k = 1) { const q = project(p); if (!q || k <= 0) return; g.save(); g.globalAlpha = k; g.fillStyle = '#8a0010'; for (let i = 0; i < 7; i++) { const a = hash(i * 3) * TAU, d = r * q.s * hash(i * 5) * .8; g.beginPath(); g.ellipse(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d + i * .01 * q.s, r * q.s * (.35 + .3 * hash(i)), r * q.s * (.5 + .4 * hash(i * 7)), 0, 0, TAU); g.fill(); } g.restore(); }
// a single black crow feather (world point, size m)
function feather(g, p, s, rot) { const q = project(p); if (!q) return; const r = s * q.s; g.save(); g.translate(q.x, q.y); g.rotate(rot); g.fillStyle = '#08060a'; g.strokeStyle = 'rgba(255,120,120,.55)'; g.lineWidth = Math.max(1, r * .04);
  g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * .32, -r * .2, r * .06, r * .9); g.lineTo(-r * .06, r * .9); g.quadraticCurveTo(-r * .3, -r * .2, 0, -r); g.fill(); g.stroke(); g.strokeStyle = 'rgba(200,200,210,.6)'; g.beginPath(); g.moveTo(0, -r * .9); g.lineTo(0, r * 1.05); g.stroke(); g.restore(); }
// Yata mirror as a screen frame (T23): dark outside, glowing bronze-red rim, a slight ripple tint inside
function mirrorFrame(g, k, t) { if (k <= 0) return; const cx = W * .5, cy = H * .48, rx = 560, ry = 470; g.save(); g.globalAlpha = k; g.fillStyle = '#060204'; g.beginPath(); g.rect(0, 0, W, H); g.ellipse(cx, cy, rx, ry, 0, 0, TAU, true); g.fill('evenodd');
  g.globalCompositeOperation = 'lighter'; for (const [w, a] of [[40, .18], [18, .4], [6, .9]]) { g.strokeStyle = rgba('#ff7a4a', a); g.lineWidth = w; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.stroke(); }
  for (let m = 0; m < 3; m++) { const an = t * .4 + m * TAU / 3; glow(g, cx + Math.cos(an) * rx, cy + Math.sin(an) * ry, 50, '#ffb080', .5); } g.restore(); }

// ================================================================================================ masked dialogue (pre/spoilers.md)
[[94.85, 96.35, 'JUL', 'Your clock... is almost empty.'], [96.75, 98.35, 'ITA', "Then I'll spend all of it."],
 [98.50, 99.40, 'KYO', '...He came here dying?'], [99.45, 100.38, 'DAZ', 'And came anyway. Smart men do.'],
 [102.15, 103.95, 'ITA', 'Here, I control time. Seventy-two hours.', true], [104.25, 105.15, 'JUL', "I've lived longer days.", true],
 [121.65, 122.95, 'ITA', 'He rewinds... he refuses the outcome.'],
 [129.65, 130.55, 'KYO', 'Ha! He lost. Nobody escapes a loop.'], [130.60, 131.38, 'DAZ', 'One can. By accepting it.'],
 [134.05, 135.85, 'JUL', 'Time... has to move forward.'],
 [137.10, 137.95, 'ITA', 'You accepted it.'], [138.00, 138.88, 'JUL', 'A crow taught me.'],
 [140.50, 141.95, 'JUL', "Let's finish this, Itachi Uchiha."], [145.75, 147.15, 'DAZ', '...Here comes the last hour.'],
 [151.40, 152.75, 'JUL', "You've given everything."], [168.30, 170.15, 'ITA', 'Thank you... for the time.'],
 [173.00, 174.50, 'DAZ', 'He spent it well.'], [175.60, 177.70, 'URA', 'Winner... Julius Novachrono.']].forEach(s => sub(...s));

// ================================================================================================ D: Susanoo vs Mana Zone (visible)
const SA = [-19.4, 0, 0], MZ = { clockScar: 1, clockR: 24, clockAt: [-10, 0, 0] };
const SUSd = (f, lt, o) => SUS(f, lt, Object.assign({ at: SA, yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .35, armL: .3, k: .85, layer: 'under' }, o || {}));
const ID = I2('mangekyo', t => at([-20, 0, 0], HP, P('ita_susanoo', { mang: 1, bleed: 1.5, blood: .8, face: expr('itaCold') })), { timing: 2 });
// D19 superwide: the Susanoo's blade comes down, Julius blocks with the clock shield - both slide apart and the arena floor splits in two (WORLD_BREAKER 85.25)
const D19J = J2('manazone', [[0, at([-9.5, 0, 1.2], -HP, P('jul_palmOut', { cut: 1, timeGlow: 1, face: expr('julFierce') }))], [.42, at([-9.6, 0, 1.2], -HP, P('jul_palmOut', { cut: 1, timeGlow: 1, sp: .2, face: expr('julShout') })), 'in'],
  [.9, at([-4.2, 0, 1.6], -HP, P('jul_land', { cut: 1, timeGlow: 1, face: expr('julGrin') })), 'out'], [1.63, at([-3.8, 0, 1.6], -HP, P('jul_guard', { cut: 1, timeGlow: 1, face: expr('julThrilled') }))]], { timing: 1 });
shotT('D19', (f, lt) => {
  const k = U(lt, .42, .8), sx = E(0, -2.2, .42, .9, lt, easeOut); BGX(f, 'ARENA', { side: 'J', bg: Object.assign({}, MZ, { gouge: k > 0 ? [[-17, 1.4, lerp(-17, 2, k), 1.4, 1.6 * k]] : [] }) });
  const jh = JP(D19J, lt, 'head'), pp = CP([{ t: 0, pos: [-11.2, 1.1, 5.6], target: [0, 0, 0] }, { t: .42, pos: [-11.0, 1.15, 5.3], target: [0, 0, 0] }, { t: 1.63, pos: [-6.4, 1.6, 7.2], ease: 'out', target: [0, 0, 0] }])(lt).pos;
  const c0 = { pos: pp, target: aim2(pp, jh, vAdd(SA, [sx, 7, 0]), .4), fov: 52 };
  f.cam(camShake(HH(c0, lt, .006, 51), [[.42, 34, .7, 18]], lt)); f.fig(D19J, { t: hitStop(lt, [[.42, .08]]) });
  SUSd(f, lt, { at: vAdd(SA, [sx, 0, 0]), swing: E(.1, .62, 0, .42, lt, easeIn), arm: E(.6, .35, 0, .42, lt) });
  f.fx(g => { fxClockShield(g, vAdd(JP(D19J, Math.min(lt, .42), 'handR'), [-.45, .25, -.2]), [-1, .2, -.3], lt + .2, { r: 1.0, hit: lt - .42 }); fxGroundSplit(g, [-15, 0, 1.4], [3, 0, 1.4], lt - .42, { dur: .45, w: 1.4 });
    fxDebris(g, [-10, .3, 1.4], lt - .44, { kind: 'rock', n: 30 }); fxDust(g, [-8, 0, 1.4], lt - .45, { r: 4 }); fxShockRing(g, [-10, 3, 1.2], lt - .42, { r: 7, dur: .5, up: true, col: '#ffe6b0' }); }, { layer: 'over' });
});
// D20 the storm rises: wide two-shot, slow push - the Susanoo lifts the Totsuka, Julius pours golden mana into his fist; lightning (87.04), the rain comes back heavy
const D20J = J2('manazone', t => breathe(at([-3, 0, 3.2], -HP + .35, P('jul_punchWind', { cut: 1, timeGlow: 1, face: FA2('julFierce', t) })), t), { timing: 2 });
shotT('D20', (f, lt) => {
  BGX(f, 'ARENA', { side: 'J', bg: Object.assign({ lightning: [f.shot.t0 + .58] }, MZ) }); f.post({ bloom: .65 });
  const pos = L3([-.2, .9, 6.3], [-.9, 1.05, 5.3], easeInOut(U(lt, 0, 1.58))); f.cam(HH({ pos, target: aim2(pos, JP(D20J, lt, 'head'), [-19, 7.5, 0], .32), fov: 54 }, lt, .004, 52));
  f.fig(D20J); f.fig(ID); SUSd(f, lt, { arm: E(.35, 1, 0, 1.2, lt), armL: .45, swing: 0 });
  const hR = JP(D20J, lt, 'handR'); f.light({ fx: [{ p: hR, col: '#ffd36a', r: 4, a: .5 + .4 * U(lt, 0, 1.4) }] });
  f.fx(g => { fxGlowAt(g, hR, .25 + .3 * U(lt, 0, 1.4), '#ffd36a', .9); fxClockCircle(g, hR, [1, .1, .2], lt, { r: .35 + .2 * U(lt, 0, 1.4), handsT: lt * 6, w: .6 }); }, { layer: 'glow' });
  f.fx(g => fxGears(g, [-3, 0, 3.2], lt + 4, { n: 6, r: 3, size: .7, k: .7 }), { layer: 'over' });
});
// D21 both charge, low: the camera backs away in front of Julius' run | reverse: over his shoulder the giant comes on, a red trail and a gold trail tearing the rain
const D21J = J2('manazone', t => at([lerp(-2.5, -8.5, t / 1.5), 0, 2.2], -HP, IJ.julRun(t * 2.4, { cut: 1, timeGlow: 1, face: expr('julShout') })), { timing: 1 });
shotT('D21', (f, lt) => {
  BGX(f, 'ARENA', { side: 'J', bg: MZ }); const jp = JP(D21J, lt, 'abd'), sx = E(0, 5, 0, 1.5, lt);
  if (lt < .78) f.cam(HH({ pos: vAdd(jp, [-3.4 + lt * .4, -.55, 2.4]), target: vAdd(jp, [0, .35, 0]), fov: 44 }, lt, .008, 53));
  else { const pp = vAdd(jp, [2.3, .1, 1.4]); f.cam(HH({ pos: pp, target: aim2(pp, JP(D21J, lt, 'head'), vAdd(SA, [sx, 6, 0]), .5), fov: 50 }, lt, .008, 54)); }
  f.fig(D21J, { afterimages: [.05, .1, .15], afterCol: '#f6d36a', afterA: .45 }); SUSd(f, lt, { at: vAdd(SA, [sx, 0, 0]), arm: .55, armL: .3, swing: 0, sword: 1 });
  f.fx(g => { fxSpeedLines(g, lt, { n: 36, inner: 420, alpha: .35, col: '#ffe8c0' }); fxDust(g, JP(D21J, lt, 'anR'), (lt * 1.6) % .5, { r: .6 }); const s0 = susW(vAdd(SA, [sx, 0, 0]), HP, 11, .3, .4, .2);
    for (let i = 0; i < 6; i++) { const q0 = project(vAdd(s0, [-i * 1.4, .3 * Math.sin(i), 0])), q1 = project(vAdd(s0, [-(i + 1) * 1.4, .3 * Math.sin(i + 1), 0])); if (q0 && q1) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#ff3a2a', .5 - i * .07); g.lineWidth = 60 * (1 - i / 7); g.lineCap = 'round'; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.stroke(); g.restore(); } } }, { layer: 'over' });
});
// D22 ECU split, full stop: the Mangekyo, red | Julius' gold eye with the clock in its iris (DUAL_TONE 89.58)
const D22I = I2('mangekyo', t => at([0, 0, 0], HP, P('ita_stand', { mang: 1, spin: t * .6, bleed: 1.2, eyeGlow: .7, face: expr('itaCold', { eye: 1 }) })), { timing: 2 });
const D22J = J2('chrono', t => at([0, 0, 0], -HP, P('jul_stand', { cut: 1, timeGlow: 1, face: expr('julFierce', { eye: 1 }) })), { timing: 2 });
shotT('D22', (f, lt) => {
  f.split({ ang: .08, x: .5, gap: 12, col: '#050306' });
  if (f.panel === 0) { BGX(f, 'ARENA_RED', { side: 'I', rain: false }); f.light({ rimAmt: 1.1, rimCol: '#ff2a2a' }); f.cam(camTruck(camSlowPush(D22I, lt, 0, 1.2, { part: 'eyes', az: .2, el: .02, from: .98, to: .86 }), .1)); f.fig(D22I); }
  else { BGX(f, 'ARENA_GOLD', { side: 'J', rain: false }); f.light({ rimAmt: 1.1, rimCol: '#ffd36a' }); f.cam(camTruck(camSlowPush(D22J, lt, 0, 1.2, { part: 'eyes', az: -.2, el: .02, from: .98, to: .86 }), -.1)); f.fig(D22J); }
});
// D23 COLLISION (CLASH_BURST 90.79): low behind Julius' shoulder, the Susanoo's fist meets his clock palm in the air; shockwave sweeps the rain, silhouettes topple
const D23J = J2('manazone', [[0, at([-11.1, 4.6, -3.9], -HP, P('jul_palmOut', { ground: false, cut: 1, timeGlow: 1, face: expr('julShout') }))], [.05, at([-11.2, 4.6, -3.9], -HP, P('jul_palmOut', { ground: false, cut: 1, timeGlow: 1, sp: .25, face: expr('julShout') })), 'snap'],
  [1.83, at([-9.6, 4.0, -3.9], -HP, P('jul_float', { ground: false, cut: 1, timeGlow: 1, face: expr('julThrilled') })), 'out']], { timing: 1 });
shotT('D23', (f, lt) => {
  BGX(f, 'ARENA', { side: 'J', bg: Object.assign({ lightning: [f.shot.t0 + .6] }, MZ) }); f.post({ bloom: .8 }); const P0 = vAdd(JP(D23J, .05, 'handR'), [-.6, .1, 0]);
  const pp = CP([{ t: 0, pos: [-11.6, 4.9, 1.0], target: [0, 0, 0] }, { t: .55, pos: [-11.4, 4.8, 1.3], target: [0, 0, 0] }, { t: 1.83, pos: [-8.6, 4.2, 4.6], ease: 'out', target: [0, 0, 0] }])(lt).pos, c = { pos: pp, target: aim2(pp, JP(D23J, lt, 'head'), [-16, 8.5, 0], .45), fov: 52 };
  f.cam(camShake(HH(c, lt, .006, 55), [[.04, 40, .9, 20]], lt)); f.fig(D23J, { t: hitStop(lt, [[.05, .1]]) }); f.fig(ID);
  SUSd(f, lt, { at: [-16, 0, 0], arm: E(.3, .45, 0, .05, lt), armL: .3, sword: 0, shield: 1 });
  f.light({ fx: [{ p: P0, col: '#fff0c0', r: 9, a: clamp(1.2 - lt, .2, 1) }] });
  f.fx(g => { fxClockShield(g, P0, [-1, .1, .3], lt + .2, { r: 1.4, hit: lt - .05 }); fxClockCircle(g, P0, [-1, .1, .3], lt + .3, { r: 2.4, handsT: lt * 12, w: 1.2 }); fxShockSphere(g, P0, lt - .05, { r: 9, dur: .9, col: '#fff2c8' });
    fxShockRing(g, [-9.5, .1, -1.5], lt - .1, { r: 26, dur: 1.2, col: '#ffd36a' }); fxShockRing(g, [-9.5, .1, -1.5], lt - .3, { r: 18, dur: 1.0, col: '#ff6a4a' }); fxSparks(g, P0, lt - .05, { n: 40, dur: .6 }); fxDebris(g, [-9, .2, -1], lt - .1, { kind: 'rock', n: 30 }); }, { layer: 'over' });
});

// ================================================================================================ T: the clock, Tsukuyomi, Totsuka, Izanami
// T01 smoke thins: Julius' palm rests on the cracked ribcage round Itachi; the grimoire glows and a ghost clock draws itself over Itachi - the hand almost at midnight. Julius' smile goes out (X-TWIST 93.17)
const IT = [-8.4, 0, .4];
const T01I = I2('sick_mangekyo', t => breathe(at(IT, HP, P('ita_susanoo', { mang: 1, bleed: 1.5, blood: 1, face: expr('itaPain', { eye: .7 }) })), t * 1.6), { timing: 2 });
const T01J = J2('manazone', t => at([-7.0, 0, .55], -HP, P('jul_palmOut', { cut: 1, grim: 1, grimOpen: 1, timeGlow: 1, face: FA2(t < 1.0 ? 'julGrin' : 'julSerious', t) })), { timing: 2 });
shotT('T01', (f, lt) => {
  BGX(f, 'ARENA', { bg: Object.assign({ dust: .7 }, MZ), dmg: 2 }); f.light({ fx: [{ p: [-7.6, 1.6, .5], col: '#ffd36a', r: 4, a: .7 }, { p: IT, col: '#e8553a', r: 4, a: .5 }] });
  f.cam(HH(CUT(lt, [[1.05, l => CP([{ t: 0, pos: [-5.6, 1.3, 5.2], target: [-7.8, 1.4, .4], fov: 40 }, { t: 1.05, pos: [-6.2, 1.5, 4.0], target: [-7.9, 1.5, .4], fov: 36 }])(l)],
    [9, l => camSlowPush(T01J, l, 1.05, 2, { part: 'face', az: .55, el: .03, from: 1.45, to: 1.15 })]]), lt, .004, 56));
  f.fig(T01I); f.fig(T01J); SUS(f, lt, { at: IT, yaw: HP, stage: 1.3, scale: 3.6, k: .5 + .2 * Math.sin(lt * 13) });
  f.fx(g => { lifeClock(g, T01I, lt, U(lt, .35, .7), { n: [1, 0, .3] }); fxSmoke(g, [-9.6, .2, -1.8], lt + .8, { n: 6, size: .8, col: '#5a5058', dur: 3 }); }, { layer: 'over' });
  imp(f, [{ s: 'invert', n: 1, p: { hue: 180, lines: 0 } }, { s: 'goldtime', n: 1 }], 93.1667);
});
// T02 ECU Julius, serious for the first time ("Your clock... is almost empty.")
const T02J = J2('manazone', t => breathe(at([0, 0, 0], -HP, P('jul_stand', { cut: 1, timeGlow: .4, face: FA2('julSerious', t, { talk: t > .25 && t < 1.7 ? 1 : 0 }) })), t), { timing: 2 });
shotT('T02', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'J' }); f.light({ fx: [{ p: [-.8, 1.6, .6], col: '#ffd36a', r: 2, a: .45 }] });
  f.cam(HH(camSlowPush(T02J, lt, 0, 1.83, { part: 'face', az: -.35, el: .02, from: 1.2, to: .95 }), lt, .0025, 57)); f.fig(T02J);
});
// T03 inside the cracking Susanoo: a weak smile, blood on the lip, gentle eyes ("Then I'll spend all of it.")
const T03I = I2('sick_mangekyo', t => breathe(at([0, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1.5, blood: 1, face: FA2('itaSoft', t, { talk: t > .35 && t < 1.9 ? .9 : 0 }) })), t), { timing: 2 });
shotT('T03', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.light({ fx: [{ p: [0, 1.4, .8], col: '#e8553a', r: 3, a: .6 }] });
  f.cam(HH(camSlowPush(T03I, lt, 0, 2, { part: 'face', az: .55, el: .02, from: 1.55, to: 1.25 }), lt, .0025, 58));
  f.fig(T03I); SUS(f, lt, { at: [-.3, 0, 0], yaw: HP, stage: 1.25, scale: 3.8, k: .3 + .12 * Math.sin(lt * 9) * Math.sin(lt * 3.3), layer: 'under' });
  f.fx(g => screenCracks(g, W * .9, H * .12, .4 + lt * .08, { n: 5, r: 420, col: '#ffd0b0', glow: 'rgba(255,120,80,.45)', seed: 5 }), { layer: 'over' });
});
// T04 the stands: Shunsui sets the cup down, quiet | Dazai, eyes closed ("...He came here dying?" / "And came anyway. Smart men do.")
shotT('T04', (f, lt) => {
  if (lt < 1.02) STAR(f, 'KYO:hush', lt, { part: 'bust', az: -.4, push: .25, react: 'hush', dmg: 2 });
  else STAR(f, 'DAZ:knowing', lt - 1.02, { focus: 'both', part: 'two', rS: 'hush', az: .35, push: .5, react: 'hush', dmg: 2 });
});
// T05 TSUKUYOMI (BURST 100.5): ECU on the Mangekyo | Julius looks straight into it of his own will - the world turns over into red sky
const T05I = I2('sick_mangekyo', t => at([-2.2, 0, 0], HP, P('ita_stand', { mang: 1, spin: t * 3, bleed: 1.5, eyeGlow: 1, face: expr('itaStare', { eye: 1 }) })), { timing: 1 });
const T05J = J2('manazone', t => at([2.2, 0, 0], -HP, P('jul_stand', { cut: 1, face: expr('julSmile', { eye: 1 }) })), { timing: 2 });
shotT('T05', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'I' });
  if (lt < .62) { f.style('hand2d'); f.cam(HH(closeCam(T05I, lt, { part: 'eye', side: 'R', az: .12, el: .02, dist: E(1.35, 1.05, 0, .62, lt) }), lt, .002, 59)); }
  else { const u = U(lt, .62, 1.58); f.cam(Object.assign(HH(closeCam(T05J, lt, { part: 'face', az: -.25, el: .02, dist: lerp(1.0, .8, u) }), lt, .002, 60), { roll: easeIn(u) * 1.2 })); ijTsukuyomiScreen(f, lt - .62, { k: easeIn(u) * .85, moon: true }); }
  f.fig(T05I); f.fig(T05J);
  imp(f, burstSeq('R1-N2-BLK2-H2-F2-K2-W1', { who: 'itachi', part: 'eyes', fig: 0 }), 100.5); shake(f, .08, 30, .5);
  TT(f, lt, '月読 TSUKUYOMI', 'CROW', { textAt: .62, title: { dur: .6 } });
});
// T06 Tsukuyomi world: Julius bound to a stake under the black moon, ten Itachis round him, blades in hand; slow orbit ("Here, I control time. Seventy-two hours.")
const T06J = J2('base', t => breathe(at([0, .55, 0], 0, P('jul_stand', { ground: false, cut: 1, aL: [1.5, .05, 0], eL: .15, hL: 'open', aR: [1.5, .05, 0], eR: .15, hR: 'open', face: expr('julSmile', { eye: .6 }) })), t), { timing: 2 });
const T06C = Array.from({ length: 10 }, (_, i) => { const a = Math.PI * (1.15 + .7 * i / 9), r = 3.4 + (i % 2) * 1.2, p = [Math.cos(a) * r, 0, -Math.sin(a) * r * -1]; return I2('mangekyo', t => at(p, lookAt(p, [0, 0, 0]), P(i % 2 ? 'ita_kunai' : 'ita_stand', { mang: 1, kunai: 'R', face: expr('itaCold') })), { timing: 2 }); });
shotT('T06', (f, lt) => {
  BGX(f, 'TSUKU', { bg: { crosses: .6 } }); f.light({ ambientK: .25, rimAmt: 1.2, rimCol: '#ff2a1a' }); f.grade({ contrast: 1.15 });
  f.cam(HH(Object.assign(camOrbitShot([0, 1.9, 0], lt, { r: 5.0, r1: 4.2, az0: -.4, az1: .3, el0: -.12, el1: -.06, dur: 2, fov: 50 }), { target: [0, 2.1, 0] }), lt, .002, 61));
  f.prop([0, 1.5, -.3], g => stake(g, [0, 0, 0])); f.fig(T06J); T06C.forEach(F => f.fig(F, { mode: 'flat', col: '#120305' }));
  f.fx(g => { for (const F of T06C) { const q = project(JP(F, lt, 'head')); if (q) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x + .03 * q.s, q.y, .06 * q.s, '#ff2a1a', .9); g.restore(); } } }, { layer: 'top' });
});
// T07 Julius' face, the sky clock spinning madly: his hair grows long and grey, hours of age - he smiles anyway ("I've lived longer days.") (X-TWIST 105.21 clock negative)
const T07J = J2('base', t => breathe(at([0, .55, 0], 0, P('jul_stand', { ground: false, cut: 1, aL: [1.5, .05, 0], eL: .15, aR: [1.5, .05, 0], eR: .15, face: FA2(t < 1.0 ? 'exhausted' : 'julSmile', t, { talk: t > .25 && t < 1.15 ? .9 : 0 }) })), t * .6), { timing: 2 });
shotT('T07', (f, lt) => {
  BGX(f, 'TSUKU', { bg: { crosses: .4 } }); f.light({ ambientK: .25, rimAmt: 1.2, rimCol: '#ff2a1a' }); f.grade({ sat: lerp(1, .55, U(lt, 0, 1.6)) });
  f.cam(HH(CUT(lt, [[.9, l => CP([{ t: 0, pos: [.3, 1.5, 3.4], target: [0, 4.2, -6], fov: 52 }, { t: .9, pos: [.2, 1.7, 2.8], target: [0, 3.6, -4], fov: 48 }])(l)], [9, l => camSlowPush(T07J, l, .9, 2, { part: 'face', az: .15, el: .1, from: 1.35, to: 1.1 })]]), lt, .002, 62));
  f.prop([0, 1.5, -.3], g => stake(g, [0, 0, 0])); f.fig(T07J);
  f.fx(g => { fxClockCircle(g, [0, 6.5, -9], [0, -.3, 1], lt + 1, { r: 5.5, handsT: lt * lt * 60, spin: 3, w: 1.6 }); }, { layer: 'glow' });
  f.fx(g => ageHair(g, T07J, lt, U(lt, .3, 1.8)), { layer: 'over' });
  imp(f, [{ s: 'timefreeze', n: 3 }], 105.2083);
});
// T08 wide Tsukuyomi: Julius stops the sky clock with one finger; a crack splits the red sky - the Tsukuyomi shatters (X-TWIST 106.79 glass)
const T08J = J2('base', [[0, at([0, .55, 0], 0, P('jul_stand', { ground: false, cut: 1, aL: [1.5, .05, 0], eL: .15, aR: [1.5, .05, 0], eR: .15, face: expr('julSmile') }))], [.55, at([0, .55, 0], 0, P('jul_stand', { ground: false, cut: 1, aL: [1.5, .05, 0], eL: .15, aR: [2.6, .3, 0], eR: .1, hR: 'point', face: expr('julGrin') })), 'out'], [1.8, at([0, .55, 0], 0, P('jul_stand', { ground: false, cut: 1, aL: [1.5, .05, 0], eL: .15, aR: [2.6, .3, 0], eR: .1, hR: 'point', face: expr('julGrin') }))]], { timing: 2 });
shotT('T08', (f, lt) => {
  BGX(f, 'TSUKU', { bg: { crosses: .7 } }); f.light({ ambientK: .25, rimAmt: 1.2, rimCol: '#ff2a1a' }); const brk = U(lt, .79, 1.3);
  f.cam(camShake(HH(CP([{ t: 0, pos: [3.5, .6, 9.5], target: [0, 4.2, -5], fov: 54 }, { t: 1.79, pos: [4.6, 1.2, 12.0], target: [0, 4.6, -5], fov: 56 }])(lt), lt, .003, 63), [[.79, 30, .6, 18]], lt));
  f.prop([0, 1.5, -.3], g => stake(g, [0, 0, 0])); f.fig(T08J); T06C.slice(0, 6).forEach(F => f.fig(F, { mode: 'flat', col: '#0a0204' }));
  f.fx(g => fxClockCircle(g, [0, 8, -14], [0, -.2, 1], lt + 1, { r: 7, handsT: lt < .6 ? lt * 40 : 24, spin: lt < .6 ? 3 : 0, w: 1.8 }), { layer: 'top' });
  f.fx(g => { const q = project([0, 8, -14]) || { x: W / 2, y: H * .3 }; screenCracks(g, q.x, q.y, brk, { n: 16, seed: 7, col: '#fff4f0', glow: 'rgba(255,80,60,.6)' }); if (lt > 1.05) { g.save(); g.globalAlpha = U(lt, 1.05, 1.6); g.fillStyle = '#fff6f0'; g.fillRect(0, 0, W, H); g.restore(); } screenShards(g, q.x, q.y, lt - 1.0, { n: 50 }); }, { layer: 'top' });
  imp(f, [{ s: 'tsukuyomired', n: 1 }, { s: 'shatter', n: 2, p: { gap: '#ff3a2a' } }], 106.7917);
});
// T09 reality: only a blink has passed. The Mangekyo bleeds heavily, Itachi drops to one knee, the Susanoo gutters; behind him Julius - young again - pants (X-TWIST 108.08)
const T09I = I2('sick_mangekyo', [[0, at([-3, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1.6, blood: 1, face: expr('itaPain') }))], [.3, at([-3, 0, 0], HP, P('ita_kneel', { mang: 1, bleed: 1.8, blood: 1, face: expr('itaPain') })), 'in'], [1.63, at([-3, 0, 0], HP, P('ita_kneel', { mang: 1, bleed: 1.8, blood: 1, sp: .5, face: expr('itaPain', { eye: .6 }) }))]], { timing: 2 });
const T09J = J2('manazone', t => at([2.8, 0, -.6], -HP, P('jul_guard', { cut: 1, sp: .3 + .08 * Math.sin(t * 9), face: expr('julSerious', { mouthOpen: .5 }) })), { timing: 2 });
shotT('T09', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 2.5 });
  f.cam(HH(closeCam(T09I, lt, { part: 'bust', az: .35, el: -.28, dist: E(1.9, 1.55, 0, 1.63, lt), fov: 34 }), lt, .004, 64));
  f.fig(T09I); f.fig(T09J); SUS(f, lt, { at: [-3.4, 0, 0], yaw: HP, stage: 1.2, scale: 3.8, k: (Math.sin(lt * 31) > .2 ? .35 : .1), layer: 'under' });
  imp(f, fit('RED_BLACK_SPLIT', 2), 108.0833); shake(f, .3, 14, .3);
});
// T10 TOTSUKA NO TSURUGI: low rising move - Itachi stands, the full Susanoo forms round him and draws the liquid-fire blade from the gourd (X-TWIST 109.67 GIANT_SIL)
const TS = [-8, 0, -2.4], TSY = 0, THs = 8;   // Totsuka set-up: Susanoo faces +z, sword arm on the +x side (toward Julius)
const TI = I2('sick_mangekyo', t => breathe(at([-8, 0, -1.8], HP, P('ita_susanoo', { mang: 1, bleed: 1.6, blood: 1, face: expr('itaCold') })), t), { timing: 2 });
const T10I = I2('sick_mangekyo', [[0, at([-8, 0, -1.8], HP, P('ita_kneel', { mang: 1, bleed: 1.6, blood: 1, face: expr('itaPain') }))], [.7, at([-8, 0, -1.8], HP, P('ita_susanoo', { mang: 1, bleed: 1.6, blood: 1, face: expr('itaCold') })), 'inOut'], [1.8, at([-8, 0, -1.8], HP, P('ita_susanoo', { mang: 1, bleed: 1.6, blood: 1, eyeGlow: .8, face: expr('itaCold') }))]], { timing: 2 });
shotT('T10', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'I', dmg: 2.5, bg: { lightning: [f.shot.t0 + .25] } }); f.light({ fx: [{ p: [-8, 4, 0], col: '#e8553a', r: 10, a: .8 }] });
  f.cam(HH(CP([{ t: 0, pos: [-6.4, .35, 1.4], target: [-8, 1.0, -1.8], fov: 44 }, { t: 1.0, pos: [-5.6, 1.0, 3.6], target: [-8, 3.6, -2], fov: 50, ease: 'inOut' }, { t: 1.8, pos: [-5.0, 1.4, 6.0], target: [-7.4, 4.6, -2], fov: 54 }])(lt), lt, .004, 65));
  f.fig(T10I); SUS(f, lt, { at: TS, yaw: TSY, stage: E(1.2, 4, .1, 1.1, lt), scale: E(4.5, THs, .1, 1.2, lt), sword: E(0, 1, 1.0, 1.6, lt), shield: E(0, 1, .9, 1.4, lt), arm: E(.2, .55, .9, 1.6, lt), armL: .4, swing: .05 });
  imp(f, fit('GIANT_SIL', 3), 109.6667); shake(f, .25, 20, .6);
  TT(f, lt, 'TOTSUKA NO TSURUGI', 'CROW', { textAt: .5, title: { dur: .85 } });
});
// T11 wide sakuga, three cuts: the Totsuka thrusts three times, Julius hops through stopped instants; the Yata mirror swallows his golden counter (X-TWIST 111.63 SUMI_INK)
const T11J = J2('manazone', t => { const ph = Math.min(2, Math.floor(t / .6)), P0 = [[-1.5, 0, .8], [1.0, 1.6, -1.2], [-3.2, 1.2, .6]][ph]; return at(P0, -HP + (ph - 1) * .3, P(['jul_dash', 'jul_float', 'jul_punchTime'][ph], { ground: ph === 0, cut: 1, timeGlow: 1, face: expr('julFierce') })); }, { timing: 1 });
shotT('T11', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'J', dmg: 2.5 }); const ph = Math.min(2, Math.floor(lt / .6)), u = (lt - ph * .6) / .6, jp = JP(T11J, lt, 'abd');
  const cams = [{ pos: [4.5, 1.6, 9.5], target: [-3.5, 3.0, -1], fov: 52 }, { pos: [-1.0, .8, 6.0], target: [0, 2.2, -1], fov: 46 }, { pos: [-.5, 2.6, 4.6], target: [-5.6, 2.8, -1.4], fov: 48 }];
  const c = cams[ph]; f.cam(HH(Object.assign({}, c, { pos: vLerp(c.pos, c.target, u * .12) }), lt, .008, 66)); shake(f, ph * .6 + .3, 18, .25);
  f.fig(TI); f.fig(T11J, { afterimages: [.04, .08, .12], afterCol: '#f6d36a', afterA: .5 });
  SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 1, shield: 1, arm: ph === 2 ? .3 : .55, armL: ph === 2 ? .85 : .4, swing: ph < 2 ? .55 + .35 * Math.sin(u * Math.PI) : .3 });
  f.fx(g => { if (ph === 2) { const m = susW(TS, TSY, THs, -.36, .62, .5); fxTimeBullets(g, vAdd(jp, [.2, .3, 0]), m, u * .6, { n: 8 }); fxSparks(g, m, u * .6 - .25, { n: 30 }); fxShockRing(g, m, u * .6 - .25, { r: 2.5, dur: .3, up: true, col: '#ffb08a' }); }
    else fxClockShield(g, vAdd(jp, [-.6, .2, 0]), [-1, 0, .3], u * .6, { r: .9, hit: u * .6 - .3 }); fxSpeedLines(g, lt, { n: 30, inner: 400, alpha: .3 }); }, { layer: 'over' });
  imp(f, fit('SUMI_INK', 3), 111.625);
});
// T12 from behind Julius: crows burst on his blind side (a genjutsu flash) - he reacts one frame late (X-TWIST 113.71 CROW_BURST)
const T12J = J2('manazone', [[0, at([0, 0, 0], -HP, P('jul_guard', { cut: 1, timeGlow: 1, face: expr('julFierce') }))], [.74, at([0, 0, 0], -HP, P('jul_guard', { cut: 1, timeGlow: 1, face: expr('julFierce') })), 'hold'], [.82, at([0, 0, 0], -HP + .9, P('jul_palmOut', { cut: 1, timeGlow: 1, face: expr('shock') })), 'snap'], [1.6, at([.2, 0, -.2], -HP + 1.0, P('jul_palmOut', { cut: 1, timeGlow: 1, face: expr('julSerious') }))]], { timing: 1 });
shotT('T12', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'J', dmg: 2.5 });
  f.cam(HH(CP([{ t: 0, pos: [1.9, 1.75, -1.4], target: [-6, 1.8, 1.0], fov: 46 }, { t: .7, pos: [1.7, 1.7, -1.3], target: [-6, 1.8, 1.4], fov: 44 }, { t: .78, pos: [1.5, 1.7, -.6], target: [-3, 1.6, 3.6], fov: 48, ease: 'snap' }, { t: 1.6, pos: [1.4, 1.65, -.4], target: [-3, 1.6, 3.6], fov: 46 }])(lt), lt, .006, 67));
  f.fig(T12J); SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 1, shield: 1, arm: .4, armL: .4, swing: .1, k: .8, layer: 'under' });
  CROWS(f, lt - .7, { c: [-2.4, 1.8, 2.6], n: 40, r: 2.4, mode: 'burst', dur: .8, size: .32 });
  imp(f, fit('CROW_BURST', 2), 113.7083);
});
// shared piercing geometry (T13-T25): Susanoo right hand -> the blade -> through Julius' chest
const PJ = [-1.2, 0, -.9];   // Julius' root when pierced
const PJF = (o, form) => J2(form || 'manazone', t => at(PJ, -HP, P('jul_hurt', Object.assign({ cut: 1, timeGlow: .6, sp: .25, face: expr('pain') }, o || {}))), { timing: 2 });
const PJ_PIERCED = PJF({});
const SH = susHand(TS, TSY, THs, .2, 1);   // the Susanoo's sword hand
const chestOf = (F, t) => JP(F, t, 'chest');
const bladeEnd = (F, t, over) => { const c = chestOf(F, t), d = vNorm(vSub(c, SH)); return vMad(c, d, over == null ? 1.6 : over); };
// T13 ECU, slow motion: the blade tip creeping toward the chest, raindrops hanging in the air
const T13J = J2('manazone', t => at(PJ, -HP, P('jul_stand', { cut: 1, timeGlow: 1, face: expr('julSerious', { eye: .9 }) })), { timing: 2 });
shotT('T13', (f, lt) => {
  BGX(f, 'ARENA_RED', { dmg: 2.5, rain: { clock: f.shot.t0 + lt * .06 } }); const c = chestOf(T13J, 0), d = vNorm(vSub(c, SH)), tip = vMad(c, d, lerp(-2.0, -.12, easeIn(U(lt, 0, 1.62))));
  f.cam(HH({ pos: vAdd(c, [-.4, .16, 1.8 - lt * .1]), target: vAdd(vLerp(tip, c, .5), [0, .12, 0]), fov: 44 }, lt, .0015, 68)); f.fig(T13J);
  f.light({ fx: [{ p: tip, col: '#ff7a3a', r: 2, a: .9 }] }); f.fx(g => totsuka(g, vMad(tip, d, -6), tip, lt), { layer: 'over' });
});
// T14 THE PIERCING (BURST 117.96): medium -> wide. The Totsuka goes through Julius' chest; red sake-smoke starts dragging him toward the gourd (the seal)
const T14J = J2('manazone', [[0, at(PJ, -HP, P('jul_guard', { cut: 1, timeGlow: 1, face: expr('julSerious') }))], [1.74, at(PJ, -HP, P('jul_guard', { cut: 1, timeGlow: 1, face: expr('shock') })), 'hold'], [1.8, at(PJ, -HP, P('jul_hurt', { cut: 1, timeGlow: .6, sp: .25, face: expr('pain') })), 'snap'], [2.58, at(vAdd(PJ, [-.3, .1, 0]), -HP, P('jul_hurt', { ground: false, cut: 1, timeGlow: .3, sp: .4, face: expr('pain', { eye: .4 }) }))]], { timing: 1 });
shotT('T14', (f, lt) => {
  BGX(f, 'ARENA_RED', { dmg: 2.5, bg: { react: 'gasp' } }); const c = chestOf(T14J, 0), d = vNorm(vSub(c, SH)), tip = lt < 1.74 ? vMad(c, d, lerp(-1.4, -.05, easeIn(U(lt, 0, 1.74)))) : vMad(c, d, lerp(.2, 1.7, easeOut(U(lt, 1.74, 1.86))));
  f.cam(HH(CUT(lt, [[1.74, l => ({ pos: vAdd(c, [-1.6, .35, 2.6 - l * .3]), target: vAdd(c, [-.6, .25, 0]), fov: 42 })], [2.26, l => ({ pos: vAdd(c, [-1.2, .1, 1.5]), target: vAdd(c, [0, .15, 0]), fov: 40 })], [9, l => CP([{ t: 2.26, pos: [1.6, 1.5, 5.4], target: [-2.6, 2.3, -1.2], fov: 50 }, { t: 2.58, pos: [2.0, 1.7, 6.2], target: [-2.6, 2.4, -1.2], fov: 50 }])(l)]]), lt, .004, 69));
  f.fig(T14J); f.fig(TI); SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 0, shield: 1, arm: .2, armL: .4, k: .85, layer: 'under' });
  f.light({ fx: [{ p: c, col: '#ff5a2a', r: 3, a: lt > 1.74 ? 1 : .4 }] });
  f.fx(g => { totsuka(g, SH, tip, lt); if (lt > 1.8) { wound(g, c, .12); fxSmoke(g, vMad(c, d, .2), lt - 1.8, { n: 10, size: .6, col: '#c8202a', dur: 1.2, rise: -.2 }); } }, { layer: 'over' });
  imp(f, burstSeq('W1-R2-N2-H2-F2-K2-RB1', { who: 'itachi', part: 'face', fig: 0 }), 117.9583); shake(f, 1.75, 34, .6);
});
// T15 CHRONO ANASTASIS on himself: the whole scene rewinds - the blade slides back out, the rain rises, crows fly backwards (X-TWIST 118.83 rewind)
shotT('T15', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'J', dmg: 2.5, rain: { clock: f.shot.t0 - lt * 2.2, mode: 'fall' } }); f.grade({ sat: .55, tint: ['#ffe0a0', .2] }); const back = easeInOut(U(lt, .1, 1.4));
  const Fj = PJ_PIERCED, c = chestOf(Fj, 0), d = vNorm(vSub(c, SH)), tip = vMad(c, d, lerp(1.6, -2.4, back));
  f.cam(HH(CP([{ t: 0, pos: [3.0, 1.9, 7.6], target: [-2.6, 2.6, -1.2], fov: 50 }, { t: 1.63, pos: [1.4, 1.6, 5.4], target: [-2, 2.2, -1.2], fov: 46 }])(lt), lt, .004, 70));
  f.fig(Fj, { t: 1 - lt }); f.fig(TI); SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 0, shield: 1, arm: .2, armL: .4, k: .85, layer: 'under' });
  CROWS(f, 1.4 - lt, { mode: 'stream', from: [-6, 3, -1], to: [4, 2.5, 1], n: 26, dur: 1.4, stagger: .5, spread: 2, size: .38 });
  f.fx(g => { totsuka(g, SH, tip, lt); fxTimeRewind(g, vAdd(c, [.2, .2, .3]), lt, { r: 2.2, k: 1 - back * .4 }); fxClockCircle(g, vAdd(c, [.6, .4, .4]), [1, .1, .3], lt + .5, { r: 1.6, handsT: -lt * 14, spin: -2, w: 1 }); fxSpeedLines(g, 1.6 - lt, { n: 40, inner: 360, alpha: .35, col: '#ffe8a0' }); }, { layer: 'over' });
  imp(f, [{ s: 'chronorewind', n: 2 }, { s: 'radial', n: 1, p: { zoom: -.12, lineCol: '#ffd36a' } }], 118.8333);
  TT(f, lt, 'CHRONO ANASTASIS', 'WIZARD', { textAt: .2, title: { dur: .95, kind: 'rewind' } });
});
// T16 the same frame as T13 again - this time Julius steps aside; Itachi's Sharingan registers the repeat (tomoe flash, a ghost of the last take) (X-TWIST 120.96 EYE_RED)
const T16J = J2('manazone', [[0, at(PJ, -HP, P('jul_stand', { cut: 1, timeGlow: 1, face: expr('julSerious', { eye: .9 }) }))], [.3, at(PJ, -HP, P('jul_stand', { cut: 1, timeGlow: 1, face: expr('julSerious', { eye: .9 }) })), 'hold'], [.5, at(vAdd(PJ, [0, 0, .8]), -HP - .5, P('jul_land', { cut: 1, timeGlow: 1, face: expr('julGrin') })), 'out'], [1.17, at(vAdd(PJ, [0, 0, .9]), -HP - .5, P('jul_land', { cut: 1, timeGlow: 1, face: expr('julGrin') }))]], { timing: 1 });
shotT('T16', (f, lt) => {
  BGX(f, 'ARENA_RED', { dmg: 2.5, rain: { clock: f.shot.t0 + lt * .06 } }); const c = chestOf(T13J, 0), d = vNorm(vSub(c, SH)), tip = vMad(c, d, lerp(-1.6, .9, easeIn(U(lt, 0, 1.0))));
  f.cam(HH({ pos: vAdd(c, [-.4, .16, 1.8]), target: vAdd(c, [-.5, .15, .3]), fov: 44 }, lt, .0015, 71)); f.fig(T16J);
  f.fx(g => { g.save(); g.globalAlpha = .28 * (1 - U(lt, .5, 1)); g.filter = 'sepia(1) hue-rotate(-30deg) saturate(3)'; totsuka(g, vMad(c, d, -6), vMad(c, d, 1.2), lt); g.restore(); totsuka(g, vMad(tip, d, -6), tip, lt);
    if (lt > .45 && lt < .62) { g.save(); g.globalAlpha = .55; IJ.sharIris(g, W * .2, H * .3, 160, { k: 1, mk: 0, spin: lt * 12 }); g.restore(); } }, { layer: 'over' });
  imp(f, fit('EYE_RED', 2), 120.9583);
});
// T17 ECU Itachi - his second insight ("He rewinds... he refuses the outcome.")
const T17I = I2('sick_mangekyo', t => breathe(at([0, 0, 0], HP, P('ita_stand', { mang: 1, spin: t, bleed: 1.6, blood: 1, face: FA2('itaStare', t, { talk: t > .08 && t < 1.35 ? 1 : 0 }) })), t), { timing: 2 });
shotT('T17', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 2.5 }); f.light({ rimAmt: 1, rimCol: '#ff3a2a' });
  f.cam(HH(camSlowPush(T17I, lt, 0, 1.42, { part: 'face', az: .5, el: .03, from: 1.2, to: .98 }), lt, .002, 72)); f.fig(T17I);
});
// T18 IZANAMI (BURST 123.79): ECU, Itachi covers his left eye - when the hand comes away, its light is gone (grey). Kanji イザナミ
const T18I = I2('sick_mangekyo', [[0, at([0, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1.6, blood: 1, face: expr('itaCold') }))], [.35, at([0, 0, 0], HP, P('ita_eyeCover', { mang: 1, bleed: 1.6, blood: 1 })), 'inOut'], [1.05, at([0, 0, 0], HP, P('ita_eyeCover', { mang: 1, bleed: 1.6, blood: 1 }))],
  [1.35, at([0, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaCold', { eye: .95 }) })), 'inOut'], [1.8, at([0, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaCold', { eye: .95 }) }))]], { timing: 2 });
shotT('T18', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 2.5 }); f.light({ rimAmt: 1.1, rimCol: '#ff2a2a' });
  f.cam(HH(CUT(lt, [[.79, l => closeCam(T18I, l, { part: 'face', az: .35, el: .03, dist: E(1.2, 1.0, 0, .79, l) })], [9, l => closeCam(T18I, l, { part: 'eyes', az: .2, el: .02, dist: E(1.05, .9, .79, 1.8, l) })]]), lt, .0015, 73)); f.fig(T18I);
  imp(f, burstSeq('R1-N2-H2-F2-BLK2-K2-W1', { who: 'itachi', part: 'eyes', fig: 0 }), 123.7917);
  TT(f, lt, 'イザナミ IZANAMI', 'CROW', { textAt: .06, title: { dur: .58 } });
});
// T19-T21 THE LOOP: every rewind brings Julius back to the moment of the piercing; the clock hands chase themselves round
function loopShot(f, lt, cam, T, kLoop) {
  BGX(f, 'ARENA_RED', { dmg: 2.5 }); const Fj = PJ_PIERCED, c = chestOf(Fj, 0), d = vNorm(vSub(c, SH)), cyc = lt % .8, tip = cyc < .45 ? vMad(c, d, lerp(1.7, -1.4, easeIn(cyc / .45))) : vMad(c, d, lerp(-1.2, 1.7, easeOut(U(cyc, .62, .74))));
  f.cam(cam); f.fig(Fj, { t: 1 + cyc }); f.fig(TI); SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 0, shield: 1, arm: .2, armL: .4, k: .85, layer: 'under' });
  ijLoopScreen(f, lt, { k: kLoop, n: 3 }); f.fx(g => { totsuka(g, SH, tip, lt); if (cyc > .7 || cyc < .4) wound(g, c, .1); fxClockCircle(g, vAdd(c, [.6, .5, .5]), [1, .1, .3], lt + .5, { r: 1.4, handsT: lt * 20, spin: 4, w: .9 }); }, { layer: 'over' });
}
shotT('T19', (f, lt) => { loopShot(f, lt, HH(CP([{ t: 0, pos: [1.6, 1.5, 5.4], target: [-2.6, 2.3, -1.2], fov: 50 }, { t: 1.63, pos: [2.2, 1.8, 6.4], target: [-2.6, 2.5, -1.2], fov: 50 }])(lt), lt, .004, 74), 125, .8); imp(f, [{ s: 'izanamiloop', n: 3 }], 125.2917); });
shotT('T20', (f, lt) => { const c = chestOf(PJ_PIERCED, 0); loopShot(f, lt, HH(CP([{ t: 0, pos: vAdd(c, [2.4, -.9, -2.6]), target: vAdd(c, [-1, .4, 0]), fov: 46 }, { t: 1.58, pos: vAdd(c, [2.9, -.7, -1.6]), target: vAdd(c, [-1, .4, 0]), fov: 44 }])(lt), lt, .005, 75), 126.5, 1); imp(f, [{ s: 'izanamiloop', n: 3 }], 126.6667); });
shotT('T21', (f, lt) => { const c = chestOf(PJ_PIERCED, 0), ph = Math.min(2, Math.floor(lt / .53)), cams = [[2.2, .3, 2.4], [-1.6, 1.2, 2.6], [1.0, -.4, -2.8]];
  loopShot(f, (lt % .53) * 1.5, HH({ pos: vAdd(c, cams[ph]), target: vAdd(c, [-.4, .1, 0]), fov: 42 - ph * 3 }, lt, .008, 76), 128, 1); f.motionBlur(lt % .53 < .06 ? 18 : 0);
  imp(f, [{ s: 'izanamiloop', n: 2 }, { s: 'chroma', n: 1, p: { d: 26 } }], 128.875); });
// T22 the stands: Shunsui claps his hands ("Ha! He lost. Nobody escapes a loop.") | Dazai, quietly ("One can. By accepting it.")
shotT('T22', (f, lt) => {
  if (lt < 1.0) STAR(f, 'KYO:kyo_kneeSlap', lt, { focus: 'both', part: 'two', rD: 'dazai_watch', az: -.3, push: .45, react: 'gasp', dmg: 2.5, flash: 'red', flashT: .1 });
  else STAR(f, 'DAZ:explain', lt - 1.0, { part: 'bust', az: .4, push: .3, react: 'hush', dmg: 2.5 });
});
// T23 Julius sees himself in the Yata mirror: a tired old man running from one moment; his hand sinks from the grimoire (X-TWIST 132.08 gold-desat)
const T23J = J2('manazone', [[0, at([0, 0, 0], -HP, P('jul_stand', { cut: 1, grim: 1, grimOpen: 1, timeGlow: .4, face: expr('exhausted', { eye: .7 }) }))], [1.1, at([0, 0, 0], -HP, P('jul_stand', { cut: 1, grim: 1, grimOpen: 1, timeGlow: .2, face: expr('exhausted', { eye: .6 }) })), 'hold'], [2.0, at([0, 0, 0], -HP, P('jul_stand', { cut: 1, grim: 0, timeGlow: 0, aL: [.25, .35, 0], eL: .3, face: expr('julSerious', { eye: .55 }) })), 'inOut']], { timing: 2 });
shotT('T23', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 2.5 }); f.grade({ sat: .45, tint: ['#ffc8a0', .25] }); f.light({ fx: [{ p: [-.8, 1.6, 0], col: '#ff8a5a', r: 2.5, a: .8 }] });
  f.cam(HH(CUT(lt, [[1.25, l => camSlowPush(T23J, l, 0, 1.25, { part: 'face', az: .1, el: .03, from: 1.25, to: 1.05 })], [9, l => closeCam(T23J, l, { part: 'bust', az: .7, el: .1, dist: E(1.5, 1.35, 1.25, 2, l) })]]), lt, .002, 77)); f.fig(T23J);
  f.fx(g => { if (lt < 1.25) ageHair(g, T23J, lt, .8); }, { layer: 'over' }); f.fx(g => { if (lt < 1.25) mirrorFrame(g, 1, lt); }, { layer: 'top' });
  imp(f, [{ s: 'desat', n: 1, p: { accent: '#ffd36a' } }, { s: 'goldtime', n: 1 }], 132.0833);
});
// T24 ECU, eyes closed: JULIUS' SECOND INSIGHT - he stops rewinding and opens his arms to the blow ("Time... has to move forward.")
const T24J = J2('manazone', [[0, at([0, 0, 0], -HP, P('jul_eyesClosed', { cut: 1, face: FA2(expr('julSense'), 0) }))], [1.0, at([0, 0, 0], -HP, P('jul_eyesClosed', { cut: 1, face: expr('julSense') })), 'hold'],
  [1.9, at([0, 0, 0], -HP, P('jul_stand', { cut: 1, aL: [1.2, .55, 0], eL: .2, hL: 'open', aR: [1.2, .55, 0], eR: .2, hR: 'open', face: FA2(expr('julSmile', { closed: 1 }), 1.9, { talk: 1 }) })), 'inOut'], [2.5, at([0, 0, 0], -HP, P('jul_stand', { cut: 1, aL: [1.25, .6, 0], eL: .2, hL: 'open', aR: [1.25, .6, 0], eR: .2, hR: 'open', face: expr('julSmile', { closed: 1 }) }))]], { timing: 2 });
shotT('T24', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'J', dmg: 2.5 }); f.grade({ sat: lerp(.5, 1, U(lt, 1, 2.4)) });
  f.cam(HH(CUT(lt, [[1.0, l => camSlowPush(T24J, l, 0, 1, { part: 'eyes', az: -.15, el: .02, from: 1.05, to: .92 })], [9, l => CP([{ t: 1.0, pos: [-1.0, 1.65, .6], target: [0, 1.62, 0], fov: 38 }, { t: 2.5, pos: [-2.6, 1.4, 1.6], target: [0, 1.35, 0], fov: 42, ease: 'inOut' }])(l)]]), lt, .002, 78)); f.fig(T24J);
});
// T25 SILENCE, white (BURST 135.92): Julius turns so the Totsuka takes his shoulder; he accepts the wound and the Izanami loop shatters like glass across the frame
const T25J = J2('manazone', [[0, at(PJ, -HP, P('jul_stand', { cut: 1, aL: [1.25, .6, 0], eL: .2, aR: [1.25, .6, 0], eR: .2, face: expr('julSmile', { closed: 1 }) }))], [.12, at(PJ, -HP - .7, P('jul_hurt', { cut: 1, sp: .2, face: expr('pain') })), 'snap'], [1.08, at(PJ, -HP - .75, P('jul_hurt', { cut: 1, sp: .25, face: expr('julSerious') }))]], { timing: 1 });
shotT('T25', (f, lt) => {
  BGX(f, 'ARENA_DAY', { dmg: 2.5 }); f.grade({ bright: 1.25, sat: .35, lift: ['#ffffff', .25] }); const sh = vAdd(JP(T25J, .2, 'neck'), [0, -.05, -.22]), d = vNorm(vSub(sh, SH));
  f.cam(HH(CP([{ t: 0, pos: [3.4, 1.6, 6.5], target: [-2.4, 2.0, -1.2], fov: 46 }, { t: 1.08, pos: [4.2, 1.9, 8.2], target: [-2.6, 2.2, -1.2], fov: 48 }])(lt), lt, .003, 79));
  f.fig(T25J); f.fig(TI); SUS(f, lt, { at: TS, yaw: TSY, stage: 4, scale: THs, sword: 0, shield: 1, arm: .2, armL: .4, k: .7, layer: 'under' });
  f.fx(g => { totsuka(g, SH, vMad(sh, d, .5), lt); wound(g, sh, .1, U(lt, .1, .2)); }, { layer: 'over' });
  f.fx(g => { screenCracks(g, W * .52, H * .45, U(lt, .45, .75), { n: 18, seed: 11, col: '#ffffff', glow: 'rgba(255,60,60,.5)' }); screenShards(g, W * .52, H * .45, lt - .72, { n: 46, col: 'rgba(255,200,200,.7)' }); }, { layer: 'top' });
  imp(f, burstSeq('W1-N2-L2-H2-S2-K2-G1', { who: 'julius', fig: 0, part: 'face' }), 135.9167);
});

// ================================================================================================ J: FINALE
const IF = [-3.2, 0, 0], JF = [3.0, 0, 0];
// J01 two-shot in the rain: Julius' shoulder bleeds, grimoire open; Itachi one-eyed, the Susanoo half fallen ("You accepted it." / "A crow taught me.")
const J01I = I2('sick_mangekyo', t => breathe(at(IF, HP, P('ita_stand', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, sp: .15, face: FA2('itaSoft', t, { talk: t > .1 && t < .9 ? 1 : 0 }) })), t * 1.4), { timing: 2 });
const J01J = J2('wounded', t => breathe(at(JF, -HP, P('jul_stand', { wounds: 2, grim: 1, grimOpen: 1, face: FA2('julSmile', t, { talk: t > 1.05 && t < 1.85 ? 1 : 0 }) })), t), { timing: 2 });
shotT('J01', (f, lt) => {
  BGX(f, 'ARENA', { dmg: 3 }); f.cam(HH(CUT(lt, [[.98, l => camSlowPush(J01I, l, 0, .98, { part: 'bust', az: .6, el: .03, from: 1.5, to: 1.3 })],
    [9, l => camSlowPush(J01J, l, .98, 1.92, { part: 'bust', az: -.6, el: .03, from: 1.6, to: 1.4 })]]), lt, .003, 80));
  f.fig(J01I); f.fig(J01J); SUS(f, lt, { at: vAdd(IF, [-.4, 0, 0]), yaw: HP, stage: 2, scale: 3.9, k: .22 + .08 * Math.sin(lt * 11), layer: 'under' });
  f.fx(g => { const S = figSkel(J01J, lt); wound(g, vAdd(S.J.shR, [0, -.04, 0]), .055); bloodTrail(g, vAdd(S.J.shR, [0, -.1, .05]), .3); }, { layer: 'over' });
});
// J02 low: Itachi pours out the last of his chakra - the Susanoo builds again, cracked and guttering (X-FIN 139.0 red negative)
const J02I = I2('sick_mangekyo', t => breathe(at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, eyeGlow: 1, face: expr('itaCold') })), t), { timing: 2 });
shotT('J02', (f, lt) => {
  BGX(f, 'ARENA_RED', { side: 'I', dmg: 3 }); f.light({ fx: [{ p: vAdd(IF, [0, 3, 1]), col: '#e8553a', r: 8, a: .8 }] });
  f.cam(HH(CP([{ t: 0, pos: [-1.6, .3, 2.6], target: [-3.2, 1.4, 0], fov: 46 }, { t: 1.5, pos: [.8, .5, 5.6], target: [-3.6, 4.0, 0], fov: 54, ease: 'inOut' }])(lt), lt, .005, 81));
  f.fig(J02I); SUS(f, lt, { at: vAdd(IF, [-.5, 0, 0]), yaw: HP, stage: E(1.5, 4, 0, 1.0, lt), scale: E(3.6, 7.5, 0, 1.2, lt), sword: E(0, 1, .8, 1.4, lt), shield: E(0, 1, .7, 1.3, lt), arm: .4, armL: .35, k: Math.sin(lt * 37) > .5 ? .45 : .85 });
  f.fx(g => { const q = project(vAdd(IF, [0, 4.5, 0])); if (q) screenCracks(g, q.x, q.y, .55, { n: 8, r: 700, seed: 13, col: '#ffd0b0', glow: 'rgba(255,90,60,.45)' }); }, { layer: 'over' });
  imp(f, [{ s: 'flash', n: 1, p: { col: '#d81a28' } }, { s: 'invert', n: 2, p: { hue: 0, lines: 60 } }], 139.0); shake(f, .08, 22, .5);
});
// J03 Julius rises into the air above the Mana Zone - gears everywhere, golden clock hands ("Let's finish this, Itachi Uchiha.")
const J03J = J2('wounded', t => breathe(at([3.0, E(0, 3.2, 0, 1.4, t), 0], -HP, P('jul_float', { ground: false, wounds: 2, timeGlow: 1, face: FA2('julSerious', t, { talk: t > .08 && t < 1.5 ? 1 : 0 }) })), t), { timing: 2 });
shotT('J03', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { side: 'J', dmg: 3, bg: { clockScar: 1, clockR: 24, clockAt: [0, 0, 0] } }); f.post({ bloom: .7 });
  { const ab = JP(J03J, lt, 'abd'); f.cam(HH({ pos: vAdd(ab, [-2.3, lerp(-.9, -.3, U(lt, 0, 1.58)), 1.9]), target: vAdd(ab, [0, .45, 0]), fov: 44 }, lt, .004, 82)); }
  f.fig(J03J); f.fx(g => { fxGears(g, [3, 3, -4], lt + 3, { n: 12, r: 7, size: .7 }); fxClockCircle(g, vAdd(JP(J03J, lt, 'abd'), [2.6, .6, -2.2]), [-1, 0, .7], lt + 1, { r: 3.4, handsT: lt * 4, w: .8, k: .6 }); fxManaZone(g, [0, 0, 0], lt + 2, { r: 20 }); }, { layer: 'glow' });
});
// J04 CHRONO STASIS: GRIGORA (BURST 143.34): superwide - the whole arena freezes grey: rain, crows, silhouettes, the Susanoo
const J04J = J2('wounded', t => at([2.0, 2.2, 5.0], -HP - .35, P(t < .9 ? 'jul_raise' : 'jul_castBoth', { ground: false, wounds: 2, timeGlow: 1, face: expr('julShout') })), { timing: 2 });
const J04I = I2('sick_mangekyo', t => at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaCold') })), { timing: 2 });
shotT('J04', (f, lt) => {
  const frz = lt > 1.84, fk = U(lt, 1.84, 2.0); BGX(f, frz ? 'ARENA_DARK' : 'ARENA_GOLD', { dmg: 3, bg: { clockScar: 1, clockR: 24, clockAt: [0, 0, 0], frozen: fk, react: frz ? 'hush' : 'gasp' }, rain: frz ? { mode: 'frozen', clock: 143.34 } : undefined }); f.post({ bloom: .7 });
  const jh = JP(J04J, lt, 'head'), cam = lt < 1.34 ? (() => { const pp = L3([-.9, .9, 3.0], [-.6, .7, 2.6], U(lt, 0, 1.34)); return { pos: pp, target: aim2(pp, jh, [7, 11, 9], .3), fov: 50 }; })() : (() => { const pp = L3([5.4, 3.4, 10.5], [5.0, 3.8, 11.5], U(lt, 1.34, 2)); return { pos: pp, target: aim2(pp, jh, [-3.6, 4.5, 0], .55), fov: 56 }; })();
  f.cam(camShake(HH(cam, lt, .004, 83), [[1.34, 34, .6, 18]], lt));
  f.fig(J04J); f.fig(J04I, frz ? { t: 1.84 } : {}); SUS(f, frz ? 1.84 : lt, { at: vAdd(IF, [-.5, 0, 0]), yaw: HP, stage: 4, scale: 7.5, sword: 1, shield: 1, arm: .55, armL: .35, k: frz ? .55 : .85, col: frz ? '#8a8e9a' : undefined });
  f.fx(g => { fxClockCircle(g, lt < 1.34 ? [7, 11, 9] : [-2, 13, -8], lt < 1.34 ? [-.6, -.7, -.4] : [0, -.4, 1], lt, { r: 5 + 4 * U(lt, 0, 1.3), handsT: frz ? 4 : lt * 3, spin: frz ? 0 : 1.4, w: 1.8 }); }, { layer: 'glow' });
  if (frz) { f.grade({ sat: .12, tint: ['#c8d4ff', .25] }); CROWS(f, 2.1, { c: [-2, 6, -2], n: 22, r: 5, mode: 'swirl', size: .5 }); }
  imp(f, burstSeq('G1-N2-W1-D2-H2-S2-G2', { who: 'julius', fig: 0, part: 'face' }), 143.3333);
  TT(f, lt, 'CHRONO STASIS: GRIGORA', 'WIZARD', { textAt: .12, title: { dur: .82, kind: 'stasis' } });
});
// J05 the frozen world: only Julius moves ... but the Yata mirror glows and a crack spreads through frozen time round it | ECU: Itachi's one eye moves (X-FIN 144.83 crystal)
const J05J = J2('wounded', t => at([1.2, 0, 1.2], -HP, IJ.julWalkBack(t * .6, { wounds: 2, timeGlow: 1, face: expr('julSerious') })), { timing: 2 });
const J05I = I2('sick_mangekyo', t => at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaCold', { eye: 1, look: t > 1.05 ? [-.45, .1] : [.15, 0] }) })), { timing: 1 });
shotT('J05', (f, lt) => {
  BGX(f, 'ARENA_DARK', { dmg: 3, bg: { frozen: 1, clockScar: 1, clockR: 24, clockAt: [0, 0, 0] } }); f.grade({ sat: .12, tint: ['#c8d4ff', .25] });
  const mir = susW(vAdd(IF, [-.5, 0, 0]), HP, 7.5, -.36, .5, .38);
  if (lt < .98) { { const pp = L3([3.0, 1.4, 5.0], [2.6, 1.55, 4.4], U(lt, 0, .98)); f.cam(HH({ pos: pp, target: aim2(pp, JP(J05J, lt, 'head'), mir, .55), fov: 50 }, lt, .003, 84)); } f.fig(J05J); f.fig(J05I, { t: 0 });
    SUS(f, 0, { at: vAdd(IF, [-.5, 0, 0]), yaw: HP, stage: 4, scale: 7.5, sword: 1, shield: 1, arm: .55, armL: .35, k: .55, col: '#8a8e9a' });
    f.light({ fx: [{ p: mir, col: '#ff8a5a', r: 5, a: .5 + .5 * U(lt, .3, .9) }] });
    f.fx(g => { fxGlowAt(g, mir, 1.6 + U(lt, .3, .9), '#ff8a5a', .9); const q = project(mir); if (q) screenCracks(g, q.x, q.y, U(lt, .35, .95), { n: 12, r: 900, seed: 17, col: '#fff0e8', glow: 'rgba(255,140,90,.6)' }); }, { layer: 'glow' }); }
  else { f.style('hand2d'); f.grade({ sat: .3 }); f.cam(HH(closeCam(J05I, lt, { part: 'eyes', az: .25, el: .02, dist: E(1.05, .92, .98, 1.58, lt) }), lt, .0015, 85)); f.fig(J05I); }
  imp(f, [{ s: 'crystal', n: 3 }], 144.8333);
});
// J06 the stands, frozen in Grigora: silhouettes grey, Shunsui's mouth open mid-shout, a spray of sake hanging in the air - only Dazai's eyes move ("...Here comes the last hour.")
shotT('J06', (f, lt) => {
  STAR(f, 'DAZ:narrow', lt, { focus: 'both', part: 'two', rS: 'verdict', az: .3, push: .4, react: 'freeze', freezeT: .2, dmg: 3 });
  for (const e of f._figs) if (e.F && e.F.starKey === 'shunsui') e.opt.t = .35;   // Shunsui is frozen too (only Dazai moves)
  f.fx(g => { const Fs = IJ.starFig('shunsui', 'verdict'); if (!Fs) return; const h = figPos(Fs, .35, 'handR'); g.save(); for (let i = 0; i < 26; i++) { const u = i / 26, p = vAdd(h, [.1 + u * .9, .15 + Math.sin(u * Math.PI) * .45, .05 + u * .2]), q = project(p); if (!q) continue; g.fillStyle = 'rgba(235,240,255,.9)'; g.beginPath(); g.arc(q.x, q.y, Math.max(2, .012 * q.s * (1 - u * .5)), 0, TAU); g.fill(); } g.restore(); }, { layer: 'over' });
});
// J07 Itachi tears free in a spray of time shards; the Totsuka swings through frozen time - Julius is caught off guard - blade against palm (X-FIN 148.92)
const J07I = I2('sick_mangekyo', t => at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, eyeGlow: 1, face: expr('itaCold') })), { timing: 2 });
const J07J = J2('wounded', [[0, at([1.0, 0, 1.2], -HP, P('jul_stand', { wounds: 2, timeGlow: 1, face: expr('julSerious') }))], [.7, at([1.0, 0, 1.2], -HP, P('jul_hurt', { wounds: 2, timeGlow: 1, face: expr('shock') })), 'snap'], [1.6, at([1.2, 0, 1.2], -HP, P('jul_palmOut', { wounds: 2, timeGlow: 1, face: expr('julFierce') })), 'out'], [2.0, at([1.3, 0, 1.2], -HP, P('jul_palmOut', { wounds: 2, timeGlow: 1, sp: .2, face: expr('julShout') }))]], { timing: 1 });
shotT('J07', (f, lt) => {
  const fr = 1 - U(lt, .25, .6); BGX(f, 'ARENA_DARK', { dmg: 3, bg: { frozen: fr } }); f.grade({ sat: lerp(1, .15, fr) });
  const S0 = vAdd(IF, [-.5, 0, 0]); f.cam(camShake(HH(CUT(lt, [[.7, l => CP([{ t: 0, pos: [-.6, 2.6, 6.8], target: [-3.6, 3.6, 0], fov: 50 }, { t: .7, pos: [0, 2.4, 6.2], target: [-3.4, 3.4, 0], fov: 48 }])(l)],
    [9, l => CP([{ t: .7, pos: [3.6, 1.5, 4.6], target: [-.2, 2.2, .4], fov: 46 }, { t: 2.0, pos: [3.2, 1.6, 3.9], target: [0, 2.3, .6], fov: 44 }])(l)]]), lt, .006, 86), [[.3, 24, .5, 18], [1.71, 30, .5, 18]], lt));
  f.fig(J07I); f.fig(J07J); SUS(f, lt, { at: S0, yaw: HP, stage: 4, scale: 7.5, sword: 1, shield: 1, arm: .7, armL: .35, swing: E(.0, .72, .7, 1.7, lt, easeIn), k: .85 });
  f.fx(g => { const q = project(vAdd(IF, [0, 2.5, 0])); if (q && lt > .25) { screenShards(g, q.x, q.y, lt - .25, { n: 60, col: 'rgba(200,215,255,.7)', edge: '#f6d36a' }); } if (lt > 1.6) { const p = vAdd(JP(J07J, lt, 'handR'), [-.4, .1, 0]); fxClockShield(g, p, [-1, .1, 0], lt - 1.5, { r: 1.1, hit: lt - 1.71 }); fxSparks(g, p, lt - 1.71, { n: 34 }); } }, { layer: 'over' });
  imp(f, [{ s: 'sumi', n: 2 }, { s: 'redblack', n: 1, p: { col: '#d81a28' } }], 148.9167);
});
// J08 slow motion: mid-swing Itachi coughs blood - HIS TIME RUNS OUT - and the Susanoo comes apart into crows (X-FIN 150.29 desat + red)
const J08I = I2('sick_mangekyo', [[0, at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaCold') }))], [.9, at(IF, HP, P('ita_susanoo', { mang: 1, bleed: 1.8, blood: 1, blindL: 1, face: expr('itaPain') })), 'hold'], [1.15, at(IF, HP, P('ita_cough', { mang: .6, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaCough') })), 'snap'], [2.0, at(vAdd(IF, [-.2, 0, 0]), HP, P('ita_cough', { mang: .5, bleed: 1.8, blood: 1.2, blindL: 1, sp: .45, face: expr('itaCough') }))]], { timing: 2 });
shotT('J08', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 3, rain: { clock: f.shot.t0 + lt * .2 } }); const dk = U(lt, 1.15, 1.9), S0 = vAdd(IF, [-.5, 0, 0]);
  f.cam(HH(CUT(lt, [[1.08, l => CP([{ t: 0, pos: [-.4, 2.2, 6.2], target: [-3.2, 3.4, 0], fov: 50 }, { t: 1.08, pos: [-.8, 2.0, 5.4], target: [-3.2, 3.0, 0], fov: 48 }])(l)], [9, l => closeCam(J08I, l, { part: 'bust', az: .15, el: -.15, dist: E(1.5, 1.3, 1.08, 2, l) })]]), lt, .004, 87));
  f.fig(J08I); SUS(f, lt, { at: S0, yaw: HP, stage: lerp(4, .6, dk), scale: 7.5, sword: 1 - dk, shield: 1 - dk, arm: .7, armL: .35, swing: .5, k: .85 * (1 - dk * .9) });
  CROWS(f, lt - 1.15, { c: vAdd(IF, [0, 3.5, 0]), n: 60, r: 5, mode: 'burst', dur: 1.2, size: .5 });
  f.fx(g => { if (lt > 1.12) { const m = vAdd(JP(J08I, lt, 'head'), [.12, -.12, .02]); for (let i = 0; i < 14; i++) { const u = (lt - 1.12) * 1.3 - i * .02; if (u < 0 || u > 1) continue; const q = project(vAdd(m, [.4 * u + hash(i) * .1, -.5 * u * u + .1 * u, (hash(i * 3) - .5) * .2])); if (q) { g.fillStyle = '#9a0010'; g.beginPath(); g.arc(q.x, q.y, Math.max(2, .02 * q.s), 0, TAU); g.fill(); } } } }, { layer: 'over' });
  imp(f, [{ s: 'desat', n: 2, p: { accent: '#d81a28' } }], 150.2917);
});
// J09 ECU Julius sees it: respect, and grief ("You've given everything.")
const J09J = J2('wounded', t => breathe(at([0, 0, 0], -HP, P('jul_stand', { wounds: 2, timeGlow: .5, face: FA2('julSerious', t, { talk: t > .18 && t < 1.5 ? .9 : 0 }) })), t), { timing: 2 });
shotT('J09', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'J', dmg: 3 }); f.cam(HH(camSlowPush(J09J, lt, 0, 1.58, { part: 'face', az: -.4, el: .04, from: 1.2, to: .98 }), lt, .002, 88)); f.fig(J09J);
});
// J10 wide: Itachi's last arsenal at once - Katon fire flowers, crows, kunai - everything he has left (X-FIN 153.25 fire + crow)
const J10I = I2('sick', t => at(IF, HP, P(t < .5 ? 'ita_sign' : 'ita_throw', { shar: 1, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaCold') })), { timing: 1 });
const J10J = J2('wounded', t => at([3.6, 0, .8], -HP, P('jul_stand', { wounds: 2, timeGlow: 1, face: expr('julSerious') })), { timing: 2 });
shotT('J10', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 3 }); f.light({ fx: [{ p: [0, 2, 0], col: '#ff8a2a', r: 9, a: .8 }] });
  f.cam(camShake(HH(CP([{ t: 0, pos: [-1.2, 1.4, 5.4], target: [.2, 1.5, 0], fov: 54 }, { t: 1.5, pos: [.8, 1.6, 6.2], target: [.4, 1.6, 0], fov: 54 }])(lt), lt, .006, 89), [[.46, 22, .5, 18]], lt));
  f.fig(J10I); f.fig(J10J);
  f.fx(g => { fxHosenka(g, [-2.4, 1.6, 0], [1, -.03, .05], lt - .1, { n: 8, spread: 2.2, r: .5, speed: 9 }); fxFireball(g, [-2.4, 1.6, 0], [1, 0, .06], lt - .2, { r: 1.2, speed: 10, travel: 5 });
    fxCrows(g, lt - .3, { mode: 'stream', from: [-3, 2, 0], to: [3.6, 1.6, .8], n: 40, dur: .6, stagger: .5, spread: 2.2, size: .36 }); fxShurikens(g, [-2.6, 1.4, -.2], [3.2, 1.5, .8], lt - .4, { n: 10, curve: .6 }); }, { layer: 'over' });
  imp(f, [{ s: 'firebloom', n: 2 }, { s: 'crowburst', n: 1 }], 153.25);
});
// J11 Julius walks through all of it in slowed time - flames and kunai stop round him (X-FIN 154.38 TIME_FREEZE)
const J11J = J2('wounded', t => at([lerp(3.2, .6, t / 1.63), 0, .8], -HP, IJ.julWalkBack(t * .55, { wounds: 2, timeGlow: 1, face: expr('julSerious') })), { timing: 2 });
shotT('J11', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { side: 'J', dmg: 3, rain: { mode: 'frozen', clock: 154.3 } }); f.grade({ sat: .6 }); const jp = JP(J11J, lt, 'abd');
  f.cam(HH({ pos: vAdd(jp, [-2.6, .45, 2.4 + lt * .2]), target: vAdd(jp, [.2, .4, 0]), fov: 44 }, lt, .003, 90)); f.fig(J11J);
  f.fx(g => { for (let i = 0; i < 9; i++) { const p = vAdd(jp, [-.8 - hash(i) * 2.4, (hash(i * 3) - .4) * 1.6, (hash(i * 7) - .5) * 2.4]); if (i % 3 === 0) fxAmaterasu(g, p, 2, { r: .12, h: .3, n: 3, seed: i }); else { const q = project(p), q2 = project(vAdd(p, [.32, 0, 0])); if (q && q2) { g.save(); g.strokeStyle = '#1a1820'; g.lineWidth = Math.max(2, .05 * q.s); g.lineCap = 'round'; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q2.x, q2.y); g.stroke(); g.restore(); } } }
    for (let i = 0; i < 6; i++) { const p = vAdd(jp, [-1.4 - hash(i * 5) * 2, (hash(i * 9) - .3), (hash(i * 4) - .5) * 2]); fxFireballAge(g, p, 0, { r: .3, age: .2 }); } fxClockCircle(g, jp, [1, .1, .3], lt + 1, { r: 1.5, handsT: 2, spin: .05, w: .8, k: .6 }); }, { layer: 'over' });
  imp(f, [{ s: 'timefreeze', n: 2 }], 154.375);
});
// J12 ECU Itachi's eye: Julius is right in front of him (X-FIN 156.21)
const J12I = I2('sick', t => at([0, 0, 0], HP, P('ita_stand', { shar: 1, spin: t * .5, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaStare', { eye: 1 }) })), { timing: 2 });
shotT('J12', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'J', dmg: 3 }); f.light({ fx: [{ p: [1, 1.6, 0], col: '#ffd36a', r: 3, a: .6 }] });
  f.cam(HH(closeCam(J12I, lt, { part: 'eyes', az: .3, el: .02, dist: E(1.05, .9, 0, 1.38, lt) }), lt, .0015, 91)); f.fig(J12I);
  imp(f, [{ s: 'faceneg', n: 1, p: { part: 'eyes' } }, { s: 'crimsonline', n: 1, p: { col: '#d81a28' } }], 156.2083);
});
// J13 from behind Julius against a giant sky clock: he gathers ALL his stored time into one fist, the hands racing (X-FIN 157.75 GOLD_BURN) TIME MAGIC: FINAL HOUR
const J13J = J2('wounded', t => breathe(at([1.0, 0, .3], -HP, P('jul_punchWind', { wounds: 2, timeGlow: 1, face: expr('julShout') })), t), { timing: 2 });
shotT('J13', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { side: 'J', dmg: 3, rain: { mode: 'frozen', clock: 157.3 } }); f.post({ bloom: .85 }); const hR = JP(J13J, lt, 'handR');
  f.cam(HH(CP([{ t: 0, pos: [3.4, .9, 2.4], target: [-4, 3.4, -1], fov: 48 }, { t: 1.63, pos: [3.0, 1.0, 1.7], target: [-4, 3.0, -1], fov: 44 }])(lt), lt, .004, 92)); f.fig(J13J);
  f.light({ fx: [{ p: hR, col: '#ffd36a', r: 4, a: .9 }] });
  f.fx(g => { fxClockCircle(g, [-8, 8, -12], [1, -.1, .8], lt + 2, { r: 8, handsT: lt * lt * 50, spin: 2, w: 2.2 }); fxGlowAt(g, hR, .35 + .25 * U(lt, 0, 1.4), '#fff2c0', 1); for (let i = 0; i < 16; i++) { const u = (lt * 1.4 + hash(i)) % 1, a = hash(i * 3) * TAU, p = vAdd(hR, [Math.cos(a) * 2.4 * (1 - u), Math.sin(a) * 2 * (1 - u), (hash(i * 5) - .5) * 2 * (1 - u)]); fxGlowAt(g, p, .08, '#ffd36a', .9); } }, { layer: 'glow' });
  imp(f, fit('GOLD_BURN', 3), 157.75); TT(f, lt, 'TIME MAGIC: FINAL HOUR', 'WIZARD', { textAt: .6, title: { dur: .7 } });
});
// J14 medium Itachi: a faint smile; he raises two fingers - not to fight (X-FIN 158.92 small white)
const J14I = I2('sick', [[0, at([0, 0, 0], HP, P('ita_stand', { shar: .6, bleed: 1.8, blood: 1.2, blindL: 1, sp: .15, face: expr('itaSoft') }))], [.9, at([0, 0, 0], HP, P('ita_twoFingers', { shar: .6, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaSoft') })), 'inOut'], [1.58, at([0, 0, 0], HP, P('ita_twoFingers', { shar: .5, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaSoft') }))]], { timing: 2 });
shotT('J14', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I', dmg: 3, rain: { mode: 'frozen', clock: 158.9 } });
  f.cam(HH(closeCam(J14I, lt, { part: 'bust', az: .4, el: .02, dist: E(1.6, 1.35, 0, 1.58, lt) }), lt, .002, 93)); f.fig(J14I);
  imp(f, [{ s: 'flash', n: 1 }, { s: 'whiteout', n: 1 }], 158.9167);
});
// J15 two silhouettes against the clock face, the rain hanging still (X-FIN 161.17)
const J15I = I2('sick', t => at([-1.2, 0, 0], HP, P('ita_twoFingers', { shar: .5, face: expr('itaSoft') })), { timing: 2 });
const J15J = J2('wounded', t => at([1.0, 0, 0], -HP, P('jul_punchWind', { wounds: 2, face: expr('julShout') })), { timing: 2 });
shotT('J15', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { dmg: 3, rain: { mode: 'frozen', clock: 160.5 } });
  f.cam(HH(CP([{ t: 0, pos: [0, .5, 7.0], target: [0, 2.6, -6], fov: 46 }, { t: 1.29, pos: [0, .6, 6.2], target: [0, 2.6, -6], fov: 44 }])(lt), lt, .002, 94));
  f.fx(g => { fxClockCircle(g, [0, 3.2, -10], [0, 0, 1], lt + 2, { r: 6.5, handsT: -.04 + lt * .02, spin: .1, w: 2.4 }); fxGlowAt(g, [0, 3.2, -11], 6, '#ffd36a', .6); }, { layer: 'under' });
  f.fig(J15I, { mode: 'flat', col: '#050304' }); f.fig(J15J, { mode: 'flat', col: '#050304' });
  imp(f, [{ s: 'rimsil', n: 2, p: { col: '#1a1408', col2: '#ffd36a', rimCol: '#ffffff', sil: '#000000' } }], 161.1667);
});
// J16 ECU fist, slow motion: it travels; the clock hands strike twelve (X-FIN 162.29)
const J16J = J2('wounded', t => at([lerp(1.3, .7, t / 1.2), 0, 0], -HP, P('jul_punch', { wounds: 2, timeGlow: 1, face: expr('julShout') })), { timing: 2 });
shotT('J16', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { side: 'J', dmg: 3, rain: { mode: 'frozen', clock: 161.8 } }); f.post({ bloom: .8 }); const hR = JP(J16J, lt, 'handR');
  f.cam(HH({ pos: vAdd(hR, [-.7, .3, 2.0 - lt * .15]), target: vAdd(hR, [.35, .1, 0]), fov: 40 }, lt, .0015, 95)); f.fig(J16J);
  f.fx(g => { fxGlowAt(g, hR, .3, '#fff2c0', 1); fxClockCircle(g, vAdd(hR, [-1.2, .5, -2.5]), [1, 0, .5], lt + 2, { r: 1.6, handsT: lt < .5 ? -(.5 - lt) * .2 : 0, spin: .1, w: 1.1 }); }, { layer: 'glow' });
  imp(f, [{ s: 'goldtime', n: 1 }, { s: 'blackaccent', n: 1, p: { accent: '#ffd36a' } }], 162.2917);
});
// J17 THE LAST BLOW (163.00): fist into Itachi's chest with all the stored time - a golden shockwave, and ALL the stopped rain explodes into motion at once.
//     48-frame BURST (2.0 s) over three camera set-ups (superwide -> close -> side) so every frame is different; then the arena breathes again
const J17I = I2('sick', [[0, at([-.5, 0, 0], HP, P('ita_twoFingers', { shar: .5, bleed: 1.8, blood: 1.2, blindL: 1, face: expr('itaSoft') }))], [.06, at([-.6, 0, 0], HP, P('ita_hurt', { shar: .4, bleed: 1.8, blood: 1.3, blindL: 1, sp: -.3, face: expr('itaPain') })), 'snap'],
  [2.58, at([-4.2, .9, 0], HP, P('ita_hurt', { ground: false, shar: .2, bleed: 1.8, blood: 1.3, blindL: 1, sp: -.5, pitch: -.6, face: expr('itaSoft', { eye: .3 }) })), 'out']], { timing: 1 });
const J17J = J2('wounded', [[0, at([.75, 0, 0], -HP, P('jul_punch', { wounds: 2, timeGlow: 1, face: expr('julShout') }))], [2.58, at([.55, 0, 0], -HP, P('jul_punch', { wounds: 2, timeGlow: .3, sp: .2, face: expr('julSerious') }))]], { timing: 1 });
const J17PAT = 'W1-N2-G2-RB2-H2-S2-F2-K2-C2-W1-BLK1-G2-N2-F2-R2-S2-H2-K2-W1-N2-G1-C2-H2-RB2-F2-W1-BLK2';
shotT('J17', (f, lt) => {
  BGX(f, 'ARENA_GOLD', { dmg: 3, bg: { react: 'roar' }, rain: { mode: 'collapse', collapseT: Math.max(0, lt - .02), clock: SHOTS.J16.t0 } }); f.post({ bloom: 1.0 });
  const ch = JP(J17I, .03, 'chest');
  f.cam(camShake(HH(CUT(lt, [[.7, l => CP([{ t: 0, pos: [2.5, 2.2, 13.5], target: [-.8, 2.0, 0], fov: 46 }, { t: .7, pos: [2.0, 2.0, 11.0], target: [-1.0, 1.8, 0], fov: 44 }])(l)],
    [1.38, l => ({ pos: vAdd(ch, [.9, .25, 1.8 - (l - .7) * .4]), target: vAdd(ch, [-.15, .15, 0]), fov: 40 })],
    [2.0, l => CP([{ t: 1.38, pos: [-1.4, .5, 5.2], target: [-2.0, 1.3, 0], fov: 44 }, { t: 2.0, pos: [-2.0, .6, 5.8], target: [-2.8, 1.3, 0], fov: 46 }])(l)],
    [9, l => CP([{ t: 2.0, pos: [.4, 1.3, 5.2], target: [-2.4, 1.6, 0], fov: 50 }, { t: 2.58, pos: [.9, 1.5, 6.2], target: [-2.8, 1.5, 0], fov: 52 }])(l)]]), lt, .006, 96), [[0, 44, 2.0, 20], [2.0, 14, .5, 14]], lt));
  f.fig(J17J, { t: hitStop(lt, [[.02, .12]]) }); f.fig(J17I, { t: hitStop(lt, [[.02, .12]]) });
  f.light({ fx: [{ p: ch, col: '#fff2c0', r: 9, a: clamp(1.4 - lt * .5, .3, 1) }] });
  f.fx(g => { fxShockSphere(g, ch, lt - .02, { r: 10, dur: 1.2, col: '#fff2c8' }); fxShockRing(g, [0, .1, 0], lt - .05, { r: 30, dur: 1.6, col: '#ffd36a' }); fxShockRing(g, [0, .1, 0], lt - .4, { r: 22, dur: 1.4, col: '#fff6e0' });
    fxClockCircle(g, ch, [1, 0, 0], lt + .2, { r: 2.4 + lt * 2, handsT: lt * 30, spin: 6, w: 1.4, k: clamp(1.6 - lt * .7, 0, 1) }); fxSparks(g, ch, lt - .02, { n: 60, dur: .8 }); fxDebris(g, [0, .2, 0], lt - .05, { kind: 'rock', n: 40 }); }, { layer: 'over' });
  imp(f, burstSeq(J17PAT, { who: 'clash', fig: 1, part: 'face' }), 163.0);
});
// J18 SILENCE (no music): slow motion from the side - Itachi falls backwards, the rain falling again; he lands on his back in the water
const J18I = I2('sick', [[0, at([-4.2, .9, 0], HP, P('ita_hurt', { ground: false, shar: .2, blood: 1.3, bleed: 1.8, blindL: 1, sp: -.5, pitch: -.6, face: expr('itaSoft', { eye: .3 }) }))], [1.45, at([-5.6, -.8, 0], HP, P('ita_lieBack', { shar: .1, blood: 1.3, bleed: 1.8, blindL: 1, face: expr('itaSoft', { eye: .25 }) })), 'in'], [2.0, at([-5.65, -.8, 0], HP, P('ita_lieBack', { shar: .1, blood: 1.3, bleed: 1.8, blindL: 1, face: expr('itaSoft', { eye: .25 }) }))]], { timing: 2 });
shotT('J18', (f, lt) => {
  BGX(f, 'ARENA', { dmg: 3, bg: { react: 'hush' }, rain: { clock: f.shot.t0 + lt * .35 } }); f.grade({ sat: .75 });
  f.cam(HH(CP([{ t: 0, pos: [-4.4, 1.0, 4.8], target: [-4.6, .8, 0], fov: 40 }, { t: 2.0, pos: [-5.6, .55, 4.2], target: [-5.6, .4, 0], fov: 38, ease: 'inOut' }])(lt), lt, .002, 97)); f.fig(J18I);
  f.fx(g => { fxShockRing(g, [-5.6, .03, 0], lt - 1.45, { r: 1.3, dur: .6, w: .4, col: 'rgba(220,235,255,.55)' }); for (let i = 0; i < 22; i++) { const u = (lt - 1.45) * 1.6; if (u < 0 || u > 1) break; const a = hash(i * 3) * TAU, p = [-5.6 + Math.cos(a) * u * 1.2, .05 + Math.sin(u * Math.PI) * (.3 + .5 * hash(i)), Math.sin(a) * u * .8], q = project(p); if (q) { g.fillStyle = 'rgba(220,235,255,.85)'; g.beginPath(); g.arc(q.x, q.y, Math.max(1.5, .02 * q.s), 0, TAU); g.fill(); } } }, { layer: 'over' });
});
// J19 close, rain: Julius kneels; Itachi's two fingers touch his forehead (the canon gesture) ("Thank you... for the time.")
const LIE = [-5.65, -.8, 0], LIEH = [-6.28, .21, 0];   // root (pelvis ~.2 m above the water) / head
const J19I = I2('sick', t => { const u = easeInOut(U(t, .2, 1.0)); return at(LIE, HP, P('ita_lieBack', { shar: .1, blood: 1.3, bleed: 1.8, blindL: 1, aR: [lerp(.4, 1.6, u), lerp(.9, .1, u), 0], eR: lerp(.5, .05, u), hR: 'point', face: FA2(expr('itaSoft', { eye: .45 }), t, { talk: t > .72 && t < 2.5 ? .8 : 0 }) })); }, { timing: 2 });
const J19J = J2('wounded', [[0, at([-6.1, -.2, .73], Math.PI, P('jul_kneel', { wounds: 2, sp: .45, hp: .3, face: expr('julSerious', { eye: .7 }) }))], [1.0, at([-6.1, -.2, .73], Math.PI, P('jul_kneel', { wounds: 2, sp: .85, hp: .35, face: expr('julSerious', { eye: .5 }) })), 'inOut'],
  [2.63, at([-6.1, -.2, .73], Math.PI, P('jul_kneel', { wounds: 2, sp: .85, hp: .35, face: expr('julSerious', { closed: 1 }) }))]], { timing: 2 });
shotT('J19', (f, lt) => {
  BGX(f, 'ARENA', { dmg: 3, bg: { react: 'hush' } }); f.grade({ sat: .8 });
  f.cam(HH(CUT(lt, [[1.45, l => CP([{ t: 0, pos: [-3.5, .95, .55], target: [-6.1, .68, .4], fov: 40 }, { t: 1.45, pos: [-3.7, .93, .52], target: [-6.1, .7, .4], fov: 37 }])(l)],
    [9, l => CP([{ t: 1.45, pos: [-5.85, 1.25, -1.05], target: [-6.18, .3, .15], fov: 44 }, { t: 2.63, pos: [-5.9, 1.18, -.92], target: [-6.18, .32, .15], fov: 41 }])(l)]]), lt, .0015, 98)); f.fig(J19I); f.fig(J19J);
});
// J20 ECU Itachi's face: the hand falls; the Mangekyo fades to black eyes; the smile stays. Crows lift off him into the rain (X-FIN 171.13 black + red moon, quiet)
const J20I = I2('sick', t => at(LIE, HP, P('ita_lieBack', { shar: clamp(1 - t / 1.4, 0, 1) * .6, eyes: t > 1.4 ? 'black' : undefined, blood: 1.3, bleed: 1.8, blindL: t > 1.4 ? 0 : 1, face: expr('itaSoft', { eye: lerp(.45, .3, U(t, 0, 2)) }) })), { timing: 2 });
shotT('J20', (f, lt) => {
  BGX(f, 'ARENA_DARK', { dmg: 3, bg: { react: 'hush' } }); f.grade({ sat: .7 });
  f.cam(HH(CP([{ t: 0, pos: vAdd(LIEH, [.75, .95, .08]), target: vAdd(LIEH, [.12, .0, 0]), fov: 38 }, { t: 2.38, pos: vAdd(LIEH, [.6, .8, .06]), target: vAdd(LIEH, [.08, .0, 0]), fov: 36 }])(lt), lt, .0012, 99)); f.fig(J20I);
  CROWS(f, lt - 1.0, { mode: 'stream', from: vAdd(LIEH, [.4, .15, -.35]), to: vAdd(LIEH, [-2.2, 4, -2.4]), n: 12, dur: 1.4, stagger: .8, spread: .5, size: .2 });
  imp(f, [{ s: 'black', n: 1 }, { s: 'blackaccent', n: 1, p: { accent: '#c83a3a' } }], 171.125);
});
// J21 the stands: Shunsui tips his hat down and raises the cup to the crows; Dazai closes his eyes ("He spent it well.")
shotT('J21', (f, lt) => {
  STAR(f, 'DAZ:knowing', lt, { focus: 'both', part: 'two', rS: 'toast', az: -.25, push: .5, react: 'hush', dmg: 3 });
  f.fx(g => { for (let i = 0; i < 7; i++) { const ph = (lt * .35 + i / 7) % 1; ijDrawCrow(g, W * (1.05 - ph * 1.2), H * (.18 + .06 * Math.sin(i * 2 + lt)), 30 + 10 * hash(i), lt * 10 + i, Math.PI, { flip: true, eye: true }); } }, { layer: 'top' });
});
// J22 THE LAST IMAGE: low, rising - Julius stands in the rain under the red moon, one black crow feather in his hand; the camera rises toward the moon and a crow crosses it.
//     WINNER: JULIUS NOVACHRONO (ARENA, small and quiet) - no end card
const MOON = vNorm([-.4, .66, -1]), MH = vNorm([MOON[0], 0, MOON[2]]), JW = [0, 0, 0];
const J22J = J2('wounded', t => breathe(at(JW, lookAt(JW, vMul(MH, -5)), P('jul_stand', { wounds: 2, aR: [.95, -.1, 0], eR: 1.5, hR: 'relax', face: expr('julSerious', { eye: .5 }) })), t * .7), { timing: 2 });
function redMoon(g, k) { const q = project(vAdd(CAM.cur.pos, vMul(MOON, 900))); if (!q) return null; const R = 150 * 46 / (CAM.cur.fov || 46); g.save(); g.globalAlpha = k; g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 3.2, '#c83a3a', .35); g.globalCompositeOperation = 'source-over';
  g.fillStyle = radial(g, q.x - R * .25, q.y - R * .25, R * 1.25, [[0, '#ff9a86'], [.6, '#d0403a'], [1, '#6a1010']]); g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.fill();
  g.fillStyle = 'rgba(14,10,18,.8)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(q.x + (i - 1) * R * .5, q.y - R * .45 + i * R * .5, R * 1.7, R * .1, 0, 0, TAU); g.fill(); } g.restore(); return q; }
shotT('J22', (f, lt) => {
  BGX(f, 'ARENA', { dmg: 3, bg: { react: 'hush', moon: 0 } }); f.light({ rimAmt: 1.15, rimCol: '#ff5a4a', rim: vNorm([MOON[0], .3, MOON[2]]) });
  const u = easeInOut(U(lt, 0, 3.42)), back = vMul(MH, -1), side = [-MH[2], 0, MH[0]];
  const pos = vAdd(vAdd(JW, vMul(back, lerp(2.4, 3.3, u))), vAdd(vMul(side, lerp(2.2, 2.8, u)), [0, lerp(.4, .9, u), 0])), tgt = vAdd(pos, vNorm(vLerp(vNorm(vSub(vAdd(JW, [0, 1.15, 0]), pos)), MOON, lerp(.32, .44, u))));
  f.cam(HH({ pos, target: tgt, fov: lerp(48, 50, u) }, lt, .0015, 100));
  f.fx(g => redMoon(g, 1), { layer: 'under' }); f.fig(J22J);
  f.fx(g => { const S = figSkel(J22J, lt); feather(g, vAdd(S.J.handR, [0, -.08, .03]), .1, .3 + Math.sin(lt * 2) * .1); }, { layer: 'over' });
  f.fx(g => { const q = project(vAdd(CAM.cur.pos, vMul(MOON, 900))); if (!q) return; const v = U(lt, 2.0, 3.0); if (v > 0 && v < 1) ijDrawCrow(g, q.x + lerp(380, -380, v), q.y + Math.sin(v * 6) * 12 - 10, 110, lt * 9, Math.PI, { flip: true, eye: false }); }, { layer: 'top' });
  imp(f, fit('GONG_WAVE', 3), 175.0);
  TT(f, lt, 'WINNER: JULIUS NOVACHRONO', 'ARENA', { textAt: .7, title: { size: 64, big: false, band: false, dur: 2.2, y: 150, x: W * .36 } });
});

// ------------------------------------------------------------------------------------------------ subtitle hygiene (part 2)
for (const s of SUBS) { if (s.t0 < 84) continue; for (const id of SHOT_ORDER) { const d = SHOTS[id]; if (!d || !d.impact || d.t0 < 84) continue; const a = d.impact.t - .02, b = d.impact.t + d.impact.frames / 24 + .02;
  if (s.t0 < b && s.t1 > a) { if (s.t1 - b >= .7) s.t0 = b + .02; else if (a - s.t0 >= .5) s.t1 = a - .02; } } }
SUBS.sort((a, b) => a.t0 - b.t0);
})();
