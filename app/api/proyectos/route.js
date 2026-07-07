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

// PATCH — actualizar datos del proyecto o marcarlo como completado
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, fundador_id, estado, nombre, descripcion, sector, ciudad, pais, industria, nivel_avance, modalidad_trabajo, roles_buscados } = body

    if (!id || !fundador_id) return Response.json({ error: 'Faltan id y fundador_id' }, { status: 400 })

    // Verificar ownership
    const { data: proyecto, error: projError } = await supabase
      .from('proyectos').select('fundador_id, nombre, estado').eq('id', id).single()

    if (projError || !proyecto) return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.fundador_id !== fundador_id) return Response.json({ error: 'Solo el fundador puede editar este proyecto' }, { status: 403 })

    // Construir campos a actualizar
    const updates = {}
    if (nombre) updates.nombre = nombre
    if (descripcion) updates.descripcion = descripcion
    if (sector) updates.sector = sector
    if (ciudad) updates.ciudad = ciudad
    if (pais) updates.pais = pais
    if (industria) updates.industria = industria
    if (nivel_avance) updates.nivel_avance = nivel_avance
    if (modalidad_trabajo) updates.modalidad_trabajo = modalidad_trabajo
    if (roles_buscados) updates.roles_buscados = roles_buscados
    if (estado) updates.estado = estado

    const { data, error } = await supabase
      .from('proyectos').update(updates).eq('id', id).select().single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Notificar según el tipo de cambio
    const { data: fundador } = await supabase.from('perfiles').select('nombre, email').eq('id', fundador_id).single()
    const dest = { id: fundador_id, email: fundador?.email, nombre: fundador?.nombre }

    if (estado === 'completado' && proyecto.estado !== 'completado') {
      // Notificar a todo el equipo
      const { data: miembros } = await supabase
        .from('postulaciones')
        .select('postulante_id, perfiles!postulaciones_postulante_id_fkey(id, email, nombre)')
        .eq('estado', 'aceptada')
      
      const todos = [dest, ...(miembros || []).map(m => m.perfiles).filter(p => p?.email && p.id !== fundador_id)]
      await Promise.allSettled(todos.map(d =>
        notificar('proyecto_completado', d, { proyecto_nombre: data.nombre, proyecto_id: id })
      ))

      // Logro: primer proyecto completado para cada miembro
      const { otorgarLogro } = await import('@/lib/logros')
      await Promise.allSettled(todos.map(d =>
        otorgarLogro(supabase, d.id, 'primer_proyecto_completado', id)
      ))

    } else if (Object.keys(updates).some(k => k !== 'estado')) {
      // Actualización de datos — notificar solo al fundador
      await notificar('proyecto_actualizado', dest, {
        proyecto_nombre: data.nombre,
        proyecto_id: id,
      }).catch(() => {})
    }

    return Response.json({ proyecto: data })
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
