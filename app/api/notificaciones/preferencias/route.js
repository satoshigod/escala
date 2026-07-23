import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
// app/api/notificaciones/preferencias/route.js
//
// GET  — devuelve las preferencias del usuario autenticado
// PATCH — actualiza una o más preferencias

// GET /api/notificaciones/preferencias
export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('preferencias_notificacion')
    .select('email_activo, push_activo, categorias_email_desactivadas, categorias_push_desactivadas')
    .eq('usuario_id', user.id)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Si no tiene fila aún, devolver defaults
  return Response.json({
    preferencias: data || {
      email_activo: true,
      push_activo: true,
      categorias_email_desactivadas: [],
      categorias_push_desactivadas: [],
    }
  })
}

// PATCH /api/notificaciones/preferencias
// Body puede tener cualquier combinación de:
//   { email_activo, push_activo, categorias_email_desactivadas, categorias_push_desactivadas }
export async function PATCH(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const campos = {}
  if (typeof body.email_activo === 'boolean') campos.email_activo = body.email_activo
  if (typeof body.push_activo === 'boolean') campos.push_activo = body.push_activo
  if (Array.isArray(body.categorias_email_desactivadas)) campos.categorias_email_desactivadas = body.categorias_email_desactivadas
  if (Array.isArray(body.categorias_push_desactivadas)) campos.categorias_push_desactivadas = body.categorias_push_desactivadas

  if (Object.keys(campos).length === 0) {
    return Response.json({ error: 'Sin cambios válidos' }, { status: 400 })
  }

  const { error } = await supabase
    .from('preferencias_notificacion')
    .upsert({ usuario_id: user.id, ...campos }, { onConflict: 'usuario_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
