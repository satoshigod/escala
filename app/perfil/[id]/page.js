// app/perfil/[id]/page.js — wrapper servidor para SEO

import { createClient } from '@supabase/supabase-js'
import PerfilClientePage from './_page_client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const { data: p } = await supabase
      .from('perfiles')
      .select('nombre, especialidad, ciudad, pais, rol_principal, escala_score')
      .eq('id', id)
      .single()

    if (!p) return { title: 'Perfil en Escala' }

    const titulo = `${p.nombre} — ${p.especialidad || p.rol_principal || 'Especialista'} en Escala`
    const descripcion = `${p.nombre} es ${p.especialidad || p.rol_principal || 'especialista'} en Escala${p.ciudad ? `, basado en ${p.ciudad}` : ''}. Reputación Escala: ${p.escala_score || 0}. Conéctate en la plataforma para crear empresas.`

    return {
      title: titulo,
      description: descripcion.substring(0, 155),
      openGraph: {
        title: titulo,
        description: descripcion.substring(0, 155),
        url: `https://escala.network/perfil/\${id}`,
        siteName: 'Escala',
        type: 'profile',
        images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary',
        title: titulo,
        description: descripcion.substring(0, 155),
      },
      alternates: {
        canonical: `https://escala.network/perfil/\${id}`,
      },
    }
  } catch {
    return { title: 'Perfil en Escala' }
  }
}

export default function PerfilPage() {
  return <PerfilClientePage />
}
