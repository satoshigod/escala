// sentry.edge.config.js
// Captura errores en el edge runtime (middleware, etc)

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: process.env.NODE_ENV === 'production',
})
