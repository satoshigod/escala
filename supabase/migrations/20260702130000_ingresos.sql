-- Tabla de ingresos del proyecto (ventas, contratos, negocios generados)
-- Separada de aportes — aportes es lo que entra al proyecto (trabajo/capital/servicios),
-- ingresos es lo que el proyecto genera hacia afuera (ventas, clientes, contratos).

CREATE TABLE IF NOT EXISTS "public"."ingresos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "registrado_por" "uuid" NOT NULL,
    "descripcion" "text" NOT NULL,
    "valor" bigint NOT NULL,
    "fecha" "date" NOT NULL DEFAULT CURRENT_DATE,
    "tipo" "text" NOT NULL DEFAULT 'venta'::"text",
    "comprobante" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ingresos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ingresos_tipo_check" CHECK (("tipo" = ANY (ARRAY['venta'::"text", 'contrato'::"text", 'servicio'::"text", 'otro'::"text"]))),
    CONSTRAINT "ingresos_proyecto_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE,
    CONSTRAINT "ingresos_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."ingresos" OWNER TO "postgres";

CREATE INDEX IF NOT EXISTS "ingresos_proyecto_idx" ON "public"."ingresos" ("proyecto_id", "fecha" DESC);

ALTER TABLE "public"."ingresos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingresos_visible_proyecto" ON "public"."ingresos" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."ingresos" TO "anon";
GRANT ALL ON TABLE "public"."ingresos" TO "authenticated";
GRANT ALL ON TABLE "public"."ingresos" TO "service_role";
