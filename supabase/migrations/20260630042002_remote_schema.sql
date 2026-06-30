


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calcular_escala_score"("perfil_uuid" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  puntos int := 0;
  tareas_verificadas int;
  aportes_validados int;
  postulaciones_aceptadas int;
BEGIN
  SELECT COUNT(*) INTO tareas_verificadas
  FROM public.tareas WHERE asignado_a = perfil_uuid AND estado = 'verificada';

  SELECT COUNT(*) INTO aportes_validados
  FROM public.aportes WHERE aportante_id = perfil_uuid AND validado = true;

  SELECT COUNT(*) INTO postulaciones_aceptadas
  FROM public.postulaciones WHERE postulante_id = perfil_uuid AND estado = 'aceptada';

  puntos := (tareas_verificadas * 10) + (aportes_validados * 15) + (postulaciones_aceptadas * 20);

  UPDATE public.perfiles SET escala_score = puntos WHERE id = perfil_uuid;

  RETURN puntos;
END;
$$;


ALTER FUNCTION "public"."calcular_escala_score"("perfil_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.perfiles (id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Usuario'),
    new.email
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."aportes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "aportante_id" "uuid" NOT NULL,
    "rol_id" "uuid",
    "tipo" "text" NOT NULL,
    "descripcion" "text" NOT NULL,
    "valor" bigint DEFAULT 0 NOT NULL,
    "fecha" "date" DEFAULT CURRENT_DATE NOT NULL,
    "evidencia_url" "text",
    "validado" boolean DEFAULT false,
    "validado_por" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "aportes_tipo_check" CHECK (("tipo" = ANY (ARRAY['horas'::"text", 'entregable'::"text", 'capital'::"text", 'activo'::"text", 'contacto'::"text"])))
);


ALTER TABLE "public"."aportes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contratos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "rol_id" "uuid" NOT NULL,
    "especialista_id" "uuid" NOT NULL,
    "carril" "text",
    "valor_acordado" bigint DEFAULT 0,
    "modalidad" "text" NOT NULL,
    "condiciones" "text",
    "firmado" boolean DEFAULT false,
    "fecha_firma" "date",
    "url_documento" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contratos_carril_check" CHECK (("carril" = ANY (ARRAY['A'::"text", 'B'::"text", 'C'::"text"])))
);


ALTER TABLE "public"."contratos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."especialidades" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "categoria" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."especialidades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."historial_tareas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tarea_id" "uuid",
    "proyecto_id" "uuid",
    "accion" "text" NOT NULL,
    "realizado_por" "uuid",
    "descripcion" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."historial_tareas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hitos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "completado" boolean DEFAULT false,
    "fecha_completado" "date",
    "evidencia_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hitos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."impulsos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "angel_id" "uuid" NOT NULL,
    "hito_id" "uuid",
    "descripcion" "text" NOT NULL,
    "valor" bigint NOT NULL,
    "ejecutado" boolean DEFAULT false,
    "fecha_ejecutado" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."impulsos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."industrias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "tareas" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."industrias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mensajes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid",
    "autor_id" "uuid",
    "contenido" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mensajes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."paises_regulatorios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "bandera" "text",
    "tareas" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."paises_regulatorios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles" (
    "id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "email" "text" NOT NULL,
    "ciudad" "text",
    "whatsapp" "text",
    "rol_principal" "text",
    "especialidad" "text",
    "lo_que_aporto" "text",
    "lo_que_busco" "text",
    "escala_score" integer DEFAULT 0,
    "proyectos_completados" integer DEFAULT 0,
    "proyectos_abandonados" integer DEFAULT 0,
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "es_admin" boolean DEFAULT false,
    "pais" "text",
    CONSTRAINT "perfiles_rol_principal_check" CHECK (("rol_principal" = ANY (ARRAY['ideador'::"text", 'capitalista'::"text", 'especialista'::"text", 'ejecutor'::"text", 'angel'::"text"])))
);


ALTER TABLE "public"."perfiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."postulaciones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "rol_id" "uuid" NOT NULL,
    "postulante_id" "uuid" NOT NULL,
    "mensaje" "text",
    "estado" "text" DEFAULT 'pendiente'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "postulaciones_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'aceptada'::"text", 'rechazada'::"text"])))
);


ALTER TABLE "public"."postulaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proyectos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "fundador_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text" NOT NULL,
    "tipo" "text" NOT NULL,
    "sector" "text",
    "ciudad" "text",
    "estado" "text" DEFAULT 'borrador'::"text",
    "capital_necesario" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "industria" "text",
    "pais" "text",
    CONSTRAINT "proyectos_estado_check" CHECK (("estado" = ANY (ARRAY['borrador'::"text", 'activo'::"text", 'en_ejecucion'::"text", 'operando'::"text", 'cerrado'::"text"]))),
    CONSTRAINT "proyectos_tipo_check" CHECK (("tipo" = ANY (ARRAY['A'::"text", 'B'::"text"])))
);


ALTER TABLE "public"."proyectos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "tipo_aporte" "text" NOT NULL,
    "valor_mercado" bigint DEFAULT 0,
    "modalidad" "text" NOT NULL,
    "estado" "text" DEFAULT 'abierto'::"text",
    "es_prioritario" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roles_estado_check" CHECK (("estado" = ANY (ARRAY['abierto'::"text", 'en_negociacion'::"text", 'cubierto'::"text"]))),
    CONSTRAINT "roles_modalidad_check" CHECK (("modalidad" = ANY (ARRAY['equity'::"text", 'deuda_diferida'::"text", 'success_fee'::"text", 'hibrido'::"text", 'regalias'::"text", 'bonos_hitos'::"text", 'nueva_unidad'::"text", 'convertible'::"text"]))),
    CONSTRAINT "roles_tipo_aporte_check" CHECK (("tipo_aporte" = ANY (ARRAY['capital'::"text", 'servicio'::"text", 'tiempo'::"text", 'activo'::"text", 'conocimiento'::"text"])))
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tareas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid",
    "rol_nombre" "text",
    "asignado_a" "uuid",
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "categoria" "text",
    "estado" "text" DEFAULT 'pendiente'::"text",
    "creado_por" "uuid",
    "razon_creacion" "text",
    "completado_at" timestamp with time zone,
    "verificado_at" timestamp with time zone,
    "verificado_por" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tareas_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'en_progreso'::"text", 'completada'::"text", 'verificada'::"text"])))
);


ALTER TABLE "public"."tareas" OWNER TO "postgres";


ALTER TABLE ONLY "public"."aportes"
    ADD CONSTRAINT "aportes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."especialidades"
    ADD CONSTRAINT "especialidades_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."especialidades"
    ADD CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historial_tareas"
    ADD CONSTRAINT "historial_tareas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hitos"
    ADD CONSTRAINT "hitos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."impulsos"
    ADD CONSTRAINT "impulsos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."industrias"
    ADD CONSTRAINT "industrias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."paises_regulatorios"
    ADD CONSTRAINT "paises_regulatorios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."postulaciones"
    ADD CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."postulaciones"
    ADD CONSTRAINT "postulaciones_rol_id_postulante_id_key" UNIQUE ("rol_id", "postulante_id");



ALTER TABLE ONLY "public"."proyectos"
    ADD CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tareas"
    ADD CONSTRAINT "tareas_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "set_updated_at_perfiles" BEFORE UPDATE ON "public"."perfiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_proyectos" BEFORE UPDATE ON "public"."proyectos" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."aportes"
    ADD CONSTRAINT "aportes_aportante_id_fkey" FOREIGN KEY ("aportante_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."aportes"
    ADD CONSTRAINT "aportes_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."aportes"
    ADD CONSTRAINT "aportes_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."aportes"
    ADD CONSTRAINT "aportes_validado_por_fkey" FOREIGN KEY ("validado_por") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_especialista_id_fkey" FOREIGN KEY ("especialista_id") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."historial_tareas"
    ADD CONSTRAINT "historial_tareas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historial_tareas"
    ADD CONSTRAINT "historial_tareas_realizado_por_fkey" FOREIGN KEY ("realizado_por") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."historial_tareas"
    ADD CONSTRAINT "historial_tareas_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "public"."tareas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hitos"
    ADD CONSTRAINT "hitos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."impulsos"
    ADD CONSTRAINT "impulsos_angel_id_fkey" FOREIGN KEY ("angel_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."impulsos"
    ADD CONSTRAINT "impulsos_hito_id_fkey" FOREIGN KEY ("hito_id") REFERENCES "public"."hitos"("id");



ALTER TABLE ONLY "public"."impulsos"
    ADD CONSTRAINT "impulsos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."postulaciones"
    ADD CONSTRAINT "postulaciones_postulante_id_fkey" FOREIGN KEY ("postulante_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."postulaciones"
    ADD CONSTRAINT "postulaciones_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyectos"
    ADD CONSTRAINT "proyectos_fundador_id_fkey" FOREIGN KEY ("fundador_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tareas"
    ADD CONSTRAINT "tareas_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."tareas"
    ADD CONSTRAINT "tareas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."tareas"
    ADD CONSTRAINT "tareas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tareas"
    ADD CONSTRAINT "tareas_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "public"."perfiles"("id");



CREATE POLICY "Miembros pueden actualizar tareas" ON "public"."tareas" FOR UPDATE USING (true);



CREATE POLICY "Miembros pueden crear mensajes" ON "public"."mensajes" FOR INSERT WITH CHECK (("auth"."uid"() = "autor_id"));



CREATE POLICY "Miembros pueden crear tareas" ON "public"."tareas" FOR INSERT WITH CHECK (true);



CREATE POLICY "Miembros pueden leer mensajes" ON "public"."mensajes" FOR SELECT USING (true);



CREATE POLICY "Miembros pueden leer tareas" ON "public"."tareas" FOR SELECT USING (true);



CREATE POLICY "Todos pueden insertar historial" ON "public"."historial_tareas" FOR INSERT WITH CHECK (true);



CREATE POLICY "Todos pueden leer historial" ON "public"."historial_tareas" FOR SELECT USING (true);



ALTER TABLE "public"."aportes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "aportes_propios" ON "public"."aportes" USING (("auth"."uid"() = "aportante_id"));



ALTER TABLE "public"."contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."historial_tareas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hitos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hitos_publicos" ON "public"."hitos" FOR SELECT USING (true);



ALTER TABLE "public"."impulsos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mensajes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "perfil_propio" ON "public"."perfiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."perfiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "perfiles_publicos" ON "public"."perfiles" FOR SELECT USING (true);



ALTER TABLE "public"."postulaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proyecto_propio" ON "public"."proyectos" USING (("auth"."uid"() = "fundador_id"));



ALTER TABLE "public"."proyectos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proyectos_publicos" ON "public"."proyectos" FOR SELECT USING (("estado" <> 'borrador'::"text"));



ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_publicos" ON "public"."roles" FOR SELECT USING (true);



ALTER TABLE "public"."tareas" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mensajes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tareas";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."calcular_escala_score"("perfil_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_escala_score"("perfil_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_escala_score"("perfil_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."aportes" TO "anon";
GRANT ALL ON TABLE "public"."aportes" TO "authenticated";
GRANT ALL ON TABLE "public"."aportes" TO "service_role";



GRANT ALL ON TABLE "public"."categorias" TO "anon";
GRANT ALL ON TABLE "public"."categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias" TO "service_role";



GRANT ALL ON TABLE "public"."contratos" TO "anon";
GRANT ALL ON TABLE "public"."contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."contratos" TO "service_role";



GRANT ALL ON TABLE "public"."especialidades" TO "anon";
GRANT ALL ON TABLE "public"."especialidades" TO "authenticated";
GRANT ALL ON TABLE "public"."especialidades" TO "service_role";



GRANT ALL ON TABLE "public"."historial_tareas" TO "anon";
GRANT ALL ON TABLE "public"."historial_tareas" TO "authenticated";
GRANT ALL ON TABLE "public"."historial_tareas" TO "service_role";



GRANT ALL ON TABLE "public"."hitos" TO "anon";
GRANT ALL ON TABLE "public"."hitos" TO "authenticated";
GRANT ALL ON TABLE "public"."hitos" TO "service_role";



GRANT ALL ON TABLE "public"."impulsos" TO "anon";
GRANT ALL ON TABLE "public"."impulsos" TO "authenticated";
GRANT ALL ON TABLE "public"."impulsos" TO "service_role";



GRANT ALL ON TABLE "public"."industrias" TO "anon";
GRANT ALL ON TABLE "public"."industrias" TO "authenticated";
GRANT ALL ON TABLE "public"."industrias" TO "service_role";



GRANT ALL ON TABLE "public"."mensajes" TO "anon";
GRANT ALL ON TABLE "public"."mensajes" TO "authenticated";
GRANT ALL ON TABLE "public"."mensajes" TO "service_role";



GRANT ALL ON TABLE "public"."paises_regulatorios" TO "anon";
GRANT ALL ON TABLE "public"."paises_regulatorios" TO "authenticated";
GRANT ALL ON TABLE "public"."paises_regulatorios" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";



GRANT ALL ON TABLE "public"."postulaciones" TO "anon";
GRANT ALL ON TABLE "public"."postulaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."postulaciones" TO "service_role";



GRANT ALL ON TABLE "public"."proyectos" TO "anon";
GRANT ALL ON TABLE "public"."proyectos" TO "authenticated";
GRANT ALL ON TABLE "public"."proyectos" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."tareas" TO "anon";
GRANT ALL ON TABLE "public"."tareas" TO "authenticated";
GRANT ALL ON TABLE "public"."tareas" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


