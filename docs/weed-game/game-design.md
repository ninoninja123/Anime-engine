# Weed-peli – pelisuunnittelusuositus (mobiili)

*Pohjana: `research.md`. Kohde: puhelimen selain/PWA. Koodaa AI-agentti ilman visuaalista editoria. Fiilis: tasoja, jokaisessa boss, hienot animaatiot, koskettavat cutscenet.*

---

## 1. Vaihtoehdot

### A) Reaaliaikainen sivuttaisvieritteinen action (beat-em-up / toimintatasoloikka)
Weed juoksee, hyppää ja puree vasemmalta oikealle, ja liittolaisia kutsutaan apuun. Bossit ovat suuria, ja niillä on selkeästi ennakoitavat hyökkäyskuviot (Hollow Knight / Mega Man -henki).
- **Tarinaan sopivuus:** ★★★ Koirien taistelut mangassa ovat nopeita, hyppiviä ja puremaan perustuvia. Battōga on luonnostaan "hyppy + pyörähdys + isku".
- **Mobiiliohjaus:** ★★ Virtuaalinen D-pad ja napit ovat puhelimessa kömpelöitä. Ongelman voi kiertää yksinkertaisilla eleillä (katso suositus).
- **Toteutettavuus AI-agentille:** ★★ Fysiikka, törmäykset ja kenttäsuunnittelu ilman editoria vaativat paljon iterointia. Kentät pitää kirjoittaa datana.
- **Animaatiotarve:** ★ (raskas). Jokaiselle hahmolle tarvitaan juoksu-, hyppy-, purenta- ja osumasyklit, ja nelijalkaisen koiran juoksun pitää näyttää hyvältä.

### B) Vuoropohjainen bossitaistelu (JRPG / Pokémon-tyyli)
Tasot ovat karttoja tai kerronnallisia jaksoja. Bossi kohdataan vuoropohjaisesti: hyökkää, käske laumaa, puolusta, ja kun "henki"-mittari on täysi, käytössä on Battōga.
- **Tarinaan sopivuus:** ★★ Laumajohtajuus, eli kenet lähetät ja milloin, toimii erinomaisesti, ja Ōun armeijan kokoaminen sopii "tiimin rakentamiseksi". Fyysinen, nopea taistelutunnelma kuitenkin katoaa.
- **Mobiiliohjaus:** ★★★ Pelkkiä napautuksia, toimii pystyasennossa yhdellä kädellä.
- **Toteutettavuus:** ★★★ Tilakone, data ja tweenit. Helpoin testata automaattisesti.
- **Animaatiotarve:** ★★★ (kevyt). Riittää muutama asento per hahmo ja iskuefektit.

### C) Hybridi: "Lauma-action" – lyhyet reaaliaikaiset bossit + QTE-huipennukset + laumakomennot
Tason runko on lyhyt kerronnallinen eteneminen (kävely/juoksu, valinnat, pikkuviholliset kevyesti). Bossitaistelu on **reaaliaikainen mutta ele-pohjainen**: Weed väistää pyyhkäisyllä ja hyökkää napautuksella. Lauman jäsenet ovat "kortteja", jotka latautuvat ajan myötä ja joita voi kutsua. Ratkaiseva isku on **Battōga-QTE** (piirrä kaari / napauta oikeaan rytmiin). Boss-vaiheiden välissä nähdään mini-cutscenejä.
- **Tarinaan sopivuus:** ★★★ Siinä on sekä fyysinen kaksintaistelu että laumajohtajuus. Mangan bossit voitetaan *aina* yhteistyöllä: Neljä nuolta, GB:n uhraus ja Hiron syöksy ovat juuri laumakortteja. Lisäksi QTE on luonnollinen paikka koskettavalle hetkelle: kun kortti käytetään, toveri uhrautuu.
- **Mobiiliohjaus:** ★★★ Napautus, pyyhkäisy ja pito toimivat ilman virtuaalinappeja, vaaka- tai pystyasennossa.
- **Toteutettavuus:** ★★★ Areena on yksi ruutu (ei kenttäsuunnittelua tai tasoloikkafysiikkaa). Bossit ovat dataohjattuja kuviolistoja (telegraph → isku → avautuminen). Agentti voi testata pelin Playwrightilla ajamalla skriptatut syötteet.
- **Animaatiotarve:** ★★ (keskitaso). Proseduraalinen nelijalkarigi (luut + siniaaltoinen kävely) riittää. Lähikuvat piirretään 2D-vektoreina repon `showdown/mg`-tyylillä.

### Vertailu
| | A Action | B Vuoro | C Hybridi |
|---|---|---|---|
| Tarinan tunne | ★★★ | ★★ | ★★★ |
| Kosketusohjaus | ★★ | ★★★ | ★★★ |
| Agentin toteutettavuus | ★★ | ★★★ | ★★★ |
| Animaatiotyö | raskas | kevyt | keskitaso |
| Cutscene-integraatio | erillinen | helppo | sisäänrakennettu (QTE) |

---

## 2. Suositus: **C – "Lauma-action"-hybridi**

**Perustelu:**
- Weedin tarinan ydin on *pieni koira, joka voittaa ylivoimaisen vihollisen ystäviensä avulla eikä tapa turhaan*. Hybridi tekee tästä mekaniikan: et voita bossia yksin, ja ratkaisevaa on, milloin käytät toverisi.
- Reaaliaikaisuus säilyttää taistelujen jännityksen, mutta yhden ruudun areena ja ele-ohjaus pitävät pelin toteutettavana ja puhelimeen sopivana.
- Vuoropohjaisen tilan voi lisätä myöhemmin helppoustasoksi ("Tarina-tila": QTE-ajat pitkiksi, väistöt automaattisiksi).

### 2.1 Tason rakenne (5–10 min/taso)
1. **Avaus-cutscene** (30–60 s): manga-paneelityylinen, 2D-vektorihahmot, tekstikuplat (suomi/englanti), Three.js-tausta.
2. **Matka-osuus** (1–3 min): auto-run tai lyhyt reaaliaikainen polku, jossa pyyhkäisyllä hypätään ja väistetään (rekat, kivivyöryt, lumimyrsky) ja napautuksella kaadetaan pikkuvihollisia. Matkalla **rekrytoidaan toveri**, joka avaa uuden laumakortin. Kevyt valinta, kuten "säästä/rankaise", vaikuttaa Weedin "Armo"-arvoon. Se on pieni hattu tarinan teemalle eikä vaikuta loppuun.
3. **Boss-taistelu** (2–4 min), 2–3 vaihetta, joiden välissä mini-cutscene.
4. **Koskettava hetki** (cutscene, 30–90 s). Usein se on jo integroitu bossin viimeiseen vaiheeseen.
5. **Tulosruutu:** saadut toverit, "Ōun henki" -tähdet ja muistikortti (avautuva kuvagalleria/muistelma).

### 2.2 Boss-mekaniikka
- **Areena:** yksi leveä ruutu (sivuprojektio), jonka kamera seuraa kevyesti.
- **Bossin rakenne datana:**
  `{ phases:[{ hp, patterns:[{tell:0.6s, attack:'charge', window:0.8s}], onEnd:'cutscene_x' }] }`
- **Pelaajan työkalut:**
  - **Napautus** bossin päällä = purenta (pieni vahinko, kerää "Henki"-mittaria).
  - **Pyyhkäisy** vasemmalle/oikealle/ylös = väistö tai hyppy. Täydellinen väistö (tell-ikkunan lopussa) hidastaa ajan ja avaa vastaiskun.
  - **Laumakortit** (2–4 kpl ruudun alareunassa): latautuvat ajan kuluessa, napautus kutsuu toverin. Esimerkkejä:
    - GB = harhautus (boss kääntyy)
    - Rocket = nopeat iskut
    - Hiro = tainnutus
    - Jerome = heikon kohdan paljastus
    - Akame = tiedustelu (näyttää seuraavan hyökkäyksen)
    - Mel = vesitason pelastus
  - **Battōga:** kun Henki-mittari on täynnä, pitkä painallus ja kaaren piirto. Onnistunut QTE tekee suuren vahingon ja näyttää 1–2 sekunnin elokuvallisen välähdyksen (Three.js-kamera ja hiukkaset).
  - **Zetsu Tenrō Battōga** avautuu vasta Hōgen-tasolla. Siinä on rytmi-QTE kolmella iskulla.
- **Tarinavaiheet bossissa:** viimeinen vaihe on usein **"skriptattu uhraus"**. Kun pelaaja käyttää tietyn kortin, siitä tulee cutscene (Smith, GB). Kortti häviää pysyvästi, mikä lisää painoa.
- **Häviö:** ei rangaistavaa, nopea uudelleenyritys vaiheen alusta. Kolmen häviön jälkeen tarjotaan "Tarina-tilaa".

### 2.3 Ohjaus puhelimella
- **Oletuksena vaaka-asento.** Areena on leveä ja cutscenet ovat elokuvallisia. Tasovalikko ja galleria toimivat pystyssä.
- Ei virtuaalista D-padia. Kaikki ohjaus on eleitä:
  - napautus = purenta
  - pyyhkäisy = väistö tai hyppy
  - pito + kaari = Battōga
  - korttien napautus
- Haptiikka: `navigator.vibrate` osumissa (Android). iOS:llä tilalle ruudun tärähdys.
- Kosketusalueet vähintään 48 px, peukaloalueet alakulmissa. Cutscenen voi ohittaa tai nopeuttaa pitkällä painalluksella.

### 2.4 Tekniikka ja Three.js:n käyttö
**Arkkitehtuuri:** yksi `index.html` + ES-moduulit, ei build-vaihetta (tai Vite). PWA:ksi `manifest.json` ja service worker offline-käyttöön.

- **Kaksi kerrosta:**
  1. **Three.js WebGL-taso** (tausta + FX):
     - **Parallax-maailmat:** 4–6 tasoa (vuoret, metsä, Gajōn linnake) maalattuina canvas-tekstuureina tai proseduraalisesti. Kevyt 2.5D-kamerasyvyys.
     - **Sää:** lumimyrsky (Hōgen), tulivuoren tuhka, meri (Hokkaidō), tulipalo (metsäpalo), padon kuohu (hybridi). Toteutus GPU-partikkeleina (`Points` + shader).
     - **Battōga-välähdys:** kamera kiertää hahmoa 0,8 s, speed-lines-shader, bloom (`UnrealBloomPass` kevyenä tai halvempi additiivinen hehku), lopuksi isku-flash ja ruudun tärähdys.
     - **Ōun henget** (Hōgen-finaali): läpikuultavat hehkuvat siluetit, jotka nousevat Weedin taakse (volumetrinen hehku ja hiukkaset).
     - **Cutscenejen kamera:** hitaat ajot ja zoomit paneelien yli.
  2. **2D Canvas -taso** (hahmot + UI):
     - Koirat piirretään **koodilla** proseduraalisena nelijalkarigillä. Rangassa on noin 12 luuta (selkä, kaula, pää, 4 × 2-osainen jalka, häntä), ja muodot ovat täytettyjä polkuja ja ääriviivoja Takahashin cel-tyyliin.
     - Kävely ja juoksu tehdään siniaaltojaksoilla. Pose-keyframet (`crouch`, `leap`, `bite`, `hurt`, `howl`) tallennetaan JSONiin.
     - Lähikuvat (cutscenet) ovat erillisiä isoja vektorimuotokuvia, joissa on ilmeriggi (silmät, korvat, suu, kyyneleet). Sama periaate kuin repon `showdown/mg/cast.js`:n `drawChar` + EXPR.
- **Miksi ei täyttä 3D-hahmoa:** nelijalkaisten 3D-hahmojen riggaus ilman editoria on raskasta. Repon kokemuksen mukaan VRoid-pohjaiset ratkaisut on tehty ihmisille, eikä koiramalleihin ole valmista putkea. 2D-vektorikoira näyttää enemmän mangalta ja on kevyempi puhelimelle.
- **Cutscene-järjestelmä:** data-ohjattu aikajana:
  `[{t:0, panel:'wide', bg:'alps_snow', chars:[['gb','sad',x,y]], text:'…', cam:{zoom:1.2}, sfx:'wind'}]`
  - Paneelirajat ja "manga-sivu"-siirtymät, efektisanat (ゴゴゴ-tyylinen ääniteksti suomeksi tai englanniksi).
  - Musiikki: rauhallinen pianoteema koskettaville hetkille ja taikoteema bosseille. Tekijänoikeusvapaata musiikkia, esimerkiksi omaa tai lisensoitua.
- **Suorituskyky:** DPR enintään 2, partikkelit 2–5 tuhatta, 60 fps tavoite ja automaattinen laadun alennus, jos frame-aika ylittää 20 ms.
- **Testaus agentille:** `?seed=…&autoplay=boss1` -tila, jossa skriptattu syöte ajaa taistelun. Playwright ottaa kuvakaappauksia ja ajaa fps-mittauksen (repossa on jo Playwright/Chromium).

### 2.5 Tasot ↔ arcit (11 tasoa)
| # | Taso | Arc | Uusi toveri / kortti | Boss | Koskettava hetki (cutscene) |
|---|---|---|---|---|---|
| 0 | **Prologi: Pieni mutta sitkeä** (tutorial) | Prologi | GB | (ei bossia, väistöharjoitus: rekat ja lumi) | Sakuran kuolema, GB antaa nimen |
| 1 | **Rosvojen tie** | Prologi | Mel, Smith | **Blue** | Blue suojelee Weediä rekalta |
| 2 | **Tuhottu paratiisi** | Kaibutsu | Ken & Kagetora, Jerome | **Kaibutsu, vaihe 1** (pakoon selviytyminen) | Tokimune/väärä Gin kuolee |
| 3 | **Neljä nuolta** | Kaibutsu | – | **Kaibutsu, vaiheet 2–3** | Smithin kivivyöry, Neljä nuolta, hirviön kohtalo (sääli) |
| 4 | **Alppien vangit** | Hōgen | Hiro, Rocket | **Hōgenin vartijat + Matsu** (minibossi) | Johnin viimeinen taistelu |
| 5 | **Hylättyjen pentujen kuningas** | Hōgen | Kyōshirō | **Lector & Thunder** (2 bossia yhtä aikaa) | Terun isä kuolee suojellessaan poikaa |
| 6 | **Kuuma lähde ja ninjat** | Hōgen | Tesshin (opettaa Zetsu Tenrō Battōgan) | **Sanchō-villisika** + **Kamakiri** | Weed oppii perintöliikkeen; Hiron kosto |
| 7 | **Lumimyrsky Futago-solalla** | Hōgen | Tōbee (lyhyesti) | **Genba** | Hōgen tappaa veljensä; Tōbee kuolee seisaaltaan |
| 7b | **Kapteenien kaksintaistelut** (loppusota) | Hōgen | Tesshin, Gin | **Hōgenin kapteenit: Kamakiri, Buruge, Batto ja Kite** (Kite = Kaito, teräksiset etujalat) | kapteenit lyödään ja säästetään, katuvat myöhemmin (canon-deep-dive.md jaksot 23–25) |
| 8 | **Ōun henget** (keskifinaali) | Hōgen | koko armeija | **Hōgen** (3 vaihetta, viimeinen "kuolemanjumala") | Henget nousevat, Weed säästää Hōgenin, Gin nimittää johtajaksi (+ valinnainen Jerome-muisto) |
| 9 | **Apinoiden vuori** | Shōgun | Yukimura (väliaikainen) | **Shōgun** (kirves → aseeton) | Hienin katumus, Yukimuran kuolema "hän oli veljesi" |
| 10 | **Pohjoinen meri** | Hokkaidō | Lydia, Maxim | **Boslev** (välissä) + **Victor** | Hakurōn loppu (hienovarainen), Mossin kuolema, Alam vetää Victorin mereen |
| 11 | **Isän itku** (finaali) | Hybridi | Joe | **Hybridi 1** + **Hybridi-isä** (padolla) | GB:n uhraus (kortti katoaa), Benin kuolema, Joe ja Gin, Orion syntyy |

- **Pelin pituus:** noin 12 tasoa (0–11). **Lyhyt 8 tason versio:** yhdistä 1+2, 4+5 ja 6+7.
- **Bonuksena** (myöhemmin): Riki-prologi ja Orion "kausi 2".

### 2.6 MVP-rajaus (ensimmäinen pelattava)
**Taso 3 "Neljä nuolta": Kaibutsu-boss.** Tarina on itsenäinen, boss on visuaalinen ja tunne vahva. Siinä on lauma (Jerome + GB + Smith-kortti), ja se testaa kaikki järjestelmät.

MVP:n sisältö:
1. **Engine-runko:** Three.js-taustataso (vuorten parallax + lumi/pöly-partikkelit + Gajōn kivilinnake) + 2D-canvas-hahmotaso + ele-syötteet + pelisilmukka.
2. **Weed proseduraalisena koirarigina:** idle, juoksu, väistö, hyppy, purenta, osuma, Battōga-pyörähdys.
3. **Kaibutsu:** iso koirarigi + harja, 3 hyökkäyskuviota (syöksy, kivenheitto, lyönti), heikko kohta vasemmassa kyljessä, joka hehkuu, kun Jerome-kortti paljastaa sen.
4. **Kortit:** GB (harhautus), Jerome (paljastus), **Smith** (käytettäessä skriptattu uhraus-cutscene, jossa kivivyöry; vaihe 2 alkaa).
5. **Battōga-QTE** (kaaren piirto) + Three.js-kameravälähdys.
6. **Kaksi cutscenea:** "Neljä nuolta" (lyhyt, 3 paneelia) ja loppu (hirviön kohtalo, Jeromen syyllisyys).
7. **PWA-manifesti**, vaaka-asennon lukitus/kehotus ja Playwright-autoplay-testi.

Hyväksymiskriteerit:
- Pelattavissa alusta loppuun puhelimella noin 5 minuutissa.
- Vähintään 50 fps keskitason Android-puhelimella.
- Cutscene ohitettavissa.
- Häviön jälkeen pääsee jatkamaan vaiheen alusta.

### 2.7 Tekijänoikeus
Hahmot ja tarina ovat Takahashi Yoshihiron / Nihon Bungeishan omaisuutta. Peli kannattaa pitää **ilmaisena, ei-kaupallisena fanipelinä** ilman virallisia kuvia, logoja tai animen musiikkia/ääniä, koska oikeudenomistaja voi silti vaatia sen poistamista.

---

## 3. Avoimet kysymykset käyttäjälle
1. **Kanoni:** seurataanko animea (Jerome kuolee, Hōgeniin iskee salama, Weed on ainoa poika) vai mangaa (veljet, Shōgun, Hokkaidō, hybridit)? Suositus: **mangan juoni**, mutta animen Jerome-kohtaus valinnaisena muistona tai vaihtoehtoisena loppuna.
2. **Väkivallan taso:** manga on erittäin raaka (kastroinnit, sisäelimet, joukkoitsemurha). Ehdotan PEGI 12 -tasoa: veri tyyliteltynä, kuolemat ruudun ulkopuolella tai siluetteina.
3. **Kieli:** suomi, englanti vai molemmat? Ääninäyttely (ElevenLabs) vai pelkkä teksti?
4. **Asento:** vaaka (suositus) vai pysty?
5. **Taideohjaus:** Takahashi-henkinen cel-ääriviiva vai pehmeämpi maalauksellinen tyyli?
6. **Laajuus:** 8 vai 12 tasoa? Orion myöhemmin?
