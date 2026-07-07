import { createClient } from '@supabase/supabase-js'
import { generarContenidoContrato, generarTextoPDF } from '../../../lib/generadorContrato'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — contratos de un proyecto, profesional o postulacion
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const profesional_id = searchParams.get('profesional_id')
  const postulacion_id = searchParams.get('postulacion_id')
  const especialista_id = searchParams.get('especialista_id')

  let query = supabase
    .from('contratos')
    .select(`
      *,
      proyectos:proyecto_id(nombre, pais, ciudad, sector, descripcion, estado_financiacion),
      perfil_fundador:fundador_id(nombre, email),
      perfil_profesional:profesional_id(nombre, email),
      roles:rol_id(nombre, sub_especialidad, valor_mercado, modalidad)
    `)
    .order('created_at', { ascending: false })

  if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)
  if (profesional_id) query = query.eq('profesional_id', profesional_id)
  if (especialista_id) query = query.eq('profesional_id', especialista_id)
  if (postulacion_id) query = query.eq('postulacion_id', postulacion_id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contratos: data || [] })
}

// POST — generar contrato al aceptar una postulacion
export async function POST(request) {
  const body = await request.json()
  const { postulacion_id, fundador_id } = body

  if (!postulacion_id || !fundador_id) {
    return Response.json({ error: 'Faltan campos: postulacion_id y fundador_id' }, { status: 400 })
  }

  // Verificar que no exista ya un contrato para esta postulacion
  const { data: existente } = await supabase
    .from('contratos')
    .select('id, estado, firmado_fundador, firmado_profesional')
    .eq('postulacion_id', postulacion_id)
    .maybeSingle()

  if (existente) return Response.json({ contrato: existente, existia: true })

  // Cargar todos los datos necesarios
  const { data: post } = await supabase
    .from('postulaciones')
    .select('*, roles:rol_id(*, proyectos:proyecto_id(*)), perfiles:postulante_id(*)')
    .eq('id', postulacion_id)
    .single()

  if (!post) return Response.json({ error: 'Postulacion no encontrada' }, { status: 404 })

  const proyecto = post.roles?.proyectos
  const profesional = post.perfiles
  const rol = post.roles

  // Verificar que el fundador es correcto
  if (proyecto?.fundador_id !== fundador_id) {
    return Response.json({ error: 'Solo el fundador del proyecto puede generar contratos' }, { status: 403 })
  }

  // Cargar datos del fundador
  const { data: fundador } = await supabase
    .from('perfiles')
    .select('nombre, email')
    .eq('id', fundador_id)
    .single()

  // Cargar tareas del pais para esta especialidad
  let pais_tareas = []
  if (proyecto?.pais && rol?.sub_especialidad) {
    const { data: paisData } = await supabase
      .from('paises_regulatorios')
      .select('tareas')
      .eq('nombre', proyecto.pais)
      .single()

    const todasTareas = paisData?.tareas || []
    const rolNombre = (rol.nombre || '').toLowerCase()
    const esAbogado = ['abogado', 'legal', 'juridico'].some(r => rolNombre.includes(r))
    const esContador = ['contador', 'contable', 'contabilidad', 'tributario'].some(r => rolNombre.includes(r))

    if (esAbogado) pais_tareas = todasTareas.filter(t => (t.rol_nombre || '').toLowerCase() === 'abogado')
    if (esContador) pais_tareas = todasTareas.filter(t => (t.rol_nombre || '').toLowerCase() === 'contador')
  }

  // Generar contenido del contrato
  const contenido = generarContenidoContrato({
    proyecto, profesional, fundador, rol, postulacion: post, pais_tareas,
  })
  const textoPDF = generarTextoPDF(contenido)

  // Determinar carril segun estado_financiacion
  const carril = proyecto?.estado_financiacion === 'con_recursos' ? 'A' : 'B'

  // Guardar contrato
  const { data: contrato, error } = await supabase
    .from('contratos')
    .insert([{
      proyecto_id: proyecto?.id,
      postulacion_id,
      rol_id: rol?.id,
      fundador_id,
      profesional_id: post.postulante_id,
      modalidad: rol?.modalidad || 'deuda_diferida',
      valor: rol?.valor_mercado || 0,
      sub_especialidad: rol?.sub_especialidad || null,
      carril,
      estado: 'pendiente_firma',
      firmado_fundador: false,
      firmado_profesional: false,
      condiciones: textoPDF,
      contenido_json: { ...contenido, texto_pdf: textoPDF },
    }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar al profesional que tiene contrato listo para firmar
  if (contrato?.profesional_id && post?.perfiles?.email) {
    await notificar('contrato_generado', {
      id: contrato.profesional_id,
      email: post.perfiles.email,
      nombre: post.perfiles.nombre,
    }, {
      rol_nombre: post.roles?.nombre || 'tu rol',
      proyecto_nombre: post.roles?.proyectos?.nombre || 'el proyecto',
      proyecto_id: post.roles?.proyecto_id,
    }).catch(() => {})
  }

  return Response.json({ contrato, existia: false }, { status: 201 })
}

// PATCH — confirmar firma (fundador o profesional)
export async function PATCH(request) {
  const body = await request.json()
  const { id, tipo } = body // tipo: 'fundador' | 'profesional'

  if (!id || !tipo) return Response.json({ error: 'Faltan campos: id y tipo' }, { status: 400 })

  const updates = {}
  if (tipo === 'fundador') {
    updates.firmado_fundador = true
    updates.fecha_firma_fundador = new Date().toISOString()
  } else {
    updates.firmado_profesional = true
    updates.fecha_firma_profesional = new Date().toISOString()
  }

  // Ver si el otro ya firmo para marcar como vigente
  const { data: actual } = await supabase
    .from('contratos')
    .select('firmado_fundador, firmado_profesional')
    .eq('id', id)
    .single()

  const ambosFirmaron =
    (tipo === 'fundador' && actual?.firmado_profesional) ||
    (tipo === 'profesional' && actual?.firmado_fundador)

  updates.estado = ambosFirmaron ? 'vigente' : 'firmado_parcial'

  const { data, error } = await supabase
    .from('contratos')
    .update(updates)
    .eq('id', id)
    .select('*, perfil_fundador:fundador_id(nombre), perfil_profesional:profesional_id(nombre), roles:rol_id(nombre, sub_especialidad)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar si ambas partes firmaron
  if (ambosFirmaron && data?.fundador_id && data?.profesional_id) {
    const [perfF, perfP, proj] = await Promise.all([
      supabase.from('perfiles').select('email, nombre').eq('id', data.fundador_id).single(),
      supabase.from('perfiles').select('email, nombre').eq('id', data.profesional_id).single(),
      supabase.from('proyectos').select('nombre').eq('id', data.roles?.proyecto_id || '').single(),
    ])
    const datosEvento = { proyecto_nombre: proj.data?.nombre || 'el proyecto', proyecto_id: data.roles?.proyecto_id }
    if (perfF.data?.email) await notificar('contrato_vigente', { id: data.fundador_id, email: perfF.data.email, nombre: perfF.data.nombre }, datosEvento).catch(() => {})
    if (perfP.data?.email) await notificar('contrato_vigente', { id: data.profesional_id, email: perfP.data.email, nombre: perfP.data.nombre }, datosEvento).catch(() => {})
  }

  // Logro: primer contrato firmado (para el profesional cuando firma)
  if (tipo === 'profesional' && data?.profesional_id) {
    otorgarLogro(supabase, data.profesional_id, 'primer_contrato_firmado').catch(() => {})
  }

  return Response.json({ contrato: data })
}

// PUT — regenerar el texto del contrato existente con el generador actualizado
export async function PUT(request) {
  const body = await request.json()
  const { id, fundador_id } = body

  if (!id || !fundador_id) return Response.json({ error: 'Faltan campos: id y fundador_id' }, { status: 400 })

  // Cargar el contrato con todos los datos relacionados
  const { data: contrato, error: contratoError } = await supabase
    .from('contratos')
    .select('*, roles:rol_id(*, proyectos:proyecto_id(*)), perfil_profesional:profesional_id(*), perfil_fundador:fundador_id(*)')
    .eq('id', id)
    .single()

  if (contratoError || !contrato) return Response.json({ error: 'Contrato no encontrado' }, { status: 404 })
  if (contrato.fundador_id !== fundador_id) return Response.json({ error: 'No autorizado' }, { status: 403 })

  const proyecto = contrato.roles?.proyectos
  const profesional = contrato.perfil_profesional
  const fundador = contrato.perfil_fundador
  const rol = contrato.roles

  if (!proyecto || !profesional || !fundador || !rol) {
    return Response.json({ error: 'Faltan datos relacionados para regenerar el contrato' }, { status: 400 })
  }

  // Cargar tareas del pais para el rol
  let pais_tareas = []
  if (proyecto.pais && contrato.sub_especialidad) {
    const { data: paisData } = await supabase
      .from('paises_regulatorios')
      .select('tareas')
      .eq('nombre', proyecto.pais)
      .single()

    const todasTareas = paisData?.tareas || []
    const rolNombre = (rol.nombre || '').toLowerCase()
    const esAbogado = ['abogado', 'legal', 'juridico'].some(r => rolNombre.includes(r))
    const esContador = ['contador', 'contable', 'contabilidad'].some(r => rolNombre.includes(r))
    if (esAbogado) pais_tareas = todasTareas.filter(t => (t.rol_nombre || '').toLowerCase() === 'abogado')
    if (esContador) pais_tareas = todasTareas.filter(t => (t.rol_nombre || '').toLowerCase() === 'contador')
  }

  // Regenerar con el generador actualizado
  const contenido = generarContenidoContrato({ proyecto, profesional, fundador, rol, postulacion: {}, pais_tareas })
  const textoPDF = generarTextoPDF(contenido)

  const { data: actualizado, error: updateError } = await supabase
    .from('contratos')
    .update({
      condiciones: textoPDF,
      contenido_json: { ...contenido, texto_pdf: textoPDF },
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 })
  return Response.json({ contrato: actualizado, mensaje: 'Contrato regenerado exitosamente' })
}
