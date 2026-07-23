# Mapa de navegación

> Documento vivo. Última actualización: 2026-07-22
> Fase 2 del encargo de CTO. **116 páginas** — 43 de marketing/SEO, 73 de aplicación.

## Cómo leer esto

El sistema tiene dos mitades con lógicas distintas:

- **Marketing (43 páginas):** estáticas, públicas, optimizadas para búsqueda. Su trabajo es traer gente.
- **Aplicación (73 páginas):** requieren sesión, tocan la base. Su trabajo es que la gente haga algo.

El punto de unión es `/registro`. Todo lo de marketing empuja ahí.

---

## Navegación principal (`components/NavApp.js`)

Solo 4 entradas visibles: **Proyectos · Invertir · Postulaciones · Mi Reputación**.

> ⚠️ Con 73 páginas de aplicación y 4 entradas de menú, la mayoría del producto **no es alcanzable navegando**. Se llega por enlace directo, por notificación o no se llega. Es un hallazgo de UX, no de arquitectura: ver "Huérfanas" abajo.

---

## 1 · Entrada y autenticación

```
/ (index.html estático)
 └─ /registro ──┬─ /bienvenida ─ /onboarding ─ /dashboard
                └─ /recuperar ─ /restablecer
```

| Ruta | Qué hace |
| --- | --- |
| `/` | Home estático (HTML plano, no Next) |
| `/registro` | Registro y login (mismo archivo, `?modo=login`) |
| `/bienvenida` · `/onboarding` | Selección de rol y perfil inicial |
| `/recuperar` · `/restablecer` | Recuperación de contraseña |

---

## 2 · Núcleo del usuario

```
/dashboard ──┬─ /proyectos ─ /proyectos/[id] ─ /proyectos/[id]/workspace/*
             ├─ /postulaciones
             ├─ /wallet ─ /wallet/{fondear,movimientos,pagos}
             ├─ /custodia
             ├─ /mi-equipo      (si tiene leasing)
             ├─ /mi-cartera     (si es inversionista)
             ├─ /perfil/[id] ─ /perfil/editar
             └─ /score · /metricas · /calendario
```

**El dashboard es adaptativo por rol:** lo que ve un fundador, un inversionista y un especialista es distinto.

---

## 3 · Workspace del proyecto (12 sub-pantallas)

El centro operativo. Los tabs se adaptan por escenario y por rol.

```
/proyectos/[id]/workspace
 ├─ tareas · chat · documentos          (todos los escenarios)
 ├─ presupuesto · capital · reparto     (financiero)
 ├─ local ─ local/inversionista         (escenario local_comercial)
 ├─ leasing · equipos                   (escenario maquinaria)
 ├─ constitucion                        (escenario startup)
 └─ cierre
```

| Escenario | Tabs que ve el fundador |
| --- | --- |
| `startup` | resumen · equipo · presupuesto · economía · tareas · chat · necesito+ |
| `local_comercial` | resumen · local · economía · chat · hitos · documentos · necesito+ |
| `maquinaria` | resumen · equipo · leasing · economía · tareas · chat |
| *(no fundador)* | tareas · resumen · aportes · economía · chat |

---

## 4 · Descubrimiento y conexión

```
/directorio            → especialistas
/directorio-inversion  → oportunidades (agrupadas por tipo)
/buscar                → proyectos
/invitar               → traer a alguien
```

Variantes SEO de búsqueda: `/buscar-cofundador`, `/buscar-cto`.

---

## 5 · Programa 10 Máquinas

```
Landing (3 variantes) → /programa/aplicar → [scoring]
                                              ↓
/admin/programa (bandeja) → /admin/programa/operacion
                                              ↓
                          /mi-equipo  ·  /mi-cartera
```

---

## 6 · Administración

| Ruta | Para qué |
| --- | --- |
| `/admin-escala` | Panel general |
| `/admin/finanzas` · `/admin/financiero` | Verificación de pagos |
| `/admin/local-comercial` | Aprobación de locales |
| `/admin/programa` · `/admin/programa/operacion` | Piloto de máquinas |
| `/desarrollo` | Roadmap por capas |
| `/qa` | Suite de pruebas |
| `/seo` | Control de indexación |

---

## 7 · Marketing y SEO (43 páginas)

| Familia | Ejemplos | Propósito |
| --- | --- | --- |
| Por ciudad/país | `startup-medellin`, `startup-mexico`, `startup-chile` | SEO local |
| Por necesidad | `necesito-capital`, `contratar-talento`, `conseguir-proyectos` | Las 8 tarjetas del home |
| Por producto | `financiar-maquinaria-colombia`, `equipos-salon-belleza-medellin` | Campañas |
| Por rol | `abogado-startups-colombia`, `contador-publico-colombia`, `desarrollador-startup-colombia` | Captación de especialistas |
| Educativas | `que-es-escala`, `como-crear-empresa-colombia`, `blog/*` | Contenido |

---

## Hallazgos

### Páginas huérfanas

No están en el menú ni enlazadas desde el dashboard. Solo se llega por URL directa:

`/aportes` · `/hitos` · `/ingresos` · `/calendario` · `/metricas` · `/mis-contratos` · `/carril` · `/comercial` · `/angel` · `/mi-equipo` · `/mi-cartera` · `/custodia`

**Las tres últimas eran las más graves:** `/mi-equipo`, `/mi-cartera` y `/custodia` se construyeron esta semana y son centrales para el piloto — si el usuario no llega, el piloto no corre. ✅ **Ya enlazadas desde el dashboard** (22-jul).

### Duplicación de rutas

| Ruta | Situación |
| --- | --- |
| `/admin` vs `/admin-escala` | Dos paneles de administración |
| `/admin/finanzas` vs `/admin/financiero` | Nombres casi idénticos |
| `/desarrollo-limpio` | Redirect a `/desarrollo` (ok, es intencional) |
| `/angel` vs `/directorio-inversion` vs `/mi-cartera` | Tres superficies para el inversionista |

### Nomenclatura mixta

Conviven español (`/proyectos`, `/desarrollo`) e inglés (`/angel-investor`, `/latinos-usa`). Las de inglés son landings SEO, así que tiene sentido — pero conviene documentarlo para que no se mezcle en la app.

---

## Recomendaciones

1. ✅ **HECHO (22-jul).** `/custodia`, `/mi-equipo`, `/mi-cartera` y `/admin/programa` ya se enlazan desde el dashboard según el rol.
2. **Unificar `/admin` con `/admin-escala`** y `/admin/finanzas` con `/admin/financiero`.
3. **Revisar las huérfanas restantes:** decidir si se enlazan o se archivan. Una página que nadie visita es deuda que se mantiene sin beneficio.
