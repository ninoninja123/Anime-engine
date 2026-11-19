// Console error / warning sweep over the test URLs, plus checks that Skip ends every cutscene and that a hidden tab
// pauses the fight. Usage: URL=http://localhost:4187/ node tools/console-check.cjs [extra ?query ...]
const { chromium } = require('playwright');
const BASE = process.env.URL || 'http://localhost:4187/';
const IGNORE = /decode audio|GPU stall|GL Driver Message|Automatic fallback to software WebGL/i;
const URLS = ['', '?phase=2&nointro', '?phase=3&nointro', '?level=2&noprologue', '?prologue', '?lowfx&phase=2&nointro', '?q=med&phase=2&nointro', '?hq&phase=2&nointro',
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(n => `?level=1&section=${n}`), ...process.argv.slice(2)];

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const out = [];
  for (const q of URLS) {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const msgs = [];
    page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !IGNORE.test(m.text())) msgs.push(m.type() + ': ' + m.text().slice(0, 200)); });
    page.on('pageerror', e => { if (!IGNORE.test(e.message)) msgs.push('PAGEERROR ' + e.message.slice(0, 200)); });
    const notes = [];
    try {
      await page.goto(BASE + q);
      await page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 300000 });
      await page.waitForTimeout(4000);
      // a cutscene (3D or the illustrated prologue) must expose a visible Skip and end when it is pressed
      const cine = await page.evaluate(() => document.body.classList.contains('cine') || document.body.classList.contains('prologue'));
      if (cine) {
        const skipVis = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /skip/i.test(b.textContent) && (b.offsetParent !== null || (getComputedStyle(b).position === "fixed" && getComputedStyle(b).display !== "none" && !b.classList.contains("hidden")))));
        notes.push('skip button ' + (skipVis ? 'visible' : 'MISSING'));
        for (let i = 0; i < 12; i++) {
          const still = await page.evaluate(() => document.body.classList.contains('cine') || document.body.classList.contains('prologue'));
          if (!still) break;
          await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /skip/i.test(b.textContent) && (b.offsetParent !== null || (getComputedStyle(b).position === "fixed" && getComputedStyle(b).display !== "none" && !b.classList.contains("hidden")))); if (b) b.click(); else window.__game.E.skipping = true; });
          await page.waitForTimeout(2500);
        }
        const ended = await page.evaluate(() => !document.body.classList.contains('prologue'));
        notes.push(ended ? 'skip ok' : 'SKIP STUCK');
      }
      // hidden tab while fighting -> pause screen
      const fighting = await page.evaluate(() => (window.__S && window.__S.active && !window.__S.cutscene && !window.__S.special) || (window.__S1 && window.__S1.active && (window.__S1.mode === 'fight' || window.__S1.mode === 'run')));
      if (fighting) {
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
        await page.waitForTimeout(300);
        const paused = await page.evaluate(() => !document.getElementById('pause').classList.contains('hidden'));
        notes.push(paused ? 'hidden tab pauses' : 'hidden tab NOT paused');
        await page.evaluate(() => { delete document.hidden; delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); });
      }
      await page.waitForTimeout(1500);
    } catch (e) { msgs.push('TIMEOUT/ERR ' + e.message.slice(0, 120)); }
    const line = `${q || '(menu)'}: ${msgs.length ? [...new Set(msgs)].join(' || ') : 'clean'}${notes.length ? ' [' + notes.join(', ') + ']' : ''}`;
    console.log(line); out.push(line);
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
