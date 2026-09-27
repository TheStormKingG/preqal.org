// Service worker for the funnel dashboard.
//
// SCOPE IS THE WHOLE POINT OF THIS FILE'S LOCATION. A service worker can only
// control paths at or below its own, so this one lives inside the dashboard's
// directory rather than at the site root. Put it at the root and it would
// intercept every request on preqal.org, including the React site — a
// caching bug here would then be a caching bug everywhere.
//
// What is cached: the shell only. Never the data.
// The dashboard's whole purpose is showing current numbers, so a stale cached
// response would be worse than an error — it would be a plausible wrong
// answer, which is the one failure nobody checks.

const VERSION = 'funnel-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      // addAll is atomic: one 404 rejects the whole install, which is what we
      // want — a half-cached shell is worse than no shell.
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Anything cross-origin — Supabase, the Supabase JS bundle, Google Fonts,
  // the OAuth round trip — passes straight through untouched. Not calling
  // respondWith leaves the request entirely to the browser.
  if (url.origin !== self.location.origin) return;

  // Same-origin but outside this dashboard: also none of our business.
  if (!url.pathname.startsWith(new URL('./', self.location).pathname)) return;

  // The document itself: network first, so a deploy is picked up immediately;
  // cache only as the offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  // Icons and manifest: cache first, they change only on a version bump.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
