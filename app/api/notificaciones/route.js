import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// GET — lista las últimas notificaciones del usuario (más recientes primero)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return Response.json({ error: 'Falta usuario_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('destinatario_id', usuario_id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const noLeidas = (data || []).filter(n => !n.leido).length
  return Response.json({ notificaciones: data || [], no_leidas: noLeidas })
}

// PATCH — marcar una notificación como leída, o todas (marcar_todas: true)
export async function PATCH(request) {
  const body = await request.json()
  const { id, usuario_id, marcar_todas } = body

  if (marcar_todas) {
    if (!usuario_id) return Response.json({ error: 'Falta usuario_id' }, { status: 400 })
    const { error } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('destinatario_id', usuario_id)
      .eq('leido', false)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  }

  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
