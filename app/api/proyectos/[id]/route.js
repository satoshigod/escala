import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(request, context) {
  const params = await context.params
  const id = params.id

  const { data, error } = await supabase
    .from('proyectos')
    .select(`*, perfiles ( nombre, ciudad ), roles ( * )`)
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyecto: data })
}
