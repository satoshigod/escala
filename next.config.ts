import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
};

export default withSentryConfig(nextConfig, {
  org: "plaza-black",
  project: "escala-production",

  // Solo subir source maps en CI/Vercel, no en local
  silent: !process.env.CI,

  // Source maps para ver el codigo original en Sentry (no el minificado)
  widenClientFileUpload: true,

  // No incluir el SDK de Sentry en el bundle del cliente mas de una vez
  disableLogger: true,

  // Tunneling para evitar adblockers que bloqueen sentry.io
  tunnelRoute: "/monitoring",

  // Ocultar source maps del bundle publico
  hideSourceMaps: true,

  // No hacer tree-shaking del SDK de Sentry
  automaticVercelMonitors: false,
});
