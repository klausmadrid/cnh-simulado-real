// Service Worker v3 — cache para app estático + rede-primeiro para questions.json
const CACHE = 'cnh-simulado-v3';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.json', './sw.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Sempre tentar REDE primeiro para pegar a versão mais nova das questões
  if (url.pathname.endsWith('/questions.json')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request)) // offline: usa cache
    );
    return;
  }

  // Demais arquivos: cache-primeiro (rápido/offline)
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});
