# WORKFLOW: miten videot tehdään (roolit, briefit, laatuportit)

Tapa, jolla kaikki videot (Hulk vs Yujiro, Naruto vs Luffy, Itachi vs Julius jne.) on tehty: **kapteeni** (pääagentti) jakaa työn erikoistuneille agenteille, jotka kirjoittavat eri kansioihin. Kapteeni ei koodaa itse, vaan koordinoi, välittää käyttäjän palautteen ja tarkistaa lopputuloksen.

## Roolit
| rooli | kirjoittaa | tehtävä |
|---|---|---|
| **P** (esituotanto + ääni) | `pre/`, `audio/` | tutkimus, cast/powers, storyboard, `shots.json`, tekstityylit, impact-pyynnöt, yleisö, musiikin ja SFX:n valinta, `events.json`, miksaus |
| **E** (moottori) | `engine/`, `showdown/common.js`, `part1.js`, lopullinen render | uudet hahmot, efektit, areena, impact-tyylit, fontit, API.md-luku, osan 1 shotit, 720p-render ja enkoodaus |
| **S2** (shot-kirjoittaja) | `showdown/part2.js` + maskatut shotit | kirjoittaa osan 2 (finaali) ja korvaa osan 1 maskatut shotit; ainoa, joka saa lukea `pre/spoilers.md` |
Rinnakkain: P ja E aloittavat yhtä aikaa; kun E on valmis → S2 kirjoittaa osan 2; sitten P tekee lopullisen miksauksen ja E renderöi.

## Vaiheet
1. Käyttäjän toive → kapteeni kopioi edellisen projektin pohjaksi (`engine/`, `API.md`, `audio/`, `pre/`, `showdown/`) uuteen kansioon ja haaraan.
2. P ja E käynnistetään briefillä (ks. malli alla). Kierrätä aiempia moduuleja ja ladattuja ääniä (säästää tokeneita).
3. P: `pre/READY.txt` kun valmis. E: `showdown/COMMON_READY.txt`, `PART1_DONE.txt`.
4. S2 kirjoittaa osan 2 (+ maskatut) → `PART2_DONE.txt`.
5. P: `audio/out/mix_final.wav` + `MIX_READY.txt` (-14 LUFS, true peak ≤ -2 dBTP).
6. E: 720p-render + `make.sh final` → mp4, ffprobe-tarkistus (720p, 24 fps, ≤ 28 MB).
7. Kapteeni lähettää videon käyttäjälle ja kerää palautteen → päivitä `LESSONS.md`.

## Spoilerisuoja
Käyttäjä haluaa yllättyä voittajasta ja käänteistä. Voittaja ja käänteet kirjoitetaan VAIN `pre/spoilers.md`:hen (P luo, S2 lukee, E ei lue). Muut dokumentit (`shots.json`, storyboard) merkitsevät käänteiden kohdat `masked`-lipulla. Raportit käyttäjälle: vain "tehty / korjattu / havaittu", ei juonta eikä voittajaa. `spoilers.md` ei mene versionhallintaan.

## Briefimalli P:lle
- Hahmot, formaatti (Record of Ragnarok: kuuluttaja, säännöt, kortit, VS, BEGIN-gongi; taistelu kunnes toinen kuolee tai ei pysty jatkamaan), kesto (max 3 min, 170–180 s), ensimmäinen isku < 20 s.
- Dramaturgia: nousu portaittain, käänteet, tunneiskut, hiljaisuuskuopat, hyvä loppu (ei anticlimaxia).
- Impact-frameja: ≥ 40 sarjaa, ≥ 12 tiheää purskeet (5 eri framea ≤ 1 s).
- Yleisö: siluettien keskellä 1–3 nimettyä hahmoa, joista yksi viisas ja yksi heittää ennenaikaisia tuomioita (hahmot valitaan taistelijoiden mukaan; Dazai/Shunsui oli vain esimerkki).
- Musiikki: valitse tunteen mukaan, 3–4 pitkää kappaletta, vaihdot käännekohdissa, taso −7…−8 dB SFX:n alla, ducking impactissa ~7,5 dB; ei pitkiä hiljaisia kohtia. SFX: kerroksia joka iskuun (whoosh + impact + sub + detaili), 400+ tapahtumaa.
- Ulostulo: `pre/*.md`, `shots.json`, `audio/events.json`, `mix.py`, `READY.txt`.

## Briefimalli E:lle
- Hahmot (muodot, poset, ilmeet, tunnusrekvisiitta), efektit hahmojen kyvyille, areena (kierrätä Valhalla `sets_hvg.js`), impact-tyylit, isot luettavat iskunimifontit hahmokohtaisesti, yleisön apurit, `burstSeq`-purskeet.
- Kierrätä: `chars_*`, `fx_*`, `sets_*`, `impact_*`, `reel/*`.
- Testaus: mallilehdet, kontaktiarkit, 960x540-testireeli; ei rikkinäisiä raajoja; kasvot selkeinä 720p:ssä.
- Lopullinen render vasta kapteenin pyynnöstä.

## Tunnetut sudenkuopat
- AAC-koodaus nostaa true peakia: jätä marginaali (−2 dBTP ennen AAC:ta) ja ajaa limitteri ennen enkoodausta.
- CPU on jaettu: esikatselu enintään 2 workerilla; täysi render 4.
- Levytila rajallinen: poista väliaikaiset segmentit tarvittaessa; renderöi segmentit suoraan enkoodattaviksi.
- Epidemic Sound: lataus HTTP/2-virheen vuoksi resumable HTTP/1.1:llä; `ffmpeg -nostdin` ladattaessa silmukassa, ettei stdin katkaise nimilistaa.
- Hahmojen ulkonäkö tarkistettava kanonista ennen renderiä; tunnusrekvisiitta (esim. grimoire) on pakollinen.
