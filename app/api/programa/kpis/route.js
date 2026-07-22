// app/api/programa/kpis/route.js
//
// KPIs del piloto: embudo de conversion y salud de la operacion.
//
// Que se mide y por que: en un piloto de 10 maquinas el objetivo no es volumen,
// es APRENDER. Cada metrica esta elegida para responder una pregunta que hay
// que contestar antes de escalar.

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const ADMIN_IDS = ['a57b6849-1388-4186-8880-2ec31dd31af5']

export async function GET(req) {
  try {
    const h = req.headers.get('authorization')
    if (!h) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { data: { user } } = await supabase.auth.getUser(h.replace('Bearer ', ''))
    if (!user || !ADMIN_IDS.includes(user.id)) {
      return NextResponse.json({ error: 'Solo operacion de Escala' }, { status: 403 })
    }

    const [{ data: sols }, { data: contratos }, { data: reportes }] = await Promise.all([
      supabase.from('solicitudes_programa').select('estado, banda, score, created_at, origen, tipo_equipo, valor_estimado'),
      supabase.from('contratos_leasing').select('id, estado, valor_equipo, capital_abonado, created_at'),
      supabase.from('reportes_leasing').select('contrato_id, excedente, abono_angel, fecha_mes'),
    ])

    const S = sols || [], C = contratos || [], R = reportes || []
    const n = (arr, f) => arr.filter(f).length
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

    // ---- EMBUDO: donde se cae la gente ----
    const recibidas   = S.length
    const noDescarte  = n(S, s => s.estado !== 'rechazada' || s.score > 0)
    const avanzaron   = n(S, s => ['preaprobada','verificada','cotizada','contratada'].includes(s.estado))
    const verificadas = n(S, s => ['verificada','cotizada','contratada'].includes(s.estado))
    const contratadas = n(S, s => s.estado === 'contratada')

    const embudo = [
      { paso: 'Solicitudes recibidas', valor: recibidas, conversion: 100 },
      { paso: 'Pasaron descarte duro', valor: noDescarte, conversion: pct(noDescarte, recibidas) },
      { paso: 'Preaprobadas',          valor: avanzaron,  conversion: pct(avanzaron, recibidas) },
      { paso: 'Verificadas',           valor: verificadas, conversion: pct(verificadas, recibidas) },
      { paso: 'Contratadas',           valor: contratadas, conversion: pct(contratadas, recibidas) },
    ]

    // ---- CALIDAD DEL SCORING: ¿el modelo separa bien? ----
    const porBanda = ['alta','media','baja'].map(b => {
      const enBanda = S.filter(s => s.banda === b)
      const llegaron = enBanda.filter(s => ['verificada','cotizada','contratada'].includes(s.estado)).length
      return {
        banda: b,
        solicitudes: enBanda.length,
        llegaron_a_verificacion: llegaron,
        tasa: pct(llegaron, enBanda.length),
        score_promedio: enBanda.length ? Math.round(enBanda.reduce((a,s)=>a+(s.score||0),0)/enBanda.length) : 0,
      }
    })

    // ---- OPERACION: la cadena fisica ----
    const entregados = n(C, c => ['entregado','en_operacion','en_mora','reestructurado','liquidado'].includes(c.estado))
    const operando   = n(C, c => ['en_operacion','reestructurado'].includes(c.estado))
    const enMora     = n(C, c => c.estado === 'en_mora')
    const liquidados = n(C, c => c.estado === 'liquidado')

    // ---- CARTERA: la pregunta que importa para escalar ----
    const colocado   = C.reduce((a,c) => a + Number(c.valor_equipo||0), 0)
    const recuperado = C.reduce((a,c) => a + Number(c.capital_abonado||0), 0)

    // Tasa de mora sobre capital, no sobre numero de contratos: es la que
    // le importa a un inversionista.
    const capitalEnMora = C.filter(c => c.estado === 'en_mora')
      .reduce((a,c) => a + (Number(c.valor_equipo||0) - Number(c.capital_abonado||0)), 0)

    // ---- CUMPLIMIENTO DEL REPORTE: el habito que sostiene el modelo ----
    const contratosOperando = C.filter(c => ['en_operacion','en_mora','reestructurado','liquidado'].includes(c.estado))
    const conReporte = new Set(R.map(r => r.contrato_id)).size
    const excedenteProm = R.length ? Math.round(R.reduce((a,r)=>a+Number(r.excedente||0),0)/R.length) : 0
    const abonoProm     = R.length ? Math.round(R.reduce((a,r)=>a+Number(r.abono_angel||0),0)/R.length) : 0

    // ---- ORIGEN: que campana trae a los que si califican ----
    const origenes = {}
    for (const s of S) {
      const o = (s.origen || 'directo').replace(/[?&]origen=/,'').slice(0,20) || 'directo'
      if (!origenes[o]) origenes[o] = { total: 0, califican: 0 }
      origenes[o].total++
      if (['preaprobada','verificada','cotizada','contratada'].includes(s.estado)) origenes[o].califican++
    }
    const porOrigen = Object.entries(origenes).map(([k,v]) => ({
      origen: k, solicitudes: v.total, califican: v.califican, tasa: pct(v.califican, v.total),
    })).sort((a,b) => b.solicitudes - a.solicitudes)

    return NextResponse.json({
      ok: true,
      meta: { objetivo_piloto: 10, contratadas, faltan: Math.max(0, 10 - contratadas) },
      embudo,
      scoring: porBanda,
      operacion: {
        contratos: C.length, entregados, operando, en_mora: enMora, liquidados,
        pct_entregado: pct(entregados, C.length),
      },
      cartera: {
        capital_colocado: colocado,
        capital_recuperado: recuperado,
        pct_recuperado: pct(recuperado, colocado),
        capital_en_mora: capitalEnMora,
        tasa_mora_capital: pct(capitalEnMora, colocado),
      },
      reporte: {
        contratos_operando: contratosOperando.length,
        con_al_menos_un_reporte: conReporte,
        cumplimiento: pct(conReporte, contratosOperando.length),
        excedente_promedio: excedenteProm,
        abono_promedio: abonoProm,
        total_reportes: R.length,
      },
      origen: porOrigen,
      // Preguntas que el piloto debe contestar antes de escalar
      preguntas_clave: [
        { pregunta: '¿El scoring separa bien?', responde: 'Comparar tasa de mora entre banda alta y media' },
        { pregunta: '¿La gente reporta?', responde: `Cumplimiento actual: ${pct(conReporte, contratosOperando.length)}%` },
        { pregunta: '¿El excedente alcanza?', responde: `Abono promedio real: $${abonoProm.toLocaleString('es-CO')}/mes` },
        { pregunta: '¿Que campaña trae a los buenos?', responde: 'Ver tasa de calificacion por origen' },
      ],
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
