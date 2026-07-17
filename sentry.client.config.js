// sentry.client.config.js
// Captura errores del lado del cliente (browser)

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Captura el 100% de errores en produccion
  // Bajar a 0.1 si hay demasiado volumen
  tracesSampleRate: 0.2,

  // Captura replays solo cuando hay un error (no por defecto)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  // No activar en desarrollo local
  enabled: process.env.NODE_ENV === 'production',

  // Ignorar errores conocidos que no son bugs reales
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error exception captured',
    'Network request failed',
    'Load failed',
  ],

  // Contexto adicional para cada error
  beforeSend(event) {
    // No enviar errores de bots o crawlers
    if (event.request?.headers?.['user-agent']?.includes('bot')) {
      return null
    }
    return event
  },
})
