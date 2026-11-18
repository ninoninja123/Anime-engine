// Ulkonäkövarianttien tekstuuritehdas.
//   node tools/make-looks.mjs [lookId ...] [--debug]
// Lukee src/data/looks.js:n speksit (pohjamalli + värit + merkit) ja kirjoittaa kullekin lookille
// public/models/looks/<id>.webp -tekstuurin, joka korvaa pohjamallin baseColor-tekstuurin pelissä
// (sama geometria + luusto + klipit jaetaan, vain tekstuuri vaihtuu).
//
// Tekniikka:
//  1. Pohjamallin verteksit luetaan (POSITION, NORMAL, TEXCOORD_0, JOINTS_0, WEIGHTS_0) ja luiden
//     sidosasennot (inverseBindMatrices) -> normalisoitu koordinaatisto: X eteen (pää), Y ylös, Z kylki.
//  2. Jokaiselle verteksille lasketaan piirteet: skinning-painot luuryhmittäin (pää, leuka, korvat, kaula,
//     vartalo, häntä, reidet, sääret, tassut, etu/taka), normaalin suunta (selkä/vatsa), pään paikallinen
//     koordinaatisto (kuonon kärki = hx 1) ja hännän pituuskoordinaatti.
//  3. Kolmiot rasteroidaan UV-tasoon -> jokaisella tekselillä on interpoloidut piirteet.
//  4. Merkit (satula, vatsa, naamio, sukat, täplät, raidat, arvet ...) ovat piirteiden funktioita, joten
//     samat speksit osuvat oikeisiin kohtiin minkä tahansa saman rigin mallin päällä.
//  5. Turkin pienimuotoinen yksityiskohta otetaan alkuperäisen tekstuurin luminanssista (L / blur(L)),
//     ja silmät / nenä / ääriviivat (pään pienimuotoinen tumma tai yksityiskohtainen alue) säilytetään.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOOKS } from '../src/data/looks.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/models/looks');
const args = process.argv.slice(2);
const DEBUG = args.includes('--debug');
const only = args.filter(a => !a.startsWith('--'));
fs.mkdirSync(OUT, { recursive: true });

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

// ------------------------------------------------------------------ apufunktiot
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const hex = h => { const n = parseInt(h.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map(c => Math.pow(c, 2.2)); };
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function hash(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {   // arvokohina 0..1
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  let r = 0;
  for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++)
    r += hash(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  return r;
}
const fbm = (x, y, z) => 0.6 * vnoise(x, y, z) + 0.3 * vnoise(x * 2.1, y * 2.1, z * 2.1) + 0.1 * vnoise(x * 4.3, y * 4.3, z * 4.3);
function cell(x, y, z, size, seed) {   // solukohina: etäisyys lähimpään satunnaispisteeseen (yksikkönä solu)
  const X = x / size, Y = y / size, Z = z / size; const xi = Math.floor(X), yi = Math.floor(Y), zi = Math.floor(Z);
  let best = 9, rad = 1;
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = xi + dx, cy = yi + dy, cz = zi + dz;
    const px = cx + hash(cx, cy, cz + seed), py = cy + hash(cx + 7, cy, cz + seed), pz = cz + hash(cx, cy + 13, cz + seed);
    const d = Math.hypot(X - px, Y - py, Z - pz);
    if (d < best) { best = d; rad = 0.55 + 0.6 * hash(cx + 3, cy + 5, cz + seed + 1); }
  }
  return best / rad;
}
function inv4(m) {   // 4x4 käänteismatriisi (sarakejärjestys)
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  return [(a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det, (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
    (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det, (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
    (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det, (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
    (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det, (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det];
}
function blur(src, W, H, r) {   // laatikkosumennus x3 ~ gauss
  let a = Float32Array.from(src), b = new Float32Array(W * H);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) { let s = 0; const o = y * W; for (let x = -r; x <= r; x++) s += a[o + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) { b[o + x] = s / (2 * r + 1); s += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) { a[y * W + x] = s / (2 * r + 1); s += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
  }
  return a;
}

// ------------------------------------------------------------------ pohjamallin analyysi (välimuisti)
const GROUPS = { head: ['head'], jaw: ['jaw'], ear: ['ear_L', 'ear_R'], neck: ['neck'], body: ['root', 'spine_01', 'spine_02', 'spine_03'],
  tail: ['tail_01', 'tail_02', 'tail_03'], legU: ['front_upper_L', 'front_upper_R', 'back_upper_L', 'back_upper_R'],
  legL: ['front_lower_L', 'front_lower_R', 'back_lower_L', 'back_lower_R'], paw: ['front_paw_L', 'front_paw_R', 'back_paw_L', 'back_paw_R'] };
const GN = Object.keys(GROUPS);
// piirrevektori
const F = { X: 0, Y: 1, Z: 2, nx: 3, ny: 4, nz: 5, head: 6, jaw: 7, ear: 8, neck: 9, body: 10, tail: 11, legU: 12, legL: 13, paw: 14,
  front: 15, hx: 16, hy: 17, hz: 18, tt: 19, earL: 20 };
const NF = 21;
const baseCache = {};

async function analyse(model) {
  if (baseCache[model]) return baseCache[model];
  const doc = await io.read(path.join(ROOT, 'public/models', model + '.glb'));
  const r = doc.getRoot();
  const prim = r.listMeshes()[0].listPrimitives()[0];
  const skin = r.listSkins()[0];
  const jn = skin.listJoints().map(j => j.getName());
  const ibm = skin.getInverseBindMatrices();
  const jpos = {}; jn.forEach((n, i) => { const m = inv4(ibm.getElement(i, [])); jpos[n] = [m[12], m[13], m[14]]; });
  const P = prim.getAttribute('POSITION'), N = prim.getAttribute('NORMAL'), UV = prim.getAttribute('TEXCOORD_0');
  const J = prim.getAttribute('JOINTS_0'), Wt = prim.getAttribute('WEIGHTS_0'), I = prim.getIndices();
  const nv = P.getCount();
  // koordinaatisto: ylös = +Y, eteen = vaakasuunta hännän tyvestä päähän
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const fw = sub(jpos.head, jpos.tail_01); fw[1] = 0; const fl = Math.hypot(fw[0], fw[2]); fw[0] /= fl; fw[2] /= fl;
  const side = [-fw[2], 0, fw[0]];   // up x fwd  (oikea kylki)
  let minY = 1e9, maxY = -1e9, cx = 0, cz = 0;
  const pos = []; for (let i = 0; i < nv; i++) { const p = P.getElement(i, []); pos.push(p); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); cx += p[0]; cz += p[2]; }
  cx /= nv; cz /= nv; const Hh = maxY - minY;
  const toN = p => [((p[0] - cx) * fw[0] + (p[2] - cz) * fw[2]) / Hh, (p[1] - minY) / Hh, ((p[0] - cx) * side[0] + (p[2] - cz) * side[2]) / Hh];
  const J2 = {}; for (const k in jpos) J2[k] = toN(jpos[k]);
  const feat = new Float32Array(nv * NF);
  const gidx = {}; GN.forEach((g, gi) => GROUPS[g].forEach(b => (gidx[b] = gi)));
  const headP = J2.head;
  let headLen = 0, headUp = 0;
  for (let i = 0; i < nv; i++) {
    const p = toN(pos[i]); const n = N.getElement(i, []);
    const nn = [n[0] * fw[0] + n[2] * fw[2], n[1], n[0] * side[0] + n[2] * side[2]];
    const j = J.getElement(i, []), w = Wt.getElement(i, []);
    const o = i * NF; feat[o] = p[0]; feat[o + 1] = p[1]; feat[o + 2] = p[2]; feat[o + 3] = nn[0]; feat[o + 4] = nn[1]; feat[o + 5] = nn[2];
    let fr = 0, lg = 0, el = 0;
    for (let k = 0; k < 4; k++) { const bn = jn[j[k]]; const gi = gidx[bn]; if (gi === undefined) continue; feat[o + 6 + gi] += w[k];
      if (/^(front|back)_/.test(bn)) { lg += w[k]; if (bn.startsWith('front')) fr += w[k]; }
      if (bn === 'ear_L') el += w[k]; }
    feat[o + F.front] = lg > 0 ? fr / lg : (p[0] > 0 ? 1 : 0);
    feat[o + F.earL] = el;
    if (feat[o + F.head] + feat[o + F.jaw] + feat[o + F.ear] > 0.5) { headLen = Math.max(headLen, p[0] - headP[0]); headUp = Math.max(headUp, p[1] - headP[1]); }
  }
  const tailLen = Math.hypot(...sub(J2.tail_03, J2.tail_01)) * 1.6;
  for (let i = 0; i < nv; i++) {
    const o = i * NF;
    feat[o + F.hx] = (feat[o] - headP[0]) / headLen;
    feat[o + F.hy] = (feat[o + 1] - headP[1]) / headLen;
    feat[o + F.hz] = feat[o + 2] / headLen;
    feat[o + F.tt] = clamp(Math.hypot(feat[o] - J2.tail_01[0], feat[o + 1] - J2.tail_01[1], feat[o + 2] - J2.tail_01[2]) / tailLen);
  }
  // tekstuuri
  const tex = r.listTextures()[0];
  const img = sharp(Buffer.from(tex.getImage()));
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  const rgba = await img.ensureAlpha().raw().toBuffer();
  // rasterointi UV-tasoon
  const tf = new Float32Array(W * H * NF); const cov = new Uint8Array(W * H);
  const uvs = []; for (let i = 0; i < nv; i++) { const u = UV.getElement(i, []); uvs.push([u[0] * W - 0.5, u[1] * H - 0.5]); }
  const idx = I.getArray();
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const A = uvs[a], B = uvs[b], C = uvs[c];
    const x0 = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0])) - 1), x1 = Math.min(W - 1, Math.ceil(Math.max(A[0], B[0], C[0])) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1])) - 1), y1 = Math.min(H - 1, Math.ceil(Math.max(A[1], B[1], C[1])) + 1);
    const den = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]); if (Math.abs(den) < 1e-12) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const l0 = ((B[1] - C[1]) * (x - C[0]) + (C[0] - B[0]) * (y - C[1])) / den;
      const l1 = ((C[1] - A[1]) * (x - C[0]) + (A[0] - C[0]) * (y - C[1])) / den;
      const l2 = 1 - l0 - l1;
      const e = -0.02 * 0;   // ei laajennusta tässä; reunat täytetään lopuksi
      if (l0 < e - 1e-4 || l1 < e - 1e-4 || l2 < e - 1e-4) continue;
      const o = (y * W + x) * NF;
      for (let k = 0; k < NF; k++) tf[o + k] = feat[a * NF + k] * l0 + feat[b * NF + k] * l1 + feat[c * NF + k] * l2;
      cov[y * W + x] = 1;
    }
  }
  // luminanssi + yksityiskohta
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = (0.2126 * Math.pow(rgba[i * 4] / 255, 2.2) + 0.7152 * Math.pow(rgba[i * 4 + 1] / 255, 2.2) + 0.0722 * Math.pow(rgba[i * 4 + 2] / 255, 2.2));
  const Lb = blur(L, W, H, 2), Lb6 = blur(L, W, H, 6);
  const L2 = L.map(v => v * v); const L2b = blur(L2, W, H, 2);
  // alkuperäisen kuvion reunat (suuren mittakaavan gradientti) -> näissä kohdissa yksityiskohta vaimennetaan
  const Lb3 = blur(L, W, H, 3), edge = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x;
    const gx = Lb3[i + 1] - Lb3[i - 1], gy = Lb3[i + W] - Lb3[i - W]; edge[i] = Math.hypot(gx, gy) / (Lb3[i] + 0.04); }
  const edgeB = blur(edge, W, H, 3);
  // nopea bilateraalisuodin (paloittain lineaarinen, luminanssi neliöjuuriasteikolla): paikallinen keskiarvo vain
  // samankaltaisista tekseleistä -> alkuperäisten täplien/raitojen reunat eivät jätä renkaita
  const S = L.map(v => Math.sqrt(v)), K = 8, sig = 0.09, bil = new Float32Array(W * H), bw = new Float32Array(W * H);
  for (let k = 0; k < K; k++) {
    const lv = k / (K - 1);
    const w = S.map(s => Math.exp(-((s - lv) ** 2) / (2 * sig * sig)));
    const num = blur(w.map((wi, i) => wi * L[i]), W, H, 4), dnm = blur(w, W, H, 4);
    for (let i = 0; i < W * H; i++) { const t = Math.max(0, 1 - Math.abs(S[i] - lv) * (K - 1)); if (t > 0) { bil[i] += t * num[i] / (dnm[i] + 1e-6); bw[i] += t; } }
  }
  for (let i = 0; i < W * H; i++) bil[i] /= bw[i] || 1;
  // tummien tekselien osuus laajassa ikkunassa: pienet tummat piirteet (silmät, nenä, viivat) vs. isot läikät
  const darkFrac = blur(L.map(v => (v < 0.06 ? 1 : 0)), W, H, 9);
  const res = { W, H, rgba, tf, cov, L, Lb, Lb6, L2b, bil, darkFrac, edge: edgeB, J: J2, headLen, model };
  baseCache[model] = res; return res;
}

// ------------------------------------------------------------------ merkit
// Jokainen merkki: (f = piirteet, ctx) -> peitto 0..1. Väri tulee speksistä.
const reg = (f, ...g) => g.reduce((s, k) => s + f[F[k]], 0);
const headW = f => clamp(f[F.head] + f[F.jaw] + f[F.ear] * 0.0);
const MARKS = {
  // vatsa/rinta/kaulan alapuoli/jalkojen sisäpinta (vaalea alapuoli)
  under: (f, m) => { const lv = m.level ?? 0;
    const ventral = ss(0.05 - lv, -0.45 - lv, f[F.ny]);
    const torso = clamp(reg(f, 'body', 'neck') + f[F.legU] * 0.6);
    const chest = clamp(f[F.neck] + f[F.body] * ss(0.0, 0.25, f[F.X])) * ss(-0.1, 0.5, f[F.nx]) * ss(0.35, -0.2, f[F.ny]);
    const innerLeg = clamp(reg(f, 'legU', 'legL')) * ss(0.25, 0.6, -f[F.nz] * Math.sign(f[F.Z] || 1)) * (m.innerLegs === false ? 0 : 1);
    const throat = clamp(f[F.jaw] + f[F.head] * 0.6) * ss(-0.1, -0.6, f[F.ny]) * ss(0.15, 0.4, f[F.hx]) * (m.throat === false ? 0 : 1);
    const tailU = f[F.tail] * ss(0.0, -0.5, f[F.ny]) * (m.tail ? 1 : 0);
    return Math.max(ventral * torso, chest * (m.chest ?? 1), innerLeg * 0.9, throat, tailU); },
  // selän "satula" / viitta: vartalon, kaulan ja hännän yläpinta
  saddle: (f, m) => { const lv = m.level ?? 0.15, jit = (fbm(f[0] * 9, f[1] * 9, f[2] * 9) - 0.5) * 0.35;
    const dorsal = ss(lv - 0.12, lv + 0.12, f[F.ny] + jit + (f[F.Y] - (m.y ?? 0.62)) * 2.2);
    const area = clamp(f[F.body] + f[F.neck] * (m.neck ?? 0.8) + f[F.tail] * (m.tail ?? 1) + f[F.legU] * (m.thigh ?? 0.25) * ss(0.4, 0.55, f[F.Y]) + f[F.head] * (m.head ?? 0) * ss(-0.3, 0.2, -f[F.hx]));
    const xr = ss((m.x0 ?? -9) - 0.04, (m.x0 ?? -9) + 0.04, f[F.X]) * ss((m.x1 ?? 9) + 0.04, (m.x1 ?? 9) - 0.04, f[F.X]);
    return dorsal * area * xr; },
  // pään päälaki + korvat (tumma "huppu")
  cap: (f, m) => { const h = headW(f); const top = ss((m.level ?? 0.15) - 0.15, (m.level ?? 0.15) + 0.1, f[F.ny] + (f[F.hy] - 0.2));
    return h * top * ss((m.hx ?? 0.55) + 0.1, (m.hx ?? 0.55) - 0.1, f[F.hx]); },
  // kuono (kärjestä taaksepäin)
  muzzle: (f, m) => { const h = clamp(f[F.head] + f[F.jaw]); const e = m.extent ?? 0.6, jit = (vnoise(f[0] * 40, f[1] * 40, f[2] * 40) - 0.5) * 0.08;
    let v = h * ss(e - 0.06, e + 0.06, f[F.hx] + jit);
    if (m.lower) v *= ss(0.25, -0.15, f[F.ny]);
    return v; },
  // silmänympärys / naamio: kuono + silmäalue + otsa
  mask: (f, m) => { const h = clamp(f[F.head] + f[F.jaw]); const e = m.extent ?? 0.3, jit = (vnoise(f[0] * 35, f[1] * 35, f[2] * 35) - 0.5) * 0.1;
    let v = h * ss(e - 0.08, e + 0.08, f[F.hx] + jit);
    if (m.eyes !== false) { const ex = m.eyeX ?? 0.45, ey = m.eyeY ?? 0.3, ez = m.eyeZ ?? 0.32;
      const d = Math.hypot((f[F.hx] - ex) / 0.24, (f[F.hy] - ey) / 0.2, (Math.abs(f[F.hz]) - ez) / 0.3); v = Math.max(v, h * ss(1.15, 0.85, d + jit)); }
    return v; },
  // vaalea poski / kuonon alaosa (esim. "pistemerkit")
  cheeks: (f, m) => { const h = clamp(f[F.head] + f[F.jaw]); return h * ss(m.extent ?? 0.35, (m.extent ?? 0.35) + 0.12, f[F.hx]) * ss(m.level ?? 0.2, (m.level ?? 0.2) - 0.3, f[F.ny] + f[F.hy] * 0.8); },
  // otsapisteet (silmien yläpuolella)
  brows: (f, m) => { const h = clamp(f[F.head]); const ex = m.eyeX ?? 0.42, ey = (m.eyeY ?? 0.3) + 0.17, ez = m.eyeZ ?? 0.28;
    const d = Math.hypot((f[F.hx] - ex) / 0.1, (f[F.hy] - ey) / 0.08, (Math.abs(f[F.hz]) - ez) / 0.18); return h * ss(1.1, 0.8, d) * ss(-0.2, 0.2, f[F.ny] + 0.3); },
  // otsan valkea juova
  blaze: (f, m) => { const h = clamp(f[F.head]); return h * ss(m.width ?? 0.12, (m.width ?? 0.12) * 0.5, Math.abs(f[F.hz])) * ss(-0.2, 0.2, f[F.ny]) * ss(-0.1, 0.1, f[F.hx]); },
  // korvat: vain selvästi korvaluuhun painotetut verteksit, jotka ovat kallon yläpuolella / takana
  ears: (f, m) => { const e = f[F.ear]; return ss(m.lo ?? 0.55, m.hi ?? 0.85, e) * ss(m.hy ?? 0.05, (m.hy ?? 0.05) + 0.2, f[F.hy]) * (m.tips ? ss(m.tips, m.tips + 0.12, f[F.hy] - 0.9) : 1); },
  // sukat: alaraajat maasta korkeuteen h
  socks: (f, m) => { const lg = clamp(reg(f, 'legL', 'paw') + f[F.legU] * 0.5); const h = m.height ?? 0.16, jit = (vnoise(f[0] * 30, f[1] * 30, f[2] * 30) - 0.5) * 0.04;
    const fb = m.front === undefined ? 1 : (m.front ? f[F.front] : 1 - f[F.front]);
    return lg * ss(h + 0.03, h - 0.03, f[F.Y] + jit) * fb; },
  legs: (f, m) => clamp(reg(f, 'legL', 'paw') + f[F.legU] * ss((m.y ?? 0.42) + 0.04, (m.y ?? 0.42) - 0.04, f[F.Y])) * (m.outer ? ss(-0.1, 0.4, f[F.nz] * Math.sign(f[F.Z] || 1)) : 1),
  tailTip: (f, m) => f[F.tail] * ss((m.from ?? 0.7) - 0.05, (m.from ?? 0.7) + 0.05, f[F.tt]),
  tail: (f) => clamp(f[F.tail] * 1.3),
  // rinnan laikku (valkoinen rinta)
  chest: (f, m) => { const c = clamp(f[F.neck] + f[F.body] * ss(0.05, 0.22, f[F.X])); const jit = (vnoise(f[0] * 25, f[1] * 25, f[2] * 25) - 0.5) * 0.2;
    return c * ss(0.0, 0.45, f[F.nx] + jit) * ss(m.w ?? 0.6, (m.w ?? 0.6) - 0.25, Math.abs(f[F.nz])) * ss(0.4, -0.1, f[F.ny]); },
  // pyöreät täplät (solukohina 3D:ssä)
  spots: (f, m) => { const s = m.size ?? 0.05; const d = cell(f[0], f[1] * 1.15, f[2], s, m.seed ?? 3);
    const r = m.r ?? 0.42; const area = 1 - clamp(f[F.ear] * (m.ears === false ? 1 : 0)) - (m.noHead ? clamp(f[F.head]) : 0);
    return ss(r + 0.06, r - 0.06, d) * clamp(area) * (m.noBelly ? ss(-0.6, -0.2, f[F.ny]) : 1); },
  // tiheä pilkutus (setterin "belton")
  ticking: (f, m) => { const d = cell(f[0], f[1], f[2], m.size ?? 0.016, (m.seed ?? 5) + 11); return ss(0.4, 0.25, d) * (m.dorsal ? ss(-0.4, 0.3, f[F.ny]) : 1); },
  // raidat (tiikeri/brindle): pystyraitoja pitkin vartaloa, kohinalla vääristettyinä
  stripes: (f, m) => { const fr = m.freq ?? 38, w = (fbm(f[0] * 6, f[1] * 6, f[2] * 6) - 0.5) * (m.warp ?? 2.5);
    const s = Math.sin(f[0] * fr + f[1] * fr * (m.slant ?? 0.35) + w * 3.0 + Math.abs(f[2]) * (m.wrap ?? 6));
    const t = m.thick ?? 0.35; const brk = vnoise(f[0] * 22, f[1] * 22, f[2] * 22) > (m.breakup ?? 0.25) ? 1 : 0.2;
    const area = clamp(reg(f, 'body', 'neck', 'legU') + f[F.tail] * 0.7 + f[F.legL] * (m.legs ?? 0.5) + clamp(f[F.head]) * (m.head ?? 0.4)) * (m.belly === false ? ss(-0.5, -0.15, f[F.ny]) : 1);
    return ss(1 - t, 1 - t + 0.18, s) * area * brk; },
  // merle-/harlekiini-läikät (isot repaleiset)
  patches: (f, m) => { const n = fbm(f[0] * (m.scale ?? 7) + (m.seed ?? 0), f[1] * (m.scale ?? 7), f[2] * (m.scale ?? 7)); return ss((m.r ?? 0.62) - 0.02, (m.r ?? 0.62) + 0.02, n); },
  // arpi: jana pään paikallisissa (hx, hy, |hz|) tai vartalon (X, Y, Z) koordinaateissa
  scar: (f, m) => { const sp = m.space === 'body' ? [f[F.X], f[F.Y], f[F.Z]] : [f[F.hx], f[F.hy], f[F.hz]];
    const sideOk = m.side === undefined ? 1 : (Math.sign(sp[2]) === m.side ? 1 : 0); const z = m.side === undefined ? Math.abs(sp[2]) : Math.abs(sp[2]);
    const a = m.a, b = m.b; const p = [sp[0], sp[1], z];
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const tt = clamp((ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2));
    const d = Math.hypot(ap[0] - ab[0] * tt, ap[1] - ab[1] * tt, ap[2] - ab[2] * tt);
    const w = (m.w ?? 0.035) * (0.4 + 0.6 * Math.sin(Math.PI * tt));
    const facing = m.space === 'body' ? 1 : ss(0.05, 0.3, Math.abs(f[F.nz]) + f[F.ny] * 0.5);
    return ss(w, w * 0.5, d) * sideOk * facing * (m.space === 'body' ? 1 : clamp(f[F.head] + f[F.jaw])); },
  all: () => 1,
};

// ------------------------------------------------------------------ yhden lookin generointi
async function makeLook(id, L) {
  const B = await analyse(L.base);
  const { W, H, rgba, tf, cov } = B;
  const out = Buffer.alloc(W * H * 4);
  const layers = [['all', { color: L.coat }], ...(L.marks || []).map(m => [m.type, m])];
  const cols = layers.map(([, m]) => hex(m.color || '#ff00ff'));
  const k = L.detail ?? 1;
  const f = new Float32Array(NF);
  const coverMask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (!cov[i]) continue;
    for (let q = 0; q < NF; q++) f[q] = tf[i * NF + q];
    let col = cols[0];
    for (let li = 1; li < layers.length; li++) {
      const [type, m] = layers[li]; const fn = MARKS[type]; if (!fn) throw new Error('unknown mark ' + type);
      let a = fn(f, m) * (m.opacity ?? 1);
      if (m.mul) { col = mix3(col, [col[0] * cols[li][0] / 0.5, col[1] * cols[li][1] / 0.5, col[2] * cols[li][2] / 0.5], a); continue; }
      if (a > 0) col = mix3(col, cols[li], a);
    }
    // turkin yksityiskohta alkuperäisestä
    const l = B.L[i], lb = B.Lb[i];
    // bilateraalinen suhde: pehmeä varjostus + karvan veto ilman alkuperäisen kuvion reunoja
    let det = clamp(Math.pow((l + 0.02) / (B.bil[i] + 0.02), 0.9 * k), 0.75, 1.2);
    det = 1 + (det - 1) * ss(0.16, 0.05, B.edge[i]) * ss(0.1, 0.01, B.darkFrac[i]);
    // karvan suuntainen hienovarainen vaihtelu (proseduraalinen, ei riipu pohjan kuviosta)
    det *= 0.94 + 0.12 * fbm(f[0] * 14, f[1] * 30, f[2] * 14);
    const sd = Math.sqrt(Math.max(0, B.L2b[i] - lb * lb)) / (lb + 0.03);
    const hw = clamp(f[F.head] + f[F.jaw]);
    let r = col[0] * det, g = col[1] * det, b = col[2] * det;
    // silmät, nenä, suu, ääriviivat: pään pienimuotoinen tumma / yksityiskohtainen alue säilytetään alkuperäisenä
    if (L.keepFace !== false && hw > 0.35) {
      const ink = ss(0.75, 0.45, (l + 0.01) / (B.Lb6[i] + 0.01)) * ss(0.3, 0.06, l);
      const eyeDetail = ss(0.55, 0.9, sd) * ss(0.2, 0.45, f[F.hx]) * ss(0.6, 0.9, f[F.hx] < 0.95 ? 1 : 0);
      // vain silmäalue (pään sivu, kuonon ja kallon välissä) ja nenä/suu (kuonon kärki) säilytetään
      const eb = L.eyeBox || [0.22, 0.78, 0.0, 0.55];
      const zone = Math.max(ss(eb[0], eb[0] + 0.06, f[F.hx]) * ss(eb[1], eb[1] - 0.06, f[F.hx]) * ss(eb[2], eb[2] + 0.06, f[F.hy]) * ss(eb[3], eb[3] - 0.06, f[F.hy]),
        ss(0.86, 0.94, f[F.hx]));
      const keep = clamp(Math.max(ink, eyeDetail * 0.85)) * ss(0.35, 0.6, hw) * ss(0.3, 0.12, B.darkFrac[i]) * zone;
      if (keep > 0) { const o = [Math.pow(rgba[i * 4] / 255, 2.2), Math.pow(rgba[i * 4 + 1] / 255, 2.2), Math.pow(rgba[i * 4 + 2] / 255, 2.2)];
        r += (o[0] - r) * keep; g += (o[1] - g) * keep; b += (o[2] - b) * keep; }
    }
    if (DEBUG) { r = f[F.hx] > 0 && hw > 0.3 ? (Math.floor(f[F.hx] * 10) % 2 ? 1 : 0.2) : 0.3; g = hw; b = f[F.ny] * 0.5 + 0.5; }
    out[i * 4] = Math.round(255 * Math.pow(clamp(r), 1 / 2.2)); out[i * 4 + 1] = Math.round(255 * Math.pow(clamp(g), 1 / 2.2));
    out[i * 4 + 2] = Math.round(255 * Math.pow(clamp(b), 1 / 2.2)); out[i * 4 + 3] = 255; coverMask[i] = 1;
  }
  // saumojen täyttö: peittämättömät tekselit naapureista (8 kierrosta), loput alkuperäisinä
  for (let pass = 0; pass < 8; pass++) {
    const nxt = coverMask.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (coverMask[i]) continue;
      let s0 = 0, s1 = 0, s2 = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const j = yy * W + xx; if (coverMask[j]) { s0 += out[j * 4]; s1 += out[j * 4 + 1]; s2 += out[j * 4 + 2]; n++; } }
      if (n) { out[i * 4] = s0 / n; out[i * 4 + 1] = s1 / n; out[i * 4 + 2] = s2 / n; out[i * 4 + 3] = 255; nxt[i] = 1; }
    }
    coverMask.set(nxt);
  }
  for (let i = 0; i < W * H; i++) if (!coverMask[i]) { out[i * 4] = rgba[i * 4]; out[i * 4 + 1] = rgba[i * 4 + 1]; out[i * 4 + 2] = rgba[i * 4 + 2]; out[i * 4 + 3] = 255; }
  const file = path.join(OUT, id + (DEBUG ? '.debug' : '') + '.webp');
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 80 }).toFile(file);
  console.log('look', id, '<-', L.base, W + 'x' + H, (fs.statSync(file).size / 1024).toFixed(0) + ' kB');
}

for (const [id, L] of Object.entries(LOOKS)) {
  if (only.length && !only.includes(id)) continue;
  await makeLook(id, L);
}
