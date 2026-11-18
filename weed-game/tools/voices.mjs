// Päivittää puheäänten manifestin ja repliikkitaulukon.
//  - public/audio/voice/manifest.json = luettelo olemassa olevista äänitiedostoista (peli lataa vain nämä)
//  - docs/VOICE_LINES.md = kaikki repliikit (japani, englanti, tunne, näyttelijäohje) tuotantoa varten
// Käyttö: npm run voices   (ajetaan myös automaattisesti ennen npm run buildia)
import fs from 'fs';
import path from 'path';
import { LINES, VOICES } from '../src/data/lines.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(ROOT, 'public/audio/voice');
fs.mkdirSync(dir, { recursive: true });
const files = fs.readdirSync(dir).filter(f => /\.(mp3|ogg|m4a|wav)$/i.test(f)).sort();
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(files, null, 0) + '\n');
const have = new Set(files);

const esc = s => String(s).replace(/\|/g, '\\|');
let md = `# Voice lines – Ōu Saga (Weed fan game draft)\n\n`;
md += `All characters speak **Japanese**; the game shows **English subtitles** (Japanese text optional).\n`;
md += `Drop recorded / TTS files into \`public/audio/voice/\` using the exact file names below, then run \`npm run voices\`\n`;
md += `(or just \`npm run build\`) – no code changes needed. Missing files are fine: subtitles are then timed by text length.\n\n`;
md += `Format: mp3 (mono, 44.1 kHz, 64–96 kbps), trimmed tight (the game adds the pre/post silences itself).\n\n`;
md += `Status: **${files.filter(f => Object.values(LINES).some(l => l.file === f)).length} / ${Object.keys(LINES).length}** lines have audio.\n\n`;
md += `## Voice profiles\n\n| Character | Japanese | Voice |\n|---|---|---|\n`;
for (const [k, v] of Object.entries(VOICES)) md += `| ${v.name || 'Narrator'} (\`${k}\`) | ${v.jp} | ${esc(v.profile)} |\n`;
md += `\n## Lines (in story order)\n\n| # | File | Who | Japanese | English subtitle | Emotion | Intensity | Pre/Post (s) | Direction | Audio |\n|---|---|---|---|---|---|---|---|---|---|\n`;
let i = 1;
for (const l of Object.values(LINES)) {
  md += `| ${i++} | \`${l.file}\` | ${VOICES[l.who]?.name || 'Narrator'} | ${esc(l.ja)} | ${esc(l.en)} | ${esc(l.emotion)} | ${l.intensity} | ${l.pre}/${l.post} | ${esc(l.direction)} | ${have.has(l.file) ? '✔' : '–'} |\n`;
}
md += `\n## Tips for ElevenLabs (Japanese TTS)\n\n- Use a multilingual model (e.g. eleven_multilingual_v2 / v3) and one consistent voice per character (see profiles).\n- Put the *direction* into the voice settings: lower stability (≈0.3–0.45) for emotional lines (intensity 4–5), higher (≈0.6) for calm narration.\n- Ellipses (…) and 「、」 produce natural pauses; keep them. Do not add English words.\n- Kaibutsu: use sound effects or a heavily pitched-down voice; keep its final whimper small and fragile.\n`;
fs.writeFileSync(path.join(ROOT, 'docs/VOICE_LINES.md'), md);
console.log(`voices: ${files.length} audio files, ${Object.keys(LINES).length} lines -> docs/VOICE_LINES.md`);
