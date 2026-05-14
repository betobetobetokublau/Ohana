// ════════════════════════════════════════════════════════════════════════════
// Ohana service worker
// Alcance: app shell cache + offline shell. NO push, NO background sync.
// PRD v1.1 §2.4.3 — fuera de alcance explícito.
// ════════════════════════════════════════════════════════════════════════════

const VERSION = 'ohana-v1';
const SHELL_CACHE = `${VERSION}-shell`;

// Shell mínimo cacheado al instalar
const SHELL_URLS = [
  '/',
  '/hoy',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {
        // Si alguna URL falla (auth gating), ignora
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: stale-while-revalidate para assets, network-first para API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo manejar same-origin GET
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Saltar APIs de Supabase y rutas auth
  if (
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/realtime/')
  ) {
    return;
  }

  // Static assets · stale-while-revalidate
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    /\.(png|jpg|jpeg|gif|svg|webp|woff2?|ico)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetched = fetch(event.request).then((res) => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // HTML pages · network-first con fallback al shell cacheado
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // Cachear en background
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Fallback al shell raíz
          const shell = await caches.match('/hoy');
          if (shell) return shell;
          return new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        })
    );
  }
});
