// app/api/invitar/route.js
//
// Envía una invitación a un especialista usando el motor central notificar().
// Reemplaza la llamada directa a /api/email desde /invitar/page.js.
//
// POST /api/invitar
// Body: { email, nombre, proyecto_id, proyecto_nombre, rol_id, rol_nombre, mensaje, fundador_nombre }
//
// Si el invitado ya está registrado en Escala, también recibe in_app.
// Si no está registrado, solo recibe email.

import { notificar } from '@/lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function POST(request) {
  try {
    const { email, nombre, proyecto_id, proyecto_nombre, rol_id, rol_nombre, mensaje, fundador_nombre } = await request.json()

    if (!email || !proyecto_id) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const datos = {
      nombre_invitado: nombre,
      fundador_nombre: fundador_nombre || 'Un fundador',
      proyecto_nombre,
      proyecto_id,
      rol_nombre: rol_nombre || 'un rol',
      mensaje_personal: mensaje,
      proyecto_url: `https://escala.network/proyectos/${proyecto_id}`,
      registro_url: 'https://escala.network/registro',
    }

    // Buscar si el invitado ya tiene cuenta en Escala
    const { data: usuarioExistente } = await supabase
      .from('perfiles')
      .select('id, email, nombre')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (usuarioExistente?.id) {
      // Usuario registrado — notificar por email + in_app
      await notificar('invitacion', {
        id: usuarioExistente.id,
        email: usuarioExistente.email,
        nombre: usuarioExistente.nombre,
      }, datos)
    } else {
      // No registrado — solo email (no hay id para in_app)
      await notificar('invitacion', {
        id: null,
        email,
        nombre,
      }, datos)
    }

    return Response.json({
      ok: true,
      usuario_registrado: !!usuarioExistente?.id,
    })

  } catch (error) {
    console.error('[API invitar]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
