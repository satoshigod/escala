-- Trigger para notificar mensajes nuevos en el chat del proyecto
-- Usa pg_net para hacer una llamada HTTP a la API de Next.js
-- sin necesitar Edge Functions de Supabase.
--
-- Requiere que pg_net esté habilitado en el proyecto Supabase
-- (viene habilitado por defecto en proyectos nuevos).

-- 1. Crear la función que dispara la notificación
CREATE OR REPLACE FUNCTION notificar_mensaje_nuevo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text := 'https://escala.network/api/notificaciones/mensaje';
BEGIN
  -- Llamar a la API de Next.js de forma asíncrona (no bloquea el INSERT)
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-supabase-trigger', current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'mensaje_id', NEW.id,
      'proyecto_id', NEW.proyecto_id,
      'autor_id', NEW.autor_id,
      'contenido', substring(NEW.contenido, 1, 100),
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca fallar el INSERT aunque la notificación falle
  RETURN NEW;
END;
$$;

-- 2. Crear el trigger sobre la tabla mensajes
DROP TRIGGER IF EXISTS trigger_mensaje_nuevo ON mensajes;
CREATE TRIGGER trigger_mensaje_nuevo
  AFTER INSERT ON mensajes
  FOR EACH ROW
  EXECUTE FUNCTION notificar_mensaje_nuevo();

COMMENT ON FUNCTION notificar_mensaje_nuevo() IS 
  'Dispara una notificación HTTP a /api/notificaciones/mensaje cuando se crea un mensaje nuevo en el chat. 
   Usa pg_net para llamadas asíncronas. Si falla, el INSERT continúa normalmente.';
