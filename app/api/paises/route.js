import { createClient } from '@supabase/supabase-js'
import { EVENTOS, COLOR_POR_PRIORIDAD } from '../../../lib/notificaciones/eventos'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'
const ADMIN_EMAIL = 'ivancorrea@plazablack.com'

// GET — listar todos los países disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('paises_regulatorios')
    .select('id, nombre, bandera, tareas, creado_por, created_at, perfiles:creado_por ( nombre )')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ paises: data })
}

// POST — crear nuevo país desde el cliente (fundador u onboarding)
export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, bandera, creado_por_nombre, tipo_origen, creado_por } = body

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'Falta nombre del país' }, { status: 400 })
    }

    const nombreLimpio = nombre.trim()
    const creadoPorLimpio = (creado_por && typeof creado_por === 'string' && creado_por.length > 0) ? creado_por : null

    // Verificar si ya existe — usamos maybeSingle, NO single, porque single lanza error si no hay filas
    const { data: existente, error: errorBusqueda } = await supabase
      .from('paises_regulatorios')
      .select('id, nombre, bandera')
      .ilike('nombre', nombreLimpio)
      .maybeSingle()

    if (errorBusqueda) {
      return Response.json({ error: 'Error buscando país: ' + errorBusqueda.message }, { status: 500 })
    }

    if (existente) {
      return Response.json({ pais: existente, existia: true })
    }

    // Crear el país sin tareas — el admin las configurará después. creado_por queda registrado para auditoría
    const payloadInsert = { nombre: nombreLimpio, bandera: bandera || '🌐', tareas: [], creado_por: creadoPorLimpio }

    const { data: nuevoPais, error: errorInsert } = await supabase
      .from('paises_regulatorios')
      .insert(payloadInsert)
      .select('id, nombre, bandera, tareas, creado_por, created_at')
      .single()

    if (errorInsert) {
      return Response.json({ error: 'Error creando país: ' + errorInsert.message }, { status: 500 })
    }

    // Enviar alerta al admin — si falla el email, no debe bloquear la respuesta exitosa
    try {
      await fetch(BASE_URL + '/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'nuevo_pais',
          destinatario: ADMIN_EMAIL,
          datos: {
            pais_nombre: nombreLimpio,
            bandera: bandera || '🌐',
            creado_por: creado_por_nombre || 'Usuario de Escala',
            tipo_origen: tipo_origen || 'usuario',
            admin_url: BASE_URL + '/admin-escala'
          }
        })
      })
    } catch (e) {
      console.error('Error enviando alerta nuevo país (no crítico):', e.message)
    }

    // Notificación in-app a los administradores (adicional al email de arriba, no lo reemplaza)
    try {
      const { data: admins } = await supabase.from('perfiles').select('id').eq('es_admin', true)
      if (admins && admins.length > 0) {
        const evento = EVENTOS.nuevo_pais
        const datosEvento = { pais_nombre: nombreLimpio, creado_por: creado_por_nombre || 'Usuario de Escala' }
        await supabase.from('notificaciones').insert(admins.map(a => ({
          destinatario_id: a.id,
          tipo: 'nuevo_pais',
          modulo: evento.modulo,
          prioridad: evento.prioridad,
          titulo: evento.titulo,
          mensaje: evento.mensaje(datosEvento),
          link: evento.link(),
          icon: evento.icon,
          color: COLOR_POR_PRIORIDAD[evento.prioridad],
          datos: datosEvento,
        })))
      }
    } catch (e) {
      console.error('Error notificando in-app a admins (no crítico):', e.message)
    }

    return Response.json({ pais: nuevoPais, existia: false }, { status: 201 })

  } catch (e) {
    return Response.json({ error: 'Error inesperado: ' + e.message }, { status: 500 })
  }
}
