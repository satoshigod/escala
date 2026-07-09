-- Fase 2 del flujo de verificación de tareas:
-- 1) Los mensajes de chat pueden asociarse a una tarea puntual (hilo específico)
--    y llevar archivos adjuntos.
-- 2) Los documentos compartidos en esos hilos quedan también guardados de forma
--    segmentada (por categoría) en la "Documentación" del proyecto, no solo
--    viviendo sueltos en el chat.

-- ── Mensajes: hilo por tarea + adjuntos + distinguir mensajes automáticos ──
ALTER TABLE mensajes
  ADD COLUMN IF NOT EXISTS tarea_id uuid REFERENCES tareas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS adjuntos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS es_sistema boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_mensajes_tarea_id ON mensajes(tarea_id) WHERE tarea_id IS NOT NULL;

-- ── Documentación del proyecto, segmentada por categoría ──
CREATE TABLE IF NOT EXISTS documentos_proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tarea_id uuid REFERENCES tareas(id) ON DELETE SET NULL,
  mensaje_id uuid REFERENCES mensajes(id) ON DELETE SET NULL,
  categoria text NOT NULL DEFAULT 'General',
  nombre text NOT NULL,
  url text NOT NULL,
  tipo text,
  tamano_mb numeric,
  subido_por uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_id ON documentos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos_proyecto(proyecto_id, categoria);

ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documentos_proyecto_lectura" ON documentos_proyecto FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "documentos_proyecto_insercion" ON documentos_proyecto FOR INSERT WITH CHECK (true);
