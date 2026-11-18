# Mitä luonnoksesta puuttuu ja arvio jatkosta

## Puuttuu tästä luonnoksesta
- **Matka-osuus** (auto-run, väistöt, toverin rekrytointi) – nyt taso alkaa suoraan bossista.
- **Lähikuva-ilmeet**: koirien kasvoilla ei ole ilmeriggiä (silmät/suu/kyyneleet). Koskettavissa hetkissä
  tunne tulee kamerasta, valosta, musiikista ja tekstistä. Seuraava iso parannus: muokattu malli, jossa
  silmäluomi- ja suuluu tai blend shapet (Blender), sekä omat animaatiot "ulvonta", "makaa", "nuolee haavaa".
- **Battōgan oma animaatio**: nyt pyörähdys = Gallop_Jump + koko mallin rotaatio. Oikea kierrehyppy
  kannattaa animoida erikseen.
- **Rodut**: kaikki käyttävät shiba-mallin muotoa. Tanskandogi/saksanpaimen tarvitsevat ainakin
  luukohtaisen skaalauksen (pidemmät jalat, kuono) tai 2–3 perusmallia.
- **Kaibutsun loppu** on yksinkertaistettu (putoaa vesiputouksen usvaan). Daisuke, Ken & Kagetoran
  putoaminen ja puunrunko jäivät pois PEGI 12 -rajauksen ja laajuuden takia.
- PWA:n service worker/offline, ikonit, tallennus useammalle tasolle, asetukset (vaikeustaso,
  "Tarina-tila"), suomi/englanti-valinta, haptiikka iOS:llä.
- Suorituskykymittaus oikealla puhelimella (headless-testissä ohjelmistorenderöinti, fps ei kuvaava).
  Automaattinen laadun lasku (bloom pois, kun frame > 20 ms) on vielä tekemättä; nyt käsin `?lowfx`.
- Äänet ovat syntetisoituja placeholdereita; oikea musiikki (piano + taiko) ja CC0-äänet myöhemmin.

## Arvio tasoista 1, 3–8 (animen tarina: prologi + Kaibutsu + Hōgen)
Pohja (moottori, koirat, eleet, kortit, cutscene-työkalut, sää) on nyt olemassa, joten uusi taso on
pääosin **dataa + skriptattuja cutsceneja + 1 uusi boss-kuviolista**.

| Taso | Sisältö (research.md) | Uutta tekniikkaa | Työmäärä* |
|---|---|---|---|
| 1 Prologi / Rosvojen tie | Sakura, GB antaa nimen, Mel, Smith, Blue suojelee rekalta | auto-run-osuus, rekka, GB-malli (setteri) | M–L |
| 3 Kaibutsun loppu (jos taso 2 jaetaan) | vesiputous, Jeromen syyllisyys | vesi/putous-tehoste | S |
| 4 Alppien vangit | Hōgenin vartijat, Johnin viimeinen taistelu | useampi pikkuvihollinen kerralla | M |
| 5 Hylättyjen pentujen kuningas | Kyōshirō, Lector & Thunder (2 bossia), Terun isä | kaksoisbossi-AI | M |
| 6 Kuuma lähde | Tesshin, Zetsu Tenrō Battōga (rytmi-QTE), Sanchō-villisika, Kamakiri | villisikamalli, rytmi-QTE | M–L |
| 7 Futago-solan lumimyrsky | Genba, Hōgen ja veljensä, Tōbee | lumimyrsky-sää, raskaat cutscenet | M |
| 8 Ōun henget | Hōgen (3 vaihetta), henget nousevat, Weed säästää | henkisiluetit (läpikuultavat koirat on jo `fade`), finaali | L |

*S ≈ 1 agenttisessio, M ≈ 2–3, L ≈ 4–5 (sisältää testauksen ja kuvakaappaukset).
**Kokonaisuus:** noin 15–25 agenttisessiota ennen kuin kaikki 8 tasoa ovat pelattavissa
luonnostason laadulla. Lisäksi 1–2 sessiota mallin parantamiseen (ilmeet, rodut), mikä nostaa
koskettavien kohtausten tasoa eniten.
