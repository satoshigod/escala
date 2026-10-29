// tests/unit/activacion.test.js
//
// Piezas puras de la activación de usuarios (oct-2026): roles reales desde los chips del
// formulario, enlaces de WhatsApp y detección de proyectos que buscan inversión.
//   node --test tests/unit/

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { rolesPorCrear, ROL_DESDE_CHIP } = require('../../lib/rolesProyecto.js')
const { numeroInternacional, enlaceWhatsApp } = require('../../lib/whatsapp.js')
const { buscaInversion, rolLabel, formatoCapital } = require('../../lib/roles.js')
const { EVENTOS } = require('../../lib/notificaciones/eventos.js')
const { plantillaPara } = require('../../lib/notificaciones/plantillasEmail.js')

// --- roles desde chips ---

test('cada chip crea su rol abierto con valores válidos para la tabla roles', () => {
  const TIPOS = ['capital', 'servicio', 'tiempo', 'activo', 'conocimiento']
  const MODALIDADES = ['equity', 'deuda_diferida', 'success_fee', 'hibrido', 'regalias', 'bonos_hitos', 'nueva_unidad', 'convertible']
  for (const [chip, spec] of Object.entries(ROL_DESDE_CHIP)) {
    assert.ok(TIPOS.includes(spec.tipo_aporte), `${chip}: tipo_aporte inválido`)
    assert.ok(MODALIDADES.includes(spec.modalidad), `${chip}: modalidad inválida`)
    assert.ok(spec.nombre && spec.descripcion, `${chip}: falta nombre o descripción`)
  }
})

test('proyecto nuevo con chips Inversionista y Cofundador → 2 roles; el de capital lleva el monto', () => {
  const roles = rolesPorCrear(['Capitalista', 'Cofundador'], [], 20000000)
  assert.deepEqual(roles.map(r => r.nombre), ['Inversionista inicial', 'Co-fundador'])
  assert.equal(roles[0].tipo_aporte, 'capital')
  assert.equal(roles[0].valor_mercado, 20000000)
  assert.equal(roles[0].es_prioritario, true)
  assert.equal(roles[1].valor_mercado, 0)
})

test('no duplica roles que ya existen (por nombre, o cualquier rol de capital)', () => {
  const existentes = [{ nombre: 'Inversionista inicial', tipo_aporte: 'capital' }, { nombre: 'contador', tipo_aporte: 'servicio' }]
  assert.deepEqual(rolesPorCrear(['Capitalista', 'Contador', 'Abogado'], existentes, 0).map(r => r.nombre), ['Abogado'])
  // un rol de capital con otro nombre también cuenta
  assert.deepEqual(rolesPorCrear(['Capitalista'], [{ nombre: 'Socio capitalista', tipo_aporte: 'capital' }], 0), [])
})

test('"Otro", chips repetidos o desconocidos no crean roles', () => {
  assert.deepEqual(rolesPorCrear(['Otro', 'Inventado'], [], 0), [])
  assert.equal(rolesPorCrear(['Abogado', 'Abogado'], [], 0).length, 1)
  assert.deepEqual(rolesPorCrear(null, null, null), [])
})

// --- WhatsApp ---

test('número colombiano local → indicativo 57', () => {
  assert.equal(numeroInternacional('300 123 4567', 'Colombia'), '573001234567')
  assert.equal(numeroInternacional('3001234567', null), '573001234567')
})

test('número que ya trae indicativo no se toca', () => {
  assert.equal(numeroInternacional('+57 300 123 4567', 'Colombia'), '573001234567')
  assert.equal(numeroInternacional('+1 305 123 4567', 'Colombia'), '13051234567')
})

test('indicativo por país del perfil; Argentina lleva 9 para celulares', () => {
  assert.equal(numeroInternacional('987654321', 'Perú'), '51987654321')
  assert.equal(numeroInternacional('912345678', 'Chile'), '56912345678')
  assert.equal(numeroInternacional('5512345678', 'México'), '525512345678')
  assert.equal(numeroInternacional('11 2345 6789', 'Argentina'), '5491123456789')
})

test('enlace wa.me con mensaje codificado; números inválidos → null', () => {
  assert.equal(enlaceWhatsApp('3001234567', 'Colombia', 'Hola Ana, ¿cómo vas?'), 'https://wa.me/573001234567?text=' + encodeURIComponent('Hola Ana, ¿cómo vas?'))
  assert.equal(enlaceWhatsApp('', 'Colombia', 'x'), null)
  assert.equal(enlaceWhatsApp('123', 'Colombia', 'x'), null)
})

// --- inversión y labels ---

test('buscaInversion detecta el chip Inversionista (id Capitalista)', () => {
  assert.equal(buscaInversion({ roles_buscados: ['Capitalista', 'Cofundador'] }), true)
  assert.equal(buscaInversion({ roles_buscados: ['Contador'] }), false)
  assert.equal(buscaInversion({}), false)
})

test('labels visibles de roles y formato de capital por país', () => {
  assert.equal(rolLabel('capitalista'), 'Inversionista')
  assert.equal(rolLabel('ideador'), 'Fundador')
  assert.equal(rolLabel(null), null)
  assert.equal(formatoCapital(20000000, 'Colombia'), '$ 20.000.000 COP')
  assert.equal(formatoCapital(0, 'Colombia'), null)
})

// --- correos de reactivación ---

test('los avisos de reactivación existen y tienen correo propio (no genérico)', () => {
  const datos = { nombre: 'Ana Pérez', cantidad: 2, ejemplos: 'A, B', proyecto_nombre: 'Tienda', proyecto_id: '1', fundador_nombre: 'Ana', postulante_nombre: 'Luis', rol_nombre: 'Contador', dias: 4, dias_inactivo: 20, lugar: 'Cali, Colombia', monto: '$ 1 COP' }
  for (const tipo of ['activacion_sin_proyecto', 'activacion_inversionista', 'proyecto_sin_roles', 'postulacion_sin_respuesta', 'inversion_proyecto_nuevo', 'proyecto_sin_actividad']) {
    assert.ok(EVENTOS[tipo], `${tipo}: no está en EVENTOS`)
    assert.ok(EVENTOS[tipo].canales.includes('in_app'), `${tipo}: el cron deduplica con el registro in-app`)
    const correo = plantillaPara(tipo, datos, EVENTOS[tipo])
    assert.ok(correo?.subject && correo?.html, `${tipo}: sin correo`)
    assert.ok(!correo.subject.includes('&amp;'), `${tipo}: el asunto es texto plano`)
  }
})

test('los correos de reactivación escapan el HTML de los nombres', () => {
  const correo = plantillaPara('proyecto_sin_roles', { nombre: 'Ana', proyecto_nombre: '<b>x</b>', proyecto_id: '1' }, EVENTOS.proyecto_sin_roles)
  assert.ok(!correo.html.includes('<b>x</b>'))
})
