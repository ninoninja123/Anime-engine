#!/usr/bin/env python3
"""voice_cut.py --dir audio [--lang ja|en] [--groups groups.json] [--lines lines.json] [--raw raw] [--out lines] [--model small] [--no-stt]
Cut TTS scene takes (raw/<KEY>_t<n>.mp3|wav; one take = several lines of one character) into per-line WAVs out/<ID>.wav.
groups.json: [{"key": "S1_DAZAI", "lines": [["L03", "text as sent to TTS"], ...]}]; lines.json: [{"id", "ja"|"en"|"text"}] (optional).
Whisper (faster-whisper, word timestamps) maps text to time; ja compares in hiragana (pykakasi), en in lowercase letters.
Cut = best silence gap (>=120 ms) nearest the word boundary. Only edges trimmed (pre 60 ms, post 150 ms, fades); inner silences
> 0.8 s shortened to 0.5 s. No tempo change, no compression, no normalisation. With several takes the per-line winner = text match
+ small energy bonus; force.json {line_id: take_prefix} overrides. --no-stt: gap-only split, no scoring (fast, no model).
Writes cut_report.json + lines_meta.json in --dir; prints only LOW-score lines (< 0.75) and a one-line total."""
import os, sys, json, re, glob, subprocess, difflib, numpy as np, soundfile as sf
from scipy.signal import resample_poly
a = sys.argv[1:]
if '-h' in a or '--help' in a: print(__doc__); sys.exit(0)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
A = opt('--dir', '.'); LANG = opt('--lang', 'ja'); SR = 48000; STT = '--no-stt' not in a
G = json.load(open(os.path.join(A, opt('--groups', 'groups.json'))))
LP = os.path.join(A, opt('--lines', 'lines.json')); LN = {l['id']: l for l in json.load(open(LP, encoding='utf8'))} if os.path.exists(LP) else {}
RAW, OUT = os.path.join(A, opt('--raw', 'raw')), os.path.join(A, opt('--out', 'lines'))
if LANG == 'ja':
    import pykakasi; KK = pykakasi.kakasi()
def norm(t):
    t = re.sub(r'\[[^\]]*\]', '', t)
    if LANG == 'ja': return re.sub(r'[^ぁ-ゟー]', '', ''.join(x['hira'] for x in KK.convert(t)))
    return re.sub(r'[^a-z0-9]', '', t.lower())
def sim(x, y): return difflib.SequenceMatcher(None, norm(x), norm(y), autojunk=False).ratio()
if STT:
    from faster_whisper import WhisperModel
    m = opt('--model', 'small'); WM = WhisperModel(m + ('.en' if LANG == 'en' and not m.endswith('.en') and m in ('base', 'small') else ''), device='cpu', compute_type='int8')
def tr(y, words=False):
    segs, _ = WM.transcribe(resample_poly(y, 1, 3).astype(np.float32), language=LANG, beam_size=3, word_timestamps=words, vad_filter=False); return list(segs)
def load(p):
    y = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(y, np.float32).astype(np.float64)
def env(y):
    fl = SR // 100; n = len(y) // fl; e = np.sqrt(np.mean(y[:n * fl].reshape(n, fl) ** 2, 1) + 1e-12); return 20 * np.log10(e / e.max())
def split(y, texts):
    act = env(y) > -42; on = np.where(act)[0]; i0, i1 = on[0], on[-1]
    if len(texts) == 1: return [(i0, i1 + 1)], True
    lw = {}
    if STT:
        hw = [(c, w.start, w.end) for sg in tr(y, True) for w in sg.words for c in norm(w.word)]
        ew, owner = [], []
        for k, t in enumerate(texts):
            for c in norm(t): ew.append(c); owner.append(k)
        for p, q, n in difflib.SequenceMatcher(None, ew, [h[0] for h in hw], autojunk=False).get_matching_blocks():
            for r in range(n): lw.setdefault(owner[p + r], []).append(hw[q + r])
    gaps, g0 = [], None
    for f in range(i0, i1 + 1):
        if not act[f] and g0 is None: g0 = f
        if act[f] and g0 is not None:
            if f - g0 >= 12: gaps.append((g0, f))
            g0 = None
    n = len(texts) - 1; ok = True; est = []
    tot = sum(len(norm(t)) or 1 for t in texts); cum = 0
    for k in range(n):
        cum += len(norm(texts[k])) or 1
        if k in lw and k + 1 in lw: est.append((max(w[2] for w in lw[k]) + min(w[1] for w in lw[k + 1])) * 100)
        else: est.append(i0 + (i1 - i0) * cum / tot); ok = ok and not STT
    if len(gaps) == n: chosen = gaps   # exactly one pause per boundary: trust the pauses
    else:
        chosen, lo = [], 0
        for k in range(n):
            cand = [(abs((p + q) / 2 - est[k]) - 0.5 * (q - p), j) for j, (p, q) in enumerate(gaps) if j >= lo and len(gaps) - j >= n - k]
            if not cand: ok = False; c = int(est[k]); chosen.append((c, c + 1)); continue
            j = min(cand)[1]; chosen.append(gaps[j]); lo = j + 1
    bounds, s = [], i0
    for p, q in chosen: bounds.append((s, max(p, s + 1))); s = q
    return bounds + [(s, i1 + 1)], ok
def squeeze(z):
    act = env(z) > -42; fl = SR // 100; out, last, f, n = [], 0, 0, len(act)
    while f < n:
        if not act[f]:
            g = f
            while g < n and not act[g]: g += 1
            if f > 0 and g < n and g - f > 80: out.append(z[last:(f + 25) * fl]); last = (g - 25) * fl
            f = g
        else: f += 1
    return np.concatenate(out + [z[last:]])
def piece(y, p, q):
    fl = SR // 100; z = squeeze(y[max(0, p * fl - int(.06 * SR)):min(len(y), q * fl + int(.15 * SR))].copy())
    f0, f1 = int(.005 * SR), int(.03 * SR); z[:f0] *= np.linspace(0, 1, f0); z[-f1:] *= np.linspace(1, 0, f1); return z
FP = os.path.join(A, 'force.json'); FORCE = json.load(open(FP)) if os.path.exists(FP) else {}
best, rep = {}, []
for g in G:
    ids = [x[0] for x in g['lines']]; ptxt = {x[0]: x[1] for x in g['lines']}
    takes = sorted(glob.glob(os.path.join(RAW, g['key'] + '_t*.*')))
    if not takes: print('no takes for', g['key']); continue
    for tp in takes:
        y = load(tp); bounds, ok = split(y, [ptxt[i] for i in ids])
        for lid, (p, q) in zip(ids, bounds):
            z = piece(y, p, q); ref = LN.get(lid, {}); hyp = ''.join(s.text for s in tr(z)) if STT else ''
            sc = max(sim(hyp, ptxt[lid]), sim(hyp, ref.get(LANG) or ref.get('text') or ptxt[lid])) if STT else 1.0
            rms = float(np.sqrt(np.mean(z ** 2))); r = dict(id=lid, take=os.path.basename(tp), score=round(sc, 2), dur=round(len(z) / SR, 2), heard=hyp, gaps_ok=ok, rms=round(rms, 4)); rep.append(r)
            qv = sc + 0.5 * min(rms, 0.2) + (10 if os.path.basename(tp).startswith(FORCE.get(lid, '#')) else 0)
            if lid not in best or qv > best[lid][0]: best[lid] = (qv, z, r)
os.makedirs(OUT, exist_ok=True); M = {}
for lid, (qv, z, r) in best.items(): sf.write(os.path.join(OUT, lid + '.wav'), z.astype(np.float32), SR, subtype='PCM_24'); M[lid] = r
json.dump(M, open(os.path.join(A, 'lines_meta.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(rep, open(os.path.join(A, 'cut_report.json'), 'w'), ensure_ascii=False, indent=0)
low = [r for r in M.values() if r['score'] < 0.75]
for r in low: print('LOW', r['id'], r['score'], r['dur'], r['heard'][:60])
print('lines', len(M), '| low', len(low), '| speech s', round(sum(r['dur'] for r in M.values()), 1), '| gaps_ok', sum(r['gaps_ok'] for r in M.values()))
