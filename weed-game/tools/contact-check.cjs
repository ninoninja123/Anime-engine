// Kontaktitarkistus: ajaa tason 2 taistelukohtaukset ja mittaa jokaisen iskun kontaktin (src/contact.js).
//  - jokaisessa strike-askeleessa: hyökkääjän hampaiden/tassun etäisyys kohdepisteeseen iskuhetkellä (< 0.25 x kohteen korkeus)
//  - hyökkääjän vartalo (ilman päätä/kaulaa) ei saa olla kohteen vartalon sisällä (bodyK >= 0.5)
//  - koko kohtauksen ajan: kukaan ei seiso toisen päällä eikä ole toisen sisällä (paitsi purennassa/loikassa)
//  - kuvakaappaus jokaisesta kontaktihetkestä: screenshots/contact/<kohtaus>_<n>_<hyökkääjä>_<piste>.png
// Käyttö: npm run build && (npx vite preview --port 4174 &) && node tools/contact-check.cjs [smith arrows lock finale twinfang bite]
//         URL=http://localhost:4174/ node tools/contact-check.cjs smith
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.URL || 'http://localhost:4174/';
const OUT = path.join(__dirname, '..', 'screenshots', 'contact');
const ALL = ['smith', 'arrows', 'lock', 'finale', 'twinfang', 'bite'];
const scenes = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const MIN_STRIKES = { smith: 1, arrows: 3, lock: 4, finale: 1, twinfang: 2, bite: 1 };
const RATIO = 0.25, BODY_K = 0.5;
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const report = { when: new Date().toISOString(), thresholds: { ratio: RATIO, bodyK: BODY_K }, scenes: {}, pass: true };
  for (const name of scenes) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|404/.test(m.text())) errors.push(m.text()); });
    const t0 = Date.now();
    await page.goto(BASE + '?phase=' + ({ lock: 2, finale: 3 }[name] || 1) + '&nointro&fastcine&fixedres');
    await page.waitForFunction(() => window.__game && document.getElementById('loading').classList.contains('hidden'), null, { timeout: 180000 });
    await page.waitForTimeout(1500);
    await page.evaluate(n => { const C = window.__contact; C.reset(); C.monitor = true; C.hold = true; window.__game.debug.scene(n); }, name);
    let shots = 0; const deadline = Date.now() + 15 * 60 * 1000;
    while (Date.now() < deadline) {
      const st = await page.evaluate(() => ({ p: window.__contact.pending, done: window.__game.debug.S.sceneDone }));
      if (st.p) {
        await page.waitForTimeout(250);               // anna kuvan piirtyä pysäytetyssä kontaktihetkessä
        const f = `${name}_${String(++shots).padStart(2, '0')}_${st.p.who}_${st.p.point}.png`;
        await page.screenshot({ path: path.join(OUT, f) });
        await page.evaluate(f => { window.__contact.pending.shot = f; window.__contact.release(); }, f);
        continue;
      }
      if (st.done) break;
      await page.waitForTimeout(150);
    }
    const res = await page.evaluate(() => ({ strikes: window.__contact.strikes, violations: window.__contact.violations.map(({ key, ...v }) => v), done: window.__game.debug.S.sceneDone }));
    const fails = [];
    if (!res.done) fails.push('scene did not finish');
    if (res.strikes.length < (MIN_STRIKES[name] || 1)) fails.push(`only ${res.strikes.length} strikes (expected >= ${MIN_STRIKES[name]})`);
    for (const s of res.strikes) {
      if (!(s.ratio < RATIO)) fails.push(`strike ${s.who}->${s.target}.${s.point}: distance ${s.dist} = ${s.ratio} x height`);
      if (!(s.bodyK >= BODY_K)) fails.push(`strike ${s.who}->${s.target}.${s.point}: body inside target (k=${s.bodyK} ${s.pair})`);
    }
    for (const v of res.violations) fails.push(`${v.kind}: ${v.a} / ${v.b} (n=${v.n}${v.k !== undefined ? ', k=' + v.k : ''}${v.y !== undefined ? ', y=' + v.y : ''})`);
    report.scenes[name] = { pass: !fails.length, secs: Math.round((Date.now() - t0) / 1000), strikes: res.strikes, violations: res.violations, fails, errors: errors.slice(0, 10) };
    if (fails.length) report.pass = false;
    console.log(`${name}: ${fails.length ? 'FAIL' : 'ok'}  strikes=${res.strikes.length}  ${res.strikes.map(s => `${s.who}->${s.point} d=${s.dist} k=${s.bodyK}`).join(' | ')}`);
    for (const f of fails) console.log('   - ' + f);
    for (const e of errors.slice(0, 5)) console.log('   ! ' + e);
    await page.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(report.pass ? 'ALL CONTACT CHECKS PASSED' : 'CONTACT CHECKS FAILED', '->', path.join(OUT, 'report.json'));
  await browser.close();
  process.exit(report.pass ? 0 : 1);
})();
