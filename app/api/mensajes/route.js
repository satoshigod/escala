import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('mensajes')
    .select('*, perfiles ( nombre, rol_principal, especialidad )')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ mensajes: data })
}

export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, autor_id, contenido } = body

  if (!proyecto_id || !autor_id || !contenido) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert([{ proyecto_id, autor_id, contenido }])
    .select('*, perfiles ( nombre, rol_principal, especialidad )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ mensaje: data }, { status: 201 })
}
