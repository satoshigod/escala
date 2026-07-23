// app/api/calificaciones/route.js
//
// GET  ?usuario_id=X           — calificaciones recibidas por un usuario
// GET  ?proyecto_id=X&de_id=Y  — si el usuario ya calificó en ese proyecto
// POST                         — crear una calificación nueva

import { notificar } from '@/lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  const proyecto_id = searchParams.get('proyecto_id')
  const de_id = searchParams.get('de_id')

  // Verificar si ya calificó en este proyecto
  if (proyecto_id && de_id) {
    const { data } = await supabase
      .from('calificaciones')
      .select('id, estrellas')
      .eq('proyecto_id', proyecto_id)
      .eq('de_usuario_id', de_id)
      .maybeSingle()
    return Response.json({ ya_califico: !!data, calificacion: data })
  }

  // Calificaciones recibidas por un usuario
  if (usuario_id) {
    const { data, error } = await supabase
      .from('calificaciones')
      .select(`
        id, estrellas, comentario, tipo, created_at,
        proyectos ( nombre ),
        perfiles!calificaciones_de_usuario_id_fkey ( nombre, rol_principal )
      `)
      .eq('a_usuario_id', usuario_id)
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })

    const promedio = data?.length
      ? (data.reduce((s, c) => s + c.estrellas, 0) / data.length).toFixed(1)
      : null

    return Response.json({ calificaciones: data || [], promedio, total: data?.length || 0 })
  }

  return Response.json({ error: 'Falta usuario_id o proyecto_id' }, { status: 400 })
}

export async function POST(request) {
  try {
    const { proyecto_id, de_usuario_id, a_usuario_id, estrellas, comentario, tipo } = await request.json()

    if (!proyecto_id || !de_usuario_id || !a_usuario_id || !estrellas || !tipo) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (de_usuario_id === a_usuario_id) {
      return Response.json({ error: 'No puedes calificarte a ti mismo' }, { status: 400 })
    }

    // Verificar que no haya calificado ya
    const { data: existe } = await supabase
      .from('calificaciones')
      .select('id')
      .eq('proyecto_id', proyecto_id)
      .eq('de_usuario_id', de_usuario_id)
      .eq('a_usuario_id', a_usuario_id)
      .maybeSingle()

    if (existe) {
      return Response.json({ error: 'Ya calificaste a esta persona en este proyecto' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('calificaciones')
      .insert({ proyecto_id, de_usuario_id, a_usuario_id, estrellas, comentario, tipo })
      .select('id')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Notificar al calificado
    const { data: perfilDe } = await supabase
      .from('perfiles').select('nombre').eq('id', de_usuario_id).single()
    const { data: perfilA } = await supabase
      .from('perfiles').select('id, email, nombre').eq('id', a_usuario_id).single()
    const { data: proyecto } = await supabase
      .from('proyectos').select('nombre').eq('id', proyecto_id).single()

    if (perfilA?.email) {
      await notificar('nueva_calificacion', {
        id: perfilA.id,
        email: perfilA.email,
        nombre: perfilA.nombre,
      }, {
        de_nombre: perfilDe?.nombre || 'Un colaborador',
        proyecto_nombre: proyecto?.nombre || 'un proyecto',
        estrellas,
        proyecto_id,
      }).catch(() => {}) // no bloquear si falla
    }

    // Otorgar logro si aplica
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('supabase.co', 'supabase.co')}/api/logros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: a_usuario_id, tipo: 'primera_calificacion_recibida', proyecto_id })
    }).catch(() => {})

    return Response.json({ ok: true, id: data.id })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
