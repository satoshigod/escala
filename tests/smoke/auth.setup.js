// tests/smoke/auth.setup.js
//
// Inicia sesion UNA vez con el usuario de prueba y guarda el estado de sesion
// (cookies + storage) en un archivo, para que las demas pruebas lo reutilicen sin
// volver a hacer login. Esto es lo que permite probar paginas privadas como el
// workspace o el dashboard — que sin sesion solo muestran "Acceso restringido" y
// por eso una prueba sin login NO habria atrapado el bug del 28-jul.
//
// Requiere dos variables de entorno (en el CI son "secretos" de GitHub):
//   SMOKE_USER_EMAIL     — correo del usuario de prueba dedicado
//   SMOKE_USER_PASSWORD  — su contraseña
//
// NUNCA se escriben en el codigo. Si faltan, el setup falla con un mensaje claro.

const { test: setup, expect } = require('@playwright/test')
const path = require('path')

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')

setup('autenticar usuario de prueba', async ({ page }) => {
  const email = process.env.SMOKE_USER_EMAIL
  const password = process.env.SMOKE_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Faltan credenciales del usuario de prueba. Define SMOKE_USER_EMAIL y ' +
      'SMOKE_USER_PASSWORD (en el CI, como secretos del repositorio).'
    )
  }

  // Ir directo al formulario en modo login.
  await page.goto('/registro?modo=login')

  // Llenar email y contraseña por su tipo de campo (son unicos en el form de login).
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)

  // Clic en el boton de iniciar sesion.
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  // Un login exitoso redirige a /dashboard o a /onboarding. Esperar cualquiera de
  // los dos, con un margen generoso por la latencia de auth.
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20000 })

  // Confirmar que de verdad hay sesion: el dashboard no debe rebotar a login.
  // (Si el usuario aun no completo onboarding, lo llevamos al dashboard.)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  // Guardar el estado de sesion para reutilizarlo en las demas pruebas.
  await page.context().storageState({ path: AUTH_FILE })
})
