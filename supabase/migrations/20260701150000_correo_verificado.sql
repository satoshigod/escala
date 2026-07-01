-- Verificación de correo no-bloqueante (independiente del "Confirm email" de Supabase Auth,
-- que se deja apagado para no interrumpir el registro). Este flag es solo informativo/UI.

ALTER TABLE "public"."perfiles" ADD COLUMN IF NOT EXISTS "correo_verificado" boolean DEFAULT false;

-- Usuarios que ya existían antes de este cambio quedan marcados como verificados,
-- para no mostrarles de golpe un aviso de "confirma tu correo" que nunca se les pidió.
UPDATE "public"."perfiles" SET "correo_verificado" = true WHERE "correo_verificado" IS DISTINCT FROM true;
