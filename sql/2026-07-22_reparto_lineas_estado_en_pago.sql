-- =============================================================================
-- REPARTO — estado intermedio 'en_pago'
-- El modelo de custodia introduce un paso intermedio: la linea deja de estar
-- 'pendiente' cuando nace la orden de pago, pero solo queda 'pagado' cuando el
-- beneficiario confirma que recibio. Sin 'en_pago' el flujo violaba el CHECK.
-- Aplicada via conector (migracion: reparto_lineas_estado_en_pago).
-- =============================================================================

ALTER TABLE reparto_lineas DROP CONSTRAINT IF EXISTS reparto_lineas_estado_check;

ALTER TABLE reparto_lineas
  ADD CONSTRAINT reparto_lineas_estado_check
  CHECK (estado = ANY (ARRAY['pendiente'::text, 'en_pago'::text, 'pagado'::text]));
