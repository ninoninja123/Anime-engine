// loads every engine module in order (shared by index.html, lab.html, sheet pages)
// 1) core modules  2) extension modules from modules.js (auto manifest of engine/poses_*, chars_*, fx_*, sets_*, impact_*)
// 3) program files (?prog=a,b).  See README.md "Moduulit".
(function(){const base=(document.currentScript&&document.currentScript.src||'').replace(/scripts\.js.*$/,'');
const mods=['core','camera','toon','paintlib','rig','body','faces','chars','world','fx','impact','text','post','timeline','shotkit','props'];
const extra=(new URLSearchParams(location.search).get('prog')||'').split(',').filter(Boolean);
const w=f=>document.write('<script src="'+base+f+'.js" onerror="console.log(\'missing '+f+'\')"><\/script>');
for (const f of mods) w(f);
w('modules');
for (const f of extra) w(f);})();
