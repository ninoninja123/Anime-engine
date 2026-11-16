---
name: anime-saasto
description: "Anime säästö: ENSISIJAINEN käynnistyspaketti koodilla piirrettyihin animevideoihin – nopein ja tokenisäästävin tapa. Käytä AINA kun käyttäjä pyytää animea, animevideota, death battlea, taistelua X vs Y, mind gamea, genius battlea, thumbnailia/kansikuvaa tai korjausta animevideoon. Valmiit moottorit (docs/ENGINES.md), yhden komennon projektin luonti (tools/saasto/new_project.sh), valmiit hahmot, musiikki/SFX-katalogi, äänipankki, laatuportti ja agenttibriefit token-katoilla – ei uudelleen etsimistä. Anime video starter kit (death battle, mind game, genius battle, X vs Y, thumbnail), saving tokens."
---

# anime-saasto: AVAA TÄMÄ → tee video ilman uudelleentutkimista
Käyttäjä on suomenkielinen. Sinä olet KAPTEENI (≤ 80k tokenia): delegoit, tarkistat, raportoit. Polut: `A=/home/user/anime-engine`, privaatti `/home/user/privaatti`.
Vanhat skillit `anime-captain-lean` ja `anime-video-captain` ovat taustaa; tämä korvaa niiden aloituksen.

## 7 askelta
1. **Pull:** `cd /home/user && (git -C anime-engine pull -q --rebase || git clone --depth 1 https://github.com/ninoninja123/Anime-engine anime-engine)`
2. **Lue vain:** `$A/docs/QUALITY_GATE.md` (1,5 s) + `$A/docs/ENGINES.md` → vain oman tyypin rivi/osio (`grep -n` + offset). Jatkoprojektissa lisäksi projektin `STATE.md`. EI muuta.
3. **Luo projekti:** `bash $A/tools/saasto/new_project.sh <tyyppi> <nimi>` (`--dry-run` ensin jos epävarma). Tyypit: `taistelu3d` (LvN, paras) · `taistelu3d-by` · `taistelu3d-lib` · `mindgame` (Cheapest Life, uusin) · `mindgame-sc` (Seven Chairs, paras) · `mindgame-lh` · `mindgame3d` · `taistelu2d` · `kansikuva`.
4. **Kopioi briefit:** `$A/docs/BRIEFS/{script,audio,render,cover,fix}.md` + `_COMMON.md` → täytä `{{MUUTTUJAT}}` (VIDEO, PROJECT, TYPE, CHARACTERS, LENGTH, CAST_MAP, CHAR_SOURCES). Hahmot `docs/CHARACTERS_BUILT.md`, äänet `VOICES.md`, musiikki/SFX `docs/AUDIO_CATALOG.md` → kirjoita valinnat suoraan briefiin (agentti ei hae niitä uudelleen).
5. **Delegoi (max 3 vaihetta, tuore agentti per vaihe, Opus):** ks. reseptit alla. Agentti pysähtyy katossa ja kirjoittaa `status.md`.
6. **Tarkista** `tools/lean/*`-työkaluilla (QUALITY_GATE-tarkistuslista): `shot_stats.py`, `loudness.sh --aac`, `cjk_check.sh`, 1 kontaktiarkki + 1 twist-arkki (kapteeni max 2 kuvaa).
7. **Toimita + kirjaa:** video (≤ 28 MB) + raportti ≤ 12 riviä ilman spoilereita → `STATE.md` (tokenit, palaute) → palaute `LESSONS.md`:hen (`cat >>`), uudet äänet/raidat/hahmot katalogeihin. Ehdota uutta chattia seuraavalle videolle.

## Reseptit (5 riviä)
**Taistelu 3D (death battle, X vs Y, 2–3 min) — katto 700k**
1. `new_project.sh taistelu3d <x-vs-y>`; hahmot CHARACTERS_BUILT (kopioi `make*`/`M3.*`/`M8.*` + head2d).
2. Script-agentti (script.md, 150k): kyvyt, 2–3 käännettä sääntöjen leikkauksista, koukku 0–15 s, todennäköisin voittaja. Käyttäjä hyväksyy tekstinä.
3. Putkiagentti (render.md + audio.md yhdessä, 550k): poset → shots.js → 1 esikatselu + 1 lähikuva-arkki → 1 render → miksaus → build.
4. Musiikki: Kigan/Ferocious Fire/LvN-raidat katalogista; SFX LvN-kirjasto; puhe vain jos tarvitaan (JA v4 + EN-tekstit).
5. Kapteeni: QUALITY_GATE-lista, 2 kuvaa, toimitus.
**Taistelu 2D — katto 600k** (vain jos käyttäjä pyytää 2D): `new_project.sh taistelu2d <nimi>`; Yami vs Shanks -resepti (efektit + siluetit + kamera, ANIME-pass, vähän puhetta); muuten kuten 3D.
**Mind game / genius battle (5–7 min, puhe) — katto 1,0 M**
1. `new_project.sh mindgame <nimi>` (Cheapest Life -moottori; Seven Chairs -tyyli = suosikki). 2D-hahmot valmiina `cast*.js`:ssä.
2. Script (200k): jokainen signature-kyky ajaa twistiä, yhden lauseen testi, finaali = twistien twisti (2–3 kumoavaa paljastusta, voitto älykkäin kerros), ≤ 30 repliikkiä / 3 min, ei Dazai-voittoa toistona.
3. Ääni (300k) ‖ kuva (450k) rinnakkain: v4-scene-takes (Satoru = isäntä), Moonlight/Satie/Mozart (Mira Ma), vaihto vain twistissä.
4. Build `tools/build_final.sh` (subs vain puheen ajan, −14 LUFS, ≤ 27,2 MB). `tools/make_lines.py` ennen renderiä.
5. Kapteeni: twist-arkki + yhden lauseen testit STATE.md:hen.
**Kansikuva — katto 60k** (kapteeni itse tai cover.md): `new_project.sh kansikuva <nimi>` → `contact_sheet.sh` (katso kerran) → `thumbnail_compose.py out.jpg v.mp4@T1 v.mp4@T2 --title 'X VS Y'`. Englanti, ei spoileria, kasvot tunnistettavat.
**Korjaus — katto 150k, VAIN käyttäjän pyynnöstä** (pelkkä palaute → kirjaa + kysy): fix.md, uusi agentti STATE.md:llä, vain pyydetyt kohdat, `r.sh redo` / osarender, ääni-korjaus = remux `-c:v copy`, yksi `_v2`.

## Token-katot (kaikki agentit + kapteeni)
| video | vaiheet | katto | vertailu (toteutunut ennen pakettia) |
|---|---|---|---|
| kansikuva | kapteeni | 60k | – |
| korjaus | 1 agentti | 150k | – |
| 1–2 min testi | 1 putki | 350–550k | Benimaru 0,34 / 0,7 M |
| 3 min taistelu | script → putki | 700k | LvN 1,5 M, 3v3 3,65 M |
| 5–7 min mind game | script → ääni ‖ kuva | 1,0 M | Last Hand 1,06 M, Eight Strings 2–3 M |
Vaihekatot: script 150–200k · ääni 300k · kuva 450k · putki 550k · kapteeni 80k. Kirjoita katto jokaiseen briefiin.

## Mitä paketti säästää (mitattu tämän paketin rakentamisesta 2026-11-16)
- Moottorin etsintä/kopiointi: ~25 työkalukutsua (haarat, worktreet, README:t, render/build-skriptit, excludet) → **1 komento** (`new_project.sh`, mind game ~1 s, 0,5 MB; 3D ~40 MB + symlinkit).
- Hahmot: ~10 tiedostoluentaa (appearance.json ×3, characters_done, chars*.js/cast*.js-grepit) → 1 taulukko; 35 valmista hahmoa kopioitavissa.
- Musiikki/SFX: ~10 luentaa (music_plan, sfx_map, credits, sfx_catalog) + tyypillisesti 10–30 Epidemic-hakua per video → lataus suoraan ID:llä.
- Säännöt: LESSONS.md 151 riviä + 4 START_HERE/README:tä → QUALITY_GATE 1,5 sivua.
- Arvio: 40–60 työkalukutsua vähemmän per video × 50–150k konteksti ≈ **0,3–0,6 M tokenia säästöä per video** (~30–50 %).

## EI NÄIN
Ei moottorin/mikserin/tekstitysten uudelleenkirjoitusta · ei kokonaisia isoja tiedostoja (API.md, LESSONS.md, shots.js) · ei uudelleenrenderöintiä (1 esikatselu + 1 lopullinen) · ei SendMessagea vanhaan pitkään agenttiin (uusi agentti + status.md) · ei samaa kuvaa kahdesti · ei hakua jos katalogissa on · ei kosketa käynnissä olevaan renderiin (esim. `/home/user/privaatti-fable32/the-cheapest-life`) · ei salaisuuksia/avaimia/story_secretiä gittiin.
Tarkemmin: `docs/LEAN.md`, työkalut `tools/lean/` (`selftest.sh`).
