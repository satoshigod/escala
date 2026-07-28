// tests/smoke/apis.spec.js
//
// Golpea las APIs criticas y verifica que respondan sin error de servidor. Esto es
// lo que habria atrapado el 500 de /api/aportes del 28-jul (un join ambiguo que solo
// fallaba al ejecutarse contra la base real — el build nunca lo vio).
//
// Criterio: la API no debe responder 5xx. Un 200 es lo esperado; un 400/401/404 en
// algunos casos es aceptable (falta de permiso o de parametro), pero un 500 significa
// que el endpoint esta roto por dentro.

const { test, expect } = require('@playwright/test')
const path = require('path')

test.use({ storageState: path.join(__dirname, '.auth', 'user.json') })

const PROYECTO_ID = process.env.SMOKE_PROYECTO_ID || 'f31699bd-96b2-4a78-ac6a-08e7a0ad3fbf'

// Endpoints GET criticos con sus parametros. Se prueba que ninguno de 5xx.
const APIS = [
  { nombre: 'aportes', url: `/api/aportes?proyecto_id=${PROYECTO_ID}` },
  { nombre: 'hitos', url: `/api/hitos?proyecto_id=${PROYECTO_ID}` },
  { nombre: 'presupuesto', url: `/api/presupuesto?proyecto_id=${PROYECTO_ID}` },
  { nombre: 'deuda', url: `/api/deuda?proyecto_id=${PROYECTO_ID}` },
  { nombre: 'especialidades', url: '/api/especialidades?aprobado=true' },
  { nombre: 'inversiones/oportunidades', url: '/api/inversiones/oportunidades' },
  { nombre: 'local-comercial/financiar', url: '/api/local-comercial/financiar' },
]

for (const api of APIS) {
  test(`API ${api.nombre} responde sin error de servidor`, async ({ request }) => {
    const resp = await request.get(api.url)
    expect(
      resp.status(),
      `/api/${api.nombre} respondio ${resp.status()} (esperado < 500)`
    ).toBeLessThan(500)
  })
}
