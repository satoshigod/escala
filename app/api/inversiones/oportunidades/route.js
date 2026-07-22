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
    const clasificar = (cat = '') => {
      const c = (cat || '').toLowerCase()
      if (/maquin|equipo|herramient|vehic/.test(c)) return 'equipos'
      if (/nomin|empleado|talento|salario|personal|servicio/.test(c)) return 'talento'
      if (/tecnolog|software|licencia|web|app/.test(c)) return 'tecnologia'
      if (/inventar|materia|insumo|producto|mercanc/.test(c)) return 'inventario'
      return 'otros'
    }

    const itemsConFaltante = (items || []).map(item => ({
      ...item,
      tipo_oportunidad: clasificar(item.categoria),
      faltante: parseFloat(item.valor_total) - parseFloat(item.monto_fondeado || 0),
    }))

    // LOCALES aprobados que buscan inversionista — se exponen como oportunidad
    // con el mismo shape que los items de presupuesto para que la UI los liste.
    let localesComoItems = []
    try {
      const { data: locales } = await supabase
        .from('proyectos_local_comercial')
        .select(`id, proyecto_id, nombre_negocio, ciudad, canon_mensual, capital_total, tasa_mensual, created_at, proyectos(id, nombre, sector, ciudad, pais)`)
        .eq('estado_verificacion', 'aprobado')
        .is('inversionista_id', null)
        .order('created_at', { ascending: false })

      localesComoItems = (locales || []).map(l => ({
        id: l.id,
        tipo_oportunidad: 'local_comercial',
        nombre: `Local para ${l.nombre_negocio || 'un negocio'}`,
        descripcion: `Deposito y arriendo de un local en ${l.ciudad || 'Colombia'}. El negocio paga desde sus ventas con tasa ${l.tasa_mensual || ''}% mensual.`,
        categoria: 'local_comercial',
        subcategoria: null,
        valor_total: parseFloat(l.capital_total || 0),
        monto_fondeado: 0,
        faltante: parseFloat(l.capital_total || 0),
        estado_fondeo: 'sin_fondear',
        prioridad: 1,
        tipo_gasto: 'capital',
        es_recurrente: false,
        justificacion: `Canon mensual $${Math.round(l.canon_mensual || 0).toLocaleString('es-CO')}`,
        created_at: l.created_at,
        proyectos: l.proyectos,
      }))
    } catch (e) {
      console.error('oportunidades locales:', e.message)
    }

    // Resumen global
    const { data: resumen } = await supabase
      .from('presupuesto_items')
      .select('valor_total, monto_fondeado, categoria')
      .in('estado_fondeo', ['sin_fondear', 'parcialmente_fondeado'])
      .eq('es_aporte_especie', false)

    const total_oportunidades = (resumen || []).length + localesComoItems.length
    const capital_requerido = (resumen || []).reduce((s, i) => s + parseFloat(i.valor_total) - parseFloat(i.monto_fondeado || 0), 0) + localesComoItems.reduce((s, l) => s + l.faltante, 0)

    const por_categoria = {}
    for (const item of (resumen || [])) {
      por_categoria[item.categoria] = (por_categoria[item.categoria] || 0) + 1
    }

    return NextResponse.json({
      ok: true,
      items: [...localesComoItems, ...itemsConFaltante],
      // agrupadas por tipo para mostrarlas en secciones separadas
      grupos: (() => {
        const todas = [...localesComoItems, ...itemsConFaltante]
        const g = {}
        for (const o of todas) {
          const t = o.tipo_oportunidad || 'otros'
          if (!g[t]) g[t] = []
          g[t].push(o)
        }
        return g
      })(),
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
