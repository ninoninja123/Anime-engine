# Credits: musiikki ja äänet (Itachi vs Julius)

**Kaikki musiikki ja kaikki äänitehosteet ovat Epidemic Soundista.** Musiikki: **vain klassista** (käyttäjän vaatimus): kolme Odyssey Orchestran levytystä
(säveltäjät Grieg ja Vivaldi = public domain, äänitteet Epidemic Soundin). Ei rockia, ei laulua, ei Naruton tai Black Cloverin musiikkia eikä ääniä.

## Epidemic Sound: musiikki

| kappale | esittäjä | recording ID | tiedosto | käyttö (video) |
|---|---|---|---|---|
| Grieg: Peer Gynt Suite No. 1, Op. 46: No. 2, Death of Åse | Odyssey Orchestra & Eric Jacobsen | `9ebb6c45-bc12-4f0c-a614-aa7defe92a7e` | `ase.mp3` (uudelleenkäyttö hvg/music) | 0.00-10.60 + katso spoilers.md |
| Grieg: Peer Gynt Suite No. 2, Op. 55: No. 3, Peer Gynt's Homecoming (Stormy Evening on the Sea) | Odyssey Orchestra & Eric Jacobsen | `c300be1a-0b8f-4b3a-8859-9334be9cd337` | `stormy.mp3` (uudelleenkäyttö hvg/music) | 10.60-92.60 |
| Vivaldi: The Four Seasons, Summer RV 315: III. Presto | Michelle Ross, Eric Jacobsen & Odyssey Orchestra | `3dd2a7c0-7363-428b-918f-bb729286fba8` | `summer3.mp3` (uudelleenkäyttö hvg/music) | katso spoilers.md |

Tiedostot: `/tmp/claude-0/-home-user-privaatti/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/ivj/music/` (symlinkit aiempiin latauksiin; myös analysoidut ehdokkaat ingrid, winter1, summer2, winter2, winter3, caccia).

## Epidemic Sound: äänitehosteet

Kaikki käytetyt tiedostot ID:ineen ja käyttömäärineen: `audio/sfx_list.tsv` (`new_for_this_project=yes` = tätä videota varten ladatut, `reused` = aiempien projektien
Epidemic-kirjasto). Kirjasto `scratchpad/ivj/sfx/` (uudet wavit + symlinkit aiempiin kirjastoihin). **21 uutta** (URL-listat `scratchpad/ivj/dl1.tsv`, `dl2.tsv`):
- **Varikset (7):** Single Crow Cawing Spooky `302ffcb9…`, Crow Call Cawing Single `0dc861b8…` (pilkotaan `start`-kohdista), Flock Of Crows Angry `2a31b297…`, Raven Call Fly Off `775caef6…`,
  Ravens Flapping Fly By 02 `b9b2ee5e…`, Raven Squawk `3a7537d9…`, Ravens Call While Landing `efa2df7e…`
- **Aika ja kellot (9):** Tower Clock 1700 Chime `194799aa…`, Antique Bell 02 `07c8ad0c…`, Time Magic Reverse Eerie 02 `05a2889d…` ja 06 `a009ad21…`, Time Magic Incantation `0eca6b5d…`,
  Time Magic Glassy Cast `56005ff3…`, Clock Gears Chain 05 `99e2a90d…`, Ticking Clock Slow Loop `2065a536…`, Ice Spell Freeze JRPG 01 `1d971ae2…` (aika jäätyy)
- **Itachi (3):** Ghostly Fire Magic Burn Long 02 `ef45eda3…` (Amaterasu), Evil Incantation Ghostly `9fa66f5c…` (genjutsu), Shuriken Throw `d3593d0f…`
- **Muut (2):** Rain Heavy Distant Thunder `7315e18c…` (sadematto koko videon ajan), Power Down Shimmer 03 `109e94c0…`

Lataus: `DownloadSoundEffect` (MP3) -> jatkettava HTTP/1.1-lataus (`scratchpad/dl.sh`: `curl --http1.1 -C - --retry 3`) -> `ffmpeg -nostdin` 48 kHz wav.
(Huom: aiemmissa kirjastoissa on muutama katkennut tiedostonimi, koska ffmpeg söi silmukan stdinin; tässä projektissa `-nostdin` ja `</dev/null`.)
Synteettisiä ovat vain sub-drop-tuki (70 -> 26 Hz) ja hiljainen tinnitus (`mix.py`).

## Lopullinen miksaus

`audio/out/mix_final.wav` (48 kHz, 24-bit, stereo, 178.0 s): **−14.0 LUFS, true peak −2.3 dBTP ennen AAC:ta, LRA 6.1 LU**, 777 äänitapahtumaa. Kuvan ajoitukset (pre/shots.json = showdown/shots_data.js, part1/part2) tarkistettu events.jsonia vastaan. Master: kompressori + 16 kHz lowpass + 4x ylinäytteistetty lookahead-true-peak-limitteri (ei kovaa leikkausta, joka sai AAC:n ylittämään). Tila: `audio/MIX_READY.txt`.

## Alustava miksaus

`scratchpad/ivj/preview_mix.wav` (48 kHz, 24-bit, stereo, 178.0 s): 777 äänitapahtumaa, **−14.0 LUFS, true peak −2.1 dBTP, LRA 5.7 LU**. Varret `preview_mix_music.wav`, `preview_mix_sfx.wav`.
Komento: `cd scratchpad/ivj && MIX_STEMS=1 nice -n 19 python3 -I <projekti>/audio/mix.py <projekti>/audio/events.json <projekti>/audio/beats.json . <ulos>.wav`
(musiikin taso: ympäristömuuttuja `MUS_G`, oletus 1.05). Lopullinen miksaus tehdään koordinaattorin pyynnöstä, kun kuvan ajoitukset ovat lukossa
(muutokset -> `pre/make_preprod.py` -> `events.json` -> `mix.py`).
