// Deterministic cutscene video capture (virtual clock + manual rAF stepping, 1 JPEG per frame at 30 fps).
// Usage: URL=http://localhost:4174/ MAXS=60 node tools/cine-capture.cjs arrows 1 /tmp/frames_arrows
//        then: ffmpeg -framerate 30 -i /tmp/frames_arrows/%05d.jpg -c:v libx264 -pix_fmt yuv420p out.mp4  (silent)
// Needs window.__game.debug.scene(name). ~0.4-0.7 frames/s under software rendering.
// Deterministic cutscene capture: virtual clock + manual rAF stepping, one screenshot per frame.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const scene = process.argv[2] || 'arrows', phase = process.argv[3] || '1';
const out = process.argv[4] || path.join(__dirname, 'frames_' + scene);
const BASE = process.env.URL || 'https://weed-game.huone-k7q2.workers.dev/';
const FPS = 30, MAXS = +(process.env.MAXS || 80);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/decode audio|404|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  await p.addInitScript(() => {
    let now = 1000, id = 0; const cbs = [];
    performance.now = () => now; Date.now = () => 1.7e12 + now;
    window.requestAnimationFrame = cb => { cbs.push(cb); return ++id; }; window.cancelAnimationFrame = () => {};
    window.__advance = dt => { now += dt; const l = cbs.splice(0); for (const cb of l) cb(now); };
  });
  await p.goto(BASE + '?phase=' + phase + '&nointro&noprologue&fixedres&cb=' + Date.now(), { waitUntil: 'load' });
  // advance frames while the game loads (loading overlay disappears)
  for (let i = 0; i < 6000; i++) {
    await p.evaluate(() => window.__advance(33.3));
    const ready = await p.evaluate(() => window.__game && document.getElementById('loading') && document.getElementById('loading').classList.contains('hidden'));
    if (ready) break; await p.waitForTimeout(40);
  }
  for (let i = 0; i < 20; i++) await p.evaluate(() => window.__advance(33.3));
  await p.evaluate(n => { window.__game.debug.scene(n); }, scene);
  let n = 0, doneFor = 0;
  while (n < MAXS * FPS) {
    await p.evaluate(() => window.__advance(1000 / 30));
    await p.screenshot({ path: path.join(out, String(n).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 86 });
    n++;
    if (n % 60 === 0) { const d = await p.evaluate(() => !!window.__game.debug.S.sceneDone); console.log('frame', n, 'done', d); doneFor = d ? doneFor + 60 : 0; if (doneFor >= 60) break; }
  }
  console.log('frames', n, 'errors', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
