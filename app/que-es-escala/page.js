// app/que-es-escala/page.js — wrapper servidor con metadata SEO
import QueEsEscalaClientePage from './_page_client'

export const metadata = {
  title: 'Qué es Escala — Startups y Negocios en Local Comercial sin Capital Inicial',
  description: 'Escala tiene dos modelos: equity diferido para startups (el equipo trabaja por participación) y fondeo de locales (un inversionista financia tu negocio y recupera desde las ventas diarias). Sin banco, sin garante.',
  keywords: ['que es escala', 'crear empresa sin capital', 'financiar local comercial colombia', 'participacion diferida startup', 'fondeo negocio local', 'startup latinoamerica'],
  openGraph: {
    title: 'Qué es Escala — Startups y Negocios en Local sin Capital',
    description: 'Dos modelos: equity diferido para startups y fondeo de locales comerciales. Sin banco, sin garante.',
    url: 'https://escala.network/que-es-escala',
    images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Qué es Escala' },
  alternates: { canonical: 'https://escala.network/que-es-escala' },
}

export default function QueEsEscalaPage() {
  return <QueEsEscalaClientePage />
}
