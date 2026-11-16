# ENGINES: moottoriluettelo (lue VAIN oman videotyypin rivi)
Kaikki moottorit ovat privaatti-repossa `github.com/ninoninja123/privaatti` (haara + kansio). Uusi projekti: `tools/saasto/new_project.sh <tyyppi> <nimi>` (kopioi moottorin ilman mediaa).
Tarkistettu 2026-11-16: `git ls-tree origin/<haara> <kansio>` + paikalliset worktreet. Yhteiset vaatimukset: node 22, globaali `playwright` (Chromium `/opt/pw-browsers`), ffmpeg, python3 (numpy); Whisper vain `voice_cut.py`-tarkistukseen.

## Pikataulukko
| tyyppi (`new_project.sh`) | haara : kansio | paikallinen worktree (2026-11-16) | mikä | status |
|---|---|---|---|---|
| `taistelu3d` | `luffy-vs-naruto-animation : luffy-vs-naruto` | `/home/user/privaatti-fable17/luffy-vs-naruto` | 3D VRM + MToon (three@0.170, three-vrm@3.5.5), 2D-lähikuvapäät `head2d.js`, 112 shottia dataa | **PARAS TAISTELU** (Luffy vs Naruto, 176 s) |
| `taistelu3d-by` | `benimaru-vs-yami-test : benimaru-vs-yami` | `/home/user/privaatti-fable28/benimaru-vs-yami` | sama LvN-putki + `appearance.json`/`chars_by.js`, maalatut levyt | uusin 3D (1 min + 2 min testit) |
| `taistelu3d-lib` | `fire-vs-clover-3v3-animation : fire-vs-clover` | `/home/user/privaatti-fable27/fire-vs-clover` | 3D-hahmokirjasto (20 `make*` + 6 `M3.*`), `tools/likeness_check.py`, `WHY_LVN_WAS_BETTER.md` | hahmojen lähde; video itse heikko (3v3) |
| `mindgame` | `iq-game : the-cheapest-life` | `/home/user/privaatti-fable32/the-cheapest-life` (**ÄLÄ KOSKE, render käynnissä**) | 2D-elokuvamoottori `showdown/mg/` (vektorimuotokuvat + ilmeriggi), puhe JA + EN-tekstit | **UUSIN mind game** |
| `mindgame-lh` | `joker-game : the-last-hand` | `/home/user/privaatti-fable31/the-last-hand` | sama 2D-moottori (+ `film2.js`, coverage-työkalu) | "pretty good" |
| `mindgame-sc` | `mind-game-fable-animation : mind-game-fable` | (ei worktreetä; vain haara) | 2D `showdown/mg/` + vanha `engine/` | **PARAS MIND GAME** (Seven Chairs, käyttäjän suosikkityyli) |
| `mindgame3d` | `mindgame-production : eight-strings` | `/home/user/privaatti-fable30/eight-strings` | 3D VRM mind game (8 hahmoa, `chars8.js`, `world8.js`) | 7:47, käsikirjoitus `mindgame-script : script-mindgame` |
| `taistelu2d` | `mind-game-fable-animation : mind-game-fable` (engine/ + showdown/) | – | vanha 2D-cel/pseudo-3D (Bleach Showdown -moottori, ANIME-pass) | vain jos käyttäjä pyytää 2D:tä (Yami vs Shanks -resepti) |
| `kansikuva` | – (ei gittiä) | `/home/user/covers/<nimi>` | `tools/lean/thumbnail_compose.py` + still moottorista | – |
Muut 3D-referenssit: `gojo-vs-itachi-2min-animation : gojo-vs-itachi-2min` ("100x parempi", GvI2 = LvN:n pohja), `team-battle-4v4-animation : team-battle-4v4` (8 hahmoa, epäonnistunut video, hahmot ok).

## 3D-taistelu (LvN-tyyli) — `taistelu3d` / `taistelu3d-by`
- Tiedostot: `core.js` (renderöijä, poset, 2-luun IK) · `chars.js`/`chars_by.js` (hahmot VRoid-pohjalla) · `head2d.js` (2D-lähikuvapäät, suu seuraa ääntä) · `film.js` (aikajana, efektien tila) · `env.js` (maailmat, järvi-shader) · `fx.js`/`post.js` (2D-cel-efektit, impactit) · `shots.js` (shotit datana `S`, `SEQ`, `CU`, purskeet `B.*`) · `poses.json` · `run.js` · `models/AvatarSample_C.vrm` (VRoid CC0) · `assets/bg/` (maalatut levyt).
- Ajo: `npm install` (tai symlink node_modules) · `python3 tools/bg2.py` (levyt) · `node tools/poses_lvn.js` · `node run.js poses <who> <pose…>` · `node run.js still <shot>:<frame>` · `node run.js seq F0 F1 [step] --name x` (kontaktiarkki) · `node run.js render 0 <N> --workers 4` → `frames/%05d.jpg` (~0,4 s/frame).
- Ääni: `audio/voice_pick.py RAW --check` (leikkaus + whisper) · `audio/mix.py audio/mix.wav` (miksaus shottidatasta) TAI `tools/lean/mix_from_timeline.py` · `tools/prep_epidemic_sfx.py`. Build: `ffmpeg -framerate 24 -i frames/%05d.jpg -i audio/mix.wav … -c:v libx264 -crf 20` → `loudness.sh --aac`. Tekstit: `tools/lean/subs_from_timing.py`.
- Vaivat/korjaukset: 3D-kasvot = VRoid-peruskasvot (feminiiniset) → kaikki repliikit/reaktiot 2D-lähikuvina. IK-kohteista vähennettävä juuren korkeus ilmassa. Hihat leikattava kyynärpään yläpuolelle (kumiraajat). Flame-shader ei käy sumuksi. Taivasnauhan yläpuoli tarvitsee zeniitin värin. Hahmot "kakkosilla" (96 % frameista), ei heijastavia 3D-lattioita/PMREM-olentoja/HUD:ia.
- Mitattu "miksi LvN toimi": 38 shottia/min, mediaani 1,33 s, 2 hahmoa, 1 areena, iskusykli hiljaisuus→smear→impact→tärähdys→boom (`fire-vs-clover/docs/WHY_LVN_WAS_BETTER.md`). Mutta: luvut ovat referenssejä, EI tavoitteita (Benimaru-palaute).

## 2D mind game (Seven Chairs / The Last Hand / The Cheapest Life) — `mindgame*`
- Tiedostot `showdown/mg/`: `core.js` (kamera, aikajana `B(id,{lines,lead,min,cam,sfx,tag},draw)`), `cast.js` (`drawChar(g,name,P)`: aizen, fyodor, gowther, ranpo, senku, urahara, yuuichi; EXPR-ilmeet), `cast2.js` (dazai, kakashi, orochimaru, `drawHouse`), `sets*.js` (lavasteet), `fx.js`, `<film>.js` (koko elokuva, 1 beat per shotti; Cheapest Life `tcl.js` + `tcl_lib.js`), `lines.js` (GENEROIDAAN `tools/make_lines.py`, ei gitissä), `index.html`.
- Ajo (`showdown/r.sh` = `node render.js`): `./r.sh stills PROG OUTDIR t1,t2 [scale]` · `./r.sh sheet PROG out.png list:t1,t2 [scale] [cols]` · `./r.sh events PROG out.json` (shottilista + SFX-markerit) · `./r.sh all PROG BUILD [workers] [scale] [segLen]` (12 s segmentit, resume `.done`) · `./r.sh redo PROG BUILD k1,k2` · `./r.sh concat PROG BUILD out.mp4 12`.
- Ääni (`audio/`): ElevenLabs v4 scene takes `prompts.json` (`{who, takes, lines:[[id,'[tag] 台詞']]}`) → `voice_cut_ja.py` → `lines_meta.json` → `make_timing.py` → `timing.json` (kesto, ja, en, optional, key_line) → `tools/export_timeline.py` → `video_timeline.json` → `mix.py` (music_plan.json + sfx_map.json; −14 LUFS) → `out/film_mix.wav`.
- Build: `tools/build_final.sh [out.mp4]` = concat → `tools/build_subs.py` (ASS, vain puheen ajan) → AAC + uudelleenlimitointi kunnes dekoodattu TP < −1,2 dBTP @ −14 LUFS → 2-pass x264 ≤ 27,2 MB → mittaus. Twistikattavuus: `tools/coverage.py`.
- Vaivat: `lines.js` puuttuu tuoreesta kopiosta → aja `tools/make_lines.py`. Puhe venyy (Cheapest Life 214 s puhetta vs 168 s suunnitelma) → mittaa takejen kestot ENNEN shotteja, `optional`-rivit pudotetaan ensin. JA-teksti ruudulla kielletty (cjk_check.sh). Seven Chairsissa puhe ChatterBox-TTS (EL-kiintiö loppu) → nyt aina ElevenLabs v4.
- Kesto/tokenit: Last Hand 1,06 M, Cheapest Life 1,0 M (script → ääni ‖ kuva).

## 3D mind game — `mindgame3d` (Eight Strings)
- `film8.html`/`film8.js` (three + three-vrm MToon), `chars8.js` (`M8[who](ch,{donor})`, `setMode`: geass, glow, nocape, nohat, closed), `world8.js`, `puppets8.js`, `poses8.js`, `fx8.js`, `run8.js`, `appearance.json` (8 hahmoa + paletit + ref-tiedostot).
- Putki: `tools/words.py` → `timing_final.py` → `env8.py` (huulisynkka) → `timeline.py` → `bg8.py` → `node shots.js x` → `node run8.js probeall` (kehystarkistus ilman kuvia) → `node run8.js render 0 N --workers 3 --dir frames` → `tools/mix8.py` → `tools/build8.py` → `tools/sheet8.py`.
- Heikkoudet: kaikki samalla VRoid-rungolla, ei hiusfysiikkaa, kädet IK-likimääräisiä, efektit pienehköjä, puhetta 63 %. Käyttäjä pitää 2D Seven Chairs -tyyliä parempana mind gameen.

## Kansikuva — `kansikuva`
`python3 tools/lean/thumbnail_compose.py out.jpg a.mp4@12 b.mp4@40 --title 'X VS Y'` (1–4 framea + ääriviivaotsikko). Uusi still: 2D `./r.sh stills PROG dir t 1.0`, 3D `node run.js still <shot>:<frame>`. Englanti kuvassa, ei spoileria (ei voittajaa/twistiä).

## Yleiset korjaukset (kaikki moottorit)
- Levytila: `tools/lean/disk_cleanup.sh PROJECT` (kuiva-ajo) → `--yes`. Renderi tarvitsee ~1,2–2,5 GB (frames + segmentit).
- Äänenvoimakkuus mitataan AAC:n jälkeen (`loudness.sh --aac`): −14 ± 0,5 LUFS, TP < −1.
- Tekstitys: `subs_from_timing.py` (näkyy vain puheen ajan, 2 riviä, MarginV ≥ 55).
