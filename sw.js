var SCOPE = self.registration.scope;
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open('oos-shell').then(function (c) { return c.add(new Request(SCOPE, {cache: 'reload'})); }).catch(function () {}));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  e.respondWith((async function () {
    var cache = await caches.open('oos-shell');
    try {
      var net = await Promise.race([fetch(r), new Promise(function (_, rej) { setTimeout(rej, 3500); })]);
      if (net && net.ok) { try { await cache.put(SCOPE, net.clone()); } catch (_) {} }
      return net;
    } catch (_) {
      var m = await cache.match(SCOPE);
      return m || Response.error();
    }
  })());
});
