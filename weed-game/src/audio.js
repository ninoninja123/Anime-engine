// Äänet: kaikki syntetisoidaan WebAudiolla koodissa (ei ulkoisia äänitiedostoja).
let ctx = null, master = null, musicGain = null, musicTimer = null;
export let muted = false;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.35; musicGain.connect(master);
  } catch (e) { ctx = null; }
}
export function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.8; }

function noiseBuf(dur) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }

function noise({ dur = 0.3, type = 'lowpass', f0 = 1200, f1 = 300, q = 1, peak = 0.6, a = 0.005, out = master }) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf(dur + 0.05);
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
  const g = ctx.createGain(); env(g, t, a, peak, dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.1);
}
function tone({ f0 = 200, f1 = f0, dur = 0.3, type = 'sine', peak = 0.4, a = 0.01, out = master, when = 0 }) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
  const g = ctx.createGain(); env(g, t, a, peak, dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + a + dur + 0.05);
}

export const sfx = {
  bite() { noise({ dur: 0.12, type: 'bandpass', f0: 2500, f1: 900, q: 2, peak: 0.7 }); tone({ f0: 160, f1: 60, dur: 0.12, type: 'triangle', peak: 0.5 }); },
  hit() { noise({ dur: 0.25, f0: 900, f1: 120, peak: 0.8 }); tone({ f0: 110, f1: 40, dur: 0.25, type: 'sine', peak: 0.7 }); },
  whoosh() { noise({ dur: 0.25, type: 'bandpass', f0: 500, f1: 2600, q: 1.5, peak: 0.35, a: 0.04 }); },
  hurt() { tone({ f0: 900, f1: 500, dur: 0.18, type: 'square', peak: 0.12 }); noise({ dur: 0.2, f0: 1500, f1: 300, peak: 0.4 }); },
  roar() {
    if (!ctx) return;
    tone({ f0: 70, f1: 45, dur: 1.4, type: 'sawtooth', peak: 0.35, a: 0.15 });
    tone({ f0: 104, f1: 60, dur: 1.3, type: 'sawtooth', peak: 0.2, a: 0.2 });
    noise({ dur: 1.4, f0: 600, f1: 150, peak: 0.45, a: 0.15 });
  },
  tell() { tone({ f0: 300, f1: 300, dur: 0.12, type: 'square', peak: 0.08 }); tone({ f0: 450, f1: 450, dur: 0.12, type: 'square', peak: 0.08, when: 0.13 }); },
  rock() { noise({ dur: 0.6, f0: 400, f1: 60, peak: 0.9 }); tone({ f0: 70, f1: 30, dur: 0.5, peak: 0.6 }); },
  rumble(d = 2.5) { noise({ dur: d, f0: 180, f1: 50, peak: 0.9, a: 0.4 }); },
  card() { [660, 880, 1320].forEach((f, i) => tone({ f0: f, dur: 0.25, type: 'triangle', peak: 0.15, when: i * 0.06 })); },
  perfect() { [990, 1480].forEach((f, i) => tone({ f0: f, dur: 0.4, type: 'sine', peak: 0.18, when: i * 0.07 })); },
  battoga() {
    noise({ dur: 0.7, type: 'bandpass', f0: 400, f1: 5000, q: 1.2, peak: 0.6, a: 0.3 });
    [523, 659, 784, 1047].forEach((f, i) => tone({ f0: f, dur: 0.6, type: 'triangle', peak: 0.12, when: i * 0.05 }));
  },
  boom() { noise({ dur: 1.2, f0: 2000, f1: 40, peak: 1 }); tone({ f0: 90, f1: 25, dur: 1.2, peak: 0.9 }); },
  bark() { tone({ f0: 520, f1: 300, dur: 0.12, type: 'sawtooth', peak: 0.25 }); noise({ dur: 0.1, type: 'bandpass', f0: 1200, f1: 800, peak: 0.3 }); },
  howl() { tone({ f0: 420, f1: 640, dur: 1.6, type: 'triangle', peak: 0.2, a: 0.3 }); },
};

// --- Musiikki: yksinkertainen generatiivinen kappale ---
// 'battle' = matala rumpu + molli-ostinato, 'sad' = pianomainen arpeggio, null = hiljaisuus
let mode = null, step = 0;
const SAD = [57, 64, 69, 72, 71, 64, 67, 64, 55, 62, 67, 71, 69, 62, 66, 62]; // A-molli
const BAT = [45, 45, 48, 45, 43, 45, 50, 48];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export function music(m) {
  if (!ctx) return;
  mode = m; step = 0;
  if (musicTimer) clearInterval(musicTimer);
  if (!m) return;
  const bpm = m === 'battle' ? 132 : 72;
  const stepDur = 60 / bpm / 2;
  musicTimer = setInterval(() => {
    if (!ctx || muted) return;
    if (mode === 'sad') {
      const n = SAD[step % SAD.length];
      tone({ f0: mtof(n), dur: 1.6, type: 'sine', peak: 0.25, a: 0.01, out: musicGain });
      tone({ f0: mtof(n + 12), dur: 0.8, type: 'sine', peak: 0.05, a: 0.01, out: musicGain });
      if (step % 8 === 0) tone({ f0: mtof(SAD[step % SAD.length] - 24), dur: 3, type: 'triangle', peak: 0.18, a: 0.3, out: musicGain });
    } else if (mode === 'battle') {
      if (step % 4 === 0) { tone({ f0: 120, f1: 45, dur: 0.25, peak: 0.7, out: musicGain }); }
      if (step % 4 === 2) noise({ dur: 0.1, type: 'highpass', f0: 3000, f1: 3000, peak: 0.12, out: musicGain });
      if (step % 8 === 6) tone({ f0: 160, f1: 60, dur: 0.2, peak: 0.45, out: musicGain });
      const n = BAT[Math.floor(step / 2) % BAT.length];
      if (step % 2 === 0) tone({ f0: mtof(n), dur: 0.22, type: 'sawtooth', peak: 0.09, out: musicGain });
      if (step % 16 === 0) tone({ f0: mtof(n + 12), f1: mtof(n + 12), dur: 1.8, type: 'triangle', peak: 0.08, a: 0.4, out: musicGain });
    } else if (mode === 'calm') {
      if (step % 4 === 0) tone({ f0: mtof([69, 72, 76, 74][(step / 4) % 4]), dur: 2.4, type: 'sine', peak: 0.12, a: 0.4, out: musicGain });
    }
    step++;
  }, stepDur * 1000);
}
