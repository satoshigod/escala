-- ============================================================
-- PLAN DE DESARROLLO PERSISTENTE DE ESCALA
-- Migration: 20260708_plan_desarrollo.sql
--
-- Esta tabla funciona como memoria del proyecto para Claude AI.
-- Al inicio de cada sesión, Claude debe leer esta tabla para
-- tener contexto completo del estado actual del proyecto.
--
-- Instrucción para Claude:
--   SELECT * FROM plan_desarrollo ORDER BY orden ASC;
-- ============================================================

CREATE TABLE IF NOT EXISTS plan_desarrollo (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion       text NOT NULL, -- 'contexto', 'stack', 'estado', 'pendiente', 'principios', 'ids_clave'
  orden         int NOT NULL,
  titulo        text NOT NULL,
  contenido     text NOT NULL, -- markdown
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    text NOT NULL DEFAULT 'Claude AI'
);

-- Solo el service role puede escribir
ALTER TABLE plan_desarrollo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_lectura_publica" ON plan_desarrollo FOR SELECT USING (true);
CREATE POLICY "plan_escritura_service" ON plan_desarrollo FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND es_admin = true)
);

-- Insertar el plan completo del proyecto
INSERT INTO plan_desarrollo (seccion, orden, titulo, contenido) VALUES

-- ---- CONTEXTO DEL PROYECTO --------------------------------
('contexto', 1, 'Qué es Escala', 
'Escala (escala.network) es el Sistema Operativo Mundial para Crear Empresas.
Permite que cualquier persona llegue con una idea, valide, encuentre cofundadores y especialistas, forme equipos, constituya una empresa, administre contratos, levante inversión, gestione pagos y opere una empresa completa.

**Fundador:** Ivan Correa
**Repo:** satoshigod/escala (GitHub, auto-deploy a Vercel desde main)
**Stack:** Next.js 16.2.9 + Turbopack, Supabase (PostgreSQL + RLS), Vercel, Resend (email)
**URL producción:** https://escala.network
**Supabase:** avrjgcitrgziiweirzfe.supabase.co'),

('contexto', 2, 'IDs críticos de QA',
'**FUNDADOR_ID (QA):** a57b6849-1388-4186-8880-2ec31dd31af5
**ESCALA project ID (QA):** f31699bd-96b2-4a78-ac6a-08e7a0ad3fbf
**Supabase project:** avrjgcitrgziiweirzfe.supabase.co
**Local (Ivan):** /Users/ivancorrea_1/Desktop/escritorio julio 2026/escala-app
**Claude VM:** /home/claude/escala_app/escala-app

**Sesión sync (siempre al inicio):**
cd /home/claude/escala_app/escala-app && git fetch origin && git reset --hard origin/main'),

('contexto', 3, 'Roles canónicos del modelo',
'7 roles canónicos — deben usarse consistentemente en todo el código:
1. Ideador
2. Capitalista
3. Especialista
4. Ejecutor
5. Ángel de Impulso
6. Mentor
7. Empresa'),

-- ---- STACK Y ARQUITECTURA ---------------------------------
('stack', 4, 'Estructura del proyecto',
'**39 páginas** en app/
**41 APIs** en app/api/
**27 tablas** en Supabase
**15 módulos** en lib/
**44 eventos** de notificación en lib/notificaciones/eventos.js

**Módulos lib principales:**
- lib/notificaciones/notificar.js — motor central de notificaciones (el más importante)
- lib/notificaciones/eventos.js — catálogo de 44 eventos únicos
- lib/financiero/ledger.js — motor central del ledger financiero
- lib/logros.js — otorgarLogro() directo a Supabase
- lib/segmentosRoles.js — 8 roles × 27 segmentos × 138 tareas
- lib/generadorContrato.js — plantilla legal colombiana 15 cláusulas'),

('stack', 5, 'Tablas en Supabase (todas corridas excepto una)',
'**Tablas existentes (corridas):**
perfiles, proyectos, roles, postulaciones, contratos, tareas, hitos, aportes,
ingresos, mensajes, impulsos, deuda_pendiente, notificaciones, push_subscriptions,
preferencias_notificacion, historial_tareas, calificaciones, logros_usuario,
categorias, especialidades, industrias, paises_regulatorios, publicaciones_redes

**PENDIENTE CORRER en Supabase:**
supabase/migrations/20260708_motor_financiero.sql
→ Crea: exchange_rates, wallets, ledger_entries, fondeos, payment_requests, financial_audit
→ 9 monedas: COP MXN CLP ARS PEN USD EUR USDT USDC'),

('stack', 6, 'Principios técnicos críticos — NO violar',
'1. **Internal fetch() falla en producción** — usar lib/logros.js con otorgarLogro() directo a Supabase, nunca fetch() a APIs internas desde server
2. **Saldos de wallet NUNCA se guardan** — siempre calculados desde ledger_entries
3. **Ledger es inmutable** — nunca DELETE ni UPDATE en ledger_entries ni financial_audit
4. **Idempotencia** — toda operación financiera tiene idempotency_key único
5. **Doble partida** — cada movimiento genera exactamente 2 entradas (débito + crédito)
6. **fundador_id en QA** debe venir de dataP.proyecto.fundador_id (no hardcodeado)
7. **Stop-and-confirm** — Claude no continúa al siguiente paso sin confirmación de Ivan
8. **Motor financiero es independiente** del dashboard general — tiene su propio topbar
9. **paises tabla no existe** — datos de país en paises_regulatorios
10. **deuda_pendiente FK** requiere nombre explícito deuda_beneficiario_id_fkey'),

-- ---- ESTADO ACTUAL ----------------------------------------
('estado', 7, 'Estado del proyecto — julio 2026',
'**Progreso:** ~85% completado del roadmap actual
**Fases completadas:** 21 fases (Fase 30 en histórico)
**Valor construido:** ~$156M COP

**Módulos completos y funcionando:**
✅ Auth (registro, login, onboarding)
✅ Proyectos (CRUD, workspace, roles, tareas, hitos)
✅ Postulaciones y ofertas
✅ Contratos (auto-generación, 15 cláusulas, PDF)
✅ Aportes e ingresos
✅ Motor de notificaciones (44 eventos, email+push+in-app)
✅ Calificaciones y logros/badges
✅ Ángel de Impulso
✅ Score de reputación
✅ Identidad visual (isotipo escalón+punto)
✅ Motor financiero: APIs + páginas (PENDIENTE: correr SQL)
✅ QA con 22 grupos de tests automáticos
✅ RLS en todas las tablas

**PENDIENTE INMEDIATO:**
⏳ Correr SQL del motor financiero en Supabase
⏳ Agregar BREB_WEBHOOK_SECRET y BINANCE_WEBHOOK_SECRET en Vercel'),

('estado', 8, 'Páginas del módulo financiero',
'**Módulo independiente con topbar propio "Escala · Finanzas":**
- /wallet — Mi wallet (saldo disponible/comprometido/pendiente por moneda)
- /wallet/fondear — Fondear (3 pasos: método → monto → instrucciones BRE-B/Binance)
- /wallet/movimientos — Historial paginado del ledger
- /wallet/pagos — Mis órdenes de pago
- /wallet/pagos/solicitar — Formulario de solicitud de pago
- /admin/financiero — Panel admin (KPIs + tabla + modal aprobar/rechazar/ejecutar)

**Widget en dashboard general:** muestra saldo + botones Fondear y Ver →
(Se oculta automáticamente si el SQL no está corrido)'),

-- ---- PENDIENTES -------------------------------------------
('pendiente', 9, 'Pendientes que solo requieren a Claude',
'En orden de prioridad:

1. **Enterprise Graph diseño completo** (Fase 22) — documento arquitectónico del grafo
2. **Deuda técnica** (Fase 23) — entity_relationships, score real, contratos vivos, expertise nodes
3. **IA sobre el grafo** (Fase 24) — embeddings pgvector, matching, assistant
4. **RSC migration** (Fase 25.1) — React Server Components en páginas críticas
5. **Rate limiting** (Fase 25.2) — Vercel Edge Middleware
6. **Redis caché** (Fase 25.3) — Upstash para catálogos y scores
7. **Comisión por transacción** (Fase 27.1) — activar campo ya existente en ledger
8. **/wallet/pagos/[id]** — página de detalle de orden de pago (falta)
9. **Tests QA del motor financiero** — correr y verificar los 9 tests después de que Ivan corra el SQL'),

('pendiente', 10, 'Pendientes que requieren acción de Ivan o terceros',
'| Qué | Quién | Costo estimado |
|-----|-------|----------------|
| Correr SQL motor financiero | Ivan en Supabase | $0 |
| BREB_WEBHOOK_SECRET en Vercel | Ivan | $0 |
| BINANCE_WEBHOOK_SECRET en Vercel | Ivan | $0 |
| Contratar BRE-B (Colombia) | Ivan | TBD |
| Contratar Binance API | Ivan | TBD |
| Wompi (pagos Colombia) | Ivan | TBD |
| SPEI (México) | Ivan | TBD |
| Khipu/Fintoc (Chile) | Ivan | TBD |
| Stripe (Internacional) | Ivan | TBD |
| Facturación DIAN | Ivan + Contador | TBD |
| Canal SMS (Twilio/Sinch) | Ivan | TBD |
| Canal WhatsApp API Meta | Ivan | TBD |
| Firma digital contratos | Ivan | TBD |
| Meta Business Verification | Ivan | RUT o Cámara de Comercio |
| Username Facebook | Ivan | 100 seguidores |
| App móvil | Desarrollador adicional | TBD |'),

-- ---- ROADMAP FUTURO ---------------------------------------
('pendiente', 11, 'Roadmap futuro — 6 fases Enterprise',
'**Fase 22 — Enterprise Graph** ($8M COP): diseño arquitectónico del grafo, Trust Graph, IA sobre el grafo, roadmap 20 años
**Fase 23 — Deuda técnica** ($6M COP): entity_relationships, score real, contratos vivos, expertise nodes, i18n
**Fase 24 — Escala Intelligence Layer** ($12M COP): embeddings, matching, generación contratos IA, detección riesgos, assistant, valoración
**Fase 25 — Escalabilidad** ($10M COP): RSC, rate limiting, Redis, Sentry, multi-tenant
**Fase 26 — Expansión internacional** ($15M COP): SPEI, Khipu, Wompi, Stripe, facturación
**Fase 27 — Monetización** ($5M COP): comisión por transacción, suscripción Pro, Escala for Teams

**Total pendiente documentado:** ~$56M COP en trabajo futuro
**Valor actual construido:** ~$156M COP'),

-- ---- PATRONES Y CONVENCIONES ------------------------------
('principios', 12, 'Patrones de desarrollo — convenciones del proyecto',
'**Commits:** mensajes descriptivos en español con qué se hizo y por qué
**Push:** siempre limpiar el token PAT del remote URL después del push
**QA:** cada feature nueva debe tener tests en /qa con prefijo QA- en datos de prueba
**Roadmap:** actualizar /desarrollo (histórico) y /desarrollo-limpio (entregable) después de cada fase
**NavApp:** usar components/NavApp.js en páginas autenticadas del módulo principal
**Módulo financiero:** tiene su propio shell visual — NO usar NavApp, tiene topbar oscuro propio
**Notificaciones:** siempre usar notificar() del motor, nunca llamadas directas a la tabla
**Logros:** usar otorgarLogro() de lib/logros.js — nunca fetch() interno
**helper SQL:** eliminar_usuario_completo(uid) para borrar usuarios de prueba en orden correcto'),

('principios', 13, 'Instrucción de inicio de sesión para Claude',
'**AL INICIO DE CADA SESIÓN NUEVA:**

1. Correr: cd /home/claude/escala_app/escala-app && git fetch origin && git reset --hard origin/main
2. Leer este plan: SELECT * FROM plan_desarrollo ORDER BY orden ASC
3. Verificar estado actual con: git log --oneline -5
4. Preguntar a Ivan: ¿en qué continuamos hoy?

**NUNCA asumir** el estado del código sin hacer el sync primero.
**NUNCA continuar** al siguiente paso sin confirmación de Ivan.
**SIEMPRE verificar** que el build pasa antes de hacer push.');

-- Índice para búsquedas rápidas
CREATE INDEX idx_plan_desarrollo_seccion ON plan_desarrollo(seccion);
CREATE INDEX idx_plan_desarrollo_orden ON plan_desarrollo(orden);

-- ============================================================
-- FIN
-- ============================================================
