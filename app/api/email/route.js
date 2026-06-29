const BASE_URL = 'https://escala-blush-nine.vercel.app'

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: 'Escala <onboarding@resend.dev>', to, subject, html })
  })
  return res.json()
}

function templateNuevaPostulacion({ fundador_nombre, postulante_nombre, rol_nombre, proyecto_nombre, perfil_url }) {
  return {
    subject: 'Nueva postulacion en ' + proyecto_nombre + ' — ' + rol_nombre,
    html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px"><div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div><div style="font-size:0.75rem;font-weight:700;color:#E8A020;margin-bottom:0.5rem;text-transform:uppercase">Nueva postulacion</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + fundador_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem"><strong>' + postulante_nombre + '</strong> se postulo al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en tu proyecto <strong>' + proyecto_nombre + '</strong>.</p><a href="' + perfil_url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1.5rem">Ver perfil del postulante</a><p style="color:#8FA3CC;font-size:0.82rem">Gestiona desde tu <a href="' + BASE_URL + '/admin" style="color:#1D9E75">panel de fundador</a>.</p></div>'
  }
}

function templateAceptada({ postulante_nombre, rol_nombre, proyecto_nombre, workspace_url }) {
  return {
    subject: 'Fuiste aceptado en ' + proyecto_nombre + ' — ' + rol_nombre,
    html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px"><div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div><div style="font-size:0.75rem;font-weight:700;color:#1D9E75;margin-bottom:0.5rem;text-transform:uppercase">Felicitaciones</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Tu postulacion al rol de <strong style="color:#1D9E75">' + rol_nombre + '</strong> en <strong>' + proyecto_nombre + '</strong> fue <strong style="color:#1D9E75">aceptada</strong>. Ya eres parte del equipo.</p><a href="' + workspace_url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1.5rem">Ir al workspace del proyecto</a><p style="color:#8FA3CC;font-size:0.82rem">En el workspace encontraras los hitos, el equipo, el chat y el seguimiento de tus aportes.</p></div>'
  }
}

function templateRechazada({ postulante_nombre, rol_nombre, proyecto_nombre }) {
  return {
    subject: 'Tu postulacion en ' + proyecto_nombre,
    html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px"><div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + postulante_nombre + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">En esta oportunidad el equipo de <strong>' + proyecto_nombre + '</strong> decidio no continuar con tu postulacion al rol de <strong>' + rol_nombre + '</strong>.</p><a href="' + BASE_URL + '/proyectos" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700">Explorar otros proyectos</a></div>'
  }
}

function templateInvitacion({ nombre_invitado, proyecto_nombre, rol_nombre, mensaje_personal, proyecto_url, registro_url }) {
  return {
    subject: 'Te invitan a unirte a ' + proyecto_nombre + ' en Escala',
    html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px"><div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div><div style="font-size:0.75rem;font-weight:700;color:#E8A020;margin-bottom:0.5rem;text-transform:uppercase">Invitacion al equipo</div><h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Hola ' + nombre_invitado + ',</h1><p style="color:#C8D4E8;line-height:1.7;margin-bottom:1rem">Te invitan a unirte al proyecto <strong>' + proyecto_nombre + '</strong> como <strong style="color:#1D9E75">' + rol_nombre + '</strong> en Escala.</p>' + (mensaje_personal ? '<div style="background:rgba(255,255,255,0.06);border-left:3px solid #1D9E75;padding:1rem;border-radius:0 8px 8px 0;margin-bottom:1.5rem;color:#C8D4E8;font-style:italic;line-height:1.6">' + mensaje_personal + '</div>' : '') + '<a href="' + proyecto_url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1rem">Ver el proyecto</a><p style="color:#8FA3CC;font-size:0.82rem">Si no tienes cuenta en Escala, <a href="' + registro_url + '" style="color:#1D9E75">registrate aqui</a>.</p></div>'
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { tipo, destinatario, datos } = body
    if (!tipo || !destinatario || !datos) return Response.json({ error: 'Faltan campos' }, { status: 400 })
    let template
    if (tipo === 'nueva_postulacion') template = templateNuevaPostulacion(datos)
    else if (tipo === 'postulacion_aceptada') template = templateAceptada(datos)
    else if (tipo === 'postulacion_rechazada') template = templateRechazada(datos)
    else if (tipo === 'invitacion') template = templateInvitacion(datos)
    else return Response.json({ error: 'Tipo no valido' }, { status: 400 })
    const result = await sendEmail(destinatario, template.subject, template.html)
    return Response.json({ ok: true, result })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
