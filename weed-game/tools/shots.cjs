// Playwright smoke test + screenshots (mobile landscape 844x390, DPR 2).
// Usage: npm run build && (npx vite preview --port 4173 &) && node tools/shots.cjs [all|menu|gallery|intro|battle|specials|story|live]
//        URL=https://weed-game.huone-k7q2.workers.dev/ node tools/shots.cjs live
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.URL || 'http://localhost:4173/';
const OUT = path.join(__dirname, '..', 'screenshots');
const only = process.argv[2] || 'all';
const want = k => only === 'all' || only === k;
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure() || {}).errorText));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  const shot = async n => { await page.screenshot({ path: path.join(OUT, n + '.png') }); console.log('shot', n); };
  const sleep = ms => page.waitForTimeout(ms);
  const ready = async () => page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 120000 });
  const go = async q => { await page.goto(BASE + (q || '')); await ready(); await sleep(800); await page.mouse.click(5, 5); };
  // headless swiftshader renders slowly -> wait for subtitles / states instead of fixed delays
  const waitSub = (txt, ms = 300000) => page.waitForFunction(t => {
    const s = document.getElementById('sub'), c = document.getElementById('caption');
    return (!s.classList.contains('hidden') && s.textContent.includes(t)) || (!c.classList.contains('hidden') && c.textContent.includes(t));
  }, txt, { timeout: ms, polling: 100 });
  const waitS = (fn, ms = 300000) => page.waitForFunction(fn, null, { timeout: ms, polling: 150 });
  const noSpecial = () => waitS(() => !window.__game.debug.S.special, 60000);

  if (want('menu')) {
    await go(''); await sleep(1200); await shot('01_menu');
  }
  if (want('gallery')) {
    await go('');
    await page.tap('#castBtn');
    await waitS(() => window.__game.gallery.loaded, 120000); await sleep(2500);
    const n = await page.evaluate(() => window.__game.ROSTER.length);
    for (let i = 0; i < n; i++) {
      await page.evaluate(i => window.__game.showCast(i), i); await sleep(i === 0 ? 2500 : 1600);
      const id = await page.evaluate(i => window.__game.ROSTER[i], i);
      await shot(`02_pack_${String(i + 1).padStart(2, '0')}_${id}`);
    }
  }
  if (want('intro')) {
    await go('?play=1');
    await waitSub('LEVEL 2'); await sleep(1500); await shot('05_intro_title');
    await waitSub('fallen to a monster'); await shot('06_intro_narration');
    await waitSub('all I can smell'); await shot('07_intro_ken_kagetora');
    await waitSub('my father'); await sleep(800); await shot('08_intro_vow');
    await waitSub('Forgive our delay'); await shot('09_intro_jerome');
    await waitSub('deafening roar'); await sleep(600); await shot('10_intro_kaibutsu');
    await waitSub('Let\'s go'); await shot('11_intro_go');
  }
  if (want('battle') || want('specials') || want('story')) {
    await go('?phase=1&nointro'); await sleep(2000);
    await shot('12_battle');
    for (let i = 0; i < 3; i++) { await page.mouse.click(420, 200); await sleep(500); }
    await shot('13_battle_bite');
    await page.mouse.move(400, 250); await page.mouse.down(); await page.mouse.move(400, 120, { steps: 5 }); await page.mouse.up();
    await sleep(250); await shot('14_battle_jump');
    if (want('specials') || only === 'all' || want('story')) {
      // special move: Jerome (cut-in -> close-up -> weak spot reticle)
      await page.evaluate(() => window.__game.debug.readyCards()); await sleep(300);
      await page.tap('.card[data-id="jerome"]', { force: true });
      await sleep(250); await shot('15_special_jerome_cutin');
      await waitSub('Left flank'); await shot('16_special_jerome_closeup');
      await sleep(1600); await shot('17_special_jerome_reticle');
      await noSpecial();
      // special move: Ken & Kagetora Twin Fang
      await page.evaluate(() => window.__game.debug.readyCards()); await sleep(300);
      await page.tap('.card[data-id="kenkage"]', { force: true });
      await sleep(250); await shot('18_special_twinfang_cutin');
      await sleep(1600); await shot('19_special_twinfang_strike');
      await noSpecial();
      // Battōga (draw a circle)
      await page.evaluate(() => window.__game.debug.fillHenki()); await sleep(300);
      await page.mouse.move(300, 280); await page.mouse.down();
      for (let a = 0; a <= 300; a += 20) { const r = a * Math.PI / 180; await page.mouse.move(420 + Math.cos(r) * 110, 200 + Math.sin(r) * 80); }
      await page.mouse.up(); await sleep(400); await shot('20_battle_battoga');
      await sleep(1500);
    }
    if (want('story')) {
      await page.evaluate(() => window.__game.debug.smith()); await sleep(800); await shot('21_armor_smithcard');
      await page.tap('.card[data-id="smith"]', { force: true });
      await waitSub('Leave this to me'); await shot('22_smith_cliff');
      await waitSub('Live, Weed'); await shot('23_smith_leap');
      await waitSub('SMITH!!'); await sleep(300); await shot('24_smith_scream');
      await waitSub('Smith', 240000); await page.waitForFunction(() => document.getElementById('caption').textContent === 'Smith' && !document.getElementById('caption').classList.contains('hidden'), null, { timeout: 240000 }); await shot('25_smith_memory');
      await waitSub('not given in vain'); await shot('26_smith_rises');
      await waitS(() => window.__game.debug.S.phase === 2 && !window.__game.debug.S.cutscene);
      await sleep(1500); await shot('27_phase2');
      await page.evaluate(() => window.__game.debug.arrows());
      await waitSub('FOUR ARROWS'); await shot('28_arrows_title');
      await waitSub('We go together'); await shot('29_arrows_heuler');
      await waitSub('it was an honor'); await shot('30_arrows_robert_falls');
      await waitSub('is ME'); await shot('31_arrows_jerome');
      await waitSub('Thank you, my comrades'); await sleep(2000); await shot('32_arrows_spirits');
      await waitS(() => window.__game.debug.S.phase === 3 && !window.__game.debug.S.cutscene);
      await sleep(1200); await shot('33_phase3_prompt');
      await page.mouse.move(300, 280); await page.mouse.down();
      for (let a = 0; a <= 300; a += 20) { const r = a * Math.PI / 180; await page.mouse.move(420 + Math.cos(r) * 110, 200 + Math.sin(r) * 80); }
      await page.mouse.up();
      await waitSub('BATTŌGA'); await sleep(1800); await shot('34_finale_battoga');
      await waitSub('Don\'t let go'); await shot('35_finale_falls');
      await waitSub('swallowed everything'); await shot('36_finale_mist');
      await waitSub('You alive'); await shot('37_dawn');
      await waitSub('never chose this'); await shot('38_dawn_kaibutsu');
      await waitSub('And yet I live'); await shot('39_jerome_guilt');
      await waitSub('carved into the wind'); await sleep(1500); await shot('40_memorial');
      await waitSub('Father'); await shot('41_hope');
      await waitS(() => !document.getElementById('result').classList.contains('hidden'));
      await sleep(800); await shot('42_result');
    }
  }
  if (only === 'portrait') {
    const p2 = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p2.goto(BASE); await sleep(3000); await p2.screenshot({ path: path.join(OUT, '00_portrait_rotate.png') });
  }
  if (only === 'live') {
    // live deployment check: page, models, audio (decoded through WebAudio after a tap)
    await go(''); await sleep(1500);
    await page.tap('#castBtn'); await waitS(() => window.__game.gallery.loaded, 120000); await sleep(2000);
    await shot('live_pack');
    await page.evaluate(() => window.__game.showMenu()); await sleep(500);
    await page.tap('#startBtn');
    await waitS(() => window.__game.audioStats.loaded.length >= 10, 90000).catch(() => {});
    await sleep(4000); await shot('live_intro');
    const st = await page.evaluate(() => ({ loaded: window.__game.audioStats.loaded, failed: window.__game.audioStats.failed, music: window.__game.currentMusic() }));
    console.log('AUDIO loaded:', st.loaded.length, st.loaded.join(', '));
    console.log('AUDIO failed:', st.failed.join(', ') || 'none', '| music now:', st.music);
  }
  const fps = await page.evaluate(() => window.__game && window.__game.E.fps).catch(() => null);
  console.log('fps (swiftshader, not representative):', fps && fps.toFixed(1));
  console.log('FAILED REQUESTS:', failed.length ? failed.join('\n') : 'none');
  console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
