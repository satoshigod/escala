// lib/programa/scoring.js
//
// Motor de scoring del Programa 10 Maquinas.
//
// Por que existe: el escala_score mide reputacion DENTRO de la plataforma
// (tareas cumplidas, calificaciones). No sirve para decidir sobre alguien que
// nunca ha usado Escala, que es exactamente el caso de una confeccionista que
// llega por un anuncio. Esto mide capacidad de pago con lo unico que se puede
// preguntar en un formulario de 3 pasos.
//
// Filosofia del modelo: en un piloto de 10 maquinas, el score NO decide solo.
// Ordena la cola y separa lo obvio (descartes duros y candidatas claras) del
// gris, que es donde un humano aporta. Errar hacia lo manual es barato con 10
// casos y caro con uno malo.

// ---------------------------------------------------------------------------
// DESCARTES DUROS — no pasan al score, se rechazan de inmediato.
// ---------------------------------------------------------------------------
export function descartesDuros(d) {
  const razones = []
  if (!d.produccion_semanal || d.produccion_semanal <= 0) {
    razones.push('sin_produccion')  // el modelo paga desde el excedente: sin produccion no hay de donde
  }
  if (d.ciudad && !/medell|envigad|itagu|bello|sabaneta|estrella|caldas|copacabana|girardota|barbosa/i.test(d.ciudad)) {
    razones.push('fuera_de_cobertura') // el piloto es Valle de Aburra: la verificacion es presencial
  }
  if (d.anios_oficio !== null && d.anios_oficio !== undefined && d.anios_oficio < 0.5) {
    razones.push('sin_oficio')      // menos de 6 meses en el oficio
  }
  return razones
}

// ---------------------------------------------------------------------------
// VARIABLES DEL SCORE (0-100)
//
// Cada una responde a: "¿que tan probable es que esta persona genere excedente
// suficiente y sostenido para pagar?" No se mide patrimonio ni historial
// bancario — justamente los que la excluyen del banco.
// ---------------------------------------------------------------------------
const VARIABLES = [
  {
    id: 'experiencia',
    peso: 25,
    etiqueta: 'Años en el oficio',
    // Quien lleva años confeccionando tiene clientes, ritmo y sabe costear.
    calcular: (d) => {
      const a = Number(d.anios_oficio) || 0
      if (a >= 8) return 1
      if (a >= 5) return 0.85
      if (a >= 3) return 0.7
      if (a >= 1) return 0.5
      return 0.25
    },
  },
  {
    id: 'produccion',
    peso: 25,
    etiqueta: 'Producción semanal actual',
    // Es la señal mas directa de capacidad: ya produce, la maquina amplifica.
    calcular: (d) => {
      const p = Number(d.produccion_semanal) || 0
      if (p >= 400) return 1
      if (p >= 250) return 0.85
      if (p >= 150) return 0.7
      if (p >= 60) return 0.5
      return 0.3
    },
  },
  {
    id: 'estabilidad_cliente',
    peso: 20,
    etiqueta: 'A quién le vende',
    // Un taller fijo o marca = flujo predecible. Venta suelta = flujo volatil.
    calcular: (d) => {
      const v = (d.a_quien_vende || '').toLowerCase()
      if (/marca|fabrica|empresa|contrato|fijo/.test(v)) return 1
      if (/taller|maquila|intermediar/.test(v)) return 0.8
      if (/tienda|boutique|mayorist/.test(v)) return 0.65
      if (/directo|cliente|redes|whatsapp|feria/.test(v)) return 0.45
      return 0.4
    },
  },
  {
    id: 'margen',
    peso: 20,
    etiqueta: 'Ingreso vs. valor del equipo',
    // Cuantos meses de ingreso cuesta la maquina. Mientras menos, mas holgado
    // el repago. Es el proxy de capacidad de pago del modelo de excedente.
    calcular: (d) => {
      const ing = Number(d.ingreso_mensual) || 0
      const val = Number(d.valor_estimado) || 0
      if (!ing || !val) return 0.4
      const meses = val / ing
      if (meses <= 2) return 1
      if (meses <= 4) return 0.85
      if (meses <= 6) return 0.7
      if (meses <= 10) return 0.45
      return 0.25
    },
  },
  {
    id: 'infraestructura',
    peso: 10,
    etiqueta: 'Ya tiene máquina propia',
    // Quien ya opero una maquina sabe mantenerla y el riesgo de mal uso baja.
    calcular: (d) => (d.tiene_maquina ? 1 : 0.5),
  },
]

// ---------------------------------------------------------------------------
// BANDAS
//
// Umbrales deliberadamente conservadores para el piloto: la banda alta es
// estrecha porque preaprobar de mas con capital ajeno es el error caro.
// ---------------------------------------------------------------------------
export const BANDAS = {
  alta:  { min: 75, label: 'Preaprobada',        color: '#1D9E75', accion: 'preaprobada' },
  media: { min: 50, label: 'Requiere revisión',  color: '#E8A020', accion: 'en_revision' },
  baja:  { min: 0,  label: 'No califica ahora',  color: '#8FA3CC', accion: 'rechazada' },
}

export function calcularScore(datos) {
  const duros = descartesDuros(datos)
  if (duros.length) {
    return {
      score: 0,
      banda: 'baja',
      accion: 'rechazada',
      descartes: duros,
      detalle: {},
      resumen: 'Descarte por requisitos del programa',
    }
  }

  const detalle = {}
  let total = 0
  for (const v of VARIABLES) {
    const factor = Math.max(0, Math.min(1, v.calcular(datos)))
    const puntos = Math.round(factor * v.peso)
    detalle[v.id] = { etiqueta: v.etiqueta, peso: v.peso, factor, puntos }
    total += puntos
  }

  const score = Math.round(total)
  const banda = score >= BANDAS.alta.min ? 'alta' : score >= BANDAS.media.min ? 'media' : 'baja'

  return {
    score,
    banda,
    accion: BANDAS[banda].accion,
    descartes: [],
    detalle,
    resumen: resumenLegible(detalle, score, banda),
  }
}

// Texto para el analista: que la llevo arriba y que la llevo abajo.
function resumenLegible(detalle, score, banda) {
  const items = Object.values(detalle)
  const fuertes = items.filter(i => i.factor >= 0.8).map(i => i.etiqueta)
  const debiles = items.filter(i => i.factor <= 0.5).map(i => i.etiqueta)
  const partes = [`Score ${score}/100 (banda ${banda})`]
  if (fuertes.length) partes.push(`A favor: ${fuertes.join(', ')}`)
  if (debiles.length) partes.push(`En contra: ${debiles.join(', ')}`)
  return partes.join(' · ')
}

// ---------------------------------------------------------------------------
// PLAN DE PAGO estimado, para mostrarle a la solicitante que le espera.
// ---------------------------------------------------------------------------
export function estimarPlan({ valor_equipo, ingreso_mensual, pct_excedente = 70 }) {
  const valor = Number(valor_equipo) || 0
  const ingreso = Number(ingreso_mensual) || 0
  // Excedente conservador: se asume que el 35% del ingreso queda libre
  const excedente = Math.round(ingreso * 0.35)
  const abono = Math.round(excedente * (pct_excedente / 100))
  const meses = abono > 0 ? Math.ceil(valor / abono) : null
  return {
    excedente_estimado: excedente,
    abono_mensual_estimado: abono,
    meses_estimados: meses,
    pct_excedente,
    // Se muestra como rango: un numero exacto da falsa precision
    rango_meses: meses ? `${Math.max(1, meses - 2)}–${meses + 3} meses` : null,
  }
}
