/* engine/impact_s2.js (agent S2, harry-vs-gojo) - extra masked impact series (pre/spoilers.md) not covered by impact_hvg.js.
   !!! SPOILER WARNING: these are X-* series of pre/spoilers.md. !!!
   (Replaces the old gowther-dazai-urahara file of the same name; nothing else referenced it.)
   Styles:  s2chainglow   black frame, figures as dark gold-rimmed silhouettes, two glowing gold chains coil across the frame (p.at focus)
            s2povhole     Six Eyes POV negative: world as cyan energy lines, every figure on the 'chars' layer a black hole with a grey rim
   Series:  CHAIN_GLOW (2f), SIX_EYES_POV_HOLE (2f)                                                                                         */
'use strict';
IMPACT.s2chainglow = (c, g, f, p, k, n) => {
  fillAll(g, '#050306'); rawDraw(g, filtered(c, 'grayscale(1) brightness(.35) contrast(1.4)'), 0, 0, .7); rawDraw(g, impSil('chars', '#000000'));
  const q = impFocus(f, p); g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const side of [-1, 1]) { for (let i = 0; i < 26; i++) { const u = i / 25, x = lerp(side < 0 ? -80 : W + 80, q.x + side * 140, u), y = q.y + Math.sin(u * 9 + k * 1.3 + side) * 90 * (1 - u) + side * 40;
      g.strokeStyle = rgba('#ffd36a', .9); g.lineWidth = 7; g.beginPath(); g.ellipse(x, y, 26, 15, u * 6 + side, 0, TAU); g.stroke(); }
    glow(g, q.x + side * 140, q.y + side * 40, 160, '#ffb040', .6); }
  glow(g, q.x, q.y, 600, '#ffd36a', .25 + .15 * k); g.restore();
};
IMPACT.s2povhole = (c, g, f, p, k) => {
  fillAll(g, '#e8f8ff'); const t = filtered(c, 'grayscale(1) contrast(3) invert(1)'); rawDraw(g, t, 0, 0, .55);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#5fd3ff'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  const sil = impSil('chars', '#9aa2ae'), s = OUT.scale; for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) rawDraw(g, sil, dx * s, dy * s); rawDraw(g, impSil('chars', '#000000'));
  g.save(); g.strokeStyle = 'rgba(10,40,90,.35)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { const y = hash(i * 3 + k) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + (hash(i) - .5) * 80); g.stroke(); } g.restore();
};
Object.assign(IMPACT_SEQ, {
  CHAIN_GLOW: [{ s: 's2chainglow', n: 1 }, { s: 'flash', n: 1, p: { col: '#fff4c8' } }],
  SIX_EYES_POV_HOLE: [{ s: 's2povhole', n: 1 }, { s: 'sixeyespov', n: 1 }],
});
