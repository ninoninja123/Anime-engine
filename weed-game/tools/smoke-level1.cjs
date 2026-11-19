// Quick smoke test of the Prologue chapter: every section via ?level=1&section=N, skips scenes, wins runs/fights via
// debug hooks, fails on console errors. Usage: URL=http://localhost:4187/ node tools/smoke-level1.cjs [sections, e.g. 0,2,5]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.URL || 'http://localhost:4187/';
const OUT = path.join(__dirname, '..', 'screenshots', 'prologue_level');
const LIST = (process.argv[2] || '0,1,2,3,4,5,6,7').split(',').map(Number);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errors = [];
  for (const sec of LIST) {
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' && !/decode audio/.test(m.text())) errors.push(`[s${sec}] ` + m.text()); });
    page.on('pageerror', e => /decode audio/.test(e.message) || errors.push(`[s${sec}] PAGEERROR ` + e.message));
    await page.goto(BASE + `?level=1&section=${sec}`);
    await page.waitForFunction(s => window.__S1 && window.__S1.active && window.__S1.section === s, sec, { timeout: 200000 });
    const t0 = Date.now(); let shots = 0, lastMode = '';
    // drive the section until it moves on (or 240 s)
    while (Date.now() - t0 < 240000) {
      const st = await page.evaluate(() => ({ sec: window.__S1.section, mode: window.__S1.mode, active: window.__S1.active, done: !document.getElementById('result1').classList.contains('hidden') }));
      if (st.sec !== sec || st.done || !st.active) break;
      if (st.mode !== lastMode) {
        lastMode = st.mode;
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(OUT, `smoke_s${sec}_${++shots}_${st.mode}.png`) });
        console.log(`section ${sec}: ${st.mode}`);
      }
      if (st.mode === 'scene' || st.mode === 'fightCut') await page.evaluate(() => { window.__game.E.skipping = true; });
      if (st.mode === 'run') await page.evaluate(() => window.__game.debug1.winRun());
      if (st.mode === 'fight') await page.evaluate(() => { const F = window.__game.debug1.F; window.__game.debug1.bossTo(F.phase === 1 ? 50 : 10); if (F.key === 'tosa' && F.phase === 2 && !F.W.busy) window.__game.debug1.battoga(); });
      if (st.mode === 'leap') await page.evaluate(() => window.__game.debug1.leap());
      await page.waitForTimeout(700);
    }
    console.log(`section ${sec} done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await page.close();
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
