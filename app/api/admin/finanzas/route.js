// app/api/admin/finanzas/route.js
// GET — panel financiero consolidado de toda la plataforma
// Solo accesible para admin_ids

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { esAdmin } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)


export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user || !await esAdmin(user.id)) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })

    // 1. Fondeos por estado
    const { data: fondeos } = await supabase
      .from('presupuesto_fondeos')
      .select(`
        id, monto, estado, a_cambio_de, created_at,
        presupuesto_items(nombre, categoria, proyectos(nombre, ciudad)),
        perfiles!inversionista_id(nombre, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    const fondeosPorEstado = {}
    let capital_total = 0
    let capital_verificado = 0
    let capital_pendiente_verificacion = 0

    for (const f of (fondeos || [])) {
      fondeosPorEstado[f.estado] = (fondeosPorEstado[f.estado] || 0) + 1
      capital_total += parseFloat(f.monto || 0)
      if (f.estado === 'verificado') capital_verificado += parseFloat(f.monto || 0)
      if (f.estado === 'transferido') capital_pendiente_verificacion += parseFloat(f.monto || 0)
    }

    // 2. Locales comerciales — capital en movimiento y pagos
    const { data: locales } = await supabase
      .from('proyectos_local_comercial')
      .select(`
        id, nombre_negocio, capital_total, capital_pagado, intereses_pagados,
        fase_actual, estado_verificacion, tasa_mensual, canon_mensual,
        proyectos(nombre, ciudad, fundador_id, perfiles!fundador_id(nombre, email))
      `)
      .eq('estado_verificacion', 'aprobado')
      .order('created_at', { ascending: false })

    const capital_local_total = (locales || []).reduce((s, l) => s + parseFloat(l.capital_total || 0), 0)
    const capital_local_pagado = (locales || []).reduce((s, l) => s + parseFloat(l.capital_pagado || 0), 0)
    const intereses_local_total = (locales || []).reduce((s, l) => s + parseFloat(l.intereses_pagados || 0), 0)

    // 3. Locales sin reporte reciente (posible mora)
    const hace3dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: reportes_recientes } = await supabase
      .from('reportes_diarios_local')
      .select('proyecto_id, fecha')
      .gte('fecha', hace3dias)

    const proyectos_con_reporte = new Set((reportes_recientes || []).map(r => r.proyecto_id))
    const locales_en_mora = (locales || []).filter(l =>
      ['repago', 'regalia'].includes(l.fase_actual) &&
      !proyectos_con_reporte.has(l.proyectos?.id)
    )

    // 4. Transferencias pendientes de verificacion
    const fondeos_por_verificar = (fondeos || []).filter(f => f.estado === 'transferido')

    return NextResponse.json({
      ok: true,
      resumen: {
        capital_en_movimiento: Math.round(capital_total + capital_local_total),
        capital_presupuesto_total: Math.round(capital_total),
        capital_presupuesto_verificado: Math.round(capital_verificado),
        capital_presupuesto_pendiente: Math.round(capital_pendiente_verificacion),
        capital_local_total: Math.round(capital_local_total),
        capital_local_pagado: Math.round(capital_local_pagado),
        intereses_local_total: Math.round(intereses_local_total),
        locales_activos: (locales || []).length,
        locales_en_mora: locales_en_mora.length,
        fondeos_por_verificar: fondeos_por_verificar.length,
        total_fondeos: (fondeos || []).length,
        fondeos_por_estado: fondeosPorEstado,
      },
      fondeos_por_verificar,
      locales_en_mora: locales_en_mora.map(l => ({
        proyecto_id: l.proyectos?.id,
        nombre_negocio: l.nombre_negocio,
        nombre_proyecto: l.proyectos?.nombre,
        ciudad: l.proyectos?.ciudad,
        fundador: l.proyectos?.perfiles?.nombre,
        email: l.proyectos?.perfiles?.email,
        fase_actual: l.fase_actual,
        saldo_pendiente: parseFloat(l.capital_total) - parseFloat(l.capital_pagado || 0),
      })),
      fondeos_recientes: (fondeos || []).slice(0, 20),
      locales: locales || [],
    })
  } catch (err) {
    console.error('admin/finanzas error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
