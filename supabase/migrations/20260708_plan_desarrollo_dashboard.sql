-- ============================================================
-- ADDENDUM AL PLAN DE DESARROLLO
-- Migration: 20260708_plan_desarrollo_dashboard.sql
--
-- Agrega al plan los hallazgos de la auditoría del dashboard
-- y la propuesta concreta de reorganización (sin eliminar funcionalidades)
-- ============================================================

INSERT INTO plan_desarrollo (seccion, orden, titulo, contenido) VALUES

('pendiente', 14, 'Auditoría del dashboard — hallazgos clave',
'**Problema central:** El dashboard trata todos los módulos como si tuvieran la misma frecuencia de uso. Un contador de aportes totales (uso mensual) compite visualmente con la bandeja de trabajo (uso diario).

**5 problemas estructurales identificados:**

1. La bandeja de trabajo está oculta en la mitad izquierda de un grid de 3 elementos sin relación entre sí (bandeja + wallet + acciones rápidas). Es el módulo de mayor frecuencia de uso y tiene la peor posición.

2. Las tarjetas de proyecto tienen 4 botones visibles del mismo peso (Workspace, Publicar rol, Hitos, Aportes). Generan parálisis de análisis. El 95% de los clicks va a Workspace.

3. "Proyectos disponibles" está al fondo para todos los roles. Para un especialista es la sección más importante — tiene la peor posición.

4. El sidebar tiene 8 indicadores del mismo tamaño visual. Los que requieren acción hoy (mensajes sin leer, postulaciones pendientes) se ven igual que los informativos (aportes totales).

5. Con 4+ proyectos el dashboard empieza a colapsar el scroll sin mecanismo de compresión.

**Lo que funciona bien y NO se debe tocar:**
- Nav, bienvenida con nombre/especialidad/ciudad
- Switcher de vista por rol (Gerente, Ángel, Mentor, Empresa) — excelente decisión arquitectónica
- Banner de correo no verificado
- Indicador realtime (punto verde de conexión)
- Vistas especializadas (Gerente, Mentor, Empresa, Ángel) — bien construidas
- Sistema de notificaciones con toast'),

('pendiente', 15, 'Rediseño del dashboard — propuesta concreta (sin agregar funcionalidades)',
'**El eje central durante los próximos 5 años: la Bandeja de Trabajo.**
No "Mis proyectos". El dashboard de Escala es una herramienta de ejecución diaria.

**Orden ideal de bloques:**
1. Nav (sin cambios)
2. Banner correo no verificado (sin cambios)
3. Bienvenida + switcher de vista (sin cambios)
4. **Bandeja de trabajo — SOLA, ancho completo** (hoy está oculta en un grid)
5. Grid 2 columnas: columna principal (2/3) + sidebar (1/3)

**Columna principal:**
- Bloque 6: Proyecto activo (si es especialista) — SUBE de posición
- Bloque 7: Mis proyectos — formato compacto si hay más de 3
- Bloque 8: Postulaciones recibidas (solo fundadores con pendientes)
- Bloque 9: Proyectos disponibles (condicional: arriba para especialistas, abajo para fundadores)

**Sidebar:**
- A: Accionables (fondo diferenciado) — mensajes sin leer, postulaciones pendientes, wallet con fondeo pendiente
- B: Score — tamaño mayor que los demás indicadores
- C: Informativos — postulaciones enviadas, roles aceptados, aportes, ingresos
- D: Wallet widget (saldo disponible + comprometido + pendiente)
- E: Acciones rápidas en 2 niveles: primarias visibles (Crear proyecto, Buscar especialista) + secundarias colapsadas

**Análisis de frecuencia de uso:**
- Varias veces al día: bandeja, notificaciones
- Una vez al día: proyecto activo/workspace, postulaciones recibidas, mensajes
- Una vez por semana: proyectos disponibles (especialista), score
- Una vez al mes: aportes totales, ingresos, wallet (sin actividad)
- Ocasionalmente: acciones rápidas secundarias'),

('pendiente', 16, 'Implementación del rediseño del dashboard — 5 cambios concretos',
'**Todos los cambios usan código existente. Sin nueva funcionalidad.**

**Cambio 1 — CRÍTICO (2h):** Bandeja de trabajo a ancho completo antes del grid
- Sacar la bandeja del grid actual (gridTemplateColumns: 1.6fr 1fr)
- Ponerla como bloque independiente antes del grid de 2 columnas
- El grid de 2 columnas queda: columna principal + sidebar

**Cambio 2 — CRÍTICO (1h):** Proyectos disponibles condicional por rol
- Si esFundador: queda al fondo (posición actual)
- Si !esFundador (especialista): sube a posición 6, antes de mis proyectos
- Variables ya existen: esFundador, postulacionActiva

**Cambio 3 — ALTO (3h):** Tarjeta de proyecto: 1 CTA visible + overflow
- Mantener los 4 botones en el código
- Solo Workspace visible como botón principal
- Los otros 3 (Publicar rol, Hitos, Aportes) en un menú "..." que se despliega
- Si misProyectos.length > 3: cambiar a lista compacta con filtro por estado

**Cambio 4 — ALTO (1h):** Sidebar — separar accionables de informativos
- Accionables (mensajes sin leer, postulaciones pendientes): fondo levemente diferenciado
- Score: aumentar fontSize de 1.3rem a 1.6rem y agregar label descriptivo
- Informativos: tamaño actual, sin cambio de color

**Cambio 5 — MEDIO (2h):** Wallet widget — mostrar los 3 saldos
- Disponible (ya existe)
- Comprometido (órdenes aprobadas pendientes)
- Pendiente entrada (fondeos en proceso)

**Total estimado:** ~9h de desarrollo | Impacto: alto | Riesgo: bajo
**Prioridad de implementación:** 1 → 2 → 3 → 4 → 5');

-- ============================================================
-- FIN DEL ADDENDUM
-- ============================================================
