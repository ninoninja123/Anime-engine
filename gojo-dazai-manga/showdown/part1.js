/* showdown/part1.js - ITACHI vs JULIUS, shots with t0 < PART_SPLIT (84 s) - agent E.  Shots A01-D18 from pre/shots.json (camera / move / action fields).
   Itachi = west (x < 0, faces +x), Julius = east (x > 0, faces -x).  Masked shot C17 was added by S2 (after C16).
   Rain is automatic (BGX): shots.json rain:false -> frozen drops.                                                                                          */
'use strict';
// ---------------------------------------------------------------------------------------------------- helpers
const aI = (p, o = {}, x = -3, z = 0, yaw = HP) => at([x, 0, z], yaw, P(p, o)), aJ = (p, o = {}, x = 3, z = 0, yaw = -HP) => at([x, 0, z], yaw, P(p, o));
const ITA = (form, keys, o) => CH('ITA', form, keys, Object.assign({ springWin: .6 }, o || {})), JUL = (form, keys, o) => CH('JUL', form, keys, Object.assign({ springWin: .6 }, o || {}));
const FA = (e, t, o = {}) => faceAnim(typeof e === 'string' ? expr(e) : e, t, Object.assign({ seed: 3 }, o));
const WIND = t => [-.35, -.05, .2];                         // rain wind for hair / cloaks
const hit = (f, t0, amp = 24, dur = .4) => f.shake([[t0, amp, dur, 22]]);
const UB = HVG.BOOTH.pos, GW = HVG.GATE_W, GE = HVG.GATE_E;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
// broken stone pillar prop (C05/C06/D08): base [x,0,z], height h, radius r, broken jagged top; o.smash 0..1 = crumbling
function ijPillar(g, base, h, r, o = {}) { const sm = o.smash || 0, top = h * (1 - sm * .7), N = 18, ring = (y, rr, j) => { const pts = []; for (let i = 0; i <= N; i++) { const an = i / N * TAU; pts.push([base[0] + Math.cos(an) * rr, y + (j ? (hash(i * 3.7) - .5) * .5 : 0), base[2] + Math.sin(an) * rr]); } return pts; };
  const b0 = ring(0, r * 1.08, 0), t0 = ring(top, r, 1), cam = CAM.cur; g.save();
  for (let i = 0; i < N; i++) { const quad = projPoly([b0[i], b0[i + 1], t0[i + 1], t0[i]]); if (quad.length < 3) continue; const an = (i + .5) / N * TAU, n = [Math.cos(an), 0, Math.sin(an)], fc = vDot(n, vNorm(vSub(cam.pos, [base[0], top / 2, base[2]]))); if (fc < -.05) continue;
    polyPath(g, quad); g.fillStyle = mixHex('#2a262c', '#8a8070', clamp(.25 + .6 * vDot(n, vNorm([-.4, .3, .6])), 0, 1)); g.fill(); if (i % 3 === 0) { g.strokeStyle = 'rgba(10,8,10,.5)'; g.lineWidth = 1.5; g.stroke(); } }
  const tp = projPoly(t0); if (tp.length > 2) { polyPath(g, tp); g.fillStyle = '#5a544e'; g.fill(); g.strokeStyle = '#0a080a'; g.lineWidth = 2.5; g.stroke(); }
  const sil = projPoly([...b0.slice(0, N / 2 + 1), ...t0.slice(0, N / 2 + 1).reverse()]); void sil; g.restore(); }
// chalk outline of a fallen figure on the floor (A03 rule shot); k = reveal 0..1
function ijChalk(g, c, k, s = 1) { const P0 = [[0, 0], [.35, .05], [.55, .5], [.9, .62], [1.05, .45], [.7, .25], [.6, -.05], [1.1, -.25], [1.6, -.15], [1.65, -.35], [1.15, -.5], [.6, -.35], [.2, -.55], [-.1, -1.05], [-.35, -1.0], [-.15, -.5],
  [-.55, -.4], [-1.0, -.75], [-1.2, -.6], [-.8, -.1], [-.95, .15], [-1.35, .1], [-1.6, .35], [-1.2, .55], [-.6, .45], [-.3, .25], [-.45, .7], [-.15, 1.0], [.2, .85], [.15, .4], [0, 0]];
  const n = Math.floor(P0.length * clamp(k, 0, 1)); if (n < 2) return; const pts = P0.slice(0, n).map(([x, z]) => { const q = project([c[0] + x * s, .02, c[2] + z * s]); return q ? [q.x, q.y] : null; }).filter(Boolean);
  g.save(); g.strokeStyle = 'rgba(250,250,245,.95)'; g.lineWidth = 5; g.lineJoin = 'round'; g.lineCap = 'round'; g.shadowColor = '#ffffff'; g.shadowBlur = 8; polyPath(g, pts, false); g.stroke(); g.restore(); }
function ijTorch(g, p, k, t) { const q = project(p); if (!q) return; const s = .55 * q.s * k; g.save(); g.fillStyle = '#2a1a10'; g.fillRect(q.x - .05 * q.s, q.y, .1 * q.s, .9 * q.s); if (k > .02) { g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y - s * .4, s * 2.2, '#ff8a2a', .45 * k);
  ijFlameTongue(g, q.x, q.y, s * .35, s * 1.2 * (1 + .15 * Math.sin(t * 20)), t, 3, rgba('#ffb040', .9), null); } g.restore(); }
function whipThru(cam, lt, t0, t1, yaw) { const tm = (t0 + t1) / 2; return lt < tm ? camWhip(cam, lt, t0, tm, yaw, easeIn) : camWhip(cam, lt, tm, t1, yaw, easeOut, true); }
function screenCrow(g, t, x0, y0, x1, y1, s, dur = .35) { const u = clamp(t / dur, 0, 1); if (u <= 0 || u >= 1) return; ijDrawCrow(g, lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * 9) * 20, s, t * 18, Math.atan2(y1 - y0, x1 - x0), { flip: x1 < x0, eye: true }); }
// ---------------------------------------------------------------------------------------------------- A: Valhalla, the rule, Itachi
shotT('A01', (f, lt) => {   // superwide dive through rain clouds, sweep over the arena; lightning; a crow whips past the lens at 1.2
  BGX(f, 'SKY', { bg: { lightning: true } }); f.post({ bloom: .55 });
  f.cam(camPath([{ t: 0, pos: [0, 30, 90], target: [0, -40, -40], fov: 56, roll: .05 }, { t: 1.0, pos: [6, -20, 20], target: [0, -85, -60], fov: 50, ease: 'in' }, { t: 2.0, pos: [14, -62, -24], target: [0, -90, -70], fov: 46, ease: 'out', roll: -.04 }])(lt));
  f.fx(g => fxSpeedLines(g, lt, { n: 40, inner: 420, alpha: clamp((lt - .6) * 1.5, 0, .5) }), { layer: 'top' });
  f.fx(g => screenCrow(g, lt - 1.15, W + 300, 300, -400, 700, 520, .3), { layer: 'top' });
});
const A02U = CH('URA', 'base', K([[0, at(UB, 0, P('urahara_announceFan', { ground: false, fan: 0, fanText: '掟', face: expr('smirk') }))], [.28, at(UB, 0, P('urahara_announceFan', { ground: false, fan: .05, fanText: '掟', face: expr('smirk') })), 'hold'],
  [.34, at(UB, 0, P('urahara_announceFan', { ground: false, fan: 1, fanText: '掟', face: expr('grin') })), 'snap'], [1.1, at(UB, 0, P('urahara_announceFan', { ground: false, fan: 1, fanText: '掟', sp: .28, face: expr('grin', { mouthOpen: .5 }) })), 'inOut'], [1.8, at(UB, 0, P('urahara_announceFan', { ground: false, fan: 1, fanText: '掟', sp: .32, face: expr('grin') }))]]), { timing: 1 });
shotT('A02', (f, lt) => {   // crane up to the announcer box in the rain -> close-up: fan snaps open, leans over the rail grinning
  BGX(f, 'BOOTH'); f.light({ fx: [{ p: vAdd(UB, [-3.4, 4.6, 1.2]), col: '#ffb060', r: 5, a: .45 }] });
  f.cam(camImpactKick(camHandheld(camPath([{ t: 0, pos: [UB[0] + 2.4, UB[1] - 8, UB[2] + 13], target: [UB[0], UB[1] + 1, UB[2]], fov: 44 }, { t: 1.35, pos: [UB[0] + .8, UB[1] + 1.7, UB[2] + 2.5], target: [UB[0], UB[1] + 1.4, UB[2]], fov: 34, ease: 'out' }, { t: 1.8, pos: [UB[0] + .7, UB[1] + 1.65, UB[2] + 2.2], target: [UB[0], UB[1] + 1.4, UB[2]], fov: 33 }])(lt), lt, .006, 5), lt, .33, { fov: -6 }));
  f.fig(A02U); f.fx(g => fxMicWaves(g, vAdd(figPos(A02U, lt, 'head'), [0, -.1, .4]), lt - .9, { col: '#ffe08a' }), { layer: 'over' });
});
shotT('A03', (f, lt) => {   // THE RULE as a picture: low at the ring edge, lateral drift + tilt down; chalk outline of a fallen fighter stamps into the sand, a torch dies
  BGX(f, 'ARENA', { bg: { react: 'hush', torch: .8 } }); const c = [0, 0, 0], k = clamp((lt - .55) / .2, 0, 1);
  f.cam(camHandheld(camPath([{ t: 0, pos: [-6, .6, 8.5], target: [-1, .5, 0], fov: 38 }, { t: 1.92, pos: [-1.5, 2.2, 6.2], target: [0, -.1, 0], fov: 36, ease: 'inOut' }])(lt), lt, .004, 4));
  f.fx(g => ijChalk(g, c, k, 1.25), { layer: 'under' });
  f.fx(g => ijTorch(g, [4.5, 0, 6], clamp(1.2 - lt * .7, 0, 1), lt), { layer: 'over' });
  if (k > 0 && k < 1) f.flash('#ffffff', .25 * (1 - k));
});
const A04I = ITA('base', t => { const dz = clamp(1 - (t - .25) / .9, 0, 1); return breathe(at([GW[0] + 2.2, 0, 0], HP, P('ita_ready', { dissolve: dz, shar: 0, face: expr('itaCalm', { eye: .5 }) })), t); }, { wind: WIND });
shotT('A04', (f, lt) => {   // west gate darkness: crows spiral and condense into a silhouette (Akatsuki cloak, ponytail, rain). Low crane rising + 40 deg arc, red lantern backlight
  BGX(f, 'GATE_I', { side: 'I', bg: { react: 'hush' } }); f.light({ rimAmt: 1.1, rimCol: '#ff3a2a', fx: [{ p: [GW[0] + .8, 6, -4], col: '#ff3a2a', r: 8, a: .6 }, { p: [GW[0] + .8, 6, 4], col: '#ff3a2a', r: 8, a: .6 }] });
  f.cam(heroRise(A04I, lt, { dur: 1.8, az: .9, az1: .2, from: 3.4, to: 2.1, hTo: 1.0, fov: 44 }));
  f.fig(A04I); CROWS(f, lt, { c: [GW[0] + 2.2, 1.5 + lt * .2, 0], n: 34, r: lerp(2.0, .7, clamp(lt / 1.3, 0, 1)), mode: 'swirl', size: .3, k: clamp(1.6 - lt * .9, 0, 1) });
});
const A05I = ITA('base', t => at([-3, 0, 0], HP, P('ita_stand', { shar: clamp((t - .05) / .12, 0, 1), spin: t * 3 + clamp((t - .05) / .2, 0, 1) * 2.1, face: expr('itaStare', { eye: clamp(t / .08, .1, .85) }) })), { timing: 1 });
shotT('A05', (f, lt) => {   // ECU eye: the Sharingan opens, three tomoe spin; a raindrop drips off the lashes
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.light({ rimAmt: 1, rimCol: '#ff4a3a' });
  const c = closeCam(A05I, lt, { part: 'eye', side: 'R', az: .1, el: .02 }); f.cam(camHandheld(Object.assign({}, c, { pos: vLerp(c.pos, c.target, -.35 + clamp(lt / .25, 0, 1) * .35) }), lt, .002, 2)); f.fig(A05I);
  f.fx(g => { const u = clamp((lt - .45) / .4, 0, 1); if (u <= 0 || u >= 1) return; const x = 1140, y = 470 + u * u * 700; g.fillStyle = 'rgba(220,235,255,.85)'; g.beginPath(); g.ellipse(x, y, 10, 16, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, y - 5, 3, 0, TAU); g.fill(); }, { layer: 'top' });
});
const A06I = ITA('sharingan', t => breathe(at([0, 0, 0], .35, P('ita_cloakHand', { shar: 1, spin: t * 1.5, face: FA('itaCalm', t, { seed: 4 }) })), t), { wind: WIND });
shotT('A06', (f, lt) => {   // CHARACTER CARD Itachi (fighterCard from the text, POWER_CARD_I): hand2d portrait on the right, feathers falling
  BGX(f, 'CARD', { bg: { who: 'itachi' } }); f.light({ ambientK: .22, rimAmt: 1, rimCol: '#ff3a2a' });
  f.cam(camTruck(camSlowPush(A06I, lt, 0, 2.1, { part: 'bust', az: .3, el: .04, from: 1.45, to: 1.15 }), -.42)); f.fig(A06I);
  f.fx(g => fxFeathers(g, vAdd(figPos(A06I, lt, 'head'), [0, .6, 0]), (lt % 2.4), { n: 16, r: 1.2, dur: 2.4 }), { layer: 'over' });
});
// ---------------------------------------------------------------------------------------------------- B: Julius, cards, gong
const B01J = JUL('base', t => breathe(at([GE[0] - 1.2 - t * 1.05, 0, .4], -HP - .12, IJ.julWalkBack(t * .75, { face: FA('julSmile', t, { seed: 6 }) })), t), { springWin: 0 });
shotT('B01', (f, lt) => {   // STORMY EVENING: a giant golden clock circle opens over the east gate, the rain STOPS mid-air; Julius walks through the frozen drops, smiling.
  BGX(f, 'GATE_J', { side: 'J', bg: { clockGlow: 1, react: 'gasp' } }); f.light({ rimAmt: 1.1, rimCol: '#ffd36a', fx: [{ p: [GE[0] - 1, 9, 0], col: '#ffd36a', r: 12, a: .7 }] });
  const ins = lt > 1.6 && lt < 1.86, hs = lt < 1.69 ? lt * .3 : 1.69 * .3 + 1.6;
  if (ins) { f.cam({ pos: [GE[0] - 6.5, 15.2, 1.2], target: [GE[0] - .6, 15.4, 0], fov: 30 }); f.fx(g => fxClockCircle(g, [GE[0] - .8, 15.5, 0], [-1, 0, 0], lt + 1, { r: 3.6, handsT: hs * 3, w: 1.6 }), { layer: 'glow' }); return; }
  f.cam(camHandheld(camPath([{ t: 0, orbit: { c: [GE[0] - 2, .6, 0], r: 4.6, az: -.8, el: -.02 }, target: [GE[0] - 1.8, 2.6, 0], fov: 46 }, { t: 2.33, orbit: { c: [GE[0] - 3.4, 1.7, 0], r: 3.0, az: -2.2, el: .08 }, target: [GE[0] - 3.6, 1.5, 0], fov: 40, ease: 'inOut' }])(lt), lt, .004, 6));
  f.fig(B01J); f.fx(g => fxClockCircle(g, [GE[0] - .8, 15.5, 0], [-1, 0, 0], lt + .2, { r: 3.6, handsT: hs * 3, w: 1.4 }), { layer: 'glow' });
});
const B02J = JUL('base', t => breathe(at([0, 0, 0], -.35, P('jul_hips', { face: FA('julGrin', t, { seed: 8 }) })), t));
const B02I = ITA('sharingan', t => breathe(at([0, 0, 0], .35, P('ita_ready', { shar: 1, spin: t, face: expr('itaStare') })), t), { wind: WIND });
shotT('B02', (f, lt) => {   // CHARACTER CARD Julius (+ VS split for the last 0.8 s: Itachi red-black left | Julius gold-blue right)
  const vs = lt > 2.37 - .8; if (vs) f.split({ ang: .14, x: .5, gap: 14, col: '#ffffff' });
  if (!vs || f.panel === 1) { BGX(f, 'CARD', { bg: { who: 'julius' } }); f.light({ ambientK: .22, rimAmt: 1, rimCol: '#ffd36a' }); f.cam(camTruck(camSlowPush(B02J, lt, 0, 2.4, { part: 'bust', az: -.35, el: .05, from: 1.45, to: 1.15 }), vs ? -.05 : .45)); f.fig(B02J); }
  else { BGX(f, 'CARD', { bg: { who: 'itachi' } }); f.light({ ambientK: .22, rimAmt: 1, rimCol: '#ff3a2a' }); f.cam(camTruck(closeCam(B02I, lt, { part: 'bust', az: .4, el: .03, dist: 1.2 }), .05)); f.fig(B02I); }
});
const B03U = CH('URA', 'base', K([[0, at(UB, .4, P('urahara_cane', { ground: false, aL: [1.95, .3, 0], eL: .8, face: expr('calm', { eye: .4 }) }))], [.06, at(UB, .4, P('urahara_cane', { ground: false, aL: [1.2, .6, 0], eL: .3, face: expr('grin') })), 'snap'], [1.42, at(UB, .4, P('urahara_cane', { ground: false, aL: [1.2, .6, 0], eL: .3, face: expr('grin') }))]]), { timing: 1 });
const B03I = ITA('base', t => breathe(aI('ita_ready', { shar: 1, face: expr('itaCalm') }, -3.2), t), { wind: WIND }), B03J = JUL('base', t => breathe(aJ('jul_handsBack', { face: expr('julSmile') }, 3.2), t));
shotT('B03', (f, lt) => {   // GONG: superwide from above the box - shockwave rolls over the arena, the frozen rain crashes down at once; BEGIN!
  BGX(f, 'ARENA', { bg: { react: 'roar', gongT: f.shot.t0 + .02, torch: 1.2 }, rain: { mode: 'collapse', collapseT: lt, clock: 11 } }); f.post({ bloom: .6 });
  f.cam(camShake(camPath([{ t: 0, pos: [UB[0] + 4, UB[1] + 6, UB[2] + 3], target: [0, 0, 2], fov: 50 }, { t: 1.42, pos: [UB[0] + 3, UB[1] + 9, UB[2] + 9], target: [0, 0, 4], fov: 52 }])(lt), [[.05, 22, .5, 18]], lt));
  f.fig(B03U); f.fig(B03I); f.fig(B03J);
  f.fx(g => { fxShockRing(g, vAdd(HVG.GONG.pos, [0, 1.3, .2]), lt, { r: 6, dur: .6, col: '#ffd36a', up: true }); fxShockRing(g, [0, .1, 0], lt - .1, { r: 24, dur: 1.0, col: '#ffd36a' }); fxShockRing(g, [0, .1, 0], lt - .25, { r: 16, dur: .9, col: '#fff0b0' }); }, { layer: 'glow' });
});
// ---------------------------------------------------------------------------------------------------- C: first exchange, Chrono Stasis, the crow clone
const C01I = ITA('base', t => { const dz = clamp(t / .12, 0, 1), back = clamp((t - .18) / .1, 0, 1);
  if (t < .18) return at([-1.6 + t * 4, 0, 0], HP, P('ita_dash', { shar: 1, dissolve: dz, face: expr('itaStare') }));
  return at([4.6, 0, -.3], -HP, P(t < .27 ? 'ita_crows' : 'ita_kickSpin', { shar: 1, dissolve: 1 - back, face: expr('itaCold') })); }, { timing: 1, wind: WIND });
const C01J = JUL('base', K([[0, aJ('jul_stand', { face: expr('julSmile') }, 3.2)], [.22, aJ('jul_stand', { face: expr('julWonder') }, 3.2), 'hold'], [.28, at([3.2, 0, 0], .6, P('jul_palmOut', { face: expr('julGrin') })), 'snap'], [.6, at([3.0, 0, 0], .6, P('jul_palmOut', { sp: .15, face: expr('julThrilled') })), 'out'], [1.5, at([2.9, 0, 0], .5, P('jul_guard', { face: expr('julGrin') }))]]), { timing: 1 });
shotT('C01', (f, lt) => {   // FIRST HIT: Itachi bursts into crows and reappears behind Julius in a spin kick; Julius blocks - the golden clock shield shudders, the rain explodes in a ring
  BGX(f, 'ARENA', { bg: { react: 'roar' } });
  const base = camPath([{ t: 0, orbit: { c: [1.2, 1.3, 0], r: 6.2, az: -.9, el: .05 }, target: [1.2, 1.3, 0], fov: 38 }, { t: .3, orbit: { c: [3.4, 1.3, 0], r: 4.4, az: .3, el: .08 }, target: [3.6, 1.3, 0], fov: 36, ease: 'inOut' }, { t: 1.5, orbit: { c: [3.4, 1.3, 0], r: 3.6, az: 1.2, el: .1 }, target: [3.6, 1.4, 0], fov: 34, ease: 'out' }])(lt);
  const wp = whipThru(base, lt, .12, .27, .9); f.cam(wp.cam); f.motionBlur(wp.blur); hit(f, .29, 30, .55);
  f.fig(C01I, { t: hitStop(lt, [[.29, .08]]) }); f.fig(C01J, { t: hitStop(lt, [[.29, .08]]) });
  CROWS(f, lt, { mode: 'stream', from: [-1, 1.4, 0], to: [4.6, 1.4, -.3], n: 34, dur: .2, stagger: .06, spread: .9, size: .32 });
  f.fx(g => { fxClockShield(g, [4.0, 1.45, .1], [1, 0, -.2], lt - .25, { r: .75, hit: lt - .29 }); fxShockRing(g, [3.9, 1.4, 0], lt - .29, { r: 3.2, dur: .4, up: true, col: '#cfe4ff' }); }, { layer: 'over' });
});
const C02J = JUL('base', K([[0, aJ('jul_guard', { face: expr('julGrin') }, 3)], [.15, aJ('jul_tap', { face: expr('julSmile') }, 3), 'back'], [1.37, aJ('jul_tap', { face: expr('julSmile') }, 3)]]), { timing: 2 });
const C02I = ITA('base', t => at([-.4, 1.1, .4], HP, P('ita_kick', { ground: false, shar: 1, face: expr('itaCold') })), { timing: 1 });
shotT('C02', (f, lt) => {   // CHRONO STASIS: Julius taps the air; Itachi freezes mid-leap, grey, inside a clock ring; the drops stop around him; camera pulls back
  BGX(f, 'ARENA', { side: 'J' });
  f.cam(camHandheld(camPath([{ t: 0, pos: [4.4, 1.7, 3.0], target: [2.4, 1.6, 0], fov: 36 }, { t: 1.37, pos: [3.6, 2.2, 7.6], target: [1.0, 1.4, 0], fov: 38, ease: 'out' }])(lt), lt, .004, 7));
  f.fig(C02J); f.fig(C02I, { t: .4 }); ijTimeStopScreen(f, lt - .18, { at: [-.4, 1.9, .4], dur: .35, maxR: 300 });
  f.fx(g => fxChronoStasis(g, [-.4, 1.9, .4], lt - .2, { r: 1.5, lock: true }), { layer: 'over' }); CLOCK(f, [2.2, 1.7, .3], [-1, 0, .2], lt - .12, { r: .5, w: .8 });
});
shotT('C03', (f, lt) => { STAR(f, 'KYO:kyo_kneeSlap', lt, { focus: 'both', part: 'two', rD: 'dazai_sitSmile', az: .3, push: .5, react: 'hush' }); });
const C04J = JUL('base', t => breathe(at([3.4, 0, 1.4], -HP + .3, P('jul_wonder', { face: FA(t > 1.4 ? 'julThrilled' : 'julSmile', t, { seed: 5 }) })), t));
const C04I = ITA('base', t => at([-.4, 1.1, .4], HP, P('ita_kick', { ground: false, shar: 1, dissolve: clamp((t - 1.375) / .35, 0, 1), face: expr('itaCold') })), { timing: 1 });
shotT('C04', (f, lt) => {   // the frozen Itachi EXPLODES into crows - a clone. Julius (foreground) lights up with delight; jerk, then slow motion
  BGX(f, 'ARENA', { side: 'J' });
  const c = camPath([{ t: 0, pos: [6.6, 1.9, 3.6], target: [-.2, 1.7, .4], fov: 34 }, { t: 1.36, pos: [6.2, 1.85, 3.3], target: [-.2, 1.8, .4], fov: 32 }, { t: 1.48, pos: [6.0, 1.9, 3.1], target: [.2, 1.9, .4], fov: 40, ease: 'snap' }, { t: 2.0, pos: [5.8, 1.9, 2.9], target: [.6, 1.8, .4], fov: 41 }])(lt);
  f.cam(camHandheld(c, lt, .004, 8)); hit(f, 1.375, 20, .4); f.fig(C04J); f.fig(C04I, { t: lt < 1.375 ? .4 : lt });
  if (lt < 1.375) { f.fx(g => fxChronoStasis(g, [-.4, 1.9, .4], 2, { r: 1.5, lock: true }), { layer: 'over' }); f.grade({ sat: .8 }); }
});
const C05I = ITA('sharingan', t => breathe(at([-6, 7.0, -4], HP + .4, P('ita_stand', { ground: false, shar: 1, spin: t, face: FA('itaCalm', t, { talk: t > .6 && t < 1.5 ? 1 : 0, seed: 9 }) })), t), { wind: WIND });
shotT('C05', (f, lt) => {   // the real Itachi on top of a broken pillar in the rain, Sharingan watching (he learned the rule from the clone); slow crane up the pillar
  BGX(f, 'ARENA', { side: 'I' }); f.light({ rimAmt: 1.1, rimCol: '#ff4a3a' });
  f.cam(camHandheld(camPath([{ t: 0, pos: [-2.4, .6, 0], target: [-6, 3.5, -4], fov: 44 }, { t: 1.79, pos: [-3.4, 6.4, -1.4], target: [-6, 8.2, -4], fov: 34, ease: 'inOut' }])(lt), lt, .004, 9));
  f.prop([-6, 3, -4], g => ijPillar(g, [-6, 0, -4], 7.0, .9)); f.fig(C05I);
});
const C06J = JUL('magic', t => { const u = clamp(t / .45, 0, 1); if (u < 1) return at(lerp3([3, 0, 0], [-4.8, 0, -3.1], easeIn(u)), lookAt([3, 0, 0], [-6, 0, -4]), P('jul_dash', { face: expr('julFierce') }));
  return at([-4.8, 0, -3.1], lookAt([-4.8, 0, -3.1], [-6, 0, -4]), P(t < .58 ? 'jul_punchTime' : 'jul_land', { face: expr('julThrilled') })); }, { timing: 1 });
const C06I = ITA('sharingan', t => { const u = clamp((t - .48) / .7, 0, 1); return at([-6 + u * 1.6, lerp(7, 3.8, u) + Math.sin(u * Math.PI) * 2.2, -4 + u * 3], HP + .4, P(u > 0 ? 'ita_float' : 'ita_stand', { ground: false, shar: 1, face: expr('itaStare') })); }, { timing: 1, wind: WIND });
shotT('C06', (f, lt) => {   // ACCELERATION: golden afterimages - Julius is at the pillar's foot in a blink, his fist shatters it (25.79); Itachi leaps clear
  BGX(f, 'ARENA', { side: 'J' }); hit(f, .5, 28, .5);
  f.cam(camHandheld(camPath([{ t: 0, pos: [3.6, 1.6, 6], target: [1, 1.4, 0], fov: 40 }, { t: .45, pos: [-1.6, 1.6, 3.4], target: [-5.2, 2.0, -3.4], fov: 40, ease: 'out' }, { t: 1.42, pos: [-1.2, 2.4, 4.4], target: [-4.4, 4.0, -2], fov: 44, ease: 'inOut' }])(lt), lt, .006, 10));
  f.prop([-6, 3, -4], g => ijPillar(g, [-6, 0, -4], 7.0, .9, { smash: clamp((lt - .5) * 3, 0, 1) }));
  f.fig(C06J, { afterimages: lt < .5 ? [.04, .08, .12, .16] : [], afterCol: '#f6d36a', afterA: .5 }); f.fig(C06I);
  f.fx(g => { fxDebris && fxDebris(g, [-6, 2.5, -4], lt - .5, { kind: 'rock', n: 30 }); fxDust(g, [-6, 0, -4], lt - .5, { r: 3 }); }, { layer: 'over' });
});
const C07I = ITA('sharingan', K([[0, at([-3.6, 3.4, -.8], HP, P('ita_float', { ground: false, shar: 1, face: expr('itaStare') }))], [.3, at([-3.6, 3.6, -.8], HP, P('ita_sign', { ground: false, shar: 1, face: expr('itaStare') })), 'snap'], [.62, at([-3.6, 3.6, -.8], HP, P('ita_fireball', { ground: false, shar: 1 })), 'snap'], [1.58, at([-3.5, 3.4, -.8], HP, P('ita_fireball', { ground: false, shar: 1 }))]]), { timing: 1, wind: WIND });
shotT('C07', (f, lt) => {   // KATON: GŌKAKYŪ - mid-air tiger seal, a giant fireball rolls at Julius; camera circles, then the fire fills the frame
  BGX(f, 'ARENA', { side: 'I' }); f.light({ fx: [{ p: [-1, 3.5, -.8], col: '#ff8a2a', r: 9, a: clamp((lt - .6) * 2, 0, 1) }] });
  f.cam(camHandheld(camPath([{ t: 0, orbit: { c: [-3.6, 4.2, -.8], r: 3.2, az: 1.1, el: .05 }, target: [-3.6, 4.4, -.8], fov: 40 }, { t: .62, orbit: { c: [-3.6, 4.2, -.8], r: 3.4, az: .3, el: .02 }, target: [-3.2, 4.3, -.8], fov: 40, ease: 'inOut' }, { t: 1.58, orbit: { c: [-2.4, 4.0, -.8], r: 4.2, az: -.6, el: .04 }, target: [-.5, 3.8, -.5], fov: 46, ease: 'out' }])(lt), lt, .006, 11));
  f.fig(C07I); f.fx(g => fxFireball(g, vAdd(figPos(C07I, lt, 'head'), [.25, -.12, 0]), [1, -.25, .1], lt - .62, { r: 2.2, charge: .3, speed: 6 }), { layer: 'over' });
});
const C08J = JUL('base', K([[0, aJ('jul_stand', { face: expr('julSmile') }, 3)], [.3, aJ('jul_palmOut', { face: FA('julSmile', 1, { talk: 1 }) }, 3), 'back'], [1.63, aJ('jul_palmOut', { face: expr('julSmile') }, 3)]]), { timing: 2 });
shotT('C08', (f, lt) => {   // over Julius's shoulder: he stops the fireball in mid-air and winds its time forward - it burns out to embers and ash in a second
  BGX(f, 'ARENA', { side: 'J' }); const age = clamp((lt - .45) / 1.0, 0, 1); f.light({ fx: [{ p: [0, 2.2, 0], col: '#ff8a2a', r: 8, a: .8 * (1 - age) }] });
  f.cam(camHandheld(camPath([{ t: 0, pos: [5.6, 2.1, 2.0], target: [0, 2.0, 0], fov: 38 }, { t: 1.63, pos: [4.9, 2.0, 1.5], target: [0, 2.1, 0], fov: 34, ease: 'inOut' }])(lt), lt, .003, 12));
  f.fig(C08J); f.fx(g => { fxFireballAge(g, [0, 2.2, 0], lt, { age, r: 2.0 }); fxClockCircle(g, [-.6, 2.2, 0], [1, 0, 0], lt - .2, { r: 1.7, handsT: lt * 12, w: 1.2 }); }, { layer: 'over' });
});
const C09J = JUL('base', K([[0, aJ('jul_guard', { face: expr('julSerious') }, 3)], [.2, aJ('jul_tap', { face: expr('julSmile') }, 3), 'snap'], [.36, aJ('jul_tap', { face: expr('julSmile') }, 3)], [.42, aJ('jul_tap', { hy: .35, cut: .9, face: expr('shock') }, 3), 'snap'], [1.58, aJ('jul_tap', { hy: .3, cut: 1, face: expr('julWonder') }, 3)]]), { timing: 1 });
shotT('C09', (f, lt) => {   // a curving shuriken volley from eight directions; Julius freezes them - but every one hid a second shuriken in its shadow; one cuts his cheek (30.28)
  BGX(f, 'ARENA', { side: 'I' }); const frz = Math.min(lt, .3), lateU = clamp((lt - .3) / .1, 0, 1);
  const wide = camPath([{ t: 0, pos: [-1, 2.6, 8.5], target: [1.6, 1.6, 0], fov: 46 }, { t: .36, pos: [.8, 2.0, 5.4], target: [2.6, 1.7, 0], fov: 40, ease: 'inOut' }])(lt), close = closeCam(C09J, lt, { part: 'face', az: -.7, el: .02, dist: 1.25 });
  f.cam(lt < .38 ? camHandheld(wide, lt, .004, 13) : camImpactKick(close, lt, .38, { fov: -5 })); hit(f, .375, 18, .3);
  f.fig(C09J); f.fx(g => { fxShurikens(g, [-3, 1.6, 0], [2.6, 1.7, 0], frz, { n: 8, curve: 1.4, dur: .4, shadow: false }); if (lt > .3) { fxShurikens(g, [2.0, 1.75, .2], [3.6, 1.8, -.8], (lateU) * .2, { n: 1, dur: .2, shadow: false }); fxClockCircle(g, [1.5, 1.7, 0], [-1, 0, 0], lt, { r: 1.3, handsT: .3, w: .7 }); } }, { layer: 'over' });
});
const C10J = JUL('base', t => breathe(aJ('jul_touchCheek', { cut: 1, face: FA(t > .5 ? 'julThrilled' : 'julWonder', t, { talk: t > .45 ? 1.3 : 0, seed: 14 }) }, 3), t));
shotT('C10', (f, lt) => {   // ECU: Julius touches the blood on his cheek and beams like a child - a new magic!
  BGX(f, 'ARENA', { side: 'J' }); f.cam(pushFace(C10J, lt, { dur: 1.7, from: 1.15, to: .9, az: -.45 })); f.fig(C10J);
});
const C11I = ITA('sharingan', t => at([-3, 0, 0], HP, P('ita_stand', { shar: 1, spin: t * 6, face: expr('itaStare', { eye: .9 }) })), { timing: 1 });
const C11J = JUL('base', t => at([3, 0, 0], -HP, P('jul_stand', { cut: 1, face: expr('julWonder') })), { timing: 1 });
shotT('C11', (f, lt) => {   // GENJUTSU: SHARINGAN - eyes locked (split screen), the Sharingan spins (snap zoom 33.39), the world bleeds red / negative
  f.split({ ang: .08, x: .5, gap: 10, col: '#d81a28' }); BGX(f, 'ARENA_RED', { side: f.panel ? 'J' : 'I' });
  const F = f.panel ? C11J : C11I, z = clamp((lt - .1) / .12, 0, 1); f.cam(closeCam(F, lt, { part: 'eyes', az: f.panel ? -.2 : .2, el: .02, dist: lerp(1.4, .85, easeOut(z)) })); f.fig(F);
  ijGenjutsuScreen(f, lt - .2, { at: [0, 1.6, 0], dur: .8 });
});
const C12J = JUL('base', K([[0, aJ('jul_stand', { cut: 1, face: expr('julSerious') }, 0, 0, -HP)], [.8, aJ('jul_eyesClosed', { cut: 1 }, 0, 0, -HP), 'smooth'], [1.83, aJ('jul_eyesClosed', { cut: 1 }, 0, 0, -HP)]]), { timing: 2 });
const C12I = ITA('sharingan', t => breathe(aI('ita_stand', { shar: 1, face: expr('itaStare') }, -7), t));
shotT('C12', (f, lt) => {   // inside the genjutsu: red sky, black moon, crows binding Julius. He calmly closes his eyes, disrupts his own mana - the genjutsu SHATTERS like glass
  BGX(f, 'GENJ'); f.light({ rimCol: '#ff4a3a', rimAmt: 1 });
  f.cam(camHandheld(camPath([{ t: 0, orbit: { c: [0, 1.5, 0], r: 4.6, az: -1.0, el: .05 }, target: [0, 1.5, 0], fov: 40 }, { t: 1.83, orbit: { c: [0, 1.6, 0], r: 3.4, az: -.2, el: .1 }, target: [0, 1.6, 0], fov: 38, ease: 'inOut' }])(lt), lt, .004, 15));
  f.fig(C12J); f.fig(C12I, { mode: 'flat', col: '#050002' });
  CROWS(f, lt, { c: [0, 1.3, 0], n: 30, r: lerp(1.6, .9, clamp(lt / 1.2, 0, 1)), mode: 'swirl', size: .34 });
});
const C13J = JUL('base', t => breathe(aJ('jul_eyesClosed', { cut: 1, face: FA('julSense', t, { talk: t > .3 && t < 1.6 ? 1.1 : 0, seed: 16 }) }, 3), t));
shotT('C13', (f, lt) => {   // back in the arena: Julius stands with his eyes shut, smiling - eyes are the trap, he will fight by sensing mana
  BGX(f, 'ARENA', { side: 'J' }); f.cam(pushFace(C13J, lt, { dur: 1.8, from: 1.6, to: 1.15, az: -.3, part: 'bust' })); f.fig(C13J);
  f.fx(g => fxManaSense(g, [3, 0, 0], lt, { r: 6, n: 3, k: .6 }), { layer: 'glow' });
});
shotT('C14', (f, lt) => { STAR(f, 'KYO:kyo_laugh', lt, { focus: 'both', part: 'two', rD: 'dazai_watch', az: lerp(-.35, .35, clamp(lt / 2, 0, 1)), push: .2 }); });
const C15J = JUL('base', t => breathe(aJ('jul_eyesClosed', { cut: 1 }, 3), t)), C15I = ITA('sharingan', t => breathe(aI('ita_sign', { shar: 1 }, -6, -3), t), { wind: WIND });
shotT('C15', (f, lt) => {   // high wide: crows stream through the rain; Julius, eyes shut, pulses golden mana-sense rings like sonar; crane down
  BGX(f, 'ARENA', { side: 'J' });
  f.cam(camHandheld(camPath([{ t: 0, pos: [8, 16, 14], target: [0, 0, 0], fov: 46 }, { t: 1.58, pos: [7, 8, 11], target: [1, 1, 0], fov: 44, ease: 'inOut' }])(lt), lt, .003, 17));
  f.fig(C15J); f.fig(C15I); CROWS(f, lt, { mode: 'stream', from: [-6, 2.5, -3], to: [6, 2.0, 2], n: 40, dur: 1.4, stagger: .7, spread: 2.4, size: .4, arc: 1.5 });
  f.fx(g => fxManaSense(g, [3, 0, 0], lt, { r: 12, n: 4 }), { layer: 'glow' });
});
const C16J = JUL('base', t => { const ph = Math.floor(t / .54); return aJ('jul_tap', { cut: 1, aR: [1.4, ph === 1 ? -.5 : ph === 2 ? .6 : 0, 0], eR: .2, face: expr('julSense') }, 3); }, { timing: 1 });
shotT('C16', (f, lt) => {   // SAKUGA: kunai from three directions; eyes shut, Julius stops each one on a fingertip clock symbol (3 cuts)
  BGX(f, 'ARENA', { side: 'J' }); const ph = Math.min(2, Math.floor(lt / .54)), u = (lt - ph * .54) / .54, dirs = [[-1, .2, .3], [-.5, .3, -1], [.2, .1, 1.2]], d = vNorm(dirs[ph]);
  const tgt = vAdd(figPos(C16J, lt, 'handR'), [0, 0, 0]), cams = [{ pos: [5.2, 1.9, 2.8], fov: 38 }, { pos: [1.2, 1.2, -3.4], fov: 42 }, { pos: [4.4, 2.6, -2.0], fov: 36 }];
  f.cam(camHandheld(Object.assign({}, cams[ph], { target: vLerp(tgt, [3, 1.5, 0], .4), pos: vLerp(cams[ph].pos, vLerp(tgt, [3, 1.5, 0], .4), u * .15) }), lt, .008, 18)); hit(f, ph * .54 + .3, 14, .2);
  f.fig(C16J); f.fx(g => { const kp = vMad(tgt, d, -6 * (1 - clamp(u / .55, 0, 1)) - .25); const q = project(kp), q2 = project(vMad(kp, d, .35)); if (q && q2) { g.save(); g.strokeStyle = '#1a1820'; g.lineWidth = Math.max(2, .05 * q.s); g.lineCap = 'round'; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q2.x, q2.y); g.stroke(); g.fillStyle = '#9aa0b0'; g.beginPath(); g.arc(q2.x, q2.y, Math.max(2, .04 * q.s), 0, TAU); g.fill(); g.restore(); }
    if (u > .5) fxClockShield(g, vMad(tgt, d, -.25), vMul(d, -1), (u - .5) * .54, { r: .32, hit: (u - .55) * .54 }); fxSpeedLines(g, lt, { n: 30, inner: 380, alpha: .35 }); }, { layer: 'over' });
});
// C17 (masked CLUE, S2): close behind a pillar - Itachi coughs into his hand: blood. He wipes it on the cloak before anyone sees; the Sharingan dims for one frame.
const C17K = K([[0, at([-6.2, 0, -2.6], HP - .45, P('ita_stand', { shar: 1, spin: .4, face: expr('itaCalm') }))], [.28, at([-6.2, 0, -2.6], HP - .45, P('ita_cough', { shar: 1, spin: .5, blood: .35, face: expr('itaCough') })), 'snap'],
  [.8, at([-6.2, 0, -2.6], HP - .45, P('ita_cough', { shar: 1, spin: .6, blood: .5, sp: .2, face: expr('itaCough') })), 'smooth'], [1.1, at([-6.2, 0, -2.6], HP - .45, P('ita_cloakHand', { shar: 1, spin: .7, blood: .3, face: expr('itaCalm', { eye: .55 }) })), 'inOut'],
  [1.375, at([-6.2, 0, -2.6], HP - .45, P('ita_cloakHand', { shar: 1, spin: .8, blood: 0, face: expr('itaCold') }))]]);
const C17I = ITA('sharingan', t => { const p = C17K(t); return Math.floor(t * 24 + 1e-6) === 28 ? Object.assign({}, p, { shar: .15, eyeGlow: 0 }) : p; }, { timing: 2, wind: WIND });
shotT('C17', (f, lt) => {
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.light({ rimAmt: 1, rimCol: '#ff4a3a' }); const dim = Math.floor(lt * 24 + 1e-6) === 28;
  f.cam(camHandheld(closeCam(C17I, lt, { part: 'bust', az: .55, el: .02, dist: lerp(1.45, 1.15, easeInOut(clamp(lt / 1.375, 0, 1))) }), lt, .0025, 117));
  f.prop([-6.75, 2, -1.85], g => ijPillar(g, [-6.75, 0, -1.85], 5.5, .5)); f.fig(C17I, dim ? { t: lt } : {});   // timing 2, but the dim frame is drawn on its own frame
  f.fx(g => { const S = figSkel(C17I, onN(lt, 2)), k = clamp((lt - .32) / .1, 0, 1) * (1 - clamp((lt - 1.0) / .2, 0, 1)); if (k <= 0) return; const q = project(vAdd(S.J.handR, [0, .02, 0])); if (!q) return;
    g.save(); g.globalAlpha = k; g.fillStyle = '#9a0010'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(q.x + (hash(i * 3) - .5) * .06 * q.s, q.y + (hash(i * 5) - .5) * .05 * q.s, .018 * q.s * (1 + hash(i)), .012 * q.s, hash(i * 7) * 3, 0, TAU); g.fill(); } g.restore(); }, { layer: 'over' });
  if (dim) f.grade({ bright: .9 });
});
const C18J = JUL('magic', K([[0, aJ('jul_guard', { cut: 1, face: expr('julSense') }, 1.4)], [.2, aJ('jul_palmOut', { cut: 1, face: expr('julSense') }, 1.0), 'snap'], [1.42, aJ('jul_palmOut', { cut: 1, face: expr('julSense') }, 1.0)]]), { timing: 1 });
const C18I = ITA('sharingan', t => { const u = clamp((t - .25) / .9, 0, 1); return at([lerp(-.6, -10.5, easeOut(u)), 0, 0], HP, P(u > .05 ? 'ita_land' : 'ita_punchWind', { shar: 1, face: expr(u > .05 ? 'itaPain' : 'itaCold') })); }, { timing: 1, wind: WIND });
shotT('C18', (f, lt) => {   // Julius answers: an accelerated palm strike - Itachi skids ten metres through the wet sand
  BGX(f, 'ARENA', { side: 'J' }); hit(f, .25, 24, .4);
  f.cam(camHandheld(camPath([{ t: 0, pos: [0, 1.0, 4.6], target: [0, 1.2, 0], fov: 40 }, { t: .3, pos: [-.6, 1.0, 4.4], target: [-1.4, 1.1, 0], fov: 38, ease: 'snap' }, { t: 1.42, pos: [-7, .9, 4.8], target: [-9.6, 1.0, 0], fov: 40, ease: 'out' }])(lt), lt, .006, 19));
  f.fig(C18J); f.fig(C18I); f.fx(g => { for (let i = 0; i < 6; i++) fxDust(g, [lerp(-1, -10, i / 6), 0, 0], lt - .3 - i * .1, { r: 1.4 }); fxShockRing(g, [-.4, 1.2, 0], lt - .25, { r: 2, dur: .3, up: true, col: '#fff6d0' }); }, { layer: 'over' });
});
const C19I = ITA('sharingan', K([[0, aI('ita_kneel', { shar: 1, blood: .6, face: expr('itaPain') }, -9.8)], [.5, aI('ita_cough', { shar: 1, blood: .6, face: expr('itaCalm') }, -9.8), 'smooth'], [1.0, aI('ita_stand', { shar: 1, blood: .5, spin: 2, face: FA('itaStare', 1, { talk: 1 }) }, -9.8), 'smooth'], [1.58, aI('ita_stand', { shar: 1, blood: .5, spin: 3, eyeGlow: .6, face: expr('itaStare') }, -9.8)]]), { timing: 2, wind: WIND });
shotT('C19', (f, lt) => {   // Itachi rises, wipes the corner of his mouth, the Sharingan brightens
  BGX(f, 'ARENA', { side: 'I' }); f.cam(camHandheld(closeCam(C19I, lt, { part: 'bust', az: .45, el: lerp(-.15, .02, clamp(lt / 1.2, 0, 1)), dist: lerp(1.6, 1.15, clamp(lt / 1.58, 0, 1)) }), lt, .003, 20)); f.fig(C19I);
});
const C20J = JUL('base', K([[0, aJ('jul_eyesClosed', { cut: 1 }, 2)], [.7, aJ('jul_eyesClosed', { cut: 1, hy: -.4 }, 2), 'smooth'], [.75, aJ('jul_hurt', { cut: 1, hp: -.6, face: expr('pain') }, 2.2), 'snap'], [1.63, aJ('jul_hurt', { cut: 1, face: expr('julWonder') }, 2.6), 'out']]), { timing: 1 });
const C20I = ITA('sharingan', t => { const out = clamp((t - .55) / .1, 0, 1); return at([1.0, .3, -.2], -.3, P('ita_kickSpin', { shar: 1, dissolve: 1 - out, ground: false, face: expr('itaCold') })); }, { timing: 1, wind: WIND });
shotT('C20', (f, lt) => {   // KATON: HŌSENKA - a ring of fire flowers and crows everywhere; Julius reads the mana-less crows as a feint, but the real Itachi bursts from one: kick to the jaw
  BGX(f, 'ARENA', { side: 'I' }); f.light({ fx: [{ p: [0, 2, 0], col: '#ff8a2a', r: 9, a: .7 }] }); hit(f, .75, 26, .45);
  const base = camPath([{ t: 0, orbit: { c: [1.6, 1.6, 0], r: 6, az: -1.4, el: .1 }, target: [1.6, 1.6, 0], fov: 42 }, { t: .7, orbit: { c: [1.8, 1.6, 0], r: 3.8, az: -.3, el: .05 }, target: [1.8, 1.7, 0], fov: 38, ease: 'inOut' }, { t: 1.63, orbit: { c: [2.0, 1.6, 0], r: 3.4, az: .6, el: .04 }, target: [2.2, 1.6, 0], fov: 36, ease: 'out' }])(lt);
  const wp = whipThru(base, lt, .6, .75, -.7); f.cam(wp.cam); f.motionBlur(wp.blur);
  f.fig(C20J); f.fig(C20I, { t: hitStop(lt, [[.75, .07]]) });
  f.fx(g => { fxHosenka(g, [-6, 2.5, 0], [1, -.05, 0], lt, { n: 7, spread: 2.0, r: .5, speed: 9 }); fxCrows(g, lt, { c: [1.6, 2, 0], n: 30, r: 3.2, mode: 'swirl', size: .36 }); if (lt > .5) fxCrows(g, lt - .5, { c: [1.0, 1.6, -.2], n: 16, r: 1.6, mode: 'burst', dur: .4, size: .34 }); }, { layer: 'over' });
});
const C21J = JUL('base', K([[0, aJ('jul_hurt', { cut: 1, face: expr('julWonder') }, 4)], [.5, aJ('jul_land', { cut: 1, face: expr('julSense', { eye: .15, closed: 0 }) }, 5.2), 'out'], [.9, aJ('jul_laugh', { cut: 1, face: FA('julThrilled', 1, { talk: 1.4 }) }, 5.3), 'smooth'], [1.38, aJ('jul_laugh', { cut: 1, face: expr('julThrilled', { eye: .2 }) }, 5.3)]]), { timing: 2 });
shotT('C21', (f, lt) => {   // Julius slides back, opens one eye a crack and laughs from the heart
  BGX(f, 'ARENA', { side: 'J' }); f.cam(camHandheld(camPath([{ t: 0, pos: [2.0, 1.5, 3.4], target: [4.2, 1.5, 0], fov: 38 }, { t: 1.38, pos: [3.6, 1.65, 2.6], target: [5.3, 1.6, 0], fov: 34, ease: 'out' }])(lt), lt, .004, 21)); f.fig(C21J);
  f.fx(g => fxDust(g, [4.4, 0, 0], lt, { r: 1.6 }), { layer: 'over' });
});
const C22I = ITA('sharingan', t => at([Math.cos(t * .35 + Math.PI) * 6, 0, Math.sin(t * .35 + Math.PI) * 6], lookAt([Math.cos(t * .35 + Math.PI) * 6, 0, Math.sin(t * .35 + Math.PI) * 6], [0, 0, 0]), IJ.itaWalk(t * .7, { shar: 1 })), { wind: WIND });
const C22J = JUL('base', t => at([Math.cos(t * .35) * 6, 0, Math.sin(t * .35) * 6], lookAt([Math.cos(t * .35) * 6, 0, Math.sin(t * .35) * 6], [0, 0, 0]), IJ.julWalkBack(t * .7, { cut: 1, face: expr('julSense') })));
shotT('C22', (f, lt) => {   // breather: they circle each other in the rain; crows sit along the ring's edge; lightning lights the silhouettes in the stands. Slow 70 deg orbit
  BGX(f, 'ARENA', { bg: { lightning: [f.shot.t0 + .92], react: 'hush' } });
  f.cam(camHandheld(camPath([{ t: 0, orbit: { c: [0, 1.5, 0], r: 19, az: -.6, el: .2 }, target: [0, 1.4, 0], fov: 42 }, { t: 1.63, orbit: { c: [0, 1.5, 0], r: 17, az: .62, el: .16 }, target: [0, 1.4, 0], fov: 42, ease: 'inOut' }])(lt), lt, .003, 22));
  f.fig(C22I); f.fig(C22J);
  f.fx(g => { for (let i = 0; i < 18; i++) { const an = i / 18 * TAU + .2, q = project([Math.cos(an) * 24, .45, Math.sin(an) * 24]); if (q && q.z > 1) ijDrawCrow(g, q.x, q.y, .6 * q.s, 1.4 + (i % 3) * .2 + Math.sin(lt * 3 + i) * .1, -HP * .1 * (i % 2 ? 1 : -1), { eye: true }); } }, { layer: 'over' });
});
const C23I = ITA('sharingan', t => { const cl = t < .55 ? 0 : t < .75 ? 1 : 0; return at([-3, 0, 0], HP, P('ita_stand', { shar: 1, mang: clamp((t - .75) / .2, 0, 1), spin: t * 2, bleed: clamp((t - .9) / .6, 0, 1), face: expr('itaCold', cl ? { closed: 1, eye: 0 } : { eye: .85 }) })); }, { timing: 1 });
shotT('C23', (f, lt) => {   // ECU: Itachi closes his eye; when it opens the tomoe have fused into the three-bladed Mangekyō, and a tear of blood runs down
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.light({ rimAmt: 1, rimCol: '#ff3a2a' }); const c = closeCam(C23I, lt, { part: 'eyes', az: .15, el: .02, dist: lerp(1.25, .95, clamp(lt / 1.8, 0, 1)) }); f.cam(camHandheld(c, lt, .0015, 23)); f.fig(C23I);
});
const C24J = JUL('base', t => breathe(aJ('jul_eyesClosed', { cut: 1, face: FA(t > .55 ? 'julSerious' : 'julSense', t, { talk: t > .7 ? .8 : 0, seed: 24 }) }, 3), t), { wind: t => [0, 1.2 * clamp(t / .4, 0, 1), 0] });
shotT('C24', (f, lt) => {   // Julius senses the change: his hair lifts, the smile freezes for a moment; the silhouettes in the stands lean forward
  BGX(f, 'ARENA', { side: 'J', bg: { react: 'gasp' } }); f.cam(pushFace(C24J, lt, { dur: 1.2, from: 1.5, to: 1.15, az: -.35, part: 'bust' })); f.fig(C24J);
  f.fx(g => fxCrowdFG(g, lt, { n: 5, size: 340, rim: '#ff9a50', react: 'gasp' }), { layer: 'over' });
});
const C25I = ITA('mangekyo', t => at([-3, 0, 0], HP, P('ita_stand', { mang: 1, bleed: 1, face: FA('itaCold', t, { talk: t > .2 && t < .8 ? 1.4 : 0, seed: 25 }) })), { timing: 2 });
shotT('C25', (f, lt) => {   // ECU on his lips: "Amaterasu." - the rain hisses around him
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.cam(camHandheld(closeCam(C25I, lt, { part: 'mouth', az: .25, el: .05, dist: lerp(1.2, 1.0, clamp(lt / 1.2, 0, 1)) }), lt, .0015, 25)); f.fig(C25I);
});
// ---------------------------------------------------------------------------------------------------- D: Amaterasu, Chrono Anastasis, Susanoo, Mana Zone
const D01I = ITA('mangekyo', t => breathe(aI('ita_stand', { mang: 1, bleed: 1, eyeGlow: .5, face: expr('itaCold') }, -3.4), t), { wind: WIND });
const D01J = JUL('base', K([[0, aJ('jul_eyesClosed', { cut: 1 }, 3)], [.1, aJ('jul_hurt', { cut: 1, face: expr('shock') }, 3.1), 'snap'], [1.63, aJ('jul_guard', { cut: 1, face: expr('julSerious') }, 3.3), 'out']]), { timing: 1 });
shotT('D01', (f, lt) => {   // AMATERASU: black flames flare on Julius's left arm and cloak (BURST at once); camera jolts, wide -> medium
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.light({ fx: [{ p: [3, 1.5, .5], col: '#6a2a9a', r: 6, a: .6 }] }); hit(f, 0, 30, .6);
  f.cam(camHandheld(camPath([{ t: 0, pos: [-1, 2.2, 9], target: [0, 1.4, 0], fov: 44 }, { t: 1.63, pos: [1.6, 1.8, 4.6], target: [2.9, 1.5, 0], fov: 38, ease: 'out' }])(lt), lt, .006, 26));
  f.fig(D01I); f.fig(D01J); f.fx(g => fxAmaterasuOn(g, D01J, lt, lt, { h: 1.0 }), { layer: 'over' });
});
const D02J = JUL('base', t => breathe(aJ('jul_palmOut', { cut: 1, aR: [1.3, .2, 0], face: expr('julSerious') }, 3), t));
shotT('D02', (f, lt) => {   // close on the arm: Julius freezes the flames - they turn grey but keep crawling. Amaterasu does not obey time.
  BGX(f, 'ARENA_DARK', { side: 'J' }); f.style('hand2d'); f.grade({ sat: lerp(1, .25, clamp((lt - .4) / .3, 0, 1)) });
  f.cam(camHandheld(closeCam(D02J, lt, { part: 'bust', az: -.75, el: .08, dist: lerp(2.4, 2.0, clamp(lt / 1.4, 0, 1)) }), lt, .003, 27)); f.fig(D02J);
  f.fx(g => { fxAmaterasuOn(g, D02J, lt, lt + 2, { h: .5 }); fxClockCircle(g, figPos(D02J, lt, 'elL'), [-1, .3, .4], lt - .35, { r: .32, handsT: .5, w: .6 }); }, { layer: 'over' });
});
shotT('D03', (f, lt) => { STAR(f, 'KYO:kyo_cupRaise', lt, { focus: 'both', part: 'two', rD: 'dazai_headTilt', az: .25, push: .45, react: 'gasp', flash: 'red', flashT: .1 }); f.light({ fx: [{ p: [-20, 8, 4], col: '#6a2a9a', r: 10, a: .4 }] }); });
const D04J = JUL('base', t => breathe(aJ('jul_stand', { cut: 1, hy: .15, face: FA('julSmile', t, { talk: t > .15 ? 1.1 : 0, seed: 28 }) }, 3), t));
shotT('D04', (f, lt) => {   // ECU: the flames lick at Julius's neck. He smiles.
  BGX(f, 'ARENA_DARK', { side: 'J' }); f.cam(pushFace(D04J, lt, { dur: .9, from: 1.1, to: .95, az: -.5 })); f.fig(D04J);
  f.fx(g => { const S = figSkel(D04J, lt); fxAmaterasu(g, vAdd(S.J.shL, [0, -.05, 0]), lt + 1, { r: .1, h: .28, n: 5, seed: 9 }); fxAmaterasu(g, vAdd(S.J.elL, [0, 0, 0]), lt + 1, { r: .1, h: .3, n: 4, seed: 4 }); }, { layer: 'over' });
});
const D05J = JUL('chrono', t => breathe(aJ('jul_palmOut', { cut: 1, face: FA('julSmile', t, { talk: t > .8 ? 1.1 : 0, seed: 29 }) }, 3), t));
const D05I = ITA('mangekyo', K([[0, aI('ita_stand', { mang: 1, bleed: 1, face: expr('itaCold') }, -3.4)], [.95, aI('ita_stand', { mang: 1, bleed: 1, face: expr('itaCold') }, -3.4), 'hold'], [1.1, aI('ita_eyeCover', { mang: 1, bleed: 1.4 }, -3.6), 'snap'], [1.92, aI('ita_eyeCover', { mang: 1, bleed: 1.5 }, -3.8)]]), { timing: 1, wind: WIND });
shotT('D05', (f, lt) => {   // CHRONO ANASTASIS: Julius rewinds his arm's time - the black flames stream backwards through the air INTO Itachi's eye, which bleeds
  BGX(f, 'ARENA_DARK', { side: 'J' }); hit(f, 0, 22, .5); f.light({ fx: [{ p: [3, 1.5, 0], col: '#ffd36a', r: 6, a: .7 }] });
  f.cam(camHandheld(camPath([{ t: 0, pos: [3.6, 1.8, 3.2], target: [2.6, 1.5, 0], fov: 38 }, { t: 1.92, pos: [.2, 2.2, 7.8], target: [-1.2, 1.5, 0], fov: 42, ease: 'inOut' }])(lt), lt, .005, 30));
  f.fig(D05J); f.fig(D05I);
  f.fx(g => { const eye = vAdd(figPos(D05I, lt, 'head'), [.12, .02, -.04]); if (lt < .3) fxAmaterasuOn(g, D05J, lt, 2, { h: .8, k: 1 - lt / .3 }); fxAmaterasuRewind(g, [3, 1.2, .2], eye, lt - .1, { dur: 1.0, n: 34 }); fxTimeRewind(g, [3, 1.4, .3], lt, { r: 1.2, k: clamp(1.4 - lt, 0, 1) }); }, { layer: 'over' });
  CLOCK(f, [2.6, 1.5, .2], [-1, 0, 0], lt, { r: 1.4, handsT: -lt * 4 });
});
const D06I = ITA('mangekyo', K([[0, aI('ita_eyeCover', { mang: 1, bleed: 1.5 }, -3.8)], [.4, aI('ita_hurt', { mang: 1, bleed: 1.5, aL: [1.25, -.35, 0], eL: 2.5, hL: 'open' }, -4.3), 'out'], [1.29, aI('ita_eyeCover', { mang: 1, bleed: 1.5 }, -4.5)]]), { timing: 2, wind: WIND });
shotT('D06', (f, lt) => {   // Itachi staggers, hand over the bleeding eye; crows scatter
  BGX(f, 'ARENA_DARK', { side: 'I' }); f.cam(camHandheld(closeCam(D06I, lt, { part: 'bust', az: .5 + Math.sin(lt * 4) * .05, el: .03, dist: 1.3, roll: .08 * Math.sin(lt * 3) }), lt, .006, 31)); f.fig(D06I);
  CROWS(f, lt, { c: [-4.2, 2, 0], n: 18, r: 2.2, mode: 'burst', dur: 1.0, size: .34 });
});
const D07J = JUL('chrono', t => breathe(aJ('jul_grimoire', { cut: 1, grimFlip: true, face: FA('julGrin', t, { talk: t > .5 ? 1.2 : 0, seed: 32 }) }, 3), t));
shotT('D07', (f, lt) => {   // close on the grimoire: pages flutter, golden clock hands spin above it - "My turn."
  BGX(f, 'ARENA', { side: 'J' }); f.cam(camHandheld(camPath([{ t: 0, orbit: { c: vAdd(figPos(D07J, 0, 'handL'), [0, .4, 0]), r: 1.6, az: -.6 - HP, el: .15 }, target: vAdd(figPos(D07J, 0, 'handL'), [0, .35, 0]), fov: 36 }, { t: 1.29, orbit: { c: vAdd(figPos(D07J, 0, 'neck'), [0, .1, 0]), r: 1.9, az: -1.3 - HP, el: .05 }, target: vAdd(figPos(D07J, 0, 'neck'), [0, .05, 0]), fov: 34, ease: 'inOut' }])(lt), lt, .003, 32));
  f.fig(D07J); CLOCK(f, vAdd(figPos(D07J, lt, 'handL'), [0, .85, 0]), [0, 1, .3], lt, { r: .45, handsT: lt * 8, w: .7 });
});
const D08J = JUL('chrono', t => { const ph = Math.floor(t / .5); return at([lerp(-1.2, -6.5, clamp(t / 1.5, 0, 1)) + 1.1, 0, (ph % 2 ? .6 : -.6)], -HP + (ph % 2 ? .3 : -.3), P(['jul_punch', 'jul_kick', 'jul_punchTime'][ph % 3], { cut: 1, face: expr('julThrilled') })); }, { timing: 1 });
const D08I = ITA('mangekyo', t => { const u = clamp(t / 1.5, 0, 1); return at([lerp(-1.2, -7.2, u), .2 + Math.sin(u * 9) * .15, 0], HP, P('ita_hurt', { ground: false, mang: 1, bleed: 1.5, sp: -.4 })); }, { timing: 1, wind: WIND });
shotT('D08', (f, lt) => {   // SAKUGA: seven accelerated blows inside one beat; Itachi flies through a pillar (3 cuts)
  BGX(f, 'ARENA', { side: 'J' }); const ph = Math.min(2, Math.floor(lt / .5)), tg = figPos(D08I, lt, 'abd'); hit(f, ph * .5 + .05, 22, .3);
  const cams = [{ pos: vAdd(tg, [1.5, .4, 3.4]), fov: 40 }, { pos: vAdd(tg, [-2.6, 1.6, -2.4]), fov: 44 }, { pos: vAdd(tg, [.6, -.6, 3.0]), fov: 38 }]; f.cam(camHandheld(Object.assign({ target: tg }, cams[ph]), lt, .01, 33));
  f.prop([-5.2, 3, -.2], g => ijPillar(g, [-5.2, 0, -.2], 6.2, .8, { smash: clamp((lt - 1.1) * 4, 0, 1) }));
  f.fig(D08J, { afterimages: [.03, .06, .09, .12, .15], afterCol: '#f6d36a', afterA: .5 }); f.fig(D08I);
  f.fx(g => { fxSpeedLines(g, lt, { n: 50, inner: 360, alpha: .5, col: '#ffe8a0' }); for (let i = 0; i < 7; i++) { const tt = lt - i * .2; if (tt < 0 || tt > .12) continue; const q = project(vAdd(tg, [(hash(i) - .5) * .8, (hash(i * 3) - .5) * .8, .3])); if (q) fxImpactStar(g, q.x, q.y, (1 - tt / .12) * 1.2 * q.s, i, '#fff6d0', 6); } if (lt > 1.1) fxDebris(g, [-5.2, 2.2, -.2], lt - 1.1, { kind: 'rock', n: 26 }); }, { layer: 'over' });
});
const WD = [Math.cos(2.75), 0, Math.sin(2.75)], WY = lookAt(WD, [0, 0, 0]), WP = (r, y = 0) => [WD[0] * r, y, WD[2] * r];
const D09I = ITA('mangekyo', K([[0, at(WP(22, 1.2), WY, P('ita_hurt', { ground: false, mang: 1, bleed: 1.5 }))], [.08, at(WP(24.8, 1.0), WY, P('ita_hurt', { ground: false, mang: 1, bleed: 1.5, sp: -.5, face: expr('itaPain') })), 'snap'], [1.42, at(WP(24.8, .6), WY, P('ita_kneel', { ground: false, mang: 1, bleed: 1.5, blood: .8 }))]]), { timing: 1, wind: WIND });
const D09J = JUL('chrono', K([[0, at(WP(19), WY + Math.PI, P('jul_land', { cut: 1 }))], [.5, at(WP(21.6), WY + Math.PI, P('jul_land', { cut: 1, face: expr('julFierce') })), 'snap'], [.7, at(WP(21.8), WY + Math.PI, P('jul_punchWind', { cut: 1, face: expr('julFierce') })), 'out'], [1.42, at(WP(21.8), WY + Math.PI, P('jul_punchWind', { cut: 1, face: expr('julFierce') }))]]), { timing: 1 });
shotT('D09', (f, lt) => {   // Itachi slams into the arena wall, stone cracks; Julius appears in front for the finishing blow, fist glowing with stopped time
  BGX(f, 'ARENA', { side: 'J', bg: { react: 'gasp' } }); hit(f, .08, 34, .5);
  const side = [-WD[2], 0, WD[0]]; f.cam(camHandheld(camPath([{ t: 0, pos: vAdd(WP(16, 1.6), vMul(side, 5)), target: WP(23, 1.6), fov: 44 }, { t: .5, pos: vAdd(WP(17.5, 1.4), vMul(side, 4.2)), target: WP(23.5, 1.4), fov: 42, ease: 'out' }, { t: 1.42, pos: vAdd(WP(19, 1.2), vMul(side, 3.2)), target: WP(23, 1.5), fov: 38, ease: 'inOut' }])(lt), lt, .005, 34));
  f.fig(D09I); if (lt > .45) f.fig(D09J, { afterimages: lt < .7 ? [.04, .08, .12] : [], afterCol: '#f6d36a' });
  f.fx(g => { fxDebris(g, WP(25.4, 1.6), lt - .08, { kind: 'rock', n: 24 }); fxDust(g, WP(25, 0), lt - .1, { r: 2.5 }); { const q = project(WP(25.9, 1.8)); if (q && lt > .08) { g.save(); g.strokeStyle = '#0a0808'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const an = i / 9 * TAU; let x = q.x, y = q.y; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += Math.cos(an + (hash(i * 5 + j) - .5)) * .4 * q.s; y += Math.sin(an + (hash(i * 3 + j) - .5)) * .4 * q.s; g.lineTo(x, y); } g.stroke(); } g.restore(); } } if (lt > .7) fxClockCircle(g, figPos(D09J, lt, 'handR'), WD, lt - .7, { r: .35, w: .7, handsT: .4 }); }, { layer: 'over' });
  if (lt > .7) f.fx(g => fxGlowAt(g, figPos(D09J, lt, 'handR'), .6, '#ffd36a', .8), { layer: 'glow' });
});
const D10I = ITA('mangekyo', t => at(WP(24.6), WY, P('ita_susanoo', { mang: 1, bleed: 1.5, blood: .8, face: expr('itaCold') })), { timing: 2, wind: WIND });
const D10J = JUL('chrono', K([[0, at(WP(21.8), WY + Math.PI, P('jul_punchWind', { cut: 1, face: expr('julFierce') }))], [.22, at(WP(22.6), WY + Math.PI, P('jul_punchTime', { cut: 1, face: expr('julFierce') })), 'snap'], [.6, at(WP(22.4), WY + Math.PI, P('jul_punchTime', { cut: 1, face: expr('julWonder') })), 'hold'], [1.5, at(WP(21.6), WY + Math.PI, P('jul_guard', { cut: 1, face: expr('julThrilled') })), 'out']]), { timing: 1 });
shotT('D10', (f, lt) => {   // SUSANOO ribs materialise round Itachi (red-orange spirit bone) and stop the fist cold
  BGX(f, 'ARENA', { side: 'I' }); hit(f, .25, 30, .5); f.light({ fx: [{ p: WP(24, 2), col: '#e8553a', r: 8, a: clamp(lt * 3, 0, 1) }] }); const side = [-WD[2], 0, WD[0]];
  const c = camPath([{ t: 0, pos: vAdd(WP(20.5, 1.5), vMul(side, 3.2)), target: WP(23.4, 1.6), fov: 40 }, { t: .3, pos: vAdd(WP(20.7, 1.5), vMul(side, 3.0)), target: WP(23.4, 1.7), fov: 38, ease: 'snap' }, { t: 1.5, pos: vAdd(WP(19.4, 1.2), vMul(side, 3.8)), target: WP(23.6, 2.0), fov: 42, ease: 'out' }])(lt);
  f.cam(camHandheld(c, lt, .005, 35)); f.fig(D10I); f.fig(D10J, { t: hitStop(lt, [[.25, .1]]) });
  SUS(f, lt, { at: WP(24.6), yaw: WY, stage: clamp(lt * 6, 0, 1.6), scale: 3.6 });
});
const D11I = ITA('mangekyo', t => at([-20, 0, 0], HP, P('ita_susanoo', { mang: 1, bleed: 1.5, blood: .8, face: expr('itaCold') })), { wind: WIND });
shotT('D11', (f, lt) => {   // SUSANOO grows: ribs -> skeleton -> armoured giant with the Yata mirror and the Totsuka gourd, towering over the arena in the rain. Low crane up to its scale
  BGX(f, 'ARENA_RED', { side: 'I', bg: { react: 'panic', lightning: [f.shot.t0 + 1.0] } }); const st = 1.6 + clamp(lt / 1.5, 0, 1) * 2.4, sc = lerp(3.8, 11, smooth(clamp((lt - .2) / 1.3, 0, 1)));
  f.cam(camHandheld(camPath([{ t: 0, pos: [-12, .5, 7], target: [-19.5, 2.0, 0], fov: 46 }, { t: 2.0, pos: [-6, 2.2, 11], target: [-19.5, 7.5, 0], fov: 50, ease: 'inOut' }])(lt), lt, .004, 36));
  f.fig(D11I); SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: st, scale: sc, sword: clamp((lt - 1.2) * 2, 0, 1), shield: clamp((lt - 1.0) * 2, 0, 1), arm: .35, armL: .3 });
  f.light({ fx: [{ p: [-19, 5, 2], col: '#e8553a', r: 14, a: .8 }] });
});
shotT('D12', (f, lt) => { STAR(f, 'KYO:kyo_cupWave', lt, { focus: 'both', part: 'two', rD: 'dazai_chinPoint', az: -.2, push: -.3, react: 'gasp' }); f.light({ fx: [{ p: [-18, 9, 4], col: '#e8553a', r: 12, a: .6 }] }); f.grade({ tint: ['#ffb0a0', .12] }); });
const D13J = JUL('base', t => breathe(aJ('jul_lookUp', { cut: 1, timeGlow: clamp((t - 1.15) / .2, 0, 1), face: FA(t > 1.15 ? 'julThrilled' : 'julSense', t, { talk: t > .2 && t < 1.1 ? 1.1 : 0, seed: 37 }) }, -12), t));
shotT('D13', (f, lt) => {   // low: Julius looks up at the Susanoo, laughs with joy and opens both eyes (gold)
  BGX(f, 'ARENA_RED', { side: 'J' }); f.light({ fx: [{ p: [-16, 6, 0], col: '#e8553a', r: 10, a: .6 }] });
  f.cam(camHandheld(camPath([{ t: 0, pos: [-14.2, 1.2, 2.4], target: [-12, 1.9, 0], fov: 40 }, { t: 1.58, pos: [-13.6, 1.5, 1.5], target: [-12, 1.9, 0], fov: 32, ease: 'inOut' }])(lt), lt, .003, 37)); f.fig(D13J);
  SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .35, armL: .3, k: .85, layer: 'under' });
});
const D14J = JUL('manazone', t => breathe(aJ('jul_raise', { cut: 1, timeGlow: 1, face: expr('julThrilled') }, -10), t)), D14I = ITA('mangekyo', t => at([-19.4, 0, 0], HP, P('ita_susanoo', { mang: 1, bleed: 1.5 })));
shotT('D14', (f, lt) => {   // MANA ZONE: a golden clock face spreads over the whole arena floor, gears rise into the air and every raindrop slows
  const k = clamp(lt / .8, 0, 1); BGX(f, 'ARENA_GOLD', { side: 'J', bg: { clockScar: k, clockR: 4 + 20 * easeOut(k), clockAt: [-10, 0, 0], react: 'gasp' } });
  f.cam(camHandheld(camPath([{ t: 0, pos: [-2, 9, 14], target: [-12, 1, 0], fov: 50 }, { t: 1.71, pos: [6, 22, 12], target: [-10, 0, 0], fov: 52, ease: 'inOut' }])(lt), lt, .003, 38));
  f.fig(D14J); f.fig(D14I); SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .35, armL: .3, k: .8, layer: 'under' });
  f.fx(g => { fxGears(g, [-10, 0, 0], lt, { n: 14, r: 16, k, size: 1.6 }); fxManaZone(g, [-10, 0, 0], lt, { r: 22 }); }, { layer: 'glow' });
});
const D15J = JUL('manazone', t => breathe(aJ('jul_palmOut', { cut: 1, timeGlow: 1, face: expr('julGrin') }, -8, 2), t)), D15I = D14I;
shotT('D15', (f, lt) => {   // the Susanoo fires Yasaka magatama; Julius stops them in mid-air and reverses their time - they fly back into the armour
  BGX(f, 'ARENA_GOLD', { side: 'J', bg: { clockScar: 1, clockR: 24, clockAt: [-10, 0, 0] } }); hit(f, .96, 26, .5);
  f.cam(camHandheld(camPath([{ t: 0, orbit: { c: [-12, 4, 1], r: 13, az: .9, el: .12 }, target: [-12, 4.5, 1], fov: 46 }, { t: 1.79, orbit: { c: [-13, 4, 1], r: 12, az: .2, el: .18 }, target: [-14, 5.5, 0], fov: 46, ease: 'inOut' }])(lt), lt, .004, 39));
  f.fig(D15J); f.fig(D15I); SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .6, armL: .3, k: .85, layer: 'under' });
  f.fx(g => { const a = [-15.5, 8.5, 0], b = [-8.6, 1.6, 2]; if (lt < .45) fxMagatama(g, a, b, lt, { n: 9, dur: .6 }); else if (lt < .6) fxMagatama(g, a, b, .45, { n: 9, dur: .6 }); else fxMagatama(g, b, a, lt - .6, { n: 9, dur: .36 });
    if (lt > .45 && lt < .7) fxClockCircle(g, vLerp(a, b, .7), [1, 0, .2], lt - .45, { r: 2.2, handsT: -(lt - .45) * 10 }); fxShockRing(g, [-16, 8, 0], lt - .96, { r: 4, dur: .5, up: true, col: '#ff8a5a' }); fxGears(g, [-10, 0, 0], lt + 2, { n: 10, r: 16, size: 1.4 }); }, { layer: 'over' });
});
const D16I = ITA('sick_mangekyo', t => breathe(at([-19.4, 0, 0], HP, P('ita_shield', { mang: 1, bleed: 1.5, blood: 1, face: FA('itaPain', t, { seed: 40 }) })), t * 2.2), { wind: WIND });
shotT('D16', (f, lt) => {   // inside the Susanoo: it reels, Yata mirror raised; Itachi pants, blood at his mouth
  BGX(f, 'ARENA_GOLD', { side: 'I', bg: { clockScar: 1, clockR: 24, clockAt: [-10, 0, 0] } }); f.light({ fx: [{ p: [-19, 2, 1.5], col: '#e8553a', r: 6, a: .9 }] }); f.shake([[0, 8, 1.3, 14]]);
  f.cam(camHandheld(closeCam(D16I, lt, { part: 'bust', az: .7, el: -.05, dist: lerp(1.5, 1.2, clamp(lt / 1.3, 0, 1)) }), lt, .006, 40)); f.fig(D16I);
  SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 1.4, scale: 3.6, k: .45 });
});
const D17J = JUL('manazone', t => { const ph = Math.floor(t / .57), P0 = [[-11, 0, 3], [-13, 2.5, -2], [-9, 4, 1]][Math.min(2, ph)]; return at(P0, -HP + ph, P(['jul_dash', 'jul_float', 'jul_punchTime'][Math.min(2, ph)], { ground: ph === 0, cut: 1, timeGlow: 1, face: expr('julThrilled') })); }, { timing: 1 });
shotT('D17', (f, lt) => {   // SAKUGA: the Totsuka blade slashes, Julius hops between stopped instants (afterimages), clock symbols shatter (3 cuts)
  BGX(f, 'ARENA_GOLD', { side: 'J', bg: { clockScar: 1, clockR: 24, clockAt: [-10, 0, 0] } }); const ph = Math.min(2, Math.floor(lt / .57)), u = (lt - ph * .57) / .57, tg = figPos(D17J, lt, 'abd'); hit(f, ph * .57 + .3, 20, .3);
  const cams = [{ pos: vAdd(tg, [5, 1.5, 6]), fov: 46 }, { pos: vAdd(tg, [-1.5, 1.0, 5]), fov: 40 }, { pos: vAdd(tg, [3, -1.5, 4]), fov: 44 }]; const c0 = Object.assign({ target: vLerp(tg, [-16, 6, 0], .3) }, cams[ph]);
  const wp = ph === 0 ? whipThru(c0, lt, .3, .5, .6) : { cam: c0, blur: 0 }; f.cam(camHandheld(Object.assign({}, wp.cam, { fov: wp.cam.fov - u * 4 }), lt, .008, 41)); f.motionBlur(wp.blur);
  f.fig(D17J, { afterimages: [.04, .08, .12, .16], afterCol: '#f6d36a', afterA: .5 }); SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .7, swing: (lt * .9) % 1, armL: .3, k: .85, layer: 'under' });
  f.fx(g => { fxClockShield(g, vAdd(tg, [-1, .4, 0]), [-1, 0, 0], u * .57, { r: 1.2, hit: u * .57 - .25 }); if (u > .45) fxDebris(g, vAdd(tg, [-1, .4, 0]), (u - .45) * .57, { kind: 'glass', n: 20 }); }, { layer: 'over' });
});
const D18J = JUL('manazone', t => { const u = clamp(t / 1.58, 0, 1), Hs = 11, at0 = [-19.4, 0, 0], W3 = (x, y, z) => [at0[0] + z * Hs, y * Hs, at0[2] - x * Hs], hd = W3(.38, .44, .22), el = W3(.455, .49, .12), p = lerp3(hd, el, u);
  return at(p, lookAt(hd, el), IJ.julRun(t * 1.6, { ground: false, timeGlow: 1, cut: 1, face: expr('julThrilled') })); });
shotT('D18', (f, lt) => {   // Julius runs up the Susanoo's arm in slowed time, the stopped raindrops around him like stars; side tracking, slow motion
  BGX(f, 'ARENA_GOLD', { side: 'J', bg: { clockScar: 1, clockR: 24, clockAt: [-10, 0, 0] } }); const tg = figPos(D18J, lt, 'abd');
  f.cam(camHandheld({ pos: vAdd(tg, [1.6, .6, 5.2]), target: vAdd(tg, [-.6, .2, 0]), fov: 40 }, lt, .003, 42)); f.fig(D18J, { afterimages: [.08, .16], afterCol: '#f6d36a', afterA: .35 });
  SUS(f, lt, { at: [-19.4, 0, 0], yaw: HP, stage: 4, scale: 11, sword: 1, shield: 1, arm: .5, armL: .3, k: .85, layer: 'under' });
});
