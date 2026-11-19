// Small WebAudio synths for sounds the Epidemic set does not have: a truck (diesel engine + tyre roar, distance gain,
// stereo pan and Doppler from its real 3D position relative to the camera) and its air horn.
//   const s = vehicleSound(truckGroup); ... s.stop()      horn(0.9)
// Respects the global mute; quiet when there is no AudioContext (headless / before the first tap).
import { E } from '../engine.js';
import { audioCtx, muted } from '../audio.js';

let out = null;
function bus() {
  const ctx = audioCtx(); if (!ctx) return null;
  if (!out) { out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination); E.updaters.add(() => { if (out) out.gain.value = muted ? 0 : 0.8; }); }
  return out;
}
let noiseBuf = null;
function noise(ctx) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

/** Engine + tyres following an Object3D. Returns { stop() }. */
export function vehicleSound(obj, { base = 48, loud = 1 } = {}) {
  const ctx = audioCtx(), o = bus(); if (!ctx || !o || E.skipping) return { stop() {} };
  const g = ctx.createGain(); g.gain.value = 0.0001;
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.8;
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = base;
  const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = base * 2.01;
  const o2g = ctx.createGain(); o2g.gain.value = 0.35;
  const n = ctx.createBufferSource(); n.buffer = noise(ctx); n.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
  const ng = ctx.createGain(); ng.gain.value = 0.55;
  o1.connect(lp); o2.connect(o2g); o2g.connect(lp); n.connect(bp); bp.connect(ng); ng.connect(lp);
  lp.connect(g); if (pan) { g.connect(pan); pan.connect(o); } else g.connect(o);
  o1.start(); o2.start(); n.start();
  let lastD = null, alive = true;
  const upd = (_dt, dtr) => {
    if (!alive) return;
    const p = obj.position, c = E.camPos;
    const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz);
    const vr = lastD === null || !(dtr > 0) ? 0 : (d - lastD) / dtr; lastD = d;          // radial speed (+ = going away)
    const t = ctx.currentTime;
    const vol = obj.visible ? Math.min(1, 7 / (d + 2)) * 0.5 * loud : 0;
    g.gain.setTargetAtTime(Math.max(0.0001, vol), t, 0.05);
    const dop = Math.max(0.6, Math.min(1.5, 1 - vr / 60));                                 // exaggerated Doppler
    o1.frequency.setTargetAtTime(base * dop, t, 0.05); o2.frequency.setTargetAtTime(base * 2.01 * dop, t, 0.05);
    lp.frequency.setTargetAtTime(380 + 900 * Math.min(1, 4 / (d + 1)), t, 0.05);
    if (pan) pan.pan.setTargetAtTime(Math.max(-0.9, Math.min(0.9, dx / 9)), t, 0.05);
  };
  E.updaters.add(upd);
  return {
    stop(fade = 0.4) {
      if (!alive) return; alive = false; E.updaters.delete(upd);
      const t = ctx.currentTime; g.gain.setTargetAtTime(0.0001, t, fade / 3);
      setTimeout(() => { try { o1.stop(); o2.stop(); n.stop(); } catch (_) {} g.disconnect(); }, fade * 1000 + 300);
    },
  };
}

/** Truck air horn (two detuned squares, a long blast). */
export function horn(secs = 0.9, vol = 0.32) {
  const ctx = audioCtx(), o = bus(); if (!ctx || !o || E.skipping) return;
  const t = ctx.currentTime, g = ctx.createGain(), lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1800;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.setValueAtTime(vol, t + secs - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + secs);
  for (const f of [311, 370, 466]) { const s = ctx.createOscillator(); s.type = 'square'; s.frequency.value = f; s.connect(lp); s.start(t); s.stop(t + secs + 0.05); }
  lp.connect(g); g.connect(o);
}
