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
// El fundador_id viene del body (mismo patrón que /api/proyectos)
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, nombre, sub_especialidad, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario, estado, fundador_id } = body

  if (!proyecto_id || !nombre || !tipo_aporte || !modalidad) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (!fundador_id) {
    return Response.json({ error: 'Falta fundador_id' }, { status: 400 })
  }

  // Verificar que quien solicita es el fundador del proyecto
  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('fundador_id')
    .eq('id', proyecto_id)
    .single()

  if (proyectoError || !proyecto) {
    return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }
  if (proyecto.fundador_id !== fundador_id) {
    return Response.json({ error: 'Solo el fundador puede publicar roles' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('roles')
    .insert([{ proyecto_id, nombre, sub_especialidad: sub_especialidad || null, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario, estado: estado || 'abierto' }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ rol: data }, { status: 201 })
}

// PATCH — actualizar estado de un rol
export async function PATCH(request) {
  const body = await request.json()
  const { id, estado, fundador_id } = body

  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })
  if (!fundador_id) return Response.json({ error: 'Falta fundador_id' }, { status: 400 })

  const { data: rol, error: rolError } = await supabase
    .from('roles')
    .select('id, proyecto_id, proyectos ( fundador_id )')
    .eq('id', id)
    .single()

  if (rolError || !rol) {
    return Response.json({ error: 'Rol no encontrado' }, { status: 404 })
  }
  if (rol.proyectos?.fundador_id !== fundador_id) {
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

// DELETE — eliminar un rol (solo el fundador, solo si no tiene postulaciones aceptadas)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const fundador_id = searchParams.get('fundador_id')

  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })
  if (!fundador_id) return Response.json({ error: 'Falta fundador_id' }, { status: 400 })

  const { data: rol, error: rolError } = await supabase
    .from('roles')
    .select('id, proyecto_id, proyectos ( fundador_id )')
    .eq('id', id)
    .single()

  if (rolError || !rol) {
    return Response.json({ error: 'Rol no encontrado' }, { status: 404 })
  }
  if (rol.proyectos?.fundador_id !== fundador_id) {
    return Response.json({ error: 'Solo el fundador puede eliminar roles' }, { status: 403 })
  }

  // No se puede eliminar si ya hay alguien aceptado
  const { data: aceptadas } = await supabase
    .from('postulaciones')
    .select('id')
    .eq('rol_id', id)
    .eq('estado', 'aceptada')

  if (aceptadas && aceptadas.length > 0) {
    return Response.json({ error: 'No puedes eliminar este rol — ya hay un especialista aceptado. Si el especialista se retira, el rol vuelve a estar disponible automáticamente.' }, { status: 409 })
  }

  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
