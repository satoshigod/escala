import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

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
  return Response.json({ hito: data })
}
