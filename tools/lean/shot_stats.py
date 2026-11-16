#!/usr/bin/env python3
"""shot_stats.py SHOTS [--fps 24] [--unit auto|frames|s] [--key shots]  -> one small JSON summary (pacing from data, no images).
SHOTS = .json (list, or object with "shots") or .js module (module.exports = {shots} / [..], loaded with node).
Shot length from: dur (frames or s), t0/t1 (s), f24/f [a,b] (frames). Effects counted anywhere inside a shot:
keys or "type"/"fx" values matching shake|impact|smear|flash|burst|invert (arrays count their elements).
Output: n, total_s, shots_per_min, median/mean/min/max/p10/p90 s, histogram, pct_le_2s, shortest/longest ids, effects per min, tags."""
import json, os, re, subprocess, sys, statistics as st
a = sys.argv[1:]
if not a or a[0] in ('-h', '--help'): print(__doc__); sys.exit(0)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
P, FPS, UNIT, KEY = a[0], float(opt('--fps', 24)), opt('--unit', 'auto'), opt('--key', 'shots')
if P.endswith(('.js', '.cjs', '.mjs')):
    js = "const m=require(%s);process.stdout.write(JSON.stringify(Array.isArray(m)?m:(m[%s]||m.default||m)))" % (json.dumps(os.path.abspath(P)), json.dumps(KEY))
    D = json.loads(subprocess.check_output(['node', '-e', js], cwd=os.path.dirname(os.path.abspath(P))))
else: D = json.load(open(P))
S = D if isinstance(D, list) else D.get(KEY) or D.get('beats') or []
if isinstance(S, dict): S = list(S.values())
def length(s):
    if 't0' in s and 't1' in s: return float(s['t1']) - float(s['t0']), 's'
    for k in ('f24', 'f', 'frames'):
        v = s.get(k)
        if isinstance(v, list) and len(v) == 2: return (v[1] - v[0]) / FPS, 's'
    for k in ('dur', 'len', 'duration'):
        if k in s: return float(s[k]), 'raw'
    return None, None
raw = [length(s) for s in S]
rv = [v for v, u in raw if u == 'raw']
fr = UNIT == 'frames' or (UNIT == 'auto' and rv and all(float(v).is_integer() for v in rv) and st.median(rv) > 6)
L = [(s.get('id', str(i)), (v / FPS if (u == 'raw' and fr) else v)) for i, (s, (v, u)) in enumerate(zip(S, raw)) if v is not None]
if not L: print(json.dumps({'error': 'no shot lengths found', 'keys_of_first': list(S[0].keys()) if S else []})); sys.exit(1)
d = sorted(x[1] for x in L); T = sum(d); q = lambda p: d[min(len(d) - 1, int(p * len(d)))]
H = {'<0.5': 0, '0.5-1': 0, '1-2': 0, '2-3': 0, '3-5': 0, '>5': 0}
for x in d: H['<0.5' if x < .5 else '0.5-1' if x < 1 else '1-2' if x < 2 else '2-3' if x < 3 else '3-5' if x < 5 else '>5'] += 1
EF = re.compile(r'shake|impact|smear|flash|burst|invert', re.I); fx = {}
def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            m = EF.search(k)
            if m and v not in (None, False, 0, [], {}): n = m.group(0).lower(); fx[n] = fx.get(n, 0) + (len(v) if isinstance(v, list) else 1)
            if k in ('type', 'fx', 'kind', 'e') and isinstance(v, str) and EF.search(v): n = EF.search(v).group(0).lower(); fx[n] = fx.get(n, 0) + 1
            walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
for s in S: walk(s)
tags = {}
for s in S:
    t = s.get('tag') or s.get('tags')
    for x in (t if isinstance(t, list) else [t] if t else []): tags[x] = tags.get(x, 0) + 1
pm = 60 / T if T else 0; srt = sorted(L, key=lambda x: x[1])
out = dict(file=os.path.basename(P), n=len(d), total_s=round(T, 2), unit='frames' if fr else 's', shots_per_min=round(len(d) * pm, 1),
           median_s=round(st.median(d), 2), mean_s=round(T / len(d), 2), min_s=round(d[0], 2), max_s=round(d[-1], 2), p10_s=round(q(.1), 2), p90_s=round(q(.9), 2),
           pct_le_2s=round(100 * sum(x <= 2 for x in d) / len(d)), hist=H, shortest=[f'{i}:{v:.2f}' for i, v in srt[:5]], longest=[f'{i}:{v:.2f}' for i, v in srt[-5:]],
           fx_per_min={k: round(v * pm, 1) for k, v in sorted(fx.items())}, fx_total=fx, tags=(dict(n=len(tags), first=list(tags)[:12]) if tags else None))
print(json.dumps(out, ensure_ascii=False))
