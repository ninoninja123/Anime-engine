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
  jerome:   { name: 'Jerome', jp: 'ジェロム', profile: 'Adult male (≈35). Deep baritone, calm, clipped military delivery; controlled emotion with guilt underneath. Rarely raises his voice — when he does, it hits hard.' },
  ken:      { name: 'Ken', jp: 'ケン', profile: 'Young adult male (≈20). Deep, rough, brash; a big dog\'s easy confidence. Teasing, but loyal.' },
  kagetora: { name: 'Kagetora', jp: '影虎', profile: 'Young adult male (≈19). Sharp, proud, slightly higher than Ken; quick-tempered rhythm, clipped endings.' },
  robert:   { name: 'Robert', jp: 'ロバート', profile: 'Adult male (≈30). Quiet, steady, soft-spoken soldier. Few words, each one meant.' },
  rocker:   { name: 'Rocker', jp: 'ロッカ', profile: 'Adult male (≈28). Wry, raspy, fearless; hides fear behind a smirk.' },
  heuler:   { name: 'Heuler', jp: 'ホイラー', profile: 'Adult male (≈30). Warm, gentle tenor-baritone; the heart of the squad, protective of Robert.' },
  kaibutsu: { name: 'Kaibutsu', jp: '怪物', profile: 'Huge, guttural lion-like roars and growls; speaks only a few words (canon: P4 talks) in a deep, rasping, distorted voice. Its final whimper (own interpretation) is small and broken — the dog it once was.' },
  narrator: { name: '', jp: 'ナレーション', profile: 'Mature narrator (any gender). Calm, low, measured, like an anime episode narrator; slight reverb.' },
};

const L = (who, id, ja, en, emotion, direction, intensity = 3, pre = 0, post = 0.4) =>
  [id, { id, who, ja, en, emotion, direction, intensity, pre, post, file: `${who}_${id}.mp3` }];

export const LINES = Object.fromEntries([
  // ------------------------------------------------------------ PROLOGUE "The story so far" (src/data/scenes_prologue.js)
  // One calm narrator carries the whole prologue, like the opening of an anime film. Legend → war → peace → crisis → hope.
  L('narrator', 'story_01', '奥羽の山々には、伝説が眠っている。', 'In the mountains of Ōu, a legend lies sleeping.',
    'hushed wonder', 'Very slow and low, almost a whisper at the start. Like opening an old book. Let "伝説" breathe.', 2, 0.8, 0.8),
  L('narrator', 'story_02', 'かつて、熊犬の血を引く秋田犬がいた。名は…銀。', 'Long ago lived an Akita of bear-hunting blood. His name… was Gin.',
    'warm nostalgia', 'Gentle storytelling. Pause before the name; say "銀" softly, with affection and pride.', 3, 0.2, 0.5),
  L('narrator', 'story_03', '猟師・五兵衛と少年・大輔に育てられ、銀は熊犬となった。', 'Raised by the hunter Gohee and the boy Daisuke, he became a bear dog.',
    'tender, steady', 'Even and warm, slightly brighter on "勇敢な熊犬".', 2, 0, 0.6),
  L('narrator', 'story_04', '双子峠の牙城に君臨する、人喰い熊…赤カブト。', 'At Gajō on Futago Pass reigned a giant man-eater… Akakabuto.',
    'dread', 'Darker, lower, slower. A long held breath before the name; "赤カブト" heavy and cold.', 4, 0.3, 0.7),
  L('narrator', 'story_05', '銀は奥羽じゅうの勇敢な犬を集め、軍団を築いた。', 'Gin gathered the bravest dogs of all Ōu into one army.',
    'rising, heroic', 'Builds gradually; stronger and fuller toward "軍団". Not shouted.', 4, 0.2, 0.4),
  L('narrator', 'story_06', '多くの仲間が倒れた。それでも…ついに赤カブトは倒された。', 'Many comrades fell. Yet at last… Akakabuto was brought down.',
    'grief into triumph', 'First sentence quiet and sad. Then gathering strength; "ついに" after a pause, the end firm and moved.', 5, 0.2, 0.6),
  L('narrator', 'story_07', '銀は奥羽の総大将となり、山は犬たちの楽園となった。', 'Gin became leader of Ōu, and the mountains became a paradise for dogs.',
    'serene warmth', 'Relieved and warm, a faint smile in the voice. Slow.', 3, 0.3, 0.6),
  L('narrator', 'story_08', 'それから、長い年月が流れた。', 'Many years have passed since then.',
    'wistful', 'Soft, slow, a little sad. Like turning a page.', 2, 0.5, 0.9),
  L('narrator', 'story_09', 'だが今、楽園は崩れ去った。人間の実験が生んだ怪物が、牙城を奪ったのだ。', 'But now that paradise has crumbled. A monster born of human experiments has seized Gajō.',
    'ominous', 'Tone turns cold. Short pause after the first sentence; "怪物" with quiet horror.', 4, 0.3, 0.6),
  L('narrator', 'story_10', '犬が人を襲ったと信じ、人間たちは犬狩りを始めた。', 'Believing dogs had attacked people, the humans began to hunt them.',
    'sorrowful tension', 'Low and tense, bitterness held back. Slightly faster, like being chased.', 4, 0.1, 0.5),
  L('narrator', 'story_11', 'そして総大将・銀は…今、奥羽にいない。', 'And Gin, their leader… is nowhere in Ōu.',
    'heavy absence', 'Slow; a long pause before the last phrase. Let the silence after it hang.', 4, 0.3, 0.9),
  L('narrator', 'story_12', 'その時、一匹の小さな犬が奥羽を目指していた。銀の息子…ウィード。', 'Just then, one small dog was making his way to Ōu. The son of Gin… Weed.',
    'hope rising', 'Gentle, quietly building. Pause before "銀の息子"; the name "ウィード" warm and hopeful, like sunrise.', 4, 0.5, 0.6),
  L('weed', 'story_vow', '父さんの国へ…僕は行く。', 'To my father\'s land… I\'m going.',
    'quiet resolve', 'Soft, young, to himself, looking at the far mountains. A breath in the middle; the end calm and certain.', 4, 0.3, 0.8),

  // ------------------------------------------------------------ PRE-BATTLE (intro)
  L('narrator', 'intro_1', '二子峠。奥羽の砦、牙城は…怪物に奪われた。', 'Futago Pass. Gajō, the fortress of Ōu… has fallen to a monster.',
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
  L('jerome', 'intro_arrive', '俺はジェロム。…あれを作ったのは、人間だ。', 'I am Jerome. …It was humans who made that thing.',
    'grave, controlled', 'Calling down from the clifftop. Formal, clipped. Pause before the last sentence; the word "人間" carries quiet bitterness.', 3, 0, 0.5),
  L('heuler', 'intro_follow', '隊長の行く所なら、どこへでも。', 'Wherever the Captain goes, we follow.',
    'loyal warmth', 'Warm and steady, a small nod in the voice.', 2, 0, 0.4),
  L('kaibutsu', 'roar_intro', 'グオオオオオ……ッ！！', '[A deafening roar]',
    'monstrous rage', 'Long, guttural lion roar, building then ragged at the end. Big chest resonance.', 5, 0, 0.5),
  L('jerome', 'intro_weak', '奴の左胸に、毛のない柔らかい場所がある。その時が来たら…俺が示す。', 'There\'s a patch of bare, soft skin on its left chest. When the moment comes… I\'ll show you.',
    'focused, tactical', 'Low and fast, eyes on the enemy. Slight pause before "俺が示す".', 3, 0, 0.3),
  L('weed', 'intro_go', '行くぞ、みんな！', 'Let\'s go, everyone!',
    'rallying courage', 'Full voice, a little breathless with nerves, but bright. Rising.', 4, 0, 0.3),

  // ------------------------------------------------------------ BATTLE barks / special moves
  L('jerome', 'card_reveal', '左胸だ…今だ！', 'Left chest… now!',
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
  L('narrator', 'north_fell', '牙城の中…ノースは奇襲に倒れた。', 'Inside Gajō… North fell to the ambush.',
    'hushed grief', 'Quiet, matter-of-fact, a beat of silence after.', 3, 0.2, 0.6),
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
  L('kaibutsu', 'speak', 'なぜ人間に尻尾を振る…先に裏切ったのは、人間だ！', 'Why do you wag your tails for humans… They betrayed us first!',
    'bitter, wounded rage', 'Deep, rasping, slow – words are hard for it. Grief under the anger; the last phrase almost a howl.', 5, 0.2, 0.5),
  L('jerome', 'p4_answer', '…知っている、P4。俺も、あそこにいた。', '…I know, P4. I was there too.',
    'quiet guilt', 'Low and soft, almost tender – he was its only friend in the lab. Long pause before speaking.', 4, 0.5, 0.6),

  // ------------------------------------------------------------ FOUR ARROWS
  L('jerome', 'arrows_order', 'ロバート、ロッカ、ホイラー。…四本の矢だ。', 'Robert. Rocker. Heuler. …The Four Arrows.',
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
  L('narrator', 'fall_wind', '谷底から吹き上げる風が、ウィードを宙へ押し上げた。', 'A wind rising from the gorge tore Weed free.',
    'awe', 'Measured, building slightly; let the wind sound carry it.', 3, 0.2, 0.4),
  L('narrator', 'fall_mist', '滝の霧が、すべてを呑み込んだ。', 'The mist of the falls swallowed everything.',
    'hushed', 'Quiet, slow. Let silence follow.', 2, 0.4, 0.8),

  // ------------------------------------------------------------ POST-BATTLE
  L('ken', 'post_alive_ken', 'しっかりしろ、カゲトラ。…岸までもう少しだ。', 'Hang on, Kagetora. …Almost to the shore.',
    'exhausted care', 'Panting, carrying weight; gruff but gentle.', 3, 0.4, 0.2),
  L('kagetora', 'post_alive_kage', '…うるせえ。落とすなよ。', '…Shut up. Just don\'t drop me.',
    'hurt pride', 'Weak, breathless, a pained half-laugh. He can barely move.', 3, 0, 0.4),
  L('kaibutsu', 'whimper', 'クゥ…ン……', '[A faint whimper]',
    'the dog it once was', 'Tiny, fragile, almost a puppy\'s whimper. Fades into breath. Heartbreaking, not scary.', 3, 0.4, 1.2),
  L('weed', 'post_human', '人間が、こいつを怪物にした…こいつが選んだわけじゃない。', 'Humans made it a monster… it never chose this.',
    'sorrowful compassion', 'Soft, sad, looking down at it. Pause in the middle. No anger — grief.', 4, 0.4, 0.6),
  L('jerome', 'post_guilt', '放してくれ、ウィード。…部下のところへ、行かせてくれ。', 'Let me go, Weed. …Let me go to my men.',
    'hollow despair', 'Clinging to the rock in the current, exhausted. Flat and quiet, each word costs him.', 5, 0.6, 0.8),
  L('weed', 'post_carry', 'だめだ！死ぬのはずるい。…生き残った者には、生きる意味があるんだ。', 'No! Dying is unfair. …Those who survive have a reason to live.',
    'fierce compassion', 'Through clenched teeth (he is holding Jerome\'s leg); then softer, certain.', 5, 0.2, 0.6),
  L('jerome', 'post_follow', '……ウィード。', '…Weed.',
    'silent tears', 'Barely a whisper; a breath that breaks. He is crying without sound.', 5, 0.8, 1.0),
  L('jerome', 'post_stay', '俺は戻らない。ここ、奥羽に残る。…もう誰の道具でもない。', 'I\'m not going back. I\'m staying here, in Ōu. …I\'m no one\'s tool anymore.',
    'calm defiance', 'Barked toward the humans at the helicopter: firm, steady, free.', 4, 0.3, 0.6),
  L('narrator', 'memorial', 'スミス。ノース。ロバート。ロッカ。ホイラー。その名は、奥羽の風に刻まれた。', 'Smith. North. Robert. Rocker. Heuler. Their names are carved into the wind of Ōu.',
    'reverent', 'Each name slow and separate, with a beat of silence. Final sentence warm.', 4, 0.6, 1.0),
  L('weed', 'post_father', '父さん…どこにいるの。僕、もっと強くなるよ。', 'Father… where are you? I\'ll become stronger.',
    'hopeful longing', 'Looking at the sunrise; soft, a little shaky, ending with a small brave smile.', 4, 0.5, 0.6),
  L('smith', 'spirit_echo', '…それでいい、坊主。', '…That\'s the way, boy.',
    'peaceful, from beyond', 'Whispered, warm, with reverb/echo. Like wind.', 3, 0.6, 1.2),
]);

// Prologue narration runs over the music the whole time: duck gently so the score keeps carrying the emotion.
for (const l of Object.values(LINES)) if (l.id.startsWith('story_')) l.duck = 0.62;

/** Arvioi repliikin kesto (s), kun äänitiedostoa ei ole. */
export function estimateDuration(line) {
  const en = line.en.length * 0.058, ja = [...line.ja].length * 0.16;
  return Math.max(1.4, Math.min(7, Math.max(en, ja)));
}
