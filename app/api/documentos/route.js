import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — lista los documentos de un proyecto, opcionalmente filtrados por categoría o tarea
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const categoria = searchParams.get('categoria')
  const tarea_id = searchParams.get('tarea_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  let query = supabase
    .from('documentos_proyecto')
    .select('*, subido_perfil:subido_por ( nombre ), tarea:tarea_id ( nombre )')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: false })

  if (categoria) query = query.eq('categoria', categoria)
  if (tarea_id) query = query.eq('tarea_id', tarea_id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const documentos = data || []
  const porCategoria = {}
  for (const d of documentos) {
    if (!porCategoria[d.categoria]) porCategoria[d.categoria] = []
    porCategoria[d.categoria].push(d)
  }

  return Response.json({ documentos, por_categoria: porCategoria })
}

// POST — registra manualmente un documento ya subido (fuera del flujo de chat de tareas)
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, tarea_id, categoria, nombre, url, tipo, tamano_mb, subido_por } = body

  if (!proyecto_id || !nombre || !url) {
    return Response.json({ error: 'Faltan campos requeridos (proyecto_id, nombre, url)' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('documentos_proyecto')
    .insert([{
      proyecto_id,
      tarea_id: tarea_id || null,
      categoria: categoria || 'General',
      nombre,
      url,
      tipo: tipo || null,
      tamano_mb: tamano_mb || null,
      subido_por: subido_por || null,
    }])
    .select('*, subido_perfil:subido_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ documento: data }, { status: 201 })
}

// DELETE — elimina un registro de documento (no borra el archivo del storage, solo el índice)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { error } = await supabase.from('documentos_proyecto').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
