// tests/smoke/paginas-criticas.spec.js
//
// Abre cada pagina critica en un navegador real y verifica que NO crashee en runtime.
// "Crashear" aqui significa cualquiera de estas tres cosas, que son exactamente los
// modos de fallo del 28-jul:
//   1. Un error de JavaScript sin capturar (pageerror) — ej. el ReferenceError que
//      dejo el workspace en "This page couldn't load".
//   2. Un error grave en la consola — ej. una variable inexistente al renderizar.
//   3. El texto de error de Next.js visible en pantalla ("Application error",
//      "This page couldn't load") o un cuerpo vacio.
//
// Si cualquiera ocurre, la prueba falla, el check del CI se pone rojo y (con
// proteccion de rama) bloquea el deploy: nada roto llega a produccion.
//
// Estas paginas usan la sesion guardada por auth.setup.js (paginas privadas).

const { test, expect } = require('@playwright/test')
const path = require('path')

// Reutilizar la sesion del usuario de prueba en todas las pruebas de este archivo.
test.use({ storageState: path.join(__dirname, '.auth', 'user.json') })

// ID del proyecto ESCALA (dato estable, es el proyecto real de Ivan). Se usa para
// probar el workspace, que fue justo lo que se rompio. Se puede sobreescribir con
// SMOKE_PROYECTO_ID por si cambia.
const PROYECTO_ID = process.env.SMOKE_PROYECTO_ID || 'f31699bd-96b2-4a78-ac6a-08e7a0ad3fbf'

// Las paginas criticas: el nucleo de la app donde vive el producto. NO landings de
// marketing (esas van en publicas.spec.js, sin login).
const PAGINAS = [
  { nombre: 'Dashboard', url: '/dashboard' },
  { nombre: 'Proyectos', url: '/proyectos' },
  { nombre: 'Workspace (resumen)', url: `/proyectos/${PROYECTO_ID}/workspace` },
  { nombre: 'Workspace · tareas', url: `/proyectos/${PROYECTO_ID}/workspace/tareas` },
  { nombre: 'Workspace · presupuesto', url: `/proyectos/${PROYECTO_ID}/workspace/presupuesto` },
  { nombre: 'Workspace · economia', url: `/proyectos/${PROYECTO_ID}/workspace/reparto` },
  { nombre: 'Workspace · equipo', url: `/proyectos/${PROYECTO_ID}/workspace/constitucion` },
  { nombre: 'Wallet', url: '/wallet' },
  { nombre: 'Wallet · movimientos', url: '/wallet/movimientos' },
  { nombre: 'Angel / Inversionista', url: '/angel' },
  { nombre: 'Mis contratos', url: '/mis-contratos' },
  { nombre: 'Postulaciones', url: '/postulaciones' },
  { nombre: 'Directorio de inversion', url: '/directorio-inversion' },
  { nombre: 'Score / Reputacion', url: '/score' },
  { nombre: 'Admin Escala', url: '/admin-escala' },
]

// Frases que Next.js muestra cuando una pagina crashea en runtime.
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

    // Capturar errores de JS sin manejar (los mas graves — el bug de hoy era esto).
    page.on('pageerror', (err) => erroresPagina.push(err.message))

    // Capturar errores de consola (nivel error), ignorando ruido conocido de
    // extensiones del navegador y recursos externos que no son culpa de la app.
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const txt = msg.text()
      const esRuido =
        /MetaMask|ethereum|evmAsk|TronLink|inpage\.js|contentscript|injected\.js|polkadot|ObjectMultiplex|MaxListenersExceededWarning/i.test(txt) ||
        /Failed to load resource.*favicon/i.test(txt)
      if (!esRuido) erroresConsola.push(txt)
    })

    // Ir a la pagina. 'domcontentloaded' + una breve espera deja correr el JS de
    // React que es donde aparecen los ReferenceError de runtime.
    const resp = await page.goto(p.url, { waitUntil: 'domcontentloaded' })

    // El servidor no debe responder 5xx.
    if (resp) {
      expect(resp.status(), `${p.nombre} respondio ${resp.status()}`).toBeLessThan(500)
    }

    // Dar tiempo a que React renderice y ejecute efectos (carga de datos).
    await page.waitForTimeout(3500)

    // 1) Ningun error de JS sin capturar.
    expect(erroresPagina, `${p.nombre} lanzo errores de runtime: ${erroresPagina.join(' | ')}`).toHaveLength(0)

    // 2) Ningun error grave de consola.
    expect(erroresConsola, `${p.nombre} tuvo errores de consola: ${erroresConsola.join(' | ')}`).toHaveLength(0)

    // 3) El texto de error de Next.js no debe aparecer en pantalla.
    const cuerpo = (await page.textContent('body')) || ''
    for (const frase of TEXTOS_DE_ERROR) {
      expect(cuerpo, `${p.nombre} muestra "${frase}" en pantalla`).not.toContain(frase)
    }

    // 4) La pagina no debe estar vacia (un crash a veces deja el body sin contenido).
    expect(cuerpo.trim().length, `${p.nombre} rindio una pagina vacia`).toBeGreaterThan(50)
  })
}
