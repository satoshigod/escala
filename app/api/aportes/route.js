import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

// GET — aportes de un proyecto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('aportes')
    .select(`*, perfiles ( nombre, rol_principal )`)
    .eq('proyecto_id', proyecto_id)
    .order('fecha', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ aportes: data })
}

// POST — registrar nuevo aporte
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, aportante_id, rol_id, tipo, descripcion, valor, fecha, evidencia_url } = body

  if (!proyecto_id || !aportante_id || !tipo || !descripcion || !valor) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('aportes')
    .insert([{ proyecto_id, aportante_id, rol_id, tipo, descripcion, valor, fecha: fecha || new Date().toISOString().split('T')[0], evidencia_url }])
    .select('*, perfiles:aportante_id ( nombre ), proyectos:proyecto_id ( nombre, fundador_id, fundador:fundador_id ( nombre, email ) )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar al fundador para que verifique el aporte
  try {
    const fundadorId = data.proyectos?.fundador_id
    if (fundadorId) {
      await notificar('aporte_pendiente_verificacion', { id: fundadorId, email: data.proyectos?.fundador?.email }, {
        fundador_nombre: data.proyectos?.fundador?.nombre || 'Fundador',
        aportante_nombre: data.perfiles?.nombre || 'Alguien',
        tipo,
        descripcion,
        proyecto_id,
        proyecto_nombre: data.proyectos?.nombre || 'tu proyecto',
        workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace/aportes',
      })
    }
  } catch (e) {
    console.error('Error notificando aporte pendiente:', e.message)
  }

  return Response.json({ aporte: data }, { status: 201 })
}

// PATCH — validar un aporte
export async function PATCH(request) {
  const body = await request.json()
  const { id, validado, validado_por } = body

  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const { data, error } = await supabase
    .from('aportes')
    .update({ validado, validado_por })
    .eq('id', id)
    .select('*, perfiles:aportante_id ( nombre, email ), proyectos:proyecto_id ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar al aportante cuando su aporte queda verificado
  if (validado === true && data.aportante_id) {
    try {
      await notificar('aporte_verificado', { id: data.aportante_id, email: data.perfiles?.email }, {
        aportante_nombre: data.perfiles?.nombre || 'Usuario',
        descripcion: data.descripcion,
        proyecto_id: data.proyecto_id,
        proyecto_nombre: data.proyectos?.nombre || 'el proyecto',
        workspace_url: BASE_URL + '/proyectos/' + data.proyecto_id + '/workspace/aportes',
      })
    } catch (e) {
      console.error('Error notificando aporte verificado:', e.message)
    }
  }

  // Notificar si el aporte fue rechazado (validado=false)
  if (validado === false && data?.aportante_id) {
    try {
      const { notificar } = await import('@/lib/notificaciones/notificar')
      const { data: perfil } = await supabase.from('perfiles').select('email, nombre').eq('id', data.aportante_id).single()
      const { data: proyecto } = await supabase.from('proyectos').select('nombre').eq('id', data.proyecto_id).single()
      if (perfil?.email) {
        await notificar('aporte_rechazado', { id: data.aportante_id, email: perfil.email, nombre: perfil.nombre }, {
          proyecto_nombre: proyecto?.nombre || 'el proyecto', proyecto_id: data.proyecto_id,
        })
      }
    } catch(e) {}
  }
  return Response.json({ aporte: data })
}
