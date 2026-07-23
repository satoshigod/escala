import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// GET — listar todas las industrias disponibles
export async function GET() {
  const { data, error } = await supabase
    .from('industrias')
    .select('id, nombre, tareas')
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ industrias: data })
}
