-- Tablas creadas manualmente en Supabase durante la sesión del 07 Jul 2026
-- Documentadas aquí para mantener el historial de migraciones completo

-- Calificaciones entre colaboradores de un proyecto
CREATE TABLE IF NOT EXISTS calificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  de_usuario_id uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  a_usuario_id uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  rol text,
  estrellas int NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario text,
  tipo text NOT NULL CHECK (tipo IN ('fundador_a_especialista','especialista_a_fundador')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proyecto_id, de_usuario_id, a_usuario_id)
);

-- Logros y badges automáticos por actividad en la plataforma
CREATE TABLE IF NOT EXISTS logros_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, tipo)
);

-- Columnas de preferencias de notificación por categoría
ALTER TABLE preferencias_notificacion
  ADD COLUMN IF NOT EXISTS categorias_email_desactivadas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categorias_push_desactivadas text[] DEFAULT '{}';
