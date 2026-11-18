# Tila, puutteet ja arvio jatkosta

## Tehty tässä vaiheessa (2026-11-18)
- **Omat mallit pääosiin**: Weed, Kaibutsu, Smith, Kagetora (striped_a), Kurotora (striped_b), Rocket, Tōbee, Moss (tobei sävytettynä).
  Mallit optimoitu ~21 MB → ~1,1 MB (`tools/optimize-models.mjs`), ladataan laiskasti (taso 2 lataa vain tarvitsemansa).
- **Koiratehdas** (`dog_parts.glb`): Gin, Jerome, Ken, Robert, Rocker, Heuler, Akame, John, Ben, GB, Lector, Thunder, Hōgen,
  Genba + roster-agentin geneeriset joukkovariantit. Parametrit: jalan pituus/paksuus, vartalo, kaula, pää, korvat (pystyt/luimussa),
  häntä (kippura/suora/sapeli/typistetty), kuono; kuviot verteksiväreinä (satula, maski, tan points, kulmat, brindle, pilkut, sukat, arpi).
- **Animaatiot**: kaikki käyttäjän omat mallit ovat nyt **rigattuja** (Weed & Kagetora: Gemini; Kaibutsu, Smith, Kurotora,
  Rocket, Tōbee/Moss, Hōgen/Genba: `tools/rig_dog_standalone.py` auto-rig, tarkistettu renderillä) ja käyttävät oikeita
  klippejä AnimationMixerilla. Tehdaskoirilla proseduraalinen animaattori (nivelet). Battōga = klippi + tuulipyörre;
  finaalissa **Zetsu Tenrō Battōga** (1080°). Jäykän mallin vertex-shader-rigi on jäljellä varajärjestelmänä.
- **Tehdaskoirien kasvot** (`src/face.js`): anime-silmät (iiris hahmon värillä, pupilli, 2 heijastusta, luomiviiva),
  ilmeet neutral/determined/angry/sad/happy/closed/hurt/dead/surprised, räpäytys, katse, kulmakarvat tai dobermann-pisteet,
  suu joka aukeaa purressa (hampaat), kiiltävä nenä, korvan sisäväri. Kohtauksissa `{ expr: 'jerome', name: 'sad' }`.
- **Englanti + japanilainen puhe**: kaikki UI englanniksi, 43 repliikkiä (ja/en, tunne, näyttelijäohje, intensiteetti, tauot)
  `src/data/lines.js` → `docs/VOICE_LINES.md`. Tekstitys on/off ja japaninkielinen rivi on/off. Ilman äänitiedostoja ajastus
  merkkimäärän mukaan.
- **Kohtausohjaus datana** (`src/scenes.js`, `src/data/scenes_level2.js`): pre-battle (saapuminen, lauma, Weedin lupaus,
  Jeromen joukko, Kaibutsu), Smithin uhraus, Neljä nuolta, Battōga-finaali, vesiputous, aamunkoitto, hiljainen hetki,
  muistohetki, Jerome jää laumaan, Gin-viittaus/toivo. Kamerat: matala kulma, orbit, dolly, freeze-frame, valaistusmuutokset.
- **Special movet** (laumakortit): anime-cut-in (nimi, liike, japani, nopeuslinjat) + slow-mo, Jerome: analyysisilmäys
  lähikuvassa → whip-pan → tähtäin ja hehku heikkoon kohtaan; Ken & Kagetora: kahden kaistan rynnäkkö, ristikkäinen
  pyörivä X-isku, shockwave, freeze-frame, paluu. Napautus ohittaa. Korteissa latausrengas + READY-välke.
- **Äänet**: Epidemic Sound -musiikki (intro/battle/sad/dawn) ristiinhäivytyksellä, ducking puheen/iskujen ajaksi,
  11 tehostetta + lumimyrsky-ambienssi; syntetisoitu varajärjestelmä.
- **Julkaisu**: Cloudflare Worker + Workers KV (`tools/deploy-cf.py`), Range-tuki.

## Puuttuu / tunnetut ongelmat
- **Puheäänitiedostot puuttuvat** (rakenteet valmiit). ElevenLabs-MCP oli tämän session lopussa yhteydessä, mutta ääniä ei
  generoitu (käyttäjän krediitit) – seuraava askel: valitse ääni per hahmo ja generoi `docs/VOICE_LINES.md`:n mukaan.
- Auto-rigatuissa malleissa painot ovat automaattiset: Kaibutsun etujalka venyy laukan ääriasennossa, Smithin 3-jalkaisuus
  ei näy animaatiossa (4 jalan klipit). Tehdaskoiran siirto rigatulle pohjalle (`base_rigged.glb`: parempi veistos, valkoinen
  tekstuuri → sävytettävissä luminanssi × väri, kuviot luupainoista) on seuraava askel – ei ehditty tässä sessiossa.
- Tehdaskoirien mittasuhteet ovat yhden perusmallin varassa (akita-tyyppinen pää); dobermann/tanskandoggi-kuonot
  pidennetään geometriassa mutta kallon muoto pysyy.
- Kasvoilmeet (silmät, suu) puuttuvat; tunne tulee kamerasta, valosta, musiikista ja puheesta.
- Headless-testit ovat ohjelmistorenderöinnillä (swiftshader) hitaita; oikean puhelimen fps mittaamatta.
- Epidemic-tiedostot eivät ole gitissä → julkaisu on ajettava ympäristöstä, jossa `public/audio/` on.

## Arvio tasoista 1, 3–8
Moottori, koiratehdas, kohtausohjaus ja ääni-/puhejärjestelmä ovat nyt valmiita, joten uusi taso on pääosin
**dataa (kohtausskriptit + repliikit) + 1 uusi boss-kuvio**.

| Taso | Sisältö (research.md) | Uutta tekniikkaa | Työmäärä* |
|---|---|---|---|
| 1 Prologi / Rosvojen tie | GB, Mel, Smith, Blue suojelee rekalta | auto-run, rekka | M |
| 4 Alppien vangit | Hōgenin vartijat, Johnin viimeinen taistelu | monta pikkuvihollista | M |
| 5 Hylättyjen pentujen kuningas | Kyōshirō, Lector & Thunder | kaksoisbossi | M |
| 6 Kuuma lähde | Tesshin, Zetsu Tenrō Battōga, Sanchō-villisika | rytmi-QTE | M–L |
| 7 Futago-solan lumimyrsky | Genba, Hōgen, Tōbee kuolee seisaaltaan | myrsky, raskaat kohtaukset | M |
| 8 Ōun henget | Hōgen (3 vaihetta), henget nousevat, Weed säästää | henkisiluetit, finaali | L |

*S ≈ 1 agenttisessio, M ≈ 2–3, L ≈ 4–5. Kokonaisuus ~12–20 sessiota + puheäänet (1 sessio, ElevenLabs) +
1–2 sessiota mallien rigaukseen (suurin laadun parannus).
