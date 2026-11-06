/* TEST REEL (engine showcase, no story, no finale) ~36 s.
   Every character from several angles in motion (one on-ones sakuga beat each), every impact style, camera moves
   (crane, orbit, dolly, whip, handheld, dutch, rack focus, vertigo), 5 sets, effect samples.                   */
PROGRAM.reset(36, 'testreel');
const Z3 = [0, 0, 0];

// ---------------------------------------------------------------- 1. Byakuya: crane down over the roofs to the street (0-3.4)
{
  const by = fig('byakuya', 'base', t => breathe(at([0, 0, 0], .4, P('byakuya_point', { face: expr('calm'), sword: { hand: 'R', dir: [.1, -.85, .5] } })), t), { wind: t => [-8, 0, -3] });
  shot('R01_byakuya_crane', 0, 3.4, (f, lt) => {
    std(f, { pal: 'dusk' });
    const cam = camPath([{ t: 0, pos: [-9, 15, 18], target: [0, 4, 0], fov: 42 }, { t: 2.0, pos: [-3.2, 2.4, 6.5], target: [0, 1.5, 0], fov: 34, ease: 'inOut' }, { t: 3.4, orbit: { c: [0, 1.4, 0], r: 4.2, az: .55, el: .06 }, fov: 30, ease: 'out' }])(lt);
    f.cam(camHandheld(cam, lt, .015));
    f.bg({ set: 'seireitei', pal: 'dusk' });
    f.fig(by);
    f.fx(g => fxPetals(g, lt, { n: 260, size: .06, flow: (i, u, t) => [((u * 30 + t * 4 + hash(i) * 3) % 30) - 15, .3 + hash(i * 3) * 4 + Math.sin(t + i) * .3, (hash(i * 7) - .5) * 14] }), { layer: 'over' });
    f.text(g => attackTitle(g, lt, { t0: 2.2, dur: 1.0, text: 'Kuchiki Byakuya', small: 'captain · 6th division', size: 74, col2: '#e8e0ff' }));
  });
}
// ---------------------------------------------------------------- 2. Kenpachi: low-angle walk, eyepatch off, skull aura (3.4-7.0)
{
  const kp = fig('kenpachi', 'base', t => { const p = walkCycle(t * .9, { sword: { hand: 'R', dir: [.25, .35, -.9] }, aR: [2.2, -.15, 0], eR: 2.3, hR: 'grip', face: expr('grin') }); return Object.assign(p, { pos: [0, 0, -4 + Math.min(t, 1.9) * 1.6], yaw: 0 }); }, { timing: 2 });
  const kp2 = fig('kenpachi', 'unleashed', K([[0, at([0, 0, -.96], 0, P('kenpachi_open', { face: expr('grin') }))], [.25, at([0, 0, -.96], 0, P('roar', { face: expr('rage'), sword: { hand: 'R', dir: [.95, -.3, 0] }, hR: 'grip' })), 'snap'], [1.6, at([0, 0, -.96], 0, P('roar', { face: expr('rage'), sword: { hand: 'R', dir: [.95, -.3, 0] }, hR: 'grip' }))]]));
  shot('R02_kenpachi_walk', 3.4, 5.4, (f, lt) => {
    std(f, { pal: 'storm', post: 'dark' });
    f.cam(camHandheld({ pos: [.6, .25, 1.6], target: [0, 1.7, -3], fov: 36, roll: -.08 }, lt, .03, 3));
    f.bg({ set: 'seireitei', pal: 'storm', dmg: 1, seed: 2 }); f.fig(kp);
    f.fx(g => { const S = figSkel(kp, onTwos(lt)); for (const sd of ['L', 'R']) if (S.J['heel' + sd][1] < .02) fxDust(g, vAdd(S.J['an' + sd], [0, -.06, 0]), (lt * .9 % .5) * 2, { size: .5, seed: sd === 'L' ? 3 : 4 }); }, { layer: 'under' });
  });
  shot('R03_kenpachi_unleash', 5.4, 7.0, (f, lt) => {
    std(f, { pal: 'storm', post: 'hot', grade: { tint: ['#ffe080', .2] } });
    const cam = camPath([{ t: 0, pos: [0, 1.0, 3.2], target: [0, 1.6, -1], fov: 34 }, { t: 1.6, pos: [0, .4, 4.8], target: [0, 2.2, -1], fov: 40, ease: 'out' }])(lt);
    f.cam(cam); f.shake([[.25, 22, .9, 30]]);
    f.bg({ set: 'seireitei', pal: 'storm', dmg: 1, seed: 2 });
    f.fx(g => { fxSkullAura(g, [0, 3.9, -1.6], lt, { size: 1.55, alpha: clamp((lt - .25) * 3, 0, .85) }); fxAura(g, kp2, lt, { col: '#ffd84a', col2: '#fff6c8', amt: clamp((lt - .2) * 4, 0, 1.2) }); fxPressure(g, [0, 0, -1], lt - .25, { r: 4, glow: '#ffd84a' }); }, { layer: 'under' });
    f.fig(kp2);
    f.impact('kenpachi_patch', { t0: .25 });
  });
}
// ---------------------------------------------------------------- 3. Hitsugaya sakuga (on ones): draw, leap, ice dragon (7.0-10.4)
{
  const ts = fig('hitsugaya', 'shikai', K([
    [0, at([0, 0, 0], .3, P('toshiro_draw', { face: expr('determined') }))],
    [.18, at([0, 0, 0], .3, P('crouch', { face: expr('focused'), sword: { hand: 'R', dir: [.2, .4, -.9] }, hR: 'grip' })), 'snap'],
    [.34, at([.4, 1.6, -.4], .2, P('toshiro_sky', { face: expr('shout') })), 'out'],
    [.62, at([.6, 2.3, -.8], .1, P('toshiro_sky', { face: expr('shout') })), 'out'],
    [.78, at([.7, 1.9, -1.0], 0, P('airSlash', { face: expr('shout') })), 'snap'],
    [1.6, at([.8, 1.2, -1.2], 0, P('airSlash', { face: expr('determined') })), 'out'],
  ]), { timing: 1 });
  shot('R04_toshiro_leap', 7.0, 8.4, (f, lt) => {
    std(f, { pal: 'ice', postOver: { bloom: .35 }, grade: { contrast: 1.12, tint: ['#bcd8f0', .3] } });
    const tg = followTarget(ts, lt, 'abd', .08), cam0 = camPath([{ t: 0, orbit: { c: [0, .8, 0], r: 4.0, az: -.9, el: .02 }, fov: 32 }, { t: 1.4, orbit: { c: [0, .8, 0], r: 4.6, az: -.2, el: -.3 }, fov: 36, ease: 'inOut' }])(lt); const cam = { pos: vAdd(cam0.pos, vSub(tg, [0, .8, 0])), target: tg, fov: cam0.fov };
    f.cam(cam); f.bg({ set: 'ice', pal: 'ice' });
    f.fig(ts, { afterimages: lt > .2 && lt < .7 ? [.04, .08, .12] : null, afterCol: '#bfefff' });
    f.fx(g => { fxSlashArc(g, ts, lt, { span: .1, edgeCol: '#9fe8ff' }); if (lt > .16) fxDust(g, [0, 0, 0], lt - .18, { col: '#eaf8ff', size: .7 }); fxSnow(g, lt, { n: 120 }); }, { layer: 'over' });
  });
  shot('R05_toshiro_dragon', 8.4, 10.4, (f, lt) => {
    std(f, { pal: 'ice', postOver: { bloom: .4 }, grade: { contrast: 1.12, tint: ['#bcd8f0', .3] } });
    const head = clamp(lt / 1.2, 0, 1.15);
    const cam = camPath([{ t: 0, pos: [2.6, 1.0, 5.2], target: [.4, 1.8, 0], fov: 40 }, { t: 2, pos: [1.0, .7, 4.4], target: [.4, 2.2, 0], fov: 50, ease: 'in' }])(lt);
    f.cam(camHandheld(cam, lt, .04, 5)); f.shake([[.9, 20, .8]]);
    f.light({ fx: [{ p: [0, 2, 2], col: '#7fe8ff', r: 8, a: .6 }] });
    f.bg({ set: 'ice', pal: 'ice' });
    f.fig(ts, { t: 1.6 + lt * .2 });
    f.fx(g => { fxIceDragon(g, lt, { path: iceDragonPath([.8, 1.6, -6], lt, { dir: [0, .05, 1], len: 10, head, wave: 1.0 }), r: .75 }); }, { layer: 'over' });
    f.fx(g => { fxIceGrowth(g, [0, 0, 2.5], lt - .9, { r: 3, h: 3.5, n: 18 }); fxFrost(g, [0, 0, 2], lt - .8, { r: 6 }); }, { layer: 'under' });
    f.impact('toshiro_dragon', { t0: .92, at: [.8, 1.8, 3] });
    f.text(g => attackTitle(g, lt, { t0: 1.2, dur: .8, text: 'Hyorinmaru', sub: '氷輪丸', col2: '#9fe8ff', glow: '#7fe8ff', align: 'right', x: W - 120 }));
  });
}
// ---------------------------------------------------------------- 4. Kyoraku: hat tip close-up, dual blades, Kageoni (10.4-13.6)
{
  const ky = fig('kyoraku', 'base', t => breathe(at([0, 0, 0], -.3, P('kyoraku_hat', { face: expr(t < .7 ? 'smile' : 'smirk', { eye: t < .7 ? .55 : .7 }) })), t), { timing: 2, wind: t => [3, 0, 2] });
  const ky2 = fig('kyoraku', 'shikai', K([[0, at([0, 0, 0], -.3, P('kyoraku_dual', { face: expr('smirk') }))], [.35, at([0, 0, 0], -.1, P('kyoraku_spread', { face: expr('focused') })), 'snap'], [1.8, at([0, 0, 0], .1, P('kyoraku_spread', { face: expr('focused') }))]]), { timing: 2 });
  shot('R06_kyoraku_hat', 10.4, 11.6, (f, lt) => {
    std(f, { pal: 'day', post: 'soft' });
    const S = figSkel(ky, 0), hc = S.J.head;
    f.cam({ pos: vAdd(hc, [-.12, -.07, .78 + lt * .06]), target: vAdd(hc, [-.05, -.01, 0]), fov: 30, focus: .8, aperture: 20 });
    f.bg({ set: 'courtyard', pal: 'day' }); f.fig(ky);
    f.fx(g => fxFlowerSwirl(g, lt, { c: [0, 1, 0], r: 1.6, n: 160, size: .045 }), { layer: 'over' });
  });
  shot('R07_kyoraku_dual', 11.6, 13.6, (f, lt) => {
    std(f, { pal: 'day' });
    const cam = camPath([{ t: 0, orbit: { c: [0, 1.1, 0], r: 5.5, az: .9, el: .05 }, fov: 34 }, { t: 2, orbit: { c: [0, 1.1, 0], r: 4.6, az: -.7, el: .18 }, fov: 34, ease: 'inOut' }])(lt);
    f.cam(cam); f.bg({ set: 'courtyard', pal: 'day', dmg: 1 });
    f.fx(g => { fxShadowPool(g, [1.6, 0, 1.4], lt - .8, { r: 1.3, blade: [-.2, 1, -.1], bladeAt: .25 }); }, { layer: 'under' });
    f.fig(ky2);
    f.fx(g => { fxSlashArc(g, ky2, lt, { span: .12, edgeCol: '#ffb0cc' }); fxSlashArc(g, ky2, lt, { span: .12, edgeCol: '#ffb0cc', sword2: Object.assign({}, figSkel(ky2, lt).pose.sword2 || {}, { hand: 'L' }) }); fxFlowerSwirl(g, lt, { c: [0, 1, 0], r: 2.6, n: 300 }); }, { layer: 'over' });
    f.impact('kyoraku_takaoni', { t0: .36 });
    f.text(g => attackTitle(g, lt, { t0: .7, dur: 1.1, text: 'Katen Kyokotsu', sub: '花天狂骨', col2: '#ff9ec4' }));
  });
}
// ---------------------------------------------------------------- 5. Tosen: Suzumushi rings, Benihiko volley, Enma Korogi dome (13.6-17.2)
{
  const tn = fig('tosen', 'shikai', K([[0, at([0, 0, 0], 0, P('tosen_ring', { face: expr('calm') }))], [.6, at([0, 0, 0], 0, P('tosen_ring', { face: expr('calm') }))], [.9, at([0, 0, 0], 0, P('tosen_benihiko', { face: expr('determined') })), 'snap'], [2, at([0, 0, 0], 0, P('tosen_benihiko', { face: expr('determined') }))]]), { timing: 2 });
  shot('R08_tosen_ring', 13.6, 15.4, (f, lt) => {
    std(f, { pal: 'night', post: 'dark' });
    const cam = camPath([{ t: 0, pos: [0, 1.6, 2.4], target: [0, 1.6, 0], fov: 30 }, { t: .8, pos: [1.2, 1.4, 3.6], target: [0, 1.5, 0], fov: 34, ease: 'inOut' }, { t: 1.8, pos: [3.2, 1.2, 5.2], target: [0, 1.4, -2], fov: 40 }])(lt);
    f.cam(cam); f.bg({ set: 'seireitei', pal: 'night', seed: 4 });
    f.fig(tn);
    f.fx(g => { const S = figSkel(tn, onTwos(lt)); fxSoundRings(g, S.J.handR, lt, { r: 3, col: '#e0d8ff' }); if (lt > .9) fxBenihiko(g, lt - .9, { c: [0, 1, 0], target: [0, 1.5, -12], fire: .35 }); }, { layer: 'glow' });
    f.impact('tosen_suzumushi', { t0: .5 });
  });
  shot('R09_tosen_enma', 15.4, 17.2, (f, lt) => {
    std(f, { pal: 'night' });
    f.cam(camPath([{ t: 0, pos: [6, 5, 30], target: [0, 3, 0], fov: 40 }, { t: 1.8, pos: [10, 10, 40], target: [0, 5, 0], fov: 44, ease: 'out' }])(lt));
    f.bg({ set: 'seireitei', pal: 'night', seed: 4 });
    f.fx(g => { fxEnmaRings(g, [0, 1, 0], lt, { r: 6 }); fxEnmaDome(g, [0, 0, 0], lt - .45, { r: 16, dur: 1.1 }); }, { layer: 'over' });
    f.impact('tosen_enma', { t0: 1.3 });
    f.fig(tn, { t: 2, hidden: true });
  });
}
// ---------------------------------------------------------------- 6. Mayuri: grin close-up, shikai thrust, Konjiki rises (17.2-21.0)
{
  const my = fig('mayuri', 'shikai', K([[0, at([0, 0, 0], 0, P('mayuri_hunch', { face: expr('grin', { eye: 1.2, pupil: .5 }) }))], [.9, at([0, 0, 0], 0, P('mayuri_hunch', { face: expr('grin', { eye: 1.25, pupil: .4 }) }))], [1.05, at([0, 0, .6], 0, P('mayuri_shikai', { face: expr('grin') })), 'snap'], [1.8, at([0, 0, .7], 0, P('mayuri_shikai', { face: expr('grin') }))]]), { timing: 2 });
  shot('R10_mayuri_grin', 17.2, 18.9, (f, lt) => {
    std(f, { pal: 'gloom', post: 'dark', grade: { sat: 1.0 } });
    const S = figSkel(my, onTwos(lt)), hc = S.J.head;
    const cam = lt < 1.0 ? { pos: vAdd(hc, [-.25, -.1, .65 - lt * .15]), target: hc, fov: 30, roll: .18 } : camLook([0, 1.3, .5], 3.6, -.3, .02, 34);
    f.cam(cam); f.bg({ set: 'seireitei', pal: 'gloom', seed: 3 }); f.fig(my);
    f.fx(g => { if (lt > 1.05) fxPoison(g, [0, 1.2, 1.6], lt - 1.05, { size: 1.2 }); }, { layer: 'over' });
    f.impact('mayuri_paralyze', { t0: 1.06 });
  });
  shot('R11_konjiki', 18.9, 21.0, (f, lt) => {
    std(f, { pal: 'gloom', post: 'hot', grade: { tint: ['#ffd890', .2] } });
    f.cam(camPath([{ t: 0, pos: [2, .4, 7], target: [0, 3, -6], fov: 44, roll: .1 }, { t: 2.1, pos: [4, .3, 9], target: [0, 6, -6], fov: 50, roll: .14, ease: 'out' }])(lt));
    f.shake([[0, 8, 2.1, 14]]);
    f.bg({ set: 'seireitei', pal: 'gloom', seed: 3, dmg: 2 });
    f.fx(g => { fxKonjiki(g, lt, { c: [0, 0, -6], scale: 1, rise: easeOut(clamp(lt / 1.2, 0, 1)), gas: lt > 1.2 ? lt - 1.2 : 0, mouth: .4 }); fxDebris(g, [0, 0, -4], lt, { n: 30, speed: 7, size: .3, seed: 9 }); }, { layer: 'over' });
    f.fig(my, { t: 1.8 });
    f.impact('mayuri_konjiki', { t0: 1.15 });
    f.text(g => attackTitle(g, lt, { t0: 1.4, dur: .7, text: 'Konjiki Ashisogi Jizo', sub: '金色疋殺地蔵', col2: '#ffd84a', size: 78 }));
  });
}
// ---------------------------------------------------------------- 7. Byakuya bankai: release, blades rise, petal river (21.0-24.6)
{
  const byb = fig('byakuya', 'bankai', K([[0, at([0, 0, 0], 0, P('byakuya_release', { face: expr('calm', { eye: .6 }) }))], [.5, at([0, 0, 0], 0, P('byakuya_release', { face: expr('eyesClosed') }))], [1.2, at([0, 0, 0], 0, P('byakuya_command', { face: expr('focused') })), 'out'], [3.6, at([0, 0, 0], 0, P('byakuya_command', { face: expr('focused') }))]]), { timing: 2, wind: t => [0, 4, -6] });
  shot('R12_bankai', 21.0, 24.6, (f, lt) => {
    std(f, { pal: 'dusk', post: 'hot', grade: { tint: ['#ffc8dc', .2] } });
    const cam = camPath([{ t: 0, pos: [0, .5, 2.6], target: [0, .7, 0], fov: 34 }, { t: 1.0, pos: [.8, .9, 3.4], target: [0, 1.0, 0], fov: 34, ease: 'inOut' }, { t: 3.6, pos: [9, 9, 12], target: [0, 2.5, -2], fov: 46, ease: 'inOut' }])(lt);
    f.cam(cam); f.bg({ set: 'courtyard', pal: 'dusk' });
    f.fig(byb);
    f.fx(g => { fxKageyoshi(g, lt - .5, { c: [0, 0, 0], r: 5.5, rows: 2, per: 18, h: 6.5 }); }, { layer: 'under' });
    f.fx(g => { const disperse = clamp((lt - 1.6) / 1.2, 0, 1); fxPetals(g, lt, { n: 2600, size: .06, flow: (i, u, t) => { const a = u * TAU * 3 + t * .9, r = 5.5 + 1.2 * hash(i * 3) + disperse * 4 * hash(i * 9), y = 6.5 * hash(i * 5) * (1 - disperse * .4) + disperse * hash(i * 11) * 6; return [Math.cos(a) * r, y, Math.sin(a) * r]; } }); }, { layer: 'over' });
    f.impact('byakuya_kageyoshi', { t0: 1.6 });
    f.text(g => attackTitle(g, lt, { t0: 1.95, dur: 1.3, text: 'Senbonzakura Kageyoshi', sub: '千本桜景厳', size: 82 }));
  });
}
// ---------------------------------------------------------------- 8. Clash montage (24.6-29.0)
{
  const A = fig('kenpachi', 'base', K([[0, at([2.2, 0, 0], -HP, P('kenpachi_kendo', { face: expr('grin') }))], [.35, at([1.2, 0, 0], -HP, P('kenpachi_kendoStrike', { face: expr('rage') })), 'snap'], [1.3, at([1.2, 0, 0], -HP, P('kenpachi_kendoStrike', { face: expr('rage') }))]]));
  const B = fig('byakuya', 'base', K([[0, at([-1.6, 0, 0], HP, P('ready', { face: expr('focused') }))], [.32, at([-1.1, 0, 0], HP, P('block', { face: expr('angry') })), 'snap'], [.6, at([-1.6, 0, 0], HP, P('block', { face: expr('angry') })), 'out'], [1.3, at([-1.7, 0, 0], HP, P('block', { face: expr('angry') }))]]));
  shot('R13_clash', 24.6, 25.9, (f, lt) => {
    std(f, { pal: 'noon', post: 'hot' });
    const lt2 = hitStop(lt, [[.36, .12]]);
    const base = camLook([.1, 1.35, 0], 5.4, .25, .05, 34);
    const w = camWhip(base, lt, 0, .3, .6, easeOut, true);
    f.cam(w.cam); f.motionBlur(lt < .3 ? w.blur : 0); f.shake([[.36, 30, .5]]);
    f.bg({ set: 'seireitei', pal: 'noon' });
    f.fig(A, { t: lt2 }); f.fig(B, { t: lt2 });
    f.fx(g => { fxSlashArc(g, A, lt2, { span: .12, edgeCol: '#ffe36a' }); fxClash(g, [.1, 1.6, 0], lt - .36, { r: 900 }); fxCracks(g, [0, 0, 0], lt - .36, { r: 5 }); fxAirRings(g, [.1, 1.6, 0], [-1, 0, 0], lt - .36); }, { layer: 'glow' });
    f.impact('hit_heavy', { t0: .36, at: [.1, 1.6, 0] });
  });
  const T = fig('hitsugaya', 'bankai', t => at([-.8, 3.2 + Math.sin(t * 2) * .1, 0], HP, P('toshiro_bankai', { face: expr('shout') })));
  const U = fig('tosen', 'resurreccion', t => at([1.2, 3.0, 0], -HP, P('tosen_justice', { face: expr('determined') })));
  shot('R14_aerial', 25.9, 27.4, (f, lt) => {
    std(f, { pal: 'storm', post: 'hot' });
    f.cam(camPath([{ t: 0, orbit: { c: [.2, 3.2, 0], r: 4.5, az: 2.2, el: -.45 }, fov: 36, roll: .2 }, { t: 1.5, orbit: { c: [.2, 3.2, 0], r: 3.6, az: 1.2, el: -.3 }, fov: 40, roll: -.15, ease: 'inOut' }])(lt));
    f.bg({ set: 'sky', pal: 'storm', clouds: 22 });
    f.fx(g => fxSpeedBG(g, lt, { ang: .3, col: '#ffffff', alpha: .35 }), { layer: 'under' });
    f.fig(T, { shadow: false }); f.fig(U, { shadow: false });
    f.fx(g => { fxClash(g, [.25, 3.6, 0], lt - .5, { col: '#bfefff' }); fxLightning(g, [.25, 3.6, 0], [3, 8, -4], lt, { hold: 2 }); }, { layer: 'glow' });
    f.impact('toshiro_bankai', { t0: .5 });
  });
  const M = fig('mayuri', 'shikai', K([[0, at([1.4, 0, 0], -HP, P('mayuri_shikai'))], [.3, at([.6, 0, 0], -HP, P('thrust', { face: expr('grin') })), 'snap'], [1.6, at([.6, 0, 0], -HP, P('thrust', { face: expr('grin') }))]]));
  const Y = fig('kyoraku', 'shikai', K([[0, at([-1.0, 0, 0], HP, P('kyoraku_dual'))], [.28, at([-1.3, .0, .5], HP + .4, P('dodge', { face: expr('smirk'), sword: { hand: 'R', dir: [.2, -.4, .9] } })), 'snap'], [1.6, at([-1.4, 0, .6], HP + .4, P('dodge', { face: expr('smirk'), sword: { hand: 'R', dir: [.2, -.4, .9] } }))]]), { timing: 2 });
  shot('R15_dodge', 27.4, 29.0, (f, lt) => {
    std(f, { pal: 'day' });
    f.cam(camVertigo(camPath([{ t: 0, pos: [-.4, 1.2, 6], target: [0, 1.2, 0], fov: 30 }, { t: 1.6, pos: [-.4, 1.2, 3.2], target: [0, 1.2, 0], fov: 30, ease: 'inOut' }])(lt), [0, 1.2, 0], 4.2));
    f.bg({ set: 'courtyard', pal: 'day', dmg: 2 });
    f.fig(M); f.fig(Y, { afterimages: lt > .2 && lt < .5 ? [.03, .06] : null, afterCol: '#ffd0e0' });
    f.fx(g => { fxSlashArc(g, M, lt, { span: .1, edgeCol: '#d8b0ff' }); fxPoison(g, [-.2, 1.2, 0], lt - .3, { size: .9 }); }, { layer: 'over' });
    f.impact('kyoraku_irooni', { t0: .3 });
  });
}
// ---------------------------------------------------------------- 9. impact style gallery over one big swing (29.0-33.0)
{
  const G1 = fig('kenpachi', 'shikai', t => { const u = (t * 1.6) % 1; return at([.6, 0, 0], -HP, mixPose(P('slashSideWind', { face: expr('rage') }), P('slashSide', { face: expr('rage') }), easeSnap(clamp(u * 3, 0, 1)))); });
  const G2 = fig('hitsugaya', 'base', t => at([-1.2, 0, 0], HP, P('block', { face: expr('angry') })));
  const STY = ['radial', 'chroma', 'posterize', 'lens', 'shatter', 'panels', 'rimsil', 'desat', 'kanji', 'closeup', 'duotone', 'overexpose', 'ink', 'black', 'flash', 'whiteout'];
  shot('R16_gallery', 29.0, 33.0, (f, lt) => {
    std(f, { pal: 'red', post: 'hot' });
    const i = Math.floor(lt / .25), st = STY[i % STY.length];
    f.cam(camHandheld(camLook([-.2, 1.3, 0], 4.6 - (i % 3) * .5, .4 + (i % 4) * .5 - 1, (i % 2) * .25 - .05, 34, (i % 3 - 1) * .12), lt, .03));
    f.bg({ set: 'wasteland', pal: 'red', dmg: 2 });
    f.fig(G1); f.fig(G2);
    f.fx(g => { fxSlashArc(g, G1, lt, { span: .1, edgeCol: '#ffe36a' }); fxClash(g, [-.4, 1.4, 0], (lt % .625) - .2); }, { layer: 'glow' });
    f.impact(st, { t0: i * .25 + .08, n: 3, part: i % 2 ? 'eye' : 'face', strip: true, fig: 0, char: '剣', at: [-.4, 1.4, 0] });
    f.shake([[i * .25 + .08, 16, .2]]);
  });
}
// ---------------------------------------------------------------- 10. standoff: six captains in a ring, 180° orbit (33.0-36.0)
{
  const names = ['kyoraku', 'tosen', 'byakuya', 'mayuri', 'hitsugaya', 'kenpachi'], forms = ['base', 'base', 'base', 'base', 'base', 'base'];
  const sig = { kyoraku: 'kyoraku_lean', tosen: 'tosen_justice', byakuya: 'byakuya_point', mayuri: 'mayuri_hunch', hitsugaya: 'guard', kenpachi: 'kenpachi_shoulder' };
  const ring = names.map((n, i) => { const a = i / 6 * TAU, pos = [Math.sin(a) * 4.2, 0, Math.cos(a) * 4.2]; return fig(n, forms[i], t => breathe(at(pos, a + Math.PI, P(sig[n])), t, 1, i), { timing: 2, wind: t => [6, 0, 2] }); });
  shot('R17_standoff', 33.0, 36.0, (f, lt) => {
    std(f, { pal: 'dusk' });
    f.cam(camPath([{ t: 0, orbit: { c: [0, 1.2, 0], r: 11, az: 0, el: .22 }, fov: 40 }, { t: 3, orbit: { c: [0, 1.2, 0], r: 9, az: Math.PI * .95, el: .08 }, fov: 40, ease: 'inOut' }])(lt));
    f.bg({ set: 'wasteland', pal: 'dusk', dmg: 1 });
    ring.forEach(F => f.fig(F));
    f.fx(g => { fxSmoke(g, [0, 0, 0], (lt % 2), { n: 6, size: 2.5, col: '#e8d0b0', rise: .1, spread: 4, alpha: .5 }); fxDebris(g, [0, 0, 0], lt % 1, { n: 6, kind: 'petal', col: '#ffb0cc', size: .05, speed: 3 }); }, { layer: 'over' });
  });
}
