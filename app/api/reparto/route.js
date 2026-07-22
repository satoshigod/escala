// app/api/reparto/route.js
// GET  — obtiene el reparto calculado para un proyecto o un ingreso
// POST — calcula y registra el reparto de un ingreso
// PUT  — marca una linea como pagada

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'
import { crearOrdenPago } from '@/lib/financiero/custodia'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    const { data: repartos, error } = await supabase
      .from('repartos')
      .select(`
        *,
        reparto_lineas(
          *, perfiles!beneficiario_id(id, nombre, email)
        ),
        ingresos(id, descripcion, valor, fecha)
      `)
      .eq('proyecto_id', proyecto_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ ok: true, repartos: repartos || [] })
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

    const body = await req.json()
    const { proyecto_id, monto_total, descripcion, ingreso_id } = body

    if (!proyecto_id || !monto_total) {
      return NextResponse.json({ error: 'proyecto_id y monto_total son obligatorios' }, { status: 400 })
    }

    // Verificar que el usuario es el fundador
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('id, nombre, fundador_id')
      .eq('id', proyecto_id).single()

    if (proyecto?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Solo el fundador puede calcular el reparto' }, { status: 403 })
    }

    const monto = parseFloat(monto_total)
    const lineas = []
    let monto_comprometido = 0

    // 1. Fondeos por revenue_share (prioridad 1 — se pagan sobre ingresos brutos)
    const { data: fondeos_revenue } = await supabase
      .from('presupuesto_fondeos')
      .select('*, perfiles!inversionista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'verificado')
      .eq('a_cambio_de', 'revenue_share')

    for (const f of (fondeos_revenue || [])) {
      const pct = parseFloat(f.pct_revenue || 0)
      const monto_linea = Math.round(monto * pct / 100)
      monto_comprometido += monto_linea
      lineas.push({
        beneficiario_id: f.inversionista_id,
        tipo: 'revenue_share',
        concepto: `${pct}% revenue share - inversion en ${f.presupuesto_items?.nombre || 'item'}`,
        pct,
        monto: monto_linea,
      })
    }

    // 2. Fondeos por deuda (prioridad 2 — se paga la cuota mensual)
    const { data: fondeos_deuda } = await supabase
      .from('presupuesto_fondeos')
      .select('*, perfiles!inversionista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'verificado')
      .eq('a_cambio_de', 'deuda')

    for (const f of (fondeos_deuda || [])) {
      const tasa = parseFloat(f.tasa_mensual || 0)
      const cuota_mensual = Math.round(parseFloat(f.monto) * tasa / 100)
      const monto_linea = Math.min(cuota_mensual, monto - monto_comprometido)
      if (monto_linea > 0) {
        monto_comprometido += monto_linea
        lineas.push({
          beneficiario_id: f.inversionista_id,
          tipo: 'deuda',
          concepto: `Cuota deuda ${tasa}% mensual sobre $${Math.round(parseFloat(f.monto)).toLocaleString('es-CO')}`,
          pct: tasa,
          monto: monto_linea,
        })
      }
    }

    // 3. Contratos de especialistas con participacion diferida
    const { data: contratos } = await supabase
      .from('contratos')
      .select('*, perfiles!especialista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'activo')
      .not('especialista_id', 'is', null)

    for (const c of (contratos || [])) {
      // Buscar si el contrato tiene deuda pendiente (valor_total - pagado)
      const { data: costos_contrato } = await supabase
        .from('costos')
        .select('valor, pagado')
        .eq('contrato_id', c.id)
        .limit(1)

      const deuda_contrato = costos_contrato?.[0]
        ? parseFloat(costos_contrato[0].valor || 0) - parseFloat(costos_contrato[0].pagado || 0)
        : 0

      if (deuda_contrato > 0) {
        // Pagar parte proporcional de la deuda
        const abono = Math.min(
          Math.round(deuda_contrato * 0.3), // máximo 30% de la deuda por pago
          monto - monto_comprometido
        )
        if (abono > 0) {
          monto_comprometido += abono
          lineas.push({
            beneficiario_id: c.especialista_id,
            tipo: 'participacion',
            concepto: `Abono compensacion diferida - ${c.rol_nombre || 'especialista'}`,
            pct: null,
            monto: abono,
          })
        }
      }
    }

    // 4. Fondeos por participacion (estos son equity — se registran pero no se pagan en efectivo por ahora)
    const { data: fondeos_equity } = await supabase
      .from('presupuesto_fondeos')
      .select('*, perfiles!inversionista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'verificado')
      .eq('a_cambio_de', 'participacion')

    for (const f of (fondeos_equity || [])) {
      lineas.push({
        beneficiario_id: f.inversionista_id,
        tipo: 'participacion',
        concepto: `${f.pct_participacion}% equity registrado - no es pago en efectivo`,
        pct: parseFloat(f.pct_participacion),
        monto: 0, // equity no genera pago en efectivo inmediato
      })
    }

    // 5. El resto es para el fundador
    const para_fundador = Math.max(0, monto - monto_comprometido)
    if (para_fundador > 0) {
      lineas.push({
        beneficiario_id: user.id,
        tipo: 'fundador',
        concepto: 'Remanente para el fundador',
        pct: null,
        monto: para_fundador,
      })
    }

    // Crear el reparto
    const { data: reparto, error: rError } = await supabase
      .from('repartos')
      .insert({
        proyecto_id,
        ingreso_id: ingreso_id || null,
        monto_total: monto,
        descripcion: descripcion || `Reparto de $${Math.round(monto).toLocaleString('es-CO')} COP`,
        estado: 'calculado',
        creado_por: user.id,
      })
      .select().single()

    if (rError) throw rError

    // Crear las lineas
    if (lineas.length > 0) {
      await supabase.from('reparto_lineas').insert(
        lineas.map(l => ({ ...l, reparto_id: reparto.id }))
      )
    }

    // Notificar a cada beneficiario
    for (const linea of lineas.filter(l => l.monto > 0 && l.beneficiario_id !== user.id)) {
      const { data: perfil } = await supabase.from('perfiles').select('id, nombre, email').eq('id', linea.beneficiario_id).single()
      if (perfil) {
        await notificar('reparto_registrado', {
          id: perfil.id, email: perfil.email,
        }, {
          proyecto_nombre: proyecto.nombre,
          monto_formateado: Math.round(linea.monto).toLocaleString('es-CO'),
          concepto: linea.concepto,
          proyecto_id,
        }).catch(() => {})
      }
    }

    return NextResponse.json({
      ok: true,
      reparto: { ...reparto, lineas },
      resumen: {
        total: monto,
        comprometido: monto_comprometido,
        para_fundador,
        num_beneficiarios: new Set(lineas.filter(l => l.monto > 0).map(l => l.beneficiario_id)).size,
      }
    })
  } catch (err) {
    console.error('reparto error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { linea_id } = await req.json()
    if (!linea_id) return NextResponse.json({ error: 'linea_id requerido' }, { status: 400 })

    const { data, error } = await supabase
      .from('reparto_lineas')
      .update({ estado: 'en_pago', pagado_at: new Date().toISOString() })
      .eq('id', linea_id)
      .select(`*, repartos(proyecto_id, descripcion, proyectos!proyecto_id(nombre))`)
      .single()

    if (error) throw error

    // CUSTODIA: el reparto no se paga directo proyecto -> beneficiario.
    // Nace una orden (proyecto paga a Escala, Escala transfiere al beneficiario)
    // y la linea solo queda 'pagado' cuando el beneficiario confirma que recibio.
    if (data.monto > 0) {
      try {
        await crearOrdenPago({
          tipo_flujo: 'reparto',
          proyecto_id: data.repartos?.proyecto_id || null,
          pagador_id: user.id,
          receptor_id: data.beneficiario_id,
          monto: parseFloat(data.monto),
          moneda: 'COP',
          concepto: `Reparto: ${data.concepto || 'participacion'} — ${data.repartos?.proyectos?.nombre || ''}`.trim(),
          referencia_tipo: 'reparto_linea',
          referencia_id: linea_id,
          idempotency_key: `custodia-reparto-${linea_id}`,
        })
      } catch (e) { console.error('custodia reparto:', e.message) }
    }

    // Comision Escala 3% sobre el reparto (cobro de plataforma, independiente
    // del tramo de custodia)
    if (data.monto > 0) {
      const comision = Math.round(parseFloat(data.monto) * 0.03)
      await supabase.from('ledger_entries').insert({
        tipo: 'comision',
        referencia_tipo: 'comision_escala',
        referencia_id: linea_id,
        cuenta_origen: `proyecto:${data.repartos?.proyecto_id}`,
        cuenta_destino: 'escala:comisiones',
        monto: comision,
        monto_usd: comision / 4200,

        tasa_usd: 1 / 4200,
        moneda: 'COP',
        descripcion: `Comision Escala 3% sobre reparto`,
        idempotency_key: `comision-reparto-${linea_id}`,
        comision_escala: comision,
      }).catch(() => {})
    }

    // Notificar al beneficiario que recibio el pago
    const { data: perfil } = await supabase.from('perfiles').select('id, nombre, email').eq('id', data.beneficiario_id).single()
    if (perfil && data.beneficiario_id !== user.id && data.monto > 0) {
      await notificar('reparto_linea_pagada', { id: perfil.id, email: perfil.email }, {
        monto_formateado: Math.round(parseFloat(data.monto)).toLocaleString('es-CO'),
        concepto: data.concepto || 'participacion en proyecto',
        proyecto_nombre: data.repartos?.proyectos?.nombre || 'el proyecto',
        proyecto_id: data.repartos?.proyecto_id,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, linea: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
