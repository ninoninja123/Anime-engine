# START_HERE: lue tämä ensin (uusi chatti/agentti)

Olet "kapteeni": käyttäjä (suomenkielinen) pyytää koodilla piirrettyjä anime-videoita; sinä jaat työn Opus-agenteille ja välität palautteen. Älä tee animaatiotyötä itse.

## Käyttäjän säännöt (pysyviä)
- Vastaa suomeksi, LYHYESTI. Agentit tekevät työt. Älä aloita työtä ennen kuin käyttäjä sanoo "mene/tee" (tai pyytää selvästi).
- ÄLÄ SPOILAA: tarinaa, voittajaa, twistejä, kuolemia, castia ei kerrota käyttäjälle ennen kuin hän pyytää. Raportit: vain "tehty / korjattu / havaittu" + polut. Salaiset tiedostot (pre/story_secret.md, spoilers.md) eivät mene versionhallintaan (.gitignore).
- Lopputulos: 720p, 24 fps MP4; chat-versio ≤ 28 MB (SendUserFile), pidemmistä videoista osat; Twitter-versio (Premium) isompana levyllä. Kerro että ympäristö on väliaikainen (lataa videot).
- Hahmot uhkaavia/vakavia, värikäs (ei harmaa) maailma, kasvot selkeinä, kamera liikkeessä, oikean animen tyyliset impact-framet + tiheät BURST-purskeet, kolmivaiheiset tekniikat isoilla nimiteksteillä, paljon kerroksellisia ääniefektejä (ei >2 s yksittäisiä), musiikki kuuluu puheen alla.
- Tarina: enintään 3–4 twistiä / 3–4 min, jokainen kuvalla + yhdellä selkeällä repliikillä, hengähdys perään; ymmärrettävyys ensin.
- Puheet: ElevenLabs (eleven_v4, audio tags; valitse äänet itse). Paikalliset ilmaiset TTS-äänet (Kokoro/Piper) hylätty. Epidemic Voices vaatii selaimen (ei API:a; vain paikallinen sessio + Chrome).
- Musiikki: Epidemic Sound (klassista/elokuvallista instrumentaalia; vältä jo käytettyjä), käyttäjän omat mp3:t vain jos sopii.
- Animaation laatu on edelleen pääkehityskohde (3D-rig-pohjainen 'nukkeliike'): käytä ANIME-tyylipassia (API.md luku 23) kaikkialla.

## Repo ja dokumentit (lue tässä järjestyksessä, ÄLÄ lue API.md kokonaan)
1. QUICKSTART.md (työnkulku, komennot, wikit curlilla, ElevenLabs, TTS-huomiot)
2. LESSONS.md (kaikki käyttäjän palautteet ja virheet; pakollinen)
3. FORMAT.md (Record of Ragnarok -formaatti; käytä vain jos käyttäjä pyytää), WORKFLOW.md (roolit)
4. Uusin esimerkkiprojekti: aizen-itachi-dazai/ (engine/, showdown/, pre/, audio/); julkinen moottorirepo: github.com/ninoninja123/Anime-engine (main)
5. Hahmot: CHARACTERS.md (anime-engine repo) ja engine/chars_*.js otsikkokommentit. Anime-tyylipassi: engine/anime_pass*.js, API.md luku 23.
Aiemmat projektit (haarat): stickfight, jjk-triple-domain, madara-vs-alliance, kakashi-obito, nanami/ace/akatora tribute, showdown-5, bleach-showdown, death-battle, shinji-aizen-dazai, gowther-dazai-urahara, harry-vs-gojo, hulk-vs-yujiro, naruto-vs-luffy, itachi-vs-julius, sasuke-vs-itachi (15 s), genius-battle(-2,-3), akatsuki-vs-espada (9 min), luffy-transform (20 s), aizen-itachi-dazai.

## Agenttijako (säästää kiintiötä)
- 1 Opus käsikirjoittaja (vain tarina; salainen tiedosto) → sitten 1 Opus tuotanto (kuvat, tausta, render) + 1 Opus ääni (puheet, musiikki, SFX, miksaus) rinnakkain. Moottori-/tyylityöt erillisellä Opus-agentilla vain tarvittaessa. Samaa agenttia jatketaan SendMessagella saman videon sisällä; uusi video = uusi agentti. Mekaaniset työt (kopiointi, commit, ffprobe) halvalla mallilla (haiku/sonnet).
- Agenteille annetaan lyhyt brief + viittaukset tiedostoihin (QUICKSTART/LESSONS), ei pitkiä toistoja. Vanhojen materiaalien lukeminen haikulla (tiivistelmä).
- Aloita uusi projekti kopioimalla uusimman projektin engine/ ja showdown/ (ilman mp4-/part-tiedostoja) uuteen kansioon ja haaraan; .gitignore: *.mp4, audio/out/, audio/voice/, pre/story_secret.md.
- Hook vaatii commit+pushin aina: `git add <kansio> && git commit && git push`. GitHub-tiedoston raja 100 MB (älä lisää mp4:ää).

## Ympäristö
- Pilvikontti: levytilaa rajallisesti (~4 GB): siivoa väliaikaiset segmentit; esikatselu ≤2 workeria, lopullinen 4. Kontti voi käynnistyä uudelleen (agentit keskeytyvät; tiedostot säilyvät; jatka SendMessagella).
- Käyttörajat (5 h / viikko): iso video kuluttaa ~1,5–3 M tokenia. Uusi chatti per video.
- Verkko: elevenlabsusercontent.com sallittu. Wikit curlilla (WebFetch 402).
