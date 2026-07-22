-- =============================================================================
-- LOCAL COMERCIAL — columnas que faltaban
-- La tabla no tenia operador_id, inversionista_id ni estado. El flujo de
-- "un inversionista financia un local" las necesita, y el panel del
-- inversionista ya estaba roto: filtraba por .eq('estado','activo') sobre una
-- columna inexistente, por eso siempre salia vacio.
-- Aplicada manualmente por Ivan el 2026-07-21.
-- =============================================================================

ALTER TABLE proyectos_local_comercial
  ADD COLUMN IF NOT EXISTS operador_id      uuid REFERENCES perfiles(id),
  ADD COLUMN IF NOT EXISTS inversionista_id uuid REFERENCES perfiles(id),
  ADD COLUMN IF NOT EXISTS estado           text NOT NULL DEFAULT 'borrador';

-- Ciclo de vida del local:
--   borrador -> buscando_inversionista (al aprobarse)
--            -> esperando_capital      (un inversionista lo toma)
--            -> activo                 (Escala pago el deposito/arriendo)
--            -> cerrado
ALTER TABLE proyectos_local_comercial
  DROP CONSTRAINT IF EXISTS proyectos_local_comercial_estado_check;

ALTER TABLE proyectos_local_comercial
  ADD CONSTRAINT proyectos_local_comercial_estado_check
  CHECK (estado = ANY (ARRAY['borrador','buscando_inversionista','esperando_capital','activo','cerrado']));

-- Backfill: el operador es el fundador del proyecto
UPDATE proyectos_local_comercial l
SET operador_id = p.fundador_id
FROM proyectos p
WHERE l.proyecto_id = p.id AND l.operador_id IS NULL;

-- Los locales ya aprobados salen a buscar inversionista
UPDATE proyectos_local_comercial
SET estado = 'buscando_inversionista'
WHERE estado_verificacion = 'aprobado' AND inversionista_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_local_inversionista ON proyectos_local_comercial(inversionista_id);
CREATE INDEX IF NOT EXISTS idx_local_estado        ON proyectos_local_comercial(estado);
