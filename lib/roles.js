// lib/roles.js
//
// Labels visibles de los roles. Los ids internos (ideador, capitalista, angel, ejecutor...)
// nunca se renombran; en pantalla siempre va el label. Ver ESCALA_MASTER_CONTEXT.md §5.

export const ROL_LABEL = {
  ideador: 'Fundador',
  capitalista: 'Inversionista',
  angel: 'Inversionista',
  especialista: 'Especialista',
  ejecutor: 'Gerente de Proyecto',
  mentor: 'Mentor',
  empresa: 'Empresa',
}

/** Label visible de un rol; si no se conoce, devuelve el valor tal cual (o null). */
export function rolLabel(id) {
  if (!id) return null
  return ROL_LABEL[id] || ROL_LABEL[String(id).toLowerCase()] || id
}

/** ¿El proyecto pide inversionista? (chip "Inversionista" = id 'Capitalista' en roles_buscados) */
export function buscaInversion(proyecto) {
  return (proyecto?.roles_buscados || []).some(r => /capital|inversi/i.test(r))
}

// Moneda por país del proyecto (los 7 países del modelo)
export const MONEDA_PAIS = {
  Colombia: 'COP',
  'México': 'MXN',
  Mexico: 'MXN',
  Chile: 'CLP',
  Argentina: 'ARS',
  'Perú': 'PEN',
  Peru: 'PEN',
  'España': 'EUR',
  Espana: 'EUR',
  'Estados Unidos': 'USD',
}

/** "$ 25.000.000 COP" — o null si no hay monto. */
export function formatoCapital(monto, pais) {
  const n = Number(monto)
  if (!n || n <= 0) return null
  return '$ ' + n.toLocaleString('es-CO') + ' ' + (MONEDA_PAIS[pais] || '')
}
