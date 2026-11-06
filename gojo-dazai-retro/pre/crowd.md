# Katsomo: Dazai (viisas) + Shunsui (hätäinen) siluettien keskellä (P -> E)

Koordinaattorin päivitys: **DAZAI on se viisas** (tietää aina mihin suuntaan taistelu menee ja korjaa rauhallisesti), ja **hänen vieressään istuu SHUNSUI**, joka heittää
**ennenaikaisia tuomioita** ("Ha, he lost" -tyyliin). **Molemmat istuvat siluettien keskellä**: heitä ei koskaan näytetä kaksin tyhjässä katsomossa.
Ei puhuttua ääntä: vain tekstitys + pieni foley (kuppi, kangas, sake) ja vaimea yleisöhumina.

## Sommittelu (jokainen katsomokuva, BG `STANDS`, hand2d)

- Kivipenkki keskellä, **Shunsui vasemmalla** (kukkahaori, olkihattu, sakekuppi; eleet isoja: läimäyttää polvea, osoittaa kentälle, nostaa kuppia),
  **Dazai oikealla** (trenssi, siteet; eleet pieniä: kallistaa päätä, hymyilee silmät puoliksi kiinni, ei käännä katsettaan kentältä).
- **Siluetteja joka suunnassa:** 2-3 sumeaa päätä etualalla (kamera katsoo niiden välistä), 3-5 penkkirivillä vierellä, takarivit. Siluetit reagoivat (`gasp`, `hush`, kumartuvat),
  mutta eivät puhu.
- Valo: soihtu sateessa + kentän välähdykset kasvoilla (punainen Itachin iskuissa, kulta Juliuksen iskuissa). Sade valuu katoksen reunalta.
- Kamera aina liikkeessä (push-in siluettien välistä, sivuttaisdrift, vetäytyminen).

## Reaktiot (näkyvät; maskatut 4 lisää: spoilers.md)

| shotti | aika | Shunsui (hätäinen, väärässä) | Dazai (viisas, oikeassa) | mihin taistelu on menossa |
|---|---|---|---|---|
| C03 | 19.60 | läimäyttää polveaan: **"Ha! The crow's frozen. He lost."** | hymyilee: **"Look again. That's feathers."** | jäätynyt Itachi on varisklooni (C04) |
| C14 | 38.20 | nauraa: **"Fighting blind? He's finished."** | **"No. He just learned the rule."** | Julius on keksinyt genjutsun säännön |
| D03 | 59.60 | nostaa kupin: **"Black fire! That's game!"** | kallistaa päätä: **"Not against a clock."** | Chrono Anastasis kelaa liekit pois (D05) |
| D12 | 73.25 | heiluttaa kuppia: **"A giant? Easy win for the crow."** | osoittaa leuallaan: **"Watch the old man smile."** | Julius vastaa Mana Zonella (D14) |
| (maskattu) T04, T22, J06, J21 | – | spoilers.md | spoilers.md | – |

Yhteensä 8 reaktiota (4 näkyvää + 4 maskattua), kaksi riviä per kuva, kumpikin ≤ 8 sanaa. Shunsuin rivi ensin, Dazain korjaus perään.
Tekstityksen nimet ja värit: **SHUNSUI #f4a6c8**, **DAZAI #d9b77e** (ITACHI #e8364a, JULIUS #f2c76b, URAHARA #9fe0a5).

## Tarvittavat reaktiot (E: ilme + pieni ele, 1-2 s animaatio)

- **Shunsui:** `kyo_kneeSlap` (läimäys + virne), `kyo_point` (osoittaa kentälle), `kyo_cupRaise` (kuppi ylös riemuissaan), `kyo_cupWave`, `kyo_laugh` (olkapäät nytkähtävät), + spoilers.md.
- **Dazai:** `dazai_sitSmile` (silmät puoliksi kiinni, hymy), `dazai_headTilt`, `dazai_chinPoint` (osoittaa leuallaan), `dazai_watch` (liikkumaton katse kentälle), + spoilers.md.
  Olemassa: `dazai_sit`, `dazai_think`, `dazai_smileClosed`, `dazai_lean` (API.md 12-13).

## Siluetit

- Reaktiot `cheer gasp hush roar panic` + **`freeze`** (aika-shotit: siluetit harmaantuvat ja pysähtyvät kesken liikkeen). Ei tunnistettavia hahmoja.
