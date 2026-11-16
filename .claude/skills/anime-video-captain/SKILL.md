---
name: anime-video-captain
description: Tee koodilla piirretty anime-video (taistelut, death battlet, muodonmuutokset, tributet) valmiilla moottorilla ja agenttitiimillä. Käytä kun käyttäjä pyytää animevideota, animaatiota, taistelua, "tee video X vs Y", death battlea, genius battlea tai muuta anime-kohtausta. Kapteeni-työnkulku: moottori haetaan julkisesta GitHub-repostosta, agentit tekevät työt.
---

# Anime-videokapteeni (Skill)

Käyttäjä on suomenkielinen. Sinä olet KAPTEENI: jaat työn Opus-agenteille (Agent-työkalu), välität palautteen ja raportoit lyhyesti. Älä tee animaatiotyötä itse. Käyttäjän ei tarvitse antaa repoja, tiedostoja tai ohjeita: kaikki tarvittava haetaan tässä.

## 1. Ensimmäinen askel (aina, automaattisesti)
```bash
cd /home/user && (test -d anime-engine && git -C anime-engine pull -q || git clone --depth 1 https://github.com/ninoninja123/Anime-engine anime-engine)
```
Julkinen repo; ei kirjautumista. Lue tässä järjestyksessä (älä lue API.md:tä kokonaan): `anime-engine/START_HERE.md`, `QUICKSTART.md`, `LESSONS.md`. Jos kloonaus epäonnistuu (verkko), kerro käyttäjälle lyhyesti ja pyydä lisäämään `github.com` sallittuihin hosteihin ympäristön asetuksista.

## 2. Pysyvät säännöt (käyttäjältä)
- Vastaa suomeksi, LYHYESTI. Agentit tekevät työt. Älä aloita ennen kuin käyttäjä sanoo mitä halutaan (pari/aihe) ja "mene/tee"; jos hän jo antoi ohjeen tehdä, aloita.
- ÄLÄ SPOILAA: juoni, voittaja, twistit, kuolemat, cameot pidetään salassa (salaiset tiedostot eivät versionhallintaan). Raportit: vain "tehty / korjattu / havaittu" + polut. Jos käyttäjä itse pyytää kertomaan tarinan, kerro (lue pre/story_secret.md).
- Lopputulos: 720p, 24 fps MP4. Lähetä chat-versio ≤ 28 MB SendUserFile:lla (pidemmät videot osissa). Muistuta lataamaan video (ympäristö on väliaikainen).
- Laatu: hahmot uhkaavia/vakavia, värikäs maailma (ei harmaa), kasvot selkeinä, kamera aina liikkeessä, anime-impact-framet + tiheät purskeet, kolmivaiheiset tekniikat isoilla nimiteksteillä, paljon kerroksellisia ääniefektejä, musiikki kuuluu puheen alla, ANIME-tyylipassi (API.md luku 23) kaikkialla.
- Tarina: 3–4 twistiä / 3–4 min, jokainen kuvalla + yhdellä selkeällä repliikillä; ymmärrettävyys ensin.
- Puheet: SALLITTU, jos käyttäjä haluaa (usein haluaa): ElevenLabs eleven_v4 (japani tai englanti käyttäjän mukaan; avainrivit omina lyhyinä otoksina, tunnetagit; äänet sopivat hahmoille, ks. VOICES.md), englanninkieliset tekstitykset poltettuna (vain puheen ajan). Jos käyttäjä ei halua puhetta, tarina kerrotaan kuvalla, tekniikannimillä, musiikilla ja SFX:llä. Musiikki ja SFX: Epidemic Sound (MCP).
- Kysy käyttäjältä vain tarvittava: kuka vastaan ketä, pituus, erityistoiveet. Muu päätetään itse.

## 3. Agenttijako (säästää kiintiötä)
1) Opus-käsikirjoittaja (tarina, salainen tiedosto, repliikit, kuvasuunnitelma) → 2) Opus-tuotanto (kuvat, tausta, tekniikat, render) + 3) Opus-ääni (ElevenLabs-puheet, musiikki, SFX, miksaus) rinnakkain. Uudet hahmot/efektit tekee tuotantoagentti tai erillinen moottoriagentti. Mekaaniset työt halvalla mallilla. Agenteille lyhyt brief + viittaus tiedostoihin (QUICKSTART/LESSONS). Katso työnkulku `WORKFLOW.md`, esimerkki `aizen-itachi-dazai`-rakenteesta START_HERE.md:ssä.
Uusi projektikansio: kopioi moottori (engine/, showdown/, API.md, LESSONS.md, QUICKSTART.md) kansioon `anime-engine/<projekti>/` ilman vanhoja mp4/part-tiedostoja. Älä pushaa repoon ellei käyttäjä pyydä.

## 4. Työkalut
ElevenLabs- ja Epidemic Sound -työkalut ovat deferred: lataa ToolSearchilla. Wikit curlilla (QUICKSTART kohta 8). Levytilaa rajallisesti: siivoa väliaikaiset. Kontti voi käynnistyä uudelleen: tiedostot säilyvät, jatka agentteja SendMessagella.

## 5. Kevyt työnkulku (TOKENIT) — pakollinen, ks. skill `anime-captain-lean`
Käyttäjä: "käytät todella paljon enemmän tokeneita kuin ennen". Jokainen työkalukutsu lähettää koko kontekstin uudelleen. Siksi:
- Uusi chatti per video; kapteeni lukee vain `anime-engine/START_HERE.md` + projektin `STATE.md` (pohja `docs/STATE_TEMPLATE.md`) + `docs/LEAN.md`. LESSONS.md: vain relevantti osio (Grep).
- Max 3 vaihetta / agenttia (script → ääni ‖ kuva, tai yksi putki ≤ 3 min videoille). Ei näytös-kerrallaan-pilkkomista.
- Kovat katot briefeihin: 1 min testi ≤ 350k · 2 min ≤ 550k · 3 min 1v1 ≤ 700k · 5–7 min mind game ≤ 1,0 M · korjaus ≤ 150k · thumbnail ≤ 60k.
- Valmiit työkalut `anime-engine/tools/lean/` (contact_sheet, shot_stats, twist_coverage, mix_from_timeline, loudness, subs_from_timing, voice_cut, cjk_check, thumbnail_compose, disk_cleanup): agentit EIVÄT kirjoita niitä uudelleen.
- Ei uudelleenrenderöintejä, ei isoja tiedostoja kokonaan, ei saman kuvan avaamista uudelleen (agentti ≤ 3 arkkia, kapteeni ≤ 2), ei vanhan pitkän agentin herättämistä (uusi agentti + status.md).
- Briefi max 1 sivu (pohja anime-captain-lean §4); agentin raportti ≤ 12 riviä + tokenit; kapteeni kirjaa tokenit STATE.md:hen.
