// Ulkonäkövarianttien tekstuurit v2: yksityiskohdat säilyttävä värimuunnos.
//   node tools/recolor-looks.mjs [lookId ...] [--debug=tone|region|keep|marks] [--force]
// Lukee src/data/looks.js:n speksit ja kirjoittaa kullekin public/models/looks/<id>.webp (1024 px),
// joka korvaa pohjamallin baseColor-tekstuurin pelissä (geometria, luusto ja klipit jaetaan).
//
// Toisin kuin v1 (litteä täyttö + pehmeä varjostus), v2 lähtee pohjan ALKUPERÄISESTÄ tekstuurista ja
// muuntaa vain värit. Tekstuuri hajotetaan kolmeen kerrokseen (OKLab-vaaleus L):
//   L = P(t) · S · D
//   P = pohjan oma "sävyluokka" (esim. musta satula / ruskea turkki), t = 0 tummin ... 1 vaalein luokka,
//       arvioitu mediaanisuodatetusta vaaleudesta (mediaani poistaa ohuet viivat mutta säilyttää läikät
//       ilman sumennusrenkaita) ja k-means-luokkakeskuksista,
//   S = luokan sisäinen varjostus (mediaani / luokan keskus),
//   D = pienimuotoinen yksityiskohta (alkuperäinen / mediaani): karvaviivat, ääriviivat, silmät, hampaat.
// Väri vaihdetaan gradient mapilla t -> tavoitepaletti (tumma -> vaalea) ja S·D kerrotaan takaisin,
// joten jokainen karvaviiva ja varjostus säilyy. Värikylläisyyden pienet vaihtelut (a,b-poikkeama
// luokan keskiväristä) lisätään takaisin osuudella chroma.
// Alueet (pää, kuono, korvat, kaula, selkä, vatsa, jalat, tassut, häntä) lasketaan skinning-painoista
// ja normaaleista pehmeillä reunoilla; kullekin voi antaa oman graden (regionGrades).
// Merkit (naamio, satula, sukat, täplät ...) ovat 3D-piirteiden funktioita; ne sekoitetaan
// tone- (= uusi pohjaväri, yksityiskohta säilyy), multiply-, overlay-, softlight- tai normal-tilassa.
// Silmät, nenä, suu, hampaat ja kielen pinkki säilyvät alkuperäisinä (keep-maski), iiriksen väriä voi
// halutessa vaihtaa (eyeColor).
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
const SRC = path.join(ROOT, 'assets/models-src');
const CACHE = path.join(ROOT, 'node_modules/.cache/looks');
const args = process.argv.slice(2);
const DEBUG = (args.find(a => a.startsWith('--debug')) || '').split('=')[1] || (args.includes('--debug') ? 'tone' : '');
const only = args.filter(a => !a.startsWith('--'));
const SIZE = 1024, QUALITY = 82;
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

// ------------------------------------------------------------------ väri- ja apufunktiot
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const l2s = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055);
function lin2lab(r, g, b, o = [0, 0, 0]) {   // OKLab
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  o[0] = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  o[1] = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  o[2] = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s; return o;
}
function lab2lin(L, a, b, o = [0, 0, 0]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  o[0] = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  o[1] = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  o[2] = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s; return o;
}
const hexLab = h => { const n = parseInt(h.replace('#', ''), 16); return lin2lab(s2l(((n >> 16) & 255) / 255), s2l(((n >> 8) & 255) / 255), s2l((n & 255) / 255)); };
function hash(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  let r = 0;
  for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++)
    r += hash(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  return r;
}
const fbm = (x, y, z) => 0.6 * vnoise(x, y, z) + 0.3 * vnoise(x * 2.1, y * 2.1, z * 2.1) + 0.1 * vnoise(x * 4.3, y * 4.3, z * 4.3);
function cell(x, y, z, size, seed) {
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
function inv4(m) {
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
function blur(src, W, H, r, mask) {   // laatikkosumennus x3 ~ gauss; mask: vain peitetyt tekselit (normalisoitu)
  const run = s => { let a = Float32Array.from(s), b = new Float32Array(W * H);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H; y++) { let q = 0; const o = y * W; for (let x = -r; x <= r; x++) q += a[o + clamp(x, 0, W - 1)];
        for (let x = 0; x < W; x++) { b[o + x] = q / (2 * r + 1); q += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
      for (let x = 0; x < W; x++) { let q = 0; for (let y = -r; y <= r; y++) q += b[clamp(y, 0, H - 1) * W + x];
        for (let y = 0; y < H; y++) { a[y * W + x] = q / (2 * r + 1); q += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
    } return a; };
  if (!mask) return run(src);
  const num = run(src.map((v, i) => v * mask[i])), den = run(mask);
  return num.map((v, i) => (den[i] > 1e-4 ? v / den[i] : src[i]));
}
// mediaani saman UV-saaren tekseleistä (ohuet viivat katoavat, läikkien reunat säilyvät terävinä)
function median(L, lab, W, H, r, sel) {
  const out = Float32Array.from(L), buf = new Float32Array((2 * r + 1) ** 2);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; const id = lab[i]; if (!id || (sel && !sel[i])) continue;
    let n = 0;
    for (let yy = Math.max(0, y - r); yy <= Math.min(H - 1, y + r); yy++) { const o = yy * W;
      for (let xx = Math.max(0, x - r); xx <= Math.min(W - 1, x + r); xx++) if (lab[o + xx] === id) buf[n++] = L[o + xx]; }
    const s = buf.subarray(0, n).sort(); out[i] = n & 1 ? s[n >> 1] : 0.5 * (s[(n >> 1) - 1] + s[n >> 1]);
  }
  return out;
}

// ------------------------------------------------------------------ pohjamallin analyysi
const GROUPS = { head: ['head'], jaw: ['jaw'], ear: ['ear_L', 'ear_R'], neck: ['neck'], body: ['root', 'spine_01', 'spine_02', 'spine_03'],
  tail: ['tail_01', 'tail_02', 'tail_03'], legU: ['front_upper_L', 'front_upper_R', 'back_upper_L', 'back_upper_R'],
  legL: ['front_lower_L', 'front_lower_R', 'back_lower_L', 'back_lower_R'], paw: ['front_paw_L', 'front_paw_R', 'back_paw_L', 'back_paw_R'] };
const GN = Object.keys(GROUPS);
const F = { X: 0, Y: 1, Z: 2, nx: 3, ny: 4, nz: 5, head: 6, jaw: 7, ear: 8, neck: 9, body: 10, tail: 11, legU: 12, legL: 13, paw: 14,
  front: 15, hx: 16, hy: 17, hz: 18, tt: 19, earL: 20 };
const NF = 21;
const baseCache = {};

async function analyse(model, tones = 2) {
  const key = model + ':' + tones;
  if (baseCache[key]) return baseCache[key];
  const file = path.join(SRC, model + '.glb');
  const doc = await io.read(file);
  const r = doc.getRoot();
  const prim = r.listMeshes()[0].listPrimitives()[0];
  const skin = r.listSkins()[0];
  const jn = skin.listJoints().map(j => j.getName());
  const ibm = skin.getInverseBindMatrices();
  const jpos = {}; jn.forEach((n, i) => { const m = inv4(ibm.getElement(i, [])); jpos[n] = [m[12], m[13], m[14]]; });
  const P = prim.getAttribute('POSITION'), N = prim.getAttribute('NORMAL'), UV = prim.getAttribute('TEXCOORD_0');
  const J = prim.getAttribute('JOINTS_0'), Wt = prim.getAttribute('WEIGHTS_0'), I = prim.getIndices();
  const nv = P.getCount();
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const fw = sub(jpos.head, jpos.tail_01); fw[1] = 0; const fl = Math.hypot(fw[0], fw[2]); fw[0] /= fl; fw[2] /= fl;
  const side = [-fw[2], 0, fw[0]];
  let minY = 1e9, maxY = -1e9, cx = 0, cz = 0;
  const pos = []; for (let i = 0; i < nv; i++) { const p = P.getElement(i, []); pos.push(p); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); cx += p[0]; cz += p[2]; }
  cx /= nv; cz /= nv; const Hh = maxY - minY;
  const toN = p => [((p[0] - cx) * fw[0] + (p[2] - cz) * fw[2]) / Hh, (p[1] - minY) / Hh, ((p[0] - cx) * side[0] + (p[2] - cz) * side[2]) / Hh];
  const J2 = {}; for (const k in jpos) J2[k] = toN(jpos[k]);
  const feat = new Float32Array(nv * NF);
  const gidx = {}; GN.forEach((g, gi) => GROUPS[g].forEach(b => (gidx[b] = gi)));
  const headP = J2.head;
  let headLen = 0;
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
    if (feat[o + F.head] + feat[o + F.jaw] > 0.5) headLen = Math.max(headLen, p[0] - headP[0]);
  }
  const tailLen = Math.hypot(...sub(J2.tail_03, J2.tail_01)) * 1.6;
  for (let i = 0; i < nv; i++) {
    const o = i * NF;
    feat[o + F.hx] = (feat[o] - headP[0]) / headLen;
    feat[o + F.hy] = (feat[o + 1] - headP[1]) / headLen;
    feat[o + F.hz] = feat[o + 2] / headLen;
    feat[o + F.tt] = clamp(Math.hypot(feat[o] - J2.tail_01[0], feat[o + 1] - J2.tail_01[1], feat[o + 2] - J2.tail_01[2]) / tailLen);
  }
  // tekstuuri 1024 px:iin (lähde 2048)
  const bc = r.listMaterials()[0].getBaseColorTexture();
  const W = SIZE, H = SIZE;
  const rgba = await sharp(Buffer.from(bc.getImage())).resize(W, H, { kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer();
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
      if (l0 < -1e-4 || l1 < -1e-4 || l2 < -1e-4) continue;
      const o = (y * W + x) * NF;
      for (let k = 0; k < NF; k++) tf[o + k] = feat[a * NF + k] * l0 + feat[b * NF + k] * l1 + feat[c * NF + k] * l2;
      cov[y * W + x] = 1;
    }
  }
  // UV-saaret (4-naapuruus) -> mediaani ei sekoita eri saarten sisältöä
  const isl = new Int32Array(W * H); let nIsl = 0; const stack = [];
  for (let s = 0; s < W * H; s++) { if (!cov[s] || isl[s]) continue; nIsl++; isl[s] = nIsl; stack.push(s);
    while (stack.length) { const i = stack.pop(), x = i % W, y = (i / W) | 0;
      if (x > 0 && cov[i - 1] && !isl[i - 1]) { isl[i - 1] = nIsl; stack.push(i - 1); }
      if (x < W - 1 && cov[i + 1] && !isl[i + 1]) { isl[i + 1] = nIsl; stack.push(i + 1); }
      if (y > 0 && cov[i - W] && !isl[i - W]) { isl[i - W] = nIsl; stack.push(i - W); }
      if (y < H - 1 && cov[i + W] && !isl[i + W]) { isl[i + W] = nIsl; stack.push(i + W); } } }
  // saumojen piirteet: peittämättömät tekselit saavat lähimmän peitetyn naapurin piirteet ja saaren (10 kierrosta)
  const filled = cov.slice();
  for (let pass = 0; pass < 10; pass++) { const nxt = filled.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (filled[i]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const j = yy * W + xx; if (filled[j]) { tf.copyWithin(i * NF, j * NF, j * NF + NF); nxt[i] = 1; break; } } }
    filled.set(nxt); }
  // OKLab
  const lab = new Float32Array(W * H * 3); const L = new Float32Array(W * H); const t3 = [0, 0, 0];
  for (let i = 0; i < W * H; i++) { lin2lab(s2l(rgba[i * 4] / 255), s2l(rgba[i * 4 + 1] / 255), s2l(rgba[i * 4 + 2] / 255), t3);
    lab[i * 3] = t3[0]; lab[i * 3 + 1] = t3[1]; lab[i * 3 + 2] = t3[2]; L[i] = t3[0]; }
  // mediaanit (välimuisti levylle: hitain vaihe)
  const cfile = path.join(CACHE, model + '.' + SIZE + '.bin');
  let Lm, Lm2;
  const st = fs.statSync(file).mtimeMs;
  if (fs.existsSync(cfile) && fs.statSync(cfile).mtimeMs > st) { const b = fs.readFileSync(cfile); const all = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
    Lm = all.slice(0, W * H); Lm2 = all.slice(W * H); }
  else {
    Lm = median(L, isl, W, H, 6);
    // suurempi mittakaava vain pään alueelle (silmät, nenä)
    const sel = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) sel[i] = cov[i] && tf[i * NF + F.head] + tf[i * NF + F.jaw] > 0.25 ? 1 : 0;
    Lm2 = median(L, isl, W, H, 13, sel);
    const all = new Float32Array(W * H * 2); all.set(Lm); all.set(Lm2, W * H); fs.writeFileSync(cfile, Buffer.from(all.buffer));
  }
  // sävyluokat: k-means mediaanivaaleudesta (vain peitetyt tekselit)
  const smp = []; for (let i = 0; i < W * H; i += 3) if (cov[i]) smp.push(Lm[i]); smp.sort((a, b) => a - b);
  let C = Array.from({ length: tones }, (_, k) => smp[Math.floor((k + 0.5) / tones * smp.length)]);
  for (let it = 0; it < 30; it++) { const s = C.map(() => 0), n = C.map(() => 0);
    for (const v of smp) { let bk = 0; for (let k = 1; k < tones; k++) if (Math.abs(v - C[k]) < Math.abs(v - C[bk])) bk = k; s[bk] += v; n[bk]++; }
    C = C.map((c, k) => (n[k] ? s[k] / n[k] : c)).sort((a, b) => a - b); }
  // luokan keskivärit (a,b) -> chroma-poikkeama
  const Cab = C.map(() => [0, 0, 0]);
  for (let i = 0; i < W * H; i++) { if (!cov[i]) continue; let bk = 0; for (let k = 1; k < tones; k++) if (Math.abs(Lm[i] - C[k]) < Math.abs(Lm[i] - C[bk])) bk = k;
    Cab[bk][0] += lab[i * 3 + 1]; Cab[bk][1] += lab[i * 3 + 2]; Cab[bk][2]++; }
  Cab.forEach(c => { c[0] /= c[2] || 1; c[1] /= c[2] || 1; });
  // jatkuva sävykoordinaatti t (0 = tummin luokka ... 1 = vaalein) ja varjostus S
  const T = new Float32Array(W * H), S = new Float32Array(W * H), D = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const m = Lm[i]; let t = 0;
    for (let k = 0; k < tones - 1; k++) { const mid = 0.5 * (C[k] + C[k + 1]), w = 0.18 * (C[k + 1] - C[k]); t += ss(mid - w, mid + w, m); }
    t /= Math.max(1, tones - 1); T[i] = t;
    const k0 = Math.min(tones - 2, Math.floor(t * (tones - 1))), f = t * (tones - 1) - k0;
    const cen = tones > 1 ? lerp(C[k0], C[k0 + 1], f) : C[0];
    S[i] = clamp(m / cen, 0.6, 1.45);
    D[i] = clamp((L[i] + 0.02) / (m + 0.02), 0.15, 2.2);
  }
  // flatten: kunkin ääriluokan varjostus "maalattuna" toisen luokan läikkien yli (laaja normalisoitu sumennus)
  const covF = Float32Array.from(cov);
  const fillS = [0, tones - 1].map(k => { const tk = k / Math.max(1, tones - 1);
    const w = new Float32Array(W * H); for (let i = 0; i < W * H; i++) w[i] = cov[i] ? ss(0.35, 0.05, Math.abs(T[i] - tk)) : 0;
    const num = blur(S.map((v, i) => v * w[i]), W, H, 14), den = blur(w, W, H, 14);
    return num.map((v, i) => (den[i] > 0.02 ? clamp(v / den[i], 0.7, 1.3) : 1)); });
  // sävyluokkien rajat (pohjan omien läikkien reunaviivat): flatten vaimentaa näiden yksityiskohdan
  const Te = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (isl[i] !== isl[i + 1] || isl[i] !== isl[i + W]) continue;
    Te[i] = Math.hypot(T[i + 1] - T[i - 1], T[i + W] - T[i - W]); }
  const TeB = blur(Te.map(v => ss(0.02, 0.12, v)), W, H, 4);
  const Tedge = TeB.map(v => ss(0.01, 0.1, v));
  // suojattavat kasvonpiirteet: silmät, nenä, suu, hampaat, kieli (pään pienimuotoiset kontrastit + pinkki)
  const keep = new Float32Array(W * H), iris = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const o = i * NF; const hw = clamp(tf[o + F.head] + tf[o + F.jaw]); if (hw < 0.25) continue;
    const hx = tf[o + F.hx], hy = tf[o + F.hy];
    const a = lab[i * 3 + 1], b = lab[i * 3 + 2], ch = Math.hypot(a, b);
    const d2 = (L[i] + 0.02) / (Lm2[i] + 0.02);
    const contrast = ss(0.22, 0.4, Math.abs(Math.log(d2)));
    const eyeZone = ss(0.12, 0.25, hx) * ss(0.85, 0.7, hx) * ss(-0.15, 0.0, hy) * ss(0.7, 0.55, hy);
    const noseZone = ss(0.82, 0.92, hx);
    const pink = ss(0.04, 0.08, a) * ss(-0.02, 0.04, a - Math.abs(b) * 0.6) * ss(0.35, 0.5, L[i]);   // kieli/ien
    const dark = ss(0.42, 0.3, L[i]);
    let k = Math.max(contrast * eyeZone, noseZone * Math.max(dark, contrast) * 0.95, pink * ss(0.5, 0.75, hx));
    keep[i] = k * ss(0.25, 0.5, hw);
    // iiris: silmäalueen kylläinen, keskivaalea teksel
    iris[i] = keep[i] * eyeZone * ss(0.05, 0.09, ch) * ss(0.3, 0.45, L[i]) * ss(0.92, 0.8, L[i]) * (1 - pink);
  }
  const keepB = blur(keep, W, H, 1), irisB = blur(iris, W, H, 1);
  for (let i = 0; i < W * H; i++) { keep[i] = clamp(Math.max(keep[i], keepB[i]) * 1.15); iris[i] = Math.max(iris[i], irisB[i]); }
  const res = { W, H, rgba, lab, L, Lm, T, S, D, Tedge, fillS, C, Cab, tones, tf, cov, filled, keep, iris, model };
  console.log('  base', model, 'tones', C.map(c => c.toFixed(3)).join(' / '));
  baseCache[key] = res; return res;
}

// ------------------------------------------------------------------ alueet (pehmeät painot, summa 1)
const REGIONS = ['head', 'muzzle', 'ears', 'neck', 'back', 'belly', 'chest', 'legs', 'paws', 'tail'];
function regionWeights(f, out) {
  const hw = clamp(f[F.head] + f[F.jaw]), ear = clamp(f[F.ear]);
  const muz = hw * ss(0.5, 0.68, f[F.hx]);
  const ventral = ss(0.15, -0.35, f[F.ny]);
  const torso = clamp(f[F.body] + f[F.neck] * 0.3 + f[F.legU] * 0.5 * ss(0.38, 0.5, f[F.Y]));
  const chest = clamp(f[F.neck] + f[F.body] * ss(0.02, 0.2, f[F.X])) * ss(-0.1, 0.5, f[F.nx]) * ss(0.4, -0.15, f[F.ny]);
  out[0] = clamp(hw - muz - ear * 0.5);                 // head
  out[1] = muz;                                         // muzzle
  out[2] = ss(0.4, 0.7, ear);                           // ears
  out[3] = clamp(f[F.neck] * 0.7) * (1 - chest);        // neck
  out[4] = torso * (1 - ventral) * (1 - chest);         // back
  out[5] = torso * ventral * (1 - chest);               // belly
  out[6] = chest;                                       // chest
  out[7] = clamp(f[F.legL] + f[F.legU] * ss(0.5, 0.38, f[F.Y]));   // legs
  out[8] = clamp(f[F.paw] * 1.2);                       // paws
  out[9] = clamp(f[F.tail] * 1.2);                      // tail
  let s = 0; for (let k = 0; k < 10; k++) s += out[k];
  if (s < 1e-3) { out.fill(0); out[4] = 1; return out; }
  for (let k = 0; k < 10; k++) out[k] /= s; return out;
}

// ------------------------------------------------------------------ merkit (3D-piirteiden funktioita, 0..1)
const reg = (f, ...g) => g.reduce((s, k) => s + f[F[k]], 0);
const headW = f => clamp(f[F.head] + f[F.jaw]);
const MARKS = {
  under: (f, m) => { const lv = m.level ?? 0;
    const ventral = ss(0.05 - lv, -0.45 - lv, f[F.ny]);
    const torso = clamp(reg(f, 'body', 'neck') + f[F.legU] * 0.6);
    const chest = clamp(f[F.neck] + f[F.body] * ss(0.0, 0.25, f[F.X])) * ss(-0.1, 0.5, f[F.nx]) * ss(0.35, -0.2, f[F.ny]);
    const innerLeg = clamp(reg(f, 'legU', 'legL')) * ss(0.25, 0.6, -f[F.nz] * Math.sign(f[F.Z] || 1)) * (m.innerLegs === false ? 0 : 1);
    const throat = clamp(f[F.jaw] + f[F.head] * 0.6) * ss(-0.1, -0.6, f[F.ny]) * ss(0.15, 0.4, f[F.hx]) * (m.throat === false ? 0 : 1);
    const tailU = f[F.tail] * ss(0.0, -0.5, f[F.ny]) * (m.tail ? 1 : 0);
    return Math.max(ventral * torso, chest * (m.chest ?? 1), innerLeg * 0.9, throat, tailU); },
  saddle: (f, m) => { const lv = m.level ?? 0.15, jit = (fbm(f[0] * 9, f[1] * 9, f[2] * 9) - 0.5) * 0.35;
    const dorsal = ss(lv - 0.12, lv + 0.12, f[F.ny] + jit + (f[F.Y] - (m.y ?? 0.62)) * 2.2);
    const area = clamp(f[F.body] + f[F.neck] * (m.neck ?? 0.8) + f[F.tail] * (m.tail ?? 1) + f[F.legU] * (m.thigh ?? 0.25) * ss(0.4, 0.55, f[F.Y]) + f[F.head] * (m.head ?? 0) * ss(-0.3, 0.2, -f[F.hx]));
    const xr = ss((m.x0 ?? -9) - 0.04, (m.x0 ?? -9) + 0.04, f[F.X]) * ss((m.x1 ?? 9) + 0.04, (m.x1 ?? 9) - 0.04, f[F.X]);
    return dorsal * area * xr; },
  cap: (f, m) => { const h = headW(f); const top = ss((m.level ?? 0.15) - 0.15, (m.level ?? 0.15) + 0.1, f[F.ny] + (f[F.hy] - 0.2));
    return Math.max(h * top * ss((m.hx ?? 0.55) + 0.1, (m.hx ?? 0.55) - 0.1, f[F.hx]), m.ears === false ? 0 : ss(0.4, 0.7, f[F.ear])); },
  muzzle: (f, m) => { const h = headW(f); const e = m.extent ?? 0.6, jit = (vnoise(f[0] * 40, f[1] * 40, f[2] * 40) - 0.5) * 0.08;
    let v = h * ss(e - 0.06, e + 0.06, f[F.hx] + jit);
    if (m.lower) v *= ss(0.25, -0.15, f[F.ny]);
    return v; },
  mask: (f, m) => { const h = headW(f); const e = m.extent ?? 0.3, jit = (vnoise(f[0] * 35, f[1] * 35, f[2] * 35) - 0.5) * 0.1;
    let v = h * ss(e - 0.08, e + 0.08, f[F.hx] + jit);
    if (m.eyes !== false) { const ex = m.eyeX ?? 0.45, ey = m.eyeY ?? 0.3, ez = m.eyeZ ?? 0.32;
      const d = Math.hypot((f[F.hx] - ex) / 0.24, (f[F.hy] - ey) / 0.2, (Math.abs(f[F.hz]) - ez) / 0.3); v = Math.max(v, h * ss(1.15, 0.85, d + jit)); }
    return v; },
  cheeks: (f, m) => { const h = headW(f); return h * ss(m.extent ?? 0.35, (m.extent ?? 0.35) + 0.12, f[F.hx]) * ss(m.level ?? 0.2, (m.level ?? 0.2) - 0.3, f[F.ny] + f[F.hy] * 0.8); },
  brows: (f, m) => { const h = clamp(f[F.head]); const ex = m.eyeX ?? 0.42, ey = (m.eyeY ?? 0.3) + 0.17, ez = m.eyeZ ?? 0.28;
    const d = Math.hypot((f[F.hx] - ex) / (m.r ?? 0.1), (f[F.hy] - ey) / ((m.r ?? 0.1) * 0.8), (Math.abs(f[F.hz]) - ez) / 0.18); return h * ss(1.1, 0.8, d) * ss(-0.2, 0.2, f[F.ny] + 0.3); },
  blaze: (f, m) => { const h = clamp(f[F.head]); return h * ss(m.width ?? 0.12, (m.width ?? 0.12) * 0.5, Math.abs(f[F.hz])) * ss(-0.2, 0.2, f[F.ny]) * ss(m.from ?? -0.1, (m.from ?? -0.1) + 0.2, f[F.hx]); },
  ears: (f, m) => { const e = f[F.ear]; return ss(m.lo ?? 0.45, m.hi ?? 0.75, e) * (m.tips ? ss(m.tips, m.tips + 0.12, f[F.hy] - 0.9) : 1); },
  socks: (f, m) => { const lg = clamp(reg(f, 'legL', 'paw') + f[F.legU] * 0.5); const h = m.height ?? 0.16, jit = (vnoise(f[0] * 30, f[1] * 30, f[2] * 30) - 0.5) * 0.05;
    const fb = m.front === undefined ? 1 : (m.front ? f[F.front] : 1 - f[F.front]);
    return lg * ss(h + 0.035, h - 0.035, f[F.Y] + jit) * fb; },
  legs: (f, m) => clamp(reg(f, 'legL', 'paw') + f[F.legU] * ss((m.y ?? 0.42) + 0.04, (m.y ?? 0.42) - 0.04, f[F.Y])) * (m.outer ? ss(-0.1, 0.4, f[F.nz] * Math.sign(f[F.Z] || 1)) : 1),
  tailTip: (f, m) => f[F.tail] * ss((m.from ?? 0.7) - 0.06, (m.from ?? 0.7) + 0.06, f[F.tt]),
  tail: f => clamp(f[F.tail] * 1.3),
  chest: (f, m) => { const c = clamp(f[F.neck] + f[F.body] * ss(0.05, 0.22, f[F.X])); const jit = (vnoise(f[0] * 25, f[1] * 25, f[2] * 25) - 0.5) * 0.2;
    return c * ss(0.0, 0.45, f[F.nx] + jit) * ss(m.w ?? 0.6, (m.w ?? 0.6) - 0.25, Math.abs(f[F.nz])) * ss(0.4, -0.1, f[F.ny]); },
  spots: (f, m) => { const s = m.size ?? 0.05; const wj = (fbm(f[0] * 18, f[1] * 18, f[2] * 18) - 0.5) * (m.ragged ?? 0.25);
    const d = cell(f[0], f[1] * 1.15, f[2], s, m.seed ?? 3) + wj;
    const r = m.r ?? 0.42; const area = 1 - (m.ears === false ? clamp(f[F.ear]) : 0) - (m.noHead ? headW(f) : 0) - (m.noLegs ? clamp(reg(f, 'legL', 'paw')) : 0);
    return ss(r + 0.05, r - 0.05, d) * clamp(area) * (m.noBelly ? ss(-0.6, -0.2, f[F.ny]) : 1); },
  ticking: (f, m) => { const d = cell(f[0], f[1], f[2], m.size ?? 0.016, (m.seed ?? 5) + 11); return ss(0.42, 0.25, d) * (m.dorsal ? ss(-0.4, 0.3, f[F.ny]) : 1) * (m.noHead ? 1 - headW(f) : 1); },
  stripes: (f, m) => { const fr = m.freq ?? 38, w = (fbm(f[0] * 6, f[1] * 6, f[2] * 6) - 0.5) * (m.warp ?? 2.5);
    const s = Math.sin(f[0] * fr + f[1] * fr * (m.slant ?? 0.35) + w * 3.0 + Math.abs(f[2]) * (m.wrap ?? 6));
    const t = m.thick ?? 0.35; const brk = ss(0.15, 0.35, vnoise(f[0] * 22, f[1] * 22, f[2] * 22) - (m.breakup ?? 0.25) + 0.25);
    const area = clamp(reg(f, 'body', 'neck', 'legU') + f[F.tail] * 0.7 + f[F.legL] * (m.legs ?? 0.5) + clamp(f[F.head]) * (m.head ?? 0.4)) * (m.belly === false ? ss(-0.5, -0.15, f[F.ny]) : 1);
    return ss(1 - t, 1 - t + 0.25, s) * area * (0.3 + 0.7 * brk); },
  patches: (f, m) => { const n = fbm(f[0] * (m.scale ?? 7) + (m.seed ?? 0), f[1] * (m.scale ?? 7), f[2] * (m.scale ?? 7)); return ss((m.r ?? 0.62) - 0.03, (m.r ?? 0.62) + 0.03, n); },
  grizzle: (f, m) => headW(f) * ss(m.extent ?? 0.45, (m.extent ?? 0.45) + 0.15, f[F.hx]) * (0.55 + 0.45 * vnoise(f[0] * 160, f[1] * 160, f[2] * 160)),
  scar: (f, m) => { const sp = m.space === 'body' ? [f[F.X], f[F.Y], f[F.Z]] : [f[F.hx], f[F.hy], f[F.hz]];
    const sideOk = m.side === undefined ? 1 : (Math.sign(sp[2]) === m.side ? 1 : 0);
    const a = m.a, b = m.b; const p = [sp[0], sp[1], Math.abs(sp[2])];
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const tt = clamp((ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2));
    const d = Math.hypot(ap[0] - ab[0] * tt, ap[1] - ab[1] * tt, ap[2] - ab[2] * tt);
    const w = (m.w ?? 0.035) * (0.4 + 0.6 * Math.sin(Math.PI * tt));
    const facing = m.space === 'body' ? 1 : ss(0.05, 0.3, Math.abs(f[F.nz]) + f[F.ny] * 0.5);
    return ss(w, w * 0.45, d) * sideOk * facing * (m.space === 'body' ? 1 : headW(f)); },
  all: () => 1,
};

// ------------------------------------------------------------------ grade: värimuunnos yhdelle tekselille
// g = { gradient: [hex | [pos, hex]], hue (deg), sat (x), val (x), gamma, contrast, detail, shade, chroma, flatten }
function prepGrade(g, tones) {
  const p = { ...g };
  if (g.gradient) p.stops = g.gradient.map((s, k, a) => Array.isArray(s) ? [s[0], hexLab(s[1])] : [a.length === 1 ? 0 : k / (a.length - 1), hexLab(s)]);
  p.hue = (g.hue ?? 0) * Math.PI / 180; p.sat = g.sat ?? 1; p.val = g.val ?? 1; p.gamma = g.gamma ?? 1; p.contrast = g.contrast ?? 1;
  p.detail = g.detail ?? 1; p.shade = g.shade ?? 1; p.chroma = g.chroma ?? (g.gradient ? 0.5 : 1); p.flatten = g.flatten ?? 0;
  p.flatEdge = p.stops && p.stops.length === 1 ? Math.max(0.8, p.flatten) : p.flatten;
  return p;
}
function evalStops(stops, t, o) {
  if (t <= stops[0][0]) { o[0] = stops[0][1][0]; o[1] = stops[0][1][1]; o[2] = stops[0][1][2]; return o; }
  for (let k = 1; k < stops.length; k++) if (t <= stops[k][0]) { const [p0, c0] = stops[k - 1], [p1, c1] = stops[k]; const f = (t - p0) / (p1 - p0 || 1);
    o[0] = lerp(c0[0], c1[0], f); o[1] = lerp(c0[1], c1[1], f); o[2] = lerp(c0[2], c1[2], f); return o; }
  const c = stops[stops.length - 1][1]; o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; return o;
}
const _g = [0, 0, 0];
function applyGrade(B, i, p, o) {
  const L = B.L[i], a = B.lab[i * 3 + 1], b = B.lab[i * 3 + 2];
  let t = B.T[i];
  if (p.flatten) t = lerp(t, p.flattenTo ?? 1, p.flatten);
  let S = Math.pow(B.S[i], p.shade), Dd = Math.pow(B.D[i], p.detail);
  if (p.flatten) { const ft = p.flattenTo ?? 1, k = ft >= 0.5 ? 1 : 0; const away = Math.abs(B.T[i] - ft) * p.flatten;
    S = lerp(S, Math.pow(B.fillS[k][i], p.shade), away); Dd = lerp(Dd, clamp(Dd, 0.8, 1.15), away * 0.5); }
  if (p.flatEdge) { const e = B.Tedge[i] * p.flatEdge; Dd = lerp(Dd, clamp(Dd, 0.93, 1.05), e); S = lerp(S, 1, e); }
  let Lo, ao, bo;
  if (p.stops) {
    evalStops(p.stops, t, _g);
    // luokan keskiväri tällä t:llä (chroma-poikkeaman vertailukohta)
    const k0 = Math.min(B.tones - 2, Math.floor(B.T[i] * (B.tones - 1))), f = B.T[i] * (B.tones - 1) - k0;
    const ca = B.tones > 1 ? lerp(B.Cab[k0][0], B.Cab[k0 + 1][0], f) : B.Cab[0][0], cb = B.tones > 1 ? lerp(B.Cab[k0][1], B.Cab[k0 + 1][1], f) : B.Cab[0][1];
    Lo = _g[0] * S * Dd; ao = _g[1] + (a - ca) * p.chroma; bo = _g[2] + (b - cb) * p.chroma;
    // tummissa yksityiskohdissa (viivat) väri kohti mustaa, kuten alkuperäisessä
    const ink = ss(0.85, 0.4, Dd); ao *= 1 - 0.6 * ink; bo *= 1 - 0.6 * ink;
  } else {
    Lo = (p.flatten ? L * Math.pow(lerp(B.Lm[i], B.C[B.tones - 1], p.flatten) / B.Lm[i], 1) : L) * (p.detail !== 1 ? Math.pow(B.D[i], p.detail - 1) : 1); ao = a; bo = b;
  }
  // tonaalikäyrät: gamma ja kontrasti (L 0..1), arvo
  if (p.gamma !== 1) Lo = Math.pow(clamp(Lo, 0, 1.2), p.gamma);
  if (p.contrast !== 1) Lo = 0.5 + (Lo - 0.5) * p.contrast;
  Lo *= p.val;
  // sävy ja kylläisyys (LCh-kierto)
  if (p.hue || p.sat !== 1) { const c = Math.hypot(ao, bo) * p.sat, h = Math.atan2(bo, ao) + p.hue; ao = c * Math.cos(h); bo = c * Math.sin(h); }
  o[0] = Lo; o[1] = ao; o[2] = bo; return o;
}

// ------------------------------------------------------------------ sekoitustilat (sRGB 0..1)
const BLEND = {
  multiply: (b, s) => b * s,
  screen: (b, s) => 1 - (1 - b) * (1 - s),
  overlay: (b, s) => (b < 0.5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s)),
  softlight: (b, s) => (s < 0.5 ? b - (1 - 2 * s) * b * (1 - b) : b + (2 * s - 1) * ((b < 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b)) - b)),
  normal: (b, s) => s,
};
// karvan suuntainen reunan purkautuminen: anisotrooppinen kohina (pitkä karvan suunnassa)
function hairNoise(f) {
  const leg = clamp(reg(f, 'legL', 'legU', 'paw'));
  const x = f[0], y = f[1], z = f[2];
  // vartalolla karva kulkee taaksepäin ja alas, jaloissa alas
  const ax = lerp(1, 0.25, leg), ay = lerp(0.35, 1, leg);
  const u = x * ax + y * ay, v1 = -x * ay + y * ax;
  return vnoise(u * 18 + 3, v1 * 140, z * 140) * 0.65 + vnoise(u * 40, v1 * 300 + 7, z * 300) * 0.35;
}

// ------------------------------------------------------------------ yhden lookin generointi
async function makeLook(id, Lk) {
  const B = await analyse(Lk.base, Lk.tones ?? 2);
  const { W, H, tf, filled, rgba } = B;
  const out = Buffer.alloc(W * H * 4);
  const g0 = Lk.grade || {};
  const P = { _: prepGrade(g0, B.tones) };
  for (const [r, g] of Object.entries(Lk.regionGrades || {})) { if (!REGIONS.includes(r)) throw new Error(id + ': unknown region ' + r); P[r] = prepGrade({ ...g0, ...g }, B.tones); }
  const marks = (Lk.marks || []).map(m => {
    if (!MARKS[m.type]) throw new Error(id + ': unknown mark ' + m.type);
    const blend = m.blend ?? 'tone';
    const grade = blend === 'tone' ? prepGrade({ ...g0, ...(m.grade || {}), gradient: m.gradient || (m.color ? [m.color] : g0.gradient), chroma: m.chroma ?? 0.35, flatten: m.flatten ?? 0 }, B.tones) : null;
    const col = m.color ? (() => { const n = parseInt(m.color.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; })() : [0.5, 0.5, 0.5];
    return { m, blend, grade, col, opacity: m.opacity ?? 1, breakup: m.breakup ?? 0.35 };
  });
  const eye = Lk.eyeColor ? hexLab(Lk.eyeColor) : null;
  const f = new Float32Array(NF), rw = new Float32Array(10), lab = [0, 0, 0], acc = [0, 0, 0], lin = [0, 0, 0], tmp = [0, 0, 0];
  const regionKeys = REGIONS.map(r => P[r]);
  for (let i = 0; i < W * H; i++) {
    if (!filled[i]) { out[i * 4] = rgba[i * 4]; out[i * 4 + 1] = rgba[i * 4 + 1]; out[i * 4 + 2] = rgba[i * 4 + 2]; out[i * 4 + 3] = 255; continue; }
    for (let q = 0; q < NF; q++) f[q] = tf[i * NF + q];
    regionWeights(f, rw);
    // perusgrade + aluekohtaiset gradet (painotettu OKLab-summa)
    acc[0] = acc[1] = acc[2] = 0; let wsum = 0, wDef = 0;
    for (let r = 0; r < 10; r++) { if (!rw[r]) continue; if (!regionKeys[r]) { wDef += rw[r]; continue; }
      applyGrade(B, i, regionKeys[r], lab); acc[0] += lab[0] * rw[r]; acc[1] += lab[1] * rw[r]; acc[2] += lab[2] * rw[r]; wsum += rw[r]; }
    if (wDef > 0 || wsum === 0) { applyGrade(B, i, P._, lab); const w = wsum === 0 ? 1 : wDef; acc[0] += lab[0] * w; acc[1] += lab[1] * w; acc[2] += lab[2] * w; wsum += w; }
    lab[0] = acc[0] / wsum; lab[1] = acc[1] / wsum; lab[2] = acc[2] / wsum;
    // merkit
    let hn = -1;
    for (const M of marks) {
      let a = MARKS[M.m.type](f, M.m);
      if (a <= 0) continue;
      if (a < 1 && M.breakup) { if (hn < 0) hn = hairNoise(f); a = ss(0, 1, a + (hn - 0.5) * M.breakup * 4 * a * (1 - a) * 2); }
      a *= M.opacity; if (a <= 0.002) continue;
      if (M.blend === 'tone') { applyGrade(B, i, M.grade, tmp); lab[0] += (tmp[0] - lab[0]) * a; lab[1] += (tmp[1] - lab[1]) * a; lab[2] += (tmp[2] - lab[2]) * a; continue; }
      lab2lin(lab[0], lab[1], lab[2], lin);
      const fn = BLEND[M.blend]; if (!fn) throw new Error(id + ': unknown blend ' + M.blend);
      for (let c = 0; c < 3; c++) { const bs = l2s(clamp(lin[c])); lin[c] = s2l(clamp(lerp(bs, fn(bs, M.col[c]), a))); }
      lin2lab(lin[0], lin[1], lin[2], lab);
    }
    // iiriksen väri (vaaleus säilyy)
    if (eye && B.iris[i] > 0) { const k = B.iris[i]; lab[1] += (eye[1] * 1.0 - lab[1]) * k; lab[2] += (eye[2] - lab[2]) * k; }
    lab2lin(lab[0], lab[1], lab[2], lin);
    // kasvonpiirteet alkuperäisinä
    let k = Lk.keepFace === false ? 0 : B.keep[i] * (1 - (eye ? B.iris[i] : 0));
    let r = l2s(clamp(lin[0])), g = l2s(clamp(lin[1])), b = l2s(clamp(lin[2]));
    if (k > 0) { r = lerp(r, rgba[i * 4] / 255, k); g = lerp(g, rgba[i * 4 + 1] / 255, k); b = lerp(b, rgba[i * 4 + 2] / 255, k); }
    if (DEBUG === 'tone') { r = g = b = B.T[i]; }
    else if (DEBUG === 'keep') { r = B.keep[i]; g = B.iris[i]; b = l2s(B.L[i] ** 3) * 0.5; }
    else if (DEBUG === 'region') { const pal = [[1, 0, 0], [1, 0.6, 0], [1, 1, 0], [0, 1, 0], [0, 0.6, 1], [0, 1, 1], [1, 1, 1], [0.6, 0, 1], [1, 0, 1], [0.4, 0.4, 0.4]];
      r = g = b = 0; for (let q = 0; q < 10; q++) { r += pal[q][0] * rw[q]; g += pal[q][1] * rw[q]; b += pal[q][2] * rw[q]; } }
    else if (DEBUG === 'detail') { r = g = b = clamp(0.5 + Math.log(B.D[i]) * 0.8); }
    out[i * 4] = Math.round(255 * clamp(r)); out[i * 4 + 1] = Math.round(255 * clamp(g)); out[i * 4 + 2] = Math.round(255 * clamp(b)); out[i * 4 + 3] = 255;
  }
  const file = path.join(OUT, id + (DEBUG ? '.' + DEBUG : '') + '.webp');
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: QUALITY }).toFile(file);
  console.log('look', id, '<-', Lk.base, W + 'x' + H, (fs.statSync(file).size / 1024).toFixed(0) + ' kB');
}

for (const [id, L] of Object.entries(LOOKS)) {
  if (only.length && !only.includes(id)) continue;
  await makeLook(id, L);
}
