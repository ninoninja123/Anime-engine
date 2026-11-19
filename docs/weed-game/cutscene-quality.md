# Weed-pelin cutscenejen laatusäännöt (taso 2 ja eteenpäin)

Lähde: `docs/QUALITY_GATE.md` (Kuva, Ääni, Sound design) + käyttäjän palaute tason 2 P4-taistelusta
("osumat eivät osu, Smith seisoi P4:n päällä"). Tekninen toteutus: `weed-game/src/contact.js`, askeleet `src/scenes.js`.

## 1. Kontakti (aina)
- Jokainen isku on **oikea kontakti**: hyökkääjän hampaiden kohta (pää- ja leukaluun etummaiset verteksit) tai tassu viedään
  kohteen **pinnan** pisteeseen (kaula, olka, kylki, lonkka, rinnan heikko kohta, kurkku, jalka) iskuhetkellä.
  Askel: `{ strike: 'id', target, point, side, wind, t, arc, hitAt, pin, react, fx, sfx }`.
- Purennassa hampaat pysyvät kiinni (`pin`): vartalo nousee takajaloille, jos maa ylettyy, muuten roikkuu ja heiluu kohteen
  liikkeestä. Vartalo ei saa painua kohteen sisään (automaattinen kallistus ulospäin).
- Iso hahmo puree paikaltaan kaulaa ja päätä ojentamalla (`{ reach: 'kaibutsu', target, point }`, CCD-IK) – juuri ei liu'u.
- Kukaan ei seiso toisen päällä eikä ole toisen sisällä (paitsi tarkoituksella: hyppykaari, kantaminen `_carried`).
- Väistö näytetään konkreettisesti: hampaat napsahtavat tyhjään kohtaan, jossa kohde oli (`whiff: true`).

## 2. Kamera
- **Aina liikkeessä**: seuraava kamera (`{ track: 'id' | 'mouth:id', from, to, look, t }`), dolly, orbit; käsivarahengitys
  (engine) cutsceneissä. Ei jäätynyttä kuvaa, paitsi tarkoituksellinen pysähdys ennen kuolemaa (hidas työntö).
- Rytmi tarinan mukaan: hengähdyshetket (repliikki + hidas push-in) sallittuja.

## 3. Sakuga: koko isku näkyy 1,5–3 s
1. **Anticipation** (`wind`): kyyristys, vetäytyminen, pää alas, murina.
2. **Nopea liike**: venytys (smear) syöksyn keskellä, nopeuslinjat, jälkikuva vahvoissa iskuissa, slow-mo.
3. **Kontakti**: hitstop (2–4 framea), freeze-frame tärkeimmissä, osumapiste korostuu (oma efekti).
4. **Follow-through**: kohteen reaktio (karjunta, nytkähdys, horjahdus, riuhtonta), pöly, hyökkääjän roikkuminen,
   kameran työntö hampaisiin.
- Ei 0,1 s välähdyksiä.

## 4. Tehosteet kuuluvat tapahtumaan
| Tapahtuma | Efekti |
|---|---|
| Purenta (`fx: 'bite'`) | hammasiskun välähdys (pieni terävä tähti) + pöly-/karvarengas + karvahiukkaset |
| Heikon kohdan osuma (`fx: 'crit'`) | lämmin iso tähti, oranssi kipinäpurske, rengas, valkoinen välähdys |
| Tassu / vartalotörmäys (`fx: 'impact'`) | iskutähti + paineaalto |
| Battōga | pyörre + viiltokaaret + valkoinen räjähdys + suuri rengas |
| Kivisortuma | pölypilvi + kivimurska + kuunvalon valopilarit halkeilevan katon läpi |
| Smithin uhraus | hidastus, hiljaisuus, sydämenlyönti, henkivalo |
Signature-efekti ei ole oletuskerros jokaiselle osumalle.

## 5. Ääni
- Jokaisella näkyvällä tapahtumalla ääni (kattavuustaulukko: `cutscene-sound-coverage.md`).
- Isku = whoosh ennen (syöksy) + transientti (bite_snap / hit) + matala tömähdys (hit_heavy, vahvoissa) + materiaalin häntä
  (fur / dust / rock). Ei yhtä oletuskerrosta kaikkiin iskuihin. Musiikki väistää iskuissa (EVENTS.duck), puhe selvänä.

## 6. Tunne
- Hiljaisuus ja hidastus ennen ratkaisevaa hetkeä, lähikuvat kasvoista/hampaista, kameran pysähtyminen ennen kuolemaa,
  viimeinen katse ystävään, kuolemat ilman verta (PEGI 12) mutta raskaina. Musiikki: `smith` (Smithin uhraus),
  `sad` (Neljä nuolta), `smith2` (muistohetki).
- Ruudulla vain englantia.

## 7. Laatutarkistus ennen "valmis"
- `node tools/contact-check.cjs` (Playwright, vaaka 844x390): mittaa jokaisen iskun kontaktin, vartalon läpileikkauksen ja
  päällä seisomisen koko kohtauksen ajan; ottaa jokaisesta iskusta 6 framen kuvasarjan
  (anticipation → launch → lunge → contact → follow → after) arkiksi `screenshots/contact/sheet_<kohtaus>_s<n>.png`.
- Katso arkit ja korjaa ennen kuin väität valmiiksi.
