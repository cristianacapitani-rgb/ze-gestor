const CACHE = 'ze-gestor-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

// PUSH NOTIFICATION
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  self.registration.showNotification(data.title || 'Zé Gestor', {
    body: data.body || 'Você tem um alerta no seu restaurante!',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'ze-gestor',
    data: { url: data.url || '/' },
    actions: data.actions || [
      { action: 'abrir', title: '📊 Ver agora' },
      { action: 'depois', title: 'Depois' }
    ]
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'abrir' || !e.action) {
    e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
  }
});

// SCHEDULED REMINDERS via message
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_REMINDER') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body, tag, icon: '/icon-192.png',
        data: { url: '/' }
      });
    }, delay);
  }
});
