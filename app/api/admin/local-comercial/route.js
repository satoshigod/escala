// app/api/admin/local-comercial/route.js
// GET — lista proyectos local_comercial en verificacion
// POST — aprobar o rechazar un proyecto + asignar tasa

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const ADMIN_IDS = [
  'a57b6849-1388-4186-8880-2ec31dd31af5', // Ivan Correa — fundador Escala
]

async function verificarAdmin(token) {
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  if (!ADMIN_IDS.includes(user.id)) return null
  return user
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const admin = await verificarAdmin(authHeader.replace('Bearer ', ''))
    if (!admin) return NextResponse.json({ error: 'Solo administradores de Escala' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado') || 'en_verificacion'

    const { data: locales } = await supabase
      .from('proyectos_local_comercial')
      .select(`
        *,
        proyectos!inner(id, nombre, ciudad, fundador_id, created_at,
          perfiles:fundador_id(id, nombre, email, avatar_url)
        )
      `)
      .eq('estado_verificacion', estado)
      .order('created_at', { ascending: true })

    return NextResponse.json({ ok: true, locales: locales || [], total: (locales || []).length })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const admin = await verificarAdmin(authHeader.replace('Bearer ', ''))
    if (!admin) return NextResponse.json({ error: 'Solo administradores de Escala' }, { status: 403 })

    const { local_id, accion, tasa_mensual, motivo_rechazo } = await req.json()
    if (!local_id || !accion) return NextResponse.json({ error: 'local_id y accion requeridos' }, { status: 400 })
    if (!['aprobar', 'rechazar'].includes(accion)) return NextResponse.json({ error: 'accion debe ser aprobar o rechazar' }, { status: 400 })

    // Obtener datos del local
    const { data: local } = await supabase
      .from('proyectos_local_comercial')
      .select('*, proyectos(fundador_id, nombre)')
      .eq('id', local_id)
      .single()

    if (!local) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 })

    if (accion === 'aprobar') {
      if (!tasa_mensual || tasa_mensual <= 0) return NextResponse.json({ error: 'tasa_mensual requerida para aprobar' }, { status: 400 })

      await supabase
        .from('proyectos_local_comercial')
        .update({
          estado_verificacion: 'aprobado',
          tasa_mensual: parseFloat(tasa_mensual),
          verificado_por: admin.id,
          verificado_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', local_id)

      // Notificar al fundador
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('id, email, nombre')
        .eq('id', local.proyectos.fundador_id)
        .single()

      if (perfil) {
        await notificar('local_verificacion_aprobada', { id: perfil.id, email: perfil.email }, {
          nombre_negocio: local.nombre_negocio,
          proyecto_id: local.proyecto_id,
          tasa_mensual,
        })
      }

      return NextResponse.json({ ok: true, mensaje: `Proyecto aprobado con tasa ${tasa_mensual}% mensual` })

    } else {
      if (!motivo_rechazo) return NextResponse.json({ error: 'motivo_rechazo requerido' }, { status: 400 })

      await supabase
        .from('proyectos_local_comercial')
        .update({
          estado_verificacion: 'rechazado',
          motivo_rechazo,
          verificado_por: admin.id,
          verificado_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', local_id)

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('id, email, nombre')
        .eq('id', local.proyectos.fundador_id)
        .single()

      if (perfil) {
        await notificar('local_verificacion_rechazada', { id: perfil.id, email: perfil.email }, {
          nombre_negocio: local.nombre_negocio,
          proyecto_id: local.proyecto_id,
          motivo: motivo_rechazo,
        })
      }

      return NextResponse.json({ ok: true, mensaje: 'Proyecto rechazado y operador notificado' })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
