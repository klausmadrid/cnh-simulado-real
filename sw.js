
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('cnh-simulado-v1').then(cache => cache.addAll([
      './', './index.html', './styles.css', './app.js', './questions.json', './manifest.json'
    ]))
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
