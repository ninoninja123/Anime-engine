#!/usr/bin/env python3
"""thumbnail_compose.py OUT.jpg IMG [IMG ...] --title 'TEXT' [--sub 'small text'] [--layout auto|split|grid|single] [--color FFD400] [--font PATH]
1280x720 thumbnail: 1 image = full frame, 2 = diagonal split (VS), 3-4 = grid; big title with thick black outline (stroke) + drop shadow.
Font: --font, else engine/fonts (Bangers for Latin; Dela Gothic One / IPAGothic for Japanese/Chinese), else DejaVu. CJK text auto-falls back.
IMG may be a video frame: 'video.mp4@12.5' grabs the frame at 12.5 s. Prints out path + size."""
import os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter
a = sys.argv[1:]
if len(a) < 2 or a[0] in ('-h', '--help'): print(__doc__); sys.exit(0)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
flags = {'--title', '--sub', '--layout', '--color', '--font'}; out = a[0]; imgs = []; i = 1
while i < len(a):
    if a[i] in flags: i += 2; continue
    imgs.append(a[i]); i += 1
W, H = 1280, 720; FD = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'engine', 'fonts'))
CJK = re.compile(r'[぀-ヿ㐀-鿿ｦ-ﾟ]')
def font(text, size):
    cand = [opt('--font', '')] + ([os.path.join(FD, 'DelaGothicOne-Regular.ttf'), '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', '/usr/share/fonts/truetype/fonts-japanese-gothic.ttf']
            if CJK.search(text) else [os.path.join(FD, 'Bangers-Regular.ttf')]) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']
    for c in cand:
        if c and os.path.exists(c): return ImageFont.truetype(c, size)
    return ImageFont.load_default()
def get(src):
    if '@' in src and not os.path.exists(src):
        v, t = src.rsplit('@', 1); p = tempfile.mktemp(suffix='.png')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', t, '-i', v, '-frames:v', '1', p], check=True); im = Image.open(p).convert('RGB'); os.remove(p); return im
    return Image.open(src).convert('RGB')
def cover(im, w, h):
    r = max(w / im.width, h / im.height); im = im.resize((int(im.width * r + 1), int(im.height * r + 1)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))
ims = [get(s) for s in imgs]; L = opt('--layout', 'auto'); L = {1: 'single', 2: 'split'}.get(len(ims), 'grid') if L == 'auto' else L
C = Image.new('RGB', (W, H))
if L == 'single': C.paste(cover(ims[0], W, H))
elif L == 'split':
    C.paste(cover(ims[0], W, H)); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(W * .56, 0), (W, 0), (W, H), (W * .44, H)], fill=255)
    C.paste(cover(ims[1], W, H), (0, 0), m); ImageDraw.Draw(C).line([(W * .56, 0), (W * .44, H)], fill=(255, 255, 255), width=10)
else:
    n = len(ims); cols = 2 if n <= 4 else 3; rows = (n + cols - 1) // cols; w, h = W // cols, H // rows
    for k, im in enumerate(ims): C.paste(cover(im, w, h), (k % cols * w, k // cols * h))
d = ImageDraw.Draw(C); col = '#' + opt('--color', 'FFD400')
def text(s, size, y, fill):
    f = font(s, size)
    while d.textlength(s, font=f) > W - 80 and size > 30: size -= 6; f = font(s, size)
    x = (W - d.textlength(s, font=f)) / 2; sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).text((x + 8, y + 8), s, font=f, fill=200, stroke_width=size // 9)
    C.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(6))); d.text((x, y), s, font=f, fill=fill, stroke_width=max(4, size // 11), stroke_fill='black')
t = opt('--title', '')
if t: text(t, 150, H - 210, col)
if opt('--sub', ''): text(opt('--sub', ''), 56, 28, 'white')
C.save(out, quality=90); print(out, os.path.getsize(out) // 1024, 'KB', L)
