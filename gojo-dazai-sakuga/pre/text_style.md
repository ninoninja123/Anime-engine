# Tekstityyli: iskunimet, hahmokortit, kuulutukset ja tekstitykset (P -> E)

Käyttäjä: **isot luettavat iskunimifontit, Itachille oma synkkä mustapunainen tyyli, Juliukselle majesteettinen kulta/sininen WIZARD-tyyli, 720p-luettavuus.**
Kolme ilmettä: **CROW** (Itachi), **WIZARD** (Julius), **ARENA** (Urahara, BEGIN, WINNER, kortit; sama kuin harry-vs-gojo / naruto-vs-luffy).
Mitat 1920x1080-koossa (1280x720 = kerroin 0,667). **Mikään ruututeksti alle 44 px.** Iskunimen pääsana ≥ 150 px.

## Fontit (asennettu koneelle + `engine/fonts/`)

| tyyli | fontti | varafontti | kanji / japani |
|---|---|---|---|
| **CROW** | `Dela Gothic One` (paksu, kulmikas) | `Inter Display` Black | `Yuji Boku` (pensseli): 天照, 月読, 須佐能乎, 写輪眼, 万華鏡, 火遁, イザナミ |
| **WIZARD** | `Cinzel Decorative` Bold (antiikva, majesteettinen) | `Caladea` Bold / `FreeSerif` Bold | – (kellotaulun roomalaiset numerot koristeena) |
| **ARENA** | `Caladea` Bold + `Inter` 800 (kuten harry-vs-gojo) | `FreeSerif` Bold | – |
| **SUB** | `Inter` 700 | `DejaVu Sans` Bold | – |

Jos `Cinzel Decorative` puuttuu `engine/fonts/`ista: E lisää sen (Google Fonts, OFL) tai käyttää `Caladea` Boldia isoilla kirjaimilla ja 6 % letterspacingilla.

## 1. CROW (Itachi)

Esimerkit: `GENJUTSU: SHARINGAN`, `KATON: GŌKAKYŪ NO JUTSU`, `KATON: HŌSENKA NO JUTSU`, `MANGEKYŌ SHARINGAN`, `AMATERASU`, `SUSANOO` (+ maskatut).
- **Koko:** pääsana 160-200 px; etuliite (`KATON:`, `GENJUTSU:`) 72 px omalle rivilleen. Kanji pystysarakkeena reunassa 120-150 px (Yuji Boku, punainen #d81a28 + musta reuna).
- **Täyttö:** musta #0c0a0c ylhäältä -> tummanpunainen #5a0a12 alas; kirjainten sisällä **ohut punainen hehkuviiva** (#ff2a3a, 3 px) kuin Sharinganin reuna. Amaterasu-iskuissa täyttö
  täysmusta ja reunasta nousee violetti-musta liekkihehku (#6a2a9a).
- **Reunat:** 1) 6 px punainen #c8102a (terävä), 2) 10 px musta #000 ulkoreuna, 3) hehku 24 px punainen 45 %.
- **Koriste:** tekstin takana punainen täysikuu-ympyrä (50 % peitto) ja 3-6 varis-siluettia lentää kirjainten läpi oikealta vasemmalle; kirjaimista karisee mustia sulkia.
- **Sisääntulo (7 ruutua):** varikset lentävät sisään ja **muodostavat kirjaimet** (2), punainen kuu-ympyrä laajenee (2), tomoe-välähdys (1: kolme pilkkua pyörähtää tekstin yli), asettuu (2).
- **Pito:** 0,9-1,4 s, hidas punainen hengitys (hehku ±15 %). **Ulos (5):** kirjaimet hajoavat variksiksi oikealta vasemmalle.
- **Sijainti:** ala-vasen tai ylä-vasen kolmannes (Itachin puoli = vasen).

## 2. WIZARD (Julius)

Esimerkit: `TIME MAGIC: CHRONO STASIS`, `TIME MAGIC: ACCELERATION`, `CHRONO ANASTASIS`, `MANA ZONE` (+ maskatut).
- **Koko:** pääsana 150-200 px versaalina, letterspace 4 %; etuliite `TIME MAGIC:` 70 px. `MANA ZONE` 220 px.
- **Täyttö:** kulta #fff2c0 -> #ffd36a -> #c9902a (metallinen, vaakasuora kiiltoraita #fffbe8 liukuu sisään); alapuolella ohut sininen #6aa8ff varjoreuna.
- **Reunat:** 1) 4 px tumma laivastonsininen #1a2050, 2) 8 px kulta #e8b84a, 3) hehku 30 px kulta 50 % + sininen 20 %.
- **Koriste:** tekstin takana **kellotaulu-rengas** (roomalaiset numerot I-XII, ohut kultaviiva 3 px, halkaisija 1,3 × tekstin leveys) ja kaksi viisaria, jotka liikkuvat tekstin ajan;
  kaksi pientä ratasta reunassa pyörii.
- **Sisääntulo (7 ruutua):** kellotaulu piirtyy myötäpäivään (3), kirjaimet "napsahtavat" paikoilleen yksi kerrallaan kuin kellon tikitys (3), kiiltoraita (1).
- **Pito:** 0,9-1,4 s, viisarit liikkuvat (Chrono Stasis -iskuissa viisarit PYSÄHTYVÄT; Anastasis-iskuissa ne kulkevat taaksepäin). **Ulos (5):** kirjaimet muuttuvat kultaiseksi pölyksi, joka kelautuu.
- **Sijainti:** ala-oikea tai ylä-oikea kolmannes (Juliuksen puoli = oikea).

## 3. ARENA (Urahara, BEGIN, WINNER, kortit): kuten harry-vs-gojo

- `BEGIN!` (240 px punainen + valkoinen reuna + gongirenkaat), `WINNER` (spoilers.md). Letterbox-banneri, kirjaimet putoavat (`attackTitle style 'arena'`).

### Hahmokortit (Record of Ragnarok -tyyli, 2,1-2,4 s, koko ruutu)

```
+--------------------------------------------------------------------+
|  [diagonaalinen paneeli, hahmon väri]              ROUND 1          |
|   ITACHI UCHIHA            <- nimi 170 px CROW                      |
|   THE CROW OF THE LEAF     <- titteli 64 px Inter 800, letterspace  |
|   ──────────────                                                    |
|   UCHIHA CLAN · MANGEKYŌ SHARINGAN   <- 44 px                       |
|   [ikonirivi]                     [hand2d-muotokuva oikealla]       |
+--------------------------------------------------------------------+
```
- **Itachi (`CARD_I`):** tausta musta -> syvä punainen #5a0a12, punainen pilvi vesileimana 12 %, Uchiha-viuhka 10 %, kanji うちはイタチ pystysarakkeena (Yuji Boku 120 px). Nimi CROW.
  Ikonit: varis, Sharingan, kunai, punainen pilvi. Muotokuva: Sharingan, kyynelurat, viilletty otsasuojus, sadepisarat.
- **Julius (`CARD_J`):** tausta laivastonsininen #1a2050 -> kulta, kellotaulu vesileimana 14 %, apila-grimoire. Nimi WIZARD. Ikonit: kellotaulu, grimoire, kruunu, tiimalasi.
  Muotokuva: hymy, vaalea tukka, viitta.
- **VS (B02 lopussa 0,8 s):** jaettu ruutu, vasen Itachi punamusta, oikea Julius kulta-sininen, diagonaalinen raja (vasemmalla varissulat, oikealla kellon viisari), keskellä `VS` 260 px ARENA.
- **Sisääntulo:** paneeli liukuu diagonaalisesti (4), muotokuva iskeytyy (impact `POWER_CARD_I` / `POWER_CARD_J`), nimi slam. **Ulos:** paneeli halkeaa (4).

## 4. Tekstitykset

- `Inter` 700, **52 px**, valkoinen, 8 px musta reuna, alaosan keskelle (y = 960). Puhujan nimi 30 px yläpuolella:
  **ITACHI #e8364a, JULIUS #f2c76b, URAHARA #9fe0a5, DAZAI #d9b77e, SHUNSUI #f4a6c8.**
- Max 2 riviä, max 8 sanaa, englanti (fansub). Kursiivi = genjutsun sisällä / kuiskaus (C25 "Amaterasu.").
- **Iskunimi ei koskaan tekstityksen päällä:** jos samaan aikaan on repliikki, iskunimi yläkolmannekseen. Katsomokuvissa ei iskunimiä.
- Urahara puhuu tekstityksenä myös kuvan ulkopuolelta (A03 säännön toinen puolikas on hänen äänensä sääntökuvan päällä).
- `showdown/common.js` `autoTitle` valitsee tyylin: shots.json `text_style` = `CROW` / `WIZARD` / `ARENA` / `CARD_I` / `CARD_J`.
