// tests/smoke/publicas.spec.js
//
// Paginas publicas: no requieren sesion. Aqui va el home, el registro y algunas
// landings de mayor trafico (la puerta de entrada del negocio). Mismo criterio de
// fallo que las privadas: sin errores de runtime, sin errores de consola, sin
// pantalla de error de Next.js.
//
// Estas NO usan sesion guardada (por eso estan separadas de paginas-criticas).

const { test, expect } = require('@playwright/test')

const PAGINAS = [
  { nombre: 'Home', url: '/' },
  { nombre: 'Registro / Login', url: '/registro?modo=login' },
  { nombre: 'Que es Escala', url: '/que-es-escala' },
  { nombre: 'Landing 10 Maquinas · confeccion', url: '/maquinaria-confeccion-medellin' },
  { nombre: 'Landing 10 Maquinas · belleza', url: '/equipos-salon-belleza-medellin' },
  { nombre: 'Landing 10 Maquinas · comida', url: '/equipos-negocio-comida-medellin' },
  { nombre: 'Directorio publico de inversion', url: '/directorio-inversion' },
]

const TEXTOS_DE_ERROR = [
  "This page couldn't load",
  'Application error',
  'client-side exception',
  'Internal Server Error',
]

for (const p of PAGINAS) {
  test(`${p.nombre} carga sin errores`, async ({ page }) => {
    const erroresConsola = []
    const erroresPagina = []

    page.on('pageerror', (err) => erroresPagina.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const txt = msg.text()
      const esRuido =
        /MetaMask|ethereum|evmAsk|TronLink|inpage\.js|contentscript|injected\.js|polkadot|ObjectMultiplex|MaxListenersExceededWarning/i.test(txt) ||
        /Failed to load resource.*favicon/i.test(txt)
      if (!esRuido) erroresConsola.push(txt)
    })

    const resp = await page.goto(p.url, { waitUntil: 'domcontentloaded' })
    if (resp) {
      expect(resp.status(), `${p.nombre} respondio ${resp.status()}`).toBeLessThan(500)
    }

    await page.waitForTimeout(2500)

    expect(erroresPagina, `${p.nombre} lanzo errores de runtime: ${erroresPagina.join(' | ')}`).toHaveLength(0)
    expect(erroresConsola, `${p.nombre} tuvo errores de consola: ${erroresConsola.join(' | ')}`).toHaveLength(0)

    const cuerpo = (await page.textContent('body')) || ''
    for (const frase of TEXTOS_DE_ERROR) {
      expect(cuerpo, `${p.nombre} muestra "${frase}"`).not.toContain(frase)
    }
    expect(cuerpo.trim().length, `${p.nombre} rindio una pagina vacia`).toBeGreaterThan(50)
  })
}
