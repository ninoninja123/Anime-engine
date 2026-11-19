# Look-dev v2: värimuunnos, joka säilyttää yksityiskohdat

## Menetelmä (tools/recolor-looks.mjs; make-looks.mjs ohjaa tähän)
v1 korvasi pohjan tekstuurin litteällä värillä. v2 aloittaa pohjamallin **alkuperäisestä** 2048 px
tekstuurista, jonka työkalu pienentää 1024 px:iin, ja vaihtaa siitä vain värin. Työkalu hajottaa
OKLab-vaaleuden kolmeen kerrokseen:

- **P (sävyluokka, t)**: pohjan omat väriluokat, kuten musta satula ja ruskea turkki. Luokat saadaan
  k-meansilla UV-saaren sisäisestä mediaanisuodatuksesta (r 6). Mediaani poistaa ohuet viivat, mutta
  läikkien reunat pysyvät terävinä eivätkä jätä renkaita.
- **S (varjostus)**: mediaanin suhde luokan keskukseen.
- **D (yksityiskohta)**: alkuperäisen suhde mediaaniin. Siihen kuuluvat karvaviivat, ääriviivat,
  hampaat ja muut hienot piirteet.

Uusi väri on `gradient(t)`, joka kerrotaan S:llä ja D:llä. Lisäksi a,b-poikkeama luokan keskiväristä
palautetaan osuudella `chroma`. Tämän jälkeen sovelletaan hue-, sat-, val-, gamma- ja contrast-säädöt.
Näin jokainen viiva ja varjostus säilyy.

`flatten` (0–1) poistaa pohjan omat läikät:
- läikän alueella varjostuksen tilalle maalataan ympäröivän luokan varjostus
- luokkarajojen reunaviivat vaimennetaan

Kasvot säilyvät alkuperäisinä `keep`-maskin avulla. Maski kattaa silmät, nenän, suun ja kielen. Se
tunnistetaan pään suuren mittakaavan mediaanikontrastista (r 13) ja pinkistä sävystä.
`eyeColor` vaihtaa iiriksen värin.

## Speksikentät (src/data/looks.js)
```
look: { base, tones?: 2,
  grade: { gradient: [tumma, ..., vaalea] | [[pos, hex]], hue, sat, val, gamma, contrast, detail, shade, chroma, flatten, flattenTo },
  regionGrades: { head|muzzle|ears|neck|back|belly|chest|legs|paws|tail: { ...grade } },
  marks: [{ type, color, blend: 'tone'|'multiply'|'overlay'|'softlight'|'screen'|'normal', opacity, breakup, ...muoto }],
  eyeColor?, keepFace? }
```
- **Alueet** lasketaan skinning-painoista ja normaaleista, ja niillä on pehmeät reunat.
- **`tone`-merkki** (oletus) vaihtaa alueen pohjavärin, mutta S ja D näkyvät sen läpi.
- **Merkkien reunat** puretaan karvan suuntaisella anisotrooppisella kohinalla (`breakup`).
- **Merkkityypit:** under, saddle, cap, muzzle, mask, cheeks, brows, blaze, ears, socks, legs, tailTip,
  tail, chest, spots, ticking, stripes, patches, grizzle, scar.
- **`LOOK_ARMY`** lisää rigatut joukkohahmot (characters.js).

Ajo ja tarkistus:
- `node tools/recolor-looks.mjs [id ...]`. Ensimmäinen ajo kestää noin 10 s per pohja, sen jälkeen
  mediaanit tulevat välimuistista (node_modules/.cache/looks).
- `--debug=tone|keep|region|detail` tuottaa piirrekartan.
- Vertailuarkki: `node tools/look-sheet.cjs out.png id1,id2 4 [--close]`.

## Mitkä pohjat sopivat mihinkin
| Pohja | Sävyluokat | Sopii |
|---|---|---|
| john_auto | musta / ruskea | paimenkoirat, dobermann-tyypit (luuskaalaus), sudet. Musta-ruskea-akseli on erittäin joustava |
| smith_rigged | musta / kerma | luppakorvaiset ajokoirat, setterit, spanielit |
| ken_auto | lähes yksivärinen + tumma naamio | doggityypit (harmaa, sininen, brindle). Paras yksivärisille |
| generic_auto | yksivärinen ruskea | sekarotuiset lyhytkarvaiset. Merkit `tone`-tilassa onnistuvat hyvin |
| hogen_rigged | valkoinen / mustat läikät | täpliset ja merle-doggit. Yksivärisenä läikkien jäljet näkyvät (vältä flatten) |
| gin_auto, weed_rigged, tesshin_auto, akame_auto | kaksisävyinen pystykorva | japanilaiset pystykorvat (punainen, seesami, musta-ruskea) |
| striped_b_rigged | raidallinen | brindle-tyypit (punainen, musta) |
| rocket_rigged | oranssi / valkoinen | vinttikoirat, lurcherit |
| tobei_rigged | yksivärinen ruskea | raskaat mastiffit |

## Laatuvertailu (omin sanoin)
- **Hyvin onnistuneet** (ero alkuperäisiin malleihin ei käytännössä näy, koska kaikki viivat ja
  varjostus ovat alkuperäisiä):
  - kaksisävyiset muunnokset, joissa pohjan kuvio sopii kohteeseen: dobermannit, harmaa susi,
    setteri, punainen ja seesami pystykorva, spanieli, harmaa vinttikoira, harmaa täplädoggi
  - yksiväriset muunnokset yksivärisestä pohjasta (ken_auto ja generic_auto)
- **Heikommat:**
  - **Proseduraaliset raidat ja läikät** (brindle, merle) ovat siistimpiä kuin käsin maalattu Tripo-
    tekstuuri. Lähikuvassa ne näyttävät "lisätyiltä".
  - **Hogenin pohja ei sovi yksiväriseksi**: flatten jättää läikkien haamut.
  - **Ruskeat merkit (tan points)** tummalla pohjalla ovat oikeissa paikoissa, mutta niiden rajat ovat
    pehmeämpiä kuin piirretyt.

## Suositus käyttäjälle: tee Tripolla nämä peruskoirat
Paras värimuunnospohja on **mahdollisimman tasainen, vaalea ja yksivärinen** turkki. Siinä on
selkeät tummat ääriviivat ja karvaviivat, silmät ja nenä, mutta ei läikkiä. Kaikki kuviot tehdään
merkeillä.
1. **Vaalea lyhytkarvainen pystykorva** (kerma tai vaaleanharmaa, keskikokoinen): kattaa
   paimenkoirat, dobermannit ja sekarotuiset.
2. **Vaalea luppakorvainen lyhytkarvainen ajokoira**: ajokoirat, pointterit, dalmatialaistyypit.
3. **Vaalea raskas mastiffi tai doggi** typistetyillä tai luppakorvilla: isot sotilaat.
4. **Vaalea pitkäkarvainen pystykorva** (akita- tai spitz-runko): japanilaiset koirat.
5. **Vaalea vinttikoira** (karkea karva): susikoirat, lurcherit.

Mallit kannattaa tehdä seisovassa T-asennossa, sivuprofiili selkeänä. Tekstuuriin ei kannata leipoa
voimakasta valaistusta, eikä siinä saa olla valmiita läikkiä tai raitoja.
