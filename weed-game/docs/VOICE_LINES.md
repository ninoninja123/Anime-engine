# Voice lines – Ōu Saga (Weed fan game draft)

All characters speak **Japanese**; the game shows **English subtitles** (Japanese text optional).
Drop recorded / TTS files into `public/audio/voice/` using the exact file names below, then run `npm run voices`
(or just `npm run build`) – no code changes needed. Missing files are fine: subtitles are then timed by text length.

Format: mp3 (mono, 44.1 kHz, 64–96 kbps), trimmed tight (the game adds the pre/post silences itself).

Status: **145 / 149** lines have audio.

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
| Mel (`mel`) | メル | Young male golden retriever. Bright, kind, brave; a friend who always comes back for you. |
| GB (`gb`) | ジービー | Middle-aged male English setter. Lazy, boastful, warm-hearted; a bit nasal and theatrical. |
| Narrator (`narrator`) | ナレーション | Mature narrator (any gender). Calm, low, measured, like an anime episode narrator; slight reverb. |
| Sakura (`sakura`) | サクラ | Adult female Akita (≈30 feel). Soft, warm alto; gentle and dignified even when weak. Fading breath in her last lines. |
| Nero (`nero`) | ネロ | Adult male gang boss (≈45). Low, lazy, menacing drawl; never shouts, never needs to. |
| Sasuke (`sasuke`) | サスケ | Young male Shiba (≈16). Quick, squeaky-edged, comic complainer with a good heart. |
| Hook (`hook`) | フック | Adult male Labrador (≈35). Steady, warm baritone with old grief underneath; plain-spoken. |
| Blue (`blue`) | ブルー | Adult male Beauceron (≈40). Rough, sneering baritone, a thief-boss swagger; at the end quiet, tired and honest. |
| Tosa (`tosa`) | 土佐犬 | Huge male farm watchdog. Deep, slow, contemptuous voice; mostly growls. |

## Lines (in story order)

| # | File | Who | Japanese | English subtitle | Emotion | Intensity | Pre/Post (s) | Direction | Audio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `narrator_story_01.mp3` | Narrator | 奥羽の山々には、伝説が眠っている。 | In the mountains of Ōu, a legend lies sleeping. | hushed wonder | 2 | 0.8/0.8 | Very slow and low, almost a whisper at the start. Like opening an old book. Let "伝説" breathe. | ✔ |
| 2 | `narrator_story_02.mp3` | Narrator | かつて、熊犬の血を引く秋田犬がいた。名は…銀。 | Long ago lived an Akita of bear-hunting blood. His name… was Gin. | warm nostalgia | 3 | 0.2/0.5 | Gentle storytelling. Pause before the name; say "銀" softly, with affection and pride. | ✔ |
| 3 | `narrator_story_03.mp3` | Narrator | 猟師・五兵衛と少年・大輔に育てられ、銀は熊犬となった。 | Raised by the hunter Gohee and the boy Daisuke, he became a bear dog. | tender, steady | 2 | 0/0.6 | Even and warm, slightly brighter on "勇敢な熊犬". | ✔ |
| 4 | `narrator_story_04.mp3` | Narrator | 二子峠の牙城に君臨する、人喰い熊…赤カブト。 | At Gajō on Futago Pass reigned a giant man-eater… Akakabuto. | dread | 4 | 0.3/0.7 | Darker, lower, slower. A long held breath before the name; "赤カブト" heavy and cold. | ✔ |
| 5 | `narrator_story_05.mp3` | Narrator | 銀は奥羽じゅうの勇敢な犬を集め、軍団を築いた。 | Gin gathered the bravest dogs of all Ōu into one army. | rising, heroic | 4 | 0.2/0.4 | Builds gradually; stronger and fuller toward "軍団". Not shouted. | ✔ |
| 6 | `narrator_story_06.mp3` | Narrator | 多くの仲間が倒れた。それでも…ついに赤カブトは倒された。 | Many comrades fell. Yet at last… Akakabuto was brought down. | grief into triumph | 5 | 0.2/0.6 | First sentence quiet and sad. Then gathering strength; "ついに" after a pause, the end firm and moved. | ✔ |
| 7 | `narrator_story_07.mp3` | Narrator | 銀は奥羽の総大将となり、山は犬たちの楽園となった。 | Gin became leader of Ōu, and the mountains became a paradise for dogs. | serene warmth | 3 | 0.3/0.6 | Relieved and warm, a faint smile in the voice. Slow. | ✔ |
| 8 | `narrator_story_08.mp3` | Narrator | それから、十四年の月日が流れた。 | Fourteen years of peace went by. | wistful | 2 | 0.5/0.9 | Soft, slow, a little sad. Like turning a page. | ✔ |
| 9 | `narrator_story_09.mp3` | Narrator | だが今、楽園は崩れ去った。人間の実験が生んだ怪物が、牙城を奪ったのだ。 | But now that paradise has crumbled. A monster born of human experiments has seized Gajō. | ominous | 4 | 0.3/0.6 | Tone turns cold. Short pause after the first sentence; "怪物" with quiet horror. | ✔ |
| 10 | `narrator_story_10.mp3` | Narrator | 森は枯れ、仲間は倒れ…人間の猟師までが、犬たちに銃を向ける。 | The forest withers, comrades fall… and even human hunters turn their guns on the dogs. | sorrowful tension | 4 | 0.1/0.5 | Low and tense, bitterness held back. Slightly faster, like being chased. | ✔ |
| 11 | `narrator_story_11.mp3` | Narrator | そして総大将・銀は…遠い旅の空の下にいる。 | And Gin, their leader… is far away, on a long journey. | heavy absence | 4 | 0.3/0.9 | Slow; a long pause before the last phrase. Let the silence after it hang. | ✔ |
| 12 | `narrator_story_12.mp3` | Narrator | その時、一匹の小さな犬が奥羽を目指していた。銀の息子…ウィード。 | Just then, one small dog was making his way to Ōu. The son of Gin… Weed. | hope rising | 4 | 0.5/0.6 | Gentle, quietly building. Pause before "銀の息子"; the name "ウィード" warm and hopeful, like sunrise. | ✔ |
| 13 | `weed_story_vow.mp3` | Weed | 父さんの国へ…僕は行く。 | To my father's land… I'm going. | quiet resolve | 4 | 0.3/0.8 | Soft, young, to himself, looking at the far mountains. A breath in the middle; the end calm and certain. | ✔ |
| 14 | `narrator_intro_1.mp3` | Narrator | 二子峠。奥羽の砦、牙城は…怪物に奪われた。 | Futago Pass. Gajō, the fortress of Ōu… has fallen to a monster. | ominous calm | 2 | 0.3/0.6 | Slow and low. Small pause after "牙城は…" before the reveal. Let the last word sink. | ✔ |
| 15 | `ken_intro_smell.mp3` | Ken | ここが牙城か…恐怖の匂いしかしねえ。 | So this is Gajō… all I can smell is fear. | uneasy bravado | 2 | 0/0.2 | Sniffing breath first, then low and rough. Trying to sound unbothered. | ✔ |
| 16 | `kagetora_intro_tease.mp3` | Kagetora | 怖気づいたか、ケン？ | Scared already, Ken? | teasing, sharp | 2 | 0/0.1 | Quick, a half-smile in the voice. Rising end. | ✔ |
| 17 | `ken_intro_shut.mp3` | Ken | うるせえ。 | Shut it. | gruff | 1 | 0/0.5 | Short exhale-laugh, gruff. Almost under his breath. | ✔ |
| 18 | `weed_intro_vow.mp3` | Weed | ここは父さんの国だ。……僕が、守る。 | This is my father's land. …I will protect it. | quiet determination | 4 | 0.3/0.6 | Starts soft, looking at the fortress. Long pause (breath) after the first sentence; the vow lands firmly, not shouted. | ✔ |
| 19 | `smith_intro_proud.mp3` | Smith | よく言った、坊主。わしらがついておる。 | Well said, boy. We're right beside you. | warm pride | 3 | 0.2/0.5 | Gentle, fatherly smile. Slow. A soft chuckle before "よく言った". | ✔ |
| 20 | `jerome_intro_arrive.mp3` | Jerome | 俺はジェロム。…あれを作ったのは、人間だ。 | I am Jerome. …It was humans who made that thing. | grave, controlled | 3 | 0/0.5 | Calling down from the clifftop. Formal, clipped. Pause before the last sentence; the word "人間" carries quiet bitterness. | ✔ |
| 21 | `heuler_intro_follow.mp3` | Heuler | 隊長の行く所なら、どこへでも。 | Wherever the Captain goes, we follow. | loyal warmth | 2 | 0/0.4 | Warm and steady, a small nod in the voice. | ✔ |
| 22 | `kaibutsu_roar_intro.mp3` | Kaibutsu | グオオオオオ……ッ！！ | [A deafening roar] | monstrous rage | 5 | 0/0.5 | Long, guttural lion roar, building then ragged at the end. Big chest resonance. | – |
| 23 | `jerome_intro_weak.mp3` | Jerome | 奴の左胸に、毛のない柔らかい場所がある。その時が来たら…俺が示す。 | There's a patch of bare, soft skin on its left chest. When the moment comes… I'll show you. | focused, tactical | 3 | 0/0.3 | Low and fast, eyes on the enemy. Slight pause before "俺が示す". | ✔ |
| 24 | `weed_intro_go.mp3` | Weed | 行くぞ、みんな！ | Let's go, everyone! | rallying courage | 4 | 0/0.3 | Full voice, a little breathless with nerves, but bright. Rising. | ✔ |
| 25 | `jerome_card_reveal.mp3` | Jerome | 左胸だ…今だ！ | Left chest… now! | sharp command | 4 | 0/0.1 | Quick read (a breath of analysis), then the command snaps. | ✔ |
| 26 | `ken_sync_call.mp3` | Ken | 合わせろ、カゲトラ！ | Keep up, Kagetora! | fierce, competitive | 4 | 0/0 | Shouted while running, grin in the voice. | ✔ |
| 27 | `kagetora_sync_reply.mp3` | Kagetora | 誰に言ってる！ | Who do you think you're talking to! | fierce pride | 4 | 0/0.1 | Snapped back instantly, mid-leap. Effort on the last syllable. | ✔ |
| 28 | `weed_battoga.mp3` | Weed | 抜刀牙ッ！ | BATTŌGA! | battle cry | 5 | 0/0 | Explosive, from the gut; short intake of breath before. Not too long. | ✔ |
| 29 | `kaibutsu_roar_armor.mp3` | Kaibutsu | ガアアアアッ！！ | [A furious roar – its hide is too tough to bite through] | berserk fury | 5 | 0/0.2 | Harsher and higher than the first roar, with rasp. Shakes the ground. | – |
| 30 | `smith_card_ready.mp3` | Smith | わしの出番じゃな。 | Looks like my turn has come. | calm acceptance | 3 | 0/0.2 | Quiet, almost to himself. A small smile. No fear. | ✔ |
| 31 | `narrator_north_fell.mp3` | Narrator | 牙城の中…ノースは奇襲に倒れた。 | Inside Gajō… North fell to the ambush. | hushed grief | 3 | 0.2/0.6 | Quiet, matter-of-fact, a beat of silence after. | ✔ |
| 32 | `smith_sac_cliff.mp3` | Smith | ウィード…上の岩天井が見えるか。…わしに任せろ。 | Weed… do you see the rock ceiling above? …Leave this to me. | gentle resolve | 4 | 0.4/0.4 | Soft and unhurried, as if comforting a child. Pause after the question; the last line is warm and final. | ✔ |
| 33 | `weed_sac_wait.mp3` | Weed | スミス、待って！ | Smith, wait! | sudden fear | 4 | 0/0.2 | Voice cracks with alarm; reaching out. Breath in before. | ✔ |
| 34 | `smith_sac_live.mp3` | Smith | 生きろ、ウィード。生きて…皆を導け！ | Live, Weed. Live… and lead them! | strained, loving | 5 | 0/0.3 | Through gritted teeth while holding the monster; strained breath between phrases, then the last words pushed out with all he has — almost a smile. | ✔ |
| 35 | `weed_sac_scream.mp3` | Weed | スミスーーーッ！！ | SMITH!! | anguished scream | 5 | 0/1.2 | Raw, breaking scream; voice tears at the end. Followed by silence. | ✔ |
| 36 | `jerome_sac_rises.mp3` | Jerome | まだ立つか…だが深手だ。スミスの命は、無駄じゃない。 | It still rises… but it's badly wounded. Smith's life was not given in vain. | grim respect | 3 | 0.3/0.3 | Low, steady, measured. Pause after the first sentence. Respectful weight on "スミスの命". | ✔ |
| 37 | `weed_sac_nod.mp3` | Weed | ……うん。 | …I know. | holding back tears | 3 | 0.4/0.5 | Almost a whisper; a shaky breath first. Swallowed sob, not crying. | ✔ |
| 38 | `kaibutsu_roar_rise.mp3` | Kaibutsu | グルルル…オオオッ！ | [It bursts from the rocks, roaring] | wounded fury | 5 | 0/0.3 | Starts as a deep rumble, erupts into a roar. Pain in it. | – |
| 39 | `kaibutsu_speak.mp3` | Kaibutsu | なぜ人間に尻尾を振る…先に裏切ったのは、人間だ！ | Why do you wag your tails for humans… They betrayed us first! | bitter, wounded rage | 5 | 0.2/0.5 | Deep, rasping, slow – words are hard for it. Grief under the anger; the last phrase almost a howl. | ✔ |
| 40 | `jerome_p4_answer.mp3` | Jerome | …知っている、P4。俺も、あそこにいた。 | …I know, P4. I was there too. | quiet guilt | 4 | 0.5/0.6 | Low and soft, almost tender – he was its only friend in the lab. Long pause before speaking. | ✔ |
| 41 | `jerome_arrows_order.mp3` | Jerome | ロバート、ロッカ、ホイラー。…四本の矢だ。 | Robert. Rocker. Heuler. …The Four Arrows. | solemn command | 4 | 0.3/0.5 | Each name its own beat, heavy. Long pause. "四本の矢だ" low, like a farewell disguised as an order. | ✔ |
| 42 | `robert_arrows_ack.mp3` | Robert | …了解です、隊長。 | …Understood, Captain. | quiet acceptance | 3 | 0.2/0.3 | Soft, steady breath before. No fear, just calm. | ✔ |
| 43 | `heuler_arrows_together.mp3` | Heuler | まだ死ぬなよ、ロバート。…みんなで、一緒に行こう。 | Let's not die yet, Robert. …We go together. | tender bravery | 4 | 0/0.4 | Warm, half-smiling; the second sentence softer, like a promise between brothers. | ✔ |
| 44 | `robert_arrows_fall_robert.mp3` | Robert | 隊長…光栄、でした。 | Captain… it was an honor. | fading, peaceful | 4 | 0.3/0.8 | Weak, breathy, slow; a faint smile. Trails off on the last syllable. | ✔ |
| 45 | `rocker_arrows_fall_rocker.mp3` | Rocker | へっ…先に、行ってるぜ。 | Heh… I'll go on ahead. | wry farewell | 4 | 0.3/0.8 | A weak laugh first; raspy, tired, still cocky. Quiet at the end. | ✔ |
| 46 | `heuler_arrows_fall_heuler.mp3` | Heuler | ロバート…一緒、だぞ… | Robert… we're together… | gentle, dying | 5 | 0.3/1 | Barely above a whisper, reaching for his friend. Long exhale after. | ✔ |
| 47 | `jerome_arrows_fourth.mp3` | Jerome | 四本目は…俺だあああッ！ | And the fourth… is ME! | grief turned to fury | 5 | 0/0.1 | Starts low and shaking, explodes into a roar. The only time he truly shouts. | ✔ |
| 48 | `jerome_arrows_thanks.mp3` | Jerome | ……ありがとう、戦友たち。 | …Thank you, my comrades. | broken, quiet | 5 | 0.8/1 | Very quiet, voice catching. Long breath before. Do not cry openly — he holds it in. | ✔ |
| 49 | `jerome_arrows_now.mp3` | Jerome | まだ終わっていない。ウィード…皆で行くぞ！ | It's not over. Weed… we finish this together! | urgent resolve | 4 | 0/0.2 | Pulls himself together: strong and fast. A breath between sentences. | ✔ |
| 50 | `robert_arrows_cry_robert.mp3` | Robert | うおおおおおおッ！！ | [Battle cry] | furious charge | 5 | 0/0 | Full-throated battle cry as he launches himself. | ✔ |
| 51 | `rocker_arrows_cry_rocker.mp3` | Rocker | おらあああああッ！！ | [Battle cry] | furious charge | 5 | 0/0 | Raw, roaring battle cry on the leap. | ✔ |
| 52 | `heuler_arrows_cry_heuler.mp3` | Heuler | いくぞおおおおおッ！！ | [Battle cry] | desperate charge | 5 | 0/0 | Desperate, cracking roar of resolve. | ✔ |
| 53 | `robert_arrows_pain_robert.mp3` | Robert | ぐあああッ…！ぐっ…ううっ…！ | [Cry of pain] | agony | 4 | 0/0 | Pained grunts while clamped on, straining. | ✔ |
| 54 | `rocker_arrows_pain_rocker.mp3` | Rocker | がはっ…！ぐうう…ッ！ | [Cry of pain] | agony | 4 | 0/0 | Choking gasp, straining through the pain. | ✔ |
| 55 | `heuler_arrows_pain_heuler.mp3` | Heuler | ぐっ…ああああああッ！ | [Cry of pain] | agony | 5 | 0/0 | A long cry as he is torn away. | ✔ |
| 56 | `kagetora_lock_pain_kage.mp3` | Kagetora | ぐあっ…！ああっ…！ | [Cry of pain] | pain | 4 | 0/0 | Sharp pained cry when P4 bites him. | ✔ |
| 57 | `weed_lock_shout_weed.mp3` | Weed | うわあああああッ！！ | [Shout] | effort | 5 | 0/0 | All-out shout of effort holding the monster down. | ✔ |
| 58 | `weed_lock_call.mp3` | Weed | ケン！カゲトラ！押さえ込め！ | Ken! Kagetora! Pin it down! | desperate command | 5 | 0/0.1 | Shouted mid-leap, voice cracking with effort. Fast. | ✔ |
| 59 | `jerome_lock_artery.mp3` | Jerome | …届け…！ | …Reach…! | straining, all-in | 5 | 0/0.3 | Through clenched teeth, jaws locked on the wound. A strained growl more than a word. | ✔ |
| 60 | `kagetora_lock_hurt.mp3` | Kagetora | ぐっ…まだだ…！ | Ngh… not yet…! | pain and defiance | 4 | 0/0.3 | Bitten at the neck: a choked cry, then stubborn words. No screaming. | ✔ |
| 61 | `weed_finale_cry.mp3` | Weed | これで終わりだ…抜刀牙ーーッ！ | This ends now… BATTŌGA! | ultimate resolve | 5 | 0/0 | First half low and steady, almost calm; then the battle cry tears out at full power. | ✔ |
| 62 | `ken_fall_hold.mp3` | Ken | ウィード！離すな！ | Weed! Don't let go! | desperate | 5 | 0/0 | Shouted through clenched teeth (biting on), strained. | ✔ |
| 63 | `kagetora_fall_with.mp3` | Kagetora | 俺たちも行くぞ！ | We're going with you! | reckless loyalty | 5 | 0/0.2 | Shouted, fearless, a wild edge. | ✔ |
| 64 | `narrator_fall_wind.mp3` | Narrator | 谷底から吹き上げる風が、ウィードを宙へ押し上げた。 | A wind rising from the gorge tore Weed free. | awe | 3 | 0.2/0.4 | Measured, building slightly; let the wind sound carry it. | ✔ |
| 65 | `narrator_fall_mist.mp3` | Narrator | 滝の霧が、すべてを呑み込んだ。 | The mist of the falls swallowed everything. | hushed | 2 | 0.4/0.8 | Quiet, slow. Let silence follow. | ✔ |
| 66 | `ken_post_alive_ken.mp3` | Ken | しっかりしろ、カゲトラ。…岸までもう少しだ。 | Hang on, Kagetora. …Almost to the shore. | exhausted care | 3 | 0.4/0.2 | Panting, carrying weight; gruff but gentle. | ✔ |
| 67 | `kagetora_post_alive_kage.mp3` | Kagetora | …うるせえ。落とすなよ。 | …Shut up. Just don't drop me. | hurt pride | 3 | 0/0.4 | Weak, breathless, a pained half-laugh. He can barely move. | ✔ |
| 68 | `kaibutsu_whimper.mp3` | Kaibutsu | クゥ…ン…… | [A faint whimper] | the dog it once was | 3 | 0.4/1.2 | Tiny, fragile, almost a puppy's whimper. Fades into breath. Heartbreaking, not scary. | – |
| 69 | `weed_post_human.mp3` | Weed | 人間が、こいつを怪物にした…こいつが選んだわけじゃない。 | Humans made it a monster… it never chose this. | sorrowful compassion | 4 | 0.4/0.6 | Soft, sad, looking down at it. Pause in the middle. No anger — grief. | ✔ |
| 70 | `jerome_post_guilt.mp3` | Jerome | 放してくれ、ウィード。…部下のところへ、行かせてくれ。 | Let me go, Weed. …Let me go to my men. | hollow despair | 5 | 0.6/0.8 | Clinging to the rock in the current, exhausted. Flat and quiet, each word costs him. | ✔ |
| 71 | `weed_post_carry.mp3` | Weed | だめだ！死ぬのはずるい。…生き残った者には、生きる意味があるんだ。 | No! Dying is unfair. …Those who survive have a reason to live. | fierce compassion | 5 | 0.2/0.6 | Through clenched teeth (he is holding Jerome's leg); then softer, certain. | ✔ |
| 72 | `jerome_post_follow.mp3` | Jerome | ……ウィード。 | …Weed. | silent tears | 5 | 0.8/1 | Barely a whisper; a breath that breaks. He is crying without sound. | ✔ |
| 73 | `mel_help.mp3` | Mel | ウィード！ジェロム！こっちだ、つかまれ！ | Weed! Jerome! Over here – grab on! | urgent kindness | 4 | 0/0.3 | Shouted over the roar of the river, warm and brave. | ✔ |
| 74 | `jerome_post_stay.mp3` | Jerome | 俺は戻らない。ここ、奥羽に残る。…もう誰の道具でもない。 | I'm not going back. I'm staying here, in Ōu. …I'm no one's tool anymore. | calm defiance | 4 | 0.3/0.6 | Barked toward the humans at the helicopter: firm, steady, free. | ✔ |
| 75 | `narrator_memorial.mp3` | Narrator | スミス。ノース。ロバート。ロッカ。ホイラー。その名は、奥羽の風に刻まれた。 | Smith. North. Robert. Rocker. Heuler. Their names are carved into the wind of Ōu. | reverent | 4 | 0.6/1 | Each name slow and separate, with a beat of silence. Final sentence warm. | ✔ |
| 76 | `weed_post_father.mp3` | Weed | 父さん…どこにいるの。僕、もっと強くなるよ。 | Father… where are you? I'll become stronger. | hopeful longing | 4 | 0.5/0.6 | Looking at the last light of dusk; soft, a little shaky, ending with a small brave smile. | ✔ |
| 77 | `smith_spirit_echo.mp3` | Smith | …それでいい、坊主。 | …That's the way, boy. | peaceful, from beyond | 3 | 0.6/1.2 | Whispered, warm, with reverb/echo. Like wind. | ✔ |
| 78 | `narrator_p_open_1.mp3` | Narrator | 怪物の影が奥羽を覆ってから、半年。 | Half a year after a monster's shadow fell over Ōu… | hushed, ominous | 2 | 0.8/0.6 | Slow and low, the first words of the chapter. Let the silence after "半年" hang. | ✔ |
| 79 | `narrator_p_open_2.mp3` | Narrator | 遠く離れた北アルプスにも、秋が来ていた。 | …autumn had come to the far-off northern Alps. | wistful | 2 | 0.1/0.8 | A little warmer; the camera drifts over red and gold mountains. | ✔ |
| 80 | `gb_p_gb_mine.mp3` | GB | おい！そいつはオレの獲物だぞ、チビ！ | Hey! That's my catch, you little runt! | blustering | 3 | 0/0.3 | Big, theatrical, all bark and no bite. Tugging at the same scrap as the pup. | ✔ |
| 81 | `weed_p_weed_mother.mp3` | Weed | お願い…母さんが病気なんだ。何日も食べてないの。 | Please… my mother is sick. She hasn't eaten in days. | small, pleading | 3 | 0.3/0.5 | A PUP: high, small, trembling but not whining. He does not let go of the scrap. | ✔ |
| 82 | `gb_p_gb_give.mp3` | GB | …ちっ。持ってけ。オレの気が変わらないうちにな。 | …Tch. Take it. Before I change my mind. | gruff kindness | 2 | 0.6/0.3 | Looks away, embarrassed by his own soft heart. Grumbled, not angry. | ✔ |
| 83 | `weed_p_weed_thanks.mp3` | Weed | ありがとう、おじさん！ | Thank you, mister! | bright gratitude | 2 | 0/0.2 | Pure, happy pup voice. | ✔ |
| 84 | `gb_p_gb_mister.mp3` | GB | お、おじさんだと！？オレはまだ男盛りだっての！ | M-Mister?! I'm in the prime of my life! | comic indignation | 3 | 0/0.5 | Comic beat: offended, voice cracking upward. | ✔ |
| 85 | `nero_p_nero_order.mp3` | Nero | GB。尾根の下の農場に、太ったアヒルがいる。今夜、一羽持ってこい。 | GB. There's a farm under the ridge with fat ducks. Bring me one tonight. | lazy menace | 3 | 0.4/0.4 | Slow drawl. He doesn't ask; he never asks. | ✔ |
| 86 | `gb_p_gb_tosa.mp3` | GB | あ、あの農場ですか？ボス、あそこの池は土佐犬が見張ってるんですよ！ | Th-that farm? Boss, a Tosa guards that pond! | nervous | 3 | 0/0.3 | Fast, nervous, trying to smile. | ✔ |
| 87 | `nero_p_nero_threat.mp3` | Nero | なら頭を使え。でなきゃ…戻ってくるな。 | Then use your head. Or… don't come back. | cold threat | 3 | 0.2/0.6 | Quiet. The pause before the last words is the threat. | ✔ |
| 88 | `gb_p_gb_sasuke.mp3` | GB | サスケ、相棒…お前、足は速いよな？ちょっと小屋のそばで騒いでくれりゃいいんだ。 | Sasuke, buddy… you're fast, right? Just make a little noise by the kennel. | wheedling | 2 | 0.3/0.2 | Sweet-talking a friend. | ✔ |
| 89 | `sasuke_p_sasuke_me.mp3` | Sasuke | オレ！？なんでいつもオレなんだよ！ | Me?! Why is it always me?! | comic panic | 3 | 0/0.4 | Yelped, comic. | ✔ |
| 90 | `weed_p_weed_worry.mp3` | Weed | あの子…ケガしちゃう。 | That dog… is going to get hurt. | quiet worry | 2 | 0.4/0.5 | Whispered to himself, watching them go. The first sign of who he is. | ✔ |
| 91 | `gb_p_gb_run.mp3` | GB | おい、チビ！？何してる、戻れ！ | Hey, kid?! What are you doing — get back here! | alarmed | 4 | 0/0.2 | Shouted while running, out of breath. | ✔ |
| 92 | `sasuke_p_sasuke_help.mp3` | Sasuke | 助けてくれー！捕まった！ | Heeelp! It's got me! | terrified | 4 | 0/0.2 | Distant, panicked yelp-shout. | ✔ |
| 93 | `gb_p_gb_hurry.mp3` | GB | くそっ、オレも行くしかねえか！ | Damn it — guess I'm going too! | reluctant courage | 3 | 0/0.2 | Grits his teeth and runs after the pup. | ✔ |
| 94 | `gb_p_gb_decoy.mp3` | GB | こっちだ、ノロマ！ | Over here, slowpoke! | taunting decoy | 3 | 0/0.1 | Loud, cocky taunt to draw attention; quick. | ✔ |
| 95 | `weed_p_weed_letgo.mp3` | Weed | 放せ！その子を放せ！ | Let go! Let him go! | fierce | 4 | 0/0.3 | A pup's voice at full strength, shaking but fearless. | ✔ |
| 96 | `tosa_p_tosa_scoff.mp3` | Tosa | 子犬が？おやつにもならんわ。 | A pup? You're not even a snack. | contempt | 3 | 0.2/0.3 | Deep, slow, amused. A giant looking down. | ✔ |
| 97 | `weed_p_weed_rise.mp3` | Weed | 負け…ない……！ | I… won't… lose…! | rising will | 5 | 0.6/0.4 | From the rubble: breathless, each word pulled up from the bottom of his chest; last word a growl. | ✔ |
| 98 | `gb_p_gb_what.mp3` | GB | な、なんだ今の！？刃みたいに回りやがった…！ | Wh-what was that?! He spun like a blade…! | stunned awe | 4 | 0.2/0.4 | Jaw dropped, half whisper half shout. | ✔ |
| 99 | `tosa_p_tosa_rage.mp3` | Tosa | このチビがぁっ…！ | You little…! | rage | 5 | 0/0.2 | Roared, wounded pride. | ✔ |
| 100 | `smith_p_smith_enough.mp3` | Smith | もうよせ。 | That's enough. | calm, immovable | 4 | 0.5/0.8 | Very quiet and low. No threat in the words; the threat is in the stillness. | ✔ |
| 101 | `gb_p_gb_who.mp3` | GB | あんた…何者だ、じいさん？ | Who… are you, old-timer? | wary awe | 2 | 0.3/0.3 | Careful, impressed. | ✔ |
| 102 | `smith_p_smith_name.mp3` | Smith | ただの旅の者じゃ。…ある犬を探しておる。 | Just a traveller. …I'm looking for someone. | weary warmth | 2 | 0.2/0.5 | Old, tired, kind. | ✔ |
| 103 | `weed_p_weed_home.mp3` | Weed | 母さん…帰らなきゃ。母さんが待ってる。 | Mother… I have to go back. She's waiting. | urgent worry | 3 | 0.2/0.3 | Small and quick; he is already turning to run. | ✔ |
| 104 | `smith_p_smith_sakura.mp3` | Smith | サクラ…？本当に、お前なのか…？ | Sakura…? Is it… really you? | disbelief, grief | 4 | 0.8/0.6 | Barely a breath. He recognises her and sees how thin she is. | ✔ |
| 105 | `sakura_p_sakura_smith.mp3` | Sakura | スミス…来てくれたのね。奥羽の誰かが、きっと来てくれると思ってた。 | Smith… you came. I knew someone from Ōu would. | weak relief | 4 | 0.4/0.5 | Very soft, smiling through exhaustion. Short breaths between phrases. | ✔ |
| 106 | `smith_p_smith_sorry.mp3` | Smith | すまん、わしが途中ではぐれさえしなければ… | Forgive me. If only I hadn't lost you on the road— | guilt | 4 | 0.2/0.1 | Breaking; he wants to explain. | ✔ |
| 107 | `sakura_p_sakura_hush.mp3` | Sakura | いいの。…もう、その話をする時間はないわ。 | Hush. …There's no time for that now. | gentle | 4 | 0.2/0.6 | She stops him tenderly. No blame at all. | ✔ |
| 108 | `sakura_p_sakura_entrust.mp3` | Sakura | この子は銀の息子。お願い…父親のもとへ、連れていって。 | This is Gin's son. Please… take him to his father. | entrusting | 5 | 0.4/0.6 | Every word chosen; the most important thing she will ever ask. | ✔ |
| 109 | `smith_p_smith_promise.mp3` | Smith | この命にかけて。必ず、奥羽へ連れて行く。 | On my life. He will reach Ōu. | solemn vow | 5 | 0.3/0.8 | Low and steady, a soldier's oath. | ✔ |
| 110 | `sakura_p_sakura_pup.mp3` | Sakura | 優しく、強くなりなさい。お父さんが…奥羽の山で待っているわ。 | Be gentle. Be strong. Your father is waiting… in the mountains of Ōu. | last tenderness | 5 | 0.6/0.6 | To her son, nose to nose. Fading, but she makes herself smile. | ✔ |
| 111 | `weed_p_weed_mama.mp3` | Weed | 母さん…？母さん！ | Mother…? Mother! | dawning horror | 5 | 0.8/0.6 | First soft and confused, then a cry. | ✔ |
| 112 | `sakura_p_sakura_last.mp3` | Sakura | ……生きて。 | …Live. | final breath | 5 | 0.8/1.6 | A whisper on the last breath. Almost nothing. | ✔ |
| 113 | `gb_p_gb_comfort.mp3` | GB | なあ…泣いていいんだ。気が済むまで泣け。 | Hey… it's okay to cry. Cry as long as you need. | awkward tenderness | 4 | 1/0.8 | Morning. Quiet, clumsy, sincere. He sits beside the pup. | ✔ |
| 114 | `gb_p_gb_noname.mp3` | GB | お前、名前もないんだろ？ | You don't even have a name, do you? | gentle | 3 | 0.4/0.6 | Soft, thinking. | ✔ |
| 115 | `gb_p_gb_weed.mp3` | GB | 見ろよ、雑草だ。毎日踏まれても、また起き上がる。 | Look at that. A weed. Trampled every day, and it still gets back up. | quiet wonder | 3 | 0.3/0.5 | Nodding at a little plant in a crack of stone. Slower. | ✔ |
| 116 | `gb_p_gb_name.mp3` | GB | ウィード。それがお前の名前だ。小さくても、根っこは抜けない。 | Weed. That's your name. Small, but never uprooted. | warm conviction | 4 | 0.4/0.8 | He is giving a gift. The first time he sounds completely serious. | ✔ |
| 117 | `weed_p_weed_name.mp3` | Weed | ウィード…。僕の名前は、ウィード。 | Weed… My name is Weed. | tearful resolve | 4 | 0.5/0.6 | Trying the name out; tears still in his voice, then steadier. | ✔ |
| 118 | `smith_p_smith_go.mp3` | Smith | では行こう、ウィード。奥羽は遠いぞ。 | Then let's go, Weed. Ōu is a long way off. | gentle resolve | 3 | 0.3/0.3 | Kind, a little proud. | ✔ |
| 119 | `gb_p_gb_coming.mp3` | GB | 待て待て、オレも行く！お前らだけじゃ危なっかしくて見てられねえ。 | Wait, wait — I'm coming too! You two would never make it without me. | bluster with heart | 3 | 0/0.3 | Back to his loud self, trotting after them. | ✔ |
| 120 | `sasuke_p_sasuke_bye.mp3` | Sasuke | オレは飼い主を探しに行くよ。元気でな、ウィード！ | I'm off to find my master. Take care, Weed! | cheerful farewell | 2 | 0.2/0.4 | Bright and quick, from a distance. | ✔ |
| 121 | `narrator_p_road_1.mp3` | Narrator | 奥羽への旅は、長く険しかった。 | The road to Ōu was long and hard. | measured | 2 | 0.4/0.4 | Calm narration over a travelling shot. | ✔ |
| 122 | `narrator_p_road_2.mp3` | Narrator | 上州。人間の町のはずれで、ウィードはひとりの子犬と出会う。 | In Jōshū, at the edge of a human town, Weed met another pup. | curious | 2 | 0.2/0.6 | A little brighter: a new chapter begins. | ✔ |
| 123 | `weed_p_weed_follow_me.mp3` | Weed | こっちだ！ついてきて！ | This way! Follow me! | urgent | 4 | 0/0.2 | Running, out of breath. | ✔ |
| 124 | `gb_p_gb_this_way.mp3` | GB | 路地だ、路地に逃げ込め！ | The alley — duck into the alley! | shouting | 3 | 0/0.2 | From behind, running. | ✔ |
| 125 | `smith_p_smith_almost.mp3` | Smith | もう少しじゃ、走れ！ | Almost there — run! | urging | 3 | 0/0.2 | Breathless old soldier. | ✔ |
| 126 | `mel_p_mel_nothanks.mp3` | Mel | …別に、助けてなんて頼んでない。 | …I never asked for your help. | sullen pride | 3 | 0.4/0.4 | Young Mel: looks away, hurt and proud. Then runs off. | ✔ |
| 127 | `gb_p_gb_rude.mp3` | GB | なんだ、あの態度は。礼のひとつも言えねえのか。 | Well, isn't he charming. Not even a thank-you. | grumbling | 2 | 0.2/0.4 | Dry comic grumble. | ✔ |
| 128 | `hook_p_hook_warn.mp3` | Hook | あの子はブルーの使い走りだ。ブルーは野良をみんな泥棒扱いする。…俺の兄貴も、あいつに殺された。 | That pup runs errands for Blue. Blue treats every stray as a thief. …He killed my brother. | old grief | 4 | 0.4/0.6 | A chained dog, calm and heavy. The last sentence quiet. | ✔ |
| 129 | `weed_p_weed_save.mp3` | Weed | じゃあ、メルが危ない！僕、追いかける！ | Then Mel is in danger! I'm going after him! | determined | 4 | 0/0.2 | No hesitation at all. | ✔ |
| 130 | `smith_p_smith_wait.mp3` | Smith | ウィード、待て！ | Weed, wait! | alarmed | 4 | 0/0.3 | Shouted after him. | ✔ |
| 131 | `blue_p_blue_taunt.mp3` | Blue | 銀の息子だと？笑わせるな。奥羽の楽園なんざ、とっくに終わってるんだよ。 | Gin's son? Don't make me laugh. Ōu's paradise is already finished. | sneering | 4 | 0.3/0.3 | Big, mocking, enjoying himself. | ✔ |
| 132 | `blue_p_blue_mel.mp3` | Blue | メル！やっちまえ！ | Mel! Get him! | commanding | 4 | 0/0.2 | Barked order. | ✔ |
| 133 | `weed_p_weed_notenemy.mp3` | Weed | メル、やめて！僕は君の敵じゃない！ | Mel, stop! I'm not your enemy! | pleading | 4 | 0/0.2 | Dodging, not fighting back. Urgent but kind. | ✔ |
| 134 | `hook_p_hook_arrive.mp3` | Hook | ブルー！もう終わりだ！ | Blue! It ends here! | thunderous | 5 | 0/0.3 | He has torn his chain off to get here. Loud, final. | ✔ |
| 135 | `blue_p_blue_flee.mp3` | Blue | ちっ…！覚えてやがれ！ | Tch…! You'll regret this! | cornered | 4 | 0/0.2 | Spat out as he bolts. | ✔ |
| 136 | `weed_p_weed_blue.mp3` | Weed | ブルー！ | Blue! | horror | 5 | 0/0.2 | A scream across the road. | ✔ |
| 137 | `smith_p_smith_no.mp3` | Smith | ウィード、行くな！ | Weed, no! | terror | 5 | 0/0.1 | Torn out of him. | ✔ |
| 138 | `blue_p_blue_go.mp3` | Blue | どけ、坊主！ | Out of the way, kid! | fierce protection | 5 | 0/0.1 | Last strength, shoving the pup clear. | ✔ |
| 139 | `blue_p_blue_last.mp3` | Blue | へっ…もっと早く、お前みたいな奴に…会えてりゃな…… | Heh… if only I'd met someone like you… sooner… | quiet, honest | 5 | 1/1.4 | Lying on the asphalt. Tired, almost gentle; the sneer is gone. Fades out. | ✔ |
| 140 | `weed_p_weed_why.mp3` | Weed | どうして…どうして、僕を…… | Why… why did you save me… | devastated | 5 | 0.6/0.8 | Shaking, close to his face. Tears. | ✔ |
| 141 | `smith_p_smith_blue.mp3` | Smith | 最後に、あいつは誰かを守る方を選んだ。…覚えておけ、ウィード。 | At the end, he chose to protect someone. …Remember him, Weed. | grave, kind | 4 | 0.6/0.8 | Low and slow, a lesson that will matter later. | ✔ |
| 142 | `hook_p_hook_stay.mp3` | Hook | 俺はここに残る。誰かが、こいつを見送ってやらんとな。 | I'll stay here. Someone should see him off. | quiet dignity | 3 | 0.4/0.5 | Soft, looking down at Blue. | ✔ |
| 143 | `mel_p_mel_follow.mp3` | Mel | 待って！…一緒に行ってもいい？僕も、君みたいになりたいんだ。 | Wait! …Can I come with you? I want to be like you. | shy hope | 4 | 0.3/0.4 | He runs after them, then stops, embarrassed; the last sentence quiet and sincere. | ✔ |
| 144 | `weed_p_weed_yes.mp3` | Weed | もちろん！一緒に行こう、メル！ | Of course! Let's go together, Mel! | bright, warm | 3 | 0.2/0.4 | The first real smile since his mother. | ✔ |
| 145 | `narrator_p_end_1.mp3` | Narrator | こうして、ウィードという小さな子犬は、まだ見ぬ父の待つ奥羽へと歩き続けた。 | And so a small pup named Weed walked on toward Ōu, toward a father he had never met. | warm, hopeful | 3 | 0.6/0.6 | Gentle storytelling over a dusk walking shot. | ✔ |
| 146 | `narrator_p_end_2.mp3` | Narrator | だが、奥羽では…怪物が待っていた。 | But in Ōu… a monster was waiting. | dread | 4 | 0.4/1 | Darker, slower; let "怪物" land. | ✔ |
| 147 | `weed_p_weed_bark.mp3` | Weed | ワン！ | [Bark!] | tiny fierce bark | 2 | 0/0 | A pup's high bark. | ✔ |
| 148 | `tosa_p_tosa_growl.mp3` | Tosa | グルルル… | [Growl] | menace | 3 | 0/0 | Low rumbling growl. | ✔ |
| 149 | `blue_p_blue_growl.mp3` | Blue | グルル… | [Growl] | menace | 3 | 0/0 | Low growl, teeth bared. | ✔ |

## Tips for ElevenLabs (Japanese TTS)

- Use a multilingual model (e.g. eleven_multilingual_v2 / v3) and one consistent voice per character (see profiles).
- Put the *direction* into the voice settings: lower stability (≈0.3–0.45) for emotional lines (intensity 4–5), higher (≈0.6) for calm narration.
- Ellipses (…) and 「、」 produce natural pauses; keep them. Do not add English words.
- Kaibutsu: use sound effects or a heavily pitched-down voice; keep its final whimper small and fragile.
