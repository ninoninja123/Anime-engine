#!/usr/bin/env python3
"""GOJO vs DAZAI (10 s) mix: numpy only.  usage: python3 -I mix_gd.py AUDIO_DIR out.wav
AUDIO_DIR holds music.mp3 (Epidemic Sound 'Invictus' - Lennon Hutton) + SFX wavs (Epidemic Sound).  Music section starts at 70.82 s so the
track's 1-s break lands on Gojo's line/wind-up and its downbeat (78.33 s) lands on the punch contact (7.51 s).
Music sits ~-7 dB under the SFX, ducked ~7.5 dB on the big impacts.  Every SFX <= 2 s, layered (whoosh + impact + sub + detail).
Final loudness: ffmpeg loudnorm -14 LUFS / -2 dBTP."""
import subprocess, sys, os
import numpy as np
SR = 48000; DUR = 10.0; N = int(DUR * SR)
adir, out = sys.argv[1], sys.argv[2]
def load(name, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start)] + (['-t', str(dur)] if dur else []) + ['-i', os.path.join(adir, name), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()
db = lambda g: 10 ** (g / 20)
sfx = np.zeros((N, 2), np.float32)
EV = [  # (t, file, gain dB, trim s or None, pan -1..1)
    (0.00, 'flyby.wav', -8, None, -.3), (0.02, 'sub.wav', -12, .9, 0),
    (1.10, 'swish.wav', -10, None, .2), (1.44, 'swish.wav', -9, None, -.2), (1.60, 'shine.wav', -3, None, 0), (1.60, 'zap.wav', -13, None, .1),
    (1.95, 'surge.wav', -6, 1.2, .2), (2.05, 'crackle.wav', -15, .5, .3),
    (2.47, 'energy_fire.wav', -1, None, 0), (2.47, 'hit_perc.wav', -5, 1.2, 0), (2.48, 'boom.wav', -7, 1.2, 0), (2.52, 'flyby.wav', -8, None, -.4),
    (3.35, 'swish.wav', -11, None, -.2), (3.54, 'punch_low.wav', -4, None, 0), (3.54, 'crackle.wav', -9, .35, -.2),
    (3.66, 'fizzle.wav', -2, 1.3, 0), (3.66, 'sub.wav', -9, .8, 0), (3.68, 'zap.wav', -12, None, .2),
    (4.55, 'teleport.wav', -2, None, .2), (4.56, 'swish.wav', -6, None, .3), (4.66, 'punch_low.wav', -9, None, 0),
    (4.79, 'glass.wav', -1, 1.3, 0), (4.79, 'sub.wav', -6, .9, 0), (4.80, 'zap.wav', -10, None, -.2), (4.82, 'fizzle.wav', -12, .8, .1),
    (5.75, 'swish.wav', -13, None, 0), (6.12, 'swish.wav', -16, None, .2),
    (6.85, 'swish.wav', -12, None, -.2), (7.12, 'crackle.wav', -10, .38, .2), (7.30, 'zap.wav', -12, None, -.1),
    (7.43, 'swish.wav', -3, None, .1),
    (7.51, 'punch_anime.wav', 0, None, 0), (7.51, 'punch_heavy.wav', -3, None, 0), (7.51, 'boom.wav', -3, 1.5, 0), (7.51, 'sub.wav', 0, 1.3, 0), (7.52, 'hit_perc.wav', -5, 1.4, 0),
    (7.89, 'flyby.wav', -4, None, -.5), (7.90, 'crackle.wav', -12, .3, .3), (7.92, 'punch_low.wav', -8, None, 0),
    (8.86, 'splash.wav', 0, None, -.1), (8.86, 'punch_low.wav', -9, None, 0), (8.88, 'sub.wav', -10, .7, 0),
    (9.30, 'swish.wav', -12, None, 0), (9.55, 'swish.wav', -16, None, .3),
]
cache = {}
for t, f, g, trim, pan in EV:
    k = (f, trim)
    if k not in cache:
        x = load(f); x = x[:int((trim or 2.0) * SR)]
        L = len(x); fo = min(int(.06 * SR), L); x[L - fo:] *= np.linspace(1, 0, fo)[:, None]
        cache[k] = x
    x = cache[k] * db(g); x = x * np.array([min(1, 1 - pan), min(1, 1 + pan)], np.float32)
    i = int(t * SR); j = min(N, i + len(x)); sfx[i:j] += x[:j - i]
mus = load('music.mp3', 70.82, DUR)[:N]
if len(mus) < N: mus = np.vstack([mus, np.zeros((N - len(mus), 2), np.float32)])
tt = np.arange(N) / SR
env = np.ones(N, np.float32)
for t0, d, k in [(2.47, .35, .55), (3.66, .3, .6), (4.79, .35, .55), (7.51, .45, .42), (8.86, .3, .6)]:
    a = np.clip((tt - t0 + .02) / .02, 0, 1) * np.clip(1 - (tt - t0 - d) / .25, 0, 1); env *= 1 - (1 - k) * a
env *= np.clip(tt / .15, 0, 1) * np.clip((DUR - tt) / .5, 0, 1) ** .7
# level: music RMS ~7 dB under the SFX RMS
rs = np.sqrt(np.mean(sfx ** 2)) + 1e-9; rm = np.sqrt(np.mean(mus ** 2)) + 1e-9
mus = mus * (rs / rm * db(-4.5))
mix = sfx + mus * env[:, None]
mix = np.tanh(mix / max(1e-6, np.abs(mix).max()) * 1.4) * .7
tmp = out + '.raw.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=mix.astype(np.float32).tobytes(), check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-2:LRA=11,aresample=48000', '-ar', '48000', out], check=True)
os.remove(tmp); print('wrote', out)
