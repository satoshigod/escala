-- =============================================================================
-- PROYECTOS — escenario 'maquinaria'
-- El escenario de maquinaria migro de 'otro' a 'maquinaria' (hallazgo #8 de la
-- auditoria UX v2), pero el CHECK seguia aceptando solo el id viejo: crear un
-- proyecto de maquinaria habria fallado en produccion.
-- Se conserva 'otro' por compatibilidad con datos historicos.
-- Aplicada via conector (migracion: proyectos_escenario_maquinaria).
-- =============================================================================

ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_escenario_check;

ALTER TABLE proyectos
  ADD CONSTRAINT proyectos_escenario_check
  CHECK (escenario = ANY (ARRAY['startup'::text, 'local_comercial'::text, 'maquinaria'::text, 'otro'::text]));
