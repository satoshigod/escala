// lib/redes-sociales/generarTarjeta.js
//
// Genera tarjetas visuales con la identidad de marca de Escala para publicar
// en Facebook e Instagram. Usa SVG → PNG via sharp (disponible en Vercel).
//
// Dimensiones:
//   Facebook: 1200 × 630 px (ratio 1.91:1 — Open Graph estándar)
//   Instagram: 1080 × 1080 px (cuadrado — máximo alcance en feed)
//
// Paleta oficial Escala:
//   Fondo:   #0B1628
//   Acento:  #1D9E75
//   Texto:   #FFFFFF
//   Subtexto: #8FA3CC

import sharp from 'sharp'

const COLORES = {
  fondo: '#0B1628',
  acento: '#1D9E75',
  texto: '#FFFFFF',
  subtexto: '#8FA3CC',
  overlay: 'rgba(11,22,40,0.85)',
}

// Isotipo SVG de Escala (escalón + punto) — extraído de public/brand/isotipo.svg
const ISOTIPO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="0" y="60" width="30" height="40" fill="#1D9E75"/>
  <rect x="35" y="35" width="30" height="65" fill="#1D9E75"/>
  <rect x="70" y="10" width="30" height="90" fill="#1D9E75"/>
  <circle cx="85" cy="6" r="6" fill="#1D9E75"/>
</svg>`

function escaparXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function truncar(texto, maxLen) {
  if (!texto) return ''
  return texto.length > maxLen ? texto.substring(0, maxLen - 3) + '...' : texto
}

/**
 * Genera la tarjeta para Facebook (1200×630)
 */
function svgFacebook(titulo, subtitulo, ctaUrl) {
  const t = escaparXml(truncar(titulo, 60))
  const s = escaparXml(truncar(subtitulo, 100))
  const url = escaparXml(ctaUrl || 'escala.network')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <!-- Fondo -->
    <rect width="1200" height="630" fill="${COLORES.fondo}"/>

    <!-- Línea de acento izquierda -->
    <rect x="0" y="0" width="6" height="630" fill="${COLORES.acento}"/>

    <!-- Gradiente sutil -->
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0F2040;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0B1628;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#grad)"/>
    <rect x="0" y="0" width="6" height="630" fill="${COLORES.acento}"/>

    <!-- Isotipo -->
    <g transform="translate(60, 60) scale(0.7)">
      <rect x="0" y="60" width="30" height="40" fill="${COLORES.acento}"/>
      <rect x="35" y="35" width="30" height="65" fill="${COLORES.acento}"/>
      <rect x="70" y="10" width="30" height="90" fill="${COLORES.acento}"/>
      <circle cx="85" cy="6" r="6" fill="${COLORES.acento}"/>
    </g>

    <!-- Wordmark -->
    <text x="140" y="105" font-family="Inter, Arial, sans-serif" font-weight="900"
      font-size="36" fill="${COLORES.texto}" letter-spacing="-1">
      Esca<tspan fill="${COLORES.acento}">la</tspan>
    </text>

    <!-- Título principal -->
    <text x="60" y="280" font-family="Inter, Arial, sans-serif" font-weight="900"
      font-size="56" fill="${COLORES.texto}" letter-spacing="-2">
      ${t}
    </text>

    <!-- Subtítulo -->
    <text x="60" y="360" font-family="Inter, Arial, sans-serif" font-weight="400"
      font-size="32" fill="${COLORES.subtexto}">
      ${s}
    </text>

    <!-- Línea separadora -->
    <rect x="60" y="490" width="120" height="4" rx="2" fill="${COLORES.acento}"/>

    <!-- CTA URL -->
    <text x="60" y="560" font-family="Inter, Arial, sans-serif" font-weight="600"
      font-size="28" fill="${COLORES.acento}">
      ${url}
    </text>

    <!-- Patrón decorativo derecho -->
    <circle cx="1100" cy="150" r="200" fill="none" stroke="${COLORES.acento}" stroke-width="1" opacity="0.08"/>
    <circle cx="1100" cy="150" r="150" fill="none" stroke="${COLORES.acento}" stroke-width="1" opacity="0.06"/>
    <circle cx="1100" cy="150" r="100" fill="none" stroke="${COLORES.acento}" stroke-width="1" opacity="0.04"/>
  </svg>`
}

/**
 * Genera la tarjeta para Instagram (1080×1080)
 */
function svgInstagram(titulo, subtitulo, ctaUrl) {
  const t = escaparXml(truncar(titulo, 45))
  const s = escaparXml(truncar(subtitulo, 80))
  const url = escaparXml(ctaUrl || 'escala.network')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <!-- Fondo -->
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0F2040;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0B1628;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#grad2)"/>

    <!-- Borde de acento (4 lados = marco sutil) -->
    <rect x="0" y="0" width="1080" height="8" fill="${COLORES.acento}"/>
    <rect x="0" y="1072" width="1080" height="8" fill="${COLORES.acento}"/>
    <rect x="0" y="0" width="8" height="1080" fill="${COLORES.acento}"/>
    <rect x="1072" y="0" width="8" height="1080" fill="${COLORES.acento}"/>

    <!-- Isotipo centrado grande -->
    <g transform="translate(390, 140) scale(3)">
      <rect x="0" y="60" width="30" height="40" fill="${COLORES.acento}"/>
      <rect x="35" y="35" width="30" height="65" fill="${COLORES.acento}"/>
      <rect x="70" y="10" width="30" height="90" fill="${COLORES.acento}"/>
      <circle cx="85" cy="6" r="6" fill="${COLORES.acento}"/>
    </g>

    <!-- Wordmark centrado -->
    <text x="540" y="460" font-family="Inter, Arial, sans-serif" font-weight="900"
      font-size="72" fill="${COLORES.texto}" letter-spacing="-3" text-anchor="middle">
      Esca<tspan fill="${COLORES.acento}">la</tspan>
    </text>

    <!-- Línea separadora centrada -->
    <rect x="440" y="495" width="200" height="4" rx="2" fill="${COLORES.acento}"/>

    <!-- Título -->
    <text x="540" y="610" font-family="Inter, Arial, sans-serif" font-weight="900"
      font-size="60" fill="${COLORES.texto}" letter-spacing="-2" text-anchor="middle">
      ${t}
    </text>

    <!-- Subtítulo -->
    <text x="540" y="700" font-family="Inter, Arial, sans-serif" font-weight="400"
      font-size="36" fill="${COLORES.subtexto}" text-anchor="middle">
      ${s}
    </text>

    <!-- CTA -->
    <rect x="340" y="860" width="400" height="80" rx="12" fill="${COLORES.acento}"/>
    <text x="540" y="910" font-family="Inter, Arial, sans-serif" font-weight="700"
      font-size="32" fill="${COLORES.texto}" text-anchor="middle">
      ${url}
    </text>

    <!-- Patrón decorativo -->
    <circle cx="540" cy="540" r="480" fill="none" stroke="${COLORES.acento}" stroke-width="1" opacity="0.04"/>
    <circle cx="540" cy="540" r="430" fill="none" stroke="${COLORES.acento}" stroke-width="1" opacity="0.03"/>
  </svg>`
}

/**
 * Convierte un SVG string a PNG Buffer usando sharp.
 */
async function svgAPng(svgString) {
  return await sharp(Buffer.from(svgString)).png().toBuffer()
}

/**
 * Sube un PNG Buffer a Supabase Storage y retorna la URL pública.
 * @param {Buffer} buffer - PNG buffer
 * @param {string} nombre - nombre del archivo sin extensión
 * @returns {string} URL pública HTTPS
 */
async function subirImagen(buffer, nombre) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )

  const path = `redes-sociales/${nombre}-${Date.now()}.png`
  const { error } = await supabase.storage
    .from('escala-public')
    .upload(path, buffer, { contentType: 'image/png', upsert: false })

  if (error) throw new Error(`Error subiendo imagen a Supabase: ${error.message}`)

  const { data } = supabase.storage.from('escala-public').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Genera y sube las tarjetas para Facebook e Instagram.
 * @returns {{ urlFacebook: string, urlInstagram: string }}
 */
export async function generarTarjetas(titulo, subtitulo, ctaUrl, nombreArchivo) {
  const [pngFb, pngIg] = await Promise.all([
    svgAPng(svgFacebook(titulo, subtitulo, ctaUrl)),
    svgAPng(svgInstagram(titulo, subtitulo, ctaUrl)),
  ])

  const [urlFacebook, urlInstagram] = await Promise.all([
    subirImagen(pngFb, `fb-${nombreArchivo}`),
    subirImagen(pngIg, `ig-${nombreArchivo}`),
  ])

  return { urlFacebook, urlInstagram }
}
