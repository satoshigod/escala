// lib/financiero/calculos.js
//
// Logica financiera PURA y testeable, sin dependencia de Supabase.
//
// Por que existe (C0.6): las funciones de ledger.js y custodia.js crean el cliente
// Supabase a nivel de modulo, asi que su logica no se puede probar en aislamiento.
// Este archivo extrae las FORMULAS criticas (waterfall, doble partida, saldo,
// transiciones de custodia) como funciones puras: reciben numeros, devuelven numeros,
// no tocan la base. Asi se pueden verificar con tests unitarios rapidos que corren en
// CI (ver tests/unit/calculos.test.js).
//
// IMPORTANTE: estas funciones deben reflejar EXACTAMENTE la logica que hoy vive en
// app/api/local-comercial/reporte-diario/route.js (waterfall) y en lib/financiero/
// (ledger y custodia). Son la especificacion ejecutable de esa logica. Si el ledger
// se refactoriza (C0.10), estos tests son la red que verifica que el comportamiento
// no cambio.

'use strict'

// ---------------------------------------------------------------------------
// SALDO DE WALLET (del ledger de doble partida)
// El saldo nunca se almacena: se calcula sumando el ledger. Un wallet recibe por
// creditos (cuenta_destino) y entrega por debitos (cuenta_origen).
// ---------------------------------------------------------------------------
function calcularSaldo(creditos, debitos) {
  const sum = (arr, campo) => (arr || []).reduce((s, e) => s + parseFloat(e[campo] || 0), 0)
  return {
    disponible: sum(creditos, 'monto') - sum(debitos, 'monto'),
    disponible_usd: sum(creditos, 'monto_usd') - sum(debitos, 'monto_usd'),
  }
}

// ---------------------------------------------------------------------------
// CONVERSION A USD
// Todo movimiento guarda su equivalente en USD a la tasa del dia.
// ---------------------------------------------------------------------------
function montoEnUsd(monto, tasa) {
  return parseFloat(monto) * parseFloat(tasa)
}

// ---------------------------------------------------------------------------
// DOBLE PARTIDA
// Todo movimiento genera EXACTAMENTE 2 entradas (un debito y un credito) con el
// mismo monto y misma referencia, y con idempotency_key sufijado _db / _cr.
// Devuelve las 2 entradas listas para insertar (sin tocar la base).
// ---------------------------------------------------------------------------
function construirDoblePartida({ cuenta_origen, cuenta_destino, monto, moneda, tasa, referencia_tipo, referencia_id, descripcion, idempotency_key, metadata = {} }) {
  const m = parseFloat(monto)
  const monto_usd = montoEnUsd(m, tasa)
  const base = {
    cuenta_origen,
    cuenta_destino,
    monto: m,
    moneda,
    monto_usd,
    tasa_usd: parseFloat(tasa),
    referencia_tipo,
    referencia_id,
    descripcion,
    metadata,
  }
  return [
    { ...base, tipo: 'debito', idempotency_key: `${idempotency_key}_db` },
    { ...base, tipo: 'credito', idempotency_key: `${idempotency_key}_cr` },
  ]
}

// ---------------------------------------------------------------------------
// COMISION DE ESCALA
// Escala cobra un porcentaje sobre cada pago del motor financiero.
// ---------------------------------------------------------------------------
function calcularComision(monto, pct = 3) {
  return Math.round(parseFloat(monto) * (parseFloat(pct) / 100))
}

// ---------------------------------------------------------------------------
// WATERFALL DEL LOCAL COMERCIAL (la logica financiera mas critica)
//
// Cada dia el negocio reporta ventas. Del excedente (ventas - costos - fijos) se paga
// al inversionista en cascada:
//   Fase 'repago':  primero los intereses del dia (saldo x tasa diaria), luego abona
//                   al capital con lo que sobre (sin pasarse del saldo pendiente).
//                   Si el excedente no cubre ni los intereses, paga lo que puede.
//   Fase 'regalia': ya se pago el capital; el inversionista recibe un % de las ventas
//                   brutas (regalia), no del excedente.
//   Excedente <= 0: no hay pago, se acumula deficit.
//
// Refleja app/api/local-comercial/reporte-diario/route.js. Numeros redondeados igual
// que en produccion (Math.round) para que el test valide el comportamiento real.
// ---------------------------------------------------------------------------
function calcularWaterfall({
  ventas_total,
  costo_producto_dia,
  fijo_dia,
  capital_total,
  capital_pagado = 0,
  fase_actual = 'repago',
  tasa_mensual = 3.0,
  pct_regalia = 3.0,
}) {
  const excedente = parseFloat(ventas_total) - parseFloat(costo_producto_dia) - parseFloat(fijo_dia)
  const capital_original = parseFloat(capital_total)
  const capital_ya_pagado = parseFloat(capital_pagado || 0)
  const saldo_pendiente = capital_original - capital_ya_pagado

  let intereses_dia = 0
  let abono_capital = 0
  let pago_inversionista = 0
  let deficit_dia = 0

  if (saldo_pendiente > 0 && excedente > 0 && fase_actual === 'repago') {
    const tasa_diaria = parseFloat(tasa_mensual) / 100 / 30
    intereses_dia = Math.round(saldo_pendiente * tasa_diaria)

    if (excedente >= intereses_dia) {
      abono_capital = Math.min(excedente - intereses_dia, saldo_pendiente)
      pago_inversionista = intereses_dia + abono_capital
    } else {
      // El excedente no alcanza ni para los intereses — paga lo que puede.
      intereses_dia = excedente
      abono_capital = 0
      pago_inversionista = excedente
    }
  } else if (fase_actual === 'regalia' && excedente > 0) {
    const pct = parseFloat(pct_regalia) / 100
    pago_inversionista = Math.round(parseFloat(ventas_total) * pct)
  } else if (excedente <= 0) {
    deficit_dia = Math.abs(excedente)
  }

  return {
    excedente: Math.round(excedente),
    intereses_dia,
    abono_capital,
    pago_inversionista,
    deficit_dia,
    saldo_pendiente_antes: saldo_pendiente,
    saldo_pendiente_despues: saldo_pendiente - abono_capital,
    // Senal de transicion: si se termino de pagar el capital, pasa a 'regalia'.
    nueva_fase: (fase_actual === 'repago' && (saldo_pendiente - abono_capital) <= 0) ? 'regalia' : fase_actual,
  }
}

// ---------------------------------------------------------------------------
// MAQUINA DE ESTADOS DE CUSTODIA
// El dinero nunca va directo entre partes. Pasa por la custodia de Escala en una
// secuencia estricta. reportar NO es pagar; el "recibido" solo ocurre al final.
// Esta funcion valida si una transicion de estado es legal.
// ---------------------------------------------------------------------------
const TRANSICIONES_CUSTODIA = {
  pendiente_pago: ['pago_reportado', 'cancelado'],
  pago_reportado: ['en_custodia', 'cancelado'],
  en_custodia: ['pago_emitido', 'cancelado'],
  pago_emitido: ['completado'],
  completado: [],
  cancelado: [],
}

function transicionValida(estadoActual, estadoNuevo) {
  const permitidos = TRANSICIONES_CUSTODIA[estadoActual]
  if (!permitidos) return false
  return permitidos.includes(estadoNuevo)
}

module.exports = {
  calcularSaldo,
  montoEnUsd,
  construirDoblePartida,
  calcularComision,
  calcularWaterfall,
  transicionValida,
  TRANSICIONES_CUSTODIA,
}
