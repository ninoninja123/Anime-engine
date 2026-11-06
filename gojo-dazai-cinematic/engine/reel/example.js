/* EXAMPLE PROGRAM - the smallest complete shot list (read this first, then reel/testreel.js).
   Run:  node render.js stills reel/example /tmp/ex 0.5,1.2,2.0      or open index.html?prog=reel/example        */
PROGRAM.reset(4, 'example');                       // total duration (s)

// 1) characters: fig(castName, form, poseKeys|fn, opts)
const BYA = fig('byakuya', 'base', [               // pose keys in LOCAL shot time: [t, pose, ease]
  [0.0, at([-1.5, 0, 0], HP, P('guard', { face: expr('calm') }))],
  [0.8, at([-1.5, 0, 0], HP, P('slashWind', { face: expr('focused') })), 'inOut'],
  [1.0, at([-0.6, 0, 0], HP, P('slashDown', { face: expr('angry') })), 'snap'],     // snap = sakuga accent
  [2.0, at([-0.6, 0, 0], HP, P('slashDown', { face: expr('angry') }))],
], { timing: 1 });                                  // 1 = on ones (sakuga), 2 = on twos (normal acting)
const KEN = fig('kenpachi', 'base', t => breathe(at([1.4, 0, 0], -HP, P('kenpachi_shoulder', { face: expr('grin') })), t), { timing: 2 });

// 2) a shot: shot(name, t0, t1, (f, lt, u, T) => { ... })
shot('EX01', 0, 4, (f, lt) => {
  std(f, { pal: 'dusk' });                                          // colour script + post preset + key light
  f.cam(camPath([                                                    // camera keys (orbit keys arc around c)
    { t: 0, orbit: { c: [0, 1.2, 0], r: 6.5, az: .5, el: .1 }, fov: 34 },
    { t: 4, orbit: { c: [0, 1.2, 0], r: 4.8, az: -.3, el: .02 }, fov: 32, ease: 'inOut' }])(lt));
  f.shake([[1.0, 22, .45]]);                                        // [t0, px, dur] in local time
  f.bg({ set: 'seireitei', pal: 'dusk' });                          // painted 3D set
  f.fig(BYA); f.fig(KEN);                                           // depth-sorted figures (contact shadows on)
  f.fx(g => fxSlashArc(g, BYA, lt, { span: .12, edgeCol: '#ffc0d8' }), { layer: 'over' });
  f.fx(g => fxClash(g, [.4, 1.5, 0], lt - 1.0), { layer: 'glow' }); // additive, feeds bloom
  f.impact('byakuya_scatter', { t0: 1.0, at: [.4, 1.5, 0] });       // impact frame sequence at lt = 1.0
  f.text(g => attackTitle(g, lt, { t0: 1.3, text: 'Senbonzakura', sub: '千本桜' }));
  sfx(1.0, 'clash', { shot: 'EX01' });                              // marker exported for the audio agent
});
