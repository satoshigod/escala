-- Fase 17 — Sistema de Notificaciones Multicanal
-- Tablas base: notificaciones (in-app), push_subscriptions (Web Push), preferencias_notificacion

CREATE TABLE IF NOT EXISTS "public"."notificaciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "destinatario_id" "uuid" NOT NULL,
    "tipo" "text" NOT NULL,
    "modulo" "text",
    "prioridad" "text" DEFAULT 'media'::"text" NOT NULL,
    "titulo" "text",
    "mensaje" "text" NOT NULL,
    "link" "text",
    "icon" "text",
    "color" "text",
    "leido" boolean DEFAULT false NOT NULL,
    "datos" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notificaciones_prioridad_check" CHECK (("prioridad" = ANY (ARRAY['critica'::"text", 'alta'::"text", 'media'::"text", 'baja'::"text"])))
);
ALTER TABLE "public"."notificaciones" OWNER TO "postgres";

ALTER TABLE ONLY "public"."notificaciones" ADD CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."notificaciones" ADD CONSTRAINT "notificaciones_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "notificaciones_destinatario_leido_idx" ON "public"."notificaciones" ("destinatario_id", "leido");
CREATE INDEX IF NOT EXISTS "notificaciones_destinatario_created_idx" ON "public"."notificaciones" ("destinatario_id", "created_at" DESC);

ALTER TABLE "public"."notificaciones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificaciones_propias_select" ON "public"."notificaciones" FOR SELECT USING (("auth"."uid"() = "destinatario_id"));
CREATE POLICY "notificaciones_propias_update" ON "public"."notificaciones" FOR UPDATE USING (("auth"."uid"() = "destinatario_id"));

GRANT ALL ON TABLE "public"."notificaciones" TO "anon";
GRANT ALL ON TABLE "public"."notificaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."notificaciones" TO "service_role";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notificaciones";


-- push_subscriptions — una fila por dispositivo/navegador suscrito a Web Push
CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";

ALTER TABLE ONLY "public"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");
ALTER TABLE ONLY "public"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;

ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_subscriptions_propias" ON "public"."push_subscriptions" USING (("auth"."uid"() = "usuario_id"));

GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";


-- preferencias_notificacion — toggle global de email/push por usuario (v1: no es por-tipo-de-evento todavía)
CREATE TABLE IF NOT EXISTS "public"."preferencias_notificacion" (
    "usuario_id" "uuid" NOT NULL,
    "email_activo" boolean DEFAULT true NOT NULL,
    "push_activo" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."preferencias_notificacion" OWNER TO "postgres";

ALTER TABLE ONLY "public"."preferencias_notificacion" ADD CONSTRAINT "preferencias_notificacion_pkey" PRIMARY KEY ("usuario_id");
ALTER TABLE ONLY "public"."preferencias_notificacion" ADD CONSTRAINT "preferencias_notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;

ALTER TABLE "public"."preferencias_notificacion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preferencias_propias" ON "public"."preferencias_notificacion" USING (("auth"."uid"() = "usuario_id"));

GRANT ALL ON TABLE "public"."preferencias_notificacion" TO "anon";
GRANT ALL ON TABLE "public"."preferencias_notificacion" TO "authenticated";
GRANT ALL ON TABLE "public"."preferencias_notificacion" TO "service_role";
