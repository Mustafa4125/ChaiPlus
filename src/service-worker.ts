/// <reference lib="webworker" />

const CACHE_NAME = 'chaiplus-shell-v2';
const APP_SHELL = ['/manifest.json', '/favicon.svg', '/icon-192.svg', '/icon-512.svg'];

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => sw.skipWaiting()),
  );
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => sw.clients.claim()),
  );
});

// Network-first: always fetch the latest app code; only fall back to cache when offline.
sw.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== sw.location.origin) return;

  // Never cache HTML navigations — index.html must always be fresh so it references the latest hashed bundle.
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html') as Promise<Response>),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(() => caches.match(request) as Promise<Response>),
  );
});

