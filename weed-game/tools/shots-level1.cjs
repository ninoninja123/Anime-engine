// Playwright: play through the Prologue chapter (level 1) and screenshot every scene / playable section.
// Usage: npm run build && (npx vite preview --port 4187 --strictPort &) && URL=http://localhost:4187/ node tools/shots-level1.cjs [full|fast] [fromSection]
//   full = waits through every scene (subtitles timed, ~10+ min headless); fast = skips each scene after its screenshots.
// Output: screenshots/prologue_level/*.png (844x390, DPR 2). Fails (exit 1) on console errors.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.URL || 'http://localhost:4187/';
const OUT = path.join(__dirname, '..', 'screenshots', 'prologue_level');
const MODE = process.argv[2] || 'fast';
const FROM = Number(process.argv[3] || 0);
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() >= 400 && !/audio\//.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  let n = 0;
  const shot = async name => { n++; const f = `${String(n).padStart(2, '0')}_${name}.png`; await page.screenshot({ path: path.join(OUT, f) }); console.log('shot', f, ((Date.now() - T0) / 1000).toFixed(0) + 's'); };
  const T0 = Date.now();
  const sleep = ms => page.waitForTimeout(ms);
  const waitS = (fn, arg, ms = 400000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 120 });
  const waitSub = (txt, ms = 400000) => waitS(t => {
    const s = document.getElementById('sub'), c = document.getElementById('caption');
    return (!s.classList.contains('hidden') && s.textContent.includes(t)) || (!c.classList.contains('hidden') && c.textContent.includes(t));
  }, txt, ms);
  const mode = m => waitS(m => window.__S1 && window.__S1.mode === m, m);
  const skip = async () => { if (MODE === 'fast') await page.evaluate(() => { window.__game.E.skipping = true; }); };
  const dbg = (fn, a) => page.evaluate(([f, a]) => window.__game.debug1[f](a), [fn, a]);
  const section = () => page.evaluate(() => window.__S1.section);

  // menu
  if (FROM === 0) {
    await page.goto(BASE);
    await waitS(() => window.__game && document.getElementById('loading').classList.contains('hidden'));
    await sleep(1500); await shot('menu');
  }
  await page.goto(BASE + `?level=1&section=${FROM}`);
  await waitS(() => window.__game && window.__S1 && window.__S1.active);
  await page.mouse.click(5, 5);

  if (FROM <= 0) {
    await waitSub('PROLOGUE'); await sleep(1800); await shot('title_card');
    await waitSub('autumn had come'); await sleep(1500); await shot('alps_autumn');
    await waitSub('my catch'); await shot('gb_scrap');
    await waitSub('mother is sick'); await sleep(500); await shot('pup_pleads');
    await waitSub('prime of my life'); await shot('gb_mister');
    await waitSub('fat ducks'); await shot('nero_order');
    await waitSub('always me'); await shot('sasuke');
    await waitSub('going to get hurt'); await sleep(600); await shot('pup_watches');
    await skip();
  }
  if (FROM <= 1) {
    await waitSub('The farm under the ridge'); await sleep(1500); await shot('farm_night');
    await skip();
    await mode('run'); await sleep(2500); await shot('run_farm');
    await dbg('gesture', { type: 'swipe', dir: 'up' }); await sleep(250); await shot('run_jump');
    await sleep(2500);
    await dbg('gesture', { type: 'swipe', dir: 'down' }); await sleep(150); await shot('run_duck');
    await sleep(3000); await shot('run_farm_2');
    await dbg('winRun');
  }
  if (FROM <= 2) {
    await waitSub('Let him go'); await sleep(300); await shot('tosa_letgo');
    await waitSub('not even a snack'); await shot('tosa_scoff');
    await skip();
    await mode('fight'); await sleep(2500); await shot('fight_tosa');
    await dbg('gesture', { type: 'tap' }); await sleep(250); await shot('fight_tosa_bite');
    await sleep(2000);
    await dbg('bossTo', 50);
    await sleep(1800); await shot('tosa_throw');
    await waitSub("won't"); await sleep(600); await shot('pup_rises');
    await mode('fight'); await sleep(1500); await shot('fight_tosa_phase2');
    await dbg('battoga'); await sleep(350); await shot('first_battoga');
    await waitSub('spun like a blade'); await shot('gb_awe');
    await waitSub("That's enough"); await sleep(400); await shot('smith_arrives');
    await waitSub('looking for someone'); await shot('smith_traveller');
    await skip();
  }
  if (FROM <= 3) {
    await waitSub('That night'); await sleep(2500); await shot('den_night');
    await waitSub('really you'); await shot('smith_sakura');
    await waitSub('someone from Ōu would'); await shot('sakura_smiles');
    await waitSub('take him to his father'); await shot('sakura_entrust');
    await waitSub('Be gentle'); await sleep(800); await shot('nose_to_nose');
    await waitSub('Live'); await sleep(600); await shot('sakura_last');
    await waitSub('Mother…?'); await sleep(1800); await shot('spirit_light');
    await waitSub('Morning'); await sleep(2500); await shot('morning');
    await waitSub('okay to cry'); await shot('gb_comfort');
    await waitSub('A weed'); await sleep(600); await shot('the_weed_plant');
    await waitSub('never uprooted'); await shot('gb_names');
    await waitSub('My name is Weed'); await sleep(500); await shot('my_name_is_weed');
    await waitSub('long way off'); await shot('smith_go');
    await waitSub('Take care, Weed'); await shot('sasuke_bye');
    await skip();
  }
  if (FROM <= 4) {
    await waitSub('long and hard'); await sleep(2000); await shot('the_road');
    await waitSub('Jōshū'); await sleep(1000); await shot('joshu');
    await waitSub('Follow me'); await shot('mel_chased');
    await skip();
    await mode('run'); await sleep(2500); await shot('run_town');
    await sleep(3500); await shot('run_town_2');
    await dbg('winRun');
    await waitSub('never asked'); await shot('mel_nothanks');
    await waitSub('killed my brother'); await shot('hook_warns');
    await skip();
  }
  if (FROM <= 5) {
    await waitSub('truck road'); await sleep(2000); await shot('forest_road');
    await waitSub('paradise'); await shot('blue_taunt');
    await skip();
    await mode('fight'); await sleep(2500); await shot('fight_blue');
    await dbg('bossTo', 50);
    await waitSub('Get him'); await shot('blue_sends_mel');
    await mode('fight'); await sleep(3500); await shot('fight_blue_mel');
    await dbg('bossTo', 15);
    await waitSub('It ends here'); await shot('hook_arrives');
    await waitSub('regret'); await sleep(1200); await shot('blue_flees');
    await skip();
  }
  if (FROM <= 6) {
    await waitSub('Blue!'); await sleep(200); await shot('blue_hit');
    await mode('leap'); await sleep(1500); await shot('leap_prompt');
    await dbg('leap'); await sleep(450); await shot('leap');
    await waitSub('Weed, no'); await shot('smith_no');
    await waitSub('Out of the way'); await sleep(300); await shot('blue_shoves');
    await waitSub('met someone like you'); await shot('blue_last');
    await waitSub('Why…'); await sleep(1000); await shot('weed_grief');
    await waitSub('Remember him'); await shot('smith_remember');
    await waitSub('see him off'); await shot('hook_stays');
    await skip();
  }
  if (FROM <= 7) {
    await waitSub('Can I come'); await shot('mel_follows');
    await waitSub("Let's go together"); await shot('weed_yes');
    await waitSub('toward Ōu'); await sleep(2500); await shot('walk_to_ou');
    await waitSub('monster was waiting'); await shot('monster_waiting');
    await waitS(() => !document.getElementById('result1').classList.contains('hidden'));
    await sleep(800); await shot('result');
  }
  const done = await page.evaluate(() => localStorage.getItem('weed.p1done'));
  console.log('p1done =', done, 'section =', await section());
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
