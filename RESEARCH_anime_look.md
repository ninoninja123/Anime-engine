# Tutkimus: miten koodilla saadaan aidon animen näköinen video (ilman tekoälyvideomalleja)

Päiväys 2026-11-12. Ympäristö: Linux-kontti, 4 CPU-ydintä, ei GPU:ta, headless Chromium + SwiftShader, Node, Python, ffmpeg.
Tämä on tutkimusraportti, ei videota. Kolme pientä kokeilua ajettiin oikeasti kontissa (luku 5).

## 1. Yhteenveto

1. Suurin yksittäinen syy "paperinukke / PowerPoint" -vaikutelmaan on, että hahmot rakennetaan itse primitiiveistä. Valmis anime-hahmomalli (VRM) + MToon-shader näyttää heti animehahmolta, ja se pyörii meidän putkessa: mitattu 216 ms/frame 1280x720 SwiftShaderilla (36 000 kolmiota, outline mukana).
2. Guilty Gear Xrd -resepti on todennettavasti oikea suunta: muokatut normaalit, kova kaksisävyvarjo, inverted hull -viiva, hahmokohtainen valo ja pidetyt avainposet ilman interpolointia. Kokeilussa pelkkä kasvonormaalien pallotus poisti ruman nenäkolmiovarjon.
3. Liike on toinen puolisko. Xrd/DBFZ: jokainen pose tehdään käsin, askelletut (stepped) avaimet, pidot 2–4 framea, ei tietokoneen välikuvia. Meidän "tasainen interpolointi" on täsmälleen se, mitä he välttävät.
4. Valmiit liikkeet: Quaternius Universal Animation Library (CC0) ja CMU-mocap ovat lisenssiltään turvallisia. Mixamo on käyttökelpoinen mutta vaatii Adobe-kirjautumisen eikä raakatiedostoja saa jakaa julkisessa repossa.
5. Maalattu tausta onnistuu koodilla: kohinapilvet kolmella cel-sävyllä + ilmaperspektiivi + valonsäteet + Kuwahara-suodin. Kokeilu tuotti 6 sekunnissa kuvan, joka lukeutuu maalatuksi, mutta pilvien muoto ei ole vielä Shinkai-tasoa.
6. Blender toimii kontissa headlessina (4.5 LTS, 1.2 GB). Freestyle antaa oikeat tussiviivat myös hiusten ja vaatteiden sisään. Hinta: 6–9 s/frame Cyclesilla, EEVEE toimii llvmpipellä mutta hitaasti (noin 23 s/frame käynnistyksineen).
7. Efektit: käsin animoidun FX:n ydin on muotokieli ja ajoitus (pidot, 2–3 sävyä, terävät reunat), ei hiukkasmäärä. Tämä on jo meidän vahvuus; siirretään 3D-hiukkaset 2D-sprite-arkeiksi kynnystetyllä kohinalla.
8. Ei kannata: Unreal, Godot (ei GPU:ta), Live2D/Spine (suljettuja, vaativat käsin piirretyn taiteen), oman hahmogeometrian jatkokehitys primitiiveistä.
9. Realistinen taso koodilla ilman GPU:ta: Arc System Works -tyylinen "3D joka näyttää 2D:ltä" still-kuvissa ja lyhyissä otoksissa. Ei saavutettavissa: käsin piirretty sakuga-animaatio tai Ufotablen taustamaalausten yksityiskohtaisuus.
10. Rajoite: tunnettuja hahmoja (Gojo, Itachi jne.) ei ole CC0-malleina. Hahmot pitää edelleen rakentaa, mutta pohjaksi kannattaa ottaa valmis anime-perusmalli eikä primitiivit.

## 2. TOP-5 suositusta

### 1) VRM-anime-perusmalli + MToon + Xrd-säädöt three.js:ssä (korvaa primitiivihahmot)

- **Mitä:** hahmon pohjaksi VRM-malli (VRoid-tyylinen kasvo, kädet sormineen, hiukset, 50+ luuta, ilmeet valmiina blendshapeina). Renderöinti `@pixiv/three-vrm`:n MToon-materiaalilla, jossa on valmiina shade color, shading toony/shift, rim, matcap, inverted hull -outline ja spring bone -hiukset.
- **Miksi toimii:** korjaa suoraan kolme heikkoutta (kasvot, kädet, kokovartalon mittasuhteet). MToon on VRM-standardin anime-shader, jota käyttää koko VTuber-ekosysteemi. Kokeilu (a) vahvisti: kasvo näyttää animekasvolta ilman mitään omaa piirtokoodia.
- **Xrd-säädöt päälle** (GDC 2015, Motomura): (a) kasvojen ja kaulan normaalit korvataan pallomaisilla, jolloin varjoraja on yksi puhdas kaari; (b) hahmokohtainen valosuunta joka otokselle, ei kohtauksen valoa; (c) varjoväri = perusväri × sävytetty kerroin, ei mustaa; (d) viivan paksuus vertex-värillä ja kameraetäisyyden kompensointi, jotta viiva on ruudulla vakio; (e) hiusten spekulaarinauha erillisenä maskina.
- **Toteutus meidän putkessa:** `npm i three@0.170 @pixiv/three-vrm@3.5.5` (toimii proxyn läpi), GLTFLoader + VRMLoaderPlugin, `vrm.humanoid.getNormalizedBoneNode()` posetukseen, `vrm.expressionManager` ilmeisiin. Nykyinen `render.js` (segmentit, ffmpeg-putki) käy sellaisenaan. Hahmokohtaiset asut: tekstuurien uudelleenväritys koodilla + lisägeometria (viitta, miekka, hiusmalli) luihin kiinnitettynä.
- **Työmäärä:** M (perusputki 1–2 päivää, yksi tunnistettava hahmo asuineen L).
- **Riski:** tunnistettavan hahmon hiukset ja asu ovat edelleen omaa työtä. VRoid-perusmallit ovat tyyliltään "moe"; shounen-taistelijan leuka ja hartiat vaativat luuskaalausta ja morphien säätöä. Spring bone on tilallinen, joten determinismi vaatii simuloinnin ajon alusta jokaisessa segmentissä (tai bake).
- **Lisenssi:** three-vrm MIT. Kokeilumalli `VRM1_Constraint_Twist_Sample` on VRM Public License 1.0 (meta: kaupallinen käyttö sallittu, muokkaus ja uudelleenjako sallittu). VRoid AvatarSample-mallit ja 100Avatars ovat CC0-tyyppisiä, tarkista kunkin ehdot ennen käyttöä.

### 2) Avainposeanimaatio: stepped-avaimet, pidot ja pose-kirjasto (korvaa tasaisen interpoloinnin)

- **Mitä:** animaatio kuvataan listana käsin tehtyjä poseja ja pitoja framen tarkkuudella, esim. `[{pose:'windup', hold:2}, {pose:'smear_A', hold:1}, {pose:'impact', hold:4}, {pose:'settle', hold:3}]`. Poseiden välillä ei interpoloida lainkaan, tai korkeintaan yksi käsin määritelty välipose. Hahmo päivittyy 8–12 kertaa sekunnissa, kamera ja efektit 24 fps.
- **Miksi toimii:** Xrd:ssä ja Dragon Ball FighterZ:ssa animaattorit nimenomaan estivät tietokonetta interpoloimasta; jokainen pose seisoo omillaan ja luita skaalataan posekohtaisesti (iso nyrkki kameraa kohti, venytetty raaja). Lähde: Motomuran GDC-puhe ja New Frame Plus -analyysi "The Animation of Guilty Gear Xrd & Dragon Ball FighterZ".
- **Toteutus:** (a) pose = JSON luurotaatioista + luuskaalaukset + ilme; (b) pohjaposet poimitaan mocapista (Quaternius UAL / CMU / Mixamo) ottamalla klipistä 4–6 avainhetkeä ja liioittelemalla niitä (selkärangan kaari, hartialinja, "line of action"); (c) ajoitusmallit valmiina: anticipation 2–3 fr, smear 1 fr, impact-pito 3–5 fr, settle 2 askelta; (d) smear: nykyinen vertex-shader-smear tai monistettu raaja (multiples) yhden framen ajan; (e) sekundääriliike (hiukset, viitta) jatkuu 24 fps pitojen aikana, se pitää kuvan elävänä.
- **Työmäärä:** M. Pose-editoria ei tarvita, mutta tarvitaan kontaktiarkki-työkalu (meillä on `sheet`) poseiden tarkistukseen.
- **Riski:** poseiden laatu on taiteellinen pullonkaula; huono pose pidettynä 4 framea näyttää huonommalta kuin interpoloitu. Mocap-pohja pienentää riskiä.
- **Lisenssi:** oma koodi. Mocap-lähteet luvussa 4.

### 3) Maalattu taustamoottori: offline-levyt + multiplane

- **Mitä:** taustat generoidaan etukäteen isoina kuvalevyinä (esim. 2560x1080 per kerros: taivas, kaukopilvet, lähipilvet, vuoret, keskitaso, etuala) ja videossa niitä vain liikutetaan parallaksina. Maalausjälki tehdään kerran per levy, ei per frame, joten se ei välky.
- **Miksi toimii:** animessa taustat ovat still-maalauksia, joita kamera panoroi. Kuwahara-suodin tuottaa tasaiset siveltimenvedot ja säilyttää reunat (Kyprianidis ym. 2009, anisotrooppinen versio seuraa muotoja). Kokeilu (b): 6 s per 720p-levy numpyllä.
- **Toteutus:** Python/numpy-skripti `pre/`-vaiheeseen. Resepti: (1) taivasgradientti 4 pysäytyksellä; (2) pilvet billow-fBm:stä, tasapohja + korkeusprofiili, valaistus tiheyserolla auringon suuntaan, kvantisointi 3 sävyyn + lämmin reunavalo; (3) vuorikerrokset, joiden väri sekoittuu horisontin utuun (ilmaperspektiivi); (4) valonsäteet kulmakohinasta, pilvien peittämänä; (5) Kuwahara kahdella säteellä; (6) matalataajuinen sivellinraita. Seuraava taso: anisotrooppinen Kuwahara rakennetensorilla ja Hertzmannin kerroksittainen siveltimenvetomaalaus (isot vedot ensin, pienet päälle). Arkkitehtuuritaustat: three.js-geometria renderöidään ensin tasaisin värein ja ajetaan saman maalaussuotimen läpi.
- **Työmäärä:** M (taivas ja maasto), L (kaupunki- ja sisätilat).
- **Riski:** proseduraalinen pilvi jää helposti "möykyksi" ilman käsin määriteltyjä suurmuotoja; ratkaisu on antaa pilvien siluetit käsin (muutama ellipsi per pilvi) ja käyttää kohinaa vain reunaan.
- **Lisenssi:** oma koodi, algoritmit julkaistuja.

### 4) Viivan ja varjon hallinta: Xrd-linjatekniikka + (valinnainen) Blender Freestyle sankariotoksiin

- **Mitä:** kaksi tasoa. Perustaso three.js:ssä: inverted hull, jonka paksuus tulee vertex-väristä (ohut kasvoissa ja sormissa, paksu siluetissa), kompensoidaan kameraetäisyydellä ja FOV:lla; sisäviivat tekstuurina. Sankaritaso: lähikuvat ja "money shotit" renderöidään Blenderillä Freestyle-viivoin.
- **Miksi toimii:** vakiopaksuinen outline on yksi näkyvimmistä "3D-malli" -merkeistä. Arc System Works käyttää inverted hull -menetelmää kaikissa peleissään ja ohjaa paksuutta vertex-väreillä. Kokeilu (c): Freestyle piirsi hiusten ja vaatteiden sisäviivat, joita inverted hull ei tee.
- **Toteutus:** MToonissa `outlineWidthFactor` + `outlineWidthMultiplyTexture`; oma vertex-attribuutti paksuudelle. Blender: `blender -b -P scene.py`, malli glTF:nä sisään, pose JSON:sta, PNG-sekvenssi ulos, kompositointi ffmpegillä meidän efektien alle.
- **Työmäärä:** S (three.js-viiva), M (Blender-putki).
- **Riski:** Blender 6–9 s/frame; hahmo "kakkosilla" tarkoittaa 12 kuvaa sekunnissa, eli 10 s otos on noin 15 min neljällä ytimellä rinnakkain ajettuna. Kahden renderöijän ulkoasu pitää täsmätä. Levytila: Blender vie 1.2 GB.
- **Lisenssi:** Blender GPL (tulosteet omia), VRM Add-on for Blender MIT/GPL-3.0.

### 5) 2D-FX sprite-arkkeina: käsin animoidun efektin säännöt koodiksi

- **Mitä:** tuli, savu, salama, iskuaalto ja energia tehdään 2D-sprite-sekvensseinä (8–16 kuvaa, toisto kakkosilla tai kolmosilla), joissa on 2–3 tasaista sävyä ja terävä reuna, ja jotka sijoitetaan 3D-kohtaukseen billboardeina.
- **Miksi toimii:** animen FX on muotoja ja ajoitusta. Säännöt (Gilland, *Elemental Magic*; 2D FX -kurssit): tuli ja savu ovat aaltoliikettä, joka nousee ja katkeaa irtopaloiksi; räjähdys = 1–2 framen valkoinen välähdys, nopea laajeneminen, pitkä hidas hajoaminen; salama piirretään uusiksi joka frame ja pidetään 1–2 framea; muodot epäsymmetrisiä, isoa/keskikokoista/pientä rinnakkain.
- **Toteutus:** canvas 2D tai shader: fBm-kohina + muotomaski, kynnystys 2–3 tasoon (ei pehmeää alfaa), aika kvantisoitu askeliin, kynnyksen nosto ajan myötä "syö" muodon reikäiseksi (dissolve). Salama: midpoint displacement uudella siemenellä joka toinen frame + paksu valkoinen ydin + värillinen reuna. Arkit generoidaan `pre/`-vaiheessa PNG:ksi.
- **Työmäärä:** S–M. Rakentuu nykyisen efektikoodin päälle.
- **Riski:** pieni. Liian säännöllinen kohina näyttää edelleen geometriselta; tarvitaan käsin asetetut suurmuodot (kaaret, piikit) kohinan alle.
- **Lisenssi:** oma koodi.

## 3. Vaihtoehtojen vertailu

| Vaihtoehto | Hyöty heikkouksiin | Toimiiko kontissa | Nopeus | Työmäärä | Arvio |
|---|---|---|---|---|---|
| VRM + MToon (three.js) | Kasvot, kädet, vartalo | Kyllä, testattu | 216 ms/frame 720p | M | Tee ensin |
| Xrd-normaalit + valo per hahmo | Puhtaat varjot | Kyllä, testattu | Ei lisäkustannusta | S | Tee ensin |
| Stepped-avainposet + mocap-pohja | Jäykkä, tasainen liike | Kyllä | Ei kustannusta | M | Tee ensin |
| Maalatut taustalevyt (numpy) | Litteät taustat | Kyllä, testattu | 6 s/levy | M | Tee ensin |
| Blender headless + Freestyle | Viivan laatu | Kyllä, testattu | 6–9 s/frame (Cycles) | M | Vain sankariotoksiin |
| Blender EEVEE (llvmpipe) | Shader to RGB -toon | Kyllä (vaatii `libegl1`, `libgl1-mesa-dri`) | noin 23 s/frame | M | Liian hidas, ei hyötyä Cyclesiin nähden |
| Blender Grease Pencil / Line Art | Viivat 2D-objekteina | Todennäköisesti, ei testattu | Hidas | L | Myöhemmin |
| Genshin-tyylinen kasvovarjo-SDF | Kasvovarjo | Kyllä (shader) | Halpa | M (kartta pitää tehdä) | Pallonormaalit riittävät aluksi |
| Unity UTS / lilToon / NiloToon | Referenssi | Ei (Unity) | – | – | Lue shader-koodi ideoiksi |
| Godot headless | – | Vain ohjelmistorenderöinnillä | Hidas | L | Ei |
| Unreal | – | Ei | – | – | Ei |
| Live2D / Spine | 2D-rigit | Suljettuja, vaativat piirretyn taiteen | – | – | Ei |
| Inochi2D / Rive / Lottie / Synfig / OpenToonz | 2D-rigit ja vektorianimaatio | Osittain | – | L | Ei ratkaise taiteen puutetta |
| skia-canvas / Cairo | Nopeampi 2D ilman selainta | Kyllä | Nopeampi | M | Optimointi, ei ulkoasuhyötyä |
| Motion matching | Liikkeen sujuvuus | Kyllä | – | L | Väärä suunta: anime haluaa poseja, ei sujuvuutta |
| Diffuusiomallit | – | Rajattu pois | – | – | Ei |

## 4. Linkit ja lähteet

Tähtimäärät haettu 2026-11-12 GitHubin sivuilta; "ei tarkistettu" tarkoittaa, ettei lukua haettu tässä tutkimuksessa.

### Toon-renderöinti

| Lähde | Tähdet | Lisenssi | Huomio |
|---|---|---|---|
| [pixiv/three-vrm](https://github.com/pixiv/three-vrm) | 2.3k | MIT | MToon, spring bone, humanoid, ilmeet. npm `@pixiv/three-vrm` 3.5.5, lisäksi `@pixiv/three-vrm-animation` (.vrma) |
| [vrm-c/UniVRM](https://github.com/vrm-c/UniVRM) | 3.4k | MIT | MToonin referenssitoteutus |
| [lilxyzw/lilToon](https://github.com/lilxyzw/lilToon) | 1.6k | MIT | Laajin avoin anime-shader, hyvä ideavarasto (rim, matcap, hiusnauha) |
| [Unity-Technologies/com.unity.toonshader](https://github.com/Unity-Technologies/com.unity.toonshader) | 1.6k | Unity Companion License | Vain luettavaksi, ei kopioitavaksi |
| [saturday06/VRM-Addon-for-Blender](https://github.com/saturday06/VRM-Addon-for-Blender) | 1.7k | MIT / GPL-3.0 | VRM + MToon + VRM Animation Blenderiin, Python-API |
| [NoiRC256/URPSimpleGenshinShaders](https://github.com/NoiRC256/URPSimpleGenshinShaders) | ei tarkistettu | ei tarkistettu | Kasvovarjo-SDF:n selkeä toteutus |
| [ChiliMilk/URP_Toon](https://github.com/ChiliMilk/URP_Toon) | ei tarkistettu | ei tarkistettu | Toon + SDF-kasvo |
| [Godot anime face shader](https://godotshaders.com/?p=12040) | – | sivun mukaan | SDF-kasvovarjo GLSL-tyylisenä |

### Puheet ja analyysit

- Junya C. Motomura, "GuiltyGearXrd's Art Style: The X Factor Between 2D and 3D", GDC 2015: [GDC Vault](https://gdcvault.com/play/1022031/GuiltyGearXrd-s-Art-Style-The), [video](https://videohighlight.com/v/yhGjCzxJV3E), [ASW:n ilmoitus + PDF](https://www.arcsystemworks.com/?p=823), [PDF](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf)
- Arc System Works Academy, "Guilty Gear Toon Line Control Techniques" (ENG): [Docswell](https://docswell.com/s/ASW_Academy/5LVY67-GG-Toonline-Eng)
- New Frame Plus, "The Animation of Guilty Gear Xrd & Dragon Ball FighterZ": [tekstitys](https://amara.org/videos/bDmpkclvfB5I/info/the-animation-of-guilty-gear-xrd-dragon-ball-fighterz)
- CEDEC 2016, cel-shading (japaniksi): [CGWORLD](https://cgworld.jp/article/201609-cedec-cell.html)
- Game Watch GDC-raportti (japaniksi): [artikkeli](https://game.watch.impress.co.jp/docs/news/20150307_691725.html)
- [Polycount-ketju Xrd-tekniikasta](https://polycount.com/discussion/comment/2219625), [tiivistelmä](https://noggi3d.notion.site/guilty-gear-style-summary)

Xrd-tekniikan yksityiskohdat (vertex-värikanavat, ILM-tekstuuri, luuskaalaus) on kirjattu tähän raporttiin muistinvaraisesti GDC-puheesta, koska `ggxrd.com` ja `docswell.com` eivät ole tämän session sallituissa verkko-osoitteissa. Tarkista luvut alkuperäisestä PDF:stä ennen kuin niihin nojataan.

### Maalaukselliset taustat

- Kyprianidis, Kang, Döllner 2009, "Image and Video Abstraction by Anisotropic Kuwahara Filtering": [paperi](https://diglib.eg.org/handle/10.2312/CGF.v28i7pp1955-1963), [Kang-PDF](https://umsl.edu/~kangh/Papers/kang_cgf09.pdf)
- Maxime Heckel, "On Crafting Painterly Shaders" (Kuwahara WebGL-jälkikäsittelynä): [blogi](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders) (osoite ei sallittu tässä sessiossa, ei luettu)
- [Anisotropic Kuwahara, Godot-shader](https://godotshaders.com/shader/anisotropic-kuwahara-filter/) (Acerolan Unity-toteutuksesta)
- [Blenderin Kuwahara-kompositointinoodi](https://www.blender.org/manual/en/compositing/types/filter/kuwahara.html) (anisotrooppinen versio valmiina, toimii CPU:lla)
- [80.lv: anime-pilvet Blenderissä](https://80.lv/articles/anime-style-clouds-in-blender-step-by-step-tutorial)
- Hertzmann 1998, "Painterly Rendering with Curved Brush Strokes of Multiple Sizes" (kerroksittainen siveltimenvetoalgoritmi)
- Shinkai-tyylisille pilville ei löytynyt valmista avointa shaderia; ne pitää rakentaa itse.

### Hahmomallit ja liike

| Lähde | Lisenssi | Saatavuus proxyn läpi |
|---|---|---|
| three-vrm:n `VRM1_Constraint_Twist_Sample.vrm` (10.8 MB) | VRM Public License 1.0 | Kyllä (`git clone` toimii) |
| [ToxSam/open-source-avatars](https://github.com/toxsam/open-source-avatars) (300+ VRM, rekisteri CC0, mallit projektikohtaisesti) | CC0 / CC-BY per projekti | Rekisteri kyllä, mallit Arweavessa: **ei** (arweave.net estetty) |
| [VRoid CC0 -mallit, OpenGameArt](https://opengameart.org/content/vroid-studio-cc0-models) | CC0 | Ei testattu |
| VRoid Hub AvatarSample-mallit | CC0-tyyppinen | hub.vroid.com estetty |
| [Karindou 式神 collection](https://karindou.itch.io/vroid) | CC0 | Ei testattu |
| Quaternius (mallit + Universal Animation Library) | CC0 | quaternius.com vastaa (200) |
| Mixamo | Käyttö projekteissa sallittu, raakatiedostojen jako kielletty; vaatii Adobe-kirjautumisen | Ei automatisoitavissa; käyttäjä lataa itse, ei julkiseen repoon |
| CMU Motion Capture Database (BVH-muunnokset) | Vapaa käyttö, myös kaupallinen (muistinvarainen, tarkista) | Ei testattu |
| Bandai Namco Research Motiondataset | CC BY-NC (muistinvarainen, tarkista) | Ei testattu |
| LAFAN1, AMASS | Ei-kaupallinen / tutkimuskäyttö | Älä käytä |

Retargetointi: [`vrm-mixamo-retarget`](https://unpkg.com/vrm-mixamo-retarget@1.0.3/README.md) (Mixamo FBX → three-vrm AnimationClip) ja open-source-avatars-repon `integrations/animationLoader.js` + `mixamo-rig-map.js` (CC0, vain VRM 0.x).

### Efektit

- Joseph Gilland, *Elemental Magic* (kirja, käsin animoidun FX:n perusteos)
- [VFX Apprentice: stylized fire](https://www.vfxapprentice.com/blog/how-to-draw-stylized-fire-flames)
- [School of Motion: hand animated effects](https://www.schoolofmotion.com/blog/hand-animated-effects-in-adobe-animate)
- [VFX Voice: käsin piirretyt efektit, Spider-Verse-putki](https://www.vfxvoice.com/the-return-of-hand-drawn-and-stylized-effects-animation/)

## 5. Kokeilujen tulokset

Kuvat ovat session scratchpadissa (eivät repossa):

| Kuva | Polku |
|---|---|
| (a) koko vartalo, MToon | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/a_body.png` |
| (a) kasvo, alkuperäiset normaalit | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/a_face_stock.png` |
| (a) kasvo, pallotetut normaalit | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/a_face_edit.png` |
| (b) tausta ennen suodinta | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/b_raw.png` |
| (b) tausta Kuwaharan jälkeen | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/b_painterly.png` |
| (c) Blender Cycles + Freestyle | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/c_blender_CYCLES.png` |
| (c) Blender EEVEE + Freestyle | `/tmp/claude-0/-home-user/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/exp/c_blender_EEVEE.png` |

Skriptit: `.../scratchpad/exp/a/index.html` + `run.js`, `.../exp/b/bg.py`, `.../exp/c/scene.py`.

### (a) VRM + MToon + muokatut normaalit, three.js / SwiftShader

- Malli: `VRM1_Constraint_Twist_Sample` (36 470 kolmiota, 13 meshiä, 18 ilmettä). Lataus 0.6 s.
- **Nopeus: 216 ms/frame** 1280x720, antialiasointi ja outline päällä, yksi hahmo, ei jälkikäsittelyä.
- Mitä näkyy: lähikuvassa kasvo, silmät, hiukset ja viiva näyttävät oikealta animehahmolta; tämä on selvästi eri luokkaa kuin primitiivihahmot. Alkuperäisillä normaaleilla sivuvalo tekee kasvoihin terävän kolmion nenän viereen ja rikkonaisen varjon. Pallotetuilla normaaleilla varjoraja on yksi puhdas kaari poskella.
- Mikä ei onnistunut: kokovartalokuvan taisteluasento on huono. Kirjoitin poseen luurotaatiot sokkona, kädet menivät rinnan eteen ja hiha leikkaa. Tämä kertoo posetuksen vaikeudesta käsin kirjoitetuilla kulmilla, ei mallin laadusta. Kokovartalokuvassa hahmo on myös pieni ja viiva lähes näkymätön, eli viivan paksuuden etäisyyskompensointi tarvitaan.

### (b) Maalattu tausta, Python/numpy

- **Nopeus:** generointi 5.3 s + Kuwahara 1.0 s, 1280x720.
- Mitä näkyy: sininen taivas, kolmisävyiset pilvet lämpimällä reunalla, auringon hehku ja säteet, kolme vuorikerrosta utuineen, niitty. Kuwaharan jälkeen pinta jakautuu tasaisiksi siveltimentäpliksi ja kuva lukeutuu maalatuksi, ei gradientiksi.
- Puutteet: pilvet ovat muodoltaan satunnaisia läiskiä, niistä puuttuu kumpupilven tilavuus ja tasapohja. Vuoret ovat tasaisia nauhoja. Niityn täplät ovat tasakokoisia. Ensimmäinen ajo oli lähes kokonaan pilven peitossa; peittävyyttä piti säätää kerran. Taso on "hyvä mobiilipelin tausta", ei Shinkai.

### (c) Blender headless

- Asennus: virallinen `blender-4.5.16-linux-x64.tar.xz` (339 MB, purettuna 1.2 GB) latautui `download.blender.org`:sta ja käynnistyi suoraan. `pip install bpy` on myös saatavilla (5.3.0), ei testattu.
- **Cycles CPU:** 6–8 s/frame (16 näytettä, 1280x720, Toon BSDF + Freestyle), ensimmäinen ajo 4.5 s ilman Freestylea.
- **EEVEE Next ja Workbench:** kaatuivat aluksi (`libEGL.so.1` puuttui). `apt-get install libegl1 libgl1-mesa-dri` jälkeen toimivat ohjelmistorenderöinnillä: EEVEE 23–45 s/frame käynnistyksineen, Workbench 8.8 s.
- Mitä näkyy: Freestyle piirtää vaihtelevan paksuiset tussiviivat siluettiin sekä hiusten, paidan ja shortsien sisään; viiva on selvästi parempi kuin inverted hull. Varjostus sen sijaan epäonnistui: Cycles-kuva on ylivalottunut ja iho lähes valkoinen, EEVEE-kuvassa ramppi ei tuottanut näkyvää varjoa (täysin litteä väri). Materiaalit olivat pikaviritys, MToonia ei tuotu.
- Freestyle tulosti virheen `'NoneType' object has no attribute 'use_chaining'`, mutta viivat renderöityivät silti. Syytä ei selvitetty.
- VRM tuotiin nimeämällä tiedosto `.glb`:ksi; glTF-tuoja lukee geometrian, luut ja tekstuurit mutta ohittaa MToon-laajennuksen.

## 6. Suositeltu tekniikkapino seuraavaan videoon

Järjestys on valittu niin, että jokainen vaihe tarkistetaan still-kuvilla ennen seuraavaa.

1. **Hahmoshader ja malli (viikko 1).** VRM-perusmalli three.js:ään, MToon, pallotetut kasvonormaalit, hahmokohtainen valo, viivan paksuuden etäisyyskompensointi. Yksi hahmo asuineen (uudelleenväritetty tekstuuri + lisätty hiusgeometria + viitta). Hyväksymiskriteeri: lähikuva ja keskikuva, joita käyttäjä pitää animehahmona.
2. **Taustamoottori.** numpy-levygeneraattori `pre/`-vaiheeseen, pilvien suurmuodot käsin, anisotrooppinen Kuwahara. Kaksi paikkaa (ulkotaivas, yksi arkkitehtuuripaikka three.js-geometriasta suodatettuna). Hyväksymiskriteeri: still, jossa hahmo ja tausta istuvat samaan kuvaan (hahmolle taustan väristä johdettu reunavalo ja varjosävy).
3. **Avainposeanimaatio.** Pose-JSON, stepped-toisto, ajoitusmallit, mocap-pohjat (Quaternius UAL ensin, koska CC0 ja saatavilla). Yksi 3 sekunnin iskusarja kontaktiarkkina ennen kuin tehdään enempää.
4. **FX-sprite-arkit.** Tuli, savu, isku, salama 2–3 sävyllä, askelletulla ajalla; korvaa 3D-hiukkaset.
5. **Kompositointi.** Nykyinen kamera, impact-framet, leikkaus ja SFX säilyvät. Lisätään hahmon ja taustan värisovitus per otos.
6. **Valinnainen:** Blender + Freestyle 2–3 sankariotokseen, jos vaiheen 1 viiva ei riitä.

Renderöintibudjetti: hahmo-otokset noin 0.2–0.5 s/frame (yksi tai kaksi hahmoa + jälkikäsittely) eli 60 s video noin 10–15 min neljällä työntekijällä; nykyinen putki riittää.

## 7. Rehellinen arvio: mikä on saavutettavissa

**Saavutettavissa koodilla ilman GPU:ta:**

- Hahmot, jotka näyttävät still-kuvassa animehahmoilta (valmis VRM-pohja + MToon + Xrd-säädöt). Tämä on isoin hyppy nykyisestä.
- Arc System Works -tyylinen liike: pidetyt poset, smearit, impact-framet. Vaatii hyvät poset, mutta tekniikka on yksinkertaista.
- Maalatun näköiset taivas- ja maisemataustat parallaksilla.
- Tyylitellyt 2D-efektit, jotka ovat jo nyt lähellä.
- Renderöintinopeus ei ole este.

**Osittain saavutettavissa, vaatii paljon käsityötä:**

- Tunnistettavat lisenssihahmot (Gojo, Itachi, Shanks): malleja ei ole vapaasti, joten hiukset, asu ja kasvonpiirteet rakennetaan itse perusmallin päälle. Lopputulos on "samannäköinen VRoid-hahmo", ei studion mallinnus.
- Kädet lähikuvassa: sormiluut ovat mallissa, mutta ilmeikkäät käsiposet pitää tehdä yksi kerrallaan.
- Arkkitehtuuri- ja sisätilataustat maalattuna.

**Ei saavutettavissa tällä putkella:**

- Käsin piirretty sakuga (Ufotable, MAPPA): jokainen kuva on piirretty uudelleen, muodot muuttuvat vapaasti. 3D-rigi ei tee tätä; Xrd pääsee lähelle vain siksi, että animaattorit muokkaavat mallia käsin joka poseen.
- Ufotablen taustamaalausten ja digitaalisen kompositoinnin taso. Proseduraalinen maalaus jää yleispiirteiseksi.
- Ilmeikäs kasvoanimaatio kaikista kulmista: VRM-ilmeet ovat perustasoa (18 kpl), äärimmäiset taisteluilmeet vaativat omia morpheja tai 2D-kasvojen vaihtoa.
- "Aidon animen taso" koko videon mitalta. Realistinen tavoite on laadukkaan anime-tyylisen 3D-pelin välianimaatio (Guilty Gear, Genshin), ei TV-sarjan jakso.

**Verkkorajoitteet tässä ympäristössä:** `arweave.net` (100Avatars-mallit), `hub.vroid.com`, `ggxrd.com`, `docswell.com` ja `blog.maximeheckel.com` eivät ole sallittuja. GitHubin API ei toimi ilman repokohtaista lupaa, mutta `git clone` ja raw-tiedostot toimivat. Jos CC0-malleja halutaan Arweavesta, osoite pitää sallia verkkoasetuksissa tai käyttäjän pitää ladata mallit itse.
