import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // beforeFiles se revisa ANTES que app/page.tsx (que sigue ahí con su redirect,
      // pero nunca se llega a ejecutar porque este rewrite lo intercepta primero).
      // Resultado: escala.network muestra el contenido de index.html directamente,
      // sin cambiar la URL a /index.html — igual que cualquier sitio normal.
      beforeFiles: [
        { source: '/', destination: '/index.html' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
};

export default nextConfig;
