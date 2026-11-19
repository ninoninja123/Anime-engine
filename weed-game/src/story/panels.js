// "Story so far" scenes: each function returns the layers of one painted panel (far → near).
// Layer: { d: depth 0..1 (parallax + camera push strength), cls: CSS classes (src/prologue.css: pl-pulse, pl-drift,
// pl-rays, pl-flicker, beat targets bt-*), origin: CSS transform-origin, html: <svg> }. Built once per panel, then only
// moved with CSS transforms / opacity, so the phone composites them instead of repainting.
//
// Composition (viewBox 1600 x 800 on a landscape phone, letterbox bars + subtitles at the bottom): keep faces,
// eyes and key silhouettes between y ≈ 180 and y ≈ 545. Below ~550 the subtitles sit: only dark ground there.
import { W, H, defs, layer, ridge, hill, hillY, pines, crowns, deadTree, dots, cloud, rays, place, dog, bear, monster, human, circ, smooth } from './svg.js';

const mist = (df, x, y, w, h, col, a) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="${df.rad([[0, col, a], [1, col, 0]])}"/>`;
const glow = (df, x, y, r, col, a = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${df.rad([[0, col, a], [0.35, col, a * 0.35], [1, col, 0]])}"/>`;
const sunRays = (df, x, y, n, len, col, a, opt) => rays(x, y, n, len, df.rad([[0, col, a], [0.55, col, a * 0.35], [1, col, 0]], { cx: x, cy: y, r: len, user: true }), opt);
const sky = (df, stops) => `<rect y="-40" width="${W}" height="${H + 80}" fill="${df.lin(stops)}"/>`;

// ------------------------------------------------------------------------------------------- 1 legend
function legend() {
  const L = []; let d = defs('lg0');
  L.push(layer(0, `${sky(d, [[0, '#03081a'], [0.5, '#14224a'], [0.75, '#2a3d70'], [1, '#33497e']])}${dots(11, 140, { y1: 460, op: [0.2, 0.7] })}
    ${glow(d, 1180, 300, 380, '#9fb8ff', 0.26)}
    <circle cx="1180" cy="300" r="64" fill="${d.rad([[0, '#fffdf0'], [0.75, '#f1eedc'], [1, '#d4d6e6']], { cx: 0.42, cy: 0.4 })}"/>
    <path d="${circ(1160, 284, 12)}${circ(1202, 322, 8)}${circ(1196, 274, 5)}" fill="#c9cadb" opacity="0.45"/>`, { defs: d }));
  d = defs('lg1');
  L.push(layer(0.04, glow(d, 1180, 300, 200, '#dfe8ff', 0.32), { defs: d, cls: 'pl-pulse' }));
  d = defs('lg2'); const cf = d.lin([[0, '#5a6fa6'], [1, '#2a3a68']]);
  L.push(layer(0.1, cloud(380, 250, 560, 50, cf, 0.45, 1) + cloud(960, 340, 620, 38, cf, 0.35, 2) + cloud(1500, 228, 440, 36, cf, 0.32, 3), { defs: d, cls: 'pl-drift' }));
  d = defs('lg3');
  L.push(layer(0.2, `<path d="${ridge(3, { y: 480, amp: 190, peaks: 3.2, sharp: 0.7 })}" fill="${d.lin([[0, '#6a80b8'], [0.45, '#3a4e84'], [1, '#26365f']])}"/>
    ${mist(d, 800, 480, 1100, 70, '#a9bce8', 0.35)}`, { defs: d }));
  d = defs('lg4');
  L.push(layer(0.35, `<path d="${ridge(8, { y: 540, amp: 130, peaks: 4.5, sharp: 0.5 })}" fill="${d.lin([[0, '#2d3e70'], [1, '#141f3e']])}"/>
    ${mist(d, 500, 550, 900, 60, '#8ea4d8', 0.28)}`, { defs: d }));
  // near ridge: a crag under the moon, a lone dog howling on it
  d = defs('lg5'); const gy = x => hillY(21, x, { y: 610, amp: 36, waves: 1.5 });
  const crag = smooth([[930, 700], [1010, 560], [1060, 488], [1110, 462], [1170, 458, 1], [1220, 476], [1262, 530], [1330, 620], [1400, 700]], 0.16);
  L.push(layer(0.55, `<path d="${hill(21, { y: 610, amp: 36, waves: 1.5 })}${crag}" fill="#0d1530"/>
    <path d="${pines(5, { gy, n: 36, h: [40, 96] })}" fill="#0b1229"/>
    <path d="${smooth([[1060, 488], [1110, 462], [1170, 458, 1], [1150, 470], [1100, 476]], 0.2)}" fill="#4a5f98" opacity="0.55"/>
    ${place(1095, 462, 1.0, dog('#070b1b', { pose: 'howl' }), { cls: 'pl-breathe' })}`, { defs: d }));
  d = defs('lg6');
  L.push(layer(0.95, `<path d="${pines(9, { gy: () => 820, n: 7, x0: -140, x1: 360, h: [300, 470] })}${pines(19, { gy: () => 830, n: 5, x0: 1420, x1: 1760, h: [320, 460] })}" fill="#03060f"/>
    <rect y="${H - 120}" width="${W}" height="200" fill="${d.lin([[0, '#03060f', 0], [0.6, '#03060f']])}"/>`, { defs: d }));
  return L;
}

// ------------------------------------------------------------------------------------------- 2 Gin's village
function village() {
  const L = []; let d = defs('vg0');
  L.push(layer(0, `${sky(d, [[0, '#271f4a'], [0.42, '#6b4677'], [0.62, '#d97d6a'], [0.75, '#f6b07a'], [1, '#f6b07a']])}
    ${dots(12, 40, { y1: 240, op: [0.15, 0.5] })}${glow(d, 330, 420, 420, '#ffb070', 0.5)}<circle cx="330" cy="420" r="40" fill="#ffe2b0"/>`, { defs: d }));
  d = defs('vg1');
  L.push(layer(0.15, `<path d="${ridge(31, { y: 450, amp: 170, peaks: 3, sharp: 0.75 })}" fill="${d.lin([[0, '#d0c2e4'], [0.35, '#7d6ea0'], [1, '#56497a']])}"/>
    ${mist(d, 700, 450, 1000, 60, '#f3c3b0', 0.4)}`, { defs: d }));
  d = defs('vg2'); const gy = x => hillY(33, x, { y: 490, amp: 26, waves: 1.2 });
  const hx = 1130, hy = gy(1130) + 6;
  const house = `<path d="M${hx - 104},${hy} L${hx - 104},${hy - 50} L${hx + 104},${hy - 50} L${hx + 104},${hy}Z" fill="#2a2140"/>
    <path d="M${hx - 140},${hy - 44} L${hx},${hy - 150} L${hx + 140},${hy - 44}Z" fill="#3a2f55"/>
    <path d="M${hx - 140},${hy - 44} L${hx},${hy - 150} L${hx + 140},${hy - 44} L${hx + 118},${hy - 52} L${hx},${hy - 134} L${hx - 118},${hy - 52}Z" fill="#efe9f7"/>
    <rect x="${hx - 70}" y="${hy - 40}" width="34" height="24" fill="#ffc46a"/><rect x="${hx + 32}" y="${hy - 40}" width="34" height="24" fill="#ffb04f"/>
    <rect x="${hx + 54}" y="${hy - 160}" width="16" height="40" fill="#2a2140"/>`;
  L.push(layer(0.4, `<path d="${hill(33, { y: 490, amp: 26, waves: 1.2 })}" fill="${d.lin([[0, '#e4dcf0'], [1, '#a99fc8']])}"/>
    <path d="${pines(35, { gy, n: 20, x0: -40, x1: 920, h: [50, 110] })}${pines(36, { gy, n: 7, x0: 1300, x1: 1660, h: [60, 130] })}" fill="#3a3158"/>${house}`, { defs: d }));
  d = defs('vg3');
  L.push(layer(0.4, glow(d, hx - 53, hy - 28, 80, '#ffb050', 0.7) + glow(d, hx + 49, hy - 28, 80, '#ffb050', 0.6), { defs: d, cls: 'pl-flicker' }));
  // Gohee the hunter, the boy Daisuke and young Gin walking home through the snow at dusk
  d = defs('vg4'); const fy = x => hillY(41, x, { y: 560, amp: 16, waves: 1 });
  L.push(layer(0.75, `<path d="${hill(41, { y: 560, amp: 16, waves: 1 })}" fill="${d.lin([[0, '#f4effa'], [0.4, '#cfc6e2'], [1, '#8f86b0']])}"/>
    <path d="M200,${fy(200) + 14} Q700,${fy(700) - 2} 1400,${fy(1400) + 18}" stroke="#b3a8cf" stroke-width="12" fill="none" opacity="0.55"/>
    ${place(560, fy(560) + 4, 1.12, human('#1d1730', 'hunter'))}${place(632, fy(632) + 4, 1.12, human('#1d1730', 'boy'))}
    ${place(668, fy(700) + 4, 0.82, dog('#1d1730', { pose: 'stand' }), { cls: 'pl-breathe' })}`, { defs: d }));
  return L;
}

// ------------------------------------------------------------------------------------------- 3 Akakabuto on Gajō
function akakabuto() {
  const L = []; let d = defs('ak0');
  L.push(layer(0, `${sky(d, [[0, '#0d0207'], [0.45, '#3d070c'], [0.72, '#8a1810'], [1, '#b0301a']])}
    ${glow(d, 1340, 250, 340, '#ff3018', 0.45)}<circle cx="1340" cy="250" r="56" fill="#d23a22"/><circle cx="1340" cy="250" r="56" fill="${d.rad([[0, '#ff8a5a', 0.6], [1, '#7a0a06', 0]], { cx: 0.4, cy: 0.38 })}"/>`, { defs: d }));
  d = defs('ak1'); const cf = d.lin([[0, '#1a0306'], [1, '#3a0808']]);
  L.push(layer(0.1, cloud(300, 210, 700, 60, cf, 0.8, 4) + cloud(1000, 150, 800, 70, cf, 0.75, 5) + cloud(1420, 330, 520, 34, cf, 0.55, 6) + cloud(640, 360, 700, 30, cf, 0.45, 7), { defs: d, cls: 'pl-drift fast' }));
  d = defs('ak2');
  L.push(layer(0.22, `<path d="${ridge(51, { y: 520, amp: 170, peaks: 3.6, sharp: 0.8 })}" fill="${d.lin([[0, '#3a0f12'], [1, '#1c070a']])}"/>
    ${mist(d, 800, 520, 1100, 60, '#ff5a3a', 0.18)}`, { defs: d }));
  // Gajō: a rock fortress on the pass; Akakabuto on top of it, roaring down at the dogs
  d = defs('ak3');
  const gajo = smooth([[700, 820], [780, 610], [850, 520, 1], [880, 470], [940, 432], [1040, 424, 1], [1120, 440], [1170, 500], [1230, 560, 1], [1300, 640], [1380, 820]], 0.14);
  L.push(layer(0.45, `<path d="${hill(55, { y: 640, amp: 22, waves: 2 })}" fill="#120507"/><path d="${gajo}" fill="${d.lin([[0, '#20090b'], [1, '#080203']])}"/>
    <path d="${smooth([[880, 470], [940, 432], [1040, 424, 1], [1020, 440], [950, 446]], 0.2)}" fill="#8a2a1a" opacity="0.5"/>`, { defs: d }));
  d = defs('ak4');
  L.push(layer(0.5, `<g class="bt-roar" style="transform-origin:1000px 428px">${place(1150, 430, 2.0, bear('#040102', { helmet: '#4a0c08' }), { flip: true })}
    <g class="pl-pulse fast">${glow(d, 882, 255, 30, '#ff2a10', 1)}</g><circle cx="882" cy="255" r="3.4" fill="#ffd0b0"/></g>`, { defs: d }));
  // small dogs in the snow below, for scale
  d = defs('ak5');
  L.push(layer(0.85, `<path d="${hill(57, { y: 590, amp: 14, waves: 2.4 })}" fill="${d.lin([[0, '#4a242a'], [0.3, '#26100f'], [1, '#100506']])}"/>
    ${place(250, 580, 0.6, dog('#050103'))}${place(372, 586, 0.55, dog('#050103', { tail: 'down' }))}${place(140, 590, 0.5, dog('#050103', { tail: 'down' }))}`, { defs: d }));
  return L;
}

// ------------------------------------------------------------------------------------------- 4 the Ōu army + Battōga
function battle() {
  const L = []; let d = defs('bt0');
  L.push(layer(0, `${sky(d, [[0, '#18234a'], [0.42, '#6a5a86'], [0.62, '#f0a070'], [0.75, '#ffd08a'], [1, '#ffd08a']])}
    ${glow(d, 1300, 470, 520, '#ffcf80', 0.55)}<circle cx="1300" cy="470" r="44" fill="#fff4d8"/>`, { defs: d }));
  d = defs('bt1');
  L.push(layer(0.05, sunRays(d, 1300, 470, 16, 1300, '#fff0c0', 0.22, { a0: Math.PI * 0.95, a1: Math.PI * 1.9, width: 0.025 }), { defs: d, cls: 'pl-rays', origin: '81% 59%' }));
  d = defs('bt2');
  L.push(layer(0.18, `<path d="${ridge(61, { y: 500, amp: 190, peaks: 3, sharp: 0.7 })}" fill="${d.lin([[0, '#a69bc0'], [0.4, '#6c6390'], [1, '#4a446e']])}"/>
    ${mist(d, 900, 500, 1000, 70, '#ffd8b0', 0.35)}`, { defs: d }));
  // the army on the ridge (left), the bear on a rock (right)
  d = defs('bt3'); const gy = x => 560 - 110 * Math.exp(-(((x - 360) / 340) ** 2));
  let army = '';
  [[150, 0.62, 'stand'], [232, 0.7, 'stand'], [306, 0.68, 'howl'], [380, 0.84, 'stand'], [462, 0.72, 'stand'], [536, 0.64, 'stand'], [602, 0.58, 'stand'], [662, 0.52, 'stand'], [80, 0.54, 'stand']]
    .forEach(([x, s, pose], i) => { army += place(x, gy(x + 50 * s) + 4, s, dog('#121428', { pose, tail: i % 3 ? 'curl' : 'down' }), { cls: i % 2 ? 'pl-breathe' : 'pl-breathe late' }); });
  let pts = ''; for (let x = -40; x <= 1640; x += 20) pts += ` L${x},${gy(x).toFixed(1)}`;
  L.push(layer(0.5, `<path d="M-40,880${pts} L1640,880Z" fill="${d.lin([[0, '#2a2b48'], [1, '#14152a']])}"/>
    <path d="${smooth([[1100, 880], [1150, 600], [1200, 500], [1280, 476, 1], [1400, 480], [1470, 540], [1530, 880]], 0.14)}" fill="#14152a"/>${army}`, { defs: d }));
  d = defs('bt4');
  L.push(layer(0.52, `<g class="bt-fall" style="transform-origin:1240px 482px">${place(1410, 482, 1.5, bear('#0a0a16', { helmet: '#5a1a14' }), { flip: true })}
    <g class="pl-pulse fast">${glow(d, 1203, 350, 18, '#ff3018', 1)}</g></g>`, { defs: d }));
  // Battōga: the silver dog crosses the frame in one spinning strike (beat 'battoga')
  d = defs('bt5');
  L.push(layer(0.7, `<path class="slash" d="M560,440 C760,200 1040,190 1290,330" stroke="${d.lin([[0, '#ffffff', 0], [0.6, '#e6f0ff', 0.9], [1, '#ffffff']], { x1: 0, y1: 0, x2: 1, y2: 0 })}" stroke-width="18" stroke-linecap="round" fill="none"/>
    <g class="gin">${glow(d, 1150, 300, 140, '#d8e8ff', 0.85)}${place(1090, 330, 1.25, dog('#f2f6ff', { pose: 'stand', tail: 'up' }), { rot: -12 })}</g>`, { defs: d, cls: 'bt-battoga' }));
  return L;
}

// ------------------------------------------------------------------------------------------- 5 paradise / fourteen years
function paradise() {
  const L = []; let d = defs('pd0');
  L.push(layer(0, `${sky(d, [[0, '#3d7ec4'], [0.55, '#8cc0e8'], [0.75, '#e2f2fb'], [1, '#e2f2fb']])}
    ${glow(d, 360, 250, 380, '#fff8d8', 0.6)}<circle cx="360" cy="250" r="44" fill="#fffdf0"/>`, { defs: d }));
  d = defs('pd1'); const cf = d.lin([[0, '#ffffff'], [1, '#c4d8ec']]);
  L.push(layer(0.1, cloud(760, 250, 420, 60, cf, 0.92, 8) + cloud(1280, 200, 480, 70, cf, 0.85, 9) + cloud(1540, 330, 300, 40, cf, 0.6, 10) + cloud(120, 340, 300, 34, cf, 0.5, 11), { defs: d, cls: 'pl-drift' }));
  d = defs('pd2');
  L.push(layer(0.2, `<path d="${ridge(71, { y: 450, amp: 170, peaks: 3.4, sharp: 0.6 })}" fill="${d.lin([[0, '#d2e2f2'], [0.28, '#8fadca'], [1, '#6f93b0']])}"/>
    ${mist(d, 800, 450, 1100, 50, '#ffffff', 0.45)}`, { defs: d }));
  d = defs('pd3'); const gy = x => hillY(73, x, { y: 520, amp: 30, waves: 1.6 });
  L.push(layer(0.4, `<path d="${hill(73, { y: 520, amp: 30, waves: 1.6 })}" fill="${d.lin([[0, '#86b86e'], [1, '#4f8a4e']])}"/>
    <path d="M-40,575 C300,540 520,566 760,548 S1200,530 1640,556 L1640,576 C1200,552 900,580 760,572 S300,570 -40,600Z" fill="#e2f2fa" opacity="0.8"/>
    <path d="${crowns(75, { gy, n: 9, x0: -40, x1: 480, r: [24, 40] })}${crowns(76, { gy, n: 6, x0: 1240, x1: 1640, r: [26, 44] })}" fill="#3f7a44"/>
    <path d="${crowns(77, { gy, n: 3, x0: 520, x1: 1100, r: [20, 30] })}" fill="#f2b8c8"/>
    ${place(600, gy(600) + 3, 0.42, dog('#2c5232', { pose: 'lie' }))}${place(700, gy(700) + 3, 0.42, dog('#2c5232', { pose: 'sit' }), { flip: true })}
    ${place(860, gy(880) + 3, 0.44, dog('#2c5232', { pose: 'stand', tail: 'down' }), { flip: true, cls: 'pl-breathe' })}${place(900, gy(920) + 3, 0.34, dog('#2c5232'))}`, { defs: d }));
  // Gin, leader of Ōu, on a rock overlooking the valley
  d = defs('pd4');
  L.push(layer(0.8, `<path d="${smooth([[1060, 880], [1120, 600], [1190, 520], [1300, 506, 1], [1400, 530], [1460, 620], [1500, 880]], 0.14)}" fill="${d.lin([[0, '#4a6a48'], [1, '#1d321e']])}"/>
    <path d="${hill(79, { y: 640, amp: 16, waves: 2 })}" fill="#25402a"/>
    ${glow(d, 1290, 450, 170, '#ffffff', 0.4)}${place(1220, 512, 1.05, dog('#eef2fa', { pose: 'stand' }), { cls: 'pl-breathe' })}`, { defs: d }));
  // beat 'years': fourteen years pass – the light turns into a long golden evening
  d = defs('pd5');
  L.push(layer(0, sky(d, [[0, '#5a3a6a', 0.55], [0.55, '#e88a5a', 0.4], [1, '#ffcf80', 0.5]]), { defs: d, cls: 'bt-years' }));
  return L;
}

// ------------------------------------------------------------------------------------------- 6 now: the ruined paradise
function ruin() {
  const L = []; let d = defs('rn0');
  L.push(layer(0, `${sky(d, [[0, '#040509'], [0.5, '#15111a'], [0.7, '#3a1810'], [1, '#6a2a12']])}
    ${dots(13, 60, { y1: 340, op: [0.1, 0.4] })}${glow(d, 380, 560, 640, '#ff6a20', 0.35)}`, { defs: d }));
  // far away, under a clearing moon, Gin on his long journey (beat 'far')
  d = defs('rn1');
  L.push(layer(0.08, `${glow(d, 1400, 230, 210, '#cfd8f0', 0.35)}<circle cx="1400" cy="230" r="34" fill="#e8ecf6"/>
    <path d="${ridge(83, { y: 360, amp: 40, peaks: 2, sharp: 0.3, x0: 1180, x1: 1620, bottom: 420 })}" fill="#1c1d2c"/>
    ${place(1380, 330, 0.34, dog('#dfe6f4', { pose: 'walk' }), { flip: true, cls: 'walking' })}`, { defs: d, cls: 'bt-far' }));
  d = defs('rn2'); const cf = d.lin([[0, '#1e1a22'], [1, '#2a1a18']]);
  L.push(layer(0.12, cloud(400, 200, 800, 70, cf, 0.92, 12) + cloud(1150, 150, 700, 80, cf, 0.92, 13) + cloud(900, 330, 900, 36, cf, 0.6, 14), { defs: d, cls: 'pl-drift' }));
  d = defs('rn3');
  L.push(layer(0.24, `<path d="${ridge(85, { y: 520, amp: 150, peaks: 3.2, sharp: 0.7 })}" fill="${d.lin([[0, '#2a1d1e'], [1, '#161012']])}"/>
    ${mist(d, 600, 530, 900, 50, '#ff7a30', 0.2)}`, { defs: d }));
  // Gajō, taken by the monster
  d = defs('rn4');
  const gajo = smooth([[780, 860], [850, 600], [910, 500, 1], [950, 440], [1030, 408], [1120, 404, 1], [1180, 440], [1230, 520, 1], [1320, 640], [1400, 860]], 0.14);
  L.push(layer(0.45, `<path d="${gajo}" fill="#0c0809"/><g class="bt-roar" style="transform-origin:1080px 410px">${place(1190, 410, 1.3, monster('#050304'), { flip: true })}
    <g class="pl-pulse fast">${glow(d, 1001, 300, 18, '#ff9a2a', 1)}</g><circle cx="1001" cy="300" r="2.8" fill="#ffe2a0"/></g>`, { defs: d }));
  // withered forest; hunters with lights step in (beat 'hunt')
  d = defs('rn5'); const gy = x => hillY(87, x, { y: 580, amp: 24, waves: 1.4 });
  let trees = ''; [[70, 320], [240, 230], [560, 200], [700, 150], [1440, 300], [1570, 250]].forEach(([x, h], i) => { trees += deadTree(90 + i, x, gy(x) + 4, h, '#0a0708', 12); });
  L.push(layer(0.75, `<path d="${hill(87, { y: 580, amp: 24, waves: 1.4 })}" fill="#0a0708"/>${trees}`, { defs: d }));
  d = defs('rn6'); const beam = (x, y, a, len, al) => sunRays(d, x, y, 1, len, '#fff4d0', al, { a0: a, a1: a, width: 0.055 });
  L.push(layer(0.8, `<g class="beam" style="transform-origin:330px 470px">${beam(330, 470, -0.38, 1200, 0.42)}</g>
    <g class="beam b2" style="transform-origin:470px 480px">${beam(470, 480, -0.22, 1100, 0.34)}</g>
    ${place(300, gy(300) + 6, 1.3, human('#050304', 'aim'))}${place(445, gy(445) + 6, 1.2, human('#050304', 'aim'))}${place(170, gy(170) + 6, 1.25, human('#050304', 'hunter'))}`, { defs: d, cls: 'bt-hunt' }));
  return L;
}

// ------------------------------------------------------------------------------------------- 7 Weed sets out
function weed() {
  const L = []; let d = defs('wd0');
  L.push(layer(0, `${sky(d, [[0, '#34437a'], [0.4, '#b06a78'], [0.6, '#f2a066'], [0.72, '#ffe0a0'], [1, '#ffe0a0']])}
    ${glow(d, 1150, 440, 560, '#ffd890', 0.6)}<circle cx="1150" cy="440" r="48" fill="#fff4d6"/>`, { defs: d }));
  d = defs('wd1');
  L.push(layer(0.05, sunRays(d, 1150, 440, 18, 1300, '#fff2c8', 0.2, { a0: Math.PI * 0.92, a1: Math.PI * 2.08, width: 0.022, seed: 9 }), { defs: d, cls: 'pl-rays', origin: '72% 55%' }));
  d = defs('wd2');
  L.push(layer(0.15, `<path d="${ridge(91, { y: 480, amp: 200, peaks: 3.4, sharp: 0.75 })}" fill="${d.lin([[0, '#c49aa8'], [0.4, '#8f7298'], [1, '#6c5a86']])}"/>
    ${mist(d, 900, 480, 1100, 60, '#ffd8b8', 0.45)}`, { defs: d }));
  d = defs('wd3'); const gy = x => hillY(93, x, { y: 520, amp: 28, waves: 1.3 });
  L.push(layer(0.35, `<path d="${hill(93, { y: 520, amp: 28, waves: 1.3 })}" fill="${d.lin([[0, '#a0604a'], [1, '#6a3a30']])}"/>
    <path d="${crowns(95, { gy, n: 9, x0: -40, x1: 620, r: [24, 40] })}" fill="#c8562a"/><path d="${crowns(96, { gy, n: 7, x0: 1280, x1: 1640, r: [22, 40] })}" fill="#a83e22"/>
    <path d="${crowns(97, { gy, n: 5, x0: 100, x1: 560, r: [16, 28] })}${crowns(98, { gy, n: 4, x0: 1320, x1: 1600, r: [16, 26] })}" fill="#e3a040"/>`, { defs: d }));
  // the path leads toward the mountains of Ōu; Weed walks it alone
  d = defs('wd4'); const fy = x => hillY(99, x, { y: 572, amp: 12, waves: 1 });
  L.push(layer(0.7, `<path d="${hill(99, { y: 572, amp: 12, waves: 1 })}" fill="${d.lin([[0, '#6a3a24'], [0.5, '#3a1e12'], [1, '#22120a']])}"/>
    <path d="M-40,760 C260,690 520,${fy(620) + 6} 860,${fy(860) - 2} S1120,${fy(1120) - 8} 1200,${fy(1200) - 8} L1226,${fy(1226) - 8} C1080,${fy(1080) + 4} 820,${fy(800) + 22} 280,790Z" fill="#d8a47a" opacity="0.55"/>
    <g class="weed-walk">${place(560, fy(600) + 4, 1.05, dog('#1c0f0a', { pose: 'walk' }), { cls: 'walking' })}</g>`, { defs: d }));
  d = defs('wd5');
  L.push(layer(0.95, `<path d="M-60,880 L-60,640 C40,630 120,660 200,700 L260,880Z M1660,880 L1660,630 C1560,640 1480,680 1420,730 L1380,880Z" fill="#160a06"/>
    <path d="M60,646 L70,580 M90,652 L104,600 M130,664 L128,610 M1560,640 L1550,580 M1520,652 L1530,600" stroke="#160a06" stroke-width="5" stroke-linecap="round"/>`, { defs: d }));
  return L;
}

export const SCENES = { legend, village, akakabuto, battle, paradise, ruin, weed };
