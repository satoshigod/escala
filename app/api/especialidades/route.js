import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — listar todas las especialidades disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('especialidades')
    .select('id, nombre, categoria, creado_por, created_at, perfiles:creado_por ( nombre )')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ especialidades: data })
}

// POST — crear nueva especialidad desde el cliente
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, categoria, creado_por } = body

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'Falta nombre de la especialidad' }, { status: 400 })
    }

    const nombreLimpio = nombre.trim()
    const creadoPorLimpio = (creado_por && typeof creado_por === 'string' && creado_por.length > 0) ? creado_por : null

    const { data: existente, error: errorBusqueda } = await supabase
      .from('especialidades')
      .select('id, nombre, categoria')
      .ilike('nombre', nombreLimpio)
      .maybeSingle()

    if (errorBusqueda) {
      return Response.json({ error: 'Error buscando especialidad: ' + errorBusqueda.message }, { status: 500 })
    }

    if (existente) {
      return Response.json({ especialidad: existente, existia: true })
    }

    const payloadInsert = { nombre: nombreLimpio, categoria: categoria || 'General', creado_por: creadoPorLimpio }

    const { data: nuevaEsp, error: errorInsert } = await supabase
      .from('especialidades')
      .insert(payloadInsert)
      .select('id, nombre, categoria, creado_por, created_at')
      .single()

    if (errorInsert) {
      return Response.json({ error: 'Error creando especialidad: ' + errorInsert.message }, { status: 500 })
    }

    return Response.json({ especialidad: nuevaEsp, existia: false }, { status: 201 })

  } catch (e) {
    return Response.json({ error: 'Error inesperado: ' + e.message }, { status: 500 })
  }
}
