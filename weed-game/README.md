# Ōun tarina – Weed-fanipelin pelattava luonnos (vertical slice)

Epävirallinen, ei-kaupallinen fanipelin **luonnos**, joka näyttää, millainen lopullinen peli voisi olla.
Sisältää yhden tason: **Taso 2 "Gajō – Kaibutsu"**. Suunnittelu: `../docs/weed-game/game-design.md`, tarina: `../docs/weed-game/research.md`.

Hahmot ovat **omia tyyliteltyjä low-poly-koiria**, jotka on tehty yhdestä CC0-perusmallista värejä,
mittakaavaa ja lisäosia vaihtamalla. Ne eivät kopioi animen/mangan hahmosuunnittelua. Virallisia kuvia,
logoja, musiikkia tai ääniä ei käytetä.

## Ajaminen

```bash
cd weed-game
npm install
npm run dev        # kehityspalvelin (vite --host), näyttää myös lähiverkko-osoitteen
npm run build      # staattinen build -> dist/
npm run preview    # buildin esikatselu (vite preview --host)
```

### Puhelimella

1. Kone ja puhelin samaan Wi-Fi-verkkoon.
2. `npm run dev` → Vite tulostaa rivin `Network: http://192.168.x.x:5173/`.
3. Avaa osoite puhelimen selaimessa ja käännä puhelin **vaakatasoon**. Androidilla peli pyytää
   koko näytön tilaa ja lukitsee vaakasuunnan, kun painat "Taso 2".
4. Vaihtoehto: `npm run build` ja `dist/` minkä tahansa staattisen palvelimen (GitHub Pages, Netlify)
   taakse. `base: './'` tekee buildista polkuriippumattoman.

### Ohjaus (kosketus tai hiiri)

| Ele | Toiminto |
|---|---|
| Napautus | Weed puree (ryntää hirviön luo ja palaa) |
| Pyyhkäisy ←/→ | Väistö sivulle |
| Pyyhkäisy ↑ | Hyppy (väistää syöksyn) |
| Kaaren piirto ⟳ | **Battōga**, kun Henki-mittari on täynnä |
| Laumakortit (oikea alakulma) | Jerome paljastaa heikon kohdan, Ken & Kagetora yhteisisku, Smith = uhraus |
| Täydellinen väistö viime hetkellä | Hidastus + Henkeä |
| Pitkä painallus / "Ohita" | Ohita cutscene |

### Testilinkit
- `?play=1` aloittaa suoraan tason intron, `?phase=2&nointro` / `?phase=3&nointro` suoraan vaiheeseen.
- `?lowfx` poistaa bloomin ja puolittaa partikkelit (heikot puhelimet).
- Konsolissa `__game.debug` (esim. `__game.debug.fillHenki()`).

## Rakenne

```
index.html            UI-kerros (HUD, kortit, valikot, tekstitys)
public/models/dog_base.glb   koiran perusmalli (Quaternius ShibaInu, CC0, meshopt-pakattu)
src/engine.js         renderöijä, bloom, pelisilmukka, tweenit, slow-mo, cutscenen ohitus
src/dogs.js           perusmallin lataus, kloonaus hahmoiksi (värit, koko, korvat, kolme jalkaa,
                      Kaibutsun harja + heikko kohta + hehkuvat silmät), cel-ääriviiva, häntä/korvat
src/world.js          Gajōn yö: parallax-vuoret, kalliotornit, vesiputous, männyt, lumisade (GPU-shader)
src/fx.js             partikkelit, iskurenkaat, Battōga-kaari, hengen valot, välähdys, speed-linet
src/input.js          eleiden tunnistus (napautus/pyyhkäisy/kaari) + eleen valojälki
src/audio.js          WebAudio-syntetisoidut äänet ja generatiivinen musiikki
src/level2.js         bossin tekoäly, vaiheet, kortit, cutscenet
src/main.js           käynnistys, päävalikko, Lauma-esittely
tools/shots.cjs       Playwright-läpiajo ja kuvakaappaukset -> screenshots/
```

## Kuvakaappaukset ja testaus

```bash
npm run build && (npx vite preview --port 4173 &) && node tools/shots.cjs        # kaikki
node tools/shots.cjs menu | intro | battle | portrait                            # osa
```

Kaappaukset: `screenshots/` (844×390, DPR 2). Läpiajo pelaa tason alusta tulosruutuun asti
(valikko → taistelu → Smithin uhraus → Neljä nuolta → Battōga → loppu → tulokset).
