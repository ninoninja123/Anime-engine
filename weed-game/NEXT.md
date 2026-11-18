# Tila, puutteet ja arvio jatkosta

## Tehty tässä vaiheessa (2026-11-18)
- **Omat mallit pääosiin**: Weed, Kaibutsu, Smith, Kagetora (striped_a), Kurotora (striped_b), Rocket, Tōbee, Moss (tobei sävytettynä).
  Mallit optimoitu ~21 MB → ~1,1 MB (`tools/optimize-models.mjs`), ladataan laiskasti (taso 2 lataa vain tarvitsemansa).
- **Koiratehdas** (`dog_parts.glb`): Gin, Jerome, Ken, Robert, Rocker, Heuler, Akame, John, Ben, GB, Lector, Thunder, Hōgen,
  Genba + roster-agentin geneeriset joukkovariantit. Parametrit: jalan pituus/paksuus, vartalo, kaula, pää, korvat (pystyt/luimussa),
  häntä (kippura/suora/sapeli/typistetty), kuono; kuviot verteksiväreinä (satula, maski, tan points, kulmat, brindle, pilkut, sukat, arpi).
- **Animaatiot**: yhteinen proseduraalinen animaattori ristihäivytyksellä. Jäykille malleille vertex-shaderin **pehmeä rigi**
  (etu/taka × vasen/oikea jalka, pää, häntä → etu- ja takajalat vastakkain), Smithille kolmijalkainen askellus,
  Battōga = kyyristys + korkkiruuvipyörähdys (eteenpäin + kierre) + iskujälki.
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
- Jäykkien mallien pehmeä rigi on approksimaatio: jyrkissä asennoissa (laukka, kuolema) vartalon ja jalan liitos venyy,
  ja leveäturkkisilla (Smith, Kaibutsun harja) pää-alue ulottuu rintaan. Parempi: Blender-rigi (auto-rig) ja oikeat luut.
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
