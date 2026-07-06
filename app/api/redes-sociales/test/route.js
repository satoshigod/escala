// app/api/redes-sociales/test/route.js
//
// Ruta de prueba para verificar que el módulo de redes sociales funciona.
// Solo disponible en desarrollo — eliminar o proteger antes de producción pública.
//
// GET /api/redes-sociales/test?modo=credenciales  → verifica token de Meta
// GET /api/redes-sociales/test?modo=publicar      → hace una publicación real de prueba

import { NextResponse } from 'next/server'
import { verificarCredenciales } from '@/lib/redes-sociales/metaGraphApi'
import { publicarEvento } from '@/lib/redes-sociales/publicar'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const modo = searchParams.get('modo') || 'credenciales'

  // Auth temporalmente desactivada para prueba inicial

  if (modo === 'credenciales') {
    try {
      const resultado = await verificarCredenciales()
      return NextResponse.json({
        ok: true,
        mensaje: 'Token de Meta válido',
        pagina: resultado.nombre,
        id: resultado.id,
      })
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
      }, { status: 500 })
    }
  }

  if (modo === 'publicar') {
    try {
      const resultado = await publicarEvento('proyecto_publicado', {
        entidad_id: '00000000-0000-0000-0000-000000000001', // ID de prueba
        nombre: 'Proyecto de prueba — Escala',
        url: 'https://escala.network',
        subtitulo: 'Esta es una publicación de prueba del sistema automático',
      })
      return NextResponse.json({ ok: true, resultado })
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
      }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'modo no válido. Usa ?modo=credenciales o ?modo=publicar' }, { status: 400 })
}
