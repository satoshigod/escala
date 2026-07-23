# Escalabilidad

> Documento vivo. Última actualización: 2026-07-22
> Fase 8 del encargo de CTO. Todo lo afirmado está medido contra el sistema real.

## Dónde está Escala hoy

| Métrica | Valor real |
| --- | --- |
| Usuarios | 9 |
| Proyectos | 1 |
| Tablas | 45 |
| Rutas API | 70 |
| Páginas | 116 |

**Ningún problema de rendimiento es visible hoy.** Este documento no es para optimizar ahora: es para saber **qué se rompe primero** y a qué volumen, de modo que se arregle justo antes de que duela y no dos años antes.

---

## El principio

Escalar no es hacer todo más rápido: es identificar **el primer cuello de botella** y moverlo. Optimizar lo que no es el cuello es trabajo perdido.

En este sistema, el orden en que se rompen las cosas es:

```
consultas sin índice → RLS con subconsultas → falta de caché
→ pooling de conexiones → rail de pagos manual → aislamiento multi-tenant
```

---

## Etapa 1 · Hasta ~500 proyectos

**Se rompe primero:** las consultas sin índice.

✅ **Ya resuelto (22-jul).** `proyectos`, `perfiles` y `tareas` **solo tenían su primary key**. Las políticas RLS filtran por `fundador_id`, `estado` y `proyecto_id`, y **RLS se evalúa en cada consulta** — sin índice, cada lectura escaneaba la tabla completa.

Se agregaron 16 índices en las 8 tablas de mayor tráfico. Con 1 proyecto no cambiaba nada; con 10.000 era la diferencia entre 20ms y varios segundos.

**Lo que falta en esta etapa:** nada crítico. La arquitectura actual aguanta.

---

## Etapa 2 · ~500 a 5.000 proyectos

**Se rompe primero:** las 236 consultas sin `.limit()`.

Un listado que devuelve todo funciona con 50 filas y tumba la página con 50.000. El riesgo real no es la base — es el payload que viaja al navegador.

**Qué hacer:**
- Paginación en los listados (`directorio`, `proyectos`, `directorio-inversion`).
- Reemplazar los 23 `select('*')` por las columnas que de verdad se usan.
- Límite por defecto en todas las rutas de listado.

**Señal para actuar:** cualquier listado que tarde más de 1 segundo.

---

## Etapa 3 · ~5.000 a 50.000 proyectos

**Se rompe primero:** RLS con subconsultas y la ausencia de caché.

La política de `tareas` hace un `EXISTS` sobre `proyectos` **y** otro sobre `postulaciones` con JOIN. Eso se evalúa por fila, en cada consulta. Con volumen alto es el cuello.

**Qué hacer:**
- Reescribir las políticas pesadas usando funciones `STABLE` con caché de sesión, o desnormalizar la pertenencia al proyecto en una tabla `miembros_proyecto` con índice compuesto.
- Migrar las páginas de lectura pura a Server Components con `revalidate` (hoy 54 de 116 son Client Components que golpean la base en cada visita).
- Caché de las landings y del blog: son estáticas y no deberían tocar la base nunca.

---

## Etapa 4 · ~50.000 a 500.000 usuarios

**Se rompe primero:** el pooling de conexiones y el rail manual de pagos.

Supabase tiene límite de conexiones concurrentes. Con 70 rutas API creando consultas sin pooling explícito, un pico de tráfico las agota.

**Qué hacer:**
- Activar **Supabase Connection Pooler** (PgBouncer) y apuntar las rutas de servidor ahí.
- Automatizar el rail de pagos: hoy los dos tramos de custodia los confirma un admin a mano. A este volumen es imposible — y es el único punto del sistema que **no escala con código**, sino con integración de pasarela.
- Considerar réplicas de lectura para los listados públicos.

---

## Etapa 5 · 1 millón de usuarios

**Se rompe primero:** el aislamiento entre tenants y el tamaño del ledger.

**Qué hacer:**
- **Particionar `ledger_entries` por fecha.** Es la tabla que más crece y nunca se borra (es inmutable por diseño). Particionar por mes mantiene los índices manejables.
- Archivar movimientos antiguos a almacenamiento frío, conservando los saldos calculados.
- Evaluar separación por región: hoy el modelo contempla 9 países en una sola base.
- Rate limiting real por usuario y por IP (hoy no existe).

---

## Lo que NO hay que hacer todavía

Decisiones que parecen "preparar para escalar" pero hoy solo agregan complejidad:

| Tentación | Por qué esperar |
| --- | --- |
| Microservicios | Con 70 rutas y un solo equipo, el monolito es más rápido de mover |
| Base de datos separada por país | El modelo regulatorio ya está en tablas; separar antes de tener volumen por país es prematuro |
| Redis / caché externo | El caché de Next resuelve el 90% del problema sin infraestructura nueva |
| Kubernetes | Vercel escala solo; migrar es costo sin beneficio a este tamaño |
| Reescribir en TypeScript estricto | Aporta a partir de varios desarrolladores; hoy no es el cuello |

---

## Lo que sí está bien resuelto desde el principio

Vale la pena reconocerlo, porque son decisiones que **habrían sido carísimas de corregir después**:

- **Ledger inmutable con doble partida.** La contabilidad no se puede corromper por un bug de aplicación.
- **Saldos calculados, nunca almacenados.** No hay estado que se desincronice.
- **Idempotencia en toda operación financiera.** Un reintento no duplica dinero.
- **Custodia en dos tramos.** El dinero nunca pasa directo entre las partes.
- **RLS en las 45 tablas.** El aislamiento es a nivel de base, no de aplicación.

Esas cinco decisiones son las que hacen que el sistema pueda crecer sin reescribirse.

---

## Resumen para decidir

| Etapa | Umbral | Qué se rompe | Estado |
| --- | --- | --- | --- |
| 1 | 500 proyectos | Consultas sin índice | ✅ Resuelto |
| 2 | 5.000 proyectos | Listados sin límite | Pendiente (C0.8) |
| 3 | 50.000 proyectos | RLS pesada, sin caché | Pendiente (C0.7) |
| 4 | 500.000 usuarios | Pooling, rail manual | Pendiente (D7) |
| 5 | 1M usuarios | Tamaño del ledger, tenancy | No planificado |

**Recomendación:** no invertir en las etapas 3+ hasta tener tracción real. El riesgo hoy no es que la plataforma no escale — es que no haya usuarios que la hagan escalar.
