import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala-blush-nine.vercel.app'
const ADMIN_EMAIL = 'ivancorrea@plazablack.com'

// GET — listar todos los países disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('paises_regulatorios')
    .select('id, nombre, bandera, tareas')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ paises: data })
}

// POST — crear nuevo país desde el cliente (fundador u onboarding)
export async function POST(request) {
  const body = await request.json()
  const { nombre, bandera, creado_por_nombre, tipo_origen } = body

  if (!nombre) return Response.json({ error: 'Falta nombre del país' }, { status: 400 })

  // Verificar si ya existe
  const { data: existente } = await supabase
    .from('paises_regulatorios')
    .select('id, nombre, bandera')
    .ilike('nombre', nombre)
    .single()

  if (existente) return Response.json({ pais: existente, existia: true })

  // Crear el país sin tareas — el admin las configurará
  const { data, error } = await supabase
    .from('paises_regulatorios')
    .insert([{ nombre, bandera: bandera || '🌐', tareas: [] }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Enviar alerta al admin
  try {
    await fetch(BASE_URL + '/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'nuevo_pais',
        destinatario: ADMIN_EMAIL,
        datos: {
          pais_nombre: nombre,
          bandera: bandera || '🌐',
          creado_por: creado_por_nombre || 'Usuario de Escala',
          tipo_origen: tipo_origen || 'usuario',
          admin_url: BASE_URL + '/admin-escala'
        }
      })
    })
  } catch (e) {
    console.error('Error enviando alerta nuevo país:', e)
  }

  return Response.json({ pais: data, existia: false }, { status: 201 })
}
