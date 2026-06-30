import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — listar proyectos activos
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const sector = searchParams.get('sector')

  let query = supabase
    .from('proyectos')
    .select(`
      *,
      perfiles ( nombre, ciudad ),
      roles ( id, nombre, estado, es_prioritario, tipo_aporte )
    `)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (sector) query = query.eq('sector', sector)

  const { data, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyectos: data })
}

// POST — crear nuevo proyecto
export async function POST(request) {
  const body = await request.json()
  const { nombre, descripcion, tipo, sector, ciudad, fundador_id, industria, pais, estado } = body

  if (!nombre || !descripcion || !tipo || !fundador_id) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ nombre, descripcion, tipo, sector, ciudad, fundador_id, industria: industria || null, pais: pais || null, estado: estado || 'activo' }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyecto: data }, { status: 201 })
}
