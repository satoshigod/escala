# ESCALA — Contexto maestro

> **Léeme primero.** Este archivo existe para que cualquier herramienta de desarrollo
> (Claude Code, Cursor, Copilot, otra sesión de Claude) entienda el sistema sin
> empezar de cero ni repetir errores que ya se pagaron.
>
> Última actualización: 2026-07-23 · commit `e379ac1`
> Evidencia: 628 commits en 21 días activos, 45 tablas auditadas, 121 hitos.

---

## 1 · Qué es Escala

Infraestructura financiera para negocios que el crédito formal rechaza. **No presta dinero:** conecta a quien necesita capital con quien lo tiene, custodia el dinero en el medio, y cobra desde el excedente real del negocio en vez de con cuota fija.

**Posición legal:** intermediario tecnológico. Nunca parte, garante ni empleador. Esto condiciona decisiones técnicas — por eso todo pago pasa por custodia con doble confirmación y el ledger es inmutable.

**Mercado:** Colombia (Medellín primero), 7 países LatAm + España en el modelo.

---

## 2 · Stack y accesos

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16.2.9 (App Router + Turbopack) |
| Base de datos | Supabase PostgreSQL 17 + RLS · proyecto `avrjgcitrgziiweirzfe` |
| Auth | Supabase Auth — **`perfiles.id` ES `auth.uid()`** |
| Deploy | Vercel, automático desde `main` |
| Email | Resend · `mail.escala.network` |

**Variable crítica:** la service role key se llama **`SUPABASE_SECRET_KEY`**, no `SUPABASE_SERVICE_ROLE_KEY`.

**Home:** `app/page.tsx` redirige a `/index.html` (HTML plano en `public/`). El resto es Next.

---

## 3 · Reglas que no se rompen

1. **Los saldos nunca se almacenan.** Se calculan sumando `ledger_entries`.
2. **El ledger es inmutable.** Sin DELETE ni UPDATE.
3. **Toda operación financiera lleva `idempotency_key`.**
4. **Los ids internos no se renombran** sin migración expand-migrate-contract.
5. **Verificar el build antes de commitear.** Nunca `build && commit && push`.
6. **Una pantalla no está lista sin su ruta de entrada.**
7. **Nunca `.catch(() => {})` en operaciones de dinero.** Falla en silencio y nadie se entera.

---

## 4 · Convenciones que ya costaron bugs

Verificar contra el esquema real antes de escribir. Estos errores ya ocurrieron:

| Correcto | Incorrecto | Consecuencia real |
| --- | --- | --- |
| `referencia_tipo` | ~~`tipo_referencia`~~ | 10 inserts al ledger fallaban |
| `tasa_usd` (NOT NULL) | omitirla | mismos inserts fallaban |
| `tipo` ∈ {`debito`,`credito`} | ~~`comision`~~ | enum inválido |
| `metadata` (jsonb) | ~~`comision_escala`~~ como columna | columna inexistente |
| `numero_contrato` | ~~`numero`~~ | mostraba UUID |
| `capital_total` | ~~`capital_original`~~ | fase nunca avanzaba |
| `fecha_mes` | ~~`mes`~~ | consulta vacía |

**Los cuatro primeros juntos hicieron que ninguna comisión de Escala se registrara nunca**, y fallaban en silencio.

```sql
-- Antes de escribir un insert:
SELECT column_name, data_type, is_nullable FROM information_schema.columns
WHERE table_name = 'la_tabla' ORDER BY ordinal_position;

SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'la_tabla'::regclass;
```

---

## 5 · Patrones establecidos

### Clientes de base de datos

```js
// API routes (service role, IGNORA RLS)
import { supabaseAdmin } from '@/lib/supabase-admin'

// Navegador (clave publishable, RESPETA RLS)
import { supabase } from '@/lib/supabase'
```

Nunca crear un cliente a mano. Antes 67 rutas lo hacían y la mejora de una no llegaba a las demás.

### Autorización

```js
import { esAdmin, usuarioDesdeRequest, adminParaNotificar } from '@/lib/auth'
```

Lee `perfiles.es_admin`. **Nunca comparar contra un UUID escrito a mano** — estuvo en 13 archivos.

### Roles: id interno vs. label

```js
{ id: 'capitalista', label: 'Inversionista' }   // render: {r.label || r.id}
```

| id interno | Label visible |
| --- | --- |
| `ideador` | Fundador |
| `capitalista` / `angel` | Inversionista |
| `especialista` | Especialista |
| `ejecutor` | Gerente de Proyecto |
| `mentor` | Mentor |
| `empresa` | Empresa |

### Manejo de errores en escrituras

```js
// MAL — la UI confirma aunque el backend falle (causó falsos positivos
// en aceptación de postulaciones, que crean contratos)
await fetch('/api/x', { method: 'PATCH', ... })
setEstado('aceptada')

// BIEN
const d = await (await fetch(...)).json()
if (d.error) { alert('No se pudo: ' + d.error); return }
setEstado('aceptada')
```

---

## 6 · Módulos

| Módulo | Rutas clave |
| --- | --- |
| Identidad | `registro` · `bienvenida` · `onboarding` · `perfil/[id]` |
| Proyectos | `proyectos` · `proyectos/[id]/workspace/*` (12 sub-pantallas) |
| Motor financiero | `lib/financiero/ledger.js` · `custodia.js` · `api/pagos` · `api/wallet` |
| Programa 10 Máquinas | `programa/aplicar` · `admin/programa` · `mi-equipo` · `mi-cartera` |
| Notificaciones | `lib/notificaciones/eventos.js` |
| Marketing/SEO | ~43 landings estáticas |
| Admin | `admin-escala` · `admin/finanzas` · `desarrollo` · `qa` |

### Escenarios de proyecto

| Escenario | id interno | Flujo |
| --- | --- | --- |
| Crear o crecer empresa | `startup` | Formulario + roles |
| Necesito un local | `local_comercial` | Wizard 6 pasos, waterfall diario |
| Necesito maquinaria | `maquinaria` | Contrato de leasing |

---

## 7 · Motor de custodia (lo más delicado)

El dinero **nunca va directo entre las partes**:

```
pagador → escala:custodia → receptor
```

```
pendiente_pago → pago_reportado → en_custodia → pago_emitido → completado
```

**El "recibido" del receptor solo ocurre en el último paso.** Reportar no es pagar — confundirlos fue un bug real: el sistema notificaba "dinero recibido" cuando el comerciante *reportaba ventas*, sin que hubiera salido un peso.

Cinco flujos cableados: `local_repago`, `compra_maquina`, `arriendo`, `fondeo`, `reparto`.

Cuentas: `perfil:{id}` · `proyecto:{id}` · `wallet:{id}` · `angel:{id}` · `local:{id}` · `escala:custodia` · `escala:comisiones` · `pagos_externos`

---

## 8 · Dónde está cada cosa

| Necesitas | Está en |
| --- | --- |
| Arquitectura y patrones | `docs/arquitectura.md` |
| Esquema, constraints, RLS | `docs/base-datos.md` |
| Deuda técnica medida | `docs/deuda-tecnica.md` |
| Cuándo se rompe a escala | `docs/escalabilidad.md` |
| Mapa de las 116 páginas | `docs/navegacion.md` |
| Roadmap por capas | `/desarrollo` en la app (12 capas) |
| **Errores ya cometidos** | `/desarrollo` → pestaña **Lecciones** |
| Suite de pruebas | `/qa` en la app |
| Migraciones SQL | `sql/` |

---

## 9 · Estado actual

| | |
| --- | --- |
| Páginas | 116 (73 app + 43 marketing) |
| Rutas API | 70 |
| Tablas | 45, **todas con RLS** |
| Hitos completados | 121 de ~200 |
| Usuarios reales | 9 |
| Proyectos reales | 1 |

**No hay tracción todavía.** Optimizar rendimiento hoy es trabajo que no compra nada — ver `docs/escalabilidad.md` para los umbrales.

---

## 10 · Lo que falta

**Antes de lanzar la campaña (bloqueantes):**
- Habeas data en el formulario de solicitud — requisito legal, recoge cédula y celular.
- Revisión del contrato de leasing por abogado.
- Probar el flujo completo con una solicitud real.

**Deuda mayor (CAPA 0 en `/desarrollo`):**
- C0.5 componentes base — **2 componentes para 116 páginas**.
- C0.6 tests del motor financiero — requisito para tocar el ledger sin riesgo.
- C0.10 romper monolitos — **depende de C0.6**, no antes.

**Depende de terceros:**
- Pasarelas de pago (el rail de custodia hoy es manual).
- Facturación electrónica DIAN/SAT/SII.
- Concepto legal sobre intermediación financiera.

---

## 11 · Si vas a trabajar en este repo

1. Lee este archivo y `docs/README.md`.
2. Mira `/desarrollo` → **Lecciones** antes de escribir código. Son 10 errores reales con la regla que los evita.
3. **Verifica el esquema real** antes de tocar la base.
4. **Verifica el build antes de commitear.** Hay CI, pero no lo uses como red: revisa tú.
5. Cuando termines, responde: *qué construiste · cómo llega el usuario ahí · qué verificaste · qué NO verificaste · qué depende del humano*.

**El dato que resume por qué existe este archivo:** de 628 commits, 230 fueron correcciones de algo ya entregado. El 36%. La mayoría se pudo evitar leyendo lo que ya estaba documentado.
