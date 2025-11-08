// Service Worker for Bringora PWA
// Provides offline support and caching

const CACHE_NAME = 'bringora-v2'
const RUNTIME_CACHE = 'bringora-runtime-v2'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip external API calls and resources (always use network, don't cache)
  // This prevents CSP violations and chrome-extension errors
  const url = new URL(event.request.url)
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('mapbox.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('fonts.gstatic.com') ||
    event.request.url.includes('chrome-extension://') ||
    // Don't cache CSS/JS files from /assets/ - always fetch fresh to avoid MIME type issues
    event.request.url.includes('/assets/') && (event.request.url.endsWith('.css') || event.request.url.endsWith('.js')) ||
    (url.origin !== self.location.origin && url.protocol.startsWith('http'))
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // If network fails and no cache, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'Bringora'
  const options = {
    body: data.body || 'You have a new message',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: data,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})

