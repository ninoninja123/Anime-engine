#!/usr/bin/env python3
"""ITACHI vs JULIUS: sound design + mix (numpy/scipy + ffmpeg). Based on naruto-vs-luffy/audio/mix.py (<- hulk-vs-yujiro <- harry-vs-gojo).

usage: python3 -I mix.py events.json beats.json AUDIO_DIR out.wav [--raw]
  events.json : {events:[{t,s,g,pan,dur?,fi?,fo?,rate?,peak?,start?}], automation:{...}}   (pre/make_preprod.py)
  beats.json  : music edit (which part of which track plays where) + accents              (analyze_beats.py)
  AUDIO_DIR   : scratchpad/ivj -> music/<file>.mp3 as named in beats.json edit[].file (ONLY Epidemic Sound, ONLY CLASSICAL: Grieg Death of Åse,
                Grieg Stormy Evening, Vivaldi Summer III Presto) + sfx/<name>.wav (Epidemic Sound; IDs in sfx_list.tsv)
Output: 48 kHz stereo. Default = loudness-normalised to -14 LUFS / -2.0 dBTP BEFORE AAC (two-pass ffmpeg loudnorm, linear);
--raw writes the un-normalised float mix.  MIX_STEMS=1 also writes out_music.wav / out_sfx.wav.

USER FEEDBACK (naruto-vs-luffy): music must be clearly heard under the SFX in action (~ -7...-8 dB), impact frames duck the music ~7.5 dB (dk .58),
no long silent stretches (only the short pits written in beats.json / events.json automation).  Classical recordings are dynamic: one gain per track
(gated RMS of the whole file + trim_db) + music_boost automation lifts the naturally quiet passages (Åse opening, Stormy Evening's middle).
LOTS of layered SFX (whoosh + impact + sub + detail on every hit, rain bed that stops when time is frozen, crows, clocks, fire).
Master: gentle compressor, 16 kHz lowpass, 4x-oversampled lookahead true-peak limiter (-2.3 dBTP), iterated to -14 LUFS / <= -2.0 dBTP BEFORE AAC.
Synthesis is only a support layer: sub-bass drops under the biggest hits and a quiet tinnitus tone.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from scipy import signal

SR = 48000
FPS = 24
args = [a for a in sys.argv[1:] if not a.startswith('--')]
RAW = '--raw' in sys.argv
ev_path, beats_path, adir, out = args[:4]
EVJ = json.load(open(ev_path)); EV = EVJ['events']; AUTO = EVJ.get('automation', {})
BEATS = json.load(open(beats_path))
DUR = float(EVJ.get('duration', 180.0)); N = int(DUR * SR)
rng = np.random.default_rng(2026)
tt = np.arange(N) / SR


def load(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def filt(x, kind, f, order=2):
    s = signal.butter(order, min(.99, f / (SR / 2)), kind, output='sos')
    return signal.sosfilt(s, x, axis=0)


def norm(x, p=1.0):
    m = np.abs(x).max() if len(x) else 0
    return x / (m or 1) * p


def st(x):
    return x if x.ndim == 2 else np.stack([x, x], 1)


def fade(x, fi=.004, fo=.06):
    x = st(x).copy(); n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


def softclip(x, k=1.5):
    return np.tanh(x * k) / np.tanh(k)


def resample(x, r):
    if abs(r - 1) < 1e-3:
        return x
    n = int(len(x) / r); idx = np.arange(n) * r
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1)


def env_seg(t0, t1, t2, t3):
    """0 -> 1 between t0..t1, 1 until t2, -> 0 at t3 (on the video timeline)"""
    up = np.clip((tt - t0) / max(t1 - t0, 1e-4), 0, 1); dn = np.clip((t3 - tt) / max(t3 - t2, 1e-4), 0, 1)
    return np.minimum(up, dn)


def snap(t):
    return round(t * FPS) / FPS


# ---------------------------------------------------------------- synth support layer
def s_sub(dur=1.8, f0=70, f1=26):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / .22)
    return st(softclip(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur * .33)), 1.8))


def s_tinnitus(dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return st((np.sin(2 * np.pi * 6150 * t) + .45 * np.sin(2 * np.pi * 6230 * t)) * np.clip(t / .08, 0, 1) * np.clip((dur - t) / (dur * .7), 0, 1))


# ---------------------------------------------------------------- SFX library
SFX = {}
needed = {e['s'] for e in EV}
for name in sorted(needed):
    p = os.path.join(adir, 'sfx', name + '.wav')
    if os.path.exists(p):
        SFX[name] = norm(load(p))
    else:
        print('MISSING sfx file', name)
print('epidemic sfx loaded:', len(SFX))


def slices(x, thr_db=-30, min_gap=.06, min_len=.06, max_len=2.4):
    m = np.abs(x).max(1); e = signal.lfilter([1], [1, -.995], m) * .005
    on = e > 10 ** (thr_db / 20) * e.max(); outl, i, n, g = [], 0, len(on), int(min_gap * SR)
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or on[j:j + g].any()):
                j += 1
            if (j - i) / SR >= min_len:
                a = max(0, i - int(.004 * SR)); outl.append(fade(norm(x[a:min(j, a + int(max_len * SR))]), .002, .03))
            i = j
        else:
            i += 1
    return outl


def slices_peaks(x, max_len=1.6, min_dist=.28, rel=.22):
    """onset slicer for takes separated only by quiet reverb tails: cut at the envelope minimum before each strong peak"""
    m = np.abs(x).max(1)
    env = signal.lfilter([.02], [1, -.98], m)
    pk, _ = signal.find_peaks(env, height=rel * env.max(), distance=int(min_dist * SR))
    outl = []
    for k, p_ in enumerate(pk):
        lo = pk[k - 1] if k else 0
        a = lo + int(np.argmin(env[lo:p_])) if p_ > lo else p_
        a = max(a, p_ - int(.25 * SR))
        nxt = pk[k + 1] if k + 1 < len(pk) else len(x)
        b = nxt if k + 1 == len(pk) else lo_min(env, p_, nxt)
        b = min(b, a + int(max_len * SR))
        if (b - a) / SR > .05:
            outl.append(fade(norm(x[a:b]), .002, min(.08, (b - a) / SR / 4)))
    return outl


def lo_min(env, a, b):
    return a + int(np.argmin(env[a:b]))


# files that contain several separate takes -> one-shots, rotated.  name: (method, max_len)
VARIANT = {'clash_duel': ('gap', 2.4), 'clash_hits': ('gap', 2.4), 'clash_swordfight': ('peak', 1.4), 'clash_single': ('gap', 2.4),
           'blade_whoosh_impact': ('peak', 1.8), 'whoosh_tonal_var': ('gap', 2.6), 'punch_hard_var': ('gap', 1.0), 'glass_hits': ('gap', 2.4),
           'explosion_stone': ('gap', 4.0), 'woodblock': ('gap', .8), 'stones_shatter01': ('gap', 2.4), 'slash01': ('peak', 1.2),
           'slash02': ('peak', 1.0), 'shing_ring': ('gap', 3.0), 'whoosh_big01': ('half', 6.5), 'charge_shing': ('peak', 4.2),
           'powerup_anime': ('peak', 1.9), 'punch_body_var': ('gap', 1.0), 'kick_body_var': ('gap', 1.0), 'kick_double_var': ('gap', 1.2),
           'punch_swish_var01': ('gap', 1.0), 'sword_hits': ('gap', 1.6), 'sword_clashes': ('peak', 1.4), 'knife_impacts': ('gap', 1.0),
           'boom_sub_clean': ('peak', 3.5), 'bone_heavy': ('peak', 1.4), 'cards_riffle': ('half', 4.0), 'woodblock_tuned': ('gap', .9),
           'explosion_huge_var': ('gap', 5.0), 'glass_smash_x2': ('gap', 2.5), 'swish_double_var': ('gap', 1.0), 'swish_var01': ('gap', 1.0),
           'booms_sub_var': ('gap', 4.0), 'stab_bloody': ('peak', 1.6), 'tiger_roar': ('peak', 3.0), 'lion_roar': ('peak', 3.0),
           # new for this project
           'gun_shots_var': ('gap', 1.2), 'shell_drops': ('gap', 1.0), 'whoosh_tonal_scifi': ('gap', 1.6), 'whoosh_energy_var': ('gap', 1.6),
           'booms_sub_clean5': ('gap', 4.0), 'bone_heavy_breaks': ('gap', 1.5), 'mirror_break': ('peak', 3.0), 'bone_crack': ('peak', 1.6),
           # new for gowther-dazai-urahara
           'glitch_hit': ('gap', 1.2), 'clockwork_snap': ('gap', 1.6), 'porcelain_break': ('peak', 2.0), 'drum_barrel': ('peak', 1.4),
           # harry-vs-gojo
           'crowd_gasp': ('peak', 2.5), 'crowd_gasp2': ('peak', 2.5),
           # hulk-vs-yujiro
           'hulk_roar_var': ('peak', 2.2),
           # naruto-vs-luffy (cartoon kit etc.)
           'boing_var': ('gap', 1.6), 'cartoon_bonk_var': ('gap', 1.6), 'steam_hiss_var': ('gap', 2.2), 'cartoon_pops': ('peak', .35),
           'pop_various': ('gap', .6), 'taiko_multi': ('peak', 1.2),
           # itachi-vs-julius
           'raven_squawk': ('peak', 1.0), 'shuriken_throw': ('gap', .8), 'knife_parry': ('gap', 1.0), 'sword_clashes': ('peak', 1.4),
           'glass_hits': ('gap', 2.4)}
SL = {}
for k, (meth, ml) in VARIANT.items():
    if k in SFX:
        if meth == 'half':  # two long takes: split at the quietest point of the middle third
            xx = SFX[k]; env = signal.lfilter([.01], [1, -.99], np.abs(xx).max(1)); n3 = len(xx) // 3
            c = n3 + int(np.argmin(env[n3:2 * n3])); s = [fade(norm(xx[:c]), .002, .05), fade(norm(xx[c:]), .002, .05)]
        else:
            s = slices(SFX[k], max_len=ml) if meth == 'gap' else slices_peaks(SFX[k], max_len=ml, min_dist=min(1.0, ml * .4))
        if len(s) < 2 and meth == 'gap':
            s = slices_peaks(SFX[k], max_len=ml)
        if len(s) >= 2:
            SL[k] = s
print('sliced variation files:', {k: len(v) for k, v in SL.items()})
LONG = {'amb_night', 'cold_wind', 'drone_dark', 'heartbeat', 'cloth_flaps', 'insect_tone', 'snowstorm', 'tornado', 'footsteps', 'bells_shake',
        'blade_scrape', 'ice_crack_vlong', 'gas_release', 'wall_collapse', 'metal_groan', 'water_dam', 'rumble_quake', 'collapse_massive',
        'sizzle_dark', 'underwater', 'sand_slide', 'crowd_battlecry', 'air_blast', 'elec_crackle',
        'harbor_night', 'bubbles_cont', 'underwater_gurgle', 'clock_tick', 'vinyl_crackle', 'water_drip_cave', 'drone_dark_sub', 'gas_release',
        'rain_city', 'clockwork_small', 'music_box', 'rope_creak', 'sandals_walk', 'pulley_winch', 'tape_rewind_long', 'pen_scribble', 'wind_desert',
        # harry-vs-gojo beds
        'crowd_stadium_cheer', 'crowd_swell_quiet', 'crowd_charge_large', 'torch_ignite', 'space_drone', 'forcefield_tonal', 'forcefield_elec',
        'chains_rattle', 'dust_settle',
        # hulk-vs-yujiro beds
        'chew_meat', 'crowd_panic', 'crowd_shocked', 'heartbeat_100', 'earthquake_rumble', 'rumble_quake', 'muscle_creak', 'drone_growly',
        # naruto-vs-luffy beds
        'vortex_energy', 'shrill_high', 'elec_arc_loop', 'army_charging', 'fire_burnup', 'tornado',
        # itachi-vs-julius beds
        'rain_thunder_heavy', 'crow_flock_angry', 'raven_wings_flyby', 'clock_tick_slow', 'ghost_fire_long', 'evil_incant', 'sizzle_dark', 'tape_rewind'}
cnt, last = {}, {}


def get(name):
    if name in SL:  # rotate, never the same take twice in a row
        n = len(SL[name]); i = cnt.get(name, int(rng.integers(0, n)))
        if n > 1 and i % n == last.get(name, -1):
            i += 1
        cnt[name] = i + 1 + int(rng.integers(0, 2)); last[name] = i % n
        return SL[name][i % n]
    return SFX.get(name)


# ---------------------------------------------------------------- buses
PAD = SR * 8
dry = np.zeros((N + PAD, 2)); room = np.zeros_like(dry); hall = np.zeros_like(dry); subs = np.zeros_like(dry)
BIG = ('boom', 'explosion', 'braam', 'roar', 'subdrop', 'taiko', 'stinger', 'gong', 'collapse')


def place(x, t, gain=1., pan=0., send=.2, bus='room', rate=1., target=None):
    if x is None:
        return
    x = resample(st(x), rate); a = int(round(snap(t) * SR))
    if a < 0:
        x = x[-a:]; a = 0
    tgt = dry if target is None else target
    b = min(len(tgt), a + len(x))
    if b <= a:
        return
    th = (float(np.clip(pan, -1, 1)) + 1) * np.pi / 4
    seg = x[:b - a] * (np.array([np.cos(th), np.sin(th)]) * np.sqrt(2) * gain)
    tgt[a:b] += seg
    if target is None:
        (hall if bus == 'hall' else room)[a:b] += seg * send


for e in EV:
    nm, t, g, pan = e['s'], float(e['t']), float(e.get('g', .8)), float(e.get('pan', 0))
    x = get(nm)
    if x is None:
        continue
    if nm in LONG and 'start' not in e and len(x) / SR > 8 and 'dur' in e:   # random window of a long bed
        span = len(x) - int(e['dur'] * SR) - 1
        if span > 0:
            s0 = int(rng.integers(0, span)); x = x[s0:]
    elif 'start' in e:
        x = x[int(e['start'] * SR):]
    if 'dur' in e:
        n = int(e['dur'] * SR)
        if len(x) < n:
            x = np.tile(x, (int(np.ceil(n / len(x))), 1))
        x = x[:n]; d = n / SR; u = np.arange(n) / SR
        x = x * (np.clip(u / max(e.get('fi', .01), 1e-3), 0, 1) * np.clip((d - u) / max(e.get('fo', .3), 1e-3), 0, 1))[:, None]
    rate = float(e.get('rate', 1.))
    if e.get('peak'):  # loudest point of the file lands on t (risers / reverse swells)
        env = signal.lfilter([.002], [1, -.998], np.abs(x).max(1))
        t = t - int(np.argmax(env)) / SR / rate
    big = any(b in nm for b in BIG) and g >= .75
    place(x, t, g * .9, pan, .42 if big else .2, 'hall' if big else 'room', rate)

for t in AUTO.get('sub_drops', []):   # synthetic 70->26 Hz drop under the biggest hits (felt more than heard)
    place(s_sub(2.4), t, .55, 0, 0, target=subs)


# ---------------------------------------------------------------- reverbs
def make_ir(rt, n_sec, lp0=9000, lp1=1500, seed=0):
    n = int(n_sec * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed)
    ir = r.standard_normal((n, 2)) * np.exp(-6.9 * t / rt)[:, None]
    lo = filt(ir, 'lowpass', lp1); hi = filt(ir, 'lowpass', lp0); w = np.exp(-t / (rt * .25))[:, None]
    ir = hi * w + lo * (1 - w); ir[:int(.015 * SR)] *= np.linspace(0, 1, int(.015 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0)).max()


room_ir = make_ir(1.1, 2.0, seed=3); hall_ir = make_ir(3.6, 5.0, 7000, 900, seed=5)
wet = np.stack([signal.fftconvolve(room[:, c], room_ir[:, c])[:len(dry)] for c in range(2)], 1) * .42
wet += np.stack([signal.fftconvolve(hall[:, c], hall_ir[:, c])[:len(dry)] for c in range(2)], 1) * .5
sfxmix = (dry + wet + subs)[:N]

# sfx gain automation (absolute silence moments)
g_s = np.ones(N)
for t0, t1, t2, t3, gv in AUTO.get('sfx_gain', []):
    g_s = np.minimum(g_s, 1 - (1 - gv) * env_seg(t0, t1, t2, t3))
sfxmix *= g_s[:, None]

# ---------------------------------------------------------------- music edit (beats.json "edit")
music = np.zeros((N, 2)); TR = {}; TRG = {}
MUSIC_REF_DB = -17.0  # target gated RMS per music segment
for seg in BEATS['edit']:
    nm = seg.get('file', seg['track'])
    if nm not in TR:
        cand = [os.path.join(adir, 'music', nm + ext) for ext in ('.wav', '.mp3', '.m4a', '.flac')]
        p = next((c for c in cand if os.path.exists(c)), None)
        TR[nm] = load(p) if p else None
    x = TR[nm]
    if x is None:
        print('music missing', nm); continue
    v0, v1, off = seg['v0'], min(DUR, seg['v1']), seg['off']
    a, b = int(v0 * SR), int(v1 * SR); s0 = int((v0 - off) * SR)
    piece = x[max(0, s0):max(0, s0) + (b - a)]
    if len(piece) < b - a:
        piece = np.concatenate([piece, np.zeros((b - a - len(piece), 2))])
    # loudness match: ONE gain per track measured on the whole file (gated, high-passed RMS), so the Mozart dynamics survive
    if nm not in TRG:
        hp = filt(x, 'highpass', 100)
        blk = int(.4 * SR); rr = np.array([np.sqrt((hp[i:i + blk] ** 2).mean()) for i in range(0, len(hp) - blk, blk)])
        rr = rr[rr > np.percentile(rr, 30)]
        TRG[nm] = 20 * np.log10(np.sqrt((rr ** 2).mean()) + 1e-9)
    gdb = float(np.clip(MUSIC_REF_DB - TRG[nm], -12, 12)) + float(seg.get('trim_db', 0))
    piece = piece * 10 ** (gdb / 20)
    n = b - a; u = np.arange(n) / SR; d = n / SR
    e = np.sqrt(np.clip(u / max(seg['fi'], 1e-3), 0, 1)) * np.sqrt(np.clip((d - u) / max(seg['fo'], 1e-3), 0, 1))
    music[a:b] += piece * e[:, None]
    print(f"music {seg['track']:10s} video {v0:7.2f}-{v1:7.2f} <- track {v0 - off:7.2f}-{v1 - off:7.2f}  gain {gdb:+.1f} dB")

gm = np.ones(N)
for t0, t1, t2, t3, gv in AUTO.get('music_gain', []):
    gm = np.minimum(gm, 1 - (1 - gv) * env_seg(t0, t1, t2, t3))
for t0, t1, t2, t3, gv in AUTO.get('music_boost', []):   # gv > 1: lift a naturally quiet passage of a track (e.g. PUNCH intro riff)
    gm = gm * (1 + (gv - 1) * env_seg(t0, t1, t2, t3))
# sidechain: music dips up to ~3 dB under loud SFX
lv = np.sqrt(signal.lfilter([.004], [1, -.996], (sfxmix ** 2).mean(1)))
sc = np.clip(lv / (np.percentile(lv, 99.3) + 1e-9), 0, 1) * .35
# impact frames: music ducks ~7.5 dB for a moment so every impact series punches through, then recovers
dk = np.zeros(N)
for t in AUTO.get('impact_duck', []):
    dk = np.maximum(dk, .58 * env_seg(t - .04, t, t + .16, t + .85))
music = music * (gm * (1 - sc) * (1 - dk))[:, None]

# ---------------------------------------------------------------- master: lowpass automation (dome / underwater / paralysis), tinnitus
MUS_G, SFX_G = float(os.environ.get('MUS_G', 1.05)), .56   # ivj: denser SFX than nvl -> music +3.6 dB vs nvl (.69) to land at the same stem balance
mix = music * MUS_G + sfxmix * SFX_G
for t0, t1, t2, t3, fc in AUTO.get('lowpass', []):
    w = env_seg(t0, t1, t2, t3)
    a, b = max(0, int((t0 - .5) * SR)), min(N, int((t3 + .5) * SR))
    lp = filt(mix[a:b], 'lowpass', fc, 4)
    mix[a:b] = mix[a:b] * (1 - w[a:b, None]) + lp * w[a:b, None]
late = np.zeros((N, 2))
for t0, d, gv in AUTO.get('tinnitus_synth', []):
    y = s_tinnitus(d); a = int(t0 * SR); late[a:a + len(y)] += y[:max(0, min(len(y), N - a))] * gv
mix += late
mix *= np.clip((DUR - tt) / .05, 0, 1)[:, None]

if os.environ.get('MIX_STEMS'):
    for nm, arr in (('music', music * MUS_G), ('sfx', sfxmix * SFX_G)):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', out.replace('.wav', '_' + nm + '.wav')],
                       input=arr.astype(np.float32).tobytes(), check=True)

# gentle RMS compressor (no hard clipping: a flat clipped ceiling makes AAC overshoot by 1-2 dB on the dense BURST passages)
lvm = np.sqrt(signal.lfilter([.002], [1, -.998], (mix ** 2).mean(1)))
thr = np.percentile(lvm, 92) * .9
gr = np.where(lvm > thr, (thr / np.maximum(lvm, 1e-9)) ** (1 - 1 / 2.5), 1.)
gr = signal.lfilter([.01], [1, -.99], gr)
mix = mix * gr[:, None]
mix = filt(mix, 'lowpass', 16000, 4)   # AAC 160k drops > ~16 kHz anyway; removing it here keeps the encoder from smearing HF transients into overshoot
mix = mix / (np.abs(mix).max() or 1) * .9
from scipy.ndimage import minimum_filter1d, uniform_filter1d


def tp_limit(x, ceil_db, look=.008, hold=3):
    """lookahead true-peak limiter: 4x oversampled peak detection, min-filter (hold) + box smoothing -> smooth gain, no clipping"""
    up = signal.resample_poly(x, 4, 1, axis=0)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(x)]
    if len(pk) < len(x):
        pk = np.concatenate([pk, np.full(len(x) - len(pk), pk[-1])])
    c = 10 ** (ceil_db / 20)
    g = np.minimum(1., c / np.maximum(pk, 1e-9))
    L = int(look * SR)
    g = minimum_filter1d(g, L * hold, origin=0)
    g = uniform_filter1d(g, L)
    g = minimum_filter1d(g, L, origin=0)   # guarantee: never above the needed gain after smoothing
    return x * g[:, None]


def write(path, arr, fmt='pcm_f32le'):
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', fmt, path], input=arr.astype(np.float32).tobytes(), check=True)


def meas_arr(arr):
    rr = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                        input=arr.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    ii = float([l for l in rr.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    pk = float([l for l in rr.splitlines() if l.strip().startswith('Peak:')][-1].split()[1])
    return ii, pk


if RAW:
    write(out, mix); print('raw mix written', out); sys.exit(0)
# loudness: gain to -14 LUFS, true-peak limiter at -2.3 dBTP, re-measure, iterate (limiting lowers the loudness a little)
TGT_I, CEIL = -14.0, float(os.environ.get('TP_CEIL', -2.3))
y = mix
for it in range(4):
    ii, pk = meas_arr(y)
    y = tp_limit(y * 10 ** ((TGT_I - ii) / 20), CEIL)
    ii2, pk2 = meas_arr(y)
    print(f'loudness pass {it}: in {ii:.2f} LUFS -> {ii2:.2f} LUFS, TP {pk2:.2f} dBTP')
    if abs(ii2 - TGT_I) <= .05 and pk2 <= -2.0:
        break
write(out, y, 'pcm_s24le')


def meas(path):
    rr = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return rr


r = meas(out)
summ = [l.strip() for l in r.splitlines() if l.strip().startswith(('I:', 'Peak:', 'LRA:'))]
print('mix written', out, 'events', len(EV), '|', ' '.join(summ[-3:]))
