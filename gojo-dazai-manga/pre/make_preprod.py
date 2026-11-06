#!/usr/bin/env python3
"""ITACHI UCHIHA vs JULIUS NOVACHRONO - generate pre/shots.json, pre/storyboard.md and audio/events.json from ONE shot table.
(structure recycled from naruto-vs-luffy / hulk-vs-yujiro make_preprod.py)

usage: python3 -I pre/make_preprod.py        (run anywhere; needs audio/beats.json from audio/analyze_beats.py)
* Shot start times are VIDEO seconds snapped to the 24 fps grid; a shot ends where the next one starts.  DUR = 178.0 s (max 180).
* FORMAT: Record of Ragnarok -style (like harry-vs-gojo / naruto-vs-luffy): Valhalla arena (night, rain, red moon), Urahara announcer
  (subtitles + fan/gong SFX) who states THE RULE first, fighter cards, in the stands DAZAI (the wise one, always knows where it goes) next to
  SHUNSUI (premature verdicts 'Ha, he lost'), both seated among silhouettes.  Fight lasts until one dies or cannot rise again.
* MUSIC (audio/beats.json): ONLY CLASSICAL (Epidemic Sound): Grieg Death of Åse 0-10.60 -> Grieg Stormy Evening 10.60-92.60 -> katso spoilers.md.
  Impact frames snap to the nearest strong orchestral accent (+-0.22 s).
* IMPACTS: every impact series has `burst` (True = BURST: >= 5 different impact styles inside <= 1 s, style changes every 1-2 frames).
* SPOILER RULE: masked shots (mask='CLUE','TWIST','FINALE') carry only timing, camera class, impact timing and sound events here.
  Their content and dialogue live ONLY in pre/spoilers.md.  Never write outcome text into this file.
"""
import json, os

FPS = 24
DUR = 178.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
q = lambda t: round(round(t * FPS) / FPS, 4)

CH = dict(ITA='Itachi Uchiha (Naruto Shippuden)', JUL='Julius Novachrono, 28. velhokuningas (Black Clover)', URA='Urahara Kisuke (kuuluttaja)',
          DAZ='Dazai Osamu (VIISAS katsoja: tietää aina mihin taistelu menee, korjaa rauhallisesti)',
          KYO='Kyoraku Shunsui (katsoja: ennenaikaiset tuomiot, "Ha, he lost")', SUS='Itachin Susanoo (punaoranssi henkijättiläinen: Totsuka-miekka, Yata-peili)',
          CRW='Itachin varikset (karasu bunshin / genjutsu)', CROWD='areenan yleisö (siluetit)')
ENGINE_NAME = dict(ITA='itachi', JUL='julius', URA='urahara', DAZ='dazai', KYO='kyoraku', SUS='susanoo', CRW='crows', CROWD='crowd')
BG = dict(ARENA='Valhalla-kolosseumi YÖLLÄ (harry-vs-gojon valhalla, uusi puku): märkä hiekka, sade, punainen kuu pilvien raossa, soihdut sateessa, portit '
                '(länsi = Itachi: punaiset lyhdyt, varikset; itä = Julius: kultainen kellotaulu). Katsomoissa siluetteja. Vaurio `dmg` 0-3 kasvaa.',
          SKY='taivas areenan yllä: sadepilvet, salamat, punainen kuu', BOOTH='Uraharan kuulutuskoroke (sets_hvg BOOTH) sateessa, lyhty',
          STANDS='katsomo lähikuvassa: DAZAI ja SHUNSUI vierekkäin kivipenkillä, YMPÄRILLÄ siluetteja (edessä, takana, sivuilla; ei koskaan kaksin tyhjässä kuvassa)',
          GATE_I='länsiportti (Itachi): pimeys, punaiset lyhdyt, varisparvi', GATE_J='itäportti (Julius): kultainen kellotaulu-taikapiiri, pysähtynyt sade',
          CARD='hahmokortin graafinen tausta (text_style.md)', GENJ='genjutsu-maailma: punainen taivas, musta kuu, negatiivinen maailma, varikset',
          SEE='katso spoilers.md')
DMG = [(0, 0), (25.3, .5), (45.0, 1), (66.85, 1.5), (84.85, 2), (92.6, 2.5), (137.0, 3)]


def dmg_at(t):
    return [d for t0, d in DMG if t >= t0 - 1e-6][-1]


def S(t, sid, cam, move, action, chars, bg='ARENA', text=None, ts=None, dlg=None, imp=None, sfx=(), mask=None, render=None, light=None, cuts=None, rain=True):
    return dict(t=q(t), id=sid, cam=cam, move=move, action=action, chars=chars, bg=bg, text=text, dlg=dlg, imp=imp,
                sfx=list(sfx), mask=mask, render=render, ts=ts, light=light, cuts=cuts, rain=rain)


def I(style, pattern, n, trigger, sig, off=0.0, burst=False):
    return dict(style=style, pattern=pattern, frames=n, trigger=trigger, signature=sig, offset=q(off), burst=burst)


def B(style, pattern, n, trigger, sig, off=0.0):   # BURST: >= 5 different styles inside <= 24 frames
    return I(style, pattern, n, trigger, sig, off, True)


def X(o, s, g=.8, p=0., **k):   # sfx cue (offset in shot, file, gain, pan, extra: dur/fi/fo/rate/peak/at/start)
    return (o, s, g, p, k)


# ---- reusable sound layers (all files = Epidemic Sound, see audio/sfx_list.tsv; variation files are sliced + rotated in mix.py)
def HIT(o=0, p=0., g=1., boom='boom_cine_lowhit'):      # body blow: whoosh + punch + sub boom + detail
    return [X(o - .06, 'swish_var01', .4 * g, p), X(o, 'punch_hard_var', .8 * g, p), X(o, boom, .6 * g, p * .5), X(o + .02, 'punch_body_var', .4 * g, p)]


def KICK(o=0, p=0., g=1.):
    return [X(o - .08, 'swish_double_var', .45 * g, p), X(o, 'kick_body_var', .75 * g, p), X(o, 'boom_cine_lowhit', .5 * g, 0), X(o + .03, 'cloth_flaps', .2 * g, p, dur=.3)]


def BIG(o=0, g=1., p=0.):   # heavy impact stack: whoosh + impact + sub + debris detail
    return [X(o - .12, 'whoosh_heavy_impact', .5 * g, p), X(o, 'punch_heavy', .75 * g, p), X(o, 'boom_ultra_deep', .7 * g, 0), X(o, 'subdrop_50', .7 * g, 0),
            X(o + .04, 'stone_debris02', .4 * g, p)]


def CROWS(o=0, g=.7, p=0., n=1):   # Itachi's crows: wings + caws
    out = [X(o, 'raven_wings_flyby', .55 * g, p, dur=1.4, fi=.05, fo=.6), X(o + .05, 'wings_flap', .45 * g, -p)]
    out += [X(o + .15 + i * .23, 'crow_caw_single', .35 * g, ((i % 3) - 1) * .5, start=(2.25, 3.25, 6.5, 7.35)[i % 4], dur=.6, fo=.2) for i in range(n)]
    return out


def CROWBURST(o=0, g=.8):
    return [X(o, 'crow_flock_angry', .5 * g, 0, dur=1.6, fi=.02, fo=.8), X(o, 'birds_flock', .45 * g, 0, dur=1.2, fo=.6), X(o, 'poof_smoke', .5 * g, 0),
            X(o + .02, 'wings_flap', .5 * g, .3)]


def SHARINGAN(o=0, g=.7):   # tomoe spin: glass shimmer + low hit
    return [X(o, 'shimmer_attack', .45 * g, 0), X(o, 'glitch_hit', .35 * g, 0), X(o + .02, 'boom_dark_lowhit', .5 * g, 0), X(o, 'shing_ring', .25 * g, 0)]


def GENJ(o=0, g=.7, d=1.4):   # genjutsu world
    return [X(o, 'evil_incant', .4 * g, 0, dur=d, fo=.5), X(o, 'reverse_swell_hit', .45 * g, 0), X(o + .1, 'drone_dark', .3 * g, 0, dur=d, fo=.5)]


def CLOCK(o=0, g=.6, d=1.2):   # Julius' time: ticking + gears
    return [X(o, 'clock_tick_slow', .45 * g, 0, dur=d, fi=.05, fo=.3), X(o + .05, 'clock_gears', .35 * g, 0, dur=d, fo=.3)]


def BELL(o=0, g=.6):
    return [X(o, 'clock_bell_tower', .55 * g, 0, start=.15, dur=3.0, fo=1.6), X(o, 'boom_long_reverb', .35 * g, 0)]


def FREEZE(o=0, g=.8):     # time stop: crystal freeze + reverse swell + tick stops
    return [X(o - .3, 'trailer_swell_reverse', .4 * g, 0, peak=True, at=o), X(o, 'time_freeze_crystal', .55 * g, 0), X(o, 'time_cast_glassy', .45 * g, 0),
            X(o, 'clock_bell_antique', .4 * g, 0), X(o, 'boom_cine_deep', .45 * g, 0)]


def REWIND(o=0, g=.8, d=1.3):   # time reversal
    return [X(o, 'time_reverse_glass02', .55 * g, 0), X(o, 'tape_rewind', .35 * g, 0, dur=d, fo=.3), X(o + .05, 'time_reverse', .45 * g, 0),
            X(o, 'clockwork_snap', .3 * g, 0)]


def SPELL(o=0, g=.7):     # grimoire / incantation
    return [X(o, 'page_turn', .35 * g, 0), X(o + .05, 'time_incant', .45 * g, 0, dur=1.6, fo=.6), X(o + .1, 'spell_light_cast', .35 * g, 0)]


def FIRE(o=0, g=.8, d=1.2):
    return [X(o, 'dragon_firebreath', .55 * g, 0, dur=d, fo=.4), X(o, 'fire_roar_burst', .5 * g, 0), X(o + .05, 'fire_whoosh_synth', .4 * g, 0)]


def BLACKFIRE(o=0, g=.8, d=1.4):   # Amaterasu
    return [X(o, 'ghost_fire_long', .55 * g, 0, dur=d, fi=.03, fo=.5), X(o, 'sizzle_dark', .4 * g, 0, dur=d, fo=.5), X(o, 'fire_burnup', .4 * g, 0, dur=d, fo=.5)]


def SUSA(o=0, g=.8):    # Susanoo forming
    return [X(o, 'choir_rise_dark', .45 * g, 0, dur=1.6, fo=.6), X(o + .2, 'bone_heavy', .4 * g, 0), X(o + .3, 'fire_roar_burst', .35 * g, 0),
            X(o + .4, 'boom_ultra_braam', .45 * g, 0, dur=1.4, fo=.7)]


def SWORD(o=0, g=.8, p=0.):
    return [X(o - .1, 'blade_whoosh_impact', .5 * g, p), X(o, 'sword_clashes', .5 * g, p), X(o, 'boom_cine_lowhit', .45 * g, 0)]


def SUB(o=0, g=.9, f='subdrop_40'):
    return [X(o, f, g, 0)]


def RISE(at, g=.6, f='riser_low'):   # riser whose loudest point lands at shot-local time `at`
    return [X(0, f, g, 0, peak=True, at=at)]


def SMASH(o=0, g=1., big=True):
    out = [X(o, 'stone_debris04' if big else 'stone_debris02', .7 * g, 0), X(o, 'boom_ultra_deep', .8 * g, 0),
           X(o + .05, 'rocks_heavy_debris', .45 * g, .2, dur=1.4, fo=.7)]
    return out + (SUB(o, .9 * g, 'subdrop_50') if big else [])


def WALL(o=0, g=1., p=0.):
    return [X(o, 'wall_collapse', .6 * g, p, dur=1.8, fo=.9), X(o, 'stone_debris01', .55 * g, p), X(o, 'boom_cine_heavyrumble', .55 * g, 0),
            X(o + .02, 'bodyfall_var', .45 * g, p)]


def CROWD(o=0, kind='gasp', g=.4, d=1.6, p=0.):
    f = dict(cheer='crowd_stadium_cheer', roar='crowd_battlecry', gasp='crowd_gasp', gasp2='crowd_gasp2', hush='crowd_swell_quiet',
             shock='crowd_shocked', panic='crowd_panic', charge='crowd_charge_large')[kind]
    return [X(o, f, g, p, dur=d, fi=.12, fo=min(1.0, d * .5))]


def STANDS(o=0, g=.25, d=1.6, sake=False):   # Dazai + Shunsui among silhouettes: muffled crowd + cloth (+ sake pour)
    return CROWD(o, 'hush', g, d) + [X(o + .2, 'cloth_flaps', .12, 0, dur=.4)] + ([X(o + .5, 'pour', .2, .2, dur=.6, fo=.3)] if sake else [])


def FAN(o=0, g=.5):
    return [X(o, 'fan_fold', g, 0), X(o + .02, 'shing_ring', .2, 0)]


def BURSTSND(o=0, g=1., n=5, sp=.09):   # stutter accents under a BURST: one transient per style change
    k = ['glitch_hit', 'punch_heavy', 'shing_ring', 'boom_cine_lowhit', 'glass_hits', 'whoosh_sharp_impact', 'boom_dark_lowhit']
    return [X(o + i * sp, k[i % len(k)], (.35 if i else .55) * g, ((i % 3) - 1) * .35) for i in range(n)]


AMB = lambda d, g=.14: X(0, 'crowd_swell_quiet', g, 0, dur=d, fi=.3, fo=.5)
WIND = lambda d, g=.2: X(0, 'cold_wind', g, 0, dur=d, fi=.3, fo=.5)
HB = lambda o, d, g=.35, f='heartbeat': X(o, f, g, 0, dur=d, fi=.05, fo=.4)
THUNDER = lambda o, g=.45: X(o, 'thunder_clap', g, 0)

STB = 10.60   # Stormy Evening: video = track + 10.60 (stabs 11.16, 16.99, 22.87, 25.79, 30.28, 33.39)
SHOTS = [
    # ===================== VAIHE 1 (0-16.7): KYLMÄ AVAUS, URAHARA + SÄÄNTÖ, ITACHI, JULIUS, KORTIT, BEGIN ==================
    S(0.00, 'A01', 'superlaaja, syöksy sadepilvien läpi', 'nopea dolly alas pilvistä + kaarto areenan yli; varis lentää linssin ohi 1.2', 'ÅSEN KUOLEMA alkaa (matalat jouset). Yö, sade, punainen kuu pilvien raossa. Kamera syöksyy pilvistä Valhallan märälle areenalle; salama valaisee katsomon siluetit. Yksi varis viuhahtaa linssin ohi.', ['CROWD:hush', 'CRW'],
      bg='SKY', imp=I('LIGHTNING_NEG', 'W1-N2', 3, 'salama halkaisee pilvet', ['ARENA'], .95),
      sfx=[X(0, 'meteor_whoosh01', .35, 0), THUNDER(.95, .55), X(.95, 'boom_cine_deep', .4, 0)] + CROWS(1.15, .7, .6, 1) + CROWD(1.3, 'hush', .25, .7), cuts='1 sisäleikkaus: varis linssissä 1.2'),
    S(2.00, 'A02', 'crane ylös kuulutuskorokkeelle -> lähikuva, hand2d', 'nopea crane + push-in, lyhty heiluu sateessa', 'Urahara kuulutuskorokkeella sateessa mikrofoni kädessä. Viuhka napsahtaa auki, ja hän kumartuu kaiteen yli virnistäen.', ['URA'],
      bg='BOOTH', dlg=[('URA', 'Welcome to Valhalla~! One rule tonight:')], imp=I('FAN_SNAP', 'W1-K2', 3, 'viuhka napsahtaa', ['URA'], .35),
      sfx=FAN(.35, .55) + [X(.35, 'boom_cine_low', .3, 0)] + CROWD(.6, 'cheer', .25, 1.1)),
    S(3.80, 'A03', 'laaja kehän reunalta, matala', 'hidas sivuttaisdrift kehän reunaa pitkin + tilt alas', 'SÄÄNTÖ KUVANA: kehän kivireuna sateessa, märkä hiekka. Kehän keskelle piirtyy valkoinen kaatuneen hahmon ääriviiva (kuin rikospaikalla) ja sammuva soihtu. Urahara jatkaa (tekstitys).', ['CROWD:hush'],
      dlg=[('URA', 'It ends when one dies... or never rises.')], imp=I('RULE_STAMP', 'BLK1-W1-BLK1', 3, 'kaatuneen ääriviiva iskeytyy hiekkaan', ['ARENA'], .7),
      sfx=[X(.1, 'sand_slide', .25, 0, dur=.6, fo=.3), X(.7, 'boom_dark_lowhit', .55, 0), X(.7, 'bodyfall_var', .35, 0), X(1.2, 'torch_ignite', .2, .4, dur=.5)] + CROWD(.8, 'hush', .22, 1.0)),
    S(5.70, 'A04', 'matala, länsiportin alta ylös (nousu)', 'matala crane nousee + hidas kaarros 40°, vastavalo punaisista lyhdyistä', 'Länsiportin pimeydessä varisparvi kieppuu pyörteenä ja tiivistyy siluetiksi: Akatsukin viitta (punaiset pilvet), poninhäntä, sade valuu. Hidas hero-esittely.', ['ITA', 'CRW'],
      bg='GATE_I', imp=I('CROW_SWIRL', 'BLK1-R1-BLK1', 3, 'varikset tiivistyvät Itachiksi', ['ITA'], 1.2),
      sfx=CROWS(0, .8, -.3, 2) + [X(.2, 'crow_flock_angry', .35, 0, dur=1.0, fo=.5), X(1.2, 'boom_cine_deep', .45, 0), X(1.25, 'cloth_flaps', .25, 0, dur=.5)] + CROWD(1.3, 'gasp', .25, .6)),
    S(7.50, 'A05', 'ECU silmä, hand2d', 'snap zoom silmään, sadepisara putoaa ripsestä', 'Itachin silmä aukeaa: Sharingan, kolme tomoeta pyörähtää.', ['ITA'],
      imp=I('EYE_RED', 'R1-W1-R1', 3, 'Sharingan aukeaa', ['ITA'], .05), sfx=SHARINGAN(.05, .9) + [X(.5, 'crow_caw_spooky', .3, .4, dur=.8, fo=.3)]),
    S(8.50, 'A06', 'hahmokortti, koko ruutu', 'paneeli liukuu diagonaalisesti, muotokuva iskeytyy, variksen sulkia putoaa', 'HAHMOKORTTI: musta-punainen paneeli, punainen pilvi vesileimana, Uchiha-viuhka, hand2d-muotokuva (Sharingan, kyynelurat, viilletty Lehden otsasuojus). Pensselikanji うちはイタチ.', ['ITA'],
      bg='CARD', text='ITACHI UCHIHA / THE CROW OF THE LEAF / UCHIHA CLAN · MANGEKYŌ SHARINGAN', ts='CARD_I', imp=I('POWER_CARD_I', 'R1-N1-W1', 3, 'Itachin kortti iskeytyy', ['ITA'], .02),
      sfx=[X(.02, 'boom_cine_low', .5, 0), X(.02, 'shing_ring', .3, 0), X(0, 'whoosh_heavy_impact', .4, 0)] + CROWS(.6, .5, .4, 1) + CROWD(.4, 'cheer', .25, 1.3)),
    S(10.60, 'B01', 'matala itäportista, kaarros', 'MYRSKYISÄ ILTA alkaa: matala orbit 90° + hidas push-in, kamera nousee', 'Itäportin yllä aukeaa jättimäinen kultainen kellotaulu-taikapiiri, ja sade PYSÄHTYY ilmaan (pisarat kimaltavat kuin lasihelmet). Julius kävelee pysähtyneen sateen läpi, viitta liikkumatta, hymy kasvoilla. Toisella vaskiaksentilla (12.27) kellon viisarit napsahtavat.', ['JUL'],
      bg='GATE_J', imp=I('TIME_FREEZE', 'G1-W1-G1', 3, 'sade pysähtyy (vaskiaksentti)', ['JUL'], .56),
      sfx=FREEZE(.56, .9) + CLOCK(.6, .6, 1.6) + [X(1.67, 'clockwork_snap', .45, .2), X(1.67, 'boom_cine_lowhit', .35, 0)] + CROWD(.8, 'gasp', .3, 1.0), rain=False,
      cuts='2 sisäleikkausta: kellon viisari ECU 1.67, kenkä astuu pisaran ohi'),
    S(12.90, 'B02', 'hahmokortti, koko ruutu + VS', 'paneeli iskeytyy, lopussa jaettu ruutu', 'HAHMOKORTTI: valkoinen-kulta paneeli, kellotaulu vesileimana, apila-grimoire, hand2d-muotokuva (vaalea aaltoileva tukka, iloinen hymy, velhokuninkaan viitta). Lopussa 0,8 s jaettu ruutu: Itachi punamusta vasemmalla, Julius kulta-sininen oikealla, keskellä VS.', ['JUL', 'ITA'],
      bg='CARD', text='JULIUS NOVACHRONO / THE 28TH WIZARD KING / CLOVER KINGDOM · TIME MAGIC  →  VS', ts='CARD_J', imp=I('POWER_CARD_J', 'G1-N1-W1', 3, 'Juliuksen kortti iskeytyy', ['JUL'], .02),
      sfx=[X(.02, 'boom_cine_low', .5, 0), X(.02, 'clock_bell_antique', .4, 0), X(0, 'whoosh_heavy_impact', .4, 0), X(1.6, 'boom_cine_deep', .5, 0), X(1.6, 'glitch_hit', .3, 0)] + CROWD(.3, 'roar', .3, 1.5), rain=False),
    S(15.30, 'B03', 'superlaaja yläkuva, gongi korokkeelta', 'kamera tärähtää, shokkiaalto, sade jatkuu', 'GONG: Urahara lyö pronssigongia. Shokkiaalto vyöryy areenan yli, pysähtynyt sade romahtaa maahan kerralla.', ['URA', 'ITA', 'JUL'],
      text='BEGIN!', ts='ARENA', imp=I('GONG_WAVE', 'R2-W1', 3, 'gongi lyödään', ['URA'], .02),
      sfx=[X(.02, 'gong', .7, 0), X(.02, 'gong_deep', .55, 0), X(.02, 'boom_ultra_deep', .5, 0), X(.15, 'rain_thunder_heavy', .3, 0, dur=1.2, fi=.02, fo=.4)] + SUB(.02, .6, 'subdrop_50') + CROWD(.2, 'roar', .4, 1.2)),

    # ===================== VAIHE 2 (16.7-56.6): ENSIMMÄINEN ISKU, TAKTINEN SOTA, SOKEA TAISTELU, MANGEKYŌ ==============
    S(16.70, 'C01', 'keskikuva, Juliuksen olan yli -> kaarto', 'kamera kiertää 120° iskun mukana, whip pan', 'ENSIMMÄINEN ISKU (vaskiaksentti 16.99): Itachi hajoaa variksiksi ja ilmestyy Juliuksen selän taakse kiertopotkussa. Julius torjuu kyynärvarrella: kultainen kellotaulukilpi värähtää, sade räjähtää renkaana.', ['ITA', 'JUL', 'CRW'],
      imp=B('FIRST_CLASH', 'W1-N2-H2-S2-F2-G1-K2', 12, 'potku vs kellokilpi (BURST)', ['ITA', 'JUL'], .29),
      sfx=CROWS(0, .5, -.4, 1) + KICK(.29, .3, 1.2) + [X(.29, 'forcefield_tonal', .4, 0), X(.29, 'clockwork_snap', .35, 0)] + BURSTSND(.29, 1., 6) + SUB(.29, .8, 'subdrop_50') + CROWD(.4, 'shock', .35, .9),
      cuts='2 sisäleikkausta: varikset hajoavat, kilven ECU'),
    S(18.20, 'C02', 'puolikuva Julius -> laaja', 'kamera vetäytyy, maailma harmaantuu', 'Julius naputtaa ilmaa: Itachi jäätyy keskelle hyppyä, harmaaksi, kellorenkaan sisään; sadepisarat pysähtyvät hänen ympärilleen.', ['JUL', 'ITA'],
      text='TIME MAGIC: CHRONO STASIS', ts='WIZARD', imp=I('TIME_FREEZE', 'G1-W1-G1', 3, 'Itachi jäätyy aikaan', ['JUL'], .3),
      sfx=FREEZE(.3, .85) + CLOCK(.35, .5, 1.0) + [X(0, 'spell_light_cast', .35, 0)], rain=False),
    S(19.60, 'C03', 'katsomo, siluettien keskellä, hand2d', 'hidas push-in siluettien välistä (etualalla sumeat päät)', 'KATSOMO: Shunsui (kukkahaori, olkihattu, sakekuppi) ja hänen vieressään Dazai (trenssi, siteet) istuvat siluettien keskellä. Shunsui läimäyttää polveaan, Dazai hymyilee silmät puoliksi kiinni.', ['KYO', 'DAZ', 'CROWD:hush'],
      bg='STANDS', dlg=[('KYO', "Ha! The crow's frozen. He lost."), ('DAZ', "Look again. That's feathers.")], sfx=STANDS(0, .25, 1.9, True)),
    S(21.50, 'C04', 'laaja, Julius etualalla', 'kamera nykäisee, sitten hidastus', 'Jäätynyt Itachi RÄJÄHTÄÄ variksiksi (vaskiaksentti 22.87): se oli klooni. Juliuksen silmät laajenevat ilosta.', ['JUL', 'CRW'],
      imp=I('CROW_BURST', 'BLK1-R1-W1', 3, 'klooni räjähtää variksiksi', ['ITA'], 1.37),
      sfx=CROWBURST(1.37, .9) + [X(1.37, 'glass_hits', .35, 0), X(1.37, 'boom_cine_lowhit', .45, 0)], rain=False),
    S(23.50, 'C05', 'matala, rikkoutunut pylväs, Itachi ylhäällä', 'hidas crane ylös pylvästä pitkin', 'Oikea Itachi seisoo rikkoutuneen pylvään päällä sateessa, Sharingan valvoo. Hän on oppinut kloonin avulla taian säännön.', ['ITA'],
      dlg=[('ITA', 'Your magic needs a target.')], sfx=[X(0, 'rain_thunder_heavy', .2, 0, dur=1.8, fi=.2, fo=.3), X(.3, 'crow_land_wings', .3, .5), X(1.2, 'shimmer01', .2, 0)]),
    S(25.30, 'C06', 'keskikuva, kultainen jälkikuvasarja', 'kamera ajaa syöksyn mukana, isku 25.79', 'Julius kiihdyttää omaa aikaansa: kultaiset jälkikuvat, hän on pylvään juurella silmänräpäyksessä ja nyrkki murskaa pylvään (vaskiaksentti 25.79). Itachi hyppää.', ['JUL', 'ITA'],
      text='TIME MAGIC: ACCELERATION', ts='WIZARD', imp=I('GOLD_SPEED', 'S1-G1-W1', 3, 'pylväs murskautuu', ['JUL'], .49),
      sfx=[X(0, 'whoosh_energy_var', .45, -.3), X(.1, 'clockwork_small', .3, 0, dur=.4)] + BIG(.49, 1.0) + SMASH(.5, .6, False)),
    S(26.70, 'C07', 'puolikuva Itachi ilmassa -> laaja', 'kamera kiertää, sitten tulipallo täyttää kuvan', 'Ilmassa Itachi tekee tiikerin käsimerkin ja puhaltaa jättimäisen tulipallon kohti Juliusta.', ['ITA'],
      text='KATON: GŌKAKYŪ NO JUTSU', ts='CROW', imp=I('FIRE_BLOOM', 'O1-W1-O1', 3, 'tulipallo laajenee', ['ITA'], .7),
      sfx=[X(.1, 'cloth_flaps', .25, 0, dur=.3), X(.3, 'breath_inhale', .3, 0)] + FIRE(.6, .9, 1.0) + [X(.7, 'fireball_big', .5, 0), X(.7, 'boom_cine_low', .4, 0)]),
    S(28.30, 'C08', 'Juliuksen olan yli, tulipallo pysähtyy', 'hidas push-in, tulipallo kuihtuu', 'Julius pysäyttää tulipallon ilmaan ja kelaa sen ajan eteenpäin: se palaa loppuun sekunnissa hiillokseksi ja tuhkaksi.', ['JUL'],
      dlg=[('JUL', 'Fire burns out. Given time.')], imp=I('EMBER_AGE', 'G1-O1', 2, 'tulipallo vanhenee tuhkaksi', ['JUL'], .8),
      sfx=[X(0, 'fire_burnup', .4, 0, dur=1.0, fo=.5), X(.2, 'clock_tick_slow', .35, 0, dur=.8, fo=.2, rate=1.6), X(.8, 'dispel_shimmer', .35, 0), X(.85, 'dust_settle', .3, 0, dur=.7, fo=.4)]),
    S(29.90, 'C09', 'laaja, shurikenit kaartuvat', 'kamera seuraa shurikenien rataa, snap zoom poskeen', 'Shuriken-ryöppy kaartuu kahdeksasta suunnasta. Julius jäädyttää ne ilmaan, mutta jokaisen varjossa oli toinen shuriken: yksi viiltää hänen poskeensa (30.28).', ['ITA', 'JUL'],
      imp=I('SHADOW_SHURIKEN', 'S1-W1-R1', 3, 'varjo-shuriken osuu poskeen', ['ITA'], .38),
      sfx=[X(i * .06, 'shuriken_throw', .35, (-1) ** i * .5) for i in range(6)] + [X(.25, 'time_freeze_crystal', .3, 0), X(.38, 'knife_impacts', .5, .2), X(.38, 'flesh_tear', .25, 0), X(.38, 'boom_cine_lowhit', .4, 0)]),
    S(31.50, 'C10', 'ECU Juliuksen kasvot, hand2d', 'mikro push-in', 'Julius koskettaa verta poskellaan ja säteilee kuin lapsi: uusi taika!', ['JUL'],
      dlg=[('JUL', 'Marvelous! What magic is that?!')], sfx=[X(.1, 'cloth_flaps', .15, 0, dur=.3), X(.6, 'shimmer01', .15, 0)]),
    S(33.20, 'C11', 'ECU silmät vastakkain, jaettu ruutu', 'snap zoom Sharinganiin (aksentti 33.39), maailma kääntyy negatiiviksi', 'Itachi: katseet lukittuvat. Sharingan pyörii, ja maailma vuotaa punaiseksi: genjutsu.', ['ITA', 'JUL'],
      dlg=[('ITA', 'Look at me.')], text='GENJUTSU: SHARINGAN', ts='CROW', imp=B('GENJUTSU_BURST', 'R1-N2-H2-F2-K2-W1-R2', 12, 'genjutsu laukeaa (BURST)', ['ITA'], .19),
      sfx=SHARINGAN(.19, 1.0) + GENJ(.2, .9, 1.2) + BURSTSND(.19, .9, 6) + SUB(.19, .7)),
    S(34.60, 'C12', 'genjutsu-maailma, hand2d', 'hidas orbit, sitten ruutu särkyy', 'GENJUTSU: punainen taivas, musta kuu, varikset sitovat Juliuksen. Julius sulkee rauhallisesti silmänsä, häiritsee omaa manaansa, ja genjutsu SÄRKYY kuin lasi.', ['JUL', 'ITA', 'CRW'],
      bg='GENJ', imp=I('GLASS_SHATTER', 'W1-L1-W1', 3, 'genjutsu särkyy', ['JUL'], 1.3),
      sfx=CROWS(.1, .5, 0, 2) + [X(0, 'drone_dark_sub', .3, 0, dur=1.3, fo=.4), X(.9, 'heartbeat', .3, 0, dur=.4), X(1.3, 'glass_huge_smash', .6, 0), X(1.3, 'boom_cine_deep', .45, 0)], rain=False),
    S(36.40, 'C13', 'lähikuva Julius, hand2d', 'mikro push-in, sade palaa', 'Takaisin areenalla: Julius seisoo silmät suljettuina, hymyilee. JULIUKSEN OIVALLUS: katse on ansa, hän taistelee aistimalla manaa.', ['JUL'],
      dlg=[('JUL', "Eyes are your trap. I won't use mine.")], sfx=[X(0, 'rain_thunder_heavy', .25, 0, dur=1.8, fi=.05, fo=.3), X(.4, 'dome_pulse', .3, 0)]),
    S(38.20, 'C14', 'katsomo, siluettien keskellä, hand2d', 'hidas sivuttaisdrift siluettien takaa', 'Shunsui nauraa ääneen; Dazai ei käännä katsettaan kentältä.', ['KYO', 'DAZ', 'CROWD:hush'],
      bg='STANDS', dlg=[('KYO', "Fighting blind? He's finished."), ('DAZ', 'No. He just learned the rule.')], sfx=STANDS(0, .25, 2.0)),
    S(40.20, 'C15', 'laaja yläkuva, variksia sateessa', 'hidas crane alas, mana-renkaat leviävät', 'Itachi lähettää varisparven sateen läpi. Julius seisoo silmät kiinni: kultaiset mana-aistirenkaat sykkivät hänestä kuin luotain.', ['JUL', 'CRW', 'ITA'],
      imp=I('MANA_SONAR', 'G1-L1', 2, 'mana-rengas paljastaa variksen', ['JUL'], .8),
      sfx=CROWS(0, .7, -.3, 3) + [X(.2, 'dome_pulse', .35, 0), X(.8, 'dome_pulse', .3, 0), X(.1, 'crow_flock_angry', .3, .3, dur=1.4, fo=.6)]),
    S(41.80, 'C16', 'sakuga, käsivara', 'nopea seuranta, 3 leikkausta', 'SAKUGA: kunait kolmesta suunnasta; Julius torjuu jokaisen sormenpään kellosymboleilla silmät kiinni.', ['JUL', 'ITA'],
      imp=I('SPEEDLINE_BURST', 'S2-W1', 3, 'kolmas kunai torjutaan', ['JUL'], .55),
      sfx=[X(.05 + i * .18, 'knife_parry', .45, (-1) ** i * .5) for i in range(4)] + [X(.55, 'boom_cine_lowhit', .4, 0), X(.55, 'clockwork_snap', .3, 0)], cuts='3 leikkausta'),
    S(43.40, 'C17', 'katso spoilers.md', '-', 'vihje (katso spoilers.md#C17)', ['SEE_SPOILERS'], bg='SEE', mask='CLUE',
      sfx=[X(.3, 'breath_inhale', .25, 0), X(.6, 'heartbeat', .3, 0, dur=.6, fo=.3)]),
    S(44.80, 'C18', 'keskikuva, märkä hiekka', 'kamera nykäisee iskun mukana, seuraa liukua', 'Julius vastaa: kämmenisku kiihdytetyllä ajalla, ja Itachi liukuu kymmenen metriä märässä hiekassa.', ['JUL', 'ITA'],
      imp=I('MANGA_HALFTONE', 'H1-W1', 2, 'kämmenisku osuu', ['JUL'], .25), sfx=HIT(.25, .2, 1.1, 'boom_ultra_deep') + [X(.35, 'sand_slide', .5, -.2, dur=.9, fo=.4), X(.4, 'splash_dive1', .25, -.2)]),
    S(46.20, 'C19', 'puolikuva Itachi, hand2d', 'hidas push-in', 'Itachi nousee, pyyhkii suupieltään, Sharingan kirkastuu.', ['ITA'],
      dlg=[('ITA', "Then I'll make you open them.")], sfx=[X(0, 'cloth_flaps', .2, 0, dur=.4), X(.9, 'shimmer_attack', .25, 0)]),
    S(47.80, 'C20', 'laaja -> lähikuva, tulikukat', 'kamera kiertää tulikukkien keskellä, whip pan', 'Tulikukkia (Hōsenka) kehänä ja variksia kaikkialla: Julius aistii manattomat varikset harhautukseksi, mutta yhdestä variksesta purkautuu oikea Itachi ja potku osuu Juliuksen leukaan.', ['ITA', 'JUL', 'CRW'],
      text='KATON: HŌSENKA NO JUTSU', ts='CROW', imp=I('MANGA_RED', 'R1-W1-R1', 3, 'potku osuu Juliukseen', ['ITA'], .75),
      sfx=[X(.05 + i * .1, 'fireball_big', .25, (-1) ** i * .5) for i in range(4)] + CROWS(.4, .5, .3, 1) + KICK(.75, -.2, 1.2)),
    S(49.40, 'C21', 'puolikuva Julius liukuu', 'kamera seuraa, sitten pysähtyy', 'Julius liukuu taaksepäin, avaa yhden silmän raolleen ja nauraa vilpittömästi.', ['JUL'],
      dlg=[('JUL', 'Ha! Splendid!')], sfx=[X(0, 'sand_slide', .4, .3, dur=.7, fo=.3), X(.6, 'cloth_flaps', .15, 0, dur=.3)]),
    S(50.80, 'C22', 'superlaaja, kehä sateessa', 'hidas orbit 70°, salama', 'Hengähdys: he kiertävät toisiaan sateessa. Varikset istuvat kehän reunalla, salama valaisee katsomon siluetit.', ['ITA', 'JUL', 'CROWD:hush'],
      imp=I('LIGHTNING_NEG', 'W1-N1', 2, 'salama', ['ARENA'], .9), sfx=[THUNDER(.9, .5), X(0, 'footsteps', .25, 0, dur=1.4, fo=.4)] + CROWD(.2, 'hush', .25, 1.4)),
    S(52.40, 'C23', 'ECU silmä, hand2d', 'hidas push-in, verikyynel', 'Itachi sulkee silmänsä. Kun ne aukeavat, tomoet sulautuvat kolmisakaraiseksi Mangekyō-kuvioksi, ja verikyynel valuu poskelle.', ['ITA'],
      text='MANGEKYŌ SHARINGAN', ts='CROW', imp=I('MANGEKYO_EYE', 'R1-BLK1-R1', 3, 'Mangekyō aukeaa', ['ITA'], .75),
      sfx=[HB(0, .7, .4)] + SHARINGAN(.75, 1.0) + [X(.75, 'braam_big', .45, 0, dur=1.0, fo=.5)]),
    S(54.20, 'C24', 'puolikuva Julius', 'mikro push-in, tukka nousee', 'Julius aistii muutoksen: hänen tukkansa nousee, ja hymy hyytyy hetkeksi. Katsomon siluetit kumartuvat eteenpäin.', ['JUL', 'CROWD:hush'],
      dlg=[('JUL', '...Oh?')], sfx=[X(0, 'drone_dark', .3, 0, dur=1.2, fo=.4), X(.2, 'wind_desert', .2, 0, dur=1.0, fo=.4)]),
    S(55.40, 'C25', 'ECU Itachin huulet', 'mikro push-in', 'Itachi kuiskaa. Sade sihisee hänen ympärillään.', ['ITA'],
      dlg=[('ITA', 'Amaterasu.')], sfx=RISE(1.2, .6, 'riser_rev_impact') + [X(.2, 'sizzle_dark', .3, 0, dur=1.0, fo=.3)]),

    # ===================== VAIHE 3 (56.6-92.6): AMATERASU, CHRONO ANASTASIS, SUSANOO vs MANA ZONE =======================
    S(56.60, 'D01', 'laaja -> puolikuva, mustat liekit', 'kamera tärähtää, orkesterinousu', 'AMATERASU (orkesterinousu 56.6): mustat liekit leimahtavat Juliuksen vasempaan käsivarteen ja viittaan.', ['ITA', 'JUL'],
      text='AMATERASU', ts='CROW', imp=B('AMATERASU_BURST', 'BLK1-N2-R2-H2-F2-K2-W1', 12, 'mustat liekit syttyvät (BURST)', ['ITA'], .02),
      sfx=BLACKFIRE(.02, 1.0, 1.6) + [X(.02, 'boom_ultra_braam', .5, 0, dur=1.3, fo=.6)] + BURSTSND(.02, 1., 6) + SUB(.02, .9, 'subdrop_50') + CROWD(.3, 'shock', .35, 1.0)),
    S(58.20, 'D02', 'lähikuva käsivarsi', 'hidas push-in', 'Julius jäädyttää liekit: ne harmaantuvat, mutta ryömivät silti eteenpäin. Amaterasu ei tottele aikaa.', ['JUL'],
      imp=I('DESAT_FLAME', 'D1-BLK1', 2, 'jäädytetyt liekit ryömivät', ['JUL'], .5), sfx=FREEZE(.5, .6) + BLACKFIRE(.6, .6, .8)),
    S(59.60, 'D03', 'katsomo, siluettien keskellä, hand2d', 'hidas push-in, liekkien heijastus kasvoilla', 'Shunsui nostaa sakekuppinsa riemuissaan. Dazai kallistaa päätään.', ['KYO', 'DAZ', 'CROWD:gasp'],
      bg='STANDS', dlg=[('KYO', "Black fire! That's game!"), ('DAZ', 'Not against a clock.')], sfx=STANDS(0, .28, 1.8, True)),
    S(61.40, 'D04', 'ECU Juliuksen kasvot, liekit kaulalla', 'mikro push-in', 'Liekit nuolevat Juliuksen kaulaa. Hän hymyilee.', ['JUL'],
      dlg=[('JUL', 'Flames that never die...')], sfx=BLACKFIRE(0, .5, .9) + [X(.5, 'time_incant', .3, 0)]),
    S(62.35, 'D05', 'laaja, mustat liekit lentävät taaksepäin', 'kamera vetäytyy liekkivanan mukana (aksentti 62.35)', 'CHRONO ANASTASIS: Julius kelaa käsivartensa ajan taaksepäin. Mustat liekit virtaavat ilmassa TAKAISIN Itachin silmään, joka vuotaa verta.', ['JUL', 'ITA'],
      dlg=[('JUL', '...unless they never started.')], text='CHRONO ANASTASIS', ts='WIZARD', imp=B('REWIND_BURST', 'G1-N2-W1-H2-S2-C2-G2', 12, 'liekit kelautuvat takaisin (BURST)', ['JUL'], .02),
      sfx=REWIND(.02, 1.0, 1.6) + BELL(.02, .55) + BURSTSND(.02, 1., 6) + SUB(.02, .8, 'subdrop_50') + CROWD(.6, 'gasp2', .3, 1.0)),
    S(64.25, 'D06', 'puolikuva Itachi, hand2d', 'kamera horjahtaa', 'Itachi horjahtaa, käsi verta vuotavalla silmällä; varikset pyrähtävät.', ['ITA', 'CRW'],
      imp=I('RED_BLACK_SPLIT', 'RB1-W1', 2, 'silmä vuotaa', ['ITA'], .2), sfx=CROWS(.1, .5, .3, 1) + [X(.2, 'boom_dark_lowhit', .45, 0), X(.3, 'flesh_wet07', .2, 0)]),
    S(65.55, 'D07', 'lähikuva grimoire', 'kamera kiertää, sivut lepattavat', 'Julius avaa grimoirensa: sivut lepattavat, kultaiset kellonviisarit pyörivät sen yllä.', ['JUL'],
      dlg=[('JUL', 'My turn.')], sfx=SPELL(0, .8) + CLOCK(.3, .5, 1.0)),
    S(66.85, 'D08', 'sakuga, Itachi lentää', 'kamera ajaa iskusarjan läpi, 3 leikkausta', 'Seitsemän kiihdytettyä iskua yhden ruudun aikana; Itachi lentää pylvään läpi.', ['JUL', 'ITA'],
      text='TIME MAGIC: ACCELERATION', ts='WIZARD', imp=I('MANGA_PANELS', 'P3-W1', 3, 'seitsemäs isku', ['JUL'], .55),
      sfx=[x for i in range(5) for x in HIT(.05 + i * .1, (-1) ** i * .4, .6)] + BIG(.55, 1.0) + SMASH(.6, .7, False), cuts='3 leikkausta'),
    S(68.35, 'D09', 'laaja, areenan muuri', 'kamera tärähtää, Julius ilmestyy', 'Itachi iskeytyy muuriin, kivi halkeilee. Julius ilmestyy eteen viimeistelyiskuun, nyrkki hehkuu pysähtynyttä aikaa.', ['ITA', 'JUL', 'CROWD:gasp'],
      imp=I('IMPACT_CRATER', 'N1-W1', 2, 'muuri halkeaa', ['JUL'], .1), sfx=WALL(.1, 1.0, -.4) + [X(.9, 'teleport_magic', .35, 0)] + CROWD(.2, 'gasp', .35, 1.0)),
    S(69.75, 'D10', 'puolikuva, punaiset luut', 'kamera nykäisee, sitten hidastus', 'SUSANOO-kylkiluut materialisoituvat Itachin ympärille (punaoranssi henkiluu) ja pysäyttävät nyrkin.', ['ITA', 'SUS', 'JUL'],
      imp=B('SUSANOO_BURST', 'R1-N2-H2-S2-F2-K2-W1', 12, 'Susanoo pysäyttää iskun (BURST)', ['ITA'], .25),
      sfx=SUSA(0, .9) + BIG(.25, 1.1) + BURSTSND(.25, 1., 6) + [X(.25, 'bone_heavy_breaks', .4, 0)]),
    S(71.25, 'D11', 'matala, nousu Susanoon mittakaavaan', 'crane ylös luurangosta panssariin, salama', 'Susanoo kasvaa: kylkiluut -> luuranko -> panssaroitu jättiläinen, Yata-peili ja Totsuka-pullo, sateessa areenan ylle.', ['SUS', 'ITA', 'CROWD:panic'],
      text='SUSANOO', ts='CROW', imp=I('GIANT_SIL', 'R1-W1-R1', 3, 'Susanoo valmis', ['ITA'], 1.1),
      sfx=SUSA(0, 1.0) + [THUNDER(1.1, .5), X(1.1, 'boom_ultra_deep', .6, 0), X(.5, 'giant_step01', .45, 0)] + CROWD(.6, 'panic', .35, 1.2)),
    S(73.25, 'D12', 'katsomo, siluettien keskellä, hand2d', 'kamera vetäytyy, Susanoon hehku katsomossa', 'Shunsui heiluttaa kuppiaan voitonvarmana. Dazai osoittaa leuallaan Juliusta.', ['KYO', 'DAZ', 'CROWD:panic'],
      bg='STANDS', dlg=[('KYO', 'A giant? Easy win for the crow.'), ('DAZ', 'Watch the old man smile.')], sfx=STANDS(0, .3, 1.9)),
    S(75.15, 'D13', 'matala, Julius katsoo ylös', 'hidas push-in kasvoihin', 'Julius katsoo Susanoota ylös, nauraa ilosta ja avaa molemmat silmänsä (kulta).', ['JUL'],
      dlg=[('JUL', "Then I'll stop holding back.")], imp=I('GOLD_EYES', 'G1-W1', 2, 'silmät aukeavat', ['JUL'], 1.2), sfx=[X(.2, 'breath_inhale', .25, 0), X(1.2, 'shimmer_attack', .4, 0), X(1.2, 'bass_whoop', .4, 0)]),
    S(76.75, 'D14', 'superlaaja yläkuva', 'kamera nousee ja kiertää, kultaiset rattaat nousevat', 'MANA ZONE: kultainen kellotaulu leviää koko areenan lattialle, rattaat nousevat ilmaan ja jokainen sadepisara hidastuu.', ['JUL', 'SUS', 'CROWD:gasp'],
      text='MANA ZONE', ts='WIZARD', imp=B('MANAZONE_BURST', 'G1-N2-W1-H2-S2-C2-G2', 12, 'Mana Zone leviää (BURST)', ['JUL'], .05),
      sfx=BELL(.05, .8) + CLOCK(.1, .7, 1.6) + [X(.05, 'forcefield_tonal', .5, 0), X(.05, 'boom_ultra_braam', .5, 0, dur=1.4, fo=.7)] + BURSTSND(.05, 1., 6) + SUB(.05, .8, 'subdrop_50') + CROWD(.4, 'gasp', .3, 1.0), rain=False),
    S(78.45, 'D15', 'laaja, magatamat pysähtyvät', 'kamera kiertää pysähtyneiden ammusten läpi', 'Susanoo ampuu Yasaka-magatamoja; Julius pysäyttää ne ilmaan ja kääntää niiden ajan: ne lentävät takaisin ja iskevät Susanoon panssariin.', ['SUS', 'JUL'],
      imp=I('SHOCKWAVE_RING', 'R1-W1-R1', 3, 'magatamat iskeytyvät takaisin', ['JUL'], .95),
      sfx=[X(.05 + i * .08, 'beam_anime01', .25, (-1) ** i * .4) for i in range(3)] + [X(.4, 'time_freeze_crystal', .4, 0)] + REWIND(.6, .6, .5) + BIG(.95, 1.0) + [X(.97, 'metal_clash01', .35, 0)], rain=False),
    S(80.25, 'D16', 'Susanoon sisältä, hand2d', 'kamera tärisee', 'Susanoo horjahtaa, Yata-peili ylhäällä; sisällä Itachi huohottaa, verta suupielessä.', ['ITA', 'SUS'],
      sfx=[X(0, 'boom_heavy_rumble', .4, 0), X(.3, 'breath_inhale', .3, 0), HB(.4, .9, .3)], rain=False),
    S(81.55, 'D17', 'sakuga, Totsuka vs kellosymbolit', 'whip pan -> snap zoom -> orbit, 3 leikkausta', 'SAKUGA: Totsuka-miekka viiltää, Julius hyppii pysäytettyjen hetkien välillä (jälkikuvat), kellosymbolit sirpaloituvat.', ['SUS', 'JUL'],
      imp=I('SUMI_INK', 'K1-W1-K1', 3, 'miekka sirpaloi kellokilven', ['ITA'], .6),
      sfx=SWORD(.15, .7, -.3) + SWORD(.6, 1.0, .3) + [X(.6, 'glass_hits', .4, 0), X(1.1, 'teleport_magic', .3, .3)], cuts='3 leikkausta', rain=False),
    S(83.25, 'D18', 'laaja, Julius juoksee Susanoon käsivartta pitkin', 'kamera seuraa sivulta hidastettuna', 'Julius juoksee ylös Susanoon käsivartta hidastetussa ajassa, pysähtyneet sadepisarat ympärillään kuin tähtiä.', ['JUL', 'SUS'],
      imp=I('GOLD_BURN', 'G1-W1-G1', 3, 'Julius loikkaa', ['JUL'], 1.1), sfx=[X(0, 'footsteps', .3, 0, dur=1.0, fo=.3, rate=1.4), X(.2, 'clock_tick_slow', .3, 0, dur=1.2, fo=.3), X(1.1, 'whoosh_big01', .45, 0)], rain=False),
    S(84.85, 'D19', 'superlaaja, kehä halkeaa', 'kamera tärähtää, lentää taaksepäin', 'Susanoo lyö, Julius torjuu kellokilvellä; molemmat liukuvat erilleen ja areenan lattia halkeaa kahtia.', ['SUS', 'JUL', 'CROWD:panic'],
      imp=I('WORLD_BREAKER', 'N1-W1', 2, 'lattia halkeaa', ['ITA', 'JUL'], .4), sfx=BIG(.4, 1.1) + SMASH(.42, 1.0) + [X(.5, 'earthquake_rumble', .4, 0, dur=1.1, fo=.5)] + CROWD(.5, 'panic', .35, 1.0)),
    S(86.45, 'D20', 'laaja kahden kuva, myrsky', 'hidas push-in, salamat (myrskyn nousu)', 'MYRSKY NOUSEE: Susanoo nostaa Totsuka-miekan, Julius kerää kultaista manaa nyrkkiinsä. Salamat, sade palaa raskaana.', ['SUS', 'JUL'],
      imp=I('LIGHTNING_NEG', 'W1-N1', 2, 'salama', ['ARENA'], .6), sfx=[THUNDER(.6, .55), X(0, 'rain_thunder_heavy', .35, 0, dur=1.6, fi=.3, fo=.3), X(.3, 'charge_shing', .35, .3)]),
    S(88.05, 'D21', 'matala, molemmat ryntäävät', 'kamera vetäytyy juoksun edellä', 'Molemmat ryntäävät: punainen ja kultainen vana repivät sateen.', ['SUS', 'JUL'],
      sfx=RISE(2.73, .65, 'riser_braam') + [X(.1, 'whoosh_energy_var', .4, -.4), X(.15, 'giant_step03', .4, -.3), X(.5, 'whoosh_dark_fast', .4, .4)]),
    S(89.55, 'D22', 'ECU jaettu ruutu, hand2d', 'täysi pysähdys, mikro push-in', 'Jaettu ruutu: Mangekyō punaisena | Juliuksen kultainen silmä, jonka iiriksessä kellotaulu.', ['ITA', 'JUL'],
      imp=I('DUAL_TONE', 'D1-W1', 2, 'katseet lukittuvat', ['ITA', 'JUL'], .05), sfx=[X(.05, 'shing_ring', .35, 0), HB(0, 1.1, .4)]),
    S(90.75, 'D23', 'superlaaja, törmäyspiste', 'kamera tärähtää, valkoinen välähdys, shokkiaalto', 'TÖRMÄYS (myrskyn aksentti 90.78): Susanoon nyrkki ja Juliuksen kellotaulukämmen kohtaavat. Paineaalto lakaisee sateen, siluetit kaatuvat taaksepäin.', ['SUS', 'JUL', 'CROWD:panic'],
      imp=B('CLASH_BURST', 'W1-N2-R2-G2-H2-S2-F1', 12, 'Susanoo vs Mana Zone (BURST)', ['ITA', 'JUL'], .03),
      sfx=BIG(.03, 1.3) + BELL(.03, .6) + SUSA(0, .5) + [X(.03, 'explosion_huge_var', .6, 0), X(.03, 'air_blast', .5, 0)] + BURSTSND(.03, 1.1, 7) + SUB(.03, 1.0, 'subdrop_50') + CROWD(.3, 'panic', .4, 1.2)),
]

# ---------------- masked: twists and finale (content only in spoilers.md) -------------------------------------------
TW = [  # (start, id, impact or None, sfx list, rain)
    (92.60, 'T01', I('X-TWIST', 'X', 2, 'katso spoilers.md', ['X'], .6), [X(0, 'dust_settle', .35, 0, dur=1.8, fo=.6)] + CLOCK(.6, .5, 1.3) + [X(1.2, 'clock_bell_antique', .25, 0)], True),
    (94.60, 'T02', None, [X(.2, 'clock_tick_slow', .35, 0, dur=1.4, fo=.5, rate=.7), HB(0, 1.6, .35)], True),
    (96.40, 'T03', None, [X(.1, 'breath_inhale', .3, 0), X(.9, 'bone_crack', .2, 0), HB(0, 1.8, .3)], True),
    (98.40, 'T04', None, STANDS(0, .2, 2.0, True), True),
    (100.40, 'T05', B('X-TWIST', 'X', 12, 'katso spoilers.md (BURST)', ['X'], .1), SHARINGAN(.1, 1.0) + GENJ(.1, 1.0, 1.4) + BURSTSND(.1, 1., 6) + SUB(.1, .8, 'subdrop_50'), False),
    (102.00, 'T06', None, GENJ(0, .7, 2.0) + CROWS(.5, .4, 0, 2), False),
    (104.00, 'T07', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], 1.2), CLOCK(0, .8, 2.0) + [X(.5, 'clock_bell_tower', .4, 0, start=3.6, dur=1.5, fo=.7)] + [X(1.2, 'boom_cine_deep', .4, 0)], False),
    (106.00, 'T08', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .6), [X(.6, 'glass_huge_smash', .6, 0), X(.6, 'mirror_break', .45, 0), X(.6, 'boom_ultra_deep', .5, 0)] + SUB(.6, .7), False),
    (107.80, 'T09', I('X-TWIST', 'X', 2, 'katso spoilers.md', ['X'], .3), [X(0, 'rain_thunder_heavy', .3, 0, dur=1.6, fi=.02, fo=.3), X(.3, 'bodyfall_var', .45, 0), X(.5, 'flesh_wet16', .2, 0), X(.8, 'power_down_shimmer', .3, 0)], True),
    (109.40, 'T10', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .4), SUSA(0, .9) + [X(.4, 'katana_draw', .45, 0), X(.4, 'unsheathe_ring', .35, 0), X(.45, 'fire_roar_burst', .35, 0)], True),
    (111.20, 'T11', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .4), SWORD(.1, .7, -.3) + [X(.4, 'teleport_magic', .4, .3), X(.4, 'boom_cine_lowhit', .45, 0), X(1.0, 'metal_clash02', .45, 0), X(1.0, 'forcefield_elec', .3, 0)], True),
    (113.00, 'T12', I('X-TWIST', 'X', 2, 'katso spoilers.md', ['X'], .7), CROWBURST(.3, .7) + [X(.7, 'glitch_hit', .35, 0), X(.7, 'shimmer_attack', .3, 0)], True),
    (114.60, 'T13', None, [HB(0, 1.6, .45, 'heartbeat_100'), X(0, 'drone_dark_sub', .3, 0, dur=1.6, fo=.4)] + RISE(1.6, .6, 'riser_rev_impact'), True),
    (116.20, 'T14', B('X-TWIST', 'X', 12, 'katso spoilers.md (BURST)', ['X'], 1.75), [X(1.6, 'blade_whoosh_impact', .5, 0), X(1.75, 'stab_bloody', .6, 0), X(1.75, 'sword_slice02', .4, 0)] + BIG(1.75, 1.1) + BURSTSND(1.75, 1., 6)
     + [X(1.9, 'evil_incant', .35, 0, dur=.8, fo=.4), X(1.9, 'suction_implosion', .4, 0)], True),
    (118.80, 'T15', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .05), REWIND(.05, 1.0, 1.5) + BELL(.05, .5) + [X(.05, 'reverse_whoosh', .45, 0), X(.5, 'crow_caw_spooky', .25, 0, rate=.7)], False),
    (120.40, 'T16', I('X-TWIST', 'X', 2, 'katso spoilers.md', ['X'], .55), [X(.3, 'blade_whoosh_impact', .45, 0), X(.55, 'whoosh_sharp_impact', .45, .3)] + SHARINGAN(.8, .6), True),
    (121.60, 'T17', None, [X(0, 'drone_dark', .3, 0, dur=1.4, fo=.4), X(.6, 'clock_tick_slow', .3, 0, dur=.8, fo=.3)], True),
    (123.00, 'T18', B('X-TWIST', 'X', 12, 'katso spoilers.md (BURST)', ['X'], .78), [X(.3, 'breath_inhale', .3, 0)] + SHARINGAN(.78, 1.0) + [X(.78, 'power_down_shimmer', .5, 0), X(.78, 'choir_braam', .5, 0, dur=1.0, fo=.5)]
     + BURSTSND(.78, 1., 6) + SUB(.78, .8, 'subdrop_50'), True),
    (124.80, 'T19', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .5), [X(.5, 'stab_squelch', .45, 0), X(.5, 'boom_cine_lowhit', .45, 0)] + REWIND(.8, .7, .7), False),
    (126.40, 'T20', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .25), [X(.25, 'stab_bloody', .45, .3), X(.25, 'boom_cine_lowhit', .45, 0)] + REWIND(.6, .75, .7) + [X(1.1, 'clock_bell_antique', .35, 0)], False),
    (128.00, 'T21', I('X-TWIST', 'X', 3, 'katso spoilers.md', ['X'], .9), [X(.2, 'stab_squelch', .35, -.3), X(.55, 'stab_squelch', .35, .3), X(.9, 'stab_bloody', .45, 0)] + REWIND(1.0, .8, .5) + [X(.9, 'glitch_hit', .4, 0)], False),
    (129.60, 'T22', None, STANDS(0, .22, 1.8), True),
    (131.40, 'T23', I('X-TWIST', 'X', 2, 'katso spoilers.md', ['X'], .68), [X(.1, 'clock_tick_slow', .35, 0, dur=1.9, fo=.5, rate=.6), HB(.3, 1.6, .4, 'heartbeat_100'), X(.68, 'glass_resonance', .4, 0)], False),
    (133.40, 'T24', None, [X(0, 'drone_dark_sub', .3, 0, dur=2.5, fo=.4), HB(.4, 2.0, .45)] + RISE(2.53, .6, 'riser_rev_impact'), False),
    (135.93, 'T25', B('X-TWIST', 'X', 12, 'katso spoilers.md (BURST)', ['X'], .02), [X(.02, 'mirror_break', .7, 0), X(.02, 'glass_big_smash', .6, 0), X(.02, 'stab_bloody', .4, 0)] + BURSTSND(.02, 1., 6) + SUB(.02, 1.0, 'subdrop_50')
     + [X(.3, 'tinnitus', .1, 0, dur=.7, fo=.4)], False),
]
FIN = [
    (137.00, 'J01', None, [X(0, 'rain_thunder_heavy', .3, 0, dur=1.9, fi=.02, fo=.3), X(.3, 'breath_inhale', .3, 0), X(.59, 'boom_cine_low', .35, 0)], True),
    (138.90, 'J02', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], .08), SUSA(0, .7) + [X(.08, 'boom_cine_deep', .45, 0), X(.6, 'glass_resonance', .3, 0)], True),
    (140.40, 'J03', None, SPELL(0, .7) + CLOCK(.3, .7, 1.3) + [X(.8, 'whoosh_big01', .4, 0)], True),
    (142.00, 'J04', B('X-FIN', 'X', 12, 'katso spoilers.md (BURST)', ['X'], 1.34), RISE(1.34, .6, 'riser_braam') + FREEZE(1.34, 1.0) + BELL(1.34, .8) + BURSTSND(1.34, 1., 6) + SUB(1.34, 1.0, 'subdrop_50'), True),
    (144.00, 'J05', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], .82), [X(.1, 'clock_tick_slow', .3, 0, dur=1.4, fo=.4, rate=.5), X(.82, 'glass_resonance', .45, 0), X(.82, 'ice_crack_series', .4, 0), X(.82, 'boom_dark_lowhit', .45, 0)], False),
    (145.60, 'J06', None, [X(0, 'drone_dark_sub', .25, 0, dur=1.6, fo=.4), X(.6, 'pour', .0, 0)], False),
    (147.20, 'J07', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], 1.69), [X(.4, 'glass_huge_smash', .5, 0), X(.45, 'ice_break_debris', .4, 0)] + SWORD(1.69, 1.2) + [X(1.69, 'forcefield_tonal', .4, 0)] + SUB(1.69, .8), False),
    (149.20, 'J08', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], 1.1), SWORD(.2, .7, -.3) + HIT(.6, .3, .7) + [X(1.1, 'breath_inhale', .35, 0), X(1.1, 'boom_dark_lowhit', .4, 0)] + CROWBURST(1.4, .6), False),
    (151.20, 'J09', None, [HB(0, 1.6, .4, 'heartbeat'), X(.3, 'cloth_flaps', .2, 0, dur=.5)], False),
    (152.80, 'J10', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], .45), FIRE(.1, .9, 1.0) + CROWS(.2, .6, .3, 2) + [X(.3 + i * .07, 'shuriken_throw', .3, (-1) ** i * .5) for i in range(4)], False),
    (154.30, 'J11', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .08), [X(.08, 'time_freeze_crystal', .5, 0), X(.08, 'boom_cine_deep', .45, 0), X(.2, 'footsteps', .3, 0, dur=1.2, fo=.4, rate=.7)] + CLOCK(.2, .6, 1.3), False),
    (155.90, 'J12', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .3), [X(.3, 'teleport_magic', .4, 0), X(.3, 'shimmer_attack', .3, 0), HB(.4, 1.0, .4)], False),
    (157.30, 'J13', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], .46), SPELL(0, .7) + BELL(.46, .9) + CLOCK(.5, .9, 1.1) + [X(.46, 'charge_shing', .4, 0), X(.46, 'boom_ultra_braam', .45, 0, dur=1.1, fo=.5)], False),
    (158.90, 'J14', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .02), [X(.02, 'shimmer01', .35, 0), X(.3, 'cloth_flaps', .2, 0, dur=.5), HB(.2, 1.3, .45)], False),
    (160.50, 'J15', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .67), RISE(2.5, .7, 'riser_braam') + [X(.67, 'clock_bell_antique', .4, 0), X(.67, 'boom_cine_lowhit', .4, 0)], False),
    (161.80, 'J16', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .51), [X(.1, 'clock_tick_slow', .45, 0, dur=1.0, fo=.2, rate=1.5), X(.51, 'whoosh_heavy_impact', .5, 0), X(.9, 'reverse_swell_hit', .45, 0)], False),
    (163.00, 'J17', B('X-FIN', 'X', 48, 'katso spoilers.md (PITKÄ BURST 2 s)', ['X'], .0), BIG(0, 1.5) + BELL(0, 1.0) + [X(0, 'explosion_huge_var', .7, 0), X(0, 'boom_ultradeep_tone', .9, 0, dur=2.4, fo=1.6), X(0, 'air_blast', .55, 0),
     X(.05, 'rain_thunder_heavy', .5, 0, dur=2.4, fi=.02, fo=.8)] + BURSTSND(0, 1.2, 14, .14) + SUB(0, 1.2, 'subdrop_50') + [X(.75, 'glass_huge_smash', .4, 0)], True),
    (165.60, 'J18', None, [X(.2, 'rain_thunder_heavy', .3, 0, dur=1.8, fi=.4, fo=.3), X(1.5, 'bodyfall_var', .6, 0), X(1.55, 'splash_dive3', .35, 0), X(.1, 'tinnitus', .08, 0, dur=1.4, fo=.8)], True),
    (167.60, 'J19', None, [X(0, 'rain_thunder_heavy', .22, 0, dur=2.6, fi=.3, fo=.4), X(.6, 'cloth_flaps', .15, 0, dur=.4), HB(.4, 2.0, .3)], True),
    (170.20, 'J20', I('X-FIN', 'X', 2, 'katso spoilers.md', ['X'], .9), [X(.4, 'power_down_shimmer', .3, 0), X(.9, 'raven_flyoff', .5, 0, dur=1.5, fo=.6), X(1.0, 'crow_caw_spooky', .3, .3, start=1.5, dur=1.0, fo=.4)], True),
    (172.60, 'J21', None, STANDS(0, .2, 2.0, True), True),
    (174.60, 'J22', I('X-FIN', 'X', 3, 'katso spoilers.md', ['X'], .4), [X(0, 'rain_thunder_heavy', .25, 0, dur=3.4, fi=.3, fo=1.4), X(.4, 'gong', .4, 0), X(.4, 'gong_deep', .3, 0)] + FAN(.2, .3) + CROWD(.6, 'cheer', .25, 2.6)
     + [X(1.6, 'crow_caw_spooky', .25, .4, start=3.3, dur=1.0, fo=.5)], True),
]
for t, sid, imp, sfx, rn in TW:
    SHOTS.append(S(t, sid, 'katso spoilers.md', 'katso spoilers.md', f'käänne (katso spoilers.md#{sid})', ['SEE_SPOILERS'], bg='SEE', imp=imp, sfx=sfx, mask='TWIST', rain=rn))
for t, sid, imp, sfx, rn in FIN:
    SHOTS.append(S(t, sid, 'katso spoilers.md', 'katso spoilers.md', f'finaali (katso spoilers.md#{sid})', ['SEE_SPOILERS'], bg='SEE', imp=imp, sfx=sfx, mask='FINALE', rain=rn))

IMPACT_STYLES = {  # existing engine sequences (engine IMPACT_SEQ) + NEW requests (pre/impact_requests.md)
    'FAN_SNAP': 'Urahara: viuhka mustana siluettina lyhtyvaloa vasten (olemassa, harry-vs-gojo)',
    'GONG_WAVE': 'kultaiset samankeskiset renkaat, hahmot mustina siluetteina (olemassa)',
    'SPEEDLINE_BURST': 'radiaaliset focus lines mustavalkoisena (olemassa)',
    'MANGA_PANELS': 'manga-paneelit, iskut paneeleittain (olemassa)',
    'MANGA_HALFTONE': 'mustavalkoinen rasteri (olemassa)',
    'MANGA_RED': 'punamusta manga (olemassa)',
    'IMPACT_CRATER': 'kraatteri valkoisena lineartina mustalla (olemassa)',
    'SHOCKWAVE_RING': 'pallomainen paineaalto (olemassa)',
    'WORLD_BREAKER': 'ylivalotus, railot hehkuvat, hahmot siluetteina (olemassa; tässä punainen | kulta)',
    'DUAL_TONE': 'kaksisävy: vasen punamusta (Itachi), oikea kulta-sininen (Julius) (olemassa, uudelleenväritys)',
    'RED_BLACK_SPLIT': 'punamusta jako (olemassa)', 'SUMI_INK': 'sumi-e musteveto (olemassa)', 'GLASS_SHATTER': 'ruutu särkyy siruiksi (olemassa)',
    'GOLD_BURN': 'kultainen ylivalotus (olemassa)',
    # ---- NEW (pre/impact_requests.md) ----
    'LIGHTNING_NEG': 'UUSI: salaman välähdys: valkoinen ruutu -> sininegatiivi, sadeviivat valkoisina',
    'RULE_STAMP': 'UUSI: musta ruutu, kaatuneen hahmon valkoinen ääriviiva iskeytyy, sammuva soihtu',
    'CROW_SWIRL': 'UUSI: varisparvi mustina siluetteina punaista vastaan, pyörre tiivistyy hahmoksi',
    'EYE_RED': 'UUSI: Sharingan täyttää ruudun: punainen iiris, 3 tomoeta, 1 ruutu negatiivina',
    'POWER_CARD_I': 'UUSI: Itachin kortin isku: punainen negatiivi, punainen pilvi + kanji うちはイタチ',
    'POWER_CARD_J': 'UUSI: Juliuksen kortin isku: kultainen negatiivi, kellotaulu + apila; lopussa VS',
    'TIME_FREEZE': 'UUSI: aika pysähtyy: kultainen kellotaulu-rengas, maailma harmaa negatiivi, sadepisarat valkoisina pisteinä',
    'CROW_BURST': 'UUSI: klooni räjähtää variksiksi: valkoinen ruutu, sadat mustat varis-siluetit, punainen ydin',
    'GOLD_SPEED': 'UUSI: kultaiset jälkikuvat + speed lines, kellonviisarit',
    'FIRE_BLOOM': 'UUSI: tulipallo täyttää ruudun oranssina, mustat lineart-liekit',
    'EMBER_AGE': 'UUSI: tuli vanhenee: oranssi -> harmaa tuhka, kellotaulun viisari pyörähtää',
    'SHADOW_SHURIKEN': 'UUSI: kaksi päällekkäistä shurikenia siluettina, punainen viiltoviiva',
    'MANGEKYO_EYE': 'UUSI: Mangekyō (kolmisakarainen) täyttää ruudun, verikyynel, musta-punainen',
    'DESAT_FLAME': 'UUSI: harmaa jäädytetty kuva, mustat liekit liikkuvat silti (ainoa väri musta/violetti hehku)',
    'GIANT_SIL': 'UUSI: Susanoo siluettina punaista salamataivasta vasten, Itachi pienenä',
    'MANA_SONAR': 'UUSI: musta ruutu, kultaiset samankeskiset mana-renkaat (luotain), varikset valkoisena lineartina',
    'GOLD_EYES': 'UUSI: Juliuksen kultainen silmä, iiriksessä kellotaulu',
    # ---- BURSTS (>= 5 styles inside <= 1 s; pattern codes below) ----
    'FIRST_CLASH': 'BURST 12f: valkoinen -> negatiivi -> mustavalko-rasteri -> speed lines -> kasvo-invert (Itachi) -> kultainen väläys -> manga-muste',
    'GENJUTSU_BURST': 'BURST 12f: punainen -> negatiivi -> rasteri -> silmä-closeup invert -> muste -> valkoinen -> punamusta',
    'AMATERASU_BURST': 'BURST 12f: musta -> negatiivi -> punamusta -> rasteri -> kasvo-invert (Julius) -> muste -> valkoinen',
    'REWIND_BURST': 'BURST 12f: kulta -> negatiivi -> valkoinen -> rasteri -> speed lines (TAAKSEPÄIN) -> chroma -> kulta',
    'SUSANOO_BURST': 'BURST 12f: punainen -> negatiivi -> rasteri -> speed lines -> kasvo-invert (Itachi) -> muste -> valkoinen',
    'MANAZONE_BURST': 'BURST 12f: kulta -> negatiivi -> valkoinen -> rasteri -> speed lines -> chroma -> kulta-kellotaulu',
    'CLASH_BURST': 'BURST 12f: valkoinen -> negatiivi -> punamusta -> kulta -> rasteri -> speed lines -> kasvo-invert',
    'X-*': 'maskatut tyylit ja BURSTit: katso spoilers.md',
}
PATTERN_KEY = ('Kuviokoodit: W=valkoinen ruutu, N=negatiivi, H=mustavalkoinen halftone-rasteri, S=speed lines, F=kasvo-invert closeup, K=manga-muste (sumi/ink), '
               'C=chroma/värivälähdys, R=punainen (Itachi), RB=punamusta, G=kulta (Julius), BLK=musta, D=kaksisävy/desat, L=lineart, O=oranssi tuli, P=paneelit. '
               'Numero = ruutujen määrä. BURST = vähintään 5 eri tyyliä <= 24 ruudussa, tyyli vaihtuu 1-2 ruudun välein.')
TEXT_STYLE = dict(CROW='Itachi: synkkä mustapunainen pensseli (text_style.md 1)', WIZARD='Julius: majesteettinen kulta/sininen WIZARD (text_style.md 2)',
                  ARENA='kuuluttaja / BEGIN / WINNER (text_style.md 3)', CARD_I='Itachin hahmokortti', CARD_J='Juliuksen hahmokortti + VS')

# ---------------- build ----------------
SHOTS.sort(key=lambda s: s['t'])
BEATS = json.load(open(os.path.join(ROOT, 'audio', 'beats.json')))
SNAP_WIN, SNAP_MIN = .22, .85
ACC = [a['t'] for a in BEATS['accents'] if a['strength'] >= SNAP_MIN]
NO_SNAP = {'B01', 'B03', 'C01', 'C04', 'C06', 'C09', 'C11', 'D01', 'D05', 'D23', 'T14', 'T18', 'T25', 'J04', 'J17'}   # exact (music stab / break)
for s in SHOTS:
    if not s['imp'] or s['id'] in NO_SNAP:
        continue
    t_old = s['t'] + s['imp']['offset']
    cand = [a for a in ACC if abs(a - t_old) <= SNAP_WIN and s['t'] + .04 < a < s['t'] + 9]
    t_new = min(cand, key=lambda a: abs(a - t_old)) if cand else t_old
    new_off = q(t_new - s['t']); old = s['imp']['offset']; d = new_off - old
    if abs(d) > 1e-6:
        s['sfx'] = [((o + d) if abs(o - old) < 1.5 / FPS and not k.get('peak') else o, n, g, p_, k) for (o, n, g, p_, k) in s['sfx']]
        s['imp']['offset'] = new_off
SFX_ADD = {  # bass variation layers under the biggest hits
    'C01': [X(.29, 'bass_dive13', .35, 0)], 'D01': [X(.02, 'bass_dive17', .45, 0)], 'D05': [X(.02, 'bass_dive13', .4, 0)], 'D14': [X(.05, 'bass_dive17', .4, 0)],
    'D23': [X(.03, 'bass_dive17', .5, 0)], 'T14': [X(1.75, 'bass_dive13', .45, 0)], 'T25': [X(.02, 'bass_dive17', .45, 0)], 'J04': [X(1.34, 'bass_dive17', .45, 0)],
    'J17': [X(0, 'bass_dive13', .5, 0), X(.02, 'bass_dive17', .45, 0)],
}
MASK_T = 92.55


def music_label(t):
    if t >= MASK_T:
        return 'katso spoilers.md'
    segs = [e for e in BEATS['edit'] if e['v0'] <= t < e['v1']]
    seg = segs[-1] if segs else None
    if seg is None:
        return 'ei musiikkia'
    near = lambda arr: min(arr, key=lambda v: abs(v - t)) if arr else 1e9
    ac = near([a_['t'] for a_ in BEATS['accents']])
    kind = 'aksentti' if abs(ac - t) < .09 else 'vapaa kohta'
    return f"{seg['title'].split(':')[0]} {seg['title'].split(', ')[-1][:40]} ({kind} {t:.2f}, kappaleen {t - seg['off']:.2f} s)"


# rain bed: one Epidemic heavy-rain bed per shot (it STOPS when time is frozen / inside genjutsu: rain=False)
for s in SHOTS:
    s['sfx'] += SFX_ADD.get(s['id'], [])
for i, s in enumerate(SHOTS):
    t1 = SHOTS[i + 1]['t'] if i + 1 < len(SHOTS) else DUR
    if s['rain'] and s['id'] not in ('A06', 'B02'):
        s['sfx'].append(X(0, 'rain_thunder_heavy', .16, 0, dur=round(t1 - s['t'] + .25, 3), fi=.08, fo=.25))
    s['sfx'] = [c for c in s['sfx'] if c[2] > 0]
    if s['imp']:
        s['imp']['music_sync'] = music_label(s['t'] + s['imp']['offset'])
    s['music'] = None
for e in BEATS['edit']:
    t0 = q(max(e['v0'], 0))
    ttl = e['title'] if e['v0'] < MASK_T else 'katso spoilers.md'
    best = max([s for s in SHOTS if s['t'] <= t0 + 1e-6], key=lambda s: s['t'])
    best['music'] = (best['music'] + '; ' if best['music'] else '') + f'musiikki: {ttl} ({t0:.2f})'
HAND = ('ECU', 'lähikuva', 'hand2d', 'hahmokortti', 'katsomo')
MASK_HAND = {'C17', 'T02', 'T03', 'T04', 'T06', 'T07', 'T09', 'T13', 'T16', 'T17', 'T18', 'T22', 'T23', 'T24', 'J01', 'J06', 'J09', 'J12', 'J14', 'J16', 'J19', 'J20', 'J21'}
for s in SHOTS:
    if s['render'] is None:
        s['render'] = ('hand2d' if s['id'] in MASK_HAND else 'action3d') if s['mask'] else \
            ('hand2d' if any(h.lower() in s['cam'].lower() for h in HAND) else 'action3d')
    if s['imp']:
        s['imp']['render'] = 'hand2d'
for i, s in enumerate(SHOTS):
    s['t1'] = SHOTS[i + 1]['t'] if i + 1 < len(SHOTS) else DUR
    s['dur'] = round(s['t1'] - s['t'], 4)
    s['f0'], s['f1'] = round(s['t'] * FPS), round(s['t1'] * FPS)
    assert s['dur'] >= .24, (s['id'], s['dur'])
    s['phase'] = 1 if s['t'] < 16.6 else 2 if s['t'] < 56.5 else 3 if s['t'] < 92.5 else 4 if s['t'] < 136.9 else 5
    s['sfx'] = [(min(o, max(0, s['dur'] - .04)) if (o > 0 and not k.get('peak')) else o, n, g, p_, k) for (o, n, g, p_, k) in s['sfx']]
    if s['imp']:
        assert s['imp']['offset'] < s['dur'], ('impact outside shot', s['id'], s['imp']['offset'], s['dur'])
        if s['imp']['burst']:
            assert s['imp']['frames'] >= 5 and (s['imp']['frames'] <= 24 or s['id'] == 'J17')

shots_out = []
for s in SHOTS:
    o = dict(id=s['id'], phase=s['phase'], t0=s['t'], t1=s['t1'], dur=s['dur'], frame0=s['f0'], frame1=s['f1'], render=s['render'],
             camera=s['cam'], move=s['move'], inserts=s['cuts'], action=s['action'], chars=s['chars'],
             engine_chars=[ENGINE_NAME.get(c.split(':')[0], c) + (':' + c.split(':')[1] if ':' in c else '') for c in s['chars']],
             background=s['bg'], background_desc=BG[s['bg']], dmg=dmg_at(s['t']), rain=s['rain'], light=s['light'], text=s['text'], text_style=s['ts'],
             dialogue=[dict(who=w, line=l) for w, l in (s['dlg'] or [])], music=s['music'], masked=s['mask'])
    if s['imp']:
        im = dict(s['imp']); im['t'] = q(s['t'] + im.pop('offset')); im['frame'] = round(im['t'] * FPS)
        im['tags'] = ['BURST'] if im['burst'] else []
        im['t_end'] = q(im['t'] + im['frames'] / FPS)
        o['impact'] = im
    else:
        o['impact'] = None
    o['sfx'] = [dict(t=q(s['t'] + (float(c[4]['at']) if c[4].get('peak') else c[0])), s=c[1]) for c in s['sfx']]
    shots_out.append(o)

subs = []
for o in shots_out:
    t = o['t0'] + .08
    for d in o['dialogue']:
        subs.append(dict(t0=q(t), who=d['who'], line=d['line'], shot=o['id'], want=max(1.1, len(d['line']) / 14 + .35)))
        t += max(.6, o['dur'] / max(1, len(o['dialogue'])))
for i, sb in enumerate(subs):
    lim = subs[i + 1]['t0'] - .08 if i + 1 < len(subs) else DUR
    so = next(o for o in shots_out if o['id'] == sb['shot'])
    sb['t1'] = q(min(sb['t0'] + sb.pop('want'), lim, so['t1'] + .3))
imps = [o for o in shots_out if o['impact']]
bursts = [o for o in imps if o['impact']['burst']]
sig = {}
for o in imps:
    for c in o['impact']['signature']:
        sig[c] = sig.get(c, 0) + 1
gaps = [round(b['impact']['t'] - a['impact']['t'], 2) for a, b in zip(imps, imps[1:])]
stands = [o['id'] for o in shots_out if any(c.split(':')[0] in ('KYO', 'DAZ') for c in o['chars'])]
first_hit = next(o['impact']['t'] for o in shots_out if o['id'] == 'C01')
SUBCOL = dict(ITA='#e8364a', JUL='#f2c76b', URA='#9fe0a5', DAZ='#d9b77e', KYO='#f4a6c8')
SUBNAME = dict(ITA='ITACHI', JUL='JULIUS', URA='URAHARA', DAZ='DAZAI', KYO='SHUNSUI')
meta = dict(title='ITACHI UCHIHA vs JULIUS NOVACHRONO', fps=FPS, width=1920, height=1080, output_size='1280x720', duration=DUR, shots=len(shots_out),
            impact_series=len(imps), bursts=len(bursts), burst_ids=[o['id'] for o in bursts], impact_series_non_burst=len(imps) - len(bursts),
            impact_per_signature_visible={k: v for k, v in sig.items() if k != 'X'}, masked_impacts=sig.get('X', 0),
            impact_gap_max=max(gaps), impact_gap_mean=round(sum(gaps) / len(gaps), 2), first_hit=first_hit, stands_shots_visible=stands,
            characters=CH, engine_names=ENGINE_NAME, impact_styles=IMPACT_STYLES, pattern_key=PATTERN_KEY, backgrounds=BG, text_styles=TEXT_STYLE,
            subtitle_colors=SUBCOL, subtitle_names=SUBNAME,
            music='audio/beats.json: Grieg Death of Åse 0-10.60 | Grieg Stormy Evening 10.60-92.60 | katso spoilers.md (vain klassista, Epidemic Sound)',
            text_style='pre/text_style.md: CROW (Itachi) / WIZARD (Julius) / ARENA (Urahara, BEGIN, WINNER) / CARD_I / CARD_J; tekstitys 52 px Inter 700 + 8 px musta reuna',
            subtitle_style='englanti, fansub-tyyli; 52 px 1920-koossa, musta reunus 8 px; puhujan nimi värillä: ' + ', '.join(f'{SUBNAME[k]} {v}' for k, v in SUBCOL.items()),
            note='Masked shots (CLUE C17, TWIST T01-T25, FINALE J01-J22): content and dialogue only in pre/spoilers.md. impact.burst / impact.tags=["BURST"] = '
                 '>= 5 different impact styles within <= 1 s (style changes every 1-2 frames). Times = video seconds on the 24 fps grid; music = audio/beats.json.')
json.dump(dict(meta=meta, subtitles=subs, shots=shots_out), open(os.path.join(ROOT, 'pre', 'shots.json'), 'w'), ensure_ascii=False, indent=1)

# ---------------- events.json (sound) ----------------
ev = []
for s in SHOTS:
    for (o, name, g, p, k) in s['sfx']:
        e = dict(t=q(s['t'] + o), s=name, g=round(g, 3), pan=round(p, 2), shot=s['id'])
        e.update({kk: vv for kk, vv in k.items() if vv is not None})
        if e.get('peak'):
            e['t'] = q(s['t'] + float(k['at'])); e.pop('at')
        ev.append(e)
ev.sort(key=lambda e: e['t'])
imp_t = [q(s['t'] + s['imp']['offset']) for s in SHOTS if s['imp']]
dlg_win = [[q(sb['t0'] - .15), q(sb['t0']), q(sb['t1']), q(sb['t1'] + .2), 0.72] for sb in subs]
MASKED_DLG = [(94.85, 96.35), (96.75, 98.35), (98.50, 99.40), (99.45, 100.38), (102.15, 103.95), (104.25, 105.15), (121.65, 122.95), (129.65, 130.55),
              (130.60, 131.38), (134.05, 135.85), (137.10, 137.95), (138.00, 138.88), (140.50, 141.95), (145.75, 147.15), (151.40, 152.75), (168.30, 170.15),
              (173.00, 174.50), (175.60, 177.70)]   # = showdown/part2.js masked subtitles (locked picture), # spoilers.md
dlg_win += [[q(a - .15), q(a), q(b), q(b + .2), 0.72] for a, b in MASKED_DLG]
automation = dict(
    music_gain=dlg_win,                          # [t0, t1 (ramp in done), t2 (ramp out start), t3, gain]: music under dialogue
    music_boost=[[0.0, 0.05, 10.3, 10.6, 1.9],   # Åse opening is ~10 dB under its climax -> +5.6 dB so it is clearly heard
                 [34.3, 35.0, 55.2, 56.4, 1.45],  # Stormy Evening's quiet middle (-13...-18 dB) -> +3.2 dB (no long quiet stretches)
                 [167.6, 168.4, 177.0, 178.0, 1.9]],
    lowpass=[[35.25, 35.35, 35.85, 35.95, 1400],  # genjutsu shatters
             [100.5, 100.7, 107.6, 107.8, 2200],  # (twist) see spoilers.md
             [131.4, 131.6, 135.9, 135.93, 1800]],  # (twist) see spoilers.md
    sfx_gain=[[177.0, 177.9, 178.0, 178.0, 0.0]],
    tinnitus_synth=[[136.0, 1.0, .015], [165.7, 1.8, .015]],
    impact_duck=imp_t,
    sub_drops=[q(t) for t in (11.16, 16.99, 33.39, 56.62, 62.37, 70.0, 76.8, 90.78, 100.5, 117.95, 123.78, 135.95, 143.34, 163.0)],
)
json.dump(dict(fps=FPS, duration=DUR, note='generated by pre/make_preprod.py from the shot table; t = video seconds (24 fps grid). '
               'peak=true: the loudest point of the file lands on t. dur/fi/fo: trim + fades. rate: playback speed. start: offset into the file.',
               events=ev, automation=automation), open(os.path.join(ROOT, 'audio', 'events.json'), 'w'), indent=1)

# ---------------- storyboard.md (no spoilers) ----------------
L = ['# Storyboard: ITACHI UCHIHA vs JULIUS NOVACHRONO', '',
     f'1920x1080 sisäinen koko (lopullinen video 1280x720), 24 fps, {DUR:.0f} s ({DUR / 60:.2f} min), **{len(shots_out)} shottia**, **{len(imps)} impact frame -sarjaa**, '
     f'joista **{len(bursts)} BURSTia** (≥ 5 eri tyyliä ≤ 1 s:ssa) ja {len(imps) - len(bursts)} tavallista sarjaa '
     f'(näkyvät: {len(imps) - sig.get("X", 0)}, maskatut: {sig.get("X", 0)}; väli keskimäärin {meta["impact_gap_mean"]} s, pisin {meta["impact_gap_max"]} s). '
     f'**Ensimmäinen isku {first_hit:.2f} s.** Generoitu tiedostosta `pre/make_preprod.py` (sama data kuin `pre/shots.json` ja `audio/events.json`, {len(ev)} äänitapahtumaa). '
     'Ajat ovat videon sekunteja 24 fps -ruudukossa. Musiikin aksentit tulevat tiedostosta `audio/beats.json`; impactit on lukittu lähimpään vahvaan orkesteriaksenttiin.', '',
     '**Formaatti (Record of Ragnarok, kuten Harry vs Gojo / Naruto vs Luffy):** Valhallan areena yöllä sateessa (uusi puku: punainen kuu, märkä hiekka, lyhdyt), '
     'Urahara kuuluttajana (tekstitykset + viuhka/gongi), joka **kertoo heti alussa säännön: taistelu jatkuu kunnes toinen kuolee tai ei enää nouse** (A02-A03), '
     'hahmokortit, BEGIN-gongi. Katsomossa **siluettien keskellä Dazai (viisas: tietää aina mihin taistelu menee) ja hänen vieressään Shunsui '
     '(ennenaikaiset tuomiot "Ha, he lost")**, ks. `crowd.md`.', '',
     '**Spoilerisuoja:** maskattujen shottien sisältö ja repliikit ovat vain tiedostossa `pre/spoilers.md`: vihje (CLUE) C17, käänteet T01-T25 ja finaali J01-J22. '
     'Tässä niistä näkyvät ajoitus ja impact-ajoitus.', '',
     '**Render:** `action3d` = 3D-cel-pohja (toiminta, laajat kuvat, kamera-ajot) ja `hand2d` = käsin piirretyn näköinen 2D (lähikuvat, silmät, kasvot, kortit, katsomo). '
     '**Kaikki impact-ruudut ovat hand2d.** **BURST** (`impact.burst = true`, `impact.tags = ["BURST"]`): tyyli vaihtuu joka 1-2 ruudun välein (kuviokoodit alla), '
     'vähintään 5 eri tyyliä ≤ 1 s sisällä; toteutus ja fallbackit `impact_requests.md`. **Sade:** `rain=false` = sade on pysähtynyt (aika jäätynyt) tai genjutsun sisällä; '
     'ääni: sadematto katkeaa samoissa kohdissa.', '',
     '**Katsomoreaktiot:** ' + ', '.join(stands) + ' + maskatut (spoilers.md).', '',
     '## Rakenne', '',
     '| vaihe | aika | musiikki (Epidemic Sound, vain klassista) | sisältö |', '|---|---|---|---|',
     '| 1 Avaus, sääntö ja kortit | 0-16.7 | *Grieg: Åsen kuolema* (Itachi: matalat surumieliset jouset) → *Grieg: Myrskyisä ilta* 10.60 (Julius: vaskiaksentit) | '
     'Syöksy sadepilvistä Valhallaan, Urahara ("Welcome to Valhalla~! One rule tonight:"), **sääntö kuvana** ("It ends when one dies... or never rises."), '
     '**Itachin nousu varisparvesta + Sharingan + kortti**, **Julius kävelee pysähtyneen sateen läpi + kortti + VS**, **GONG → BEGIN! 15.32**. |',
     '| 2 Taktinen sota | 16.7-56.6 | *Myrskyisä ilta* (aksentit 16.99, 22.87, 25.79, 30.28, 33.39; hiljaisempi keskijakso = sokea taistelu) | '
     '**Ensimmäinen isku 16.99 (BURST)**, Chrono Stasis, varisklooni (Itachin oivallus: "Your magic needs a target."), kiihdytys, Gōkakyū vs ajan kelaus, varjo-shuriken, '
     '"Marvelous!", **genjutsu (BURST)**, genjutsu särkyy, **Juliuksen oivallus: taistelee silmät kiinni**, sokea kunai-sakuga, Hōsenka + oikea potku, **Mangekyō**. |',
     '| 3 Mangekyō vs aika | 56.6-92.6 | *Myrskyisä ilta* (nousu 56.6 = Amaterasu, aksentti 62.35, myrsky 86.6-91.6, aksentti 90.78) | '
     '**AMATERASU (BURST)**, jäädytetyt liekit ryömivät, **CHRONO ANASTASIS: liekit kelautuvat takaisin silmään (BURST)**, kiihdytetty iskusarja, **Susanoo (BURST)**, '
     '**MANA ZONE (BURST)**, magatamat kääntyvät takaisin, Totsuka-sakuga, **Susanoo vs Mana Zone -törmäys (BURST)**. |',
     '| 4 Käänteet | 92.6-137.0 | katso spoilers.md | **Katso spoilers.md.** |',
     '| 5 Ratkaisu ja jälkikaiku | 137.0-178 | katso spoilers.md | **Katso spoilers.md.** Viimeinen isku → pitkä BURST → hiljaisuus → hidas seuraus → yksi lopetuskuva. |', '',
     '## Impact-tyylit', '', PATTERN_KEY, '']
for k, v in IMPACT_STYLES.items():
    L.append(f'- `{k}`: {v}')
L += ['', '## Shot-lista', '', '| # | aika | kesto | render | BG / dmg | kamera | tapahtuu (ketkä) | teksti / repliikki | IMPACT | ääni / musiikki |', '|---|---|---|---|---|---|---|---|---|---|']
for o in shots_out:
    if o['masked']:
        lab = {'FINALE': 'finaali', 'TWIST': 'käänne', 'CLUE': 'vihje'}.get(o['masked'], o['masked'])
        L.append(f"| {o['id']} | {o['t0']:.2f} | {o['dur']:.2f} | {o['render']} | – | – | {lab}: katso spoilers.md | – | " +
                 (f"{'**BURST** ' if o['impact']['burst'] else ''}**{o['impact']['frames']}f** @ {o['impact']['t']:.2f}" if o['impact'] else '') + ' | – |')
        continue
    tx = []
    if o['text']:
        tx.append(f"**{o['text']}** ({o['text_style']})")
    tx += [f"{SUBNAME.get(d['who'], d['who'])}: “{d['line']}”" for d in o['dialogue']]
    im = ''
    if o['impact']:
        i = o['impact']
        im = f"{'**BURST** ' if i['burst'] else ''}**{i['style']}** {i['pattern']} ({i['frames']}f) @ {i['t']:.2f}: {i['trigger']} [{', '.join(i['signature'])}]; {i['music_sync']}"
    snd = ', '.join(sorted({c['s'] for c in o['sfx']}))
    if o['music']:
        snd = f"*{o['music']}*; " + snd
    cam = f"{o['camera']}; {o['move']}" + (f"; *{o['inserts']}*" if o['inserts'] else '')
    L.append(f"| {o['id']} | {o['t0']:.2f} | {o['dur']:.2f} | {o['render']} | {o['background']} / {o['dmg']}{'' if o['rain'] else ' / sade seis'} | {cam} | {o['action']} ({', '.join(o['chars'])}) | {'<br>'.join(tx)} | {im} | {snd} |")
L += ['', '## Tekstitykset (maskattujen shottien repliikit ovat spoilers.md:ssä)', '', '| alku | loppu | kuka | rivi | shotti |', '|---|---|---|---|---|']
L += [f"| {x['t0']:.2f} | {x['t1']:.2f} | {SUBNAME.get(x['who'], x['who'])} | {x['line']} | {x['shot']} |" for x in subs]
qg = os.path.join(ROOT, 'pre', 'quality_gate.md')
L += ['', '## Laatuportti (itsearvio)', '', open(qg).read() if os.path.exists(qg) else '(pre/quality_gate.md puuttuu)']
open(os.path.join(ROOT, 'pre', 'storyboard.md'), 'w').write('\n'.join(L) + '\n')
print('shots', len(shots_out), 'impacts', len(imps), 'bursts', len(bursts), [o['id'] for o in bursts], 'signature', sig, 'gap max', meta['impact_gap_max'],
      'mean', meta['impact_gap_mean'], 'first hit', first_hit, 'events', len(ev), 'subs', len(subs), 'stands', stands)
print('gaps>4', [(imps[i]['id'], imps[i + 1]['id'], g) for i, g in enumerate(gaps) if g > 4])
missing = sorted({e['s'] for e in ev} - {f[:-4] for f in os.listdir(os.environ.get('SFX_DIR', '/dev/null'))}) if os.environ.get('SFX_DIR') else []
print('missing sfx', missing)
long_ = [(sb['shot'], sb['line']) for sb in subs if len(sb['line'].split()) > 8]
print('long lines', long_)
