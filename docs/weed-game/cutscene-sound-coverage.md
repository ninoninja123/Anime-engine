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
