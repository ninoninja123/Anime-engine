# Weed fan game – voice casting (ElevenLabs, eleven_v3, Japanese)

All lines are generated with **eleven_v3** (audio tags such as `[whispers]`, `[shouting]`, `[trembling voice]`)
from `weed-game/src/data/lines.js` (`ja` text unchanged; only pauses `…`/`、` and tags added from
`emotion` / `direction` / `intensity`). Files: `weed-game/public/audio/voice/<who>_<id>.mp3`
(not committed – `public/audio/` is gitignored; they ship with the Cloudflare deploy).
ElevenLabs flow with every take: "GDW voices" (`3wWrxUuLnB016Km9TduO`).

| Character | Voice (source) | voice_id | Why |
|---|---|---|---|
| Weed (`weed`) | chinyaku – Cute Japanese Voice Actress (library; young female VA doing a boyish shōnen voice, as anime often does) | `eymz1ANTJnON6eFsgi2l` | User feedback: the first pick (Minto, young adult male) sounded too old for a small pup. All Weed lines regenerated with `[young boyish voice]`; no pitch shift needed. (Designing a child voice is not done – the voice-design filter blocks it.) |
| Smith (`smith`) | **GDW – Smith** (designed, eleven_ttv_v3) | `TmIygVjGNYtmtUCz6yku` | Designed: elderly man (60s), low gravelly husky, warm, fatherly, slow. Library had no old gravelly Japanese voice with warmth. Preview 1 of 3 kept. |
| Jerome (`jerome`) | Ryu – Samurai Voice (library) | `D3L9PtKnIVJXdgK444Ey` | Deep, serious, controlled baritone with power for the one big shout (arrows_fourth). |
| Ken (`ken`) | Ishibashi – Strong Japanese Male (library) | `Mv8AjrYZCBkdsmDHNwcB` | Deep, strong, rough young male – brash big dog. |
| Kagetora (`kagetora`) | Nayuta – Dark Anime Hero (library) | `ZcX76PwFSkrkyI78RBTK` | Sharp, cool, edgy and a bit higher/lighter than Ken; proud, clipped. |
| Robert (`robert`) | REI (library) | `A8vsSyy1xmJQkBgZacW0` | Calm, quiet young anime male – soft-spoken soldier. |
| Rocker (`rocker`) | Shimura – Husky voice (library) | `3U6tYxUqUpcplL5Qep78` | Slightly hoarse/raspy – wry, fearless. |
| Heuler (`heuler`) | Akira – Charismatic Japanese Male (library) | `DOL4zlUH4vnnX1hByxsw` | Warm, approachable tenor-baritone – the heart of the squad. |
| Narrator (`narrator`) | Kuro – Mature Anime Gentleman (library) | `UUpoAQhpz37lNIWNVLoF` | Calm, mature, warm low voice made for narration and emotional scenes. |
| Kaibutsu / P4 (`kaibutsu`) | Papazon – Japanese Villain (library) + pitch-down | `2UGDsJpBJAiAlF0jQQ7x` | Only the spoken line `kaibutsu_speak` (deep, rasping; processed ~2.6 semitones down, slower, low-passed). Roars and the whimper stay as sound effects (`sfx.roar`), no TTS. |

## Names
In the TTS prompts names are written in Latin letters inside the Japanese sentence (Weed, Smith, Jerome, Ken, Kagetora,
Robert, Rocker, Heuler, North, Gin, Gohei, Daisuke, Akakabuto, Futago Pass, Gajō) so they get English pronunciation;
`lines.js` keeps the kana (subtitles unchanged).

## Processing (tools script, scratchpad)
Tempo: atempo 1.2 for everyone, narrator 1.3, Smith 1.15 (user feedback: too slow). Trim -45 dB, 40 ms kept.
Mono 44.1 kHz 80 kbps mp3; silence trimmed at both ends (-50 dB), 20 ms fades, gain to ≈ -16 LUFS integrated with a
-1.5 dBTP limiter (quiet whisper lines end up ≈ -18…-20 LUFS because of the peak limit – natural dynamics).
Critical intensity 4–5 lines were generated as 2 takes; take A used except `weed_sac_scream`, `jerome_arrows_fourth`,
`jerome_post_follow` (take B: louder/rawer or longer breath).

## Re-cast / regenerate
To swap a voice: pick a new voice_id, regenerate that character's lines with the same tags (prompts are in the flow
history), process, then `npm run voices`.
