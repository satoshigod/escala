// app/api/local-comercial/reporte-diario/route.js
//
// POST — el operador reporta las ventas del dia
// Calcula el waterfall: intereses del dia + abono al capital
// Registra en ledger_entries (inmutable, doble partida)
// Actualiza proyectos_local_comercial (capital_pagado, intereses_pagados)
//
// El waterfall:
//   1. Ventas del dia (efectivo + BREB declarado)
//   2. - Costo producto (% declarado en wizard)
//   3. - Costos fijos prorrateados del dia (fijos_mes / 30)
//   4. = Excedente operativo
//   5. Si excedente > 0:
//      a. Primero paga intereses del dia (saldo_pendiente x tasa_diaria)
//      b. Luego abona al capital (excedente - intereses)
//   6. Si excedente <= 0: acumula deficit, no hay pago ese dia

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Token invalido' }, { status: 401 })

    const body = await req.json()
    const { proyecto_id, ventas_efectivo, ventas_breb, foto_url, nota } = body

    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    const ventas_total = parseFloat(ventas_efectivo || 0) + parseFloat(ventas_breb || 0)
    if (ventas_total < 0) return NextResponse.json({ error: 'El total de ventas no puede ser negativo' }, { status: 400 })

    // 1. Verificar que el proyecto es del operador y obtener datos financieros
    const { data: proyecto, error: pError } = await supabase
      .from('proyectos')
      .select('id, fundador_id, nombre')
      .eq('id', proyecto_id)
      .eq('fundador_id', user.id)
      .single()

    if (pError || !proyecto) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })

    const { data: local, error: lError } = await supabase
      .from('proyectos_local_comercial')
      .select('*')
      .eq('proyecto_id', proyecto_id)
      .single()

    if (lError || !local) return NextResponse.json({ error: 'Datos del local no encontrados' }, { status: 404 })

    // 2. Verificar que no hay reporte del dia de hoy ya
    const hoy = new Date().toISOString().split('T')[0]
    const { data: reporteExistente } = await supabase
      .from('reportes_diarios_local')
      .select('id')
      .eq('proyecto_id', proyecto_id)
      .eq('fecha', hoy)
      .single()

    if (reporteExistente) return NextResponse.json({ error: 'Ya reportaste las ventas de hoy' }, { status: 409 })

    // 3. Motor Waterfall
    const margen_pct = parseFloat(local.margen_pct) / 100
    const costo_producto_dia = ventas_total * (1 - margen_pct)
    const fijo_dia = parseFloat(local.fijo_dia)
    const excedente = ventas_total - costo_producto_dia - fijo_dia

    // Capital pendiente = capital original - lo ya pagado
    const capital_original = parseFloat(local.capital_total)
    const capital_ya_pagado = parseFloat(local.capital_pagado || 0)
    const intereses_ya_pagados = parseFloat(local.intereses_pagados || 0)
    const saldo_pendiente = capital_original - capital_ya_pagado

    let intereses_dia = 0
    let abono_capital = 0
    let pago_inversionista = 0
    let deficit_dia = 0

    if (saldo_pendiente > 0 && excedente > 0 && local.fase_actual === 'repago') {
      // Tasa diaria = tasa mensual / 30 (tasa_mensual en % ej: 3.0)
      const tasa_mensual = parseFloat(local.tasa_mensual || 3.0)
      const tasa_diaria = tasa_mensual / 100 / 30
      intereses_dia = Math.round(saldo_pendiente * tasa_diaria)

      if (excedente >= intereses_dia) {
        abono_capital = Math.min(excedente - intereses_dia, saldo_pendiente)
        pago_inversionista = intereses_dia + abono_capital
      } else {
        // El excedente no alcanza ni para los intereses — paga lo que puede
        intereses_dia = excedente
        abono_capital = 0
        pago_inversionista = excedente
      }
    } else if (local.fase_actual === 'regalia' && excedente > 0) {
      // Fase 2: % sobre ventas brutas
      const pct_regalia = parseFloat(local.pct_regalia || 3.0) / 100
      pago_inversionista = Math.round(ventas_total * pct_regalia)
    } else if (excedente <= 0) {
      deficit_dia = Math.abs(excedente)
    }

    // 4. Guardar reporte diario
    const idempotency_key = `reporte-${proyecto_id}-${hoy}`
    const { data: reporte, error: rError } = await supabase
      .from('reportes_diarios_local')
      .insert({
        proyecto_id,
        fecha: hoy,
        ventas_efectivo: parseFloat(ventas_efectivo || 0),
        ventas_breb: parseFloat(ventas_breb || 0),
        ventas_total,
        costo_producto_dia: Math.round(costo_producto_dia),
        fijo_dia: Math.round(fijo_dia),
        excedente: Math.round(excedente),
        intereses_dia,
        abono_capital,
        pago_inversionista,
        deficit_dia,
        foto_url: foto_url || null,
        nota: nota || null,
        idempotency_key,
      })
      .select()
      .single()

    if (rError) {
      if (rError.code === '23505') return NextResponse.json({ error: 'Ya reportaste las ventas de hoy' }, { status: 409 })
      throw rError
    }

    // 5. Actualizar capital_pagado e intereses_pagados en el local
    const nuevo_capital_pagado = capital_ya_pagado + abono_capital
    const nuevo_intereses_pagados = intereses_ya_pagados + intereses_dia
    const nuevo_saldo = capital_original - nuevo_capital_pagado

    // Determinar si cambia de fase
    let nueva_fase = local.fase_actual
    if (local.fase_actual === 'repago' && nuevo_saldo <= 0) {
      nueva_fase = 'regalia'
    }

    await supabase
      .from('proyectos_local_comercial')
      .update({
        capital_pagado: nuevo_capital_pagado,
        intereses_pagados: nuevo_intereses_pagados,
        fase_actual: nueva_fase,
        updated_at: new Date().toISOString(),
      })
      .eq('id', local.id)

    // 6. Registrar en ledger si hubo pago
    if (pago_inversionista > 0) {
      await supabase
        .from('ledger_entries')
        .insert([
          {
            tipo: 'debito',
            tipo_referencia: 'pago_local_comercial',
            referencia_id: reporte.id,
            cuenta_origen: `operador:${user.id}`,
            cuenta_destino: `local:${proyecto_id}`,
            monto: pago_inversionista,
            monto_usd: pago_inversionista / 4200,
            moneda: 'COP',
            descripcion: `Pago dia ${hoy} - intereses $${intereses_dia} + capital $${abono_capital}`,
            idempotency_key: `ledger-${idempotency_key}`,
          }
        ])
    }

    return NextResponse.json({
      ok: true,
      reporte_id: reporte.id,
      resumen: {
        ventas_total,
        costo_producto_dia: Math.round(costo_producto_dia),
        fijo_dia: Math.round(fijo_dia),
        excedente: Math.round(excedente),
        intereses_dia,
        abono_capital,
        pago_inversionista,
        deficit_dia,
        saldo_pendiente: nuevo_saldo,
        fase_actual: nueva_fase,
        pct_pagado: Math.round((nuevo_capital_pagado / capital_original) * 100),
      }
    })

  } catch (err) {
    console.error('reporte-diario error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

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

    const { data: reportes } = await supabase
      .from('reportes_diarios_local')
      .select('*')
      .eq('proyecto_id', proyecto_id)
      .order('fecha', { ascending: false })
      .limit(30)

    const { data: local } = await supabase
      .from('proyectos_local_comercial')
      .select('*')
      .eq('proyecto_id', proyecto_id)
      .single()

    return NextResponse.json({ reportes: reportes || [], local })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
