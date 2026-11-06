/* engine/fx_gow.js (agent E, gowther-dazai-urahara) - GOWTHER effects: Invasion (memory reading / rewriting), Twin Bow Herritt light arrows,
   Harlequin marionettes + puppet army, mind threads, falling emotion flakes, and whole-image (screen) processes.
   All effects take the effect's OWN time t (pass lt - start) and draw nothing before 0 / after their duration.
   Positions: world [x,y,z] (projected, sized by depth) or screen {x,y} (1920x1080 units).
   SCREEN PROCESSES (register on the frame builder; run after grade, before impact; combine freely; sadNullify works on them too):
     gowInvasion(f, t, o)       the picture is being 'read': o.glitch 0..1 (RGB-split slices), o.pixel 0..1 (block mosaic), o.mirror 0..1 (image flips
                                left-right; .5 = mirrored half with a seam), o.hue (deg), o.tint (css colour wash), o.scan 0..1 scanlines, o.seed
     gowTVNoise(f, t, o)        analog TV static: o.a 0..1, o.roll (rolling bar), o.sat (0 = b/w), o.lines
     gowMemoryCollapse(f, t, o) the image breaks into rectangular memory 'photographs' that tilt and fly off (o.at focus, o.dur, o.hold, o.up = fall upward,
                                o.reveal 'void'|'white'|css), o.cols/o.rows grid
     gowTimeStop(f, t, o)       'time stops': colour drains to a cool lavender monochrome (o.k 0..1 or eased by t/o.dur), frozen grain, faint clock dial
                                rings + a ticking second hand at o.at, o.keep = {at, r} circle that stays in colour
     gowNightmare(f, t, o)      Nightmare Teller: red/black duotone, crawling vignette veins, o.k 0..1
     gowPixelate(f, t, o)       pure mosaic dissolve o.k 0..1 (block size grows), o.at keeps a sharp circle (o.r)
   WORLD / OVERLAY EFFECTS (inside f.fx(g => ...)):
     fxLightArrow(g, a, b, t, o)        one Herritt light arrow a -> b (o.dur, o.col, o.w, o.hit sparkle) ; fxArrowVolley(g, src, t, o) many arrows (o.n, o.dir|o.targets, o.spread, o.len)
     fxSearchlight(g, a, b, t, o)       thin finger arrow + reading rings on the target ; fxBroadcast(g, src, pts, t, o) zig-zag thought beam through pts
     fxInvasionPulse(g, p, t, o)        glitchy rings + pixel squares + 侵入 around a head while a mind is read
     fxMemoryShards(g, c, t, o)         translucent memory pictures orbiting / floating around c (o.n, o.r, o.speed, o.size, o.seed, o.alpha, o.pull 0..1 -> sucked in)
     fxMemoryStream(g, t, o)            screen-space memories rushing toward the camera from o.x,o.y (o.n, o.speed)
     fxEmotionFlakes(g, t, o)           falling luminous flakes (some carry tiny memory images) over the screen (o.n, o.col, o.wind) or around o.c (world)
     fxMindThreads(g, a, b, t, o)       glowing threads a -> b (o.n, o.sag, o.col) with travelling pulses
     fxMarionetteStrings(g, F, ft, ctrl, t, o)   strings from a cross control bar at ctrl (world) to F's wrists / head / knees (o.joints, o.bar:false)
     drawHarlequin(g, p, o)             one Harlequin marionette (2D painted at a world/screen point): o.size (m), o.t, o.col/o.col2, o.swing, o.face 'tear'|'smile'|'blank'
     fxPuppetArmy(g, c, t, o)           rows of Harlequin marionettes hanging on strings from above (o.n, o.rows, o.r, o.spacing, o.drop 0..1 descend, o.dance)
     fxBlackout(g, c, t, o)             Blackout: a dark dome with violet rim expands and swallows the light (o.r, o.dur)
     fxKaleidoscope(g, F, ft, t, o)     Kaleidoscope: illusion copies of F around it (o.n, o.r px, o.alpha, o.col tint)
     fxGlassesGlint(g, F, ft, t, o)     star glint on Gowther's glasses
     fxPlayback(g, c, t, o)             Playback: a floating translucent screen showing a memory picture (o.w, o.h metres, o.seed)
   Memory pictures: gowMemPic(seed, kind) -> cached canvas (kinds: 'field' 'tavern' 'castle' 'night' 'flower' 'portrait' 'rain' 'sea').        */
'use strict';
const GOWFX = { pink: '#ff7ad8', violet: '#c86bff', deep: '#3a0a48', core: '#fff4ff', mem: '#ffe2f4', blue: '#9ad8ff' };
const gowQ = p => (Array.isArray(p) ? project(p) : (p ? { x: p.x, y: p.y, s: p.s || 100 } : null));
function gowCopy(c, name = 'gowTmp') { const t = layer(name), g = t.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, t.width, t.height); g.drawImage(c, 0, 0); return t; }

// ======================================================================================================== memory pictures (painted, cached)
const GOW_MEMPIC = {};
const GOW_MEMKINDS = ['field', 'tavern', 'castle', 'night', 'flower', 'portrait', 'rain', 'sea'];
function gowMemPic(seed, kind) {
  kind = kind || GOW_MEMKINDS[Math.abs(seed) % GOW_MEMKINDS.length]; const key = kind + seed; if (GOW_MEMPIC[key]) return GOW_MEMPIC[key];
  const w = 240, h = 160, c = mkCanvas(w, h), g = c.getContext('2d'), r = rng(seed * 7 + 3);
  const sky = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
  const hill = (y, col, amp) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 12) g.lineTo(x, y + Math.sin(x * .03 + seed) * amp + r() * 4); g.lineTo(w, h); g.fill(); };
  const person = (x, y, s, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y - s * 1.6, s * .32, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - s * .35, y - s * 1.25); g.quadraticCurveTo(x, y - s * 1.4, x + s * .35, y - s * 1.25); g.lineTo(x + s * .45, y); g.lineTo(x - s * .45, y); g.fill(); };
  if (kind === 'field') { sky('#ffd9a8', '#ff9fb8'); g.fillStyle = 'rgba(255,250,220,.9)'; g.beginPath(); g.arc(w * .7, h * .45, 18, 0, TAU); g.fill(); hill(h * .62, '#8a6a9a', 6); hill(h * .74, '#5a4a7a', 4); person(w * .35, h * .8, 22, '#2a1a3a'); person(w * .44, h * .8, 18, '#2a1a3a'); }
  else if (kind === 'tavern') { sky('#4a2a1a', '#8a5a2a'); g.fillStyle = '#ffcf7a'; for (let i = 0; i < 3; i++) { g.fillRect(30 + i * 70, 40, 40, 50); } g.fillStyle = '#2a160c'; g.fillRect(0, 110, w, 50); person(70, 140, 20, '#1a0c06'); person(150, 140, 24, '#1a0c06'); g.fillStyle = 'rgba(255,200,120,.35)'; g.fillRect(0, 0, w, h); }
  else if (kind === 'castle') { sky('#9ad0ff', '#e8f4ff'); g.fillStyle = '#6a7a9a'; g.fillRect(70, 60, 100, 70); for (const x of [60, 110, 160]) { g.fillRect(x, 35, 22, 95); g.beginPath(); g.moveTo(x - 4, 35); g.lineTo(x + 11, 12); g.lineTo(x + 26, 35); g.fill(); } hill(h * .8, '#5a8a5a', 3); }
  else if (kind === 'night') { sky('#0e1030', '#3a2a5a'); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(r() * w, r() * h * .6, 1.5, 1.5); g.fillStyle = '#f8f0d0'; g.beginPath(); g.arc(w * .25, h * .3, 16, 0, TAU); g.fill(); hill(h * .75, '#141028', 5); person(w * .62, h * .8, 20, '#06040c'); }
  else if (kind === 'flower') { sky('#ffe8f0', '#ffc8dc'); for (let i = 0; i < 9; i++) { const x = 20 + r() * 200, y = 60 + r() * 90, s = 8 + r() * 14; g.fillStyle = ['#ff7aa8', '#ffd04a', '#c86bff'][i % 3]; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.ellipse(x + Math.cos(a) * s * .6, y + Math.sin(a) * s * .6, s * .5, s * .32, a, 0, TAU); g.fill(); } g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(x, y, s * .3, 0, TAU); g.fill(); } }
  else if (kind === 'portrait') { sky('#f8e8d8', '#e0c8c0'); g.fillStyle = '#3a2430'; g.beginPath(); g.ellipse(w * .5, h * .55, 46, 56, 0, 0, TAU); g.fill(); g.fillStyle = '#f6dcc8'; g.beginPath(); g.ellipse(w * .5, h * .6, 34, 42, 0, 0, TAU); g.fill(); g.fillStyle = '#3a2430'; g.fillRect(w * .5 - 36, h * .32, 72, 22); g.fillStyle = '#2a1a22'; g.fillRect(w * .5 - 18, h * .58, 9, 3); g.fillRect(w * .5 + 9, h * .58, 9, 3); g.fillStyle = '#c8607a'; g.fillRect(w * .5 - 6, h * .76, 12, 2); }
  else if (kind === 'rain') { sky('#5a6a7a', '#8a9aa8'); g.strokeStyle = 'rgba(220,235,255,.55)'; g.lineWidth = 1; for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 12); g.stroke(); } hill(h * .82, '#3a4250', 2); person(w * .5, h * .9, 26, '#1a2028'); g.fillStyle = '#1a2028'; g.beginPath(); g.arc(w * .5, h * .9 - 46, 26, Math.PI, 0); g.fill(); }
  else { sky('#8ad0e8', '#f0f8ff'); g.fillStyle = '#3a8ab0'; g.fillRect(0, h * .55, w, h * .45); g.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 12; i++) g.fillRect(r() * w, h * .58 + r() * 60, 18, 2); person(w * .3, h * .95, 22, '#1a2a3a'); }
  // soft memory haze: vignette + light leak + paper grain
  const vg = g.createRadialGradient(w / 2, h / 2, h * .2, w / 2, h / 2, w * .62); vg.addColorStop(0, 'rgba(255,240,250,0)'); vg.addColorStop(1, 'rgba(255,230,245,.75)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 300; i++) g.fillRect(r() * w, r() * h, 1, 1);
  return (GOW_MEMPIC[key] = c);
}
// one memory card in screen space: centred at (x, y), width w px, rotation rot, alpha a; white photo border + soft glow + flicker
function gowMemCard(g, x, y, w, rot, a, seed, o = {}) {
  if (a <= 0 || w < 2) return; const pic = gowMemPic(seed, o.kind), h = w * .66; g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
  if (o.glow !== false) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, w * .8, o.glowCol || GOWFX.pink, .25 * a); g.restore(); }
  const b = Math.max(1.5, w * .035); g.fillStyle = rgba('#fff6fb', .85); g.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b);
  g.drawImage(pic, -w / 2, -h / 2, w, h);
  if (o.glitch) { const n = 3; for (let i = 0; i < n; i++) { const yy = -h / 2 + hash(seed * 5 + i + Math.floor((o.t || 0) * 12)) * h, hh = h * .08, dx = (hash(i * 9 + seed) - .5) * w * .25 * o.glitch; g.drawImage(pic, 0, (yy + h / 2) / h * pic.height, pic.width, hh / h * pic.height, -w / 2 + dx, yy, w, hh); } }
  g.globalAlpha = a * .9; g.lineWidth = Math.max(1, w * .012); g.strokeStyle = rgba('#5a2a5a', .6); g.strokeRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b);
  g.restore();
}

// ======================================================================================================== SCREEN PROCESSES
function gowInvasion(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const w = c.width, h = c.height, sc = OUT.scale, gg = c.getContext('2d'), seed = (o.seed || 3) + Math.floor(t * (o.rate || 12));
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0);
    const mir = o.mirror || 0; if (mir > 0) { const src = gowCopy(c); if (mir >= .99) { gg.setTransform(-1, 0, 0, 1, w, 0); gg.drawImage(src, 0, 0); gg.setTransform(1, 0, 0, 1, 0, 0); }
      else { const x0 = w * (1 - mir); gg.save(); gg.beginPath(); gg.rect(x0, 0, w - x0, h); gg.clip(); gg.setTransform(-1, 0, 0, 1, 2 * x0, 0); gg.drawImage(src, 0, 0); gg.restore(); gg.fillStyle = 'rgba(255,255,255,.85)'; gg.fillRect(x0 - 2 * sc, 0, 4 * sc, h); } }
    if (o.hue) { const src = gowCopy(c); gg.filter = `hue-rotate(${o.hue}deg) saturate(${o.sat == null ? 1.2 : o.sat})`; gg.drawImage(src, 0, 0); gg.filter = 'none'; }
    const px = o.pixel || 0; if (px > 0) { const bs = Math.max(2, Math.round((4 + px * 44) * sc)), sw = Math.ceil(w / bs), sh = Math.ceil(h / bs), sm = layer('gowSmall'), sg = sm.getContext('2d'); sg.setTransform(1, 0, 0, 1, 0, 0); sg.imageSmoothingEnabled = true; sg.clearRect(0, 0, sm.width, sm.height); sg.drawImage(c, 0, 0, sw, sh);
      gg.imageSmoothingEnabled = false; if (o.pixelMask) { gg.save(); gg.beginPath(); for (let i = 0; i < 26; i++) { const r2 = rng(seed + i); gg.rect(r2() * w, r2() * h, (.05 + r2() * .25) * w, (.03 + r2() * .1) * h); } gg.clip(); gg.drawImage(sm, 0, 0, sw, sh, 0, 0, sw * bs, sh * bs); gg.restore(); } else gg.drawImage(sm, 0, 0, sw, sh, 0, 0, sw * bs, sh * bs); gg.imageSmoothingEnabled = true; }
    const gl = o.glitch || 0; if (gl > 0) { const src = gowCopy(c), r = rng(seed), n = Math.round(4 + gl * 14);
      for (let i = 0; i < n; i++) { const y = r() * h, hh = (2 + r() * 40 * gl) * sc, dx = (r() - .5) * 160 * gl * sc; gg.drawImage(src, 0, y, w, hh, dx, y, w, hh); if (r() < .5) { gg.save(); gg.globalCompositeOperation = 'lighter'; gg.globalAlpha = .35 * gl; gg.fillStyle = r() < .5 ? '#ff2a8a' : '#2ad8ff'; gg.fillRect(0, y, w, hh * .4); gg.restore(); } }
      // RGB channel split (red right, cyan left)
      const d = (6 + 18 * gl) * sc; gg.save(); gg.globalCompositeOperation = 'screen'; gg.globalAlpha = .55 * gl; gg.filter = 'sepia(1) saturate(6) hue-rotate(-50deg) brightness(.7)'; gg.drawImage(src, d, 0); gg.filter = 'sepia(1) saturate(6) hue-rotate(150deg) brightness(.7)'; gg.drawImage(src, -d, 0); gg.restore(); gg.filter = 'none';
      // a few blocks displaced (data-mosh squares)
      for (let i = 0; i < 4 + gl * 6; i++) { const bw = (40 + r() * 160) * sc, bh = (20 + r() * 70) * sc, x = r() * w, y = r() * h; gg.drawImage(src, x, y, bw, bh, x + (r() - .5) * 90 * sc, y + (r() - .5) * 30 * sc, bw, bh); } }
    if (o.tint) { gg.globalCompositeOperation = 'soft-light'; gg.globalAlpha = o.tintK == null ? .45 : o.tintK; gg.fillStyle = o.tint; gg.fillRect(0, 0, w, h); gg.globalCompositeOperation = 'source-over'; gg.globalAlpha = 1; }
    const scn = o.scan || 0; if (scn > 0) { gg.fillStyle = `rgba(10,0,20,${.18 * scn})`; const st = Math.max(2, Math.round(3 * sc)); for (let y = (Math.floor(t * 60) % st); y < h; y += st * 2) gg.fillRect(0, y, w, Math.max(1, st * .6)); }
    gg.restore();
  });
}
const GOW_NOISE = {};
function gowNoiseTile(i) { if (GOW_NOISE[i]) return GOW_NOISE[i]; const s = 256, c = mkCanvas(s, s), g = c.getContext('2d'), d = g.createImageData(s, s), r = rng(i * 31 + 7); for (let k = 0; k < s * s; k++) { const v = r() * 255; d.data[k * 4] = v; d.data[k * 4 + 1] = v; d.data[k * 4 + 2] = v; d.data[k * 4 + 3] = 255; } g.putImageData(d, 0, 0); return (GOW_NOISE[i] = c); }
function gowTVNoise(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const a = o.a == null ? .5 : o.a, w = c.width, h = c.height, gg = c.getContext('2d'), tile = gowNoiseTile(Math.floor(t * 24) % 6);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0);
    if (o.sat != null && o.sat < 1) { const src = gowCopy(c); gg.filter = `saturate(${o.sat}) contrast(1.15)`; gg.drawImage(src, 0, 0); gg.filter = 'none'; }
    gg.globalAlpha = a; gg.globalCompositeOperation = 'overlay'; const ts = 256 * Math.max(1, OUT.scale * 1.4); for (let y = 0; y < h; y += ts) for (let x = 0; x < w; x += ts) gg.drawImage(tile, x, y, ts, ts);
    gg.globalCompositeOperation = 'source-over'; gg.globalAlpha = a * .35; for (let y = 0; y < h; y += ts) for (let x = 0; x < w; x += ts) gg.drawImage(tile, x, y, ts, ts);
    if (o.roll !== false) { const y = ((t * (o.rollSpeed || .6)) % 1.2 - .1) * h; const gr = gg.createLinearGradient(0, y - h * .08, 0, y + h * .08); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.22 * a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); gg.globalAlpha = 1; gg.fillStyle = gr; gg.fillRect(0, y - h * .08, w, h * .16); }
    if (o.lines !== false) { gg.globalAlpha = .25 * a; gg.fillStyle = '#000'; const st = Math.max(2, Math.round(3 * OUT.scale)); for (let y = 0; y < h; y += st * 2) gg.fillRect(0, y, w, st * .5); }
    gg.restore();
  });
}
const GOW_CARDS = {};
function gowMemoryCollapse(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const focus = o.at ? (gowQ(o.at) || { x: W / 2, y: H / 2 }) : { x: o.x == null ? W / 2 : o.x, y: o.y == null ? H / 2 : o.y };
    const cols = o.cols || 9, rows = o.rows || 6, cw = W / cols, ch = H / rows, src = gowCopy(c), sc = OUT.scale, gg = c.getContext('2d');
    const br = o.break != null ? o.break : clamp((t - (o.hold || .15)) / (o.dur || 1.1), 0, 1);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); const rv = o.reveal || 'void';
    const gr = gg.createRadialGradient(focus.x * sc, focus.y * sc, 0, focus.x * sc, focus.y * sc, c.width * .8); gr.addColorStop(0, rv === 'white' ? '#ffffff' : rv === 'void' ? '#5a2a7a' : rv); gr.addColorStop(1, rv === 'white' ? '#f0e4f4' : rv === 'void' ? '#08040e' : rv); gg.fillStyle = gr; gg.fillRect(0, 0, c.width, c.height); gg.restore();
    const cards = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = (i + .5) * cw, y = (j + .5) * ch, d = Math.hypot(x - focus.x, y - focus.y) / 1300, hh = hash(i * 17 + j * 31 + (o.seed || 1)); cards.push({ x, y, d, hh, i, j }); }
    cards.sort((a, b) => b.d - a.d);
    for (const k of cards) { const go = clamp((br - k.d * .55) / .45, 0, 1), e = go * go; if (go >= 1) continue;
      const dirx = (k.x - focus.x) / 1300, diry = (k.y - focus.y) / 1300, up = o.up ? -1 : 1;
      const dx = dirx * 600 * e + (k.hh - .5) * 200 * e, dy = diry * 300 * e + up * 700 * e * e, rot = (k.hh - .5) * 1.4 * e, s = 1 - .45 * e + .12 * Math.sin(go * Math.PI);
      g.save(); g.translate(k.x + dx, k.y + dy); g.rotate(rot); g.scale(s, s); const b = 5 * (go > 0 ? 1 : 0);
      if (go > 0) { g.fillStyle = 'rgba(255,248,252,.95)'; g.fillRect(-cw / 2 - b, -ch / 2 - b, cw + 2 * b, ch + 2 * b); }
      g.beginPath(); g.rect(-cw / 2, -ch / 2, cw, ch); g.clip(); g.drawImage(src, (k.x - cw / 2) * sc, (k.y - ch / 2) * sc, cw * sc, ch * sc, -cw / 2, -ch / 2, cw, ch);
      if (go > 0) { g.fillStyle = rgba(k.hh > .5 ? '#ffe2f4' : '#d8c8ff', .25 * go + .1); g.fillRect(-cw / 2, -ch / 2, cw, ch); if (k.hh > .7) { g.globalAlpha = go * .8; g.drawImage(gowMemPic(k.i * 7 + k.j), -cw / 2, -ch / 2, cw, ch); g.globalAlpha = 1; } }
      g.restore();
      if (go > 0 && go < 1) { g.save(); g.translate(k.x + dx, k.y + dy); g.rotate(rot); g.scale(s, s); g.lineWidth = 2; g.strokeStyle = 'rgba(90,40,90,.6)'; g.strokeRect(-cw / 2 - b, -ch / 2 - b, cw + 2 * b, ch + 2 * b); g.restore(); }
    }
  });
}
function gowTimeStop(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const k = o.k != null ? o.k : easeOut(clamp(t / (o.dur || .35), 0, 1)), w = c.width, h = c.height, sc = OUT.scale, gg = c.getContext('2d'); if (k <= 0) return;
    const keep = o.keep ? gowCopy(c, 'gowKeep') : null;
    const src = gowCopy(c); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.filter = 'grayscale(1) contrast(1.12) brightness(1.04)'; gg.drawImage(src, 0, 0); gg.filter = 'none';
    gg.globalCompositeOperation = 'multiply'; gg.fillStyle = o.col || '#d4c8ec'; gg.fillRect(0, 0, w, h); gg.globalCompositeOperation = 'source-over'; gg.globalAlpha = 1;
    if (keep) { const q = gowQ(o.keep.at) || { x: W / 2, y: H / 2 }, r = (o.keep.r || 220) * sc; gg.save(); gg.beginPath(); gg.arc(q.x * sc, q.y * sc, r, 0, TAU); gg.clip(); gg.drawImage(keep, 0, 0); gg.restore(); }
    gg.restore();
    const q = o.at ? (gowQ(o.at) || { x: W / 2, y: H / 2 }) : { x: W / 2, y: H / 2 };
    g.save(); g.globalAlpha = .55 * k; g.strokeStyle = '#ffffff'; g.lineWidth = 2; for (const R of [260, 420, 640]) { g.beginPath(); g.arc(q.x, q.y, R, 0, TAU); g.stroke(); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, R = 420, L = i % 5 ? 10 : 26; g.lineWidth = i % 5 ? 1.5 : 3; g.beginPath(); g.moveTo(q.x + Math.cos(a) * R, q.y + Math.sin(a) * R); g.lineTo(q.x + Math.cos(a) * (R - L), q.y + Math.sin(a) * (R - L)); g.stroke(); }
    const sec = Math.floor((o.tick == null ? t : o.tick) * (o.ticks || 1)) / 60 * TAU - HP; g.lineWidth = 4; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + Math.cos(sec) * 400, q.y + Math.sin(sec) * 400); g.stroke();
    g.globalAlpha = .9 * k; g.fillStyle = '#fff'; g.beginPath(); g.arc(q.x, q.y, 7, 0, TAU); g.fill(); g.restore();
  });
}
function gowNightmare(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const k = o.k != null ? o.k : clamp(t / .25, 0, 1), w = c.width, h = c.height, gg = c.getContext('2d'), src = gowCopy(c);
    gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalAlpha = k; gg.filter = 'grayscale(1) contrast(1.8) brightness(.9)'; gg.drawImage(src, 0, 0); gg.filter = 'none';
    gg.globalCompositeOperation = 'multiply'; gg.fillStyle = o.col || '#d8102a'; gg.fillRect(0, 0, w, h); gg.globalCompositeOperation = 'source-over'; gg.restore();
    g.save(); g.globalAlpha = k; g.strokeStyle = '#0a0004'; g.lineCap = 'round'; const r = rng(o.seed || 9); for (let i = 0; i < 22; i++) { const side = i % 4, L = 120 + r() * 260; let x = side === 0 ? 0 : side === 1 ? W : r() * W, y = side === 2 ? 0 : side === 3 ? H : r() * H; const a0 = Math.atan2(H / 2 - y, W / 2 - x); g.lineWidth = 6 + r() * 10; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { const a = a0 + (r() - .5) * 1.2; x += Math.cos(a) * L / 6 * (1 + .3 * Math.sin(t * 3 + i)); y += Math.sin(a) * L / 6; g.lineTo(x, y); g.lineWidth *= .8; } g.stroke(); }
    const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .9); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
  });
}
function gowPixelate(f, t, o = {}) {
  if (t < 0) return; f.screen((c, g) => {
    const k = o.k != null ? o.k : clamp(t / (o.dur || .6), 0, 1); if (k <= 0) return; const w = c.width, h = c.height, sc = OUT.scale, gg = c.getContext('2d');
    const keep = o.at ? gowCopy(c, 'gowKeep') : null, bs = Math.max(2, Math.round((3 + k * k * 90) * sc)), sw = Math.ceil(w / bs), sh = Math.ceil(h / bs), sm = layer('gowSmall'), sg = sm.getContext('2d');
    sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sm.width, sm.height); sg.drawImage(c, 0, 0, sw, sh); gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.imageSmoothingEnabled = false; gg.drawImage(sm, 0, 0, sw, sh, 0, 0, sw * bs, sh * bs); gg.imageSmoothingEnabled = true;
    if (keep) { const q = gowQ(o.at) || { x: W / 2, y: H / 2 }; gg.beginPath(); gg.arc(q.x * sc, q.y * sc, (o.r || 260) * sc, 0, TAU); gg.clip(); gg.drawImage(keep, 0, 0); } gg.restore();
  });
}

// ======================================================================================================== HERRITT: light arrows
function gowArrow2D(g, a, b, w, col, alpha) { // a = tail, b = head (screen); glowing shaft + diamond head
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(col, .35 * alpha); g.lineWidth = w * 4; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = rgba(col, .8 * alpha); g.lineWidth = w * 1.6; g.stroke(); g.strokeStyle = rgba(GOWFX.core, alpha); g.lineWidth = w * .6; g.stroke();
  const hl = w * 5, hw = w * 2.2; g.fillStyle = rgba(GOWFX.core, alpha); g.beginPath(); g.moveTo(b[0] + ux * hl * .6, b[1] + uy * hl * .6); g.lineTo(b[0] - uy * hw, b[1] + ux * hw); g.lineTo(b[0] - ux * hl * .5, b[1] - uy * hl * .5); g.lineTo(b[0] + uy * hw, b[1] - ux * hw); g.closePath(); g.fill(); glow(g, b[0], b[1], w * 9, col, .6 * alpha);
  g.restore();
}
function fxLightArrow(g, a, b, t, o = {}) {
  const dur = o.dur || .25, life = dur + (o.hitDur || .3); if (t < 0 || t > life) return;
  const u = clamp(t / dur, 0, 1), e = o.ease === 'lin' ? u : easeIn(u) * .3 + u * .7, head = vLerp(a, b, e), tail = vLerp(a, b, Math.max(0, e - (o.trail || .35)));
  const qa = gowQ(Array.isArray(a) ? tail : { x: lerp(a.x, b.x, Math.max(0, e - (o.trail || .35))), y: lerp(a.y, b.y, Math.max(0, e - (o.trail || .35))) }), qb = gowQ(Array.isArray(a) ? head : { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) }); if (!qa || !qb) return;
  const w = (o.w || 1) * Math.max(2.5, (Array.isArray(a) ? .03 * qb.s : 4)), col = o.col || GOWFX.violet;
  if (u < 1) gowArrow2D(g, [qa.x, qa.y], [qb.x, qb.y], w, col, 1);
  if (t > dur && o.hit !== false) { const k = (t - dur) / (o.hitDur || .3); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, qb.x, qb.y, w * 30 * (1 - k * .5), col, .7 * (1 - k)); g.strokeStyle = rgba(GOWFX.core, 1 - k); g.lineWidth = Math.max(1, w * .6); for (const rr of [1, 1.8]) { g.beginPath(); g.arc(qb.x, qb.y, w * 10 * rr * (.4 + k), 0, TAU); g.stroke(); } fxImpactStar(g, qb.x, qb.y, w * 14 * (1 - k), .4, rgba(GOWFX.core, 1 - k), 4); g.restore(); }
}
function fxArrowVolley(g, src, t, o = {}) { // Rewrite Light: n arrows fan out from src (above Gowther) and rain onto targets / along dir
  const n = o.n || 18, r = rng(o.seed || 5), tg = o.targets, dir = vNorm(o.dir || [0, -.2, 1]), len = o.len || 9;
  for (let i = 0; i < n; i++) { const st = r() * (o.stagger == null ? .35 : o.stagger), s0 = vAdd(src, [(r() - .5) * (o.spread || 1.6), (r() - .3) * (o.spread || 1.6) * .6, (r() - .5) * .6]);
    const end = tg ? vAdd(tg[i % tg.length], [(r() - .5) * .4, (r() - .5) * .5, (r() - .5) * .4]) : vAdd(vMad(s0, dir, len * (.8 + r() * .4)), [(r() - .5) * 3, (r() - .5) * 1.5, (r() - .5) * 3]);
    fxLightArrow(g, s0, end, t - st, { dur: o.dur || .3, col: i % 3 ? GOWFX.violet : GOWFX.pink, w: o.w || .8, trail: .4, hit: o.hit }); }
}
function fxSearchlight(g, a, b, t, o = {}) {
  fxLightArrow(g, a, b, t, Object.assign({ dur: .18, w: .5, trail: .9, col: GOWFX.pink, hit: false }, o));
  const k = t - (o.dur || .18); if (k < 0 || k > (o.read || 1.2)) return; fxInvasionPulse(g, b, k, { dur: o.read || 1.2, r: o.r || .5 });
}
function fxBroadcast(g, src, pts, t, o = {}) { // zig-zag beam travelling from src through each point in turn
  if (t < 0 || t > (o.dur || 1.0) + .4) return; const all = [src].concat(pts), segT = (o.dur || 1.0) / pts.length, q = all.map(gowQ); if (q.some(p => !p)) return;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  for (let i = 0; i < pts.length; i++) { const u = clamp((t - i * segT) / segT, 0, 1); if (u <= 0) break; const a = q[i], b = q[i + 1], fade = clamp(1 - (t - (i + 1) * segT - .25) / .3, 0, 1); if (fade <= 0) continue;
    const zz = []; for (let k = 0; k <= 8; k++) { const s = k / 8 * u, px = lerp(a.x, b.x, s), py = lerp(a.y, b.y, s), nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1; const off = (k % 2 ? 1 : -1) * 14 * Math.sin(Math.PI * s); zz.push([px + nx / nl * off, py + ny / nl * off]); }
    g.globalCompositeOperation = 'lighter'; polyPath(g, zz, false); g.strokeStyle = rgba(GOWFX.pink, .45 * fade); g.lineWidth = 14; g.stroke(); g.strokeStyle = rgba(GOWFX.core, fade); g.lineWidth = 3.5; g.stroke();
    if (u >= 1) { glow(g, b.x, b.y, 60, GOWFX.pink, .5 * fade); } }
  g.restore();
}
function fxInvasionPulse(g, p, t, o = {}) {
  const dur = o.dur || 1.2; if (t < 0 || t > dur) return; const q = gowQ(p); if (!q) return; const R = (o.r || .5) * (Array.isArray(p) ? q.s : 100), u = t / dur, fade = Math.min(1, t / .1, (dur - t) / .25);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const ph = (u * 2.2 + i / 3) % 1; g.strokeStyle = rgba(i % 2 ? GOWFX.pink : GOWFX.violet, (1 - ph) * .8 * fade); g.lineWidth = 2 + 3 * (1 - ph); g.setLineDash([R * .25, R * .08]); g.lineDashOffset = -t * 120; g.beginPath(); g.arc(q.x, q.y, R * (.4 + ph * 1.4), 0, TAU); g.stroke(); }
  g.setLineDash([]); const r = rng(Math.floor(t * 16) + (o.seed || 0)); for (let i = 0; i < 18; i++) { const a = r() * TAU, d = R * (.5 + r() * 1.3), s = R * (.04 + r() * .09); g.fillStyle = rgba(r() < .5 ? GOWFX.pink : GOWFX.blue, .75 * fade); g.fillRect(q.x + Math.cos(a) * d - s / 2, q.y + Math.sin(a) * d - s / 2, s, s); }
  g.globalCompositeOperation = 'source-over'; g.fillStyle = rgba(GOWFX.core, .85 * fade); g.font = `900 ${Math.round(R * .28)}px "IPAGothic", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const ch = '侵入'; for (let i = 0; i < 2; i++) { const a = -HP + (i - .5) * .5 + t * .8; g.fillText(ch[i], q.x + Math.cos(a) * R * 1.55, q.y + Math.sin(a) * R * 1.55); }
  g.restore();
}

// ======================================================================================================== memories
function fxMemoryShards(g, c, t, o = {}) {
  if (t < 0) return; const n = o.n || 12, r = rng(o.seed || 11), R0 = o.r || 1.6, sz = o.size || .55, fade = Math.min(1, t / (o.fadeIn || .35)) * (o.alpha == null ? .85 : o.alpha), pull = o.pull || 0;
  const items = []; for (let i = 0; i < n; i++) { const a0 = r() * TAU, el = (r() - .5) * 1.4, rr = R0 * (.6 + r() * .6) * (1 - pull * .9), sp = (o.speed == null ? .35 : o.speed) * (r() < .5 ? 1 : -1) * (.6 + r() * .6), a = a0 + t * sp;
    const p = vAdd(c, [Math.cos(a) * rr, el * R0 * .45 + Math.sin(t * 1.3 + i) * .08, Math.sin(a) * rr]), q = project(p); if (!q) continue; items.push({ q, z: q.z, i, rot: (r() - .5) * .5 + Math.sin(t + i) * .08, seed: (o.seed || 11) * 13 + i, flick: hash(i * 7 + Math.floor(t * 10)) < .08 ? .4 : 1 }); }
  items.sort((a, b) => b.z - a.z);
  for (const it of items) gowMemCard(g, it.q.x, it.q.y, sz * it.q.s, it.rot, fade * it.flick * (1 - pull * .5), it.seed, { glitch: o.glitch, t, kind: o.kind });
}
function fxMemoryStream(g, t, o = {}) { // memories rush toward the camera from a vanishing point
  if (t < 0) return; const n = o.n || 16, cx = o.x == null ? W / 2 : o.x, cy = o.y == null ? H / 2 : o.y, sp = o.speed || .7;
  const items = []; for (let i = 0; i < n; i++) { const ph = (t * sp + hash(i * 3 + 1)) % 1, a = hash(i * 7) * TAU, z = Math.pow(ph, 2.2); items.push({ i, ph, a, z }); } items.sort((a, b) => a.z - b.z);
  for (const it of items) { const d = 60 + it.z * 1500, x = cx + Math.cos(it.a) * d, y = cy + Math.sin(it.a) * d * .65, w = 40 + it.z * 760, al = Math.min(1, it.ph * 4) * (1 - Math.pow(it.ph, 6)) * (o.alpha == null ? .85 : o.alpha); gowMemCard(g, x, y, w, (hash(it.i * 5) - .5) * .6, al, (o.seed || 4) * 17 + it.i, { glitch: o.glitch, t }); }
}
function fxEmotionFlakes(g, t, o = {}) { // drifting luminous flakes; ~1/5 carry a tiny memory picture
  if (t < 0) return; const n = o.n || 60, col = o.col || GOWFX.pink, wind = o.wind || 30, fade = Math.min(1, t / .4) * (o.alpha == null ? 1 : o.alpha);
  g.save(); for (let i = 0; i < n; i++) { const sp = 60 + hash(i * 3) * 90, y = ((hash(i * 5) * (H + 200) + t * sp) % (H + 200)) - 100, x = (hash(i * 7) * (W + 200) + Math.sin(t * .8 + i) * 40 + t * wind) % (W + 200) - 100, s = 5 + hash(i * 11) * 12, rot = t * (hash(i) - .5) * 3 + i, dep = .4 + hash(i * 13) * .6;
    if (o.c) { /* world mode: around a point */ }
    if (hash(i * 17) < .2 && s > 9) { gowMemCard(g, x, y, s * 6 * dep, rot * .2, .7 * fade, i + (o.seed || 0), { glow: true, glowCol: col }); continue; }
    g.save(); g.translate(x, y); g.rotate(rot); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, s * 2.5, col, .25 * fade * dep); g.globalCompositeOperation = 'source-over';
    g.fillStyle = rgba(i % 3 ? '#fff0fa' : '#ffd0ee', .9 * fade * dep); g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, rr = k % 2 ? s * .45 : s; g.lineTo(Math.cos(a) * rr * dep, Math.sin(a) * rr * dep); } g.closePath(); g.fill(); g.restore(); }
  g.restore();
}
function fxPlayback(g, c, t, o = {}) { // floating translucent screen showing a memory (Playback 心象鏡)
  if (t < 0) return; const w = o.w || 3.2, h = o.h || 2.0, u = easeOut(clamp(t / .35, 0, 1)), q = project(c); if (!q) return; const pw = w * q.s * u, ph = h * q.s;
  g.save(); g.translate(q.x, q.y); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, pw * .8, GOWFX.pink, .25); g.globalCompositeOperation = 'source-over'; g.globalAlpha = (o.alpha == null ? .78 : o.alpha) * u;
  g.drawImage(gowMemPic(o.seed || 1, o.kind), -pw / 2, -ph / 2, pw, ph); g.fillStyle = 'rgba(255,220,245,.12)'; for (let y = -ph / 2; y < ph / 2; y += 4) g.fillRect(-pw / 2, y, pw, 1.5);
  g.globalAlpha = u; g.strokeStyle = GOWFX.core; g.lineWidth = 3; g.strokeRect(-pw / 2, -ph / 2, pw, ph); g.strokeStyle = rgba(GOWFX.pink, .7); g.lineWidth = 8; g.globalCompositeOperation = 'lighter'; g.strokeRect(-pw / 2, -ph / 2, pw, ph); g.restore();
}

// ======================================================================================================== threads + marionettes
function fxMindThreads(g, a, b, t, o = {}) {
  if (t < 0) return; const n = o.n || 5, sag = o.sag == null ? .4 : o.sag, col = o.col || GOWFX.pink, grow = clamp(t / (o.grow || .35), 0, 1);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const off = [(hash(i * 3) - .5) * .3, (hash(i * 5) - .5) * .3, (hash(i * 7) - .5) * .3], pts = []; for (let k = 0; k <= 16; k++) { const s = k / 16 * grow; const p = vAdd(vLerp(a, vAdd(b, off), s), [Math.sin(s * Math.PI * 2 + i + t * 2) * .05, -sag * Math.sin(s * Math.PI), 0]); pts.push(p); }
    for (const run of projLine(pts)) { g.globalCompositeOperation = 'lighter'; polyPath(g, run, false); g.strokeStyle = rgba(col, .25); g.lineWidth = 5; g.stroke(); g.strokeStyle = rgba(GOWFX.core, .85); g.lineWidth = 1.3; g.stroke();
      const ph = (t * .9 + hash(i)) % 1, idx = Math.floor(ph * (run.length - 1)), pp = run[idx]; if (pp) glow(g, pp[0], pp[1], 14, col, .9); } }
  g.restore();
}
function fxMarionetteStrings(g, F, ft, ctrl, t, o = {}) {
  if (t < 0) return; const S = figSkel(F, F.timing > 1 ? onN(ft, F.timing) : ft), joints = o.joints || ['wrL', 'wrR', 'head', 'knL', 'knR'], qc = project(ctrl); if (!qc) return; const grow = clamp(t / (o.grow || .3), 0, 1);
  const bar = o.bar !== false, bw = .5 * qc.s, ends = [[qc.x - bw, qc.y], [qc.x + bw, qc.y], [qc.x, qc.y - bw * .5], [qc.x - bw * .55, qc.y + bw * .4], [qc.x + bw * .55, qc.y + bw * .4]];
  g.save(); g.lineCap = 'round';
  joints.forEach((j, i) => { const p = S.J[j]; if (!p) return; const q = project(j === 'head' ? vAdd(p, [0, S.B.headR, 0]) : p); if (!q) return; const e = bar ? ends[i % ends.length] : [qc.x, qc.y]; const x = lerp(e[0], q.x, grow), y = lerp(e[1], q.y, grow);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(o.col || GOWFX.pink, .3); g.lineWidth = 4; g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(x, y); g.stroke(); g.globalCompositeOperation = 'source-over'; g.strokeStyle = rgba('#fff6fb', .9); g.lineWidth = 1.2; g.stroke(); });
  if (bar) { g.strokeStyle = '#3a2430'; g.lineWidth = Math.max(3, .06 * qc.s); g.beginPath(); g.moveTo(ends[0][0], ends[0][1]); g.lineTo(ends[1][0], ends[1][1]); g.moveTo(ends[2][0], ends[2][1]); g.lineTo(qc.x, qc.y + bw * .5); g.moveTo(ends[3][0], ends[3][1]); g.lineTo(ends[4][0], ends[4][1]); g.stroke(); g.strokeStyle = '#a07a5a'; g.lineWidth *= .5; g.stroke(); }
  g.restore();
}
/* Harlequin marionette, painted 2D (anime insert style): jester cap with two bell tails, white porcelain face (tear / smile / blank),
   ruff collar, diamond-pattern tunic in two colours, limp jointed limbs dangling from strings, swinging with o.t.            */
function drawHarlequin(g, p, o = {}) {
  const q = gowQ(p); if (!q) return; const S = (o.size || 1) * (Array.isArray(p) ? q.s : 100), t = o.t || 0, sw = Math.sin(t * (o.speed || 2.2) + (o.phase || 0)) * (o.swing == null ? .18 : o.swing);
  const c1 = o.col || '#d8203a', c2 = o.col2 || '#f2f0f4', ink = o.ink || '#1a1018', lw = Math.max(1.2, S * .018), alpha = o.alpha == null ? 1 : o.alpha;
  g.save(); g.globalAlpha = alpha; g.translate(q.x, q.y); g.rotate(sw * .5); g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.strings !== false) { g.strokeStyle = rgba('#fff6fb', .8); g.lineWidth = Math.max(.8, lw * .5); for (const [x, y] of [[-.28, .1], [.28, .1], [0, -.52], [-.12, .62], [.12, .62]]) { g.beginPath(); g.moveTo(x * S, y * S); g.lineTo(x * S * .3, -S * 3); g.stroke(); } }
  const limb = (x0, y0, a1, a2, L, col) => { const x1 = x0 + Math.sin(a1) * L, y1 = y0 + Math.cos(a1) * L, x2 = x1 + Math.sin(a2) * L * .9, y2 = y1 + Math.cos(a2) * L * .9; g.strokeStyle = ink; g.lineWidth = S * .1 + lw * 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = col; g.lineWidth = S * .1; g.stroke(); g.fillStyle = c2; g.beginPath(); g.arc(x1, y1, S * .05, 0, TAU); g.fill(); g.beginPath(); g.arc(x2, y2, S * .055, 0, TAU); g.fillStyle = '#f6eee8'; g.fill(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); };
  const dn = o.dance || 0, ph = t * 4 + (o.phase || 0);
  limb(-S * .12, S * .55, -.15 - sw - dn * .4 * Math.sin(ph), .1 - sw, S * .32, c1); limb(S * .12, S * .55, .15 - sw + dn * .4 * Math.sin(ph), -.05 - sw, S * .32, c2);   // legs
  limb(-S * .24, S * .02, -.5 - sw * 1.4 - dn * .8 * Math.sin(ph + 1), -.1 - sw - dn * .6, S * .26, c2); limb(S * .24, S * .02, .5 - sw * 1.4 + dn * .8 * Math.sin(ph + 1), .1 - sw + dn * .6, S * .26, c1);   // arms
  // tunic with harlequin diamonds
  g.beginPath(); g.moveTo(-S * .26, -S * .02); g.quadraticCurveTo(-S * .3, S * .3, -S * .2, S * .6); g.lineTo(S * .2, S * .6); g.quadraticCurveTo(S * .3, S * .3, S * .26, -S * .02); g.closePath(); g.fillStyle = c2; g.fill(); g.save(); g.clip();
  g.fillStyle = c1; const d = S * .13; for (let yy = -1; yy < 6; yy++) for (let xx = -3; xx <= 3; xx++) if ((xx + yy) % 2 === 0) { const cx = xx * d, cy = yy * d * 1.3; g.beginPath(); g.moveTo(cx, cy - d * .65); g.lineTo(cx + d * .5, cy); g.lineTo(cx, cy + d * .65); g.lineTo(cx - d * .5, cy); g.closePath(); g.fill(); } g.restore();
  g.beginPath(); g.moveTo(-S * .26, -S * .02); g.quadraticCurveTo(-S * .3, S * .3, -S * .2, S * .6); g.lineTo(S * .2, S * .6); g.quadraticCurveTo(S * .3, S * .3, S * .26, -S * .02); g.closePath(); g.strokeStyle = ink; g.lineWidth = lw; g.stroke();
  // ruff collar
  g.fillStyle = '#fbf8f6'; g.beginPath(); for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI, rr = k % 2 ? S * .2 : S * .28; g.lineTo(Math.cos(a) * rr, -S * .02 - Math.sin(a) * rr * .45); } g.closePath(); g.fill(); g.stroke();
  // head: porcelain face
  const hy = -S * .24, hr = S * .17; g.fillStyle = '#f8f2ee'; g.beginPath(); g.ellipse(0, hy, hr, hr * 1.12, 0, 0, TAU); g.fill(); g.stroke();
  const fc = o.face || 'tear'; g.fillStyle = ink; for (const sg of [-1, 1]) { g.beginPath(); if (fc === 'smile') { g.lineWidth = lw * 1.2; g.arc(sg * hr * .4, hy - hr * .05, hr * .14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } else { g.ellipse(sg * hr * .4, hy - hr * .05, hr * .1, hr * .16, 0, 0, TAU); g.fill(); } }
  if (fc === 'tear') { g.fillStyle = '#4aa8e8'; g.beginPath(); g.moveTo(-hr * .4, hy + hr * .15); g.quadraticCurveTo(-hr * .52, hy + hr * .42, -hr * .4, hy + hr * .5); g.quadraticCurveTo(-hr * .28, hy + hr * .42, -hr * .4, hy + hr * .15); g.fill(); }
  g.strokeStyle = '#c8203a'; g.lineWidth = lw * 1.3; g.beginPath(); if (fc === 'smile') g.arc(0, hy + hr * .25, hr * .35, .2, Math.PI - .2); else g.moveTo(-hr * .22, hy + hr * .55), g.lineTo(hr * .22, hy + hr * .55); g.stroke();
  // jester cap: two drooping tails with bells
  g.strokeStyle = ink; g.lineWidth = lw; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(sg * hr * .05, hy - hr * .62); g.quadraticCurveTo(sg * hr * .5, hy - hr * 1.75, sg * hr * 1.5, hy - hr * .5 + sw * hr * sg); g.quadraticCurveTo(sg * hr * 1.0, hy - hr * .8, sg * hr * .98, hy - hr * .45); g.closePath(); g.fillStyle = sg > 0 ? c1 : c2; g.fill(); g.stroke(); g.beginPath(); g.arc(sg * hr * 1.5, hy - hr * .5 + sw * hr * sg, hr * .18, 0, TAU); g.fillStyle = '#f2c84a'; g.fill(); g.stroke(); }
  g.beginPath(); g.moveTo(-hr, hy - hr * .5); g.quadraticCurveTo(0, hy - hr * .78, hr, hy - hr * .5); g.lineTo(hr, hy - hr * .35); g.quadraticCurveTo(0, hy - hr * .62, -hr, hy - hr * .35); g.closePath(); g.fillStyle = c1; g.fill(); g.stroke();
  g.restore();
}
function fxPuppetArmy(g, c, t, o = {}) {
  if (t < 0) return; const n = o.n || 14, rows = o.rows || 2, sp = o.spacing || 1.4, drop = o.drop == null ? 1 : o.drop, yaw = o.yaw || 0, side = [Math.cos(yaw), 0, -Math.sin(yaw)], fwd = [Math.sin(yaw), 0, Math.cos(yaw)];
  const list = []; for (let i = 0; i < n; i++) { const row = i % rows, k = Math.floor(i / rows), per = Math.ceil(n / rows), x = (k - (per - 1) / 2) * sp + (row % 2) * sp * .5, z = -row * sp * 1.1, h = (o.h || 1.6) + (hash(i * 3) - .5) * .4 + (1 - easeOut(clamp(drop * 1.3 - hash(i * 7) * .3, 0, 1))) * 6;
    const p = vAdd(vAdd(c, vMul(side, x)), vAdd(vMul(fwd, z), [0, h, 0])), q = project(p); if (q) list.push({ p, z: q.z, i }); }
  list.sort((a, b) => b.z - a.z);
  const cols = o.cols || [['#d8203a', '#f2f0f4'], ['#2a2a3a', '#f2c84a'], ['#7a3ad8', '#f2f0f4'], ['#1a8a7a', '#f6e8d0']];
  for (const it of list) { const cc = cols[it.i % cols.length]; drawHarlequin(g, it.p, { size: (o.size || .9), t: t + hash(it.i) * 3, phase: it.i, col: cc[0], col2: cc[1], dance: o.dance || 0, face: ['tear', 'smile', 'blank'][it.i % 3], alpha: o.alpha }); }
}
function fxBlackout(g, c, t, o = {}) {
  const dur = o.dur || .9; if (t < 0) return; const u = easeOut(clamp(t / dur, 0, 1)), q = project(c); if (!q) return; const R = (o.r || 18) * u * q.s;
  g.save(); const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, Math.max(1, R)); gr.addColorStop(0, rgba('#06030a', .92)); gr.addColorStop(.85, rgba('#140822', .88)); gr.addColorStop(1, rgba('#3a0a48', 0)); g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, Math.max(1, R), 0, TAU); g.fill();
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(GOWFX.violet, .8 * (1 - u * .4)); g.lineWidth = 10; g.beginPath(); g.arc(q.x, q.y, R * .97, 0, TAU); g.stroke(); g.strokeStyle = rgba(GOWFX.core, .7); g.lineWidth = 2.5; g.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t * .4; g.strokeStyle = rgba(GOWFX.pink, .4); g.lineWidth = 2; g.beginPath(); g.moveTo(q.x + Math.cos(a) * R * .92, q.y + Math.sin(a) * R * .92); g.lineTo(q.x + Math.cos(a) * R * 1.04, q.y + Math.sin(a) * R * 1.04); g.stroke(); } g.restore();
}
function fxKaleidoscope(g, F, ft, t, o = {}) { // illusion copies of F (screen-offset redraws, tinted + translucent), they shimmer
  if (t < 0) return; const n = o.n || 6, R = o.r || 320, grow = easeOut(clamp(t / (o.grow || .4), 0, 1));
  for (let i = 0; i < n; i++) { const a = i / n * TAU + t * .25, dx = Math.cos(a) * R * grow, dy = Math.sin(a) * R * .25 * grow; g.save(); g.translate(dx, dy); drawFig(g, F, ft + i * .07, { mode: 'flat', col: o.col || '#e8b8ff', alpha: (o.alpha || .45) * (.7 + .3 * Math.sin(t * 6 + i)) }); g.restore(); }
}
function fxGlassesGlint(g, F, ft, t, o = {}) { if (t < 0 || t > (o.dur || .3)) return; const S = figSkel(F, ft), HM = headModel(S, designAt(F, ft)), p = HM.at(o.side === 'R' ? -.5 : .5, -.15), q = project(vMad(p, HM.M[2], HM.r * .12)); if (!q) return; const k = Math.sin(t / (o.dur || .3) * Math.PI); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, q.x, q.y, HM.r * q.s * 1.2, '#ffffff', .6 * k); fxImpactStar(g, q.x, q.y, HM.r * q.s * 1.1 * k, .3, rgba('#ffffff', k), 4); g.restore(); }
