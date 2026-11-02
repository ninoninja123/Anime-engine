# README FOR AI: miten tätä moottoria käytetään

Olet tekemässä koodilla piirrettyä anime-taisteluvideota (1v1 tai useampi), 720p 24 fps MP4, jonka koko on enintään 28 MB. Älä käytä kuvageneraattoreita tai 3D:tä: kaikki visuaali on tämän moottorin koodia.

## 0. Asennus
Node 22, `npm i -g playwright && npx playwright install chromium` (tai käytä valmista Chromiumia), ffmpeg, python3 (numpy, scipy hyödyksi äänianalyysiin).
Tarkista: `cd engine && node render.js stills reel/example /tmp/ex 0.5,1.0 0.5`.

## 1. Lue ensin (tässä järjestyksessä)
1. `FORMAT.md` (videoformaatti: Record of Ragnarok), `LESSONS.md` (laatuvaatimukset, pakollinen) ja `WORKFLOW.md` (roolit, vaiheet, briefimallit).
2. `engine/README.md` ja `API.md` (luvut 0–17: hahmot, kamera, efektit, impact-framet, tekstit, areenat).
3. `showdown/README.md` + `showdown/common.js` (shotin kirjoitus, `shotT`, `CH`, `BGX`, kamerat).
4. `pre/`: esituotannon formaatti (`storyboard.md`, `shots.json`, `quality_gate.md`, `make_preprod.py`).

## 2. Työnkulku
1. **Esituotanto** (`pre/`): tutkimus hahmoista (ulkonäkö, tunnusrekvisiitta, kyvyt), `cast.md`, `powers.md`, `text_style.md`, `impact_requests.md`, `crowd.md`, `storyboard.md`, ja `shots.json` (id, t0, t1, render-tyyli, kamera, toiminta, hahmot, tausta, teksti, dialogi, musiikki, impact, sfx). Generoi `make_preprod.py`:llä.
2. **Moottori**: lisää uudet hahmot (`engine/chars_<x>.js`), efektit (`fx_<x>.js`), areena (`sets_<x>.js`), impact-tyylit (`impact_<x>.js`). Moduulit latautuvat automaattisesti (`engine/modules.cjs`). Kopioi rakenne `chars_ij.js`, `fx_ij.js`, `sets_ij.js`, `impact_ij.js` -tiedostoista.
3. **Kuvat**: kirjoita `showdown/part1.js` ja `part2.js` (`shotT('ID', (f, lt) => {...})`). Tulokset `./make.sh part1 DIR 0.5 1` (esikatselu), `REDO=1 ./make.sh 3,4 DIR 0.5 1`, kontaktiarkit `node render.js sheet ...`.
4. **Ääni** (`audio/`): musiikki + SFX omista lähteistä (äänet eivät kuulu repoon), `events.json` (SFX-tapahtumat) ja `mix.py` (ducking, limitteri, -14 LUFS, true peak ≤ -2 dBTP ennen AAC:ta). Analysoi tahdit `analyze_beats.py`, `analyze_music.py`.
5. **Lopullinen render**: `cd showdown && ./make.sh all DIR 0.6667 4` (1280x720, 12 s segmentit, resume) ja `AUDIO=<mix.wav> ./make.sh final DIR` → `itachi_vs_julius.mp4`. Tarkista ffprobella (720p, 24 fps, ≤ 28 MB) ja ebur128:lla.

## 3. Laatusäännöt (tiivistelmä, katso LESSONS.md)
- Kuuluttajalähtöinen Record of Ragnarok -avaus (energinen juonto, säännöt, huutaen esittely kortteineen).
- Hahmot tunnistettavia (tunnusrekvisiitta mukana), kasvot selkeinä 720p:ssä, kamera aina liikkeessä.
- Impact-framet kuin oikeassa animessa (koko ruudun iskut, speedlinet, negatiivit, siluetit), ei vain naamavälähdyksiä; isoissa iskuissa tiheä purske (5 eri framea ≤ 1 s).
- Rauhallinen, seurattava tempo (keskim. 1,5–2,5 s per kuva), hahmot puhuvat toisilleen.
- Musiikki valitaan tunteen mukaan, pitkiä kappaleita, vaihtuu käännekohdissa; paljon kerrostettuja ääniefektejä; loppu ilman anticlimaxia.
- Pidä juoni ja voittaja salassa käyttäjältä (spoileritiedosto `pre/spoilers.md` ei kuulu repoon).

## 4. Huomioita
- CPU-rasteri: ~0,4–0,6 s/frame/worker 960x540. 4 workeria. Segmentit välimuistissa (resume).
- Fontit asennetaan `showdown/make.sh`:lla `engine/fonts/`-kansiosta.
- Esimerkkishotit ovat kierrätettäviä; älä keksi apureita uudelleen, vaan lue API.md ja `engine/reel/*`.
