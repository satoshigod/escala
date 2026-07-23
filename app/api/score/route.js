import { notificar } from '@/lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const NIVELES = [25, 50, 75, 100]

export async function POST(request) {
  const body = await request.json()
  const { perfil_id } = body

  if (!perfil_id) return Response.json({ error: 'Falta perfil_id' }, { status: 400 })

  // Score anterior
  const { data: perfilAntes } = await supabase
    .from('perfiles').select('escala_score, nombre, email').eq('id', perfil_id).single()
  const scoreAntes = perfilAntes?.escala_score || 0

  const { data, error } = await supabase.rpc('calcular_escala_score', { perfil_uuid: perfil_id })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const scoreNuevo = data || 0

  // Notificar si subió
  if (scoreNuevo > scoreAntes && perfilAntes?.email) {
    const dest = { id: perfil_id, email: perfilAntes.email, nombre: perfilAntes.nombre }

    // score_subio — siempre que suba más de 5 puntos
    if (scoreNuevo - scoreAntes >= 5) {
      await notificar('score_subio', dest, {
        score_nuevo: scoreNuevo,
        score_anterior: scoreAntes,
        razon: '¡Tu actividad en Escala está dando resultados!',
      }).catch(() => {})
    }

    // nivel_alcanzado — cuando cruza un umbral (25, 50, 75, 100)
    const nivelAlcanzado = NIVELES.find(n => scoreAntes < n && scoreNuevo >= n)
    if (nivelAlcanzado) {
      await notificar('nivel_alcanzado', dest, {
        nivel: nivelAlcanzado,
        score_nuevo: scoreNuevo,
      }).catch(() => {})
    }
  }

  return Response.json({ score: scoreNuevo })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const perfil_id = searchParams.get('perfil_id')

  if (!perfil_id) return Response.json({ error: 'Falta perfil_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('perfiles')
    .select('escala_score, nombre')
    .eq('id', perfil_id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ score: data.escala_score, nombre: data.nombre })
}
