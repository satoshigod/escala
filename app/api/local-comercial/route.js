import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorización' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const body = await req.json()
    const {
      nombre_negocio, tipo_negocio, ciudad,
      direccion_local, propietario_nombre, propietario_telefono, propietario_correo,
      canon_mensual, meses_deposito, necesita_adecuacion, presupuesto_adecuacion,
      costo_servicios, costo_empleado, costo_otros,
      costo_producto, precio_venta,
      ventas_dia_flojo, ventas_dia_normal, ventas_dia_bueno,
    } = body

    // Calculos financieros
    const totalFijosMes = parseFloat(canon_mensual) + parseFloat(costo_servicios || 0) + parseFloat(costo_empleado || 0) + parseFloat(costo_otros || 0)
    const fijoDia = totalFijosMes / 30
    const margenPct = ((parseFloat(precio_venta) - parseFloat(costo_producto)) / parseFloat(precio_venta)) * 100
    const deposito = parseFloat(canon_mensual) * parseInt(meses_deposito)
    const capitalTotal = deposito + parseFloat(canon_mensual) + (necesita_adecuacion ? parseFloat(presupuesto_adecuacion || 0) : 0)

    // 1. Crear proyecto base
    const idempotency_key = crypto.randomUUID()
    const { data: proyecto, error: proyError } = await supabase
      .from('proyectos')
      .insert({
        nombre: nombre_negocio,
        descripcion: `Negocio de ${tipo_negocio} en ${ciudad}. Local en ${direccion_local}.`,
        tipo: 'A',
        sector: 'Comercio',
        ciudad,
        fundador_id: user.id,
        estado: 'activo',
        escenario: 'local_comercial',
        estado_financiacion: 'con_recursos',
        nivel_avance: 'tengo_la_idea',
      })
      .select()
      .single()

    if (proyError) throw proyError

    // 2. Crear registro local_comercial
    const { data: local, error: localError } = await supabase
      .from('proyectos_local_comercial')
      .insert({
        proyecto_id: proyecto.id,
        nombre_negocio,
        tipo_negocio,
        ciudad,
        direccion_local,
        propietario_nombre,
        propietario_telefono,
        propietario_correo: propietario_correo || null,
        canon_mensual: parseFloat(canon_mensual),
        meses_deposito: parseInt(meses_deposito),
        necesita_adecuacion: !!necesita_adecuacion,
        presupuesto_adecuacion: necesita_adecuacion ? parseFloat(presupuesto_adecuacion || 0) : 0,
        capital_total: capitalTotal,
        costo_servicios: parseFloat(costo_servicios || 0),
        costo_empleado: parseFloat(costo_empleado || 0),
        costo_otros: parseFloat(costo_otros || 0),
        total_fijos_mes: totalFijosMes,
        fijo_dia: fijoDia,
        costo_producto: parseFloat(costo_producto),
        precio_venta: parseFloat(precio_venta),
        margen_pct: Math.round(margenPct),
        ventas_dia_flojo: parseFloat(ventas_dia_flojo || 0),
        ventas_dia_normal: parseFloat(ventas_dia_normal),
        ventas_dia_bueno: parseFloat(ventas_dia_bueno || 0),
        fase_actual: 'repago',
        estado_verificacion: 'en_verificacion',
      })
      .select()
      .single()

    if (localError) {
      // Rollback: borrar proyecto si falla el local
      await supabase.from('proyectos').delete().eq('id', proyecto.id)
      throw localError
    }

    return NextResponse.json({
      ok: true,
      proyecto_id: proyecto.id,
      local_id: local.id,
      capital_total: capitalTotal,
    })

  } catch (err) {
    console.error('local-comercial POST error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
