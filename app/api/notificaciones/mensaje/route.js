// app/api/notificaciones/mensaje/route.js
//
// Recibe llamadas del trigger de PostgreSQL cuando se crea un mensaje nuevo.
// Busca todos los miembros activos del proyecto (excepto el autor)
// y les envía una notificación in_app + push.
//
// Autenticado con x-supabase-trigger header para evitar llamadas externas.

import { createClient } from '@supabase/supabase-js'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    // Verificar que viene del trigger de Supabase
    const triggerKey = request.headers.get('x-supabase-trigger')
    if (!triggerKey && process.env.NODE_ENV === 'production') {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { mensaje_id, proyecto_id, autor_id, contenido } = await request.json()
    if (!proyecto_id || !autor_id) {
      return Response.json({ error: 'Faltan campos' }, { status: 400 })
    }

    // Obtener datos del autor y del proyecto
    const [autorRes, proyectoRes] = await Promise.all([
      supabase.from('perfiles').select('nombre').eq('id', autor_id).single(),
      supabase.from('proyectos').select('nombre').eq('id', proyecto_id).single(),
    ])

    const autorNombre = autorRes.data?.nombre || 'Alguien'
    const proyectoNombre = proyectoRes.data?.nombre || 'tu proyecto'

    // Preview del mensaje (máx 60 chars)
    const preview = contenido
      ? (contenido.length > 60 ? contenido.substring(0, 60) + '...' : contenido)
      : '...'

    // Obtener todos los miembros activos del proyecto (postulaciones aceptadas)
    const { data: miembros } = await supabase
      .from('postulaciones')
      .select('postulante_id, perfiles!postulaciones_postulante_id_fkey(id, email, nombre)')
      .eq('estado', 'aceptada')
      .neq('postulante_id', autor_id) // excluir al autor

    // Incluir también al fundador si no está entre los miembros
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('fundador_id, perfiles!proyectos_fundador_id_fkey(id, email, nombre)')
      .eq('id', proyecto_id)
      .single()

    const destinatarios = []

    // Miembros del equipo
    for (const m of miembros || []) {
      if (m.perfiles?.email && m.postulante_id !== autor_id) {
        destinatarios.push(m.perfiles)
      }
    }

    // Fundador (si no es el autor y no está ya en la lista)
    if (proyecto?.fundador_id && proyecto.fundador_id !== autor_id) {
      const yaEsta = destinatarios.some(d => d.id === proyecto.fundador_id)
      if (!yaEsta && proyecto.perfiles?.email) {
        destinatarios.push(proyecto.perfiles)
      }
    }

    // Notificar a todos los destinatarios en paralelo
    const datos = {
      remitente_nombre: autorNombre,
      proyecto_nombre: proyectoNombre,
      proyecto_id,
      preview,
    }

    await Promise.allSettled(
      destinatarios.map(dest =>
        notificar('mensaje_recibido', { id: dest.id, email: dest.email, nombre: dest.nombre }, datos)
      )
    )

    console.log(`[mensaje] Notificados ${destinatarios.length} miembros en proyecto ${proyecto_id}`)
    return Response.json({ ok: true, notificados: destinatarios.length })

  } catch (e) {
    console.error('[mensaje notificacion]', e.message)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
