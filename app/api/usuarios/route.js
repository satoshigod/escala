import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — obtener perfil de usuario con métricas calculadas (por id), o buscar id por email
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const email = searchParams.get('email')

  if (email && !id) {
    const { data, error } = await supabase.from('perfiles').select('id, nombre, email').eq('email', email).maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ usuario: data || null })
  }

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const [perfilRes, aportesRes, postulacionesRes] = await Promise.all([
    supabase.from('perfiles').select('*, proyectos ( id, nombre, estado, tipo )').eq('id', id).single(),
    supabase.from('aportes').select('tipo, valor, validado').eq('aportante_id', id),
    supabase.from('postulaciones').select('estado, roles ( nombre, proyecto_id )').eq('postulante_id', id)
  ])

  if (perfilRes.error) return Response.json({ error: perfilRes.error.message }, { status: 500 })

  const aportes = aportesRes.data || []
  const postulaciones = postulacionesRes.data || []

  const horasAportadas = aportes.filter(a => a.tipo === 'horas').reduce((s, a) => s + (a.valor || 0), 0)
  const valorGenerado = aportes.filter(a => a.validado).reduce((s, a) => s + (a.valor || 0), 0)
  const participacionesActivas = postulaciones.filter(p => p.estado === 'aceptada').length
  const empresasParticipa = [...new Set(postulaciones.filter(p => p.estado === 'aceptada').map(p => p.roles?.proyecto_id).filter(Boolean))].length

  return Response.json({
    usuario: {
      ...perfilRes.data,
      metricas: { horasAportadas, valorGenerado, participacionesActivas, empresasParticipa }
    }
  })
}

// PATCH — actualizar perfil
export async function PATCH(request) {
  const body = await request.json()
  const { id, nombre, ciudad, pais, whatsapp, rol_principal, especialidad, lo_que_aporto, lo_que_busco, idiomas, disponibilidad, reconocimientos,
    cert_tarjeta_profesional_url, cert_jcc_url } = body

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const updatePayload = {
    nombre, ciudad, pais: pais || null, whatsapp, rol_principal, especialidad,
    lo_que_aporto, lo_que_busco, idiomas: idiomas || null,
    disponibilidad: disponibilidad || null, reconocimientos: reconocimientos || null,
  }
  if (cert_tarjeta_profesional_url !== undefined) updatePayload.cert_tarjeta_profesional_url = cert_tarjeta_profesional_url || null
  if (cert_jcc_url !== undefined) updatePayload.cert_jcc_url = cert_jcc_url || null

  const { data, error } = await supabase
    .from('perfiles')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Auto-otorgar badge cuando se sube un documento de certificación
  if (cert_tarjeta_profesional_url) {
    await supabase.from('logros_usuario').upsert(
      { usuario_id: id, tipo: 'cert_tarjeta_profesional', proyecto_id: null },
      { onConflict: 'usuario_id,tipo', ignoreDuplicates: true }
    )
    await supabase.rpc('calcular_escala_score', { perfil_uuid: id }).catch(() => {})
  }
  if (cert_jcc_url) {
    await supabase.from('logros_usuario').upsert(
      { usuario_id: id, tipo: 'cert_jcc', proyecto_id: null },
      { onConflict: 'usuario_id,tipo', ignoreDuplicates: true }
    )
    await supabase.rpc('calcular_escala_score', { perfil_uuid: id }).catch(() => {})
  }

  return Response.json({ usuario: data })
}

// DELETE — eliminar usuario completo: perfil, postulaciones, tareas asignadas y cuenta de auth
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  try {
    // Desasignar (no borrar) tareas que tenía asignadas, para no romper el historial del proyecto
    await supabase.from('tareas').update({ asignado_a: null }).eq('asignado_a', id)

    // Borrar postulaciones del usuario
    await supabase.from('postulaciones').delete().eq('postulante_id', id)

    // Borrar mensajes enviados por el usuario
    await supabase.from('mensajes').delete().eq('remitente_id', id)

    // Borrar aportes del usuario
    await supabase.from('aportes').delete().eq('aportante_id', id)

    // Borrar el perfil
    const { error: errorPerfil } = await supabase.from('perfiles').delete().eq('id', id)
    if (errorPerfil) return Response.json({ error: 'Error borrando perfil: ' + errorPerfil.message }, { status: 500 })

    // Borrar la cuenta de autenticación (Supabase Auth) — requiere permisos de admin (service role)
    const { error: errorAuth } = await supabase.auth.admin.deleteUser(id)
    if (errorAuth) {
      // El perfil ya se borró; informamos que el auth falló pero no es bloqueante
      return Response.json({ ok: true, advertencia: 'Perfil eliminado, pero la cuenta de login no pudo borrarse: ' + errorAuth.message })
    }

    return Response.json({ ok: true, eliminado: id })
  } catch (e) {
    return Response.json({ error: 'Error eliminando usuario: ' + e.message }, { status: 500 })
  }
}
