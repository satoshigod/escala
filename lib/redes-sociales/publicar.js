// lib/redes-sociales/publicar.js
//
// Orquestador principal del módulo de publicación en redes sociales.
//
// Responsabilidades:
//   1. Recibir un evento de Escala
//   2. Resolver la plantilla de texto
//   3. Generar las tarjetas visuales
//   4. Verificar idempotencia (no publicar el mismo evento dos veces)
//   5. Publicar en Facebook y/o Instagram (o encolar para aprobación)
//   6. Guardar el resultado en la tabla `publicaciones_redes`
//   7. Reintentar en caso de error (máx 3 intentos)
//
// Uso desde una API route de Next.js:
//
//   import { publicarEvento } from '@/lib/redes-sociales/publicar'
//
//   await publicarEvento('proyecto_publicado', {
//     entidad_id: proyecto.id,
//     nombre: proyecto.nombre,
//     url: `https://escala.network/proyectos/${proyecto.id}`,
//   })

import { resolverPlantilla } from './plantillas.js'
import { generarTarjetas } from './generarTarjeta.js'
import { publicarFacebook, publicarInstagram } from './metaGraphApi.js'
import { createClient } from '@supabase/supabase-js'

const MAX_REINTENTOS = 3
const DELAY_MS = 2000 // espera entre reintentos

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Idempotencia ────────────────────────────────────────────────────────────

/**
 * Verifica si este evento ya fue publicado para esta entidad.
 * Evita publicar el mismo hito dos veces si el webhook se dispara dos veces.
 */
async function yaPublicado(tipoEvento, entidadId) {
  const db = supabase()
  const { data } = await db
    .from('publicaciones_redes')
    .select('id')
    .eq('tipo_evento', tipoEvento)
    .eq('entidad_id', entidadId)
    .in('estado', ['publicado', 'pendiente_aprobacion'])
    .limit(1)
  return data && data.length > 0
}

// ─── Auditoría ────────────────────────────────────────────────────────────────

async function crearRegistro(datos) {
  const db = supabase()
  const { data, error } = await db
    .from('publicaciones_redes')
    .insert(datos)
    .select('id')
    .single()
  if (error) throw new Error(`Error creando registro de auditoría: ${error.message}`)
  return data.id
}

async function actualizarRegistro(id, datos) {
  const db = supabase()
  await db.from('publicaciones_redes').update(datos).eq('id', id)
}

// ─── Reintentos ───────────────────────────────────────────────────────────────

async function conReintentos(fn, maxIntentos = MAX_REINTENTOS) {
  let ultimoError
  for (let i = 0; i < maxIntentos; i++) {
    try {
      return await fn()
    } catch (err) {
      ultimoError = err
      console.error(`[Escala Redes] Intento ${i + 1}/${maxIntentos} falló:`, err.message)
      if (i < maxIntentos - 1) await sleep(DELAY_MS * (i + 1))
    }
  }
  throw ultimoError
}

// ─── Publicador principal ─────────────────────────────────────────────────────

/**
 * Publica un evento en Facebook e Instagram.
 *
 * @param {string} tipoEvento - clave del evento (ej: 'proyecto_publicado')
 * @param {object} datos - datos del evento:
 *   - entidad_id: ID de la entidad (proyecto, empresa, etc.)
 *   - nombre: nombre del elemento
 *   - url: URL de Escala del elemento
 *   - [cualquier variable de plantilla adicional]
 * @returns {{ id: string, estado: string }}
 */
export async function publicarEvento(tipoEvento, datos = {}) {
  // 1. Resolver plantilla
  const plantilla = resolverPlantilla(tipoEvento, datos)
  if (!plantilla) {
    console.warn(`[Escala Redes] Tipo de evento sin plantilla: ${tipoEvento}`)
    return null
  }

  // 2. Verificar idempotencia
  if (datos.entidad_id) {
    const duplicado = await yaPublicado(tipoEvento, datos.entidad_id)
    if (duplicado) {
      console.log(`[Escala Redes] Evento ya publicado, omitiendo: ${tipoEvento} / ${datos.entidad_id}`)
      return { estado: 'duplicado_omitido' }
    }
  }

  // 3. Crear registro de auditoría inicial
  const registroId = await crearRegistro({
    tipo_evento: tipoEvento,
    entidad_id: datos.entidad_id || null,
    texto_facebook: plantilla.textFb,
    texto_instagram: plantilla.textIg,
    estado: plantilla.auto ? 'procesando' : 'pendiente_aprobacion',
    datos_evento: datos,
    intentos: 0,
  })

  // 4. Si requiere aprobación manual, detenemos aquí
  if (!plantilla.auto) {
    console.log(`[Escala Redes] Evento encolado para aprobación: ${tipoEvento} (registro ${registroId})`)
    return { id: registroId, estado: 'pendiente_aprobacion' }
  }

  // 5. Generar tarjetas visuales
  let urlImagenFb, urlImagenIg
  try {
    const tarjetas = await generarTarjetas(
      datos.nombre || tipoEvento,
      datos.subtitulo || 'escala.network',
      datos.url || 'https://escala.network',
      `${tipoEvento}-${registroId}`
    )
    urlImagenFb = tarjetas.urlFacebook
    urlImagenIg = tarjetas.urlInstagram
  } catch (err) {
    console.error('[Escala Redes] Error generando tarjetas:', err.message)
    // Continuamos sin imagen si falla — publicamos solo texto
  }

  // 6. Publicar en Facebook e Instagram con reintentos
  const resultado = {
    facebook: null,
    instagram: null,
    errores: [],
  }

  if (plantilla.activoFb) {
    try {
      resultado.facebook = await conReintentos(() =>
        publicarFacebook(plantilla.textFb, urlImagenFb)
      )
    } catch (err) {
      resultado.errores.push(`Facebook: ${err.message}`)
    }
  }

  if (plantilla.activoIg) {
    try {
      resultado.instagram = await conReintentos(() =>
        publicarInstagram(plantilla.textIg, urlImagenIg)
      )
    } catch (err) {
      resultado.errores.push(`Instagram: ${err.message}`)
    }
  }

  // 7. Actualizar registro de auditoría con resultado
  const estado = resultado.errores.length === 0
    ? 'publicado'
    : resultado.facebook || resultado.instagram
    ? 'publicado_parcial'
    : 'error'

  await actualizarRegistro(registroId, {
    estado,
    facebook_post_id: resultado.facebook?.id || null,
    facebook_post_url: resultado.facebook?.url || null,
    instagram_post_id: resultado.instagram?.id || null,
    imagen_facebook_url: urlImagenFb || null,
    imagen_instagram_url: urlImagenIg || null,
    errores: resultado.errores.length > 0 ? resultado.errores : null,
    publicado_en: new Date().toISOString(),
  })

  console.log(`[Escala Redes] Evento procesado: ${tipoEvento} → estado: ${estado}`)
  return { id: registroId, estado, ...resultado }
}

/**
 * Aprueba y publica manualmente un registro que está en
 * estado 'pendiente_aprobacion'. Usado desde el panel de admin.
 */
export async function aprobarYPublicar(registroId) {
  const db = supabase()
  const { data: registro, error } = await db
    .from('publicaciones_redes')
    .select('*')
    .eq('id', registroId)
    .eq('estado', 'pendiente_aprobacion')
    .single()

  if (error || !registro) {
    throw new Error(`Registro no encontrado o no está pendiente: ${registroId}`)
  }

  await actualizarRegistro(registroId, { estado: 'procesando' })

  const resultado = { facebook: null, instagram: null, errores: [] }

  try {
    resultado.facebook = await conReintentos(() =>
      publicarFacebook(registro.texto_facebook, registro.imagen_facebook_url)
    )
  } catch (err) {
    resultado.errores.push(`Facebook: ${err.message}`)
  }

  try {
    resultado.instagram = await conReintentos(() =>
      publicarInstagram(registro.texto_instagram, registro.imagen_instagram_url)
    )
  } catch (err) {
    resultado.errores.push(`Instagram: ${err.message}`)
  }

  const estado = resultado.errores.length === 0 ? 'publicado'
    : resultado.facebook || resultado.instagram ? 'publicado_parcial' : 'error'

  await actualizarRegistro(registroId, {
    estado,
    facebook_post_id: resultado.facebook?.id || null,
    facebook_post_url: resultado.facebook?.url || null,
    instagram_post_id: resultado.instagram?.id || null,
    publicado_en: new Date().toISOString(),
    errores: resultado.errores.length > 0 ? resultado.errores : null,
  })

  return { id: registroId, estado, ...resultado }
}
