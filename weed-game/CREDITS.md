# Tekijät ja lisenssit

## 3D-malli
- **Koiran perusmalli** `public/models/dog_base.glb` = *Shiba Inu* paketista **"Ultimate Animated Animal Pack"**,
  tekijä **Quaternius** (https://quaternius.com/packs/ultimateanimatedanimals.html).
  Lisenssi: **CC0 1.0** (public domain), attribuutio ei pakollinen mutta annetaan kiitoksena.
  Animaatiot mallissa: Idle, Idle_2, Idle_2_HeadLow, Walk, Gallop, Gallop_Jump, Jump_ToIdle,
  Attack, Death, Eating, Idle_HitReact1/2.
  - Hankinta: Quaterniuksen oma Google Drive -lataus palautti "quota exceeded", joten sama CC0-tiedosto
    (meshopt-pakattu glb, glTF-Transform) haettiin julkisesta GitHub-peilistä
    `J-992/GGStudio` → `comfy-zoo/public/assets/models/animals/ShibaInu.glb` (Git LFS).
  - Kaikki hahmot (Weed, Gin, Smith, Jerome, Ken, Kagetora, Robert, Rocker, Heuler, Kaibutsu)
    ovat tämän mallin klooneja: uudelleenväritetty palettitekstuuri, mittakaava, korvaluiden skaala,
    Smithin piilotettu etujalka, Kaibutsun harja (kartiot) + karvaton kylki + hehkuvat silmät koodissa.

### Kokeillut reitit (kirjattu tehtävänannon mukaisesti)
1. **Sketchfab**: haku-API toimi (löytyi mm. CC-BY "Animated Dog, Shiba Inu"), mutta lataus-API vaati
   tokenin (401), eikä ympäristössä ollut Sketchfab-tokenia → ohitettiin.
2. **Quaternius (CC0)**: ✔ valittu (ks. yllä). Kenney.nl palautti 403, Poly Pizza 403.
3. **Blender/bpy**: ei tarvittu, koska valmis rigattu ja animoitu CC0-malli löytyi.

## Äänet ja musiikki
- Kaikki äänet (purenta, väistö, karjunta, kivivyöry, Battōga, haukku, ulvonta) ja musiikki
  (taisteluostinato, surullinen piano-arpeggio, rauhallinen teema) **syntetisoidaan koodissa**
  WebAudio-API:lla (`src/audio.js`). Ei ulkoisia äänitiedostoja.

## Kirjastot
- **three.js** 0.170.0 – MIT (three.js authors)
- **Vite** 5 – MIT
- meshopt_decoder (three.js examples) – MIT (Arseny Kapoulkine)

## Alkuperäisteos
- *Ginga Densetsu Weed* © Yoshihiro Takahashi / Nihon Bungeisha. Tämä on epävirallinen,
  ei-kaupallinen fanityö. Tarinan tapahtumat on kirjoitettu omin sanoin `docs/weed-game/research.md`:n
  pohjalta; repliikit ovat omia, paitsi yksi research.md:ssä lainattu repliikki (Heuler).
