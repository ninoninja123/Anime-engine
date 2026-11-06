#!/usr/bin/env python3
"""ITACHI UCHIHA vs JULIUS NOVACHRONO - build audio/beats.json: the music edit (which part of which track plays where) + accent grid in VIDEO time.
Structure recycled from naruto-vs-luffy/audio/analyze_beats.py.

usage: python3 -I analyze_beats.py MUSIC_DIR out.json      (MUSIC_DIR = scratchpad/ivj/music)
USER: ONLY CLASSICAL MUSIC (Epidemic Sound recordings, no rock), chosen by EMOTION, long continuous pieces, changes only at the big turns.
THREE recordings (Odyssey Orchestra & Eric Jacobsen), FIVE segments:
  ase     = Grieg: Peer Gynt Suite No. 1: Death of Åse      (Itachi: sad, dark strings; long crescendo that breaks off)  video 0-10.60, 92.60-135.93, 167.60-178
  stormy  = Grieg: Peer Gynt Suite No. 2: Stormy Evening     (Julius' entrance stabs + the escalating battle)             video 10.60-92.60
  summer3 = Vivaldi: Summer III Presto (the storm)            (finale)                                                    video 137.00-165.60
Rubato orchestral recordings: no beat grid, accents only (strongest spectral-flux onsets).  The edit (SEG) is the single source of truth for mix.py.
SPOILER RULE: why-texts after video 92.6 say only 'katso spoilers.md'.
"""
import json, os, subprocess, sys
import numpy as np
from scipy import signal

SR = 22050
mdir, out = sys.argv[1], sys.argv[2]
DUR = 178.0
OR = 'Odyssey Orchestra & Eric Jacobsen (Epidemic Sound)'
T = dict(
    ase=dict(title='Grieg: Peer Gynt Suite No. 1, Op. 46: No. 2, Death of Åse', artist=OR, id='9ebb6c45-bc12-4f0c-a614-aa7defe92a7e',
             key='B minor', kind='epidemic classical (romantic, strings)'),
    stormy=dict(title="Grieg: Peer Gynt Suite No. 2, Op. 55: No. 3, Peer Gynt's Homecoming (Stormy Evening on the Sea)", artist=OR,
                id='c300be1a-0b8f-4b3a-8859-9334be9cd337', key='F# minor', kind='epidemic classical (romantic, full orchestra)'),
    summer3=dict(title='Vivaldi: The Four Seasons, Summer RV 315: III. Presto', artist='Michelle Ross, Eric Jacobsen & Odyssey Orchestra (Epidemic Sound)',
                 id='3dd2a7c0-7363-428b-918f-bb729286fba8', key='G minor', kind='epidemic classical (baroque, strings)'),
)
# (track, video v0, video v1, off (video = track + off), fade-in, fade-out, act, why)
SEG = [
    ('ase', 0.00, 10.60, 0.00, .30, .25, 1,
     'KYLMÄ AVAUS + ITACHI: Åsen kuolema alusta (matalat jouset, surumielinen ja synkkä): sadepilvet, Urahara + säännöt, varikset, Sharingan, Itachin kortti.'),
    ('stormy', 10.60, 92.60, 10.60, .02, .35, 1,
     'JULIUKSEN SISÄÄNTULO + TAISTELU: Myrskyisän illan vaskiaksentit = kello-taikapiiri 11.16, ensimmäinen isku 16.99, varisisku 22.87, '
     'pylväs 25.79, varjo-shuriken 30.28, genjutsu 33.39; hiljaisempi jakso 34.6-55.6 = sokea taistelu (taktinen sota); nousu 56.6 = AMATERASU, '
     'aksentti 62.35 = CHRONO ANASTASIS; myrsky 86.6-91.6, aksentti 90.78 = Susanoo vs Mana Zone. Leikkaus kappaleen omaan notkoon (kpl 82.0).'),
    ('ase', 92.60, 135.93, 0.93, .25, .02, 4, 'katso spoilers.md'),
    ('summer3', 137.00, 165.60, 15.29, .01, .50, 5, 'katso spoilers.md'),
    ('ase', 167.60, 178.00, 167.60, 1.2, 1.6, 5, 'katso spoilers.md'),
]
TRIM = {'ase': 0.0, 'stormy': 0.0, 'summer3': 0.0}   # tuned on preview stems (music_map.md)
TRIM_SEG = {('ase', 92.60): -4.0}   # Åse's climax section: fewer SFX there -> keep the orchestra from swamping the dialogue
EDIT = [dict(track=k, v0=v0, v1=v1, off=off, fi=fi, fo=fo, act=act, why=why, trim_db=TRIM_SEG.get((k, v0), TRIM.get(k, 0.0)), file=k, bpm=0, **T[k])
        for k, v0, v1, off, fi, fo, act, why in SEG]


def load(p):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)


cache = {}
res = dict(fps=24, duration=DUR, note='All times are VIDEO seconds. frame = round(t*24). Rubato orchestral recordings: accents only, no beat grid.',
           edit=[], acts=[], accents=[], downbeats=[], phrases=[], beats=[], drops=[], pits=[])
for e in EDIT:
    fn = next(f"{mdir}/{e['file']}{ext}" for ext in ('.wav', '.mp3') if os.path.exists(f"{mdir}/{e['file']}{ext}"))
    x = cache.setdefault(e['file'], load(fn))
    f, t, Z = signal.stft(x, SR, nperseg=1024, noverlap=768)
    M = np.log1p(np.abs(Z) * 100)
    flux = np.maximum(0, np.diff(M, axis=1)).sum(0); ft = t[1:]
    flux /= np.percentile(flux, 99.5)
    t0, t1 = e['v0'] - e['off'], e['v1'] - e['off']
    sel = (ft >= t0 + .05) & (ft < t1 - .05)
    pk, pr = signal.find_peaks(np.where(sel, flux, 0), height=.75, distance=int(.3 * SR / 256))
    for k in pk:
        res['accents'].append(dict(t=round(float(ft[k] + e['off']), 3), strength=round(float(flux[k]), 2), track=e['track']))
    res['edit'].append({k: e[k] for k in ('track', 'file', 'title', 'artist', 'id', 'kind', 'key', 'bpm', 'v0', 'v1', 'off', 'fi', 'fo', 'act', 'why', 'trim_db')} |
                       dict(track_in=round(t0, 3), track_out=round(t1, 3)))
res['accents'].sort(key=lambda a: a['t'])
res['acts'] = [dict(act=1, t0=0, t1=16.7, music='Åsen kuolema (Itachi, säännöt) -> Myrskyisä ilta 10.60 (Julius, kortit, BEGIN)'),
               dict(act=2, t0=16.7, t1=56.6, music='Myrskyisä ilta (ensimmäinen isku, taktinen sota, sokea taistelu)'),
               dict(act=3, t0=56.6, t1=92.6, music='Myrskyisä ilta (Mangekyō, Amaterasu, Susanoo vs Mana Zone)'),
               dict(act=4, t0=92.6, t1=137.0, music='katso spoilers.md'),
               dict(act=5, t0=137.0, t1=DUR, music='katso spoilers.md')]
res['drops'] = [dict(t=10.60, what='Myrskyisä ilta alkaa: Julius'), dict(t=11.16, what='vaskiaksentti: kello-taikapiiri'), dict(t=15.30, what='gongi'),
                dict(t=16.99, what='vaskiaksentti: ensimmäinen isku'), dict(t=56.60, what='orkesterinousu: AMATERASU'),
                dict(t=62.35, what='aksentti: CHRONO ANASTASIS'), dict(t=90.78, what='myrskyn aksentti: Susanoo vs Mana Zone'),
                dict(t=92.60, what='katso spoilers.md'), dict(t=135.93, what='katso spoilers.md'), dict(t=137.00, what='katso spoilers.md'),
                dict(t=163.00, what='katso spoilers.md'), dict(t=167.60, what='katso spoilers.md')]
res['pits'] = [dict(t0=34.6, t1=55.6, depth='Myrskyisän illan hiljaisempi jakso (-13...-18 dB): sokea taistelu, music_boost +3 dB'),
               dict(t0=35.3, t1=36.4, depth='lowpass: genjutsu hajoaa'),
               dict(t0=135.93, t1=137.0, depth='katso spoilers.md'), dict(t0=165.6, t1=167.6, depth='katso spoilers.md')]
json.dump(res, open(out, 'w'), indent=1, ensure_ascii=False)
print('accents', len(res['accents']), [(a['t'], a['strength']) for a in res['accents'] if a['strength'] > 1.0][:60])
