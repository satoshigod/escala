// app/api/cron/notificaciones-tiempo/route.js
//
// Cron job diario (9am UTC = 4am Bogotá) que dispara notificaciones basadas en tiempo.
// Configurado en vercel.json → schedule: "0 9 * * *"
//
// Verifica y notifica:
//   1. Tareas vencidas (fecha_limite < hoy, estado pendiente/en_progreso) — 1 vez por semana por tarea
//   2. Hitos próximos a vencer (fecha_limite en los próximos 2 días) — 1 vez por hito
//   3. Proyectos sin actividad (15+ días sin movimiento real) — 1 vez cada 15 días por proyecto
//
// Cada aviso sale UNA vez por ventana. Antes se repetía todos los días: el mismo
// "lleva 15 días sin actualizaciones" se acumuló ~35 veces en la campanita de cada fundador.
//
// Requiere variable de entorno CRON_SECRET en Vercel.

import { notificar } from '@/lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const DIA = 24 * 60 * 60 * 1000

// Ids (datos[campo]) que ya recibieron este aviso desde `desde`, para no repetirlo.
// Si la consulta falla, lanza: es preferible saltarse un aviso que repetirlo.
async function yaNotificados(tipo, campo, desde) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('datos')
    .eq('tipo', tipo)
    .gte('created_at', desde)
  if (error) throw new Error(`dedupe ${tipo}: ${error.message}`)
  return new Set((data || []).map(n => n.datos?.[campo]).filter(Boolean))
}

// Último movimiento real de cada proyecto: la ficha, el workspace (historial de tareas),
// los mensajes y los aportes. proyectos.updated_at solo cambia al editar la ficha, así que
// por sí solo marcaba "sin actividad" a proyectos con el equipo trabajando.
// Mira hasta `desde` hacia atrás (ventana acotada para que la consulta no crezca sin límite).
async function ultimaActividad(proyectos, desde) {
  const ultima = new Map(proyectos.map(p => [p.id, new Date(p.updated_at || p.created_at).getTime()]))
  const ids = proyectos.map(p => p.id)
  for (const tabla of ['historial_tareas', 'mensajes', 'aportes']) {
    const { data, error } = await supabase
      .from(tabla)
      .select('proyecto_id, created_at')
      .in('proyecto_id', ids)
      .gte('created_at', desde)
    if (error) throw new Error(`${tabla}: ${error.message}`)
    for (const fila of data || []) {
      const t = new Date(fila.created_at).getTime()
      if (t > (ultima.get(fila.proyecto_id) || 0)) ultima.set(fila.proyecto_id, t)
    }
  }
  return ultima
}

export async function GET(request) {
  // Vercel envía CRON_SECRET automáticamente en el header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()
  const hoy = ahora.toISOString().split('T')[0]
  const en2dias = new Date(ahora.getTime() + 2 * DIA).toISOString().split('T')[0]
  const hace3dias = new Date(ahora.getTime() - 3 * DIA).toISOString()
  const hace7dias = new Date(ahora.getTime() - 7 * DIA).toISOString()
  const hace15dias = new Date(ahora.getTime() - 15 * DIA).toISOString()
  const hace90dias = new Date(ahora.getTime() - 90 * DIA).toISOString()

  const resultados = { tareas_vencidas: 0, hitos_proximos: 0, proyectos_inactivos: 0, ya_avisados: 0, errores: [] }

  // ── 1. Tareas vencidas ───────────────────────────────────────────────────
  try {
    // La columna es asignado_a (no asignado_id). Con el nombre viejo la consulta daba 400
    // y, como no se revisaba el error, el aviso nunca salió.
    const { data: tareasVencidas, error } = await supabase
      .from('tareas')
      .select(`
        id, nombre, fecha_limite, proyecto_id,
        proyectos ( nombre ),
        perfiles!tareas_asignado_a_fkey ( id, email, nombre )
      `)
      .not('asignado_a', 'is', null)
      .in('estado', ['pendiente', 'en_progreso'])
      .lt('fecha_limite', hoy)
      .not('fecha_limite', 'is', null)
    if (error) throw new Error(error.message)

    const avisadas = await yaNotificados('tarea_vencida', 'tarea_id', hace7dias)

    for (const tarea of tareasVencidas || []) {
      const perfil = tarea.perfiles
      if (!perfil?.email) continue
      if (avisadas.has(tarea.id)) { resultados.ya_avisados++; continue }
      try {
        await notificar('tarea_vencida', {
          id: perfil.id,
          email: perfil.email,
          nombre: perfil.nombre,
        }, {
          tarea_id: tarea.id,
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
    resultados.errores.push(`tareas_vencidas: ${e.message}`)
  }

  // ── 2. Hitos próximos a vencer ───────────────────────────────────────────
  // OJO: hoy la tabla hitos no tiene columna fecha_limite, así que esta consulta falla.
  // Se reporta en `errores` en vez de ignorarse, hasta decidir si las metas llevan fecha.
  try {
    const { data: hitosProximos, error } = await supabase
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
    if (error) throw new Error(error.message)

    const avisados = await yaNotificados('hito_por_vencer', 'hito_id', hace3dias)

    for (const hito of hitosProximos || []) {
      const fundador = hito.proyectos?.perfiles
      if (!fundador?.email) continue
      if (avisados.has(hito.id)) { resultados.ya_avisados++; continue }
      try {
        await notificar('hito_por_vencer', {
          id: fundador.id,
          email: fundador.email,
          nombre: fundador.nombre,
        }, {
          hito_id: hito.id,
          hito_nombre: hito.nombre,
          proyecto_nombre: hito.proyectos?.nombre || 'tu proyecto',
          proyecto_id: hito.proyecto_id,
          fecha_limite: hito.fecha_limite,
          dias_restantes: Math.round((new Date(hito.fecha_limite + 'T00:00:00Z') - new Date(hoy + 'T00:00:00Z')) / DIA),
        })
        resultados.hitos_proximos++
      } catch (e) {
        resultados.errores.push(`hito ${hito.id}: ${e.message}`)
      }
    }
  } catch (e) {
    resultados.errores.push(`hitos_proximos: ${e.message}`)
  }

  // ── 3. Proyectos sin actividad en 15+ días ───────────────────────────────
  try {
    const { data: candidatos, error } = await supabase
      .from('proyectos')
      .select(`
        id, nombre, created_at, updated_at,
        perfiles!proyectos_fundador_id_fkey ( id, email, nombre )
      `)
      .eq('estado', 'activo')
      .lt('updated_at', hace15dias)
    if (error) throw new Error(error.message)

    if (candidatos?.length) {
      const ultima = await ultimaActividad(candidatos, hace90dias)
      const avisados = await yaNotificados('proyecto_sin_actividad', 'proyecto_id', hace15dias)

      for (const proyecto of candidatos) {
        const fundador = proyecto.perfiles
        if (!fundador?.email) continue
        const dias = Math.floor((ahora.getTime() - ultima.get(proyecto.id)) / DIA)
        if (dias < 15) continue // hubo movimiento en el workspace aunque la ficha no cambió
        if (avisados.has(proyecto.id)) { resultados.ya_avisados++; continue }
        try {
          await notificar('proyecto_sin_actividad', {
            id: fundador.id,
            email: fundador.email,
            nombre: fundador.nombre,
          }, {
            proyecto_nombre: proyecto.nombre,
            proyecto_id: proyecto.id,
            dias_inactivo: dias,
          })
          resultados.proyectos_inactivos++
        } catch (e) {
          resultados.errores.push(`proyecto ${proyecto.id}: ${e.message}`)
        }
      }
    }
  } catch (e) {
    resultados.errores.push(`proyectos_inactivos: ${e.message}`)
  }

  console.log('[Cron notificaciones-tiempo]', JSON.stringify(resultados))
  return Response.json({ ok: true, fecha: hoy, ...resultados })
}
