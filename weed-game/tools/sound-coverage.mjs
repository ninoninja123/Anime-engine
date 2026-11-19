// Sound coverage check (heuristic, line based): lists visible scene events that have no sound call nearby.
//   node tools/sound-coverage.mjs [--all]
// Visible event = a line with fx: impact/dust/ring/burst/flash/arc, shake:, a one-shot animation (Bark, Attack, Death,
// Jump, HitReact, Howl, LieDown, Battoga ...), strike:/reach:, or FX.* / shake( calls in level code.
// Covered = the same line or the 2 lines before/after contain sfx / sfx. / play( / say / bark: / strike: (contact.js
// plays its own whoosh + contact sounds) / fx: 'spirit' or fx: 'speed' (the runner plays spirit / speed itself).
// Also verifies every sfx key used in scene data exists in sfx_map.js (EVENTS / SOUNDS / synth fallbacks).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS, SOUNDS } from '../src/data/sfx_map.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '..', 'src');
const FILES = ['data/scenes_level1.js', 'data/scenes_level2.js', 'data/scenes_prologue.js', 'level1.js', 'level2.js'];
const SYN = new Set(['bite', 'hit', 'whoosh', 'hurt', 'roar', 'rock', 'rumble', 'boom', 'bark', 'spirit', 'howl', 'tell', 'card', 'cutin', 'perfect', 'battoga']);
const VIS = /fx:\s*'(impact|dust|ring|burst|flash|arc)'|shake:|\b(anim|name|after):\s*'(Bark|Attack\w*|Death\w*|Jump\w*|Gallop_Jump|\w*HitReact\w*|Howl|LieDown|Battoga|Zetsu|Fall\w*)'|\bFX\.(impact|dust|flash|ring|burst|slashArc)\(|[^.\w]shake\(|\breach:/;
const SND = /sfx|\bplay\(|\bsay[:(]|\bbark:|\bstrike:|fx:\s*'(spirit|speed)'|whiff|\bFX\.spiritLight|horn\(|vehicleSound|\bhitFx\(|\bboss(Land|Step)\b/;
// reviewed by hand: the sound is further away than the 2-line window (reason in the comment)
const KNOWN = [
  [/move: '(rocker|heuler|north)'.*Gallop_Jump/, 'same par as { sfx: jump }, land after the par'],
  [/FX\.burst\(hp, \{ color: 0xffffff, count: 60/, 'finale strike sfx: [boom, bite] on the strike step'],
  [/const arcs = setInterval\(\(\) => FX\.slashArc/, 'Battoga trail, battoga sfx at the start of the spin'],
  [/fx: 'flash', color: '#ffffff', t: 2\.6/, 'white fade after the splash (splash + underwater 2 steps earlier)'],
  [/FX\.dust\(new THREE\.Vector3\(1\.4 \+ Math\.sin\(i\)/, 'rotor wash, heli loop is playing'],
  [/FX\.dust\(new THREE\.Vector3\(B\.x - dir/, 'charge dust, bossStep from footsteps.js'],
  [/FX\.ring\(cast\.weed\.root\.position\.clone\(\)\.add\(new THREE\.Vector3\(0, 0\.5, 0\)\), 0x9fd0ff, 2\.5/, 'perfect dodge, sfx.perfect 3 lines up'],
  [/const trail = setInterval\(\(\) => FX\.slashArc/, 'Battoga trail in battle, battoga sfx'],
];
const all = process.argv.includes('--all');
let total = 0, missing = 0;
const badKeys = new Set();
for (const f of FILES) {
  const p = path.join(src, f); if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  const out = [];
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(/sfx:\s*'(\w+)'|sfx\.(\w+)\(|sfx:\s*\[([^\]]*)\]/g)) {
      const keys = m[3] ? [...m[3].matchAll(/'(\w+)'/g)].map(x => x[1]) : [m[1] || m[2]];
      for (const k of keys) if (k && !k.endsWith('_') && !(k in EVENTS) && !(k in SOUNDS) && !SYN.has(k) && k !== 'play' && k !== 'at') badKeys.add(`${f}:${i + 1} ${k}`);
    }
    if (!VIS.test(ln) || /^\s*\/\//.test(ln) || /^\s*\{ place:/.test(ln) || /fx: 'flash', color: '#000000'/.test(ln)) return;   // placements = start pose, black flash = fade
    total++;
    const win = lines.slice(Math.max(0, i - 2), i + 3).join('\n');
    const ok = SND.test(win) || KNOWN.some(([rx]) => rx.test(ln));
    if (!ok) missing++;
    if (!ok || all) out.push(`${ok ? '  ok ' : '  -- '}${f}:${i + 1}  ${ln.trim().slice(0, 150)}`);
  });
  if (out.length) console.log(`\n${f}\n` + out.join('\n'));
}
console.log(`\nvisible events ${total}, without a sound nearby ${missing}`);
if (badKeys.size) console.log('UNKNOWN sfx keys:\n  ' + [...badKeys].join('\n  '));
