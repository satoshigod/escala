import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const TAREAS_BASE = {
  'Abogado': [
    { nombre: 'Redactar estatutos sociales', descripcion: 'Documento base que define el objeto social, capital, órganos y reglas de la empresa.', categoria: 'Legal' },
    { nombre: 'Registro en Cámara de Comercio', descripcion: 'Inscripción de la SAS y obtención del certificado de existencia y representación legal.', categoria: 'Legal' },
    { nombre: 'Obtener NIT en la DIAN', descripcion: 'Registro tributario de la empresa para poder facturar y declarar impuestos.', categoria: 'Legal' },
    { nombre: 'Redactar pacto de socios', descripcion: 'Acuerdo privado entre los aportantes sobre derechos, obligaciones y reglas de salida.', categoria: 'Legal' },
    { nombre: 'Contratos de prestación de servicios', descripcion: 'Contratos tipo para formalizar la relación con cada especialista aportante.', categoria: 'Legal' },
  ],
  'Contador': [
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta a nombre de la SAS para manejar los recursos del proyecto.', categoria: 'Finanzas' },
    { nombre: 'Configurar facturación electrónica DIAN', descripcion: 'Habilitación del sistema de facturación electrónica obligatoria en Colombia.', categoria: 'Finanzas' },
    { nombre: 'Definir régimen tributario', descripcion: 'Determinar si aplica régimen simple o común según ingresos proyectados.', categoria: 'Finanzas' },
    { nombre: 'Crear plan de cuentas contable', descripcion: 'Estructura contable inicial adaptada al modelo de negocio del proyecto.', categoria: 'Finanzas' },
    { nombre: 'Primera declaración de renta', descripcion: 'Declaración del año de constitución ante la DIAN.', categoria: 'Finanzas' },
  ],
  'Desarrollador Full-Stack': [
    { nombre: 'Configurar repositorio GitHub', descripcion: 'Crear el repositorio del proyecto con estructura de ramas y accesos del equipo.', categoria: 'Técnico' },
    { nombre: 'Configurar entorno de desarrollo', descripcion: 'Instalar dependencias, variables de entorno y documentar el setup inicial.', categoria: 'Técnico' },
    { nombre: 'Deploy inicial en producción', descripcion: 'Primera versión desplegada en Vercel/Railway con CI/CD configurado.', categoria: 'Técnico' },
    { nombre: 'Configurar base de datos', descripcion: 'Esquema inicial de tablas, migraciones y políticas de seguridad.', categoria: 'Técnico' },
    { nombre: 'Documentar arquitectura técnica', descripcion: 'Diagrama de arquitectura, decisiones técnicas y guía de contribución.', categoria: 'Técnico' },
  ],
  'Gerente de Proyecto': [
    { nombre: 'Crear tablero de seguimiento del proyecto', descripcion: 'Herramienta para rastrear hitos, tareas y responsables del equipo.', categoria: 'Gestión' },
    { nombre: 'Definir metodología de trabajo', descripcion: 'Sprints, reuniones semanales, canales de comunicación y reglas del equipo.', categoria: 'Gestión' },
    { nombre: 'Onboarding de cada miembro del equipo', descripcion: 'Sesión de introducción, accesos y contexto del proyecto para cada nuevo miembro.', categoria: 'Gestión' },
    { nombre: 'Calendario de hitos y entregables', descripcion: 'Cronograma con fechas estimadas para cada hito del proyecto.', categoria: 'Gestión' },
    { nombre: 'Primer informe de avance', descripcion: 'Reporte inicial del estado del proyecto para el fundador y los aportantes.', categoria: 'Gestión' },
  ],
  'Diseñador': [
    { nombre: 'Definir identidad visual — logo y paleta', descripcion: 'Logo definitivo, colores, tipografía y estilo visual de la marca.', categoria: 'Diseño' },
    { nombre: 'Manual de marca', descripcion: 'Guía de uso del logo, colores y tipografías para todos los materiales.', categoria: 'Diseño' },
    { nombre: 'Diseño UI/UX de la plataforma', descripcion: 'Wireframes y mockups de las pantallas principales del producto.', categoria: 'Diseño' },
    { nombre: 'Plantillas de presentación', descripcion: 'Template en PowerPoint/Canva para presentar el proyecto a inversores.', categoria: 'Diseño' },
  ],
  'Community Manager': [
    { nombre: 'Crear perfiles en redes sociales', descripcion: 'LinkedIn, Instagram y WhatsApp Business con información completa del proyecto.', categoria: 'Marketing' },
    { nombre: 'Plan de contenido mes 1', descripcion: 'Calendario editorial con 12-16 publicaciones del primer mes.', categoria: 'Marketing' },
    { nombre: 'Definir tono y voz de la marca', descripcion: 'Guía de comunicación: cómo habla la marca, qué publica y qué evita.', categoria: 'Marketing' },
    { nombre: 'Primera campaña de awareness', descripcion: 'Publicaciones de lanzamiento para dar a conocer el proyecto.', categoria: 'Marketing' },
  ],
  'Inversionista inicial': [
    { nombre: 'Transferir capital inicial', descripcion: 'Aporte del capital acordado a la cuenta bancaria del proyecto.', categoria: 'Inversión' },
    { nombre: 'Firmar pacto de socios', descripcion: 'Firma del acuerdo de socios definiendo derechos y condiciones de la inversión.', categoria: 'Inversión' },
    { nombre: 'Revisar y aprobar estatutos', descripcion: 'Validación del documento legal antes de registrar en Cámara de Comercio.', categoria: 'Inversión' },
  ],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const asignado_a = searchParams.get('asignado_a')

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  let query = supabase
    .from('tareas')
    .select('*, asignado_perfil:asignado_a ( nombre, especialidad, rol_principal ), verificado_perfil:verificado_por ( nombre ), creador:creado_por ( nombre )')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: true })

  if (asignado_a) query = query.eq('asignado_a', asignado_a)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ tareas: data, plantillas: TAREAS_BASE })
}

export async function POST(request) {
  const body = await request.json()
  const { proyecto_id, rol_nombre, asignado_a, nombre, descripcion, categoria, creado_por, razon_creacion, inicializar } = body

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  // Si es inicialización con plantillas
  if (inicializar && rol_nombre && TAREAS_BASE[rol_nombre]) {
    const tareas = TAREAS_BASE[rol_nombre].map(t => ({
      proyecto_id,
      rol_nombre,
      asignado_a: asignado_a || null,
      nombre: t.nombre,
      descripcion: t.descripcion,
      categoria: t.categoria,
      estado: 'pendiente',
      creado_por: creado_por || null,
      razon_creacion: 'Tarea inicial del rol ' + rol_nombre
    }))

    const { data, error } = await supabase.from('tareas').insert(tareas).select()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ tareas: data }, { status: 201 })
  }

  // Tarea individual nueva
  if (!nombre) return Response.json({ error: 'Falta nombre' }, { status: 400 })

  const { data, error } = await supabase
    .from('tareas')
    .insert([{ proyecto_id, rol_nombre, asignado_a, nombre, descripcion, categoria, creado_por, razon_creacion, estado: 'pendiente' }])
    .select('*, asignado_perfil:asignado_a ( nombre ), creador:creado_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ tarea: data }, { status: 201 })
}

export async function PATCH(request) {
  const body = await request.json()
  const { id, estado, verificado_por } = body

  if (!id || !estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const updates = { estado }
  if (estado === 'completada') updates.completado_at = new Date().toISOString()
  if (estado === 'verificada' && verificado_por) {
    updates.verificado_at = new Date().toISOString()
    updates.verificado_por = verificado_por
  }

  const { data, error } = await supabase
    .from('tareas')
    .update(updates)
    .eq('id', id)
    .select('*, asignado_perfil:asignado_a ( nombre ), verificado_perfil:verificado_por ( nombre ), creador:creado_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ tarea: data })
}
