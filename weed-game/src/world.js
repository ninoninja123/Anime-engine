// Maailma: Gajōn yö, parallax-vuoret, kalliotornit, vesiputous, männyt, lumisade, valot.
import * as THREE from 'three';
import { E } from './engine.js';
import { glowTexture } from './dogs.js';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// pseudo-satunnainen (toistettava)
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function ridge(g, w, h, { seed, base, amp, rough, color, snow, top }) {
  const r = rng(seed);
  const pts = [];
  let y = base;
  for (let x = 0; x <= w; x += 8) {
    y += (r() - 0.5) * rough;
    y = Math.max(top, Math.min(base + amp, y));
    pts.push([x, y]);
  }
  // muutama huippu
  for (let k = 0; k < 4; k++) {
    const cx = Math.floor(r() * pts.length);
    const hh = amp * (0.5 + r());
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(i - cx) / (8 + r() * 10);
      if (d < 1) pts[i][1] -= hh * (1 - d) * (1 - d * 0.3);
    }
  }
  g.beginPath(); g.moveTo(0, h);
  for (const [x, yy] of pts) g.lineTo(x, yy);
  g.lineTo(w, h); g.closePath();
  const gr = g.createLinearGradient(0, top, 0, h);
  gr.addColorStop(0, color[0]); gr.addColorStop(1, color[1]);
  g.fillStyle = gr; g.fill();
  if (snow) {
    g.save(); g.clip();
    g.strokeStyle = snow; g.lineWidth = 7; g.globalAlpha = 0.85;
    g.beginPath(); for (const [x, yy] of pts) g.lineTo(x, yy + 3); g.stroke();
    g.restore();
  }
}

function addLayer(scene, tex, w, h, z, y) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true }));
  m.position.set(0, y, z);
  scene.add(m);
  return m;
}

export function buildWorld() {
  const scene = E.scene;
  scene.fog = new THREE.FogExp2(0x1a2340, 0.012);

  // taivas: gradienttipallo
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x070b1c) }, mid: { value: new THREE.Color(0x1d2b52) }, bot: { value: new THREE.Color(0x46557e) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top,mid,bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.15? mix(mid,top,smoothstep(0.15,0.7,h)) : mix(bot,mid,smoothstep(-0.05,0.15,h)); gl_FragColor=vec4(c,1.); }',
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat);
  scene.add(sky);

  // tähdet
  const sg = new THREE.BufferGeometry(); const sp = [];
  const r0 = rng(7);
  for (let i = 0; i < 500; i++) { const a = r0() * Math.PI - Math.PI / 2, b = 0.25 + r0() * 1.2; sp.push(Math.sin(a) * 280 * Math.cos(b), Math.sin(b) * 280, -Math.cos(a) * 280 * Math.cos(b)); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

  // kuu + hehku
  const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 48), new THREE.MeshBasicMaterial({ color: 0xf4f0dc, fog: false }));
  moon.position.set(-38, 44, -160); scene.add(moon);
  const mg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x9fb6ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  mg.scale.setScalar(70); mg.position.copy(moon.position).add(new THREE.Vector3(0, 0, 1)); scene.add(mg);
  E.moon = moon;

  // parallax-vuorikerrokset (kauimmasta lähimpään)
  const far = canvasTex(2048, 512, (g, w, h) => ridge(g, w, h, { seed: 11, base: 300, amp: 120, rough: 26, top: 40, color: ['#4a5c8a', '#2a3658'], snow: '#c8d6f5' }));
  addLayer(scene, far, 420, 105, -150, 22);
  const mid = canvasTex(2048, 512, (g, w, h) => ridge(g, w, h, { seed: 23, base: 330, amp: 110, rough: 30, top: 60, color: ['#2e3b63', '#1b2442'], snow: '#9fb2df' }));
  addLayer(scene, mid, 260, 65, -80, 12);
  const near = canvasTex(2048, 512, (g, w, h) => ridge(g, w, h, { seed: 41, base: 360, amp: 90, rough: 34, top: 90, color: ['#1d2645', '#121830'], snow: '#6f82b5' }));
  addLayer(scene, near, 160, 40, -45, 7);

  // Gajōn kalliotornit + vesiputous (oikealla)
  const cliffs = canvasTex(1024, 512, (g, w, h) => {
    const r = rng(5);
    const spire = (x, wd, top) => {
      g.beginPath(); g.moveTo(x - wd, h);
      let yy = h;
      for (let s = 0; s < 10; s++) { yy -= (h - top) / 10; g.lineTo(x - wd * (1 - s / 12) + (r() - 0.5) * 18, yy); }
      g.lineTo(x + (r() - 0.5) * 10, top - 10);
      yy = top;
      for (let s = 0; s < 10; s++) { yy += (h - top) / 10; g.lineTo(x + wd * (s / 10 + 0.15) + (r() - 0.5) * 18, yy); }
      g.closePath();
      const gr = g.createLinearGradient(x - wd, 0, x + wd, 0);
      gr.addColorStop(0, '#1a1f33'); gr.addColorStop(0.6, '#262c45'); gr.addColorStop(1, '#141828');
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(160,180,230,0.25)'; g.lineWidth = 3; g.stroke();
    };
    spire(120, 70, 200); spire(260, 95, 90); spire(430, 60, 230);
    spire(720, 120, 40); spire(880, 90, 140); spire(990, 70, 260);
    // lumet huipuille
    g.fillStyle = 'rgba(220,230,255,0.5)';
    for (let i = 0; i < 60; i++) g.fillRect(r() * w, 60 + r() * 300, 6 + r() * 14, 2);
  });
  addLayer(scene, cliffs, 70, 35, -22, 15.5);

  // vesiputous (animoitu UV-vieritys)
  const fallTex = canvasTex(64, 256, (g, w, h) => {
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(${200 + Math.random() * 55},${220 + Math.random() * 35},255,${0.15 + Math.random() * 0.5})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 20 + Math.random() * 60);
    }
  });
  fallTex.wrapT = THREE.RepeatWrapping; fallTex.repeat.set(1, 2);
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 26), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
  fall.position.set(19, 9, -20.5); scene.add(fall);
  E.updaters.add((dt, dtr) => { fallTex.offset.y += dtr * 1.4; });
  const mist = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x9fb8e8, transparent: true, opacity: 0.35, depthWrite: false }));
  mist.scale.set(14, 5, 1); mist.position.set(19, -1, -19); scene.add(mist);

  // maa: lumi + kivi
  const groundTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#c9d3ea'; g.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${90 + r() * 60},${100 + r() * 60},${140 + r() * 60},${r() * 0.18})`; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 14, 0, 7); g.fill(); }
  });
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(10, 5);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 60), new THREE.MeshLambertMaterial({ map: groundTex }));
  ground.rotation.x = -Math.PI / 2; ground.position.z = -10; scene.add(ground);

  // kivet ja männyt keskitasolla
  const rockMat = new THREE.MeshToonMaterial({ color: 0x3c4560 });
  const pineMat = new THREE.MeshToonMaterial({ color: 0x1a2a2c });
  const snowMat = new THREE.MeshToonMaterial({ color: 0xdfe7ff });
  const r = rng(99);
  for (let i = 0; i < 26; i++) {
    const x = -34 + r() * 68, z = -5 - r() * 14;
    if (Math.abs(x) < 9 && z > -7) continue;
    const t = new THREE.Group();
    const hgt = 2.5 + r() * 3.5;
    for (let k = 0; k < 3; k++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(hgt * 0.32 * (1 - k * 0.22), hgt * 0.5, 7), pineMat);
      cone.position.y = hgt * (0.3 + k * 0.22); t.add(cone);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(hgt * 0.18 * (1 - k * 0.22), hgt * 0.16, 7), snowMat);
      cap.position.y = hgt * (0.47 + k * 0.22); t.add(cap);
    }
    t.position.set(x, 0, z); scene.add(t);
  }
  for (let i = 0; i < 14; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + r() * 1.6, 0), rockMat);
    const x = -26 + r() * 52, z = -4 - r() * 10;
    rock.position.set(x, 0.2, z); rock.rotation.set(r() * 3, r() * 3, r() * 3); rock.scale.y = 0.7;
    scene.add(rock);
  }
  // oikean reunan kallio (josta kivivyöry tulee)
  const cliff = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + r() * 1.8, 0), rockMat);
    b.position.set(9 + r() * 5, 1 + i * 1.4, -4.5 - r() * 2); b.rotation.set(r() * 3, r() * 3, r() * 3);
    cliff.add(b);
  }
  scene.add(cliff); E.cliff = cliff;

  // etualan tummat kivet (syvyys)
  const fgMat = new THREE.MeshBasicMaterial({ color: 0x06070d });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + r() * 1.2, 0), fgMat);
    b.position.set(-16 + i * 8 + r() * 3, -0.2, 5 + r()); b.scale.y = 0.6;
    scene.add(b);
  }

  // valot
  scene.add(new THREE.HemisphereLight(0x9db4ff, 0x2a2438, 1.15));
  const moonLight = new THREE.DirectionalLight(0xdfe8ff, 2.0);
  moonLight.position.set(-6, 10, 8); scene.add(moonLight);
  const rim = new THREE.DirectionalLight(0xff9a5a, 0.9);
  rim.position.set(8, 4, -8); scene.add(rim);
  E.rimLight = rim;

  buildSnow(scene);
}

function buildSnow(scene) {
  const N = E.lowFx ? 700 : 1600;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50; pos[i * 3 + 1] = Math.random() * 16; pos[i * 3 + 2] = -14 + Math.random() * 22;
    seed[i] = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uWind: { value: 1 }, uPx: { value: E.renderer.getPixelRatio() } },
    vertexShader: `
      attribute float seed; uniform float uTime, uWind, uPx; varying float vA;
      void main(){
        vec3 p = position;
        float fall = mod(p.y - uTime*(0.8+seed*0.9), 16.0);
        p.y = fall;
        p.x = mod(p.x + uTime*uWind*(0.6+seed) + 25.0, 50.0) - 25.0 + sin(uTime*1.3+seed*20.0)*0.4;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_PointSize = (2.0+seed*3.5) * uPx * (18.0 / -mv.z);
        vA = 0.5+seed*0.5;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `varying float vA; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(0.92,0.95,1.0,(1.0-d*2.0)*vA); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
  scene.add(pts);
  E.snow = mat;
  E.updaters.add((dt) => { mat.uniforms.uTime.value += dt; });
}
