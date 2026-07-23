# Deuda técnica

> Documento vivo. Última actualización: 2026-07-22 · commit `68a6f82`
> Todo lo listado está **medido**, no estimado.

## Resumen

| # | Deuda | Evidencia | Impacto | Esfuerzo |
| --- | --- | --- | --- | --- |
| ~~D1~~ | ~~Cliente Supabase duplicado~~ | ✅ **RESUELTO** — `lib/supabase-admin.js`, 67 rutas migradas | — | — |
| ~~D2~~ | ~~ID de admin hardcodeado~~ | ✅ **RESUELTO** — `lib/auth.js` + `perfiles.es_admin` | — | — |
| D3 | Casi sin componentes reutilizables | **2** para 116 páginas | Alto | Alto |
| D4 | Archivos monolíticos | 4 archivos >1.300 líneas | Medio | Alto |
| D5 | ~~Sin CI~~ / sin tests unitarios | ✅ CI activo · tests unitarios pendientes | Medio | Medio |
| D6 | Estilos inline en todo el código | ~todas las páginas | Medio | Alto |
| D7 | Rail de pagos manual | Custodia requiere admin | Alto (a escala) | Alto |
| D8 | Sin caché ni RSC | Todo Client Component | Medio | Medio |

---

## D1 · Cliente Supabase duplicado

**67 de 70 rutas API** repiten este bloque:

```js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)
```

**Por qué importa:** cambiar el patrón de conexión (pooling, logging, reintentos) exige tocar 67 archivos. Ya pasó algo parecido con los inserts al ledger: el mismo error se repitió en 6 archivos porque cada uno tenía su copia.

**Solución:** `lib/supabase-admin.js` que exporte el cliente ya configurado, y migrar las rutas gradualmente.

```js
// lib/supabase-admin.js
export const supabaseAdmin = createClient(url, secret)
```

---

## D2 · ID de admin hardcodeado

El UUID `a57b6849-…` aparece en **13 archivos**, normalmente así:

```js
const ADMIN_IDS = ['a57b6849-1388-4186-8880-2ec31dd31af5']
```

**Por qué importa:** es un problema de **seguridad y de negocio**, no de estética. Hoy solo Ivan puede administrar. Cuando entre la primera persona al equipo hay que tocar 13 archivos, y basta olvidar uno para que quede un hueco de permisos.

**Solución:** columna `perfiles.es_admin` (ya existe y se usa en el dashboard) + helper `esAdmin(userId)` en `lib/auth.js`. Migrar los 13 sitios.

---

## D3 · Casi sin componentes reutilizables

**2 componentes** (`NavApp`, `RedesSociales`) para **116 páginas**. Todo lo demás está copiado: tarjetas, badges, modales, estados vacíos, formularios.

**Por qué importa:** un cambio de diseño se propaga a mano. Ya se vio en la práctica: había **dos diseños distintos** de tarjeta de proyecto en el mismo dashboard, y un "···" que parecía menú pero era un link.

**Solución sugerida** (orden por frecuencia de uso):
1. `<Card>`, `<Pill>`, `<EmptyState>`, `<Modal>`
2. `<Field>`, `<Button>` con variantes
3. `<StatCard>`, `<ProgressBar>`

---

## D4 · Archivos monolíticos

| Archivo | Líneas |
| --- | --- |
| `app/qa/page.js` | 2.796 |
| `app/proyectos/[id]/workspace/page.js` | 2.211 |
| `app/proyectos/page.js` | 1.396 |
| `app/dashboard/page.js` | 1.322 |

**Por qué importa:** el workspace concentra 12 sub-pantallas y 11 handlers en un archivo. Editarlo es riesgoso y las ediciones puntuales son difíciles de verificar.

**Solución:** extraer cada tab a su componente. **No urgente** — funciona bien y el riesgo de refactorizar es mayor que el beneficio inmediato. Hacerlo cuando haya tests.

---

## D5 · Sin CI ni tests automáticos

No hay `.github/workflows` ni tests unitarios. Existe `/qa` (suite manual con algunos tests automáticos), que es mejor que nada pero **requiere que alguien la ejecute**.

**Por qué importa:** el 21 de julio se desplegó un build roto a producción (`550dc3e`) porque el commit se encadenó al build. Un CI lo habría bloqueado.

**Solución mínima viable** (alto valor, esfuerzo bajo):

```yaml
# .github/workflows/build.yml
name: build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
```

---

## D6 · Estilos inline

Prácticamente todas las páginas definen un objeto `const s = {...}` con estilos inline. No hay design tokens.

**Por qué importa:** los colores de marca (`#1D9E75`, `#080F20`, `#8FA3CC`) están repetidos cientos de veces. Cambiar la paleta es inviable.

**Solución:** extraer tokens a CSS variables o Tailwind. **Alto esfuerzo** — hacerlo junto con D3, no antes.

---

## D7 · Rail de pagos manual

La custodia funciona, pero los dos tramos del medio los confirma un admin a mano. Con 10 operaciones es manejable; con 100 no.

**Solución:** integrar pasarela local (Wompi/PSE/Bre-B). **Depende de terceros** — cuentas, contratos, posiblemente licencia. Está presupuestado en la ronda.

---

## D8 · Sin caché ni Server Components

Casi todo es `'use client'` con `useEffect` + `fetch`. No se aprovechan Server Components, streaming ni caché de Next 16.

**Por qué importa:** cada visita golpea la BD. Con tráfico bajo no se nota; a escala sí.

**Solución:** migrar primero las páginas de lectura pura (landings, directorio, blog) a RSC.

---

## Orden recomendado

**Semana 1 (quick wins):** ✅ **HECHOS** el 22-jul — D5 (CI), D2 (admin centralizado) y D1 (cliente unificado).

---

## Roadmap técnico (fase 9)

Vive en **`/desarrollo` → CAPA 0**, no en este archivo. Ahí compite por prioridad
con el roadmap de producto, que es como se decide en la realidad. Este documento
guarda el *por qué* y el *cómo*; el roadmap dice *qué* y *cuándo*.

| Cuándo | Qué | Por qué en ese orden |
| --- | --- | --- |
| ✅ Semana 1 | C0.1 CI · C0.2 admin · C0.3 cliente · C0.4 docs | Alto impacto, bajo esfuerzo, no rompen nada |
| Mes 1 | **C0.5 componentes base** | Es la deuda más grande que queda y desbloquea C0.9 |
| Mes 1–2 | **C0.6 tests del motor financiero** | Requisito para tocar el ledger o el workspace sin riesgo |
| Mes 3 | C0.7 Server Components · C0.8 consultas con límite | Rendimiento: no urgente hoy, crítico a escala |
| Mes 3+ | C0.9 design tokens | Junto con C0.5, nunca antes |
| Cuando haya tests | C0.10 romper monolitos | Depende de C0.6 |
| Cuando haya capital | D7 pasarela de pagos | Depende de terceros |

### Dependencias que importan

- **C0.10 depende de C0.6.** Refactorizar `workspace/page.js` (2.211 líneas, 12
  sub-pantallas, 11 handlers) sin tests es cambiar algo que funciona por algo que
  quizá funcione. No hacerlo antes.
- **C0.9 depende de C0.5.** Extraer tokens sin componentes que los consuman deja
  el trabajo a medias y hay que rehacerlo.
- **C0.7 y C0.8 son independientes** entre sí y del resto: se pueden hacer en
  paralelo o partirse por página.

### Cuándo dejar de aplazar el rendimiento

Hoy: 9 usuarios, 1 proyecto. Ninguna consulta duele. Las señales para priorizar
C0.7 y C0.8 por encima de features:

- Más de ~500 proyectos activos (las consultas sin límite empiezan a pesar).
- Más de ~2.000 usuarios (cada visita golpea la base sin caché).
- Tiempo de carga del dashboard por encima de 2 segundos.

Antes de eso, optimizar es trabajo que no compra nada.

**Mes 1:** D3 (componentes base), empezando por los 4 más repetidos.

**Trimestre:** D8 (RSC en páginas de lectura) y D6 (tokens) juntos con D3.

**Cuando haya tests:** D4 (romper monolitos).

**Cuando haya capital:** D7 (pasarela).
