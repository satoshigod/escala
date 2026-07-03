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
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { proyecto_id, nombre, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario } = body

  if (!proyecto_id || !nombre || !tipo_aporte || !modalidad) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('id, fundador_id')
    .eq('id', proyecto_id)
    .single()

  if (proyectoError || !proyecto) {
    return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  if (proyecto.fundador_id !== user.id) {
    return Response.json({ error: 'Solo el fundador puede publicar roles' }, { status: 403 })
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
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { id, estado } = body

  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data: rol, error: rolError } = await supabase
    .from('roles')
    .select('id, proyecto_id, proyectos ( fundador_id )')
    .eq('id', id)
    .single()

  if (rolError || !rol) {
    return Response.json({ error: 'Rol no encontrado' }, { status: 404 })
  }

  if (rol.proyectos?.fundador_id !== user.id) {
    return Response.json({ error: 'Solo el fundador puede actualizar el rol' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('roles')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ rol: data })
}
