# LEAN: token-säästävä työnkulku (1 sivu)

**Sääntö:** kulu ≈ työkalukutsut × kontekstin koko. Jokainen kutsu lähettää koko keskustelun uudelleen (luetut tiedostot, kuvat, tulosteet).
→ vähän, isoja kutsuja · pienet tulosteet · ei kokonaisia isoja tiedostoja · vähän kuvia · tuore agentti per vaihe · uusi chatti per video.

## Budjetit (kaikki agentit + kapteeni)
| Video | Vaiheet | Katto | Vertailu (toteutunut) |
|---|---|---|---|
| Thumbnail | kapteeni/1 agentti | 60k | – |
| Korjaus (pyydetty) | 1 uusi agentti | 150k | – |
| 1 min testi | 1 putki | 350k | Benimaru 1 min 0,34 M |
| 2 min 1v1 | 1 putki | 550k | Benimaru 2 min 0,7 M |
| 3 min 1v1 | script → putki | 700k | LvN 1,5 M (3 agenttia) |
| 5–7 min mind game | script → ääni ‖ kuva | 1,0 M | Last Hand 1,06 M, Cheapest Life 1,0 M, Eight Strings 2–3 M, 3v3 3,65 M |
Vaihekatot: script 200k · ääni 300k · kuva/tuotanto 450k · kapteeni 80k.

## Vaiheet
1. **Script** (vain mind game / juonivideo): script.md + salainen tiedosto, repliikkitaulukko `id|who|ja|en|tags`, shot-outline, twist-taulukko. Ei koodia.
2. **Ääni** (rinnakkain kuvan kanssa): ElevenLabs-scene-takes → `voice_cut.py` → timing → Epidemic musiikki/SFX → `mix_from_timeline.py` → `loudness.sh --aac`.
3. **Kuva/tuotanto**: kopioitu moottori, shots.js, 1 esikatselu 320 px avainkohdista, 1 lopullinen render, `subs_from_timing.py`, build.
Taistelut ≤ 3 min: yksi putkiagentti tekee 2+3 (LvN-malli, paras tulos).

## Briefit
Max 1 sivu, pohja: `.claude/skills/anime-captain-lean/SKILL.md` §4. Aina: TOKEN CAP, READ ONLY -lista, "käytä tools/lean", "ei uudelleenrenderöintiä", raportti ≤ 12 riviä.

## Työkalut (`tools/lean/`, `--help`; testi: `bash tools/lean/selftest.sh`)
| Työkalu | Tekee | Tuloste |
|---|---|---|
| `contact_sheet.sh` | ruudukko joka N s, aikaleima | 1 jpg |
| `shot_stats.py` | shottipituudet, histogrammi, mediaani, lyhyimmät, shake/impact/smear/flash per min (shots.js tai JSON) | 1 JSON-rivi |
| `twist_coverage.py` | twistit/tagit/aikapisteet (± offsetit) yhdelle arkille | 1 jpg |
| `mix_from_timeline.py` | timeline (rivit, musiikki-cuet, SFX-cuet) → film_mix.wav, −14 LUFS, TP-limitteri, raportti | 1 JSON-rivi |
| `loudness.sh` | LUFS/TP/LRA, `--aac` mittaa AAC-koodauksen jälkeen | 1 JSON-rivi |
| `subs_from_timing.py` | .ass: näkyy vain puheen ajan (ei +0,15 s), max 2 riviä, MarginV ≥ 55, JA-fontti, burn-komento | 1 rivi |
| `voice_cut.py` | TTS-takejen leikkaus riveiksi (Whisper, ja/en), ei kompressointia | LOW-rivit + yhteenveto |
| `cjk_check.sh` | japani/kiina-merkit koodissa, ruudulle piirtyvät rivit erikseen | lyhyt lista |
| `thumbnail_compose.py` | 1–4 kuvaa/framea + otsikko ääriviivalla, CJK-fontti | 1 jpg |
| `disk_cleanup.sh` | frames/tmp/vanhat mp4:t; kuiva-ajo; ei poista jos render käynnissä | koot |

## Jatko uudessa chatissa
`docs/STATE_TEMPLATE.md` → projektin `STATE.md` (< 60 riviä). Uusi chatti lukee START_HERE.md + STATE.md, ei mitään muuta ennen tarvetta.
