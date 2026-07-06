import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(request, context) {
  const params = await context.params
  const id = params.id
  const { searchParams } = new URL(request.url)

  // Modo rápido: solo verificar si tiene postulaciones aceptadas
  if (searchParams.get('check_equipo')) {
    const { data: roles } = await supabase.from('roles').select('id').eq('proyecto_id', id)
    if (!roles || roles.length === 0) return Response.json({ tiene_equipo: false })
    const rolIds = roles.map(r => r.id)
    const { data: aceptadas } = await supabase
      .from('postulaciones').select('id').in('rol_id', rolIds).eq('estado', 'aceptada').limit(1)
    return Response.json({ tiene_equipo: !!(aceptadas && aceptadas.length > 0) })
  }

  const { data, error } = await supabase
    .from('proyectos')
    .select(`*, perfiles ( nombre, ciudad ), roles ( * )`)
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyecto: data })
}

// DELETE — eliminar proyecto solo si el usuario es el fundador y no hay postulaciones aceptadas
export async function DELETE(request, context) {
  const params = await context.params
  const id = params.id

  if (!id) return Response.json({ error: 'Falta el id del proyecto' }, { status: 400 })

  // Verificar que quien elimina es el fundador
  const { searchParams } = new URL(request.url)
  const fundador_id = searchParams.get('fundador_id')
  if (!fundador_id) return Response.json({ error: 'Se requiere fundador_id' }, { status: 400 })

  // Verificar que el proyecto existe y pertenece al fundador
  const { data: proyecto, error: errorProyecto } = await supabase
    .from('proyectos')
    .select('id, fundador_id')
    .eq('id', id)
    .single()

  if (errorProyecto || !proyecto) return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  if (proyecto.fundador_id !== fundador_id) return Response.json({ error: 'Solo el fundador puede eliminar este proyecto' }, { status: 403 })

  // Verificar que no haya postulaciones aceptadas en ningún rol
  const { data: rolesConAceptados } = await supabase
    .from('roles')
    .select('id, postulaciones!inner(id, estado)')
    .eq('proyecto_id', id)
    .eq('postulaciones.estado', 'aceptada')
    .limit(1)

  if (rolesConAceptados && rolesConAceptados.length > 0) {
    return Response.json({
      error: 'No puedes eliminar este proyecto — ya hay personas aceptadas en algún rol. Si quieres cancelarlo, contáctanos.',
      codigo: 'tiene_aceptados'
    }, { status: 409 })
  }

  try {
    // Borrar historial de tareas del proyecto
    await supabase.from('historial_tareas').delete().eq('proyecto_id', id)

    // Borrar tareas del proyecto
    await supabase.from('tareas').delete().eq('proyecto_id', id)

    // Borrar mensajes del proyecto
    await supabase.from('mensajes').delete().eq('proyecto_id', id)

    // Borrar aportes del proyecto
    await supabase.from('aportes').delete().eq('proyecto_id', id)

    // Borrar hitos del proyecto
    await supabase.from('hitos').delete().eq('proyecto_id', id)

    // Obtener roles del proyecto para borrar sus postulaciones primero
    const { data: rolesDelProyecto } = await supabase.from('roles').select('id').eq('proyecto_id', id)
    if (rolesDelProyecto && rolesDelProyecto.length > 0) {
      const rolIds = rolesDelProyecto.map(r => r.id)
      await supabase.from('postulaciones').delete().in('rol_id', rolIds)
    }

    // Borrar roles del proyecto
    await supabase.from('roles').delete().eq('proyecto_id', id)

    // Borrar impulsos asociados (Ángel de Impulso)
    await supabase.from('impulsos').delete().eq('proyecto_id', id)

    // Finalmente borrar el proyecto
    const { error: errorProyecto } = await supabase.from('proyectos').delete().eq('id', id)

    if (errorProyecto) return Response.json({ error: errorProyecto.message }, { status: 500 })

    return Response.json({ ok: true, eliminado: id })
  } catch (e) {
    return Response.json({ error: 'Error eliminando proyecto: ' + e.message }, { status: 500 })
  }
}
