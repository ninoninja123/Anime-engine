// node shoot.js <outdir> name=/url/of/model.vrm[|{json opts}] ...
// URLs are relative to the current directory (served as /). Options (harness.html go()): anim, t, side, face, fd, fov, normH, forceToon,
// expr {aa:1}, hairFrom (donor VRoid VRM), hairTint, hairShade, plate (background image), props [{url,p,s,ry}], ground, bg.
const http = require('http'), path = require('path'), fs = require('fs');
const SERVE = (ROOT) => http.createServer((q, r) => { // "/h/..." = this tool folder (pages + node_modules), everything else = ROOT (your models/clips)
  const u = decodeURIComponent(q.url.split('?')[0]); const base = u.startsWith('/h/') ? __dirname : ROOT; const p = path.join(base, u.startsWith('/h/') ? u.slice(3) : u);
  if (!p.startsWith(base) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : p.endsWith('.png') ? 'image/png' : p.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
const PW = process.env.PLAYWRIGHT ?? '/opt/node-tools/node_modules/playwright';
const { chromium } = require(PW);
(async () => { const [outdir, ...jobs] = process.argv.slice(2); fs.mkdirSync(outdir, { recursive: true });
  const srv = SERVE(process.cwd()); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 360, height: 640 } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/h/harness.html`); await page.waitForFunction(() => window.READY === true);
  for (const j of jobs) { const k = j.indexOf('='); const name = j.slice(0, k); const [url, o] = j.slice(k + 1).split('|'); const t = Date.now();
    try { const res = await page.evaluate(([u, o]) => window.go(u, o), [url, o ? JSON.parse(o) : {}]); fs.writeFileSync(path.join(outdir, name + '.jpg'), Buffer.from(res.out.split(',')[1], 'base64')); console.log(name, JSON.stringify(res.info), Date.now() - t, 'ms'); }
    catch (e) { console.error('FAIL', name, e.message); } }
  await b.close(); srv.close(); })();
