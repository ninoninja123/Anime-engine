// PROLOGUE "The story so far" – seven panels drawn with code (SVG layers, src/story/panels.js). Player: src/prologue.js.
// Backstory (Ginga: Nagareboshi Gin) → years of peace → the present crisis at the start of Weed's story.
// Only well-established canon is narrated; uncertain details are left out or kept general (docs/weed-game/story-intro-svg.md).
//
// Panel fields:
//   scene      key in SCENES (src/story/panels.js): returns the panel's SVG layers far → near
//   cam        camera over the whole panel: { from:[scale, x%, y%], to:[scale, x%, y%] }; each layer follows it
//              by its depth (near layers move more → parallax)
//   fx         particle layers on the canvas: 'stars' 'snow' 'blizzard' 'motes' 'seeds' 'leaves' 'embers' 'fireflies' 'sparks'
//   kicker     small chapter text (top left), title: big centred title card
//   steps      { say } line id (src/data/lines.js), { wait }, { sfx, arg }, { shake }, { flash }, { beat } (adds CSS class
//              b-<beat> to the panel → src/prologue.css animates the layer), { music }, { ambience }, { title }
//   hold       extra seconds after the last step; xfade = transition into this panel (s); trans: 'fade' | 'cut' | 'iris'

export const PROLOGUE_MUSIC = 'dawn';      // 'A New Horizon' (Epidemic) – the menu's intro song stays in the menu (user's wish); crisis panels switch to 'sad'

export const PANELS = [
  {
    id: 'legend', scene: 'legend',
    cam: { from: [1.16, 0, 3], to: [1.04, -2, 0] },
    fx: ['stars', 'motes'],
    title: { kicker: 'Before the story begins', main: 'THE STORY SO FAR' },
    steps: [{ wait: 1.0 }, { sfx: 'howl' }, { wait: 2.2 }, { title: false }, { say: 'story_01' }],
    hold: 0.4, xfade: 1.6,
  },
  {
    id: 'gin', scene: 'village',
    cam: { from: [1.04, 2, 0], to: [1.16, -3, -1] },
    fx: ['snow'],
    kicker: 'Long ago · Ginga: Nagareboshi Gin',
    steps: [{ say: 'story_02' }, { say: 'story_03' }],
    hold: 0.3,
  },
  {
    id: 'akakabuto', scene: 'akakabuto',
    cam: { from: [1.22, -3, 4], to: [1.06, 0, 0] },
    fx: ['blizzard'],
    kicker: 'Futago Pass · Gajō',
    steps: [{ sfx: 'rumble', arg: 2.4 }, { shake: 0.5 }, { say: 'story_04' }, { sfx: 'roar' }, { beat: 'roar' }, { shake: 1 }, { wait: 0.8 }],
    hold: 0.2,
  },
  {
    id: 'battle', scene: 'battle',
    cam: { from: [1.05, 3, 0], to: [1.18, -2, -1] },
    fx: ['snow', 'motes'],
    kicker: 'The Ōu army · Battōga',
    steps: [{ sfx: 'bark' }, { say: 'story_05' }, { wait: 0.3 },
      { beat: 'battoga' }, { sfx: 'battoga' }, { wait: 0.35 }, { flash: 0.9 }, { shake: 1.2 }, { sfx: 'boom' }, { wait: 0.6 },
      { beat: 'fall' }, { say: 'story_06' }],
    hold: 0.6, xfade: 0.6, trans: 'cut',
  },
  {
    id: 'paradise', scene: 'paradise',
    cam: { from: [1.16, -2, -2], to: [1.04, 1, 1] },
    fx: ['seeds', 'motes'],
    kicker: 'Fourteen years of peace',
    steps: [{ ambience: true }, { say: 'story_07' }, { beat: 'years' }, { say: 'story_08' }],
    hold: 0.6, xfade: 2.0,
  },
  {
    id: 'ruin', scene: 'ruin',
    cam: { from: [1.04, 2, 0], to: [1.2, -4, -1] },
    fx: ['embers'],
    kicker: 'Now',
    steps: [{ ambience: false }, { music: 'sad' }, { sfx: 'rumble', arg: 1.6 }, { say: 'story_09' }, { sfx: 'roar' }, { beat: 'roar' }, { shake: 0.6 }, { wait: 0.4 },
      { beat: 'hunt' }, { say: 'story_10' }, { beat: 'far' }, { say: 'story_11' }],
    hold: 0.4, xfade: 1.2,
  },
  {
    id: 'weed', scene: 'weed',
    cam: { from: [1.05, 0, 0], to: [1.2, 3, -2] },
    fx: ['leaves', 'motes'],
    kicker: 'Weed',
    steps: [{ ambience: false }, { music: 'dawn', fade: 2.4 }, { say: 'story_12' }, { say: 'story_vow' },
      { title: { kicker: 'A small dog with a great heart', main: 'WEED', sub: 'Ōu Saga' } }, { wait: 3.2 }],
    hold: 0.4, xfade: 1.8, trans: 'iris',
  },
];

/** Line ids used by the prologue (voice preloading / docs). */
export const PROLOGUE_LINES = PANELS.flatMap(p => p.steps.filter(s => s.say).map(s => s.say));
