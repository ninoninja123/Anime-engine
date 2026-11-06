// Bleach Showdown renderer: headless Chromium (Playwright, CPU raster) -> JPEG frames -> ffmpeg H.264 segments.
// Resumable (segment .done markers), unique-frame cache (frameKey), N workers, per-segment re-render.
// Usage (PROG = comma list of program files relative to engine/, e.g. reel/testreel):
//   node render.js stills  PROG outdir t1,t2,...   [scale=.5]            PNG stills
//   node render.js sheet   PROG out.png t0 t1 n    [scale=.25] [cols=6]  contact sheet (or list:t1,t2,... instead of t0 t1 n)
//   node render.js seg     PROG BUILD k [scale=1] [segLen=12]            render segment k -> BUILD/seg_kk.mp4 (+ .done)
//   node render.js all     PROG BUILD [workers=auto] [scale=1] [segLen=12] [t0] [t1]   render all missing segments
//   node render.js redo    PROG BUILD k1,k2,... [workers] [scale] [segLen]  delete + re-render given segments
//   node render.js concat  PROG BUILD out.mp4 [segLen=12]
//   node render.js events  PROG out.json                                 markers (sfx) + shot list + duration
//   node render.js preview PROG out.mp4 [scale=.5] [workers=auto]        quick full preview (segments in /tmp-like BUILD)
const { chromium } = require('playwright');
require('./modules.cjs').updateManifest();   // auto-load engine/chars_*, fx_*, sets_*, poses_*, impact_* (README: Moduulit)
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn, spawnSync } = require('child_process');
const PAGE = 'file://' + path.join(__dirname, 'index.html');
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;
const ARGS = ['--disable-gpu', '--disable-gpu-compositing', '--disable-accelerated-2d-canvas', '--disable-gpu-vsync', '--disable-background-timer-throttling', '--js-flags=--max-old-space-size=3072'];
const FPS = 24;
const autoWorkers = () => Math.max(2, Math.min(8, os.cpus().length));
async function openPage(browser, prog, scale) {
  const page = await browser.newPage({ viewport: { width: Math.round(1920 * scale), height: Math.round(1080 * scale) } });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { const s = m.text(); if (m.type() === 'error' && !s.includes('ERR_FILE_NOT_FOUND')) console.error('CONSOLE', s); else if (/^missing /.test(s) && !/missing (impact|text|fx)$/.test(s)) console.error(s); });
  await page.goto(PAGE + `?render=1&scale=${scale}&prog=${encodeURIComponent(prog)}`);
  await page.waitForFunction(() => window.READY === true);
  return page;
}
async function grab(page, t, fmt, q = .93) {
  const url = await page.evaluate(([t, fmt, q]) => { window.renderTime(t); return document.getElementById('out').toDataURL(fmt === 'jpg' ? 'image/jpeg' : 'image/png', q); }, [t, fmt, q]);
  return Buffer.from(url.split(',')[1], 'base64');
}
async function getDur(page) { return page.evaluate(() => window.getDur()); }
async function renderSeg(page, build, k, scale, segLen) {
  const DUR = await getDur(page);
  const f0 = Math.round(k * segLen * FPS), f1 = Math.min(Math.round(DUR * FPS), Math.round((k + 1) * segLen * FPS));
  const out = path.join(build, `seg_${String(k).padStart(2, '0')}.mp4`), tmp = out + '.tmp.mp4';
  const hq = scale >= .6, crf = process.env.SEG_CRF || (hq ? (scale < 1 ? '15' : '16') : '24'), preset = hq ? 'medium' : 'veryfast';   // 720p final (scale .6667) = high quality intermediates
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', preset, '-crf', crf, '-pix_fmt', 'yuv420p', '-r', String(FPS), '-threads', '1', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  const cache = new Map(); let uniq = 0; const t0 = Date.now();
  for (let i = f0; i < f1; i++) {
    const t = i / FPS, key = await page.evaluate(t => window.frameKey(t), t);
    let buf = cache.get(key);
    if (!buf) { buf = await grab(page, t, 'jpg', scale < 1 ? .86 : .95); uniq++; if (!key.startsWith('u')) { cache.set(key, buf); if (cache.size > 64) cache.delete(cache.keys().next().value); } }
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  fs.renameSync(tmp, out); fs.writeFileSync(out + '.done', JSON.stringify({ frames: f1 - f0, uniq, sec: (Date.now() - t0) / 1000 }));
  console.log(`seg ${k} done: ${f1 - f0} frames (${uniq} unique) in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
async function durOf(prog) { const b = await chromium.launch({ executablePath: exe, args: ARGS }); try { const p = await openPage(b, prog, .25); return await getDur(p); } finally { await b.close(); } }
async function runAll(prog, out, workers, scale, segLen, tA = 0, tB = 1e9, only = null) {
  fs.mkdirSync(out, { recursive: true });
  const DUR = await durOf(prog), nSeg = Math.ceil(DUR / segLen - 1e-9), todo = [];
  for (let k = 0; k < nSeg; k++) { if (only && !only.includes(k)) continue; if ((k + 1) * segLen <= tA || k * segLen >= tB) continue; const f = path.join(out, `seg_${String(k).padStart(2, '0')}.mp4.done`); if (!fs.existsSync(f)) todo.push(k); }
  console.log(`duration ${DUR}s, ${nSeg} segments; to render: ${todo.join(',') || '(none)'}`);
  let next = 0; const t0 = Date.now();
  const runW = async w => { while (next < todo.length) { const k = todo[next++]; await new Promise(res => { const p = spawn('node', [__filename, 'seg', prog, out, String(k), String(scale), String(segLen)], { stdio: 'inherit' }); p.on('close', res); }); console.log(`[w${w}] ${next}/${todo.length}  ${((Date.now() - t0) / 60000).toFixed(1)} min`); } };
  await Promise.all(Array.from({ length: workers }, (_, w) => runW(w)));
  console.log('all done', ((Date.now() - t0) / 60000).toFixed(1), 'min'); return { DUR, nSeg };
}
function concat(out, dst, nSeg, segLen) {
  const list = []; for (let k = 0; k < nSeg; k++) { const f = path.join(out, `seg_${String(k).padStart(2, '0')}.mp4`); if (!fs.existsSync(f + '.done')) throw new Error('missing ' + f); list.push(`file '${path.resolve(f)}'`); }
  fs.writeFileSync(path.join(out, 'list.txt'), list.join('\n'));
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'list.txt'), '-c', 'copy', dst], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('concat failed'); console.log('concat ->', dst);
}
(async () => {
  const [mode, prog, out, ...rest] = process.argv.slice(2);
  if (!mode || !prog) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 13).join('\n')); return; }
  if (mode === 'all') { await runAll(prog, out, parseInt(rest[0]) || autoWorkers(), parseFloat(rest[1] || '1'), parseFloat(rest[2] || '12'), parseFloat(rest[3] || '0'), parseFloat(rest[4] || '1e9')); return; }
  if (mode === 'redo') { const ks = rest[0].split(',').map(Number); for (const k of ks) { const f = path.join(out, `seg_${String(k).padStart(2, '0')}.mp4.done`); if (fs.existsSync(f)) fs.unlinkSync(f); } await runAll(prog, out, parseInt(rest[1]) || autoWorkers(), parseFloat(rest[2] || '1'), parseFloat(rest[3] || '12'), 0, 1e9, ks); return; }
  if (mode === 'concat') { const segLen = parseFloat(rest[1] || '12'); const DUR = await durOf(prog); concat(out, rest[0], Math.ceil(DUR / segLen - 1e-9), segLen); return; }
  if (mode === 'preview') { const scale = parseFloat(rest[0] || '.5'), build = out + '.build'; const { nSeg } = await runAll(prog, build, parseInt(rest[1]) || autoWorkers(), scale, 6); concat(build, out, nSeg, 6); return; }
  const browser = await chromium.launch({ executablePath: exe, args: ARGS });
  try {
    if (mode === 'seg') { const k = parseInt(rest[0]), scale = parseFloat(rest[1] || '1'), segLen = parseFloat(rest[2] || '12'); fs.mkdirSync(out, { recursive: true }); const page = await openPage(browser, prog, scale); await renderSeg(page, out, k, scale, segLen); }
    else if (mode === 'events') { const page = await openPage(browser, prog, .25); const d = await page.evaluate(() => ({ dur: window.getDur(), events: window.getEvents(), shots: window.getShots() })); fs.writeFileSync(out, JSON.stringify(d, null, 1)); console.log('events', d.events.length, 'shots', d.shots.length, 'dur', d.dur); }
    else if (mode === 'stills') {
      const times = rest[0].split(',').map(Number); const scale = parseFloat(rest[1] || '0.5'); fs.mkdirSync(out, { recursive: true });
      const page = await openPage(browser, prog, scale); const pre = path.basename(out);
      for (const t of times) { const t0 = Date.now(); fs.writeFileSync(path.join(out, `${pre}_${t.toFixed(3)}.png`), await grab(page, t, 'png')); console.log('still', t, Date.now() - t0, 'ms'); }
    } else if (mode === 'sheet') {
      let times; let [a0, a1, a2, a3, a4] = rest;
      if (a0.startsWith('list:')) { times = a0.slice(5).split(',').map(Number); a4 = a2; a3 = a1; }
      else { const tA = parseFloat(a0), tB = parseFloat(a1), n0 = parseInt(a2); times = []; for (let i = 0; i < n0; i++) times.push(n0 > 1 ? tA + (tB - tA) * i / (n0 - 1) : tA); }
      const n = times.length, scale = parseFloat(a3 || '0.25'), cols = parseInt(a4 || '6');
      const dir = out + '.d'; fs.mkdirSync(dir, { recursive: true });
      const page = await openPage(browser, prog, scale);
      for (let i = 0; i < n; i++) fs.writeFileSync(path.join(dir, `f_${String(i).padStart(3, '0')}.png`), await grab(page, times[i], 'png'));
      const rows = Math.ceil(n / cols);
      const py = `import glob,sys\nfrom PIL import Image\nfs=sorted(glob.glob(sys.argv[1]+'/f_*.png'));ims=[Image.open(f) for f in fs];w,h=ims[0].size;c=int(sys.argv[3]);r=(len(ims)+c-1)//c;P=4\nout=Image.new('RGB',(c*w+(c+1)*P,r*h+(r+1)*P),'white')\nfor i,im in enumerate(ims): out.paste(im,(P+(i%c)*(w+P),P+(i//c)*(h+P)))\nout.save(sys.argv[2])`;
      const res = spawnSync('python3', ['-c', py, dir, out, String(cols)], { stdio: 'inherit' });
      if (res.status !== 0) spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', path.join(dir, 'f_%03d.png'), '-vf', `tile=${cols}x${rows}:padding=4:color=white`, '-frames:v', '1', out], { stdio: 'inherit' });
      fs.rmSync(dir, { recursive: true, force: true }); console.log('sheet', out);
    }
  } finally { await browser.close(); }
})();
