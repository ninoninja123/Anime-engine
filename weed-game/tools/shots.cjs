// Playwright-savutesti + kuvakaappaukset (mobiili vaaka 844x390, DPR 2).
// Käyttö: npm run build && (npx vite preview --port 4173 &) && node tools/shots.cjs
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.URL || 'http://localhost:4173/';
const OUT = path.join(__dirname, '..', 'screenshots');
const only = process.argv[2] || 'all';

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  const shot = async n => { await page.screenshot({ path: path.join(OUT, n + '.png') }); console.log('shot', n); };
  const sleep = ms => page.waitForTimeout(ms);
  const ready = async () => page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 60000 });

  if (only === 'all' || only === 'menu') {
    await page.goto(BASE); await ready(); await sleep(1500);
    await shot('01_menu');
    await page.tap('#castBtn'); await sleep(2600); await shot('02_lauma_weed');
    await page.evaluate(() => window.__game.showCast(6)); await sleep(5200); await shot('03_lauma_kaibutsu');
    await page.evaluate(() => window.__game.showCast(2)); await sleep(1500); await shot('04_lauma_smith');
  }
  if (only === 'all' || only === 'intro') {
    await page.goto(BASE); await ready(); await sleep(500);
    await page.tap('#startBtn'); await sleep(2500); await shot('05_intro_title');
    await sleep(6500); await shot('06_intro_kaibutsu');
    await sleep(4000); await shot('07_intro_dialog');
  }
  if (only === 'all' || only === 'battle') {
    await page.goto(BASE + '?phase=1&nointro'); await ready(); await sleep(2500);
    await shot('08_battle');
    // eleitä: napautus (purenta), pyyhkäisy, hyppy
    for (let i = 0; i < 4; i++) { await page.mouse.click(420, 200); await sleep(700); }
    await shot('09_battle_bite');
    await page.mouse.move(400, 250); await page.mouse.down(); await page.mouse.move(400, 120, { steps: 5 }); await page.mouse.up();
    await sleep(250); await shot('10_battle_jump');
    await page.evaluate(() => window.__game.debug.S.cards.forEach(c => { if (c.state === 'cooldown') c.cool = 0; }));
    await sleep(200);
    await page.tap('.card[data-id="jerome"]', { force: true }); await sleep(1300); await shot('11_battle_weakspot');
    await page.evaluate(() => window.__game.debug.fillHenki()); await sleep(300);
    // kaaren piirto = Battōga
    await page.mouse.move(300, 280); await page.mouse.down();
    for (let a = 0; a <= 300; a += 20) { const r = a * Math.PI / 180; await page.mouse.move(420 + Math.cos(r) * 110, 200 + Math.sin(r) * 80); }
    await page.mouse.up(); await sleep(350); await shot('12_battle_battoga');
    await sleep(1500);
    await page.evaluate(() => window.__game.debug.smith()); await sleep(800); await shot('13_battle_armor_smithcard');
    await page.tap('.card[data-id="smith"]', { force: true }); await sleep(9000); await shot('14_smith_run');
    await sleep(4200); await shot('15_smith_rockslide');
    await sleep(5000); await shot('16_smith_memory');
    await page.waitForFunction(() => window.__game.debug.S.phase === 2 && !window.__game.debug.S.cutscene, null, { timeout: 60000 });
    await sleep(1500); await shot('17_phase2');
    await page.evaluate(() => window.__game.debug.arrows()); await sleep(4500); await shot('18_arrows_title');
    await sleep(9000); await shot('19_arrows_strike');
    await page.waitForFunction(() => window.__game.debug.S.phase === 3 && !window.__game.debug.S.cutscene, null, { timeout: 90000 });
    await sleep(1200); await shot('20_phase3_prompt');
    await page.mouse.move(300, 280); await page.mouse.down();
    for (let a = 0; a <= 300; a += 20) { const r = a * Math.PI / 180; await page.mouse.move(420 + Math.cos(r) * 110, 200 + Math.sin(r) * 80); }
    await page.mouse.up(); await sleep(1300); await shot('21_finale_battoga');
    await sleep(6000); await shot('22_finale_fall');
    await sleep(6000); await shot('23_finale_dawn');
    await page.waitForFunction(() => !document.getElementById('result').classList.contains('hidden'), null, { timeout: 90000 });
    await sleep(800); await shot('24_result');
  }
  if (only === 'portrait') {
    const p2 = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p2.goto(BASE); await sleep(3000); await p2.screenshot({ path: path.join(OUT, '00_portrait_rotate.png') });
  }
  const fps = await page.evaluate(() => window.__game && window.__game.E.fps).catch(() => null);
  console.log('fps (swiftshader, ei kuvaava):', fps && fps.toFixed(1));
  console.log('ERRORS:', errors.length ? errors.join('\n') : 'ei virheitä');
  await browser.close();
})();
