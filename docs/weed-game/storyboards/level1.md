# Storyboard – Prologi (taso 1) "Weed and GB"

Toteutus: `weed-game/src/data/scenes_level1.js` (data), apurit `src/shared/acting.js` (elekieli: pää, korvat, häntä, hengitys,
vapina, nyökkäys, katse, lepoasento `lie`), `src/shared/cine.js` (kameran jatkuva drift, `Grade` = valo/väri tunnelman päälle,
`Mood`, `Hush` = hiljaisuus, `glare` = ajovalojen häikäisy, testimerkit `Mark`), `src/shared/sets.js` (juurien alla oleva pesä,
kuu-/aurinkosäde, lehtikarike), `src/shared/synth.js` (rekan moottori + Doppler, äänitorvi).
Testaus: `?level=1&section=N&cinefrom=<mark>` → `node tools/cine-shots.cjs <nimi> "level=1&section=N" <mark>`.

Kuvakoot: EW = establishing wide, W = wide, MS = medium, MCU = medium close-up, CU = close-up, ECU = extreme close-up,
OTS = over the shoulder, INS = insert, POV, HA/LA = high/low angle. Kamera liikkuu aina (drift + dolly/crane/orbit).

## 4. Sakuran kuolema ja nimi (pelin tunnepohja) – `sakura`, n. 2,5 min

| # | Aika | Kuva / kamera | Toiminta | Tunne | Ääni | Musiikki | Repliikki |
|---|---|---|---|---|---|---|---|
| 1 | 0–6 s | EW, HA → crane alas 6 s | kuutamometsä, vanha puu, juurien alla pesä; kolmikko kävelee kuvaan | hiljainen, aavistus | amb `night` (tuuli, lehdet), askeleet lehdillä | – (hiljaisuus) | caption "That night" |
| 2 | 6–9 s | LA tracking pennun korkeudella | Weed haistaa (pää alas), korvat pystyssä, kävelee pesää kohti | uteliaisuus → huoli | askeleet (`step`) | – | – |
| 3 | 9–11 s | INS pesän sisään (MCU) | Sakura makaa lepoasennossa, kohottaa päätä, katsoo pentua | heikkous, tunnistus | `breath` | – | – |
| 4 | 11–14 s | CU Smith (dolly sisään) | Smith tunnistaa | järkytys | – | `sad` alkaa 5 s häivytyksellä | p_smith_sakura |
| 5 | 14–18 s | OTS Smithin olan yli | Sakura vastaa, katse Smithiin | lämpö, väsymys | – | sad | p_sakura_smith |
| 6 | 18–24 s | MS seuraa, sitten CU Sakura | Smith ontuu 3 jalalla lähemmäs, pää alas, korvat luimussa, häntä alhaalla | syyllisyys | askeleet | sad | p_smith_sorry, p_sakura_hush |
| 7 | 24–30 s | LA two-shot (äiti, pentu, Smith) → CU Smith | Sakura katsoo poikaansa; Smith nyökkää lupauksen | luottamus, lupaus | – | sad | p_sakura_entrust, p_smith_promise |
| 8 | 30–38 s | macro-profiili nenä nenää vasten | pentu hiipii juurten alle, painaa nenän äitiin | läheisyys | `fur` | sad hiljenee (`Hush`) | p_sakura_pup |
| 9 | 38–45 s | ECU Sakuran kasvot → tilt alas | "…Live." – pää vajoaa hitaasti, hengitys loppuu, valo himmenee (Grade 0.7, sat 0.6) | kuolema, hiljaisuus | `heartbeat` (1) | musiikki pois 3 s | p_sakura_last |
| 10 | 45–49 s | CU Weed pennun tasolla | tönäisee äitiä nenällä, ei vastausta → pää alas, korvat taakse, vapina | ymmärtäminen | `fur`, `whimper` | – | p_weed_mama |
| 11 | 49–51 s | MS reaktiot | GB kääntää päänsä pois (ilme sad), Smith laskee päänsä | suru | – | – | – |
| 12 | 51–60 s | HA → crane ylös henkivalon mukana | Sakuran henkisiluetti ja valopilari nousevat kuusäteen läpi | menetys, kauneus | `spirit` | `smith2` | – |
| 13 | 60–62 s | musta häivytys | – | tauko | – | – | – |
| 14 | 62–68 s | W → push in, aamun kultainen valo, aurinkosäde | pentu nukkuu kippurassa äidin kyljessä | hiljainen suru | amb `dawn` (linnut), `whimper` | – | caption "Morning" |
| 15 | 68–80 s | MS two-shot | GB tulee viereen, katse pentuun | lohdutus | askeleet | – | p_gb_comfort, p_gb_noname |
| 16 | 80–82 s | MCU Weed | pentu nostaa päänsä, pudistaa päätä (ei nimeä) | orpous | – | – | – |
| 17 | 82–88 s | INS rikkaruoho kiven raossa (etualalla), taustalla GB, pentu ja äiti | – | toivo | – | `dawn` alkaa | p_gb_weed |
| 18 | 88–92 s | CU GB (happy) | GB antaa nimen | lämpö | – | dawn | p_gb_name |
| 19 | 92–97 s | CU Weed, LA | pentu nousee seisomaan (lepoasennosta), leuka ylös, korvat pystyyn | päättäväisyys | – | dawn | p_weed_name + caption WEED |
| 20 | 97–110 s | W → tracking | Smith: lähdetään; pentu pysähtyy metsän reunalla ja katsoo vielä äitiä (OTS), kääntyy ja juoksee | jäähyväiset | askeleet, `bark` (GB) | dawn | p_smith_go, p_gb_coming, p_sasuke_bye |

## 7. Blue ja rekka – `truckHit` → (pelaajan loikka) → `truckSave` → `blueDeath`

| # | Kuva / kamera | Toiminta | Tunne | Ääni | Musiikki | Repliikki |
|---|---|---|---|---|---|---|
| 1 | LA verkkoaidan takaa, dolly | lauma pysähtyy aidalle, Blue ontuu tiellä | jännite | laukka-askeleet, `tired` (huohotus), `claw` | (taistelun jälkeen hiljaa) | – |
| 2 | MS tieltä | Blue pysähtyy ja katsoo heitä ivallisesti (leuka ylhäällä) | ylpeys | – | – | – |
| 3 | MS Blue, takana rekan ohjaamo | ajovalot: lämmin häikäisy vasemmalta (`glare`), Blue valaistuu (emissiivinen ramppi) | uhka | rekan moottori (synth, Doppler), äänitorvi | – | – |
| 4 | CU Blue | Blue kääntyy valoon, korvat luimuun, jähmettyy; slow 0.35 | kauhu | `heartbeat` | – | – |
| 5 | CU Weed aidan takana | pentu näkee sen tulevan | – | – | – | – |
| 6 | W, valkoinen leikkaus | isku: rekka ohittaa, valkoinen välähdys (ei verta), Blue tienvarressa | shokki | `cineBoom`, `bodyfall`, moottori loittonee (Doppler) | musiikki pois | – |
| 7 | HA tyhjä tie, hidas push | hiljaisuus | tyhjyys | tuuli | – | – |
| 8 | CU Weed | vapina | päätös | `heartbeat` | – | (loikassa "Blue!") |
| 9 | (pelaaja) pyyhkäisy ↑ | Weed loikkaa aidan yli | rohkeus | `jump`, `land` | – | p_weed_blue |
| 10 | MS tiellä | Weed puree niskasta ja vetää, iso koira ei liiku | epätoivo | `claw`, `fur`, askeleet asfaltilla (`stepRock`) | – | – |
| 11 | MS, takana ajovalot | toinen rekka, äänitorvi, häikäisy kasvaa | paniikki | moottori, torvi | – | – |
| 12 | MCU Smith aidan takana | huutaa | – | – | – | p_smith_no |
| 13 | CU Blue, slow 0.25 | Blue avaa silmät, viimeiset voimat | uhrautuminen | `slowmo` | – | p_blue_go |
| 14 | tieltä, rekka etualalla | Blue heittää pennun pois tieltä, kamera seuraa pentua kaaressa | – | `whoosh` | – | – |
| 15 | valkoinen | rekka ohittaa | – | `cineBoom`, `whoosh`, Doppler | – | – |
| 16 | LA tieltä | pentu laskeutuu ja kierähtää aidan viereen | – | `land`, `bodyfall`, pöly | – | – |
| 17 | HA W auringonlaskussa → dolly | tyhjä tie, pentu nousee ja kävelee hitaasti Bluen luo | pelko | askeleet asfaltilla | `smith2` | – |
| 18 | LA CU Bluen kasvot, pentu taustalla | Blue avaa silmänsä, puhuu, pää vajoaa, hengitys loppuu | sovitus | `breath`, `heartbeat` | musiikki pois 2 s | p_blue_last |
| 19 | CU Weed | "miksi" – korvat taakse, vapina | suru | `whimper` | – | p_weed_why |
| 20 | MS → tilt ylös taivaalle | Bluen henki nousee iltataivaalle | – | `spirit` | `smith2` | – |
| 21 | HA reaktiot → MCU Smith → MCU Hook | muut tulevat, päät alhaalla; Hook käy makaamaan Bluen viereen | kunnioitus | – | smith2 | p_smith_blue, p_hook_stay |
| 22 | W siluetit auringonlaskussa | – | – | – | – | – |

## Muut prologin kohtaukset (kevyempi päivitys)
- Kaikki prologin kohtaukset: kameran drift jokaisessa pysäytyksessä (ei jäätyneitä kuvia), elekielen nollaus ja valon palautus
  kohtauksen lopussa (`level1.js scene()`).
- Avaus, Tosa, kaupunkijuoksu, Hook, Blue-taistelun introt: ennallaan + drift (ks. "Jäi kesken" alla).

## Jäi kesken (seuraava kierros)
- Avaus (GB ja pentu riitelevät palasta): oikea köydenveto-elekieli (acting `look`, `head`), Neron uhkaava LA-kuva.
- Tosa: lisää ennakointi + iskun kontakti contact.js:llä (kun se on valmis tasolla 1).
- Loppu: pitkä kävely kohti Ōuta – lisää paluukatse Bluen tielle ja siirtymä tasolle 2.
