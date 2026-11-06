# Cast, lavasteet ja efektit: Itachi Uchiha vs Julius Novachrono

Iskut: `powers.md`. Lähteet: `research.md`. Fontit ja kortit: `text_style.md`. Uudet impact-tyylit ja BURSTit: `impact_requests.md`. Katsomo: `crowd.md`.
Shot-listan koodit: **ITA = Itachi** (uusi hahmo, E tekee), **JUL = Julius** (uusi hahmo, E tekee), **SUS = Itachin Susanoo** (uusi efekti/jättiläinen), **CRW = varikset** (uusi efekti),
**URA = Urahara** (`CAST.urahara`, valmis), **DAZ = Dazai** (`CAST.dazai`, valmis: istuva pose `dazai_sit`), **KYO = Kyoraku Shunsui** (`CAST.kyoraku`, valmis),
**CROWD** = areenan siluetit (harry-vs-gojon `valhalla`-lavaste + `fxCrowdFG`). Maskattujen shottien roolit: vain `spoilers.md`.
**720p-sääntö:** jokaisen tunnusmerkin pitää näkyä, kun pää on ~40 px korkea. Viivat 1920-koossa ≥ 3 px.

## Hahmot

| koodi | 3-5 tunnusmerkkiä pienessäkin koossa | päävärit (hex) | silmät / ilmeet | rekvisiitta | efektiväri |
|---|---|---|---|---|---|
| **ITA** | **kyynelurat** (2 tummaa viivaa / poski, nenänvarren suuntaan), **Akatsukin musta viitta punaisin valkoreunaisin pilvin** (korkea kaulus peittää leuan), matala **poninhäntä** + otsatukka kehystää kasvot, **viilletty Lehden otsasuojus** (vaakaviilto symbolin halki) | tukka #101014, iho #e8cfb4, viitta #0f0f14, pilvet #c8202a + reuna #f4f0ea, otsasuojus #9aa6b2, kynnet #5a3a7a | 178 cm, hoikka. Ilmeet: `calm` (oletus, puoliksi suljetut luomet), `sad`, `focused`, `pain` (veri suupielestä), `smile_soft`. Silmät: `sharingan` (punainen #d81a28, 3 tomoeta), `mangekyo` (musta kolmisakarainen kuvio punaisella), `black` (normaali) | kunai, shuriken, sormus 朱 (oikea nimetön) | punainen #d81a28, Amaterasu musta #0a0008 + violetti hehku #6a2a9a, Susanoo #e8553a / ydin #ffb08a |
| **JUL** | **vaalea olkapäille ulottuva aaltoileva tukka**, **leveä iloinen hymy**, **valkoinen-kultainen velhokuninkaan asu + raskas viitta kultareunuksin**, kultainen kellotaulu-taika ympärillä | tukka #f1dfa0 varjo #c9a95a, iho #eec9a6, asu #f4efe4, viitta #3a3f6a sisus #2a2e52, kultareunus #e8b84a, silmät #8fb4d8 (kultaiset #ffd36a kun "avaa" ne D13) | 190 cm, leveäharteinen. Ilmeet: `smile` (oletus), `delight` ("Marvelous!"), `eyes_closed` (mana-aisti, rauhallinen hymy), `serious`, `pain`, `sad`. Silmät kiinni -tila pitkään C13-D13 | grimoire (kultareunainen, apila kannessa), ei asetta | kulta #ffd36a, kellotaulun sininen #6aa8ff, pysähtyneen ajan harmaa #9aa0aa |
| **SUS** | Itachin Susanoo: punaoranssi läpikuultava henkisoturi, **Yata-peili** (pyöreä kilpi vasemmassa kädessä), **Totsuka-pullo** oikeassa (miekka = nestemäinen tuli), panssaroitu pitkänenäinen naamio | #e8553a 60 % + ydin #ffb08a, ääriviiva #6a1408 | vaiheet `ribs` -> `skeleton` -> `armored` (D10-D11) | Yata no Kagami, Totsuka no Tsurugi, Yasaka-magatamat (pilkun muotoiset ammukset) | punaoranssi |
| **CRW** | variksia: mustat siluetit, punainen silmä (Sharingan-välähdys genjutsussa) | #0a0a0c, silmä #d81a28 | parvi `swirl` (A04), `burst` (C04), `bind` (C12), `fly` | – | – |
| **URA** | raidallinen bucket-hattu, viuhka, mikrofoni | valmis | `urahara_announce`, `urahara_announceFan`, `urahara_shout`, `urahara_fanFace` + gongi | mikrofoni, viuhka, keppi | – |
| **DAZ** | ruskea trenssi auki, siteet kaulassa ja ranteissa, kihara tumma tukka | valmis (`CAST.dazai`, `base`) | istuu: `dazai_sit` + uudet reaktiot `crowd.md` | – | – |
| **KYO** | vaaleanpunainen kukkahaori, sugegasa-olkihattu, sakekuppi | valmis (`CAST.kyoraku`) | `crowd.md` | sakekuppi + pullo | – |

### Signature-poset (pyyntö E:lle)

- **Itachi:** `ita_ready` (kädet viitan sisällä, rauhallinen), `ita_handseal` (tiikeri), `ita_fireBreath` (Gōkakyū), `ita_throw` (shurikenit), `ita_kickSpin`, `ita_crowsDissolve`
  (keho hajoaa variksiksi: `dissolve` 0..1), `ita_standPillar`, `ita_wipeMouth`.
- **Julius:** `jul_walk` (kädet selän takana, hymy), `jul_tap` (sormi naputtaa ilmaa = Chrono Stasis), `jul_palmOut` (kämmen eteen, kellokilpi), `jul_grimoire` (kirja auki vasemmassa),
  `jul_dash` (jälkikuvat), `jul_punchTime` (nyrkki pysähtynyttä aikaa), `jul_eyesClosed` (rauhallinen seisonta), `jul_laugh`, `jul_lookUp`, `jul_touchCheek`.
- **Maskattujen shottien poset, ilmeet ja muodot:** `spoilers.md` (S2 / koordinaattori välittää ne E:lle tarvittaessa neutraalina listana).
- **Susanoo:** `sus_block` (kylkiluut sulkeutuvat), `sus_raiseSword`, `sus_thrust`, `sus_mirror`, `sus_punch`, `sus_volley` (magatamat).

## Lavasteet (BG-koodit)

| koodi | paikka | tunnelma / värit | tärkeät elementit |
|---|---|---|---|
| `ARENA` | **Valhallan kolosseumi YÖLLÄ** (harry-vs-gojon `valhalla`, uusi puku) | yö, rankkasade, punainen kuu #c83a3a pilvien raossa, märkä hiekka heijastaa soihtuja; salamat | portit: länsi = Itachi (punaiset lyhdyt, varikset reunalla), itä = Julius (kultainen kellotaulu kaiverrettuna); `dmg` 0 -> 3; `rain` true/false (false = pisarat paikallaan ilmassa, kimaltavat); Mana Zone: kultainen kellotaulu lattiassa + rattaat |
| `SKY` | taivas areenan yllä | sadepilvet, salamat, punainen kuu | avauksen syöksy |
| `BOOTH` | Uraharan kuulutuskoroke | lyhty sateessa, katos | harry-vs-gojon BOOTH + sade |
| `STANDS` | Dazain ja Shunsuin paikka | soihtuvalo + kentän välähdykset kasvoilla (punainen Itachin iskuissa, kulta Juliuksen) | kivipenkki, sakepullo, **siluetteja ympärillä joka suunnassa** (crowd.md) |
| `GATE_I` / `GATE_J` | portit | punaiset lyhdyt + varisparvi / kultainen kellotaulu + pysähtynyt sade | `valgate` |
| `CARD` | hahmokortin tausta | text_style.md | `cardbg` |
| `GENJ` | genjutsu-maailma | punainen taivas, musta kuu, negatiivinen maailma | varikset, risti (spoilers: Tsukuyomi samaa kieltä) |

## Yleisö

Siluetit (ei puhetta). Reaktiot `cheer gasp hush roar panic` + **jäätyvät** aika-shoteissa (`freeze`: siluetit harmaantuvat ja pysähtyvät kesken liikkeen; sade niiden yllä pysähtyy).
Katsomon kaksi tuttua: `crowd.md`.

## Visuaalinen kielioppi (katsoja oppii)

- **Punainen/musta = Itachi, kulta/sininen = Julius**: valot, tekstit, impactit, jaetut ruudut (vasen punamusta, oikea kulta-sininen).
- **Varisparvi = klooni**: katsoja oppii C04:ssä, että "voitettu" Itachi voi olla variksia.
- **Pysähtynyt sade = pysähtynyt aika** (B01, C02, D14): kuvassa pisarat leijuvat kimaltavina pisteinä, äänessä sadematto katkeaa.
- **Silmät = vaara**: Julius sulkee silmänsä (C13) ja avaa ne vasta D13:ssa.
