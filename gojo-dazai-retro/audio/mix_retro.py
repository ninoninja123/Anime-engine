#!/usr/bin/env python3
"""gojo-dazai-retro mix: music (Epidemic 'Bounty Hunter', offset 110.5 s) + layered short SFX (each <= 1.95 s) + 2 ElevenLabs lines.
usage: python3 mix_retro.py AUDIO_DIR OUT.wav     (AUDIO_DIR holds the downloaded mp3/wav files; not in the repo)"""
import subprocess, sys
D, OUT = sys.argv[1], sys.argv[2]
DUR = 10.0
# (time s, file, gain dB, max len s, extra filter)
EV = [
    (0.00, 'projector.mp3', -22, 1.9, ''), (8.10, 'projector.mp3', -22, 1.9, ''),
    (1.95, 'gojo.wav', 1, 1.9, ''),
    (2.00, 'cloth.mp3', -9, 1.2, ''), (2.30, 'shimmer.mp3', -9, 1.5, ''), (2.32, 'pulse.mp3', -8, 1.4, ''),
    (3.00, 'hum.mp3', -7, 1.85, ''), (3.55, 'pulse.mp3', -12, 1.2, 'asetrate=48000*0.8,aresample=48000'),
    (4.03, 'swish.mp3', -6, .4, ''), (4.06, 'boom.mp3', -3, 1.9, ''), (4.06, 'punch.mp3', -6, 1.5, ''),
    (4.90, 'flyby.mp3', -7, 1.0, ''), (5.30, 'cloth.mp3', -11, 1.0, ''),
    (5.40, 'bighit.mp3', 0, 1.9, ''), (5.42, 'boom.mp3', -4, 1.9, 'asetrate=48000*0.85,aresample=48000'), (5.45, 'glassmagic.mp3', -5, 1.9, ''),
    (6.40, 'shimmer.mp3', -16, 1.2, 'areverse'),
    (7.45, 'swish.mp3', -6, .4, ''), (7.50, 'flyby.mp3', -8, 1.0, ''),
    (7.80, 'glass.mp3', -3, 1.45, ''), (7.80, 'pulse.mp3', -6, 1.4, ''), (7.80, 'punch.mp3', -10, 1.2, ''),
    (7.62, 'dazai.wav', 1, 2.5, 'atempo=1.08'),
]
inp, fl, labels = [], [], []
for i, (t, f, g, L, x) in enumerate(EV):
    inp += ['-i', f'{D}/{f}']
    chain = f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,' + (x + ',' if x else '') + f'atrim=0:{L},afade=t=out:st={max(0, L - .15):.3f}:d=0.15,volume={g}dB,adelay={int(t * 1000)}|{int(t * 1000)}[e{i}]'
    fl.append(chain); labels.append(f'[e{i}]')
m = len(EV); inp += ['-ss', '110.5', '-t', str(DUR), '-i', f'{D}/music.mp3']
# music: -8 dB bed, ducked under the two lines (~4 dB), hard drop-out at the nullify hit (5.40-5.75), fade in/out
vol = "volume='-8dB',volume='if(between(t,1.9,3.0)+between(t,7.6,10),0.63,1)':eval=frame,volume='if(between(t,5.38,5.78),0.06,1)':eval=frame"
fl.append(f'[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo,{vol},afade=t=in:d=0.3,afade=t=out:st=9.2:d=0.8[mus]')
fl.append(''.join(labels) + f'[mus]amix=inputs={m + 1}:normalize=0,atrim=0:{DUR},loudnorm=I=-14:TP=-2:LRA=11[out]')
cmd = ['ffmpeg', '-y', '-v', 'error'] + inp + ['-filter_complex', ';'.join(fl), '-map', '[out]', '-ar', '48000', OUT]
subprocess.run(cmd, check=True); print('mix ->', OUT)
