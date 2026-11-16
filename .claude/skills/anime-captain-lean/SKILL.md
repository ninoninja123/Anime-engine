---
name: anime-captain-lean
description: Kevyt (token-säästävä) kapteenin työnkulku koodilla piirrettyihin anime-videoihin. Käytä AINA kun käyttäjä pyytää animevideota, death battlea, mind gamea, genius battlea, taistelua "X vs Y", testivideota tai thumbnailia. Lean captain workflow for code-drawn anime videos (death battle, mind game, thumbnail): new chat per video, max 3 phases, hard token caps, ready-made tools in anime-engine/tools/lean instead of rewriting them.
---

Ensisijainen: anime-saasto (`.claude/skills/anime-saasto/SKILL.md`) – aloita siitä; tämä skill on taustaa.

# Anime-kapteeni: KEVYT työnkulku (token-katot)

Miksi: jokainen työkalukutsu lähettää koko kontekstin uudelleen → kulu ≈ (kutsujen määrä) × (kontekstin koko).
Toteutuneet: 3v3 7 vaihetta 3,65 M · Eight Strings 2–3 M · LvN 3 agenttia 1,5 M · The Last Hand 1,06 M · Cheapest Life 1,0 M · Benimaru 1 min 0,34 M / 2 min 0,7 M.
Tavoite: sama laatu ~35–60 % pienemmällä kulutuksella. Laatusäännöt ovat ennallaan (anime-video-captain-skill, LESSONS.md): tämä skill koskee VAIN työtapaa.

## 1. Kapteenin aloitus (uusi chatti per video)
1. `cd /home/user && (git -C anime-engine pull -q || git clone --depth 1 https://github.com/ninoninja123/Anime-engine anime-engine)`
2. Lue VAIN `anime-engine/START_HERE.md` + projektin `STATE.md` (jos jatkat; pohja `docs/STATE_TEMPLATE.md`) + `docs/LEAN.md`.
   LESSONS/VOICES/ASSETS: ÄLÄ lue kokonaan → `grep -n '^## ' LESSONS.md` ja lue vain tähän videoon liittyvä osio (offset/limit). Agentit lukevat itse.
3. Kirjoita `STATE.md` (< 60 riviä) heti kun pari/aihe on selvä. Jatkochatti alkaa siitä, ei vanhasta keskustelusta.

## 2. Vaiheet: enintään 3 agenttia, yksi agentti per vaihe
| Videotyyppi | Vaiheet | Kokonaiskatto (kaikki agentit + kapteeni) |
|---|---|---|
| Thumbnail / still | 1 agentti tai kapteeni itse (`thumbnail_compose.py`) | ≤ 60k |
| Korjauskierros (vain jos käyttäjä pyytää) | 1 uusi agentti STATE.md:llä | ≤ 150k |
| 1 min testi | 1 putki (yksi agentti: kuva+ääni+build) | ≤ 350k |
| 2 min 1v1 | 1 putki | ≤ 550k |
| 3 min 1v1 taistelu (death battle) | script → tuotanto (1 putki, sisältää äänen) | ≤ 700k |
| 5–7 min mind game (puhe, 4–8 hahmoa) | script → ääni ‖ kuva (rinnakkain) | ≤ 1,0 M |
Vaihekatot: script ≤ 200k · ääni ≤ 300k · tuotanto/kuva ≤ 450k · kapteeni ≤ 80k per video.
Kirjoita katto jokaiseen briefiin. Jos agentti arvioi ylittävänsä katon → se pysähtyy, kirjoittaa status.md:n ja raportoi (ei jatka sokkona).

## 3. Valmiit työkalut (`anime-engine/tools/lean/`, kaikissa `--help`, pienet JSON-tulosteet; `selftest.sh` testaa kaikki ~10 s)
| Tarve | Työkalu |
|---|---|
| Kontaktiarkki | `contact_sheet.sh VIDEO 10 4 320 sheet.jpg` |
| Rytmi datasta (ei kuvia) | `shot_stats.py shots.js|timeline.json` |
| Twist/klue-kohdat yhdelle arkille | `twist_coverage.py VIDEO timeline.json [--tags REGEX|--at T1=12.3]` |
| Miksaus aikajanasta | `mix_from_timeline.py --timeline … --lines-dir … --music-plan … --sfx-map …` (−14 LUFS, TP-limitteri) |
| LUFS/TP AAC:n jälkeen | `loudness.sh FILE --aac` |
| Tekstitykset | `subs_from_timing.py timeline.json --text lines.json --names [--lang ja] --video in.mp4` |
| Puheen leikkaus | `voice_cut.py --dir audio --lang ja|en` |
| Japani/kiina ruudulla? | `cjk_check.sh [--allow REGEX] engine/ showdown/` |
| Thumbnail | `thumbnail_compose.py out.jpg a.mp4@12 b.mp4@40 --title 'X VS Y'` |
| Levytila | `disk_cleanup.sh PROJECT` (kuiva-ajo; `--yes` poistaa; ei koske käynnissä olevaan renderiin) |
Moottori: kopioi edellisen hyvän projektin moottori (LvN/GvI2 3D-putki tai Last Hand/Cheapest Life 2D-elokuvamoottori) — ÄLÄ kirjoita moottoria, mikseriä, tekstitystä tai buildia uudelleen. Puuttuva ominaisuus = pieni lisäys olemassa olevaan tiedostoon.

## 4. Briefipohjat (max 1 sivu, kopioi ja täytä)
```
ROLE: <script|audio|production|pipeline> agent, <VIDEO>. GOAL: <1 lause>. TOKEN CAP: <N>k (stop + status.md if you will exceed).
READ ONLY: STATE.md, <script/secret path>, LESSONS.md section "<otsikko>" (Grep), tools/lean --help. Never Read files > 300 lines whole.
USE TOOLS: anime-engine/tools/lean/* (do not rewrite them). ENGINE: copy <project path> (no mp4/frames).
CONTENT: <hahmot, pituus, oma tyyli: paletti/kamera/rytmi/musiikki>.
MUST: <3–6 videokohtaista sääntöä>.  MUST NOT: re-render, >3 contact sheets, reopen an image, poll in tiny steps, long logs in context.
SELF-CHECK: shot_stats.py, 1 contact sheet 320 px, 1 twist/hit sheet, close-ups of signature features (1 sheet), loudness.sh --aac.
DELIVER: <out path>; status.md (< 40 lines); commit+push; report ≤ 12 lines (Finnish): path, duration, size, LUFS/TP, weaknesses, tokens.
```
Script-agentti: lisää "Write script.md + secret; dialogue table id|who|ja|en|tags; shot outline; twist table setup→payoff; no code."
Ääniagentti: "ElevenLabs v4 scene takes → voice_cut.py → timing.json; Epidemic music/SFX by search (1–2 searches per cue) → mix_from_timeline.py."
Tuotanto/putki: "shots.js from script; ONE preview at 320 px of 3 key moments, then ONE final render; build with subs_from_timing.py + loudness.sh."

## 5. Tarkistuslista (kapteeni, ennen lähetystä)
- [ ] Agentin raportti ≤ 12 riviä; tokenit kirjattu STATE.md:hen (vaihe → k-tokenit).
- [ ] Kapteeni katsoo enintään 2 kuvaa: 1 kontaktiarkki + 1 twist/hit-arkki (320 px). Ei samaa kuvaa kahdesti.
- [ ] Numerot työkaluista: `shot_stats.py`, `loudness.sh --aac` (I −14 ± 0,5, TP < −1), koko ≤ 28 MB.
- [ ] `cjk_check.sh` jos käyttäjä ei halua japanilaista tekstiä ruudulle.
- [ ] `disk_cleanup.sh PROJECT --yes` toimituksen jälkeen (ei kesken renderin).
- [ ] Lähetys + lyhyt rehellinen raportti suomeksi, ei spoilereita.

## 6. EI NÄIN (suurimmat tokenisyöpöt)
- Ei uudelleenrenderöintejä: esikatselu 320 px vain avainkohdista, sitten yksi lopullinen render.
- Ei isoja tiedostoja kokonaan (API.md, shots.js, LESSONS.md, lokit): Grep / offset+limit / `| tail -5`.
- Ei saman kuvan avaamista uudelleen; max 3 arkkia per agentti, 2 kapteenille.
- Ei pitkän agentin herättämistä (SendMessage vanhaan agenttiin raahaa koko vanhan kontekstin) → uusi agentti + status.md.
- Ei yli 3 vaihetta, ei näytös-kerrallaan-pilkkomista, ei likeness-labia ilman käyttäjän pyyntöä.
- Ei moottorin/mikserin/tekstitysten uudelleenkirjoitusta; ei uusia "analyysi"-työkaluja kun valmis löytyy.
- Ei korjauskierrosta palautteesta ilman käyttäjän pyyntöä (kirjaa LESSONS.md:hen `cat >>`, kysy).
- Ei pitkää pääsessiota: kun video on toimitettu, kirjoita STATE.md ja ehdota uutta chattia seuraavalle videolle.
