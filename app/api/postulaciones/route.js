import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — postulaciones de un rol o de un usuario
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rol_id = searchParams.get('rol_id')
  const postulante_id = searchParams.get('postulante_id')

  let query = supabase
    .from('postulaciones')
    .select(`*, perfiles ( nombre, ciudad, rol_principal, escala_score ), roles ( nombre, proyecto_id )`)

  if (rol_id) query = query.eq('rol_id', rol_id)
  if (postulante_id) query = query.eq('postulante_id', postulante_id)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ postulaciones: data })
}

// POST — crear postulación
export async function POST(request) {
  const body = await request.json()
  const { rol_id, postulante_id, mensaje } = body

  if (!rol_id || !postulante_id) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('postulaciones')
    .insert([{ rol_id, postulante_id, mensaje }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ postulacion: data }, { status: 201 })
}

// PATCH — aceptar o rechazar postulación
export async function PATCH(request) {
  const body = await request.json()
  const { id, estado } = body

  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('postulaciones')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ postulacion: data })
}
