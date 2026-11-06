/* showdown/common.js - shared helpers for part1/part2 (agent E owns this file; shot writers read it, request changes in ENGINE_NOTES.md).
   PROJECT: ITACHI UCHIHA vs JULIUS NOVACHRONO (pre/shots.json, <= 180 s, final 1280x720 24 fps).  ONE ARENA (Valhalla re-dressed: SETS.ijarena), dmg 0..3 per shot.
   Data: shots_data.js (generated from pre/shots.json by gen_data.py): SHOTS[id] = {t0, t1, render, text, text_style, bg, dmg, light, chars, engine_chars, camera, move,
   dialogue, impact:{style, t (global), frames, pattern}, masked}, SHOT_ORDER, SUBS, WHO, SHOW_DUR.
   MAIN HELPERS
     shotT(id, fn, opts)        define a shot from the table: t0/t1, render style, impact series at impact.t fitted to impact.frames (incl. BURST / BURST_ITA / BURST_JUL /
                                BURST_CLASH = 5+ styles in 0.5-1 s), attack name from 'text' with the right lettering (autoTitle).  X-* impacts are never auto-run.
                                opts: { noImpact, impact:{...params}, noText, textAt, title:{...}, seq (override steps), shotOpts }
     autoTitle(f, lt, d, o)     text_style UCHIHA (Itachi: black-crimson Shippori) | CHRONO (Julius: gold/blue Cinzel) | ARENA (announcer banner; BEGIN!/FIGHT! big)
                                | CARD_I / CARD_J ('ITACHI UCHIHA / TITLE / SUB' -> fighterCard; '... -> VS' adds vsCard).  'KANJI ENGLISH' -> kanji column + English.
     CH(code, form, keys, opts) figure: ITA = itachi (base sharingan mangekyo sick sick_mangekyo nocloak), JUL = julius (base magic manazone chrono casual wounded),
                                URA = urahara (announcer: urahara_announce / urahara_announceFan, mic), DAZ = dazai, KYO = kyoraku.  Default timing 2 ({timing:1} for hits).
     BGX(f, code, over)         ARENA | ARENA_DUSK | ARENA_DAY | ARENA_DARK | ARENA_RED | ARENA_GOLD | STANDS | BOOTH (Urahara: HVG.BOOTH.pos, gong HVG.GONG.pos)
                                | GATE_I / GATE_J (west = Itachi HVG.GATE_W, east = Julius HVG.GATE_E; open with bg:{gateW / gateE}) | SKY | CARD (bg:{who}) | TSUKU (Tsukuyomi world)
                                | FIN.  over: { dmg, bg:{...ijarena options}, pal, std:false, fill:false, side:'I'|'J' }.  side 'I' = crimson rim from the west, 'J' = gold rim from the east.
     CROWD (Dazai = the wise one, Shunsui beside him = premature verdicts; both always among seated silhouettes):
       STAR(f, 'DAZ:watch', lt, o) / STAR(f, 'KYO:verdict', lt, o)   reaction shot (IJ.crowdShot) focused on that star; the other one and the silhouettes are in frame
       PAIR(f, lt, {rD, rS, part:'two', ...})                         both in a two-shot.  Reactions: DAZ watch knowing explain narrow smile shock sigh | KYO verdict toast smug oops laugh hush eyesWide sweat
     CAMERA (always moving; big figures; clear faces):
       heroRise(F, lt, {dur, az, from, to, fov})   low crane-up hero reveal (feet -> face, slight arc)       arcCam(figs, lt, {dur, az0, az1, fill, el0, el1, low})  arcing group move
       pushFace(F, lt, {dur, from, to, az, part})  slow push to the face                                     gcam(figs, t, o) big two-shot (o.low for a low angle), faceCam(F, t, o)
       + engine: closeCam camGroup camLowHero camSlowPush camOrbitShot camOTS camLowTwo camHandheld camWhip camDutch camTruck camStands
     FX shortcuts: SUS(f, lt, o) (Susanoo, layer over), AMA(f, c, lt, o) (Amaterasu patch), CROWS(f, lt, o), CLOCK(f, c, n, lt, o) (clock circle, glow), MANAZONE(f, c, lt, o)
   Subtitles (SUBS) drawn automatically: Inter 700 52 px, 8 px black edge, y 960; ITACHI #ff4a4a, JULIUS #f6d36a, URAHARA #9fe0a5, DAZAI #c8a878, SHUNSUI #f4a6c8.   */
'use strict';
const LT = (f, T) => T - f.shot.t0;
function impactAtT(f, seq, T, params = {}) { f.impact(seq, Object.assign({ t0: T - f.shot.t0 }, params)); }
const CODE2CAST = { ITA: 'itachi', JUL: 'julius', URA: 'urahara', DAZ: 'dazai', KYO: 'kyoraku' };
function CH(code, form, keys, opts = {}) { const name = CODE2CAST[code] || code; if (!CAST[name]) throw new Error('missing CAST ' + name); return fig(name, form || 'base', keys, Object.assign({ timing: 2 }, opts)); }
const BGMAP = {
  ARENA: { set: 'ijarena', pal: 'arena_ij', bg: { moon: 1, moonCol: '#c83a3a', wet: 1 } }, ARENA_DUSK: { set: 'ijarena', pal: 'arena_ij_dusk' }, ARENA_DAY: { set: 'ijarena', pal: 'arena_ij_day' },
  ARENA_DARK: { set: 'ijarena', pal: 'arena_ij_dark', bg: { torch: .15, moon: 1 } }, ARENA_RED: { set: 'ijarena', pal: 'arena_ij_red', bg: { moon: 1, moonCol: '#ff5a4a' } }, ARENA_GOLD: { set: 'ijarena', pal: 'arena_ij_gold' },
  STANDS: { set: 'ijarena', pal: 'arena_ij', bg: { cheer: 1 } }, BOOTH: { set: 'ijarena', pal: 'arena_ij' }, GATE_I: { set: 'ijarena', pal: 'arena_ij', bg: { gateW: 0 } }, GATE_J: { set: 'ijarena', pal: 'arena_ij', bg: { gateE: 0 } },
  SKY: { set: 'heavens', pal: 'ij_storm', bg: { arena: true, lightning: true, redMoon: true } }, CARD: { set: 'ijcard', pal: 'arena_ij', noRain: true }, TSUKU: { set: 'tsukuyomi', pal: 'tsukuyomi', noRain: true }, GENJ: { set: 'tsukuyomi', pal: 'tsukuyomi', noRain: true, bg: { crosses: 0 } }, FIN: { set: 'ijarena', pal: 'arena_ij' },
};
const BG_FILL = {
  ARENA: { ambK: .17, shadeK: .42, rim: '#ffb890', bright: 1.08, lift: ['#1a1018', .05] }, ARENA_DUSK: { ambK: .18, shadeK: .4, rim: '#ffb070', bright: 1.06, lift: ['#2a1020', .05] },
  ARENA_DAY: { ambK: .22, shadeK: .38, rim: '#fff4e0', bright: 1.02, lift: ['#202030', .03] }, ARENA_DARK: { ambK: .2, shadeK: .4, rim: '#b8a8ff', bright: 1.14, lift: ['#0a0a18', .07] },
  ARENA_RED: { ambK: .18, shadeK: .42, rim: '#ff6a4a', bright: 1.08, lift: ['#1a0408', .05] }, ARENA_GOLD: { ambK: .2, shadeK: .4, rim: '#ffe0a0', bright: 1.08, lift: ['#0a0a1a', .05] },
  STANDS: { ambK: .2, shadeK: .4, rim: '#ffb880', bright: 1.1, lift: ['#1a1018', .05] }, BOOTH: { ambK: .2, shadeK: .4, rim: '#ffc890', bright: 1.08, lift: ['#1a1020', .05] },
  GATE_I: { ambK: .17, shadeK: .4, rim: '#ff4a3a', bright: 1.1, lift: ['#2a0808', .05] }, GATE_J: { ambK: .17, shadeK: .4, rim: '#ffd070', bright: 1.1, lift: ['#2a2008', .05] },
  SKY: { ambK: .2, shadeK: .4, rim: '#fff0d8', bright: 1.04, lift: ['#1a1a2a', .04] }, CARD: { ambK: .16, shadeK: .4, rim: '#ffd890', bright: 1.1, lift: ['#1a0a10', .04] },
  TSUKU: { ambK: .25, shadeK: .4, rim: '#ff4a3a', bright: 1.0, lift: ['#100002', .04] }, GENJ: { ambK: .25, shadeK: .4, rim: '#ff4a3a', bright: 1.0, lift: ['#100002', .04] }, FIN: { ambK: .17, shadeK: .42, rim: '#ffb880', bright: 1.08, lift: ['#1a1018', .05] },
};
var ARENA_DMG = T => T < 30 ? 0 : T < 75 ? 1 : T < 130 ? 2 : 3;   // fallback when the shot has no 'dmg'
function shotReact(d) { for (const c of (d && d.chars) || []) { const m = /^CROWD:(\w+)/.exec(c); if (m) return m[1] === 'panic' ? 'gasp' : m[1]; } return null; }
function BGX(f, code, over = {}) {
  const m = BGMAP[code] || BGMAP.ARENA, setName = over.set || m.set, S = SETS[setName], d = f.shot && SHOTS[f.shot.name];
  const pal = over.pal || m.pal || (S && S.pal) || 'arena_ij', dmg = over.dmg != null ? over.dmg : (d && d.dmg != null ? d.dmg : ARENA_DMG(f.T)), react = shotReact(d);
  if (over.std !== false) std(f, Object.assign({ pal: typeof pal === 'string' ? pal : 'arena_ij' }, m.stdOpt || {}, over.stdOpt || {}));
  f.bg(Object.assign({ set: setName, pal, dmg }, react ? { react, cheer: react === 'roar' ? 1 : .7 } : {}, m.bg || {}, over.bg || {}));
  const fk = BG_FILL[code] ? code : 'ARENA'; if (over.fill !== false) { const F = BG_FILL[fk]; f.light({ ambientK: F.ambK, shadeK: F.shadeK, rimAmt: .8, rimCol: F.rim }); f.grade({ bright: F.bright, lift: F.lift }); }
  // RAIN (cast.md: the arena is under heavy rain; time stopped -> drops hang still; shots.json 'rain': false = frozen).  over.rain: false (none) | {mode, clock, k, collapseT}
  const rainOn = over.rain !== false && !m.noRain && !(over.bg && over.bg.layer); if (rainOn) { const ro = Object.assign({}, typeof over.rain === 'object' ? over.rain : {}), shotRain = d ? d.rain : true; if (!ro.mode) ro.mode = shotRain === false ? 'frozen' : 'fall';
    if (ro.clock == null) ro.clock = ro.mode === 'frozen' ? (over.freezeT != null ? over.freezeT : (d ? d.t0 : f.T)) : f.T; f.fx(g => fxRain(g, f.lt, ro), { layer: 'over' }); }
  if (over.side === 'I') f.light({ rimCol: '#ff3a3a', rimAmt: .95, rim: vNorm([-.7, .3, -.5]) }); else if (over.side === 'J') f.light({ rimCol: '#ffd36a', rimAmt: .95, rim: vNorm([.7, .3, -.5]) });
  return pal;
}
// ------------------------------------------------------------------------------------------------ crowd stars
const STAR_FOCUS = { DAZ: 'dazai', KYO: 'shunsui' };
function STAR(f, entry, lt, o = {}) { const [code, react] = String(entry).split(':'), focus = STAR_FOCUS[code] || 'both', d = f.shot && SHOTS[f.shot.name];
  const opt = Object.assign({ focus, dmg: d && d.dmg || 0 }, o); if (focus === 'dazai') opt.rD = react || opt.rD || 'watch'; else if (focus === 'shunsui') opt.rS = react || opt.rS || 'smug';
  if (!opt.react) { const r = shotReact(d); if (r) opt.react = r; } IJ.crowdShot(f, lt, opt); }
function PAIR(f, lt, o = {}) { IJ.crowdShot(f, lt, Object.assign({ focus: 'both', part: 'two' }, o)); }
// ------------------------------------------------------------------------------------------------ fx shortcuts
function SUS(f, lt, o = {}) { f.fx(g => fxSusanoo(g, o.t != null ? o.t : lt, o), { layer: o.layer || 'over' }); }
function AMA(f, c, lt, o = {}) { f.fx(g => fxAmaterasu(g, c, lt, o), { layer: o.layer || 'over' }); }
function CROWS(f, lt, o = {}) { f.fx(g => fxCrows(g, lt, o), { layer: o.layer || 'over' }); }
function CLOCK(f, c, n, lt, o = {}) { f.fx(g => fxClockCircle(g, c, n, lt, o), { layer: o.layer || 'glow' }); }
function MANAZONE(f, c, lt, o = {}) { f.fx(g => fxManaZone(g, c, lt, o), { layer: o.layer || 'glow' }); }
// ------------------------------------------------------------------------------------------------ impacts + titles
function fitSeq(style, frames, pattern, burst) {
  let steps = (pattern && IMPACT_SEQ[style + '@' + pattern]) || IMPACT_SEQ[style] || (IMPACT[style] ? [{ s: style, n: frames }] : null);
  if (pattern && /^[A-Z]+\d+(-[A-Z]+\d+)+$/.test(pattern) && (IJ.BURST_STYLE[style] || /BURST|CLASH/.test(style))) steps = burstSeq(pattern, IJ.BURST_STYLE[style] || {});
  else if (/^BURST/.test(style) && frames) steps = IJ.burst({ frames, who: style === 'BURST_ITA' ? 'itachi' : style === 'BURST_JUL' ? 'julius' : style === 'BURST_CLASH' ? 'clash' : null, seed: Math.round(frames * 7 + (pattern ? pattern.length : 0)) });
  if (!steps) { console.log('missing impact ' + style); return [{ s: 'flash', n: 1 }, { s: 'invert', n: Math.max(1, frames - 1) }]; }
  const tot = steps.reduce((a, s) => a + (s.n || 1), 0); if (!frames || tot === frames) return steps;
  let out = steps.map(s => Object.assign({}, s, { n: Math.max(1, Math.round((s.n || 1) * frames / tot)) }));
  while (out.reduce((a, s) => a + s.n, 0) > frames && out.length > 1) { const i = out.reduce((bi, s, k) => s.n > out[bi].n ? k : bi, 0); if (out[i].n > 1) out[i].n--; else out.splice(out.length - 1, 1); }
  while (out.reduce((a, s) => a + s.n, 0) < frames) out[out.length - 1].n++;
  return out;
}
function subOnScreen(T) { for (const s of SUBS) if (T >= s.t0 - .1 && T < s.t1 + .1) return true; return false; }
function autoTitle(f, lt, d, o = {}) {
  const text = String(d.text), dur = d.t1 - d.t0, ta = o.textAt == null ? .08 : o.textAt, ts = (d.text_style || '').toUpperCase(), up = text.toUpperCase();
  if (ts === 'CARD_I' || ts === 'CARD_J' || /^(ITACHI UCHIHA|JULIUS NOVACHRONO) \//.test(up)) { const who = ts === 'CARD_J' || /^JULIUS/.test(up) ? 'julius' : 'itachi', vs = /VS\s*$/.test(up) ? .8 : 0;
    const segs = text.replace(/(→|->)\s*VS\s*$/i, '').split('/').map(x => x.trim()).filter(Boolean), cardTxt = {}; if (segs[1]) cardTxt.title = segs[1].toUpperCase(); if (segs[2]) cardTxt.sub = segs[2].toUpperCase();
    return f.text(g => { fighterCard(g, lt, Object.assign({ who, side: who === 'julius' ? 'right' : 'left', t0: ta, dur: dur - ta - vs }, cardTxt, o.title || {})); if (vs) vsCard(g, lt, { t0: dur - vs, dur: vs, colL: '#ff3a3a' }); }); }
  let raw = text, sub = null; const m = raw.match(/^([　-鿿゠-ヿ＀-￯・]+)\s+(.+)$/); if (m) { sub = m[1]; raw = m[2]; }
  const hold = Math.max(.6, dur - ta - .45); let base;
  if (ts === 'ARENA') base = { style: 'arena', text: raw, big: /BEGIN|FIGHT|はじめ/i.test(raw) };
  else { const ch = d.chars || [], who = (ts === 'UCHIHA' || ts === 'CROW') ? 'itachi' : (ts === 'CHRONO' || ts === 'WIZARD') ? 'julius' : (ch.includes('JUL') && !ch.includes('ITA') ? 'julius' : 'itachi');
    base = ijMoveTitle(lt, raw, { who }); if (ts === 'UCHIHA' || ts === 'CROW') base.style = 'uchiha'; else if (ts === 'CHRONO' || ts === 'WIZARD') base.style = 'chrono'; else if (base.style === 'arena' && ts !== 'ARENA') base.style = who === 'julius' ? 'chrono' : 'uchiha'; }
  let opt = Object.assign({ t0: ta, dur: hold }, base); if (sub) opt.sub = sub;
  if (subOnScreen(f.T) || subOnScreen(d.t0 + ta + .3)) opt.y = 430;
  opt = Object.assign(opt, o.title || {});
  f.text(g => attackTitle(g, lt, opt));
}
function shotT(id, fn, opts = {}) {
  const d = SHOTS[id]; if (!d) throw new Error('unknown shot ' + id);
  return shot(id, d.t0, d.t1, (f, lt, u, T) => {
    if (d.render === 'hand2d') f.style('hand2d');
    fn(f, lt, u, T);
    if (d.impact && !opts.noImpact && !f._impact && !/^X-/.test(d.impact.style)) f.impact(opts.seq || fitSeq(d.impact.style, d.impact.frames, d.impact.pattern, d.impact.burst), Object.assign({ t0: d.impact.t - d.t0 }, opts.impact || {}));
    if (d.text && !opts.noText) autoTitle(f, lt, d, opts);
  }, opts.shotOpts || {});
}
// ------------------------------------------------------------------------------------------------ cameras (always moving)
function faceCam(F, t, o = {}) { return closeCam(F, t, Object.assign({ part: 'face', az: .45, el: .06, fov: 28 }, o)); }
function gcam(figs, t, o = {}) { const c = o.low ? camLowTwo(figs, t, Object.assign({ fill: .74 }, o)) : camWideGroup(figs, t, Object.assign({ fill: .7 }, o)); return camHandheld(c, t, o.shake == null ? .005 : o.shake, o.seed || 1); }
function heroRise(F, lt, o = {}) { const u = easeInOut(clamp(lt / (o.dur || 2), 0, 1)), S = figSkel(F, F.timing > 1 ? onN(lt, F.timing) : lt), k = S.B.h / 1.8, yaw = S.pose.yaw || 0, az = yaw + lerp(o.az == null ? .5 : o.az, o.az1 == null ? (o.az == null ? .5 : o.az) - .25 : o.az1, u);
  const c = S.J.pelvis, d = lerp(o.from || 2.4, o.to || 1.7, u) * k, h = lerp(.12, o.hTo || .85, u) * k, tgt = vLerp(vLerp(S.J.knL, S.J.knR, .5), vAdd(S.J.head, [0, -.02 * k, 0]), lerp(.15, 1, u));
  return camHandheld({ pos: [c[0] + Math.sin(az) * d, h, c[2] + Math.cos(az) * d], target: tgt, fov: o.fov || lerp(50, 40, u), roll: (o.roll || .06) * (1 - u) }, lt, .004, 3); }
function arcCam(figs, lt, o = {}) { const u = easeInOut(clamp(lt / (o.dur || 2.5), 0, 1)); const c = (o.low ? camLowTwo : camGroup)(figs, lt, Object.assign({ fill: o.fill || .72, az: lerp(o.az0 == null ? -.4 : o.az0, o.az1 == null ? .35 : o.az1, u), el: lerp(o.el0 == null ? .02 : o.el0, o.el1 == null ? .1 : o.el1, u), fov: o.fov || 34 }, o.cam || {})); return camHandheld(c, lt, .004, 5); }
function pushFace(F, lt, o = {}) { const u = easeInOut(clamp(lt / (o.dur || 2), 0, 1)); return camHandheld(closeCam(F, lt, Object.assign({ part: o.part || 'face', az: o.az == null ? .4 : o.az, el: o.el == null ? .04 : o.el }, o.cam || {}, { dist: lerp(o.from || 1.3, o.to || .9, u) })), lt, .003, 9); }
// ------------------------------------------------------------------------------------------------ subtitles
const SUB_WHO = { ITA: '#e8364a', JUL: '#f2c76b', URA: '#9fe0a5', DAZ: '#d9b77e', KYO: '#f4a6c8' };
const SUB_NAME = { ITA: 'ITACHI', JUL: 'JULIUS', URA: 'URAHARA', DAZ: 'DAZAI', KYO: 'SHUNSUI' };
function ijSubLines(text, max = 44) { if (text.length <= max) return [text]; const w = text.split(' '); let a = '', b = ''; for (const x of w) { if ((a + ' ' + x).trim().length <= text.length / 2 + 4 && !b) a = (a + ' ' + x).trim(); else b = (b + ' ' + x).trim(); } return [a, b]; }
PROGRAM.overlays = PROGRAM.overlays || [];
PROGRAM.overlays.push((g, t) => { for (const s of SUBS) if (t >= s.t0 && t < s.t1) { const a = Math.min(1, (t - s.t0) / .12, (s.t1 - t) / .12), who = SUB_NAME[s.who] || (WHO[s.who] || s.who || '').split(' (')[0].split(' ')[0].toUpperCase(),
  lines = ijSubLines(s.line), sz = 52;
  lines.forEach((ln, i) => subtitle(g, ln, { who: i === 0 ? who : null, a, size: sz, y: 960 - (lines.length - 1 - i) * (sz + 12), whoCol: SUB_WHO[s.who] || '#d0d0d0', italic: !!s.italic })); } });
function placeholderShot(id) { const d = SHOTS[id]; shot(id, d.t0, d.t1, (f, lt) => { f.cam({ pos: [0, 1.6, 6], target: [0, 1.2, 0], fov: 35 }); f.bg((g) => { g.fillStyle = '#3a3a44'; g.fillRect(0, 0, W, H); }); f.text(g => { g.fillStyle = '#fff'; g.font = '800 60px "Inter", sans-serif'; g.fillText(id + '  (TODO)', 60, 120); }); }); }
