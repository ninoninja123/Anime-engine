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
| `sfx_ambience.mp3` | miksaus: Wind, Vegetation, Leaves Rustling, Falling, Light Wind, Gusts, Under Big Tree, Autumn (`d0bb1905-9a60-486b-8573-3d08a797848f`) + Ambience, Forest, Quiet, Night, Ravens Cawing In The Distance 02 (`e903e474-3037-449d-ac53-15828f3d606b`), 34 s silmukka | (2 ID:tä) | tason 2 ambienssi: myöhäissyksy, tuuli ja kuivat lehdet, korpit kaukana (ei lunta) |
| `sfx_whoosh.mp3` | Swooshes, Swish, Sword Swing, Airy 02 | `13f4c119-6a44-48c5-96eb-76978ad44321` | väistö, hyppy, Battōgan pyörähdys |
| `sfx_battoga.mp3` | Designed, Impact, Cinematic, Impact, Hit, Slam, Braam | `eb8d9968-205e-48d5-8510-bc2c738a5970` | Battōga-isku, Jeromen neljäs nuoli |
| `sfx_spirit.mp3` | Magic, Shimmer, Spell, Cast, Transform, Shimmer, Sparkle, Twinkle 04 | `bf4716be-4f43-4a79-8c21-f3325bc3f8cf` | hengen nousu/hehku, Henki täynnä |
| `sfx_bark.mp3` | Animals, Dog, Bark, Single, Hungarian Pointer 01 | `17d12ef0-b52a-4a5d-b302-6956e65d6416` | haukku (kutsu, hyökkäys) |
| `sfx_hurt.mp3` | Animals, Dog, Yelp, Large | `654bf134-a060-4979-b42b-930442f98f40` | Weed saa osuman |

### Laajennettu tehostepaketti `sfx2_*.mp3` (107 tiedostoa, ~2,4 MB, Epidemic Sound)
Leikattu/kerrostettu omilla työkaluilla: mono, 96 kbps (ambienssit 80 kbps), aktiivinen RMS ≈ −16 dB (UI −20, ambienssi −24),
huippu ≤ −1 dBFS, hiljaisuudet leikattu, 10 ms fade-in; silmukat ristiinhäivytetty saumattomiksi. Äänikartta: `src/data/sfx_map.js`.
Linkki: `https://www.epidemicsound.com/sound-effects/tracks/<ID>/`.

| sfx2-tiedostot | Epidemic-tehoste | ID |
|---|---|---|
| `step_dirt_1–5` | Footsteps, Animal, Dog, Run, Walk, Gravel, Dirt | `f55da0e2-d1d4-42c0-aaea-925859df4065` |
| `step_claw_1–4` | Footsteps, Animal, Foley, Dog, Cat, Paws With Claws, Asphalt, Run | `43591dda-6e79-40d4-a71b-e362eb485935` |
| `step_leaf_1–4` | Footsteps, Human, Dry Leaves, Forest Floor | `4500fb19-9c2b-4550-aae4-87fb72542009` |
| `land_1–2` | Footsteps, Human, Jump, Land, Ground, Gravel | `5cda9308-8698-4e9a-8f0c-d7cbe8c9ea25` |
| `land_3` | Footsteps, Human, Grass, Jump, Land 01 | `2776f347-aa55-49bc-82d4-1b7d29979df6` |
| `claw_scrape` | Rocks, Friction, Stone, Scrape On Hard Surface | `af97a24a-c6f7-4703-91ef-db79373efd40` |
| `scuff` | Footsteps, Human, Scrape, Scuff, Feet, Gravel Ground | `b1ed1e6f-559f-4c71-b56a-365cf2400eee` |
| `fur` | Cloth, Movement, Jacket, Polyester, Foley, Movement | `4f75839e-d3eb-4650-b8be-b7060dc280d0` |
| `pant` | Animals, Dog, Panting Fast, Short Recording | `48d25fe2-04b9-43a1-9f56-d1de92bdfa4a` |
| `breath` | Animals, Dog, Breath, Single 01 | `00740010-c98d-470b-8f20-7d7be9915a2d` |
| `wade_1–3` | Footsteps, Human, Water, Walk, Wade Through, Short | `2e438b9a-a124-4258-aa0d-017d7a751157` |
| `bite_snap`, `bite_snap_2` | Food & Drink, Eating, Bite Teeth Together | `17c9f85d-72bb-4b38-8d2a-ae65c6f60d21` |
| `bite_growl_1` | Animals, Dog, Playful, Growl, Energetic | `e7012bfe-e0c9-45b8-9cbb-f35d91b82a76` |
| `bite_growl_2` | Animals, Dog, Labrador, Growl, Internal 01 | `a2ee133a-5162-4af2-bb72-891953d5f10b` |
| `bite_growl_3` | Animals, Dog, Labrador, Growl, Internal 02 | `422f1d2e-9580-40d1-813b-e9f6572496f1` |
| `hit_light_1` | Fight, Impact, Fist Punch To The Flesh | `b43461cd-a80c-4ad3-8e58-f03afd232b2b` |
| `hit_light_2–3` | Fight, Impact, Foley, Punch, Impact, Body, Short, Multiple 02 | `def21d69-2289-4164-81eb-05e38f90bcc0` |
| `hit_med_1–2` | Fight, Impact, Punch, Fist, Hard, Body Impact, Short 01 | `56d155fd-6a52-41a1-8399-fe2b88309c95` |
| `hit_med_3` | Fight, Impact, Punch, Fist, Hard, Body Impact, Short 02 | `131d6755-aadd-4242-85af-ab785e113569` |
| `hit_heavy_1–3` | Fight, Impact, Punch, Fist, Fat, Short, Only Impact | `c63b0296-2c9e-4a80-b0e9-fe173a0b8d3d` |
| `whoosh_1–4` | Swooshes, Swish, Stick, Bendy, Whoosh, Air, Fast 01–04 | `b7c25d77-694e-4b55-b99b-539c940a9b33`, `80b5582a-2908-4e3c-a78c-6b8160655a12`, `f48a88f1-d92f-4875-b751-50eb4cb3d5b7`, `f50b2cde-d934-4069-ab4d-d607ad8f1198` |
| `whoosh_big` | Swooshes, Swish, Short, Bright, Fast, Flyby | `93505bfe-e95d-4b5f-96aa-508d405b7013` |
| `perfect` | Magic, Shimmer, Shing, Ringing Chime | `bf81899c-45a9-4b6f-a006-11c32d2040fd` |
| `parry` | Weapons, Sword, Hit Sword, Block, Parry, Impact, Ringing | `5782fadf-fd30-443b-ae8a-c5999ecbb3cd` |
| `yelp_1` | Animals, Dog, Labrador, Yelp | `09156f96-c565-4278-83f5-938671feb3d5` |
| `yelp_2` | Animals, Dog, Labrador, Yelp, External | `9048912a-e601-4742-bead-e5b516804c18` |
| `yelp_3` | Animals, Dog, Labrador, Yelp, Whine, Internal | `d82b66fb-5930-45f7-86bf-0afb2cde84bb` |
| `whimper_1–2` | Animals, Dog, Crying, Whimper, Squeal, Groans | `b70865b1-5b9f-43a9-a597-a8278efd5841` |
| `whine` | Animals, Dog, Golden Retriever, Whine | `a4155e5f-f56a-4cfc-98c4-199f2c5923c8` |
| `bodyfall` | Fight, Bodyfall, Dirt, Stones, Gravel | `7f76aac2-95bd-4826-8d1a-f0f458530dce` |
| `spin_wind` | Fire, Misc, Designed, Swooshes, Wind, Whirling | `7077e250-b94d-4f29-a7bc-106fc9d08a85` |
| `spin_howl` | Swooshes, Whoosh, Flying Object, Howling, Spinning Harsh, Phase | `ed97b753-0e6a-4565-9a5b-d6fd6a176749` |
| `riser_hit` | Designed, Impact, Cinematic, Riser, Fast, Big Hit, Bomb | `cafa0305-76f3-40fb-8e5f-7b02fd48f9bf` |
| `riser_air` | Designed, Impact, Cinematic, Short Riser, Big Hit, Electric, Airy | `0328df4a-9db6-4ccc-9ecc-3878de730426` |
| `sonic_boom` | Designed, Stinger, Short Distorted Swell, Dramatic Impact, Distorted Boom 01 | `ad806e8f-141c-4f67-8ca0-4c7588396d78` |
| `crit` | Designed, Impact, Cinematic, Riser, Aggressive, Epic, Big, Deep Hit 03 | `1c520f5c-f859-43aa-9406-ad01e927b81e` |
| `shockwave` | Swooshes, Whoosh, Low, Sub, Cinematic 01 | `a9946ddf-b02a-4798-8822-05f6c7e89e0d` |
| `dust` | Rocks, Crash & Debris, Pebbles, Small, Few, Drop, Low Height, Soft Surface | `217b8a6f-5b0d-424b-aad2-2d1b9c1ea529` |
| `roar_1` / `roar_2` / `roar_3` | Creatures, Monster, Monster, Roar / Deep Voice, Roar / Mid Deep, Voice, Roar | `a807ef2d-c3a8-4fbd-9252-1d9c4310dc42`, `853ff021-8277-4b08-acfa-060f4ce98d5d`, `4a18ec42-dd41-41b3-a26b-5ba7fbc4b917` |
| `boss_growl` | Animals, Wild, Bear, Growl 01 | `77445838-5e13-4f93-bf0b-f9d845f55e3b` |
| `boss_grunt` | Animals, Wild, Bear, Grunt 01 | `99e664b6-c932-4b77-a888-34d442ccfa02` |
| `boss_step_1–3` | Creatures, Humanoid, Giant, Footstep, Massive, Distant, Heavy 01–03 | `b860994f-e5e9-464d-b746-2f915e9b7635`, `fbd74349-6bfe-4aa8-89be-fd741972baf0`, `7f340d15-4917-4bac-86c7-a04e47842477` |
| `rock_lift` | Rocks, Impact, Throw Rock | `709b7de2-8cb2-40c6-a9f5-ee6e1fd9e832` |
| `rock_crash_1` | Rocks, Impact, Impact, Rock, Medium | `6cced53f-e347-4178-b4d5-02a58d3648d4` |
| `rock_crash_2` | Rocks, Impact, Stone, Large, Down On Others, Hard | `f58924a9-3b52-4aa5-82e7-5201d9fa9ddb` |
| `boss_land` | Designed, Impact, Troll, Fight, Impact Rock Ground 07 | `f8a8d469-487a-4c17-9905-f43f4e0e362f` |
| `quake` | Natural Disaster, Earthquake, Impact, Dark, Crack 01 | `1492f7d0-123b-4630-b317-4b9a81b9470d` |
| `debris` | Rocks, Crash & Debris, Debris, Falling, Smaller Rocks, Gravel | `37394972-e593-47d0-99c9-698b77302b08` |
| `boss_drone` | Designed, Drone, Dark, Deep, Mysterious, Suspense, Short | `2e62b98c-33d1-4b0e-9376-423399f6d215` |
| `heli` | Aircraft, Helicopter, Approach, Fly Overhead And Away | `89c548f4-eeb5-4dff-95b1-90769a5d97af` |
| `amb_forest` | Ambience, Forest, Wind, Medium, Gentle Gusts, Trees, Leaves Rustling | `12946b4e-3322-4e16-818e-8de3ebe41e51` |
| `amb_waterfall` | Water, Waterfall, Medium (alipäästetty, kaukainen) | `9c9fb621-e7c1-424c-bc89-88c941a012c4` |
| `amb_river` | Water, Flow, Creek, Medium Light Stream | `5afad0cd-f2fe-4839-8184-bd4270e69292` |
| `amb_gorge` | Wind, Gust, Howling, Whistling, Polar | `7c3d2edb-e5eb-4e25-99cb-fbebdc0b2244` |
| `amb_dawn` | Wind, Vegetation, Forest, Leaves, Distant Birds | `9771c9de-ac5a-4ebe-a5c7-56a26b64eeba` |
| `crow_1` / `crow_2` / `crow_3` | Birds, Crow, Ravens, Raven Call 06 / Raven Call 02 / Raven Squawk | `c7c73a3c-e937-4902-b875-7584ec2dc002`, `82e814b1-1146-4032-88f6-5fa9abd9d906`, `3a7537d9-d12b-45c7-ad9a-780091739479` |
| `splash` | Water, Splash, Bodyfall, Dive, Big | `b57e79af-da9d-4378-9b49-b0ef41213cd8` |
| `underwater` | Water, Underwater, Impact, Dive, Heavy Object Land In Water, Underwater, Bubbles 01 | `b9f67c09-a50d-457e-b9cf-4ca914ccc4ee` |
| `heartbeat` | Human, Heartbeat, Designed, Heartbeats, Loopable 01 | `350568f4-475a-4039-af56-702b1262f305` |
| `spirit_rise` | Magic, Angelic, Healing Spell, Short, Holy, Ethereal, Video Game, JRPG 02 | `afc176bb-e8d8-45ac-a443-bae5a9c53385` |
| `memory` | Musical, Choral, Voices, Processed, Reverb, Positive, Bitter, Logo, Signature | `b73ca80d-afa5-4428-b32d-641e1425e146` |
| `riser` | Designed, Riser, Short Riser, Dramatic | `34b7b0fb-411f-422b-891f-e7bb3d94f9b6` |
| `braam` | Designed, Stinger, Big Impact, Braam, Epic, Dark, Cinematic, Aggressive | `a035891f-da1e-4521-a046-03e3d8e3a85f` |
| `cine_boom` | Designed, Stinger, Dark, Cinematic, Boom Hit, Morphing Tail, Synth | `07439a66-14d9-4c3c-8968-c5884058f1f5` |
| `slowmo` | Swooshes, Whoosh, Low, Long 01 | `0fd74260-bed7-4f67-a69c-4058477e1506` |
| `rev_cymbal` | Designed, Riser, Cymbal, Reverse, Crescendo, Suspense, Climax 02 | `566b642a-4341-4ad7-961a-d25000cf8341` |
| `speed_whoosh` | Designed, Riser, Transition, Whoosh, Fast, Short 01 | `4a3b779f-9545-4f5c-aa44-038b4813f77e` |
| `up_sweep` | Designed, Riser, Transition, Whoosh, Fast, Short 02 | `fc7fc7a3-57a4-47fa-9172-028fd3ec73d9` |
| `scan_ping` / `lock_on` | Communications, Telemetry, Scan Target 01 / 02 | `ad9a7f13-0fcc-4aa4-aa35-5631de23a7b0`, `7e585bca-b1c0-40d6-af1e-8c0c4481dd82` |
| `ui_click` | User Interface, Click, UI Buttons, Simple, Select | `d637e4e8-6846-496b-84f9-19f3f7b59539` |
| `ui_confirm` | User Interface, Click, UI Buttons, Confirm, Option | `49276c68-40b0-4b9d-bc8b-4584daa7395a` |
| `ui_back` | User Interface, Click, UI Buttons, Select, Previous | `d2ed6a8c-9424-46ab-8f6d-0a1978c3fcdf` |
| `ui_open` | User Interface, Click, Sci Fi Games, UI Menu, Very Short, Open 01 | `4eaa13c8-2fff-4204-93f8-4aacc4a37cb0` |
| `ui_tick` | User Interface, Alert, Notifications, Notification, Digital, Tick | `045d6e1e-742f-4cbb-98b3-6fe37fb84eae` |
| `card_ready` | User Interface, Click, UI Buttons, Ping, Select | `3297dd2d-1f6c-45e8-9c9a-283f34f161b5` |
| `heart_lost` | Magic, Shimmer, Spell, Cast, Debuff, Power Down, Chime, Glimmer, Negative | `d050a924-5a3d-4613-8529-de2466df2204` |
| `game_over` | Musical, Stinger, Flute, Oneshot, Reverb, Low | `3c09c23b-8489-414b-8a3f-82417cf8c067` |
| `victory` | Musical, Sample, Victory, Achievement, Positive, Orchestra, Video Game 01 | `daeb0db9-5c22-401a-861d-d0d2c59d2135` |

Kuuntelu: `?soundtest` (kaikki tapahtumat, atomiäänet ja ambienssipresetit napeista). Testi: `node tools/sfx-test.cjs`.

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
