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
    { url: `${BASE_URL}/startup-bogota`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/startup-medellin`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/startup-santiago`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    // Landing pages SEO — especialistas
    { url: `${BASE_URL}/contador-publico-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/abogado-startups-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/desarrollador-startup-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/buscar-cofundador`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/buscar-cto`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    // Landing pages SEO — modelo e inversión
    { url: `${BASE_URL}/crear-empresa-sin-capital`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/angel-investor`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    // Landing pages SEO — local comercial
    { url: `${BASE_URL}/financiar-negocio-local-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/capital-para-abrir-tienda`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/como-financiar-local-comercial`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: `${BASE_URL}/maquinaria-confeccion-medellin`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.95 },
    { url: `${BASE_URL}/equipos-salon-belleza-medellin`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.95 },
    { url: `${BASE_URL}/equipos-negocio-comida-medellin`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.95 },
    // Landing pages SEO — maquinaria y equipos
    { url: `${BASE_URL}/financiar-maquinaria-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/financiar-equipos-negocio`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    // Landing pages SEO — inversores
    { url: `${BASE_URL}/invertir-en-startups-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    // Landing pages SEO — crear empresa
    { url: `${BASE_URL}/como-crear-empresa-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    // Landing pages SEO — startups por pais (nuevos)
    { url: `${BASE_URL}/startup-espana`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/startup-argentina`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/startup-peru`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    // Landing pages SEO — latinos USA
    { url: `${BASE_URL}/latinos-usa`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    // Directorio de inversion
    { url: `${BASE_URL}/directorio-inversion`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 },
    // Blog
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/blog/historia-de-escala`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/que-es-la-participacion-diferida`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/como-constituir-una-empresa-sas-en-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/como-crear-una-startup-sin-dinero`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/como-financiar-un-negocio-sin-banco`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/como-conseguir-inversionistas-startup-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/diferencia-prestamo-inversion-participacion`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/como-montar-tienda-sin-capital`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${BASE_URL}/blog/equipos-maquinaria-financiacion-colombia`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
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
