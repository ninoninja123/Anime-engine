// Procedural laboratory helicopter (toon + outline): cabin, glass, tail boom, skids, spinning main/tail rotors with a
// motion-blur disc, a downward searchlight (cone + real SpotLight) and the rotor sound (sfx_map 'heli').
//   const h = makeHeli(); E.scene.add(h.group); h.flyTo([x,y,z], secs); h.light(true); h.sweep(true); h.dispose()
import * as THREE from 'three';
import { E, tween } from '../engine.js';
import { mesh } from './props.js';
import { beam } from './sets.js';
import { sfx } from '../audio.js';

export function makeHeli({ color = 0xe8ece8, stripe = 0xb02a2a } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cab = mesh(new THREE.SphereGeometry(1, 18, 12), color, 0.03); cab.scale.set(1.6, 0.95, 0.95); body.add(cab);
  const glass = mesh(new THREE.SphereGeometry(0.98, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), 0x203040, 0, { emissive: 0x0a1420 });
  glass.rotation.z = -1.0; glass.scale.set(1.25, 0.9, 0.9); glass.position.set(0.55, 0.1, 0); body.add(glass);
  const band = mesh(new THREE.CylinderGeometry(0.97, 0.97, 0.18, 18, 1, true), stripe, 0); band.rotation.z = Math.PI / 2; band.scale.set(1, 1.6, 1); band.position.y = -0.15; body.add(band);
  const boom = mesh(new THREE.CylinderGeometry(0.12, 0.28, 3.4, 10), color, 0.02); boom.rotation.z = Math.PI / 2; boom.position.set(-2.6, 0.2, 0); body.add(boom);
  const fin = mesh(new THREE.BoxGeometry(0.6, 0.9, 0.08), stripe, 0.01); fin.position.set(-4.2, 0.55, 0); fin.rotation.z = 0.35; body.add(fin);
  const hub = mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.4, 8), 0x2a2a2e, 0.01); hub.position.set(0, 1.05, 0); body.add(hub);
  for (const z of [-0.65, 0.65]) {
    const skid = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), 0x2a2a2e, 0.008); skid.rotation.z = Math.PI / 2; skid.position.set(0.1, -1.15, z); body.add(skid);
    for (const x of [-0.6, 0.7]) { const st = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 5), 0x2a2a2e, 0); st.position.set(x, -0.9, z * 0.85); st.rotation.x = z > 0 ? -0.3 : 0.3; body.add(st); }
  }
  // rotors: blades + blur disc
  const rotor = new THREE.Group(); rotor.position.set(0, 1.28, 0); body.add(rotor);
  for (let i = 0; i < 4; i++) { const b = mesh(new THREE.BoxGeometry(3.6, 0.03, 0.18), 0x1e1e22, 0); b.position.x = 1.8; const arm = new THREE.Group(); arm.rotation.y = i * Math.PI / 2; arm.add(b); rotor.add(arm); }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 1.29; disc.userData.noGfx = true; body.add(disc);
  const tail = new THREE.Group(); tail.position.set(-4.25, 0.5, 0.12); body.add(tail);
  for (let i = 0; i < 2; i++) { const b = mesh(new THREE.BoxGeometry(0.9, 0.08, 0.02), 0x1e1e22, 0); b.rotation.z = i * Math.PI / 2; tail.add(b); }
  // nav lights
  const nav = [];
  for (const [x, y, z, c] of [[0.2, -0.4, 0.95, 0x40ff60], [0.2, -0.4, -0.95, 0xff3030], [-4.3, 0.95, 0, 0xffffff]]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: c })); l.position.set(x, y, z); l.userData.noGfx = true; body.add(l); nav.push(l);
  }
  // searchlight: cone + spot light toward the ground
  const lightRig = new THREE.Group(); lightRig.position.set(1.1, -0.8, 0); body.add(lightRig);
  const cone = beam({ h: 14, r0: 0.2, r1: 2.6, color: 0xf4f6ff, alpha: 0.38 }); lightRig.add(cone);
  const spot = new THREE.SpotLight(0xf0f4ff, 0, 30, 0.32, 0.5, 1.2); spot.position.set(0, 0, 0); lightRig.add(spot);
  const tgt = new THREE.Object3D(); tgt.position.set(0, -10, 0); lightRig.add(tgt); spot.target = tgt;
  cone.visible = false;
  g.scale.setScalar(0.62);

  let t = 0, sweepOn = false, snd = 0, alive = true;
  const upd = (dt, dtr) => {
    if (!alive || !g.visible) return;
    t += dtr;
    rotor.rotation.y += dtr * 28; tail.rotation.z += dtr * 40;
    disc.material.opacity = 0.12 + Math.sin(t * 40) * 0.03;
    body.rotation.z = Math.sin(t * 0.9) * 0.03; body.rotation.x = Math.sin(t * 0.7) * 0.025;
    body.position.y = Math.sin(t * 1.3) * 0.08;
    nav[2].visible = Math.sin(t * 6) > 0.4;
    if (sweepOn) lightRig.rotation.z = Math.sin(t * 0.6) * 0.35, lightRig.rotation.x = Math.sin(t * 0.43) * 0.25;
    snd -= dtr; if (snd <= 0 && !E.skipping) { snd = 11; sfx.heli && sfx.heli(); }     // loop the rotor sound
  };
  E.updaters.add(upd);
  return {
    group: g, body,
    light(on) { cone.visible = on; spot.intensity = on ? 60 : 0; },
    sweep(on) { sweepOn = on; if (!on) lightRig.rotation.set(0, 0, 0); },
    aim(x, z) { lightRig.rotation.set(x, 0, z); },
    flyTo(p, secs = 4, ease = 'inOut') { return Promise.all([tween(g.position, { x: p[0], y: p[1], z: p[2] }, secs, { ease, real: true })]); },
    dispose() { alive = false; E.updaters.delete(upd); g.parent && g.parent.remove(g); },
  };
}
