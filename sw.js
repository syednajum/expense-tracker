'use strict';

const prefix = 'pkr-expense-tracker:' + self.registration.scope + ':';
const cacheName = prefix + 'v3';
const files = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
const shell = new Set(files.map(file => new URL(file, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName)
    .then(cache => cache.addAll(files.map(file => new Request(new URL(file, self.registration.scope), {cache:'reload'}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') url.search = '';
  if (!shell.has(url.href)) return;
  event.respondWith(caches.open(cacheName).then(cache => cache.match(url.href)).then(response => response || fetch(event.request)));
});
