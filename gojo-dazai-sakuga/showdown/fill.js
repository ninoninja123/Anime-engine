/* showdown/fill.js - loaded last: any shot of shots.json not defined by part1/part2 gets a grey TODO card (so timing/preview always works).
   Remove nothing here; when every shot exists this file does nothing. */
(function () { const have = new Set(PROGRAM.shots.map(s => s.name)); for (const id of SHOT_ORDER) if (!have.has(id)) placeholderShot(id); })();
