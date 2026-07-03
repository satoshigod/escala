import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// POST — especialista desiste de su rol en un proyecto
export async function POST(request) {
  const body = await request.json()
  const { postulacion_id, usuario_id } = body

  if (!postulacion_id || !usuario_id) {
    return Response.json({ error: 'Faltan campos' }, { status: 400 })
  }

  // Verificar que la postulación pertenece a este usuario
  const { data: post } = await supabase
    .from('postulaciones')
    .select('*, roles:rol_id(id, proyecto_id)')
    .eq('id', postulacion_id)
    .single()

  if (!post) return Response.json({ error: 'Postulación no encontrada' }, { status: 404 })
  if (post.postulante_id !== usuario_id) return Response.json({ error: 'No autorizado' }, { status: 403 })
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

  return Response.json({ ok: true, mensaje: 'Te retiraste del rol. El contrato quedó registrado como cancelado y el rol vuelve a estar disponible.' })
}
