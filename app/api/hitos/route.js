import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

// GET — hitos de un proyecto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('hitos')
    .select('*')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ hitos: data })
}

// POST — crear hito
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, nombre, descripcion } = body

  if (!proyecto_id || !nombre) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('hitos')
    .insert([{ proyecto_id, nombre, descripcion }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ hito: data }, { status: 201 })
}

// PATCH — marcar hito como completado
export async function PATCH(request) {
  const body = await request.json()
  const { id, completado, evidencia_url } = body

  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const fecha_completado = completado ? new Date().toISOString().split('T')[0] : null

  const { data, error } = await supabase
    .from('hitos')
    .update({ completado, fecha_completado, evidencia_url })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar a todo el equipo del proyecto cuando el hito se completa
  if (completado) {
    try {
      const { data: proyecto } = await supabase
        .from('proyectos')
        .select('nombre, fundador_id, perfiles:fundador_id ( nombre, email )')
        .eq('id', data.proyecto_id)
        .single()

      const { data: rolesDelProyecto } = await supabase
        .from('roles')
        .select('id')
        .eq('proyecto_id', data.proyecto_id)

      let destinatarios = []
      if (rolesDelProyecto && rolesDelProyecto.length > 0) {
        const { data: aceptados } = await supabase
          .from('postulaciones')
          .select('postulante_id, perfiles:postulante_id ( email )')
          .in('rol_id', rolesDelProyecto.map(r => r.id))
          .eq('estado', 'aceptada')
        destinatarios = (aceptados || []).map(a => ({ id: a.postulante_id, email: a.perfiles?.email }))
      }

      if (proyecto?.fundador_id && !destinatarios.some(d => d.id === proyecto.fundador_id)) {
        destinatarios.push({ id: proyecto.fundador_id, email: proyecto.perfiles?.email })
      }

      if (destinatarios.length > 0) {
        await notificar('hito_completado', destinatarios, {
          hito_nombre: data.nombre,
          proyecto_nombre: proyecto?.nombre || 'tu proyecto',
          proyecto_id: data.proyecto_id,
          workspace_url: BASE_URL + '/proyectos/' + data.proyecto_id + '/workspace/hitos',
        })
      }
    } catch (e) {
      console.error('Error notificando hito completado:', e.message)
    }
  }

  return Response.json({ hito: data })
}
