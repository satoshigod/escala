// app/api/local-comercial/salida-anticipada/route.js
// GET — calcula el monto de salida anticipada en tiempo real
// POST — ejecuta la salida anticipada (requiere confirmacion)

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')

    const { data: proyecto } = await supabase.from('proyectos').select('fundador_id').eq('id', proyecto_id).single()
    if (proyecto?.fundador_id !== user.id) return NextResponse.json({ error: 'Solo el operador puede calcular la salida' }, { status: 403 })

    const { data: local } = await supabase.from('proyectos_local_comercial').select('*').eq('proyecto_id', proyecto_id).single()
    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 })

    const canon_anio = parseFloat(local.canon_mensual) * 12
    const saldo_pendiente = parseFloat(local.capital_total) - parseFloat(local.capital_pagado || 0)

    // Calcular segun la fase actual
    let monto_penalidad = 0
    let descripcion_penalidad = ''

    if (local.fase_actual === 'repago') {
      monto_penalidad = canon_anio * 0.04
      descripcion_penalidad = `4% de arriendos anuales ($${Math.round(canon_anio * 0.04).toLocaleString('es-CO')})`
    } else if (local.fase_actual === 'regalia') {
      monto_penalidad = canon_anio * 0.08
      descripcion_penalidad = `8% de arriendos anuales ($${Math.round(canon_anio * 0.08).toLocaleString('es-CO')})`
    }

    const monto_total_salida = saldo_pendiente + monto_penalidad

    return NextResponse.json({
      ok: true,
      fase_actual: local.fase_actual,
      saldo_pendiente: Math.round(saldo_pendiente),
      monto_penalidad: Math.round(monto_penalidad),
      descripcion_penalidad,
      monto_total_salida: Math.round(monto_total_salida),
      canon_anio: Math.round(canon_anio),
      desglose: {
        capital_pendiente: Math.round(saldo_pendiente),
        tasa_pactada: `Incluida en el saldo pendiente (${local.tasa_mensual || 3}% mensual sobre saldo)`,
        penalidad: descripcion_penalidad,
        total: Math.round(monto_total_salida),
      }
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { proyecto_id, confirmado } = await req.json()
    if (!confirmado) return NextResponse.json({ error: 'Debes confirmar la salida anticipada' }, { status: 400 })

    const { data: proyecto } = await supabase.from('proyectos').select('fundador_id, nombre').eq('id', proyecto_id).single()
    if (proyecto?.fundador_id !== user.id) return NextResponse.json({ error: 'Solo el operador puede ejecutar la salida' }, { status: 403 })

    const { data: local } = await supabase.from('proyectos_local_comercial').select('*').eq('proyecto_id', proyecto_id).single()
    const canon_anio = parseFloat(local.canon_mensual) * 12
    const saldo_pendiente = parseFloat(local.capital_total) - parseFloat(local.capital_pagado || 0)
    const penalidad = local.fase_actual === 'repago' ? canon_anio * 0.04 : canon_anio * 0.08
    const monto_total = Math.round(saldo_pendiente + penalidad)

    // Marcar el local como en proceso de salida anticipada
    await supabase
      .from('proyectos_local_comercial')
      .update({
        fase_actual: 'libre',
        updated_at: new Date().toISOString(),
      })
      .eq('id', local.id)

    // Registrar en ledger
    const idempotency_salida = `salida-${proyecto_id}-${new Date().toISOString().split('T')[0]}`
    const comision_escala = Math.round(monto_total * 0.03)

    await supabase.from('ledger_entries').insert([
      {
        tipo: 'debito',
        referencia_tipo: 'salida_anticipada_local',
        referencia_id: local.id,
        cuenta_origen: `operador:${user.id}`,
        cuenta_destino: `local:${proyecto_id}`,
        monto: monto_total,
        monto_usd: monto_total / 4200,

        tasa_usd: 1 / 4200,
        moneda: 'COP',
        descripcion: `Salida anticipada ${local.fase_actual} - capital $${Math.round(saldo_pendiente).toLocaleString('es-CO')} + penalidad $${Math.round(penalidad).toLocaleString('es-CO')}`,
        idempotency_key: idempotency_salida,
      },
      {
        tipo: 'comision',
        referencia_tipo: 'comision_escala',
        referencia_id: local.id,
        cuenta_origen: `operador:${user.id}`,
        cuenta_destino: 'escala:comisiones',
        monto: comision_escala,
        monto_usd: comision_escala / 4200,

        tasa_usd: 1 / 4200,
        moneda: 'COP',
        descripcion: `Comision Escala 3% salida anticipada ${local.fase_actual}`,
        idempotency_key: `comision-${idempotency_salida}`,
        comision_escala: comision_escala,
      }
    ])

    return NextResponse.json({
      ok: true,
      monto_total,
      mensaje: 'Salida anticipada registrada. El proyecto pasa a Fase 3 (Libre). Paga el monto acordado via BREB al inversionista.',
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
