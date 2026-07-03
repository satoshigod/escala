-- Agregar campos para el flujo de propuestas de especialidades/roles por fundadores
ALTER TABLE "public"."especialidades"
  ADD COLUMN IF NOT EXISTS "aprobado" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "propuesto_por" "uuid" REFERENCES "public"."perfiles"("id") ON DELETE SET NULL;

-- Las especialidades existentes quedan aprobadas
UPDATE "public"."especialidades" SET "aprobado" = true WHERE "aprobado" IS NULL;
