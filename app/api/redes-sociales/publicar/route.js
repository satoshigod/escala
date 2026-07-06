// app/api/redes-sociales/publicar/route.js
//
// API route para disparar publicaciones en redes sociales desde eventos de Escala.
//
// POST /api/redes-sociales/publicar
// Body: { tipo_evento, entidad_id, nombre, url, ...datos_adicionales }
//
// Esta route es llamada internamente desde otras API routes cuando ocurre
// un evento relevante (proyecto publicado, empresa creada, etc.)
// No es pública — requiere el SUPABASE_SECRET_KEY para autenticar.

import { NextResponse } from 'next/server'
import { publicarEvento, aprobarYPublicar } from '@/lib/redes-sociales/publicar'

// Protección básica: solo llamadas internas con la service key
function autorizado(request) {
  const authHeader = request.headers.get('authorization')
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  return authHeader === `Bearer ${serviceKey}`
}

export async function POST(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { tipo_evento, ...datos } = body

  if (!tipo_evento) {
    return NextResponse.json({ error: 'tipo_evento es requerido' }, { status: 400 })
  }

  try {
    const resultado = await publicarEvento(tipo_evento, datos)
    return NextResponse.json({ ok: true, resultado })
  } catch (error) {
    console.error('[API Redes] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/redes-sociales/publicar?id=<registroId>
// Aprueba y publica un registro pendiente de aprobación manual
export async function PUT(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
  }

  try {
    const resultado = await aprobarYPublicar(id)
    return NextResponse.json({ ok: true, resultado })
  } catch (error) {
    console.error('[API Redes] Error aprobando:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
