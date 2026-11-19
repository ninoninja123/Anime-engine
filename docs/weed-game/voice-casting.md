# Weed fan game – voice casting (ElevenLabs, eleven_v3, Japanese)

All lines are generated with **eleven_v3** (audio tags such as `[whispers]`, `[shouting]`, `[trembling voice]`)
from `weed-game/src/data/lines.js` (`ja` text unchanged; only pauses `…`/`、` and tags added from
`emotion` / `direction` / `intensity`). Files: `weed-game/public/audio/voice/<who>_<id>.mp3`
(not committed – `public/audio/` is gitignored; they ship with the Cloudflare deploy).
ElevenLabs flow with every take: "GDW voices" (`3wWrxUuLnB016Km9TduO`).

| Character | Voice (source) | voice_id | Why |
|---|---|---|---|
| Weed (`weed`) | chinyaku – Cute Japanese Voice Actress (library; young female VA doing a boyish shōnen voice, as anime often does) | `eymz1ANTJnON6eFsgi2l` | User feedback: the first pick (Minto, young adult male) sounded too old for a small pup. All Weed lines regenerated with `[young boyish voice]`; no pitch shift needed. (Designing a child voice is not done – the voice-design filter blocks it.) |
| Mel (`mel`) | Minto – Bright & Expressive Japanese Male (library) | `lfG6BR3yQRoBrnUm4Z8N` | Bright, kind, youthful male voice (freed when Weed was recast). |
| GB (`gb`) | Osaka Merchant (library) | `SRGeXsAWeS1nnZprxhmm` | Lively, comedic, theatrical middle-aged male with Kansai merchant rhythm: boastful but warm. |
| Sakura (`sakura`) | Chihiro – Elegant Female Narrator (library) | `vsOHlw2syHreLeo0GXA1` | Calm, warm, mature, dignified female voice for the dying mother. |
| Nero (`nero`) | PiropiroRX – Anime attractive male (library) | `YkUoVuNq2782tso28g8Q` | Husky, gravelly 50s male: a lazy, menacing drawl. |
| Sasuke (`sasuke`) | Masaki – Young & Bright (library) | `WgK8RclhnOEJ7ks32p7h` | Light, boyish young voice with `[high voice]` for the comic Shiba. |
| Hook (`hook`) | Yuya – Deep, Warm Japanese Narrator (library) | `Zhy8a4lYlr7RVxcnOsK9` | Deep, warm, slightly husky baritone: steady, with grief underneath. |
| Blue (`blue`) | odanobuVT – Joker & Prankster (library) | `QPtBgsg1dxKTQHNpHrHt` | Bad-boy, sneering middle-aged male; also does the quiet last line. |
| Tosa (`tosa`) | Kai Sundiata – Deep & Calm (library) + pitch-down | `xKeMLfDPjf359YMncl2C` | Very deep, slow voice; processed ~1.6 semitones down (asetrate 0.91) for the huge watchdog. |
| Smith (`smith`) | **GDW – Smith** (designed, eleven_ttv_v3) | `TmIygVjGNYtmtUCz6yku` | Designed: elderly man (60s), low gravelly husky, warm, fatherly, slow. Library had no old gravelly Japanese voice with warmth. Preview 1 of 3 kept. |
| Jerome (`jerome`) | Ryu – Samurai Voice (library) | `D3L9PtKnIVJXdgK444Ey` | Deep, serious, controlled baritone with power for the one big shout (arrows_fourth). |
| Ken (`ken`) | Ishibashi – Strong Japanese Male (library) | `Mv8AjrYZCBkdsmDHNwcB` | Deep, strong, rough young male – brash big dog. |
| Kagetora (`kagetora`) | Nayuta – Dark Anime Hero (library) | `ZcX76PwFSkrkyI78RBTK` | Sharp, cool, edgy and a bit higher/lighter than Ken; proud, clipped. |
| Robert (`robert`) | REI (library) | `A8vsSyy1xmJQkBgZacW0` | Calm, quiet young anime male – soft-spoken soldier. |
| Rocker (`rocker`) | Shimura – Husky voice (library) | `3U6tYxUqUpcplL5Qep78` | Slightly hoarse/raspy – wry, fearless. |
| Heuler (`heuler`) | Akira – Charismatic Japanese Male (library) | `DOL4zlUH4vnnX1hByxsw` | Warm, approachable tenor-baritone – the heart of the squad. |
| Narrator (`narrator`) | Satoru – Deep, Composed Japanese Voice (library; trailer/film narrator) | `kOPshPH6L1cDKhcEL9ro` | Recast after user feedback (Kuro was too flat and got lost under the music). Tested 3 voices on one dramatic line (Satoru, Kuro `UUpoAQhpz37lNIWNVLoF`, Akio `eRD4wLHoHH7P30TZIexm`): Satoru had the widest dynamic range (LRA 9.2 vs 8.3 / 4.4) and the most epic delivery. All 23 narrator lines regenerated with 2 takes each; the more dynamic take (higher LRA) is used. Processing: 90 Hz high-pass, light compression (2.5:1), +2.5 dB at 3 kHz, tempo 1.2, 150 ms tail, about -15…-17 LUFS, true peak at most -1.3 dB. |
| Kaibutsu / P4 (`kaibutsu`) | Papazon – Japanese Villain (library) + pitch-down | `2UGDsJpBJAiAlF0jQQ7x` | Only the spoken line `kaibutsu_speak` (deep, rasping; processed ~2.6 semitones down, slower, low-passed). Roars and the whimper stay as sound effects (`sfx.roar`), no TTS. |

## Names
In the TTS prompts names are written in Latin letters inside the Japanese sentence (Weed, Smith, Jerome, Ken, Kagetora,
Robert, Rocker, Heuler, North, Gin, GB, Sakura, Blue, Nero, Sasuke, Hook, Mel, Ōu, Gohei, Daisuke, Akakabuto, Futago Pass, Gajō) so they get English pronunciation;
`lines.js` keeps the kana (subtitles unchanged).

## Processing (tools script, scratchpad)
Tempo: atempo 1.2 for everyone (narrator too, since the recast), Smith 1.15 (user feedback: too slow). Trim -45 dB, 40 ms kept.
Mono 44.1 kHz 80 kbps mp3; silence trimmed at both ends (-50 dB), 20 ms fades, gain to ≈ -16 LUFS integrated with a
-1.5 dBTP limiter (quiet whisper lines end up ≈ -18…-20 LUFS because of the peak limit – natural dynamics).
Critical intensity 4–5 lines were generated as 2 takes; take A used except `weed_sac_scream`, `jerome_arrows_fourth`,
`jerome_post_follow` (take B: louder/rawer or longer breath).

## Re-cast / regenerate
To swap a voice: pick a new voice_id, regenerate that character's lines with the same tags (prompts are in the flow
history), process, then `npm run voices`.
