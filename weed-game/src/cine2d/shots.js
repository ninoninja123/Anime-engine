// "Four Arrows" 2D motion comic: the 37 shots (docs/weed-game/arrows-2d-shotlist.md is authoritative).
// Frame: 1600 x 800 virtual units, cover-scaled; letterbox bars hide y < ~112 and y > ~688 on a landscape phone,
// subtitles sit just above the lower bar → faces / eyes / contact points stay between y ≈ 150 and 560.
// A shot: { n, dur, cam: [{ k, z, x, y, r, e }], draw(S), cues: [[t, S => …]], enter(S), freeze(t), bg }.
// S.L(depth, g => …) draws one parallax layer; S.P = particles; S.shake / S.flash / S.sfx / S.say / S.music.
import { ART, ink, line, brush, ell, withT, D2R, rng, skyGrad, bigCloud, ridgePts, boulder, grass, path,
  eye, headSide, headFront, dogSide, dogSil, p4Side, p4Sil, p4HeadSide, p4RoarBelow, p4EyeECU, chestECU, pawECU, POSES, DOGS } from './art.js';
import { speedLines, impactFrame, shockRing, glow, spirit, dustBurst } from './fx.js';

const W = 1600, H = 800;
const MEN = ['robert', 'rocker', 'heuler'];
export const LINE_IDS = ['arrows_order', 'arrows_ack', 'arrows_together', 'arrows_cry_robert', 'arrows_pain_robert', 'arrows_fall_robert',
  'arrows_cry_rocker', 'arrows_pain_rocker', 'arrows_fall_rocker', 'arrows_cry_heuler', 'arrows_pain_heuler', 'arrows_fall_heuler',
  'arrows_fourth', 'arrows_thanks', 'arrows_now'];

// ------------------------------------------------------------------------------------------ palettes
const MOOD = {
  day: { sky: [[0, '#2b3f88'], [0.42, '#5f7cc4'], [0.78, '#d9d2b0'], [1, '#f1dfa6']], cloud: '#eee8ec', cloudSh: '#7a80b8', mtn: '#4c6ab0', mtnSh: '#33498a', mtn2: '#6b8a9a', grass: '#a3b74a', grassD: '#6b8a30', grassFG: '#577a2a' },
  storm: { sky: [[0, '#222656'], [0.45, '#545a98'], [0.8, '#d6a888'], [1, '#eec08e']], cloud: '#d8d0e0', cloudSh: '#5a5490', mtn: '#3e5698', mtnSh: '#2a3a72', mtn2: '#58707e', grass: '#8ea446', grassD: '#5a7628', grassFG: '#466422' },
  dusk: { sky: [[0, '#1a2050'], [0.45, '#4e4a8a'], [0.8, '#d88a6a'], [1, '#f2b072']], cloud: '#e6c8cc', cloudSh: '#584a84', mtn: '#3a4a88', mtnSh: '#262f62', mtn2: '#55607a', grass: '#7f9440', grassD: '#4e6624', grassFG: '#3c561e' },
};
// ------------------------------------------------------------------------------------------ backgrounds
function skyL(S, hy, m = 'day', d = 0.03) { S.L(d, g => skyGrad(g, -600, -600, W + 1200, hy + 700, MOOD[m].sky)); }
function cloudsL(S, hy, m = 'day', d = 0.08, seed = 1, big = 1) {
  const M = MOOD[m];
  S.L(d, g => {
    const b = Math.min(1.15, big), y0 = Math.min(hy, 640);    // keep the heaps in the upper frame, never a wall of cloud
    bigCloud(g, 220 + (seed % 5) * 60, y0 - 250 * b, 640 * b, 260 * b, { seed, base: M.cloud, shade: M.cloudSh });
    bigCloud(g, 1240 - (seed % 4) * 50, y0 - 330 * b, 760 * b, 340 * b, { seed: seed + 1, base: M.cloud, shade: M.cloudSh });
    if (seed % 2) bigCloud(g, 760, y0 - 120 * b, 420 * b, 110 * b, { seed: seed + 2, base: M.cloud, shade: M.cloudSh });
  });
}
function mountainsL(S, hy, m = 'day', d = 0.16) {
  const M = MOOD[m];
  S.L(d, g => {
    ink(g, ridgePts(5, { y: hy + 10, amp: 200, peaks: 2.6, bottom: hy + 400 }), { fill: M.mtn, shade: M.mtnSh, light: [40, -30], hatch: true, lw: 1.6, line: '#1e2a58', amp: 1.2 });
    g.fillStyle = 'rgba(230,236,255,0.18)'; g.fillRect(-600, hy - 40, W + 1200, 60);
  });
  S.L(d + 0.08, g => ink(g, ridgePts(9, { y: hy + 30, amp: 90, peaks: 5, bottom: hy + 400 }), { fill: M.mtn2, shade: M.mtnSh, light: [30, -20], lw: 1.6, line: '#1e2a58', amp: 1.2 }));
}
function meadowL(S, hy, m = 'day', d = 0.4) {
  const M = MOOD[m];
  S.L(d, g => {
    const gr = g.createLinearGradient(0, hy, 0, hy + 500); gr.addColorStop(0, M.grass); gr.addColorStop(1, M.grassD);
    ink(g, [[-800, hy + 20], [400, hy + 6], [1200, hy + 24], [2400, hy + 10], [2400, hy + 900], [-800, hy + 900]], { fill: gr, lw: 1.8, line: '#2c3a18', amp: 1 });
    const r = rng(hy | 0);
    for (let i = 0; i < 26; i++) { const x = -400 + r() * 2400, y = hy + 30 + r() * 300, w = 30 + r() * 60; brush(g, [[x, y], [x + w * 0.5, y - 3], [x + w, y]], { w: 2.4, seed: i + 70, col: 'rgba(40,60,20,0.45)' }); }
  });
}
function pileL(S, x, y, s = 1, d = 0.45, m = 'day') {
  S.L(d, g => {
    const R = [[-260, 30, 90], [-150, -40, 110], [-20, -90, 120], [120, -40, 120], [240, 20, 100], [-100, 50, 90], [60, 60, 110], [-40, -10, 90], [200, -120, 80], [-200, -110, 70]];
    for (const [i, [bx, by, br]] of R.entries()) boulder(g, x + bx * s, y + by * s, br * s, 31 + i, m === 'dusk' ? { rock: '#5c5d78', rockSh: '#33344e', mossC: '#7d8c3e' } : {});
  });
}
function land(S, { hy = 500, m = 'day', pile = null, clouds = 1, seed = 1 } = {}) {
  skyL(S, hy, m); if (clouds) cloudsL(S, hy, m, 0.08, seed, clouds); mountainsL(S, hy, m); meadowL(S, hy, m);
  if (pile) pileL(S, pile[0], pile[1], pile[2] || 1, pile[3] || 0.45, m);
}
/** Foreground grass band. */
function fgGrass(S, y, h = 60, m = 'day', d = 1, wind = 0) { S.L(d, g => grass(g, -500, W + 500, y, h, MOOD[m].grassFG, 3 + (y | 0), { wind })); }
/** Panned blur background for tracking shots: coloured streak bands sliding fast. */
function streaks(S, hy, m = 'day', speed = 3000, dir = -1) {
  const M = MOOD[m];
  S.L(0, g => {
    skyGrad(g, -600, -600, W + 1200, hy + 700, M.sky);
    const r = rng(5), off = (S.t * speed) % 2000;
    for (let i = 0; i < 40; i++) {
      const y = hy - 60 + r() * 520, len = 200 + r() * 700, x = ((r() * 2400 + dir * off) % 2400 + 2400) % 2400 - 400, th = 4 + r() * 26;
      g.fillStyle = y < hy ? (r() < 0.5 ? M.mtn : M.cloud) : (r() < 0.4 ? M.grassD : r() < 0.6 ? '#6d7486' : M.grass);
      g.globalAlpha = 0.8; g.fillRect(x, y, len, th);
    }
    g.globalAlpha = 1;
    g.fillStyle = M.grass; g.fillRect(-600, hy + 120, W + 1200, 800);
    for (let i = 0; i < 26; i++) { const y = hy + 130 + r() * 400, x = ((r() * 2400 + dir * off * 1.6) % 2400 + 2400) % 2400 - 400; g.fillStyle = M.grassD; g.fillRect(x, y, 300 + r() * 500, 6 + r() * 12); }
  });
}
const sil = c => c;
const step2 = (t, a, b, rate = 1 / 12) => (Math.floor(t / rate) % 2 ? b : a);    // held drawings alternating "on twos"
function title(g, text, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '900 italic 92px Georgia, serif'; g.textAlign = 'center'; g.letterSpacing = '14px';
  g.lineWidth = 10; g.strokeStyle = '#120c10'; g.lineJoin = 'round'; g.strokeText(text, W / 2, 226); g.fillStyle = '#f4ead2'; g.fillText(text, W / 2, 226);
  g.restore();
}
const lerp = (a, b, k) => a + (b - a) * k, clamp01 = k => Math.max(0, Math.min(1, k));
const eo = k => 1 - Math.pow(1 - clamp01(k), 3), ei = k => Math.pow(clamp01(k), 3);
function lerpPose(a, b, k) { const o = {}; for (const key of Object.keys(a)) { const va = a[key], vb = b[key] ?? va; o[key] = Array.isArray(va) ? va.map((v, i) => lerp(v, vb[i] ?? v, k)) : typeof va === 'number' ? lerp(va, vb, k) : va; } return o; }
const P4P = {
  stand: { body: 0, fl: [2, -2], fr: [-8, 4], hl: [8, 36, -32], hr: [-4, 36, -28], neck: -20, head: 10, y: -150 },
  bite: { body: 4, fl: [10, -6], fr: [-4, 2], hl: [10, 38, -34], hr: [0, 38, -30], neck: 24, head: 40, y: -146 },
  rear: { body: -50, fl: [-50, 80], fr: [-30, 60], hl: [-40, 60, -30], hr: [-30, 50, -24], neck: -8, head: -6, y: -170 },
  crouch: { body: 4, fl: [-24, 60], fr: [-16, 50], hl: [-40, 90, -64], hr: [-30, 84, -60], neck: -14, head: 4, y: -112 },
  leap: { body: -10, fl: [-70, -10], fr: [-60, 0], hl: [60, 20, 20], hr: [50, 30, 10], neck: -18, head: 6, y: -170 },
  back: { body: 168, fl: [-40, -30], fr: [-10, -40], hl: [30, 40, -30], hr: [10, 30, -50], neck: 40, head: 10, y: -70 },
};

// spoken-mouth helper (preview: closed)
const jawOf = (S, who, k = 0.35) => S.talk(who) * k;

// ------------------------------------------------------------------------------------------ the shots
export const SHOTS = [
  // ============================ A. The order
  { n: 1, dur: 2.5, cam: [{ k: 0, z: 1.0, x: -40 }, { k: 1, z: 1.1, x: 30, e: 'lin' }],
    enter: S => { S.P.add('leaf', 1700, 300, 10, { dir: Math.PI, spread: 0.6, speed: 420, size: 9, life: 4, grav: 30, jy: 300 }); },
    cues: [[0, S => { S.sfx('boss_drone'); }], [1.1, S => S.sfx('growl')]],
    draw: S => {
      land(S, { hy: 470, m: 'day', pile: [1290, 560, 1, 0.5] });
      S.L(0.5, g => withT(g, 1290, 474, 0.62, 0, gg => p4Side(gg, P4P.stand, { expr: 'beast', look: [1, 0] }), true));
      S.L(0.7, g => { ['heuler', 'rocker', 'robert', 'jerome'].forEach((id, i) => withT(g, 200 + i * 110, 640 - (i % 2) * 14, 0.42, 0, gg => dogSide(gg, id, 'alert'))); });
      fgGrass(S, 700, 50, 'day', 1, 0.6);
      S.L(0.2, g => title(g, 'FOUR ARROWS', clamp01((S.t - 0.3) / 0.4) * clamp01((2.4 - S.t) / 0.4)));
    } },
  { n: 2, dur: 1.5, cam: [{ k: 0, z: 1.0 }, { k: 1, z: 1.12, e: 'lin' }],
    cues: [[0, S => S.sfx('growl')], [0, S => S.shake(0.15)]],
    draw: S => { S.L(1, g => withT(g, 800 + Math.sin(S.t * 40) * 2, 420, 1.15, 0, gg => p4EyeECU(gg, { look: [-0.6, 0.1], side: -1 }), false)); } },
  { n: 3, dur: 2.5, cam: [{ k: 0, z: 1.04, r: -3 }, { k: 1, z: 1.14, r: -1 }],
    cues: [[0.05, S => S.say('arrows_order', { hold: true })]],
    draw: S => {
      skyL(S, 900, 'day'); cloudsL(S, 860, 'day', 0.12, 4, 1.4);
      S.L(1, g => {
        withT(g, 560, 470, 3.3, -0.12, gg => {
          ink(gg, [[-10, 20], [40, 30], [70, 140], [-60, 160], [-40, 60]], { fill: DOGS.jerome.base, shade: DOGS.jerome.shade, light: [5, -6], hatch: true, seed: 33,
            marks: g2 => { g2.fillStyle = DOGS.jerome.dark; g2.fill(path(g2, [[-80, 0], [-4, 6], [10, 60], [-20, 170], [-90, 170]], { seed: 34 })); } });
          headSide(gg, 'jerome', { expr: 'determined', jaw: jawOf(S, 'jerome'), look: [1, -0.2], eyeScale: 1.1 });
        });
      });
    } },
  { n: 4, dur: 0.8, cam: [{ k: 0, z: 1.0, y: 0 }, { k: 1, z: 1.06, y: -10 }],
    cues: [[0.0, S => S.say('arrows_ack', { hold: true })]],
    draw: S => {
      skyL(S, 900, 'day'); cloudsL(S, 700, 'day', 0.1, 7, 1);
      const nod = Math.sin(clamp01(S.t / 0.7) * Math.PI) * 0.12;
      S.L(1, g => withT(g, 720, 400, 11, nod, gg => { gg.translate(-51, 4); headSide(gg, 'robert', { expr: 'determined', jaw: jawOf(S, 'robert'), lid: nod * 1.5 }); }));
    } },
  { n: 5, dur: 0.8, cam: [{ k: 0, z: 1.08, x: 10 }, { k: 1, z: 1.0, x: 0, e: 'out' }],
    draw: S => {
      skyL(S, 800, 'day'); mountainsL(S, 760, 'day', 0.1);
      const ear = S.t < 0.25 ? 0 : S.t < 0.33 ? 0.5 : 1;
      S.L(1, g => withT(g, 800, 470, 3.3, 0, gg => headFront(gg, 'rocker', { expr: 'determined', ear, turn: -0.2, look: [0.3, 0] })));
    } },
  { n: 6, dur: 1.2, cam: [{ k: 0, z: 1.0, x: -20, r: 2 }, { k: 1, z: 1.08, x: 0, r: 0 }],
    cues: [[0.0, S => S.say('arrows_together', { hold: true })]],
    draw: S => {
      skyL(S, 860, 'day'); cloudsL(S, 820, 'day', 0.1, 11, 1.2);
      S.L(1, g => withT(g, 820, 450, 3.1, -0.05, gg => headFront(gg, 'heuler', { expr: S.k > 0.7 ? 'determined' : 'calm', mouth: S.talk('heuler') * 0.5, turn: 0.35, look: [0.6, 0] })));
    } },
  { n: 7, dur: 1.5, cam: [{ k: 0, z: 1.0, x: -60 }, { k: 1, z: 1.04, x: 40, e: 'lin' }],
    enter: S => S.P.add('leaf', 1800, 400, 14, { dir: Math.PI, spread: 0.5, speed: 600, size: 14, life: 3, grav: 40, jy: 500 }),
    cues: [[0, S => S.sfx('rushWhoosh')]],
    draw: S => {
      land(S, { hy: 540, m: 'day', pile: [1350, 600, 0.6, 0.4], clouds: 1.1, seed: 3 });
      S.L(0.4, g => withT(g, 1350, 548, 0.34, 0, gg => p4Side(gg, P4P.stand), true));
      S.L(0.9, g => ['heuler', 'rocker', 'robert', 'jerome'].forEach((id, i) => withT(g, 160 + i * 190, 720 + i * 10, 1.25 + i * 0.12, 0, gg => dogSide(gg, id, 'alert', { expr: 'determined' }))));
      fgGrass(S, 760, 90, 'day', 1.2, 1);
    } },

  // ============================ B. First arrow: Robert
  { n: 8, dur: 0.6, cam: [{ k: 0, z: 1.12 }, { k: 1, z: 1.0, e: 'out' }],
    cues: [[0.22, S => { dustBurst(S.P, 800, 690, 10, { size: 40, speed: 500, jx: 260 }); S.shake(0.2); S.sfx('gallopIn'); }]],
    draw: S => {
      S.L(0, g => { skyGrad(g, -400, -400, 2400, 1200, MOOD.day.sky); });
      meadowL(S, 560, 'day', 0.3);
      S.L(1, g => withT(g, 800, 690 + (S.t > 0.22 ? 14 : 0), 1.1, 0, gg => pawECU(gg, 'robert', S.t > 0.22 ? 1 : 0)));
      fgGrass(S, 720, 80, 'day', 1);
    } },
  { n: 9, dur: 0.5, cam: [{ k: 0, z: 1.0, x: 0 }, { k: 1, z: 1.0, x: 0 }], partsDepth: 1,
    cues: [[0, S => { S.say('arrows_cry_robert'); S.sfx('rushWhoosh'); }]],
    draw: S => {
      streaks(S, 420, 'day', 3200);
      S.L(1, g => withT(g, 760 + S.t * 160, 600, 2.3, 0, gg => dogSide(gg, 'robert', step2(S.t, 'run1', 'run2'), { expr: 'fury', jaw: 0.3, teeth: true })));
      S.screen((g, w, h) => speedLines(g, w, h, { mode: 'h', dir: -1, n: 40, col: 'rgba(255,255,255,0.8)' }));
    } },
  { n: 10, dur: 0.15, bg: '#000',
    cues: [[0, S => S.sfx('arrow_bite_1')]],
    draw: S => S.screen((g, w, h) => {
      impactFrame(g, w, h, w * 0.62, h * 0.45, { seed: 1 });
      g.setTransform(w / W, 0, 0, w / W, 0, (h - H * w / W) / 2);
      withT(g, 860, 560, 1.7, -0.25, gg => dogSil(gg, '#08070a', 'robert', 'leap'));
    }) },
  { n: 11, dur: 0.9, cam: [{ k: 0, z: 1.18, x: -30 }, { k: 1, z: 1.04, x: 10, e: 'out' }],
    cues: [[0.08, S => { S.shake(0.6); S.P.add('tuft', 760, 400, 10, { speed: 700, size: 22, life: 0.9, col: '#b47c40' }); S.P.add('spark', 760, 400, 10, { speed: 1200, life: 0.4, grav: 300 }); }]],
    draw: S => S.L(1, g => withT(g, 820, 400, 0.95, 0.05, gg => chestECU(gg, 1, eo(S.t / 0.12), 'robert'))) },
  { n: 12, dur: 1.2, cam: [{ k: 0, z: 1.0, r: 7 }, { k: 1, z: 1.12, r: 4 }],
    cues: [[0.02, S => { S.sfx('roarPain'); S.shake(0.5); }]],
    draw: S => {
      skyL(S, 1100, 'storm', 0); cloudsL(S, 980, 'storm', 0.05, 9, 1.4);
      S.screen((g, w, h) => speedLines(g, w, h, { mode: 'radial', cx: w * 0.5, cy: h * 0.42, n: 50, col: 'rgba(255,248,220,0.35)', inner: 0.4 }));
      S.L(1, g => withT(g, 800 + Math.sin(S.t * 50) * 4, 400, 1.15, 0, gg => p4RoarBelow(gg, { open: 0.5 + eo(S.t / 0.3) * 0.5 })));
    } },
  { n: 13, dur: 1.0, cam: [{ k: 0, z: 1.0, x: 30 }, { k: 1, z: 1.08, x: 0 }], bg: '#f0c88a',
    cues: [[0.0, S => S.sfx('whoosh')], [0.32, S => { S.shake(0.7); S.sfx('bite'); S.say('arrows_pain_robert'); S.flash(0.35, '#fff6dc'); }]],
    draw: S => {
      S.L(0, g => skyGrad(g, -400, -400, 2400, 1400, [[0, '#d8604a'], [0.5, '#f0a86a'], [0.85, '#f8dca0'], [1, '#f8e8b8']]));
      S.L(0.1, g => bigCloud(g, 400, 300, 900, 200, { seed: 21, base: '#f6c08a', shade: '#c06a5a', line: 'rgba(120,40,40,0.4)' }));
      const k = eo(S.t / 0.32);
      S.L(1, g => {
        g.fillStyle = '#1a0e10'; g.fillRect(-400, 640, 2400, 600);
        withT(g, 1060, 650, 1.45, 0, gg => p4Sil(gg, '#1a0e10', lerpPose(P4P.stand, P4P.bite, k), { jaw: (1 - k) * 0.5,
          onChest: g3 => {   // Robert clamped on the chest; a warm rim keeps his shape readable against P4
            const f = ART.flat;
            withT(g3, 40, 40, 0.95, 0.5, g4 => { ART.flat = '#f8d8a0'; g4.save(); g4.translate(-4, -3); dogSide(g4, 'robert', 'hang'); g4.restore(); ART.flat = '#120a0c'; dogSide(g4, 'robert', 'hang'); }, true);
            ART.flat = f;
          } }), true);
      });
    } },
  { n: 14, dur: 1.5, cam: [{ k: 0, z: 1.0 }, { k: 0.5, z: 1.05 }, { k: 0.51, z: 1.0, x: 0 }, { k: 1, z: 1.12 }],
    draw: S => {
      if (S.t < 0.75) {
        skyL(S, 800, 'storm'); mountainsL(S, 700, 'storm', 0.1);
        S.L(1, g => { withT(g, 500, 480, 3.5, 0.06, gg => headFront(gg, 'heuler', { expr: 'wide', turn: 0.4, look: [1, 0], mouth: 0.15 })); withT(g, 1130, 460, 3.6, -0.05, gg => headFront(gg, 'rocker', { expr: 'wide', turn: 0.2, look: [1, 0] })); });
      } else {
        skyL(S, 900, 'storm'); cloudsL(S, 820, 'storm', 0.1, 13, 1.2);
        S.L(1, g => withT(g, 800, 470, 3.6, 0, gg => headFront(gg, 'jerome', { expr: 'fury', mouth: 0.12, teeth: true, turn: 0.15 })));
      }
    } },
  { n: 15, dur: 2.6, cam: [{ k: 0, z: 1.0, x: 0 }, { k: 0.4, z: 1.04, x: 20 }, { k: 0.41, z: 1.0, x: 0 }, { k: 1, z: 1.1, x: 0 }],
    enter: S => {},
    cues: [[0, S => { S.music('sad', { fade: 2.2 }); S.sfx('throw'); }], [0.75, S => { dustBurst(S.P, 380, 690, 12); S.sfx('yelpPain'); S.shake(0.3); }],
      [1.05, S => S.say('arrows_fall_robert', { hold: true })], [1.4, S => S.sfx('spirit')]],
    draw: S => {
      if (S.t < 1.05) {
        land(S, { hy: 520, m: 'storm', pile: [1300, 600, 0.7, 0.45], seed: 5 });
        const k = clamp01(S.t / 0.8);          // slow motion arc
        S.L(0.8, g => {
          withT(g, 1180, 690, 0.8, 0, gg => p4Side(gg, P4P.stand, { jaw: 0.4, expr: 'fury', wound: 1 }), true);
          if (k < 1) withT(g, lerp(900, 400, k), 640 - Math.sin(k * Math.PI) * 300, 0.9, k * 3.5, gg => dogSide(gg, 'robert', 'fly', { lid: 0.6 }));
          else withT(g, 400, 690, 0.9, 0, gg => dogSide(gg, 'robert', 'lie', { lid: 1 }));
        });
        fgGrass(S, 740, 60, 'storm', 1);
      } else {
        const kk = clamp01((S.t - 1.05) / 1.5);
        skyL(S, 900, 'storm'); mountainsL(S, 820, 'storm', 0.08);
        S.L(0.5, g => spirit(g, 980, 400, 1.6, clamp01((S.t - 1.4) / 2.2), 'robert', { rise: 160 }));
        S.L(1, g => {
          g.fillStyle = MOOD.storm.grass; g.fillRect(-400, 560, 2400, 600);
          withT(g, 760, 430, 5.0, 0.32, gg => { gg.translate(-51, 4); headSide(gg, 'robert', { expr: 'sad', lid: 0.45 + kk * 0.55, jaw: jawOf(S, 'robert', 0.15), look: [0.4, 0.3] }); });
          grass(g, -400, 2000, 640, 70, MOOD.storm.grassFG, 15);
        });
      }
    } },

  // ============================ C. Second arrow: Rocker
  { n: 16, dur: 0.5, cam: [{ k: 0, z: 1.0, y: 0 }, { k: 1, z: 1.08, y: 20 }],
    cues: [[0, S => S.sfx('strain')]],
    draw: S => {
      skyL(S, 900, 'storm'); cloudsL(S, 900, 'storm', 0.08, 17, 1.3);
      const sq = 1 - eo(S.t / 0.45) * 0.1;
      S.L(1, g => { g.fillStyle = MOOD.storm.grassD; g.fillRect(-400, 700, 2400, 400); withT(g, 980, 720, 3.6, 0, gg => { gg.scale(1, sq); dogSide(gg, 'rocker', 'crouch', { expr: 'fury' }); }); });
      fgGrass(S, 720, 60, 'storm', 1);
    } },
  { n: 17, dur: 0.5, cam: [{ k: 0, z: 1.0, x: -200 }, { k: 1, z: 1.0, x: 260, e: 'in' }],
    cues: [[0, S => { S.say('arrows_cry_rocker'); S.sfx('rushWhoosh'); }]],
    draw: S => {
      streaks(S, 450, 'storm', 4200);
      const x = lerp(200, 1300, ei(S.t / 0.5));
      S.L(1, g => { for (let i = 3; i >= 0; i--) { g.globalAlpha = i ? 0.18 * (4 - i) / 3 : 1; withT(g, x - i * 90, 560 - i * 6, 2.0, -0.15, gg => dogSide(gg, 'rocker', 'leap', { expr: 'fury', jaw: 0.35, teeth: true })); } g.globalAlpha = 1; });
      S.screen((g, w, h) => speedLines(g, w, h, { mode: 'h', dir: -1, n: 60 }));
    } },
  { n: 18, dur: 0.1, bg: '#fff', cues: [[0, S => S.sfx('arrow_bite_2')]],
    draw: S => S.screen((g, w, h) => impactFrame(g, w, h, w * 0.55, h * 0.5, { invert: true, seed: 2 })) },
  { n: 19, dur: 0.8, cam: [{ k: 0, z: 1.2, r: -4 }, { k: 1, z: 1.08, r: -2, e: 'out' }],
    cues: [[0.06, S => { S.shake(0.9); S.P.add('tuft', 760, 410, 16, { speed: 900, size: 26, life: 1, col: '#b47c40' }); S.P.add('spark', 780, 410, 18, { speed: 1500, life: 0.5, grav: 400 }); }]],
    draw: S => S.L(1, g => withT(g, 820, 410, 1.0, -0.08, gg => chestECU(gg, 2, eo(S.t / 0.1), 'rocker'))) },
  { n: 20, dur: 1.0, cam: [{ k: 0, z: 1.0, y: 60 }, { k: 1, z: 1.0, y: -40, e: 'out' }],
    cues: [[0, S => { S.sfx('roarPain'); }], [0.35, S => { S.sfx('thudDeep'); S.shake(0.4); }]],
    draw: S => {
      skyL(S, 1000, 'storm'); cloudsL(S, 900, 'storm', 0.06, 19, 1.5);
      const k = eo(S.t / 0.45);
      S.L(1, g => {
        g.fillStyle = MOOD.storm.grassD; g.fillRect(-400, 760, 2400, 400);
        withT(g, 900, 770, 1.25, 0, gg => {
          gg.rotate(-k * 0.0);
          p4Side(gg, lerpPose(P4P.stand, P4P.rear, k), { jaw: 0.6, expr: 'fury', wound: 2,
            onChest: g3 => withT(g3, 40, 40, 0.8, 0.5, g4 => dogSide(g4, 'rocker', 'hang', { expr: 'pain' }), true) });
        }, true);
      });
    } },
  { n: 21, dur: 0.8, cam: [{ k: 0, z: 1.0, x: 0, y: 0 }, { k: 1, z: 1.05, x: -60, y: -30 }],
    freeze: t => t > 0.28 && t < 0.48,
    cues: [[0, S => { S.sfx('throw'); S.say('arrows_pain_rocker'); }], [0.28, S => { S.sfx('freeze'); S.flash(0.25, '#ffffff'); }]],
    draw: S => {
      skyL(S, 1000, 'storm'); cloudsL(S, 1000, 'storm', 0.06, 23, 1.6);
      const tt = S.t < 0.28 ? S.t : S.t < 0.48 ? 0.28 : S.t - 0.2, k = clamp01(tt / 0.6);
      S.L(0.6, g => withT(g, 1300, 900, 1.15, 0, gg => p4Sil(gg, '#241a2a', P4P.rear), true));
      S.L(1, g => withT(g, lerp(1000, 300, k), 520 - Math.sin(k * Math.PI) * 330, 1.3, -k * 4.2, gg => dogSide(gg, 'rocker', 'fly', { expr: 'pain', lid: 0.5 })));
      if (S.t > 0.28 && S.t < 0.48) S.screen((g, w, h) => { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = h * 0.012; g.strokeRect(h * 0.03, h * 0.14, w - h * 0.06, h * 0.72); });
    } },
  { n: 22, dur: 1.0, cam: [{ k: 0, z: 1.05, y: -40 }, { k: 0.2, z: 1.0, y: 0, e: 'out' }, { k: 1, z: 1.03 }],
    cues: [[0.14, S => { S.sfx('bossLand'); S.sfx('thudDeep'); S.shake(1.1); dustBurst(S.P, 1000, 690, 22, { size: 54, speed: 700, jx: 500 }); }]],
    draw: S => {
      land(S, { hy: 500, m: 'storm', pile: [1450, 580, 0.6, 0.4], seed: 7 });
      const drop = S.t < 0.14 ? lerp(-180, 0, ei(S.t / 0.14)) : 0;
      S.L(0.85, g => {
        shockRing(g, 1000, 692, 900, (S.t - 0.14) / 0.7, { flat: 0.16 });
        withT(g, 1000, 690 + drop, 0.95, 0, gg => p4Side(gg, S.t < 0.14 ? P4P.leap : P4P.crouch, { jaw: 0.3, expr: 'fury', wound: 2 }), true);
        withT(g, 300, 700, 0.6, 0, gg => dogSide(gg, 'rocker', 'lie', { lid: 1 }));
      });
      fgGrass(S, 750, 60, 'storm', 1);
    } },
  { n: 23, dur: 2.4, cam: [{ k: 0, z: 1.0, x: 30 }, { k: 1, z: 1.12, x: 0 }],
    cues: [[0.2, S => S.say('arrows_fall_rocker', { hold: true })], [0.6, S => S.sfx('spirit')]],
    draw: S => {
      skyL(S, 860, 'storm'); cloudsL(S, 860, 'storm', 0.06, 27, 1.1); mountainsL(S, 760, 'storm', 0.12);
      S.L(0.5, g => spirit(g, 1100, 420, 1.6, clamp01((S.t - 0.6) / 2.4), 'rocker', { rise: 160 }));
      S.L(1, g => {
        g.fillStyle = MOOD.storm.grass; g.fillRect(-400, 600, 2400, 600);
        withT(g, 700, 470, 4.2, 0.28, gg => { gg.translate(-51, 4); headSide(gg, 'rocker', { expr: 'sad', lid: 0.5 + clamp01(S.k) * 0.4, jaw: jawOf(S, 'rocker', 0.2), look: [0.5, 0.2], ear: 0.6 }); });
        grass(g, -400, 2000, 660, 60, MOOD.storm.grassFG, 23);
      });
    } },

  // ============================ D. Third arrow: Heuler
  { n: 24, dur: 0.8, cam: [{ k: 0, z: 1.0 }, { k: 1, z: 1.1 }],
    draw: S => {
      S.L(0, g => skyGrad(g, -400, -400, 2400, 1600, MOOD.storm.sky));
      S.L(1, g => withT(g, 800, 380, 9.5, 0, gg => { gg.translate(22, 6); headFront(gg, 'heuler', { expr: 'sad', tear: clamp01(S.t / 0.75), look: [0.6, 0] }); }));
    } },
  { n: 25, dur: 0.5, cam: [{ k: 0, z: 1.0, r: -6 }, { k: 1, z: 1.12, r: -6, e: 'in' }],
    cues: [[0, S => { S.say('arrows_cry_heuler'); S.sfx('rushWhoosh'); }]],
    draw: S => {
      skyL(S, 1000, 'storm'); cloudsL(S, 900, 'storm', 0.04, 29, 1.3);
      S.L(0.3, g => { g.fillStyle = MOOD.storm.grassD; g.fillRect(-400, 720, 2400, 500); });
      S.screen((g, w, h) => speedLines(g, w, h, { mode: 'radial', cx: w * 0.86, cy: h * 0.38, n: 70, col: 'rgba(255,255,255,0.75)', inner: 0.12 }));
      S.L(1, g => withT(g, 760 + S.t * 300, 760, 2.7, -0.2, gg => dogSide(gg, 'heuler', step2(S.t, 'run1', 'leap'), { expr: 'fury', jaw: 0.35, teeth: true })));
    } },
  { n: 26, dur: 0.1, bg: '#000', cues: [[0, S => S.sfx('arrow_bite_3')]],
    draw: S => S.screen((g, w, h) => {
      impactFrame(g, w, h, w * 0.6, h * 0.45, { seed: 3 });
      g.setTransform(w / W, 0, 0, w / W, 0, (h - H * w / W) / 2);
      withT(g, 860, 560, 1.7, -0.3, gg => dogSil(gg, '#08070a', 'heuler', 'leap'));
    }) },
  { n: 27, dur: 1.0, cam: [{ k: 0, z: 1.25, r: 3 }, { k: 1, z: 1.12, r: 5 }],
    cues: [[0.06, S => { S.shake(1.0); S.P.add('tuft', 780, 410, 22, { speed: 1100, size: 30, life: 1.1, col: '#b47c40' }); S.P.add('spark', 780, 410, 24, { speed: 1700, life: 0.6, grav: 400, col: '#ffd890' }); }], [0.5, S => S.sfx('tear')]],
    draw: S => S.L(1, g => withT(g, 800 + Math.sin(S.t * 30) * 6, 410, 1.05, 0.1 + Math.sin(S.t * 9) * 0.03, gg => chestECU(gg, 3, eo(S.t / 0.1), 'heuler'))) },
  { n: 28, dur: 0.7, cam: [{ k: 0, z: 1.0 }, { k: 0.25, z: 1.22, e: 'out' }, { k: 1, z: 1.26 }],
    cues: [[0.05, S => S.sfx('roarPain')]],
    draw: S => S.L(1, g => withT(g, 800, 420, 1.15, 0, gg => p4EyeECU(gg, { expr: S.t > 0.12 ? 'wide' : 'beast', wide: S.t > 0.12, side: -1, look: [0, 0] }))) },
  { n: 29, dur: 1.2, cam: [{ k: 0, z: 1.0, x: 0 }, { k: 0.5, z: 1.04, x: 60 }, { k: 1, z: 1.0, x: 80 }],
    cues: [[0.0, S => S.say('arrows_pain_heuler')], [0.25, S => { S.sfx('whoosh_big'); S.sfx('tear'); S.shake(0.6); S.P.add('tuft', 820, 420, 14, { speed: 900, size: 24, col: '#efebe2' }); }]],
    draw: S => {
      skyL(S, 900, 'storm'); cloudsL(S, 800, 'storm', 0.05, 31, 1.3);
      const k = clamp01((S.t - 0.2) / 0.3), a = lerp(-0.5, 0.75, eo(k));
      S.screen((g, w, h) => { if (k > 0 && k < 1) speedLines(g, w, h, { mode: 'radial', cx: w * 0.4, cy: h * 0.5, n: 40, inner: 0.35, col: 'rgba(255,255,255,0.6)' }); });
      S.L(1, g => {
        const draw = (aa, al) => { g.globalAlpha = al; withT(g, 600, 420, 2.4, aa, gg => { withT(gg, 120, 60, 0.75, 0.6, g3 => dogSide(g3, 'heuler', 'fly', { expr: 'pain', lid: 0.6 })); p4HeadSide(gg, { jaw: 0.25, expr: 'fury' }); }); };
        if (k > 0 && k < 1) { draw(lerp(-0.5, 0.75, eo(k - 0.15)), 0.25); draw(lerp(-0.5, 0.75, eo(k - 0.08)), 0.4); }
        draw(a, 1); g.globalAlpha = 1;
      });
    } },
  { n: 30, dur: 1.6, cam: [{ k: 0, z: 1.0, r: -4 }, { k: 1, z: 1.08, r: 2 }],
    cues: [[0.95, S => { S.sfx('knockdown'); S.shake(1.2); dustBurst(S.P, 860, 700, 26, { size: 60, speed: 600, jx: 600 }); }]],
    draw: S => {
      skyL(S, 1000, 'storm'); cloudsL(S, 960, 'storm', 0.05, 33, 1.5); mountainsL(S, 900, 'storm', 0.12);
      const k = eo(clamp01(S.t / 1.0) * 0.95);              // slow motion topple
      S.L(0.8, g => {
        g.fillStyle = MOOD.storm.grass; g.fillRect(-400, 700, 2400, 500);
        shockRing(g, 860, 702, 1100, (S.t - 0.95) / 0.65, { flat: 0.14 });
        withT(g, 860, 700, 1.05, 0, gg => p4Side(gg, k < 0.5 ? lerpPose(P4P.rear, { ...P4P.rear, body: -100, y: -150 }, k * 2) : lerpPose({ ...P4P.rear, body: -100, y: -150 }, P4P.back, (k - 0.5) * 2), { jaw: 0.6, expr: 'fury', wound: 3 }), true);
        const hk = clamp01(S.t / 0.8);
        withT(g, lerp(700, 220, hk), 680 - Math.sin(hk * Math.PI) * 240 + (hk >= 1 ? 20 : 0), 0.7, hk * 5, gg => dogSide(gg, 'heuler', hk >= 1 ? 'lie' : 'fly', { lid: 1 }));
      });
      fgGrass(S, 760, 60, 'storm', 1);
    } },
  { n: 31, dur: 2.6, cam: [{ k: 0, z: 1.0, y: 10 }, { k: 1, z: 1.14, y: -20 }],
    cues: [[0.2, S => S.say('arrows_fall_heuler', { hold: true })], [0.5, S => S.sfx('spirit')]],
    draw: S => {
      skyL(S, 860, 'dusk'); cloudsL(S, 820, 'dusk', 0.06, 35, 1.2);
      S.L(0.45, g => { spirit(g, 520, 360, 1.2, clamp01((S.t - 0.3) / 3), 'robert', { rise: 140 }); spirit(g, 1180, 330, 1.2, clamp01((S.t - 0.6) / 3), 'rocker', { rise: 140 }); spirit(g, 860, 300, 1.3, clamp01((S.t - 1.0) / 3), 'heuler', { rise: 140 }); });
      S.L(1, g => {
        g.fillStyle = MOOD.dusk.grass; g.fillRect(-400, 610, 2400, 600);
        g.globalAlpha = 1 - clamp01((S.t - 1.8) / 2) * 0.35;
        withT(g, 820, 480, 4.0, -0.3, gg => { gg.translate(-51, 4); headSide(gg, 'heuler', { expr: 'sad', lid: 0.55 + clamp01(S.k) * 0.45, jaw: jawOf(S, 'heuler', 0.2), look: [-0.2, 0.3], ear: 0.3 }); }, true);
        g.globalAlpha = 1;
        grass(g, -400, 2000, 670, 60, MOOD.dusk.grassFG, 31);
      });
    } },

  // ============================ E. The fourth arrow: Jerome
  { n: 32, dur: 1.4, cam: [{ k: 0, z: 1.0 }, { k: 0.5, z: 1.02 }, { k: 0.56, z: 1.35, e: 'out' }, { k: 1, z: 1.4 }],
    cues: [[0.1, S => S.say('arrows_fourth', { hold: true })], [0.7, S => { S.shake(0.4); S.sfx('cutin'); }]],
    draw: S => {
      S.L(0, g => skyGrad(g, -400, -400, 2400, 1600, MOOD.dusk.sky));
      const fury = S.t > 0.7;
      if (fury) S.screen((g, w, h) => speedLines(g, w, h, { mode: 'radial', cx: w / 2, cy: h * 0.45, n: 60, col: 'rgba(255,240,220,0.5)', inner: 0.42 }));
      S.L(1, g => withT(g, 800, 440, 5.6, 0, gg => headFront(gg, 'jerome', { expr: fury ? 'fury' : 'sad', mouth: fury ? 0.25 + S.talk('jerome') * 0.5 : 0, teeth: fury })));
    } },
  { n: 33, dur: 0.6, cam: [{ k: 0, z: 1.0, r: 3 }, { k: 1, z: 1.0, r: 3 }],
    cues: [[0, S => { S.sfx('rushWhoosh'); S.sfx('gallopIn'); }]],
    draw: S => {
      streaks(S, 360, 'dusk', 3600);
      S.L(1, g => withT(g, 720 + S.t * 200, 640, 2.4, 0, gg => dogSide(gg, 'jerome', step2(S.t, 'run1', 'run2'), { expr: 'fury', jaw: 0.3, teeth: true })));
      S.screen((g, w, h) => speedLines(g, w, h, { mode: 'h', dir: -1, n: 50 }));
    } },
  { n: 34, dur: 0.8, cam: [{ k: 0, z: 1.0, x: -150 }, { k: 1, z: 1.0, x: 200, e: 'out' }],
    cues: [[0, S => S.sfx('whoosh_big')], [0.36, S => { S.sfx('bite_snap'); S.shake(0.3); }]],
    draw: S => {
      land(S, { hy: 470, m: 'dusk', clouds: 1, seed: 9 });
      const k = eo(S.t / 0.5);
      S.L(0.85, g => {
        withT(g, lerp(1000, 1500, k), 640 - Math.sin(clamp01(S.t / 0.6) * Math.PI) * 160, 0.85, 0, gg => p4Side(gg, P4P.leap, { jaw: 0.2, expr: 'beast', wound: 3 }), true);
        const jaw = S.t < 0.36 ? 0.5 : 0;
        withT(g, lerp(500, 880, eo(S.t / 0.4)), 560, 1.2, -0.12, gg => dogSide(gg, 'jerome', 'leap', { expr: 'fury', jaw, teeth: true }));
        if (S.t > 0.36 && S.t < 0.56) { g.strokeStyle = '#fff6e0'; g.lineWidth = 6; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g.beginPath(); g.moveTo(1060 + Math.cos(a) * 40, 470 + Math.sin(a) * 40); g.lineTo(1060 + Math.cos(a) * 110, 470 + Math.sin(a) * 110); g.stroke(); } }
      });
      S.screen((g, w, h) => { if (S.t < 0.5) speedLines(g, w, h, { mode: 'h', dir: 1, n: 40, col: 'rgba(255,255,255,0.6)' }); });
    } },
  { n: 35, dur: 1.0, cam: [{ k: 0, z: 1.0, x: 0 }, { k: 1, z: 1.08, x: 30 }],
    cues: [[0.05, S => { dustBurst(S.P, 470, 690, 10, { size: 36 }); S.sfx('stepRock'); }]],
    draw: S => {
      skyL(S, 700, 'dusk'); cloudsL(S, 640, 'dusk', 0.06, 37, 1); mountainsL(S, 620, 'dusk', 0.12); meadowL(S, 620, 'dusk', 0.3);
      S.L(0.6, g => withT(g, 1240, 330, 2.0, 0.08, gg => p4HeadSide(gg, { expr: 'fury', look: [S.t > 0.45 ? 1 : -0.4, 0.2] }), true));
      S.L(1, g => withT(g, 480, 720, 2.2, 0, gg => dogSide(gg, 'jerome', 'crouch', { expr: 'fury', jaw: 0.1, teeth: true, look: [1, 0] })));
    } },
  { n: 36, dur: 2.2, cam: [{ k: 0, z: 1.0, x: -20 }, { k: 1, z: 1.1, x: 10 }],
    cues: [[0.25, S => S.say('arrows_thanks', { hold: true })], [0.3, S => S.sfx('spirit')]],
    draw: S => {
      skyL(S, 860, 'dusk'); cloudsL(S, 780, 'dusk', 0.06, 39, 1.1);
      S.L(0.35, g => { spirit(g, 1020, 380, 1.1, clamp01((S.t + 0.6) / 3.6), 'robert', { rise: 120 }); spirit(g, 1250, 300, 1.1, clamp01((S.t + 0.3) / 3.6), 'rocker', { rise: 120 }); spirit(g, 1450, 420, 1.1, clamp01(S.t / 3.6), 'heuler', { rise: 120 }); });
      S.L(1, g => withT(g, 640, 450, 3.4, 0.08, gg => {
        ink(gg, [[-10, 20], [40, 30], [70, 140], [-60, 160], [-40, 60]], { fill: DOGS.jerome.base, shade: DOGS.jerome.shade, light: [5, -6], hatch: true, seed: 36,
          marks: g2 => { g2.fillStyle = DOGS.jerome.dark; g2.fill(path(g2, [[-80, 0], [-4, 6], [10, 60], [-20, 170], [-90, 170]], { seed: 37 })); } });
        headSide(gg, 'jerome', { expr: 'sad', jaw: jawOf(S, 'jerome', 0.2), lid: 0.3, look: [1, -0.4], eyeScale: 1.1 });
      }));
    } },
  { n: 37, dur: 2.0, cam: [{ k: 0, z: 1.08, x: 20 }, { k: 1, z: 1.0, x: -20 }],
    cues: [[0.15, S => S.say('arrows_now', { hold: true })], [0.6, S => { S.sfx('growl'); }]],
    draw: S => {
      land(S, { hy: 480, m: 'dusk', pile: [1300, 570, 0.9, 0.45], seed: 11 });
      S.L(0.3, g => { for (let i = 0; i < 3; i++) spirit(g, 600 + i * 260, 230 - i * 20, 0.8, clamp01(0.55 + S.t / 3), MEN[i], { rise: 120, alpha: 0.9 }); });
      const k = eo(S.t / 1.6);
      S.L(0.5, g => withT(g, 1300, 480, 0.55, 0, gg => p4Side(gg, lerpPose(P4P.crouch, P4P.stand, k), { wound: 3, expr: 'fury' }), true));
      S.L(0.75, g => { withT(g, 230, 660, 0.55, 0, gg => dogSide(gg, 'weed', 'alert', { expr: 'determined' })); withT(g, 420, 672, 0.62, 0, gg => dogSide(gg, 'jerome', 'alert', { expr: 'fury' })); });
      fgGrass(S, 730, 50, 'dusk', 1, 0.5);
    } },
];
