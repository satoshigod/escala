-- Agregar estado 'retirada' a postulaciones (cuando el especialista desiste)
ALTER TABLE "public"."postulaciones"
  DROP CONSTRAINT IF EXISTS "postulaciones_estado_check";

ALTER TABLE "public"."postulaciones"
  ADD CONSTRAINT "postulaciones_estado_check"
  CHECK (("estado" = ANY (ARRAY[
    'pendiente'::"text",
    'aceptada'::"text",
    'rechazada'::"text",
    'retirada'::"text"
  ])));
