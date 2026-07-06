-- Tabla de auditoría de publicaciones en redes sociales
-- Registra cada intento de publicación: texto, imágenes, IDs de posts, estado y errores

CREATE TABLE IF NOT EXISTS publicaciones_redes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación del evento
  tipo_evento           text NOT NULL,           -- 'proyecto_publicado', 'empresa_creada', etc.
  entidad_id            uuid,                    -- ID del proyecto/empresa/perfil que disparó el evento
  datos_evento          jsonb,                   -- datos completos del evento para reintento
  
  -- Contenido generado
  texto_facebook        text,
  texto_instagram       text,
  imagen_facebook_url   text,
  imagen_instagram_url  text,
  
  -- Resultado Facebook
  facebook_post_id      text,
  facebook_post_url     text,
  
  -- Resultado Instagram
  instagram_post_id     text,
  
  -- Estado del flujo
  estado                text NOT NULL DEFAULT 'procesando'
    CHECK (estado IN (
      'procesando',
      'pendiente_aprobacion',
      'publicado',
      'publicado_parcial',
      'error',
      'cancelado'
    )),
  
  intentos              int NOT NULL DEFAULT 0,
  errores               text[],
  
  -- Timestamps
  creado_en             timestamptz NOT NULL DEFAULT now(),
  publicado_en          timestamptz,
  actualizado_en        timestamptz NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pub_redes_tipo_evento    ON publicaciones_redes (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_pub_redes_entidad_id     ON publicaciones_redes (entidad_id);
CREATE INDEX IF NOT EXISTS idx_pub_redes_estado         ON publicaciones_redes (estado);
CREATE INDEX IF NOT EXISTS idx_pub_redes_creado_en      ON publicaciones_redes (creado_en DESC);

-- Trigger para actualizar `actualizado_en` automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp_redes()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_actualizar_redes
  BEFORE UPDATE ON publicaciones_redes
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_redes();

-- RLS: solo el service role puede leer/escribir esta tabla
ALTER TABLE publicaciones_redes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo service role"
  ON publicaciones_redes
  FOR ALL
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE publicaciones_redes IS 
  'Auditoría completa de publicaciones automáticas en Facebook e Instagram. 
   Un registro por intento de publicación. Permite reintento, aprobación manual 
   y trazabilidad de errores.';
