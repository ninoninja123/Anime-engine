// node vrma2poses.js <model.vrm url> <clip.vrma url> <prefix> <t1,t2,...> <out.json> [--check outdir]
// URLs relative to the current directory, e.g. /models/AvatarSample_C.vrm /clips/Sword_Regular_Combo.vrma. Output keys: <prefix>_0.. ; merge into poses.json.
// Each pose: torso/head/hands/feet = absolute ypr, arms/legs = dir (+twist), facing normalised (hips yaw removed, kept in _src); root motion is dropped.
// Bakes VRMA key times into poses.json entries (core.js format). --check renders clip-vs-baked stills side by side.
const http=require('http'),path=require('path'),fs=require('fs');
const SERVE = (ROOT) => http.createServer((q, r) => { // "/h/..." = this tool folder (pages + node_modules), everything else = ROOT (your models/clips)
  const u = decodeURIComponent(q.url.split('?')[0]); const base = u.startsWith('/h/') ? __dirname : ROOT; const p = path.join(base, u.startsWith('/h/') ? u.slice(3) : u);
  if (!p.startsWith(base) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : p.endsWith('.png') ? 'image/png' : p.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
const PW = process.env.PLAYWRIGHT ?? '/opt/node-tools/node_modules/playwright';
const { chromium } = require(PW);
(async()=>{ const [model,clip,prefix,ts,outFile,flag,chk]=process.argv.slice(2); const times=ts.split(',').map(Number);
 const srv=SERVE(process.cwd());
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const page=await b.newPage({viewport:{width:360,height:640}});
 page.on('pageerror',e=>console.error('PAGEERR',e.message));
 await page.goto(`http://127.0.0.1:${srv.address().port}/h/vrma2poses.html`); await page.waitForFunction(()=>window.READY===true);
 await page.evaluate(m=>window.init(m),model); const res=await page.evaluate(([c,t])=>window.bake(c,t),[clip,times]);
 const poses={}; res.out.forEach((o,i)=>{ const {_hips,...P}=o.pose; poses[`${prefix}_${i}`]=P; });
 fs.writeFileSync(outFile,JSON.stringify(poses,null,0)); console.log('clip',res.dur.toFixed(2),'s ->',Object.keys(poses).length,'poses ->',outFile);
 if(flag==='--check'){ fs.mkdirSync(chk,{recursive:true}); let i=0; for(const o of res.out){ 
   await page.evaluate(([c,t])=>window.bake(c,[t]),[clip,[o.t]]); const a=await page.evaluate(()=>window.shot(true)); const {_hips,...P}=o.pose; await page.evaluate(P=>window.apply(P),P); const bb=await page.evaluate(()=>window.shot(true));
   fs.writeFileSync(path.join(chk,`${prefix}_${i}_clip.jpg`),Buffer.from(a.split(',')[1],'base64')); fs.writeFileSync(path.join(chk,`${prefix}_${i}_baked.jpg`),Buffer.from(bb.split(',')[1],'base64')); i++; } }
 await b.close(); srv.close(); })();
