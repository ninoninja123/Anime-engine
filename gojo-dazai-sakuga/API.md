# Bleach Showdown engine – API

Engine kansiossa `engine/`. Kaikki kuva piirretään koodilla Canvas 2D:llä Chromiumissa (Playwright, CPU-rasteri). Ei 3D-renderöintiä
eikä valmiita kuvia: hahmot ja lavasteet ovat pseudo-3D-geometriaa, joka projisoidaan kameran läpi ja piirretään 2D-cel-tyylillä
(näkymäriippuva piirto). Kaikki on deterministinen funktio ajasta, joten mikä tahansa frame voidaan renderöidä erikseen.

```
engine/
  core.js      matematiikka, rng, easingit, 3D-vektorit/matriisit, SVG-polut, tussiviivat (inkPts)
  camera.js    pinhole-kamera, project/projPoly/projLine, camPath, orbit, handheld, shake, whip, vertigo, DOF
  toon.js      näkymäriippuva cel-renderöijä (parametriset pinnat -> siluetti, cel-varjo, rim, efektivalot, tussi)
  rig.js       luuranko (FK + 2-luun IK), pose-objekti, POSES-kirjasto, poseKeys, jousisimulaatio (springLag)
  body.js      hahmon osat (vartalo, hakama, haori, hihat, kädet, jalat, kaula, huivi, miekat), drawFig
  faces.js     anime-pää, silmät, suu, nenä, ilmeet (EXPR), hiustupsut, hiuslakki
  chars.js     kuusi hahmoa kaikkine muotoineen (CAST), signature-poset (SIGNATURE), muotojen lisäosat
  world.js     maalatut 3D-lavasteet (SETS) ja paletit (PALETTES), lavasteapufunktiot
  fx.js        efektikirjasto (yleiset + Bleach-spesifit)
  impact.js    IMPACT FRAME -kirjasto: 20 tyyliä + sekvenssit (IMPACT_SEQ)
  text.js      iskujen nimet (englanniksi), kanji-pylväät, tekstitys
  post.js      kompositointi ja kuvaus (bloom, halation, grade, CA, motion blur, vinjetti, rae, flare)
  timeline.js  PROGRAM, shot(), frame builder f, sfx-markkerit, frameKey
  shotkit.js   pikakirjoitusapuja shotteihin (fig, P, K, at, walkCycle, hitStop, followTarget, std)
  sheets.js    mallilehtien generaattori (modelSheet, formsSheet)
  index.html   selainesikatselu (?prog=reel/testreel&scale=.5&t=3.2)
  render.js    stills / sheet / seg / all / redo / concat / events / preview
  make.sh      koko build: segmentit -> concat -> ääni -> mp4 + pieni versio
  make_sheets.sh  mallilehdet docs/sheets-kansioon
  lab.html, lab.js  kehityslaboratorio: aja mitä tahansa piirtokoodia ja tallenna PNG
  reel/example.js   pienin täydellinen esimerkki (LUE ENSIN)
  reel/testreel.js  36 s testireeli (kaikki hahmot, tyylit ja kamera-ajot)
  reel/impactlab.js kaikki impact-tyylit samasta hetkestä
```


## 0. Hybridityyli (action3d + hand2d) – LUE ENSIN
Jokainen shotti valitsee render-tyylin. `action3d` on 3D-cel-pohja toimintaan ja laajoihin kuviin, ja siinä on normaalipohjainen
cel-varjo. `hand2d` on käsin piirretyn näköinen tapa lähikuviin ja draamaan:
- **Varjot sijoitetaan muotoina**: muoto miinus itsensä siirrettynä valoa kohti. Raja ei kulje kasvojen poikki. Hatching on valinnainen (`LIGHT.hatch`).
- **Tussiviiva on painotettu**: varjopuolella paksumpi, lisäksi boil ja väriviivat (nenä ja suu ihonvärisen tumman sävyllä).
- **Hiukset ovat 2D-siveltimen muotoisia suortuvia**: harkittu varjokiila, sahalaitainen kiilto ja viiva paksu tyvessä, ohut kärjessä.
- **Muut**: kädet ovat 2D-sormia (kapenevat sormiluut, kynnet, rystysrypyt), silmissä isot kiillot ja hahmoissa gouache-tekstuuri. Taustan maalauspassi tehdään automaattisesti.

```js
shot('S05', 12, 14, (f, lt) => {
  f.style('hand2d');                                   // koko shotti hand2d (tai f.fig(F, { style: 'hand2d' }))
  f.trans({ type: 'inkWipe', dur: .3 });               // siirtymä shotin alkuun: inkWipe | whiteFlash | smear | petals | iris
  f.cam(closeCam(F, lt, { part: 'face', az: .5, el: 0 }));   // lähikuvakamera: face | eyes | eye | mouth | bust | hands | hand | blade | feet
  f.fig(F);                                            // pose: face: faceAnim('smirk', lt, { talk: 1, gaze: [[0,[0,0]],[1,[.3,0]]] })
});
```
- **Lähikuvanäyttely**: `faceAnim(expr, t, {blink, talk, amp, gaze, seed})`. `blink(t)` räpäyttää 2–3 framella, `talk(t, rate)` tuottaa suun muodot twos-tahdissa, `gazeAt(t, keys)` siirtää katsetta ja `breathe(pose, t)` hengittää. Hiukset ja vaatteet liikkuvat jousilla, ja jännittyneet kädet tehdään `hR: 'claw'` + `boil`-arvolla.
- **Saumattomat siirtymät**: leikkaa action3d-kuvasta hand2d-lähikuvaan samalla hahmo-objektilla ja samalla ajalla (`f.fig(F, { t: alku + lt })`), jolloin asento jatkuu. Tyylejä voi sekoittaa samassa ruudussa (`f.fig(A, {style:'hand2d'}); f.fig(B, {style:'action3d'})`).
- **Taustat**: maalattu tyyli on oletus (`BGSTYLE.painted`). Mukana ovat pehmeät gouache-pesut, kuivasivellinvedot, ilmakehän sumu, anime-kumpupilvet ja cirrus. Maalauspassia säädetään `f.paintBG({ soft, alpha, dab, paper })` ja se poistetaan `f.paintBG(false)`. Etualan oksat: `f.fg(g => drawForegroundBranch(g, pal, 'tr', lt, col, blur))`.
- **Mallilehdet**: `docs/sheets/<hahmo>_<muoto>_hand2d.png` (kaikki muodot), `modelSheet(ctx, nimi, muoto, 'hand2d')`.
- **Esimerkki**: `reel/testreel2.js` (26 s hybridireeli). Laboratoriot: `reel/h2dlab.js` (lähikuvat 3 kulmasta) ja `reel/paintlab.js` (maalatut lavasteet).

## 0b. Moduulit (laajennustiedostot ladataan automaattisesti)
Kaikki `engine/poses_*.js`, `engine/chars_*.js`, `engine/fx_*.js`, `engine/sets_*.js` ja `engine/impact_*.js` ladataan automaattisesti
ydinmoduulien jälkeen ja ennen `?prog=`-tiedostoja (renderöijät, lab-sivut, mallilehdet, showdown/program.js). Uusi tiedosto riittää: ei
rekisteröintiä scripts.js:ään. Manifestin (`engine/modules.js`) kirjoittaa `engine/modules.cjs`; render.js/lab.js/make_sheets.sh ajavat sen
itse. Tarkemmin: `engine/README.md` luku "Moduulit".

## 1. Ohjelman (shot-listan) kirjoittaminen

Ohjelma on JS-tiedosto, joka ladataan enginen moduulien jälkeen: `index.html?prog=shots/act1,shots/act2`. Polut ovat suhteessa
`engine/`-kansioon ilman `.js`-päätettä. Useita tiedostoja voi ladata pilkulla eroteltuna, ja ne voivat jakaa saman `PROGRAM`in.

```js
PROGRAM.reset(180, 'showdown');                 // kesto sekunteina (kutsu kerran, ensimmäisessä tiedostossa)
shot('S01', 0.0, 3.5, (f, lt, u, T) => {        // lt = shotin paikallinen aika, u = 0..1, T = globaali aika
  std(f, { pal: 'dusk' });                      // väriskripti + post-preset + avainvalo paletista
  f.cam(camPath([...])(lt));                    // kamera
  f.bg({ set: 'seireitei', pal: 'dusk', dmg: 1 });
  f.fig(HAHMO);                                 // hahmot (syvyysjärjestetään)
  f.fx(g => fxShockRing(g, [0,0,0], lt - 1.2), { layer: 'over' });
  f.impact('hit_heavy', { t0: 1.2, at: [0, 1.4, 0] });
  f.text(g => attackTitle(g, lt, { t0: 1.4, text: 'Senbonzakura', sub: '千本桜' }));
  sfx(1.2, 'big_hit');                          // ääniagentin markkeri (globaali aika: käytä T0 + lt)
});
```

**Frame builder `f`** (kutsuttavissa shot-funktiossa, kaikki ketjutettavissa):

| kutsu | merkitys |
|---|---|
| `f.cam(cam)` | kameraobjekti (ks. kamera). Pakollinen 3D-sisällölle. |
| `f.light(o)` | LIGHT-ohitukset: `key` (suunta valoa kohti), `rim`, `rimCol`, `rimAmt`, `shadeTint`, `shadeK`, `fx: [{p, col, r, a}]` (värilliset efektivalot, esim. Hyōrinmarun sininen valo kasvoilla), `ambient`, `ambientK`, `ink`, `lineK` |
| `f.bg(x)` | taustakerros: `{set, pal, dmg, seed, street, clouds, wind, zSplit}` tai oma `fn(g, T, f)` |
| `f.fig(F, opt)` | hahmo. `opt.t` = hahmon aika (oletus lt), `mode: 'flat'` + `col` (siluetti), `alpha` (toimii myös normaalitilassa), `shadow:false`, `afterimages: [dt, ...]` + `afterCol`/`afterA` (shunpo-jälkikuvat), `zBias`, `hidden`, `dof:false` |
| `f.prop(z, fn)` | oma elementti, joka syvyysjärjestetään hahmojen kanssa (z = kameran syvyys tai maailmapiste [x,y,z]) |
| `f.fx(fn, {layer})` | efekti. `under` (hahmojen alle), `over` (päälle), `glow` (additiivinen, syöttää bloomia), `top` (postin jälkeen, terävä) |
| `f.fg(x)` | etualan lavaste (sama muoto kuin bg, piirretään hahmojen päälle; käytä `zSplit`) |
| `f.grade(g)` | väriskripti: `tint:[hex,k]` multiply, `lift:[hex,k]` screen, `soft:[hex,k]` soft-light, `color:[hex,k]`, `sat`, `contrast`, `bright`, `hue` |
| `f.post(p)` | `bloom`, `bloomR`, `halation`, `ca`, `vignette`, `grain`, `blur`, `blurAng`, `bgBlur`, `flare: {x,y,col,a}`, `leak: {col,a,side}` |
| `f.shake(list)` | ruudun tärinä `[[t0, amp_px, dur, freq], ...]` paikallisessa ajassa (stepattu anime-tärinä) |
| `f.motionBlur(px, ang)` | suuntaava liike-epäterävyys (whip-pan) |
| `f.impact(seq, params)` | impact frame (ks. luku 7) |
| `f.flash(col, a)` | koko ruudun välähdys gradingin jälkeen |
| `f.text(fn)` | teksti postin jälkeen (ei gradea, ei raetta) |
| `f.style(s)` | `'action3d'` tai `'hand2d'` (hahmot + maalattu tausta + figuurin tekstuuri) |
| `f.trans(o)` | siirtymä shotin alkuun `{type: 'inkWipe'|'whiteFlash'|'smear'|'petals'|'iris', dur, dir, col}` |
| `f.paintBG(o|false)` | taustan maalauspassi |
| `f.key(k)` | frame-välimuistin avain (sama avain → renderöidään kerran). `shot(..., {timing: 2})` tekee koko shotista twos-tahtisen |

Shotin asetukset: `shot(name, t0, t1, fn, { timing, grade, post })`. Päällekkäisistä shoteista voimassa on myöhemmin alkanut.

## 2. Hahmot

```js
const F = fig('byakuya', 'base', poseKeysTaiFunktio, { timing: 1|2|3, wind: t => [x,y,z], springWin: .8, formAt: t => 'bankai' });
// = makeFig(CAST.byakuya, { form, at, timing ... })
drawFig(ctx, F, t, { mode: 'normal'|'flat', col, alpha })   // suora piirto (lab / omat efektit)
figSkel(F, t)                 // ratkaistu luuranko: .J nivelet (maailma), .M kehykset, .B mitat, .pose
figPos(F, t, 'head')          // nivelen sijainti (kameran seurantaan)
followTarget(F, t, 'abd', lag)   // pehmennetty seurantapiste
swordAt(F, t)                 // miekan kärki/tyvi maailmassa ({base, tip, fr})
```

**Hahmot (`CAST`) ja muodot (`form`)**:

| nimi | muodot | huom. |
|---|---|---|
| `kyoraku` | `base` (daishō vyöllä), `shikai` (kaksi mustaa kaarevaa sapelia, punaiset tupsut), `bankai` (Karamatsu Shinjū, tummat terät) | hattu, kukkakimono, poninhäntä, hiuspinnit, parta |
| `tosen` | `base` (Arrancar-asu, visiiri, oranssi köysi), `shikai`, `bankai`, `mask` (hollow-naamio), `resurreccion` (naamio + hyönteissiivet) | letit, rengas kahvassa |
| `byakuya` | `base`, `shikai`, `bankai`, `senkei`, `shukei` (valosiivet) | kenseikan 3+2, huivi, tekkō, lyhythihainen haori |
| `mayuri` | `base`, `shikai` (kolmikärki + vauvanpää-tsuba), `bankai` (Konjiki = efekti `fxKonjiki`) | valkoinen hattu kahdella kärjellä, kultaiset korvakartiot, violetti huivi, pitkä kynsi |
| `hitsugaya` | `base` (miekka selässä), `shikai`, `bankai` (Daiguren: jääsiivet, häntä, kynsi, 3 jääkukkaa) | nodachi, vihreä olkavyö |
| `kenpachi` | `base` (silmälappu, kellot), `unleashed` (lappu pois), `shikai` (Nozarashi-jättikirves), `bankai` (punainen oni, sarvet) | riekaleinen haori, arpi, siteet |

Muodon voi vaihtaa kesken shotin: `F.formAt = t => t < 1.2 ? 'base' : 'bankai'`.

### Pose-objekti (rig.js)
Kaikki kulmat radiaaneina ja kentät valinnaisia. Puuttuva kenttä on neutraali seisonta.

- `pos:[x,y,z]` maailmassa (maapiste lantion alla), `yaw` (0 = katse +z, `HP` = +x), `pitch`, `roll` koko keholle
- `ground` (oletus true: alin jalka maahan, kyykyt korjautuvat), `ground:false` + `drop` hyppyihin
- selkä `sp` (eteen), `ss` (sivulle), `st` (rintakehän kierto); pää `hp` (leuka alas), `hy` (vasemmalle), `hr`
- kädet `aL/aR: [elevaatio, atsimuutti, kierto]`: elevaatio 0 = alas, π/2 = vaaka, π = ylös; atsimuutti 0 = eteen, +π/2 = omalle sivulle, π = taakse, negatiivinen = vartalon yli. Kyynärpää `eL/eR`, ranne `wL/wR: [taivutus, sivu]`, kädet `hL/hR`: `relax fist grip open claw point flat sign hid`
- jalat `lL/lR: [fleksio, abduktio, kierto]`, polvi `kL/kR`, nilkka `fL/fR`; olkapäät `shL/shR: [ylös, eteen]`
- IK: `ikHL/ikHR/ikFL/ikFR: [x,y,z]` (hahmon paikallinen) ohittaa FK:n
- miekka `sword: { hand:'R', dir:[x,y,z] (terän suunta hahmon avaruudessa), r: terän kierto, two: true (toinen käsi tarttuu kahvaan IK:lla), sheathed: true, noBlade, bladeLen }`, `sword2` (kaksoismiekat)
- `face: expr('angry', {...})` ilme, `sq` venytys

Kirjasto `POSES` (rig.js + shotkit.js): `idle stand relaxed guard ready crouch land jump tuck fall hurt hurtFwd block dodge run1 run2 dash shunpo drawWind slashWind slashDown slashSideWind slashSide slashUp thrustWind thrust punchWind punch kickWind kick throwWind throw charge powerUp roar float fly airSlash kneel slump armsCrossed sleevesHide point cast swordUp swordForward swordDown swordPlunge walk1 walk2`.

Signature-poset (`SIGNATURE[name]`): byakuya_point, byakuya_release (miekka pudotetaan), byakuya_senkei, byakuya_command, byakuya_after · toshiro_draw, toshiro_thrust, toshiro_sky, toshiro_bankai, toshiro_cast · kenpachi_shoulder, kenpachi_kendo, kenpachi_kendoStrike, kenpachi_open, kenpachi_lunge · kyoraku_hat, kyoraku_dual, kyoraku_spread, kyoraku_bankai, kyoraku_lean · tosen_ring, tosen_justice, tosen_benihiko, tosen_bankai · mayuri_hunch, mayuri_shikai, mayuri_bankai, mayuri_laugh.

Apufunktiot: `P(name, over)` = pose, `at(pos, yaw, pose)`, `K(keys)` = `poseKeys([[t, pose|nimi, ease], ...])` (ease koskee avaimeen päättyvää väliä: `lin smooth smoother out in inOut exp back snap hold step`), `mixPose(a, b, t)`, `breathe(p, t)`, `walkCycle(ph, over)`, `runCycle(ph, over)`, `hitStop(t, [[t0, dur]])` (iskun jäädytys hahmoille: `f.fig(F, { t: hitStop(lt, [[1.2, .1]]) })`), `lookAt(from, to)` → yaw.

**Sakuga-ohje:** iskut `timing: 1` ja `'snap'`-easing, anticipaatio ennen (wind-pose), overshoot (`'back'`), sitten pito. Normaali näyttely `timing: 2`. `fxSlashArc` piirtää smearin miekan oikeasta liikkeestä, `afterimages` antaa shunpo-jälkikuvat ja jousisimulaatio (hiukset, haori, hihat, huivi) reagoi liikkeeseen ja tuuleen (`wind`).

### Ilmeet (faces.js)
`expr(nimi, ohitukset)`: `calm bored angry rage smile smirk grin laugh shock surprised menace pain triumph tears determined focused eyesClosed shout`.
Kentät: `eye` (0..1.4), `lid` (+vihainen), `brow`, `browA`, `pupil`, `look:[x,y]`, `mouth` (`line smile smirk frown open shout grin teeth o pain laugh`), `mouthOpen`, `mouthW`, `blush`, `sweat`, `tears`, `vein`, `shadow` (uhkaava yläkasvovarjo), `glint`, `shock`, `closed`, `closedUp`.
Lähikuva syntyy viemällä kamera lähelle päätä (`figPos(F,t,'head')`). Pää vaihtaa LOD:ia automaattisesti (ripset, iiriksen kerrokset).

## 3. Kamera (camera.js)
Kameraobjekti: `{ pos, target, fov (pystysuunta, astetta), roll (dutch, rad), shift:[px,py], distort (tynnyrivääristymä), focus, aperture (rack focus / DOF), bgDepth }`.

- `camPath(keys)(lt)`: avaimet `{t, pos, target, fov, roll, ease, shift, focus, aperture, distort}` tai `{t, orbit: {c, r, az, el}, target?}` (orbit-avaimet interpoloidaan kaarena).
- `camLook(target, dist, az, el, fov, roll)`, `orbitPos({c,r,az,el})` (az 0 = kamera +z-puolella → näkee yaw 0 -hahmon edestä)
- `camHandheld(cam, t, amp, seed, rot)`, `camShake(cam, list, t)` / `f.shake`, `camWhip(cam, t, t0, t1, yaw, ease, into)` → `{cam, blur}` (käytä `f.motionBlur(blur)`), `camVertigo(cam, subject, widthUnits)` (dolly zoom).
- Crane = pos.y-avaimet, dolly = matka targettiin, rack focus = `focus`-avaimet + `aperture` (hahmot sumentuvat syvyyden mukaan).
- `project(p)` → `{x,y,z,s}` tai null, `proj2(p)`, `projPoly(pts)` (near-leikkaus), `projLine(pts)`, `camDepth(p)`, `pxScale(p)`, `toCam(p)`.

## 4. Lavasteet (world.js)
`f.bg({ set, pal, dmg, seed, ... })`. Lavasteet: `seireitei` (kadut, muurit, rakennukset, tornit, varjot), `rooftops` (kattokenttä, kamera ~9–13 m),
`courtyard` (haravoitu hiekka, muurit, kirsikkapuut), `wasteland` (hiekka, mesat, kivet), `ice` (jääkenttä, jääpiikit, heijastukset), `void`
(bankai-pimeys), `sky` (pelkkä taivas ilmataisteluihin). `dmg 0..3` = tuhon aste (kraatterit, rikotut muurit, savupylväät, reiät).
Paletit `PALETTES`: `day noon dusk night storm ice void red gloom` (taivas, sumu, aurinko, seinät, katot, pilvet…) tai oma objekti.
Apufunktiot: `drawSky, drawGround, drawPaving, drawBuilding, drawCrater, drawRock, drawIceSpike, drawSmokeColumn, drawTree, drawMesa, drawMountains`.
Etuala: `f.fg({ set, pal, zSplit })` piirtää lavasteen kohteet, jotka ovat lähempänä kuin `zSplit`.

## 5. Efektit (fx.js)
Sijainti voi olla maailmapiste `[x,y,z]` (projisoidaan, oikea syvyys ja koko) tai ruutupiste `{x,y}`. Aika `t` on efektin oma aika
(anna `lt - alku`). Negatiivinen tai kestoa suurempi aika ei piirrä mitään.

| funktio | kuvaus |
|---|---|
| `fxSpeedLines(g,t,{x,y,n,inner,col,w,alpha,hold})` | keskittävät linjat (ones-tahdissa) |
| `fxSpeedBG(g,t,{ang,col,col2,bg,n})` | rinnakkaiset nopeusviivat / speed background |
| `fxShockRing(g,c,t,{r,dur,w,up,col})` | laajeneva rengas maassa tai ilmassa |
| `fxAirRings(g,p,dir,t,{len,r,n})` | ilmanpainerenkaat iskun suuntaan |
| `fxExplosion(g,p,t,{size,pal,dur,n,ring,debris,kind})` | ääriviivallinen räjähdys, pal: `fire ice pink dark gold poison red dust` |
| `fxSmoke`, `fxDust`, `fxDebris(…{kind:'rock'|'glass'|'ice'|'petal'})`, `fxSparks`, `fxLightning(g,a,b,t)`, `fxRisingRocks`, `fxCracks` | savu, pöly, sirpaleet, kipinät, salamat, nousevat kivet, halkeamat |
| `fxAura(g,F,t,{col,col2,size,amt})` | reiatsu-liekit hahmon ympärillä (`layer:'under'`) |
| `fxPressure(g,c,t)`, `fxPillar(g,c,t,{h,r,col})` | reiatsu-paine (halkeamat, kivet, renkaat), energiapylväs taivaalle |
| `fxSlashArc(g,F,t,{span,col,edgeCol,sword2})` | miekan smear hahmon todellisesta liikkeestä |
| `fxGlowAt(g,p,r,col,a)` | hehku; jos `p` on maailmapiste, `r` on metreinä (kerrotaan projektion mittakaavalla) |
| `fxSlashMark(g,a,b,t)`, `fxClash(g,p,t)`, `fxShunpo(g,p,t)`, `fxImpactStar`, `fxFlashBurst`, `fxGlowAt` | viiltoviiva, terien yhteentörmäys, shunpo, tähtivälähdys |
| `fxKido(g,c,up,t,{r,col,points})`, `fxSealWave` | pyörivä kidō-taikapiiri 3D-tasossa kanjeineen, sinettiaalto |
| `fxPetals(g,t,{n,size,col,flow})` + `petalVortex/petalStream/petalSphere` | **Senbonzakura**: tuhansia 3D-terälehtiä (flow(i,u,t) → piste) |
| `fxPetalStream(g,t,{a,b,mid,w,arrive})`, `fxKageyoshi(g,t,{c,r,rows,per,h})` | terälehtivirta, Kageyoshi/Senkei-jättiterärivit |
| `fxIceDragon(g,t,{path,r,jaw,breath})` + `iceDragonPath(c,t,{dir,len,head,wave})` | **Hyōrinmaru**-jäälohikäärme (pää piirretään 2D:nä: profiili- tai etudesign näkymän mukaan) |
| `fxIceGrowth`, `fxFrost`, `fxSnow` | jääkiteet maasta, huurre, lumisade |
| `fxFlowerSwirl`, `fxShadowPool(g,c,t,{blade})`, `fxDrapes` | **Katen Kyōkotsu**: kukkapyörre, Kageoni-varjo ja terä, Karamatsu Shinjūn verhot |
| `fxSoundRings`, `fxBenihiko`, `fxEnmaRings`, `fxEnmaDome` | **Suzumushi**: ääniaallot, teräsarja, 10 kanjirengasta, musta kupoli |
| `fxPoison`, `fxKonjiki(g,t,{c,yaw,scale,rise,gas,mouth})` | **Ashisogi Jizō** -myrkky, **Konjiki**-jättitoukka (2D-piirretty 3D-ankkureille: viitta, vauvanpää, kädet, sädekehä ja 4 kelloa, rinnan terät) |
| `fxSkullAura`, `fxCrescent(g,c,dir,t)`, `fxGroundSplit(g,a,b,t)` | **Kenpachi**: pääkallo-reiatsu, jättiviiltoaalto, maan halkeama |

Hahmojen muotoihin kuuluvat lisäosat (Daiguren-siivet, valosiivet, hyönteissiivet, naamio, sarvet) piirtyvät automaattisesti muodon mukana.

## 6. Kuvaus ja kompositointi (post.js)
Kerrokset: bg → kontaktivarjot → fx under → hahmot (oma kerros, jota impact-framet käyttävät) → fx over → fg → glow (additiivinen) →
bloom + halation → grade → light leak / flare → **impact** → CA → motion blur → vinjetti → rae → flash → top-fx → teksti.
Valmiit presetit: `std(f, { pal, post: 'normal'|'hot'|'soft'|'dark', grade: {...}, postOver: {...} })`, `GRADES[pal]`, `POSTS`.
Efektivalo hahmoihin: `f.light({ fx: [{ p: [x,y,z], col: '#7fe8ff', r: 8, a: .6 }] })`. Reunavalo: `f.light({ rim: suunta, rimCol, rimAmt })`.

## 7. Impact framet (impact.js) – TÄRKEIN
`f.impact(seq, params)` korvaa tai käsittelee valmiin kuvan sekvenssin ajan. `params.t0` = paikallinen alkuaika. `seq` on rekisteröidyn
sekvenssin nimi, yksittäinen tyyli (`params.n` = framet) tai oma lista `[{ s: 'flash', n: 1 }, { s: 'invert', n: 2, p: {...} }]`.
`impactLen(seq)` palauttaa framet ja `impactActive(f, seq, t0)` kertoo, onko sekvenssi käynnissä (esim. tärinän pitoon).

**Tyylit (30)** ja niiden tärkeimmät parametrit (`at`/`x,y` = fokus kaikissa):

| tyyli | kuvaus | parametrit |
|---|---|---|
| `invert` | negatiivi + keskittävät viivat | `hue, contrast, sat, lines, lineCol` |
| `hatch` | manga: 3-sävykynnys, vinoviivoitus, rasteri, lineart, musteroiskeet | `paper, ink, t1, t2, splat, accent, figs` |
| `whiteout` | valkoinen jäädytys: hahmot mustana lineartina | `bg, ink, fill, fxCol, lines` |
| `blackaccent` | musta ruutu + yksi aksenttiväri (lineart, glow) | `accent, rim, lines` |
| `redblack` | punainen kenttä, mustat siluetit, roiskeet | `col, col2, sil, splat` |
| `chroma` | väriseparaatio + glitch-viipaleet | `d, slices` |
| `kanji` | jättikanjin slam, tummennettu kuva | `char, col, col2, outline, tint, size, rot, sub` |
| `shatter` | ruutu särkyy siruiksi fokuksesta | `rays, push, gap, edge` |
| `panels` | manga-paneelit (zoom / negatiivi / alkuperäinen) | `modes: ['zoom','zoom2','neg','mono','orig'], zoom, slant` |
| `flash` / `black` | 1-framen valkoinen / musta | `col` |
| `overexpose` | ylivalotus + kontrasti + bloom | `b, c, s, col` |
| `radial` | zoom-blur + linjat + shokkirenkaat | `zoom, lines, lineCol, ringCol` |
| `lens` | äärimmäinen kalansilmä/perspektiivi | `k` |
| `closeup` | äärimmäinen lähikuva-insertti (silmä, suu, kasvot, käsi, terä) | `fig, part, strip, stripH, dist, side, mode:'invert'` |
| `desat` | värit pois (glow säilyy, aksentti) | `accent, c, b` |
| `rimsil` | gradientti + mustat siluetit valkoisella reunalla | `col, col2, rimCol, sil` |
| `duotone`, `posterize` | kaksi- tai monisävyposterisointi | `dark, light, th` / `cols` |
| `ink` | käänteinen lineart: musta tyhjyys, valkoiset viivat (Enma Kōrogi) | `col, bg, lines` |
| `sumi` | sumi-e: harmaa paperi, märkä musteensiluetti, siveltimenvedot liikkeen suuntaan | `paper, ink, strokes, ang` |
| `tear` | kuva repeää mustiksi paperisuikaleiksi, välissä valoa | `strips, light, dark` |
| `kabuki` | litteä mäntymaalaus (kulta, vihreä), hahmot paperinukkeina | `gold, seed` |
| `waterink` | syvänsininen mustepesu ja kuplat | `col` |
| `crimsonline` | valkoinen ruutu, jonka halki yksi karmiininpunainen viiva | `col, bg, ang, w` |
| `dualsplit` | kuva jaettu kahteen väripuoliskoon, hahmot negatiivina | `col, col2, ang` |
| `crystal` | sininen negatiivi, jääfasetit ja murtumaviivat | `tint, seed` |
| `toxic` | happovihreä/violetti väri, kromaattinen hajonta, vääristynyt vinjetti | `col, col2` |
| `rings` | samankeskiset shokki- tai ääni-renkaat tummennetun kuvan päällä | `col` |
| `speedburst` | mustavalkoinen keskittävien viivojen räjähdys ja siluetit | `bg` |

**Sekvenssit (`IMPACT_SEQ`)**, yleiset: `hit, hit_light, hit_heavy, clash, block, explosion, transform, finale, stagger, freeze, eye_flash`.
Signature (4 per hahmo, yhteensä 24):
- Byakuya: `byakuya_scatter, byakuya_kageyoshi, byakuya_senkei, byakuya_shukei`
- Hitsugaya: `toshiro_dragon, toshiro_freeze, toshiro_bankai, toshiro_hyoten`
- Kenpachi: `kenpachi_slash, kenpachi_kendo, kenpachi_patch, kenpachi_bankai`
- Kyōraku: `kyoraku_kageoni, kyoraku_takaoni, kyoraku_irooni, kyoraku_karamatsu`
- Tōsen: `tosen_suzumushi, tosen_benihiko, tosen_enma, tosen_grillo`
- Mayuri: `mayuri_paralyze, mayuri_konjiki, mayuri_poison, mayuri_grin`

**Esituotannon tyylinimet (pre/shots.json) toimivat suoraan sekvensseinä:** `WHITE_NEG, MANGA_HALFTONE, CHROMA_SPLIT, RED_BLACK, SAKURA_PINK, SUMI_INK, ICE_CRYSTAL, SPEEDLINE_BURST, DUAL_TONE, MANGA_RED, GLASS_SHATTER, VOID_LINEART, PAPER_TEAR, EYE_ORANGE, SAKURA_NEG, ICE_WINGS, ICE_SHIELD_RINGS, INK_PETAL, TOXIC, RED_BLACK_SPLIT, SCREAM_WAVE, KABUKI_BOARD, WATER_INK, CRIMSON_WHITE, SILHOUETTE_ORANGE, TOXIC_SPLASH, SENKEI_LIGHTS`. Framemäärä vastaa shot-listan `frames`-kenttää. Esim. `f.impact('WHITE_NEG', { t0: 20.0 - S.t0 })`. Finaalin `FIN-*`-sarjat rakennetaan finaalishotissa tyyleistä (spoileri).

Graafisissa tyyleissä (hatch, whiteout, redblack, ink, kanji, sumi, …) on paperitekstuuri, ja hahmojen lineart piirretään hand2d-tyylillä (painotettu, elävä viiva).

Suositus: impactin ajaksi `f.shake([[t0, 25, .5]])`, `hitStop`, ja ääniagentille `sfx(T0 + t0, 'impact', {seq})`. Isoissa iskuissa
kannattaa yhdistää 2 sekvenssiä peräkkäin eri shoteissa (esim. `clash` → leikkaus → `hit_heavy`).

## 8. Tekstit (text.js)
`attackTitle(g, lt, { t0, dur, text, sub (kanji), small, x, y, align, size, col, col2, edge, glow, skew })` slam-in, pito ja liuku ulos.
`kanjiColumn(g, lt, { text, x, y, size, col, alpha })`, `subtitle(g, text, { who, size, a })`. Ei "ANIME SHOWDOWN" -tekstiä eikä loppukorttia.

## 9. Renderöinti
```bash
cd engine
node render.js stills  reel/testreel /tmp/st 1.0,2.5 0.5        # PNG-stillit
node render.js sheet   reel/testreel /tmp/s.png 0 36 36 0.3 6   # kontaktiarkki (tai list:t1,t2,...)
node render.js preview reel/testreel /tmp/prev.mp4 0.5          # nopea esikatselu
./make.sh shots/main ../audio/mix.wav ../showdown.mp4           # täysi build (12 s segmentit, nproc workeria, resume)
node render.js redo shots/main /tmp/bleach_build_shots_main 3,4 # vain muuttuneet segmentit uudelleen
node render.js events shots/main /tmp/events.json               # kesto, shotit ja sfx-markkerit ääniagentille
./make_sheets.sh ../docs/sheets                                 # mallilehdet
```
Nopeus tällä koneella: noin 0,2–0,4 s/frame 960×540-koossa ja 0,6–1,5 s/frame 1080p:ssä, 4 workeria rinnakkain. 36 s esikatselu
puolikoossa valmistui alle minuutissa. `frameKey` uudelleenkäyttää identtiset framet (pidot, twos-shotit).

## 10. Laboratorio
`node lab.js out.png @koodi.js [w h]` ajaa koodin sivulla, jossa kaikki moduulit on ladattu (`ctx` = canvas). Apufunktiot `tiles` ja
`tilesS` (ruudukko, jossa koko kuva on skaalattu) sekä `modelSheet(ctx, nimi, muoto)` / `formsSheet(ctx, nimi)` (sheets.js).

## 11. Death Battle -laajennus (E1): hahmot, efektit, lavasteet, poset, impact, kamera
Kaikki alla oleva ladataan automaattisesti (luku 0b). Mallilehdet: `docs/sheets/<hahmo>_model.png`, `_forms.png`, `_poses.png`,
`_<muoto>_hand2d.png`. Kontaktiarkit: `docs/contact/e1_reel_sheet.png`, `e1_fx_library.png`, `e1_sets.png`, `e1_poses_death_air.png`.
Esimerkit: `engine/reel/e1reel.js` (24 s testireeli) ja `engine/reel/fxlab_e1.js` (yksi shotti per efekti).

### 11.1 Hahmot (`CAST`) ja muodot
| nimi | muodot | tunnusmerkit / huom. |
|---|---|---|
| `urahara` (chars_bleach.js) | `base` (keppi), `shikai` (Benihime, koukkukärki, punainen tupsu), `bankai` (+ `fxBenihimeDoll`), `wounded` | raidallinen bucket-hattu, musta haori valkoisin timantein, geta |
| `rengoku` (chars_ds.js) | `base` (miekka huotrassa lantiolla, kunnes pose vetää sen), `flame` (tuli terällä), `ninth` (+ liekkiaura), `wounded` (vasen silmä murskattu, veri) | liekkihaori, keltaiset hiukset punaisin kärjin, haarautuvat kulmat, kulta-punaiset silmät, liekkitsuba, 惡鬼滅殺 lähikuvassa |
| `akaza` (chars_ds.js) | `base`, `compass` (kompassi jalkojen alla, suonet), `battle` (suonet), `regen` (revitty haori, veri), `crumble` (tuhkahiutaleet) | siniset tatuointiviivat koko keholla, sininen sklera + 上弦/参 iiriksissä (lähikuva), siniset sormet, oranssit kynnet, helminilkkarenkaat |
| `deku` (chars_mha.js) | `base` (Gamma-asu), `fullcowl` (vihreät salamat + hehkuviivat), `max` (100 %: raskaat salamat, hehkuvat silmät, punaiset suonet), `blackwhip`, `epsilon` (tumma riekaleinen asu, punaiset Mid-Gauntletit, viitta), `wounded` | pisamat, rautapohjaiset punaiset saappaat, polvisuojat, sininen raita hihansuissa |
| `shigaraki` (chars_mha.js) | `base` (14 kättä + "Father" kasvoilla), `unmasked`, `plain`, `final` (harmaanvalkea tukka, käsi kaulassa, tummat AFO-halkeamat), `awakened` (käsi kasvoilla, mustat siivet, hehkuvat halkeamat), `afo` (valkoiset silmät, siivet, sormimassa vasemmassa kädessä, Rivet Stab -lonkerot), `crumble` | punaiset pienet iirikset, rypyt silmien ympärillä, arvet, punaiset lenkkarit |
Kaikilla: `wounds` 0..3 (muodossa tai posessa `pose.wounds`) piirtää verijuovat kasvoille ja viillot vartaloon.

**Uudet design-kentät (body.js/faces.js, kaikkien käytössä):** `hakama.len` (housut polven alle käärittyinä, paljas sääri), `hakama.lowerCol/lowerV/lowerPattern`
(säärisuojat), `hakama.pleats:false`, `feet.shaft/shaftCol/shaftR` (saapasvarsi), `feet.soleCol/soleH/soleLine` (paksu pohja), `fingerCol`, `nailCol`,
`haori.capLen/capR` (pitkät leveät haorihihat), `haori.flames {col,col2,col3,h,n}` (liekkihelma), `haori.squares`, `haori.flare`, `eye.irisRing`,
`eye.irisKanji ['oikea','vasen']`, `eye.noPupil`, `brow.browFork`, `brow.browCol`, lock `tipCol/tipLen` (hiusten kärkiväri). Uusia käsimuotoja:
`spread`, `hook`, `chop`. Apufunktiot (`chars_00_common.js`): `torsoLines`, `limbRing`, `limbLine`, `hipSheath`, `stuckHand`, `woundParts`, `cowlArcs`.

### 11.2 Signature-poset (`SIGNATURE[nimi]`)
- Rengoku: `rengoku_stance, rengoku_unknowingWind, rengoku_unknowing, rengoku_rising, rengoku_tigerWind, rengoku_tiger, rengoku_ninthWind, rengoku_ninth, rengoku_blazing, rengoku_heart, rengoku_arms, rengoku_last`
- Akaza: `akaza_stance, akaza_compass, akaza_punchWind, akaza_punch, akaza_air, akaza_kickWind, akaza_kick, akaza_annihWind, akaza_annih, akaza_grin, akaza_offer, akaza_regen`
- Deku: `deku_ready, deku_detroitWind, deku_detroit, deku_delaware, deku_shootWind, deku_shoot, deku_manchesterWind, deku_manchester (ilmassa), deku_float, deku_whip, deku_max, deku_smile`
- Shigaraki: `shig_slouch, shig_reach, shig_touchGround, shig_scratch, shig_laugh, shig_grab, shig_afo`
- Urahara: `urahara_fan, urahara_cane, urahara_draw, urahara_sing, urahara_shield, urahara_bankai, urahara_kido`

### 11.3 Yleinen sakuga- ja kuolemanposekirjasto (poses_core.js, `POSE_GROUPS`)
`fist`: f_guard f_jab f_cross f_hookWind f_hook f_uppercutWind f_uppercut f_elbow f_knee f_roundWind f_roundhouse f_spinBack f_axeWind f_axe f_palm f_headbutt f_grapple f_rush1 f_rush2 (+ `rushPunch(ph)` nopeille sarjoille) ·
`sword`: s_iai s_iaiCut s_overheadWind s_overhead s_diagWind s_diag s_backhand s_lunge s_parry s_crossGuard s_spinCut s_upperCut s_reverseGrip s_sheathe s_bladeRest ·
`air`: a_leap a_dive a_flip a_spinKick a_airPunch a_hover a_fallBack a_slamDown a_glide a_superman ·
`hit`: t_grabWind t_throw t_hurled t_hitHead t_hitBody t_hitBack t_doubleOver t_knockback t_skid t_wallHit t_getUp t_kneelPant t_staggerL t_staggerR ·
`death`: death_fallBack death_fallFwd death_kneel death_slump death_sprawl death_face death_side death_impaled death_reach death_standing death_air death_split death_crumble.
Makaavat poset käyttävät `ground: 'all'` (koko keho lepää maassa, `rest` = paksuus), anna vain `pos` ja `yaw`.

### 11.4 Efektit
**Flame Breathing (fx_ds.js):** `fxFlameTrail(g,F,t,{span,w})`, `fxFlameBurst(g,p,t,{size})`, `fxUnknowingFire(g,a,b,t,{w,dur})` 壱ノ型,
`fxRisingSun(g,c,t,{r,yaw})` 弐ノ型, `fxBlazingUniverse(g,c,t,{r,yaw})` 参ノ型, `fxFlameUndulation(g,c,t,{r})` 肆ノ型, `fxFlameTiger(g,p,dir,t,{scale,travel})` 伍ノ型,
`fxRengokuNinth(g,a,b,t,{r})` 玖ノ型, `fxEmbers(g,t,{n,c,r,h})`; primitiivit `fireRibbon(g,pts,w,t,o)`, `flameTongue(...)`, `arcPts(...)`.
**Destructive Death:** `fxCompass(g,c,t,{r,rot,alpha})` (羅針, numerot 一..十二, punaisesta siniseen), `fxAirType(g,p,dir,t,{n,len})`, `fxRanshiki(g,p,dir,t)`,
`fxAnnihilation(g,p,dir,t,{size})`, `fxBlueSilver(g,c,t,{r})` (終式), `fxAshDrift(g,c,t)`.
**One For All / Decay / AFO (fx_mha.js):** `fxDetroitSmash(g,p,dir,t,{pct: 5..100})`, `fxDelaware`, `fxManchester(g,c,t)`, `fxStLouis`, `fxBlackwhip(g,a,b,t,{grab})`,
`fxGreenArcs(g,c,t)`, `fxDecay(g,c,t,{r,dur})`, `fxDecayWave(g,c,t,{R,speed})`, `fxDecayBody(g,F,ft,t,{from})`, `fxAFOTendrils(g,a,t,{dir,len})`, `fxAirCannon`,
`fxLimbSmear(g,F,t,{joint:'handR'|'toeR',...})` (yleinen raajan smear-kaari).
**Urahara (chars_bleach.js):** `fxNakeBenihime(g,p,dir,t)`, `fxBloodMistShield(g,c,n,t,{crack})`, `fxShibari(g,a,b,t)`, `fxRikujokoro(g,c,t)`, `fxBenihimeDoll(g,base,yaw,t,{scale})` (piirrä `layer:'under'`, jotta Urahara jää eteen).
**Veri ja kuolema (fx_blood.js, stilisoitu: litteä karmiini + tumma ääriviiva):** `fxBloodSpray(g,p,dir,t,{n,speed,size})`, `fxBloodArc(g,a,b,t)`, `fxBloodSplat(g,c,t,{r})`,
`fxBloodMist`, `fxBloodDrip`, `fxCutFlash(g,a,b,t)`, `fxSplitFig(g,F,ft,t,{ang,gap})` (repeäminen kahtia), `fxDisintegrate(g,F,ft,t,{from,dur})` (tuhkaksi),
`fxDecayBody` (murenee pölyksi), `fxSilhouetteDeath(g,F,ft,t,{col,bg})`. Kuolemaefektit piirtävät hahmon itse: käytä `f.fig(F,{hidden:true})` tai jätä `f.fig` pois ja kutsu efektiä `layer:'over'`.

### 11.5 Impact-tyylit ja -sekvenssit (impact_e1.js)
Tyylit: `flame`, `compassneg`, `greenbolt`, `decay`, `bloodsplit`, `silhouette`, `ash`, `sunrise`.
Sekvenssit: `rengoku_unknowing rengoku_tiger rengoku_ninth rengoku_rising rengoku_heart · akaza_compass akaza_air akaza_annihilation akaza_bluesilver akaza_grin ·
deku_detroit deku_100 deku_delaware deku_manchester deku_blackwhip deku_eye · shigaraki_decay shigaraki_wave shigaraki_afo shigaraki_grin ·
urahara_sing urahara_bankai urahara_shield · death_blood death_silhouette death_ash death_split death_decay final_dawn`.

### 11.6 Lavasteet (sets_a.js) – oletuspaletti suluissa
`mugen` (predawn) Mugen-junan romu, pelto ja setrimetsä · `nexus` (eternal) viiden maailman areena + jähmettynyt aurinko horisontissa ·
`jaku` (dust) Decay-aallon murentama kaupunki · `forest` (mist) usvainen setrimetsä kuussa · `nightstreet` (lantern) Taishō-katu lyhtyineen ·
`stage` (stage) Karamatsu Shinjū -kabukinäyttämö · `underwater` (deep) · `cliff` (dawn) rantakallio ja meri, `sunUp` nostaa aurinkoa ·
`skyhigh` (highsky) pilvimeri. `SETS[nimi].pal` = oletuspaletti (drawSet käyttää sitä, jos `pal` puuttuu). Apurit: `drawCedar drawHighrise drawTrainCar drawRails
drawLantern drawFireTower drawSpire drawSunDisk drawMoon drawCloudSea drawGrass drawRubble drawItems`. Etuala: `f.fg({ set, zSplit })`.
E2:n lavasteet (sets_b.js): `asakusa volcano joker_table adolla clover_castle gate crater` (ks. E2:n dokumentaatio).

### 11.7 Kamera-apurit (shotkit.js)
`camFollow(F,t,{joint,dist,az,el,fov,lag,lead,world})`, `camTwoShot(A,B,t,{az,el,pad,fov,bias})`, `camHero(F,t,{dist,az,fov})` (matala sankarikulma),
`camOrbitAround(c,t,{r,az0,speed,el})`, `camImpactKick(cam,t,t0,{fov,roll,dur})` (FOV-punch iskussa), `camPushIn(cam,t,t0,t1,k)`, `camRack(cam,A,B,t,t0,t1)` (tarkennuksen siirto).

### 11.8 Suorituskyky
hand2d-lähikuvat ~35–40 % nopeampia: maalauspassin siveltimenvedot piirretään väriryhmittäin yhdellä Path2D-täytöllä ja pehmeä pesu puolessa
resoluutiossa, kromaattinen aberraatio ilman ylimääräistä kopiota. 1080p: action3d ~0,8–0,9 s/frame, hand2d ~0,9–1,2 s/frame (4 ydintä).
`render.js sheet` tekee kontaktiarkin PIL:llä (ffmpeg-tile ei toiminut list-tilassa).

### 11.9 Rekvisiitta ja cameot (fx_cameo.js) + showdown/common.js
`drawCard3D(g, c, {yaw,pitch,roll,size,face:'back'|'joker'|'hats'|'bowler'|'lion'|'flame'|'ofa'|fn,lit})`, `fxCardFlip(g,t,{face,dur,size})` (ruudun täyttävä kortinkäännös),
`drawCat(g,p,{pose:'sit'|'walk',t,size,flip})` (CAM_CAT), `drawTalisman(g,p,{size,glow})` (PROP_TALISMAN 紅), `fxVestige(g,F,ft,{col,alpha,glow})` (läpikuultava hehkuva siluetti).
Shakki-ohjelman apurit (`showdown/common.js`): `shotT(id, fn, opts)`, `CH(koodi, muoto, keys, opts)`, `BGX(f, koodi, {set,pal,stdOpt,bg})`, `fitSeq(tyyli, frames)`,
`impactAtT(f, seq, T)`, `LT(f, T)`, `faceCam(F, t, o)`. Shigarakille lisätty muoto `winged` (final + mustat siivet, käsi kaulassa).
**Split screen:** `f.split({ ang: .14, x: .5, gap: 12, col })` – shot-funktio ajetaan kahdesti (`f.panel` 0/1), kumpikin paneeli voi asettaa oman kameran (käytä `shift` keskittämiseen). Esimerkki: `showdown/part1.js` A40.

## 12. Shinji / Aizen / Dazai (agentti E, tämä projekti)
Kaikki ladataan automaattisesti (luku 0b): `engine/chars_sad.js`, `fx_sad.js`, `sets_sad.js`, `impact_sad.js` + ydinlisäykset (alla).
Mallilehdet: `docs/sheets/<hahmo>_model.png`, `_forms.png`, `_poses.png`, `_<muoto>_hand2d.png`. Kontaktiarkit: `docs/contact/sad_*.png`.
Esimerkit: `engine/reel/sadreel.js` (27 s testireeli), `reel/sadlab.js` (yksi shotti per lavaste/efekti), `reel/sadimpact.js` (kaikki impact-sarjat).

### 12.1 Hahmot (`CAST`), koodit shots.jsonissa SHN / AIZ / DAZ
| nimi | muodot | huom. |
|---|---|---|
| `shinji` | `base` (miekka tupessa), `shikai` (Sakanade: rengasponsi, 5 reikää, vino kärki, kahvasuojan jatke), `mask` (shikai + Hollow-naamio, musta sklera + harmaa/keltahehkuinen iiris, huppu), `bankai` (rengaskärki; pose `flower` piirtää kukan), `half_mask`, `wounded`, `masked_wounded`, `captain_long` (110 v. sitten: pitkä tukka) | suora vaalea polkka (vasen etuhius pidempi), ylähammasrivi näkyy aina (`teethAlways`), haori 五, navy solmio |
| `aizen` | `base` (Arrancar: pystykaulus, pinkki vyö + hopealevy, Kyōka Suigetsu: kultainen kuusikulmatsuba, vihreä punos, musta tuppi), `captain` (lasit, verhotukka, haori 五), `lieutenant` (lasit, ei haoria, käsivarsimerkki), `hogyoku` (1. fuusio, pallo rinnassa), `hogyoku_creep`, `chrysalis` (valkoinen kotelo, violetit silmät, 4 liepeitä), `third`, `butterfly`, `final`, `wounded` | taakse kammattu + yksi suortuva; Hōgyoku sykkii (violettimusta + liikkuva valo) |
| `dazai` | `base` (trenssi auki + vyön päät, musta liivi, sininen raitapaita, bolo-solmio turkoosi), `gun` (pistooli esillä), `nocoat`, `mafia` (musta takki, side oikealla silmällä), `wounded` | siteet kaulassa ja ranteissa, kädet taskuissa = `hL/hR: 'hid'` |

**Uudet pose-kentät (interpoloituvat):** `maskK` 0..1 (Shinjin naamion muodostuminen raapaisusta: valuva valkoinen massa oikealta vasemmalle), `maskCrack` 0..1, `maskCrumble` 0..1, `maskHalf` 1 · `sword.ringSpin: true` (Sakanade roikkuu renkaastaan etusormessa; animoi `sword.dir`-avaimilla, ks. `SH_REL` sadreel.js) · `gun` 0/1 + `gunHand` (Dazai) · `glasses:false` (Aizen) · `creep` 0..1 (Hōgyokun valkoinen massa vartalolle ja puolille kasvoille) · `flower` (Shinji bankai) · `wounds` 0..3 (kaikilla).
**Signature-poset** (`SIGNATURE[nimi]`): Shinji `shinji_slouch shinji_shoulder shinji_swipe shinji_draw shinji_taore shinji_spin shinji_slash shinji_mask shinji_cero shinji_upside shinji_bankai` ·
Aizen `aizen_stand aizen_bow aizen_handshake aizen_palmUp aizen_kneelPolite aizen_hair aizen_draw aizen_point aizen_shatter aizen_block (sormitorjunta) aizen_kido aizen_slash aizen_float aizen_laugh` ·
Dazai `dazai_pockets dazai_floatWater (käytä nocoat-muotoa) dazai_bow dazai_palmChest dazai_smileClosed dazai_blank dazai_stairs dazai_touch dazai_aim dazai_aimTwo dazai_wave dazai_lean dazai_dodge dazai_grabWrist dazai_dark`.
Uudet yleiset poset (poses_core.js): `t_coughBlood t_clutchChest t_impaledFront death_leanSword death_floatBack`.

### 12.2 Efektit (fx_sad.js)
`t` = efektin oma aika (`lt - alku`). Paikka maailmapiste tai `{x,y}`.
- **Ruutuprosessit** (rekisteröityvät framelle, ajetaan gradingin jälkeen ja ennen impactia; kutsu shotissa ilman `f.fx`):
  `fxSakanadeWorld(f, t, {dur, flip 0..1, neg, mirror, mist, wobble, zoom})` = koko kuva kiertyy 180° (taivas alas), negatiivi, peilatut linjat, pinkki usva ·
  `fxKyokaMirror(f, t, {at, reveal:'void'|'white'|'neg'|väri, hold, breakDur, n, gravity})` = kuva halkeaa peilisiruiksi, jotka putoavat ·
  `sadNullify(f, t, {at, r | r1, dur, feather})` = No Longer Human: ruutuprosessit (esim. käänteinen maailma) peruuntuvat ympyrän sisällä, reunalla rengas + 人間失格.
  Yleinen ydinhook: `f.screen(fn(comp, g, f, t))`, `f.nullify({at, r})`.
- **Shinji:** `fxSakanadeMist(g, src|F, t, {r, n, life, swirl, size})` (F = viidestä reiästä), `fxRingSpin(g, F, t, {speed})`, `fxSakanadeFlower(g, base, t, {open 0 nuppu..1 auki, scale, mist, behind})`,
  `fxShinjiHollow(g, F, t)` (luusirpaleet + musta/keltainen reiatsu, `layer:'under'`), `fxShinjiCero(g, a, dir, t, {charge, len, spread})`, `fxSenjuKoten(g, c, b, t, {n, r})` (Hadō #91).
- **Aizen:** `fxKyokaRelease(g, F, t)` (kuu + kukka terässä), `fxKyokaIllusion(g, F, ft, t)` (illuusiokaksoinen särkyy lasina; piirrä f.figin sijaan), `fxShimmer(g, c, t)`,
  `fxKurohitsugi(g, c, t, {size:[w,h,d], assemble, shatter, spears, scriptShatter})`, `fxKidoScript(g, c, t, {r, up, text, shatter})`, `fxDanku(g, c, n, t)`, `fxByakurai(g, a, b, t)`,
  `fxHogyoku(g, c, t, {mode:'orb'|'fuse'|'pillar'})`, `fxHogyokuCocoon(g, F, ft, t)`, `fxAizenAura(g, F, t, {amt})`, `fxAizenPressure(g, c, t)`, `fxAizenFinal(g, c, t)`, `fxFragor(g, a, b, t)`.
- **Dazai:** `fxNoLongerHuman(g, p, t, {r})`, `fxSnuff(g, p, t)` (efekti sammuu kuin kynttilä), `fxKidoShatter(g, c, t)` (kidō-kirjoitus sirpaloituu), `fxDazaiGun(g, F, t, {to})`, `sadGunMuzzle(F, t)`,
  `fxRicochet(g, p, t)` (kilahdus), `fxPageTurn(g, t, {dur, text})` (sivunkäännös, `layer:'top'`).
- Veri ja kuolemat: fx_blood.js (luku 11.4).

### 12.3 Lavasteet (sets_sad.js) ja shots.jsonin taustakoodit (`BGX(f, koodi)` showdown/common.js)
| koodi | set + paletti | sisältö |
|---|---|---|
| `CANAL` | `canal` / `canal` | kanava: kiviportaat veteen, punatiilimakasiinit, kaasulyhdyt, vesikuu |
| `CANAL_UW` | `canal {under:true}` / `underwater_canal` | kuu pinnan läpi, valosäteet, kuplat |
| `HARBOR` | `yokohama` / `harbor_teal` (myös `harbor`) | laituri, nosturit, kontit, lyhtypylväät, Minato Mirai (torni, purjehotelli, Cosmo Clock), heijastukset |
| `INVERTED` | `sakasama {base:'yokohama'}` / `inverted` | satama peilattuna: taivas alhaalla, kaupunki ylhäällä, lasilattia, pinkki usva (`flip` 0..1). Ilman `base`: geneerinen käänteinen kaupunki |
| `BANKAI` | `yokohama` + `fxSakanadeFlower` taustalla + pinkki usva | `BGX(f,'BANKAI',{flowerAt, flowerOpen, flowerScale})` |
| `MIRROR` | `mirror` / `mirror` | vesipeili, kuu ja heijastus, leijuvat peilisirut, väreily (`crack`) |
| `PAST` | `past` / `past` (`{forest:true}` = Hollowfikaation metsä) | 5. divisioonan kasarmi: puulattia, shoji, lyhdyt, gramofoni |
| `LUPIN` | `lupin` / `lupin` (sepia grade) | kellaribaari: tiski, pullohyllyt, lamppu, levysoitin, `glasses` (3) |
| `LASNOCHES` | `lasnoches` / `hueco` | valkoiset dyynit, sirppikuu, Las Nochesin kupoli ja tornit, kvartsipuut |
| `VOID` | `void` | musta tyhjyys |
| (muut) | `dojo` (dojo/kirjasto), `arena` ({from, surf:'stone'|'sand'|'mirror'|'black'|'water', phase}), `seireitei` + `seirei_night` | |
Kaikilla `SETS[nimi].pal`, `GRADES[pal]`; kirkkaille paleteille (hueco, mirror) `std()` laskee bloomia automaattisesti (`SAD_PALPOST`).

### 12.4 Impact-tyylit ja -sarjat (impact_sad.js)
Tyylit: `sakasama mirrorshard pagewhite coffin coffinBox violetpulse violetRings cerogold ceroLine hollowbone hollowEye muzzle gunFlash pinkmist mirrorsplit invertFlip
goldFlower bandage friendFoe nlhRing nlhShatter mirrorShatterPre hogyokuPulse hogyokuCrack`.
**Esituotannon nimet (shots.json / impact_requests.md) toimivat suoraan:** `MIRROR_SHATTER INVERT_FLIP NLH_PAGE NLH_RING NLH_SHATTER HOLLOW_EYE CERO_LINE VIOLET_PRESSURE KUROHITSUGI_BOX
GOLD_FLOWER GUN_FLASH FRIEND_FOE BANDAGE_WRAP RIMSIL CLOSEUP_PANELS HOGYOKU_PULSE HOGYOKU_CRACK` + vanhat (luku 7). `X-*` (maskatut) rakennetaan finaalishoteissa.
Hahmosarjat: `shinji_taore shinji_inverted shinji_mask shinji_cero shinji_bankai shinji_senju aizen_kyoka aizen_shatter aizen_kurohitsugi aizen_hogyoku aizen_pressure aizen_chrysalis aizen_finger
dazai_touch dazai_nullify dazai_gun dazai_page clash_sad death_sad`.

### 12.5 Kamera ja yleislaatu
- `camGroup(figs, t, {az, el, fov, fill (.62), lead, joints, minDist})` (shotkit.js): kehystää yhden tai useamman hahmon niin, että ryhmä täyttää `fill`-osuuden ruudusta
  (korkeus ja leveys huomioiden). **Käytä laajoissa kuvissa**, niin hahmot eivät jää pelimäisen pieniksi: `f.cam(camHandheld(camGroup([A,B], lt, {az:.3, fill:.7}), lt, .006))`.
- Pienet päät (pxR < 42 px): silmät suurenevat automaattisesti (max +28 %) ja viivat paksunevat, joten kasvot pysyvät luettavina.
- faces.js: `face.noMouth`, `face.noNose`; body.js: `haori.slits` (liepeet); timeline/post: `f.screen`, `f.nullify`.
- Shottien tyyli: iskut `timing: 1` + `'snap'`, hitStop iskussa, `camImpactKick`, `afterimages` shunpoon. Close-upeissa `closeCam(F, t, {part:'face'|'bust'|'hands'|'hand', az, el, dist})` + `f.style('hand2d')`.

### 12.6 Myöhemmät lisäykset (osa 1)
- Leveät kimonohihat liukuvat kyynärpäätä kohti, kun käsivarsi nousee (body.js `sleeveSurf`), joten nostetut kädet eivät enää jätä mustia hihamöykkyjä.
- `f.prop(z, fn)`: z voi olla maailmapiste `[x,y,z]`; syvyys lasketaan lopullisella kameralla (propin voi lisätä ennen `f.cam`ia).
- Vesiefektit (fx_sad.js): `fxWaterSplash(g, p, t, {h, r, dur})`, `fxWaterWall(g, a, b, t, {h})`, `fxWaterTrail(g, a, b, t, {dur, life})` (shunpo veden pinnalla), `fxBubbles(g, p, t, {n, rise})`.
- `yokohama`: `moonDir`, `moonR`, `wheelFall` 0..1 (Cosmo Clock kaatuu). Istumaposet: `dazai_sit`, `dazai_sitShake`, `aizen_sitPolite`, `aizen_sitOffer` (anna `pos` y = reunan korkeus − 0.5, `ground:false`).
- Hiukset: Shinjin polkka ja Aizenin takatukka on tehty useammasta ja kapeammasta suortuvasta, joten ne ovat pehmeämmät ja vähemmän kulmikkaat. Makasiineissa on kaarevat ikkunat, kivinauhat ja tiilirivit.
- Lopullinen toimitus 1280x720: ks. showdown/README.md (`./make.sh all DIR 0.6667 2` + `./make.sh final DIR`).
- Esimerkki koko osasta: `showdown/part1.js` (76 shottia; apurit `IMP`, `gcam`, `ccam`, `pW`/`pG`/`pY`, `CBOX`).

## 13. Gowther / Dazai / Urahara (agentti E, tämä projekti: GOWTHER vs DAZAI vs URAHARA)
Kaikki ladataan automaattisesti (luku 0b): `engine/chars_gow.js`, `chars_zz_gdu.js` (Dazai/Urahara-päivitykset), `fx_gow.js`, `fx_gow2.js`, `sets_gow.js`, `sets_gow2.js`,
`impact_gow.js`, `poses_gdu.js` + ydinlisäykset (13.7). Showdown-apurit: `showdown/common.js` + README. Mallilehdet: `docs/sheets/` (gowther_*, dazai_*, urahara_*),
kontaktiarkit `docs/contact/gdu_*.png`. Esimerkit: `engine/reel/gdureel.js` (testireeli), `reel/gowlab.js` + `reel/gowlab2.js` (yksi shotti per lavaste/efekti), `reel/gowimpact.js`.

### 13.1 Hahmot (`CAST`), koodit shots.jsonissa GOW / DAZ / URA (+ cameot SHN, AIZ; CAT = `drawCat`, BENI = `fxBenihimeDoll`)
| nimi | muodot | huom. |
|---|---|---|
| `gowther` | `base` (valkoinen paita + korkea kaulus, harmaat hihat, musta napapaita, paljas keskivartalo, tummat housut, harmaat nilkkasaappaat, vaaleat lasit), `herritt` (jouset esillä), `doll` (paita/hihat pois: posliiniset pallonivelet, saumat, halkeamat), `mind` (sisäinen minä: laventeli monokromi, pinkit rengassilmät ilman pupillia, leijuva tukka, pitkä halkiopaita, ei laseja), `proxy` (mustat demonisilmät), `noglasses`, `wounded` (halkeamat, särkynyt linssi) | 175 cm, kuumanpinkki polkka leuan alle, keltaiset silmät, vuohisymboli oikealla rinnassa. Oletusilme `blank` |
| `dazai` | `base`, `gun`, `nocoat`, `mafia`, `wounded` (12.1) + **`wet`** (sade: litteämpi tumma tukka, pisarat, tummempi trenssi), **`wet_nocoat`** | kädet taskuissa `hL/hR:'hid'` |
| `urahara` | `base` (keppi), `shikai`, `bankai`, `wounded` + **`captain`** (110 v. sitten: haori 十二, ei hattua eikä keppiä), **`gigai`** (= base, sijaiskopio `fxGigaiPop`:lle) | punainen reiatsu `fxRedReiatsu` |

**Pose-kentät (interpoloituvat):**
- Gowther: `bows` 0..1 (Twin Bow Herritt kasvaa käsien eteen; muoto `herritt` = 1), `bowRings` 0..1 (Hijack: jouset taipuvat renkaiksi), `glasses:false`, `glint` 0..1 (linssin valkoinen heijastus),
  `crack` 0..1 (posliinihalkeamat kasvoissa/käsivarsissa), `mindGlow` 0..1, `book` 0..1 (avoin kirja kämmenellä; `bookHand`, `bookCover`, `bookGlow`), `hy: Math.PI` = pää kääntyy 180° (nukke).
- Urahara: `fan` 0..1 (viuhka oikeassa kädessä, 0 kiinni .. 1 auki; `fanHand`), `fanFront:true` (viuhkan pinta kohti katsojaa vartalon suunnassa, `fanUp:[x,y,z]` kallistus),
  `fanText` (teksti viuhkassa), `fanSide 'front'|'back'|'both'` (kummalla puolella teksti näkyy: 'front' = katsojaan päin), `fanDraw(fn(ctx))` oma kuva viuhkan sisäpuolelle,
  `fanClosed:true` (suljettu viuhka osoittimena), `cane:false`, ilmeessä `face:{ eyeFlash: 0..1 }` (terävä silmien välähdys lierin alta).
- Kaikilla: `wounds` 0..3.

**Ilmeet (EXPR, kaikkien käytössä):** vanhat + `blank` (Gowtherin oletus), `curious`, `gentle`, `cold`, `sorrow`, `emptyTears` (kyyneleet ilmeettömillä kasvoilla), `thinking`, `sly`.
Mallilehti käyttää hahmon `sheetExprs`-listaa (Gowther: blank calm curious gentle smile surprised shock cold menace pain sorrow emptyTears laugh eyesClosed).

**Signature-poset (`SIGNATURE[nimi]`):**
- Gowther: `gow_stand gow_tilt gow_glasses (lasien nosto) gow_point (Searchlight) gow_temple (Broadcast: käsi ohimolla) gow_bowAim gow_cross (Jido Tsuibi) gow_rewrite (kädet levällään) gow_blackout (kämmenet yhteen) gow_jack (nukketeatterikädet) gow_catch gow_reach gow_bow gow_broken gow_sit gow_read` + `gow_neck180 gow_float gow_kneel`.
- Dazai (uudet): `dazai_think (käsi leualla, ovela hymy) dazai_shrug dazai_finger dazai_reach (kosketus) dazai_hands dazai_drum (pää edellä tynnyrissä: drawDrumCan + pos y≈.55, ground:false)`.
- Urahara (uudet): `urahara_fanFace (viuhka suun edessä, IK) urahara_fanOpen urahara_fanPoint urahara_hatTip urahara_think urahara_bow urahara_okiro urahara_shitone (Shitonegaeshi-viimeistely, eyeFlash) urahara_ready urahara_snap (kidō-laukaisu) urahara_sit urahara_lean`.
- poses_gdu.js (`POSE_GROUPS.gdu`): `gow_lifeless` (katkenneet langat: Dazain kosketus), `gow_dollFall`, `gow_dollSlump`, `gow_rise`, `gow_headTilt90`, `dazai_pinned` (selällään), `dazai_thrown`, `ura_kneelHurt`, `ura_slashBack`, `any_fingerTemple`, `any_handOnChin`, `any_armsFold`.

### 13.2 Efektit (fx_gow.js, fx_gow2.js, chars_zz_gdu.js)
`t` = efektin oma aika (`lt - alku`). Paikka = maailmapiste tai `{x,y}` (1920x1080).
- **Ruutuprosessit** (kutsu suoraan shotissa, EI f.fx:n sisällä; yhdisteltävissä; `sadNullify` kumoaa ne ympyrän sisällä):
  `gowInvasion(f, t, {glitch, pixel, pixelMask, mirror 0..1 (.5 = puolikas peilattu + sauma, 1 = koko kuva), hue, sat, tint, tintK, scan, seed, rate})` ·
  `gowTVNoise(f, t, {a, sat, roll, lines})` · `gowMemoryCollapse(f, t, {at, dur, hold, break, up, reveal, cols, rows})` (kuva hajoaa muistovalokuviksi) ·
  `gowTimeStop(f, t, {k, dur, at, keep:{at, r}, col, ticks})` (aika pysähtyy: laventeli-monokromi + kellotaulu) · `gowNightmare(f, t, {k, col})` · `gowPixelate(f, t, {k, dur, at, r})` ·
  `gowPinkFilm(f, t, {a, corner, pulse})` (**Invasion-POV-merkki**, cast.md: "pinkki reuna = älä luota") · `gowTear(f, t, {at, ang, open, hold, dur, reveal, glowCol})` (**ristiriita repeää**: Rewrite Light murtuu / Kirjan sivu) ·
  `gowRewind(f, t, {a, label})` (**Lost World** VHS-kelaus).
- **Herritt / Invasion:** `fxLightArrow(g, a, b, t, {dur, col, w, trail, hit, ease})`, `fxArrowVolley(g, src, t, {n, targets[], dir, len, spread, stagger, dur})` (Rewrite Light), `fxSearchlight(g, a, b, t, {read, r})`,
  `fxBroadcast(g, src, pts[], t, {dur})` (siksak-ajatussäde), `fxInvasionPulse(g, p, t, {dur, r})` (mielen lukeminen: renkaat + pikselit + 侵入), `fxBlackout(g, c, t, {r, dur})`,
  `fxKaleidoscope(g, F, ft, t, {n, r, alpha, col})` (illuusiokopiot), `fxGlassesGlint(g, F, ft, t, {dur, side})`.
- **Muistot:** `fxMemoryShards(g, c, t, {n, r, speed, size, alpha, pull, glitch, kind})`, `fxMemoryStream(g, t, {x, y, n, speed, alpha})`, `fxEmotionFlakes(g, t, {n, col, wind, alpha})` (tunnemuistojen hiutaleet),
  `fxPlayback(g, c, t, {w, h, seed, kind})` (muistovalkokangas), `gowMemPic(seed, kind)` (maalatut muistokuvat: field tavern castle night flower portrait rain sea), `gowMemCard(g, x, y, w, rot, a, seed, o)`.
- **Langat ja nuket:** `fxMindThreads(g, a, b, t, {n, sag, col})`, `fxMarionetteStrings(g, F, ft, ctrl, t, {joints, bar, col})` (ristikko ctrl-pisteessä → ranteet/pää/polvet),
  `drawHarlequin(g, p, {size, t, col, col2, swing, face:'tear'|'smile'|'blank', dance, alpha, strings})`, `fxPuppetArmy(g, c, t, {n, rows, spacing, drop, dance, yaw, size, h})`.
- **Urahara:** `fxGigaiPop(g, F, ft, t, {dur})` (piirrä f.figin sijaan: isku → vanu + kangas), `fxBlackCurtain(g, c, yaw, t, {w, h, open, openAt})` (Bankain musta verho),
  **`fxBenihimeDoll(g, base, yaw, t, {scale, rise, open, openAt})` uusittu**: pallonivelnukke, letitetyt hiussilmukat, ommelsilmät, punainen kaapu, temppelinovikädet (`open`), ompeleet;
  `fxStitches(g, pts[], t, {dur, w, col, seam})` (punaiset pistot pitkin polkua), `fxStitchPath(g, a, b, t)` (ommelpolku lattiassa), `fxRedReiatsu(g, F, t)`; vanhat (11.4): fxNakeBenihime, fxBloodMistShield, fxShibari, fxRikujokoro.
- **Dazai:** vanhat (12.2) + `drawDrumCan(g, c, {col, r, h, lying, axis, open})`, `fxRain(g, t, {n, ang, alpha, len, speed, ground, splash})`.
- **Rekvisiitta:** `drawBookPage(g, c, {size, t, yaw, pitch, roll, lines, glow, tear 0..1, text})` (Kirjan sivu), `drawBookCover(g, c, {art:'pig'|'fairy'|'giant'|'princess'|'nlh'|fn, cover, title, sub, size, open, rot})`,
  `drawChuyaHat(g, p, {rot, size})`, `drawCat` (fx_cameo.js), `gowSpeech(g, text, {x, y, size, who, a})` (Gowtherin neliölaatikko).

### 13.3 Lavasteet ja BG-koodit (`BGX(f, koodi)`)
| koodi | set / paletti | sisältö ja asetukset |
|---|---|---|
| `VOID` | `voidboard` / `voidpink` | rikkinäinen shakkilautasaari mustanpinkissä tyhjyydessä, kaatuneet nappulat, seinäkello jonka viisarit kulkevat taaksepäin. `crumble` 0..1, `clockAt` |
| `SHOP` | `shopin` / `shop_morning` | Urahara Shōten sisältä aamulla: tiski (z −1,6) + kissa (`cat:false`), tatamihuone, naulakko + pinkki kukkahaori + sakepullo lapulla (`haori:false`), karkkihyllyt, liukuovet, valosäteet |
| `UNDER` | `undergrounds` / `study` | maanalainen harjoituskenttä: maalattu taivas, mesat, kalliopiikit, kuolleet puut, tikkaat (`ladder:false`), `keikaigi` (paalut), `garganta` 0..1 (musta repeämä + pinkki hehku), `dmg` |
| `YOKO` | `yokoalley` / `alley_rain` + sade | Yokohaman sateinen kuja: märkä asfaltti, neonheijastukset, kyltit, ilmastointilaitteet, tynnyrit, Cosmo Clock lopussa, `crack` 0..1 (pinkki halkeama taivaalla) |
| `LIB` | `mindlib` / `mindlib` | Gowtherin mielen kirjasto = marionettiteatteri: hehkuvat kirjat, proscenium-lava (`stageZ`, oletus −16), langat + ruumiittomat marionetit (`strings`), lukittu hylly (`locked:false`, `lockZ`), leijuvat muistot (`mem`) |
| `NIGHT` | `seireitei` / `seirei_night` + sade + seepia | painajainen 110 v. sitten |
| `WHITE` | `paperwhite` / `paper` | No Longer Human: paperilattia, 人間失格-kanjit, tyhjät kirjat, katkenneet langat (`glyphs`) |
| `STITCH` | `stitch` / `stitch` | Bankain rakennusmaailma: ommellut saumat, punaiset raot, sauma taivaalla, mustat verhot; `sew` 0..1 |
| `BOARD` | `shiftarena` (`floor:'chess'`, `queens`) / `shift` | mielipelin areena, seinät vaihtuvat aaltona: `from`, `wall`, `phase` 0..1; seinätyypit `stone mirror books curtain glitch void clocks alley shopdoor` |
| `THEATER` `MEMLIB` `MIND` `CLOCK` `CHESS` `SHOPOUT` `HARBOR` | `theater`, `memlib`, `mindscape`, `clocktower`, `chess`, `urashop`, `yokohama` | marionettiteatteri (`puppets`, `puppetDrop`, `spot`), muistikirjasto (`aisle`, `mem`), mielimaailma (`glitch`, `crumble`), kellotorni (`stop` 0..1 pysäyttää rattaat, `time`, `pendulum`), shakkilauta + peilikäytävä (`pieces`, `mirrors`), kauppa ulkoa iltahämärässä, satama (12.3) |
| `FIN` | valitse `over.set/pal` | |
Lavasteet ovat oikeaa 3D:tä (parallaksi); `f.fg({ set, zSplit })` toimii. Hahmot seisovat y = 0 lähellä origoa (SHOP: tiskin edessä z > −1,2).

### 13.4 Impact-tyylit ja -sarjat (impact_gow.js)
Tyylit: `puppetstr stringsnap memrewrite memcrack dolljoints nightmareink stitchrebuild hijackrings memrewind gowglitch bluepaper redstitchsil fanflash (p.text)`.
**shots.jsonin nimet toimivat suoraan:** `PUPPET_STRINGS STRING_SNAP MEMORY_REWRITE MEMORY_CRACK DOLL_JOINTS NIGHTMARE_INK STITCH_REBUILD HIJACK_RINGS MEMORY_REWIND` + vanhat
(`WHITE_NEG VOID_LINEART SPEEDLINE_BURST RED_BLACK(_SPLIT) CRIMSON_WHITE MANGA_HALFTONE MANGA_RED PAPER_TEAR CLOSEUP_PANELS HOLLOW_EYE NLH_PAGE NLH_RING NLH_SHATTER KANNON_THREAD`).
`X-*` rakennetaan maskatuissa shoteissa itse (shotT ohittaa ne). Hahmosarjat: `gow_invasion gow_searchlight gow_rewrite gow_jack gow_blackout gow_herritt gow_lostworld gow_doll gow_broken
daz_nlh_doll daz_reality ura_okiro ura_fan ura_bankai_stitch ura_shitone ura_gigai clash_gdu`.

### 13.5 Kamera
`camOTS(A, B, t, {side, dist, lat, height, fov, bias, aperture})` (olan yli -kuva dialogeihin), `camLowHero(F, t, {dist, az, fov, roll})`, `camSlowPush(F, t, t0, t1, {part, from, to, az, el})`,
`camWideGroup(figs, t, o)` (= camGroup fill .58, fov 30: **laajat kuvat aina tällä tai `gcam`illa**, ei kiinteitä kaukokameroita), vanhat camGroup, closeCam, camImpactKick, camHandheld.

- Huom: `closeCam`-atsimuutti on suhteessa hahmon katsesuuntaan (yaw), ei maailmaan: `az: Math.PI` kuvaa selän takaa. `fxBenihimeDoll`: `o.lean` (rad, kallistus lantion ympäri), `o.headTurn` (-1..1, kasvot kääntyvät), `o.eyeGlow` 0..1 (`eyeCol`).

### 13.6 Visuaalinen kieli (pre/cast.md)
1. Pinkki reuna (`gowPinkFilm` / `BGX(..., {pov:'gow'})`) = Invasion vaikuttaa kuvaan. 2. Sinivalkoinen paperi (`bluepaper`, `NLH_*`, `sadNullify`) = Dazain todellisuus, ei koskaan pinkkiä.
3. Punaiset ompeleet (`fxStitches`, `STITCH`) = Urahara rakentaa uudelleen. 4. Repeämä (`gowTear`, `MEMORY_CRACK`, `drawBookPage({tear})`) = epäjohdonmukainen valhe. 5. Takaisinkelaus (`gowRewind`, `MEMORY_REWIND`) = Lost World.

### 13.7 Moottorin yleislaatu (ydinmuutokset)
- 720p: pienten päiden silmät suurenevat jo < 60 px (max +34 %), silmä/kulma/suuviivat paksunevat < 110 px; `lineW`-minimi .85 (1080-yksiköissä).
- Hiukset: jokainen suortuva huojuu kevyesti omassa vaiheessaan (`HAIR_SWAY = {amp:.045, f:1.7}`, 0 = pois) jousiviiveen päällä. Gowtherin polkka kapeista suortuvista (ei kypärä).
- sheets.js: `D.sheetExprs`. Lavasteiden tila draw-ajassa `GOW_SETSTATE` (ei sulkeumia SETCACHEssa).
- Lopullinen renderi 1280x720: `showdown/make.sh all DIR 0.6667 2` + `./make.sh final DIR`.

### 13.8 Lisäykset (impact_requests.md, fx_gow3.js)
- Pose-kentät: `armOff: 'L'|'R'` (käsi irronnut, ei piirretä), `handBandage: true` (siteet kämmenessä lähikuvassa). Käsimuodot `two three four five yawn` (sormilla laskeminen).
- `drawDollArm(g, p, {yaw, size, t, crawl 0..1, flip})` irronnut posliinikäsi (ryömii sormillaan), `drawFallingGlasses(g, p, {rot})`, `drawWallClock(g, p, {t, backward, speed, size, tilt})`,
  `drawHeartStone(g, p, {size, glow, crack})` (sydänkoriste), `uraFanTally(n, {seal, col})` → `fanDraw` viuhkan sisäpuolelle (tukkimerkit + sinettiympyrä kuivuneella verellä),
  `fxPorcelainShards(g, p, t)`, `fxSmokeBurst(g, p, t, {r, dur})`, `fxFireBeads(g, pts, t, {dur, size})` (Hiasobi Juzutsunagi), `drawPainterCliff(g, c, r, h, pal, seed)` (pehmeät maalatut kalliot UNDERissa).
- `drawBookPage(..., {line, write 0..1, lineY, gold})`: käsinkirjoitettu englanninkielinen rivi kirjoittuu, kultareuna; `tear` repeää rivin kohdalta.
- Impact `SOFT_WHITE` (tyyli `soft`: valkoinen hehku, ohuet harmaat viivat, yksi pinkki pisara). `PUPPET_STRINGS`: 2 ruutua pito, nykäys, viimeisessä ruudussa langat välähtävät valkoisina.
- Osa 1 valmiina: `showdown/part1.js` (69 shottia, t0 < 120 s); malli kaikille kutsuille.

## 14. Harry / Gojo / areena (agentti E, tämä projekti: HARRY POTTER vs GOJO SATORU)
Kaikki ladataan automaattisesti (luku 0b): `engine/chars_hvg.js` (harry, gojo, geto_youth + poset + kamera-apurit), `fx_hvg.js` (Gojo + ruutuprosessit),
`fx_hvg2.js` (Harryn loitsut + Uraharan mikrofoni), `sets_hvg.js` (Valhalla + 8 muuta lavastetta), `impact_hvg.js` (27 tyyliä, kaikki impact_requests.md-sarjat),
`text.js` (uusittu typografia). Ydinmuutokset 14.7. Mallilehdet `docs/sheets/` (harry_*, gojo_*, geto_youth_*), kontaktiarkit `docs/contact/hvg_*.png`.
Esimerkit: `engine/reel/hvgreel.js` (27,5 s testireeli), `reel/hvglab.js` (lavasteet), `reel/hvgimpact.js` (kaikki impact-sarjat).
Showdown-apurit: `showdown/common.js` + README (koodit HAR GOJ URA GET, BG-koodit, `autoTitle`).

### 14.1 Hahmot (`CAST`) ja muodot, koodit shots.jsonissa HAR / GOJ / URA / GET
| nimi | muodot | huom. |
|---|---|---|
| `harry` | `base` (holly-sauva), `elder` (Elder Wand, oksankyhmyt), `sword` (Rohkelikon miekka sauvan paikalla: `sword:{two:true}` kahden käden ote), `battle` (repeytynyt kaapu, wounds 1), `cloak` (näkymättömyysviitta päällä: hopeinen kaapu, pose `cloak` 1 = näkyvä .. 0 = vain väreilevä ääriviiva), `memory` (sepia, nuorempi ja lyhyempi Harry), `wounded` (lasit säröillä, veri, wounds 2) | 1,74 m, sotkuinen musta tukka (aukko arven kohdalla), pyöreät paksut lasit (2 heijastusta), salama-arpi (`scarK` hehku), vihreät silmät, kaapu + viininpunainen vuori, harmaa V-neule + raidallinen solmio, puna-kultainen raitahuivi (jousifysiikka) |
| `gojo` | `base` (silmäside, piikkitukka), `eyes` (side kaulassa, Six Eyes hehkuu, tukka pystyssä), `glasses` (pyöreät tummat lasit, tukka alhaalla), `bare` (silmät paljaina, tukka alhaalla), `serious` (eyes + takki auki, tukka hieman painunut), `youth` (oppilas: lyhyt takki, lasit, 1,86 m), `rct` (paranemishehku), `wounded`, `domain` (vahva silmähehku) | 1,90 m, pitkät jalat, tummansininen pitkä univormu leveällä korkealla kauluksella, vetoketjuviiva, valkoiset kulmat |
| `geto_youth` | `base`, `wounded` | vain Gojon muistossa: musta puolinuttura + otsakihara, kapeat silmät, korvatulpat, kultanapit, leveät housut |
| `urahara` | (valmis) + uudet poset 14.2 | kuuluttaja: `mic` 1 = käsimikrofoni (`micHand`), viuhka `fanHand:'L'` |

**Pose-kentät (interpoloituvat):**
- Harry: `wandGlow` 0..1 + `wandCol` (sauvan kärjen valo), `glassesCrack` 0..1, `cloak` 0..1 (muoto `cloak`), `snitch` 0..1 (+ `snitchHand`), `stone` 0..1 (Ylösnousemuskivi vasemmalla kämmenellä), `scarK` 0..1, `glasses:false`, `wounds` 0..3. Sauva = `sword: {hand:'R', dir:[x,y,z]}` (apuri `HVG_W(dir, o)`); sauvan kärki maailmassa: `hvWandTip(F, t)`.
- Gojo: `blindfold` 1 (silmillä) .. 0 (kaulassa), `'none'` = ei sidettä, `eyeGlow` 0..1 (alias `sixGlow`), `orbL` 0..1 (sininen pallo vasemmassa kädessä), `orbR` 0..1 (punainen oikeassa), `infinity` 0..1 (huurteinen pallopinta), `float` m (leijunta maan yläpuolella), `glassesDown` 0..1 (lasit valuvat nenällä), `rctGlow` 0..1, `wounds` 0..3.
- Kaikille (rig.js/body.js): `float` (leijunta), `figAlpha` 0..1 (koko hahmon läpinäkyvyys, renderöidään kerralla offscreen), design-kentät `figAlpha(P,D)` ja `postFig(ctx,F,t,S,D,opt)`.
- Käsimuodot: `cross` (etu- ja keskisormi ristissä: Domain / Purple), `pinch`, `wandgrip` (+ vanhat `two point sign claw open flat fist grip`).

**Ilmeet (EXPR, kaikkien käytössä):** `resolute wry tired exhausted defiant hurt loving sorrow playful serious cocky smug delighted honored bliss` (+ vanhat). Harryn oletus `determined`, Gojon `smug`.

### 14.2 Signature-poset (`SIGNATURE[nimi]`)
- Harry: `har_idle har_wandReady (= har_ready) har_aim har_castWind har_cast har_flick har_protego har_patronus har_castBig har_accio har_apparate har_dodgeRoll har_skid har_cloakThrow (= har_cloak) har_stone har_snitch har_kneel har_stand (nousee horjuen) har_sit (ground:false, anna pos y) har_hair har_defy har_duck har_swordUp har_swordSlash` (miekkaposet muodolla `sword`).
- Gojo: `goj_stand goj_pockets goj_lean goj_tilt goj_peace (= goj_wave) goj_blindfoldDown goj_blueL (vasen käsi, sormet koukussa) goj_blue goj_red (sign-käsi eteen) goj_purpleWind (kädet sivuille: orbL/orbR) goj_purple goj_purpleFire goj_infinity goj_honored (= goj_heaven: 天上天下) goj_domain (käsimerkki) goj_lift goj_float goj_punchWind goj_punch goj_laugh goj_sitGate (risti-istunta portin päällä: pos y = HVG.GATE_TOP, ground:false) goj_heal goj_flash`.
- Geto: `geto_stand geto_smile`. Urahara: `urahara_announce` (mikrofoni), `urahara_announceFan` (mikrofoni + viuhka vasemmassa), `urahara_shout`.

### 14.3 Lavasteet (sets_hvg.js) ja BG-koodit (`BGX(f, koodi)`)
| koodi | set / paletti | sisältö ja asetukset (`over.bg` / `f.bg({...})`) |
|---|---|---|
| `ARENA` (`ARENA_DAY`, `ARENA_RED`) | `valhalla` / `valhalla` (`valhalla_day`, `valhalla_red`) | Ø 52 m hiekka + kivi, 8 katsomokerrosta animoiduin jumal-/olentosiluetein (sarvet, siivet, kruunut, jättiläiset, hehkuvat silmät yöpaletissa), pylväskehä, 7 jumalpatsasta, soihdut, liput (länsi = salama/kulta, itä = silmä/sininen), kaksi porttia, kultainen riimukehä r 23,9-24,9, valokeilat keskelle. Optiot: `react 'cheer'|'gasp'|'hush'|'roar'`, `cheer` 0..1, `crowd` (tiheys), `eyes`, `torchT` + `torchSpan` (soihdut syttyvät kierroksena), `torch` 0..1, `ringRed` 0..1, `gateW`/`gateE` 0..1 (ristikko nousee), `dmg` 0..3 (laatat rikki, kraatterit, halkeamat), `crater` 0..1 + `craterAt` + `craterR` (Purplen kuoppa), `rays`, `statues:false` |
| `BOOTH` | `valhalla` | kuuluttajan aitio takakatsomossa: puupylväät, katos, paperilyhty (浦), pronssigongi telineessä (`gongT` = lyönnin aika → heilahdus). Urahara: `at(HVG.BOOTH.pos, 0, P('urahara_announceFan', {ground:false}))`, gongi `HVG.GONG.pos` |
| `GATE_H` / `GATE_G` | `valhalla` | portit `HVG.GATE_W = [-26,0,0]` (goottilainen kaari, kultainen valo, ristikko, Hallows-merkki) ja `HVG.GATE_E = [26,0,0]` (tumma kaari, sininen valo, silmämerkki); portin yläreuna `HVG.GATE_TOP` |
| `RING` | `valhalla` | riimukehä lähikuvassa (r ≈ 24,4) |
| `SKY` | `heavens` + `{arena:true, lightning:true}` / `valgate` | pilvimeri, kolosseumi syvällä pilvien raosta, salamat |
| `VOID` | `voidspace` / `void_inf` | Unlimited Void: tähtimeri, sumut, loputon valohila, heikko valolattia (`floor:false`), `k` |
| `MEM_H` | `hogwarts` / `hog_night` + sepia-grade | Tylypahka järven yllä, kallio, tornit valaistuin ikkunoin (`hog_dusk` = ilta) |
| `MEM_G` | `jjhigh` / `jj_summer` (sinertävä desaturoitu) | Jujutsu High -koulun katto kesällä: betonilaatta, aita, vesitankki, metsäiset kukkulat, kesäpilvet |
| `FOREST` | `darkforest` / `forest_night` | Kielletty metsä: kyhmyiset rungot, juuret, saniaiset, kuunsäteet, `eyes` |
| `CARD` | `cardbg` (`{who:'harry'|'gojo'}`) | voimakortin graafinen tausta (viininpunainen/kulta tai yönsininen/syaani, viivat, kipinät) |
| (muut) | `valgate` (Valhallan portit, `open`), `heavens` (pilvien yllä, kivikiekko r 9) | |
Lavasteet ovat 3D:tä (parallaksi); hahmot seisovat origon lähellä (|x|,|z| < 20). Yleisön etuala: `fxCrowdFG(g, t, {n, size, react, rim, blur})` (`layer:'over'`).

### 14.4 Efektit (`t` = efektin oma aika)
- **Gojo (fx_hvg.js):** `fxInfinity(g, c, t, {r, alpha, ripples:[{t0,p}], dur})` (huurteinen kuori, puolittuvat renkaat), `fxInfinityStop(g, c, items, t, {r, k})` (ammukset hidastuvat asymptoottisesti ja jäätyvät väristen; items `{from, kind:'spark'|'shard'|'bolt'|'orb', col, t0, size}`),
  `fxBlue(g, c, t, {r, dur, debris})`, `fxRed(g, a, dir, t, {charge, travel, speed, r})`, `fxHollowPurple(g, a, dir, t, {charge, len, speed, r})` (sininen+punainen sulautuvat → violetti pallo + **tyhjä pyyhitty polku**),
  `fxBlackFlash(g, p, t, {size})`, `fxRCT(g, F, t, {k})`, `fxSixEyes(g, F, t, {k, streak})`, `fxFlashStep(g, a, b, t)`, `fxDomainHand(g, F, t, {k})`, `hvOrb(g, q, R, cols, t)`.
- **Ruutuprosessit** (kutsu suoraan shotissa, EI f.fx:n sisällä): `gojoWarp(f, t, {at, r, k, twist})` (Blue: tila taipuu), `gojoDomainWipe(f, t, {at, dur})` (tähtipallo kasvaa kädestä; hahmot pysyvät päällä), `gojoVoidScreen(f, t, {k})`, `gojoInfoOverload(f, t, {k, white, double})` (merkkisade, välähdykset, kaksoiskuva).
- **Harry (fx_hvg2.js):** `fxSpellBeam(g, a, b, t, {col, core, w, dur, life, wobble, helix, jag, hit})` + esiasetukset `fxExpelliarmus fxStupefy fxAvada fxConfringo`, `fxBeamClash(g, a, b, mid, t, {colA, colB})`,
  `fxProtego(g, c, n, t, {r, hits:[{t0,p}], crack})` (sini-kultainen heksakupu), `fxPatronus(g, p, dir, t, {scale, gallop, rear})` + `patronusPath(a, b, t)` (hopeinen peura laukkaa),
  `fxAccio(g, a, b, t)`, `fxIncendio(g, a, dir, t, {len})`, `fxReparo(g, c, t)`, `fxApparate(g, p, t, {out})` + `apparateFig(t, dur, out)` → `{alpha, sq}`, `fxInvisCloak(g, F, ft, k)` (viitan väreilevä reuna),
  `fxCloakThrow(g, F, ft, t)`, `fxGhosts(g, c, t, {n, r})` (kiven varjot), `fxWandTrail(g, F, t, {span, col})`, `fxWandSparks`, `fxLumos`, `fxSerpent`, `fxSpellRunes(g, c, t)`, `drawSnitch(c, p, r, t, opt)`.
- **Urahara:** `fxMicWaves(g, p, t, {col, dir})`, `drawMegaphone(g, p, {size, flip, rot})`; FRI: `fxFriends(g, c, t, {kinds, col})` (showdown/common.js).
- Kerrokset: säteet ja hehkut `layer:'glow'`; pallot, kuvut, ammukset ja polut (ink + oma additiivinen hehku) `layer:'over'`.
- impact_requests.md-nimet → toteutus: fxSpellBolt = `fxSpellBeam`/`fxStupefy`, fxInfinityShell = `fxInfinity`, fxFrozenSpell = `fxInfinityStop`, fxPurple = `fxHollowPurple`, fxCloak = `fxInvisCloak`, fxSnitch = `drawSnitch`, fxVoid = `gojoVoidScreen`/`voidspace`, fxGongWave = impact `GONG_WAVE` + `fxShockRing`, fxTorchRing = `torchT`, fxRuneRing = arena `ringRed`, fxShades = `fxGhosts`, fxPortkey = impact `PORTKEY_SPIN` + `fxBlue`-pyörre.

### 14.5 Impact-tyylit ja -sarjat (impact_hvg.js)
Tyylit: `fansnap cardH cardG goldburn2 sixeyes gongwave spellred infinityfreeze singularity protegodome apparate redrepulse blackflash voidstars purplevoid bannersplit` + maskatut `sixeyespov memorysepia cloakfade voidpass domainshatter hallowssigil patronussilver snitchtouch portkeyspin ringout winnercard handshakeglow`.
**shots.jsonin nimet toimivat suoraan:** `FAN_SNAP POWER_CARD_H POWER_CARD_G SIX_EYES GONG_WAVE SPELL_RED INFINITY_FREEZE (+ _SILVER) BLUE_SINGULARITY PROTEGO_DOME APPARATE_TWIST RED_REPULSE BLACK_FLASH UNLIMITED_VOID HOLLOW_PURPLE BANNER_SPLIT`
+ maskatut `SIX_EYES_POV MEMORY_SEPIA CLOAK_FADE VOID_PASS DOMAIN_SHATTER HALLOWS_SIGIL PATRONUS_SILVER SNITCH_TOUCH PORTKEY_SPIN RING_OUT WINNER_CARD HANDSHAKE_GLOW` + vanhat (luku 7/12/13).
Kuviovariantti: `IMPACT_SEQ['STYLE@PATTERN']` ajetaan shotT:ssä jos olemassa (esim. `UNLIMITED_VOID@V1-W2`). Hahmosarjat: `har_expelliarmus har_patronus har_protego har_apparate goj_blue goj_red goj_purple goj_domain goj_blackflash goj_infinity clash_hvg`.
Parametrit: `at`/`x,y` fokus, `from` (SPELL_RED: säteen alku), `r` (INFINITY_FREEZE pallon säde px), `dome`/`hit` (PROTEGO_DOME), `text` (FAN_SNAP, WINNER_CARD).

### 14.6 Tekstit (text.js, pre/text_style.md)
- `attackTitle(g, lt, {style:'shonen'|'wizard'|'arena', text, kind, pre, sub, t0, dur, x, y, align, size, big})`: **SHONEN** (Gojo: Inter Display Black Italic, valkoinen + värijalka, 6 px musta + 14 px värireuna, hehku, kanji, wipe-viiva → kirjaimet iskeytyvät yksi kerrallaan RGB-glitchillä → ylivalotusruutu; ulos: venytys + 3 liukuvaa viipaletta),
  **WIZARD** (Harry: Caladea Bold, kaiverrettu kultagradientti, ruskea + viininpunainen reuna, loitsuvärin hehku, iso initiaali, kultaviiva tähtikipinöin + salama; sauvan valo piirtää viivan, kirjaimet syttyvät kipinöinä, välähdys; pito: kultapölyä nousee; ulos: kirjaimet hajoavat pölyksi oikealle; `\n` = kaksi riviä),
  **ARENA** (kuuluttaja: letterbox-banneri, kirjaimet putoavat; `big` = BEGIN! punainen + renkaat). `kind`: `blue red purple black domain infinity sixeyes protego patronus gold green silver fire`. Koko oletuksena 170 px (≥ 1,5× ennen), mahtuu automaattisesti.
- `moveTitle(lt, text, o)` → oikea tyyli/kanji/etuliite liikkeen nimestä (`HVG_MOVES`); `fighterCard(g, lt, {who, t0, dur, round, side})` (voimakortti), `vsCard(g, lt, {t0, dur})`, `announceCard` (= arena). Aliakset P:n nimille: `spellTitle` = `attackTitle`, `powerCard` = `fighterCard`.
- `subtitle(g, text, {who, whoCol, size 52, y 960, italic})`. showdown/common.js piirtää tekstitykset automaattisesti ja `autoTitle` valitsee iskunimen tyylin.

### 14.7 Moottorin yleislaatu ja kamera (ydinmuutokset)
- body.js: `figAlpha` + `postFig` (koko hahmon läpinäkyvyys yhdellä kompositiolla, ei päällekkäisiä osia), huivin raidat `scarf.stripes {col, n}`. rig.js: `float`. text.js uusittu (14.6).
- Kamera (chars_hvg.js): `camTruck(cam, dx, dy)` (kuvaa sivuttain: muotokuva kortin vapaalle puolelle), `camDutch(cam, roll)`, `camOrbitShot(c, t, {r, r1, az0, az1, el0, el1, dur, fov})` + vanhat `camGroup camWideGroup camOTS camLowHero camSlowPush closeCam camImpactKick camHandheld`.
- Hiukset: Harryn ja Gojon tukat useista hajautetuista suortuvista (satunnainen pituus/kulma), Gojon piikit kallistuvat taakse eivätkä muodosta säännöllistä kruunua.
- 1080p-nopeus tällä koneella: ~1,1 s/frame (action3d ja hand2d), 720p ~0,5-0,6 s/frame; 960x540-esikatselu 27,5 s reelistä 2 workerilla ≈ 3 min.

## 16. Naruto / Luffy (agentti E, tämä projekti: NARUTO UZUMAKI vs MONKEY D. LUFFY)
Kaikki ladataan automaattisesti (luku 0b): `engine/chars_nl.js` (naruto, luffy, poset, hattu, kumikäsi), `chars_nl2.js` (pre/cast.md: värit, muotonimet, uudet pose-kentät ja poset),
`fx_nl.js` (Rasengan-perhe, kloonit, chakraviitat, Gear-höyry, pilvihuivi, Gatling, Haki-salamat, cartoon-efektit), `fx_nl2.js` (iskunimityypit SHINOBI / PIRATE / NIKA, hahmokortit),
`fx_nl3.js` (Kurama), `sets_nl.js` (areena `nlarena` = Valhalla uusin tunnuksin + vauriot, `nlseal`, `nlcard`, Shunsui), `impact_nl.js` (kaikki shots.jsonin impact-nimet).
Pohjana myös hulk-vs-yujiron moduulit (kopioitu): `chars_hy.js fx_hy.js impact_hy.js sets_hy.js` (hyarena-vauriot, tähtiyleisö, COMIC/halftone-impactit) + uudemmat ydintiedostot (body/faces/rig/text/sets_hvg) ja `engine/fonts/`.
Esimerkit: `engine/reel/nllab.js` (yksi shotti per muoto/efekti), `reel/nlimpact.js` (kaikki impact-sarjat), `reel/nltitles.js` (kirjaintyypit + kortti), `reel/nlreel.js` (testireeli).
Showdown-apurit: `showdown/common.js` + README (koodit NAR LUF URA KYO KUR, BG-koodit, `autoTitle`).

### 16.1 Hahmot (`CAST`), koodit NAR / LUF (+ URA, KYO valmiina; KUR = efekti)
| nimi | muodot | tunnusmerkit |
|---|---|---|
| `naruto` | `base`, `battle` (= `wounded`: repeytynyt takki, wounds 2), `sage` (punaoranssi viitta mustin liekein, oranssi pigmentti, keltaiset konnasilmät + vaakapupilli), `kurama` (= `kcm`: kultainen chakrakeho, mustat sinettiviivat + magatama-rengas, liekkihelma, tukka sarviksi, oranssit kettusilmät), `baryon` (punaoranssi liekkiaura, kettukorvat, paksut viikset), `hokage` (valkoinen viitta, punainen liekkihelma, 七代目火影 selässä), `memory` (nuori, 1,5 m) + `sage_wounded kurama_wounded baryon_wounded` | 1,78 m, isot blondit piikit (7-9), 3 viiksijälkeä/poski, Lehden otsasuojus (levy + kaiverrus + niitit), musta-oranssi takki korkealla kauluksella ja vetoketjulla, oranssit housut, mustat sandaalit, siniset silmät |
| `luffy` | `base`, `battle` (liivi riekaleina, veri suupielessä), `gear2` (vaaleanpunainen iho + höyry), `haki` (kädet mustat), `gear3` (= base; jättiraaja `stretch.giant`), `boundman` (= `gear4`: 1,95 m, paisunut ylävartalo, mustat raajat + punaiset liekkikuviot, tukka pystyyn, höyry), `gear5` (CARTOON: valkoinen liekki-/pilvitukka, valkoiset vaatteet, violetti vyö, pilvihuivi, punaiset silmärenkaat, paksu ääriviiva `lineK` 1,55, laventelivarjot, rubber-hose-kädet, kädet 1,3×), `giant` (gear5 × 6) + `gear2_wounded boundman_wounded gear5_wounded` | 1,74 m, olkihattu (lieri + punainen nauha, 3D), arpi vasemman silmän alla (2 ommelta), X-arpi rinnassa, punainen avoin liivi, keltainen vyö, siniset shortsit valkoisin käänteillä, olkisandaalit |

**Pose-kentät (interpoloituvat kun numeerisia):**
- Naruto: `ras: {hand:'R'|'L'|'both', k 0..1, kind:'rasengan'|'odama'|'shuriken'|'baryon'|'planet', size, fwd, up, at}` (pallo kämmenen yllä/edessä), `aura` 0..1 (muodon liekkiviitta), `headband:false`, `eyesSage` 0..1 tai `eyes:'toad'` (Sage-silmät missä muodossa tahansa).
- Luffy: `hat` 1 | `'back'` (selässä nauhan varassa) | 0, `hatOff:true`, `hatTilt` (rad, + = lieri silmille); `stretch` / `stretch2: {side:'R'|'L', to:[x,y,z], k 0..1, fist, giant 0..1 (Gear 3), wave, sag, droop, haki}` = normaali käsi piilotetaan ja piirretään kumikäsi + nyrkki;
  `stretchLeg: {side, to, k, wave, haki}` (Dawn Whip -kumijalka); `haki:'L'|'R'|'both'`, `hakiArms` 0..1, `hakiLegs` 0..1 (Armament: musta kiiltävä); `steam` 0..1; `boa` / `cloudScarf` 0..1; `eyePop` 0..1 (silmät pullistuvat ulos); `mouthW` 0..2;
  `hoseArms` 0..1 (gear5-oletus 1); `toonLines` 0..1 (piirretyn tunneviivat + hikipisarat).
- Kaikille: **`squash`** −1 (pannukakku) .. +1 (venynyt) = koko hahmon cartoon-skaalaus jalkapisteen ympäri (body.js); `wounds` 0..3; design `lineK` (hahmokohtainen viivapaksuus).
- Apurit: `NL.narRun(ph, over)`, `NL.lufRun(ph, over)`, `NL.nikaDance(ph, over)`, `NL.bounceY(ph, h)` + `NL.bounceSq(ph, k)` (pomppu + squash: `at([x, NL.bounceY(ph), z], yaw, P('luf_bounce', NL.bounceSq(ph)))`), `NL.clones(n, {c, yaw, cols, spacing, key, form})` → kloonilauma (fig-taulukko), `NL.drawHat(g, p, {tilt, spin, size})` (irrallinen lentävä hattu), `NL.sitY(cast, seat)` = pos y istuville ground:false-poseille (nar_meditate, nar_sit, luf_sit).

**Ilmeet (EXPR, kaikille):** `foxGrin nindo yell bigGrin shishi nikaLaugh nikaGrin googly focusedCalm` (+ vanhat; Naruton oletus `determined`, Luffyn `shishi`, Gear 5 `nikaGrin`).

### 16.2 Poset (`SIGNATURE[nimi]`)
- Naruto: `nar_stand nar_ready (kyykky, käsi maassa) nar_kunai nar_sign nar_signCross (= nar_cloneSign) nar_rasHold nar_rasThrust (= nar_rasengan) nar_rasRaise nar_rasThrow (= nar_rasenThrow) nar_rasBoth nar_punchWind nar_punch nar_uppercut nar_kickWind nar_kick nar_run1/2 nar_leap nar_land nar_thumbsUp (= nar_thumb) nar_point nar_block nar_hurt nar_knockback nar_kneel nar_rise (käsien varassa ylös; vanha = nar_riseStand) nar_meditate (= nar_sage, ground:false) nar_grin nar_headScratch nar_shout nar_reach nar_fall (kasvoilleen; ilmassa = nar_fallAir) nar_frogKumite nar_fistBump nar_sit`.
- Luffy: `luf_stand luf_ready luf_hips luf_laugh luf_hatHold (= luf_hatDown) luf_pistolWind luf_pistol luf_gatling luf_bazookaWind luf_bazooka luf_gear2 (= luf_pump) luf_thumbBite luf_bite luf_hakiArms luf_kickWind luf_kick luf_stampWind luf_stamp luf_leap luf_land luf_hurt luf_knockback luf_kneel luf_rise luf_point luf_shout luf_bounce luf_kongWind luf_kongGun luf_nikaDance/2 luf_nikaGrab (= luf_g5Grab) luf_nikaHammerWind luf_nikaHammer luf_g5Laugh luf_g5Squash luf_fall luf_run1/2 luf_armsCross luf_lieBack luf_sit`.
- Kurama (fxKurama-optiot): `pose 'kur_eye' | 'kur_roar' | 'kur_paw' | 'kur_bomb'`.

### 16.3 Kurama (fx_nl3.js): `fxKurama(g, c, t, o)` / showdown `KUR(f, lt, o)`
`c` = ketun jalkapiste maailmassa (tai `{x,y,s}`), `scale` = korkeus metreinä (oletus 14), `mode 'avatar'` (kultainen läpikuultava chakra, liekkireuna, mustat sinettiviivat) | `'real'` / `'seal'` (oranssi turkki, mustat silmämerkit),
`pose 'stand'|'catch'|'crouch'|'roar'|'bomb'`, `part 'full'|'head'` (c = pään keskus, scale = pään leveys m) `|'eye'` (yksi silmä täyttää ruudun), `expr 'grin'|'smirk'|'calm'|'soft'|'angry'|'snarl'|'roar'|'closed'`, `eye` 0..1, `mouth` 0..1, `look [x,y]`, `mirror`, `rise` 0..1, `alpha`, `tails`, `orb` 0..1 (hännällisen pedon pallo suussa).
Kerros: `'under'` kun Naruto seisoo avatarin edessä, `'over'` muuten. `fxBijuudama(g, a, b, t, {r, dur, boomDur})` = pallo lentää a→b ja räjähtää kupoliksi. SEAL-kuvassa kalterit eteen: `f.fg({ set: 'nlseal', bars: true })`.

### 16.4 Efektit (fx_nl.js, `t` = efektin oma aika)
- **Naruto:** `fxRasengan(g, c, t, {k, kind, size})` (myös `ras`-pose piirtää sen), `fxRasenganHit(g, p, t, {size, kind, dur})`, `fxRasenTrail(g, a, b, t)`, `fxPoof(g, p, t, {size, dur, n})` + `fxClonePuffs(g, pts, t, {stagger})` (klooni-poof), `fxChakraCloak(g, F, t, {k, kind:'kcm'|'baryon'|'sage'|'chakra'})`,
  `fxSageGather(g, F, t, {k})` (luonnonenergia), `fxChakraLines(g, F, t)`, `fxBaryonDrain(g, a, b, t)`, `fxKunaiThrow(g, a, b, t)`, `nlSwirl` (pallo-primitiivi).
- **Luffy:** `fxGearSteam(g, F, t, {k, g4})`, `fxCloudBoa(g, S, t)`, `fxGatling(g, F, side|null, dir, t, {n, len, fist, haki})`, `fxStretchLines(g, a, b, t)`, `fxRubberSnap(g, p, t)`, `fxHakiLightning(g, c, t, {r, n, dur})`, `fxConquerorWave(g, c, t, {r, dur})`, `fxHakiCoat(g, F, t)`,
  `fxRubberGround(g, c, t, {r, amp, dur})` (Gear 5: maa kumia), `fxDrums(g, c, t, {bpm, r})` (vapautuksen rummut), `fxBoing(g, t, {text, x, y, size, rot, dur})` (cartoon-onomatopoeia: BOYOOON! SPLAT! BZZZT! DOKAAAN!; `layer:'top'` tai `f.text`), `fxToonStars(g, p, t)`, `fxBajrang(g, a, dir, t, {size, travel})`, `fxNikaLightning(g, a, b, t)`.
- **Yhteiset:** `fxClashSpiral(g, p, t, {size, colA, colB})`, `fxShockSphere(g, p, t, {r, dur, col})`, `fxDebrisRing(g, c, t)` + hulk-vs-yujiron `fxSmashWave fxConcreteSpray fxThunderclap fxStomp fxCollapse drawBoulder fxInkSplash` ja vanhat (fxShockRing, fxDust, fxDebris, fxSpeedLines …).

### 16.5 Lavasteet (sets_nl.js) ja BG-koodit (`BGX(f, koodi)`)
| koodi | set / paletti | sisältö |
|---|---|---|
| `ARENA` (`ARENA_DUSK ARENA_DAY ARENA_TOON ARENA_DARK ARENA_RED`) | `nlarena` / `arena_nl` (`arena_nl_dusk arena_nl_day arena_nl_toon arena_nl_dark arena_nl_red`) | Valhalla: länsi = Lehden lippu + oranssi portti (Naruto), itä = olkihattu-pääkallo + punainen portti (Luffy), harva yleisö (`crowd` .45). Optiot: kaikki valhalla/hyarena-optiot (`react 'cheer'|'gasp'|'hush'|'roar'|'toonRun'`, `cheer`, `dmg` 0..3 kraatteri→muurin reikä→sortuneet lohkot+tulipalot, `crater craterAt craterR`, `breach`, `collapse`, `dust`, `spots`, `torch`, `gateW/E`) + `faint` 0..1 (Conqueror's: siluetit kaatuvat rivi kerrallaan), `spiral`+`spiralAt`+`spiralR` (Rasengan-kierreurat), `cuts`+`cutsAt`+`cutsR` (Rasenshurikenin tuuliviillot), `fists [[x,z,r]]` (nyrkinjäljet), `toon` / `rubber` 0..1 (Gear 5: paksut renkaat + aaltoileva maa), `leaves` 0..1 |
| `STANDS` | `nlarena` | Shunsuin katsomo: `STAR(f, 'KYO:toast', lt)` / `NL.starShot(f, 'toast', lt, {cam:{part:'face'|'bust', az}})`; reaktiot `toast narrow hatUp hatDown cupDown laugh eyesWide stand smile shock hush`; sakepullo vieressä automaattisesti |
| `BOOTH` / `GATE_N` / `GATE_L` / `SKY` | `nlarena` / `heavens` | Uraharan aitio (`HVG.BOOTH.pos`, gongi `HVG.GONG.pos`), portit `HVG.GATE_W` (Naruto) / `HVG.GATE_E` (Luffy), taivas + kolosseumi alhaalla |
| `CARD` | `nlcard` (`{who:'naruto'|'luffy'|'nika'}`) | korttitausta: oranssi + musta spiraali + lehdet / karmiini + kultasäteet / pastellitaivas + pilvet |
| `SEAL` | `nlseal` / `nl_seal` | sinettitila: matala vesi (`ripples [[x,z,t0]]`), putket, jättikalterit + 封-lappu (`open` 0..1, `gateZ`), oranssi hehku (`glow`); kalterit eteen `f.fg({set:'nlseal', bars:true})` |
Yleisön etuala: `fxCrowdFG(g, t, {n, size, react, rim, faint})`. Fighter-kortit: `fighterCard(g, lt, {who:'naruto'|'luffy', side, t0, dur, title, sub})` (pystykanji 七代目火影 / 五皇) + `vsCard`.

### 16.6 Impact-tyylit ja -sarjat (impact_nl.js)
Tyylit: `rasenswirl windcuts kuramagold sageeyes clonewall baryonred hakicrack gomustretch toonpop drumbeat nlsplit smokeburst powercard twirl sagefull gear2steam hakiblack boundman kcmgold giantfist bijudama conqwave conqclash shurikenfull nikaburst rubberworld squashstretch cartoonxray toondunk cartoonpop comicnl`.
**shots.jsonin nimet toimivat suoraan:** `SMOKE_BURST POWER_CARD_N POWER_CARD_L RASEN_SPIRAL SAGE_EYES GEAR2_STEAM HAKI_BLACK BOUNDMAN_INFLATE KCM_GOLD GIANT_FIST BIJUDAMA_BLAST CONQUEROR_WAVE CONQUEROR_CLASH RASENSHURIKEN NIKA_BURST CARTOON_POP RUBBER_WORLD SQUASH_STRETCH CARTOON_XRAY TOON_DUNK`
+ uudelleenväritetyt `COMIC_POW` (punainen/keltainen), `DUAL_CLASH` / `DUAL_TONE` (oranssi | punainen), `EYE_ORANGE`, `WORLD_BREAKER` (kultainen kettu) + vanhat (`WHITE_NEG FAN_SNAP GONG_WAVE SPEEDLINE_BURST MANGA_PANELS IMPACT_CRATER SHOCKWAVE_RING CLOSEUP_PANELS VOID_LINEART CHROMA_SPLIT RED_BLACK_SPLIT MANGA_RED MANGA_HALFTONE COMIC_HALFTONE GOLD_BURN SILHOUETTE_ORANGE`).
Hahmosarjat: `nar_rasengan nar_shuriken nar_clones nar_sage nar_kurama nar_baryon luf_pistol luf_gatling luf_gear2 luf_gear3 luf_gear4 luf_gear5 luf_haki clash_nl` + `RASENGAN_SPIRAL RASENSHURIKEN_CUTS CLONE_WALL KURAMA_GOLD BARYON_RED HAKI_CRACK CONQUEROR_HAKI GOMU_STRETCH GEAR_SECOND_STEAM GEAR_FOURTH TOON_POP DRUMS_DON NL_CLASH`.
Parametrit: `at`/`x,y` fokus, `who` (powercard), `vs` (powercard: VS-välähdys), `text` (toonpop / squashstretch / toondunk / comicnl), `neg` (sagefull), `amt` (twirl), `dir` (gomustretch / giantfist), `eye` (kuramagold), `ang` (conqclash / nlsplit). `X-*` rakennetaan maskatuissa shoteissa itse.

### 16.7 Iskunimet (fx_nl2.js, pre/text_style.md)
`attackTitle(g, lt, {style, text, kind, pre, jp, sub, t0, dur, x, y, align, size, side, noSplit})`:
**SHINOBI** = `style:'ninja'` (Dela Gothic One, oranssi gradientti #fff1c2→#ffb43a→#ff6a00 + #c94400 jalka, 8 px rosoinen musta + 4 px tummanoranssi + hehku, sumi-veto taustalla, Lehden spiraali lopussa, kanjisarake (Yuji Boku) reunassa;
sisään: musteveto (2 fr) → kirjaimet 130 %→100 % ryhmissä savupoofein → oranssi välähdys; ulos: savupoofit vasemmalta oikealle; `kind orange|rasengan|kurama|sage|baryon|shuriken`; oletus ala-vasen).
**PIRATE** = `style:'pirate'` (Bangers, #fff36a→#ffb000→#e8202a, 10 px musta + 5 px valkoinen + 10 px pudotusvarjo, keltainen Ben-Day-purske, `pre` 'GOMU GOMU NO' + `jp` ゴムゴムの; sisään kuminauhavenytys 160 %→95 %→overshoot; ulos venyy ja napsahtaa; `kind gomu|haki|conqueror|gear2|gear3|gear4`; oletus ala-oikea).
**NIKA** = `style:'cartoon'` (Bangers pyöreä, valkoinen + pastelliliukuma, 9 px #2a1a4a + aaltoileva valkoinen pilvireuna, tähdet; kirjaimet putoavat ja litistyvät, hyppivät, ulos saippuakuplina).
Pitkät nimet jaetaan automaattisesti (`KAGE BUNSHIN` pieni rivi + `NO JUTSU!` iso). `nlMoveTitle(lt, text, {who, g5})` → tyyli/kanji/etuliite (`NL_MOVES`). showdown `autoTitle` käyttää shots.jsonin `text_style`a.

### 16.8 Moottorin yleislaatu (ydinmuutokset tässä projektissa)
- Ydintiedostot päivitetty hulk-vs-yujiron versioihin (body/faces/rig/sets_hvg/text) + `engine/fonts/`.
- body.js: `pose.squash` (cartoon-skaalaus), design `lineK` (hahmokohtainen viivapaksuus). fx_gow3.js: kumiraajojen piilotus (`S._armOff`, `S._hose`, `S._legOff`). sets_hvg.js: `o.emblem` voi olla funktio, `faint` + `fallen`/`toonRun`-siluetit.

## 17. Itachi / Julius (agentti E, tämä projekti: ITACHI UCHIHA vs JULIUS NOVACHRONO)
Kaikki ladataan automaattisesti (luku 0b): `engine/chars_ij.js` (itachi, julius, poset, ilmeet, Sharingan-/kelloiiris), `fx_ij.js` (varikset, Amaterasu, tulipallo, Susanoo, Mangekyō-insertti,
Tsukuyomi/Izanami-ruutuprosessit, kellotaikapiiri, Chrono Stasis, aikaluodit, kelaus, tiimalasi, grimoire, Mana Zone, velhokuninkaan vaakuna, aikapysäytysruutu), `fx_ij2.js` (iskunimet CROW / WIZARD +
hahmokortit), `fx_ij3.js` (sade, shurikenit, Hōsenka, magatamat, Amaterasun kelaus, genjutsu-ruutu, kellokilpi, tulen vanhennus, mana-luotain, rattaat, kultaiset jälkikuvat), `sets_ij.js`
(areena `ijarena`, `tsukuyomi`, `ijcard`, katsomon Dazai + Shunsui siluettien keskellä), `impact_ij.js` (tyylit, shots.json-sarjat, BURST-apurit). Fontit `engine/fonts/` (Cinzel, Cinzel Decorative,
Shippori Mincho B1, Zen Antique, Yuji Syuku; make.sh asentaa). Ydinmuutokset 17.8.
Esimerkit: `engine/reel/ijlab.js` (muodot, efektit, lavasteet, yleisö), `reel/ijimpact.js` (impact- ja BURST-sarjat), `reel/ijtitles.js` (iskunimet + kortit), `reel/ijreel.js` (testireeli).
Showdown-apurit: `showdown/common.js` + README (koodit ITA JUL URA DAZ KYO, BG-koodit, `autoTitle`, `burstSeq`, sade).

### 17.1 Hahmot (`CAST`), koodit ITA / JUL (+ URA, DAZ, KYO valmiina; SUS ja CRW = efektit)
| nimi | muodot | tunnusmerkit |
|---|---|---|
| `itachi` | `base` (mustat silmät), `sharingan`, `mangekyo`, `sick` (kalpea, syvemmät kyynelurat, sharingan), `sick_mangekyo`, `blind` (harmaat silmät, kalpea), `nocloak` (harmaa liivi) | 1,78 m, hoikka; musta tukka: keskijakaus + leukaan ulottuva otsatukka + matala poninhäntä; **kyynelurat**; viilletty Lehden otsasuojus; **Akatsukin viitta** (#0f0f14, punaiset valkoreunaiset pilvet selässä, edessä ja hihoissa, punainen vuori, korkea kaulus joka peittää leuan `collarUp`) |
| `julius` | `base`, `magic` (mana .6), `manazone`, `chrono` (kultainen kelloiiris + hehku), `casual` (ei viittaa), `wounded` | 1,90 m, leveäharteinen; vaalea (#f1dfa0) aaltoileva olkapäille ulottuva tukka + kaksi kultaista hiusrengasta; siniset silmät (#8fb4d8); leveä hymy, ikäjuonteet; valkoinen kultanappinen asu, raskas laivastonsininen viitta (#3a3f6a) kultareunuksin ja vaakunalla selässä, korkea kaulus |

**Pose-kentät (numeeriset interpoloituvat):**
- Itachi: `shar` 0..1 (Sharingan), `mang` 0..1 (Mangekyō-morfi), `spin` (tomoe-kierto rad), `eyes: 'black'|'blind'` (ohittaa muodon), `bleed` 0..1 (verikyynel oikeasta silmästä), `blood` 0..1 (veri suupielestä),
  `collarUp` 0..1 (oletus .7), `eyeGlow` 0..1 (punainen hehku pimeässä), `kunai: 'R'|'L'` (+ `kunaiRev`), `shuriken: 'R'|'L'`, **`dissolve` 0..1** (hahmo haihtuu ja hajoaa variksiksi + sulkia; varikset pysyvät läpinäkymättöminä).
- Julius: `timeGlow` 0..1 (kelloiiris + kultainen hehku; D13 "avaa silmät"), `grim` 0..1 (grimoire vasemman käden yllä, `grimOpen`, `grimFlip`), `wounds` 0..3. Jälkikuvat: `f.fig(F, {afterimages: fxGoldTrail(F, lt), afterCol: '#f6d36a', afterA: .45})`.
- Ilmeet (EXPR): `itaCalm itaStare itaCold itaSoft itaSad itaPain itaCough julSmile julGrin julWonder julSerious julFierce julShout julThrilled julSense` + P:n nimet `sad smile_soft cough delight eyes_closed` (+ vanhat `calm focused pain serious smile`).
  Itachin oletus `itaCalm` (puoliksi suljetut luomet), Juliuksen `julSmile`. Silmät kiinni -tila: `julSense` / `eyes_closed` / pose `jul_eyesClosed`.

### 17.2 Poset (`SIGNATURE[nimi]`)
- Itachi: `ita_stand ita_ready (kädet viitan sisällä) ita_cloakHand ita_sign (= ita_handseal, tiikeri) ita_fireball (= ita_fireBreath) ita_throwWind ita_throw ita_kunai ita_kunaiSlash ita_block ita_point ita_twoFingers ita_reach
  ita_susanoo ita_crows ita_crowsDissolve ita_eyeHold ita_eyeCover (käsi vasemmalla silmällä) ita_cough ita_tilt ita_lookBack ita_punchWind ita_punch ita_kick ita_kickSpin ita_dash ita_run1/2 ita_land ita_hurt ita_kneel
  ita_lieBack (selällään, ground:false: anna pos y ≈ .25) ita_standPillar ita_walk1/2 ita_float ita_shield`. Apurit `IJ.itaRun(ph, over)`, `IJ.itaWalk(ph, over)`.
- Julius: `jul_stand jul_hips jul_handsBack jul_walk (= jul_walkA, kädet selän takana) jul_grimoire jul_cast jul_castBoth jul_raise jul_point jul_tap (Chrono Stasis) jul_palmOut (kellokilpi) jul_snap jul_wonder jul_sweep jul_guard
  jul_punchWind jul_punch jul_punchTime jul_kick jul_dash jul_run1/2 jul_land jul_float jul_hurt jul_kneel jul_laugh jul_lookUp jul_touchCheek jul_eyesClosed jul_bow jul_walk1/2`. Apurit `IJ.julRun`, `IJ.julWalk`, `IJ.julWalkBack`.
- Katsomo (istuvat, ground:false): `ij_sit ij_sitChin ij_sitLean ij_sitPoint ij_sitToast ij_sitFinger ij_sitCheer ij_sitGasp ij_sitSlap`; `IJ.sitAt(cast, ang, tier, pose, over)`.

### 17.3 Lavasteet (sets_ij.js) ja BG-koodit (`BGX(f, koodi)`)
| koodi | set / paletti | sisältö ja optiot |
|---|---|---|
| `ARENA` (`ARENA_DUSK ARENA_DAY ARENA_DARK ARENA_RED ARENA_GOLD`) | `ijarena` / `arena_ij` (sadeyö) | Valhalla: länsi = Itachi (Uchiha-viuhka liput, punaiset lyhdyt portilla, variksia kaaren päällä), itä = Julius (vaakuna, kaiverrettu kultainen kellotaulu portin yllä). Kaikki hyarena/valhalla-optiot + `moon` 0..1 + `moonCol` (punainen kuu pilvivöin), `wet` 0..1 (lätäköt + sadeympyrät + soihtujen heijastukset), `lightning [t0..]`, `scorch [[x,z,r]]` + `blackFire` 0..1, `gouge [[x0,z0,x1,z1,w]]`, `clockScar` 0..1 + `clockAt` + `clockR` (Mana Zone -kellotaulu lattiassa), `frozen` 0..1 (leijuvat sirpaleet), `feathers` 0..1, `clockGlow`, `gateDress:false` |
| `STANDS` | `ijarena` | katsomo: käytä `STAR(f, 'KYO:kyo_kneeSlap', lt)` / `STAR(f, 'DAZ:dazai_sitSmile', lt)` / `PAIR(f, lt, {rS, rD})` = `IJ.crowdShot` |
| `BOOTH` `GATE_I` `GATE_J` `SKY` | `ijarena` / `heavens` | Uraharan aitio (`HVG.BOOTH.pos`, gongi `HVG.GONG.pos`), portit `HVG.GATE_W` (Itachi) / `HVG.GATE_E` (Julius), taivas + kolosseumi + salamat |
| `CARD` | `ijcard` (`{who:'itachi'|'julius'|'vs'}`) | Itachi: musta-punainen + Mangekyō-vesileima + lentävät varikset; Julius: laivasto + kultaiset kellorenkaat + roomalaiset numerot + vaakuna |
| `GENJ` / `TSUKU` | `tsukuyomi` | punainen taivas, mustat pilvet, musta kuu punaisella reunalla, negatiivinen lattiaruudukko, `crosses` 0..1 |
**Sade** (cast.md: koko videon sääntö): `BGX` lisää sateen automaattisesti (`fxRain`, kerros over). shots.json `rain: false` → pisarat leijuvat kimaltavina helminä (`mode:'frozen'`, kello = shotin t0).
Ohitus `BGX(f, code, {rain: false})` (ei sadetta) tai `{rain: {mode:'fall'|'frozen'|'collapse', clock, collapseT, k}}`, `freezeT`. Sade käyttää globaalia aikaa → jatkuu saumatta leikkausten yli.

### 17.4 Efektit (`t` = efektin oma aika)
- **Itachi (fx_ij.js / fx_ij3.js):** `fxCrows(g, t, {c, n, r, mode:'swirl'|'burst'|'gather'|'stream', from, to, dur, size, eyes})`, `fxFeathers(g, c, t)`, `fxCrowClone(g, F, ft, t)` + `IJ.cloneAlpha(t, dur)`,
  `fxAmaterasu(g, c, t, {r, h, n, k})`, `fxAmaterasuOn(g, F, ft, t)`, `fxAmaterasuRewind(g, from, eye, t)`, `fxFireball(g, a, dir, t, {r, charge, speed, travel})`, `fxHosenka(g, a, dir, t, {n})`,
  `fxShurikens(g, a, b, t, {n, curve, shadow})`, `fxMagatama(g, a, b, t, {n, rev})`, **`fxSusanoo(g, t, {at, yaw, stage 0..4, scale, k, arm, armL, swing, sword, shield, col})`** (1 kylkiluut → 2 luuranko + kallo → 3 lihaksikas
  puolivartalo → 4 panssari: huppu + pitkänenäinen naamio, Totsuka-pullo + nestemäinen tulimiekka oikeassa, Yata-peili vasemmassa; showdown `SUS(f, lt, o)`), `mangekyoInsert(g, t, {x, y, w, h, k, mk, spin, open, bleed})`
  (silmäsilmäys-insertti, piirrä `f.text`/`top`), `IJ.sharIris(g, x, y, r, {k, mk, spin})`, ruutuprosessit `ijTsukuyomiScreen(f, t, {k, moon})`, `ijLoopScreen(f, t, {k, n})` (Izanami), `ijGenjutsuScreen(f, t, {k, at, bind})`.
- **Julius:** `fxClockCircle(g, c, n, t, {r, k, spin, hands, handsT, numerals})` (showdown `CLOCK`), `fxClockShield(g, c, n, t, {r, hit})`, `fxChronoStasis(g, c, t, {r, lock})`, `fxTimeBullets(g, a, b, t)`, `fxTimeRewind(g, c, t)`,
  `fxFireballAge(g, c, t, {r, age})`, `fxManaSense(g, c, t, {r})`, `fxManaZone(g, c, t, {r})` (+ areenan `clockScar`), `fxGears(g, c, t, {n, r})`, `fxHourglass`, `fxGrimoire(g, p, t, {open, flip})`, `fxManaAura(g, F, t)`,
  `fxWizardCrest(g, x, y, s)`, `fxGoldTrail(F, t, n)`, ruutuprosessi `ijTimeStopScreen(f, t, {k, at, dur, keep})` (maailma harmaansiniseksi kellorenkaan levitessä).
- **Sade:** `fxRain(g, t, {k, clock, mode, collapseT, c, r, n, speed, wind, splash})`.
- Kerrokset: hehkut ja kellopiirit `glow`; varikset, liekit, Susanoo, ammukset, sade `over`.

### 17.5 Impact-tyylit ja -sarjat (impact_ij.js)
Tyylit: `mangekyo amaterasuneg tsukuyomired crowscatter susanooflare izanamiloop uchihafan clockfreeze goldtime manaburst chronorewind crestflash bwhalftone faceneg lightningneg rulestamp crowswirl eyered mangekyoeye goldeyes
timefreeze crowburst goldspeed firebloom emberage shadowshuriken desatflame giantsil manasonar powercardI powercardJ`.
**shots.jsonin nimet toimivat suoraan:** `LIGHTNING_NEG RULE_STAMP CROW_SWIRL EYE_RED POWER_CARD_I POWER_CARD_J TIME_FREEZE CROW_BURST GOLD_SPEED FIRE_BLOOM EMBER_AGE SHADOW_SHURIKEN MANGEKYO_EYE DESAT_FLAME GIANT_SIL MANA_SONAR GOLD_EYES`
+ uudelleenväritetyt `DUAL_TONE RED_BLACK_SPLIT WORLD_BREAKER` (vasen punamusta | oikea kulta-sininen) + omat `MANGEKYO_FLASH AMATERASU_BURN TSUKUYOMI_RED CROW_SCATTER SUSANOO_FLARE IZANAMI_LOOP UCHIHA_FAN CLOCK_FREEZE TIME_GOLD MANA_BURST CHRONO_REWIND WIZARD_CREST` + vanhat.
**BURST (≥ 5 tyyliä ≤ 1 s, vaihto 1–2 framen välein):** `burstSeq(pattern, {who, rev, split, part, fig})` kuviokoodista (`W N H S F K C R RB G BLK D L`, impact_requests.md); valmiit `FIRST_CLASH GENJUTSU_BURST AMATERASU_BURST
REWIND_BURST SUSANOO_BURST MANAZONE_BURST CLASH_BURST`; `shotT` rakentaa BURSTin automaattisesti shots.jsonin `pattern`ista (`impact.burst`). Satunnaistettu `IJ.burst({frames, who, seed})` + `BURST BURST_ITA BURST_JUL BURST_CLASH`.
F-askel (kasvo-invert) käyttää shotin figuuria `impact: {fig: indeksi}` (f.fig-järjestys); osa `part: 'eyes'|'face'`.

### 17.6 Iskunimet ja kortit (fx_ij2.js, pre/text_style.md)
`attackTitle(g, lt, {style, text, kind, pre, sub, t0, dur, x, y, align, size, side})`:
**CROW** = `style:'crow'` (= `'uchiha'`): Dela Gothic One, täyttö #0c0a0c → #5a0a12, sisällä 3 px punainen hehkuviiva, reunat 6+ px #c8102a + 10 px musta + 24 px punahehku (±15 % hengitys), punainen täysikuu takana, varikset muodostavat
kirjaimet (sisään 7 fr: varikset → kuu → tomoe-välähdys → asettuu), 3–6 varista lentää läpi, sulkia karisee; ulos kirjaimet variksiksi oikealta vasemmalle. `kind: red | amaterasu (täysmusta + violetti liekkihehku) | fire | card`. Kanji Yuji Boku punainen + musta reuna.
**WIZARD** = `style:'wizardking'` (= `'chrono'`): Cinzel Decorative Bold, kulta #fff2c0 → #ffd36a → #c9902a + sininen #6aa8ff alareuna, reunat 4 px #1a2050 + 8 px #e8b84a + kulta/sininen hehku, kellotaulu-rengas 1,3 × tekstin leveys
(I–XII, kaksi viisaria, kaksi ratasta), kirjaimet napsahtavat kuin tikitys, kiiltoraita; `kind: time | stasis (viisarit pysähtyvät) | rewind (viisarit taaksepäin)`; MANA ZONE 220 px. Ulos: kultapölyksi.
`ijMoveTitle(lt, text, {who})` → oikea tyyli/kanji/etuliite (`IJ_MOVES`). Kortit: `fighterCard(g, lt, {who:'itachi'|'julius', side, t0, dur, title, sub})` (pystykanji うちはイタチ / 魔法帝, ikonit) + `vsCard`.

### 17.7 Kamera ja katsomo (showdown/common.js)
`heroRise(F, lt, {dur, az, az1, from, to})` matala nousu jaloista kasvoihin pienellä kaarella, `arcCam(figs, lt, {dur, az0, az1, el0, el1, low, fill})`, `pushFace(F, lt, {dur, from, to, az, part})`, `gcam`, `faceCam` + moottorin apurit.
Katsomo: `IJ.crowdShot(f, lt, {focus:'shunsui'|'dazai'|'both', rS, rD, part:'bust'|'face'|'two', az, push, react ('freeze' = harmaat pysähtyneet siluetit + pysähtyneet pisarat), flash:'red'|'gold', flashT, canopy})`.
Shunsui istuu VASEMMALLA, Dazai OIKEALLA, ympärillä 12 istuvaa siluettia + etualan päät + katoksen reuna josta sade valuu. Reaktiot: Shunsui `kyo_kneeSlap kyo_point kyo_cupRaise kyo_cupWave kyo_laugh verdict toast smug oops hush eyesWide sweat`,
Dazai `dazai_sitSmile dazai_headTilt dazai_chinPoint dazai_watch watch knowing explain narrow smile shock sigh`.

### 17.8 Moottorin yleislaatu (ydinmuutokset tässä projektissa)
- faces.js: `face.eyeHook(st, S, D, e)` (pose-riippuva silmätyyli) + `eye.irisFn(c, x, y, ir, pr, e, mirror, lod)` (oma iiris: Sharingan, Mangekyō, kelloiiris, sokea).
- body.js: `haori.patternFn(c, surf, G, sg, S, D)` ja `sleeve.patternFn(...)` (viitan kuviot: Akatsuki-pilvet, kultareunus + vaakuna); figAlpha-hahmojen `noAlpha`-osat piirretään läpinäkymättöminä (variksiksi hajoaminen).
- Pitkät suljetut takit: `IJ.coatOrder` pitää housut/reidet viitan etupaneelin takana matalista kulmista.
