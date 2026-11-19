# Story So Far – koodilla piirretty SVG-intro

Alkuintro "The Story So Far" on piirretty kokonaan koodilla (inline SVG + CSS-animaatiot + kevyt
requestAnimationFrame). Generoituja kuvia (`public/story/*.webp`) ei enää ladata.

## Tiedostot

| Tiedosto | Sisältö |
|---|---|
| `weed-game/src/story/svg.js` | Työkalut: `defs()` (gradientit), `layer()`, `ridge()` vuorijonot, `hill()`/`hillY()` maasto, `pines()` havupuut, `crowns()` lehtipuut, `deadTree()`, `cloud()`, `rays()`, `smooth()` (pehmeä ääriviiva pisteistä), siluetit `dog()` (stand/howl/walk/sit/lie), `bear()`, `monster()`, `human()` |
| `weed-game/src/story/panels.js` | Seitsemän kohtausta (`SCENES`), kukin palauttaa kerrokset kaukaa lähelle |
| `weed-game/src/data/scenes_prologue.js` | Paneelien data: kohtaus, kamera, partikkelit, otsikot, askeleet (repliikit, äänet, beatit) |
| `weed-game/src/prologue.js` | Soitin: rakentaa paneelit, kamera + parallaksi, partikkelit, siirtymät, Skip / Skip always |
| `weed-game/src/prologue.css` | Kerrosten animaatiot (`pl-pulse`, `pl-drift`, `pl-rays`, `pl-flicker`, `pl-breathe`, `walking`) ja beatit (`bt-*`) |

## Paneelit (repliikit ennallaan, samassa järjestyksessä)

1. **legend** – kuutamo, vuoret, koira ulvoo kalliolla kuuta vasten; otsikko; `story_01`
2. **village** – lumikylä iltaruskossa, talon ikkunat lepattavat; Gohee, Daisuke ja nuori Gin siluetteina; `story_02–03`
3. **akakabuto** – punainen myrsky, Gajōn kallio, valtava karhu punaisin silmin; `roar`-beat (nytkähdys + tärinä); `story_04`
4. **battle** – aamunkoitto, Ōun armeija harjanteella, karhu kalliolla; `battoga`-beat (hopeinen koira pyörii kaarena karhuun + välähdys + kipinät), `fall`-beat (karhu kaatuu); `story_05–06`
5. **paradise** – kevätpäivä, laakso ja joki, koiria, Gin kalliolla; `years`-beat (valo kultaiseksi illaksi); `story_07–08`
6. **ruin** – nyt: kuollut metsä, tulen hehku, hirviö Gajōlla; `roar`, `hunt` (metsästäjät ja valokeilat), `far` (kaukana kuun alla kulkeva Gin); `story_09–11`
7. **weed** – syksyn aamunkoitto, säteet, polku kohti Ōun vuoria, Weed kävelee; iris-siirtymä; `story_12`, `story_vow`, WEED-otsikko

## Rakenne ja suorituskyky

- Jokainen kerros on oma `<div class="pl-ly"><svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice">`.
  SVG rasteroidaan kerran; joka kehyksellä kirjoitetaan vain CSS `translate`/`scale` (kamera + parallaksi
  syvyyden `d` mukaan), joten selain koostaa kerrokset GPU:lla eikä piirrä uudelleen.
- Ei SVG-filttereitä (ei blur): hehkut ja sumut ovat radiaaligradientteja.
- Partikkelit (tähdet, lumi, lehdet, hiillos, kipinät) yhdellä canvasilla, ei `shadowBlur`ia; `?lowfx` puolittaa määrät.
- `E.noRender = true` koko intron ajan (3D-renderöinti pois). Piilotettu välilehti pysäyttää CSS-animaatiot (`#prologue.paused`).
- Seuraava paneeli rakennetaan valmiiksi edellisen aikana; paneeleita on DOMissa korkeintaan kaksi (ristihäivytys).

## Sommittelu

Vaakapuhelimessa (letterbox + tekstitys alhaalla) näkyvä puhdas alue on noin y = 180…545 (viewBox-yksiköissä).
Kasvot, silmät ja tärkeät siluetit sinne; alle 550 vain tummaa maata (tekstitys peittää sen).

## Uuden paneelin lisääminen

1. Kirjoita `panels.js`:ään funktio, joka palauttaa kerrokset kaukaa lähelle:
   `L.push(layer(depth, '<svg-sisältö>', { defs: d, cls: 'pl-drift' }))`. Gradientit `const d = defs('uniikki-etuliite')`.
   Rekisteröi se `SCENES`-objektiin.
2. Lisää paneeli `scenes_prologue.js`:n `PANELS`-listaan: `{ id, scene, cam: { from: [s, x%, y%], to: [...] }, fx, kicker, steps, hold, xfade, trans }`.
   `trans`: `fade` (oletus), `cut` tai `iris`.
3. Hetkelliset tapahtumat: askel `{ beat: 'nimi' }` lisää paneeliin luokan `b-nimi`; kirjoita `prologue.css`:ään
   `.b-nimi .bt-nimi { … }` ja anna kerrokselle tai `<g>`:lle luokka `bt-nimi`.
4. Testaa `?prologue`-osoitteella vaakatilassa 844×390 ja katso kuvakaappaukset (alku ja loppu).

Ruudulla ei ole japanilaisia kirjaimia (otsikot ja tekstitykset englanniksi). Hahmot ovat yleisiä siluetteja,
eivät jäljennöksiä piirroshahmoista.
