// Voice manifest: every spoken line in the game. Characters speak JAPANESE; English subtitles are shown.
// Audio file: public/audio/voice/<file>  (e.g. weed_intro_vow.mp3). Missing files are fine: the subtitle
// is then shown for a duration estimated from the text length (the game is fully playable without voices).
// After adding/removing voice files run `npm run voices` (also runs automatically before `npm run build`)
// to refresh public/audio/voice/manifest.json.  Docs table: docs/VOICE_LINES.md (npm run voices regenerates it).
//
// Fields: who, ja, en, emotion, direction (acting notes for TTS / actors), intensity 1-5,
//         pre / post = silence in seconds before / after the line (silences carry the emotion).

export const VOICES = {
  weed:     { name: 'Weed', jp: 'ウィード', profile: 'Young male (≈14). Clear, bright mid-high voice; earnest and determined, cracks under strong emotion. Speaks politely ("boku"). Not cartoonish.' },
  smith:    { name: 'Smith', jp: 'スミス', profile: 'Elderly male veteran (≈60s feel). Low, gravelly, warm and fatherly. Slow, unhurried; uses old-fashioned "washi". Breathy when strained.' },
  jerome:   { name: 'Jerome', jp: 'ジェローム', profile: 'Adult male (≈35). Deep baritone, calm, clipped military delivery; controlled emotion with guilt underneath. Rarely raises his voice — when he does, it hits hard.' },
  ken:      { name: 'Ken', jp: 'ケン', profile: 'Young adult male (≈20). Deep, rough, brash; a big dog\'s easy confidence. Teasing, but loyal.' },
  kagetora: { name: 'Kagetora', jp: '影虎', profile: 'Young adult male (≈19). Sharp, proud, slightly higher than Ken; quick-tempered rhythm, clipped endings.' },
  robert:   { name: 'Robert', jp: 'ロバート', profile: 'Adult male (≈30). Quiet, steady, soft-spoken soldier. Few words, each one meant.' },
  rocker:   { name: 'Rocker', jp: 'ロッカー', profile: 'Adult male (≈28). Wry, raspy, fearless; hides fear behind a smirk.' },
  heuler:   { name: 'Heuler', jp: 'ヒューラー', profile: 'Adult male (≈30). Warm, gentle tenor-baritone; the heart of the squad, protective of Robert.' },
  kaibutsu: { name: 'Kaibutsu', jp: '怪物', profile: 'Non-verbal. Huge, guttural lion-like roars and growls. In its final moment a small, broken whimper — the dog it once was.' },
  narrator: { name: '', jp: 'ナレーション', profile: 'Mature narrator (any gender). Calm, low, measured, like an anime episode narrator; slight reverb.' },
};

const L = (who, id, ja, en, emotion, direction, intensity = 3, pre = 0, post = 0.4) =>
  [id, { id, who, ja, en, emotion, direction, intensity, pre, post, file: `${who}_${id}.mp3` }];

export const LINES = Object.fromEntries([
  // ------------------------------------------------------------ PRE-BATTLE (intro)
  L('narrator', 'intro_1', '双子峠。奥羽の砦、牙城は…怪物に奪われた。', 'Futago Pass. Gajō, the fortress of Ōu… has fallen to a monster.',
    'ominous calm', 'Slow and low. Small pause after "牙城は…" before the reveal. Let the last word sink.', 2, 0.3, 0.6),
  L('ken', 'intro_smell', 'ここが牙城か…恐怖の匂いしかしねえ。', 'So this is Gajō… all I can smell is fear.',
    'uneasy bravado', 'Sniffing breath first, then low and rough. Trying to sound unbothered.', 2, 0, 0.2),
  L('kagetora', 'intro_tease', '怖気づいたか、ケン？', 'Scared already, Ken?',
    'teasing, sharp', 'Quick, a half-smile in the voice. Rising end.', 2, 0, 0.1),
  L('ken', 'intro_shut', 'うるせえ。', 'Shut it.',
    'gruff', 'Short exhale-laugh, gruff. Almost under his breath.', 1, 0, 0.5),
  L('weed', 'intro_vow', 'ここは父さんの国だ。……僕が、守る。', 'This is my father\'s land. …I will protect it.',
    'quiet determination', 'Starts soft, looking at the fortress. Long pause (breath) after the first sentence; the vow lands firmly, not shouted.', 4, 0.3, 0.6),
  L('smith', 'intro_proud', 'よく言った、坊主。わしらがついておる。', 'Well said, boy. We\'re right beside you.',
    'warm pride', 'Gentle, fatherly smile. Slow. A soft chuckle before "よく言った".', 3, 0.2, 0.5),
  L('jerome', 'intro_arrive', '遅れてすまない。俺はジェローム。…あれを作ったのは、人間だ。', 'Forgive our delay. I am Jerome. …It was humans who made that thing.',
    'grave, controlled', 'Formal, clipped. Pause before the last sentence; the word "人間" carries quiet bitterness.', 3, 0, 0.5),
  L('heuler', 'intro_follow', '隊長の行く所なら、どこへでも。', 'Wherever the Captain goes, we follow.',
    'loyal warmth', 'Warm and steady, a small nod in the voice.', 2, 0, 0.4),
  L('kaibutsu', 'roar_intro', 'グオオオオオ……ッ！！', '[A deafening roar]',
    'monstrous rage', 'Long, guttural lion roar, building then ragged at the end. Big chest resonance.', 5, 0, 0.5),
  L('jerome', 'intro_weak', '奴の左脇腹に、毛のない場所がある。その時が来たら…俺が示す。', 'There\'s a hairless patch on its left flank. When the moment comes… I\'ll show you.',
    'focused, tactical', 'Low and fast, eyes on the enemy. Slight pause before "俺が示す".', 3, 0, 0.3),
  L('weed', 'intro_go', '行くぞ、みんな！', 'Let\'s go, everyone!',
    'rallying courage', 'Full voice, a little breathless with nerves, but bright. Rising.', 4, 0, 0.3),

  // ------------------------------------------------------------ BATTLE barks / special moves
  L('jerome', 'card_reveal', '左の脇腹だ…今だ！', 'Left flank… now!',
    'sharp command', 'Quick read (a breath of analysis), then the command snaps.', 4, 0, 0.1),
  L('ken', 'sync_call', '合わせろ、カゲトラ！', 'Keep up, Kagetora!',
    'fierce, competitive', 'Shouted while running, grin in the voice.', 4, 0, 0),
  L('kagetora', 'sync_reply', '誰に言ってる！', 'Who do you think you\'re talking to!',
    'fierce pride', 'Snapped back instantly, mid-leap. Effort on the last syllable.', 4, 0, 0.1),
  L('weed', 'battoga', '抜刀牙ッ！', 'BATTŌGA!',
    'battle cry', 'Explosive, from the gut; short intake of breath before. Not too long.', 5, 0, 0),
  L('kaibutsu', 'roar_armor', 'ガアアアアッ！！', '[Roars — its hide hardens like stone]',
    'berserk fury', 'Harsher and higher than the first roar, with rasp. Shakes the ground.', 5, 0, 0.2),
  L('smith', 'card_ready', 'わしの出番じゃな。', 'Looks like my turn has come.',
    'calm acceptance', 'Quiet, almost to himself. A small smile. No fear.', 3, 0, 0.2),

  // ------------------------------------------------------------ SMITH'S SACRIFICE
  L('smith', 'sac_cliff', 'ウィード…上の崖が見えるか。…わしに任せろ。', 'Weed… do you see the cliff above? …Leave this to me.',
    'gentle resolve', 'Soft and unhurried, as if comforting a child. Pause after the question; the last line is warm and final.', 4, 0.4, 0.4),
  L('weed', 'sac_wait', 'スミス、待って！', 'Smith, wait!',
    'sudden fear', 'Voice cracks with alarm; reaching out. Breath in before.', 4, 0, 0.2),
  L('smith', 'sac_live', '生きろ、ウィード。生きて…皆を導け！', 'Live, Weed. Live… and lead them!',
    'strained, loving', 'Through gritted teeth while holding the monster; strained breath between phrases, then the last words pushed out with all he has — almost a smile.', 5, 0, 0.3),
  L('weed', 'sac_scream', 'スミスーーーッ！！', 'SMITH!!',
    'anguished scream', 'Raw, breaking scream; voice tears at the end. Followed by silence.', 5, 0, 1.2),
  L('jerome', 'sac_rises', 'まだ立つか…だが深手だ。スミスの命は、無駄じゃない。', 'It still rises… but it\'s badly wounded. Smith\'s life was not given in vain.',
    'grim respect', 'Low, steady, measured. Pause after the first sentence. Respectful weight on "スミスの命".', 3, 0.3, 0.3),
  L('weed', 'sac_nod', '……うん。', '…I know.',
    'holding back tears', 'Almost a whisper; a shaky breath first. Swallowed sob, not crying.', 3, 0.4, 0.5),
  L('kaibutsu', 'roar_rise', 'グルルル…オオオッ！', '[It bursts from the rocks, roaring]',
    'wounded fury', 'Starts as a deep rumble, erupts into a roar. Pain in it.', 5, 0, 0.3),

  // ------------------------------------------------------------ FOUR ARROWS
  L('jerome', 'arrows_order', 'ロバート、ロッカー、ヒューラー。…四本の矢だ。', 'Robert. Rocker. Heuler. …The Four Arrows.',
    'solemn command', 'Each name its own beat, heavy. Long pause. "四本の矢だ" low, like a farewell disguised as an order.', 4, 0.3, 0.5),
  L('robert', 'arrows_ack', '…了解です、隊長。', '…Understood, Captain.',
    'quiet acceptance', 'Soft, steady breath before. No fear, just calm.', 3, 0.2, 0.3),
  L('heuler', 'arrows_together', 'まだ死ぬなよ、ロバート。…みんなで、一緒に行こう。', 'Let\'s not die yet, Robert. …We go together.',
    'tender bravery', 'Warm, half-smiling; the second sentence softer, like a promise between brothers.', 4, 0, 0.4),
  L('robert', 'arrows_fall_robert', '隊長…光栄、でした。', 'Captain… it was an honor.',
    'fading, peaceful', 'Weak, breathy, slow; a faint smile. Trails off on the last syllable.', 4, 0.3, 0.8),
  L('rocker', 'arrows_fall_rocker', 'へっ…先に、行ってるぜ。', 'Heh… I\'ll go on ahead.',
    'wry farewell', 'A weak laugh first; raspy, tired, still cocky. Quiet at the end.', 4, 0.3, 0.8),
  L('heuler', 'arrows_fall_heuler', 'ロバート…一緒、だぞ…', 'Robert… we\'re together…',
    'gentle, dying', 'Barely above a whisper, reaching for his friend. Long exhale after.', 5, 0.3, 1.0),
  L('jerome', 'arrows_fourth', '四本目は…俺だあああッ！', 'And the fourth… is ME!',
    'grief turned to fury', 'Starts low and shaking, explodes into a roar. The only time he truly shouts.', 5, 0, 0.1),
  L('jerome', 'arrows_thanks', '……ありがとう、戦友たち。', '…Thank you, my comrades.',
    'broken, quiet', 'Very quiet, voice catching. Long breath before. Do not cry openly — he holds it in.', 5, 0.8, 1.0),
  L('jerome', 'arrows_now', 'ウィード！奴がよろめいた…今だ！', 'Weed! It\'s staggering… now!',
    'urgent resolve', 'Pulls himself together: strong and fast. A breath between sentences.', 4, 0, 0.2),

  // ------------------------------------------------------------ FINALE
  L('weed', 'finale_cry', 'これで終わりだ…抜刀牙ーーッ！', 'This ends now… BATTŌGA!',
    'ultimate resolve', 'First half low and steady, almost calm; then the battle cry tears out at full power.', 5, 0, 0),
  L('ken', 'fall_hold', 'ウィード！離すな！', 'Weed! Don\'t let go!',
    'desperate', 'Shouted through clenched teeth (biting on), strained.', 5, 0, 0),
  L('kagetora', 'fall_with', '俺たちも行くぞ！', 'We\'re going with you!',
    'reckless loyalty', 'Shouted, fearless, a wild edge.', 5, 0, 0.2),
  L('narrator', 'fall_mist', '滝の霧が、すべてを呑み込んだ。', 'The mist of the falls swallowed everything.',
    'hushed', 'Quiet, slow. Let silence follow.', 2, 0.4, 0.8),

  // ------------------------------------------------------------ POST-BATTLE
  L('ken', 'post_alive_ken', '…生きてるか？', '…You alive?',
    'exhausted relief', 'Panting, hoarse. A tired half-laugh.', 2, 0.4, 0.2),
  L('kagetora', 'post_alive_kage', '当たり前だ。', 'Obviously.',
    'tired pride', 'Breathless, but proud. Small laugh at the end.', 2, 0, 0.4),
  L('kaibutsu', 'whimper', 'クゥ…ン……', '[A faint whimper]',
    'the dog it once was', 'Tiny, fragile, almost a puppy\'s whimper. Fades into breath. Heartbreaking, not scary.', 3, 0.4, 1.2),
  L('weed', 'post_human', '人間が、こいつを怪物にした…こいつが選んだわけじゃない。', 'Humans made it a monster… it never chose this.',
    'sorrowful compassion', 'Soft, sad, looking down at it. Pause in the middle. No anger — grief.', 4, 0.4, 0.6),
  L('jerome', 'post_guilt', '部下は死んだ。…なのに、俺は生きている。', 'My men are dead. …And yet I live.',
    'hollow guilt', 'Flat and quiet, as if each word costs him. Long pause between the sentences.', 5, 0.6, 0.8),
  L('weed', 'post_carry', '皆、最後まであなたを信じてた。…一緒に背負おう、ジェローム。', 'They believed in you to the very end. …Let\'s carry them together, Jerome.',
    'gentle strength', 'Kind, steady, a little older than before. Second sentence offered like a hand.', 4, 0.3, 0.6),
  L('jerome', 'post_follow', '……ウィード。お前に、ついていこう。', '…Weed. I will follow you.',
    'quiet devotion', 'A breath, almost a sigh of release; low, sincere.', 4, 0.6, 0.8),
  L('narrator', 'memorial', 'スミス。ロバート。ロッカー。ヒューラー。その名は、奥羽の風に刻まれた。', 'Smith. Robert. Rocker. Heuler. Their names are carved into the wind of Ōu.',
    'reverent', 'Each name slow and separate, with a beat of silence. Final sentence warm.', 4, 0.6, 1.0),
  L('weed', 'post_father', '父さん…どこにいるの。僕、もっと強くなるよ。', 'Father… where are you? I\'ll become stronger.',
    'hopeful longing', 'Looking at the sunrise; soft, a little shaky, ending with a small brave smile.', 4, 0.5, 0.6),
  L('smith', 'spirit_echo', '…それでいい、坊主。', '…That\'s the way, boy.',
    'peaceful, from beyond', 'Whispered, warm, with reverb/echo. Like wind.', 3, 0.6, 1.2),
]);

/** Arvioi repliikin kesto (s), kun äänitiedostoa ei ole. */
export function estimateDuration(line) {
  const en = line.en.length * 0.058, ja = [...line.ja].length * 0.16;
  return Math.max(1.4, Math.min(7, Math.max(en, ja)));
}
