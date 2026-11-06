# Musiikkikartta: Itachi vs Julius

**Vain klassista, vain Epidemic Soundia** (käyttäjä: edellisen videon rock ja muut kappaleet olivat huonoja; valitse tunteen mukaan, pitkiä yhtenäisiä kappaleita, vaihdot vain isoissa
käännekohdissa). Kolme Odyssey Orchestran levytystä (säveltäjät public domain, äänitteet Epidemicin), viisi segmenttiä. Lähde-editointi: `audio/beats.json` (`edit`),
luotu `audio/analyze_beats.py`:llä. Raaka-analyysi `scratchpad/ivj/music_raw.json` (`analyze_music.py`), käsin tarkistettu `audio/music_analysis.json`.
Spoileriehto: 92,6 s jälkeiset käytöt kuvataan vain `pre/spoilers.md`:ssä.

## Valintaprosessi

Epidemicin aito klassinen orkesterikatalogi on rajallinen (haettu: Mozart Requiem / Lacrimosa, Verdi Dies Irae, Wagner Valkyrie, Holst Mars, Mussorgski, Beethoven, Tšaikovski,
Handel/Elgar, Bach, Vivaldi, Grieg, "majestic/dark/epic classical"; hakutulokset ovat pääosin Odyssey Orchestran Grieg/Vivaldi/Mozart-levytyksiä ja jousikvartettisovituksia).
Ehdokkaat analysoitiin 2 s:n RMS-, spektrikeskiö- ja onset-käyrinä (`scratchpad/ivj/tools/curve.py`, `onsets.py`):

| ehdokas | tunne / käyrä | päätös |
|---|---|---|
| **Grieg: Åsen kuolema** | 0-48 s matalat surumieliset jouset (−7…−20 dB, keskiö 0,7-0,9 kHz = tumma), 50-134 s pitkä crescendo fortissimoon, **äkillinen katkos 135,0** | **Itachi** (surumielinen/synkkä) + tunnekäänne (spoilers.md) |
| **Grieg: Myrskyisä ilta (Peer Gyntin kotiinpaluu)** | vaskiaksentit 0,56 / 6,39 / 12,27 / 15,19 / 19,68 / 22,79 (majesteettiset iskut), hiljaisempi 24-45, nousu 46-54, myrsky 76-110 | **Julius** (majesteettinen sisääntulo) + koko kasvava yhteenotto (82 s yhtenäisenä) |
| **Vivaldi: Kesä III Presto** | koko ajan forte (−4…−7 dB), huippu 128 ja 146-150, loppu 150,3 | finaali (spoilers.md) |
| Grieg: Ingridin valitus (Morsiamen ryöstö) | 0-17 räjähtävä, sitten pitkä hiljainen valitus | hylätty: liian pitkä hiljainen osa |
| Vivaldi: Talvi I | 0-38 hiljainen kasvava jännite, forte 40-58 | varalla (taktinen jännite), ei mahtunut 3 kappaleeseen |
| Vivaldi: Kesä II Adagio | surullinen + äkilliset presto-purkaukset | varalla |
| Grieg: Vuorenpeikon luola, Solveigin laulu | käytetty edellisessä videossa | ei toistoa |
| Vivaldi: Talvi II/III, Syksy III | | ei tunnetta tähän |

## Aikajana (video-sekunnit)

| video | kappale (kappaleen kohta) | dramaturgia | siirtymä |
|---|---|---|---|
| 0.00-10.60 | **Åsen kuolema** (0.00-10.60) | kylmä avaus sateessa, Urahara + sääntö, Itachin nousu varisparvesta, Sharingan, kortti: matalat surumieliset jouset | sisään 0,3 s fade / ulos: Myrskyisän illan ensimmäinen vaskiaksentti |
| 10.60-92.60 | **Myrskyisä ilta** (0.00-82.00) | **vaskiaksentti 11.16 = sade pysähtyy (Julius)**, 16.99 = ensimmäinen isku (BURST), 22.87 = varisklooni, 25.79 = pylväs, 30.28 = varjo-shuriken, 33.39 = genjutsu (BURST); hiljaisempi jakso 34.6-55.6 = sokea taistelu (music_boost +3,2 dB); **nousu 56.6 = Amaterasu**, aksentti 62.35 = Chrono Anastasis; myrsky 86.6-91.6, aksentti 90.78 = törmäys (BURST) | ulos: kappaleen oma notko (kpl 82,0), 0,35 s fade |
| 92.60-178.00 | katso `pre/spoilers.md` | | |

## Periaatteet

1. **Klassinen = aksentit:** rubato-levytyksissä ei ole tahtiruudukkoa, joten impactit lukittuvat vahvoihin spektrivuo-onseteihin (strength ≥ 0,85, ±0,22 s, `make_preprod.py`);
   tärkeimmät iskut (ensimmäinen isku, varisklooni, pylväs, varjo-shuriken, genjutsu, Amaterasu, Anastasis, törmäys) on käsin asetettu vaskiaksentteihin.
2. **Ei melodian katkaisua kesken fraasin:** Myrskyisä ilta alkaa alusta ja loppuu omaan notkoonsa; muut vaihdot spoilers.md.
3. **Tunne ennen tempoa:** Itachin teemana surumielinen, Juliuksen sisääntulona majesteettinen vaski, yhteenotossa kasvava myrsky, finaalissa huikein (spoilers.md).
4. **Tasot:** yksi gain per kappale koko elokuvalle (mix.py: koko tiedoston gated-RMS + `trim_db`; Åsen huippujakso −4 dB `TRIM_SEG`), **music_boost** hiljaisille kohdille.

## Miksaus

- **MUS_G 1,05** (nvl 0,69: tässä SFX-tiheys on paljon suurempi, 777 tapahtumaa), impact-ducking **~7,5 dB** (dk 0,58, palautus 0,85 s), SFX-sidechain max ~3,7 dB, repliikkien alla −2,9 dB.
- **Mittaus (preview stems, 100 Hz HP, 0,4 s lohkot, SFX-aktiiviset):** musiikki vs SFX: avaus −1,1, taktinen sota −3,4, Mangekyō vs aika −3,2 dB (nvl samalla mittarilla −2,7 ≈ nimellinen
  −7,3…−8 dB) -> **toiminnassa noin −8 dB nimellisasteikolla**, avauksessa musiikki selvästi esillä.
- Lowpass-automaatio (genjutsu särkyy 35,3 + maskatut), synteettiset sub-dropit 14 suurimman iskun alla, hiljainen tinnitus 2 kohdassa, room 1,1 s + hall 3,6 s.
- Master: kevyt RMS-kompressori, 16 kHz lowpass, 4x ylinäytteistetty lookahead-true-peak-limitteri −2,3 dBTP, iteroitu −14 LUFS:iin (vanha tanh-softclip + loudnorm teki litteän katon, josta AAC ylitti −0,3 dBTP:hen). **Lopullinen: −14,0 LUFS, −2,3 dBTP**; make.sh:n final-ketjun AAC −14,4 LUFS / −3,0 dBTP.

## Tarkistus (preview_mix.wav)

`scratchpad/ivj/preview_mix.wav`: **−14,0 LUFS, true peak −2,1 dBTP, LRA 5,7 LU**, 777 äänitapahtumaa. Varret `preview_mix_music.wav`, `preview_mix_sfx.wav`.
