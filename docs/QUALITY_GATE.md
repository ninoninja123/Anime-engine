# QUALITY_GATE: käyttäjän pysyvät säännöt yhdessä paikassa (lue joka videolla, 1,5 s)
Täysi tausta: `LESSONS.md` (Grep otsikolla, älä lue kokonaan).

## Viestintä ja työtapa
- Suomeksi, lyhyesti. **Ei spoilereita** (juoni, voittaja, twistit, kuolemat, cast tarvittaessa) ennen kuin käyttäjä pyytää. Salaiset: `story_secret.md` (gitignore).
- **Älä korjaa kun käyttäjä antaa vain palautetta**: kirjaa LESSONS.md:hen (`cat >>`) ja kysy mitä tehdään. Ei likeness-labia/lisäkierroksia pyytämättä.
- **Yksi versio** toimitukseen (ei A/B-vaihtoehtoja ellei pyydetä). Tokenit: katot `SKILL.md`, uusi chatti per video, STATE.md jatkoa varten.
- 720p 24 fps MP4, chat-versio ≤ 28 MB, −14 ± 0,5 LUFS ja TP < −1 dBTP AAC:n jälkeen.

## Tarina
- Ymmärrettävyys ensin: **yhden lauseen testi** jokaiselle twistille ja kyvylle ("mitä ensikertalainen sanoisi?"). Max 3 twistiä / 3 min, jokainen kuvalla + yhdellä lyhyellä repliikillä + 2–3 s hengähdys.
- **Jokaisen hahmon signature-kyky on jonkin twistin moottori** ja näkyy kuvassa niin kuin fanit odottavat (Urahara = näkyvä valmistelu, Gowther = muistien manipulointi, Senku = laskut/kemia ruudulla, Aizen = Kyoka Suigetsu, Dazai = No Longer Human).
- Twistit reiluja: vihje näkyy aiemmin, replay/"katso uudelleen" -beat sallittu; ei tyhjästä tulevaa kykyä. "Se oli unta/illuusio" on kielletty VAIN ilman aiempaa vihjettä: ennakoitu ja hahmon LASKELMOIMA Kyōka Suigetsu-/gigai-/korvikepaljastus on toivottu. Vaihda paljastuskeinoa twististä toiseen. Neroja ei tehdä tyhmiksi.
- **Finaali = TWISTIEN TWISTI** ("plot twist plot twistin perään"): viimeisellä minuutilla 2–3 peräkkäistä paljastusta, joista jokainen kumoaa edellisen (kuollut ei ollutkaan kuollut / gigai / korvike, aiempi "harha" oli voittajan laskelmoima, voittajan suunnitelma sisälsi muiden suunnitelmat). Kaikille vihje aiemmin. Voitto on ÄLYKKÄIN kerros, ei tavallisin lopputulos (Cheapest Life v2: "ei OH SHIT -finaalia").
- **Voittaja = todennäköisin** (kanonin mukaan). **Ei Dazai-voittoa toistona.** 1v1 (max 3 hahmoa) toimii; 6–8 hahmon taistelut epäonnistuivat.
- **Ensimmäiset 15 s = koukku**: kysymys/panos heti (sääntö, uhka tai isku), ei hidasta esittelyä, ei VS-kortteja ennen toimintaa.

## Kuva
- **Kamera aina liikkeessä**; rytmi tarinan mukaan (rauhalliset beatit sallittuja ja toimivat; LvN-luvut ovat referenssi, ei tavoite). Sakuga = hyökkääjää seurataan, koko isku näkyy 1,5–3 s (anticipation, smear, hold, follow-through), ei 0,1 s välähdyksiä.
- **Efektit vain nimettyyn tekniikkaan** (ei geneeristä lasinsärkyä jokaiseen osumaan). Jokaiselle tekniikalle oma ikoninen efekti (kuten Sharingan).
- **Kuvassa ENGLANTIA**: ei japania/kiinaa ruudulla (`cjk_check.sh`). Puhe saa olla japania + EN-tekstitys. Tekstit näkyvät **vain puheen ajan**, kaksi riviä kokonaan (`subs_from_timing.py`). Iskunimet isoina englanniksi.
- **Hahmot näyttävät referenssiltä**: tarkista lähikuvat (SILMÄT, arvet, hiusraja, rekvisiitta) ennen renderiä; älä koskaan riko tunnusmerkkiä korjatessa. Valmiit hahmot: `CHARACTERS_BUILT.md`.
- **Ei 2D-nukkeja eikä 2.5D cut-outeja** (hylätty). **3D-lava (Eight Strings -tyyli) hylätty mind gamessa → Seven Chairs -tyylinen 2D on suosikki.** Taisteluun 3D VRM (LvN).
- Värikäs maailma (ei harmaata), maalatut taustat, ei heijastavia 3D-lattioita/HUD-palkkeja.

## Ääni
- Puhe sallittu kun tarina tarvitsee (ElevenLabs v4, `VOICES.md`); **musiikki ja SFX Epidemicistä** (`AUDIO_CATALOG.md` ensin). Ei paikallista TTS:ää.
- **Äänet sopivat hahmoille** (Gowther naisellinen; Satoru = isäntä/johtaja).
- **Mind game: salaperäinen musiikki** (Moonlight/Mira Ma -tyyli), pitkät raidat, **vaihto vain twistissä**. Taistelu: nousukäyrä, Kigan/Kageyama-tyyli; ei kuoro-requiemia pääraidaksi; ei "hauskaa" (Danse macabre hylätty).
- Musiikki kuuluu puheen alla (ducking 3–4 dB, puhetta ≤ ~50 %). SFX: tekniikkakohtaiset 3 kerrosta, ei > 2 s yksittäisiä ääniä.

## Kapteenin tarkistuslista ennen toimitusta (max 2 kuvaa kapteenille)
- [ ] `shot_stats.py` (rytmi järkevä, ei 0,1 s välähdyksiä) · `loudness.sh --aac` (−14 / < −1) · koko ≤ 28 MB · kesto suunnitelman mukaan.
- [ ] 1 kontaktiarkki 320 px + 1 twist/hit-arkki (`twist_coverage.py`) + agentin lähikuva-arkki tunnusmerkeistä (silmät).
- [ ] `cjk_check.sh` ruudulle piirtyvistä teksteistä = 0. Tekstitykset vain puheen aikana.
- [ ] Yhden lauseen testi jokaiselle twistille kirjoitettuna STATE.md:hen; jokainen signature-kyky ajaa twistiä.
- [ ] Finaalissa 2–3 peräkkäistä kumoavaa paljastusta; pari "mitä yleisö luuli viimeiseksi → mitä oikeasti tapahtui" kirjattu; voitto = älykkäin kerros.
- [ ] Koukku 0–15 s katsottu arkilta (`contact_sheet.sh VIDEO 1.5 4 320` alusta).
- [ ] Voittaja = todennäköisin; ei toistoa aiemmista (Dazai). Ei spoilereita raportissa.
- [ ] Raportti ≤ 12 riviä suomeksi; tokenit STATE.md:hen; `disk_cleanup.sh --yes` toimituksen jälkeen.
