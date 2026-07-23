// app/api/custodia/route.js
//
// API de transiciones de la maquina de estados de custodia.
// POST { accion, orden_id, ... } -> ejecuta la transicion segun el rol.
// GET  -> lista las ordenes del usuario (como pagador/receptor) o todas si es admin.

import { NextResponse } from 'next/server'
import {
  reportarPago,
  confirmarRecepcion,
  emitirPago,
  confirmarRecepcionReceptor,
  cancelarOrden,
} from '@/lib/financiero/custodia'
import { esAdmin } from '@/lib/auth'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

async function getUser(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  return user || null
}

export async function POST(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const esAdmin = await esAdmin(user.id)

    const { accion, orden_id, referencia } = await req.json()
    if (!accion || !orden_id) return NextResponse.json({ error: 'Faltan accion u orden_id' }, { status: 400 })

    let res
    switch (accion) {
      case 'reportar_pago':
        // el pagador confirma que ya pago a Escala
        res = await reportarPago(orden_id, user.id, referencia || null)
        break

      case 'confirmar_recepcion':
        // solo admin: Escala confirma que recibio -> ledger tramo 1
        if (!esAdmin) return NextResponse.json({ error: 'Solo un admin puede confirmar la recepcion en custodia' }, { status: 403 })
        res = await confirmarRecepcion(orden_id, user.id)
        break

      case 'emitir_pago':
        // solo admin: Escala marca que pago al receptor
        if (!esAdmin) return NextResponse.json({ error: 'Solo un admin puede emitir el pago' }, { status: 403 })
        res = await emitirPago(orden_id, user.id, referencia || null)
        break

      case 'confirmar_recibido':
        // el receptor (o el admin si es receptor externo) confirma que recibio -> ledger tramo 2
        res = await confirmarRecepcionReceptor(orden_id, user.id, esAdmin)
        break

      case 'cancelar':
        if (!esAdmin) return NextResponse.json({ error: 'Solo un admin puede cancelar una orden' }, { status: 403 })
        res = await cancelarOrden(orden_id, user.id, referencia || null)
        break

      default:
        return NextResponse.json({ error: 'Accion no reconocida' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, orden: res.orden })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const esAdmin = await esAdmin(user.id)

    const { searchParams } = new URL(req.url)
    const rol = searchParams.get('rol') // 'pagador' | 'receptor' | 'admin'
    const estado = searchParams.get('estado')

    let query = supabase.from('ordenes_pago').select('*').order('created_at', { ascending: false })

    if (rol === 'admin' && esAdmin) {
      // admin: todas (o filtradas por estado — util para la bandeja "por verificar")
      if (estado) query = query.eq('estado', estado)
    } else if (rol === 'receptor') {
      query = query.eq('receptor_id', user.id)
    } else {
      // por defecto: las que debo pagar yo
      query = query.eq('pagador_id', user.id)
    }

    const { data, error } = await query.limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ordenes: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
