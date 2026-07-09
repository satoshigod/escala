// app/api/cron/incentivo-cert-contador/route.js
//
// Cron Job — se ejecuta semanalmente.
// Busca contadores colombianos sin documentos profesionales subidos
// y les envía un email de incentivo para que los suban.
//
// Registrado en vercel.json como:
//   { "path": "/api/cron/incentivo-cert-contador", "schedule": "0 10 * * 1" }
//   (lunes a las 10am UTC)

import { createClient } from '@supabase/supabase-js'
import { enviarEmailRaw } from '@/lib/notificaciones/plantillasEmail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

export async function GET(request) {
  // Proteger: solo Vercel Cron puede llamar este endpoint
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Buscar contadores colombianos con postulaciones aceptadas
  // y que aún no hayan subido ninguno de los dos documentos
  const { data: contadores, error } = await supabase
    .from('perfiles')
    .select('id, nombre, email, especialidad, pais')
    .or('especialidad.ilike.%contad%,especialidad.ilike.%contab%')
    .eq('pais', 'Colombia')
    .is('cert_tarjeta_profesional_url', null)
    .is('cert_jcc_url', null)
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const enviados = []
  const fallidos = []

  for (const c of contadores || []) {
    if (!c.email) continue
    try {
      await enviarEmailRaw('incentivo_cert_contador', c.email, {
        nombre: c.nombre,
        perfil_url: BASE_URL + '/perfil/editar',
      })
      enviados.push(c.email)
    } catch (e) {
      fallidos.push({ email: c.email, error: e.message })
    }
  }

  return Response.json({
    ok: true,
    enviados: enviados.length,
    fallidos: fallidos.length,
    detalle_fallidos: fallidos,
  })
}
