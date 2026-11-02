/* MASTER PROGRAM: ITACHI UCHIHA vs JULIUS NOVACHRONO.  index.html?prog=../showdown/program
   Length = SHOW_DUR from pre/shots.json (meta.duration, <= 180 s) via shots_data.js (python3 gen_data.py; make.sh runs it).
   Part 1 (t0 < PART_SPLIT) = part1.js | Part 2 (t0 >= PART_SPLIT) = part2.js.  PART_SPLIT = the 12 s segment boundary NEAREST the middle
   (Math.round(SHOW_DUR / 2 / 12) * 12; make.sh uses the same formula).  Shared: shots_data.js, common.js.
   Engine modules (engine/*_ij.js + older ones) load automatically before this file.                                   */
(function () {
  const base = (document.currentScript && document.currentScript.src || '').replace(/program\.js.*$/, '');
  document.write('<script src="' + base + 'shots_data.js" onerror="console.log(\'missing shots_data.js\')"><\/script>');
  document.write('<script>PROGRAM.reset(typeof SHOW_DUR !== "undefined" ? SHOW_DUR : 180, "showdown"); var PART_SPLIT = Math.round(((typeof SHOW_DUR !== "undefined" ? SHOW_DUR : 180) / 2) / 12) * 12;<\/script>');
  for (const f of ['common.js', 'part1.js', 'part2.js', 'fill.js']) document.write('<script src="' + base + f + '" onerror="console.log(\'missing ' + f + '\')"><\/script>');
})();
