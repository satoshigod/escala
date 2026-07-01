// lib/notificaciones/plantillasEmail.js
//
// Plantillas de email usadas por notificar.js. Reutiliza EXACTAMENTE el mismo estilo
// visual definido en app/api/email/route.js (fondo #0D1B3E, logo, botón verde #1D9E75)
// para que ningún correo nuevo se vea distinto a los que ya existen.
//
// Se envían directo con fetch a la API de Resend (mismo patrón que ya usa el proyecto),
// sin pasar por /api/email, para evitar un round-trip HTTP innecesario desde el servidor.

const style = 'font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px'
const logo = '<div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div>'
const btn = (url, txt) => '<a href="' + url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1rem">' + txt + '</a>'
const eyebrow = (color, txt) => '<div style="font-size:0.75rem;font-weight:700;color:' + color + ';margin-bottom:0.5rem;text-transform:uppercase">' + txt + '</div>'

export const PLANTILLAS_EMAIL = {
  // --- copiadas de app/api/email/route.js (mismo texto/estilo, no se tocó el original) ---
  nueva_postulacion: ({ fundador_nombre, postulante_nombre, rol_nombre, proyecto_nombre, perfil_url }) => ({
    subject: 'Nueva postulacion en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + eyebrow('#E8A020', 'Nueva postulacion') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + postulante_nombre + '</strong> se postulo al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en tu proyecto <strong>' + proyecto_nombre + '</strong>.</p>' + btn(perfil_url, 'Ver perfil del postulante') + '</div>'
  }),
  postulacion_aceptada: ({ postulante_nombre, rol_nombre, proyecto_nombre, workspace_url }) => ({
    subject: 'Fuiste aceptado en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + eyebrow('#1D9E75', 'Felicitaciones') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu postulacion al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en <strong>' + proyecto_nombre + '</strong> fue <strong style="color:#1D9E75">aceptada</strong>.</p>' + btn(workspace_url, 'Ir al workspace del proyecto') + '</div>'
  }),
  postulacion_rechazada: ({ postulante_nombre, rol_nombre, proyecto_nombre, proyectos_url }) => ({
    subject: 'Tu postulacion en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">En esta oportunidad el equipo de <strong>' + proyecto_nombre + '</strong> decidio no continuar con tu postulacion al rol de <strong>' + rol_nombre + '</strong>.</p>' + btn(proyectos_url, 'Explorar otros proyectos') + '</div>'
  }),
  tarea_asignada: ({ asignado_nombre, cantidad, tarea_nombre, rol_nombre, proyecto_nombre, workspace_url }) => ({
    subject: 'Te asignaron ' + (cantidad > 1 ? cantidad + ' tareas' : 'una nueva tarea') + ' en Escala',
    html: '<div style="' + style + '">' + logo + eyebrow('#E8A020', 'Nueva asignacion') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + asignado_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">' + (cantidad > 1 ? 'Te asignaron <strong style="color:#E8A020">' + cantidad + ' tareas</strong> del rol <strong>' + rol_nombre + '</strong>' : 'Te asignaron la tarea <strong style="color:#E8A020">' + tarea_nombre + '</strong>') + ' en tu proyecto de Escala.</p>' + btn(workspace_url, 'Ver mis tareas') + '</div>'
  }),
  tarea_completada: ({ fundador_nombre, tarea_nombre, completado_por, workspace_url }) => ({
    subject: completado_por + ' completó una tarea en tu proyecto',
    html: '<div style="' + style + '">' + logo + eyebrow('#1D9E75', 'Tarea completada') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + completado_por + '</strong> completó la tarea <strong style="color:#1D9E75">' + tarea_nombre + '</strong>. Revísala y verifícala cuando puedas.</p>' + btn(workspace_url, 'Verificar tarea') + '</div>'
  }),
  tarea_verificada: ({ asignado_nombre, tarea_nombre, workspace_url }) => ({
    subject: 'Tu tarea fue verificada',
    html: '<div style="' + style + '">' + logo + eyebrow('#AFA9EC', 'Tarea verificada') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + asignado_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu tarea <strong style="color:#AFA9EC">' + tarea_nombre + '</strong> fue revisada y verificada por el equipo. Buen trabajo.</p>' + btn(workspace_url, 'Ver mis tareas') + '</div>'
  }),
  nuevo_pais: ({ pais_nombre, bandera, creado_por, tipo_origen, admin_url }) => ({
    subject: '🌎 Nuevo país creado — ' + pais_nombre + ' necesita tareas regulatorias',
    html: '<div style="' + style + '">' + logo + eyebrow('#E8A020', '⚠️ Acción requerida') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">' + (bandera || '🌐') + ' ' + pais_nombre + ' fue agregado</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Un ' + tipo_origen + ' creó el país <strong style="color:#E8A020">' + pais_nombre + '</strong> en la plataforma. Este país todavía <strong>no tiene tareas regulatorias configuradas</strong>.</p>' + btn(admin_url, 'Configurar tareas para ' + pais_nombre) + '<p style="color:#8FA3CC;font-size:0.82rem">Creado por: ' + creado_por + '</p></div>'
  }),

  // --- nuevas para Fase 17 ---
  proyecto_publicado: ({ fundador_nombre, proyecto_nombre, proyecto_url }) => ({
    subject: 'Tu proyecto "' + proyecto_nombre + '" está publicado',
    html: '<div style="' + style + '">' + logo + eyebrow('#1D9E75', 'Proyecto publicado') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu proyecto <strong style="color:#1D9E75">' + proyecto_nombre + '</strong> ya está publicado y visible para especialistas en Escala.</p>' + btn(proyecto_url, 'Ver mi proyecto') + '</div>'
  }),
  hito_completado: ({ hito_nombre, proyecto_nombre, workspace_url }) => ({
    subject: 'Hito completado en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + eyebrow('#E8A020', 'Hito completado') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">¡Buenas noticias!</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">El hito <strong style="color:#E8A020">' + hito_nombre + '</strong> de <strong>' + proyecto_nombre + '</strong> fue marcado como completado.</p>' + btn(workspace_url, 'Ver hitos del proyecto') + '</div>'
  }),
  aporte_pendiente_verificacion: ({ fundador_nombre, aportante_nombre, tipo, descripcion, proyecto_nombre, workspace_url }) => ({
    subject: 'Nuevo aporte por verificar en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + eyebrow('#E8A020', 'Aporte por verificar') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + aportante_nombre + '</strong> registró un aporte de <strong style="color:#E8A020">' + tipo + '</strong> — "' + descripcion + '" — en <strong>' + proyecto_nombre + '</strong>.</p>' + btn(workspace_url, 'Verificar aporte') + '</div>'
  }),
  aporte_verificado: ({ aportante_nombre, descripcion, proyecto_nombre, workspace_url }) => ({
    subject: 'Tu aporte fue verificado',
    html: '<div style="' + style + '">' + logo + eyebrow('#1D9E75', 'Aporte verificado') + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + aportante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu aporte <strong style="color:#1D9E75">"' + descripcion + '"</strong> en ' + proyecto_nombre + ' fue verificado y ya cuenta en tu participación.</p>' + btn(workspace_url, 'Ver mis aportes') + '</div>'
  }),
}

export async function enviarEmailRaw(tipo, destinatario, datos) {
  const plantilla = PLANTILLAS_EMAIL[tipo]
  if (!plantilla) throw new Error('Plantilla de email no encontrada para tipo: ' + tipo)
  const { subject, html } = plantilla(datos)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Escala <notificaciones@mail.escala.network>', to: destinatario, subject, html })
  })
  return res.json()
}
