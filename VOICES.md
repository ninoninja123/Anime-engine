# Voice bank (ElevenLabs) — what worked, what the user liked
Look voices up by NAME with `creative_list_voices` (IDs are not stored here). Reuse a voice from this list before searching for new ones.
Speech is allowed when the video needs it (user decision); music and SFX always from Epidemic Sound (`docs/AUDIO_CATALOG.md`).

## User-approved
- **"Satoru – Deep, Composed"** (Japanese, eleven_v4; THE HOUSE in *The Last Hand*, the Auctioneer in *The Cheapest Life*): the user's favourite performance ("sounded exactly like Minato"). Use it for a calm, noble/leader/hero/host character (Minato-type, dignified narrator, game master).

## Full cast table (JA = Japanese eleven_v4 unless noted)
| character | voice (name in library) | used in | feedback |
|---|---|---|---|
| House / Auctioneer / game master | Satoru – Deep, Composed | Last Hand, Cheapest Life | **favourite** |
| Dazai | Akira – Charismatic | Last Hand, Cheapest Life | ok |
| Ranpo | Minto – Bright & Expressive | Last Hand, Cheapest Life | ok |
| Senku | Taka – Bright & Friendly | Last Hand, Cheapest Life | ok |
| Urahara | odanobuVT – Joker & Prankster | Last Hand, Cheapest Life | ok |
| Aizen | sawaro | Last Hand, Cheapest Life | ok |
| Gowther | Kei – Light, androgynous (Last Hand) → **Aki (young female, calm)** (Cheapest Life) | | user: Gowther must sound MORE FEMININE → use Aki |
| Kakashi | Shimura – Husky | Last Hand | ok |
| Orochimaru | Kou Sudo – Calm & Neutral (not hissing) | Last Hand | ok |
| Katagiri (Yuuichi) | Ryou Kasukabe | Cheapest Life | – |
| Koro-sensei | MINORU – The Storyteller | Cheapest Life | – |
| Benimaru | Nayuta (Dark Anime Hero) | Benimaru vs Yami | – |
| Yami | PiropiroRX | Benimaru vs Yami | – |
| Zaraki | Ryu Samurai | tests | – |
| Shō | Kou Sudo | Fire Force vs Black Clover tests | – |
| Eight Strings (EN, eleven_v3) | Maestro = Medraut – Theatrical Villain; Lelouch = Posh Josh; L = Rai; Joker = Silas – Weathered Villain; Mayuri = Dr. Von Fusion – VF; Itachi = Kryuu – Male Protagonist; Yumeko = Lyan – Soft, intimate; Dazai = Andrew – Clear & Intelligent; Meruem = Joe – Deep Voice Evil Villain | Eight Strings | v3 = flat; prefer v4 JA |
| Luffy / Naruto / Kurama | Gemini TTS Puck / Fenrir / Algenib (multi-speaker requests) | Luffy vs Naruto (best fight) | good energy: "top seiyuu, real breaths, laughs and shouts" |
Rejected: all free local TTS (Kokoro, Piper, ChatterBox) and flat ElevenLabs v3 one-line-at-a-time reads (3 worst videos used v3).

## Casting rule (user): the voice must FIT the character
- Match gender/age/temperament to the character's anime voice; Gowther = feminine. Listen to ONE sample line before generating a whole scene.

## ElevenLabs v4 recipe (scene takes)
1. One request per scene and speaker: `{who, takes: 2–3, lines: [[id, "[tag] 台詞"], …]}` (see `the-cheapest-life/audio/prompts.json`). 1–2 strong tags per line: `[deep voice] [slowly]`, `[cold]`, `[playful]`, `[shouts]`, `[whispers]`, `[pause]`.
2. **Key lines (hooks, twists, verdicts) = their own SHORT takes, the key line FIRST**, 2–3 takes, then pick by listening. Long multi-line takes drift.
3. Cut with `tools/lean/voice_cut.py --dir audio --lang ja` (Whisper check, no compression, no tempo change) → measure durations BEFORE locking shots; mark `optional` lines to drop first.
4. Japanese speech + English subtitles (`subs_from_timing.py`); speech ≤ ~50 % of runtime, music audible under it (3–4 dB ducking).

## The "Minato" line — exact recipe
Line L01 of *The Last Hand*, THE HOUSE: 「[deep voice] [slowly] ジョーカーを持つ者が、死ぬ。」 — Satoru – Deep, Composed, eleven_v4, Japanese, the FIRST line of a fresh scene take. Same recipe reused for *The Cheapest Life* L01 「[deep voice] [slowly] 君のいのちは、いくらだ。」 (3 takes, picked t3).
Later lines of a long take with other tags ([formal], [dramatically], [flat]) sounded less special → hero lines as their own short takes.

## Quota (credits)
- Spent per video: ~3 800–6 800 credits (Benimaru/3v3 phases ~3 400; Last Hand / Cheapest Life mind games at the top end). Check `account_get_usage` before the voice phase; if the quota cannot cover the script, cut lines (optional first) or ask the user — never fall back to local TTS.
- Do not re-generate a whole scene for one bad line: regenerate only that line as a short take.
