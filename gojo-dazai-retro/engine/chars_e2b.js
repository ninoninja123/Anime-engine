/* engine/chars_e2b.js (E2) - extra forms for showdown part 3 (no changes to other characters' base designs).
   kyoraku: shikai_hurt (battle damage, blood from the hat brim), shikai_nohat (hat knocked off)
   (joker 'dying' form lives in chars_fire.js: this file loads before it)                                                    */
'use strict';
(function () {
  const K = CAST.kyoraku; if (K && K.forms && K.forms.shikai) {
    const hurtExtras = (S, D, F, t, parts, opt) => { if (typeof kyorakuSwords === 'function') kyorakuSwords(S, D, F, t, parts, opt); if (typeof woundParts === 'function') woundParts(S, D, parts, opt, D.wounds || S.pose.wounds || 0); };
    K.forms.shikai_hurt = Object.assign({}, K.forms.shikai, { wounds: 2, extras: hurtExtras });
    K.forms.shikai_nohat = Object.assign({}, K.forms.shikai, { wounds: 2, noHat: true, extras: hurtExtras });
  }
})();
