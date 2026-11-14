# ASSETS: valmiit, ladattavat assetit VRM-putkeen

Katalogi valmiista assetteista (hahmopohjat, liikkeet, efektit, taustat, äänet, fontit) VRM + MToon -putkeen
(three.js 0.170, `@pixiv/three-vrm` 3.5.5, porrastetut avainposet `poses.json`). Mukana ei ole tekoälykuvagenerointia.
Repossa on vain linkit, lisenssit ja skriptit (`tools/vrm_assets/`). Itse assetteja ei ole commitoitu.

Testattu 2026-11-14. "Testattu" tarkoittaa, että tiedosto ladattiin ja renderöitiin putkessamme
(three-vrm 3.5.5, SwiftShader). Lisenssit luettiin VRM-tiedoston omasta metadatasta (`vrmmeta.py`) ja lähdesivulta.
**Lue lisenssi aina itse ennen julkaisua.** Hahmojen tekijänoikeus (Byakuya, Zoro ja muut) on fanivideoissa isompi riski kuin mikään tämän listan assetti.

---

## 1. Hahmopohjat (VRM)

### 1a. Nykyinen pohja: AvatarSample_C
- Tiedosto: `models/AvatarSample_C.vrm`, 13,1 MB, VRM 0.x, VRoid Studio 1.x. Se on tavu tavulta sama kuin
  [madjin/vrm-samples `vroid/stable/AvatarSample_C.vrm`](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_C.vrm).
  Virallinen lähde on VRoid Hub, VRoid Project -tili:
  <https://hub.vroid.com/en/characters/1248981995540129234/models/8640547963669442173>. Lataaminen vaatii pixiv-kirjautumisen.
- Lisenssi on VRoid Hubin lisenssi, joka on luettu tiedoston metadatasta ja VRoid Hubin API:sta:
  - käyttäjät: kaikki
  - väkivalta: sallittu
  - seksuaalinen sisältö: sallittu
  - yrityksen kaupallinen käyttö: sallittu
  - yksityishenkilön kaupallinen käyttö: sallittu ("profit")
  - muokkaus: sallittu
  - uudelleenjakelu: sallittu
  - kunniamaininta: ei pakollinen
- VRoidin ohjesivu ([4402614652569](https://vroid.pixiv.help/hc/en-us/articles/4402614652569)) sijoittaa A, B ja C luokkaan "models with particular conditions of use"
  (ehdot: [4402394424089](https://vroid.pixiv.help/hc/en-us/articles/4402394424089)). Tekijänoikeudesta ei ole luovuttu, mutta muokkaus, jakelu ja kaupallinen käyttö sallitaan ehtojen mukaan.
  Ohjesivua ei pystytty avaamaan tästä ympäristöstä, koska host ei ole sallittu. Lue se kerran itse.
- Mitä se tarkoittaa julkaisulle: YouTube-julkaisu ja monetisointi ovat mallin puolesta sallittuja, ja väkivaltainen sisältö on sallittu.
  Mallia ei saa myydä sellaisenaan.
- Ruumis: mies, hoikka, pituus normaali (head-luu y = 1,55, hartialeveys 0,257). Kasvoissa on 54 Fcl_*-morphia:
  `EYE_Iris_Hide`, `EYE_Spread`, `HA_Fung1-3` (kulmahampaat), `MTH_SkinFung`, `BRW_*`, `MTH_A/I/U/E/O`. Esiasetuksia (blendshape-ryhmiä) on 14.
  **Morpheja voi käyttää suoraan `mesh.morphTargetDictionary`:n kautta.** Esiasetukset eivät ole ainoa tapa.

### 1b. Muut pohjat: vastaus kysymykseen "onko vain tuo yksi?"
**Muitakin on.** Ilman kirjautumista ladattavia, julkaisukelpoisia VRoid-tyylisiä pohjia löytyi vähintään 10. Ne käyttävät samaa VRoid-luurankoa,
samoja Fcl-ilmeitä ja MToonia, joten koodimme lataa ne sellaisenaan. Kontaktikuva rinnakkain nykyisen kanssa on tehty, mutta sitä ei ole commitoitu (kuvassa on lisensoituja malleja).

| Pohja | Lataus (suora) | Koko | Lisenssi (metadata) | Ruumis (head-y, hartiat) | Sopii |
|---|---|---|---|---|---|
| **Sakurada Fumiriya** | [madjin mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Sakurada_Fumiriya.vrm) | 19,3 MB | **CC0** | mies, **pisin** (1,68 / 0,296), pitkät jalat | Byakuya, pitkät hoikat bishounenit |
| **HairSample_Male** | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/HairSample_Male.vrm) | 18,5 MB | **CC0** | mies (1,55 / 0,296), leveämmät hartiat | nuori mies, **pörröiset mustat hiukset** (hiusluovuttaja) |
| HairSample_Female | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/HairSample_Female.vrm) | 17,5 MB | CC0 | nainen | hiusluovuttaja |
| Sendagaya Shino / Shibu | [Shino](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Sendagaya_Shino.vrm), [Shibu](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Sendagaya_Shibu.vrm) | 15 / 17 MB | CC0 (VRoid-ohje) | nainen, koulupuku | naishahmot |
| **Darkness Shibu** | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Darkness_Shibu.vrm) | 20,4 MB | **CC0** | nainen (1,42), goottimekko | naiset, bob-hiukset |
| **Vita** | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Vita.vrm) | 14,4 MB | **CC0** | nainen (1,47), valkoiset hiukset, kissankorvat | valkohiuksiset, sci-fi |
| Vivi, Victoria Rubin | [Vivi](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Vivi.vrm), [Victoria](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/Victoria_Rubin.vrm) | 18 / 15 MB | todennäköisesti CC0 (beta-samplet), tarkista `vrmmeta.py`:llä | naiset | |
| AvatarSample_A | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_A.vrm), [VRoid Hub](https://hub.vroid.com/en/characters/2843975675147313744/models/5644550979324015604) | 15,1 MB | sama kuin C | nainen, lyhyt (1,35 / 0,164) | tytöt, lapsi/teini |
| AvatarSample_B | [mirror](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_B.vrm), [VRoid Hub](https://hub.vroid.com/en/characters/7939147878897061040/models/2292219474373673889) | 15,4 MB | sama kuin C | nainen, lyhyt (1,32), tumma iho | |
| VRM1_Constraint_Twist_Sample | [three-vrm](https://raw.githubusercontent.com/pixiv/three-vrm/dev/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm) | 10,8 MB | VRM Public License 1.0, pixiv: kaupallinen ja väkivalta sallittu, kunniamaininta ei pakollinen | nainen (1,39), VRM 1.0 | VRM1-testi, naiset |
| three-vrm-girl | [three-vrm 0.x](https://raw.githubusercontent.com/pixiv/three-vrm/0.x/packages/three-vrm/examples/models/three-vrm-girl.vrm) | 5,6 MB | VRoid Hub, kaikki sallittu | nainen (1,37) | kevyin |
| Seed-san | [vrm-specification](https://raw.githubusercontent.com/vrm-c/vrm-specification/master/samples/Seed-san/vrm/Seed-san.vrm) | 10,9 MB | VPL 1.0: kaupallinen ja väkivalta sallittu, **kunniamaininta pakollinen** ("Seed-san model by VirtualCast, Inc.") | lyhyt poika (1,33 / 0,283), robottikäsi (piilotettava), osin PBR-materiaalit | nuori poika (Rill?), vaatii säätöä |
| masc_vroid / fem_vroid | [masc](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/masc_vroid.vrm), [fem](https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/fem_vroid.vrm) | 12 MB | **epäselvä** (author "jin", "Other" ilman URL:ia) | paljaat ruumiit | käytä mieluummin OGA:n CC0-baseja (alla) |
| ~~Alicia Solid~~ | [UniVRM Tests](https://raw.githubusercontent.com/vrm-c/UniVRM/master/Tests/Models/Alicia_vrm-0.51/AliciaSolid_vrm-0.51.vrm) | 7,9 MB | Nico-lisenssi, **väkivalta kielletty** | | **ei death battleihin** |

Samat CC0-samplet ovat myös OpenGameArtissa ([vroid-studio-cc0-models](https://opengameart.org/content/vroid-studio-cc0-models), CC0):
`base_male.zip`, `base_female.zip` (paljaat pohjat), `hairsample_male/female.zip`, `avatarsample_d/e/f/g.zip` (alpha-versioiden samplet, eivät samoja kuin nykyiset D–G),
`sakurada_fumiriya.zip` ja `sendagaya_shino.zip`, 11–17 MB kukin. Host `opengameart.org` ei ollut sallittu, joten niitä ei ladattu tässä.

**Muut lähteet (eivät ole suoria latauksia):**
- **VRoid Hub** (`hub.vroid.com`). API toimii ilman kirjautumista (`GET /api/search/character_models?keyword=...`, otsake `X-Api-Version: 11`), ja se palauttaa lisenssikentät
  (`modification`, `violent_expression`, `corporate_commercial_use` ...). Itse lataus vaatii kirjautumisen (`/download`, 401 COMMON_SIGNED_IN_REQUIRED).
  Virallinen VRoid Project -tili (user 36144806) julkaisee A, B ja C:n sekä beeta-ajan samplet "Welcome School Uniform" ja Sakurada/Shino, kaikki "everyone/allow".
  Huom: suurin osa "AvatarSample_X改変"-malleista on lisensoitu "disallow"-ehdoilla, joten niitä ei voi käyttää.
- **Open Source Avatars / 100Avatars** ([ToxSam/open-source-avatars](https://github.com/toxsam/open-source-avatars), `data/projects.json`): 300+ CC0-VRM:ää (Polygonal Mind),
  tiedostot ovat arweave.netissä. Tyyli on low-poly ja chunky, ei animea, joten ne sopivat lähinnä sivuhahmoiksi tai olennoiksi. Arweave vastasi tässä ympäristössä 403.
- **booth.pm**: ilmaiset VRoid-vaatteet, -hiukset ja -pohjat (esim. [Chibi bases](https://booth.pm/en/items/8071790), [CC0 .vroid -samplet](https://booth.pm/en/items/3094418)).
  JSON-tiedot saa osoitteesta `booth.pm/ja/items/<id>.json`. Lataukset vaativat pixiv-kirjautumisen, ja ehdot ovat tuotekohtaisia.
- **VRoid Studio** (ilmainen sovellus, vroid.com) on varsinainen pohjatehdas: liukusäätimillä pituus, hartiat, pää ja kasvot, ja vienti VRM:ksi.
  Lihaksikasta (Zoro) valmista CC0-pohjaa ei löytynyt. Vaihtoehdot ovat VRoid Studio (vaatii ihmisen ja Windows/macOS:n)
  tai luiden skaalaus koodissa: `loadChar(url,[sx,sy,sz])` on jo olemassa, ja `HairSample_Male` / OGA `base_male` ovat C:tä hartiakkaampia (0,296 vs. 0,257).
- **Hugging Face**: `ayyappanallamothu4/vrm-premium-models` (40+ VRM:ää ilman lisenssiä) on **vältettävä**.
  `Mitsua/vroid-image-dataset-lite` sisältää kuvia, ei malleja.

**Testitulokset (oikea moottorikopio, `tools/vrm_assets` + kopio byakuya-vs-rill-moottorista):**
- Kaikki 13 pohjaa latautuivat three-vrm 3.5.5:llä (VRM0 ja VRM1). MToon-materiaalit säilyivät. Seed-sanissa on 8 PBR-materiaalia, joita `forceToon` muuntaa.
- `makeByakuya` Sakurada Fumiriyan päällä toimii (pitkä hoikka siluetti), mutta asukoodi on viritetty C:n vaatteille (hakama ja paita).
  Pohjan vaihto vaatii siis pohjakohtaisen viritysrivin chars.js:ään.
- `makeRill` toimi VRM1_Constraint_Twist_Samplen päällä. three-vrm-girlin päällä se kaatui: `texOf()` etsii C:n tekstuurinimiä.

### 1c. Hiukset: valmiit "pörröiset" hiukset (TESTATTU, paras löydös)
Pehmeät ja pörröiset hiukset kannattaa **siirtää valmiina meshinä CC0-VRoid-samplesta** sen sijaan, että ne rakennettaisiin koodilla.
`tools/vrm_assets/harness.html` (`go(url, {hairFrom, hairTint, hairShade})`) tekee seuraavaa:
1. piilottaa pohjan `*_HAIR`-meshit
2. lataa luovuttajan ja leipoo sen hiusmeshit lepoasentoon (`getVertexPosition` + `matrixWorld`)
3. siirtää ne luovuttajan pään keskeltä pohjan päähän
4. kiinnittää ne staattisena meshinä pohjan `head`-luuhun
5. sävyttää MToonin `color`- ja `shadeColorFactor`-arvot.

Tulos C:n päällä: Sakurada (sävytetty vaaleansiniseksi), HairSample_Male, Vita ja Darkness Shibu istuivat suoraan ilman skaalausta,
koska VRoid-päät ovat samankokoisia. Puutteet:
- jousiluiden heilunta katoaa (stepped-animaatiossa tämä on hyväksyttävää)
- VRM0:ssa primitiivit jakavat yhden vertex-puskurin, joten oikeassa työkalussa kannattaa käsitellä vain indeksien viittaamat verteksit (nyt 0,6–1,6 M verteksiä per hius, 10 s).

Hiusluovuttajiksi sopivat CC0-mallit: HairSample_Male/Female, Sakurada, Shino, Shibu, Darkness Shibu, Vita (ja OGA:n alpha D–G).
VRoid Studion omat hiusesiasetukset ja boothin hiuspaketit (.vroid) vaativat VRoid Studion. Erillistä "hair mesh -kirjastoa" glTF-muodossa, CC0-lisenssillä ja animetyylisenä ei löytynyt.

### 1d. Kasvot ja ilmeet
- Kaikissa VRoid-pohjissa on samat 54–57 Fcl-morphia (`ALL/BRW/EYE/MTH/HA_*`), joten ilmekoodi siirtyy pohjasta toiseen.
- Seed-sanilla on oma anime-ilmekirjasto: `eye_star`, `eye_zitome`, `shock_plane`, `cheek_pop`, `eye_V`.
- [madjin/vrm-samples `vroid/beta/VROID STUDIO Female (Defaults)`](https://github.com/madjin/vrm-samples) sisältää VRoidin oletustekstuurit ja UV-oppaat
  (silmät, iirikset, kulmat, vaatteet). Niistä on hyötyä, kun maalaat C:lle uusia silmiä ja vaatteita koodilla, koska UV-asettelu on sama.

---

## 2. Animaatio

| Lähde | Mitä | Lisenssi | Lataus | Tila |
|---|---|---|---|---|
| **[Sanami/open-vrma](https://huggingface.co/datasets/Sanami/open-vrma)** (HF) | 2 749 valmista **.vrma**-tiedostoa (VRM Animation): CMU 2 503, Quaternius UAL1+2 87, KayKit 159. Mukana `catalog.csv` (kind/energy/tags). Taisteluun sopivat: `quaternius/ual2/Sword_Regular_A..C/Combo`, `Sword_Block`, `Sword_Dash_RM`, `Melee_Hook`, `Hit_Knockback`, `ual1/Punch_Jab/Cross`, `Sword_Attack`, `Death01`, `Roll`, `Spell_Simple_*`; `kaykit/medium/Melee_1H/2H_*`, `Melee_Dualwield_*`, `Melee_Block*`, `Dodge_*`, `Hit_A/B`, `Death_A/B`, `Ranged_Magic_Spellcasting`; CMU `135_*` (karate: mawashigeri, yokogeri, oiduki), `13_17/18` (nyrkkeily), `02_07..09` (miekkailu), `144_*` (potkut) | CC0 (Quaternius, KayKit). CMU: saa käyttää kaupallisessa teoksessa, dataa ei saa myydä, kiitosteksti pyydetään | `https://huggingface.co/datasets/Sanami/open-vrma/resolve/main/<polku>.vrma`, ilman kirjautumista, 15–80 kB/klippi | **TESTATTU**: toimii C:ssä (VRM0) ja Twist Samplessa (VRM1) `@pixiv/three-vrm-animation` 3.5.5:llä |
| `@pixiv/three-vrm-animation` (npm) | VRMA-lataaja ja `createVRMAnimationClip` | MIT | npm | testattu |
| **`tools/vrm_assets/vrma2poses.js`** (oma) | Leipoo VRMA:n valitut ajanhetket `poses.json`-muotoon: vartalo/pää/kädet/jalkaterät `ypr`, raajat `dir` + `twist`, suunta normalisoitu (hipsin yaw poistetaan, root motion pudotetaan) | MIT | repo | **TESTATTU**: kvaternionit täsmäävät klippiin 0,01:n tarkkuudella; renderöity oikeassa moottorissa (Rill + sivellin, `q_combo_*`, `cmu_mawashi_*`) |
| VRoid Project: [VRMアニメーション7種セット](https://booth.pm/ja/items/5512385) | 7 virallista .vrma-tiedostoa, 3,3 MB | VRoidin ehdot | booth, vaatii kirjautumisen | ei ladattu |
| CMU BVH -alkuperäiset | [Shriinivas/cmubvh](https://github.com/Shriinivas/cmubvh) (cgspeed-konversio) | CMU-ehdot | github | open-vrma on jo konvertoinut nämä |
| Quaternius Universal Animation Library 1/2 | quaternius.com (glTF/FBX) | CC0 | quaternius.com (lataus usein Google Driven kautta) | open-vrmassa VRMA-muodossa |
| KayKit Character Animations | kaylousberg.itch.io | CC0 | itch.io | open-vrmassa |
| Mixamo | mixamo.com | Adoben ehdot: saa käyttää teoksissa, mutta raakatiedostoja ei saa jakaa | **vaatii Adobe-kirjautumisen** | HF:n Mixamo-uudelleenjaot (`jasongzy/Mixamo`, `Linzhan/Mixamo-Animations-Characters` ...) ovat **harmaata aluetta, vältä** |
| `fbx2vrma-converter` (npm) | Mixamo-FBX:n muunnos VRMA:ksi | MIT | npm | ei testattu |
| Bandai Namco Research Motion Dataset | github BandaiNamcoResearchInc | CC BY-NC 4.0 | github | **ei kaupalliseen käyttöön** |

Käyttö: `node tools/vrm_assets/vrma2poses.js /models/X.vrm /clips/Sword_Regular_Combo.vrma q_combo 0.3,0.9,1.5,2.2 out.json --check tmp/`.
Tämän jälkeen yhdistä `out.json` tiedostoon `poses.json`. Klipistä poimitaan 3–5 avainta (anticipation, smear, pito), ja moottorin porrastus, IK-lukot ja `plant` hoitavat loput.

---

## 3. Efektit
- **[Kenney Particle Pack](https://kenney.nl/assets/particle-pack)**: CC0, 80 PNG:tä (512², harmaasävy + alfa): `slash_01-04`, `spark_01-07`, `star_*`, `smoke_01-10`, `flame_*`, `magic_01-05`,
  `twirl_01-03`, `trace_01-07`, `scorch_*`, `light_*`, `flare_01`. Ilman kirjautumista saa GitHub-peilistä
  `https://cdn.jsdelivr.net/gh/calinou/kenney-particle-pack@master/addons/kenney_particle_pack/<nimi>.png`.
  **TESTATTU**: komposiitti (screen-blend, sävytys) iskuasentoon toimii. Kuvat ovat geneerisiä maskeja eivätkä "anime"-tyylisiä sellaisenaan,
  joten niitä kannattaa käyttää tekstuureina fx.js:n omissa shader- ja sprite-efekteissä (sävytys, venytys, porrastus).
- [PVFX Foundry / Foundry Thirteen](https://nerijs.itch.io/pvfx-foundry): CC0, pikselitaide (sähköisku, sirppi-slash, elementit). Tyyli ei vastaa omaamme.
- [CodeManu VFX Free Pack](https://codemanu.itch.io/vfx-free-pack): CC BY 4.0, kunniamaininta pakollinen. MagusVFX ja CartoonCoffee ovat maksullisia.
  Animetyylisiä CC0-isku-, salama- ja speed line -spritesheetejä ei löytynyt. Koodilla tehdyt efektimme ovat tasoltaan parempia.
- three.js-kirjastot (npm):
  - `three.quarks` 0.17.1 (MIT): partikkelit ja trailit, oma editori
  - `three-nebula` 13.3.0 (MIT)
  - `postprocessing` 6.39.6 (Zlib): bloom, chromatic aberration, outline, LUT
  - `three-custom-shader-material` 6.4.0 (MIT)
  - `three/addons`: `OutlineEffect`, `SobelOperatorShader`, `AfterimagePass`, `UnrealBloomPass`, `HalftonePass`.

## 4. Taustat
- **Poly Haven** (CC0): 997 HDRI:tä, 869 tekstuuria ja 522 mallia. API `api.polyhaven.com/assets?t=hdris|textures|models` toimii,
  mutta tiedostot tulevat osoitteesta `dl.polyhaven.org` (host ei sallittu tässä).
- **[leodriesch/open-hdri-1k](https://huggingface.co/datasets/leodriesch/open-hdri-1k)** (HF): CC0, 3 491 HDRI:tä (Poly Haven, ambientCG, BlenderKit ...) **vain 1024×512** + JPG-esikatselu.
  **TESTATTU**: 1K riittää valaistukseen ja taivaan värireferenssiksi, mutta on liian pieni taustalevyksi.
  `painterly.py` (Kuwahara + posterointi + taivaan sävytys) tuotti tasaisen julistemaisen pinnan, ei maalattua animetaustaa. Omat numpy-taustamme ovat parempia.
- **[codepawl/quaternius-glb](https://huggingface.co/datasets/codepawl/quaternius-glb)** (797 GLB) ja **[codepawl/kenney-glb](https://huggingface.co/datasets/codepawl/kenney-glb)** (4 451 GLB), molemmat CC0.
  **TESTATTU**: tasavärilliset paketit (Simple Nature, Medieval Village) renderöityvät toon-materiaalilla ja ääriviivalla oikein.
  **Peilin "Textured"-paketeista puuttuvat tekstuurit ja UV:t** (puut näkyvät valkoisina), joten hae ne alkuperäisestä lähteestä (quaternius.com).
  Low-poly-tyyli sopii keskietäisyyden siluetteihin (puut, kivet, tolpat) maalatun taivaan eteen.
- Muita: [ambientCG](https://ambientcg.com) (CC0-tekstuurit), Sketchfab CC0 -suodatin (lataus vaatii ilmaisen tilin ja API-tokenin), poly.pizza (403 tässä), Kenney (kenney.nl, 403 tässä; HF-peili toimii).
- Anime-ilmeen saa näin: MToon tai `MeshToonMaterial` 2–3 portaan gradientMapilla, käänteinen kuori -ääriviiva (jo käytössä),
  yhtenäinen väripaletti (LUT) ja taivas sekä kaukotaso omista numpy-levyistä.

## 5. Muut valmiit
- Huulisynkka: [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) (MIT, releaset GitHubissa). Se tuottaa visemit A–H, jotka mapataan VRoidin `aa/ih/ou/ee/oh`-ilmeisiin.
  Nykyinen äänekkyyteen perustuva synkka korvautuu sillä, mutta 2D-lähikuvat pysyvät.
- Fontit (SIL OFL, `https://raw.githubusercontent.com/google/fonts/main/ofl/<nimi>/...`, kaikki tarkistettu 200):
  - japanilaiset: RampartOne, ReggaeOne, RocknRollOne, PottaOne, MochiyPopOne, YujiSyuku, YujiBoku, ZenAntique, ZenKurenaido, KaiseiDecol (otsikkokortit), ShipporiMinchoB1 (jo käytössä)
  - latinalaiset: Anton, BebasNeue, Bangers (jo käytössä).
- Äänet (vertailu Epidemiciin): Epidemic kattaa YouTube-monetisoinnin, kun tilaus on voimassa julkaisuhetkellä, joten sitä ei tarvitse vaihtaa. CC0-täydennyksiksi sopivat:
  - Kenney Audio (CC0: impact, RPG, UI)
  - freesound.org CC0-suodattimella
  - Sonniss GDC -paketit (rojaltivapaat, kaupallinen käyttö sallittu, ei kunniamainintaa; sonniss.com)
  - OpenGameArt (tarkista lisenssi tiedostokohtaisesti).
- Kuvanparannus: Real-ESRGAN (BSD-3; mallit `realesr-animevideov3`, `RealESRGAN_x4plus_anime_6B` GitHub-releaseissa;
  HF-peilit esim. `mlx-community/Real-ESRGAN-animevideov3`). Se on skaalausverkko eikä diffuusiogeneraattori. Käytä vain, jos neuroskaalaus sopii linjaan.

---

## TOP-5 (prioriteettijärjestys)
1. **Hiusten siirto CC0-VRoid-sampleista** (1c). Työmäärä: 0,5–1 päivää funktioksi chars.js:ään (+ myöhemmin jousiluut). Hyöty: suuri.
   Pehmeät ja pörröiset hiukset muuttuvat käsin rakennetuista valmiiksi ja sävytettäviksi, ja silti juridisesti puhtaiksi (CC0).
2. **open-vrma + vrma2poses**. Työmäärä: 0,5 päivää ja kuratointi. Hyöty: suuri nopeudessa ja kohtalainen laadussa.
   Miekkakombot, potkut, väistöt ja kuolemat saa valmiina avainposeina, ja kirjasto kasvaa 154:stä satoihin poseihin.
3. **Toinen ja kolmas pohja**: Sakurada Fumiriya (CC0, pitkä) pitkille hoikille hahmoille, HairSample_Male ja OGA base_male hartiakkaammille.
   `loadChar` on jo hahmokohtainen. Työmäärä: 1–2 päivää per pohja, koska vaatekoodi on viritetty C:lle. Hyöty: siluettien vaihtelu (pituus, hartiat, jalat).
4. **Kenney Particle Pack -maskit fx.js:n tekstuureiksi** (slash, spark, smoke, twirl, trace) ja tarvittaessa `three.quarks`. Työmäärä: 0,5 päivää. Hyöty: kohtalainen.
5. **CC0-3D-rekvisiitta ja -tekstuurit** (Quaternius/Kenney HF-peilit, Poly Haven -mallit) keskietäisyydelle maalattujen levyjen eteen. Työmäärä: noin 1 päivä. Hyöty: kohtalainen.
   HDRI:t vain värireferenssiksi.

## Hostit, joita tässä ei saatu käyttöön
Lisää nämä verkkoasetuksiin, jos tarvitset niitä:
- `opengameart.org` (CC0 VRoid -pohjat ja hiussamplet zip-paketteina)
- `vroid.pixiv.help` (A–C:n ehtosivu)
- `arweave.net` (100Avatars; vastasi 403)
- `dl.polyhaven.org` / `polyhaven.com` (2K–8K HDRI:t ja tekstuurit)
- `kenney.nl`, `poly.pizza`, `freesound.org` (403)
- `fonts.google.com`, `mocap.cs.cmu.edu`, `vrm.dev`
- `sonniss.com`, `quaternius`-pakettien Google Drive -linkit
- booth.pm- ja VRoid Hub -lataukset vaativat lisäksi pixiv-kirjautumisen.

## Työkalut (`tools/vrm_assets/`)
`npm install` asentaa three 0.170 ja three-vrm(-animation) 3.5.5. Playwright luetaan `$PLAYWRIGHT`-muuttujasta (oletus `/opt/node-tools/node_modules/playwright`).
- `fetch_assets.sh <kohde> vroid|vrm1|vrma|vfx|props`: lataa yllä listatut assetit repon ulkopuolelle.
- `shoot.js <outdir> nimi=/polku.vrm|{json}`: stillit samalla valolla ja MToonilla. Optiot: `anim`, `t`, `face`, `hairFrom`, `hairTint`, `plate`, `props`, `forceToon`.
- `vrma2poses.js`: VRMA:sta `poses.json`-muotoon (ks. luku 2).
- `vrmmeta.py <*.vrm>`: tulostaa lisenssimetadatan (VRM0 ja VRM1), ilmeet ja materiaalit.
- `painterly.py`: kokeellinen valokuvasta maalaukseksi -suodin (ks. luku 4; tulos heikko).
