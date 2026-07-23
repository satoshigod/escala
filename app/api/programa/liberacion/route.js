// app/api/programa/liberacion/route.js
//
// Carta de liberacion: certifica que el capital quedo recuperado y el equipo
// pasa a nombre de quien lo pago.
//
// Es el momento de mayor valor de todo el modelo — la persona empezo sin poder
// comprar la maquina y termina siendo dueña. Merece un documento formal, no un
// cambio de estado silencioso.
//
// GET  — obtener la carta (o verificar si aplica)
// POST — emitirla (admin) o auto-emitirla cuando el capital llega a cero

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

function generarCarta(c, entrega) {
  const hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  const equipo = [c.tipo_equipo, c.marca, c.modelo].filter(Boolean).join(' ')
  const serial = entrega?.serial_real || c.serial || 'no registrado'
  const valor = Math.round(Number(c.valor_equipo || 0)).toLocaleString('es-CO')

  return `CARTA DE LIBERACION DE EQUIPO

Contrato No. ${c.numero_contrato || c.id}
Fecha de emision: ${hoy}

Por medio del presente documento, ESCALA NETWORK, actuando como intermediario
tecnologico entre las partes del contrato de leasing operativo referenciado,
hace constar que:

PRIMERO. El senor(a) ${c.nombre_beneficiaria || 'el beneficiario'}, identificado(a) con
documento ${c.cedula_beneficiaria || 'registrado en la plataforma'}, suscribio un contrato de
leasing operativo sobre el siguiente equipo:

    Equipo:  ${equipo}
    Serial:  ${serial}
    Valor:   $${valor} COP

SEGUNDO. Que el capital correspondiente al valor del equipo fue recuperado en su
totalidad mediante los abonos periodicos calculados sobre el excedente reportado
de la actividad productiva, conforme a lo pactado en el contrato.

TERCERO. Que en consecuencia, y a partir de la fecha de emision de esta carta,
la propiedad del equipo descrito se transfiere de manera plena, libre y sin
gravamen alguno a ${c.nombre_beneficiaria || 'el beneficiario'}, quedando extinguidas
todas las obligaciones derivadas del contrato de leasing.

CUARTO. Que el inversionista que aporto el capital manifiesta, mediante la
aceptacion registrada en la plataforma, su conformidad con el cumplimiento
integral de las obligaciones y no tiene reclamacion pendiente alguna.

QUINTO. Que el historial de cumplimiento de este contrato queda registrado en
la plataforma como antecedente favorable, disponible para futuras operaciones.

Esta constancia se emite de forma automatica por la plataforma con base en los
registros contables de la operacion, los cuales son inmutables y auditables.

ESCALA NETWORK
escala.network`
}

// GET — ver la carta o saber si aplica
export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const contrato_id = searchParams.get('contrato_id')
    if (!contrato_id) return NextResponse.json({ error: 'contrato_id requerido' }, { status: 400 })

    const { data: c } = await supabase
      .from('contratos_leasing')
      .select('*, entregas_equipo(*)')
      .eq('id', contrato_id).single()

    if (!c) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const esParte = c.beneficiaria_id === user.id || c.angel_id === user.id || await esAdmin(user.id)
    if (!esParte) return NextResponse.json({ error: 'No tienes acceso a este contrato' }, { status: 403 })

    const pendiente = Number(c.valor_equipo || 0) - Number(c.capital_abonado || 0)
    const aplica = pendiente <= 0

    return NextResponse.json({
      ok: true,
      aplica,
      emitida: c.estado === 'liquidado',
      capital_pendiente: Math.max(0, pendiente),
      carta: aplica ? generarCarta(c, (c.entregas_equipo || [])[0]) : null,
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — emitir la carta
export async function POST(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { contrato_id } = await req.json()
    if (!contrato_id) return NextResponse.json({ error: 'contrato_id requerido' }, { status: 400 })

    const { data: c } = await supabase
      .from('contratos_leasing')
      .select('*, entregas_equipo(*)')
      .eq('id', contrato_id).single()
    if (!c) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    // Solo admin emite: el documento certifica una transferencia de propiedad,
    // conviene que un humano lo revise aunque el calculo sea automatico.
    if (!await esAdmin(user.id)) {
      return NextResponse.json({ error: 'Solo Escala puede emitir la carta de liberacion' }, { status: 403 })
    }

    const pendiente = Number(c.valor_equipo || 0) - Number(c.capital_abonado || 0)
    if (pendiente > 0) {
      return NextResponse.json({
        error: `Todavia hay capital pendiente: $${Math.round(pendiente).toLocaleString('es-CO')}`,
      }, { status: 400 })
    }

    if (!['en_operacion', 'reestructurado', 'en_mora'].includes(c.estado)) {
      return NextResponse.json({ error: `No se puede liberar desde el estado "${c.estado}"` }, { status: 400 })
    }

    const carta = generarCarta(c, (c.entregas_equipo || [])[0])

    const { error } = await supabase
      .from('contratos_leasing')
      .update({
        estado: 'liquidado',
        carta_liberacion: carta,
        fecha_liberacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', contrato_id)
      .in('estado', ['en_operacion', 'reestructurado', 'en_mora'])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Avisar a las dos partes: para ella es el logro, para el la recuperacion total
    if (c.beneficiaria_id) {
      const { data: p } = await supabase.from('perfiles').select('id, email').eq('id', c.beneficiaria_id).single()
      if (p?.email) {
        await notificar('equipo_liberado', { id: p.id, email: p.email }, {
          nombre: c.nombre_beneficiaria || '',
          equipo: [c.tipo_equipo, c.marca].filter(Boolean).join(' '),
          contrato_id,
        }).catch(() => {})
      }
    }
    if (c.angel_id) {
      const { data: a } = await supabase.from('perfiles').select('id, email').eq('id', c.angel_id).single()
      if (a?.email) {
        await notificar('capital_recuperado', { id: a.id, email: a.email }, {
          equipo: [c.tipo_equipo, c.marca].filter(Boolean).join(' '),
          beneficiaria: c.nombre_beneficiaria || '',
          monto_formateado: Math.round(Number(c.valor_equipo || 0)).toLocaleString('es-CO'),
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, carta })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
