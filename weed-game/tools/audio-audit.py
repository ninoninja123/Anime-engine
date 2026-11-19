#!/usr/bin/env python3
"""Audio audit: measures every file in public/audio/** with ffmpeg (EBU R128 + astats).

Usage:  python3 tools/audio-audit.py [AUDIO_DIR]
  AUDIO_DIR defaults to ../public/audio relative to this script; when that folder is missing (git worktree,
  audio is gitignored) the main checkout /home/user/Anime-engine/weed-game/public/audio is tried.

Writes:
  docs/weed-game/audio-audit.md       human report (problems, suggested gain per file)
  src/data/audio_levels.js            { file: [lufs, peakDb, durationS, cat] } for ?soundtest (small, committed)

Measures per file: integrated loudness (LUFS, I), max momentary loudness (M max, 400 ms window: the honest number for
short transients where I is gated away), true peak (dBTP), RMS (dBFS), duration, clipping (samples at |x| >= 0.999).
Categories: music (mus_*), voice (voice/*), ambience (sfx2_amb_*, sfx_ambience, boss_drone), sfx (the rest).
Targets (the in-game mixing policy, see src/audio.js MIX):
  music    -18 .. -20 LUFS integrated
  voice    -14 .. -16 LUFS integrated
  ambience -24 .. -28 LUFS integrated (a bed under everything)
  sfx      -16 .. -12 LUFS momentary max (impacts at the loud end, UI/foley at the quiet end)
The suggested gain is (target centre - measured) dB, clamped to +-12 dB; as a linear factor it can go straight into
sfx_map.js `vol` or audio.js MUSIC_VOL. Files are NOT modified.
"""
import json, os, re, subprocess, sys, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
REPO = os.path.dirname(GAME)


def audio_dir():
    if len(sys.argv) > 1:
        return sys.argv[1]
    local = os.path.join(GAME, 'public', 'audio')
    if os.path.isdir(local) and any(f.endswith('.mp3') for f in os.listdir(local)):
        return local
    return '/home/user/Anime-engine/weed-game/public/audio'


def category(rel):
    b = os.path.basename(rel)
    if rel.startswith('voice/'):
        return 'voice'
    if b.startswith('mus_'):
        return 'music'
    if b.startswith('sfx2_amb_') or b in ('sfx_ambience.mp3', 'sfx2_boss_drone.mp3', 'sfx2_heli.mp3'):
        return 'ambience'
    return 'sfx'


TARGET = {'music': (-20, -18), 'voice': (-16, -14), 'ambience': (-28, -24), 'sfx': (-16, -12)}
# sub-targets for sfx by role (momentary max): impacts loud, foley/ui quiet
SFX_ROLE = [
    (re.compile(r'step_|fur|scuff|pant|breath|ui_|tick|card_ready|crow|dust|wade|claw'), (-24, -18), 'foley/ui'),
    (re.compile(r'hit_heavy|crit|sonic_boom|boss_land|quake|rock_crash|rockslide|cine_boom|braam|bite_flesh_deep|thud_deep|shockwave|battoga|splash|roar'), (-14, -10), 'impact'),
]


def target_for(rel, cat):
    if cat != 'sfx':
        return TARGET[cat], cat
    b = os.path.basename(rel)
    for rx, t, name in SFX_ROLE:
        if rx.search(b):
            return t, name
    return TARGET['sfx'], 'sfx'


def probe_dur(path):
    p = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    try:
        return float(p.stdout.strip())
    except ValueError:
        return 0.0


def measure(path):
    d = probe_dur(path)
    # momentary loudness needs a 400 ms window: loop very short one-shots so the window is filled with the sound itself
    loop = ['-stream_loop', str(max(1, int(1.2 / max(d, 0.05))))] if 0 < d < 0.6 else []
    cmd = ['ffmpeg', '-hide_banner', '-nostats', '-v', 'verbose', *loop, '-i', path, '-af',
           'astats=measure_perchannel=none,ebur128=peak=true:framelog=verbose', '-f', 'null', '-']
    p = subprocess.run(cmd, capture_output=True, text=True, errors='replace')
    err = p.stderr
    out = {}
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    out['dur'] = d or (int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else 0.0)
    def num(rx, default=None):
        mm = re.findall(rx, err)
        return float(mm[-1]) if mm else default
    out['I'] = num(r'I:\s+(-?[\d.]+) LUFS', -70.0)
    out['LRA'] = num(r'LRA:\s+(-?[\d.]+) LU', 0.0)
    out['tp'] = num(r'Peak:\s+(-?[\d.]+) dBFS', -99.0)
    out['rms'] = num(r'RMS level dB: (-?[\d.]+)', -99.0)
    out['peak'] = num(r'Peak level dB: (-?[\d.]+)', -99.0)
    ms = [float(x) for x in re.findall(r' M:\s*(-?[\d.]+)', err) if float(x) > -100]
    out['Mmax'] = max(ms) if ms else out['I']
    mx = num(r'Max level: (-?[\d.]+)', 0.0)
    mn = num(r'Min level: (-?[\d.]+)', 0.0)
    out['clip'] = max(abs(mx or 0), abs(mn or 0)) >= 0.999
    return out


def main():
    root = audio_dir()
    files = []
    for dp, _, fs in os.walk(root):
        for f in fs:
            if f.lower().endswith(('.mp3', '.wav', '.ogg', '.m4a')):
                files.append(os.path.relpath(os.path.join(dp, f), root).replace(os.sep, '/'))
    files.sort()
    print(f'measuring {len(files)} files in {root}', file=sys.stderr)
    with cf.ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        res = dict(zip(files, ex.map(lambda r: measure(os.path.join(root, r)), files)))

    rows = []
    for rel in files:
        r = res[rel]
        cat = category(rel)
        (lo, hi), role = target_for(rel, cat)
        # loudness used for the policy: integrated for long material, momentary max for short sfx
        metric = r['I'] if cat in ('music', 'voice', 'ambience') else r['Mmax']
        if metric <= -69:
            metric = r['Mmax']
        centre = (lo + hi) / 2
        gain = max(-12.0, min(12.0, centre - metric))
        status = 'ok'
        if metric > hi + 1: status = 'loud'
        elif metric < lo - 1: status = 'quiet'
        if r['clip'] or r['tp'] > -0.1: status += ' CLIP'
        rows.append(dict(file=rel, cat=cat, role=role, metric=metric, lo=lo, hi=hi, gain=gain, status=status, **r))

    # ---- js data for ?soundtest
    js = os.path.join(GAME, 'src', 'data', 'audio_levels.js')
    data = {r['file']: [round(r['metric'], 1), round(r['tp'], 1), round(r['dur'], 2), r['cat']] for r in rows}
    with open(js, 'w') as f:
        f.write('// GENERATED by tools/audio-audit.py – do not edit. file -> [loudness LUFS (I for music/voice/amb, M max for sfx), true peak dBTP, duration s, category]\n')
        f.write('export const AUDIO_LEVELS = ' + json.dumps(data, separators=(',', ':')) + ';\n')

    # ---- markdown report
    md = os.path.join(REPO, 'docs', 'weed-game', 'audio-audit.md')
    by = {}
    for r in rows: by.setdefault(r['cat'], []).append(r)
    L = []
    L.append('# Audio audit (weed-game/public/audio)\n')
    L.append('Generated by `weed-game/tools/audio-audit.py` (ffmpeg EBU R128 + astats). Re-run after adding audio:\n'
             '`python3 weed-game/tools/audio-audit.py`. Files are not modified; the in-game mix compensates with per-category\n'
             'bus gains and per-sound `vol` (see "Mixing policy" below and `src/audio.js` `MIX`).\n')
    L.append('Loudness column: **integrated LUFS** for music / voice / ambience, **momentary max (400 ms) LUFS** for sfx '
             '(integrated loudness of a 0.3 s transient is meaningless). TP = true peak dBTP. Gain = suggested correction (dB) '
             'to reach the centre of the target range; factor = 10^(gain/20).\n')
    L.append('## Summary\n')
    L.append('| Category | Files | Target | Median | Min | Max | Too quiet | Too loud | Clipping | Total duration |')
    L.append('|---|---|---|---|---|---|---|---|---|---|')
    for cat in ('music', 'voice', 'ambience', 'sfx'):
        rs = by.get(cat, [])
        if not rs: continue
        ms = sorted(r['metric'] for r in rs)
        med = ms[len(ms) // 2]
        lo, hi = TARGET[cat]
        q = sum('quiet' in r['status'] for r in rs); l = sum('loud' in r['status'] for r in rs); c = sum('CLIP' in r['status'] for r in rs)
        L.append(f'| {cat} | {len(rs)} | {lo}..{hi} | {med:.1f} | {ms[0]:.1f} | {ms[-1]:.1f} | {q} | {l} | {c} | {sum(r["dur"] for r in rs)/60:.1f} min |')
    L.append('')
    # findings
    L.append('## Findings\n')
    mus = by.get('music', [])
    if mus:
        L.append('- **Music**: ' + ', '.join(f'`{r["file"]}` {r["metric"]:.1f}' for r in mus) + ' LUFS. '
                 'The tracks are mastered loud (typical streaming masters around -9..-14 LUFS); without compensation they sit '
                 '4-8 dB above the speech, which is why the narrator was buried. The game now applies per-track trim '
                 '(`MUSIC_TRIM` in audio.js, from this table) so every track plays at ~-19 LUFS before the user Music slider.')
    vo = by.get('voice', [])
    if vo:
        ms = sorted(r['metric'] for r in vo)
        L.append(f'- **Voice**: {len(vo)} lines, {ms[0]:.1f}..{ms[-1]:.1f} LUFS (median {ms[len(ms)//2]:.1f}). '
                 'Lines are generated per character, so levels differ by voice; the voice bus has a compressor that evens '
                 'them out and the narrator gets extra gain + deeper ducking.')
        quiet = [r for r in vo if r['metric'] < -22]
        if quiet:
            L.append('  - Quietest lines (< -22 LUFS): ' + ', '.join(f'`{r["file"]}` {r["metric"]:.1f}' for r in sorted(quiet, key=lambda r: r['metric'])[:12]))
    sf = by.get('sfx', [])
    if sf:
        loud = sorted([r for r in sf if 'loud' in r['status']], key=lambda r: -r['metric'])[:15]
        quiet = sorted([r for r in sf if 'quiet' in r['status']], key=lambda r: r['metric'])[:15]
        if loud: L.append('- **Loudest sfx vs role target**: ' + ', '.join(f'`{r["file"]}` {r["metric"]:.1f} ({r["role"]})' for r in loud))
        if quiet: L.append('- **Quietest sfx vs role target**: ' + ', '.join(f'`{r["file"]}` {r["metric"]:.1f} ({r["role"]})' for r in quiet))
    clip = [r for r in rows if 'CLIP' in r['status']]
    L.append(f'- **Clipping / true peak above -0.1 dBTP**: {len(clip)} files' + (': ' + ', '.join(f'`{r["file"]}` ({r["tp"]:.1f})' for r in clip[:25]) if clip else '.')
             + (' The master limiter (DynamicsCompressorNode) catches inter-sample overs when several of these stack.' if clip else ''))
    longsfx = sorted([r for r in sf if r['dur'] > 6], key=lambda r: -r['dur'])
    if longsfx:
        L.append('- **Long sfx (> 6 s, memory when decoded)**: ' + ', '.join(f'`{r["file"]}` {r["dur"]:.1f} s' for r in longsfx[:12]))
    L.append('')
    L.append('## Mixing policy (implemented in src/audio.js)\n')
    L.append('- Buses: music (per-track trim → duck → Music slider), ambience (duck → Music slider × 0.9), sfx categories '
             '(move / combat / boss / env / cine) → Effects slider, ui → Effects slider, voice (compressor → Voice slider). '
             'All buses → master limiter (DynamicsCompressorNode, threshold -6 dB, ratio 20, fast attack) → output.')
    L.append('- Targets: music -18..-20 LUFS, voice -14..-16 LUFS, sfx -16..-12 LUFS momentary (impacts loudest, foley/UI '
             'quietest), ambience -24..-28 LUFS.')
    L.append('- Ducking groups: speech ducks music to 0.32 (characters) / 0.16 (narrator) and ambience to 0.55 / 0.4; big '
             'impacts (events with `duck` in sfx_map.js) duck music and, if marked `ambDuck`, ambience. Kaibutsu roars duck less (0.55).')
    L.append('')
    for cat in ('music', 'voice', 'ambience', 'sfx'):
        rs = by.get(cat, [])
        if not rs: continue
        L.append(f'## {cat} ({len(rs)})\n')
        L.append('| File | Role | Loudness | Target | TP dBTP | RMS dB | Dur s | Status | Gain dB | Factor |')
        L.append('|---|---|---|---|---|---|---|---|---|---|')
        for r in rs:
            L.append(f'| `{r["file"]}` | {r["role"]} | {r["metric"]:.1f} | {r["lo"]}..{r["hi"]} | {r["tp"]:.1f} | {r["rms"]:.1f} | '
                     f'{r["dur"]:.2f} | {r["status"]} | {r["gain"]:+.1f} | {10 ** (r["gain"] / 20):.2f} |')
        L.append('')
    with open(md, 'w') as f:
        f.write('\n'.join(L) + '\n')
    print(f'wrote {md} and {js}', file=sys.stderr)


if __name__ == '__main__':
    main()
