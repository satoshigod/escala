// app/api/cron/local-comercial-alertas/route.js
//
// Cron diario — ejecutar cada manana a las 8am Colombia (UTC-5 = 13:00 UTC)
// Verifica todos los locales comerciales activos y alerta si llevan dias sin reportar:
//   1 dia sin reportar → alerta al operador
//   3 dias sin reportar → alerta critica al operador + alerta al inversionista
//
// Configurar en vercel.json:
// { "crons": [{ "path": "/api/cron/local-comercial-alertas", "schedule": "0 13 * * *" }] }

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  // Verificar que es una llamada autorizada (cron de Vercel o admin)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'escala-cron-2026'
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date()
    const resultados = []

    // Obtener todos los locales activos en fase repago o regalia
    const { data: locales, error } = await supabase
      .from('proyectos_local_comercial')
      .select(`
        id, proyecto_id, nombre_negocio, fase_actual,
        estado_verificacion,
        proyectos!inner(id, nombre, fundador_id, estado)
      `)
      .eq('estado_verificacion', 'aprobado')
      .in('fase_actual', ['repago', 'regalia'])
      .eq('proyectos.estado', 'activo')

    if (error) throw error

    for (const local of (locales || [])) {
      // Obtener el ultimo reporte
      const { data: ultimoReporte } = await supabase
        .from('reportes_diarios_local')
        .select('fecha')
        .eq('proyecto_id', local.proyecto_id)
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle()

      let diasSinReportar = 999
      if (ultimoReporte) {
        const ultimaFecha = new Date(ultimoReporte.fecha + 'T12:00:00')
        diasSinReportar = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24))
      }

      if (diasSinReportar === 0) {
        resultados.push({ local: local.nombre_negocio, estado: 'al_dia' })
        continue
      }

      // Obtener perfil del operador para notificar
      const { data: perfilOperador } = await supabase
        .from('perfiles')
        .select('id, email, nombre')
        .eq('id', local.proyectos.fundador_id)
        .single()

      const datosNotif = {
        nombre_negocio: local.nombre_negocio,
        dias_sin_reportar: diasSinReportar,
        proyecto_id: local.proyecto_id,
      }

      if (diasSinReportar >= 1 && diasSinReportar < 3) {
        // Alerta suave al operador
        if (perfilOperador) {
          await notificar('local_sin_reporte_alerta', {
            id: perfilOperador.id,
            email: perfilOperador.email,
          }, datosNotif)
        }
        resultados.push({ local: local.nombre_negocio, estado: 'alerta_operador', dias: diasSinReportar })
      }

      if (diasSinReportar >= 3) {
        // Alerta critica al operador
        if (perfilOperador) {
          await notificar('local_sin_reporte_alerta', {
            id: perfilOperador.id,
            email: perfilOperador.email,
          }, datosNotif)
        }

        // Buscar al inversionista (contrato activo con rol Capitalista o Angel)
        const { data: contratos } = await supabase
          .from('contratos')
          .select('especialista_id')
          .eq('proyecto_id', local.proyecto_id)
          .in('rol_nombre', ['Capitalista', 'Angel de Impulso', 'Ángel de Impulso'])
          .eq('estado', 'activo')

        for (const contrato of (contratos || [])) {
          const { data: perfilInv } = await supabase
            .from('perfiles')
            .select('id, email, nombre')
            .eq('id', contrato.especialista_id)
            .single()

          if (perfilInv) {
            await notificar('local_sin_reporte_inversionista', {
              id: perfilInv.id,
              email: perfilInv.email,
            }, datosNotif)
          }
        }

        resultados.push({ local: local.nombre_negocio, estado: 'alerta_critica', dias: diasSinReportar })
      }
    }

    return NextResponse.json({
      ok: true,
      fecha: hoy.toISOString().split('T')[0],
      locales_revisados: (locales || []).length,
      resultados,
    })

  } catch (err) {
    console.error('cron local-comercial-alertas error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
