import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// POST — especialista desiste de su rol en un proyecto
// El especialista_id viene del body (mismo patrón que resto de APIs)
export async function POST(request) {
  const body = await request.json()
  const { postulacion_id, especialista_id } = body

  if (!postulacion_id || !especialista_id) {
    return Response.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data: post, error: postError } = await supabase
    .from('postulaciones')
    .select('*, roles:rol_id(id, nombre, proyecto_id)')
    .eq('id', postulacion_id)
    .single()

  if (postError || !post) return Response.json({ error: 'Postulación no encontrada' }, { status: 404 })
  if (post.postulante_id !== especialista_id) return Response.json({ error: 'No autorizado' }, { status: 403 })
  if (post.estado !== 'aceptada') return Response.json({ error: 'Solo puedes retirarte de roles donde fuiste aceptado' }, { status: 400 })

  // 1. Marcar la postulación como retirada
  await supabase
    .from('postulaciones')
    .update({ estado: 'retirada' })
    .eq('id', postulacion_id)

  // 2. Cancelar el contrato (queda como registro histórico)
  await supabase
    .from('contratos')
    .update({ estado: 'cancelado' })
    .eq('postulacion_id', postulacion_id)

  // 3. El rol vuelve a estar abierto
  if (post.roles?.id) {
    await supabase
      .from('roles')
      .update({ estado: 'abierto' })
      .eq('id', post.roles.id)
  }

  // Notificar al fundador
  try {
    const { notificar } = await import('@/lib/notificaciones/notificar')
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('nombre, fundador_id, perfiles!proyectos_fundador_id_fkey(email, nombre)')
      .eq('id', post.roles?.proyecto_id || '')
      .single()
    const { data: esp } = await supabase.from('perfiles').select('nombre').eq('id', especialista_id).single()
    if (proyecto?.perfiles?.email) {
      await notificar('miembro_se_retiro', {
        id: proyecto.fundador_id, email: proyecto.perfiles.email, nombre: proyecto.perfiles.nombre,
      }, {
        miembro_nombre: esp?.nombre || 'Un miembro',
        rol_nombre: post.roles?.nombre || 'su rol',
        proyecto_nombre: proyecto.nombre,
        proyecto_id: post.roles?.proyecto_id,
      })
    }
  } catch(e) {}
  return Response.json({ ok: true, mensaje: 'Te retiraste del rol. El contrato quedó registrado como cancelado y el rol vuelve a estar disponible.' })
}
