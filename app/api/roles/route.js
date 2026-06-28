import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — roles de un proyecto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('proyecto_id', proyecto_id)
    .order('es_prioritario', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ roles: data })
}

// POST — crear rol en un proyecto
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, nombre, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario } = body

  if (!proyecto_id || !nombre || !tipo_aporte || !modalidad) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('roles')
    .insert([{ proyecto_id, nombre, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ rol: data }, { status: 201 })
}

// PATCH — actualizar estado de un rol
export async function PATCH(request) {
  const body = await request.json()
  const { id, estado } = body

  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('roles')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ rol: data })
}
