# Ginga Densetsu Weed -fanipeli: koira-assettien ohje (ChatGPT-kuvat → Tripo 3D)

Tämä ohje on toiselle chatille, joka tekee koirahahmot. Peli on mobiilipeli (Three.js, sivunäkymä, vaaka), joten mallien pitää olla kevyitä ja animoituja.

## 1. Tyyli
- Anime-tyylinen, selkeät muodot, rajattu värimaailma (kuin 2000-luvun anime-sarja, "Ginga Densetsu Weed"). Ei fotorealismia.
- Ei verta, ei haavoja, ei kauhutyyliä (pelin ikäraja PEGI 12).
- Hahmojen ulkonäkö otetaan animesta (hae kuvia hahmoista) tai käyttäjän antamista referensseistä. Älä keksi uusia merkkejä tai väriä, jos et tiedä.

## 2. Hahmolista (tärkeysjärjestys)
**Pakolliset ensimmäiseen tasoon (Gajō, Kaibutsu-arc):**
1. **Weed**: Ginin poika, pieni/nuori, vaalea (valkoinen), sitkeä ilme. Pelin päähahmo, tärkein.
2. **Kaibutsu (P4)**: laboratoriossa muokattu hirviökoira, iso ja leijonamainen (harja), **karvaton alue vasemmassa kyljessä ja rinnassa** (heikko kohta). Reilusti muita suurempi.
3. **Jerome**: saksanpaimenkoira, entinen laboratorion vartija, vakava ja syyllisyyttä kantava ilme.
4. **Smith**: veteraani, **kolmijalkainen** (yksi jalka puuttuu).
5. **Ken**: tanskandogi (Great Dane), Benin poika.
6. **Kagetora**: kai-koira, Kurotoran poika.
7. **Robert, Rocker, Heuler**: Jeromen miehet ("Neljä nuolta"), vartijakoiria (tarkista ulkonäkö animesta; erotettavissa toisistaan väreillä/merkeillä).

**Myöhemmin (tasot 3–8):** Gin (hopea akita, johtaja), John, Akame, Hiro, GB (englanninsetteri), Hōgen (tanskandogi, iso ja uhkaava), Genba (Hōgenin veli, tanskandogi), Lector ja Thunder (dobermannit), Rocket (borzoi), Kyōshirō (kishu), Tesshin (ninjakoira), Kamakiri (irlanninsusikoira), Tōbee (entinen taistelukoira), Sancho (villisika).

## 3. Työnkulku
**Vaihe A – kuvat ChatGPT:ssä (jokaiselle hahmolle):**
- Yksi koira, koko vartalo näkyvissä, **suora sivukuva** (profiili) tai kevyt 3/4, neutraali seisova perusasento: kaikki neljä jalkaa maassa, hännän ja korvien pitää näkyä, suu kiinni.
- Tasainen vaalea/harmaa tausta, ei varjoa, ei maata, ei tekstiä, ei muita hahmoja.
- Sama tyyli ja valaistus kaikilla hahmoilla.
- Esimerkkipromptti: *"Anime-style full-body side view of [HAHMO, rotu, värit, tunnuspiirteet], standing neutral pose, all four legs visible, plain light gray background, flat even lighting, no shadow, no text, clean cel-shaded look, 2000s anime style."*
- Tee myös kuva edestä/takaa, jos Tripon multi-view-tila hyödyntää niitä (parempi malli).

**Vaihe B – Tripo (image-to-3D):**
- Käytä parasta saatavilla olevaa image-to-3D-tilaa. Tavoite alle ~30 000 kolmiota per koira, tekstuurit 1024–2048 px.
- Käytä Tripon **auto-rig-ominaisuutta nelijalkaiselle** (quadruped) ja valmiita animaatioita, jos saatavilla.
- Vie **GLB (glTF binary)**, rigi ja animaatiot mukana.

## 4. Animaatiot (jokaiselle pääkoiralle)
Nimet täsmälleen näin (pienellä, jos mahdollista):
`idle`, `walk`, `run`, `jump`, `bite` (hyökkäys/purenta), `hurt` (osuma), `die` (kaatuminen, ei verta).
Weedille lisäksi `battoga` (ilmassa pyörivä hyppypurenta), jos saatavilla; muuten teen sen koodilla `jump`-animaation päälle.

Jos jokaiselle koiralle ei saa kaikkia animaatioita, **riittää että Weed saa täyden setin**. Silloin tehdään yksi hyvin rigattu peruskoira ja muut hahmot ovat sen värivariantteja (kokoa, väriä, korvia, harjaa muokataan koodissa). Silloin muille hahmoille riittää pelkkä hyvä still-kuva tai malli ilman animaatioita.

## 5. Tiedostot ja nimeäminen
- `weed.glb`, `kaibutsu.glb`, `jerome.glb`, `smith.glb`, `ken.glb`, `kagetora.glb`, `robert.glb`, `rocker.glb`, `heuler.glb` jne.
- Kaikkien koirien suunta: **+X-akseli eteenpäin**, jalat maata vasten (pivot jalkojen alla), mittakaava realistinen suhteessa toisiinsa (Weed pieni, Kaibutsu moninkertainen).
- Palauta jokaiselle: tiedoston nimi, koira, käytetty työkalu ja **Tripon lisenssi/käyttöehdot** (kaupallinen käyttö sallittu vai ei).

## 6. Toimitus
Anna GLB-tiedostot käyttäjälle, joka lataa ne repoon kansioon `weed-game/public/models/` tai liittää ne chattiin. Tarkistan ne ja liitän peliin.

## 7. Huomio
Hahmot ovat Takahashi Yoshihiron *Ginga Densetsu Weed* -teoksen hahmoja. Peli on kaupaton fanipeli; älä käytä mallien nimissä tai kuvissa viralliseksi väitettäviä logoja.
