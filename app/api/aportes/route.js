import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

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
    .insert([{ proyecto_id, aportante_id, rol_id, tipo, descripcion, valor, fecha, evidencia_url }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
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
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ aporte: data })
}
