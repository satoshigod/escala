const BASE_URL = 'https://escala-blush-nine.vercel.app'

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Escala <onboarding@resend.dev>', to, subject, html })
  })
  return res.json()
}

const style = 'font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px'
const logo = '<div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div>'
const btn = (url, txt) => '<a href="' + url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1rem">' + txt + '</a>'

const templates = {
  nueva_postulacion: ({ fundador_nombre, postulante_nombre, rol_nombre, proyecto_nombre, perfil_url }) => ({
    subject: 'Nueva postulacion en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#E8A020;margin-bottom:0.5rem;text-transform:uppercase">Nueva postulacion</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + postulante_nombre + '</strong> se postulo al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en tu proyecto <strong>' + proyecto_nombre + '</strong>.</p>' + btn(perfil_url, 'Ver perfil del postulante') + '<p style="color:#8FA3CC;font-size:0.82rem">Gestiona desde tu <a href="' + BASE_URL + '/admin" style="color:#1D9E75">panel de fundador</a>.</p></div>'
  }),
  postulacion_aceptada: ({ postulante_nombre, rol_nombre, proyecto_nombre, workspace_url }) => ({
    subject: 'Fuiste aceptado en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#1D9E75;margin-bottom:0.5rem;text-transform:uppercase">Felicitaciones</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu postulacion al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en <strong>' + proyecto_nombre + '</strong> fue <strong style="color:#1D9E75">aceptada</strong>.</p>' + btn(workspace_url, 'Ir al workspace del proyecto') + '</div>'
  }),
  postulacion_rechazada: ({ postulante_nombre, rol_nombre, proyecto_nombre }) => ({
    subject: 'Tu postulacion en ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">En esta oportunidad el equipo de <strong>' + proyecto_nombre + '</strong> decidio no continuar con tu postulacion al rol de <strong>' + rol_nombre + '</strong>.</p>' + btn(BASE_URL + '/proyectos', 'Explorar otros proyectos') + '</div>'
  }),
  invitacion: ({ nombre_invitado, proyecto_nombre, rol_nombre, mensaje_personal, proyecto_url, registro_url }) => ({
    subject: 'Te invitan a unirte a ' + proyecto_nombre,
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#E8A020;margin-bottom:0.5rem;text-transform:uppercase">Invitacion al equipo</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + nombre_invitado + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1rem">Te invitan a unirte al proyecto <strong>' + proyecto_nombre + '</strong> como <strong style="color:#1D9E75">' + rol_nombre + '</strong>.</p>' + (mensaje_personal ? '<div style="background:rgba(255,255,255,0.06);border-left:3px solid #1D9E75;padding:1rem;border-radius:0 8px 8px 0;margin-bottom:1.5rem;color:#C8D4E8;font-style:italic">' + mensaje_personal + '</div>' : '') + btn(proyecto_url, 'Ver el proyecto') + '<p style="color:#8FA3CC;font-size:0.82rem">Si no tienes cuenta, <a href="' + registro_url + '" style="color:#1D9E75">registrate aqui</a>.</p></div>'
  }),
  tarea_asignada: ({ asignado_nombre, cantidad, tarea_nombre, rol_nombre, proyecto_nombre, workspace_url }) => ({
    subject: 'Te asignaron ' + (cantidad > 1 ? cantidad + ' tareas' : 'una nueva tarea') + ' en Escala',
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#E8A020;margin-bottom:0.5rem;text-transform:uppercase">Nueva asignacion</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + asignado_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">' + (cantidad > 1 ? 'Te asignaron <strong style="color:#E8A020">' + cantidad + ' tareas</strong> del rol <strong>' + rol_nombre + '</strong>' : 'Te asignaron la tarea <strong style="color:#E8A020">' + tarea_nombre + '</strong>') + ' en tu proyecto de Escala.</p>' + btn(workspace_url, 'Ver mis tareas') + '</div>'
  }),
  tarea_completada: ({ fundador_nombre, tarea_nombre, completado_por, workspace_url }) => ({
    subject: completado_por + ' completó una tarea en tu proyecto',
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#1D9E75;margin-bottom:0.5rem;text-transform:uppercase">Tarea completada</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + completado_por + '</strong> completó la tarea <strong style="color:#1D9E75">' + tarea_nombre + '</strong>. Revísala y verifícala cuando puedas.</p>' + btn(workspace_url, 'Verificar tarea') + '</div>'
  }),
  tarea_verificada: ({ asignado_nombre, tarea_nombre, workspace_url }) => ({
    subject: 'Tu tarea fue verificada',
    html: '<div style="' + style + '">' + logo + '<div style="font-size:0.75rem;font-weight:700;color:#AFA9EC;margin-bottom:0.5rem;text-transform:uppercase">Tarea verificada</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + asignado_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu tarea <strong style="color:#AFA9EC">' + tarea_nombre + '</strong> fue revisada y verificada por el equipo. Buen trabajo.</p>' + btn(workspace_url, 'Ver mis tareas') + '</div>'
  }),
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { tipo, destinatario, datos } = body
    if (!tipo || !destinatario || !datos) return Response.json({ error: 'Faltan campos' }, { status: 400 })
    const template = templates[tipo]
    if (!template) return Response.json({ error: 'Tipo no valido: ' + tipo }, { status: 400 })
    const { subject, html } = template(datos)
    const result = await sendEmail(destinatario, subject, html)
    return Response.json({ ok: true, result })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
