// Service Worker v11 — app estático + rede-primeiro p/ questions.json
const CACHE = 'cnh-simulado-v11';

// Pré-cache (inclui app.html e questions.json p/ 1º uso offline)
const CORE = [
  './',
  './index.html',
  './app.html',        // <- ADICIONADO
  './styles.css',
  './app.js',
  './questions.json',  // <- ADICIONADO (para offline inicial)
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting(); // aplica logo após instalar
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // assume imediatamente as páginas abertas
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Rede-primeiro para o arquivo de questões (sempre busca a versão mais nova quando há internet)
  if (url.href.includes('questions.json')) {  // mais robusto em paths do GitHub Pages
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
