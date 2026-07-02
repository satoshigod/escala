-- Nuevo modelo de compensación — reemplaza el sistema de Carriles A/B/C
-- (que nunca llegó a persistirse: /carril mostraba el carril en pantalla pero
-- jamás se guardaba en ningún campo real, así que no hay datos que migrar)

-- 1. Estado de financiación del proyecto (el toggle que declara el fundador al crear)
ALTER TABLE "public"."proyectos"
  ADD COLUMN IF NOT EXISTS "estado_financiacion" "text" DEFAULT 'riesgo_compartido'::"text";

ALTER TABLE "public"."proyectos"
  ADD CONSTRAINT "proyectos_estado_financiacion_check"
  CHECK (("estado_financiacion" = ANY (ARRAY['con_recursos'::"text", 'riesgo_compartido'::"text"])));

-- 2. Cumplimiento y forma de pago, a nivel de postulación (persona + rol + proyecto)
ALTER TABLE "public"."postulaciones"
  ADD COLUMN IF NOT EXISTS "cumplio" boolean,
  ADD COLUMN IF NOT EXISTS "cumplio_confirmado_por" "uuid",
  ADD COLUMN IF NOT EXISTS "cumplio_confirmado_en" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "forma_pago" "text";

ALTER TABLE "public"."postulaciones"
  ADD CONSTRAINT "postulaciones_forma_pago_check"
  CHECK (("forma_pago" IS NULL) OR ("forma_pago" = ANY (ARRAY['cash'::"text", 'acciones'::"text", 'pasivo'::"text"])));

-- 3. Registro de deuda pendiente — lo que se acumula bajo Riesgo Compartido
CREATE TABLE IF NOT EXISTS "public"."deuda_pendiente" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "postulacion_id" "uuid" NOT NULL,
    "beneficiario_id" "uuid" NOT NULL,
    "concepto" "text" NOT NULL,
    "valor" bigint DEFAULT 0 NOT NULL,
    "forma_pago" "text" NOT NULL,
    "resuelta" boolean DEFAULT false NOT NULL,
    "resuelta_como" "text",
    "resuelta_en" timestamp with time zone,
    "resuelta_por" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "deuda_forma_pago_check" CHECK (("forma_pago" = ANY (ARRAY['acciones'::"text", 'pasivo'::"text"]))),
    CONSTRAINT "deuda_resuelta_como_check" CHECK (("resuelta_como" IS NULL) OR ("resuelta_como" = ANY (ARRAY['cash'::"text", 'acciones'::"text"])))
);
ALTER TABLE "public"."deuda_pendiente" OWNER TO "postgres";

ALTER TABLE ONLY "public"."deuda_pendiente" ADD CONSTRAINT "deuda_pendiente_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."deuda_pendiente" ADD CONSTRAINT "deuda_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deuda_pendiente" ADD CONSTRAINT "deuda_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "public"."postulaciones"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deuda_pendiente" ADD CONSTRAINT "deuda_beneficiario_id_fkey" FOREIGN KEY ("beneficiario_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "deuda_proyecto_idx" ON "public"."deuda_pendiente" ("proyecto_id", "resuelta");
-- Ordena "lo más pequeño primero" por defecto — así el ángel ve lo básico (contador/abogado)
-- arriba de la lista al decidir qué pagar primero.
CREATE INDEX IF NOT EXISTS "deuda_valor_idx" ON "public"."deuda_pendiente" ("proyecto_id", "valor" ASC);

ALTER TABLE "public"."deuda_pendiente" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deuda_visible_proyecto" ON "public"."deuda_pendiente" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."deuda_pendiente" TO "anon";
GRANT ALL ON TABLE "public"."deuda_pendiente" TO "authenticated";
GRANT ALL ON TABLE "public"."deuda_pendiente" TO "service_role";
