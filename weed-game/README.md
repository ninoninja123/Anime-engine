# Weed – Ōu Saga (fanipelin pelattava luonnos, vertical slice)

Epävirallinen, ei-kaupallinen fanipelin **luonnos** (Three.js, puhelin vaakatasossa). Yksi taso:
**Level 2 "Gajō – Kaibutsu"** cutsceneineen. Suunnittelu: `../docs/weed-game/game-design.md`, tarina: `../docs/weed-game/research.md`.

- **Kieli:** käyttöliittymä ja tekstitys **englanniksi**, hahmot **puhuvat japania** (tekstitys päälle/pois, japaninkielinen rivi päälle/pois).
- **Hahmot:** käyttäjän omat 3D-mallit (Tripo) pääosille + **koiratehdas** (`dog_parts.glb`) muille. Ks. CREDITS.md.
- **Live:** https://weed-game.huone-k7q2.workers.dev/

## Ajaminen

```bash
cd weed-game
npm install
npm run dev        # kehityspalvelin (vite --host), lähiverkko-osoite puhelimelle
npm run build      # -> dist/ (ajaa ensin `npm run voices`)
npm run preview    # buildin esikatselu
```

Testilinkit: `?play=1` (intro), `?phase=2&nointro`, `?phase=3&nointro`, `?gallery=0`, `?lowfx` (kevyet tehosteet),
`?synthaudio` (pelkkä syntetisoitu ääni), `?rigdebug` (pehmeän rigin painot väreinä), `?partdbg` (koiratehtaan osat väreinä).
Konsolissa `__game.debug` (esim. `__game.debug.fillHenki()`, `__game.debug.card('jerome')`).

## Ohjaus

| Ele | Toiminto |
|---|---|
| Napautus | Weed puree |
| Pyyhkäisy ←/→ | väistö · täydellinen väistö = slow-mo + Spirit |
| Pyyhkäisy ↑ | hyppy |
| Ympyrä ⟳ | **Battōga** (kun Spirit on täynnä) |
| Laumakortit | special movet: **Jerome** (heikon kohdan analyysi), **Ken & Kagetora** (Twin Fang), **Smith** (uhraus, cutscene) |
| Napautus special moven aikana / "Skip" / pitkä painallus | ohita |

## Rakenne

```
src/characters.js        hahmoluettelo (malli, kierto, korkeus, rigi, värit, kuviot, mittasuhteet, askellus)
src/dogs.js              mallien laiska lataus + normalisointi (+X, jalat y=0), pehmeä rigi (vertex shader) jäykille
                         malleille, koiratehdas (nivelhierarkia + verteksivärimaalaus), proseduraalinen animaattori
src/face.js              tehdaskoirien anime-kasvot: silmät (ilmeet, räpäytys, katse), kulmat, suu+hampaat, nenä
src/accessories.js       lisäosat tehdaskoirille (roster-agentti) · src/data/roster_specs.js geneeriset joukkovariantit
src/audio.js             Epidemic-musiikki ristiinhäivytyksellä, ducking, tehosteet, syntetisoitu varajärjestelmä
src/voice.js             japaninkieliset puheäänet + englanninkielinen tekstitys, ajastus ilman äänitiedostoja
src/data/lines.js        KAIKKI repliikit: ja/en, tunne, näyttelijäohje, intensiteetti, tauot (voice-manifesti)
src/scenes.js            datapohjainen kohtausohjaus (kamera-avainkuvat, orbit, dolly, slow-mo, freeze-frame, valot…)
src/data/scenes_level2.js tason kohtaukset: intro, Smithin uhraus, Neljä nuolta, Battōga-finaali, jälkikohtaus
src/level2.js            taistelu, bossin tekoäly, kortit/special movet, vaiheet
src/main.js              käynnistys, valikko, Lauma-galleria (kaikki hahmot pyörivinä ja animoituina), asetukset
tools/optimize-models.mjs  assets/models-src/*.glb -> public/models/*.glb (WebP, simplify, meshopt)
tools/rig_dog_standalone.py  Geminin auto-riggaaja (staattinen GLB -> 24 luuta + 9 klippiä)
tools/voices.mjs         public/audio/voice/manifest.json + docs/VOICE_LINES.md
tools/shots.cjs          Playwright-läpiajo + kuvakaappaukset -> screenshots/
tools/deploy-cf.py       julkaisu Cloudflare Workeriksi (Workers KV)
```

### Animaatiot
Kaikilla hahmoilla sama poseformaatti: `Idle, Idle_2, Idle_2_HeadLow, Walk, Gallop, Gallop_Jump, Jump_ToIdle, Attack, Bark,
Howl, Eating, Idle_HitReact1/2, Death, LieDown, Battoga` + hännän heilutus, korvien värähdys, hengitys, squash & stretch.
- **Rigatut mallit** (kind `rigged`: Weed, Kagetora, Kaibutsu, Smith, Kurotora, Rocket, Tōbee, Moss, Hōgen, Genba):
  AnimationMixer + mallin omat klipit (idle, walk, run, jump, bite, hurt, die, battoga, zetsu_tenrou_battouga), pelin
  animaationimet kartoitetaan klippeihin (`CLIPMAP` dogs.js:ssä). Weedin finaali = **Zetsu Tenrō Battōga** (1080° kierre)
  + tuulipyörre-VFX (idea Geminin `src/ext/dog_combat.js`:stä).
- **Jäykät mallit** (kind `rigid`, varajärjestelmä): vertex-shaderin pehmeä rigi (etu/taka × vasen/oikea jalka, pää, häntä).
- **Tehdaskoirat**: oikeat nivelet (lonkat, olat, kaula, pää, korvat, häntä), pivotit lasketaan geometriasta.

## Äänet
- Musiikki ja tehosteet: **Epidemic Sound** (käyttäjän lisenssi), tiedot CREDITS.md:ssä.
- **`public/audio/mus_*.mp3` ja `sfx_*.mp3` EIVÄT ole gitissä** (julkinen repo; .gitignore). Ne ovat vain tässä
  ympäristössä ja julkaistussa pelissä. Jos ne puuttuvat, peli käyttää syntetisoitua ääntä.
- Ääni alkaa vasta käyttäjän ensimmäisestä napautuksesta (mobiilin autoplay-sääntö) ja ladataan laiskasti.
- **Puheäänet puuttuvat vielä.** Pudota tiedostot `public/audio/voice/<who>_<id>.mp3` (nimet: `docs/VOICE_LINES.md`)
  ja aja `npm run voices` (tai `npm run build`) – ei koodimuutoksia.

## Julkaisu (Cloudflare Worker + Workers KV)
```bash
npm run build && python3 tools/deploy-cf.py      # oletus: tili 44ae83ec…, worker "weed-game"
URL=https://weed-game.huone-k7q2.workers.dev/ node tools/shots.cjs live   # tarkistus: sivu, mallit, äänet
```
Aja **samassa ympäristössä, jossa `public/audio/` on** (muuten julkaisuun ei tule ääniä). Skripti lataa dist/-tiedostot
KV:hen sisältöosoitteisina (vain muuttuneet), julkaisee pienen workerin (manifesti) ja poistaa vanhat avaimet.
Worker palvelee oikeat Content-Type-, Cache-Control-, ETag- ja **Range**-otsikot (iOS Safari).

## Testaus
```bash
npm run build && (npx vite preview --port 4187 --strictPort &)
URL=http://localhost:4187/ node tools/shots.cjs all       # menu, gallery, intro, battle+specials
URL=http://localhost:4187/ node tools/shots.cjs story     # koko tarina: Smith, Neljä nuolta, finaali, aamunkoitto
```
Kaappaukset: `screenshots/` (844×390, DPR 2).
