// app/api/cron/notificaciones-tiempo/route.js
//
// Cron job diario (9am UTC) que dispara notificaciones basadas en tiempo.
// Configurado en vercel.json → schedule: "0 9 * * *"
//
// Verifica y notifica:
//   1. Tareas vencidas (fecha_limite < hoy, estado pendiente/en_progreso)
//   2. Hitos próximos a vencer (fecha_limite en los próximos 2 días)
//   3. Proyectos sin actividad (sin actualizaciones en 15+ días)
//
// Requiere variable de entorno CRON_SECRET en Vercel.

import { notificar } from '@/lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function GET(request) {
  // Vercel envía CRON_SECRET automáticamente en el header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()
  const hoy = ahora.toISOString().split('T')[0]
  const en2dias = new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const hace15dias = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()

  const resultados = { tareas_vencidas: 0, hitos_proximos: 0, proyectos_inactivos: 0, errores: [] }

  // ── 1. Tareas vencidas ───────────────────────────────────────────────────
  try {
    const { data: tareasVencidas } = await supabase
      .from('tareas')
      .select(`
        id, nombre, fecha_limite, proyecto_id,
        proyectos ( nombre ),
        perfiles!tareas_asignado_id_fkey ( id, email, nombre )
      `)
      .not('asignado_id', 'is', null)
      .in('estado', ['pendiente', 'en_progreso'])
      .lt('fecha_limite', hoy)
      .not('fecha_limite', 'is', null)

    for (const tarea of tareasVencidas || []) {
      const perfil = tarea.perfiles
      if (!perfil?.email) continue
      try {
        await notificar('tarea_vencida', {
          id: perfil.id,
          email: perfil.email,
          nombre: perfil.nombre,
        }, {
          tarea_nombre: tarea.nombre,
          proyecto_nombre: tarea.proyectos?.nombre || 'tu proyecto',
          proyecto_id: tarea.proyecto_id,
          fecha_limite: tarea.fecha_limite,
        })
        resultados.tareas_vencidas++
      } catch (e) {
        resultados.errores.push(`tarea ${tarea.id}: ${e.message}`)
      }
    }
  } catch (e) {
    resultados.errores.push(`tareas_vencidas query: ${e.message}`)
  }

  // ── 2. Hitos próximos a vencer ───────────────────────────────────────────
  try {
    const { data: hitosProximos } = await supabase
      .from('hitos')
      .select(`
        id, nombre, fecha_limite, proyecto_id,
        proyectos ( nombre, fundador_id,
          perfiles!proyectos_fundador_id_fkey ( id, email, nombre )
        )
      `)
      .eq('completado', false)
      .gte('fecha_limite', hoy)
      .lte('fecha_limite', en2dias)
      .not('fecha_limite', 'is', null)

    for (const hito of hitosProximos || []) {
      const fundador = hito.proyectos?.perfiles
      if (!fundador?.email) continue
      try {
        await notificar('hito_por_vencer', {
          id: fundador.id,
          email: fundador.email,
          nombre: fundador.nombre,
        }, {
          hito_nombre: hito.nombre,
          proyecto_nombre: hito.proyectos?.nombre || 'tu proyecto',
          proyecto_id: hito.proyecto_id,
          fecha_limite: hito.fecha_limite,
          dias_restantes: hito.fecha_limite === hoy ? 0 : 2,
        })
        resultados.hitos_proximos++
      } catch (e) {
        resultados.errores.push(`hito ${hito.id}: ${e.message}`)
      }
    }
  } catch (e) {
    resultados.errores.push(`hitos_proximos query: ${e.message}`)
  }

  // ── 3. Proyectos sin actividad en 15+ días ───────────────────────────────
  try {
    const { data: proyectosInactivos } = await supabase
      .from('proyectos')
      .select(`
        id, nombre,
        perfiles!proyectos_fundador_id_fkey ( id, email, nombre )
      `)
      .eq('estado', 'activo')
      .lt('updated_at', hace15dias)

    for (const proyecto of proyectosInactivos || []) {
      const fundador = proyecto.perfiles
      if (!fundador?.email) continue
      try {
        await notificar('proyecto_sin_actividad', {
          id: fundador.id,
          email: fundador.email,
          nombre: fundador.nombre,
        }, {
          proyecto_nombre: proyecto.nombre,
          proyecto_id: proyecto.id,
          dias_inactivo: 15,
        })
        resultados.proyectos_inactivos++
      } catch (e) {
        resultados.errores.push(`proyecto ${proyecto.id}: ${e.message}`)
      }
    }
  } catch (e) {
    resultados.errores.push(`proyectos_inactivos query: ${e.message}`)
  }

  console.log('[Cron notificaciones-tiempo]', JSON.stringify(resultados))
  return Response.json({ ok: true, fecha: hoy, ...resultados })
}
