// app/que-es-escala/page.js — wrapper servidor con metadata SEO
import QueEsEscalaClientePage from './_page_client'

export const metadata = {
  title: 'Qué es Escala — La plataforma para crear, hacer crecer o mejorar tu negocio o empresa',
  description: 'Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa — talento, capital, especialistas, tecnología, maquinaria y financiamiento en un solo lugar.',
  keywords: ['que es escala', 'crear empresa sin capital', 'financiar local comercial colombia', 'participacion diferida startup', 'fondeo negocio local', 'startup latinoamerica'],
  openGraph: {
    title: 'Qué es Escala — La plataforma para tu negocio o empresa',
    description: 'La plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa.',
    url: 'https://escala.network/que-es-escala',
    images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Qué es Escala' },
  alternates: { canonical: 'https://escala.network/que-es-escala' },
}

export default function QueEsEscalaPage() {
  return <QueEsEscalaClientePage />
}
