// Look-dev-vertailuarkki: jokainen hahmo omana kuvanaan (sivu + lähikuva päästä), koottuna ruudukoksi.
// Käyttö (vite käynnissä): NODE_PATH=<playwright> URL=http://localhost:5293/dev/chars.html? \
//   node tools/look-sheet.cjs out.png id1,id2,... [cols] [--close]
const { chromium } = require('playwright');
const BASE = process.env.URL || 'http://localhost:5191/dev/chars.html?';
(async () => {
  const [out, ids, cols = '4'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const close = process.argv.includes('--close');
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 480, height: 360 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const shots = [];
  for (const id of ids.split(',')) {
    // korkeus vaihtelee: kamera skaalataan hahmon korkeuden mukaan (chars.html ei tiedä sitä, joten arvio q:lla)
    const q = close ? `ids=${id}&cols=1&nofx&cx=0.9&cy=1.25&cz=2.2&lx=0.7&ly=1.0&t=0.5` : `ids=${id}&cols=1&nofx&cy=1.0&cz=3.6&ly=0.75&t=0.5`;
    await page.goto(BASE + q);
    await page.waitForFunction(() => window.done, null, { timeout: 120000 });
    await page.waitForTimeout(600);
    const p = out.replace(/\.png$/, '') + '_' + id + '.png';
    await page.screenshot({ path: p }); shots.push([id, p]);
  }
  await browser.close();
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  const { execFileSync } = require('child_process');
  execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
fs = sys.argv[3:]; cols = int(sys.argv[2]); W, H = 480, 360
rows = (len(fs) // 2 + cols - 1) // cols
im = Image.new('RGB', (W * cols, H * rows), 'white'); d = ImageDraw.Draw(im)
for k in range(0, len(fs), 2):
    n = k // 2; x, y = (n % cols) * W, (n // cols) * H
    im.paste(Image.open(fs[k + 1]).convert('RGB'), (x, y)); d.text((x + 6, y + 6), fs[k], fill='black')
im.save(sys.argv[1])
`, out, cols, ...shots.flat()]);
  console.log('sheet', out);
})();
