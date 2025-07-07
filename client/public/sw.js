const CACHE_NAME = 'astrology-portal-v1.0.0';
const API_CACHE_NAME = 'astrology-api-v1.0.0';

// Assets to cache for offline usage
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/generated-icon.png',
  // Core app files will be handled by Vite's build process
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/ephemeris',
  '/api/ephemeris/current-aspects',
  '/api/natal-charts',
  '/api/podcast-templates',
  '/api/auth/user'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle offline functionality
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Try to fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle API requests with cache-first strategy for ephemeris data
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // For ephemeris data, try cache first (good for offline usage)
  if (url.pathname.includes('/ephemeris')) {
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Try to fetch fresh data in background
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, response.clone());
            });
          }
        }).catch(() => {
          // Network failed, cached data is still valid
        });
        
        return cachedResponse;
      }
    } catch (error) {
      console.log('Cache match failed:', error);
    }
  }

  // Try network first, fallback to cache
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const responseToCache = networkResponse.clone();
      caches.open(API_CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      offline: true,
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending data when connection is restored
  console.log('Service Worker: Performing background sync');
  
  // Here you could sync any offline changes back to the server
  // For now, just refresh the cache with latest data
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch (error) {
          console.log('Background sync failed for:', request.url);
        }
      })
    );
  } catch (error) {
    console.log('Background sync error:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/generated-icon.png',
      badge: '/generated-icon.png',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});