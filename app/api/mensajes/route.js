import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// Deriva la categoría de "Documentación" a partir del rol/categoría de la tarea
function categoriaDocumento(tarea) {
  const rol = (tarea?.rol_nombre || '').toLowerCase()
  if (rol.includes('contador') || rol.includes('contab')) return 'Contabilidad y Tributario'
  if (rol.includes('abogado') || rol.includes('legal')) return 'Legal'
  if (rol.includes('diseñador') || rol.includes('diseno')) return 'Diseño'
  if (rol.includes('desarrollador')) return 'Producto y Tecnología'
  return tarea?.categoria || 'General'
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const tarea_id = searchParams.get('tarea_id')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  let query = supabase
    .from('mensajes')
    .select('*, perfiles ( nombre, rol_principal, especialidad )')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: true })

  query = tarea_id ? query.eq('tarea_id', tarea_id) : query.is('tarea_id', null)

  const { data, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ mensajes: data })
}

export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, autor_id, contenido, tarea_id, adjuntos, es_sistema } = body

  if (!proyecto_id || !autor_id || !contenido) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert([{
      proyecto_id,
      autor_id,
      contenido,
      tarea_id: tarea_id || null,
      adjuntos: adjuntos || [],
      es_sistema: !!es_sistema,
    }])
    .select('*, perfiles ( nombre, rol_principal, especialidad )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Si el mensaje trae adjuntos y pertenece al hilo de una tarea, los guardamos
  // también de forma segmentada en la Documentación del proyecto — no solo en el chat.
  // Envuelto en try/catch por si la migración SQL aún no se ha corrido.
  if (tarea_id && Array.isArray(adjuntos) && adjuntos.length > 0) {
    try {
      const { data: tarea } = await supabase
        .from('tareas')
        .select('rol_nombre, categoria')
        .eq('id', tarea_id)
        .single()

      const categoria = categoriaDocumento(tarea)

      const registros = adjuntos.map(a => ({
        proyecto_id,
        tarea_id,
        mensaje_id: data.id,
        categoria,
        nombre: a.nombre_original || a.nombre || 'Documento',
        url: a.url,
        tipo: a.tipo || null,
        tamano_mb: a.tamano_mb || null,
        subido_por: autor_id,
      }))

      await supabase.from('documentos_proyecto').insert(registros)
    } catch (e) {
      console.error('[mensajes] Error guardando en documentos_proyecto:', e.message)
    }
  }

  return Response.json({ mensaje: data }, { status: 201 })
}
