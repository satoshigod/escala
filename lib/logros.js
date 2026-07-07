// lib/logros.js
//
// Helper para otorgar logros directamente desde las API routes de Next.js
// sin necesitar un fetch interno a /api/logros (que falla en algunos entornos).
//
// Uso:
//   import { otorgarLogro } from '@/lib/logros'
//   await otorgarLogro(supabase, usuario_id, 'primera_postulacion_aceptada', proyecto_id)

export async function otorgarLogro(supabase, usuario_id, tipo, proyecto_id = null) {
  if (!usuario_id || !tipo) return
  try {
    // Idempotente: UNIQUE(usuario_id, tipo) previene duplicados
    await supabase
      .from('logros_usuario')
      .insert({ usuario_id, tipo, proyecto_id: proyecto_id || null })
    // Si ya existe, Supabase lanza un error de unique constraint — lo ignoramos
  } catch (e) {
    // Ignorar silenciosamente — el logro ya fue otorgado antes
    if (!e?.message?.includes('duplicate') && !e?.code === '23505') {
      console.error('[logros]', e?.message)
    }
  }
}
