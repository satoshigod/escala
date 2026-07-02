import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

// GET — lista la deuda de un proyecto, ordenada de menor a mayor (lo básico primero,
// para que el ángel vea de un vistazo qué es rápido/barato de resolver al entrar capital)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  if (!proyecto_id) return Response.json({ error: 'Falta proyecto_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('deuda_pendiente')
    .select('*, perfiles:beneficiario_id ( nombre, email )')
    .eq('proyecto_id', proyecto_id)
    .order('resuelta', { ascending: true })
    .order('valor', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const pendiente = (data || []).filter(d => !d.resuelta)
  const resuelta = (data || []).filter(d => d.resuelta)
  const total_pendiente = pendiente.reduce((s, d) => s + Number(d.valor || 0), 0)

  return Response.json({ deuda: data || [], pendiente, resuelta, total_pendiente })
}

// PATCH — resuelve una deuda puntual (el ángel/fundador decide pagar esta ahora, en cash o acciones)
export async function PATCH(request) {
  const body = await request.json()
  const { id, resuelta_como, resuelta_por } = body
  if (!id || !resuelta_como) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('deuda_pendiente')
    .update({ resuelta: true, resuelta_como, resuelta_por: resuelta_por || null, resuelta_en: new Date().toISOString() })
    .eq('id', id)
    .select('*, perfiles:beneficiario_id ( nombre, email ), proyectos:proyecto_id ( nombre )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  try {
    if (data.beneficiario_id) {
      const forma_pago_labels = { cash: 'pago en efectivo', acciones: 'participación accionaria' }
      await notificar('cumplimiento_confirmado', { id: data.beneficiario_id, email: data.perfiles?.email }, {
        postulante_nombre: data.perfiles?.nombre || 'Usuario',
        proyecto_nombre: data.proyectos?.nombre || 'el proyecto',
        proyecto_id: data.proyecto_id,
        cumplio: true,
        forma_pago_label: 'deuda resuelta — ' + (forma_pago_labels[resuelta_como] || resuelta_como),
        workspace_url: BASE_URL + '/proyectos/' + data.proyecto_id + '/workspace',
      })
    }
  } catch (e) {
    console.error('Error notificando resolución de deuda:', e.message)
  }

  return Response.json({ deuda: data })
}
