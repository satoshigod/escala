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
        <div style={{fontSize:'1.1rem',fontWeight:'900',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
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
