#!/usr/bin/env python3
"""subs_from_timing.py TIMING.json [--text lines.json] [--out subs.ass] [--names] [--marginv 60] [--size 34] [--maxchars 44]
                      [--lang en|ja] [--lines-dir lines] [--trim-lead 0] [--trim-tail 0] [--colors '{"DAZAI":"9FD8FF"}'] [--video in.mp4]
Burned subtitles (ASS, 1280x720) from line timings. Each line shows EXACTLY while its voice sounds: start..start+dur
(no +0.15 s tail; --trim-lead/--trim-tail cut the silence padding of cut voice files, e.g. 0.06/0.15).
Never more than TWO text rows: long text is split into consecutive events (time split by characters). Speaker name (--names)
goes inline in colour ("DAZAI: ...") so it never adds a third row. MarginV >= 55 keeps both rows inside the frame.
Overlaps are resolved (a line ends when the next starts). JA text uses a CJK font (IPAGothic/Dela Gothic One).
TIMING: list or {"lines":[...]} with id, start, dur|end (else read from --lines-dir/<id>.wav), optional who/text/en/ja. --text: lines.json [{id, who, en|ja|text}] fills text/who.
Prints event count and the burn-in ffmpeg command (with --video)."""
import json, os, re, sys, zlib
a = sys.argv[1:]
if not a or a[0] in ('-h', '--help'): print(__doc__); sys.exit(0)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
T = json.load(open(a[0])); T = T['lines'] if isinstance(T, dict) else T
LANG = opt('--lang', 'en'); OUT = opt('--out', 'subs.ass'); MV = max(55, int(opt('--marginv', 60))); FS = int(opt('--size', 34))
MAXC = int(opt('--maxchars', 44 if LANG == 'en' else 22)); TL, TT = float(opt('--trim-lead', 0)), float(opt('--trim-tail', 0))
COL = json.loads(opt('--colors', '{}')); X = {}
if '--text' in a:
    for l in json.load(open(opt('--text', ''), encoding='utf8')): X[l['id']] = l
def txt(l):
    s = {**X.get(l.get('id'), {}), **{k: v for k, v in l.items() if v not in (None, '')}}
    t = s.get(LANG) or s.get('text') or s.get('en') or s.get('ja') or ''
    return re.sub(r'\[[^\]]*\]', '', t).replace(' / ', ' ').strip(), s.get('who', '')
def wrap(t, M=None):  # -> list of rows, each <= M chars; 2-row results are balanced
    MAXC_ = M or MAXC
    if M is None:
        r = wrap(t, MAXC)
        if len(r) == 2:
            b = wrap(t, len(t) // 2 + 6)
            if len(b) == 2: return b
        return r
    if LANG == 'ja' or ' ' not in t: return [t[i:i + MAXC_] for i in range(0, len(t), MAXC_)]
    rows, cur = [], ''
    for w in t.split():
        if cur and len(cur) + 1 + len(w) > MAXC_: rows.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return rows + ([cur] if cur else [])
def color(w):
    c = COL.get(w) or '%02X%02X%02X' % tuple(150 + (zlib.crc32(w.encode()) >> s & 0x69) for s in (0, 8, 16)); return c[4:6] + c[2:4] + c[0:2]
ts = lambda s: '%d:%02d:%05.2f' % (s // 3600, s % 3600 // 60, s % 60)
L = sorted([l for l in T if 'start' in l], key=lambda l: l['start']); ev = []
for i, l in enumerate(L):
    t, who = txt(l)
    if not t: continue
    if 'end' not in l and 'dur' not in l:   # duration from the cut voice file
        import soundfile as sf; w = os.path.join(opt('--lines-dir', 'lines'), l['id'] + '.wav'); l['dur'] = sf.info(w).duration if os.path.exists(w) else 2.0
    s = l['start'] + TL; e = (l['end'] if 'end' in l else l['start'] + l['dur']) - TT
    if i + 1 < len(L): e = min(e, L[i + 1]['start'] + TL - 0.02)
    if e - s < 0.3: e = s + 0.3
    nm = (who.title() + ':') if ('--names' in a and who) else ''
    rows = wrap((nm + ' ' + t).strip()); chunks = [rows[k:k + 2] for k in range(0, len(rows), 2)]; n = sum(len(' '.join(c)) for c in chunks); t0 = s
    for j, c in enumerate(chunks):
        t1 = e if j == len(chunks) - 1 else t0 + (e - s) * len(' '.join(c)) / n
        body = '\\N'.join(c)
        if nm and j == 0: body = '{\\c&H%s&\\b1}%s{\\r}' % (color(who), nm) + body[len(nm):]
        ev.append('Dialogue: 0,%s,%s,D,,0,0,0,,%s' % (ts(t0), ts(t1), body)); t0 = t1
font = 'IPAGothic' if LANG == 'ja' else 'DejaVu Sans'
hdr = ('[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: 720\nWrapStyle: 2\n\n[V4+ Styles]\n'
       'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n'
       'Style: D,%s,%d,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,70,70,%d,1\n\n[Events]\n'
       'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n') % (font, FS, MV)
open(OUT, 'w', encoding='utf8').write(hdr + '\n'.join(ev) + '\n')
print('%d events -> %s (font %s, MarginV %d, max 2 rows x %d chars)' % (len(ev), OUT, font, MV, MAXC))
if '--video' in a:
    fd = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'engine', 'fonts'))
    print("burn: ffmpeg -i %s -vf \"ass=%s:fontsdir=%s\" -c:v libx264 -crf 18 -tune animation -c:a copy out_subbed.mp4" % (opt('--video', ''), OUT, fd))
