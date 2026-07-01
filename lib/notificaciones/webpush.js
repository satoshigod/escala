// lib/notificaciones/webpush.js
//
// Envío de Web Push (navegador desktop y móvil vía Service Worker), usando el
// paquete estándar `web-push` y llaves VAPID. Requiere las variables de entorno
// NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY (ver instrucciones de despliegue).
//
// Nota: esto NO es push de app móvil nativa (Expo/FCM) — Escala hoy es una app web
// Next.js, no una app React Native. Web Push funciona en Chrome/Edge/Firefox desktop
// y en Android; en iOS requiere que el usuario haya agregado Escala a su pantalla de
// inicio (limitación de Apple, no de esta implementación).

import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

let configurado = false
function asegurarConfiguracion() {
  if (configurado) return
  webpush.setVapidDetails(
    'mailto:soporte@escala.network',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
  configurado = true
}

export async function enviarPush(subscription, payload) {
  asegurarConfiguracion()
  const sub = {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  }
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload))
  } catch (e) {
    // 404/410 = suscripción vencida o el usuario revocó el permiso — se borra para no reintentar
    if (e.statusCode === 404 || e.statusCode === 410) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
    } else {
      console.error('Error enviando push:', e.message)
    }
  }
}
