# Canon-korjaukset: weed-game vs. anime

*Perusteet ja lähteet: `canon-deep-dive.md`. Merkinnät [VARMA]/[EPÄVARMA] kuten siellä. Tämä tiedosto kertoo vain mitä muuttaa; koodia en ole muuttanut.*

## A. Taso 2 "Gajō – Kaibutsu": ympäristö (tärkein)

| Nyt pelissä | Canon (anime, jaksot 4–6) | Muutos |
|---|---|---|
| Yö, kuu ja tähdet koko tason ajan (`world.js`: moon, moonLight, tähtitaivas, sininen FogExp2) | Kallionylitys ja Smithin kuolema ovat **yöllä** (jakso 4) [KUVA]. **Päätaistelu (jakso 5) käydään kylmänä, selkeänä aamuna tai aamupäivänä**: kullankeltainen ja laventelinsävyinen taivas, violetit pilvet [EPÄVARMA, tarkka kellonaika]. Haudat kaivetaan iltahämärässä (jakso 6). | Vaihe 1 (intro ja Smith): yö käy, mutta ilman lunta. Vaiheet 2–3: aamu, kultainen sivuvalo, aurinko matalalla. Jälkikohtaus: päivä → **iltahämärä**, ei aamunkoittoa. |
| **Lumisade** (`buildSnow`), lumilakit männyissä, lumireunat vuorissa, lumimyrsky-ambienssi | **Myöhäissyksy, ei lunta lainkaan** [VARMA]. Lumi alkaa vasta Alpeilla jaksossa 6, viikkoja myöhemmin. | Poista lumisade ja lumilakit. Tilalle tuulessa lentäviä kuivia lehtiä tai pölyä. Vuoret ilman lunta, korkeintaan hento huurre huipuilla. Ääni: tuuli, rotkon kohina, korpit. |
| Siniharmaa yöpaletti | Syksyn värit [KUVA]: ruskea kuiva heinä, punaiset ja oranssit lehtipuut, tummanvihreät havupuut, siniset kaukovuoret, **kuolleet paljaat kelopuut** Gajōn ympärillä | Paletti: okra, ruoste, harmaa kivi, sinivihreä havumetsä, valkoisenharmaat kelot. Lähellä Gajōta kasvillisuus on kuihtunutta ja kuollutta (jakso 3). |
| Vesiputous taustalla | Jyrkänteen alla **jokirotko, voimakas nouseva tuuli, vesiputous** ja **jokeen juuttunut katkennut, teräväksi teroittunut ajopuu** [VARMA] | Lisää ajopuupiikki jokeen ja tuulivisuaali (lehdet nousevat ylöspäin) putoamiskohtaukseen. |
| (puuttuu) | Laitoksen **helikopteri** kaartaa taistelun yllä ja laskeutuu lopuksi [VARMA] | Lisää helikopterin siluetti ja roottorin ääni vaiheisiin 2–3 ja loppuun. |
| Gajō = kalliotornit | Gajō on luonnon kivilinnake, jonka sisällä on ahtaita ja sokkeloisia käytäviä. Sen edessä on **leveä rotko, jonka yli hypätään** [VARMA] | Lisää rotko ja hyppy introon. Smithin kohtaus Gajōn **sisälle** (tai luolan suulle). |

## B. Taso 2: tapahtumat ja järjestys

1. **Intro:** Jeromen joukko ei saavu "myöhässä" Ōun koirien perään. Joukko ilmestyy ensin kallion laelle, ja siihen kuuluu **viisi koiraa: Jerome, North, Robert, Rocker ja Heuler**. Jerome kertoo P4:n alkuperän, rotko ylitetään yöllä (Weed ensin, Smith Kenin ja Kagetoran avulla), ja sitten Jerome kertoo heikon kohdan. [VARMA] → Lisää **North** ja rotkohyppy. Korjaa repliikki `intro_arrive` ("Forgive our delay").
2. **Heikko kohta:** "ainoa pehmeä, paljas iho on vasemmassa rinnassa, ja valtimo on purtava poikki". Peli puhuu "vasemmasta kyljestä", joten muuta muotoon *left chest* (lähelle olkaa ja rintaa). [VARMA]
3. **Smithin uhraus:**
   - Canon: Weed menee Northin kanssa Gajōn sisään syötiksi, ja North kuolee yllätyshyökkäyksessä. Smith ryntää perään. Hän heittää Weedin sivuun, käskee tätä lähtemään ja kasvamaan vahvaksi, puree hirviötä ja riuhtoo, kunnes **kivikatto sortuu** molempien päälle. Hänet kaivetaan esiin yön aikana kuolleena.
   - Peli: ulkona jyrkänteen alla, päätaistelun keskellä.
   - Muutos: siirrä kohtaus Gajōn sisälle ja yöhön, ennen päätaistelua. Lisää Northin kuolema ja GB:n paljastus Smithin jalasta. [VARMA]
4. **P4 nousee raunioista seuraavana aamuna**, kun koirat surevat Smithiä. Nuoret koirat pakenevat, helikopteri saapuu, ja **P4 puhuu** (ääni Kong Kuwata). Jerome ja P4 keskustelevat, ja takaumassa nähdään laboratorio: kahleet, elektrodit ja Jerome P4:n ainoana ystävänä. [VARMA]
   - Pelissä P4 on "non-verbal". Lisää sille repliikit: miksi koirat palvelevat ihmisiä; ihmiset pettivät ensin.
5. **Rynnäkkö:** GB ryntää ensimmäisenä [EPÄVARMA, FB]. Sitten nuolet: Robert avaa haavan, Rocker syventää ja Heuler työntää kuononsa haavaan, ja jokainen kuolee P4:n vastaiskuun. Peli on tässä oikeassa järjestyksessä. [VARMA]
6. **Jerome, 4. isku:**
   - Peli: Jeromen Battōga osuu heikkoon kohtaan.
   - Canon: P4 **väistää** Jeromen. Weed, Ken ja Kagetora **lukitsevat** P4:n, minkä jälkeen Jerome puree valtimoon (ei saa poikki) ja kaivautuu kohti sydäntä. P4 puree Kagetoraa kaulaan ja repii Jeromen irti. [VARMA]
   - Muutos: Jeromen erikoisliike on pureminen ja kiinni pitäminen, ei Battōga (Battōga kuuluu Ginin suvulle). Lukitseminen on hyvä "Ken ja Kagetora + Weed" -korttimekaniikka.
7. **Finaali:**
   - Peli: Weedin **Zetsu Tenrō Battōga**.
   - Canon: Weed oppii liikkeen vasta jaksossa 15, joten liike on tässä anakronismi. [VARMA]
   - Animen loppuratkaisu:
     1. P4 yrittää heittää Jeromen rotkoon, mutta luiskahtaa ja kiipeää takaisin Jerome suussaan.
     2. Kagetora astuu eteen (Akatoran tarina), ja P4 heittää Jeromen jokeen.
     3. **Kagetora, Ken ja Weed syöksyvät P4:n kimppuun, ja kaikki putoavat jyrkänteeltä.**
     4. Weed käyttää **nousevaa tuulta** irrottaakseen ystävänsä ja ohjaa P4:n **ajopuupiikkiin**. [VARMA]
   - Muutos: viimeinen QTE "syöksy + tuuli" Battōgan tilalle. Pelattavuuden vuoksi tavallisen Battōgan voi säilyttää välihyökkäyksenä (Weed teki sen tiedostamattaan jo jaksossa 1), mutta ei *Zetsu Tenrō* -nimellä eikä finaalina.
8. **Putoamisen jälkeen:**
   - Peli: Weed, Ken ja Kagetora heräävät aamunkoitteessa rannalla, ja Jerome saapuu ontuen.
   - Canon:
     - Ken kantaa liikuntakyvyttömän Kagetoran rantaan.
     - **Weed on pelastanut Jeromen joesta**, ja kaksikko roikkuu kivessä keskellä virtaa vesiputouksen alapuolella (Weed pitää Jeromen jalkaa suussaan).
     - Jerome pyytää päästää hänet kuolemaan, Weed kieltäytyy ("kuoleminen on epäreilua, eloonjäämisellä on tarkoitus"), ja Jerome kyynelehtii.
     - Mel tulee avuksi, ja helikopteri laskeutuu. Jerome haukkuu ihmisille jäävänsä Ōuhun eikä enää palaa heidän työkalukseen.
     - Ruumiit noudetaan. [VARMA]
   - Muutos: poista "Dawn"-teksti, korvaa jokikohtaus ja lisää helikopteri. GB ja Mel ovat paikalla.
9. **Jeromen uskollisuudenvala** ("I will follow you") tapahtuu canonissa vasta **jaksossa 7, yöllä, kun hänen haavansa ovat parantuneet**. Taso 2 voi päättyä helikopterikohtaukseen ja hautoihin. Vala sopii seuraavan tason alkuun. [EPÄVARMA, OK]
10. **Muistohetki:** iltahämärässä on 7 hautaa (FB: Tokimune, Smith, North, Robert, Rocker, Heuler ja todennäköisesti P4) [EPÄVARMA]. Peli näyttää neljä valoa (Smith, Robert, Rocker, Heuler) → lisää **North** ja **Tokimune**.
11. **Kaibutsun kuolinääntely** (`whimper`) on keksitty, mutta sävyltään canonin mukainen, koska P4 on animessa traaginen hahmo. Voi jäädä, mutta merkitse se omaksi tulkinnaksi.
12. `roar_armor` ("nahka kovettuu kuin kivi") on pelimekaniikka. Canonissa nahka on **aina** niin kova, ettei hampaat pure siihen (jakso 3).

## C. Nimet ja kirjoitusasut (`lines.js`, `characters.js`)

| Nyt | Animen virallinen tai lähteiden asu |
|---|---|
| 双子峠 (`intro_1`) | **二子峠** |
| ジェローム | **ジェロム** |
| ロッカー | **ロッカ** (Rocca) |
| ヒューラー | **ホイラー** |
| 玄馬 (Genba) | **玄婆** |
| 鉄心 (Tesshin) | **哲心** |
| 藤兵衛 (Tōbee) | **闘兵衛** (黒木闘兵衛, "Oni no Tōbee") |
| Weed puhuu "boku" | Oikein tasolla 2. "Ore" vasta jaksosta 16 lähtien [VARMA, JW] |

## D. Hahmojen ulkonäkö (`characters.js`)

| Hahmo | Nyt | Canon | Varmuus |
|---|---|---|---|
| **Jerome** | ruskea (tan) ja musta satula (klassinen saksanpaimenkoira) | **musta viitta, korvat ja päälaki, kerma- tai vaaleanharmaat kasvot ja rinta, mustat raitamerkit silmien ympärillä, hyvin vaaleat silmät** | VARMA |
| **Ken** | harmaa | **ruskea (fawn), tummempi kuono, musta naamio silmien yli, typistetyt pystykorvat, vaaleat silmät**; mahdollisesti kaksi arpea kasvoissa | VARMA (arvet EPÄVARMA) |
| **GB** | valkoinen, ruskeat täplät ja korvat | kermanvalkoinen, **mustat** täplät, **pitkät mustat korvat** | KUVA |
| **Smith** | (malli) | valkoinen vartalo, musta pää, pitkät mustat roikkokorvat, **oikea etujalka puuttuu** | VARMA |
| **Kagetora** | valkoinen ja raidallinen (käyttäjän havainto) | **tumma (mustanharmaa) selkä ja päälaki, paksut mustat tiikeriraidat, vaaleammat harmaat posket, kuono ja rinta**, kellertävät silmät; mahdollisesti kaksi arpea kuonon vasemmalla puolella | väri VARMA (KV + animemanga), arvet EPÄVARMA |
| **Weed** | (malli) | teräksensininen, valkoinen kuono, rinta ja vatsa, **kolme vaaleaa pyöreää otsalaikkua**, siniset silmät, kippurahäntä | VARMA |
| **Kaibutsu** | (malli) | leijonamainen harja, pitkä turkki, tiibetinmastiffin näköinen, erittäin iso pää. Väri todennäköisesti ruskea ja musta. | Muoto VARMA, väri EPÄVARMA |
| **Rocker** | musta ja ruskea (black & tan), typistetty häntä | dobermanni, joten melko hyvin oikein | VARMA |
| **Robert** | saksanpaimenkoiran tyyppinen | **amerikkalaisen ajokoiran sekoitus** (luppakorvainen ajokoira) | EPÄVARMA (JW) |
| **Heuler** | saksanpaimenkoiran tyyppinen | JW: gascon-saintongeois (valkomusta ajokoira). OK: dobermannin tyyppinen? | EPÄVARMA |
| **Lector, Thunder** | pystyt typistetyt korvat; musta ja ruskea / punainen | **typistämättömät korvat** (Thunderin pitkähköt), väri tuntematon | VARMA korvista |
| **Hōgen** | (malli) + punaisena hehkuvat silmät | harlekiinitanskandoggi (valkoinen ja mustatäpläinen), typistetyt korvat. Hehkuvat silmät ovat omaa tyylittelyä. | VARMA |
| **Genba** | Hōgenin malli ruskeaksi sävytettynä | tanskandoggi, **luppakorvat**, väri tuntematon | EPÄVARMA |
| **Gin** | vaalea (#dfe5ec) | todennäköisesti Weedin kaltainen sininen akita, jolla on kolme arpea | EPÄVARMA |

## E. Pelisuunnitelman (`game-design.md`) muut tasot

- **Taso 0 (prologi):** "väistöharjoitus: rekat ja lumi" → canonissa on **syksy, ei lunta**. Rekat kuuluvat tasoon 1 (Bluen kuolema verkkoaidan takana). [VARMA]
- **Taso 6 (kuuma lähde):** sisältää "Kamakiri + Hiron kosto". Canonissa Kamakiri esiintyy Kishūssa (jakso 14) **ennen** lähdettä, ja **Hiron kosto tapahtuu vasta jaksossa 22**. Lähteellä on bossina vain Sanchō-villisika (yöllinen kylpy, höyry ja sumu). [VARMA]
- **Taso 7 (lumimyrsky):** Genba ja Tōbee. Genba putoaa lumimyrskyssä (jakso 17), Hōgen tappaa hänet (jakso 18) ja Tōbee kuolee vasta **jaksossa 21** Gajōn luolakäytävien lähellä yöllä (lumimyrsky), ja hänet löydetään jäätyneenä aamuauringossa. Pidä tämä järjestys. [VARMA]
- **Taso 8 (Hōgen):** Lumimyrsky, joka tyyntyy henkien saapuessa (Smith, John). Sitten äkillinen tuulenpuuska ohjaa viimeisen Battōgan, Gin kieltää muita puuttumasta, Weed estää Giniä viimeistelemästä, ja **salama** iskee Hōgeniin Gajōn huipulla. Edellisessä jaksossa (24) salama sytyttää **metsäpalon lumen keskellä**. Loppukuvassa on **kevät ja kirsikankukat**. Jeromen hukkuminen lumitunnelissa (jakso 25) kuuluu ennen loppukaksintaistelua. [VARMA]
- **Dynamiitti-yö Gajōlla** ei esiinny animessa (vain manga, tarkistamatta). Jos seurataan animea, korvaa se metsäpalolla tai poista. [VARMA anime-osalta]

## F. Ei ristiriitaa (säilytä)

- Nuolten järjestys **Robert → Rocker → Heuler**, ja Jerome neljäntenä.
- P4 on ihmisten koe-eläin, ja Jerome tuntee sen laboratoriosta.
- Tokimune ("väärä Gin") kuolee suojellessaan Weediä.
- Smithin jalka meni GB:n pelastamisessa.
- Kaibutsun kuolemaan liittyy putoaminen ja vesi.
