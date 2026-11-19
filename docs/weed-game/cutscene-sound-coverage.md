# Tason 2 cutscenejen ääni-kattavuus (tapahtuma vs ääni)

Avaimet: `weed-game/src/data/sfx_map.js` (EVENTS = tapahtumat, SOUNDS = yksittäiset äänet). Ajat ovat suuntaa-antavia
(kohtausten kesto riippuu repliikeistä). Kontaktijärjestelmä (`src/contact.js`) soittaa automaattisesti:
syöksyn alussa `whoosh` (+ `jump` hypyssä), ennakoinnissa `bite_growl` (purenta) tai `scuff` (tassu), kontaktissa
kohtauksen `sfx`-lista ja vahvoissa iskuissa matala `hit_heavy` (rate 0.75), irrotuksessa `hurt` (heitto) ja laskeutumisessa
`bodyfall` / `land`.

## Smithin uhraus (yö, Gajōn sisällä)
| Tapahtuma | Aika | Ääni |
|---|---|---|
| Kohtauksen alku, Smithin teema | 0 s | music `smith` |
| P4 tulee käytävästä | ~4 s | amb `boss`, `bossAppear`, `roar`, voice `roar_intro` |
| Smithin kolmijalkainen laukka | ~14 s | `gallopIn` × 5 (askelrytmi), askeläänet (footsteps.js) |
| Smithin haukahdus ennen loikkaa | ~16 s | `bark` |
| Ennakointi (kyyristys) | +0 s | `bite_growl` (contact.js) |
| Loikka | +0,3 s | `whoosh`, `jump` |
| Hampaat P4:n olkaan | +0,8 s | `bite`, `hitHeavy`, matala `hit_heavy`; P4:n reaktio `roar` |
| Freeze-frame | | `freeze` |
| Pöly varisee katosta | | `debris` |
| P4 riuhtoo ja peruuttaa | 2,6 s | `roar` × 3, `bossStep` × 3, `debris` (pikkukivet) |
| Hiljaisuus, viimeinen katse | | music pois, `slowmo`, `heartbeat`; Weedin `Bark` |
| "Live…" | | music `smith` takaisin, voice `sac_live` |
| Katto sortuu | | `rumble` (quake + rockslide + debris), `rock` jokaisesta laskeutuvasta kivestä |
| Kivikasa peittää molemmat | | `rock` per kivi, valkoinen välähdys |
| Weed huutaa | | amb `sad`, `heartbeat`, voice `sac_scream` |
| Henkivalo | | `spirit`, `memory` |
| Aamu: P4 nousee raunioista | | `rumble`, `roar`, voice `roar_rise` |

## Neljä nuolta
| Tapahtuma | Ääni |
|---|---|
| Kohtauksen alku | music `sad`, amb `sad` |
| Miehet saapuvat laukassa | askeläänet |
| Jeromen käsky / vastaukset | voice `arrows_order`, `arrows_ack`, `arrows_together` |
| Jokaisen nuolen lähtö | `bark`, `gallopIn` |
| Ennakointi | `bite_growl` |
| Loikka | `whoosh`, `jump`, `speed` (nopeuslinjat) |
| Hampaat vasempaan rintaan | `bite`, `crit`, matala `hit_heavy`; P4 `roar` (reaktio) |
| Hampaat pysyvät haavassa | `bite_growl` |
| P4 riuhtoo irti | `roar` |
| Heitto | `hurt` (contact.js) |
| Isku maahan | `bodyfall`, `whimper` |
| Viimeiset sanat | voice `arrows_fall_<id>` (musiikki väistää puheen alla) |
| Jeromen neljäs nuoli: karjahdus | voice `arrows_fourth`, music `battle` |
| P4 loikkaa sivuun (väistö) | `whoosh`, `bossLand` |
| Jeromen hampaat napsahtavat tyhjään | `bite_snap`, `whoosh` |
| Henget nousevat | `spirit` |

## Lukitus
| Tapahtuma | Ääni |
|---|---|
| Weedin huuto | voice `lock_call` |
| Kolme purentaa (kurkku, kylki, lonkka) | `whoosh`/`jump`, `bite` (+ `hit` Kenillä) |
| P4 ponnistelee lukossa | `roar` |
| Jerome valtimoon | `bite`, `crit`, matala `hit_heavy`, P4 `roar`; voice `lock_artery` |
| P4 puree Kagetoran kaulaa (reach) | `bite`, `hitHeavy`, `hurt`; voice `lock_hurt` |
| Kaikki riuhtaistaan irti | `roar`, `hurt` × 3, `bodyfall`/`land` |

## Finaali (Battōga) ja jälkikohtaus
| Tapahtuma | Ääni |
|---|---|
| Weedin huuto | voice `finale_cry` |
| Battōgan lataus ja pyörre | `battoga`, `speed` |
| Hampaat heikkoon kohtaan | `boom`, `bite` |
| P4 karjuu ja riuhtoo | `roar` |
| Ken ja Kagetora tarttuvat | `bite` × 2, voice `fall_hold` |
| Putoaminen rotkoon | `rock`, amb `gorge`, `splash` |

## Special movet ja taistelu
| Tapahtuma | Ääni |
|---|---|
| Twin Fang: cut-in | `cutin`, voice `sync_call` / `sync_reply` |
| Twin Fang: kaksi purentaa | `whoosh`, `jump`, `bite`, `twinFang` |
| Weedin purenta (napautus) | `lunge`, `whoosh`, `bite` |
| Battōga taistelussa | `battoga`, `bite`, `boom` |
| P4:n rynnäkkö osuu (etujalka) | `hitHeavy`, `roar`, Weed `hurt` |
| P4:n loikka + purenta niskaan | `bossLand`, `bite`, `hitHeavy`, Weed `hurt` |


---
# Ei-taistelu-cutscenet (prologi, tason 2 intro/jälkikohtaus, Story So Far)
Askeleet tulevat automaattisesti liikkeestä (`src/footsteps.js`: pinta `step` = lehdet + multa, `stepRock` = kallio/asfaltti,
`wade` = joki; kohtaus vaihtaa pinnan `{ surface }`-askeleella). Rekan moottori ja äänitorvi ovat synteettisiä
(`src/shared/synth.js`: sahalaine + kohinan rengasääni, etäisyysvaimennus, panorointi, liioiteltu Doppler).

## Prologi: Sakuran kuolema ja nimi (`sakura`)
| Tapahtuma | Aika | Ääni |
|---|---|---|
| Kuutamometsä, tuuli lehdissä | 0 s | amb `night`, ei musiikkia |
| Kolmikko kävelee, pentu haistaa | 0–9 s | askeleet `step` (lehdet) |
| Sakura nostaa päänsä pesässä | 9 s | `breath` |
| Smith tunnistaa Sakuran | 11 s | music `sad` (5 s häivytys) |
| Smith ontuu lähemmäs | 18 s | askeleet (hidas, 3 jalkaa) |
| Pentu painaa nenänsä äitiin | 30 s | `fur`; musiikki duckataan (`Hush`) puheen alle |
| "…Live." – hengitys loppuu | 38–45 s | music pois (3 s), `heartbeat` |
| Pentu tönäisee äitiä | 45 s | `fur` |
| "Mother!" – vapina | 47 s | `whimper` |
| Henkivalo nousee | 51 s | `spirit`, music `smith2` |
| Aamu | 62 s | amb `dawn` (linnut, tuuli), `whimper` |
| GB kävelee viereen | 66 s | askeleet |
| Rikkaruoho-insertti, nimi | 82 s | music `dawn` |
| Lähtö, GB haukahtaa | 100 s | askeleet, `bark` (anim) |

## Prologi: rekka ja Bluen kuolema (`truckHit`, loikka, `truckSave`, `blueDeath`)
| Tapahtuma | Aika | Ääni |
|---|---|---|
| Lauma juoksee aidalle | 0–2 s | laukka-askeleet, `tired` (huohotus), `claw` (jarrutus) |
| Rekka tulee | 4 s | synth-moottori (lähestyy, Doppler), äänitorvi 1,1 s |
| Blue jähmettyy valoon | 6 s | `heartbeat`, slow-mo |
| Isku (valkoinen leikkaus) | 8 s | `cineBoom`, `bodyfall`, moottori loittonee; musiikki pois |
| Hiljaisuus, tyhjä tie | 9–12 s | amb `dusk` (tuuli) |
| Pennun kasvot | 12 s | `heartbeat` |
| Loikka aidan yli | (pelaaja) | `jump`, `whoosh`, `land`, voice p_weed_blue |
| Pentu vetää Bluea | +1 s | `claw` × 2, `fur`, askeleet asfaltilla (`stepRock`) |
| Toinen rekka | +3 s | synth-moottori, äänitorvi 1,4 s |
| Smith huutaa | +4 s | voice p_smith_no |
| Blue heittää pennun | +6 s | `slowmo`, `whoosh` |
| Rekka ohittaa | +7 s | `cineBoom`, `whoosh`, moottori loittonee |
| Pentu laskeutuu | +7,5 s | `land`, `bodyfall`, pöly |
| Pentu kävelee Bluen luo | +10 s | askeleet asfaltilla, amb `sad`, music `smith2` |
| Bluen viimeinen henkäys | +14 s | `breath`, voice p_blue_last, musiikki pois, `heartbeat` |
| "Why…" | +20 s | `whimper` |
| Henki nousee | +22 s | `spirit`, music `smith2` |

## Taso 2: intro (ei-taistelu)
| Tapahtuma | Aika | Ääni |
|---|---|---|
| Otsikko, vuoristo | 0 s | music `intro`, `levelStart` |
| Lauma kävelee harjanteelle | 5–9 s | askeleet (`step`) |
| Kagetora / Ken haukahtavat | 12 s | `Bark`-anim + voice |
| Smithin hetki | 25 s | music `smith` |
| Jeromen joukko laukkaa paikalle | 28 s | laukka-askeleet, `bark` |
| Yö, railo | 36 s | amb `gorge` (rotkon tuuli), usva |
| Weed hyppää (slow-mo kaaren huipulla) | 40 s | `jump`, `slowmo`, `land` |
| Kolmikko hyppää | 43 s | `jump`, `land` |
| Jeromen joukko ylittää | 45 s | laukka-askeleet, `land` |
| Gajō yläpuolella | 47 s | `crow` |
| Weedin haukahdus | 55 s | `Bark` + voice intro_go |

## Taso 2: jälkikohtaus (putoamisesta eteenpäin)
| Tapahtuma | Aika | Ääni |
|---|---|---|
| P4 kaatuu reunan yli | 0 s | `whoosh`, music pois, amb `gorge` |
| Putoaminen rotkossa (slow-mo) | 1–4 s | `speed` (nopeuslinjat), kertoja fall_wind |
| Weed paiskautuu reunalle | 4 s | `land`, `claw`, pöly |
| Roiske kaukana alhaalla | 7 s | `splash` (+ `underwater`, ducking) |
| Joki: Ken kahlaa | 10 s | amb `river`, askeleet vedessä (`wade`), `tired` |
| Weed pitää Jeromea virrassa | 18 s | `wade` |
| Mel juoksee rantaa | 30 s | askeleet (`step`), `Bark` |
| P4:n henkivalo | 38 s | voice whimper, `spirit` |
| Helikopteri tulee | 45 s | `heli` (looppi 11 s välein, ambienssi duckataan), roottoripöly |
| Jerome haukkuu koneelle | 52 s | `bark`, voice post_stay |
| Kone lähtee | 56 s | `heli` loittonee |
| Haudat iltahämärässä | 60 s | amb `dusk`, music `smith2` |
| Viisi henkeä nousee | 66 s | `spirit` × 5, `memory` |
| Ulvonta | 78 s | `howl` × 2 |
| Toivo | 85 s | music `dawn`, `spirit` |
