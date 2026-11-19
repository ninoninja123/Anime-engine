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
| Nuolen lähtö (vauhtiviivat täysillä) | voice `arrows_cry_<id>` (taisteluhuuto), `rushWhoosh`, `gallopIn` |
| Ennakointi | `bite_growl` |
| Loikka | `whoosh`, `jump`, `speed` |
| Hampaat vasempaan rintaan, syvenevä | `arrow_bite_1` (Robert, pinta) → `arrow_bite_2` (Rocker, repeämä) → `arrow_bite_3` (Heuler, murskaus + repeämä); P4 `roar` |
| Purennan aikana | voice `arrows_pain_<id>` (Heulerilla pitkä huuto riuhtaisun aikana), `breath` |
| Äärilähikuva: hampaat haavassa, P4:n silmä | `roar` |
| Robert: P4 puree hänen päänsä | `bite`, `hitHeavy`, `hurt`, `yelp`; viskaus `hurt` + `bodyfall` |
| Rocker: P4 nousee takajaloilleen | `roar`; huipulla hitstop; alastulo `thudDeep` + `bossLand`; Rocker heitetään `hurt` + `bodyfall` |
| Heuler: P4 kaatuu selälleen | `roar`, `knockdown` + `thud_deep`, pölyaalto; nousu `bossStep` |
| Kaatunut | `whimper`, voice `arrows_fall_<id>` |
| Jeromen neljäs nuoli: karjahdus | voice `arrows_fourth`, music `battle` |
| P4 loikkaa sivuun (väistö) | `whoosh`, `bossLand` |
| Jeromen hampaat napsahtavat tyhjään | `bite_snap`, `whoosh` |
| Henget nousevat | `spirit` |

## Lukitus
| Tapahtuma | Ääni |
|---|---|
| Weedin huuto | voice `lock_call`, `lock_shout_weed` |
| Kolme purentaa (kurkku, kylki, lonkka) | `whoosh`/`jump`, `bite` (+ `hit` Kenillä) |
| P4 ponnistelee lukossa | `roar` |
| Jerome valtimoon | `arrow_bite_3` (syvä), P4 `roar`; voice `lock_artery` |
| P4 puree Kagetoran kaulaa (reach) | `bite`, `hitHeavy`, `hurt`, voice `lock_pain_kage`; voice `lock_hurt` |
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
