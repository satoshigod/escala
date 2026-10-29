// lib/whatsapp.js
//
// Enlaces de WhatsApp (wa.me) para contactar usuarios a mano mientras no hay API de
// WhatsApp Business (C10). 16 de los primeros 20 usuarios dejaron WhatsApp y solo 4
// confirmaron el correo: hoy es el canal que de verdad llega.

// Indicativo por país del perfil (los 7 países del modelo)
const INDICATIVO = {
  Colombia: '57',
  'México': '52', Mexico: '52',
  Chile: '56',
  Argentina: '54',
  'Perú': '51', Peru: '51',
  'España': '34', Espana: '34',
  'Estados Unidos': '1',
}

/**
 * Número en formato internacional solo dígitos (ej. 573001234567), o null.
 * Si el número viene local (sin indicativo) le antepone el del país del perfil;
 * si no hay país, asume Colombia.
 */
export function numeroInternacional(numero, pais) {
  let d = String(numero || '').replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.length < 7) return null
  const cc = INDICATIVO[pais] || '57'
  if (d.length > 10 && Object.values(INDICATIVO).some(c => d.startsWith(c))) return d // ya trae indicativo
  if (d.startsWith('0')) d = d.replace(/^0+/, '') // prefijo de larga distancia local
  // Argentina: los celulares en WhatsApp van con 9 después del 54
  if (cc === '54' && !d.startsWith('9')) d = '9' + d
  return cc + d
}

/** https://wa.me/<número>?text=<mensaje> — o null si el número no sirve. */
export function enlaceWhatsApp(numero, pais, mensaje) {
  const n = numeroInternacional(numero, pais)
  if (!n) return null
  return 'https://wa.me/' + n + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '')
}
