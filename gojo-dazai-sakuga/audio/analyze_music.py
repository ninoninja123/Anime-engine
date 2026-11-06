#!/usr/bin/env python3
"""ITACHI vs JULIUS - raw music analysis (copied from naruto-vs-luffy) (numpy/scipy only, no librosa).

usage: python3 -I analyze_music.py MUSIC_DIR out_raw.json
For every track in TRACKS: per-second RMS (dB), spectral-flux onset curve + strongest accents, tempo (autocorrelation of the
flux, 60-180 BPM, with the top 3 candidates), global key + key per 8 s window (Krumhansl-Schmuckler on a log-frequency chroma),
quiet spots (< -35 dB re. track peak) and novelty peaks (candidate section borders).
The hand-checked result (sections, roles, cut points) lives in music_analysis.json (written by hand from this raw output).
"""
import json, subprocess, sys
import numpy as np
from scipy import signal

SR = 22050
TRACKS = dict(ase='ase.mp3', stormy='stormy.mp3', summer3='summer3.mp3', ingrid='ingrid.mp3', winter1='winter1.mp3', summer2='summer2.mp3')   # 3 used + 3 candidates
BPM_HINT = {}   # classical = rubato, no fixed tempo
if len(sys.argv) > 3:
    TRACKS = {k: v for k, v in TRACKS.items() if k in sys.argv[3].split(',')}
NOTES = 'C C# D D# E F F# G G# A A# B'.split()
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def load(p):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)


def key_of(chroma):
    best = (-9, '')
    for i in range(12):
        for prof, nm in ((MAJ, 'major'), (MIN, 'minor')):
            r = np.corrcoef(np.roll(prof, i), chroma)[0, 1]
            if r > best[0]:
                best = (r, f'{NOTES[i]} {nm}')
    return best[1], round(float(best[0]), 2)


mdir, out = sys.argv[1], sys.argv[2]
res = {}
for name, fn in TRACKS.items():
    x = load(f'{mdir}/{fn}')
    dur = len(x) / SR
    n = int(dur)
    rms = np.array([np.sqrt(np.mean(x[i * SR:(i + 1) * SR] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms / rms.max())
    f, t, Z = signal.stft(x, SR, nperseg=2048, noverlap=1536)
    A = np.abs(Z)
    M = np.log1p(A * 100)
    flux = np.maximum(0, np.diff(M, axis=1)).sum(0); ft = t[1:]
    flux /= np.percentile(flux, 99.5) + 1e-9
    hop = t[1] - t[0]
    pk, _ = signal.find_peaks(flux, height=.8, distance=int(.3 / hop))
    acc = sorted([(round(float(ft[k]), 2), round(float(flux[k]), 2)) for k in pk], key=lambda a: -a[1])[:40]
    # tempo: autocorrelation of the onset curve
    o = flux - flux.mean()
    ac = np.correlate(o, o, 'full')[len(o) - 1:]
    lags = np.arange(len(ac)) * hop
    sel = (lags > 60 / 180) & (lags < 60 / 60)
    cand = np.argsort(ac[sel])[::-1]
    bpms = []
    for c in cand:
        b = round(60 / lags[sel][c], 1)
        if all(abs(b - q) > 3 for q in bpms):
            bpms.append(b)
        if len(bpms) == 3:
            break
    # chroma (log-frequency bins 55 Hz - 4 kHz)
    fr = f[1:]; valid = (fr > 55) & (fr < 4000)
    pc = (np.round(12 * np.log2(fr[valid] / 440.0)) + 9) % 12
    C = np.zeros((12, A.shape[1]))
    for k in range(12):
        C[k] = A[1:][valid][pc == k].sum(0)
    gkey = key_of(C.sum(1))
    win = int(8 / hop)
    keys = [[round(i * hop, 1), *key_of(C[:, i:i + win].sum(1))] for i in range(0, C.shape[1] - win // 2, win)]
    # novelty: change in 4 s mean of (dB, spectral centroid)
    cen = (A * f[:, None]).sum(0) / (A.sum(0) + 1e-9)
    cen_s = np.array([cen[int(i / hop):int((i + 1) / hop)].mean() for i in range(n)])
    feat = np.stack([db / 10, np.log2(cen_s + 1) * 1.5], 1)
    nov = np.array([np.linalg.norm(feat[max(0, i - 4):i].mean(0) - feat[i:i + 4].mean(0)) if 4 <= i < n - 4 else 0 for i in range(n)])
    npk, _ = signal.find_peaks(nov, height=np.percentile(nov, 85), distance=6)
    phase = None
    if name in BPM_HINT:   # fixed-tempo rock: phase of the beat grid that collects the most onset energy (+ refined tempo)
        best = (-1, 0, 0)
        for bpm in np.arange(BPM_HINT[name] - 1.0, BPM_HINT[name] + 1.01, .1):
            per = 60 / bpm
            for ph in np.arange(0, per, .01):
                idx = np.round((np.arange(ph, dur - .1, per)) / hop).astype(int) - 1
                idx = idx[(idx >= 0) & (idx < len(flux))]
                sc_ = flux[idx].mean()
                if sc_ > best[0]:
                    best = (sc_, bpm, ph)
        phase = dict(bpm=round(float(best[1]), 2), phase=round(float(best[2]), 3), score=round(float(best[0]), 3))
    res[name] = dict(beat=phase, file=fn, duration_s=round(dur, 2), per_second_db=[round(float(v), 1) for v in db], tempo_candidates=bpms,
                     key=gkey, keys_8s=keys, quiet_s=[int(i) for i in np.where(db < -35)[0]],
                     novelty_s=[int(i) for i in npk], accents_top=sorted(acc))
    print(name, round(dur, 1), 's', bpms, phase, gkey, 'novelty', [int(i) for i in npk])
json.dump(res, open(out, 'w'), indent=1)
