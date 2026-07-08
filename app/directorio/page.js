// app/directorio/page.js — wrapper servidor con metadata SEO
import DirectorioClientePage from './_page_client'

export const metadata = {
  title: 'Directorio de especialistas — Cofundadores y talento',
  description: 'Encuentra cofundadores, desarrolladores, diseñadores, abogados, contadores y más. Especialistas disponibles para unirse a startups en Latinoamérica y España.',
  openGraph: {
    title: 'Directorio de especialistas — Escala',
    description: 'Encuentra cofundadores y especialistas para tu startup. Desarrolladores, diseñadores, CTOs, abogados y más en Colombia, México, Chile y España.',
    url: 'https://escala.network/directorio',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Directorio de especialistas — Escala' },
  alternates: { canonical: 'https://escala.network/directorio' },
}

export default function DirectorioPage() {
  return <DirectorioClientePage />
}
