// app/buscar/page.js — wrapper servidor con metadata SEO
import BuscarClientePage from './_page_client'

export const metadata = {
  title: 'Buscar proyectos — Encuentra tu próximo proyecto',
  description: 'Explora proyectos de startups en Colombia, México, Chile y más. Encuentra el proyecto ideal según tu especialidad, sector y país. Únete sin necesidad de capital.',
  openGraph: {
    title: 'Buscar proyectos en Escala',
    description: 'Explora startups y proyectos que buscan especialistas. Colombia, México, Chile, Argentina, Perú, Ecuador y España.',
    url: 'https://escala.network/buscar',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Buscar proyectos — Escala' },
  alternates: { canonical: 'https://escala.network/buscar' },
}

export default function BuscarPage() {
  return <BuscarClientePage />
}
