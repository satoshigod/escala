import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function DELETE(req) {
  const authHeader = req.headers.get('x-qa-cleanup')
  if (authHeader !== 'escala-qa-2026') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resumen = []
  let total = 0

  // Paises QA — tabla correcta es paises_regulatorios
  const { data: paises, error: ep } = await supabaseAdmin
    .from('paises_regulatorios').select('id,nombre').ilike('nombre', 'QA-%')
  if (paises?.length) {
    const { error } = await supabaseAdmin.from('paises_regulatorios').delete().in('id', paises.map(p => p.id))
    if (!error) { resumen.push(paises.length + ' paises'); total += paises.length }
    else resumen.push('ERROR paises: ' + error.message)
  } else resumen.push('paises: 0' + (ep ? ' err:' + ep.message : ''))

  // Especialidades QA
  const { data: esps } = await supabaseAdmin
    .from('especialidades').select('id').ilike('nombre', 'QA-%')
  if (esps?.length) {
    const { error } = await supabaseAdmin.from('especialidades').delete().in('id', esps.map(e => e.id))
    if (!error) { resumen.push(esps.length + ' especialidades'); total += esps.length }
    else resumen.push('ERROR especialidades: ' + error.message)
  } else resumen.push('especialidades: 0')

  // Categorias QA
  const { data: cats } = await supabaseAdmin
    .from('categorias').select('id').ilike('nombre', 'QA-%')
  if (cats?.length) {
    const { error } = await supabaseAdmin.from('categorias').delete().in('id', cats.map(c => c.id))
    if (!error) { resumen.push(cats.length + ' categorias'); total += cats.length }
    else resumen.push('ERROR categorias: ' + error.message)
  } else resumen.push('categorias: 0')

  return Response.json({ ok: true, total, resumen, mensaje: total > 0 ? 'Eliminado: ' + resumen.join(', ') : 'Nada que limpiar' })
}
