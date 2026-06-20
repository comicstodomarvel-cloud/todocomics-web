const CACHE = 'tc-v1'
const OFFLINE_URL = '/offline.html'
const STATIC_EXT = /\.(js|css|woff2?|svg|png|jpg|jpeg|webp|avif)$/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Sólo manejar requests del mismo origen
  if (url.origin !== self.location.origin) return

  // API — nunca cachear
  if (url.pathname.startsWith('/api/')) return

  // Navegación — network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((cache) => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Assets estáticos (JS, CSS, fuentes, imágenes locales) — cache first
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
    return
  }

  // Otros — network first
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(request, clone))
        return res
      })
      .catch(() => caches.match(request))
  )
})
