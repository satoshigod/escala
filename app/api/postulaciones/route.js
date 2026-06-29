import { createClient } from '@supabase/supabase-js'
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
    .select('*, perfiles ( nombre, ciudad, rol_principal, escala_score, especialidad, whatsapp ), roles ( nombre, proyecto_id, proyectos ( nombre, sector, ciudad ) )')
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

  // Email al fundador
  try {
    const fundador_email = data.roles?.proyectos?.perfiles?.email
    const fundador_nombre = data.roles?.proyectos?.perfiles?.nombre || 'Fundador'
    const postulante_nombre = data.perfiles?.nombre || 'Alguien'
    const rol_nombre = data.roles?.nombre || 'un rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'tu proyecto'

    if (fundador_email) {
      await fetch(BASE_URL + '/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'nueva_postulacion',
          destinatario: fundador_email,
          datos: {
            fundador_nombre,
            postulante_nombre,
            rol_nombre,
            proyecto_nombre,
            perfil_url: BASE_URL + '/perfil/' + postulante_id
          }
        })
      })
    }
  } catch (e) {
    console.error('Error enviando email:', e)
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

  // Email al postulante
  try {
    const postulante_email = data.perfiles?.email
    const postulante_nombre = data.perfiles?.nombre || 'Usuario'
    const rol_nombre = data.roles?.nombre || 'el rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'el proyecto'
    const proyecto_id = data.roles?.proyecto_id

    if (postulante_email && (estado === 'aceptada' || estado === 'rechazada')) {
      await fetch(BASE_URL + '/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: estado === 'aceptada' ? 'postulacion_aceptada' : 'postulacion_rechazada',
          destinatario: postulante_email,
          datos: {
            postulante_nombre,
            rol_nombre,
            proyecto_nombre,
            workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace',
            proyectos_url: BASE_URL + '/proyectos'
          }
        })
      })
    }
  } catch (e) {
    console.error('Error enviando email:', e)
  }

  return Response.json({ postulacion: data })
}
