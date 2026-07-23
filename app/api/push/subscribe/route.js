import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// POST — guarda (o actualiza) la suscripción push del navegador actual
export async function POST(request) {
  const body = await request.json()
  const { usuario_id, subscription } = body

  if (!usuario_id || !subscription?.endpoint || !subscription?.keys) {
    return Response.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    usuario_id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: request.headers.get('user-agent') || null,
  }, { onConflict: 'endpoint' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

// DELETE — elimina una suscripción (el usuario desactivó push en este navegador)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  if (!endpoint) return Response.json({ error: 'Falta endpoint' }, { status: 400 })

  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
