// app/api/cierre/route.js
// GET  — obtiene el estado del cierre de un proyecto (checklist, resumen)
// POST — inicia el proceso de cierre formal
// PUT  — confirma el cierre (fundador) o acepta (especialistas/angeles)

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('id, nombre, estado, fundador_id, created_at, sector, ciudad')
      .eq('id', proyecto_id).single()

    if (!proyecto) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })

    // Checklist de cierre
    const { data: hitos } = await supabase
      .from('hitos')
      .select('id, nombre, estado')
      .eq('proyecto_id', proyecto_id)

    const { data: tareas } = await supabase
      .from('tareas')
      .select('id, nombre, estado')
      .eq('proyecto_id', proyecto_id)

    const { data: contratos } = await supabase
      .from('contratos')
      .select('id, especialista_id, estado, rol_nombre, perfiles!especialista_id(nombre)')
      .eq('proyecto_id', proyecto_id)

    const { data: repartos } = await supabase
      .from('repartos')
      .select('id, monto_total, estado')
      .eq('proyecto_id', proyecto_id)

    const { data: fondeos } = await supabase
      .from('presupuesto_fondeos')
      .select('id, monto, estado, a_cambio_de, inversionista_id, perfiles!inversionista_id(nombre)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'verificado')

    const hitos_total = (hitos || []).length
    const hitos_completados = (hitos || []).filter(h => h.estado === 'completado').length
    const tareas_total = (tareas || []).length
    const tareas_completadas = (tareas || []).filter(t => t.estado === 'completado' || t.estado === 'verificada').length
    const total_ingresos = (repartos || []).reduce((s, r) => s + parseFloat(r.monto_total || 0), 0)
    const contratos_activos = (contratos || []).filter(c => c.estado === 'activo')

    const checklist = [
      {
        id: 'hitos',
        label: 'Hitos del proyecto',
        ok: hitos_total > 0 && hitos_completados === hitos_total,
        detalle: `${hitos_completados}/${hitos_total} completados`,
        bloqueante: false,
      },
      {
        id: 'tareas',
        label: 'Tareas completadas',
        ok: tareas_total === 0 || (tareas_completadas / tareas_total) >= 0.8,
        detalle: `${tareas_completadas}/${tareas_total} completadas`,
        bloqueante: false,
      },
      {
        id: 'contratos',
        label: 'Contratos con especialistas',
        ok: contratos_activos.length === 0,
        detalle: contratos_activos.length > 0 ? `${contratos_activos.length} contratos activos pendientes de liquidar` : 'Sin contratos activos pendientes',
        bloqueante: false,
      },
      {
        id: 'fondeos',
        label: 'Inversiones registradas',
        ok: true,
        detalle: `${(fondeos || []).length} inversiones activas quedarán con participación registrada`,
        bloqueante: false,
      },
    ]

    return NextResponse.json({
      ok: true,
      proyecto,
      checklist,
      resumen: {
        hitos_completados,
        hitos_total,
        tareas_completadas,
        tareas_total,
        total_ingresos,
        contratos_activos: contratos_activos.length,
        inversiones_activas: (fondeos || []).length,
        participantes: contratos_activos.map(c => ({ id: c.especialista_id, nombre: c.perfiles?.nombre, rol: c.rol_nombre })),
        inversores: (fondeos || []).map(f => ({ id: f.inversionista_id, nombre: f.perfiles?.nombre, monto: f.monto, modelo: f.a_cambio_de })),
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

    const { proyecto_id, motivo_cierre, tipo_cierre } = await req.json()
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('fundador_id, nombre, estado')
      .eq('id', proyecto_id).single()

    if (proyecto?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Solo el fundador puede iniciar el cierre' }, { status: 403 })
    }
    if (proyecto?.estado === 'cerrado') {
      return NextResponse.json({ error: 'El proyecto ya está cerrado' }, { status: 400 })
    }

    // Cambiar estado a 'completado' primero
    await supabase.from('proyectos').update({
      estado: 'completado',
      updated_at: new Date().toISOString(),
    }).eq('id', proyecto_id)

    // Cerrar todos los contratos activos
    await supabase.from('contratos').update({
      estado: 'completado',
      updated_at: new Date().toISOString(),
    }).eq('proyecto_id', proyecto_id).eq('estado', 'activo')

    // Obtener participantes para notificar
    const { data: contratos } = await supabase
      .from('contratos')
      .select('especialista_id, perfiles!especialista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)

    const { data: fondeos } = await supabase
      .from('presupuesto_fondeos')
      .select('inversionista_id, perfiles!inversionista_id(id, nombre, email)')
      .eq('proyecto_id', proyecto_id)
      .eq('estado', 'verificado')

    const notificados = new Set()

    // Notificar a especialistas
    for (const c of (contratos || [])) {
      if (c.perfiles && !notificados.has(c.especialista_id)) {
        notificados.add(c.especialista_id)
        await notificar('proyecto_completado', {
          id: c.perfiles.id, email: c.perfiles.email
        }, {
          proyecto_nombre: proyecto.nombre,
          proyecto_id,
          motivo: motivo_cierre || 'Proyecto completado exitosamente',
        }).catch(() => {})
      }
    }

    // Notificar a ángeles inversionistas
    for (const f of (fondeos || [])) {
      if (f.perfiles && !notificados.has(f.inversionista_id)) {
        notificados.add(f.inversionista_id)
        await notificar('proyecto_completado', {
          id: f.perfiles.id, email: f.perfiles.email
        }, {
          proyecto_nombre: proyecto.nombre,
          proyecto_id,
          motivo: motivo_cierre || 'Proyecto completado exitosamente',
        }).catch(() => {})
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Proceso de cierre iniciado. El proyecto quedará en estado completado.',
      notificados: notificados.size,
    })
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

    const { proyecto_id } = await req.json()
    if (!proyecto_id) return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })

    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('fundador_id, nombre, estado')
      .eq('id', proyecto_id).single()

    if (proyecto?.fundador_id !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // Cierre definitivo
    await supabase.from('proyectos').update({
      estado: 'cerrado',
      updated_at: new Date().toISOString(),
    }).eq('id', proyecto_id)

    return NextResponse.json({ ok: true, mensaje: 'Proyecto cerrado formalmente.' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
