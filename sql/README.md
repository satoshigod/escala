# Migraciones SQL de Escala

Todas las migraciones van **nombradas** (nunca "untitled query") y en orden
cronologico: `AAAA-MM-DD_descripcion_en_snake_case.sql`.

## Como aplicar

- **Preferido:** dejar que Claude las aplique via el conector de Supabase
  (`apply_migration`), que las registra en `supabase_migrations.schema_migrations`
  con nombre y version.
- **Manual:** pegar en el editor SQL de Supabase. Si se hace asi, el cambio NO
  queda en el historial de migraciones; hay que dejar el archivo aqui igual
  para que exista el registro.

## Convenciones

- DDL siempre idempotente: `IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`.
- Nunca borrar datos en una migracion sin una linea de respaldo previa.
- Los valores tecnicos (ids de escenario, estados de enums) no se renombran
  sin migracion de datos + periodo de compatibilidad (ver `otro` -> `maquinaria`).

## Historial

| Archivo | Que hace | Aplicada |
| --- | --- | --- |
| `2026-07-21_custodia_ordenes_pago.sql` | Tabla `ordenes_pago` (maquina de estados de custodia) + RLS | manual |
| `2026-07-21_local_comercial_columnas.sql` | `operador_id`, `inversionista_id`, `estado` + CHECK + backfill | manual |
| `2026-07-22_reparto_lineas_estado_en_pago.sql` | CHECK de `reparto_lineas.estado` acepta `en_pago` | conector |
| `2026-07-22_proyectos_escenario_maquinaria.sql` | CHECK de `proyectos.escenario` acepta `maquinaria` | conector |
| `2026-07-22_perfiles_rol_mentor_empresa.sql` | CHECK de `perfiles.rol_principal` acepta `mentor` y `empresa` | conector |
