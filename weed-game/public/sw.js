// Service worker: fast second visit + partial offline play.
//   /assets/*  (Vite output, content-hashed names)  -> cache-first (immutable)
//   models/, story/, icons, manifest (not versioned) -> stale-while-revalidate (instant from cache, refreshed in the background)
//   page navigations (index.html)                    -> network-first with a short timeout, cached copy offline
//   audio/ and Range requests                        -> never touched (streaming + iOS Range; licensed files are not copied)
// ?nosw on any page unregisters it. Bump VERSION to drop every cache.
const VERSION = 'v1';
const C_STATIC = 'weed-static-' + VERSION, C_MEDIA = 'weed-media-' + VERSION, C_PAGE = 'weed-page-' + VERSION;
const KEEP = [C_STATIC, C_MEDIA, C_PAGE];
const MAX_STATIC = 40, MAX_MEDIA = 120;

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C_PAGE).then(c => c.add('./').catch(() => {}))); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('weed-') && !KEEP.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function trim(name, max) {
  const c = await caches.open(name); const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);   // oldest first (insertion order)
}

async function cacheFirst(req) {
  const c = await caches.open(C_STATIC);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.status === 200) { c.put(req, res.clone()).then(() => trim(C_STATIC, MAX_STATIC)).catch(() => {}); }
  return res;
}

async function staleWhileRevalidate(req, ev) {
  const c = await caches.open(C_MEDIA);
  const hit = await c.match(req);
  const net = fetch(req).then(res => {
    if (res.ok && res.status === 200) c.put(req, res.clone()).then(() => trim(C_MEDIA, MAX_MEDIA)).catch(() => {});
    return res;
  });
  if (hit) { ev.waitUntil(net.catch(() => {})); return hit; }
  return net;
}

async function networkFirst(req) {
  const c = await caches.open(C_PAGE);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))]);
    if (res.ok && res.status === 200) c.put('./', res.clone()).catch(() => {});
    return res;
  } catch (err) {
    const hit = (await c.match(req)) || (await c.match('./'));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  const p = url.pathname.slice(scope.pathname.length - 1);   // path relative to the app root, starts with '/'
  if (p.startsWith('/audio/') || p.startsWith('/src/') || p.startsWith('/@') || p.includes('node_modules') || url.searchParams.has('nosw')) return;
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req)); return; }
  if (p.startsWith('/assets/')) { e.respondWith(cacheFirst(req)); return; }
  if (/^\/(models|story)\//.test(p) || /\.(png|webp|jpg|svg|webmanifest|glb)$/.test(p)) { e.respondWith(staleWhileRevalidate(req, e)); return; }
});
