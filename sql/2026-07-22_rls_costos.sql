-- =============================================================================
-- RLS en costos_predefinidos y costos_proyecto
-- Eran las 2 unicas tablas de 42 sin RLS: cualquiera con la anon key (publica,
-- va en el frontend) podia leer Y MODIFICAR sus filas.
--
-- Que es cada una:
--   costos_predefinidos = catalogo de Escala (Constitucion SAS, Camara de
--     Comercio, DIAN/RUT...) por pais. Mismo para todos, sin datos privados.
--     -> lectura publica, escritura solo por la API (service role).
--   costos_proyecto = esos costos ya copiados dentro de un proyecto, con su
--     estado y quien los creo. Privados de cada proyecto.
--     -> solo el fundador o alguien con postulacion aceptada en ese proyecto.
--
-- No rompe la app: todo el acceso pasa por /api/costos con service role, que
-- ignora RLS.
-- Aplicada via conector (migracion: rls_costos_predefinidos_y_proyecto).
-- =============================================================================

ALTER TABLE costos_predefinidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS costos_predefinidos_lectura_publica ON costos_predefinidos;
CREATE POLICY costos_predefinidos_lectura_publica ON costos_predefinidos
  FOR SELECT USING (true);

ALTER TABLE costos_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS costos_proyecto_lectura_equipo ON costos_proyecto;
CREATE POLICY costos_proyecto_lectura_equipo ON costos_proyecto
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM proyectos p
            WHERE p.id = costos_proyecto.proyecto_id AND p.fundador_id = auth.uid())
    OR EXISTS (SELECT 1 FROM postulaciones po
               JOIN roles r ON r.id = po.rol_id
               WHERE r.proyecto_id = costos_proyecto.proyecto_id
                 AND po.postulante_id = auth.uid() AND po.estado = 'aceptada')
  );
