'use client'
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP DEPURADO — Estado real del sistema a julio 2026
//
// Este archivo describe lo que existe HOY, no cómo se construyó.
// Cuando un hito fue mejorado en una fase posterior, aquí aparece
// la versión mejorada y vigente, no la original.
//
// El log histórico completo está en /desarrollo
// ─────────────────────────────────────────────────────────────────────────────

const fases = [
  {
    num: '01',
    titulo: 'Presentación pública — sitio web',
    estado: 'completa',
    valor_total: 3200000,
    valor_hecho: 3200000,
    hitos: [
      { num: '1.1', nombre: 'Arquitectura de información y navegación — 13 páginas HTML públicas + 16 páginas React, con deep-linking entre secciones', done: true, valor: 400000, quien: 'Claude AI + Fundador' },
      { num: '1.2', nombre: 'Sistema de estilos mobile-first — paleta #0B1628 / #1D9E75 / #8FA3CC, tipografía Inter 800, isotipo escalón+punto con proporciones áureas', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '1.3', nombre: 'index.html — landing principal con sección de proyectos reales dinámicos cargados desde API, tooltips de contexto, badge de proyecto fundador, alineación perfecta entre tarjetas ↑ mejorado Fase 24', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '1.4', nombre: 'proyectos.html — directorio público con proyectos reales cargados desde /api/proyectos en tiempo real, excluye hardcodeados ↑ mejorado Fase 24', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.5', nombre: 'proyecto-escala.html — presentación del proyecto piloto de Escala Network', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.6', nombre: 'impulso.html — página Ángel de Impulso', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '1.7', nombre: 'costos.html — estructura de costos de la plataforma', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '1.8', nombre: 'Nav con "Iniciar sesión" + "Registrarme" en las 8 páginas públicas, con ?modo=login en /registro', done: true, valor: 100000, quien: 'Claude AI' },
    ]
  },
  {
    num: '02',
    titulo: 'Backend y base de datos',
    estado: 'completa',
    valor_total: 12000000,
    valor_hecho: 12000000,
    hitos: [
      { num: '2.1', nombre: 'Modelo de datos — 20+ tablas Supabase PostgreSQL con RLS, cascades FK correctos en 23 relaciones, función eliminar_usuario_completo(uid) ↑ mejorado Fase 23', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.2', nombre: 'Autenticación — Supabase Auth + trigger perfiles, verificación de correo no-bloqueante, correos transaccionales con Resend + dominio propio mail.escala.network (DKIM/SPF/DMARC)', done: true, valor: 1500000, quien: 'Supabase + Claude AI' },
      { num: '2.3', nombre: 'API proyectos — GET (con roles, paginación), POST (con nivel_avance, modalidad_trabajo, roles_buscados, validación ownership), DELETE (solo fundador, sin postulaciones aceptadas) ↑ mejorado Fase 24', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '2.4', nombre: 'APIs: aportes, hitos, postulaciones, ingresos, contratos, notificaciones, usuarios, roles, tareas, países, categorías, especialidades, ofertas — 15+ endpoints', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.5', nombre: 'Motor de notificaciones notificar() — email + in-app + web push desde un punto único, 12 eventos cableados, catálogo de 229 eventos documentado', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '2.6', nombre: 'Almacenamiento — Supabase Storage con validación de tipo/tamaño, bucket escala-public para imágenes de redes sociales', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '2.7', nombre: 'Infraestructura — GitHub (satoshigod/escala) + Vercel (auto-deploy main) + Supabase. Claude AI hace commits y push directos via PAT en el 90% de los casos', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '03',
    titulo: 'Plataforma operativa — frontend React',
    estado: 'completa',
    valor_total: 20000000,
    valor_hecho: 20000000,
    hitos: [
      { num: '3.1', nombre: 'Registro y onboarding — 3 pasos, 7 roles canónicos con explicación contextual, selector dinámico de especialidades y países, /bienvenida con opción de saltar', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.2', nombre: 'Publicación de proyectos — formulario con 5 niveles de avance (lenguaje universal), 3 modalidades, 9 roles buscados, validación descripción 80+ chars, guía de escritura gratuita, eliminar proyecto (sin equipo aceptado) ↑ mejorado Fase 24', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '3.3', nombre: 'Detalle de proyecto — público sin login: visitantes ven todo, botones de postulación se convierten en CTA de registro. Con hitos completados, roles prioritarios, WhatsApp ↑ mejorado Fase 24', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '3.4', nombre: 'Panel de aportes — registro con comprobante, trazabilidad completa, subida de archivos con preview', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.5', nombre: 'Panel fundador — postulaciones recibidas por rol, aceptar/rechazar, link a perfil del postulante, generación automática de contrato al aceptar', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.6', nombre: '/postulaciones — dos secciones separadas: "Ofertas recibidas" (el usuario decide) y "Mis postulaciones" (solo consulta). Muestra nombre del proyecto, no UUID ↑ mejorado Fase 21', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '3.7', nombre: 'Hitos del proyecto — crear, completar, kanban pendiente/completado desde workspace', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.8', nombre: 'Perfil público — Escala Score real (fórmula de DB), métricas verificadas, horas aportadas, idiomas, disponibilidad, reconocimientos, WhatsApp directo ↑ mejorado Fase 16 y 20', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.9', nombre: 'Admin Escala — panel protegido (verificación es_admin), CRUD completo de industrias, países, tareas, especialidades, categorías; tab Resumen con métricas globales ↑ mejorado Fase 14 y 21', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '3.10', nombre: '/invitar — detecta si el correo ya está registrado, crea oferta real en su bandeja además del correo, con template Resend', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '3.11', nombre: '/ingresos — registrar ventas/contratos del proyecto con tipo, valor, fecha y comprobante. Solo fundador/gerente/admin pueden registrar', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '04',
    titulo: 'Dashboard contextual multi-rol',
    estado: 'completa',
    valor_total: 7500000,
    valor_hecho: 7500000,
    hitos: [
      { num: '4.1', nombre: 'Endpoint agregador /api/dashboard — reemplaza 13+ llamadas N+1 por consultas paralelas en servidor. Incluye mensajes no leídos y proyectos finalizados', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '4.2', nombre: 'Vistas diferenciadas por rol — Especialista (tareas, score, postulaciones), Fundador (proyectos, postulaciones recibidas, hitos), Gerente (carga del equipo), Ángel (hitos financiados, retorno)', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.3', nombre: 'Bandeja de trabajo unificada — tareas, hitos y postulaciones pendientes en una lista accionable', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.4', nombre: 'Notificaciones — feed persistente, marcar leída/todas, realtime multi-evento, botón activar push web', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '4.5', nombre: 'Métricas visuales — gráficos SVG nativos: aportes por mes, donut por tipo, tareas por estado, hitos', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '4.6', nombre: '/perfil/editar — idiomas, disponibilidad, reconocimientos', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '4.7', nombre: '/calendario — tareas con fecha límite, hitos, próximos 7 días, asignación de fechas inline', done: true, valor: 700000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '05',
    titulo: 'Escala Score y sistema de reputación',
    estado: 'completa',
    valor_total: 8000000,
    valor_hecho: 8000000,
    hitos: [
      { num: '5.1', nombre: 'Algoritmo Score — 4 dimensiones verificables, calculado en función de DB, consistente en todos los módulos (directorio, métricas, perfil, score) ↑ fix crítico Fase 20', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '5.2', nombre: '/score — gráfico circular, métricas reales, explainer expandible de cómo subir el score', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '5.3', nombre: '/carril — confirmar cumplimiento (con vista de tareas verificadas) y elegir forma de pago según estado del proyecto. Confirmación obligatoria antes de "No cumplió"', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '5.4', nombre: 'Track record público — historial verificable en perfil de usuario', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '06',
    titulo: 'Ingresos, pagos y compensación',
    estado: 'progreso',
    valor_total: 9800000,
    valor_hecho: 5000000,
    hitos: [
      { num: '6.1', nombre: 'Modelo de compensación — Modalidad A (recursos en efectivo) y Modalidad B (riesgo compartido: deuda diferida o equity). Toggle al crear proyecto, visible en workspace y contratos', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '6.2', nombre: 'Deuda pendiente — registro por especialista, resolución selectiva (cash o acciones) en /carril', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '6.3', nombre: 'Panel Ángel de Impulso — explorar hitos, financiar, historial de retorno', done: true, valor: 0, quien: 'Claude AI + Fundador' },
      { num: '6.4', nombre: 'Integración Wompi (pagos Colombia) — ver Fase 15', done: false, valor: 0, quien: 'Desarrollador' },
      { num: '6.5', nombre: 'Facturación electrónica DIAN — ver Fase 15', done: false, valor: 0, quien: 'Desarrollador + Contador' },
    ]
  },
  {
    num: '07',
    titulo: 'Contratos digitales',
    estado: 'completa',
    valor_total: 8000000,
    valor_hecho: 8000000,
    hitos: [
      { num: '7.1', nombre: 'Tabla contratos — migrada con 10 columnas: postulacion_id, fundador_id, profesional_id, estado, firmado_fundador, firmado_profesional, contenido_json, sub_especialidad, valor, fechas de firma', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '7.2', nombre: 'Generación automática al aceptar postulación — 15 cláusulas legales colombianas: objeto, naturaleza del vínculo, plazo, valor, obligaciones, confidencialidad, PI, indemnidad laboral, cesión, terminación', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: '7.3', nombre: 'PDF inline en el browser — iframe sin librerías externas, sin popups bloqueados, con botón Guardar PDF nativo', done: true, valor: 2500000, quien: 'Claude AI' },
      { num: '7.4', nombre: 'Firmas — estado visible en workspace (especialista) y tab Contratos del admin fundador. Botón Confirmar firma + Regenerar contrato', done: true, valor: 2100000, quien: 'Claude AI' },
    ]
  },
  {
    num: '08',
    titulo: 'Workspace del equipo',
    estado: 'completa',
    valor_total: 10000000,
    valor_hecho: 10000000,
    hitos: [
      { num: '8.1', nombre: 'Workspace — 5 tabs: Resumen (con contrato), Hitos, Equipo, Aportes, Economía. Acceso solo para miembros aceptados y fundador', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '8.2', nombre: 'Plan de trabajo del especialista — tareas auto-inicializadas por rol y país al entrar al workspace, sin pasos adicionales. Filtros por estado funcionan correctamente', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '8.3', nombre: 'Tab equipo — miembros con rol, ciudad, WhatsApp directo', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '8.4', nombre: 'Chat interno — tiempo real con Supabase Realtime', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '8.5', nombre: 'Tab economía — deuda diferida, participación, modalidades explicadas con terminología correcta (sin "Carriles A/B/C")', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '8.6', nombre: '"Retirarme del proyecto" — con advertencia clara, color rojo, confirm de consecuencias irreversibles', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '8.7', nombre: 'Tab Presupuesto oculta para abogados y contadores de constitución', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '8.8', nombre: 'jsPDF como dependencia npm local — compatible con Next.js 16 + Turbopack sin errores CSP', done: true, valor: 1000000, quien: 'Claude AI' },
    ]
  },
  {
    num: '09',
    titulo: 'Descubrimiento, búsqueda y directorio',
    estado: 'completa',
    valor_total: 5000000,
    valor_hecho: 5000000,
    hitos: [
      { num: '9.1', nombre: 'Directorio de especialistas — búsqueda por nombre, especialidad, ciudad, país, score mínimo; 7 roles canónicos en filtros (incluyendo Mentor y Empresa)', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '9.2', nombre: '/buscar proyectos — filtros por sector, tipo Creación/Transformación, ciudad, país', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '9.3', nombre: 'Redirección inteligente según estado del perfil — sin onboarding forzoso, con /bienvenida opcional', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '9.4', nombre: 'Logo Escala clickeable en las 26 páginas de la app, con destino correcto según si la página requiere sesión o es pública', done: true, valor: 500000, quien: 'Claude AI' },
    ]
  },
  {
    num: '10',
    titulo: 'Inteligencia automática — tareas por país e industria',
    estado: 'completa',
    valor_total: 20500000,
    valor_hecho: 20500000,
    hitos: [
      { num: '10.1', nombre: 'Biblioteca de tareas regulatorias — 7 países con 5-6 tareas cada uno, cargadas automáticamente al crear proyecto según el país seleccionado', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '10.2', nombre: 'Biblioteca de tareas comerciales — 5+ industrias con 6 tareas cada una, cargadas automáticamente según industria', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '10.3', nombre: 'Selectores dinámicos de país e industria — leen de DB, cualquier usuario puede crear uno nuevo que queda pendiente de configurar por el admin', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '10.4', nombre: 'Asignación inteligente de tareas — filtra ejecutores por categoría del rol', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '10.5', nombre: 'Admin Escala parametrizable — CRUD completo de países, industrias, tareas, especialidades, categorías sin deploy. Alertas de países pendientes de configurar con badge visible', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '10.6', nombre: 'Selectores dinámicos de especialidades — mismo patrón que países, con crear nueva opción desde onboarding y perfil', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '10.7', nombre: 'Auditoría de creadores — quién creó cada país, categoría o especialidad, visible en admin', done: true, valor: 700000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '11',
    titulo: 'Sistema de notificaciones multicanal',
    estado: 'progreso',
    valor_total: 24950000,
    valor_hecho: 12950000,
    hitos: [
      { num: '11.1', nombre: 'Motor notificar() — email + in-app + web push desde un punto único, reglas de prioridad (CRÍTICA no desactivable), preferencias por usuario', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '11.2', nombre: '12 eventos cableados — proyectos, postulaciones, tareas, hitos, aportes, cumplimiento, alertas admin', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '11.3', nombre: 'Web Push — Service Worker, suscripción VAPID, envío con web-push (desktop + Android; iOS requiere agregar a pantalla inicio)', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '11.4', nombre: 'Centro de notificaciones en Dashboard — feed persistente, marcar leída/todas, realtime', done: true, valor: 1800000, quien: 'Claude AI + Fundador' },
      { num: '11.5', nombre: 'Dominio de correo propio — mail.escala.network verificado con DKIM/SPF/DMARC en Resend', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '11.6', nombre: 'Correos de autenticación — registro y recuperación de contraseña con dominio propio vía SMTP', done: true, valor: 800000, quien: 'Claude AI + Fundador' },
      { num: '11.7', nombre: 'Canal SMS — ver Fase 15', done: false, valor: 0, quien: 'Desarrollador' },
      { num: '11.8', nombre: 'Canal WhatsApp — ver Fase 15', done: false, valor: 0, quien: 'Desarrollador' },
      { num: '11.9', nombre: 'Notificaciones basadas en tiempo — Vercel Cron Job diario 9am UTC, 3 verificaciones: tareas vencidas, hitos por vencer, proyectos sin actividad ↑ completado Fase 16', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '11.10', nombre: 'Eventos de módulos futuros — marketplace, votaciones, rondas de inversión, liquidación y comunidad. Se cablean cuando esos módulos se construyan. Los módulos existentes hoy tienen sus notificaciones completas (30 eventos activos)', done: false, valor: 6000000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '12',
    titulo: 'Sistema de ofertas y reclutamiento',
    estado: 'completa',
    valor_total: 5900000,
    valor_hecho: 5900000,
    hitos: [
      { num: '12.1', nombre: 'Campo origen en postulaciones — distingue "yo apliqué" (postulante) de "me invitaron" (fundador). Migración + API + default retrocompatible', done: true, valor: 900000, quien: 'Claude AI' },
      { num: '12.2', nombre: '/postulaciones — "Ofertas recibidas" (usuario decide) separado de "Mis postulaciones" (solo consulta). Resuelve el bug de diseño donde el usuario podía aceptarse a sí mismo', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '12.3', nombre: '/invitar — detecta correo ya registrado, crea oferta real en su bandeja + envía correo. Búsqueda por email en /api/usuarios', done: true, valor: 1100000, quien: 'Claude AI' },
      { num: '12.4', nombre: 'Panel de métricas — postulaciones por rol, embudo de conversión, tasa de aceptación', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '12.5', nombre: 'Accesibilidad — htmlFor/id en los 72 campos de los 10 formularios de la app', done: true, valor: 1000000, quien: 'Claude AI' },
    ]
  },
  {
    num: '13',
    titulo: 'Identidad visual y presencia en redes',
    estado: 'completa',
    valor_total: 9690000,
    valor_hecho: 9690000,
    hitos: [
      { num: '13.1', nombre: 'Identidad visual — isotipo (escalón + punto), paleta #0B1628 / #1D9E75 / #8FA3CC, Inter 800. Assets SVG en public/brand/ (isotipo, isotipo-blanco, isotipo-instagram, lockup, favicon, app-icon)', done: true, valor: 1200000, quien: 'Claude AI + Fundador' },
      { num: '13.2', nombre: 'Logos en todo el sitio — favicon, app-icon y lockup consistentes en 13 HTML públicas + 16 páginas React', done: true, valor: 650000, quien: 'Claude AI' },
      { num: '13.3', nombre: 'Redes sociales — facebook.com/profile.php?id=61591678262407 + instagram.com/joinescala. Íconos en footer de 8 HTML públicos + que-es-escala + JSON-LD Organization sameAs para SEO', done: true, valor: 1400000, quien: 'Claude AI + Fundador' },
      { num: '13.4', nombre: 'Política de Privacidad — 11 secciones en escala.network/proteccion.html#politica-privacidad, Ley 1581 Colombia, requerida para Meta App Review', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '13.5', nombre: 'Motor de publicación en redes — lib/redes-sociales/ con 4 módulos: metaGraphApi (Graph API v25), plantillas (16 editables), generarTarjeta (SVG→PNG con identidad Escala), publicar (idempotencia, reintentos, auditoría). Tabla publicaciones_redes en Supabase. Pendiente: verificación de negocio Meta para activar en producción', done: true, valor: 2800000, quien: 'Claude AI' },
      { num: '13.6', nombre: 'Meta App configurada — MOTOR PUBLICACIONES ESCALA (App ID: 4534429656788672), permisos pages_manage_posts + instagram_content_publish, política de privacidad registrada, ícono 1024×1024 subido', done: true, valor: 1000000, quien: 'Claude AI + Fundador' },
      { num: '13.7', nombre: 'App icon Meta — PNG 1024×1024 generado desde el isotipo SVG oficial con cairosvg', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '13.8', nombre: 'Proyectos en el home público — sección "En este momento en Escala" con tarjetas alineadas, tooltips de contexto, badge proyecto fundador, carga dinámica desde API con RLS público habilitado', done: true, valor: 1040000, quien: 'Claude AI' },
      { num: '13.9', nombre: 'Formulario de creación mejorado — 5 niveles de avance (lenguaje universal), 3 modalidades, 9 roles buscados, validación 80+ chars, guía gratuita de escritura (3 preguntas → descripción concatenada)', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '13.10', nombre: 'Proyectos públicos sin login — visitantes ven el proyecto completo, botones de postulación se convierten en CTA de registro, banner de conversión visible', done: true, valor: 0, quien: 'Claude AI' },
    ]
  },
  {
    num: '14',
    titulo: 'QA y herramientas de calidad',
    estado: 'completa',
    valor_total: 3500000,
    valor_hecho: 3500000,
    hitos: [
      { num: '14.1', nombre: '/qa — panel de pruebas con tests automáticos que crean datos con prefijo QA-, verifican resultados reales y limpian después. Cubre: proyectos, postulaciones, notificaciones, aportes, hitos, ingresos, ofertas, contratos', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: '14.2', nombre: 'Función SQL eliminar_usuario_completo(uid) — borra usuario y todos sus datos en el orden correcto respetando FK', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '14.3', nombre: 'GitHub PAT — Claude AI hace commits y push directos. Rotar el token periódicamente (no compartir en conversaciones)', done: true, valor: 390000, quien: 'Claude AI + Fundador' },
      { num: '14.4', nombre: 'RLS pública en proyectos — policy "proyectos_activos_publicos" permite lectura de proyectos activos sin sesión, necesaria para el home y las páginas públicas', done: true, valor: 610000, quien: 'Claude AI' },
    ]
  },
  {
    num: '15',
    titulo: 'Pendientes críticos',
    estado: 'pendiente',
    valor_total: 16000000,
    valor_hecho: 0,
    hitos: [
      { num: '15.1', nombre: 'Email infrastructure — correos transaccionales operativos desde mail.escala.network con DKIM/SPF/DMARC verificado en Resend. Confirmado en producción por el fundador', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
      { num: '15.2', nombre: 'Meta Business Verification — completar verificación del negocio para mover la app de publicación de modo desarrollo a producción. Requiere RUT o Cámara de Comercio de Escala', done: false, valor: 500000, quien: 'Fundador' },
      { num: '15.3', nombre: 'Integración Wompi — pagos en Colombia', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '15.4', nombre: 'Facturación electrónica DIAN', done: false, valor: 2300000, quien: 'Desarrollador + Contador' },
      { num: '15.5', nombre: 'Canal SMS — Twilio o Sinch', done: false, valor: 1500000, quien: 'Desarrollador' },
      { num: '15.6', nombre: 'Canal WhatsApp API oficial Meta', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '15.7', nombre: 'Notificaciones basadas en tiempo — Vercel Cron Job diario 9am UTC ↑ completado Fase 16', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '15.8', nombre: 'Contratos — firma digital DocuSign/HelloSign', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '15.9', nombre: 'App móvil — React Native o PWA', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '15.10', nombre: 'Username personalizado Facebook — cambiar profile.php?id=... por facebook.com/EscalaNetwork una vez la página tenga 100 seguidores', done: false, valor: 1000000, quien: 'Fundador' },
    ]
  },
  {
    num: '16',
    titulo: 'Notificaciones avanzadas',
    estado: 'completa',
    valor_total: 2500000,
    valor_hecho: 2500000,
    hitos: [
      { num: '16.1', nombre: 'Preferencias por categoría de evento: 5 categorías (postulaciones, tareas, hitos, aportes, proyectos), toggles individuales por email y push, UI en /perfil/editar, API GET/PATCH /api/notificaciones/preferencias, motor notificar() respeta categoría además del toggle global', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '16.2', nombre: '/invitar migrado al motor central notificar(): si el invitado ya está en Escala recibe email + in_app, si no recibe solo email. Evento invitacion en el catálogo. Reemplaza llamada directa a /api/email', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '16.3', nombre: 'Notificaciones basadas en tiempo — Vercel Cron Job diario 9am UTC: tareas vencidas (avisa al asignado), hitos por vencer en 0-2 días (avisa al fundador), proyectos sin actividad 15+ días (avisa al fundador). Requiere CRON_SECRET en Vercel env vars', done: true, valor: 1200000, quien: 'Claude AI' },
    ]
  },
  {
    num: '17',
    titulo: 'Calificaciones, logros y Ángel de Impulso mejorado',
    estado: 'completa',
    valor_total: 4200000,
    valor_hecho: 4200000,
    hitos: [
      { num: '17.1', nombre: 'Calificaciones entre colaboradores: tabla calificaciones (RLS escritura propia, lectura pública), API /api/calificaciones, promedio visible en /score, notificación al calificado, único por proyecto+par de usuarios', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '17.2', nombre: 'Logros automáticos: 8 badges (primera postulación aceptada, tarea verificada, contrato firmado, proyecto completado, primer impulso, aporte verificado, primera calificación, perfil completo). Otorgados en tiempo real al ocurrir el evento. Visibles en /score', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '17.3', nombre: 'Ángel de Impulso mejorado: tab Métricas con total invertido, % ejecutado, monto pendiente y historial detallado por hito con estado de ejecución', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '17.4', nombre: '/score ampliado: logros desbloqueados con emoji/fecha y calificaciones recibidas con promedio ⭐', done: true, valor: 500000, quien: 'Claude AI' },
    ]
  },
  {
    num: '18',
    titulo: 'Eventos del catálogo — módulos existentes',
    estado: 'completa',
    valor_total: 1800000,
    valor_hecho: 1800000,
    hitos: [
      { num: '18.1', nombre: 'contrato_generado + contrato_vigente: notifica al profesional cuando el contrato está listo y cuando ambas partes firman', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '18.2', nombre: 'hito_creado, aporte_rechazado, miembro_se_retiro, primera_venta: 4 eventos cableados en sus APIs respectivas sin construir módulos nuevos', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '18.3', nombre: 'impulso_recibido + API /api/impulsos (GET/POST): los Ángeles de Impulso ahora tienen API propia que notifica al fundador y otorga logro automático', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '18.4', nombre: 'mensaje_recibido — trigger PostgreSQL (pg_net) + API /api/notificaciones/mensaje. Notifica a todos los miembros del proyecto excepto el autor. Activar corriendo el SQL del migration en Supabase', done: true, valor: 200000, quien: 'Claude AI' },
    ]
  },
  {
    num: '19',
    titulo: 'Score, niveles y ciclo de vida de proyectos',
    estado: 'completa',
    valor_total: 1200000,
    valor_hecho: 1200000,
    hitos: [
      { num: '19.1', nombre: 'score_subio y nivel_alcanzado: notificaciones automáticas cuando el Score sube 5+ puntos o cruza umbrales de 25/50/75/100 pts', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '19.2', nombre: 'PATCH /api/proyectos: editar proyecto (proyecto_actualizado) y marcar como completado (proyecto_completado) con notificación a todo el equipo y logro automático', done: true, valor: 600000, quien: 'Claude AI' },
    ]
  },
  {
    num: '20',
    titulo: 'Auditoría UX y correcciones de navegación',
    estado: 'completa',
    valor_total: 3200000,
    valor_hecho: 3200000,
    hitos: [
      { num: '20.1', nombre: 'NavApp — componente nav compartido en components/NavApp.js, aplicado en 14 páginas. Un solo punto de mantenimiento para toda la navegación de la app', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '20.2', nombre: 'Rutas limpias: /p/[id] redirige a /proyectos/[id], /admin redirige a /mis-contratos, tabs en /directorio y /buscar, enlace visible a /desarrollo-limpio', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '20.3', nombre: 'UX mejorada: formulario de proyectos en 2 pasos, /carril visible en dashboard, texto introductorio en /score y /angel, manejo de error en /metricas', done: true, valor: 1200000, quien: 'Claude AI' },
      { num: '20.4', nombre: 'Limpieza: coming.html y desarrollo.html obsoletos eliminados, /admin-escala es la única ruta de administración de plataforma', done: true, valor: 700000, quien: 'Claude AI' },
    ]
  },,
  {
    num: '21',
    titulo: 'Motor Financiero — Wallets, Ledger y Pagos',
    estado: 'progreso',
    valor_total: 18000000,
    valor_hecho: 12000000,
    hitos: [
      { num: '21.1', nombre: 'SQL completo: exchange_rates, wallets, ledger_entries (doble partida), fondeos, payment_requests, financial_audit — 9 monedas (COP MXN CLP ARS PEN USD EUR USDT USDC), RLS en todas las tablas', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: '21.2', nombre: 'Motor central lib/financiero/ledger.js: registrarMovimiento() idempotente, calcularSaldo() siempre desde ledger, tasaDelDia(), obtenerOCrearWallet(), registrarAuditoria() — equivalente a notificar() para el ledger', done: true, valor: 2500000, quien: 'Claude AI' },
      { num: '21.3', nombre: 'APIs: /api/wallet, /api/wallet/movimientos, /api/fondeos, /api/fondeos/webhook (HMAC-SHA256), /api/pagos, /api/admin/financiero (aprobar/rechazar/ejecutar/reversar), /api/exchange-rates', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: '21.4', nombre: '13 eventos financieros conectados al motor notificar(): fondeo_iniciado/completado/fallido, pago_solicitado/aprobado/rechazado/ejecutado/reversado, wallet_fondeo_acreditado/debito_ejecutado (críticas — no desactivables)', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '21.5', nombre: 'Puente Motor Financiero → Motor Escala: pago ejecutado dispara cumplimiento_confirmado, primer pago dispara primera_venta, hito financiado dispara impulso_recibido', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: '21.6', nombre: 'Páginas: /wallet (módulo independiente con topbar propio), /wallet/fondear (3 pasos: método → monto → instrucciones BRE-B/Binance), /admin/financiero (panel admin con KPIs y acciones)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: '21.7', nombre: 'Widget de acceso rápido al wallet en el dashboard general de Escala (saldo + Fondear + Ir a finanzas)', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '21.8', nombre: '/wallet/movimientos — historial completo paginado con filtros por tipo. Pagina implementada en app/wallet/movimientos/page.js', done: true, valor: 1000000, quien: 'Desarrollador' },
      { num: '21.9', nombre: '/wallet/pagos/solicitar — formulario de solicitud de pago vinculado a hitos. Directorio app/wallet/pagos/solicitar existe.', done: true, valor: 1000000, quien: 'Desarrollador' },
      { num: '21.10', nombre: 'Correr SQL en Supabase: 20260708_motor_financiero.sql', done: false, valor: 0, quien: 'Ivan' },
      { num: '21.11', nombre: 'Variables de entorno en Vercel: BREB_WEBHOOK_SECRET, BINANCE_WEBHOOK_SECRET', done: false, valor: 0, quien: 'Ivan' },
      { num: '21.12', nombre: 'Tests QA del motor financiero: wallet, fondeos, pagos, admin', done: false, valor: 1500000, quien: 'Claude AI' },
    ]
  },
  {
    num: '22',
    titulo: 'Enterprise Graph — Auditoría y diseño arquitectónico',
    estado: 'pendiente',
    valor_total: 8000000,
    valor_hecho: 0,
    hitos: [
      { num: '22.1', nombre: 'Auditoría completa: 39 páginas, 41 APIs, 27 tablas, 15 módulos lib — mapear deuda técnica, inconsistencias y brechas vs visión Enterprise Graph', done: false, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '22.2', nombre: 'Diseño del Enterprise Graph: nodos (Persona, Empresa, Idea, Proyecto, Equipo, Capital, Contribución, Activo, Documento, Servicio, Evento, Conocimiento) y todas sus aristas con semántica y peso', done: false, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '22.3', nombre: 'Trust Graph: reputación calculada desde historial, contratos, pagos, cumplimiento, proyectos, resultados, referencias, aportes, experiencia e impacto — no solo conteo de tareas', done: false, valor: 1500000, quien: 'Claude AI' },
      { num: '22.4', nombre: 'Diseño de la capa de IA sobre el grafo: búsqueda semántica de cofundadores e inversores, formación automática de equipos, detección de riesgos, recomendación de alianzas estratégicas', done: false, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '22.5', nombre: 'Roadmap 20 años: 6 fases desde MVP actual hasta infraestructura mundial — mapa de expansión por país, vertical y segmento de mercado', done: false, valor: 1000000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '23',
    titulo: 'Deuda técnica crítica — hallazgos de auditoría',
    estado: 'pendiente',
    valor_total: 6000000,
    valor_hecho: 0,
    hitos: [
      { num: '23.1', nombre: 'Modelo relacional plano → preparación para grafo: tabla entity_relationships con tipo de relación, peso y dirección. Reemplazar FKs implícitas por aristas explícitas con semántica', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: '23.2', nombre: 'Score actual (simple contador) → Score del grafo: reputación calculada desde centralidad en el grafo. PageRank-like sobre contribuciones verificadas, no solo completitud de tareas', done: false, valor: 1500000, quien: 'Claude AI' },
      { num: '23.3', nombre: 'Contratos estáticos → Contratos vivos: vincular contratos a hitos, pagos y evidencias en tiempo real. Estado del contrato derivado del estado real de sus componentes', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: '23.4', nombre: 'Roles sin expertise graph: tabla expertise_nodes con skills verificadas, endorsements entre pares y niveles de profundidad — base para matching inteligente de equipos', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: '23.5', nombre: 'i18n real: next-intl en todas las páginas, detección de país por IP, moneda y proveedor de pago automáticos según país del usuario — hoy solo hay soporte parcial en el motor financiero', done: false, valor: 500000, quien: 'Claude AI' },
    ]
  },
  {
    num: '24',
    titulo: 'Escala Intelligence Layer — IA sobre el grafo',
    estado: 'pendiente',
    valor_total: 12000000,
    valor_hecho: 0,
    hitos: [
      { num: '24.1', nombre: 'Embeddings de perfiles: vectorizar perfil de cada usuario (skills, historial, proyectos, reputación) con OpenAI text-embedding-3. Almacenar en pgvector (Supabase) para búsqueda semántica', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '24.2', nombre: 'Matching de cofundadores y especialistas: dado un proyecto, encontrar los 5 perfiles más compatibles por skills complementarias, disponibilidad, historial y posición en el Trust Graph', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: '24.3', nombre: 'Generación de contratos con IA: dado proyecto + rol + términos negociados, generar contrato completo con cláusulas específicas al contexto — reemplazar la plantilla estática actual', done: false, valor: 1500000, quien: 'Claude AI' },
      { num: '24.4', nombre: 'Detección de riesgos: identificar proyectos con alta probabilidad de abandono (sin actividad, hitos sin cumplir, conflictos sin resolver) y alertar proactivamente a fundadores e inversores', done: false, valor: 1500000, quien: 'Claude AI' },
      { num: '24.5', nombre: 'Assistant sobre el grafo: chat que responde preguntas complejas del ecosistema usando el grafo como contexto ("¿quién tiene experiencia en fintech en Chile con más de 3 proyectos completados?")', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '24.6', nombre: 'Valoración de contribuciones: dado el historial de un especialista en un proyecto, estimar el valor de mercado de su contribución usando comparables del grafo — base para negociación de equity', done: false, valor: 2000000, quien: 'Claude AI' },
    ]
  },
  {
    num: '25',
    titulo: 'Escalabilidad y arquitectura enterprise',
    estado: 'pendiente',
    valor_total: 10000000,
    valor_hecho: 0,
    hitos: [
      { num: '25.1', nombre: 'React Server Components: migrar las 5 páginas más críticas (dashboard, proyectos, workspace, score, carril) de fetch() client-side a RSC — eliminar waterfalls de datos y mejorar TTI', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: '25.2', nombre: 'Rate limiting global: Vercel Edge Middleware en todas las APIs — 100 req/min por IP, 1000/min por usuario autenticado. Bloquear automáticamente abuso de webhooks', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: '25.3', nombre: 'Caché de lectura: Upstash Redis para cachear tasas de cambio, catálogos y scores. TTL 5 min para datos frecuentes — reducir carga en Supabase en picos de tráfico', done: false, valor: 1500000, quien: 'Claude AI' },
      { num: '25.4', nombre: 'Observabilidad: Sentry para errores frontend y API, Vercel Analytics para performance, alertas automáticas si error rate > 1% o latencia P95 > 2s', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: '25.5', nombre: 'Multi-tenant: tabla organizations, separación de datos por organización, modelo white-label para que empresas tengan su propia instancia de Escala — prerequisito para Escala for Teams', done: false, valor: 4500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '26',
    titulo: 'Expansión internacional — proveedores de pago por país',
    estado: 'pendiente',
    valor_total: 15000000,
    valor_hecho: 0,
    hitos: [
      { num: '26.1', nombre: 'SPEI (México): integración con PSP mexicano para fondeos en MXN — equivalente a BRE-B Colombia. El motor financiero ya tiene proveedor_pago enum con spei', done: false, valor: 3000000, quien: 'Desarrollador + Contratar proveedor' },
      { num: '26.2', nombre: 'Khipu / Fintoc (Chile): integración para fondeos en CLP', done: false, valor: 3000000, quien: 'Desarrollador + Contratar proveedor' },
      { num: '26.3', nombre: 'Wompi (Colombia): PSE + tarjetas débito/crédito para Colombia', done: false, valor: 2500000, quien: 'Desarrollador + Contratar Wompi' },
      { num: '26.4', nombre: 'Stripe (Internacional): USD/EUR para España, Ecuador y usuarios internacionales', done: false, valor: 2500000, quien: 'Desarrollador + Contratar Stripe' },
      { num: '26.5', nombre: 'Facturación electrónica por país: DIAN (Colombia), SAT (México), SII (Chile) — cada uno requiere contratar proveedor de facturación electrónica certificado', done: false, valor: 4000000, quien: 'Desarrollador + Contador + Contratar proveedor' },
    ]
  },
  {
    num: '27',
    titulo: 'Monetización — modelo de ingresos de Escala',
    estado: 'pendiente',
    valor_total: 5000000,
    valor_hecho: 0,
    hitos: [
      { num: '27.1', nombre: 'Comisión por transacción: cobrar 2-4% sobre cada pago ejecutado en el motor financiero — campo comision_escala ya existe en el ledger, solo falta activarlo en el flujo de ejecución', done: false, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '27.2', nombre: 'Suscripción Pro: plan de pago para fundadores con más de 3 proyectos activos — acceso a IA matching, contratos ilimitados, analytics avanzados y soporte prioritario', done: false, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '27.3', nombre: 'Escala for Teams: plan empresarial para compañías que quieran usar Escala para gestionar proyectos internos y proveedores externos — prerequisito: Fase 25.5 (multi-tenant)', done: false, valor: 1500000, quien: 'Claude AI + Fundador' },
    ]
  }
,
  {
    num: '28',
    titulo: 'Rediseño del dashboard — reorganización sin eliminar funcionalidades',
    estado: 'pendiente',
    valor_total: 3500000,
    valor_hecho: 0,
    hitos: [
      { num: '28.1', nombre: 'Bandeja de trabajo en grid 1fr 280px — contenido principal + sidebar. Para hacer ahora, Score, Wallet 3 saldos, tarjetas overflow implementados.', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '28.2', nombre: 'Proyectos disponibles condicional por rol: implementado con esFundador. Especialistas ven proyectos disponibles, fundadores ven sus proyectos.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '28.3', nombre: 'Tarjetas de proyecto: 1 CTA Workspace + menu overflow (···) con Publicar rol, Ver hitos, Mis aportes. Lista compacta para 4+ proyectos.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: '28.4', nombre: 'Sidebar: seccion Para hacer ahora (accionables amarillos con flecha), Tu perfil (Score), Wallet 3 saldos. Diferenciacion visual urgente vs informativo.', done: true, valor: 700000, quien: 'Claude AI' },
      { num: '28.5', nombre: 'Wallet widget sidebar: 3 saldos en grid — disponible (verde), comprometido (amarillo), pendiente (purpura). Botones Fondear y Ver.', done: true, valor: 500000, quien: 'Claude AI' },
    ]
  },
  {
    num: '29',
    titulo: 'SEO — Infraestructura y primeras landing pages',
    estado: 'completa',
    valor_total: 6000000,
    valor_hecho: 6000000,
    hitos: [
      { num: '29.1', nombre: 'robots.txt: Allow en páginas públicas, Disallow en 20+ páginas privadas (dashboard, wallet, admin, qa, etc.) — apunta a /sitemap.xml', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '29.2', nombre: 'sitemap.ts dinámico: páginas estáticas con prioridad, proyectos activos (hasta 500) y perfiles públicos (hasta 1000) con fecha real. Servido automáticamente en /sitemap.xml por Next.js', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '29.3', nombre: 'Metadata global mejorada: título con template "%s | Escala", description 160 chars, keywords, robots avanzados, OpenGraph completo, Twitter Cards, canonical. 3 JSON-LD: Organization + WebSite (SearchAction) + SoftwareApplication', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '29.4', nombre: 'Metadata dinámica: /proyectos/[id] y /perfil/[id] tienen título y descripción propios del proyecto/perfil. Wrappers de servidor sobre componentes cliente', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '29.5', nombre: 'Metadata en /buscar, /directorio y /que-es-escala: wrappers de servidor con título, descripción, OG, Twitter Cards y canonical propios', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '29.6', nombre: 'Imagen OG 1200x630px (og-default.png): fondo oscuro, isotipo, wordmark, tagline, 6 propuestas de valor, 7 países, URL escala.network', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '29.7', nombre: 'Verificación Google Search Console: archivo googledbbb597d067f7ab4.html en /public. Sitemap enviado a Google', done: true, valor: 200000, quien: 'Ivan + Claude AI' },
      { num: '29.8', nombre: 'Landing /buscar-cofundador: H1 semántico, FAQ, HowTo, JSON-LD WebPage+Service, footer con enlazado interno. Keywords: buscar cofundador (800/mes), encontrar cofundador startup', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '29.9', nombre: 'Landing /crear-empresa: JSON-LD HowTo Schema con 4 pasos, 7 países con enlaces internos. Keywords: crear empresa (8,000-12,000/mes), crear startup sin capital', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '29.10', nombre: 'Landing /startup-colombia: SEO local Colombia, ciudades (Bogotá, Medellín, Cali), FAQ específico de SAS y emprendimiento colombiano. Keywords: crear startup colombia (2,000/mes)', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '29.11', nombre: 'Landing /startup-mexico: SEO local México, ciudades (CDMX, Monterrey, Guadalajara), FAQ específico de SAPI. Keywords: crear startup mexico (3,000/mes)', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '29.12', nombre: 'SEO Tier 2 ejecutado: /angel-investor, /buscar-cto, /startup-chile, /startup-bogota, /startup-medellin, /startup-santiago, /desarrollador-startup-colombia. Blog 4 articulos + indice. /latinos-usa. Landing locales comerciales x3. Sitemap 28 URLs. Pendiente: hreflang, SEO programatico, blog 6 articulos restantes.', done: true, valor: 500000, quien: 'Claude AI' },
    ]
  },

  {
    titulo: 'Flujo de verificación de tareas, onboarding guiado, badges contador y plan SEO',
    estado: 'progreso',
    valor_total: 18900000,
    valor_hecho: 16400000,
    hitos: [
      { num: '30.1', nombre: 'Fix bug: tareas de constitución duplicadas al inicializar especialista (reasignar en vez de crear copias) + Fix getSegmento() (segmento "Colombia" vs "Constitución de empresas"). SQL limpieza producción. QA anti-duplicado.', done: true, valor: 2100000, quien: 'Claude AI' },
      { num: '30.2', nombre: 'Hilo de conversación por tarea: tarea_id/adjuntos/es_sistema en mensajes (SQL). Mensajes automáticos al completar/verificar. Panel hilo inline en /workspace/tareas con chat + adjuntar docs. Indicador "Requiere revisión" pulsante en tareas completadas.', done: true, valor: 2700000, quien: 'Claude AI' },
      { num: '30.3', nombre: 'Documentación segmentada: tabla documentos_proyecto (SQL + RLS). API /api/documentos. Adjuntos de hilos indexados por categoría según rol. Nueva pestaña Documentación en workspace (/workspace/documentos).', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '30.4', nombre: 'Banner verificación pendiente en dashboard del fundador con link directo al hilo (?tarea=ID). Workspace/tareas abre el hilo automáticamente al detectar el param en URL. Notificaciones como dropdown anclado (patrón Slack/Notion) — elimina la vista de página completa.', done: true, valor: 1400000, quien: 'Claude AI' },
      { num: '30.5', nombre: 'Fix bug crítico: workspace/tareas con "This page couldnt load" por tres causas simultáneas: (1) insert en tabla inexistente sin try/catch, (2) useState de rolesAbiertos/segmentosAbiertos fuera del orden de hooks, (3) rolesTareas perdido en edición. Todos corregidos.', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '30.6', nombre: 'Badges de certificación contador colombiano: cert_tarjeta_profesional y cert_jcc. Columnas en perfiles (SQL). Uploader en /perfil/editar, auto-badge y recalculo Score. Visible en perfil público. Email incentivo + Cron Job semanal lunes 10am UTC.', done: true, valor: 2500000, quien: 'Claude AI' },
      { num: '30.7', nombre: 'Tour onboarding workspace (5 pasos, solo especialistas, localStorage) y tour onboarding dashboard post-registro (5 pasos, 2 variantes fundador/especialista, localStorage). Ambos con overlay/blur, barra de progreso y botón Saltar.', done: true, valor: 2100000, quien: 'Claude AI' },
      { num: '30.8', nombre: 'Mejora proyectos disponibles en dashboard: lista vertical con contexto, detector de match especialidad↔roles_buscados, badge "Encaja con tu perfil", CTA por proyecto.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '30.9', nombre: 'Fix deploy Vercel: Deploy Hook configurado (claude-deploy, branch main). Commit vacío de trigger como flujo estándar de sesión.', done: true, valor: 300000, quien: 'Claude AI + Ivan' },
      { num: '30.10', nombre: '6 builds fallidos Turbopack: wrapper {toastNuevo && (} eliminado al insertar tour onboarding. Todos los deploys desde tour dashboard hasta roadmap completo fallaron. Fix commit 9f9a011. Pendiente: verificacion JSX estricta pre-deploy.', done: true, valor: 0, quien: 'Claude AI' },
      { num: '30.11', nombre: 'Fix duplicados Gerente de Proyecto: handler inicializar+rol_nombre ahora filtra por nombres existentes antes de insertar, evita duplicar si la plantilla se carga dos veces.', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '30.12', nombre: 'SEO Tier 1 ejecutado: 4 landing pages nuevas (/contador-publico-colombia, /abogado-startups-colombia, /startup-chile, /crear-empresa-sin-capital), sitemap actualizado con 7 URLs nuevas, robots.txt con Allow explicito. PLAN_SEO.md en el repo con plan completo 6 meses.', done: true, valor: 2500000, quien: 'Claude AI' },
      { num: '30.13', nombre: 'SEO Tier 2 ejecutado: /desarrollador-startup-colombia, /startup-bogota, /startup-medellin, /startup-santiago, /angel-investor, /buscar-cto. Blog 4 articulos: historia-de-escala, participacion-diferida, constituir-sas-colombia, startup-sin-dinero. Sitemap 23 URLs. /seo dashboard de seguimiento.', done: true, valor: 3000000, quien: 'Claude AI + Ivan' },
    ]
  },
  {
    titulo: 'Dashboard redesign — sidebar, tarjetas y wallet',
    estado: 'progreso',
    valor_total: 4000000,
    valor_hecho: 500000,
    hitos: [
      { num: '31.1', nombre: 'OG image nueva fondo blanco/navy split + favicon.ico 16/32/48px generado con isotipo real. WhatsApp cache busting con ?v=3.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '31.2', nombre: 'Tarjetas de proyecto: 1 CTA Workspace visible + boton 3 puntos (overflow) con opciones secundarias (Publicar rol, Ver hitos, Mis aportes). Lista compacta para 4+ proyectos.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: '31.3', nombre: 'Sidebar rediseñado: 3 secciones — Para hacer ahora (accionables con color warning + flecha), Tu perfil (Score prominente), Wallet (3 saldos: disponible, comprometido, pendiente). Diferenciacion visual urgente vs informativo.', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: '31.4', nombre: 'Wallet widget: 3 saldos visibles en vez de solo el disponible. Comprometido y pendiente de entrada ya existen en el ledger.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: '31.5', nombre: 'PENDIENTE IVAN: correr 20260708_motor_financiero.sql en Supabase, configurar BREB_WEBHOOK_SECRET y BINANCE_WEBHOOK_SECRET en Vercel, /wallet/movimientos y /wallet/pagos/solicitar, QA del motor financiero.', done: false, valor: 500000, quien: 'Ivan + Claude AI' },
    ]
  },
  {
    titulo: 'Escenarios frecuentes — flujo completo 13 etapas',
    estado: 'pendiente',
    valor_total: 45000000,
    valor_hecho: 0,
    hitos: [
      { num: '32.1', nombre: 'ANÁLISIS (2026-07-09): Top 5 escenarios más frecuentes en LATAM: (1) Arrendar local comercial, (2) Abrir restaurante, (3) Importar mercancía, (4) Comprar vehículo para operar, (5) Tienda online. Los 3 gaps críticos que bloquean todos los escenarios: levantamiento de capital real, reparto económico y cierre formal.', done: true, valor: 0, quien: 'Claude AI + Ivan' },
      { num: '32.2', nombre: 'Flujo de 13 etapas (doc Prompt Maestro Escenarios): Necesidad → Publicación → Validación → Formación equipo → Vinculación profesionales → Estructuración financiera → Levantamiento capital → Ejecución → Seguimiento → Finalización → Reparto económico → Cierre → Reputación participantes.', done: true, valor: 0, quien: 'Claude AI + Ivan' },
      { num: '32.3', nombre: 'GAP 1 — Validación del proyecto (etapa 3): checklist antes de publicar — descripción suficiente, al menos 1 rol, 1 hito, capital requerido definido. Wizard de 3 pasos al crear proyecto. Sin validación cualquier escenario queda incompleto.', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: '32.4', nombre: 'GAP 2 — Estructuración financiera por escenario (etapa 6): wizard contextual según tipo de proyecto. Fundador declara cuánto necesita, en qué lo va a usar (depósito, inventario, maquinaria, flete) y qué ofrece (% participación, deuda, revenue share).', done: false, valor: 4000000, quien: 'Claude AI' },
      { num: '32.5', nombre: 'GAP 3 — Levantamiento de capital real (etapa 7): flujo completo ángel → hito específico → capital llega al wallet del proyecto → hito se ejecuta y verifica → participación del ángel registrada. Integración con motor financiero existente.', done: false, valor: 6000000, quien: 'Claude AI' },
      { num: '32.6', nombre: 'GAP 4 — Reparto económico (etapa 11): cuando ocurre evento de pago (primera venta, ronda, venta empresa), calcular y distribuir participación según contratos. Cada participante ve cuánto le corresponde. Pagos desde motor financiero.', done: false, valor: 7000000, quien: 'Claude AI' },
      { num: '32.7', nombre: 'GAP 5 — Cierre formal del proyecto (etapa 12): flujo de cierre cuando todos los hitos completados — confirmación ambas partes, resumen final (aportes, ingresos, participaciones), liberación de reputación. Estado: completado → cerrado.', done: false, valor: 4000000, quien: 'Claude AI' },
      { num: '32.8', nombre: 'GAP 6 — Reputación post-proyecto (etapa 13): calificación mutua al cerrar (1-5 estrellas + comentario). Escala Score se actualiza con resultado real del proyecto cerrado, no solo con tareas verificadas.', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: '32.9', nombre: 'Escenario 1 — Arrendar local: wizard (dirección, valor arriendo, meses depósito, presupuesto adecuación). Tareas predefinidas: buscar local, negociar contrato, constituir empresa, licencia funcionamiento, adecuación, apertura bancaria. Roles: Abogado + Contador.', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '32.10', nombre: 'Escenario 2 — Restaurante/comida: wizard (tipo comida, aforo, ubicación). Tareas predefinidas: licencia INVIMA, permiso bomberos, uso de suelo, registro marca, adecuación. Roles: Abogado, Contador, Diseñador.', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '32.11', nombre: 'Escenario 3 — Importar mercancía: wizard (país origen, tipo, valor FOB, incoterm). Tareas predefinidas: registro importador DIAN, agente aduanas, póliza, bodega, distribución. Capital: fondeo ángel para flete/arancel.', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '32.12', nombre: 'Escenario 4 — Comprar vehículo operativo: wizard (tipo, uso, valor). Tareas: financiamiento, RUNT, SOAT, revisión técnico-mecánica, vinculación plataforma. Capital: ángel financia cuota inicial a cambio de % ingresos operativos.', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: '32.13', nombre: 'Escenario 5 — Tienda online/e-commerce: wizard (categoría productos, mercado, plataforma). Tareas: constitución, diseño marca, desarrollo tienda, catálogo, pagos, lanzamiento. Roles: Desarrollador, Diseñador, CM, Contador. Usa el flujo completo de Escala.', done: false, valor: 2500000, quien: 'Claude AI' },
      { num: '32.14', nombre: 'Biblioteca 100 escenarios: completar los 30 sectores del documento Prompt Maestro (arrendamiento, maquinaria, franquicias, equipos médicos, software, audiovisual, agricultura, ganadería, energías renovables, minería, joyería, exportación, hotelería, educación, salud, logística, IA, biotecnología, turismo, bienes raíces, manufactura, moda, alimentos, centros deportivos, clínicas veterinarias, laboratorios, call centers, proyectos sociales). Cada uno con wizard, tareas y roles sugeridos.', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
    ]
  }
]

export default function DesarrolloLimpio() {
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
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}>
          <img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}/>
          <span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span>
        </a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/desarrollo" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Historial</a>
          <a href="/desarrollo-limpio" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Entregable</a>
          <a href="/comercial" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Comercial</a>
          <a href="/" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Sitio</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Estado real del sistema</div>
          <div style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Plan depurado — entregable al desarrollador</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',lineHeight:'1.6'}}>
            Describe lo que existe hoy, no cómo se construyó. Cuando algo fue mejorado en una fase posterior, aparece la versión vigente marcada con <span style={{color:'#1D9E75',fontWeight:'700'}}>↑ mejorado</span>.<br/>
            El log histórico completo con todos los pasos intermedios está en <a href="/desarrollo" style={{color:'#8FA3CC'}}>→ /desarrollo</a>
          </div>
        </div>

        <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'10px',padding:'0.875rem 1.25rem',marginBottom:'2rem',fontSize:'0.8rem',color:'#8FA3CC',lineHeight:'1.6'}}>
          <strong style={{color:'#1D9E75'}}>Para el nuevo desarrollador:</strong> El fundador ya construyó <strong style={{color:'#1D9E75'}}>{fmt(totalHecho)}</strong> en valor real.
          Tu deuda diferida máxima es <strong style={{color:'#E8A020'}}>{fmt(totalPendiente)}</strong>. No entras a rehacer lo que ya existe — entras a construir lo que falta.
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalHecho)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor ya construido</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPendiente)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Deuda diferida máxima</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPlataforma)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor total estimado</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC',lineHeight:'1',marginBottom:'0.3rem'}}>{pct}%</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Completado</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'6px'}}>
            <span>Progreso total</span><span>{pct}%</span>
          </div>
          <div style={{height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'4px',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#1D9E75,#25c795)',borderRadius:'4px'}}></div>
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
                          <div style={{width:'22px',height:'22px',borderRadius:'50%',background:h.done ? '#1D9E75' : 'rgba(255,255,255,0.06)',border:h.done ? 'none' : '1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',flexShrink:0,marginTop:'2px',color:h.done ? '#fff' : '#8FA3CC'}}>
                            {h.done ? '✓' : h.num.split('.')[1]}
                          </div>
                          <div>
                            <div style={{fontSize:'0.82rem',fontWeight:h.done ? '600' : '400',color:h.done ? '#fff' : '#8FA3CC',marginBottom:'0.15rem',lineHeight:'1.5'}}>{h.nombre}</div>
                            <div style={{fontSize:'0.68rem',color:h.done ? '#1D9E75' : '#6B7280'}}>{h.quien}</div>
                          </div>
                        </div>
                        <div style={{fontFamily:'monospace',fontSize:'0.78rem',fontWeight:'600',color:h.done ? '#1D9E75' : '#6B7280',flexShrink:0}}>{fmt(h.valor)}</div>
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
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>
            El fundador ya construyó <strong style={{color:'#1D9E75'}}>{fmt(totalHecho)}</strong> en valor real de plataforma — pagado con IA y tiempo propio.
            El desarrollador entra a construir los <strong style={{color:'#E8A020'}}>{fmt(totalPendiente)}</strong> restantes. No a repetir lo que ya existe.
          </div>
        </div>
      </main>
    </div>
  )
}
