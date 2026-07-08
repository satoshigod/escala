// app/que-es-escala/page.js — wrapper servidor con metadata SEO
import QueEsEscalaClientePage from './_page_client'

export const metadata = {
  title: 'Qué es Escala — La plataforma para crear empresas reales',
  description: 'Escala es la infraestructura para crear empresas. Conecta tu idea con cofundadores, especialistas e inversores que trabajan por participación diferida, sin capital inicial.',
  keywords: ['crear empresa', 'cofundador', 'startup latinoamerica', 'crear empresa sin capital', 'participación diferida', 'equity sharing'],
  openGraph: {
    title: 'Qué es Escala — La plataforma para crear empresas reales',
    description: 'La infraestructura para crear empresas reales. Conecta con cofundadores, especialistas e inversores sin necesidad de capital inicial.',
    url: 'https://escala.network/que-es-escala',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Qué es Escala' },
  alternates: { canonical: 'https://escala.network/que-es-escala' },
}

export default function QueEsEscalaPage() {
  return <QueEsEscalaClientePage />
}
