'use client'
import { useState } from 'react'

const fases = [
  {
    num: '01',
    titulo: 'Presentación y diseño web',
    estado: 'completa',
    valor_total: 3200000,
    valor_hecho: 3200000,
    hitos: [
      { num: '1.1', nombre: 'Arquitectura de información y navegación', done: true, valor: 400000, quien: 'Claude AI + Fundador' },
      { num: '1.2', nombre: 'Diseño visual y sistema de estilos mobile-first', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '1.3', nombre: 'Página principal (index.html)', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '1.4', nombre: 'Página de proyectos (proyectos.html)', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.5', nombre: 'Página proyecto piloto (proyecto-escala.html)', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.6', nombre: 'Página Ángel de Impulso (impulso.html)', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '1.7', nombre: 'Página de costos (costos.html)', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '1.8', nombre: 'Página expectativa WhatsApp (coming.html)', done: true, valor: 100000, quien: 'Claude AI' },
    ]
  },
  {
    num: '02',
    titulo: 'Backend y base de datos',
    estado: 'completa',
    valor_total: 12000000,
    valor_hecho: 12000000,
    hitos: [
      { num: '2.1', nombre: 'Modelo de datos completo — 8 tablas Supabase PostgreSQL', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.2', nombre: 'Sistema de autenticación — Supabase Auth + trigger perfiles', done: true, valor: 1500000, quien: 'Supabase + Claude AI' },
      { num: '2.3', nombre: 'API REST proyectos, usuarios y roles — 3 endpoints', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '2.4', nombre: 'API aportes, hitos y postulaciones — 3 endpoints', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.5', nombre: 'Sistema de notificaciones por email con Resend — postulaciones, tareas, invitaciones', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '2.6', nombre: 'Almacenamiento de archivos (Supabase Storage) — API /api/upload con validación de tipo y tamaño', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '2.7', nombre: 'Infraestructura y despliegue — GitHub + Vercel + Supabase', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '03',
    titulo: 'Frontend operativo — plataforma real',
    estado: 'completa',
    valor_total: 20000000,
    valor_hecho: 20000000,
    hitos: [
      { num: '3.1', nombre: 'Registro y onboarding de usuarios — 3 pasos', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.2', nombre: 'Publicación y gestión de proyectos con listado en tiempo real', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '3.3', nombre: 'Detalle de proyecto con 9 roles reales y postulación real', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '3.4', nombre: 'Panel de aportes con trazabilidad completa', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.5', nombre: 'Panel fundador — postulaciones recibidas por rol con aceptar/rechazar', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.6', nombre: 'Panel postulante — historial de postulaciones enviadas', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '3.7', nombre: 'Hitos del proyecto — crear, completar, expediente', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.8', nombre: 'Perfil público de usuario con Score, métricas y WhatsApp directo', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.9', nombre: 'Panel de administración interno Escala con tabs', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '3.10', nombre: 'Link perfil postulante desde panel fundador', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '3.11', nombre: 'Página de proyecto enriquecida — descripción, hitos completados, roles prioritarios, WhatsApp', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.12', nombre: 'API postulaciones incluye nombre del proyecto (join con proyectos)', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '3.13', nombre: 'Postulaciones clickeables — llevan al proyecto o workspace según estado', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '04',
    titulo: 'Dashboard contextual multi-rol',
    estado: 'completa',
    valor_total: 7500000,
    valor_hecho: 7500000,
    hitos: [
      { num: '4.1', nombre: 'Dashboard con 3 tabs: Especialista / Fundador / Notificaciones', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '4.2', nombre: 'Tab especialista — postulaciones, score, explorar proyectos, aportes, carril', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.3', nombre: 'Tab fundador — mis proyectos, postulaciones recibidas, hitos, ingresos', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.4', nombre: 'Tab notificaciones — aceptaciones, rechazos, nuevas postulaciones recibidas', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.5', nombre: 'Nombre del proyecto en cada postulación — fundador y especialista', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '4.6', nombre: 'Botones aceptar/rechazar y ver perfil directo desde dashboard fundador', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '4.7', nombre: 'Perfil público con WhatsApp — link desde panel fundador y notificaciones', done: true, valor: 700000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '05',
    titulo: 'Sistema de calificación y Escala Score',
    estado: 'completa',
    valor_total: 8000000,
    valor_hecho: 8000000,
    hitos: [
      { num: '5.1', nombre: 'Algoritmo del Escala Score — 4 dimensiones verificables', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '5.2', nombre: 'Página Mi Score con gráfico circular, métricas y cómo subir', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '5.3', nombre: 'Panel de definición de carril A/B/C por postulación', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '5.4', nombre: 'Track record público — historial verificable en perfil de usuario', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '06',
    titulo: 'Ingresos, pagos y distribución',
    estado: 'progreso',
    valor_total: 9800000,
    valor_hecho: 5000000,
    hitos: [
      { num: '6.1', nombre: 'Registro de ingresos con preview de distribución automática', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '6.2', nombre: 'Panel Ángel de Impulso — explorar hitos, financiar, historial', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '6.3', nombre: 'Integración Wompi (pagos Colombia)', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '6.4', nombre: 'Facturación electrónica DIAN', done: false, valor: 2300000, quien: 'Desarrollador + Contador' },
    ]
  },
  {
    num: '09',
    titulo: 'Workspace del proyecto — colaboración del equipo',
    estado: 'completa',
    valor_total: 10000000,
    valor_hecho: 10000000,
    hitos: [
      { num: '9.1', nombre: 'Workspace con 5 tabs: Resumen, Hitos, Equipo, Mis aportes, Economía', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '9.2', nombre: 'Control de acceso — solo miembros aceptados y fundador', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '9.3', nombre: 'Tab equipo — todos los miembros con rol, ciudad, WhatsApp directo', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '9.4', nombre: 'Tab hitos — kanban pendiente/completado con crear y marcar desde workspace', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '9.5', nombre: 'Tab aportes — registrar aportes directamente en el workspace', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '9.6', nombre: 'Tab economía — deuda diferida, participación, carriles explicados', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '9.7', nombre: 'Links al workspace desde dashboard fundador y especialista', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '9.8', nombre: 'Chat interno del equipo por proyecto — tiempo real con Supabase Realtime', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '9.9', nombre: 'Notificaciones por email — nueva postulacion, aceptada, rechazada con Resend', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '10',
    titulo: 'Descubrimiento — buscar, filtrar, directorio',
    estado: 'completa',
    valor_total: 5000000,
    valor_hecho: 5000000,
    hitos: [
      { num: '10.1', nombre: 'Directorio de especialistas con búsqueda por nombre, especialidad y ciudad', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '10.2', nombre: 'Buscar proyectos con filtros por sector, tipo A/B y ciudad', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '10.3', nombre: 'Página de bienvenida para usuarios nuevos sin perfil', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '10.4', nombre: 'Redireccion inteligente según estado del perfil', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '11',
    titulo: 'Herramientas del fundador — reclutamiento y analítica',
    estado: 'completa',
    valor_total: 6500000,
    valor_hecho: 6500000,
    hitos: [
      { num: '11.1', nombre: 'Invitar especialistas por email con mensaje personalizado y link del proyecto', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '11.2', nombre: 'Pagina publica del proyecto sin login — compartible por WhatsApp y redes', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '11.3', nombre: 'Panel de metricas — postulaciones por rol, embudo de conversion, tasa de aceptacion', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '11.4', nombre: 'Template de invitacion por email con Resend', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '12',
    titulo: 'Plan de trabajo por rol — tareas, historial y notificaciones',
    estado: 'completa',
    valor_total: 7000000,
    valor_hecho: 7000000,
    hitos: [
      { num: '12.1', nombre: 'Plantillas de tareas iniciales por rol — Abogado, Contador, Desarrollador, Gerente, Diseñador, CM, Inversionista', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '12.2', nombre: 'Carga de plantilla por rol con asignación a miembro del equipo', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '12.3', nombre: 'Flujo de estados: pendiente → en progreso → completada → verificada', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '12.4', nombre: 'Verificación de tareas por fundador o gerente de proyecto', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '12.5', nombre: 'Crear tareas nuevas con razón de creación visible para el equipo', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '12.6', nombre: 'Filtros por estado — especialistas ven solo sus tareas por defecto', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '12.7', nombre: 'Gerente ve sus tareas primero con toggle para ver todo el equipo', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '12.8', nombre: 'Historial de asignaciones registrado en base de datos', done: true, valor: 750000, quien: 'Claude AI + Fundador' },
      { num: '12.9', nombre: 'Emails automáticos: tarea asignada, completada y verificada', done: true, valor: 750000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '13',
    titulo: 'Inteligencia operativa — automatización y personalización',
    estado: 'completa',
    valor_total: 20500000,
    valor_hecho: 20500000,
    hitos: [
      { num: '13.1', nombre: 'Selector de industria al crear proyecto con carga automática de tareas comerciales', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '13.2', nombre: 'Selector de país al crear proyecto con carga automática de tareas regulatorias', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '13.3', nombre: 'Biblioteca de tareas regulatorias por país — 7 países con 5-6 tareas cada uno', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '13.4', nombre: 'Biblioteca de tareas comerciales por industria — 5 industrias con 6 tareas cada una', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '13.5', nombre: 'Asignación inteligente de tareas — filtrar ejecutores por categoría del rol', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.6', nombre: 'Campo país de jurisdicción en onboarding y perfil del especialista', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.7', nombre: 'Columnas industria y pais en tabla proyectos (migración SQL)', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '13.8', nombre: 'Perfiles comerciales por industria configurables desde admin sin tocar código', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '13.9', nombre: 'Panel admin completamente parametrizable — industrias, países, tareas sin deploy (CRUD completo)', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '13.10', nombre: 'Selectores de país dinámicos — leen de DB, permiten crear país nuevo con alerta al admin', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '13.11', nombre: 'API /api/paises — crear país desde cliente, alerta email al admin con link a configurar tareas', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.12', nombre: 'Fix crítico: .single() de Supabase bloqueaba creación de países nuevos sin tareas previas', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '13.13', nombre: 'Fix botón crear país — type=button explícito para evitar conflicto de eventos en React', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '13.14', nombre: 'Fix crítico: campo estado faltaba en insert de proyectos — todos quedaban invisibles', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.15', nombre: 'Eliminar proyectos desde admin — borra en cascada roles, tareas, postulaciones, hitos, aportes', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.16', nombre: 'Eliminar usuarios desde admin — borra perfil, postulaciones y cuenta de Supabase Auth', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.17', nombre: 'Doble confirmación de seguridad al eliminar — requiere escribir el nombre exacto', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '13.18', nombre: 'QA completo del flujo de país — 4 funcionalidades verificadas end-to-end', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '14',
    titulo: 'Cobertura completa del documento consolidado',
    estado: 'progreso',
    valor_total: 19300000,
    valor_hecho: 19300000,
    hitos: [
      { num: '14.1', nombre: 'Perfil Comercial de Escala — roadmap propio en /comercial con convenios estratégicos', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '14.2', nombre: 'Desarrollo de alianzas — incubadoras, aceleradoras, universidades, fondos (en /comercial)', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '14.3', nombre: 'Estrategia de adquisición por tipo de usuario — Fundadores, Ejecutores, Gerentes, Ángeles, Mentores, Empresas (en /comercial)', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '14.4', nombre: 'Distinción especialistas locales vs globales — filtro regulatorio estricto vs apertura internacional', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '14.4b', nombre: 'Fix crítico: React no refrescaba opciones del selector Asignar — agregada key única por categoría', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '14.4c', nombre: 'Selector dinámico de especialidades en onboarding — igual que países, con opción de crear nueva', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '14.5', nombre: 'Crear nuevos perfiles profesionales (especialidades) desde admin sin tocar código — CRUD completo en tab Especialidades', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '14.6', nombre: 'Categorías como entidad dinámica — tabla propia, API y selector con opción crear nueva, igual que países', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '14.7', nombre: 'Dashboard único de admin (tab Resumen) — usuarios, proyectos, score promedio y enlaces a técnico/comercial/QA en un vistazo', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '14.8', nombre: 'Alerta visible de países pendientes de configurar — badge en tab y panel dedicado, no solo email', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '14.9', nombre: 'Auditoría creado_por extendida a países, categorías y especialidades — quién creó cada una, visible en admin', done: true, valor: 700000, quien: 'Claude AI + Fundador' },
      { num: '14.10', nombre: 'Panel Resumen incluye contadores de Categorías y Roles/Especialidades, no solo países', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '14.11', nombre: 'UX — explicación contextual de cada rol en onboarding (ejemplo concreto al seleccionar)', done: true, valor: 600000, quien: 'Claude AI + Fundador' },
      { num: '14.12', nombre: 'UX — explainer expandible de cómo sube el Escala Score en /score', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '14.13', nombre: 'UX — tooltips de Tipo A/B en resultados de búsqueda', done: true, valor: 300000, quien: 'Claude AI + Fundador' },
      { num: '14.14', nombre: 'UX — página /que-es-escala con manual funcional visible antes del registro', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '14.15', nombre: 'Resumen distingue categorías/especialidades base del sistema vs creadas orgánicamente por usuarios', done: true, valor: 300000, quien: 'Claude AI + Fundador' },
      { num: '14.16', nombre: 'Fix UX: guardar especialidad crea automáticamente la categoría pendiente si el usuario escribió texto sin darle clic a Crear', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '14.17', nombre: 'Fix raíz: sintaxis .insert([objeto]) descartaba silenciosamente creado_por en Supabase JS — corregido a .insert(objeto) explícito en países, categorías y especialidades', done: true, valor: 600000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '15',
    titulo: 'Rediseño del Dashboard — centro de operaciones',
    estado: 'completa',
    valor_total: 8000000,
    valor_hecho: 8000000,
    hitos: [
      { num: '15.1', nombre: 'D1 — Endpoint agregador /api/dashboard, reemplaza 13+ llamadas N+1 por consultas paralelas en servidor', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '15.2', nombre: 'D2 — Bandeja de trabajo unificada: tareas, hitos y postulaciones pendientes en una sola lista accionable', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '15.3', nombre: 'D3 — Rediseño visual completo: header compacto, bandeja+acciones lado a lado, proyectos como tarjetas, sidebar de indicadores', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '15.4', nombre: 'D4 — Vistas diferenciadas: Gerente (carga de equipo por persona) y Ángel de Impulso (hitos financiados, retorno)', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '15.5', nombre: 'D5 — Página /perfil/editar nueva + campos idiomas, disponibilidad, reconocimientos visibles en perfil público', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '15.6', nombre: 'D6 — Calendario mensual /calendario: tareas con fecha_limite, hitos, próximos 7 días, asignación de fechas inline', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '16',
    titulo: 'Completar el documento de rediseño — todo lo faltante',
    estado: 'completa',
    valor_total: 6000000,
    valor_hecho: 6000000,
    hitos: [
      { num: '16.1', nombre: 'Roles Mentor y Empresa — onboarding con 7 roles, vistas diferenciadas en dashboard', done: true, valor: 1200000, quien: 'Claude AI + Fundador' },
      { num: '16.2', nombre: 'Métricas visuales — gráficos SVG nativos: aportes por mes, donut por tipo, tareas por estado, hitos', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '16.3', nombre: 'Perfil — horas aportadas, valor generado, participaciones activas visibles en perfil público', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '16.4', nombre: 'Dashboard — mensajes sin leer con badge real, proyectos finalizados en sidebar', done: true, valor: 700000, quien: 'Claude AI + Fundador' },
      { num: '16.5', nombre: 'API usuarios extendida — metricas calculadas (horasAportadas, valorGenerado, participacionesActivas, empresasParticipa)', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '16.6', nombre: 'Endpoint dashboard — mensajesNoLeidos y proyectosFinalizados calculados en servidor', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '07',
    titulo: 'Contratos digitales y documentos legales',
    estado: 'pendiente',
    valor_total: 8000000,
    valor_hecho: 0,
    hitos: [
      { num: '7.1', nombre: 'Plantillas legales base (abogado + desarrollador)', done: false, valor: 1400000, quien: 'Abogado + Desarrollador' },
      { num: '7.2', nombre: 'Motor de generación automática de contratos', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '7.3', nombre: 'Integración de firma digital (DocuSign/HelloSign)', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '7.4', nombre: 'Expediente digital del proyecto exportable a PDF', done: false, valor: 2100000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '08',
    titulo: 'Mejoras de plataforma y escala',
    estado: 'pendiente',
    valor_total: 6000000,
    valor_hecho: 4000000,
    hitos: [
      { num: '8.1', nombre: 'Notificaciones en tiempo real — toast + indicador de conexión vía Supabase Realtime en dashboard', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '8.2', nombre: 'Subida de archivos y evidencias de aportes — UI completa con preview en /aportes', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '8.3', nombre: 'Búsqueda y filtros avanzados — país, industria, especialidad, score mínimo, ordenamiento en /buscar y /directorio', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '8.4', nombre: 'App móvil (React Native o PWA)', done: false, valor: 2000000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '17',
    titulo: 'Sistema de Notificaciones Multicanal',
    estado: 'progreso',
    valor_total: 24950000,
    valor_hecho: 12950000,
    hitos: [
      { num: '17.1', nombre: 'Infraestructura base — tablas notificaciones, push_subscriptions y preferencias_notificacion con RLS y Realtime activado', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '17.2', nombre: 'Motor central de despacho notificar() — email + in-app + push en un solo punto de entrada, con reglas de prioridad (CRÍTICA no se puede desactivar)', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '17.3', nombre: 'Catálogo de eventos Fase 1 — 12 eventos cableados a puntos reales: proyectos, postulaciones, tareas, hitos, aportes y alertas de administración', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '17.4', nombre: 'Web Push — Service Worker, suscripción VAPID y envío con librería web-push (funciona en desktop y Android; en iOS requiere agregar a pantalla de inicio)', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '17.5', nombre: 'Centro de notificaciones real en el Dashboard — feed persistente con marcar leída/marcar todas, realtime multi-evento (ya no solo postulaciones), botón activar push', done: true, valor: 1800000, quien: 'Claude AI + Fundador' },
      { num: '17.6', nombre: 'Dominio propio verificado con DKIM/SPF/DMARC en Resend (mail.escala.network) — infraestructura de envío transaccional', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '17.7', nombre: 'Canal SMS — requiere contratar proveedor nuevo (Twilio o Sinch), no implementado todavía', done: false, valor: 1500000, quien: 'Desarrollador' },
      { num: '17.8', nombre: 'Canal WhatsApp — requiere API oficial de Meta vía Twilio o 360Dialog, no implementado todavía', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '17.9', nombre: 'Preferencias por tipo de evento — hoy es un toggle global de email/push, falta granularidad por categoría como pide el documento', done: false, valor: 800000, quien: 'Desarrollador' },
      { num: '17.10', nombre: 'Notificaciones basadas en tiempo (hito por vencer, proyecto sin actividad, tarea vencida) — requiere Vercel Cron Jobs', done: false, valor: 1200000, quien: 'Desarrollador' },
      { num: '17.11', nombre: 'Migrar invitaciones (/invitar) al motor notificar() con detección de usuario ya registrado para sumar in-app', done: false, valor: 500000, quien: 'Desarrollador' },
      { num: '17.12', nombre: 'Resto del catálogo del documento (~217 eventos) — contratos, facturación, marketplace, votaciones, inversionistas, suscripciones, moderación, soporte, comunidad, logros, liquidación, IA, integraciones, API pública. Se cablean a medida que cada módulo se construye; estimado solo del trabajo de notificación, no de construir el módulo en sí', done: false, valor: 6000000, quien: 'Desarrollador' },
      { num: '17.13', nombre: 'Correos de autenticación (registro, recuperación de contraseña) conectados a Resend con dominio propio vía SMTP — infraestructura de envío, independiente de si se exige confirmar o no', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '17.14', nombre: 'Migración de dominio — los 9 archivos que generaban links (correos, invitaciones, compartir proyecto) apuntan a escala.network en vez del subdominio de Vercel', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '17.15', nombre: 'Verificación de correo no-bloqueante — sistema propio independiente de Supabase Auth: banner en el dashboard con reenvío, nunca impide registrarse ni usar la plataforma', done: true, valor: 1200000, quien: 'Claude AI + Fundador' },
      { num: '17.16', nombre: 'Panel de pruebas integrado a /qa — 13 tests nuevos que disparan los 12 eventos reales de notificación contra tu propio usuario, con limpieza automática de datos de prueba', done: true, valor: 700000, quien: 'Claude AI' },
      { num: '17.17', nombre: 'Fix: POST /api/aportes insertaba NULL en fecha en vez de usar el default de la base de datos, violando el constraint — encontrado por el panel de QA, no era exclusivo de las pruebas', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '17.18', nombre: 'escala.network sirve la presentación (index.html) directo en la raíz sin cambiar la URL — antes redirigía visiblemente a /index.html', done: true, valor: 250000, quien: 'Claude AI' },
    ]
  },
  {
    num: '18',
    titulo: 'Rediseño de la landing page — arquitectura de información',
    estado: 'completa',
    valor_total: 5950000,
    valor_hecho: 5950000,
    hitos: [
      { num: '18.1', nombre: 'Auditoría UX y estrategia de contenido de la landing — comité de expertos simulado (producto, UX, VC, CRO, storytelling), 20 preguntas + 8 perspectivas de usuario', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '18.2', nombre: 'index.html reconstruido — de 3.840 a ~1.030 palabras (73% más corto), 6 secciones con un solo objetivo por página en vez de 16 secciones compitiendo entre sí', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '18.3', nombre: '7 páginas nuevas — perfiles.html, casos.html, compensacion.html, proteccion.html, inversionistas.html, por-que-existe.html y faq.html, con el contenido que sobraba en el home movido a su propio lugar', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: '18.4', nombre: 'Fix de honestidad — los 8 casos de ejemplo (VetApp, Ekivibe, etc.) quedan etiquetados como "ejemplo ilustrativo", ya no se leen como casos de éxito verificados con datos inventados', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '18.5', nombre: 'Fix de naming — "Tipo A/B" de proyectos ya no choca con "Carril A/B/C" de compensación, se renombraron a Creación/Transformación', done: true, valor: 150000, quien: 'Claude AI' },
      { num: '18.6', nombre: 'FAQ nueva — 8 preguntas reales (legal, incumplimiento, diferencia con freelance, etc.) sin inventar cifras de negocio que Escala no tiene todavía', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '18.7', nombre: 'Deep-linking entre páginas — el selector de perfiles del home salta directo a la pestaña correcta en perfiles.html en vez de abrir la página en la pestaña por defecto', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '18.8', nombre: 'Fix: carriles de compensación y tipos de proyecto quedaron sin ninguna mención en el home tras la reestructuración inicial — se agregaron versiones resumidas con link a compensacion.html', done: true, valor: 300000, quien: 'Claude AI' },
    ]
  },
  {
    num: '19',
    titulo: 'Modelo de Compensación — Cumplió/Forma de Pago (reemplaza Carriles A/B/C)',
    estado: 'completa',
    valor_total: 5500000,
    valor_hecho: 5500000,
    hitos: [
      { num: '19.1', nombre: 'Migración de base de datos — estado_financiacion en proyectos, cumplio/forma_pago en postulaciones, tabla nueva deuda_pendiente con RLS', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '19.2', nombre: 'Toggle "Con Recursos para Etapa Inicial" / "Riesgo Compartido" en la creación de proyecto', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '19.3', nombre: '/carril reescrito por completo — confirmar cumplimiento (con vista de tareas verificadas del especialista) y elegir forma de pago según el estado del proyecto', done: true, valor: 1800000, quien: 'Claude AI' },
      { num: '19.4', nombre: 'API de deuda pendiente + registro visible en el workspace, ordenado de menor a mayor, con resolución selectiva (pagar cash o formalizar acciones deuda por deuda)', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '19.5', nombre: 'Nuevo evento de notificación — cumplimiento_confirmado, avisa al especialista con la forma de pago definida (o que no aplicó pago)', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '19.6', nombre: 'Fix: GET de postulaciones no soportaba filtrar "todas las postulaciones de mis proyectos" — /carril viejo consultaba la relación al revés y nunca mostraba nada real', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '19.7', nombre: 'Actualización de textos en detalle de proyecto, workspace y dashboard — ya no mencionan carriles A/B/C', done: true, valor: 300000, quien: 'Claude AI' },
    ]
  },
  {
    num: '20',
    titulo: 'Navegación intuitiva — auditoría y fixes',
    estado: 'progreso',
    valor_total: 9900000,
    valor_hecho: 9900000,
    hitos: [
      { num: '20.1', nombre: 'Fix: el Enter en el campo de contraseña no enviaba el formulario de login ni el de registro — había que darle clic al botón sí o sí', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '20.2', nombre: 'Fix: el logo de Escala no era clickeable en NINGUNA de las 26 páginas de la app — auditoría completa + link agregado en las 20 que faltaban, con el destino correcto según si la página requiere sesión o es pública', done: true, valor: 1600000, quien: 'Claude AI' },
      { num: '20.3', nombre: 'Fix: la landing pública solo tenía botón de Registrarme — se agregó "Iniciar sesión" al nav y al menú móvil de las 8 páginas, más soporte de ?modo=login en /registro para abrir directo en esa pestaña', done: true, valor: 700000, quien: 'Claude AI' },
      { num: '20.4', nombre: 'Fix: "Salir" del dashboard llevaba a la pestaña de Crear cuenta en vez de la de Iniciar sesión — no seguía el estándar de la industria para logout', done: true, valor: 150000, quien: 'Claude AI' },
      { num: '20.5', nombre: 'Auditoría exhaustiva de código — 30 páginas: mapa de navegación completo, 2 pantallas huérfanas encontradas (/admin-escala, /angel), duplicidad real entre /aportes e /ingresos (mismo endpoint), accesibilidad en 0/30 páginas', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '20.6', nombre: 'Fix: crash de JS en /onboarding cuando alguien llega sin sesión (accedía a datos de un usuario null antes de que el redirect surtiera efecto)', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '20.7', nombre: 'Fix: confirmación obligatoria antes de marcar "No cumplió" en /carril — antes era un clic sin aviso para una decisión financiera irreversible desde la UI', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '20.8', nombre: 'Fix: mismo bug del logout pero disparado por sesión expirada — 23 páginas redirigían a la pestaña de Crear cuenta en vez de Iniciar sesión al perder la sesión', done: true, valor: 900000, quien: 'Claude AI' },
      { num: '20.9', nombre: 'Accesibilidad — htmlFor/id agregado a los 31 campos de los 5 formularios de mayor tráfico (registro, onboarding, crear proyecto, editar perfil, aportes)', done: true, valor: 900000, quien: 'Claude AI' },
      { num: '20.10', nombre: 'Accesibilidad — htmlFor/id en los 41 campos restantes (admin-escala, workspace/tareas, invitar, ingresos, hitos). Los 72 labels de toda la app quedan cubiertos', done: true, valor: 1100000, quien: 'Claude AI' },
      { num: '20.11', nombre: 'Auditoría completa de las 14 páginas restantes (calendario, directorio, buscar, score, métricas, comercial, angel, bienvenida, postulaciones, perfil, chat, p/[id], que-es-escala) — cierra la revisión de las 30 páginas de la app', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: '20.12', nombre: 'Fix: /postulaciones mostraba el UUID crudo del proyecto en vez del nombre (el dato ya venía en la API, no se usaba), y tenía un link "Hitos" pegado por error dentro del botón del estado vacío', done: true, valor: 250000, quien: 'Claude AI' },
      { num: '20.13', nombre: 'Fix: error de gramática en la pregunta pública de que-es-escala ("me convierto" → "se convierte")', done: true, valor: 50000, quien: 'Claude AI' },
      { num: '20.14', nombre: 'Fix crítico: /score y /perfil/[id] calculaban el Escala Score con fórmulas propias inventadas, nunca leían el campo real escala_score que usa el resto de la app (directorio, métricas) — dos personas podían ver dos números distintos para el mismo score. Reconstruido con datos reales y la fórmula exacta de la función de base de datos', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '20.15', nombre: 'Fix: "Iniciar sesión" en la página pública de proyecto (/p/[id]) abría la pestaña de Crear cuenta — mismo bug ya corregido en la landing, pero en un archivo distinto que no se había tocado', done: true, valor: 150000, quien: 'Claude AI' },
    ]
  },
  {
    num: '21',
    titulo: 'Sistema de Ofertas + conexión de páginas huérfanas + roles unificados',
    estado: 'completa',
    valor_total: 5900000,
    valor_hecho: 5900000,
    hitos: [
      { num: '21.1', nombre: 'Sistema de Ofertas — campo origen en postulaciones (postulante/fundador) distingue "yo apliqué" de "me invitaron". Migración + API + default retrocompatible', done: true, valor: 900000, quien: 'Claude AI' },
      { num: '21.2', nombre: '/postulaciones reescrita en dos secciones: "Ofertas recibidas" (con Aceptar/Declinar — aquí sí decides tú) y "Mis postulaciones" (solo consulta — el fundador decide). Resuelve el error de diseño donde el usuario podía aceptarse a sí mismo', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '21.3', nombre: '/invitar ahora detecta si el correo invitado ya está registrado en Escala — si sí y hay rol específico, crea la oferta real en su bandeja además del correo. Nueva búsqueda por email en /api/usuarios', done: true, valor: 1100000, quien: 'Claude AI' },
      { num: '21.4', nombre: '/bienvenida conectada al flujo real de registro — pantalla intermedia con "Saltar por ahora y explorar", resuelve el onboarding forzoso de 3 pasos detectado en la auditoría', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '21.5', nombre: 'Seguridad: /admin-escala no verificaba es_admin — cualquier usuario logueado con la URL podía borrar proyectos, usuarios, países e industrias. Protegida antes de conectarla al dashboard (visible solo para admins)', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '21.6', nombre: '/angel conectada al dashboard (acceso rápido) — dejó de ser huérfana', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '21.7', nombre: 'Roles unificados a los 7 canónicos en las 4 definiciones que no coincidían: que-es-escala (6→7), filtro del directorio (mentores y empresas eran invisibles al filtrar), etiquetas del perfil público (5→7)', done: true, valor: 700000, quien: 'Claude AI' },
      { num: '21.8', nombre: 'QA: 6 tests automáticos del sistema de ofertas (origen, separación, default, búsqueda por email) + 2 verificaciones manuales nuevas (flujo bienvenida, oferta visible al invitado)', done: true, valor: 400000, quien: 'Claude AI' },
    ]
  },
  {
    num: '22',
    titulo: 'Ingresos del proyecto — ventas, contratos y negocios generados',
    estado: 'completa',
    valor_total: 3200000,
    valor_hecho: 3200000,
    hitos: [
      { num: '22.1', nombre: 'Migración: tabla ingresos separada de aportes — ingresos es lo que el proyecto genera (ventas, contratos), aportes es lo que la gente mete (tiempo, servicios, capital)', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '22.2', nombre: 'API /api/ingresos: GET lista por proyecto con total acumulado, POST con verificación de permisos (fundador/gerente/admin), DELETE solo para fundador', done: true, valor: 900000, quien: 'Claude AI' },
      { num: '22.3', nombre: '/ingresos reescrita desde cero: formulario con descripción, tipo, valor, fecha y comprobante — visible solo para quien tiene permisos, el resto ve mensaje explicativo', done: true, valor: 1100000, quien: 'Claude AI' },
      { num: '22.4', nombre: 'QA: 4 tests automáticos (registrar, listar, verificar total, rechazar no autorizado)', done: true, valor: 600000, quien: 'Claude AI' },
    ]
  },
  {
    num: '23',
    titulo: 'Workspace especialista — tareas, contratos y flujo de constitución',
    estado: 'completa',
    valor_total: 28415000,
    valor_hecho: 28415000,
    hitos: [
      { num: '23.1', nombre: 'Tareas de constitución auto-inicializadas: cuando un abogado o contador de constitución entra al workspace por primera vez, sus tareas del país aparecen automáticamente en /workspace/tareas sin pasos adicionales', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: '23.2', nombre: 'Tab Constitución eliminada del workspace — las tareas de constitución se integran directamente en el plan de trabajo del especialista, sin destino separado ni botón extra', done: true, valor: 520000, quien: 'Claude AI' },
      { num: '23.3', nombre: 'Fix crítico: supabase.auth.getUser() con SUPABASE_SECRET_KEY siempre devuelve null en server-side — corregido en /api/roles (POST, PATCH, DELETE) y /api/desistir para recibir fundador_id/especialista_id del body', done: true, valor: 780000, quien: 'Claude AI' },
      { num: '23.4', nombre: 'Filtros de tareas corregidos para el especialista: Todas/Pendiente/En progreso/Completada/Verificada funcionan correctamente y siempre son visibles con botón "Ver todas" al filtrar', done: true, valor: 520000, quien: 'Claude AI' },
      { num: '23.5', nombre: 'Tareas duplicadas eliminadas: el especialista ya no ve la misma tarea dos veces (una sin asignar y otra asignada). Solo aparecen las asignadas directamente', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '23.6', nombre: 'Modalidad legible en el workspace: "deuda_diferida" → "Riesgo Compartido", "equity" → "Equity" en la sección "Mi situación en este proyecto"', done: true, valor: 260000, quien: 'Claude AI' },
      { num: '23.7', nombre: '"Retirarme del proyecto" — renombrado desde "Salir del proyecto" con advertencia clara de que es permanente e irreversible, color rojo, confirm con descripción completa de consecuencias', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '23.8', nombre: 'Contrato visible en workspace: sección en tab Resumen para el especialista con estado de firmas (fundador/profesional), botón Descargar PDF y botón Confirmar mi firma', done: true, valor: 2600000, quien: 'Claude AI' },
      { num: '23.9', nombre: 'Tab Contratos en panel fundador (/admin): lista todos los contratos del proyecto con nombre del especialista, rol, modalidad, valor, estado de firmas visual (✅/⬜), Descargar PDF y Confirmar mi firma', done: true, valor: 3250000, quien: 'Claude AI' },
      { num: '23.10', nombre: 'Generación automática de contrato al aceptar postulación: el admin ahora llama /api/contratos POST inmediatamente después de aceptar — sin pasos manuales del fundador', done: true, valor: 1040000, quien: 'Claude AI' },
      { num: '23.11', nombre: 'Contrato completo con 15 cláusulas legales: objeto, naturaleza del vínculo, plazo, valor, obligaciones de ambas partes, confidencialidad, propiedad intelectual, conflicto de interés, indemnidad laboral, cesión, modificaciones, terminación, ley aplicable, integridad del acuerdo — con número de contrato único', done: true, valor: 5200000, quien: 'Claude AI' },
      { num: '23.12', nombre: 'Botón Regenerar contrato en admin: permite actualizar cualquier contrato existente con el generador actualizado sin tocar Supabase manualmente — endpoint PUT /api/contratos', done: true, valor: 910000, quien: 'Claude AI' },
      { num: '23.13', nombre: 'PDF del contrato generado en el browser con iframe inline: sin librerías externas, sin popups bloqueados, con barra de herramientas y botón Guardar PDF que abre el diálogo de impresión', done: true, valor: 1950000, quien: 'Claude AI' },
      { num: '23.14', nombre: 'Fix: "Proyecto activo" en dashboard no aparece cuando eres fundador del mismo proyecto — evita que el fundador vea su propio proyecto listado dos veces', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '23.15', nombre: 'Botón Salir (cerrar sesión) agregado en todas las páginas que lo faltaban: /proyectos/[id], /postulaciones, /perfil/[id], /score, /carril, /admin, /workspace, /workspace/tareas, /workspace/chat', done: true, valor: 650000, quien: 'Claude AI' },
      { num: '23.16', nombre: 'URL parsing robusto en página pública del proyecto: reemplaza window.location.pathname.split("/").pop() por getProyectoIdFromPath() que tolera trailing slash y query params', done: true, valor: 260000, quien: 'Claude AI' },
      { num: '23.17', nombre: 'Roles unificados en /bienvenida y /onboarding: mismos textos, mismo orden, sin duplicados visuales. Flujo registro → /onboarding directo, eliminando /bienvenida como paso intermedio redundante', done: true, valor: 780000, quien: 'Claude AI' },
      { num: '23.18', nombre: 'Sub-especialidad visible en tarjetas de roles en página pública del proyecto: "Constitución de empresas" aparece debajo de "Abogado" en verde', done: true, valor: 260000, quien: 'Claude AI' },
      { num: '23.19', nombre: 'Descripción del rol auto-llenada al seleccionar sub-especialidad en el workspace del fundador — elimina el problema del placeholder vacío que aparecía en producción', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '23.20', nombre: 'Cascades FK corregidos en 23 relaciones de 14 tablas: ALTER TABLE con ON DELETE CASCADE/SET NULL — permite borrar usuarios desde Supabase Auth sin errores de FK', done: true, valor: 1950000, quien: 'Claude AI' },
      { num: '23.21', nombre: 'Función SQL eliminar_usuario_completo(uid): borra un usuario y todos sus datos relacionados en el orden correcto — herramienta operacional para pruebas y administración', done: true, valor: 520000, quien: 'Claude AI' },
      { num: '23.22', nombre: 'Tabla contratos migrada: renombrada especialista_id → profesional_id, agregadas 10 columnas nuevas (postulacion_id, fundador_id, estado, firmado_fundador, firmado_profesional, contenido_json, sub_especialidad, valor, fecha_firma_fundador, fecha_firma_profesional)', done: true, valor: 1560000, quien: 'Claude AI' },
      { num: '23.23', nombre: 'GitHub push access configurado en entorno Claude AI con token PAT — permite commits y push directos sin intervención del fundador en el 90% de los cambios', done: true, valor: 390000, quien: 'Claude AI + Fundador' },
      { num: '23.24', nombre: 'Tab Presupuesto oculta para abogados y contadores de constitución — no les competen esas actividades operacionales del proyecto', done: true, valor: 195000, quien: 'Claude AI' },
      { num: '23.25', nombre: 'jsPDF instalado como dependencia npm: import local en vez de CDN externo, compatible con Next.js 16 y Turbopack sin errores de Content Security Policy', done: true, valor: 260000, quien: 'Claude AI' },
    ]
  },
  {
    num: '24',
    titulo: 'Identidad visual y redes sociales',
    estado: 'completa',
    valor_total: 3250000,
    valor_hecho: 3250000,
    hitos: [
      { num: '24.1', nombre: 'Identidad visual de Escala definida: isotipo (escalón + punto, proporciones áureas), paleta #0B1628 / #1D9E75 / #8FA3CC, tipografía Inter 800 — assets SVG generados en public/brand/ (isotipo, isotipo-blanco, isotipo-instagram, lockup, favicon, app-icon)', done: true, valor: 1200000, quien: 'Claude AI + Fundador' },
      { num: '24.2', nombre: 'Logos actualizados en las 29 páginas del sitio: 13 HTML públicas y 16 páginas React del app router — favicon, app-icon y lockup consistentes en todo el sitio', done: true, valor: 650000, quien: 'Claude AI' },
      { num: '24.3', nombre: 'Cuentas oficiales de Facebook e Instagram creadas y vinculadas: facebook.com/profile.php?id=61591678262407 · instagram.com/joinescala', done: true, valor: 200000, quien: 'Fundador' },
      { num: '24.4', nombre: 'Redes sociales incorporadas al sitio: componente compartido components/RedesSociales.js, footer en 8 HTML públicos (index, casos, compensacion, faq, inversionistas, perfiles, por-que-existe, proteccion), footer en que-es-escala/page.js, JSON-LD Organization con sameAs en layout.tsx para SEO y verificación por Meta', done: true, valor: 1200000, quien: 'Claude AI + Fundador' },
      { num: '24.5', nombre: 'Política de Privacidad completa publicada en escala.network/proteccion.html#politica-privacidad — 11 secciones: responsable, datos recopilados, uso, terceros (Meta API), cookies, retención, derechos Ley 1581 Colombia, seguridad, menores, cambios y contacto. Requerida para Meta App Review', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '24.6', nombre: 'Motor de publicación automática en redes sociales: lib/redes-sociales/ con 4 módulos (metaGraphApi, plantillas, generarTarjeta, publicar), 16 plantillas editables para proyectos/empresas/perfiles, generación de tarjetas SVG→PNG con identidad Escala, idempotencia, reintentos, auditoría en tabla publicaciones_redes, API route POST/PUT protegida', done: true, valor: 2800000, quien: 'Claude AI' },
      { num: '24.7', nombre: 'Formulario de creación de proyectos mejorado: 5 niveles de avance en lenguaje universal (tarjetas), 3 modalidades de trabajo, 9 roles buscados seleccionables, botón ✨ Mejorar con IA via Claude API, 3 columnas nuevas en DB (nivel_avance, modalidad_trabajo, roles_buscados)', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '24.8', nombre: 'Validación de descripción de proyectos: mínimo 80 caracteres, contador en tiempo real (rojo/verde), placeholder con ejemplo real, mensajes de error específicos por campo, país obligatorio', done: true, valor: 260000, quien: 'Claude AI' },
      { num: '24.9', nombre: 'proyectos.html conectado a API real: script JS carga proyectos de Supabase dinámicamente, excluye los hardcodeados (Escala piloto, Ekivibe), muestra nivel de avance, roles buscados, ciudad, modalidad y progreso de equipo', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '24.10', nombre: 'Guía gratuita de descripción: reemplaza llamada a Claude API (con costo) por panel de 3 preguntas que el sistema concatena automáticamente en una descripción completa — sin costo, sin API externa', done: true, valor: 195000, quien: 'Claude AI' },
      { num: '24.11', nombre: 'Eliminar proyecto: fundador puede eliminar su proyecto si no hay postulaciones aceptadas — validación en API (ownership + estado postulaciones) y botón con confirmación de dos pasos en la UI', done: true, valor: 390000, quien: 'Claude AI' },
      { num: '24.12', nombre: 'Home (index.html): nueva sección de proyectos reales dinámicos cargados desde /api/proyectos — muestra hasta 6 proyectos, excluye el piloto hardcodeado, CTA a publicar si no hay proyectos aún', done: true, valor: 260000, quien: 'Claude AI' },
      { num: '24.13', nombre: 'Proyectos públicos sin login: quita redirección forzada a registro en /proyectos/[id], visitantes previsual/izan el proyecto completo, botones de postulación se convierten en CTA de registro para no autenticados, banner de conversión visible', done: true, valor: 390000, quien: 'Claude AI' },
    ]
  },
  {
    num: '25',
    titulo: 'Notificaciones avanzadas — preferencias, invitar y tiempo',
    estado: 'completa',
    valor_total: 2500000,
    valor_hecho: 2500000,
    hitos: [
      { num: '25.1', nombre: 'Preferencias de notificación por categoría: 2 columnas nuevas en DB (categorias_email_desactivadas, categorias_push_desactivadas), motor notificar() verifica categoría además del toggle global, API GET/PATCH /api/notificaciones/preferencias, UI en /perfil/editar con toggles por categoría (postulaciones, tareas, hitos, aportes, proyectos)', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '25.2', nombre: '/invitar migrado al motor notificar(): nueva API /api/invitar/route.js, si el invitado ya está en Escala recibe email + in_app, si no está recibe solo email, evento invitacion agregado al catálogo', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '25.3', nombre: 'Notificaciones basadas en tiempo: Vercel Cron Job diario 9am UTC, 3 verificaciones: tareas vencidas (avisa al asignado), hitos por vencer en 0-2 días (avisa al fundador), proyectos sin actividad 15+ días (avisa al fundador). 4 eventos nuevos en el catálogo. Requiere CRON_SECRET en Vercel env vars', done: true, valor: 1200000, quien: 'Claude AI' },
    ]
  },
  {
    num: '26',
    titulo: 'Calificaciones, logros y Ángel mejorado',
    estado: 'completa',
    valor_total: 4200000,
    valor_hecho: 4200000,
    hitos: [
      { num: '26.1', nombre: 'Sistema de calificaciones: tabla calificaciones con RLS (escritura propia, lectura pública), API GET/POST /api/calificaciones, promedio y listado en /score, notificación al calificado via motor central', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '26.2', nombre: 'Sistema de logros/badges: tabla logros_usuario, API idempotente /api/logros, 8 tipos de logro, otorgados automáticamente al aceptar postulación, verificar tarea, firmar contrato y primer impulso. Visibles en /score con emoji y fecha', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '26.3', nombre: 'Panel Ángel de Impulso mejorado: nuevo tab Métricas con total invertido, % ejecutado, monto pendiente y historial con estado de ejecución por hito', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '26.4', nombre: '/score actualizado: sección de logros desbloqueados y sección de calificaciones recibidas con promedio ⭐, cargados desde sus APIs respectivas', done: true, valor: 500000, quien: 'Claude AI' },
    ]
  },
]

export default function Desarrollo() {
  const [faseAbierta, setFaseAbierta] = useState(null)

  const totalPlataforma = fases.reduce((s, f) => s + f.valor_total, 0)
  const totalHecho = fases.reduce((s, f) => s + f.valor_hecho, 0)
  const totalPendiente = totalPlataforma - totalHecho
  const pct = Math.round((totalHecho / totalPlataforma) * 1000) / 10

  const fmt = v => '$' + v.toLocaleString('es-CO')

  const estadoColor = { completa: '#1D9E75', progreso: '#E8A020', pendiente: '#6B7280' }
  const estadoLabel = { completa: '✓ Completada', progreso: '⚡ En progreso', pendiente: '⏳ Pendiente' }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/desarrollo" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Desarrollo</a>
          <a href="/comercial" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Comercial</a>
          <a href="/" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Sitio</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Seguimiento técnico</div>
          <div style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Plan de desarrollo</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Lo que ya está construido — pagado por el fundador con IA — reduce la deuda diferida del desarrollador.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalHecho)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor ya construido — pagado por el fundador con IA</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPendiente)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Deuda diferida máxima para el desarrollador</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPlataforma)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor total estimado de la plataforma</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC',lineHeight:'1',marginBottom:'0.3rem'}}>{pct}%</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Porcentaje completado del desarrollo total</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'6px'}}>
            <span>Progreso total</span><span>{pct}%</span>
          </div>
          <div style={{height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'4px',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#1D9E75,#25c795)',borderRadius:'4px'}}></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'#8FA3CC',marginTop:'4px'}}>
            <span>$0</span><span>{fmt(totalHecho)} completados</span><span>{fmt(totalPlataforma)}</span>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {fases.map(fase => {
            const abierta = faseAbierta === fase.num
            const pctFase = fase.valor_total > 0 ? Math.round((fase.valor_hecho / fase.valor_total) * 100) : 0
            return (
              <div key={fase.num} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',overflow:'hidden'}}>
                <div onClick={() => setFaseAbierta(abierta ? null : fase.num)} style={{padding:'1.25rem',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center',flex:1}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.5rem',fontWeight:'700',color:'rgba(255,255,255,0.12)',flexShrink:0}}>{fase.num}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{fase.titulo}</div>
                      <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden',width:'100%',maxWidth:'200px'}}>
                        <div style={{height:'100%',width:pctFase+'%',background:estadoColor[fase.estado],borderRadius:'2px'}}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:'0.75rem',fontWeight:'700',color:estadoColor[fase.estado],marginBottom:'0.2rem'}}>{estadoLabel[fase.estado]}</div>
                    <div style={{fontFamily:'monospace',fontSize:'0.78rem',color:fase.valor_hecho > 0 ? '#1D9E75' : '#8FA3CC'}}>{fmt(fase.valor_hecho)} / {fmt(fase.valor_total)}</div>
                  </div>
                  <div style={{color:'#8FA3CC',fontSize:'0.75rem',flexShrink:0}}>{abierta ? '▲' : '▼'}</div>
                </div>

                {abierta && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'0 1.25rem 1.25rem'}}>
                    {fase.hitos.map(h => (
                      <div key={h.num} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                        <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',flex:1}}>
                          <div style={{width:'22px',height:'22px',borderRadius:'50%',background: h.done ? '#1D9E75' : 'rgba(255,255,255,0.06)',border: h.done ? 'none' : '1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',flexShrink:0,marginTop:'2px',color: h.done ? '#fff' : '#8FA3CC'}}>
                            {h.done ? '✓' : h.num.split('.')[1]}
                          </div>
                          <div>
                            <div style={{fontSize:'0.82rem',fontWeight: h.done ? '600' : '400',color: h.done ? '#fff' : '#8FA3CC',marginBottom:'0.15rem'}}>{h.nombre}</div>
                            <div style={{fontSize:'0.68rem',color: h.done ? '#1D9E75' : '#6B7280'}}>{h.quien}</div>
                          </div>
                        </div>
                        <div style={{fontFamily:'monospace',fontSize:'0.78rem',fontWeight:'600',color: h.done ? '#1D9E75' : '#6B7280',flexShrink:0}}>{fmt(h.valor)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.5rem',marginTop:'2rem'}}>
          <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>El argumento para la negociación</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>El fundador ya construyó <strong style={{color:'#1D9E75'}}>{fmt(totalHecho)}</strong> en valor real de plataforma — pagado con IA y tiempo propio. El desarrollador entra a construir los <strong style={{color:'#E8A020'}}>{fmt(totalPendiente)}</strong> restantes. No a repetir lo que ya existe.</div>
        </div>
      </main>
    </div>
  )
}
