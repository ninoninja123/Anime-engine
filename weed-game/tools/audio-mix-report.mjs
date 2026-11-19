// Effective in-game loudness per event (after the code-side mix), from the audit numbers (src/data/audio_levels.js)
// and the mixing policy (src/data/sfx_map.js MIX / SOUNDS / EVENTS). Run after tools/audio-audit.py:
//   node tools/audio-mix-report.mjs            -> prints a table and rewrites the "Effective levels" section of
//                                                docs/weed-game/audio-audit.md
// Model: level(file) = M max of the file + 20log10(variant trim * sound vol * layer vol * category gain * sfx bus).
// Event level = power sum of its layers (layers with p < 0.5 are skipped; delays ignored = worst case stack).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIO_LEVELS } from '../src/data/audio_levels.js';
import { SOUNDS, EVENTS, MIX, variantTrim, AMBIENCE, AMB_FILES } from '../src/data/sfx_map.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const db = g => 20 * Math.log10(Math.max(1e-6, g));
const psum = ls => 10 * Math.log10(ls.reduce((a, l) => a + Math.pow(10, l / 10), 0));

function soundLevel(id) {
  const s = SOUNDS[id]; if (!s) return null;
  const ls = s.files.map(f => AUDIO_LEVELS[f] ? AUDIO_LEVELS[f][0] + db(variantTrim(f, s)) : null).filter(x => x !== null);
  if (!ls.length) return null;
  const mean = psum(ls) - 10 * Math.log10(ls.length);
  return mean + db((s.vol ?? 1) * (MIX.cat[s.cat] ?? 1) * (s.cat === 'ui' ? 1 : MIX.bus.sfx));
}
const rows = [];
for (const [name, ev] of Object.entries(EVENTS)) {
  const ls = [];
  for (const L of ev.layers) { if (L.p !== undefined && L.p < 0.5) continue; const l = soundLevel(L.s); if (l !== null) ls.push(l + db(L.vol ?? 1)); }
  if (!ls.length) continue;
  rows.push({ name, cat: ev.cat || '', lvl: psum(ls), duck: ev.duck ? ev.duck[0] : '' });
}
rows.sort((a, b) => b.lvl - a.lvl);
const out = [];
out.push('<!-- mix-report:start -->');
out.push('## Effective levels in game (after code-side mix)\n');
out.push('`node weed-game/tools/audio-mix-report.mjs` – M max LUFS of each event with variant trim, sound `vol`, layer `vol`, '
  + 'category gain and sfx bus applied (user sliders at 100 %, no duck). Music plays at ' + MIX.target.music + ' LUFS, speech at '
  + MIX.target.voice + ' LUFS; the sfx policy is -16..-12 for impacts, -26..-18 for foley/UI.\n');
out.push('| Event | Cat | Level LUFS | Music duck |');
out.push('|---|---|---|---|');
for (const r of rows) out.push(`| \`${r.name}\` | ${r.cat} | ${r.lvl.toFixed(1)} | ${r.duck} |`);
out.push('');
out.push('### Ambience presets\n');
out.push('| Preset | Level LUFS (integrated, power sum of layers) |');
out.push('|---|---|');
for (const [k, P] of Object.entries(AMBIENCE)) {
  const ls = Object.entries(P).filter(([l]) => AMB_FILES[l]).map(([l, g]) => (AUDIO_LEVELS[AMB_FILES[l]]?.[0] ?? -30) + db(g * (MIX.ambTrim[l] ?? 1) * MIX.ambBus));
  out.push(`| ${k} | ${psum(ls).toFixed(1)} |`);
}
out.push('<!-- mix-report:end -->');
const md = path.join(here, '..', '..', 'docs', 'weed-game', 'audio-audit.md');
let txt = fs.readFileSync(md, 'utf8');
const block = out.join('\n');
txt = /<!-- mix-report:start -->[\s\S]*<!-- mix-report:end -->/.test(txt) ? txt.replace(/<!-- mix-report:start -->[\s\S]*<!-- mix-report:end -->/, block) : txt.replace(/\n## music \(/, '\n' + block + '\n\n## music (');
fs.writeFileSync(md, txt);
console.log(block);
