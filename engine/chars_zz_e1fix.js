/* engine/chars_zz_e1fix.js (E1) - small proportion tweaks applied after the E2 modules (polish pass, see showdown/ENGINE_NOTES.md).
   E2 already thickened Joker's body/coat in chars_fire.js; this only adds fuller trouser legs and heavier shoes. */
'use strict';
(function () {
  const J = CAST.joker; if (!J) return;
  Object.assign(J.hakama, { r1: Math.max(J.hakama.r1 || 0, .094), r2: Math.max(J.hakama.r2 || 0, .088) });
  Object.assign(J.feet, { w: 1.2, soleCol: '#0a090c', soleH: .015 });
  delete J._body; for (const k of Object.keys(J)) if (k.startsWith('_m_')) delete J[k];
})();
