// Prologue cast line-up screenshot (placeholder check: every side character must read as a different dog by colour/size).
// URL=http://localhost:4192/ node tools/level1-lineup.cjs  -> screenshots/level1_playthrough/lineup.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const BASE = process.env.URL || 'http://localhost:4192/';
const OUT = path.join(__dirname, '..', 'screenshots', 'level1_playthrough'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  await p.goto(BASE + '?level=1&section=3&fixedres');
  await p.waitForFunction(() => window.__S1 && window.__S1.active && window.__S1.mode === 'scene', null, { timeout: 240000 });
  await p.evaluate(() => { window.__S1.token++; window.__game.E.skipping = true; });
  await p.waitForTimeout(8000);
  await p.evaluate(() => {
    const G = window.__game, E = G.E, c = G.cast;
    document.body.classList.remove('cine'); for (const id of ['hud', 'sub', 'skipBtn', 'caption']) document.getElementById(id).classList.add('hidden');
    const order = ['weed', 'mel', 'sasuke', 'sakura', 'gb', 'hook', 'smith', 'blue', 'nero', 'tosa'];
    let x = -7.2;
    for (const id of order) { const d = c[id]; if (!d) continue; d.root.visible = true; d.fade(1); d.setTint(0, 0); d.root.position.set(x, 0, 0); d.face(1, true); d.play('Idle', { loop: true }); d.model.visible = true; d.spin.rotation.set(0, 0, 0); d.model.scale.y = d.height; x += Math.max(1.25, (d.length || 1) * 0.9 + 0.4); }
    E.skipping = false; E.camPos.set(-0.6, 1.6, 9.5); E.camLook.set(-0.6, 0.6, 0);
    const lab = document.createElement('div'); lab.style.cssText = 'position:fixed;left:0;right:0;bottom:8px;text-align:center;color:#fff;font:600 13px sans-serif;z-index:50;text-shadow:0 1px 3px #000';
    lab.textContent = order.join('  ·  '); document.body.appendChild(lab);
  });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(OUT, 'lineup.png') });
  await b.close();
})();
