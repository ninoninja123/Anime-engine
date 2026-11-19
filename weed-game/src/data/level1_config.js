// PROLOGI (taso 1) "Prologue: Weed and GB": hahmot, mittakaavat, juoksuosuuksien esteradat, taistelujen arvot.
// Sivuhahmot (Sakura, Sasuke, Nero, vahtikoira/tosa, Mel, Hook, Blue) ovat PLACEHOLDER-koiria: olemassa olevat mallit ja
// lookit / pelkkä tint (characters.js PROLOGUE_MODELS, yksi rivi per hahmo). PLACEHOLDER: user model pending.
// Canon: docs/weed-game/canon-deep-dive.md (jaksot 1–2).
import { CHARACTERS, MODELS, PROLOGUE_MODELS } from '../characters.js';

const RIG = { belly: 0.4, neck: 0.32, tail: 0.25, legSwing: 0.5, headAmt: 1 };
const side = (id, name, role, x = {}) => {
  const m = PROLOGUE_MODELS[id];
  const c = { name, kind: 'rigged', model: m.model, height: m.height, role, placeholder: true, gallery: false, gait: 'trot', speed: 1, wag: 0.4, outline: 0.009, ...x };
  if (m.look) c.look = m.look;
  if (m.tint) c.tint = m.tint;
  return c;
};
// Uudet hahmot (lisätään CHARACTERS-tauluun; placeholderit eivät näy Lauma-galleriassa).
export const PROLOGUE_CHARS = {
  weed_pup: {   // Weed pentuna: käyttäjän Weed-malli, pienempi, iso pää ja lyhyemmät jalat
    name: 'Weed (pup)', kind: 'rigged', model: 'weed_rigged', height: 0.5, bones: { head: 1.18, legs: 0.9, tail: 0.9 },
    role: 'Gin and Sakura\'s son, a few months old.',
    gait: 'light', speed: 1.2, wag: 0.8, rig: { ...RIG, belly: 0.36, neck: 0.36, tail: 0.24, legSwing: 0.55 }, outline: 0.012, gallery: false,
  },
  sakura: side('sakura', 'Sakura', 'Weed\'s mother.', { gait: 'light', wag: 0.3 }),
  sasuke: side('sasuke', 'Sasuke', 'GB\'s partner in Nero\'s gang.', { gait: 'light', wag: 0.9 }),
  nero: side('nero', 'Nero', 'Boss of a gang of strays in the northern Alps.', { gait: 'heavy', wag: 0.05 }),
  tosa: side('tosa', 'Farm Tosa', 'The chained watchdog of a farm in the northern Alps.', { gait: 'heavy', wag: 0.1, rig: { belly: 0.36, neck: 0.32, tail: 0.18, legSwing: 0.38, headAmt: 0.7 } }),
  mel_pup: side('mel_pup', 'Mel', 'A young golden retriever in Jōshū.', { gait: 'light', wag: 0.9 }),
  hook: side('hook', 'Hook', 'A chained house dog in Jōshū.', { wag: 0.5 }),
  blue: side('blue', 'Blue', 'Boss of a band of stray thieves in Jōshū.', { wag: 0.1 }),
};
for (const [id, c] of Object.entries(PROLOGUE_CHARS)) {
  if (!CHARACTERS[id] && MODELS[c.model]) CHARACTERS[id] = c;
}

// Tason näyttelijät: rooli -> hahmo-id. (Kohtausskriptit viittaavat rooliin, esim. 'weed' = pentu.)
export const ACTORS = { weed: 'weed_pup', gb: 'gb', smith: 'smith', sakura: 'sakura', sasuke: 'sasuke', nero: 'nero', tosa: 'tosa', mel: 'mel_pup', hook: 'hook', blue: 'blue' };

// Osioiden nimet (tarkistuspistekehote "Continue", ?level=1&section=N).
export const SECTION_TITLES = ['Opening – the scrap', 'The farmyard', 'The farm Tosa', 'Sakura', 'Jōshū – the dog catcher', 'Blue', 'The truck', 'Ending – the road to Ōu'];

// PELAAJAN ARVOT (säätö + perusteet: docs/weed-game/level1-tuning.md)
export const PLAYER = {
  run: {
    jumpV: 7.6, gravity: 25,  // ilma-aika 0.61 s, huippu 1.16
    clearFrac: 0.65,          // hypyn pitää olla yli clearFrac × esteen korkeus, kun este ohittaa Weedin
    duckT: 0.8,               // kyyristyksen kesto (s)
    iconAt: 10,               // varoitusikoni näkyy, kun este on alle iconAt yksikön päässä (myös haukun kantama)
    invT: 1.5,                // osuman jälkeinen suoja-aika (s)
    tutAt: 2.4, tutSlow: 0.2, // ensimmäinen este per laji: hidastus tällä etäisyydellä
  },
  fight: {
    hearts: 4, invT: 1.3, tutSlow: 0.3,
    chargeRunUp: 4.2,         // rynnäkkö alkaa vähintään näin kaukaa (koira perääntyy ensin)
    chargeMinT: 0.45,         // rynnäkön alusta Weediin vähintään (s)
    jumpClear: 0.42,          // rynnäkkö ei osu, jos Weed on tätä korkeammalla
  },
};

// Juoksuosuudet: esteet etäisyyden mukaan (x = matka lähdöstä). log/fence/hay/crate = hyppy (↑), beam/net = kyyristy (↓), geese = haukku (napautus).
export const RUNS = {
  farm: {
    title: 'The farmyard', speed: 5.8, length: 132, hearts: 4, card: true,
    hint: 'Swipe ↑ = jump &nbsp;•&nbsp; Swipe ↓ = duck &nbsp;•&nbsp; Tap = bark',
    obstacles: [
      [14, 'log'], [24, 'log'], [33, 'beam'], [43, 'geese'], [52, 'fence'], [60, 'beam'], [68, 'hay'],
      [76, 'geese'], [83, 'log'], [90, 'beam'], [97, 'fence'], [104, 'crate'], [111, 'geese'], [118, 'beam'], [125, 'log'],
    ],
    calls: [[30, 'p_gb_run'], [64, 'p_sasuke_help'], [100, 'p_gb_hurry']],
  },
  town: {
    title: 'Jōshū – the dog catcher', speed: 6.2, length: 112, hearts: 4, card: true,
    hint: 'Lead Mel away! &nbsp;Swipe ↑ = jump &nbsp;•&nbsp; ↓ = duck under nets &nbsp;•&nbsp; Tap = bark',
    obstacles: [
      [14, 'crate'], [23, 'net'], [31, 'crate'], [39, 'net'], [47, 'fence'], [54, 'geese'], [61, 'net'],
      [68, 'crate'], [75, 'net'], [82, 'fence'], [89, 'net'], [96, 'crate'], [103, 'net'],
    ],
    calls: [[20, 'p_weed_follow_me'], [58, 'p_gb_this_way'], [92, 'p_smith_almost']],
  },
};

// Kevyt kaksivaiheinen taistelu (ei Kaibutsun panssaria): hp, nopeus, hyökkäysten painot.
export const FIGHTS = {
// tele* = varoitusaika ennen iskua (s, jaetaan nopeudella): Charge, Lunge (purenta), Fake (harhautuksen 1. "!"), Feint (todellinen), Mel.
  tosa: { name: 'FARM TOSA', sub: '(watchdog)', hp: 100, phase2At: 55, speed: 0.85, reach: 0.55, biteDmg: 4, attacks: ['charge', 'swipe', 'charge'],
    teleCharge: 0.95, teleLunge: 0.75 },
  blue: { name: 'BLUE', sub: '(Jōshū thieves)', hearts: 5, hp: 100, phase2At: 55, endAt: 18, speed: 1.0, reach: 0.6, biteDmg: 5, attacks: ['charge', 'swipe', 'feint'],
    teleCharge: 0.95, teleLunge: 0.75, teleFake: 0.35, teleFeint: 0.45, teleMel: 0.8, melDash: 2.2 },
};
