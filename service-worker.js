/**
 * ========== SERVICE WORKER - VALDES.TECH ==========
 * Gère le cache, offline-first, et optimisations PWA
 * Stratégie: Cache-first pour assets, Network-first pour API
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `valdes-tech-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets critiques à pré-cacher
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/firebase-config.js',
  '/images/profile.jpg'
];

/**
 * Installation du Service Worker
 * Pré-cache les assets critiques
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pré-caching des assets critiques...');
      // Cacher chaque asset individuellement pour éviter que 1 erreur bloque le reste
      return Promise.all(
        CRITICAL_ASSETS.map(url => {
          return cache.add(url).catch((error) => {
            console.warn(`[SW] Skipped caching ${url}:`, error.message);
          });
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Installation complète');
      // Force le SW à se mettre à jour immédiatement
      return self.skipWaiting();
    }).catch((error) => {
      console.warn('[SW] Installation error (non-critical):', error);
      return self.skipWaiting();
    })
  );
});

/**
 * Activation du Service Worker
 * Nettoie les anciens caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] ✅ Activation complète');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event handler
 * Stratégies différentes selon le type de requête
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes externes non-API
  if (url.origin !== location.origin && !url.hostname.includes('firebase') && !url.hostname.includes('googleapis')) {
    return;
  }

  // Stratégie pour les assets statiques (cache-first)
  if (isStaticAsset(url)) {
    return event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          console.log('[SW] Cache HIT:', url.pathname);
          return response;
        }
        console.log('[SW] Cache MISS:', url.pathname);
        return fetch(request).then((response) => {
          // Mettre en cache les réponses réussies uniquement
          if (response && response.status === 200 && response.type !== 'error') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((error) => {
                console.warn('[SW] Cache.put failed for', url.pathname, ':', error.message);
              });
            }).catch((error) => {
              console.warn('[SW] Cache.open failed:', error.message);
            });
          }
          return response;
        }).catch((error) => {
          console.warn('[SW] Fetch failed for', url.pathname);
          // Fallback offline
          return caches.match(OFFLINE_URL).catch(() => new Response('Offline'));
        });
      })
    );
  }

  // Stratégie pour les requêtes API (network-first)
  if (isAPIRequest(url)) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les réponses réussies
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Offline - retour cache:', request.url);
          return caches.match(request);
        })
    );
  }

  // Par défaut: network-first
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => caches.match(request))
  );
});

/**
 * Gère les messages du client
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache vidé');
    });
  }
});

/**
 * Détecte si une URL est un asset statique
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || url.pathname === '/';
}

/**
 * Détecte si une URL est une requête API
 */
function isAPIRequest(url) {
  return url.hostname.includes('firebase') || 
         url.hostname.includes('googleapis') ||
         url.pathname.includes('/api/');
}

console.log('[SW] Service Worker script chargé');
