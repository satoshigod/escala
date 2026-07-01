// lib/notificaciones/notificar.js
//
// Punto de entrada único para disparar cualquier notificación del sistema.
// Uso desde cualquier API route:
//
//   import { notificar } from '@/lib/notificaciones/notificar'
//   await notificar('tarea_asignada', { id: perfil.id, email: perfil.email }, { ...datos })
//
// - destinatarios puede ser un objeto único o un array de { id, email, nombre }
// - Reglas de prioridad (según ESCALA_Arquitectura_Notificaciones.docx):
//     CRÍTICA → se envía siempre, ignora preferencias del usuario
//     ALTA/MEDIA/BAJA → respeta preferencias_notificacion (toggle global email/push)
// - in_app se inserta siempre que haya destinatario.id (es de bajo ruido, se puede ignorar)
// - Cualquier fallo en un canal se loguea pero NUNCA interrumpe la operación que
//   disparó la notificación (igual que el patrón try/catch que ya usaba /api/email)

import { createClient } from '@supabase/supabase-js'
import { EVENTOS, COLOR_POR_PRIORIDAD } from './eventos'
import { enviarEmailRaw } from './plantillasEmail'
import { enviarPush } from './webpush'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

export async function notificar(tipo, destinatarios, datos) {
  const evento = EVENTOS[tipo]
  if (!evento) {
    console.error('[notificar] Tipo de evento no registrado en el catálogo:', tipo)
    return
  }

  const lista = (Array.isArray(destinatarios) ? destinatarios : [destinatarios]).filter(Boolean)
  const color = COLOR_POR_PRIORIDAD[evento.prioridad] || COLOR_POR_PRIORIDAD.media
  const esCritica = evento.prioridad === 'critica'

  await Promise.all(lista.map(async (dest) => {
    // Preferencias del usuario — CRÍTICA las ignora siempre (no se puede desactivar)
    let prefs = { email_activo: true, push_activo: true }
    if (dest.id && !esCritica) {
      const { data } = await supabase
        .from('preferencias_notificacion')
        .select('email_activo, push_activo')
        .eq('usuario_id', dest.id)
        .maybeSingle()
      if (data) prefs = data
    }

    // 1. In-app — requiere que el destinatario tenga cuenta en Escala (perfil id)
    if (dest.id && evento.canales.includes('in_app')) {
      try {
        await supabase.from('notificaciones').insert({
          destinatario_id: dest.id,
          tipo,
          modulo: evento.modulo,
          prioridad: evento.prioridad,
          titulo: evento.titulo,
          mensaje: evento.mensaje(datos),
          link: evento.link ? evento.link(datos) : null,
          icon: evento.icon,
          color,
          datos,
        })
      } catch (e) {
        console.error('[notificar] Error insertando in-app:', e.message)
      }
    }

    // 2. Email
    if (dest.email && evento.canales.includes('email') && (esCritica || prefs.email_activo)) {
      try {
        await enviarEmailRaw(tipo, dest.email, datos)
      } catch (e) {
        console.error('[notificar] Error enviando email:', e.message)
      }
    }

    // 3. Push (Web Push) — solo si el usuario tiene al menos un dispositivo suscrito
    if (dest.id && evento.canales.includes('push') && (esCritica || prefs.push_activo)) {
      try {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('usuario_id', dest.id)
        if (subs && subs.length > 0) {
          const url = BASE_URL + (evento.link ? evento.link(datos) : '/dashboard')
          await Promise.all(subs.map(s => enviarPush(s, {
            title: evento.titulo,
            body: evento.mensaje(datos),
            url,
          })))
        }
      } catch (e) {
        console.error('[notificar] Error enviando push:', e.message)
      }
    }
  }))
}
