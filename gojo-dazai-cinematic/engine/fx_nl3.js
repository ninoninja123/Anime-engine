/* engine/fx_nl3.js (agent E, naruto-vs-luffy) - KURAMA, the nine-tailed fox (2D painted on a world anchor; replaces the simple fxKurama of fx_nl.js).
   fxKurama(g, c, t, o)   c = world point at the fox's feet (or {x,y,s} screen) ; o:
     scale  height in metres when standing (default 14)        mode  'avatar' (golden chakra, flame edge, black seal lines) | 'real' (orange fur, black eye marks)
     pose   'stand' | 'catch' (both paws raised forward to catch) | 'crouch' | 'roar' (head up, mouth open) | 'bomb' (mouth open, orb charging)
     part   'full' | 'head' (head close-up: c = head centre, scale = head width in m) | 'eye' (one eye fills the frame: c = eye centre, scale = eye width m)
     expr   'grin' | 'calm' | 'angry' | 'roar' | 'closed' | 'smirk' ;  eye 0..1 (lid open), mouth 0..1 (jaw open), look [x,y] (-1..1)
     mirror true (faces viewer-left), rise 0..1 (forms up from the ground / fades in), alpha, tails (count), orb 0..1 (tailed-beast-bomb ball in the mouth), glow 0..1
   Layer: 'under' when Naruto stands in front of the avatar; 'over' for the fox alone.                                                                 */
'use strict';
const KURC = { fur: '#ff8a1e', furLight: '#ffb050', furDark: '#c8501a', belly: '#ffd8a0', ink: '#1a0a04', mark: '#1a0a06', eye: '#ff3a10', eyeLight: '#ffd040', gold: '#ffbe2a', goldLight: '#fff2a0', goldDark: '#e87a10' };
function kurPath(g, pts, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } if (close) g.closePath(); }
function kurFill(g, col, ink, lw) { g.fillStyle = col; g.fill(); if (ink) { g.strokeStyle = ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
// the head in local units (1 = head width), centre (0,0), y down.  s = px per unit
function kurHead(g, S, st, t) {
  const { av, mouth, eye, look, expr, lw } = st, fur = av ? KURC.gold : KURC.fur, furD = av ? KURC.goldDark : KURC.furDark, ink = av ? 'rgba(60,20,0,.9)' : KURC.ink, ang = expr === 'angry' || expr === 'roar' ? .25 : expr === 'calm' || expr === 'closed' ? -.05 : .12;
  // ears (behind), dark inner
  for (const sg of [-1, 1]) { kurPath(g, [[sg * .22, -.3], [sg * .5, -1.25, sg * .62, -1.42], [sg * .7, -.85, sg * .52, -.2]]); kurFill(g, fur, ink, lw); kurPath(g, [[sg * .3, -.36], [sg * .5, -1.05, sg * .58, -1.18], [sg * .6, -.8, sg * .48, -.32]]); kurFill(g, av ? 'rgba(120,40,0,.55)' : KURC.mark, null); }
  // cheek ruffs: jagged fur spikes out to the sides
  for (const sg of [-1, 1]) { const pts = [[sg * .4, -.2]]; for (let i = 0; i < 4; i++) { const y = -.12 + i * .16; pts.push([sg * (.72 + .12 * (i % 2 ? 0 : 1) + (i === 1 ? .1 : 0)), y + .05]); pts.push([sg * .55, y + .12]); } pts.push([sg * .35, .5]); kurPath(g, pts); kurFill(g, fur, ink, lw); }
  // skull + jaw
  kurPath(g, [[-.5, -.15], [-.52, -.5, 0, -.55], [.52, -.5, .5, -.15], [.56, .2, .32, .42], [.16, .62, 0, .66], [-.16, .62, -.32, .42], [-.56, .2, -.5, -.15]]); kurFill(g, fur, ink, lw);
  // muzzle lighter (real) / brighter (avatar)
  kurPath(g, [[-.2, .02], [-.26, .3, -.12, .52], [0, .6, .12, .52], [.26, .3, .2, .02], [0, -.06, -.2, .02]]); kurFill(g, av ? KURC.goldLight : KURC.furLight, null);
  // forehead shading (cel)
  kurPath(g, [[.05, -.54], [.5, -.48, .5, -.15], [.42, .05, .28, .02], [.3, -.3, .05, -.54]]); g.fillStyle = rgba(furD, .45); g.fill();
  // black eye markings sweeping back toward the ears
  for (const sg of [-1, 1]) { kurPath(g, [[sg * .06, -.08], [sg * .2, -.3, sg * .5, -.38], [sg * .58, -.3, sg * .55, -.2], [sg * .32, -.12, sg * .1, -.02]]); kurFill(g, av ? 'rgba(60,20,0,.75)' : KURC.mark, null); }
  // eyes (almond, slanted), red-orange iris, vertical slit pupil
  for (const sg of [-1, 1]) { const ex = sg * .26, ey = -.16, w = .19, h = .085 * clamp(eye, 0, 1.2); g.save(); g.translate(ex, ey); g.rotate(sg * -ang);
    if (h < .01) { g.strokeStyle = ink; g.lineWidth = lw * 1.4; g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(0, .03, w, -.01); g.stroke(); g.restore(); continue; }
    kurPath(g, [[-w, .01], [0, -h * 1.7, w, -.02], [0, h * 1.2, -w, .01]]); g.fillStyle = av ? '#fff6d0' : '#fff2e0'; g.fill(); g.save(); g.clip();
    const ix = look[0] * w * .35, iy = look[1] * h * .5, gr = g.createRadialGradient(ix, iy, .01, ix, iy, .11); gr.addColorStop(0, KURC.eyeLight); gr.addColorStop(.55, KURC.eye); gr.addColorStop(1, '#8a0a04'); g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, .1, 0, TAU); g.fill();
    g.fillStyle = '#100404'; g.beginPath(); g.ellipse(ix, iy, .018, .085, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ix - .03, iy - .03, .018, 0, TAU); g.fill(); g.restore();
    kurPath(g, [[-w, .01], [0, -h * 1.7, w, -.02]], false); g.strokeStyle = ink; g.lineWidth = lw * 1.6; g.stroke(); g.restore(); }
  // brow ridges
  for (const sg of [-1, 1]) { g.strokeStyle = ink; g.lineWidth = lw * 1.3; g.beginPath(); g.moveTo(sg * .1, -.27 - ang * .08); g.quadraticCurveTo(sg * .26, -.33 + ang * .05, sg * .44, -.28 + ang * .12); g.stroke(); }
  // nose
  kurPath(g, [[-.07, .3], [0, .26, .07, .3], [.05, .36, 0, .37], [-.05, .36, -.07, .3]]); kurFill(g, '#120604', null);
  // mouth: grin line or open jaw with fangs
  const mo = clamp(mouth, 0, 1), grin = expr === 'grin' || expr === 'smirk' ? 1 : 0;
  if (mo < .05) { g.strokeStyle = ink; g.lineWidth = lw * 1.5; g.beginPath(); g.moveTo(-.3, .4 - grin * .06); g.quadraticCurveTo(0, .5 + grin * .02, .3, .4 - grin * .06); g.stroke();
    if (grin) { g.fillStyle = '#fff'; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(sg * .2, .44); g.lineTo(sg * .17, .53); g.lineTo(sg * .14, .45); g.fill(); g.strokeStyle = ink; g.lineWidth = lw * .7; g.stroke(); } } }
  else { const jaw = .1 + .32 * mo, wd = .34 + grin * .05; kurPath(g, [[-wd, .4], [0, .44 - .05 * grin, wd, .4], [wd * .8, .4 + jaw, 0, .42 + jaw * 1.1], [-wd * .8, .4 + jaw, -wd, .4]]); kurFill(g, '#3a0606', ink, lw * 1.3);
    g.fillStyle = '#c02a2a'; g.beginPath(); g.ellipse(0, .42 + jaw * .85, wd * .45, jaw * .22, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.strokeStyle = ink; g.lineWidth = lw * .6; for (let i = 0; i < 7; i++) { const x = -wd * .85 + i * wd * .28, big = i === 1 || i === 5; g.beginPath(); g.moveTo(x - .03, .41); g.lineTo(x, .41 + (big ? .11 : .05)); g.lineTo(x + .03, .41); g.fill(); g.stroke(); }
    for (let i = 0; i < 6; i++) { const x = -wd * .7 + i * wd * .28, big = i === 1 || i === 4; const yb = .4 + jaw * .98; g.beginPath(); g.moveTo(x - .03, yb); g.lineTo(x, yb - (big ? .1 : .045)); g.lineTo(x + .03, yb); g.fill(); g.stroke(); } }
  // whisker-mark folds
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { g.strokeStyle = rgba(av ? '#7a2a00' : KURC.ink, .7); g.lineWidth = lw; g.beginPath(); g.moveTo(sg * .3, .14 + i * .07); g.lineTo(sg * .48, .1 + i * .08); g.stroke(); }
}
function kurFlameEdge(g, pathFn, s, t, col, a) {   // flickering chakra tongues along a shape's edge (avatar)
  const fr = Math.floor(t * 12); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(col, .35 * a); g.lineWidth = s * .09; g.lineJoin = 'round'; pathFn(); g.stroke(); g.strokeStyle = rgba('#fff4c0', .25 * a); g.lineWidth = s * .03; pathFn(); g.stroke(); g.restore();
}
function fxKurama(g, c, t, o = {}) {
  const part = o.part || 'full', av = (o.mode || 'avatar') === 'avatar', rise = clamp(o.rise == null ? 1 : o.rise, 0, 1), A = (o.alpha == null ? 1 : o.alpha) * smooth(rise); if (A <= .01) return;
  const q = Array.isArray(c) ? project(c) : c; if (!q) return; const pxm = Array.isArray(c) ? q.s : (c.s || 100);
  const expr = o.expr || (o.pose === 'roar' ? 'roar' : 'grin'), mouth = o.mouth != null ? o.mouth : (expr === 'roar' ? 1 : o.pose === 'bomb' ? .9 : 0), eye = o.eye != null ? o.eye : (expr === 'closed' ? 0 : 1), look = o.look || [0, 0];
  g.save(); g.globalAlpha *= A; g.translate(q.x, q.y); if (o.mirror) g.scale(-1, 1);
  if (part === 'eye') { const s = (o.scale || 3) * pxm; g.scale(s / .45, s / .45); g.translate(-.26, .16); kurHead(g, s, { av, mouth: 0, eye, look, expr, lw: .006 }, t); g.restore(); return; }
  if (part === 'head') { const s = (o.scale || 4) * pxm; g.scale(s, s); kurHead(g, s, { av, mouth, eye, look, expr, lw: Math.max(.004, 3 / s) }, t); if (o.orb) kurOrb(g, [0, .55 + .35 * mouth], .25 * o.orb, t); g.restore(); if (av) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, s * 1.5, KURC.gold, .25 * A); g.restore(); } return; }
  const Hm = (o.scale || 14) * pxm, u = Hm / 3.2, pose = o.pose || 'stand', lw = Math.max(2, u * .018), fur = av ? KURC.gold : KURC.fur, furD = av ? KURC.goldDark : KURC.furDark, ink = av ? 'rgba(60,20,0,.85)' : KURC.ink;
  g.translate(0, -Hm * rise * .02); g.scale(u, u); const LW = lw / u, wob = Math.sin(t * 1.2) * .03;
  // local units: 1 = head width; feet at y=0, head centre at y=-2.75 (stand)
  const crouch = pose === 'crouch' ? .35 : 0, headY = -2.75 + crouch + (pose === 'roar' ? -.15 : 0), chestY = -1.75 + crouch;
  if (av) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(0, chestY, .2, 0, chestY, 3.4); gr.addColorStop(0, rgba('#ffb020', .45)); gr.addColorStop(1, rgba('#ff7a10', 0)); g.fillStyle = gr; g.fillRect(-4, -5, 8, 6); g.restore(); }
  // tails (behind): 9 thick tapering tails fanning up/out from the hips
  const nT = o.tails == null ? 9 : o.tails; for (let i = 0; i < nT; i++) { const an = -Math.PI / 2 + (i - (nT - 1) / 2) * .3 + Math.sin(t * 1.4 + i * .9) * .08, L = 2.6 + .3 * hash(i * 3), bx = (i - (nT - 1) / 2) * .05, by = -.75 + crouch;
    const ex = bx + Math.cos(an) * L * 1.1, ey = by + Math.sin(an) * L, mx = bx + Math.cos(an - .45 * Math.sign(i - (nT - 1) / 2 || 1)) * L * .55, my = by + Math.sin(an - .3) * L * .55, w = .32;
    const path = () => kurPath(g, [[bx - w, by], [mx - w * .8, my, ex, ey], [mx + w * .8, my + w * .3, bx + w, by]]); path(); kurFill(g, i % 2 ? fur : shadeHex(fur, -.06), ink, LW); if (av) kurFlameEdge(g, path, 1, t + i, '#ffd040', 1);
    if (!av) { kurPath(g, [[ex, ey], [lerp(mx, ex, .6) - w * .3, lerp(my, ey, .6), lerp(bx, ex, .75), lerp(by, ey, .75)]], false); g.strokeStyle = rgba(furD, .7); g.lineWidth = LW * 2; g.stroke(); } }
  // haunches / legs
  for (const sg of [-1, 1]) { kurPath(g, [[sg * .25, -1.0 + crouch], [sg * 1.0, -1.1 + crouch, sg * .95, -.35], [sg * .9, 0, sg * .55, 0], [sg * .35, -.3, sg * .25, -1.0 + crouch]]); kurFill(g, fur, ink, LW);
    for (let k = 0; k < 3; k++) { g.fillStyle = '#1a0a06'; g.beginPath(); g.moveTo(sg * (.55 + k * .14), 0); g.lineTo(sg * (.6 + k * .14), .12); g.lineTo(sg * (.65 + k * .14), 0); g.fill(); } }
  // torso
  const body = () => kurPath(g, [[-.75, -.9 + crouch], [-1.0, chestY - .4, -.55, chestY - .95], [0, chestY - 1.15, .55, chestY - .95], [1.0, chestY - .4, .75, -.9 + crouch], [0, -.55 + crouch, -.75, -.9 + crouch]]);
  body(); kurFill(g, fur, ink, LW); if (av) kurFlameEdge(g, body, 1, t, '#ffd040', 1);
  kurPath(g, [[-.38, chestY - .7], [0, chestY - .85, .38, chestY - .7], [.42, chestY + .2, 0, -.75 + crouch], [-.42, chestY + .2, -.38, chestY - .7]]); g.fillStyle = av ? rgba(KURC.goldLight, .7) : KURC.belly; g.fill();
  if (av) { g.strokeStyle = 'rgba(40,14,0,.85)'; g.lineWidth = LW * 2.2; g.beginPath(); g.arc(0, chestY - .35, .32, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5; g.fillStyle = 'rgba(40,14,0,.9)'; g.beginPath(); g.arc(Math.cos(a) * .32, chestY - .35 + Math.sin(a) * .32, .06, 0, TAU); g.fill(); }
    g.beginPath(); g.moveTo(-.5, chestY + .15); g.lineTo(-.25, -.95 + crouch); g.moveTo(.5, chestY + .15); g.lineTo(.25, -.95 + crouch); g.stroke(); }
  // arms + paws
  const armPose = sg => { if (pose === 'catch') return [[sg * .7, chestY - .8], [sg * 1.25, chestY - 1.35], [sg * .95, chestY - 2.05]]; if (pose === 'roar') return [[sg * .7, chestY - .8], [sg * 1.4, chestY - .4], [sg * 1.6, chestY + .2]]; return [[sg * .7, chestY - .8], [sg * 1.05, chestY - .1], [sg * .95, -.12]]; };
  for (const sg of [-1, 1]) { const [s0, e0, p0] = armPose(sg), w0 = .28, w1 = .23; const seg = (a, b, wa, wb) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; kurPath(g, [[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa]]); kurFill(g, fur, ink, LW); };
    seg(s0, e0, w0, w1); g.beginPath(); g.arc(e0[0], e0[1], w1, 0, TAU); kurFill(g, fur, null); seg(e0, p0, w1, .2);
    g.beginPath(); g.ellipse(p0[0], p0[1], .3, .22, sg * .3, 0, TAU); kurFill(g, fur, ink, LW); for (let k = 0; k < 4; k++) { const ca = (pose === 'catch' ? -Math.PI / 2 : Math.PI / 2) + (k - 1.5) * .45; g.fillStyle = '#1a0a06'; g.beginPath(); g.moveTo(p0[0] + Math.cos(ca) * .2 - .04, p0[1] + Math.sin(ca) * .2); g.lineTo(p0[0] + Math.cos(ca) * .38, p0[1] + Math.sin(ca) * .38); g.lineTo(p0[0] + Math.cos(ca) * .2 + .04, p0[1] + Math.sin(ca) * .2); g.fill(); } }
  // head
  g.save(); g.translate(0, headY); g.rotate(wob + (pose === 'roar' ? -.1 : 0)); g.scale(1.1, 1.1); kurHead(g, u, { av, mouth, eye, look, expr, lw: LW / 1.1 }, t); if (o.orb) kurOrb(g, [0, .55 + .35 * mouth], .3 * o.orb, t); g.restore();
  if (av) { g.save(); g.globalCompositeOperation = 'lighter'; const fr = Math.floor(t * 12); for (let i = 0; i < 24; i++) { const x = (hash(i * 3 + fr) - .5) * 3, y = -hash(i * 7 + fr) * 4.2; g.fillStyle = rgba('#fff2a0', .35); g.beginPath(); g.arc(x, y, .04, 0, TAU); g.fill(); } g.restore(); }
  g.restore();
}
function kurOrb(g, p, R, t) {   // tailed-beast bomb in the mouth: black-violet ball, white-violet corona, sucked-in streaks
  const [x, y] = p; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, R * 3, '#9a5aff', .5); g.restore();
  const gr = g.createRadialGradient(x - R * .3, y - R * .3, R * .05, x, y, R); gr.addColorStop(0, '#5a3aa0'); gr.addColorStop(.7, '#140a24'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(200,160,255,.9)'; g.lineWidth = R * .06; g.stroke(); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * 3, r0 = R * (1.3 + (t * 2 + i * .3) % 1.2); g.strokeStyle = 'rgba(200,170,255,.5)'; g.lineWidth = R * .04; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 - R * .4), y + Math.sin(a) * (r0 - R * .4)); g.stroke(); } g.restore();
}
// tailed-beast bomb in flight / explosion (world): fxBijuudama(g, a, b, t, {r, dur, boom})
function fxBijuudama(g, a, b, t, o = {}) { const dur = o.dur || .6, k = clamp(t / dur, 0, 1); if (t < 0) return; const p = vLerp(a, b, easeIn(k)), q = project(p); if (!q) return; const R = (o.r || 2.4) * q.s;
  if (k < 1) { g.save(); g.translate(q.x, q.y); kurOrb(g, [0, 0], R, t); g.restore(); return; }
  const bt = t - dur, bd = o.boomDur || 1.2; if (bt > bd) return; const u = bt / bd, RR = R * (1 + 6 * easeOut(u)); g.save(); g.globalAlpha = 1 - u; g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, RR * 1.4, '#c8a0ff', .7); glow(g, q.x, q.y, RR * .7, '#ffffff', .9); g.restore();
  g.save(); g.globalAlpha = (1 - u) * .9; g.strokeStyle = '#ffffff'; g.lineWidth = 12 * (1 - u) + 2; g.beginPath(); g.arc(q.x, q.y, RR, 0, TAU); g.stroke(); g.restore(); }
// ------------------------------------------------------------------------------------------------ Kurama option aliases
(function () { const k0 = fxKurama; fxKurama = function (g, c, t, o = {}) { const o2 = Object.assign({}, o);
  if (o2.mode === 'seal') o2.mode = 'real'; if (o2.pose === 'kur_eye') { o2.part = o2.part || 'eye'; o2.pose = 'stand'; } else if (o2.pose === 'kur_roar') o2.pose = 'roar'; else if (o2.pose === 'kur_paw') o2.pose = 'catch'; else if (o2.pose === 'kur_bomb') o2.pose = 'bomb';
  if (o2.expr === 'snarl') { o2.expr = 'angry'; if (o2.mouth == null) o2.mouth = .35; } else if (o2.expr === 'soft') o2.expr = 'calm';
  return k0(g, c, t, o2); }; })();
// impact_requests.md: KUR X1 = dissolve into light particles from the tails (o.dissolve 0..1), KUR X2 = younger Kurama (o.young: smaller, rounder, rendered by scale + softer expr)
(function () { const k1 = fxKurama; fxKurama = function (g, c, t, o = {}) { const d = clamp(o.dissolve || 0, 0, 1); if (!d) return k1(g, c, t, o.young ? Object.assign({ expr: 'calm' }, o, { scale: (o.scale || 14) * .55 }) : o);
  const tails = Math.round((o.tails == null ? 9 : o.tails) * (1 - clamp(d * 1.8, 0, 1))); k1(g, c, t, Object.assign({}, o, { tails, alpha: (o.alpha == null ? 1 : o.alpha) * (1 - clamp((d - .5) * 2, 0, 1)) }));
  const q = Array.isArray(c) ? project(c) : c; if (!q) return; const S = (o.scale || 14) * (Array.isArray(c) ? q.s : (c.s || 100)); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 160; i++) { const life = clamp(d * 1.6 - hash(i * 3.3) * .6, 0, 1); if (life <= 0 || life >= 1) continue; const x0 = q.x + (hash(i * 7) - .5) * S * .9, y0 = q.y - hash(i * 11) * S * (.3 + .7 * d), x = x0 + Math.sin(i + t * 2) * S * .04, y = y0 - life * S * .5;
    glow(g, x, y, S * .012 + 2, i % 3 ? '#ffc43a' : '#fff2a0', .8 * (1 - life)); } g.restore(); }; })();
