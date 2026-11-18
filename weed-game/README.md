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
src/accessories.js       lisäosat tehdaskoirille (roster-agentti) · src/data/roster_specs.js geneeriset joukkovariantit
src/audio.js             Epidemic-musiikki ristiinhäivytyksellä, ducking, tehosteet, syntetisoitu varajärjestelmä
src/voice.js             japaninkieliset puheäänet + englanninkielinen tekstitys, ajastus ilman äänitiedostoja
src/data/lines.js        KAIKKI repliikit: ja/en, tunne, näyttelijäohje, intensiteetti, tauot (voice-manifesti)
src/scenes.js            datapohjainen kohtausohjaus (kamera-avainkuvat, orbit, dolly, slow-mo, freeze-frame, valot…)
src/data/scenes_level2.js tason kohtaukset: intro, Smithin uhraus, Neljä nuolta, Battōga-finaali, jälkikohtaus
src/level2.js            taistelu, bossin tekoäly, kortit/special movet, vaiheet
src/main.js              käynnistys, valikko, Lauma-galleria (kaikki hahmot pyörivinä ja animoituina), asetukset
tools/optimize-models.mjs  assets/models-src/*.glb -> public/models/*.glb (WebP, simplify, meshopt)
tools/voices.mjs         public/audio/voice/manifest.json + docs/VOICE_LINES.md
tools/shots.cjs          Playwright-läpiajo + kuvakaappaukset -> screenshots/
tools/deploy-cf.py       julkaisu Cloudflare Workeriksi (Workers KV)
```

### Animaatiot
Kaikilla hahmoilla sama poseformaatti: `Idle, Idle_2, Idle_2_HeadLow, Walk, Gallop, Gallop_Jump, Jump_ToIdle, Attack, Bark,
Howl, Eating, Idle_HitReact1/2, Death, LieDown, Battoga` + hännän heilutus, korvien värähdys, hengitys, squash & stretch.
- **Jäykät mallit** (Weed, Kaibutsu, Smith, Kagetora, Kurotora, Rocket, Tōbee, Moss): vertex-shaderin pehmeä rigi jakaa
  mallin automaattisesti alueisiin (etu-/takajalat × vasen/oikea, pää, häntä) ja kiertää ne nivelpisteiden ympäri, joten
  etu- ja takajalat liikkuvat vastakkain. Smithillä kolmijalkainen "limp3"-askellus.
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

## Grafiikka (renderöinti, tunnelma, tehosteet)

```
src/engine.js        renderöijä, pelisilmukka, elokuvakamera (tärinä + FOV-isku, käsivara cutsceneissä, rack focus)
src/gfx/quality.js   laatutasot low / med / high + dynaaminen resoluutio (fps < 50 -> 3D-resoluutio alas, lopuksi taso alas)
src/gfx/post.js      oma kevyt jälkikäsittely: HDR + MSAA -> bloom (dual kawase) -> god rays, kromaattinen aberraatio,
                     tilt-shift / syvyys-DoF, ACES, värigradaatio, vinjetti, filmirae, impact frame, nopeuslinjat, iris/häivytys
src/gfx/mood.js      tunnelmat: night, rage, storm, grief, spirit, finale, dawn, memorial (taivas, sumu, valot, sää, gradaatio)
src/gfx/toon.js      cel-varjostuksen rajapinta hahmo- ja ympäristökoodille (alla)
src/gfx/ui.css       anime-tyylinen HUD/valikko (ylikirjoittaa style.css:n ulkoasun, ei rakennetta)
src/world.js         proseduraalinen taivas (tähdet, kuu, revontulet, pilvet, auringonnousu), maalatut parallax-vuoret,
                     kalliot, vesiputous, instansoitu mäntymetsä, kimaltava lumi, usvakerrokset, varjot, lumisade
src/fx.js            GPU-partikkelipoolit, shokkiaallot, valopilarit, iskutähdet, henkisiluetit, kuvajäljet, kivimurska
tools/gfx-shots.cjs  grafiikan ennen/jälkeen-kaappaukset -> screenshots/gfx/
```

**Laatutasot:** automaattinen valinta (heikko puhelin = low, puhelin = med, työpöytä = high). Pakotus: `?lowfx`, `?q=med`, `?hq`.
`?fps` näyttää fps:n, tason, resoluutioskaalan ja piirtokutsut. `?fixedres` poistaa dynaamisen resoluution.

| | low | med | high |
|---|---|---|---|
| Jälkikäsittely (bloom, gradaatio, god rays, CA, rae) | – (renderöijän ACES) | kyllä, bloom 3 tasoa | kyllä, bloom 4 tasoa |
| Varjokartta | – (vain läiskävarjo) | 1024 PCF soft | 2048 PCF soft |
| Syväterävyys cutsceneissä | – | tilt-shift | syvyyspohjainen rack focus |
| MSAA / max DPR | 4x (canvas) / 1.25 | 4x / 1.5 | 4x / 2.0 |
| Partikkelit, usvakerrokset | 50 %, 1 | 100 %, 3 | 150 %, 3 |

**Tunnelma on automaattinen:** `mood.js`:n ohjaaja lukee pelitilan (`window.__S`: vaihe, panssari, cutscene) ja
kohtausskriptin `light: { rim }` -arvon (rim > 1.25 vaiheessa 3 = aamunkoitto), joten pelilogiikan ei tarvitse kutsua
grafiikkaa. Käsin: `E.setMood('dawn', 4)` (pysyy, kunnes vaihe/cutscene vaihtuu). `FX.spiritLight` vaihtaa itse
suruun / henkiin / muistohetkeen, `FX.slashArc` finaalissa revontuliin.

### Rajapinta hahmokoodille (`src/gfx/toon.js`, `src/fx.js`)
```js
import { applyToonMaterial, makeToonMaterial, makeOutlineMaterial, addOutline, toonRamp } from './gfx/toon.js';
applyToonMaterial(meshTaiObjekti, { steps: 3, rim: 1, rimWidth: 0.38, outline: 0.0032, castShadow: true });
//  MeshToonMaterial päivitetään PAIKALLAAN (dog.mat, setTint, fade, map ja vertexColors säilyvät, oma onBeforeCompile ketjutetaan);
//  Standard/Lambert/Phong korvataan MeshToonMaterialilla (convert: false estää).
makeToonMaterial({ color, map, steps, rim, snow: 0.75, detail: 1, flatShading: true });   // ympäristö: lumi yläpinnoille, kalliokuvio
FX.afterimage(dog, 0x8fc8ff);      // jäädytetty hehkuva kuvajälki (special movet)
FX.spiritGhost(dog, 0xbfe0ff, 4);  // henki nousee hahmosta
FX.lightPillar(pos, color, sek, korkeus);  FX.hitStar(pos);  FX.embers(pos, n);  FX.mistPlume(pos);  FX.breath(pos, suunta);
```
- **Automatiikka:** kohtaus skannataan 2 x sekunnissa; jokainen `MeshToonMaterial` saa rim-valon ja heittää varjon.
  Jos samassa vanhemmassa on saman geometrian ääriviivakuori (MeshBasicMaterial, BackSide), sen `onBeforeCompile`
  (pehmeä rigi) lainataan varjokartan syvyysmateriaaliin ja henki-/kuvajälkikopioihin – varjo ja haamut seuraavat asentoa.
  Ohitus: `object.userData.noGfx = true` (kaikki) tai `userData.castShadow = false`.
- **Automaattiset tehosteet** (`window.__game.cast`): hengityshöyry (`dog.headPivot`), juoksun lumipölly, Weedin
  Battōga-kuvajäljet (`dog.spin.rotation.z`), Kaibutsun raivon kekäleet ja heikon kohdan kipinät, usva putoamisessa.
- Vanha API toimii ennallaan: `E.rimLight.intensity`, `E.snow.uniforms.uWind`, `E.cliff`, `E.lowFx`, `gradientMap` (dogs.js),
  `FX.burst/dust/ring/slashArc/spiritLight/flash/impact/speedLines`, `shake()` (lisää nyt myös FOV-iskun ja CA:n).
  `E.scene.fog.color` ja `renderer.toneMappingExposure` ovat tunnelman ohjaamia (kirjoitukset ylikirjoittuvat).
