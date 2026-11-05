# QUICKSTART (lue tämä ensin; isot dokumentit vain tarvittaessa)

Tavoite: koodilla piirretty anime-taistelu, 720p 24 fps, ≤28 MB. Kaikki visuaali tämän moottorin koodia.
Pakolliset: `LESSONS.md` + `FORMAT.md` (Record of Ragnarok -formaatti). Roolit/vaiheet: `WORKFLOW.md`. Syvempi API: `API.md` (luku 0, 1, 7, 8, 17 riittävät), `showdown/common.js` (yläkommentti = apurit).

## 1. Uusi projekti (2 min)
`cp -r API.md engine audio pre showdown <uusi-kansio>/`; poista vanha `pre/spoilers.md`, `*.mp4`, `audio/out`, `PART*_DONE.txt`, `READY.txt`. Uusi haara. Vanhat hahmot/efektit pysyvät käytössä (`engine/chars_*.js`, listaus `CHARACTERS.md`).

## 2. Tiedostot ja moduulit
- `engine/chars_<x>.js` hahmo (kopioi `chars_ij.js`), `fx_<x>.js` efektit, `sets_<x>.js` areena/tausta, `impact_<x>.js` impact-tyylit. Ladataan automaattisesti (prefix + `modules.cjs`).
- `showdown/common.js`: `shotT(id, fn, opts)` (shot shots.jsonista), `CH(koodi, muoto, keys, opts)` hahmo, `BGX(f, koodi, over)` tausta, kamerat `heroRise arcCam pushFace gcam faceCam camOrbitShot camWhip ...`, yleisö `STAR PAIR`.
- `pre/shots.json` (generoi `pre/make_preprod.py`): id, t0, t1, render (action3d|hand2d), kamera, toiminta, hahmot, tausta, teksti, dialogi, musiikki, impact (tyyli, frames, BURST), sfx.
- Shotin malli:
```js
shotT('E01', (f, lt) => {
  BGX(f, 'ARENA', { side: 'I' });
  f.cam(arcCam([C_A, C_B], lt, { az0: -.3, az1: .3, low: true }));
  f.fig(C_A); f.fig(C_B);
});
```

## 3. Komennot
```bash
cd showdown
./make.sh part1 DIR 0.5 1                 # esikatselu 960x540, 1 worker
REDO=1 ./make.sh 3,4 DIR 0.5 1            # vain muuttuneet 12 s segmentit
cd ../engine && node render.js sheet ../showdown/program OUT.png 0 84 36 0.25 6   # kontaktiarkki
node render.js stills ../showdown/program OUT_DIR 50.5,51.2 0.5                   # yksittäiset framet
cd ../showdown && ./make.sh all DIR 0.6667 4          # lopullinen 720p
AUDIO=<mix.wav> ./make.sh final DIR                   # koodaus (limitteri + AAC)
```

## 4. Äänet
Musiikki ja SFX vain Epidemic Soundista (tallennetaan scratchpadiin, ei repoon; `audio/sfx_list.tsv`). `audio/events.json` + `audio/mix.py`: musiikki −7…−8 dB SFX:n alla, ducking impactissa ~7,5 dB, −14 LUFS, true peak ≤ −2 dBTP ennen AAC:ta. 400+ SFX-tapahtumaa pitkässä videossa, kerroksittain.

## 5. Tarkistuslista ennen toimitusta
- Hahmot oikean näköisiä + tunnusrekvisiitta; kasvot selkeinä 720p:ssä; ei rikkinäisiä raajoja; mikään hahmo ei leikkaa seinää/kulissia (tarkista kuuluttajakoppi!).
- Kuuluttaja (Urahara): selkeä ja kunnolla kuvattu, ei kulissin läpi; avaus, säännöt, esittelyt huutaen, kortit, VS, BEGIN.
- Impact-framet kuin oikeassa animessa + tiheät purskeet; tempo rauhallinen (1,5–2,5 s/kuva); loppu ilman anticlimaxia.
- ffprobe: 1280x720, 24 fps, ≤28 MB; ebur128: −14 LUFS, TP < −1 dBFS.
- Raportit käyttäjälle vain "tehty / korjattu / havaittu", ei juonta eikä voittajaa.

## 6. Säästä tokeneita
Älä lue koko API.md:tä; lue vain tämä + common.js:n yläkommentti + lähin esimerkkiprojekti. Käytä samaa agenttia saman videon sisällä (SendMessage), uusi agentti uudelle videolle. Mekaaniset työt (render, enkoodaus) kevyellä mallilla. Vähemmän kontaktiarkkeja: tarkista vain kriittiset kuvat.

## 8. Wikit (kanoniset tiedot)
WebFetch antaa fandom-wikeille 402. Hae ne curlilla MediaWiki-APIsta: `curl -s 'https://<wiki>.fandom.com/api.php?action=parse&page=<Sivu_Nimi>&prop=wikitext&format=json&redirects=1'` (esim. bleach.fandom.com, bungostraydogs.fandom.com, naruto.fandom.com, onepiece.fandom.com); siivoa wikitext python-skriptillä (poista {{}}, [[]], <ref>). Python urllib antaa 403: käytä curlia.
