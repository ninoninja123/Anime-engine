#!/usr/bin/env python3
"""twist_coverage.py VIDEO TIMELINE.json [--tags REGEX] [--frac 0.6] [--at 'T1=139.1,clue=40'] [--offsets -0.4,0,0.4] [--w 320] [--cols 4] [--out twists.jpg]
ONE review sheet of the moments that matter (twists, clues, signature abilities) instead of many full contact sheets.
Picks times from: timeline "twists" [{id,t}] (default), or shots whose tag matches --tags (t = t0 + frac*(t1-t0)), or --at label=sec.
--offsets adds frames around each time (e.g. clue setup -> payoff). Max 16 tiles per sheet (extra sheets _2, _3...). Prints label->time list."""
import json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw
a = sys.argv[1:]
if len(a) < 2 or a[0] in ('-h', '--help'): print(__doc__); sys.exit(0)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
V, TL = a[0], json.load(open(a[1])); W, C = int(opt('--w', 320)), int(opt('--cols', 4)); OUT = opt('--out', 'twists.jpg')
OFF = [float(x) for x in opt('--offsets', '0').split(',')]; FR = float(opt('--frac', 0.6)); items = []
if '--at' in a: items = [(k, float(v)) for k, v in (x.split('=') for x in opt('--at', '').split(','))]
elif '--tags' in a:
    rx = re.compile(opt('--tags', '.')); fps = TL.get('fps', 24)
    for s in TL.get('shots', []):
        t = s.get('tag') or ''
        for tag in (t if isinstance(t, list) else [t]):
            if tag and rx.search(tag):
                t0, t1 = (s['t0'], s['t1']) if 't0' in s else (s['f24'][0] / fps, s['f24'][1] / fps); items.append((tag, t0 + FR * (t1 - t0)))
else: items = [(x.get('id', '?'), float(x['t'])) for x in TL.get('twists', [])]
if not items: print('no items (use --tags or --at)'); sys.exit(1)
shots = [(f'{lab}{"" if o == 0 else "%+.1f" % o}', max(0, t + o)) for lab, t in items for o in OFF]
tmp = tempfile.mkdtemp(); tiles = []
for i, (lab, t) in enumerate(shots):
    p = os.path.join(tmp, '%03d.jpg' % i)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', '%.3f' % t, '-i', V, '-frames:v', '1', '-vf', f'scale={W}:-2', '-q:v', '4', p])
    if os.path.exists(p): tiles.append((lab, t, Image.open(p).convert('RGB')))
if not tiles: print('no frames extracted (times beyond the video?)'); sys.exit(1)
for k in range(0, len(tiles), 16):
    part = tiles[k:k + 16]; h = part[0][2].height; rows = (len(part) + C - 1) // C
    S = Image.new('RGB', (C * W, rows * h), (16, 16, 16)); d = ImageDraw.Draw(S)
    for j, (lab, t, im) in enumerate(part):
        x, y = j % C * W, j // C * h; S.paste(im, (x, y)); s = f'{lab} {t:.1f}s'; d.rectangle([x, y, x + 7 * len(s) + 6, y + 14], fill=(0, 0, 0)); d.text((x + 3, y + 2), s, fill=(255, 230, 0))
    o = OUT if k == 0 else OUT.replace('.jpg', f'_{k // 16 + 1}.jpg'); S.save(o, quality=82); print(o, len(part), 'tiles')
for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
os.rmdir(tmp); print('; '.join(f'{l}={t:.2f}' for l, t, _ in tiles))
