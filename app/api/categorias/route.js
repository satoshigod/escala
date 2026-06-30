import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — listar todas las categorías disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, creado_por, created_at, perfiles:creado_por ( nombre )')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ categorias: data })
}

// POST — crear nueva categoría desde el cliente
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, creado_por } = body

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'Falta nombre de la categoría' }, { status: 400 })
    }

    const nombreLimpio = nombre.trim()
    const creadoPorLimpio = (creado_por && typeof creado_por === 'string' && creado_por.length > 0) ? creado_por : null

    const { data: existente, error: errorBusqueda } = await supabase
      .from('categorias')
      .select('id, nombre')
      .ilike('nombre', nombreLimpio)
      .maybeSingle()

    if (errorBusqueda) {
      return Response.json({ error: 'Error buscando categoría: ' + errorBusqueda.message }, { status: 500 })
    }

    if (existente) {
      return Response.json({ categoria: existente, existia: true })
    }

    const payloadInsert = { nombre: nombreLimpio, creado_por: creadoPorLimpio }

    const { data: nuevaCat, error: errorInsert } = await supabase
      .from('categorias')
      .insert(payloadInsert)
      .select('id, nombre, creado_por, created_at')
      .single()

    if (errorInsert) {
      return Response.json({ error: 'Error creando categoría: ' + errorInsert.message, debug_payload: payloadInsert }, { status: 500 })
    }

    return Response.json({ categoria: nuevaCat, existia: false, debug_payload_enviado: payloadInsert, debug_creado_por_recibido_del_body: creado_por }, { status: 201 })

  } catch (e) {
    return Response.json({ error: 'Error inesperado: ' + e.message }, { status: 500 })
  }
}
