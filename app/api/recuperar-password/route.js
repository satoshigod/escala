
import { supabaseAdmin } from '@/lib/supabase-admin'
// Cliente service-role: SUPABASE_SECRET_KEY es el env real usado en toda la app

const BASE_URL = 'https://escala.network'

// Correo de recuperacion con identidad Escala, enviado por Resend
// (mismo canal que el resto de correos transaccionales de la plataforma)
function emailRecuperacion(enlace) {
  const style = 'font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0D1B3E;color:#fff;border-radius:12px'
  const logo = '<div style="font-size:1.3rem;font-weight:900;margin-bottom:1.5rem">Esca<span style="color:#1D9E75">la</span></div>'
  const btn = (url, txt) => '<a href="' + url + '" style="display:inline-block;background:#1D9E75;color:#fff;padding:0.875rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:1rem">' + txt + '</a>'
  return {
    subject: 'Restablece tu contrasena en Escala',
    html: '<div style="' + style + '">' + logo +
      '<div style="font-size:0.75rem;font-weight:700;color:#1D9E75;margin-bottom:0.5rem;text-transform:uppercase">Recuperar acceso</div>' +
      '<h1 style="font-size:1.2rem;font-weight:800;margin:0 0 1rem">Restablece tu contrasena</h1>' +
      '<p style="color:#C8D4E8;line-height:1.7;margin-bottom:1.5rem">Recibimos una solicitud para restablecer la contrasena de tu cuenta en Escala. Haz clic en el boton para elegir una nueva. El enlace expira en 1 hora.</p>' +
      btn(enlace, 'Elegir nueva contrasena') +
      '<p style="color:#8FA3CC;font-size:0.82rem;line-height:1.6">Si no pediste esto, puedes ignorar este correo — tu contrasena no cambiara.</p>' +
      '</div>'
  }
}

async function enviarPorResend(destinatario, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Escala <notificaciones@mail.escala.network>', to: destinatario, subject, html })
  })
  return res.json()
}

export async function POST(req) {
  // Respuesta neutra: nunca revela si el email existe o no (evita enumeracion de cuentas)
  const neutro = Response.json({
    ok: true,
    mensaje: 'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contrasena.'
  })

  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      // Formato invalido: igual respondemos neutro para no dar pistas
      return neutro
    }

    // Genera el enlace de recuperacion con Supabase Auth (token seguro, con expiracion).
    // redirectTo debe estar en la lista de Redirect URLs permitidas de Supabase Auth.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo: BASE_URL + '/restablecer' }
    })

    // Si el usuario no existe, generateLink devuelve error: no enviamos nada y respondemos neutro.
    if (error || !data || !data.properties || !data.properties.action_link) {
      return neutro
    }

    const { subject, html } = emailRecuperacion(data.properties.action_link)
    await enviarPorResend(email.trim().toLowerCase(), subject, html)

    return neutro
  } catch {
    // Cualquier fallo interno: respuesta neutra (no filtramos detalle al cliente)
    return neutro
  }
}
