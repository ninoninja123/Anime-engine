# FORMAT: Record of Ragnarok -tyyli (videoiden perusmuoto)

Kaikki videot tehdään "Record of Ragnarok" -taisteluareenan muotoon: kaksi (tai useampi) taistelijaa, kuuluttaja, katsomo ja taistelu loppuun asti. Tämä on oletus; poikkeukset vain käyttäjän erikseen pyytäessä.

## 1. Rakenne (n. 170–180 s)
1. **Avaus (0–20 s):** areenan esittely (yleiskuva, soihdut/valot, yleisön hurina), kuuluttaja avaa energisesti ("Tänään näemme eeppisen taistelun!"). Ei kuivaa luettelua.
2. **Säännöt:** kuuluttaja kertoo ne heti: taistelu kestää kunnes toinen kuolee tai ei pysty jatkamaan (esim. kaatuu selälleen). Tarvittaessa ring-out. Visuaalina areenan reuna ja kaatuneen hahmon siluetti.
3. **Esittelyt:** kummallekin oma sisääntulo (matalat nousut, kaarrokset, hidas hero-kuva), huudettu esittely ("FROM THE UCHIHA CLAN... ITACHI!!"), hahmokortti (nimi, titteli, tunnusteksti, pystykanji), sitten **VS-kortti** ja **BEGIN-gongi**.
4. **Taistelu:** ensimmäinen isku alle ~20 s. Dramaturgia nousee portaittain: koe-iskut → perustekniikat → vahvemmat muodot → käänne → tunneisku → huippu → loppuisku.
5. **Loppu:** viimeinen isku → pitkä impact-purske → hiljaisuus → hidas seuraus → yksi vahva lopetuskuva. Ei anticlimaxia, ei venytystä, ei loppukorttia.

## 2. Kuuluttaja (aina sama)
Urahara Kisuke kuuluttajana (`CH('URA', ...)`, ARENA-tekstityyli, vihreä tekstitys #9fe0a5): teatraalinen, innostunut, välillä pettyneen kuiva. Hän juontaa avauksen, säännöt, esittelyt ja kommentoi isot käänteet lyhyesti. Kuuluttajakuvat näytetään katsomon yläkulmasta/kuuluttajakopista (`BGX 'BOOTH'`).

## 3. Areena
Valhalla-kolosseumi (`engine/sets_hvg.js` 'valhalla'), uudelleenpuettu jokaiselle videolle (tunnukset portteihin, paletti, sää, vauriotaso `dmg` 0→3). **Yksi areena koko videon ajan**: vaihtelu tulee kamerasta, valoista, pölystä, säästä ja vaurioista, ei uusista paikoista. Muutama lyhyt insertti (<2 s) sallittu käänteissä.

## 4. Yleisö (katsomo)
- Pohja: **siluettien meri** (12+ istuvaa/seisovaa siluettia), jonka keskellä on 1–3 nimettyä hahmoa. Nimetty hahmo ei koskaan istu yksin näkyvissä.
- **Viisas** hahmo ymmärtää aina mihin suuntaan taistelu on menossa ja korjaa muiden virhetulkinnat rauhallisesti. **Kommentoija** heittää ennenaikaisia tuomioita ("Ha, he lost."), jonka viisas oikaisee.
- Esimerkki aiemmasta videosta: Dazai oli viisas ja Shunsui heitti ennenaikaisia tuomioita. Se oli vain ESIMERKKI, ei vakiopari: **yleisön hahmot valitaan joka videolle taistelijoiden ja tarinan mukaan**. Mahdollisia rooleja:
  - jonkun taistelijan kaveri/rivaali/mestari (esim. oppilas, joka huutaa kannustusta)
  - skeptikko, joka vähättelee ("Ei tuo tehoa")
  - innokas fani, joka hurraa joka iskulle
  - pelokas, joka peittää silmät
  - jumala-/ylhäisö-tyyppi, joka arvioi tyylikkäästi
  - vihollisen/vastapuolen edustaja, joka vannoo kostoa
  - vähätelty sivuhahmo, joka paljastuu viisaaksi
  Valitse hahmot taistelijoiden taustan ja sarjojen mukaan; kierrätä aiemmin tehtyjä hahmoja (esim. Dazai, Shunsui, Urahara, Gojo, Harry, Kenpachi, Aizen, Shinji, Gowther) vain jos ne sopivat, ja lisää uusia aina kun tarina hyötyy.
- 6–10 lyhyttä reaktiokuvaa videossa (1–2 s), osa maskattuina (käänteiden reaktiot); tekstityksenä dialogi (esim. DAZAI #c8a878, SHUNSUI #f4a6c8).
- Katsomon reaktiot: shock, narrow, knowing, smile, sigh, verdict, toast, smug, oops, laugh, hush, eyesWide, sweat. Isoissa hetkissä koko yleisö reagoi (`freeze`, pyörtyminen riveittäin, valon välähdykset kasvoilla).

## 5. Taistelijat
- Tunnistettavat tuntomerkit ja tunnusrekvisiitta pakollisia (esim. Juliuksen grimoire).
- Taistelijat **puhuvat toisilleen** (lyhyet repliikit, provokaatio, tunne, oivallus) tekstityksinä; ei hiljaista tappelua.
- Iskunimet isolla, hahmokohtaisella fontilla (Naruto: SHINOBI, Luffy: PIRATE/NIKA, Itachi: CROW, Julius: WIZARD, Hulk: COMIC, Yujiro: BAKI, kuuluttaja: ARENA).

## 6. Kamera ja leikkaus
- Kamera aina liikkeessä (orbit, dolly, crane, whip, handheld), isot hahmot kuvassa, kasvot selkeinä 720p:ssä.
- Tempo seurattava: keskim. 1,5–2,5 s per kuva, nopeita leikkauksia vain huippuhetkissä, hengitystilaa iskujen välissä; sisäleikkauksia tahtiin, ei metronomia.
- **Impact-framet:** oikean animen tyyliin (koko ruudun iskuhetki, negatiivi, speedlinet, siluetti, shockwave, ink-freeze), tiheät purskeet (5 eri framea ≤ 1 s) isoissa iskuissa; naamavälähdyksiä korkeintaan 1/3.

## 7. Ääni
Epidemic Sound -musiikki, 3–4 pitkää kappaletta tunteen mukaan, vaihdot käännekohdissa; musiikki −7…−8 dB SFX:n alla; ducking impactissa ~7,5 dB; 400+ SFX-tapahtumaa kerroksittain (whoosh + impact + sub + detaili); gongi, yleisön hurina, hahmokohtaiset äänet. -14 LUFS, true peak ≤ −2 dBTP ennen AAC:ta.
