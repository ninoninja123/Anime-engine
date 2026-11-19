// Level 3 tests (Playwright). Two modes:
//   smoke [sections]  – every section via ?level=3&section=N: skips scenes (Skip button path: E.skipping), wins fights with
//                       debug hooks, screenshots each mode change, fails on console errors.
//                       URL=http://localhost:4187/ node tools/shots-level3.cjs smoke 0,1,5
//   frames <section> [everyS] [maxS] – virtual clock (as tools/cine-capture.cjs): plays the section's scene in deterministic
//                       game time and saves a frame every `everyS` seconds -> screenshots/level3/<section>/NNN.jpg; then
//                       builds a contact sheet screenshots/level3/sheet_<section>.jpg (needs ffmpeg).
//   fight            – plays the first stand wave with scripted gestures (tap/swipe/Spirit), screenshots.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), cp = require('child_process');
const BASE = process.env.URL || 'http://localhost:4187/';
const OUT = path.join(__dirname, '..', 'screenshots', 'level3');
const MODE = process.argv[2] || 'smoke';
fs.mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'];
const IGNORE = /decode audio|404|Failed to load resource|net::ERR/;

async function smoke() {
  const LIST = (process.argv[3] || '0,1,2,3,4,5,6,7').split(',').map(Number);
  const browser = await chromium.launch({ args: ARGS });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errors = [];
  for (const sec of LIST) {
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(`[s${sec}] ` + m.text()); });
    page.on('pageerror', e => IGNORE.test(e.message) || errors.push(`[s${sec}] PAGEERROR ` + e.message));
    await page.goto(BASE + `?level=3&section=${sec}`);
    await page.waitForFunction(s => window.__S3 && window.__S3.active && window.__S3.section === s, sec, { timeout: 240000 });
    const t0 = Date.now(); let shots = 0, lastMode = '', lastWave = -1;
    while (Date.now() - t0 < 300000) {
      const st = await page.evaluate(() => ({ sec: window.__S3.section, mode: window.__S3.mode, wave: window.__S3.wave, active: window.__S3.active, done: !document.getElementById('result3').classList.contains('hidden') }));
      if (st.done) { await page.screenshot({ path: path.join(OUT, `smoke_s${sec}_result.png`) }); break; }
      if (st.sec !== sec || !st.active) break;
      if (st.mode !== lastMode || st.wave !== lastWave) {
        lastMode = st.mode; lastWave = st.wave;
        await page.waitForTimeout(st.mode === 'fight' ? 2500 : 1500);
        await page.screenshot({ path: path.join(OUT, `smoke_s${sec}_${++shots}_${st.mode}_w${st.wave}.png`) });
        console.log(`section ${sec}: ${st.mode} (wave ${st.wave})`);
      }
      if (st.mode === 'scene') await page.evaluate(() => { const b = document.getElementById('skipBtn'); if (b && !b.classList.contains('hidden')) b.click(); else window.__game.E.skipping = true; });
      if (st.mode === 'fight') await page.evaluate(() => window.__game.debug3.winWave());
      await page.waitForTimeout(600);
    }
    console.log(`section ${sec} done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await page.close();
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
}

async function virtualPage(url) {
  const b = await chromium.launch({ args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !IGNORE.test(m.text()) && errs.push(m.text()));
  await p.addInitScript(() => {
    let now = 1000, id = 0; const cbs = [];
    performance.now = () => now; Date.now = () => 1.7e12 + now;
    window.requestAnimationFrame = cb => { cbs.push(cb); return ++id; }; window.cancelAnimationFrame = () => {};
    const st = window.setTimeout.bind(window); const timers = [];
    window.setTimeout = (fn, ms = 0, ...a) => { timers.push({ at: now + ms, fn: () => fn(...a) }); return timers.length; };
    window.__advance = dt => { now += dt; for (let i = timers.length - 1; i >= 0; i--) if (timers[i] && timers[i].at <= now) { const t = timers[i]; timers.splice(i, 1); try { t.fn(); } catch (e) { console.error(e); } } const l = cbs.splice(0); for (const cb of l) cb(now); };
    window.__realTimeout = st;
  });
  await p.goto(url, { waitUntil: 'load' });
  return { b, p, errs };
}
async function advanceUntil(p, pred, maxFrames = 9000) {
  for (let i = 0; i < maxFrames; i++) {
    await p.evaluate(() => window.__advance(33.3));
    if (i % 10 === 0 && await p.evaluate(pred)) return true;
    if (i % 30 === 0) await p.waitForTimeout(5);
  }
  return false;
}

async function frames() {
  const secName = process.argv[3] || 'trap';
  const every = +(process.argv[4] || 0.5), maxS = +(process.argv[5] || 140);
  const dir = path.join(OUT, secName); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const { b, p, errs } = await virtualPage(BASE + `?level=3&section=${secName}&fixedres&cb=${Date.now()}`);
  await advanceUntil(p, () => window.__S3 && window.__S3.active && window.__S3.mode === 'scene');
  let n = 0, t = 0, step = 1000 / 30, next = 0, doneFor = 0;
  while (t < maxS) {
    await p.evaluate(dt => window.__advance(dt), step); t += step / 1000;
    if (t >= next) {
      next += every;
      await p.screenshot({ path: path.join(dir, String(n++).padStart(3, '0') + '.jpg'), type: 'jpeg', quality: 80 });
      const st = await p.evaluate(() => ({ m: window.__S3.mode, d: window.__S3.sceneDone }));
      if (st.m !== 'scene' || st.d) { doneFor++; if (doneFor > 2) break; }
    }
  }
  console.log(`${secName}: ${n} frames, ${t.toFixed(1)} s game time; errors ${JSON.stringify(errs.slice(0, 5))}`);
  await b.close();
  try {
    const cols = 8, rows = Math.ceil(n / cols);
    cp.execSync(`ffmpeg -y -loglevel error -framerate 1 -i ${dir}/%03d.jpg -vf "scale=211:-1,tile=${cols}x${rows}:padding=2" -frames:v 1 ${path.join(OUT, 'sheet_' + secName + '.jpg')}`);
    console.log('sheet', path.join(OUT, 'sheet_' + secName + '.jpg'));
  } catch (e) { console.log('no ffmpeg sheet:', e.message.split('\n')[0]); }
  process.exit(errs.length ? 1 : 0);
}

async function fight() {
  const dir = path.join(OUT, 'fight'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const { b, p, errs } = await virtualPage(BASE + `?level=3&section=stand&fixedres&cb=${Date.now()}`);
  await advanceUntil(p, () => window.__S3 && window.__S3.active && (window.__S3.mode === 'scene' || window.__S3.mode === 'fight'));
  // the stand section starts straight with wave 1
  await advanceUntil(p, () => window.__S3.mode === 'fight');
  const plan = [];
  for (let i = 0; i < 360; i++) plan.push(i % 9 === 0 ? { type: 'tap' } : i % 31 === 0 ? { type: 'swipe', dir: 'left' } : i % 47 === 0 ? { type: 'swipe', dir: 'up' } : null);
  let n = 0;
  for (let i = 0; i < plan.length; i++) {
    if (plan[i]) await p.evaluate(g => window.__game.debug3.gesture(g), plan[i]);
    if (i === 120) await p.evaluate(() => window.__game.debug3.fillHenki());
    if (i === 130) await p.evaluate(() => window.__game.debug3.fang());
    if (i === 60) await p.evaluate(() => { const c = document.querySelector('#cards .card'); if (c) c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    for (let k = 0; k < 3; k++) await p.evaluate(() => window.__advance(33.3));
    if (i % 12 === 0) await p.screenshot({ path: path.join(dir, String(n++).padStart(3, '0') + '.jpg'), type: 'jpeg', quality: 80 });
    const m = await p.evaluate(() => window.__S3.mode);
    if (m !== 'fight') break;
  }
  const st = await p.evaluate(() => { const H = window.__game.debug3.H; return H ? { hp: H.J.hp, defeated: H.defeated, queue: H.queue.length, foes: H.foes.map(f => [f.type, f.state, +f.x.toFixed(2)]) } : null; });
  console.log('fight state', JSON.stringify(st), 'errors', JSON.stringify(errs.slice(0, 5)));
  await b.close();
  try { cp.execSync(`ffmpeg -y -loglevel error -framerate 1 -i ${dir}/%03d.jpg -vf "scale=211:-1,tile=6x${Math.ceil(n / 6)}:padding=2" -frames:v 1 ${path.join(OUT, 'sheet_fight.jpg')}`); } catch (_) {}
  process.exit(errs.length ? 1 : 0);
}

({ smoke, frames, fight }[MODE] || smoke)().catch(e => { console.error(e); process.exit(1); });
