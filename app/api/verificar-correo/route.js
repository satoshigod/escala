import { notificar, avisarAdmin } from '../../../lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const BASE_URL = 'https://escala.network'

// Lo que la persona eligió en la home (?intent=) — mismo catálogo que onboarding/page.js
const INTENT_LABEL = {
  capital: 'capital para crecer',
  talento: 'contratar talento',
  crear: 'empezar su empresa',
  resolver: 'resolver un problema',
  proyectos: 'conseguir proyectos',
  invertir: 'invertir',
  maquina: 'una máquina',
  local: 'un local',
}

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
  const { id, email, nombre, registro, intent } = body

  if (!id || !email) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  let errorVerificacion = null
  try {
    await notificar('verificar_correo', { id, email }, {
      nombre: nombre || 'Usuario',
      verificar_url: BASE_URL + '/api/verificar-correo?id=' + id,
    })
  } catch (e) {
    errorVerificacion = e.message
  }

  // Llamada desde registro/page.js al crear la cuenta → avisar al admin del usuario nuevo.
  // Nombre y email salen de la base (no del body) y solo si la cuenta tiene menos de 30
  // min, para que este endpoint público no sirva para disparar avisos falsos.
  if (registro === true) {
    const { data: perfil } = await supabase
      .from('perfiles').select('nombre, email, created_at').eq('id', id).maybeSingle()
    if (perfil && Date.now() - new Date(perfil.created_at).getTime() < 30 * 60 * 1000) {
      await avisarAdmin('admin_usuario_nuevo', {
        nombre: perfil.nombre,
        email: perfil.email,
        usuario_id: id,
        intent_label: INTENT_LABEL[intent] || null,
      }, { actorId: id })
    }
  }

  if (errorVerificacion) return Response.json({ error: errorVerificacion }, { status: 500 })
  return Response.json({ ok: true })
}
