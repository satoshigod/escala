import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — listar todas las categorías disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ categorias: data })
}

// POST — crear nueva categoría desde el cliente
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre } = body

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'Falta nombre de la categoría' }, { status: 400 })
    }

    const nombreLimpio = nombre.trim()

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

    const { data: nuevaCat, error: errorInsert } = await supabase
      .from('categorias')
      .insert([{ nombre: nombreLimpio }])
      .select()
      .single()

    if (errorInsert) {
      return Response.json({ error: 'Error creando categoría: ' + errorInsert.message }, { status: 500 })
    }

    return Response.json({ categoria: nuevaCat, existia: false }, { status: 201 })

  } catch (e) {
    return Response.json({ error: 'Error inesperado: ' + e.message }, { status: 500 })
  }
}
