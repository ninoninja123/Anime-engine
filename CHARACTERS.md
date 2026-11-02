# CHARACTERS: valmiit hahmot (kaikki koodia, `engine/chars_*.js`)

Hahmot määritellään moduuleissa `engine/chars_*.js`; kunkin tiedoston alussa on kommenttilohko, jossa on ulkonäkö, muodot (forms), pose-kentät ja apurit. Käyttö shotissa: `CH(koodi, muoto, poseFunktio, opts)` (ks. `showdown/common.js`, `API.md`). Mallilehdet (5 näkymää, 5 pään kulmaa, 14 ilmettä) ovat kansiossa `docs/sheets/*_model.png`; puuttuvat lehdet saa ajamalla `engine/make_sheets.sh`.

| hahmo | sarja | tiedosto | mallilehti |
|---|---|---|---|
| Itachi Uchiha | Naruto | chars_ij.js | (generoi) |
| Julius Novachrono | Black Clover | chars_ij.js | (generoi) |
| Naruto Uzumaki | Naruto | chars_nl.js, chars_nl2.js | (generoi) |
| Monkey D. Luffy | One Piece | chars_nl.js, chars_nl2.js | (generoi) |
| Hulk, Bruce Banner | Marvel | chars_hy.js | hulk, banner |
| Yujiro Hanma, Baki Hanma (cameo) | Baki | chars_hy.js, chars_hz_s2.js | yujiro |
| Harry Potter, Satoru Gojo | Harry Potter / JJK | chars_hvg.js | harry, gojo |
| Gowther | Nanatsu no Taizai | chars_gow.js | gowther |
| Shinji Hirako, Sosuke Aizen, Osamu Dazai | Bleach / BSD | chars_sad.js | shinji, aizen, dazai |
| Kisuke Urahara (+ kuuluttajamuoto, gigai) | Bleach | chars_bleach.js, chars_zz_gdu.js | urahara |
| Shunsui Kyoraku | Bleach | chars.js, chars_e2b.js | kyoraku |
| Kyojuro Rengoku, Akaza | Demon Slayer | chars_ds.js | rengoku, akaza |
| Deku, Tomura Shigaraki | MHA | chars_mha.js | deku, shigaraki |
| Mereoleona Vermillion, Nozel Silva | Black Clover | chars_bc.js | (generoi) |
| Joker, Benimaru Shinmon | Fire Force | chars_fire.js | (generoi) |
| Byakuya, Hitsugaya, Kenpachi, Mayuri, Tosen, Kyoraku | Bleach (kapteenit) | chars.js, chars_bleach.js | byakuya, hitsugaya, kenpachi, mayuri, tosen |
| Geto (nuori) | JJK | chars.js | geto_youth |
| Lily/James/Sirius/Lupin (hahmovarjot) | Harry Potter | chars_s2.js | - |

Huomio: `chars_s2.js`, `chars_s4.js` sisältävät vain finaali-/cameo-muotoja (spoilereita aiemmista videoista).

## Uuden hahmon lisääminen
1. Kopioi lähin hahmotiedosto (esim. `chars_ij.js`) nimellä `chars_<oma>.js`.
2. Määritä `CAST.<id>`: mitat, värit, hiukset, vaatteet, silmät, muodot ja pose-kentät; lisää poset `Object.assign(POSES, {...})` ja ilmeet `Object.assign(EXPR, {...})`.
3. Tarkista `engine/make_sheets.sh` -mallilehdellä: kasvot selkeinä 720p:ssä, tunnusrekvisiitta mukana, ulkonäkö kanonin mukainen.
