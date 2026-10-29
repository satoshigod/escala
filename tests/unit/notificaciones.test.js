// tests/unit/notificaciones.test.js
//
// Integridad del catálogo de notificaciones. Corre con el runner nativo de Node:
//   node --test tests/unit/
//
// Por qué existe: 44 eventos quedaron dentro de COLOR_POR_PRIORIDAD en vez de EVENTOS
// (el objeto se cerraba antes de tiempo). notificar() no los encontraba y salía en
// silencio: los avisos de fondeos, pagos, custodia y del programa 10 Máquinas nunca
// se enviaron, y nadie se enteró.

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { EVENTOS, COLOR_POR_PRIORIDAD } = require('../../lib/notificaciones/eventos.js')
const { plantillaPara } = require('../../lib/notificaciones/plantillasEmail.js')

const RAIZ = path.join(__dirname, '..', '..')

// Datos de prueba que responden a cualquier campo que pida un mensaje
const DATOS = new Proxy({}, { get: () => 'x' })

function archivosFuente(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === 'node_modules' || e.name.startsWith('.') ? [] : archivosFuente(p)
    return /\.(js|jsx|ts|tsx)$/.test(e.name) ? [p] : []
  })
}

test('COLOR_POR_PRIORIDAD solo contiene colores', () => {
  for (const [clave, valor] of Object.entries(COLOR_POR_PRIORIDAD)) {
    assert.equal(typeof valor, 'string', `"${clave}" no es un color: ¿quedó un evento fuera de EVENTOS?`)
    assert.match(valor, /^#[0-9A-Fa-f]{6}$/)
  }
})

test('cada evento del catálogo está bien formado y su mensaje se puede armar', () => {
  for (const [tipo, e] of Object.entries(EVENTOS)) {
    assert.ok(e.modulo, `${tipo}: falta modulo`)
    assert.ok(Array.isArray(e.canales) && e.canales.length, `${tipo}: faltan canales`)
    assert.equal(typeof e.titulo, 'string', `${tipo}: falta titulo`)
    assert.equal(typeof e.mensaje, 'function', `${tipo}: mensaje debe ser una función`)
    assert.equal(typeof e.mensaje(DATOS), 'string', `${tipo}: mensaje no devuelve texto`)
  }
})

test('todo notificar() / avisarAdmin() del código usa un evento registrado', () => {
  const llamada = /(?:notificar|avisarAdmin)\(\s*['"]([a-z0-9_]+)['"]/g
  const faltan = []
  for (const dir of ['app', 'lib', 'components']) {
    for (const archivo of archivosFuente(path.join(RAIZ, dir))) {
      const fuente = fs.readFileSync(archivo, 'utf8')
      for (const m of fuente.matchAll(llamada)) {
        if (!EVENTOS[m[1]]) faltan.push(`${path.relative(RAIZ, archivo)} → ${m[1]}`)
      }
    }
  }
  assert.deepEqual(faltan, [], 'Eventos sin registrar en EVENTOS:\n' + faltan.join('\n'))
})

test('los avisos al admin con canal email siempre tienen correo', () => {
  for (const [tipo, e] of Object.entries(EVENTOS)) {
    if (e.categoria !== 'admin' || !e.canales.includes('email')) continue
    const correo = plantillaPara(tipo, DATOS, e)
    assert.ok(correo?.subject && correo?.html, `${tipo}: no genera correo`)
  }
})

test('la plantilla genérica de admin escapa el HTML de los datos', () => {
  const correo = plantillaPara('admin_usuario_nuevo', { nombre: '<script>x</script>', usuario_id: '1' }, EVENTOS.admin_usuario_nuevo)
  assert.ok(!correo.html.includes('<script>'))
  assert.ok(correo.html.includes('&lt;script&gt;'))
})

test('un evento de usuario sin plantilla propia no genera correo genérico', () => {
  assert.equal(plantillaPara('tarea_vencida', DATOS, EVENTOS.tarea_vencida), null)
})
