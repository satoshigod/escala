-- FIX: Duplicados de tareas de constitución (bug de inicializar_constitucion)
--
-- Causa: cuando un especialista (contador/abogado) entraba por primera vez a
-- /workspace/tareas y el proyecto ya tenía tareas regulatorias del país cargadas
-- SIN asignar (vía inicializar_pais), el endpoint inicializar_constitucion solo
-- revisaba si YA HABÍA tareas asignadas a ese usuario — no si esas tareas ya
-- existían sin asignar en el proyecto — y creaba una segunda copia completa,
-- asignada a él. Resultado: dos filas para la misma tarea (una sin asignar y
-- pendiente, otra asignada y con progreso real), que además se mostraban en dos
-- "segmentos" distintos en la UI ("Constitución de empresas" vs "Colombia") por
-- un bug de etiquetado ya corregido en el frontend (getSegmento).
--
-- Este script borra la copia huérfana (sin asignar, sin tocar) cuando existe una
-- copia gemela (mismo proyecto + mismo rol + mismo nombre) que sí está asignada.
-- No borra nada si ambas copias están asignadas o si ambas están sin asignar.

BEGIN;

-- Vista previa de lo que se va a borrar (opcional, solo para revisar antes de correr el DELETE de abajo)
-- SELECT t1.id, t1.proyecto_id, t1.rol_nombre, t1.nombre, t1.estado, t1.razon_creacion
-- FROM tareas t1
-- JOIN tareas t2
--   ON t1.proyecto_id = t2.proyecto_id
--  AND t1.rol_nombre = t2.rol_nombre
--  AND t1.nombre = t2.nombre
--  AND t1.id <> t2.id
-- WHERE t1.asignado_a IS NULL
--   AND t1.estado = 'pendiente'
--   AND t2.asignado_a IS NOT NULL;

DELETE FROM tareas t1
USING tareas t2
WHERE t1.proyecto_id = t2.proyecto_id
  AND t1.rol_nombre = t2.rol_nombre
  AND t1.nombre = t2.nombre
  AND t1.id <> t2.id
  AND t1.asignado_a IS NULL
  AND t1.estado = 'pendiente'
  AND t2.asignado_a IS NOT NULL;

COMMIT;
