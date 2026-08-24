/* ============================================
   BIDÈ — Service Worker v1.0
   PWA avec cache intelligent des vidéos hero
   ============================================ */

var CACHE_NAME = 'bide-v1';
var VIDEO_CACHE = 'bide-videos-v1';
var CDN_CACHE = 'bide-cdn-v1';

/* --- Fichiers à mettre en cache immédiatement --- */
var PRECACHE_URLS = [
  './',
  'Desktop/laverie/index.html',
  'Desktop/laverie/style.css',
  'Desktop/laverie/main.js',
  'Desktop/laverie/contact.html',
  'Desktop/laverie/tarifs.html',
  'lavage1/lavage/style.css',
  'lavage1/lavage/main.js',
  'lavage1/lavage/a-propos.html',
  'lavage1/lavage/services.html',
  'lavage1/lavage/client.html',
  'lavage1/lavage/lavage.js',
  'login.html',
  'login.css',
  'auth.js',
  'admin.html',
  'admin.js',
  'admin.css',
  'caisse.html',
  'caisse.js',
  'caisse.css',
  'js/script.js',
  'css/style.css',
  'css/theme.css',
  'css/laveur-animations.css',
  'logo.jpg',
  'images/frt.png',
  'manifest.json'
];

/* --- URLs des vidéos hero (runtime cache) --- */
var VIDEO_URLS = [
  'Desktop/laverie/IMAGE/video.mp4',
  'Desktop/laverie/IMAGE/video2.mp4'
];

/* --- CDN à mettre en cache au premier accès --- */
var CDN_PATTERNS = [
  'cdn.jsdelivr.net/npm/bootstrap@5.3.3',
  'cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3',
  'unpkg.com/leaflet@1.9.4',
  'cdn.jsdelivr.net/npm/chart.js',
  'cdn.jsdelivr.net/npm/qrcodejs'
];

/* ============================================
   INSTALL — Pré-cache des fichiers essentiels
   ============================================ */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        /* Pré-cache des fichiers essentiels */
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
      .catch(function (err) {
        console.warn('[SW] Erreur pré-cache (non bloquant):', err);
        return self.skipWaiting();
      })
  );
});

/* ============================================
   ACTIVATE — Nettoyage des anciens caches
   ============================================ */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) {
            return name !== CACHE_NAME && name !== VIDEO_CACHE && name !== CDN_CACHE;
          })
          .map(function (name) {
            /* Suppression ancien cache */
            return caches.delete(name);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ============================================
   FETCH — Stratégie de cache par type
   ============================================ */
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  /* --- 1. Vidéos hero → Cache First (runtime) --- */
  if (isVideoRequest(event.request)) {
    event.respondWith(cacheFirstVideo(event.request));
    return;
  }

  /* --- 2. CDN → Stale While Revalidate --- */
  if (isCdnRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  /* --- 3. Images → Cache First --- */
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  /* --- 4. Pages HTML → Network First --- */
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').indexOf('text/html') !== -1) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  /* --- 5. CSS / JS → Cache First, fallback Network --- */
  if (event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  /* --- 6. Par défaut → Network --- */
  event.respondWith(fetch(event.request));
});

/* ============================================
   HELPERS — Stratégies de cache
   ============================================ */

function isVideoRequest(request) {
  return request.url.indexOf('.mp4') !== -1 ||
         request.url.indexOf('.webm') !== -1 ||
         request.url.indexOf('.ogv') !== -1;
}

function isCdnRequest(url) {
  for (var i = 0; i < CDN_PATTERNS.length; i++) {
    if (url.hostname.indexOf(CDN_PATTERNS[i].split('/')[0]) !== -1) return true;
  }
  return false;
}

/* Cache First : servir depuis le cache, sinon réseau */
function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, clone);
        });
      }
      return response;
    });
  });
}

/* Cache First pour vidéos : servir depuis le cache vidéo */
function cacheFirstVideo(request) {
  return caches.open(VIDEO_CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) {
        /* Vidéo servie depuis le cache */
        return cached;
      }
      return fetch(request).then(function (response) {
        if (response && response.status === 200) {
          /* Vidéo téléchargée et mise en cache */
          var clone = response.clone();
          cache.put(request, clone);
        }
        return response;
      }).catch(function () {
        /* Hors ligne et pas en cache → retourne une réponse vide */
        return new Response('', { status: 408, statusText: 'Video not cached' });
      });
    });
  });
}

/* Network First : réseau d'abord, fallback cache */
function networkFirst(request) {
  return fetch(request).then(function (response) {
    if (response && response.status === 200) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, clone);
      });
    }
    return response;
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      return cached || new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    });
  });
}

/* Stale While Revalidate : cache d'abord, mise à jour en arrière-plan */
function staleWhileRevalidate(request) {
  return caches.open(CDN_CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request).then(function (response) {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function () {
        return cached;
      });
      return cached || fetchPromise;
    });
  });
}

/* ============================================
   MESSAGES — Communication avec l'app
   ============================================ */
self.addEventListener('message', function (event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearVideos') {
    caches.open(VIDEO_CACHE).then(function (cache) {
      return cache.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) { return cache.delete(key); }));
      });
    }).then(function () {
      /* Cache vidéos vidé */
    });
  }
});
