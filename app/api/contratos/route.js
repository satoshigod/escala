import { createClient } from '@supabase/supabase-js'
import { generarContenidoContrato, generarTextoPDF } from '../../../lib/generadorContrato'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — contratos de un proyecto o de un profesional
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const profesional_id = searchParams.get('profesional_id')
  const postulacion_id = searchParams.get('postulacion_id')

  let query = supabase
    .from('contratos')
    .select('*, proyectos:proyecto_id(nombre, pais, ciudad, sector, descripcion, estado_financiacion), perfiles_fundador:fundador_id(nombre, email), perfiles_profesional:profesional_id(nombre, email)')
    .order('created_at', { ascending: false })

  if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)
  if (profesional_id) query = query.eq('profesional_id', profesional_id)
  if (postulacion_id) query = query.eq('postulacion_id', postulacion_id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contratos: data || [] })
}

// POST — generar contrato al aceptar una postulación
export async function POST(request) {
  const body = await request.json()
  const { postulacion_id, fundador_id } = body

  if (!postulacion_id || !fundador_id) {
    return Response.json({ error: 'Faltan campos' }, { status: 400 })
  }

  // Verificar que no exista ya un contrato para esta postulación
  const { data: existente } = await supabase
    .from('contratos')
    .select('id')
    .eq('postulacion_id', postulacion_id)
    .maybeSingle()

  if (existente) return Response.json({ contrato: existente, existia: true })

  // Cargar todos los datos necesarios para generar el contrato
  const { data: post } = await supabase
    .from('postulaciones')
    .select('*, roles:rol_id(*, proyectos:proyecto_id(*)), perfiles:postulante_id(*)')
    .eq('id', postulacion_id)
    .single()

  if (!post) return Response.json({ error: 'Postulación no encontrada' }, { status: 404 })

  const proyecto = post.roles?.proyectos
  const profesional = post.perfiles
  const rol = post.roles

  // Cargar datos del fundador
  const { data: fundador } = await supabase
    .from('perfiles')
    .select('nombre, email')
    .eq('id', fundador_id)
    .single()

  // Cargar tareas del país para esta especialidad/sub-especialidad
  let pais_tareas = []
  if (proyecto?.pais && rol?.sub_especialidad) {
    const { data: paisData } = await supabase
      .from('paises_regulatorios')
      .select('tareas')
      .eq('nombre', proyecto.pais)
      .single()

    const todasTareas = paisData?.tareas || []
    const rolNombre = (rol.nombre || '').toLowerCase()
    const esAbogado = ['abogado', 'legal', 'jurídico'].some(r => rolNombre.includes(r))
    const esContador = ['contador', 'contable', 'contabilidad', 'tributario'].some(r => rolNombre.includes(r))

    if (esAbogado) pais_tareas = todasTareas.filter(t => t.rol_nombre === 'abogado')
    if (esContador) pais_tareas = todasTareas.filter(t => t.rol_nombre === 'contador')
  }

  // Generar el contenido estructurado del contrato
  const contenido = generarContenidoContrato({
    proyecto,
    profesional,
    fundador,
    rol,
    postulacion: post,
    pais_tareas,
  })

  const textoPDF = generarTextoPDF(contenido)

  // Guardar el contrato en la base de datos
  const { data: contrato, error } = await supabase
    .from('contratos')
    .insert([{
      proyecto_id: proyecto?.id,
      postulacion_id,
      rol_id: rol?.id,
      fundador_id,
      profesional_id: post.postulante_id,
      modalidad: proyecto?.estado_financiacion || 'riesgo_compartido',
      valor: rol?.valor_mercado || 0,
      sub_especialidad: rol?.sub_especialidad || null,
      estado: 'pendiente_firma',
      contenido_json: { ...contenido, texto_pdf: textoPDF },
    }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contrato, existia: false }, { status: 201 })
}

// PATCH — confirmar firma (fundador o profesional)
export async function PATCH(request) {
  const body = await request.json()
  const { id, firmante, tipo } = body // tipo: 'fundador' | 'profesional'

  if (!id || !tipo) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const updates = {}
  if (tipo === 'fundador') {
    updates.firmado_fundador = true
    updates.fecha_firma_fundador = new Date().toISOString()
  } else {
    updates.firmado_profesional = true
    updates.fecha_firma_profesional = new Date().toISOString()
  }

  // Verificar si el otro ya firmó para actualizar estado
  const { data: actual } = await supabase.from('contratos').select('firmado_fundador, firmado_profesional').eq('id', id).single()
  const ambosFirmaron = (tipo === 'fundador' && actual?.firmado_profesional) || (tipo === 'profesional' && actual?.firmado_fundador)
  if (ambosFirmaron) updates.estado = 'vigente'
  else updates.estado = 'firmado_parcial'

  const { data, error } = await supabase
    .from('contratos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contrato: data })
}
