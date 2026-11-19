// Laatutasot: low / med / high. Valinta: ?lowfx (=low), ?hq (=high), ?q=low|med|high, muuten automaattinen.
// Dynaaminen resoluutio: jos fps putoaa, skaalataan 3D-kohtauksen renderöintiresoluutiota (ei UI:ta),
// ja viimeisenä keinona pudotetaan laatutasoa.
const params = new URLSearchParams(location.search);

const TIERS = {
  //        post   bloom lv  msaa  shadow map  syvyys-DoF  god rays  partikkelikerroin  max DPR  usvakerrokset
  //        texMax = suurin tekstuurin sivu (isommat pienennetään kerran, GPU-muisti), olDist = ääriviivakuoret vain
  //        tätä lähempänä kameraa (0 = aina; kaukana kuori on ~1 px mutta tuplaa skinnauksen ja kolmiot)
  low:  { post: false, bloomLevels: 0, msaa: 0, shadowSize: 0,    dof: false, rays: false, particles: 0.5, maxDpr: 1.25, mist: 1, texMax: 1024, olDist: 9 },
  med:  { post: true,  bloomLevels: 3, msaa: 4, shadowSize: 1024, dof: false, rays: true,  particles: 1.0, maxDpr: 1.5,  mist: 3, texMax: 2048, olDist: 26 },
  high: { post: true,  bloomLevels: 4, msaa: 4, shadowSize: 2048, dof: true,  rays: true,  particles: 1.5, maxDpr: 2.0,  mist: 3, texMax: 4096, olDist: 0 },
};
const ORDER = ['low', 'med', 'high'];

function isMobile() {
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/.test(ua));
}
function detect() {
  if (params.has('lowfx')) return 'low';
  if (params.has('hq')) return 'high';
  const q = params.get('q');
  if (q && TIERS[q]) return q;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  if (Q.mobile) return (mem <= 3 || cores <= 4) ? 'low' : 'med';
  return 'high';
}

export const Q = {
  tier: 'med',
  forced: params.has('lowfx') || params.has('hq') || params.has('q'),
  scale: 1,                 // 3D-kohtauksen resoluutioskaala (dynaaminen)
  dynamic: !params.has('fixedres') && !navigator.webdriver,
  mobile: isMobile(),
  // hahmotekstuurien yläraja puhelimessa (1024² -> 768²: ~45 % vähemmän GPU-muistia per malli, iPhone-muistiraja)
  get charTex() { return this.tier === 'low' ? 512 : this.mobile || this.tier === 'med' ? 768 : 4096; },
  listeners: new Set(),
  ...TIERS.med,
};

export function setTier(name) {
  if (!TIERS[name]) return;
  Q.tier = name;
  Object.assign(Q, TIERS[name]);
  for (const l of Q.listeners) l(Q);
}
export function onQuality(fn) { Q.listeners.add(fn); return () => Q.listeners.delete(fn); }

/** GPU:n nimen perusteella: ohjelmistorenderöijä -> med (ei high), tunnetusti heikko -> low. */
export function refineWithRenderer(renderer) {
  if (Q.forced) return;
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    Q.gpu = name;
    if (/swiftshader|llvmpipe|software/i.test(name) && Q.tier === 'high') setTier('med');
    // tunnetusti heikot / vanhat mobiili-GPU:t -> low (Adreno 3xx-5xx & 60x/61x, Mali-4xx/T/G31/G51/G52/G57 MP1-2, PowerVR GE/SGX)
    if (/Mali-4|Mali-T|Mali-G(31|51|52|57|68)\b|Adreno \(TM\) ([345]\d\d|6[01]\d)\b|PowerVR (SGX|Rogue GE|Rogue G6|B-Series BXE)|Vivante|VideoCore/i.test(name)) setTier('low');
    // pieni GPU-muistibudjetti (maxTextureSize 4096 tai pienempi = vanha laite)
    if (gl.getParameter(gl.MAX_TEXTURE_SIZE) <= 4096 && Q.mobile && Q.tier !== 'low') setTier('low');
  } catch (_) {}
}

// --- dynaaminen resoluutio ---
let acc = 0, frames = 0, lowSecs = 0, highSecs = 0, warm = 0;
export function monitorFrame(dtReal, hidden) {
  if (!Q.dynamic || hidden) return;
  warm += dtReal;
  if (warm < 4) return;            // latauksen jälkeinen nykiminen ei laske
  acc += dtReal; frames++;
  if (acc < 1) return;
  const fps = frames / acc; acc = 0; frames = 0;
  if (fps < 50) { lowSecs++; highSecs = 0; } else if (fps > 57) { highSecs++; lowSecs = 0; } else { lowSecs = 0; highSecs = 0; }
  // selvästi liian hidas (alle 24 fps): pudotetaan heti 2 s odottamatta
  if (fps < 24 && lowSecs >= 1) lowSecs = 2;
  if (lowSecs >= 2) {
    lowSecs = 0;
    if (Q.scale > 0.62) { Q.scale = Math.max(0.6, Q.scale - (fps < 35 ? 0.15 : 0.08)); for (const l of Q.listeners) l(Q); }
    else if (!Q.forced && Q.tier !== 'low') { const i = ORDER.indexOf(Q.tier); Q.scale = 0.85; setTier(ORDER[i - 1]); }
  }
  if (highSecs >= 6 && Q.scale < 1) { highSecs = 0; Q.scale = Math.min(1, Q.scale + 0.05); for (const l of Q.listeners) l(Q); }
}

setTier(detect());
