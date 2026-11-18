# Voice lines – Ōu Saga (Weed fan game draft)

All characters speak **Japanese**; the game shows **English subtitles** (Japanese text optional).
Drop recorded / TTS files into `public/audio/voice/` using the exact file names below, then run `npm run voices`
(or just `npm run build`) – no code changes needed. Missing files are fine: subtitles are then timed by text length.

Format: mp3 (mono, 44.1 kHz, 64–96 kbps), trimmed tight (the game adds the pre/post silences itself).

Status: **0 / 47** lines have audio.

## Voice profiles

| Character | Japanese | Voice |
|---|---|---|
| Weed (`weed`) | ウィード | Young male (≈14). Clear, bright mid-high voice; earnest and determined, cracks under strong emotion. Speaks politely ("boku"). Not cartoonish. |
| Smith (`smith`) | スミス | Elderly male veteran (≈60s feel). Low, gravelly, warm and fatherly. Slow, unhurried; uses old-fashioned "washi". Breathy when strained. |
| Jerome (`jerome`) | ジェローム | Adult male (≈35). Deep baritone, calm, clipped military delivery; controlled emotion with guilt underneath. Rarely raises his voice — when he does, it hits hard. |
| Ken (`ken`) | ケン | Young adult male (≈20). Deep, rough, brash; a big dog's easy confidence. Teasing, but loyal. |
| Kagetora (`kagetora`) | 影虎 | Young adult male (≈19). Sharp, proud, slightly higher than Ken; quick-tempered rhythm, clipped endings. |
| Robert (`robert`) | ロバート | Adult male (≈30). Quiet, steady, soft-spoken soldier. Few words, each one meant. |
| Rocker (`rocker`) | ロッカー | Adult male (≈28). Wry, raspy, fearless; hides fear behind a smirk. |
| Heuler (`heuler`) | ヒューラー | Adult male (≈30). Warm, gentle tenor-baritone; the heart of the squad, protective of Robert. |
| Kaibutsu (`kaibutsu`) | 怪物 | Non-verbal. Huge, guttural lion-like roars and growls. In its final moment a small, broken whimper — the dog it once was. |
| Narrator (`narrator`) | ナレーション | Mature narrator (any gender). Calm, low, measured, like an anime episode narrator; slight reverb. |

## Lines (in story order)

| # | File | Who | Japanese | English subtitle | Emotion | Intensity | Pre/Post (s) | Direction | Audio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `narrator_intro_1.mp3` | Narrator | 双子峠。奥羽の砦、牙城は…怪物に奪われた。 | Futago Pass. Gajō, the fortress of Ōu… has fallen to a monster. | ominous calm | 2 | 0.3/0.6 | Slow and low. Small pause after "牙城は…" before the reveal. Let the last word sink. | – |
| 2 | `ken_intro_smell.mp3` | Ken | ここが牙城か…恐怖の匂いしかしねえ。 | So this is Gajō… all I can smell is fear. | uneasy bravado | 2 | 0/0.2 | Sniffing breath first, then low and rough. Trying to sound unbothered. | – |
| 3 | `kagetora_intro_tease.mp3` | Kagetora | 怖気づいたか、ケン？ | Scared already, Ken? | teasing, sharp | 2 | 0/0.1 | Quick, a half-smile in the voice. Rising end. | – |
| 4 | `ken_intro_shut.mp3` | Ken | うるせえ。 | Shut it. | gruff | 1 | 0/0.5 | Short exhale-laugh, gruff. Almost under his breath. | – |
| 5 | `weed_intro_vow.mp3` | Weed | ここは父さんの国だ。……僕が、守る。 | This is my father's land. …I will protect it. | quiet determination | 4 | 0.3/0.6 | Starts soft, looking at the fortress. Long pause (breath) after the first sentence; the vow lands firmly, not shouted. | – |
| 6 | `smith_intro_proud.mp3` | Smith | よく言った、坊主。わしらがついておる。 | Well said, boy. We're right beside you. | warm pride | 3 | 0.2/0.5 | Gentle, fatherly smile. Slow. A soft chuckle before "よく言った". | – |
| 7 | `jerome_intro_arrive.mp3` | Jerome | 遅れてすまない。俺はジェローム。…あれを作ったのは、人間だ。 | Forgive our delay. I am Jerome. …It was humans who made that thing. | grave, controlled | 3 | 0/0.5 | Formal, clipped. Pause before the last sentence; the word "人間" carries quiet bitterness. | – |
| 8 | `heuler_intro_follow.mp3` | Heuler | 隊長の行く所なら、どこへでも。 | Wherever the Captain goes, we follow. | loyal warmth | 2 | 0/0.4 | Warm and steady, a small nod in the voice. | – |
| 9 | `kaibutsu_roar_intro.mp3` | Kaibutsu | グオオオオオ……ッ！！ | [A deafening roar] | monstrous rage | 5 | 0/0.5 | Long, guttural lion roar, building then ragged at the end. Big chest resonance. | – |
| 10 | `jerome_intro_weak.mp3` | Jerome | 奴の左脇腹に、毛のない場所がある。その時が来たら…俺が示す。 | There's a hairless patch on its left flank. When the moment comes… I'll show you. | focused, tactical | 3 | 0/0.3 | Low and fast, eyes on the enemy. Slight pause before "俺が示す". | – |
| 11 | `weed_intro_go.mp3` | Weed | 行くぞ、みんな！ | Let's go, everyone! | rallying courage | 4 | 0/0.3 | Full voice, a little breathless with nerves, but bright. Rising. | – |
| 12 | `jerome_card_reveal.mp3` | Jerome | 左の脇腹だ…今だ！ | Left flank… now! | sharp command | 4 | 0/0.1 | Quick read (a breath of analysis), then the command snaps. | – |
| 13 | `ken_sync_call.mp3` | Ken | 合わせろ、カゲトラ！ | Keep up, Kagetora! | fierce, competitive | 4 | 0/0 | Shouted while running, grin in the voice. | – |
| 14 | `kagetora_sync_reply.mp3` | Kagetora | 誰に言ってる！ | Who do you think you're talking to! | fierce pride | 4 | 0/0.1 | Snapped back instantly, mid-leap. Effort on the last syllable. | – |
| 15 | `weed_battoga.mp3` | Weed | 抜刀牙ッ！ | BATTŌGA! | battle cry | 5 | 0/0 | Explosive, from the gut; short intake of breath before. Not too long. | – |
| 16 | `kaibutsu_roar_armor.mp3` | Kaibutsu | ガアアアアッ！！ | [Roars — its hide hardens like stone] | berserk fury | 5 | 0/0.2 | Harsher and higher than the first roar, with rasp. Shakes the ground. | – |
| 17 | `smith_card_ready.mp3` | Smith | わしの出番じゃな。 | Looks like my turn has come. | calm acceptance | 3 | 0/0.2 | Quiet, almost to himself. A small smile. No fear. | – |
| 18 | `smith_sac_cliff.mp3` | Smith | ウィード…上の崖が見えるか。…わしに任せろ。 | Weed… do you see the cliff above? …Leave this to me. | gentle resolve | 4 | 0.4/0.4 | Soft and unhurried, as if comforting a child. Pause after the question; the last line is warm and final. | – |
| 19 | `weed_sac_wait.mp3` | Weed | スミス、待って！ | Smith, wait! | sudden fear | 4 | 0/0.2 | Voice cracks with alarm; reaching out. Breath in before. | – |
| 20 | `smith_sac_live.mp3` | Smith | 生きろ、ウィード。生きて…皆を導け！ | Live, Weed. Live… and lead them! | strained, loving | 5 | 0/0.3 | Through gritted teeth while holding the monster; strained breath between phrases, then the last words pushed out with all he has — almost a smile. | – |
| 21 | `weed_sac_scream.mp3` | Weed | スミスーーーッ！！ | SMITH!! | anguished scream | 5 | 0/1.2 | Raw, breaking scream; voice tears at the end. Followed by silence. | – |
| 22 | `jerome_sac_rises.mp3` | Jerome | まだ立つか…だが深手だ。スミスの命は、無駄じゃない。 | It still rises… but it's badly wounded. Smith's life was not given in vain. | grim respect | 3 | 0.3/0.3 | Low, steady, measured. Pause after the first sentence. Respectful weight on "スミスの命". | – |
| 23 | `weed_sac_nod.mp3` | Weed | ……うん。 | …I know. | holding back tears | 3 | 0.4/0.5 | Almost a whisper; a shaky breath first. Swallowed sob, not crying. | – |
| 24 | `kaibutsu_roar_rise.mp3` | Kaibutsu | グルルル…オオオッ！ | [It bursts from the rocks, roaring] | wounded fury | 5 | 0/0.3 | Starts as a deep rumble, erupts into a roar. Pain in it. | – |
| 25 | `jerome_arrows_order.mp3` | Jerome | ロバート、ロッカー、ヒューラー。…四本の矢だ。 | Robert. Rocker. Heuler. …The Four Arrows. | solemn command | 4 | 0.3/0.5 | Each name its own beat, heavy. Long pause. "四本の矢だ" low, like a farewell disguised as an order. | – |
| 26 | `robert_arrows_ack.mp3` | Robert | …了解です、隊長。 | …Understood, Captain. | quiet acceptance | 3 | 0.2/0.3 | Soft, steady breath before. No fear, just calm. | – |
| 27 | `heuler_arrows_together.mp3` | Heuler | まだ死ぬなよ、ロバート。…みんなで、一緒に行こう。 | Let's not die yet, Robert. …We go together. | tender bravery | 4 | 0/0.4 | Warm, half-smiling; the second sentence softer, like a promise between brothers. | – |
| 28 | `robert_arrows_fall_robert.mp3` | Robert | 隊長…光栄、でした。 | Captain… it was an honor. | fading, peaceful | 4 | 0.3/0.8 | Weak, breathy, slow; a faint smile. Trails off on the last syllable. | – |
| 29 | `rocker_arrows_fall_rocker.mp3` | Rocker | へっ…先に、行ってるぜ。 | Heh… I'll go on ahead. | wry farewell | 4 | 0.3/0.8 | A weak laugh first; raspy, tired, still cocky. Quiet at the end. | – |
| 30 | `heuler_arrows_fall_heuler.mp3` | Heuler | ロバート…一緒、だぞ… | Robert… we're together… | gentle, dying | 5 | 0.3/1 | Barely above a whisper, reaching for his friend. Long exhale after. | – |
| 31 | `jerome_arrows_fourth.mp3` | Jerome | 四本目は…俺だあああッ！ | And the fourth… is ME! | grief turned to fury | 5 | 0/0.1 | Starts low and shaking, explodes into a roar. The only time he truly shouts. | – |
| 32 | `jerome_arrows_thanks.mp3` | Jerome | ……ありがとう、戦友たち。 | …Thank you, my comrades. | broken, quiet | 5 | 0.8/1 | Very quiet, voice catching. Long breath before. Do not cry openly — he holds it in. | – |
| 33 | `jerome_arrows_now.mp3` | Jerome | ウィード！奴がよろめいた…今だ！ | Weed! It's staggering… now! | urgent resolve | 4 | 0/0.2 | Pulls himself together: strong and fast. A breath between sentences. | – |
| 34 | `weed_finale_cry.mp3` | Weed | これで終わりだ…抜刀牙ーーッ！ | This ends now… BATTŌGA! | ultimate resolve | 5 | 0/0 | First half low and steady, almost calm; then the battle cry tears out at full power. | – |
| 35 | `ken_fall_hold.mp3` | Ken | ウィード！離すな！ | Weed! Don't let go! | desperate | 5 | 0/0 | Shouted through clenched teeth (biting on), strained. | – |
| 36 | `kagetora_fall_with.mp3` | Kagetora | 俺たちも行くぞ！ | We're going with you! | reckless loyalty | 5 | 0/0.2 | Shouted, fearless, a wild edge. | – |
| 37 | `narrator_fall_mist.mp3` | Narrator | 滝の霧が、すべてを呑み込んだ。 | The mist of the falls swallowed everything. | hushed | 2 | 0.4/0.8 | Quiet, slow. Let silence follow. | – |
| 38 | `ken_post_alive_ken.mp3` | Ken | …生きてるか？ | …You alive? | exhausted relief | 2 | 0.4/0.2 | Panting, hoarse. A tired half-laugh. | – |
| 39 | `kagetora_post_alive_kage.mp3` | Kagetora | 当たり前だ。 | Obviously. | tired pride | 2 | 0/0.4 | Breathless, but proud. Small laugh at the end. | – |
| 40 | `kaibutsu_whimper.mp3` | Kaibutsu | クゥ…ン…… | [A faint whimper] | the dog it once was | 3 | 0.4/1.2 | Tiny, fragile, almost a puppy's whimper. Fades into breath. Heartbreaking, not scary. | – |
| 41 | `weed_post_human.mp3` | Weed | 人間が、こいつを怪物にした…こいつが選んだわけじゃない。 | Humans made it a monster… it never chose this. | sorrowful compassion | 4 | 0.4/0.6 | Soft, sad, looking down at it. Pause in the middle. No anger — grief. | – |
| 42 | `jerome_post_guilt.mp3` | Jerome | 部下は死んだ。…なのに、俺は生きている。 | My men are dead. …And yet I live. | hollow guilt | 5 | 0.6/0.8 | Flat and quiet, as if each word costs him. Long pause between the sentences. | – |
| 43 | `weed_post_carry.mp3` | Weed | 皆、最後まであなたを信じてた。…一緒に背負おう、ジェローム。 | They believed in you to the very end. …Let's carry them together, Jerome. | gentle strength | 4 | 0.3/0.6 | Kind, steady, a little older than before. Second sentence offered like a hand. | – |
| 44 | `jerome_post_follow.mp3` | Jerome | ……ウィード。お前に、ついていこう。 | …Weed. I will follow you. | quiet devotion | 4 | 0.6/0.8 | A breath, almost a sigh of release; low, sincere. | – |
| 45 | `narrator_memorial.mp3` | Narrator | スミス。ロバート。ロッカー。ヒューラー。その名は、奥羽の風に刻まれた。 | Smith. Robert. Rocker. Heuler. Their names are carved into the wind of Ōu. | reverent | 4 | 0.6/1 | Each name slow and separate, with a beat of silence. Final sentence warm. | – |
| 46 | `weed_post_father.mp3` | Weed | 父さん…どこにいるの。僕、もっと強くなるよ。 | Father… where are you? I'll become stronger. | hopeful longing | 4 | 0.5/0.6 | Looking at the sunrise; soft, a little shaky, ending with a small brave smile. | – |
| 47 | `smith_spirit_echo.mp3` | Smith | …それでいい、坊主。 | …That's the way, boy. | peaceful, from beyond | 3 | 0.6/1.2 | Whispered, warm, with reverb/echo. Like wind. | – |

## Tips for ElevenLabs (Japanese TTS)

- Use a multilingual model (e.g. eleven_multilingual_v2 / v3) and one consistent voice per character (see profiles).
- Put the *direction* into the voice settings: lower stability (≈0.3–0.45) for emotional lines (intensity 4–5), higher (≈0.6) for calm narration.
- Ellipses (…) and 「、」 produce natural pauses; keep them. Do not add English words.
- Kaibutsu: use sound effects or a heavily pitched-down voice; keep its final whimper small and fragile.
