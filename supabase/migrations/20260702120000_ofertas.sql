-- Sistema de Ofertas — distingue "yo apliqué" (postulante) de "me invitaron" (fundador)

ALTER TABLE "public"."postulaciones"
  ADD COLUMN IF NOT EXISTS "origen" "text" DEFAULT 'postulante'::"text";

ALTER TABLE "public"."postulaciones"
  ADD CONSTRAINT "postulaciones_origen_check"
  CHECK (("origen" = ANY (ARRAY['postulante'::"text", 'fundador'::"text"])));
