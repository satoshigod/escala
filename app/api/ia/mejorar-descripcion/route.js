// app/api/ia/mejorar-descripcion/route.js
//
// Mejora la descripción de un proyecto usando Claude.
// Recibe el texto crudo del fundador y devuelve una versión más clara,
// completa y atractiva — manteniendo la voz del fundador.

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  try {
    const { descripcion, nombre, sector } = await request.json()

    if (!descripcion || descripcion.length < 20) {
      return NextResponse.json({ error: 'Descripción muy corta' }, { status: 400 })
    }

    const mensaje = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Eres un experto en comunicar proyectos de emprendimiento de forma clara y atractiva para cualquier tipo de audiencia — desde un tendero hasta un inversionista.

Mejora esta descripción de proyecto manteniendo la esencia y la voz del fundador. Hazla más clara, completa y atractiva. Máximo 3-4 oraciones. Sin bullet points. Sin introducción — devuelve solo el texto mejorado.

Proyecto: ${nombre || 'Sin nombre'}
Sector: ${sector || 'No especificado'}
Descripción original: ${descripcion}

Texto mejorado:`
        }
      ]
    })

    const descripcionMejorada = mensaje.content[0]?.text?.trim()

    if (!descripcionMejorada) {
      return NextResponse.json({ error: 'No se pudo generar mejora' }, { status: 500 })
    }

    return NextResponse.json({ descripcion: descripcionMejorada })

  } catch (error) {
    console.error('[IA] Error mejorando descripción:', error.message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
