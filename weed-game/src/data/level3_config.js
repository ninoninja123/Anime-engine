// LEVEL 3 "The Alps Trap – John's Last Stand" (anime ep. 6–10): actors, placeholder characters and Hold-the-Line values.
// Research: docs/weed-game/level3-research.md · design: docs/weed-game/level3-design.md.
// Side characters are PLACEHOLDER dogs from existing models/looks (characters.js LEVEL3_MODELS, one line each);
// no new looks are made for series characters. PLACEHOLDER: user model pending.
import { CHARACTERS, MODELS, LEVEL3_MODELS } from '../characters.js';

const COLLAR = { type: 'collar', color: '#8a1d17' };          // Hōgen's army (same red collar as LOOK_ARMY enemies)
const side = (id, name, role, x = {}) => {
  const m = LEVEL3_MODELS[id];
  const c = { name, kind: 'rigged', model: m.model, height: m.height, role, placeholder: true, gallery: false, gait: 'trot', speed: 1, wag: 0.3, outline: 0.009, ...x };
  if (m.look) c.look = m.look;
  if (m.tint) c.tint = m.tint;
  return c;
};
export const LEVEL3_CHARS = {
  reika: side('reika', 'Reika', 'An Akita, daughter of Gin\'s old comrade. She shelters Gin in the blizzard.', { gait: 'light', wag: 0.4 }),
  hiro: side('hiro', 'Hiro', 'A huge lone wanderer from Okayama, called "Tamatori".', { gait: 'heavy', speed: 0.95, wag: 0.2 }),
  lefty: side('lefty', 'Lefty', 'An Ōu dog who slipped into Hōgen\'s army with Hook.'),
  tommy: side('tommy', 'Tommy', 'An Ōu dog who slipped into Hōgen\'s army with Hook.'),
  rossi: side('rossi', 'Rossi', 'An Ōu dog who slipped into Hōgen\'s army with Hook.'),
  matsu: side('matsu', 'Matsu', 'Leader of Hōgen\'s pursuers.', { gait: 'heavy', wag: 0.05, extras: [COLLAR] }),
  missile: side('missile', 'Missile', 'One of the borzoi brothers serving Hōgen.', { gait: 'light', speed: 1.2, wag: 0.05, extras: [COLLAR] }),
};
for (const [id, c] of Object.entries(LEVEL3_CHARS)) if (!CHARACTERS[id] && MODELS[c.model]) CHARACTERS[id] = c;

// Role -> character id. Scene scripts and the fight refer to roles ('john', 'hogen', 's1'..'s8' = soldiers).
export const ACTORS = {
  john: 'john', gin: 'gin', akame: 'akame', hogen: 'hogen', weed: 'weed', gb: 'gb', jerome: 'jerome', hook: 'hook',
  reika: 'reika', hiro: 'hiro', lefty: 'lefty', tommy: 'tommy', rossi: 'rossi', matsu: 'matsu', missile: 'missile',
};
// soldier pool (recycled): Hōgen's army, generic looks (LOOK_ARMY)
export const SOLDIER_IDS = ['army_soldier_c', 'army_soldier_e', 'army_soldier_g', 'army_soldier_h', 'army_soldier_f', 'army_soldier_a', 'army_soldier_d', 'army_soldier_b'];
SOLDIER_IDS.forEach((id, i) => { ACTORS['s' + (i + 1)] = id; });

// ---------------------------------------------------------------- Hold the Line
// John: old and wounded – slow but strong, no escape behind the line.
export const JOHN = {
  biteReach: 2.3, biteCool: 0.5, biteDmg: 1, counterDmg: 2,
  dodge: 0.95, dodgeT: 0.24, iframes: 0.36,
  roarCool: 3, roarStun: 0.7,
  fangDmg: 3, fangRange: 4.2,
  minX: -2.8, maxX: 2.2,             // the path behind him is what he protects; he cannot leave it
};
// soldier types: hp, approach speed, telegraph (s), damage (hearts)
export const FOES = {
  soldier: { hp: 2, speed: 1.6, tell: 0.7, dmg: 1, reach: 1.9 },
  brute:   { hp: 4, speed: 1.05, tell: 1.0, dmg: 2, reach: 2.1, ids: ['army_soldier_a', 'army_soldier_b', 'army_soldier_d'] },
  runner:  { hp: 1, speed: 3.6, tell: 0, dmg: 1, ids: ['army_soldier_f', 'army_soldier_g', 'army_soldier_e'] },
};
// sequence letters: s = soldier, b = brute, r = runner
export const WAVES = {
  cover: { label: 'Cover Akame!', hearts: 5, maxActive: 2, seq: 'ssrsss', progress: 'AKAME', allies: [], mood: 'storm', amb: 'gorge',
    hint: 'Tap = bite &nbsp;•&nbsp; Swipe ←/→ = dodge &nbsp;•&nbsp; Swipe ↑ = roar &nbsp;•&nbsp; Stop them reaching Akame!' },
  stand: [
    { label: 'Wave 1', hearts: 6, maxActive: 2, seq: 'sssrssbsss', allies: ['lefty', 'tommy', 'rossi'], mood: 'night', after: 'leftyFall',
      hint: 'Hold the path! Hiro and Reika need time. &nbsp;Tap = bite • Swipe = dodge • Cards = comrades' },
    { label: 'Wave 2', hearts: 6, maxActive: 3, seq: 'ssbsrsssbsrs', allies: ['tommy', 'rossi'], mood: 'grief', after: 'tommyFall',
      hint: 'Bite while they flash red <b>!</b> = counter (double damage, Spirit)' },
    { label: 'Wave 3', hearts: 6, maxActive: 3, seq: 'sbsrssbssrsbs', allies: ['rossi'], mood: 'grief', after: 'rossiFall',
      hint: 'Spirit full? Draw a circle ⟳ or tap the ring = <b>Ōu Fang</b>' },
    { label: 'Wave 4', hearts: 6, maxActive: 3, seq: 'ssbrssbsrsbssrs', allies: [], mood: 'dawn', matsu: true,
      hint: 'Alone now. Hold on, John…' },
  ],
};
export const STAND_TOTAL = WAVES.stand.reduce((a, w) => a + w.seq.length, 0);   // 50
export const ALLY_CARDS = {
  lefty: { name: 'Lefty', desc: 'Tackle', color: '#2a2320', color2: '#b98a52', cooldown: 11 },
  tommy: { name: 'Tommy', desc: 'Tackle', color: '#3a2216', color2: '#c48a5a', cooldown: 11 },
  rossi: { name: 'Rossi', desc: 'Tackle', color: '#1c1c1e', color2: '#8e8a84', cooldown: 11 },
};
