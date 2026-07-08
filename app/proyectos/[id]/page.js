// app/proyectos/[id]/page.js — wrapper servidor para SEO
// La lógica de UI está en _page_client.js

import { createClient } from '@supabase/supabase-js'
import ProyectoClientePage from './_page_client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const { data: p } = await supabase
      .from('proyectos')
      .select('nombre, descripcion, sector, ciudad, pais, industria, tipo')
      .eq('id', id)
      .single()

    if (!p) return { title: 'Proyecto en Escala' }

    const titulo = `${p.nombre} — Proyecto en Escala`
    const descripcion = p.descripcion?.substring(0, 155) || `Proyecto ${p.tipo} en ${p.sector}. ${p.ciudad || ''} — Únete al equipo en Escala.`

    return {
      title: titulo,
      description: descripcion,
      openGraph: {
        title: titulo,
        description: descripcion,
        url: `https://escala.network/proyectos/\${id}`,
        siteName: 'Escala',
        type: 'website',
        images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: descripcion,
      },
      alternates: {
        canonical: `https://escala.network/proyectos/\${id}`,
      },
    }
  } catch {
    return { title: 'Proyecto en Escala' }
  }
}

export default function ProyectoPage() {
  return <ProyectoClientePage />
}
