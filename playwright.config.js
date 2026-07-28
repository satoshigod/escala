// playwright.config.js
//
// Configuracion de las pruebas de humo (smoke tests) de Escala.
//
// Que son: pruebas que abren las paginas criticas en un navegador real (headless,
// sin ventana) y verifican que NO crasheen ni tengan errores de consola. No prueban
// que todo funcione perfecto — solo que lo esencial no esta roto. Existen por la
// leccion L16: el build compila codigo que igual falla en runtime (como el
// ReferenceError que tumbo el workspace el 28-jul), y esos errores solo aparecen
// cuando el navegador ejecuta la pagina.
//
// Contra que corre: por defecto contra produccion (https://escala.network), definido
// en SMOKE_BASE_URL. En el CI corre despues de cada deploy; si algo esta roto, el
// check falla y (con proteccion de rama activada) bloquea el deploy.
//
// Como se corre a mano (desde tu Mac, en la raiz del repo):
//   npx playwright test
// La primera vez, instalar el navegador:  npx playwright install chromium

const { defineConfig, devices } = require('@playwright/test')

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://escala.network'

module.exports = defineConfig({
  testDir: './tests/smoke',
  // Un fallo es un fallo: no reintentar enmascara flakiness real.
  retries: process.env.CI ? 1 : 0,
  // Tiempo maximo por prueba. Las paginas con datos reales pueden tardar.
  timeout: 45000,
  expect: { timeout: 10000 },
  // Reporte legible en consola + un resumen que el CI puede leer.
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: BASE_URL,
    // Headless: sin ventana visible. Asi corre en el CI.
    headless: true,
    // Guarda rastro y captura solo cuando algo falla, para poder diagnosticar.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Un viewport de escritorio normal.
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: false,
  },
  projects: [
    // 1) Primero: hacer login y guardar la sesion.
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    // 2) Luego: las pruebas, que dependen de la sesion del setup.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
})
