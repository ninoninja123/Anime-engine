# Impact-pyynnöt (P -> E / S2): uudet tyylit, BURSTit ja fallbackit

Lähde: `shots.json` (`impact.style`, `pattern`, `frames`, `t`, `burst`, `tags`). Kaikki impact-ruudut ovat **hand2d**. Yhteenveto: **73 sarjaa, joista 13 BURSTia**
(7 näkyvää: C01, C11, D01, D05, D10, D14, D23; 6 maskattua: T05, T14, T18, T25, J04, J17) ja 60 tavallista sarjaa. Ajat: storyboard.md / shots.json.

## BURST = tiheä purske (käyttäjän vaatimus)

**Määritelmä:** isoimmissa iskuissa **vähintään 5 eri impact-tyyliä ≤ 1 s sisällä** (tässä 12 ruutua = 0,5 s; finaalin J17 48 ruutua = 2,0 s), **tyyli vaihtuu joka 1-2 ruudun välein**.
Tunniste: `impact.burst = true` ja `impact.tags = ["BURST"]`. Kuviokoodi (`pattern`) kertoo järjestyksen ja ruutumäärät, esim. `W1-N2-H2-S2-F2-G1-K2` = 1 valkoinen, 2 negatiivia,
2 halftone-rasteria, 2 speed lines, 2 kasvo-invert-closeupia, 1 kultainen väläys, 2 manga-mustetta (= 12 ruutua).

| koodi | tyyli (engine impact.js) | parametrit / huom. |
|---|---|---|
| W | `flash` (valkoinen) tai `whiteout` | 1 ruutu |
| N | `invert` (negatiivi + keskittävät viivat) | `hue` punainen Itachille / kulta Juliukselle |
| H | `hatch` (mustavalkoinen halftone-manga) | `splat` |
| S | `speedburst` / `radial` (speed lines) | D05:ssä viivat TAAKSEPÄIN (rewind) |
| F | `closeup` `mode:'invert'` (kasvo-invert) | `fig` = iskun saaja tai tekijä, `part:'eyes'` |
| K | `sumi` / `ink` (manga-muste) | |
| C | `chroma` (värivälähdys / glitch) | |
| R / RB | `redblack` | punainen #d81a28 |
| G | `overexpose` `col:'#ffd36a'` tai `blackaccent accent:'#ffd36a'` (kulta) | |
| BLK | `black` / `blackaccent` | |
| D | `desat` | |
| L | `ink` lineart | |

Toteutus: `f.impact([{s:'flash',n:1},{s:'invert',n:2,p:{...}},{s:'hatch',n:2},...], {t0})` suoraan kuviokoodista (helper `burstSeq(pattern, opts)` kannattaa tehdä common.js:ään).
Kamera: `f.shake([[t0, 30, .6]])` koko purskeen ajan + hitStop 2 ruutua ensimmäiseen ruutuun. Ääni on valmiina: events.jsonissa yksi transientti per tyylivaihto (`BURSTSND`).
**Fallback:** jos jokin tyyli puuttuu/rikkoutuu, korvaa se lähimmällä (H -> `duotone`, F -> `panels modes:['zoom']`, K -> `ink`), mutta pidä ≥ 5 eri tyyliä ja vaihto ≤ 2 ruudun välein.

### Näkyvät BURSTit

| shot | t | style (nimi) | pattern | sisältö |
|---|---|---|---|---|
| C01 | 16.99 | FIRST_CLASH | W1-N2-H2-S2-F2-G1-K2 | Itachin potku vs Juliuksen kellokilpi; F = Itachin silmät invert |
| C11 | 33.39 | GENJUTSU_BURST | R1-N2-H2-F2-K2-W1-R2 | Sharingan pyörii; F = Sharingan-silmä closeup invert |
| D01 | 56.62 | AMATERASU_BURST | BLK1-N2-R2-H2-F2-K2-W1 | mustat liekit leimahtavat; F = Juliuksen kasvot invert |
| D05 | 62.37 | REWIND_BURST | G1-N2-W1-H2-S2-C2-G2 | Chrono Anastasis; S = speed lines taaksepäin, C = chroma |
| D10 | 70.00 | SUSANOO_BURST | R1-N2-H2-S2-F2-K2-W1 | kylkiluut pysäyttävät nyrkin; F = Itachin silmät |
| D14 | 76.80 | MANAZONE_BURST | G1-N2-W1-H2-S2-C2-G2 | kellotaulu leviää; viimeinen G = kultainen kellotaulu lineartina |
| D23 | 90.78 | CLASH_BURST | W1-N2-R2-G2-H2-S2-F1 | Susanoo vs Mana Zone; R | G jaettuna ruutuna (`dualsplit`) |

Maskatut BURSTit (T05, T14, T18, T25, J04, J17): sisältö ja kuviot `spoilers.md`.

## Uudet yksittäiset tyylit (tavalliset sarjat)

| nimi (shots.json) | sisältö | engine-toteutus | fallback |
|---|---|---|---|
| `LIGHTNING_NEG` | salama: valkoinen ruutu -> sininegatiivi, sadeviivat valkoisina | `flash` + `invert hue:210, lines` | `WHITE_NEG` |
| `RULE_STAMP` | musta ruutu, kaatuneen hahmon valkoinen ääriviiva iskeytyy, sammuva soihtu | `blackaccent accent:'#fff'` + oma ääriviiva-fx | `VOID_LINEART` |
| `CROW_SWIRL` | varisparvi mustina siluetteina punaista vastaan, pyörre tiivistyy hahmoksi | `redblack` + varissiluetit (`fxCrows` uusi) | `RED_BLACK_SPLIT` |
| `EYE_RED` | Sharingan täyttää ruudun, 3 tomoeta, 1 ruutu negatiivina | `closeup part:'eyes'` + punainen tint | `EYE_ORANGE` uudelleenväritetty punaiseksi |
| `POWER_CARD_I` / `POWER_CARD_J` | kortti-iskut (punainen / kulta negatiivi + vesileima; J lopussa VS) | `powercard who:'I'/'J', vs` (impact_nl `powercard` uudelleenväritys) | `WHITE_NEG` |
| `TIME_FREEZE` | kultainen kellotaulu-rengas, maailma harmaa negatiivi, pisarat valkoisina pisteinä | `desat` + `rings col:'#ffd36a'` | `GOLD_BURN` |
| `CROW_BURST` | valkoinen ruutu, sadat mustat varis-siluetit, punainen ydin | `whiteout` + `fxCrows burst` | `SPEEDLINE_BURST` |
| `GOLD_SPEED` | kultaiset jälkikuvat + speed lines | `speedburst` kulta | `SPEEDLINE_BURST` |
| `FIRE_BLOOM` | tulipallo täyttää ruudun oranssina, musta lineart-liekki | `overexpose col:'#ff8a2a'` + `ink` | `GOLD_BURN` |
| `EMBER_AGE` | oranssi -> harmaa tuhka, viisari pyörähtää | `desat` 2 ruutua | `VOID_LINEART` |
| `SHADOW_SHURIKEN` | kaksi päällekkäistä shurikenia siluettina, punainen viiltoviiva | `crimsonline` + siluetti | `CRIMSON_WHITE` |
| `MANGEKYO_EYE` | kolmisakarainen Mangekyō täyttää ruudun, verikyynel | `closeup part:'eyes'` + kuvio | `EYE_RED` |
| `DESAT_FLAME` | harmaa jäädytetty kuva, mustat liekit ainoana värinä | `desat accent:'#6a2a9a'` | `MANGA_HALFTONE` |
| `GIANT_SIL` | Susanoo siluettina punaista salamataivasta vasten | `rimsil col:'#c8202a'` | `SILHOUETTE_ORANGE` (punainen) |
| `MANA_SONAR` | musta ruutu, kultaiset luotainrenkaat, varikset valkoisena lineartina | `rings col:'#ffd36a'` + `ink` | `SHOCKWAVE_RING` |
| `GOLD_EYES` | kultainen silmä, iiriksessä kellotaulu | `closeup part:'eyes'` + kulta | `GOLD_BURN` |
| uudelleenväritys | `DUAL_TONE` / `WORLD_BREAKER` / `RED_BLACK_SPLIT`: vasen punamusta, oikea kulta-sininen | olemassa | – |

Olemassa olevat (sellaisenaan): `FAN_SNAP GONG_WAVE SPEEDLINE_BURST MANGA_PANELS MANGA_HALFTONE MANGA_RED IMPACT_CRATER SHOCKWAVE_RING SUMI_INK GLASS_SHATTER GOLD_BURN`.

## Määrät ja tiheys

- 73 sarjaa / 178 s: keskiväli 2,42 s, pisin väli 8,1 s (tarkoituksellinen jälkikaiku finaalin jälkeen, spoilers.md). Näkyvä osa: 41 sarjaa 0-92,6 s.
- Molemmilla signature-sarjoja: Itachi 18, Julius 21 (näkyvät) + maskatut 32.
- Mikään tyyli ei toistu kahdessa peräkkäisessä sarjassa (paitsi `TIME_FREEZE` B01/C02, jotka ovat tarkoituksella sama "aika pysähtyy" -merkki).
