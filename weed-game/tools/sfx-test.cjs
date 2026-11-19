// Äänitesti (Playwright): käynnistää pelin, avaa äänen napautuksella, ajaa taistelutoimintoja ja tarkistaa että
// sfx2_*-tiedostot latautuvat (ei 404 / konsolivirheitä) ja että tapahtumat laukeavat (audioStats.events).
// Käyttö: npm run build && (npx vite preview --port 4173 &) && node tools/sfx-test.cjs
const { chromium } = require('playwright');
const BASE = process.env.URL || 'http://localhost:4173/';
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  const sleep = ms => page.waitForTimeout(ms);
  // 1) sound test page
  await page.goto(BASE + '?soundtest');
  await page.waitForSelector('#soundtest button', { timeout: 60000 });
  const nBtn = await page.$$eval('#soundtest button[data-ev]', b => b.length);
  await page.click('#soundtest button[data-ev="bite"]');
  await sleep(2500);
  for (const ev of ['hit', 'boom', 'roar', 'step', 'cutin', 'spirit', 'ui', 'heli', 'rumble']) { await page.click(`#soundtest button[data-ev="${ev}"]`); await sleep(150); }
  await page.click('#soundtest button[data-amb="battle"]'); await sleep(1500);
  await page.click('#soundtest button#stLoadAll'); await sleep(8000);
  const st1 = await page.evaluate(() => { const a = window.__soundtest.audioStats; return { loaded: a.loaded.length, failed: a.failed, missing: a.missing, ev: Object.keys(a.events).length, mem: window.__soundtest.mem() }; });
  console.log('soundtest buttons', nBtn, JSON.stringify(st1));
  // 2) game
  await page.goto(BASE + '?phase=1&nointro');
  await page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 180000 });
  await page.mouse.click(5, 5); await sleep(3000);
  const d = 'window.__game.debug';
  for (let i = 0; i < 4; i++) { await page.evaluate(`${d}.bite()`); await sleep(700); }
  await page.evaluate(`${d}.dodge(1)`); await sleep(600);
  await page.evaluate(`${d}.jump()`); await sleep(1500);
  await page.evaluate(`${d}.fillHenki(); ${d}.battoga()`); await sleep(2500);
  await page.evaluate(`${d}.readyCards()`); await sleep(600);
  await page.evaluate(`${d}.card('jerome')`); await sleep(5000);
  await sleep(6000);
  const st2 = await page.evaluate(() => { const a = window.__game.audioStats; return { loaded: a.loaded.length, failed: a.failed, missing: a.missing, events: a.events }; });
  console.log('game', JSON.stringify(st2));
  console.log('http failures', failed.filter(u => !u.includes('/voice/')).slice(0, 20));
  console.log('errors', errors.slice(0, 20));
  await browser.close();
  process.exit(st2.failed.length || errors.some(e => e.includes('PAGEERROR')) ? 1 : 0);
})();
