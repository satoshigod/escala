// lib/notificaciones/eventos.js
//
// Catálogo central de eventos de notificación de Escala.
// Basado en ESCALA_Arquitectura_Notificaciones.docx (50 módulos / 229 eventos, 5 canales).
//
// ESTA FASE (17) implementa los eventos de los módulos que YA existen y tienen un punto
// de disparo real en la app (proyectos, roles/postulaciones, tareas, hitos, aportes,
// administración), en los 3 canales activos hoy: email, in_app, push.
//
// Lo que falta para completar el documento (229 eventos totales) queda registrado en
// app/desarrollo/page.js — Fase 17, con el detalle de qué módulos/canales siguen pendientes
// y por qué (canal sin proveedor todavía, o módulo que aún no existe como funcionalidad).
//
// Cada evento define:
//   modulo    — a qué módulo del documento pertenece (para reportes/filtros futuros)
//   prioridad — 'critica' | 'alta' | 'media' | 'baja' (afecta si se puede desactivar)
//   canales   — subconjunto de ['email','in_app','push'] a intentar
//   icon      — emoji para in-app y push
//   titulo    — título corto (in-app y push)
//   mensaje   — fn(datos) => texto de la notificación
//   link      — fn(datos) => ruta relativa a la que lleva la notificación

export const EVENTOS = {

  // ---- Módulo 01 — Registro ----
  verificar_correo: {
    modulo: 'registro',
    categoria: 'registro',
    prioridad: 'alta',
    canales: ['email'],
    icon: '✉️',
    titulo: 'Confirma tu correo',
    mensaje: () => `Confirma tu correo para completar la verificación de tu cuenta.`,
    link: () => null,
  },

  // ---- Módulo 09 — Proyectos ----
  proyecto_publicado: {
    modulo: 'proyectos',
    categoria: 'proyectos',
    prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '🚀',
    titulo: 'Proyecto publicado',
    mensaje: (d) => `Tu proyecto "${d.proyecto_nombre}" ya está publicado en Escala.`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

  // ---- Módulo 12 — Roles / Postulaciones ----
  cumplimiento_confirmado: {
    modulo: 'roles',
    categoria: 'postulaciones',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Cumplimiento confirmado',
    mensaje: (d) => d.cumplio
      ? `Se confirmó que cumpliste tu aporte en ${d.proyecto_nombre}. Forma de pago: ${d.forma_pago_label}.`
      : `El proyecto ${d.proyecto_nombre} determinó que tu aporte no cumplió lo pactado. No aplica pago.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  nueva_postulacion: {
    modulo: 'roles',
    categoria: 'postulaciones',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📬',
    titulo: 'Nueva postulación',
    mensaje: (d) => `${d.postulante_nombre} se postuló al rol de ${d.rol_nombre} en ${d.proyecto_nombre}.`,
    link: (d) => `/perfil/${d.postulante_id}`,
  },
  postulacion_aceptada: {
    modulo: 'roles',
    categoria: 'postulaciones',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Postulación aceptada',
    mensaje: (d) => `Fuiste aceptado en el rol de ${d.rol_nombre} en ${d.proyecto_nombre}.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  postulacion_rechazada: {
    modulo: 'roles',
    categoria: 'postulaciones',
    prioridad: 'media',
    canales: ['email', 'in_app'],
    icon: '✗',
    titulo: 'Postulación no seleccionada',
    mensaje: (d) => `Tu postulación al rol de ${d.rol_nombre} en ${d.proyecto_nombre} no fue seleccionada esta vez.`,
    link: () => `/proyectos`,
  },

  // ---- Módulo 13 — Tareas ----
  tarea_asignada: {
    modulo: 'tareas',
    categoria: 'tareas',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📋',
    titulo: 'Nueva tarea asignada',
    mensaje: (d) => d.cantidad > 1
      ? `Te asignaron ${d.cantidad} tareas del rol ${d.rol_nombre}.`
      : `Te asignaron la tarea "${d.tarea_nombre}".`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/tareas`,
  },
  tarea_completada: {
    modulo: 'tareas',
    categoria: 'tareas',
    prioridad: 'media',
    canales: ['email', 'in_app', 'push'],
    icon: '🔍',
    titulo: 'Tarea completada — por verificar',
    mensaje: (d) => `${d.completado_por} completó la tarea "${d.tarea_nombre}". Revísala y verifícala.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/tareas`,
  },
  tarea_verificada: {
    modulo: 'tareas',
    categoria: 'tareas',
    prioridad: 'media',
    canales: ['email', 'in_app', 'push'],
    icon: '🏅',
    titulo: 'Tarea verificada',
    mensaje: (d) => `Tu tarea "${d.tarea_nombre}" fue revisada y verificada.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/tareas`,
  },

  // ---- Módulo 14 — Cronogramas / Hitos ----
  hito_completado: {
    modulo: 'cronogramas',
    categoria: 'hitos',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎯',
    titulo: 'Hito completado',
    mensaje: (d) => `El hito "${d.hito_nombre}" de ${d.proyecto_nombre} fue marcado como completado.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/hitos`,
  },

  // ---- Módulo 20 — Aportes ----
  aporte_pendiente_verificacion: {
    modulo: 'aportes',
    categoria: 'aportes',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💰',
    titulo: 'Aporte por verificar',
    mensaje: (d) => `${d.aportante_nombre} registró un aporte de ${d.tipo} en ${d.proyecto_nombre}. Verifícalo.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/aportes`,
  },
  aporte_verificado: {
    modulo: 'aportes',
    categoria: 'aportes',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Aporte verificado',
    mensaje: (d) => `Tu aporte "${d.descripcion}" en ${d.proyecto_nombre} fue verificado.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/aportes`,
  },

  // ---- Módulo 40 — Administración ----
  nuevo_pais: {
    modulo: 'administracion',
    categoria: 'admin',
    prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '🌎',
    titulo: 'Nuevo país sin tareas configuradas',
    mensaje: (d) => `${d.pais_nombre} fue creado por ${d.creado_por} y todavía no tiene tareas regulatorias.`,
    link: () => `/admin-escala`,
  },
  // ---- Módulo 12 — Calificaciones ----
  nueva_calificacion: {
    modulo: 'calificaciones',
    categoria: 'postulaciones',
    prioridad: 'normal',
    canales: ['email', 'in_app'],
    icon: '⭐',
    titulo: 'Nueva calificación recibida',
    mensaje: (d) => `${d.de_nombre} te calificó con ${d.estrellas} estrellas en "${d.proyecto_nombre}".`,
    link: (d) => `/score`,
  },

  // ---- Módulo 11 — Invitaciones ----
  // ---- Módulo 42 — Notificaciones basadas en tiempo (Cron) ----
  tarea_vencida: {
    modulo: 'tareas',
    categoria: 'tareas',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '⏰',
    titulo: 'Tarea vencida',
    mensaje: (d) => `La tarea "${d.tarea_nombre}" en ${d.proyecto_nombre} venció el ${d.fecha_limite} y sigue pendiente.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/tareas`,
  },
  hito_por_vencer: {
    modulo: 'cronogramas',
    categoria: 'hitos',
    prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '⚠️',
    titulo: 'Hito por vencer',
    mensaje: (d) => d.dias_restantes === 0
      ? `El hito "${d.hito_nombre}" vence hoy.`
      : `El hito "${d.hito_nombre}" vence en ${d.dias_restantes} día${d.dias_restantes > 1 ? 's' : ''}.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  proyecto_sin_actividad: {
    modulo: 'proyectos',
    categoria: 'proyectos',
    prioridad: 'baja',
    canales: ['email', 'in_app'],
    icon: '💤',
    titulo: 'Proyecto sin actividad',
    mensaje: (d) => `"${d.proyecto_nombre}" lleva ${d.dias_inactivo} días sin actualizaciones. ¿Todo bien con el equipo?`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 12 — Calificaciones ----
  nueva_calificacion: {
    modulo: 'calificaciones',
    categoria: 'postulaciones',
    prioridad: 'normal',
    canales: ['email', 'in_app'],
    icon: '⭐',
    titulo: 'Nueva calificación recibida',
    mensaje: (d) => `${d.de_nombre} te calificó con ${d.estrellas} estrellas en "${d.proyecto_nombre}".`,
    link: (d) => `/score`,
  },

  // ---- Módulo 11 — Invitaciones ----
  invitacion: {
    modulo: 'invitaciones',
    categoria: 'invitaciones',
    prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '✉️',
    titulo: 'Te invitan a un proyecto',
    mensaje: (d) => `${d.fundador_nombre || 'Un fundador'} te invitó a unirte a "${d.proyecto_nombre}" como ${d.rol_nombre}.`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

}

export const COLOR_POR_PRIORIDAD = {
  critica: '#D85A30',
  alta: '#E8A020',
  media: '#534AB7',
  baja: '#8FA3CC',
}
