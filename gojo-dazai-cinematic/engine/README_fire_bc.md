# E2-moduulit: Fire Force + Black Clover (hahmot, efektit, lavasteet)

Tiedostot (ladataan automaattisesti, ks. `README.md` / Moduulit): `chars_bc.js` (E2 KIT + Mereoleona + Nozel), `chars_fire.js`
(Joker + Benimaru), `fx_bc.js` (yhteinen liekkiydin + BC-efektit + BC-impactit), `fx_fire.js` (FF-efektit + FF-impactit), `sets_b.js`
(5 lavastetta + 7 palettia). Kaikki kutsut ovat tavallisia shot-kutsuja (API.md); alla vain lisäykset.
Testireeli: `/tmp/claude-0/-home-user-privaatti/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/db/e2/reel/e2reel.js` (28 s, hyvä esimerkki jokaisesta kutsusta).

## 1. Hahmot (`fig(nimi, muoto, poset, opts)`)

| nimi | muodot | tunnusmerkit |
|---|---|---|
| `joker` | `base` (knalli + pitkä takki), `nohat`, `adolla` (bandana pois, palava rengassilmä, INTERPRETAATIO), `vest` (ilman takkia: liivi + paita) | pitkät mustat suortuvat, violetti bandana vasemmalla, rengasiiris oikealla (violetti), tupakka, viininpunainen liivi, punainen kravatti |
| `benimaru` | `base`, `blaze` (liekit nyrkeissä, hehkuvat silmät) | leukapituinen musta polkka, punaiset silmät (vasen: valkoinen X), valkoinen T-paita + musta liivi, tummansininen kimono VAIN vasemmalla kädellä (oikea puolisko roikkuu vyötäröllä), saappaat, **matoi** = `sword`-spesifikaatio |
| `mereoleona` | `base`, `hellfire` (Hellfire Incarnate: hehkuva iho, liekkikärkiset hiukset, liekit käsivarsissa ja harjassa) | aaltoileva vermilion-harja, siniset silmät, punaiset merkit silmäkulmissa, kulmahampaat, tummansininen tunika + raitareunus, violetti vyö, valkoiset housut, saappaat, punainen viitta |
| `nozel` | `base`, `guardian` (Silver Guardian: elohopeapinnoite + kotkansiipiliepeet) | hopeanvalkoinen taakse pyyhkäisty piikkitukka, letti silmien välissä + riipus nenänpäässä, kapeat violetit silmät, turkisviitta + pitkä Silver Eagles -kaapu, kultainen kaulapanta, säärinauhat + sandaalit |

Kaikilla: 5 vartalonäkymää, 5 pään kulmaa, 14 ilmettä (mallilehdet), action3d + hand2d.
Mallilehdet: `/tmp/claude-0/-home-user-privaatti/79dc5a8e-ceec-583a-8d4d-730db9f6a619/scratchpad/db/e2/sheets/` (`<nimi>_model.png`, `<nimi>_forms.png`, `<nimi>_<muoto>_hand2d.png`). Uudelleen: `.../db/e2/make_sheets_e2.sh OUT [hahmot]` (`HAND=1` = hand2d-lehdet).

**Uudet pose-kentät** (interpoloituvat poseKeysissä):
- `grim` 0..1 (Black Clover -grimoire kelluu auki käden vieressä), `grimSide: 'L'|'R'`.
- `cards` (määrä), `cardsLit` 0..1 (liekkireunat), `cardHand` – Jokerin korttiviuhka kädessä (käytä `hR: 'sign'`).
- `cig: false` piilottaa Jokerin tupakan. `wounds` 0..3 = taisteluvauriot (E1:n `woundParts`; myös muodon kenttä `wounds`).
- Benimarun matoi: `sword: { hand: 'R', dir: [...] }` (pole + koriste + paperisuikaleet heiluvat). Ei tuppea: `sword: { sheathed: true }` piilottaa.

**Signature-poset** (`SIGNATURE[nimi]`):
- joker: `joker_lean joker_cards joker_hat joker_throwWind joker_throw joker_smoke joker_crouch joker_laugh`
- benimaru: `beni_idle beni_shoulder (matoi olalla) beni_iaiReady beni_iaiSlash beni_crimsonMoon beni_moonThrow beni_matoiSwing beni_ride (lento matoilla)`
- mereoleona: `mereo_stance mereo_armsCrossed mereo_calidusWind mereo_calidus mereo_uppercut mereo_grimoire mereo_roar`
- nozel: `nozel_stand nozel_palm nozel_grimoire nozel_command nozel_spear nozel_float`

## 2. Efektit
Kaikki: `f.fx(g => fxX(g, ..., lt - alku, {...}), { layer: 'over'|'under'|'glow' })`. Paikat maailmapisteinä `[x,y,z]` (tai `{x,y}`).
Liekkien värierottelu (tärkeä, 3 tulijoukkuetta): `E2_FLAME.beni` valko-kulta ydin + vermilion reuna + haarautuvat kielet ·
`E2_FLAME.joker` tuhkavioletti + hiillos (INTERPRETAATIO) · `E2_FLAME.mereo` karmiini-magenta · `E2_FLAME.purgatory` sinivioletti (kaanon: Purgatory = sininen) ·
Rengoku (E1) oranssi-kulta. `EXPL_COLS` saa `beni joker mereo purgatory mercury` → `fxExplosion(..., {pal:'beni'})`.

**Liekkiydin:** `fxE2Flames(g, [{p, r, ang, h}], t, {pal, n, hold, seed, alpha, spread, hK, wK})` (yhtenäinen kolmisävyinen anime-liekki, twos) ·
`fxE2FlameRibbon(g, pts, t, {pal, r: u=>..., count, ang:'back'})` · `fxE2Embers(g, c, t, {pal, n, r, h, size})`.

| hahmo | funktio | isku |
|---|---|---|
| Benimaru | `fxFireMoon(g, c, dir, t, {r, dist, dur, tilt})` | Iai Hand-Sword 1: Fire Moon 火月 (liekkisirppi) |
| | `fxRedSun(g, a, dir, t, {len, w})` | 4. muoto Red Sun 赤日 (säde) |
| | `fxSunWheel(g, F, t, {r, amt})` / `fxSunWheelThrow(g, a, b, t, {r, dur})` | 7. muoto Sun Wheel 日輪 (Acala-halo selässä / heitto) |
| | `fxCrimsonMoonOrb(g, c, t, {r or r(t)})` + `fxCrimsonMoonBlast(g, c, t, {r, dur})` | Crimson Moon 紅月 (lataus → räjähdys) |
| | `fxBeniAura(g, F, t, {amt, forks})`, `fxBeniForks(g, a, b, t, {w})`, `fxMatoiTrail(g, F, t)`, `fxHeatBarrier(g, c, t, {r:4})` | aura, liekkisalama, matoilento, 4 m lämpömuuri |
| Joker | `fxJokerCards(g, t, {a, b, n, spread, dur, stagger, size, lit})` tai `{orbit:{c, r, spin, h}}` | korttiliekit (volley / kiertävät) |
| | `fxJokerSuits(g, c, t, {glyphs:'♠♥♦♣', size})`, `fxJokerBurst(g, p, t)`, `fxCardStorm(g, c, t, {r, rings, n})` | maat, korttiräjähdys, 52+ myrsky |
| | `fxJoker53(g, c, t, {size, boomAt})`, `fxAshCloud(g, c, t)`, `fxJokerSmoke(g, p, t)`, `fxAdollaEye(g, F, t)` | 53. kortti, tuhka, savu, Adolla-silmä |
| Mereoleona | `fxCalidusFist(g, F, t, {side, size, lion})` (+ `fxLionPaw2D`) | Calidus Brachium: liekkikyynärvarsi + LEIJONANTASSU |
| | `fxPurgatoryBarrage(g, c, t, {n, r, dur, pal})` | Calidus Brachium Barrage / Purgatory |
| | `fxCrimsonLion(g, t, {c, dir, scale, roar, dur})`, `fxLionPack(g, a, b, t, {n, size})` | tulileijona (INTERPRETAATIO) / Exercitus Leonum |
| | `fxHellfire(g, F, t, {amt})`, `fxManaZone(g, c, t, {r, col})` | Hellfire Incarnate, Mana Zone |
| Nozel | `fxSilverEagle(g, t, {c, dir, scale, flap})` | Silver Eagle 銀翼の大鷲 |
| | `fxSilverRain(g, t, {c, r, n, dur})`, `fxSilverSpear(g, a, b, t)`, `fxRegalSpear(g, a, dir|fn(t), t, {len})` | Silver Rain, Spear, Silver Shining Regal Spear |
| | `fxSilverStar(g, c, t, {r, h, n, launch})`, `fxMercuryBlobs(g, c, t)` | Silver Star of Execution (häkki + keihäät), elohopeapisarat |

**Impact-sarjat** (`f.impact(nimi, {t0, at})`): `beni_firemoon beni_crimson beni_sunwheel beni_iai joker_cards joker_grin joker_adolla joker_suits
mereo_calidus mereo_lion mereo_hellfire mereo_purgatory nozel_eagle nozel_rain nozel_regal nozel_star`. P:n `pre/impact_requests.md` ei ollut vielä
olemassa; uudet pyynnöt voi lisätä `Object.assign(IMPACT_SEQ, {...})` fx_bc/fx_fire-tiedostoihin.

## 3. Lavasteet (`f.bg({ set, pal, dmg, burn })`)
| set | paletti | sisältö |
|---|---|---|
| `asakusa` | `ember` / `asakusa_night` | Asakusan katu: puiset machiya-talot, lyhtynauhat, palotornit (hinomi-yagura), 7. komppanian asema, kaukainen Tokio; `burn` 0..1 = katot palavat (Benimarun paletti), kipinät, savu |
| `volcano` | `magma` | laavakenttä: basaltti, hehkuvat laavahalkeamat, laavajoki ja -lammet, purkautuva kartio |
| `joker_table` | `table` | Jokerin korttipöytä tyhjyydessä: vihreä huopa, puureunus, jättikortit, pelimerkkitornit, lamppu + valokeila, savu |
| `adolla` | `adolla` | musta taivas, palavat rengassilmät, musta lasimaa heijastuksin, liekkihorisontti |
| `clover_castle` | `clover` / `clover_dusk` | Clover-linna: pyöreät tornit siniset kartiokatot, muurit, Silvan hopeatorni, liput; `dmg` → rauniot |
Kaikki: `dmg` 0..3, maalattu passi, parallax (kaukaiset vuoret/kaupunki/pilvet kupolilla). GRADES-preset jokaiselle paletille (`std(f, {pal})`).

## 4. Lähteet ja tulkinnat
Lähteet: fire-force.fandom.com ja blackclover.fandom.com MediaWiki-API (Joker, Benimaru_Shinmon, Iai_Hand-Sword, Fire_Moon, Crimson_Moon,
Crimson_Moon's_Sun_Wheel, Mereoleona_Vermillion, Nozel_Silva, Fire_Magic, Mercury_Magic, Calidus_Brachium*, Hellfire_Incarnate, Exercitus_Leonum,
Silver_*), sekä `pre/powers.md`. Tulkinnat: Jokerin liekkiväri ja `adolla`-muoto; tulileijonan pää (Leo Rugiens on Fuegoleonin, Mereoleonan kaanon-
muoto on tassu → tassu on oletus); Benimarun liekkisalamat visuaalinen tunnus; Nozelilla EI Valkyrie Armoria (Noellen) → `guardian` = Silver Guardian.
Huom. pre/cast.md ehdottaa Mereoleonalle oranssia tulta ja Nozelille tummaa viittaa/valkoista paitaa: tässä Mereoleona = karmiini-magenta
(pääagentin erottelupyyntö), Nozel = vaalea kaapu + tumma paita (wiki-kuvat). Vaihto = paletti/värikentät tiedostoissa.

## 5. Osa 3 -apumoduulit (E2, showdown/part3.js)
- `chars_e2b.js`: Kyōrakun muodot `shikai_hurt` (vauriot) ja `shikai_nohat` (hattu irti). Jokerin `dying`-muoto on `chars_fire.js`:ssä.
- `fx_e2b.js`: `fxLavaWall`, `fxSnowPin2D` (Koyukin hiussolki), `fxLongShadow` (pitkä varjo valosta), `fxDevilGrin`, `fxPalmRings`,
  `splitView(g, cam2, drawFn, {side, bg, slant})` (split screen: toinen kamera ruudun puoliskoon, käytä `layer:'over'`), `fxRollingHat`,
  `fxCharring`, `fxJokerCardHand`, `fxThreads`.
- `impact_e2b.js`: osan 3 impact-aliakset (FLAME_TIGER, DESTRUCTIVE_BLUE, LION_CLAW, HELLFIRE, BLOOD_MIST, SUIT_FLASH, JOKER_53, NICHIRIN_HALO,
  CRIMSON_MOON, KANNON_THREAD, PURGATORY_DRAGON, RED_BLACK_SPLIT, X-E2a/b, X-E3a–e); määritellään vain jos E1 ei ole jo määritellyt.
- `sets_b.js`: setit saivat oletuspaletin (`SETS.volcano.pal = 'magma'` jne.), jota common.js:n `BGX` käyttää.
