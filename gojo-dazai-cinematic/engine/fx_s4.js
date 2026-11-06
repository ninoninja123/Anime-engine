/* engine/fx_s4.js (S4) - SPOILER WARNING: finale effects + cameo layers (part 4). Do not show to the viewer.
   fxS4Doll(g, base, yaw, t, {scale, open, reach, holes, tear, stitch, alpha, rise})   kneeling Bankai doll (2.5D layered, inked, cel-shaded)
   fxS4SkyThreads(g, from[], t, {n, dur, sky})        red threads sewn from the doll's hands into the sky (draw-on, stitch ticks)
   fxS4Seam(g, sx, sy, t, {h, open})                  the sky "seam" opening: gold slit with red stitches peeling back
   fxS4Talisman(g, p, t, {lit})                       paper talisman with 紅, glowing red, emits rings
   fxS4BurnFig(g, F, ft, t, {amt, holes, dir:[dx,dy], smoke, keep})  figure burning in sunlight: charring front, ember edge, holes, smoke
   fxS4Smoke(g, p, t, {n, r, h, col})                  rising smoke wisps from a world point
   fxS4Needles(g, c, t, {n, R, dur, spread, col})      Blue Silver Chaotic Afterglow: needle shock-waves converging from all directions
   fxS4Dragon(g, a, b, t, {r, dur, head, wind})       Ninth Form flame dragon: fire body along a winding path + inked 2D head
   fxS4Hat(g, p, t, {r, spin, tilt})                  flying straw hat (sugegasa)
   fxS4Fan(g, p, t, {r, spin, open})                  Urahara's fan (falling / lying open)
   fxS4Cat(g, p, t, {pose:'sit'|'nuzzle'|'walk', dir, s, look, rim})   black cat with golden eyes
   fxS4AshPair(g, p, t, {a, walk, s, dissolve})       two translucent ash silhouettes walking hand in hand (backs to camera)
   fxS4Snowpin(g, x, y, r, col)                       six-point snowflake hairpin glyph (screen space)                      */
'use strict';
const P2s4 = p => (Array.isArray(p) ? project(p) : p);
function s4Ink(g, w, col) { g.lineWidth = w; g.strokeStyle = col || '#1a0a0e'; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
// ------------------------------------------------------------------------------------------------ Bankai doll
function fxS4Doll(g, base, yaw, t, o = {}) {
  if (t < 0) return; if (yaw == null) yaw = Math.atan2(CAM.cur.pos[0] - base[0], CAM.cur.pos[2] - base[2]); const S = o.scale || 6.5, rise = o.rise == null ? 1 : easeOut(clamp(t / o.rise, 0, 1)), fw = [Math.sin(yaw), 0, Math.cos(yaw)], side = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const W3 = (x, y, z) => vAdd(base, vAdd(vMul(side, x * S), vAdd([0, y * S * rise - (1 - rise) * S * .3, 0], vMul(fw, z * S))));
  const head = P2s4(W3(0, 1.0, .04)), neck = P2s4(W3(0, .82, .02)), hip = P2s4(W3(0, .2, -.05)), kn = P2s4(W3(0, 0, .25)); if (!head || !neck || !hip || !kn) return;
  const R = S * .17 * head.s, alpha = (o.alpha == null ? 1 : o.alpha) * clamp(rise * 1.5, 0, 1); const lw = Math.max(2, R * .045);
  const open = o.open || 0, reach = o.reach || 0, tear = o.tear || 0, holes = o.holes || 0;
  g.save(); g.globalAlpha = alpha;
  // back hair mass
  g.beginPath(); g.moveTo(head.x - R * 1.2, head.y + R * 1.6); g.lineTo(head.x - R * 1.18, head.y - R * .2); g.quadraticCurveTo(head.x - R * 1.1, head.y - R * 1.5, head.x, head.y - R * 1.55); g.quadraticCurveTo(head.x + R * 1.1, head.y - R * 1.5, head.x + R * 1.18, head.y - R * .2); g.lineTo(head.x + R * 1.2, head.y + R * 1.6); g.closePath(); g.fillStyle = '#120c12'; g.fill(); s4Ink(g, lw);
  // kneeling body (kimono): shoulders -> wide knees, red with gold flowers, cel shade on the right side
  const shW = R * 1.9, kW = R * 3.4; g.beginPath(); g.moveTo(neck.x - R * .6, neck.y); g.quadraticCurveTo(neck.x - shW, neck.y + R * .25, hip.x - shW * 1.15, hip.y); g.quadraticCurveTo(kn.x - kW, kn.y - R * .2, kn.x - kW * .9, kn.y + R * .25); g.lineTo(kn.x + kW * .9, kn.y + R * .25); g.quadraticCurveTo(kn.x + kW, kn.y - R * .2, hip.x + shW * 1.15, hip.y); g.quadraticCurveTo(neck.x + shW, neck.y + R * .25, neck.x + R * .6, neck.y); g.closePath();
  const body = new Path2D(); body.addPath(new Path2D()); g.fillStyle = '#b8142a'; g.fill(); g.save(); g.clip();
  g.fillStyle = '#7a0a1c'; g.beginPath(); g.moveTo(neck.x + R * .2, neck.y); g.lineTo(kn.x + kW * 1.2, neck.y); g.lineTo(kn.x + kW * 1.2, kn.y + R); g.lineTo(kn.x + R * .6, kn.y + R); g.closePath(); g.fill();
  g.fillStyle = '#e8b83a'; for (let i = 0; i < 26; i++) { const x = kn.x + (hash(i) - .5) * kW * 2, y = lerp(neck.y + R * .4, kn.y, hash(i * 3)), rr = R * (.08 + .05 * hash(i * 5)); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; g.beginPath(); g.ellipse(x + Math.cos(a) * rr, y + Math.sin(a) * rr, rr * .8, rr * .5, a, 0, TAU); g.fill(); } g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(x, y, rr * .35, 0, TAU); g.fill(); g.fillStyle = '#e8b83a'; }
  // obi
  g.fillStyle = '#f2d27a'; g.fillRect(hip.x - shW * 1.3, hip.y - R * .55, shW * 2.6, R * .5); g.fillStyle = '#c89a3a'; g.fillRect(hip.x - shW * 1.3, hip.y - R * .2, shW * 2.6, R * .1);
  // holes (needle punctures) + tears
  if (holes > 0) { for (let i = 0; i < Math.floor(holes * 70); i++) { const x = kn.x + (hash(i * 7 + 1) - .5) * kW * 1.8, y = lerp(neck.y, kn.y, hash(i * 11 + 2)), rr = R * (.05 + .1 * hash(i * 13)); g.fillStyle = '#05040a'; g.beginPath(); g.moveTo(x, y - rr * 1.4); g.lineTo(x + rr * .7, y); g.lineTo(x, y + rr * 1.4); g.lineTo(x - rr * .7, y); g.closePath(); g.fill(); g.strokeStyle = '#bff0ff'; g.lineWidth = Math.max(1, lw * .6); g.stroke(); } }
  g.restore(); g.beginPath(); g.moveTo(neck.x - R * .6, neck.y); g.quadraticCurveTo(neck.x - shW, neck.y + R * .25, hip.x - shW * 1.15, hip.y); g.quadraticCurveTo(kn.x - kW, kn.y - R * .2, kn.x - kW * .9, kn.y + R * .25); g.lineTo(kn.x + kW * .9, kn.y + R * .25); g.quadraticCurveTo(kn.x + kW, kn.y - R * .2, hip.x + shW * 1.15, hip.y); g.quadraticCurveTo(neck.x + shW, neck.y + R * .25, neck.x + R * .6, neck.y); g.closePath(); s4Ink(g, lw * 1.3);
  // white collar V
  g.fillStyle = '#f6efe6'; g.beginPath(); g.moveTo(neck.x - R * .5, neck.y); g.lineTo(neck.x, neck.y + R * 1.3); g.lineTo(neck.x + R * .5, neck.y); g.closePath(); g.fill(); s4Ink(g, lw * .8); g.fillStyle = '#b8142a'; g.beginPath(); g.moveTo(neck.x - R * .28, neck.y); g.lineTo(neck.x, neck.y + R * .8); g.lineTo(neck.x + R * .28, neck.y); g.closePath(); g.fill();
  // face (porcelain), stitched eyes, red lips, blush
  g.fillStyle = '#f6eee6'; g.beginPath(); g.ellipse(head.x, head.y + R * .05, R * .8, R * .98, 0, 0, TAU); g.fill(); g.save(); g.clip(); g.fillStyle = rgba('#d8c0b8', .7); g.beginPath(); g.ellipse(head.x + R * .5, head.y + R * .2, R * .5, R * 1.1, 0, 0, TAU); g.fill(); g.restore(); g.beginPath(); g.ellipse(head.x, head.y + R * .05, R * .8, R * .98, 0, 0, TAU); s4Ink(g, lw);
  g.strokeStyle = '#2a1018'; g.lineWidth = Math.max(2, R * .055); for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(head.x + sg * R * .58, head.y - R * .02); g.quadraticCurveTo(head.x + sg * R * .35, head.y + R * .06, head.x + sg * R * .13, head.y - R * .02); g.stroke(); for (let k = 0; k < 4; k++) { const x = head.x + sg * R * (.18 + k * .12); g.beginPath(); g.moveTo(x, head.y - R * .12); g.lineTo(x + sg * R * .02, head.y + R * .1); g.stroke(); } }
  if (o.eyeGlow) { g.save(); g.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) glow(g, head.x + sg * R * .35, head.y, R * .5, '#ff3a4a', o.eyeGlow); g.restore(); }
  g.fillStyle = '#d0142a'; g.beginPath(); g.moveTo(head.x - R * .16, head.y + R * .55); g.quadraticCurveTo(head.x, head.y + R * .46, head.x + R * .16, head.y + R * .55); g.quadraticCurveTo(head.x, head.y + R * .66, head.x - R * .16, head.y + R * .55); g.fill();
  for (const sg of [-1, 1]) { g.fillStyle = rgba('#ec7a8a', .45); g.beginPath(); g.ellipse(head.x + sg * R * .46, head.y + R * .32, R * .15, R * .08, 0, 0, TAU); g.fill(); }
  // straight bangs + kanzashi (red/gold flowers, dangling strings)
  g.fillStyle = '#120c12'; g.beginPath(); g.moveTo(head.x - R * .9, head.y - R * .25); g.lineTo(head.x - R * .9, head.y - R * 1.0); g.quadraticCurveTo(head.x, head.y - R * 1.42, head.x + R * .9, head.y - R * 1.0); g.lineTo(head.x + R * .9, head.y - R * .25); g.lineTo(head.x - R * .9, head.y - R * .25); g.closePath(); g.fill(); s4Ink(g, lw * .8);
  g.fillStyle = rgba('#5a4a6a', .6); g.fillRect(head.x - R * .7, head.y - R * 1.05, R * .5, R * .07);
  for (const [dx, dy, c] of [[-.95, -1.1, '#d8202a'], [-.7, -1.35, '#f2c84a'], [.95, -1.15, '#d8202a'], [.75, -1.4, '#f6f0e8']]) { const x = head.x + dx * R, y = head.y + dy * R, rr = R * .16; g.fillStyle = c; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * rr * .6, y + Math.sin(a) * rr * .6, rr * .5, 0, TAU); g.fill(); } g.fillStyle = '#f2c84a'; g.beginPath(); g.arc(x, y, rr * .3, 0, TAU); g.fill(); g.strokeStyle = '#f2c84a'; g.lineWidth = Math.max(1, lw * .5); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(t * 2 + dx) * rr, y + R * .9); g.stroke(); }
  // arms: hands rest (together at chest) -> open (temple doors) -> reach (up to the sky)
  for (const sg of [-1, 1]) { if (tear > 0 && sg * (o.tearSide || 1) > 0 && tear > .5) continue; const sh = P2s4(W3(sg * .3, .74, .02));
    const rest = [sg * .08, .55, .32], op = [sg * .78, .58, .3], up = [sg * (.55 + .2 * Math.sin(t * .8 + sg)), 1.55, .5]; let hp3 = vLerp(vLerp(rest, op, open), up, reach);
    if (tear > 0 && sg * (o.tearSide || 1) > 0) hp3 = vAdd(hp3, [sg * tear * .8, -tear * .9, tear * .6]);
    const hd = P2s4(W3(...hp3)); if (!sh || !hd) continue; const el = { x: lerp(sh.x, hd.x, .5) + sg * R * (.8 - reach * .5), y: lerp(sh.y, hd.y, .5) + R * (.3 + reach * .2) };
    // huge sleeve (furisode) hanging from the forearm
    g.fillStyle = '#a8102a'; g.beginPath(); g.moveTo(sh.x, sh.y); const fx2 = lerp(el.x, hd.x, .75), fy2 = lerp(el.y, hd.y, .75); g.lineTo(el.x, el.y); g.lineTo(fx2, fy2); g.quadraticCurveTo(fx2 + sg * R * .3, Math.max(fy2, el.y) + R * 1.6, lerp(el.x, fx2, .5) + sg * R * .5, Math.max(fy2, el.y) + R * 2.3); g.quadraticCurveTo(el.x + sg * R * .3, el.y + R * 1.2, el.x - sg * R * .2, el.y + R * .2); g.lineTo(sh.x - sg * R * .3, sh.y + R * .3); g.closePath(); g.fill(); s4Ink(g, lw);
    g.strokeStyle = '#a8102a'; g.lineWidth = R * .34; g.lineCap = 'round'; g.beginPath(); g.moveTo(sh.x, sh.y); g.quadraticCurveTo(el.x, el.y, hd.x, hd.y); g.stroke();
    g.fillStyle = '#f6eee6'; g.beginPath(); const ha = Math.atan2(hd.y - el.y, hd.x - el.x); g.ellipse(hd.x, hd.y, R * .38, R * .22, ha, 0, TAU); g.fill(); s4Ink(g, lw * .8);
    for (let k = 0; k < 4; k++) { const a = ha + (k - 1.5) * .25; g.beginPath(); g.moveTo(hd.x + Math.cos(ha) * R * .2, hd.y + Math.sin(ha) * R * .2); g.lineTo(hd.x + Math.cos(a) * R * .62, hd.y + Math.sin(a) * R * .62); g.lineWidth = R * .12; g.strokeStyle = '#1a0a0e'; g.stroke(); g.lineWidth = R * .08; g.strokeStyle = '#f6eee6'; g.stroke(); }
    if (o.handOut) o.handOut[sg < 0 ? 'L' : 'R'] = W3(...hp3); }
  // red threads around the doll (ambient)
  if (o.stitch) { g.strokeStyle = rgba('#ff2a3a', .8 * o.stitch); g.lineWidth = Math.max(1, lw * .5); for (let i = 0; i < 10; i++) { const a = hash(i) * TAU + t * .2, rr = R * (2 + 2 * hash(i * 3)); g.beginPath(); g.moveTo(head.x + Math.cos(a) * rr, head.y + R * 2 + Math.sin(a) * rr * .5); g.quadraticCurveTo(head.x, head.y + R * 1.5, head.x + Math.cos(a + 2) * rr * 1.5, head.y + R * 2.5 + Math.sin(a + 2) * rr * .6); g.stroke(); } }
  g.restore();
}
// ------------------------------------------------------------------------------------------------ threads / seam / talisman
function fxS4SkyThreads(g, from, t, o = {}) { const n = o.n || 14, dur = o.dur || .8, cam = CAM.cur;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = from[i % from.length]; const pa = P2s4(a); if (!pa) continue; const u = easeOut(clamp((t - i * .025) / dur, 0, 1)); if (u <= 0) continue;
    const d = vNorm([(hash(i * 3) - .5) * 1.6, .35 + hash(i * 5) * .6, -1]); const pb = project(vAdd(cam.pos, vMul(d, 3000))); if (!pb) continue;
    const mx = lerp(pa.x, pb.x, .5) + (hash(i * 7) - .5) * 400, my = lerp(pa.y, pb.y, .5) - 200 * hash(i * 9); const ex = lerp(pa.x, pb.x, u), ey = lerp(pa.y, pb.y, u);
    const qx = lerp(pa.x, mx, u), qy = lerp(pa.y, my, u);
    g.strokeStyle = rgba('#ff3a4a', .35); g.lineWidth = 7; g.beginPath(); g.moveTo(pa.x, pa.y); g.quadraticCurveTo(qx, qy, ex, ey); g.stroke();
    g.strokeStyle = i % 3 ? '#e8142a' : '#ff8a8a'; g.lineWidth = i % 3 ? 2.5 : 1.5; g.stroke();
    if (u > .05) { g.fillStyle = '#fff0f0'; g.beginPath(); g.arc(ex, ey, 3.5, 0, TAU); g.fill(); } }
  g.restore(); }
function fxS4Seam(g, sx, sy, t, o = {}) { const h = o.h || 700, op = clamp(o.open == null ? t / .8 : o.open, 0, 1); if (op <= 0) return; const w = 6 + op * (o.w || 120);
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, sx, sy, h * .6 * (.5 + op), '#ffd890', .55 * op);
  const gr = g.createLinearGradient(sx - w, 0, sx + w, 0); gr.addColorStop(0, rgba('#ffb060', 0)); gr.addColorStop(.5, rgba('#fffbe8', .95)); gr.addColorStop(1, rgba('#ffb060', 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy - h); g.quadraticCurveTo(sx + w, sy, sx, sy + h * .4); g.quadraticCurveTo(sx - w, sy, sx, sy - h); g.fill(); g.restore();
  g.save(); g.strokeStyle = '#e8142a'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { const y = sy - h + i * h * 1.4 / 14, k = Math.sin((i + .5) / 14 * Math.PI), ww = w * k * .9 + 10; g.beginPath(); g.moveTo(sx - ww - 12, y - 6); g.lineTo(sx + ww + 12, y + 6); g.stroke(); } g.restore(); }
function fxS4Talisman(g, p, t, o = {}) { const q = P2s4(p); if (!q) return; const s = Math.max(14, .12 * (q.s || 300)), lit = o.lit == null ? 1 : o.lit;
  if (lit > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, s * 5 * (1 + .2 * Math.sin(t * 9)), '#ff2a3a', .7 * lit); for (let i = 0; i < 3; i++) { const u = ((t * 1.2 + i / 3) % 1); g.strokeStyle = rgba('#ff4a5a', (1 - u) * .8 * lit); g.lineWidth = 3; g.beginPath(); g.ellipse(q.x, q.y, s * (1 + u * 9), s * (1 + u * 9) * .4, 0, 0, TAU); g.stroke(); } g.restore(); }
  g.save(); g.translate(q.x, q.y); g.rotate(Math.sin(t * 3) * .08); g.fillStyle = mixHex('#efe4c8', '#fff4f0', lit); g.fillRect(-s * .5, -s * 1.4, s, s * 2.8); g.lineWidth = Math.max(1.5, s * .06); g.strokeStyle = '#3a1a10'; g.strokeRect(-s * .5, -s * 1.4, s, s * 2.8);
  g.fillStyle = '#c8101e'; g.font = `900 ${s * .9}px "IPAGothic", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('紅', 0, -s * .3); g.fillRect(-s * .35, s * .5, s * .7, s * .08); g.fillRect(-s * .35, s * .8, s * .7, s * .08); g.restore(); }
// ------------------------------------------------------------------------------------------------ burning in the sun
function fxS4Smoke(g, p, t, o = {}) { const n = o.n || 14, q0 = P2s4(p); if (!q0) return; const sc = (q0.s || 300);
  g.save(); for (let i = 0; i < n; i++) { const life = 1.4 + hash(i * 3), ph = ((t + hash(i) * life) % life) / life; const dx = (hash(i * 5) - .5) * (o.r || .25) + Math.sin(ph * 4 + i) * .08 + ph * (o.wind || .5), dy = ph * (o.h || 1.2);
    const q = project(vAdd(p, [dx, dy, 0])); if (!q) continue; const r = (o.size || .12) * q.s * (.6 + ph * 2.2); if (!isFinite(r) || !isFinite(q.x) || r <= 0) continue; const sa = (1 - ph) * (o.a || .55) * Math.min(1, ph * 6); const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, r); gr.addColorStop(0, rgba(o.col || '#3a3036', sa)); gr.addColorStop(.6, rgba(o.col || '#3a3036', sa * .6)); gr.addColorStop(1, rgba(o.col || '#3a3036', 0)); g.fillStyle = gr; g.fillRect(q.x - r, q.y - r, r * 2, r * 2);
    if (ph < .3) { g.fillStyle = rgba('#ff8a2a', (1 - ph / .3) * .7); g.beginPath(); g.arc(q.x + r * .3, q.y + r * .2, r * .18, 0, TAU); g.fill(); } }
  g.restore(); }
function fxS4BurnFig(g, F, ft, t, o = {}) {
  const { lay, c2, S } = figLayer(g, F, ft, 's4burn'), sc = g.getTransform().a; const amt = clamp(o.amt == null ? .5 : o.amt, 0, 1); let dir = o.dir || [1, 0]; if (o.axis) { const a = project(S.J[o.axis[0]]), b = project(S.J[o.axis[1]]); if (a && b) { const L = Math.hypot(b.x - a.x, b.y - a.y) || 1; dir = [(b.x - a.x) / L, (b.y - a.y) / L]; } }
  const pts = ['head', 'neck', 'abd', 'pelvis', 'handL', 'handR', 'toeL', 'toeR', 'knL', 'knR', 'elL', 'elR'].map(k => project(S.J[k])).filter(Boolean); if (!pts.length) return;
  let mn = 1e9, mx = -1e9; for (const p of pts) { const s = p.x * dir[0] + p.y * dir[1]; mn = Math.min(mn, s); mx = Math.max(mx, s); } const pad = (mx - mn) * .25 + 30; mn -= pad; mx += pad;
  const front = lerp(mn, mx, amt), ex = dir[0] * sc, ey = dir[1] * sc; const cx = (pts[0].x) * sc, cy = pts[0].y * sc;
  c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalCompositeOperation = 'source-atop';
  const gx0 = dir[0] * mn * sc, gy0 = dir[1] * mn * sc, gx1 = dir[0] * mx * sc, gy1 = dir[1] * mx * sc; const gr = c2.createLinearGradient(gx0, gy0, gx1, gy1); const fu = clamp(amt, .001, .999);
  gr.addColorStop(0, rgba('#120808', .92)); gr.addColorStop(Math.max(0, fu - .08), rgba('#1a0a08', .9)); gr.addColorStop(Math.max(0, fu - .03), rgba('#ff5a14', .95)); gr.addColorStop(fu, rgba('#ffd890', .6)); gr.addColorStop(Math.min(1, fu + .05), rgba('#ff8a3a', .0)); gr.addColorStop(1, rgba('#000', 0));
  c2.fillStyle = gr; c2.fillRect(0, 0, lay.width, lay.height);
  // glowing crack lines just ahead of the front
  c2.strokeStyle = rgba('#ffb040', .9); c2.lineWidth = Math.max(1.5, 2.5 * sc);
  for (let i = 0; i < 26; i++) { const p = pts[i % pts.length]; const s = p.x * dir[0] + p.y * dir[1]; if (s > front + 60) continue; let x = p.x * sc + (hash(i * 3) - .5) * 60 * sc, y = p.y * sc + (hash(i * 5) - .5) * 60 * sc; c2.beginPath(); c2.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (hash(i * 7 + k) - .5) * 30 * sc; y += (hash(i * 11 + k) - .5) * 30 * sc; c2.lineTo(x, y); } c2.stroke(); }
  // holes: crumbling away behind the front
  if (o.holes) { c2.globalCompositeOperation = 'destination-out'; const hf = lerp(mn, mx, amt * o.holes); for (let i = 0; i < 260; i++) { const p = pts[i % pts.length]; const x = p.x + (hash(i * 13) - .5) * 160, y = p.y + (hash(i * 17) - .5) * 220; const s = x * dir[0] + y * dir[1]; if (s > hf) continue; const r = (6 + 18 * hash(i * 19)) * sc * ((pts[0].s || 300) / 300) * .6; c2.beginPath(); c2.rect(x * sc - r, y * sc - r * .7, r * 2, r * 1.4); c2.fill(); }
    // erase whole region well behind the hole front
    c2.beginPath(); const L = 6000, bx = dir[0] * (hf - 140) * sc, by = dir[1] * (hf - 140) * sc, nx = -dir[1], ny = dir[0]; c2.moveTo(bx + nx * L, by + ny * L); c2.lineTo(bx - nx * L, by - ny * L); c2.lineTo(bx - nx * L - dir[0] * L, by - ny * L - dir[1] * L); c2.lineTo(bx + nx * L - dir[0] * L, by + ny * L - dir[1] * L); c2.closePath(); c2.fill(); }
  c2.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lay, 0, 0); g.restore();
  if (o.smoke !== false) for (const k of ['head', 'shL', 'shR', 'abd', 'elL', 'handR']) fxS4Smoke(g, S.J[k], t + hash(k.length) * 3, { n: 8, r: .15, h: 1.4, size: .1 * (o.smokeK || 1), a: .45 * Math.min(1, amt * 2 + .2), wind: o.wind == null ? .5 : o.wind });
  if (o.flakes !== false) fxAshDrift(g, S.J.abd, t, { n: Math.floor(60 + amt * 120), r: .5 * S.B.h / 1.8, h: 1.8, wind: 1.2 });
  return S;
}
// ------------------------------------------------------------------------------------------------ Final Form needles
function fxS4Needles(g, c, t, o = {}) { const n = o.n || 160, dur = o.dur || .5, R = o.R || 14, sp = o.spread || 1.2;
  g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const t0 = hash(i * 3) * (o.window || .8), u = (t - t0) / dur; if (u < 0 || u > 1.25) continue;
    const d = vNorm([hash(i * 5) - .5, (hash(i * 7) - .3) * .9, hash(i * 11) - .5]); const tgt = vAdd(c, [(hash(i * 13) - .5) * sp, (hash(i * 17) - .2) * sp * .8, (hash(i * 19) - .5) * sp]);
    const head = vAdd(tgt, vMul(d, R * (1 - easeIn(Math.min(1, u))))), tail = vAdd(head, vMul(d, R * .28)); const a = project(head), b = project(tail); if (!a || !b) continue;
    const fade = u > 1 ? 1 - (u - 1) / .25 : 1; g.strokeStyle = rgba(o.col || '#7fd0ff', .45 * fade); g.lineWidth = Math.max(3, .05 * a.s); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    g.strokeStyle = rgba('#f4fbff', .95 * fade); g.lineWidth = Math.max(1.2, .015 * a.s); g.stroke();
    if (u > .92 && u < 1.15) { glow(g, a.x, a.y, .25 * a.s, '#bff0ff', .5 * fade); } }
  g.restore(); }
// ------------------------------------------------------------------------------------------------ Ninth Form flame dragon
function fxS4Dragon(g, a, b, t, o = {}) {
  const dur = o.dur || 1.6, u = t / dur; if (t < 0 || u > 1) return; const head = o.head == null ? easeOut(clamp(t / (o.travel || .5), 0, 1)) : o.head, R = o.r || 1.1, d = vNorm(vSub(b, a)); let side = vNorm(vCross(d, [0, 1, 0])); if (vLen(side) < .1) side = [1, 0, 0]; const up = vCross(side, d);
  const pts = []; for (let i = 0; i <= 34; i++) { const s = i / 34 * head; const sp = s * 8 - t * 9; pts.push(vAdd(vLerp(a, b, s), vAdd(vMul(side, Math.sin(sp) * R * .9 * (1 - s * .3)), vMul(up, Math.cos(sp * .7) * R * .5)))); }
  const fade = 1 - smooth((u - .7) / .3);
  fireRibbon(g, pts, uu => R * (.25 + .75 * Math.pow(uu, .7)), t, { seed: 31, up: true, alpha: fade, tongues: 44 });
  fireRibbon(g, pts.map(p => vAdd(p, vMul(up, R * .15))), uu => R * .4 * uu, t + .2, { seed: 37, cols: ['#f0601c', '#ffd24a', '#ffffff'], alpha: fade * .9, ink: false, tongues: 14 });
  const hp = pts[pts.length - 1], hb = pts[pts.length - 3], q = project(hp), qb = project(hb); if (!q || !qb) return;
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, R * 3 * q.s, '#ff8a30', .6 * fade); g.restore();
  const dir = q.x >= qb.x ? 1 : -1, ang = Math.atan2(q.y - qb.y, Math.abs(q.x - qb.x)) * .6; g.save(); g.globalAlpha = fade; g.translate(q.x, q.y); g.rotate(ang * dir); s4DragonHead2D(g, 0, 0, R * q.s / 140, dir, null, '#3a0802'); g.restore();
}
// ------------------------------------------------------------------------------------------------ props: hat, fan
function fxS4Hat(g, p, t, o = {}) { const q = P2s4(p); if (!q) return; const r = (o.r || .45) * (q.s || 300), spin = (o.spin || 0), tilt = o.tilt == null ? .45 : o.tilt;
  g.save(); g.translate(q.x, q.y); g.rotate(o.rot || 0); const ry = r * (.25 + .6 * Math.abs(Math.sin(tilt)));
  g.fillStyle = '#a9853f'; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, TAU); g.fill();
  g.fillStyle = '#d9b56e'; g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(-r * .2, -r * .55 * Math.cos(tilt), 0, -r * .62 * Math.cos(tilt)); g.quadraticCurveTo(r * .2, -r * .55 * Math.cos(tilt), r, 0); g.ellipse(0, 0, r, ry, 0, 0, Math.PI); g.closePath(); g.fill();
  g.strokeStyle = rgba('#7a5a2a', .8); g.lineWidth = Math.max(1, r * .02); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI + spin; g.beginPath(); g.moveTo(0, -r * .6 * Math.cos(tilt)); g.lineTo(Math.cos(a) * r, Math.sin(a) * ry * .9); g.stroke(); }
  g.lineWidth = Math.max(2, r * .035); g.strokeStyle = '#3a2410'; g.beginPath(); g.ellipse(0, 0, r, ry, 0, 0, TAU); g.stroke(); g.restore(); }
function fxS4Fan(g, p, t, o = {}) { const q = P2s4(p); if (!q) return; const r = (o.r || .28) * (q.s || 300), open = o.open == null ? 1 : o.open; g.save(); g.translate(q.x, q.y); g.rotate(o.rot || 0); g.scale(1, o.flat || 1);
  const a0 = -HP - open * 1.1, a1 = -HP + open * 1.1; g.fillStyle = '#f2ece0'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a1); g.closePath(); g.fill(); g.fillStyle = '#e8eef0'; g.beginPath(); g.arc(0, 0, r * .35, a0, a1); g.lineTo(0, 0); g.fill();
  g.strokeStyle = '#2a2420'; g.lineWidth = Math.max(1, r * .02); for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); } g.lineWidth = Math.max(1.5, r * .04); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a1); g.closePath(); g.stroke(); g.restore(); }
// ------------------------------------------------------------------------------------------------ cameo: black cat
function fxS4Cat(g, p, t, o = {}) { const q = P2s4(p); if (!q) return; const s = (o.s || .5) * (q.s || 300) / 100, dir = o.dir || 1, pose = o.pose || 'sit', ink = '#050407', body = '#121018';
  g.save(); g.translate(q.x, q.y); g.scale(dir * s, s);
  const rim = o.rim || '#ffd890'; const walk = pose === 'walk' ? t * 7 : 0;
  if (pose === 'sit' || pose === 'nuzzle') {
    const lean = pose === 'nuzzle' ? .35 + .08 * Math.sin(t * 3) : 0;
    // tail curling around the paws
    g.strokeStyle = body; g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(-22, -6); g.bezierCurveTo(-55, 0, -45, 14, -5 + 4 * Math.sin(t * 2), 6); g.stroke();
    g.fillStyle = body; g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-34, -48, -6, -70); g.quadraticCurveTo(14, -62, 16, -30); g.quadraticCurveTo(20, -6, 10, 0); g.closePath(); g.fill();
    g.fillRect(2, -28, 7, 28); g.fillRect(-8, -26, 7, 26);
    g.save(); g.translate(4, -72); g.rotate(lean); const hx = 10 + lean * 18, hy = lean * 10;
    g.beginPath(); g.ellipse(hx, hy, 17, 14, 0, 0, TAU); g.fill(); for (const ex of [-9, 11]) { g.beginPath(); g.moveTo(hx + ex - 7, hy - 8); g.lineTo(hx + ex - 1 + (ex > 0 ? 4 : -2), hy - 27); g.lineTo(hx + ex + 7, hy - 9); g.closePath(); g.fill(); }
    const eyeOpen = o.blinkAt != null && Math.abs(t - o.blinkAt) < .06 ? .15 : (pose === 'nuzzle' ? .35 : 1);
    if (o.look) { for (const ex of [-5, 9]) { g.fillStyle = '#f2c23a'; g.beginPath(); g.ellipse(hx + ex, hy - 1, 4.2, 4.6 * eyeOpen, 0, 0, TAU); g.fill(); g.fillStyle = '#0a0806'; g.beginPath(); g.ellipse(hx + ex, hy - 1, 1, 4 * eyeOpen, 0, 0, TAU); g.fill(); g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(hx + ex - 1.5, hy - 2.5, 1.1 * eyeOpen, 0, TAU); g.fill(); } }
    else { g.fillStyle = '#f2c23a'; g.beginPath(); g.ellipse(hx + 11, hy - 2, 3.4, 3.8 * eyeOpen, 0, 0, TAU); g.fill(); g.fillStyle = '#0a0806'; g.beginPath(); g.ellipse(hx + 11.6, hy - 2, .9, 3.4 * eyeOpen, 0, 0, TAU); g.fill(); }
    g.restore();
  } else { // walk cycle (4 drawings on twos)
    const ph = Math.floor(walk) % 4; g.strokeStyle = body; g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(-30, -38); g.bezierCurveTo(-50, -50, -52, -80, -40 + 4 * Math.sin(t * 4), -86); g.stroke();
    g.fillStyle = body; g.beginPath(); g.ellipse(-4, -36, 30, 12, 0, 0, TAU); g.fill();
    const legs = [[-24, [0, 6, 0, -6][ph]], [-14, [6, 0, -6, 0][ph]], [14, [-6, 0, 6, 0][ph]], [22, [0, -6, 0, 6][ph]]]; g.lineWidth = 6; for (const [x, dx] of legs) { g.beginPath(); g.moveTo(x, -34); g.lineTo(x + dx, 0); g.stroke(); }
    g.beginPath(); g.ellipse(30, -48, 14, 12, 0, 0, TAU); g.fill(); for (const ex of [-6, 6]) { g.beginPath(); g.moveTo(30 + ex - 5, -56); g.lineTo(32 + ex, -72); g.lineTo(30 + ex + 6, -56); g.closePath(); g.fill(); }
    g.fillStyle = '#f2c23a'; g.beginPath(); g.ellipse(38, -50, 3, 3.4, 0, 0, TAU); g.fill(); }
  // warm rim on the sun side
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = rgba(rim, .35); g.fillRect(8, -120, 60, 130);
  g.restore(); }
// ------------------------------------------------------------------------------------------------ cameo: two ash silhouettes walking into the sun
function fxS4Snowpin(g, x, y, r, col) { g.save(); g.translate(x, y); g.strokeStyle = col || '#ffe0ec'; g.lineCap = 'round'; g.lineWidth = Math.max(1, r * .18); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(Math.cos(a) * r * .55, Math.sin(a) * r * .55); g.lineTo(Math.cos(a + sg * .5) * r * .85, Math.sin(a + sg * .5) * r * .85); g.stroke(); } } g.restore(); }
function fxS4AshPair(g, p, t, o = {}) { const q = P2s4(p), qh = P2s4(vAdd(p, [0, 1.75, 0])); if (!q || !qh) return; const Hh = q.y - qh.y, a = o.a == null ? 1 : o.a, wk = (o.walk == null ? 1 : o.walk) * t * 3.2; const dis = o.dissolve || 0;
  const drawPerson = (cx, h, girl, phase) => { const sw = Math.sin(wk + phase) * h * .02, bob = Math.abs(Math.cos(wk + phase)) * h * .012, y0 = q.y - bob;
    const pth = new Path2D(); const w = h * (girl ? .2 : .24);
    // legs (stride) under the robe
    for (const sg of [-1, 1]) { pth.moveTo(cx + sg * w * .25, y0 - h * .45); pth.lineTo(cx + sg * w * .25 + Math.sin(wk + phase + (sg > 0 ? Math.PI : 0)) * h * .06, y0); pth.lineTo(cx + sg * w * .25 + Math.sin(wk + phase + (sg > 0 ? Math.PI : 0)) * h * .06 + h * .03, y0); pth.lineTo(cx + sg * w * .25 + h * .03, y0 - h * .45); pth.closePath(); }
    // robe / yukata body
    pth.moveTo(cx - w * .55 + sw, y0 - h * .82); pth.quadraticCurveTo(cx - w * .62, y0 - h * .45, cx - w * .5, y0 - h * .1); pth.lineTo(cx + w * .5, y0 - h * .1); pth.quadraticCurveTo(cx + w * .62, y0 - h * .45, cx + w * .55 + sw, y0 - h * .82); pth.closePath();
    // head + hair
    pth.moveTo(cx + sw + h * .075, y0 - h * .9); pth.arc(cx + sw, y0 - h * .9, h * .075, 0, TAU);
    if (girl) { pth.moveTo(cx + sw - h * .085, y0 - h * .92); pth.quadraticCurveTo(cx + sw - h * .1, y0 - h * .6, cx + sw - h * .06, y0 - h * .5); pth.lineTo(cx + sw + h * .06, y0 - h * .5); pth.quadraticCurveTo(cx + sw + h * .1, y0 - h * .6, cx + sw + h * .085, y0 - h * .92); pth.closePath(); }
    else { for (let i = 0; i < 6; i++) { const aa = -Math.PI + i / 5 * Math.PI; pth.moveTo(cx + sw + Math.cos(aa) * h * .07, y0 - h * .9 + Math.sin(aa) * h * .07); pth.lineTo(cx + sw + Math.cos(aa) * h * .11, y0 - h * .92 + Math.sin(aa) * h * .11); pth.lineTo(cx + sw + Math.cos(aa + .3) * h * .07, y0 - h * .9 + Math.sin(aa + .3) * h * .07); } }
    // arms (inner arms joined between them)
    return { pth, sw, y0, w }; };
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, q.x, q.y - Hh * .5, Hh * .9, '#ffe0a0', .45 * a); g.restore(); const gap = Hh * .17, A = drawPerson(q.x - gap, Hh, false, 0), B = drawPerson(q.x + gap, Hh * .88, true, 1.4);
  g.save(); g.globalAlpha = a * (1 - dis * .7);
  const fill = g.createLinearGradient(0, q.y - Hh, 0, q.y); fill.addColorStop(0, rgba('#fffaf0', .8)); fill.addColorStop(1, rgba('#ffd8a0', .45));
  for (const P of [A, B]) { g.fillStyle = fill; g.fill(P.pth); g.strokeStyle = rgba('#fffaf0', .85); g.lineWidth = Math.max(1.5, Hh * .006); g.stroke(P.pth); }
  // joined hands
  g.strokeStyle = rgba('#fff4e0', .7); g.lineWidth = Math.max(3, Hh * .03); g.lineCap = 'round'; g.beginPath(); g.moveTo(q.x - gap + A.w * .5, q.y - Hh * .72); g.quadraticCurveTo(q.x, q.y - Hh * .5, q.x + gap - B.w * .5, q.y - Hh * .66); g.stroke();
  // snowflake hairpin on the girl
  fxS4Snowpin(g, q.x + gap + B.sw + Hh * .88 * .07, q.y - Hh * .88 * .95, Hh * .035, '#ffe8f2');
  g.restore();
  // ash particles streaming off them (more when dissolving)
  g.save(); for (let i = 0; i < 120; i++) { const ph = (t * .6 + hash(i)) % 1, x = q.x + (hash(i * 3) - .5) * gap * 3.2 + ph * Hh * (.3 + .4 * hash(i * 5)) * (o.wind || 1), y = q.y - Hh * hash(i * 7) - ph * Hh * .4; g.fillStyle = rgba(i % 3 ? '#fff0d8' : '#d8c8b0', (1 - ph) * a * (.5 + dis)); const r = Math.max(1, Hh * .006 * (1 + hash(i * 9))); g.fillRect(x, y, r * 2, r); } g.restore(); }
// ------------------------------------------------------------------------------------------------ flame tsuba close-up (screen space, hand-painted)
function fxS4Tsuba(g, t, o = {}) { const cx = o.x == null ? W * .5 : o.x, cy = o.y == null ? H * .5 : o.y, R = o.r || 330, rot = o.rot || -.18, light = o.light == null ? 1 : o.light;
  g.save(); g.translate(cx, cy); g.rotate(rot);
  // blade going up-right (gleaming), handle down-left (wrap diamonds)
  g.fillStyle = '#c8ccd6'; g.beginPath(); g.moveTo(-R * .12, -R * .3); g.lineTo(R * 3.2, -R * 1.6); g.lineTo(R * 3.2, -R * 1.25); g.lineTo(R * .12, R * .05); g.closePath(); g.fill();
  g.fillStyle = '#e83a1a'; g.beginPath(); g.moveTo(R * .1, -R * .2); g.lineTo(R * 3.2, -R * 1.45); g.lineTo(R * 3.2, -R * 1.38); g.lineTo(R * .12, -R * .1); g.closePath(); g.fill(); // red blade (nichirin)
  g.save(); g.globalCompositeOperation = 'screen'; const gx = (t * .6 % 1) * R * 3; const gr = g.createLinearGradient(gx - 80, 0, gx + 80, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, rgba('#fff6d8', .9 * light)); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-R * .12, -R * .3); g.lineTo(R * 3.2, -R * 1.6); g.lineTo(R * 3.2, -R * 1.25); g.lineTo(R * .12, R * .05); g.closePath(); g.fill(); g.restore();
  g.fillStyle = '#1a1418'; g.beginPath(); g.moveTo(-R * .18, R * .05); g.lineTo(-R * 2.8, R * 1.5); g.lineTo(-R * 2.65, R * 1.75); g.lineTo(-R * .05, R * .3); g.closePath(); g.fill();
  g.fillStyle = '#f2efe6'; for (let i = 0; i < 7; i++) { const u = .12 + i * .12, x = lerp(-R * .1, -R * 2.7, u), y = lerp(R * .17, R * 1.62, u); g.beginPath(); g.moveTo(x - R * .09, y - R * .05); g.lineTo(x, y - R * .1); g.lineTo(x + R * .09, y + R * .05); g.lineTo(x, y + R * .1); g.closePath(); g.fill(); }
  // flame guard: ring of flame tongues (gold-red), seen at 3/4
  g.save(); g.scale(1, .82); const n = 12;
  g.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? R * .78 : R * (1.0 + .08 * Math.sin(i * 1.7)); const tw = i % 2 ? 0 : .12; const x = Math.cos(a + tw) * rr, y = Math.sin(a + tw) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath();
  const fg = g.createRadialGradient(-R * .3, -R * .4, R * .1, 0, 0, R * 1.1); fg.addColorStop(0, '#ffe08a'); fg.addColorStop(.55, '#e8781a'); fg.addColorStop(1, '#8a1408'); g.fillStyle = fg; g.fill(); g.lineWidth = 7; g.strokeStyle = '#2a0802'; g.stroke();
  g.lineWidth = 3; g.strokeStyle = rgba('#5a1004', .8); for (let i = 0; i < n; i++) { const a = (i + .5) / n * TAU; g.beginPath(); g.moveTo(Math.cos(a) * R * .42, Math.sin(a) * R * .42); g.quadraticCurveTo(Math.cos(a + .2) * R * .7, Math.sin(a + .2) * R * .7, Math.cos(a + .1) * R * .95, Math.sin(a + .1) * R * .95); g.stroke(); }
  g.fillStyle = '#3a1406'; g.beginPath(); g.ellipse(0, 0, R * .3, R * .22, -.5, 0, TAU); g.fill(); g.fillStyle = '#c89a3a'; g.beginPath(); g.ellipse(0, 0, R * .22, R * .15, -.5, 0, TAU); g.fill();
  // morning light: specular on the upper-left flame edges
  g.save(); g.globalCompositeOperation = 'screen'; g.strokeStyle = rgba('#fff6d0', .85 * light); g.lineWidth = 6; for (let i = 0; i < 5; i++) { const a = Math.PI + .3 + i * .3; g.beginPath(); g.arc(0, 0, R * .9, a, a + .16); g.stroke(); } glow(g, -R * .55, -R * .55, R * .5, '#fff2c0', .5 * light); g.restore();
  g.restore(); g.restore(); }
// rounded boulder (cel-shaded, inked) standing on the ground at c, radius r (m)
function fxS4Boulder(g, c, r, t, o = {}) { const q = project(vAdd(c, [0, r * .7, 0])), b = project(c); if (!q || !b) return; const R = r * q.s, lit = o.lit || '#8a7a72', sh = o.shade || '#3a3036';
  const pth = new Path2D(); for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI, k = .85 + .15 * hash(i * 7 + 3); pth.lineTo(q.x + Math.cos(a) * R * 1.25 * k, q.y + Math.sin(a) * R * .85 * k); } pth.lineTo(q.x + R * 1.3, b.y); pth.lineTo(q.x - R * 1.3, b.y); pth.closePath();
  g.save(); g.fillStyle = sh; g.fill(pth); g.clip(pth); g.fillStyle = lit; g.beginPath(); g.ellipse(q.x - R * .35, q.y - R * .35, R * 1.0, R * .6, -.2, 0, TAU); g.fill(); g.fillStyle = rgba(o.rim || '#ffd8a0', .5); g.beginPath(); g.ellipse(q.x - R * .2, q.y - R * .75, R * .9, R * .18, -.1, 0, TAU); g.fill();
  g.strokeStyle = rgba('#1a1014', .5); g.lineWidth = Math.max(1.5, R * .02); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(q.x + (hash(i) - .5) * R * 1.6, q.y - R * .4 + i * R * .25); g.lineTo(q.x + (hash(i * 3) - .5) * R * 1.6, q.y - R * .2 + i * R * .25); g.stroke(); } g.restore();
  g.lineWidth = Math.max(2, R * .03); g.strokeStyle = '#1a1014'; g.stroke(pth); }
