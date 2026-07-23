// app/api/programa/entrega/route.js
//
// Registra la cadena fisica del equipo: compra al proveedor, entrega,
// instalacion y capacitacion. Sin esto el contrato pasaba a 'activo' y no
// habia forma de saber si la maquina llego siquiera.
//
// Cada hito mueve el estado del contrato:
//   activo -> equipo_comprado -> entregado -> en_operacion

import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'
import { esAdmin } from '@/lib/auth'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

async function getUser(req) {
  const h = req.headers.get('authorization')
  if (!h) return null
  const { data: { user } } = await supabase.auth.getUser(h.replace('Bearer ', ''))
  return user || null
}

// Que estado del contrato deja cada hito, y desde donde puede venir
const HITOS = {
  compra:       { estado: 'equipo_comprado', desde: ['activo'],            campo: 'fecha_compra' },
  entrega:      { estado: 'entregado',       desde: ['equipo_comprado'],   campo: 'fecha_entrega' },
  capacitacion: { estado: 'en_operacion',    desde: ['entregado'],         campo: 'fecha_capacitacion' },
}

// GET — estado fisico de los equipos del piloto
export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const esAdmin = await esAdmin(user.id)

    let q = supabase
      .from('contratos_leasing')
      .select(`id, numero_contrato, tipo_equipo, marca, modelo, valor_equipo, estado,
               beneficiaria_id, angel_id, nombre_beneficiaria, ciudad, created_at,
               entregas_equipo(*)`)
      .order('created_at', { ascending: false })

    if (!esAdmin) q = q.or(`beneficiaria_id.eq.${user.id},angel_id.eq.${user.id}`)

    const { data, error } = await q.limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, contratos: data || [], es_admin: esAdmin })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — registrar un hito de la cadena fisica
export async function POST(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!await esAdmin(user.id)) {
      return NextResponse.json({ error: 'Solo operacion de Escala registra la entrega' }, { status: 403 })
    }

    const { contrato_id, hito, proveedor_id, serial_real, instalado_por,
            capacitado_por, foto_entrega, nota } = await req.json()

    if (!contrato_id || !hito || !HITOS[hito]) {
      return NextResponse.json({ error: 'contrato_id y hito validos son requeridos' }, { status: 400 })
    }

    const cfg = HITOS[hito]

    const { data: contrato } = await supabase
      .from('contratos_leasing')
      .select('id, estado, beneficiaria_id, nombre_beneficiaria, tipo_equipo, marca, modelo')
      .eq('id', contrato_id).single()

    if (!contrato) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    if (!cfg.desde.includes(contrato.estado)) {
      return NextResponse.json({
        error: `El contrato esta en "${contrato.estado}". Para registrar ${hito} debe estar en: ${cfg.desde.join(' o ')}`,
      }, { status: 400 })
    }

    // La entrega es un registro unico por contrato que se va completando
    const { data: existente } = await supabase
      .from('entregas_equipo').select('id').eq('contrato_id', contrato_id).maybeSingle()

    const campos = {
      contrato_id,
      [cfg.campo]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (proveedor_id)   campos.proveedor_id = proveedor_id
    if (serial_real)    campos.serial_real = serial_real
    if (instalado_por)  campos.instalado_por = instalado_por
    if (capacitado_por) campos.capacitado_por = capacitado_por
    if (foto_entrega)   campos.foto_entrega = foto_entrega
    if (nota)           campos.nota = nota
    if (hito === 'entrega') campos.firma_recibido = true

    let entrega
    if (existente) {
      const { data, error } = await supabase
        .from('entregas_equipo').update(campos).eq('id', existente.id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      entrega = data
    } else {
      const { data, error } = await supabase
        .from('entregas_equipo').insert(campos).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      entrega = data
    }

    // Mover el contrato, con guard optimista
    const { data: actualizado, error: eUpd } = await supabase
      .from('contratos_leasing')
      .update({ estado: cfg.estado, updated_at: new Date().toISOString() })
      .eq('id', contrato_id)
      .in('estado', cfg.desde)
      .select().single()

    if (eUpd || !actualizado) {
      return NextResponse.json({ error: 'El contrato cambio de estado, recarga e intenta de nuevo' }, { status: 409 })
    }

    // Avisar a la beneficiaria en los momentos que le importan
    if (contrato.beneficiaria_id && (hito === 'entrega' || hito === 'capacitacion')) {
      const { data: p } = await supabase
        .from('perfiles').select('id, email').eq('id', contrato.beneficiaria_id).single()
      if (p?.email) {
        await notificar('equipo_hito', { id: p.id, email: p.email }, {
          nombre: contrato.nombre_beneficiaria || '',
          equipo: `${contrato.tipo_equipo || 'equipo'} ${contrato.marca || ''}`.trim(),
          hito,
          contrato_id,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, entrega, estado: cfg.estado })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
