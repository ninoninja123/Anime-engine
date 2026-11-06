/* engine/impact_e2b.js (E2) - impact series used by showdown/part3.js.  Loads after impact_e1.js: every alias below is defined
   ONLY if E1 has not defined it already (E1's own versions win).  X-* = masked series named in pre/spoilers.md.            */
'use strict';
(function () {
  const def = (k, v) => { if (!IMPACT_SEQ[k]) IMPACT_SEQ[k] = v; };
  def('FLAME_TIGER', [{ s: 'sumi', n: 1, p: { ang: -.3 } }, { s: 'rimsil', n: 1, p: { col: '#ffb04a', col2: '#e8501a', rimCol: '#fff4c0' } }, { s: 'sumi', n: 1 }]);
  def('DESTRUCTIVE_BLUE', [{ s: 'rings', n: 1, p: { col: '#4ab8ff' } }, { s: 'black', n: 1 }, { s: 'rings', n: 1, p: { col: '#ff3a5a' } }]);
  def('LION_CLAW', [{ s: 'tear', n: 1, p: { light: '#ff6a2a', dark: '#1a0408' } }, { s: 'redblack', n: 1, p: { col: '#d0145a' } }, { s: 'tear', n: 1, p: { light: '#ff3d6e', dark: '#1a0408' } }]);
  def('HELLFIRE', [{ s: 'overexpose', n: 1, p: { col: '#fff0b0' } }, { s: 'posterize', n: 1, p: { cols: ['#2a0818', '#d0145a', '#ff8a5a', '#fff0b0'] } }, { s: 'flash', n: 1, p: { col: '#fff6d8' } }]);
  def('BLOOD_MIST', [{ s: 'shatter', n: 1, p: { gap: '#d2203a' } }, { s: 'flash', n: 1 }, { s: 'shatter', n: 1, p: { gap: '#6a0010' } }]);
  def('SUIT_FLASH', [{ s: 'kanji', n: 1, p: { char: '♠', col: '#ff3a3a', col2: '#ffd0b0', outline: '#000', tint: '#1a0006' } }, { s: 'flash', n: 1 }, { s: 'kanji', n: 1, p: { char: '♥', col: '#ff3a3a', col2: '#ffd0b0', outline: '#000', tint: '#1a0006' } }]);
  def('JOKER_53', [{ s: 'closeup', n: 1, p: { part: 'eye', mode: 'invert', strip: true, stripH: 300 } }, { s: 'duotone', n: 1, p: { dark: '#12001a', light: '#c04ae0' } }]);
  def('NICHIRIN_HALO', [{ s: 'radial', n: 1, p: { lineCol: '#ffb04a', ringCol: '#ff6a1a' } }, { s: 'rimsil', n: 2, p: { col: '#ffd23a', col2: '#e8401a', rimCol: '#fff' } }, { s: 'flash', n: 1, p: { col: '#fff4d0' } }]);
  def('CRIMSON_MOON', [{ s: 'overexpose', n: 1, p: { col: '#c8102e' } }, { s: 'rimsil', n: 2, p: { col: '#ff3a3a', col2: '#6a0010' } }, { s: 'flash', n: 1 }]);
  def('KANNON_THREAD', [{ s: 'crimsonline', n: 1, p: { col: '#d2203a', ang: .4 } }, { s: 'crimsonline', n: 1, p: { col: '#d2203a', ang: -.5 } }, { s: 'whiteout', n: 1, p: { ink: '#6a0010' } }, { s: 'invert', n: 1, p: { hue: 140 } }]);
  def('PURGATORY_DRAGON', [{ s: 'speedburst', n: 1 }, { s: 'overexpose', n: 1, p: { col: '#ffb04a' } }]);
  def('RED_BLACK_SPLIT', [{ s: 'dualsplit', n: 1, p: { col: '#c8101a', col2: '#000000' } }, { s: 'redblack', n: 1 }]);
  // masked series (spoilers.md) - exact frame counts
  def('X-E2a', [{ s: 'rings', n: 1, p: { col: '#4ab8ff' } }, { s: 'flash', n: 1 }, { s: 'speedburst', n: 1 }, { s: 'redblack', n: 1, p: { col: '#e8501a' } }, { s: 'crimsonline', n: 1, p: { col: '#c8101a', ang: -.9, w: 30 } }, { s: 'flash', n: 1 }]);
  def('X-E2b', [{ s: 'overexpose', n: 1, p: { col: '#fff0b0' } }, { s: 'posterize', n: 1, p: { cols: ['#2a0818', '#d0145a', '#ff8a5a', '#fff0b0'] } }, { s: 'rimsil', n: 1, p: { col: '#ff8a3a', col2: '#5a0a08' } }]);
  def('X-E3a', [{ s: 'closeup', n: 1, p: { part: 'eye', mode: 'invert', strip: true, stripH: 300 } }, { s: 'duotone', n: 1, p: { dark: '#12001a', light: '#c04ae0' } }, { s: 'shatter', n: 1, p: { gap: '#d2203a' } }, { s: 'flash', n: 1 }]);
  def('X-E3b', [{ s: 'crimsonline', n: 1, p: { col: '#d2203a', ang: .4 } }, { s: 'crimsonline', n: 1, p: { col: '#d2203a', ang: -.5 } }, { s: 'whiteout', n: 1, p: { ink: '#6a0010' } }, { s: 'invert', n: 1, p: { hue: 140 } }]);
  def('X-E3c', [{ s: 'kanji', n: 1, p: { char: '♠', col: '#c84aff', col2: '#ffd0b0', outline: '#000', tint: '#12001a' } }, { s: 'kanji', n: 1, p: { char: '♥', col: '#ff3a3a', col2: '#ffd0b0', outline: '#000', tint: '#12001a' } }, { s: 'flash', n: 1 }]);
  def('X-E3d', [{ s: 'radial', n: 1, p: { lineCol: '#ffb04a', ringCol: '#ff6a1a' } }, { s: 'overexpose', n: 1, p: { col: '#c8102e' } }, { s: 'flash', n: 1, p: { col: '#fff4d0' } }, { s: 'overexpose', n: 1, p: { col: '#ff3a1a' } }, { s: 'black', n: 1 }]);
  def('X-E3e', [{ s: 'sumi', n: 1, p: { ang: .6 } }, { s: 'sumi', n: 1, p: { ang: -.6 } }, { s: 'dualsplit', n: 1, p: { col: '#c8101a', col2: '#000000' } }, { s: 'redblack', n: 1 }]);
})();
