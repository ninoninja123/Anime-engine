### Laatuportti (P, ilman spoilereita; käänteiden tarkistus: spoilers.md "Juonen selkäranka" ja "Istutukset -> maksut")

Käyttäjän palaute edellisestä videosta (naruto-vs-luffy) on kohdat 1-9; jokainen on tarkistettu alla.

| kriteeri | tila | huomio / korjaus |
|---|---|---|
| Kesto 170-180 s (max 180) | OK, 178,0 s | 104 shottia (keskimäärin 1,71 s), 720p 24 fps |
| Formaatti Record of Ragnarok | OK | Valhalla yöllä sateessa (uusi puku: punainen kuu, lyhdyt, märkä hiekka), Urahara, kortit + VS, BEGIN-gongi 15,32 |
| **Urahara kertoo säännön heti alussa** | OK | A02 "Welcome to Valhalla~! One rule tonight:" + A03 sääntökuva (kehän reuna, kaatuneen ääriviiva): "It ends when one dies... or never rises." ennen hahmoja |
| **1. Sisääntulot + ensimmäinen isku < 20 s** | OK, **16,99 s** | Itachi: matala nousu varisparvesta + kaarros 40° (A04), ECU Sharingan (A05); Julius: matala orbit 90° pysähtyneen sateen läpi, kellotaulu-taikapiiri (B01), molemmilla kortti. Koukku: syöksy sadepilvistä + varis linssissä 1,2 s |
| **2. Musiikki: vain klassista, tunteen mukaan, pitkät kappaleet** | OK | 3 Epidemic-levytystä (Odyssey Orchestra): **Åsen kuolema** (Itachi: surumielinen, synkkä; kehystää alun ja lopun), **Myrskyisä ilta** (82 s yhtenäisenä: Juliuksen vaskiaksentit + kasvava taistelu), kolmas spoilers.md. Kuunneltu/analysoitu 9 ehdokasta (RMS-, spektrikeskiö- ja onset-käyrät, music_map.md). Vaihdot vain 10,60 (Juliuksen sisääntulo) ja isoissa käänteissä (spoilers.md) |
| Musiikki kuuluu (−7…−8 dB SFX:n alla), ducking ~7,5 dB | OK (mitattu) | stems (100 Hz HP, 0,4 s lohkot, aktiiviset): toiminta −3,4 / −3,2 dB samalla mittarilla, jolla naruto-vs-luffy = −2,7 (≈ nimellinen −7,3…−8) -> hieman maltillisempi; ducking dk 0,58 = 7,5 dB; music_boost nostaa Åsen hiljaisen alun (+5,6 dB) ja Myrskyisän illan keskijakson (+3,2 dB) |
| Ei pitkiä hiljaisia kohtia | OK | musiikiton vain 2 tarkoituksellista kuoppaa (1,1 s ja 2,0 s, spoilers.md) |
| **3. Äänitehosteet: paljon, kerrostettu** | OK, **777 tapahtumaa** | joka iskussa whoosh + impact + sub + detaili; sadematto joka shotissa (katkeaa kun aika pysähtyy = kuultava sääntö); hahmoäänet: varisten siivet + raakunta (7 uutta Epidemic-tiedostoa), Sharingan-shimmer, tikitys/rattaat/tornikello, aikaloitsut ja kelaus (5 uutta), aavetuli (Amaterasu), Susanoo-kuoro, shurikenit; 21 uutta Epidemic-SFX:ää |
| **4. Loppu ilman anticlimaxia** | OK (spoilers.md) | viimeinen isku -> 2 s BURST + musiikin loppusoinnut -> hiljaisuus -> hidas seuraus -> yksi lopetuskuva; ei loppukorttia eikä viivytystä |
| **5. Impact framet: tiheät purskeet** | OK | **13 BURSTia** (≥ 12 vaadittu; ≥ 5 eri tyyliä 12 ruudussa = 0,5 s, finaalissa 48 ruutua) + **60 tavallista sarjaa** (≥ 40); BURST-tunniste `impact.burst` + `tags:["BURST"]`; toteutus + fallbackit impact_requests.md |
| **6. Yleisö: Dazai (viisas) + Shunsui (hätäinen) siluettien keskellä** | OK | 8 reaktiota (4 näkyvää C03, C14, D03, D12 + 4 maskattua); Shunsui tuomitsee ennenaikaisesti, Dazai korjaa rauhallisesti; sommittelu siluettien välistä (crowd.md); vain tekstitys + pieni foley |
| **7. Isot iskunimifontit, omat tyylit** | OK | CROW (Itachi: musta-punainen, Yuji Boku -kanji, varikset muodostavat kirjaimet), WIZARD (Julius: Cinzel Decorative kulta + sininen, kellotaulu-rengas); 150-220 px, ei tekstitysten päällä |
| **8. Kamera aina liikkeessä, kasvot selkeinä, sisäleikkaukset** | OK | jokaisella shotilla `move`; 12 hand2d-lähikuvaa Itachista ja 10 Juliuksesta (näkyvät); sakuga-shotit merkitty `inserts` (C01, B01, C16, D08, D17...); hiljaisuuskuopat: genjutsu-lowpass 35,3, hengähdys C22, Mangekyō C23-C25 |
| **9. −14 LUFS, true peak ≤ −2,0 dBTP ennen AAC:ta** | OK (preview) | preview_mix.wav −14,0 LUFS, −2,1 dBTP (mix.py: loudnorm + lopputrimmi takaa molemmat) |
| Repliikit ≤ 8 sanaa, englanti | OK | 23 näkyvää + 22 maskattua |
| Molemmille oivallus-hetket | OK | Itachi: "Your magic needs a target." (C05) + spoilers.md; Julius: "Eyes are your trap." (C13) + spoilers.md |
| Taktinen sota | OK | klooni tiedustelee säännön, varjo-shuriken, genjutsu vs silmät kiinni, manattomat varikset harhautuksena, Amaterasu vs aika, magatamat käännetään |
| Epävarmuus voittajasta + oikea käänne + tunneiskut | OK | 18 heilahdusta (spoilers.md); molemmat välillä ylivoimaisia; käänteet perustuvat kaanonin sääntöihin (research.md) ja jokaisella ≥ 2 istutusta |
| Kasvot 720p:ssä | OK | tunnusmerkit cast.md (kyynelurat, punaiset pilvet, vaalea tukka + hymy, kultainen kellotaulu) |

**Tunnetut riskit:** (1) Pysähtynyt sade on koko videon visuaalinen sääntö: E:n kannattaa tehdä yksi `rain`-efekti, jossa `frozen` 0..1 (pisarat pysähtyvät kimaltaviksi pisteiksi) ja jota
shots.jsonin `rain`-kenttä ohjaa. (2) 13 BURSTia vaatii `burstSeq(pattern)`-apurin; ilman sitä E rakentaa listat käsin impact_requests.md:n taulukosta. (3) Susanoo on iso: laajoissa
kuvissa mittakaava (pienet siluetit katsomossa, Julius pienenä sen jalassa) pitää säilyttää. (4) Myrskyisän illan keskijakso 34,6-55,6 on hiljaisempi: miksauksessa nostettu +3,2 dB;
jos se tuntuu silti ohuelta, nosta `music_boost` 1,45 -> 1,6 (events.json automation, make_preprod.py).
