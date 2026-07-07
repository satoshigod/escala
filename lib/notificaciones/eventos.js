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

  // ---- Módulo 13 — Contratos ----
  contrato_generado: {
    modulo: 'contratos', categoria: 'contratos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '📝',
    titulo: 'Contrato listo para firmar',
    mensaje: (d) => `Tu contrato para el rol de ${d.rol_nombre} en "${d.proyecto_nombre}" está listo. Fírmalo para activar tu participación.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  contrato_vigente: {
    modulo: 'contratos', categoria: 'contratos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '✅',
    titulo: 'Contrato vigente — ambas partes firmaron',
    mensaje: (d) => `El contrato para "${d.proyecto_nombre}" está vigente. Ambas partes firmaron.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 14 — Hitos ----
  hito_creado: {
    modulo: 'hitos', categoria: 'hitos', prioridad: 'normal',
    canales: ['in_app'],
    icon: '🎯',
    titulo: 'Nuevo hito en tu proyecto',
    mensaje: (d) => `Se creó el hito "${d.hito_nombre}" en "${d.proyecto_nombre}".`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 15 — Chat ----
  mensaje_recibido: {
    modulo: 'chat', categoria: 'mensajes', prioridad: 'normal',
    canales: ['in_app', 'push'],
    icon: '💬',
    titulo: 'Nuevo mensaje en tu proyecto',
    mensaje: (d) => `${d.remitente_nombre} escribió en "${d.proyecto_nombre}": ${d.preview}`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/chat`,
  },

  // ---- Módulo 16 — Aportes ----
  aporte_rechazado: {
    modulo: 'aportes', categoria: 'aportes', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '❌',
    titulo: 'Aporte no validado',
    mensaje: (d) => `Tu aporte en "${d.proyecto_nombre}" no fue validado por el fundador.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 17 — Equipo ----
  miembro_se_retiro: {
    modulo: 'equipo', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '🚪',
    titulo: 'Un miembro se retiró del proyecto',
    mensaje: (d) => `${d.miembro_nombre} se retiró de "${d.proyecto_nombre}" (rol: ${d.rol_nombre}).`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 18 — Ingresos ----
  primera_venta: {
    modulo: 'ingresos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💰',
    titulo: '¡Primera venta registrada!',
    mensaje: (d) => `"${d.proyecto_nombre}" acaba de registrar su primera venta por ${d.valor_formateado}. ¡El proyecto genera ingresos!`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

  // ---- Módulo 19 — Ángel de Impulso ----
  impulso_recibido: {
    modulo: 'impulsos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '⚡',
    titulo: '¡Tu proyecto recibió un impulso!',
    mensaje: (d) => `${d.angel_nombre} financió el hito "${d.hito_nombre}" en "${d.proyecto_nombre}" por ${d.valor_formateado}.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 20 — Proyectos (cambios de estado) ----
  proyecto_actualizado: {
    modulo: 'proyectos', categoria: 'proyectos', prioridad: 'baja',
    canales: ['in_app'],
    icon: '✏️',
    titulo: 'Proyecto actualizado',
    mensaje: (d) => `El proyecto "${d.proyecto_nombre}" fue actualizado por el fundador.`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },
  proyecto_completado: {
    modulo: 'proyectos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🏁',
    titulo: '¡Proyecto completado!',
    mensaje: (d) => `El proyecto "${d.proyecto_nombre}" fue marcado como completado. ¡Felicitaciones al equipo!`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

  // ---- Módulo 21 — Score y reputación ----
  score_subio: {
    modulo: 'score', categoria: 'postulaciones', prioridad: 'normal',
    canales: ['in_app'],
    icon: '📈',
    titulo: 'Tu Escala Score subió',
    mensaje: (d) => `Tu score subió a ${d.score_nuevo} puntos. ${d.razon || '¡Sigue así!'}`,
    link: () => '/score',
  },
  nivel_alcanzado: {
    modulo: 'score', categoria: 'postulaciones', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎖️',
    titulo: 'Nuevo nivel alcanzado',
    mensaje: (d) => `¡Alcanzaste ${d.nivel} puntos en tu Escala Score! Eres parte del ${d.percentil || 'top'} de la plataforma.`,
    link: () => '/score',
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

  // ---- Módulo 13 — Contratos ----
  contrato_generado: {
    modulo: 'contratos', categoria: 'contratos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '📝',
    titulo: 'Contrato listo para firmar',
    mensaje: (d) => `Tu contrato para el rol de ${d.rol_nombre} en "${d.proyecto_nombre}" está listo. Fírmalo para activar tu participación.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  contrato_vigente: {
    modulo: 'contratos', categoria: 'contratos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '✅',
    titulo: 'Contrato vigente — ambas partes firmaron',
    mensaje: (d) => `El contrato para "${d.proyecto_nombre}" está vigente. Ambas partes firmaron.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 14 — Hitos ----
  hito_creado: {
    modulo: 'hitos', categoria: 'hitos', prioridad: 'normal',
    canales: ['in_app'],
    icon: '🎯',
    titulo: 'Nuevo hito en tu proyecto',
    mensaje: (d) => `Se creó el hito "${d.hito_nombre}" en "${d.proyecto_nombre}".`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 15 — Chat ----
  mensaje_recibido: {
    modulo: 'chat', categoria: 'mensajes', prioridad: 'normal',
    canales: ['in_app', 'push'],
    icon: '💬',
    titulo: 'Nuevo mensaje en tu proyecto',
    mensaje: (d) => `${d.remitente_nombre} escribió en "${d.proyecto_nombre}": ${d.preview}`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/chat`,
  },

  // ---- Módulo 16 — Aportes ----
  aporte_rechazado: {
    modulo: 'aportes', categoria: 'aportes', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '❌',
    titulo: 'Aporte no validado',
    mensaje: (d) => `Tu aporte en "${d.proyecto_nombre}" no fue validado por el fundador.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 17 — Equipo ----
  miembro_se_retiro: {
    modulo: 'equipo', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '🚪',
    titulo: 'Un miembro se retiró del proyecto',
    mensaje: (d) => `${d.miembro_nombre} se retiró de "${d.proyecto_nombre}" (rol: ${d.rol_nombre}).`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 18 — Ingresos ----
  primera_venta: {
    modulo: 'ingresos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💰',
    titulo: '¡Primera venta registrada!',
    mensaje: (d) => `"${d.proyecto_nombre}" acaba de registrar su primera venta por ${d.valor_formateado}. ¡El proyecto genera ingresos!`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

  // ---- Módulo 19 — Ángel de Impulso ----
  impulso_recibido: {
    modulo: 'impulsos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '⚡',
    titulo: '¡Tu proyecto recibió un impulso!',
    mensaje: (d) => `${d.angel_nombre} financió el hito "${d.hito_nombre}" en "${d.proyecto_nombre}" por ${d.valor_formateado}.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },

  // ---- Módulo 20 — Proyectos (cambios de estado) ----
  proyecto_actualizado: {
    modulo: 'proyectos', categoria: 'proyectos', prioridad: 'baja',
    canales: ['in_app'],
    icon: '✏️',
    titulo: 'Proyecto actualizado',
    mensaje: (d) => `El proyecto "${d.proyecto_nombre}" fue actualizado por el fundador.`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },
  proyecto_completado: {
    modulo: 'proyectos', categoria: 'proyectos', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🏁',
    titulo: '¡Proyecto completado!',
    mensaje: (d) => `El proyecto "${d.proyecto_nombre}" fue marcado como completado. ¡Felicitaciones al equipo!`,
    link: (d) => `/proyectos/${d.proyecto_id}`,
  },

  // ---- Módulo 21 — Score y reputación ----
  score_subio: {
    modulo: 'score', categoria: 'postulaciones', prioridad: 'normal',
    canales: ['in_app'],
    icon: '📈',
    titulo: 'Tu Escala Score subió',
    mensaje: (d) => `Tu score subió a ${d.score_nuevo} puntos. ${d.razon || '¡Sigue así!'}`,
    link: () => '/score',
  },
  nivel_alcanzado: {
    modulo: 'score', categoria: 'postulaciones', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎖️',
    titulo: 'Nuevo nivel alcanzado',
    mensaje: (d) => `¡Alcanzaste ${d.nivel} puntos en tu Escala Score! Eres parte del ${d.percentil || 'top'} de la plataforma.`,
    link: () => '/score',
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
