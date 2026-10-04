// Uygulama dosyalarını telefona kaydeder, internet olmadan da açılsın diye.
// Harcama verilerine dokunmaz; onlar yalnızca telefonun hafızasında durur.
var CACHE = 'harcama-v15';
var FILES = ['./', 'index.html', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Önce internetten güncel sürümü dener, olmazsa kayıtlı kopyayı açar.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // Telefonun kendi hafızasını atlayıp her açılışta güncel sürümü ister
    fetch(e.request, { cache: 'no-store' }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
