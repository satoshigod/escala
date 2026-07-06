import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

// GET — listar proyectos activos
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const sector = searchParams.get('sector')

  let query = supabase
    .from('proyectos')
    .select(`
      *,
      perfiles ( nombre, ciudad ),
      roles ( id, nombre, estado, es_prioritario, tipo_aporte )
    `)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (sector) query = query.eq('sector', sector)

  const { data, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyectos: data })
}

// POST — crear nuevo proyecto
export async function POST(request) {
  const body = await request.json()
  const { nombre, descripcion, tipo, sector, ciudad, fundador_id, industria, pais, estado, estado_financiacion, nivel_avance, modalidad_trabajo, roles_buscados } = body

  if (!nombre || !descripcion || !tipo || !fundador_id) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ nombre, descripcion, tipo, sector, ciudad, fundador_id, industria: industria || null, pais: pais || null, estado: estado || 'activo', estado_financiacion: estado_financiacion || 'riesgo_compartido', nivel_avance: nivel_avance || null, modalidad_trabajo: modalidad_trabajo || null, roles_buscados: roles_buscados || [] }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar al fundador — solo si quedó publicado (no en borrador)
  if (data.estado !== 'borrador') {
    try {
      const { data: fundador } = await supabase.from('perfiles').select('nombre, email').eq('id', fundador_id).single()
      if (fundador?.email) {
        await notificar('proyecto_publicado', { id: fundador_id, email: fundador.email }, {
          fundador_nombre: fundador.nombre,
          proyecto_nombre: data.nombre,
          proyecto_id: data.id,
          proyecto_url: BASE_URL + '/proyectos/' + data.id,
        })
      }
    } catch (e) {
      console.error('Error notificando proyecto publicado:', e.message)
    }
  }

  return Response.json({ proyecto: data }, { status: 201 })
}
