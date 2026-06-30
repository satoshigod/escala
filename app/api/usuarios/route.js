import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — obtener perfil de usuario
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { data, error } = await supabase
    .from('perfiles')
    .select(`
      *,
      proyectos ( id, nombre, estado, tipo )
    `)
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ usuario: data })
}

// PATCH — actualizar perfil
export async function PATCH(request) {
  const body = await request.json()
  const { id, nombre, ciudad, pais, whatsapp, rol_principal, especialidad, lo_que_aporto, lo_que_busco, idiomas, disponibilidad, reconocimientos } = body

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { data, error } = await supabase
    .from('perfiles')
    .update({ nombre, ciudad, pais: pais || null, whatsapp, rol_principal, especialidad, lo_que_aporto, lo_que_busco, idiomas: idiomas || null, disponibilidad: disponibilidad || null, reconocimientos: reconocimientos || null })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
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
