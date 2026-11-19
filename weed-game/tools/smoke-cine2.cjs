// Skip test for the level 2 non-combat cutscenes: intro (skipped -> fight starts) and finale+post (skipped -> result screen).
// Fails on console errors. Usage: URL=http://localhost:4191/ node tools/smoke-cine2.cjs
const { chromium } = require('playwright');
const BASE = process.env.URL || 'http://localhost:4191/';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const errors = [];
  const open = async (q) => {
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' && !/decode audio|Failed to load resource/.test(m.text())) errors.push(q + ': ' + m.text()); });
    page.on('pageerror', e => errors.push(q + ': PAGEERROR ' + e.message));
    await page.goto(BASE + '?' + q);
    await page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 300000 });
    return page;
  };
  // intro: skip repeatedly until the fight is live
  let page = await open('level=2&noprologue&q=low');
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    const st = await page.evaluate(() => { const S = __game.debug.S; if (S.cutscene) __game.E.skipping = true; return { act: S.active, cut: S.cutscene }; });
    if (st.act && !st.cut) break;
    await page.waitForTimeout(1000);
  }
  console.log('intro skipped in', ((Date.now() - t0) / 1000).toFixed(0), 's');
  await page.close();
  // finale + post
  page = await open('phase=3&nointro&noprologue&q=low');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { __game.E.skipping = true; setTimeout(() => __game.debug.scene('finale'), 0); });
  const t1 = Date.now();
  while (Date.now() - t1 < 300000) {
    const done = await page.evaluate(() => { if (__game.debug.S.cutscene) __game.E.skipping = true; return !document.getElementById('result').classList.contains('hidden'); });
    if (done) break;
    await page.waitForTimeout(1000);
  }
  const vis = await page.evaluate(() => !document.getElementById('result').classList.contains('hidden'));
  console.log('result screen visible:', vis, 'after', ((Date.now() - t1) / 1000).toFixed(0), 's');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshots/cutscenes/result_screen.png' });
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
  process.exit(errors.length || !vis ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
