// node lab.js out.png @code.js [w h]   -> runs code in lab.html (ctx = 1920x1080 canvas, all engine modules loaded)
const { chromium } = require('playwright'); require('./modules.cjs').updateManifest(); const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--disable-gpu','--disable-gpu-compositing','--disable-accelerated-2d-canvas']});
const p=await b.newPage({viewport:{width:1920,height:1080}}); p.on('pageerror',e=>console.error('ERR',e.message)); p.on('console',m=>{if(!/missing|ERR_FILE/.test(m.text()))console.log('LOG',m.text())});
await p.goto('file://'+path.join(__dirname,'lab.html'));
const code=process.argv[3].startsWith('@')?fs.readFileSync(process.argv[3].slice(1),'utf8'):process.argv[3];
const t0=Date.now();
const url=await p.evaluate(([c,w,h])=>window.lab(c,w,h),[code,+process.argv[4]||0,+process.argv[5]||0]); fs.writeFileSync(process.argv[2],Buffer.from(url.split(',')[1],'base64')); console.log('ms',Date.now()-t0); await b.close();})();
