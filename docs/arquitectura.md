# Arquitectura de Escala

> Documento vivo. Última actualización: 2026-07-22 · commit `68a6f82`

## Qué es Escala

Infraestructura financiera para negocios que el crédito formal rechaza. No presta dinero: conecta a quien necesita capital con quien lo tiene, **custodia el dinero en el medio** y cobra desde el excedente real del negocio, no con cuota fija.

Escala es **intermediario tecnológico**, nunca parte, garante ni empleador. Esa posición legal condiciona decisiones técnicas: por eso todo pago pasa por custodia con doble confirmación y el ledger es inmutable y auditable.

---

## Stack

| Capa | Tecnología | Nota |
| --- | --- | --- |
| Framework | Next.js 16.2.9 (App Router + Turbopack) | Mayoría de páginas son Client Components |
| Base de datos | Supabase (PostgreSQL 17 + RLS) | Proyecto `avrjgcitrgziiweirzfe` |
| Auth | Supabase Auth | `perfiles.id` = `auth.uid()` |
| Hosting | Vercel | Deploy automático desde `main` |
| Email | Resend | Dominio `mail.escala.network` |
| Storage | Supabase Storage | Bucket `evidencias` |

**Home estático:** `app/page.tsx` redirige a `/index.html` (HTML plano en `public/`). El resto de la app es Next.

---

## Tamaño del sistema

| Métrica | Valor |
| --- | --- |
| Páginas | 116 |
| Rutas API | 70 |
| Librerías (`lib/`) | 16 |
| Componentes reutilizables | **2** ⚠️ |
| Líneas en `app/` | ~38.700 |
| Tablas en producción | 42 |

---

## Mapa de módulos

### 1. Identidad y acceso
`registro` · `bienvenida` · `onboarding` · `perfil/[id]` · `recuperar` · `restablecer`

Siete roles, con **ids internos que nunca se renombran** y labels que sí:

| id interno (BD) | Label visible |
| --- | --- |
| `ideador` | Fundador |
| `capitalista` / `angel` | Inversionista |
| `especialista` | Especialista |
| `ejecutor` | Gerente de Proyecto |
| `mentor` | Mentor |
| `empresa` | Empresa |

### 2. Proyectos y escenarios
`proyectos` · `proyectos/[id]` · `proyectos/[id]/workspace/*`

Tres escenarios, cada uno con su flujo:

| Escenario | id interno | Flujo |
| --- | --- | --- |
| Crear o crecer empresa | `startup` | Formulario genérico + roles |
| Necesito un local | `local_comercial` | Wizard de 6 pasos |
| Necesito maquinaria | `maquinaria` | Contrato de leasing |

El **workspace** es el centro operativo: 12 sub-pantallas (tareas, chat, capital, presupuesto, reparto, equipos, leasing, local, constitución, documentos, cierre) con tabs que se adaptan por escenario y por rol.

### 3. Motor financiero
`lib/financiero/ledger.js` · `lib/financiero/custodia.js` · `api/pagos` · `api/wallet` · `api/reparto`

**El corazón del sistema.** Reglas no negociables:

- Los saldos **nunca se almacenan**: se calculan sumando `ledger_entries`.
- El ledger es **inmutable**: sin DELETE ni UPDATE.
- Toda operación financiera exige `idempotency_key`.
- Contabilidad de **doble partida**: cada movimiento genera débito y crédito.

**Custodia (dos tramos):** el dinero nunca va directo entre las partes.

```
pagador → escala:custodia → receptor
```

Cinco estados con confirmación en ambos extremos:
```
pendiente_pago → pago_reportado → en_custodia → pago_emitido → completado
```

El "recibido" del receptor **solo ocurre en el último paso**. Reportar no es pagar.

Cuentas del ledger: `perfil:{id}` · `proyecto:{id}` · `wallet:{id}` · `angel:{id}` · `local:{id}` · `operador:{id}` · `escala:custodia` · `escala:comisiones` · `pagos_externos`

### 4. Programa 10 Máquinas
`programa/aplicar` · `admin/programa` · `admin/programa/operacion` · `mi-equipo` · `mi-cartera` · `api/programa/*` · `lib/programa/scoring.js`

Piloto de leasing de equipos. Scoring de crédito propio (distinto del `escala_score`, que mide reputación en plataforma, no capacidad de pago).

### 5. Notificaciones
`lib/notificaciones/eventos.js` (742 líneas) · `notificar.js` · `plantillasEmail.js`

Catálogo de eventos con canales (email, in_app, push), prioridad y plantilla. Se invoca `notificar(evento, destinatario, datos)`.

### 6. Marketing y SEO
~40 landings estáticas: `startup-*` (por ciudad/país), `financiar-*`, `equipos-*`, `blog/*`.

### 7. Administración
`admin-escala` · `admin/finanzas` · `admin/programa` · `qa` · `desarrollo`

`/desarrollo` es el **roadmap por capas** (10 capas permanentes). `/qa` es la suite de pruebas manuales y automáticas.

---

## Patrones establecidos

### Acceso a datos

| Contexto | Cliente | RLS |
| --- | --- | --- |
| Navegador | `lib/supabase.js` (clave publishable) | **Sí aplica** |
| API routes | `lib/supabase-admin.js` (service role) | **Se ignora** |

```js
// En una ruta API — nunca crear el cliente a mano
import { supabaseAdmin } from '@/lib/supabase-admin'
```

**Autorización de admin:** `lib/auth.js` con `esAdmin(userId)`, que lee
`perfiles.es_admin`. Nunca comparar contra un UUID escrito a mano.

⚠️ La variable de service role se llama **`SUPABASE_SECRET_KEY`**, no `SUPABASE_SERVICE_ROLE_KEY`.

### Convenciones de nombres en BD

Errores reales que ya costaron bugs — verificar siempre contra el esquema:

| Correcto | Incorrecto (causó bugs) |
| --- | --- |
| `referencia_tipo` | ~~`tipo_referencia`~~ |
| `numero_contrato` | ~~`numero`~~ |
| `capital_total` | ~~`capital_original`~~ |
| `fecha_mes` | ~~`mes`~~ |
| `tasa_usd` (NOT NULL) | omitirla |
| `tipo` ∈ {`debito`,`credito`} | ~~`comision`~~ |

### Ids internos vs. labels

**Nunca renombrar un id interno sin migración.** Patrón correcto:

```js
{ id: 'capitalista', label: 'Inversionista' }  // render: {r.label || r.id}
```

Precedente: migrar el escenario `otro` → `maquinaria` requirió patrón expand-migrate-contract (código acepta ambos → SQL migra datos → se quita el fallback).

### Manejo de errores

Toda escritura debe verificar la respuesta antes de actualizar la UI. El anti-patrón que causó falsos positivos graves:

```js
// MAL — la UI dice "aceptada" aunque el backend falle
await fetch('/api/x', { method: 'PATCH', ... })
setEstado('aceptada')

// BIEN
const d = await (await fetch(...)).json()
if (d.error) { alert(...); return }
setEstado('aceptada')
```

---

## Flujo de deploy

```
código → build local verificado → commit → push a main → Vercel auto-deploy
```

**Regla:** nunca encadenar `build && commit && push`. Verificar el build **primero**, commitear después. (Se rompió una vez por esto: commit `550dc3e`.)

Las migraciones SQL van en `sql/` con nombre `AAAA-MM-DD_descripcion.sql` y, cuando es posible, se aplican vía el conector de Supabase para que queden registradas en `supabase_migrations.schema_migrations`.
