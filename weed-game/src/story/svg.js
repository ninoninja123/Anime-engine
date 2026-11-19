// SVG toolkit for the "Story so far" intro (src/story/panels.js → src/prologue.js).
// Everything is drawn with code: flat shapes, gradients and silhouettes. No images, no blur filters.
// Coordinates: every layer uses viewBox 0 0 W H (W = 1600, H = 800, ~2:1 like a landscape phone) with
// preserveAspectRatio "xMidYMid slice". Ground line is y; positive y is down.

export const W = 1600, H = 800;

/** Deterministic random numbers (same art every run). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f1 = n => Math.round(n * 10) / 10;

/**
 * Collects <defs> for one <svg>. Ids are prefixed so several layers / panels can live in one document.
 *   const d = defs('p1a'); d.lin([[0,'#000'],[1,'#fff']], {x2:0,y2:1}) → 'url(#p1a0)'
 */
export function defs(prefix) {
  let n = 0; const out = [];
  const stops = s => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
  return {
    lin(s, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, user } = {}) {
      const id = prefix + n++;
      out.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${user ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops(s)}</linearGradient>`);
      return `url(#${id})`;
    },
    rad(s, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy, user } = {}) {
      const id = prefix + n++;
      out.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}${user ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops(s)}</radialGradient>`);
      return `url(#${id})`;
    },
    raw(s) { out.push(s); },
    get html() { return out.length ? `<defs>${out.join('')}</defs>` : ''; },
  };
}

/** One full-frame layer: { d: depth 0 far → 1 near, cls: extra CSS classes, html: svg body (defs added) }. */
export function layer(d, body, { cls = '', defs: df, style = '', origin } = {}) {
  return { d, cls, style, origin, html: `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${df ? df.html : ''}${body}</svg>` };
}

/**
 * Mountain ridge: closed path from the left edge to the right edge down to the bottom.
 * y = base line, amp = peak height, peaks ≈ number of big peaks, rough = small detail, sharp = 0..1 (pointy peaks).
 */
export function ridge(seed, { y = 500, amp = 150, peaks = 4, rough = 0.25, sharp = 0.6, x0 = -40, x1 = W + 40, step = 10, bottom = H + 40 } = {}) {
  const r = rng(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
  const pts = [];
  for (let x = x0; x <= x1; x += step) {
    const t = (x - x0) / (x1 - x0);
    const big = Math.sin(t * Math.PI * peaks + ph[0]);
    const peak = (1 - sharp) * (big * 0.5 + 0.5) + sharp * (1 - Math.abs(Math.sin(t * Math.PI * peaks * 0.5 + ph[0] * 0.5)));
    const mid = 0.35 * Math.sin(t * Math.PI * peaks * 2.3 + ph[1]);
    const small = rough * (Math.sin(t * 61 + ph[2]) * 0.5 + Math.sin(t * 137 + ph[3]) * 0.3 + (r() - 0.5) * 0.4);
    pts.push(`${f1(x)},${f1(y - amp * (peak * 0.75 + mid * 0.25 + small * 0.25))}`);
  }
  return `M${x0},${bottom} L${pts.join(' L')} L${x1},${bottom} Z`;
}

/** Ground strip with gentle undulation (for hills / foreground). */
export function hill(seed, { y = 600, amp = 30, waves = 2, x0 = -40, x1 = W + 40, step = 20, bottom = H + 40 } = {}) {
  const r = rng(seed); const a = r() * 6.28, b = r() * 6.28;
  const pts = [];
  for (let x = x0; x <= x1; x += step) { const t = (x - x0) / (x1 - x0); pts.push(`${f1(x)},${f1(y - amp * (Math.sin(t * Math.PI * waves + a) * 0.7 + Math.sin(t * Math.PI * waves * 2.7 + b) * 0.3))}`); }
  return `M${x0},${bottom} L${pts.join(' L')} L${x1},${bottom} Z`;
}
/** y of a hill() at x (same parameters) – for planting trees and characters on it. */
export function hillY(seed, x, { y = 600, amp = 30, waves = 2, x0 = -40, x1 = W + 40 } = {}) {
  const r = rng(seed); const a = r() * 6.28, b = r() * 6.28; const t = (x - x0) / (x1 - x0);
  return y - amp * (Math.sin(t * Math.PI * waves + a) * 0.7 + Math.sin(t * Math.PI * waves * 2.7 + b) * 0.3);
}

/** A row of conifers standing on a ground line (one path). gy(x) gives the ground height. */
export function pines(seed, { gy = () => 600, n = 30, x0 = -40, x1 = W + 40, h = [60, 120], w = 0.36 } = {}) {
  const r = rng(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + r() * 0.8) / n, hh = h[0] + r() * (h[1] - h[0]), ww = hh * w * (0.8 + r() * 0.4), y = gy(x) + 4;
    const tiers = 3 + Math.floor(r() * 2);
    let s = `M${f1(x)},${f1(y - hh)}`;
    for (let k = 1; k <= tiers; k++) {                // zig-zag down the right side
      const ty = y - hh + hh * 0.86 * k / tiers, tw = ww * (0.35 + 0.65 * k / tiers);
      s += ` L${f1(x + tw * 0.5)},${f1(ty)} L${f1(x + tw * 0.22)},${f1(ty - hh * 0.04)}`;
    }
    s += ` L${f1(x + ww * 0.06)},${f1(y)} L${f1(x - ww * 0.06)},${f1(y)}`;
    for (let k = tiers; k >= 1; k--) {
      const ty = y - hh + hh * 0.86 * k / tiers, tw = ww * (0.35 + 0.65 * k / tiers);
      s += ` L${f1(x - tw * 0.22)},${f1(ty - hh * 0.04)} L${f1(x - tw * 0.5)},${f1(ty)}`;
    }
    d += s + 'Z';
  }
  return d;
}

/** Round-crowned broadleaf trees (autumn / spring), returns path of blobs. */
export function crowns(seed, { gy = () => 600, n = 14, x0 = -40, x1 = W + 40, r: rr = [26, 52] } = {}) {
  const r = rng(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + r() * 0.7) / n, rad = rr[0] + r() * (rr[1] - rr[0]), y = gy(x) - rad * 0.9;
    d += circ(x, y, rad) + circ(x - rad * 0.7, y + rad * 0.35, rad * 0.65) + circ(x + rad * 0.7, y + rad * 0.3, rad * 0.7);
    d += `M${f1(x - 3)},${f1(y + rad * 0.5)} L${f1(x + 3)},${f1(y + rad * 0.5)} L${f1(x + 4)},${f1(gy(x) + 4)} L${f1(x - 4)},${f1(gy(x) + 4)}Z`;
  }
  return d;
}
export const circ = (x, y, r) => `M${f1(x - r)},${f1(y)} a${f1(r)},${f1(r)} 0 1,0 ${f1(r * 2)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-r * 2)},0Z`;

/** Bare dead tree (strokes). Returns <path> markup. */
export function deadTree(seed, x, y, h, color, wid = 10) {
  const r = rng(seed); const segs = [];
  const grow = (x0, y0, ang, len, w, depth) => {
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    segs.push(`<path d="M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}" stroke-width="${f1(w)}"/>`);
    if (depth <= 0 || len < 8) return;
    const k = 2 + (r() < 0.4 ? 1 : 0);
    for (let i = 0; i < k; i++) grow(x1, y1, ang + (r() - 0.5) * 1.3, len * (0.55 + r() * 0.2), w * 0.62, depth - 1);
  };
  grow(x, y, -Math.PI / 2 + (r() - 0.5) * 0.2, h * 0.42, wid, 4);
  return `<g stroke="${color}" stroke-linecap="round" fill="none">${segs.join('')}</g>`;
}

/** Scatter of small dots (stars drawn into the sky layer; the twinkling ones are on the particle canvas). */
export function dots(seed, n, { x0 = 0, x1 = W, y0 = 0, y1 = H * 0.5, r: rr = [0.6, 1.6], fill = '#fff', op = [0.3, 0.9] } = {}) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${f1(x0 + r() * (x1 - x0))}" cy="${f1(y0 + r() * (y1 - y0))}" r="${f1(rr[0] + r() * (rr[1] - rr[0]))}" fill="${fill}" opacity="${f1(op[0] + r() * (op[1] - op[0]))}"/>`;
  return s;
}

/** Soft cloud bank: a row of overlapping ellipses. Use an OPAQUE fill and `op` for transparency (group opacity → no seams). */
export function cloud(x, y, w, h, fill, op = 1, seed = 1) {
  const r = rng(seed); let s = '';
  const n = 5 + Math.floor(w / 140);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, bump = Math.sin(t * Math.PI);
    const cx = x - w / 2 + t * w + (r() - 0.5) * w * 0.08, rx = w / n * (0.9 + r() * 0.6), ry = h * (0.35 + bump * 0.65) * (0.8 + r() * 0.4);
    s += `<ellipse cx="${f1(cx)}" cy="${f1(y - ry * 0.45)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`;
  }
  return `<g fill="${fill}" opacity="${op}">${s}<ellipse cx="${x}" cy="${y - h * 0.08}" rx="${w * 0.5}" ry="${h * 0.14}"/></g>`;
}

/** Fan of light rays from (x, y): thin triangles with a fading gradient fill (userSpace radial: fades with distance). */
export function rays(x, y, n, len, fill, { a0 = 0, a1 = Math.PI * 2, width = 0.05, seed = 3 } = {}) {
  const r = rng(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i + r() * 0.6) / n, wv = width * (0.6 + r() * 0.6);
    const l = len * (0.6 + r() * 0.4);
    d += `M${x},${y} L${f1(x + Math.cos(a - wv) * l)},${f1(y + Math.sin(a - wv) * l)} L${f1(x + Math.cos(a + wv) * l)},${f1(y + Math.sin(a + wv) * l)}Z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/**
 * Smooth closed outline through points (Catmull-Rom → cubic Bézier). A point [x, y, 1] is a sharp corner
 * (ear tips, claws, toes). Used for all organic silhouettes.
 */
export function smooth(pts, k = 0.18) {
  const n = pts.length, P = i => pts[(i + n) % n];
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const k1 = p1[2] ? 0 : k, k2 = p2[2] ? 0 : k;
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) * k1)},${f1(p1[1] + (p2[1] - p0[1]) * k1)} ${f1(p2[0] - (p3[0] - p1[0]) * k2)},${f1(p2[1] - (p3[1] - p1[1]) * k2)} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + 'Z';
}

// ------------------------------------------------------------------------------------------ silhouettes
// All characters are plain silhouettes (one fill colour reads as one shape; no faces, no copied character art).
// Local coordinates: facing right, paws on y = 0, a dog is ~100 units long. place() moves / scales / mirrors.
export const place = (x, y, s, inner, { flip = false, cls = '', rot = 0 } = {}) =>
  `<g transform="translate(${f1(x)},${f1(y)}) scale(${flip ? -s : s},${s})${rot ? ` rotate(${rot})` : ''}"><g class="${cls}">${inner}</g></g>`;

// dog parts (Akita-type: deep chest, pricked ears, curled tail)
const D_TORSO = smooth([[18, -50], [40, -53], [58, -55], [68, -63], [78, -60], [83, -54], [81, -44], [77, -33], [66, -31], [50, -33], [38, -36], [27, -34], [17, -38], [14, -45]]);
const D_HEAD = smooth([[68, -63], [72, -71], [74, -86, 1], [80, -75], [84, -86, 1], [87, -73], [91, -70], [99, -67], [103, -64, 1], [100, -60], [91, -59], [83, -55], [74, -57]]);
const D_LEG_F = smooth([[70, -38], [79, -38], [78, -18], [79, -5], [84, -3], [84, 0, 1], [72, 0, 1], [73, -5], [71, -20]], 0.12);
const D_LEG_R = smooth([[16, -42], [33, -40], [33, -26], [28, -15], [31, -4], [35, -2], [35, 0, 1], [24, 0, 1], [23, -5], [20, -15], [16, -28]], 0.12);
const D_TAIL = { curl: 'M22,-49 C8,-58 12,-76 26,-72 C34,-69 32,-60 25,-58', down: 'M18,-46 C10,-40 8,-28 11,-18', up: 'M20,-49 C10,-58 6,-68 4,-76' };

/** Dog silhouette. pose: 'stand' | 'howl' | 'walk' | 'sit' | 'lie'. tail: 'curl' | 'down' | 'up'. */
export function dog(color, { pose = 'stand', tail = 'curl', far = 'rgba(0,0,0,0.35)' } = {}) {
  const tailP = `<path d="${D_TAIL[tail]}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  if (pose === 'sit') {
    return `<g fill="${color}">${tailP.replace(D_TAIL[tail], 'M30,-6 C20,-4 12,-2 6,-2')}
      <path d="${smooth([[24, -2], [20, -20], [28, -36], [46, -52], [62, -62], [74, -56], [76, -40], [70, -24], [68, -2]])}"/>
      <g transform="translate(-4,6)"><path d="${D_HEAD}"/></g>
      <path d="${smooth([[60, -30], [70, -30], [70, -6], [76, -3], [76, 0, 1], [62, 0, 1]], 0.1)}"/></g>`;
  }
  if (pose === 'lie') {
    return `<g fill="${color}"><path d="${smooth([[10, -2], [12, -18], [30, -26], [56, -26], [74, -22], [80, -10], [104, -6], [106, 0, 1], [10, 0, 1]])}"/>
      <g transform="translate(-2,38)"><path d="${D_HEAD}"/></g></g>`;
  }
  const walk = pose === 'walk';
  const legF = cls => `<path class="${cls}" d="${D_LEG_F}" style="transform-origin:74px -36px"/>`;
  const legR = cls => `<path class="${cls}" d="${D_LEG_R}" style="transform-origin:25px -38px"/>`;
  const head = pose === 'howl' ? `<g transform="rotate(-42 74 -60)"><path d="${D_HEAD}"/></g>` : `<path d="${D_HEAD}"/>`;
  return `<g fill="${color}">
    <g transform="translate(-6,0)">${legF(walk ? 'lg-b' : '')}${legR(walk ? 'lg-a' : '')}</g>
    ${tailP}<path d="${D_TORSO}"/>${head}
    ${legF(walk ? 'lg-a' : '')}${legR(walk ? 'lg-b' : '')}
  </g>`;
}

/** Giant bear on all fours (Akakabuto), facing right: shoulder hump, head raised and roaring. helmet: tint on the head. */
export function bear(color, { helmet = '' } = {}) {
  const body = smooth([[4, -50], [14, -76], [36, -86], [66, -100], [88, -96], [106, -84], [114, -62], [114, -30], [117, -6], [126, -2], [126, 0, 1], [100, 0, 1], [99, -24], [94, -40],
    [70, -40], [46, -42], [40, -26], [42, -5], [48, -2], [48, 0, 1], [20, 0, 1], [18, -16], [8, -32]], 0.16);
  const far = smooth([[86, -50], [96, -36], [94, -6], [102, -2], [102, 0, 1], [82, 0, 1], [80, -30]], 0.14) + smooth([[22, -50], [34, -36], [30, -6], [36, -2], [36, 0, 1], [16, 0, 1], [14, -30]], 0.14);
  const head = smooth([[96, -92], [110, -102], [126, -100], [138, -94], [150, -90, 1], [149, -83], [137, -80, 1], [148, -71, 1], [134, -66], [114, -66], [100, -72]], 0.15);
  return `<g fill="${color}"><path d="${far}"/><path d="${body}"/><path d="${head}"/><circle cx="108" cy="-101" r="7"/><circle cx="119" cy="-104" r="6"/>
    ${helmet ? `<path d="${smooth([[100, -94], [110, -103], [126, -101], [136, -95], [124, -92], [108, -88]], 0.2)}" fill="${helmet}"/>` : ''}</g>`;
}

/** Huge monster dog (Kaibutsu): shaggy lion-like mane, oversized head, crouched on all fours, facing right. */
export function monster(color) {
  const r = rng(77); const mane = [];
  for (let i = 0; i <= 40; i++) {              // shaggy tufts around the head and over the shoulders
    const a = -Math.PI * 1.05 + (i / 40) * Math.PI * 1.45, rr = 42 + (i % 2 ? 0 : 7) + r() * 5;
    mane.push([90 + Math.cos(a) * rr, -84 + Math.sin(a) * rr * 0.95, i % 4 ? 0 : 1]);
  }
  mane.push([96, -40], [80, -36]);
  const body = smooth([[4, -44], [16, -70], [44, -82], [70, -98], [100, -90], [92, -60], [86, -36], [88, -6], [96, -2], [96, 0, 1], [72, 0, 1], [70, -26], [40, -36], [30, -8], [36, 0, 1], [14, 0, 1], [10, -18]], 0.16);
  const head = smooth([[104, -114], [128, -110], [146, -98], [156, -88, 1], [150, -79], [136, -75], [130, -64, 1], [114, -66], [98, -80]], 0.15);
  return `<g fill="${color}"><path d="M8,-48 C-6,-56 -12,-70 -8,-84" stroke="${color}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="${smooth(mane, 0.1)}"/><path d="${body}"/><path d="${head}"/></g>`;
}

/** Person silhouette. kind: 'hunter' (hat, rifle on shoulder) | 'boy' | 'aim' (rifle raised). */
export function human(color, kind = 'hunter') {
  if (kind === 'boy') {
    return `<g fill="${color}"><circle cx="0" cy="-66" r="9"/><path d="${smooth([[-9, -56], [9, -56], [12, -30], [7, -28], [6, 0, 1], [1, 0, 1], [0, -24], [-1, 0, 1], [-6, 0, 1], [-7, -28], [-12, -30]], 0.12)}"/>
      <path d="M8,-52 L20,-40" stroke="${color}" stroke-width="5" stroke-linecap="round"/></g>`;
  }
  const rifle = kind === 'aim'
    ? `<path d="M4,-80 L50,-86" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/><path d="M-6,-78 L22,-84 L20,-74 L-2,-70Z"/>`
    : `<path d="M-12,-60 L18,-108" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `<g fill="${color}"><circle cx="0" cy="-90" r="10"/><path d="M-16,-95 C-10,-97 10,-97 16,-95 L16,-93 L-16,-93Z M-9,-96 C-8,-106 8,-106 9,-96Z"/>
    <path d="${smooth([[-13, -82], [13, -82], [18, -44], [10, -40], [9, 0, 1], [2, 0, 1], [0, -34], [-2, 0, 1], [-9, 0, 1], [-10, -40], [-18, -44]], 0.12)}"/>${rifle}</g>`;
}
