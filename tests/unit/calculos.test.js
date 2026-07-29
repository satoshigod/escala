// tests/unit/calculos.test.js
//
// Tests unitarios de la logica financiera pura (C0.6). Corren con el runner nativo
// de Node, sin dependencias ni base de datos:
//   node --test tests/unit/
//
// Verifican las formulas criticas: saldo del ledger, doble partida, conversion USD,
// comision, waterfall del local comercial y transiciones de custodia. Son la red que
// permite refactorizar el motor financiero (C0.10) sabiendo que el comportamiento no
// cambio.

const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  calcularSaldo,
  montoEnUsd,
  construirDoblePartida,
  calcularComision,
  calcularWaterfall,
  transicionValida,
} = require('../../lib/financiero/calculos.js')

// ===========================================================================
// SALDO DE WALLET
// ===========================================================================
test('saldo: creditos menos debitos', () => {
  const creditos = [{ monto: '100', monto_usd: '25' }, { monto: '50', monto_usd: '12.5' }]
  const debitos = [{ monto: '30', monto_usd: '7.5' }]
  const s = calcularSaldo(creditos, debitos)
  assert.equal(s.disponible, 120)
  assert.equal(s.disponible_usd, 30)
})

test('saldo: wallet vacio es cero', () => {
  const s = calcularSaldo([], [])
  assert.equal(s.disponible, 0)
  assert.equal(s.disponible_usd, 0)
})

test('saldo: maneja arrays nulos sin romper', () => {
  const s = calcularSaldo(null, null)
  assert.equal(s.disponible, 0)
})

test('saldo: puede quedar negativo si hay mas debitos', () => {
  const s = calcularSaldo([{ monto: '10', monto_usd: '2' }], [{ monto: '30', monto_usd: '6' }])
  assert.equal(s.disponible, -20)
})

// ===========================================================================
// CONVERSION USD
// ===========================================================================
test('usd: monto por tasa', () => {
  assert.equal(montoEnUsd(1000, 0.25), 250)
  assert.equal(montoEnUsd('4000', '0.25'), 1000)
})

test('usd: tasa 1 (moneda base) no cambia el monto', () => {
  assert.equal(montoEnUsd(500, 1), 500)
})

// ===========================================================================
// DOBLE PARTIDA
// ===========================================================================
test('doble partida: genera exactamente 2 entradas', () => {
  const entradas = construirDoblePartida({
    cuenta_origen: 'wallet:a', cuenta_destino: 'wallet:b', monto: 100,
    moneda: 'COP', tasa: 0.00025, referencia_tipo: 'pago', referencia_id: 'ref1',
    descripcion: 'test', idempotency_key: 'key1',
  })
  assert.equal(entradas.length, 2)
})

test('doble partida: un debito y un credito', () => {
  const [e1, e2] = construirDoblePartida({
    cuenta_origen: 'wallet:a', cuenta_destino: 'wallet:b', monto: 100,
    moneda: 'COP', tasa: 1, referencia_tipo: 'pago', referencia_id: 'r',
    descripcion: 'd', idempotency_key: 'k',
  })
  assert.equal(e1.tipo, 'debito')
  assert.equal(e2.tipo, 'credito')
})

test('doble partida: ambas entradas mismo monto y referencia', () => {
  const [e1, e2] = construirDoblePartida({
    cuenta_origen: 'x', cuenta_destino: 'y', monto: 777,
    moneda: 'COP', tasa: 1, referencia_tipo: 'fondeo', referencia_id: 'r9',
    descripcion: 'd', idempotency_key: 'k',
  })
  assert.equal(e1.monto, e2.monto)
  assert.equal(e1.monto, 777)
  assert.equal(e1.referencia_id, e2.referencia_id)
  assert.equal(e1.referencia_tipo, 'fondeo')
})

test('doble partida: idempotency_key con sufijos _db y _cr', () => {
  const [e1, e2] = construirDoblePartida({
    cuenta_origen: 'x', cuenta_destino: 'y', monto: 1,
    moneda: 'COP', tasa: 1, referencia_tipo: 'pago', referencia_id: 'r',
    descripcion: 'd', idempotency_key: 'ABC',
  })
  assert.equal(e1.idempotency_key, 'ABC_db')
  assert.equal(e2.idempotency_key, 'ABC_cr')
})

test('doble partida: usa el nombre de columna real referencia_tipo (no tipo_referencia)', () => {
  const [e1] = construirDoblePartida({
    cuenta_origen: 'x', cuenta_destino: 'y', monto: 1,
    moneda: 'COP', tasa: 1, referencia_tipo: 'comision', referencia_id: 'r',
    descripcion: 'd', idempotency_key: 'k',
  })
  assert.ok('referencia_tipo' in e1)
  assert.ok(!('tipo_referencia' in e1))
})

test('doble partida: calcula monto_usd en ambas entradas', () => {
  const [e1, e2] = construirDoblePartida({
    cuenta_origen: 'x', cuenta_destino: 'y', monto: 4000,
    moneda: 'COP', tasa: 0.00025, referencia_tipo: 'pago', referencia_id: 'r',
    descripcion: 'd', idempotency_key: 'k',
  })
  assert.equal(e1.monto_usd, 1)
  assert.equal(e2.monto_usd, 1)
})

// ===========================================================================
// COMISION
// ===========================================================================
test('comision: 3% por defecto', () => {
  assert.equal(calcularComision(100000), 3000)
})

test('comision: porcentaje personalizado', () => {
  assert.equal(calcularComision(100000, 5), 5000)
})

test('comision: redondea', () => {
  assert.equal(calcularComision(3333, 3), 100) // 99.99 -> 100
})

// ===========================================================================
// WATERFALL DEL LOCAL COMERCIAL
// ===========================================================================
test('waterfall: dia normal paga intereses y abona capital', () => {
  // saldo 10M, tasa 3%/mes -> diaria 0.001; interes = 10000. Excedente 500k.
  const r = calcularWaterfall({
    ventas_total: 800000, costo_producto_dia: 200000, fijo_dia: 100000,
    capital_total: 10000000, capital_pagado: 0, fase_actual: 'repago', tasa_mensual: 3.0,
  })
  assert.equal(r.excedente, 500000)
  assert.equal(r.intereses_dia, 10000)              // 10M * 0.001
  assert.equal(r.abono_capital, 490000)             // 500k - 10k
  assert.equal(r.pago_inversionista, 500000)        // interes + abono
  assert.equal(r.deficit_dia, 0)
})

test('waterfall: excedente no cubre ni los intereses', () => {
  // saldo 10M, interes diario 10000, pero excedente solo 5000.
  const r = calcularWaterfall({
    ventas_total: 305000, costo_producto_dia: 200000, fijo_dia: 100000,
    capital_total: 10000000, capital_pagado: 0, fase_actual: 'repago', tasa_mensual: 3.0,
  })
  assert.equal(r.excedente, 5000)
  assert.equal(r.intereses_dia, 5000)      // paga lo que puede
  assert.equal(r.abono_capital, 0)
  assert.equal(r.pago_inversionista, 5000)
})

test('waterfall: excedente negativo acumula deficit, no paga', () => {
  const r = calcularWaterfall({
    ventas_total: 100000, costo_producto_dia: 200000, fijo_dia: 100000,
    capital_total: 10000000, capital_pagado: 0, fase_actual: 'repago',
  })
  assert.equal(r.excedente, -200000)
  assert.equal(r.pago_inversionista, 0)
  assert.equal(r.deficit_dia, 200000)
})

test('waterfall: abono no se pasa del saldo pendiente', () => {
  // saldo pendiente pequeno (5000), excedente grande.
  const r = calcularWaterfall({
    ventas_total: 1000000, costo_producto_dia: 0, fijo_dia: 0,
    capital_total: 10000000, capital_pagado: 9995000, fase_actual: 'repago', tasa_mensual: 3.0,
  })
  // saldo pendiente = 5000; interes = round(5000*0.001)=5; abono = min(1000000-5, 5000)=5000
  assert.equal(r.saldo_pendiente_antes, 5000)
  assert.equal(r.abono_capital, 5000)
  assert.equal(r.saldo_pendiente_despues, 0)
})

test('waterfall: al terminar el capital, transiciona a regalia', () => {
  const r = calcularWaterfall({
    ventas_total: 1000000, costo_producto_dia: 0, fijo_dia: 0,
    capital_total: 10000000, capital_pagado: 9995000, fase_actual: 'repago', tasa_mensual: 3.0,
  })
  assert.equal(r.saldo_pendiente_despues, 0)
  assert.equal(r.nueva_fase, 'regalia')
})

test('waterfall: fase regalia paga % de ventas brutas, no del excedente', () => {
  const r = calcularWaterfall({
    ventas_total: 1000000, costo_producto_dia: 200000, fijo_dia: 100000,
    capital_total: 10000000, capital_pagado: 10000000, fase_actual: 'regalia', pct_regalia: 3.0,
  })
  assert.equal(r.pago_inversionista, 30000) // 3% de 1M, NO del excedente
  assert.equal(r.abono_capital, 0)
})

test('waterfall: en repago no transiciona si aun queda saldo', () => {
  const r = calcularWaterfall({
    ventas_total: 800000, costo_producto_dia: 200000, fijo_dia: 100000,
    capital_total: 10000000, capital_pagado: 0, fase_actual: 'repago',
  })
  assert.equal(r.nueva_fase, 'repago')
})

// ===========================================================================
// MAQUINA DE ESTADOS DE CUSTODIA
// ===========================================================================
test('custodia: flujo feliz completo es valido paso a paso', () => {
  assert.ok(transicionValida('pendiente_pago', 'pago_reportado'))
  assert.ok(transicionValida('pago_reportado', 'en_custodia'))
  assert.ok(transicionValida('en_custodia', 'pago_emitido'))
  assert.ok(transicionValida('pago_emitido', 'completado'))
})

test('custodia: no se puede saltar de pendiente directo a completado', () => {
  assert.equal(transicionValida('pendiente_pago', 'completado'), false)
})

test('custodia: reportar NO es recibir (no salta a completado)', () => {
  assert.equal(transicionValida('pago_reportado', 'completado'), false)
})

test('custodia: se puede cancelar antes de emitir el pago', () => {
  assert.ok(transicionValida('pendiente_pago', 'cancelado'))
  assert.ok(transicionValida('pago_reportado', 'cancelado'))
  assert.ok(transicionValida('en_custodia', 'cancelado'))
})

test('custodia: NO se puede cancelar despues de emitir el pago', () => {
  assert.equal(transicionValida('pago_emitido', 'cancelado'), false)
})

test('custodia: un estado terminal no transiciona a nada', () => {
  assert.equal(transicionValida('completado', 'pendiente_pago'), false)
  assert.equal(transicionValida('cancelado', 'pendiente_pago'), false)
})

test('custodia: estado desconocido no permite transicion', () => {
  assert.equal(transicionValida('inventado', 'completado'), false)
})
