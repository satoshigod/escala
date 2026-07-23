// app/api/local-comercial/financiar/route.js
//
// GET  — locales aprobados que buscan inversionista (oportunidades de local)
// POST — un inversionista toma un local y lo financia
//
// Al financiar: se asigna el inversionista, el local pasa a activo y nace la
// orden de CUSTODIA del arriendo (inversionista -> Escala -> arrendador).
// Escala recibe el capital, paga el deposito/arriendo al arrendador, y solo
// cuando eso se confirma el local queda operando.

import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'
import { crearOrdenPago } from '@/lib/financiero/custodia'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// GET — locales aprobados sin inversionista asignado
export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from('proyectos_local_comercial')
      .select(`
        id, proyecto_id, nombre_negocio, ciudad, direccion_local,
        canon_mensual, meses_deposito, capital_total, tasa_mensual,
        presupuesto_adecuacion, necesita_adecuacion, created_at,
        proyectos(id, nombre, sector, ciudad, pais)
      `)
      .eq('estado_verificacion', 'aprobado')
      .is('inversionista_id', null)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    const locales = (data || []).map(l => ({
      ...l,
      tipo_oportunidad: 'local_comercial',
      // lo que el inversionista pone hoy
      capital_requerido: parseFloat(l.capital_total || 0),
    }))

    return NextResponse.json({ ok: true, locales, total: locales.length })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// POST — el inversionista financia el local
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { local_id } = await req.json()
    if (!local_id) return NextResponse.json({ error: 'local_id requerido' }, { status: 400 })

    // Traer el local y validar que siga disponible
    const { data: local, error: eLocal } = await supabase
      .from('proyectos_local_comercial')
      .select('id, proyecto_id, nombre_negocio, operador_id, inversionista_id, estado_verificacion, capital_total, canon_mensual, direccion_local, ciudad')
      .eq('id', local_id)
      .single()

    if (eLocal || !local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 })
    if (local.estado_verificacion !== 'aprobado') {
      return NextResponse.json({ error: 'Este local aun no esta aprobado por Escala' }, { status: 400 })
    }
    if (local.inversionista_id) {
      return NextResponse.json({ error: 'Este local ya tiene inversionista' }, { status: 409 })
    }
    if (local.operador_id === user.id) {
      return NextResponse.json({ error: 'No puedes financiar tu propio local' }, { status: 400 })
    }

    // Asignar inversionista (guard optimista: solo si sigue libre)
    const { data: actualizado, error: eUpd } = await supabase
      .from('proyectos_local_comercial')
      .update({
        inversionista_id: user.id,
        estado: 'esperando_capital',
        updated_at: new Date().toISOString(),
      })
      .eq('id', local_id)
      .is('inversionista_id', null)
      .select()
      .single()

    if (eUpd || !actualizado) {
      return NextResponse.json({ error: 'Otro inversionista tomo este local primero' }, { status: 409 })
    }

    // CUSTODIA: el inversionista paga a Escala; Escala paga el deposito y
    // arriendo al arrendador (receptor externo, lo confirma el admin).
    let orden = null
    try {
      const r = await crearOrdenPago({
        tipo_flujo: 'arriendo',
        proyecto_id: local.proyecto_id,
        pagador_id: user.id,
        receptor_id: null,
        receptor_externo: `Arrendador del local — ${local.direccion_local || ''} ${local.ciudad || ''}`.trim(),
        monto: parseFloat(local.capital_total),
        moneda: 'COP',
        concepto: `Deposito y arriendo — ${local.nombre_negocio || 'local comercial'}`,
        referencia_tipo: 'local_comercial',
        referencia_id: local.id,
        idempotency_key: `custodia-local-${local.id}`,
      })
      orden = r.orden
    } catch (e) {
      console.error('custodia arriendo:', e.message)
    }

    // Avisar al operador (tendero) que ya tiene inversionista
    try {
      const { data: operador } = await supabase
        .from('perfiles').select('id, email').eq('id', local.operador_id).single()
      if (operador?.email) {
        await notificar('local_inversionista_asignado', { id: operador.id, email: operador.email }, {
          nombre_negocio: local.nombre_negocio || 'tu negocio',
          monto_formateado: Math.round(local.capital_total).toLocaleString('es-CO'),
          proyecto_id: local.proyecto_id,
        }).catch(() => {})
      }
    } catch (_) {}

    return NextResponse.json({ ok: true, local: actualizado, orden })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
