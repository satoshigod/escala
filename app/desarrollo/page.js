'use client'
// app/desarrollo-limpio/page.js
// ROADMAP ESCALA — Estructura de 10 Capas Estrategicas Permanentes
// Cualquier funcionalidad nueva debe ubicarse en una de estas capas.
// Si no cabe en ninguna, es senal de que identificamos una capa nueva.

import { useState } from 'react'

// ============================================================
// DEFINICION DE CAPAS ESTRATEGICAS
// Estas capas son permanentes. Todo el desarrollo de Escala
// para los proximos 10 anos cabe dentro de estas 10 capas.
// ============================================================

const CAPAS = [
  {
    id: 'C1',
    titulo: 'CAPA 1 — Infraestructura',
    descripcion: 'Los cimientos sobre los que todo lo demas se construye. Auth, base de datos, storage, deploy, seguridad, observabilidad, compliance, multi-tenant, i18n. Sin esta capa nada mas funciona.',
    color: '#4A90D9',
    estado: 'progreso',
    valor_total: 29500000,
    valor_hecho: 5500000,
    hitos: [
      { num: 'C1.1', nombre: 'Modelo de datos — 20+ tablas Supabase PostgreSQL con RLS, cascades FK correctos en 23 relaciones, funcion eliminar_usuario_completo(uid)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C1.2', nombre: 'Autenticacion — Supabase Auth + trigger perfiles, verificacion de correo no-bloqueante, correos transaccionales con Resend + dominio propio mail.escala.network (DKIM/SPF/DMARC)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C1.3', nombre: 'Almacenamiento — Supabase Storage con validacion de tipo/tamano, bucket escala-public para imagenes', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C1.4', nombre: 'Infraestructura de deploy — GitHub (satoshigod/escala) + Vercel (auto-deploy main) + Supabase. Claude AI hace commits y push directos via PAT', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C1.5', nombre: 'RLS publica en proyectos — policy proyectos_activos_publicos permite lectura sin sesion, necesaria para home y paginas publicas', done: true, valor: 200000, quien: 'Claude AI' },
      { num: 'C1.6', nombre: 'Funcion SQL eliminar_usuario_completo(uid) — borra usuario y todos sus datos en el orden correcto respetando FK', done: true, valor: 300000, quien: 'Claude AI' },
      { num: 'C1.7', nombre: 'Rate limiting global: Vercel Edge Middleware en todas las APIs — 100 req/min por IP, 1000/min por usuario autenticado', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C1.8', nombre: 'Cache de lectura: Upstash Redis para cachear tasas de cambio, catalogos y scores. TTL 5 min para datos frecuentes', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: 'C1.9', nombre: 'Observabilidad: Sentry instalado (@sentry/nextjs). Captura errores cliente y servidor. DSN configurado. Org: plaza-black, proyecto: escala-production. Source maps ocultos. Tunnel /monitoring para evitar adblockers.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C1.10', nombre: 'React Server Components: migrar las 5 paginas mas criticas de fetch() client-side a RSC — eliminar waterfalls de datos y mejorar TTI', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C1.11', nombre: 'Multi-tenant: tabla organizations, separacion de datos por organizacion, modelo white-label — prerequisito para Escala for Teams y Capa 9', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C1.12', nombre: 'i18n real: next-intl en todas las paginas, deteccion de pais por IP, moneda y proveedor de pago automaticos segun pais del usuario', done: false, valor: 4000000, quien: 'Claude AI' },
    ]
  },
  {
    id: 'C2',
    titulo: 'CAPA 2 — Sistema Operativo del Proyecto',
    descripcion: 'El nucleo de Escala. Todo lo que permite crear, ejecutar y cerrar un proyecto: roles, hitos, tareas, equipo, contratos, workspace, documentos, chat y cierre formal. Es el producto principal.',
    color: '#1D9E75',
    estado: 'progreso',
    valor_total: 78000000,
    valor_hecho: 53000000,
    hitos: [
      { num: 'C2.1', nombre: 'API proyectos — GET (con roles, paginacion), POST (con nivel_avance, modalidad_trabajo, roles_buscados, validacion ownership), DELETE (solo fundador)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.2', nombre: 'Publicacion de proyectos — formulario con 5 niveles de avance, 3 modalidades, 9 roles buscados, validacion descripcion 80+ chars, guia de escritura gratuita', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.3', nombre: 'Detalle de proyecto publico — visitantes ven todo sin login, botones de postulacion se convierten en CTA de registro', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.4', nombre: 'Hitos del proyecto — crear, completar, kanban pendiente/completado desde workspace', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.5', nombre: 'Ingresos del proyecto — registrar ventas/contratos con tipo, valor, fecha y comprobante', done: true, valor: 800000, quien: 'Claude AI' },
      { num: 'C2.6', nombre: 'Panel fundador — postulaciones recibidas por rol, aceptar/rechazar, generacion automatica de contrato al aceptar', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.7', nombre: 'Postulaciones — Ofertas recibidas (usuario decide) separado de Mis postulaciones (solo consulta)', done: true, valor: 800000, quien: 'Claude AI' },
      { num: 'C2.8', nombre: 'Invitar — detecta correo ya registrado, crea oferta real en su bandeja + envia correo', done: true, valor: 800000, quien: 'Claude AI' },
      { num: 'C2.9', nombre: 'Contratos digitales — tabla contratos con 10 columnas, 15 clausulas legales colombianas, PDF inline en browser sin librerias externas', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C2.10', nombre: 'Firmas — estado visible en workspace. Boton Confirmar firma + Regenerar contrato', done: true, valor: 600000, quien: 'Claude AI' },
      { num: 'C2.11', nombre: 'Workspace — tabs: Resumen, Hitos, Equipo, Aportes, Economia. Acceso solo para miembros aceptados y fundador', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.12', nombre: 'Workspace adaptivo — nav reducido segun contenido real del proyecto (local comercial, maquinaria, completo)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.13', nombre: 'Plan de trabajo del especialista — tareas auto-inicializadas por rol y pais al entrar al workspace', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.14', nombre: 'Chat interno — tiempo real con Supabase Realtime', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.15', nombre: 'Documentacion segmentada — tabla documentos_proyecto, API /api/documentos, pestana Documentacion en workspace', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.16', nombre: 'Hilo de conversacion por tarea — mensajes automaticos al completar/verificar, panel hilo inline, indicador Requiere revision', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.17', nombre: 'Biblioteca de tareas regulatorias — 7 paises con 5-6 tareas cada uno, cargadas automaticamente segun pais del proyecto', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.18', nombre: 'Biblioteca de tareas comerciales — 5+ industrias con 6 tareas cada una, cargadas automaticamente segun industria', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.19', nombre: 'Reparto economico — fundador registra ingreso, sistema calcula distribucion automatica entre angeles, especialistas y fundador. API /api/reparto', done: true, valor: 7000000, quien: 'Claude AI' },
      { num: 'C2.20', nombre: 'Cierre formal del proyecto — flujo 3 pasos (checklist, confirmacion, cerrado). Notifica a todos los participantes. Estado: activo → completado → cerrado', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C2.21', nombre: 'Retirarme del proyecto — con advertencia clara, consecuencias irreversibles', done: true, valor: 400000, quien: 'Claude AI' },
      { num: 'C2.22', nombre: 'Proyectos en borrador: POST crea con estado=borrador por defecto. Workspace muestra banner amarillo pulsante con boton Publicar proyecto. Dashboard muestra badge Borrador en tarjeta. PATCH dispara notificacion proyecto_publicado al pasar a activo.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.23', nombre: 'Calificacion mutua post-cierre: en paso 3 del cierre aparece bloque de estrellas (1-5) para cada miembro del equipo. Comentario opcional. Se guarda en tabla calificaciones via /api/calificaciones. Solo aparece cuando hay equipo aceptado.', done: true, valor: 1500000, quien: 'Claude AI' }, 
      { num: 'C2.24', nombre: 'Escenario: Arrendar local — wizard, tareas predefinidas: buscar local, negociar contrato, constituir empresa, licencia funcionamiento. Roles: Abogado + Contador', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.25', nombre: 'Escenario: Restaurante/comida — wizard, tareas INVIMA, permiso bomberos, uso de suelo, registro marca', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.26', nombre: 'Escenario: Importar mercancia — wizard, registro importador DIAN, agente aduanas, poliza, bodega', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.27', nombre: 'Escenario: Comprar vehiculo operativo — wizard, RUNT, SOAT, revision tecnico-mecanica, vinculacion plataforma', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.28', nombre: 'Escenario: Tienda online/e-commerce — wizard, constitucion, diseno marca, desarrollo tienda, catalogo, pagos, lanzamiento', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.29', nombre: 'Biblioteca 100 escenarios: 30 sectores (agricultura, manufactura, salud, educacion, logistica, IA, biotech, turismo, bienes raices, moda, alimentos, etc.) cada uno con wizard, tareas y roles sugeridos', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C2.30', nombre: 'Lenguaje emprendedor en toda la plataforma: Necesito un local, Necesito equipos o maquinaria. 32 cambios en 8 archivos. Iconos y descripciones actualizados.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C2.31', nombre: 'Calculadora interactiva paso 0 en wizard local: monto total antes de comprometerse. Selector de meses de deposito, campo adecuaciones, calculo en tiempo real, pre-llena el wizard.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.32', nombre: 'Buscador de equipos por nombre en presupuesto: el emprendedor escribe horno/nevera/servidor y el sistema categoriza automaticamente con diccionario de 18 tipos. Badge de confirmacion de categoria detectada.', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.33', nombre: 'Timeline 4 pasos visible al seleccionar escenario local o equipos: 1-describir 5min, 2-verificacion 24-48h, 3-angel financia, 4-pagas desde ventas. Expectativas claras desde el inicio.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C2.34', nombre: 'Tres tarjetas visuales para modelo de retorno del inversionista: Parte del negocio / Le pago cuotas / Un % de mis ventas. Cada tarjeta muestra descripcion, ejemplo concreto con monto real y calculo automatico del impacto.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.35', nombre: 'Notificacion proactiva a angeles compatibles (C5.10): al crear un item en el presupuesto, detecta angeles que han invertido en el mismo sector o categoria con rango de monto similar (0.3x-5x). Les envia notificacion email+push+in-app con nombre del item, monto y proyecto. Sin esperar a que el angel entre al directorio.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.36', nombre: 'Wizard local simplificado: paso 0 pide nombre del negocio, ciudad, arriendo, deposito y adecuaciones. CTA muestra el monto exacto con el nombre del negocio. Pre-llena todo el wizard.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.37', nombre: 'Formulario creacion limpio por escenario: modalidad trabajo y perfiles solo en startup. Industria solo en startup. Etapa del proyecto en todos. Local y equipos tienen lenguaje propio para Tipo A/B. estado_financiacion auto riesgo_compartido para local y equipos.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.38', nombre: 'Tab Necesito mas permanente en workspace de local y equipos: empleado (publicar rol), equipo (presupuesto), local (nuevo proyecto), capital de trabajo. Bloque compacto equivalente en dashboard con pills de acceso rapido por escenario.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.39', nombre: 'Auditoria UX v2 (comite de producto): escenarios y roles. Eliminado el eco doble "Que necesitas?" (el selector de proyecto pasa a "Que quieres hacer?"), intent del home propagado al onboarding, onboarding con progressive profiling (campos no esenciales marcados opcional + completar despues desde el perfil), recuperacion de contrasena por email (reset nativo de Supabase Auth + correo por Resend), y migracion del id de escenario de maquinaria de "otro" a "maquinaria" (patron expand-migrate-contract, SQL corrido y verificado).', done: true, valor: 4600000, quien: 'Claude AI + Ivan' },
      { num: 'C2.40', nombre: 'Auditoria de user flows (Dashboard): dashboard por perfil (accesos rapidos filtrados por rol; el colaborador ve Buscar proyectos / Mis postulaciones / Mi perfil), acciones de proyecto en la tarjeta (Publicar / Cerrar / Eliminar, ya soportadas por el backend), fix del bug de ingresos en $0 del fundador, aviso de mensajes sin leer tambien para especialistas, y "..." enganoso eliminado de la tarjeta compacta.', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C2.41', nombre: 'Auditoria de user flows (Workplace): confiabilidad de acciones. Feedback de error en handlers que fallaban en silencio (eje workspace, tareas, chat, leasing, constitucion; chat y mensajes restauran el texto si falla) y fix del "Cargando..." infinito sin sesion en 7 sub-pantallas (equipos, reparto, capital, cierre, presupuesto, local, local/inversionista).', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C2.42', nombre: 'Auditoria de user flows (flujo de postulacion del especialista: descubrir -> postularse -> aceptar). responderOferta (aceptar/rechazar invitacion) actualizaba la UI a "aceptada" sin chequear el PATCH: falso positivo en una accion que crea contrato. Ahora solo actualiza si tuvo exito y avisa en error. postularse mostraba "Ya te postulaste" ante CUALQUIER error (red, servidor, rol lleno): ahora la API devuelve mensaje amigable solo para el duplicado real (constraint 23505) y el front muestra el error verdadero.', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C2.43', nombre: 'Auditoria de user flows (actores fundador e inversionista). Fundador gestionando postulaciones recibidas: cambiarEstado (aceptar/rechazar) era fire-and-forget con update optimista, mismo falso positivo que en el especialista (aceptar crea contrato). Ahora verifica el PATCH antes de actualizar la UI y avisa en error. Flujo inversionista (angel, directorio-inversion) auditado: bien construido (try/catch + feedback en accionFondeo, proponerFondeo, firmarLeasing), sin cambios.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C2.44', nombre: 'Home: fusion de las dos rejillas de segmentacion en una sola. El home tenia dos secciones que preguntaban lo mismo con distinto ropaje: "Por que existe Escala" (6 tarjetas de reconocimiento sin links) y "Que necesitas" (8 tarjetas accionables con links). Se fusionaron en una sola seccion ("Empieza por donde estas"): las 8 tarjetas accionables ahora integran el gancho emocional destilado de las 6 de reconocimiento (nada se elimino, se integro), y la historia real de las 4 personas se conserva debajo. Se elimino la seccion redundante. Ancla del hero corregida a #historia.', done: true, valor: 800000, quien: 'Claude AI + Ivan' },
      { num: 'C2.45', nombre: 'Barrido exhaustivo Auditoria UX v2 (Word 1): la auditoria original corrigio el lenguaje viejo solo en el selector de maquinaria, pero quedaban residuos. Corregidos 8 en 6 archivos: "un angel lo financia" -> "un inversionista lo financia" en workspace (necesito_mas x3), y landings (como-crear-empresa, financiar-equipos, financiar-maquinaria, startup-peru); "Score" -> "Reputacion" en el perfil publico. NO se tocaron: los blogs educativos que usan "angel investing" (termino correcto de industria + SEO), ni rol_nombre "Angel de Impulso" en BD/queries (identificador tecnico, requeriria migracion como el caso otro->maquinaria).', done: true, valor: 600000, quien: 'Claude AI' },
      { num: 'C2.46', nombre: 'Barrido: "Angel de Impulso" (definido por Ivan como un inversionista que puede donar, no un rol aparte) unificado a "Inversionista" en todo el user-facing, y "impulso/impulsar" eliminado del lenguaje visible (Ivan: no es palabra que usen). Cambios: eyebrows de rol en /angel y /directorio-inversion -> "Inversionista"; logro "Angel de Impulso" -> "Primera donacion"; notif "Un Angel de Impulso" -> "Un inversionista"; label "Tus impulsos" -> "Tus inversiones" en el dashboard. NO tocado: rol_nombre "Angel de Impulso" en BD/queries (identificador tecnico), la key interna primer_impulso del logro, ni las URLs (/angel se queda, migrarla no aporta al usuario).', done: true, valor: 500000, quien: 'Claude AI + Ivan' },
      { num: 'C2.47', nombre: 'Barrido Word 2 (parte 1, lenguaje de producto): "angel" como sinonimo del inversionista unificado a "Inversionista" en las pantallas de producto (dashboard, workspace: capital, leasing, presupuesto, eje). Tambien "para que los angeles puedan fondearte" -> "para que los inversionistas puedan financiarte", y "angeles e inversionistas" -> "inversionistas" (redundante). Pendiente decision de Ivan: las ~40 ocurrencias restantes de "angel" en landings de marketing y notificaciones de API (donde puede ser voz de marca intencional). Vocabulario "fondear/fondeo/fondeado" (estados del presupuesto) NO tocado: es terminologia establecida del modulo, no un residuo.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C2.48', nombre: 'Barrido: efectos secundarios de la unificacion de rol (Inversionista duplicado). Al unificar Capitalista + Angel de Impulso -> Inversionista quedaron DOS tarjetas/chips "Inversionista" (distinto id: capitalista y angel) en el onboarding, en bienvenida y en el filtro del directorio. Fusionadas en una sola (id canonico capitalista, ejemplo que cubre invertir en proyecto O financiar una meta); el filtro del directorio ahora encuentra ambos ids con un solo chip. Ademas "angel" -> "inversionista" en la desc de Empresa del onboarding y en "Abono al angel" del reporte de equipos.', done: true, valor: 500000, quien: 'Claude AI + Ivan' },
      { num: 'C2.49', nombre: 'Barrido de lenguaje final (decisiones de Ivan): (1) "fondear/fondeado" -> "financiar/financiado" en TEXTO VISIBLE (labels de estado del presupuesto Sin financiar / Parcial / Financiado, Total financiado, % financiado, Ya financiado, Todo financiado, y el copy del dashboard). Los valores tecnicos (estado_fondeo, sin_fondear, parcialmente_fondeado, tabla fondeos, monto_fondeado, /api/presupuesto/fondeo) NO se tocaron. (2) En MARKETING el "angel" se eleva a "inversionista angel" (voz de marca calida pero unificada bajo Inversionista) en programa-maquinaria, que-es-escala, landings de equipos, seo y local-en-verificacion; en PRODUCTO queda "Inversionista" a secas. Corregida ademas una duplicacion preexistente "del inversionista inversionista" en leasing.', done: true, valor: 600000, quien: 'Claude AI + Ivan' },
    ]
  },
  {
    id: 'C3',
    titulo: 'CAPA 3 — Motor Financiero',
    descripcion: 'Todo lo relacionado con dinero en Escala. Wallets, ledger inmutable, fondeos, pagos, presupuesto por item CAPEX/OPEX, reparto economico, waterfall de locales comerciales, modelos de maquinaria y arriendos, comisiones y proveedores de pago por pais.',
    color: '#E8A020',
    estado: 'progreso',
    valor_total: 68500000,
    valor_hecho: 43500000,
    hitos: [
      { num: 'C3.1', nombre: 'SQL motor financiero: exchange_rates, wallets, ledger_entries (doble partida inmutable), fondeos, payment_requests, financial_audit — 9 monedas, RLS en todas las tablas', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C3.2', nombre: 'Motor central lib/financiero/ledger.js: registrarMovimiento() idempotente, calcularSaldo() siempre desde ledger, tasaDelDia(), obtenerOCrearWallet(), registrarAuditoria()', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C3.3', nombre: 'APIs financieras: /api/wallet, /api/wallet/movimientos, /api/fondeos, /api/fondeos/webhook (HMAC-SHA256), /api/pagos, /api/admin/financiero, /api/exchange-rates', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C3.4', nombre: 'Eventos financieros conectados al motor notificar(): wallet_fondeo_acreditado, wallet_debito_ejecutado, wallet_proyecto_fondeado, admin_transferencia_recibida, fondeo_completado/fallido, pago_ejecutado', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.5', nombre: 'Paginas wallet: /wallet (modulo independiente), /wallet/fondear (3 pasos: metodo → monto → instrucciones BRE-B/Binance), /wallet/movimientos, /admin/financiero', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.6', nombre: 'Presupuesto por item: 6 categorias (equipo, equipos_activos, tecnologia, capital_trabajo, marketing_ventas, legal_operacion) + Otro con 9 subcategorias. CAPEX/OPEX, multiples inversores por item, 3 modelos: participacion/deuda/revenue_share', done: true, valor: 0, quien: 'Claude AI' },
      { num: 'C3.7', nombre: 'Tablas presupuesto: presupuesto_items (valor_total GENERATED), presupuesto_fondeos. RLS. Indices', done: true, valor: 1000000, quien: 'Ivan' },
      { num: 'C3.8', nombre: 'API /api/presupuesto (GET/POST/PUT/DELETE): CRUD items. GET devuelve items agrupados por categoria + resumen financiero (total, fondeado, CAPEX/OPEX, pct_fondeado)', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C3.9', nombre: 'API /api/presupuesto/fondeo: angel propone fondeo, fundador acepta/rechaza/negocia, angel confirma transferencia, fundador verifica. Contrato automatico al aceptar. Capital al wallet del proyecto al verificar', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C3.10', nombre: 'UI /workspace/presupuesto: selector visual 6 categorias + submenu Otro. Modal agregar item. Modal proponer fondeo. Barra progreso por item y global. Export PDF', done: true, valor: 5000000, quien: 'Claude AI' },
      { num: 'C3.11', nombre: 'Motor waterfall local comercial: ventas → costo → fijos → excedente → intereses → abono capital. Ledger inmutable. Transicion automatica Fase 1 → 2 → 3', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C3.12', nombre: 'Paneles local comercial: wizard 6 pasos, panel operador con reporte diario, panel inversionista con semaforo, salida anticipada con penalidad por fase', done: true, valor: 5000000, quien: 'Claude AI' },
      { num: 'C3.13', nombre: 'Admin local comercial: checklist verificacion, tasas usura, aprobar/rechazar con tasa asignada. Alertas cron sin reporte', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.14', nombre: 'Motor notificaciones financieras: wallet_proyecto_fondeado, admin_fondeo_presupuesto_verificado, reparto_linea_pagada, local_abono_capital, local_pago_completado — cada movimiento de dinero notifica', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.15', nombre: 'Admin finanzas: panel consolidado /admin/finanzas — capital en movimiento, transferencias por verificar, locales en mora, fondeos recientes. Solo admin', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C3.16', nombre: 'Variables Vercel: BREB_WEBHOOK_SECRET, BINANCE_WEBHOOK_SECRET', done: false, valor: 0, quien: 'Ivan' },
      { num: 'C3.17', nombre: 'Modelo inversion arriendos: inversionista financia deposito + meses de arriendo con contrato automatico y waterfall desde ingresos del negocio', done: false, valor: 4000000, quien: 'Claude AI' },
      { num: 'C3.18', nombre: 'Modelo inversion maquinaria: inversionista compra el activo, queda como propietario con leasing/renting al proyecto, recibe cuota mensual desde waterfall', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C3.19', nombre: 'SPEI (Mexico): integracion con PSP mexicano para fondeos en MXN', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C3.20', nombre: 'Khipu / Fintoc (Chile): integracion para fondeos en CLP', done: false, valor: 4000000, quien: 'Claude AI + Ivan' },
      { num: 'C3.21', nombre: 'Wompi (Colombia): PSE + tarjetas debito/credito para Colombia', done: false, valor: 4000000, quien: 'Claude AI + Ivan' },
      { num: 'C3.22', nombre: 'Stripe (Internacional): USD/EUR para Espana, Ecuador y usuarios internacionales', done: false, valor: 4000000, quien: 'Claude AI + Ivan' },
      { num: 'C3.23', nombre: 'BENCHMARK: Fondeo en 48 horas como promesa central. Una vez el angel acepta y transfiere, Escala verifica y acredita en menos de 48 horas. Mostrar en todo momento cuanto falta para ese plazo. Hacer del tiempo la propuesta de valor principal. (Leccion: Duckfund — fondos en 48h es su eslogan principal, no un beneficio secundario)', done: false, valor: 1000000, quien: 'Claude AI + Ivan' },
      { num: 'C3.24', nombre: 'BENCHMARK: Financiar el 100% incluyendo costos adicionales. Cuando el emprendedor agrega un equipo al presupuesto, incluir automaticamente un buffer para instalacion, transporte y puesta en marcha (tipicamente 15-20% adicional). El angel ve el monto total real. (Leccion: Crest Capital — financia 100% incluyendo soft costs de instalacion y entrega)', done: false, valor: 500000, quien: 'Claude AI' },
      { num: 'C3.25', nombre: 'Financiamiento embebido en tab Mi proyecto: muestra items sin fondear con barras de progreso, monto faltante por item y boton Conseguir fondeo directo. Si todo esta fondeado muestra confirmacion verde. Si no hay presupuesto muestra CTA para agregar. Sin tener que ir al tab Maquinas y activos.', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.26', nombre: 'Panel angel con retorno esperado: deuda muestra cuota mensual y total a recuperar en N meses. Revenue share muestra pago mensual estimado a $10M ventas. Equity muestra porcentaje del negocio. Color por modelo.', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C3.27', nombre: 'CUSTODIA (fundacion): Escala custodia y paga TODO. Modelo de dos tramos con confirmacion manual para todos los flujos de recursos (local, maquina, arriendo, fondeo, reparto). Antes el ledger movia directo pagador->receptor y algunos flujos (reporte-diario) disparaban el "recibido" al REPORTAR, no al PAGAR. Nuevo: tabla ordenes_pago con maquina de estados (pendiente_pago -> pago_reportado -> en_custodia -> pago_emitido -> completado), helper lib/financiero/custodia.js que registra 2 asientos de ledger (pagador->escala:custodia en [3], escala:custodia->receptor en [5]) via registrarMovimiento idempotente, y 5 eventos de notificacion. El "recibido" real del receptor SOLO ocurre en [5]. Tramos del medio los confirma el admin. REQUIERE SQL en Supabase (tabla ordenes_pago + RLS). APIs de transicion y UI hechas (C3.28), piloto local cableado (C3.29).', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C3.28', nombre: 'CUSTODIA (fase 2 - APIs + UI de transicion): endpoint /api/custodia (POST con acciones reportar_pago (pagador), confirmar_recepcion y emitir_pago (solo admin), confirmar_recibido (receptor o admin), cancelar; GET por rol pagador/receptor/admin). Pagina /custodia adaptativa por rol: "tienes que pagar a Escala" con boton Ya pague, "Escala te va a pagar" con Confirmar que recibi, y cola admin (confirmar recepcion / marcar que Escala pago). Cada boton avisa en error. Pendiente fase 3: cablear cada flujo (piloto local).', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C3.29', nombre: 'CUSTODIA (fase 3 - piloto local): cableado el flujo local_repago al modelo de dos tramos. ANTES: /api/local-comercial/reporte-diario, al REPORTAR ventas, escribia el ledger directo operador->local, marcaba capital_pagado y notificaba "capital acreditado" al inversionista — o sea el inversionista veia "recibido" sin que el BREB hubiera salido. AHORA: reportar solo calcula el waterfall y crea una orden de custodia (tendero -> escala:custodia -> inversionista) con los montos del waterfall en la nota; el capital_pagado/intereses y el "recibido" del inversionista solo se aplican cuando la orden llega a completado (el inversionista confirma que recibio). Reportar ya no es pagar. Falta replicar a: compra_maquina, arriendo, fondeo, reparto.', done: true, valor: 1500000, quien: 'Claude AI' },
    ]
  },
  {
    id: 'C4',
    titulo: 'CAPA 4 — Trust & Identity Graph',
    descripcion: 'La reputacion verificable es el activo mas valioso de Escala y el moat mas dificil de copiar. Score, calificaciones, logros, certificaciones, historial inmutable, identidad digital, KYC/AML y prevencion de fraude.',
    color: '#AFA9EC',
    estado: 'progreso',
    valor_total: 39500000,
    valor_hecho: 8500000,
    hitos: [
      { num: 'C4.1', nombre: 'Algoritmo Score — 4 dimensiones verificables, calculado en funcion de DB, consistente en todos los modulos (directorio, metricas, perfil, score)', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C4.2', nombre: '/score — grafico circular, metricas reales, explainer expandible de como subir el score, logros desbloqueados, calificaciones recibidas', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C4.3', nombre: 'Track record publico — historial verificable en perfil de usuario', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C4.4', nombre: 'Calificaciones entre colaboradores: tabla calificaciones (RLS escritura propia, lectura publica), API /api/calificaciones, promedio visible, unico por proyecto+par', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C4.5', nombre: 'Logros automaticos: 8 badges (primera postulacion aceptada, tarea verificada, contrato firmado, proyecto completado, primer impulso, aporte verificado, primera calificacion, perfil completo)', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C4.6', nombre: 'Badges de certificacion profesional: cert_tarjeta_profesional y cert_jcc. Uploader en /perfil/editar, auto-badge y recalculo Score. Visible en perfil publico', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C4.7', nombre: 'Trust Graph: reputacion calculada desde historial, contratos, pagos, cumplimiento, proyectos, resultados, referencias, aportes, experiencia e impacto — no solo conteo de tareas', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C4.8', nombre: 'Score del grafo: PageRank-like sobre contribuciones verificadas. Reemplaza el simple contador actual por centralidad en el grafo de relaciones', done: false, valor: 6000000, quien: 'Claude AI' },
      { num: 'C4.9', nombre: 'Sistema de reputacion y certificacion por especialidad: score verificable basado en proyectos completados, calificaciones, tiempo de respuesta y calidad de entregables', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C4.10', nombre: 'KYC/AML: verificacion de identidad de inversores y fundadores para cumplimiento regulatorio cuando los montos superen umbrales legales por pais', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C4.11', nombre: 'Moats verificables: grafo de reputacion on-chain, historial de cumplimiento inmutable, valoraciones negociadas transparentes, red de especialistas certificados por Escala', done: false, valor: 7000000, quien: 'Claude AI + Ivan' },
    ]
  },
  {
    id: 'C5',
    titulo: 'CAPA 5 — Marketplace & Liquidez',
    descripcion: 'El problema del huevo y la gallina resuelto estructuralmente. Directorio de especialistas, directorio de inversion, descubrimiento de oportunidades, equipo base Escala, partners institucionales, fondo propio e inversores ancla.',
    color: '#E05555',
    estado: 'progreso',
    valor_total: 31300000,
    valor_hecho: 16300000,
    hitos: [
      { num: 'C5.1', nombre: 'Directorio de especialistas — busqueda por nombre, especialidad, ciudad, pais, score minimo; 7 roles canonicos en filtros', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C5.2', nombre: '/buscar proyectos — filtros por sector, tipo, ciudad, pais', done: true, valor: 800000, quien: 'Claude AI' },
      { num: 'C5.3', nombre: '/directorio-inversion — publico, sin login, angeles ven items de presupuesto sin fondear. Filtros categoria/prioridad. Modal fondeo inline. Stats globales', done: true, valor: 4000000, quien: 'Claude AI' },
      { num: 'C5.4', nombre: 'API /api/inversiones/oportunidades: items sin fondear de proyectos activos, paginado, filtros, resumen global por categoria', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C5.5', nombre: 'Panel angel /angel: portafolio activo, alertas de transferencias pendientes, oportunidades disponibles con deteccion de propuestas ya enviadas, KPIs de inversion', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C5.6', nombre: 'Dashboard contextual: tarjeta de proyecto detecta automaticamente equipos/maquinaria/local/tech y muestra informacion relevante sin entrar al workspace', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C5.7', nombre: 'Bloque descubrimiento en workspace: CTA azul a presupuesto, bloque warning hitos sin vincular al presupuesto', done: true, valor: 2000000, quien: 'Claude AI' },
      { num: 'C5.8', nombre: 'Equipo base interno de Escala: profesionales propios que aparecen listados cuando no hay especialistas externos. Se asignan temporalmente hasta tener masa critica', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C5.9', nombre: 'Pantalla vacia resuelta: cuando no hay equipo ni roles abiertos el fundador ve CTA Publicar primer rol + Ver proyecto publico. Desaparece cuando hay miembros.', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C5.10', nombre: 'Sistema de invitacion viralizado: inversionista invita a otro con incentivos, fundador trae inversionistas con beneficios de prioridad en fondeo', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C5.11', nombre: 'Red de partners institucionales: family offices, empresas, cooperativas que alimenten el marketplace con volumen desde el inicio', done: false, valor: 0, quien: 'Ivan' },
      { num: 'C5.12', nombre: 'Fondo propio temporal de Escala: capital semilla para financiar los primeros proyectos y demostrar el modelo antes de atraer angeles externos', done: false, valor: 0, quien: 'Ivan (decision estrategica)' },
      { num: 'C5.13', nombre: 'Grupo fundador de inversores ancla: 10-20 inversores comprometidos desde el inicio con condiciones preferenciales a cambio de liquidez inicial', done: false, valor: 0, quien: 'Ivan (desarrollo comercial)' },
      { num: 'C5.14', nombre: 'KPIs de liquidez del marketplace: tiempo promedio para primer especialista, tiempo para primer fondeo, tasa de conversion visitante a proyecto publicado, NPS por rol', done: false, valor: 4000000, quien: 'Claude AI' },
    ]
  },
  {
    id: 'C6',
    titulo: 'CAPA 6 — Intelligence Layer',
    descripcion: 'La IA como sistema nervioso de Escala. Embeddings, matching inteligente, copiloto por proyecto, deteccion de riesgos, onboarding inteligente, enterprise graph, knowledge graph y valoracion de contribuciones. Prerequisito: capas 1-5 consolidadas.',
    color: '#8FA3CC',
    estado: 'pendiente',
    valor_total: 77000000,
    valor_hecho: 0,
    hitos: [
      { num: 'C6.1', nombre: 'Enterprise Graph: nodos (Persona, Empresa, Idea, Proyecto, Equipo, Capital, Contribucion, Activo, Documento, Servicio, Evento, Conocimiento) y todas sus aristas con semantica y peso', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C6.2', nombre: 'Preparacion del modelo relacional para grafo: tabla entity_relationships con tipo de relacion, peso y direccion. Reemplazar FKs implicitas por aristas explicitas con semantica', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C6.3', nombre: 'Contratos vivos: vincular contratos a hitos, pagos y evidencias en tiempo real. Estado del contrato derivado del estado real de sus componentes', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C6.4', nombre: 'Expertise graph: tabla expertise_nodes con skills verificadas, endorsements entre pares y niveles de profundidad — base para matching inteligente de equipos', done: false, valor: 4000000, quien: 'Claude AI' },
      { num: 'C6.5', nombre: 'Embeddings de perfiles: vectorizar cada usuario con OpenAI text-embedding-3. Almacenar en pgvector (Supabase) para busqueda semantica', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C6.6', nombre: 'Matching inteligente: dado un proyecto, encontrar los 5 perfiles mas compatibles por skills complementarias, disponibilidad, historial y posicion en el Trust Graph', done: false, valor: 6000000, quien: 'Claude AI' },
      { num: 'C6.7', nombre: 'Generacion de contratos con IA: dado proyecto + rol + terminos negociados, generar contrato completo con clausulas especificas al contexto — reemplazar plantilla estatica', done: false, valor: 4000000, quien: 'Claude AI' },
      { num: 'C6.8', nombre: 'Deteccion de riesgos: identificar proyectos con alta probabilidad de abandono (sin actividad, hitos sin cumplir, conflictos) y alertar proactivamente a fundadores e inversores', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C6.9', nombre: 'Assistant sobre el grafo: chat que responde preguntas complejas del ecosistema usando el grafo como contexto (quién tiene experiencia en fintech en Chile con 3+ proyectos)', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C6.10', nombre: 'Valoracion de contribuciones: dado el historial de un especialista en un proyecto, estimar el valor de mercado de su contribucion usando comparables del grafo', done: false, valor: 6000000, quien: 'Claude AI' },
      { num: 'C6.11', nombre: 'Motor de matching automatico: IA recomienda especialistas, inversionistas y activos compatibles con cada proyecto segun historial, sector, ciudad y etapa', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C6.12', nombre: 'Onboarding inteligente: cuando un usuario entra por primera vez, la IA le hace 3 preguntas y lo lleva al tipo de proyecto correcto sin que tenga que descubrir el camino', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C6.13', nombre: 'IA copiloto por proyecto: asistente que analiza y recomienda roles que faltan, hitos criticos, inversionistas compatibles, riesgos. Basado en embeddings del grafo', done: false, valor: 10000000, quien: 'Claude AI' },
      { num: 'C6.14', nombre: 'Roadmap 20 anos: 6 fases desde MVP actual hasta infraestructura mundial — mapa de expansion por pais, vertical y segmento de mercado', done: false, valor: 0, quien: 'Ivan + Claude AI' },
      { num: 'C6.15', nombre: 'IA FUTURA: Validador de precio de equipos. El emprendedor pone "horno industrial $3M" y la IA dice "el precio promedio de ese equipo en Colombia es $18M — verifica antes de publicar". Evita propuestas irreales que ningun angel fondeara. Requiere base de datos de precios de equipos por categoria y region.', done: false, valor: 4000000, quien: 'Claude AI (requiere C6.5 embeddings)' },
      { num: 'C6.16', nombre: 'IA FUTURA: Estimador de ventas proyectadas para locales. Basado en tipo de negocio, ciudad y arriendo, la IA proyecta rango de ventas mensuales esperadas y calcula si el waterfall es viable. "Con un restaurante en Medellin pagando $3M de arriendo, se espera vender entre $15M y $25M al mes". Requiere datos historicos de proyectos cerrados.', done: false, valor: 5000000, quien: 'Claude AI (requiere datos historicos en Escala)' },
      { num: 'C6.17', nombre: 'IA FUTURA: Detector de sobrecosto en presupuesto. Cuando el emprendedor ingresa el precio de un equipo, la IA compara con precios de mercado y alerta si esta inflado mas del 30%. Protege al inversionista y da credibilidad al proyecto. Requiere scraping de precios o integracion con proveedores.', done: false, valor: 4000000, quien: 'Claude AI (requiere fuentes de precios)' },
      { num: 'C6.18', nombre: 'IA FUTURA: Copiloto de negociacion de terminos. Cuando fundador y angel estan negociando, la IA sugiere rangos razonables basados en proyectos similares cerrados en Escala. "Para un horno de $18M, los angeles tipicamente piden entre 8% y 15% de participacion". Requiere masa critica de deals cerrados en la plataforma.', done: false, valor: 5000000, quien: 'Claude AI (requiere datos historicos en Escala)' },
      { num: 'C6.19', nombre: 'IA FUTURA: Cotizador de equipos integrado. El emprendedor escribe el nombre del equipo y la IA busca 3 proveedores con precios reales y los agrega al presupuesto con un clic. Elimina la friccion de buscar precios externamente. Requiere integracion con marketplaces (Mercado Libre, proveedores industriales).', done: false, valor: 6000000, quien: 'Claude AI (requiere integracion proveedores)' },
    ]
  },
  {
    id: 'C7',
    titulo: 'CAPA 7 — Network Effects & Viralidad',
    descripcion: 'Los mecanismos que hacen que Escala crezca solo. Feed interno de proyectos, publicaciones del equipo, motor viral, invitaciones entre pares, comunidad, rankings y eventos del ecosistema.',
    color: '#6B7280',
    estado: 'pendiente',
    valor_total: 19000000,
    valor_hecho: 0,
    hitos: [
      { num: 'C7.1', nombre: 'Motor de publicaciones interno: feed de actualizaciones dentro de cada proyecto. Miembros publican avances, fotos, videos, documentos. Inversionistas y mentores comentan. LinkedIn interno por proyecto', done: false, valor: 8000000, quien: 'Claude AI' },
      { num: 'C7.2', nombre: 'Mecanismo proyecto exitoso → ecosistema: al cerrar exitosamente, fundador recibe beneficios por traer nuevos proyectos, especialistas quedan certificados, inversores tienen case study publico', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C7.3', nombre: 'Rankings publicos: top fundadores, top especialistas, top proyectos por sector y pais. Genera aspiracion y competencia sana dentro del ecosistema', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: 'C7.4', nombre: 'Eventos del ecosistema: demo days virtuales, pitch sessions, ruedas de negocios — dentro de la plataforma, no en herramientas externas', done: false, valor: 4000000, quien: 'Claude AI + Ivan' },
      { num: 'C7.5', nombre: 'Programa de referidos: usuario que trae un nuevo usuario que completa un proyecto recibe beneficios en comisiones o suscripcion', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
    ]
  },
  {
    id: 'C8',
    titulo: 'CAPA 8 — Expansion & Mercados',
    descripcion: 'La presencia de Escala en el mundo. SEO por pais, landing pages, blog, redes sociales, motor de publicacion automatica, localizacion por mercado y estrategia de entrada por pais.',
    color: '#4A90D9',
    estado: 'progreso',
    valor_total: 20400000,
    valor_hecho: 14400000,
    hitos: [
      { num: 'C8.1', nombre: 'Infraestructura SEO: robots.txt, sitemap.ts dinamico (proyectos activos + perfiles publicos), metadata global mejorada, OpenGraph, Twitter Cards, JSON-LD Organization + WebSite + SoftwareApplication', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C8.2', nombre: 'Imagen OG 1200x630px, verificacion Google Search Console, sitemap enviado a Google', done: true, valor: 500000, quien: 'Claude AI' },
      { num: 'C8.3', nombre: 'Landings Tier 1: /buscar-cofundador, /crear-empresa, /startup-colombia, /startup-mexico', done: true, valor: 2400000, quien: 'Claude AI' },
      { num: 'C8.4', nombre: 'Landings Tier 2: /angel-investor, /buscar-cto, /startup-chile, /startup-bogota, /startup-medellin, /startup-santiago, /desarrollador-startup-colombia, /latinos-usa, /locales-comerciales x3', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C8.5', nombre: 'Blog con articulos indexados: historia-de-escala, participacion-diferida, constituir-sas-colombia, startup-sin-dinero', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C8.6', nombre: 'Identidad visual — isotipo (escalon + punto), paleta #0B1628/#1D9E75/#8FA3CC, Inter 800. Assets SVG en public/brand/. Consistente en 30+ paginas', done: true, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C8.7', nombre: 'Motor de publicacion en redes — lib/redes-sociales/ con 4 modulos: metaGraphApi (Graph API v25), plantillas (16 editables), generarTarjeta (SVG→PNG), publicar (idempotencia, reintentos, auditoria)', done: true, valor: 3000000, quien: 'Claude AI' },
      { num: 'C8.8', nombre: 'Meta App configurada — App ID: 4534429656788672, permisos pages_manage_posts + instagram_content_publish. Pendiente: verificacion negocio Meta', done: true, valor: 500000, quien: 'Claude AI + Ivan' },
      { num: 'C8.9', nombre: 'Meta Business Verification — completar para mover la app a produccion. Requiere RUT o Camara de Comercio de Escala', done: false, valor: 0, quien: 'Ivan' },
      { num: 'C8.10', nombre: 'Username personalizado Facebook — cambiar profile.php?id=... por facebook.com/EscalaNetwork una vez la pagina tenga 100 seguidores', done: false, valor: 0, quien: 'Ivan' },
      { num: 'C8.11', nombre: 'Blog completo: 10 articulos adicionales por pais y sector (Colombia, Mexico, Chile, Espana)', done: true, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C8.12', nombre: 'SEO programatico: paginas generadas automaticamente por ciudad + industria + rol (ej: desarrollador-startup-bogota, contador-para-startups-medellin)', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C8.13', nombre: 'Hreflang y localizacion: indicadores de idioma/pais en todas las landing pages para SEO internacional', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: 'C8.14', nombre: 'Estrategia de entrada por pais: plan de landings, partners y SEO local para Espana, Argentina, Peru, Ecuador y USA Hispanic', done: false, valor: 0, quien: 'Ivan + Claude AI' },
    ]
  },
  {
    id: 'C9',
    titulo: 'CAPA 9 — Monetizacion & Modelo de Negocio',
    descripcion: 'Como Escala genera ingresos sostenibles: comisiones por transaccion, suscripciones Pro, Escala for Teams, white label, franquicias, revenue share con partners y fuentes de ingresos adicionales conforme crece el ecosistema.',
    color: '#1D9E75',
    estado: 'pendiente',
    valor_total: 23000000,
    valor_hecho: 0,
    hitos: [
      { num: 'C9.1', nombre: 'Comision por transaccion: 2-4% sobre cada pago ejecutado en el motor financiero — campo comision_escala ya existe en el ledger, solo falta activarlo en el flujo de ejecucion', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C9.2', nombre: 'Suscripcion Pro: plan de pago para fundadores con mas de 3 proyectos activos — acceso a IA matching, contratos ilimitados, analytics avanzados y soporte prioritario', done: false, valor: 3000000, quien: 'Claude AI' },
      { num: 'C9.3', nombre: 'Escala for Teams: plan empresarial para companias que quieran usar Escala para gestionar proyectos internos y proveedores externos — prerequisito: Capa 1 multi-tenant', done: false, valor: 5000000, quien: 'Claude AI' },
      { num: 'C9.4', nombre: 'Revenue share con partners: cuando un partner institucional (family office, cooperativa, empresa) trae inversores o especialistas, Escala comparte un % de las comisiones generadas', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C9.5', nombre: 'White label: empresas que quieran su propia instancia de Escala para gestionar proyectos internos — prerequisito: Capa 1 multi-tenant', done: false, valor: 8000000, quien: 'Claude AI + Ivan' },
      { num: 'C9.6', nombre: 'Comision sobre fondeo verificado: porcentaje sobre el capital que fluye a traves de la plataforma entre inversores y proyectos', done: false, valor: 2000000, quien: 'Claude AI' },
      { num: 'C9.7', nombre: 'Freemium a Pro: modelo de conversion — primer proyecto gratis, a partir del segundo se requiere suscripcion o pago por transaccion', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
    ]
  },
  {
    id: 'C10',
    titulo: 'CAPA 10 — Legal & Regulatorio',
    descripcion: 'El cumplimiento legal que permite a Escala operar en cada pais: contratos por jurisdiccion, firma digital, facturacion electronica, privacidad de datos (Ley 1581, GDPR), licencias financieras y regulacion especifica por mercado.',
    color: '#E05555',
    estado: 'progreso',
    valor_total: 47000000,
    valor_hecho: 2000000,
    hitos: [
      { num: 'C10.1', nombre: 'Politica de Privacidad — 11 secciones, Ley 1581 Colombia, requerida para Meta App Review y confianza de usuarios', done: true, valor: 500000, quien: 'Claude AI + Ivan' },
      { num: 'C10.2', nombre: 'Admin Escala parametrizable — CRUD completo de paises, industrias, tareas, especialidades, categorias sin deploy. Selectores dinamicos con opcion crear nuevo', done: true, valor: 1500000, quien: 'Claude AI' },
      { num: 'C10.3', nombre: 'Canal SMS — Twilio o Sinch para notificaciones criticas', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.4', nombre: 'Canal WhatsApp API oficial Meta', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.5', nombre: 'Firma digital — DocuSign/HelloSign integrado en el flujo de contratos', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.6', nombre: 'App movil — React Native o PWA para iOS y Android', done: false, valor: 15000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.7', nombre: 'Facturacion electronica DIAN (Colombia)', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.8', nombre: 'Facturacion electronica SAT (Mexico)', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.9', nombre: 'Facturacion electronica SII (Chile)', done: false, valor: 4000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.10', nombre: 'Licencia como intermediario financiero: analisis legal de si Escala requiere licencia de operador de servicios financieros en Colombia y otros paises cuando maneje capital de terceros', done: false, valor: 0, quien: 'Ivan (decision legal)' },
      { num: 'C10.11', nombre: 'KYC/AML: verificacion de identidad de inversores y fundadores para cumplimiento regulatorio cuando los montos superen umbrales legales por pais', done: false, valor: 5000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.12', nombre: 'GDPR y proteccion de datos: adaptacion de politicas, consentimientos y manejo de datos para expansion a Espana y Europa', done: false, valor: 3000000, quien: 'Claude AI + Ivan' },
      { num: 'C10.13', nombre: 'Regulacion por mercado: analisis de requisitos legales especificos para operar en Mexico, Chile, Peru, Ecuador, Argentina y Espana', done: false, valor: 0, quien: 'Ivan (decision legal)' },
    ]
  },
  {
    id: 'C11',
    titulo: 'CAPA 11 — Primera Campana: Las 10 Maquinas',
    descripcion: 'Campana viral modelo concurso publico. Escasez real: Ivan es el angel que financia 10 maquinas de confeccion para las mejores confeccionistas de Medellin. Big Idea: Gana tu maquina, no la pidas. Meta 500+ aplicantes, 50 finalistas publicas, votacion comunidad (30%) + evaluacion interna (70%), 10 ganadoras en Instagram Live. Las ganadoras son heroinas publicas en su gremio. Su historia es el activo de la segunda campana. Ninguno de los importadores existentes (Titus, Juki Colombia, Jack Colombia) tiene un programa asi — todos venden transaccionalmente sin financiamiento para el segmento informal.',
    color: '#D946EF',
    estado: 'pendiente',
    valor_total: 15000000,
    valor_hecho: 1000000,
    hitos: [
      { num: 'C11.1', nombre: 'Landing /maquinaria-confeccion-medellin CREADA. Hero: Tienes los pedidos. Te falta la maquina. Te la conseguimos. 3 pasos, ejemplo Maria overlock $8.5M, 6 tipos maquinas con marcas, CTA WhatsApp, FAQ. Sitemap prioridad 0.95.', done: true, valor: 1000000, quien: 'Claude AI' },
      { num: 'C11.2', nombre: 'Avatar Lorena: mujer 28-52, madre cabeza de familia, Belen/Robledo/Itagui, 1-3 maquinas, trabaja como satelite para marcas, produce 90u/mes podria hacer 180, ingreso $1.8M-$2.5M, rechazada 2x por bancos, activa en grupos WhatsApp de confeccionistas. Su dolor: tiene pedidos pero no da abasto.', done: false, valor: 0, quien: 'Ivan + Claude AI' },
      { num: 'C11.3', nombre: 'Marco del concurso: no es programa de ayuda, es competencia. 5 semanas: S1-2 aplicaciones → S3 50 finalistas publicas anunciadas → S4 videos 60s + votacion publica → S5 Instagram Live 10 ganadoras. Votacion: 30% comunidad + 70% evaluacion interna (pedidos verificados + viabilidad).', done: false, valor: 0, quien: 'Ivan + Claude AI' },
      { num: 'C11.4', nombre: 'Contador publico en landing: X aplicantes · 10 cupos. Tiempo real. Se cierra al llegar a 500 o al plazo. Hook principal ads: Solo estoy buscando 10 confeccionistas en Medellin. Segundo hook: Tengo $85 millones para comprar maquinas. El problema es que solo puedo elegir 10.', done: false, valor: 500000, quien: 'Claude AI' },
      { num: 'C11.5', nombre: 'Formulario de aplicacion con score automatico 0-100: nombre, ciudad, tipo de maquina, pedidos mensuales actuales, capacidad actual vs proyectada. WhatsApp inmediato: Lorena, recibimos tu aplicacion. Estas en la fila de 487 personas. Te confirmamos en 48h si pasas.', done: false, valor: 800000, quien: 'Claude AI' },
      { num: 'C11.6', nombre: 'Meta Ads TOFU $800K/semana: video 30-45s vertical. Audiencia: mujeres 28-52, Medellin + Valle de Aburra, intereses confeccion/maquinas coser/ropa interior/trabajo en casa. KPI: CTR 3%+, CPL menos $15K COP.', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.7', nombre: 'Meta Ads MOFU $600K/semana: retargeting 50%+ video + visitantes landing. Carrusel 3 pasos del modelo + contador aplicantes. Meta Ads BOFU $400K/semana: retargeting sin conversion. Story + historia aplicante real. Total pauta 2 semanas: ~$3.6M COP.', done: false, valor: 1000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.8', nombre: 'WhatsApp flow 5 semanas (Tomo 7): S1 confirmacion inmediata → S2 educacion modelo + historia Lorena → S3 si pasa a finalistas: notificacion especial → S4 recordatorio votacion → S5 resultado. Mantener engagement 500 aplicantes durante todo el proceso.', done: false, valor: 1000000, quien: 'Claude AI' },
      { num: 'C11.9', nombre: 'Semana 3: anuncio publico 50 finalistas en Instagram con nombres y ciudad. Cada finalista etiquetada — comparte que llego a la final. Sus clientas, familias y redes amplifican sin costo. Es el momento de mayor alcance organico de toda la campana.', done: false, valor: 500000, quien: 'Ivan + Claude AI' },
      { num: 'C11.10', nombre: 'Semana 4: las 50 finalistas entregan video 60s contando su historia (guion sugerido: quien soy, que hago, que maquina necesito, por que me la merezco). Votacion publica en Instagram stories o link. Videos circulan solos en grupos de confeccionistas de Medellin.', done: false, valor: 1000000, quien: 'Ivan + Claude AI' },
      { num: 'C11.11', nombre: 'Semana 5: Instagram Live anuncio 10 ganadoras. Ivan anuncia una por una. Las 10 firman proyecto en Escala esa semana. Contrato de leasing generado automaticamente. Ivan aprueba como angel. Maximo impacto mediatico del proceso.', done: false, valor: 500000, quien: 'Ivan' },
      { num: 'C11.12', nombre: 'Mes 2-3 documentar entregas (Tomo 9): video recibiendo maquina, primer dia produciendo, primer pedido cumplido con maquina nueva, numeros reales antes vs despues. Cada historia es un creativo para la segunda campana con CPL proyectado 40-60% menor.', done: false, valor: 2000000, quien: 'Ivan + Claude AI' },
      { num: 'C11.13', nombre: 'Contenido organico 30 piezas (Tomo 8): S1-2 lanzamiento (polls, Ivan explica, historia dramatizada banco que dijo no, contador) → S3 presentacion finalistas → S4 votacion → S5 ganadoras. Instagram + TikTok. Meta: 500 seguidores nuevos por semana.', done: false, valor: 1000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.14', nombre: 'Google Ads intencion de compra: maquina de coser industrial Medellin, maquina overlock precio Colombia, como comprar maquina sin credito, maquinas Juki Jack Medellin. Capturar quien ya busca activamente — son las mas calificadas.', done: false, valor: 1000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.15', nombre: 'Ronda 2 — Salon de belleza Medellin LANDING CREADA /equipos-salon-belleza-medellin: estilistas con silla propia o salon en casa. Avatar Sandra 25 clientas, no puede ofrecer tratamientos sin secadora casco $2.8M → cuota $98K/mes. Equipos: silla hidraulica, horno UV, secadora, cabina ozono, plancha vapor, camilla. Target Meta: mujeres 22-45 intereses peluqueria/nail art/cejas/extensiones.', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.16', nombre: 'Ronda 3 — Comida en el barrio Medellin LANDING CREADA /equipos-negocio-comida-medellin: empanadas, arepas, tamales, fritanga. Avatar Patricia 80 empanadas/dia → 250 con freidora $3.2M → cuota $112K/mes → ingreso adicional $7.6M/mes. Equipos: freidora, horno panadero, amasadora, estufa industrial, nevera, marmita. Target Meta: mujeres 28-55 comunas Belen/Robledo/Castilla/Manrique.', done: false, valor: 2000000, quien: 'Claude AI + Ivan' },
      { num: 'C11.17', nombre: 'KPIs y optimizacion semanal (Tomo 9): si CTR < 2% dia 3 cambiar hook. Si CPL > $25K revisar segmentacion. Si landing < 5% revisar headline. Si WhatsApp < 40% revisar confirmacion. Dashboard semanal. Cada ronda reduce CPL siguiente 40-60% con casos reales.', done: false, valor: 200000, quien: 'Claude AI + Ivan' },
      { num: 'C11.18', nombre: 'Alianzas como cliente mayorista con distribuidores por nicho. CONFECCION: Maicoser (Medellin, Juki/Jack/Typical/Siruba/Brother, maicoser.com), Distmaquinas (nacional, 16 anos, importador directo, distmaquinas.com), Maicol (Medellin, distribuidor oficial Juki Cra 44 #10Sur-76). BELLEZA: Humberto Botero (Medellin, equipos peluqueria/spa/sillas hidraulicas, humbertobotero.com), Mueble Belleza JB (Colombia, sillas hidraulicas fabricacion propia, mueblebellezajb.com), Fabrica Royal (Colombia, muebles peluqueria/spa hasta 3 anos garantia). COMIDA: Union Gastronomica/Inventto Group (Medellin/nacional, freidoras/hornos/refrigeracion, inventtogroup.com), Frionox (Colombia, cocinas industriales/camaras frigorificas, frionox.com), Industrial Taylor (30 anos experiencia, foodservice Colombia, industrialtaylor.com.co). Objetivo: precio mayorista en cada maquina financiada = margen adicional para Escala del 8-15% sobre el valor de cada equipo. Ivan negocia directamente como cliente recurrente con volumen proyectado.', done: false, valor: 3000000, quien: 'Ivan' },
    ]
  },
]

export default function Desarrollo() {
  const [capaAbierta, setCapaAbierta] = useState(null)
  const [soloLimpio, setSoloLimpio] = useState(false)

  const totalItems = CAPAS.reduce((s, c) => s + c.hitos.length, 0)
  const totalDone = CAPAS.reduce((s, c) => s + c.hitos.filter(h => h.done).length, 0)
  const totalPendiente = totalItems - totalDone
  const pct = Math.round((totalDone / totalItems) * 100)
  const totalValor = CAPAS.reduce((s, c) => s + c.valor_total, 0)
  const totalHecho = CAPAS.reduce((s, c) => s + c.valor_hecho, 0)
  const fmt = v => '$' + v.toLocaleString('es-CO')

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    header: { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', maxWidth: '960px', margin: '0 auto' },
    wrap: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' }}>Escala Network</div>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Roadmap Estrategico</h1>
            <p style={{ fontSize: '0.82rem', color: '#8FA3CC', maxWidth: '500px', lineHeight: '1.6' }}>10 capas permanentes. Cualquier funcionalidad nueva — hoy o en 10 anos — pertenece a una de estas capas.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <a href="/dashboard" style={{ fontSize: '0.75rem', color: '#1D9E75', textDecoration: 'none' }}>← Dashboard</a>
          </div>
        </div>

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
          {[
            { label: 'Items completados', valor: `${totalDone}/${totalItems}`, color: '#1D9E75' },
            { label: '% completado', valor: `${pct}%`, color: pct > 70 ? '#1D9E75' : '#E8A020' },
            { label: 'Pendientes', valor: totalPendiente, color: '#E8A020' },
            { label: 'Valor ejecutado', valor: fmt(totalHecho), color: '#4A90D9' },
            { label: 'Valor total', valor: fmt(totalValor), color: '#8FA3CC' },
          ].map(k => (
            <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: k.color, letterSpacing: '-0.02em' }}>{k.valor}</div>
              <div style={{ fontSize: '0.62rem', color: '#6B7280', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Barra de progreso global */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#1D9E75,#4A90D9)', borderRadius: '3px', transition: 'width 0.8s' }} />
          </div>
        </div>
      </div>

      <div style={s.wrap}>
        {/* Filtro */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setSoloLimpio(!soloLimpio)} style={{ background: soloLimpio ? 'rgba(224,85,85,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${soloLimpio ? 'rgba(224,85,85,0.4)' : 'rgba(255,255,255,0.12)'}`, color: soloLimpio ? '#E05555' : '#8FA3CC', borderRadius: '8px', padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {soloLimpio ? 'Mostrando solo pendientes' : 'Mostrar solo pendientes'}
          </button>
        </div>

        {/* Capas */}
        {CAPAS.map((capa, idx) => {
          const done = capa.hitos.filter(h => h.done).length
          const total = capa.hitos.length
          const pctCapa = Math.round((done / total) * 100)
          const abierta = capaAbierta === capa.id
          const itemsFiltrados = soloLimpio ? capa.hitos.filter(h => !h.done) : capa.hitos
          if (soloLimpio && itemsFiltrados.length === 0) return null

          return (
            <div key={capa.id} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '14px', overflow: 'hidden', borderLeft: `3px solid ${capa.color}` }}>
              {/* Header de capa */}
              <div onClick={() => setCapaAbierta(abierta ? null : capa.id)} style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: `${capa.color}22`, color: capa.color, padding: '2px 8px', borderRadius: '10px', border: `1px solid ${capa.color}44` }}>{capa.id}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{capa.titulo}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: '1.5', maxWidth: '600px' }}>{capa.descripcion}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: pctCapa === 100 ? '#1D9E75' : pctCapa > 0 ? '#E8A020' : '#6B7280' }}>{done}/{total}</div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>{pctCapa}% hecho</div>
                  </div>
                  <span style={{ color: '#6B7280', fontSize: '1rem', transition: 'transform 0.2s', display: 'inline-block', transform: abierta ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>

              {/* Barra de progreso de la capa */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', margin: '0 1.25rem' }}>
                <div style={{ height: '100%', width: `${pctCapa}%`, background: capa.color, transition: 'width 0.5s' }} />
              </div>

              {/* Items */}
              {abierta && (
                <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                  {itemsFiltrados.map(h => (
                    <div key={h.num} style={{ display: 'flex', gap: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>{h.done ? '✅' : '⏳'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: capa.color, background: `${capa.color}15`, padding: '1px 6px', borderRadius: '8px' }}>{h.num}</span>
                          {h.valor > 0 && <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>${h.valor.toLocaleString('es-CO')}</span>}
                          <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>{h.quien}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: h.done ? '#9CA3AF' : '#C8D4E8', lineHeight: '1.5' }}>{h.nombre}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
