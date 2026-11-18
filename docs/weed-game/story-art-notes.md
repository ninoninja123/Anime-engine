# Alkucutscenen kuvitukset ("The story so far")

Peli: `weed-game/src/prologue.js` + `weed-game/src/data/scenes_prologue.js`.
Kuvat: `weed-game/public/story/*.webp`. Ne **eivät ole gitissä** (`.gitignore`), vaan julkaistaan paikallisesta kansiosta
samaan tapaan kuin Epidemic-äänet. Jos kuva puuttuu, peli piirtää paneelille koodilla maalatun varakuvan
(taivasgradientti, kuu tai aurinko, kerroksittaiset vuorenharjanteet ja usva; värit `paint`-kentästä).

## Generointi

- **Palvelu:** ElevenLabs Creative (MCP), flow "Weed game – prologue story art" (`hnMSvhhr1dVHTQegzT2n`)
- **Malli:** `gpt-image-2.5-sunburst`, 16:9, resoluutio 1K (1280×720), quality high, 1 variaatio per kuva
- **Kustannus:** 9 kuvaa × 190,36 krediittiä = **≈ 1 713 krediittiä** (≈ 9 × 3,46 senttiä = **≈ 0,31 USD**). Ei uudelleenyrityksiä.
- **Jälkikäsittely:** PNG → WebP (sharp, quality 80, alkuperäinen 1280 px leveys, ei skaalausta ylöspäin). Yhteensä ≈ 1,5 Mt.
  Viimeinen paneeli sävytetään pelissä syksyiseksi (CSS-filter), koska canonissa Weedin matka Ōuhun tapahtuu myöhäissyksyllä.

## Tiedostot ja promptit

Kaikkien kuvien yhteinen tyyli: *hand-painted 1980s Japanese anime background art, gouache (and watercolor) texture,
visible brush strokes, film grain, 16:9 landscape, no text, no letters, no logos, no watermark*. Hahmot ovat siluetteja
tai kaukana, eikä yksikään kuva yritä jäljitellä virallisia hahmomalleja.

| Tiedosto | Paneeli | Prompt (tiivistelmä, tyylirivit poistettu) |
|---|---|---|
| `01_moon.webp` | Otsikko / legenda | Night in the Ōu mountains of northern Japan: layers of jagged snow-dusted peaks receding into blue mist, a huge pale full moon low over the far ridge, cold silver-blue moonlight. On a rocky outcrop in the lower right third, the small distant silhouette of a lone silver-coated Akita dog standing proud, facing the moon. Pine trees in dark foreground silhouette. Empty sky upper left for a title. No humans. |
| `02_village.webp` | Gin, Gohee, Daisuke | Remote snowy mountain village at dusk: a lone wooden farmhouse with glowing windows, chimney smoke, birch trees, violet-orange sky. On the snowy path three tiny silhouettes walk toward the mountains seen from behind: an old bearded hunter in a straw-and-fur coat with a long rifle, a young boy, and a small silver Akita puppy. No faces visible. |
| `03_akakabuto.webp` | Akakabuto ja Gajō | Blizzard on a high mountain pass at night. On top of a towering natural rock fortress of cliffs and caves sits a colossal brown bear, a dark looming silhouette, a crest of blood-red fur on its head, one glowing furious eye. Shattered trees and claw marks. Red, black and cold blue palette. No humans. |
| `04_army.webp` | Ōu-armeija | Dawn over snowy ridges. Along the crest stands a great army of dogs of many breeds (Akitas, Kai Ken, Great Danes, Dobermans, Shepherds, Tosas), backlit with golden rim light. At the front, on a rock, a young silver Akita leader with head raised. No humans. |
| `05_battoga.webp` | Battōga, Akakabuton kaatuminen | Snowstorm on a rocky pass: a silver Akita leaps spinning like a drill inside a spiralling vortex of wind and snow, fangs bared, at the throat of a colossal dark bear with a blood-red fur crest rearing up on the right. Painted speed lines. No humans. |
| `06_paradise.webp` | 14 vuoden rauha | Peaceful green mountain valley: tall waterfall into a clear pool, mist and a soft rainbow, cedar forest, wildflowers; small distant dogs resting and playing. Warm sunlight, dandelion seeds. No humans. |
| `07_lab.webp` | Laboratorio, Kaibutsu | Night, heavy rain. A dark pharmaceutical research lab at the forest edge, flickering windows, red emergency light. In the foreground a huge steel cage torn open from inside, bent bars, broken chains; giant paw prints lead into the forest; far away a hulking beast silhouette with a lion-like mane and burning orange eyes. No text/signs, no humans. |
| `08_hunt.webp` | Tuhottu paratiisi, metsästäjät | Dark mountain forest at night. Flashlight beams cut through mist; tiny distant faceless silhouettes of men with hunting rifles and lanterns; two frightened dogs crouch in the ferns in the foreground. |
| `09_weed.webp` | Weed matkalla | Sunrise on a high mountain road. A small young dog seen from behind: mostly white with a silver-grey sheen, curled tail, ears up, looking at vast misty mountain ranges; a thin road winds toward the peaks; god rays. No humans. |

Täydet promptit ja generoinnit löytyvät ElevenLabs-flow'sta.

## Kerronnan canon-pohja

Lähteet: `research.md`, `canon-deep-dive.md`, `canon-corrections.md`.

- Gin on karhukoirien sukua oleva akita, jonka kasvattivat metsästäjä Gohee ja poika Daisuke. Gajō on Futago-solalla
  (anime: 二子峠), ja siellä hallitsi jättikarhu Akakabuto. Gin kokosi Ōun koirat armeijaksi, ja Akakabuto kaadettiin
  (monet kaatuivat, mm. Kagetoran setä Akatora). Gin nousi Ōun **総大将**:ksi.
- Akakabuton kaatumisesta kului **14 vuotta** rauhaa, ennen kuin hirviö hyökkäsi Ōuhun [VARMA, deep-dive §2 jakso 1].
- Kaibutsu (P4) on ihmisten laboratoriokokeiden tulos ja on vallannut Gajōn. Paratiisi on romahtanut, metsä kuihtuu,
  koiria on kuollut, ja metsästäjät ampuvat koiria [VARMA, jaksot 2–3].
- Gin on poissa pitkällä kiertomatkalla [VARMA, jakso 1].
- Weed (Ginin poika) on matkalla Ōuhun myöhäissyksyllä [VARMA].

**Jätetty pois tai muotoiltu yleisesti:** Akakabuton kaatamisen yksityiskohdat (kuka puri ja mitä tapahtui ihmisille),
nimetyt kuolleet Gin-sarjasta, Riki ja Battōgan alkuperä, se, *miksi* Gin on poissa (vanha tutkimus väitti "Sakuraa
etsimässä", mutta canonin mukaan kyse on kiertomatkasta), ja väite, että ihmiset luulivat koirien tappaneen ihmisiä
(ei varmistettu). Sakura, GB ja Smith on jätetty pois, jotta kohtaus pysyy lyhyenä. Tason 2 oma intro jatkaa siitä.
