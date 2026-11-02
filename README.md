# Anime-engine

Koodilla piirretty 2D-animemoottori, jolla on tehty täyspitkiä anime-taistelukohtauksia (720p, 24 fps).
Kaikki kuva on koodia: ei tekoälykuvia, ei 3D-renderöintiä. Hahmot ovat parametrisia pseudo-3D-pintoja, jotka piirretään cel-tyylillä Canvas 2D:llä Chromiumissa ja koodataan ffmpegillä.

- **Tekoälylle:** aloita tiedostosta [`README_FOR_AI.md`](README_FOR_AI.md).
- **API:** [`API.md`](API.md) (luvut 0–17), moottorin yleiskuva [`engine/README.md`](engine/README.md).
- **Oppeja tekijöiltä:** [`LESSONS.md`](LESSONS.md).
- **Esimerkkiprojekti:** `showdown/` + `pre/` (Itachi vs Julius, Record of Ragnarok -tyyli).

Vaatimukset: Node 22, `playwright` (Chromium), ffmpeg, python3.

## Lisenssit ja huomiot
- Fontit (`engine/fonts/`) ovat SIL OFL -lisensoituja (Google Fonts).
- Musiikki ja äänitehosteet EIVÄT ole mukana: ne ladattiin Epidemic Soundista, ja niitä saa käyttää vain oman tilin ehtojen mukaan. `audio/sfx_list.tsv` ja `audio/CREDITS.md` kertovat, mitä käytettiin.
- Hahmot ovat fanityötä: oikeudet alkuperäisiin hahmoihin kuuluvat niiden omistajille.
