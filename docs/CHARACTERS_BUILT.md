# CHARACTERS_BUILT: valmiit hahmot — KOPIOI, älä rakenna uudelleen
Data: `docs/characters_built.json` (sama sisältö koneluettavana; tämä tiedosto generoidaan: `python3 tools/saasto/chars_md.py`). Lähde = privaatti-haara:kansio. Hae koodi: `git -C /home/user/privaatti show origin/<haara>:<kansio>/<tiedosto>` tai `new_project.sh` kopioi koko moottorin.
Kopiointi: 3D → kopioi rakentaja (`make<Who>` / `M3.<who>` / `M8.<who>`) + `appearance.json`-rivi + 2D-lähikuvapää (`head2d.js`) omaan `chars_<projekti>.js`:ään; 2D → `showdown/mg/cast*.js` sisältää jo kaikki 2D-hahmot (`drawChar(g,'<key>',P)`).
Tarkistus aina: renderöi 1 lähikuva-arkki jokaisen hahmon tunnusmerkeistä (silmät!) ennen tuotantoa (`QUALITY_GATE.md`).

## 3D (VRM + MToon, VRoid-pohja; kasvot 2D-lähikuvina)
| hahmo | sarja | lähde | tiedosto / avain | ref | tunnusm. | heikkoudet / korjaukset |
|---|---|---|---|---|---|---|
| Monkey D. Luffy | One Piece | `luffy-vs-naruto-animation:luffy-vs-naruto` | chars.js + head2d.js / `makeLuffy` | docs/ref/naruto_luffy_ref.png | True | Paras taistelu. Sandaalit = pohja + remmit. 3D-kasvot VRoid → repliikit 2D-lähikuvina. |
| Naruto Uzumaki | Naruto | `luffy-vs-naruto-animation:luffy-vs-naruto` | chars.js + head2d.js / `makeNaruto` | docs/ref/naruto_luffy_ref.png | True | Kengät stock-mustat (ei avovarpaita). |
| Itachi Uchiha | Naruto | `gojo-vs-itachi-2min-animation:gojo-vs-itachi-2min; mindgame-production:eight-strings` | chars.js (GvI2); chars8.js M8.itachi / `M8.itachi / GvI2 Itachi` | eight-strings appearance.json itachi_1/2.jpg (script-mindgame/docs/ref/) | True | KORJATTU: kalju päälaki/otsa → hiusrajaa laskettu + otsanauha nostettu (GvI2). 2D-pään hl 30–34 (60 = kalju). |
| Satoru Gojo | JJK | `gojo-vs-itachi-2min-animation:gojo-vs-itachi-2min` | chars.js + head2d / `Gojo` | - | True | GvI2 = '100x parempi kuin aiemmat'. |
| Benimaru Shinmon | Fire Force | `benimaru-vs-yami-test:benimaru-vs-yami; fire-vs-clover-3v3-animation:fire-vs-clover` | chars_by.js + appearance.json; chars.js M3.benimaru / `benimaru` | fire-vs-clover/docs/ref3v3/benimaru.jpg | True | ÄLÄ MUUTA silmiä: oikea rengasiiris + VASEN valkoinen X. Ei miekkaa. 3D-bob liian pyöreä. |
| Yami Sukehiro | Black Clover | `benimaru-vs-yami-test:benimaru-vs-yami; fire-vs-clover-3v3-animation:fire-vs-clover` | chars_by.js; chars.js M3.yami / makeYami / `yami` | fire-vs-clover/docs/ref3v3/yami.jpg | True | Ei tarpeeksi lihaksikas; tank-topin pääntie kulmikas. Tekniikka 闇纏・次元斬り. |
| Joker | Fire Force | `fire-vs-clover-3v3-animation:fire-vs-clover; mindgame-production:eight-strings` | chars.js M3.joker; chars8.js M8.joker / `joker` | docs/ref3v3/joker.jpg | True | Hiuksissa pieniä aukkoja (hattu peittää). |
| Shō Kusakabe | Fire Force | `fire-vs-clover-3v3-animation:fire-vs-clover` | chars.js M3.sho / `sho` | docs/ref3v3/sho.jpg | True | Viitta staattinen (ei tuulta). |
| Fuegoleon Vermillion | Black Clover | `fire-vs-clover-3v3-animation:fire-vs-clover` | chars.js M3.fuegoleon / `fuegoleon` | docs/ref3v3/fuegoleon.jpg | True | Hiukset suora verho (ei laineita); Salamander = efekti. |
| Nozel Silva | Black Clover | `fire-vs-clover-3v3-animation:fire-vs-clover` | chars.js M3.nozel / `nozel` | docs/ref3v3/nozel.jpg | True | Kruunu piikkirengas (ei yksi harja). |
| Sōsuke Aizen | Bleach | `team-battle-4v4-animation:team-battle-4v4 (myös fire-vs-clover chars.js)` | chars.js / `makeAizen` | team-battle-4v4/docs/ref, ref4 | partial | 4v4-video epäonnistui (tarina), hahmo käyttökelpoinen. |
| Julius Novachrono | Black Clover | `team-battle-4v4-animation:team-battle-4v4` | chars.js / `makeJulius` | docs/ref | partial | Grimoire pakollinen näkyvissä. |
| Gowther | Nanatsu no Taizai | `team-battle-4v4-animation:team-battle-4v4` | chars.js / `makeGowther` | docs/ref | partial | Ääni naisellinen. |
| Kenpachi Zaraki | Bleach | `team-battle-4v4-animation:team-battle-4v4` | chars.js / `makeZaraki` | docs/ref | partial |  |
| Kisuke Urahara | Bleach | `team-battle-4v4-animation:team-battle-4v4` | chars.js / `makeUrahara` | docs/ref | partial | 4v4: 3D-hiukset ruskeat vs 2D valkoiset → yksi appearance-taulu + 3D-vs-2D-väritarkistus. |
| Osamu Dazai | Bungo Stray Dogs | `team-battle-4v4-animation:team-battle-4v4; mindgame-production:eight-strings` | chars.js makeDazai; chars8.js M8.dazai / `dazai` | dazai_1.jpg | partial | Älä toista Dazai-voittoa. |
| Orochimaru | Naruto | `team-battle-4v4-animation:team-battle-4v4` | chars.js / `makeOrochimaru` | docs/ref | partial |  |
| Trafalgar Law, Byakuya, Rill, Kokushibo, Mahito, Giyu, Todoroki, Bakugo, Inumaki, Yuno | eri | `fire-vs-clover-3v3-animation:fire-vs-clover (chars.js)` | chars.js / `makeLaw, makeByakuya, makeRill, makeKokushibo, makeMahito, makeGiyu, makeTodoroki, makeBakugo, makeInumaki, makeYuno` | - | False | Aiempien tiimitaisteluiden hahmot; tarkista lähikuvat ennen käyttöä. |
| Lelouch vi Britannia | Code Geass | `mindgame-production:eight-strings` | chars8.js M8.lelouch + appearance.json / `lelouch` | lelouch_1.jpg | True | VRoid-runko. |
| L (L Lawliet) | Death Note | `mindgame-production:eight-strings` | chars8.js M8.l / `l` | l_1.jpg, l_2.jpg | True |  |
| Mayuri Kurotsuchi | Bleach | `mindgame-production:eight-strings` | chars8.js M8.mayuri / `mayuri` | mayuri_1.jpg, mayuri_2.jpg | True | Kasvomaalaus tehty refin mukaan: musta kasvo, valkoinen raita otsasta nenään, valkoiset nauhat silmien alta poskiin, kultahuulet. |
| Yumeko Jabami | Kakegurui | `mindgame-production:eight-strings` | chars8.js M8.yumeko / `yumeko` | yumeko_1.jpg | True |  |
| Meruem | Hunter x Hunter | `mindgame-production:eight-strings` | chars8.js M8.meruem / `meruem` | meruem_1/2.jpg | True | Skaala 1,22–1,24. |

## 2D (mind game -moottori `showdown/mg/`; ilmeet calm/smile/smirk/cold/angry/shock/grin/demon/sad/tense/blank/tired/…)
| hahmo | sarja | lähde | tiedosto / avain | tunnusm. | huom. |
|---|---|---|---|---|---|
| Sōsuke Aizen | Bleach | `mind-game-fable-animation:mind-game-fable → joker-game:the-last-hand → iq-game:the-cheapest-life` | showdown/mg/cast.js / `CAST.aizen` | True | Seven Chairs, Last Hand, Cheapest Life. |
| Fyodor Dostoevsky | Bungo Stray Dogs | `mind-game-fable-animation:mind-game-fable` | showdown/mg/cast.js / `CAST.fyodor` | True | Seven Chairs. |
| Gowther | Nanatsu no Taizai | `kaikki 2D mind gamet` | showdown/mg/cast.js / `CAST.gowther` | True | Kyky (muistin manipulointi) pitää NÄKYÄ twistissä. |
| Edogawa Ranpo | Bungo Stray Dogs | `kaikki 2D mind gamet` | showdown/mg/cast.js / `CAST.ranpo` | True |  |
| Senku Ishigami | Dr. Stone | `kaikki 2D mind gamet` | showdown/mg/cast.js / `CAST.senku` | True | Laskut/kemia näytettävä ruudulla. |
| Kisuke Urahara | Bleach | `kaikki 2D mind gamet` | showdown/mg/cast.js / `CAST.urahara` | True | Valmistelu/ansat näytettävä aiemmin. |
| Yuuichi Katagiri | Tomodachi Game | `mind-game-fable / the-cheapest-life` | showdown/mg/cast.js / `CAST.yuuichi` | True |  |
| Osamu Dazai | Bungo Stray Dogs | `joker-game:the-last-hand; iq-game:the-cheapest-life` | showdown/mg/cast2.js / `CAST.dazai` | True | No Longer Human = Last Handin ainoa toimiva twist. |
| Kakashi Hatake | Naruto | `joker-game:the-last-hand` | showdown/mg/cast2.js / `CAST.kakashi` | True | Kamui-SFX valmiina. |
| Orochimaru | Naruto | `joker-game:the-last-hand` | showdown/mg/cast2.js / `CAST.orochimaru` | True | Ääni rauhallinen (ei sihisevä). |
| Talo / The House (jakaja, valkoiset hanskat) | oma | `joker-game:the-last-hand; iq-game (huutokaupanpitäjä AUC)` | showdown/mg/cast2.js / `drawHouse` | True | Ääni Satoru – Deep, Composed (Minato-resepti). |
| Koro-sensei | Assassination Classroom | `iq-game:the-cheapest-life` | showdown/mg/tcl_lib.js / `koro (SEATW)` | True | Cheapest Lifen 8 pelaajaa: dazai, ranpo, senku, koro, aizen, gowther, yuuichi, urahara. |

## Vanha 2D-cel-moottori
anime-engine engine/chars_*.js (julkinen) + mind-game-fable engine/: Itachi, Julius, Naruto, Luffy, Hulk, Banner, Yujiro, Harry, Gojo, Gowther, Shinji, Aizen, Dazai, Urahara, Kyoraku, Rengoku, Akaza, Deku, Shigaraki, Mereoleona, Nozel, Joker, Benimaru, Byakuya, Hitsugaya, Kenpachi, Mayuri, Tosen, Geto. Vanha pseudo-3D-cel (ks. CHARACTERS.md). Käytä vain 2D-taisteluun.

## Yleiset hahmo-opit
- 3D ja 2D luetaan YHDESTÄ appearance-taulusta (värit). `fire-vs-clover/tools/likeness_check.py` mittaa värit per alue (~1,5 min).
- Älä koskaan muuta tunnusmerkkiä mittasuhteita korjatessa (Benimarun X-silmä katosi kerran).
- Tunnistettavuus = siluetti + 3 merkkiä + referenssin värit. 2.5D-cut-outit/2D-nuket hylätty.
- Uusi hahmo: lisää rivi characters_built.jsoniin ja aja chars_md.py.
