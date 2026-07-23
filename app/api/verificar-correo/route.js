import { notificar } from '../../../lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const BASE_URL = 'https://escala.network'

// GET — se llama desde el link del correo. Marca el perfil como verificado y manda al dashboard.
// No requiere sesión: el "token" es el id del perfil, y esta acción no otorga ningún acceso
// nuevo (el usuario ya tiene sesión propia desde que se registró), solo marca un flag informativo.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    await supabase.from('perfiles').update({ correo_verificado: true }).eq('id', id)
  }

  return Response.redirect(BASE_URL + '/dashboard', 302)
}

// POST — dispara (o reenvía) el correo de verificación. Lo llaman registro/page.js al crear
// la cuenta, y el botón "Reenviar" del banner en el dashboard.
export async function POST(request) {
  const body = await request.json()
  const { id, email, nombre } = body

  if (!id || !email) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  try {
    await notificar('verificar_correo', { id, email }, {
      nombre: nombre || 'Usuario',
      verificar_url: BASE_URL + '/api/verificar-correo?id=' + id,
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
