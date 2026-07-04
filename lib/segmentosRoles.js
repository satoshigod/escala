// lib/segmentosRoles.js
// Mapa completo de roles → segmentos → tareas
// Cada segmento corresponde a una sub_especialidad que el fundador puede publicar
// El sistema carga las tareas del segmento exacto cuando se crea el rol

export const SEGMENTOS_ROLES = {

  // ══════════════════════════════════════════════════════════
  // ABOGADO
  // ══════════════════════════════════════════════════════════
  'Abogado': {
    'Constitución de empresas': [
      { nombre: 'Redactar estatutos sociales', descripcion: 'Documento base que define el objeto social, capital, órganos de gobierno y reglas de la empresa.', categoria: 'Legal', horas: 8 },
      { nombre: 'Constituir la sociedad ante notaría o Cámara de Comercio', descripcion: 'Escritura pública o documento privado para formalizar la creación legal de la empresa.', categoria: 'Legal', horas: 4 },
      { nombre: 'Registro en Cámara de Comercio', descripcion: 'Inscripción del acta de constitución y obtención del certificado de existencia y representación legal.', categoria: 'Legal', horas: 3 },
      { nombre: 'Obtener NIT en la DIAN', descripcion: 'Registro único tributario y número de identificación tributaria para la empresa.', categoria: 'Legal', horas: 2 },
      { nombre: 'Redactar pacto de socios', descripcion: 'Acuerdo privado entre los aportantes sobre derechos, obligaciones, vesting y reglas de salida.', categoria: 'Legal', horas: 10 },
      { nombre: 'Redactar acuerdo de confidencialidad del equipo fundador', descripcion: 'NDA entre todos los miembros del equipo para proteger la información del proyecto.', categoria: 'Legal', horas: 3 },
      { nombre: 'Registrar la marca ante la SIC', descripcion: 'Solicitud de registro de marca ante la Superintendencia de Industria y Comercio.', categoria: 'Legal', horas: 5 },
      { nombre: 'Abrir RUT en la DIAN', descripcion: 'Registro único tributario inicial para la empresa antes del primer movimiento contable.', categoria: 'Legal', horas: 1 },
    ],

    'Contratos comerciales': [
      { nombre: 'Redactar contrato marco de prestación de servicios', descripcion: 'Contrato base para formalizar relaciones con clientes y proveedores de servicios.', categoria: 'Legal', horas: 6 },
      { nombre: 'Redactar contrato de compraventa de productos', descripcion: 'Contrato estándar para venta de productos con condiciones, garantías y responsabilidades.', categoria: 'Legal', horas: 5 },
      { nombre: 'Redactar acuerdo de distribución', descripcion: 'Contrato con distribuidores o representantes comerciales del producto o servicio.', categoria: 'Legal', horas: 8 },
      { nombre: 'Redactar términos y condiciones de uso de la plataforma', descripcion: 'Documento legal que regula el uso del producto o servicio por parte de los usuarios.', categoria: 'Legal', horas: 10 },
      { nombre: 'Redactar política de privacidad', descripcion: 'Documento de tratamiento de datos personales conforme a la Ley 1581 de 2012 (Colombia).', categoria: 'Legal', horas: 6 },
      { nombre: 'Revisar y negociar contratos con proveedores clave', descripcion: 'Revisión legal de contratos con proveedores de tecnología, logística o infraestructura.', categoria: 'Legal', horas: 8 },
      { nombre: 'Redactar acuerdo de nivel de servicio (SLA)', descripcion: 'Documento que define los niveles mínimos de servicio garantizados a los clientes.', categoria: 'Legal', horas: 5 },
    ],

    'Propiedad intelectual': [
      { nombre: 'Registro de marca nacional', descripcion: 'Solicitud de registro de nombre comercial y logo ante la SIC en las clases de Niza aplicables.', categoria: 'Legal', horas: 5 },
      { nombre: 'Registro de derechos de autor del software', descripcion: 'Inscripción del código fuente ante la DNDA para proteger la propiedad intelectual del producto.', categoria: 'Legal', horas: 4 },
      { nombre: 'Redactar política de uso de marca para terceros', descripcion: 'Guía legal de uso permitido del logo y nombre comercial por aliados, distribuidores y prensa.', categoria: 'Legal', horas: 3 },
      { nombre: 'Revisar patentabilidad del producto o proceso', descripcion: 'Análisis de si el producto, método o proceso cumple con los requisitos de novedad y altura inventiva.', categoria: 'Legal', horas: 8 },
      { nombre: 'Redactar cesión de derechos de propiedad intelectual del equipo', descripcion: 'Contrato por el que cada miembro del equipo cede a la empresa los derechos sobre su trabajo.', categoria: 'Legal', horas: 4 },
    ],

    'Laboral y contratación': [
      { nombre: 'Redactar contratos laborales tipo', descripcion: 'Contratos de trabajo a término fijo e indefinido para los primeros empleados de la empresa.', categoria: 'Legal', horas: 6 },
      { nombre: 'Redactar reglamento interno de trabajo', descripcion: 'Documento obligatorio para empresas con más de 5 trabajadores que regula las condiciones laborales.', categoria: 'Legal', horas: 8 },
      { nombre: 'Redactar política de desvinculación y liquidación', descripcion: 'Protocolo para terminación de contratos laborales y cálculo de liquidaciones.', categoria: 'Legal', horas: 5 },
      { nombre: 'Estructurar esquema de compensación en equity para el equipo', descripcion: 'Diseño legal del plan de participación accionaria (ESOP) para empleados clave.', categoria: 'Legal', horas: 12 },
      { nombre: 'Redactar acuerdos de no competencia', descripcion: 'Cláusulas de no competencia para empleados y contratistas con acceso a información sensible.', categoria: 'Legal', horas: 4 },
    ],

    'Protección de datos': [
      { nombre: 'Diseñar política de tratamiento de datos personales', descripcion: 'Política completa de privacidad y manejo de datos conforme a la normativa colombiana.', categoria: 'Legal', horas: 8 },
      { nombre: 'Registrar base de datos ante la SIC', descripcion: 'Inscripción del registro de bases de datos en el RNBD conforme a la Ley 1581.', categoria: 'Legal', horas: 3 },
      { nombre: 'Redactar avisos de privacidad para cada punto de captura de datos', descripcion: 'Textos legales para formularios, apps y sitios web donde se recopilan datos de usuarios.', categoria: 'Legal', horas: 5 },
      { nombre: 'Definir protocolo de respuesta ante vulneraciones de datos', descripcion: 'Plan de acción y notificación ante incidentes de seguridad que comprometan datos personales.', categoria: 'Legal', horas: 6 },
    ],

    'Inversión y financiación': [
      { nombre: 'Redactar term sheet de inversión', descripcion: 'Documento de condiciones preliminares para una ronda de inversión con inversionistas.', categoria: 'Legal', horas: 10 },
      { nombre: 'Estructurar ronda de financiación (SAFE o deuda convertible)', descripcion: 'Diseño del instrumento financiero más adecuado para la etapa de la empresa.', categoria: 'Legal', horas: 12 },
      { nombre: 'Redactar acuerdo de accionistas post-inversión', descripcion: 'Shareholders agreement que regula los derechos de los inversionistas tras cerrar la ronda.', categoria: 'Legal', horas: 15 },
      { nombre: 'Due diligence legal para inversionistas', descripcion: 'Preparación del paquete de documentos legales que los inversionistas revisarán antes de invertir.', categoria: 'Legal', horas: 20 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // CONTADOR
  // ══════════════════════════════════════════════════════════
  'Contador': {
    'Constitución de empresas': [
      { nombre: 'Definir estructura de capital inicial', descripcion: 'Distribución del capital entre los socios fundadores y valoración inicial de la empresa.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Abrir cuenta bancaria empresarial', descripcion: 'Cuenta corriente a nombre de la empresa para manejar los recursos del proyecto.', categoria: 'Finanzas', horas: 2 },
      { nombre: 'Inscripción en el RUT — DIAN', descripcion: 'Registro único tributario de la empresa ante la Dirección de Impuestos y Aduanas Nacionales.', categoria: 'Finanzas', horas: 2 },
      { nombre: 'Definir régimen tributario (simple o común)', descripcion: 'Análisis y elección del régimen más conveniente según proyección de ingresos del primer año.', categoria: 'Finanzas', horas: 3 },
      { nombre: 'Configurar facturación electrónica DIAN', descripcion: 'Habilitación del sistema de facturación electrónica obligatoria para todas las empresas colombianas.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Crear plan de cuentas contable', descripcion: 'Estructura contable inicial adaptada al modelo de negocio del proyecto bajo NIIF para Pymes.', categoria: 'Finanzas', horas: 5 },
      { nombre: 'Inscribir libros contables ante Cámara de Comercio', descripcion: 'Registro de los libros oficiales de contabilidad exigidos por la normativa colombiana.', categoria: 'Finanzas', horas: 2 },
    ],

    'Contabilidad mensual': [
      { nombre: 'Registrar movimientos contables del mes', descripcion: 'Registro de ingresos, gastos, activos y pasivos en el sistema contable del período.', categoria: 'Finanzas', horas: 8 },
      { nombre: 'Conciliación bancaria mensual', descripcion: 'Verificación de que los registros contables coinciden con los movimientos del extracto bancario.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Preparar estados financieros mensuales', descripcion: 'Balance general, estado de resultados y flujo de caja del período cerrado.', categoria: 'Finanzas', horas: 6 },
      { nombre: 'Presentar informe financiero al equipo directivo', descripcion: 'Reunión mensual para revisar los resultados financieros y tomar decisiones basadas en datos.', categoria: 'Finanzas', horas: 2 },
      { nombre: 'Controlar y actualizar el presupuesto vs. ejecución', descripcion: 'Comparación del presupuesto aprobado contra el gasto real del período.', categoria: 'Finanzas', horas: 3 },
    ],

    'Declaraciones y obligaciones tributarias': [
      { nombre: 'Declaración bimestral de IVA', descripcion: 'Presentación y pago del impuesto al valor agregado ante la DIAN cada dos meses.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Declaración de renta anual', descripcion: 'Declaración del impuesto de renta de la empresa ante la DIAN en los plazos definidos.', categoria: 'Finanzas', horas: 12 },
      { nombre: 'Declaración de industria y comercio (ICA)', descripcion: 'Impuesto municipal sobre ingresos brutos por actividad comercial o industrial.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Presentar información exógena a la DIAN', descripcion: 'Reporte anual de terceros, pagos y retenciones a la Dirección de Impuestos.', categoria: 'Finanzas', horas: 8 },
      { nombre: 'Gestionar retenciones en la fuente', descripcion: 'Cálculo, aplicación y declaración mensual de retenciones en la fuente por pagos a terceros.', categoria: 'Finanzas', horas: 5 },
    ],

    'Nómina y seguridad social': [
      { nombre: 'Liquidar nómina mensual', descripcion: 'Cálculo de salarios, auxilio de transporte, horas extras y deducciones del período.', categoria: 'Finanzas', horas: 6 },
      { nombre: 'Pago de seguridad social y parafiscales', descripcion: 'Pago mensual de EPS, AFP, ARL, caja de compensación, ICBF y SENA.', categoria: 'Finanzas', horas: 3 },
      { nombre: 'Liquidar prestaciones sociales', descripcion: 'Cálculo y provisión mensual de primas, cesantías, intereses y vacaciones.', categoria: 'Finanzas', horas: 4 },
      { nombre: 'Emitir certificados de ingresos y retenciones', descripcion: 'Certificados anuales para cada empleado con sus ingresos y retenciones del año.', categoria: 'Finanzas', horas: 3 },
    ],

    'Auditoría y control interno': [
      { nombre: 'Diseñar sistema de control interno contable', descripcion: 'Procedimientos y controles para prevenir errores y fraudes en los registros financieros.', categoria: 'Finanzas', horas: 12 },
      { nombre: 'Auditoría de estados financieros', descripcion: 'Revisión independiente de los estados financieros para dar fe de su razonabilidad.', categoria: 'Finanzas', horas: 20 },
      { nombre: 'Informe de control interno para la junta directiva', descripcion: 'Reporte de hallazgos, riesgos y recomendaciones de mejora al órgano de gobierno.', categoria: 'Finanzas', horas: 8 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // DESARROLLADOR FULL-STACK
  // ══════════════════════════════════════════════════════════
  'Desarrollador Full-Stack': {
    'MVP / Producto inicial': [
      { nombre: 'Definir arquitectura técnica del producto', descripcion: 'Stack tecnológico, diagrama de arquitectura, APIs y decisiones técnicas documentadas.', categoria: 'Técnico', horas: 8 },
      { nombre: 'Configurar repositorio y estructura de proyecto', descripcion: 'Repositorio en GitHub con ramas, gitflow, CI/CD y documentación inicial.', categoria: 'Técnico', horas: 4 },
      { nombre: 'Configurar base de datos y esquema inicial', descripcion: 'Esquema de tablas, relaciones, migraciones y políticas de seguridad.', categoria: 'Técnico', horas: 8 },
      { nombre: 'Desarrollar autenticación y gestión de usuarios', descripcion: 'Registro, login, recuperación de contraseña y gestión de sesiones.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Desarrollar las 3 funcionalidades core del MVP', descripcion: 'Las funciones esenciales que resuelven el problema principal del usuario.', categoria: 'Técnico', horas: 40 },
      { nombre: 'Deploy inicial en producción', descripcion: 'Primera versión desplegada con dominio propio, SSL y monitoreo básico.', categoria: 'Técnico', horas: 6 },
      { nombre: 'Configurar métricas y analytics básicos', descripcion: 'Instrumentación para medir usuarios activos, conversión y comportamiento.', categoria: 'Técnico', horas: 4 },
    ],

    'Plataforma SaaS': [
      { nombre: 'Diseñar modelo de multi-tenancy', descripcion: 'Arquitectura para aislar los datos de cada cliente en la plataforma.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Desarrollar sistema de suscripciones y billing', descripcion: 'Integración con Stripe u otra pasarela para cobros recurrentes.', categoria: 'Técnico', horas: 16 },
      { nombre: 'Construir panel de administración de clientes', descripcion: 'Interfaz para gestionar cuentas, planes y configuraciones de cada cliente.', categoria: 'Técnico', horas: 20 },
      { nombre: 'Implementar sistema de roles y permisos', descripcion: 'Control de acceso granular por rol dentro de cada cuenta de cliente.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Desarrollar API pública con documentación', descripcion: 'API REST o GraphQL documentada en Swagger/OpenAPI para integraciones.', categoria: 'Técnico', horas: 20 },
      { nombre: 'Configurar sistema de alertas y monitoreo', descripcion: 'Alertas de uptime, errores y performance con Sentry, Datadog o similar.', categoria: 'Técnico', horas: 6 },
    ],

    'E-commerce': [
      { nombre: 'Configurar catálogo de productos', descripcion: 'Sistema de productos con variantes, inventario, imágenes y precios.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Integrar pasarela de pagos', descripcion: 'Wompi, PayU, Stripe u otra pasarela según el país para aceptar pagos online.', categoria: 'Técnico', horas: 10 },
      { nombre: 'Desarrollar carrito de compras y checkout', descripcion: 'Flujo completo de compra con cálculo de envíos, cupones y confirmación.', categoria: 'Técnico', horas: 16 },
      { nombre: 'Integrar sistema de logística y envíos', descripcion: 'Conexión con operadores logísticos para cotización y tracking de envíos.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Configurar email transaccional (confirmaciones, facturas)', descripcion: 'Emails automáticos de confirmación de pedido, pago y despacho.', categoria: 'Técnico', horas: 6 },
    ],

    'Integraciones y APIs': [
      { nombre: 'Mapear todas las integraciones requeridas', descripcion: 'Inventario de sistemas externos que deben conectarse al producto.', categoria: 'Técnico', horas: 4 },
      { nombre: 'Desarrollar integración con CRM', descripcion: 'Conexión con HubSpot, Salesforce u otro CRM para sincronizar contactos y actividad.', categoria: 'Técnico', horas: 12 },
      { nombre: 'Desarrollar integración con ERP o sistema contable', descripcion: 'Conexión con el sistema de facturación y contabilidad de la empresa.', categoria: 'Técnico', horas: 16 },
      { nombre: 'Construir sistema de webhooks', descripcion: 'Mecanismo para notificar a sistemas externos sobre eventos del producto.', categoria: 'Técnico', horas: 8 },
      { nombre: 'Documentar todas las APIs internas', descripcion: 'Documentación técnica completa de los endpoints internos del sistema.', categoria: 'Técnico', horas: 8 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // DISEÑADOR
  // ══════════════════════════════════════════════════════════
  'Diseñador': {
    'Identidad de marca': [
      { nombre: 'Investigación de mercado y análisis de competencia visual', descripcion: 'Análisis de referentes visuales, tendencias del sector y posicionamiento de la competencia.', categoria: 'Diseño', horas: 8 },
      { nombre: 'Definir plataforma de marca (propósito, valores, personalidad)', descripcion: 'Documento estratégico que define la esencia de la marca antes de la identidad visual.', categoria: 'Diseño', horas: 6 },
      { nombre: 'Diseñar logo y variantes', descripcion: 'Logo principal, versión horizontal, versión monocromática e ícono de la marca.', categoria: 'Diseño', horas: 16 },
      { nombre: 'Definir paleta de colores corporativa', descripcion: 'Colores primarios, secundarios y neutros con códigos HEX, RGB y CMYK.', categoria: 'Diseño', horas: 4 },
      { nombre: 'Seleccionar y definir tipografías corporativas', descripcion: 'Fuentes primaria y secundaria para títulos, cuerpo de texto y UI.', categoria: 'Diseño', horas: 3 },
      { nombre: 'Crear manual de marca', descripcion: 'Guía completa de uso del logo, colores, tipografías, fotografía e iconografía.', categoria: 'Diseño', horas: 12 },
    ],

    'UI/UX de producto digital': [
      { nombre: 'Investigación de usuarios (entrevistas y encuestas)', descripcion: 'Entrevistas con usuarios potenciales para entender sus necesidades y dolores.', categoria: 'Diseño', horas: 12 },
      { nombre: 'Definir user personas', descripcion: 'Perfiles detallados de los tipos de usuarios del producto con sus metas y frustraciones.', categoria: 'Diseño', horas: 6 },
      { nombre: 'Crear mapa de flujos de usuario', descripcion: 'Diagramas de los flujos principales que recorre el usuario en el producto.', categoria: 'Diseño', horas: 8 },
      { nombre: 'Diseñar wireframes de baja fidelidad', descripcion: 'Bocetos de las pantallas principales para validar la estructura sin diseño visual.', categoria: 'Diseño', horas: 12 },
      { nombre: 'Diseñar mockups de alta fidelidad', descripcion: 'Diseño visual completo de todas las pantallas con el sistema de diseño aplicado.', categoria: 'Diseño', horas: 30 },
      { nombre: 'Crear prototipo interactivo en Figma', descripcion: 'Prototipo navegable para testear con usuarios antes del desarrollo.', categoria: 'Diseño', horas: 10 },
      { nombre: 'Crear design system y componentes reutilizables', descripcion: 'Biblioteca de componentes UI documentados para que el equipo de desarrollo los implemente.', categoria: 'Diseño', horas: 20 },
    ],

    'Materiales de marketing': [
      { nombre: 'Diseñar plantillas para redes sociales', descripcion: 'Templates editables para posts, stories e historias en Instagram, LinkedIn y otras redes.', categoria: 'Diseño', horas: 8 },
      { nombre: 'Diseñar pitch deck para inversionistas', descripcion: 'Presentación visual de 10-15 slides para presentar el proyecto a inversionistas.', categoria: 'Diseño', horas: 12 },
      { nombre: 'Diseñar materiales de ventas (one pager, brochure)', descripcion: 'Documentos comerciales para presentar el producto a clientes potenciales.', categoria: 'Diseño', horas: 8 },
      { nombre: 'Diseñar email templates transaccionales', descripcion: 'Plantillas HTML para los emails automáticos del producto (bienvenida, facturas, alertas).', categoria: 'Diseño', horas: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // GERENTE DE PROYECTO
  // ══════════════════════════════════════════════════════════
  'Gerente de Proyecto': {
    'Lanzamiento de proyecto': [
      { nombre: 'Definir alcance y objetivos del proyecto', descripcion: 'Documento de alcance con entregables, exclusiones, supuestos y criterios de éxito.', categoria: 'Gestión', horas: 6 },
      { nombre: 'Crear plan de proyecto con hitos y fechas', descripcion: 'Cronograma con todas las actividades, responsables y fechas clave del proyecto.', categoria: 'Gestión', horas: 8 },
      { nombre: 'Definir metodología de trabajo del equipo', descripcion: 'Sprints, reuniones, canales de comunicación y herramientas de colaboración.', categoria: 'Gestión', horas: 4 },
      { nombre: 'Onboarding de cada miembro del equipo', descripcion: 'Sesión de inducción con accesos, contexto del proyecto y expectativas del rol.', categoria: 'Gestión', horas: 2 },
      { nombre: 'Crear tablero de seguimiento del proyecto', descripcion: 'Configuración del tablero en Trello, Notion, Jira u otra herramienta elegida.', categoria: 'Gestión', horas: 4 },
      { nombre: 'Definir estructura de reuniones recurrentes', descripcion: 'Agenda y frecuencia de dailies, weeklies y retrospectivas del equipo.', categoria: 'Gestión', horas: 2 },
    ],

    'Operaciones y control': [
      { nombre: 'Seguimiento semanal de avance del proyecto', descripcion: 'Revisión del progreso de cada área y ajuste del plan según desviaciones.', categoria: 'Gestión', horas: 3 },
      { nombre: 'Gestionar riesgos e impedimentos del equipo', descripcion: 'Identificación y resolución de bloqueos que frenan el avance del proyecto.', categoria: 'Gestión', horas: 4 },
      { nombre: 'Producir informe mensual de avance', descripcion: 'Reporte ejecutivo del estado del proyecto para el fundador y los aportantes.', categoria: 'Gestión', horas: 4 },
      { nombre: 'Gestionar el presupuesto del proyecto', descripcion: 'Control de gastos, proyecciones y alertas de desviación presupuestaria.', categoria: 'Gestión', horas: 4 },
      { nombre: 'Coordinar entregables entre áreas', descripcion: 'Asegurar que las dependencias entre equipo técnico, diseño y negocio estén alineadas.', categoria: 'Gestión', horas: 6 },
    ],

    'Relaciones con inversionistas': [
      { nombre: 'Preparar investor update mensual', descripcion: 'Comunicación mensual a inversionistas con métricas, hitos y próximos pasos.', categoria: 'Gestión', horas: 6 },
      { nombre: 'Organizar reunión de junta trimestral', descripcion: 'Preparación de agenda, presentación y actas de la reunión de junta directiva.', categoria: 'Gestión', horas: 8 },
      { nombre: 'Gestionar data room para due diligence', descripcion: 'Organizar y mantener actualizado el repositorio de documentos para inversionistas.', categoria: 'Gestión', horas: 8 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // COMMUNITY MANAGER
  // ══════════════════════════════════════════════════════════
  'Community Manager': {
    'Lanzamiento de marca en redes': [
      { nombre: 'Crear perfiles en redes sociales', descripcion: 'LinkedIn, Instagram, TikTok y WhatsApp Business con información completa del proyecto.', categoria: 'Marketing', horas: 4 },
      { nombre: 'Definir tono y voz de la marca', descripcion: 'Guía de comunicación: cómo habla la marca, qué publica y qué evita.', categoria: 'Marketing', horas: 4 },
      { nombre: 'Crear plan de contenido del primer mes', descripcion: 'Calendario editorial con 12-16 publicaciones, formatos y temas del primer mes.', categoria: 'Marketing', horas: 6 },
      { nombre: 'Diseñar y publicar contenido de lanzamiento', descripcion: 'Publicaciones de presentación de la marca para dar a conocer el proyecto.', categoria: 'Marketing', horas: 8 },
      { nombre: 'Configurar herramientas de programación y analítica', descripcion: 'Buffer, Hootsuite o Meta Business Suite para programar y medir el contenido.', categoria: 'Marketing', horas: 3 },
    ],

    'Gestión mensual de comunidad': [
      { nombre: 'Producir y publicar contenido semanal', descripcion: 'Mínimo 3-4 publicaciones semanales según el plan de contenido aprobado.', categoria: 'Marketing', horas: 12 },
      { nombre: 'Gestionar comentarios y mensajes directos', descripcion: 'Respuesta oportuna a comentarios, preguntas y mensajes de la comunidad.', categoria: 'Marketing', horas: 6 },
      { nombre: 'Preparar informe mensual de métricas', descripcion: 'Reporte de alcance, engagement, seguidores y conversiones del mes.', categoria: 'Marketing', horas: 4 },
      { nombre: 'Analizar y optimizar el rendimiento del contenido', descripcion: 'Revisión de qué formatos y temas funcionan mejor para ajustar la estrategia.', categoria: 'Marketing', horas: 3 },
    ],

    'Estrategia de adquisición': [
      { nombre: 'Definir estrategia de growth en redes sociales', descripcion: 'Plan para crecer la audiencia orgánicamente con tácticas de engagement y colaboraciones.', categoria: 'Marketing', horas: 8 },
      { nombre: 'Ejecutar campaña de lanzamiento de producto', descripcion: 'Campaña coordinada de contenido orgánico para el lanzamiento o actualización del producto.', categoria: 'Marketing', horas: 12 },
      { nombre: 'Gestionar colaboraciones con influencers o aliados', descripcion: 'Identificar, contactar y coordinar colaboraciones con perfiles afines a la marca.', categoria: 'Marketing', horas: 8 },
      { nombre: 'Crear y gestionar campaña de pauta digital', descripcion: 'Configuración y optimización de campañas pagadas en Meta Ads o Google Ads.', categoria: 'Marketing', horas: 10 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // INVERSIONISTA INICIAL / CAPITALISTA
  // ══════════════════════════════════════════════════════════
  'Capitalista': {
    'Inversión en etapa temprana': [
      { nombre: 'Revisar y aprobar el modelo de negocio', descripcion: 'Análisis del modelo de monetización, proyecciones financieras y supuestos clave.', categoria: 'Inversión', horas: 8 },
      { nombre: 'Negociar y firmar term sheet de inversión', descripcion: 'Acuerdo de condiciones de la inversión: monto, valoración, derechos y restricciones.', categoria: 'Inversión', horas: 6 },
      { nombre: 'Transferir capital inicial acordado', descripcion: 'Aporte del capital comprometido a la cuenta bancaria del proyecto.', categoria: 'Inversión', horas: 1 },
      { nombre: 'Firmar acuerdo de accionistas', descripcion: 'Firma del shareholders agreement que define derechos y obligaciones como inversionista.', categoria: 'Inversión', horas: 4 },
      { nombre: 'Revisar y aprobar estatutos de la empresa', descripcion: 'Validación del documento legal antes del registro ante la Cámara de Comercio.', categoria: 'Inversión', horas: 3 },
    ],

    'Seguimiento de inversión': [
      { nombre: 'Revisar investor update mensual', descripcion: 'Análisis del reporte mensual del equipo con métricas, avances y alertas.', categoria: 'Inversión', horas: 2 },
      { nombre: 'Participar en reunión de junta trimestral', descripcion: 'Asistencia y participación activa en la reunión de junta directiva del trimestre.', categoria: 'Inversión', horas: 3 },
      { nombre: 'Hacer seguimiento a los hitos acordados', descripcion: 'Verificación de que el equipo está cumpliendo los hitos comprometidos en el term sheet.', categoria: 'Inversión', horas: 2 },
      { nombre: 'Evaluar necesidad de ronda de seguimiento', descripcion: 'Análisis de si el proyecto requiere capital adicional y en qué condiciones.', categoria: 'Inversión', horas: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // MENTOR
  // ══════════════════════════════════════════════════════════
  'Mentor': {
    'Mentoría estratégica': [
      { nombre: 'Sesión inicial de diagnóstico del proyecto', descripcion: 'Reunión de 2 horas para entender el estado actual, retos y oportunidades del proyecto.', categoria: 'Mentoría', horas: 2 },
      { nombre: 'Definir plan de mentoría y objetivos', descripcion: 'Documento con los temas a trabajar, frecuencia de sesiones y métricas de éxito.', categoria: 'Mentoría', horas: 2 },
      { nombre: 'Sesiones mensuales de mentoría', descripcion: 'Reunión mensual de 1-2 horas para revisar avances, resolver dudas y dar orientación.', categoria: 'Mentoría', horas: 2 },
      { nombre: 'Revisar y dar feedback al pitch deck', descripcion: 'Revisión del pitch para inversionistas con recomendaciones de mejora.', categoria: 'Mentoría', horas: 3 },
      { nombre: 'Abrir puertas con contactos de la red', descripcion: 'Introducción a 2-3 contactos relevantes (inversionistas, clientes o aliados) del network del mentor.', categoria: 'Mentoría', horas: 3 },
    ],
  },

}

// Obtener todos los segmentos disponibles para un rol
export function getSegmentosRol(nombreRol) {
  return Object.keys(SEGMENTOS_ROLES[nombreRol] || {})
}

// Obtener tareas de un rol y segmento específico
export function getTareasSegmento(nombreRol, segmento) {
  return SEGMENTOS_ROLES[nombreRol]?.[segmento] || []
}

// Obtener todos los roles con sus segmentos (para el selector del fundador)
export function getRolesConSegmentos() {
  return Object.entries(SEGMENTOS_ROLES).map(([rol, segmentos]) => ({
    rol,
    segmentos: Object.keys(segmentos),
    totalTareas: Object.values(segmentos).reduce((acc, tareas) => acc + tareas.length, 0)
  }))
}
