// Grafiikan kuvakaappaukset (ennen/jälkeen-vertailu) -> screenshots/gfx/<prefix>_<nimi>.png
// Käyttö: node tools/gfx-shots.cjs <prefix> [scene,scene...] [--q=low|med|high] [--url=http://localhost:4173/]
// Kohtaukset: menu,cast,intro,battle,battoga,rage,sacrifice,phase2,arrows,phase3,finale  (oletus: kaikki)
// Odotukset on sidottu pelin omaan kelloon ja tilaan (ei teksteihin), joten hidas ohjelmistorenderöinti ei haittaa.
const { chromium } = require('playwright');
const path = require('path');
const args = process.argv.slice(2);
const prefix = args[0] || 'after';
const want = (args[1] && !args[1].startsWith('--')) ? args[1].split(',') : ['menu', 'cast', 'battle', 'battoga', 'rage', 'sacrifice', 'phase2', 'arrows', 'phase3', 'finale'];
const opt = k => { const a = args.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : null; };
const BASE = opt('url') || process.env.URL || 'http://localhost:4173/';
const q = opt('q');
const OUT = path.join(__dirname, '..', 'screenshots', 'gfx');
const qs = extra => `?${[extra, q ? (q === 'low' ? 'lowfx' : q === 'high' ? 'hq' : 'q=med') : ''].filter(Boolean).join('&')}`;

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: Number(opt('dpr') || 2), isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  const ignore = /fonts\.g|ERR_|Failed to load resource|decode audio/;
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => { if (!ignore.test(e.message)) errors.push('PAGEERROR ' + e.message); });
  const shot = async n => { await page.screenshot({ path: path.join(OUT, `${prefix}_${n}.png`) }); console.log('shot', n); };
  const ready = async () => page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 90000 });
  const open = async extra => { await page.goto(BASE + qs(extra)); await ready(); };
  const waitS = (fn, arg, ms = 400000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 150 });
  const gameT = () => page.evaluate(() => window.__game.E.realTime);
  const waitGame = async s => { const t0 = await gameT(); await waitS(t => window.__game.E.realTime > t, t0 + s); };
  const arc = async () => { await page.mouse.move(300, 280); await page.mouse.down(); for (let a = 0; a <= 300; a += 20) { const r = a * Math.PI / 180; await page.mouse.move(420 + Math.cos(r) * 110, 200 + Math.sin(r) * 80); } await page.mouse.up(); };
  const has = s => want.includes(s);

  if (has('menu')) { await open(''); await waitGame(2.5); await shot('01_menu'); }
  if (has('cast')) { await open(''); await page.evaluate(() => window.__game.showCast(Math.max(0, window.__game.ROSTER.indexOf('kaibutsu')))); await waitS(() => window.__game.gallery.loaded); await waitGame(4); await shot('03_lauma_kaibutsu'); }
  if (has('intro')) {
    await open('play=1'); await waitS(() => window.__S && window.__S.cutscene); await waitGame(2.6); await shot('05_intro_wide');
    await waitGame(9); await shot('06_intro_later');
  }
  if (has('battle') || has('battoga') || has('rage') || has('sacrifice')) {
    await open('phase=1&nointro'); await waitGame(3);
    if (has('battle')) {
      await shot('08_battle');
      await page.mouse.click(420, 200); await waitGame(0.42); await shot('09_bite');
      await waitGame(1.5);
    }
    if (has('battoga')) {
      await page.evaluate(() => window.__game.debug.fillHenki()); await waitGame(0.3);
      await arc(); await waitGame(0.38); await shot('12_battle_battoga'); await waitGame(0.12); await shot('12b_battoga_hit');
      await waitGame(2);
    }
    if (has('rage') || has('sacrifice')) {
      await page.evaluate(() => window.__game.debug.smith()); await waitGame(2.5); await shot('13_rage');
    }
    if (has('sacrifice')) {
      await page.evaluate(() => window.__game.debug.sacrifice());
      await waitS(() => window.__game.E.timeScale > 0.5 && window.__game.E.timeScale < 0.6); await waitGame(1.1); await shot('14_rockslide');
      await waitS(() => window.__game.E.mood.name === 'grief'); await waitGame(2.2); await shot('16_smith_memory');
      await waitS(() => window.__S.phase === 2 && !window.__S.cutscene);
    }
  }
  if (has('phase2') || has('arrows')) {
    await open('phase=2&nointro'); await waitGame(4);
    if (has('phase2')) await shot('17_phase2');
    if (has('arrows')) {
      await page.evaluate(() => window.__game.debug.arrows());
      await waitS(() => window.__game.E.post.speed > 0.4); await shot('19_arrow_strike');
      await waitS(() => window.__game.E.mood.name === 'spirit'); await waitGame(2.0); await shot('19c_arrows_spirits');
    }
  }
  if (has('phase3') || has('finale')) {
    await open('phase=3&nointro'); await waitGame(3.5);
    if (has('phase3')) await shot('20_phase3');
    if (has('finale')) {
      await page.evaluate(() => window.__game.debug.finale());
      await waitS(() => window.__game.E.mood.name === 'finale'); await waitGame(1.0); await shot('21_finale_battoga');
      await waitS(() => !window.__game.cast.kaibutsu.root.visible || window.__game.cast.kaibutsu.root.position.y < -2); await shot('22_finale_fall');
      await waitS(() => window.__game.E.mood.name === 'dawn'); await waitGame(5.5); await shot('23_finale_dawn');
      await waitS(() => window.__game.E.mood.name === 'memorial'); await waitGame(3.2); await shot('23b_memorial');
      await waitS(() => !document.getElementById('result').classList.contains('hidden')); await waitGame(1); await shot('24_result');
    }
  }
  const info = await page.evaluate(() => { const E = window.__game.E; return { fps: E.fps, tier: E.quality.tier, scale: E.quality.scale, stats: E.stats, gpu: E.quality.gpu }; }).catch(() => null);
  console.log('INFO', JSON.stringify(info));
  console.log('ERRORS:', errors.length ? errors.join('\n') : 'ei virheitä');
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
