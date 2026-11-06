/* Bleach Showdown engine - timeline.js : programs, shots, frame builder, events, frameKey.
   A PROGRAM is a list of shots on a global timeline (seconds).  A shot is
       shot(name, t0, t1, fn, opts)      fn(f, lt, u, T)  lt = local time (s), u = 0..1 progress, T = global time
   where f is a FRAME BUILDER collecting everything the compositor needs for this frame:
       f.cam(cam)                         camera object (camera.js); required for 3D content
       f.light(over)                      LIGHT overrides (key, rim, rimCol, shadeTint, fx: coloured point lights ...)
       f.bg(fn | {set, pal, dmg, ...})    background layer: drawSet options or a custom fn(ctx)
       f.fig(F, opt)                      add a figure (depth sorted with other figs/props); opt: {t: figure time (default = LOCAL shot time lt), mode,
                                          col, alpha, shadow: true (contact shadow), afterimages: [dt..], smear: true}
       f.prop(z, fn)                      custom 3D-ish element sorted with figures by camera depth z
       f.fx(fn, {layer:'under'|'over'|'glow'|'top'})  effect drawing fn(ctx); 'glow' = additive layer that also feeds bloom
       f.fg(fn | {set...})                foreground layer drawn over figures (set props nearer than zSplit)
       f.grade(g)  f.post(p)              colour script / post settings for the shot (post.js)
       f.shake(list)                      screen shake impulses [[t0, amp, dur, freq]] in LOCAL time
       f.impact(seqOrStyle, params)       impact frame (impact.js) overriding / processing the composed frame
       f.text(fn)                         overlay (titles, attack names) drawn after post (sharp, ungraded)
       f.flash(col, a)                    full-screen flash after grade
       f.key(k)                           frame-cache key (identical keys => frame rendered once)
   Programs: PROGRAM.reset(dur); shots register with shot(); the renderer calls renderTime(t).
   Events: sfx(t, name, data) records timing markers (exported by render.js events for the audio agent).       */
'use strict';
const PROGRAM = { shots: [], events: [], dur: 30, name: 'program', reset(d, name) { this.shots = []; this.events = []; this.dur = d; setDuration(d); if (name) this.name = name; } };
function shot(name, t0, t1, fn, opts = {}) { PROGRAM.shots.push(Object.assign({ name, t0, t1, fn }, opts)); PROGRAM.shots.sort((a, b) => a.t0 - b.t0); return PROGRAM.shots[PROGRAM.shots.length - 1]; }
function sfx(t, name, data) { PROGRAM.events.push(Object.assign({ t, name }, data || {})); }
function shotAt(t) { let s = null; for (const sh of PROGRAM.shots) if (t >= sh.t0 && t < sh.t1) s = sh; if (!s && PROGRAM.shots.length) { const last = PROGRAM.shots[PROGRAM.shots.length - 1]; if (t >= last.t1 - 1e-6) s = last; } return s; }

function makeFrame(t, sh, panel = 0) {
  const lt = t - sh.t0, dur = sh.t1 - sh.t0;
  const f = {
    T: t, lt, u: dur > 0 ? lt / dur : 0, shot: sh, panel, _split: null, _cam: null, _light: null, _bg: [], _figs: [], _props: [], _fx: { under: [], over: [], glow: [], top: [] }, _fg: [], _grade: Object.assign({}, sh.grade || {}), _post: Object.assign({}, sh.post || {}), _shake: [], _impact: null, _screen: [], _nullify: null, _text: [], _flash: [], _key: null, _blur: 0, _style: sh.style || 'action3d', _paintBG: sh.paintBG || null, _trans: sh.trans || null,
    cam(c) { this._cam = c; CAM.set(c); return this; },   // CAM.cur is valid inside the shot fn (camDepth, project)
    light(o) { this._light = Object.assign(this._light || {}, o); return this; },
    bg(x) { this._bg.push(x); return this; },
    fig(F, opt = {}) { if (opt.t == null) opt = Object.assign({}, opt, { t: this.lt }); this._figs.push({ F, opt }); return this; },   // figure time defaults to LOCAL shot time
    prop(z, fn) { this._props.push({ z, fn }); return this; },
    fx(fn, opt = {}) { (this._fx[opt.layer || 'over']).push(fn); return this; },
    fg(x) { this._fg.push(x); return this; },
    grade(g) { Object.assign(this._grade, g); return this; },
    post(p) { Object.assign(this._post, p); return this; },
    shake(list) { this._shake.push(...list); return this; },
    impact(seq, params) { this._impact = { seq, params: params || {} }; return this; },
    screen(fn) { this._screen.push(fn); return this; },   // screen-space process fn(comp, g, f, t) after grade, before impact (Sakanade world, Kyoka shatter...)
    nullify(o) { this._nullify = o; return this; },       // {at:[x,y,z]|x,y, r (px @1080p), feather}: screen effects are undone inside this circle (No Longer Human)
    text(fn) { this._text.push(fn); return this; },
    flash(col = '#ffffff', a = 1) { this._flash.push([col, a]); return this; },
    key(k) { this._key = k; return this; },
    style(s) { this._style = s; return this; },          // 'action3d' | 'hand2d' default render style for figures (+ painted bg/fig texture)
    paintBG(o = {}) { this._paintBG = o; return this; },  // painterly pass over the background layer (auto in hand2d shots)
    trans(o) { this._trans = o; return this; },           // transition overlay at the start of the shot {type, dur}
    motionBlur(px, ang = 0) { this._blur = px; this._blurAng = ang; return this; },
    // split screen: the shot fn runs twice (f.panel 0 = left/upper panel, 1 = right/lower) and the two renders are cut along a slanted line
    split(o = {}) { this._split = Object.assign({ ang: .12, x: .5, gap: 10, col: '#0a0608' }, o); return this; },
  };
  return f;
}
// build the frame description for global time t (runs the shot fn once)
const FRAME_CACHE = { t: null, f: null, p: 0 };
function buildFrame(t, panel = 0) {
  if (FRAME_CACHE.t === t && FRAME_CACHE.p === panel) return FRAME_CACHE.f;
  const sh = shotAt(t); if (!sh) return null;
  const f = makeFrame(t, sh, panel); lightReset(); sh.fn(f, f.lt, f.u, t);
  FRAME_CACHE.t = t; FRAME_CACHE.f = f; FRAME_CACHE.p = panel; return f;
}
function frameKey(t) {
  const f = buildFrame(t); if (!f) return 'none';
  if (f._key != null) return f.shot.name + '|' + f._key;
  if (f.shot.timing && f.shot.timing > 1) return f.shot.name + '|' + Math.floor((t - f.shot.t0) * FPS / f.shot.timing + 1e-6);
  return 'u' + Math.round(t * FPS);
}
// helper used by shots: on-ones / twos for the CHARACTER drawing while camera stays smooth
const onTwos = t => onN(t, 2), onThrees = t => onN(t, 3);
