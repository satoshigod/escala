import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala-blush-nine.vercel.app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rol_id = searchParams.get('rol_id')
  const postulante_id = searchParams.get('postulante_id')
  let query = supabase
    .from('postulaciones')
    .select('*, perfiles ( nombre, ciudad, pais, rol_principal, escala_score, especialidad, whatsapp ), roles ( nombre, proyecto_id, proyectos ( nombre, sector, ciudad ) )')
  if (rol_id) query = query.eq('rol_id', rol_id)
  if (postulante_id) query = query.eq('postulante_id', postulante_id)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ postulaciones: data })
}

export async function POST(request) {
  const body = await request.json()
  const { rol_id, postulante_id, mensaje } = body
  if (!rol_id || !postulante_id) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('postulaciones')
    .insert([{ rol_id, postulante_id, mensaje }])
    .select('*, perfiles ( nombre, email ), roles ( nombre, proyecto_id, proyectos ( nombre, fundador_id, perfiles ( nombre, email ) ) )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificación al fundador
  try {
    const fundador_id = data.roles?.proyectos?.fundador_id
    const fundador_email = data.roles?.proyectos?.perfiles?.email
    const fundador_nombre = data.roles?.proyectos?.perfiles?.nombre || 'Fundador'
    const postulante_nombre = data.perfiles?.nombre || 'Alguien'
    const rol_nombre = data.roles?.nombre || 'un rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'tu proyecto'

    if (fundador_id || fundador_email) {
      await notificar('nueva_postulacion', { id: fundador_id, email: fundador_email }, {
        fundador_nombre,
        postulante_nombre,
        rol_nombre,
        proyecto_nombre,
        postulante_id,
        perfil_url: BASE_URL + '/perfil/' + postulante_id,
      })
    }
  } catch (e) {
    console.error('Error notificando nueva postulacion:', e)
  }

  return Response.json({ postulacion: data }, { status: 201 })
}

export async function PATCH(request) {
  const body = await request.json()
  const { id, estado } = body
  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('postulaciones')
    .update({ estado })
    .eq('id', id)
    .select('*, perfiles ( nombre, email ), roles ( nombre, proyecto_id, proyectos ( nombre ) )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificación al postulante
  try {
    const postulante_email = data.perfiles?.email
    const postulante_nombre = data.perfiles?.nombre || 'Usuario'
    const rol_nombre = data.roles?.nombre || 'el rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'el proyecto'
    const proyecto_id = data.roles?.proyecto_id

    if (data.postulante_id && (estado === 'aceptada' || estado === 'rechazada')) {
      await notificar(
        estado === 'aceptada' ? 'postulacion_aceptada' : 'postulacion_rechazada',
        { id: data.postulante_id, email: postulante_email },
        {
          postulante_nombre,
          rol_nombre,
          proyecto_nombre,
          proyecto_id,
          workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace',
          proyectos_url: BASE_URL + '/proyectos',
        }
      )
    }
  } catch (e) {
    console.error('Error notificando cambio de postulacion:', e)
  }

  return Response.json({ postulacion: data })
}
