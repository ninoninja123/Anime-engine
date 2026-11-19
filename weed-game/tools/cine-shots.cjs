// Cutscene frame strips: open a scene, fast-forward to a mark, grab N frames and build a 3x2 contact sheet.
// Usage: URL=http://localhost:4190/ node tools/cine-shots.cjs <name> "<query>" [mark] [frames=6] [intervalMs=1500] [dpr=1]
//   query e.g. "level=1&section=3"  (prologue chapter section)  or  "level=2&cinetest=post"  or  "prologue&storytest=1"
//   mark  = Mark('<label>') inside the scene (src/shared/cine.js): the scene is skipped up to it (?cinefrom=<label>).
// Output: screenshots/cutscenes/<name>_<i>.png + <name>_sheet.png. Console errors are printed (exit 1 if any).
// Needs Playwright (NODE_PATH=/opt/node-tools/node_modules) and swiftshader; software rendering is slow.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (_) {}
const BASE = process.env.URL || 'http://localhost:4190/';
const [name = 'shot', query = 'level=1&section=3', mark = '', nArg = '6', ivArg = '1500', dprArg = '1'] = process.argv.slice(2);
const N = +nArg, IV = +ivArg, DPR = +dprArg;
const OUT = path.join(__dirname, '..', 'screenshots', 'cutscenes');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/decode audio|Failed to load resource|ERR_/.test(t)) errors.push(t); if (/\[cine\]/.test(t)) console.log(t); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  const q = query + (mark ? `&cinefrom=${mark}` : '') + (process.env.EXTRA || '');
  await page.goto(BASE + '?' + q + '&q=med');
  await page.mouse.click(400, 200).catch(() => {});
  if (mark) await page.waitForFunction(m => window.__cineMark === m, mark, { timeout: 400000 });
  else await page.waitForFunction(() => (window.__S1 && window.__S1.mode === 'scene') || window.__cineMark || document.body.classList.contains('prologue'), null, { timeout: 400000 });
  if (process.env.PRE) await page.waitForTimeout(+process.env.PRE);
  const files = [];
  for (let i = 0; i < N; i++) {
    const f = path.join(OUT, `${name}_${i + 1}.png`);
    await page.screenshot({ path: f });
    const info = await page.evaluate(() => ({ mark: window.__cineMark, t: window.__game && window.__game.E.realTime.toFixed(1), sub: (document.getElementById('sub') || {}).innerText }));
    console.log(`frame ${i + 1}: mark=${info.mark} t=${info.t} sub=${(info.sub || '').replace(/\n/g, ' / ').slice(0, 80)}`);
    files.push(f);
    if (i < N - 1) await page.waitForTimeout(IV);
  }
  if (sharp) {
    const W = 844 * DPR / 2, H = 390 * DPR / 2, cols = 3, rows = Math.ceil(files.length / cols);
    const comps = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(Math.round(W), Math.round(H)).toBuffer(), left: Math.round((i % cols) * W), top: Math.round(Math.floor(i / cols) * H) })));
    await sharp({ create: { width: Math.round(W * cols), height: Math.round(H * rows), channels: 3, background: '#000' } }).composite(comps).png().toFile(path.join(OUT, `${name}_sheet.png`));
    console.log('sheet', path.join(OUT, `${name}_sheet.png`));
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
