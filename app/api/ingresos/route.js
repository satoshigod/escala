import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// GET — listar ingresos de un proyecto, ordenados por fecha descendente
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('ingresos')
    .select('*, perfiles:registrado_por ( nombre )')
    .eq('proyecto_id', proyecto_id)
    .order('fecha', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const total = (data || []).reduce((s, i) => s + Number(i.valor || 0), 0)
  return Response.json({ ingresos: data || [], total })
}

// POST — registrar un ingreso nuevo
// Solo puede hacerlo el fundador del proyecto o alguien con rol ejecutor/gerente aceptado
export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, registrado_por, descripcion, valor, fecha, tipo, comprobante } = body

  if (!proyecto_id || !registrado_por || !descripcion || !valor) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Verificar que quien registra es el fundador o tiene un rol de ejecución aceptado
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('fundador_id')
    .eq('id', proyecto_id)
    .single()

  const esFundador = proyecto?.fundador_id === registrado_por

  if (!esFundador) {
    // Buscar si tiene una postulación aceptada con rol de ejecutor/gerente en este proyecto
    const { data: posts } = await supabase
      .from('postulaciones')
      .select('estado, roles!inner ( nombre, proyecto_id )')
      .eq('postulante_id', registrado_por)
      .eq('estado', 'aceptada')
      .eq('roles.proyecto_id', proyecto_id)

    const tieneAcceso = (posts || []).some(p => {
      const nombre = (p.roles?.nombre || '').toLowerCase()
      return nombre.includes('gerente') || nombre.includes('ejecutor') || nombre.includes('admin') || nombre.includes('director')
    })

    if (!tieneAcceso) {
      return Response.json({ error: 'Solo el fundador, gerente o administrador puede registrar ingresos' }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from('ingresos')
    .insert([{
      proyecto_id,
      registrado_por,
      descripcion,
      valor: Number(valor),
      fecha: fecha || new Date().toISOString().split('T')[0],
      tipo: tipo || 'venta',
      comprobante: comprobante || null,
    }])
    .select('*, perfiles:registrado_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Verificar si es el primer ingreso del proyecto y notificar
  try {
    const { notificar } = await import('@/lib/notificaciones/notificar')
    const { count } = await supabase.from('ingresos').select('id', { count: 'exact', head: true }).eq('proyecto_id', proyecto_id)
    if (count === 1) { // Es el primero
      const { data: proyecto } = await supabase.from('proyectos').select('nombre, fundador_id, perfiles!proyectos_fundador_id_fkey(email, nombre)').eq('id', proyecto_id).single()
      if (proyecto?.perfiles?.email) {
        await notificar('primera_venta', {
          id: proyecto.fundador_id,
          email: proyecto.perfiles.email,
          nombre: proyecto.perfiles.nombre,
        }, {
          proyecto_nombre: proyecto.nombre,
          proyecto_id,
          valor_formateado: '$' + Number(data.valor || 0).toLocaleString('es-CO'),
        })
      }
    }
  } catch(e) {}

  return Response.json({ ingreso: data })
}

// DELETE — eliminar un ingreso (solo fundador)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const usuario_id = searchParams.get('usuario_id')
  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  // Verificar que el que borra es el fundador del proyecto
  const { data: ingreso } = await supabase
    .from('ingresos')
    .select('proyecto_id')
    .eq('id', id)
    .single()

  if (ingreso) {
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('fundador_id')
      .eq('id', ingreso.proyecto_id)
      .single()

    if (proyecto?.fundador_id !== usuario_id) {
      return Response.json({ error: 'Solo el fundador puede eliminar ingresos' }, { status: 403 })
    }
  }

  const { error } = await supabase.from('ingresos').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
