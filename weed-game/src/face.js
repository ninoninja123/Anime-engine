// Anime-kasvot koiratehtaan hahmoille: proseduraaliset silmät (valkuainen, iiris, pupilli, heijastukset, luomiviiva,
// kulmakarva), suu (viiva, avautuu purressa: hampaat), kiiltävä nenä. Kevyt: 5 tasoa/hahmo, yksi pieni shader.
// Ilmeet: neutral, determined, angry, sad, happy, closed, hurt, dead. Satunnainen räpäytys, katse seuraa kohdetta.
import * as THREE from 'three';

const EYE_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const EYE_FS = /* glsl */`
uniform vec3 uIris, uBrow, uLine; uniform vec2 uGaze;
uniform float uOpen, uTilt, uLower, uBrowA, uBrowY, uBrowStyle, uMode, uOpacity, uGlow;
varying vec2 vUv;
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
void main(){
  vec2 p = vec2(vUv.x*2.-1., (vUv.y*2.-1.)*1.25);   // x: -1 = taka (korva), +1 = kuono
  vec4 col = vec4(0.);
  // kulmakarva (viiva) tai otsapiste (dobermann-tyyli)
  float by = uBrowY + uBrowA * p.x * 0.5;
  if (uBrowStyle < 0.5) { float d = seg(p, vec2(-0.55, uBrowY - uBrowA*0.27), vec2(0.6, uBrowY + uBrowA*0.3)); if (d < 0.075) col = vec4(uBrow, 1.); }
  else { if (length((p - vec2(0.05, uBrowY + 0.08)) * vec2(1., 1.25)) < 0.2) col = vec4(uBrow, 1.); }
  if (uMode > 1.5) {                                   // dead: X
    float d = min(seg(p, vec2(-.45,-.45), vec2(.45,.45)), seg(p, vec2(-.45,.45), vec2(.45,-.45)));
    if (d < 0.085) col = vec4(uLine, 1.);
  } else if (uMode > 0.5) {                            // closed / happy / hurt: kaari
    float k = uLower > 0.5 ? -1. : 1.;                 // happy (^) vs closed (u)
    float y = k * (-0.05 - 0.28 * (1. - p.x*p.x));
    if (uTilt > 0.5) y = abs(p.x) * 0.45 - 0.25;      // hurt: > <
    if (abs(p.y - y) < 0.075 && abs(p.x) < 0.9) col = vec4(uLine, 1.);
  } else {
    float w = sqrt(max(0., 1. - p.x*p.x));
    float top = uOpen * 0.62 * pow(w, 0.7) - uTilt * (p.x + 0.4) * 0.32 - 0.02;
    float bot = -0.5 * w * (1. - uLower) - 0.04;
    bool inside = abs(p.x) < 0.96 && p.y < top && p.y > bot;
    if (inside) {
      vec2 c = vec2(0.12, -0.04) + uGaze;
      vec2 q = (p - c) * vec2(1.15, 0.95);
      float r = length(q);
      vec3 sclera = mix(vec3(0.97, 0.98, 1.0), vec3(0.72, 0.76, 0.86), smoothstep(top - 0.25, top, p.y));
      vec3 cc = sclera;
      if (r < 0.5) {
        float g = clamp((c.y + 0.45 - p.y) / 0.9, 0., 1.);
        cc = mix(uIris * 1.35 + 0.08, uIris * 0.45, g);
        cc = mix(cc, uIris * 0.35, smoothstep(0.38, 0.5, r));     // tumma reuna
        if (r < 0.22) cc = vec3(0.03);
      }
      if (length(p - c - vec2(-0.14, 0.17)) < 0.13) cc = vec3(1.);   // heijastukset
      if (length(p - c - vec2(0.16, -0.2)) < 0.06) cc = vec3(1.);
      col = vec4(cc + uIris * uGlow * 0.5, 1.);
    }
    // ylä-luomiviiva (paksumpi ulkonurkassa) + ripsiväkänen, alaluomi ohut
    float lw = 0.075 + max(0., -p.x) * 0.06;
    if (abs(p.x) < 1.0 && p.y >= top - 0.02 && p.y < top + lw) col = vec4(uLine, 1.);
    if (p.x < -0.75 && p.x > -1.05 && abs(p.y - (top + 0.1 + (-p.x - 0.75) * 0.5)) < 0.06) col = vec4(uLine, 1.);
    if (abs(p.x) < 0.8 && abs(p.y - bot) < 0.03) col = vec4(uLine * 1.5 + 0.1, 1.);
  }
  if (col.a < 0.5) discard;
  gl_FragColor = vec4(col.rgb, uOpacity);
  #include <colorspace_fragment>
}`;

const MOUTH_FS = /* glsl */`
uniform vec3 uLine; uniform float uOpen, uOpacity, uTeeth;
varying vec2 vUv;
void main(){
  vec2 p = vec2(vUv.x*2.-1., vUv.y*2.-1.);           // x: -1 suupieli, +1 kuonon kärki
  float lip = 0.25 - 0.18 * (p.x + 1.) * 0.5 - 0.12 * (1. - p.x*p.x) * 0.0;
  float low = lip - uOpen * (0.25 + 0.55 * (p.x + 1.) * 0.5);
  vec4 col = vec4(0.);
  if (p.x > -0.95 && p.x < 0.92) {
    if (abs(p.y - lip) < 0.07 && p.x > -0.95) col = vec4(uLine, 1.);
    if (uOpen > 0.02 && p.y < lip && p.y > low) {
      col = vec4(0.32, 0.08, 0.1, 1.);                // suun sisus (ei verta: tumma)
      float t = fract((p.x + 1.) * 4.5);
      if (uTeeth > 0.5 && p.y > lip - 0.18 * (1. - abs(t - 0.5) * 2.)) col = vec4(0.97, 0.96, 0.9, 1.);
      if (uTeeth > 0.5 && p.y < low + 0.14 * (1. - abs(t - 0.5) * 2.)) col = vec4(0.95, 0.94, 0.88, 1.);
      if (abs(p.y - low) < 0.05) col = vec4(uLine, 1.);
    }
  }
  if (col.a < 0.5) discard;
  gl_FragColor = vec4(col.rgb, uOpacity);
  #include <colorspace_fragment>
}`;

export const EXPR = {
  neutral:    { open: 1.0, tilt: 0.0, lower: 0.0, browA: 0.0, browY: 0.92, mode: 0 },
  determined: { open: 0.82, tilt: 0.28, lower: 0.15, browA: -0.3, browY: 0.82, mode: 0 },
  angry:      { open: 0.72, tilt: 0.55, lower: 0.22, browA: -0.6, browY: 0.76, mode: 0 },
  sad:        { open: 0.7, tilt: -0.4, lower: 0.0, browA: 0.55, browY: 0.98, mode: 0 },
  surprised:  { open: 1.15, tilt: 0.0, lower: -0.1, browA: 0.1, browY: 1.08, mode: 0 },
  happy:      { open: 1, tilt: 0, lower: 1, browA: 0.15, browY: 0.98, mode: 1 },
  closed:     { open: 1, tilt: 0, lower: 0, browA: 0.0, browY: 0.9, mode: 1 },
  hurt:       { open: 1, tilt: 1, lower: 0, browA: 0.55, browY: 0.96, mode: 1 },
  dead:       { open: 1, tilt: 0, lower: 0, browA: 0.2, browY: 0.95, mode: 2 },
};

/**
 * Rakentaa kasvot tehdaskoiran pään ryhmään. head = pään skaalattu ryhmä (pivot piv.HEAD),
 * F = factory-data (osat + pivotit), c = hahmon määrittely. Palauttaa { update(dt, dog), set(expr), mats }.
 */
export function buildFace(head, F, c) {
  const p = c.p || {}, col = c.c || {};
  const piv = F.piv.HEAD, m = p.muzzle || 1;
  const mx = x => (x > 0.44 ? 0.44 + (x - 0.44) * m : x);   // sama kuonon venytys kuin geometriassa
  const L = v => new THREE.Vector3(v[0], v[1], v[2]).sub(piv);
  const dark = (h, k) => new THREE.Color(h).multiplyScalar(k);
  const coat = new THREE.Color(col.head || col.coat || '#888');
  const lum = coat.r * 0.3 + coat.g * 0.59 + coat.b * 0.11;
  const eyeCol = new THREE.Color(col.eye || (lum < 0.25 ? '#e0a23a' : '#5a3a22'));
  const browCol = col.browColor ? new THREE.Color(col.browColor) : (c.marks || []).some(s => s.startsWith('brows'))
    ? new THREE.Color((c.marks.find(s => s.startsWith('brows')).split(':')[1]) || '#b07a40') : dark(col.head || col.coat || '#888', lum < 0.25 ? 2.2 : 0.45);
  const U = {
    uIris: { value: eyeCol }, uBrow: { value: browCol }, uLine: { value: new THREE.Color(lum < 0.2 ? '#050404' : '#141010') },
    uGaze: { value: new THREE.Vector2() }, uOpen: { value: 1 }, uTilt: { value: 0 }, uLower: { value: 0 },
    uBrowA: { value: 0 }, uBrowY: { value: 0.92 }, uBrowStyle: { value: (c.marks || []).some(s => s.startsWith('brows')) ? 1 : 0 },
    uMode: { value: 0 }, uOpacity: { value: 1 }, uGlow: { value: lum < 0.22 ? 0.6 : 0.15 },
  };
  const eyeMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: EYE_VS, fragmentShader: EYE_FS, side: THREE.DoubleSide, transparent: false,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const MU = { uLine: { value: U.uLine.value }, uOpen: { value: 0 }, uOpacity: { value: 1 }, uTeeth: { value: 1 } };
  const mouthMat = new THREE.ShaderMaterial({ uniforms: MU, vertexShader: EYE_VS, fragmentShader: MOUTH_FS, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const es = p.eye || 1;
  const eyeGeo = new THREE.PlaneGeometry(0.078 * es, 0.098 * es);
  const mouthGeo = new THREE.PlaneGeometry(0.115 * m, 0.06);
  const group = new THREE.Group(); head.add(group);
  for (const s of [-1, 1]) {
    // silmä: pään yläsivulla, normaali ulos-ylös-eteen -> näkyy sivulta, 3/4-kulmasta ja lähikuvassa
    const e = new THREE.Mesh(eyeGeo, eyeMat);
    e.position.copy(L([0.418, 0.872, s * 0.106]));
    e.lookAt(e.position.clone().add(new THREE.Vector3(0.42, 0.32, s * 0.85)));
    if (s < 0) e.scale.x = -1;                        // uv.x osoittaa aina kuonoon päin
    // lookAt kääntää tason +Z:n ulos; varmistetaan "ylös" = pään ylös
    group.add(e);
    const mo = new THREE.Mesh(mouthGeo, mouthMat);
    mo.position.copy(L([mx(0.525), 0.757, s * 0.066]));
    mo.rotation.y = s * 0.42; if (s < 0) { mo.rotation.y = Math.PI - 0.42; mo.scale.x = -1; }
    group.add(mo);
  }
  // nenä: kiiltävä, selvästi erottuva
  const noseMat = new THREE.MeshToonMaterial({ color: col.nose || '#141112', emissive: 0x000000 });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), noseMat);
  nose.scale.set(0.85, 0.75, 1.15); nose.position.copy(L([mx(0.578), 0.792, 0]));
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  shine.position.set(0.006, 0.014, 0.012); nose.add(shine);
  group.add(nose);

  let expr = 'neutral', cur = { ...EXPR.neutral }, blinkT = 2 + Math.random() * 3, blink = 0, mouth = 0;
  const target = new THREE.Vector2();
  return {
    mats: [eyeMat, mouthMat, noseMat, shine.material],
    set(name) { if (EXPR[name]) expr = name; },
    get expr() { return expr; },
    mouth(v) { mouth = v; },
    gaze(x, y) { target.set(x, y); },
    update(dt) {
      const e = EXPR[expr];
      const k = Math.min(1, dt * 12);
      for (const key of ['open', 'tilt', 'lower', 'browA', 'browY']) cur[key] += (e[key] - cur[key]) * k;
      blinkT -= dt;
      if (blinkT <= 0 && e.mode === 0) { blink = 0.13; blinkT = 2 + Math.random() * 4; }
      blink = Math.max(0, blink - dt);
      const closing = blink > 0;
      U.uMode.value = closing ? 1 : e.mode;
      U.uOpen.value = cur.open; U.uTilt.value = closing ? 0 : (e.mode === 1 ? e.tilt : cur.tilt);
      U.uLower.value = closing ? 0 : (e.mode === 1 ? e.lower : cur.lower);
      U.uBrowA.value = cur.browA; U.uBrowY.value = cur.browY;
      U.uGaze.value.lerp(target, Math.min(1, dt * 6));
      MU.uOpen.value += (mouth - MU.uOpen.value) * Math.min(1, dt * 18);
    },
    setOpacity(o) { U.uOpacity.value = o; MU.uOpacity.value = o; eyeMat.transparent = mouthMat.transparent = o < 1; },
  };
}
