// app/api/presupuesto/route.js
// GET  — lista items del presupuesto de un proyecto
// POST — crear nuevo item
// PUT  — actualizar item
// DELETE — eliminar item

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    // Primero intentar con join a fondeos
    let items = []
    let errorJoin = null

    const { data: itemsConFondeos, error: e1 } = await supabase
      .from('presupuesto_items')
      .select(`
        *,
        hitos(id, nombre),
        perfiles!responsable_id(id, nombre),
        presupuesto_fondeos(
          id, monto, estado, a_cambio_de, pct_participacion,
          tasa_mensual, pct_revenue, inversionista_id,
          perfiles!inversionista_id(nombre)
        )
      `)
      .eq('proyecto_id', proyecto_id)
      .order('categoria')
      .order('prioridad')
      .order('created_at')

    if (e1) {
      // Si falla el join (tabla no existe), intentar sin fondeos
      const { data: itemsSimples, error: e2 } = await supabase
        .from('presupuesto_items')
        .select('*')
        .eq('proyecto_id', proyecto_id)
        .order('categoria')
        .order('created_at')

      if (e2) throw e2
      items = (itemsSimples || []).map(i => ({ ...i, presupuesto_fondeos: [] }))
    } else {
      items = itemsConFondeos || []
    }

    // Calcular resumen
    const total_presupuesto = (items || []).reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const total_fondeado = (items || []).reduce((s, i) => s + parseFloat(i.monto_fondeado || 0), 0)
    const total_capex = (items || []).filter(i => i.tipo_gasto === 'capex').reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const total_opex = (items || []).filter(i => i.tipo_gasto === 'opex').reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)

    // Agrupar por categoria
    const por_categoria = {}
    for (const item of (items || [])) {
      const cat = item.categoria
      if (!por_categoria[cat]) por_categoria[cat] = { items: [], total: 0, fondeado: 0 }
      por_categoria[cat].items.push(item)
      por_categoria[cat].total += parseFloat(item.valor_total || 0)
      por_categoria[cat].fondeado += parseFloat(item.monto_fondeado || 0)
    }

    return NextResponse.json({
      ok: true,
      items: items || [],
      por_categoria,
      resumen: {
        total_presupuesto,
        total_fondeado,
        total_capex,
        total_opex,
        pct_fondeado: total_presupuesto > 0 ? Math.round((total_fondeado / total_presupuesto) * 100) : 0,
        items_sin_fondear: (items || []).filter(i => i.estado_fondeo === 'sin_fondear').length,
        items_fondeados: (items || []).filter(i => i.estado_fondeo === 'fondeado' || i.estado_fondeo === 'verificado').length,
      }
    })
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
    const { proyecto_id, categoria, subcategoria, nombre, descripcion, cantidad, valor_unitario,
            tipo_gasto, es_recurrente, frecuencia, vida_util_meses, hito_id,
            prioridad, fecha_requerida, justificacion, es_aporte_especie } = body

    if (!proyecto_id || !categoria || !nombre || !valor_unitario) {
      return NextResponse.json({ error: 'proyecto_id, categoria, nombre y valor_unitario son obligatorios' }, { status: 400 })
    }

    // Verificar que el usuario es fundador del proyecto
    const { data: proyecto } = await supabase
      .from('proyectos').select('fundador_id').eq('id', proyecto_id).single()
    if (proyecto?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Solo el fundador puede agregar items al presupuesto' }, { status: 403 })
    }

    const { data: item, error } = await supabase
      .from('presupuesto_items')
      .insert({
        proyecto_id, categoria,
        subcategoria: categoria === 'otro' ? subcategoria : null,
        nombre, descripcion,
        cantidad: parseFloat(cantidad || 1),
        valor_unitario: parseFloat(valor_unitario),
        tipo_gasto: tipo_gasto || 'capex',
        es_recurrente: !!es_recurrente,
        frecuencia: es_recurrente ? (frecuencia || 'mensual') : 'unico',
        vida_util_meses: vida_util_meses ? parseInt(vida_util_meses) : null,
        hito_id: hito_id || null,
        prioridad: prioridad || 'media',
        fecha_requerida: fecha_requerida || null,
        justificacion: justificacion || null,
        es_aporte_especie: !!es_aporte_especie,
        estado_fondeo: es_aporte_especie ? 'fondeado' : 'sin_fondear',
        monto_fondeado: es_aporte_especie ? parseFloat(cantidad || 1) * parseFloat(valor_unitario) : 0,
        creado_por: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, item })
  } catch (err) {
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

    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    // Verificar propiedad
    const { data: item } = await supabase
      .from('presupuesto_items')
      .select('proyecto_id, proyectos(fundador_id)')
      .eq('id', id).single()
    if (item?.proyectos?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // No permitir actualizar campos calculados
    delete updates.valor_total
    updates.updated_at = new Date().toISOString()
    if (updates.cantidad) updates.cantidad = parseFloat(updates.cantidad)
    if (updates.valor_unitario) updates.valor_unitario = parseFloat(updates.valor_unitario)

    const { data: updated, error } = await supabase
      .from('presupuesto_items').update(updates).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ ok: true, item: updated })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    // Verificar propiedad y que no tiene fondeos activos
    const { data: item } = await supabase
      .from('presupuesto_items')
      .select('proyecto_id, estado_fondeo, proyectos(fundador_id)')
      .eq('id', id).single()

    if (item?.proyectos?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }
    if (['fondeado', 'ejecutado', 'verificado'].includes(item?.estado_fondeo)) {
      return NextResponse.json({ error: 'No puedes eliminar un item que ya tiene fondeo' }, { status: 400 })
    }

    const { error } = await supabase.from('presupuesto_items').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
