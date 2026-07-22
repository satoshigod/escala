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
  // ---- Módulo 22 — Motor Financiero: Fondeo ----
  fondeo_iniciado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'normal',
    canales: ['in_app'],
    icon: '🏦',
    titulo: 'Fondeo iniciado',
    mensaje: (d) => `Tu fondeo de ${d.monto_formateado} por ${d.proveedor} está listo. Realiza la transferencia antes de que expire.`,
    link: () => '/wallet/fondear',
  },
  fondeo_completado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: '¡Fondeo acreditado!',
    mensaje: (d) => `${d.monto_formateado} fueron acreditados en tu wallet. Saldo disponible: ${d.saldo_formateado}.`,
    link: () => '/wallet',
  },
  fondeo_fallido: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '❌',
    titulo: 'Fondeo no procesado',
    mensaje: (d) => `El fondeo de ${d.monto_formateado} no pudo procesarse. ${d.razon || 'Intenta de nuevo o contacta soporte.'}`,
    link: () => '/wallet/fondear',
  },
  fondeo_pendiente_admin: {
    modulo: 'finanzas', categoria: 'admin', prioridad: 'normal',
    canales: ['in_app'],
    icon: '📋',
    titulo: 'Nuevo fondeo por verificar',
    mensaje: (d) => `${d.usuario_nombre} inició un fondeo de ${d.monto_formateado} por ${d.proveedor}.`,
    link: () => '/admin/financiero',
  },

  // ---- Módulo 23 — Motor Financiero: Pagos ----
  pago_solicitado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'normal',
    canales: ['in_app'],
    icon: '📤',
    titulo: 'Solicitud de pago enviada',
    mensaje: (d) => `Tu solicitud de ${d.monto_formateado} para "${d.proyecto_nombre}" está en revisión.`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  pago_en_revision: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'normal',
    canales: ['in_app'],
    icon: '🔍',
    titulo: 'Pago en revisión',
    mensaje: (d) => `El administrador está revisando tu solicitud de ${d.monto_formateado}.`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  pago_aprobado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Pago aprobado',
    mensaje: (d) => `Tu solicitud de ${d.monto_formateado} fue aprobada. El pago se ejecutará pronto.`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  pago_rechazado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '❌',
    titulo: 'Solicitud de pago rechazada',
    mensaje: (d) => `Tu solicitud de ${d.monto_formateado} fue rechazada. ${d.razon ? 'Motivo: ' + d.razon : ''}`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  pago_ejecutado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '💸',
    titulo: '¡Pago ejecutado!',
    mensaje: (d) => `${d.monto_formateado} fueron transferidos. Ref: ${d.numero_referencia}`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  pago_reversado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '↩️',
    titulo: 'Pago reversado',
    mensaje: (d) => `El pago de ${d.monto_formateado} fue reversado. Los fondos serán devueltos a tu wallet.`,
    link: (d) => `/wallet/pagos/${d.orden_id}`,
  },
  admin_pago_pendiente: {
    modulo: 'finanzas', categoria: 'admin', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '🔔',
    titulo: 'Nueva orden de pago pendiente',
    mensaje: (d) => `${d.solicitante_nombre} solicita un pago de ${d.monto_formateado} para "${d.proyecto_nombre}".`,
    link: () => '/admin/financiero',
  },

  // ---- Movimientos de wallet — entradas y salidas ----
  wallet_fondeo_acreditado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💰',
    titulo: 'Capital acreditado a tu wallet',
    mensaje: (d) => `$${d.monto_formateado} COP fueron acreditados a tu wallet. Saldo disponible: $${d.saldo_formateado}.`,
    link: () => '/wallet',
  },
  wallet_debito_ejecutado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '📤',
    titulo: 'Pago debitado de tu wallet',
    mensaje: (d) => `$${d.monto_formateado} COP fueron debitados de tu wallet. Ref: ${d.numero_referencia}. Saldo disponible: $${d.saldo_formateado}.`,
    link: () => '/wallet/movimientos',
  },
  wallet_credito_recibido: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📥',
    titulo: 'Dinero recibido',
    mensaje: (d) => `$${d.monto_formateado} COP de "${d.origen}" fueron acreditados a tu wallet. Saldo: $${d.saldo_formateado}.`,
    link: () => '/wallet/movimientos',
  },
  wallet_proyecto_fondeado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🏦',
    titulo: 'Capital acreditado al proyecto',
    mensaje: (d) => `$${d.monto_formateado} COP fueron acreditados al wallet del proyecto "${d.proyecto_nombre}". Ya puedes ejecutar los gastos aprobados.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/capital`,
  },
  admin_transferencia_recibida: {
    modulo: 'finanzas', categoria: 'admin', prioridad: 'critica',
    canales: ['email', 'in_app'],
    icon: '🔔',
    titulo: 'Transferencia pendiente de verificar',
    mensaje: (d) => `${d.nombre_usuario} reporta transferencia de $${d.monto_formateado} COP. Ref: ${d.referencia || 'sin referencia'}. Verificar en admin/finanzas.`,
    link: () => '/admin/finanzas',
  },
  admin_fondeo_presupuesto_verificado: {
    modulo: 'finanzas', categoria: 'admin', prioridad: 'alta',
    canales: ['in_app'],
    icon: '✅',
    titulo: 'Fondeo de presupuesto verificado',
    mensaje: (d) => `Fondeo de $${d.monto_formateado} para "${d.nombre_item}" en "${d.proyecto_nombre}" verificado y acreditado.`,
    link: () => '/admin/finanzas',
  },
  reparto_linea_pagada: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💸',
    titulo: 'Pago de tu participacion recibido',
    mensaje: (d) => `El fundador confirma el pago de $${d.monto_formateado} COP por concepto de "${d.concepto}" en el proyecto "${d.proyecto_nombre}".`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/reparto`,
  },
  local_inversionista_asignado: {
    modulo: 'local', categoria: 'proyecto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🏪',
    titulo: 'Ya tienes inversionista para tu local',
    mensaje: (d) => `Un inversionista tomo tu local "${d.nombre_negocio}" y va a poner $${d.monto_formateado} COP. Escala recibe el capital y paga el deposito y arriendo al arrendador.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local`,
  },
  equipo_liberado: {
    modulo: 'programa', categoria: 'proyecto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎉',
    titulo: 'Tu equipo ya es tuyo',
    mensaje: (d) => `${d.nombre}, terminaste de pagar tu ${d.equipo}. Te enviamos la carta que certifica que ahora es de tu propiedad. Lo lograste.`,
    link: () => '/mi-equipo',
  },
  capital_recuperado: {
    modulo: 'programa', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Recuperaste tu capital',
    mensaje: (d) => `Se recupero el 100% de tu inversion en la ${d.equipo} de ${d.beneficiaria}: $${d.monto_formateado} COP. El equipo pasa a su propiedad.`,
    link: () => '/mi-cartera',
  },
  equipo_hito: {
    modulo: 'programa', categoria: 'proyecto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📦',
    titulo: 'Novedad con tu equipo',
    mensaje: (d) => d.hito === 'entrega'
      ? `${d.nombre}, tu ${d.equipo} fue entregada e instalada. Ya puedes empezar a producir.`
      : `${d.nombre}, completaste la capacitacion de tu ${d.equipo}. Desde ahora reportas tu produccion cada mes.`,
    link: (d) => `/proyectos/${d.contrato_id}/workspace/leasing`,
  },
  leasing_mora: {
    modulo: 'programa', categoria: 'finanzas', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '⚠️',
    titulo: 'Tu reporte mensual',
    mensaje: (d) => {
      if (d.tipo === 'recordatorio') return `${d.nombre}, no vemos tu reporte de este mes. Si produjiste poco no hay problema — igual repórtalo, el abono se ajusta solo.`
      if (d.tipo === 'mora') return `${d.nombre}, llevas varios meses sin reportar. Escríbenos para entender que paso y buscar una salida.`
      if (d.tipo === 'reestructuracion') return `${d.nombre}, acordamos un nuevo plan de pago para tu equipo. ${d.nota || ''}`.trim()
      return `${d.nombre}, necesitamos hablar sobre tu contrato de leasing. ${d.nota || ''}`.trim()
    },
    link: () => '/custodia',
  },
  admin_solicitud_programa: {
    modulo: 'programa', categoria: 'admin', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '📋',
    titulo: 'Nueva solicitud al programa',
    mensaje: (d) => `${d.nombre} aplico por una ${d.tipo_equipo}. Score ${d.score}/100 — ${d.banda}.`,
    link: () => '/admin/programa',
  },
  solicitud_programa_actualizada: {
    modulo: 'programa', categoria: 'proyecto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📩',
    titulo: 'Novedad sobre tu solicitud',
    mensaje: (d) => d.estado === 'preaprobada'
      ? `${d.nombre}, tu solicitud paso el primer filtro. Te llamamos para agendar la visita a tu taller.`
      : d.estado === 'verificada'
      ? `${d.nombre}, verificamos tu taller. Seguimos con la cotizacion de tu maquina.`
      : `${d.nombre}, por ahora no podemos avanzar con tu solicitud. ${d.motivo || ''}`.trim(),
    link: () => '/programa/aplicar',
  },
  custodia_pago_requerido: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💳',
    titulo: 'Pago pendiente a Escala',
    mensaje: (d) => `Debes pagar $${d.monto_formateado} COP a Escala por "${d.concepto}". Cuando pagues, marca "Ya pague" para que Escala lo verifique.`,
    link: () => '/wallet/pagos',
  },
  admin_custodia_por_verificar: {
    modulo: 'finanzas', categoria: 'admin', prioridad: 'critica',
    canales: ['email', 'in_app'],
    icon: '🔔',
    titulo: 'Pago a custodia por verificar',
    mensaje: (d) => `Se reporto un pago de $${d.monto_formateado} COP por "${d.concepto}". Ref: ${d.referencia}. Verificar recepcion en admin.`,
    link: () => '/admin/finanzas',
  },
  custodia_pago_confirmado: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Escala confirmo tu pago',
    mensaje: (d) => `Escala confirmo que recibio tus $${d.monto_formateado} COP por "${d.concepto}". El dinero esta en custodia y se transferira al receptor.`,
    link: () => '/wallet/movimientos',
  },
  custodia_pago_emitido: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📤',
    titulo: 'Escala te envio un pago',
    mensaje: (d) => `Escala te envio $${d.monto_formateado} COP por "${d.concepto}". Ref: ${d.referencia}. Cuando lo recibas, confirma para cerrar el pago.`,
    link: () => '/wallet/movimientos',
  },
  custodia_recibido: {
    modulo: 'finanzas', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '📥',
    titulo: 'Dinero recibido',
    mensaje: (d) => `Confirmaste que recibiste $${d.monto_formateado} COP de Escala por "${d.concepto}". Pago completado.`,
    link: () => '/wallet/movimientos',
  },
  local_abono_capital: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🏪',
    titulo: 'Abono al capital del local',
    mensaje: (d) => `El negocio "${d.nombre_negocio}" realizó un abono de $${d.monto_formateado} al capital. Capital pagado: ${d.pct_pagado}%.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local/inversionista`,
  },
  local_pago_completado: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '🎉',
    titulo: 'Capital del local completamente pagado',
    mensaje: (d) => `El negocio "${d.nombre_negocio}" ha pagado el 100% del capital. Tu inversion ha sido recuperada.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local/inversionista`,
  },

  // ---- Módulo 26 — Presupuesto e Inversión ----
  inversion_propuesta_recibida: {
    modulo: 'presupuesto', categoria: 'presupuesto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💰',
    titulo: 'Nueva propuesta de inversión',
    mensaje: (d) => `Un inversionista quiere fondear "${d.nombre_item}" con $${d.monto_formateado}. Revisa la propuesta.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/presupuesto`,
  },
  inversion_propuesta_aceptada: {
    modulo: 'presupuesto', categoria: 'presupuesto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Tu propuesta fue aceptada',
    mensaje: (d) => `Tu inversión de $${d.monto_formateado} en "${d.nombre_item}" fue aceptada. Realiza la transferencia para activar el fondeo.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/presupuesto`,
  },
  inversion_transferencia_pendiente_verificacion: {
    modulo: 'presupuesto', categoria: 'presupuesto', prioridad: 'critica',
    canales: ['email', 'in_app'],
    icon: '🔍',
    titulo: 'Transferencia pendiente de verificacion',
    mensaje: (d) => `Un inversionista reporto transferencia de $${d.monto} para "${d.nombre_item}". Verificar comprobante.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/presupuesto`,
  },
  inversion_fondeada_verificada: {
    modulo: 'presupuesto', categoria: 'presupuesto', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎉',
    titulo: 'Item fondeado y verificado',
    mensaje: (d) => `"${d.nombre_item}" fue fondeado y verificado. El capital esta disponible en el proyecto.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/presupuesto`,
  },

  // ---- Reparto economico ----
  reparto_registrado: {
    modulo: 'reparto', categoria: 'finanzas', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '💸',
    titulo: 'Nuevo reparto registrado',
    mensaje: (d) => `El proyecto ${d.proyecto_nombre} registró un ingreso. Tu parte: $${d.monto_formateado} COP (${d.concepto}).`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/reparto`,
  },

  // ---- Notificaciones a angeles ----
  angel_oportunidad_compatible: {
    modulo: 'marketplace', categoria: 'inversion', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🌟',
    titulo: 'Nueva oportunidad de inversion compatible',
    mensaje: (d) => `"${d.proyecto_nombre}" necesita financiar ${d.nombre_item} por $${d.monto_formateado} COP. Es un proyecto de ${d.sector} en ${d.ciudad} — compatible con tu perfil de inversion.`,
    link: () => '/directorio-inversion',
  },

  // ---- Módulo 25 — Local Comercial ----
  local_sin_reporte_alerta: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '⚠️',
    titulo: 'Sin reporte de ventas',
    mensaje: (d) => `${d.nombre_negocio} lleva ${d.dias_sin_reportar} dias sin reportar ventas. Por favor reporta hoy para mantener al dia tu compromiso con el inversionista.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local`,
  },
  local_sin_reporte_inversionista: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '🔴',
    titulo: 'Operador sin reportar ventas',
    mensaje: (d) => `${d.nombre_negocio} lleva ${d.dias_sin_reportar} dias sin reportar ventas. Revisa el estado del negocio.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local/inversionista`,
  },
  local_pago_recibido: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'alta',
    canales: ['in_app'],
    icon: '💚',
    titulo: 'Pago recibido',
    mensaje: (d) => `${d.nombre_negocio} pago $${d.monto_formateado} hoy. Saldo pendiente: $${d.saldo_formateado}.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local/inversionista`,
  },
  local_fase_cambiada: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'alta',
    canales: ['email', 'in_app', 'push'],
    icon: '🎉',
    titulo: 'Cambio de fase en tu negocio',
    mensaje: (d) => `${d.nombre_negocio} termino de pagar el capital. Ahora entra a la fase de regalia (${d.pct_regalia}% sobre ventas).`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace/local`,
  },
  local_verificacion_aprobada: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'critica',
    canales: ['email', 'in_app', 'push'],
    icon: '✅',
    titulo: 'Tu negocio fue aprobado',
    mensaje: (d) => `Tu proyecto ${d.nombre_negocio} fue aprobado por Escala. Ya puedes recibir fondeo de inversionistas.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },
  local_verificacion_rechazada: {
    modulo: 'local_comercial', categoria: 'local_comercial', prioridad: 'alta',
    canales: ['email', 'in_app'],
    icon: '❌',
    titulo: 'Tu proyecto necesita ajustes',
    mensaje: (d) => `Tu proyecto ${d.nombre_negocio} fue revisado. Motivo: ${d.motivo}. Puedes corregirlo y volver a enviarlo.`,
    link: (d) => `/proyectos/${d.proyecto_id}/workspace`,
  },


}
