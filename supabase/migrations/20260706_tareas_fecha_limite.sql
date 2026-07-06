-- Agrega fecha_limite a tareas si no existe ya
-- (el calendario la usaba, puede que exista en producción sin migración registrada)

ALTER TABLE tareas
  ADD COLUMN IF NOT EXISTS fecha_limite date;

COMMENT ON COLUMN tareas.fecha_limite IS 'Fecha límite opcional para completar la tarea. Usada por el calendario y el cron de notificaciones.';
