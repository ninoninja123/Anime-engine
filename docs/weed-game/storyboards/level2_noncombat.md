# Storyboard – Taso 2, ei-taistelu-cutscenet

Toteutus: `weed-game/src/data/scenes_level2.js` (`intro`, `post` putoamisesta eteenpäin). Taistelukohtaukset (Smithin uhraus,
Neljä nuolta, lukitus, finaali) ovat toisen agentin. Apurit: `src/shared/acting.js`, `src/shared/cine.js`,
`src/shared/gorge.js` (rotko, putous, joki, railo), `src/shared/heli.js` (helikopteri), `src/shared/sets.js` (haudat).
Testaus: `?phase=3&nointro&noprologue&cinefrom=post_fall|post_river|post_jerome|post_heli|post_graves` +
`EVAL="__game.E.skipping=true; setTimeout(() => __game.debug.scene('finale'), 0)"` (`tools/cine-shots.cjs`);
intro: `?level=2&noprologue&cinefrom=intro_gorge|intro_gajo`.
Tyylireferenssi (käyttäjän esimerkkivideo): lähikuvarytmi (silmät, hampaat), matalat kulmat taivasta vasten, nopeat
leikkaukset, hiljaiset reaktiolähikuvat.

## Intro – harjanne, lauma, Jeromen joukko, railo yöllä, Gajō
| # | Kuva / kamera | Toiminta | Tunne | Ääni | Musiikki | Repliikki |
|---|---|---|---|---|---|---|
| 1 | EW vuoristo → crane | otsikko LEVEL 2 | odotus | `levelStart` | `intro` (käyttäjän kappale) | intro_1 |
| 2 | LA tracking | lauma kävelee harjanteelle | – | askeleet | intro | – |
| 3 | two-shot | Ken haistaa linnoitusta (katse Gajōhon), Kagetora kiusaa (katse Keniin), Ken kääntyy | kiusoittelu | `bark` | intro | intro_smell/tease/shut |
| 4 | push-in CU Weed | leuka ylös, katse linnoitukseen, ilme determined | päätös | – | – | intro_vow |
| 5 | CU Smith | katsoo Weediä, nyökkää | ylpeys | – | `smith` | intro_proud |
| 6 | W | Jeromen joukko laukkaa paikalle | – | laukka, `bark` | smith | intro_arrive (katseet Jerome↔Weed), intro_follow |
| 7 | LA reunalta railon yli (kuu) | yö laskeutuu, Weed katsoo railoon | vaara | amb `gorge`, usva | – | caption "The gorge before Gajō" |
| 8 | seuraa hyppyä, slow 0.18 kaaren huipulla | Weed hyppää ensimmäisenä | rohkeus | `jump`, `slowmo`, `land` | – | – |
| 9 | W sivulta | Smith, Ken, Kagetora hyppäävät yhdessä | yhteys | `jump`, `land` | – | – |
| 10 | W | Jeromen joukko ylittää rivissä | kuri | askeleet, `land` | – | – |
| 11 | LA push (taivas, kallio) | kaikki katsovat ylös Gajōhon | pelko/kunnioitus | `crow` | – | caption "Gajō" |
| 12 | MCU Jerome → CU Weed | heikko kohta; Weed haukahtaa | – | `bark` | – | intro_weak, intro_go |

## Jälkikohtaus (post)
| # | Kuva / kamera | Toiminta | Tunne | Ääni | Musiikki | Repliikki |
|---|---|---|---|---|---|---|
| 1 | LA reunalla taivasta vasten | P4 kaatuu reunan yli, kolme koiraa kiinni | – | `whoosh`, amb `gorge` | pois | fall_with |
| 2 | rotkon sisällä, kamera putoaa mukana, slow 0.45, nopeuslinjat; mood `finale` (lehdet lentävät YLÖS) | P4, Ken, Kagetora putoavat putouksen ohi; nouseva tuuli repii Weedin irti ja nostaa ylös | huimaus | speed whoosh | – | fall_wind (kertoja) |
| 3 | MS reunalla | Weed paiskautuu reunalle, raapii kiinni, katsoo alas | kauhu | `land`, `claw`, pöly | – | – |
| 4 | POV alas | hahmot pienenevät usvaan; roiske kaukana alhaalla; valkoinen häivytys | menetys | `splash` (+ `underwater`) | – | fall_mist |
| 5 | W joki, usva | Ken kahlaa rantaan Kagetora selässä | sinnikkyys | `wade` (askeleet vedessä), amb `river`, `tired` | – | post_alive_ken/kage |
| 6 | MS virrassa → CU | Weed pitää Jeromea niskasta kivellä; vihainen ilme | – | `wade` | – | post_guilt, post_carry, post_follow (Jerome sulkee silmät) |
| 7 | W | Mel juoksee rantaa pitkin, GB perässä | apu | askeleet, haukku | – | help |
| 8 | MS → CU Weed | P4 makaa matalikossa, vaikerrus, henkivalo | sääli | `spirit` | – | whimper, post_human |
| 9 | LA kohti taivasta | helikopteri tulee vuorten yli, valokeila heiluu; roottoripöly, koirat värisevät, katseet ylös | uhka | `heli` (looppi 11 s), pöly | – | – |
| 10 | LA CU Jerome | Jerome astuu lauman eteen, haukkuu koneelle | vapaus | `bark` | – | post_stay |
| 11 | W | kone kääntyy, valo sammuu, nousee pois harjanteen yli | helpotus | `heli` loittonee | – | – |
| 12 | musta → hautojen takaa (W) | iltahämärä, viisi hautaa, lauma rivissä päät alhaalla | suru | amb `dusk` | `smith2` | – |
| 13 | W edestä, crane ylös | valopilari ja kaatuneen läpikuultava hehkuva siluetti nousee jokaisesta haudasta vuorollaan | muisto | `spirit` × 5, `memory` | smith2 | memorial + caption IN MEMORY |
| 14 | MCU Weed → W | Weed ulvoo, muut liittyvät | kunnianosoitus | `howl` × 2 | smith2 | – |
| 15 | CU Weed → EW crane | viimeinen valo, isän ajatus, Smithin kaiku | toivo | `spirit` | `dawn` | post_father, spirit_echo, caption "To be continued" |

## Jäi kesken
- Gajōn sisäpuoli yöllä (North kaatuu, P4 ilmestyy pimeästä) ja "The next morning" ovat `smith`-funktion sisällä, joka on
  taistelukohtauksia tekevän agentin tiedostoalueella → ei muutettu tässä kierroksessa (konfliktiriski).
