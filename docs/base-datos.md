# Base de datos

> Documento vivo. Última actualización: 2026-07-22
> Proyecto Supabase: `avrjgcitrgziiweirzfe` (PostgreSQL 17) · **45 tablas, todas con RLS activo**

## Cómo verificar antes de escribir código

Los bugs más caros de este sistema vinieron de **asumir** nombres de columna. Antes de escribir un `insert` o `update`, verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'la_tabla' ORDER BY ordinal_position;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint WHERE conrelid = 'la_tabla'::regclass;
```

---

## Identidad

**`perfiles`** (23 cols) — `id` **es** `auth.uid()`, no hay columna `user_id` separada.

`rol_principal` acepta: `ideador`, `capitalista`, `especialista`, `ejecutor`, `angel`, `mentor`, `empresa`.

> ⚠️ Hasta el 22-jul el CHECK solo aceptaba 5 y **Mentor y Empresa no se podían guardar**, aunque el onboarding los ofrecía. Corregido en `perfiles_rol_principal_mentor_empresa`.

---

## Proyectos

**`proyectos`** (18 cols)
- `escenario` ∈ `startup`, `local_comercial`, `maquinaria`, `otro` (legacy)
- `tipo` ∈ `A`, `B` — **NOT NULL**
- `estado` ∈ `borrador`, `activo`, `pausado`, `completado`, `cancelado`

> ⚠️ El CHECK no aceptaba `maquinaria` hasta el 22-jul: crear un proyecto de maquinaria fallaba en producción tras la migración del id. Corregido.

**`presupuesto_items`** (26 cols) — `valor_total` es **columna generada** (`cantidad * valor_unitario`). No se puede escribir.

---

## Motor financiero

### `ledger_entries` (17 cols) — el corazón

Contabilidad de doble partida. **Inmutable**: sin DELETE ni UPDATE.

| Columna | Detalle |
| --- | --- |
| `tipo` | enum `tipo_ledger` = **solo** `debito` \| `credito` |
| `referencia_tipo` | ⚠️ **NO** es `tipo_referencia` |
| `tasa_usd` | **NOT NULL** — omitirla revienta el insert |
| `monto_usd` | calculado |
| `idempotency_key` | único |
| `metadata` | jsonb — aquí va info extra como la comisión |

> ⚠️ **Estos cuatro detalles causaron que ninguna comisión de Escala se registrara nunca.** 10 inserts en 6 APIs usaban `tipo_referencia`, no pasaban `tasa_usd`, mandaban `comision_escala` como columna (no existe) y usaban `tipo: 'comision'` (inválido). Fallaban en silencio por `.catch(() => {})`. Corregido el 22-jul.

**Preferir siempre `registrarMovimiento()`** de `lib/financiero/ledger.js` sobre inserts directos: ese helper ya mapea todo bien.

### `ordenes_pago` (24 cols) — custodia

```
pendiente_pago → pago_reportado → en_custodia → pago_emitido → completado
                                                            ↘ cancelado
```

`tipo_flujo` ∈ `local_repago`, `compra_maquina`, `arriendo`, `fondeo`, `reparto`.

Cada orden genera **dos asientos**: `custodia_in_{id}` y `custodia_out_{id}`.

### `wallets` · `fondeos` · `payment_requests` · `financial_audit`

`financial_audit` **no tiene** `tasa_usd` (a diferencia de `ledger_entries`).

---

## Local comercial

**`proyectos_local_comercial`** (39 cols)

- `fase_actual` ∈ `repago`, `regalia`, `libre`
- `estado` ∈ `borrador`, `buscando_inversionista`, `esperando_capital`, `activo`, `cerrado`
- `estado_verificacion` ∈ `en_verificacion`, `aprobado`, `rechazado`

> ⚠️ Las columnas `operador_id`, `inversionista_id` y `estado` **no existían** hasta el 21-jul. El panel del inversionista filtraba por `estado='activo'` sobre una columna inexistente: siempre salía vacío.

**`reportes_diarios_local`** (17 cols) — persiste `intereses_dia`, `abono_capital` y `pago_inversionista`.

---

## Leasing y programa

**`contratos_leasing`** (32 cols)

```
borrador → pendiente_angel → activo → equipo_comprado → entregado
→ en_operacion → [en_mora ⇄ reestructurado] → liquidado
                                    ↘ recuperacion
```

Columna del número: **`numero_contrato`**, no `numero`.

**`solicitudes_programa`** (32 cols) — máquina de estados de la solicitud, con `score`, `banda` y `score_detalle` (jsonb).

**`proveedores_equipo`** (11 cols) — 9 distribuidores sembrados en 3 categorías.

**`entregas_equipo`** (14 cols) — cadena física: compra, entrega, capacitación, serial real.

---

## Reparto

**`reparto_lineas`** (10 cols) — `estado` ∈ `pendiente`, `en_pago`, `pagado`.

> ⚠️ `en_pago` no existía hasta el 22-jul; el modelo de custodia lo escribe y **habría fallado con violación de constraint en producción**.

---

## Seguridad

**Las 45 tablas tienen RLS activo.** Estado tras la auditoría del 22-jul:

- `impulsos` y `postulaciones` tienen RLS **sin políticas**: quedan cerradas al cliente y solo accesibles vía API con service role. Es seguro por diseño.
- Las vistas `wallet_balances` y `wallet_comprometido` pasaron a `security_invoker` — antes eran `SECURITY DEFINER` y **exponían el saldo de todos los usuarios**.
- Las funciones de trigger ya no son invocables por REST. `crear_wallet_si_no_existe` era `SECURITY DEFINER` y **creaba wallets sin login**.
- El bucket `evidencias` ya no permite listar ni subir anónimamente.

**Funciones existentes:** `calcular_escala_score(uuid)`, `crear_wallet_si_no_existe(...)`, `tasa_del_dia(moneda)`, más 4 de trigger.

> ⚠️ `eliminar_usuario_completo()` **no existe** en la base, pero `/qa` la invoca. Falla en silencio: esa limpieza nunca funcionó.

---

## Migraciones

En `sql/`, nombradas `AAAA-MM-DD_descripcion.sql`. Las aplicadas por conector quedan en `supabase_migrations.schema_migrations`; las corridas a mano en el editor **no**, por eso se documentan igual en el repo.

**Regla:** DDL siempre idempotente (`IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`). Nunca renombrar valores técnicos sin expand-migrate-contract.
