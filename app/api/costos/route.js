import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// GET — listar costos de un proyecto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('costos_proyecto')
    .select('*, cubierto_perfil:cubierto_por ( nombre, especialidad, ciudad )')
    .eq('proyecto_id', proyecto_id)
    .order('estado', { ascending: true }) // pendientes primero
    .order('valor', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ costos: data || [] })
}

// POST — crear costo individual O inicializar costos predefinidos por país
export async function POST(request) {
  const body = await request.json()

  // Inicialización masiva de costos predefinidos por país
  if (body.inicializar_pais) {
    const { proyecto_id, pais, creado_por } = body
    if (!proyecto_id || !pais) return Response.json({ error: 'Faltan proyecto_id o pais' }, { status: 400 })

    // Verificar si ya tiene costos para no duplicar
    const { data: existentes } = await supabase
      .from('costos_proyecto')
      .select('id')
      .eq('proyecto_id', proyecto_id)
      .limit(1)

    if (existentes && existentes.length > 0) {
      return Response.json({ ok: true, mensaje: 'Ya tiene costos inicializados', cargados: 0 })
    }

    // Obtener predefinidos del país
    const { data: predefinidos, error: errorPred } = await supabase
      .from('costos_predefinidos')
      .select('*')
      .eq('pais', pais)
      .order('orden', { ascending: true })

    if (errorPred) return Response.json({ error: errorPred.message }, { status: 500 })
    if (!predefinidos || predefinidos.length === 0) {
      return Response.json({ ok: true, mensaje: 'No hay costos predefinidos para ' + pais, cargados: 0 })
    }

    // Insertar todos los costos predefinidos
    const costosAInsertar = predefinidos.map(p => ({
      proyecto_id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      valor: p.valor,
      periodicidad: p.periodicidad,
      estado: 'pendiente',
      creado_por: creado_por || null
    }))

    const { data: insertados, error: errorIns } = await supabase
      .from('costos_proyecto')
      .insert(costosAInsertar)
      .select()

    if (errorIns) return Response.json({ error: errorIns.message }, { status: 500 })
    return Response.json({ ok: true, cargados: insertados.length, costos: insertados })
  }

  // Creación individual de costo
  const { proyecto_id, nombre, descripcion, categoria, valor, periodicidad, creado_por } = body
  if (!proyecto_id || !nombre || valor === undefined) return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })

  const { data, error } = await supabase
    .from('costos_proyecto')
    .insert({
      proyecto_id,
      nombre,
      descripcion: descripcion || null,
      categoria: categoria || 'operativo',
      valor: parseInt(valor),
      periodicidad: periodicidad || 'unico',
      estado: 'pendiente',
      creado_por: creado_por || null
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ costo: data })
}

// PATCH — actualizar costo (financiar, editar, cambiar estado)
export async function PATCH(request) {
  const body = await request.json()
  const { id, estado, cubierto_por, aporte_id, nombre, descripcion, categoria, valor, periodicidad } = body

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const updates = {}
  if (estado !== undefined) updates.estado = estado
  if (cubierto_por !== undefined) updates.cubierto_por = cubierto_por
  if (aporte_id !== undefined) updates.aporte_id = aporte_id
  if (nombre !== undefined) updates.nombre = nombre
  if (descripcion !== undefined) updates.descripcion = descripcion
  if (categoria !== undefined) updates.categoria = categoria
  if (valor !== undefined) updates.valor = parseInt(valor)
  if (periodicidad !== undefined) updates.periodicidad = periodicidad

  const { data, error } = await supabase
    .from('costos_proyecto')
    .update(updates)
    .eq('id', id)
    .select('*, cubierto_perfil:cubierto_por ( nombre, especialidad, ciudad )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ costo: data })
}

// DELETE — eliminar costo (solo si está pendiente)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { error } = await supabase
    .from('costos_proyecto')
    .delete()
    .eq('id', id)
    .eq('estado', 'pendiente') // solo se puede borrar si está pendiente

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
