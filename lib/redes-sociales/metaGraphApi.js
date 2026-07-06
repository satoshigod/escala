// lib/redes-sociales/metaGraphApi.js
//
// Cliente de bajo nivel para Meta Graph API v25.
// Maneja: publicación en Página de Facebook, publicación en Instagram Business,
// renovación de tokens de larga duración, y verificación de credenciales.
//
// Variables de entorno requeridas:
//   META_APP_ID              — ID de la app (4534429656788672)
//   META_APP_SECRET          — Clave secreta de la app
//   META_PAGE_ID             — ID de la Página de Facebook (1213762118485497)
//   META_PAGE_ACCESS_TOKEN   — Page Access Token (corto o largo plazo)
//   META_IG_BUSINESS_ID      — Instagram Business Account ID (17841417022595646)

const BASE = 'https://graph.facebook.com/v25.0'

// ─── Utilidades ─────────────────────────────────────────────────────────────

function token() {
  const t = process.env.META_PAGE_ACCESS_TOKEN
  if (!t) throw new Error('META_PAGE_ACCESS_TOKEN no está configurado en las variables de entorno')
  return t
}

function pageId() {
  const id = process.env.META_PAGE_ID
  if (!id) throw new Error('META_PAGE_ID no está configurado en las variables de entorno')
  return id
}

function igId() {
  const id = process.env.META_IG_BUSINESS_ID
  if (!id) throw new Error('META_IG_BUSINESS_ID no está configurado en las variables de entorno')
  return id
}

async function graphFetch(path, options = {}) {
  const url = `${BASE}/${path}`
  const res = await fetch(url, options)
  const data = await res.json()
  if (data.error) {
    throw new Error(`Meta Graph API error: ${data.error.message} (código ${data.error.code})`)
  }
  return data
}

// ─── Token de larga duración ─────────────────────────────────────────────────

/**
 * Convierte un User Access Token de corta duración (1h) en uno de 60 días.
 * Llama esto una vez con el token del Graph API Explorer para obtener
 * el token largo que guardas en las variables de entorno de Vercel.
 */
export async function extenderToken(shortLivedUserToken) {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const data = await graphFetch(
    `oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedUserToken}`
  )
  return data.access_token // Token de 60 días
}

/**
 * Obtiene el Page Access Token de larga duración (no expira mientras la app
 * tenga acceso) a partir de un User Token largo.
 */
export async function obtenerPageToken(longLivedUserToken) {
  const data = await graphFetch(
    `${pageId()}?fields=access_token&access_token=${longLivedUserToken}`
  )
  return data.access_token
}

// ─── Verificación ─────────────────────────────────────────────────────────────

/**
 * Verifica que las credenciales configuradas sean válidas.
 * Retorna { ok: true, nombre } o lanza un error.
 */
export async function verificarCredenciales() {
  // Con un Page Access Token, /me devuelve la Página sin necesitar pages_read_engagement
  const data = await graphFetch(`me?fields=id,name&access_token=${token()}`)
  return { ok: true, nombre: data.name, id: data.id }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

/**
 * Publica un post con imagen en la Página de Facebook.
 * @param {string} texto - Texto del post (máx 63.206 caracteres)
 * @param {string} imagenUrl - URL pública de la imagen
 * @returns {{ id: string, url: string }}
 */
export async function publicarFacebook(texto, imagenUrl) {
  const pid = pageId()
  const tk = token()

  // Si hay imagen, primero subimos la foto y luego creamos el post
  if (imagenUrl) {
    const foto = await graphFetch(`${pid}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imagenUrl,
        caption: texto,
        access_token: tk,
        published: true,
      }),
    })
    const postId = foto.post_id || foto.id
    return {
      id: postId,
      url: `https://www.facebook.com/${pid}/posts/${postId.split('_')[1] || postId}`,
    }
  }

  // Solo texto
  const post = await graphFetch(`${pid}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: texto,
      access_token: tk,
    }),
  })
  return {
    id: post.id,
    url: `https://www.facebook.com/${pid}/posts/${post.id.split('_')[1] || post.id}`,
  }
}

// ─── Instagram ────────────────────────────────────────────────────────────────

/**
 * Publica una imagen con caption en Instagram Business.
 * El proceso de IG requiere 2 pasos: crear contenedor → publicar.
 * @param {string} caption - Texto del post (máx 2.200 caracteres)
 * @param {string} imagenUrl - URL pública de la imagen (HTTPS requerido)
 * @returns {{ id: string }}
 */
export async function publicarInstagram(caption, imagenUrl) {
  const igBusinessId = igId()
  const tk = token()

  // Paso 1: crear contenedor de medios
  const contenedor = await graphFetch(`${igBusinessId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imagenUrl,
      caption: caption,
      access_token: tk,
    }),
  })

  if (!contenedor.id) {
    throw new Error('Meta no devolvió un ID de contenedor para Instagram')
  }

  // Paso 2: publicar el contenedor
  const publicacion = await graphFetch(`${igBusinessId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: contenedor.id,
      access_token: tk,
    }),
  })

  return { id: publicacion.id }
}

// ─── Publicación combinada ────────────────────────────────────────────────────

/**
 * Publica en Facebook e Instagram simultáneamente.
 * Si una falla, la otra sigue adelante (no son atómicas).
 * @returns {{ facebook: objeto|error, instagram: objeto|error }}
 */
export async function publicarAmbas(textFb, textIg, imagenUrl) {
  const resultados = { facebook: null, instagram: null }

  const [fb, ig] = await Promise.allSettled([
    publicarFacebook(textFb, imagenUrl),
    publicarInstagram(textIg, imagenUrl),
  ])

  resultados.facebook = fb.status === 'fulfilled'
    ? { ok: true, ...fb.value }
    : { ok: false, error: fb.reason?.message }

  resultados.instagram = ig.status === 'fulfilled'
    ? { ok: true, ...ig.value }
    : { ok: false, error: ig.reason?.message }

  return resultados
}
