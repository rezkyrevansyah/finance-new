const CACHE_NAME = 'finance-tracker-v1'

// Assets to cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== location.origin) return

  // API routes: network-first (always fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' },
      }))
    )
    return
  }

  // Navigation & static assets: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful GET responses
        if (request.method === 'GET' && response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})
