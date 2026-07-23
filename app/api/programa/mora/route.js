// app/api/programa/mora/route.js
//
// Gestion de mora del leasing.
//
// Contexto: el contrato ya tiene la clausula ("si no reportas 3 meses seguidos
// se puede retirar el equipo") pero no habia proceso que la ejecutara, asi que
// era letra muerta.
//
// Filosofia: el modelo cobra desde el excedente, asi que un mes flojo NO es
// mora — es exactamente lo que el producto promete. La mora aqui es NO REPORTAR,
// que es distinto de reportar poco. Por eso la escalera es progresiva y el
// retiro del equipo es la ultima instancia, no la primera.

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

// Escalera de mora — progresiva y humana antes que punitiva
export const ESCALERA = [
  { dias: 35,  nivel: 'recordatorio', accion: 'Mensaje automatico: "no vemos tu reporte del mes"',   automatica: true },
  { dias: 50,  nivel: 'contacto',     accion: 'Llamada de operacion para entender que paso',          automatica: false },
  { dias: 65,  nivel: 'alerta',       accion: 'Contrato pasa a en_mora. Se avisa al inversionista',   automatica: true },
  { dias: 95,  nivel: 'acuerdo',      accion: 'Se ofrece reestructuracion del plan',                  automatica: false },
  { dias: 125, nivel: 'recuperacion', accion: 'Comite evalua retiro del equipo (ultima instancia)',   automatica: false },
]

function nivelPorDias(dias) {
  let actual = null
  for (const p of ESCALERA) if (dias >= p.dias) actual = p
  return actual
}

// GET — panel de mora: contratos operando y sus dias sin reportar
export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!await esAdmin(user.id)) {
      return NextResponse.json({ error: 'Solo operacion de Escala' }, { status: 403 })
    }

    const { data: contratos, error } = await supabase
      .from('contratos_leasing')
      .select('id, numero_contrato, nombre_beneficiaria, beneficiaria_id, angel_id, tipo_equipo, marca, valor_equipo, capital_pendiente, capital_abonado, estado, created_at')
      .in('estado', ['en_operacion', 'en_mora', 'reestructurado'])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const hoy = new Date()
    const casos = []

    for (const c of contratos || []) {
      // ultimo reporte del contrato
      const { data: ultimo } = await supabase
        .from('reportes_leasing')
        .select('created_at, fecha_mes')
        .eq('contrato_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1).maybeSingle()

      const desde = ultimo?.created_at ? new Date(ultimo.created_at) : new Date(c.created_at)
      const dias = Math.floor((hoy - desde) / 86400000)
      const nivel = nivelPorDias(dias)

      casos.push({
        contrato_id: c.id,
        numero: c.numero_contrato,
        beneficiaria: c.nombre_beneficiaria,
        beneficiaria_id: c.beneficiaria_id,
        angel_id: c.angel_id,
        equipo: `${c.tipo_equipo || ''} ${c.marca || ''}`.trim(),
        valor_equipo: c.valor_equipo,
        capital_pendiente: c.capital_pendiente,
        pct_recuperado: c.valor_equipo ? Math.round((Number(c.capital_abonado || 0) / Number(c.valor_equipo)) * 100) : 0,
        estado: c.estado,
        ultimo_reporte: ultimo?.created_at || null,
        dias_sin_reportar: dias,
        nivel: nivel?.nivel || 'al_dia',
        accion_sugerida: nivel?.accion || 'Ninguna, esta al dia',
      })
    }

    casos.sort((a, b) => b.dias_sin_reportar - a.dias_sin_reportar)

    return NextResponse.json({
      ok: true,
      casos,
      resumen: {
        al_dia: casos.filter(c => c.nivel === 'al_dia').length,
        en_riesgo: casos.filter(c => ['recordatorio', 'contacto'].includes(c.nivel)).length,
        en_mora: casos.filter(c => ['alerta', 'acuerdo', 'recuperacion'].includes(c.nivel)).length,
      },
      escalera: ESCALERA,
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — ejecutar una accion de mora
export async function POST(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!await esAdmin(user.id)) {
      return NextResponse.json({ error: 'Solo operacion de Escala' }, { status: 403 })
    }

    const { contrato_id, accion, nota, nuevo_pct, meses_gracia } = await req.json()
    if (!contrato_id || !accion) {
      return NextResponse.json({ error: 'contrato_id y accion son requeridos' }, { status: 400 })
    }

    const { data: c } = await supabase
      .from('contratos_leasing')
      .select('id, estado, beneficiaria_id, angel_id, nombre_beneficiaria, pct_excedente')
      .eq('id', contrato_id).single()
    if (!c) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    let updates = { updated_at: new Date().toISOString() }
    let mensajeBeneficiaria = null

    switch (accion) {
      case 'recordar':
        // No cambia estado: solo avisa
        mensajeBeneficiaria = 'recordatorio'
        break

      case 'marcar_mora':
        if (!['en_operacion', 'reestructurado'].includes(c.estado)) {
          return NextResponse.json({ error: `No se puede marcar mora desde "${c.estado}"` }, { status: 400 })
        }
        updates.estado = 'en_mora'
        mensajeBeneficiaria = 'mora'
        break

      case 'reestructurar':
        // Baja el % del excedente y/o da meses de gracia. Nunca condona capital:
        // el capital es del inversionista, no de Escala.
        if (!['en_mora', 'en_operacion'].includes(c.estado)) {
          return NextResponse.json({ error: `No se puede reestructurar desde "${c.estado}"` }, { status: 400 })
        }
        updates.estado = 'reestructurado'
        if (nuevo_pct) updates.pct_excedente = Number(nuevo_pct)
        mensajeBeneficiaria = 'reestructuracion'
        break

      case 'poner_al_dia':
        if (!['en_mora', 'reestructurado'].includes(c.estado)) {
          return NextResponse.json({ error: `No aplica desde "${c.estado}"` }, { status: 400 })
        }
        updates.estado = 'en_operacion'
        break

      case 'recuperacion':
        // Ultima instancia. Decision de comite, no automatica.
        if (c.estado !== 'en_mora' && c.estado !== 'reestructurado') {
          return NextResponse.json({ error: 'Solo desde mora o reestructurado' }, { status: 400 })
        }
        updates.estado = 'recuperacion'
        mensajeBeneficiaria = 'recuperacion'
        break

      default:
        return NextResponse.json({ error: 'Accion no reconocida' }, { status: 400 })
    }

    if (Object.keys(updates).length > 1) {
      const { error } = await supabase.from('contratos_leasing').update(updates).eq('id', contrato_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Registrar la gestion para trazabilidad
    await supabase.from('entregas_equipo').update({
      nota: `[${new Date().toISOString().slice(0,10)}] ${accion}: ${nota || ''}`.trim(),
      updated_at: new Date().toISOString(),
    }).eq('contrato_id', contrato_id).catch(() => {})

    if (mensajeBeneficiaria && c.beneficiaria_id) {
      const { data: p } = await supabase.from('perfiles').select('id, email').eq('id', c.beneficiaria_id).single()
      if (p?.email) {
        await notificar('leasing_mora', { id: p.id, email: p.email }, {
          nombre: c.nombre_beneficiaria || '',
          tipo: mensajeBeneficiaria,
          nota: nota || '',
          meses_gracia: meses_gracia || 0,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, estado: updates.estado || c.estado })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
