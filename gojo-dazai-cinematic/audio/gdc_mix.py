import subprocess
# (file, t, gain_dB, maxdur, extra filter)
EV=[('whoosh.mp3',0.0,-10,1.4,''),('air.mp3',0.15,-12,.6,''),
('whoosh.mp3',1.66,-8,1.4,''),('powerup.mp3',1.9,-6,1.3,''),('charge.mp3',2.0,-4,1.9,''),('shimmer.mp3',2.5,-9,1.2,''),
('beam.mp3',3.48,-2,1.2,''),('boom.mp3',3.5,0,1.9,''),('stinger.mp3',3.5,-5,1.8,''),('anime.mp3',3.5,-9,1.2,''),
('shimmer.mp3',4.55,-4,1.5,''),('stinger.mp3',4.6,-6,1.6,''),('punchlow.mp3',4.6,-8,.6,''),('air.mp3',5.1,-12,.6,''),
('air.mp3',6.15,-8,.6,''),('glass.mp3',6.48,-2,1.4,''),('punchlow.mp3',6.5,-6,.6,''),
('whoosh.mp3',7.85,-6,1.0,''),('punch.mp3',8.2,0,1.3,''),('anime.mp3',8.25,-3,1.8,''),('boom.mp3',8.25,-1,1.9,''),('punchlow.mp3',8.25,-2,.6,''),
('air.mp3',8.6,-6,.6,''),('whoosh.mp3',8.95,-10,1.0,''),('splash.mp3',9.05,-2,1.5,''),('air.mp3',9.45,-10,.6,'')]
inp=['-ss','44.55','-t','10.2','-i','music.mp3']; fl=[]
for i,(f,t,g,d,x) in enumerate(EV):
    inp+=['-i',f]; ms=int(t*1000)
    fl.append(f"[{i+1}:a]atrim=0:{d},afade=t=out:st={max(0,d-.25)}:d=0.25,volume={g}dB,aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[s{i}]")
duck="volume='if(between(t,3.45,4.3)+between(t,8.2,9.0),0.5,1)':eval=frame"
fl.append(f"[0:a]aresample=48000,aformat=channel_layouts=stereo,volume=-6dB,{duck},afade=t=in:d=0.08,afade=t=out:st=9.55:d=0.45[m]")
fl.append('[m]'+''.join(f'[s{i}]' for i in range(len(EV)))+f"amix=inputs={len(EV)+1}:normalize=0:duration=first,atrim=0:10,loudnorm=I=-14:TP=-2:LRA=11[out]")
subprocess.run(['ffmpeg','-y','-v','error']+inp+['-filter_complex',';'.join(fl),'-map','[out]','-ar','48000','mix.wav'],check=True)
