
const resources = [
  '/css/marx.min.css'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('sw-cache').then(function (cache) {
      return Promise.all(resources.map(resource => cache.add(resource)))
    })
  )
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  )
})
