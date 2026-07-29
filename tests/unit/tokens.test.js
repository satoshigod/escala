// tests/unit/tokens.test.js
//
// Tests de los design tokens (C0.9). Verifican que la fuente unica de verdad de
// colores este bien formada y que el helper tono() construya los rgba correctos.

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { TONO, COLOR, tono } = require('../../lib/tokens.js')

test('tokens: los tonos de marca tienen hex y rgb', () => {
  for (const nombre of Object.keys(TONO)) {
    assert.match(TONO[nombre].hex, /^#[0-9A-Fa-f]{6}$/, `${nombre} debe tener hex valido`)
    assert.match(TONO[nombre].rgb, /^\d{1,3},\d{1,3},\d{1,3}$/, `${nombre} debe tener rgb valido`)
  }
})

test('tokens: el verde de marca es el correcto', () => {
  assert.equal(TONO.verde.hex, '#1D9E75')
  assert.equal(TONO.verde.rgb, '29,158,117')
})

test('tono(): alpha 1 devuelve el hex', () => {
  assert.equal(tono('verde'), '#1D9E75')
  assert.equal(tono('verde', 1), '#1D9E75')
})

test('tono(): alpha < 1 devuelve rgba', () => {
  assert.equal(tono('verde', 0.08), 'rgba(29,158,117,0.08)')
  assert.equal(tono('naranja', 0.2), 'rgba(232,160,32,0.2)')
})

test('tono(): nombre desconocido cae en neutro (no rompe)', () => {
  assert.equal(tono('inventado'), TONO.neutro.hex)
})

test('tokens: el texto secundario es el color mas usado del sistema', () => {
  assert.equal(COLOR.textoSecundario, '#8FA3CC')
})

test('tokens: colores semanticos definidos', () => {
  assert.ok(COLOR.textoPrimario)
  assert.ok(COLOR.fondoProfundo)
  assert.ok(COLOR.borde)
  assert.ok(COLOR.fuente)
})
