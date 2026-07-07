import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'
import { otorgarLogro } from '@/lib/logros'
import { SEGMENTOS_ROLES, getTareasSegmento } from '../../../lib/segmentosRoles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

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

const TAREAS_PAIS = {
  'Colombia': [
    { nombre: 'Constituir SAS ante notaría', descripcion: 'Escritura pública o documento privado para constituir la Sociedad por Acciones Simplificada.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Registro en Cámara de Comercio', descripcion: 'Inscripción del acta de constitución y obtención del certificado de existencia y representación legal.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener NIT en la DIAN', descripcion: 'Registro único tributario y número de identificación tributaria para la empresa.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Configurar facturación electrónica DIAN', descripcion: 'Habilitación del sistema de facturación electrónica obligatoria para todas las empresas colombianas.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente a nombre de la empresa para manejo de recursos del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Definir régimen tributario (simple o común)', descripcion: 'Análisis y elección del régimen más conveniente según proyección de ingresos.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'México': [
    { nombre: 'Constituir SA de CV o SAPI ante notario', descripcion: 'Escritura constitutiva ante notario público con capital mínimo y socios fundadores.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Registro en el SAT — obtener RFC', descripcion: 'Alta en el Servicio de Administración Tributaria y obtención del Registro Federal de Contribuyentes.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Alta en IMSS e INFONAVIT', descripcion: 'Registro patronal en seguridad social e instituto de vivienda para contratar empleados.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Configurar facturación CFDI', descripcion: 'Alta en sistema de Comprobantes Fiscales Digitales por Internet para facturar electrónicamente.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta a nombre de la empresa para manejo de recursos y pagos a proveedores.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Definir régimen fiscal (RIF, general, etc.)', descripcion: 'Elección del régimen más adecuado según modelo de negocio e ingresos proyectados.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'Perú': [
    { nombre: 'Constituir SAC o SRL en SUNARP', descripcion: 'Inscripción de la sociedad en los Registros Públicos con estatutos y acta de constitución.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener RUC en SUNAT', descripcion: 'Registro Único de Contribuyentes para identificación tributaria de la empresa.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Definir régimen tributario SUNAT', descripcion: 'Elección entre Régimen General, MYPE Tributario o RER según proyección de ventas.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Configurar comprobantes electrónicos', descripcion: 'Alta en sistema de emisión de comprobantes electrónicos de SUNAT.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente en soles a nombre de la empresa para operaciones del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'Chile': [
    { nombre: 'Constituir SpA o SRL en Registro de Empresas', descripcion: 'Constitución online a través del portal del Ministerio de Economía de Chile (gratuito).', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener RUT empresa', descripcion: 'Registro Único Tributario para identificación de la empresa ante el SII.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Inicio de actividades en el SII', descripcion: 'Declaración formal de inicio de actividades comerciales ante el Servicio de Impuestos Internos.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Configurar facturación electrónica SII', descripcion: 'Alta en sistema de facturación electrónica del SII para emitir boletas y facturas válidas.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente a nombre de la empresa para manejo de recursos del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'Argentina': [
    { nombre: 'Constituir SAS o SRL ante IGJ', descripcion: 'Inscripción de la sociedad en la Inspección General de Justicia con estatuto y acta fundacional.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener CUIT en AFIP', descripcion: 'Clave Única de Identificación Tributaria para la empresa ante la Administración Federal de Ingresos Públicos.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Elegir régimen: monotributo o responsable inscripto', descripcion: 'Análisis del régimen más conveniente según facturación proyectada.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Configurar facturación electrónica AFIP', descripcion: 'Alta en el sistema de factura electrónica obligatorio de AFIP.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente a nombre de la empresa para manejo de fondos del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'España': [
    { nombre: 'Constituir SL en el Registro Mercantil', descripcion: 'Escritura pública ante notario e inscripción en el Registro Mercantil con capital mínimo de 3.000 €.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener NIF empresa en Hacienda', descripcion: 'Número de Identificación Fiscal provisional y definitivo de la sociedad.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Alta en IAE (Impuesto de Actividades Económicas)', descripcion: 'Declaración censal de inicio de actividad económica ante la Agencia Tributaria.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Configurar facturación electrónica AEAT', descripcion: 'Sistema de facturación electrónica obligatorio para empresas españolas.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente en euros a nombre de la sociedad para operaciones del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
  'Estados Unidos': [
    { nombre: 'Constituir LLC o C-Corp en el estado elegido', descripcion: 'Registro de la entidad legal ante la secretaría de estado (Delaware es el más común para startups).', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Obtener EIN en el IRS', descripcion: 'Employer Identification Number para identificación fiscal federal de la empresa.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Redactar Operating Agreement o Shareholders Agreement', descripcion: 'Documento que regula derechos, obligaciones y distribución de equity entre los fundadores.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Registrar en el estado y cumplir compliance estatal', descripcion: 'Annual report, registered agent y cumplimiento de obligaciones estatales según el estado de registro.', categoria: 'Legal', rol_nombre: 'Abogado' },
    { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta bancaria en USD a nombre de la LLC o C-Corp para operaciones del proyecto.', categoria: 'Finanzas', rol_nombre: 'Contador' },
    { nombre: 'Definir estructura fiscal (pass-through vs corporate tax)', descripcion: 'Análisis con contador de la estructura más conveniente según origen de socios e inversores.', categoria: 'Finanzas', rol_nombre: 'Contador' },
  ],
}

const TAREAS_INDUSTRIA = {
  'Restaurante': [
    { nombre: 'Diseñar carta digital', descripcion: 'Menú digital actualizable con fotos, precios y descripción de platos.', categoria: 'Marketing', rol_nombre: 'Diseñador' },
    { nombre: 'Fotografía gastronómica', descripcion: 'Sesión fotográfica profesional de los platos principales para carta y redes.', categoria: 'Marketing', rol_nombre: 'Diseñador' },
    { nombre: 'Registro en Google Maps y Google Business', descripcion: 'Perfil completo en Google con horarios, fotos, menú y gestión de reseñas.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
    { nombre: 'Configurar plataformas de delivery', descripcion: 'Alta en Rappi, PedidosYa, iFood u otras según la ciudad del proyecto.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
    { nombre: 'Sistema de reservas online', descripcion: 'Configurar herramienta de reservas integrada con el sitio web o redes sociales.', categoria: 'Gestión', rol_nombre: 'Gerente de Proyecto' },
    { nombre: 'Estrategia de fidelización de clientes', descripcion: 'Programa de puntos, descuentos por visitas repetidas o membresías.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
  ],
  'Retail': [
    { nombre: 'Crear catálogo de productos digital', descripcion: 'Catálogo completo con fotos, precios, SKUs y descripciones de todos los productos.', categoria: 'Marketing', rol_nombre: 'Diseñador' },
    { nombre: 'Configurar sistema de inventario', descripcion: 'Software de control de inventario para gestión de stock en tiempo real.', categoria: 'Gestión', rol_nombre: 'Gerente de Proyecto' },
    { nombre: 'Instalar POS (punto de venta)', descripcion: 'Sistema de cobro integrado con inventario para ventas presenciales.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Publicar en marketplaces', descripcion: 'Alta en Mercado Libre, Amazon, Linio u otros marketplaces relevantes según el país.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
    { nombre: 'Configurar CRM para clientes', descripcion: 'Sistema de gestión de clientes para seguimiento de compras y comunicación.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Negociación y registro de proveedores', descripcion: 'Formalizar relación con proveedores principales con contratos y condiciones claras.', categoria: 'Legal', rol_nombre: 'Abogado' },
  ],
  'Servicios Profesionales': [
    { nombre: 'Crear identidad de marca profesional', descripcion: 'Logo, colores, tipografías y sistema visual que transmita confianza y especialización.', categoria: 'Diseño', rol_nombre: 'Diseñador' },
    { nombre: 'Desarrollar página web con portfolio', descripcion: 'Sitio web con servicios, casos de éxito, equipo y formulario de contacto.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Implementar CRM para gestión de clientes', descripcion: 'Sistema para seguimiento de prospectos, propuestas y clientes activos.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Configurar agenda y reservas online', descripcion: 'Herramienta para que prospectos agenden citas directamente desde la web.', categoria: 'Gestión', rol_nombre: 'Gerente de Proyecto' },
    { nombre: 'Estrategia de generación de leads', descripcion: 'Plan para atraer prospectos calificados a través de contenido, SEO y redes sociales.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
    { nombre: 'Documentar casos de éxito y testimonios', descripcion: 'Recopilar y publicar casos de clientes satisfechos para generar credibilidad.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
  ],
  'Tecnología': [
    { nombre: 'Configurar repositorio y estructura de proyecto', descripcion: 'Repositorio en GitHub con ramas, gitflow, CI/CD y documentación inicial.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Diseñar arquitectura técnica del producto', descripcion: 'Diagrama de arquitectura, stack tecnológico, APIs y decisiones técnicas documentadas.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Deploy inicial en producción', descripcion: 'Primera versión funcional desplegada con dominio, SSL y monitoreo básico.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Diseño UX/UI del producto', descripcion: 'Wireframes, prototipos y diseño final de las pantallas principales del producto.', categoria: 'Diseño', rol_nombre: 'Diseñador' },
    { nombre: 'Configurar métricas y analytics', descripcion: 'Instrumentación del producto para medir retención, conversión y comportamiento de usuarios.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Estrategia de lanzamiento de producto', descripcion: 'Plan de go-to-market, beta users, comunicación y adquisición de primeros clientes.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
  ],
  'Comercio Electrónico': [
    { nombre: 'Configurar tienda online (Shopify, WooCommerce, etc.)', descripcion: 'Plataforma de e-commerce configurada con productos, métodos de pago y envíos.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Integrar pasarela de pagos', descripcion: 'Wompi, PayU, Stripe u otra pasarela según el país para aceptar pagos online.', categoria: 'Técnico', rol_nombre: 'Desarrollador Full-Stack' },
    { nombre: 'Configurar logística y envíos', descripcion: 'Acuerdo con operadores logísticos y configuración de costos y tiempos de envío.', categoria: 'Gestión', rol_nombre: 'Gerente de Proyecto' },
    { nombre: 'Fotografía y descripción de productos', descripcion: 'Contenido visual y textual optimizado para conversión en la tienda online.', categoria: 'Diseño', rol_nombre: 'Diseñador' },
    { nombre: 'Estrategia SEO y campañas de adquisición', descripcion: 'Posicionamiento orgánico y campañas pagadas en Meta y Google para atraer compradores.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
    { nombre: 'Configurar email marketing y recuperación de carritos', descripcion: 'Flujos automáticos de email para recuperar carritos abandonados y fidelizar compradores.', categoria: 'Marketing', rol_nombre: 'Community Manager' },
  ],
}

const CATEGORIA_POR_ROL = {
  'Abogado': ['Legal'],
  'Contador': ['Finanzas'],
  'Desarrollador Full-Stack': ['Técnico'],
  'Gerente de Proyecto': ['Gestión', 'Legal', 'Finanzas', 'Técnico', 'Diseño', 'Marketing', 'Inversión'],
  'Diseñador': ['Diseño'],
  'Community Manager': ['Marketing'],
  'Inversionista inicial': ['Inversión'],
}

// Detecta si un rol es abogado de constitución o contador de constitución
function detectarRolConstitucion(nombreRol, subEsp) {
  const n = (nombreRol || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const s = (subEsp || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const esConstitucion = /constituc/.test(n + ' ' + s)
  if (!esConstitucion) return null
  const esAbogado = /abogado|legal|juridico/.test(n + ' ' + s)
  const esContador = /contador|contable|contabilidad|tributario/.test(n + ' ' + s)
  if (esAbogado) return 'Abogado'
  if (esContador) return 'Contador'
  return null
}

async function registrarHistorial(tarea_id, proyecto_id, accion, realizado_por, descripcion) {
  await supabase.from('historial_tareas').insert([{ tarea_id, proyecto_id, accion, realizado_por, descripcion }])
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const tarea_id = searchParams.get('tarea_id')
  const categoria = searchParams.get('categoria')

  if (!proyecto_id && !tarea_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  if (tarea_id) {
    const { data, error } = await supabase
      .from('historial_tareas')
      .select('*, realizado_perfil:realizado_por ( nombre )')
      .eq('tarea_id', tarea_id)
      .order('created_at', { ascending: false })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ historial: data })
  }

  const { data, error } = await supabase
    .from('tareas')
    .select('*, asignado_perfil:asignado_a ( nombre, especialidad, rol_principal ), verificado_perfil:verificado_por ( nombre ), creador:creado_por ( nombre )')
    .eq('proyecto_id', proyecto_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (categoria) {
    const rolesCompatibles = Object.entries(CATEGORIA_POR_ROL)
      .filter(([, cats]) => cats.includes(categoria))
      .map(([rol]) => rol)
    return Response.json({ tareas: data, plantillas: TAREAS_BASE, rolesCompatibles })
  }

  return Response.json({ tareas: data, plantillas: TAREAS_BASE, tareas_pais: TAREAS_PAIS, tareas_industria: TAREAS_INDUSTRIA, categoria_por_rol: CATEGORIA_POR_ROL, segmentos: SEGMENTOS_ROLES })
}

export async function POST(request) {
  const body = await request.json()
  const {
    proyecto_id, rol_nombre, asignado_a, nombre, descripcion, categoria,
    creado_por, razon_creacion, inicializar, inicializar_pais, pais,
    inicializar_industria, industria,
    // Nuevo: auto-inicializar tareas de constitución para un especialista aceptado
    inicializar_constitucion, rol_nombre_especialista, sub_especialidad
  } = body

  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  // ── BOOTSTRAPPING: FUNDADOR ASUME ROL DE CONSTITUCIÓN SIN ESPECIALISTA ────
  // Busca las tareas de constitución que ya existen sin asignar en el proyecto
  // y las asigna al fundador. NO crea tareas nuevas — reasigna las existentes.
  if (body.inicializar_bootstrapping && asignado_a) {
    const rolTipo = body.rol_tipo // 'Abogado' o 'Contador'
    if (!rolTipo) return Response.json({ error: 'Falta rol_tipo' }, { status: 400 })

    // Buscar tareas del rol sin asignar que sean de constitución
    const { data: tareasExistentes, error: buscarError } = await supabase
      .from('tareas')
      .select('id, nombre, razon_creacion')
      .eq('proyecto_id', proyecto_id)
      .eq('rol_nombre', rolTipo)
      .is('asignado_a', null)

    if (buscarError) return Response.json({ error: buscarError.message }, { status: 500 })

    // Filtrar solo las de constitución (por razon_creacion o por nombre)
    const NOMBRES_CONSTITUCION_ABOGADO = [
      'constituir', 'camara de comercio', 'nit', 'dian', 'estatutos', 'pacto de socios',
      'escritura', 'registro mercantil', 'rut', 'llc', 'srl', 'sas', 'igj', 'sunarp',
      'sii', 'sat', 'rfc', 'operating agreement'
    ]
    const NOMBRES_CONSTITUCION_CONTADOR = [
      'facturacion electronica', 'facturación electrónica', 'cuenta bancaria', 'regimen tributario',
      'régimen tributario', 'plan de cuentas', 'declaracion de renta', 'declaración de renta',
      'cfdi', 'afip', 'cuit', 'ruc', 'sunat', 'rut', 'inicio de actividades', 'iae', 'ein'
    ]

    const keywords = rolTipo === 'Abogado' ? NOMBRES_CONSTITUCION_ABOGADO : NOMBRES_CONSTITUCION_CONTADOR

    const tareasConstitucion = (tareasExistentes || []).filter(t => {
      const texto = (t.nombre + ' ' + (t.razon_creacion || '')).toLowerCase()
      return keywords.some(k => texto.includes(k)) ||
        (t.razon_creacion || '').toLowerCase().includes('regulatori') ||
        (t.razon_creacion || '').toLowerCase().includes('constituci')
    })

    if (tareasConstitucion.length === 0) {
      return Response.json({ tareas: [], mensaje: `No hay tareas de constitucion sin asignar para ${rolTipo}` }, { status: 200 })
    }

    // Asignar las tareas existentes al fundador
    const ids = tareasConstitucion.map(t => t.id)
    const { data: actualizadas, error: updateError } = await supabase
      .from('tareas')
      .update({
        asignado_a,
        razon_creacion: `Bootstrapping — Fundador asumio el rol de ${rolTipo}`,
      })
      .in('id', ids)
      .select('*')

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 })
    return Response.json({ tareas: actualizadas, tipo: 'bootstrapping', rol: rolTipo }, { status: 200 })
  }

  // ── AUTO-INICIALIZAR TAREAS DE CONSTITUCIÓN PARA UN ESPECIALISTA ──────────
  // Se llama cuando se acepta una postulación de abogado/contador de constitución
  // y también al cargar /workspace/tareas si el especialista no tiene tareas aún.
  if (inicializar_constitucion && rol_nombre_especialista !== undefined) {
    const rolTipo = detectarRolConstitucion(rol_nombre_especialista, sub_especialidad)
    if (!rolTipo) return Response.json({ tareas: [], mensaje: 'No es un rol de constitución' }, { status: 200 })

    // Obtener el país del proyecto
    const { data: proy } = await supabase
      .from('proyectos')
      .select('pais')
      .eq('id', proyecto_id)
      .single()

    const paisProyecto = proy?.pais

    // Buscar tareas del país en paises_regulatorios primero, luego fallback a TAREAS_PAIS
    let tareasSource = []
    if (paisProyecto) {
      const { data: paisData } = await supabase
        .from('paises_regulatorios')
        .select('tareas')
        .eq('nombre', paisProyecto)
        .single()
      tareasSource = paisData?.tareas || TAREAS_PAIS[paisProyecto] || []
    }

    // Filtrar solo las del rol correspondiente (abogado o contador)
    const tareasDelRol = tareasSource.filter(t =>
      (t.rol_nombre || '').toLowerCase() === rolTipo.toLowerCase()
    )

    if (tareasDelRol.length === 0) {
      return Response.json({ tareas: [], mensaje: `Sin tareas configuradas para ${rolTipo} en ${paisProyecto}` }, { status: 200 })
    }

    // Verificar cuáles ya existen para no duplicar
    const { data: existentes } = await supabase
      .from('tareas')
      .select('nombre')
      .eq('proyecto_id', proyecto_id)
      .eq('asignado_a', asignado_a)

    const nombresExistentes = new Set((existentes || []).map(t => t.nombre))
    const nuevas = tareasDelRol.filter(t => !nombresExistentes.has(t.nombre))

    if (nuevas.length === 0) {
      return Response.json({ tareas: [], mensaje: 'Tareas ya existentes', ya_inicializado: true }, { status: 200 })
    }

    const tareasAInsertar = nuevas.map(t => ({
      proyecto_id,
      rol_nombre: rolTipo,
      asignado_a: asignado_a || null,
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      categoria: t.categoria || 'Legal',
      estado: 'pendiente',
      creado_por: creado_por || null,
      razon_creacion: `Constitución de empresas — ${paisProyecto || 'país no definido'}`,
    }))

    const { data: insertadas, error: insertError } = await supabase
      .from('tareas')
      .insert(tareasAInsertar)
      .select('*, asignado_perfil:asignado_a ( nombre, email )')

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })

    for (const tarea of insertadas) {
      await registrarHistorial(tarea.id, proyecto_id, 'creada', creado_por,
        `Tarea de constitución asignada automáticamente a ${tarea.asignado_perfil?.nombre || 'especialista'}`)
    }

    return Response.json({ tareas: insertadas, tipo: 'constitucion', rol: rolTipo, pais: paisProyecto }, { status: 201 })
  }

  // INICIALIZAR TAREAS REGULATORIAS POR PAÍS
  if (inicializar_pais && pais) {
    const { data: paisData } = await supabase
      .from('paises_regulatorios')
      .select('tareas')
      .eq('nombre', pais)
      .single()

    const tareasSource = paisData?.tareas || TAREAS_PAIS[pais] || []
    if (tareasSource.length === 0) return Response.json({ tareas: [], tipo: 'pais', pais }, { status: 201 })

    const tareasPais = tareasSource.map(t => ({
      proyecto_id,
      rol_nombre: t.rol_nombre || '',
      asignado_a: null,
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      categoria: t.categoria || 'Legal',
      estado: 'pendiente',
      creado_por: creado_por || null,
      razon_creacion: 'Tarea regulatoria inicial — ' + pais
    }))

    const { data, error } = await supabase.from('tareas').insert(tareasPais).select()
    if (error) return Response.json({ error: error.message }, { status: 500 })

    for (const tarea of data) {
      await registrarHistorial(tarea.id, proyecto_id, 'creada', creado_por,
        'Tarea regulatoria cargada automáticamente para ' + pais)
    }

    return Response.json({ tareas: data, tipo: 'pais', pais }, { status: 201 })
  }

  // INICIALIZAR TAREAS COMERCIALES POR INDUSTRIA
  if (inicializar_industria && industria) {
    const { data: indData } = await supabase
      .from('industrias')
      .select('tareas')
      .eq('nombre', industria)
      .single()

    const tareasSource = indData?.tareas || TAREAS_INDUSTRIA[industria] || []
    if (tareasSource.length === 0) return Response.json({ tareas: [], tipo: 'industria', industria }, { status: 201 })

    const tareasInd = tareasSource.map(t => ({
      proyecto_id,
      rol_nombre: t.rol_nombre || '',
      asignado_a: null,
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      categoria: t.categoria || 'General',
      estado: 'pendiente',
      creado_por: creado_por || null,
      razon_creacion: 'Tarea inicial de industria — ' + industria
    }))

    const { data, error } = await supabase.from('tareas').insert(tareasInd).select()
    if (error) return Response.json({ error: error.message }, { status: 500 })

    for (const tarea of data) {
      await registrarHistorial(tarea.id, proyecto_id, 'creada', creado_por,
        'Tarea comercial cargada automáticamente para industria ' + industria)
    }

    return Response.json({ tareas: data, tipo: 'industria', industria }, { status: 201 })
  }

  if (inicializar && rol_nombre) {
    // Usar segmento específico si viene (sub_especialidad), sino usar todas las tareas del rol
    const segmento = body.segmento || sub_especialidad || null
    let tareasSource = []

    if (segmento && SEGMENTOS_ROLES[rol_nombre]?.[segmento]) {
      // Cargar tareas del segmento específico
      tareasSource = getTareasSegmento(rol_nombre, segmento)
    } else if (SEGMENTOS_ROLES[rol_nombre]) {
      // Sin segmento: cargar tareas del primer segmento del rol (el más general)
      const primerSegmento = Object.keys(SEGMENTOS_ROLES[rol_nombre])[0]
      tareasSource = getTareasSegmento(rol_nombre, primerSegmento)
    } else if (TAREAS_BASE[rol_nombre]) {
      // Fallback al sistema anterior para compatibilidad
      tareasSource = TAREAS_BASE[rol_nombre]
    }

    if (tareasSource.length === 0) {
      return Response.json({ error: 'No hay tareas definidas para este rol/segmento' }, { status: 400 })
    }

    const razon = segmento
      ? `Tarea inicial del rol ${rol_nombre} — ${segmento}`
      : `Tarea inicial del rol ${rol_nombre}`

    const tareas = tareasSource.map(t => ({
      proyecto_id, rol_nombre,
      asignado_a: asignado_a || null,
      nombre: t.nombre, descripcion: t.descripcion, categoria: t.categoria,
      estado: 'pendiente', creado_por: creado_por || null,
      razon_creacion: razon
    }))

    const { data, error } = await supabase.from('tareas').insert(tareas).select('*, asignado_perfil:asignado_a ( nombre, email )')
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const creadorData = creado_por ? await supabase.from('perfiles').select('nombre, email').eq('id', creado_por).single() : null
    const creadorNombre = creadorData?.data?.nombre || 'El fundador'

    for (const tarea of data) {
      await registrarHistorial(tarea.id, proyecto_id, 'asignada', creado_por,
        creadorNombre + ' asignó esta tarea a ' + (tarea.asignado_perfil?.nombre || 'sin asignar') + ' al cargar la plantilla de ' + rol_nombre + (segmento ? ' — ' + segmento : ''))
    }

    if (asignado_a && data.length > 0) {
      const asignadoData = await supabase.from('perfiles').select('nombre, email').eq('id', asignado_a).single()
      if (asignadoData.data) {
        await notificar('tarea_asignada', { id: asignado_a, email: asignadoData.data.email }, {
          asignado_nombre: asignadoData.data.nombre,
          cantidad: data.length,
          rol_nombre,
          proyecto_id,
          proyecto_nombre: 'tu proyecto en Escala',
          workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace/tareas'
        })
      }
    }

    return Response.json({ tareas: data, segmento }, { status: 201 })
  }

  if (!nombre) return Response.json({ error: 'Falta nombre' }, { status: 400 })

  const { data, error } = await supabase
    .from('tareas')
    .insert([{ proyecto_id, rol_nombre, asignado_a, nombre, descripcion, categoria, creado_por, razon_creacion, estado: 'pendiente' }])
    .select('*, asignado_perfil:asignado_a ( nombre, email ), creador:creado_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const creadorNombre = data.creador?.nombre || 'El fundador'
  await registrarHistorial(data.id, proyecto_id, 'creada', creado_por,
    creadorNombre + ' creó y asignó esta tarea a ' + (data.asignado_perfil?.nombre || 'sin asignar') +
    (razon_creacion ? '. Razón: ' + razon_creacion : ''))

  if (asignado_a && data.asignado_perfil) {
    await notificar('tarea_asignada', { id: asignado_a, email: data.asignado_perfil.email }, {
      asignado_nombre: data.asignado_perfil.nombre,
      cantidad: 1,
      tarea_nombre: nombre,
      proyecto_id,
      proyecto_nombre: 'tu proyecto en Escala',
      workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace/tareas'
    })
  }

  return Response.json({ tarea: data }, { status: 201 })
}

export async function PATCH(request) {
  const body = await request.json()
  const { id, estado, verificado_por, fecha_limite } = body

  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  if (fecha_limite !== undefined && !estado) {
    const { data, error } = await supabase
      .from('tareas').update({ fecha_limite: fecha_limite || null }).eq('id', id)
      .select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ tarea: data })
  }

  if (!estado) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const tareaAnterior = await supabase.from('tareas').select('*, asignado_perfil:asignado_a ( nombre, email ), proyecto:proyecto_id ( nombre, fundador_id, perfiles:fundador_id ( nombre, email ) )').eq('id', id).single()

  const updates = { estado }
  if (fecha_limite !== undefined) updates.fecha_limite = fecha_limite || null
  if (estado === 'completada') updates.completado_at = new Date().toISOString()
  if (estado === 'verificada' && verificado_por) {
    updates.verificado_at = new Date().toISOString()
    updates.verificado_por = verificado_por
  }

  const { data, error } = await supabase
    .from('tareas').update(updates).eq('id', id)
    .select('*, asignado_perfil:asignado_a ( nombre, email ), verificado_perfil:verificado_por ( nombre ), creador:creado_por ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const accionLabels = { en_progreso: 'iniciada', completada: 'completada', verificada: 'verificada' }
  const quien = verificado_por || tareaAnterior.data?.asignado_a
  const quienData = quien ? await supabase.from('perfiles').select('nombre').eq('id', quien).single() : null
  const quienNombre = quienData?.data?.nombre || 'Un miembro'

  await registrarHistorial(id, tareaAnterior.data?.proyecto_id, estado, quien,
    quienNombre + ' marcó esta tarea como ' + (accionLabels[estado] || estado))

  if (estado === 'completada') {
    const fundadorId = tareaAnterior.data?.proyecto?.fundador_id
    const fundadorEmail = tareaAnterior.data?.proyecto?.perfiles?.email
    const fundadorNombre = tareaAnterior.data?.proyecto?.perfiles?.nombre || 'Fundador'
    if (fundadorId || fundadorEmail) {
      await notificar('tarea_completada', { id: fundadorId, email: fundadorEmail }, {
        fundador_nombre: fundadorNombre,
        tarea_nombre: data.nombre,
        proyecto_id: tareaAnterior.data?.proyecto_id,
        completado_por: data.asignado_perfil?.nombre || 'Un miembro',
        workspace_url: BASE_URL + '/proyectos/' + tareaAnterior.data?.proyecto_id + '/workspace/tareas'
      })
    }
  }

  if (estado === 'verificada' && data.asignado_a) {
    await notificar('tarea_verificada', { id: data.asignado_a, email: data.asignado_perfil?.email }, {
      asignado_nombre: data.asignado_perfil?.nombre,
      tarea_nombre: data.nombre,
      proyecto_id: tareaAnterior.data?.proyecto_id,
      workspace_url: BASE_URL + '/proyectos/' + tareaAnterior.data?.proyecto_id + '/workspace/tareas'
    })

    if (data.asignado_a) {
      try {
        await supabase.rpc('calcular_escala_score', { perfil_uuid: data.asignado_a })
      } catch (e) {
        console.error('Error recalculando score:', e)
      }

      // Logro: primera tarea verificada
      otorgarLogro(supabase, data.asignado_a, 'primera_tarea_verificada', tareaAnterior.data?.proyecto_id).catch(() => {})
    }
  }

  return Response.json({ tarea: data })
}
