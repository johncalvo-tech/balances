// Service worker minimo: guarda la "cascara" de la app (icono, pantalla de carga) para que
// abra al instante. Los datos SIEMPRE vienen en vivo de Apps Script (no se guardan aqui).
var CACHE = 'balances-v1';
var ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); })); self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })); self.clients.claim(); });
self.addEventListener('fetch', function(e){
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;            // Apps Script: siempre en vivo
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});
