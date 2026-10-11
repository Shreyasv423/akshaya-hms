const CACHE_NAME = 'akshaya-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Network first, graceful cache fallback for app shell and assets
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Never intercept API or Supabase auth/data calls
    const url = new URL(event.request.url);
    if (
        url.pathname.startsWith('/rest/') ||
        url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/api/') ||
        url.hostname.includes('supabase.co')
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);
                return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            })
    );
});
