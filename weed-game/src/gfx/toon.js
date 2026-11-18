// Anime-/cel-varjostuksen julkinen rajapinta hahmo- ja ympäristökoodille.
//
//   applyToonMaterial(target, opts)  – tekee meshistä / objektipuusta cel-varjostetun: porrastettu valo
//                                      (gradientMap), terävä rim-valo, varjojen heitto. Säilyttää värin,
//                                      tekstuurin (map), emissiven, läpinäkyvyyden ja skinnauksen.
//                                      MeshToonMaterial päivitetään PAIKALLAAN (viittaukset kuten dog.mat säilyvät).
//   makeToonMaterial(opts)           – uusi cel-materiaali (color, map, steps, rim, snow ...).
//   makeOutlineMaterial(opts)        – inverted hull -ääriviiva, jonka paksuus on ruutuavaruudessa tasainen
//                                      (toimii SkinnedMeshille ja minkä kokoiselle mallille tahansa).
//   addOutline(mesh, opts)           – lisää meshille ääriviivakuoren (jakaa geometrian ja luurangon).
//   toonRamp(steps)                  – porrastekstuuri (2–5 porrasta).
//   toonShared                       – yhteiset uniformit (rim-väri ja -suunta); mood.js päivittää.
//
// Lisäksi kohtaus skannataan automaattisesti (upgradeScene): jokainen MeshToonMaterial saa rim-valon ja
// varjot, ja vanhat MeshBasicMaterial+BackSide-ääriviivat vaihdetaan uuteen. Ohitus: object.userData.noGfx = true.
import * as THREE from 'three';

export const toonShared = {
  uRimColor: { value: new THREE.Color(0x8fb4ff) },
  uRimDir: { value: new THREE.Vector3(0.6, 0.4, -0.7) },   // näkymäavaruudessa (päivitetään joka frame)
  uRimAmt: { value: 1.0 },
  uSnowColor: { value: new THREE.Color(0xdfe8ff) },
  uOutlineColor: { value: new THREE.Color(0x0a0c18) },
  uAspect: { value: 2 },
  uPointScale: { value: 500 },   // pistekoko: maailmanyksikkö -> pikseliä etäisyydellä 1 (päivittyy resizessä)
  uTime: { value: 0 },
};

const ramps = {};
export function toonRamp(steps = 3) {
  if (ramps[steps]) return ramps[steps];
  const table = { 2: [95, 255], 3: [80, 170, 255], 4: [70, 150, 225, 255], 5: [60, 120, 180, 230, 255] }[steps] || [80, 170, 255];
  const data = new Uint8Array(table.length * 4);
  table.forEach((v, i) => { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v; data[i * 4 + 3] = 255; });
  const t = new THREE.DataTexture(data, table.length, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return (ramps[steps] = t);
}

/** Lisää MeshToonMaterialiin rim-valon (ja valinnaisen lumipeitteen). Idempotentti. */
function patchToon(mat, { rim = 1, rimWidth = 0.38, snow = 0, detail = 0 } = {}) {
  if (mat.userData.gfxToon) return mat;
  mat.userData.gfxToon = { rim, rimWidth, snow, detail };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev.call(mat, sh, r);
    const o = mat.userData.gfxToon;
    sh.uniforms.uRimColor = toonShared.uRimColor; sh.uniforms.uRimDir = toonShared.uRimDir; sh.uniforms.uRimAmt = toonShared.uRimAmt;
    sh.uniforms.uSnowColor = toonShared.uSnowColor;
    if (o.detail > 0) {    // maalattu kalliopinta: kaksisävyiset laikut + kerrosjuovat maailmankoordinaateissa
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGfxW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\n vGfxW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 w = vGfxW; vec2 q = vec2(w.x + w.z * 0.7, w.y);
          vec2 i = floor(q * 0.9), f = fract(q * 0.9); f = f * f * (3.0 - 2.0 * f);
          #define GH(p) fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453)
          float n = mix(mix(GH(i), GH(i + vec2(1.0, 0.0)), f.x), mix(GH(i + vec2(0.0, 1.0)), GH(i + vec2(1.0, 1.0)), f.x), f.y);
          float strata = smoothstep(0.35, 0.5, fract(w.y * 0.55 + n * 0.8));
          diffuseColor.rgb *= mix(0.74, 1.0, smoothstep(0.42, 0.5, n)) * mix(0.86, 1.06, strata); }`);
    }
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec3 uRimColor, uRimDir, uSnowColor; uniform float uRimAmt;${o.detail > 0 ? '\nvarying vec3 vGfxW;' : ''}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>${o.snow > 0 ? `\n { float up = inverseTransformDirection(normal, viewMatrix).y; diffuseColor.rgb = mix(diffuseColor.rgb, uSnowColor, smoothstep(${(1 - o.snow * 0.75).toFixed(3)}, ${(1.06 - o.snow * 0.75).toFixed(3)}, up)); }` : ''}`)
      .replace('#include <opaque_fragment>', `
        { float fres = 1.0 - saturate(dot(normalize(vViewPosition), normal));
          float rimK = smoothstep(${(1 - rimWidth).toFixed(3)}, ${(1 - rimWidth + 0.06).toFixed(3)}, fres) * saturate(dot(normal, uRimDir) * 1.4 + 0.25);
          outgoingLight += uRimColor * (rimK * uRimAmt * ${rim.toFixed(3)}) * (diffuseColor.rgb * 0.6 + 0.4); }
        #include <opaque_fragment>`);
  };
  const key = `gfxToon:${rim}:${rimWidth}:${snow}:${detail}`;
  const prevKey = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : null;
  mat.customProgramCacheKey = () => (prevKey ? prevKey() : '') + key;
  mat.needsUpdate = true;
  return mat;
}

export function makeToonMaterial({ color = 0xffffff, map = null, steps = 3, rim = 1, rimWidth = 0.38, snow = 0, detail = 0, ...rest } = {}) {
  const m = new THREE.MeshToonMaterial({ color, map, gradientMap: toonRamp(steps), ...rest });
  return patchToon(m, { rim, rimWidth, snow, detail });
}

/**
 * Tee kohteesta cel-varjostettu. target = Mesh / SkinnedMesh / Object3D (käydään läpi).
 * opts: { steps, rim, rimWidth, outline (leveys tai false), outlineColor, castShadow, receiveShadow, convert }
 * - MeshToonMaterial: päivitetään paikallaan.
 * - Muut valaistut materiaalit (Standard/Lambert/Phong): korvataan MeshToonMaterialilla, jos convert !== false
 *   (väri, map, emissive, alpha, side ja vertexColors kopioidaan). Palauttaa käytetyt materiaalit.
 */
export function applyToonMaterial(target, opts = {}) {
  const { steps = 0, rim = 1, rimWidth = 0.38, outline = false, outlineColor, castShadow = true, receiveShadow = false, convert = true } = opts;
  const out = [];
  const meshes = [];
  target.traverse ? target.traverse(o => { if (o.isMesh) meshes.push(o); }) : meshes.push(target);
  for (const o of meshes) {
    if (o.userData.gfxOutline || o.userData.noGfx) continue;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map(m => {
      if (!m) return m;
      if (m.isMeshToonMaterial) { if (steps) m.gradientMap = toonRamp(steps); else if (!m.gradientMap) m.gradientMap = toonRamp(3); return patchToon(m, { rim, rimWidth }); }
      if (convert && (m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) {
        const t = new THREE.MeshToonMaterial({
          color: m.color, map: m.map, gradientMap: toonRamp(steps || 3), emissive: m.emissive, emissiveMap: m.emissiveMap,
          emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest,
          side: m.side, vertexColors: m.vertexColors, name: m.name,
        });
        return patchToon(t, { rim, rimWidth });
      }
      return m;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
    for (const m of next) if (m && m.isMeshToonMaterial) out.push(m);
    o.castShadow = castShadow; o.receiveShadow = receiveShadow;
    if (outline) addOutline(o, { width: outline === true ? undefined : outline, color: outlineColor });
  }
  return out;
}

const OUTLINE_VS = `
#include <common>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
uniform float uWidth, uAspect;
void main(){
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  vec4 cn = projectionMatrix * vec4(normalize(transformedNormal), 0.0);
  vec2 dir = vec2(cn.x * uAspect, cn.y); float len = length(dir);   // suunta pikseliavaruudessa
  dir = len > 1e-5 ? dir / len : vec2(0.0);
  // paksuus ruutuavaruudessa; kaukana hieman ohuempi, lähikuvassa rajattu
  float w = uWidth * clamp(9.0 / max(gl_Position.w, 0.5), 0.45, 1.9);
  gl_Position.xy += dir * w * gl_Position.w * vec2(1.0 / uAspect, 1.0);
  #include <fog_vertex>
}`;
const OUTLINE_FS = `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor, uOutlineColor; uniform float uOpacity, uUseShared;
void main(){
  gl_FragColor = vec4(mix(uColor, uOutlineColor, uUseShared), uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

/** Inverted hull -ääriviiva. width = osuus ruudun korkeudesta (oletus 0.0032 ≈ 1,2 px / 390 px). */
export function makeOutlineMaterial({ width = 0.0032, color = null } = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: OUTLINE_VS, fragmentShader: OUTLINE_FS, side: THREE.BackSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uWidth: { value: width }, uColor: { value: new THREE.Color(color ?? 0x0a0c18) }, uOpacity: { value: 1 }, uUseShared: { value: color == null ? 1 : 0 },
    }]),
  });
  m.uniforms.uAspect = toonShared.uAspect; m.uniforms.uOutlineColor = toonShared.uOutlineColor;
  m.userData.gfxOutlineMat = true;
  // vanha rajapinta (dogs.js fade()) asettaa material.opacity/transparent -> viedään uniformiin
  m.onBeforeRender = () => { m.uniforms.uOpacity.value = m.opacity; };
  return m;
}

export function addOutline(mesh, opts = {}) {
  if (mesh.userData.gfxHasOutline) return null;
  const mat = makeOutlineMaterial(opts);
  let ol;
  if (mesh.isSkinnedMesh) { ol = new THREE.SkinnedMesh(mesh.geometry, mat); ol.bind(mesh.skeleton, mesh.bindMatrix); }
  else if (mesh.isInstancedMesh) return null;
  else ol = new THREE.Mesh(mesh.geometry, mat);
  ol.frustumCulled = mesh.frustumCulled; ol.userData.gfxOutline = true; ol.castShadow = false;
  ol.position.copy(mesh.position); ol.quaternion.copy(mesh.quaternion); ol.scale.copy(mesh.scale);
  (mesh.parent || mesh).add(ol);
  mesh.userData.gfxHasOutline = true;
  return ol;
}

/**
 * Automaattinen päivitys: kutsutaan harvakseltaan (mood.js). Halpa: käy vain uudet objektit läpi.
 * - MeshToonMaterial -> rim + castShadow
 * - vanha ääriviiva (MeshBasicMaterial, BackSide, SkinnedMesh) -> uusi ruutuavaruuden ääriviiva
 */
export function upgradeScene(scene, shadows) {
  scene.traverse(o => {
    if (!o.isMesh || o.userData.gfxSeen || o.userData.noGfx) return;
    o.userData.gfxSeen = true;
    const m = o.material;
    if (!m || Array.isArray(m)) return;
    if (m.isMeshBasicMaterial && m.side === THREE.BackSide) {
      o.castShadow = false; o.userData.gfxOutline = true;
      if (o.isSkinnedMesh) {
        const nm = makeOutlineMaterial({});
        nm.opacity = m.opacity; nm.transparent = m.transparent; nm.depthWrite = m.depthWrite;
        o.material = nm;
      }
      return;
    }
    if (m.isMeshToonMaterial) {
      patchToon(m, m.userData.gfxToon || {});
      // luuhun kiinnitetyt pikkuosat (harja ym.) eivät heitä varjoa: säästää kymmeniä piirtokutsuja
      const onBone = !o.isSkinnedMesh && o.parent && (o.parent.isBone || (o.parent.parent && o.parent.parent.isBone));
      if (shadows && o.userData.castShadow !== false && !m.transparent && !onBone) {
        o.castShadow = true;
        // Hahmot, joiden asento tehdään vertex-shaderissa (dogs.js pehmeä rigi): varjokartta tarvitsee saman
        // muodonmuutoksen. Lainataan se saman geometrian ääriviivakuorelta (onBeforeCompile), jos sellainen on.
        if (!o.isSkinnedMesh && !o.customDepthMaterial && o.parent) {
          const shell = o.parent.children.find(c => c !== o && c.isMesh && c.geometry === o.geometry && c.material && c.material.side === THREE.BackSide && c.material.isMeshBasicMaterial);
          if (shell) {
            const sm = shell.material;
            const dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
            dm.onBeforeCompile = (sh, r) => sm.onBeforeCompile.call(sm, sh, r);
            const k = 'gfxdepth:' + sm.customProgramCacheKey();
            dm.customProgramCacheKey = () => k;
            o.customDepthMaterial = dm;
          }
        }
      }
    }
  });
}
