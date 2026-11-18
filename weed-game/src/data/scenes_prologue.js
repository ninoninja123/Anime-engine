// PROLOGUE "The story so far" – illustrated panels (data). Player: src/prologue.js.
// Backstory (Ginga: Nagareboshi Gin) → years of peace → the present crisis at the start of Weed's story.
// Only well-established canon is narrated; uncertain details are left out or kept general (docs/weed-game/story-art-notes.md).
//
// Panel fields:
//   img        public/story/<file>.webp (generated art, not in git). If it fails to load, `paint` draws a fallback.
//   paint      fallback painting: { sky:[top,bottom], orb:{x,y,r,color,glow}, ridges:[colors far→near], haze }
//   kb         Ken Burns: { from:[scale, x%, y%], to:[scale, x%, y%] } (translate in % of the frame)
//   fx         particle layers: 'stars' 'snow' 'blizzard' 'motes' 'seeds' 'leaves' 'rain' 'fireflies' 'sparks'
//   filter     optional CSS filter on the art (e.g. autumn grading of the final panel: Weed's journey is in late autumn)
//   light      animated light: 'moon' 'warm' 'redstorm' 'flash' 'sun' 'alarm' 'beams' 'dawn'
//   grade      CSS colour grade layered over the art (mix-blend soft-light)
//   kicker     small chapter text (top left), title: big centred title card
//   steps      what happens over the panel: { say }, { wait }, { sfx, arg }, { shake }, { flash }, { music }, { ambience }
//   hold       extra seconds after the last step; xfade = crossfade into this panel (s)

export const PROLOGUE_MUSIC = 'dawn';      // 'A New Horizon' (Epidemic) – the menu's intro song stays in the menu (user's wish); crisis panels switch to 'sad'

export const PANELS = [
  {
    id: 'legend', img: 'story/01_moon.webp',
    paint: { sky: ['#06102a', '#2a3f6e'], orb: { x: 0.72, y: 0.22, r: 0.09, color: '#f4f1e6', glow: 'rgba(190,210,255,0.35)' }, ridges: ['#2c3d63', '#1d2a48', '#121b31', '#070b16'], haze: 'rgba(150,175,230,0.18)' },
    kb: { from: [1.18, 2, 2], to: [1.06, -1.5, -1] },
    fx: ['stars', 'motes'], light: 'moon', grade: 'linear-gradient(180deg, rgba(40,70,140,0.25), rgba(0,0,0,0.25))',
    title: { kicker: 'Before the story begins', main: 'THE STORY SO FAR', jp: '銀牙伝説' },
    steps: [{ wait: 1.0 }, { sfx: 'howl' }, { wait: 2.2 }, { title: false }, { say: 'story_01' }],
    hold: 0.4, xfade: 1.6,
  },
  {
    id: 'gin', img: 'story/02_village.webp',
    paint: { sky: ['#3b2a5c', '#f08a4b'], orb: { x: 0.78, y: 0.36, r: 0.05, color: '#ffd59a', glow: 'rgba(255,170,90,0.45)' }, ridges: ['#5a4d7a', '#3f3a5e', '#2a2840', '#e9e4f2'], haze: 'rgba(255,190,150,0.15)' },
    kb: { from: [1.05, -1, 0], to: [1.2, 3, 2] },
    fx: ['snow'], light: 'warm', grade: 'linear-gradient(180deg, rgba(120,60,140,0.18), rgba(255,140,60,0.12))',
    kicker: 'Long ago · Ginga: Nagareboshi Gin',
    steps: [{ say: 'story_02' }, { say: 'story_03' }],
    hold: 0.3,
  },
  {
    id: 'akakabuto', img: 'story/03_akakabuto.webp',
    paint: { sky: ['#1a0406', '#7a1410'], orb: { x: 0.82, y: 0.2, r: 0.06, color: '#c0281c', glow: 'rgba(200,30,20,0.5)' }, ridges: ['#3a1612', '#24100e', '#140908', '#050303'], haze: 'rgba(220,60,40,0.12)' },
    kb: { from: [1.25, -4, 4], to: [1.08, 0, 0] },
    fx: ['blizzard'], light: 'redstorm', grade: 'linear-gradient(180deg, rgba(140,0,0,0.22), rgba(0,0,0,0.35))',
    kicker: 'Futago Pass · Gajō',
    steps: [{ sfx: 'rumble', arg: 2.4 }, { shake: 0.5 }, { say: 'story_04' }, { sfx: 'roar' }, { shake: 1 }, { wait: 0.6 }],
    hold: 0.2,
  },
  {
    id: 'army', img: 'story/04_army.webp',
    paint: { sky: ['#4b5a86', '#ffc46b'], orb: { x: 0.84, y: 0.42, r: 0.06, color: '#fff2c4', glow: 'rgba(255,200,110,0.55)' }, ridges: ['#7c84a6', '#4e5577', '#2f3350', '#e8e1d6'], haze: 'rgba(255,210,150,0.2)' },
    kb: { from: [1.06, 3, 0], to: [1.2, -3, -2] },
    fx: ['snow', 'motes'], light: 'sun', grade: 'linear-gradient(180deg, rgba(255,190,90,0.10), rgba(60,40,90,0.15))',
    kicker: 'The Ōu army',
    steps: [{ sfx: 'bark' }, { say: 'story_05' }],
    hold: 0.5,
  },
  {
    id: 'battle', img: 'story/05_battoga.webp',
    paint: { sky: ['#0c1630', '#46608c'], ridges: ['#4a5a7a', '#2e3a55', '#1a2236', '#0b0f1a'], haze: 'rgba(200,225,255,0.2)' },
    kb: { from: [1.32, 6, 0], to: [1.1, 0, 0] },
    fx: ['blizzard', 'sparks'], light: 'flash', grade: 'linear-gradient(90deg, rgba(160,200,255,0.18), rgba(140,20,20,0.18))',
    kicker: 'Battōga',
    steps: [{ sfx: 'battoga' }, { flash: 0.9 }, { shake: 1.2 }, { sfx: 'boom' }, { say: 'story_06' }],
    hold: 0.6, xfade: 0.5,
  },
  {
    id: 'paradise', img: 'story/06_paradise.webp',
    paint: { sky: ['#5f9ad6', '#dff0ff'], orb: { x: 0.2, y: 0.18, r: 0.07, color: '#fffbe6', glow: 'rgba(255,250,210,0.5)' }, ridges: ['#8fb0c9', '#4f7d5a', '#2f5a3a', '#1d3a24'], haze: 'rgba(255,255,240,0.18)' },
    kb: { from: [1.18, -2, -2], to: [1.04, 1, 1] },
    fx: ['seeds', 'motes'], light: 'sun', grade: 'linear-gradient(180deg, rgba(255,230,160,0.12), rgba(255,255,255,0.05))',
    kicker: 'Fourteen years of peace',
    steps: [{ ambience: true }, { say: 'story_07' }, { say: 'story_08' }],
    hold: 0.6, xfade: 2.0,
  },
  {
    id: 'lab', img: 'story/07_lab.webp',
    paint: { sky: ['#03070a', '#18302c'], orb: { x: 0.8, y: 0.38, r: 0.012, color: '#ff8a1e', glow: 'rgba(255,120,20,0.7)' }, ridges: ['#13221f', '#0c1715', '#070d0c', '#020404'], haze: 'rgba(90,160,140,0.12)' },
    kb: { from: [1.04, 2, 0], to: [1.22, -5, -1] },
    fx: ['rain'], light: 'alarm', grade: 'linear-gradient(180deg, rgba(0,40,30,0.25), rgba(0,0,0,0.3))',
    kicker: 'Now',
    steps: [{ ambience: false }, { music: 'sad' }, { sfx: 'rumble', arg: 1.6 }, { say: 'story_09' }, { sfx: 'roar' }, { shake: 0.6 }, { wait: 0.4 }],
    hold: 0.2, xfade: 1.2,
  },
  {
    id: 'hunt', img: 'story/08_hunt.webp',
    paint: { sky: ['#03050c', '#162038'], ridges: ['#1b2540', '#111829', '#0a0f1b', '#03050a'], haze: 'rgba(200,215,255,0.1)' },
    kb: { from: [1.2, 4, 1], to: [1.06, 0, -1] },
    fx: ['leaves', 'motes'], light: 'beams', grade: 'linear-gradient(180deg, rgba(20,30,70,0.25), rgba(0,0,0,0.3))',
    kicker: 'Futago Pass, late autumn',
    steps: [{ ambience: true }, { say: 'story_10' }, { say: 'story_11' }],
    hold: 0.4,
  },
  {
    id: 'weed', img: 'story/09_weed.webp',
    paint: { sky: ['#7aa6d8', '#ffd18a'], orb: { x: 0.8, y: 0.3, r: 0.06, color: '#fff6d8', glow: 'rgba(255,220,150,0.6)' }, ridges: ['#9fb7c9', '#6f927a', '#456b4c', '#26402b'], haze: 'rgba(255,235,200,0.22)' },
    kb: { from: [1.06, 0, 0], to: [1.22, 4, -3] },
    fx: ['leaves', 'motes'], light: 'dawn', grade: 'linear-gradient(180deg, rgba(255,190,110,0.16), rgba(200,90,30,0.14))',
    kicker: 'Weed', filter: 'sepia(0.28) saturate(1.15) hue-rotate(-10deg)',
    steps: [{ ambience: false }, { music: 'dawn', fade: 2.4 }, { say: 'story_12' }, { say: 'story_vow' },
      { title: { kicker: 'A small dog with a great heart', main: 'WEED', sub: 'Ōu Saga', jp: '銀牙伝説ウィード' } }, { wait: 3.2 }],
    hold: 0.4, xfade: 1.8,
  },
];

/** Line ids used by the prologue (voice preloading / docs). */
export const PROLOGUE_LINES = PANELS.flatMap(p => p.steps.filter(s => s.say).map(s => s.say));
