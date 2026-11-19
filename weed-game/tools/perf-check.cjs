// Phone performance check (Playwright + Chromium, landscape 844x390, CPU throttling via CDP).
// Measures per scenario and throttle rate: draw calls, triangles, GPU memory (renderer.info + texture/RT estimate),
// JS heap, frame time, load time (first paint of the loading screen -> playable) and transferred asset sizes.
// Also fails on console errors.
//
// Usage: npm run build && (npx vite preview --port 4187 --strictPort &)
//        URL=http://localhost:4187/ node tools/perf-check.cjs [--rates 1,4,6] [--scenes battle,cutscene] [--q auto|low|med|high]
//                                   [--out ../docs/weed-game/perf-report.md] [--label "after"] [--json out.json]
// Note: headless Chromium renders with SwiftShader (CPU), so absolute fps is far below a real phone; use the numbers
// to compare builds (before/after) and to watch draw calls / triangles / memory, which are device independent.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = process.env.URL || 'http://localhost:4187/';
const RATES = arg('rates', '1,4,6').split(',').map(Number);
const SCENES = arg('scenes', 'menu,battle,cutscene').split(',');
const QUAL = arg('q', 'auto');
const OUT = arg('out', '');
const LABEL = arg('label', new Date().toISOString().slice(0, 16));
const JSON_OUT = arg('json', '');
const SAMPLE_MS = Number(arg('sample', '6000'));
// a mid-range Android phone (UA decides tier detection: mobile + cores/memory)
const UA = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

const SCN = {
  menu: { q: '', ready: () => window.__game && document.getElementById('loading').classList.contains('hidden') },
  battle: { q: 'phase=2&nointro', ready: () => window.__S && window.__S.active && !window.__S.cutscene && !window.__S.special },
  cutscene: { q: 'level=2&noprologue', ready: () => window.__S && window.__S.cutscene && document.body.classList.contains('cine') },
  prologue: { q: 'level=1&section=0&story', ready: () => window.__S1 && window.__S1.active },
};

const INIT = () => {
  window.__perf = { t0: performance.now(), loadingShown: null, loadingHidden: null };
  const mark = () => {
    const el = document.getElementById('loading'); if (!el) return;
    if (window.__perf.loadingShown == null) window.__perf.loadingShown = performance.now();
    if (window.__perf.loadingHidden == null && el.classList.contains('hidden')) window.__perf.loadingHidden = performance.now();
  };
  new MutationObserver(mark).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
};

// in-page sampler: frame times + renderer stats
const SAMPLE = async ms => {
  const E = window.__game.E, r = E.renderer;
  const ft = []; let last = performance.now(); let calls = 0, tris = 0, n = 0, maxCalls = 0, maxTris = 0;
  await new Promise(res => {
    const end = last + ms;
    const f = () => {
      const now = performance.now(); ft.push(now - last); last = now;
      const s = E.stats || {}; calls += s.calls || 0; tris += s.tris || 0; n++;
      maxCalls = Math.max(maxCalls, s.calls || 0); maxTris = Math.max(maxTris, s.tris || 0);
      if (now < end) requestAnimationFrame(f); else res();
    };
    requestAnimationFrame(f);
  });
  ft.shift(); ft.sort((a, b) => a - b);
  const avg = ft.reduce((a, b) => a + b, 0) / Math.max(1, ft.length);
  // texture memory estimate: every texture reachable from the scene (+ mip chain), plus post-processing targets
  const seen = new Set(); let texBytes = 0;
  const addTex = t => {
    if (!t || seen.has(t)) return; seen.add(t);
    const img = t.image || t.source && t.source.data; if (!img) return;
    const w = img.width || img.videoWidth || 0, h = img.height || img.videoHeight || 0;
    const mip = t.generateMipmaps !== false && t.minFilter !== 1006 && t.minFilter !== 1003 ? 1.333 : 1;
    texBytes += w * h * 4 * mip;
  };
  E.scene.traverse(o => {
    const ms_ = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms_) {
      for (const k of ['map', 'gradientMap', 'emissiveMap', 'alphaMap', 'normalMap']) addTex(m[k]);
      if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u && u.value && u.value.isTexture) addTex(u.value);
    }
  });
  const c = r.domElement, q = E.quality;
  const bufPx = c.width * c.height;
  // HDR scene target (half float 8 B/px) * MSAA samples + resolve + bloom chain (~1/3) + shadow map
  const rtBytes = q.post ? bufPx * q.scale * q.scale * (8 * Math.max(1, q.msaa) + 8 + 4 + 8 * 0.34) : bufPx * 8;
  const shadowBytes = q.shadowSize ? q.shadowSize * q.shadowSize * 4 : 0;
  return {
    frames: ft.length, avgMs: +avg.toFixed(1), p95Ms: +(ft[Math.floor(ft.length * 0.95)] || 0).toFixed(1), fps: +(1000 / avg).toFixed(1),
    calls: Math.round(calls / Math.max(1, n)), maxCalls, tris: Math.round(tris / Math.max(1, n)), maxTris,
    geometries: r.info.memory.geometries, textures: r.info.memory.textures, programs: (r.info.programs || []).length,
    texMB: +(texBytes / 1048576).toFixed(1), rtMB: +((rtBytes + shadowBytes) / 1048576).toFixed(1),
    tier: q.tier, scale: q.scale, canvas: `${c.width}x${c.height}`,
  };
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info'] });
  const results = []; const errors = []; const assetTotals = {};
  for (const scene of SCENES) for (const rate of RATES) {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Performance.enable');
    if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    const assets = {};
    page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/decode audio|GPU stall|swiftshader|WebGL-|Automatic fallback/i.test(m.text())) errors.push(`[${scene} x${rate}] ${m.type()}: ${m.text().slice(0, 300)}`); });
    page.on('pageerror', e => errors.push(`[${scene} x${rate}] PAGEERROR ${e.message}`));
    page.on('response', async r => {
      try {
        const u = new URL(r.url()); if (u.origin !== new URL(BASE).origin) return;
        const b = await r.body().catch(() => null); if (!b) return;
        const ext = (u.pathname.match(/\.(\w+)$/) || [, 'html'])[1];
        assets[ext] = (assets[ext] || 0) + b.length;
      } catch (_) {}
    });
    const sc = SCN[scene];
    const q = [sc.q, QUAL !== 'auto' ? (QUAL === 'low' ? 'lowfx' : QUAL === 'high' ? 'hq' : 'q=' + QUAL) : ''].filter(Boolean).join('&');
    const t0 = Date.now();
    await page.goto(BASE + (q ? '?' + q : ''));
    await page.waitForFunction(sc.ready, null, { timeout: 400000, polling: 100 });
    const readyWall = Date.now() - t0;
    await page.waitForTimeout(1500);
    const load = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const fcp = (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime;
      return { fcp: fcp ? Math.round(fcp) : null, dcl: Math.round(nav.domContentLoadedEventEnd || 0), playable: Math.round(window.__perf.loadingHidden || 0) };
    });
    const s = await page.evaluate(SAMPLE, SAMPLE_MS);
    const m = await cdp.send('Performance.getMetrics');
    const get = k => (m.metrics.find(x => x.name === k) || {}).value || 0;
    const row = { scene, rate, ...s, heapMB: +(get('JSHeapUsedSize') / 1048576).toFixed(1), heapTotalMB: +(get('JSHeapTotalSize') / 1048576).toFixed(1),
      fcpMs: load.fcp, playableMs: load.playable, readyWallMs: readyWall, nodes: get('Nodes') };
    results.push(row);
    for (const [k, v] of Object.entries(assets)) assetTotals[`${scene}:${k}`] = Math.max(assetTotals[`${scene}:${k}`] || 0, v);
    console.log(JSON.stringify(row));
    await ctx.close();
  }
  // second visit (service worker + HTTP cache) and offline start: --revisit
  let revisit = null;
  if (process.argv.includes('--revisit')) {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    page.on('pageerror', e => /decode audio/.test(e.message) || errors.push('[revisit] PAGEERROR ' + e.message));
    let net = 0, fromSW = 0;
    page.on('response', async r => { try { const b = await r.body().catch(() => null); if (!b) return; if (r.fromServiceWorker()) fromSW += b.length; else net += b.length; } catch (_) {} });
    const playable = () => page.waitForFunction(SCN.menu.ready, null, { timeout: 400000, polling: 100 }).then(() => page.evaluate(() => Math.round(window.__perf.loadingHidden)));
    await page.goto(BASE); const first = await playable();
    const sw = await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 }).then(() => true).catch(() => false);
    await page.waitForTimeout(1500);
    net = 0; fromSW = 0;
    await page.reload(); const second = await playable();
    const secondNet = net, secondSW = fromSW;
    await ctx.setOffline(true);
    let offline = 'failed';
    try { await page.reload(); offline = (await playable()) + ' ms'; } catch (e) { offline = 'failed: ' + e.message.slice(0, 80); }
    revisit = { first, second, sw, secondNetKB: Math.round(secondNet / 1024), secondSwKB: Math.round(secondSW / 1024), offline };
    console.log(JSON.stringify({ revisit }));
    await ctx.close();
  }
  await browser.close();

  const assetsByScene = {};
  for (const [k, v] of Object.entries(assetTotals)) { const [sc, ext] = k.split(':'); (assetsByScene[sc] = assetsByScene[sc] || {})[ext] = v; }
  const kb = v => (v / 1024).toFixed(0) + ' kB';
  let md = `\n## ${LABEL} (q=${QUAL}, ${new Date().toISOString().slice(0, 10)})\n\n`;
  md += '| scene | CPU | tier | fps (avg / p95 ms) | draw calls avg/max | triangles avg/max | geo / tex / programs | tex MB | RT MB | JS heap MB | FCP ms | playable ms |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of results) md += `| ${r.scene} | ${r.rate}x | ${r.tier} ×${r.scale} | ${r.fps} (${r.avgMs} / ${r.p95Ms}) | ${r.calls} / ${r.maxCalls} | ${(r.tris / 1000).toFixed(0)}k / ${(r.maxTris / 1000).toFixed(0)}k | ${r.geometries} / ${r.textures} / ${r.programs} | ${r.texMB} | ${r.rtMB} | ${r.heapMB} | ${r.fcpMs ?? '-'} | ${r.playableMs} |\n`;
  md += '\nTransferred assets (same-origin, per scene, first visit):\n\n';
  for (const [sc, a] of Object.entries(assetsByScene)) md += `- **${sc}**: ` + Object.entries(a).sort((x, y) => y[1] - x[1]).map(([e, v]) => `${e} ${kb(v)}`).join(', ') + ` (total ${kb(Object.values(a).reduce((x, y) => x + y, 0))})\n`;
  if (revisit) md += `\nSecond visit (menu, CPU 1x): first ${revisit.first} ms -> reload ${revisit.second} ms playable; service worker ${revisit.sw ? 'active' : 'NOT active'}, `
    + `reload transferred ${revisit.secondNetKB} kB from network / ${revisit.secondSwKB} kB from the service worker cache; offline reload: ${revisit.offline}.\n`;
  md += errors.length ? `\nConsole errors/warnings (${errors.length}):\n\n` + [...new Set(errors)].slice(0, 30).map(e => '- `' + e.replace(/`/g, "'") + '`').join('\n') + '\n' : '\nNo console errors or warnings.\n';
  console.log(md);
  if (OUT) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.appendFileSync(OUT, md); console.log('appended to', OUT); }
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ label: LABEL, results, assets: assetsByScene, errors }, null, 1));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
