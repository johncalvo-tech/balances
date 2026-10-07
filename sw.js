// Guarda en el celular la "cascara" de la app y la libreria de Excel para abrir SIN SEÑAL.
// La app en si y los datos se guardan en el celular desde la propia app (IndexedDB).
var CACHE = 'balances-v2';
var ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
var XLSX_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS).then(function(){ return c.add(XLSX_CDN).catch(function(){}); }); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  // Libreria de Excel: primero la copia guardada
  if (u.href === XLSX_CDN) { e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request); })); return; }
  if (u.origin !== self.location.origin) return;   // Apps Script: siempre en vivo (lo maneja la app)
  // Cascara: primero internet (para tomar cambios), si no hay, la copia guardada
  e.respondWith(fetch(e.request).then(function(r){
    var copia = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copia); }); return r;
  }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); }); }));
});
