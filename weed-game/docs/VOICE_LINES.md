# Voice lines – Ōu Saga (Weed fan game draft)

All characters speak **Japanese**; the game shows **English subtitles** (Japanese text optional).
Drop recorded / TTS files into `public/audio/voice/` using the exact file names below, then run `npm run voices`
(or just `npm run build`) – no code changes needed. Missing files are fine: subtitles are then timed by text length.

Format: mp3 (mono, 44.1 kHz, 64–96 kbps), trimmed tight (the game adds the pre/post silences itself).

Status: **0 / 65** lines have audio.

## Voice profiles

| Character | Japanese | Voice |
|---|---|---|
| Weed (`weed`) | ウィード | Young male (≈14). Clear, bright mid-high voice; earnest and determined, cracks under strong emotion. Speaks politely ("boku"). Not cartoonish. |
| Smith (`smith`) | スミス | Elderly male veteran (≈60s feel). Low, gravelly, warm and fatherly. Slow, unhurried; uses old-fashioned "washi". Breathy when strained. |
| Jerome (`jerome`) | ジェロム | Adult male (≈35). Deep baritone, calm, clipped military delivery; controlled emotion with guilt underneath. Rarely raises his voice — when he does, it hits hard. |
| Ken (`ken`) | ケン | Young adult male (≈20). Deep, rough, brash; a big dog's easy confidence. Teasing, but loyal. |
| Kagetora (`kagetora`) | 影虎 | Young adult male (≈19). Sharp, proud, slightly higher than Ken; quick-tempered rhythm, clipped endings. |
| Robert (`robert`) | ロバート | Adult male (≈30). Quiet, steady, soft-spoken soldier. Few words, each one meant. |
| Rocker (`rocker`) | ロッカ | Adult male (≈28). Wry, raspy, fearless; hides fear behind a smirk. |
| Heuler (`heuler`) | ホイラー | Adult male (≈30). Warm, gentle tenor-baritone; the heart of the squad, protective of Robert. |
| Kaibutsu (`kaibutsu`) | 怪物 | Huge, guttural lion-like roars and growls; speaks only a few words (canon: P4 talks) in a deep, rasping, distorted voice. Its final whimper (own interpretation) is small and broken — the dog it once was. |
| Narrator (`narrator`) | ナレーション | Mature narrator (any gender). Calm, low, measured, like an anime episode narrator; slight reverb. |

## Lines (in story order)

| # | File | Who | Japanese | English subtitle | Emotion | Intensity | Pre/Post (s) | Direction | Audio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `narrator_story_01.mp3` | Narrator | 奥羽の山々には、伝説が眠っている。 | In the mountains of Ōu, a legend lies sleeping. | hushed wonder | 2 | 0.8/0.8 | Very slow and low, almost a whisper at the start. Like opening an old book. Let "伝説" breathe. | – |
| 2 | `narrator_story_02.mp3` | Narrator | かつて、熊犬の血を引く秋田犬がいた。名は…銀。 | Long ago lived an Akita of bear-hunting blood. His name… was Gin. | warm nostalgia | 3 | 0.2/0.5 | Gentle storytelling. Pause before the name; say "銀" softly, with affection and pride. | – |
| 3 | `narrator_story_03.mp3` | Narrator | 猟師・五兵衛と少年・大輔に育てられ、銀は熊犬となった。 | Raised by the hunter Gohee and the boy Daisuke, he became a bear dog. | tender, steady | 2 | 0/0.6 | Even and warm, slightly brighter on "勇敢な熊犬". | – |
| 4 | `narrator_story_04.mp3` | Narrator | 双子峠の牙城に君臨する、人喰い熊…赤カブト。 | At Gajō on Futago Pass reigned a giant man-eater… Akakabuto. | dread | 4 | 0.3/0.7 | Darker, lower, slower. A long held breath before the name; "赤カブト" heavy and cold. | – |
| 5 | `narrator_story_05.mp3` | Narrator | 銀は奥羽じゅうの勇敢な犬を集め、軍団を築いた。 | Gin gathered the bravest dogs of all Ōu into one army. | rising, heroic | 4 | 0.2/0.4 | Builds gradually; stronger and fuller toward "軍団". Not shouted. | – |
| 6 | `narrator_story_06.mp3` | Narrator | 多くの仲間が倒れた。それでも…ついに赤カブトは倒された。 | Many comrades fell. Yet at last… Akakabuto was brought down. | grief into triumph | 5 | 0.2/0.6 | First sentence quiet and sad. Then gathering strength; "ついに" after a pause, the end firm and moved. | – |
| 7 | `narrator_story_07.mp3` | Narrator | 銀は奥羽の総大将となり、山は犬たちの楽園となった。 | Gin became leader of Ōu, and the mountains became a paradise for dogs. | serene warmth | 3 | 0.3/0.6 | Relieved and warm, a faint smile in the voice. Slow. | – |
| 8 | `narrator_story_08.mp3` | Narrator | それから、長い年月が流れた。 | Many years have passed since then. | wistful | 2 | 0.5/0.9 | Soft, slow, a little sad. Like turning a page. | – |
| 9 | `narrator_story_09.mp3` | Narrator | だが今、楽園は崩れ去った。人間の実験が生んだ怪物が、牙城を奪ったのだ。 | But now that paradise has crumbled. A monster born of human experiments has seized Gajō. | ominous | 4 | 0.3/0.6 | Tone turns cold. Short pause after the first sentence; "怪物" with quiet horror. | – |
| 10 | `narrator_story_10.mp3` | Narrator | 犬が人を襲ったと信じ、人間たちは犬狩りを始めた。 | Believing dogs had attacked people, the humans began to hunt them. | sorrowful tension | 4 | 0.1/0.5 | Low and tense, bitterness held back. Slightly faster, like being chased. | – |
| 11 | `narrator_story_11.mp3` | Narrator | そして総大将・銀は…今、奥羽にいない。 | And Gin, their leader… is nowhere in Ōu. | heavy absence | 4 | 0.3/0.9 | Slow; a long pause before the last phrase. Let the silence after it hang. | – |
| 12 | `narrator_story_12.mp3` | Narrator | その時、一匹の小さな犬が奥羽を目指していた。銀の息子…ウィード。 | Just then, one small dog was making his way to Ōu. The son of Gin… Weed. | hope rising | 4 | 0.5/0.6 | Gentle, quietly building. Pause before "銀の息子"; the name "ウィード" warm and hopeful, like sunrise. | – |
| 13 | `weed_story_vow.mp3` | Weed | 父さんの国へ…僕は行く。 | To my father's land… I'm going. | quiet resolve | 4 | 0.3/0.8 | Soft, young, to himself, looking at the far mountains. A breath in the middle; the end calm and certain. | – |
| 14 | `narrator_intro_1.mp3` | Narrator | 二子峠。奥羽の砦、牙城は…怪物に奪われた。 | Futago Pass. Gajō, the fortress of Ōu… has fallen to a monster. | ominous calm | 2 | 0.3/0.6 | Slow and low. Small pause after "牙城は…" before the reveal. Let the last word sink. | – |
| 15 | `ken_intro_smell.mp3` | Ken | ここが牙城か…恐怖の匂いしかしねえ。 | So this is Gajō… all I can smell is fear. | uneasy bravado | 2 | 0/0.2 | Sniffing breath first, then low and rough. Trying to sound unbothered. | – |
| 16 | `kagetora_intro_tease.mp3` | Kagetora | 怖気づいたか、ケン？ | Scared already, Ken? | teasing, sharp | 2 | 0/0.1 | Quick, a half-smile in the voice. Rising end. | – |
| 17 | `ken_intro_shut.mp3` | Ken | うるせえ。 | Shut it. | gruff | 1 | 0/0.5 | Short exhale-laugh, gruff. Almost under his breath. | – |
| 18 | `weed_intro_vow.mp3` | Weed | ここは父さんの国だ。……僕が、守る。 | This is my father's land. …I will protect it. | quiet determination | 4 | 0.3/0.6 | Starts soft, looking at the fortress. Long pause (breath) after the first sentence; the vow lands firmly, not shouted. | – |
| 19 | `smith_intro_proud.mp3` | Smith | よく言った、坊主。わしらがついておる。 | Well said, boy. We're right beside you. | warm pride | 3 | 0.2/0.5 | Gentle, fatherly smile. Slow. A soft chuckle before "よく言った". | – |
| 20 | `jerome_intro_arrive.mp3` | Jerome | 俺はジェロム。…あれを作ったのは、人間だ。 | I am Jerome. …It was humans who made that thing. | grave, controlled | 3 | 0/0.5 | Calling down from the clifftop. Formal, clipped. Pause before the last sentence; the word "人間" carries quiet bitterness. | – |
| 21 | `heuler_intro_follow.mp3` | Heuler | 隊長の行く所なら、どこへでも。 | Wherever the Captain goes, we follow. | loyal warmth | 2 | 0/0.4 | Warm and steady, a small nod in the voice. | – |
| 22 | `kaibutsu_roar_intro.mp3` | Kaibutsu | グオオオオオ……ッ！！ | [A deafening roar] | monstrous rage | 5 | 0/0.5 | Long, guttural lion roar, building then ragged at the end. Big chest resonance. | – |
| 23 | `jerome_intro_weak.mp3` | Jerome | 奴の左胸に、毛のない柔らかい場所がある。その時が来たら…俺が示す。 | There's a patch of bare, soft skin on its left chest. When the moment comes… I'll show you. | focused, tactical | 3 | 0/0.3 | Low and fast, eyes on the enemy. Slight pause before "俺が示す". | – |
| 24 | `weed_intro_go.mp3` | Weed | 行くぞ、みんな！ | Let's go, everyone! | rallying courage | 4 | 0/0.3 | Full voice, a little breathless with nerves, but bright. Rising. | – |
| 25 | `jerome_card_reveal.mp3` | Jerome | 左胸だ…今だ！ | Left chest… now! | sharp command | 4 | 0/0.1 | Quick read (a breath of analysis), then the command snaps. | – |
| 26 | `ken_sync_call.mp3` | Ken | 合わせろ、カゲトラ！ | Keep up, Kagetora! | fierce, competitive | 4 | 0/0 | Shouted while running, grin in the voice. | – |
| 27 | `kagetora_sync_reply.mp3` | Kagetora | 誰に言ってる！ | Who do you think you're talking to! | fierce pride | 4 | 0/0.1 | Snapped back instantly, mid-leap. Effort on the last syllable. | – |
| 28 | `weed_battoga.mp3` | Weed | 抜刀牙ッ！ | BATTŌGA! | battle cry | 5 | 0/0 | Explosive, from the gut; short intake of breath before. Not too long. | – |
| 29 | `kaibutsu_roar_armor.mp3` | Kaibutsu | ガアアアアッ！！ | [Roars — its hide hardens like stone] | berserk fury | 5 | 0/0.2 | Harsher and higher than the first roar, with rasp. Shakes the ground. | – |
| 30 | `smith_card_ready.mp3` | Smith | わしの出番じゃな。 | Looks like my turn has come. | calm acceptance | 3 | 0/0.2 | Quiet, almost to himself. A small smile. No fear. | – |
| 31 | `narrator_north_fell.mp3` | Narrator | 牙城の中…ノースは奇襲に倒れた。 | Inside Gajō… North fell to the ambush. | hushed grief | 3 | 0.2/0.6 | Quiet, matter-of-fact, a beat of silence after. | – |
| 32 | `smith_sac_cliff.mp3` | Smith | ウィード…上の崖が見えるか。…わしに任せろ。 | Weed… do you see the cliff above? …Leave this to me. | gentle resolve | 4 | 0.4/0.4 | Soft and unhurried, as if comforting a child. Pause after the question; the last line is warm and final. | – |
| 33 | `weed_sac_wait.mp3` | Weed | スミス、待って！ | Smith, wait! | sudden fear | 4 | 0/0.2 | Voice cracks with alarm; reaching out. Breath in before. | – |
| 34 | `smith_sac_live.mp3` | Smith | 生きろ、ウィード。生きて…皆を導け！ | Live, Weed. Live… and lead them! | strained, loving | 5 | 0/0.3 | Through gritted teeth while holding the monster; strained breath between phrases, then the last words pushed out with all he has — almost a smile. | – |
| 35 | `weed_sac_scream.mp3` | Weed | スミスーーーッ！！ | SMITH!! | anguished scream | 5 | 0/1.2 | Raw, breaking scream; voice tears at the end. Followed by silence. | – |
| 36 | `jerome_sac_rises.mp3` | Jerome | まだ立つか…だが深手だ。スミスの命は、無駄じゃない。 | It still rises… but it's badly wounded. Smith's life was not given in vain. | grim respect | 3 | 0.3/0.3 | Low, steady, measured. Pause after the first sentence. Respectful weight on "スミスの命". | – |
| 37 | `weed_sac_nod.mp3` | Weed | ……うん。 | …I know. | holding back tears | 3 | 0.4/0.5 | Almost a whisper; a shaky breath first. Swallowed sob, not crying. | – |
| 38 | `kaibutsu_roar_rise.mp3` | Kaibutsu | グルルル…オオオッ！ | [It bursts from the rocks, roaring] | wounded fury | 5 | 0/0.3 | Starts as a deep rumble, erupts into a roar. Pain in it. | – |
| 39 | `kaibutsu_speak.mp3` | Kaibutsu | なぜ人間に尻尾を振る…先に裏切ったのは、人間だ！ | Why do you wag your tails for humans… They betrayed us first! | bitter, wounded rage | 5 | 0.2/0.5 | Deep, rasping, slow – words are hard for it. Grief under the anger; the last phrase almost a howl. | – |
| 40 | `jerome_p4_answer.mp3` | Jerome | …知っている、P4。俺も、あそこにいた。 | …I know, P4. I was there too. | quiet guilt | 4 | 0.5/0.6 | Low and soft, almost tender – he was its only friend in the lab. Long pause before speaking. | – |
| 41 | `jerome_arrows_order.mp3` | Jerome | ロバート、ロッカ、ホイラー。…四本の矢だ。 | Robert. Rocker. Heuler. …The Four Arrows. | solemn command | 4 | 0.3/0.5 | Each name its own beat, heavy. Long pause. "四本の矢だ" low, like a farewell disguised as an order. | – |
| 42 | `robert_arrows_ack.mp3` | Robert | …了解です、隊長。 | …Understood, Captain. | quiet acceptance | 3 | 0.2/0.3 | Soft, steady breath before. No fear, just calm. | – |
| 43 | `heuler_arrows_together.mp3` | Heuler | まだ死ぬなよ、ロバート。…みんなで、一緒に行こう。 | Let's not die yet, Robert. …We go together. | tender bravery | 4 | 0/0.4 | Warm, half-smiling; the second sentence softer, like a promise between brothers. | – |
| 44 | `robert_arrows_fall_robert.mp3` | Robert | 隊長…光栄、でした。 | Captain… it was an honor. | fading, peaceful | 4 | 0.3/0.8 | Weak, breathy, slow; a faint smile. Trails off on the last syllable. | – |
| 45 | `rocker_arrows_fall_rocker.mp3` | Rocker | へっ…先に、行ってるぜ。 | Heh… I'll go on ahead. | wry farewell | 4 | 0.3/0.8 | A weak laugh first; raspy, tired, still cocky. Quiet at the end. | – |
| 46 | `heuler_arrows_fall_heuler.mp3` | Heuler | ロバート…一緒、だぞ… | Robert… we're together… | gentle, dying | 5 | 0.3/1 | Barely above a whisper, reaching for his friend. Long exhale after. | – |
| 47 | `jerome_arrows_fourth.mp3` | Jerome | 四本目は…俺だあああッ！ | And the fourth… is ME! | grief turned to fury | 5 | 0/0.1 | Starts low and shaking, explodes into a roar. The only time he truly shouts. | – |
| 48 | `jerome_arrows_thanks.mp3` | Jerome | ……ありがとう、戦友たち。 | …Thank you, my comrades. | broken, quiet | 5 | 0.8/1 | Very quiet, voice catching. Long breath before. Do not cry openly — he holds it in. | – |
| 49 | `jerome_arrows_now.mp3` | Jerome | ウィード！奴がよろめいた…今だ！ | Weed! It's staggering… now! | urgent resolve | 4 | 0/0.2 | Pulls himself together: strong and fast. A breath between sentences. | – |
| 50 | `weed_finale_cry.mp3` | Weed | これで終わりだ…抜刀牙ーーッ！ | This ends now… BATTŌGA! | ultimate resolve | 5 | 0/0 | First half low and steady, almost calm; then the battle cry tears out at full power. | – |
| 51 | `ken_fall_hold.mp3` | Ken | ウィード！離すな！ | Weed! Don't let go! | desperate | 5 | 0/0 | Shouted through clenched teeth (biting on), strained. | – |
| 52 | `kagetora_fall_with.mp3` | Kagetora | 俺たちも行くぞ！ | We're going with you! | reckless loyalty | 5 | 0/0.2 | Shouted, fearless, a wild edge. | – |
| 53 | `narrator_fall_wind.mp3` | Narrator | 谷底から吹き上げる風が、ウィードを宙へ押し上げた。 | A wind rising from the gorge tore Weed free. | awe | 3 | 0.2/0.4 | Measured, building slightly; let the wind sound carry it. | – |
| 54 | `narrator_fall_mist.mp3` | Narrator | 滝の霧が、すべてを呑み込んだ。 | The mist of the falls swallowed everything. | hushed | 2 | 0.4/0.8 | Quiet, slow. Let silence follow. | – |
| 55 | `ken_post_alive_ken.mp3` | Ken | しっかりしろ、カゲトラ。…岸までもう少しだ。 | Hang on, Kagetora. …Almost to the shore. | exhausted care | 3 | 0.4/0.2 | Panting, carrying weight; gruff but gentle. | – |
| 56 | `kagetora_post_alive_kage.mp3` | Kagetora | …うるせえ。落とすなよ。 | …Shut up. Just don't drop me. | hurt pride | 3 | 0/0.4 | Weak, breathless, a pained half-laugh. He can barely move. | – |
| 57 | `kaibutsu_whimper.mp3` | Kaibutsu | クゥ…ン…… | [A faint whimper] | the dog it once was | 3 | 0.4/1.2 | Tiny, fragile, almost a puppy's whimper. Fades into breath. Heartbreaking, not scary. | – |
| 58 | `weed_post_human.mp3` | Weed | 人間が、こいつを怪物にした…こいつが選んだわけじゃない。 | Humans made it a monster… it never chose this. | sorrowful compassion | 4 | 0.4/0.6 | Soft, sad, looking down at it. Pause in the middle. No anger — grief. | – |
| 59 | `jerome_post_guilt.mp3` | Jerome | 放してくれ、ウィード。…部下のところへ、行かせてくれ。 | Let me go, Weed. …Let me go to my men. | hollow despair | 5 | 0.6/0.8 | Clinging to the rock in the current, exhausted. Flat and quiet, each word costs him. | – |
| 60 | `weed_post_carry.mp3` | Weed | だめだ！死ぬのはずるい。…生き残った者には、生きる意味があるんだ。 | No! Dying is unfair. …Those who survive have a reason to live. | fierce compassion | 5 | 0.2/0.6 | Through clenched teeth (he is holding Jerome's leg); then softer, certain. | – |
| 61 | `jerome_post_follow.mp3` | Jerome | ……ウィード。 | …Weed. | silent tears | 5 | 0.8/1 | Barely a whisper; a breath that breaks. He is crying without sound. | – |
| 62 | `jerome_post_stay.mp3` | Jerome | 俺は戻らない。ここ、奥羽に残る。…もう誰の道具でもない。 | I'm not going back. I'm staying here, in Ōu. …I'm no one's tool anymore. | calm defiance | 4 | 0.3/0.6 | Barked toward the humans at the helicopter: firm, steady, free. | – |
| 63 | `narrator_memorial.mp3` | Narrator | スミス。ノース。ロバート。ロッカ。ホイラー。その名は、奥羽の風に刻まれた。 | Smith. North. Robert. Rocker. Heuler. Their names are carved into the wind of Ōu. | reverent | 4 | 0.6/1 | Each name slow and separate, with a beat of silence. Final sentence warm. | – |
| 64 | `weed_post_father.mp3` | Weed | 父さん…どこにいるの。僕、もっと強くなるよ。 | Father… where are you? I'll become stronger. | hopeful longing | 4 | 0.5/0.6 | Looking at the sunrise; soft, a little shaky, ending with a small brave smile. | – |
| 65 | `smith_spirit_echo.mp3` | Smith | …それでいい、坊主。 | …That's the way, boy. | peaceful, from beyond | 3 | 0.6/1.2 | Whispered, warm, with reverb/echo. Like wind. | – |

## Tips for ElevenLabs (Japanese TTS)

- Use a multilingual model (e.g. eleven_multilingual_v2 / v3) and one consistent voice per character (see profiles).
- Put the *direction* into the voice settings: lower stability (≈0.3–0.45) for emotional lines (intensity 4–5), higher (≈0.6) for calm narration.
- Ellipses (…) and 「、」 produce natural pauses; keep them. Do not add English words.
- Kaibutsu: use sound effects or a heavily pitched-down voice; keep its final whimper small and fragile.
