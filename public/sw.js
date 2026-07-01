// public/sw.js — Service Worker de Escala, solo para Web Push (no cachea nada más)

self.addEventListener('push', function (event) {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch (e) { data = { title: 'Escala', body: event.data.text() } }

  const options = {
    body: data.body || '',
    data: { url: data.url || '/dashboard' },
    tag: data.tag || 'escala-notificacion',
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Escala', options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
