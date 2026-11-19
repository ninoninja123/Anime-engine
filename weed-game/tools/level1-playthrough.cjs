// Fast automated playthrough of the Prologue chapter (level 1) with a VIRTUAL CLOCK and a scripted "player".
//
//   URL=http://localhost:4192/ node tools/level1-playthrough.cjs [sections|all] [--bot=good|sloppy|idle] [--fps=30] [--shots]
//
// How it is fast: performance.now / Date.now / rAF / setTimeout / setInterval are replaced (like tools/cine-capture.cjs)
// and the 3D render is switched off (E.noRender) except for screenshots, so game time runs as fast as the CPU allows
// (swiftshader rendering was the bottleneck). Input is real: synthetic PointerEvents on #touch go through input.js
// (classify -> tap / swipe / arc), so gesture timing (event fires on pointer-up) is part of the test.
//
// The bot reacts like a person: it only "sees" an obstacle when its warning icon is visible, waits a reaction time
// (good 0.30 s, sloppy 0.42 s + jitter + missed reads), then swipes/taps (each gesture takes ~0.1 s to finish).
//
// Checks per section: no console/page errors; no stuck state (a mode that does not change in a time limit); Skip button
// ends every scene; runs/fights are won by the bot; checkpoints (section index saved); defeat -> Retry works (idle bot
// first, then good bot); pause freezes the game; quit returns to the menu; result screen -> Level 2 starts.
// Scenarios: `all` = every section with the good bot + defeat/retry + pause/quit + resume-from-checkpoint + level 2.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.URL || 'http://localhost:4192/';
const args = process.argv.slice(2);
const opt = k => { const a = args.find(x => x.startsWith('--' + k)); return a ? (a.split('=')[1] ?? true) : null; };
const SEL = args.find(a => !a.startsWith('--')) || 'all';
const BOT = opt('bot') || 'good';
const FPS = +(opt('fps') || 30);
const SHOTS = !!opt('shots');
const PERF = !!opt('perf'); const perf = {};
const REPEAT = +(opt('repeat') || 1), SEED = +(opt('seed') || 12345), NOTUT = !!opt('notut');
const OUT = path.join(__dirname, '..', 'screenshots', 'level1_playthrough');
if (SHOTS) fs.mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------ in-page: virtual clock + bot
const INIT = () => {
  let now = 1000, rid = 0, tid = 1; const cbs = []; const timers = new Map();
  performance.now = () => now; Date.now = () => 1.7e12 + now;
  window.requestAnimationFrame = cb => { cbs.push(cb); return ++rid; };
  window.cancelAnimationFrame = () => {};
  window.setTimeout = (fn, ms = 0, ...a) => { const i = tid++; timers.set(i, { at: now + (+ms || 0), fn, a }); return i; };
  window.clearTimeout = i => { timers.delete(i); };
  window.setInterval = (fn, ms = 0, ...a) => { const i = tid++; timers.set(i, { at: now + Math.max(1, +ms || 0), fn, a, every: Math.max(1, +ms || 0) }); return i; };
  window.clearInterval = i => { timers.delete(i); };
  const mc = new MessageChannel(); let res = null; mc.port1.onmessage = () => { const r = res; res = null; r && r(); };
  const yieldMacro = () => new Promise(r => { res = r; mc.port2.postMessage(0); });
  window.__render = false;
  window.__vt = () => now;
  window.__advance = async (frames, dt) => {
    for (let f = 0; f < frames; f++) {
      now += dt;
      for (const [i, t] of [...timers]) if (t.at <= now && timers.has(i)) { if (t.every) t.at += t.every; else timers.delete(i); try { typeof t.fn === 'function' && t.fn(...t.a); } catch (e) { console.error('timer: ' + (e && e.stack || e)); } }
      if (window.__game && window.__game.E) window.__game.E.noRender = !window.__render;
      if (window.__bot) try { window.__bot.frame(now); } catch (e) { console.error('bot: ' + (e && e.stack || e)); }
      const l = cbs.splice(0); for (const cb of l) { try { cb(now); } catch (e) { console.error('raf: ' + (e && e.stack || e)); } }
      await yieldMacro();
    }
  };

  // ---------------- bot
  const B = window.__bot = {
    mode: 'off', prof: null, q: [], log: [], seen: new Map(), lastBite: 0, rnd: (() => { let s = window.__seed || 12345; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })(),
    stats: { gestures: 0, hits: 0, misses: 0 },
    setProfile(p) {
      this.mode = p;
      this.prof = p === 'good' ? { react: 0.30, jit: 0.06, miss: 0, bite: 3.0 } : p === 'sloppy' ? { react: 0.42, jit: 0.14, miss: 0.12, bite: 4.0 } : null;
      this.seen.clear(); this.q = [];
    },
    el() { return document.getElementById('touch'); },
    ev(type, x, y) { this.el().dispatchEvent(new PointerEvent(type, { pointerId: 7, clientX: x, clientY: y, bubbles: true, cancelable: true, isPrimary: true, pointerType: 'touch', button: 0, buttons: type === 'pointerup' ? 0 : 1 })); },
    // gesture: schedule pointer events (times in ms of the virtual clock); `at` = when the finger touches down
    gesture(kind, at) {
      const x = 470, y = 210, s = [];
      if (kind === 'tap') s.push([0, 'pointerdown', x, y], [55, 'pointerup', x + 2, y]);
      else if (kind === 'arc') { for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2.1; s.push([i * 28, i ? (i === 14 ? 'pointerup' : 'pointermove') : 'pointerdown', x + Math.cos(a) * 85, y + Math.sin(a) * 70]); } }
      else { const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[kind]; for (let i = 0; i <= 4; i++) s.push([i * 25, i ? (i === 4 ? 'pointerup' : 'pointermove') : 'pointerdown', x + d[0] * i * 22, y + d[1] * i * 22]); }
      for (const [dt, type, px, py] of s) this.q.push({ t: at + dt, type, x: px, y: py });
      this.q.sort((a, b) => a.t - b.t); this.stats.gestures++;
    },
    busyInput(now) { return this.q.length && this.q[this.q.length - 1].t > now - 1; },
    frame(now) {
      while (this.q.length && this.q[0].t <= now) { const e = this.q.shift(); this.ev(e.type, e.x, e.y); }
      if (!this.prof || !window.__game || !window.__game.debug1) return;
      const S1 = window.__S1, d1 = window.__game.debug1; if (!S1.active || S1.paused) return;
      const P = this.prof, r = this.rnd, ms = s => s * 1000;
      const plan = (key, fn) => { if (this.seen.has(key)) return; this.seen.set(key, now); fn(); };
      if (S1.mode === 'run' && d1.R && !d1.R.over) {
        const R = d1.R, v = R.cfg.speed * (R.stumble > 0 ? 0.55 : 1) * (window.__game.E.timeScale || 1);
        for (const o of R.obs) {
          if (o.passed || o.cleared || !o.icon.visible) continue;   // a person reacts to what is on screen
          plan(o, () => {
            if (r() < P.miss) { this.stats.misses++; return; }
            const tPass = (o.d - R.d) / v;                       // seconds until it reaches Weed
            const reactAt = P.react + (r() - 0.5) * 2 * P.jit;
            let fireIn;                                         // when the gesture should complete (pointer-up)
            if (o.kind === 'tap') fireIn = reactAt + 0.1;
            else { const want = tPass - (o.kind === 'up' ? 0.3 : 0.32) + (r() - 0.5) * 2 * P.jit; fireIn = Math.max(reactAt + 0.1, want); }
            this.gesture(o.kind === 'up' ? 'up' : o.kind === 'down' ? 'down' : 'tap', now + ms(fireIn) - 100);
          });
        }
      } else if (S1.mode === 'fight' && d1.F && !d1.F.over && !d1.F.cut) {
        const F = d1.F, W = F.W, Bo = F.B, E = window.__game.E;
        if (this.busyInput(now)) return;
        if (F.key === 'tosa' && F.phase === 2 && W.henki >= 1 && !W.busy) { plan('battoga' + Bo.token, () => this.gesture('arc', now + ms(P.react))); return; }
        const tele = Bo.tele;                                  // { kind, id, start } while an attack winds up / runs
        if (tele) {
          plan('t' + tele.id, () => {
            if (r() < P.miss) { this.stats.misses++; return; }
            const away = Math.sign(W.x - Bo.x) || -1, room = away > 0 ? 5.2 - W.x : W.x + 5.2;
            const delay = P.react + (r() - 0.5) * 2 * P.jit;
            if (tele.kind === 'charge') { this.pendingJump = { id: tele.id, after: now + ms(delay) }; }
            else this.gesture(room > 1.3 ? (away > 0 ? 'right' : 'left') : 'up', now + ms(delay));
          });
          if (this.pendingJump && this.pendingJump.id === tele.id && now >= this.pendingJump.after && Bo.threatT > 0 && Bo.threatT < 0.42 + this.prof.jit) { this.pendingJump = null; this.gesture('up', now); }
          return;
        }
        const M = F.mel;
        if (M && M.tele) { plan('m' + M.tele, () => { if (r() < P.miss) return; const away = Math.sign(W.x - M.x) || -1, room = away > 0 ? 5.2 - W.x : W.x + 5.2, tm = F.cfg.teleMel || 0.6; this.gesture(room > 1.3 ? (away > 0 ? 'right' : 'left') : 'up', now + ms(room > 1.3 ? P.react : Math.max(P.react, tm - 0.3))); }); return; }
        const melNear = M && M.active && Math.abs(M.x - W.x) < Math.abs(Bo.x - W.x);
        if (!W.busy && !melNear && now - this.lastBite > 1000 / P.bite) { this.lastBite = now; this.gesture('tap', now); }
        // GB card when ready and the boss is not open
        const c = document.querySelector('#cards .card.ready, #cards [data-id="gb"].ready');
        if (c && !Bo.open && r() < 0.01) c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })), c.click && c.click();
      } else if (S1.mode === 'leap') plan('leap', () => this.gesture('up', now + ms(P.react + 0.6)));
    },
  };
};

// ------------------------------------------------------------------ node side
const SECTIONS = ['opening', 'farmRun', 'tosa', 'sakura', 'townRun', 'blue', 'truck', 'ending'];
const results = [], tally = {};
const fail = (sec, msg) => { results.push({ sec, ok: false, msg }); console.log(`  FAIL [${sec}] ${msg}`); };
const pass = (sec, msg) => { results.push({ sec, ok: true, msg }); console.log(`  ok   [${sec}] ${msg}`); };

async function newPage(ctx, errs, tag) {
  const p = await ctx.newPage();
  p.on('pageerror', e => /decode audio/i.test(e.message) || errs.push(`[${tag}] PAGEERROR ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/decode audio|Failed to load resource|404|AudioContext|play\(\)/i.test(m.text())) errs.push(`[${tag}] ${m.text()}`); });
  await p.addInitScript(`window.__seed = ${SEED + Math.floor(Math.random() * 1e6)};`);
  await p.addInitScript(INIT);
  await p.addInitScript(() => { Element.prototype.requestFullscreen = undefined; });   // keep the window resizable (portrait test)
  return p;
}
const adv = (p, secs) => p.evaluate(([n, dt]) => window.__advance(n, dt), [Math.max(1, Math.round(secs * FPS)), 1000 / FPS]);
const st = p => p.evaluate(() => {
  const S1 = window.__S1 || {}, d1 = window.__game && window.__game.debug1, vis = id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); };
  return { t: window.__vt() / 1000, active: !!S1.active, mode: S1.mode, sec: S1.section, paused: !!S1.paused, cine: document.body.classList.contains('cine'),
    skipVis: vis('skipBtn'), defeat: vis('defeat'), result1: vis('result1'), menu: vis('menu'), pause: vis('pause'), loading: vis('loading'),
    tut: (() => { const e = document.getElementById('l1tut'); return e && e.classList.contains('on') ? e.textContent : ''; })(), sceneN: S1.sceneN, hp: d1 && d1.R && S1.mode === 'run' ? d1.R.hp : d1 && d1.F ? d1.F.W.hp : null, boss: d1 && d1.F ? Math.round(d1.F.B.hp) : null,
    l2: !!(window.__S && (window.__S.active || window.__S.cutscene)), saved: (() => { try { return localStorage.getItem('weed.p1.section'); } catch (_) { return null; } })() };
});
const click = (p, id) => p.evaluate(id => { const e = document.getElementById(id); if (!e || e.classList.contains('hidden') || getComputedStyle(e).display === 'none') return false; e.click(); return true; }, id);
async function shot(p, name) { if (!SHOTS) return; await p.evaluate(() => { window.__render = true; }); await adv(p, 2 / FPS); await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.evaluate(() => { window.__render = false; }); }

async function boot(p, query, sec = null) {
  await p.goto(BASE + query, { waitUntil: 'load' });
  for (let i = 0; i < 4000; i++) {
    await adv(p, 0.1);
    const ok = await p.evaluate(sec => !!(window.__S1 && window.__S1.active && window.__S1.mode && (sec === null || window.__S1.section === sec)), sec);
    if (ok) return true;
    await p.waitForTimeout(15);
  }
  return false;
}

// Drive the chapter from the current state until `stop(state)` is true. Skips each scene after `skipAfter` s with the
// Skip button. Returns the trail of modes. Fails on a mode stuck longer than its limit.
async function drive(p, tag, stop, { skipAfter = 1.2, maxT = 900, onMode } = {}) {
  let last = null, since = 0, trail = [], skipped = new Set(), sceneN = 0; const hpLog = {}; let lastTut = '', sinceReal = Date.now();
  const t0 = (await st(p)).t;
  for (;;) {
    await adv(p, 0.25);
    const s = await st(p);
    const key = `${s.sec}:${s.mode}` + (s.mode === 'scene' || s.mode === 'fightCut' ? '#' + s.sceneN : '');
    if (PERF && (s.mode === 'run' || s.mode === 'fight') && Math.floor(s.t * 2) % 3 === 0) {   // render one frame, read draw calls
      await p.evaluate(() => { window.__render = true; }); await adv(p, 2 / FPS);
      const k = await p.evaluate(() => { window.__render = false; const st = window.__game.E.stats || {}; return [st.calls || 0, st.tris || 0]; });
      const pk = perf[key] || (perf[key] = { n: 0, calls: 0, max: 0, tris: 0 }); pk.n++; pk.calls += k[0]; pk.max = Math.max(pk.max, k[0]); pk.tris = Math.max(pk.tris, k[1]);
    }
    if ((s.mode === 'run' || s.mode === 'fight') && s.hp != null) { hpLog[key] = Math.min(hpLog[key] ?? 99, s.hp); }
    if (key !== last && last && last.endsWith(':fight')) { const h = await p.evaluate(() => window.__game.debug1.F && window.__game.debug1.F.hits); if (h && h.length) console.log('     fight hits: ' + JSON.stringify(h)); }
    if (key !== last && last && last.endsWith(':run')) { const h = await p.evaluate(() => window.__game.debug1.R && window.__game.debug1.R.hits); if (h && h.length) console.log('     run hits: ' + JSON.stringify(h)); }
    if (key !== last) { last = key; since = s.t; sinceReal = Date.now(); trail.push(key); sceneN = s.sceneN; if (onMode) await onMode(s); await shot(p, `${tag}_${trail.length}_${s.sec}_${s.mode}`); }
    if (s.tut && s.tut !== lastTut) await shot(p, `${tag}_tut_${trail.length}_${s.tut.slice(0, 12).replace(/\W+/g, '_')}`);
    lastTut = s.tut;
    if (stop(s)) { if (Object.keys(hpLog).length) console.log('     min hearts left: ' + JSON.stringify(hpLog)); return { ok: true, trail, s }; }
    const dur = s.t - since;
    if ((s.mode === 'scene' || s.mode === 'fightCut') && dur > skipAfter && !skipped.has(sceneN)) {
      if (!s.skipVis) { fail(tag, `scene without a visible Skip button (${key})`); }
      skipped.add(sceneN); await click(p, 'skipBtn');
    }
    const limit = s.mode === 'scene' || s.mode === 'fightCut' ? skipAfter + 6 : s.mode === 'run' ? 60 : s.mode === 'fight' ? 240 : s.mode === 'leap' ? 12 : 20;
    if (!s.defeat && !s.result1 && dur > limit && Date.now() - sinceReal > 5000) {   // also 5 s of real time: assets/voice still loading is not "stuck"
       fail(tag, `stuck in ${key} for ${dur.toFixed(1)} s (trail ${trail.join(' > ')})`); return { ok: false, trail, s }; }
    if (s.t - t0 > maxT) { fail(tag, `timeout after ${maxT} s (trail ${trail.join(' > ')})`); return { ok: false, trail, s }; }
    if (s.defeat && !stop(s)) { return { ok: false, defeat: true, trail, s }; }
  }
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [];
  const list = SEL === 'all' ? SECTIONS.map((_, i) => i) : SEL === 'scen' ? [] : SEL.split(',').map(Number);
  const T0 = Date.now();

  // 1) every section with the chosen bot (wins expected), Skip used in every scene
  for (const sec of list.flatMap(x => Array(REPEAT).fill(x))) {
    const p = await newPage(ctx, errs, 's' + sec);
    const tStart = Date.now();
    if (!(await boot(p, `?level=1&section=${sec}&fixedres${PERF ? "&q=med" : "&lowfx"}${NOTUT ? "&notut" : ""}`, sec))) { fail(SECTIONS[sec], 'did not start'); await p.close(); continue; }
    await p.evaluate(b => window.__bot.setProfile(b), BOT);
    let retries = 0, r;
    for (;;) {
      r = await drive(p, SECTIONS[sec], s => s.sec !== sec || s.result1 || !s.active || s.defeat, {});
      if (!r.s.defeat || retries >= 4) break;
      retries++; console.log(`     defeat #${retries} (${r.trail.slice(-2).join(' > ')}) -> Retry`);
      await adv(p, 1); await click(p, 'retryBtn');
    }
    const s = r.s;
    tally[sec] = tally[sec] || { runs: 0, firstTry: 0, retries: 0 }; tally[sec].runs++; tally[sec].retries += retries; if (!retries && !s.defeat) tally[sec].firstTry++;
    if (s.defeat) {
      fail(SECTIONS[sec], `bot (${BOT}) lost ${retries + 1} times (trail ${r.trail.join(' > ')})`);
    } else if (retries && BOT === 'good') {
      fail(SECTIONS[sec], `good bot needed ${retries} retries`);
    } else if (r.ok) {
      const saved = s.saved;
      const nextOk = sec === 7 ? s.result1 : s.sec === sec + 1 && saved === String(sec + 1);
      if (nextOk) pass(SECTIONS[sec], `cleared in ${s.t.toFixed(0)} s game time (${((Date.now() - tStart) / 1000).toFixed(0)} s real); ${r.trail.join(' > ')}`);
      else fail(SECTIONS[sec], `ended in an unexpected state ${JSON.stringify(s)}`);
      if (sec === 7 && s.result1) {   // result screen -> Level 2
        await adv(p, 2);
        if (!(await click(p, 'nextBtn'))) fail('result', 'Continue: Level 2 button not clickable');
        let l2 = false; for (let i = 0; i < 300 && !l2; i++) { await adv(p, 0.2); l2 = (await st(p)).l2; if (!l2) await p.waitForTimeout(10); }
        l2 ? pass('result', 'Continue: Level 2 starts level 2') : fail('result', 'level 2 did not start');
        const p1done = await p.evaluate(() => localStorage.getItem('weed.p1done'));
        p1done === '1' ? pass('result', 'weed.p1done saved') : fail('result', 'weed.p1done not saved');
        await adv(p, 3);
      }
    }
    const stats = await p.evaluate(() => window.__bot.stats);
    console.log(`     bot gestures ${stats.gestures}, missed reads ${stats.misses}`);
    await p.close();
  }

  if (SEL === 'all' || SEL === 'scen') {
    // 2) defeat -> retry (run and fight): idle bot loses, Retry, good bot wins
    for (const sec of [1, 2]) {
      const p = await newPage(ctx, errs, 'retry' + sec);
      await boot(p, `?level=1&section=${sec}&fixedres${PERF ? "&q=med" : "&lowfx"}${NOTUT ? "&notut" : ""}`, sec);
      await p.evaluate(() => window.__bot.setProfile('idle'));
      let r = await drive(p, 'retry_' + SECTIONS[sec], s => s.defeat || s.sec !== sec);
      if (!r.s.defeat) { fail('retry_' + SECTIONS[sec], 'idle bot did not lose'); await p.close(); continue; }
      pass('retry_' + SECTIONS[sec], 'idle player loses -> defeat screen');
      await adv(p, 1.5);
      await click(p, 'retryBtn');
      await p.evaluate(() => window.__bot.setProfile('good'));
      r = await drive(p, 'retry_' + SECTIONS[sec], s => s.sec !== sec || s.defeat);
      r.s.sec === sec + 1 ? pass('retry_' + SECTIONS[sec], 'Retry restarts at the checkpoint and the section can be cleared') : fail('retry_' + SECTIONS[sec], 'after retry: ' + JSON.stringify(r.s));
      await p.close();
    }
    // 3) pause freezes, quit returns to the menu, the menu offers the checkpoint
    {
      const p = await newPage(ctx, errs, 'pause');
      await boot(p, `?level=1&section=4&fixedres&lowfx`);
      await p.evaluate(() => window.__bot.setProfile('good'));
      await drive(p, 'pause', s => s.mode === 'run');
      await adv(p, 2);
      await click(p, 'pauseBtn'); await adv(p, 0.2);
      const d0 = await p.evaluate(() => window.__game.debug1.R.d);
      await adv(p, 2);
      const d1 = await p.evaluate(() => window.__game.debug1.R.d);
      const s = await st(p);
      s.paused && s.pause && d0 === d1 ? pass('pause', 'pause screen shown, the run is frozen') : fail('pause', `paused=${s.paused} screen=${s.pause} d ${d0} -> ${d1}`);
      await click(p, 'resumeBtn'); await adv(p, 1);
      const d2 = await p.evaluate(() => window.__game.debug1.R.d);
      d2 > d1 ? pass('pause', 'resume continues') : fail('pause', 'resume did not continue');
      await click(p, 'pauseBtn'); await adv(p, 0.2); await click(p, 'quitBtn'); await adv(p, 1);
      const q = await st(p);
      !q.active && q.menu && !q.cine ? pass('quit', 'Main menu from pause returns to the menu') : fail('quit', JSON.stringify(q));
      // menu -> Prologue -> continue from the checkpoint (townRun)
      await p.evaluate(() => localStorage.removeItem('weed.prologue'));   // "The story so far" plays first and is skipped
      await click(p, 'prologueBtn');
      let off = false; for (let i = 0; i < 1200; i++) {
        await adv(p, 0.1);
        off = await p.evaluate(() => { const b = document.getElementById('l1cont'); return !!b && !b.closest('.hidden'); }); if (off) break;
        if (i % 20 === 10) await p.evaluate(() => { for (const b of document.querySelectorAll('button')) if (/^skip/i.test(b.textContent.trim()) && b.getClientRects().length && getComputedStyle(b).visibility !== "hidden") { b.click(); break; } });   // "The story so far" may play first
      }
      if (!off) console.log('     state: ' + await p.evaluate(() => JSON.stringify({ l1ck: !!document.getElementById('l1ck'), cls: document.body.className, S1: { a: window.__S1.active, m: window.__S1.mode, s: window.__S1.section }, saved: localStorage.getItem('weed.p1.section'), screens: [...document.querySelectorAll('.screen')].filter(e => !e.classList.contains('hidden')).map(e => e.id) })));
      if (!off) fail('checkpoint', 'no "Continue from checkpoint" offer after quitting at townRun');
      else {
        await click(p, 'l1cont');
        let ok = false; for (let i = 0; i < 400 && !ok; i++) { await adv(p, 0.1); const s2 = await st(p); ok = s2.active && s2.sec === 4; }
        ok ? pass('checkpoint', 'menu -> Prologue offers the checkpoint and resumes at townRun') : fail('checkpoint', 'did not resume at townRun');
      }
      await p.close();
    }
    // 4) portrait: rotate prompt + auto pause
    {
      const p = await newPage(ctx, errs, 'portrait');
      await boot(p, `?level=1&section=1&fixedres&lowfx`);
      await drive(p, 'portrait', s => s.mode === 'run');
      await p.setViewportSize({ width: 390, height: 844 }); await adv(p, 0.5);
      const r = await p.evaluate(() => ({ rot: getComputedStyle(document.getElementById('rotate')).display !== 'none', paused: window.__S1.paused }));
      r.rot && r.paused ? pass('portrait', 'rotate prompt shown and the run auto-pauses') : fail('portrait', JSON.stringify(r));
      await p.close();
    }
  }
  await browser.close();
  if (PERF) for (const [k, v] of Object.entries(perf)) console.log(`  perf ${k}: draw calls avg ${(v.calls / v.n).toFixed(0)}, max ${v.max}, max tris ${v.tris}`);
  if (REPEAT > 1 || BOT !== 'good') for (const [k, v] of Object.entries(tally)) console.log(`  ${SECTIONS[k]}: first-try wins ${v.firstTry}/${v.runs}, retries total ${v.retries}`);
  console.log(`\n${results.filter(r => r.ok).length} passed, ${results.filter(r => !r.ok).length} failed, ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  console.log(errs.length ? 'CONSOLE ERRORS:\n' + [...new Set(errs)].slice(0, 30).join('\n') : 'no console errors');
  process.exit(results.some(r => !r.ok) || errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
