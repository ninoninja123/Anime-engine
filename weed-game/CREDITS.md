# Tekijät ja lisenssit

## 3D-mallit (käyttäjän omat, Tripo AI -generoidut; rigit Gemini / Tripo auto-rig)
Lähteet `assets/models-src/*.glb`. Peliin optimoidaan `tools/optimize-models.mjs`:llä (normal/roughness-kartat pois,
768–1024 px WebP, geometrian yksinkertaistus ~45–60 %, meshopt; skinnaus ja klipit säilyvät) → `public/models/` (~1,8 MB).

| Pelin malli | Lähde | Hahmo(t) | Rigi / animaatiot |
|---|---|---|---|
| `weed_rigged.glb` | käyttäjän husky (Tripo) | **Weed** | käyttäjän Gemini: 24 luuta, 9 klippiä (idle, walk, run, jump, bite, hurt, die, battoga, zetsu_tenrou_battouga) |
| `kagetora_rigged.glb` | `striped_a.glb` | **Kagetora** | Gemini, kuten yllä |
| `kaibutsu_rigged.glb` | `kaibutsu.glb` | **Kaibutsu (P4)** | `tools/rig_dog_standalone.py` (Gemini, auto-rig) – peilattu takaisin, jotta karvaton laikku on vasemmassa kyljessä |
| `smith_rigged.glb` | `smith.glb` | **Smith** (kolmijalkainen) | auto-rig |
| `striped_b_rigged.glb` | `striped_b.glb` | **Kurotora** | auto-rig |
| `rocket_rigged.glb` | `rocket.glb` | **Rocket** | auto-rig |
| `tobei_rigged.glb` | `tobei.glb` | **Tōbee**, **Moss** (sävytetty) | auto-rig |
| `hogen_rigged.glb` | `hogen.glb` (käyttäjän toimittama) | **Hōgen**, **Genba** (sävytetty) | auto-rig |
| `gin_auto.glb` | `gin_rigged.glb` (käyttäjän Tripo-rigi, ei klippejä) | **Gin** | uudelleenrigattu `rig_dog_standalone.py`:llä → 9 klippiä |
| `john_auto.glb` | `john.glb` (susimainen) | **John** | auto-rig |
| `tesshin_auto.glb` | `tesshin.glb` | **Tesshin** | auto-rig |
| `dog_parts.glb` | käyttäjän 13-osainen peruskoira | **koiratehdas**: Jerome, Ken, Robert, Rocker, Heuler, Akame, Ben, GB, Lector, Thunder + roster-agentin joukkovariantit | omat nivelet + proseduraaliset animaatiot, anime-kasvot (`src/face.js`) |

- `base_rigged.glb` (rigattu peruskoira, Tripo auto-rig) on lähteissä; tehtaan siirto sille on seuraava askel (ks. NEXT.md).
- Staattiset alkuperäiset (`weed.glb`, `kaibutsu.glb` …) säilyvät lähteinä; pelissä käytetään rigattuja.
- Vanha `dog_base.glb` = *Shiba Inu*, **Quaternius**, "Ultimate Animated Animal Pack", **CC0 1.0** – ei enää käytössä.

## Musiikki ja äänitehosteet – Epidemic Sound
Käyttäjällä on Epidemic Sound -lisenssi, ja raidat on ladattu hänen tilillään (Epidemic Sound MCP).
**Tiedostoja ei ole gitissä** (`public/audio/mus_*.mp3`, `public/audio/sfx_*.mp3` ovat `.gitignore`ssa, koska repo on julkinen
eikä Epidemic Soundin ehdot salli raitojen uudelleenjakelua sellaisenaan). Ne julkaistaan vain pelin mukana (Cloudflare Worker).
Tiedostot on uudelleenkoodattu (mp3 96–112 kbps, äänekkyys normalisoitu, metatiedot poistettu).

### Musiikki
| Tiedosto | Raita | Artisti | Epidemic ID | Käyttö |
|---|---|---|---|---|
| `mus_intro.mp3` | Mysteries Of The Forest (Epidemic-editoitu 67 s silmukka) | Calm Shores | `ce22b97e-343e-31bb-b1b2-632628695ce6` (edit `b57c4cf5-6d68-49c1-bebd-7cf8fd8e1252`) | päävalikko, galleria, intro (jännittynyt ambient) |
| `mus_battle.mp3` | Packs of Savage Dogs (Epidemic-editoitu 100 s silmukka) | Dream Cave (säv. Johannes Bornlöf) | `edfcfce2-c9d7-31ea-8d02-3344663a5041` (edit `e70d65e1-6028-44cb-9914-35efad0ecd52`) | Kaibutsu-taistelu, kaikki vaiheet |
| `mus_sad.mp3` | Elegy Unspoken (130 s, häivytys) | Rachel Sandy | `0989ec9a-d315-4110-bd79-64a32f3ee186` | Smithin uhraus, Neljä nuolta |
| `mus_dawn.mp3` | A New Horizon | Howard Harper-Barnes | `d92caebc-4f60-30c7-a0fd-bbbd2b74404a` | aamunkoitto, muistohetki, toivo, tulosruutu |

### Äänitehosteet
| Tiedosto | Epidemic-tehoste | ID | Käyttö |
|---|---|---|---|
| `sfx_bite.mp3` | Dog, Growl 02 | `8e707c53-a840-484d-9de5-2ea31759d097` | purenta |
| `sfx_hit.mp3` | Fight, Impact, Punch, Heavy, Swish Attack | `8e49b75a-541b-42f7-9db8-091b757c0e46` | osumat, yhteisisku |
| `sfx_roar.mp3` | Creatures, Monster, Growl, Wide | `e6057939-4715-4f58-b4b4-0d1226480d4f` | Kaibutsun karjunta |
| `sfx_rockslide.mp3` | Rocks, Crash & Debris, Big Pile, Short Landslide, Slip | `b26fff48-43e8-489e-bf0f-2633cd4159a6` | kivivyöry, maan jyrinä |
| `sfx_rock.mp3` | Rocks, Crash & Debris, Drop Rock, Rock Debris | `fc1c7686-9749-43c3-b5c3-28228b24f402` | heitetty/putoava kivi, laskeutumiset |
| `sfx_summer.mp3` | Ambience, Insect, Insects, Cicada, Crickets, Distant Birds, Wind In Trees, Summer, … Mountains (30 s silmukka) | `ccc31fe8-0bf7-4023-9f0c-7828285e629f` | kesäilta-ambienssi tasolla 2 (canon: taistelu on kesällä) |
| `sfx_whoosh.mp3` | Swooshes, Swish, Sword Swing, Airy 02 | `13f4c119-6a44-48c5-96eb-76978ad44321` | väistö, hyppy, Battōgan pyörähdys |
| `sfx_battoga.mp3` | Designed, Impact, Cinematic, Impact, Hit, Slam, Braam | `eb8d9968-205e-48d5-8510-bc2c738a5970` | Battōga-isku, Jeromen neljäs nuoli |
| `sfx_spirit.mp3` | Magic, Shimmer, Spell, Cast, Transform, Shimmer, Sparkle, Twinkle 04 | `bf4716be-4f43-4a79-8c21-f3325bc3f8cf` | hengen nousu/hehku, Henki täynnä |
| `sfx_bark.mp3` | Animals, Dog, Bark, Single, Hungarian Pointer 01 | `17d12ef0-b52a-4a5d-b302-6956e65d6416` | haukku (kutsu, hyökkäys) |
| `sfx_hurt.mp3` | Animals, Dog, Yelp, Large | `654bf134-a060-4979-b42b-930442f98f40` | Weed saa osuman |

Varalla: jos tiedosto puuttuu tai ei lataudu, `src/audio.js` syntetisoi vastaavan äänen WebAudiolla (myös musiikki).
Raitojen uudelleenhaku: hae ID:llä Epidemic Sound -MCP:llä (DownloadRecording / DownloadSoundEffect / DownloadRecordingEdit)
ja koodaa kuten yllä (ffmpeg, ks. README "Äänet").

## Puheäänet
Hahmot puhuvat japania (englanninkielinen tekstitys). **Puheäänitiedostoja ei vielä ole** – repliikit, tunteet ja
näyttelijäohjeet ovat valmiina (`src/data/lines.js`, `docs/VOICE_LINES.md`). Japaninkieliset repliikit ja käännökset ovat
omia; Heulerin "Let's not die yet, Robert…" on mukaelma research.md:n lainauksesta.

## Kirjastot
- **three.js** 0.170.0 – MIT · **Vite** 5 – MIT · meshopt_decoder (three.js examples) – MIT
- Kehitystyökalut: glTF-Transform 4 (MIT), meshoptimizer (MIT), sharp (Apache-2.0), Playwright (Apache-2.0)

## Alkuperäisteos
*Ginga Densetsu Weed* © Yoshihiro Takahashi / Nihon Bungeisha. Tämä on epävirallinen, ei-kaupallinen fanityö.
Tarinan tapahtumat on kirjoitettu omin sanoin `docs/weed-game/research.md`:n pohjalta.
