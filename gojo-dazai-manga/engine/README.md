# Death Battle – visuaalinen moottori (pohjana Bleach Showdown -moottori)

Koodilla piirretty 2D-animemoottori. Hahmot, lavasteet ja efektit ovat pseudo-3D-geometriaa, joka projisoidaan kameran läpi ja piirretään
cel-tyylillä Canvas 2D:llä Chromiumissa (CPU-rasteri). Ei 3D-renderöintiä, ei tekoälykuvia eikä valmiita kuvia. Täydellinen API ja
shottien kirjoitusohje ovat tiedostossa `../API.md`. Aloita lukemalla `reel/example.js`.

## Hybridityyli
`action3d` (3D-cel) toimintaan ja laajoihin kuviin, `hand2d` (käsin sijoitetut varjot, painotettu tussi, 2D-hiukset ja -sormet, gouache) lähikuviin. Taustat ovat oletuksena maalatut. Ks. API.md luku 0 ja `reel/testreel2.js`.

## Miksi tämä ei näytä pelispriteltä
- **Näkymäriippuva piirto (`toon.js`).** Jokainen osa (pää, vartalo, hakama, haori, hihat, sormet, hiustupsut, hattu, siivet) on
  parametrinen 3D-pinta. Siluetti, cel-varjon raja, reunavalo, efektivalot ja vaatteiden reunat lasketaan joka framessa pinnan
  normaaleista ja kamerasta. Hahmo piirtyy siksi oikein edestä, takaa, sivusta, 3/4-kulmista, ylhäältä ja alhaalta, ja foreshortening
  on oikea. Kasvonpiirteet ovat kasvotason decaleja: kaukaisempi silmä kapenee 3/4-kuvassa ja leikkautuu poskilinjaan, ja nenästä
  tulee profiili sivukuvassa.
- **Luuranko (`rig.js`)**: FK + 2-luun IK (kädet, jalat, kaksikätinen miekkaote), painopiste ja maakontakti. Raajat ovat jatkuvia
  putkia nivelestä niveleen. Jousisimulaatio liikuttaa hiuksia, haoria, hihoja ja huivia hahmon todellisen liikkeen ja tuulen mukaan.
- **Kamera (`camera.js`)**: orbit, dolly, crane, whip, handheld, dutch, rack focus ja vertigo oikeassa perspektiivissä, myös taustassa.
- **Impact framet (`impact.js`)**: 30 tyyliä, 11 yleistä sekvenssiä, 24 hahmokohtaista signature-sekvenssiä ja 27 esituotannon (pre/shots.json) tyylinimeä valmiina sekvensseinä.

## Tiedostot
`core camera toon rig body faces chars world fx impact text post timeline shotkit` (moduulit, latausjärjestys `scripts.js`),
`index.html` (selain), `render.js` (renderöinti), `make.sh` (täysi build), `make_sheets.sh` + `sheets.js` (mallilehdet),
`lab.html` + `lab.js` (laboratorio), `reel/` (esimerkki, testireeli, impact-laboratoriot).

## Ajo
Tarvitaan node 22, globaali `playwright` (Chromium `/opt/pw-browsers`), ffmpeg ja python3.
```bash
node render.js stills  reel/example /tmp/ex 0.5,1.0 0.5
node render.js preview reel/testreel /tmp/prev.mp4 0.5          # alle minuutti, 4 workeria
./make.sh reel/testreel - /tmp/testreel.mp4                      # 1080p24, 12 s segmentit, resume
./make_sheets.sh ../docs/sheets
```
Selaimessa: `index.html?prog=reel/testreel&scale=0.5`.

## Dokumentaatio ja materiaalit
- `../API.md`: kaikki funktiot ja shotin kirjoittaminen
- `../docs/sheets/*_model.png`: mallilehdet (5 näkymää, 5 pään kulmaa, 14 ilmettä), `*_forms.png` (muodot ja signature-poset)
- `../docs/contact/`: kontaktiarkit `impact_styles`, `impact_sequences`, `fx_library` ja `sets`

## Moduulit (automaattinen lataus)
Moottori lataa käynnistyksessä automaattisesti kaikki `engine/`-kansion tiedostot, joiden nimi alkaa
`poses_` `chars_` `fx_` `sets_` tai `impact_` (pääte `.js`; ohitetaan `*.bak.js`, `*.tmp.js`, `*.off.js`).
- Järjestys: ydinmoduulit (`core … props`) → `poses_*` → `chars_*` → `fx_*` → `sets_*` → `impact_*` (aakkosjärjestys ryhmän sisällä) → `?prog=`-ohjelmatiedostot.
  Moduuli voi siis käyttää kaikkia ydinfunktioita latausaikana; toisen laajennusmoduulin funktioita kannattaa kutsua vasta piirtoaikana.
- Mekanismi: `modules.cjs` kirjoittaa manifestin `engine/modules.js` (`window.ENGINE_MODULES`), jonka `scripts.js` lataa heti ydinmoduulien
  jälkeen. `render.js`, `lab.js` ja `make_sheets.sh` (sekä kaikki niitä käyttävät, esim. `showdown/make.sh`) päivittävät manifestin itse joka ajossa.
  Jos avaat pelkän `index.html`:n selaimessa uuden tiedoston lisäämisen jälkeen, aja kerran `node modules.cjs`.
- Rekisteröinti tiedostossa (kaikki ovat globaaleja objekteja): `CAST.nimi = design(...)`/oma objekti, `SIGNATURE.nimi = [...]`,
  `Object.assign(POSES, {...})`, `SETS.nimi = (ctx, t, opt) => ...` + `PALETTES.nimi = {...}`, `Object.assign(IMPACT_SEQ, {...})`,
  `IMPACT.tyyli = (c, f, p, k) => ...`, efektit tavallisina funktioina `fxNimi(g, ...)`. Käytä `'use strict'` ja vältä ylätason `const`-nimiä,
  jotka voivat törmätä (etuliite tiedoston mukaan, esim. `FIRE_`, `BC_`, `DS_`, `MHA_`).
- Omistajuus: `chars_ds.js`, `chars_mha.js`, `fx_ds.js`, `fx_mha.js`, `sets_a.js`, `poses_*.js`, `impact_*.js` = E1 (moottori);
  `chars_fire.js`, `chars_bc.js`, `fx_fire.js`, `fx_bc.js`, `sets_b.js` = E2. Ydinmoduuleja muokkaa vain E1; ristiriidat → `showdown/ENGINE_NOTES.md`.

## Death Battle -laajennus (E1)
Uudet tiedostot: `chars_00_common.js chars_bleach.js (urahara) chars_ds.js (rengoku, akaza) chars_mha.js (deku, shigaraki) fx_ds.js fx_mha.js
fx_blood.js sets_a.js poses_core.js impact_e1.js modules.cjs`; ydinmuutokset: body.js (housut/saappaat/hihat/liekkikuviot), faces.js (iiriskanji,
haarakulmat, hiusten kärkiväri), rig.js (`ground:'all'`), world.js (setin oletuspaletti), post.js (nopeampi maalauspassi), shotkit.js (kamera-apurit),
sheets.js (`posesSheet`), render.js (manifesti + PIL-kontaktiarkki), make_sheets.sh (kaikki CAST-hahmot, `./make_sheets.sh ../docs/sheets [hahmot]`).
API: `../API.md` luku 11. Testireeli: `node render.js preview reel/e1reel out.mp4 0.5`; efektilaboratorio `reel/fxlab_e1.js`.

## Shinji / Aizen / Dazai -laajennus (agentti E)
Uudet tiedostot: `chars_sad.js` (shinji, aizen, dazai + poset), `fx_sad.js` (signature-efektit + ruutuprosessit), `sets_sad.js` (canal, yokohama, sakasama, mirror, lasnoches,
past, lupin, dojo, arena + paletit), `impact_sad.js` (tyylit + sarjat, myös pre/shots.json -nimet). Ydinmuutokset: timeline.js (`f.screen`, `f.nullify`), post.js (ruutuprosessit
ennen impactia), faces.js (`noMouth`, `noNose`, pienten päiden silmät), body.js (`haori.slits`), shotkit.js (`camGroup`), poses_core.js (5 uutta posea), sheets.js +
make_sheets.sh (`SIGNATURE_FORM[hahmo]` = muoto poses-lehdille). API: `../API.md` luku 12. Testireeli: `node render.js preview reel/sadreel out.mp4 0.5 2`.

## Gowther / Dazai / Urahara -laajennus (agentti E, gowther-dazai-urahara)
Uudet tiedostot: `chars_gow.js` (Gowther: 7 muotoa, 18 posea, ilmeet blank/curious/gentle/cold/sorrow/emptyTears/thinking/sly, lasit, Herritt-jouset, kirja, nukkenivelet),
`chars_zz_gdu.js` (Urahara: viuhka, captain/gigai, 12 posea, uusittu Benihime-nukke, verho, ompeleet, Gigai-pop; Dazai: wet-muodot, 6 posea, tynnyri, sade),
`fx_gow.js` (Invasion-ruutuprosessit, Herritt-nuolet, muistot, langat, Harlequin-nuket, Blackout, Kaleidoscope), `fx_gow2.js` (POV-kieli: pinkki kalvo, repeämä, takaisinkelaus;
Kirjan sivu, kansikuvat, Chūyan hattu, Gowtherin neliöpuhekupla), `sets_gow.js` (theater memlib chess mindscape urashop undergrounds clocktower shiftarena),
`sets_gow2.js` (shopin yokoalley mindlib paperwhite stitch voidboard + BOARD-lisät), `impact_gow.js` (13 tyyliä, 9 shots.json-sarjaa + 18 hahmosarjaa), `poses_gdu.js`
(nukke-/tappioposet, camOTS camLowHero camSlowPush camWideGroup). Ydinmuutokset: faces.js (720p-luettavuus, hiusten huojunta `HAIR_SWAY`), toon.js (lineW-minimi .85),
sheets.js (`sheetExprs`). API: `../API.md` luku 13. Testireeli: `node render.js preview reel/gdureel out.mp4 0.5 2`; laboratoriot `reel/gowlab.js`, `reel/gowlab2.js`, `reel/gowimpact.js`.

## Harry / Gojo -laajennus (agentti E, harry-vs-gojo)
Uudet tiedostot: `chars_hvg.js` (harry: 7 muotoa, gojo: 9 muotoa, geto_youth; 25 + 24 posea; lasit, arpi, sauvat, miekka, Snitch, kivi, silmäside, Six Eyes, kaulus, kamera-apurit
camTruck/camDutch/camOrbitShot), `fx_hvg.js` (Infinity, Blue, Red, Hollow Purple, Black Flash, RCT, Six Eyes + ruutuprosessit gojoWarp/gojoDomainWipe/gojoVoidScreen/gojoInfoOverload),
`fx_hvg2.js` (loitsusäteet, Protego, Patronus-peura, Accio, Incendio, Reparo, Apparition, näkymättömyysviitta, varjot, sauvajäljet, Uraharan mikrofoni + poset),
`sets_hvg.js` (valhalla-areena yleisöineen + valgate voidspace hogwarts darkforest heavens jjhigh cardbg), `impact_hvg.js` (27 tyyliä, kaikki impact_requests.md-sarjat).
Ydinmuutokset: text.js (SHONEN/WIZARD/ARENA-typografia, voimakortit), body.js (`figAlpha`, `postFig`, huivin raidat), rig.js (`float`). API: `../API.md` luku 14.
Testireeli: `node render.js preview reel/hvgreel out.mp4 0.5 2`; laboratoriot `reel/hvglab.js` (lavasteet), `reel/hvgimpact.js` (impactit).

## Naruto / Luffy -laajennus (agentti E, naruto-vs-luffy)
Uudet tiedostot: `chars_nl.js` (naruto: base sage kcm/kurama baryon + haavoittuneet; luffy: base gear2 gear3 gear4/boundman gear5 + haavoittuneet; olkihattu, kumikäsi, otsasuojus, poset),
`chars_nl2.js` (pre/cast.md: värit, battle/haki/hokage/memory/giant, squash/hoseArms/stretchLeg/eyePop/toonLines/hakiArms, poset), `fx_nl.js` (Rasengan-perhe, kloonit, viitat, höyry, pilvihuivi, Gatling,
Haki, cartoon-efektit), `fx_nl2.js` (SHINOBI/PIRATE/NIKA-iskunimet, kortit), `fx_nl3.js` (Kurama), `sets_nl.js` (nlarena, nlseal, nlcard, Shunsui), `impact_nl.js` (shots.json-impactit).
Kopioitu hulk-vs-yujirosta: `chars_hy.js chars_hz_s2.js fx_hy.js fx_hy_s2.js impact_hy.js sets_hy.js reel/hy*.js` + ydin (body faces rig sets_hvg text) + `fonts/`.
Ydinmuutokset: body.js (`squash`, `lineK`), fx_gow3.js (raajojen piilotus), sets_hvg.js (emblem-funktio, `faint`, `fallen`/`toonRun`). API: `../API.md` luku 16.
Laboratoriot: `reel/nllab.js`, `reel/nlimpact.js`, `reel/nltitles.js`; testireeli `node render.js preview reel/nlreel out.mp4 0.5 2`.

## Itachi / Julius -laajennus (agentti E, itachi-vs-julius)
Uudet tiedostot: `chars_ij.js` (itachi: base sharingan mangekyo sick sick_mangekyo blind nocloak; julius: base magic manazone chrono casual wounded; Sharingan/Mangekyō/kelloiiris, Akatsuki-viitta pilvineen, kaulus,
kunai/shuriken, `dissolve`-variksiksi hajoaminen, poset), `fx_ij.js` (varikset, Amaterasu, tulipallo, Susanoo 4 vaihetta, Mangekyō-insertti, Tsukuyomi/Izanami, kellopiiri, Chrono Stasis, aikaluodit, grimoire, Mana Zone, vaakuna,
aikapysäytys), `fx_ij2.js` (CROW/WIZARD-iskunimet, kortit), `fx_ij3.js` (sade + jäätynyt sade, shurikenit, Hōsenka, magatamat, genjutsu-ruutu, kellokilpi, tulen vanhennus, luotain, rattaat), `sets_ij.js` (ijarena sateessa,
tsukuyomi, ijcard, Dazai + Shunsui siluettien keskellä), `impact_ij.js` (tyylit, shots.json-sarjat, `burstSeq`/`IJ.burst`). Fontit: Cinzel, Cinzel Decorative, Shippori Mincho B1, Zen Antique, Yuji Syuku.
Ydinmuutokset: faces.js (`eyeHook`, `irisFn`), body.js (`haori/sleeve.patternFn`, `noAlpha`-osat). API: `../API.md` luku 17. Laboratoriot: `reel/ijlab.js`, `reel/ijimpact.js`, `reel/ijtitles.js`; testireeli `reel/ijreel.js`.
