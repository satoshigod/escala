// app/api/local-comercial/inversionista/route.js
// GET — dashboard del inversionista para un proyecto local_comercial
// Devuelve: estado del local, historial de reportes, semaforo, progreso

import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    // Verificar que el usuario es inversionista de este proyecto
    // (tiene un contrato activo con rol Capitalista o Angel de Impulso)
    const { data: contrato } = await supabase
      .from('contratos')
      .select('id, especialista_id, rol_nombre')
      .eq('proyecto_id', proyecto_id)
      .eq('especialista_id', user.id)
      .in('rol_nombre', ['Capitalista', 'Angel de Impulso', 'Ángel de Impulso'])
      .eq('estado', 'activo')
      .maybeSingle()

    // También permitir al fundador ver el panel
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('id, nombre, fundador_id, escenario')
      .eq('id', proyecto_id)
      .single()

    const esFundador = proyecto?.fundador_id === user.id
    const esInversionista = !!contrato

    if (!esFundador && !esInversionista) {
      return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 })
    }

    // Datos del local
    const { data: local } = await supabase
      .from('proyectos_local_comercial')
      .select('*')
      .eq('proyecto_id', proyecto_id)
      .single()

    if (!local) return NextResponse.json({ error: 'Proyecto local no encontrado' }, { status: 404 })

    // Historial de reportes ultimos 30 dias
    const { data: reportes } = await supabase
      .from('reportes_diarios_local')
      .select('*')
      .eq('proyecto_id', proyecto_id)
      .order('fecha', { ascending: false })
      .limit(30)

    // Calcular semaforo de reportes
    const hoy = new Date()
    const diasSinReportar = calcularDiasSinReportar(reportes || [], hoy)

    // Calcular totales
    const total_ventas = (reportes || []).reduce((s, r) => s + parseFloat(r.ventas_total || 0), 0)
    const total_pagado_inversionista = (reportes || []).reduce((s, r) => s + parseFloat(r.pago_inversionista || 0), 0)
    const total_intereses = (reportes || []).reduce((s, r) => s + parseFloat(r.intereses_dia || 0), 0)
    const total_abono_capital = (reportes || []).reduce((s, r) => s + parseFloat(r.abono_capital || 0), 0)

    // Proyeccion de recuperacion
    const excedente_promedio = reportes && reportes.length > 0
      ? (reportes || []).reduce((s, r) => s + parseFloat(r.pago_inversionista || 0), 0) / reportes.length
      : 0
    const saldo_pendiente = parseFloat(local.capital_total) - parseFloat(local.capital_pagado || 0)
    const dias_estimados = excedente_promedio > 0 ? Math.ceil(saldo_pendiente / excedente_promedio) : null

    return NextResponse.json({
      ok: true,
      local,
      proyecto: { id: proyecto.id, nombre: proyecto.nombre },
      reportes: reportes || [],
      semaforo: {
        dias_sin_reportar: diasSinReportar,
        estado: diasSinReportar === 0 ? 'verde' : diasSinReportar <= 2 ? 'amarillo' : 'rojo',
        mensaje: diasSinReportar === 0
          ? 'Reportando al dia'
          : diasSinReportar === 1 ? 'Sin reporte de ayer'
          : diasSinReportar === 2 ? 'Sin reporte hace 2 dias'
          : `Sin reporte hace ${diasSinReportar} dias — alerta enviada al operador`,
      },
      resumen: {
        capital_invertido: parseFloat(local.capital_total),
        capital_recuperado: parseFloat(local.capital_pagado || 0),
        intereses_cobrados: parseFloat(local.intereses_pagados || 0),
        saldo_pendiente,
        pct_recuperado: Math.round((parseFloat(local.capital_pagado || 0) / parseFloat(local.capital_total)) * 100),
        total_ventas_periodo: Math.round(total_ventas),
        total_pagado_inversionista: Math.round(total_pagado_inversionista),
        dias_estimados_recuperacion: dias_estimados,
        fase_actual: local.fase_actual,
        dias_reportados: (reportes || []).length,
        dias_sin_reportar: diasSinReportar,
      }
    })
  } catch (err) {
    console.error('inversionista GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function calcularDiasSinReportar(reportes, hoy) {
  if (!reportes || reportes.length === 0) return 999
  const fechas = reportes.map(r => r.fecha).sort().reverse()
  const ultimaFecha = new Date(fechas[0] + 'T12:00:00')
  const diff = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
