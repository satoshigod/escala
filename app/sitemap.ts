// app/sitemap.ts
// Sitemap dinámico — incluye páginas estáticas + proyectos y perfiles públicos
// Next.js lo sirve automáticamente en /sitemap.xml

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const BASE_URL = 'https://escala.network'

export default async function sitemap() {
  // Páginas estáticas públicas
  const estaticas = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/que-es-escala`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/proyectos`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/directorio`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/buscar`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${BASE_URL}/registro`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    // Landing pages SEO — países
    { url: `${BASE_URL}/startup-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/startup-mexico`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/startup-chile`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    // Landing pages SEO — especialistas
    { url: `${BASE_URL}/contador-publico-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/abogado-startups-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/buscar-cofundador`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    // Landing pages SEO — modelo
    { url: `${BASE_URL}/crear-empresa-sin-capital`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
  ]

  // Proyectos públicos
  let proyectos: any[] = []
  try {
    const { data } = await supabase
      .from('proyectos')
      .select('id, updated_at, nombre')
      .eq('estado', 'activo')
      .order('updated_at', { ascending: false })
      .limit(500)
    proyectos = (data || []).map(p => ({
      url: `${BASE_URL}/proyectos/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (e) {}

  // Perfiles públicos
  let perfiles: any[] = []
  try {
    const { data } = await supabase
      .from('perfiles')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1000)
    perfiles = (data || []).map(p => ({
      url: `${BASE_URL}/perfil/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (e) {}

  return [...estaticas, ...proyectos, ...perfiles]
}
