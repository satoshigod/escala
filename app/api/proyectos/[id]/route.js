import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(request, context) {
  const params = await context.params
  const id = params.id

  const { data, error } = await supabase
    .from('proyectos')
    .select(`*, perfiles ( nombre, ciudad ), roles ( * )`)
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyecto: data })
}

// DELETE — eliminar proyecto y todo lo asociado (roles, postulaciones, tareas, historial, hitos, aportes, mensajes)
export async function DELETE(request, context) {
  const params = await context.params
  const id = params.id

  if (!id) return Response.json({ error: 'Falta el id del proyecto' }, { status: 400 })

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
