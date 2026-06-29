import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  const body = await request.json()
  const { perfil_id } = body

  if (!perfil_id) return Response.json({ error: 'Falta perfil_id' }, { status: 400 })

  const { data, error } = await supabase.rpc('calcular_escala_score', { perfil_uuid: perfil_id })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ score: data })
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
