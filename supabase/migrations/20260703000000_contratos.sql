-- Agregar sub_especialidad a roles
ALTER TABLE "public"."roles"
  ADD COLUMN IF NOT EXISTS "sub_especialidad" "text";

-- Tabla de contratos generados automáticamente al aceptar una postulación
CREATE TABLE IF NOT EXISTS "public"."contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "postulacion_id" "uuid" NOT NULL,
    "rol_id" "uuid" NOT NULL,
    "fundador_id" "uuid" NOT NULL,
    "profesional_id" "uuid" NOT NULL,
    "modalidad" "text" NOT NULL DEFAULT 'riesgo_compartido',
    "valor" bigint NOT NULL DEFAULT 0,
    "sub_especialidad" "text",
    "estado" "text" NOT NULL DEFAULT 'pendiente_firma',
    "firmado_fundador" boolean DEFAULT false,
    "firmado_profesional" boolean DEFAULT false,
    "fecha_firma_fundador" timestamp with time zone,
    "fecha_firma_profesional" timestamp with time zone,
    "contenido_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contratos_estado_check" CHECK (("estado" = ANY (ARRAY[
        'pendiente_firma', 'firmado_parcial', 'vigente', 'completado', 'cancelado'
    ]))),
    CONSTRAINT "contratos_proyecto_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE,
    CONSTRAINT "contratos_postulacion_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "public"."postulaciones"("id") ON DELETE CASCADE,
    CONSTRAINT "contratos_fundador_fkey" FOREIGN KEY ("fundador_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE,
    CONSTRAINT "contratos_profesional_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."contratos" OWNER TO "postgres";
ALTER TABLE "public"."contratos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contratos_visible_partes" ON "public"."contratos" FOR SELECT USING (true);
GRANT ALL ON TABLE "public"."contratos" TO "anon";
GRANT ALL ON TABLE "public"."contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."contratos" TO "service_role";

CREATE INDEX IF NOT EXISTS "contratos_proyecto_idx" ON "public"."contratos" ("proyecto_id");
CREATE INDEX IF NOT EXISTS "contratos_profesional_idx" ON "public"."contratos" ("profesional_id");
CREATE INDEX IF NOT EXISTS "contratos_fundador_idx" ON "public"."contratos" ("fundador_id");
