// app/api/impulsos/route.js
import { createClient } from '@supabase/supabase-js'
import { notificar } from '@/lib/notificaciones/notificar'
import { otorgarLogro } from '@/lib/logros'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — impulsos de un ángel
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const angel_id = searchParams.get('angel_id')
  const proyecto_id = searchParams.get('proyecto_id')

  let query = supabase
    .from('impulsos')
    .select('*, hitos:hito_id(nombre), proyectos:proyecto_id(nombre)')
    .order('created_at', { ascending: false })

  if (angel_id) query = query.eq('angel_id', angel_id)
  if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ impulsos: data || [] })
}

// POST — registrar un impulso y notificar al fundador
export async function POST(request) {
  try {
    const { proyecto_id, angel_id, hito_id, descripcion, valor } = await request.json()
    if (!proyecto_id || !angel_id) return Response.json({ error: 'Faltan campos' }, { status: 400 })

    const { data, error } = await supabase
      .from('impulsos')
      .insert([{ proyecto_id, angel_id, hito_id: hito_id || null, descripcion, valor: valor || 0 }])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Notificar al fundador del proyecto
    try {
      const [angel, proyecto, hito] = await Promise.all([
        supabase.from('perfiles').select('nombre').eq('id', angel_id).single(),
        supabase.from('proyectos').select('nombre, fundador_id, perfiles!proyectos_fundador_id_fkey(email, nombre)').eq('id', proyecto_id).single(),
        hito_id ? supabase.from('hitos').select('nombre').eq('id', hito_id).single() : Promise.resolve({ data: null }),
      ])

      if (proyecto.data?.perfiles?.email) {
        await notificar('impulso_recibido', {
          id: proyecto.data.fundador_id,
          email: proyecto.data.perfiles.email,
          nombre: proyecto.data.perfiles.nombre,
        }, {
          angel_nombre: angel.data?.nombre || 'Un inversionista',
          hito_nombre: hito.data?.nombre || descripcion || 'un hito',
          proyecto_nombre: proyecto.data.nombre,
          proyecto_id,
          valor_formateado: '$' + Number(valor || 0).toLocaleString('es-CO'),
        })
      }

      // Otorgar logro al ángel
      await otorgarLogro(supabase, angel_id, 'primer_impulso', proyecto_id)
    } catch(e) {
      console.error('[impulsos] Error notificando:', e.message)
    }

    return Response.json({ impulso: data }, { status: 201 })
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
