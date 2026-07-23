// lib/auth.js
//
// Autorizacion centralizada.
//
// Antes el UUID del admin estaba escrito a mano en 13 archivos. Eso significaba
// que (a) solo Ivan podia administrar, y (b) sumar a alguien al equipo exigia
// tocar 13 archivos, donde olvidar uno dejaba un hueco de permisos.
//
// Ahora la fuente de verdad es la columna perfiles.es_admin. Sumar un admin es
// un UPDATE, no un deploy.

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// Fallback: el fundador siempre es admin aunque falle la consulta, para no
// quedar bloqueado fuera del sistema por un problema de red o de datos.
const FUNDADOR_ID = 'a57b6849-1388-4186-8880-2ec31dd31af5'

/**
 * ¿Este usuario es admin de Escala?
 * @param {string} userId - auth.uid()
 * @returns {Promise<boolean>}
 */
export async function esAdmin(userId) {
  if (!userId) return false
  if (userId === FUNDADOR_ID) return true
  try {
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .select('es_admin')
      .eq('id', userId)
      .maybeSingle()
    if (error) return false
    return data?.es_admin === true
  } catch {
    return false
  }
}

/**
 * Resuelve el usuario desde el header Authorization y dice si es admin.
 * Evita repetir el mismo bloque de auth en cada ruta.
 *
 * @returns {Promise<{ user: object|null, admin: boolean }>}
 */
export async function usuarioDesdeRequest(req) {
  const header = req.headers.get('authorization')
  if (!header) return { user: null, admin: false }
  try {
    const token = header.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return { user: null, admin: false }
    return { user, admin: await esAdmin(user.id) }
  } catch {
    return { user: null, admin: false }
  }
}

/**
 * Datos de contacto del admin para notificaciones internas.
 * Devuelve el primero disponible; si no hay ninguno, cae al fundador.
 */
export async function adminParaNotificar() {
  try {
    const { data } = await supabaseAdmin
      .from('perfiles')
      .select('id, email, nombre')
      .eq('es_admin', true)
      .limit(1)
      .maybeSingle()
    if (data?.email) return data
  } catch { /* cae al fundador */ }
  return { id: FUNDADOR_ID, email: 'ivan@escala.network', nombre: 'Ivan' }
}
