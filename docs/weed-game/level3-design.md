# Taso 3 "The Alps Trap – John's Last Stand" (Alppien ansa / Johnin viimeinen taistelu): suunnitelma

Pohja: `level3-research.md` (jaksot 6–10, lähteet ja [VARMA]/[EPÄVARMA]/[PÄÄTÖS]). Kuvakieli: `cutscene-quality.md` +
`arrows-reference-shotlist.md` (kovat leikkaukset, kuvakoko ja kulma vaihtuvat lähes joka iskulla, ECU ↔ laaja, matala kulma
uhalle, ylhäältä menetykselle, välähdysleikkaukset iskuissa, sitten pidetty lähikuva tunteelle).

## 1. Rakenne (osiot = tarkistuspisteet, `?level=3&section=N` tai nimi)

| # | Osio (`SECTIONS3`) | Tyyppi | Sisältö | Jakso |
|---|---|---|---|---|
| 0 | `trap` | cutscene | Lumimyrsky, Reikan mökki, armeija saartaa, Hōgen esittäytyy, Gin lähettää Akamen | 6 |
| 1 | `cover` | **pelattava** (lyhyt) | "Cover Akame!" – John estää 6 sotilasta, jotka yrittävät katkaista Akamen pakotien. Ohjauksen opetus. | 6 (FB: John suojaa) |
| 2 | `hostage` | cutscene | Missile tuo Reikan, Hōgen vaatii antautumista, Gin ja John antautuvat (häivytys) | 6 |
| 3 | `captive` | cutscene | Akame Gajōlla yöllä (Weed lähtee) → Hōgenin maja: Hook tuo lunta, Hiro antautuu Reikan takia, Gin käskee Johnin viedä Reikan, pako myrskyyn | 7–8 |
| 4 | `oath` | cutscene | Hōgen arvaa reitin; myrsky laantuu; John jakaa joukon, kolme lupausta, Lefty/Tommy/Rossi jäävät | 9 |
| 5 | `stand` | **pelattava** (pää) | Johnin viimeinen taistelu: 4 aaltoa, yhteensä 50 sotilasta; aaltojen välissä toveri kaatuu (minikohtaus) | 9 |
| 6 | `hogen` | cutscene | Hōgen saapuu; ristileikkaus Weed löytää Hiron ja Reikan; Hook; puu ja oksa; John nousee; Matsu pysäyttää; vetäytyminen | 9 |
| 7 | `farewell` | cutscene | Weed löytää Johnin, GB "Akamena", John kuolee; yö: neljä hautaa, ulvonta tähtitaivaalle, Weedin vala | 9–10 |

Kesto: n. 9–13 min (cutscenet ~6 min, pelattava ~4–6 min). Lopussa tulosruutu "Level 3 complete" ja `localStorage weed.l3done = 1`.

## 2. Pelattava: "Hold the Line" (sama ydin osioissa 1 ja 5)

Olemassa oleva ele-ohjaus (`src/input.js`), uusi taistelusilmukka `src/level3.js` (taso 1:n kevyen taistelun mallin mukaan).
Kaikki arvot datana `src/data/level3_config.js`.

**John** = pelattava: vanha ja haavoittunut. Hidas mutta voimakas; ei pakoa (selän takana on polku, jota hän suojaa).
| Ele | Toiminto |
|---|---|
| Napautus | **purenta**: lyhyt syöksy lähimpään edessä olevaan sotilaaseen (ulottuvuus 2,3), 1 vahinko + takaisku; **vastaisku** sotilaan varoituksen ("!") aikana = 2 vahinkoa, lisää Henkeä. Jäähtymisaika 0,5 s (hidas). |
| Pyyhkäisy ← / → | lyhyt väistö taakse / eteen (0,9 yks., i-framet 0,35 s). Täydellinen väistö = slow-mo + Henki. Taaksepäin ei pääse rajan (x = -2,8) yli. |
| Pyyhkäisy ↑ | karjaisu: lähin sotilas horjahtaa (0,6 s), jäähtymisaika 3 s |
| Ympyrä ⟳ / Henki-renkaan napautus | **Ōu Fang** (Henki-isku, kun Henki täynnä): cut-in, John syöksyy ja lyö kaikki 4 yksikön sisällä (3 vahinkoa, kaato) |
| Toverikortit | **Lefty / Tommy / Rossi**: toveri taklaa etummaisen sotilaan (2 vahinkoa) ja horjuttaa muita. Kun toveri kaatuu, kortti muuttuu "In memory" pysyvästi. |

**Sotilaat** (Hōgenin joukot, LOOK_ARMY-placeholderit, punainen panta): enintään 3 kerrallaan edessä, loput jonossa taustalla.
| Tyyppi | HP | Käytös |
|---|---|---|
| soldier | 2 | lähestyy, varoitus 0,7 s (punainen sävy + "!"), syöksypurenta |
| brute | 4 | hidas, pitkä varoitus 1,0 s, raskas isku (2 sydäntä), kaatuu vasta Ōu Fangista tai kahdesta vastaiskusta |
| runner | 1 | yrittää ohittaa Johnin rajalle (Hiron ja Reikan perään): napauta kun se on lähellä. Jos pääsee ohi, edistys hidastuu (Hiro ja Reika joutuvat väistämään) ja John menettää 1 sydämen |

**Aallot** (osio 5): 10 + 12 + 13 + 15 = **50** sotilasta (laskuri "HŌGEN'S MEN 50" kunnianosoituksena, [EPÄVARMA] animelle).
Aalto 4: Matsu huutaa käskyjä taustalta (ei taistele: hän pysäyttää myöhemmin Hōgenin). Aaltojen välissä minikohtaus:
Lefty kaatuu (aalto 1 jälkeen), Tommy (2), Rossi (3). Edistyspalkki "Hiro & Reika" täyttyy kaatuneista sotilaista: kun
kaikki 50 on lyöty, Hiro ja Reika ovat turvassa ja seuraa Hōgen-kohtaus. Häviö (sydämet 0): "John is down… Hiro and Reika
aren't safe yet" → yritä aaltoa uudelleen (tarkistuspiste aallon alussa). Osio 1: 6 sotilasta, edistys = Akamen pako.

Tunnelma etenee aaltojen mukana [PÄÄTÖS]: aalto 1 sininen sarastus (winter `night`), 2–3 `grief`-sävy (kylmä, harmaa),
4 `dawn` (aurinko nousee). Musiikki `battle`, ambienssi `gorge` (vuoren tuuli).

## 3. Hahmot

| Rooli | Malli / look | Huom. |
|---|---|---|
| John | `john_auto` (käyttäjän malli, tummempi sävy) | pelattava |
| Hōgen | `hogen_rigged` | |
| Akame | `akame_auto` (käyttäjän malli) | |
| Gin | `gin_auto` | |
| Weed, GB, Jerome | olemassa olevat | GB "esittää Akamea" |
| Hook | prologin placeholder `hook` | |
| Reika | PLACEHOLDER `gin_auto` + look `spitz_red_cream` | käyttäjän malli myöhemmin |
| Hiro | PLACEHOLDER `generic_auto` + look `mutt_cream`, korkeus 1,45 | käyttäjän malli myöhemmin |
| Lefty / Tommy / Rossi | PLACEHOLDER `tesshin_auto`/`spitz_black_tan`, `striped_b_rigged`/`kai_red_brindle`, `akame_auto`/`wolf_dark` | |
| Matsu | PLACEHOLDER `tobei_rigged`/`mastiff_dark_brindle` + punainen panta | |
| Missile | PLACEHOLDER `rocket_rigged`/`lurcher_red` | |
| Sotilaat | `army_soldier_a…h` (LOOK_ARMY) | 8 instanssia kierrätetään |

Placeholderit: `characters.js` → `LEVEL3_MODELS`, yksi rivi per hahmo (vaihto käyttäjän malliin = yksi rivi).
Uusia ulkonäköjä ei luoda.

## 4. Kohtaukset (storyboard, kuvalistat)

Merkinnät: **W** laaja, **M** puolikuva, **CU** lähikuva, **ECU** erittäin lähellä (silmä/hampaat), **LOW** matala kulma,
**HIGH** ylhäältä, **OTS** olan yli, **DUTCH** kallistus, **FLASH** 0,1–0,2 s välähdysleikkaus. Jokainen leikkaus vaihtaa
kuvakokoa tai kulmaa; pitkät repliikit hitaalla push-inillä (drift).

### 0 `trap` (yö, lumimyrsky, winter `night` → `storm`)
1. W HIGH: lumimyrsky vuorten yllä, otsikko "LEVEL 3 – The Alps Trap" (kertoja: muutama viikko myöhemmin, talvi).
2. M LOW: kolme koiraa (Gin, John, Akame) kahlaa lunta kohti valoa, Reika edellä.
3. OTS (Ginin olan yli): mökin ikkunan lämmin valo. Reika: "levätkää täällä".
4. CU Akame: korvat nousevat, ääni. Leikkaus ulos.
5. W: lumipyryssä punaiset pannat ja silmät kaaressa mökin edessä (8 sotilasta). Braam.
6. LOW tracking: Hōgen astelee rivin läpi, kamera kulkee maanrajassa.
7. ECU Hōgenin silmä (punainen hehku) → CU John (vihainen) "kerro oma nimesi" → M Hōgen "Hōgen".
8. DUTCH CU Gin: päätös. Gin → Akame: "Juokse Ōuhun… ja pidä huolta pojastani."
9. CU Akame epäröi (korvat luimussa) → nyökkää. John astuu rinnalle: "Mene, Akame! Avaan tien!" → pelattava.

### 2 `hostage`
1. W: Akame katoaa pyryyn (Akame ulos ruudusta), John huohottaa.
2. FLASH-sarja: sotilaat kaatuvat lumeen (2 kuvaa), Gin ja John selät vastakkain (LOW orbit).
3. Ääni oikealta: M Missile tuo Reikan (kaulapannasta) rinteeltä.
4. CU Reika "älkää välittäkö minusta" → CU Hōgen (LOW) "laskekaa aseenne".
5. CU Gin silmät kiinni: "John… riittää." → ECU John hampaat → "Hitto…"
6. W HIGH: joukko sulkeutuu heidän ympärilleen, valkoinen häivytys (ei näytetä iskuja).

### 3 `captive` (yö)
1. W Gajō yöllä (syksy → tässä talvinen yö), Akame horjuu sisään, Weed ja Jerome juoksevat vastaan.
2. CU Akame: "Isäsi on Hōgenin vankina." → CU Weed päättäväinen: "Minä lähden."
3. Leikkaus: Hōgenin maja Etelä-Alpeilla (lumi, tumma vaja), kertoja.
4. M: Hook hiipii vartijoiden ohi, tuo lunta; ECU John nuolee lunta.
5. W: Hiro ryntää Reikan avuksi, kaataa sotilaan (FLASH: isku) → LOW Hōgen tarttuu Reikan kurkkuun (ei purentaa, vain ote) → CU Hiro jähmettyy, antautuu.
6. Yö, hälinä majalla (kertoja: Hōgen rankaisee borzoiveljeksiä – ei näytetä). CU Gin makaa: "Vie Reika… jalkani eivät kanna."
7. ECU John kyynel: "Sinun jättämisesi on vaikeampaa kuin kuolema." → M Hiro: "Lähden mukaan."
8. W: kuusi siluettia juoksee myrskyyn (Lefty, Tommy, Rossi edellä), kamera jää Giniin (HIGH, yksin).

### 4 `oath` (sarastus, myrsky laantuu, `night` → kirkastuu)
1. M LOW Hōgen ja Matsu: "Ei puroa. Vuoripolku. Perään!" Matsu ulvoo.
2. W: pakolaiset pysähtyvät rinteellä; tuuli tyyntyy (lumihiutaleet hidastuvat).
3. CU John nuuhkii ilmaa: "Tuuli tyyntyy… Hiro, vie Reika länteen. Minä pidätän heidät."
4. CU Hiro (LOW): "Aiot kuolla!" → OTS Johnista Hiroon: "Lupasin Ginille. Ja sinulle lupaan: en kuole."
5. CU Hiro nyökkää: "Minäkin lupaan." → W Hiro ja Reika lähtevät, Reika katsoo taakseen (HIGH).
6. M Lefty, Tommy, Rossi astuvat Johnin rinnalle: "Ōun soturina kuoleminen on toiveemme." → CU John: "Täällä ei luovuteta."
7. LOW: punaiset pannat ilmestyvät harjanteelle → pelattava.

### Minikohtaukset aaltojen välissä (`leftyFall`, `tommyFall`, `rossiFall`)
Kukin ~8 s: FLASH 3 sotilasta kaatuu toverin päälle (siluetti) → CU toverin silmät (`closed`) → repliikki → HIGH toveri lumessa,
sotilaat vetäytyvät hetkeksi → CU John (vihainen) huutaa nimeä → seuraava aalto. Kuolema: hidastus, `heartbeat`, henkivalo hento.

### 6 `hogen` (aamu, `grief` → `storm` Hōgenin saapuessa)
1. W: sotilaat avaavat rivin, Hōgen kävelee hitaasti läpi (LOW tracking), John huohottaa (CU, tremble).
2. M Hōgen kaatuneen Tommyn vieressä, pilkkaa (ei kosketa) → CU John solvaa.
3. CU Hōgen: "Ottakaa aikaa." → FLASH-sarja (3 lyhyttä kuvaa: sotilaiden hyökkäys, lumi pöllyää, Johnin silmä) – osumat kuvan ulkopuolella.
4. ECU John silmät kiinni: "Tämä sielu… jollekin…" → **leikkaus**: W vuoripolku, Weed pysähtyy (CU korvat): "joku kutsuu?"
5. M: Weed kohtaa Hiron ja Reikan; Reika: "Gin jäi?!"; Hiro: "John pidättää heitä… yksin." Weed juoksee (LOW tracking).
6. Takaisin: M Hook saapuu rinteelle → CU John: "Pysy kaukana! Nuorta henkeä ei heitetä hukkaan!" → CU Hook kyynel.
7. CU Hōgen: "Anele. Kerran." → CU John: "Ikinä." 
8. Sakuga: Hōgen ANTICIPATION (kyyristys, LOW) → syöksy (nopeuslinjat, kamera seuraa) → isku puuhun (FLASH valkoinen, hitstop, puu tärähtää, lunta putoaa) → W HIGH puun juuri: John nojaa runkoon, tumma oksan siluetti (ei verta).
9. Hiljaisuus (`Hush`). ECU Johnin silmä aukeaa. LOW: John vetää itsensä irti, nousee (slow-mo), heittää oksan (whoosh) → CU Hōgen väistää, silmät laajenevat (pelko) → reaktiokuvat sotilaista perääntymässä (2 FLASH-kuvaa).
10. HIGH kaukaa: Hōgen syöksyy Johnin kimppuun (siluetti, pöly peittää) → CU Matsu: "Pomo! Hän on jo kuollut." → M Hōgen, hengästynyt: "Unohtakaa tyttö. Palaamme." → W joukot poistuvat, kamera laskeutuu lumeen.

### 7 `farewell` (aamu `memorial` → yö `finale`/tähdet)
1. W: tyhjä rinne, neljä koiraa lumessa, Hook Johnin vieressä. Weed tulee juosten (LOW).
2. CU Weed: "John!" → CU John silmät puoliksi: "Ginin poika…?"
3. M: Hiro, GB, Jerome ym. saapuvat. Hiro kuiskaa GB:lle (OTS). GB astuu esiin.
4. CU GB (Akamena): "Tuhat koiraa Ōusta. Gin on pelastettu." → ECU John hymyntapainen: "Niinkö… sitten voin levätä."
5. CU John: "Weed… Hiro… loput on teidän." Silmät sulkeutuvat (`dead`). Hiljaisuus, sydämenlyönti loppuu, henkivalo nousee (spirit, HIGH).
6. CU Weed huutaa nimeä → W HIGH ryhmä lumessa, musiikki `smith2` (suru).
7. Yö (`finale`, tähtitaivas): neljä hautaa mökin luona. Reika syyttää itseään; Hiro: "Kaiva." Hook: Johnin hammas Ōuhun.
8. LOW: kaikki ulvovat tähtitaivaalle (orbit). CU Weed: vala. Kertoja: legenda vanhasta soturista. Otsikko "John – Ōu's warrior".

## 5. Äänet ja musiikki (olemassa olevat avaimet)
- Musiikki (Smith-teemoja `smith`/`smith2` ei käytetä): `battle` (cover, stand), `sad` (hostage-loppu, oath, Johnin kuolema),
  `dawn` vain lopun valaan ja otsikkoon, `null` = hiljaisuus (trap-alku, Hōgenin isku, kuoleman hetki, ulvonta).
- Ambienssi: `gorge` (myrskyn tuuli), `sad` (tyyni vuori), `night` (hautajaiset).
- Tehosteet: `bite`, `hit`, `hitHeavy`, `dodge`, `perfect`, `hurt`, `die`, `bodyfall`, `roar` (Hōgen), `growl`, `tell`, `braam`,
  `bossAppear`, `heartbeat`, `spirit`, `slowmo`, `freeze`, `whoosh`, `thudDeep`, `yelpPain`, `battleCry`, `howl`, `crow`, `cutin`,
  `card`, `cardReady`, `levelStart`, `victory`, `caption`, `land`, `jump`, `rock` (puu tärähtää), `dust`.

## 6. Repliikit
Id-etuliite `l3_`, kaikki `src/data/lines.js`:ssä (ja/en/emotion/direction/intensity). Japaninkielisessä tekstissä nimet
latinalaisin kirjaimin (TTS lausuu ne englanniksi). Äänet tekee ääniagentti myöhemmin; uudet `VOICES`: john, gin, akame,
hogen, reika, hiro, lefty, tommy, rossi, matsu, missile.

## 7. Toteutus ja testaus
- `src/level3.js` (kulku, Hold the Line, HUD), `src/data/level3_config.js` (näyttelijät, aallot, arvot),
  `src/data/scenes_level3.js` (kohtaukset), pienet kutsukohdat `main.js`, `index.html`, `characters.js`, `lines.js`.
- Talvimaailma: `E.setSeason('winter')` tason alussa, `autumn` takaisin poistuttaessa.
- Testi: `tools/shots-level3.cjs` (Playwright, virtuaalikello, osiot, kuvat `screenshots/level3/`, kontaktiarkit, konsolivirheet, Skip).
