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
  const { id, nombre, ciudad, pais, whatsapp, rol_principal, especialidad, lo_que_aporto, lo_que_busco } = body

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { data, error } = await supabase
    .from('perfiles')
    .update({ nombre, ciudad, pais: pais || null, whatsapp, rol_principal, especialidad, lo_que_aporto, lo_que_busco })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ usuario: data })
}
