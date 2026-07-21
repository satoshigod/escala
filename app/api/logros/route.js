// app/api/logros/route.js
//
// GET  ?usuario_id=X  — logros de un usuario
// POST               — otorgar un logro (idempotente — no duplica si ya existe)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export const DEFINICIONES_LOGROS = {
  primera_postulacion_aceptada: {
    emoji: '🎯',
    titulo: 'Primera aceptación',
    desc: 'Tu primera postulación fue aceptada por un fundador.',
    color: '#1D9E75',
  },
  primera_tarea_verificada: {
    emoji: '✅',
    titulo: 'Entregable verificado',
    desc: 'Tu primer entregable fue verificado por el equipo.',
    color: '#AFA9EC',
  },
  primer_contrato_firmado: {
    emoji: '📝',
    titulo: 'Primer contrato',
    desc: 'Firmaste tu primer contrato en Escala.',
    color: '#E8A020',
  },
  primer_proyecto_completado: {
    emoji: '🏆',
    titulo: 'Proyecto completado',
    desc: 'Participaste en un proyecto que llegó a su fin exitosamente.',
    color: '#D4AF37',
  },
  primer_impulso: {
    emoji: '⚡',
    titulo: 'Primera donación',
    desc: 'Financiaste tu primer hito.',
    color: '#F59E0B',
  },
  primer_aporte_verificado: {
    emoji: '💡',
    titulo: 'Aporte validado',
    desc: 'Tu primer aporte económico fue validado por el equipo.',
    color: '#60A5FA',
  },
  primera_calificacion_recibida: {
    emoji: '⭐',
    titulo: 'Primera calificación',
    desc: 'Recibiste tu primera calificación de un colaborador.',
    color: '#FBBF24',
  },
  perfil_completo: {
    emoji: '👤',
    titulo: 'Perfil completo',
    desc: 'Completaste todos los campos de tu perfil profesional.',
    color: '#34D399',
  },
  cert_tarjeta_profesional: {
    emoji: '🪪',
    titulo: 'Tarjeta Profesional verificada',
    desc: 'Subiste tu Tarjeta Profesional de Contador Público — anverso y reverso.',
    color: '#4A90D9',
    rol: 'Contador',
    pais: 'Colombia',
  },
  cert_jcc: {
    emoji: '📋',
    titulo: 'Certificado JCC vigente',
    desc: 'Subiste el Certificado de Vigencia de Inscripción y Antecedentes Disciplinarios expedido por la Junta Central de Contadores.',
    color: '#AFA9EC',
    rol: 'Contador',
    pais: 'Colombia',
  },
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return Response.json({ error: 'Falta usuario_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('logros_usuario')
    .select('tipo, proyecto_id, created_at')
    .eq('usuario_id', usuario_id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const logros = (data || []).map(l => ({
    ...l,
    ...(DEFINICIONES_LOGROS[l.tipo] || { emoji: '🎖️', titulo: l.tipo, desc: '', color: '#8FA3CC' })
  }))

  return Response.json({ logros })
}

export async function POST(request) {
  try {
    const { usuario_id, tipo, proyecto_id } = await request.json()
    if (!usuario_id || !tipo) return Response.json({ error: 'Faltan campos' }, { status: 400 })

    // Idempotente — UNIQUE(usuario_id, tipo) previene duplicados
    const { error } = await supabase
      .from('logros_usuario')
      .insert({ usuario_id, tipo, proyecto_id: proyecto_id || null })

    // Si ya existe, ignorar el error de unique constraint
    if (error && !error.message.includes('duplicate')) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true, nuevo: !error })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
