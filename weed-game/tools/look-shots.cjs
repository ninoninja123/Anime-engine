// Kuvakaappaa dev/chars.html-näkymän (hahmovertailu).
// Käyttö: npx vite --port 5191 & ; NODE_PATH=<playwright> node tools/look-shots.cjs <out.png> "<query>"
//   esim. node tools/look-shots.cjs screenshots/looks/side.png "ids=look_gsd_a,look_dane_fawn&cols=4"
const { chromium } = require('playwright');
const BASE = process.env.URL || 'http://localhost:5191/dev/chars.html?';
(async () => {
  const [out, q, w, h] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +(w || 1400), height: +(h || 700) } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.goto(BASE + (q || ''));
  await page.waitForFunction(() => window.done, null, { timeout: 180000 }).catch(e => { console.log('TIMEOUT', errors.join('\n')); process.exit(1); });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: out });
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  console.log('shot', out);
  await browser.close();
})();
