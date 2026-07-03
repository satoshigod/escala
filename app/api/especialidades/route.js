import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — listar especialidades/roles
// ?aprobado=true → solo aprobadas
// ?pendientes=true → solo pendientes de aprobación (admin-escala)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const soloAprobadas = searchParams.get('aprobado') === 'true'
  const soloPendientes = searchParams.get('pendientes') === 'true'

  let query = supabase
    .from('especialidades')
    .select('id, nombre, categoria, aprobado, propuesto_por, created_at, perfiles:propuesto_por ( nombre )')
    .order('categoria')
    .order('nombre')

  if (soloAprobadas) query = query.eq('aprobado', true)
  if (soloPendientes) query = query.eq('aprobado', false)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ especialidades: data })
}

// POST — proponer o crear especialidad/rol
// propuesto_por presente → propuesta del fundador (aprobado=false hasta admin)
// sin propuesto_por → creación directa desde admin-escala (aprobado=true)
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, categoria, creado_por, propuesto_por } = body

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'Falta nombre' }, { status: 400 })
    }

    const nombreLimpio = nombre.trim()
    const { data: existente } = await supabase
      .from('especialidades')
      .select('id, nombre, categoria, aprobado')
      .ilike('nombre', nombreLimpio)
      .maybeSingle()

    if (existente) return Response.json({ especialidad: existente, existia: true })

    const esPropuesta = !!propuesto_por
    const { data: nueva, error: err } = await supabase
      .from('especialidades')
      .insert({
        nombre: nombreLimpio,
        categoria: categoria || 'General',
        aprobado: !esPropuesta,
        propuesto_por: propuesto_por || null,
        creado_por: creado_por || propuesto_por || null,
      })
      .select('id, nombre, categoria, aprobado, propuesto_por')
      .single()

    if (err) return Response.json({ error: err.message }, { status: 500 })
    return Response.json({ especialidad: nueva, existia: false }, { status: 201 })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — aprobar o rechazar propuesta (admin-escala)
export async function PATCH(request) {
  const body = await request.json()
  const { id, aprobado } = body
  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const { data, error } = await supabase
    .from('especialidades')
    .update({ aprobado: aprobado ?? true })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ especialidad: data })
}
