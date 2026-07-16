// app/api/inversiones/oportunidades/route.js
// GET — lista items de presupuesto sin fondear de proyectos activos
// Filtros: categoria, monto_min, monto_max, a_cambio_de, prioridad

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria')
    const prioridad = searchParams.get('prioridad')
    const monto_min = searchParams.get('monto_min')
    const monto_max = searchParams.get('monto_max')
    const page = parseInt(searchParams.get('page') || '1')
    const per_page = parseInt(searchParams.get('per_page') || '20')

    let query = supabase
      .from('presupuesto_items')
      .select(`
        id, nombre, descripcion, categoria, subcategoria,
        valor_total, monto_fondeado, estado_fondeo, prioridad,
        tipo_gasto, es_recurrente, justificacion, created_at,
        proyectos(id, nombre, sector, ciudad, pais)
      `)
      .in('estado_fondeo', ['sin_fondear', 'parcialmente_fondeado'])
      .eq('es_aporte_especie', false)
      .order('prioridad', { ascending: true })
      .order('created_at', { ascending: false })

    if (categoria) query = query.eq('categoria', categoria)
    if (prioridad) query = query.eq('prioridad', prioridad)
    if (monto_min) query = query.gte('valor_total', parseFloat(monto_min))
    if (monto_max) query = query.lte('valor_total', parseFloat(monto_max))

    // Paginacion
    const from = (page - 1) * per_page
    query = query.range(from, from + per_page - 1)

    const { data: items, error, count } = await query

    if (error) {
      console.error('oportunidades error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Calcular faltante por fondear en cada item
    const itemsConFaltante = (items || []).map(item => ({
      ...item,
      faltante: parseFloat(item.valor_total) - parseFloat(item.monto_fondeado || 0),
    }))

    // Resumen global
    const { data: resumen } = await supabase
      .from('presupuesto_items')
      .select('valor_total, monto_fondeado, categoria')
      .in('estado_fondeo', ['sin_fondear', 'parcialmente_fondeado'])
      .eq('es_aporte_especie', false)

    const total_oportunidades = (resumen || []).length
    const capital_requerido = (resumen || []).reduce((s, i) => s + parseFloat(i.valor_total) - parseFloat(i.monto_fondeado || 0), 0)

    const por_categoria = {}
    for (const item of (resumen || [])) {
      por_categoria[item.categoria] = (por_categoria[item.categoria] || 0) + 1
    }

    return NextResponse.json({
      ok: true,
      items: itemsConFaltante,
      meta: { page, per_page, total: count },
      resumen: {
        total_oportunidades,
        capital_requerido: Math.round(capital_requerido),
        por_categoria,
      }
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
