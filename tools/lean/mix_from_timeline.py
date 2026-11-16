#!/usr/bin/env python3
"""mix_from_timeline.py --timeline video_timeline.json --lines-dir lines/ [--lines lines.json] [--music-plan music_plan.json --music-dir music/]
                       [--sfx-map sfx_map.json --sfx-dir sfx/] [--out film_mix.wav] [--lufs -14] [--tp -2.0] [--duck -6] [--stems]
Film mix from a timeline (no hand placement): 48 kHz stereo WAV of exactly timeline.duration + mix_report.json next to it.
TIMELINE: duration; lines[{id, start, who?, gain_db?, echo_of?}]; music[{cue, t}]; sfx[{id|file, t, gain_db?}].
SPEECH: lines-dir/<id>.wav, one static gain per character (who from timeline or --lines) to -20 LUFS. No compressor, no tempo change.
MUSIC: music_plan {tracks:[{file, start_cue, stop_cue?, level_lufs, fade_in, fade_out, src_offset?, dips?[[cue,db,hold,rel]]}]}:
  plays continuously start..stop cue (hard cut if stop cue exists), loudness-matched, ducked --duck dB under speech (smooth).
SFX: sfx_map {sources:{key:{win:[start,len]}}, cues:{cue_id:[key, gain_db, rate, reverse]}} with sfx-dir/<key>.(mp3|wav), or a timeline
  entry with "file". Onset-aligned to cue time (the source's attack lands on t). Unmapped cues are listed in the report.
MASTER: integrated --lufs, 4x-oversampled look-ahead peak limiter at --tp dBTP (default -2.0 so it stays < -1 after AAC; check with loudness.sh --aac)."""
import os, sys, json, subprocess, glob, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d
a = sys.argv[1:]
if not a or a[0] in ('-h', '--help'): print(__doc__); sys.exit(0)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
SR = 48000; MET = pyln.Meter(SR); TL = json.load(open(opt('--timeline'))); D = float(TL['duration']); N = int(round(D * SR))
db = lambda x: 10 ** (x / 20)
def load(p):
    y = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(y, np.float32).reshape(-1, 2).astype(np.float64)
def lufs(x):
    try: v = MET.integrated_loudness(x); return v if np.isfinite(v) else -70.0
    except Exception: return -70.0
def add(buf, x, t):
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n]
# speech
speech = np.zeros((N, 2)); act = np.zeros(N); WHO = {}
if opt('--lines'): WHO = {l['id']: l.get('who', '') for l in json.load(open(opt('--lines'), encoding='utf8'))}
LD = opt('--lines-dir', 'lines'); got = {}
for l in TL.get('lines', []):
    src = l.get('echo_of') or l['id']; p = os.path.join(LD, src + '.wav')
    if not os.path.exists(p): print('missing line wav:', p); continue
    got[l['id']] = (load(p), l.get('who') or WHO.get(src, '?'))
GG = {}
for w in set(v[1] for v in got.values()):
    z = np.concatenate([y for y, ww in got.values() if ww == w]); GG[w] = db(-20 - lufs(z))
for l in TL.get('lines', []):
    if l['id'] not in got: continue
    y, w = got[l['id']]; y = y * GG[w] * db(l.get('gain_db', 0) - (4 if l.get('echo_of') else 0))
    add(speech, y, l['start']); i = int(round(l['start'] * SR)); act[i:i + len(y)] = 1
# music
music = np.zeros((N, 2)); cue = {c['cue']: c['t'] for c in TL.get('music', [])}
if opt('--music-plan'):
    for tr in json.load(open(opt('--music-plan')))['tracks']:
        if tr['start_cue'] not in cue: print('music cue missing, skipped:', tr.get('id', tr['file'])); continue
        t0 = cue[tr['start_cue']]; t1 = cue.get(tr.get('stop_cue'), D); y = load(os.path.join(opt('--music-dir', 'music'), tr['file']))
        o = int(tr.get('src_offset', 0) * SR); y = y[o:o + int((t1 - t0) * SR)].copy(); y *= db(tr.get('level_lufs', -24) - lufs(y))
        fi = int(tr.get('fade_in', 0) * SR); fo = int((0.06 if tr.get('stop_cue') in cue else tr.get('fade_out', 3)) * SR)
        if fi: y[:fi] *= np.linspace(0, 1, fi)[:, None]
        if fo: y[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
        for c, dep, hold, rel in tr.get('dips', []):
            if c not in cue: continue
            s = int((cue[c] - t0) * SR); g = db(dep); seg = np.r_[np.linspace(1, g, int(.4 * SR)), np.full(int(hold * SR), g), np.linspace(g, 1, int(rel * SR))]
            e = min(len(y), s + len(seg)); env = np.ones(len(y)); env[s:e] = seg[:e - s]; y *= env[:, None]
        add(music, y, t0)
k = int(0.25 * SR); sm = np.minimum(1, uniform_filter1d(act, k) * 1.5)  # O(N) (np.convolve was O(N*k): minutes on a 7-min film); music *= db(float(opt('--duck', -6)) * sm)[:, None]
# sfx
sfx = np.zeros((N, 2)); SM = json.load(open(opt('--sfx-map'))) if opt('--sfx-map') else {'sources': {}, 'cues': {}}; cache = {}; miss = set()
def source(key, path=None):
    if key not in cache:
        if path is None:
            c = glob.glob(os.path.join(opt('--sfx-dir', 'sfx'), key + '.*')); path = c[0] if c else None
        if not path: cache[key] = None; return None
        y = load(path); s, ln = SM['sources'].get(key, {}).get('win', [0, 2.0]); y = y[int(s * SR):int((s + ln) * SR)].copy()
        f = min(len(y), int(.03 * SR)); y[-f:] *= np.linspace(1, 0, f)[:, None]
        e = np.abs(y).max(1); on = int(np.argmax(e > e.max() * 0.1)); cache[key] = (y / max(e.max(), 1e-6) * db(-12), on)
    return cache[key]
for c in TL.get('sfx', []):
    if 'file' in c: m = [c['file'], 0, 1, 0]; src = source(c['file'], c['file'])
    else:
        m = SM['cues'].get(c['id'])
        if not m: miss.add(c['id']); continue
        src = source(m[0])
    if src is None: miss.add(c.get('id', c.get('file'))); continue
    y, on = src; rate = m[2] if len(m) > 2 else 1
    if len(m) > 3 and m[3]: y = y[::-1]; on = 0
    if rate != 1:
        from fractions import Fraction
        fr = Fraction(rate).limit_denominator(20); y = resample_poly(y, fr.denominator, fr.numerator, axis=0); on = int(on / rate)
    add(sfx, y * db(m[1] + c.get('gain_db', 0) - 3), c['t'] - on / SR)
# master
mix = speech + music + sfx; gl = -14.0; T = float(opt('--lufs', -14)); TP = float(opt('--tp', -2.0))
if lufs(mix) > -69: gl = T - lufs(mix); mix *= db(gl)
def limit(x, c):
    pk = np.abs(resample_poly(x, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:len(x)]
    g = np.minimum(1, db(c) / np.maximum(pk, 1e-9)); la = int(.005 * SR)
    return x * uniform_filter1d(minimum_filter1d(minimum_filter1d(g, 2 * la + 1), int(.06 * SR)), 2 * la + 1)[:, None]
for _ in range(4):
    mix = limit(mix, TP); il = lufs(mix)
    if abs(il - T) < 0.12 or il < -69: break
    mix *= db(T - il)
out = opt('--out', 'film_mix.wav'); sf.write(out, mix.astype(np.float32), SR, subtype='PCM_24')
up = np.abs(resample_poly(mix, 4, 1, axis=0)).max()
rep = dict(out=out, duration_s=round(len(mix) / SR, 3), lufs=round(lufs(mix), 2), true_peak_dbtp=round(20 * np.log10(max(up, 1e-9)), 2),
           speech_lufs=round(lufs(speech * db(gl)), 1), music_lufs=round(lufs(music * db(gl)), 1), sfx_lufs=round(lufs(sfx * db(gl)), 1),
           lines=len(got), sfx_events=len(TL.get('sfx', [])) - len(miss), unmapped_sfx=sorted(miss)[:20], speech_share=round(float(act.mean()), 3))
json.dump(rep, open(os.path.splitext(out)[0] + '_report.json', 'w'), indent=1); print(json.dumps(rep))
if '--stems' in a:
    for nm, x in (('speech', speech), ('music', music), ('sfx', sfx)): sf.write(os.path.splitext(out)[0] + '_' + nm + '.wav', (x * db(gl)).astype(np.float32), SR, subtype='PCM_16')
