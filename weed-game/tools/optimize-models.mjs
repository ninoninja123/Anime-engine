// Optimoi käyttäjän Tripo-mallit peliin: poistaa normal/metallicRoughness-tekstuurit (toon-varjostus
// ei käytä niitä), pienentää värikartan 1024 px WebP:ksi, yksinkertaistaa geometrian ja pakkaa meshoptilla.
// Lähteet: assets/models-src/*.glb  ->  public/models/*.glb
// Käyttö: node tools/optimize-models.mjs [nimi ...]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, quantize, meshopt as meshoptFn } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'assets/models-src'), OUT = path.join(ROOT, 'public/models');
// tavoitekolmiomäärä (suhde) per malli; dog_parts pidetään tarkkana (osat pieniä)
const RATIO = { dog_parts: 0.6, kaibutsu: 0.55, default: 0.45 };
const TEX = { kaibutsu: 1024, weed: 1024, default: 768 };

await MeshoptSimplifier.ready; await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.glb'))) {
  const name = f.replace('.glb', '');
  if (name === 'dog_base') continue;               // vanha Shiba: ei enää käytössä
  if (only.length && !only.includes(name)) continue;
  const doc = await io.read(path.join(SRC, f));
  for (const m of doc.getRoot().listMaterials()) {
    m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null);
    m.setMetallicFactor(0); m.setRoughnessFactor(1);
    for (const e of m.listExtensions()) e.dispose();
  }
  for (const e of doc.getRoot().listExtensionsUsed()) if (/volume|ngon/i.test(e.extensionName)) e.dispose();
  const ratio = RATIO[name] ?? RATIO.default;
  const size = TEX[name] ?? TEX.default;
  await doc.transform(
    prune(), dedup(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.002, lockBorder: name === 'dog_parts' }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [size, size], quality: 82 }),
    prune(),
    meshoptFn({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  const out = path.join(OUT, f);
  await io.write(out, doc);
  let tris = 0;
  for (const me of doc.getRoot().listMeshes()) for (const p of me.listPrimitives()) tris += (p.getIndices()?.getCount() ?? 0) / 3;
  console.log(name, (fs.statSync(path.join(SRC, f)).size / 1024 | 0) + 'k ->', (fs.statSync(out).size / 1024 | 0) + 'k', 'tris', tris | 0);
}
