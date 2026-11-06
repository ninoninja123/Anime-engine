# showdown/ – ITACHI UCHIHA vs JULIUS NOVACHRONO (SHOW_DUR from pre/shots.json, ≤ 180 s; final delivery 1280x720, 24 fps)

| osa | shotit (t0) | tiedosto | kirjoittaja |
|---|---|---|---|
| 1 | t0 < PART_SPLIT (maskatut pois) | `part1.js` | E |
| 2 | t0 ≥ PART_SPLIT + kaikki maskatut | `part2.js` | S2 |

`PART_SPLIT` = puoliväliä lähin 12 s:n segmenttiraja (program.js `Math.round(SHOW_DUR/2/12)*12`, make.sh sama). Tarkista: `./make.sh split`.
Rajalla alkava shotti kuuluu osalle, jonka alueella sen t0 on. Segmentti renderöi aina koko ohjelman.

- `program.js` lataa `shots_data.js` → `PROGRAM.reset(SHOW_DUR)` → `common.js`, `part1.js`, `part2.js`, `fill.js` (puuttuvat shotit harmaana TODO-korttina).
- `shots_data.js` generoidaan tiedostosta `../pre/shots.json`: `python3 gen_data.py` (make.sh ajaa sen itse). Älä muokkaa käsin. Maskatut shotit (`masked`) ja `X-*`-impactit rakennetaan
  spoilers.md:n mukaan (S2); shotT ei aja `X-*`-sarjoja automaattisesti.
- `common.js` (lue yläkommentti):
  - `shotT(id, fn, opts)` – ajat, render-tyyli, impact-sarja `impact.t`:ssä venytettynä `frames`-pituiseksi (myös **BURST**-sarjat: `BURST`, `BURST_ITA`, `BURST_JUL`, `BURST_CLASH` =
    vähintään 5 eri impact-tyyliä 0,5–1 s:ssa, tyyli vaihtuu 1–3 framen välein; framemäärä shots.jsonista), iskunimi `text`-kentästä oikealla typografialla (`autoTitle`):
    `text_style` **UCHIHA** (Itachi, mustapunainen Shippori) / **CHRONO** (Julius, kulta-sininen Cinzel) / **ARENA** (kuuluttajabanneri, BEGIN!/FIGHT! iso) / **CARD_I** / **CARD_J**
    (`NAME / TITLE / SUB → VS` → `fighterCard` + `vsCard`). Pitkät nimet kahdelle riville; tekstityksen aikana iskunimi yläkolmannekseen.
  - `CH(koodi, muoto, keys, opts)` – `ITA` itachi, `JUL` julius, `URA` urahara (kuuluttaja), `DAZ` dazai, `KYO` kyoraku. Muodot, pose-kentät ja poset: `../API.md` luku 17. Oletus `timing: 2`; iskuissa `{ timing: 1 }`.
  - `BGX(f, koodi, over)` – `ARENA ARENA_DUSK ARENA_DAY ARENA_DARK ARENA_RED ARENA_GOLD STANDS BOOTH GATE_I GATE_J SKY CARD TSUKU FIN`. Shotin `dmg` ja `CROWD:react` luetaan automaattisesti.
    `over.side: 'I'|'J'` = valosääntö (Itachin puoli karmiini reunavalo lännestä, Juliuksen kulta idästä). Lavasteen optiot `over.bg` (API.md 17.3).
  - Yleisö: **Dazai = viisas**, hänen vieressään **Shunsui = ennenaikaiset tuomiot** ("Ha, he lost."). Molemmat istuvat siluettien keskellä, eivät koskaan yksin:
    `STAR(f, 'DAZ:watch', lt)`, `STAR(f, 'KYO:verdict', lt)`, `PAIR(f, lt, {rD, rS})`. Reaktiot: DAZ `watch knowing explain narrow smile shock sigh`, KYO `verdict toast smug oops laugh hush eyesWide sweat`.
  - Kamera (aina liikkeessä, isot hahmot, kasvot selkeinä): `heroRise(F, lt, o)` matala nousu, `arcCam(figs, lt, o)` kaarto, `pushFace(F, lt, o)`, `gcam(figs, t, o)`, `faceCam` + moottorin `closeCam camLowHero camOrbitShot camOTS camWhip camDutch`.
  - Efektipikakutsut: `SUS(f, lt, o)` Susanoo, `AMA(f, c, lt, o)` Amaterasu, `CROWS(f, lt, o)`, `CLOCK(f, c, n, lt, o)`, `MANAZONE(f, c, lt, o)`; ruutuprosessit `ijTsukuyomiScreen`, `ijLoopScreen`, `ijTimeStopScreen`.
- Tekstitykset (SUBS) piirtyvät automaattisesti: Inter 700 52 px, 8 px musta reuna, y 960; ITACHI #ff4a4a, JULIUS #f6d36a, URAHARA #9fe0a5, DAZAI #c8a878, SHUNSUI #f4a6c8.
- Esimerkit: `../engine/reel/ijlab.js` (muodot, efektit, lavasteet, yleisö), `reel/ijimpact.js` (kaikki impact- ja BURST-sarjat), `reel/ijtitles.js` (iskunimet + kortit), `reel/ijreel.js` (testireeli).
- Moottoribugit ja -pyynnöt: `ENGINE_NOTES.md` (E korjaa). Ajoitusmuutokset: `pre/shots.json` (P).

## Shotin kirjoittaminen (malli)
```js
const C_ITA = CH('ITA', 'sharingan', K([[0, at([-2.6, 0, 0], HP, P('ita_kunai'))], [.3, at([-2.2, 0, 0], HP, P('ita_kunaiSlash')), 'snap']]), { timing: 1 });
const C_JUL = CH('JUL', 'base', t => at([2.6, 0, 0], -HP, P('jul_cast', { grim: 1 })), { timing: 1 });
shotT('E01', (f, lt) => {
  BGX(f, 'ARENA', { side: 'I' });
  f.cam(arcCam([C_ITA, C_JUL], lt, { az0: -.3, az1: .3, low: true }));
  f.fig(C_ITA); f.fig(C_JUL);
  CLOCK(f, [2.6, 1.4, 1.2], [-1, 0, 0], lt - .2, { r: 1.2 });
});
```

## Renderöinti ilman konflikteja (CPU on jaettu: esikatselu enintään 2 workerilla!)
```bash
./make.sh part1 /tmp/claude-0/<oma scratch>/prev 0.5 1          # oman osan 960x540-esikatselu, joined -> prev/range.mp4
REDO=1 ./make.sh 3,4 /tmp/claude-0/<oma scratch>/prev 0.5 1     # vain muuttuneet segmentit uudelleen
cd ../engine && node render.js sheet ../showdown/program /tmp/.../s.png 0 84 36 0.25 6          # kontaktiarkki
cd ../engine && node render.js stills ../showdown/program /tmp/.../st 50.5,51.2 0.5              # yksittäiset framet
```
Täyttä laatua EI renderöidä ennen kuin pääagentti käskee. Lopullinen toimitus **1280x720**: `./make.sh all DIR 0.6667 2` + `AUDIO=<mix.wav> ./make.sh final DIR`
→ `showdown/itachi_vs_julius.mp4` (H.264 + AAC, ≤ 28 MB). Valmis osa: kirjoita `PARTn_DONE.txt`.
