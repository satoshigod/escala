// app/api/programa/solicitudes/route.js
//
// POST  — crear solicitud (publica, no requiere cuenta) + scoring automatico
// GET   — listar (bandeja del analista, o las propias del usuario)
// PATCH — mover de estado (revision, verificacion, rechazo)

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { calcularScore, estimarPlan, BANDAS } from '@/lib/programa/scoring'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const ADMIN_IDS = ['a57b6849-1388-4186-8880-2ec31dd31af5']

async function getUser(req) {
  const h = req.headers.get('authorization')
  if (!h) return null
  const { data: { user } } = await supabase.auth.getUser(h.replace('Bearer ', ''))
  return user || null
}

// ---------------------------------------------------------------------------
// POST — la solicitante aplica. No exige cuenta: pedir registro antes de saber
// si califica es el principal punto de abandono.
// ---------------------------------------------------------------------------
export async function POST(req) {
  try {
    const b = await req.json()

    if (!b.nombre || !b.celular || !b.tipo_equipo) {
      return NextResponse.json({ error: 'Faltan datos basicos' }, { status: 400 })
    }

    const datos = {
      ciudad: b.ciudad || 'Medellin',
      tipo_equipo: b.tipo_equipo,
      valor_estimado: b.valor_estimado,
      anios_oficio: b.anios_oficio,
      produccion_semanal: b.produccion_semanal,
      a_quien_vende: b.a_quien_vende,
      ingreso_mensual: b.ingreso_mensual,
      tiene_maquina: b.tiene_maquina,
    }

    const r = calcularScore(datos)
    const plan = estimarPlan({
      valor_equipo: b.valor_estimado,
      ingreso_mensual: b.ingreso_mensual,
    })

    const { data, error } = await supabase
      .from('solicitudes_programa')
      .insert({
        programa: b.programa || '10_maquinas',
        usuario_id: b.usuario_id || null,
        nombre: b.nombre,
        cedula: b.cedula || null,
        celular: b.celular,
        email: b.email || null,
        ciudad: datos.ciudad,
        barrio: b.barrio || null,
        tipo_equipo: b.tipo_equipo,
        para_que: b.para_que || null,
        valor_estimado: b.valor_estimado || null,
        anios_oficio: b.anios_oficio || null,
        produccion_semanal: b.produccion_semanal || null,
        a_quien_vende: b.a_quien_vende || null,
        ingreso_mensual: b.ingreso_mensual || null,
        tiene_maquina: !!b.tiene_maquina,
        score: r.score,
        banda: r.banda,
        score_detalle: { ...r.detalle, descartes: r.descartes, resumen: r.resumen, plan },
        estado: r.accion,
        motivo_rechazo: r.descartes.length ? r.descartes.join(', ') : null,
        origen: b.origen || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Avisar al equipo cuando hay que revisar o cuando entra una preaprobada
    if (r.accion !== 'rechazada') {
      await notificar('admin_solicitud_programa',
        { id: ADMIN_IDS[0], email: 'ivan@escala.network' },
        {
          nombre: b.nombre,
          tipo_equipo: b.tipo_equipo,
          score: r.score,
          banda: BANDAS[r.banda].label,
          solicitud_id: data.id,
        }
      ).catch(() => {})
    }

    // La respuesta NO revela el score ni la banda: es informacion interna.
    return NextResponse.json({
      ok: true,
      solicitud_id: data.id,
      estado: data.estado,
      plan_estimado: plan,
      mensaje: mensajeParaSolicitante(r.accion),
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function mensajeParaSolicitante(accion) {
  if (accion === 'preaprobada') {
    return 'Tu solicitud pasó el primer filtro. Te llamamos en las próximas 48 horas para agendar la visita.'
  }
  if (accion === 'en_revision') {
    return 'Recibimos tu solicitud. La estamos revisando y te contactamos en máximo 3 días hábiles.'
  }
  // Rechazo: mensaje digno, sin cerrar la puerta y con una ruta alterna real.
  return 'Por ahora no podemos avanzar con tu solicitud para este programa. Te escribimos cuando abramos nuevos cupos, y mientras tanto puedes publicar tu necesidad en Escala para que un inversionista la vea.'
}

// ---------------------------------------------------------------------------
// GET — bandeja del analista (o las propias del usuario)
// ---------------------------------------------------------------------------
export async function GET(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const esAdmin = ADMIN_IDS.includes(user.id)

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')
    const programa = searchParams.get('programa') || '10_maquinas'

    let q = supabase.from('solicitudes_programa').select('*')
      .eq('programa', programa)
      .order('created_at', { ascending: false })

    if (!esAdmin) q = q.eq('usuario_id', user.id)
    if (estado) q = q.eq('estado', estado)

    const { data, error } = await q.limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Resumen para el tablero del piloto
    const resumen = (data || []).reduce((acc, s) => {
      acc[s.estado] = (acc[s.estado] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({ ok: true, solicitudes: data || [], resumen, es_admin: esAdmin })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH — el analista mueve la solicitud de estado
// ---------------------------------------------------------------------------
const TRANSICIONES = {
  recibida:       ['preaprobada', 'en_revision', 'rechazada'],
  en_revision:    ['preaprobada', 'rechazada', 'info_pendiente'],
  info_pendiente: ['en_revision', 'caducada'],
  preaprobada:    ['verificada', 'rechazada'],
  verificada:     ['cotizada', 'rechazada'],
  cotizada:       ['contratada', 'rechazada'],
}

export async function PATCH(req) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!ADMIN_IDS.includes(user.id)) {
      return NextResponse.json({ error: 'Solo un analista de Escala puede revisar solicitudes' }, { status: 403 })
    }

    const { id, estado, motivo, verificacion_tipo, verificacion_nota } = await req.json()
    if (!id || !estado) return NextResponse.json({ error: 'Faltan id o estado' }, { status: 400 })

    const { data: actual } = await supabase
      .from('solicitudes_programa').select('estado, nombre, email, usuario_id').eq('id', id).single()
    if (!actual) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })

    const permitidos = TRANSICIONES[actual.estado] || []
    if (!permitidos.includes(estado)) {
      return NextResponse.json(
        { error: `No se puede pasar de "${actual.estado}" a "${estado}"` }, { status: 400 })
    }

    const updates = {
      estado,
      revisada_por: user.id,
      revisada_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (motivo) updates.motivo_rechazo = motivo
    if (verificacion_tipo) {
      updates.verificacion_tipo = verificacion_tipo
      updates.verificacion_at = new Date().toISOString()
    }
    if (verificacion_nota) updates.verificacion_nota = verificacion_nota

    const { data, error } = await supabase
      .from('solicitudes_programa').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Avisar a la solicitante en los momentos que le importan
    if (actual.email && (estado === 'preaprobada' || estado === 'rechazada' || estado === 'verificada')) {
      await notificar('solicitud_programa_actualizada',
        { id: actual.usuario_id, email: actual.email },
        { nombre: actual.nombre, estado, motivo: motivo || '' }
      ).catch(() => {})
    }

    return NextResponse.json({ ok: true, solicitud: data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
