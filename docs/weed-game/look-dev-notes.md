# Look-dev: ulkonäkövariantit rigatuille malleille

## Mitä tehtiin
Koiratehtaan (dog_parts) hahmot siirrettiin käyttäjän omien rigattujen Tripo-mallien päälle. Kukin saa
oman baseColor-tekstuurin ("look"). Geometria, luusto ja animaatioklipit ovat yhteisiä pohjamallin kanssa,
joten uusia malleja ei tullut. Tekstuurit ovat 768 px WebP-kuvia, kooltaan 35–75 kB.

| Hahmopaikka | Pohjamalli | Look | Turkki (rotutyypillinen) |
|---|---|---|---|
| jerome | john_auto | shepherd_tan_saddle | ruskeankeltainen paimenkoira, musta satula ja kuono |
| robert | john_auto | shepherd_dark_saddle | tummanruskea, leveä musta satula |
| heuler | john_auto | shepherd_grey_sable | harmaanruskea soopeli |
| rocker | john_auto (+luuskaalaus) | pinscher_black_tan | musta, ruskeat merkit (dobermann-tyyppi) |
| lector | john_auto (+luuskaalaus) | pinscher_black_rust | musta, ruosteenruskeat merkit |
| thunder | john_auto (+luuskaalaus) | pinscher_red | punaruskea, vaaleat merkit |
| ken | hogen_rigged | dane_blue | sinertävänharmaa tanskandoggi, vaalea rintalaikku |
| ben | hogen_rigged | dane_grey_old | harmaa, harmaantunut kuono |
| genba | hogen_rigged | dane_tan_brute | kellanruskea, tumma kuono, arpi kyljessä |
| gb | smith_rigged | setter_white_spotted | valkoinen, ruskeat täplät ja korvat (setteri) |
| akame | kagetora_true_auto | kishu_red | punainen japanilainen pystykorva, vaalea kuono, arpi |

Värit siirrettiin suoraan characters.js:n aiemmista tehdasspekseistä (`c`/`marks`). Nämä ovat pelin
**omia, rotutyypillisiä turkkeja**. Niitä ei ole tehty minkään kuvamateriaalin pohjalta, eikä niissä
kopioida yksittäisten hahmojen piirrettyjä tunnusmerkkejä. Hahmon voi tunnistaa pelissä rodusta, väristä,
koosta, nimestä ja roolista. Jos hahmolta halutaan tarkempi oma ulkonäkö, paras ratkaisu on käyttäjän
oma Tripo-malli (ks. alla).

## Tekniikka (tools/make-looks.mjs)
1. Työkalu lukee pohjamallin verteksit, skinning-painot ja luiden sidosasennot. Koordinaatisto
   normalisoidaan näin: X eteen (hännän tyvestä päähän), Y ylös, Z kylki.
2. Jokaiselle verteksille lasketaan piirteet:
   - luuryhmien painot: pää, leuka, korvat, kaula, vartalo, häntä, reidet, sääret, tassut sekä etu/taka
   - normaalin suunta (selkä/vatsa)
   - pään paikallinen koordinaatisto (hx 0 = kallo … 1 = kuonon kärki)
   - hännän pituuskoordinaatti
3. Kolmiot rasteroidaan UV-tasoon, joten jokaisella tekselillä on interpoloidut piirteet. Merkit ovat
   näiden piirteiden funktioita: under, saddle, cap, muzzle, mask, cheeks, brows, blaze, ears, socks,
   legs, tailTip, chest, spots, ticking, stripes, patches ja scar. Siksi sama speksi osuu oikeisiin
   kohtiin missä tahansa mallissa, jolla on sama 24 luun rigi.
4. Turkin pienimuotoinen varjostus otetaan alkuperäisen tekstuurin luminanssista bilateraalisella
   suhteella. Pohjan omien kuvioiden (täplät, raidat) reunat vaimennetaan gradientin ja tummuusosuuden
   avulla, ja päälle lisätään hienovarainen proseduraalinen karvavaihtelu.
5. Pohjan silmät, nenä ja suun viivat säilytetään. Ne tunnistetaan pään silmä- ja kuonoalueen
   pienimuotoisista tummista ja yksityiskohtaisista tekseleistä.
6. UV-saumoja täytetään laajentamalla väriä 8 pikselin verran.

Ajo: `node tools/make-looks.mjs [lookId ...]` (`--debug` = piirrekarttatekstuuri). Kaikkien lookien
generointi kestää noin 30 s.

Pelissä (`src/dogs.js`) `loadFor` lataa myös lookit (`loadLook`). `_buildRigged` vaihtaa materiaalin
mapin lookin tekstuuriin ja skaalaa luut kentän `bones` mukaan (head, neck, ears, legs, frontLegs,
backLegs, tail, spine tai luun nimi). Klipeissä ei ole scale-raitoja, joten skaalaus säilyy.
`characters.js` yhdistää `LOOK_CAST`-kentät hahmoon. `?factory=1` palauttaa vanhat tehdasversiot
vertailua varten.
Look-dev-näkymä: `dev/chars.html?ids=jerome,ken&looks=,dane_grey_old` (looks = lookin vaihto id:n mukaan).

## Tunnetut ongelmat
- Doggipohjassa (hogen_rigged) näkyy ohuita tummia viivoja kyljissä. Ne ovat ääriviiva-kuoren
  (BackSide-outline) läpäisyjä koverissa kohdissa, eivät tekstuurivirhe.
- Pinseri-tyypeillä on johnin tuuhea häntä lyhennettynä (tail 0.32–0.38). Typistettyä häntää ei voi tehdä
  ilman uutta mallia.
- GB:n pohja smith_rigged on smithin mallista. Tarkista, että jalkojen määrä on oikea, jos smith-malli
  on kolmijalkainen.
- Silmien värin muuttaminen rigatuissa malleissa vaatisi silmägeometrian (face.js toimii vain tehtaalla).

## Suositus käyttäjän omiksi Tripo-malleiksi
Ken ja Ben (oikea doggisiluetti ja korvat), GB (setteri, neljä jalkaa), dobermann-tyypit (lyhyt karva,
typistetty häntä) sekä Akame (kishu ilman pohjan raitoja).
