// sentry.server.config.js
// Captura errores del lado del servidor (API routes, SSR)

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.2,

  enabled: process.env.NODE_ENV === 'production',

  // En el servidor capturamos mas contexto
  beforeSend(event, hint) {
    const error = hint?.originalException
    // Agregar contexto del error de Supabase si existe
    if (error?.code) {
      event.extra = {
        ...event.extra,
        supabase_error_code: error.code,
        supabase_error_message: error.message,
      }
    }
    return event
  },
})
